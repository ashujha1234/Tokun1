// routes/escrowCancellation.js
//
// Cancelling a funded booking, and the negotiation when cancelling isn't
// clean-cut. Mounted once at /api/escrow and takes the order kind in the path,
// because hire deals and service bookings behave identically here — the money
// engine (escrowSettlement.service) already treats them the same, and forking
// this into two near-identical routers is how the two would drift.
//
// Three situations, three very different answers:
//
//   1. Nobody started yet (status FUNDED)
//      The seller has invested nothing, so there is nothing to argue about.
//      Either side cancels, buyer gets 100% back immediately, no admin.
//
//   2. The SELLER walks away (any time)
//      Their fault, so the buyer gets 100% back immediately regardless of how
//      much work was done — and the seller takes a reputation hit, because a
//      platform where freelancers can abandon paid work for free is a platform
//      clients stop trusting.
//
//   3. The BUYER cancels after work started
//      The seller HAS put time in, so a full refund would be theft of labour
//      and a full release would be theft of money. The order freezes as
//      DISPUTED, the seller states what fraction they completed and attaches
//      proof, and the buyer either accepts (settled instantly, no admin) or
//      rejects (an admin rules on it).
//
// Nothing here releases or refunds directly — every rupee moves through
// settleEscrow(), so the split arithmetic and the atomic claim exist once.

const express = require("express");
const mongoose = require("mongoose");
const EscrowDispute = require("../models/EscrowDispute");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const User = require("../models/User");
const { requireAuth } = require("../utils/auth");
const { notifyAdmins } = require("../utils/notifyAdmins");
const {
  settleEscrow,
  refundEscrowFully,
  previewSettlement,
  getKind,
  EscrowNotSettleableError,
  EscrowSettledButNotRecordedError,
} = require("../services/escrowSettlement.service");

const router = express.Router();

// Work has demonstrably begun past this point, so case 1's "nothing was
// invested" reasoning no longer applies.
const WORK_STARTED_STATUSES = ["IN_PROGRESS", "WORK_SUBMITTED", "REVISION_REQUESTED"];
const CANCELLABLE_STATUSES = ["FUNDED", ...WORK_STARTED_STATUSES];

/* Loads the order and works out which side the caller is on. Everything below
   needs all three, and getting the buyer/seller mapping wrong is the kind of
   bug that refunds the wrong person. */
async function loadOrderContext(req) {
  const { orderKind, orderId } = req.params;

  if (!["hire", "service"].includes(orderKind)) {
    return { error: { code: 400, body: { success: false, error: "invalid_order_kind" } } };
  }
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return { error: { code: 400, body: { success: false, error: "invalid_order_id" } } };
  }

  const kind = getKind(orderKind);
  const order = await kind.model
    .findById(orderId)
    .populate(kind.buyerField, "name email profileImage image avatarUrl")
    .populate(kind.sellerField, "name email profileImage image avatarUrl");

  if (!order) {
    return { error: { code: 404, body: { success: false, error: "order_not_found" } } };
  }

  const buyer = order[kind.buyerField];
  const seller = order[kind.sellerField];
  const userId = String(req.user._id);
  const isBuyer = String(buyer?._id) === userId;
  const isSeller = String(seller?._id) === userId;

  if (!isBuyer && !isSeller) {
    return { error: { code: 403, body: { success: false, error: "not_authorized" } } };
  }

  return { kind, order, buyer, seller, isBuyer, isSeller, orderKind, orderId };
}

function settlementError(err, res) {
  if (err instanceof EscrowNotSettleableError) {
    return res.status(400).json({ success: false, error: err.code, message: err.message });
  }
  /* The money moved and only the bookkeeping failed. Telling someone to "try
     again" here is the worst possible advice — it would issue a second refund
     against the same payment. */
  if (err instanceof EscrowSettledButNotRecordedError) {
    console.error("Escrow settled but not recorded:", err.details, err.message);
    return res.status(500).json({
      success: false,
      error: err.code,
      message: err.message,
      settled: true,
    });
  }
  console.error("Escrow settlement failed:", err);
  // 502, not 500: the failure is almost always Razorpay rejecting the refund or
  // reversal, and the order has been put back to HELD_BY_TOKUN so this is
  // genuinely retryable.
  return res.status(502).json({
    success: false,
    error: "settlement_failed",
    message:
      err?.error?.description ||
      err?.message ||
      "The payment provider rejected this settlement. Nothing was changed — please try again.",
  });
}

