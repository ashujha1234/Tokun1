// src/routes/orgMembersRevoke.js
const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Organization = require("../models/organization");
const { requireAuth } = require("../utils/auth");

router.post("/org/members/revoke", requireAuth, async (req, res) => {
  try {
    if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
      return res.status(403).json({ success: false, error: "not_org_owner" });
    }
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "email_required" });

    const org = await Organization.findById(req.user.orgId);
    if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

    const member = await User.findOne({ email: String(email).toLowerCase().trim(), orgId: org._id });
    if (!member || member.userType !== "TM") {
      return res.status(404).json({ success: false, error: "member_not_found" });
    }

    const assignedCap = member.orgAssignedCap;

    org.members = org.members.filter((m) => String(m.userId) !== String(member._id));
    org.totalAssignedCap -= assignedCap;

    await org.save();

    member.userType = "IND";
    member.role = null;
    member.orgId = null;
    member.orgAssignedCap = 0;
    member.orgTokensRemaining = 0;
    await member.save();

    res.json({
      success: true,
      email,
      freedCap: assignedCap,
      orgAssignableRemaining: (org.orgPoolCap + org.orgExtraTokensRemaining) - org.totalAssignedCap,
    });
  } catch (e) {
    console.error("org/members/revoke", e);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
