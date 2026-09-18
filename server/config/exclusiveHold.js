/**
 * How long one buyer holds a one-time product while they are in checkout.
 *
 * ── What the hold is for ────────────────────────────────────────────────────
 *
 * Buying has two steps with a payment in between — create the order, pay on
 * Razorpay, then verify — and a product is only marked sold at the last one. So
 * two buyers could both pass the "is it still available?" check, both pay, and
 * only one of them could ever be given the product. The other had money taken
 * for something that no longer existed.
 *
 * Whoever reaches checkout first now holds the listing, and anyone else is
 * refused BEFORE Razorpay opens. Nothing is charged, so there is nothing to
 * refund — which is the whole reason the hold is taken at that step rather than
 * at verification.
 *
 * ── Why it lapses rather than locks ─────────────────────────────────────────
 *
 * Someone opens checkout and closes the tab. If the hold were permanent, that
 * listing would be off sale forever, and a seller would have no way to get it
 * back. So it simply expires: nothing sweeps these, because an expired hold is
 * indistinguishable from no hold — every query that cares compares the stored
 * date against now.
 *
 * ── Choosing the number ─────────────────────────────────────────────────────
 *
 * Long enough to read the page and finish a UPI or card payment without being
 * hurried, short enough that an abandoned tab is not felt by the next buyer.
 * Raising it makes abandoned checkouts costlier; lowering it starts failing
 * slow but honest payments, and those land on the backstop in
 * purchaseRoutes /verify — which refunds them, correctly, but a refund the
 * buyer did not ask for is still a bad afternoon.
 *
 * Read by both checkouts (Buy Now in routes/purchaseRoutes.js and the cart in
 * routes/cartRoute.js), so the two cannot disagree about how long a hold lasts.
 */
const EXCLUSIVE_HOLD_MINUTES = 15;
const EXCLUSIVE_HOLD_MS = EXCLUSIVE_HOLD_MINUTES * 60 * 1000;

module.exports = { EXCLUSIVE_HOLD_MINUTES, EXCLUSIVE_HOLD_MS };
