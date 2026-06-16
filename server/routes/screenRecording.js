const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const screenRecordingSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  guestName:  { type: String, default: "" },
  guestEmail: { type: String, default: "" },
  videoUrl:   { type: String, required: true },
  fileSize:   { type: Number, default: 0 },
  promptTitle:{ type: String, default: "" },
  createdAt:  { type: Date, default: Date.now },
});

const ScreenRecording =
  mongoose.models.ScreenRecording ||
  mongoose.model("ScreenRecording", screenRecordingSchema);

const uploadDir = path.join(__dirname, "../uploads/screen-recordings");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, `screen-${Date.now()}-${Math.random().toString(36).slice(2)}.webm`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith("video/")),
});

const authMiddleware = require("../middleware/auth");

// POST /api/screen-recording/upload
router.post("/upload", authMiddleware, upload.single("video"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No video file" });

    const videoUrl = `/uploads/screen-recordings/${req.file.filename}`;

    let userId = req.user?._id || req.user?.id || req.body.userId || null;
    if (userId && !mongoose.Types.ObjectId.isValid(String(userId))) userId = null;

    const doc = await ScreenRecording.create({
      userId:      userId || undefined,
      guestName:   req.body.guestName  || req.body.userName  || "",
      guestEmail:  req.body.guestEmail || req.body.userEmail || "",
      videoUrl,
      fileSize:    req.file.size,
      promptTitle: req.body.promptTitle || "",
    });

    return res.json({ success: true, recording: { id: doc._id, videoUrl } });
  } catch (err) {
    console.error("Screen recording upload error:", err);
    return res.status(500).json({ success: false, error: "Upload failed" });
  }
});

// GET /api/screen-recording/all
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const recordings = await ScreenRecording.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email avatarUrl avatar")
      .lean();

    return res.json({ success: true, recordings });
  } catch (err) {
    console.error("Screen recordings fetch error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch recordings" });
  }
});

module.exports = router;