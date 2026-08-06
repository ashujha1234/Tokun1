// // routes/promptRoutes.js
// const express = require("express");
// const mongoose = require("mongoose");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const Prompt=require("../models/Prompt");
// const Purchase=require("../models/Purchase");
// const uploadToAzure = require("../utils/uploadToAzure");
// const Category=require("../models/Category");
// const {requireKycVerified} = require("../middleware/requireKycVerified")
// const { requireAuth }  = require("../utils/auth");
// const { logActivity } = require("../utils/activityLogger");
// const crypto = require("crypto");
// const sharp = require("sharp");

// function makePromptHash(text) {
//   return crypto.createHash("sha256").update(text || "", "utf8").digest("hex");
// }

// async function watermarkImage(buffer) {
//   const meta = await sharp(buffer).metadata();
//   const w = meta.width || 800;
//   const fontSize = Math.max(20, Math.floor(w / 18));

//   const wm = Buffer.from(
//     `<svg width="${w}" height="${fontSize + 20}">
//       <text x="12" y="${fontSize}" font-size="${fontSize}"
//             fill="rgba(255,255,255,0.45)" font-family="Arial" font-weight="bold">
//         tokun.world
//       </text>
//     </svg>`
//   );

//   return sharp(buffer)
//     .composite([{ input: wm, gravity: "southeast" }])
//     .toBuffer();
// }

// // --- Multer setup (local disk) ---
// // const storage = multer.diskStorage({
// //   destination: function (req, file, cb) {
// //     cb(null, path.join(__dirname, "../uploads")); // make sure /uploads exists
// //   },
// //   filename: function (req, file, cb) {
// //     const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
// //     cb(null, unique + "-" + file.originalname);
// //   },
// // });
// // const upload = multer({ storage });




// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
// });










//  // POST create prompt
// // Use upload.fields() to accept multiple fields
// // router.post(
// //   "/",
// //   requireAuth,
// //   upload.fields([
// //     { name: "attachment", maxCount: 1 }, // main attachment
// //     { name: "uploadCode", maxCount: 10 }, // additional code uploads
// //   ]),
// //   async (req, res) => {
// //     try {
// //       const { title, description, promptText, free, price, tags, categories ,exclusive} = req.body;

// //       if (!title || !promptText) {
// //         return res.status(400).json({ success: false, error: "title_and_promptText_required" });
// //       }

// //       if (free === "false" && (!price || Number(price) <= 0)) {
// //         return res.status(400).json({ success: false, error: "price_required_for_paid_prompt" });
// //       }

// //       if (!req.files || !req.files.attachment || req.files.attachment.length === 0) {
// //         return res.status(400).json({ success: false, error: "attachment_required" });
// //       }

// //       // Handle main attachment
// //       const file = req.files.attachment[0];
// //       const fileType = file.mimetype.startsWith("image/")
// //         ? "image"
// //         : file.mimetype.startsWith("video/")
// //         ? "video"
// //         : null;

// //       if (!fileType) {
// //         return res.status(400).json({ success: false, error: "only_image_or_video_allowed" });
// //       }

// //       const attachment = {
// //         filename: file.originalname,
// //         path: "/uploads/" + file.filename,
// //         mimetype: file.mimetype,
// //         size: file.size,
// //         type: fileType,
// //       };

// //       // Handle uploadCode files (optional)
// //       let uploadCode = [];
// //       if (req.files.uploadCode && req.files.uploadCode.length > 0) {
// //         uploadCode = req.files.uploadCode.map((f) => ({
// //           filename: f.originalname,
// //           path: "/uploads/" + f.filename,
// //           mimetype: f.mimetype,
// //           size: f.size,
// //           type: "other",
// //         }));
// //       }

// //       // Handle categories (case-insensitive)
// //       let categoryIds = [];
// //       if (categories) {
// //         const categoryNames = categories.split(",").map((c) => c.trim()).filter(Boolean);
// //         const foundCategories = await Category.find({
// //           $or: categoryNames.map((name) => ({ name: { $regex: `^${name}$`, $options: "i" } })),
// //         });

// //         if (foundCategories.length !== categoryNames.length) {
// //           const foundNames = foundCategories.map((c) => c.name.toLowerCase());
// //           const invalidNames = categoryNames.filter((c) => !foundNames.includes(c.toLowerCase()));
// //           return res.status(400).json({ success: false, error: "invalid_categories", invalid: invalidNames });
// //         }

