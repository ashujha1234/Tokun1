const mongoose = require("mongoose");

/**
 * A mid-project checkpoint: the client asks to see how the work is going, and
 * the freelancer answers with a screenshot or a screen recording.
 *
 * Why this exists as its own thing rather than "just message them":
 *
 *   • Before the final submission there was NO structured way for a client to
 *     see progress. On a 60-day project that meant paying up front and then
 *     waiting two months on trust, which is exactly when clients cancel out of
 *     anxiety rather than because anything is wrong.
 *
 *   • It is evidence. When a cancellation turns into a dispute, the argument is
 *     always "how much was actually done" — and a chat scroll is not something
 *     an admin can adjudicate from. An accepted progress review is a
 *     timestamped record, held by us, of what existed on a given date.
 *
 * The freelancer can DECLINE. Being able to demand a demo on any afternoon
 * would just be a new way to harass someone mid-work, so a decline is a
 * first-class outcome with a reason attached, not a failure state.
 *
 * Media lives in the same private container as deliverables and is read through
 * the same gated route — work-in-progress is still the client's confidential
 * material and still the freelancer's unpaid labour.
 */

const ReviewMediaSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    blobName: { type: String, default: "" },
    name: { type: String, default: "Progress update" },
    size: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
    kind: { type: String, enum: ["image", "video", "file"], default: "file" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ProgressReviewSchema = new mongoose.Schema(
  {
    orderKind: { type: String, enum: ["hire", "service"], required: true, index: true },
    hireDealId: { type: mongoose.Schema.Types.ObjectId, ref: "HireDeal", default: null, index: true },
    serviceOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceOrder", default: null, index: true },

    // Normalised so a dispute screen can read these without knowing which
    // parent model it's looking at.
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "" },

    /*  REQUESTED — client asked, freelancer hasn't answered
     *  SHARED    — freelancer accepted and sent something back
     *  DECLINED  — freelancer said no, with a reason
     *  EXPIRED   — nobody answered; kept rather than deleted so the record
     *              still shows the client asked
     */
    status: {
      type: String,
      enum: ["REQUESTED", "SHARED", "DECLINED", "EXPIRED"],
      default: "REQUESTED",
      index: true,
    },

    // What the client wants to see.
    requestNote: { type: String, default: "", maxlength: 1000 },
    requestedAt: { type: Date, default: Date.now },

    // What the freelancer sent, or why they didn't.
    responseNote: { type: String, default: "", maxlength: 2000 },
    media: { type: [ReviewMediaSchema], default: [] },
    respondedAt: { type: Date, default: null },
    declineReason: { type: String, default: "", maxlength: 1000 },

    // The freelancer's own read of how far along they are. Optional, and
    // explicitly NOT binding on any later settlement — it's context for the
    // client, and a data point for an admin, not a promise.
    progressPercent: { type: Number, default: null, min: 0, max: 100 },
  },
  { timestamps: true }
);

// "Has this order got an open request?" is the hottest read here.
ProgressReviewSchema.index({ serviceOrderId: 1, status: 1 });
ProgressReviewSchema.index({ hireDealId: 1, status: 1 });

module.exports = mongoose.model("ProgressReview", ProgressReviewSchema);
