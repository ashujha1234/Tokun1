const jwt = require("jsonwebtoken");

/**
 * Session token lifetimes, in one place.
 *
 * These were previously inline `expiresIn` literals at three separate sign
 * sites, and they disagreed: users got 1 day, admins got 7. That's backwards —
 * an admin can approve refunds, suspend sellers and delete listings, so a
 * stolen admin token is worth far more than a stolen user token and should be
 * valid for far less time.
 *
 * A user session is long but SLIDING: POST /api/auth/session/renew re-issues the
 * token while someone is actively using the app, so a daily user never has to
 * log in again, while a session left untouched for USER_TOKEN_TTL genuinely
 * expires. That combination is the point — a short fixed expiry punished active
 * users (every login needs an emailed OTP), and a long fixed expiry would mean
 * an abandoned session stays valid for a month.
 */
const USER_TOKEN_TTL = "30d";
const ADMIN_TOKEN_TTL = "12h";

// Renew once the token is past this fraction of its life. Without a threshold,
// every renew call would mint a new token and the client would churn them on
// each focus event; at 50% a 30-day token is refreshed at most every ~15 days
// of continuous use.
const RENEW_AFTER_FRACTION = 0.5;

function signUserToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      name: user.name,
      userType: user.userType,
      role: user.role,
      orgId: user.orgId,
      plan: user.plan,
    },
    process.env.JWT_SECRET,
    { expiresIn: USER_TOKEN_TTL }
  );
}

function signAdminToken(admin) {
  return jwt.sign({ sub: String(admin._id), type: "admin" }, process.env.JWT_SECRET, {
    expiresIn: ADMIN_TOKEN_TTL,
  });
}

/**
 * Should this token be replaced with a fresh one?
 *
 * @param {object} payload decoded JWT (needs iat + exp)
 */
function shouldRenew(payload) {
  if (!payload?.iat || !payload?.exp) return false;
  const lifetime = payload.exp - payload.iat;
  if (lifetime <= 0) return false;
  const elapsed = Math.floor(Date.now() / 1000) - payload.iat;
  return elapsed / lifetime >= RENEW_AFTER_FRACTION;
}

module.exports = {
  USER_TOKEN_TTL,
  ADMIN_TOKEN_TTL,
  RENEW_AFTER_FRACTION,
  signUserToken,
  signAdminToken,
  shouldRenew,
};
