// Catching a ?ref= code and holding onto it until signup.
//
// The gap this bridges: somebody clicks an invite link, lands on the marketing
// site, reads for a while, maybe leaves and comes back tomorrow, and only then
// signs up. The code is in the URL for the first second of that journey and
// nowhere for the rest of it — so it gets written down here on arrival and read
// back at the one moment it matters.

const KEY = "tokun_ref";
const ATTRIBUTION_DAYS = 30; // mirrors REFERRAL_ATTRIBUTION_DAYS on the server

type Stored = { code: string; at: number };

/**
 * Called once on app start. Reads ?ref= out of the URL, keeps it, and removes
 * it from the address bar.
 *
 * The URL is cleaned because the code then follows the visitor into every link
 * they share from that session — and a referrer whose own code gets replaced by
 * a stranger's is the one bug in a referral programme nobody forgives.
 */
export function captureReferralFromUrl() {
  if (typeof window === "undefined") return;

  try {
    const params = new URLSearchParams(window.location.search);
    const code = (params.get("ref") || "").trim().toUpperCase();
    if (!code) return;

    /* First code wins. Somebody who arrives via one invite and later clicks
       another shouldn't have their attribution quietly reassigned — and if it
       could be reassigned, the last person to send a link would always win. */
    if (!getStoredReferral()) {
      localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() } satisfies Stored));
    }

    params.delete("ref");
    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      window.location.pathname + (query ? `?${query}` : "") + window.location.hash
    );
  } catch {
    // Storage blocked or a malformed URL. Losing an attribution is a shrug;
    // throwing on boot is not.
  }
}

/** The stored code, or null once it has gone stale. */
export function getStoredReferral(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;

    const parsed: Stored = JSON.parse(raw);
    const ageDays = (Date.now() - Number(parsed.at || 0)) / 86_400_000;

    if (!parsed.code || ageDays > ATTRIBUTION_DAYS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed.code;
  } catch {
    return null;
  }
}

/** Called after a successful signup — the code has done its job. */
export function clearStoredReferral() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

/**
 * The buyer opened the payment sheet and closed it without paying.
 *
 * Creating the order reserves their welcome discount — that has to happen
 * before they pay, because the money is already split by then. A reserved
 * credit is invisible to the next checkout and to the coupon in the review
 * dialog, so an abandoned attempt used to take the discount away for the hour
 * it took the sweeper to notice. This gives it straight back.
 *
 * Fire-and-forget on purpose: the buyer has just cancelled something, and there
 * is nothing useful to tell them if the release doesn't land. The hourly sweep
 * still catches it.
 */
export function releaseCheckoutHold(opts: {
  token?: string | null;
  orderId?: string | null;
  promptId?: string | number | null;
}) {
  if (!opts.orderId) return;

  fetch(`${API_BASE}/api/referrals/release-checkout`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: JSON.stringify({
      orderId: String(opts.orderId),
      promptId: opts.promptId != null ? String(opts.promptId) : undefined,
    }),
  }).catch(() => {
    /* see above */
  });
}