// //         categoryIds = foundCategories.map((c) => c._id);
// //       }

// //       const prompt = await Prompt.create({
// //         userId: req.user._id,
// //         title,
// //         description,
// //         promptText,
// //         free: free === "true" || free === true,
// //         price: free === "false" ? Number(price) : 0,
// //         tags: tags ? tags.split(",").map((t) => t.trim()) : [],
// //         exclusive: exclusive === "true" || exclusive === true, // ✅ new
// //         categories: categoryIds,
// //         attachment,
// //         uploadCode, // <-- save the code uploads here
// //       });

// //       // prompt.tokun_price is already set automatically
// //       res.json({ success: true, prompt });
// //     } catch (err) {
// //       console.error(err);
// //       res.status(500).json({ success: false, error: "server_error" });
// //     }
// //   }
// // );


// router.post(
//   "/",
//   requireAuth,
//   requireKycVerified,
//   upload.fields([
//     { name: "attachment", maxCount: 1 },
//     { name: "uploadCode", maxCount: 10 },
//   ]),
//   async (req, res) => {
//     try {
//       const {
//         title,
//         description,
//         promptText,
//         free,
//         price,
//         tags,
//         categories,
//         exclusive,
//       } = req.body;

//       if (!title || !promptText) {
//         return res.status(400).json({
//           success: false,
//           error: "title_and_promptText_required",
//         });
//       }

//       if (free === "false" && (!price || Number(price) <= 0)) {
//         return res.status(400).json({
//           success: false,
//           error: "price_required_for_paid_prompt",
//         });
//       }

//       if (!req.files?.attachment?.length) {
//         return res.status(400).json({
//           success: false,
//           error: "attachment_required",
//         });
//       }

//       /* ================= MAIN ATTACHMENT ================= */
//       // const file = req.files.attachment[0];

//       // const fileType = file.mimetype.startsWith("image/")
//       //   ? "image"
//       //   : file.mimetype.startsWith("video/")
//       //   ? "video"
//       //   : null;

//       // if (!fileType) {
//       //   return res.status(400).json({
//       //     success: false,
//       //     error: "only_image_or_video_allowed",
//       //   });
//       // }

//       // const attachmentUrl = await uploadToAzure(
//       //   file.buffer,
//       //   file.originalname,
//       //   "prompt-attachments"
//       // );
//        /* ================= MAIN ATTACHMENT ================= */
//       const file = req.files.attachment[0];

//       const fileType = file.mimetype.startsWith("image/")
//         ? "image"
//         : file.mimetype.startsWith("video/")
//         ? "video"
//         : null;

//       if (!fileType) {
//         return res.status(400).json({
//           success: false,
//           error: "only_image_or_video_allowed",
//         });
//       }

//       // watermark sirf image pe
//       let bufferToUpload = file.buffer;
//       if (fileType === "image") {
//         try {
//           bufferToUpload = await watermarkImage(file.buffer);
//         } catch (e) {
//           console.error("watermark failed, original upload:", e.message);
//           bufferToUpload = file.buffer;
//         }
//       }

//       const attachmentUrl = await uploadToAzure(
//         bufferToUpload,
//         file.originalname,
//         "prompt-attachments"
//       );


//       const attachment = {
//         filename: file.originalname,
//         path: attachmentUrl,
//         mimetype: file.mimetype,
//         size: file.size,
//         type: fileType,
//       };

//       /* ================= UPLOAD CODE (OPTIONAL) ================= */
//       let uploadCode = [];

//       if (req.files.uploadCode?.length) {
//         for (const f of req.files.uploadCode) {
//           const codeUrl = await uploadToAzure(
//             f.buffer,
//             f.originalname,
//             "prompt-code"
//           );

//           uploadCode.push({
//             filename: f.originalname,
//             path: codeUrl,
//             mimetype: f.mimetype,
//             size: f.size,
//             type: "other",
//           });
//         }
//       }

//       /* ================= CATEGORIES ================= */
//       let categoryIds = [];
//       if (categories) {
//         const names = categories
//           .split(",")
//           .map((c) => c.trim())
//           .filter(Boolean);

//         const found = await Category.find({
//           $or: names.map((n) => ({
//             name: { $regex: `^${n}$`, $options: "i" },
//           })),
//         });

//         if (found.length !== names.length) {
//           return res.status(400).json({
//             success: false,
//             error: "invalid_categories",
//           });
//         }

//         categoryIds = found.map((c) => c._id);
//       }

