/**
 * Sets a new password on one admin account.
 *
 * Why this exists: there is no other way back in. The admin login page offers a
 * "Forgot password" link, and the endpoint behind it — POST
 * /api/admin/auth/forgot-password in routes/adminRoutes.js — is a stub that
 * returns `{ success: true, message: "If this email exists, a reset link will
 * be sent." }` and sends nothing. The only other password path,
 * PATCH /auth/profile, requires the current password, which is precisely what
 * a locked-out admin does not have.
 *
 * So the account has to be reset against the database directly, and that is
 * what this does — nothing more. It does NOT delete accounts; use
 * scripts/rotate-admin-credentials.js for the incident-response flow.
 *
 * Alongside the password it clears the things that would otherwise block the
 * next sign-in, or let an older half-finished one through:
 *
 *   failedLoginAttempts / lockedUntil  a lockout from the forgotten-password
 *                                      attempts would survive the reset
 *   otpHash / otpExpiresAt / otpAttempts / lastOtpSentAt
 *                                      a code issued before the reset must not
 *                                      still be usable after it
 *
 * DRY RUN BY DEFAULT — prints what it would do and writes nothing. Pass
 * --apply to commit, following the pattern of the rest of scripts/.
 *
 *   node scripts/reset-admin-password.js                          # list accounts
 *   node scripts/reset-admin-password.js --email you@tokun.world  # dry run
 *   node scripts/reset-admin-password.js --email you@tokun.world --apply
 *
 * The new password is generated, printed ONCE to stdout, and stored nowhere.
 * Put it in a password manager before closing the terminal — it cannot be read
 * back out of the database, only replaced by running this again.
 *
 * Pass --password '<your own>' to choose it yourself (minimum 8 characters, the
 * same floor PATCH /auth/profile enforces).
 */
require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")
    ? process.argv[i + 1]
    : null;
};

const APPLY = process.argv.includes("--apply");
const EMAIL = (arg("email") || "").trim().toLowerCase();
const CHOSEN = arg("password");

/* base64url of 18 random bytes — 24 characters, ~144 bits. Same generator as
   rotate-admin-credentials.js: this gets typed into a password manager once,
   never recalled from memory, so memorability buys nothing and costs entropy. */
const generatePassword = () => crypto.randomBytes(18).toString("base64url");

(async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set — run this from server/ with the .env in place.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  const admins = mongoose.connection.db.collection("adminusers");

  const all = await admins
    .find({})
    .project({ email: 1, role: 1, isActive: 1, failedLoginAttempts: 1, lockedUntil: 1 })
    .toArray();

  console.log(`\nadmin accounts (${all.length}):`);
  for (const a of all) {
    const locked = a.lockedUntil && new Date(a.lockedUntil) > new Date() ? ` LOCKED until ${a.lockedUntil}` : "";
    console.log(
      `  ${a.email}  role=${a.role || "-"}  active=${a.isActive}  failed=${a.failedLoginAttempts || 0}${locked}`
    );
  }

  if (!EMAIL) {
    console.log("\nPick one and re-run with --email <address>. Nothing was changed.");
    return mongoose.disconnect();
  }

  const target = await admins.findOne({ email: EMAIL });
  if (!target) {
    console.error(`\nNo admin account with email "${EMAIL}". Nothing was changed.`);
    process.exitCode = 1;
    return mongoose.disconnect();
  }

  if (CHOSEN && String(CHOSEN).length < 8) {
    console.error("\n--password must be at least 8 characters. Nothing was changed.");
    process.exitCode = 1;
    return mongoose.disconnect();
  }

  const password = CHOSEN || generatePassword();

  if (!APPLY) {
    console.log(`\nDRY RUN — would reset the password for ${target.email} and clear its`);
    console.log("lockout and pending-OTP state. Re-run with --apply to commit.");
    return mongoose.disconnect();
  }

  await admins.updateOne(
    { _id: target._id },
    {
      $set: {
        passwordHash: await bcrypt.hash(String(password), 10),
        failedLoginAttempts: 0,
        lockedUntil: null,
        otpHash: null,
        otpExpiresAt: null,
        otpAttempts: 0,
        lastOtpSentAt: null,
      },
    }
  );

  console.log(`\nPassword reset for ${target.email}.`);
  if (!CHOSEN) {
    console.log("\n  new password:  " + password + "\n");
    console.log("Shown once. Save it now — it is not recoverable from the database.");
  }
  console.log(
    "\nSigning in still sends a 6-digit code to this address (ADMIN_OTP), so you need\n" +
      "access to that inbox as well."
  );

  await mongoose.disconnect();
})().catch((err) => {
  console.error("reset failed:", err.message);
  process.exit(1);
});
