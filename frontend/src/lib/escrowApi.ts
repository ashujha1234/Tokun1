/**
 * Client for the escrow lifecycle that sits either side of a delivery:
 * cancelling, splitting the money when a cancellation isn't clean, mid-project
 * progress checkpoints, and the reference files a client attaches to a brief.
 *
 * All of these routes take the order KIND as a path param — hire deals and
 * service bookings behave identically here, so the server has one router for
 * both and this has one client for both.
 */

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export type OrderKind = "hire" | "service";

/** Every response shape the server can answer a settlement question with. */
export type RevisionState = {
  used: number;
  allowed: number | null;
  unlimited: boolean;
  remaining: number | null;
  exhausted: boolean;
  label: string;
};

export type SettlementPreview = {
  sellerPercent: number;
  sellerPayout: number;
  refundAmount: number;
  platformKeeps: number;
};

export type Dispute = {
  _id: string;
  status: "OPEN" | "PROPOSED" | "ADMIN_REVIEW" | "RESOLVED" | "WITHDRAWN";
  raisedBy: "buyer" | "seller" | "admin";
  reason: string;
  title: string;
  totalPayable: number;
  sellerAmount: number;
  proposedSellerPercent: number | null;
  proposalNote: string;
  proofFiles: { url: string; name: string; size: number }[];
  proposedAt: string | null;
  buyerResponse: "accepted" | "rejected" | "";
  buyerResponseNote: string;
  /** The client's own evidence, attached when they disagreed. */
  buyerProofFiles?: { url: string; name: string; size: number }[];
  finalSellerPercent: number | null;
  finalSellerPayout: number;
  finalRefundAmount: number;
  resolvedVia: string;
  adminNote: string;
  createdAt: string;
};

export type ProgressReview = {
  _id: string;
  status: "REQUESTED" | "SHARED" | "DECLINED" | "EXPIRED";
  requestNote: string;
  requestedAt: string;
  responseNote: string;
  declineReason: string;
  progressPercent: number | null;
  respondedAt: string | null;
  media: { index: number; name: string; kind: "image" | "video" | "file"; size: number }[];
  createdAt: string;
};

export type BriefAttachment = {
  url: string;
  blobName: string;
  name: string;
  size: number;
  mimeType: string;
};

/**
 * Reads the response body once and turns a failure into an Error carrying the
 * server's own `message`.
 *
 * The escrow routes deliberately answer with a sentence a user can act on
 * ("You've used all 2 revisions…", "This creator's payout account is still
 * being verified…") while `error` is a slug. Preferring `message` everywhere is
 * what makes those sentences reach the screen instead of "payout_account_not_active".
 */
async function readJson(res: Response) {
  const data = await res.json().catch(() => ({} as any));
  if (!res.ok || data?.success === false) {
    const err = new Error(data?.message || data?.error || "Something went wrong.");
    (err as any).code = data?.error;
    (err as any).data = data;
    throw err;
  }
  return data;
}

const authHeaders = (token?: string, json = true): Record<string, string> => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...(json ? { "Content-Type": "application/json" } : {}),
});

/* ── Cancellation & disputes ───────────────────────────────────────────────── */

/**
 * Ask to cancel. What actually happens depends on state the server owns, so the
 * outcome comes back rather than being predicted here:
 *   "full_refund"    — nothing had started, or the seller walked away
 *   "dispute_opened" — the buyer cancelled mid-work; the split gets negotiated
 */
export async function cancelOrder(
  kind: OrderKind,
  orderId: string,
  reason: string,
  token?: string
): Promise<{ outcome: "full_refund" | "dispute_opened"; message: string; refundAmount?: number; disputeId?: string }> {
  const res = await fetch(`${API_BASE}/api/escrow/${kind}/${orderId}/cancel`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ reason }),
  });
  return readJson(res);
}

export async function fetchDispute(
  kind: OrderKind,
  orderId: string,
  token?: string
): Promise<{ dispute: Dispute | null; preview: SettlementPreview | null; viewerRole: "buyer" | "seller" }> {
  const res = await fetch(`${API_BASE}/api/escrow/${kind}/${orderId}/dispute`, {
    headers: authHeaders(token, false),
  });
  return readJson(res);
}

