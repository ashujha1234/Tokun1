// What an invoice actually SAYS, per kind of purchase.
//
// Every invoice used to open with the same line — "This is your invoice for
// your recent purchase from Tokun.World" — regardless of whether the buyer had
// downloaded a prompt, booked a fixed-scope service, or funded a custom
// project. Those are three genuinely different transactions with three
// different answers to the only questions an invoice gets asked afterwards:
// what did I get, and can I get my money back?
//
//   prompt   — delivered instantly, nothing is held, refunds are a 24h window
//              (the KEY stays `prompt` — it is a stored value on every
//               purchase; only the words shown to a buyer say "product")
//   service  — money held by Tokun until the work is approved
//   hire     — held the same way, but scoped by a brief rather than a listing
//
// Written without the word "escrow", here and in every other template. It is
// the correct term and the wrong word for the audience: an invoice is the one
// document a buyer keeps, and "your money is in escrow" is a sentence a first
// time buyer has to go and look up. "Tokun holds this payment until you approve
// the delivery" says the same thing and needs no glossary.
//
// Kept in one file so the emailed body and the attached PDF can never drift
// into telling the buyer two different things about the same payment — which is
// exactly what happened with the GST line.

const INVOICE_COPY = {
  prompt: {
    intro:
      "This is your invoice for a product you purchased on Tokun.World. It's available in your library straight away.",
    note:
      "Products are delivered instantly, so this payment is final once made. If something is genuinely wrong with what you received, you can raise a refund request from Orders within 24 hours of purchase.",
    lineLabel: "Product",
  },

  service: {
    intro:
      "This is your invoice for a service you booked on Tokun.World. Your payment is held securely by Tokun until you approve the delivered work.",
    note:
      "Tokun holds this payment — the creator is not paid until you approve the delivery, or until 72 hours after they submit it if you take no action. Revisions and cancellation terms are as stated on the booking; see tokun.world/refund-policy.",
    lineLabel: "Service",
  },

  hire: {
    intro:
      "This is your invoice for a project you funded on Tokun.World. Your payment is held securely by Tokun until you approve the delivered work.",
    note:
      "Tokun holds this payment — the freelancer is not paid until you approve the delivery, or until 72 hours after they submit it if you take no action. If the project is cancelled after work has started, the payment is split according to how much was completed; see tokun.world/refund-policy.",
    lineLabel: "Project",
  },

  // Subscriptions already carry their own plan card and intro line, so this is
  // only the fallback shape.
  default: {
    intro: "This is your invoice for your recent purchase from Tokun.World.",
    note: "",
    lineLabel: "Item",
  },
};

function getInvoiceCopy(kind) {
  return INVOICE_COPY[String(kind || "").toLowerCase()] || INVOICE_COPY.default;
}

module.exports = { INVOICE_COPY, getInvoiceCopy };
