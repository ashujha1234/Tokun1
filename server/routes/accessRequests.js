// routes/accessRequests.js
//
// The structured "here's what I need from you" checklist on an engagement.
//
// Mounted once at /api/access-requests with the order kind as a path param —
// same shape as routes/progressReview.js and routes/escrowCancellation.js,
// because hire deals and service bookings behave identically here.
//
// The creator raises items; the client answers them. See models/AccessRequest.js
// for why this is a model rather than a chat message, and for what each item
// kind means.
//
// ── The credential guard ─────────────────────────────────────────────────────
//
// The single most valuable thing in this file is refusing to store a password.
// Asked for "access to your email platform" in prose, a meaningful share of
// clients answer with a username and a password — in a chat log, in plaintext,
// permanently, on an account they will never rotate. Tokun is not a secret
// store and must not become an accidental one.
//
// So ACCESS items ask for an INVITATION and record who was invited, and
// `rejectIfSecret()` below refuses any free-text answer that looks like a
// credential, with an explanation of what to do instead. That check has a false
// positive rate and that is an accepted trade: the cost of a false positive is
// somebody rewording a sentence, and the cost of a false negative is a live
// credential sitting in our database.

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const AccessRequest = require("../models/AccessRequest");
const ServiceOrder = require("../models/ServiceOrder");
const HireDeal = require("../models/HireDeal");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const { requireAuth, blockIfSuspended } = require("../utils/auth");
const { tempUploadDir } = require("../utils/privateUploadDirs");
const {
  uploadWorkFileToAzure,
  getWorkFileDownloadUrl,
  isAllowedWorkFile,
} = require("../utils/serviceWorkStorage");
const { getTemplate, templateIndex } = require("../constants/accessRequestTemplates");

const router = express.Router();

/* A brand kit or a folder of product photos is the normal case here, and it is
   bigger than a progress screenshot but smaller than a delivery. Raw video and
   4K footage are expected to arrive as a link in the response note — which is
   why the templates for those categories say so. */
const ASSET_MAX_BYTES = 150 * 1024 * 1024;
const MAX_ATTACHMENTS_PER_ITEM = 8;
const MAX_ITEMS = 25;

/* Only while the engagement is actually live and the work is ahead of it.
   Before FUNDED there is no engagement to unblock; after submission the ask is
   moot, and a creator raising new blocking requirements after delivering would
   be a way to reset their own deadline. */
const REQUESTABLE_STATUSES = ["FUNDED", "IN_PROGRESS", "REVISION_REQUESTED"];

const KIND_CONFIG = {
  hire: {
    model: HireDeal,
    idField: "hireDealId",
    buyerField: "clientId",
    sellerField: "freelancerId",
    titleField: "title",
    notifyRaised: "ACCESS_REQUEST_RAISED",
  },
  service: {
    model: ServiceOrder,
    idField: "serviceOrderId",
    buyerField: "buyerId",
    sellerField: "sellerId",
    titleField: "serviceTitle",
    notifyRaised: "ACCESS_REQUEST_RAISED",
  },
};

const ITEM_KINDS = ["ASSET", "ACCESS", "INFO", "APPROVAL"];

/* ── the credential guard ──────────────────────────────────────────────────── */

/* Patterns that mean "this is a secret", not "this mentions a secret".
   The distinction is the `[:=]` followed by a value: "the password reset link is
   in your inbox" passes, "password: hunter2" does not. Deliberately narrow —
   see the file header on the trade-off. */
const SECRET_PATTERNS = [
  /(pass(word|wd|code)?|pwd|secret|api[\s_-]?key|access[\s_-]?key|private[\s_-]?key|auth[\s_-]?token|bearer|otp|pin)\s*(?:is|:|=|->)\s*\S{4,}/i,
  // A pasted PEM block. Unambiguous, and the worst thing that could land here.
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  // "user / pass" pairs written as one line.
  /\b\S+\s*[\/|]\s*\S{6,}\b.*\b(login|log ?in|credential)/i,
];

/**
 * Does this look like somebody just sent us a credential?
 *
 * @returns {string|null} the matched shape's name, or null
 */
