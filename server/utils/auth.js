// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// async function requireAuth(req, res, next) {
//   try {
//     const auth = req.headers.authorization || "";
//     const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
//     if (!token) return res.status(401).json({ success: false, error: "unauthorized" });
//     const payload = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
//     const user = await User.findById(payload.sub);
//     if (!user) return res.status(401).json({ success: false, error: "unauthorized" });
//     req.user = user;
//     next();
//   } catch {
//     return res.status(401).json({ success: false, error: "unauthorized" });
//   }
// }

// module.exports = { requireAuth };


// utils/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AdminUser = require("../models/AdminUser");

async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, error: "unauthorized" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Admin token — AdminUser se resolve karo
    if (payload.type === "admin") {
      const admin = await AdminUser.findById(payload.sub);
      if (!admin || admin.isActive === false) {
        return res.status(401).json({ success: false, error: "unauthorized" });
      }
      req.user = admin;
      req.isAdmin = true;
      return next();
    }

    // ✅ Normal user token — User se resolve karo
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ success: false, error: "unauthorized" });
    }
    req.user = user;
    req.isAdmin = false;
    return next();
  } catch {
    return res.status(401).json({ success: false, error: "unauthorized" });
  }
}

module.exports = { requireAuth };