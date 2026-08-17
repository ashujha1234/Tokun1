// routes/myOrders.js
//
// Service bookings and hire deals — the work someone is paying for, or being
// paid for. Both sides of it, in one feed.
//
// They were unreachable before this: a service booking took four clicks inside
// Service Bookings, and a hire deal existed only inside the chat thread it was
// created in. A client who had paid had nowhere that listed it, and a freelancer
// had nowhere showing what they'd been hired to do.
//
// PROMPT PURCHASES ARE NOT HERE, on purpose. They used to be, and they were the
// odd one out in every way that matters: a prompt is delivered the instant it is
// paid for, so it has no work state, it could never set `needsAction`, it could
// never contribute to the header's badge, and it needed its own navigation
// because it has no order-detail page. It was history sitting in a queue about
// pending work. Prompts live in My Products (/self-dash?tab=prompts), where the
// bill and the refund flow already are.
//
// So what belongs here is exactly what has STATES: paid → in progress →
// delivered → approved, with a person waiting at each step.
//
// Read-only and deliberately flat: every row is normalised to the same shape so
// the client renders one list, not two.

const express = require("express");
const ServiceOrder = require("../models/ServiceOrder");
const HireDeal = require("../models/HireDeal");
const { requireAuth } = require("../utils/auth");

const router = express.Router();

/* What the badge says, per row. Deliberately phrased for whoever is looking at
   it rather than reusing the raw enum — "Submitted, awaiting your review" and
   "Submitted, awaiting client review" are the same status seen from two sides,
   and showing either party the other's version is how support tickets start. */
const STATUS_LABELS = {
  PENDING_PAYMENT: { buyer: "Payment pending", seller: "Awaiting client payment", tone: "warn" },
  ACCEPTED_WAITING_PAYMENT: { buyer: "Payment pending", seller: "Awaiting client payment", tone: "warn" },
  PENDING_ACCEPTANCE: { buyer: "Awaiting creator", seller: "Needs your response", tone: "warn" },
  FUNDED: { buyer: "Paid — not started", seller: "Paid — start work", tone: "info" },
  IN_PROGRESS: { buyer: "In progress", seller: "In progress", tone: "info" },
  WORK_SUBMITTED: { buyer: "Delivered — review it", seller: "Awaiting client review", tone: "action" },
  REVISION_REQUESTED: { buyer: "Revision requested", seller: "Revision requested", tone: "warn" },
  COMPLETED: { buyer: "Completed", seller: "Completed & paid", tone: "good" },
  DISPUTED: { buyer: "Cancellation in progress", seller: "Cancellation in progress", tone: "warn" },
  SETTLED: { buyer: "Cancelled — partly refunded", seller: "Cancelled — partly paid", tone: "neutral" },
  REFUNDED: { buyer: "Refunded", seller: "Cancelled — refunded", tone: "neutral" },
  CANCELLED: { buyer: "Cancelled", seller: "Cancelled", tone: "neutral" },
  REJECTED: { buyer: "Declined", seller: "Declined", tone: "neutral" },
};

function label(status, side) {
  const entry = STATUS_LABELS[status];
  if (!entry) return { label: status, tone: "neutral" };
  return { label: entry[side], tone: entry.tone };
}

/* Rows the user can act on float to the top of the list — a delivery waiting on
   their review matters more than a booking finished last month. */
