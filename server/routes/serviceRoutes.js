// const express = require("express");
// const Service = require("../models/Service");
// const upload = require("../utils/serviceUpload");
// const { requireAuth } = require("../utils/auth");

// const router = express.Router();

// /* ================= CREATE SERVICE ================= */
// router.post(
//   "/create",
//   requireAuth,
//   upload.array("media", 8),
//   async (req, res) => {
//     try {
//       const {
//         title,
//         description,
//         category,
//         subCategory,
//         screens,
//         prototype,
//         fileType,
//         delivery,
//         revisions,
//         price,
//       } = req.body;

//       if (!title || !description || !category || !price) {
//         return res.status(400).json({
//           success: false,
//           error: "Missing required fields",
//         });
//       }

//       const media = req.files?.map(
//         (f) => `/uploads/services/${f.filename}`
//       ) || [];

//       const service = await Service.create({
//         userId: req.user._id,
//         title,
//         description,
//         category,
//         subCategory,
//         screens,
//         prototype,
//         fileType,
//         delivery,
//         revisions,
//         price,
//         media,
//       });

//       res.json({ success: true, service });
//     } catch (e) {
//       console.error("Create service error:", e);
//       res.status(500).json({ success: false, error: "Create failed" });
//     }
//   }
// );


// /* ================= GET USER SERVICES ================= */
// router.get("/my", requireAuth, async (req, res) => {
//   try {
//     const services = await Service.find({ userId: req.user._id })
//       .populate("category", "name")
//       .populate("subCategory", "name")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, services });
//   } catch (e) {
//     console.error("Get services error:", e);
//     res.status(500).json({ success: false });
//   }
// });


// // GET services of ANY user (public)
// router.get("/user/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ success: false });
//     }

//     const services = await Service.find({ userId })
//       .populate("category", "name")
//       .populate("subCategory", "name")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, services });
//   } catch (err) {
//     console.error("Get user services error:", err);
//     res.status(500).json({ success: false });
//   }
// });


// module.exports = router;

const express = require("express");
const mongoose = require("mongoose"); // ✅ FIX
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Service = require("../models/Service");
const ServiceOrder = require("../models/ServiceOrder");
// Used to verify a chosen sub-category actually belongs to the chosen category,
// and to build the service-detail breadcrumb.
const Category = require("../models/Category");
// Supplies the seller's professional title on the service detail page.
const FreelancerProfile = require("../models/FreelancerProfile");
const { assertSuperCreatorActive, isAllowlistedEmail } = require("../utils/superCreatorGate");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const razorpay = require("../utils/razorpay");
const upload = require("../utils/serviceUpload");
const { requireAuth, blockIfSuspended } = require("../utils/auth");
const uploadToAzure = require("../utils/uploadToAzure");
const { parseRevisionsAllowed, getRevisionState } = require("../utils/revisionPolicy");
const { checkPayoutReady, buildHeldTransfer } = require("../utils/routeEscrow");
const { transactionSplit, SERVICE_COMMISSION_PERCENT } = require("../utils/fees");
const {
  validateDeliveryText,
  escrowExpiryFrom,
  parseDeliveryDays,
  deliveryDueFrom,
  isDeliveryOverdue,
} = require("../utils/escrowWindow");
const { normalizeBriefAttachments } = require("./briefAttachments");
const { isPreviewableVideo, isSettled } = require("../utils/deliverableWatermark");
/* Everything a buyer is allowed to see before the money moves is decided in
   one place, shared with the hire and checkpoint routes. */
const { serveHeldPreview } = require("../utils/escrowPreviewGate");
const { warmVideoPreview } = require("../utils/deliverableVideoPreview");
const {
  allowedCategoryNames,
  allowedSubCategoryNames,
} = require("../config/specializationCategoryMap");
const { isVideoUpload, generateVideoPoster } = require("../utils/videoPoster");

