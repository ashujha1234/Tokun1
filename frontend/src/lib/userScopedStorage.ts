/**
 * localStorage that belongs to whoever is signed in — and is cleared when they
 * are not.
 *
 * Several features cache the signed-in user's own content under a fixed key:
 * the SmartGen draft, favourites, the unread chat count, saved bank accounts.
 * A fixed key has no idea who wrote it, so on a shared browser the next person
 * to sign in was shown the previous person's data — their generated prompt,
 * their favourites, their bank accounts. Nothing on the server was wrong; the
 * leak was entirely in what the browser had kept.
 *
 * Clearing on logout is not enough on its own, because people close the tab
 * instead of logging out. So this also runs when the signed-in identity
 * CHANGES, which covers the case the bug was actually reported for: sign up
 * with a second account and find the first account's SmartGen output waiting.
 */

/**
 * Everything written for one specific user.
 *
 * Auth keys are deliberately NOT in here — logout owns those, and wiping them
 * from this helper would fight it. Neither are admin keys: an admin session is
 * a separate login that a normal sign-in must not disturb.
 *
 * When you add a localStorage key that holds anything a user typed, bought,
 * favourited or was notified about, add it here too.
 */
const USER_SCOPED_KEYS = [
  // SmartGen
  "smartgen_draft_v1",
  "smartgen_favs",

  // Prompt optimiser
  "optimizer_favs",
  "optimizerInput",
  "detailedPrompt",
  "userPrompt",

  // Chat
  "tokun_chat_badge_count",

  // Money — the most damaging of the set
  "tokun_bank_accounts",
  "tokun_bank_txns",
  "purchaseHistory",

  // Misc per-user state
  "tokun_notifications",
  "llm_provider",
  "SHOW_SUB_POPUP",
  "showAddMemberPopup",
];

/** Remembers who the cached data belongs to. */
const OWNER_KEY = "tokun_storage_owner";

export function clearUserScopedStorage() {
  try {
    for (const key of USER_SCOPED_KEYS) localStorage.removeItem(key);
    localStorage.removeItem(OWNER_KEY);
  } catch {
    // Storage can be unavailable (private mode, quota, disabled). Nothing here
    // is worth breaking a login over.
  }
}

/**
 * Call whenever we learn who is signed in.
 *
 * If it isn't the same person as last time, everything the previous one left
 * behind goes. Runs before the new session writes anything of its own, so the
 * clear can never take the new user's data with it.
 */
export function claimUserScopedStorage(userId?: string | null) {
  try {
    const id = userId ? String(userId) : "";
    if (!id) return;

    const previous = localStorage.getItem(OWNER_KEY);
    if (previous && previous !== id) clearUserScopedStorage();
    localStorage.setItem(OWNER_KEY, id);
  } catch {
    /* see above */
  }
}
