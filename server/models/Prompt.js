// models/Prompt.js
const mongoose = require("mongoose");

const AttachmentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, enum: ["image", "video","other"], required: true }, // only image or video

  /* Video listings only, and both derived from `path` at upload time.

     `path` is the seller's original — the 4K clip on the marketplace is 56 MB at
     7.9 Mbps, which no card and no preview panel has any business downloading:
     a viewer on 4 Mbps cannot even play it in real time. These two are what the
     marketplace shows instead, and `path` is what the buyer gets after paying.

     posterUrl   a single JPEG frame, ~40 KB — paints instantly
     previewUrl  a short, silent, 720p loop, ~1 MB — plays anywhere

     Absent on every video uploaded before this existed, so both readers fall
     back to `path` and behave exactly as they did. Services already work this
     way; see utils/videoPoster.js for the same reasoning. */
  posterUrl: { type: String, default: "" },
  previewUrl: { type: String, default: "" },
});


const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
}, { _id: false }); // embedded subdocument

// Prompt-Media Match Validation — AI-computed match between the uploaded
// image/video and the seller's prompt text, gating marketplace visibility.
// "pending" until the async pipeline runs; "approved"/"admin_approved" are
// the only statuses that show up in the public marketplace (see the
// requiresSellerVerification-style $or gate in GET /others).
const MediaValidationSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["pending", "approved", "pending_review", "flagged", "admin_approved", "admin_rejected", "edit_requested"],
    default: "pending",
  },
  score: { type: Number, default: null }, // 0-100, cosine similarity scaled
  aiDescription: { type: String, default: "" },
  checkedAt: { type: Date, default: null },
  error: { type: String, default: null }, // set if the AI pipeline itself failed
  adminAction: {
    action: { type: String, enum: ["approved", "rejected", "edit_requested", null], default: null },
    note: { type: String, default: "" },
    byAdminId: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null },
    at: { type: Date, default: null },
  },
}, { _id: false });

const PromptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: String,
    promptText: { type: String, required: true },
    free: { type: Boolean, default: true },
    price: { type: Number, default: 0 },
    tags: [String],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    /* The narrower bucket under one of `categories` — Coding → "Web
       Development". Optional, and separate from the array above rather than
       mixed into it: a child stored alongside its parent would make every
       "prompts in Coding" filter also match a prompt whose only link to Coding
       is that it sits under one of its children, which is a different question.
       Prompts uploaded before sub-categories existed simply have none. */
    subCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    attachment: { type: AttachmentSchema, required: true}, // only one
      

       draft: { type: Boolean, default: false },
    flagged: { type: Boolean, default: false },

    // Only set true on prompts created after the Route-onboarding-first
    // upload flow shipped — older prompts are grandfathered in and stay
    // listed regardless of their seller's Route verification status.
    requiresSellerVerification: { type: Boolean, default: false },
     exclusive: { type: Boolean, default: false },   // ✅ new
     sold: { type: Boolean, default: false },  
     promptHash: { type: String, default: "", index: true },
     attachmentHash: { type: String, default: "", index: true },

     /* Perceptual hash of the image — what it LOOKS like, where attachmentHash
        above is what its bytes are. The byte hash only ever catches a re-upload
        of the same FILE; a screenshot of a listing is new bytes and sailed
        straight past it. See utils/imageProvenance.js.

        Not indexed: near-duplicates are found by Hamming distance, which no
        B-tree can answer — the lookup reads the column and compares in memory.
        Empty on videos (nothing to hash) and on everything uploaded before this
        existed, and both are simply skipped rather than treated as matching. */
     attachmentPhash: { type: String, default: "" },
     mediaValidation: { type: MediaValidationSchema, default: () => ({}) },


    tokun_price: { type: Number, default: 0 }, // <-- new field
    ratings: [ratingSchema],      // <--- store user ratings
    averageRating: { type: Number, default: 0 }, // <--- store calculated avg

    /* Buyer reviews (models/ProductReview.js), kept denormalised so the
       marketplace can show a star rating on every card without a second query
       per listing. Maintained by recomputePromptRating() in
       routes/productReviews.js.

       Deliberately NOT written into `averageRating` above: the pre-save hook at
       the bottom of this file recalculates that field from the embedded
       `ratings` array on every single save, so a sale incrementing salesCount
       would silently reset it to 0. These two are safe because nothing else
       touches them. */
    reviewAverage: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    // NEW FIELD: uploadCode (can be null, single, or multiple)
    uploadCode: {
      type: [AttachmentSchema], // array of attachments
      default: [], // empty array if none
    },


      // Soft delete
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },

    // For reporting / analytics
    salesCount: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },

  },
  { timestamps: true }
);

// Pre-save middleware to calculate tokun_price — the buyer-facing price shown
// on a listing: list price + Tokun's platform fee + GST on that fee.
//
// This is a DISPLAY figure only. It's frozen at whatever the rates were when
// the prompt was last saved, so the charge itself is computed live by
// splitPromptSale() at checkout instead. Reading a rate change here would need
// every prompt in the database re-saved to take effect.
PromptSchema.pre("save", function (next) {
  const { buyerCharge } = require("../utils/fees");

  if (!this.free && Number.isFinite(this.price)) {
    this.tokun_price = buyerCharge(this.price).totalPayable;
  } else {
    this.tokun_price = 0;
  }
// calculate average rating if ratings exist
  if (this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = +(sum / this.ratings.length).toFixed(2);
  } else {
    this.averageRating = 0;
  }
  next();
});

module.exports = mongoose.model("Prompt", PromptSchema);
//68b2ba00c0a62cea52479a58