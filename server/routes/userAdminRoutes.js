// routes/userAdminRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

/* These were pass-through stubs — `(req, res, next) => next()` — left behind a
   "replace with your real middlewares" note. The route below listed both and
   enforced neither, so GET /api/user answered with every account's email, name,
   role, plan and kycStatus to unauthenticated callers, and `?limit=1000`
   returned the whole table at once.

   Imported now, never redeclared. See middleware/requireAdmin.js. */
const { requireAuth } = require("../utils/auth");
const { requireAdmin } = require("../middleware/requireAdmin");

/**
 * ✅ GET /api/user?limit=10&page=1&search=
 * - limit not provided => default 10
 * - limit=0 => fetch all
 */
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const rawLimit = req.query.limit;
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const search = (req.query.search || "").toString().trim();

    let limit = rawLimit === undefined ? 10 : Math.max(parseInt(rawLimit, 10), 0);
    if (limit > 100) limit = 100;

    const query = {
      ...(search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
    };

    let q = User.find(query)
      .select(
        "name email avatarUrl isVerified userType role plan subscriptionStatus createdAt lastLoginAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    if (limit > 0) q = q.skip((page - 1) * limit).limit(limit);

    const users = await q;
    const total = await User.countDocuments(query);

    return res.json({
      success: true,
      users,
      pagination: {
        total,
        page,
        limit: limit === 0 ? total : limit,
        totalPages: limit === 0 ? 1 : Math.ceil(total / limit),
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e?.message || "Server error" });
  }
});

module.exports = router;
