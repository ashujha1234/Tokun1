/**
 * Why does this account have a welcome discount?
 *
 *   node scripts/checkBuyerDiscount.js someone@example.com
 *
 * READ-ONLY. It writes nothing and changes nothing — it answers the question
 * "was this person actually referred, and if not, where did the credit come
 * from?" by printing the three records that decide it:
 *
 *   User.referredBy      — who the signup was attributed to
 *   Referral             — the row created when a code was accepted
 *   CommissionRebate     — the credit itself, which is what checkout reads
 *
 * The 5% comes from a CommissionRebate of kind "buyer_discount". Only two lines
 * in the codebase create one (services/referral.service.js), and both need a
 * Referral to exist first — so a credit with no referral behind it means either
 * the referral was deleted afterwards, or it was written by something other
 * than that code path.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Referral = require("../models/Referral");
const CommissionRebate = require("../models/CommissionRebate");

const email = (process.argv[2] || "").toLowerCase().trim();

const when = (d) => (d ? new Date(d).toISOString().replace("T", " ").slice(0, 19) : "—");

(async () => {
  if (!email) {
    console.error("Usage: node scripts/checkBuyerDiscount.js <email>");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

  const user = await User.findOne({ email })
    .select("_id name email referredBy referredAt referralCode createdAt")
    .lean();

  if (!user) {
    console.log(`No account for ${email}.`);
    return;
  }

  console.log(`ACCOUNT  ${user.email}  (${user._id})`);
  console.log(`  name         ${user.name || "—"}`);
  console.log(`  signed up    ${when(user.createdAt)}`);
  console.log(`  referredBy   ${user.referredBy || "— (nobody)"}`);
  console.log(`  referredAt   ${when(user.referredAt)}`);

  if (user.referredBy) {
    const referrer = await User.findById(user.referredBy).select("email name").lean();
    console.log(`  referrer     ${referrer?.email || "(user not found)"}`);
  }

  const referrals = await Referral.find({ referredId: user._id }).lean();
  console.log(`\nREFERRAL ROWS  ${referrals.length}`);
  for (const r of referrals) {
    const referrer = await User.findById(r.referrerId).select("email").lean();
    console.log(`  code ${r.code} · status ${r.status} · from ${referrer?.email || r.referrerId} · ${when(r.createdAt)}`);
  }

  const credits = await CommissionRebate.find({ userId: user._id }).lean();
  console.log(`\nCREDITS  ${credits.length}`);
  for (const c of credits) {
    const expired = c.expiresAt && new Date(c.expiresAt) <= new Date();
    console.log(
      `  ${c.kind} · role ${c.role} · status ${c.status}${expired ? " (EXPIRED)" : ""}` +
        (c.kind === "buyer_discount" ? ` · ${c.discountPercent}% up to ₹${c.maxAmount}` : "") +
        ` · expires ${when(c.expiresAt)}` +
        ` · referralId ${c.referralId || "— (none)"}`
    );
  }

  /* The verdict. Checkout only cares about an unspent, unexpired
     buyer_discount — see previewBuyerDiscount / reserveBuyerDiscount. */
  const UNSPENT = ["ACTIVE", "RESERVED"];
  const live = credits.find(
    (c) =>
      c.kind === "buyer_discount" &&
      UNSPENT.includes(c.status) &&
      (!c.expiresAt || new Date(c.expiresAt) > new Date())
  );

  console.log("\nVERDICT");
  if (!live) {
    console.log("  No live welcome discount. Checkout will not offer 5% off.");
  } else if (referrals.length && user.referredBy) {
    console.log("  Discount is legitimate — this account WAS referred, and the credit points at that referral.");
  } else if (!referrals.length) {
    console.log("  ⚠️  A live buyer_discount exists but there is NO Referral row for this account.");
    console.log("      Both code paths that create one require a referral first, so this credit");
    console.log("      did not come from a normal signup-with-code. Check whether the referral was");
    console.log("      deleted after the fact, or the credit was inserted directly.");
  } else {
    console.log("  ⚠️  Referral row(s) exist but User.referredBy is not set — the attach half-completed.");
  }
})()
  .catch((err) => {
    console.error("ERROR:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
