const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }],
  lastMessage: {
    type: String,
    default: "",
  },

  lastSender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

/* The chat list's only query: "conversations I'm in, newest first".
   There was no index at all beyond _id, so every load was a full collection
   scan followed by an in-memory sort — fine at eleven rows, not at ten
   thousand. */
ConversationSchema.index({ participants: 1, updatedAt: -1 });

module.exports = mongoose.model("Conversation", ConversationSchema);
