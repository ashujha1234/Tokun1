// Uploads for the client's brief — the reference material that comes WITH a
// request, as opposed to the deliverables that come back at the end.
//
// A brief was plain text before this. Asking a designer to "match the style in
// the attached deck" with no way to attach the deck meant every real brief
// started with the client pasting a Drive link into chat and hoping the
// freelancer found it later. Now the files ride on the order itself, so they're
// still there when a dispute asks what was actually agreed.
//
// Deliberately separate from the work-file uploader:
//   • brief files are the CLIENT's, work files are the SELLER's
//   • brief files are small reference material, not multi-gigabyte deliveries
//   • both parties may read a brief from the moment it's created, whereas a
//     deliverable stays locked until the work is approved
//
// Stored in the same private container as work files and read through the same
// kind of auth-gated, short-lived URL — a brief can contain unreleased
// campaign material and has no business being publicly fetchable.

const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { tempUploadDir } = require("../utils/privateUploadDirs");
const mongoose = require("mongoose");
const ServiceOrder = require("../models/ServiceOrder");
const HireDeal = require("../models/HireDeal");
const { requireAuth, blockIfSuspended } = require("../utils/auth");
const {
  uploadWorkFileToAzure,
  getWorkFileDownloadUrl,
  isAllowedWorkFile,
} = require("../utils/serviceWorkStorage");

const router = express.Router();

// Reference material, not deliverables. 25 MB covers a deck, a brand PDF, a
// reference video clip or a folder of screenshots zipped up; anything bigger is
// a link, and saying so up front beats a failed upload.
const BRIEF_FILE_MAX_BYTES = 25 * 1024 * 1024;
const BRIEF_MAX_FILES = 5;

/* Outside /uploads, which express.static serves to anyone. This is where the client's brief attachments
   sits for the seconds between multer writing it and the Azure upload taking it
   — a window in which it used to be readable over plain HTTP. */
const tempDir = tempUploadDir("brief-temp");

const briefStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const base = path
      .basename(file.originalname || "brief-file", ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .slice(0, 80);
    cb(null, `${Date.now()}-${base || "brief-file"}${ext}`);
  },
});

const uploadBriefFile = multer({
  storage: briefStorage,
  limits: { fileSize: BRIEF_FILE_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (isAllowedWorkFile(file.originalname)) return cb(null, true);
    cb(new Error("unsupported_brief_file_type"));
  },
});

/* Multer's failures reach Express's default handler as HTML otherwise, which
   the client parses as a generic "upload failed" with no reason. */
function handleBriefUpload(req, res, next) {
  uploadBriefFile.single("file")(req, res, (err) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "file_too_large",
        message: `Brief attachments must be under ${Math.round(BRIEF_FILE_MAX_BYTES / (1024 * 1024))} MB each. For anything bigger, paste a Drive or Dropbox link in the brief instead.`,
      });
    }
    if (String(err.message).includes("unsupported_brief_file_type")) {
      return res.status(400).json({
        success: false,
        error: "unsupported_brief_file_type",
        message: "That file type isn't accepted. Images, PDFs, documents and zips work.",
      });
    }
    console.error("brief upload error:", err);
    return res.status(400).json({
      success: false,
      error: "upload_failed",
      message: "Could not read that file. Please try again.",
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/brief/upload
   Uploads one reference file and hands back a descriptor.

   Not tied to an order id, because the brief is written BEFORE the order
   exists — the client attaches files while composing the booking, then submits
   the descriptors along with it. The blob is namespaced under the uploader so
   an orphaned upload is still traceable to a person.
   ══════════════════════════════════════════════════════════════════════════ */
router.post("/upload", requireAuth, blockIfSuspended, handleBriefUpload, async (req, res) => {
  const cleanupTemp = () => {
    if (req.file?.path) fs.promises.unlink(req.file.path).catch(() => {});
  };

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "no_file_uploaded" });
    }

    const { blobName, url } = await uploadWorkFileToAzure(
      req.file.path,
      req.file.originalname,
      `briefs/${req.user._id}`
    );

    return res.json({
      success: true,
      file: {
        url,
        blobName,
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (err) {
    cleanupTemp();
    console.error("brief file upload error:", err);
    return res.status(500).json({
      success: false,
      error: "server_error",
      message: "Upload failed on our side. Please try that file again.",
    });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/brief/:orderKind/:orderId/attachments/:index/download

   Gated the same way deliverables are: a brief can hold unreleased campaign
   material, so the blob lives in a private container and only the two parties
   to the order can mint a URL for it.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/:orderKind/:orderId/attachments/:index/download", requireAuth, async (req, res) => {
  try {
    const { orderKind, orderId, index } = req.params;

    if (!["hire", "service"].includes(orderKind)) {
      return res.status(400).json({ success: false, error: "invalid_order_kind" });
    }
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, error: "invalid_order_id" });
    }

    const isHire = orderKind === "hire";
    const Model = isHire ? HireDeal : ServiceOrder;
    const buyerField = isHire ? "clientId" : "buyerId";
    const sellerField = isHire ? "freelancerId" : "sellerId";

    const order = await Model.findById(orderId).select(
      `${buyerField} ${sellerField} briefAttachments`
    );
    if (!order) return res.status(404).json({ success: false, error: "order_not_found" });

    const userId = String(req.user._id);
    const isParty =
      String(order[buyerField]) === userId || String(order[sellerField]) === userId;
    if (!isParty) return res.status(403).json({ success: false, error: "not_authorized" });

    const attachment = order.briefAttachments?.[Number(index)];
    if (!attachment) {
      return res.status(404).json({ success: false, error: "attachment_not_found" });
    }
    if (!attachment.blobName) {
      return res.status(404).json({
        success: false,
        error: "file_missing",
        message: "This attachment is no longer available.",
      });
    }

    return res.json({
      success: true,
      name: attachment.name,
      url: getWorkFileDownloadUrl(attachment.blobName),
    });
  } catch (err) {
    console.error("brief attachment download error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/**
 * Turns whatever the client posted alongside a brief into storable descriptors.
 *
 * Only blobName and the metadata are trusted — the client cannot name an
 * arbitrary URL and have it stored as an attachment, because reads go through
 * blobName and the gated route above.
 */
function normalizeBriefAttachments(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((f) => f && f.blobName)
    .slice(0, BRIEF_MAX_FILES)
    .map((f) => ({
      url: String(f.url || ""),
      blobName: String(f.blobName),
      name: String(f.name || "Attachment").slice(0, 200),
      size: Number(f.size) || 0,
      mimeType: String(f.mimeType || ""),
      uploadedAt: new Date(),
    }));
}

module.exports = router;
module.exports.normalizeBriefAttachments = normalizeBriefAttachments;
module.exports.BRIEF_FILE_MAX_BYTES = BRIEF_FILE_MAX_BYTES;
module.exports.BRIEF_MAX_FILES = BRIEF_MAX_FILES;
