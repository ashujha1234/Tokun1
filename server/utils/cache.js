/**
 * In-process cache with TTL and an LRU bound.
 *
 * ── Why in-process and not Redis ────────────────────────────────────────────
 *
 * This app runs on a single App Service instance. On one instance a Map in the
 * heap IS a cache — it is what Redis would be, minus a network hop, minus a
 * serialisation round trip, and minus the bill. Redis earns its cost when the
 * cache has to be SHARED, which is a property of running more than one
 * instance, not a property of caching.
 *
 * So this module is deliberately shaped like the small part of Redis that gets
 * used: get/set/del with a TTL, plus wrap() for the read-through pattern. If
 * this app is ever scaled out horizontally, the call sites do not change — only
 * the four functions below do. That is the whole reason it is a module and not
 * a Map declared next to the code that uses it.
 *
 * ── What this is NOT ────────────────────────────────────────────────────────
 *
 * Not durable. A deploy, a restart or an App Service recycle empties it, and
 * that must always be survivable: every read here is a cache of something the
 * database still holds. Nothing may live ONLY in this module.
 *
 * Not shared. With two instances, instance A's invalidation does not reach
 * instance B, and B would keep serving stale data until its own TTL expired.
 * That is the specific reason scaling out needs Redis — see the horizontal
 * scaling notes. Until then, one instance means one cache and the problem does
 * not exist.
 *
 * ── The two bounds ──────────────────────────────────────────────────────────
 *
 * A cache with no ceiling is a memory leak with good intentions: key it by user
 * id and it grows with every user who ever logs in, until the instance dies of
 * it. Two limits keep that from happening:
 *
 *   TTL         every entry has an expiry; nothing is cached forever
 *   maxEntries  a hard cap on entry count, oldest-used evicted first
 *
 * The cap matters more than it looks. TTL alone bounds how STALE an entry gets,
 * not how MANY there are — a burst of ten thousand distinct users inside one TTL
 * window puts ten thousand entries in the heap regardless of expiry.
 */

const DEFAULT_MAX_ENTRIES = 5000;
const SWEEP_INTERVAL_MS = 60 * 1000;

class TTLCache {
  /**
   * @param {string} name        shown in stats(), so a hit rate can be attributed
   * @param {number} maxEntries  hard ceiling on entry count
   */
  constructor(name, maxEntries = DEFAULT_MAX_ENTRIES) {
    this.name = name;
    this.maxEntries = maxEntries;
    /** @type {Map<string, {value: any, expiresAt: number}>} */
    this.store = new Map();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  get(key) {
    const entry = this.store.get(key);

    if (!entry) {
      this.misses++;
      return undefined;
    }

    if (entry.expiresAt <= Date.now()) {
      // Lazy expiry: an entry is only checked when someone asks for it, so an
      // expired key costs nothing until it is touched. The sweep below exists
      // for keys that are never touched again.
      this.store.delete(key);
      this.misses++;
      return undefined;
    }

    /* Re-insert to move this key to the end of the Map's iteration order.
       Map iterates in insertion order, so "oldest entry" is simply the first
       key — which makes eviction below an O(1) read rather than a scan. This
       re-insert is what turns oldest-INSERTED into least-recently-USED. */
    this.store.delete(key);
    this.store.set(key, entry);

    this.hits++;
    return entry.value;
  }

  set(key, value, ttlMs) {
    if (!(ttlMs > 0)) {
      // A zero or negative TTL means "do not cache", not "cache forever". The
      // difference is the kind of bug that is found in production, so it is
      // handled here rather than trusted to callers.
      this.store.delete(key);
      return value;
    }

    // Overwrite first, so replacing an existing key never counts toward the cap.
    this.store.delete(key);
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });

    while (this.store.size > this.maxEntries) {
      const oldest = this.store.keys().next().value;
      if (oldest === undefined) break;
      this.store.delete(oldest);
      this.evictions++;
    }

    return value;
  }

  del(key) {
    return this.store.delete(key);
  }

  /**
   * Drop every key beginning with `prefix`.
   *
   * For invalidating a family of keys at once — "every page of this user's
   * orders" — where the exact keys are not known at the call site because they
   * include a page number or a filter.
   */
  delPrefix(prefix) {
    let removed = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        removed++;
      }
    }
    return removed;
  }

  clear() {
    this.store.clear();
  }

  /**
   * Read-through: return the cached value, or run `fn`, cache what it returns,
   * and return that.
   *
   * `undefined` and `null` results are NOT cached. A lookup that found nothing
   * is usually a lookup that is about to be retried, and caching the absence
   * turns a transient miss into a sticky one — the deleted-then-recreated user
   * problem. Callers wanting negative caching should set() a sentinel value
   * explicitly, so the decision is visible.
   *
   * If `fn` throws, nothing is cached and the error propagates. A failed load
   * must not become a cached failure.
   */
  async wrap(key, ttlMs, fn) {
    const cached = this.get(key);
    if (cached !== undefined) return cached;

    const value = await fn();
    if (value === undefined || value === null) return value;

    return this.set(key, value, ttlMs);
  }

  stats() {
    const total = this.hits + this.misses;
    return {
      name: this.name,
      entries: this.store.size,
      maxEntries: this.maxEntries,
      hits: this.hits,
      misses: this.misses,
      hitRate: total ? Number((this.hits / total).toFixed(3)) : 0,
      evictions: this.evictions,
    };
  }

  /** Drop everything already expired. Called by the sweep below. */
  sweep() {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) {
        this.store.delete(key);
        removed++;
      }
    }
    return removed;
  }
}

/* The named caches. Separate instances rather than one shared keyspace, so that
   a hit rate means something per concern and clearing one cannot clear another
   by prefix accident.

   users — the account behind a Bearer token, read by requireAuth on every
   authenticated request. Capped high because it is keyed per user id.

   config — category lists, plan definitions, pricing tables. A handful of keys
   holding data that changes when someone edits an admin screen, so the cap is
   small and the TTL is long. */
const users = new TTLCache("users", 10000);
const config = new TTLCache("config", 500);

const caches = [users, config];

/* Expired-but-untouched entries would otherwise sit in the heap until something
   asked for that exact key again — which, for a user who logged in once and
   left, is never.

   unref() so this timer never holds the process open: with it, a SIGTERM during
   graceful shutdown would wait on a 60-second interval that has no reason to
   run. */
const sweepTimer = setInterval(() => {
  for (const cache of caches) cache.sweep();
}, SWEEP_INTERVAL_MS);
sweepTimer.unref();

module.exports = { TTLCache, users, config, caches };
