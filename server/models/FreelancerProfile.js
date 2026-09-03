// models/FreelancerProfile.js
//
// A freelancer's professional profile. One per user.
//
// NOTHING HERE WAITS ON AN ADMIN. Finishing onboarding puts the profile live
// immediately (DRAFT → ACTIVE) — there is no review queue for the profile
// itself. The one thing that IS reviewed is the intro video, because it's the
// only field where a freelancer publishes footage of a person under Tokun's
// name; that lives in `introVideo` with its own status.
//
// Payout details are NOT here. A freelancer creates their profile with no bank
// details at all — the Razorpay linked account is collected later, at the point
// money is about to move (routes/bankAccounts.js), and it is collected ONCE:
// whichever side asks first (freelancing or prompt selling) satisfies both.
// `payoutReadyAt` is only a cached marker so the UI can stop prompting.
//
// Kept separate from User because it's filled in over several steps and saved
// half-finished; an incomplete draft must never leak into the documents that
// auth, billing and quota read.
const mongoose = require("mongoose");

const PROFILE_STATUSES = ["DRAFT", "ACTIVE"];
const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "expert"];
const LANGUAGE_LEVELS = ["basic", "conversational", "fluent", "native"];
const VIDEO_STATUSES = ["NONE", "PENDING", "APPROVED", "REJECTED"];

// Requirements the intro video must meet, enforced in
// utils/introVideoValidation.js and shown verbatim in the upload UI. Exported so
// the two can't drift — the numbers a freelancer reads are the numbers checked.
const INTRO_VIDEO_RULES = {
  minSeconds: 20,
  maxSeconds: 60,
  minWidth: 1280,
  minHeight: 720,
  // 16:9, with tolerance — real encoders land on 1.774–1.778 rather than
  // exactly 1.7778, and rejecting a 1920×1082 export as "not 16:9" would be
  // pedantry the uploader can do nothing about.
  aspectRatio: 16 / 9,
  aspectTolerance: 0.04,
  maxBytes: 5 * 1024 * 1024 * 1024, // 5 GB
};

const ProfileSkillSchema = new mongoose.Schema(
  {
    // Name is denormalised from the Skill catalog rather than referenced: a
    // profile is read on every public page view and the catalog row adds
    // nothing beyond its label. `skillId` is kept only so usage counts can be
    // attributed back.
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", default: null },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    level: { type: String, enum: SKILL_LEVELS, default: "intermediate" },
  },
  { _id: false }
);

const LanguageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    level: { type: String, enum: LANGUAGE_LEVELS, default: "conversational" },
  },
  { _id: false }
);

// Dates on the history sections are "YYYY-MM" strings, not Dates. Nobody knows
// the day they started a job, and a Date would silently invent one — which then
// renders as an off-by-one month in another timezone.
const MONTH_STRING = {
  type: String,
  default: null,
  validate: {
    validator: (v) => v === null || v === "" || /^\d{4}-(0[1-9]|1[0-2])$/.test(v),
    message: "Expected a YYYY-MM month",
  },
};

const WorkExperienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, default: "", trim: true },
    from: MONTH_STRING,
    to: MONTH_STRING,
    current: { type: Boolean, default: false },
    description: { type: String, default: "", trim: true },
  },
  { _id: true }
);

const EducationSchema = new mongoose.Schema(
  {
    institution: { type: String, required: true, trim: true },
    degree: { type: String, default: "", trim: true },
    fieldOfStudy: { type: String, default: "", trim: true },
    from: MONTH_STRING,
    to: MONTH_STRING,
  },
  { _id: true }
);

const CertificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    issuer: { type: String, default: "", trim: true },
    issuedAt: MONTH_STRING,
    url: { type: String, default: "", trim: true },
  },
  { _id: true }
);

