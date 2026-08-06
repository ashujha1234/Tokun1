// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// async function requireAuth(req, res, next) {
//   try {
//     const auth = req.headers.authorization || "";
//     const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
//     if (!token) return res.status(401).json({ success: false, error: "unauthorized" });
//     const payload = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
//     const user = await User.findById(payload.sub);
//     if (!user) return res.status(401).json({ success: false, error: "unauthorized" });
//     req.user = user;
//     next();
//   } catch {
//     return res.status(401).json({ success: false, error: "unauthorized" });
//   }
// }

// module.exports = { requireAuth };


// utils/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AdminUser = require("../models/AdminUser");

async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, error: "unauthorized" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Admin token — AdminUser se resolve karo
    if (payload.type === "admin") {
      const admin = await AdminUser.findById(payload.sub);
      if (!admin || admin.isActive === false) {
        return res.status(401).json({ success: false, error: "unauthorized" });
      }
      req.user = admin;
      req.isAdmin = true;
      return next();
    }

    // ✅ Normal user token — User se resolve karo
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ success: false, error: "unauthorized" });
    }

    req.user = user;
    req.isAdmin = false;
    return next();
  } catch {
    return res.status(401).json({ success: false, error: "unauthorized" });
  }
}

// Apply AFTER requireAuth, only on sensitive/mutating routes (selling, buying,
// hiring payments, wallet withdrawals, cart checkout, login is handled
// separately in authRoutes.js). Deliberately NOT part of requireAuth itself —
// a suspended/deleted account must still be able to view its own data
// (notifications, wallet balance, purchase history, cart, KYC status, etc.),
// only taking new actions should be blocked, checked fresh on every request
// so suspending someone invalidates in-flight actions immediately rather than
// waiting out their JWT's remaining expiry.
function blockIfSuspended(req, res, next) {
  if (req.isAdmin) return next();
  if (req.user && (req.user.isDeleted || req.user.sellerStatus === "SUSPENDED")) {
    return res.status(403).json({ success: false, error: "account_suspended" });
  }
  return next();
}

// A Team Member (userType "TM") buys nothing directly — their org's Owner
// purchases prompts out of the shared token pool and shares access via
// /api/prompt-collab/org/share. A TM wanting something not yet shared uses
// /api/prompt-collab/team/request to ask the Owner, rather than paying
// individually. Apply after requireAuth on purchase-creation routes only —
// same "sensitive action" gating as blockIfSuspended above.
function blockOrgTeamMemberPurchase(req, res, next) {
  if (req.user && req.user.userType === "TM") {
    return res.status(403).json({
      success: false,
      error: "team_members_cannot_purchase",
      message: "Your organization buys prompts for you — ask your org owner to purchase and share this with you.",
    });
  }
  return next();
}

module.exports = { requireAuth, blockIfSuspended, blockOrgTeamMemberPurchase };