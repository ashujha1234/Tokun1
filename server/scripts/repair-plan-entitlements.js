/**
 * Repairs individuals whose plan is set but whose token entitlement is not.
 *
 * The state: `plan: "pro"`, a `paid` Payment, a correct SubscriptionPeriod —
 * and `monthlyTokensCap: 0` with no billingCycle, currentPeriodEnd or
 * subscriptionStatus. Ten paying Pro accounts were found like this. The visible
 * symptom is "Monthly Tokens: 0" on a plan the customer paid ₹799 for, and
 * every token spend refused.
 *
 * The cause is in routes/billingVerify.js and is fixed there: the Payment row
 * was marked paid and SAVED before the plan was provisioned, so anything that
 * threw in between left paid-but-unprovisioned — and the idempotency guard
 * ("already paid → alreadyProcessed") then skipped provisioning on every
 * retry, permanently. That guard now checks for the SubscriptionPeriod instead,
 * and "paid" is written last. This script is for the accounts that were already
 * in the broken state when that fix shipped.
 *
 * It shares reconcileUserEntitlement() with the live read path in
 * routes/quotaRoute.js, deliberately — a repair rule that exists twice is a
 * repair rule that will disagree with itself.
 *
 * What it will NOT do:
 *   - touch a free-plan user (guessing a paid cap invents an entitlement)
 *   - reset monthlyTokensUsed (that would refund consumption already spent)
 *   - invent a currentPeriodEnd when there is no SubscriptionPeriod to anchor
 *     to (it reports those instead — extending a due date is giving away time
 *     nobody paid for)
 *
 * DRY RUN BY DEFAULT. Pass --apply to write.
 *
 *   node scripts/repair-plan-entitlements.js
 *   node scripts/repair-plan-entitlements.js --apply
 */
require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const User = require("../models/User");
const SubscriptionPeriod = require("../models/SubscriptionPeriod");
const Payment = require("../models/Payment");
const { reconcileUserEntitlement } = require("../service/billing");

const APPLY = process.argv.includes("--apply");

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });

  /* Anyone on a paid individual plan missing either half of the entitlement.
     Both halves are checked because they fail together in this bug but not
     necessarily in the next one. */
  const candidates = await User.find({
    userType: "IND",
    plan: { $nin: [null, "free"] },
    $or: [
      { monthlyTokensCap: { $in: [null, 0] } },
      { currentPeriodEnd: null },
      { currentPeriodEnd: { $exists: false } },
      { subscriptionStatus: { $in: [null, undefined] } },
    ],
  });

  if (!candidates.length) {
    console.log("nothing to repair — every paid individual plan has its entitlement.");
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log(`${candidates.length} account(s) with a paid plan and a missing entitlement:\n`);

  let repaired = 0;
  let unresolved = 0;

  for (const user of candidates) {
    const latestPeriod = await SubscriptionPeriod.findOne({
      subjectType: "USER",
      subjectId: user._id,
    })
      .sort({ periodEnd: -1 })
      .lean();

    /* Reported, not required. A paid Payment is the evidence the plan was
       bought, and its absence is worth seeing in this output — an account on a
       paid plan with no paid payment was put there by something other than
       checkout, and repairing its cap would be granting a plan nobody bought.
       It is still repaired (the plan is already set; refusing to give tokens
       for it just leaves a broken account broken), but it is flagged so the
       plan itself can be questioned. */
    const paidPayment = await Payment.findOne({
      userId: user._id,
      kind: "USER",
      status: "paid",
    })
      .sort({ createdAt: -1 })
      .lean();

    const before = {
      cap: user.monthlyTokensCap ?? "(absent)",
      cycle: user.billingCycle ?? "(absent)",
      end: user.currentPeriodEnd ? new Date(user.currentPeriodEnd).toISOString().slice(0, 10) : "(absent)",
      status: user.subscriptionStatus ?? "(absent)",
    };

    /* On a dry run the document's own save is stubbed out, so reconcile runs
       for real and mutates this in-memory copy — the preview below is what it
       actually decided, not a second implementation predicting it. The copy is
       discarded at the end of the loop either way. */
    if (!APPLY) user.save = async () => {};
    const { changed, fields } = await reconcileUserEntitlement(user, latestPeriod);

    console.log(`  ${user.email}`);
    console.log(`    plan=${user.plan}  paidPayment=${paidPayment ? "yes (" + new Date(paidPayment.createdAt).toISOString().slice(0, 10) + ")" : "*** NONE — question the plan itself ***"}`);
    console.log(`    period row=${latestPeriod ? latestPeriod.planKey + "/" + latestPeriod.billingCycle + " ending " + new Date(latestPeriod.periodEnd).toISOString().slice(0, 10) : "*** NONE ***"}`);
    console.log(`    before: cap=${before.cap} cycle=${before.cycle} periodEnd=${before.end} status=${before.status}`);
    console.log(`    ${APPLY ? "applied" : "would set"}: ${fields.length ? fields.join(", ") : "(nothing)"}`);
    console.log(`    monthlyTokensUsed=${user.monthlyTokensUsed ?? 0} — left untouched`);
    console.log("");

    if (fields.some((f) => f.includes("UNRESOLVED"))) unresolved++;
    if (changed) repaired++;
  }

  if (!APPLY) {
    console.log(`DRY RUN — nothing written. ${repaired} account(s) would be repaired.`);
    if (unresolved) {
      console.log(`${unresolved} need a human: no SubscriptionPeriod to take a due date from.`);
    }
    console.log("Re-run with --apply to write.");
  } else {
    console.log(`repaired ${repaired} account(s).`);
    if (unresolved) {
      console.log(`${unresolved} still need a due date set by hand (no SubscriptionPeriod).`);
    }
  }

  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => {
  console.error("repair-plan-entitlements failed:", e?.message || e);
  process.exit(1);
});
