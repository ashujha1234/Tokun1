const mongoose = require("mongoose");

const SmartgenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    orgId:  { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true, default: null },

    inputPrompt:    { type: String, required: true, trim: true },
    detailedPrompt: { type: String, required: true, trim: true },

    attachments: [
      {
        filename: String,
        path: String,   // local path or S3 URL depending on storage
        mimetype: String,
        size: Number,
      },
    ],
    tokensUsed:     { type: Number, required: true }, // what you spent for this run

    // soft delete flag if you want (optional):
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true } // createdAt, updatedAt
);

module.exports = mongoose.model("Smartgen", SmartgenSchema);
