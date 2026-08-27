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
// Sellers are told when an admin flags, suspends or restores their listing.
const Notification = require("../models/Notification");
const uploadToAzure = require("../utils/uploadToAzure");
const Category = require("../models/Category");
const BankAccount = require("../models/BankAccount");
// Both read only by GET /:id/code, to answer "did this member's ORGANIZATION buy
// it?" the same way promptCollab.js does for promptText.
const SharedPrompt = require("../models/SharedPrompt");
// Lowercase filename on disk — matters on a case-sensitive filesystem, which is
// what this runs on in production even though macOS forgives it.
const Organization = require("../models/organization");
const { requireAuth, blockIfSuspended } = require("../utils/auth");
const { logActivity } = require("../utils/activityLogger");
const { runPromptMediaValidation } = require("../utils/promptMediaValidation");
const {
  applyPublicPromptFilter,
  excludeSoldOut,
  PUBLIC_PROMPT_PROJECTION,
} = require("../utils/promptVisibility");
const {
  MAX_CODE_ASSETS,
  MAX_CODE_FILE_MB,
  MAX_CODE_FILE_BYTES,
  CODE_LANGUAGES,
  isAllowedCodeFile,
  languageFromFilename,
  normalizeAuthoredCodeAssets,
  buildCodeMeta,
} = require("../utils/promptCode");

/**
 * Puts `promptText` back on the free listings in a public payload, in place.
 *
 * The public reads project the prompt text away because it is the product. A
 * FREE listing is the exception and not a small one: its text is the entire
 * thing on offer, and the details panel's Copy button reads this field
 * directly, so a free prompt without it is a button that copies nothing.
 *
 * One extra query for the free ids only, and it does nothing at all when there
 * are none. Kept as a separate step so the rule is legible: paid text is never
 * read on these paths, free text is added back deliberately.
 */
async function attachFreePromptText(docs) {
  const list = Array.isArray(docs) ? docs : [docs];
  const freeIds = list.filter((d) => d && d.free).map((d) => d._id);
  if (!freeIds.length) return docs;

  const texts = await Prompt.find({ _id: { $in: freeIds } })
    .select("promptText")
    .lean();

  const byId = new Map(texts.map((t) => [String(t._id), t.promptText]));
  for (const d of list) {
    if (d && d.free) d.promptText = byId.get(String(d._id)) || "";
  }
  return docs;
}
const {
  perceptualHash,
  looksLikeDuplicate,
  hasTokunWatermark,
} = require("../utils/imageProvenance");
const crypto = require("crypto");
const sharp = require("sharp");

function makePromptHash(text) {
  return crypto.createHash("sha256").update(text || "", "utf8").digest("hex");
}

/**
 * The already-listed prompt whose image LOOKS like this one, if there is one.
 *
 * Reads every stored perceptual hash and compares in memory, because "within N
 * bits of this value" is not a question an index can answer — there is no
 * ordering of hashes in which near-duplicates are neighbours. It's one small
 * string per listing, which is nothing at this catalogue size; if the marketplace
 * grows into the hundreds of thousands this becomes a BK-tree or a bucketed
 * prefix index rather than a full scan.
 *
 * Rows with no hash — videos, and everything uploaded before this shipped — are
 * excluded by the query rather than compared, since a missing hash is "unknown",
 * not "different".
 */
async function findLookalikePrompt(phash, excludeId) {
  if (!phash) return null;

  const filter = { attachmentPhash: { $nin: ["", null] } };
  if (excludeId) filter._id = { $ne: excludeId };

  const listed = await Prompt.find(filter).select("_id title attachmentPhash").lean();
  return listed.find((p) => looksLikeDuplicate(phash, p.attachmentPhash)) || null;
}

/**
 * Every "is this actually yours?" check for an uploaded image, in one place so
 * the create and resubmit routes can't drift apart on it.
 *
 * Returns `{ phash, rejection }` — `rejection` is the response body to send back
 * with a 409, or null when the image is clear. Cheap check first: the perceptual
 * hash is milliseconds and names the listing that was copied, so OCR (seconds)
 * only runs on images that got past it.
 */
async function screenImageUpload(buffer, { excludeId } = {}) {
  const phash = await perceptualHash(buffer);

  const lookalike = await findLookalikePrompt(phash, excludeId);
  if (lookalike) {
    return {
      phash,
      rejection: {
        error: "duplicate_image",
        message: `This image is already listed on the marketplace as "${lookalike.title}". Re-uploading an existing listing — including a screenshot of one — isn't allowed.`,
      },
    };
  }

  if (await hasTokunWatermark(buffer)) {
    return {
      phash,
      rejection: {
        error: "watermarked_image",
        message:
          "This image carries the Tokun.world watermark, which means it was taken from a listing on this marketplace rather than created by you. Upload your own image instead — if you believe this is a mistake, contact support.",
      },
    };
  }

  return { phash, rejection: null };
}