//       /* ================= SAVE PROMPT ================= */
//       const prompt = await Prompt.create({
//         userId: req.user._id,
//         title,
//         description,
//         promptText,
//         free: free === "true",
//         price: free === "false" ? Number(price) : 0,
//         tags: tags ? tags.split(",") : [],
//         exclusive: exclusive === "true",
//         categories: categoryIds,
//         attachment,
//         uploadCode,
//                 promptHash: makePromptHash(promptText),   
//       });

//       // ✅ YE ADD KARO YAHAN
// await logActivity({
//   type: "PRODUCT_APPROVED",
//   title: "New product listed",
//   description: `${req.user.name} uploaded "${prompt.title}"`,
//   actorId: req.user._id,
//   actorName: req.user.name,
//   targetId: prompt._id,
//   targetType: "Prompt",
//   targetName: prompt.title,
//   meta: {
//     category: prompt.categories?.[0] || null,
//     price: prompt.price,
//     free: prompt.free,
//   },
// });



//       res.json({ success: true, prompt });
//     } catch (err) {
//       console.error("CREATE PROMPT ERROR:", err);
//       res.status(500).json({
//         success: false,
//         error: "server_error",
//       });
//     }
//   }
// );



// // GET /prompts/my?type=image&category=coding
// router.get("/my", requireAuth, async (req, res) => {
//   try {
//     const { type, category } = req.query;

//     let filter = { userId: req.user._id }; // own prompts

//     // Filter by attachment type
//     if (type === "image" || type === "video") {
//       filter["attachment.type"] = type;
//     }

//     // Filter by category (optional)
//     if (category) {
//       // Find category id (case-insensitive)
//       const cat = await Category.findOne({ name: { $regex: `^${category}$`, $options: "i" } });
//       if (!cat) {
//         return res.status(400).json({ success: false, error: "invalid_category" });
//       }
//       filter.categories = cat._id;
//     }

//     // const prompts = await Prompt.find(filter)
//     //   .populate("categories", "name")
//     //   .sort({ createdAt: -1 });


// const prompts = await Prompt.find(filter)
//   .populate("categories", "name")
//   .populate("userId", "name")   // ✔ FIXED
//   .sort({ createdAt: -1 });



//     res.json({ success: true, prompts });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// // // GET /prompts/others?type=video&category=UI/UX
// // router.get("/others", requireAuth, async (req, res) => {
// //   try {
// //     const { type, category } = req.query;

// //     let filter = { userId: { $ne: req.user._id } }; // exclude own prompts

// //     // Filter by attachment type
// //     if (type === "image" || type === "video") {
// //       filter["attachment.type"] = type;
// //     }

// //     // Filter by category (optional)
// //     if (category) {
// //       const cat = await Category.findOne({ name: { $regex: `^${category}$`, $options: "i" } });
// //       if (!cat) {
// //         return res.status(400).json({ success: false, error: "invalid_category" });
// //       }
// //       filter.categories = cat._id;
// //     }

// //     const prompts = await Prompt.find(filter)
// //       .populate("categories", "name")
// //       .sort({ createdAt: -1 });

// //     res.json({ success: true, prompts });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });
// // ✅ GET prompts uploaded by a specific user (PUBLIC PROFILE)
// router.get("/user/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const prompts = await Prompt.find({
//       userId,
//       deleted: { $ne: true },
      
//     })
//       .populate("categories", "name")
//       .populate("userId", "name") // REQUIRED for uploader info
//       .sort({ createdAt: -1 });

//     return res.json({
//       success: true,
//       user: prompts[0]?.userId || null,
//       prompts,
//     });
//   } catch (err) {
//     console.error("GET /user/:userId error:", err);
//     return res.status(500).json({
//       success: false,
//       error: "server_error",
//     });
//   }
// });




// // GET /prompts/others?type=video&category=UI/UX
// router.get("/others", async (req, res) => {
//   try {
//     const { type, category } = req.query;

//     // ✅ Base filter — show only active public prompts
//     let filter = { deleted: { $ne: true } };

//     // If logged in (token optional), exclude user's own prompts
//     if (req.user && req.user._id) {
//       filter.userId = { $ne: req.user._id };
//     }

//     // Filter by attachment type
//     if (type === "image" || type === "video") {
//       filter["attachment.type"] = type;
//     }

