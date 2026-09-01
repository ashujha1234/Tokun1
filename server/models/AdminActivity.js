/**
 * The audit trail.
 *
 * ── What this is for ────────────────────────────────────────────────────────
 *
 * Tokun holds two parties' money in escrow and decides disputes between them.
 * When a seller says "my ₹40,000 was refunded to the buyer and it should not
 * have been", the answer has to be: this admin, at this time, moved it from
 * this state to that state, for this stated reason.
 *
 * Before this, the only record was the document's current state —
 * `refundStatus: "refunded"` — which says what is true now and nothing about
 * who made it true. That is not a defence, and on a platform that adjudicates
 * other people's money it is the first thing asked for.
 *
 * ── Why before/after and not just a description ─────────────────────────────
 *
 * A human-readable line ("Refund approved") answers the wrong question. The
 * question in a dispute is always what changed, and a prose summary cannot be
 * diffed or trusted six months later. `before` and `after` hold the fields that
 * actually moved, so the row stands on its own without anyone reconstructing
 * intent from wording.
 *
 * ── Append-only, by convention ──────────────────────────────────────────────
 *
 * There is no update or delete path to this collection anywhere in the codebase,
 * and none should be added — a trail that can be edited by the same credential
 * that performs the actions is not evidence.
 *
 * Mongo cannot enforce that from the schema. If this ever needs to be real
 * rather than conventional, the enforcement point is Atlas: put this collection
 * behind a database user with insert-only privileges, or in its own database
 * with its own user. Noted here because it is the question a compliance review
 * opens with, and the answer today is "convention".
 */

const mongoose = require("mongoose");

const adminActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        // ── Money decisions. These are the ones that exist for disputes. ──
        "ESCROW_RELEASED",       // hold let go to the seller/freelancer
        "ESCROW_SETTLED",        // dispute decided: who got paid, how much
        "ESCROW_REFUNDED",       // hold returned to the buyer
        "REFUND_APPROVED",
        "REFUND_REJECTED",
        "DISPUTE_RESOLVED",
        "PAYOUT_FAILED",

        // ── Account actions taken ON a user by staff ──
        "USER_SUSPENDED",
        "USER_REINSTATED",
        "LISTING_SUSPENDED",
        "PRODUCT_FLAGGED",
        "PRODUCT_APPROVED",

        // ── Pre-existing types, kept so old rows stay valid ──
        "USER_REGISTERED",
        "USER_LOGIN",
        "PRODUCT_PURCHASED",
        "REPORT_CREATED",
        "VIDEO_CALL_STARTED",
        "VIDEO_CALL_ENDED",
        "POLICY_UPDATE",
        "OTHER",
      ],
      default: "OTHER",
    },

    title: { type: String, required: true },
    description: { type: String, default: "" },

    /* actorId has no `ref`. It used to say ref: "User", which was wrong for
       every row that matters: staff live in the AdminUser collection, not User,
       so populate() looked in the wrong place and came back empty. actorType
       records which collection the id belongs to — and "system" covers the cron
       jobs, which are genuine actors here (three of them release escrow) and
       have no id at all. */
    actorType: {
      type: String,
      enum: ["AdminUser", "User", "system"],
      default: null,
    },
    actorId: { type: mongoose.Schema.Types.ObjectId, default: null },
    actorName: { type: String, default: null },

    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    targetType: { type: String, default: null },
    targetName: { type: String, default: null },

    /* Only the fields that moved, not whole documents — a full snapshot of a
       HireDeal would bury the two numbers anyone actually reads. */
    before: { type: mongoose.Schema.Types.Mixed, default: null },
    after: { type: mongoose.Schema.Types.Mixed, default: null },

    /* The reason the actor gave, where the flow captures one (dispute notes,
       refund admin notes). Separate from `description`, which this file writes;
       this is the human's own words and is quoted back in a dispute. */
    reason: { type: String, default: null },

    /* Amounts denormalised out of `meta` so they can be summed and filtered
       without unpacking Mixed. Null where the action moved no money. */
    amount: { type: Number, default: null },
    currency: { type: String, default: "INR" },

    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

adminActivitySchema.index({ createdAt: -1 });
adminActivitySchema.index({ type: 1, createdAt: -1 });

/* "Show me everything that happened to this deal" — the query a dispute
   actually starts from, and the one that would otherwise scan the collection. */
adminActivitySchema.index({ targetId: 1, createdAt: -1 });

/* "What has this admin done" — asked when an account is suspected, and the
   reason the actor is recorded at all. */
adminActivitySchema.index({ actorId: 1, createdAt: -1 });

module.exports = mongoose.model("AdminActivity", adminActivitySchema);
