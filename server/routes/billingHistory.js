// routes/billingHistory.js
const express = require("express");
const router = express.Router();

const { requireAuth } = require("../utils/auth");
const SubscriptionPeriod = require("../models/SubscriptionPeriod");
const User = require("../models/User");

router.get("/", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ success: false, error: "user_not_found" });

    const scope = req.query.scope || "all"; // 'all' | 'user' | 'org'

    const filters = [];
    if (scope === "user" || scope === "all") {
      filters.push({ subjectType: "USER", subjectId: user._id });
    }
    if ((scope === "org" || scope === "all") && user.orgId) {
      filters.push({ subjectType: "ORG", subjectId: user.orgId });
    }

    if (filters.length === 0) {
      return res.json({ success: true, items: [] });
    }

    const items = await SubscriptionPeriod.find({ $or: filters })
      .sort({ periodStart: -1 })
      .lean();

    return res.json({ success: true, items });
  } catch (e) {
    console.error("GET /billing/history", e);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
