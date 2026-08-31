const bcrypt = require("bcryptjs");
const AdminUser = require("../models/AdminUser");

/**
 * Create the first admin, if there is no admin at all.
 *
 * ── Why this no longer runs on boot, and no longer has a password in it ──
 *
 * This used to be called from index.js after mongoose.connect(), and it carried
 * a hardcoded email and password in the source. Two consequences, both live in
 * production:
 *
 *   Anyone who could read this repository could sign in to the admin panel of a
 *   platform that holds escrow balances and KYC documents. The credentials were
 *   the same on every deployment and had never been rotated.
 *
 *   Deleting that account did not remove it. The next restart — a deploy, a
 *   scale event, a wake from idle — recreated it with the same password.
 *
 * Now: credentials come from the environment, nothing is seeded unless they are
 * set, and it is never called automatically. Run it deliberately when standing
 * up a NEW environment:
 *
 *     SEED_ADMIN_EMAIL=you@example.com \
 *     SEED_ADMIN_PASSWORD='<a real one>' \
 *     node -e "require('dotenv').config();require('mongoose').connect(process.env.MONGO_URI).then(async()=>{await require('./utils/seedAdmin').seedDefaultAdmin();process.exit(0)})"
 *
 * ⚠️  Existing deployments already have the old account in the database — it is
 *     NOT removed by this change, because deleting the account someone is
 *     currently logged in with is not something a code change should decide.
 *     Change its password, or delete the row once another admin exists.
 */
async function seedDefaultAdmin() {
  const email = String(process.env.SEED_ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "";

  if (!email || !password) {
    console.log(
      "seedDefaultAdmin: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping."
    );
    return { seeded: false, reason: "not_configured" };
  }

  /* Guard on "any admin exists", not "this email exists". The old check was
     per-email, which is what let a deleted account come back: the row was gone,
     so the check passed, so it was recreated. */
  const existing = await AdminUser.countDocuments();
  if (existing > 0) {
    console.log(`seedDefaultAdmin: ${existing} admin(s) already exist — skipping.`);
    return { seeded: false, reason: "already_seeded" };
  }

  const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(10));
  await AdminUser.create({ email, passwordHash, role: "ADMIN" });

  console.log(`seedDefaultAdmin: created admin ${email}`);
  return { seeded: true };
}

module.exports = { seedDefaultAdmin };
