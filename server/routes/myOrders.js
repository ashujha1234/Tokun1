// routes/myOrders.js
//
// One feed of everything a person has bought and sold, so "where is my order?"
// has a single answer.
//
// Before this, the three kinds of transaction lived in three unrelated places:
// prompt purchases under the dashboard's Prompts tab, service bookings four
// clicks deep inside Service Bookings, and hire deals only inside the chat
// thread they were created in. A client who paid for something had no one page
// that could tell them what they'd paid for, and a freelancer had no one page
// showing what they'd been hired for.
//
// Read-only and deliberately flat: every row is normalised to the same shape so
// the client renders one list, not three.

const express = require("express");
const Purchase = require("../models/Purchase");
const Prompt = require("../models/Prompt");
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

    // Purchase carries no seller field — the seller is whoever owns the prompt
    // — so "what did I sell" has to start from this user's own prompts.
    const myPromptIds = wantSelling ? await Prompt.find({ userId }).distinct("_id") : [];

    const [
      promptsBought,
      servicesBought,
      hiresBought,
      promptsSold,
      servicesSold,
      hiresSold,
    ] = await Promise.all([
      wantBuying
        ? Purchase.find({ buyer: userId, paymentStatus: "SUCCESS" })
            .populate("prompt", "title")
            .sort({ createdAt: -1 })
            .limit(100)
            .lean()
        : [],
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
      wantSelling && myPromptIds.length
        ? Purchase.find({ prompt: { $in: myPromptIds }, paymentStatus: "SUCCESS" })
            .populate("prompt", "title")
            .populate("buyer", "name avatarUrl")
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

    // ── Prompts: instant delivery, so there is no work state to report —
    // the only thing that can happen after payment is a refund.
    for (const p of promptsBought) {
      const status = p.refundStatus === "REFUNDED" ? "REFUNDED" : "COMPLETED";
      rows.push({
        id: String(p._id),
        kind: "prompt",
        side: "buying",
        // Snapshot first: it survives the seller deleting the prompt, which is
        // exactly when a buyer most wants to see what they paid for.
        title: p.promptSnapshot?.title || p.prompt?.title || "Prompt",
        counterpartyName: "",
        counterpartyAvatar: "",
        amount: Number(p.pricePaid || 0),
        status,
        ...label(status, "buyer"),
        createdAt: p.createdAt || p.purchasedAt,
        link: "/self-dash?tab=prompts",
        needsAction: false,
      });
    }
    for (const p of promptsSold) {
      const status = p.refundStatus === "REFUNDED" ? "REFUNDED" : "COMPLETED";
      rows.push({
        id: String(p._id),
        kind: "prompt",
        side: "selling",
        title: p.promptSnapshot?.title || p.prompt?.title || "Prompt",
        counterpartyName: p.buyer?.name || "Buyer",
        counterpartyAvatar: p.buyer?.avatarUrl || "",
        // What the seller actually kept, not what the buyer paid.
        amount: +(Number(p.pricePaid || 0) - Number(p.platformCommission || 0)).toFixed(2),
        status,
        ...label(status, "seller"),
        createdAt: p.createdAt || p.purchasedAt,
        link: "/self-dash?tab=prompts",
        needsAction: false,
      });
    }

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
