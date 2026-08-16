// Client for /api/product-reviews — buyer reviews on a product (a prompt).
//
// Kept out of the components so the marketplace, the saved collection and the
// details panel all talk to the API the same way; the endpoints are documented
// in server/routes/productReviews.js.

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export type ProductReview = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  response?: string;
  respondedAt?: string | null;
  buyer: { id: string; name: string; avatarUrl?: string | null };
  verifiedPurchase: boolean;
};

export type ReviewSummary = {
  average: number;
  count: number;
  breakdown: Record<string, number>;
};

const authHeaders = (token?: string | null): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {};

/** Public: the summary and a page of reviews. */
export async function fetchProductReviews(
  promptId: string,
  opts: { limit?: number; skip?: number } = {}
): Promise<{ summary: ReviewSummary; reviews: ProductReview[]; hasMore: boolean }> {
  const params = new URLSearchParams();
  if (opts.limit) params.set("limit", String(opts.limit));
  if (opts.skip) params.set("skip", String(opts.skip));

  const res = await fetch(
    `${API_BASE}/api/product-reviews/${promptId}${params.toString() ? `?${params}` : ""}`,
    { credentials: "include" }
  );
  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data?.success) throw new Error(data?.error || `http_${res.status}`);

  return {
    summary: data.summary || { average: 0, count: 0, breakdown: {} },
    reviews: data.reviews || [],
    hasMore: !!data.hasMore,
  };
}

/** Signed in: may I review this, and what did I say last time. */
export async function fetchMyProductReview(
  promptId: string,
  token?: string | null
): Promise<{ canReview: boolean; reason: string | null; myReview: { id: string; rating: number; comment: string } | null }> {
  const res = await fetch(`${API_BASE}/api/product-reviews/${promptId}/mine`, {
    credentials: "include",
    headers: authHeaders(token),
  });
  const data = await res.json().catch(() => ({}));

  // Not signed in, or the prompt is gone — the form just stays hidden, which is
  // a normal state rather than something to throw about.
  if (!res.ok || !data?.success) return { canReview: false, reason: "unavailable", myReview: null };

  return { canReview: !!data.canReview, reason: data.reason ?? null, myReview: data.myReview ?? null };
}

/** Create or replace my review. */
export async function submitProductReview(
  promptId: string,
  body: { rating: number; comment?: string },
  token?: string | null
): Promise<{ summary: ReviewSummary }> {
  const res = await fetch(`${API_BASE}/api/product-reviews/${promptId}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data?.success) {
    // The server's message is written for the buyer ("Only people who've bought
    // this product can review it") — better than anything generic here.
    throw new Error(data?.message || data?.error || `http_${res.status}`);
  }

  return { summary: data.summary };
}

/** Withdraw my review. */
export async function deleteProductReview(promptId: string, token?: string | null) {
  const res = await fetch(`${API_BASE}/api/product-reviews/${promptId}`, {
    method: "DELETE",
    credentials: "include",
    headers: authHeaders(token),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data?.success) throw new Error(data?.message || data?.error || `http_${res.status}`);
  return data;
}
