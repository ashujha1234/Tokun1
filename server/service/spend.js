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
    if (section) {
      const prev = m.sectionUsage.get(section) || 0;
      m.sectionUsage.set(section, prev + n);
    }
  }
  await org.save();

  return { ok: true, used: n ,user:user,org:org};
}

// Every error code the three spend functions above can throw, paired with the
// HTTP status and the sentence the seller should actually read. Routes return
// these verbatim instead of collapsing everything into "server_error" — the
// difference between "your org never bought a plan" and "something broke on
// our end" is the difference between a user who can fix it and one who can't.
//
// 402 = billing/quota problem the user can resolve by paying.
// 403 = the account isn't the type this section spends for (a bug, not a plan).
// 404 = the record went missing.
const SPEND_ERRORS = {
  // shared
  user_not_found: { status: 404, message: "We couldn't find your account. Please sign in again." },
  invalid_plan: { status: 402, message: "Your plan is no longer valid. Please choose a plan to continue." },
  invalid_user_type: { status: 403, message: "This account type can't use this feature." },

  // individual
  not_individual: { status: 403, message: "This account isn't an individual account." },
  subscription_inactive: {
    status: 402,
    message: "Your subscription isn't active. Please subscribe to continue.",
  },
  token_quota_exceeded: {
    status: 402,
    message: "You've used all your tokens. Please upgrade your plan or buy extra tokens.",
  },

  // organisation owner
  not_org_owner: { status: 403, message: "Only the organisation owner can spend from the org pool." },
  org_not_found: { status: 404, message: "We couldn't find your organisation." },
  org_subscription_inactive: {
    status: 402,
    message:
      "Your organisation hasn't purchased a plan yet. Please buy an Enterprise plan to continue.",
  },
  org_pool_exhausted: {
    status: 402,
    message:
      "Your organisation has used all of its tokens. Please buy extra tokens or upgrade the plan.",
  },

  // team member
  not_team_member: { status: 403, message: "This account isn't a team member of any organisation." },
  member_cap_exceeded: {
    status: 402,
    message:
      "You've used all the tokens assigned to you. Please ask your organisation owner for more.",
  },
};

// Read-only twin of the spend functions: runs the same eligibility gates but
// writes nothing. Called before the LLM request so a user who cannot pay is
// stopped *before* we spend money generating output they'd never be charged
// for — the old order ran the model first and only discovered the problem on
// save, leaving an optimised prompt on screen that was never recorded.
//
// `n` is the expected token cost. It isn't known before the model replies, so
// callers pass 0 (or a rough estimate) — the cap arithmetic still catches an
// already-exhausted pool, which is the case that matters here.
async function assertCanSpend(userId, n = 0) {
  const user = await User.findById(userId).lean();
  if (!user) throw new Error("user_not_found");

  if (user.userType === "IND") {
    if (!PLANS[user.plan]) throw new Error("invalid_plan");
    if (!isActiveOrGrace(user.subscriptionStatus)) throw new Error("subscription_inactive");
    const headroom =
      Number(user.extraTokensRemaining || 0) +
      Math.max(0, Number(user.monthlyTokensCap || 0) - Number(user.monthlyTokensUsed || 0));
    if (headroom < Math.max(n, 1)) throw new Error("token_quota_exceeded");
    return { ok: true };
  }

  if (user.userType === "TM") {
    if (!user.orgId) throw new Error("not_team_member");
    if (Number(user.orgTokensRemaining || 0) < Math.max(n, 1)) throw new Error("member_cap_exceeded");

    const org = await Organization.findById(user.orgId).lean();
    if (!org) throw new Error("org_not_found");
    // A team member's own allowance is meaningless if the org never paid, so
    // the org's subscription is checked here too — spendTokensForTeamMember
    // reaches the same conclusion via the pool cap, but this names the cause.
    if (org.plan !== "enterprise" || !isActiveOrGrace(org.subscriptionStatus)) {
      throw new Error("org_subscription_inactive");
    }
    const available = Number(org.orgPoolCap || 0) + Number(org.orgExtraTokensRemaining || 0);
    if (Number(org.orgPoolUsed || 0) + Math.max(n, 1) > available) throw new Error("org_pool_exhausted");
    return { ok: true };
  }

  if (user.userType === "ORG" && user.role === "Owner") {
    if (!user.orgId) throw new Error("not_org_owner");
    const org = await Organization.findById(user.orgId).lean();
    if (!org) throw new Error("org_not_found");
    if (org.plan !== "enterprise" || !isActiveOrGrace(org.subscriptionStatus)) {
      throw new Error("org_subscription_inactive");
    }
    const available = Number(org.orgPoolCap || 0) + Number(org.orgExtraTokensRemaining || 0);
    if (Number(org.orgPoolUsed || 0) + Math.max(n, 1) > available) throw new Error("org_pool_exhausted");
    return { ok: true };
  }

  throw new Error("invalid_user_type");
}

