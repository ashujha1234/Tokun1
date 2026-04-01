const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const User = require("../models/User");
const KycSubmission = require("../models/KycSubmission");
const { requireAuth } = require("../utils/auth");
const { processKyc } = require("../utils/kyc/processKyc");
const uploadToAzure = require("../utils/uploadToAzure");
const router = express.Router();

// ✅ IMPORTANT: do NOT store KYC docs in publicly served `/uploads`
// put in a private folder not mounted by express.static
const KYC_DIR = path.join(__dirname, "..", "private_uploads", "kyc");
fs.mkdirSync(KYC_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, KYC_DIR);
  },
  filename: function (req, file, cb) {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, `${req.user._id}_${Date.now()}_${safe}`);
  },
});

// const upload = multer({
//   storage,
//   limits: { fileSize: 6 * 1024 * 1024 }, // 6MB
//   fileFilter: (_req, file, cb) => {
//     const ok = /^image\/(png|jpeg|jpg|webp)$/i.test(file.mimetype);
//     cb(ok ? null : new Error("Only images allowed"), ok);
//   },
// });



const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 }, // 6MB
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(png|jpeg|jpg|webp)$/i.test(file.mimetype);
    cb(ok ? null : new Error("Only images allowed"), ok);
  },
});

// GET status
router.get("/status", requireAuth, async (req, res) => {
  const u = await User.findById(req.user._id).select(
    "kycStatus kycStage kycReasonCode kycReasonText kycCooldownUntil kycExtractedName kycMatchScore"
  );

  return res.json({
    success: true,
    kycStatus: u?.kycStatus || "NOT_SUBMITTED",
    kycStage: u?.kycStage || null,
    kycReasonCode: u?.kycReasonCode || null,
    kycReasonText: u?.kycReasonText || null,
    cooldownUntil: u?.kycCooldownUntil || null,
    extractedName: u?.kycExtractedName || null,
    matchScore: u?.kycMatchScore ?? null,
  });
});

// // routes/kyc.js (inside /submit)
// router.post(
//   "/submit",
//   requireAuth,
//   upload.fields([
//     { name: "front", maxCount: 1 },
//     { name: "back", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       const user = await User.findById(req.user._id);

//       const docType = String(req.body.docType || "").toUpperCase();
//       if (!["AADHAAR", "PASSPORT"].includes(docType)) {
//         return res.status(400).json({ success: false, error: "INVALID_DOC_TYPE" });
//       }

//       const front = req.files?.front?.[0];
//       const back = req.files?.back?.[0];

//       if (!front || !back) {
//         return res.status(400).json({
//           success: false,
//           error: "MISSING_FILES",
//           missing: { front: !front, back: !back },
//         });
//       }

//       // ✅ Create submission but mark as VERIFIED immediately
//       const sub = await KycSubmission.create({
//         userId: user._id,
//         docType,
//         frontPath: front.path,
//         backPath: back.path,
//         status: "VERIFIED",
//         stage: null,
//         extractedName: null,
//         matchScore: 1,
//         reasonCode: null,
//         reasonText: null,
//         cooldownUntil: null,
//       });

//       // ✅ Update user as VERIFIED immediately
//       await User.findByIdAndUpdate(user._id, {
//         kycStatus: "VERIFIED",
//         kycDocType: docType,
//         kycStage: null,
//         kycReasonCode: null,
//         kycReasonText: null,
//         kycLastSubmittedAt: new Date(),
//         kycVerifiedAt: new Date(),
//         kycExtractedName: null,
//         kycMatchScore: 1,
//         kycCooldownUntil: null,
//          kycLastSubmissionId: sub._id,   // ✅ ADD THIS
       

//       });

//       // ❌ No OCR background processing for now
//       // setImmediate(() => processKyc(sub._id).catch(console.error));

//       return res.json({
//         success: true,
//         kycStatus: "VERIFIED",
//         kycStage: null,
//         submissionId: sub._id,
//       });
//     } catch (e) {
//       console.error("KYC submit failed", e);
//       return res.status(500).json({ success: false, error: "KYC_SUBMIT_FAILED" });
//     }
//   }
// );