const NEEDS_ACTION = {
  buyer: ["WORK_SUBMITTED", "PENDING_PAYMENT", "ACCEPTED_WAITING_PAYMENT", "DISPUTED"],
  seller: ["FUNDED", "REVISION_REQUESTED", "PENDING_ACCEPTANCE", "DISPUTED"],
};

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/my-orders
   ?side=buying|selling|all   (default all)
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const side = ["buying", "selling", "all"].includes(req.query.side) ? req.query.side : "all";
    const wantBuying = side === "buying" || side === "all";
    const wantSelling = side === "selling" || side === "all";

    const [
      servicesBought,
      hiresBought,
      servicesSold,
      hiresSold,
    ] = await Promise.all([
      wantBuying
        ? ServiceOrder.find({ buyerId: userId, paymentStatus: "PAID" })
            .populate("sellerId", "name avatarUrl")
            .sort({ createdAt: -1 })
            .limit(100)
            .lean()
        : [],
      wantBuying
        ? HireDeal.find({ clientId: userId, paymentStatus: "PAID" })
            .populate("freelancerId", "name avatarUrl")
            .sort({ createdAt: -1 })
            .limit(100)
            .lean()
        : [],
      wantSelling
        ? ServiceOrder.find({ sellerId: userId, paymentStatus: "PAID" })
            .populate("buyerId", "name avatarUrl")
            .sort({ createdAt: -1 })
            .limit(100)
            .lean()
        : [],
      wantSelling
        ? HireDeal.find({ freelancerId: userId, paymentStatus: "PAID" })
            .populate("clientId", "name avatarUrl")
            .sort({ createdAt: -1 })
            .limit(100)
            .lean()
        : [],
    ]);

    const rows = [];

    const pushEscrowRow = (doc, opts) => {
      const { kind, side: rowSide, title, counterparty, amount, link } = opts;
      rows.push({
        id: String(doc._id),
        kind,
        side: rowSide,
        title,
        counterpartyName: counterparty?.name || (rowSide === "buying" ? "Creator" : "Client"),
        counterpartyAvatar: counterparty?.avatarUrl || "",
        amount,
        status: doc.status,
        ...label(doc.status, rowSide === "buying" ? "buyer" : "seller"),
        createdAt: doc.paidAt || doc.createdAt,
        // Service bookings carry a delivery deadline; hire deals don't, so this
        // is null for them and the row simply doesn't show a clock.
        deliveryDueAt: doc.deliveryDueAt || null,
        link,
        needsAction: NEEDS_ACTION[rowSide === "buying" ? "buyer" : "seller"].includes(doc.status),
        // Only present once a cancellation actually settled, so the row can say
        // where the money went instead of just "Cancelled".
        settlement:
          doc.settlementSellerPercent !== null && doc.settlementSellerPercent !== undefined
            ? {
                sellerPercent: doc.settlementSellerPercent,
                sellerPayout: doc.settlementSellerPayout,
                refundAmount: doc.refundAmount,
              }
            : null,
      });
    };

    for (const o of servicesBought) {
      pushEscrowRow(o, {
        kind: "service",
        side: "buying",
        title: o.serviceTitle,
        counterparty: o.sellerId,
        amount: Number(o.totalPayable || 0),
        link: o.chatId ? `/chat?conversation=${o.chatId}` : "/chat",
      });
    }
    for (const o of servicesSold) {
      pushEscrowRow(o, {
        kind: "service",
        side: "selling",
        title: o.serviceTitle,
        counterparty: o.buyerId,
        amount: Number(o.sellerAmount || 0),
        link: "/self-dash?tab=serviceBookings",
      });
    }
    for (const d of hiresBought) {
      pushEscrowRow(d, {
        kind: "hire",
        side: "buying",
        title: d.title,
        counterparty: d.freelancerId,
        amount: Number(d.totalPayable || d.amount || 0),
        link: d.chatId ? `/chat?conversation=${d.chatId}` : "/chat",
      });
    }
    for (const d of hiresSold) {
      pushEscrowRow(d, {
        kind: "hire",
        side: "selling",
        title: d.title,
        counterparty: d.clientId,
        amount: Number(d.freelancerAmount || 0),
        link: "/self-dash?tab=requests",
      });
    }

    // Anything waiting on the viewer first, newest first within that.
    rows.sort((a, b) => {
      if (a.needsAction !== b.needsAction) return a.needsAction ? -1 : 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return res.json({
      success: true,
      orders: rows,
      counts: {
        total: rows.length,
        buying: rows.filter((r) => r.side === "buying").length,
        selling: rows.filter((r) => r.side === "selling").length,
        // Drives the dot on the header button.
        needsAction: rows.filter((r) => r.needsAction).length,
      },
    });
  } catch (err) {
    console.error("my-orders error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