/** Case-insensitive whole-name match, with regex metacharacters neutralised. */
const exactNameRegex = (name) =>
  new RegExp(`^${String(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
const { fetchTransferIdsByAccount } = require("../utils/routePayouts");
const {
  uploadWorkFileToAzure,
  getWorkFileDownloadUrl,
  WORK_FILE_MAX_BYTES,
  WORK_FILE_MAX_LABEL,
  isAllowedWorkFile,
  ALLOWED_WORK_EXTENSIONS,
  normalizeDeliverableLink,
} = require("../utils/serviceWorkStorage");
const { tempUploadDir } = require("../utils/privateUploadDirs");
const { generateInvoicePDF } = require("../services/invoice.service");
const { sendInvoiceEmail } = require("../services/email.service");
const {
  sendNewWorkRequestEmail,
  sendRevisionRequestedEmail,
  sendEscrowReleasedEmail,
} = require("../services/creatorEmail.service");
const { sendWorkSubmittedEmail } = require("../services/buyerEmail.service");
// Both mirror the crons that actually enforce them — staleRequestWatch.js and
// autoReleaseServiceEscrow.js. The email must never promise a different window
// from the one the job keeps.
const REQUEST_RESPONSE_DAYS = Number(process.env.REQUEST_RESPONSE_DAYS || 3);
const AUTO_RELEASE_HOURS = 72;
const {
  releaseServiceEscrowToSeller,
  ServiceEscrowAlreadyReleasedError,
} = require("../services/serviceEscrowRelease.service");
const router = express.Router();

// ─── Work file upload setup (mirrors hire.routes.js's hire-work dir) ───
/* Where PRE-AZURE deliverables still live, read-only.
   Kept only so the gated download route can still stream a record written
   before work files moved to the private container. Nothing writes here any
   more, and /uploads no longer serves it — see utils/privateUploadDirs.js. */
const legacyWorkDir = path.join(__dirname, "../uploads/service-work");

/* Where a new upload lands for the seconds between multer writing it and
   uploadWorkFileToAzure() streaming it into the private container. Outside the
   served tree: this used to be uploads/service-work, so every delivery was
   readable over plain HTTP for the length of its own upload — and for good if
   the process died in between. */
const workTempDir = tempUploadDir("service-work");

const workStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, workTempDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const base = path
      .basename(file.originalname || "work-file", ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .slice(0, 80);
    cb(null, `${Date.now()}-${base || "work-file"}${ext}`);
  },
});
// Disk, not memory: this accepts files up to WORK_FILE_MAX_BYTES and buffering
// gigabytes per concurrent upload would take the process down. The temp copy is
// streamed to Azure and unlinked by uploadWorkFileToAzure().
const uploadWorkFile = multer({
  storage: workStorage,
  limits: { fileSize: WORK_FILE_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (isAllowedWorkFile(file.originalname)) return cb(null, true);
    cb(new Error("unsupported_work_file_type"));
  },
});

/* Multer's own failures used to reach Express's default handler, which answers
   with an HTML error page — the client's `res.json()` then threw and the seller
   saw "Failed to upload" with no reason. Every rejection here comes back as
   JSON carrying advice the seller can act on. */
function handleWorkFileUpload(req, res, next) {
  uploadWorkFile.single("file")(req, res, (err) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "file_too_large",
        // The label, not a computed MB figure — "2048 MB" reads like a bug.
        message: `Each file must be under ${WORK_FILE_MAX_LABEL}. For anything bigger, share a GitHub repo or Drive link instead.`,
      });
    }
    if (String(err.message).includes("unsupported_work_file_type")) {
      return res.status(400).json({
        success: false,
        error: "unsupported_work_file_type",
        message:
          "That file type isn't accepted. Zip the folder and upload the .zip — that's also the only way to keep a code project's folder structure intact.",
      });
    }
    console.error("service work upload error:", err);
    return res.status(400).json({
      success: false,
      error: "upload_failed",
      message: "Could not read that file. Please try again.",
    });
  });
}

// ─── NDA upload setup (mirrors hire.routes.js's nda dir) ───
/* Signed NDAs. Written outside /uploads because a signed agreement between two
   parties is not public — and the UI only ever reads the STORED URL as a
   "has this side signed?" boolean, never as a link, so nothing is fetching it
   over HTTP. */
const ndaUploadDir = tempUploadDir("service-nda");
if (!fs.existsSync(ndaUploadDir)) fs.mkdirSync(ndaUploadDir, { recursive: true });

const ndaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ndaUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || ".pdf");
    cb(null, `nda-${Date.now()}${ext}`);
  },
});
const uploadNdaFile = multer({ storage: ndaStorage, limits: { fileSize: 20 * 1024 * 1024 } });

/* ================= CREATE SERVICE ================= */
/* Wraps the upload so multer's own failures come back as advice rather than
   reaching Express's default handler, which answers with HTML the client parses
   as a generic "couldn't create the service". Mirrors the intro-video route,
   which already did this. */
function handleServiceUpload(req, res, next) {
  upload.array("media", 8)(req, res, (err) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "file_too_large",
        message: "Each file must be under 50 MB.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        error: "too_many_files",
        message: "You can upload up to 8 files.",
      });
    }
    if (String(err.message).includes("Invalid file type")) {
      return res.status(400).json({
        success: false,
        error: "invalid_file_type",
        message: "Upload JPG, PNG, WEBP or GIF images, or MP4 / WEBM video.",
      });
    }

    console.error("Service upload error:", err);
    return res.status(400).json({
      success: false,
      error: "upload_failed",
      message: "Those files couldn't be uploaded. Please try again.",
    });
  });
}

router.post(
  "/create",
  requireAuth,
  blockIfSuspended,
  handleServiceUpload,
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        subCategory,
        screens,
        prototype,
        fileType,
        delivery,
        revisions,
        price,
        status,
        deliverables,
      } = req.body;

      // Every rejection below returns a `message` the seller can act on. This
      // handler used to answer a bad request with {error: "Missing required
      // fields"} and a bad value with a bare 500, so a mistyped price looked
      // identical to the server being down.
      /* A service nobody can pay for is not a listing, it's a dead end: a
         client finds it, tries to book, and only then hits the payout wall —
         with the creator having no idea their listings were unbookable. The
         same check already guards booking and payment further down this file;
         running it at creation stops the listing existing in that state at
         all. `"self"` picks the messages written for the creator rather than
         the ones written for a buyer looking at someone else's listing. */
      const payoutReady = await checkPayoutReady(req.user._id, "self");
      if (!payoutReady.ok) {
        return res.status(403).json({
          success: false,
          error: payoutReady.error,
          reason: payoutReady.reason,
          message: payoutReady.message,
        });
      }

      if (!title || !description || !category || !price) {
        return res.status(400).json({
          success: false,
          error: "missing_fields",
          message: "Title, description, category and price are all required.",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          error: "invalid_category",
          message: "Pick a category from the list.",
        });
      }

      /* No unapproved intro video, no services. Checked before anything else
         about the service is validated: the answer doesn't depend on what they
         are trying to publish, so there is no reason to make them find out
         after filling the form. */
      const gate = await assertSuperCreatorActive(req.user._id);
      if (!gate.ok) {
        return res.status(gate.status).json({
          success: false,
          error: gate.error,
          message: gate.message,
        });
      }

      /* You may only sell in categories your specializations cover.
         Enforced here as well as in the form, because a filtered dropdown is
         presentation, not a control — and the whole point is that the category
         a service appears under is one a buyer can trust. */
      const profile = await FreelancerProfile.findOne({ userId: req.user._id })
        .populate("specializations", "name group")
        .select("specializations")
        .lean();

      const allowedNames = allowedCategoryNames(profile?.specializations || []);
      if (!allowedNames.length) {
        return res.status(403).json({
          success: false,
          error: "no_specializations",
          message:
            "Add a specialization to your profile first — it decides which categories you can create services in.",
        });
      }

      const chosenCategory = await Category.findById(category).select("name parent").lean();
      // Sub-categories inherit their parent's entitlement, so the check walks
      // up to the top-level one rather than refusing anything nested.
      const topLevel = chosenCategory?.parent
        ? await Category.findById(chosenCategory.parent).select("name").lean()
        : chosenCategory;

      const isAllowed = allowedNames.some(
        (n) => n.toLowerCase() === String(topLevel?.name || "").toLowerCase()
      );
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          error: "category_not_in_specialization",
          message: `Your profile doesn't cover "${topLevel?.name || "that category"}". Add the matching specialization to your profile, then create the service.`,
          allowedCategories: allowedNames,
        });
      }

      // A promise the escrow can't back is worse than no promise: Razorpay
      // stops holding the money at 90 days, so a 90-day delivery would leave
      // the buyer zero time to even look at the work before the hold lapses.
      const deliveryCheck = validateDeliveryText(delivery);
      if (!deliveryCheck.ok) {
        return res.status(400).json({
          success: false,
          error: deliveryCheck.error,
          message: deliveryCheck.message,
        });
      }

      // FormData sends everything as a string, so "abc" would reach Mongoose and
      // throw a CastError caught as a generic 500 below.
      const numericPrice = Number(price);
      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({
          success: false,
          error: "invalid_price",
          message: "Enter a price greater than zero.",
        });
      }

      // The sub-category is optional, and an empty string is what a browser
      // sends for an untouched <select>. Passing "" straight through casts to
      // ObjectId and throws — this is the specific bug that made the field
      // unusable the moment the client started sending it.
      let subCategoryId = null;
      if (subCategory && String(subCategory).trim()) {
        if (!mongoose.Types.ObjectId.isValid(subCategory)) {
          return res.status(400).json({
            success: false,
            error: "invalid_subcategory",
            message: "Pick a sub-category from the list.",
          });
        }
        // Checked against the chosen parent so a sub-category from a different
        // category can't be attached by editing the request.
        const sub = await Category.findById(subCategory).select("parent");
        if (!sub || String(sub.parent) !== String(category)) {
          return res.status(400).json({
            success: false,
            error: "subcategory_mismatch",
            message: "That sub-category doesn't belong to the category you picked.",
          });
        }
        subCategoryId = subCategory;
      }

const media = [];
// Index-aligned with `media`: "" for images, a poster URL for videos.
const mediaPosters = [];

if (req.files?.length) {
  for (const file of req.files) {
   const azureUrl = await uploadToAzure(
  file.buffer,          // ✅ buffer
  file.originalname,    // ✅ filename
  "services"             // ✅ container
);
    media.push(azureUrl);

    /* A still for every video, so listing cards never touch the video file.
       Best-effort on purpose — if ffmpeg isn't available or the clip is
       unreadable, the poster is simply empty and the card falls back to what
       it did before. Failing the upload over a missing thumbnail would be a
       far worse trade. */
    let poster = "";
    if (isVideoUpload(file.originalname, file.mimetype)) {
      try {
        const frame = await generateVideoPoster(
          file.buffer,
          path.extname(file.originalname) || ".mp4"
        );
        if (frame) {
          poster = await uploadToAzure(
            frame,
            `${path.parse(file.originalname).name}-poster.jpg`,
            "services"
          );
        }
      } catch (posterErr) {
        console.error("Service poster upload failed:", posterErr.message);
      }
    }
    mediaPosters.push(poster);
  }
}

      // FormData can't carry an array, so the client sends JSON. Anything
      // unparseable is treated as "none given" rather than failing the whole
      // create over an optional field.
      let deliverableList = [];
      if (deliverables) {
        try {
          const parsed = typeof deliverables === "string" ? JSON.parse(deliverables) : deliverables;
          if (Array.isArray(parsed)) {
            deliverableList = parsed
              .map((d) => String(d || "").trim().slice(0, 160))
              .filter(Boolean)
              .slice(0, 8);
          }
        } catch {
          deliverableList = [];
        }
      }

      const service = await Service.create({
        userId: req.user._id,
        title,
        description,
        category,
        subCategory: subCategoryId,
        deliverables: deliverableList,
        screens,
        prototype,
        fileType,
        delivery,
        revisions,
        price: numericPrice,
        media,
        mediaPosters,
        // "Save draft" on the create form. The model has always had this field
        // and defaulted to "published"; nothing could reach the draft state
        // because the client never sent it and the button did nothing.
        status: status === "draft" ? "draft" : "published",
      });

      res.json({ success: true, service });
    } catch (e) {
      console.error("Create service error:", e);
      // A validation failure is the seller's to fix, so it says which field
      // rather than reporting a server fault.
      if (e?.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          error: "validation_failed",
          message: Object.values(e.errors || {})[0]?.message || "Some details look invalid.",
        });
      }
      res.status(500).json({
        success: false,
        error: "server_error",
        message: "Couldn't create the service. Please try again.",
      });
    }
  }
);

/* ================= GET OWN SERVICES ================= */
router.get("/my", requireAuth, async (req, res) => {
  try {
    const services = await Service.find({ userId: req.user._id })
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, services });
  } catch (e) {
    console.error("Get services error:", e);
    res.status(500).json({ success: false });
  }
});

/* ================= GET PUBLIC USER SERVICES ================= */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false });
    }

    // Published only. This is the PUBLIC read — /my is what an owner sees — and
    // it used to return drafts as well. That was harmless while nothing could
    // create one, but "Save draft" now works, so without this filter an
    // unfinished service would appear on the author's profile to everyone.
    const services = await Service.find({ userId, status: "published" })
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, services });
  } catch (err) {
    console.error("Get user services error:", err);
    res.status(500).json({ success: false });
  }
});

/* ================= BROWSE ALL SERVICES =================
   Public directory of what freelancers are selling, behind /find-creators.
   Public on purpose: browsing is how someone decides whether to sign up. */
