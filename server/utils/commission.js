// The money split for one prompt sale.
//
// The rates themselves now live in utils/fees.js, which every flow on the
// platform reads — a prompt, a service booking and a hire deal all charge the
// buyer the SAME platform fee. This file is just the prompt-shaped view of it.
//
// What changed: the buyer-side fee used to be TOKUN_COMMISSION_PERCENT, the
// same variable services and hire used for the SELLER's commission. So raising
// the seller's commission silently raised what prompt buyers paid, and prompt
// buyers were carrying a 5% fee that was never a decision about prompts. There
// is now one buyer fee, TOKUN_PLATFORM_FEE_PERCENT, and it is the only thing
// added to a buyer's bill anywhere.
//
// For a ₹100 prompt at platform fee 3%, GST 18%, prompt seller commission 0%:
//
//   listPrice     100.00   what the seller typed in
//   platformFee     3.00   added on top
//   platformFeeGst  0.54   GST on the fee, not on the prompt
//   buyerPays     103.54
//   sellerFee       0.00   prompt sellers keep their list price
//   sellerNet     100.00
//   platformCut     3.54   buyerPays − sellerNet
//
// platformCut is deliberately defined as (buyerPays − sellerNet) rather than
// summed from the two fees. It's stored on Purchase.platformCommission, and the
// refund path recovers `pricePaid − platformCommission` from the seller — which
// only equals what the seller was actually paid if the two are derived from
// each other. Keep them that way.
const {
  PLATFORM_FEE_PERCENT,
  PROMPT_SELLER_COMMISSION_PERCENT,
  buyerCharge,
  sellerPayout,
  round2,
} = require("./fees");

/**
 * @param {{ price?: number, tokun_price?: number, free?: boolean }} prompt
 * @returns {{ listPrice:number, buyerPays:number, buyerFee:number,
 *             platformFee:number, platformFeeGst:number,
 *             sellerFee:number, sellerNet:number, platformCut:number }}
 */
function splitPromptSale(prompt) {
  const zero = {
    listPrice: 0,
    buyerPays: 0,
    buyerFee: 0,
    platformFee: 0,
    platformFeeGst: 0,
    sellerFee: 0,
    sellerNet: 0,
    platformCut: 0,
  };

  if (!prompt || prompt.free) return zero;

  const listPrice = round2(prompt.price);
  if (listPrice <= 0) return zero;

  /* Computed live from the current rates rather than read from the stored
     tokun_price. tokun_price is maintained by Prompt's pre-save hook, so every
     prompt saved before a rate change still carries the OLD fee — and this is
     the number the buyer is actually charged. Reading it here would mean a fee
     change only reached prompts their sellers happened to re-save.

     tokun_price is still written and still used for DISPLAY on listings; it
     just isn't the source of truth for the charge any more. */
  const buyer = buyerCharge(listPrice);
  const seller = sellerPayout(listPrice, PROMPT_SELLER_COMMISSION_PERCENT);

  return {
    listPrice,
    buyerPays: buyer.totalPayable,
    // Everything added on top of the list price — fee plus its GST. Kept as one
    // number because that's what the old callers used; the two components are
    // below for anything that needs to itemise them.
    buyerFee: round2(buyer.totalPayable - listPrice),
    platformFee: buyer.platformFee,
    platformFeeGst: buyer.platformFeeGst,
    sellerFee: seller.commissionTotal,
    sellerNet: seller.netToSeller,
    platformCut: round2(buyer.totalPayable - seller.netToSeller),
  };
}

module.exports = {
  // Re-exported under their old names so existing importers keep working.
  COMMISSION_PERCENT: PLATFORM_FEE_PERCENT,
  SELLER_COMMISSION_PERCENT: PROMPT_SELLER_COMMISSION_PERCENT,
  splitPromptSale,
};
