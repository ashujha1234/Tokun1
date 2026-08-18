// routes/authRoutes.js
const express = require("express");
const dns = require("dns").promises;
const { siteUrl } = require("../utils/siteUrl");
const crypto = require("crypto");
const {rateLimit , ipKeyGenerator }= require("express-rate-limit");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendEmail } = require("../utils/SendEmail"); // ← make sure filename & path match exactly
const { attachReferral } = require("../services/referral.service");
const Organization = require("../models/organization");
const { requireAuth } = require("../utils/auth");
const { signUserToken, shouldRenew, USER_TOKEN_TTL } = require("../utils/authTokens");
const { ensureMonthlyQuota } = require("../utils/quota");
const { buildOtpEmailHtml } = require("../utils/otpemailtemplate"); // adjust path
const {applyUserPlan} = require("../service/billing");
const { logActivity } = require("../utils/activityLogger");
const passport = require("passport");
const path = require("path");

const router = express.Router();

/* ----------------------- Shared helpers ----------------------- */
// const otpLimiter = rateLimit({
//   windowMs: 10 * 60 * 1000,
//   max: 5,
//   standardHeaders: true,
//   legacyHeaders: false,
//   keyGenerator: (req) => `${req.ip}:${(req.body.email || "").toLowerCase().trim()}`,
//   message: { success: false, error: "too_many_requests" },
// });



const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    return `${ipKeyGenerator(req)}:${(req.body.email || "").toLowerCase().trim()}`;
  },
  message: { success: false, error: "too_many_requests" },
});
function gen4DigitOtp() {
  return String(Math.floor(1000 + Math.random() * 9000)); // 1000..9999
}
function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

// Basic RFC-ish email format check — rejects obviously-fake input (missing
// "@", missing domain/dot, spaces) before we ever attempt to send an OTP.
const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmailFormat(email) {
  return typeof email === "string" && EMAIL_FORMAT_REGEX.test(email.trim());
}

// Common one-letter-off misspellings of major providers. These domains often
// exist (typo-squatters run catch-all mail servers on them), so an MX lookup
// alone won't catch them — only a direct name match will.
const COMMON_TYPO_DOMAINS = {
  "gmai.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmali.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmailc.om": "gmail.com",
  "gnail.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahho.com": "yahoo.com",
  "yhoo.com": "yahoo.com",
  "outlok.com": "outlook.com",
  "outllook.com": "outlook.com",
  "hotmial.com": "hotmail.com",
  "hotmil.com": "hotmail.com",
  "iclod.com": "icloud.com",
  "icoud.com": "icloud.com",
};

// DNS lookups can occasionally hang — never let a single check block the
// request past a few seconds.
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("dns_timeout")), ms)),
  ]);
}

// TEMPORARY test bypass — remove this block once testing with these
// addresses is done. They'd otherwise be rejected by COMMON_TYPO_DOMAINS.
const TEMP_ALLOWED_TEST_EMAILS = new Set([
  "rasu@gmai.com",
]);

/**
 * Full pre-send check: format -> known-typo-domain -> real MX records.
 * Returns { ok: true } or { ok: false, error, suggestion? }.
 */
async function checkEmailDeliverable(email) {
  if (!isValidEmailFormat(email)) {
    return { ok: false, error: "invalid_email_format" };
  }

  const normalized = email.trim().toLowerCase();
  if (TEMP_ALLOWED_TEST_EMAILS.has(normalized)) {
    return { ok: true };
  }

  const domain = normalized.split("@")[1];

  if (COMMON_TYPO_DOMAINS[domain]) {
    return { ok: false, error: "likely_typo_domain", suggestion: COMMON_TYPO_DOMAINS[domain] };
  }

  try {
    const records = await withTimeout(dns.resolveMx(domain), 4000);
    if (!records || records.length === 0) {
      return { ok: false, error: "domain_has_no_mail_server" };
    }
  } catch {
    return { ok: false, error: "domain_has_no_mail_server" };
  }

  return { ok: true };
}