/* ══════════════════════════════════════════════════════════════════════════
   GET /api/services/allowed-categories

   The categories the caller may list a service under, decided by the
   specializations on their freelancer profile.

   Without this a seller could publish under any category at all — someone whose
   profile says "Copywriting" could list under Programming & Tech — which makes
   the specialization field decorative and the directory's category filter
   untrustworthy. Returning the reason as well as the list lets the form say
   "add a specialization first" instead of just showing an empty dropdown.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/allowed-categories", requireAuth, async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOne({ userId: req.user._id })
      .populate("specializations", "name slug group")
      .select("specializations status")
      .lean();

    const specializations = profile?.specializations || [];
    if (!specializations.length) {
      return res.json({
        success: true,
        categories: [],
        specializations: [],
        reason: profile ? "no_specializations" : "no_freelancer_profile",
        message: profile
          ? "Add a specialization to your profile before creating a service — it decides which categories you can sell in."
          : "Set up your freelancer profile before creating a service.",
      });
    }

    const names = allowedCategoryNames(specializations);
    // Case-insensitive exact match: a category renamed only in its casing
    // shouldn't silently strip someone's entitlements.
    const categories = names.length
      ? await Category.find({
          kind: "service",
          parent: null,
          name: { $in: names.map((n) => exactNameRegex(n)) },
        })
          .select("_id name")
          .sort({ name: 1 })
          .lean()
      : [];

    /* The list the form actually shows.
       `categories` alone is too coarse to be useful: every Development
       specialization maps to "Programming & Tech", so a seller who picked seven
       of them saw one option and reasonably concluded their specializations had
       been ignored. These are the specific children those specializations
       unlock, each carrying its parent so the client can submit both ids. */
    const subNames = allowedSubCategoryNames(specializations);
    const categoryIds = categories.map((c) => c._id);

    const subCategories = subNames.length && categoryIds.length
      ? await Category.find({
          kind: "service",
          parent: { $in: categoryIds },
          name: { $in: subNames.map((n) => exactNameRegex(n)) },
        })
          .select("_id name parent")
          .sort({ name: 1 })
          .lean()
      : [];

    const byId = new Map(categories.map((c) => [String(c._id), c.name]));
    const options = subCategories.map((s) => ({
      _id: String(s._id),
      name: s.name,
      categoryId: String(s.parent),
      categoryName: byId.get(String(s.parent)) || "",
    }));

    return res.json({
      success: true,
      categories,
      /* One row per thing the seller may actually list under. Empty when a
         specialization is too new to be in the sub-category map — the client
         falls back to `categories` in that case rather than showing an
         unusable empty form. */
      options,
      specializations: specializations.map((s) => ({ name: s.name, group: s.group })),
      reason: categories.length ? null : "no_matching_categories",
    });
  } catch (err) {
    console.error("allowed-categories error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

router.get("/browse", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 60);
    const q = String(req.query.q || "").trim().slice(0, 80);
    const category = String(req.query.category || "").trim();

    const filter = { status: "published" };

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ success: false, error: "invalid_category" });
      }
      // Matches the category itself or any of its sub-categories, so picking
      // "Design" doesn't hide everything filed under "Logo Design".
      const subIds = await Category.find({ parent: category }).select("_id").lean();
      filter.$or = [
        { category },
        { subCategory: { $in: subIds.map((s) => s._id) } },
      ];
    }

    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const search = [{ title: rx }, { description: rx }];
      // Combined with $and so a category filter and a search term narrow
      // together — assigning to $or twice would silently drop the first.
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: search }];
        delete filter.$or;
      } else {
        filter.$or = search;
      }
    }

    const [rows, total] = await Promise.all([
      Service.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "name avatarUrl isVerified sellerStatus isDeleted")
        .populate("category", "name")
        .populate("subCategory", "name")
        .lean(),
      Service.countDocuments(filter),
    ]);

    const services = rows
      // A suspended or deleted seller keeps their rows but must not be offered
      // as someone to book.
      .filter((s) => s.userId && !s.userId.isDeleted && s.userId.sellerStatus !== "SUSPENDED")
      .map((s) => ({
        _id: String(s._id),
        title: s.title,
        description: s.description,
        price: s.price,
        delivery: s.delivery || "",
        revisions: s.revisions || "",
        // Only the cover — a card shows one image, and shipping every upload
        // would make the directory payload many times what it renders.
        cover: s.media?.[0] || null,
        // Set only when the cover is a video. With it the card renders a still
        // and never touches the video file; without it (listings uploaded
        // before posters existed) it falls back to loading the video.
        coverPoster: s.mediaPosters?.[0] || null,
        category: s.category ? { _id: String(s.category._id), name: s.category.name } : null,
        subCategory: s.subCategory
          ? { _id: String(s.subCategory._id), name: s.subCategory.name }
          : null,
        seller: {
          userId: String(s.userId._id),
          name: s.userId.name || "Unknown",
          avatar: s.userId.avatarUrl || null,
          verified: !!s.userId.isVerified,
        },
        createdAt: s.createdAt,
      }));

    res.json({
      success: true,
      services,
      total,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (err) {
    console.error("Browse services error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= BOOK SERVICE — CREATE ORDER + CHAT CARD ================= */
// Mirrors /api/hire/create-proposal: this only records the booking, it does
// NOT create a Razorpay order yet — that happens later when the buyer clicks
// "Pay Now" on the card inside chat (create-payment-order below).
router.post("/:serviceId/book", requireAuth, blockIfSuspended, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { note, preferredDate, conversationId, briefAttachments } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ success: false, error: "invalid_service_id" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, error: "service_not_found" });
    }

    if (String(service.userId) === String(req.user._id)) {
      return res.status(400).json({ success: false, error: "cannot_book_own_service" });
    }

    const amount = Number(service.price);
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: "invalid_service_price" });
    }

    // The seller's money is routed to their Razorpay linked account and held
    // there, so an account Razorpay hasn't ACTIVATED means we would be taking
    // the buyer's money for work we cannot pay out for. Checked here — before
    // the NDA and payment steps — so the buyer finds out now rather than after
    // signing an NDA. Re-checked at payment time, because the account can be
    // suspended in between.
    const payoutReady = await checkPayoutReady(service.userId, "buyer");
    if (!payoutReady.ok) {
      return res.status(409).json({
        success: false,
        error: payoutReady.error,
        reason: payoutReady.reason,
        message: payoutReady.message,
      });
    }

    /* Both sides, from utils/fees.js — the one place the rates live.

       Buyer:  amount + platform fee + GST on that fee
       Seller: amount − commission − GST on that commission

       Snapshotted onto the order below, so a rate change tomorrow cannot move
       the numbers on a booking that has already been agreed. */
    const split = transactionSplit(amount, SERVICE_COMMISSION_PERCENT);

    // platformFee/sellerAmount keep their existing meaning (Tokun's seller-side
    // cut, and what's left for the seller) — the escrow, payout and settlement
    // paths all read them. The GST fields are additive.
    const platformFee = split.seller.commission;
    const platformFeeGst = split.seller.commissionGst;
    const sellerAmount = split.seller.netToSeller;
    const clientFee = split.buyer.platformFee;
    const clientFeeGst = split.buyer.platformFeeGst;
    const totalPayable = split.buyer.totalPayable;

    const order = await ServiceOrder.create({
      buyerId: req.user._id,
      sellerId: service.userId,
      serviceId: service._id,
      chatId: conversationId || null,
      serviceTitle: service.title,
      serviceMedia: service.media?.[0] || null,
      amount,
      platformFee,
      platformFeeGst,
      sellerAmount,
      clientFee,
      clientFeeGst,
      totalPayable,
      currency: "INR",
      note: note || "",
      // Only blobName-bearing descriptors survive normalisation, so a client
      // can't get an arbitrary URL stored as if it were an uploaded file.
      briefAttachments: normalizeBriefAttachments(briefAttachments),
      preferredDate: preferredDate ? new Date(preferredDate) : null,
      // Snapshotted, not read live off the service, so the seller editing
      // "3 Revisions" down to "1 Revision" tomorrow can't change the terms of
      // a booking the buyer has already paid for.
      revisionsAllowed: parseRevisionsAllowed(service.revisions),
      // Snapshotted for the same reason. The due DATE isn't set here — it runs
      // from the payment, which hasn't happened yet.
      deliveryDays: parseDeliveryDays(service.delivery),
      status: "PENDING_PAYMENT",
      paymentStatus: "NOT_PAID",
    });

    const cardPayload = {
      serviceOrderId: String(order._id),
      orderId: String(order._id),
      serviceId: String(service._id),
      title: service.title,
      serviceTitle: service.title,
      amount: totalPayable,
      basePrice: amount,
      note: order.note,
      preferredDate: order.preferredDate,
      media: order.serviceMedia,
      status: "PENDING_PAYMENT",
      message: `Booking request for "${service.title}". Complete payment to confirm.`,
    };

    // Notify seller a booking request has come in
    try {
      const buyer = await mongoose.model("User").findById(req.user._id).select("name email profileImage image");
      await Notification.create({
        senderId: req.user._id,
        senderName: buyer?.name,
        senderEmail: buyer?.email,
        senderImage: buyer?.profileImage || buyer?.image,
        receiverUserId: service.userId,
        type: "SERVICE_BOOKING_REQUESTED",
        amount,
        message: `${buyer?.name || "A client"} wants to book your service "${service.title}".`,
        meta: { serviceTitle: service.title, orderId: String(order._id), amount },
      });
    } catch (notifyErr) {
      console.error("Service booking-requested notification failed:", notifyErr);
    }

    /* And by email. The booking is waiting on the CLIENT to pay, but the seller
       is the one who has to be around to deliver it — and the stale-request
       cron closes the whole thing after a few days. Better they hear about it
       when it arrives than when it dies. */
    try {
      const seller = await mongoose.model("User").findById(service.userId).select("name email").lean();
      const buyerDoc = await mongoose.model("User").findById(req.user._id).select("name").lean();
      if (seller?.email) {
        await sendNewWorkRequestEmail({
          to: seller.email,
          creatorName: seller.name,
          clientName: buyerDoc?.name,
          title: service.title,
          amount,
          kind: "booking",
          respondWithinDays: REQUEST_RESPONSE_DAYS,
        });
      }
    } catch (mailErr) {
      console.error("New booking email failed (booking still created):", mailErr.message);
    }

    return res.json({ success: true, order, cardPayload });
  } catch (err) {
    console.error("book service error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= NDA UPLOAD (both parties sign) ================= */
router.post("/orders/:orderId/upload-nda", requireAuth, uploadNdaFile.single("nda"), async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.orderId)
      .populate("buyerId", "name email profileImage image")
      .populate("sellerId", "name email profileImage image");
    if (!order) return res.status(404).json({ success: false, error: "order_not_found" });

    const userId = String(req.user._id);
    const isBuyer = String(order.buyerId._id) === userId;
    const isSeller = String(order.sellerId._id) === userId;
    if (!isBuyer && !isSeller) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }

    if (!req.file) return res.status(400).json({ success: false, error: "no_file_uploaded" });

    const fileUrl = `/uploads/service-nda/${req.file.filename}`;
    const now = new Date();

    /* The drawn signature, kept so the agreement renders signed forever.
       It used to live only in the modal's own state, so reopening the NDA
       showed a blank signature line — the uploaded copy existed as a file, but
       the document both parties actually read looked unsigned.
       Capped: this is a small canvas PNG, and anything larger is not a
       signature. */
    const signatureDataUrl = String(req.body?.signature || "");
    const validSignature =
      signatureDataUrl.startsWith("data:image/") && signatureDataUrl.length <= 200_000
        ? signatureDataUrl
        : "";

    if (isBuyer) {
      order.ndaBuyerUrl = fileUrl;
      order.ndaBuyerSignedAt = now;
      if (validSignature) order.ndaBuyerSignature = validSignature;
    } else {
      order.ndaSellerUrl = fileUrl;
      order.ndaSellerSignedAt = now;
      if (validSignature) order.ndaSellerSignature = validSignature;
    }
    await order.save();

    const bothSigned = !!(order.ndaBuyerUrl && order.ndaSellerUrl);
    const signer = isBuyer ? order.buyerId : order.sellerId;
    const otherParty = isBuyer ? order.sellerId : order.buyerId;
    const signerRoleLabel = isBuyer ? "Client" : "Creator";

    try {
      await Notification.create({
        senderId: signer._id,
        senderName: signer.name,
        senderEmail: signer.email,
        senderImage: signer.profileImage || signer.image,
        receiverUserId: otherParty._id,
        type: "SERVICE_NDA_SIGNED",
        message: bothSigned
          ? `${signer.name || signerRoleLabel} has signed the NDA. Both parties have now signed — the NDA is complete!`
          : `${signer.name || signerRoleLabel} has signed the NDA for "${order.serviceTitle}". Waiting for you to sign.`,
        meta: { serviceTitle: order.serviceTitle, signedBy: signerRoleLabel.toLowerCase(), bothSigned },
      });
      if (bothSigned) {
        await Notification.create({
          senderId: otherParty._id,
          senderName: otherParty.name,
          senderEmail: otherParty.email,
          senderImage: otherParty.profileImage || otherParty.image,
          receiverUserId: signer._id,
          type: "SERVICE_NDA_SIGNED",
          message: `Both parties have signed the NDA for "${order.serviceTitle}". The NDA is complete!`,
          meta: { serviceTitle: order.serviceTitle, bothSigned: true },
        });
      }
    } catch (notifyErr) {
      console.error("Service NDA notification failed:", notifyErr);
    }

    return res.json({ success: true, role: isBuyer ? "buyer" : "seller", url: fileUrl, bothSigned });
  } catch (err) {
    console.error("upload-nda (service) error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= BOOK SERVICE — CREATE RAZORPAY ORDER (pay-now, in chat) ================= */
router.post("/orders/:orderId/create-payment-order", requireAuth, blockIfSuspended, async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, error: "order_not_found" });
    }

    if (String(order.buyerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({ success: false, error: "already_paid" });
    }

    if (!(order.ndaBuyerUrl && order.ndaSellerUrl)) {
      return res.status(400).json({
        success: false,
        error: "NDA_NOT_SIGNED",
        message: "Please sign the NDA before making payment.",
      });
    }

    // Re-checked here even though booking already gated on it: an account can
    // be suspended between booking and payment, and this is the last moment
    // before the buyer's money is actually taken.
    const payoutReady = await checkPayoutReady(order.sellerId, "buyer");
    if (!payoutReady.ok) {
      return res.status(409).json({
        success: false,
        error: payoutReady.error,
        reason: payoutReady.reason,
        message: payoutReady.message,
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(order.totalPayable) * 100),
      currency: order.currency || "INR",
      receipt: `tokun_svc_${order._id}`,
      notes: {
        project: "Tokun",
        kind: "SERVICE_ORDER",
        orderId: String(order._id),
        serviceId: String(order.serviceId),
        buyerId: String(order.buyerId),
        sellerId: String(order.sellerId),
      },
      /* Escrow. Attached to the order so Razorpay applies it as part of the
         capture — there is no window where the money is taken but the transfer
         failed to be created.

         The FULL amount goes on hold; Tokun's commission is reversed out of it
         at release rather than never being held. See the matching note in
         routes/hire.routes.js — holding only the seller's share left a dispute
         decided in their favour unpayable. */
      transfers: [
        buildHeldTransfer({
          account: payoutReady.linkedAccountId,
          amountRupees: order.totalPayable,
          notes: {
            kind: "SERVICE_ORDER",
            orderId: String(order._id),
            serviceTitle: order.serviceTitle,
          },
        }),
      ],
    });

    order.razorpayOrderId = razorpayOrder.id;
    order.routeLinkedAccountId = payoutReady.linkedAccountId;
    order.paymentStatus = "ORDER_CREATED";
    await order.save();

    return res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order: razorpayOrder,
    });
  } catch (err) {
    console.error("create service payment order error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= BOOK SERVICE — VERIFY PAYMENT ================= */
router.post("/orders/:orderId/verify-payment", requireAuth, blockIfSuspended, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    const order = await ServiceOrder.findById(orderId)
      .populate("buyerId", "name email profileImage image")
      .populate("sellerId", "name email profileImage image");

    if (!order) {
      return res.status(404).json({ success: false, error: "order_not_found" });
    }

    if (String(order.buyerId._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({ success: false, error: "already_paid" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: "invalid_payment_signature" });
    }

    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = "PAID";
    order.fundsStatus = "HELD_BY_TOKUN";
    order.status = "FUNDED";
    order.paidAt = new Date();
    // Razorpay won't hold the transfer past this, so every decision about this
    // money has to happen before it.
    order.escrowExpiresAt = escrowExpiryFrom(order.paidAt);
    // The buyer has now paid, so the delivery promise on the listing becomes a
    // real date. Null when the listing named no number of days.
    order.deliveryDueAt = deliveryDueFrom(order.paidAt, order.deliveryDays);

    // The transfer was attached to the Razorpay order, so it exists by now —
    // but its id is only knowable by asking. Without it we'd have no handle to
    // release the escrow with later.
    //
    // Non-fatal on purpose: the payment IS captured and the money IS held by
    // Razorpay whether or not this lookup succeeds. Failing the request here
    // would tell the buyer their payment didn't work, which is false. The
    // transfer.* webhook fills the id in if this misses.
    try {
      const transfersByAccount = await fetchTransferIdsByAccount(razorpay_payment_id);
      const transferId = order.routeLinkedAccountId
        ? transfersByAccount.get(String(order.routeLinkedAccountId))
        : [...transfersByAccount.values()][0];
      if (transferId) {
        order.routeTransferId = transferId;
        order.routeTransferStatus = "on_hold";
        // What the hold carries — bookings funded before this hold sellerAmount.
        order.routeHeldAmount = order.totalPayable;
      }
    } catch (transferErr) {
      console.error("Service order transfer lookup failed:", transferErr.message);
    }

    await order.save();

    // Plain confirmation message in chat (mirrors hire.routes.js verify-payment)
    if (order.chatId) {
      try {
        await Message.create({
          conversationId: order.chatId,
          sender: order.buyerId._id,
          text: `✅ Payment done! ₹${order.totalPayable.toLocaleString("en-IN")} is safely held by Tokun Escrow. Work can begin now.`,
          readBy: [order.buyerId._id],
        });
      } catch (msgErr) {
        console.error("Service paid chat message failed:", msgErr);
      }
    }

    // Notify seller — funds are held, not yet released
    try {
      await Notification.create({
        senderId: order.buyerId._id,
        senderName: order.buyerId.name,
        senderEmail: order.buyerId.email,
        senderImage: order.buyerId.profileImage || order.buyerId.image,
        receiverUserId: order.sellerId._id,
        type: "SERVICE_ORDER_PAID",
        amount: order.amount,
        message: `${order.buyerId.name || "A client"} made the payment for "${order.serviceTitle}". ₹${order.sellerAmount} is safely held by Tokun. You can start work now.`,
        meta: {
          serviceTitle: order.serviceTitle,
          orderId: String(order._id),
          amount: order.sellerAmount,
          fundsStatus: "HELD_BY_TOKUN",
        },
      });
    } catch (notifyErr) {
      console.error("Service order notification failed:", notifyErr);
    }

    // Invoice email (non-fatal)
    try {
      const buyer = order.buyerId;
      if (buyer?.email) {
        const invoiceNo = `INV-${order._id}`;
        const date = new Date(order.paidAt || Date.now()).toLocaleDateString("en-GB");
        // GST is off, matching generateInvoicePDF and the prompt/cart flows.
        //
        // It was being ADDED on top of totalPayable — but totalPayable IS what
        // Razorpay charged, so the email body claimed a total the buyer never
        // paid (₹210 charged, ₹247.80 stated). Worse, the attached PDF had GST
        // switched off already, so the email and its own attachment disagreed
        // with each other on the same invoice.
        //
        // Re-enable only once GST registration and the inclusive/exclusive
        // treatment are settled — and change the CHARGE at the same time, not
        // just the invoice.
        const subtotal = Number(order.totalPayable);
        const gst = 0;
        const total = +subtotal.toFixed(2);
        const items = [{ title: `Service: ${order.serviceTitle}`, price: subtotal }];

        const logoPath = path.join(__dirname, "../assets/icons/Tokun.png");
        const logoBase64 = fs.existsSync(logoPath)
          ? `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`
          : "";

        const pdfBuffer = await generateInvoicePDF({
          logo: logoBase64,
          date,
          invoiceNo,
          buyerName: buyer.name || "Customer",
          buyerEmail: buyer.email || "",
          items,
          // Makes the invoice say what this payment actually is — money held in
          // escrow until the buyer approves, not a completed purchase.
          kind: "service",
        });

        await sendInvoiceEmail({
          to: buyer.email,
          buyerName: buyer.name || "Customer",
          buyerEmail: buyer.email,
          items,
          invoiceNo,
          date,
          subtotal,
          gst,
          total,
          pdfBuffer,
          kind: "service",
        });
      }
    } catch (invoiceErr) {
      console.error("⚠️ Service invoice/email failed (payment still verified):", invoiceErr.message);
    }

    return res.json({ success: true, order });
  } catch (err) {
    console.error("verify service payment error:", err);
    return res.status(500).json({ success: false, error: "server_error", message: err.message });
  }
});

/* ================= UPLOAD WORK FILE (seller, before submit) ================= */
router.post("/orders/:orderId/upload-work-file", requireAuth, handleWorkFileUpload, async (req, res) => {
  // Every early return has to remove the temp file multer already wrote, or a
  // rejected upload leaves gigabytes on disk forever.
  const cleanupTemp = () => {
    if (req.file?.path) fs.promises.unlink(req.file.path).catch(() => {});
  };

  try {
    const order = await ServiceOrder.findById(req.params.orderId);
    if (!order) {
      cleanupTemp();
      return res.status(404).json({ success: false, error: "order_not_found" });
    }

    if (String(order.sellerId) !== String(req.user._id)) {
      cleanupTemp();
      return res.status(403).json({ success: false, error: "not_authorized" });
    }

    if (!["FUNDED", "IN_PROGRESS", "REVISION_REQUESTED"].includes(order.status)) {
      cleanupTemp();
      return res.status(400).json({
        success: false,
        error: "wrong_status",
        message: `Files can't be uploaded while this booking is ${order.status}.`,
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: "no_file_uploaded" });
    }

    // Streams to a PRIVATE container and unlinks the temp copy itself. The
    // returned URL is not usable on its own — the buyer and seller both reach
    // the file through /deliverables/:index/download, which mints a SAS after
    // checking they're a party to the order.
    const { blobName, url } = await uploadWorkFileToAzure(
      req.file.path,
      req.file.originalname,
      String(order._id)
    );

    return res.json({
      success: true,
      file: {
        url,
        blobName,
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        kind: "file",
      },
    });
  } catch (err) {
    cleanupTemp();
    console.error("upload service work file error:", err);
    return res.status(500).json({
      success: false,
      error: "server_error",
      message: "Upload failed on our side. Please try that file again.",
    });
  }
});

/* Shape of a deliverable as it leaves the server.
   An uploaded file's real location (private blob URL + blobName) is dropped:
   the client asks for it by index through the gated download route, which is
   the only thing that can mint a SAS. A link keeps its URL — it's the seller's
   own public GitHub/Drive URL and there's nothing to gate. */
function toPublicDeliverable(d, index) {
  const isLink = d.kind === "link";
  return {
    index,
    kind: d.kind || "file",
    provider: d.provider || "",
    name: d.name || d.description || "Work file",
    description: d.description || d.name || "",
    size: d.size || 0,
    mimeType: d.mimeType || "",
    uploadedAt: d.uploadedAt,
    // Only ever set for links. Files carry no URL at all.
    url: isLink ? d.url : "",
  };
}

/* ================= DOWNLOAD ONE DELIVERABLE (buyer or seller) =================
   The gate that makes escrow mean something. /uploads used to be public static
   with guessable filenames, so a work file was downloadable by anyone who
   could construct the URL — before the buyer had approved, and by people who
   weren't party to the order at all. */
router.get("/orders/:orderId/deliverables/:index/download", requireAuth, async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.orderId).select(
      "buyerId sellerId deliverables fundsStatus"
    );
    if (!order) return res.status(404).json({ success: false, error: "order_not_found" });

    const isBuyer = String(order.buyerId) === String(req.user._id);
    const isSeller = String(order.sellerId) === String(req.user._id);
    if (!isBuyer && !isSeller) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }

    const index = Number(req.params.index);
    const deliverable = order.deliverables?.[index];
    if (!deliverable) {
      return res.status(404).json({ success: false, error: "deliverable_not_found" });
    }

    if (deliverable.kind === "link") {
      return res.json({ success: true, url: deliverable.url, kind: "link" });
    }

    // Pre-Azure record: the file is still on this host's disk under the URL
    // stored at the time. Resolved up here because the escrow gate below needs
    // to know where the bytes are, whichever era the record is from.
    const legacyName = path.basename(String(deliverable.url || ""));
    const legacyPath = legacyName ? path.join(legacyWorkDir, legacyName) : "";
    const legacyExists = !!legacyPath && fs.existsSync(legacyPath);

    if (!deliverable.blobName && !legacyExists) {
      return res.status(404).json({
        success: false,
        error: "file_missing",
        message: "This file is no longer available. Ask the creator to re-upload it.",
      });
    }

    /* WHILE THE MONEY IS HELD, THE BUYER GETS MARKED BYTES OR NOTHING.

       A buyer has to be able to see the work to approve it — but for creative
       work, seeing it IS most of the value, and nothing stopped someone
       previewing the final artwork and then cancelling. So:

         image  → re-encoded with the watermark composited in
         video  → a watermark-burned re-encode, prepared in the background
         other  → locked; a zip or a PSD has no protectable preview form

       All three answers, and the refusals when a mark can't be made, live in
       utils/escrowPreviewGate.js — the same decision the hire route and the
       checkpoint route make.

       The seller is never gated on their own file, and this branch is
       buyer-only, so an admin ruling on a dispute is unaffected. */
    if (isBuyer && !isSettled(order.fundsStatus)) {
      return serveHeldPreview({
        res,
        name: deliverable.name,
        mimeType: deliverable.mimeType,
        blobName: deliverable.blobName || "",
        legacyPath: deliverable.blobName ? "" : legacyPath,
        state: deliverable,
        // Records the video re-encode against THIS deliverable, so the next
        // view (and the buyer's other device) reuses it instead of re-encoding.
        persist: (patch) =>
          ServiceOrder.updateOne(
            { _id: order._id },
            {
              $set: Object.fromEntries(
                Object.entries(patch).map(([k, v]) => [`deliverables.${index}.${k}`, v])
              ),
            }
          ),
      });
    }

    // Settled, or the seller asking for their own file: the original, untouched.
    if (deliverable.blobName) {
      return res.json({
        success: true,
        kind: "file",
        name: deliverable.name,
        url: getWorkFileDownloadUrl(deliverable.blobName),
        heldInEscrow: false,
      });
    }

    // Streamed rather than redirected so it goes through the same auth check as
    // everything else, instead of handing back the public /uploads path this
    // route exists to replace.
    return res.download(legacyPath, deliverable.name || legacyName);
  } catch (err) {
    console.error("download service deliverable error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= START WORK (seller) ================= */
router.post("/orders/:orderId/start-work", requireAuth, async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.orderId)
      .populate("buyerId", "name email")
      .populate("sellerId", "name email");

    if (!order) return res.status(404).json({ success: false, error: "order_not_found" });
    if (String(order.sellerId._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }
    if (order.status !== "FUNDED") {
      return res.status(400).json({ success: false, error: `Cannot start. Status: ${order.status}` });
    }

    order.status = "IN_PROGRESS";
    order.workStartedAt = new Date();
    await order.save();

    try {
      await Notification.create({
        senderId: req.user._id,
        senderName: order.sellerId.name,
        receiverUserId: order.buyerId._id,
        type: "SERVICE_WORK_STARTED",
        message: `${order.sellerId.name || "The creator"} started working on "${order.serviceTitle}".`,
        meta: { serviceTitle: order.serviceTitle },
      });
    } catch (notifyErr) {
      console.error("Service work-started notification failed:", notifyErr);
    }

    return res.json({ success: true, message: "Work started", order });
  } catch (err) {
    console.error("start service work error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= SUBMIT WORK (seller) ================= */
router.post("/orders/:orderId/submit-work", requireAuth, async (req, res) => {
  try {
    const { deliverables, note } = req.body || {};

    const order = await ServiceOrder.findById(req.params.orderId)
      .populate("buyerId", "name email profileImage image")
      .populate("sellerId", "name email profileImage image");

    if (!order) return res.status(404).json({ success: false, error: "order_not_found" });
    if (String(order.sellerId._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }
    if (!["FUNDED", "IN_PROGRESS", "REVISION_REQUESTED"].includes(order.status)) {
      return res.status(400).json({ success: false, error: `Cannot submit. Current status: ${order.status}` });
    }

    /* The delivery date the buyer paid against has passed, so this is no longer
       a delivery the seller gets to make unilaterally — the buyer decides
       whether to cancel and take the refund or carry on. Enforced here rather
       than only in the UI, because the UI is not what holds the money.

       Deliberately covers a resubmission after a revision too: a revision does
       not extend the promise. That does mean a revision requested in the last
       hours of the window can leave the seller unable to answer it — the buyer
       can still cancel, and an admin can still settle, so the money is never
       stuck, but see the note on this in the PR/discussion if that lands badly
       in practice. */
    if (isDeliveryOverdue(order)) {
      return res.status(403).json({
        success: false,
        error: "delivery_deadline_passed",
        deliveryDueAt: order.deliveryDueAt,
        message:
          "The delivery deadline for this booking has passed, so work can no longer be submitted. Talk to the client — they can cancel for a refund, or Tokun can settle it between you.",
      });
    }

    // A delivery is either an uploaded file (already in Azure, identified by
    // blobName) or a link the seller pasted — a GitHub repo, a Drive folder, a
    // live deployment. Links are validated here rather than trusted, because
    // they end up as clickable anchors in the buyer's chat.
    const normalizedDeliverables = [];
    for (const d of Array.isArray(deliverables) ? deliverables : []) {
      if (d?.kind === "link") {
        const link = normalizeDeliverableLink(d.url, d.name);
        if (!link.ok) {
          return res.status(400).json({ success: false, error: "invalid_link", message: link.message });
        }
        normalizedDeliverables.push({
          kind: "link",
          provider: link.provider,
          url: link.url,
          name: link.label,
          description: d.description || link.label,
          size: 0,
          mimeType: "",
          blobName: "",
          uploadedAt: new Date(),
        });
        continue;
      }

      if (!d?.url) continue;
      normalizedDeliverables.push({
        kind: "file",
        provider: "",
        url: d.url,
        blobName: d.blobName || "",
        name: d.name || d.description || "Work file",
        description: d.description || d.name || "Work file",
        size: d.size || 0,
        mimeType: d.mimeType || "",
        uploadedAt: new Date(),
      });
    }

    if (!normalizedDeliverables.length && !String(note || "").trim()) {
      return res.status(400).json({
        success: false,
        error: "empty_submission",
        message: "Attach a file, add a repo/Drive link, or write a note before submitting.",
      });
    }

    order.status = "WORK_SUBMITTED";
    order.workSubmittedAt = new Date();
    order.deliverables = normalizedDeliverables;
    order.submissionNote = note || "";
    // Appended, never replaced. Overwriting `deliverables` alone used to erase
    // what was sent before a revision, so a dispute over "this isn't what you
    // delivered the first time" had no record to check.
    order.submissions = [
      ...(order.submissions || []),
      {
        version: (order.submissions?.length || 0) + 1,
        note: note || "",
        deliverables: normalizedDeliverables,
        submittedAt: new Date(),
      },
    ];
    await order.save();

    /* Start the watermarked review copy of any video NOW, not when the buyer
       first clicks Preview. An ffmpeg pass over a real edit is minutes, and
       making the buyer wait through it in front of a spinner is how a delivery
       feels broken. Fire-and-forget on purpose: the buyer's own request
       re-checks and records the result either way, and a failed encode must not
       fail the seller's submission. */
    order.deliverables.forEach((d, i) => {
      if (d.kind === "link") return;
      if (!isPreviewableVideo(d.name, d.mimeType)) return;
      warmVideoPreview({
        blobName: d.blobName || "",
        legacyPath: "",
        state: d,
        persist: (patch) =>
          ServiceOrder.updateOne(
            { _id: order._id },
            {
              $set: Object.fromEntries(
                Object.entries(patch).map(([k, v]) => [`deliverables.${i}.${k}`, v])
              ),
            }
          ),
      });
    });

    try {
      await Notification.create({
        senderId: req.user._id,
        senderName: order.sellerId.name,
        senderEmail: order.sellerId.email,
        senderImage: order.sellerId.profileImage || order.sellerId.image,
        receiverUserId: order.buyerId._id,
        type: "SERVICE_WORK_SUBMITTED",
        message: `${order.sellerId.name || "The creator"} submitted the work for "${order.serviceTitle}". Review it and approve or request revision.`,
        meta: {
          serviceTitle: order.serviceTitle,
          note: note || "",
          deliverables: normalizedDeliverables.map(toPublicDeliverable),
        },
      });
    } catch (notifyErr) {
      console.error("Service work-submitted notification failed:", notifyErr);
    }

    // Carries the auto-release date: 72 hours of silence and the escrow pays
    // out by itself (cron/autoReleaseServiceEscrow.js). A timer that spends
    // someone's money can't run on an in-app badge alone.
    try {
      await sendWorkSubmittedEmail({
        to: order.buyerId.email,
        clientName: order.buyerId.name,
        creatorName: order.sellerId.name,
        title: order.serviceTitle,
        amount: order.sellerAmount ?? order.amount,
        autoReleaseAt: new Date(Date.now() + AUTO_RELEASE_HOURS * 60 * 60 * 1000),
        orderPath: `/orders/service/${order._id}`,
      });
    } catch (mailErr) {
      console.error("Service work-submitted email failed (submission stands):", mailErr.message);
    }

    if (order.chatId) {
      try {
        await Message.create({
          conversationId: order.chatId,
          sender: req.user._id,
          text: `SERVICE_WORK_SUBMITTED::${JSON.stringify({
            serviceOrderId: String(order._id),
            orderId: String(order._id),
            title: order.serviceTitle,
            amount: order.sellerAmount,
            note: note || "",
            // Indexed, not URL-bearing: an uploaded file is fetched through
            // /deliverables/:index/download so the chat message itself never
            // carries anything that could be opened without an auth check.
            deliverables: normalizedDeliverables.map(toPublicDeliverable),
            revisionState: getRevisionState(order),
            status: "WORK_SUBMITTED",
            message: `${order.sellerId.name || "The creator"} submitted the work. Please review the attached files.`,
          })}`,
          readBy: [req.user._id],
        });
      } catch (msgErr) {
        console.error("Service work-submitted chat message failed:", msgErr);
      }
    }

    return res.json({ success: true, message: "Work submitted successfully", order });
  } catch (err) {
    console.error("submit service work error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= APPROVE WORK + RELEASE PAYMENT (buyer) ================= */
router.post("/orders/:orderId/approve-work", requireAuth, async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.orderId)
      .populate("buyerId", "name email")
      .populate("sellerId", "name email");

    if (!order) return res.status(404).json({ success: false, error: "order_not_found" });
    if (String(order.buyerId._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }
    if (order.status !== "WORK_SUBMITTED") {
      return res.status(400).json({ success: false, error: `Cannot approve. Current status: ${order.status}` });
    }
    if (order.fundsStatus !== "HELD_BY_TOKUN") {
      return res.status(400).json({ success: false, error: "Funds not in escrow" });
    }

    const payoutAmount = Number(order.sellerAmount || 0);
    if (!payoutAmount || payoutAmount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid payout amount" });
    }

    let releaseResult;
    try {
      releaseResult = await releaseServiceEscrowToSeller(order._id, "buyer_approved");
    } catch (releaseErr) {
      if (releaseErr instanceof ServiceEscrowAlreadyReleasedError) {
        return res.status(400).json({ success: false, error: "Escrow was already released for this order" });
      }
      throw releaseErr;
    }
    const wallet = releaseResult.wallet;
    order.status = releaseResult.order.status;
    order.fundsStatus = releaseResult.order.fundsStatus;
    order.approvedAt = releaseResult.order.approvedAt;
    order.releasedAt = releaseResult.order.releasedAt;

    try {
      await Notification.create({
        senderId: order.buyerId._id,
        senderName: order.buyerId.name,
        receiverUserId: order.sellerId._id,
        type: "SERVICE_PAYMENT_RELEASED",
        amount: payoutAmount,
        message: `${order.buyerId.name} approved your work! ₹${payoutAmount} has been credited to your Tokun Wallet. You can withdraw to your bank anytime.`,
        meta: { serviceTitle: order.serviceTitle, amount: payoutAmount, fundsStatus: "RELEASED_TO_SELLER" },
      });
    } catch (notifyErr) {
      console.error("Service payment-released notification failed:", notifyErr);
    }

    try {
      await sendEscrowReleasedEmail({
        to: order.sellerId.email,
        creatorName: order.sellerId.name,
        clientName: order.buyerId.name,
        title: order.serviceTitle,
        amount: payoutAmount,
        automatic: false,
      });
    } catch (mailErr) {
      console.error("Service escrow-released email failed (payout stands):", mailErr.message);
    }

    if (order.chatId) {
      try {
        await Message.create({
          conversationId: order.chatId,
          sender: req.user._id,
          text: `ESCROW_RELEASED::${JSON.stringify({
            serviceOrderId: String(order._id),
            title: order.serviceTitle,
            amount: payoutAmount,
            status: "COMPLETED",
            message: `✅ Payment released! ₹${payoutAmount} has been credited to the creator's Tokun Wallet.`,
          })}`,
          readBy: [req.user._id],
        });
      } catch (msgErr) {
        console.error("Service escrow-released chat message failed:", msgErr);
      }
    }

    return res.json({
      success: true,
      message: `₹${payoutAmount} credited to creator's Tokun Wallet`,
      order,
      // null once the money goes out over Route instead of the internal
      // ledger — there is no Tokun-side balance to report, Razorpay settles it
      // to the seller's own bank. Only legacy orders still return a wallet.
      walletBalance: wallet ? wallet.availableBalance : null,
    });
  } catch (err) {
    console.error("approve service work error:", err);
    return res.status(500).json({ success: false, error: err?.message || "server_error" });
  }
});

/* ================= REQUEST REVISION (buyer) ================= */
router.post("/orders/:orderId/request-revision", requireAuth, async (req, res) => {
  try {
    const { reason } = req.body || {};
    const order = await ServiceOrder.findById(req.params.orderId)
      .populate("buyerId", "name email")
      .populate("sellerId", "name email");

    if (!order) return res.status(404).json({ success: false, error: "order_not_found" });
    if (String(order.buyerId._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }
    if (order.status !== "WORK_SUBMITTED") {
      return res.status(400).json({ success: false, error: "Work not submitted yet" });
    }

    // The cap the buyer agreed to when booking. Without this the endpoint just
    // appended: a "2 Revisions" service could be sent back indefinitely and the
    // seller's payout would sit in escrow for as long as the buyer felt like.
    const revisionState = getRevisionState(order);
    if (revisionState.exhausted) {
      return res.status(400).json({
        success: false,
        error: "revisions_exhausted",
        message: `This booking included ${revisionState.allowed} revision${
          revisionState.allowed === 1 ? "" : "s"
        }, and you've used ${revisionState.used}. Approve the work, or contact support if something is genuinely wrong with the delivery.`,
        revisionState,
      });
    }

    order.status = "REVISION_REQUESTED";
    order.revisions = [...(order.revisions || []), { reason, requestedAt: new Date() }];
    await order.save();

    const updatedRevisionState = getRevisionState(order);

    try {
      await Notification.create({
        senderId: req.user._id,
        senderName: order.buyerId.name,
        receiverUserId: order.sellerId._id,
        type: "SERVICE_REVISION_REQUESTED",
        message: `${order.buyerId.name} requested a revision (${updatedRevisionState.label}): ${
          reason || "No reason given"
        }`,
        meta: {
          serviceTitle: order.serviceTitle,
          reason,
          revisionState: updatedRevisionState,
        },
      });
    } catch (notifyErr) {
      console.error("Service revision-requested notification failed:", notifyErr);
    }

    try {
      await sendRevisionRequestedEmail({
        to: order.sellerId.email,
        creatorName: order.sellerId.name,
        clientName: order.buyerId.name,
        title: order.serviceTitle,
        note: reason,
        dueAt: order.deliveryDueAt,
      });
    } catch (mailErr) {
      console.error("Service revision email failed (revision still recorded):", mailErr.message);
    }

    return res.json({
      success: true,
      message: updatedRevisionState.unlimited
        ? "Revision requested"
        : `Revision requested — ${updatedRevisionState.remaining} of ${updatedRevisionState.allowed} left`,
      order,
      revisionState: updatedRevisionState,
    });
  } catch (err) {
    console.error("request service revision error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= GET MY BOOKED ORDERS (buyer) ================= */
router.get("/orders/my", requireAuth, async (req, res) => {
  try {
    const orders = await ServiceOrder.find({ buyerId: req.user._id, paymentStatus: "PAID" })
      .populate("sellerId", "name email profileImage image avatarUrl")
      .sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (err) {
    console.error("get my service orders error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= GET RECEIVED ORDERS (seller) ================= */
router.get("/orders/received", requireAuth, async (req, res) => {
  try {
    const orders = await ServiceOrder.find({ sellerId: req.user._id, paymentStatus: "PAID" })
      .populate("buyerId", "name email profileImage image avatarUrl")
      .sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (err) {
    console.error("get received service orders error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= SELLER SUMMARY (for self-dash "Service Bookings" tab) ================= */
// Mirrors GET /api/hire/my/earnings's shape, scoped to service bookings only.
router.get("/orders/seller-summary", requireAuth, async (req, res) => {
  try {
    const sellerId = req.user._id;

    // New Requests: buyer booked but hasn't paid (NDA/payment pending) yet
    const requestOrders = await ServiceOrder.find({
      sellerId,
      status: "PENDING_PAYMENT",
    })
      .populate("buyerId", "name email profileImage image avatarUrl")
      .sort({ createdAt: -1 });

    // Active Projects: funded onward
    const projectOrders = await ServiceOrder.find({
      sellerId,
      status: { $in: ["FUNDED", "IN_PROGRESS", "WORK_SUBMITTED", "REVISION_REQUESTED", "COMPLETED"] },
    })
      .populate("buyerId", "name email profileImage image avatarUrl")
      .sort({ paidAt: -1, createdAt: -1 });

    const completedOrders = await ServiceOrder.find({
      sellerId,
      status: "COMPLETED",
      fundsStatus: { $in: ["RELEASED_TO_SELLER", "AUTO_RELEASED"] },
    }).sort({ approvedAt: -1 });

    const totalEarnings = completedOrders.reduce((sum, o) => sum + Number(o.sellerAmount || 0), 0);

    return res.json({
      success: true,
      totalEarnings,
      activeRequests: requestOrders.length,
      totalProjects: projectOrders.length,
      // `note` is the buyer's actual brief and was the one field the seller
      // most needed and never got — the cards showed a title, a name and a
      // price, so "what did this client actually pay me to do?" was
      // unanswerable without opening the chat.
      requests: requestOrders.map((o) => ({
        _id: o._id,
        title: o.serviceTitle,
        serviceId: o.serviceId,
        serviceMedia: o.serviceMedia,
        amount: o.amount,
        buyerId: o.buyerId,
        buyerName: o.buyerId?.name || "Client",
        note: o.note || "",
        preferredDate: o.preferredDate,
        status: o.status,
        createdAt: o.createdAt,
      })),
      projects: projectOrders.map((o) => ({
        _id: o._id,
        title: o.serviceTitle,
        serviceId: o.serviceId,
        serviceMedia: o.serviceMedia,
        amount: o.amount,
        sellerAmount: o.sellerAmount,
        platformFee: o.platformFee,
        clientFee: o.clientFee,
        totalPayable: o.totalPayable,
        buyerId: o.buyerId,
        buyerName: o.buyerId?.name || "Client",
        note: o.note || "",
        chatId: o.chatId,
        preferredDate: o.preferredDate,
        status: o.status,
        fundsStatus: o.fundsStatus,
        paymentStatus: o.paymentStatus,
        paidAt: o.paidAt,
        // What the listing promised, as a date — so Service Bookings can show
        // the clock instead of the seller having to remember it.
        deliveryDays: o.deliveryDays ?? null,
        deliveryDueAt: o.deliveryDueAt || null,
        deliveryOverdue: isDeliveryOverdue(o),
        workStartedAt: o.workStartedAt,
        workSubmittedAt: o.workSubmittedAt,
        approvedAt: o.approvedAt,
        deliverables: (o.deliverables || []).map(toPublicDeliverable),
        submissionNote: o.submissionNote || "",
        submissionCount: o.submissions?.length || 0,
        revisions: o.revisions || [],
        revisionState: getRevisionState(o),
        createdAt: o.createdAt,
      })),
      deals: completedOrders.map((o) => ({
        _id: o._id,
        title: o.serviceTitle,
        amount: o.sellerAmount,
        approvedAt: o.approvedAt,
        status: o.status,
      })),
    });
  } catch (err) {
    console.error("fetch service seller-summary error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= GET SINGLE ORDER (chat card live-status refresh) ================= */
router.get("/orders/:orderId", requireAuth, async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.orderId)
      .populate("buyerId", "name email profileImage image avatarUrl")
      .populate("sellerId", "name email profileImage image avatarUrl")
      // The terms the listing promised — deliverables, delivery time, revisions
      // — live on the Service, not the order, which only ever snapshotted the
      // title. Without this the booking detail popup can't show what was sold.
      /* screens/prototype/fileType are the legacy package fields — no longer
         collected, but a listing created before `deliverables` existed has
         nothing else describing what it includes, and the NDA quotes that list
         as the agreed scope (see NdaCard.tsx). */
      .populate(
        "serviceId",
        "title description deliverables delivery revisions media price screens prototype fileType"
      )
      .lean();

    if (!order) return res.status(404).json({ success: false, error: "order_not_found" });

    const isParty =
      String(order.buyerId._id) === String(req.user._id) ||
      String(order.sellerId._id) === String(req.user._id);

    if (!isParty) return res.status(403).json({ success: false, error: "not_authorized" });

    return res.json({
      success: true,
      order: {
        ...order,
        // The client renders a live countdown off deliveryDueAt, but whether
        // the deadline has actually passed is the server's call — its clock is
        // the one the submit guard uses.
        deliveryOverdue: isDeliveryOverdue(order),
        deliverables: (order.deliverables || []).map(toPublicDeliverable),
        // History of every delivery, so a resubmission after a revision doesn't
        // make the first one vanish from the record.
        submissions: (order.submissions || []).map((s) => ({
          ...s,
          deliverables: (s.deliverables || []).map(toPublicDeliverable),
        })),
      },
      revisionState: getRevisionState(order),
    });
  } catch (err) {
    console.error("get service order error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= SERVICE DETAIL (public) =================
   Backs /service/:serviceId, the page a buyer lands on from the directory.

   MUST STAY LAST AMONG THE GETs. "/:serviceId" matches any single segment, so
   placed earlier it would swallow /browse, /my and /orders/*. Anything added
   below this line needs a literal prefix or it will never be reached. */
router.get("/:serviceId", async (req, res) => {
  try {
    const { serviceId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ success: false, error: "invalid_service_id" });
    }

    const service = await Service.findById(serviceId)
      .populate(
        "userId",
        // email is read only to answer the video-gate allowlist below; it is
        // never returned to the client.
        "name email avatarUrl isVerified sellerStatus isDeleted createdAt location sellerRating sellerReviewsCount"
      )
      .populate("category", "name parent")
      .populate("subCategory", "name parent")
      .lean();

    if (!service) {
      return res.status(404).json({ success: false, error: "not_found" });
    }

    // A draft is visible to its author only — this is the page a buyer reaches
    // from a link, and an unfinished listing must not be one of them.
    const viewerId = req.user?._id ? String(req.user._id) : null;
    const isOwner = viewerId && String(service.userId?._id) === viewerId;
    if (service.status !== "published" && !isOwner) {
      return res.status(404).json({ success: false, error: "not_found" });
    }

    const seller = service.userId;
    if (!seller || seller.isDeleted) {
      return res.status(404).json({ success: false, error: "seller_unavailable" });
    }

    // The seller's freelancer profile, when they have a live one. It supplies
    // the professional title and languages the page shows next to their name —
    // a prompt-only seller simply has none, and those lines are omitted.
    const freelancer = await FreelancerProfile.findOne({
      userId: seller._id,
      status: "ACTIVE",
    })
      .select("professionalTitle country city languages skills hourlyRate availability introVideo")
      .lean();

    // The breadcrumb reads parent → child, so a sub-category needs its parent's
    // name even though the service only stores a reference to the child.
    let parentCategory = null;
    if (service.subCategory?.parent) {
      parentCategory = await Category.findById(service.subCategory.parent).select("name").lean();
    }

    return res.json({
      success: true,
      service: {
        _id: String(service._id),
        title: service.title,
        description: service.description,
        price: service.price,
        delivery: service.delivery || "",
        revisions: service.revisions || "",
        deliverables: service.deliverables || [],
        screens: service.screens || "",
        prototype: service.prototype || "",
        fileType: service.fileType || "",
        media: service.media || [],
        status: service.status,
        category: service.category
          ? { _id: String(service.category._id), name: service.category.name }
          : null,
        subCategory: service.subCategory
          ? { _id: String(service.subCategory._id), name: service.subCategory.name }
          : null,
        // Falls back to the service's own category when there is no
        // sub-category, so the breadcrumb never renders a dangling separator.
        parentCategory: parentCategory ? { name: parentCategory.name } : null,
        createdAt: service.createdAt,
      },
      seller: {
        userId: String(seller._id),
        name: seller.name || "Unknown",
        avatar: seller.avatarUrl || null,
        verified: !!seller.isVerified,
        suspended: seller.sellerStatus === "SUSPENDED",
        location: seller.location || null,
        memberSince: seller.createdAt,
        rating: seller.sellerRating || 0,
        reviewsCount: seller.sellerReviewsCount || 0,
        isFreelancer: !!freelancer,
        /* Cleared to sell services and be hired — the same rule create and
           create-proposal enforce. Drives the label under their name, so a
           creator who can't trade yet isn't announced as a Super Creator. */
        superCreator: Boolean(
          freelancer &&
            (freelancer.introVideo?.status === "APPROVED" || isAllowlistedEmail(seller.email))
        ),
        professionalTitle: freelancer?.professionalTitle || "",
        languages: freelancer?.languages || [],
        hourlyRate: freelancer?.hourlyRate ?? null,
        availability: freelancer?.availability || null,
        freelancerLocation: freelancer
          ? [freelancer.city, freelancer.country].filter(Boolean).join(", ")
          : "",
      },
      // Other work by the same person, for the "more from this seller" strip.
      // Excludes this one and anything unpublished.
      otherServices: await Service.find({
        userId: seller._id,
        status: "published",
        _id: { $ne: service._id },
      })
        .select("title price media delivery")
        .sort({ createdAt: -1 })
        .limit(4)
        .lean()
        .then((rows) =>
          rows.map((r) => ({
            _id: String(r._id),
            title: r.title,
            price: r.price,
            delivery: r.delivery || "",
            cover: r.media?.[0] || null,
          }))
        ),
    });
  } catch (err) {
    console.error("Service detail error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
