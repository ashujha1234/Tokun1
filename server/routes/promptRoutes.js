// routes/promptRoutes.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Prompt=require("../models/Prompt");
const Purchase=require("../models/Purchase");
const uploadToAzure = require("../utils/uploadToAzure");
const Category=require("../models/Category");
const {requireKycVerified} = require("../middleware/requireKycVerified")
const { requireAuth }  = require("../utils/auth");
const { logActivity } = require("../utils/activityLogger");





// --- Multer setup (local disk) ---
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "../uploads")); // make sure /uploads exists
//   },
//   filename: function (req, file, cb) {
//     const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, unique + "-" + file.originalname);
//   },
// });
// const upload = multer({ storage });




const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});










 // POST create prompt
// Use upload.fields() to accept multiple fields
// router.post(
//   "/",
//   requireAuth,
//   upload.fields([
//     { name: "attachment", maxCount: 1 }, // main attachment
//     { name: "uploadCode", maxCount: 10 }, // additional code uploads
//   ]),
//   async (req, res) => {
//     try {
//       const { title, description, promptText, free, price, tags, categories ,exclusive} = req.body;

//       if (!title || !promptText) {
//         return res.status(400).json({ success: false, error: "title_and_promptText_required" });
//       }

//       if (free === "false" && (!price || Number(price) <= 0)) {
//         return res.status(400).json({ success: false, error: "price_required_for_paid_prompt" });
//       }

//       if (!req.files || !req.files.attachment || req.files.attachment.length === 0) {
//         return res.status(400).json({ success: false, error: "attachment_required" });
//       }

//       // Handle main attachment
//       const file = req.files.attachment[0];
//       const fileType = file.mimetype.startsWith("image/")
//         ? "image"
//         : file.mimetype.startsWith("video/")
//         ? "video"
//         : null;

//       if (!fileType) {
//         return res.status(400).json({ success: false, error: "only_image_or_video_allowed" });
//       }

//       const attachment = {
//         filename: file.originalname,
//         path: "/uploads/" + file.filename,
//         mimetype: file.mimetype,
//         size: file.size,
//         type: fileType,
//       };

//       // Handle uploadCode files (optional)
//       let uploadCode = [];
//       if (req.files.uploadCode && req.files.uploadCode.length > 0) {
//         uploadCode = req.files.uploadCode.map((f) => ({
//           filename: f.originalname,
//           path: "/uploads/" + f.filename,
//           mimetype: f.mimetype,
//           size: f.size,
//           type: "other",
//         }));
//       }

//       // Handle categories (case-insensitive)
//       let categoryIds = [];
//       if (categories) {
//         const categoryNames = categories.split(",").map((c) => c.trim()).filter(Boolean);
//         const foundCategories = await Category.find({
//           $or: categoryNames.map((name) => ({ name: { $regex: `^${name}$`, $options: "i" } })),
//         });

//         if (foundCategories.length !== categoryNames.length) {
//           const foundNames = foundCategories.map((c) => c.name.toLowerCase());
//           const invalidNames = categoryNames.filter((c) => !foundNames.includes(c.toLowerCase()));
//           return res.status(400).json({ success: false, error: "invalid_categories", invalid: invalidNames });
//         }

//         categoryIds = foundCategories.map((c) => c._id);
//       }

//       const prompt = await Prompt.create({
//         userId: req.user._id,
//         title,
//         description,
//         promptText,
//         free: free === "true" || free === true,
//         price: free === "false" ? Number(price) : 0,
//         tags: tags ? tags.split(",").map((t) => t.trim()) : [],
//         exclusive: exclusive === "true" || exclusive === true, // ✅ new
//         categories: categoryIds,
//         attachment,
//         uploadCode, // <-- save the code uploads here
//       });

//       // prompt.tokun_price is already set automatically
//       res.json({ success: true, prompt });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ success: false, error: "server_error" });
//     }
//   }
// );


router.post(
  "/",
  requireAuth,
  requireKycVerified,
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

      const attachmentUrl = await uploadToAzure(
        file.buffer,
        file.originalname,
        "prompt-attachments"
      );

      const attachment = {
        filename: file.originalname,
        path: attachmentUrl,
        mimetype: file.mimetype,
        size: file.size,
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
      });

      // ✅ YE ADD KARO YAHAN
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



// GET /prompts/my?type=image&category=coding
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
      // Find category id (case-insensitive)
      const cat = await Category.findOne({ name: { $regex: `^${category}$`, $options: "i" } });
      if (!cat) {
        return res.status(400).json({ success: false, error: "invalid_category" });
      }
      filter.categories = cat._id;
    }

    // const prompts = await Prompt.find(filter)
    //   .populate("categories", "name")
    //   .sort({ createdAt: -1 });


