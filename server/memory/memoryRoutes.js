/**
 * server/memory/memoryRoutes.js
 *
 * Mirrors the pattern in smartgenRoutes.js: this file ONLY handles CRUD over
 * memory data for transparency/control purposes (view what SmartGen remembers,
 * correct it, or delete it). No generation logic lives here â same separation
 * of concerns your doc calls out for smartgenRoutes.js in Section 14.
 *
 * Mount this in index.js alongside your existing routes, e.g.:
 *   app.use("/api/memory", require("./memory/memoryRoutes"));
 *
 * Assumes `req.userId` (or adapt to however you resolve identity elsewhere â
 * see INTEGRATION.md).
 */

const express = require("express");
const router = express.Router();
const { ProjectMemory, PreferenceMemory, LongTermMemory } = require("./models");

function getUserId(req) {
  // Matches the getUserId() helper in server/index.js â req.user is set by
  // the same requireAuth middleware this router is mounted behind.
  return (
    req.user?.id ||
    (req.user?._id && req.user._id.toString ? req.user._id.toString() : req.user?._id) ||
    req.body?.userId ||
    req.query?.userId ||
    null
  );
}

// GET /api/memory  -> everything SmartGen remembers about this user
router.get("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(400).json({ error: "userId required" });

  const [projects, preferences, longTerm] = await Promise.all([
    ProjectMemory.find({ userId }).sort({ lastMentionedAt: -1 }).lean(),
    PreferenceMemory.findOne({ userId }).lean(),
    LongTermMemory.find({ userId }).lean(),
  ]);

  res.json({ projects, preferences, longTerm });
});

// PATCH /api/memory/project/:id -> user corrects/updates a project memory directly
router.patch("/project/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(400).json({ error: "userId required" });

  const { displayName, summary, details, status } = req.body || {};
  const update = {};
  if (displayName) update.displayName = displayName;
  if (summary) update.summary = summary;
  if (details) update.details = details;
  if (status) update.status = status;

  const doc = await ProjectMemory.findOneAndUpdate(
    { _id: req.params.id, userId },
    { $set: update },
    { new: true }
  );
  if (!doc) return res.status(404).json({ error: "not found" });
  res.json(doc);
});

// DELETE /api/memory/project/:id -> user removes a project memory entirely
router.delete("/project/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(400).json({ error: "userId required" });

  await ProjectMemory.deleteOne({ _id: req.params.id, userId });
  res.json({ deleted: true });
});

// DELETE /api/memory -> full wipe, for users who want a clean slate
router.delete("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(400).json({ error: "userId required" });

  await Promise.all([
    ProjectMemory.deleteMany({ userId }),
    PreferenceMemory.deleteMany({ userId }),
    LongTermMemory.deleteMany({ userId }),
  ]);
  res.json({ deleted: true });
});

module.exports = router;