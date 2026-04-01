const mongoose = require("mongoose");
const { Schema } = mongoose;

const PromptReportSchema = new Schema(
  {
    reporter: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // user who is raising the report

    prompt: { 
      type: Schema.Types.ObjectId, 
      ref: "Prompt", 
      required: true 
    }, // the prompt being reported

    resourceTitle: { type: String, trim: true }, // optional: prompt title
    resourceURL: { type: String, trim: true },   // optional: external link if any

    category: { 
      type: Schema.Types.ObjectId, 
      ref: "Category", 
      required: true 
    }, // reference to your Category model

    tags: { type: [String], default: [] },   // optional tags

    reason: { type: String, required: true }, // e.g., "inappropriate", "spam"
    description: { type: String, trim: true }, // detailed explanation
    stepsToReproduce: { type: String, trim: true }, // optional
    screenshots: { type: [String], default: [] }, // array of file paths / URLs

    agreeStatus: { type: Boolean, default: false }, // admin agreement status

    status: { 
      type: String, 
      enum: ["Pending", "Reviewed", "Resolved", "Rejected"], 
      default: "Pending" 
    }, // workflow status
  },
  { timestamps: true }
);

module.exports = mongoose.model("PromptReport", PromptReportSchema);
