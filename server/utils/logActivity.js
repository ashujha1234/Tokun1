const Activity = require("../models/AdminActivity");

async function logActivity({
  userId,
  type,
  title,
  description,
  refModel,
  refId,
  meta,
  category,
  orgId,
  req, // optional: pass express req for ip/user-agent
}) {
  if (!userId || !type || !title) return;

  const ip =
    req?.headers?.["x-forwarded-for"]?.toString()?.split(",")?.[0]?.trim() ||
    req?.socket?.remoteAddress;

  const userAgent = req?.headers?.["user-agent"];

  try {
    await Activity.create({
      userId,
      type,
      title,
      description,
      refModel,
      refId,
      meta: meta || {},
      category: category || "general",
      orgId,
      ip,
      userAgent,
    });
  } catch (e) {
    console.error("logActivity failed:", e?.message || e);
  }
}

module.exports = { logActivity };
