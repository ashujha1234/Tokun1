// routes/adminRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
      return res
        .status(400)
        .json({ success: false, error: "Email and password required" });
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

    // ✅ Admin JWT — "type: admin" se requireAuth ise AdminUser samajhta hai
    const token = jwt.sign(
      { sub: admin._id.toString(), type: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Admin login successful",
      token, // 👈 frontend isse localStorage mein save karega
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
    // Always return success to avoid email enumeration
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