//     // Filter by category (optional)
//     if (category) {
//       const cat = await Category.findOne({
//         name: { $regex: `^${category}$`, $options: "i" },
//       });
//       if (!cat) {
//         return res
//           .status(400)
//           .json({ success: false, error: "invalid_category" });
//       }
//       filter.categories = cat._id;
//     }

//  const prompts = await Prompt.find(filter)
//   .populate("categories", "name")
//   .populate("userId", "name")   // ✔ FIXED
//   .sort({ createdAt: -1 });


//     res.json({ success: true, prompts });
//   } catch (err) {
//     console.error("GET /others error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });


// // GET /prompts/others?type=video&category=UI/UX
// // router.get("/others", requireAuth, async (req, res) => {
// //   try {
// //     const { type, category } = req.query;

// //     let filter = { deleted: { $ne: true } };

// //     if (req.user && req.user._id) {
// //       filter.userId = { $ne: req.user._id };
// //     }

// //     if (type === "image" || type === "video") {
// //       filter["attachment.type"] = type;
// //     }

// //     if (category) {
// //       const cat = await Category.findOne({
// //         name: { $regex: `^${category}$`, $options: "i" },
// //       });
// //       if (!cat) {
// //         return res.status(400).json({
// //           success: false,
// //           error: "invalid_category",
// //         });
// //       }
// //       filter.categories = cat._id;
// //     }

// //     const prompts = await Prompt.find(filter)
// //       .populate("categories", "name")
// //       .populate("userId", "name avatarUrl")   // ⭐ MISSING earlier — REQUIRED
// //       .sort({ createdAt: -1 });

// //     res.json({ success: true, prompts });
// //   } catch (err) {
// //     console.error("GET /others error:", err);
// //     res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });






// // POST /prompt/:id/rate
// router.post("/:id/rate", requireAuth, async (req, res) => {
//   try {
//     const { rating } = req.body;
//     if (!rating || rating < 1 || rating > 5) {
//       return res.status(400).json({ success: false, error: "rating_must_be_1_to_5" });
//     }

//     const prompt = await Prompt.findById(req.params.id);
//     if (!prompt) return res.status(404).json({ success: false, error: "prompt_not_found" });

//     // Check if user already rated
//     const existing = prompt.ratings.find(r => r.userId.equals(req.user._id));
//     if (existing) {
//       existing.rating = rating; // update rating
//     } else {
//       prompt.ratings.push({ userId: req.user._id, rating });
//     }

//     await prompt.save();
//     res.json({ success: true, averageRating: prompt.averageRating, ratings: prompt.ratings });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });


// // GET /api/prompt/by-seller/:sellerId
// router.get("/by-seller/:sellerId", async (req, res) => {
//   try {
//     const { sellerId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(sellerId)) {
//       return res.status(400).json({ success: false, error: "Invalid sellerId" });
//     }

//     const prompts = await Prompt.find({ userId: sellerId })
//       .populate("userId", "name email avatarUrl location sellerStatus isVerified")
//       .populate("categories", "name")
//       .sort({ createdAt: -1 })
//       .lean();

//     return res.json({ success: true, prompts });
//   } catch (err) {
//     console.error("GET /api/prompt/by-seller/:sellerId error:", err);
//     return res.status(500).json({ success: false, error: "Server error" });
//   }
// });



// router.delete("/:id", requireAuth, async (req, res) => {
//   try {
//     const promptId = req.params.id;

//     // Find prompt and make sure user owns it
//     const prompt = await Prompt.findOne({ _id: promptId, userId: req.user._id });
//     if (!prompt) {
//       return res.status(404).json({ success: false, error: "prompt_not_found_or_access_denied" });
//     }

//     // Check if any purchases exist
//     const purchased = await Purchase.findOne({ prompt: promptId });
//     if (purchased) {
//       // Soft delete if purchased by someone
//       prompt.deleted = true;
//       prompt.deletedAt = new Date();
//       await prompt.save();
//       return res.json({ success: true, message: "Prompt soft-deleted (buyers still have access)" });
//     }

//     // No purchases, safe to hard delete
//     await Prompt.deleteOne({ _id: promptId });
//     return res.json({ success: true, message: "Prompt deleted successfully (no buyers)" });

//   } catch (err) {
//     console.error("delete prompt error:", err);
//     return res.status(500).json({ success: false, error: "server_error" });
//   }
// });


// module.exports = router;


