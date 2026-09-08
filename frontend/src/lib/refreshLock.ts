/**
 * A lock held across TABS, for the one operation that must not run twice.
 *
 * ── Why ─────────────────────────────────────────────────────────────────────
 *
 * Refresh tokens are single-use and rotate: the server marks one spent the
 * moment it issues the replacement, and a spent token presented again is read
 * as a stolen copy being replayed — the whole token family is revoked and every
 * device is signed out (see rotateRefreshToken in server/utils/authTokens.js).
 *
 * AuthContext already had a guard against sending one twice, but it was a
 * `useRef` — one per AuthProvider, and therefore one per tab. `localStorage` is
 * shared across tabs on an origin. So two tabs read the same refresh token,
 * both decided independently that it was time to rotate, and the second
 * request looked exactly like a replay. Users were signed out — with a
 * `SECURITY refresh token reuse detected` line in the server log — as a direct
 * consequence of having two tabs of a marketplace open, which is normal
 * behaviour and not something they can be asked to stop doing.
 *
 * The trigger was usually `focus`: switching between two tabs of the app runs
 * the session check in whichever one just came forward.
 *
 * ── How ─────────────────────────────────────────────────────────────────────
 *
 * Web Locks (`navigator.locks`) is exactly this primitive and is shared across
 * same-origin tabs, so it is used where it exists — Chrome, Edge, Firefox 96+,
 * Safari 15.4+. Older Safari, which is where the reports came from, has no Web
 * Locks, so there is a `localStorage` lease behind it.
 *
 * Holding the lock is only half of it. The other half is at the CALL SITE: once
 * a waiting tab acquires the lock it must re-check whether a refresh is still
 * needed, because the tab that held it first has probably just done the work
 * and written a fresh token to localStorage. Without that re-check the tabs
 * merely take turns spending tokens instead of racing to — which is the same
 * bug, serialised. See refreshSession in contexts/AuthContext.tsx.
 */

const LOCK_NAME = "tokun.auth.refresh";

/* The lease key and its lifetime, for the fallback path.
 *
 * 12 seconds is longer than a refresh round trip and shorter than the server's
 * 15-second rotation grace window, so a lease that goes stale because its tab
 * was killed mid-request is reclaimed while a retry can still be served. */
const LEASE_KEY = "tokun.auth.refresh.lease";
const LEASE_TTL_MS = 12_000;
const LEASE_POLL_MS = 120;

function hasWebLocks(): boolean {
  return typeof navigator !== "undefined" && "locks" in navigator;
}

/* Identifies THIS tab's lease, so a tab can only ever release its own. Without
   it, a tab whose lease had already expired and been taken over would delete
   the new holder's lease on the way out. */
const leaseOwner = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

function readLease(): { owner: string; expiresAt: number } | null {
  try {
    const raw = localStorage.getItem(LEASE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.owner !== "string" || typeof parsed?.expiresAt !== "number") return null;
    return parsed;
  } catch {
    // Unparseable or storage unavailable — treated as "no lease", which errs
    // toward proceeding. A refresh that races is recoverable now that the
    // server serves retries; a refresh that never happens is a stuck session.
    return null;
  }
}

async function withLeaseLock<T>(fn: () => Promise<T>): Promise<T> {
  const deadline = Date.now() + LEASE_TTL_MS;

  for (;;) {
    const current = readLease();

    // Free, or the holder's lease has expired (its tab was closed or froze).
    if (!current || current.expiresAt <= Date.now()) {
      try {
        localStorage.setItem(
          LEASE_KEY,
          JSON.stringify({ owner: leaseOwner, expiresAt: Date.now() + LEASE_TTL_MS })
        );
      } catch {
        // Private mode or a full quota: no lock is available, so run anyway
        // rather than blocking the session from ever renewing.
        return fn();
      }

      /* Re-read before trusting it. Two tabs can both see the lease free and
         both write; the last write wins and the other must not also proceed.
         This is not airtight — localStorage has no compare-and-swap — but it
         closes the common case, and Web Locks above covers every browser
         released since early 2022. */
      const after = readLease();
      if (after?.owner !== leaseOwner) continue;

      try {
        return await fn();
      } finally {
        const mine = readLease();
        if (mine?.owner === leaseOwner) {
          try {
            localStorage.removeItem(LEASE_KEY);
          } catch {
            /* nothing useful to do */
          }
        }
      }
    }

    // Held by a live tab. Give up waiting past the lease's own lifetime — by
    // then the holder is gone and the loop above will reclaim it.
    if (Date.now() > deadline + LEASE_TTL_MS) return fn();

    await new Promise((r) => setTimeout(r, LEASE_POLL_MS));
  }
}

/**
 * Run `fn` with no other tab of this origin running it at the same time.
 *
 * `fn` is always run exactly once, even if no locking primitive is available —
 * failing to refresh is worse than refreshing twice, especially now that the
 * server tolerates a retry within its grace window.
 */
export async function withRefreshLock<T>(fn: () => Promise<T>): Promise<T> {
  if (hasWebLocks()) {
    return (navigator as Navigator & {
      locks: { request<R>(name: string, cb: () => Promise<R>): Promise<R> };
    }).locks.request(LOCK_NAME, fn);
  }
  return withLeaseLock(fn);
}