function looksLikeSecret(text) {
  const s = String(text || "");
  if (!s.trim()) return null;
  if (SECRET_PATTERNS[1].test(s)) return "private key";
  if (SECRET_PATTERNS[0].test(s)) return "password or key";
  if (SECRET_PATTERNS[2].test(s)) return "login pair";
  return null;
}

/**
 * 400s a response carrying what looks like a credential.
 *
 * The message matters as much as the refusal: a bare rejection teaches the
 * client to try a different field, whereas telling them to invite the creator
 * instead is the behaviour we actually want. Returns true when it has already
 * answered the request.
 */
function rejectIfSecret(res, text) {
  const kind = looksLikeSecret(text);
  if (!kind) return false;
  res.status(400).json({
    success: false,
    error: "looks_like_credential",
    message:
      `That looks like a ${kind}, and Tokun will not store one — a password sent through here would sit in plaintext, permanently, on an account nobody remembers to change. ` +
      `Instead, invite the creator's own account to the system (at the lowest level that lets them work) and reply with the email or username you invited. ` +
      `If you genuinely need to hand over a secret, use your own password manager's share link and send only that link, or rotate the credential the moment the work is done.`,
  });
  return true;
}

/* ── uploads ──────────────────────────────────────────────────────────────── */

/* Outside /uploads, which express.static serves to anyone — this is where a
   client's brand kit sits for the seconds between multer writing it and the
   Azure upload taking it. Same reasoning as progress-temp. */
const tempDir = tempUploadDir("access-temp");

const assetStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tempDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const base = path
      .basename(file.originalname || "asset", ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .slice(0, 80);
    cb(null, `${Date.now()}-${base || "asset"}${ext}`);
  },
});

const uploadAsset = multer({
  storage: assetStorage,
  limits: { fileSize: ASSET_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (isAllowedWorkFile(file.originalname)) return cb(null, true);
    cb(new Error("unsupported_media_type"));
  },
});

function handleAssetUpload(req, res, next) {
  uploadAsset.single("file")(req, res, (err) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "file_too_large",
        message: `Files here must be under ${Math.round(ASSET_MAX_BYTES / (1024 * 1024))} MB. For raw footage or a big archive, put it in a Drive or WeTransfer folder and paste the link in your reply instead.`,
      });
    }
    if (String(err.message).includes("unsupported_media_type")) {
      return res.status(400).json({
        success: false,
        error: "unsupported_media_type",
        message: "That file type isn't accepted. Zip it, or share it as a link in your reply.",
      });
    }
    console.error("access asset upload error:", err);
    return res.status(400).json({ success: false, error: "upload_failed" });
  });
}

/* ── shared helpers ───────────────────────────────────────────────────────── */

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
    await Message.create({
      conversationId: order.chatId,
      sender: senderId,
      text,
      readBy: [senderId],
    });
  } catch (err) {
    console.error("Access request chat message failed:", err.message);
  }
}

/* The button each notification gets, written from the recipient's side.
 *
 * Every one of these lands on the same screen — the order's access checklist —
 * but "Provide what's needed" and "Review what they sent" are different jobs,
 * and a notification that says which one saves the reader working it out.
 *
 * Anything not listed falls back to "Open checklist", so a new access
 * notification type is still clickable before anyone writes a label for it. */
const ACTION_LABELS = {
  ACCESS_REQUEST_RAISED: "Provide what's needed",
  ACCESS_ITEM_REOPENED: "Provide what's needed",
  ACCESS_ITEM_PROVIDED: "Review what they sent",
  ACCESS_REQUEST_FULFILLED: "Review what they sent",
  ACCESS_ITEM_DECLINED: "Open checklist",
};

async function notify(type, { from, to, message, orderKind, orderId, requestId, itemId }) {
  try {
    await Notification.create({
      senderId: from?._id,
      senderName: from?.name,
      senderEmail: from?.email,
      receiverUserId: to?._id,
      type,
      message,
      meta: {
        orderKind,
        orderId: String(orderId),
        requestId: String(requestId),
        ...(itemId ? { itemId: String(itemId) } : {}),
        /* Makes the notification clickable. pages/Notifications.tsx renders a
           button for any notification carrying actionUrl — no per-type branch
           needed there, which is why this is the whole change.

           Without it the client read "the creator needs 3 things from you" and
           then had to find the order themselves, on a screen they may never
           have opened. The #access-checklist fragment is what makes it land on
           the panel rather than the top of a long page; OrderDetailPage scrolls
           to it once the order has loaded. */
        actionUrl: `/orders/${orderKind}/${orderId}#access-checklist`,
        actionLabel: ACTION_LABELS[type] || "Open checklist",
      },
    });
  } catch (err) {
    // Never fatal: the checklist mutation is the thing that had to land.
    console.error(`Access request notification (${type}) failed:`, err.message);
  }
}

