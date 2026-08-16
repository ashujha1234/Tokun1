// Warns subscribers before their plan lapses, and tells them once it has.
//
// Plans on Tokun are paid for a period at a time — there's no stored mandate,
// so nothing renews on its own (see services/subscriptionEmail.service.js).
// That makes the expiry date something the subscriber has to act on, and until
// now nothing told them it was coming. A Pro user's allowance simply dropped to
// the free tier one morning.
//
// No new schema field for "already reminded". Both sweeps use a one-day window
// against a job that runs once a day, so each account falls inside each window
// exactly once. A missed run (server restart at the wrong minute) skips a
// reminder rather than sending duplicates — the right way round for email.

const cron = require("node-cron");
const User = require("../models/User");
/* Lowercase "organization" — that is the actual filename on disk, and every
   other file in the codebase requires it that way.

   Getting the case wrong doesn't fail on macOS, it does something worse: the
   filesystem is case-insensitive so the path resolves, but Node's module cache
   is keyed on the literal path string. "../models/Organization" and
   "../models/organization" become two cache entries, the file is evaluated
   twice, and mongoose.model("Organization", …) runs twice — which throws
   OverwriteModelError at boot. */
const Organization = require("../models/organization");
const { priceFor } = require("../config/plans");
const {
  sendPlanExpiringSoonEmail,
  sendPlanExpiredEmail,
} = require("../services/subscriptionEmail.service");

// Far enough out to act on, close enough to still be relevant.
const REMIND_DAYS_BEFORE = 3;

const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

/** Paid plans only — "free" has no period to run out. */
const PAID_USER_PLANS = ["pro"];

async function remindExpiringUsers() {
  const now = new Date();
  const from = addDays(now, REMIND_DAYS_BEFORE);
  const to = addDays(now, REMIND_DAYS_BEFORE + 1);

  const users = await User.find({
    plan: { $in: PAID_USER_PLANS },
    currentPeriodEnd: { $gte: from, $lt: to },
    isDeleted: { $ne: true },
  })
    .select("name email plan billingCycle currentPeriodEnd")
    .limit(500);

  for (const user of users) {
    try {
      await sendPlanExpiringSoonEmail({
        to: user.email,
        name: user.name,
        plan: user.plan,
        billingCycle: user.billingCycle,
        currentPeriodEnd: user.currentPeriodEnd,
        daysLeft: REMIND_DAYS_BEFORE,
        price: priceFor(user.plan, user.billingCycle || "monthly"),
      });
    } catch (err) {
      console.error(`[SubscriptionExpiry] Reminder failed for ${user._id}:`, err.message);
    }
  }

  return users.length;
}

async function notifyExpiredUsers() {
  const now = new Date();
  const from = addDays(now, -1);

  const users = await User.find({
    plan: { $in: PAID_USER_PLANS },
    currentPeriodEnd: { $gte: from, $lt: now },
    isDeleted: { $ne: true },
  })
    .select("name email plan currentPeriodEnd")
    .limit(500);

  for (const user of users) {
    try {
      await sendPlanExpiredEmail({
        to: user.email,
        name: user.name,
        plan: user.plan,
        endedOn: user.currentPeriodEnd,
      });
    } catch (err) {
      console.error(`[SubscriptionExpiry] Expiry notice failed for ${user._id}:`, err.message);
    }
  }

  return users.length;
}

/**
 * Enterprise lives on the Organization, and the email goes to the owner —
 * they're the only one who can renew it, and they're the one whose team stops
 * getting tokens if they don't.
 */
async function sweepOrganizations() {
  const now = new Date();
  const remindFrom = addDays(now, REMIND_DAYS_BEFORE);
  const remindTo = addDays(now, REMIND_DAYS_BEFORE + 1);

  const expiring = await Organization.find({
    plan: "enterprise",
    currentPeriodEnd: { $gte: remindFrom, $lt: remindTo },
  })
    .select("name ownerId plan billingCycle currentPeriodEnd")
    .populate("ownerId", "name email")
    .limit(200);

  for (const org of expiring) {
    try {
      await sendPlanExpiringSoonEmail({
        to: org.ownerId?.email,
        name: org.ownerId?.name,
        plan: "enterprise",
        billingCycle: org.billingCycle,
        currentPeriodEnd: org.currentPeriodEnd,
        daysLeft: REMIND_DAYS_BEFORE,
        price: priceFor("enterprise", org.billingCycle || "monthly"),
        isOrg: true,
      });
    } catch (err) {
      console.error(`[SubscriptionExpiry] Org reminder failed for ${org._id}:`, err.message);
    }
  }

  const expired = await Organization.find({
    plan: "enterprise",
    currentPeriodEnd: { $gte: addDays(now, -1), $lt: now },
  })
    .select("name ownerId plan currentPeriodEnd")
    .populate("ownerId", "name email")
    .limit(200);

  for (const org of expired) {
    try {
      await sendPlanExpiredEmail({
        to: org.ownerId?.email,
        name: org.ownerId?.name,
        plan: "enterprise",
        endedOn: org.currentPeriodEnd,
        isOrg: true,
      });
    } catch (err) {
      console.error(`[SubscriptionExpiry] Org expiry notice failed for ${org._id}:`, err.message);
    }
  }

  return expiring.length + expired.length;
}

// 09:00 daily — a renewal prompt wants a working morning, not 3am.
cron.schedule("0 9 * * *", async () => {
  try {
    const reminded = await remindExpiringUsers();
    const expired = await notifyExpiredUsers();
    const orgs = await sweepOrganizations();
    if (reminded || expired || orgs) {
      console.log(
        `[SubscriptionExpiry] ${reminded} reminder(s), ${expired} expiry notice(s), ${orgs} org email(s).`
      );
    }
  } catch (err) {
    console.error("[SubscriptionExpiry] Cron job error:", err);
  }
});

module.exports = { remindExpiringUsers, notifyExpiredUsers, sweepOrganizations };
