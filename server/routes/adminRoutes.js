// // routes/adminRoutes.js (protected! ensure only you can hit this)
// const express = require("express");
// const User = require("../models/User");
// const { getISTDateString } = require("../utils/quota");
// const router = express.Router();

 
// module.exports = router;


const express = require("express");
const bcrypt = require("bcryptjs");
const AdminUser = require("../models/AdminUser");

const router = express.Router();

/**
 * POST /api/admin/auth/login
 * Body: { email, password, remember }
 */
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password required" });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const admin = await AdminUser.findOne({ email: emailNorm });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(String(password), admin.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    console.log("✅ ADMIN LOGIN SUCCESS:", { email: admin.email, id: admin._id.toString() });

    // For now returning simple response (you can add JWT later)
    return res.json({
      success: true,
      message: "Admin login successful",
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("❌ ADMIN LOGIN ERROR:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * POST /api/admin/auth/forgot-password
 * Body: { email }
 * (placeholder for now - later you will send email reset link)
 */
router.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const emailNorm = String(email || "").trim().toLowerCase();

    // Always return success to avoid email enumeration
    console.log("📩 ADMIN FORGOT PASSWORD REQUEST:", emailNorm);

    return res.json({
      success: true,
      message: "If this email exists, a reset link will be sent.",
    });
  } catch (err) {
    console.error("❌ ADMIN FORGOT ERROR:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
