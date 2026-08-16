// Admin control over a creator's star rating.
//
// The case for it: a refund gets approved, or a dispute is ruled against a
// creator, and until now nothing about that touched their rating. A creator
// could deliver nothing, lose the dispute, be refunded against, and still sit
// on 4.9 stars — because the buyer who was wronged usually doesn't come back to
// leave a review, and the ones who do are already the happy ones.
//
// What this deliberately is NOT: automatic. A refund is not proof of fault — a
// buyer can change their mind, or a product can be perfectly good and simply
// not what they pictured. Docking a creator's livelihood on that signal alone
// would be unjust and would train creators to fight every refund. An admin
// reads the case and decides; this is the instrument, not the rule.
//
// Everything here is recorded, reversible and emailed to the creator.

const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const RatingPenalty = require("../models/RatingPenalty");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { requireAuth } = require("../utils/auth");
const { recomputeUserRating } = require("../utils/sellerRating");
const {
  sendRatingPenaltyEmail,
  sendRatingPenaltyRevokedEmail,
} = require("../services/creatorEmail.service");

// Same local guard the other admin routers use: requireAuth sets req.isAdmin
// from the admin JWT, this rejects everyone else.
function requireAdmin(req, res, next) {
  if (!req.isAdmin) return res.status(403).json({ success: false, error: "forbidden" });
  next();
}

router.use(requireAuth, requireAdmin);

const isId = (v) => mongoose.Types.ObjectId.isValid(v);

