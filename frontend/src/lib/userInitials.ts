/**
 * Initials for an avatar fallback: first letter of the first name plus first
 * letter of the last name ("Shivani Santosh Pandey" → "SP").
 *
 * Middle names are skipped on purpose — three letters is a word, not a monogram.
 * Falls back to the email's local part so an account that never filled in a name
 * still gets something better than a blank circle.
 */
export function userInitials(name?: string | null, email?: string | null): string {
  const words = (name || "").trim().split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  const local = (email || "").split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
  return local ? local.slice(0, 2).toUpperCase() : "U";
}

/**
 * The avatar image a user has actually uploaded, if any.
 *
 * The field is `avatarUrl` on the User schema, but several endpoints hand it
 * back as `avatar`, so both spellings turn up on the client object depending on
 * which response last populated it.
 */
export function userAvatarUrl(user?: { avatarUrl?: string | null; avatar?: string | null } | null) {
  const url = user?.avatarUrl || user?.avatar || "";
  return url.trim() ? url : null;
}