/**
 * Every code attachment on one upload, from both places they arrive.
 *
 * The pasted snippets and repo links come up as one JSON text field
 * (`codeAssets`) because multipart has no way to send an array of objects; the
 * files come up as real parts under `uploadCode`, the field name the old
 * single-file version already used, so an older client still works.
 *
 * Order matters and is preserved: the seller's first item is the one the public
 * teaser gets cut from, and the one the viewer opens on. Files are appended
 * after the authored entries rather than interleaved, since multipart gives no
 * way to know where in the list a given part belonged.
 *
 * Validation happens BEFORE anything is uploaded to Azure — a rejected listing
 * must not leave blobs behind, the same rule the image screening follows.
 *
 * Returns `{ assets }`, or `{ error, message }` to be sent straight back as 400.
 */
async function collectCodeAssets(req) {
  const authored = normalizeAuthoredCodeAssets(req.body?.codeAssets);
  if (authored.error) return authored;

  const files = req.files?.uploadCode || [];

  if (authored.assets.length + files.length > MAX_CODE_ASSETS) {
    return {
      error: "too_many_code_assets",
      message: `You can attach at most ${MAX_CODE_ASSETS} code items to one product.`,
    };
  }

  /* Checked in full before the first upload starts. Rejecting on file three
     after two have already been written would leave two orphans in the
     container that nothing will ever reference or clean up. */
  for (const f of files) {
    if (!isAllowedCodeFile(f.originalname)) {
      return {
        error: "unsupported_code_file",
        message: `"${f.originalname}" isn't a supported code file. Attach source files, notebooks, or a .zip.`,
      };
    }
    if (f.size > MAX_CODE_FILE_BYTES) {
      return {
        error: "code_file_too_large",
        message: `"${f.originalname}" is over the ${MAX_CODE_FILE_MB}MB limit for code files.`,
      };
    }
  }

  const assets = [...authored.assets];

  for (const f of files) {
    const url = await uploadToAzure(f.buffer, f.originalname, "prompt-code");
    assets.push({
      kind: "file",
      language: languageFromFilename(f.originalname),
      filename: f.originalname,
      content: "",
      url,
      mimetype: f.mimetype,
      size: f.size,
    });
  }

  return { assets };
}

/* The file entries only, in the shape the pre-codeAssets `uploadCode` array
   used. Written alongside codeAssets so the purchase snapshot
   (purchaseRoutes.js) and the collab routes keep seeing exactly what they always
   saw; nothing that reads uploadCode had to change. */
const toLegacyUploadCode = (assets) =>
  assets
    .filter((a) => a.kind === "file")
    .map((a) => ({
      filename: a.filename,
      path: a.url,
      mimetype: a.mimetype,
      size: a.size,
      type: "other",
    }));

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

