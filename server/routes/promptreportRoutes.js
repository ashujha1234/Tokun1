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
const { requireAuth } = require("../utils/auth");
const mongoose = require("mongoose");
const multer = require("multer");
const uploadToAzure = require("../utils/uploadToAzure");

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
router.get("/", async (req, res) => {
  try {
    const reports = await PromptReport.find()
      .populate("reporter", "name email")
      .populate("prompt", "title attachment userId")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, reports });
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ success: false, error: "server_error" });
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