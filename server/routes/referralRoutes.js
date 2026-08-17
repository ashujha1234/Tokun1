// Everything the Refer & Earn page reads.
//
// One endpoint does almost all of it: your code, your link, what you've earned,
// and where each invite has got to. Split across three calls the page would
// flicker through three loading states for one screen's worth of data.

const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Referral = require("../models/Referral");
const CommissionRebate = require("../models/CommissionRebate");
const { requireAuth } = require("../utils/auth");
const { getOrCreateReferralCode } = require("../services/referral.service");
const cfg = require("../config/referral");

const SITE = (process.env.SITE_URL || "https://tokun.world").replace(/\/$/, "");

/* What an invited person's progress looks like from the referrer's side.
   Deliberately vague about the other person's business — "made their first
   sale" is the fact that matters here; what they sold and for how much is
   theirs. */
const inviteStatus = (referral) => {
  if (referral.status === "QUALIFIED") return { label: "Rewarded", tone: "good" };
  if (referral.status === "BLOCKED") return { label: "Not eligible", tone: "muted" };
  return { label: "Waiting for their first sale", tone: "pending" };
};

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/referrals/me
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const code = await getOrCreateReferralCode(userId);

    const [invites, credits] = await Promise.all([
      Referral.find({ referrerId: userId })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate("referredId", "name createdAt")
        .lean(),
      CommissionRebate.find({ userId }).sort({ createdAt: -1 }).limit(50).lean(),
    ]);

    const earned = credits
      .filter((c) => c.status === "USED")
      .reduce((sum, c) => sum + Number(c.amountPaid || 0), 0);

    const active = credits.filter(
      (c) => c.status === "ACTIVE" && new Date(c.expiresAt) > new Date()
    );

    /* The invited person's side of this page. They arrive asking "what did I
       get?", and until they've sold anything the answer is entirely this. */
    const welcomeDiscount = credits.find((c) => c.kind === "buyer_discount") || null;

    return res.json({
      success: true,
      code,
      link: `${SITE}/?ref=${code}`,

      /* The terms, sent rather than hardcoded in the page. The page's copy has
         to say "₹500 cap" and "₹200 minimum", and those numbers live in
         config/referral.js — a second copy in the UI would be wrong the first
         time either changed. */
      terms: {
        rebatePercent: cfg.REBATE_PERCENT_OF_COMMISSION,
        maxAmount: cfg.REBATE_MAX_AMOUNT,
        minSaleAmount: cfg.REBATE_MIN_SALE_AMOUNT,
        expiryDays: cfg.REBATE_EXPIRY_DAYS,
        boostDays: cfg.BOOST_DAYS,
        monthlyCap: cfg.MAX_REWARDS_PER_MONTH,
        buyerDiscountPercent: cfg.BUYER_DISCOUNT_PERCENT,
        buyerDiscountMax: cfg.BUYER_DISCOUNT_MAX,
      },

      /* Null for anyone who wasn't invited by someone. */
      welcomeDiscount: welcomeDiscount
        ? {
            percent: welcomeDiscount.discountPercent,
            maxAmount: welcomeDiscount.maxAmount,
            status: welcomeDiscount.status,
            expiresAt: welcomeDiscount.expiresAt,
            savedAmount: welcomeDiscount.amountPaid,
          }
        : null,

      stats: {
        invited: invites.length,
        qualified: invites.filter((i) => i.status === "QUALIFIED").length,
        pending: invites.filter((i) => i.status === "PENDING").length,
        creditsAvailable: active.length,
        totalEarned: +earned.toFixed(2),
      },

      invites: invites.map((i) => ({
        id: String(i._id),
        name: i.referredId?.name || "Someone",
        joinedAt: i.createdAt,
        qualifiedAt: i.qualifiedAt,
        ...inviteStatus(i),
      })),

      credits: credits.map((c) => ({
        id: String(c._id),
        kind: c.kind,
        status: c.status,
        role: c.role,
        maxAmount: c.maxAmount,
        minSaleAmount: c.minSaleAmount,
        expiresAt: c.expiresAt,
        amountPaid: c.amountPaid,
        paidAt: c.paidAt,
      })),
    });
  } catch (err) {
    console.error("GET /api/referrals/me error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/referrals/validate/:code
   Public. Lets the signup screen say "Invited by Priya" instead of silently
   swallowing a code that turns out to be a typo.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/validate/:code", async (req, res) => {
  try {
    const code = String(req.params.code || "").trim().toUpperCase();
    if (!code) return res.json({ success: true, valid: false });

    const referrer = await User.findOne({ referralCode: code })
      .select("name isDeleted")
      .lean();

    // First name only. Someone with a link shouldn't learn the full identity
    // of whoever owns a code they guessed.
    return res.json({
      success: true,
      valid: !!referrer && !referrer.isDeleted,
      referrerName: referrer && !referrer.isDeleted ? String(referrer.name || "").split(" ")[0] : null,
    });
  } catch (err) {
    console.error("GET /api/referrals/validate error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
