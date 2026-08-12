const mongoose = require("mongoose");

/**
 * Every webhook Razorpay sends us, stored raw.
 *
 * Two jobs:
 *
 *  1. Idempotency. Razorpay retries an event until it gets a 200, and our own
 *     /verify-payment call can race the webhook for the same payment. The
 *     unique index on eventId is what stops the same event being acted on
 *     twice.
 *
 *  2. Audit. When a payment is disputed months later, "what did Razorpay
 *     actually tell us, and when" is a question only the raw payload can
 *     answer. Previously every event was processed and thrown away — anything
 *     we didn't have a handler for left no trace at all.
 *
 * Rows are never edited except to move `status` forward. Treat as append-only.
 */
const WebhookEventSchema = new mongoose.Schema(
  {
    /* Razorpay's own event id (`x-razorpay-event-id` header). Unique, but
       sparse: very old events and any locally-replayed payload may not carry
       one, and those must still be stored rather than rejected. */
    eventId: { type: String, index: true, unique: true, sparse: true },

    /* e.g. "payment.captured", "refund.processed", "transfer.processed". */
    event: { type: String, required: true, index: true },

    /* Whether we did anything with it. `ignored` is a real outcome, not a
       failure — most events are ones we deliberately don't act on. */
    status: {
      type: String,
      enum: ["received", "processed", "ignored", "failed"],
      default: "received",
      index: true,
    },

    /* Set when status is "failed" — the error, so a retry can be reasoned
       about instead of guessed at. */
    error: { type: String, default: "" },

    /* Razorpay's timestamp for the event itself (`created_at`, seconds).
       Distinct from createdAt below, which is when WE received it — the gap
       between the two is exactly what you want during an incident. */
    occurredAt: { type: Date, default: null, index: true },

    /* The entity ids we could pull out, so an event can be found without
       digging through the payload. All optional — which ones exist depends
       entirely on the event type. */
    paymentId: { type: String, default: "", index: true },
    orderId: { type: String, default: "", index: true },
    refundId: { type: String, default: "", index: true },
    transferId: { type: String, default: "", index: true },

    /* The payload exactly as it arrived. Mixed because Razorpay's shape
       differs per event and coercing it to a schema would lose the parts we
       didn't anticipate — which are the parts worth keeping. */
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },

    /**
     * When this row may be deleted. Null means never.
     *
     * With every event type subscribed, most of what arrives is traffic we
     * deliberately don't act on — order.paid, invoice.*, subscription.*,
     * payout.* — and each one carries a full payload. Kept forever that's a
     * collection which only grows, dominated by rows nobody will ever read.
     *
     * So: events we ACTED on (processed) or that BROKE (failed) are kept
     * indefinitely, because those are the ones an audit or an incident needs.
     * Events we ignored get a date here and MongoDB removes them on its own.
     *
     * A partial TTL index would express this more directly but isn't
     * dependable across MongoDB versions; a nullable date plus
     * `expireAfterSeconds: 0` is the portable way to say the same thing —
     * documents with no date are simply never considered.
     */
    expiresAt: { type: Date, default: null, index: { expires: 0 } },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WebhookEvent", WebhookEventSchema);
