// models/Specialization.js
//
// What a freelancer sells, as opposed to what they know how to do. A person
// can be a "Web Developer" AND a "UI/UX Designer" — the two are picked
// together, which is why this is a multi-select over a small curated list
// rather than a single category.
//
// Kept separate from two neighbouring lists on purpose:
//   - Category (models/Category.js) classifies PROMPTS, not people.
//   - Razorpay's business categories classify the PAYOUT ACCOUNT and must
//     match its enum exactly (see routes/bankAccounts.js).
// Neither can absorb this one without dragging the wrong vocabulary along.
const mongoose = require("mongoose");

const SpecializationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },

    // Shown under the name in the picker so "Prompt Engineering" and
    // "AI Automation" are distinguishable at a glance.
    description: { type: String, default: "" },

    // Headline the picker groups by: "Development", "Design", "Content", …
    group: { type: String, default: "Other" },

    sortOrder: { type: Number, default: 100 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SpecializationSchema.index({ group: 1, sortOrder: 1 });

module.exports = mongoose.model("Specialization", SpecializationSchema);
