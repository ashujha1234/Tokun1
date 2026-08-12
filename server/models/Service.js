const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: { type: String, required: true },
    description: { type: String, required: true },

    // CATEGORY
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    // ── What the buyer gets ──
    // Free-form bullets, written by the seller. Replaces the fixed
    // screens/prototype/fileType trio below, which asked design-studio
    // questions of every service: a copywriter had to answer "how many
    // screens?" and pick between "Figma" and "PNG". One list works for every
    // category — "2000 words, 2 rounds of edits" and "5 pages, responsive,
    // speed optimised" are both expressible.
    deliverables: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => !v || v.length <= 8,
        message: "At most 8 items",
      },
    },

    delivery: String,       // "7 Days Delivery"
    revisions: String,      // "2 Revisions"

    /* ── legacy package fields ──
       No longer collected — the create form asks for `deliverables` instead.
       Kept because services created before that still carry them, and the
       detail page falls back to showing them so old listings don't lose the
       only description of what they include. */
    screens: String,        // "21 Screens"
    prototype: String,      // "Yes" | "No"
    fileType: String,       // "Figma" | "Source File"

    price: {
      type: Number,
      required: true,
    },

    // MEDIA (IMAGE / VIDEO)
    media: [
      {
        type: String, // /uploads/services/xxx.jpg
      },
    ],

    /* One still per entry in `media`, index-aligned. Empty string for anything
       that isn't a video, so mediaPosters[i] always describes media[i].

       Cards render `<video>` directly, and browsers answer even
       preload="metadata" by pulling the whole file — the Services tab was
       fetching 45 MB of stock footage to fill three 160px thumbnails. A poster
       is a ~40 KB JPEG that shows instantly and means the video is only ever
       downloaded by someone who opens the listing. */
    mediaPosters: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", ServiceSchema);
