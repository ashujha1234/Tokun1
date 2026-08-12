// routes/progressReview.js
//
// Mid-project checkpoints. The client asks "can I see where this is?", the
// freelancer answers with a screenshot or a screen recording — or declines,
// with a reason.
//
// Mounted once at /api/progress-review with the order kind as a path param,
// same as the cancellation router: hire deals and service bookings behave
// identically here.
//
// Two things this is really for:
//
//   1. A 60-day project used to mean paying up front and then waiting two
//      months on nothing but trust. That silence is what makes clients cancel
//      out of anxiety rather than because anything is actually wrong.
//
//   2. Evidence. Every cancellation dispute comes down to "how much was
//      actually done", and a chat scroll is not something an admin can rule
//      from. An accepted progress review is a timestamped record, held by us,
//      of what existed on a given date.
//
// Rate-limited by design: one open request at a time, and a cooldown between
// them, because "show me proof" on demand every afternoon is just a new way to
// harass someone mid-work.

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const ProgressReview = require("../models/ProgressReview");
const ServiceOrder = require("../models/ServiceOrder");
const HireDeal = require("../models/HireDeal");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const { requireAuth, blockIfSuspended } = require("../utils/auth");
const {
  uploadWorkFileToAzure,
  getWorkFileDownloadUrl,
  isAllowedWorkFile,
} = require("../utils/serviceWorkStorage");

const router = express.Router();

// A screen recording is the most useful thing a freelancer can send here, and
// those are big — but this is a progress clip, not the delivery, so it sits
// well below the 500 MB deliverable ceiling.
const REVIEW_MEDIA_MAX_BYTES = 100 * 1024 * 1024;
const REVIEW_MAX_MEDIA = 6;

// Hours between one request being answered and the client being able to ask
// again. Long enough that a checkpoint is a checkpoint, not a standing demand.
const REQUEST_COOLDOWN_HOURS = 24;

// Only while work is actually happening. Before FUNDED there's nothing to show;
// after submission the deliverables themselves are the answer.
const REVIEWABLE_STATUSES = ["FUNDED", "IN_PROGRESS", "REVISION_REQUESTED"];

const KIND_CONFIG = {
  hire: {
    model: HireDeal,
    idField: "hireDealId",
    buyerField: "clientId",
    sellerField: "freelancerId",
    titleField: "title",
  },
  service: {
    model: ServiceOrder,
    idField: "serviceOrderId",
    buyerField: "buyerId",
    sellerField: "sellerId",
    titleField: "serviceTitle",
  },
};

/* ── media upload ─────────────────────────────────────────────────────────── */

const tempDir = path.join(__dirname, "../uploads/progress-temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const reviewStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const base = path
      .basename(file.originalname || "progress", ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .slice(0, 80);
    cb(null, `${Date.now()}-${base || "progress"}${ext}`);
  },
});

const uploadReviewMedia = multer({
  storage: reviewStorage,
  limits: { fileSize: REVIEW_MEDIA_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (isAllowedWorkFile(file.originalname)) return cb(null, true);
    cb(new Error("unsupported_media_type"));
  },
});

function handleReviewUpload(req, res, next) {
  uploadReviewMedia.single("file")(req, res, (err) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "file_too_large",
        message: `Progress media must be under ${Math.round(REVIEW_MEDIA_MAX_BYTES / (1024 * 1024))} MB. For a long recording, trim it or share a link in the note.`,
      });
    }
    if (String(err.message).includes("unsupported_media_type")) {
      return res.status(400).json({
        success: false,
        error: "unsupported_media_type",
        message: "Send an image, a video, or a PDF.",
      });
    }
    console.error("progress review upload error:", err);
    return res.status(400).json({ success: false, error: "upload_failed" });
  });
}

function mediaKindFor(mimeType, name) {
  const mime = String(mimeType || "");
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  // Some browsers send application/octet-stream for video, so the extension is
  // the fallback — otherwise a perfectly good .mov renders as a generic file.
  if (/\.(mp4|mov|webm|mkv|avi)$/i.test(String(name || ""))) return "video";
  if (/\.(jpe?g|png|webp|gif|heic|bmp|tiff)$/i.test(String(name || ""))) return "image";
  return "file";
}

