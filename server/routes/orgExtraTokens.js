// src/routes/orgExtraTokens.js
const express = require("express");
const router = express.Router();

const Organization = require("../models/organization");
const { PLANS } = require("../config/plans");
const { requireAuth } = require("../utils/auth");

router.post("/org/extra-tokens", requireAuth, async (req, res) => {
  try {
    if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
      return res.status(403).json({ success: false, error: "not_org_owner" });
    }
    if (req.user.plan !== "enterprise") {
      return res.status(403).json({ success: false, error: "enterprise_plan_required" });
    }

    const org = await Organization.findById(req.user.orgId);
    if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

    const plan = PLANS.enterprise;
    const bundle = plan.features.extraTokens.bundle;
    const price = plan.features.extraTokens.price;

    // TODO: charge `price` via your PG
    org.orgExtraTokensRemaining += bundle;
    await org.save();

    res.json({
      success: true,
      added: bundle,
      orgExtraTokensRemaining: org.orgExtraTokensRemaining,
      orgAssignableRemaining: org.orgPoolCap + org.orgExtraTokensRemaining - org.totalAssignedCap,
    });
  } catch (e) {
    console.error("org/extra-tokens", e);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
