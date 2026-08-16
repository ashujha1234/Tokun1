// routes/adminFreelancers.js
//
// Admin screens for freelancers.
//
// THE PROFILE IS NOT REVIEWED. A freelancer profile goes live the moment its
// owner finishes onboarding, so this file has no approve/reject for profiles —
// GET / is a read-only roster for support and oversight.
//
// The one thing an admin decides is the INTRO VIDEO. It's the only field where a
// freelancer publishes footage of a person under Tokun's name, so it sits in a
// PENDING queue until someone watches it. Rejection always carries a reason,
// shown to the freelancer verbatim — the point is for them to re-shoot, which an
// opaque rejection makes impossible.

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const FreelancerProfile = require("../models/FreelancerProfile");
const User = require("../models/User");
const Notification = require("../models/Notification");
const {
  sendIntroVideoApprovedEmail,
  sendIntroVideoRejectedEmail,
} = require("../services/creatorEmail.service");

const { requireAuth } = require("../utils/auth");
const {
  isAllowlistedEmail,
  VIDEO_GATE_ALLOWLIST,
} = require("../utils/superCreatorGate");

// Same shape as the other admin routers in this folder (adminRefunds.js,
// adminOrgs.js): requireAuth resolves an admin token to req.isAdmin.
function requireAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ success: false, error: "forbidden" });
  }
  next();
}

router.use(requireAuth, requireAdmin);

const VIDEO_STATUSES = ["PENDING", "APPROVED", "REJECTED", "NONE"];
const PROFILE_STATUSES = ["ACTIVE", "DRAFT"];
// Roster slices. Absent = every profile of the requested status.
const ROSTER_VIEWS = ["trading", "blocked"];

/** Row shape for both tables — enough to triage without opening the detail view. */
function serializeRow(profile) {
  const user = profile.userId && profile.userId._id ? profile.userId : null;
  const video = profile.introVideo || {};

  return {
    _id: String(profile._id),
    status: profile.status,
    displayName: profile.displayName,
    professionalTitle: profile.professionalTitle,
    country: profile.country,
    city: profile.city,
    skillCount: profile.skills?.length || 0,
    // First few only; the detail view has the rest.
    topSkills: (profile.skills || []).slice(0, 4).map((s) => s.name),
    specializations: (profile.specializations || []).map((sp) => sp?.name).filter(Boolean),
    activatedAt: profile.activatedAt,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    introVideo: {
      status: video.status || "NONE",
      url: video.url || null,
      durationSeconds: video.durationSeconds ?? null,
      width: video.width ?? null,
      height: video.height ?? null,
      sizeBytes: video.sizeBytes ?? null,
      originalName: video.originalName || "",
      uploadedAt: video.uploadedAt || null,
      reviewedAt: video.reviewedAt || null,
      rejectionReason: video.rejectionReason || null,
      submissionCount: video.submissionCount || 0,
    },
    /* Exempt from the video rule by allowlist, so this profile can sell and be
       hired with the video in any state. Sent so the roster doesn't read as a
       bug — an admin seeing a NONE video on a creator who is clearly trading
       would otherwise go looking for one. */
    videoGateExempt: isAllowlistedEmail(user?.email),
    user: user
      ? {
          _id: String(user._id),
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          userType: user.userType,
          kycStatus: user.kycStatus,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        }
      : null,
  };
}

// Shared by both list endpoints. `q` searches the profile's own text plus the
// applicant's account, so an email from a support ticket finds the right row.
async function buildSearchFilter(q) {
  if (!q) return null;

  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rx = new RegExp(safe, "i");

  const matchingUsers = await User.find({ $or: [{ name: rx }, { email: rx }] })
    .select("_id")
    .limit(200)
    .lean();

  return [
    { displayName: rx },
    { professionalTitle: rx },
    { "skills.name": rx },
    ...(matchingUsers.length ? [{ userId: { $in: matchingUsers.map((u) => u._id) } }] : []),
  ];
}

