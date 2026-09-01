// routes/adminEscrow.js
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const BankAccount = require("../models/BankAccount");
const HireDeal = require("../models/HireDeal");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const { releaseEscrowToFreelancer, EscrowAlreadyReleasedError } = require("../services/escrowRelease.service");
const ServiceOrder = require("../models/ServiceOrder");
const EscrowDispute = require("../models/EscrowDispute");
const {
  settleEscrow,
  EscrowNotSettleableError,
} = require("../services/escrowSettlement.service");
const { requireAuth } = require("../utils/auth");
const { logActivity, actorFromReq } = require("../utils/activityLogger");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

function requireAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ success: false, error: "forbidden" });
  }
  next();
}

// Every route below handles escrow funds (release/refund) or exposes bank
// details — must be admin-only.
router.use(requireAuth, requireAdmin);

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

    /* Both order kinds, in one list.
       This used to read HireDeal only, so every booking made from a Service
       listing was invisible to admins — no row, and therefore no way to release
       or refund one, even though those bookings hold escrowed money in exactly
       the same way. Service orders are mapped onto the hire field names the
       dashboard already renders (clientId/freelancerId/title/amount) and tagged
       with `orderKind`, which is what the release/refund routes below switch on. */
    const [hireDeals, serviceOrders] = await Promise.all([
      HireDeal.find(query)
        .populate("clientId", "name email avatarUrl")
        .populate("freelancerId", "name email avatarUrl razorpayFundAccountId")
        .sort({ createdAt: -1 })
        .lean(),
      ServiceOrder.find(query)
        .populate("buyerId", "name email avatarUrl")
        .populate("sellerId", "name email avatarUrl razorpayFundAccountId")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    let deals = [
      ...hireDeals.map((d) => ({ ...d, orderKind: "hire" })),
      ...serviceOrders.map((o) => ({
        ...o,
        orderKind: "service",
        title: o.serviceTitle,
        clientId: o.buyerId,
        freelancerId: o.sellerId,
        // The dashboard reads `amount` for volume and `freelancerAmount` for the
        // payout; ServiceOrder spells the second one `sellerAmount`.
        amount: o.amount ?? o.totalPayable,
        freelancerAmount: o.sellerAmount,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
    // Across both kinds, for the same reason the list is: money held against a
    // service booking is money Tokun is holding, and a total that leaves it out
    // understates what the platform is actually sitting on.
    const [allHire, allService] = await Promise.all([
      HireDeal.find({}).select("amount freelancerAmount fundsStatus status").lean(),
      ServiceOrder.find({})
        .select("amount totalPayable sellerAmount fundsStatus status")
        .lean(),
    ]);

    const allDeals = [
      ...allHire,
      ...allService.map((o) => ({
        amount: o.amount ?? o.totalPayable,
        freelancerAmount: o.sellerAmount,
        fundsStatus: o.fundsStatus,
        status: o.status,
      })),
    ];

    const totalVolume = allDeals.reduce(
      (s, d) => s + Number(d.amount || 0), 0
    );
    const heldFunds = allDeals
      .filter((d) => d.fundsStatus === "HELD_BY_TOKUN")
      .reduce((s, d) => s + Number(d.amount || 0), 0);
    // The two kinds spell "paid out" differently — RELEASED_TO_FREELANCER on a
    // hire deal, RELEASED_TO_SELLER on a service booking.
    const releasedFunds = allDeals
      .filter(
        (d) =>
          d.fundsStatus === "RELEASED_TO_FREELANCER" ||
          d.fundsStatus === "RELEASED_TO_SELLER" ||
          d.fundsStatus === "AUTO_RELEASED"
      )
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

    /* A service booking reaches here now that the list above returns both kinds.
       It settles through the shared engine at 100% to the seller, which is the
       same thing "release" means for a hire deal — the arithmetic, the wallet
       credit and the commission record all live in one place.

       No waiveCommission here, deliberately: this is a completed job being paid
       out, not a dispute being arbitrated, so Tokun's commission applies exactly
       as it would on a normal client approval. */
    if (req.body?.orderKind === "service") {
      try {
        const result = await settleEscrow("service", dealId, {
          sellerPercent: 100,
          actor: "admin",
          reason: req.body?.reason || "Released by admin",
        });
        return res.json({
          success: true,
          message: `₹${result.sellerPayout} released to the Creator.`,
          deal: result.order,
          walletBalance: null,
        });
      } catch (err) {
        if (err instanceof EscrowNotSettleableError) {
          return res.status(400).json({ success: false, error: err.code, message: err.message });
        }
        throw err;
      }
    }

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

    // ── Atomically claim + credit freelancer wallet + record commission ────
    // (shared with the client approve-work route and the auto-release cron,
    // so the same deal can never be credited twice)
    let releaseResult;
    try {
      releaseResult = await releaseEscrowToFreelancer(deal._id, "admin_released", actorFromReq(req));
    } catch (releaseErr) {
      if (releaseErr instanceof EscrowAlreadyReleasedError) {
        return res.status(400).json({
          success: false,
          error: "Escrow was already released for this deal",
        });
      }
      throw releaseErr;
    }
    const wallet = releaseResult.wallet;
    deal.status = releaseResult.deal.status;
    deal.fundsStatus = releaseResult.deal.fundsStatus;
    deal.approvedAt = releaseResult.deal.approvedAt;
    deal.releasedAt = releaseResult.deal.releasedAt;

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
      message: `₹${payoutAmount} creator ke wallet mein credit ho gaya`,
      deal,
      // null once the money goes out over Route instead of the internal
      // ledger — there is no Tokun-side balance to report, Razorpay settles it
      // to the freelancer's own bank. Only legacy deals still return a wallet.
      walletBalance: wallet ? wallet.availableBalance : null,
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

    /* Both kinds settle at 0% — a full refund — through the shared engine.
       It reverses the Route transfer the seller's money is held on, refunds
       only the divisible amount, records the platform's share, and claims the
       order atomically so this can't race the /settle route.

       Hire deals used to run their own copy of this below, and it was wrong in
       two ways that cost real money:

         1. It refunded `totalPayable` — the WHOLE ₹2,060 on a ₹2,000 deal,
            handing back the ₹60 buyer platform fee that is non-refundable in
            every other path. computeSplit() carves that fee out first and
            refunds ₹2,000.

         2. It never touched the Route transfer. The freelancer's hold carries
            the full payment (routeHeldAmount = totalPayable), so the deal was
            marked REFUNDED while ₹2,060 was still held for the freelancer —
            Tokun paid the client back out of its own balance and the
            freelancer kept theirs. reverse_all pulls the hold back as part of
            the same refund call. */
    const orderKind = req.body?.orderKind === "service" ? "service" : "hire";

    let result;
    try {
      result = await settleEscrow(orderKind, dealId, {
        sellerPercent: 0,
        actor: "admin",
        reason: reason || "Admin refund",
      });
    } catch (err) {
      if (err instanceof EscrowNotSettleableError) {
        return res.status(400).json({ success: false, error: err.code, message: err.message });
      }
      throw err;
    }

    /* Hire deals have always sent the client an in-app notification here and
       the settlement engine only sends email, so this stays. Best-effort: the
       refund has already gone through, and a failed notification must not make
       it look like it hasn't. */
    if (orderKind === "hire") {
      try {
        await Notification.create({
          senderId: result.order?.freelancerId,
          senderName: "Tokun Admin",
          receiverUserId: result.order?.clientId,
          type: "HIRE_REFUNDED",
          hireDealId: dealId,
          amount: result.refundAmount,
          message: `₹${result.refundAmount} refund kar diya gaya. Reason: ${
            reason || "Admin decision"
          }`,
        });
      } catch (notifyErr) {
        console.error("Hire refund notification failed (refund itself succeeded):", notifyErr.message);
      }
    }

    return res.json({
      success: true,
      message: "Refund processed successfully",
      deal: result.order,
      refund: result.refund || null,
      refundAmount: result.refundAmount,
    });
  } catch (err) {
    console.error("admin refund error:", err);
    return res.status(500).json({
      success: false,
      error: err?.error?.description || err?.message || "Refund failed",
    });
  }
});


/* ══════════════════════════════════════════════════════════════════════════
   ESCROW HELD ACROSS BOTH ORDER KINDS

   The routes above are hire-only — /deals, /:dealId/release, /:dealId/refund.
   Service bookings had NO admin escrow control at all, which mattered most in
   exactly the case admins exist for: a booking that has stalled with the money
   still held. A freelancer who stops replying after a revision request leaves
   the order in REVISION_REQUESTED, where the auto-release cron (which only
   looks at WORK_SUBMITTED) never sees it — and with Razorpay's 90-day hold
   limit, that money eventually falls out of escrow with nobody having decided
   anything.

   These two routes cover both kinds and lean on the shared settlement engine,
   so an admin decision here uses the same arithmetic — and the same guarantee
   that the parts add up to what the buyer paid — as a mutually-agreed split.
   ══════════════════════════════════════════════════════════════════════════ */

/* GET /api/admin/escrow/held?kind=all|hire|service&stalled=true
   Everything still held and still undecided, newest deadline first. */
router.get("/held", async (req, res) => {
  try {
    const kind = ["hire", "service"].includes(req.query.kind) ? req.query.kind : "all";
    const stalledOnly = String(req.query.stalled) === "true";

    // Statuses where the money is held and nothing has concluded.
    const openStatuses = ["FUNDED", "IN_PROGRESS", "WORK_SUBMITTED", "REVISION_REQUESTED", "DISPUTED"];
    const baseFilter = { fundsStatus: "HELD_BY_TOKUN", status: { $in: openStatuses } };

    /* "Stalled" is the queue that actually needs a human: waiting on someone
       who isn't coming back. REVISION_REQUESTED is the important one — the
       auto-release cron can't touch it, so without an admin it waits forever. */
    if (stalledOnly) {
      baseFilter.status = { $in: ["REVISION_REQUESTED", "DISPUTED", "IN_PROGRESS"] };
    }

    const rows = [];

    if (kind === "all" || kind === "hire") {
      const deals = await HireDeal.find(baseFilter)
        .populate("clientId", "name email")
        .populate("freelancerId", "name email")
        .sort({ escrowExpiresAt: 1, createdAt: 1 })
        .limit(200)
        .lean();

      rows.push(
        ...deals.map((d) => ({
          orderKind: "hire",
          _id: d._id,
          title: d.title,
          status: d.status,
          fundsStatus: d.fundsStatus,
          buyer: d.clientId,
          seller: d.freelancerId,
          totalPayable: d.totalPayable || d.amount,
          sellerAmount: d.freelancerAmount,
          paidAt: d.paidAt,
          workSubmittedAt: d.workSubmittedAt,
          escrowExpiresAt: d.escrowExpiresAt,
          revisions: (d.revisions || []).length,
        }))
      );
    }

    if (kind === "all" || kind === "service") {
      const orders = await ServiceOrder.find(baseFilter)
        .populate("buyerId", "name email")
        .populate("sellerId", "name email")
        .sort({ escrowExpiresAt: 1, createdAt: 1 })
        .limit(200)
        .lean();

      rows.push(
        ...orders.map((o) => ({
          orderKind: "service",
          _id: o._id,
          title: o.serviceTitle,
          status: o.status,
          fundsStatus: o.fundsStatus,
          buyer: o.buyerId,
          seller: o.sellerId,
          totalPayable: o.totalPayable,
          sellerAmount: o.sellerAmount,
          paidAt: o.paidAt,
          workSubmittedAt: o.workSubmittedAt,
          escrowExpiresAt: o.escrowExpiresAt,
          revisions: (o.revisions || []).length,
        }))
      );
    }

    /* Closest to the 90-day wall first. That deadline is the one thing here an
       admin genuinely cannot negotiate — past it the hold is gone. */
    rows.sort((a, b) => {
      const ax = a.escrowExpiresAt ? new Date(a.escrowExpiresAt).getTime() : Infinity;
      const bx = b.escrowExpiresAt ? new Date(b.escrowExpiresAt).getTime() : Infinity;
      return ax - bx;
    });

    const now = Date.now();
    return res.json({
      success: true,
      orders: rows.map((r) => ({
        ...r,
        daysUntilExpiry: r.escrowExpiresAt
          ? Math.ceil((new Date(r.escrowExpiresAt).getTime() - now) / 86400000)
          : null,
      })),
      total: rows.length,
    });
  } catch (err) {
    console.error("admin escrow held error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* POST /api/admin/escrow/:orderKind/:orderId/settle
   One number decides everything: sellerPercent 0 = refund the buyer in full,
   100 = pay the seller in full. Nothing in between — a settlement pays exactly
   one party, and the buyer-side platform fee is kept either way.

   Deliberately not a pair of free-form amounts: two independent figures can be
   set so they don't add up to what the buyer paid, and nobody can reconcile
   that afterwards. */
router.post("/:orderKind/:orderId/settle", async (req, res) => {
  try {
    const { orderKind, orderId } = req.params;
    if (!["hire", "service"].includes(orderKind)) {
      return res.status(400).json({ success: false, error: "invalid_order_kind" });
    }

    const percent = Number(req.body?.sellerPercent);
    if (percent !== 0 && percent !== 100) {
      return res.status(400).json({
        success: false,
        error: "invalid_percent",
        message:
          "sellerPercent must be 0 (refund the buyer in full) or 100 (pay the seller in full).",
      });
    }

    const reason = String(req.body?.reason || "").trim().slice(0, 2000);

    let result;
    try {
      result = await settleEscrow(orderKind, orderId, {
        sellerPercent: percent,
        reason:
          reason ||
          (percent === 100
            ? "Settled by Tokun — paid to the creator"
            : "Settled by Tokun — refunded to the client"),
        actor: "admin",
        // An admin splitting a stalled booking is arbitrating it — same rule as
        // the dispute queue, Tokun keeps nothing.
        waiveCommission: true,
      });
    } catch (err) {
      if (err instanceof EscrowNotSettleableError) {
        return res.status(400).json({ success: false, error: err.code, message: err.message });
      }
      console.error("admin settle failed:", err);
      // settleEscrow puts the order back to HELD_BY_TOKUN on failure, so this
      // is safe to retry once whatever Razorpay objected to is fixed.
      return res.status(502).json({
        success: false,
        error: "settlement_failed",
        message:
          err?.error?.description ||
          err?.message ||
          "The payment provider rejected this settlement. Nothing was changed — please retry.",
      });
    }

    // Any open dispute on this order is now moot — closing it here stops it
    // sitting in the arbitration queue after the money has already moved.
    try {
      await EscrowDispute.updateMany(
        {
          [orderKind === "hire" ? "hireDealId" : "serviceOrderId"]: orderId,
          status: { $in: ["OPEN", "PROPOSED", "ADMIN_REVIEW"] },
        },
        {
          $set: {
            status: "RESOLVED",
            finalSellerPercent: percent,
            finalSellerPayout: result.sellerPayout,
            finalRefundAmount: result.refundAmount,
            resolvedVia: "admin",
            resolvedAt: new Date(),
            adminId: req.user._id,
            adminNote: reason,
          },
        }
      );
    } catch (disputeErr) {
      console.error("Closing dispute after admin settle failed:", disputeErr.message);
    }

    return res.json({
      success: true,
      message: `Settled at ${percent}% — ₹${result.sellerPayout} to the Creator, ₹${result.refundAmount} refunded.`,
      sellerPayout: result.sellerPayout,
      refundAmount: result.refundAmount,
      platformKeeps: result.commissionKept,
      order: result.order,
    });
  } catch (err) {
    console.error("admin escrow settle error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;