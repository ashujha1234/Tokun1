// routes/adminRefunds.js
//
// Admin review queue for buyer-filed prompt-purchase refund requests.
// Two branches on approve, depending on how the seller was paid at
// purchase time:
//   - Route transfer happened (purchase.routeTransferId set) → refund the
//     buyer with reverse_all:1 so Razorpay reverses the linked-account
//     transfer as part of the same call.
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
        ...(hasRouteTransfer ? { reverse_all: 1 } : {}),
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

    // ── Internal bookkeeping reversal — only relevant for the Wallet-ledger
    // fallback path (Route transfers are reversed by Razorpay itself above).
    // Best-effort: the buyer's refund already succeeded regardless of what
    // happens here, so failures are logged, not returned as an error.
    if (!hasRouteTransfer) {
      try {
        await Wallet.debitRefund(refundRequest.seller, Number(purchase.pricePaid) - Number(purchase.platformCommission || 0), {
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

      try {
        await PlatformWallet.reverseCommission(purchase.platformCommission, {
          source: "prompt_purchase",
          refId: purchase._id,
          description: `Refund reversal: "${purchase.promptSnapshot?.title || "Prompt"}"`,
        });
      } catch (platformErr) {
        console.error("PlatformWallet reversal failed:", platformErr.message);
      }
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
