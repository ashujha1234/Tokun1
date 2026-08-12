const mongoose = require("mongoose");

/**
 * Append-only record of every movement of money, in our own database.
 *
 * Why this exists: the admin Payments screen reads Razorpay's API live, so
 * nothing about a payment was ever stored here — not the gateway fee, not the
 * method, not the refund. That has three consequences we've already felt or
 * will:
 *
 *   - A refund issued from the Razorpay dashboard leaves no trace in our data,
 *     so it shows on the Payments screen and nowhere else.
 *   - Historical reporting depends on Razorpay's API still returning records
 *     from that far back, and on their API being up at all.
 *   - Reconciliation and GST need what was true at the moment of the event,
 *     not a re-read that reflects today's state.
 *
 * Rows are INSERTED, never updated. A correction is a new row, the same way a
 * ledger works on paper. That is what makes it trustworthy months later.
 */
const LedgerEntrySchema = new mongoose.Schema(
  {
    /* What moved. Deliberately coarse — the detail lives in the fields below
       and in `meta`, and a short enum stays readable in a query. */
    kind: {
      type: String,
      enum: [
        "PAYMENT",      // buyer paid us
        "REFUND",       // we paid a buyer back
        "TRANSFER",     // money routed to a seller's linked account
        "TRANSFER_HOLD",// transfer created but held (escrow)
        "SETTLEMENT",   // Razorpay settled to our bank
        "COMMISSION",   // our cut, recognised
        "PAYOUT",       // wallet withdrawal to a seller
        "ADJUSTMENT",   // manual correction
      ],
      required: true,
      index: true,
    },

    /* What the money was for, so a row can be grouped without joining. Mirrors
       the `notes.kind` we already put on Razorpay orders. */
    purpose: {
      type: String,
      enum: [
        "PROMPT_PURCHASE",
        "HIRE_ESCROW",
        "SERVICE_ORDER",
        "SUBSCRIPTION",
        "WALLET_TOPUP",
        "OTHER",
      ],
      default: "OTHER",
      index: true,
    },

    /* IN  = money arriving at Tokun
       OUT = money leaving Tokun
       Kept explicit rather than inferred from `kind`, because a REFUND is OUT
       and a reversed transfer is IN, and inferring that at read time is how
       totals end up wrong. */
    direction: { type: String, enum: ["IN", "OUT"], required: true },

    /* All money in PAISE, integer. Rupee floats do not survive being summed —
       ₹0.1 + ₹0.2 is not ₹0.3 in IEEE754, and this is a ledger. */
    amount: { type: Number, required: true },
    /* Razorpay's cut on this transaction, and the tax on that cut. Zero when
       not applicable or not reported. */
    fee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },

    /* When the money actually moved, per the payment provider — NOT when we
       wrote the row. `createdAt` below records the latter. During an outage or
       a backfill these are days apart, and only this one is the truth. */
    occurredAt: { type: Date, required: true, index: true },

    /* Razorpay identifiers. Whichever apply to this row. */
    razorpayPaymentId: { type: String, default: "", index: true },
    razorpayOrderId: { type: String, default: "", index: true },
    razorpayRefundId: { type: String, default: "", index: true },
    razorpayTransferId: { type: String, default: "", index: true },
    razorpaySettlementId: { type: String, default: "", index: true },

    /* How it was paid, captured at the time. Razorpay keeps this too, but only
       for as long as their retention allows. */
    method: { type: String, default: "" },          // card | upi | netbanking | wallet
    methodDetail: { type: String, default: "" },    // "Visa ••4242", "hdfc", vpa

    /* Our own side of the world, so a row can be traced back to what it was
       for without going through Razorpay's `notes`. */
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    counterparty: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    purchase: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase", default: null, index: true },
    hireDeal: { type: mongoose.Schema.Types.ObjectId, ref: "HireDeal", default: null, index: true },
    serviceOrder: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceOrder", default: null, index: true },
    prompt: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", default: null },

    /* Where the row came from. `webhook` is authoritative; `api` is our own
       code recording what it just did; `backfill` is reconstructed after the
       fact and is the one to distrust first when numbers disagree. */
    source: {
      type: String,
      enum: ["webhook", "api", "backfill", "manual"],
      required: true,
      index: true,
    },

    /**
     * The row's identity, as a single string. Built by utils/ledger.js —
     * see dedupeKeyFor() there for the rules.
     *
     * A composite index over the id columns can't express this correctly,
     * because the right key differs by kind:
     *
     *   - One Razorpay payment is ONE payment, however many prompts were in the
     *     cart. Keying on the purchase would record the same ₹900 three times.
     *   - But a wallet payout has no Razorpay id of its own, and a cart with
     *     three sellers produces three genuinely different payouts against that
     *     same payment id. Keying on the payment alone would drop two of them.
     *
     * Sparse: manual adjustments carry no key and are never deduped.
     */
    dedupeKey: { type: String, default: null, unique: true, sparse: true },

    /* Free-form extras — the bits worth keeping that don't deserve a column.
       Never read for arithmetic. */
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

/* The two queries the admin screen actually makes. */
LedgerEntrySchema.index({ occurredAt: -1, kind: 1 });
LedgerEntrySchema.index({ purpose: 1, occurredAt: -1 });

module.exports = mongoose.model("LedgerEntry", LedgerEntrySchema);
