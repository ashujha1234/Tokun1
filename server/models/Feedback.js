const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    experience: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    issue: { type: String, trim: true, default: "" },
    screenshots: [{ type: String }],
    sentiment: { type: String, enum: ["positive", "negative", "neutral"], default: "neutral" },
    status: { type: String, enum: ["pending", "reviewed", "resolved"], default: "pending" },
    showOnLanding: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
