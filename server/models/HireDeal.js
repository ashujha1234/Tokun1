// const mongoose = require("mongoose");

// const HireDealSchema = new mongoose.Schema(
//   {



// workStartedAt:   { type: Date },
// workSubmittedAt: { type: Date },
// approvedAt:      { type: Date },
// razorpayPayoutId: { type: String },
// deliverables: [{
//   url:         { type: String },
//   description: { type: String },
// }],
// revisions: [{
//   reason:      { type: String },
//   requestedAt: { type: Date },
// }],

// // Status enum update
// status: {
//   type: String,
//   enum: [
//     "PENDING_ACCEPTANCE",
//     "ACCEPTED_WAITING_PAYMENT",
//     "FUNDED",
//     "IN_PROGRESS",
//     "WORK_SUBMITTED",
//     "REVISION_REQUESTED",
//     "COMPLETED",
//     "DISPUTED",
//     "REFUNDED",
//   ],
// },
// fundsStatus: {
//   type: String,
//   enum: [
//     "NOT_HELD",
//     "HELD_BY_TOKUN",
//     "RELEASED_TO_FREELANCER",
//     "AUTO_RELEASED",
//     "REFUNDED_TO_CLIENT",
//     "DISPUTED",
//   ],
// },







//     clientId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },

//     freelancerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },

//    chatId: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: "Conversation",
//   required: true,
// },

//     proposalMessageId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Message",
//     },

//     title: {
//       type: String,
//       default: "Hire Proposal",
//     },

//     description: {
//       type: String,
//       default: "",
//     },

//     amount: {
//       type: Number,
//       required: true,
//       min: 1,
//     },

//     platformFee: {
//       type: Number,
//       default: 0,
//     },

//     freelancerAmount: {
//       type: Number,
//       required: true,
//     },

//     currency: {
//       type: String,
//       default: "INR",
//     },

//     deliveryDate: {
//       type: Date,
//     },

//     status: {
//   type: String,
//   enum: [
//     "PENDING_ACCEPTANCE",
//     "ACCEPTED_WAITING_PAYMENT",
//     "FUNDED",
//     "IN_PROGRESS",
//     "WORK_SUBMITTED",
//     "REVISION_REQUESTED",
//     "COMPLETED",
//     "CANCELLED",
//     "REJECTED",
//   ],
//   default: "PENDING_ACCEPTANCE",
//   index: true,
// },

//     paymentStatus: {
//       type: String,
//       enum: ["NOT_PAID", "ORDER_CREATED", "PAID", "FAILED", "REFUNDED"],
//       default: "NOT_PAID",
//     },

//     fundsStatus: {
//       type: String,
//       enum: [
//         "NOT_HELD",
//         "HELD_BY_TOKUN",
//         "RELEASED_TO_FREELANCER",
//         "REFUNDED_TO_CLIENT",
//       ],
//       default: "NOT_HELD",
//     },

//     razorpayOrderId: String,
//     razorpayPaymentId: String,
//     razorpaySignature: String,

//     acceptedAt: Date,
//     paidAt: Date,
//     releasedAt: Date,
//   },
//   { timestamps: true }
// );



// module.exports = mongoose.model("HireDeal", HireDealSchema);


const mongoose = require("mongoose");

const DeliverableSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "Work file",
    },
    description: {
      type: String,
      default: "Work file",
    },
    size: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: "",
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const RevisionSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      default: "",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

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
      index: true,
    },

    proposalMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    title: {
      type: String,
      default: "Hire Proposal",
      trim: true,
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

    // Client-side commission (Tokun charges both sides — same % as platformFee)
    clientFee: {
      type: Number,
      default: 0,
    },

    // amount + clientFee — the real Razorpay order amount and refund amount
    totalPayable: {
      type: Number,
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
        "WORK_SUBMITTED",
        "REVISION_REQUESTED",
        "COMPLETED",
        "CANCELLED",
        "REJECTED",
        "DISPUTED",
        "REFUNDED",
      ],
      default: "PENDING_ACCEPTANCE",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["NOT_PAID", "ORDER_CREATED", "PAID", "FAILED", "REFUNDED"],
      default: "NOT_PAID",
      index: true,
    },

    fundsStatus: {
      type: String,
      enum: [
        "NOT_HELD",
        "HELD_BY_TOKUN",
        "RELEASED_TO_FREELANCER",
        "AUTO_RELEASED",
        "REFUNDED_TO_CLIENT",
        "DISPUTED",
      ],
      default: "NOT_HELD",
      index: true,
    },

    razorpayOrderId: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    razorpayPayoutId: {
      type: String,
      default: "",
    },

    acceptedAt: Date,
    paidAt: Date,
    workStartedAt: Date,
    workSubmittedAt: Date,
    approvedAt: Date,
    releasedAt: Date,

    // Refund audit trail (previously set in code but not persisted — schema bug)
    refundedAt: Date,
    refundReason: { type: String, default: "" },
    razorpayRefundId: { type: String, default: "" },

    // Auto-release audit trail (same previously-silent-drop issue)
    autoReleased: { type: Boolean, default: false },
    autoReleasedAt: Date,

    // Cancel/decline (pre-payment only)
    cancelledAt: Date,
    cancelReason: { type: String, default: "" },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    ndaClientUrl: { type: String, default: "" },
    ndaFreelancerUrl: { type: String, default: "" },
    ndaClientSignedAt: Date,
    ndaFreelancerSignedAt: Date,

    deliverables: {
      type: [DeliverableSchema],
      default: [],
    },

    submissionNote: {
      type: String,
      default: "",
    },

    revisions: {
      type: [RevisionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HireDeal", HireDealSchema);