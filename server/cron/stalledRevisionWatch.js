// Bookings that stall in REVISION_REQUESTED.
//
// The one state nothing could rescue. The auto-release cron only looks at
// WORK_SUBMITTED, so once a client sends work back the order leaves its reach
// entirely — and if the seller never resubmits, it sits in REVISION_REQUESTED
// with the client's money held, forever. No timer, no admin button, nothing.
//
// With Razorpay's 90-day hold ceiling that isn't merely untidy: the escrow
// eventually lapses with nobody having decided anything, and the money has to
// be reconciled by hand.
//
// Two stages, on purpose:
//
//   Day 7   — warn. A substantial revision legitimately takes time, and
//             auto-deciding against a seller who is mid-work would be worse
//             than the problem.
//   Day 14  — move to DISPUTED, which puts it in the admin arbitration queue.
//
// The second stage deliberately does NOT move money. Auto-refunding would rule
// against a seller who may have done most of the work; auto-releasing would
// rule against a client who never got it. It escalates to a human instead —
// which is exactly what DISPUTED already means everywhere else in the system,
// so the existing dispute UI and admin queue pick it up with no special casing.

const cron = require("node-cron");
const ServiceOrder = require("../models/ServiceOrder");
const HireDeal = require("../models/HireDeal");
// Required for its side effect: both queries below populate buyer/seller, and
// mongoose throws MissingSchemaError if nothing has registered "User" yet.
// Relying on index.js having loaded it first would make this order-dependent.
require("../models/User");
const EscrowDispute = require("../models/EscrowDispute");
const Notification = require("../models/Notification");
const { notifyAdmins } = require("../utils/notifyAdmins");

const WARN_AFTER_DAYS = Number(process.env.REVISION_STALL_WARN_DAYS || 7);
const ESCALATE_AFTER_DAYS = Number(process.env.REVISION_STALL_ESCALATE_DAYS || 14);

const KINDS = [
  {
    model: ServiceOrder,
    orderKind: "service",
    idField: "serviceOrderId",
    buyerField: "buyerId",
    sellerField: "sellerId",
    titleField: "serviceTitle",
    sellerAmountField: "sellerAmount",
  },
  {
    model: HireDeal,
    orderKind: "hire",
    idField: "hireDealId",
    buyerField: "clientId",
    sellerField: "freelancerId",
    titleField: "title",
    sellerAmountField: "freelancerAmount",
  },
];

/** When the clock started: the most recent revision request on this order. */
function lastRevisionAt(doc) {
  const revisions = doc.revisions || [];
  const last = revisions[revisions.length - 1];
  return last?.requestedAt ? new Date(last.requestedAt) : new Date(doc.updatedAt || doc.createdAt);
}

async function warnStalled(kind, cutoff) {
  const candidates = await kind.model
    .find({
      status: "REVISION_REQUESTED",
      fundsStatus: "HELD_BY_TOKUN",
      // Once only — repeating this daily would train both sides to ignore
      // exactly the notification that matters.
      revisionStallWarnedAt: null,
    })
    .populate(kind.buyerField, "name email")
    .populate(kind.sellerField, "name email")
    .limit(200);

  let warned = 0;
  for (const doc of candidates) {
    if (lastRevisionAt(doc) > cutoff) continue;

    // Same guard as escalation — there is nobody to notify on an order whose
    // parties have been deleted.
    if (!doc[kind.buyerField]?._id || !doc[kind.sellerField]?._id) continue;

    const title = doc[kind.titleField] || "your booking";
    try {
      await Promise.all([
        Notification.create({
          senderName: "Tokun",
          receiverUserId: doc[kind.sellerField]?._id,
          type: "REVISION_STALLED",
          message: `The revision on "${title}" has been open for ${WARN_AFTER_DAYS} days. Resubmit the work, or the booking will be referred to our team in another ${ESCALATE_AFTER_DAYS - WARN_AFTER_DAYS} days.`,
          meta: { orderKind: kind.orderKind, orderId: String(doc._id) },
        }),
        Notification.create({
          senderName: "Tokun",
          receiverUserId: doc[kind.buyerField]?._id,
          type: "REVISION_STALLED",
          message: `The creator hasn't resubmitted "${title}" for ${WARN_AFTER_DAYS} days. We've nudged them — if there's still no response, our team will step in and decide how the payment is settled.`,
          meta: { orderKind: kind.orderKind, orderId: String(doc._id) },
        }),
      ]);

      await kind.model.updateOne({ _id: doc._id }, { $set: { revisionStallWarnedAt: new Date() } });
      warned += 1;
    } catch (err) {
      console.error(`[RevisionStall] warn failed for ${kind.orderKind} ${doc._id}:`, err.message);
    }
  }
  return warned;
}