/* ----------------------- SIGNUP (OTP -> verify) ----------------------- */
//comment on 11/09/2025
/*
router.post("/signup/initiate", otpLimiter, async (req, res) => {
  try {
    const { name, email,userType='IND' ,orgName } = req.body; // <— added
    if (!name || !email) {
      return res.status(400).json({ success: false, error: "name_and_email_required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const otp = gen4DigitOtp();
    const otpHash = hashOTP(otp);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // upsert user first
    let user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          name,
          isVerified: false,
          otpHash,
          otpExpiresAt,
          otpAttempts: 0,
          lockedUntil: null,
        },
      },
      { new: true, upsert: true }
    );
    //console.log(user)
const day = new Date().getDate();
  user.registrationDay = day;
    if (userType === "ORG" && orgName && !user.orgId) {
  
  const org = await Organization.create({ name: orgName.trim(), ownerId: user._id });

  user.userType = "ORG";
  user.role = "Owner";
  user.orgId = org._id;
  user.plan=null;
  await user.save();
} else {
  // IND path
  user.userType = "IND";
  user.role = "Self";  // <— previously "TM"; change to SELF (or set to null)
  user.orgId = null;


  await user.save();
}


await sendEmail({
  to: normalizedEmail,
  subject: "Your Tokun.World login code",
  //text: `Hi ${user.name ? user.name.split(" ")[0] : "there"}, your login code is ${otp}. It expires in 5 minutes.`,
  html: buildOtpEmailHtml({
    name: user.name,
    otp,                       // e.g., "4821" or "935612"
    siteUrl: siteUrl(),
  }),
});


   await sendEmail({
      to: normalizedEmail,
      subject: "Your verification code",
      text: `Your verification code is ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family:Inter,system-ui,Arial,sans-serif;color:#111">
          <p>Hi ${name ? String(name).split(" ")[0] : "there"},</p>
          <p>Your verification code is:</p>
          <p style="font-size:24px;font-weight:700;letter-spacing:2px">${otp}</p>
          <p>This code expires in <strong>5 minutes</strong>.</p>
        </div>
      `,
    });

    

    return res.json({ success: true, message: "otp_sent_if_email_is_valid" });
  } catch (err) {
    console.error("signup/initiate", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});
*/






