/**
 * Writes to the audit trail. See models/AdminActivity.js for why it exists.
 *
 * ── Never throws ────────────────────────────────────────────────────────────
 *
 * Every call site is inside a money path — escrow release, dispute settlement,
 * refund approval. If writing the audit row could throw, a failed write would
 * roll back a payout that already happened at Razorpay, which is far worse than
 * a missing row. So the write is best-effort and swallows its own errors.
 *
 * That trade has a cost, and it used to be unpaid: the failure went to
 * console.error, which on App Service reaches a log stream nobody reads. The
 * audit trail could quietly stop recording and the first anyone would know is
 * opening it during a dispute and finding a gap. The failure is now reported to
 * telemetry as well, which is the whole point of it being best-effort rather
 * than silent.
 *
 * ── Awaiting is optional ────────────────────────────────────────────────────
 *
 * Callers may await this or not. Awaiting keeps the row ordered against the
 * response and is what the code below does at money sites, because a trail that
 * lags the action it records is confusing to read. It cannot fail the caller
 * either way.
 */

const AdminActivity = require("../models/AdminActivity");
const telemetry = require("./telemetry");

/**
 * @param {object}  entry
 * @param {string}  entry.type          one of AdminActivity's enum values
 * @param {string}  entry.title         short, human-readable
 * @param {string} [entry.description]
 * @param {object} [entry.actor]        { id, name, type: "AdminUser"|"User"|"system" }
 * @param {object} [entry.target]       { id, type, name }
 * @param {object} [entry.before]       only the fields that changed
 * @param {object} [entry.after]        the same fields, after
 * @param {string} [entry.reason]       the actor's own stated reason
 * @param {number} [entry.amount]
 * @param {object} [entry.meta]
 */
async function logActivity({
  type = "OTHER",
  title,
  description = "",
  actor = null,
  target = null,
  before = null,
  after = null,
  reason = null,
  amount = null,
  currency = "INR",
  meta = {},

  /* The original flat signature. Three route files already call this with
     actorId/targetId directly (authRoutes, purchaseRoutes, promptRoutes) and
     those calls must keep working unchanged — renaming a logging helper is not
     worth touching working login and purchase paths for. */
  actorId = null,
  actorName = null,
  actorType = null,
  targetId = null,
  targetType = null,
  targetName = null,
} = {}) {
  try {
    await AdminActivity.create({
      type,
      title,
      description,

      actorType: actor?.type ?? actorType,
      actorId: actor?.id ?? actorId,
      actorName: actor?.name ?? actorName,

      targetId: target?.id ?? targetId,
      targetType: target?.type ?? targetType,
      targetName: target?.name ?? targetName,

      before,
      after,
      reason,
      amount: amount === null || amount === undefined ? null : Number(amount),
      currency,
      meta,
    });
  } catch (e) {
    console.error("activityLogger failed:", e?.message || e);

    /* Reported, not swallowed. A gap in the audit trail is only discovered when
       the trail is needed, which is exactly too late — this is what makes the
       gap visible while it is still forming. */
    telemetry.trackError(e, {
      kind: "auditLogFailed",
      auditType: type,
      targetId: String(target?.id ?? targetId ?? ""),
      actorId: String(actor?.id ?? actorId ?? ""),
    });
  }
}

/**
 * Actor from an Express request.
 *
 * requireAuth puts the resolved account on req.user and sets req.isAdmin, so
 * which collection the id belongs to is already known here — the one thing the
 * old schema got wrong by assuming everything was a User.
 */
function actorFromReq(req) {
  if (!req?.user) return { type: "system", id: null, name: "system" };
  return {
    type: req.isAdmin ? "AdminUser" : "User",
    id: req.user._id,
    name: req.user.email || req.user.name || null,
  };
}

/** The cron jobs. No id, and saying so beats leaving the actor null. */
const SYSTEM_ACTOR = { type: "system", id: null, name: "system (cron)" };

module.exports = { logActivity, actorFromReq, SYSTEM_ACTOR };