// The only admin-gated field on the profile. Dimensions and duration are what
// ffprobe measured, not what the browser reported — they're shown to the
// reviewer, so they have to be trustworthy.
const IntroVideoSchema = new mongoose.Schema(
  {
    /* The <video src> the profile renders. Two shapes live here:
         "https://<account>.blob.core.windows.net/freelancer-intro/…"  — current
         "/uploads/freelancer-intro/intro-<id>-<ts>.mp4"               — legacy
       Both are just strings the browser loads, so the frontend needs no branch;
       the legacy ones simply stop resolving once the local file is gone, which
       for anything uploaded before this change has usually already happened. */
    url: { type: String, default: null },

    /* The blob behind that URL, kept so the file can be DELETED later.
       A URL is enough to read a blob and not enough to address one for removal
       — replacing a video needs the old blob's name, and parsing it back out of
       the URL would break the first time the account or container is renamed.
       Empty on legacy records, which is how the replace path tells the two
       apart: blobName set => delete from Azure, otherwise => unlink from disk. */
    blobName: { type: String, default: "" },

    status: { type: String, enum: VIDEO_STATUSES, default: "NONE" },

    durationSeconds: { type: Number, default: null },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    sizeBytes: { type: Number, default: null },
    originalName: { type: String, default: "" },

    uploadedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null },
    // Shown to the freelancer verbatim, so it has to read as something a person
    // wrote rather than an error code.
    rejectionReason: { type: String, default: null },
    // Counts uploads. A video re-submitted several times is worth a closer look.
    submissionCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const FreelancerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // ── Identity ───────────────────────────────────────────────────────────
    // Defaults to the User's name at creation but editable, since a freelancer
    // may trade under a different professional name.
    displayName: { type: String, default: "", trim: true },
    professionalTitle: { type: String, default: "", trim: true }, // "Full-stack developer"
    about: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    languages: { type: [LanguageSchema], default: [] },

    // ── What they can do, and what they sell ───────────────────────────────
    skills: { type: [ProfileSkillSchema], default: [] },
    specializations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Specialization" }],

    // ── Credentials, all optional ──────────────────────────────────────────
    workExperience: { type: [WorkExperienceSchema], default: [] },
    education: { type: [EducationSchema], default: [] },
    certifications: { type: [CertificationSchema], default: [] },
    portfolioLinks: { type: [String], default: [] },
    introVideo: { type: IntroVideoSchema, default: () => ({}) },

    // Indicative only — the actual price of work is set per Service.
    hourlyRate: { type: Number, default: null, min: 0 },
    availability: {
      type: String,
      enum: ["full_time", "part_time", "occasional", null],
      default: null,
    },

    /* ── Team fields ──
       The "Are you part of a team?" onboarding step has been removed, so
       nothing writes these right now. Kept rather than dropped so the step can
       come back without a migration, and so any profile that answered it
       before doesn't silently lose the answer. workStyle defaults to "solo",
       which is what every profile created today is. */
    workStyle: { type: String, enum: ["solo", "team"], default: "solo" },
    teamName: { type: String, default: "", trim: true },
    teamSize: { type: Number, default: null, min: 2, max: 5000 },
    teamRole: { type: String, default: "", trim: true },

    // ── Lifecycle ──────────────────────────────────────────────────────────
    // DRAFT while onboarding is unfinished, ACTIVE once it is. No admin step:
    // ACTIVE is reached by the freelancer completing the required fields.
    status: { type: String, enum: PROFILE_STATUSES, default: "DRAFT", index: true },
    activatedAt: { type: Date, default: null },

    // Cached marker that this freelancer has a payout account. Not the source
    // of truth (BankAccount / User.razorpayFundAccountId are); it exists so the
    // "set up payouts" prompt can be hidden without another lookup.
    payoutReadyAt: { type: Date, default: null },

    // Which skill slugs this profile has already contributed to
    // Skill.usageCount. A profile can be edited repeatedly, so the diff against
    // this array is what gets applied rather than re-incrementing every skill.
    countedSkillSlugs: { type: [String], default: [] },
  },
  { timestamps: true }
);

