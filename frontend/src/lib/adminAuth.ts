// Reading the admin's token out of storage.
//
// This resolution order already existed in three places (the dashboard, the
// seller message modal, the refunds page), each written out by hand. The order
// matters and is easy to get subtly wrong: the ADMIN key has to be checked
// first, because a plain user signed in on the same browser also has a "token",
// and picking that one sends admin requests as that user — which fails as a
// 403 that looks like a permissions bug rather than a wrong-token bug.
//
// New admin components import this instead of writing a fourth copy.

const ADMIN_TOKEN_KEYS = [
  "tokun_admin_token",
  "adminToken",
  "token",
  "tokun_token",
  "accessToken",
  "authToken",
] as const;

export function getAdminToken(): string {
  for (const key of ADMIN_TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    // Stored with a "Bearer " prefix in at least one place historically —
    // stripped here so callers can add exactly one.
    if (value) return value.replace(/^Bearer\s+/i, "").trim();
  }
  return "";
}

export function adminAuthHeaders(): Record<string, string> {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
