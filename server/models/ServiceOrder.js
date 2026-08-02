const mongoose = require("mongoose");

const DeliverableSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    name: { type: String, default: "Work file" },
    description: { type: String, default: "Work file" },
    size: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const RevisionSchema = new mongoose.Schema(
  {
    reason: { type: String, default: "" },
    requestedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ServiceOrderSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", default: null },

    serviceTitle: { type: String, required: true },
    serviceMedia: { type: String, default: null },

    // amount        = service.price at time of booking (seller's listed price)
    // platformFee   = Tokun's cut, deducted from the seller's payout
    // sellerAmount  = amount - platformFee (credited to seller wallet on release)
    // clientFee     = Tokun's cut added on top of what the buyer pays
    // totalPayable  = amount + clientFee (charged to buyer via Razorpay)
    amount: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    sellerAmount: { type: Number, required: true },
    clientFee: { type: Number, default: 0 },
    totalPayable: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    note: { type: String, default: "" },
    preferredDate: { type: Date, default: null },

    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },

    paymentStatus: {
      type: String,
      enum: ["NOT_PAID", "ORDER_CREATED", "PAID"],
      default: "NOT_PAID",
      index: true,
    },

    // No PENDING_ACCEPTANCE state — services are fixed-price/instantly bookable,
    // so a booking starts straight in the NDA+payment gate (mirrors HireDeal's
    // ACCEPTED_WAITING_PAYMENT onward).
    status: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "FUNDED",
        "IN_PROGRESS",
        "WORK_SUBMITTED",
        "REVISION_REQUESTED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING_PAYMENT",
      index: true,
    },

    fundsStatus: {
      type: String,
      enum: ["NOT_HELD", "HELD_BY_TOKUN", "RELEASED_TO_SELLER", "AUTO_RELEASED"],
      default: "NOT_HELD",
      index: true,
    },

    ndaBuyerUrl: { type: String, default: "" },
    ndaSellerUrl: { type: String, default: "" },
    ndaBuyerSignedAt: Date,
    ndaSellerSignedAt: Date,

    deliverables: { type: [DeliverableSchema], default: [] },
    submissionNote: { type: String, default: "" },
    revisions: { type: [RevisionSchema], default: [] },

    paidAt: { type: Date, default: null },
    workStartedAt: Date,
    workSubmittedAt: Date,
    approvedAt: Date,
    releasedAt: Date,
    autoReleased: { type: Boolean, default: false },
    autoReleasedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceOrder", ServiceOrderSchema);
