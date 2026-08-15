// routes/freelancerRoutes.js
//
// Becoming a freelancer, and everything a freelancer edits afterwards.
//
// Four things worth knowing before editing:
//
//  1. THE PROFILE IS NEVER REVIEWED. Finishing onboarding activates it
//     immediately (POST /me/activate). There is no admin queue for the profile.
//     The one exception is the intro video, which has its own status and its own
//     admin endpoints in routes/adminFreelancers.js.
//
//  2. NO PAYOUT DETAILS PASS THROUGH HERE. The Razorpay linked account is
//     collected once, by routes/bankAccounts.js, at the point money is about to
//     move — and whichever side asks first (freelancing or prompt selling)
//     satisfies both. All this file does is report `payoutReady` so the UI knows
//     whether to keep prompting.
//
//  3. The draft save is a whitelisted merge, not a document replace. The wizard
//     and the edit page both PUT one section at a time and must never blank the
//     sections they aren't showing — and `status`, `activatedAt` and the intro
//     video's review fields are state a client may never write.
//
//  4. Intro videos are stored on local disk (uploads/freelancer-intro), the same
//     as service work files and NDAs. Deliberately not Azure: uploadToAzure
//     buffers the whole file in memory, which a video measured in GB cannot be.

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();

const FreelancerProfile = require("../models/FreelancerProfile");
const Skill = require("../models/Skill");
const Specialization = require("../models/Specialization");
const User = require("../models/User");
const BankAccount = require("../models/BankAccount");
const { requireAuth, blockIfSuspended } = require("../utils/auth");
const { notifyAdmins } = require("../utils/notifyAdmins");
const { withCatalog } = require("../services/freelancerCatalog.service");
const { validateIntroVideo } = require("../utils/introVideoValidation");
const { allowlistedUserIds, isAllowlistedEmail } = require("../utils/superCreatorGate");

const { SKILL_LEVELS, LANGUAGE_LEVELS, INTRO_VIDEO_RULES } = FreelancerProfile;

/* ─────────────────────── intro video upload ─────────────────────── */

const introVideoDir = path.join(__dirname, "../uploads/freelancer-intro");
if (!fs.existsSync(introVideoDir)) fs.mkdirSync(introVideoDir, { recursive: true });

const introVideoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, introVideoDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || ".mp4").toLowerCase() || ".mp4";
    // Namespaced by user so an orphaned file is traceable, and timestamped so a
    // re-upload never overwrites a video still pending review.
    cb(null, `intro-${req.user?._id || "unknown"}-${Date.now()}${ext}`);
  },
});

const uploadIntroVideo = multer({
  storage: introVideoStorage,
  limits: { fileSize: INTRO_VIDEO_RULES.maxBytes },
  fileFilter: (req, file, cb) => {
    // Extension and MIME both, because either alone is trivially wrong: browsers
    // send application/octet-stream for some containers, and an extension is
    // just a string. The real check is ffprobe reading a video track out of it.
    const ext = path.extname(file.originalname || "").toLowerCase();
    const okExt = [".mp4", ".mov", ".m4v", ".webm"].includes(ext);
    const okMime = /^video\//.test(file.mimetype || "");
    if (okExt || okMime) return cb(null, true);
    cb(new Error("unsupported_video_type"));
  },
});

// Deletes a file we've decided not to keep. Failures are swallowed: a leftover
// temp file is a housekeeping problem, but turning one into a 500 would tell the
// freelancer their perfectly good upload failed.
function discard(filePath) {
  if (!filePath) return;
  fs.promises.unlink(filePath).catch(() => {});
}

/* ─────────────────────────── helpers ─────────────────────────── */

// Escapes a user-typed query for use inside a RegExp. Without this, searching
// for "c++" throws (a bare + is an invalid quantifier) — which is exactly the
// query this feature was asked to handle.
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const str = (v, max = 2000) => String(v ?? "").trim().slice(0, max);

const clampMonth = (v) => (/^\d{4}-(0[1-9]|1[0-2])$/.test(String(v || "")) ? String(v) : null);

// Whether this user has a usable payout account. Mirrors the condition in
// bankAccounts.js /payout-status: a Route linked account that actually got
// created. Only used to decide whether to keep nudging, so it deliberately does
// not call Razorpay — a stale "not ready" costs one extra banner, a Razorpay
// round-trip costs every profile read.
async function hasPayoutAccount(userId) {
  const account = await BankAccount.findOne({
    userId,
    routeStatus: "CREATED",
    routeLinkedAccountId: { $ne: null },
  }).select("_id");
  return !!account;
}

