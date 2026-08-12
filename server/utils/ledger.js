const LedgerEntry = require("../models/LedgerEntry");

/**
 * Writing to the money ledger, safely.
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE: bookkeeping must never break a
 * payment. Every function here swallows its own errors and returns null. A
 * checkout that succeeded at Razorpay but failed to write a ledger row is a
 * reporting gap we can backfill; a checkout that threw because of a ledger row
 * is a customer who paid and got nothing.
 *
 * The same reasoning is already applied elsewhere in this codebase — see the
 * delivery-receipt and attachment-broadcast blocks, both deliberately
 * non-fatal.
 */

/** Rupees → paise. The ledger stores integers only; see LedgerEntry.amount. */
const toPaise = (rupees) => Math.round(Number(rupees || 0) * 100);

/** Razorpay's `created_at` is unix seconds. */
const fromUnix = (seconds) =>
  seconds ? new Date(Number(seconds) * 1000) : new Date();

/**
 * A readable label for how something was paid, from Razorpay's payment entity.
 * Best-effort — every branch is optional in their payload.
 */
function describeMethod(payment = {}) {
  const method = payment.method || "";
  if (method === "card" && payment.card) {
    const network = payment.card.network || "Card";
    const last4 = payment.card.last4 ? ` ••${payment.card.last4}` : "";
    return `${network}${last4}`;
  }
  if (method === "upi") return payment.vpa || "UPI";
  if (method === "netbanking") return payment.bank || "Netbanking";
  if (method === "wallet") return payment.wallet || "Wallet";
  return method;
}

/**
 * The identity of a row, as one string. See LedgerEntry.dedupeKey.
 *
 * Two different rules, because the two families of row mean different things:
 *
 *   PAYMENT / REFUND / SETTLEMENT — a movement between Razorpay and a
 *   customer or us. Razorpay's own id IS the identity. One payment is one row
 *   no matter how many prompts were in the cart, and no matter how many times
 *   the webhook is retried or which side wrote it first.
 *
 *   TRANSFER / TRANSFER_HOLD / PAYOUT — a movement to ONE seller. A cart split
 *   across three sellers is three of these against a single payment id, so the
 *   payment alone can't identify them. A Route transfer has its own id; a
 *   wallet payout has none, and is identified by which purchase it settled.
 *
 * Returns null for rows that shouldn't be deduped at all (manual corrections,
 * or anything with nothing stable to key on).
 */
function dedupeKeyFor(entry = {}) {
  const {
    kind,
    razorpayPaymentId = "",
    razorpayRefundId = "",
    razorpayTransferId = "",
    razorpaySettlementId = "",
    purchase,
  } = entry;

  if (kind === "PAYMENT") return razorpayPaymentId ? `PAYMENT:${razorpayPaymentId}` : null;
  if (kind === "REFUND") return razorpayRefundId ? `REFUND:${razorpayRefundId}` : null;
  if (kind === "SETTLEMENT")
    return razorpaySettlementId ? `SETTLEMENT:${razorpaySettlementId}` : null;

  if (["TRANSFER", "TRANSFER_HOLD", "PAYOUT"].includes(kind)) {
    if (razorpayTransferId) return `${kind}:${razorpayTransferId}`;
    // No transfer id — a wallet payout. The purchase is what makes it unique.
    if (purchase) return `${kind}:${razorpayPaymentId || "none"}:${String(purchase)}`;
    return null;
  }

  return null;
}

/**
 * Insert one ledger row.
 *
 * Returns the row, or null if it was a duplicate or the write failed. Callers
 * are not expected to check — the point is that they can call this and carry
 * on regardless.
 */
async function record(entry) {
  try {
    return await LedgerEntry.create({
      ...entry,
      dedupeKey: entry.dedupeKey ?? dedupeKeyFor(entry),
    });
  } catch (err) {
    // 11000 = duplicate key, i.e. this exact fact is already recorded. That's
    // the natural-key index doing its job against a webhook retry or a
    // backfill overlapping live data — expected, not an error.
    if (err?.code === 11000) return null;
    console.error("ledger.record failed:", err?.message, {
      kind: entry?.kind,
      paymentId: entry?.razorpayPaymentId,
    });
    return null;
  }
}

/**
 * A captured payment, from Razorpay's payment entity.
 *
 * `fee` and `tax` are what Razorpay charged US for accepting the money. They
 * are only present once the payment is captured, which is why this is recorded
 * from the webhook rather than at order-creation time.
 */