router.post("/signup/initiate", otpLimiter, async (req, res) => {
  try {
    const { email, userType = "IND", orgName } = req.body || {};
    let { name } = req.body || {};

    if (!email) {
      return res.status(400).json({ success: false, error: "email_required" });
    }

    /* A name is needed to CREATE an account. It is not needed to re-send a code
       to one that already exists, and insisting on it broke "Resend code": that
       button re-runs this endpoint with just the email, so every resend came
       back 400 name_and_email_required.

       So the stored name is reused when the caller doesn't send one. Scoped to
       accounts that have not verified yet, which is the only state a resend can
       happen in — this must never let someone re-trigger an OTP for a live
       account by knowing nothing but the address. */
    if (!name) {
      const existing = await User.findOne({
        email: String(email).toLowerCase().trim(),
        isVerified: false,
      })
        .select("name")
        .lean();

      if (!existing?.name) {
        return res.status(400).json({ success: false, error: "name_and_email_required" });
      }
      name = existing.name;
    }
    const emailCheck = await checkEmailDeliverable(email);
    if (!emailCheck.ok) {
      return res.status(400).json(emailCheck.error === "likely_typo_domain"
        ? { success: false, error: emailCheck.error, suggestion: emailCheck.suggestion }
        : { success: false, error: emailCheck.error });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const otp = gen4DigitOtp();
    const otpHash = hashOTP(otp);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // upsert user
    let user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          name,
          isVerified: false,
          otpHash,
          otpExpiresAt,
          otpAttempts: 0,
          lockedUntil: null,
        },
      },
      { new: true, upsert: true }
    );

    // optional debug tracking
    user.registrationDay = new Date().getDate();

  //   if (userType === "ORG" && orgName && !user.orgId) {
  //     // Create org now (you could also defer to /verify)

 
  // // Define default ORG fields
  // const orgData = {
  //   name: orgName.trim(),
  //   ownerId: user._id,
  //   plan: null, // or enterprise/basic depending on your business logic
  //   billingCycle: null,
  //   currentPeriodEnd: null,
  //   orgPoolCap: 0,
  //   orgPoolUsed: 0,
  //   orgExtraTokensRemaining: 0,
  //   totalAssignedCap: 0,
  //   teamMembersLimit: 0, // default number of members for new org
  //   teamMembersLimitRemaining: 0,
  //   members: [],
  //   subscriptionStatus: null,
  //   billingAnchor: new Date(),
  //   graceDays: 7,
  //   lastInvoiceDueAt: null,
  // };

  // const org = await Organization.create(orgData);



  //   //  const org = await Organization.create({ name: orgName.trim(), ownerId: user._id });

  //     user.userType = "ORG";
  //     user.role = "Owner";
  //     user.orgId = org._id;

  //     // ORG owners do not get IND plan automatically
  //     user.plan = null;
  //     user.billingCycle = null;

  //     await org.save();
  //     await user.save();
  //   } else {
  //     // IND path
  //     user.userType = "IND";
  //     user.role = null;   // schema enum allows null
  //     user.orgId = null;

  //     // Don't set plan here. We'll apply 'free' after OTP verification.
  //     await user.save();
  //   }

 // ✅ Fix this part inside /signup/initiate
if (userType === "ORG" && orgName && !user.orgId) {
  // create org for owner
  const org = await Organization.create({
    name: orgName.trim(),
    ownerId: user._id,
    plan: null,
    billingCycle: null,
    currentPeriodEnd: null,
    orgPoolCap: 0,
    orgPoolUsed: 0,
    orgExtraTokensRemaining: 0,
    totalAssignedCap: 0,
    teamMembersLimit: 0,
    teamMembersLimitRemaining: 0,
    members: [],
    subscriptionStatus: null,
    billingAnchor: new Date(),
    graceDays: 7,
    lastInvoiceDueAt: null,
  });

  user.userType = "ORG";
  user.role = "Owner";
  user.orgId = org._id;
  await org.save();
  await user.save();
} else {
  // 🧠 Fix starts here
  // check if this email is already a team member
  const existingTM = await User.findOne({ email: normalizedEmail, userType: "TM" });

  if (existingTM) {
    // ✅ Do NOT overwrite org info
    existingTM.name = name;
    await existingTM.save();
  } else {
    // create as IND user only if NOT a team member
    user.userType = "IND";
    user.role = null;
    user.orgId = null;
    await user.save();
  }
}





    
    await sendEmail({
      to: normalizedEmail,
      subject: "Your Tokun.World login code",
      html: buildOtpEmailHtml({
        name: user.name,
        otp,
        siteUrl: siteUrl(),
      }),
    });




// // ✅ USE REPLACE KARO:
// try {
//   await sendEmail({
//     to: normalizedEmail,
//     subject: "Your Tokun.World login code",
//     html: buildOtpEmailHtml({
//       name: user.name,
//       otp,
//       siteUrl: process.env.SITE_URL || "https://tokun.world",
//     }),
//   });
// } catch (emailErr) {
//   console.error("❌ Email failed (non-fatal):", emailErr?.message);
// }








    return res.json({ success: true, message: "otp_sent_if_email_is_valid" });
  } catch (err) {
    console.error("signup/initiate", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* 
// POST /api/auth/signup/verify -> verify OTP and mark account verified
router.post("/signup/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: "email_and_otp_required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ success: false, error: "invalid_or_expired_otp" });
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(429).json({ success: false, error: "temporarily_locked" });
    }
    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, error: "otp_expired" });
    }
    if (hashOTP(String(otp)) !== user.otpHash) {
      const attempts = (user.otpAttempts || 0) + 1;
      user.otpAttempts = attempts;
      if (attempts >= 5) user.lockedUntil = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      return res.status(400).json({ success: false, error: "invalid_otp" });
    }

    user.isVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    user.lockedUntil = null;
    await user.save();


    const token = jwt.sign(
      { sub: String(user._id), email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


    // inside success response after issuing 'token'
const orgInfo = user.orgId ? { orgId: user.orgId, userType: user.userType, role: user.role } : null;
 
await ensureMonthlyQuota(user);



return res.json({
  success: true,
  message: "verified", // (or omit for login)
  token,
  user: {
    id: user._id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    role: user.role,
    orgId: user.orgId,
    plan: user.plan,
    monthlyTokensRemaining: user.monthlyTokensRemaining,
  },
});
  } catch (err) {
    console.error("signup/verify", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});
*/




router.post("/signup/verify", async (req, res) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: "email_and_otp_required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ success: false, error: "invalid_or_expired_otp" });
    }

    // lockout window
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(429).json({ success: false, error: "temporarily_locked" });
    }
    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, error: "otp_expired" });
    }

    if (hashOTP(String(otp)) !== user.otpHash) {
      const attempts = (user.otpAttempts || 0) + 1;
      user.otpAttempts = attempts;
      if (attempts >= 5) user.lockedUntil = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      return res.status(400).json({ success: false, error: "invalid_otp" });
    }

    // OTP OK
    user.isVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    user.lockedUntil = null;

    // Initialize free plan for IND if not set
    // if (user.userType === "IND" && !user.plan) {
    //   await applyUserPlan(user, "free", "monthly"); // sets monthlyTokensCap, etc.
    // } else {
    //   await user.save();
    // }
   // Initialize free plan for IND if not set
