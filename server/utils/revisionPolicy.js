// Turns a service's free-text `revisions` field into a number an order can
// enforce.
//
// The seller picks from a <select> whose values are display strings —
// "1 Revision", "2 Revisions", "3 Revisions", "Unlimited Revisions" — so the
// only place the actual count exists is inside that text. Nothing parsed it,
// which meant /request-revision had no cap: a buyer on a "2 Revisions" service
// could ask for twenty, and the seller's money stayed in escrow the whole time.
//
// The parsed number is snapshotted onto the order at booking time (not read
// live off the service) so a seller editing their listing later can't change
// the terms of a booking that's already been paid for.

// Sellers who never touched the field get one round of changes rather than
// zero — a listing with no stated policy shouldn't be stricter than one that
// says "1 Revision".
const DEFAULT_REVISIONS_ALLOWED = 1;

// Anything above this is treated as unlimited. Guards against a stray "99
// Revisions" being stored as a number the UI then has to render.
const MAX_REVISIONS_ALLOWED = 10;

// Hire deals have no listing to read a revision policy off — the client writes
// a brief and names a budget, there's no "2 Revisions" dropdown. So the number
// is a platform default the proposal can override. Three is the common
// marketplace norm and enough that a genuine round of changes never runs out.
const DEFAULT_HIRE_REVISIONS = Number(process.env.DEFAULT_HIRE_REVISIONS || 3);

/**
 * Normalises whatever a hire proposal supplied into a storable cap.
 * Empty/absent → the platform default. "unlimited" or 0 → null.
 */
function resolveHireRevisionsAllowed(input) {
  if (input === undefined || input === null || input === "") return DEFAULT_HIRE_REVISIONS;
  if (/unlimited/i.test(String(input))) return null;

  const count = Number(String(input).match(/\d+/)?.[0]);
  if (!Number.isFinite(count) || count < 0) return DEFAULT_HIRE_REVISIONS;
  if (count > MAX_REVISIONS_ALLOWED) return null;
  return count;
}

/**
 * @param {string} revisionsText  e.g. "2 Revisions", "Unlimited Revisions"
 * @returns {number|null}  count, or null meaning unlimited
 */
function parseRevisionsAllowed(revisionsText) {
  const text = String(revisionsText || "").trim();
  if (!text) return DEFAULT_REVISIONS_ALLOWED;

  if (/unlimited/i.test(text)) return null;

  const match = text.match(/\d+/);
  if (!match) return DEFAULT_REVISIONS_ALLOWED;

  const count = Number(match[0]);
  if (!Number.isFinite(count) || count < 0) return DEFAULT_REVISIONS_ALLOWED;
  if (count > MAX_REVISIONS_ALLOWED) return null;

  return count;
}

/**
 * Revision accounting for one order, in the one place both the API and the two
 * UIs read it from.
 *
 * @param {{revisionsAllowed?: number|null, revisions?: any[]}} order
 */
function getRevisionState(order) {
  const used = Array.isArray(order?.revisions) ? order.revisions.length : 0;

  // `undefined` means the order predates this field. Those were booked with no
  // cap at all, so honouring the default retroactively would refuse revisions a
  // buyer was effectively promised — they stay unlimited.
  const allowed =
    order?.revisionsAllowed === undefined ? null : order.revisionsAllowed;

  const unlimited = allowed === null;
  const remaining = unlimited ? null : Math.max(0, allowed - used);

  return {
    used,
    allowed,
    unlimited,
    remaining,
    exhausted: !unlimited && used >= allowed,
    // "2 of 3 revisions used" / "Unlimited revisions"
    label: unlimited
      ? "Unlimited revisions"
      : `${used} of ${allowed} revision${allowed === 1 ? "" : "s"} used`,
  };
}

module.exports = {
  parseRevisionsAllowed,
  resolveHireRevisionsAllowed,
  getRevisionState,
  DEFAULT_REVISIONS_ALLOWED,
  DEFAULT_HIRE_REVISIONS,
  MAX_REVISIONS_ALLOWED,
};
