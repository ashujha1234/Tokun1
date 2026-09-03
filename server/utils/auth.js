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
const { users: userCache } = require("./cache");

/* How long a user document may be served from memory.
 *
 * This is a backstop, not the primary correctness mechanism. Every write to a
 * User drops its entry immediately via the model hooks in models/User.js, so
 * the cache is normally exact rather than eventually-consistent. The TTL covers
 * only what those hooks cannot see: a change made outside this process — a
 * direct edit in Atlas, a migration script run from a laptop, a raw driver
 * call that bypasses Mongoose.
 *
 * 60 seconds because that is short enough that a manual database edit shows up
 * while the person who made it is still looking at the screen, and long enough
 * that a user clicking through the app hits Mongo roughly once a minute instead
 * of once per request. */
const USER_CACHE_TTL_MS = 60 * 1000;

/**
 * The account behind a token, from memory when possible.
 *
 * ── Why this is cached at all ───────────────────────────────────────────────
 *
 * requireAuth guards 54 route files, so this lookup ran before essentially
 * every authenticated request in the app — one full document fetch, serially,
 * before the route did any of its own work. It was the single most frequent
 * query in the system and it returned the same document over and over.
 *
 * ── Why a lean object and not the document ──────────────────────────────────
 *
 * What is cached is a PLAIN OBJECT, and every request gets a freshly hydrated
 * Mongoose document built from it. Caching the document itself would be a real
 * bug, not a stylistic one: a Mongoose document carries mutable per-instance
 * state — dirty-path tracking, in-flight modifications — and handing the same
 * instance to two concurrent requests means one request's unsaved edits are
 * visible to the other, and a save() from either writes some mixture of both.
 *
 * User.hydrate() rebuilds a document from stored fields and marks it clean and
 * not-new, which is exactly the state findById() would have returned. So the
 * three req.user.save() call sites keep working unchanged, and each request
 * owns its own copy.
 */
async function loadUser(id) {
  const key = String(id);

  const cached = await userCache.wrap(key, USER_CACHE_TTL_MS, async () => {
    // .lean() because only the raw fields are being stored — building a full
    // document here just to strip it back down would waste the work twice.
    return User.findById(id).lean();
  });

  return cached ? User.hydrate(cached) : null;
}

async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, error: "unauthorized" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Admin token — AdminUser se resolve karo
    /* Not cached, on purpose. Admin tokens live 12 hours against a user's 7
       days precisely because an admin session is the expensive one to get
       wrong, and there are a handful of admins making a handful of requests —
       there is no load here worth trading that freshness for. isActive===false
       must take effect on the very next request, not up to a minute later. */
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
    const user = await loadUser(payload.sub);
    if (!user) {
      return res.status(401).json({ success: false, error: "unauthorized" });
    }

    /* Session revocation. See models/User.js tokenVersion for the mechanism.
     *
     * Both sides default to 0: a token minted before the `tv` claim existed has
     * no claim, and an account never revoked has tokenVersion 0. They match, so
     * shipping this does not log out everyone currently signed in. Any later
     * bump breaks that match for every previously-issued token at once.
     *
     * Checked AFTER the account is loaded because the comparison needs the
     * stored number — this is the one thing a self-contained JWT cannot answer
     * on its own, and the reason the lookup above is worth keeping at all. */
    if (Number(payload.tv || 0) !== Number(user.tokenVersion || 0)) {
      return res.status(401).json({ success: false, error: "token_revoked" });
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
      message: "Your organization buys products for you — ask your org owner to purchase and share this with you.",
    });
  }
  return next();
}

module.exports = { requireAuth, blockIfSuspended, blockOrgTeamMemberPurchase };