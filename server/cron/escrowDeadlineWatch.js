// Watches escrow that is running out of time.
//
// Razorpay holds a Route transfer for at most 90 days from the payment. That
// deadline is not ours to move: once it passes, the hold we've been promising
// both parties simply isn't there any more. Every booking therefore has to
// reach a decision — released, refunded, or split — before it.
//
// The auto-release cron already closes the ordinary case (client goes quiet
// after a delivery, 72 hours, money moves). What it can't close is a booking
// that is legitimately still open as the deadline approaches:
//
//   • a long project still IN_PROGRESS on day 85
//   • a revision the seller never resubmitted
//   • a dispute nobody has arbitrated
//
// Those need a human, and a human needs warning. This job gives one — a week
// out, once, to both parties and to the admin queue.
//
// It deliberately does NOT move money on its own. Auto-releasing a disputed
// booking to beat a clock would hand the money to whichever side happened to
// be holding it, and auto-refunding would do the same in reverse. The decision
// stays with the people whose money it is.

const cron = require("node-cron");
const ServiceOrder = require("../models/ServiceOrder");
const HireDeal = require("../models/HireDeal");
const Notification = require("../models/Notification");
const { ESCROW_WARNING_DAYS, RAZORPAY_MAX_HOLD_DAYS, daysUntil } = require("../utils/escrowWindow");

// Statuses where the money is still held and still undecided. COMPLETED,
// REFUNDED, SETTLED and CANCELLED are all finished — nothing to warn about.
const UNRESOLVED_STATUSES = [
  "FUNDED",
  "IN_PROGRESS",
  "WORK_SUBMITTED",
  "REVISION_REQUESTED",
  "DISPUTED",
];

const KINDS = [
  {
    model: ServiceOrder,
    label: "service booking",
    buyerField: "buyerId",
    sellerField: "sellerId",
    titleField: "serviceTitle",
  },
  {
    model: HireDeal,
    label: "project",
    buyerField: "clientId",
    sellerField: "freelancerId",
    titleField: "title",
  },
];

function warningMessage(title, days, isSeller) {
  const when = days <= 0 ? "today" : `in ${days} day${days === 1 ? "" : "s"}`;
  return isSeller
    ? `The payment held for "${title}" must be settled ${when} — after that our payments partner stops holding it. Finish and submit the work, or contact support so it can be resolved.`
    : `The payment you made for "${title}" must be settled ${when} — after that our payments partner stops holding it. Approve the work, or contact support so it can be resolved.`;
}

async function warnExpiringEscrow() {
  const cutoff = new Date(Date.now() + ESCROW_WARNING_DAYS * 24 * 60 * 60 * 1000);
  let warned = 0;

  for (const kind of KINDS) {
    const atRisk = await kind.model
      .find({
        fundsStatus: "HELD_BY_TOKUN",
        status: { $in: UNRESOLVED_STATUSES },
        escrowExpiresAt: { $ne: null, $lte: cutoff },
        // Once only. Repeating it daily for a week would train both parties to
        // ignore exactly the notification that matters most.
        escrowWarningSentAt: null,
      })
      .populate(kind.buyerField, "name email")
      .populate(kind.sellerField, "name email")
      .limit(200);

    for (const doc of atRisk) {
      const title = doc[kind.titleField] || kind.label;
      const days = Math.max(0, daysUntil(doc.escrowExpiresAt) ?? 0);

      try {
        await Promise.all([
          Notification.create({
            senderName: "Tokun",
            receiverUserId: doc[kind.buyerField]?._id,
            type: "ESCROW_DEADLINE_APPROACHING",
            message: warningMessage(title, days, false),
            meta: { orderKind: kind.model === ServiceOrder ? "service" : "hire", orderId: String(doc._id), days },
          }),
          Notification.create({
            senderName: "Tokun",
            receiverUserId: doc[kind.sellerField]?._id,
            type: "ESCROW_DEADLINE_APPROACHING",
            message: warningMessage(title, days, true),
            meta: { orderKind: kind.model === ServiceOrder ? "service" : "hire", orderId: String(doc._id), days },
          }),
        ]);

        await kind.model.updateOne({ _id: doc._id }, { $set: { escrowWarningSentAt: new Date() } });
        warned += 1;

        console.warn(
          `[EscrowDeadline] ${kind.label} ${doc._id} ("${title}") expires in ${days}d — status ${doc.status}. Both parties notified.`
        );
      } catch (err) {
        console.error(`[EscrowDeadline] Failed to warn on ${kind.label} ${doc._id}:`, err.message);
      }
    }
  }

  return warned;
}

/**
 * Anything already past the deadline. Logged loudly every run rather than
 * warned once, because at this point the hold is gone and the money needs
 * manual reconciliation with Razorpay — it should stay noisy until someone
 * clears it.
 */
async function reportLapsedEscrow() {
  const now = new Date();

  for (const kind of KINDS) {
    const lapsed = await kind.model
      .find({
        fundsStatus: "HELD_BY_TOKUN",
        status: { $in: UNRESOLVED_STATUSES },
        escrowExpiresAt: { $ne: null, $lt: now },
      })
      .select("_id status escrowExpiresAt routeTransferId")
      .limit(200);

    for (const doc of lapsed) {
      console.error(
        `[EscrowDeadline] ⚠️ LAPSED ${kind.label} ${doc._id} — held past ${RAZORPAY_MAX_HOLD_DAYS} days ` +
          `(expired ${doc.escrowExpiresAt.toISOString()}, status ${doc.status}, transfer ${doc.routeTransferId || "none"}). ` +
          `Needs manual settlement with Razorpay.`
      );
    }
  }
}

// Once a day is enough for a deadline measured in weeks. 07:00 so the warning
// lands at the start of a working day rather than overnight.
cron.schedule("0 7 * * *", async () => {
  try {
    const warned = await warnExpiringEscrow();
    if (warned) console.log(`[EscrowDeadline] Warned on ${warned} booking(s) nearing the hold limit.`);
    await reportLapsedEscrow();
  } catch (err) {
    console.error("[EscrowDeadline] Cron job error:", err);
  }
});

module.exports = { warnExpiringEscrow, reportLapsedEscrow };
