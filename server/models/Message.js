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

    // ── Delivery / read state, for the tick indicators ────────────────────
    // Three states the UI distinguishes:
    //   sent      — stored, recipient wasn't connected      → one grey tick
    //   delivered — reached a connected recipient's socket   → two grey ticks
    //   read      — recipient actually opened the thread     → two blue ticks
    //
    // `readBy` already existed but nothing ever added to it beyond the sender,
    // so no receipt could be derived from it.
    deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ── Edit ──────────────────────────────────────────────────────────────
    // Null until the sender edits. The original is kept so an edited message
    // can't be used to silently rewrite what was agreed in a hire negotiation.
    editedAt: { type: Date, default: null },
    originalText: { type: String, default: null },

    // ── Delete ────────────────────────────────────────────────────────────
    // Soft delete: the row stays so the conversation keeps its shape and the
    // other side sees "This message was deleted" rather than history silently
    // changing under them. `text` is cleared on delete so the content is really
    // gone, not just hidden by the client.
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// The chat loads a conversation newest-last and marks unread messages read on
// open; both are per-conversation scans.
messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
