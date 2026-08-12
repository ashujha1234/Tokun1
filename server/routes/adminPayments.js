// routes/adminPayments.js
//
// One page that answers "where is the money" without opening the Razorpay
// dashboard.
//
// The admin dashboard could show what Tokun EARNED (PlatformWallet) but nothing
// about what Razorpay took, what was actually captured, or what went back out
// as refunds — so reconciling a month meant logging into Razorpay and reading
// two systems side by side. This joins them:
//
//   • captured        — what clients actually paid, straight from Razorpay
//   • razorpayFee/tax — Razorpay's own cut, per payment, which no local record
//                       has ever held
//   • refunded        — what went back
//   • tokunCommission — our ledger, for the same window
//   • net             — commission minus Razorpay's charges, i.e. what Tokun
//                       genuinely kept
//
// Razorpay is the source of truth for the first three; nothing here is derived
// from our own guess at what a payment should have been.

const express = require("express");
const router = express.Router();
const PlatformWallet = require("../models/PlatformWallet");
const LedgerEntry = require("../models/LedgerEntry");
const WebhookEvent = require("../models/WebhookEvent");
const { requireAuth } = require("../utils/auth");

const RZP_KEY = process.env.RAZORPAY_KEY_ID;
const RZP_SECRET = process.env.RAZORPAY_KEY_SECRET;

function authHeader() {
  return "Basic " + Buffer.from(`${RZP_KEY}:${RZP_SECRET}`).toString("base64");
}

function requireAdmin(req, res, next) {
  if (!req.isAdmin) return res.status(403).json({ success: false, error: "forbidden" });
  next();
}

router.use(requireAuth, requireAdmin);

/** Paise → rupees. Razorpay speaks paise everywhere. */
const r = (paise) => +(Number(paise || 0) / 100).toFixed(2);

/**
 * Pulls every payment in the window.
 *
 * Razorpay caps a page at 100, so this walks. Hard-capped at MAX_PAGES because
 * an admin screen must not be able to make thousands of upstream calls; when
 * the cap is hit the response says so rather than quietly showing a partial
 * total as if it were complete.
 */
async function fetchPayments(from, to) {
  const MAX_PAGES = 20; // 2,000 payments
  const out = [];
  let skip = 0;
  let truncated = false;

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = `https://api.razorpay.com/v1/payments?count=100&skip=${skip}&from=${from}&to=${to}`;
    const res = await fetch(url, { headers: { Authorization: authHeader() } });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const err = new Error(data?.error?.description || `Razorpay ${res.status}`);
      err.status = res.status;
      throw err;
    }

    const items = data?.items || [];
    out.push(...items);
    if (items.length < 100) return { payments: out, truncated: false };
    skip += 100;
    truncated = page === MAX_PAGES - 1;
  }

  return { payments: out, truncated };
}

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/admin/payments?days=30
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/", async (req, res) => {
  try {
    if (!RZP_KEY || !RZP_SECRET) {
      return res.status(503).json({
        success: false,
        error: "razorpay_not_configured",
        message: "Razorpay keys aren't set on the server, so live payment data can't be read.",
      });
    }

    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);
    const to = Math.floor(Date.now() / 1000);
    const from = to - days * 86400;

    const { payments, truncated } = await fetchPayments(from, to);

    /* Only captured payments count as money in. `authorized` has been
       ring-fenced on the customer's card but not taken, and `failed` never
       existed — including either would overstate revenue. */
    const captured = payments.filter((p) => p.status === "captured");

    const totals = captured.reduce(
      (acc, p) => {
        acc.captured += Number(p.amount || 0);
        // Razorpay's own charge. Present only once the payment is settled by
        // them, so a same-day figure legitimately reads 0 and climbs later.
        acc.razorpayFee += Number(p.fee || 0);
        acc.razorpayTax += Number(p.tax || 0);
        acc.refunded += Number(p.amount_refunded || 0);
        return acc;
      },
      { captured: 0, razorpayFee: 0, razorpayTax: 0, refunded: 0 }
    );

    /* Tokun's own earnings over the same window, from our ledger.

       The types here are "commission" and "refund", NOT "credit"/"debit" — a
       filter on "credit" matches nothing and reports ₹0 commission against a
       ₹1.2 lakh month, which reads as the commission having stopped working. */
    const wallet = await PlatformWallet.findOne({ key: "platform" }).lean();
    const since = new Date(from * 1000);
    const ledgerTxns = (wallet?.transactions || []).filter(
      (t) => new Date(t.createdAt) >= since
    );
    // Commission given back when a purchase is refunded is a real reduction in
    // what Tokun earned, so it is netted off rather than shown separately.
    const tokunCommission = +ledgerTxns
      .reduce(
        (s, t) => s + (t.type === "refund" ? -Number(t.amount || 0) : Number(t.amount || 0)),
        0
      )
      .toFixed(2);
    const commissionTxns = ledgerTxns;

    const razorpayCharges = r(totals.razorpayFee + totals.razorpayTax);

    const byMethod = {};
    for (const p of captured) {
      const m = p.method || "other";
      byMethod[m] = byMethod[m] || { method: m, count: 0, amount: 0 };
      byMethod[m].count += 1;
      byMethod[m].amount += Number(p.amount || 0);
    }

    return res.json({
      success: true,
      range: { days, from: new Date(from * 1000), to: new Date(to * 1000) },
      truncated,
      totals: {
        capturedCount: captured.length,
        captured: r(totals.captured),
        refunded: r(totals.refunded),
        razorpayFee: r(totals.razorpayFee),
        razorpayTax: r(totals.razorpayTax),
        razorpayCharges,
        tokunCommission,
        // What Tokun actually kept once the processor was paid. Can go
        // negative on a month of refunds — Razorpay's fee is not returned when
        // a payment is refunded, so that is a real loss, not a display bug.
        net: +(tokunCommission - razorpayCharges).toFixed(2),
        platformBalance: Number(wallet?.availableBalance || 0),
        platformTotalRevenue: Number(wallet?.totalRevenue || 0),
      },
      byMethod: Object.values(byMethod)
        .map((m) => ({ ...m, amount: r(m.amount) }))
        .sort((a, b) => b.amount - a.amount),
      payments: captured
        .slice(0, 200)
        .map((p) => ({
          id: p.id,
          amount: r(p.amount),
          refunded: r(p.amount_refunded),
          fee: r(p.fee),
          tax: r(p.tax),
          method: p.method,
          status: p.status,
          email: p.email,
          contact: p.contact,
          createdAt: new Date(Number(p.created_at) * 1000),
          // Set by our own order creation — tells the admin what this payment
          // was FOR without another lookup.
          kind: p.notes?.kind || p.notes?.project || "",
          orderRef: p.notes?.dealId || p.notes?.orderId || p.notes?.serviceOrderId || "",
        })),
      commissionTxns: commissionTxns.slice(-50).reverse(),
    });
  } catch (err) {
    console.error("admin payments error:", err);
    return res.status(502).json({
      success: false,
      error: "razorpay_unreachable",
      message: err?.message || "Couldn't read payment data from Razorpay.",
    });
  }
});

