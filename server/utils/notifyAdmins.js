// utils/notifyAdmins.js
//
// Fan-out one Notification per active admin — mirrors the explicit
// per-recipient pattern used everywhere else in this codebase (no
// broadcast/room concept exists for notifications).

const AdminUser = require("../models/AdminUser");
const Notification = require("../models/Notification");

async function notifyAdmins({ type, message, promptId, meta }) {
  const admins = await AdminUser.find({ isActive: true }).select("_id");
  if (!admins.length) return;

  await Notification.insertMany(
    admins.map((admin) => ({
      receiverAdminId: admin._id,
      type,
      promptId,
      message,
      meta: meta || {},
    }))
  );
}

module.exports = { notifyAdmins };
