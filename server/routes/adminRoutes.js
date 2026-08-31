// routes/adminRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
const AdminUser = require("../models/AdminUser");
const { requireAuth } = require("../utils/auth");
const { signAdminToken } = require("../utils/authTokens");
const {
  sendAdminLoginOtpEmail,
  sendAdminLoginAlertEmail,
} = require("../services/adminAuthEmail.service");

const router = express.Router();

/* ══════════════════════════════════════════════════════════════════════════
   ADMIN SIGN-IN: PASSWORD, THEN A CODE

   Signing in used to be one call: correct password in, admin token out. That
   token can approve refunds, suspend sellers, take listings down and rule on
   disputes — everything a password leak buys, it bought immediately.

   Two steps now:

     1. POST /auth/login       email + password  → a 6-digit code is emailed,
                                                   plus a short-lived challenge
                                                   token. NO admin token.
     2. POST /auth/verify-otp  challenge + code  → the admin token.

   The challenge token is what ties the two calls together. Without it, step 2
   would be an open endpoint where anyone could grind codes against an email
   address they don't have the password for.
   ══════════════════════════════════════════════════════════════════════════ */

const ADMIN_OTP_LENGTH = 6;          // a million combinations, not ten thousand
const ADMIN_OTP_TTL_MIN = 5;
const ADMIN_OTP_MAX_ATTEMPTS = 5;    // then the code is burned, not just wrong
const ADMIN_OTP_RESEND_SECONDS = 60;
const CHALLENGE_TTL = `${ADMIN_OTP_TTL_MIN}m`;

// Locks the ACCOUNT after this many wrong passwords, whatever IP they come from.
const MAX_PASSWORD_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const genOtp = () => {
  /* crypto.randomInt, not Math.random. Math.random is seeded predictably enough
     that a login code drawn from it is guessable given a few samples — which is
     an academic worry for a 4-digit user OTP and a real one for the code that
     guards refunds and suspensions. */
  const max = 10 ** ADMIN_OTP_LENGTH;
  return String(crypto.randomInt(0, max)).padStart(ADMIN_OTP_LENGTH, "0");
};

const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");

/* Constant-time compare. A plain === on hashes leaks, by how long it takes to
   fail, how many leading characters matched. */
const otpMatches = (plain, storedHash) => {
  if (!storedHash) return false;
  const a = Buffer.from(hashOtp(plain), "utf8");
  const b = Buffer.from(storedHash, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const clientIp = (req) =>
  (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() ||
  req.ip ||
  req.socket?.remoteAddress ||
  "";

/* Keyed on IP *and* email so one office NAT can't lock out a colleague, and one
   email can't be pounded from a botnet. Same shape as the user OTP limiter in
   routes/authRoutes.js. */
/* `req.ip`, not `req`. ipKeyGenerator takes an IP STRING — handed the request
   object it returns the object, which a template string turns into the literal
   "[object Object]". Every IP on earth collapsed to that one value, so this key
   was effectively email-only: the IP half of the comment above did not hold,
   and a botnet could lock a known admin address out from anywhere. */
const keyByIpAndEmail = (req) =>
  `${ipKeyGenerator(req.ip)}:${String(req.body?.email || "").toLowerCase().trim()}`;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: keyByIpAndEmail,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "too_many_attempts",
    message: "Too many sign-in attempts. Try again in 15 minutes.",
  },
});

/* Tighter than the login limiter: the code is only six digits, so this is the
   endpoint worth grinding. The per-account attempt counter below backs it up.

   `req.ip` — see keyByIpAndEmail above for what the old `ipKeyGenerator(req)`
   did. It was worse here than there: with no template string to stringify it,
   the returned OBJECT went into the store's Map as the key, and a fresh object
   is a fresh key, so every attempt landed in its own bucket. This limiter
   counted to one, forever. On a six-digit code with an eight-attempt cap, that
   is the difference between a locked door and an open one. */
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "too_many_attempts",
    message: "Too many code attempts. Start the sign-in again.",
  },
});

const resendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 4,
  // Same fix as otpLimiter above — this one was counting to one too.
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "too_many_requests", message: "Slow down a moment." },
});

const CHALLENGE_SECRET = () =>
  process.env.ADMIN_OTP_SECRET || process.env.JWT_SECRET;

const signChallenge = (admin) =>
  jwt.sign({ sub: String(admin._id), type: "admin_otp" }, CHALLENGE_SECRET(), {
    expiresIn: CHALLENGE_TTL,
  });

const readChallenge = (token) => {
  try {
    const payload = jwt.verify(String(token || ""), CHALLENGE_SECRET());
    // A full admin token must not be usable here — it would turn step 2 into a
    // way to mint fresh sessions from an old one, forever.
    return payload?.type === "admin_otp" ? payload : null;
  } catch {
    return null;
  }
};

