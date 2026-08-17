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

/**
 * The site root for building user-facing links. Never ends in a slash.
 *
 * @param {string} [override] use instead of SITE_URL — still normalised
 */
function siteUrl(override) {
  return String(override || process.env.SITE_URL || DEFAULT_SITE)
    .trim()
    .replace(/\/+$/, "")
    .replace(/^(https?:)\/\/tokun\.world\b/i, "$1//www.tokun.world");
}

module.exports = { siteUrl, DEFAULT_SITE };
