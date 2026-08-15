// utils/superCreatorGate.js
//
// The one rule that decides whether someone may sell services or take on hire
// work: an admin must have APPROVED their intro video.
//
// Both entry points — POST /api/service and POST /api/hire/create-proposal —
// call this. Kept in one file on purpose: they are two different routers, and a
// rule copied into both drifts the moment one is edited. That has already
// happened twice in this codebase (two refund dialogs, two CORS origin lists).
//
// Before this existed there was no video check at all. A profile went live as
// soon as onboarding finished, so anyone could publish services and be hired
// while their video sat unreviewed in the admin queue — the review existed but
// gated nothing.

const FreelancerProfile = require("../models/FreelancerProfile");
const User = require("../models/User");

/* Accounts exempt from the video requirement. This is a deliberate, temporary
   hole: the rule below went live while existing Super Creators already had
   ACTIVE profiles and no uploaded video, and these accounts must keep selling
   while they record one. Everyone else waits for an approval.

   Emails, not ids, so the list survives a reseeded database — matched against
   the lowercased User.email, which the schema already stores lowercased. */
const VIDEO_GATE_ALLOWLIST = new Set(["shivani@gmail.com"]);

/** The membership test itself. Everything below is a way of getting an email. */
function isAllowlistedEmail(email) {
  return Boolean(email && VIDEO_GATE_ALLOWLIST.has(String(email).trim().toLowerCase()));
}

/* Only consulted when the gate is about to refuse, so an approved creator never
   pays for the extra lookup. */
async function isAllowlisted(userId) {
  if (VIDEO_GATE_ALLOWLIST.size === 0) return false;
  const user = await User.findById(userId).select("email").lean();
  return isAllowlistedEmail(user?.email);
}

/**
 * The same allowlist answer for a whole page of people, in one query.
 *
 * The directory (GET /api/freelancer/browse) has to badge every row with
 * whether that person is actually cleared to take work, and asking per row
 * would be a User lookup per card.
 *
 * @param {Array<string|object>} userIds
 * @returns {Promise<Set<string>>} the subset that is allowlisted, as strings
 */
async function allowlistedUserIds(userIds) {
  if (VIDEO_GATE_ALLOWLIST.size === 0 || !userIds?.length) return new Set();

  const users = await User.find({
    _id: { $in: userIds },
    email: { $in: [...VIDEO_GATE_ALLOWLIST] },
  })
    .select("_id")
    .lean();

  return new Set(users.map((u) => String(u._id)));
}

/* Why each state is refused, in words a buyer-facing client can show as-is.
   NONE and PENDING are not failures on the user's part, so they read as
   progress rather than rejection. */
const VIDEO_STATE_MESSAGES = {
  NONE: "Upload your intro video and wait for it to be approved before you can offer services or take on work.",
  PENDING: "Your intro video is waiting for admin approval. You can offer services and be hired once it's approved.",
  REJECTED: "Your intro video was rejected. Upload a new one to offer services or be hired.",
};

/**
 * @returns {Promise<{ok: true} | {ok: false, status: number, error: string, message: string}>}
 *
 * Never throws for a "not allowed" answer — the callers turn this straight into
 * a response, and an exception would be indistinguishable from a real fault.
 */
async function assertSuperCreatorActive(userId) {
  const profile = await FreelancerProfile.findOne({ userId })
    .select("status introVideo.status")
    .lean();

  if (!profile) {
    return {
      ok: false,
      status: 403,
      error: "not_a_super_creator",
      message: "Set up your Super Creator profile first.",
    };
  }

  const videoStatus = profile.introVideo?.status || "NONE";
  if (videoStatus !== "APPROVED") {
    if (await isAllowlisted(userId)) return { ok: true };
    return {
      ok: false,
      status: 403,
      error: "intro_video_not_approved",
      message: VIDEO_STATE_MESSAGES[videoStatus] || VIDEO_STATE_MESSAGES.NONE,
      videoStatus,
    };
  }

  return { ok: true };
}

module.exports = {
  assertSuperCreatorActive,
  allowlistedUserIds,
  isAllowlistedEmail,
  VIDEO_STATE_MESSAGES,
  VIDEO_GATE_ALLOWLIST,
};
