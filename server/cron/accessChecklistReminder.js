/**
 * Chases the client on a checklist that is holding a creator up.
 *
 * ── The gap this fills ──────────────────────────────────────────────────────
 *
 * A creator raises a structured ask (models/AccessRequest.js), the client never
 * opens it, and until now that was the end of it. Nothing chased, nothing
 * reminded, and the only thing the system did with the wait was record it —
 * `blockedHours` — for a dispute that had not started. The creator's own
 * deadline ran the whole time.
 *
 * So the protection arrived after the argument, if at all. This is the part
 * that stops the delay instead of documenting it.
 *
 * ── Why the cadence is a ladder, not an interval ────────────────────────────
 *
 * Sent at 2, 5 and 10 days of continuous blocking, then weekly. A daily nag on
 * a checklist is how a client learns to filter the sender, and the item they
 * most need to see is the one that arrives after they have stopped reading.
 * Widening gaps keep the last message meaningful.
 *
 * `lastReminderAt` on the checklist is what makes that work across runs, and it
 * is also the duplicate guard: this runs hourly, so without it every run inside
 * a due window would send again.
 *
 * Deliberately does NOT remind on a checklist whose blocking period has ended —
 * `blockedSince` being null is the whole test. A client who has provided
 * everything is not chased, and one who provides something and is asked for
 * something new starts a fresh ladder, which is correct: it is a new wait.
 */

const cron = require("node-cron");
const { watchJob } = require("../utils/jobTelemetry");
const telemetry = require("../utils/telemetry");
const AccessRequest = require("../models/AccessRequest");
const HireDeal = require("../models/HireDeal");
const ServiceOrder = require("../models/ServiceOrder");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendAccessItemsPendingEmail } = require("../services/buyerEmail.service");
const { blockedHoursNow } = require("../utils/deliveryDeadline");

/* Days of continuous blocking at which a reminder is due. Past the last rung,
   one a week for as long as it stays blocked — an engagement stuck for a month
   is a support case, and the emails are the trail that shows it was chased. */
const LADDER_DAYS = [2, 5, 10];
const WEEKLY_AFTER_DAYS = 7;

const ORDER_MODEL = {
  hire: { model: HireDeal, idField: "hireDealId", titleField: "title" },
  service: { model: ServiceOrder, idField: "serviceOrderId", titleField: "serviceTitle" },
};

/* Only while the work is actually owed. A cancelled, delivered or settled
   order has nothing left for the client to unblock, and chasing them for an
   asset on a booking that closed last week reads as a broken system. */
const WORK_OWED = ["IN_PROGRESS", "REVISION_REQUESTED", "FUNDED", "ACCEPTED"];

/** Whether a reminder is due, given how long it has been blocked and the last send. */
function reminderDue(blockedDays, lastReminderAt, now) {
  const rungsPassed = LADDER_DAYS.filter((d) => blockedDays >= d).length;
  if (rungsPassed === 0) return false;
  if (!lastReminderAt) return true;

  const daysSinceLast = (now.getTime() - new Date(lastReminderAt).getTime()) / 864e5;

  /* Past the ladder it is simply "a week since the last one". On the ladder,
     the gap to the next rung is what decides — so a checklist that crossed day
     2 and was reminded does not get another until day 5. */
  if (rungsPassed >= LADDER_DAYS.length) return daysSinceLast >= WEEKLY_AFTER_DAYS;

  const previousRung = LADDER_DAYS[rungsPassed - 1];
  const blockedAtLastSend =
    blockedDays - daysSinceLast;
  return blockedAtLastSend < previousRung;
}

async function run() {
  const now = new Date();

  const blocked = await AccessRequest.find({
    status: "OPEN",
    blockedSince: { $ne: null },
  })
    .limit(500)
    .lean();

  let sent = 0;
  let skipped = 0;

  for (const request of blocked) {
    try {
      const cfg = ORDER_MODEL[request.orderKind];
      if (!cfg) continue;

      const blockedDays = blockedHoursNow(request, now) / 24;
      if (!reminderDue(blockedDays, request.lastReminderAt, now)) {
        skipped++;
        continue;
      }

      const order = await cfg.model.findById(request[cfg.idField]).lean();
      if (!order || !WORK_OWED.includes(order.status)) {
        skipped++;
        continue;
      }

      const items = (request.items || [])
        .filter((i) => i?.required !== false && i?.status === "PENDING")
        .map((i) => i.label)
        .filter(Boolean);
      if (!items.length) {
        // recomputeStatus() should have closed this; nothing to chase either way.
        skipped++;
        continue;
      }

      const [buyer, seller] = await Promise.all([
        User.findById(request.buyerId).select("name email").lean(),
        User.findById(request.sellerId).select("name").lean(),
      ]);
      if (!buyer?.email) {
        skipped++;
        continue;
      }

      await sendAccessItemsPendingEmail({
        to: buyer.email,
        clientName: buyer.name,
        creatorName: seller?.name,
        title: request.orderTitle || order[cfg.titleField],
        items,
        waitingDays: Math.floor(blockedDays),
        extendedDays: Math.floor(blockedDays),
        orderKind: request.orderKind,
        orderId: String(request[cfg.idField]),
      });

      /* In-app as well as email. The two fail differently — a filtered inbox
         and an unopened app — and this is the message where being missed costs
         the creator their deadline. */
      await Notification.create({
        senderName: "Tokun",
        receiverUserId: request.buyerId,
        type: "ACCESS_ITEMS_PENDING",
        message: `${seller?.name || "Your creator"} is still waiting on ${items.length} item${
          items.length === 1 ? "" : "s"
        } for "${request.orderTitle || order[cfg.titleField] || "your order"}". The delivery date extends while they wait.`,
        meta: {
          orderKind: request.orderKind,
          orderId: String(request[cfg.idField]),
          outstanding: items.length,
          /* Same pair routes/accessRequests.js sets. Notifications.tsx renders
             a button for anything carrying actionUrl, with no per-type branch —
             so without these the client reads "your creator is waiting on 3
             things" and is left to find the order themselves. The fragment
             lands on the checklist rather than the top of a long page. */
          actionUrl: `/orders/${request.orderKind}/${request[cfg.idField]}#access-checklist`,
          actionLabel: "Open checklist",
        },
      }).catch((err) => console.error("[AccessReminder] notification failed:", err.message));

      /* Stamped AFTER the send, so a failure retries on the next run rather
         than silently consuming the rung. */
      await AccessRequest.updateOne({ _id: request._id }, { $set: { lastReminderAt: now } });
      sent++;
    } catch (err) {
      console.error(`[AccessReminder] ✗ checklist ${request._id}:`, err.message);
      telemetry.trackError(err, {
        job: "AccessChecklistReminder",
        kind: "reminderFailed",
        requestId: String(request._id),
      });
    }
  }

  return { blocked: blocked.length, sent, skipped };
}

// Hourly, like the other deadline jobs. The ladder decides who actually gets
// mail; this only decides how often the question is asked.
cron.schedule("30 * * * *", async () => {
  const job = watchJob("AccessChecklistReminder");
  try {
    job.ok(await run());
  } catch (err) {
    console.error("[AccessReminder] Cron job error:", err);
    job.failed(err);
  }
});

module.exports = { run, reminderDue };
