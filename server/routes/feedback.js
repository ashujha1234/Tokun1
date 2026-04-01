const express = require("express");
const multer = require("multer");
const path = require("path");
const Feedback = require("../models/Feedback");
const Sentiment = require("sentiment");


const router = express.Router();
const sentiment = new Sentiment();


// setup multer (for profile picture upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/feedback"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// POST /api/feedback -> Add feedback
router.post("/", upload.single("profilePicture"), async (req, res) => {
  try {
    const { experience, name, role, orgOrCompany, rating } = req.body;

    if (!experience || !name || !rating) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

      // Run sentiment analysis
    const result = sentiment.analyze(experience);
    let sentimentLabel = "neutral";
    if (result.score > 0) sentimentLabel = "positive";
    else if (result.score < 0) sentimentLabel = "negative";

    const feedback = new Feedback({
      experience,
      name,
      role,
      orgOrCompany,
      rating,
      profilePicture: req.file ? `/uploads/feedback/${req.file.filename}` : null,
      sentiment: sentimentLabel,
    });

    await feedback.save();
    res.json({ success: true, feedback });
  } catch (err) {
    console.error("Add feedback error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// GET /api/feedback -> Fetch all feedback
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    console.error("Get feedback error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});


// GET /api/feedback/top
router.get("/top", async (req, res) => {
  try {
    // Step 1: Get positive feedbacks (limit 5)
    let positives = await Feedback.find({ sentiment: "positive" })
      .sort({ createdAt: -1 })
      .limit(5);

    // Step 2: If less than 5, fill with neutral
    if (positives.length < 5) {
      const needed = 5 - positives.length;
      const neutrals = await Feedback.find({ sentiment: "neutral" })
        .sort({ createdAt: -1 })
        .limit(needed);

      positives = positives.concat(neutrals);
    }

    res.json({
      success: true,
      count: positives.length,
      feedbacks: positives,
    });
  } catch (err) {
    console.error("Get top feedback error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});


module.exports = router;