// Which "you're out of tokens" error belongs to which account type, so a fully
// exhausted account reports the same code here that the spend functions and
// assertCanSpend would have produced.
const TYPE_QUOTA_ERROR = {
  IND: "token_quota_exceeded",
  TM: "member_cap_exceeded",
  ORG: "org_pool_exhausted",
};

/**
 * How many tokens this account could still spend right now.
 *
 * Same arithmetic assertCanSpend uses to decide whether to let a request
 * through, pulled out so spendTokensForUser can also use it to size a final
 * charge. Returns 0 for an account that cannot spend at all; the caller is
 * expected to have run assertCanSpend already, so this does not re-check
 * subscription state.
 */
async function headroomFor(user) {
  if (user.userType === "IND") {
    return (
      Number(user.extraTokensRemaining || 0) +
      Math.max(0, Number(user.monthlyTokensCap || 0) - Number(user.monthlyTokensUsed || 0))
    );
  }

  if (user.userType === "TM" || (user.userType === "ORG" && user.role === "Owner")) {
    if (!user.orgId) return 0;
    const org = await Organization.findById(user.orgId).lean();
    if (!org) return 0;
    const poolLeft = Math.max(
      0,
      Number(org.orgPoolCap || 0) + Number(org.orgExtraTokensRemaining || 0) - Number(org.orgPoolUsed || 0)
    );
    // A team member is capped by their own allowance as well as the pool.
    if (user.userType === "TM") return Math.min(Number(user.orgTokensRemaining || 0), poolLeft);
    return poolLeft;
  }

  return 0;
}

/**
 * Dispatches to whichever of the three spend functions above fits this account.
 *
 * The account-type branch used to be written out by hand at each call site. That
 * was survivable while POST /api/smartgen was the only place that spent, but the
 * metering has moved to the endpoint that actually calls the model
 * (/api/smartgen/stream), and two hand-written copies of the same branch is how
 * one of them ends up missing the ORG-owner case.
 *
 * ── Why this clamps, and the three functions it calls do not ────────────────
 *
 * The functions above are all-or-nothing: ask for more than the account has and
 * they throw, deducting nothing. That is the right shape when the amount is
 * known before the work happens, and the wrong one here, because the true cost
 * of a generation is only known after the model has already replied and been
 * paid for.
 *
 * Left unclamped it opens a loop. assertCanSpend admits anyone with at least one
 * token left. A user sitting on 100 tokens asks for a run costing 3,000; the
 * charge throws; nothing is deducted; they still have 100 tokens and can repeat
 * it forever — unlimited free generation for anyone near their cap.
 *
 * So an overage is charged down to zero instead of being refused. The user
 * overshoots their last run — which they always could, since nobody knows the
 * cost in advance — and then has nothing left, so the next assertCanSpend stops
 * them at the door. The shortfall is logged rather than swallowed: a run that
 * routinely costs more than a whole plan is a pricing signal, not a billing
 * detail.
 */
async function spendTokensForUser(userId, n, section) {
  const user = await User.findById(userId).lean();
  if (!user) throw new Error("user_not_found");

  const amount = Math.max(0, Math.floor(Number(n) || 0));
  if (amount === 0) return { ok: true, used: 0 };

  const headroom = await headroomFor(user);
  const charge = Math.min(amount, headroom);

  if (charge <= 0) throw new Error(TYPE_QUOTA_ERROR[user.userType] || "invalid_user_type");
  if (charge < amount) {
    console.warn(
      `[spend] ${section || "usage"}: user ${userId} used ${amount} tokens with ${headroom} left — charged ${headroom}, ${amount - headroom} unbilled.`
    );
  }

  if (user.userType === "IND") return spendTokensForIndividual(userId, charge, section);
  if (user.userType === "TM") return spendTokensForTeamMember(userId, charge, section);
  if (user.userType === "ORG" && user.role === "Owner") {
    return spendTokensForOrgOwner(userId, charge, section);
  }
  throw new Error("invalid_user_type");
}

module.exports = {
  spendTokensForIndividual,
  spendTokensForTeamMember,
  spendTokensForOrgOwner,
  spendTokensForUser,
  assertCanSpend,
  SPEND_ERRORS,
};
























