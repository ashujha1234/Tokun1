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

// POST /api/admin/platform-revenue/withdraw — mark an amount as withdrawn
// (manually transferred to Tokun's own bank account outside the app)
router.post("/withdraw", async (req, res) => {
  try {
    const amount = Number(req.body?.amount);
    const note = typeof req.body?.note === "string" ? req.body.note.trim() : "";

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, error: "invalid_amount" });
    }

    const wallet = await PlatformWallet.markWithdrawn(amount, note);
    return res.json({
      success: true,
      availableBalance: wallet.availableBalance,
      totalWithdrawn: wallet.totalWithdrawn,
    });
  } catch (err) {
    if (err.message === "insufficient_balance") {
      return res.status(400).json({ success: false, error: "insufficient_balance" });
    }
    console.error("POST /api/admin/platform-revenue/withdraw error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
