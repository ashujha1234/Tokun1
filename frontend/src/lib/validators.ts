/**
 * Shared input rules, so every form agrees about what a valid value is.
 *
 * Email in particular was decided three different ways across the auth screens:
 *
 *   Login              — a proper pattern (and only after it was fixed)
 *   Signup             — `!email.trim()`, so a single letter enabled Continue,
 *                        and on the mobile layout there was no check at all
 *   Admin login /
 *   Admin forgot pw    — `length > 3 && includes("@")`, which passes "abc@"
 *                        and "a@b"
 *
 * All of them then let you submit, spend a round-trip, and be told by the server
 * what the form could have told you immediately.
 */

/**
 * Is this something that could be an email address?
 *
 * Deliberately loose — one @, something either side, a dot in the domain.
 * Anything stricter starts rejecting addresses that genuinely deliver (long TLDs,
 * plus-addressing, apostrophes), and the confirmation mail is the only real
 * proof a mailbox exists anyway. This exists to catch what obviously cannot be
 * an address, before it costs anyone a request.
 */
export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());

/** A name/company field with something actually in it. */
export const isNonEmpty = (value: string): boolean => (value || "").trim().length > 0;
