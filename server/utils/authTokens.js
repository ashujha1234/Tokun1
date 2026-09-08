const jwt = require("jsonwebtoken");
const crypto = require("crypto");
// For Types.ObjectId when starting a new rotation family. Safe at top level —
// mongoose has no dependency on this app's models.
const mongoose = require("mongoose");

/**
 * Session token lifetimes, in one place.
 *
 * These were previously inline `expiresIn` literals at three separate sign
 * sites, and they disagreed: users got 1 day, admins got 7. That's backwards —
 * an admin can approve refunds, suspend sellers and delete listings, so a
 * stolen admin token is worth far more than a stolen user token and should be
 * valid for far less time.
 *
 * A user session is long but SLIDING: GET /api/auth/session re-issues the token
 * while someone is actively using the app, so a daily user never has to log in
 * again, while a session left untouched for USER_TOKEN_TTL genuinely expires.
 * That combination is the point — a short fixed expiry punished active users
 * (every login needs an emailed OTP), and a long fixed expiry would mean an
 * abandoned session stays valid for a month.
 *
 * ── The access token came down from 30 days to 1 hour ───────────────────────
 *
 * The TTL is the window in which a STOLEN token still works. Thirty days was a
 * long time to hand someone; an hour is not.
 *
 * Shortening it is only possible because there is now a refresh token to get a
 * new one with (models/RefreshToken.js). Before, the access token WAS the
 * session — shortening it meant asking people for an emailed OTP every hour.
 * Now expiry is invisible: the client exchanges its refresh token for a new
 * access token and carries on.
 *
 * Why one hour rather than the fifteen minutes this pattern usually uses:
 * roughly forty files in the frontend build their own fetch call, so there is
 * no single place to catch a 401 and retry. Refresh has to happen PROACTIVELY,
 * before expiry, from AuthContext — and the shorter the access token, the
 * narrower the margin for a tab that was asleep, a slow network or a clock a
 * little out. An hour is a 720× reduction on thirty days and leaves that margin
 * comfortable. Fifteen minutes becomes the right number once a central API
 * client exists to retry on 401.
 *
 * Note this bounds the damage of a leak. Ending a session on demand is what
 * tokenVersion does (models/User.js), and noticing a leak at all is what
 * refresh-token reuse detection does. Three different jobs; none replaces
 * another.
 */
const USER_TOKEN_TTL = "1h";
const ADMIN_TOKEN_TTL = "12h";

/* How long a refresh token lives: the real length of a session. Someone who
   opens Tokun at least once a month is never asked to log in again; someone who
   has not opened it in thirty days is, which is the intended behaviour.
   A number of milliseconds rather than a jwt-style string, because this one is
   stored as a Date on a document rather than signed into a claim. */
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/* How long after a rotation the token it replaced is still honoured — see the
   retry branch in rotateRefreshToken.

   15 seconds is chosen from both ends. It has to outlast the case it exists
   for: a request that reached the server, committed, and whose response was
   lost — so roughly one request timeout on a bad mobile connection. And it has
   to stay far short of anything useful to an attacker, who would need to
   capture a token and replay it inside the same fifteen seconds during which
   the real client is also mid-refresh. Even then the family is not lost to
   detection: whichever of the two rotates next leaves the other holding a
   spent token, and that presentation lands outside the window and revokes.

   Widening this trades that detection away. It should not need widening: the
   cross-tab lock in the client (contexts/AuthContext.tsx) removes the
   multiple-tabs case entirely, and this window only covers the lost response
   that no client-side lock can prevent. */
const ROTATION_GRACE_MS = 15 * 1000;

// Renew once the token is past this fraction of its life. Without a threshold,
// every renew call would mint a new token and the client would churn them on
// each focus event; at 50% a 1-hour token is refreshed at most every ~30
// minutes of continuous use.
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
      /* Session revocation — requireAuth refuses any token whose `tv` does not
         match the account's current tokenVersion. Short name because it rides
         on every request and a JWT is sent in a header, where bytes are not
         free. See models/User.js for what bumping it does. */
      tv: Number(user.tokenVersion || 0),
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

/* ─────────────────────────── refresh tokens ─────────────────────────────── */

/* Required lazily inside each function. models/User.js requires utils/cache.js
   at load time and this module is pulled in by route files during that same
   boot sequence; a top-level require of a model here makes the order matter. */
const RefreshTokenModel = () => require("../models/RefreshToken");

/**
 * A new refresh token: 256 bits from the CSPRNG, base64url.
 *
 * Opaque on purpose. A JWT here would let a holder read its own claims and,
 * worse, would invite someone to trust it without the database round trip —
 * and that round trip IS the feature. Being able to look a refresh token up is
 * what makes it revocable.
 */
function generateRefreshToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function hashRefreshToken(raw) {
  return crypto.createHash("sha256").update(String(raw)).digest("hex");
}