// 🧠 Fix for invited team members
if (user.userType === "TM" && user.orgId) {
  // invited team member - just mark verified, don't touch org or userType
  await user.save();
} else if (user.userType === "IND" && !user.plan) {
  // normal individual signup
  await applyUserPlan(user, "free", "monthly");
} else {
  await user.save();
}

/* Refer & Earn attribution, once, at the moment the account becomes real.

   Attached here rather than at /signup/initiate because an unverified signup
   isn't a person yet — half of them never come back, and crediting a referral
   for one would make the invite count meaningless. Nothing is paid out now
   either: the invite only earns anything once this account makes a prompt sale
   that survives the refund window (cron/referralSettlement.js).

   Best-effort by design — a bad code must never fail a signup. */
try {
  const refCode = req.body?.referralCode || req.body?.ref;
  if (refCode) await attachReferral(user._id, refCode);
} catch (refErr) {
  console.error("Referral attach failed (signup unaffected):", refErr.message);
}

   // signup/verify mein (line ~180 ke aaspaas):
await logActivity({
  type: "USER_REGISTERED",
  title: "New user registered",
  description: `${user.name} joined the platform`,
  actorId: user._id,
  actorName: user.name,
  meta: { email: user.email, userType: user.userType },
});




    // TTL lives in utils/authTokens so signup, login and renew can't drift apart.
    const token = signUserToken(user);

    // Optional org info for UI
   // const orgInfo = user.orgId ? { orgId: user.orgId, userType: user.userType, role: user.role } : null;
   let orgInfo=null;
if (user.orgId) {
  const org = await Organization.findById(user.orgId).lean();
  orgInfo = { ...org, userType: user.userType, role: user.role };
}
    // Compute remaining tokens for IND (if you want to show it)
    let tokensRemaining = null;
    if (user.userType === "IND") {
      tokensRemaining = Math.max(
        0,
        (user.monthlyTokensCap || 0) - (user.monthlyTokensUsed || 0)
      ) + (user.extraTokensRemaining || 0);
    }





    return res.json({
      success: true,
      message: "verified",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        role: user.role,
        orgId: user.orgId,
        plan: user.plan,
        tokensRemaining,
        // The profile photo — see the note on the same field in login/verify.
        // Without it the auth context has no picture, and every screen that
        // draws the signed-in person's own avatar shows an empty frame.
        avatarUrl: user.avatarUrl || null,
        // you can add other safe fields as needed
      },
      user1:user,
      org: orgInfo,
    });
  } catch (err) {
    console.error("signup/verify", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});



/* ----------------------- LOGIN (passwordless OTP) ----------------------- */

// POST /api/auth/login/initiate -> send OTP only if verified account exists
router.post("/login/initiate", otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "email_required" });
    const emailCheck = await checkEmailDeliverable(email);
    if (!emailCheck.ok) {
      return res.status(400).json(emailCheck.error === "likely_typo_domain"
        ? { success: false, error: emailCheck.error, suggestion: emailCheck.suggestion }
        : { success: false, error: emailCheck.error });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ success: false, error: "no_account_or_not_verified" });
    }

    const otp = gen4DigitOtp();
    user.otpHash = hashOTP(otp);
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    user.otpAttempts = 0;
    user.lockedUntil = null;
    await user.save();