/* Attachments never leave with a usable URL — the client asks for one file at a
   time through the gated download route, which is where authorisation happens.
   `index` travels so that route can be addressed. */
function publicItem(item) {
  return {
    _id: item._id,
    label: item.label,
    kind: item.kind,
    note: item.note,
    required: item.required,
    status: item.status,
    responseNote: item.responseNote,
    grantedTo: item.grantedTo,
    providedAt: item.providedAt,
    declineReason: item.declineReason,
    reopenCount: item.reopenCount,
    reopenNote: item.reopenNote,
    requestedAt: item.requestedAt,
    attachments: (item.attachments || []).map((a, index) => ({
      index,
      name: a.name,
      size: a.size,
      mimeType: a.mimeType,
      uploadedAt: a.uploadedAt,
    })),
  };
}

function publicRequest(request) {
  return {
    _id: request._id,
    orderKind: request.orderKind,
    status: request.status,
    orderTitle: request.orderTitle,
    items: (request.items || []).map(publicItem),
    summary: request.summary(),
    blockedHours: request.blockedHours,
    blockedSince: request.blockedSince,
    fulfilledAt: request.fulfilledAt,
    cancelledAt: request.cancelledAt,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

/** Sanitise one incoming item descriptor into the shape the schema wants. */
function normaliseItem(raw) {
  const label = String(raw?.label || "").trim().slice(0, 200);
  if (!label) return null;
  return {
    label,
    kind: ITEM_KINDS.includes(String(raw?.kind)) ? String(raw.kind) : "ASSET",
    note: String(raw?.note || "").trim().slice(0, 1000),
    // Defaults to required. A creator adding an ask usually needs it; the
    // optional ones are the exception and are ticked deliberately.
    required: raw?.required === false ? false : true,
    status: "PENDING",
    requestedAt: new Date(),
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/access-requests/templates
   The starter checklists. Above the /:orderKind/:orderId route so "templates"
   is never read as an order kind.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/templates", requireAuth, (req, res) => {
  const { id } = req.query;
  if (id) {
    const template = getTemplate(id);
    if (!template) return res.status(404).json({ success: false, error: "template_not_found" });
    return res.json({ success: true, template });
  }
  return res.json({ success: true, templates: templateIndex() });
});

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/access-requests/assets/upload    (client)
   One file, before the answer is submitted — the client attaches while
   composing, so this isn't tied to an item id yet.
   ══════════════════════════════════════════════════════════════════════════ */
router.post(
  "/assets/upload",
  requireAuth,
  blockIfSuspended,
  handleAssetUpload,
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, error: "no_file_uploaded" });

      const { blobName, url } = await uploadWorkFileToAzure(
        req.file.path,
        req.file.originalname,
        `access/${req.user._id}`
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
      if (req.file?.path) fs.promises.unlink(req.file.path).catch(() => {});
      console.error("access asset upload error:", err);
      return res.status(500).json({ success: false, error: "server_error" });
    }
  }
);

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/access-requests/:orderKind/:orderId
   The checklist, or null if none has been raised.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/:orderKind/:orderId", requireAuth, async (req, res) => {
  try {
    const ctx = await loadContext(req);
    if (ctx.error) return res.status(ctx.error.code).json(ctx.error.body);

    const { cfg, orderId, order, isBuyer } = ctx;

    const request = await AccessRequest.findOne({ [cfg.idField]: orderId });

    return res.json({
      success: true,
      request: request ? publicRequest(request) : null,
      viewerRole: isBuyer ? "buyer" : "seller",
      // Whether the creator can raise or add to a checklist right now, decided
      // here rather than by the client re-implementing the status rule.
      canRaise: !isBuyer && REQUESTABLE_STATUSES.includes(order.status),
    });
  } catch (err) {
    console.error("get access request error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/access-requests/:requestId/items/:itemId/attachments/:index/download

   The client's own material, going to the creator. Authorised, not watermarked
   — the escrow preview gate exists to protect the CREATOR's unpaid work from
   the buyer, and this is the buyer's file travelling the other way. There is
   nothing here to withhold from the person who was asked to work with it.

   Admins too: what the client actually supplied is the first thing anyone asks
   about in a "this isn't what I asked for" dispute.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/:requestId/items/:itemId/attachments/:index/download", requireAuth, async (req, res) => {
  try {
    const { requestId, itemId, index } = req.params;
    if (!mongoose.Types.ObjectId.isValid(requestId) || !mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, error: "invalid_id" });
    }

    const request = await AccessRequest.findById(requestId).select("buyerId sellerId items");
    if (!request) return res.status(404).json({ success: false, error: "request_not_found" });

    const userId = String(req.user._id);
    const isParty =
      String(request.buyerId) === userId || String(request.sellerId) === userId;
    if (!isParty && !req.isAdmin) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }

    const item = request.items.id(itemId);
    const attachment = item?.attachments?.[Number(index)];
    if (!attachment?.blobName) {
      return res.status(404).json({ success: false, error: "attachment_not_found" });
    }

    return res.json({
      success: true,
      name: attachment.name,
      mimeType: attachment.mimeType,
      url: getWorkFileDownloadUrl(attachment.blobName),
    });
  } catch (err) {
    console.error("access attachment download error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/access-requests/:orderKind/:orderId/items    (creator)
   Raise a checklist, or add to the existing one.
   body: { items?: [{label, kind, note, required}], templateId?: string }
   ══════════════════════════════════════════════════════════════════════════ */
router.post("/:orderKind/:orderId/items", requireAuth, blockIfSuspended, async (req, res) => {
  try {
    const ctx = await loadContext(req);
    if (ctx.error) return res.status(ctx.error.code).json(ctx.error.body);

    const { cfg, order, buyer, seller, isSeller, orderKind, orderId } = ctx;

    if (!isSeller) {
      return res.status(403).json({
        success: false,
        error: "seller_only",
        message: "Only the creator can ask for materials or access.",
      });
    }
    if (!REQUESTABLE_STATUSES.includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: "not_requestable",
        message:
          order.status === "WORK_SUBMITTED"
            ? "The work has already been delivered — a new requirement now would reset your own deadline. Ask in chat instead."
            : "Materials can only be requested while the engagement is live.",
      });
    }

    /* A template is just a source of rows — nothing downstream knows an item
       came from one. Explicit items win when both are sent, so a client can
       load a template, edit it, and post the result. */
    const source = Array.isArray(req.body?.items) && req.body.items.length
      ? req.body.items
      : req.body?.templateId
        ? getTemplate(req.body.templateId)?.items || []
        : [];

    const newItems = source.map(normaliseItem).filter(Boolean);
    if (!newItems.length) {
      return res.status(400).json({
        success: false,
        error: "no_items",
        message: "Add at least one thing you need, or pick a starter checklist.",
      });
    }

    let request = await AccessRequest.findOne({ [cfg.idField]: orderId });

    if (!request) {
      request = new AccessRequest({
        orderKind,
        [cfg.idField]: orderId,
        buyerId: buyer._id,
        sellerId: seller._id,
        orderTitle: String(order[cfg.titleField] || "").slice(0, 300),
        items: [],
      });
    }

    /* A cancelled checklist reopens rather than a second one being created —
       one per engagement is a unique index, and "I closed it and now I need
       something else" is a normal thing to happen. */
    if (request.status === "CANCELLED") {
      request.status = "OPEN";
      request.cancelledAt = null;
    }

    if (request.items.length + newItems.length > MAX_ITEMS) {
      return res.status(400).json({
        success: false,
        error: "too_many_items",
        message: `A checklist can hold ${MAX_ITEMS} items. A list longer than that stops being read.`,
      });
    }

    /* Duplicate labels are dropped rather than rejected: loading a template
       twice, or adding "Logo files" when it's already there, should be a no-op
       and not an error the creator has to reconcile by hand. Compared
       case-insensitively on the trimmed label — the same ask typed slightly
       differently is still the same ask to the person answering it. */
    const existing = new Set(request.items.map((i) => i.label.trim().toLowerCase()));
    const added = newItems.filter((i) => {
      const key = i.label.trim().toLowerCase();
      if (existing.has(key)) return false;
      existing.add(key);
      return true;
    });

    if (!added.length) {
      return res.status(409).json({
        success: false,
        error: "all_duplicates",
        message: "Everything in that list is already on the checklist.",
      });
    }

    const isFirstRaise = request.items.length === 0;
    request.items.push(...added);
    request.recomputeStatus();
    await request.save();

    const requiredCount = added.filter((i) => i.required).length;
    await notify(cfg.notifyRaised, {
      from: seller,
      to: buyer,
      orderKind,
      orderId,
      requestId: request._id,
      message: isFirstRaise
        ? `${seller?.name || "The creator"} needs ${added.length} thing${added.length === 1 ? "" : "s"} from you to get started on "${order[cfg.titleField]}"${requiredCount ? ` — ${requiredCount} of them required` : ""}.`
        : `${seller?.name || "The creator"} added ${added.length} more item${added.length === 1 ? "" : "s"} to what they need for "${order[cfg.titleField]}".`,
    });

    await postToChat(
      order,
      seller._id,
      `📋 ${isFirstRaise ? "Shared a checklist of what's needed" : "Added to the checklist"} — ${added.length} item${
        added.length === 1 ? "" : "s"
      }:\n${added.map((i) => `• ${i.label}${i.required ? "" : " (optional)"}`).join("\n")}\n\nOpen the order to provide them. Never send passwords — grant access by invitation.`
    );

    return res.json({ success: true, request: publicRequest(request), added: added.length });
  } catch (err) {
    console.error("add access items error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/access-requests/:orderKind/:orderId/items/:itemId/respond  (client)
   body: { action: "provide" | "decline", note?, grantedTo?, attachments?, reason? }
   ══════════════════════════════════════════════════════════════════════════ */
router.post(
  "/:orderKind/:orderId/items/:itemId/respond",
  requireAuth,
  blockIfSuspended,
  async (req, res) => {
    try {
      const ctx = await loadContext(req);
      if (ctx.error) return res.status(ctx.error.code).json(ctx.error.body);

      const { cfg, order, buyer, seller, isBuyer, orderKind, orderId } = ctx;
      const { itemId } = req.params;

      if (!isBuyer) {
        return res.status(403).json({
          success: false,
          error: "buyer_only",
          message: "Only the client can answer a checklist item.",
        });
      }
      if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ success: false, error: "invalid_item_id" });
      }

      const request = await AccessRequest.findOne({ [cfg.idField]: orderId });
      if (!request) return res.status(404).json({ success: false, error: "request_not_found" });

      const item = request.items.id(itemId);
      if (!item) return res.status(404).json({ success: false, error: "item_not_found" });
      if (item.status === "NOT_APPLICABLE") {
        return res.status(409).json({
          success: false,
          error: "item_withdrawn",
          message: "The creator no longer needs this one.",
        });
      }

      const action = String(req.body?.action || "provide").toLowerCase();
      if (!["provide", "decline"].includes(action)) {
        return res.status(400).json({ success: false, error: "invalid_action" });
      }

      const note = String(req.body?.note || "").trim().slice(0, 2000);
      const grantedTo = String(req.body?.grantedTo || "").trim().slice(0, 200);

      /* THE GUARD. Before anything is written, and on every free-text field the
         client can type into — including grantedTo, which is where someone
         determined to send a password will try next after the note is refused.
         See the file header for why a false positive is the acceptable error
         here. */
      if (rejectIfSecret(res, note) || rejectIfSecret(res, grantedTo)) return;

      if (action === "decline") {
        const reason = String(req.body?.reason || "").trim().slice(0, 1000);
        if (!reason) {
          return res.status(400).json({
            success: false,
            error: "reason_required",
            message:
              "Say why — \"we don't have brand guidelines\" is a perfectly good answer, and the creator needs to hear it rather than keep waiting.",
          });
        }

        item.status = "DECLINED";
        item.declineReason = reason;
        item.responseNote = note;
        item.providedAt = new Date();
        request.recomputeStatus();
        await request.save();

        await notify("ACCESS_ITEM_DECLINED", {
          from: buyer,
          to: seller,
          orderKind,
          orderId,
          requestId: request._id,
          itemId: item._id,
          message: `${buyer?.name || "The client"} can't provide "${item.label}": ${reason}`,
        });

        return res.json({ success: true, outcome: "declined", request: publicRequest(request) });
      }

      // Only blobName-bearing descriptors survive, so a client can't pass an
      // arbitrary URL off as an uploaded file — same rule as progress media.
      const attachments = (Array.isArray(req.body?.attachments) ? req.body.attachments : [])
        .filter((a) => a && a.blobName)
        .slice(0, MAX_ATTACHMENTS_PER_ITEM)
        .map((a) => ({
          url: String(a.url || ""),
          blobName: String(a.blobName),
          name: String(a.name || "Attachment").slice(0, 200),
          size: Number(a.size) || 0,
          mimeType: String(a.mimeType || ""),
          uploadedAt: new Date(),
        }));

      /* An answer has to actually contain something. What counts differs by
         kind, and getting this wrong in either direction is bad: too strict and
         a client who genuinely answered in a sentence is blocked, too loose and
         an item is marked provided with nothing against it, which is worse than
         PENDING because it stops being chased. */
      const hasSomething =
        attachments.length > 0 ||
        !!note ||
        (item.kind === "ACCESS" && !!grantedTo);

      if (!hasSomething) {
        return res.status(400).json({
          success: false,
          error: "empty_response",
          message:
            item.kind === "ACCESS"
              ? "Say which account you invited (an email or username is enough), or add a note."
              : item.kind === "ASSET"
                ? "Attach the file, or paste a link to it in a note."
                : "Write your answer in the note.",
        });
      }

      item.status = "PROVIDED";
      item.responseNote = note;
      item.grantedTo = grantedTo;
      // Appended, not replaced: an item reopened once and answered again should
      // keep both rounds, the same reason ServiceOrder.submissions exists.
      item.attachments = [...(item.attachments || []), ...attachments].slice(
        0,
        MAX_ATTACHMENTS_PER_ITEM
      );
      item.providedAt = new Date();
      item.declineReason = "";
      request.recomputeStatus();
      await request.save();

      const summary = request.summary();
      const nowFulfilled = request.status === "FULFILLED";

      await notify(nowFulfilled ? "ACCESS_REQUEST_FULFILLED" : "ACCESS_ITEM_PROVIDED", {
        from: buyer,
        to: seller,
        orderKind,
        orderId,
        requestId: request._id,
        itemId: item._id,
        message: nowFulfilled
          ? `${buyer?.name || "The client"} has provided everything you asked for on "${order[cfg.titleField]}" — nothing is outstanding.`
          : `${buyer?.name || "The client"} provided "${item.label}". ${summary.outstandingRequired} required item${summary.outstandingRequired === 1 ? "" : "s"} still outstanding.`,
      });

      if (nowFulfilled) {
        await postToChat(
          order,
          buyer._id,
          `✅ Everything on the checklist has been provided — nothing is outstanding.`
        );
      }

      return res.json({
        success: true,
        outcome: "provided",
        fulfilled: nowFulfilled,
        request: publicRequest(request),
      });
    } catch (err) {
      console.error("respond to access item error:", err);
      return res.status(500).json({ success: false, error: "server_error" });
    }
  }
);

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/access-requests/:orderKind/:orderId/items/:itemId/reopen  (creator)
   The client answered, but with the wrong thing. body: { note }
   ══════════════════════════════════════════════════════════════════════════ */
router.post(
  "/:orderKind/:orderId/items/:itemId/reopen",
  requireAuth,
  blockIfSuspended,
  async (req, res) => {
    try {
      const ctx = await loadContext(req);
      if (ctx.error) return res.status(ctx.error.code).json(ctx.error.body);

      const { cfg, order, buyer, seller, isSeller, orderKind, orderId } = ctx;
      const { itemId } = req.params;

      if (!isSeller) {
        return res.status(403).json({ success: false, error: "seller_only" });
      }

      const request = await AccessRequest.findOne({ [cfg.idField]: orderId });
      const item = request?.items?.id(itemId);
      if (!item) return res.status(404).json({ success: false, error: "item_not_found" });
      if (item.status === "PENDING") {
        return res.status(409).json({
          success: false,
          error: "already_pending",
          message: "This one is already outstanding.",
        });
      }

      /* A reason is required. Sending something back with no explanation is how
         a checklist becomes a loop — the client re-sends the same wrong file
         because nobody told them what was wrong with it. */
      const note = String(req.body?.note || "").trim().slice(0, 1000);
      if (!note) {
        return res.status(400).json({
          success: false,
          error: "note_required",
          message: "Say what's wrong with what they sent, or they'll send the same thing again.",
        });
      }

      item.status = "PENDING";
      item.reopenCount = (item.reopenCount || 0) + 1;
      item.reopenNote = note;
      // Kept, not cleared: what they sent the first time is part of the record,
      // and an admin ruling on "they never gave me the files" needs to see it.
      item.providedAt = null;
      request.recomputeStatus();
      await request.save();

      await notify("ACCESS_ITEM_REOPENED", {
        from: seller,
        to: buyer,
        orderKind,
        orderId,
        requestId: request._id,
        itemId: item._id,
        message: `${seller?.name || "The creator"} needs "${item.label}" again: ${note}`,
      });

      return res.json({ success: true, request: publicRequest(request) });
    } catch (err) {
      console.error("reopen access item error:", err);
      return res.status(500).json({ success: false, error: "server_error" });
    }
  }
);

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/access-requests/:orderKind/:orderId/items/:itemId/withdraw (creator)
   No longer needed. Marked, never deleted — the record still shows it was
   asked for, which is the point.
   ══════════════════════════════════════════════════════════════════════════ */
router.post(
  "/:orderKind/:orderId/items/:itemId/withdraw",
  requireAuth,
  async (req, res) => {
    try {
      const ctx = await loadContext(req);
      if (ctx.error) return res.status(ctx.error.code).json(ctx.error.body);

      const { cfg, orderId, isSeller } = ctx;
      const { itemId } = req.params;

      if (!isSeller) return res.status(403).json({ success: false, error: "seller_only" });

      const request = await AccessRequest.findOne({ [cfg.idField]: orderId });
      const item = request?.items?.id(itemId);
      if (!item) return res.status(404).json({ success: false, error: "item_not_found" });

      item.status = "NOT_APPLICABLE";
      request.recomputeStatus();
      await request.save();

      return res.json({ success: true, request: publicRequest(request) });
    } catch (err) {
      console.error("withdraw access item error:", err);
      return res.status(500).json({ success: false, error: "server_error" });
    }
  }
);

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/access-requests/:orderKind/:orderId/cancel   (creator)
   Close the whole checklist — everything arrived by other means, or the ask
   turned out to be unnecessary.
   ══════════════════════════════════════════════════════════════════════════ */
router.post("/:orderKind/:orderId/cancel", requireAuth, async (req, res) => {
  try {
    const ctx = await loadContext(req);
    if (ctx.error) return res.status(ctx.error.code).json(ctx.error.body);

    const { cfg, orderId, isSeller } = ctx;
    if (!isSeller) return res.status(403).json({ success: false, error: "seller_only" });

    const request = await AccessRequest.findOne({ [cfg.idField]: orderId });
    if (!request) return res.status(404).json({ success: false, error: "request_not_found" });

    /* Bank any open blocking interval BEFORE cancelling — recomputeStatus()
       returns early on a cancelled request, so closing the interval afterwards
       would silently discard the time the client had already held things up. */
    request.recomputeStatus();
    if (request.blockedSince) {
      const hours = (Date.now() - new Date(request.blockedSince).getTime()) / 36e5;
      request.blockedHours = Math.max(0, request.blockedHours + Math.floor(hours));
      request.blockedSince = null;
    }

    request.status = "CANCELLED";
    request.cancelledAt = new Date();
    await request.save();

    return res.json({ success: true, request: publicRequest(request) });
  } catch (err) {
    console.error("cancel access request error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
module.exports.ASSET_MAX_BYTES = ASSET_MAX_BYTES;
/* Exported for the order routes, which attach a compact form of the checklist to
   their responses so the agreement's Schedule C and the welcome doc can render
   it without a second round trip. */
module.exports.publicItem = publicItem;
module.exports.looksLikeSecret = looksLikeSecret;
