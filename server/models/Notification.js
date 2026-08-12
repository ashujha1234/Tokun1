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

    /* Whole-org admin freeze (adminOrgs.js PATCH /:orgId/suspend). These were
       being sent but were never listed here, so every one of them failed
       validation and was swallowed by the insertMany try/catch — the owner and
       all members were frozen out with no notification explaining why. */
    "ORG_FROZEN",
    "ORG_UNFROZEN",

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
    /* An upload the automatic check couldn't decide on, or couldn't check at
       all. Distinct from FLAGGED: that one failed the match, this one has no
       verdict — the difference matters when an admin triages the queue. */
    "ADMIN_PROMPT_REVIEW",
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

    // Freelancer intro video review. The profile itself is never reviewed —
    // it goes live as soon as the freelancer finishes onboarding — so the only
    // freelancer notifications are about the one field an admin does approve.
    "ADMIN_FREELANCER_VIDEO_REVIEW_NEEDED",
    "FREELANCER_VIDEO_APPROVED",
    "FREELANCER_VIDEO_REJECTED",

    /* ── Everything below was being SENT but not listed here, so every one of
       these failed schema validation and was swallowed by the try/catch its
       caller wraps notification writes in. They looked like they worked.

       The org invitation is the one that actually broke a feature: the whole
       accept-an-invitation flow hangs off that notification, and it was never
       being written. A dry run of the stalled-revision cron is what surfaced
       it — the same validation error, but logged loudly enough to notice.

       Anything added to this enum has to be added here at the same time. ── */

    // Escrow auto-release (cron/autoReleaseEscrow.js) — predates this batch.
    "HIRE_AUTO_RELEASED",

    // Cancellation & dispute settlement
    "ESCROW_CANCELLED_BY_BUYER",
    "ESCROW_CANCELLED_BY_SELLER",
    "ESCROW_DISPUTE_OPENED",
    "ESCROW_DISPUTE_PROPOSED",
    "ESCROW_DISPUTE_ESCALATED",
    "ESCROW_DISPUTE_RESOLVED",
    "ESCROW_DISPUTE_WITHDRAWN",
    /* Admin-facing counterpart of ESCROW_DISPUTE_ESCALATED: the case is now
       Tokun's to rule on. Sent via notifyAdmins() from the escalation route and
       the stalled-revision cron — both of which were failing validation here,
       so the two parties were told "our team will decide" while the team was
       never told anything. */
    "ESCROW_DISPUTE_ADMIN_REVIEW",
    // Razorpay stops holding funds at 90 days; this is the week's warning.
    "ESCROW_DEADLINE_APPROACHING",
    // A revision the seller never answered.
    "REVISION_STALLED",
    // An unpaid booking/proposal the cron gave up on (cron/staleRequestWatch.js).
    // Sent to both parties, and missing here for the same reason as the rest of
    // this block.
    "REQUEST_EXPIRED",

    // Mid-project checkpoints
    "PROGRESS_REVIEW_REQUESTED",
    "PROGRESS_REVIEW_SHARED",
    "PROGRESS_REVIEW_DECLINED",

    "REVIEW_RECEIVED",

    // Team invitations — an invite is no longer applied on the owner's click,
    // so this notification is the only way the invitee learns of it.
    "ORG_INVITATION",
    "ORG_INVITATION_ACCEPTED",
    "ORG_INVITATION_DECLINED",
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