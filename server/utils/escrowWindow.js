// The hard ceiling on how long escrowed money can sit, and the delivery times
// that fit inside it.
//
// Razorpay will hold a Route transfer for at most 90 DAYS from the payment.
// That is not our rule and we cannot extend it — past that point the hold is
// no longer ours to rely on, so every booking has to reach a decision (release,
// refund or split) before it.
//
// Everything below works backwards from that one number:
//
//   90 days total hold
//    − 60 days  longest delivery a seller may promise
//    = 30 days  left for review, revisions, and a dispute
//
// 60 is therefore not a product preference, it's what's left after reserving a
// realistic tail. A 90-day delivery would use the entire window and leave zero
// room for the client to even look at the work.

const RAZORPAY_MAX_HOLD_DAYS = 90;

// The longest delivery a seller can offer. Anything longer cannot be honoured
// inside the escrow window.
const MAX_DELIVERY_DAYS = 60;

// How long before the hold lapses we start treating an order as urgent —
// admin sees it, both parties are told. A week is enough for a human to chase
// the other side or arbitrate.
const ESCROW_WARNING_DAYS = 7;

// The picker's options, and the source of truth for validating what comes back.
// Duplicated as display strings on the client, which is why the parser below
// accepts the text form rather than a separate numeric field.
const DELIVERY_OPTIONS = [
  "1 Day Delivery",
  "3 Days Delivery",
  "7 Days Delivery",
  "14 Days Delivery",
  "21 Days Delivery",
  "30 Days Delivery",
  "45 Days Delivery",
  "60 Days Delivery",
];

/**
 * Days out of a "14 Days Delivery" style string.
 * @returns {number|null} null when there's no number in it at all
 */
function parseDeliveryDays(deliveryText) {
  const match = String(deliveryText || "").match(/\d+/);
  if (!match) return null;
  const days = Number(match[0]);
  return Number.isFinite(days) && days > 0 ? days : null;
}

/**
 * Is this delivery promise one we can actually back with escrow?
 *
 * An empty value passes: `delivery` is optional on a service, and refusing to
 * save a listing because the seller left it blank would be a new restriction,
 * not a safety check.
 */
function validateDeliveryText(deliveryText) {
  if (!String(deliveryText || "").trim()) return { ok: true, days: null };

  const days = parseDeliveryDays(deliveryText);
  if (days === null) return { ok: true, days: null };

  if (days > MAX_DELIVERY_DAYS) {
    return {
      ok: false,
      days,
      error: "delivery_too_long",
      message: `Delivery can be at most ${MAX_DELIVERY_DAYS} days. Payments are held in escrow for a maximum of ${RAZORPAY_MAX_HOLD_DAYS} days, and the rest of that window is reserved for review and revisions. For longer work, split it into milestones.`,
    };
  }

  return { ok: true, days };
}

/**
 * Same check for a hire deal, which carries a target DATE rather than a
 * duration.
 *
 * @param {Date|string} targetDate
 * @param {Date} [from] defaults to now — pass the payment date when validating
 *                     an existing deal rather than a new proposal
 */
function validateTargetDate(targetDate, from = new Date()) {
  if (!targetDate) return { ok: true, days: null };

  const target = new Date(targetDate);
  if (Number.isNaN(target.getTime())) {
    return { ok: false, error: "invalid_target_date", message: "That delivery date isn't valid." };
  }

  const days = Math.ceil((target - from) / (24 * 60 * 60 * 1000));
  if (days > MAX_DELIVERY_DAYS) {
    return {
      ok: false,
      days,
      error: "delivery_too_long",
      message: `The delivery date can be at most ${MAX_DELIVERY_DAYS} days out. Payments are held in escrow for a maximum of ${RAZORPAY_MAX_HOLD_DAYS} days, and the rest is reserved for review and revisions. For longer work, split it into milestones.`,
    };
  }

  return { ok: true, days };
}

/** When this order's escrow stops being holdable. Computed from the payment. */
function escrowExpiryFrom(paidAt) {
  const base = paidAt ? new Date(paidAt) : new Date();
  return new Date(base.getTime() + RAZORPAY_MAX_HOLD_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * When the seller has to have delivered by.
 *
 * The clock starts at PAYMENT, not at the seller pressing "Start work" — the
 * buyer has paid and the promise on the listing was "7 Days Delivery", so the
 * seller sitting on the order can't quietly extend it.
 *
 * @returns {Date|null} null when the listing promised no specific number of
 *   days, in which case there is no deadline to enforce. Orders booked before
 *   this existed have no snapshot either, and must not retroactively gain one.
 */
function deliveryDueFrom(paidAt, deliveryDays) {
  const days = Number(deliveryDays);
  if (!Number.isFinite(days) || days <= 0) return null;

  const base = paidAt ? new Date(paidAt) : new Date();
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}

/** Past the promised delivery date, with nothing delivered yet. */
function isDeliveryOverdue(order, now = new Date()) {
  if (!order?.deliveryDueAt) return false;
  return new Date(order.deliveryDueAt).getTime() < now.getTime();
}

function daysUntil(date) {
  if (!date) return null;
  return Math.ceil((new Date(date) - Date.now()) / (24 * 60 * 60 * 1000));
}

module.exports = {
  RAZORPAY_MAX_HOLD_DAYS,
  MAX_DELIVERY_DAYS,
  ESCROW_WARNING_DAYS,
  DELIVERY_OPTIONS,
  parseDeliveryDays,
  validateDeliveryText,
  validateTargetDate,
  escrowExpiryFrom,
  deliveryDueFrom,
  isDeliveryOverdue,
  daysUntil,
};