const prompts = await Prompt.find(filter)
  .populate("categories", "name")
  .populate("userId", "name")   // ✔ FIXED
  .sort({ createdAt: -1 });



    res.json({ success: true, prompts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// // GET /prompts/others?type=video&category=UI/UX
// router.get("/others", requireAuth, async (req, res) => {
//   try {
//     const { type, category } = req.query;

//     let filter = { userId: { $ne: req.user._id } }; // exclude own prompts

//     // Filter by attachment type
//     if (type === "image" || type === "video") {
//       filter["attachment.type"] = type;
//     }

//     // Filter by category (optional)
//     if (category) {
//       const cat = await Category.findOne({ name: { $regex: `^${category}$`, $options: "i" } });
//       if (!cat) {
//         return res.status(400).json({ success: false, error: "invalid_category" });
//       }
//       filter.categories = cat._id;
//     }

//     const prompts = await Prompt.find(filter)
//       .populate("categories", "name")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, prompts });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });
// ✅ GET prompts uploaded by a specific user (PUBLIC PROFILE)
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const prompts = await Prompt.find({
      userId,
      deleted: { $ne: true },
      
    })
      .populate("categories", "name")
      .populate("userId", "name") // REQUIRED for uploader info
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      user: prompts[0]?.userId || null,
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




// GET /prompts/others?type=video&category=UI/UX
router.get("/others", async (req, res) => {
  try {
    const { type, category } = req.query;

    // ✅ Base filter — show only active public prompts
    let filter = { deleted: { $ne: true } };

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

 const prompts = await Prompt.find(filter)
  .populate("categories", "name")
  .populate("userId", "name")   // ✔ FIXED
  .sort({ createdAt: -1 });


    res.json({ success: true, prompts });
  } catch (err) {
    console.error("GET /others error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});


// GET /prompts/others?type=video&category=UI/UX
// router.get("/others", requireAuth, async (req, res) => {
//   try {
//     const { type, category } = req.query;

//     let filter = { deleted: { $ne: true } };

//     if (req.user && req.user._id) {
//       filter.userId = { $ne: req.user._id };
//     }

//     if (type === "image" || type === "video") {
//       filter["attachment.type"] = type;
//     }

//     if (category) {
//       const cat = await Category.findOne({
//         name: { $regex: `^${category}$`, $options: "i" },
//       });
//       if (!cat) {
//         return res.status(400).json({
//           success: false,
//           error: "invalid_category",
//         });
//       }
//       filter.categories = cat._id;
//     }

//     const prompts = await Prompt.find(filter)
//       .populate("categories", "name")
//       .populate("userId", "name avatarUrl")   // ⭐ MISSING earlier — REQUIRED
//       .sort({ createdAt: -1 });

//     res.json({ success: true, prompts });
//   } catch (err) {
//     console.error("GET /others error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });






// POST /prompt/:id/rate
router.post("/:id/rate", requireAuth, async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: "rating_must_be_1_to_5" });
    }

    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return res.status(404).json({ success: false, error: "prompt_not_found" });

    // Check if user already rated
    const existing = prompt.ratings.find(r => r.userId.equals(req.user._id));
    if (existing) {
      existing.rating = rating; // update rating
    } else {
      prompt.ratings.push({ userId: req.user._id, rating });
    }

    await prompt.save();
    res.json({ success: true, averageRating: prompt.averageRating, ratings: prompt.ratings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});


// GET /api/prompt/by-seller/:sellerId
router.get("/by-seller/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ success: false, error: "Invalid sellerId" });
    }

    const prompts = await Prompt.find({ userId: sellerId })
      .populate("userId", "name email avatarUrl location sellerStatus isVerified")
      .populate("categories", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, prompts });
  } catch (err) {
    console.error("GET /api/prompt/by-seller/:sellerId error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});



router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const promptId = req.params.id;

    // Find prompt and make sure user owns it
    const prompt = await Prompt.findOne({ _id: promptId, userId: req.user._id });
    if (!prompt) {
      return res.status(404).json({ success: false, error: "prompt_not_found_or_access_denied" });
    }

    // Check if any purchases exist
    const purchased = await Purchase.findOne({ prompt: promptId });
    if (purchased) {
      // Soft delete if purchased by someone
      prompt.deleted = true;
      prompt.deletedAt = new Date();
      await prompt.save();
      return res.json({ success: true, message: "Prompt soft-deleted (buyers still have access)" });
    }

    // No purchases, safe to hard delete
    await Prompt.deleteOne({ _id: promptId });
    return res.json({ success: true, message: "Prompt deleted successfully (no buyers)" });

  } catch (err) {
    console.error("delete prompt error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});


module.exports = router;