// routes/promptRoutes.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Prompt = require("../models/Prompt");
const Purchase = require("../models/Purchase");
const User = require("../models/User");
const uploadToAzure = require("../utils/uploadToAzure");
const Category = require("../models/Category");
const BankAccount = require("../models/BankAccount");
const { requireAuth, blockIfSuspended } = require("../utils/auth");
const { logActivity } = require("../utils/activityLogger");
const { runPromptMediaValidation } = require("../utils/promptMediaValidation");
const crypto = require("crypto");
const sharp = require("sharp");

function makePromptHash(text) {
  return crypto.createHash("sha256").update(text || "", "utf8").digest("hex");
}

async function watermarkImage(buffer) {
  const meta = await sharp(buffer).metadata();
  const w = meta.width || 800;
  const fontSize = Math.max(20, Math.floor(w / 18));

  const wm = Buffer.from(
    `<svg width="${w}" height="${fontSize + 20}">
      <text x="12" y="${fontSize}" font-size="${fontSize}"
            fill="rgba(255,255,255,0.45)" font-family="Arial" font-weight="bold">
        Tokun.world
      </text>
    </svg>`
  );

  return sharp(buffer)
    .composite([{ input: wm, gravity: "southeast" }])
    .toBuffer();
}

// --- Multer setup (memory storage → Azure) ---
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

/* =====================================================================
   POST / — create prompt
   ===================================================================== */
router.post(
  "/",
  requireAuth,
  blockIfSuspended,
  upload.fields([
    { name: "attachment", maxCount: 1 },
    { name: "uploadCode", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        promptText,
        free,
        price,
        tags,
        categories,
        exclusive,
      } = req.body;

      if (!title || !promptText) {
        return res.status(400).json({
          success: false,
          error: "title_and_promptText_required",
        });
      }

      if (free === "false" && (!price || Number(price) <= 0)) {
        return res.status(400).json({
          success: false,
          error: "price_required_for_paid_prompt",
        });
      }

      if (!req.files?.attachment?.length) {
        return res.status(400).json({
          success: false,
          error: "attachment_required",
        });
      }

      /* ================= MAIN ATTACHMENT ================= */
      const file = req.files.attachment[0];

      const fileType = file.mimetype.startsWith("image/")
        ? "image"
        : file.mimetype.startsWith("video/")
        ? "video"
        : null;

      if (!fileType) {
        return res.status(400).json({
          success: false,
          error: "only_image_or_video_allowed",
        });
      }

      // Duplicate check — same prompt text OR same attachment file (by
      // content hash) already listed by ANY seller. Checked before
      // watermarking/uploading to Azure so a rejected upload doesn't waste
      // that work. Hash the raw original buffer (not the watermarked
      // output), since two uploads of the same source file should always
      // match regardless of watermark processing.
      const promptHash = makePromptHash(promptText);
      const attachmentHash = crypto.createHash("sha256").update(file.buffer).digest("hex");

      const duplicate = await Prompt.findOne({
        $or: [{ promptHash }, { attachmentHash }],
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: "duplicate_content",
          message:
            duplicate.promptHash === promptHash
              ? "This exact prompt text has already been listed on the marketplace."
              : "This exact image/video has already been listed on the marketplace.",
        });
      }

      // Image → tokun.world text watermark
      // Video → TOKUN.AI intro clip aage jodo (Netflix style)
      let bufferToUpload = file.buffer;

      if (fileType === "image") {
        try {
          bufferToUpload = await watermarkImage(file.buffer);
        } catch (e) {
          console.error("watermark failed, original upload:", e.message);
          bufferToUpload = file.buffer;
        }
      } else if (fileType === "video") {
        bufferToUpload = file.buffer;
      }

      // Video output hamesha mp4 hota hai — blob ka naam/mimetype usी hisaab se
      const uploadName =
        fileType === "video"
          ? file.originalname.replace(/\.[^.]+$/, "") + ".mp4"
          : file.originalname;

      const attachmentUrl = await uploadToAzure(
        bufferToUpload,
        uploadName,
        "prompt-attachments"
      );

      const attachment = {
        filename: uploadName,
        path: attachmentUrl,
        mimetype: fileType === "video" ? "video/mp4" : file.mimetype,
        size: bufferToUpload.length,
        type: fileType,
      };

      /* ================= UPLOAD CODE (OPTIONAL) ================= */
      let uploadCode = [];

      if (req.files.uploadCode?.length) {
        for (const f of req.files.uploadCode) {
          const codeUrl = await uploadToAzure(
            f.buffer,
            f.originalname,
            "prompt-code"
          );

          uploadCode.push({
            filename: f.originalname,
            path: codeUrl,
            mimetype: f.mimetype,
            size: f.size,
            type: "other",
          });
        }
      }

      /* ================= CATEGORIES ================= */
      let categoryIds = [];
      if (categories) {
        const names = categories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);

        const found = await Category.find({
          $or: names.map((n) => ({
            name: { $regex: `^${n}$`, $options: "i" },
          })),
        });

        if (found.length !== names.length) {
          return res.status(400).json({
            success: false,
            error: "invalid_categories",
          });
        }

        categoryIds = found.map((c) => c._id);
      }

      /* ================= SAVE PROMPT ================= */
      const prompt = await Prompt.create({
        userId: req.user._id,
        title,
        description,
        promptText,
        free: free === "true",
        price: free === "false" ? Number(price) : 0,
        tags: tags ? tags.split(",") : [],
        exclusive: exclusive === "true",
        categories: categoryIds,
        attachment,
        uploadCode,
        promptHash,
        attachmentHash,
        // New uploads only stay hidden from the marketplace until the
        // seller's Route Linked Account is verified — older prompts (this
        // flag defaults false) are grandfathered in and unaffected.
        requiresSellerVerification: true,
        // mediaValidation.status starts "pending" (schema default) — also
        // gates marketplace visibility until the async check below resolves
        // it to approved/pending_review/flagged.
      });

      // Fire-and-forget — GPT-4o Vision + embeddings calls (and, for video,
      // an ffmpeg frame-extraction pass) take too long to hold the seller's
      // upload response open for. The prompt is already saved with
      // mediaValidation.status "pending"; this updates it in place once done.
      runPromptMediaValidation(prompt._id).catch((err) =>
        console.error("Prompt media validation kickoff failed:", prompt._id.toString(), err.message)
      );

      await logActivity({
        type: "PRODUCT_APPROVED",
        title: "New product listed",
        description: `${req.user.name} uploaded "${prompt.title}"`,
        actorId: req.user._id,
        actorName: req.user.name,
        targetId: prompt._id,
        targetType: "Prompt",
        targetName: prompt.title,
        meta: {
          category: prompt.categories?.[0] || null,
          price: prompt.price,
          free: prompt.free,
        },
      });

      res.json({ success: true, prompt });
    } catch (err) {
      console.error("CREATE PROMPT ERROR:", err);
      res.status(500).json({
        success: false,
        error: "server_error",
      });
    }
  }
);