async function escalateStalled(kind, cutoff) {
  const candidates = await kind.model
    .find({ status: "REVISION_REQUESTED", fundsStatus: "HELD_BY_TOKUN" })
    .populate(kind.buyerField, "name email")
    .populate(kind.sellerField, "name email")
    .limit(200);

  let escalated = 0;
  for (const doc of candidates) {
    if (lastRevisionAt(doc) > cutoff) continue;

    /* Both parties have to resolve. Old test data carries refs to users that
       no longer exist, and populate leaves those null — a dispute can't be
       raised between two people who aren't there, and there's nobody to
       notify. Skipped with one clear line rather than throwing a validation
       error into the log on every run, forever. */
    const buyer = doc[kind.buyerField];
    const seller = doc[kind.sellerField];
    if (!buyer?._id || !seller?._id) {
      console.warn(
        `[RevisionStall] Skipping ${kind.orderKind} ${doc._id} — buyer or seller no longer exists. Needs manual cleanup.`
      );
      continue;
    }

    const title = doc[kind.titleField] || "the booking";
    try {
      // Reuses the ordinary dispute record, so this lands in the same admin
      // queue as a contested cancellation with no special handling.
      const existing = await EscrowDispute.findOne({
        [kind.idField]: doc._id,
        status: { $in: ["OPEN", "PROPOSED", "ADMIN_REVIEW"] },
      });

      if (!existing) {
        await EscrowDispute.create({
          orderKind: kind.orderKind,
          [kind.idField]: doc._id,
          buyerId: doc[kind.buyerField]?._id,
          sellerId: doc[kind.sellerField]?._id,
          title,
          totalPayable: Number(doc.totalPayable || doc.amount || 0),
          sellerAmount: Number(doc[kind.sellerAmountField] || 0),
          raisedBy: "admin",
          reason: `Automatically referred: the requested revision went unanswered for ${ESCALATE_AFTER_DAYS} days.`,
          // Straight to arbitration — there's nothing for the two of them to
          // negotiate when one side has stopped responding.
          status: "ADMIN_REVIEW",
        });
      }

      await kind.model.updateOne(
        { _id: doc._id },
        { $set: { status: "DISPUTED", cancelledBy: "admin" } }
      );

      await Promise.all([
        Notification.create({
          senderName: "Tokun",
          receiverUserId: doc[kind.sellerField]?._id,
          type: "ESCROW_DISPUTE_ESCALATED",
          message: `"${title}" has been referred to our team — the revision went unanswered for ${ESCALATE_AFTER_DAYS} days. Reply with what you completed if you want it considered.`,
          meta: { orderKind: kind.orderKind, orderId: String(doc._id) },
        }),
        Notification.create({
          senderName: "Tokun",
          receiverUserId: doc[kind.buyerField]?._id,
          type: "ESCROW_DISPUTE_ESCALATED",
          message: `"${title}" has been referred to our team. We'll review what was delivered and decide how your payment is settled.`,
          meta: { orderKind: kind.orderKind, orderId: String(doc._id) },
        }),
      ]);

      /* And the admins, who are the ones who now have to do something about it.
         Both parties were told to wait for a ruling; nobody was telling the
         people who make it. */
      try {
        await notifyAdmins({
          type: "ESCROW_DISPUTE_ADMIN_REVIEW",
          message: `"${title}" was referred automatically — the revision went unanswered for ${ESCALATE_AFTER_DAYS} days. ₹${Number(doc.totalPayable || doc.amount || 0)} is held and needs a ruling.`,
          meta: { orderKind: kind.orderKind, orderId: String(doc._id) },
        });
      } catch (notifyErr) {
        console.error("[RevisionStall] notifyAdmins failed:", notifyErr.message);
      }

      escalated += 1;
      console.warn(
        `[RevisionStall] Escalated ${kind.orderKind} ${doc._id} — revision unanswered for ${ESCALATE_AFTER_DAYS}+ days.`
      );
    } catch (err) {
      console.error(`[RevisionStall] escalate failed for ${kind.orderKind} ${doc._id}:`, err.message);
    }
  }
  return escalated;
}

async function run() {
  const now = Date.now();
  const warnCutoff = new Date(now - WARN_AFTER_DAYS * 86400000);
  const escalateCutoff = new Date(now - ESCALATE_AFTER_DAYS * 86400000);

  let warned = 0;
  let escalated = 0;

  for (const kind of KINDS) {
    // Escalation first: an order past the escalation line shouldn't get a
    // "we've nudged them" warning on the same run it gets referred.
    escalated += await escalateStalled(kind, escalateCutoff);
    warned += await warnStalled(kind, warnCutoff);
  }

  if (warned || escalated) {
    console.log(`[RevisionStall] warned ${warned}, escalated ${escalated}.`);
  }
}

// Daily, at 08:00 — a deadline measured in days doesn't need hourly attention,
// and the notification lands at the start of a working day.
cron.schedule("0 8 * * *", async () => {
  try {
    await run();
  } catch (err) {
    console.error("[RevisionStall] Cron job error:", err);
  }
});

module.exports = { run, warnStalled, escalateStalled, WARN_AFTER_DAYS, ESCALATE_AFTER_DAYS };
