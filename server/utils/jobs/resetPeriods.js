// src/jobs/resetPeriods.js
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const { getISTDateString } = require("../../utils/quota");
const Organization = require("../../models/organization");
const User = require("../../models/User");
const { PLANS } = require("../../config/plans");

// Run this with node-cron (e.g., every hour): 0 * * * *
async function resetDuePeriods() {
  console.log("reset Due Periods call");
  const now = dayjs().utc().toDate();

  // --- ORGS (you already had this) ---
  const orgs = await Organization.find({ currentPeriodEnd: { $lte: now } });
  for (const org of orgs) {
    const months = org.billingCycle === "yearly" ? 12 : 1;
    org.currentPeriodEnd = dayjs(now).add(months, "month").toDate();

    org.orgPoolUsed = 0;
    // Optional policy: zero out extra tokens if "use-it-or-lose-it"
    // org.orgExtraTokensRemaining = 0;

    const todayIST = getISTDateString();
    for (const m of org.members) {
      m.usedThisPeriod = 0;
      m.sectionUsage = new Map(); // clear map

      const u = await User.findById(m.userId);
      if (u) {
        // refill member’s remaining to assignedCap
        u.orgTokensRemaining = m.assignedCap;
        u.tokensLastResetDateIST = todayIST;
        await u.save();
      }
    }
    await org.save();
  }

  // --- INDIVIDUALS (Free/Pro) ---
  const users = await User.find({
    userType: "IND",
    plan: { $in: ["free", "pro"] },
    currentPeriodEnd: { $lte: now },
  });

  for (const u of users) {
    // Renew period end
    u.currentPeriodEnd = nextPeriodEnd(u.billingCycle || "monthly");

    const plan = PLANS[u.plan];
    // Reset usage counters
    u.monthlyTokensCap = plan.monthlyTokens; // 5000 for free, 100000 for pro
    u.monthlyTokensUsed = 0;
    u.extraTokensRemaining = 0; // optional: carry-over? usually no
    u.sectionUsage = {};        // clear section-wise usage
    u.historyEntriesThisPeriod = 0;

    // Optional: stamp IST day for your own analytics
    u.tokensLastResetDateIST = getISTDateString();

    await u.save();
  }
}

module.exports = { resetDuePeriods };