// routes/adminPromptValidation.js
//
// Admin review queue for Prompt-Media Match Validation — the AI score is
// only a signal (see utils/promptMediaValidation.js); the final call to
// approve, reject, or request an edit is always the admin's, regardless of
// score. Mirrors the routes/adminEscrow.js conventions (requireAdmin guard,
// paginated queue-listing shape, actions as dedicated POST routes mutating
// fields embedded directly on the parent document).

const express = require("express");
const router = express.Router();

const Prompt = require("../models/Prompt");
const Notification = require("../models/Notification");
const { requireAuth } = require("../utils/auth");
const { runPromptMediaValidation } = require("../utils/promptMediaValidation");

function requireAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ success: false, error: "forbidden" });
  }
  next();
}

router.use(requireAuth, requireAdmin);

// ════════════════════════════════════════════════════════════════════════════
// GET /api/admin/prompt-validation/queue
// Query: status (pending|approved|pending_review|flagged|admin_approved|
//   admin_rejected|edit_requested|all — default: pending_review+flagged),
//   page, limit, search (title)
// ════════════════════════════════════════════════════════════════════════════
router.get("/queue", async (req, res) => {
  try {
    const { status, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));

    const filter = {};
    if (status && status !== "all") {
      filter["mediaValidation.status"] = status;
    } else if (!status) {
      // Default view: what actually needs a human, not the whole catalog.
      filter["mediaValidation.status"] = { $in: ["pending_review", "flagged"] };
    }
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const [items, total, statsAgg] = await Promise.all([
      Prompt.find(filter)
        .populate("userId", "name email")
        .select("title promptText attachment mediaValidation userId createdAt")
        .sort({ "mediaValidation.checkedAt": -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Prompt.countDocuments(filter),
      Prompt.aggregate([{ $group: { _id: "$mediaValidation.status", count: { $sum: 1 } } }]),
    ]);

    const stats = statsAgg.reduce((acc, s) => {
      acc[s._id || "unset"] = s.count;
      return acc;
    }, {});

    return res.json({
      success: true,
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      stats,
    });
  } catch (err) {
    console.error("Prompt validation queue error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// GET /api/admin/prompt-validation/:promptId — full detail (incl. AI description)
// ════════════════════════════════════════════════════════════════════════════
router.get("/:promptId", async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.promptId).populate("userId", "name email");
    if (!prompt) {
      return res.status(404).json({ success: false, error: "prompt_not_found" });
    }
    return res.json({ success: true, prompt });
  } catch (err) {
    console.error("Prompt validation detail error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// POST /api/admin/prompt-validation/:promptId/approve
// Body: { note? }
// ════════════════════════════════════════════════════════════════════════════
router.post("/:promptId/approve", async (req, res) => {
  try {
    const { note } = req.body;
    const prompt = await Prompt.findById(req.params.promptId);
    if (!prompt) {
      return res.status(404).json({ success: false, error: "prompt_not_found" });
    }

    prompt.mediaValidation.status = "admin_approved";
    prompt.mediaValidation.adminAction = {
      action: "approved",
      note: note || "",
      byAdminId: req.user._id,
      at: new Date(),
    };
    await prompt.save();

    return res.json({ success: true, prompt });
  } catch (err) {
    console.error("Prompt validation approve error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// POST /api/admin/prompt-validation/:promptId/reject
// Body: { note? }
// ════════════════════════════════════════════════════════════════════════════
router.post("/:promptId/reject", async (req, res) => {
  try {
    const { note } = req.body;
    const prompt = await Prompt.findById(req.params.promptId);
    if (!prompt) {
      return res.status(404).json({ success: false, error: "prompt_not_found" });
    }

    prompt.mediaValidation.status = "admin_rejected";
    prompt.mediaValidation.adminAction = {
      action: "rejected",
      note: note || "",
      byAdminId: req.user._id,
      at: new Date(),
    };
    await prompt.save();

    await Notification.create({
      receiverUserId: prompt.userId,
      type: "PROMPT_MEDIA_REVIEW",
      promptId: prompt._id,
      message: `Your prompt "${prompt.title}" was rejected after review${note ? `: ${note}` : "."}`,
      meta: { adminAction: "rejected", note: note || "" },
    });

    return res.json({ success: true, prompt });
  } catch (err) {
    console.error("Prompt validation reject error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// POST /api/admin/prompt-validation/:promptId/request-edit
// Body: { note } — required, tells the seller what to change
// ════════════════════════════════════════════════════════════════════════════
router.post("/:promptId/request-edit", async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || !String(note).trim()) {
      return res.status(400).json({
        success: false,
        error: "note_required",
        message: "Explain what the seller needs to change.",
      });
    }

    const prompt = await Prompt.findById(req.params.promptId);
    if (!prompt) {
      return res.status(404).json({ success: false, error: "prompt_not_found" });
    }

    prompt.mediaValidation.status = "edit_requested";
    prompt.mediaValidation.adminAction = {
      action: "edit_requested",
      note: String(note).trim(),
      byAdminId: req.user._id,
      at: new Date(),
    };
    await prompt.save();

    await Notification.create({
      receiverUserId: prompt.userId,
      type: "PROMPT_MEDIA_REVIEW",
      promptId: prompt._id,
      message: `Your prompt "${prompt.title}" needs changes before it can go live: ${String(note).trim()}`,
      meta: { adminAction: "edit_requested", note: String(note).trim() },
    });

    return res.json({ success: true, prompt });
  } catch (err) {
    console.error("Prompt validation request-edit error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// POST /api/admin/prompt-validation/:promptId/revalidate
// Re-runs the AI pipeline from scratch (e.g. after the seller fixed
// something) — resets to "pending" immediately, actual result lands async.
// ════════════════════════════════════════════════════════════════════════════
router.post("/:promptId/revalidate", async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.promptId);
    if (!prompt) {
      return res.status(404).json({ success: false, error: "prompt_not_found" });
    }

    prompt.mediaValidation.status = "pending";
    prompt.mediaValidation.error = null;
    await prompt.save();

    runPromptMediaValidation(prompt._id).catch((err) =>
      console.error("Prompt re-validation failed:", prompt._id.toString(), err.message)
    );

    return res.json({ success: true, message: "Re-validation started." });
  } catch (err) {
    console.error("Prompt validation revalidate error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
