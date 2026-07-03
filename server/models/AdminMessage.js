// server/models/AdminMessage.js
const mongoose = require("mongoose");

const AdminMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminConversation",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    senderType: {
      type: String,
      enum: ["admin", "seller"],
      required: true,
    },

    text: {
      type: String,
      default: "",
      trim: true,
    },

    attachment: {
      url: String,
      name: String,
      type: {
        type: String,
        enum: ["image", "file"],
      },
    },

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

AdminMessageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model("AdminMessage", AdminMessageSchema);