await sendEmail({
  to: normalizedEmail,
  subject: "Your Tokun.World login code",
  html: buildOtpEmailHtml({
    name: user.name,
    otp,
    siteUrl: siteUrl(),
  }),

});



// // ✅ REPLACE KARO:
// try {
//   await sendEmail({
//     to: normalizedEmail,
//     subject: "Your Tokun.World login code",
//     html: buildOtpEmailHtml({
//       name: user.name,
//       otp,
//       siteUrl: process.env.SITE_URL || "https://tokun.world",
//     }),
//   });
// } catch (emailErr) {
//   console.error("❌ Email failed (non-fatal):", emailErr?.message);
// }









    

    return res.json({ success: true, message: "otp_sent_if_email_is_valid" });
  } catch (err) {
    console.error("login/initiate", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// POST /api/auth/login/verify -> verify OTP and issue JWT
router.post("/login/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: "email_and_otp_required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ success: false, error: "invalid_or_expired_otp" });
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(429).json({ success: false, error: "temporarily_locked" });
    }
    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, error: "otp_expired" });
    }
    if (hashOTP(String(otp)) !== user.otpHash) {
      const attempts = (user.otpAttempts || 0) + 1;
      user.otpAttempts = attempts;
      if (attempts >= 5) user.lockedUntil = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      return res.status(400).json({ success: false, error: "invalid_otp" });
    }

    /* A suspended account can still sign in.
       It used to be turned away here, which made the suspension unappealable:
       the one place to ask an admin why is the in-app support chat, and you
       need a session to reach it. Suspension is enforced where it belongs —
       blockIfSuspended in utils/auth.js gates buying, selling, services, hire
       and withdrawals — so signing in grants no ability to transact.

       isDeleted still blocks, because a removed account has nothing to come
       back to. */
    if (user.isDeleted) {
      return res.status(403).json({ success: false, error: "account_deleted" });
    }

    // mongoose.connect()-=>{

      // app.listen('port',=>{
        // applyUserPlan.apply()
        // })
      // }

    // success: clear OTP and create JWT
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    user.lockedUntil = null;
    if(!user.isVerified)
      user.isVerified=true;
    await user.save();
   await logActivity({
  type: "USER_LOGIN",
  title: "User logged in",
  description: `${user.name} logged into the platform`,
  actorId: user._id,
  actorName: user.name,
  meta: { email: user.email, ip: req.ip },
});



    // Same signer as signup, so a logged-in session and a just-signed-up one
    // carry the same claims and the same lifetime. This site also used to omit
    // userType/role/orgId from the payload that signup included.
    const token = signUserToken(user);

   // inside success response after issuing 'token'
const orgInfo = user.orgId ? { orgId: user.orgId, userType: user.userType, role: user.role } : null;
await ensureMonthlyQuota(user);

  let organization = null;
    if (user.orgId) {
      organization = await Organization.findById(user.orgId).lean();
    }

  




