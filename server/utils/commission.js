// The money split for one prompt sale, in one place.
//
// Tokun charges TOKUN_COMMISSION_PERCENT on both sides of a prompt sale — the
// same shape the hire flow already uses (see hire.routes.js: platformFee comes
// out of the freelancer's payout, clientFee is added on top of the client's).
// Before this existed the prompt flow only charged the buyer side, so a seller
// listing at ₹100 received the full ₹100 while Tokun's take rate was half what
// the hire flow's was.
//
// For a ₹100 listing at 5%:
//
//   listPrice   100.00   what the seller typed in
//   buyerFee      5.00   added on top      → buyerPays 105.00
//   sellerFee     5.00   taken off the top → sellerNet   95.00
//   platformCut  10.00   buyerFee + sellerFee
//
// platformCut is deliberately defined as (buyerPays − sellerNet) rather than
// summed from the two fees. It's stored on Purchase.platformCommission, and the
// refund path recovers `pricePaid − platformCommission` from the seller — which
// only equals what the seller was actually paid if the two are derived from
// each other. Keep them that way.
const COMMISSION_PERCENT = Number(process.env.TOKUN_COMMISSION_PERCENT || 0);

const round2 = (n) => +Number(n || 0).toFixed(2);

/**
 * @param {{ price?: number, tokun_price?: number, free?: boolean }} prompt
 * @returns {{ listPrice: number, buyerPays: number, buyerFee: number,
 *             sellerFee: number, sellerNet: number, platformCut: number }}
 */
function splitPromptSale(prompt) {
  const zero = {
    listPrice: 0,
    buyerPays: 0,
    buyerFee: 0,
    sellerFee: 0,
    sellerNet: 0,
    platformCut: 0,
  };

  if (!prompt || prompt.free) return zero;

  const listPrice = round2(prompt.price);
  if (listPrice <= 0) return zero;

  // tokun_price is maintained by Prompt's pre-save hook, but it only runs on
  // save — a document written before the hook existed can still hold 0. Falling
  // back to the same formula avoids the alternative, which is billing the buyer
  // ₹0 and handing the prompt over for free.
  const storedBuyerPays = round2(prompt.tokun_price);
  const buyerPays =
    storedBuyerPays > 0 ? storedBuyerPays : round2(listPrice + (listPrice * COMMISSION_PERCENT) / 100);

  const sellerFee = round2((listPrice * COMMISSION_PERCENT) / 100);
  const sellerNet = round2(listPrice - sellerFee);

  return {
    listPrice,
    buyerPays,
    buyerFee: round2(buyerPays - listPrice),
    sellerFee,
    sellerNet,
    platformCut: round2(buyerPays - sellerNet),
  };
}

module.exports = { COMMISSION_PERCENT, splitPromptSale };
