// // routes/walletRoutes.js
// const express = require("express");
// const router = express.Router();
// const Wallet = require("../models/Wallet");
// const { requireAuth } = require("../utils/auth");

// /**
//  * GET /api/wallet/balance
//  * Production route — JWT token se user identify hota hai
//  */
// router.get("/balance", requireAuth, async (req, res) => {
//   try {
//     const userId = req.user._id;

//     let wallet = await Wallet.findOne({ userId });
//     if (!wallet) {
//       wallet = await Wallet.create({ userId });
//     }

//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

//     const monthlyEarning = wallet.transactions
//       .filter(
//         (t) =>
//           t.type === "credit" &&
//           t.status === "Completed" &&
//           new Date(t.createdAt) >= startOfMonth
//       )
//       .reduce((sum, t) => sum + t.amount, 0);

//     const recentTransactions = wallet.transactions.slice(0, 20).map((t) => ({
//       id: String(t._id),
//       date: t.createdAt,
//       description: t.description,
//       status: t.status,
//       amount:
//         t.type === "credit"
//           ? `+₹${t.amount.toFixed(2)}`
//           : `-₹${t.amount.toFixed(2)}`,
//       type: t.type,
//     }));

//     return res.json({
//       success: true,
//       availableBalance: wallet.availableBalance,
//       totalRevenue: wallet.totalRevenue,
//       monthlyEarning,
//       recentTransactions,
//     });
//   } catch (err) {
//     console.error("wallet/balance error:", err);
//     return res.status(500).json({ success: false, error: "server_error" });
//   }
// });


// /**
//  * GET /api/wallet/balance/:userId
//  * Testing route — seedha userId se check karo (Postman ke liye)
//  * Example: GET http://localhost:5001/api/wallet/balance/6830abc123def456
//  */
// router.get("/balance/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     let wallet = await Wallet.findOne({ userId });
//     if (!wallet) {
//       wallet = await Wallet.create({ userId });
//     }

//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

//     const monthlyEarning = wallet.transactions
//       .filter(
//         (t) =>
//           t.type === "credit" &&
//           t.status === "Completed" &&
//           new Date(t.createdAt) >= startOfMonth
//       )
//       .reduce((sum, t) => sum + t.amount, 0);

//     const recentTransactions = wallet.transactions.slice(0, 20).map((t) => ({
//       id: String(t._id),
//       date: t.createdAt,
//       description: t.description,
//       status: t.status,
//       amount:
//         t.type === "credit"
//           ? `+₹${t.amount.toFixed(2)}`
//           : `-₹${t.amount.toFixed(2)}`,
//       type: t.type,
//     }));

//     return res.json({
//       success: true,
//       userId,
//       availableBalance: wallet.availableBalance,
//       totalRevenue: wallet.totalRevenue,
//       monthlyEarning,
//       recentTransactions,
//     });
//   } catch (err) {
//     console.error("wallet/balance/:userId error:", err);
//     return res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// module.exports = router;




// routes/walletRoutes.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const mongoose = require("mongoose");

const Wallet = require("../models/Wallet");
const WalletTopup = require("../models/WalletTopup");
const Razorpay = require("../utils/razorpay");
const { requireAuth } = require("../utils/auth");

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/**
 * Helper: Find or create wallet
 */
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    wallet = await Wallet.create({ userId });
  }

  return wallet;
};

/**
 * Helper: Credit wallet for add-fund/top-up
 * Important:
 * Add fund is not seller earning, so totalRevenue should not increase.
 */
const creditWalletTopup = async ({
  userId,
  amount,
  topupId,
  razorpayPaymentId,
  method,
}) => {
  const wallet = await getOrCreateWallet(userId);

  wallet.availableBalance += amount;

  wallet.transactions.unshift({
    type: "credit",
    status: "Completed",
    amount,
    description: "Wallet top-up",
    createdAt: new Date(),
    meta: {
      source: "add_fund",
      topupId,
      razorpayPaymentId,
      method,
    },
  });

  await wallet.save();

  return wallet;
};

/**
 * GET /api/wallet/balance
 * Production route — JWT token se user identify hota hai
 */
router.get("/balance", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const wallet = await getOrCreateWallet(userId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyEarning = wallet.transactions
      .filter(
        (t) =>
          t.type === "credit" &&
          t.status === "Completed" &&
          new Date(t.createdAt) >= startOfMonth
      )
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const recentTransactions = wallet.transactions.slice(0, 20).map((t) => ({
      id: String(t._id),
      date: t.createdAt,
      description: t.description,
      status: t.status,
      amount:
        t.type === "credit"
          ? `+₹${Number(t.amount || 0).toFixed(2)}`
          : `-₹${Number(t.amount || 0).toFixed(2)}`,
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
    return res.status(500).json({
      success: false,
      error: "server_error",
      message: err.message,
    });
  }
});

/**
 * POST /api/wallet/add-fund/create-order
 *
 * Body:
 * {
 *   "amount": 100
 * }
 */
router.post("/add-fund/create-order", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const amount = Number(req.body.amount);

    if (!amount || Number.isNaN(amount) || amount < 1) {
      return res.status(400).json({
        success: false,
        error: "invalid_amount",
        message: "Amount must be at least ₹1",
      });
    }

    if (amount > 100000) {
      return res.status(400).json({
        success: false,
        error: "amount_limit_exceeded",
        message: "Amount cannot be more than ₹100000",
      });
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        error: "razorpay_env_missing",
        message: "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in .env",
      });
    }

    const amountInPaise = Math.round(amount * 100);

    const receipt = `topup_${userId.toString().slice(-8)}_${Date.now()}`;

    const order = await Razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        userId: String(userId),
        purpose: "wallet_topup",
      },
    });

    const topup = await WalletTopup.create({
      userId,
      amount,
      currency: "INR",
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.json({
      success: true,
      key: RAZORPAY_KEY_ID,
      order,
      topupId: topup._id,
    });
  } catch (err) {
    console.error("add-fund/create-order error:", err);
    return res.status(500).json({
      success: false,
      error: "server_error",
      message: err.message,
    });
  }
});

