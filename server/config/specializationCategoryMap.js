// Which service categories a freelancer's specializations entitle them to sell in.
//
// A seller could list a service under ANY category, regardless of what they'd
// told us they do. Someone whose profile says "Copywriting" could publish under
// Programming & Tech, and the directory would show them there — which makes the
// specialization field decorative and the category filter untrustworthy.
//
// The awkward part is that the two vocabularies grew separately and don't line
// up by name (only "Business" matches exactly), so the bridge has to be
// explicit. It's keyed on Specialization.group rather than individual slugs:
// there are 8 groups against 41 specializations, and a new specialization added
// inside an existing group then works without anyone remembering to update this.
//
// Values are Category NAMES (kind: "service", top-level). Matched
// case-insensitively at lookup so a rename of casing doesn't silently drop a
// group's entitlements.

const GROUP_TO_SERVICE_CATEGORIES = {
  AI: ["AI Services"],
  Business: ["Business", "Data"],
  Content: ["Writing & Translation"],
  Design: ["Design & Creative"],
  Development: ["Programming & Tech"],
  // Infra/DevOps work sits in engineering, but the data-pipeline half of it
  // belongs under Data.
  "Engineering Ops": ["Programming & Tech", "Data"],
  Marketing: ["Digital Marketing"],
  "Video & Audio": ["Video & Animation", "Music & Audio"],
};

/**
 * Category names a set of specializations unlocks.
 *
 * @param {Array<{group?: string}>} specializations
 * @returns {string[]} deduplicated category names
 */
function allowedCategoryNames(specializations) {
  const names = new Set();
  for (const spec of specializations || []) {
    for (const name of GROUP_TO_SERVICE_CATEGORIES[spec?.group] || []) {
      names.add(name);
    }
  }
  return [...names];
}

// ─────────────────────────────────────────────────────────────────────────────
// The SPECIFIC thing each specialization lets you sell.
//
// The group map above answers "which heading?", and its answer is a single
// broad one: nine different Development specializations all collapse to
// "Programming & Tech". A seller who told us they do Web Development, Frontend,
// Backend, Full-stack, Mobile, E-commerce and Game Development then opened the
// create-service form and found one option — "Programming & Tech" — which reads
// as though none of what they'd entered had registered.
//
// So this second map goes one level down, to the SERVICE_CATEGORIES children.
// Deliberately near-1:1: a specialization unlocks the sub-category that means
// the same thing, and only fans out where one name genuinely covers two
// (Motion & 3D Design). Fanning out further would rebuild the same haystack the
// seller is complaining about.
//
// Keyed on specialization NAME, lower-cased at lookup. Values are Category names
// under the parent that GROUP_TO_SERVICE_CATEGORIES already granted, so this can
// only ever narrow an entitlement, never widen it.
const SPECIALIZATION_TO_SERVICE_SUBCATEGORIES = {
  // Development → Programming & Tech
  "web development": ["Web Development"],
  "frontend development": ["Frontend Development"],
  "backend development": ["Backend Development"],
  // The two lists spell this differently ("Full-stack" vs "Full-Stack").
  // Matching is case-insensitive, so the casing here is cosmetic.
  "full-stack development": ["Full-Stack Development"],
  "mobile app development": ["Mobile Apps (Android/iOS)"],
  "e-commerce development": ["E-commerce Development"],
  "no-code / low-code development": ["No-code Development"],
  "game development": ["Game Development"],
  "blockchain & web3": ["Blockchain & Web3"],

  // AI → AI Services
  "prompt engineering": ["Prompt Engineering"],
  "ai application development": ["AI Application Development"],
  "ai automation": ["AI Agents", "LLM Integration"],
  "machine learning & data science": ["Machine Learning Models"],
  "ai content creation": ["AI Content Creation"],

  // Design → Design & Creative
  "ui/ux design": ["UI/UX Design"],
  "graphic design": ["Graphic Design"],
  "brand & identity design": ["Brand Identity"],
  "illustration & art": ["Illustration"],
  "motion & 3d design": ["Motion Graphics", "3D Design & Modelling"],
  "presentation & pitch design": ["Presentation Design"],

  // Content → Writing & Translation
  copywriting: ["Copywriting"],
  "content writing & blogging": ["Blog & Article Writing"],
  "technical writing": ["Technical Writing"],
  "translation & localization": ["Translation & Localization"],
  "editing & proofreading": ["Editing & Proofreading"],

  // Marketing → Digital Marketing
  seo: ["SEO"],
  "paid advertising": ["Paid Advertising"],
  "social media management": ["Social Media Marketing"],
  "email & lifecycle marketing": ["Email Marketing"],
  "growth & analytics": ["Analytics & Tracking"],

  // Video & Audio → Video & Animation / Music & Audio
  "video editing": ["Video Editing"],
  "voice over & narration": ["Voice Over"],
  "audio production": ["Audio Editing", "Mixing & Mastering"],

  // Engineering Ops → Programming & Tech / Data
  "devops & cloud": ["Cloud & DevOps"],
  "qa & test automation": ["QA & Testing"],
  cybersecurity: ["Cybersecurity"],
  "data engineering": ["Data Engineering"],

  // Business → Business
  "project & product management": ["Project Management"],
  "business & financial consulting": ["Business Plans", "Financial Modelling"],
  "virtual assistance & operations": ["Virtual Assistance"],
  "market & competitor research": ["Market Research"],
};

/**
 * Sub-category names a set of specializations unlocks.
 *
 * Empty for a specialization this map doesn't know — a newly seeded one, say.
 * Callers must treat empty as "fall back to the broad category" rather than as
 * "sell nothing", or adding a specialization would lock the seller out.
 *
 * @param {Array<{name?: string}>} specializations
 * @returns {string[]} deduplicated sub-category names
 */
function allowedSubCategoryNames(specializations) {
  const names = new Set();
  for (const spec of specializations || []) {
    const key = String(spec?.name || "").trim().toLowerCase();
    for (const name of SPECIALIZATION_TO_SERVICE_SUBCATEGORIES[key] || []) {
      names.add(name);
    }
  }
  return [...names];
}

module.exports = {
  GROUP_TO_SERVICE_CATEGORIES,
  SPECIALIZATION_TO_SERVICE_SUBCATEGORIES,
  allowedCategoryNames,
  allowedSubCategoryNames,
};
