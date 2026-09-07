/**
 * What makes a Razorpay callback proof of purchase — for BOTH checkouts.
 *
 * ── The hole this closes ────────────────────────────────────────────────────
 *
 * Both verify endpoints used to accept a callback on the strength of its
 * signature alone:
 *
 *   HMAC_sha256(order_id + "|" + payment_id, KEY_SECRET) === signature
 *
 * That HMAC proves the pair is authentic — that Razorpay really did charge
 * payment P against order O. It says NOTHING about what was being bought, or
 * by whom, and it stays valid forever. So one real ₹10 payment yielded a triple
 * the buyer could replay against any other listing:
 *
 *   POST /api/purchase/verify/<promptId>   { same order, payment, signature }
 *
 * `already_purchased` only compared (buyer, prompt), so it blocked re-buying
 * the SAME prompt and waved through every other one. Each replay wrote a
 * Purchase with paymentStatus SUCCESS, granted the prompt text, and — via
 * settleAfterPurchase — credited the seller for a payment that never happened.
 * One payment, the whole marketplace, and real money moving out on the back of
 * it. The cart endpoint was worse: it charged whatever was in the cart AT
 * VERIFY TIME, so a ₹10 order could be replayed against a cart refilled with
 * anything.
 *
 * ── What is checked instead ─────────────────────────────────────────────────
 *
 * The order is the only thing that records intent, because we built it:
 * create-order and cart checkout both write `notes.userId`, `notes.kind`, and
 * (for a single listing) `notes.promptId`. So the callback is checked against
 * the order it claims to be for:
 *
 *   1. signature   — the pair is authentic (unchanged)
 *   2. order.status is "paid" — money actually moved, not merely an order
 *      created. `amount_paid` alone was trusted before, and it falls back to
 *      `amount` on an unpaid order.
 *   3. notes.userId === the caller — someone else's order is not your receipt
 *   4. notes.kind matches the endpoint — a single-listing order cannot be
 *      redeemed at the cart endpoint, or the reverse
 *   5. notes.promptId === the listing being claimed (single-listing only) —
 *      this is the check that makes the replay above impossible
 *   6. the order has not already been redeemed — see assertOrderUnused
 *
 * ── Fail closed, and why that is the right trade here ───────────────────────
 *
 * Steps 2-5 need the order, so a failed fetch has to refuse the sale. That is
 * a deliberate choice against the comment that used to sit on this fetch ("a
 * sale must not fail to record because Razorpay's API blinked"): a blink now
 * means one buyer is charged and has to be refunded, where the alternative
 * means anyone who has ever paid ₹10 owns the catalogue. The retry below is
 * there to make the blink case rare — and Razorpay's Orders API being down
 * while its Checkout just succeeded is a narrow window to begin with.
 *
 * Every rejection here is a 400/403 with a stable `error` code, and the caller
 * is expected to let it reach the buyer — a refusal that reads as a generic
 * failure is a refusal support cannot act on.
 */

const crypto = require("crypto");
const Razorpay = require("./razorpay");
const Purchase = require("../models/Purchase");

/* What the buyer is told. The codes stay stable for logs and support; these are
   what reaches a toast, because both checkout screens render
   `data.message || data.error` and a buyer shown the literal string
   "order_prompt_mismatch" learns nothing — the same mistake that once put
   "team_members_cannot_purchase" in front of a user.

   Most of these are unreachable without tampering, so they say so plainly
   rather than inventing a reassuring explanation. `order_lookup_failed` is the
   one a real buyer can hit through no fault of their own, and it is the one
   that has to mention their money. */
const BUYER_MESSAGES = {
  payment_fields_missing: "This payment came back incomplete. Nothing was charged — please try again.",
  invalid_payment_signature: "This payment could not be verified. Nothing has been unlocked.",
  order_lookup_failed:
    "We could not confirm this payment with Razorpay. If your money was taken it will be refunded automatically — please contact support before paying again.",
  order_not_paid: "This order has not been paid, so there is nothing to unlock.",
  order_not_yours: "This payment belongs to a different account.",
  order_kind_mismatch: "This payment does not match this checkout. Please start again.",
  order_prompt_mismatch: "This payment was made for a different product.",
  order_already_redeemed: "This payment has already been used. Check My Products before paying again.",
};

/**
 * The one place that knows what a Razorpay callback body can be called.
 *
 * Six verify endpoints, three different naming conventions, arrived at
 * independently:
 *
 *   camelCase    purchase/verify, cart/verify
 *                  razorpayOrderId / razorpayPaymentId / razorpaySignature
 *   snake_case   hire, services, wallet/add-fund   ← Razorpay's own names
 *                  razorpay_order_id / razorpay_payment_id / razorpay_signature
 *   bare         plans/subscribe/verify
 *                  orderId / paymentId / signature
 *
 * Three of those files then read snake_case off the wire and write camelCase to
 * their model (`deal.razorpayOrderId = razorpay_order_id`), which is what makes
 * the codebase look like it uses both — it does, on purpose, in the same
 * statement.
 *
 * Renaming any of them is a breaking wire change: the field names are what the
 * checkout handlers already POST, and a rename that ships before its frontend
 * turns "verify" into a silent 400 for anyone on a cached bundle. So nothing is
 * renamed. Every endpoint accepts all three spellings and works in ONE
 * canonical shape internally, which is what the inconsistency was actually
 * costing — Razorpay hands its own snake_case names to the browser, so both
 * conventions will always exist somewhere on the path.
 *
 * The DB is left alone too: models/Payment.js stores razorpay_order_id /
 * razorpay_payment_id / razorpay_signature as columns, and renaming those is a
 * data migration on live subscription records, not a code change.
 */