// The admin video queue reads oldest-uploaded-first within a status.
FreelancerProfileSchema.index({ "introVideo.status": 1, "introVideo.uploadedAt": 1 });

// What a profile must have before it can go live. Returns human-readable gaps —
// activation refuses while it's non-empty, and the wizard shows the same
// strings, so the two can't disagree about what "complete" means.
//
// The intro video is deliberately NOT here: it's optional, and it can't be a
// precondition for going live when it needs an admin to approve it.
FreelancerProfileSchema.methods.completenessErrors = function completenessErrors() {
  const errors = [];

  if (!String(this.displayName || "").trim()) errors.push("Add the name buyers will see.");
  if (!String(this.professionalTitle || "").trim()) {
    errors.push("Add a professional title, e.g. “Full-stack developer”.");
  }

  const about = String(this.about || "").trim();
  if (about.length < 80) {
    errors.push("Write at least 80 characters about yourself so buyers know what you do.");
  }

  if (!String(this.country || "").trim()) errors.push("Add the country you work from.");
  if (!this.languages?.length) errors.push("Add at least one language you speak.");
  if (!this.skills?.length) errors.push("Add at least one skill.");
  if (!this.specializations?.length) errors.push("Pick at least one specialization.");

  return errors;
};

/**
 * The "Profile Strength X/12" checklist.
 *
 * Drives the right-hand panel on the freelancer's edit page: each incomplete
 * item is a button that focuses the matching section on the left. `key` is what
 * the page uses as its ?focused_section= value, so it's part of a URL contract
 * and shouldn't be renamed casually.
 *
 * `required` marks the seven items that also block activation — the panel shows
 * those differently from the five that merely make a profile stronger.
 *
 * `hasAvatar` comes from the User document, which this model can't see, so the
 * caller passes it in.
 */
FreelancerProfileSchema.methods.strengthChecklist = function strengthChecklist({
  hasAvatar = false,
} = {}) {
  const video = this.introVideo || {};

  const items = [
    { key: "title", label: "Add a professional title", done: !!String(this.professionalTitle || "").trim(), required: true },
    { key: "about", label: "Describe what you do", done: String(this.about || "").trim().length >= 80, required: true },
    { key: "location", label: "Add your location", done: !!String(this.country || "").trim(), required: true },
    { key: "languages", label: "Add the languages you speak", done: !!this.languages?.length, required: true },
    { key: "skills", label: "List your skills", done: !!this.skills?.length, required: true },
    { key: "specializations", label: "Pick your specializations", done: !!this.specializations?.length, required: true },
    { key: "photo", label: "Upload a profile photo", done: !!hasAvatar, required: false },
    { key: "portfolio", label: "Showcase portfolio", done: !!this.portfolioLinks?.length, required: false },
    // Counts as done once it's uploaded, not once it's approved — the
    // freelancer has finished their part, and holding the score hostage to a
    // queue they can't influence would read as a penalty.
    { key: "intro_video", label: "Create an intro video", done: video.status === "PENDING" || video.status === "APPROVED", required: false },
    { key: "experience", label: "List experience", done: !!this.workExperience?.length, required: false },
    { key: "education", label: "Include education", done: !!this.education?.length, required: false },
    { key: "certifications", label: "List certifications", done: !!this.certifications?.length, required: false },
  ];

  return {
    items,
    score: items.filter((i) => i.done).length,
    total: items.length,
  };
};

module.exports = mongoose.model("FreelancerProfile", FreelancerProfileSchema);
module.exports.PROFILE_STATUSES = PROFILE_STATUSES;
module.exports.SKILL_LEVELS = SKILL_LEVELS;
module.exports.LANGUAGE_LEVELS = LANGUAGE_LEVELS;
module.exports.VIDEO_STATUSES = VIDEO_STATUSES;
module.exports.INTRO_VIDEO_RULES = INTRO_VIDEO_RULES;
