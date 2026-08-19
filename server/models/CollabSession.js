// models/CollabSession.js
const mongoose = require("mongoose");

const CollabSessionSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true, index: true },
  text: { type: String, default: "" },

  /* Which edit this is, counted by the server. Bumped on every accepted
     prompt-change and sent out with the broadcast, so clients can drop an
     update that is older than one they have already applied — see the note in
     the prompt-change handler. Two people typing at once used to leave the two
     screens permanently disagreeing, because each applied whatever reached it
     last and "last" differed per machine. */
  rev: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      joinedAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("CollabSession", CollabSessionSchema);
