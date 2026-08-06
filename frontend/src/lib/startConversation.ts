const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

/**
 * Open (or reuse) a 1:1 chat with someone and return the conversation id.
 *
 * POST /api/chat/conversation is create-or-get: it looks for an existing
 * conversation containing both participants before making a new one, so calling
 * this repeatedly never produces duplicate threads for the same pair.
 *
 * Extracted because the same fetch-then-navigate block was already written out
 * in FindCreatorsPage and ProfilePage, and the org/team-member screens needed a
 * third copy.
 */
export async function startConversation(
  token: string | null | undefined,
  userId: string
): Promise<string | null> {
  if (!token || !userId) return null;

  try {
    const res = await fetch(`${API_BASE}/api/chat/conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({ userId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success || !data?.conversation?._id) return null;
    return String(data.conversation._id);
  } catch {
    return null;
  }
}
