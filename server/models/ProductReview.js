const mongoose = require("mongoose");

/**
 * A buyer's review of a PRODUCT — a prompt they bought.
 *
 * Separate from models/Review.js on purpose. That one is a verdict on a
 * PERSON ("was this creator good to work with?") and enforces exactly one
 * review per reviewer→reviewee pair, so a repeat client can't stack five
 * ratings on the same freelancer. Product reviews need the opposite rule: a
 * buyer who bought four prompts from one seller should be able to review all
 * four, because they're rating four different things. Reusing that collection
 * would have meant dropping its unique index — and with it the only thing
 * stopping the person-rating from being gamed.
 *
 * The anchor is the same in spirit though: one review per (product, buyer),
 * and only from someone who actually paid for it.
 */
const ProductReviewSchema = new mongoose.Schema(
  {
    promptId: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", required: true, index: true },

    // Proof of standing. Every review points at the purchase that earned it,
    // so "verified buyer" is a fact about the row rather than a badge we award.
    purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase", required: true },

    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Denormalised so a seller's "reviews on my products" read is one query
    // rather than a join through every prompt they've ever listed.
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", maxlength: 2000, trim: true },

    // The product's title when the review was written. Listings get renamed and
    // deleted; a review that can't say what it was about is worthless.
    productTitle: { type: String, default: "" },

    // One public reply from the seller. A thread would turn every disagreement
    // into an argument on the product page.
    response: { type: String, default: "", maxlength: 2000, trim: true },
    respondedAt: { type: Date, default: null },

    // Moderation. Hidden reviews stay in the average's denominator nowhere —
    // see recomputePromptRating, which filters them out entirely.
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* One review per product per buyer. Editing yours overwrites it (the route
   upserts) rather than adding a second. */
ProductReviewSchema.index({ promptId: 1, buyerId: 1 }, { unique: true });

// The product page read: newest visible reviews for this prompt.
ProductReviewSchema.index({ promptId: 1, hidden: 1, createdAt: -1 });

module.exports = mongoose.model("ProductReview", ProductReviewSchema);
