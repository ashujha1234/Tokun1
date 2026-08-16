// const express = require("express");
// const router = express.Router();
// const PromptReport = require("../models/PromptReport");
// const Category= require("../models/Category");
// const { requireAuth } = require("../utils/auth"); // middleware to get req.user
// const mongoose = require("mongoose"); 
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // Configure multer
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const dir = "./uploads/reports";
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//     cb(null, dir);
//   },
//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     const name = file.fieldname + "-" + Date.now() + ext;
//     cb(null, name);
//   },
// });
// const upload = multer({ storage });

// // POST /api/prompt-reports
// router.post("/", requireAuth, upload.array("screenshots", 5), async (req, res) => {
//   try {
//     const {
//       prompt,
//       resourceTitle,
//       resourceURL,
//       category,
//       tags,
//       reason,
//       description,
//       stepsToReproduce,
//     } = req.body;

//     if (!prompt || !reason || !category) {
//       return res.status(400).json({ success: false, error: "prompt_reason_category_required" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(prompt)) {
//       return res.status(400).json({ success: false, error: "invalid_prompt_or_category_id" });
//     }

//     // Save uploaded file paths
//     let screenshotPaths = [];
//     if (req.files && req.files.length > 0) {
//       screenshotPaths = req.files.map(file => file.path); // save local file path
//     }
//     const Categories=  await Category.findOne({ name: category });
//     const report = await PromptReport.create({
//       reporter: req.user._id,
//       prompt,
//       resourceTitle,
//       resourceURL,
//       category: Categories._id,
//       tags: tags ? JSON.parse(tags) : [], // if sent as JSON string
//       reason,
//       description,
//       stepsToReproduce,
//       screenshots: screenshotPaths,
//       agreeStatus: false,
//       status: "Pending",
//     });

//     res.json({ success: true, report });
//   } catch (err) {
//     console.error("POST /prompt-reports error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// module.exports = router;



// /**
//  * GET /api/prompt-reports
//  * Get all reports (for admin)
//  * No authentication here, but can add admin middleware later
//  */
// router.get("/", async (req, res) => {
//   try {
//     const reports = await PromptReport.find()
//       .populate("reporter", "name email")
//       .populate("prompt", "title")
//       .populate("category", "name")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, reports });
//   } catch (err) {
//     console.error("GET /prompt-reports error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });


// /**
//  * GET /api/prompt-reports/me
//  * Get all reports created by logged-in user
//  */
// router.get("/me", requireAuth, async (req, res) => {
//   try {
//     const reports = await PromptReport.find({ reporter: req.user._id })
//       .populate("prompt", "title")
//       .populate("category", "name")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, reports });
//   } catch (err) {
//     console.error("GET /prompt-reports/me error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// module.exports = router;


// const express = require("express");
// const router = express.Router();
// const PromptReport = require("../models/PromptReport");
// const Category = require("../models/Category");
// const { requireAuth } = require("../utils/auth");
// const mongoose = require("mongoose");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const dir = "./uploads/reports";
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//     cb(null, dir);
//   },
//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     cb(null, `screenshots-${Date.now()}${ext}`);
//   },
// });
// const upload = multer({ storage });

// /**
//  * POST /api/prompt-reports
//  * Create report
//  */
// router.post("/", requireAuth, upload.array("screenshots", 5), async (req, res) => {
//   try {
//     const {
//       prompt,
//       resourceTitle,
//       resourceURL,
//       category, // should be categoryId
//       tags,
//       reason,
//       description,
//       stepsToReproduce,
//     } = req.body;

//     if (!prompt || !reason || !category) {
//       return res.status(400).json({ success: false, error: "prompt_reason_category_required" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(prompt) || !mongoose.Types.ObjectId.isValid(category)) {
//       return res.status(400).json({ success: false, error: "invalid_prompt_or_category_id" });
//     }

//     const screenshotPaths = (req.files || []).map((f) => `/uploads/reports/${path.basename(f.path)}`);

//     const report = await PromptReport.create({
//       reporter: req.user._id,
//       prompt,
//       resourceTitle,
//       resourceURL,
//       category, // store categoryId directly
//       tags: tags ? JSON.parse(tags) : [],
//       reason,
//       description,
//       stepsToReproduce,
//       screenshots: screenshotPaths,
//       agreeStatus: false,
//       status: "Pending",
//     });

