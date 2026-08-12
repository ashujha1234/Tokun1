// const { requireAuth } = require("../utils/auth");
// const { ensureDailyQuota, spendTokens } = require("../utils/quota");
// const express = require("express");

// const router = express.Router();

// // GET /api/auth/quota -> check today's remaining tokens
// router.get("/", requireAuth, async (req, res) => {
//   try {
    
//     return res.json({
//       user:req.user,
//       success: true,
      
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, error: "server_error" });
//   }
// });
 

// module.exports = router;

const { requireAuth } = require("../utils/auth");
const express = require("express");
const User = require("../models/User");
const Organization = require("../models/organization");
 
const router = express.Router();

const n = (v) => Number(v || 0);

/**
 * The org pool broken down the way an OWNER experiences it.
 *
 * `orgPoolUsed` alone is not what an owner needs. It only moves when someone
 * actually generates, so an owner who assigned 10,000 tokens to a member saw
 * "0 used / 1,000,000 remaining" — even though 10,000 of that pool is now the
 * member's and the owner can neither spend nor reassign it.
 *
 * The number that matters is what's still the OWNER'S to use or hand out:
 *
 *   committed = assignedToMembers + ownerSpend
 *   available = poolTotal - committed
 *
 * ownerSpend has to be backed out of orgPoolUsed rather than read directly,
 * because orgPoolUsed counts BOTH the owner's own generation and every team
 * member's (see spendTokensForTeamMember, which bumps orgPoolUsed as well as
 * decrementing the member). Adding orgPoolUsed to assignedToMembers as-is would
 * charge a member's spend twice — once inside their assigned cap, once again as
 * pool usage.
 *
 * Member spend is derived from live User state (assignedCap − remaining) rather
 * than org.members[].usedThisPeriod, which is period-scoped and would drift
 * against the cumulative orgPoolUsed.
 */
async function summarizeOrgTokens(org) {
  const poolTotal = n(org.orgPoolCap) + n(org.orgExtraTokensRemaining);
  const assignedToMembers = n(org.totalAssignedCap);

  const members = await User.find({ orgId: org._id, userType: "TM" })
    .select({ orgAssignedCap: 1, orgTokensRemaining: 1 })
    .lean();

  const memberSpend = members.reduce(
    (sum, m) => sum + Math.max(0, n(m.orgAssignedCap) - n(m.orgTokensRemaining)),
    0
  );

  const ownerSpend = Math.max(0, n(org.orgPoolUsed) - memberSpend);
  const committed = Math.min(poolTotal, assignedToMembers + ownerSpend);

  return {
    poolTotal,
    assignedToMembers,
    memberSpend,
    ownerSpend,
    // What the owner's widget shows as "Used" — capacity no longer theirs,
    // whether it was spent or handed to a member.
    committed,
    available: Math.max(0, poolTotal - committed),
    // Actual generation across the whole org, kept for reporting.
    totalSpent: n(org.orgPoolUsed),
  };
}

// GET /api/quota → ALWAYS returns FRESH user + org data
router.get("/", requireAuth, async (req, res) => {
  try {
    // FETCH FRESH USER FROM DB
    const user = await User.findById(req.user._id).lean();
    if (!user) {
      return res.status(404).json({ success: false, error: "user_not_found" });
    }
 
    let org = null;
    let orgTokens = null;
    let orgOwner = null;
    if (user.orgId) {
      org = await Organization.findById(user.orgId).lean();
      if (org) {
        orgTokens = await summarizeOrgTokens(org);

        // Who a team member should talk to. Without this the member's side of
        // the app knew it belonged to an org but had no idea who owned it, so it
        // couldn't offer to message them or open their profile.
        if (org.ownerId && String(org.ownerId) !== String(user._id)) {
          // `avatarUrl` is the schema field; `avatar` is selected too only
          // because it was here first and something may still read that key.
          // Selecting `avatar` alone meant the owner's picture was always
          // undefined on the client.
          orgOwner = await User.findById(org.ownerId)
            .select({ name: 1, email: 1, avatar: 1, avatarUrl: 1, role: 1 })
            .lean();
        }
      }
    }

    return res.json({
      success: true,
      user,
      organization: org,
      // Pre-computed so the client doesn't have to re-derive the split (and get
      // the double-count wrong). See summarizeOrgTokens below.
      orgTokens,
      orgOwner,
    });
  } catch (err) {
    console.error("GET /quota error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});
 
module.exports = router;