/**
 * How many live profiles can actually trade.
 *
 * "Live" and "Super Creator" stopped meaning the same thing when the intro
 * video became a gate: a profile can be ACTIVE, complete and discoverable and
 * still be unable to publish a service or accept a proposal. A roster that only
 * counts ACTIVE reads as "N Super Creators" and overstates the platform — which
 * is how five profiles with no video between them looked like five working
 * creators.
 *
 * Two counts rather than a scan of every ACTIVE profile: the allowlist is
 * resolved to ids first, so both halves are index-served countDocuments.
 */
async function allowlistedUserIds() {
  if (VIDEO_GATE_ALLOWLIST.size === 0) return [];
  const users = await User.find({ email: { $in: [...VIDEO_GATE_ALLOWLIST] } })
    .select("_id")
    .lean();
  return users.map((u) => u._id);
}

async function countTrading() {
  const allowlistedIds = await allowlistedUserIds();

  const [approved, exempt, live] = await Promise.all([
    FreelancerProfile.countDocuments({ status: "ACTIVE", "introVideo.status": "APPROVED" }),
    allowlistedIds.length
      ? FreelancerProfile.countDocuments({
          status: "ACTIVE",
          userId: { $in: allowlistedIds },
          "introVideo.status": { $ne: "APPROVED" },
        })
      : 0,
    FreelancerProfile.countDocuments({ status: "ACTIVE" }),
  ]);

  const trading = approved + exempt;
  return { trading, blocked: Math.max(live - trading, 0), live };
}

/**
 * GET /api/admin/freelancers/videos?status=PENDING&q=&page=1&limit=25
 *
 * The review queue. Oldest upload first inside PENDING — a queue sorted
 * newest-first starves whoever has been waiting longest.
 */