/** Issues the code, stores its hash, emails it. Shared by login and resend. */
async function issueOtp(admin, req) {
  const otp = genOtp();
  admin.otpHash = hashOtp(otp);
  admin.otpExpiresAt = new Date(Date.now() + ADMIN_OTP_TTL_MIN * 60 * 1000);
  admin.otpAttempts = 0;
  admin.lastOtpSentAt = new Date();
  await admin.save();

  /* Outside production, the code also goes to the server terminal.

     Local development is where this flow is most likely to be untestable: the
     mailbox may be shared, the mail may land in spam, or SMTP may not be
     configured on a laptop at all — and without the code there is no way into
     your own admin panel. Never in production, where the terminal is a log
     aggregator plenty of people can read. */
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `\n🔑 [DEV] Admin login code for ${admin.email}: ${otp}  (valid ${ADMIN_OTP_TTL_MIN} min)\n`
    );
  }

  await sendAdminLoginOtpEmail({
    to: admin.email,
    code: otp,
    minutes: ADMIN_OTP_TTL_MIN,
    ip: clientIp(req),
    userAgent: req.headers["user-agent"],
  });
}

/**
 * STEP 1 — POST /api/admin/auth/login
 * Body: { email, password }
 * → { success, otpRequired: true, challengeToken, sentTo }
 *
 * Never returns an admin token. The password is now half a credential.
 */
