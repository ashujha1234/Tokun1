/**
 * Saving a creator, and knowing which ones you already saved.
 *
 * The directory's whole job is helping you find someone, and until now finding
 * them was as far as it went — you read four cards, found the one you wanted,
 * and then had to remember their name. Saving files them under Creators Profile
 * on the Saved page, alongside the products and generations already there.
 *
 * Same endpoints and the same shape as every other save (section "creator"), so
 * this is three thin wrappers rather than a parallel API — see
 * routes/savedCollectionRoutes.js, where the sections are one table.
 */

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

const authHeaders = (token?: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : undefined;

/** The creator ids this user has saved. Empty on any failure — it only decides
 *  which way a bookmark icon points, and a wrong guess is corrected by the
 *  server's own duplicate guard. */
export async function fetchSavedCreatorIds(token?: string | null): Promise<string[]> {
  if (!token) return [];
  try {
    const res = await fetch(`${API_BASE}/api/saved-collections/ids?section=creator`, {
      credentials: "include",
      headers: authHeaders(token),
    });
    const data = await res.json().catch(() => ({}) as any);
    if (!res.ok || !data?.success) return [];
    return (data.ids || []).map(String);
  } catch {
    return [];
  }
}

export async function saveCreator(
  userId: string,
  token: string,
  name?: string
): Promise<{ ok: boolean; alreadySaved?: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/saved-collections`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(authHeaders(token) || {}) },
      body: JSON.stringify({ section: "creator", refId: userId, name }),
    });
    const data = await res.json().catch(() => ({}) as any);
    if (!res.ok || !data?.success) return { ok: false, error: data?.error || `http_${res.status}` };
    return { ok: true, alreadySaved: !!data.alreadySaved };
  } catch {
    return { ok: false, error: "network" };
  }
}

export async function unsaveCreator(userId: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_BASE}/api/saved-collections/creator/${encodeURIComponent(userId)}`,
      { method: "DELETE", credentials: "include", headers: authHeaders(token) }
    );
    const data = await res.json().catch(() => ({}) as any);
    return res.ok && !!data?.success;
  } catch {
    return false;
  }
}
