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
//   service  — money held in escrow until the work is approved
//   hire     — same escrow, but scoped by a brief rather than a listing
//
// Kept in one file so the emailed body and the attached PDF can never drift
// into telling the buyer two different things about the same payment — which is
// exactly what happened with the GST line.

const INVOICE_COPY = {
  prompt: {
    intro:
      "This is your invoice for a prompt you purchased on Tokun.World. It's available in your library straight away.",
    note:
      "Prompts are delivered instantly, so this payment is final once made. If something is genuinely wrong with what you received, you can raise a refund request from Orders within 24 hours of purchase.",
    lineLabel: "Prompt",
  },

  service: {
    intro:
      "This is your invoice for a service you booked on Tokun.World. Your payment is held securely by Tokun until you approve the delivered work.",
    note:
      "Tokun holds this payment in escrow — the creator is not paid until you approve the delivery, or until 72 hours after they submit it if you take no action. Revisions and cancellation terms are as stated on the booking; see tokun.world/refund-policy.",
    lineLabel: "Service",
  },

  hire: {
    intro:
      "This is your invoice for a project you funded on Tokun.World. Your payment is held securely by Tokun until you approve the delivered work.",
    note:
      "Tokun holds this payment in escrow — the freelancer is not paid until you approve the delivery, or until 72 hours after they submit it if you take no action. If the project is cancelled after work has started, the payment is split according to how much was completed; see tokun.world/refund-policy.",
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
