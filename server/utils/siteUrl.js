// The one place that decides what a link we send someone starts with.
//
// tokun.world and www.tokun.world are not the same site. www is the Static Web
// App and serves the SPA on every path; the apex is the registrar's forwarding
// service, which handles "/" and 404s everything else — and even on "/" it
// forwards to www with the query string stripped:
//
//     GET https://tokun.world/signup?ref=ABC1234  →  404
//     GET https://tokun.world/?ref=ABC1234        →  301 https://www.tokun.world
//
// So every link built on the apex is broken, and the deeper the link the more
// obviously: an invite arrives with no ?ref= and the referral is never
// attributed, a collab link loses its ?sessionId=, an org invite loses its
// ?invite=. All of it fails silently, because a redirect that drops half the
// URL still ends on a page that loads.
//
// SITE_URL is meant to be the www host and normally is. This exists so that one
// env var being wrong — or unset on a new environment — can't quietly break
// every link the backend sends out. Anything else in SITE_URL (a staging host,
// a tunnel, localhost) is left exactly as it is.
const DEFAULT_SITE = "https://www.tokun.world";

/* ── A site ROOT has no path ─────────────────────────────────────────────────
 *
 * SITE_URL has been set to "http://localhost:5173/login" in this repo's own env
 * files, and a value like that breaks every link the backend sends without
 * breaking anything else — the var reads like "where the site is", and for
 * signing in it is even correct.
 *
 * What it produces is:
 *
 *     http://localhost:5173/login/orders/service/65f1…   → 404
 *     http://localhost:5173/login/my-refunds?request=…   → 404
 *
 * Every path in this file is appended to the value, so a path already sitting
 * in it lands one level too deep — on a route that exists nowhere. It fails the
 * same way for each of the forty-odd links the backend builds, and it fails
 * only in email, which is the one place nobody watches a console.
 *
 * So the path is dropped here rather than trusted. Tokun's SPA is served from
 * the root — /orders, /login, /my-refunds are all top-level routes — so there
 * is no deployment where a path on the site root is the right answer, and
 * nothing legitimate is lost by removing it.
 *
 * Host and port are kept exactly (localhost:5173 stays localhost:5173); only
 * the path, query and fragment go. */
function stripPath(value) {
  try {
    const u = new URL(value);
    return `${u.protocol}//${u.host}`;
  } catch {
    // Not parseable as an absolute URL — leave it alone rather than mangle it.
    // The caller gets exactly what they configured, as before.
    return value;
  }
}

/**
 * The site root for building user-facing links. Never ends in a slash, and
 * never carries a path.
 *
 * @param {string} [override] use instead of SITE_URL — still normalised
 */
function siteUrl(override) {
  const raw = String(override || process.env.SITE_URL || DEFAULT_SITE)
    .trim()
    .replace(/\/+$/, "")
    .replace(/^(https?:)\/\/tokun\.world\b/i, "$1//www.tokun.world");
  return stripPath(raw).replace(/\/+$/, "");
}

module.exports = { siteUrl, DEFAULT_SITE };
