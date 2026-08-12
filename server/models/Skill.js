// models/Skill.js
//
// The catalog behind the freelancer-onboarding skill picker. Typing "c++"
// has to surface "C++" as something to select rather than being saved as
// free text, so skills are rows here and a profile stores references to
// their canonical names.
//
// `aliases` is what makes the search feel right: nobody types "JavaScript"
// when they mean "js", and "node"/"nodejs" both have to find "Node.js".
// `searchText` is the lowercased name + aliases joined, so one regex over
// one indexed field answers every query.
const mongoose = require("mongoose");

const SkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    // Lowercased, punctuation-collapsed form of `name`. Uniqueness lives here
    // rather than on `name` so "Node.JS" can't be added alongside "Node.js".
    slug: { type: String, required: true, unique: true, index: true },

    aliases: [{ type: String, trim: true, lowercase: true }],

    // Denormalised haystack for autocomplete — see note above.
    searchText: { type: String, default: "", index: true },

    // Loose grouping, only used to bucket the "popular skills" suggestions
    // shown before the seller has typed anything.
    group: { type: String, default: "Other" },

    // Seeded rows are curated; rows a freelancer created on the fly are not,
    // and only get promoted into suggestions once enough people pick them.
    curated: { type: Boolean, default: false },

    // How many profiles reference this skill. Drives suggestion ordering so
    // the list reflects what this marketplace actually sells.
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Ranking for the pre-typing suggestion list: curated first, then popularity.
SkillSchema.index({ curated: -1, usageCount: -1 });

// "C++" → "c++", "Node.js" → "node.js", "  UI/UX  " → "ui/ux".
// Deliberately keeps +, #, ., / and - : those characters ARE the difference
// between C, C++ and C#, so stripping them would collapse distinct skills
// into one slug.
SkillSchema.statics.slugify = function slugify(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9+#./\- ]/g, "");
};

SkillSchema.statics.buildSearchText = function buildSearchText(name, aliases = []) {
  return [String(name || "").toLowerCase(), ...aliases.map((a) => String(a).toLowerCase())]
    .filter(Boolean)
    .join(" ");
};

module.exports = mongoose.model("Skill", SkillSchema);
