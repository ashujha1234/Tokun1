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
  user.subscriptionStatus = "active";
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
  const plan = PLANS.enterprise;

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

/**
 * Repair an individual whose plan is set but whose entitlement isn't.
 *
 * `user.plan` and `user.monthlyTokensCap` are two copies of the same fact: the
 * plan names the cap, and the cap is denormalised onto the user so spending can
 * be checked without a join. Two copies can disagree, and when they did the
 * account lost — a Pro subscriber with `monthlyTokensCap: 0` was shown, and
 * billed for, 0 tokens. Ten paying Pro accounts were in exactly that state:
 * `plan: "pro"`, a `paid` Payment, a correct SubscriptionPeriod, and no cap,
 * no billingCycle, no currentPeriodEnd, no subscriptionStatus.
 *
 * config/plans.js is the source of truth for the cap, and the account's own
 * SubscriptionPeriod is the source of truth for the dates — that row is written
 * from the same in-memory values the user document should have received, so it
 * survives whatever lost them. Neither is guessed.
 *
 * `monthlyTokensUsed` is NOT reset. Repairing an entitlement must never hand
 * back consumption that already happened, or this becomes a way to refill by
 * corrupting a field.
 *
 * Returns { changed, fields } — `changed: false` when there was nothing to fix,
 * so callers can use this on a hot read path without writing on every request.
 *
 * @param {import("mongoose").Document} user  a real User document (not .lean())
 * @param {object|null} latestPeriod          most recent SubscriptionPeriod, if any
 */
async function reconcileUserEntitlement(user, latestPeriod = null) {
  const fields = [];

  // Only paid individual plans. A free user with cap 0 is a separate bug and
  // guessing a paid cap for them would be inventing an entitlement.
  const plan = PLANS[user.plan];
  if (!plan?.forIndividual || user.plan === "free") return { changed: false, fields };

  if (!user.monthlyTokensCap && plan.monthlyTokens) {
    user.monthlyTokensCap = plan.monthlyTokens;
    fields.push(`monthlyTokensCap=${plan.monthlyTokens}`);
  }

  if (!user.billingCycle) {
    user.billingCycle = latestPeriod?.billingCycle || "monthly";
    fields.push(`billingCycle=${user.billingCycle}`);
  }

  /* The period end has to come from the period row when there is one. Computing
     "one cycle from now" instead would silently extend a subscription the
     customer has not paid for — free time for us to give away, and a due date
     that no longer matches the Payment it came from. */
  if (!user.currentPeriodEnd) {
    if (latestPeriod?.periodEnd) {
      user.currentPeriodEnd = latestPeriod.periodEnd;
      fields.push(`currentPeriodEnd=${new Date(latestPeriod.periodEnd).toISOString().slice(0, 10)} (from SubscriptionPeriod)`);
    } else {
      /* No period row either, so there is nothing to anchor to. Left unset on
         purpose: both crons skip a user with no currentPeriodEnd
         (`if (!u.currentPeriodEnd) continue`), so this is inert rather than
         wrong, and it shows up in the backfill report as needing a human. */
      fields.push("currentPeriodEnd=UNRESOLVED (no SubscriptionPeriod to anchor to)");
    }
  }

  if (!user.billingAnchor && latestPeriod?.periodStart) {
    user.billingAnchor = latestPeriod.periodStart;
    fields.push("billingAnchor (from SubscriptionPeriod)");
  }

  /* Only asserted while the period is genuinely current. Marking a lapsed
     subscription "active" would take it out of subscriptionStatusCron's reach
     and give away an unpaid month. */
  if (!user.subscriptionStatus && user.currentPeriodEnd && new Date(user.currentPeriodEnd) > new Date()) {
    user.subscriptionStatus = "active";
    fields.push("subscriptionStatus=active");
  }

  const changed = fields.some((f) => !f.includes("UNRESOLVED"));
  if (changed) await user.save();
  return { changed, fields };
}

module.exports = {
  startUserPlan,
  renewUserPlanFromDue,
  startOrgEnterprise,
  renewOrgFromDue,
  addCycles,
  applyUserPlan,
  reconcileUserEntitlement,
};


 