//     res.json({ success: true, report });
//   } catch (err) {
//     console.error("POST /prompt-reports error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// /**
//  * GET /api/prompt-reports
//  * Admin: list all reports
//  */
// router.get("/", async (req, res) => {
//   try {
//     console.log("Fetching reports...");
//     const reports = await PromptReport.find()
//       .populate("reporter", "name email")
//       .populate("prompt", "title attachment userId")
//       .populate("category", "name")
//       .sort({ createdAt: -1 });

//     console.log("Reports fetched:", reports); // Log the data being returned

//     res.json({ success: true, reports });
//   } catch (err) {
//     console.error("Error fetching reports:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });
// /**
//  * GET /api/prompt-reports/me
//  */
// router.get("/me", requireAuth, async (req, res) => {
//   try {
//     const reports = await PromptReport.find({ reporter: req.user._id })
//       .populate("prompt", "title")
//       .populate("category", "name")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, reports });
//   } catch (err) {
//     console.error("GET /prompt-reports/me error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const PromptReport = require("../models/PromptReport");
const Category = require("../models/Category");
const Prompt = require("../models/Prompt");
const Notification = require("../models/Notification");
const { requireAuth } = require("../utils/auth");
const { notifyAdmins } = require("../utils/notifyAdmins");
const User = require("../models/User");
const { sendProductReportedEmail } = require("../services/creatorEmail.service");
const { alertProductReported } = require("../services/adminAlertEmail.service");
const mongoose = require("mongoose");
const multer = require("multer");
const uploadToAzure = require("../utils/uploadToAzure");

function requireAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ success: false, error: "forbidden" });
  }
  next();
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    const allowed = /^image\/(png|jpeg|jpg|webp)$/i.test(file.mimetype);
    if (!allowed) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

/**
 * POST /api/prompt-reports
 * Create report
 */
