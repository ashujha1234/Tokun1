/**
 * The payment facts an invoice has to carry, fetched from the gateway.
 *
 * ── Why these are not already on the order ──────────────────────────────────
 *
 * The order models store `razorpayOrderId` and `razorpayPaymentId` and nothing
 * else about the payment. How it was actually paid — card, UPI, netbanking,
 * wallet — is only ever known to Razorpay, and it is the first thing anyone
 * asks when an invoice has to be matched against a bank or card statement.
 *
 * ── Why a fetch, and why it never throws ────────────────────────────────────
 *
 * One call per invoice, off the response path. If Razorpay is slow or the id is
 * missing, the invoice still has to go out: an invoice without a payment method
 * is incomplete, an invoice that never arrives is a support ticket. So every
 * failure returns what is known from the order and omits the rest, and the
 * renderers drop empty rows rather than printing "Method: undefined".
 */

/* Razorpay's `method` is a lowercase token. These are the words a person would
   use for the same thing on their own statement. An unknown method is title-
   cased rather than dropped — a new payment type should show up as itself, not
   disappear. */
const METHOD_LABEL = {
  card: "Card",
  upi: "UPI",
  netbanking: "Netbanking",
  wallet: "Wallet",
  emi: "EMI",
  paylater: "Pay Later",
  bank_transfer: "Bank transfer",
};

const titleCase = (s) =>
  String(s || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * @param {string} paymentId  razorpay_payment_id as stored on the order
 * @returns {Promise<{method: string, methodDetail: string, currency: string, gatewayId: string}>}
 *   Every field is a string, "" when unknown.
 */
async function fetchPaymentDetails(paymentId) {
  const empty = { method: "", methodDetail: "", currency: "", gatewayId: String(paymentId || "") };
  if (!paymentId) return empty;

  try {
    /* Required here, not at the top. utils/razorpay.js throws on load when the
       keys are absent, and that would take this whole module with it —
       including invoiceDetailRows(), which is pure and has no business needing
       a gateway to build a list of labels. */
    const razorpay = require("../utils/razorpay");
    const p = await razorpay.payments.fetch(String(paymentId));
    const method = METHOD_LABEL[p?.method] || titleCase(p?.method);

    /* The bit that makes a line on a statement identifiable: the last four of
       the card, or the UPI handle, or the bank. Nothing that identifies the
       instrument beyond what the payer's own statement already shows. */
    let detail = "";
    if (p?.method === "card" && p?.card) {
      const brand = titleCase(p.card.network || "");
      detail = [brand, p.card.last4 ? `•••• ${p.card.last4}` : ""].filter(Boolean).join(" ");
    } else if (p?.method === "upi") {
      detail = p?.vpa || "";
    } else if (p?.method === "netbanking") {
      detail = p?.bank || "";
    } else if (p?.method === "wallet") {
      detail = titleCase(p?.wallet || "");
    }

    return {
      method,
      methodDetail: detail,
      currency: String(p?.currency || ""),
      gatewayId: String(p?.id || paymentId || ""),
    };
  } catch (err) {
    // Logged, not surfaced — see the header.
    console.error(`paymentDetails: fetch failed for ${paymentId}:`, err.message);
    return empty;
  }
}

/**
 * The rows an invoice shows, ready for the PDF and the email body.
 *
 * Built here rather than at each call site so the emailed invoice and its own
 * attached PDF cannot list different things — they are one document, and people
 * do hold them side by side.
 *
 * Empty values are dropped by both renderers, so a field nobody could determine
 * costs a row rather than printing a blank one.
 *
 * NOTE on what is deliberately absent: an invoice is issued when the payment is
 * captured, which is BEFORE any work exists. The delivery date and the
 * review-window dates are therefore unknown at this point and are not invented
 * here — they belong on the order page and in the delivery emails, which is
 * where they are actually true.
 */
function invoiceDetailRows({ payment, orderId, orderKind, projectTitle, currencyAmount, purchasedAt }) {
  /* What the thing bought is CALLED. Unlike the id label below, this one does
     vary by kind, and has to: a prompt is a product someone downloaded, and
     labelling it "Project" reads as though they commissioned it. */
  const titleLabel =
    { prompt: "Product", service: "Service", hire: "Project" }[orderKind] || "Item";

  /* The date the money moved, spelled out rather than left to the invoice
     header's dd/mm/yyyy. This is what a refund email is matched against months
     later — "you were charged on 16 Sept, refunded on 22 Sept" — so the two
     documents say it the same way. */
  const paidOn = purchasedAt
    ? new Date(purchasedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
  /* "Order ID" on every kind, deliberately.
     It was "Project ID" for hire and "Booking ID" for service, which reads fine
     on its own document and badly across a set of them: a person with an
     invoice, a refund email and a support thread open is matching ONE number,
     and three names for it makes them check whether it is the same number. */
  return [
    { label: titleLabel, value: projectTitle || "" },
    { label: "Order ID", value: orderId ? String(orderId) : "" },
    { label: "Purchase date", value: paidOn },
    { label: "Payment method", value: [payment?.method, payment?.methodDetail].filter(Boolean).join(" · ") },
    /* Separate from the invoice number on purpose: the invoice number is ours,
       this is the gateway's, and reconciling a Razorpay settlement against our
       books needs the gateway's. */
    { label: "Transaction ID", value: payment?.gatewayId || "" },
    { label: "Amount paid", value: currencyAmount || "" },
  ];
}

module.exports = { fetchPaymentDetails, invoiceDetailRows };
