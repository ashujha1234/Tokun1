const mongoose = require("mongoose");

// Backs the footer's Subscribe box. It existed as a styled input and button with
// no state and no handler — typing an email and clicking Subscribe did nothing at
// all — so this is the storage that makes it a real control rather than decoration.
const NewsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true, // re-subscribing is idempotent, not a duplicate row
      index: true,
    },

    // Set when a signed-in user subscribes, so the list can be cross-referenced
    // with accounts. Null for visitors who subscribe before signing up.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Where the subscription came from, so a future banner or modal can be told
    // apart from the footer without guessing.
    source: {
      type: String,
      default: "footer",
    },

    unsubscribedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NewsletterSubscriber", NewsletterSubscriberSchema);
