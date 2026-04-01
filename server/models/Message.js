// // // const mongoose = require("mongoose");

// // // const MessageSchema = new mongoose.Schema({
// // //   conversationId: {
// // //     type: mongoose.Schema.Types.ObjectId,
// // //     ref: "Conversation",
// // //     required: true,
// // //   },
// // //   sender: {
// // //     type: mongoose.Schema.Types.ObjectId,
// // //     ref: "User",
// // //     required: true,
// // //   },
// // //   text: {
// // //     type: String,
// // //     required: true,
// // //   },
// // //   seenBy: [{
// // //     type: mongoose.Schema.Types.ObjectId,
// // //     ref: "User",
// // //   }],
// // // }, { timestamps: true });

// // // module.exports = mongoose.model("Message", MessageSchema);


// // const mongoose = require("mongoose");

// // const MessageSchema = new mongoose.Schema(
// //   {
// //     conversationId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "Conversation",
// //       required: true,
// //       index: true,
// //     },
// //     sender: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "User",
// //       required: true,
// //     },
// //     text: String,
// //     attachments: [
// //       {
// //         url: String,
// //         originalName: String, // 👈 IMPORTANT (for shared resources)
// //         mimeType: String,
// //       },
// //     ],
// //     readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
// //   },
// //   { timestamps: true } // 🔥 createdAt, updatedAt
// // );

// // module.exports = mongoose.model("Message", MessageSchema);


// // models/Message.js
// const mongoose = require("mongoose");

// const messageSchema = new mongoose.Schema(
//   {
//     conversationId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Conversation",
//       required: true,
//     },
//     sender: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     text: String,

//     // ✅ ADD THIS
//     attachment: {
//       url: String,
//       name: String,
//       type: String, // image | pdf | file
//     },

//     readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Message", messageSchema);


// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: String,

    // ✅ FIXED ATTACHMENT FIELD
    attachment: {
      url: { type: String },
      name: { type: String },
      type: {
        type: String,
        enum: ["image", "file"],
      },
    },

    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
