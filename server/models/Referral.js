const mongoose = require("mongoose");

/**
 * One person invited another.
 *
 * The row is created at signup and sits at PENDING doing nothing — an invite on
 * its own is worth nothing to anybody, and rewarding it is how a referral
 * programme becomes a fake-account farm. It only becomes QUALIFIED when the
 * invited person makes a real prompt sale AND that sale survives the refund
 * window; see services/referral.service.js.
 *
 * Statuses:
 *   PENDING   — signed up, hasn't sold anything that stuck
 *   QUALIFIED — their first sale settled; both rebate credits have been issued
 *   BLOCKED   — an anti-abuse rule caught it (same PAN, circular, capped out)
 */
const ReferralSchema = new mongoose.Schema(
  {
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    referredId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // The code as typed, kept for support ("which link did they use?").
    code: { type: String, required: true, trim: true, uppercase: true },

    status: {
      type: String,
      enum: ["PENDING", "QUALIFIED", "BLOCKED"],
      default: "PENDING",
      index: true,
    },

    // The sale that earned it — the invited creator's first settled prompt sale.
    qualifyingPurchaseId: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase", default: null },
    qualifiedAt: { type: Date, default: null },

    // Why an anti-abuse rule refused it. Shown to nobody; read by whoever asks
    // "my friend joined, where's my reward?".
    blockedReason: { type: String, default: "" },
  },
  { timestamps: true }
);

/* One referral per invited person, ever. Somebody signing up twice under two
   codes must not pay out twice, and a second row would do exactly that. */
ReferralSchema.index({ referredId: 1 }, { unique: true });

// The Refer & Earn page's own read: my invites, newest first.
ReferralSchema.index({ referrerId: 1, createdAt: -1 });

module.exports = mongoose.model("Referral", ReferralSchema);
