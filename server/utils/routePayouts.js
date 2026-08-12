// Route (Linked Account) plumbing shared by the single-prompt and cart purchase
// flows. Both need the same three answers — does this seller have a linked
// account, what transfers did Razorpay attach to this payment, and how long is
// a seller's money held — and they have to agree, or a seller gets paid twice
// (once by Route, once by the Wallet ledger) or not at all.
const BankAccount = require("../models/BankAccount");

const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Seller money is held for exactly the buyer's refund window, so an approved
// refund inside the window never needs a transfer reversal — the funds haven't
// left Tokun's balance yet. Must match the window the refund route enforces.
const REFUND_WINDOW_HOURS = Number(process.env.REFUND_WINDOW_HOURS || 24);

function getRazorpayAuthHeader() {
  return `Basic ${Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString("base64")}`;
}

// The seller's registered Route Linked Account, or null if they haven't
// onboarded — callers fall back to the Wallet ledger in that case.
async function getSellerLinkedAccountId(sellerId) {
  const bankAccount = await BankAccount.findOne({
    userId: sellerId,
    routeStatus: "CREATED",
    routeLinkedAccountId: { $ne: null },
  }).sort({ default: -1, createdAt: -1 });

  return bankAccount?.routeLinkedAccountId || null;
}

async function fetchTransfersForPayment(paymentId) {
  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/transfers`, {
    headers: { Authorization: getRazorpayAuthHeader() },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error?.description || `Fetch transfers failed: ${res.status}`);
    err.razorpay = data;
    throw err;
  }
  return data;
}

// linked account id -> transfer id, for the transfers Razorpay attached to one
// payment. A cart order carries one transfer per seller, so the account id is
// what maps a transfer back to the purchase rows it paid for.
async function fetchTransferIdsByAccount(paymentId) {
  const resp = await fetchTransfersForPayment(paymentId);
  const byAccount = new Map();
  for (const t of resp?.items || []) {
    // `recipient` is the linked account the transfer went to.
    if (t?.recipient && t?.id) byAccount.set(String(t.recipient), String(t.id));
  }
  return byAccount;
}

function transferOnHoldUntil() {
  return Math.floor(Date.now() / 1000) + REFUND_WINDOW_HOURS * 3600;
}

// Reverse one specific transfer by a specific amount.
//
// Needed because a cart payment carries one transfer PER SELLER, so refunding a
// single item out of a multi-item cart must not use the refund API's
// `reverse_all` flag — that reverses every transfer on the payment, clawing back
// money from sellers whose prompts were never refunded. A single-prompt payment
// has exactly one transfer, where reverse_all is equivalent and stays in use.
async function reverseTransfer(transferId, amountRupees) {
  const res = await fetch(`https://api.razorpay.com/v1/transfers/${transferId}/reversals`, {
    method: "POST",
    headers: {
      Authorization: getRazorpayAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount: Math.round(Number(amountRupees) * 100) }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error?.description || `Transfer reversal failed: ${res.status}`);
    err.razorpay = data;
    throw err;
  }
  return data;
}

/**
 * Send money straight from Tokun's own balance to a linked account.
 *
 * ⚠️ NOT USABLE ON THIS ACCOUNT, and nothing calls it. Kept only so the next
 * person doesn't reach for the same idea and lose the same afternoon:
 *
 *     POST /v1/transfers { account: "acc_…", amount: 15000 }
 *     → 400 "This feature is not enabled for this merchant."
 *
 * Transfers from account balance are gated separately from the payment-linked
 * transfers the escrow uses (create-on-order, reverse, release), which all work
 * fine. Enable "Transfers from Account Balance" on the Razorpay account before
 * calling this.
 *
 * The escrow avoids needing it at all: the held transfer carries the FULL
 * payment, so every settlement outcome is payable by releasing or reversing
 * that one hold.
 *
 * @param {string} account   acc_xxx linked account id
 * @param {number} amountRupees
 * @param {object} [notes]
 */
async function createDirectTransfer(account, amountRupees, notes = {}) {
  const paise = Math.round(Number(amountRupees) * 100);
  if (!account || !(paise > 0)) return null;

  const res = await fetch("https://api.razorpay.com/v1/transfers", {
    method: "POST",
    headers: {
      Authorization: getRazorpayAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ account, amount: paise, currency: "INR", notes }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error?.description || `Direct transfer failed: ${res.status}`);
    err.razorpay = data;
    throw err;
  }
  return data;
}

module.exports = {
  REFUND_WINDOW_HOURS,
  getRazorpayAuthHeader,
  getSellerLinkedAccountId,
  fetchTransfersForPayment,
  fetchTransferIdsByAccount,
  transferOnHoldUntil,
  reverseTransfer,
  createDirectTransfer,
};
