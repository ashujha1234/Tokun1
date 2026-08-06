// routes/adminRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const AdminUser = require("../models/AdminUser");
const { requireAuth } = require("../utils/auth");
const { signAdminToken } = require("../utils/authTokens");

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

    // ✅ Admin JWT — "type: admin" se requireAuth ise AdminUser samajhta hai.
    // TTL is now 12h (was 7d). An admin can approve refunds, suspend sellers and
    // remove listings, so a stolen admin token is worth much more than a user's
    // and must not stay valid for a week. Admin sessions are not auto-renewed.
    const token = signAdminToken(admin);

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

/**
 * PATCH /api/admin/auth/profile
 * Body: { currentPassword, newEmail?, newPassword? }
 * Requires the admin's current password to change either their email or password.
 */
router.patch("/auth/profile", requireAuth, async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ success: false, error: "forbidden" });
    }

    const { currentPassword, newEmail, newPassword } = req.body || {};

    if (!currentPassword) {
      return res.status(400).json({ success: false, error: "current_password_required" });
    }
    if (!newEmail && !newPassword) {
      return res.status(400).json({ success: false, error: "nothing_to_update" });
    }

    const admin = await AdminUser.findById(req.user._id);
    if (!admin) {
      return res.status(401).json({ success: false, error: "unauthorized" });
    }

    const ok = await bcrypt.compare(String(currentPassword), admin.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, error: "invalid_current_password" });
    }

    if (newEmail) {
      const emailNorm = String(newEmail).trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(emailNorm)) {
        return res.status(400).json({ success: false, error: "invalid_email" });
      }
      if (emailNorm !== admin.email) {
        const existing = await AdminUser.findOne({ email: emailNorm });
        if (existing) {
          return res.status(400).json({ success: false, error: "email_already_in_use" });
        }
        admin.email = emailNorm;
      }
    }

    if (newPassword) {
      if (String(newPassword).length < 8) {
        return res.status(400).json({ success: false, error: "password_too_short" });
      }
      admin.passwordHash = await bcrypt.hash(String(newPassword), 10);
    }

    await admin.save();

    return res.json({
      success: true,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("❌ ADMIN PROFILE UPDATE ERROR:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;