const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const mongoose = require("mongoose");

const authMiddleware = require("../middleware/auth");
const Prompt = require("../models/Prompt");

const screenRecordingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },

  promptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prompt",
    default: null,
    index: true,
  },

  guestName: {
    type: String,
    default: "",
  },

  guestEmail: {
    type: String,
    default: "",
  },

  videoUrl: {
    type: String,
    required: true,
  },

  fileSize: {
    type: Number,
    default: 0,
  },

  promptTitle: {
    type: String,
    default: "",
  },

  promptTextSnapshot: {
    type: String,
    default: "",
  },

  fileHash: {
    type: String,
    index: true,
    default: "",
  },

  promptHash: {
    type: String,
    index: true,
    default: "",
  },

  sourceHash: {
    type: String,
    index: true,
    default: "",
  },

  riskScore: {
    type: Number,
    default: 0,
  },

  riskFlags: [
    {
      type: String,
    },
  ],

  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ScreenRecording",
    default: null,
  },

  status: {
    type: String,
    enum: ["clean", "flagged", "approved", "fraud", "rejected", "hidden"],
    default: "clean",
    index: true,
  },

  adminNote: {
    type: String,
    default: "",
  },

  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  reviewedAt: {
    type: Date,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ScreenRecording =
  mongoose.models.ScreenRecording ||
  mongoose.model("ScreenRecording", screenRecordingSchema);

const uploadDir = path.join(__dirname, "../uploads/screen-recordings");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "") || ".webm";

    cb(
      null,
      `screen-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    cb(null, file.mimetype.startsWith("video/"));
  },
});

function hashText(value = "") {
  return crypto
    .createHash("sha256")
    .update(String(value))
    .digest("hex");
}

function normalizePrompt(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "");
}

function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("error", reject);

    stream.on("data", (chunk) => {
      hash.update(chunk);
    });

    stream.on("end", () => {
      resolve(hash.digest("hex"));
    });
  });
}

function resolveUploadPath(storedPath = "") {
  if (!storedPath) return "";

  const cleanPath = String(storedPath).replace(/\\/g, "/");

  const candidates = [];

  if (path.isAbsolute(cleanPath)) {
    candidates.push(cleanPath);
  }

  candidates.push(path.join(process.cwd(), cleanPath));
  candidates.push(path.join(process.cwd(), cleanPath.replace(/^\/+/, "")));
  candidates.push(path.join(__dirname, "..", cleanPath));
  candidates.push(path.join(__dirname, "..", cleanPath.replace(/^\/+/, "")));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return "";
}

async function getPromptDoc(promptId) {
  if (!promptId) return null;

  if (!mongoose.Types.ObjectId.isValid(String(promptId))) {
    return null;
  }

  return Prompt.findById(promptId)
    .select("title promptText attachment userId deleted flagged")
    .lean();
}

async function calculateRisk({
  fileHash,
  promptHash,
  sourceHash,
  userId,
  guestEmail,
  promptId,
}) {
  const riskFlags = [];
  let riskScore = 0;
  let duplicateOf = null;

  if (fileHash) {
    const duplicateVideo = await ScreenRecording.findOne({ fileHash })
      .sort({ createdAt: -1 })
      .lean();

    if (duplicateVideo) {
      riskFlags.push("DUPLICATE_SCREEN_VIDEO");
      riskScore += 70;
      duplicateOf = duplicateVideo._id;
    }
  }

  if (sourceHash) {
    const duplicateSource = await ScreenRecording.findOne({ sourceHash })
      .sort({ createdAt: -1 })
      .lean();

    if (duplicateSource) {
      riskFlags.push("DUPLICATE_UPLOADED_ASSET");
      riskScore += 60;

      if (!duplicateOf) {
        duplicateOf = duplicateSource._id;
      }
    }
  }

  if (promptHash) {
    const duplicatePrompt = await ScreenRecording.findOne({ promptHash })
      .sort({ createdAt: -1 })
      .lean();

    if (duplicatePrompt) {
      riskFlags.push("DUPLICATE_PROMPT");
      riskScore += 35;

      if (!duplicateOf) {
        duplicateOf = duplicatePrompt._id;
      }
    }
  }

  if (promptId) {
    const samePromptRecording = await ScreenRecording.findOne({ promptId })
      .sort({ createdAt: -1 })
      .lean();

    if (samePromptRecording) {
      riskFlags.push("SAME_PROMPT_ALREADY_RECORDED");
      riskScore += 25;

      if (!duplicateOf) {
        duplicateOf = samePromptRecording._id;
      }
    }
  }

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const identityQuery = [];

  if (userId) {
    identityQuery.push({ userId });
  }

  if (guestEmail) {
    identityQuery.push({
      guestEmail: String(guestEmail).toLowerCase(),
    });
  }

  if (identityQuery.length) {
    const recentCount = await ScreenRecording.countDocuments({
      $or: identityQuery,
      createdAt: { $gte: since24h },
    });

    if (recentCount >= 5) {
      riskFlags.push("HIGH_UPLOAD_FREQUENCY_24H");
      riskScore += 20;
    }
  }

  const status = riskScore >= 60 ? "flagged" : "clean";

  return {
    riskScore,
    riskFlags,
    duplicateOf,
    status,
  };
}

// POST /api/screen-recording/upload
router.post(
  "/upload",
  authMiddleware,
  upload.single("video"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No video file",
        });
      }

      const videoUrl = `/uploads/screen-recordings/${req.file.filename}`;

      let userId = req.user?._id || req.user?.id || req.body.userId || null;

      if (userId && !mongoose.Types.ObjectId.isValid(String(userId))) {
        userId = null;
      }

      const promptIdFromBody =
        req.body.promptId ||
        req.body.prompt_id ||
        req.body.id ||
        req.body.promptObjectId ||
        null;

      let promptId = null;
      let promptDoc = null;

      if (
        promptIdFromBody &&
        mongoose.Types.ObjectId.isValid(String(promptIdFromBody))
      ) {
        promptId = String(promptIdFromBody);
        promptDoc = await getPromptDoc(promptId);
      }

      const guestName = req.body.guestName || req.body.userName || "";

      const guestEmail = String(
        req.body.guestEmail || req.body.userEmail || ""
      ).toLowerCase();

      const promptTitle =
        promptDoc?.title ||
        req.body.promptName ||
        req.body.promptTitle ||
        req.body.title ||
        "";

      const promptTextForHash =
        promptDoc?.promptText ||
        req.body.promptText ||
        req.body.prompt ||
        req.body.description ||
        promptTitle ||
        "";

      const fileHash = await hashFile(req.file.path);

      const promptHash = promptTextForHash
        ? hashText(normalizePrompt(promptTextForHash))
        : "";

      let sourceHash =
        req.body.sourceHash ||
        req.body.assetHash ||
        req.body.imageHash ||
        req.body.uploadHash ||
        "";

      if (!sourceHash && promptDoc?.attachment?.path) {
        const attachmentPath = resolveUploadPath(promptDoc.attachment.path);

        if (attachmentPath) {
          try {
            sourceHash = await hashFile(attachmentPath);
          } catch (err) {
            console.warn("Prompt attachment hash failed:", err.message);
          }
        }
      }

      const risk = await calculateRisk({
        fileHash,
        promptHash,
        sourceHash,
        userId,
        guestEmail,
        promptId,
      });

      const doc = await ScreenRecording.create({
        userId: userId || undefined,
        promptId: promptId || null,

        guestName,
        guestEmail,

        videoUrl,
        fileSize: req.file.size,

        promptTitle,
        promptTextSnapshot: promptTextForHash,

        fileHash,
        promptHash,
        sourceHash,

        riskScore: risk.riskScore,
        riskFlags: risk.riskFlags,
        duplicateOf: risk.duplicateOf,
        status: risk.status,
      });

      return res.json({
        success: true,
        recording: {
          id: doc._id,
          promptId: doc.promptId,
          promptName: doc.promptTitle,
          promptTitle: doc.promptTitle,
          videoUrl,
          status: doc.status,
          riskScore: doc.riskScore,
          riskFlags: doc.riskFlags,
          duplicateOf: doc.duplicateOf,
        },
      });
    } catch (err) {
      console.error("Screen recording upload error:", err);

      return res.status(500).json({
        success: false,
        error: "Upload failed",
      });
    }
  }
);

// GET /api/screen-recording/all
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const { status, flag } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (flag) {
      filter.riskFlags = flag;
    }

    const recordings = await ScreenRecording.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "name email avatarUrl avatar role")
      .populate("promptId", "title promptText attachment userId")
      .populate({
        path: "duplicateOf",
        select:
          "videoUrl promptTitle promptId createdAt guestName guestEmail status riskScore riskFlags",
        populate: {
          path: "promptId",
          select: "title",
        },
      })
      .populate("reviewedBy", "name email")
      .lean();

    const mappedRecordings = recordings.map((recording) => {
      const promptName =
        recording.promptId?.title ||
        recording.promptTitle ||
        "";

      const duplicatePromptName =
        recording.duplicateOf?.promptId?.title ||
        recording.duplicateOf?.promptTitle ||
        "";

      return {
        ...recording,

        promptName,
        promptTitle: recording.promptTitle || promptName,

        prompt: recording.promptId
          ? {
              _id: recording.promptId._id,
              title: recording.promptId.title,
              promptText: recording.promptId.promptText,
              attachment: recording.promptId.attachment,
            }
          : null,

        duplicateOf: recording.duplicateOf
          ? {
              ...recording.duplicateOf,
              promptName: duplicatePromptName,
              promptTitle:
                recording.duplicateOf.promptTitle || duplicatePromptName,
            }
          : null,
      };
    });

    return res.json({
      success: true,
      recordings: mappedRecordings,
    });
  } catch (err) {
    console.error("Screen recordings fetch error:", err);

    return res.status(500).json({
      success: false,
      error: "Failed to fetch recordings",
    });
  }
});

// GET /api/screen-recording/:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(String(req.params.id))) {
      return res.status(400).json({
        success: false,
        error: "Invalid recording id",
      });
    }

    const recording = await ScreenRecording.findById(req.params.id)
      .populate("userId", "name email avatarUrl avatar role")
      .populate("promptId", "title promptText attachment userId")
      .populate("duplicateOf", "videoUrl promptTitle promptId createdAt")
      .populate("reviewedBy", "name email")
      .lean();

    if (!recording) {
      return res.status(404).json({
        success: false,
        error: "Recording not found",
      });
    }

    const promptName =
      recording.promptId?.title ||
      recording.promptTitle ||
      "";

    return res.json({
      success: true,
      recording: {
        ...recording,
        promptName,
        promptTitle: recording.promptTitle || promptName,
      },
    });
  } catch (err) {
    console.error("Screen recording detail error:", err);

    return res.status(500).json({
      success: false,
      error: "Failed to fetch recording",
    });
  }
});

// PATCH /api/screen-recording/:id/review
router.patch("/:id/review", authMiddleware, async (req, res) => {
  try {
    const { action, note = "" } = req.body;

    const allowedActions = [
      "approve",
      "mark_fraud",
      "reject",
      "hide",
      "clear_flag",
    ];

    if (!allowedActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: "Invalid action",
      });
    }

    const update = {
      adminNote: note,
      reviewedBy: req.user?._id || req.user?.id || null,
      reviewedAt: new Date(),
    };

    if (action === "approve") {
      update.status = "approved";
    }

    if (action === "mark_fraud") {
      update.status = "fraud";
      update.$addToSet = {
        riskFlags: "ADMIN_MARKED_FRAUD",
      };
    }

    if (action === "reject") {
      update.status = "rejected";
      update.$addToSet = {
        riskFlags: "ADMIN_REJECTED",
      };
    }

    if (action === "hide") {
      update.status = "hidden";
      update.$addToSet = {
        riskFlags: "ADMIN_HIDDEN",
      };
    }

    if (action === "clear_flag") {
      update.status = "clean";
      update.riskFlags = [];
      update.riskScore = 0;
      update.duplicateOf = null;
    }

    const doc = await ScreenRecording.findByIdAndUpdate(
      req.params.id,
      update,
      {
        new: true,
      }
    )
      .populate("promptId", "title promptText attachment")
      .populate("userId", "name email avatarUrl avatar role");

    if (!doc) {
      return res.status(404).json({
        success: false,
        error: "Recording not found",
      });
    }

    return res.json({
      success: true,
      recording: {
        ...doc.toObject(),
        promptName: doc.promptId?.title || doc.promptTitle || "",
        promptTitle: doc.promptTitle || doc.promptId?.title || "",
      },
    });
  } catch (err) {
    console.error("Screen recording review error:", err);

    return res.status(500).json({
      success: false,
      error: "Review action failed",
    });
  }
});

module.exports = router;