const mongoose = require("mongoose");

const RefundRequestSchema = new mongoose.Schema(
  {
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    prompt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prompt",
      required: true,
    },
    /* The reasons the buyer TICKED, one per line.
       Kept apart from `description` below so an admin can see at a glance which
       of the standard problems was reported, and so these can be counted across
       requests — impossible while the buyer's own sentence was concatenated into
       the same field. */
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    /* Whatever the buyer wrote in their own words. Optional: a ticked reason is
       a complete request on its own.
       Requests filed before this split have everything in `reason` and nothing
       here, which is why the admin UI treats an empty description as "nothing to
       show" rather than as missing data. */
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    /* Absolute Blob URLs of whatever the buyer attached — usually a screenshot
       of the output they got. A written reason alone made "the output quality is
       poor" impossible for an admin to check without buying the prompt
       themselves; a picture of what they actually received settles it.
       Optional, and never required: a refund must not be blocked because an
       image upload failed. */
    attachments: [{ type: String }],
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    refundAmount: {
      type: Number,
      required: true,
    },
    adminNote: {
      type: String,
      default: "",
    },
    razorpayRefundId: {
      type: String,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RefundRequest", RefundRequestSchema);
