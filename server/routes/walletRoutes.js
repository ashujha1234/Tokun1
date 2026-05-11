// routes/walletRoutes.js
const express = require("express");
const router = express.Router();
const Wallet = require("../models/Wallet");
const { requireAuth } = require("../utils/auth");

/**
 * GET /api/wallet/balance
 * Production route — JWT token se user identify hota hai
 */
router.get("/balance", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyEarning = wallet.transactions
      .filter(
        (t) =>
          t.type === "credit" &&
          t.status === "Completed" &&
          new Date(t.createdAt) >= startOfMonth
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const recentTransactions = wallet.transactions.slice(0, 20).map((t) => ({
      id: String(t._id),
      date: t.createdAt,
      description: t.description,
      status: t.status,
      amount:
        t.type === "credit"
          ? `+₹${t.amount.toFixed(2)}`
          : `-₹${t.amount.toFixed(2)}`,
      type: t.type,
    }));

    return res.json({
      success: true,
      availableBalance: wallet.availableBalance,
      totalRevenue: wallet.totalRevenue,
      monthlyEarning,
      recentTransactions,
    });
  } catch (err) {
    console.error("wallet/balance error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});


/**
 * GET /api/wallet/balance/:userId
 * Testing route — seedha userId se check karo (Postman ke liye)
 * Example: GET http://localhost:5001/api/wallet/balance/6830abc123def456
 */
router.get("/balance/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyEarning = wallet.transactions
      .filter(
        (t) =>
          t.type === "credit" &&
          t.status === "Completed" &&
          new Date(t.createdAt) >= startOfMonth
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const recentTransactions = wallet.transactions.slice(0, 20).map((t) => ({
      id: String(t._id),
      date: t.createdAt,
      description: t.description,
      status: t.status,
      amount:
        t.type === "credit"
          ? `+₹${t.amount.toFixed(2)}`
          : `-₹${t.amount.toFixed(2)}`,
      type: t.type,
    }));

    return res.json({
      success: true,
      userId,
      availableBalance: wallet.availableBalance,
      totalRevenue: wallet.totalRevenue,
      monthlyEarning,
      recentTransactions,
    });
  } catch (err) {
    console.error("wallet/balance/:userId error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;