const publicPenalty = (p) => ({
  id: String(p._id),
  stars: p.stars,
  reason: p.reason,
  context: p.context,
  active: p.active,
  appliedBy: p.appliedByAdminEmail || "admin",
  appliedAt: p.createdAt,
  revokedAt: p.revokedAt,
  revokeReason: p.revokeReason || "",
});

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/admin/rating-penalties/:creatorId
   Everything ever applied to this creator, and what it currently adds up to.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/:creatorId", async (req, res) => {
  try {
    const { creatorId } = req.params;
    if (!isId(creatorId)) {
      return res.status(400).json({ success: false, error: "invalid_creator_id" });
    }

    const [penalties, creator] = await Promise.all([
      RatingPenalty.find({ creatorId }).sort({ createdAt: -1 }).limit(100).lean(),
      User.findById(creatorId).select("name email sellerRating sellerReviewsCount sellerRatingPenalty").lean(),
    ]);

    if (!creator) return res.status(404).json({ success: false, error: "creator_not_found" });

    return res.json({
      success: true,
      creator: {
        id: String(creator._id),
        name: creator.name,
        email: creator.email,
        rating: creator.sellerRating || 0,
        reviews: creator.sellerReviewsCount || 0,
        penaltyTotal: creator.sellerRatingPenalty || 0,
      },
      penalties: penalties.map(publicPenalty),
    });
  } catch (err) {
    console.error("GET /api/admin/rating-penalties/:creatorId error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/admin/rating-penalties
   body: { creatorId, stars, reason, context: { kind, refundRequestId?,
           disputeId?, orderKind?, orderId?, promptId?, title? } }
   ══════════════════════════════════════════════════════════════════════════ */
router.post("/", async (req, res) => {
  try {
    const { creatorId, stars, reason, context } = req.body || {};

    if (!isId(creatorId)) {
      return res.status(400).json({ success: false, error: "invalid_creator_id" });
    }

    const amount = Number(stars);
    if (!Number.isFinite(amount) || amount < 0.1 || amount > 5) {
      return res.status(400).json({
        success: false,
        error: "invalid_stars",
        message: "Deduction must be between 0.1 and 5 stars.",
      });
    }

    /* Required, and not a formality: this text is what the creator is shown and
       what a future admin reads when deciding whether it was fair. */
    const why = String(reason || "").trim();
    if (why.length < 10) {
      return res.status(400).json({
        success: false,
        error: "reason_required",
        message: "Write a reason the creator can act on — at least a sentence.",
      });
    }

    const kind = ["refund", "dispute", "manual"].includes(context?.kind) ? context.kind : "manual";

    const creator = await User.findById(creatorId).select("name email").lean();
    if (!creator) return res.status(404).json({ success: false, error: "creator_not_found" });

    const doc = {
      creatorId,
      stars: amount,
      reason: why,
      context: {
        kind,
        refundRequestId: isId(context?.refundRequestId) ? context.refundRequestId : null,
        disputeId: isId(context?.disputeId) ? context.disputeId : null,
        orderKind: context?.orderKind || null,
        orderId: isId(context?.orderId) ? context.orderId : null,
        promptId: isId(context?.promptId) ? context.promptId : null,
        title: String(context?.title || "").slice(0, 200),
      },
      appliedByAdminId: req.user?._id || null,
      appliedByAdminEmail: req.user?.email || "",
      active: true,
    };

    let penalty;
    try {
      penalty = await RatingPenalty.create(doc);
    } catch (dupErr) {
      // The partial unique indexes: one live penalty per refund, one per
      // dispute. Two admins on the same queue would otherwise both dock it.
      if (dupErr?.code === 11000) {
        return res.status(409).json({
          success: false,
          error: "already_penalised",
          message: "This case already has an active rating penalty on it.",
        });
      }
      throw dupErr;
    }

    const summary = await recomputeUserRating(creatorId);

    /* Told, always. A rating that drops without explanation is indistinguishable
       from a bug, and the creator can't appeal what they don't know about. */
    const contextLabel =
      kind === "refund"
        ? `a refund on "${doc.context.title || "one of your products"}"`
        : kind === "dispute"
          ? `a dispute on "${doc.context.title || "one of your orders"}"`
          : "your account";

    try {
      await Notification.create({
        receiverUserId: creatorId,
        senderName: "Tokun",
        type: "RATING_PENALTY_APPLIED",
        message: `Your creator rating was reduced by ${amount} star${amount === 1 ? "" : "s"}: ${why}`,
        meta: { penaltyId: String(penalty._id), stars: amount, kind },
      });
    } catch (notifyErr) {
      console.error("Rating penalty notification failed:", notifyErr.message);
    }

    try {
      await sendRatingPenaltyEmail({
        to: creator.email,
        creatorName: creator.name,
        stars: amount,
        reason: why,
        newRating: summary.rating,
        contextLabel,
      });
    } catch (mailErr) {
      console.error("Rating penalty email failed (penalty still applied):", mailErr.message);
    }

    return res.json({ success: true, penalty: publicPenalty(penalty), summary });
  } catch (err) {
    console.error("POST /api/admin/rating-penalties error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   PATCH /api/admin/rating-penalties/:id/revoke   body: { note? }
   Lifts the deduction. The row stays — an over-penalty that vanished without
   trace is how the same mistake gets made twice.
   ══════════════════════════════════════════════════════════════════════════ */
router.patch("/:id/revoke", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ success: false, error: "invalid_id" });

    const penalty = await RatingPenalty.findById(id);
    if (!penalty) return res.status(404).json({ success: false, error: "penalty_not_found" });
    if (!penalty.active) {
      return res.status(400).json({ success: false, error: "already_revoked" });
    }

    penalty.active = false;
    penalty.revokedAt = new Date();
    penalty.revokedByAdminId = req.user?._id || null;
    penalty.revokeReason = String(req.body?.note || "").trim().slice(0, 1000);
    await penalty.save();

    const summary = await recomputeUserRating(penalty.creatorId);

    try {
      const creator = await User.findById(penalty.creatorId).select("name email").lean();
      if (creator?.email) {
        await sendRatingPenaltyRevokedEmail({
          to: creator.email,
          creatorName: creator.name,
          stars: penalty.stars,
          newRating: summary.rating,
          note: penalty.revokeReason,
        });
      }
    } catch (mailErr) {
      console.error("Rating penalty revoke email failed:", mailErr.message);
    }

    return res.json({ success: true, penalty: publicPenalty(penalty), summary });
  } catch (err) {
    console.error("PATCH /api/admin/rating-penalties/:id/revoke error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
