const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    experience: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    orgOrCompany: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    profilePicture: { type: String, default: null }, // store file URL or path
    sentiment: { type: String, enum: ["positive", "negative", "neutral"], default: "neutral" }, // 👈 new field

  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