router.get("/videos", async (req, res) => {
  try {
    const status = VIDEO_STATUSES.includes(req.query.status) ? req.query.status : "PENDING";
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const q = String(req.query.q || "").trim();

    const filter = { "introVideo.status": status };

    const searchOr = await buildSearchFilter(q);
    if (searchOr) filter.$or = searchOr;

    const sort =
      status === "PENDING"
        ? { "introVideo.uploadedAt": 1 }
        : { "introVideo.reviewedAt": -1, updatedAt: -1 };

    const [rows, total, counts] = await Promise.all([
      FreelancerProfile.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "name email avatarUrl userType kycStatus isVerified createdAt")
        .populate("specializations", "name slug")
        .lean(),
      FreelancerProfile.countDocuments(filter),
      // Drives the tab badges, so it ignores the current filter.
      FreelancerProfile.aggregate([
        { $group: { _id: "$introVideo.status", count: { $sum: 1 } } },
      ]),
    ]);

    const statusCounts = VIDEO_STATUSES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
    for (const c of counts) {
      const key = c._id || "NONE";
      if (key in statusCounts) statusCounts[key] = c.count;
    }

    return res.json({
      success: true,
      profiles: rows.map(serializeRow),
      total,
      page,
      limit,
      pages: Math.max(Math.ceil(total / limit), 1),
      statusCounts,
    });
  } catch (err) {
    console.error("admin freelancer video queue error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/**
 * GET /api/admin/freelancers?status=ACTIVE&q=&page=1&limit=25
 *
 * Read-only roster of freelancers. There is nothing to approve here — it exists
 * so support can look someone up.
 */
router.get("/", async (req, res) => {
  try {
    const status = PROFILE_STATUSES.includes(req.query.status) ? req.query.status : "ACTIVE";
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const q = String(req.query.q || "").trim();

    /* Which slice of the roster. "Super Creators" is the ones who can actually
       trade, not everyone with a published profile — an admin asking "how many
       Super Creators do we have" is asking how many can take work today, and
       the two numbers are nothing alike while the video queue is backed up. */
    const view = ROSTER_VIEWS.includes(req.query.view) ? req.query.view : null;

    const filter = { status };
    const and = [];

    const searchOr = await buildSearchFilter(q);
    /* $and rather than filter.$or: the clearance clause below is an $or too,
       and a second assignment would silently drop the search. */
    if (searchOr) and.push({ $or: searchOr });

    if (view === "trading" || view === "blocked") {
      const allowlistedIds = await allowlistedUserIds();
      and.push(
        view === "trading"
          ? { $or: [{ "introVideo.status": "APPROVED" }, { userId: { $in: allowlistedIds } }] }
          : { "introVideo.status": { $ne: "APPROVED" }, userId: { $nin: allowlistedIds } }
      );
    }

    if (and.length) filter.$and = and;

    const [rows, total, counts, tradingCounts] = await Promise.all([
      FreelancerProfile.find(filter)
        .sort({ activatedAt: -1, updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "name email avatarUrl userType kycStatus isVerified createdAt")
        .populate("specializations", "name slug")
        .lean(),
      FreelancerProfile.countDocuments(filter),
      FreelancerProfile.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      countTrading(),
    ]);

    const statusCounts = PROFILE_STATUSES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
    for (const c of counts) if (c._id in statusCounts) statusCounts[c._id] = c.count;

    return res.json({
      success: true,
      profiles: rows.map(serializeRow),
      total,
      page,
      limit,
      pages: Math.max(Math.ceil(total / limit), 1),
      statusCounts,
      // Live vs. actually able to trade. See countTrading.
      tradingCounts,
    });
  } catch (err) {
    console.error("admin freelancer roster error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/** GET /api/admin/freelancers/:id — everything the reviewer needs on one screen. */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "invalid_id" });
    }

    const profile = await FreelancerProfile.findById(id)
      .populate(
        "userId",
        "name email avatarUrl userType kycStatus isVerified createdAt location sellerStatus"
      )
      .populate("specializations", "name slug group description")
      .lean();

    if (!profile) return res.status(404).json({ success: false, error: "not_found" });

    return res.json({
      success: true,
      profile: {
        ...serializeRow(profile),
        about: profile.about,
        languages: profile.languages || [],
        skills: profile.skills || [],
        workExperience: profile.workExperience || [],
        education: profile.education || [],
        certifications: profile.certifications || [],
        portfolioLinks: profile.portfolioLinks || [],
        hourlyRate: profile.hourlyRate,
        availability: profile.availability,
        payoutReadyAt: profile.payoutReadyAt,
      },
    });
  } catch (err) {
    console.error("admin freelancer detail error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/**
 * PATCH /api/admin/freelancers/:id/video/approve
 * body: { note? }
 */
router.patch("/:id/video/approve", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "invalid_id" });
    }

    const profile = await FreelancerProfile.findById(id);
    if (!profile) return res.status(404).json({ success: false, error: "not_found" });

    const video = profile.introVideo || {};
    if (video.status === "APPROVED") {
      return res.status(409).json({ success: false, error: "already_approved" });
    }
    // NONE means there is no video at all — approving nothing would publish a
    // dead URL on the profile.
    if (video.status !== "PENDING" && video.status !== "REJECTED") {
      return res.status(409).json({
        success: false,
        error: "no_video_to_review",
        message: "This freelancer hasn't uploaded a video.",
      });
    }
    if (!video.url) {
      return res.status(409).json({
        success: false,
        error: "no_video_file",
        message: "The video file is missing — ask them to upload it again.",
      });
    }

    profile.introVideo.status = "APPROVED";
    profile.introVideo.reviewedAt = new Date();
    profile.introVideo.reviewedBy = req.user._id;
    profile.introVideo.rejectionReason = null;
    await profile.save();

    try {
      await Notification.create({
        receiverUserId: profile.userId,
        type: "FREELANCER_VIDEO_APPROVED",
        message:
          String(req.body?.note || "").trim() ||
          "Your intro video is approved and now showing on your freelancer profile.",
        meta: { freelancerProfileId: String(profile._id) },
      });
    } catch (notifyErr) {
      console.error("video approve notify failed:", notifyErr?.message || notifyErr);
    }

    /* The unlock email. This approval is the gate that decides whether someone
       may list services or take hire work at all (see utils/superCreatorGate.js)
       — the single most consequential moment in a creator's onboarding, and
       until now it happened in silence. */
    try {
      const creator = await User.findById(profile.userId).select("name email").lean();
      if (creator?.email) {
        await sendIntroVideoApprovedEmail({ to: creator.email, creatorName: creator.name });
      }
    } catch (mailErr) {
      console.error("video approve email failed (approval stands):", mailErr?.message || mailErr);
    }

    return res.json({ success: true, status: profile.introVideo.status });
  } catch (err) {
    console.error("admin video approve error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/**
 * PATCH /api/admin/freelancers/:id/video/reject
 * body: { reason, deleteFile? }
 *
 * `reason` is required and shown to the freelancer as-is. `deleteFile` removes
 * the footage as well — used when the content is the problem rather than the
 * format, so it isn't sitting on disk indefinitely.
 */
router.patch("/:id/video/reject", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "invalid_id" });
    }

    const reason = String(req.body?.reason || "").trim().slice(0, 1000);
    if (reason.length < 10) {
      return res.status(400).json({
        success: false,
        error: "reason_required",
        message:
          "Write at least a sentence explaining what's wrong — the freelancer sees this and has to act on it.",
      });
    }

    const profile = await FreelancerProfile.findById(id);
    if (!profile) return res.status(404).json({ success: false, error: "not_found" });

    const video = profile.introVideo || {};
    if (video.status !== "PENDING" && video.status !== "APPROVED") {
      return res.status(409).json({
        success: false,
        error: "no_video_to_review",
        message: "There's no video here to reject.",
      });
    }

    // Rejecting an approved video takes it off the profile immediately — the
    // public read only serves APPROVED, so no separate un-publish step is needed.
    const wasLive = video.status === "APPROVED";
    const oldUrl = video.url;
    const removeFile = req.body?.deleteFile === true;

    profile.introVideo.status = "REJECTED";
    profile.introVideo.reviewedAt = new Date();
    profile.introVideo.reviewedBy = req.user._id;
    profile.introVideo.rejectionReason = reason;
    if (removeFile) profile.introVideo.url = null;
    await profile.save();

    if (removeFile && oldUrl) {
      // Failure here is a housekeeping problem, not something to fail the
      // decision over — the record already says REJECTED.
      fs.promises
        .unlink(path.join(__dirname, "..", oldUrl.replace(/^\//, "")))
        .catch(() => {});
    }

    try {
      await Notification.create({
        receiverUserId: profile.userId,
        type: "FREELANCER_VIDEO_REJECTED",
        message: wasLive
          ? `Your intro video has been taken down: ${reason}`
          : `Your intro video wasn't approved: ${reason}`,
        meta: { freelancerProfileId: String(profile._id), reason, wasLive, fileRemoved: removeFile },
      });
    } catch (notifyErr) {
      console.error("video reject notify failed:", notifyErr?.message || notifyErr);
    }

    // The reason is the whole point of this email — a creator can't fix a video
    // they were never told the problem with, and they stay locked out of
    // services and hire work until they do.
    try {
      const creator = await User.findById(profile.userId).select("name email").lean();
      if (creator?.email) {
        await sendIntroVideoRejectedEmail({
          to: creator.email,
          creatorName: creator.name,
          reason,
        });
      }
    } catch (mailErr) {
      console.error("video reject email failed (rejection stands):", mailErr?.message || mailErr);
    }

    return res.json({ success: true, status: profile.introVideo.status });
  } catch (err) {
    console.error("admin video reject error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
