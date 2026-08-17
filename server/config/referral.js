// Refer & Earn — every number in one place, all overridable from the env.
//
// These are marketing numbers, not engineering ones: they will be tuned once
// there is data, and tuning them should not be a code change. Nothing below is
// read anywhere except through this file.

/* What the reward actually is.
   A referral earns the holder ONE prompt sale with Tokun's seller commission
   handed back — the sale runs normally and the commission is rebated to their
   wallet once it settles. See services/referral.service.js for why it's a
   rebate rather than a change to the Razorpay transfer split. */
const REBATE_PERCENT_OF_COMMISSION = Number(
  process.env.REFERRAL_REBATE_PERCENT || 100
); // 100 = the whole 10% seller commission comes back

/* The cap that stops one referral costing more than fifty.
   Without it, 10% of a ₹50,000 prompt is ₹5,000 for a single invite. */
const REBATE_MAX_AMOUNT = Number(process.env.REFERRAL_REBATE_MAX || 500);

/* A ₹49 sale would burn the reward for ₹5 of benefit. The credit waits for a
   sale worth using it on. */
const REBATE_MIN_SALE_AMOUNT = Number(process.env.REFERRAL_MIN_SALE || 200);

/* Unused credits expire, so the liability on the books is bounded. */
const REBATE_EXPIRY_DAYS = Number(process.env.REFERRAL_REBATE_EXPIRY_DAYS || 90);

/* The invited creator's other reward: their listings ride at the top of the
   marketplace for a week once they go live. Costs nothing, and it aims at the
   real problem a new creator has — no reviews, no ranking, no visibility. */
const BOOST_DAYS = Number(process.env.REFERRAL_BOOST_DAYS || 7);

/* The invited person's welcome: 5% off one purchase.
   Issued the moment they sign up, not when they sell — it's the reason to
   accept the invite, and it costs Tokun nothing unless they actually buy.

   It comes out of TOKUN'S cut, never the seller's: the seller is paid exactly
   what they would have been. On a ₹1,000 prompt Tokun's total cut is ₹130 and
   5% is ₹51.50, so there is room — but the cap below exists because that is
   not true at every price, and a discount larger than Tokun's own cut would
   make the payout exceed the payment and Razorpay would reject the order. */
const BUYER_DISCOUNT_PERCENT = Number(process.env.REFERRAL_BUYER_DISCOUNT_PERCENT || 5);
const BUYER_DISCOUNT_MAX = Number(process.env.REFERRAL_BUYER_DISCOUNT_MAX || 200);
const BUYER_DISCOUNT_EXPIRY_DAYS = Number(
  process.env.REFERRAL_BUYER_DISCOUNT_EXPIRY_DAYS || 90
);

/* How long a ?ref= code follows someone around before it stops counting. */
const ATTRIBUTION_DAYS = Number(process.env.REFERRAL_ATTRIBUTION_DAYS || 30);

/* One person can only earn so many of these in a month. A cap is the
   difference between a referral programme and an open tap. */
const MAX_REWARDS_PER_MONTH = Number(process.env.REFERRAL_MONTHLY_CAP || 10);

/* Prompt sales only, deliberately. Service and hire carry the same 10% but ten
   to fifty times the ticket, so the blast radius of a mistake there is a
   different order of magnitude. Revisit once this has run for a quarter. */
const QUALIFYING_KINDS = ["prompt"];

module.exports = {
  BUYER_DISCOUNT_PERCENT,
  BUYER_DISCOUNT_MAX,
  BUYER_DISCOUNT_EXPIRY_DAYS,
  REBATE_PERCENT_OF_COMMISSION,
  REBATE_MAX_AMOUNT,
  REBATE_MIN_SALE_AMOUNT,
  REBATE_EXPIRY_DAYS,
  BOOST_DAYS,
  ATTRIBUTION_DAYS,
  MAX_REWARDS_PER_MONTH,
  QUALIFYING_KINDS,
};
