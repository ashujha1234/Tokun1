// routes/adminRefunds.js
//
// Admin review queue for buyer-filed prompt-purchase refund requests.
// Three branches on approve, depending on how the seller was paid at
// purchase time and whether the payment covered more than one prompt:
//   - Route transfer, payment covers ONE purchase → refund the buyer with
//     reverse_all:1 so Razorpay reverses the single linked-account transfer as
//     part of the same call.
//   - Route transfer, payment covers SEVERAL purchases (a cart checkout, which
//     carries one transfer per seller) → reverse only this purchase's own
//     transfer, for its own seller share. reverse_all here would claw back
//     money from every other seller on that cart too.
//   - Wallet-ledger fallback (no linked account yet) → the money never left
//     Tokun's main balance, so a plain refund suffices; the seller's
//     internal Wallet credit and Tokun's commission record are reversed
//     separately since those are just DB bookkeeping, not Razorpay state.

const express = require("express");
const router = express.Router();

const Razorpay = require("../utils/razorpay");
const RefundRequest = require("../models/RefundRequest");
const Purchase = require("../models/Purchase");
const Wallet = require("../models/Wallet");
const PlatformWallet = require("../models/PlatformWallet");
const Notification = require("../models/Notification");
const { requireAuth } = require("../utils/auth");
const { reverseTransfer } = require("../utils/routePayouts");

function requireAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ success: false, error: "forbidden" });
  }
  next();
}

router.use(requireAuth, requireAdmin);

