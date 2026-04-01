const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: "unauthorized" });
    const payload = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ success: false, error: "unauthorized" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, error: "unauthorized" });
  }
}

module.exports = { requireAuth };
