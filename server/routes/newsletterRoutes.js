const express = require("express");
const router = express.Router();
const NewsletterSubscriber = require("../models/NewsletterSubscriber");

// Deliberately public — the footer appears on the landing page, where most
// visitors aren't signed in. A signed-in user's id is attached when the optional
// token is present, but no auth is required.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// POST /api/newsletter/subscribe
router.post("/subscribe", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        error: "invalid_email",
        message: "Please enter a valid email address.",
      });
    }

    // Upsert rather than insert: subscribing twice is a no-op the user should
    // see as success, not a duplicate-key error.
    await NewsletterSubscriber.findOneAndUpdate(
      { email },
      {
        $set: {
          unsubscribedAt: null,
          ...(req.user?._id ? { userId: req.user._id } : {}),
        },
        $setOnInsert: { email, source: String(req.body?.source || "footer") },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      message: "You're subscribed. We'll keep you posted.",
    });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    return res.status(500).json({
      success: false,
      error: "server_error",
      message: "Couldn't subscribe you right now. Please try again.",
    });
  }
});

module.exports = router;
