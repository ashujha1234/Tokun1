const mongoose = require("mongoose");

/**
 * A rating deduction an admin applied to a creator.
 *
 * Kept as its own collection rather than a number on User, because a rating
 * that quietly drops is worse than no penalty at all — nobody can appeal a
 * decision they can't see. Every deduction here records who applied it, why,
 * and which refund or dispute it came out of, and can be revoked without
 * losing the record that it happened.
 *
 * It is never applied automatically. A refund on its own does not mean the
 * creator did anything wrong — a buyer can change their mind, a product can be
 * fine and simply not what someone expected. An admin looks at the case and
 * decides; this is the instrument they use, not a rule that fires by itself.
 *
 * The effect lives in utils/sellerRating.js: active penalties are subtracted
 * from the creator's review average when it's recomputed.
 */
const RatingPenaltySchema = new mongoose.Schema(
  {
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    /* How many stars come off. Fractional on purpose — half a star is a
       meaningful correction for a single bad order, while a whole star on a
       creator with three reviews is close to a ban. */
    stars: { type: Number, required: true, min: 0.1, max: 5 },

    /* Shown to the creator verbatim in the email and their notification. A
       deduction with no stated reason is indistinguishable from a bug. */
    reason: { type: String, required: true, trim: true, maxlength: 1000 },

    /* What this came out of, so the penalty can be read back against the case
       it belongs to and so the same refund can't be penalised twice by two
       admins who didn't know about each other. */
    context: {
      kind: {
        type: String,
        enum: ["refund", "dispute", "manual"],
        required: true,
      },
      refundRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "RefundRequest", default: null },
      disputeId: { type: mongoose.Schema.Types.ObjectId, ref: "EscrowDispute", default: null },
      // "hire" | "service" — which side of the business the fault was on.
      orderKind: { type: String, default: null },
      orderId: { type: mongoose.Schema.Types.ObjectId, default: null },
      promptId: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", default: null },
      // Snapshot: what the order or product was called at the time.
      title: { type: String, default: "" },
    },

    appliedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null },
    appliedByAdminEmail: { type: String, default: "" },

    /* Revoked rather than deleted. An admin who over-penalised should be able
       to undo the effect while leaving the fact on the record — for the next
       admin, and for the creator who asked for it to be reviewed. */
    active: { type: Boolean, default: true, index: true },
    revokedAt: { type: Date, default: null },
    revokedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null },
    revokeReason: { type: String, default: "", trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// The creator's profile read: "what is currently coming off this person".
RatingPenaltySchema.index({ creatorId: 1, active: 1 });

/* One live penalty per refund, and one per dispute. Two admins working the same
   queue could otherwise both dock the same creator for the same order. Sparse
   and partial so manual penalties — which have neither id — are unaffected. */
RatingPenaltySchema.index(
  { "context.refundRequestId": 1 },
  {
    unique: true,
    partialFilterExpression: {
      "context.refundRequestId": { $type: "objectId" },
      active: true,
    },
  }
);

RatingPenaltySchema.index(
  { "context.disputeId": 1 },
  {
    unique: true,
    partialFilterExpression: {
      "context.disputeId": { $type: "objectId" },
      active: true,
    },
  }
);

module.exports = mongoose.model("RatingPenalty", RatingPenaltySchema);
