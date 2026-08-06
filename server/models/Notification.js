// // // const mongoose = require("mongoose");

// // // const NotificationSchema = new mongoose.Schema(
// // //   {
// // //     senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
// // //     receiverOrgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" }, // for org-wide
// // //     receiverUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // for specific user

// // //     type: {
// // //       type: String,
// // //       enum: ["TM_REQUEST", "ORG_SUGGEST", "ORG_SHARE"],
// // //       required: true,
// // //     },

// // //     promptId: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", required: true },
// // //     message: { type: String, trim: true },
// // //     read: { type: Boolean, default: false },
// // //   },
// // //   { timestamps: true }
// // // );

// // // module.exports = mongoose.model("Notification", NotificationSchema);


// // const mongoose = require("mongoose");

// // const NotificationSchema = new mongoose.Schema(
// //   {
// //     senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
// //     senderName: { type: String },            // ✅ NEW
// //     senderEmail: { type: String },           // ✅ NEW
// //     senderImage: { type: String },           // ✅ NEW

// //     receiverOrgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
// //     receiverUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

// //     type: {
// //       type: String,
// //       enum: ["TM_REQUEST", "ORG_SUGGEST", "ORG_SHARE"],
// //       required: true,
// //     },

// //     promptId: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", required: true },
// //     message: { type: String, trim: true },
// //     read: { type: Boolean, default: false },
// //   },
// //   { timestamps: true }
// // );

// // module.exports = mongoose.model("Notification", NotificationSchema);


// // models/Notification.js
// const mongoose = require("mongoose");

// const NotificationSchema = new mongoose.Schema(
//   {
//     // who triggered this notification
//     senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     senderName: { type: String },            // snapshot for UI (doesn't require populate later)
//     senderEmail: { type: String },
//     senderImage: { type: String },           // e.g. profileImage URL

//     // who receives it (either org or user)
//     receiverOrgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
//     receiverUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

//     type: {
//       type: String,
//       enum: ["TM_REQUEST", "ORG_SUGGEST", "ORG_SHARE",   "COLLAB_INVITE"   ],
//       required: true,
//     },

//     // which prompt this relates to
//    promptId: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt" },


//     // message body shown in UI (e.g., “hii”, “org suggests …”)
//     message: { type: String, trim: true },

//     read: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Notification", NotificationSchema);


// // models/Notification.js
// const mongoose = require("mongoose");

// const NotificationSchema = new mongoose.Schema(
//   {
//     // who triggered this notification
//     senderId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     // ✅ snapshot for UI (no need to populate every time)
//     senderName: { type: String },
//     senderEmail: { type: String },
//     senderImage: { type: String }, // profile image URL if any

//     // who receives it (either org or user)
//     receiverOrgId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Organization",
//     },
//     receiverUserId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },

//     type: {
//       type: String,
//       enum: [
//         "TM_REQUEST",
//         "ORG_SUGGEST",
//         "ORG_SHARE",
//         "ORG_SHARE_PURCHASED",
//         "COLLAB_INVITE",
//       ],
//       required: true,
//     },

//     // which prompt this relates to (optional)
//     promptId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Prompt",
//       required: false,
//     },

//     // ✅ for prompt-optimizer collab sessions
//     sessionId: {
//   type: String,
// },

//     // message body shown in UI
//     message: { type: String, trim: true },

//     read: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Notification", NotificationSchema);



const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Optional — some notifications (e.g. admin/system actions like feedback
      // status updates) have no other "User" to attribute as the sender.
    },

    senderName: { type: String },
    senderEmail: { type: String },
    senderImage: { type: String },

    receiverOrgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },

    receiverUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Admin-facing notifications (new reports, AI-flagged uploads, etc.) —
    // AdminUser is a separate collection from User, hence its own field
    // rather than overloading receiverUserId.
    receiverAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
    },

   type: {
  type: String,
  enum: [
    "TM_REQUEST",
    "ORG_SUGGEST",
    "ORG_SHARE",
    "ORG_SHARE_PURCHASED",
    "COLLAB_INVITE",

    // Org membership & token allocation. The add-member flow sent an email
    // invitation and nothing else, so a member who was already signed in got no
    // in-app signal that they'd joined an org or been given an allowance.
    "ORG_MEMBER_ADDED",
    "ORG_TOKENS_UPDATED",
    "ORG_MEMBER_REMOVED",
    "ORG_MEMBER_REJOINED",

    // Hire flow
    "HIRE_PROPOSAL_ACCEPTED",
    "HIRE_PAYMENT_REQUIRED",
    "HIRE_PAYMENT_DONE",
    "HIRE_WORK_STARTED",
    "HIRE_WORK_SUBMITTED",
    "HIRE_WORK_COMPLETED",
    "HIRE_REVISION_REQUESTED",
    "HIRE_PAYMENT_RELEASED",
    "HIRE_COUNTER_OFFER",
    "HIRE_NDA_SIGNED",
    "HIRE_REFUNDED",
    "HIRE_DEAL_CANCELLED_SUSPENSION",
    // Service booking flow
    "SERVICE_BOOKING_REQUESTED",
    "SERVICE_NDA_SIGNED",
    "SERVICE_ORDER_PAID",
    "SERVICE_WORK_STARTED",
    "SERVICE_WORK_SUBMITTED",
    "SERVICE_REVISION_REQUESTED",
    "SERVICE_PAYMENT_RELEASED",

    // Feedback flow
    "FEEDBACK_STATUS_UPDATED",
    "FEEDBACK_FEATURED",

    // Prompt-media match validation flow
    "PROMPT_MEDIA_REVIEW",

    // Admin-facing notifications
    "ADMIN_PROMPT_REPORTED",
    "ADMIN_PROMPT_FLAGGED",
    "ADMIN_REVIEW_NEEDED",

    // Seller account moderation
    "SELLER_SUSPENDED",
    "SELLER_UNSUSPENDED",
    "SELLER_ACCOUNT_DELETED",
    "SELLER_ACCOUNT_RESTORED",

    // Buyer refund flow
    "ADMIN_REFUND_REQUESTED",
    "REFUND_APPROVED",
    "REFUND_REJECTED",
  ],
  required: true,
},
    promptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prompt",
      required: false,
    },

    sessionId: {
      type: String,
    },

    hireDealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HireDeal",
    },

    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },

    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    amount: {
      type: Number,
      default: 0,
    },

    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    message: { type: String, trim: true },

    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);