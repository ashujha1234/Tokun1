const mongoose = require("mongoose");

const AdminUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    role: { type: String, default: "ADMIN" }, // ADMIN / SUPER_ADMIN (future)
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },

    /* ── Second factor ───────────────────────────────────────────────────────
       A password alone let anyone who had guessed, phished or reused it approve
       refunds, suspend sellers and rule on disputes. The password now only gets
       you a code sent to the admin's mailbox; the code is what gets you a token.

       Stored as a SHA-256 hash, never in the clear: this collection is the one
       an attacker with read access would go for, and a live login code sitting
       in it would be worth as much as the password hash next to it. */
    otpHash: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    /* Wrong codes on the CURRENT challenge. A 6-digit code is a million
       guesses; without a cap, an automated client walks it in an afternoon. */
    otpAttempts: { type: Number, default: 0 },
    /* Throttles "resend" so the box can't be used to mailbomb an admin. */
    lastOtpSentAt: { type: Date, default: null },

    /* ── Password attempts ───────────────────────────────────────────────────
       The rate limiter in front of the route stops a fast attack from one IP.
       This stops a slow one from many: it counts against the ACCOUNT, so a
       distributed guessing run still runs out of attempts. */
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminUser", AdminUserSchema);
