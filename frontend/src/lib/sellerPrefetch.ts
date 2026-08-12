/**
 * Warm cache for everything the "Upload Prompt" flow needs.
 *
 * The flow used to do all its network work *after* the click:
 *
 *   click → payout-status  (round-trip)
 *         → business-categories (round-trip, serial after the first)
 *         → only then render the payout form
 *
 *   click → payout-status  (round-trip)
 *         → only then open the Sell modal → /api/category (round-trip)
 *
 * So the button did nothing visible for one or two full round-trips. None of
 * that data depends on the click, so it is fetched ahead of time and the click
 * reads what's already there.
 *
 * Everything here is best-effort: a failed prefetch just means the consumer
 * falls back to fetching on demand, exactly like before.
 */

export type PayoutStatus = {
  /** false when the HTTP call itself failed — callers must not treat it as an answer. */
  ok: boolean;
  success?: boolean;
  canSell?: boolean;
  hasPayoutSetup?: boolean;
  sellerType?: string;
  message?: string;
};

export type BusinessCategoriesPayload = {
  categories: Record<string, any>;
  kycRequirements: Record<string, any>;
};

/* ── payout status (per token) ─────────────────────────────────────────── */

let payoutToken = "";
let payoutPromise: Promise<PayoutStatus> | null = null;
let payoutSnapshot: PayoutStatus | null = null;

/**
 * The answer if we already have it, without awaiting anything.
 *
 * This is what lets the click decide which modal to open in the same tick —
 * an `await` here, however fast, still costs a frame and the user sees a gap.
 */
export function peekPayoutStatus(token?: string | null): PayoutStatus | null {
  if (!token || token !== payoutToken) return null;
  return payoutSnapshot;
}

export function getPayoutStatus(
  apiBase: string,
  token: string,
  opts: { force?: boolean } = {}
): Promise<PayoutStatus> {
  const base = apiBase.replace(/\/$/, "");

  // A different user in the same tab must never read the previous one's answer.
  if (opts.force || token !== payoutToken) {
    payoutToken = token;
    payoutPromise = null;
    payoutSnapshot = null;
  }

  if (payoutPromise) return payoutPromise;

  payoutPromise = (async () => {
    try {
      const res = await fetch(`${base}/api/bankaccount/payout-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      const status: PayoutStatus = { ok: res.ok, ...data };
      payoutSnapshot = status;
      return status;
    } catch {
      // Not cached as a snapshot — a transient failure shouldn't pin the user
      // to "unknown" for the rest of the session.
      payoutPromise = null;
      return { ok: false };
    }
  })();

  return payoutPromise;
}

/** Call after payout onboarding completes, so the next click re-reads the truth. */
export function clearPayoutStatus() {
  payoutToken = "";
  payoutPromise = null;
  payoutSnapshot = null;
}

/* ── Razorpay business categories (per token) ──────────────────────────── */

let bizToken = "";
let bizPromise: Promise<BusinessCategoriesPayload | null> | null = null;

export function getBusinessCategories(
  apiBase: string,
  token: string
): Promise<BusinessCategoriesPayload | null> {
  const base = apiBase.replace(/\/$/, "");

  if (token !== bizToken) {
    bizToken = token;
    bizPromise = null;
  }
  if (bizPromise) return bizPromise;

  bizPromise = (async () => {
    try {
      const res = await fetch(`${base}/api/bankaccount/business-categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.categories) return null;
      return {
        categories: data.categories,
        kycRequirements: data.kycRequirements ?? {},
      };
    } catch {
      bizPromise = null;
      return null;
    }
  })();

  return bizPromise;
}

/* ── prompt categories (public, shared by everyone) ────────────────────── */

let promptCatsPromise: Promise<any[] | null> | null = null;

export function getPromptCategories(apiBase: string): Promise<any[] | null> {
  const base = apiBase.replace(/\/$/, "");
  if (promptCatsPromise) return promptCatsPromise;

  promptCatsPromise = (async () => {
    try {
      const res = await fetch(`${base}/api/category`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) return null;
      return data.categories || [];
    } catch {
      promptCatsPromise = null;
      return null;
    }
  })();

  return promptCatsPromise;
}

export function clearPromptCategories() {
  promptCatsPromise = null;
}

/**
 * Kick all three off together. Called once the header knows who the user is,
 * long before they reach for the Upload button.
 */
export function primeSellerData(apiBase: string, token: string) {
  if (!token) return;
  void getPayoutStatus(apiBase, token);
  void getBusinessCategories(apiBase, token);
  void getPromptCategories(apiBase);
}