async function recordPayment(payment = {}, extra = {}) {
  if (!payment?.id) return null;
  return record({
    kind: "PAYMENT",
    direction: "IN",
    purpose: extra.purpose || payment.notes?.kind || "OTHER",
    amount: Number(payment.amount || 0),
    fee: Number(payment.fee || 0),
    tax: Number(payment.tax || 0),
    currency: payment.currency || "INR",
    occurredAt: fromUnix(payment.created_at),
    razorpayPaymentId: payment.id,
    razorpayOrderId: payment.order_id || "",
    method: payment.method || "",
    methodDetail: describeMethod(payment),
    source: extra.source || "webhook",
    user: extra.user || null,
    counterparty: extra.counterparty || null,
    purchase: extra.purchase || null,
    hireDeal: extra.hireDeal || null,
    serviceOrder: extra.serviceOrder || null,
    prompt: extra.prompt || null,
    meta: {
      email: payment.email || "",
      contact: payment.contact || "",
      status: payment.status || "",
      ...(extra.meta || {}),
    },
  });
}

/**
 * A refund, from Razorpay's refund entity.
 *
 * Recorded regardless of where it was initiated — including the Razorpay
 * dashboard. That case is precisely the one the old setup had no record of:
 * the money left, and nothing in our database knew.
 */
async function recordRefund(refund = {}, extra = {}) {
  if (!refund?.id) return null;
  return record({
    kind: "REFUND",
    direction: "OUT",
    purpose: extra.purpose || refund.notes?.kind || "OTHER",
    amount: Number(refund.amount || 0),
    currency: refund.currency || "INR",
    occurredAt: fromUnix(refund.created_at),
    razorpayRefundId: refund.id,
    razorpayPaymentId: refund.payment_id || "",
    source: extra.source || "webhook",
    user: extra.user || null,
    counterparty: extra.counterparty || null,
    purchase: extra.purchase || null,
    hireDeal: extra.hireDeal || null,
    serviceOrder: extra.serviceOrder || null,
    prompt: extra.prompt || null,
    meta: {
      status: refund.status || "",
      speed: refund.speed_processed || refund.speed_requested || "",
      // Where it came from matters: a refund we didn't initiate is worth
      // noticing, and this is the only field that can tell you afterwards.
      initiatedBy: extra.initiatedBy || "unknown",
      ...(extra.meta || {}),
    },
  });
}

/**
 * A Route transfer — money moving to a seller's linked account.
 *
 * `on_hold` transfers are the escrow case: the money is committed but not yet
 * the seller's. Recorded under a distinct kind so a payout total doesn't count
 * money still sitting in escrow.
 */
async function recordTransfer(transfer = {}, extra = {}) {
  if (!transfer?.id) return null;
  const held = !!transfer.on_hold;
  return record({
    kind: held ? "TRANSFER_HOLD" : "TRANSFER",
    direction: "OUT",
    purpose: extra.purpose || transfer.notes?.kind || "OTHER",
    amount: Number(transfer.amount || 0),
    fee: Number(transfer.fees || 0),
    tax: Number(transfer.tax || 0),
    currency: transfer.currency || "INR",
    occurredAt: fromUnix(transfer.created_at),
    razorpayTransferId: transfer.id,
    razorpayPaymentId: transfer.source || "",
    source: extra.source || "webhook",
    user: extra.user || null,
    counterparty: extra.counterparty || null,
    purchase: extra.purchase || null,
    hireDeal: extra.hireDeal || null,
    serviceOrder: extra.serviceOrder || null,
    meta: {
      status: transfer.status || "",
      recipient: transfer.recipient || "",
      onHold: held,
      ...(extra.meta || {}),
    },
  });
}

/** A settlement — Razorpay paying out to Tokun's own bank account. */
async function recordSettlement(settlement = {}, extra = {}) {
  if (!settlement?.id) return null;
  return record({
    kind: "SETTLEMENT",
    direction: "IN",
    purpose: "OTHER",
    amount: Number(settlement.amount || 0),
    fee: Number(settlement.fees || 0),
    tax: Number(settlement.tax || 0),
    currency: "INR",
    occurredAt: fromUnix(settlement.created_at),
    razorpaySettlementId: settlement.id,
    source: extra.source || "webhook",
    meta: { status: settlement.status || "", ...(extra.meta || {}) },
  });
}

module.exports = {
  record,
  dedupeKeyFor,
  recordPayment,
  recordRefund,
  recordTransfer,
  recordSettlement,
  toPaise,
  fromUnix,
  describeMethod,
};