// Only an APPROVED video is public. A pending or rejected one is visible to its
// owner (so they can see where it stands) but never to a buyer.
function serializeIntroVideo(video, { includePrivate = false } = {}) {
  const v = video || {};
  const publicUrl = v.status === "APPROVED" ? v.url : null;

  const base = {
    status: v.status || "NONE",
    url: publicUrl,
    durationSeconds: v.durationSeconds ?? null,
    width: v.width ?? null,
    height: v.height ?? null,
  };

  if (!includePrivate) return base;

  return {
    ...base,
    // The owner sees their own video whatever its status — reviewing a
    // rejection is impossible if you can't watch what was rejected.
    url: v.url || null,
    sizeBytes: v.sizeBytes ?? null,
    originalName: v.originalName || "",
    uploadedAt: v.uploadedAt || null,
    reviewedAt: v.reviewedAt || null,
    rejectionReason: v.rejectionReason || null,
    submissionCount: v.submissionCount || 0,
  };
}

// Shape sent to the wizard and the freelancer's own edit page.
function serializeProfile(
  profile,
  { payoutReady = false, hasAvatar = false, viewerEmail = null } = {}
) {
  if (!profile) return null;

  const strength = profile.strengthChecklist({ hasAvatar });

  return {
    _id: String(profile._id),
    userId: String(profile.userId),
    displayName: profile.displayName,
    professionalTitle: profile.professionalTitle,
    about: profile.about,
    country: profile.country,
    city: profile.city,
    languages: profile.languages || [],
    skills: (profile.skills || []).map((s) => ({
      skillId: s.skillId ? String(s.skillId) : null,
      name: s.name,
      slug: s.slug,
      level: s.level,
    })),
    specializations: (profile.specializations || []).map((sp) =>
      // Populated when it came through a .populate() call, a bare ObjectId
      // otherwise — the client always wants the object form.
      sp && sp.name
        ? { _id: String(sp._id), name: sp.name, slug: sp.slug, group: sp.group }
        : { _id: String(sp), name: "", slug: "", group: "" }
    ),
    workExperience: profile.workExperience || [],
    education: profile.education || [],
    certifications: profile.certifications || [],
    portfolioLinks: profile.portfolioLinks || [],
    introVideo: serializeIntroVideo(profile.introVideo, { includePrivate: true }),
    hourlyRate: profile.hourlyRate,
    availability: profile.availability,
    status: profile.status,
    activatedAt: profile.activatedAt,
    // Computed rather than stored so the wizard's checklist can't drift from
    // what /activate will actually accept.
    completenessErrors: profile.completenessErrors(),
    strength,
    payoutReady,
    /* Cleared to publish services and take hire work — an APPROVED intro video
       or an allowlisted account. This is a read of their own profile, so the
       email is already in hand (req.user) and no extra query is needed.

       It exists so the creator's own page can say "you can't publish yet, and
       here's why" instead of letting them fill in a whole listing and meet a
       403 from POST /api/service. */
    superCreator:
      profile.introVideo?.status === "APPROVED" || isAllowlistedEmail(viewerEmail),
    videoRules: INTRO_VIDEO_RULES,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

/* ═══════════════════════ CATALOG (public) ═══════════════════════ */

/**
 * GET /api/freelancer/skills/search?q=c%2B%2B&limit=12
 *
 * Autocomplete behind the skills section. Ranks prefix matches above substring
 * matches, so typing "java" offers Java before JavaScript rather than in
 * arbitrary order. With no `q`, returns the popular-skills list shown before the
 * freelancer starts typing.
 */
router.get("/skills/search", withCatalog, async (req, res) => {
  try {
    const q = str(req.query.q, 60);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 40);

    if (!q) {
      const popular = await Skill.find({ curated: true })
        .sort({ usageCount: -1, name: 1 })
        .limit(limit)
        .select("name slug group usageCount")
        .lean();

      return res.json({ success: true, skills: popular, query: "", creatable: false });
    }

    const needle = Skill.slugify(q);

    // A query of nothing but punctuation ("$^", "!!!") slugifies away to an
    // empty string, and an empty $regex matches every row — which would answer
    // garbage with a dozen arbitrary skills. `creatable: false` also stops the
    // client offering to add it, since POST /skills would reject the same input.
    if (!needle) {
      return res.json({
        success: true,
        skills: [],
        query: q,
        exactMatch: false,
        creatable: false,
      });
    }

    const safe = escapeRegex(needle);

    // One query over the denormalised haystack (name + aliases), then ranked in
    // memory. The candidate set is small enough that sorting here beats an
    // aggregation with $switch, and it keeps the ranking rules readable.
    const candidates = await Skill.find({ searchText: { $regex: safe } })
      .limit(limit * 6)
      .select("name slug group aliases usageCount curated searchText")
      .lean();

    const ranked = candidates
      .map((skill) => {
        const name = String(skill.name).toLowerCase();
        const aliases = skill.aliases || [];

        // Lower score sorts first.
        let score = 4;
        if (name === needle || aliases.includes(needle)) score = 0;
        else if (name.startsWith(needle)) score = 1;
        else if (aliases.some((a) => a.startsWith(needle))) score = 2;
        else if (name.includes(needle)) score = 3;

        return { skill, score };
      })
      .sort(
        (a, b) =>
          a.score - b.score ||
          (b.skill.curated ? 1 : 0) - (a.skill.curated ? 1 : 0) ||
          (b.skill.usageCount || 0) - (a.skill.usageCount || 0) ||
          a.skill.name.length - b.skill.name.length
      )
      .slice(0, limit)
      .map(({ skill }) => ({
        _id: skill._id,
        name: skill.name,
        slug: skill.slug,
        group: skill.group,
        usageCount: skill.usageCount,
      }));

    // `exactMatch` tells the client whether to offer "add <q> as a new skill";
    // `creatable` says whether that offer would be accepted at all.
    const exactMatch = ranked.some((s) => s.slug === needle);

    return res.json({
      success: true,
      skills: ranked,
      query: q,
      exactMatch,
      creatable: needle.length >= 2,
    });
  } catch (err) {
    console.error("skill search error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/**
 * POST /api/freelancer/skills
 * body: { name }
 *
 * Adds a skill the catalog doesn't have yet. Needed because no curated list
 * covers every niche, and a freelancer whose one marketable skill is missing
 * would otherwise be stuck. Created rows are `curated: false`, so they don't
 * pollute the pre-typing suggestions until enough profiles pick them up.
 */
router.post("/skills", requireAuth, blockIfSuspended, withCatalog, async (req, res) => {
  try {
    const name = str(req.body?.name, 60);
    if (name.length < 2) {
      return res.status(400).json({ success: false, error: "name_too_short" });
    }

    const slug = Skill.slugify(name);
    if (!slug) return res.status(400).json({ success: false, error: "invalid_name" });

    // Returns the existing row rather than erroring — from the client's point of
    // view "make sure this skill exists" succeeded either way.
    const existing = await Skill.findOne({ slug }).select("name slug group").lean();
    if (existing) {
      return res.json({ success: true, skill: existing, created: false });
    }

    const skill = await Skill.create({
      name,
      slug,
      aliases: [],
      searchText: Skill.buildSearchText(name, []),
      group: "Other",
      curated: false,
    });

    return res.json({
      success: true,
      skill: { _id: skill._id, name: skill.name, slug: skill.slug, group: skill.group },
      created: true,
    });
  } catch (err) {
    // Two people adding the same missing skill at once — the loser of the race
    // just reads the winner's row.
    if (err?.code === 11000) {
      const existing = await Skill.findOne({ slug: Skill.slugify(req.body?.name) })
        .select("name slug group")
        .lean();
      if (existing) return res.json({ success: true, skill: existing, created: false });
    }
    console.error("create skill error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/** GET /api/freelancer/specializations — grouped for the multi-select. */
router.get("/specializations", withCatalog, async (req, res) => {
  try {
    const rows = await Specialization.find({ active: true })
      .sort({ group: 1, sortOrder: 1, name: 1 })
      .select("name slug description group sortOrder")
      .lean();

    // Insertion order of this list is the group order the client renders.
    const grouped = [];
    const index = new Map();
    for (const row of rows) {
      if (!index.has(row.group)) {
        const bucket = { group: row.group, items: [] };
        index.set(row.group, bucket);
        grouped.push(bucket);
      }
      index.get(row.group).items.push(row);
    }

    return res.json({ success: true, specializations: rows, grouped });
  } catch (err) {
    console.error("specializations error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ═══════════════════════ MY PROFILE ═══════════════════════ */

/**
 * GET /api/freelancer/me
 * Returns null profile (not 404) when the flow has never been started — "you
 * aren't a freelancer yet" is a normal answer, not an error, and the account
 * dropdown calls this to label its menu item.
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    // Team members can't be freelancers in their own right for the same reason
    // they can't sell prompts: their organization owns the commercial
    // relationship.
    if (req.user.userType === "TM") {
      return res.json({
        success: true,
        profile: null,
        eligible: false,
        reason: "team_member",
        message:
          "Your organization handles client work. Ask your org owner to set up the freelancer profile.",
      });
    }

    // Both queries at once. They were sequential, which made this endpoint cost
    // two round trips to Atlas — and this is the request the account menu and
    // the onboarding wizard both block on, so it was the slowest thing between
    // clicking "Become a Freelancer" and seeing the form.
    const [profile, payoutAccount] = await Promise.all([
      FreelancerProfile.findOne({ userId: req.user._id }).populate(
        "specializations",
        "name slug group"
      ),
      hasPayoutAccount(req.user._id),
    ]);

    const payoutReady = profile ? payoutAccount : false;

    // Keeps the cached marker honest without a separate write path: the first
    // read after they finish payout setup records it.
    //
    // Not awaited — the response doesn't depend on it, and making every reader
    // wait on a bookkeeping write is what turns a fast GET into a slow one. It
    // happens at most once per freelancer; if it fails the next read retries.
    if (profile && payoutReady && !profile.payoutReadyAt) {
      profile.payoutReadyAt = new Date();
      profile.save().catch((err) => {
        console.error("payoutReadyAt backfill failed:", err?.message || err);
      });
    }

    return res.json({
      success: true,
      eligible: true,
      profile: serializeProfile(profile, {
        payoutReady,
        hasAvatar: !!req.user.avatarUrl,
        viewerEmail: req.user.email,
      }),
    });
  } catch (err) {
    console.error("get freelancer profile error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/**
 * PUT /api/freelancer/me
 *
 * Creates or updates the profile, one section at a time. Used by both the
 * onboarding wizard and the edit page afterwards — anything absent from the body
 * is left alone.
 *
 * Editing an ACTIVE profile does NOT take it offline: there is no review step to
 * re-enter. The status only ever moves DRAFT → ACTIVE, and only via /activate.
 */
router.put("/me", requireAuth, blockIfSuspended, withCatalog, async (req, res) => {
  try {
    if (req.user.userType === "TM") {
      return res.status(403).json({
        success: false,
        error: "team_member",
        message: "Your organization handles client work.",
      });
    }

    let profile = await FreelancerProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = new FreelancerProfile({
        userId: req.user._id,
        // Pre-filled from the account so the freelancer edits a name rather than
        // typing one from scratch.
        displayName: str(req.user.name, 120),
        country: str(req.user.location, 80),
      });
    }

    const body = req.body || {};

    /* ── Identity ── */
    if (body.displayName !== undefined) profile.displayName = str(body.displayName, 120);
    if (body.professionalTitle !== undefined) {
      profile.professionalTitle = str(body.professionalTitle, 120);
    }
    if (body.about !== undefined) profile.about = str(body.about, 3000);
    if (body.country !== undefined) profile.country = str(body.country, 80);
    if (body.city !== undefined) profile.city = str(body.city, 80);

    if (Array.isArray(body.languages)) {
      const seen = new Set();
      profile.languages = body.languages
        .map((l) => ({
          name: str(l?.name, 60),
          level: LANGUAGE_LEVELS.includes(l?.level) ? l.level : "conversational",
        }))
        .filter((l) => {
          if (!l.name) return false;
          const key = l.name.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 15);
    }

    /* ── Skills ──
       The client sends what the picker holds; each entry is resolved against the
       catalog so a name the client made up can't land on a profile. */
    if (Array.isArray(body.skills)) {
      const wanted = body.skills
        .map((s) => ({
          slug: Skill.slugify(s?.slug || s?.name),
          level: SKILL_LEVELS.includes(s?.level) ? s.level : "intermediate",
        }))
        .filter((s) => s.slug);

      // De-duplicated before the lookup: the same skill twice at two levels is
      // meaningless, and first-listed is the freelancer's own ordering.
      const bySlug = new Map();
      for (const entry of wanted) if (!bySlug.has(entry.slug)) bySlug.set(entry.slug, entry);

      const rows = await Skill.find({ slug: { $in: [...bySlug.keys()] } })
        .select("name slug")
        .lean();
      const rowBySlug = new Map(rows.map((r) => [r.slug, r]));

      profile.skills = [...bySlug.values()]
        .filter((entry) => rowBySlug.has(entry.slug))
        .slice(0, 30)
        .map((entry) => {
          const row = rowBySlug.get(entry.slug);
          return { skillId: row._id, name: row.name, slug: row.slug, level: entry.level };
        });
    }

    /* ── Specializations ── */
    if (Array.isArray(body.specializations)) {
      const ids = body.specializations
        .map((v) => (typeof v === "string" ? v : v?._id))
        .filter((id) => mongoose.Types.ObjectId.isValid(id));

      // Filtered through the catalog for the same reason as skills: only rows
      // that exist and are still active may be claimed.
      const valid = await Specialization.find({ _id: { $in: ids }, active: true })
        .select("_id")
        .lean();
      const validIds = new Set(valid.map((v) => String(v._id)));

      profile.specializations = [...new Set(ids.filter((id) => validIds.has(String(id))))].slice(0, 8);
    }

    /* ── Credentials ── */
    if (Array.isArray(body.workExperience)) {
      profile.workExperience = body.workExperience
        .map((w) => ({
          title: str(w?.title, 120),
          company: str(w?.company, 120),
          from: clampMonth(w?.from),
          to: w?.current ? null : clampMonth(w?.to),
          current: !!w?.current,
          description: str(w?.description, 1200),
        }))
        .filter((w) => w.title)
        .slice(0, 15);
    }

    if (Array.isArray(body.education)) {
      profile.education = body.education
        .map((e) => ({
          institution: str(e?.institution, 160),
          degree: str(e?.degree, 120),
          fieldOfStudy: str(e?.fieldOfStudy, 120),
          from: clampMonth(e?.from),
          to: clampMonth(e?.to),
        }))
        .filter((e) => e.institution)
        .slice(0, 10);
    }

    if (Array.isArray(body.certifications)) {
      profile.certifications = body.certifications
        .map((c) => ({
          name: str(c?.name, 160),
          issuer: str(c?.issuer, 160),
          issuedAt: clampMonth(c?.issuedAt),
          url: str(c?.url, 500),
        }))
        .filter((c) => c.name)
        .slice(0, 15);
    }

    if (Array.isArray(body.portfolioLinks)) {
      profile.portfolioLinks = body.portfolioLinks
        .map((l) => str(l, 500))
        .filter(Boolean)
        .slice(0, 10);
    }

    if (body.hourlyRate !== undefined) {
      const rate = Number(body.hourlyRate);
      profile.hourlyRate = Number.isFinite(rate) && rate >= 0 ? Math.round(rate) : null;
    }
    if (body.availability !== undefined) {
      profile.availability = ["full_time", "part_time", "occasional"].includes(body.availability)
        ? body.availability
        : null;
    }

    await profile.save();

    if (req.user.freelancerStatus !== profile.status) {
      await User.updateOne({ _id: req.user._id }, { $set: { freelancerStatus: profile.status } });
    }

    await profile.populate("specializations", "name slug group");

    return res.json({
      success: true,
      profile: serializeProfile(profile, {
        payoutReady: !!profile.payoutReadyAt,
        hasAvatar: !!req.user.avatarUrl,
        viewerEmail: req.user.email,
      }),
    });
  } catch (err) {
    console.error("save freelancer profile error:", err);
    if (err?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "validation_failed",
        message: Object.values(err.errors || {})[0]?.message || "Some details look invalid.",
      });
    }
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/**
 * POST /api/freelancer/me/activate
 * DRAFT → ACTIVE. The profile goes live immediately — no admin involved.
 *
 * The only gate is completeness, and no payout account is required.
 */
router.post("/me/activate", requireAuth, blockIfSuspended, async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOne({ userId: req.user._id }).populate(
      "specializations",
      "name slug group"
    );

    if (!profile) {
      return res.status(404).json({ success: false, error: "no_profile" });
    }

    const errors = profile.completenessErrors();
    if (errors.length) {
      return res.status(400).json({
        success: false,
        error: "incomplete_profile",
        message: "A few things are still missing.",
        errors,
      });
    }

    // Idempotent: re-activating an already-live profile is a no-op rather than a
    // conflict, so a double-clicked button or a retried request is harmless.
    if (profile.status !== "ACTIVE") {
      profile.status = "ACTIVE";
      profile.activatedAt = new Date();
      await syncSkillUsage(profile);
      await profile.save();

      await User.updateOne({ _id: req.user._id }, { $set: { freelancerStatus: "ACTIVE" } });
    }

    return res.json({
      success: true,
      profile: serializeProfile(profile, {
        payoutReady: !!profile.payoutReadyAt,
        hasAvatar: !!req.user.avatarUrl,
        viewerEmail: req.user.email,
      }),
    });
  } catch (err) {
    console.error("activate freelancer profile error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// Applies the difference between the skills this profile has already been
// counted for and the ones it now claims, so Skill.usageCount reflects live
// profiles. Counted at activation rather than on every draft save — otherwise
// anyone could inflate the suggestion list without publishing anything.
async function syncSkillUsage(profile) {
  const current = new Set((profile.skills || []).map((s) => s.slug).filter(Boolean));
  const counted = new Set(profile.countedSkillSlugs || []);

  const added = [...current].filter((slug) => !counted.has(slug));
  const removed = [...counted].filter((slug) => !current.has(slug));

  const ops = [];
  if (added.length) ops.push(Skill.updateMany({ slug: { $in: added } }, { $inc: { usageCount: 1 } }));
  if (removed.length) {
    ops.push(Skill.updateMany({ slug: { $in: removed } }, { $inc: { usageCount: -1 } }));
  }
  if (ops.length) await Promise.all(ops);

  profile.countedSkillSlugs = [...current];
}

/* ═══════════════════════ INTRO VIDEO ═══════════════════════ */

/**
 * POST /api/freelancer/me/intro-video   (multipart, field name "video")
 *
 * Validates against the published requirements and queues the video for admin
 * review. This is the only part of a freelancer profile an admin approves.
 *
 * On any rejection the uploaded file is deleted rather than kept — an unusable
 * video that nobody will ever approve is just disk.
 */
router.post(
  "/me/intro-video",
  requireAuth,
  blockIfSuspended,
  (req, res, next) => {
    uploadIntroVideo.single("video")(req, res, (err) => {
      if (!err) return next();

      // Multer's own errors are surfaced as advice, not as a stack trace: the
      // size limit in particular is the most likely failure and the freelancer
      // needs to be told the number.
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          error: "file_too_large",
          message: `Your video must be under ${Math.round(
            INTRO_VIDEO_RULES.maxBytes / 1024 / 1024 / 1024
          )} GB.`,
        });
      }
      if (err.message === "unsupported_video_type") {
        return res.status(400).json({
          success: false,
          error: "unsupported_video_type",
          message: "Upload an MP4, MOV or WebM video.",
        });
      }
      console.error("intro video upload error:", err);
      return res.status(400).json({
        success: false,
        error: "upload_failed",
        message: "That file couldn't be uploaded. Please try again.",
      });
    });
  },
  async (req, res) => {
    const filePath = req.file?.path;

    try {
      if (req.user.userType === "TM") {
        discard(filePath);
        return res.status(403).json({ success: false, error: "team_member" });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, error: "no_file", message: "No video received." });
      }

      const profile = await FreelancerProfile.findOne({ userId: req.user._id });
      if (!profile) {
        discard(filePath);
        return res.status(404).json({
          success: false,
          error: "no_profile",
          message: "Create your freelancer profile before adding an intro video.",
        });
      }

      // A video already in the queue must not be replaced mid-review — the
      // admin would be approving something the freelancer has since swapped out.
      if (profile.introVideo?.status === "PENDING") {
        discard(filePath);
        return res.status(409).json({
          success: false,
          error: "video_under_review",
          message:
            "Your current video is being reviewed. You can upload a new one once that's done.",
        });
      }

      let verdict;
      try {
        verdict = await validateIntroVideo(filePath, req.file.size);
      } catch (probeErr) {
        discard(filePath);
        console.error("intro video probe failed:", probeErr?.message || probeErr);
        return res.status(400).json({
          success: false,
          error: "unreadable_video",
          message:
            "We couldn't read this video. Re-export it as an MP4 (H.264) and try again.",
        });
      }

      if (!verdict.ok) {
        discard(filePath);
        return res.status(400).json({
          success: false,
          error: "video_requirements_not_met",
          message: "This video doesn't meet the requirements.",
          errors: verdict.errors,
          meta: {
            durationSeconds: verdict.meta.durationSeconds,
            width: verdict.meta.width,
            height: verdict.meta.height,
          },
        });
      }

      // The previous file is only removed once the new one has passed, so a
      // failed re-upload never costs the freelancer the video they already had.
      const previousUrl = profile.introVideo?.url;

      profile.introVideo = {
        url: `/uploads/freelancer-intro/${req.file.filename}`,
        status: "PENDING",
        durationSeconds: verdict.meta.durationSeconds,
        width: verdict.meta.width,
        height: verdict.meta.height,
        sizeBytes: req.file.size,
        originalName: str(req.file.originalname, 200),
        uploadedAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
        submissionCount: (profile.introVideo?.submissionCount || 0) + 1,
      };

      await profile.save();

      if (previousUrl && previousUrl !== profile.introVideo.url) {
        discard(path.join(__dirname, "..", previousUrl.replace(/^\//, "")));
      }

      // Best-effort: the upload is already saved and the admin queue is polled
      // anyway, so a notification failure must not read as a failed upload.
      try {
        await notifyAdmins({
          type: "ADMIN_FREELANCER_VIDEO_REVIEW_NEEDED",
          message: `${profile.displayName || req.user.name || "A freelancer"} uploaded an intro video for review${
            profile.introVideo.submissionCount > 1
              ? ` (attempt ${profile.introVideo.submissionCount})`
              : ""
          }.`,
          meta: {
            freelancerProfileId: String(profile._id),
            userId: String(req.user._id),
            durationSeconds: profile.introVideo.durationSeconds,
          },
        });
      } catch (notifyErr) {
        console.error("intro video notify failed:", notifyErr?.message || notifyErr);
      }

      return res.json({
        success: true,
        introVideo: serializeIntroVideo(profile.introVideo, { includePrivate: true }),
        strength: profile.strengthChecklist({ hasAvatar: !!req.user.avatarUrl }),
      });
    } catch (err) {
      discard(filePath);
      console.error("intro video save error:", err);
      return res.status(500).json({ success: false, error: "server_error" });
    }
  }
);

/**
 * DELETE /api/freelancer/me/intro-video
 * Removes the video. Blocked while it's under review, for the same reason a
 * replacement is: the admin is looking at it.
 */
router.delete("/me/intro-video", requireAuth, async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ success: false, error: "no_profile" });

    if (profile.introVideo?.status === "PENDING") {
      return res.status(409).json({
        success: false,
        error: "video_under_review",
        message: "You can't remove a video that's being reviewed.",
      });
    }

    const oldUrl = profile.introVideo?.url;
    profile.introVideo = { status: "NONE", submissionCount: profile.introVideo?.submissionCount || 0 };
    await profile.save();

    if (oldUrl) discard(path.join(__dirname, "..", oldUrl.replace(/^\//, "")));

    return res.json({
      success: true,
      introVideo: serializeIntroVideo(profile.introVideo, { includePrivate: true }),
      strength: profile.strengthChecklist({ hasAvatar: !!req.user.avatarUrl }),
    });
  } catch (err) {
    console.error("delete intro video error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ═══════════════════════ BROWSE ═══════════════════════ */

/**
 * GET /api/freelancer/browse?q=&specialization=&page=1&limit=24
 *
 * The freelancer directory behind /find-creators. Public — browsing talent is
 * how someone decides whether to sign up, so it must work logged out.
 *
 * ACTIVE profiles only, same as the single-profile read: a draft is not a
 * listing. `specialization` takes a slug rather than an id so the filter can
 * live in a shareable URL.
 */
router.get("/browse", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 60);
    const q = str(req.query.q, 80);
    const specialization = str(req.query.specialization, 80);

    const filter = { status: "ACTIVE" };

    if (specialization) {
      const spec = await Specialization.findOne({ slug: specialization }).select("_id").lean();
      // An unknown slug matches nothing rather than being ignored — silently
      // returning everyone would look like the filter had been applied.
      if (!spec) {
        return res.json({
          success: true,
          freelancers: [],
          total: 0,
          page,
          pages: 1,
        });
      }
      filter.specializations = spec._id;
    }

    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      // Skill name is included because "react" is what someone actually types
      // when looking for a React developer — matching only titles would miss
      // most of the people they want.
      filter.$or = [
        { displayName: rx },
        { professionalTitle: rx },
        { "skills.name": rx },
        { country: rx },
        { city: rx },
      ];
    }

    const [rows, total] = await Promise.all([
      FreelancerProfile.find(filter)
        // Newest live profiles first. There is no ranking signal worth using
        // yet — ratings live on User and aren't populated for most freelancers.
        .sort({ activatedAt: -1, updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "name avatarUrl isVerified sellerStatus isDeleted")
        .populate("specializations", "name slug")
        .lean(),
      FreelancerProfile.countDocuments(filter),
    ]);

    const visibleRows = rows.filter(
      // A suspended or deleted account keeps its profile document but must not
      // be offered as someone to hire.
      (p) => p.userId && !p.userId.isDeleted && p.userId.sellerStatus !== "SUSPENDED"
    );

    /* Who can actually be PAID.
       Money for a hire is routed to the freelancer's Razorpay linked account
       and held there, so an account Razorpay hasn't ACTIVATED can't receive it
       — a proposal sent to one is a dead end the client only discovers after
       writing a whole brief. The card disables Hire (but not Message) on the
       strength of this, and the proposal endpoint enforces the same thing.

       One query for the whole page rather than per row. */
    const payoutReadyIds = new Set(
      (
        await BankAccount.find({
          userId: { $in: visibleRows.map((p) => p.userId._id) },
          routeStatus: "CREATED",
          activationStatus: "ACTIVATED",
          routeLinkedAccountId: { $ne: null },
        })
          .select("userId")
          .lean()
      ).map((b) => String(b.userId))
    );

    /* Who is actually cleared to take work.
       The same rule the service and proposal endpoints enforce: an APPROVED
       intro video, or an allowlisted account. The directory has to know it too
       — a card that badges someone as a Super Creator and offers Hire, when the
       proposal endpoint will refuse, sends the client through a whole brief to
       reach a 409. One query for the page, same shape as payoutReady above. */
    const allowlisted = await allowlistedUserIds(visibleRows.map((p) => p.userId._id));

    const freelancers = visibleRows
      .map((p) => ({
        userId: String(p.userId._id),
        name: p.displayName || p.userId.name || "Unknown",
        avatar: p.userId.avatarUrl || null,
        verified: !!p.userId.isVerified,
        professionalTitle: p.professionalTitle || "",
        country: p.country || "",
        city: p.city || "",
        // Capped: a card shows a handful, and shipping thirty skills per row
        // makes the directory payload far bigger than what it renders.
        skills: (p.skills || []).slice(0, 6).map((s) => ({ name: s.name, slug: s.slug })),
        skillCount: p.skills?.length || 0,
        specializations: (p.specializations || []).map((sp) => ({
          _id: String(sp._id),
          name: sp.name,
          slug: sp.slug,
        })),
        hourlyRate: p.hourlyRate ?? null,
        availability: p.availability || null,
        hasIntroVideo: p.introVideo?.status === "APPROVED",
        /* Cleared to sell services and be hired. Distinct from hasIntroVideo,
           which stays literal — an allowlisted account has no video to show,
           and claiming otherwise on the card would be a lie about the person. */
        superCreator:
          p.introVideo?.status === "APPROVED" || allowlisted.has(String(p.userId._id)),
        activatedAt: p.activatedAt,
        // false = still setting up payouts, so Hire is disabled on their card.
        payoutReady: payoutReadyIds.has(String(p.userId._id)),
      }));

    return res.json({
      success: true,
      freelancers,
      total,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (err) {
    console.error("browse freelancers error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ═══════════════════════ PUBLIC PROFILE ═══════════════════════ */

/**
 * GET /api/freelancer/public/:userId
 *
 * ACTIVE profiles only, and only the presentable fields. Returns 200 with
 * profile: null rather than 404, so ProfilePage can render the rest of the page
 * without treating "not a freelancer" as a failed request.
 */
router.get("/public/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: "invalid_user_id" });
    }

    const profile = await FreelancerProfile.findOne({ userId, status: "ACTIVE" })
      .populate("specializations", "name slug group description")
      .lean();

    if (!profile) return res.json({ success: true, profile: null });

    // Whether a hire proposal to this person could actually be paid out. The
    // profile's Hire button disables on this, so the client finds out here
    // rather than after writing a brief the freelancer can't accept.
    const payoutAccount = await BankAccount.findOne({
      userId,
      routeStatus: "CREATED",
      activationStatus: "ACTIVATED",
      routeLinkedAccountId: { $ne: null },
    })
      .select("_id")
      .lean();

    /* The other half of "can this person be hired": an approved intro video,
       or an allowlisted account. Sent as a sibling of payoutReady because the
       profile's Hire button has to answer the same question the proposal
       endpoint will — the alternative is a client writing a brief to reach a
       409. Only computed for the unapproved case; approved needs no lookup. */
    const videoApproved = profile.introVideo?.status === "APPROVED";
    const superCreator =
      videoApproved || (await allowlistedUserIds([profile.userId])).size > 0;

    return res.json({
      success: true,
      payoutReady: Boolean(payoutAccount),
      superCreator,
      profile: {
        userId: String(profile.userId),
        displayName: profile.displayName,
        professionalTitle: profile.professionalTitle,
        about: profile.about,
        country: profile.country,
        city: profile.city,
        languages: profile.languages || [],
        skills: (profile.skills || []).map((s) => ({
          name: s.name,
          slug: s.slug,
          level: s.level,
        })),
        specializations: (profile.specializations || []).map((sp) => ({
          _id: String(sp._id),
          name: sp.name,
          slug: sp.slug,
          group: sp.group,
        })),
        workExperience: profile.workExperience || [],
        education: profile.education || [],
        certifications: profile.certifications || [],
        portfolioLinks: profile.portfolioLinks || [],
        // Approved videos only — serializeIntroVideo nulls the URL otherwise.
        introVideo: serializeIntroVideo(profile.introVideo),
        hourlyRate: profile.hourlyRate,
        availability: profile.availability,
        // Doubles as the "freelancer since" line on the profile header.
        activatedAt: profile.activatedAt,
      },
    });
  } catch (err) {
    console.error("public freelancer profile error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
