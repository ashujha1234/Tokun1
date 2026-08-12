/**
 * Warm the route chunks a visitor is most likely to open next, while the page
 * they're on is sitting idle.
 *
 * Every route is code-split, which keeps the first paint small but moves the
 * cost to the click: the chunk only starts downloading once you navigate, so
 * there's a spinner between pressing "Log in" and seeing the page. Nothing on
 * the landing page needs those chunks — but the browser has nothing else to do
 * while someone reads it, and that idle time is free.
 *
 * The imports below are the SAME specifiers the `lazy()` calls in App.tsx use.
 * That matters: Vite resolves both to one module, so a chunk fetched here is
 * already in the module registry when React asks for it, and the lazy boundary
 * resolves without a network round-trip or a visible fallback.
 *
 * Called from Landing once it has finished settling — see the below-fold
 * handler there.
 */

/** Fired once per session — a second pass would re-request nothing. */
let started = false;

/**
 * Don't spend someone else's data.
 *
 * Prefetching is a bet that the user will navigate. On a metered or slow
 * connection a wrong bet costs them real money and slows down the page they
 * are actually looking at, so the bet isn't taken.
 */
function shouldPrefetch(): boolean {
  const conn = (navigator as any)?.connection;
  if (!conn) return true; // no information — assume a normal connection
  if (conn.saveData) return false;
  return !/(^|-)2g$/.test(conn.effectiveType || "");
}

const idle = (fn: () => void, timeout = 2000) => {
  const ric = (window as any).requestIdleCallback;
  if (typeof ric === "function") ric(fn, { timeout });
  else setTimeout(fn, timeout);
};

/**
 * Ordered by how likely a visitor on the landing page is to open it, because
 * they are fetched one at a time. Signing up and browsing the marketplace are
 * what the landing page asks people to do; anything past that is a guess, so
 * the list stops rather than pulling the whole app down behind it.
 */
const ROUTES: Array<() => Promise<unknown>> = [
  () => import("../pages/Login"),
  () => import("../pages/Signup"),
  () => import("../pages/PromptMarketplacePage"),
  () => import("../pages/Index"),
  () => import("../pages/FindCreatorsPage"),
];

/**
 * Sequential on purpose.
 *
 * Firing all five at once competes with whatever the current page is still
 * loading — its own images, fonts, the globe. One at a time keeps prefetching
 * genuinely in the background, which is the only thing that keeps it free.
 */
async function warmSequentially() {
  for (const load of ROUTES) {
    try {
      await load();
    } catch {
      // A chunk that fails to prefetch is not an error anyone should see — the
      // route still works, it just loads on demand as it did before.
    }
  }
}

export function prefetchLandingRoutes() {
  if (started || typeof window === "undefined") return;
  started = true;

  if (!shouldPrefetch()) return;

  // Two gates, not one. `load` waits for the current page's own resources so
  // prefetching cannot slow down the thing being looked at; `idle` then waits
  // for a gap in the main thread, so parsing a chunk doesn't stutter an
  // animation that is still running.
  const start = () => idle(() => void warmSequentially());

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
}

/** Older name kept as an alias in case anything still imports it. */
export const prefetchLikelyRoutes = prefetchLandingRoutes;
