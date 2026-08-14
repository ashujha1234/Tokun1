// models/Category.js
//
// One collection, two independent trees, told apart by `kind`:
//
//   kind: "prompt"  — what a PROMPT is about (Coding → Web Development,
//                     Design → Logo & Branding, …). Two levels.
//   kind: "service" — what a freelancer SELLS (Programming & Tech → Web
//                     Development, Design & Creative → Logo Design, …).
//                     Two levels.
//
// They are separate because they answer different questions. Services were
// briefly wired to the prompt tree, which meant a developer offering a website
// had to file it under "Coding" and a video editor under "Content" — prompt
// vocabulary describing work it was never written for.
//
// GET /api/category returns ONE kind and top level only. Prompt selling, the
// marketplace, the library and the admin dashboard all read it expecting the
// flat prompt list they have always had, so "prompt" is the default.
const mongoose = require("mongoose");
const { Schema } = mongoose;

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    // Which tree this belongs to. Defaults to "prompt" so every row that
    // existed before this field was added stays in the prompt tree, which is
    // where all of them belong.
    kind: {
      type: String,
      enum: ["prompt", "service"],
      default: "prompt",
      index: true,
    },

    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },

    description: { type: String, default: "" },
    previewImage: { type: String, default: "" },
    previewVideo: { type: String, default: "" },
  },
  { timestamps: true }
);

// Unique per (tree, parent) rather than globally.
//
// `name` used to carry a plain `unique: true`, which was fine while there was
// one flat list and impossible once there were two trees: "Business" and "Data"
// are legitimate names in both the prompt and the service tree, and a global
// index rejects the second one silently during seeding.
//
// Mongoose creates indexes but never drops them, so declaring this one is not
// enough on its own — the old `name_1` index has to be dropped in the database
// too. POST /api/category/seed-defaults does that, once, before it seeds.
CategorySchema.index({ kind: 1, parent: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Category", CategorySchema);