router.post(
  "/submit",
  requireAuth,
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      const docType = String(req.body.docType || "").toUpperCase();
      if (!["AADHAAR", "PASSPORT"].includes(docType)) {
        return res.status(400).json({ success: false, error: "INVALID_DOC_TYPE" });
      }

      const front = req.files?.front?.[0];
      const back = req.files?.back?.[0];

      if (!front || !back) {
        return res.status(400).json({
          success: false,
          error: "MISSING_FILES",
          missing: { front: !front, back: !back },
        });
      }

      const frontUrl = await uploadToAzure(
        front.buffer,
        front.originalname,
        "kyc-documents"
      );

      const backUrl = await uploadToAzure(
        back.buffer,
        back.originalname,
        "kyc-documents"
      );

      const sub = await KycSubmission.create({
        userId: user._id,
        docType,
        frontPath: frontUrl,
        backPath: backUrl,
        status: "VERIFIED",
        stage: null,
        extractedName: null,
        matchScore: 1,
        reasonCode: null,
        reasonText: null,
        cooldownUntil: null,
      });

      await User.findByIdAndUpdate(user._id, {
        kycStatus: "VERIFIED",
        kycDocType: docType,
        kycStage: null,
        kycReasonCode: null,
        kycReasonText: null,
        kycLastSubmittedAt: new Date(),
        kycVerifiedAt: new Date(),
        kycExtractedName: null,
        kycMatchScore: 1,
        kycCooldownUntil: null,
        kycLastSubmissionId: sub._id,
      });

      return res.json({
        success: true,
        kycStatus: "VERIFIED",
        kycStage: null,
        submissionId: sub._id,
        frontUrl,
        backUrl,
      });
    } catch (e) {
      console.error("KYC submit failed", e);
      return res.status(500).json({ success: false, error: "KYC_SUBMIT_FAILED" });
    }
  }
);

// PUBLIC: verification info for profile (no docs exposed)
// router.get("/public/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const u = await User.findById(userId).select(
//       "kycStatus kycDocType kycVerifiedAt"
//     );

//     if (!u) return res.status(404).json({ success: false });

//     return res.json({
//       success: true,
//       kycStatus: u.kycStatus || "NOT_SUBMITTED",
//       docType: u.kycDocType || null,
//       verifiedAt: u.kycVerifiedAt || null,
//     });
//   } catch (e) {
//     console.error("KYC public status error", e);
//     return res.status(500).json({ success: false });
//   }
// });


router.get("/public/:userId", async (req, res) => {
  try {
    const u = await User.findById(req.params.userId).select(
      "kycStatus kycVerifiedAt kycDocType"
    );

    if (!u) return res.status(404).json({ success: false });

    return res.json({
      success: true,
      kycStatus: u.kycStatus || "NOT_SUBMITTED",
      docType: u.kycDocType || null,
      verifiedAt: u.kycVerifiedAt || null,
    });
  } catch (e) {
    return res.status(500).json({ success: false });
  }
});


// router.get("/me/preview/front", requireAuth, async (req, res) => {
//   try {
//     const u = await User.findById(req.user._id).select("kycLastSubmissionId");

//     let sub = null;

//     // 1) Try lastSubmissionId
//     if (u?.kycLastSubmissionId) {
//       sub = await KycSubmission.findById(u.kycLastSubmissionId).select("frontPath");
//     }

//     // 2) Fallback: latest submission for user
//     if (!sub?.frontPath) {
//       sub = await KycSubmission.findOne({ userId: req.user._id })
//         .sort({ createdAt: -1 })
//         .select("frontPath");
//     }

//     if (!sub?.frontPath) return res.status(404).end();

//     const abs = path.isAbsolute(sub.frontPath)
//       ? sub.frontPath
//       : path.join(process.cwd(), sub.frontPath);

//     // ✅ if file missing on disk
//     if (!fs.existsSync(abs)) {
//       console.log("KYC file missing:", abs);
//       return res.status(404).end();
//     }

//     // ✅ correct content type for image
//     res.setHeader("Content-Type", "image/jpeg"); // ok even if png/webp (browser still shows)
//     return res.sendFile(abs);
//   } catch (e) {
//     console.error("KYC preview error:", e);
//     return res.status(500).end();
//   }
// });



router.get("/me/preview/front", requireAuth, async (req, res) => {
  try {
    const u = await User.findById(req.user._id).select("kycLastSubmissionId");

    let sub = null;

    if (u?.kycLastSubmissionId) {
      sub = await KycSubmission.findById(u.kycLastSubmissionId).select("frontPath");
    }

    if (!sub?.frontPath) {
      sub = await KycSubmission.findOne({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .select("frontPath");
    }

    if (!sub?.frontPath) return res.status(404).end();

    const azureRes = await fetch(sub.frontPath);

    if (!azureRes.ok) {
      console.log("Azure KYC file fetch failed:", azureRes.status, sub.frontPath);
      return res.status(404).end();
    }

    const contentType =
      azureRes.headers.get("content-type") || "image/jpeg";

    const arrayBuffer = await azureRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "private, max-age=60");

    return res.send(buffer);
  } catch (e) {
    console.error("KYC preview error:", e);
    return res.status(500).end();
  }
});


module.exports = router;
