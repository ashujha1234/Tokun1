/**
 * Where to send someone after they sign in.
 *
 * ── Why a query param and not router state ──────────────────────────────────
 *
 * RequireAuth already recorded the attempted page as `state={{ from }}` — and
 * nothing ever read it, so every sign-in landed on /smartgen regardless of what
 * the person had been trying to reach. Router state was the wrong carrier
 * anyway: it lives in the history entry, so it survives an in-app redirect and
 * does NOT survive arriving cold from an email link, which is exactly the case
 * that matters here. A query param survives both, and survives the
 * login → OTP → verified hop that sits in the middle.
 *
 * ── Why the value is validated ──────────────────────────────────────────────
 *
 * This is a redirect target taken from the URL, which is the classic open-
 * redirect shape: `/login?next=https://evil.example/looks-like-tokun` renders a
 * real Tokun login page and then hands the freshly signed-in visitor to someone
 * else's site. Only same-site paths are accepted — it must start with a single
 * "/" and not "//" (protocol-relative URLs like //evil.example are absolute).
 */

const FALLBACK = "/smartgen";

/** A `next` value that is safe to navigate to, or the fallback. */
export function safeNext(raw: string | null | undefined, fallback = FALLBACK): string {
  const v = String(raw || "").trim();
  if (!v) return fallback;
  // Must be a site-relative path. "//host" and "https://host" are not.
  if (!v.startsWith("/") || v.startsWith("//")) return fallback;
  // A backslash is treated as a slash by some browsers when parsing URLs.
  if (v.includes("\\")) return fallback;
  return v;
}

/** Read `next` out of a location's search string. */
export function readNext(search: string, fallback = FALLBACK): string {
  return safeNext(new URLSearchParams(search).get("next"), fallback);
}

/** The current location as a `next` value — path, query and hash together. */
export function currentAsNext(loc: { pathname: string; search?: string; hash?: string }): string {
  return `${loc.pathname}${loc.search || ""}${loc.hash || ""}`;
}