return res.json({
  success: true,
  message: "verified", // (or omit for login)
  token,
  user: {
    id: user._id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    role: user.role,
    orgId: user.orgId,
    plan: user.plan,
    monthlyTokensRemaining: user.monthlyTokensRemaining,
    // See the note on the same field in signup/verify above.
    avatarUrl: user.avatarUrl || null,
    verified: user.isVerified,
  },
  user1:user,
  organization: organization
});
  } catch (err) {
    console.error("login/verify", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/*
// Add team members (OWNER only)
router.post("/org/members/add", requireAuth, async (req, res) => {
  const todayIST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD

  try {
    // Check if user is org owner
    if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
      return res.status(403).json({ success: false, error: "not_org_owner" });
    }
     if (req.user.plan==null) {
      return res.status(403).json({ success: false, error: "not purchase any plan please subscribe enterprise plan" });
    }

    const { members } = req.body; // array of objects: { name, email, role, tokens }
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ success: false, error: "members_required" });
    }

    // Get org owner tokens
    const orgOwner = await User.findById(req.user._id);
    let availableTokens = orgOwner.monthlyTokensRemaining || 0;

    const results = [];
    for (const m of members) {
      const { name, email, role, tokens } = m;

      if (!email || !role || !tokens || tokens < 0) {
        results.push({ email, success: false, error: "invalid_member_data" });
        continue;
      }

      if (tokens > availableTokens) {
        results.push({ email, success: false, error: "insufficient_org_tokens" });
        continue;
      }

      // Normalize email
      const normEmail = String(email).toLowerCase().trim();

      const member = await User.findOne({ email: normEmail });

      if (member) {
        // Check if user is already IND or belongs to another org
        if (member.userType === "IND") {
          results.push({ email, success: false, error: "user_already_individual" });
          continue;
        }

        if (member.orgId && member.orgId.toString() !== req.user.orgId.toString()) {
          results.push({ email, success: false, error: "user_belongs_to_another_org" });
          continue;
        }

        // If user is already part of this org, do not change role/tokens (optional: can skip)
        results.push({ email, success: false, error: "user_already_in_org" });
        continue;
      }

      // If user does not exist, create placeholder user
      const newMember = await User.create({
        name: name || email.split("@")[0],
        email: normEmail,
        isVerified: false,
        userType: "TM",
        plan: req.user.plan,
        role,
        orgId: req.user.orgId,
        monthlyTokensRemaining: tokens, // org-assigned tokens
        tokensLastResetDateIST: todayIST, // prevent auto-reset to 200 on first login
      });

      availableTokens -= tokens;

      results.push({ email, created: true, attachedToOrg: true, tokens });
    }

    // Update org owner's remaining tokens
    orgOwner.monthlyTokensRemaining = availableTokens;
    await orgOwner.save();

    return res.json({
      success: true,
      orgId: req.user.orgId,
      results,
      orgTokensRemaining: availableTokens,
    });
  } catch (err) {
    console.error("org/members/add", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});
*/















// DELETE all users (⚠️ dangerous - protect this route!)
router.delete("/delete-all", async (req, res) => {
  try {
    // 👉 Optional: Protect with an environment flag
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ success: false, error: "forbidden_in_production" });
    }

    const result = await User.deleteMany({});
    return res.json({
      success: true,
      message: "All users deleted",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("delete-all error", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});



router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/calendar"
    ],
    accessType: "offline",   // 🔥 REQUIRED
    prompt: "consent",       // 🔥 REQUIRED (forces refresh_token)
  })
);

/* ================= GOOGLE CALLBACK ================= */
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    res.send(`
      <script>
        window.opener.postMessage({ success: true }, "*");
        window.close();
      </script>
    `);
  }
);




/* ================= SESSION ================= */
/**
 * GET /api/auth/session — is this session still valid, and does it need a fresh
 * token?
 *
 * This is what makes the long session a SLIDING one. The client calls it on
 * boot, on window focus and on a slow interval; whenever the current token is
 * past half its life it gets replaced. So somebody using Tokun regularly is
 * never logged out, while a session nobody touches for USER_TOKEN_TTL really
 * does expire.
 *
 * requireAuth already rejects an expired or tampered token with 401, so reaching
 * the handler at all means the session is good — the client uses that 401 as its
 * signal to log out cleanly instead of sitting there looking signed in while
 * every other request fails.
 */
router.get("/session", requireAuth, (req, res) => {
  // Admins are deliberately left alone: their tokens are short-lived on purpose
  // and silently extending them would defeat that.
  if (req.isAdmin) {
    return res.json({ success: true, valid: true, renewed: false, isAdmin: true });
  }

  let token = null;
  try {
    // Decoded again rather than threaded through requireAuth, so this stays a
    // self-contained read of iat/exp.
    const raw = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const payload = jwt.decode(raw);
    if (shouldRenew(payload)) token = signUserToken(req.user);
  } catch {
    // Decode problems aren't fatal here — the session is already proven valid by
    // requireAuth; we just don't rotate this time.
  }

  return res.json({
    success: true,
    valid: true,
    renewed: Boolean(token),
    ...(token ? { token } : {}),
    expiresIn: USER_TOKEN_TTL,
  });
});

module.exports = router;


/*
in the above apis still we are only work on free
but free also a have some features and pro and enterprise also 
i want the scenario like if ind updrade to pro added 
 
*/


