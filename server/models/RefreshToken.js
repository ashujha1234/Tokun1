/**
 * Refresh tokens — the record that makes a session revocable and a theft
 * detectable.
 *
 * ── What this changes about how sessions work ───────────────────────────────
 *
 * Before this, there was one token: a JWT valid for 30 days, held in
 * localStorage, and the server kept no record of having issued it. That has two
 * consequences and both are bad. A stolen token works for its full remaining
 * life, because nothing can un-issue a JWT. And nobody can tell it was stolen,
 * because a thief's requests are indistinguishable from the owner's.
 *
 * The split fixes both halves:
 *
 *   access token   short (see USER_TOKEN_TTL), still a stateless JWT, still
 *                  what every API call carries. Short life bounds the damage.
 *   refresh token  long, opaque, and RECORDED HERE — so it can be revoked, and
 *                  so its use can be watched.
 *
 * ── Rotation and reuse detection ────────────────────────────────────────────
 *
 * Every refresh consumes the token and issues a new one, linked to the old by
 * `family`. A refresh token is therefore valid exactly once.
 *
 * That single-use property is what turns theft into a signal. If a token is
 * presented twice, one of two things happened: the legitimate client retried,
 * or someone else is holding a copy. The server cannot tell which — so it
 * assumes the worse one and kills the entire family, forcing a real login. The
 * attacker is locked out; the user logs in again. That asymmetry is the whole
 * point, and it is the only mechanism here that detects a compromise rather
 * than merely limiting it.
 *
 * Note what this does NOT fix. The refresh token lives in localStorage next to
 * the access token, so script running on this origin can still read both. The
 * proper answer is an HttpOnly cookie, which is not available while the API is
 * on a different registrable domain (azurewebsites.net) from the app
 * (tokun.world) — a browser treats that cookie as third-party and Safari
 * already refuses it. Moving the API to api.tokun.world is what unlocks it, and
 * nothing on the server would need to change but the transport. Until then the
 * gain is real but partial: a stolen token expires sooner, can be killed on
 * demand, and announces itself if used alongside the real client.
 *
 * ── Why the hash and not the token ──────────────────────────────────────────
 *
 * Only a SHA-256 of the token is stored. A database dump therefore contains no
 * usable credentials — the tokens are random, so a hash of one cannot be
 * reversed or usefully brute-forced, and unlike a password there is no need for
 * bcrypt's deliberate slowness. This collection is read on every refresh, so a
 * slow KDF would be a per-request cost for no gain against a 256-bit random
 * value.
 */

const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    /* SHA-256 of the raw token, hex. Unique because two identical hashes would
       mean either a collision or the same token recorded twice, and both are
       states the rotation logic must never have to reason about. */
    tokenHash: { type: String, required: true, unique: true, index: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* The rotation chain this token belongs to: one login, then every token
       descended from it by refreshing. Reuse detection revokes by family, so a
       replayed token invalidates the thief's copy AND the real client's — which
       is intended. Half-killing a compromised chain leaves the attacker in. */
    family: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

    /* Set when this token is spent, to the hash of its replacement. Its presence
       is what "already used" means — seeing it on a token someone just
       presented is the reuse signal. Kept rather than deleting the row for the
       same reason: a deleted row is indistinguishable from a token that never
       existed, and the two need different answers. */
    replacedByHash: { type: String, default: null },

    revokedAt: { type: Date, default: null },
    /* Short machine-readable cause — "rotated", "reuse_detected", "logout",
       "revoke_all". Worth having when working out why someone was signed out. */
    revokedReason: { type: String, default: null },

    expiresAt: { type: Date, required: true },

    /* Recorded at issue time, shown in no UI yet. Present because the first
       question asked about a suspicious session is always "from where?", and
       that cannot be answered retroactively. */
    userAgent: { type: String, default: "" },
    ip: { type: String, default: "" },
  },
  { timestamps: true }
);

/* Mongo removes documents once expiresAt passes. Without this the collection
   grows by one row per refresh, forever — at a token an hour per active user
   that is the largest collection in the database within a year, holding nothing
   but dead credentials.
   expireAfterSeconds: 0 means "expire AT the date in this field", not "zero
   seconds from now". */
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/* Revoking every live token for one user is the common write (logout
   everywhere, suspension, a bumped tokenVersion), and it filters on exactly
   this pair. */
refreshTokenSchema.index({ userId: 1, revokedAt: 1 });

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