router.post("/auth/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password required" });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const admin = await AdminUser.findOne({ email: emailNorm });

    /* One message for "no such admin" and "wrong password", as before. Telling
       an attacker which admin emails exist saves them the first half of the job. */
    const invalid = () =>
      res.status(401).json({ success: false, error: "Invalid credentials" });

    if (!admin || !admin.isActive) return invalid();

    // Account-level lock. Survives an attacker rotating IPs, which the rate
    // limiter in front of this route cannot.
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const mins = Math.max(1, Math.ceil((admin.lockedUntil - Date.now()) / 60000));
      return res.status(429).json({
        success: false,
        error: "account_locked",
        message: `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`,
      });
    }

    const ok = await bcrypt.compare(String(password), admin.passwordHash);

    if (!ok) {
      admin.failedLoginAttempts = (admin.failedLoginAttempts || 0) + 1;
      if (admin.failedLoginAttempts >= MAX_PASSWORD_ATTEMPTS) {
        admin.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        admin.failedLoginAttempts = 0;
      }
      await admin.save();
      return invalid();
    }

    // Correct password clears the counter — the lock is for guessing runs, not
    // for someone who fat-fingered it twice and then got it right.
    admin.failedLoginAttempts = 0;
    admin.lockedUntil = null;

    try {
      await issueOtp(admin, req);
    } catch (mailErr) {
      /* Unlike every other email in this codebase, this one is NOT best-effort:
         the code is the second factor. If it couldn't be sent, the admin cannot
         complete the login, and saying "check your email" would strand them
         staring at an empty inbox. */
      console.error("❌ ADMIN OTP EMAIL FAILED:", mailErr?.message || mailErr);
      return res.status(502).json({
        success: false,
        error: "otp_email_failed",
        message: "We couldn't send your login code. Try again in a moment.",
      });
    }

    return res.json({
      success: true,
      otpRequired: true,
      challengeToken: signChallenge(admin),
      // Masked, so a shoulder-surfer doesn't learn the admin address from the
      // screen — it only has to be enough for the admin to know which inbox.
      sentTo: admin.email.replace(/^(.{2}).*(@.*)$/, "$1•••$2"),
      expiresInMinutes: ADMIN_OTP_TTL_MIN,
    });
  } catch (err) {
    console.error("❌ ADMIN LOGIN ERROR:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * STEP 2 — POST /api/admin/auth/verify-otp
 * Body: { challengeToken, otp }
 * → { success, token, admin }
 */
router.post("/auth/verify-otp", otpLimiter, async (req, res) => {
  try {
    const { challengeToken, otp } = req.body || {};

    const challenge = readChallenge(challengeToken);
    if (!challenge) {
      return res.status(401).json({
        success: false,
        error: "challenge_expired",
        message: "That took too long. Enter your password again.",
      });
    }

    const admin = await AdminUser.findById(challenge.sub);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, error: "unauthorized" });
    }

    if (!admin.otpHash || !admin.otpExpiresAt || admin.otpExpiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        error: "otp_expired",
        message: "That code has expired. Ask for a new one.",
      });
    }

    /* Burn the code after N wrong guesses rather than letting the attempt count
       reset with each new request. Six digits is a million combinations, which
       an unattended script gets through — five tries is all a human needs. */
    if ((admin.otpAttempts || 0) >= ADMIN_OTP_MAX_ATTEMPTS) {
      admin.otpHash = null;
      admin.otpExpiresAt = null;
      await admin.save();
      return res.status(401).json({
        success: false,
        error: "otp_attempts_exceeded",
        message: "Too many wrong codes. Start the sign-in again.",
      });
    }

    if (!otpMatches(String(otp || "").trim(), admin.otpHash)) {
      admin.otpAttempts = (admin.otpAttempts || 0) + 1;
      await admin.save();
      const left = Math.max(0, ADMIN_OTP_MAX_ATTEMPTS - admin.otpAttempts);
      return res.status(401).json({
        success: false,
        error: "invalid_otp",
        message: left > 0 ? `Wrong code. ${left} attempt${left === 1 ? "" : "s"} left.` : "Wrong code.",
      });
    }

    // Single use. Without clearing it, the same code works until it expires —
    // including from a second device that intercepted the email.
    admin.otpHash = null;
    admin.otpExpiresAt = null;
    admin.otpAttempts = 0;
    admin.lastLoginAt = new Date();
    await admin.save();

    const token = signAdminToken(admin);

    /* Cheapest intrusion detection available: the real admin sees a sign-in
       they didn't make. Best-effort — the login itself has already succeeded. */
    sendAdminLoginAlertEmail({
      to: admin.email,
      ip: clientIp(req),
      userAgent: req.headers["user-agent"],
      at: admin.lastLoginAt,
    }).catch((e) => console.error("Admin login alert email failed:", e?.message));

    return res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: { id: admin._id, email: admin.email, role: admin.role },
    });
  } catch (err) {
    console.error("❌ ADMIN OTP VERIFY ERROR:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * POST /api/admin/auth/resend-otp
 * Body: { challengeToken }
 *
 * Re-issues against the SAME challenge — you still can't get a code for an
 * account whose password you don't have.
 */
router.post("/auth/resend-otp", resendLimiter, async (req, res) => {
  try {
    const challenge = readChallenge(req.body?.challengeToken);
    if (!challenge) {
      return res.status(401).json({ success: false, error: "challenge_expired" });
    }

    const admin = await AdminUser.findById(challenge.sub);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, error: "unauthorized" });
    }

    // Per-account cooldown on top of the IP limiter, so "resend" can't be held
    // down to flood an admin's inbox.
    const since = admin.lastOtpSentAt ? (Date.now() - admin.lastOtpSentAt.getTime()) / 1000 : 1e9;
    if (since < ADMIN_OTP_RESEND_SECONDS) {
      return res.status(429).json({
        success: false,
        error: "resend_too_soon",
        message: `Wait ${Math.ceil(ADMIN_OTP_RESEND_SECONDS - since)}s before asking for another code.`,
      });
    }

    await issueOtp(admin, req);
    return res.json({ success: true, expiresInMinutes: ADMIN_OTP_TTL_MIN });
  } catch (err) {
    console.error("❌ ADMIN OTP RESEND ERROR:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * POST /api/admin/auth/forgot-password
 * Body: { email }
 * (placeholder for now - later you will send email reset link)
 */
router.post("/auth/forgot-password", async (req, res) => {
  try {
    // Always return success to avoid email enumeration
    return res.json({
      success: true,
      message: "If this email exists, a reset link will be sent.",
    });
  } catch (err) {
    console.error("❌ ADMIN FORGOT ERROR:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * PATCH /api/admin/auth/profile
 * Body: { currentPassword, newEmail?, newPassword? }
 * Requires the admin's current password to change either their email or password.
 */
router.patch("/auth/profile", requireAuth, async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ success: false, error: "forbidden" });
    }

    const { currentPassword, newEmail, newPassword } = req.body || {};

    if (!currentPassword) {
      return res.status(400).json({ success: false, error: "current_password_required" });
    }
    if (!newEmail && !newPassword) {
      return res.status(400).json({ success: false, error: "nothing_to_update" });
    }

    const admin = await AdminUser.findById(req.user._id);
    if (!admin) {
      return res.status(401).json({ success: false, error: "unauthorized" });
    }

    const ok = await bcrypt.compare(String(currentPassword), admin.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, error: "invalid_current_password" });
    }

    if (newEmail) {
      const emailNorm = String(newEmail).trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(emailNorm)) {
        return res.status(400).json({ success: false, error: "invalid_email" });
      }
      if (emailNorm !== admin.email) {
        const existing = await AdminUser.findOne({ email: emailNorm });
        if (existing) {
          return res.status(400).json({ success: false, error: "email_already_in_use" });
        }
        admin.email = emailNorm;
      }
    }

    if (newPassword) {
      if (String(newPassword).length < 8) {
        return res.status(400).json({ success: false, error: "password_too_short" });
      }
      admin.passwordHash = await bcrypt.hash(String(newPassword), 10);
    }

    await admin.save();

    return res.json({
      success: true,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("❌ ADMIN PROFILE UPDATE ERROR:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;