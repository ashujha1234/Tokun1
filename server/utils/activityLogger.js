const AdminActivity = require("../models/AdminActivity");

// utils/activityLogger.js — replace karo
const axios = require("axios"); // ya node-fetch

const logActivity = async ({
  type = "OTHER",
  title,
  description = "",
  actorId = null,
  actorName = null,
  targetId = null,
  targetType = null,
  targetName = null,
  meta = {},
}) => {
  try {
    // ✅ Direct DB insert — ye sahi hai
    const AdminActivity = require("../models/AdminActivity");
    await AdminActivity.create({
      type, title, description,
      actorId, actorName,
      targetId, targetType, targetName,
      meta,
    });
    console.log("✅ Activity saved:", type, actorName);
  } catch (e) {
    console.error("❌ activityLogger ERROR:", e.message);
  }
};

module.exports = { logActivity };