/* =====================================================================
   GET /api/admin/payments/ledger — the same money, from OUR database

   Deliberately a SEPARATE endpoint rather than a change to `/` above. That
   one reads Razorpay live and keeps doing so; this one reads what we
   recorded. Two independent views of the same money is the point — where
   they disagree is exactly what reconciliation needs to surface, and
   collapsing them into one source would hide it.

   It also answers the questions Razorpay's API can't: which purchase a
   payment was for, which seller, whether a refund came from our admin queue
   or straight from the Razorpay dashboard.

   Query: ?days=30  &kind=REFUND  &purpose=PROMPT_PURCHASE  &limit=200
   ===================================================================== */
router.get("/ledger", async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
    const limit = Math.min(Math.max(Number(req.query.limit) || 200, 1), 1000);
    const since = new Date(Date.now() - days * 86400 * 1000);

    const filter = { occurredAt: { $gte: since } };
    if (req.query.kind) filter.kind = String(req.query.kind);
    if (req.query.purpose) filter.purpose = String(req.query.purpose);

    const [entries, totals] = await Promise.all([
      LedgerEntry.find(filter)
        .sort({ occurredAt: -1 })
        .limit(limit)
        .populate("user", "name email")
        .populate("counterparty", "name email")
        .lean(),
      // Grouped in the database rather than summed in JS — the whole window
      // may be far larger than the `limit` above, and totals that only cover
      // the first page are worse than no totals.
      LedgerEntry.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { kind: "$kind", direction: "$direction" },
            count: { $sum: 1 },
            amount: { $sum: "$amount" },
            fee: { $sum: "$fee" },
            tax: { $sum: "$tax" },
          },
        },
      ]),
    ]);

    // Paise → rupees at the edge only. Everything above this line is integers,
    // which is what keeps the sums exact.
    const r = (paise) => +((Number(paise) || 0) / 100).toFixed(2);

    return res.json({
      success: true,
      range: { days, since },
      count: entries.length,
      truncated: entries.length === limit,
      totals: totals.map((t) => ({
        kind: t._id.kind,
        direction: t._id.direction,
        count: t.count,
        amount: r(t.amount),
        fee: r(t.fee),
        tax: r(t.tax),
      })),
      entries: entries.map((e) => ({
        id: e._id,
        kind: e.kind,
        purpose: e.purpose,
        direction: e.direction,
        amount: r(e.amount),
        fee: r(e.fee),
        tax: r(e.tax),
        currency: e.currency,
        occurredAt: e.occurredAt,
        recordedAt: e.createdAt,
        method: e.method,
        methodDetail: e.methodDetail,
        source: e.source,
        razorpayPaymentId: e.razorpayPaymentId,
        razorpayRefundId: e.razorpayRefundId,
        razorpayTransferId: e.razorpayTransferId,
        razorpaySettlementId: e.razorpaySettlementId,
        user: e.user ? { id: e.user._id, name: e.user.name, email: e.user.email } : null,
        counterparty: e.counterparty
          ? { id: e.counterparty._id, name: e.counterparty.name, email: e.counterparty.email }
          : null,
        purchase: e.purchase,
        hireDeal: e.hireDeal,
        serviceOrder: e.serviceOrder,
        meta: e.meta,
      })),
    });
  } catch (err) {
    console.error("admin ledger error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* =====================================================================
   GET /api/admin/payments/webhooks — recent webhook deliveries

   For the "did Razorpay actually tell us?" question. Payload is omitted from
   the list (they're large); fetch one by id to see it in full.
   ===================================================================== */
router.get("/webhooks", async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
    const filter = {};
    if (req.query.status) filter.status = String(req.query.status);
    if (req.query.event) filter.event = String(req.query.event);

    const events = await WebhookEvent.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("-payload")
      .lean();

    return res.json({ success: true, count: events.length, events });
  } catch (err) {
    console.error("admin webhooks error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

router.get("/webhooks/:id", async (req, res) => {
  try {
    const event = await WebhookEvent.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ success: false, error: "not_found" });
    return res.json({ success: true, event });
  } catch (err) {
    console.error("admin webhook detail error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
