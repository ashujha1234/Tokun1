const express = require("express");
const multer = require("multer");
const uploadToAzure = require("../utils/uploadToAzure");
const Feedback = require("../models/Feedback");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Sentiment = require("sentiment");
const { sendEmail } = require("../utils/SendEmail");
const { buildOtpEmailHtml } = require("../utils/otpemailtemplate");

// Best-effort: notify the submitter (if they have a Tokun account under the
// same email) that their feedback was acted on. Never throws — a notification
// failure shouldn't block the admin action that triggered it.
async function notifyFeedbackSubmitter(feedback, { type, message }) {
  try {
    if (!feedback?.email) return;
    const user = await User.findOne({ email: feedback.email.toLowerCase() });
    if (!user) return;
    await Notification.create({
      receiverUserId: user._id,
      senderName: "Tokun",
      type,
      message,
    });
  } catch (err) {
    console.error("notifyFeedbackSubmitter failed:", err?.message || err);
  }
}

const router = express.Router();
const sentiment = new Sentiment();

// In-memory OTP store: email -> { otp, expiresAt, verified }
const otpStore = new Map();

// Screenshots go to Azure Blob, not the App Service filesystem.
//
// They used to land in ./uploads/feedback via multer diskStorage. That path is
// inside the deployed app directory, which the deploy pipeline replaces on every
// release — so screenshots silently disappeared whenever the backend shipped.
// Every other upload in this codebase (avatars, KYC, report screenshots, chat
// attachments) already goes to Blob; feedback was the odd one out.
//
// memoryStorage because uploadToAzure takes a Buffer. Limits mirror the report
// upload route so the two behave the same.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    if (!/^image\/(png|jpeg|jpg|webp|gif)$/i.test(file.mimetype)) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// POST /api/feedback/send-otp
router.post("/send-otp", async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "email_required" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(email.toLowerCase(), { otp, expiresAt, verified: false });

    const html = buildOtpEmailHtml({ name: name || "there", otp });
    await sendEmail({
      to: email,
      subject: "Tokun Feedback – Your OTP",
      html,
      text: `Your OTP for Tokun feedback is: ${otp}. It expires in 5 minutes.`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("send-otp error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// POST /api/feedback/verify-otp
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, error: "email_and_otp_required" });

  const record = otpStore.get(email.toLowerCase());
  if (!record) return res.status(400).json({ success: false, error: "otp_not_found" });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ success: false, error: "otp_expired" });
  }
  if (record.otp !== String(otp)) return res.status(400).json({ success: false, error: "otp_invalid" });

  record.verified = true;
  res.json({ success: true });
});

// POST /api/feedback
router.post("/", upload.array("screenshots", 5), async (req, res) => {
  try {
    const { experience, name, email, role, rating, issue } = req.body;

    if (!experience || !name || !email || !rating) {
      return res.status(400).json({ success: false, error: "missing_required_fields" });
    }

    const record = otpStore.get(email.toLowerCase());
    if (!record || !record.verified) {
      return res.status(403).json({ success: false, error: "email_not_verified" });
    }

    const result = sentiment.analyze(experience);
    let sentimentLabel = "neutral";
    if (result.score > 0) sentimentLabel = "positive";
    else if (result.score < 0) sentimentLabel = "negative";

    // Absolute Blob URLs now, not "/uploads/feedback/…". The client's mediaUrl()
    // passes absolute URLs through untouched, so old relative paths already in
    // the database keep resolving against the API exactly as before.
    let screenshots = [];
    try {
      screenshots = await Promise.all(
        (req.files || []).map((f) =>
          uploadToAzure(f.buffer, f.originalname, "feedback-screenshots")
        )
      );
    } catch (uploadErr) {
      // The written feedback is the part that matters — losing it because a
      // screenshot upload failed would be worse than saving it without images.
      console.error("Feedback screenshot upload failed:", uploadErr?.message);
    }

    const feedback = new Feedback({
      experience,
      name,
      email: email.toLowerCase(),
      role,
      rating,
      issue: issue || "",
      screenshots,
      sentiment: sentimentLabel,
    });

    await feedback.save();
    otpStore.delete(email.toLowerCase()); // clear after use
    res.json({ success: true, feedback });
  } catch (err) {
    console.error("Add feedback error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// GET /api/feedback/my?email=user@example.com
router.get("/my", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, error: "email_required" });
    const feedbacks = await Feedback.find({ email: email.toLowerCase() }).sort({ createdAt: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// DELETE /api/feedback/:id (admin)
router.delete("/:id", async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// PATCH /api/feedback/:id/status (admin)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const fb = await Feedback.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (fb && (status === "reviewed" || status === "resolved")) {
      notifyFeedbackSubmitter(fb, {
        type: "FEEDBACK_STATUS_UPDATED",
        message:
          status === "resolved"
            ? "Your feedback has been resolved. Thanks for helping us improve Tokun!"
            : "Your feedback has been reviewed by our team.",
      });
    }

    res.json({ success: true, feedback: fb });
  } catch (err) {
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// PATCH /api/feedback/:id/testimonial (admin) — approve/unapprove for landing page display
router.patch("/:id/testimonial", async (req, res) => {
  try {
    const { showOnLanding } = req.body;
    const fb = await Feedback.findByIdAndUpdate(req.params.id, { showOnLanding: !!showOnLanding }, { new: true });

    if (fb && showOnLanding) {
      notifyFeedbackSubmitter(fb, {
        type: "FEEDBACK_FEATURED",
        message: "Your feedback is now featured as a testimonial on our landing page!",
      });
    }

    res.json({ success: true, feedback: fb });
  } catch (err) {
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// GET /api/feedback (admin)
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// GET /api/feedback/top — only feedback an admin has explicitly approved for the landing page
router.get("/top", async (req, res) => {
  try {
    const approved = await Feedback.find({ showOnLanding: true }).sort({ createdAt: -1 }).limit(9);
    res.json({ success: true, count: approved.length, feedbacks: approved });
  } catch (err) {
    res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
