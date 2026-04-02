// routes/authRoutes.js
const express = require("express");
const crypto = require("crypto");
const {rateLimit , ipKeyGenerator }= require("express-rate-limit");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendEmail } = require("../utils/SendEmail"); // ← make sure filename & path match exactly
const Organization = require("../models/organization");
const { requireAuth } = require("../utils/auth");
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
  subject: "Your Tokun.ai login code",
  //text: `Hi ${user.name ? user.name.split(" ")[0] : "there"}, your login code is ${otp}. It expires in 5 minutes.`,
  html: buildOtpEmailHtml({
    name: user.name,
    otp,                       // e.g., "4821" or "935612"
    siteUrl: process.env.SITE_URL || "https://tokun.ai",
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

    

    return res.json({ success: true, message: "otp_sent_if_email_is_valid", otp });
  } catch (err) {
    console.error("signup/initiate", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});
*/






router.post("/signup/initiate", otpLimiter, async (req, res) => {
  try {
    const { name, email, userType = "IND", orgName } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ success: false, error: "name_and_email_required" });
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





    Send OTP email
    await sendEmail({
      to: normalizedEmail,
      subject: "Your Tokun.ai login code",
      html: buildOtpEmailHtml({
        name: user.name,
        otp,
        siteUrl: process.env.SITE_URL || "https://tokun.ai",
      }),
    });




// // ✅ USE REPLACE KARO:
// try {
//   await sendEmail({
//     to: normalizedEmail,
//     subject: "Your Tokun.ai login code",
//     html: buildOtpEmailHtml({
//       name: user.name,
//       otp,
//       siteUrl: process.env.SITE_URL || "https://tokun.ai",
//     }),
//   });
// } catch (emailErr) {
//   console.error("❌ Email failed (non-fatal):", emailErr?.message);
// }








    // IMPORTANT: do not return the OTP in production
    return res.json({ success: true, message: "otp_sent_if_email_is_valid" ,otp: otp});
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
      process.env.JWT_SECRET || "devsecret",
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

   // signup/verify mein (line ~180 ke aaspaas):
   console.log("About to log activity for:", user.name);
await logActivity({
  type: "USER_REGISTERED",
  title: "New user registered",
  description: `${user.name} joined the platform`,
  actorId: user._id,
  actorName: user.name,
  meta: { email: user.email, userType: user.userType },
});




    const token = jwt.sign(
      { sub: String(user._id), email: user.email, name: user.name, userType: user.userType, role: user.role, orgId: user.orgId, plan: user.plan },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "7d" }
    );

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
  subject: "Your Tokun.ai login code",
  html: buildOtpEmailHtml({
    name: user.name,
    otp,
    siteUrl: process.env.SITE_URL || "https://tokun.ai",
  }),

});



// // ✅ REPLACE KARO:
// try {
//   await sendEmail({
//     to: normalizedEmail,
//     subject: "Your Tokun.ai login code",
//     html: buildOtpEmailHtml({
//       name: user.name,
//       otp,
//       siteUrl: process.env.SITE_URL || "https://tokun.ai",
//     }),
//   });
// } catch (emailErr) {
//   console.error("❌ Email failed (non-fatal):", emailErr?.message);
// }









    

    return res.json({ success: true, message: "otp_sent_if_email_is_valid" , otp:otp });
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

    // success: clear OTP and create JWT
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    user.lockedUntil = null;
    if(!user.isVerified)
      user.isVerified=true;
    await user.save();
     console.log("=== ABOUT TO LOG ACTIVITY ===");
   await logActivity({
  type: "USER_LOGIN",
  title: "User logged in",
  description: `${user.name} logged into the platform`,
  actorId: user._id,
  actorName: user.name,
  meta: { email: user.email, ip: req.ip },
});

console.log("=== ACTIVITY LOGGED ===");


    const token = jwt.sign(
      { sub: String(user._id), email: user.email, name: user.name },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "7d" }
    );

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




module.exports = router;


/*
in the above apis still we are only work on free
but free also a have some features and pro and enterprise also 
i want the scenario like if ind updrade to pro added 
 
*/