/* ── shared context loading ───────────────────────────────────────────────── */

async function loadContext(req) {
  const { orderKind, orderId } = req.params;

  const cfg = KIND_CONFIG[orderKind];
  if (!cfg) return { error: { code: 400, body: { success: false, error: "invalid_order_kind" } } };
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return { error: { code: 400, body: { success: false, error: "invalid_order_id" } } };
  }

  const order = await cfg.model
    .findById(orderId)
    .populate(cfg.buyerField, "name email avatarUrl")
    .populate(cfg.sellerField, "name email avatarUrl");

  if (!order) return { error: { code: 404, body: { success: false, error: "order_not_found" } } };

  const buyer = order[cfg.buyerField];
  const seller = order[cfg.sellerField];
  const userId = String(req.user._id);
  const isBuyer = String(buyer?._id) === userId;
  const isSeller = String(seller?._id) === userId;

  if (!isBuyer && !isSeller) {
    return { error: { code: 403, body: { success: false, error: "not_authorized" } } };
  }

  return { cfg, order, buyer, seller, isBuyer, isSeller, orderKind, orderId };
}

async function postToChat(order, senderId, text) {
  if (!order.chatId) return;
  try {
    await Message.create({ conversationId: order.chatId, sender: senderId, text, readBy: [senderId] });
  } catch (err) {
    console.error("Progress review chat message failed:", err.message);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/progress-review/media/upload
   One file, before the response is submitted. Not tied to a review id because
   the freelancer attaches media while composing the reply.
   ══════════════════════════════════════════════════════════════════════════ */
router.post("/media/upload", requireAuth, blockIfSuspended, handleReviewUpload, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "no_file_uploaded" });

    const { blobName, url } = await uploadWorkFileToAzure(
      req.file.path,
      req.file.originalname,
      `progress/${req.user._id}`
    );

    return res.json({
      success: true,
      file: {
        url,
        blobName,
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        kind: mediaKindFor(req.file.mimetype, req.file.originalname),
      },
    });
  } catch (err) {
    if (req.file?.path) fs.promises.unlink(req.file.path).catch(() => {});
    console.error("progress media upload error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/progress-review/:orderKind/:orderId
   Every checkpoint on this order, newest first.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/:orderKind/:orderId", requireAuth, async (req, res) => {
  try {
    const ctx = await loadContext(req);
    if (ctx.error) return res.status(ctx.error.code).json(ctx.error.body);

    const { cfg, orderId, order, isBuyer } = ctx;

    const reviews = await ProgressReview.find({ [cfg.idField]: orderId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const openRequest = reviews.find((r) => r.status === "REQUESTED") || null;

    // Media never leaves with a usable URL — the client asks for one file at a
    // time through the gated download route below.
    const safe = reviews.map((r) => ({
      ...r,
      media: (r.media || []).map((m, index) => ({
        index,
        name: m.name,
        size: m.size,
        mimeType: m.mimeType,
        kind: m.kind,
        uploadedAt: m.uploadedAt,
      })),
    }));

    return res.json({
      success: true,
      reviews: safe,
      openRequest: openRequest ? { _id: openRequest._id, requestNote: openRequest.requestNote } : null,
      canRequest: isBuyer && !openRequest && REVIEWABLE_STATUSES.includes(order.status),
      viewerRole: isBuyer ? "buyer" : "seller",
    });
  } catch (err) {
    console.error("list progress reviews error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/progress-review/:reviewId/media/:index/download
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/:reviewId/media/:index/download", requireAuth, async (req, res) => {
  try {
    const { reviewId, index } = req.params;
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, error: "invalid_id" });
    }

    const review = await ProgressReview.findById(reviewId).select("buyerId sellerId media");
    if (!review) return res.status(404).json({ success: false, error: "review_not_found" });

    /* Admins too, not just the two parties.
       These checkpoints are the strongest evidence in an escrow dispute — the
       only record made while the work was still going and before either side
       had an argument to win. Excluding admins meant the arbitration screen
       could list "3 file(s)" and then 403 on every one of them, so rulings were
       made on notes and percentages with the actual work unopened. */
    const userId = String(req.user._id);
    const isParty =
      String(review.buyerId) === userId || String(review.sellerId) === userId;
    if (!isParty && !req.isAdmin) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }

    const media = review.media?.[Number(index)];
    if (!media?.blobName) {
      return res.status(404).json({ success: false, error: "media_not_found" });
    }

    return res.json({ success: true, name: media.name, kind: media.kind, url: getWorkFileDownloadUrl(media.blobName) });
  } catch (err) {
    console.error("progress media download error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/progress-review/:orderKind/:orderId/request   (buyer)
   ══════════════════════════════════════════════════════════════════════════ */
router.post("/:orderKind/:orderId/request", requireAuth, async (req, res) => {
  try {
    const ctx = await loadContext(req);
    if (ctx.error) return res.status(ctx.error.code).json(ctx.error.body);

    const { cfg, order, buyer, seller, isBuyer, orderKind, orderId } = ctx;

    if (!isBuyer) {
      return res.status(403).json({
        success: false,
        error: "buyer_only",
        message: "Only the client can ask for a progress update.",
      });
    }
    if (!REVIEWABLE_STATUSES.includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: "not_reviewable",
        message:
          order.status === "WORK_SUBMITTED"
            ? "The work has already been delivered — open the delivery to review it."
            : `Progress updates can only be asked for while work is underway.`,
      });
    }

    const open = await ProgressReview.findOne({ [cfg.idField]: orderId, status: "REQUESTED" });
    if (open) {
      return res.status(409).json({
        success: false,
        error: "request_already_open",
        message: "You've already asked for an update on this — give them a chance to reply.",
      });
    }

    // Cooldown measured from the last ANSWER, not the last request, so a
    // freelancer who replies promptly isn't punished with a shorter gap than
    // one who ignores it.
    const lastAnswered = await ProgressReview.findOne({
      [cfg.idField]: orderId,
      status: { $in: ["SHARED", "DECLINED"] },
    }).sort({ respondedAt: -1 });

    if (lastAnswered?.respondedAt) {
      const hoursSince = (Date.now() - new Date(lastAnswered.respondedAt)) / 36e5;
      if (hoursSince < REQUEST_COOLDOWN_HOURS) {
        const wait = Math.ceil(REQUEST_COOLDOWN_HOURS - hoursSince);
        return res.status(429).json({
          success: false,
          error: "cooldown",
          message: `You asked for an update recently. You can ask again in about ${wait} hour${wait === 1 ? "" : "s"}.`,
        });
      }
    }

    const review = await ProgressReview.create({
      orderKind,
      [cfg.idField]: orderId,
      buyerId: buyer._id,
      sellerId: seller._id,
      title: order[cfg.titleField] || "",
      requestNote: String(req.body?.note || "").trim().slice(0, 1000),
      status: "REQUESTED",
    });

    await Notification.create({
      senderId: buyer._id,
      senderName: buyer?.name,
      receiverUserId: seller._id,
      type: "PROGRESS_REVIEW_REQUESTED",
      message: `${buyer?.name || "The client"} asked to see how "${order[cfg.titleField]}" is coming along. Share a screenshot or a short recording — or let them know why now isn't a good time.`,
      meta: { orderKind, orderId: String(orderId), reviewId: String(review._id) },
    });

    await postToChat(
      order,
      buyer._id,
      `👀 The client asked for a progress update${review.requestNote ? `: "${review.requestNote}"` : "."}`
    );

    return res.json({ success: true, review });
  } catch (err) {
    console.error("request progress review error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/progress-review/:orderKind/:orderId/respond   (seller)
   action: "share" | "decline"
   ══════════════════════════════════════════════════════════════════════════ */
router.post("/:orderKind/:orderId/respond", requireAuth, async (req, res) => {
  try {
    const ctx = await loadContext(req);
    if (ctx.error) return res.status(ctx.error.code).json(ctx.error.body);

    const { cfg, order, buyer, seller, isSeller, orderKind, orderId } = ctx;

    if (!isSeller) {
      return res.status(403).json({
        success: false,
        error: "seller_only",
        message: "Only the creator can answer a progress request.",
      });
    }

    const action = String(req.body?.action || "share").toLowerCase();
    if (!["share", "decline"].includes(action)) {
      return res.status(400).json({ success: false, error: "invalid_action" });
    }

    const review = await ProgressReview.findOne({ [cfg.idField]: orderId, status: "REQUESTED" }).sort({
      createdAt: -1,
    });
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "no_open_request",
        message: "There's no open progress request on this booking.",
      });
    }

    if (action === "decline") {
      // A first-class outcome, not a failure. Being able to demand a demo on
      // any afternoon would be a way to harass someone mid-work, so saying
      // "not right now, here's why" has to be a real option.
      review.status = "DECLINED";
      review.declineReason = String(req.body?.reason || "").trim().slice(0, 1000);
      review.respondedAt = new Date();
      await review.save();

      await Notification.create({
        senderId: seller._id,
        senderName: seller?.name,
        receiverUserId: buyer._id,
        type: "PROGRESS_REVIEW_DECLINED",
        message: `${seller?.name || "The creator"} can't share a progress update right now${review.declineReason ? `: ${review.declineReason}` : "."}`,
        meta: { orderKind, orderId: String(orderId), reviewId: String(review._id) },
      });

      return res.json({ success: true, outcome: "declined", review });
    }

    // Only blobName-bearing descriptors survive, so a seller can't pass an
    // arbitrary URL off as uploaded media.
    const media = (Array.isArray(req.body?.media) ? req.body.media : [])
      .filter((m) => m && m.blobName)
      .slice(0, REVIEW_MAX_MEDIA)
      .map((m) => ({
        url: String(m.url || ""),
        blobName: String(m.blobName),
        name: String(m.name || "Progress update").slice(0, 200),
        size: Number(m.size) || 0,
        mimeType: String(m.mimeType || ""),
        kind: mediaKindFor(m.mimeType, m.name),
        uploadedAt: new Date(),
      }));

    const note = String(req.body?.note || "").trim().slice(0, 2000);

    if (!media.length && !note) {
      return res.status(400).json({
        success: false,
        error: "empty_response",
        message: "Attach a screenshot or recording, or write a note about where things stand.",
      });
    }

    const rawPercent = req.body?.progressPercent;
    const progressPercent =
      rawPercent === undefined || rawPercent === null || rawPercent === ""
        ? null
        : Math.max(0, Math.min(100, Number(rawPercent) || 0));

    review.status = "SHARED";
    review.media = media;
    review.responseNote = note;
    review.progressPercent = progressPercent;
    review.respondedAt = new Date();
    await review.save();

    await Notification.create({
      senderId: seller._id,
      senderName: seller?.name,
      receiverUserId: buyer._id,
      type: "PROGRESS_REVIEW_SHARED",
      message: `${seller?.name || "The creator"} shared a progress update on "${order[cfg.titleField]}"${
        progressPercent !== null ? ` — around ${progressPercent}% done` : ""
      }.`,
      meta: { orderKind, orderId: String(orderId), reviewId: String(review._id) },
    });

    await postToChat(
      order,
      seller._id,
      `📸 Progress update shared${progressPercent !== null ? ` — around ${progressPercent}% done` : ""}${
        media.length ? ` (${media.length} file${media.length === 1 ? "" : "s"})` : ""
      }.${note ? `\n\n${note}` : ""}`
    );

    return res.json({ success: true, outcome: "shared", review });
  } catch (err) {
    console.error("respond to progress review error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
module.exports.REVIEW_MEDIA_MAX_BYTES = REVIEW_MEDIA_MAX_BYTES;
