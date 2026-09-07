/**
 * The activity feed. This is the platform's audit trail: logActivity() writes
 * here on login, purchase, payout and admin action, and each row carries
 * actorId, actorName and a meta blob that includes the actor's email.
 *
 * All three routes in this file were unauthenticated:
 *
 *   GET  /recent       — "temporarily auth hatao test ke liye", left in place.
 *                        Returned actorName/targetName/meta to anyone, and meta
 *                        holds email addresses.
 *   GET  /test-insert   — a manual test route that CREATED a row, on a GET.
 *   POST /log           — accepted type/title/actorName/meta straight from the
 *                        request body, so anyone could forge an entry under any
 *                        name.
 *
 * A forgeable audit log is worse than no audit log, because it gets trusted.
 * That is not hypothetical here: when the users collection was destroyed on
 * 7 Sep 2026, this collection was the only surviving source of user identity
 * and every restored account's email came out of it.
 */

const express = require("express");
const router = express.Router();
const AdminActivity = require("../models/AdminActivity");

const { requireAuth } = require("../utils/auth");
const { requireAdmin } = require("../middleware/requireAdmin");

/* GET /api/activity/recent — admin-only.
   The rows describe other people's actions and carry their emails in `meta`,
   so this is not a feed a normal user may read. Admin rather than merely
   authenticated for that reason. */
router.get("/recent", requireAuth, requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);

    const items = await AdminActivity.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      items: items.map((a) => ({
        _id: String(a._id),
        type: a.type,
        title: a.title,
        description: a.description,
        actorName: a.actorName,
        targetName: a.targetName,
        createdAt: a.createdAt,
        meta: a.meta,
      })),
    });
  } catch (e) {
    console.error("activity/recent error:", e);
    res.status(500).json({ success: false, message: "Failed to fetch" });
  }
});

/* REMOVED: GET /test-insert — created an AdminActivity row on a GET request,
   unauthenticated. Two separate problems: a GET that mutates is reachable from
   any <img> tag or link prefetch, and this one wrote a fake "Test Admin" entry
   into the audit trail. Nothing referenced it. */

/* POST /api/activity/log — the actor is the caller, never the payload.
   It previously took `actorName` and `meta` from the body with no auth at all,
   which let anyone write an entry attributed to anyone. The descriptive fields
   are still caller-supplied (that is what the endpoint is for) but identity is
   now taken from the verified token, and `meta` is namespaced so a client
   cannot overwrite the email/ip the server records. */
router.post("/log", requireAuth, async (req, res) => {
  try {
    const { type, title, description, meta } = req.body;

    const result = await AdminActivity.create({
      type: typeof type === "string" && type.trim() ? type.trim().slice(0, 60) : "OTHER",
      title: typeof title === "string" && title.trim() ? title.trim().slice(0, 200) : "Activity",
      description: typeof description === "string" ? description.trim().slice(0, 1000) : "",
      actorId: req.user._id,
      actorName: req.user.name || req.user.email || null,
      meta: {
        // Server-owned, and last so a client-supplied key of the same name
        // cannot win.
        client: meta && typeof meta === "object" && !Array.isArray(meta) ? meta : {},
        email: req.user.email,
        ip: req.ip,
      },
    });

    res.json({ success: true, id: result._id });
  } catch (e) {
    console.error("activity/log error:", e);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
