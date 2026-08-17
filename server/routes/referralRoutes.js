// Everything the Refer & Earn page reads.
//
// One endpoint does almost all of it: your code, your link, what you've earned,
// and where each invite has got to. Split across three calls the page would
// flicker through three loading states for one screen's worth of data.

const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Prompt = require("../models/Prompt");
const Referral = require("../models/Referral");
const CommissionRebate = require("../models/CommissionRebate");
const { requireAuth } = require("../utils/auth");
const {
  getOrCreateReferralCode,
  previewBuyerDiscount,
  releaseCheckoutReservations,
} = require("../services/referral.service");
const { splitPromptSale } = require("../utils/commission");
const { siteUrl } = require("../utils/siteUrl");
const cfg = require("../config/referral");

/* Always the www host — an invite link on the apex is a dead link, and the
   reason is worth reading once: see utils/siteUrl.js. */
const SITE = siteUrl();

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
      /* Straight to signup, not the landing page. The one thing an invite has
         to produce is an account, and the code only ever pays off at the end of
         that form — a link that lands on the marketing page asks the visitor to
         find the way there themselves.
         The code still rides in the query string and is still read on app boot
         (lib/referral.ts runs before any route mounts), so it survives the
         signup → OTP → verify hop exactly as before. */
      link: `${SITE}/signup?ref=${code}`,

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
   GET /api/referrals/checkout-preview/:promptId

   What the welcome discount is worth on ONE listing, for the review dialog
   behind "Buy Now".

   The discount has always been applied — silently, inside order creation, where
   the buyer met it for the first time as a total that didn't match the listing.
   This is the same figure, named before they commit.

   Read-only, deliberately: opening a dialog and closing it again must not spend
   anything. The credit is still claimed at order creation, and it recomputes
   from the same helper, so the number here is the number charged.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/checkout-preview/:promptId", requireAuth, async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.promptId)
      .select("price tokun_price free userId")
      .lean();

    // Not found, free, or priced at zero. `available: false` rather than a 404:
    // the dialog asks about every listing and has nothing to say about most.
    if (!prompt || prompt.free) return res.json({ success: true, available: false });

    const split = splitPromptSale(prompt);
    if (split.buyerPays <= 0) return res.json({ success: true, available: false });

    /* The breakdown goes back whether or not there's a coupon on it.

       The dialog's own figures come from whatever the page happened to hand it,
       and some callers don't carry a tokun_price at all — those drew the fee as
       ₹0 and quoted the list price as the total. These come from splitPromptSale
       at live rates, which is what order creation charges, so the dialog can
       show the real numbers to everybody and not just to the invited. */
    const pricing = {
      listPrice: split.listPrice,
      platformFee: +(split.buyerPays - split.listPrice).toFixed(2),
      total: split.buyerPays,
    };

    const held = await previewBuyerDiscount({
      buyerId: req.user._id,
      sellerId: prompt.userId,
      split,
    });

    if (!held) {
      return res.json({ success: true, available: false, ...pricing, payable: pricing.total });
    }

    return res.json({
      success: true,
      available: true,

      /* A label, not a key. The credit is tied to the account, so there is
         nothing for the server to look up and nothing a buyer could type in to
         obtain one — the field in the dialog is filled in for them and read
         only. It exists because "you have a discount" reads as marketing copy,
         and a coupon in a box reads as money. */
      code: `WELCOME${held.percent}`,
      percent: held.percent,
      discount: held.discount,
      maxAmount: held.maxAmount,
      expiresAt: held.expiresAt,

      ...pricing,
      payable: +(split.buyerPays - held.discount).toFixed(2),
    });
  } catch (err) {
    console.error("GET /api/referrals/checkout-preview error:", err);
    // A broken preview must never block a purchase — the dialog just shows the
    // undiscounted total, and order creation still applies the credit.
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/referrals/release-checkout

   Called when the payment sheet is dismissed or the payment fails. Hands back
   whatever that checkout had reserved, so the buyer's coupon is there again on
   the next attempt instead of an hour later.

   Body: { orderId, promptId }
   ══════════════════════════════════════════════════════════════════════════ */
router.post("/release-checkout", requireAuth, async (req, res) => {
  try {
    const orderId = String(req.body?.orderId || "").trim();
    if (!orderId) return res.json({ success: true, released: 0 });

    // Only to find the seller whose credit this order may hold. A missing or
    // unknown prompt just means the buyer's own discount is released alone.
    let sellerId = null;
    if (req.body?.promptId) {
      const prompt = await Prompt.findById(req.body.promptId).select("userId").lean();
      sellerId = prompt?.userId || null;
    }

    const released = await releaseCheckoutReservations({
      buyerId: req.user._id,
      sellerId,
      razorpayOrderId: orderId,
    });

    return res.json({ success: true, released });
  } catch (err) {
    console.error("POST /api/referrals/release-checkout error:", err);
    // The hourly sweep is the backstop, so a failure here costs a delay and
    // nothing else. Never worth surfacing to someone who just closed a dialog.
    return res.json({ success: true, released: 0 });
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