/**
 * Start a new session: record a refresh token at the head of a fresh family.
 *
 * Called at every point a user logs in. The returned raw token is the only time
 * it exists in plaintext — only its hash is stored.
 *
 * @param {object} user
 * @param {{userAgent?: string, ip?: string, family?: any}} [ctx]
 */
async function issueRefreshToken(user, ctx = {}) {
  const raw = generateRefreshToken();

  await RefreshTokenModel().create({
    tokenHash: hashRefreshToken(raw),
    userId: user._id,
    // A rotation keeps its family; a fresh login starts one.
    family: ctx.family || new mongoose.Types.ObjectId(),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    userAgent: String(ctx.userAgent || "").slice(0, 300),
    ip: String(ctx.ip || "").slice(0, 60),
  });

  return raw;
}

/**
 * Spend a refresh token and issue its replacement.
 *
 * The security-relevant part of this file. Returns a discriminated result
 * rather than throwing, because the caller answers each case with a different
 * status and a different message:
 *
 *   {ok: true, user, refreshToken}
 *   {ok: false, reason: "not_found" | "expired" | "revoked" | "reuse_detected"}
 *
 * ── Reuse detection ─────────────────────────────────────────────────────────
 *
 * A token carrying `replacedByHash` has already been spent. Someone presenting
 * it is either a client that retried, or a thief replaying a copy — and the two
 * are indistinguishable from here, so the whole family is revoked and both are
 * logged out. That is the correct trade: the alternative leaves an attacker
 * with a working session to avoid inconveniencing a client that retried.
 *
 * @param {string} rawToken
 * @param {{userAgent?: string, ip?: string}} [ctx]
 */
async function rotateRefreshToken(rawToken, ctx = {}) {
  const RefreshToken = RefreshTokenModel();
  const User = require("../models/User");

  if (!rawToken) return { ok: false, reason: "not_found" };

  const tokenHash = hashRefreshToken(rawToken);
  const record = await RefreshToken.findOne({ tokenHash });

  // No such token. Also the answer for one already swept by the TTL index.
  if (!record) return { ok: false, reason: "not_found" };

  /* Already spent. Two very different things arrive here, and until now both
     were treated as theft:

       a RETRY   the rotation succeeded but its response never reached the
                 client — a dropped mobile connection, or iOS freezing a
                 backgrounded tab mid-request. The client still holds the old
                 token because it never saw the new one, and it has no way to
                 recover: every attempt presents the same dead token.

       a REPLAY  someone is using a copy of a token that has been spent.

     The retry case was a guaranteed logout, and one that no amount of
     client-side care can avoid — the client cannot know whether the server
     committed a rotation whose answer it never got. Since re-login here means
     an emailed OTP (routes/authRoutes.js /login/initiate), that cost a user
     their session for a network blip.

     They ARE distinguishable, by time. A retry happens seconds after the
     rotation it lost; a replay is whenever the attacker gets around to it. So
     a short window after the rotation is served instead of punished. */
  if (record.replacedByHash) {
    const rotatedAgoMs = record.revokedAt ? Date.now() - new Date(record.revokedAt).getTime() : Infinity;
    const withinGrace = record.revokedReason === "rotated" && rotatedAgoMs <= ROTATION_GRACE_MS;

    if (withinGrace) {
      /* Follow this token's OWN replacement chain, not the family head.

         The head is the wrong thing to look at: in a family where the real
         client received B and spent it normally (B→C), the head is C and it is
         very much alive — so keying off the head served the attacker replaying
         A and never detected anything.

         What separates a retry from a replay is WHY the replacement was spent:

           spent by the real client ("rotated")        → the client HAS it, so
                                                         presenting A again is a
                                                         replay
           spent by an earlier retry ("rotated_grace") → still the same client
                                                         still not holding
                                                         anything, so keep going
           not spent at all                            → the lost-response case
                                                         this exists for

         So walk forward across links this branch itself created, and stop at
         the first one that is either unspent (rotate it) or was spent by the
         real client (revoke). Bounded, because a chain that long is not a
         retry any more. */
      let link = await RefreshToken.findOne({ tokenHash: record.replacedByHash });

      for (let hop = 0; hop < 5 && link; hop++) {
        const unspent = !link.replacedByHash && !link.revokedAt && link.expiresAt > new Date();

        if (unspent) {
          const user = await User.findById(link.userId);
          if (!user || user.isDeleted) return { ok: false, reason: "revoked" };

          const retryRaw = generateRefreshToken();
          const retryHash = hashRefreshToken(retryRaw);

          await RefreshToken.create({
            tokenHash: retryHash,
            userId: user._id,
            family: link.family,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
            userAgent: String(ctx.userAgent || "").slice(0, 300),
            ip: String(ctx.ip || "").slice(0, 60),
          });

          /* "rotated_grace", not "rotated" — this marker is the whole
             mechanism. It records that this link was spent serving a retry
             rather than by a client that actually held it, which is what lets
             the next retry walk past it and a replay stop at it. */
          link.replacedByHash = retryHash;
          link.revokedAt = new Date();
          link.revokedReason = "rotated_grace";
          await link.save();

          return { ok: true, user, refreshToken: retryRaw, retried: true };
        }

        // Spent by an earlier retry — keep walking. Anything else is a replay.
        if (link.revokedReason !== "rotated_grace" || !link.replacedByHash) break;
        link = await RefreshToken.findOne({ tokenHash: link.replacedByHash });
      }
    }

    /* A genuine replay: spent long ago, or spent and its replacement already
       used. Revoke the whole family — both the thief and the real user are
       signed out, which is the right trade. Checked before the revoked and
       expired cases below, because a replay is a security event whichever of
       those it also happens to be. */
    await RefreshToken.updateMany(
      { family: record.family, revokedAt: null },
      { $set: { revokedAt: new Date(), revokedReason: "reuse_detected" } }
    );
    return { ok: false, reason: "reuse_detected" };
  }

  if (record.revokedAt) return { ok: false, reason: "revoked" };
  if (record.expiresAt <= new Date()) return { ok: false, reason: "expired" };

  /* The account, not just its id: the new access token carries plan, role and
     tokenVersion claims, which have to be read fresh. A refresh is also the
     natural moment to notice the account is gone. */
  const user = await User.findById(record.userId);
  if (!user || user.isDeleted) return { ok: false, reason: "revoked" };

  const nextRaw = generateRefreshToken();
  const nextHash = hashRefreshToken(nextRaw);

  await RefreshToken.create({
    tokenHash: nextHash,
    userId: user._id,
    family: record.family,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    userAgent: String(ctx.userAgent || "").slice(0, 300),
    ip: String(ctx.ip || "").slice(0, 60),
  });

  /* Marked spent only AFTER its replacement exists. The other order has a
     window in which a crash leaves the old token dead and no new one issued —
     a silent logout with no way back but a fresh OTP. */
  record.replacedByHash = nextHash;
  record.revokedAt = new Date();
  record.revokedReason = "rotated";
  await record.save();

  return { ok: true, user, refreshToken: nextRaw };
}

