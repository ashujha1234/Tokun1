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
        /* Where the file is. Two shapes, distinguished by blobName below:
             "https://<account>.blob.core.windows.net/smartgen-attachments/…"
             "/uploads/<timestamp>-<name>"   — legacy, pre-Azure
           The legacy ones were written into the root of the served /uploads
           tree, so they were world-readable by URL and deleted on every
           deploy. */
        path: String,
        /* The blob, in a PRIVATE container. Reading one means minting a SAS
           after an ownership check — there is no such route today because
           nothing in the app displays these, which is also why moving them to
           a private container broke nothing. Add the route, not a public
           container, if they ever need to be shown. */
        blobName: { type: String, default: "" },
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
