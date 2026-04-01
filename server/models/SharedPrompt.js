const mongoose = require("mongoose");

const SharedPromptSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    promptId: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", required: true },
    sharedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // one or many members
    sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // org owner/admin
  },
  { timestamps: true }
);

module.exports = mongoose.model("SharedPrompt", SharedPromptSchema);