/**
 * Evidence descriptors, sanitised. Shared by both sides now that the client can
 * attach files too.
 *
 * Only the fields the schema declares survive, so a caller can't smuggle extra
 * keys in, and `uploadedAt` is stamped here rather than trusted from the body.
 */
function normalizeProofFiles(input) {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 10).map((f) => ({
    url: f.url,
    name: f.name || "Proof of work",
    size: f.size || 0,
    mimeType: f.mimeType || "",
    blobName: f.blobName || "",
    uploadedAt: new Date(),
  }));
}

async function findOpenDispute(orderKind, orderId) {
  return EscrowDispute.findOne({
    [orderKind === "hire" ? "hireDealId" : "serviceOrderId"]: orderId,
    status: { $in: ["OPEN", "PROPOSED", "ADMIN_REVIEW"] },
  });
}

async function postToChat(order, senderId, text) {
  if (!order.chatId) return;
  try {
    await Message.create({
      conversationId: order.chatId,
      sender: senderId,
      text,
      readBy: [senderId],
    });
  } catch (err) {
    console.error("Escrow cancellation chat message failed:", err.message);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/escrow/:orderKind/:orderId/cancel
   Either party asks to cancel a funded booking.
   ══════════════════════════════════════════════════════════════════════════ */
router.post("/:orderKind/:orderId/cancel", requireAuth, async (req, res) => {
  try {
    const ctx = await loadOrderContext(req);
    if (ctx.error) return res.status(ctx.error.code).json(ctx.error.body);

    const { kind, order, buyer, seller, isBuyer, isSeller, orderKind, orderId } = ctx;
    const reason = String(req.body?.reason || "").trim().slice(0, 2000);

    if (order.fundsStatus !== "HELD_BY_TOKUN") {
      return res.status(400).json({
        success: false,
        error: "funds_not_in_escrow",
        message: "This booking's money has already been released or refunded.",
      });
    }
    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: "not_cancellable",
        message: `A booking that is ${order.status} can't be cancelled.`,
      });
    }

    const existing = await findOpenDispute(orderKind, orderId);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "dispute_already_open",
        message: "This booking is already being cancelled — open it to see where it stands.",
        disputeId: existing._id,
      });
    }

    const workStarted = WORK_STARTED_STATUSES.includes(order.status);

    /* ── Cases 1 and 2: settle immediately, 100% back to the buyer ──────────
       Case 1 (work never started) — the seller has lost nothing, so making
       either party wait on an admin would be pure friction.
       Case 2 (seller walks) — their choice, so they carry the cost of it. */
    if (!workStarted || isSeller) {
      let result;
      try {
        result = await refundEscrowFully(orderKind, orderId, {
          reason: reason || (isSeller ? "Cancelled by the creator" : "Cancelled before work started"),
          actor: isBuyer ? "buyer" : "seller",
        });
      } catch (err) {
        return settlementError(err, res);
      }

      await kind.model.updateOne(
        { _id: orderId },
        { $set: { status: "CANCELLED", cancelReason: reason || "" } }
      );

      // A seller who abandons paid work doesn't get to do it for free. The
      // counter is what an admin reviews before suspending, and what the
      // marketplace can surface later.
      if (isSeller && workStarted) {
        try {
          await User.findByIdAndUpdate(seller._id, { $inc: { cancelledAfterPaymentCount: 1 } });
        } catch (penaltyErr) {
          console.error("Seller cancellation penalty increment failed:", penaltyErr.message);
        }
      }

      await Notification.create({
        senderId: req.user._id,
        senderName: isSeller ? seller?.name : buyer?.name,
        receiverUserId: isSeller ? buyer?._id : seller?._id,
        type: isSeller ? "ESCROW_CANCELLED_BY_SELLER" : "ESCROW_CANCELLED_BY_BUYER",
        amount: result.refundAmount,
        message: isSeller
          ? `${seller?.name || "The creator"} cancelled "${order[kind.titleField]}". Your full ₹${result.refundAmount} is being refunded to your original payment method.`
          : `${buyer?.name || "The client"} cancelled "${order[kind.titleField]}" before work started. The full amount has been refunded to them.`,
        meta: { orderKind, orderId: String(orderId), refundAmount: result.refundAmount },
      });

      await postToChat(
        order,
        req.user._id,
        `❌ Booking cancelled${reason ? ` — ${reason}` : ""}. ₹${result.refundAmount} has been refunded to the client. Refunds usually reach the original payment method in 5–7 working days.`
      );

      return res.json({
        success: true,
        outcome: "full_refund",
        message: `Cancelled. ₹${result.refundAmount} is on its way back to the client.`,
        refundAmount: result.refundAmount,
        order: result.order,
      });
    }

    /* ── Case 3: buyer cancels mid-work → freeze and negotiate ────────────── */
    await kind.model.updateOne(
      { _id: orderId },
      { $set: { status: "DISPUTED", cancelledBy: "buyer", cancelReason: reason } }
    );

    const dispute = await EscrowDispute.create({
      orderKind,
      [orderKind === "hire" ? "hireDealId" : "serviceOrderId"]: orderId,
      buyerId: buyer._id,
      sellerId: seller._id,
      title: order[kind.titleField] || "",
      totalPayable: Number(order.totalPayable || 0),
      sellerAmount: Number(order[kind.sellerAmountField] || 0),
      raisedBy: "buyer",
      reason,
      status: "OPEN",
    });

    await Notification.create({
      senderId: req.user._id,
      senderName: buyer?.name,
      receiverUserId: seller._id,
      type: "ESCROW_DISPUTE_OPENED",
      message: `${buyer?.name || "The client"} cancelled "${order[kind.titleField]}" while work was in progress. Tell us how much you completed and attach proof — you'll be paid for that share.`,
      meta: { orderKind, orderId: String(orderId), disputeId: String(dispute._id) },
    });

    await postToChat(
      order,
      req.user._id,
      `⚠️ The client cancelled this booking${reason ? ` — ${reason}` : ""}. Work is paused and the payment is frozen until both sides agree how much was completed.`
    );

    return res.json({
      success: true,
      outcome: "dispute_opened",
      message: "Work is paused. The creator will now state how much they completed.",
      disputeId: dispute._id,
    });
  } catch (err) {
    console.error("escrow cancel error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/escrow/:orderKind/:orderId/dispute
   Where the cancellation stands, with the rupees each percentage would pay.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/:orderKind/:orderId/dispute", requireAuth, async (req, res) => {
  try {
    const ctx = await loadOrderContext(req);
    if (ctx.error) return res.status(ctx.error.code).json(ctx.error.body);

    const { order, orderKind, orderId, isBuyer } = ctx;
    const dispute = await findOpenDispute(orderKind, orderId);

    if (!dispute) {
      return res.json({ success: true, dispute: null });
    }

    // Percentages mean nothing to someone deciding whether to accept; the
    // rupees do. Sent for the proposed split so neither side agrees blind.
    const preview =
      dispute.proposedSellerPercent !== null
        ? previewSettlement(order, orderKind, dispute.proposedSellerPercent)
        : null;

    return res.json({ success: true, dispute, preview, viewerRole: isBuyer ? "buyer" : "seller" });
  } catch (err) {
    console.error("get escrow dispute error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/escrow/:orderKind/:orderId/dispute/propose
   Seller states the share they completed, with proof.
   ══════════════════════════════════════════════════════════════════════════ */
router.post("/:orderKind/:orderId/dispute/propose", requireAuth, async (req, res) => {
  try {
    const ctx = await loadOrderContext(req);
    if (ctx.error) return res.status(ctx.error.code).json(ctx.error.body);

    const { order, buyer, seller, isSeller, orderKind, orderId, kind } = ctx;
    if (!isSeller) {
      return res.status(403).json({
        success: false,
        error: "seller_only",
        message: "Only the creator can state how much of the work was completed.",
      });
    }

    const percent = Number(req.body?.sellerPercent);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      return res.status(400).json({
        success: false,
        error: "invalid_percent",
        message: "Enter how much you completed, as a number between 0 and 100.",
      });
    }

    const dispute = await findOpenDispute(orderKind, orderId);
    if (!dispute) {
      return res.status(404).json({ success: false, error: "no_open_dispute" });
    }
    if (dispute.status === "ADMIN_REVIEW") {
      return res.status(400).json({
        success: false,
        error: "with_admin",
        message: "This is with our team now — you can't change your claim.",
      });
    }

    dispute.proposedSellerPercent = percent;
    dispute.proposalNote = String(req.body?.note || "").trim().slice(0, 2000);
    dispute.proofFiles = normalizeProofFiles(req.body?.proofFiles);
    dispute.proposedAt = new Date();
    dispute.status = "PROPOSED";
    // A re-proposal after a rejection starts the buyer's decision over.
    dispute.buyerResponse = "";
    dispute.buyerResponseNote = "";
    dispute.buyerRespondedAt = null;
    await dispute.save();

    const preview = previewSettlement(order, orderKind, percent);

    await Notification.create({
      senderId: seller._id,
      senderName: seller?.name,
      receiverUserId: buyer._id,
      type: "ESCROW_DISPUTE_PROPOSED",
      amount: preview.refundAmount,
      message: `${seller?.name || "The creator"} says ${percent}% of "${order[kind.titleField]}" was completed. Accepting means they receive ₹${preview.sellerPayout} and ₹${preview.refundAmount} comes back to you.`,
      meta: { orderKind, orderId: String(orderId), disputeId: String(dispute._id), ...preview },
    });

    return res.json({ success: true, dispute, preview });
  } catch (err) {
    console.error("escrow dispute propose error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/escrow/:orderKind/:orderId/dispute/respond
   Buyer accepts the seller's claim (settles now) or rejects it (goes to admin).
   ══════════════════════════════════════════════════════════════════════════ */
router.post("/:orderKind/:orderId/dispute/respond", requireAuth, async (req, res) => {
  try {
    const ctx = await loadOrderContext(req);
    if (ctx.error) return res.status(ctx.error.code).json(ctx.error.body);

    const { order, buyer, seller, isBuyer, orderKind, orderId, kind } = ctx;
    if (!isBuyer) {
      return res.status(403).json({
        success: false,
        error: "buyer_only",
        message: "Only the client can accept or reject this split.",
      });
    }

    const action = String(req.body?.action || "").toLowerCase();
    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ success: false, error: "invalid_action" });
    }

    const dispute = await findOpenDispute(orderKind, orderId);
    if (!dispute) return res.status(404).json({ success: false, error: "no_open_dispute" });
    if (dispute.status !== "PROPOSED") {
      return res.status(400).json({
        success: false,
        error: "nothing_to_respond_to",
        message: "The creator hasn't proposed a split yet.",
      });
    }

    const note = String(req.body?.note || "").trim().slice(0, 2000);

    if (action === "reject") {
      dispute.buyerResponse = "rejected";
      dispute.buyerResponseNote = note;
      /* The client's side of the evidence. This is the moment it matters —
         the case is about to leave the two of them and go to an arbitrator who
         has never seen the work. "The delivered site doesn't load" is worth
         very little as a sentence and a great deal as a screen recording. */
      dispute.buyerProofFiles = normalizeProofFiles(req.body?.proofFiles);
      dispute.buyerRespondedAt = new Date();
      dispute.status = "ADMIN_REVIEW";
      await dispute.save();

      await Notification.create({
        senderId: buyer._id,
        senderName: buyer?.name,
        receiverUserId: seller._id,
        type: "ESCROW_DISPUTE_ESCALATED",
        message: `${buyer?.name || "The client"} didn't agree with your ${dispute.proposedSellerPercent}% claim on "${order[kind.titleField]}". Our team will review the proof and decide.`,
        meta: { orderKind, orderId: String(orderId), disputeId: String(dispute._id) },
      });

      await postToChat(
        order,
        req.user._id,
        `⚖️ The split couldn't be agreed, so Tokun's team will review the work and decide how the payment is divided.`
      );

      /* Tell the admins. This is the moment the case becomes THEIR work — both
         parties have been told to wait for a ruling — and nothing was notifying
         them, so a dispute sat in the queue until somebody happened to open the
         page. Best-effort: the escalation itself has already been saved and a
         notification failure must not undo it. */
      try {
        await notifyAdmins({
          type: "ESCROW_DISPUTE_ADMIN_REVIEW",
          message: `${buyer?.name || "A client"} rejected ${seller?.name || "the creator"}'s ${dispute.proposedSellerPercent}% claim on "${order[kind.titleField]}" (₹${order.totalPayable}). Needs a ruling.`,
          meta: {
            orderKind,
            orderId: String(orderId),
            disputeId: String(dispute._id),
            totalPayable: order.totalPayable,
          },
        });
      } catch (notifyErr) {
        console.error("notifyAdmins failed (dispute escalation):", notifyErr.message);
      }

      return res.json({
        success: true,
        outcome: "escalated",
        message: "Sent to our team. They'll review the proof and decide.",
        dispute,
      });
    }

    // Accepted — settle at exactly the percentage the seller asked for.
    let result;
    try {
      result = await settleEscrow(orderKind, orderId, {
        sellerPercent: dispute.proposedSellerPercent,
        reason: `Cancellation settled by mutual agreement at ${dispute.proposedSellerPercent}%`,
        actor: "buyer",
        // Same rule as an admin ruling: this is a cancelled job, not a
        // delivered one, so Tokun keeps nothing and the full amount the client
        // paid is split between the two of them.
        waiveCommission: true,
      });
    } catch (err) {
      return settlementError(err, res);
    }

    dispute.buyerResponse = "accepted";
    dispute.buyerResponseNote = note;
    dispute.buyerRespondedAt = new Date();
    dispute.status = "RESOLVED";
    dispute.finalSellerPercent = dispute.proposedSellerPercent;
    dispute.finalSellerPayout = result.sellerPayout;
    dispute.finalRefundAmount = result.refundAmount;
    dispute.resolvedVia = "mutual";
    dispute.resolvedAt = new Date();
    if (result.refund?.id) dispute.razorpayRefundId = result.refund.id;
    await dispute.save();

    await Notification.create({
      senderId: buyer._id,
      senderName: buyer?.name,
      receiverUserId: seller._id,
      type: "ESCROW_DISPUTE_RESOLVED",
      amount: result.sellerPayout,
      message: `${buyer?.name || "The client"} accepted your ${dispute.finalSellerPercent}% claim. ₹${result.sellerPayout} is being released to you.`,
      meta: { orderKind, orderId: String(orderId), disputeId: String(dispute._id) },
    });

    await postToChat(
      order,
      req.user._id,
      `🤝 Cancellation settled at ${dispute.finalSellerPercent}%. ₹${result.sellerPayout} goes to the creator and ₹${result.refundAmount} is refunded to the client.`
    );

    return res.json({
      success: true,
      outcome: "settled",
      message: `Settled. ₹${result.sellerPayout} to the creator, ₹${result.refundAmount} back to you.`,
      sellerPayout: result.sellerPayout,
      refundAmount: result.refundAmount,
      dispute,
    });
  } catch (err) {
    console.error("escrow dispute respond error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/escrow/:orderKind/:orderId/dispute/withdraw
   Buyer changes their mind before anything has been settled.
   ══════════════════════════════════════════════════════════════════════════ */
router.post("/:orderKind/:orderId/dispute/withdraw", requireAuth, async (req, res) => {
  try {
    const ctx = await loadOrderContext(req);
    if (ctx.error) return res.status(ctx.error.code).json(ctx.error.body);

    const { order, seller, buyer, isBuyer, orderKind, orderId, kind } = ctx;
    if (!isBuyer) {
      return res.status(403).json({ success: false, error: "buyer_only" });
    }

    const dispute = await findOpenDispute(orderKind, orderId);
    if (!dispute) return res.status(404).json({ success: false, error: "no_open_dispute" });
    if (dispute.status === "ADMIN_REVIEW") {
      return res.status(400).json({
        success: false,
        error: "with_admin",
        message: "This is already with our team — contact support to withdraw it.",
      });
    }

    dispute.status = "WITHDRAWN";
    dispute.resolvedAt = new Date();
    await dispute.save();

    // Back to where it was before the cancellation. WORK_SUBMITTED would
    // restart the auto-release clock from the original submission, which by now
    // may be long past — IN_PROGRESS is the honest state: the work exists but
    // is no longer sitting in review.
    await kind.model.updateOne(
      { _id: orderId },
      { $set: { status: "IN_PROGRESS", cancelledBy: "", cancelReason: "" } }
    );

    await Notification.create({
      senderId: buyer._id,
      senderName: buyer?.name,
      receiverUserId: seller._id,
      type: "ESCROW_DISPUTE_WITHDRAWN",
      message: `${buyer?.name || "The client"} withdrew the cancellation on "${order[kind.titleField]}". Work can continue.`,
      meta: { orderKind, orderId: String(orderId) },
    });

    await postToChat(order, req.user._id, `✅ The cancellation was withdrawn. Work can continue.`);

    return res.json({ success: true, message: "Cancellation withdrawn. Work can continue." });
  } catch (err) {
    console.error("escrow dispute withdraw error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
