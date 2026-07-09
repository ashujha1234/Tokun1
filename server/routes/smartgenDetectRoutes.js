"use strict";

const express = require("express");
const router  = express.Router();
const { requireAuth } = require("../utils/auth");
const {
  getDetectionResult,
  getDeepQuestions,
  SUBCATEGORIES,
} = require("../skillEngine/skillEngine");

/**
 * GET /api/smartgen-detect?text=...
 * Instant domain detection — runs the same scoring algorithm as the client
 * but server-side. Falls back gracefully if skillEngine errors.
 */
router.get("/", requireAuth, (req, res) => {
  const text = String(req.query.text || "").trim();
  if (!text || text.length < 3) {
    return res.status(400).json({ success: false, error: "text_required" });
  }

  try {
    const result = getDetectionResult(text);
    if (!result || !result.domainId) {
      return res.json({ success: true, data: null });
    }
    return res.json({ success: true, detected: result });
  } catch (err) {
    console.error("[smartgenDetect] getDetectionResult error:", err?.message || err);
    return res.json({ success: true, data: null });
  }
});

/**
 * POST /api/smartgen-detect/deep-questions
 * Body: { userText, domainId, subcategoryId, subcategoryLabel }
 * Returns domain-specific deep-dive questions for Deep Mode.
 */
router.post("/deep-questions", requireAuth, async (req, res) => {
  const {
    userText = "",
    domainId,
    subcategoryId,
    subcategoryLabel,
  } = req.body || {};

  if (!domainId) {
    return res.status(400).json({ success: false, error: "domainId_required" });
  }

  try {
    // getDeepQuestions expects positional args: (userText, domainId, subcategoryId, subcategoryLabel)
    const questions = await getDeepQuestions(
      userText,
      domainId,
      subcategoryId || domainId,
      subcategoryLabel || domainId
    );
    // Frontend reads data?.questions so return { questions: [...] }
    return res.json({ success: true, questions: Array.isArray(questions) ? questions : [] });
  } catch (err) {
    console.error("[smartgenDetect] getDeepQuestions error:", err?.message || err);
    return res.status(500).json({ success: false, error: "deep_questions_failed" });
  }
});

/**
 * GET /api/smartgen-detect/all-subcategories
 * Returns the full subcategory map from skillEngine.
 */
router.get("/all-subcategories", requireAuth, (req, res) => {
  res.json({ success: true, data: SUBCATEGORIES });
});

module.exports = router;