/** Revoke one specific refresh token — what logout does. */
async function revokeRefreshToken(rawToken, reason = "logout") {
  if (!rawToken) return false;
  const res = await RefreshTokenModel().updateOne(
    { tokenHash: hashRefreshToken(rawToken), revokedAt: null },
    { $set: { revokedAt: new Date(), revokedReason: reason } }
  );
  return res.modifiedCount > 0;
}

/**
 * End every session this account currently has.
 *
 * One atomic $inc, which is what makes it safe to call from anywhere: two
 * admins revoking the same account at the same moment both succeed, and the
 * result is simply a higher number. A read-modify-write would let one overwrite
 * the other and quietly leave a session alive.
 *
 * Takes effect on the revoked user's very next request. The User model's post
 * hooks drop the cached copy on this write, so requireAuth re-reads the new
 * tokenVersion from Mongo rather than serving the old one until its TTL.
 *
 * Call this on: account suspension, account deletion, a user asking to be
 * signed out of all devices, or any report that a token has leaked. It is
 * deliberately not called automatically anywhere yet — there is no code path in
 * this app that suspends an account today, so there is nothing to hang it off
 * without inventing a route. Wire it in when that path exists.
 *
 * The equivalent works by hand, and is worth knowing for an incident: raising
 * `tokenVersion` on the document directly in Atlas revokes that account's
 * sessions just as well. The cache picks the change up within its 60-second
 * TTL, since an external edit fires no Mongoose hook.
 *
 * @param {string|import("mongoose").Types.ObjectId} userId
 * @returns {Promise<number|null>} the new tokenVersion, or null if no such user
 */
async function revokeUserSessions(userId, reason = "revoke_all") {
  const User = require("../models/User");

  const updated = await User.findByIdAndUpdate(
    userId,
    { $inc: { tokenVersion: 1 } },
    { new: true, select: "tokenVersion" }
  );

  /* Both halves, and both are needed. Bumping tokenVersion kills the ACCESS
     tokens already issued; revoking the refresh tokens stops new ones being
     minted. Doing only the first buys an hour — the client would simply refresh
     and be handed a fresh, valid access token. Doing only the second leaves the
     current access token working until it expires. */
  await RefreshTokenModel().updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date(), revokedReason: reason } }
  );

  return updated ? updated.tokenVersion : null;
}

module.exports = {
  USER_TOKEN_TTL,
  ADMIN_TOKEN_TTL,
  REFRESH_TOKEN_TTL_MS,
  RENEW_AFTER_FRACTION,
  signUserToken,
  signAdminToken,
  shouldRenew,
  revokeUserSessions,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  hashRefreshToken,
};
