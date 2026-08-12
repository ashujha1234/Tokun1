// Route-based escrow for freelance work (hire deals + service bookings).
//
// Prompt sales already route money through Razorpay Route, but they hold it for
// a fixed 24 hours (`on_hold_until`) and let Razorpay release it on a timer.
// Freelance work can't work that way: release depends on the CLIENT APPROVING,
// which might be tomorrow or three weeks from now, and a revision request has
// to push it back indefinitely.
//
// So freelance transfers are created with `on_hold: 1` and NO `on_hold_until`
// — held by Razorpay until we explicitly release them.
//
//   Why not set on_hold_until at submission and let Razorpay auto-release?
//   Because then a revision request would have to REMOVE that timestamp, and if
//   that API call failed the money would auto-release to a freelancer who is
//   still mid-revision. Failure has to fall on the safe side: with an
//   indefinite hold, a failed call leaves the money exactly where it is and the
//   hourly auto-release cron simply retries.
//
// The 72-hour "client didn't respond" clock therefore lives in our own cron
// (cron/autoRelease*.js), not in Razorpay.

const BankAccount = require("../models/BankAccount");

const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

function getRazorpayAuthHeader() {
  return `Basic ${Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString("base64")}`;
}

/**
 * The freelancer's payout account, but only if Razorpay has actually ACTIVATED
 * it.
 *
 * Deliberately stricter than routePayouts.getSellerLinkedAccountId(), which
 * accepts routeStatus:"CREATED" alone. routeStatus only records that our
 * create-account call succeeded — the account can sit in UNDER_REVIEW,
 * NEEDS_CLARIFICATION or SUSPENDED for days after that, and a transfer to one
 * of those cannot be settled. `activationStatus` is Razorpay's real verdict,
 * kept current by the account.* webhooks, and it's the same signal that already
 * gates prompt-marketplace listing.
 *
 * @returns {Promise<string|null>} linked account id, or null if not payout-ready
 */
async function getActiveLinkedAccountId(userId) {
  const bankAccount = await BankAccount.findOne({
    userId,
    routeStatus: "CREATED",
    activationStatus: "ACTIVATED",
    routeLinkedAccountId: { $ne: null },
  }).sort({ default: -1, createdAt: -1 });

  return bankAccount?.routeLinkedAccountId || null;
}

// Distinct reasons a freelancer isn't payable yet, so the gate can tell them
// what to actually do instead of a flat "not available".
const PAYOUT_BLOCK_MESSAGES = {
  no_account:
    "This creator hasn't finished setting up payouts yet, so bookings can't be taken. Please try again later.",
  under_review:
    "This creator's payout account is still being verified by our payments partner. Bookings open as soon as that clears.",
  needs_clarification:
    "This creator's payout account needs more information before it can receive money. Bookings are paused until that's done.",
  suspended: "This creator's payout account is currently suspended, so bookings can't be taken.",
  rejected: "This creator can't receive payouts, so bookings can't be taken.",
};

const SELF_BLOCK_MESSAGES = {
  no_account:
    "Set up your payout account before taking paid work — Settings → Payouts. Clients can't pay you until it's done.",
  under_review:
    "Your payout account is still being verified. You'll be able to take paid work as soon as it's approved.",
  needs_clarification:
    "Your payout account needs more information. Finish that in Settings → Payouts to start taking paid work.",
  suspended: "Your payout account is suspended, so you can't take paid work right now. Contact support.",
  rejected: "Your payout account was rejected, so you can't take paid work. Contact support.",
};

const STATUS_TO_REASON = {
  UNDER_REVIEW: "under_review",
  NEEDS_CLARIFICATION: "needs_clarification",
  SUSPENDED: "suspended",
  REJECTED: "rejected",
  CREATED: "under_review",
};

/**
 * Gate for "can this person be paid for freelance work right now".
 *
 * Called before a booking is created, and again before payment — the account
 * can be suspended in between, and taking the client's money for work we can't
 * pay out for is the one outcome worth several extra queries to avoid.
 *
 * @param {ObjectId|string} userId  the freelancer/seller who would be paid
 * @param {"buyer"|"self"} audience whose wording to use in the message
 * @returns {Promise<{ok: boolean, linkedAccountId?: string, error?: string, message?: string}>}
 */
async function checkPayoutReady(userId, audience = "buyer") {
  const linkedAccountId = await getActiveLinkedAccountId(userId);
  if (linkedAccountId) return { ok: true, linkedAccountId };

  // Not payable — work out why, so the message can be specific.
  const anyAccount = await BankAccount.findOne({ userId })
    .select("activationStatus routeStatus")
    .sort({ default: -1, createdAt: -1 });

  const reason = anyAccount?.activationStatus
    ? STATUS_TO_REASON[anyAccount.activationStatus] || "under_review"
    : "no_account";

  const messages = audience === "self" ? SELF_BLOCK_MESSAGES : PAYOUT_BLOCK_MESSAGES;

  return {
    ok: false,
    error: "payout_account_not_active",
    reason,
    message: messages[reason] || messages.no_account,
  };
}

/**
 * One entry for a Razorpay order's `transfers[]`, held indefinitely.
 *
 * Attached at order-creation time rather than created separately after capture:
 * Razorpay then applies it as part of the capture itself, so there is no window
 * where the client's money has been taken but the transfer call failed.
 *
 * Note the deliberate absence of `on_hold_until` — see the file header.
 *
 * @param {{account: string, amountRupees: number, notes?: object}} args
 */
function buildHeldTransfer({ account, amountRupees, notes = {} }) {
  return {
    account,
    amount: Math.round(Number(amountRupees) * 100),
    currency: "INR",
    on_hold: 1,
    notes,
  };
}

/**
 * Release a held transfer — the money leaves Tokun's balance and starts
 * settling to the freelancer on their linked account's own schedule.
 *
 * Called on client approval and by the auto-release cron. Idempotent from our
 * side in the sense that releasing an already-released transfer is a no-op for
 * the money; callers still guard with an atomic status claim so two paths can't
 * both think they did it.
 */
async function releaseTransfer(transferId) {
  const res = await fetch(`https://api.razorpay.com/v1/transfers/${transferId}`, {
    method: "PATCH",
    headers: {
      Authorization: getRazorpayAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ on_hold: 0 }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error?.description || `Transfer release failed: ${res.status}`);
    err.razorpay = data;
    throw err;
  }
  return data;
}

async function fetchTransfer(transferId) {
  const res = await fetch(`https://api.razorpay.com/v1/transfers/${transferId}`, {
    headers: { Authorization: getRazorpayAuthHeader() },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error?.description || `Fetch transfer failed: ${res.status}`);
    err.razorpay = data;
    throw err;
  }
  return data;
}

module.exports = {
  getActiveLinkedAccountId,
  checkPayoutReady,
  buildHeldTransfer,
  releaseTransfer,
  fetchTransfer,
};
