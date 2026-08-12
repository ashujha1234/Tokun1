// Every rupee Tokun adds to a buyer's bill or takes out of a seller's payout,
// derived in ONE place.
//
// Before this, the same env var meant two different things: services and hire
// read TOKUN_COMMISSION_PERCENT as "take this out of the seller", while prompts
// read it as "add this on top of the buyer". So one number moved two unrelated
// prices in opposite directions, and a buyer of a prompt was paying a 5% fee
// nobody had decided to charge them. Splitting them is the point of this file.
//
// ── The model ──────────────────────────────────────────────────────────────
//
//   BUYER pays   base + platformFee + GST(platformFee)
//   SELLER gets  base − commission − GST(commission)
//
// One buyer-side fee, the same percentage everywhere — a prompt, a service
// booking and a hire deal all charge it. The seller-side commission differs by
// what's being sold, which is why it's two variables and not one.
//
// GST is charged on TOKUN'S FEES ONLY, never on the base price. Tokun is not
// selling the gig; it's selling the service of running the marketplace, and
// that is the part that is taxable to us. The seller's own GST liability on
// their ₹10,000 is the seller's to handle.
//
// Set TOKUN_GST_PERCENT=0 to switch GST off entirely — no code change.

/** Buyer-side fee, charged on every transaction on the platform. */
const PLATFORM_FEE_PERCENT = Number(process.env.TOKUN_PLATFORM_FEE_PERCENT || 0);

/** Seller-side commission on service bookings and hire deals. */
const SERVICE_COMMISSION_PERCENT = Number(
  process.env.TOKUN_SERVICE_COMMISSION_PERCENT || 0
);

/**
 * Seller-side commission on prompt sales. Separate from the service rate
 * because a prompt is a file, not a job — and it has always been 0, meaning
 * prompt sellers keep their full list price. Deliberately NOT falling back to
 * the service rate: an unset value means "don't charge them".
 */
const PROMPT_SELLER_COMMISSION_PERCENT = Number(
  process.env.TOKUN_PROMPT_SELLER_COMMISSION_PERCENT || 0
);

/** GST on Tokun's own fees. 0 turns the whole thing off. */
const GST_PERCENT = Number(process.env.TOKUN_GST_PERCENT || 0);

const round2 = (n) => +Number(n || 0).toFixed(2);

const pct = (amount, percent) => round2((Number(amount || 0) * Number(percent || 0)) / 100);

/**
 * What the buyer is charged for a base price.
 *
 * @param {number} base the seller's list price / gig price
 * @returns {{base:number, platformFee:number, platformFeeGst:number,
 *            buyerTax:number, totalPayable:number}}
 *   buyerTax is an alias for platformFeeGst, kept because the invoice and the
 *   checkout screens talk about "tax" while the ledger talks about GST.
 */
function buyerCharge(base) {
  const amount = round2(base);
  if (amount <= 0) {
    return { base: 0, platformFee: 0, platformFeeGst: 0, buyerTax: 0, totalPayable: 0 };
  }

  const platformFee = pct(amount, PLATFORM_FEE_PERCENT);
  const platformFeeGst = pct(platformFee, GST_PERCENT);

  return {
    base: amount,
    platformFee,
    platformFeeGst,
    buyerTax: platformFeeGst,
    totalPayable: round2(amount + platformFee + platformFeeGst),
  };
}

/**
 * What the seller actually receives for a base price.
 *
 * @param {number} base
 * @param {number} commissionPercent use SERVICE_COMMISSION_PERCENT or
 *   PROMPT_SELLER_COMMISSION_PERCENT — passed in rather than picked here so the
 *   caller's choice of rate is visible at the call site.
 */
function sellerPayout(base, commissionPercent) {
  const amount = round2(base);
  if (amount <= 0) {
    return { base: 0, commission: 0, commissionGst: 0, commissionTotal: 0, netToSeller: 0 };
  }

  const commission = pct(amount, commissionPercent);
  const commissionGst = pct(commission, GST_PERCENT);
  const commissionTotal = round2(commission + commissionGst);

  return {
    base: amount,
    commission,
    commissionGst,
    // What comes off the seller's side in total — the number the payout screen
    // has to show, because "10% commission" doesn't explain a 11.8% deduction.
    commissionTotal,
    netToSeller: round2(amount - commissionTotal),
  };
}

/**
 * Both sides of one transaction.
 *
 * `platformRevenue` deliberately EXCLUDES both GST amounts. Tax collected is
 * owed to the government, not earned — counting it as revenue overstates what
 * Tokun actually makes on a job by the better part of a fifth.
 */
function transactionSplit(base, commissionPercent) {
  const buyer = buyerCharge(base);
  const seller = sellerPayout(base, commissionPercent);

  return {
    buyer,
    seller,
    platformRevenue: round2(buyer.platformFee + seller.commission),
    gstCollected: round2(buyer.platformFeeGst + seller.commissionGst),
  };
}

module.exports = {
  PLATFORM_FEE_PERCENT,
  SERVICE_COMMISSION_PERCENT,
  PROMPT_SELLER_COMMISSION_PERCENT,
  GST_PERCENT,
  round2,
  buyerCharge,
  sellerPayout,
  transactionSplit,
};
