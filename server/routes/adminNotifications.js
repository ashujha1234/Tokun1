// routes/adminNotifications.js
//
// Notifications for admins themselves (new prompt reports, AI-flagged
// uploads, etc.) — distinct from the seller/buyer-facing Notification list
// in promptCollab.js's /notifications, since admins live in the AdminUser
// collection, not User (see Notification.receiverAdminId).

const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");
const { requireAuth } = require("../utils/auth");

function requireAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ success: false, error: "forbidden" });
  }
  next();
}

router.use(requireAuth, requireAdmin);

// GET /api/admin/notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find({ receiverAdminId: req.user._id })
      .populate("promptId", "title attachment")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ success: true, notifications });
  } catch (err) {
    console.error("Admin notifications list error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// POST /api/admin/notifications/:id/read
router.post("/:id/read", async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, receiverAdminId: req.user._id },
      { $set: { read: true } },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, error: "not_found" });

    return res.json({ success: true, notification: notif });
  } catch (err) {
    console.error("Admin notification mark-read error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// POST /api/admin/notifications/read-all
router.post("/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { receiverAdminId: req.user._id, read: false },
      { $set: { read: true } }
    );
    return res.json({ success: true });
  } catch (err) {
    console.error("Admin notifications mark-all-read error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
