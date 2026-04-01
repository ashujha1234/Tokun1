const mongoose = require("mongoose");

const adminActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "USER_REGISTERED",
        "USER_LOGIN", 
        "PRODUCT_PURCHASED",
        "PRODUCT_FLAGGED",
        "PRODUCT_APPROVED",
        "LISTING_SUSPENDED",
        "REPORT_CREATED",
        "VIDEO_CALL_STARTED",
        "VIDEO_CALL_ENDED",
        "PAYOUT_FAILED",
        "POLICY_UPDATE",
        "OTHER",
      ],
      default: "OTHER",
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    actorName: { type: String, default: null },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    targetType: { type: String, default: null },
    targetName: { type: String, default: null },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

adminActivitySchema.index({ createdAt: -1 });
adminActivitySchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model("AdminActivity", adminActivitySchema);