/* Category names are dropped into a regex to match them case-insensitively, and
   several contain characters a regex reads as syntax: "X (Twitter)" has a
   capturing group, "UI/UX" a slash, "Debugging & Fixes" an ampersand. Unescaped,
   "X (Twitter)" would match the text "X Twitter" and never the real name, so a
   valid pick would come back as invalid_categories. */
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// --- Multer setup (memory storage → Azure) ---
// Must match MAX_ATTACHMENT_MB in frontend/src/components/SellPromptModal.tsx.
// Note this is memoryStorage: an upload is held in the process's RAM in full
// before it goes to Azure, so this ceiling is also the per-request memory cost.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
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
        subCategories,
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

      /* The byte hash above only catches the same FILE. Screenshot a listing off
         the marketplace and every byte is different — new dimensions, re-encoded
         by the OS — so it passed straight through, watermark and all, and went
         up as an original.

         This asks the two questions that actually matter: does it look like
         something already listed, and is our own watermark still visible in it.
         Both run BEFORE the Azure upload, same as the hash check, so a rejected
         upload doesn't leave a file behind. */
      let attachmentPhash = "";

      if (fileType === "image") {
        const screened = await screenImageUpload(file.buffer);
        if (screened.rejection) {
          return res.status(409).json({ success: false, ...screened.rejection });
        }
        attachmentPhash = screened.phash || "";
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

      /* ================= CODE (OPTIONAL) ================= */
      const collected = await collectCodeAssets(req);
      if (collected.error) {
        return res.status(400).json({ success: false, ...collected });
      }

      const codeAssets = collected.assets;
      const codeMeta = buildCodeMeta(codeAssets);
      const uploadCode = toLegacyUploadCode(codeAssets);

      /* ================= CATEGORIES ================= */
      /* Scoped to the top level of the PROMPT tree.
         This match was unscoped — any row whose name matched, in either tree, at
         either level. That was survivable while the prompt tree was flat and the
         service tree had different names, but "Business" exists in both trees,
         so a single name could return two rows and fail the length check below,
         rejecting a perfectly valid upload. With 117 prompt sub-categories now
         in the same collection, an unscoped match would also let a child be
         saved as if it were a top-level category. */
      let categoryIds = [];
      if (categories) {
        const names = categories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);

        const found = await Category.find({
          kind: "prompt",
          parent: null,
          $or: names.map((n) => ({
            name: { $regex: `^${escapeRegex(n)}$`, $options: "i" },
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

      /* ================= SUB-CATEGORIES ================= */
      /* Must be children of the categories chosen above — that `parent: $in`
         is what stops "Coding / Nutrition" being saved, which the form can't
         produce but a direct API call can. Silently ignored rather than
         rejected when no category was chosen, since there is then nothing for a
         child to belong to. */
      let subCategoryIds = [];
      if (subCategories && categoryIds.length) {
        const subNames = String(subCategories)
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);

        if (subNames.length) {
          const foundSubs = await Category.find({
            kind: "prompt",
            parent: { $in: categoryIds },
            $or: subNames.map((n) => ({
              name: { $regex: `^${escapeRegex(n)}$`, $options: "i" },
            })),
          });

          if (foundSubs.length !== subNames.length) {
            return res.status(400).json({
              success: false,
              error: "invalid_subcategories",
            });
          }

          subCategoryIds = foundSubs.map((c) => c._id);
        }
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
        subCategories: subCategoryIds,
        attachment,
        uploadCode,
        codeAssets,
        codeMeta,
        promptHash,
        attachmentHash,
        attachmentPhash,
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
          message: "This product isn't open for editing — it's only editable after an admin specifically requests changes.",
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

      /* Same screening as a fresh upload — see the note there. A resubmit is a
         replacement attachment, so it is exactly as good a way in as the create
         route, and this one is reached with an admin already asking for changes.
         excludeId so a resubmit that keeps the original image isn't rejected for
         matching itself. */
      let newAttachmentPhash = prompt.attachmentPhash;

      if (file && file.mimetype.startsWith("image/")) {
        const screened = await screenImageUpload(file.buffer, { excludeId: prompt._id });
        if (screened.rejection) {
          return res.status(409).json({ success: false, ...screened.rejection });
        }
        newAttachmentPhash = screened.phash || "";
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
        // "" on a video, which is correct — the old image's hash must not stay
        // attached to a listing whose media is now something else entirely.
        prompt.attachmentPhash = fileType === "image" ? newAttachmentPhash : "";
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

    /* Own prompts, minus the ones deleted.
       DELETE /:id below only SOFT-deletes a listing somebody has bought (buyers
       keep what they paid for), and this route didn't exclude those — so the
       seller pressed delete, the row vanished because the client dropped it from
       local state, and it was back on the next reload. From the seller's side
       that is indistinguishable from delete not working at all. */
    let filter = { userId: req.user._id, deleted: { $ne: true } };

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
      /* Same visibility rules as the marketplace feed. It checked deleted and
         flagged but not mediaValidation, so a listing the AI check had flagged
         stayed on its seller's public profile — another way to reach and buy it
         without ever passing the review queue.

         -promptText because this is the paid content, and this endpoint is
         public and unauthenticated: it was handing every visitor the full text
         of every listing on the profile they were looking at. The profile page
         already throws it away on the client for anyone but the owner (see the
         note in ProfilePage.tsx), which stopped it being displayed — not sent.
         Owners read their own uploads through GET /my, which still carries it. */
      Prompt.find(applyPublicPromptFilter({ userId }))
        .select(PUBLIC_PROMPT_PROJECTION)
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
   GET /admin/all — every listing, including the ones taken down.

   The admin Product Management page was reading /others, the public
   marketplace feed — which filters out `flagged` and `deleted` by design. So
   the moment an admin flagged or suspended a listing from a report, it
   vanished from the only screen where they could check what they'd done, and
   the "Flagged" counter there could never be anything but zero.

   This returns the whole catalogue with the moderation state attached, so the
   admin view can separate Published / Draft / Flagged / Suspended.
   ===================================================================== */
router.get("/admin/all", requireAuth, async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ success: false, error: "forbidden" });
    }

    /* description, promptText, tags and sub-categories are selected because the
       admin catalogue is a MODERATION screen: deciding whether a listing should
       stay up means reading what it actually sells, and this used to return a
       thumbnail, a title and a price. promptText is paid content and stays out
       of every public response — this route is admin-only (the isAdmin check
       above), which is the whole reason it exists separately from /others. */
    const prompts = await Prompt.find({})
      .populate("categories", "name")
      .populate("subCategories", "name")
      .populate("userId", "name email")
      .select(
        "title description promptText tags price tokun_price free attachment categories subCategories userId flagged deleted deletedAt draft exclusive sold salesCount totalRevenue createdAt mediaValidation"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, prompts });
  } catch (err) {
    console.error("GET /api/prompt/admin/all error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* =====================================================================
   PATCH /admin/:promptId/moderation   body: { action, reason }

   Flagging and suspending a listing were one-way doors: both are reachable
   from a report, neither had an inverse, so an admin who acted on a bad report
   had no way to put the listing back. This is that inverse (and the forward
   action too, so the Products page doesn't need a report to moderate).

     flag      → hidden from the marketplace, reversible
     unflag    → un-hides a flagged listing
     suspend   → taken down (also flagged, so it's distinguishable from a
                 seller deleting their own listing — see below)
     restore   → clears BOTH, listing is fully live again

   `deleted` alone is NOT an admin action: DELETE /api/prompt/:id sets it when a
   seller removes a listing that already has buyers. Admin suspension always
   sets flagged as well, and that pairing is what tells the two apart.
   ===================================================================== */
router.patch("/admin/:promptId/moderation", requireAuth, async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ success: false, error: "forbidden" });
    }

    const { promptId } = req.params;
    const action = String(req.body?.action || "");
    const reason = String(req.body?.reason || "").trim();

    const ALLOWED = ["flag", "unflag", "suspend", "restore"];
    if (!ALLOWED.includes(action)) {
      return res.status(400).json({
        success: false,
        error: `action must be one of ${ALLOWED.join(", ")}`,
      });
    }

    // Restrictive actions are explained to the seller, same contract as an
    // account suspension. Putting something back doesn't need justifying.
    const restrictive = action === "flag" || action === "suspend";
    if (restrictive && reason.length < 5) {
      return res.status(400).json({
        success: false,
        error: "A reason of at least 5 characters is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(promptId)) {
      return res.status(400).json({ success: false, error: "invalid_prompt_id" });
    }

    const prompt = await Prompt.findById(promptId).select("title userId flagged deleted");
    if (!prompt) {
      return res.status(404).json({ success: false, error: "prompt_not_found" });
    }

    /* Refuse to "unflag" something that is suspended. Clearing flagged alone
       would leave deleted:true, so the listing would stay invisible while the
       dashboard showed it as live — restore is the action that means what the
       admin wants here. */
    if (action === "unflag" && prompt.deleted) {
      return res.status(400).json({
        success: false,
        error: "suspended_use_restore",
        message:
          "This listing is suspended, not just flagged. Use Restore to put it back on the marketplace.",
      });
    }

    const update = {
      flag: { flagged: true },
      unflag: { flagged: false },
      suspend: { flagged: true, deleted: true, deletedAt: new Date() },
      restore: { flagged: false, deleted: false, deletedAt: null },
    }[action];

    await Prompt.findByIdAndUpdate(promptId, { $set: update });

    const message = {
      flag: `Your prompt "${prompt.title}" has been flagged by an admin. Reason: ${reason} — it's hidden from the marketplace until this is resolved.`,
      unflag: `Your prompt "${prompt.title}" is no longer flagged and is back on the marketplace.${
        reason ? ` Note: ${reason}` : ""
      }`,
      suspend: `Your prompt "${prompt.title}" has been suspended by an admin. Reason: ${reason} — it's no longer listed. Buyers who already purchased it keep their access.`,
      restore: `Your prompt "${prompt.title}" has been restored and is live on the marketplace again.${
        reason ? ` Note: ${reason}` : ""
      }`,
    }[action];

    try {
      await Notification.create({
        receiverUserId: prompt.userId,
        type: "PROMPT_MEDIA_REVIEW",
        promptId: prompt._id,
        message,
        meta: {
          adminAction: action,
          reason,
          ...(restrictive
            ? { actionUrl: "/support/admin-chat", actionLabel: "Message the admin team" }
            : {}),
        },
      });
    } catch (e) {
      // Never fail the moderation because the notification didn't save.
      console.error("prompt moderation notify failed:", e?.message);
    }

    return res.json({
      success: true,
      prompt: {
        _id: String(prompt._id),
        flagged: !!update.flagged,
        deleted: !!update.deleted,
      },
    });
  } catch (err) {
    console.error("PATCH /api/prompt/admin/:promptId/moderation error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* =====================================================================
   GET /others — marketplace feed  (?type=video&category=UI/UX)
   ===================================================================== */
router.get("/others", async (req, res) => {
  try {
    const { type, category } = req.query;

    // ✅ Base filter — show only active public prompts. deleted / flagged /
    // mediaValidation are all applied together further down by
    // applyPublicPromptFilter, once this route's own conditions are in place.
    //
    // flagged:true = confirmed policy violation via a user report (see
    // POST /api/prompt-reports/:id/flag) — hidden immediately, distinct from
    // deleted (suspend/seller-delete) so admins can still see it was flagged
    // vs fully removed.
    let filter = {};

    // If logged in (token optional), exclude user's own prompts
    if (req.user && req.user._id) {
      filter.userId = { $ne: req.user._id };
    }

    // Filter by attachment type
    if (type === "image" || type === "video") {
      filter["attachment.type"] = type;
    }

    /* Filter by category (optional). Scoped to the prompt tree and escaped:
       unscoped, "Business" also matches the service tree and findOne returns
       whichever comes first; unescaped, a name like "X (Twitter)" is read as
       regex syntax and matches the wrong row. */
    if (category) {
      /* find, not findOne: a name is unique per (tree, parent), NOT per tree,
         so two parents may each own a child of the same name. findOne picked
         whichever the index returned first and quietly filtered by the wrong
         node — every prompt under the other one vanished with no error. */
      const cats = await Category.find({
        kind: "prompt",
        name: { $regex: `^${escapeRegex(category)}$`, $options: "i" },
      }).select("_id");

      if (!cats.length) {
        return res
          .status(400)
          .json({ success: false, error: "invalid_category" });
      }

      const catIds = cats.map((c) => c._id);
      /* EITHER field. A top-level pick lands in `categories`, but a
         sub-category ("Logo & Branding") is stored in `subCategories`, so
         keying only off `categories` returned nothing for every child — which
         is exactly what the brand-prompts page asks for. */
      filter.$or = [
        { categories: { $in: catIds } },
        { subCategories: { $in: catIds } },
      ];
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

    // Prompt-Media Match Validation. This one still HIDES — it's a content
    // check, and a prompt whose media doesn't match (or hasn't been checked
    // yet) must not be on the marketplace in any form. Old prompts (no
    // mediaValidation.status persisted at all, pre-dating this feature) are
    // grandfathered in.
    //
    // The rule itself now lives in utils/promptVisibility.js, because this was
    // the ONLY route that applied it — the share link, the seller profile feeds
    // and every money route each had their own shorter version, and a prompt
    // flagged here was still reachable and buyable through all of them.
    //
    // Seller payout verification is deliberately NOT a filter any more — see
    // below. It used to hide the listing outright, so a seller mid-onboarding
    // uploaded a prompt and watched it vanish with no explanation.
    applyPublicPromptFilter(filter);

    /* And nothing that is already sold out for good.

       A one-time product that has been bought can never be bought again, so it
       is not a listing any more — it is a record of a sale. Left in, these
       accumulate forever and every one of them takes a slot in a grid whose job
       is to show things that can be bought. They stay on the creator's profile,
       where a sold piece is portfolio rather than stock. */
    excludeSoldOut(filter);

    /* subCategories is populated, not just matched on. The marketplace filters
       the fetched list again on the client (its rails and search run over one
       load), and with only the parent names in the payload a card filed under
       "Design / Logo & Branding" was indistinguishable from any other Design
       card — so picking a child narrowed nothing. */
    /* The marketplace feed. Public, unauthenticated, and until now projected
       NOTHING — `Prompt.find(filter)` returns the whole document and the
       decoration below spreads it with `...p`.

       So the browse endpoint was handing out `promptText` — the product itself —
       for every paid listing on the page. The UI hides it (DetailsPrompt only
       renders it when owned), which is why it went unnoticed: it was never on
       screen, it was in the response. One look at the network tab was the whole
       catalogue. `uploadCode`, the ratings rows and the anti-duplicate hashes
       went with it.

       Same list the other three public reads use — see PUBLIC_PROMPT_PROJECTION.
       One consequence worth knowing: mapPromptDoc's `preview` fell back to the
       first 140 characters of promptText when a listing had no description, and
       that fallback is now empty. A teaser cut from paid content is a thing to
       build on purpose, server-side, not something to get by shipping all of
       it. */
    const prompts = await Prompt.find(filter)
      .select(PUBLIC_PROMPT_PROJECTION)
      .populate("categories", "name")
      .populate("subCategories", "name")
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .lean();

    /* Free listings get their text back.
       A free prompt's text is not paid content — it is the whole thing being
       given away, and the details panel's Copy button on a free listing reads
       exactly this field. Stripping it wholesale above would have left that
       button copying an empty string.

       A second query rather than keeping promptText in the projection and
       blanking it here: this way the paid text is never fetched on this path at
       all, so there is no line for someone to later delete and silently ship
       the catalogue again. */
    await attachFreePromptText(prompts);

    // Payout verification now LABELS instead of hiding: the listing shows as
    // "coming soon" and the UI locks its buy button. Nothing here weakens the
    // actual money guard — POST /api/purchase and the cart both still reject
    // these with `seller_not_verified`, so a direct link can't buy one either.
    /* Creators inside a Refer & Earn boost window. Their listings ride at the
       top for a few days — see services/referral.service.js. Held on the USER
       rather than each Prompt so anything they upload during the window is
       covered too, which is exactly when a new creator is uploading. */
    const boostedSellerIds = await User.find({
      marketplaceBoostUntil: { $gt: new Date() },
    }).distinct("_id");
    const boostedSet = new Set(boostedSellerIds.map(String));

    const verifiedSet = new Set(verifiedSellerIds.map(String));
    const decorated = prompts.map((p) => ({
      ...p,
      sellerVerificationPending:
        !!p.requiresSellerVerification &&
        !verifiedSet.has(String(p.userId?._id || p.userId)),
      boosted: boostedSet.has(String(p.userId?._id || p.userId)),
    }));

    // Buyable listings first. The sort above is newest-first and these are by
    // definition the newest uploads, so without this the top of the
    // marketplace would fill up with things nobody can actually buy.
    decorated.sort((a, b) => {
      if (a.sellerVerificationPending !== b.sellerVerificationPending) {
        return a.sellerVerificationPending ? 1 : -1;
      }
      /* Boost sits BELOW buyability and above recency: promoting a listing
         nobody can buy yet would waste the boost and annoy the buyer. Within
         the boosted group it's still newest-first, so a boosted creator with
         twenty listings doesn't own the whole first screen in a fixed order. */
      if (a.boosted !== b.boosted) return a.boosted ? -1 : 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({ success: true, prompts: decorated });
  } catch (err) {
    console.error("GET /others error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

/* =====================================================================
   GET /public/:id — one prompt, for a shared link

   Someone opening a link you sent them may not be logged in, and the prompt
   may not be in whatever filtered list the marketplace happened to load. This
   resolves it directly. It applies the same visibility rules as /others
   (deleted / flagged / failed media validation / suspended sellers stay hidden)
   and never returns promptText — that's the paid content and is served by the
   purchase flow.

   "The same rules as /others" is now literally true. It used to check only
   `deleted` and `flagged`, and skipped mediaValidation entirely — so a listing
   the AI check had flagged (score below 60) was gone from the marketplace and
   still opened, in full, for anyone the seller sent the link to. Sharing the
   link was a way around the review queue.
   ===================================================================== */
router.get("/public/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "invalid_prompt_id" });
    }

    /* excludeSoldOut too: a link to a one-time product that has been bought
       leads to a page whose only honest content is "you can't have this". The
       buyer reaches their copy through Orders / My Products, not through this
       route — this one exists to show a stranger something they might buy. */
    const prompt = await Prompt.findOne(excludeSoldOut(applyPublicPromptFilter({ _id: id })))
      .select(PUBLIC_PROMPT_PROJECTION)
      .populate("categories", "name")
      // Same shape the feed sends, so a prompt opened from a shared link
      // carries its sub-category too.
      .populate("subCategories", "name")
      .populate("userId", "name sellerStatus isDeleted");

    if (!prompt) {
      return res.status(404).json({ success: false, error: "prompt_not_found" });
    }

    const seller = prompt.userId;
    if (seller?.sellerStatus === "SUSPENDED" || seller?.isDeleted) {
      return res.status(404).json({ success: false, error: "prompt_not_found" });
    }

    // Same "coming soon" label the feed applies, so a shared link to a listing
    // whose seller is still onboarding shows the locked state rather than a
    // buy button that would fail at checkout.
    let sellerVerificationPending = false;
    if (prompt.requiresSellerVerification) {
      const activated = await BankAccount.exists({
        userId: seller?._id || prompt.userId,
        activationStatus: "ACTIVATED",
      });
      sellerVerificationPending = !activated;
    }

    // Free listings carry their text here too — a shared link to a free prompt
    // opens the same panel with the same Copy button. See attachFreePromptText.
    const payload = { ...prompt.toObject(), sellerVerificationPending };
    await attachFreePromptText(payload);

    return res.json({ success: true, prompt: payload });
  } catch (err) {
    console.error("GET /public/:id error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
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

    /* Was an unfiltered find(): it returned deleted listings, flagged ones, and
       ones the media check had rejected — the seller's whole raw catalogue —
       to any caller, on a route with no auth. With the visibility rules applied
       it answers the question the callers actually ask ("what is this seller
       selling?"), which is what the admin and buyer seller-profile panels show.

       -promptText for the same reason as /user/:userId above: the paid content
       was going out with every listing here too. */
    const prompts = await Prompt.find(applyPublicPromptFilter({ userId: sellerId }))
      .select(PUBLIC_PROMPT_PROJECTION)
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
   GET /:id/code — the code a buyer paid for

   The one door to `codeAssets`. Every public read strips that field
   (PUBLIC_PROMPT_EXCLUDED_FIELDS), so this route is where the entitlement is
   actually decided rather than in four different panels' render logic.

   FOUR WAYS TO BE ENTITLED, and no others:
     1. you uploaded it
     2. you bought it (SUCCESS, and not refunded — a refund gives the product
        back, so it takes the code back with it)
     3. it is a free listing, which gives its promptText away already; withholding
        the code half of a free product would be withholding nothing anybody paid
        for
     4. your organization bought it and shared it with you — the same rule
        promptCollab.js applies to promptText, because a team member who can read
        the prompt and not the code has half a product

   NOTE ON THE FILE URLS: the entries this returns carry Azure blob URLs, and
   that container is created with `access: "container"` (utils/uploadToAzure.js)
   — the URL *is* the credential. Gating this route stops the URLs being handed
   to strangers, which is what public reads were doing; it does not stop a buyer
   from passing one on. Closing that properly means a private container and
   short-lived SAS URLs minted here, which would also have to migrate the blobs
   already uploaded. Pasted snippets (`kind: "inline"`) have no URL and are not
   affected.
   ===================================================================== */
/**
 * Resolves whether `user` may have this listing's code, and finds their purchase.
 *
 * Shared by the two code routes below rather than inlined in the read, so the
 * "I copied it" report cannot be filed by someone who was never entitled to
 * read it in the first place — an unauthenticated ping would otherwise let
 * anybody write noise into another buyer's access record.
 *
 * Returns `{ status, prompt, purchase }`, where `status` is one of
 * "ok" | "invalid" | "not_found" | "forbidden".
 */
async function resolveCodeEntitlement(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) return { status: "invalid" };

  /* No visibility filter at all, on purpose — not even `deleted`.

     A listing that has been flagged, pulled into review or taken down is still
     one a buyer paid for, and the moment their code stops opening is the moment
     a moderation decision turns into a refund request. applyPublicPromptFilter
     answers "who may BUY this", which is a different question. A deleted listing
     is handled below by falling back to the buyer's own purchase snapshot. */
  const prompt = await Prompt.findById(id).select("userId free codeAssets deleted").lean();
  if (!prompt) return { status: "not_found" };

  const isUploader = String(prompt.userId) === String(user._id);

  /* The whole row, not just `exists`: its snapshot is the fallback source when
     the live listing has been deleted, and its _id is what the access record is
     written against. */
  const purchase = await Purchase.findOne({
    buyer: user._id,
    prompt: id,
    paymentStatus: "SUCCESS",
    refundStatus: { $ne: "REFUNDED" },
  })
    .select("promptSnapshot.codeAssets promptSnapshot.uploadCode")
    .lean();

  // A deleted listing is only reachable by someone who already owns a copy of
  // it — offering the seller's own soft-deleted product back to a stranger, or
  // even to the seller as if it were still live, is not what this is for.
  if (prompt.deleted && !purchase && !isUploader) return { status: "not_found" };

  let entitled = isUploader || prompt.free === true || !!purchase;

  // Org route, checked last because it is two extra queries and the common case
  // is answered above.
  if (!entitled && user.orgId) {
    const shared = await SharedPrompt.exists({ promptId: id, orgId: user.orgId });

    if (shared) {
      const org = await Organization.findById(user.orgId)
        .select("ownerId members.userId")
        .lean();

      const orgBuyerIds = [org?.ownerId, ...(org?.members || []).map((m) => m.userId)]
        .filter(Boolean);

      entitled = !!(await Purchase.exists({
        buyer: { $in: orgBuyerIds },
        prompt: id,
        paymentStatus: "SUCCESS",
        refundStatus: { $ne: "REFUNDED" },
      }));
    }
  }

  if (!entitled) return { status: "forbidden" };
  return { status: "ok", prompt, purchase, isUploader };
}

/**
 * Stamps a read or a take onto the buyer's purchase — see Purchase.codeAccess.
 *
 * FIRE AND FORGET, and silent on failure. This is evidence for a refund
 * decision, not part of the delivery: a buyer who has paid must get their code
 * even if the bookkeeping write fails, so nothing here is ever awaited by the
 * response path.
 *
 * Skipped entirely when there is no purchase — an uploader looking at their own
 * listing, or anyone opening a free one, has nothing to refund and so nothing
 * worth recording about them.
 */
function recordCodeAccess(purchaseId, action) {
  if (!purchaseId) return;

  const now = new Date();
  const taken = action === "copied" || action === "downloaded";
  const prefix = taken ? "Taken" : "Viewed";

  Purchase.updateOne(
    { _id: purchaseId },
    {
      // $max, not $set: "first" must survive the second visit. $set would move
      // the first-access timestamp forward on every read and destroy the one
      // number the whole record exists to provide.
      $max: { [`codeAccess.first${prefix}At`]: now },
      $set: { [`codeAccess.last${prefix}At`]: now },
      $inc: { [`codeAccess.${taken ? "take" : "view"}Count`]: 1 },
    }
  ).catch((err) => console.error("recordCodeAccess failed:", String(purchaseId), err.message));
}

router.get("/:id/code", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const gate = await resolveCodeEntitlement(id, req.user);

    if (gate.status === "invalid") {
      return res.status(400).json({ success: false, error: "invalid_prompt_id" });
    }
    if (gate.status === "not_found") {
      return res.status(404).json({ success: false, error: "prompt_not_found" });
    }
    if (gate.status === "forbidden") {
      return res.status(403).json({
        success: false,
        error: "not_purchased",
        message: "Buy this product to get its code files.",
      });
    }

    const { prompt, purchase } = gate;

    /* Live listing first, the buyer's frozen copy only when there is no live
       listing left. That order is deliberate and matches promptCollab.js: a
       seller who fixes a bug and re-saves should reach the people who already
       bought it, and the snapshot is insurance against deletion rather than a
       second, staler catalogue. */
    const codeAssets = prompt.deleted
      ? purchase?.promptSnapshot?.codeAssets || []
      : prompt.codeAssets || [];

    // Reading is inspection, and it is recorded as exactly that — see the
    // Purchase.codeAccess comment for why a read is not treated as consumption.
    recordCodeAccess(purchase?._id, "viewed");

    return res.json({ success: true, codeAssets });
  } catch (err) {
    console.error("GET /api/prompt/:id/code error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* =====================================================================
   POST /:id/code/access — "I copied it" / "I downloaded it"

   The buyer's client reports this because the server cannot observe it. A
   pasted snippet is copied out of the DOM with no request at all, and a file is
   downloaded straight from its Azure blob URL — neither passes through here, so
   the take can only be reported, never intercepted.

   WHICH MEANS IT IS DEFEATABLE, and knowingly so: a buyer who blocks this one
   request keeps the code with a clean record. It is not a lock and nothing is
   withheld on the strength of it. What it buys is the ordinary case — the vast
   majority of takes are honest button presses — and an admin timeline that
   distinguishes "downloaded, then asked for the money back four minutes later"
   from "downloaded, tried it, came back six hours later because a dependency is
   missing". The refund is still decided on the reason. This makes the reason
   checkable.
   ===================================================================== */
router.post("/:id/code/access", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const action = String(req.body?.action || "");

    if (action !== "copied" && action !== "downloaded") {
      return res.status(400).json({ success: false, error: "invalid_action" });
    }

    /* The same gate as the read. Without it, anyone with a session could stamp
       "downloaded" onto a purchase that isn't theirs — and since these numbers
       are read by an admin deciding a refund, that is a way to poison someone
       else's case. */
    const gate = await resolveCodeEntitlement(id, req.user);
    if (gate.status !== "ok") {
      return res.status(gate.status === "forbidden" ? 403 : 404).json({
        success: false,
        error: gate.status === "forbidden" ? "not_purchased" : "prompt_not_found",
      });
    }

    recordCodeAccess(gate.purchase?._id, action);

    // 202: accepted, and deliberately says nothing about whether it was written.
    // The client has no decision to make either way and must never block a copy
    // or a download on this call succeeding.
    return res.status(202).json({ success: true });
  } catch (err) {
    console.error("POST /api/prompt/:id/code/access error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* =====================================================================
   GET /code-languages — the picker's options

   Served rather than duplicated in the client so the seller can never choose a
   value normalizeLanguage() will quietly rewrite to "other". Static, public, and
   safe to cache hard.
   ===================================================================== */
router.get("/code-languages", (_req, res) => {
  res.set("Cache-Control", "public, max-age=86400");
  return res.json({ success: true, languages: CODE_LANGUAGES });
});

/* =====================================================================
   DELETE /:id — delete own prompt (soft delete if purchased)
   ===================================================================== */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const promptId = req.params.id;

    /* Checked before the query: an id that isn't an ObjectId makes findOne throw
       a CastError, which left this answering 500 "server_error" for what is
       simply a bad id — and a 500 is the one thing a client can't act on. */
    if (!mongoose.Types.ObjectId.isValid(promptId)) {
      return res.status(400).json({ success: false, error: "invalid_prompt_id" });
    }

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
        message: "Product soft-deleted (buyers still have access)",
      });
    }

    // No purchases, safe to hard delete
    await Prompt.deleteOne({ _id: promptId });
    return res.json({
      success: true,
      message: "Product deleted successfully (no buyers)",
    });
  } catch (err) {
    console.error("delete prompt error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;