/* =====================================================================
   PUT /:id/resubmit — seller fixes a prompt after admin requested an edit.
   Only usable while mediaValidation.status === "edit_requested" — this is
   NOT a general-purpose "edit any prompt anytime" endpoint. Accepts a new
   title/description/promptText and/or a replacement attachment; re-runs
   the media-match validation pipeline from scratch on whatever changed.
   ===================================================================== */
router.put(
  "/:id/resubmit",
  requireAuth,
  blockIfSuspended,
  upload.fields([{ name: "attachment", maxCount: 1 }]),
  async (req, res) => {
    try {
      const prompt = await Prompt.findOne({ _id: req.params.id, userId: req.user._id });

      if (!prompt) {
        return res.status(404).json({ success: false, error: "prompt_not_found_or_access_denied" });
      }

      if (prompt.mediaValidation?.status !== "edit_requested") {
        return res.status(403).json({
          success: false,
          error: "not_editable",
          message: "This prompt isn't open for editing — it's only editable after an admin specifically requests changes.",
        });
      }

      const { title, description, promptText } = req.body;

      if (title !== undefined) prompt.title = title;
      if (description !== undefined) prompt.description = description;

      let newPromptHash = prompt.promptHash;
      if (promptText !== undefined && promptText !== prompt.promptText) {
        prompt.promptText = promptText;
        newPromptHash = makePromptHash(promptText);
      }

      let newAttachmentHash = prompt.attachmentHash;
      const file = req.files?.attachment?.[0];

      if (file) {
        const fileType = file.mimetype.startsWith("image/")
          ? "image"
          : file.mimetype.startsWith("video/")
          ? "video"
          : null;

        if (!fileType) {
          return res.status(400).json({ success: false, error: "only_image_or_video_allowed" });
        }

        newAttachmentHash = crypto.createHash("sha256").update(file.buffer).digest("hex");
      }

      // Duplicate check against every OTHER prompt (not this one) — same
      // rule as creation: no two prompts share text or media, marketplace-wide.
      const duplicate = await Prompt.findOne({
        _id: { $ne: prompt._id },
        $or: [{ promptHash: newPromptHash }, { attachmentHash: newAttachmentHash }],
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: "duplicate_content",
          message:
            duplicate.promptHash === newPromptHash
              ? "This exact prompt text has already been listed on the marketplace."
              : "This exact image/video has already been listed on the marketplace.",
        });
      }

      prompt.promptHash = newPromptHash;

      if (file) {
        const fileType = file.mimetype.startsWith("video/") ? "video" : "image";
        let bufferToUpload = file.buffer;

        if (fileType === "image") {
          try {
            bufferToUpload = await watermarkImage(file.buffer);
          } catch (e) {
            console.error("watermark failed, original upload:", e.message);
            bufferToUpload = file.buffer;
          }
        }

        const uploadName =
          fileType === "video" ? file.originalname.replace(/\.[^.]+$/, "") + ".mp4" : file.originalname;

        const attachmentUrl = await uploadToAzure(bufferToUpload, uploadName, "prompt-attachments");

        prompt.attachment = {
          filename: uploadName,
          path: attachmentUrl,
          mimetype: fileType === "video" ? "video/mp4" : file.mimetype,
          size: bufferToUpload.length,
          type: fileType,
        };
        prompt.attachmentHash = newAttachmentHash;
      }

      // Back to square one — a full fresh validation pass on whatever changed.
      // adminAction is left as-is (historical record of what was asked for).
      prompt.mediaValidation.status = "pending";
      prompt.mediaValidation.score = null;
      prompt.mediaValidation.aiDescription = "";
      prompt.mediaValidation.checkedAt = null;
      prompt.mediaValidation.error = null;

      await prompt.save();

      runPromptMediaValidation(prompt._id).catch((err) =>
        console.error("Resubmit media validation kickoff failed:", prompt._id.toString(), err.message)
      );

      return res.json({ success: true, prompt });
    } catch (err) {
      console.error("RESUBMIT PROMPT ERROR:", err);
      return res.status(500).json({ success: false, error: "server_error" });
    }
  }
);

