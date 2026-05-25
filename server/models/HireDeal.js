const mongoose = require("mongoose");

const HireDealSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

   chatId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Conversation",
  required: true,
},

    proposalMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    title: {
      type: String,
      default: "Hire Proposal",
    },

    description: {
      type: String,
      default: "",
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    platformFee: {
      type: Number,
      default: 0,
    },

    freelancerAmount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    deliveryDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: [
        "PENDING_ACCEPTANCE",
        "ACCEPTED_WAITING_PAYMENT",
        "FUNDED",
        "IN_PROGRESS",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED",
        "DISPUTED",
      ],
      default: "PENDING_ACCEPTANCE",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["NOT_PAID", "ORDER_CREATED", "PAID", "FAILED", "REFUNDED"],
      default: "NOT_PAID",
    },

    fundsStatus: {
      type: String,
      enum: [
        "NOT_HELD",
        "HELD_BY_TOKUN",
        "RELEASED_TO_FREELANCER",
        "REFUNDED_TO_CLIENT",
      ],
      default: "NOT_HELD",
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    acceptedAt: Date,
    paidAt: Date,
    releasedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("HireDeal", HireDealSchema);