router.post("/", requireAuth, upload.array("screenshots", 5), async (req, res) => {
  try {
    const {
      prompt,
      resourceTitle,
      resourceURL,
      category,
      tags,
      reason,
      description,
      stepsToReproduce,
    } = req.body;

    if (!prompt || !reason || !category) {
      return res.status(400).json({
        success: false,
        error: "prompt_reason_category_required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(prompt) ||
      !mongoose.Types.ObjectId.isValid(category)
    ) {
      return res.status(400).json({
        success: false,
        error: "invalid_prompt_or_category_id",
      });
    }

    const screenshotUrls = await Promise.all(
      (req.files || []).map((file) =>
        uploadToAzure(
          file.buffer,
          file.originalname,
          "report-screenshots"
        )
      )
    );

    const report = await PromptReport.create({
      reporter: req.user._id,
      prompt,
      resourceTitle,
      resourceURL,
      category,
      tags: tags ? JSON.parse(tags) : [],
      reason,
      description,
      stepsToReproduce,
      screenshots: screenshotUrls,
      agreeStatus: false,
      status: "Pending",
    });

    const reportedPrompt = await Prompt.findById(prompt).select("title");
    await notifyAdmins({
      type: "ADMIN_PROMPT_REPORTED",
      promptId: prompt,
      message: `"${reportedPrompt?.title || "A prompt"}" was reported (${reason}) by ${req.user.name || req.user.email}.`,
      meta: { reportId: report._id, reason },
    }).catch((err) => console.error("Admin report-notification failed:", err.message));

    /* The same alert by email. A reported product stays on sale until a human
       acts on it, and ADMIN_PROMPT_REPORTED is only seen by whoever happens to
       open the admin panel next. */
    alertProductReported({
      productTitle: reportedPrompt?.title,
      productId: String(prompt),
      reporterName: req.user.name || req.user.email,
      reason,
    }).catch((err) => console.error("Admin report-alert email failed:", err.message));

    res.json({ success: true, report });
  } catch (err) {
    console.error("POST /prompt-reports error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

/**
 * GET /api/prompt-reports
 * Admin: list all reports
 */
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    /* The whole listing, not just its cover.
       This used to send title + attachment, so an admin ruling on "this prompt
       doesn't do what it says" or "this is copied from X" was looking at a
       thumbnail and a complaint — the one thing that would settle either
       question, the prompt text itself, was never sent.

       promptText is paid content and is deliberately NOT in any public
       response. This route is requireAuth + requireAdmin, and reviewing the
       product is the entire purpose of the screen it feeds. */
    const reports = await PromptReport.find()
      .populate("reporter", "name email")
      .populate({
        path: "prompt",
        select:
          "title description promptText attachment userId flagged deleted price free exclusive tags categories subCategories createdAt averageRating downloads mediaValidation",
        populate: [
          { path: "userId", select: "name email sellerStatus createdAt" },
          { path: "categories", select: "name" },
          { path: "subCategories", select: "name" },
        ],
      })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, reports });
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// Admin actions on a report — dismiss / flag / suspend. Score/report content is
// a signal; these are the only calls that actually persist a decision.
// ════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/prompt-reports/:id/dismiss
 * Report wasn't a real violation — close it, no action on the prompt.
 */
router.post("/:id/dismiss", requireAuth, requireAdmin, async (req, res) => {
  try {
    const report = await PromptReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, error: "report_not_found" });

    report.status = "Rejected";
    await report.save();

    return res.json({ success: true, report });
  } catch (err) {
    console.error("Dismiss report error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/**
 * POST /api/prompt-reports/:id/flag
 * Confirmed policy violation — flag the prompt (hides it from the public
 * marketplace, see the flagged:true gate in GET /api/prompt/others) and
 * notify the seller. Report stays open for record-keeping (status: Reviewed).
 */
/* Tells the seller their product was taken out of the marketplace after a
   report. Never fatal: the listing is already hidden and the report already
   resolved by the time this runs. */
async function emailReportedSeller(report, note, takenDown) {
  try {
    const seller = await User.findById(report.prompt.userId).select("name email").lean();
    if (!seller?.email) return;
    await sendProductReportedEmail({
      to: seller.email,
      creatorName: seller.name,
      productTitle: report.prompt.title,
      reason: note || report.reason || "",
      takenDown,
    });
  } catch (mailErr) {
    console.error("Reported-product email failed (action stands):", mailErr?.message || mailErr);
  }
}

router.post("/:id/flag", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { note } = req.body;
    const report = await PromptReport.findById(req.params.id).populate("prompt", "title userId");
    if (!report) return res.status(404).json({ success: false, error: "report_not_found" });
    if (!report.prompt) return res.status(404).json({ success: false, error: "prompt_not_found" });

    await Prompt.findByIdAndUpdate(report.prompt._id, { $set: { flagged: true } });

    report.status = "Reviewed";
    await report.save();

    await Notification.create({
      receiverUserId: report.prompt.userId,
      type: "PROMPT_MEDIA_REVIEW",
      promptId: report.prompt._id,
      message: `Your product "${report.prompt.title}" was flagged after a user report${note ? `: ${note}` : "."} It's now hidden from the marketplace.`,
      meta: { reportId: report._id, adminAction: "flagged", note: note || "" },
    });

    await emailReportedSeller(report, note, true);

    return res.json({ success: true, report });
  } catch (err) {
    console.error("Flag report error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/**
 * POST /api/prompt-reports/:id/suspend
 * Serious violation — soft-delete the listing (same semantics as the
 * seller's own DELETE /api/prompt/:id: hidden from marketplace, buyers who
 * already purchased keep access) plus flag it, and notify the seller.
 */
router.post("/:id/suspend", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { note } = req.body;
    const report = await PromptReport.findById(req.params.id).populate("prompt", "title userId");
    if (!report) return res.status(404).json({ success: false, error: "report_not_found" });
    if (!report.prompt) return res.status(404).json({ success: false, error: "prompt_not_found" });

    await Prompt.findByIdAndUpdate(report.prompt._id, {
      $set: { flagged: true, deleted: true, deletedAt: new Date() },
    });

    report.status = "Resolved";
    await report.save();

    await Notification.create({
      receiverUserId: report.prompt.userId,
      type: "PROMPT_MEDIA_REVIEW",
      promptId: report.prompt._id,
      message: `Your product "${report.prompt.title}" was suspended after a user report${note ? `: ${note}` : "."} It's no longer listed on the marketplace.`,
      meta: { reportId: report._id, adminAction: "suspended", note: note || "" },
    });

    await emailReportedSeller(report, note, true);

    return res.json({ success: true, report });
  } catch (err) {
    console.error("Suspend report error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/**
 * GET /api/prompt-reports/me
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const reports = await PromptReport.find({ reporter: req.user._id })
      .populate("prompt", "title")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, reports });
  } catch (err) {
    console.error("GET /prompt-reports/me error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;