function readPaymentFields(body) {
  const b = body || {};
  const pick = (...names) => {
    for (const n of names) {
      const v = b[n];
      if (v !== undefined && v !== null && String(v) !== "") return String(v);
    }
    return "";
  };

  return {
    razorpayOrderId: pick("razorpayOrderId", "razorpay_order_id", "orderId"),
    razorpayPaymentId: pick("razorpayPaymentId", "razorpay_payment_id", "paymentId"),
    razorpaySignature: pick("razorpaySignature", "razorpay_signature", "signature"),
  };
}

/** A refusal with an HTTP status and a stable code, so handlers can just rethrow. */
class PaymentRejected extends Error {
  constructor(code, status = 400, message = null) {
    super(message || BUYER_MESSAGES[code] || code);
    this.name = "PaymentRejected";
    this.code = code;
    this.status = status;
    /* Separate from `.message` only so a handler can be explicit about which
       string it is putting on the wire. Same value; the intent is that nothing
       reaches a buyer by accident. */
    this.buyerMessage = BUYER_MESSAGES[code] || "This payment could not be completed.";
  }
}

/**
 * The signature check, unchanged in substance and kept here so both endpoints
 * run the identical HMAC. Timing-safe compare because this is a MAC
 * comparison; the leak is theoretical over HTTP but the safe call is free.
 */
function verifySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const given = String(razorpaySignature || "");
  if (
    given.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given))
  ) {
    throw new PaymentRejected("invalid_payment_signature");
  }
}

/* Two retries over ~1.2s. Enough to ride out a dropped connection or a 5xx,
   short enough that the buyer is still watching the spinner. Retried only on
   transport/5xx — a 400 from Razorpay means the order id is wrong, and asking
   again will not change that. */
async function fetchOrder(orderId, attempts = 3) {
  let lastErr = null;

  for (let i = 0; i < attempts; i++) {
    try {
      return await Razorpay.orders.fetch(String(orderId));
    } catch (err) {
      lastErr = err;
      const status = Number(err?.statusCode || err?.status || 0);
      if (status >= 400 && status < 500) break;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 200 * 2 ** i));
    }
  }

  console.error("Razorpay order fetch failed at verify:", lastErr?.message || lastErr);
  throw new PaymentRejected("order_lookup_failed", 502);
}

/**
 * Resolve the callback into the paid order it is actually for.
 *
 * @param {object} p
 * @param {string} p.razorpayOrderId
 * @param {string} p.razorpayPaymentId
 * @param {string} p.razorpaySignature
 * @param {string} p.buyerId   req.user._id — must match notes.userId
 * @param {string} p.kind      "PROMPT_PURCHASE" | "CART_CHECKOUT"
 * @param {string} [p.promptId] required for PROMPT_PURCHASE
 * @returns {Promise<{order: object, amountPaid: number}>} amountPaid in rupees
 */
async function resolvePaidOrder({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  buyerId,
  kind,
  promptId,
}) {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new PaymentRejected("payment_fields_missing");
  }

  verifySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });

  const order = await fetchOrder(razorpayOrderId);

  /* Razorpay order statuses are created → attempted → paid. Only the last one
     means the money is ours; "attempted" is a failed or abandoned card. */
  if (String(order?.status) !== "paid") {
    throw new PaymentRejected("order_not_paid");
  }

  const notes = order?.notes || {};

  if (String(notes.userId || "") !== String(buyerId)) {
    throw new PaymentRejected("order_not_yours", 403);
  }

  /* Orders from the two checkouts are not interchangeable: a cart order has no
     promptId to bind to a listing, so accepting one at the single-listing
     endpoint would skip check 5 entirely. */
  if (String(notes.kind || "") !== String(kind)) {
    throw new PaymentRejected("order_kind_mismatch");
  }

  if (kind === "PROMPT_PURCHASE" && String(notes.promptId || "") !== String(promptId)) {
    throw new PaymentRejected("order_prompt_mismatch");
  }

  /* Rupees. `amount_paid` is the authoritative figure now that the status is
     known to be "paid" — the fall back to `amount` is only for the theoretical
     paid-order-with-zero-amount_paid case, and no longer papers over an unpaid
     order the way it did when this ran without the status check. */
  const paise = Number(order.amount_paid) || Number(order.amount) || 0;

  return { order, amountPaid: +(paise / 100).toFixed(2) };
}

/**
 * One order, one redemption.
 *
 * Local, so it holds even when the checks above cannot run, and it is what
 * stops the narrower version of the same attack: pay for a cheap listing, then
 * redeem that order against an expensive one INSTEAD of the one it was for.
 * The binding check already refuses that; this refuses the second use of an
 * order outright, which is the invariant worth stating on its own.
 *
 * Deliberately not a unique index on Purchase.razorpayOrderId: a cart order
 * legitimately produces one Purchase per line, so uniqueness there would
 * reject every cart of two or more. Call this BEFORE writing any of them.
 *
 * Racy in principle — two simultaneous replays could both read "unused" — but
 * the loser then fails on the (buyer, prompt) duplicate for a single listing,
 * and inside the cart's transaction for a cart. Sequential replay, which is
 * what the attack actually looks like, is closed.
 */
async function assertOrderUnused(razorpayOrderId) {
  const existing = await Purchase.exists({ razorpayOrderId: String(razorpayOrderId) });
  if (existing) throw new PaymentRejected("order_already_redeemed");
}

module.exports = {
  PaymentRejected,
  BUYER_MESSAGES,
  readPaymentFields,
  verifySignature,
  resolvePaidOrder,
  assertOrderUnused,
};