/* =====================================================================
   GET /my — own prompts  (?type=image&category=coding)
   ===================================================================== */
router.get("/my", requireAuth, async (req, res) => {
  try {
    const { type, category } = req.query;

    let filter = { userId: req.user._id }; // own prompts

    // Filter by attachment type
    if (type === "image" || type === "video") {
      filter["attachment.type"] = type;
    }

    // Filter by category (optional)
    if (category) {
      const cat = await Category.findOne({
        name: { $regex: `^${category}$`, $options: "i" },
      });
      if (!cat) {
        return res
          .status(400)
          .json({ success: false, error: "invalid_category" });
      }
      filter.categories = cat._id;
    }

    const prompts = await Prompt.find(filter)
      .populate("categories", "name")
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      user: { name: req.user.name, avatarUrl: req.user.avatarUrl },
      prompts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

/* =====================================================================
   GET /user/:userId — prompts by a specific user (PUBLIC PROFILE)
   ===================================================================== */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [profileUser, prompts] = await Promise.all([
      // Looked up directly (not derived from prompts[0]) so a creator with
      // zero uploads still shows their name/avatar on their profile page.
      User.findById(userId).select("name avatarUrl").lean(),
      Prompt.find({
        userId,
        deleted: { $ne: true },
        flagged: { $ne: true },
      })
        .populate("categories", "name")
        .populate("userId", "name") // REQUIRED for uploader info
        .sort({ createdAt: -1 }),
    ]);

    return res.json({
      success: true,
      user: profileUser,
      prompts,
    });
  } catch (err) {
    console.error("GET /user/:userId error:", err);
    return res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

/* =====================================================================
   GET /others — marketplace feed  (?type=video&category=UI/UX)
   ===================================================================== */
router.get("/others", async (req, res) => {
  try {
    const { type, category } = req.query;

    // ✅ Base filter — show only active public prompts
    // flagged:true = confirmed policy violation via a user report (see
    // POST /api/prompt-reports/:id/flag) — hidden immediately, distinct from
    // deleted (suspend/seller-delete) so admins can still see it was flagged
    // vs fully removed.
    let filter = { deleted: { $ne: true }, flagged: { $ne: true } };

    // If logged in (token optional), exclude user's own prompts
    if (req.user && req.user._id) {
      filter.userId = { $ne: req.user._id };
    }

    // Filter by attachment type
    if (type === "image" || type === "video") {
      filter["attachment.type"] = type;
    }

    // Filter by category (optional)
    if (category) {
      const cat = await Category.findOne({
        name: { $regex: `^${category}$`, $options: "i" },
      });
      if (!cat) {
        return res
          .status(400)
          .json({ success: false, error: "invalid_category" });
      }
      filter.categories = cat._id;
    }

    // Prompts uploaded after the Route-onboarding-first flow shipped
    // (requiresSellerVerification: true) only show once their seller's
    // Linked Account is actually verified by Razorpay. Older prompts
    // (flag defaults false) are unaffected.
    const verifiedSellerIds = await BankAccount.find({
      activationStatus: "ACTIVATED",
    }).distinct("userId");

    // Sellers an admin has suspended or soft-deleted must disappear from the
    // marketplace immediately — their listings stay in the DB (buyers who
    // already purchased keep access) but should no longer be discoverable.
    const suspendedSellerIds = await User.find({
      $or: [{ sellerStatus: "SUSPENDED" }, { isDeleted: true }],
    }).distinct("_id");
    if (suspendedSellerIds.length) {
      filter.userId = filter.userId
        ? { ...filter.userId, $nin: suspendedSellerIds }
        : { $nin: suspendedSellerIds };
    }

    // Two independent gates, both must pass — seller payout verification
    // (above) and, separately, the Prompt-Media Match Validation result.
    // Old prompts (no mediaValidation.status persisted at all, pre-dating
    // this feature) are grandfathered in, same pattern as
    // requiresSellerVerification above.
    filter.$and = [
      {
        $or: [
          { requiresSellerVerification: { $ne: true } },
          { userId: { $in: verifiedSellerIds } },
        ],
      },
      {
        $or: [
          { "mediaValidation.status": { $exists: false } },
          { "mediaValidation.status": { $in: ["approved", "admin_approved"] } },
        ],
      },
    ];

    const prompts = await Prompt.find(filter)
      .populate("categories", "name")
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, prompts });
  } catch (err) {
    console.error("GET /others error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

/* =====================================================================
   POST /:id/rate — rate a prompt
   ===================================================================== */
router.post("/:id/rate", requireAuth, async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, error: "rating_must_be_1_to_5" });
    }

    const prompt = await Prompt.findById(req.params.id);
    if (!prompt)
      return res
        .status(404)
        .json({ success: false, error: "prompt_not_found" });

    // Check if user already rated
    const existing = prompt.ratings.find((r) => r.userId.equals(req.user._id));
    if (existing) {
      existing.rating = rating; // update rating
    } else {
      prompt.ratings.push({ userId: req.user._id, rating });
    }

    await prompt.save();
    res.json({
      success: true,
      averageRating: prompt.averageRating,
      ratings: prompt.ratings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

/* =====================================================================
   GET /by-seller/:sellerId
   ===================================================================== */
router.get("/by-seller/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid sellerId" });
    }

    const seller = await User.findById(sellerId).select("sellerStatus isDeleted");
    if (!seller || seller.isDeleted || seller.sellerStatus === "SUSPENDED") {
      return res.json({ success: true, prompts: [], sellerSuspended: true });
    }

    const prompts = await Prompt.find({ userId: sellerId })
      .populate(
        "userId",
        "name email avatarUrl location sellerStatus isVerified"
      )
      .populate("categories", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, prompts });
  } catch (err) {
    console.error("GET /api/prompt/by-seller/:sellerId error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/* =====================================================================
   DELETE /:id — delete own prompt (soft delete if purchased)
   ===================================================================== */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const promptId = req.params.id;

    // Find prompt and make sure user owns it
    const prompt = await Prompt.findOne({
      _id: promptId,
      userId: req.user._id,
    });
    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: "prompt_not_found_or_access_denied",
      });
    }

    // Check if any purchases exist
    const purchased = await Purchase.findOne({ prompt: promptId });
    if (purchased) {
      // Soft delete if purchased by someone
      prompt.deleted = true;
      prompt.deletedAt = new Date();
      await prompt.save();
      return res.json({
        success: true,
        message: "Prompt soft-deleted (buyers still have access)",
      });
    }

    // No purchases, safe to hard delete
    await Prompt.deleteOne({ _id: promptId });
    return res.json({
      success: true,
      message: "Prompt deleted successfully (no buyers)",
    });
  } catch (err) {
    console.error("delete prompt error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;