// jobs/subscriptionStatusCron.js
const dayjs = require("dayjs");
const User = require("../../models/User");
const Organization = require("../../models/organization");

async function updateSubscriptionStatuses() {
  const now = dayjs().utc();

  // IND
  const users = await User.find({ userType: "IND", plan: { $ne: null }, subscriptionStatus: { $ne: "canceled" } });
  for (const u of users) {
    if (!u.currentPeriodEnd) continue;
    const due = dayjs(u.currentPeriodEnd).utc();

    if (now.isBefore(due)) {
      // current period not due yet
      if (u.subscriptionStatus !== "active") {
        u.subscriptionStatus = "active";
        await u.save();
      }
      continue;
    }

    // due reached/passed
    const graceEnds = due.add(u.graceDays || 7, "day");
    if (now.isBefore(graceEnds)) {
      if (u.subscriptionStatus !== "past_due" && u.subscriptionStatus !== "grace") {
        u.subscriptionStatus = "past_due"; // or "grace" if you prefer
        u.lastInvoiceDueAt = due.toDate();
        await u.save();
      }
    } else {
      if (u.subscriptionStatus !== "suspended") {
        u.subscriptionStatus = "suspended";
        await u.save();
      }
    }
  }

  // ORG
  const orgs = await Organization.find({ plan: "enterprise", subscriptionStatus: { $ne: "canceled" } });
  for (const o of orgs) {
    if (!o.currentPeriodEnd) continue;
    const due = dayjs(o.currentPeriodEnd).utc();

    if (now.isBefore(due)) {
      if (o.subscriptionStatus !== "active") {
        o.subscriptionStatus = "active";
        await o.save();
      }
      continue;
    }

    const graceEnds = due.add(o.graceDays || 7, "day");
    if (now.isBefore(graceEnds)) {
      if (o.subscriptionStatus !== "past_due" && o.subscriptionStatus !== "grace") {
        o.subscriptionStatus = "past_due";
        o.lastInvoiceDueAt = due.toDate();
        await o.save();
      }
    } else {
      if (o.subscriptionStatus !== "suspended") {
        o.subscriptionStatus = "suspended";
        await o.save();
      }
    }
  }
}

module.exports = { updateSubscriptionStatuses };