// GET /api/admin/refunds?status=PENDING
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const refundRequests = await RefundRequest.find(filter)
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .populate("prompt", "title attachment")
      .populate("purchase", "pricePaid razorpayPaymentId routeTransferId purchasedAt")
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json({ success: true, refundRequests });
  } catch (err) {
    console.error("Admin refund list error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// POST /api/admin/refunds/:id/approve
router.post("/:id/approve", async (req, res) => {
  try {
    const refundRequest = await RefundRequest.findById(req.params.id).populate("purchase");
    if (!refundRequest) {
      return res.status(404).json({ success: false, error: "refund_request_not_found" });
    }
    if (refundRequest.status !== "PENDING") {
      return res.status(400).json({ success: false, error: "already_" + refundRequest.status.toLowerCase() });
    }

    const purchase = refundRequest.purchase;
    if (!purchase) {
      return res.status(400).json({ success: false, error: "purchase_not_found" });
    }
    if (!purchase.razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        error: "no_payment_id_on_purchase",
        message: "This purchase has no Razorpay payment ID on record — cannot process a real refund.",
      });
    }

    const refundAmountPaise = Math.round(Number(refundRequest.refundAmount || purchase.pricePaid || 0) * 100);
    if (!refundAmountPaise || refundAmountPaise <= 0) {
      return res.status(400).json({ success: false, error: "invalid_refund_amount" });
    }

    const hasRouteTransfer = Boolean(purchase.routeTransferId);

    // What the seller was actually paid for this one prompt. Derived rather than
    // stored so it can't drift from what the buyer paid: platformCommission is
    // defined as (buyerPays − sellerNet), so this is exactly sellerNet.
    const sellerShare = +(
      Number(purchase.pricePaid || 0) - Number(purchase.platformCommission || 0)
    ).toFixed(2);

    // A cart checkout puts several purchases on one payment, each with its own
    // per-seller transfer. reverse_all would reverse all of them, so it's only
    // safe when this payment covers this purchase alone.
    const purchasesOnPayment = purchase.razorpayPaymentId
      ? await Purchase.countDocuments({ razorpayPaymentId: purchase.razorpayPaymentId })
      : 1;
    const isSolePurchaseOnPayment = purchasesOnPayment <= 1;
    const useReverseAll = hasRouteTransfer && isSolePurchaseOnPayment;

    // ── Razorpay refund — if this throws, nothing else in this handler runs,
    // so the request stays PENDING and can be retried (same pattern as the
    // hire-deal refund route in adminEscrow.js).
    let refund;
    try {
      refund = await Razorpay.payments.refund(purchase.razorpayPaymentId, {
        amount: refundAmountPaise,
        notes: {
          reason: "Admin-approved buyer refund",
          refundRequestId: String(refundRequest._id),
          purchaseId: String(purchase._id),
        },
        ...(useReverseAll ? { reverse_all: 1 } : {}),
      });
    } catch (razorpayErr) {
      console.error("Razorpay refund failed:", razorpayErr);
      return res.status(502).json({
        success: false,
        error: "razorpay_refund_failed",
        message:
          razorpayErr?.error?.description ||
          razorpayErr?.message ||
          "Razorpay rejected the refund — request was NOT marked approved, retry once resolved.",
      });
    }

    // ── Recover the seller's share.
    //
    // Everything below is best-effort: the buyer's refund has already gone
    // through, so a failure here is logged for manual recovery rather than
    // returned as an error — a buyer must not be left un-refunded because we
    // couldn't claw the money back.

    // reverse_all already handled it in the single-purchase case. For a cart
    // payment we reverse just this purchase's own transfer, by its own amount.
    if (hasRouteTransfer && !isSolePurchaseOnPayment) {
      try {
        await reverseTransfer(purchase.routeTransferId, sellerShare);
      } catch (reversalErr) {
        console.error(
          `Transfer reversal failed for refund ${refundRequest._id} (transfer ${purchase.routeTransferId}, ₹${sellerShare}) — needs manual recovery:`,
          reversalErr?.message
        );
      }
    }

    if (!hasRouteTransfer) {
      try {
        await Wallet.debitRefund(refundRequest.seller, sellerShare, {
          purchaseId: purchase._id,
          promptId: refundRequest.prompt,
          promptTitle: purchase.promptSnapshot?.title,
        });
      } catch (walletErr) {
        console.error(
          `Wallet reversal failed for refund ${refundRequest._id} (seller ${refundRequest.seller}) — needs manual recovery:`,
          walletErr.message
        );
      }
    }

    // Tokun's commission is recorded on EVERY sale, Route or Wallet, so it has
    // to be reversed on every refund too. This used to sit inside the
    // Wallet-only branch above, which left PlatformWallet overstated by the
    // commission on every refunded Route purchase.
    try {
      await PlatformWallet.reverseCommission(purchase.platformCommission, {
        source: "prompt_purchase",
        refId: purchase._id,
        description: `Refund reversal: "${purchase.promptSnapshot?.title || "Prompt"}"`,
      });
    } catch (platformErr) {
      console.error("PlatformWallet reversal failed:", platformErr.message);
    }

    refundRequest.status = "APPROVED";
    refundRequest.adminNote = String(req.body?.adminNote || "").trim();
    refundRequest.razorpayRefundId = refund.id;
    refundRequest.resolvedAt = new Date();
    refundRequest.resolvedBy = req.user._id;
    await refundRequest.save();

    purchase.refundStatus = "REFUNDED";
    purchase.refundedAt = new Date();
    purchase.razorpayRefundId = refund.id;
    await purchase.save();

    await Notification.create({
      receiverUserId: refundRequest.buyer,
      type: "REFUND_APPROVED",
      promptId: refundRequest.prompt,
      amount: refundRequest.refundAmount,
      message: `Your refund of ₹${refundRequest.refundAmount} has been approved and processed.`,
      meta: { refundRequestId: refundRequest._id },
    });

    return res.json({ success: true, refundRequest, refund });
  } catch (err) {
    console.error("Admin refund approve error:", err);
    return res.status(500).json({
      success: false,
      error: err?.error?.description || err?.message || "server_error",
    });
  }
});

// POST /api/admin/refunds/:id/reject
router.post("/:id/reject", async (req, res) => {
  try {
    const { adminNote } = req.body;
    const refundRequest = await RefundRequest.findById(req.params.id).populate("purchase");
    if (!refundRequest) {
      return res.status(404).json({ success: false, error: "refund_request_not_found" });
    }
    if (refundRequest.status !== "PENDING") {
      return res.status(400).json({ success: false, error: "already_" + refundRequest.status.toLowerCase() });
    }

    refundRequest.status = "REJECTED";
    refundRequest.adminNote = String(adminNote || "").trim();
    refundRequest.resolvedAt = new Date();
    refundRequest.resolvedBy = req.user._id;
    await refundRequest.save();

    if (refundRequest.purchase) {
      refundRequest.purchase.refundStatus = "REJECTED";
      await refundRequest.purchase.save();
    }

    await Notification.create({
      receiverUserId: refundRequest.buyer,
      type: "REFUND_REJECTED",
      promptId: refundRequest.prompt,
      message: `Your refund request was reviewed and rejected.${adminNote ? ` Reason: ${adminNote}` : ""}`,
      meta: { refundRequestId: refundRequest._id },
    });

    return res.json({ success: true, refundRequest });
  } catch (err) {
    console.error("Admin refund reject error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
