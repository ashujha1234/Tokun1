const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    experience: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5, required: true },

    /* What the note below is — a problem or an idea.
       The field used to be labelled "Any Issue?" and nothing else, so every
       suggestion anyone wrote arrived filed as a bug. Defaults to "issue" so
       existing rows keep the meaning they were written under. */
    noteType: { type: String, enum: ["issue", "suggestion"], default: "issue" },

    /* Kept as `issue` rather than renamed to something neutral: every existing
       document, the admin dashboard and the feedback emails all read this key,
       and a rename would need a migration for no behavioural gain. `noteType`
       above is what says how to read it. */
    issue: { type: String, trim: true, default: "" },
    screenshots: [{ type: String }],
    sentiment: { type: String, enum: ["positive", "negative", "neutral"], default: "neutral" },
    status: { type: String, enum: ["pending", "reviewed", "resolved"], default: "pending" },
    showOnLanding: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
