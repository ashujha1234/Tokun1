// services/billing.js
//const { PLANS } = require("../config/plans");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const { PLANS, priceFor } = require("../config/plans");

function nextPeriodEnd(cycle) {
  return cycle === "yearly"
    ? dayjs().utc().add(1, "year").toDate()
    : dayjs().utc().add(1, "month").toDate();
}

async function applyUserPlan(user, planKey, cycle /* 'monthly' | 'yearly' */) {
  const plan = PLANS[planKey];
  if (!plan || !plan.forIndividual) throw new Error("plan_not_for_individuals");

  user.plan = planKey;                          // 'free' or 'pro'
  user.billingCycle = cycle || "monthly";
  user.currentPeriodEnd = nextPeriodEnd(user.billingCycle);               // optional: set on real payment; or compute next period date
  user.monthlyTokensCap = plan.monthlyTokens;   // e.g., 5,000 for free
  user.monthlyTokensUsed = 0;
  user.extraTokensRemaining = 0;
  user.sectionUsage = {};
  user.historyEntriesThisPeriod = 0;

  await user.save();
  return user;
}





 


function addCycles(date, cycle) {
  return cycle === "yearly"
    ? dayjs(date).utc().add(1, "year").toDate()
    : dayjs(date).utc().add(1, "month").toDate();
}

/** First purchase for IND — sets anchor and due date from now. */
async function startUserPlan(user, planKey, cycle) {
  const plan = PLANS[planKey];
  if (!plan?.forIndividual) throw new Error("plan_not_for_individuals");

  const start = dayjs().utc().toDate();       // first activation time
  const end = addCycles(start, cycle);         // first due date

  user.plan = planKey;                         // 'free' or 'pro'
  user.billingCycle = cycle;
  user.billingAnchor = start;                  // anchor
  user.currentPeriodEnd = end;                 // due date for period 1
  user.subscriptionStatus = "active";

  // IND usage init
  user.monthlyTokensCap = plan.monthlyTokens;
  user.monthlyTokensUsed = 0;
  user.extraTokensRemaining = 0;
  user.sectionUsage = {};
  user.historyEntriesThisPeriod = 0;

  await user.save();
  return user;
}

/** Renew IND plan — extend from previous due date (NOT now). */
async function renewUserPlanFromDue(user) {
  if (!user.plan) throw new Error("no_user_plan");
  if (!user.billingCycle) throw new Error("no_user_cycle");
  if (!user.currentPeriodEnd) throw new Error("no_user_due");

  // Extend due date forward by exactly one cycle from the previous due
  user.currentPeriodEnd = addCycles(user.currentPeriodEnd, user.billingCycle);
  user.subscriptionStatus = "active";

  // reset usage for the new period
  const plan = PLANS[user.plan];
  user.monthlyTokensCap = plan.monthlyTokens;
  user.monthlyTokensUsed = 0;
  user.extraTokensRemaining = 0;
  user.sectionUsage = {};
  user.historyEntriesThisPeriod = 0;

  await user.save();
  return user;
}

/** First purchase for ORG — sets anchor and due date from now. */
async function startOrgEnterprise(org, cycle) {
  console.log("start call")
  const plan = PLANS.enterprise;
    console.log("plan org",plan);

  if (!plan?.forOrganization) throw new Error("plan_not_for_organizations");

  const start = dayjs().utc().toDate();
  const end = addCycles(start, cycle);

  org.plan = "enterprise";
  org.billingCycle = cycle;
  org.billingAnchor = start;
  org.currentPeriodEnd = end;
  org.subscriptionStatus = "active";

  // initialize pool
  org.orgPoolCap = plan.monthlyTokens;         // e.g., 1,000,000
  org.orgPoolUsed = 0;
  org.orgExtraTokensRemaining = 0; 
  org.teamMembersLimit= plan.features.teamMembersLimit;
  org.teamMembersLimitRemaining=plan.features.teamMembersLimit;

 
  await org.save();
  console.log(org);

  return org;
}

/** Renew ORG enterprise — extend from previous due date (NOT now). */
async function renewOrgFromDue(org) {
  if (org.plan !== "enterprise") throw new Error("org_not_enterprise");
  if (!org.billingCycle) throw new Error("no_org_cycle");
  if (!org.currentPeriodEnd) throw new Error("no_org_due");

  org.currentPeriodEnd = addCycles(org.currentPeriodEnd, org.billingCycle);
  org.subscriptionStatus = "active";

  // reset org pool usage; keep caps same (or recalc from plan)
  const plan = PLANS.enterprise;
  console.log("plans details",plan);
  org.orgPoolCap = plan.monthlyTokens; // if plan changed, you could recalc
  org.orgPoolUsed = 0;
  // policy on extras: usually keep extras as-is across periods, or zero if “use it or lose it”
  // org.orgExtraTokensRemaining = 0; 
org.teamMembersLimit=plan.features.teamMembersLimit;
  org.teamMembersLimitRemaining=plan.features.teamMembersLimit;

  // reset each member’s usage to their assigned cap (done in your period reset job)
  // You can do it here if renew runs exactly on billing.

  await org.save();
  return org;
}

module.exports = {
  startUserPlan,
  renewUserPlanFromDue,
  startOrgEnterprise,
  renewOrgFromDue,
  addCycles,
  applyUserPlan
};


 