/** Seller states the share they completed. */
export async function proposeSplit(
  kind: OrderKind,
  orderId: string,
  body: { sellerPercent: number; note?: string; proofFiles?: BriefAttachment[] },
  token?: string
): Promise<{ dispute: Dispute; preview: SettlementPreview }> {
  const res = await fetch(`${API_BASE}/api/escrow/${kind}/${orderId}/dispute/propose`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return readJson(res);
}

/** Buyer accepts the split (settles immediately) or rejects it (goes to admin). */
export async function respondToSplit(
  kind: OrderKind,
  orderId: string,
  // proofFiles only mean anything on a reject — that's the moment the case
  // leaves the two of them and an arbitrator needs to see the work.
  body: { action: "accept" | "reject"; note?: string; proofFiles?: BriefAttachment[] },
  token?: string
): Promise<{ outcome: "settled" | "escalated"; message: string; sellerPayout?: number; refundAmount?: number }> {
  const res = await fetch(`${API_BASE}/api/escrow/${kind}/${orderId}/dispute/respond`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return readJson(res);
}

export async function withdrawCancellation(kind: OrderKind, orderId: string, token?: string) {
  const res = await fetch(`${API_BASE}/api/escrow/${kind}/${orderId}/dispute/withdraw`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return readJson(res);
}

/* ── Progress reviews ──────────────────────────────────────────────────────── */

export async function fetchProgressReviews(
  kind: OrderKind,
  orderId: string,
  token?: string
): Promise<{
  reviews: ProgressReview[];
  openRequest: { _id: string; requestNote: string } | null;
  canRequest: boolean;
  viewerRole: "buyer" | "seller";
}> {
  const res = await fetch(`${API_BASE}/api/progress-review/${kind}/${orderId}`, {
    headers: authHeaders(token, false),
  });
  return readJson(res);
}

export async function requestProgressReview(
  kind: OrderKind,
  orderId: string,
  note: string,
  token?: string
) {
  const res = await fetch(`${API_BASE}/api/progress-review/${kind}/${orderId}/request`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ note }),
  });
  return readJson(res);
}

export async function respondToProgressReview(
  kind: OrderKind,
  orderId: string,
  body: {
    action: "share" | "decline";
    note?: string;
    reason?: string;
    progressPercent?: number | null;
    media?: BriefAttachment[];
  },
  token?: string
) {
  const res = await fetch(`${API_BASE}/api/progress-review/${kind}/${orderId}/respond`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return readJson(res);
}

/** Progress media sits in a private container, same as deliverables. */
export async function openProgressMedia(reviewId: string, index: number, token?: string) {
  const res = await fetch(`${API_BASE}/api/progress-review/${reviewId}/media/${index}/download`, {
    headers: authHeaders(token, false),
  });
  const data = await readJson(res);
  window.open(data.url, "_blank", "noopener,noreferrer");
}

/* ── Uploads ───────────────────────────────────────────────────────────────── */

/**
 * Uploads one file and returns a descriptor to submit alongside the brief (or a
 * progress reply, or a proof-of-work claim).
 *
 * `endpoint` differs only in which private prefix the blob lands under; both
 * return the same shape, and in both cases only `blobName` is trusted by the
 * server — a descriptor with a made-up URL and no blobName is dropped.
 */
async function uploadTo(endpoint: string, file: File, token?: string): Promise<BriefAttachment> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: authHeaders(token, false),
    body: formData,
  });
  const data = await readJson(res);
  return data.file;
}

export const uploadBriefFile = (file: File, token?: string) =>
  uploadTo("/api/brief/upload", file, token);

export const uploadProgressMedia = (file: File, token?: string) =>
  uploadTo("/api/progress-review/media/upload", file, token);

/** A brief attachment on an existing order — gated the same way as work files. */
export async function openBriefAttachment(
  kind: OrderKind,
  orderId: string,
  index: number,
  token?: string
) {
  const res = await fetch(
    `${API_BASE}/api/brief/${kind}/${orderId}/attachments/${index}/download`,
    { headers: authHeaders(token, false) }
  );
  const data = await readJson(res);
  window.open(data.url, "_blank", "noopener,noreferrer");
}

/* ── Formatting shared by every escrow screen ──────────────────────────────── */

export const rupees = (n?: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

/**
 * How long is left on a delivery deadline, in words.
 *
 * Deliberately coarse below a day — "4 hours left" is what a seller needs to
 * act on; ticking seconds would only add noise. Past the deadline it says so
 * rather than counting up, because at that point the only number that matters
 * is that it's gone.
 */
export function deadlineLabel(dueAt?: string | null, now: number = Date.now()) {
  if (!dueAt) return null;

  const due = new Date(dueAt).getTime();
  if (Number.isNaN(due)) return null;

  const msLeft = due - now;
  const overdue = msLeft <= 0;
  const ms = Math.abs(msLeft);

  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);

  const span =
    days > 0
      ? `${days} day${days === 1 ? "" : "s"}${hours > 0 ? ` ${hours}h` : ""}`
      : hours > 0
        ? `${hours} hour${hours === 1 ? "" : "s"}`
        : `${Math.max(1, minutes)} minute${minutes === 1 ? "" : "s"}`;

  return {
    overdue,
    span,
    text: overdue ? `${span} overdue` : `${span} left`,
    // Amber inside the last day, red once it's gone — the two states a seller
    // has to notice from across the page.
    tone: overdue ? "late" : days < 1 ? "soon" : "ok",
  } as const;
}

export { API_BASE as ESCROW_API_BASE };
