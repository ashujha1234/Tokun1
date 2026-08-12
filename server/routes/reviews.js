// routes/reviews.js
//
// Reviews between the two sides of a finished booking.
//
// The rule that makes this a rating system rather than a grudge board: you can
// only review someone you actually paid, or were paid by, on a booking that has
// actually concluded — once, in the direction you were on. All of that is
// enforced here, not just hidden in the UI.
//
// Both directions count. A marketplace where only buyers can rate gives clients
// no reason to behave and freelancers no way to warn each other.

const express = require("express");
const mongoose = require("mongoose");
const Review = require("../models/Review");
const User = require("../models/User");
const HireDeal = require("../models/HireDeal");
const ServiceOrder = require("../models/ServiceOrder");
const Purchase = require("../models/Purchase");
const Prompt = require("../models/Prompt");
const Notification = require("../models/Notification");
const { requireAuth } = require("../utils/auth");

const router = express.Router();

/**
 * Recomputes the reviewee's headline rating from scratch.
 *
 * Derived rather than incrementally averaged: an incremental average drifts the
 * moment a review is hidden, edited or removed, and there is no way to notice
 * that it has. Cheap at this scale, and always correct.
 *
 * Only reviews FROM buyers count toward the public seller rating — that's the
 * number the marketplace sorts and badges on, and it should mean "is their work
 * good", not an average of that with "are they pleasant to deliver to".
 */
