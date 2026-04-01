// src/services/spend.js
const User = require("../models/User");
const Organization = require("../models/organization");
const { PLANS } = require("../config/plans");



function isActiveOrGrace(status) {
  // choose your policy:
  // return status === "active" || status === "grace";
  return status === "active"; // STRICT: block in grace too
}
// INDIVIDUAL SPEND
async function spendTokensForIndividual(userId, n, section) {
  const user = await User.findById(userId);
  if (!user) throw new Error("user_not_found");
  if (user.userType !== "IND") throw new Error("not_individual");

  const plan = PLANS[user.plan];
  if (!plan) throw new Error("invalid_plan");
if (!isActiveOrGrace(user.subscriptionStatus)) {
    throw new Error("subscription_inactive");
  }
  let remaining = n;

  // Use extra tokens first
  if (user.extraTokensRemaining > 0) {
    const take = Math.min(user.extraTokensRemaining, remaining);
    user.extraTokensRemaining -= take;
    remaining -= take;
  }

  // Then monthly cap
  if (remaining > 0) {
    if (user.monthlyTokensUsed + remaining > user.monthlyTokensCap) {
      throw new Error("token_quota_exceeded");
    }
    user.monthlyTokensUsed += remaining;
  }

  // Section-wise tracking (if plan supports it)
  if (plan.features.usageModes.includes("sectionWise") && section) {
    const prev = user.sectionUsage.get(section) || 0;
    user.sectionUsage.set(section, prev + n);
  }

  await user.save();
  console.log(user);
  return { ok: true, used: n ,user: user};
}


// ✅ ORG owner (spend from org pool, NOT individual plan)
async function spendTokensForOrgOwner(userId, n, section) {
  const user = await User.findById(userId);
  if (!user || user.userType !== "ORG" || user.role !== "Owner" || !user.orgId) {
    throw new Error("not_org_owner");
  }

  const org = await Organization.findById(user.orgId);
  if (!org) throw new Error("org_not_found");

  
  // 🚫 Block if org subscription not active
  if (org.plan !== "enterprise" || !isActiveOrGrace(org.subscriptionStatus)) {
    throw new Error("org_subscription_inactive");
  }
  
  const totalAvailable = org.orgPoolCap + org.orgExtraTokensRemaining;
  if (org.orgPoolUsed + n > totalAvailable) throw new Error("org_pool_exhausted");

  org.orgPoolUsed += n;

  // optional: track owner as a member record if present
  const ownerRec = org.members.find((m) => String(m.userId) === String(user._id));
  if (ownerRec) {
    ownerRec.usedThisPeriod += n;
    if (section) {
      if (ownerRec.sectionUsage?.set) {
        const prev = ownerRec.sectionUsage.get(section) || 0;
        ownerRec.sectionUsage.set(section, prev + n);
      } else {
        ownerRec.sectionUsage = ownerRec.sectionUsage || {};
        ownerRec.sectionUsage[section] = (ownerRec.sectionUsage[section] || 0) + n;
      }
    }
  }

  await org.save();
  return { ok: true, used: n ,user: user ,org:org };
}

// TEAM MEMBER SPEND (ORG)
async function spendTokensForTeamMember(userId, n, section) {
  const user = await User.findById(userId);
  if (!user || user.userType !== "TM" || !user.orgId) throw new Error("not_team_member");
console.log(user.orgTokensRemaining);
  if (user.orgTokensRemaining < n) throw new Error("member_cap_exceeded");

  const org = await Organization.findById(user.orgId);
  if (!org) throw new Error("org_not_found");

  const orgTotalAvailable = org.orgPoolCap + org.orgExtraTokensRemaining;
  if (org.orgPoolUsed + n > orgTotalAvailable) throw new Error("org_pool_exhausted");

  // Deduct from member
  user.orgTokensRemaining -= n;
  await user.save();

  // Account in org
  org.orgPoolUsed += n;
  const m = org.members.find((x) => String(x.userId) === String(user._id));
  if (m) {
    m.usedThisPeriod += n;
    console.log("in section");
    console.log(section);
    if (section) {
      const prev = m.sectionUsage.get(section) || 0;
      m.sectionUsage.set(section, prev + n);
    }
  }
  await org.save();

  return { ok: true, used: n ,user:user,org:org};
}

module.exports = {
  spendTokensForIndividual,
  spendTokensForTeamMember,
  spendTokensForOrgOwner
};
























