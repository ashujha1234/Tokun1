// src/routes/orgMembersReassign.js
const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Organization = require("../models/organization");
const { requireAuth } = require("../utils/auth");

router.post("/org/members/reassign", requireAuth, async (req, res) => {
  try {
    if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
      return res.status(403).json({ success: false, error: "not_org_owner" });
    }

    const { email, newCap } = req.body; // absolute new assignedCap
    if (!email || typeof newCap !== "number" || newCap < 0) {
      return res.status(400).json({ success: false, error: "invalid_payload" });
    }

    const org = await Organization.findById(req.user.orgId);
    if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

    const member = await User.findOne({ email: String(email).toLowerCase().trim(), orgId: org._id });
    if (!member || member.userType !== "TM") {
      return res.status(404).json({ success: false, error: "member_not_found" });
    }

    const orgMember = org.members.find((m) => String(m.userId) === String(member._id));
    if (!orgMember) {
      return res.status(404).json({ success: false, error: "org_member_record_missing" });
    }

    const diff = newCap - orgMember.assignedCap;
    const assignable = (org.orgPoolCap + org.orgExtraTokensRemaining) - org.totalAssignedCap;
    if (diff > 0 && diff > assignable) {
      return res.status(400).json({ success: false, error: "insufficient_org_assignable_tokens" });
    }

    // Update org + user mirrors
    orgMember.assignedCap = newCap;
    org.totalAssignedCap += diff;

    const used = member.orgAssignedCap - member.orgTokensRemaining; // consumed so far
    member.orgAssignedCap = newCap;
    member.orgTokensRemaining = Math.max(0, newCap - used);

    await member.save();
    await org.save();

    res.json({
      success: true,
      email,
      newCap,
      orgAssignableRemaining: (org.orgPoolCap + org.orgExtraTokensRemaining) - org.totalAssignedCap,
    });
  } catch (e) {
    console.error("org/members/reassign", e);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