async function recomputeUserRating(userId) {
  const agg = await Review.aggregate([
    {
      $match: {
        revieweeId: new mongoose.Types.ObjectId(String(userId)),
        hidden: false,
        reviewerRole: "buyer",
      },
    },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const avg = agg[0]?.avg || 0;
  const count = agg[0]?.count || 0;

  await User.findByIdAndUpdate(userId, {
    $set: {
      sellerRating: +avg.toFixed(2),
      sellerReviewsCount: count,
    },
  });

  return { rating: +avg.toFixed(2), count };
}


/* ══════════════════════════════════════════════════════════════════════════
   GET /api/reviews/user/:userId
   Public. What appears on someone's profile.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: "invalid_user_id" });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    // "as a creator" vs "as a client" are separate claims about a person, so
    // they're filterable rather than blended.
    const roleFilter =
      req.query.as === "creator"
        ? { reviewerRole: "buyer" }
        : req.query.as === "client"
        ? { reviewerRole: "seller" }
        : {};

    const filter = { revieweeId: userId, hidden: false, ...roleFilter };

    const [reviews, total, breakdown] = await Promise.all([
      Review.find(filter)
        .populate("reviewerId", "name avatarUrl")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
      // Star distribution — an average of 4.5 built from all 4s and 5s is a
      // different thing from one built from 5s and 1s, and only the histogram
      // shows that.
      Review.aggregate([
        { $match: { revieweeId: new mongoose.Types.ObjectId(userId), hidden: false } },
        {
          $group: {
            _id: { role: "$reviewerRole", rating: "$rating" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const asCreator = { total: 0, sum: 0, stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    const asClient = { total: 0, sum: 0, stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

    for (const row of breakdown) {
      const bucket = row._id.role === "buyer" ? asCreator : asClient;
      bucket.total += row.count;
      bucket.sum += row._id.rating * row.count;
      bucket.stars[row._id.rating] = row.count;
    }

    const summarise = (b) => ({
      total: b.total,
      average: b.total ? +(b.sum / b.total).toFixed(2) : 0,
      stars: b.stars,
    });

    return res.json({
      success: true,
      reviews: reviews.map((r) => ({
        _id: r._id,
        rating: r.rating,
        comment: r.comment,
        orderTitle: r.orderTitle,
        orderKind: r.orderKind,
        outcome: r.outcome,
        reviewerRole: r.reviewerRole,
        reviewer: r.reviewerId
          ? { _id: r.reviewerId._id, name: r.reviewerId.name, avatarUrl: r.reviewerId.avatarUrl }
          : null,
        response: r.response,
        respondedAt: r.respondedAt,
        createdAt: r.createdAt,
      })),
      total,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
      summary: {
        asCreator: summarise(asCreator),
        asClient: summarise(asClient),
      },
    });
  } catch (err) {
    console.error("get user reviews error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/**
 * Has this person actually transacted with that one?
 *
 * This is the whole guard on reviews. Without it, anyone could rate anyone —
 * which in practice means a competitor leaving one star, or a seller's friends
 * leaving five. With it, a review is a statement from someone who paid.
 *
 * Any of the three counts, because all three are real money changing hands:
 *   - bought one of their prompts
 *   - booked one of their services (paid)
 *   - funded a project with them (paid)
 *
 * Checked in both directions: a freelancer who was paid BY someone has equally
 * earned the right to say what they were like to work for.
 *
 * @returns {Promise<{ok: boolean, context?: object, reason?: string}>}
 */
async function findTransactionBetween(reviewerId, revieweeId) {
  const a = String(reviewerId);
  const b = String(revieweeId);

  // Prompt purchases. Purchase has no seller field — the seller is whoever
  // owns the prompt — so the reviewee's own prompts are the starting point.
  const revieweePromptIds = await Prompt.find({ userId: b }).distinct("_id");
  if (revieweePromptIds.length) {
    const purchase = await Purchase.findOne({
      buyer: a,
      prompt: { $in: revieweePromptIds },
      paymentStatus: "SUCCESS",
    })
      .sort({ createdAt: -1 })
      .lean();

    if (purchase) {
      return {
        ok: true,
        context: {
          orderKind: "prompt",
          purchaseId: purchase._id,
          orderTitle: purchase.promptSnapshot?.title || "Prompt",
          reviewerRole: "buyer",
          outcome: purchase.refundStatus === "REFUNDED" ? "REFUNDED" : "COMPLETED",
        },
      };
    }
  }

  const serviceOrder = await ServiceOrder.findOne({
    paymentStatus: "PAID",
    $or: [
      { buyerId: a, sellerId: b },
      { buyerId: b, sellerId: a },
    ],
  })
    .sort({ paidAt: -1 })
    .lean();

  if (serviceOrder) {
    return {
      ok: true,
      context: {
        orderKind: "service",
        serviceOrderId: serviceOrder._id,
        orderTitle: serviceOrder.serviceTitle || "Service booking",
        reviewerRole: String(serviceOrder.buyerId) === a ? "buyer" : "seller",
        outcome: ["SETTLED", "REFUNDED", "CANCELLED"].includes(serviceOrder.status)
          ? serviceOrder.status
          : "COMPLETED",
      },
    };
  }

  const deal = await HireDeal.findOne({
    paymentStatus: "PAID",
    $or: [
      { clientId: a, freelancerId: b },
      { clientId: b, freelancerId: a },
    ],
  })
    .sort({ paidAt: -1 })
    .lean();

  if (deal) {
    return {
      ok: true,
      context: {
        orderKind: "hire",
        hireDealId: deal._id,
        orderTitle: deal.title || "Project",
        reviewerRole: String(deal.clientId) === a ? "buyer" : "seller",
        outcome: ["SETTLED", "REFUNDED", "CANCELLED"].includes(deal.status) ? deal.status : "COMPLETED",
      },
    };
  }

  return { ok: false, reason: "no_transaction" };
}

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/reviews/eligibility/:userId
   Backs the "Write a review" button on a profile — can I, and if not, why not.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/eligibility/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: "invalid_user_id" });
    }

    if (String(userId) === String(req.user._id)) {
      return res.json({ success: true, canReview: false, reason: "self", myReview: null });
    }

    const existing = await Review.findOne({ reviewerId: req.user._id, revieweeId: userId }).lean();
    if (existing) {
      return res.json({ success: true, canReview: false, reason: "already_reviewed", myReview: existing });
    }

    const match = await findTransactionBetween(req.user._id, userId);
    return res.json({
      success: true,
      canReview: match.ok,
      reason: match.ok ? null : match.reason,
      // Shown on the form so the reviewer can see what they're reviewing on the
      // strength of, and so "why can I review this person?" is never a mystery.
      basis: match.ok
        ? { orderKind: match.context.orderKind, orderTitle: match.context.orderTitle }
        : null,
      myReview: null,
    });
  } catch (err) {
    console.error("review eligibility error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/reviews/:reviewId/respond
   One public reply, by the person the review is about.

   MUST STAY ABOVE POST /user/:userId only in spirit — the paths don't actually
   collide ("user" is a literal), but keep this near the top so a future
   two-segment POST can't quietly shadow it the way the old
   POST /:orderKind/:orderId did.
   ══════════════════════════════════════════════════════════════════════════ */
router.post("/:reviewId/respond", requireAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, error: "invalid_id" });
    }

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ success: false, error: "review_not_found" });

    if (String(review.revieweeId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: "not_authorized",
        message: "Only the person a review is about can reply to it.",
      });
    }
    // One reply, not a thread — a back-and-forth would turn every disagreement
    // into a public argument sitting permanently on someone's profile.
    if (review.response) {
      return res.status(400).json({
        success: false,
        error: "already_responded",
        message: "You've already replied to this review.",
      });
    }

    const response = String(req.body?.response || "").trim();
    if (!response) {
      return res.status(400).json({ success: false, error: "empty_response" });
    }

    review.response = response.slice(0, 2000);
    review.respondedAt = new Date();
    await review.save();

    return res.json({ success: true, review });
  } catch (err) {
    console.error("respond to review error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/reviews/user/:userId
   Leave a review about a person, from their profile.
   ══════════════════════════════════════════════════════════════════════════ */
router.post("/user/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: "invalid_user_id" });
    }
    if (String(userId) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        error: "self_review",
        message: "You can't review yourself.",
      });
    }

    const rating = Number(req.body?.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "invalid_rating",
        message: "Pick a rating between 1 and 5 stars.",
      });
    }

    const match = await findTransactionBetween(req.user._id, userId);
    if (!match.ok) {
      return res.status(403).json({
        success: false,
        error: "no_transaction",
        message:
          "You can review someone once you've bought a prompt from them, booked their service, or worked with them on a project.",
      });
    }

    const review = await Review.create({
      ...match.context,
      reviewerId: req.user._id,
      revieweeId: userId,
      rating,
      comment: String(req.body?.comment || "").trim().slice(0, 2000),
    });

    const summary = await recomputeUserRating(userId);

    try {
      await Notification.create({
        senderId: req.user._id,
        senderName: req.user.name,
        receiverUserId: userId,
        type: "REVIEW_RECEIVED",
        message: `${req.user.name || "Someone"} left you a ${rating}-star review.`,
        meta: { reviewId: String(review._id), rating },
      });
    } catch (notifyErr) {
      console.error("Review notification failed:", notifyErr.message);
    }

    return res.json({ success: true, review, summary });
  } catch (err) {
    // The unique index is the real guard — the check above can be raced by two
    // submits from the same person.
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "already_reviewed",
        message: "You've already reviewed this person.",
      });
    }
    console.error("create review error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
module.exports.recomputeUserRating = recomputeUserRating;
module.exports.findTransactionBetween = findTransactionBetween;
