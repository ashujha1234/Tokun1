const mongoose = require("mongoose");

const kycSubmissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },

    docType: { type: String, enum: ["AADHAAR", "PASSPORT"], required: true },

    frontPath: { type: String, required: true },
    backPath: { type: String, required: true },
    

    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED", "FLAGGED"],
      default: "PENDING",
      index: true,
    },

    stage: {
      type: String,
      enum: ["DOCUMENTS_RECEIVED", "OCR_EXTRACTION", "NAME_MATCHING", "MANUAL_REVIEW"],
      default: "DOCUMENTS_RECEIVED",
    },

    extractedName: { type: String, default: null },
    matchScore: { type: Number, default: null },

    reasonCode: { type: String, default: null }, // NAME_MISMATCH, OCR_FAILED, etc
    reasonText: { type: String, default: null },

    provider: { type: String, default: "OCR_LOCAL" },
    providerRaw: { type: Object, default: null },
    cooldownUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KycSubmission", kycSubmissionSchema);
