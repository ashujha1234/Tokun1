// routes/adminEscrow.js
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const BankAccount = require("../models/BankAccount");
const HireDeal = require("../models/HireDeal");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const User = require("../models/User");
const Wallet = require("../models/Wallet");   // ✅ NEW — wallet model
const PlatformWallet = require("../models/PlatformWallet");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Wallet helper ──────────────────────────────────────────────────────────
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) wallet = await Wallet.create({ userId });
  return wallet;
};



// ════════════════════════════════════════════════════════════════════════════
// GET /api/admin/escrow/deals
// ════════════════════════════════════════════════════════════════════════════
router.get("/deals", async (req, res) => {
  try {
    const {
      status,
      fundsStatus,
      page = 1,
      limit = 20,
      search,
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (fundsStatus) query.fundsStatus = fundsStatus;

    let deals = await HireDeal.find(query)
      .populate("clientId", "name email avatar profileImage")
      .populate(
        "freelancerId",
        "name email avatar profileImage razorpayFundAccountId"
      )
      .sort({ createdAt: -1 })
      .lean();

    // ── Bank details attach karo ──────────────────────────────────────────
    const freelancerIds = deals
      .map((d) => d.freelancerId?._id)
      .filter(Boolean);

    const defaultBanks = await BankAccount.find({
      userId: { $in: freelancerIds },
      default: true,
    }).lean();

    const bankMap = new Map(
      defaultBanks.map((b) => [String(b.userId), b])
    );

    deals = deals.map((deal) => {
      const fId = deal.freelancerId?._id
        ? String(deal.freelancerId._id)
        : null;
      const bank = fId ? bankMap.get(fId) : null;
      const fundAccountId =
        deal.freelancerId?.razorpayFundAccountId ||
        bank?.razorpayFundAccountId ||
        null;

      return {
        ...deal,
        freelancerId: deal.freelancerId
          ? {
              ...deal.freelancerId,
              razorpayFundAccountId: fundAccountId,
              defaultBankAccount: bank
                ? {
                    bankName: bank.bankName,
                    accountHolderName: bank.accountHolderName,
                    maskedAccountNumber: bank.accountNumber
                      ? `XXXX${String(bank.accountNumber).slice(-4)}`
                      : null,
                  }
                : null,
            }
          : deal.freelancerId,
      };
    });

    // ── Search ────────────────────────────────────────────────────────────
    if (search) {
      const q = String(search).toLowerCase();
      deals = deals.filter((d) =>
        (d.title || "").toLowerCase().includes(q) ||
        (d.clientId?.name || "").toLowerCase().includes(q) ||
        (d.freelancerId?.name || "").toLowerCase().includes(q) ||
        String(d._id).includes(q)
      );
    }

    // ── Pagination ────────────────────────────────────────────────────────
    const total = deals.length;
    const currentPage = Math.max(Number(page) || 1, 1);
    const pageLimit = Math.max(Number(limit) || 20, 1);
    const skip = (currentPage - 1) * pageLimit;
    const paginated = deals.slice(skip, skip + pageLimit);

    // ── Stats ─────────────────────────────────────────────────────────────
    const allDeals = await HireDeal.find({}).lean();

    const totalVolume = allDeals.reduce(
      (s, d) => s + Number(d.amount || 0), 0
    );
    const heldFunds = allDeals
      .filter((d) => d.fundsStatus === "HELD_BY_TOKUN")
      .reduce((s, d) => s + Number(d.amount || 0), 0);
    const releasedFunds = allDeals
      .filter((d) => d.fundsStatus === "RELEASED_TO_FREELANCER")
      .reduce((s, d) => s + Number(d.freelancerAmount || 0), 0);
    const pendingReview = allDeals.filter(
      (d) => d.status === "WORK_SUBMITTED"
    ).length;

    return res.json({
      success: true,
      deals: paginated,
      total,
      page: currentPage,
      limit: pageLimit,
      totalPages: Math.ceil(total / pageLimit),
      stats: { totalVolume, heldFunds, releasedFunds, pendingReview },
    });
  } catch (err) {
    console.error("admin escrow deals error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch deals",
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// POST /api/admin/escrow/:dealId/release
//
// Razorpay payout NAHI hoga.
// Freelancer ke Tokun Wallet mein paisa credit hoga.
// Freelancer phir khud /withdraw se bank mein nikal sakta hai.
// ════════════════════════════════════════════════════════════════════════════
router.post("/:dealId/release", async (req, res) => {
  try {
    const { dealId } = req.params;

    const deal = await HireDeal.findById(dealId)
      .populate("clientId", "name email")
      .populate("freelancerId", "name email");

    if (!deal) {
      return res.status(404).json({ success: false, error: "Deal not found" });
    }

    if (deal.fundsStatus !== "HELD_BY_TOKUN") {
      return res.status(400).json({
        success: false,
        error: "Funds not in escrow",
      });
    }

    if (!deal.freelancerId) {
      return res.status(400).json({
        success: false,
        error: "Freelancer not found on this deal",
      });
    }

    const payoutAmount = Number(deal.freelancerAmount || 0);

    if (!payoutAmount || payoutAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid freelancer payout amount",
      });
    }

    // ── ✅ Wallet mein credit karo ────────────────────────────────────────
    const wallet = await getOrCreateWallet(deal.freelancerId._id);

    wallet.availableBalance += payoutAmount;

    // totalRevenue bhi update karo (Wallet.tsx mein "Total Earning" dikhta hai)
    wallet.totalRevenue = (wallet.totalRevenue || 0) + payoutAmount;

    wallet.transactions.unshift({
      type: "credit",
      status: "Completed",
      amount: payoutAmount,
      description: `Escrow released: ${deal.title || "Hire Deal"}`,
      createdAt: new Date(),
      meta: {
        source: "escrow_release",
        hireDealId: String(deal._id),
        clientName: deal.clientId?.name || "",
        clientId: deal.clientId?._id || null,
      },
    });

    await wallet.save();
    // ─────────────────────────────────────────────────────────────────────

    // ── Record Tokun's platform fee cut for this deal (non-fatal) ─────────
    try {
      await PlatformWallet.recordCommission(Number(deal.platformFee || 0), {
        source: "hire_escrow",
        refId: deal._id,
        description: `Platform fee: "${deal.title || "Hire Deal"}"`,
      });
    } catch (revErr) {
      console.error("PlatformWallet commission record failed:", revErr);
    }

    // ── Deal update ───────────────────────────────────────────────────────
    deal.status = "COMPLETED";
    deal.fundsStatus = "RELEASED_TO_FREELANCER";
    deal.approvedAt = new Date();
    // razorpayPayoutId set nahi kar rahe — wallet se gaya hai
    await deal.save();

    // ── User stats update ─────────────────────────────────────────────────
    await User.findByIdAndUpdate(deal.freelancerId._id, {
      $inc: {
        totalEarnings: payoutAmount,
        completedDeals: 1,
      },
    });

    // ── Chat message ──────────────────────────────────────────────────────
    if (deal.chatId && deal.clientId?._id) {
      await Message.create({
        conversationId: deal.chatId,
        sender: deal.clientId._id,
        text: `ESCROW_RELEASED::${JSON.stringify({
          hireDealId: String(deal._id),
          title: deal.title,
          amount: payoutAmount,
          status: "COMPLETED",
        })}`,
        readBy: [deal.clientId._id],
      });
    }

    // ── Notification ──────────────────────────────────────────────────────
    await Notification.create({
      senderId: deal.clientId?._id,
      senderName: "Tokun Admin",
      receiverUserId: deal.freelancerId._id,
      type: "HIRE_PAYMENT_RELEASED",
      hireDealId: deal._id,
      amount: payoutAmount,
      message: `₹${payoutAmount} aapke Tokun Wallet mein credit ho gaya. Wallet se bank mein withdraw kar sakte hain.`,
    });

    return res.json({
      success: true,
      message: `₹${payoutAmount} freelancer ke wallet mein credit ho gaya`,
      deal,
      walletBalance: wallet.availableBalance,
    });
  } catch (err) {
    console.error("admin release error:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Release failed",
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// POST /api/admin/escrow/:dealId/refund
//
// Client ko Razorpay se original payment refund karo.
// ════════════════════════════════════════════════════════════════════════════
router.post("/:dealId/refund", async (req, res) => {
  try {
    const { dealId } = req.params;
    const { reason } = req.body;

    const deal = await HireDeal.findById(dealId)
      .populate("clientId", "name email")
      .populate("freelancerId", "name email");

    if (!deal) {
      return res.status(404).json({ success: false, error: "Deal not found" });
    }

    if (deal.fundsStatus !== "HELD_BY_TOKUN") {
      return res.status(400).json({
        success: false,
        error: "Funds not in escrow",
      });
    }

    const refundAmount = Number(deal.amount || 0);

    if (!refundAmount || refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid refund amount",
      });
    }

    // ── Razorpay refund (agar original payment ID hai) ────────────────────
    let refund = null;

    if (deal.razorpayPaymentId) {
      try {
        refund = await razorpay.payments.refund(deal.razorpayPaymentId, {
          amount: Math.round(refundAmount * 100),
          notes: {
            reason: reason || "Admin refund",
            dealId: String(deal._id),
          },
        });
      } catch (razorpayErr) {
        console.error("Razorpay refund failed:", razorpayErr);
        // Razorpay fail ho toh bhi deal update karo — manually process hoga
      }
    }

    // ── Deal update ───────────────────────────────────────────────────────
    deal.status = "REFUNDED";
    deal.fundsStatus = "REFUNDED_TO_CLIENT";
    deal.refundedAt = new Date();
    deal.refundReason = reason || "Admin decision";

    if (refund?.id) {
      deal.razorpayRefundId = refund.id;
    }

    await deal.save();

    // ── Notification to client ────────────────────────────────────────────
    await Notification.create({
      senderId: deal.freelancerId?._id,
      senderName: "Tokun Admin",
      receiverUserId: deal.clientId?._id,
      type: "HIRE_REFUNDED",
      hireDealId: deal._id,
      amount: refundAmount,
      message: `₹${refundAmount} refund kar diya gaya. Reason: ${
        reason || "Admin decision"
      }`,
    });

    return res.json({
      success: true,
      message: "Refund processed successfully",
      deal,
      refund,
    });
  } catch (err) {
    console.error("admin refund error:", err);
    return res.status(500).json({
      success: false,
      error: err?.error?.description || err?.message || "Refund failed",
    });
  }
});

module.exports = router;