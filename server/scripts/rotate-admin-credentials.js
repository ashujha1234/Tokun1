/**
 * Removes the compromised admin account and rotates the surviving one's
 * password.
 *
 * Why: SECURITY-INCIDENT-2026-09-01.md §1 records that utils/seedAdmin.js
 * carried a plain-text admin email and password, that the file was recreated on
 * every server boot, and that although the credentials moved to environment
 * variables the OLD CONTENT IS STILL READABLE in the pre-rewrite history on a
 * public GitHub repository — and the account was still in the database with
 * that password. Admin access reaches escrow balances and KYC documents.
 *
 * What it does:
 *   1. Deletes the leaked account (default sagar@gmail.com). §5 item 4 of the
 *      incident report offers "change the password, or delete it once a second
 *      admin exists" — a second admin does exist, so deletion is the cleaner
 *      end: it leaves nothing for the leaked credential to unlock.
 *   2. Sets a freshly generated password on the surviving account. Rotated even
 *      though its own password was never in the history, because rotating
 *      JWT_SECRET (the next step, and the thing that actually ends every live
 *      admin session) is a good moment to reset both.
 *   3. Clears failedLoginAttempts and any pending OTP state, so a half-finished
 *      login attempt from before the rotation cannot be completed after it.
 *
 * DRY RUN BY DEFAULT — prints what it would do. Pass --apply to write.
 * Follows the pattern of the rest of scripts/.
 *
 * The generated password is printed ONCE, to stdout, and is not stored
 * anywhere. Put it in a password manager immediately; there is no way to
 * recover it from the database, only to run this again.
 */
require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const APPLY = process.argv.includes("--apply");

const DELETE_EMAIL = (process.env.LEAKED_ADMIN_EMAIL || "sagar@gmail.com").toLowerCase();
const KEEP_EMAIL = (process.env.KEEP_ADMIN_EMAIL || "tokun@gmail.com").toLowerCase();

/* base64url of 18 random bytes — 24 characters, ~144 bits. Deliberately not a
   word-based or pattern-based generator: this is typed once into a password
   manager, never from memory, so memorability buys nothing and costs entropy. */
function generatePassword() {
  return crypto.randomBytes(18).toString("base64url");
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  const admins = mongoose.connection.db.collection("adminusers");

  const all = await admins.find({}).project({ email: 1, role: 1, isActive: 1 }).toArray();
  console.log("admin accounts currently present:");
  all.forEach((a) => console.log("  " + a.email + "  role=" + (a.role || "-") + "  isActive=" + a.isActive));
  console.log("");

  const toDelete = await admins.findOne({ email: DELETE_EMAIL });
  const toKeep = await admins.findOne({ email: KEEP_EMAIL });

  if (!toKeep) {
    console.log("ABORT: keep-account " + KEEP_EMAIL + " not found. Refusing to delete the");
    console.log("       leaked account without a working admin left behind.");
    process.exit(1);
  }
  if (!toKeep.isActive) {
    console.log("ABORT: keep-account " + KEEP_EMAIL + " has isActive=false, so it cannot log in");
    console.log("       (adminRoutes.js login rejects inactive accounts). Fix that first.");
    process.exit(1);
  }

  console.log("plan:");
  console.log("  DELETE  " + DELETE_EMAIL + (toDelete ? "" : "   (already absent — nothing to do)"));
  console.log("  ROTATE  " + KEEP_EMAIL + "   new 24-char password, clear failedLoginAttempts + OTP state");
  console.log("");

  if (!APPLY) {
    console.log("DRY RUN — nothing written. Re-run with --apply.");
    process.exit(0);
  }

  const password = generatePassword();
  const passwordHash = await bcrypt.hash(password, 10);

  if (toDelete) {
    await admins.deleteOne({ _id: toDelete._id });
    console.log("deleted: " + DELETE_EMAIL);
  }

  await admins.updateOne(
    { _id: toKeep._id },
    {
      $set: {
        passwordHash,
        failedLoginAttempts: 0,
        /* Cleared too, which it wasn't. The counter and the lock are two
           separate fields in adminRoutes.js: hitting MAX_PASSWORD_ATTEMPTS sets
           `lockedUntil` and RESETS `failedLoginAttempts` to 0 — so a locked
           account has a zero counter, and zeroing the counter alone left the
           lock standing. Anyone running this script BECAUSE they were locked
           out got a brand-new password and a 429 for the rest of the lock. */
        lockedUntil: null,
        otpHash: null,
        otpExpiresAt: null,
        otpAttempts: 0,
        updatedAt: new Date(),
      },
    }
  );
  console.log("rotated: " + KEEP_EMAIL);

  console.log("");
  console.log("=".repeat(64));
  console.log("  ADMIN LOGIN");
  console.log("  email    : " + KEEP_EMAIL);
  console.log("  password : " + password);
  console.log("=".repeat(64));
  console.log("Shown once. Store it now — it is not recoverable.");
  console.log("");
  console.log("Login still requires the emailed OTP as a second factor, so this");
  console.log("password alone is not enough to reach the admin panel.");
  console.log("");
  console.log("NEXT, and this is the step that ends existing access: rotate");
  console.log("JWT_SECRET. Until then any admin token issued before now stays");
  console.log("valid for its full 12-hour TTL.");

  process.exit(0);
})().catch((e) => {
  console.log("FAILED: " + String(e.message).slice(0, 300));
  process.exit(1);
});