/**
 * POST /api/wallet/add-fund/verify
 *
 * Razorpay Checkout handler response body:
 * {
 *   "razorpay_order_id": "...",
 *   "razorpay_payment_id": "...",
 *   "razorpay_signature": "..."
 * }
 */
router.post("/add-fund/verify", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "missing_payment_fields",
      });
    }

    if (!RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        error: "razorpay_secret_missing",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "invalid_payment_signature",
      });
    }

    const topup = await WalletTopup.findOne({
      razorpayOrderId: razorpay_order_id,
      userId,
    });

    if (!topup) {
      return res.status(404).json({
        success: false,
        error: "topup_not_found",
      });
    }

    // Idempotency: same payment callback dobara aaye to double credit na ho
    if (topup.status === "paid") {
      const wallet = await getOrCreateWallet(userId);

      return res.json({
        success: true,
        message: "already_credited",
        availableBalance: wallet.availableBalance,
      });
    }

    const payment = await Razorpay.payments.fetch(razorpay_payment_id);

    if (!payment || payment.status !== "captured") {
      topup.status = "failed";
      await topup.save();

      return res.status(400).json({
        success: false,
        error: "payment_not_captured",
        paymentStatus: payment?.status,
      });
    }

    const expectedAmount = Math.round(topup.amount * 100);

    if (payment.amount !== expectedAmount || payment.currency !== "INR") {
      return res.status(400).json({
        success: false,
        error: "payment_amount_mismatch",
      });
    }

    topup.status = "paid";
    topup.razorpayPaymentId = razorpay_payment_id;
    topup.method = payment.method || "unknown";
    await topup.save();

    const wallet = await creditWalletTopup({
      userId,
      amount: topup.amount,
      topupId: topup._id,
      razorpayPaymentId: razorpay_payment_id,
      method: payment.method || "unknown",
    });

    return res.json({
      success: true,
      message: "wallet_credited",
      availableBalance: wallet.availableBalance,
      topup,
    });
  } catch (err) {
    console.error("add-fund/verify error:", err);
    return res.status(500).json({
      success: false,
      error: "server_error",
      message: err.message,
    });
  }
});

/**
 * POST /api/wallet/upi/validate
 *
 * Body:
 * {
 *   "vpa": "example@upi"
 * }
 *
 * No axios used. Backend fetch used.
 */
router.post("/upi/validate", requireAuth, async (req, res) => {
  try {
    const { vpa } = req.body;

    if (!vpa || typeof vpa !== "string") {
      return res.status(400).json({
        success: false,
        error: "vpa_required",
      });
    }

    const cleanVpa = vpa.trim().toLowerCase();

    const basicVpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

    if (!basicVpaRegex.test(cleanVpa)) {
      return res.status(400).json({
        success: false,
        error: "invalid_vpa_format",
      });
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        error: "razorpay_env_missing",
      });
    }

    const basicAuthToken = Buffer.from(
      `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    const razorpayRes = await fetch(
      "https://api.razorpay.com/v1/payments/validate/vpa",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuthToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vpa: cleanVpa,
        }),
      }
    );

    const data = await razorpayRes.json().catch(() => ({}));

    if (!razorpayRes.ok) {
      return res.status(400).json({
        success: false,
        error: "upi_validation_failed",
        message:
          data?.error?.description ||
          data?.error ||
          "Could not validate UPI ID",
        raw: data,
      });
    }

    return res.json({
      success: true,
      vpa: data.vpa || cleanVpa,
      valid: !!data.success,
      customerName: data.customer_name || null,
      raw: data,
    });
  } catch (err) {
    console.error("upi/validate error:", err);

    return res.status(500).json({
      success: false,
      error: "server_error",
      message: err.message,
    });
  }
});

/**
 * TEMP testing route
 * Production me remove kar dena ya admin auth laga dena.
 *
 * GET /api/wallet/balance/:userId
 */
router.get("/balance/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: "invalid_user_id",
      });
    }

    const wallet = await getOrCreateWallet(userId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyEarning = wallet.transactions
      .filter(
        (t) =>
          t.type === "credit" &&
          t.status === "Completed" &&
          new Date(t.createdAt) >= startOfMonth
      )
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const recentTransactions = wallet.transactions.slice(0, 20).map((t) => ({
      id: String(t._id),
      date: t.createdAt,
      description: t.description,
      status: t.status,
      amount:
        t.type === "credit"
          ? `+₹${Number(t.amount || 0).toFixed(2)}`
          : `-₹${Number(t.amount || 0).toFixed(2)}`,
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
    return res.status(500).json({
      success: false,
      error: "server_error",
      message: err.message,
    });
  }
});

module.exports = router;