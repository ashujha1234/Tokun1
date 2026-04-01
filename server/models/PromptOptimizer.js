const mongoose = require("mongoose");
const { Schema } = mongoose;

const PromptOptimizerSchema = new Schema({
  llmProvider: { type: Schema.Types.ObjectId, ref: "LLMProvider", required: true }, // reference to LLMProvider
  inputPrompt: { type: String, required: true, trim: true },
  outputPrompt: { type: String, required: true, trim: true },
  tokensUsed: { type: Number, required: true, min: 0 }, // number of tokens used in optimization
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // optional: track user
}, { timestamps: true });

module.exports = mongoose.model("PromptOptimizer", PromptOptimizerSchema);
