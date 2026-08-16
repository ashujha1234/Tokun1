// Buyer reviews on a PRODUCT (a prompt), and the star rating that comes out of
// them.
//
// The marketplace had a `rating` field on every card that nothing ever wrote
// to, so every listing showed the same number and the "popular" rail sorted by
// a constant. This is the thing that fills it in.
//
// The rule that makes a rating mean anything: you can only review a product you
// bought, once, and editing replaces your review rather than adding another.
// That's enforced here and by the unique index on (promptId, buyerId) — a
// product page where anyone can rate anything is a comment section, not a
// rating.

const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const ProductReview = require("../models/ProductReview");
const Prompt = require("../models/Prompt");
const Purchase = require("../models/Purchase");
const User = require("../models/User");
const { requireAuth } = require("../utils/auth");
const { sendReviewReceivedEmail } = require("../services/creatorEmail.service");

const isId = (v) => mongoose.Types.ObjectId.isValid(v);

/**
 * Recompute a prompt's stored rating from its visible reviews.
 *
 * Written with updateOne rather than doc.save() deliberately: Prompt's pre-save
 * hook recalculates `averageRating` from a legacy embedded array and would undo
 * this. See the comment on reviewAverage in models/Prompt.js.
 */
async function recomputePromptRating(promptId) {
  const [agg] = await ProductReview.aggregate([
    { $match: { promptId: new mongoose.Types.ObjectId(String(promptId)), hidden: { $ne: true } } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const reviewAverage = agg ? Math.round(agg.avg * 10) / 10 : 0;
  const reviewCount = agg ? agg.count : 0;

  await Prompt.updateOne({ _id: promptId }, { $set: { reviewAverage, reviewCount } });
  return { reviewAverage, reviewCount };
}

/** The 5→1 histogram under the average. Shows whether a 4.2 is "everyone liked
    it" or "half loved it and half hated it" — the same number, very different
    products. */
async function ratingBreakdown(promptId) {
  const rows = await ProductReview.aggregate([
    { $match: { promptId: new mongoose.Types.ObjectId(String(promptId)), hidden: { $ne: true } } },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
  ]);

  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of rows) breakdown[r._id] = r.count;
  return breakdown;
}

const publicReview = (r) => ({
  id: String(r._id),
  rating: r.rating,
  comment: r.comment || "",
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
  response: r.response || "",
  respondedAt: r.respondedAt,
  buyer: {
    id: String(r.buyerId?._id || r.buyerId || ""),
    name: r.buyerId?.name || "Tokun user",
    avatarUrl: r.buyerId?.avatarUrl || null,
  },
  // Always true by construction — every row required a purchase — but stated
  // explicitly so the UI doesn't have to know that.
  verifiedPurchase: true,
});

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/product-reviews/:promptId
   Public. Summary + the visible reviews, newest first.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/:promptId", async (req, res) => {
  try {
    const { promptId } = req.params;
    if (!isId(promptId)) {
      return res.status(400).json({ success: false, error: "invalid_prompt_id" });
    }

    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const skip = Math.max(Number(req.query.skip) || 0, 0);

    const [reviews, total, breakdown] = await Promise.all([
      ProductReview.find({ promptId, hidden: { $ne: true } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("buyerId", "name avatarUrl")
        .lean(),
      ProductReview.countDocuments({ promptId, hidden: { $ne: true } }),
      ratingBreakdown(promptId),
    ]);

    const prompt = await Prompt.findById(promptId).select("reviewAverage reviewCount").lean();

    return res.json({
      success: true,
      summary: {
        average: prompt?.reviewAverage || 0,
        count: prompt?.reviewCount ?? total,
        breakdown,
      },
      reviews: reviews.map(publicReview),
      hasMore: skip + reviews.length < total,
    });
  } catch (err) {
    console.error("GET /api/product-reviews/:promptId error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/product-reviews/:promptId/mine
   Backs the review form: may I write one, and what did I say last time.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/:promptId/mine", requireAuth, async (req, res) => {
  try {
    const { promptId } = req.params;
    if (!isId(promptId)) {
      return res.status(400).json({ success: false, error: "invalid_prompt_id" });
    }

    const prompt = await Prompt.findById(promptId).select("userId title").lean();
    if (!prompt) return res.status(404).json({ success: false, error: "prompt_not_found" });

    const mine = await ProductReview.findOne({ promptId, buyerId: req.user._id }).lean();

    if (String(prompt.userId) === String(req.user._id)) {
      return res.json({ success: true, canReview: false, reason: "own_product", myReview: null });
    }

    const purchase = await Purchase.findOne({
      buyer: req.user._id,
      prompt: promptId,
      paymentStatus: "SUCCESS",
    })
      .select({ _id: 1 })
      .lean();

    return res.json({
      success: true,
      // Owning it is what grants the right, and it doesn't expire — an edit is
      // still allowed after the first review, which is why this stays true.
      canReview: !!purchase,
      reason: purchase ? null : "not_purchased",
      myReview: mine
        ? { id: String(mine._id), rating: mine.rating, comment: mine.comment || "" }
        : null,
    });
  } catch (err) {
    console.error("GET /api/product-reviews/:promptId/mine error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/product-reviews/:promptId   body: { rating, comment }
   Create or replace this buyer's review of this product.
   ══════════════════════════════════════════════════════════════════════════ */
router.post("/:promptId", requireAuth, async (req, res) => {
  try {
    const { promptId } = req.params;
    if (!isId(promptId)) {
      return res.status(400).json({ success: false, error: "invalid_prompt_id" });
    }

    const rating = Number(req.body?.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "invalid_rating",
        message: "Pick a rating between 1 and 5 stars.",
      });
    }

    const comment = String(req.body?.comment || "").trim().slice(0, 2000);

    const prompt = await Prompt.findById(promptId).select("userId title").lean();
    if (!prompt) return res.status(404).json({ success: false, error: "prompt_not_found" });

    if (String(prompt.userId) === String(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: "own_product",
        message: "You can't review your own product.",
      });
    }

    /* The gate. Without a completed purchase there is no review — this is the
       whole difference between a rating and a comment box, and it belongs on
       the server where the UI can't be talked out of it. */
    const purchase = await Purchase.findOne({
      buyer: req.user._id,
      prompt: promptId,
      paymentStatus: "SUCCESS",
    })
      .sort({ purchasedAt: -1 })
      .select({ _id: 1 })
      .lean();

    if (!purchase) {
      return res.status(403).json({
        success: false,
        error: "not_purchased",
        message: "Only people who've bought this product can review it.",
      });
    }

    const existing = await ProductReview.findOne({ promptId, buyerId: req.user._id }).lean();

    const review = await ProductReview.findOneAndUpdate(
      { promptId, buyerId: req.user._id },
      {
        $set: {
          rating,
          comment,
          purchaseId: purchase._id,
          sellerId: prompt.userId,
          productTitle: prompt.title || "",
          // An edited review loses its old reply: the seller answered something
          // that no longer exists, and leaving it attached puts words in their
          // mouth about a review they haven't read.
          ...(existing && existing.rating !== rating ? { response: "", respondedAt: null } : {}),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const summary = await recomputePromptRating(promptId);

    /* Only on a NEW review. Emailing the seller every time a buyer fixes a typo
       would train them to ignore the one that matters. */
    if (!existing) {
      try {
        const seller = await User.findById(prompt.userId).select("name email").lean();
        if (seller?.email) {
          await sendReviewReceivedEmail({
            to: seller.email,
            creatorName: seller.name,
            reviewerName: req.user.name,
            rating,
            comment,
            title: prompt.title,
          });
        }
      } catch (mailErr) {
        console.error("Product review email failed (review still saved):", mailErr.message);
      }
    }

    return res.json({
      success: true,
      review: { id: String(review._id), rating: review.rating, comment: review.comment || "" },
      summary,
    });
  } catch (err) {
    // Two submits racing the upsert. The row the loser wanted now exists, so
    // this is a success from the buyer's point of view.
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "already_reviewed",
        message: "You've already reviewed this product — reload to edit it.",
      });
    }
    console.error("POST /api/product-reviews/:promptId error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   DELETE /api/product-reviews/:promptId — withdraw your own review.
   ══════════════════════════════════════════════════════════════════════════ */
router.delete("/:promptId", requireAuth, async (req, res) => {
  try {
    const { promptId } = req.params;
    if (!isId(promptId)) {
      return res.status(400).json({ success: false, error: "invalid_prompt_id" });
    }

    const removed = await ProductReview.findOneAndDelete({ promptId, buyerId: req.user._id });
    if (!removed) return res.status(404).json({ success: false, error: "review_not_found" });

    const summary = await recomputePromptRating(promptId);
    return res.json({ success: true, summary });
  } catch (err) {
    console.error("DELETE /api/product-reviews/:promptId error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/product-reviews/review/:reviewId/respond   body: { response }
   The seller's one public reply. Answering a bad review in public is often the
   most useful thing on a product page.
   ══════════════════════════════════════════════════════════════════════════ */
router.post("/review/:reviewId/respond", requireAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!isId(reviewId)) {
      return res.status(400).json({ success: false, error: "invalid_review_id" });
    }

    const response = String(req.body?.response || "").trim().slice(0, 2000);
    if (!response) {
      return res.status(400).json({ success: false, error: "response_required" });
    }

    const review = await ProductReview.findById(reviewId);
    if (!review) return res.status(404).json({ success: false, error: "review_not_found" });

    if (String(review.sellerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, error: "not_your_product" });
    }

    review.response = response;
    review.respondedAt = new Date();
    await review.save();

    return res.json({ success: true, review: publicReview(review) });
  } catch (err) {
    console.error("POST /api/product-reviews/review/:reviewId/respond error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
module.exports.recomputePromptRating = recomputePromptRating;
