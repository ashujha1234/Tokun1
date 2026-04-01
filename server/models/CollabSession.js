// models/CollabSession.js
const mongoose = require("mongoose");

const CollabSessionSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true, index: true },
  text: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      joinedAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("CollabSession", CollabSessionSchema);
