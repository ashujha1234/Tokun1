// server/routes/adminPlatformRevenue.js
const express = require("express");
const router = express.Router();
const PlatformWallet = require("../models/PlatformWallet");

// GET /api/admin/platform-revenue — Tokun's own commission earnings summary
router.get("/", async (req, res) => {
  try {
    let wallet = await PlatformWallet.findOne({ key: "platform" });
    if (!wallet) wallet = await PlatformWallet.create({ key: "platform" });

    return res.json({
      success: true,
      availableBalance: wallet.availableBalance,
      totalRevenue: wallet.totalRevenue,
      totalWithdrawn: wallet.totalWithdrawn,
      // GST charged on Tokun's fees and collected from buyers and sellers.
      // Reported alongside revenue but never inside it — this is owed to the
      // government, and it is not part of availableBalance either.
      gstCollected: wallet.gstCollected || 0,
      transactions: wallet.transactions.slice(0, 50),
    });
  } catch (err) {
    console.error("GET /api/admin/platform-revenue error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* POST /api/admin/platform-revenue/withdraw was here.

   Removed along with the "Mark as Withdrawn" button. Commission lands in
   Tokun's Razorpay account directly — there is no separate transfer for an
   admin to record, so the route only ever moved a number from availableBalance
   into totalWithdrawn and made the ledger disagree with the bank.

   PlatformWallet.markWithdrawn() is left in place: it is what would be needed
   if payouts ever become a real, reconciled movement. Nothing calls it today.

   GET /by-source below is the panel that replaced it — where the money came
   from, which is the question the withdraw button was never answering. */

// GET /api/admin/platform-revenue/by-source?days=30
// Commission split by what generated it, plus a per-day series for the chart.
// Reads the wallet's own transaction ledger — the same rows the summary above
// returns, aggregated rather than sliced.
router.get("/by-source", async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const wallet = await PlatformWallet.findOne({ key: "platform" }).lean();
    if (!wallet) {
      return res.json({
        success: true,
        days,
        bySource: [],
        series: [],
        totals: { commission: 0, refunded: 0, net: 0 },
        ledgerTruncated: false,
      });
    }

    const rows = (wallet.transactions || []).filter(
      (t) => new Date(t.createdAt) >= since
    );

    /* Group the raw enum into the three buckets an admin thinks in. Services
       and hire deals are one line because they're the same product to a buyer:
       paid work delivered through escrow. */
    const BUCKET = {
      subscription: "Subscriptions",
      prompt_purchase: "Prompt sales",
      service_purchase: "Services & hire",
      hire_escrow: "Services & hire",
    };

    const bucketTotals = new Map();
    const byDay = new Map();
    let commission = 0;
    let refunded = 0;

    for (const t of rows) {
      // GST is the government's, and withdrawals aren't income — neither is
      // revenue, so neither belongs in a "where did the money come from" view.
      if (t.type !== "commission" && t.type !== "refund") continue;

      const bucket = BUCKET[t.source];
      if (!bucket) continue;

      // A refund reverses commission already counted, so it subtracts from the
      // bucket it came from rather than forming a bucket of its own.
      const signed = t.type === "refund" ? -Number(t.amount || 0) : Number(t.amount || 0);
      if (t.type === "refund") refunded += Number(t.amount || 0);
      else commission += Number(t.amount || 0);

      bucketTotals.set(bucket, (bucketTotals.get(bucket) || 0) + signed);

      const day = new Date(t.createdAt).toISOString().slice(0, 10);
      if (!byDay.has(day)) {
        byDay.set(day, { day, Subscriptions: 0, "Prompt sales": 0, "Services & hire": 0 });
      }
      byDay.get(day)[bucket] += signed;
    }

    const bySource = [...bucketTotals.entries()]
      .map(([source, amount]) => ({ source, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount);

    const series = [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));

    return res.json({
      success: true,
      days,
      bySource,
      series,
      totals: {
        commission: Math.round(commission * 100) / 100,
        refunded: Math.round(refunded * 100) / 100,
        net: Math.round((commission - refunded) * 100) / 100,
      },
      /* The ledger keeps only the most recent 500 entries (see the $slice in
         PlatformWallet.recordCommission). Past that, an older window is
         genuinely incomplete and the UI has to say so rather than show a
         confident wrong number. */
      ledgerTruncated: (wallet.transactions || []).length >= 500,
    });
  } catch (err) {
    console.error("GET /api/admin/platform-revenue/by-source error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
