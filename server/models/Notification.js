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


// models/Notification.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    // who triggered this notification
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ snapshot for UI (no need to populate every time)
    senderName: { type: String },
    senderEmail: { type: String },
    senderImage: { type: String }, // profile image URL if any

    // who receives it (either org or user)
    receiverOrgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    receiverUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    type: {
      type: String,
      enum: [
        "TM_REQUEST",
        "ORG_SUGGEST",
        "ORG_SHARE",
        "ORG_SHARE_PURCHASED",
        "COLLAB_INVITE",
      ],
      required: true,
    },

    // which prompt this relates to (optional)
    promptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prompt",
      required: false,
    },

    // ✅ for prompt-optimizer collab sessions
    sessionId: {
  type: String,
},

    // message body shown in UI
    message: { type: String, trim: true },

    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
