// const mongoose = require("mongoose");

// const PurchaseSchema = new mongoose.Schema({
//   buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   prompt: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", required: true },
//   pricePaid: { type: Number, required: true },
//   razorpayPaymentId: { type: String },
//   paymentStatus: { type: String, enum: ["SUCCESS", "FAILED", "PENDING"], default: "PENDING" },
//   purchasedAt: { type: Date, default: Date.now },
//   promptSnapshot: { // store snapshot for deleted prompts
//     title: String,
//     description: String,
//     promptText: String,
//     attachment: Object,
//     uploadCode: [Object],
//   },
//   { timestamps: true } ,// ✅ ADD THIS
// });

// module.exports = mongoose.model("Purchase", PurchaseSchema);


const mongoose = require("mongoose");

const PurchaseSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    prompt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prompt",
      required: true,
    },
    pricePaid: {
      type: Number,
      required: true,
    },
    platformCommission: {
      type: Number,
      default: 0,
    },
    /* The buyer-side platform fee that made up part of pricePaid, and the GST
       charged on it. Stored separately from platformCommission because these
       two are NON-REFUNDABLE: a refund returns the list price, not the fee for
       running the transaction. Without them the refund path had no way to tell
       the fee apart from the seller's commission inside platformCommission.

       0 on purchases made before this existed, which is correct — those were
       taken under the old rule where the whole payment came back. */
    platformFee: {
      type: Number,
      default: 0,
    },
    platformFeeGst: {
      type: Number,
      default: 0,
    },
    razorpayPaymentId: {
      type: String,
    },
    // Set only when the seller had an activated Route Linked Account at
    // purchase time — the order's transfers[] moved money there directly.
    routeTransferId: {
      type: String,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["SUCCESS", "FAILED", "PENDING"],
      default: "PENDING",
    },
    // Mirrors the linked RefundRequest's lifecycle so purchase-history reads
    // don't need a second query — RefundRequest stays the source of truth
    // for the reason/admin note/audit trail.
    refundStatus: {

    /* When the referral job last looked at this sale.
       The job sweeps every purchase that has outlived the refund window and
       either qualifies a referral or pays out a rebate against it. Without a
       marker it would do both again on the next tick, every hour, forever. */
    referralProcessedAt: { type: Date, default: null },
      type: String,
      enum: ["NONE", "REQUESTED", "APPROVED", "REJECTED", "REFUNDED"],
      default: "NONE",
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    razorpayRefundId: {
      type: String,
      default: null,
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
    promptSnapshot: {
      title: String,
      description: String,
      promptText: String,
      attachment: Object,
      uploadCode: [Object],
    },
  },
  {
    timestamps: true, // ✅ CORRECT PLACE
  }
);

module.exports = mongoose.model("Purchase", PurchaseSchema);
