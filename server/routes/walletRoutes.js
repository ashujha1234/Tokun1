// // // routes/walletRoutes.js
// // const express = require("express");
// // const router = express.Router();
// // const Wallet = require("../models/Wallet");
// // const { requireAuth } = require("../utils/auth");

// // /**
// //  * GET /api/wallet/balance
// //  * Production route — JWT token se user identify hota hai
// //  */
// // router.get("/balance", requireAuth, async (req, res) => {
// //   try {
// //     const userId = req.user._id;

// //     let wallet = await Wallet.findOne({ userId });
// //     if (!wallet) {
// //       wallet = await Wallet.create({ userId });
// //     }

// //     const now = new Date();
// //     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

// //     const monthlyEarning = wallet.transactions
// //       .filter(
// //         (t) =>
// //           t.type === "credit" &&
// //           t.status === "Completed" &&
// //           new Date(t.createdAt) >= startOfMonth
// //       )
// //       .reduce((sum, t) => sum + t.amount, 0);

// //     const recentTransactions = wallet.transactions.slice(0, 20).map((t) => ({
// //       id: String(t._id),
// //       date: t.createdAt,
// //       description: t.description,
// //       status: t.status,
// //       amount:
// //         t.type === "credit"
// //           ? `+₹${t.amount.toFixed(2)}`
// //           : `-₹${t.amount.toFixed(2)}`,
// //       type: t.type,
// //     }));

// //     return res.json({
// //       success: true,
// //       availableBalance: wallet.availableBalance,
// //       totalRevenue: wallet.totalRevenue,
// //       monthlyEarning,
// //       recentTransactions,
// //     });
// //   } catch (err) {
// //     console.error("wallet/balance error:", err);
// //     return res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });


// // /**
// //  * GET /api/wallet/balance/:userId
// //  * Testing route — seedha userId se check karo (Postman ke liye)
// //  * Example: GET http://localhost:5001/api/wallet/balance/6830abc123def456
// //  */
// // router.get("/balance/:userId", async (req, res) => {
// //   try {
// //     const { userId } = req.params;

// //     let wallet = await Wallet.findOne({ userId });
// //     if (!wallet) {
// //       wallet = await Wallet.create({ userId });
// //     }

// //     const now = new Date();
// //     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

// //     const monthlyEarning = wallet.transactions
// //       .filter(
// //         (t) =>
// //           t.type === "credit" &&
// //           t.status === "Completed" &&
// //           new Date(t.createdAt) >= startOfMonth
// //       )
// //       .reduce((sum, t) => sum + t.amount, 0);

// //     const recentTransactions = wallet.transactions.slice(0, 20).map((t) => ({
// //       id: String(t._id),
// //       date: t.createdAt,
// //       description: t.description,
// //       status: t.status,
// //       amount:
// //         t.type === "credit"
// //           ? `+₹${t.amount.toFixed(2)}`
// //           : `-₹${t.amount.toFixed(2)}`,
// //       type: t.type,
// //     }));

// //     return res.json({
// //       success: true,
// //       userId,
// //       availableBalance: wallet.availableBalance,
// //       totalRevenue: wallet.totalRevenue,
// //       monthlyEarning,
// //       recentTransactions,
// //     });
// //   } catch (err) {
// //     console.error("wallet/balance/:userId error:", err);
// //     return res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });

// // module.exports = router;




// // routes/walletRoutes.js
// const express = require("express");
// const router = express.Router();
// const crypto = require("crypto");
// const mongoose = require("mongoose");

// const Wallet = require("../models/Wallet");
// const WalletTopup = require("../models/WalletTopup");
// const Razorpay = require("../utils/razorpay");
// const { requireAuth } = require("../utils/auth");

// const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
// const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// /**
//  * Helper: Find or create wallet
//  */
// const getOrCreateWallet = async (userId) => {
//   let wallet = await Wallet.findOne({ userId });

//   if (!wallet) {
//     wallet = await Wallet.create({ userId });
//   }

//   return wallet;
// };

// /**
//  * Helper: Credit wallet for add-fund/top-up
//  * Important:
//  * Add fund is not seller earning, so totalRevenue should not increase.
//  */
// const creditWalletTopup = async ({
//   userId,
//   amount,
//   topupId,
//   razorpayPaymentId,
//   method,
// }) => {
//   const wallet = await getOrCreateWallet(userId);

//   wallet.availableBalance += amount;

//   wallet.transactions.unshift({
//     type: "credit",
//     status: "Completed",
//     amount,
//     description: "Wallet top-up",
//     createdAt: new Date(),
//     meta: {
//       source: "add_fund",
//       topupId,
//       razorpayPaymentId,
//       method,
//     },
//   });

//   await wallet.save();

//   return wallet;
// };

// /**
//  * GET /api/wallet/balance
//  * Production route — JWT token se user identify hota hai
//  */
// router.get("/balance", requireAuth, async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const wallet = await getOrCreateWallet(userId);

//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

//     const monthlyEarning = wallet.transactions
//       .filter(
//         (t) =>
//           t.type === "credit" &&
//           t.status === "Completed" &&
//           new Date(t.createdAt) >= startOfMonth
//       )
//       .reduce((sum, t) => sum + Number(t.amount || 0), 0);

//     const recentTransactions = wallet.transactions.slice(0, 20).map((t) => ({
//       id: String(t._id),
//       date: t.createdAt,
//       description: t.description,
//       status: t.status,
//       amount:
//         t.type === "credit"
//           ? `+₹${Number(t.amount || 0).toFixed(2)}`
//           : `-₹${Number(t.amount || 0).toFixed(2)}`,
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
//     return res.status(500).json({
//       success: false,
//       error: "server_error",
//       message: err.message,
//     });
//   }
// });

// /**
//  * POST /api/wallet/add-fund/create-order
//  *
//  * Body:
//  * {
//  *   "amount": 100
//  * }
//  */
// router.post("/add-fund/create-order", requireAuth, async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const amount = Number(req.body.amount);

//     if (!amount || Number.isNaN(amount) || amount < 1) {
//       return res.status(400).json({
//         success: false,
//         error: "invalid_amount",
//         message: "Amount must be at least ₹1",
//       });
//     }

//     if (amount > 100000) {
//       return res.status(400).json({
//         success: false,
//         error: "amount_limit_exceeded",
//         message: "Amount cannot be more than ₹100000",
//       });
//     }

//     if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
//       return res.status(500).json({
//         success: false,
//         error: "razorpay_env_missing",
//         message: "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in .env",
//       });
//     }

//     const amountInPaise = Math.round(amount * 100);

//     const receipt = `topup_${userId.toString().slice(-8)}_${Date.now()}`;

//     const order = await Razorpay.orders.create({
//       amount: amountInPaise,
//       currency: "INR",
//       receipt,
//       notes: {
//         userId: String(userId),
//         purpose: "wallet_topup",
//       },
//     });

//     const topup = await WalletTopup.create({
//       userId,
//       amount,
//       currency: "INR",
//       razorpayOrderId: order.id,
//       status: "created",
//     });

//     return res.json({
//       success: true,
//       key: RAZORPAY_KEY_ID,
//       order,
//       topupId: topup._id,
//     });
//   } catch (err) {
//     console.error("add-fund/create-order error:", err);
//     return res.status(500).json({
//       success: false,
//       error: "server_error",
//       message: err.message,
//     });
//   }
// });

// /**
//  * POST /api/wallet/add-fund/verify
//  *
//  * Razorpay Checkout handler response body:
//  * {
//  *   "razorpay_order_id": "...",
//  *   "razorpay_payment_id": "...",
//  *   "razorpay_signature": "..."
//  * }
//  */
// router.post("/add-fund/verify", requireAuth, async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//       req.body;

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         error: "missing_payment_fields",
//       });
//     }

//     if (!RAZORPAY_KEY_SECRET) {
//       return res.status(500).json({
//         success: false,
//         error: "razorpay_secret_missing",
//       });
//     }

//     const generatedSignature = crypto
//       .createHmac("sha256", RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     if (generatedSignature !== razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         error: "invalid_payment_signature",
//       });
//     }

//     const topup = await WalletTopup.findOne({
//       razorpayOrderId: razorpay_order_id,
//       userId,
//     });

//     if (!topup) {
//       return res.status(404).json({
//         success: false,
//         error: "topup_not_found",
//       });
//     }

//     // Idempotency: same payment callback dobara aaye to double credit na ho
//     if (topup.status === "paid") {
//       const wallet = await getOrCreateWallet(userId);

//       return res.json({
//         success: true,
//         message: "already_credited",
//         availableBalance: wallet.availableBalance,
//       });
//     }

//     const payment = await Razorpay.payments.fetch(razorpay_payment_id);

//     if (!payment || payment.status !== "captured") {
//       topup.status = "failed";
//       await topup.save();

//       return res.status(400).json({
//         success: false,
//         error: "payment_not_captured",
//         paymentStatus: payment?.status,
//       });
//     }

//     const expectedAmount = Math.round(topup.amount * 100);

//     if (payment.amount !== expectedAmount || payment.currency !== "INR") {
//       return res.status(400).json({
//         success: false,
//         error: "payment_amount_mismatch",
//       });
//     }

//     topup.status = "paid";
//     topup.razorpayPaymentId = razorpay_payment_id;
//     topup.method = payment.method || "unknown";
//     await topup.save();

//     const wallet = await creditWalletTopup({
//       userId,
//       amount: topup.amount,
//       topupId: topup._id,
//       razorpayPaymentId: razorpay_payment_id,
//       method: payment.method || "unknown",
//     });

//     return res.json({
//       success: true,
//       message: "wallet_credited",
//       availableBalance: wallet.availableBalance,
//       topup,
//     });
//   } catch (err) {
//     console.error("add-fund/verify error:", err);
//     return res.status(500).json({
//       success: false,
//       error: "server_error",
//       message: err.message,
//     });
//   }
// });

// /**
//  * POST /api/wallet/upi/validate
//  *
//  * Body:
//  * {
//  *   "vpa": "example@upi"
//  * }
//  *
//  * No axios used. Backend fetch used.
//  */
// router.post("/upi/validate", requireAuth, async (req, res) => {
//   try {
//     const { vpa } = req.body;

//     if (!vpa || typeof vpa !== "string") {
//       return res.status(400).json({
//         success: false,
//         error: "vpa_required",
//       });
//     }

//     const cleanVpa = vpa.trim().toLowerCase();

//     const basicVpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

//     if (!basicVpaRegex.test(cleanVpa)) {
//       return res.status(400).json({
//         success: false,
//         error: "invalid_vpa_format",
//       });
//     }

//     if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
//       return res.status(500).json({
//         success: false,
//         error: "razorpay_env_missing",
//       });
//     }

//     const basicAuthToken = Buffer.from(
//       `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`
//     ).toString("base64");

//     const razorpayRes = await fetch(
//       "https://api.razorpay.com/v1/payments/validate/vpa",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Basic ${basicAuthToken}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           vpa: cleanVpa,
//         }),
//       }
//     );

//     const data = await razorpayRes.json().catch(() => ({}));

//     if (!razorpayRes.ok) {
//       return res.status(400).json({
//         success: false,
//         error: "upi_validation_failed",
//         message:
//           data?.error?.description ||
//           data?.error ||
//           "Could not validate UPI ID",
//         raw: data,
//       });
//     }

//     return res.json({
//       success: true,
//       vpa: data.vpa || cleanVpa,
//       valid: !!data.success,
//       customerName: data.customer_name || null,
//       raw: data,
//     });
//   } catch (err) {
//     console.error("upi/validate error:", err);

//     return res.status(500).json({
//       success: false,
//       error: "server_error",
//       message: err.message,
//     });
//   }
// });

// /**
//  * TEMP testing route
//  * Production me remove kar dena ya admin auth laga dena.
//  *
//  * GET /api/wallet/balance/:userId
//  */
// router.get("/balance/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         error: "invalid_user_id",
//       });
//     }

//     const wallet = await getOrCreateWallet(userId);

//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

//     const monthlyEarning = wallet.transactions
//       .filter(
//         (t) =>
//           t.type === "credit" &&
//           t.status === "Completed" &&
//           new Date(t.createdAt) >= startOfMonth
//       )
//       .reduce((sum, t) => sum + Number(t.amount || 0), 0);

//     const recentTransactions = wallet.transactions.slice(0, 20).map((t) => ({
//       id: String(t._id),
//       date: t.createdAt,
//       description: t.description,
//       status: t.status,
//       amount:
//         t.type === "credit"
//           ? `+₹${Number(t.amount || 0).toFixed(2)}`
//           : `-₹${Number(t.amount || 0).toFixed(2)}`,
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
//     return res.status(500).json({
//       success: false,
//       error: "server_error",
//       message: err.message,
//     });
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
const BankAccount = require("../models/BankAccount");
const WalletWithdrawal = require("../models/WalletWithdrawal");

const getRazorpayKeyId = () => process.env.RAZORPAY_KEY_ID || 'rzp_test_aNNdd7yTcNuzYQ';
const getRazorpaySecret = () => process.env.RAZORPAY_KEY_SECRET || 'O9jzpGZzixxQp1iNXSheMDuN';

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
 * Add fund totalRevenue me count nahi hoga.
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
    return res.status(500).json({ success: false, error: "server_error", message: err.message });
  }
});

/**
 * POST /api/wallet/add-fund/create-order
 * UPI / NetBanking ke liye Razorpay order create karo
 */
router.post("/add-fund/create-order", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const amount = Number(req.body.amount);
    const selectedMethod = req.body.selectedMethod || "upi";

    // Bank transfer is handled separately — not via Razorpay order
    if (!["upi", "netbanking"].includes(selectedMethod)) {
      return res.status(400).json({
        success: false,
        error: "invalid_payment_method",
        message: "Use /add-fund/bank-transfer for bank account payments.",
      });
    }

    if (!amount || Number.isNaN(amount) || amount < 100) {
      return res.status(400).json({ success: false, error: "invalid_amount", message: "Minimum add amount is ₹100" });
    }

    if (amount > 100000) {
      return res.status(400).json({ success: false, error: "amount_limit_exceeded", message: "Maximum amount is ₹100000" });
    }

    const razorpayKeyId = getRazorpayKeyId();
    const razorpaySecret = getRazorpaySecret();

    if (!razorpayKeyId || !razorpaySecret) {
      return res.status(500).json({ success: false, error: "razorpay_env_missing" });
    }

    const serviceFee = +(amount * 0.02).toFixed(2);
    const debitAmount = +(amount + serviceFee).toFixed(2);
    const amountInPaise = Math.round(debitAmount * 100);
    const receipt = `topup_${userId.toString().slice(-8)}_${Date.now()}`;

    const order = await Razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        userId: String(userId),
        purpose: "wallet_topup",
        walletAmount: String(amount),
        serviceFee: String(serviceFee),
        debitAmount: String(debitAmount),
        selectedMethod,
      },
    });

    const topup = await WalletTopup.create({
      userId,
      amount,
      serviceFee,
      debitAmount,
      selectedMethod,     // "upi" | "netbanking"
      currency: "INR",
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.json({
      success: true,
      key: razorpayKeyId,
      order,
      topupId: topup._id,
      amount,
      serviceFee,
      debitAmount,
      selectedMethod,
    });
  } catch (err) {
    console.error("add-fund/create-order error:", err);
    return res.status(500).json({ success: false, error: "server_error", message: err.message });
  }
});

/**
 * POST /api/wallet/add-fund/verify
 * Razorpay payment verify karo aur wallet credit karo
 */
router.post("/add-fund/verify", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "missing_payment_fields" });
    }

    const razorpaySecret = getRazorpaySecret();
    if (!razorpaySecret) {
      return res.status(500).json({ success: false, error: "razorpay_secret_missing" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: "invalid_payment_signature" });
    }

    const topup = await WalletTopup.findOne({ razorpayOrderId: razorpay_order_id, userId });
    if (!topup) {
      return res.status(404).json({ success: false, error: "topup_not_found" });
    }

    if (topup.status === "paid") {
      const wallet = await getOrCreateWallet(userId);
      return res.json({ success: true, message: "already_credited", availableBalance: wallet.availableBalance });
    }

    const payment = await Razorpay.payments.fetch(razorpay_payment_id);

    if (!payment || !["captured", "authorized"].includes(payment.status)) {
      topup.status = "failed";
      await topup.save();
      return res.status(400).json({ success: false, error: "payment_not_captured", paymentStatus: payment?.status });
    }

    const expectedAmount = Math.round(topup.debitAmount * 100);
    if (payment.amount !== expectedAmount || payment.currency !== "INR") {
      return res.status(400).json({
        success: false,
        error: "payment_amount_mismatch",
        expectedAmount,
        receivedAmount: payment.amount,
        currency: payment.currency,
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
    return res.status(500).json({ success: false, error: "server_error", message: err.message });
  }
});

/**
 * POST /api/wallet/upi/validate
 * UPI VPA format + Razorpay se verify karo
 */
router.post("/upi/validate", requireAuth, async (req, res) => {
  try {
    const { vpa } = req.body;

    if (!vpa || typeof vpa !== "string") {
      return res.status(400).json({ success: false, error: "vpa_required" });
    }

    const cleanVpa = vpa.trim().toLowerCase();
    const basicVpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

    if (!basicVpaRegex.test(cleanVpa)) {
      return res.status(400).json({ success: false, error: "invalid_vpa_format", message: "Invalid UPI ID format. Example: name@upi" });
    }

    // Razorpay VPA validate karo (real validation)
    try {
      const vpaResult = await Razorpay.payments.validateVpa({ vpa: cleanVpa });
      // vpaResult.success === true means valid
      if (vpaResult && vpaResult.success === false) {
        return res.status(400).json({ success: false, error: "invalid_vpa", message: "UPI ID does not exist or is invalid." });
      }
      return res.json({
        success: true,
        valid: true,
        vpa: cleanVpa,
        name: vpaResult?.customer_name || null,
      });
    } catch (razorpayErr) {
      // Razorpay VPA validate fail kare to sirf format check return karo
      console.warn("Razorpay VPA validation failed, falling back to format check:", razorpayErr?.error?.description || razorpayErr.message);
      return res.json({
        success: true,
        valid: true,
        vpa: cleanVpa,
        name: null,
        note: "format_only_verified",
      });
    }
  } catch (err) {
    console.error("upi/validate error:", err);
    return res.status(500).json({ success: false, error: "server_error", message: err.message });
  }
});

/**
 * POST /api/wallet/add-fund/bank-transfer
 * Saved bank account se add fund request (manual verification flow)
 *
 * FIX: WalletTopup model mein selectedMethod "bank_transfer" aur
 * status "pending_verification" add karna hoga (schema fix below).
 * Ya phir is route mein hum alag approach use karte hain:
 * Directly wallet credit karo admin-verified flow ke saath.
 */
router.post("/add-fund/bank-transfer", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const amount = Number(req.body.amount);
    const { bankAccountId } = req.body;

    if (!amount || Number.isNaN(amount) || amount < 100) {
      return res.status(400).json({ success: false, error: "invalid_amount", message: "Minimum amount is ₹100" });
    }

    if (!bankAccountId || !mongoose.Types.ObjectId.isValid(bankAccountId)) {
      return res.status(400).json({ success: false, error: "invalid_bank_account" });
    }

    const bankAccount = await BankAccount.findOne({ _id: bankAccountId, userId });
    if (!bankAccount) {
      return res.status(404).json({ success: false, error: "bank_account_not_found" });
    }

    // WalletWithdrawal model reuse karo bank-transfer request track karne ke liye
    // Ya phir WalletTopup schema mein "bank_transfer" enum add karo (recommended)
    // Abhi hum WalletWithdrawal jaise ek record banate hain aur wallet mein
    // "pending" transaction dikhate hain jab tak admin approve kare.

    const wallet = await getOrCreateWallet(userId);

    // Pending transaction add karo wallet me
    wallet.transactions.unshift({
      type: "credit",
      status: "Pending",
      amount,
      description: `Bank transfer from ${bankAccount.bankName} ••••${String(bankAccount.accountNumber).slice(-4)}`,
      createdAt: new Date(),
      meta: {
        source: "bank_transfer",
        bankAccountId: bankAccount._id,
        note: "Pending admin verification (1-2 business days)",
      },
    });

    await wallet.save();

    console.log("BANK TRANSFER REQUEST:", {
      userId: String(userId),
      amount,
      bank: `${bankAccount.bankName} ••••${String(bankAccount.accountNumber).slice(-4)}`,
    });

    return res.json({
      success: true,
      message: "bank_transfer_request_submitted",
      note: "Funds will be credited after verification (1-2 business days).",
    });
  } catch (err) {
    console.error("add-fund/bank-transfer error:", err);
    return res.status(500).json({ success: false, error: "server_error", message: err.message });
  }
});

/**
 * POST /api/wallet/withdraw/request
 */
router.post("/withdraw/request", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const amount = Number(req.body.amount);
    const { bankAccountId } = req.body;

    if (!amount || Number.isNaN(amount) || amount < 100) {
      return res.status(400).json({ success: false, error: "invalid_amount", message: "Minimum withdrawal amount is ₹100" });
    }

    if (!bankAccountId || !mongoose.Types.ObjectId.isValid(bankAccountId)) {
      return res.status(400).json({ success: false, error: "invalid_bank_account", message: "Please select a valid bank account" });
    }

    const bankAccount = await BankAccount.findOne({ _id: bankAccountId, userId });
    if (!bankAccount) {
      return res.status(404).json({ success: false, error: "bank_account_not_found" });
    }

    const wallet = await getOrCreateWallet(userId);

    if (wallet.availableBalance < amount) {
      return res.status(400).json({
        success: false,
        error: "insufficient_balance",
        message: `You can withdraw up to ₹${wallet.availableBalance}`,
      });
    }

    const serviceFee = +(amount * 0.02).toFixed(2);
    const netAmount = +(amount - serviceFee).toFixed(2);

    if (netAmount <= 0) {
      return res.status(400).json({ success: false, error: "invalid_net_amount" });
    }

    const withdrawal = await WalletWithdrawal.create({
      userId,
      bankAccountId: bankAccount._id,
      amount,
      serviceFee,
      netAmount,
      status: "Pending",
      note: `Withdrawal to ${bankAccount.bankName} ending ${String(bankAccount.accountNumber).slice(-4)}`,
    });

    wallet.availableBalance -= amount;

    wallet.transactions.unshift({
      type: "debit",
      status: "Pending",
      amount,
      description: `Withdrawal to ${bankAccount.bankName} ••••${String(bankAccount.accountNumber).slice(-4)}`,
      createdAt: new Date(),
      meta: {
        source: "withdrawal",
        withdrawalId: withdrawal._id,
        bankAccountId: bankAccount._id,
        serviceFee,
        netAmount,
      },
    });

    await wallet.save();

    return res.json({
      success: true,
      message: "withdrawal_requested",
      availableBalance: wallet.availableBalance,
      withdrawal,
    });
  } catch (err) {
    console.error("withdraw/request error:", err);
    return res.status(500).json({ success: false, error: "server_error", message: err.message });
  }
});

/**
 * GET /api/wallet/withdraw/history
 */
router.get("/withdraw/history", requireAuth, async (req, res) => {
  try {
    const withdrawals = await WalletWithdrawal.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("bankAccountId", "bankName accountNumber ifscCode");

    return res.json({ success: true, withdrawals });
  } catch (err) {
    console.error("withdraw/history error:", err);
    return res.status(500).json({ success: false, error: "server_error", message: err.message });
  }
});

/**
 * TEMP: GET /api/wallet/balance/:userId (testing only — remove in production)
 */
router.get("/balance/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: "invalid_user_id" });
    }
    const wallet = await getOrCreateWallet(userId);
    const recentTransactions = wallet.transactions.slice(0, 20).map((t) => ({
      id: String(t._id),
      date: t.createdAt,
      description: t.description,
      status: t.status,
      amount: t.type === "credit" ? `+₹${Number(t.amount || 0).toFixed(2)}` : `-₹${Number(t.amount || 0).toFixed(2)}`,
      type: t.type,
    }));
    return res.json({ success: true, userId, availableBalance: wallet.availableBalance, totalRevenue: wallet.totalRevenue, recentTransactions });
  } catch (err) {
    return res.status(500).json({ success: false, error: "server_error", message: err.message });
  }
});


/**
 * ══════════════════════════════════════════════════════
 * ADMIN ROUTES — Bank Transfer & Withdrawal Approval
 * Production mein: requireAuth + isAdmin middleware lagao
 * ══════════════════════════════════════════════════════
 */

/**
 * GET /api/wallet/admin/pending-bank-transfers
 * Saare pending bank transfer transactions
 */
router.get("/admin/pending-bank-transfers", requireAuth, async (req, res) => {
  try {
    const wallets = await Wallet.find({
      transactions: {
        $elemMatch: { "meta.source": "bank_transfer", status: "Pending" }
      }
    }).populate("userId", "name email phone");

    const pendingTransfers = [];
    wallets.forEach((wallet) => {
      wallet.transactions.forEach((txn) => {
        if (txn.meta && txn.meta.source === "bank_transfer" && txn.status === "Pending") {
          pendingTransfers.push({
            txnId:        String(txn._id),
            walletId:     String(wallet._id),
            userId:       wallet.userId,
            amount:       txn.amount,
            description:  txn.description,
            bankAccountId: txn.meta.bankAccountId,
            createdAt:    txn.createdAt,
            status:       txn.status,
          });
        }
      });
    });

    return res.json({ success: true, count: pendingTransfers.length, pendingTransfers });
  } catch (err) {
    console.error("admin/pending-bank-transfers error:", err);
    return res.status(500).json({ success: false, error: "server_error", message: err.message });
  }
});

/**
 * POST /api/wallet/admin/approve-bank-transfer
 * Bank transfer approve → balance credit
 * Body: { walletId, txnId }
 */
router.post("/admin/approve-bank-transfer", requireAuth, async (req, res) => {
  try {
    const { walletId, txnId } = req.body;
    if (!walletId || !txnId) {
      return res.status(400).json({ success: false, error: "walletId and txnId required" });
    }

    const wallet = await Wallet.findById(walletId).populate("userId", "name email");
    if (!wallet) return res.status(404).json({ success: false, error: "wallet_not_found" });

    const txn = wallet.transactions.id(txnId);
    if (!txn) return res.status(404).json({ success: false, error: "transaction_not_found" });
    if (txn.status !== "Pending") {
      return res.status(400).json({ success: false, error: "transaction_not_pending", currentStatus: txn.status });
    }
    if (!txn.meta || txn.meta.source !== "bank_transfer") {
      return res.status(400).json({ success: false, error: "not_a_bank_transfer" });
    }

    txn.status = "Completed";
    wallet.availableBalance += Number(txn.amount || 0);
    await wallet.save();

    console.log("BANK TRANSFER APPROVED:", { userId: wallet.userId && wallet.userId._id, amount: txn.amount, txnId });

    return res.json({
      success: true,
      message: "bank_transfer_approved",
      userId: wallet.userId && wallet.userId._id,
      amount: txn.amount,
      newBalance: wallet.availableBalance,
    });
  } catch (err) {
    console.error("admin/approve-bank-transfer error:", err);
    return res.status(500).json({ success: false, error: "server_error", message: err.message });
  }
});

/**
 * POST /api/wallet/admin/reject-bank-transfer
 * Bank transfer reject karo
 * Body: { walletId, txnId, reason }
 */
router.post("/admin/reject-bank-transfer", requireAuth, async (req, res) => {
  try {
    const { walletId, txnId, reason } = req.body;
    if (!walletId || !txnId) {
      return res.status(400).json({ success: false, error: "walletId and txnId required" });
    }

    const wallet = await Wallet.findById(walletId);
    if (!wallet) return res.status(404).json({ success: false, error: "wallet_not_found" });

    const txn = wallet.transactions.id(txnId);
    if (!txn) return res.status(404).json({ success: false, error: "transaction_not_found" });
    if (txn.status !== "Pending") {
      return res.status(400).json({ success: false, error: "transaction_not_pending", currentStatus: txn.status });
    }

    txn.status = "Failed";
    txn.description += reason ? " — Rejected: " + reason : " — Rejected by admin";
    await wallet.save();

    return res.json({ success: true, message: "bank_transfer_rejected" });
  } catch (err) {
    console.error("admin/reject-bank-transfer error:", err);
    return res.status(500).json({ success: false, error: "server_error", message: err.message });
  }
});

/**
 * GET /api/wallet/admin/pending-withdrawals
 * Saare pending withdrawal requests
 */
router.get("/admin/pending-withdrawals", requireAuth, async (req, res) => {
  try {
    const withdrawals = await WalletWithdrawal.find({ status: "Pending" })
      .sort({ createdAt: -1 })
      .populate("userId", "name email phone")
      .populate("bankAccountId", "bankName accountNumber ifscCode");

    return res.json({ success: true, count: withdrawals.length, withdrawals });
  } catch (err) {
    console.error("admin/pending-withdrawals error:", err);
    return res.status(500).json({ success: false, error: "server_error", message: err.message });
  }
});

/**
 * POST /api/wallet/admin/approve-withdrawal
 * Withdrawal approve → Completed
 * Body: { withdrawalId, utrNumber }
 */
router.post("/admin/approve-withdrawal", requireAuth, async (req, res) => {
  try {
    const { withdrawalId, utrNumber } = req.body;
    if (!withdrawalId) return res.status(400).json({ success: false, error: "withdrawalId required" });

    const withdrawal = await WalletWithdrawal.findById(withdrawalId);
    if (!withdrawal) return res.status(404).json({ success: false, error: "withdrawal_not_found" });
    if (withdrawal.status !== "Pending") {
      return res.status(400).json({ success: false, error: "not_pending", currentStatus: withdrawal.status });
    }

    withdrawal.status     = "Completed";
    withdrawal.utrNumber  = utrNumber || null;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    // Wallet transaction status update
    const wallet = await getOrCreateWallet(withdrawal.userId);
    const txn = wallet.transactions.find(
      (t) => t.meta && t.meta.withdrawalId && t.meta.withdrawalId.toString() === withdrawalId.toString()
    );
    if (txn) { txn.status = "Completed"; await wallet.save(); }

    console.log("WITHDRAWAL APPROVED:", { withdrawalId, amount: withdrawal.amount, utr: utrNumber });
    return res.json({ success: true, message: "withdrawal_approved", withdrawal });
  } catch (err) {
    console.error("admin/approve-withdrawal error:", err);
    return res.status(500).json({ success: false, error: "server_error", message: err.message });
  }
});

/**
 * POST /api/wallet/admin/reject-withdrawal
 * Withdrawal reject → balance refund
 * Body: { withdrawalId, reason }
 */
router.post("/admin/reject-withdrawal", requireAuth, async (req, res) => {
  try {
    const { withdrawalId, reason } = req.body;
    if (!withdrawalId) return res.status(400).json({ success: false, error: "withdrawalId required" });

    const withdrawal = await WalletWithdrawal.findById(withdrawalId);
    if (!withdrawal) return res.status(404).json({ success: false, error: "withdrawal_not_found" });
    if (withdrawal.status !== "Pending") {
      return res.status(400).json({ success: false, error: "not_pending", currentStatus: withdrawal.status });
    }

    withdrawal.status = "Failed";
    withdrawal.note  += reason ? " — Rejected: " + reason : " — Rejected by admin";
    await withdrawal.save();

    const wallet = await getOrCreateWallet(withdrawal.userId);
    wallet.availableBalance += Number(withdrawal.amount || 0);

    const txn = wallet.transactions.find(
      (t) => t.meta && t.meta.withdrawalId && t.meta.withdrawalId.toString() === withdrawalId.toString()
    );
    if (txn) {
      txn.status = "Failed";
      txn.description += reason ? " — Rejected: " + reason : " — Rejected";
    }

    wallet.transactions.unshift({
      type:        "credit",
      status:      "Completed",
      amount:      withdrawal.amount,
      description: "Withdrawal refunded — " + (reason || "Rejected by admin"),
      createdAt:   new Date(),
      meta: { source: "withdrawal_refund", withdrawalId: withdrawal._id },
    });

    await wallet.save();

    console.log("WITHDRAWAL REJECTED & REFUNDED:", { withdrawalId, amount: withdrawal.amount });
    return res.json({
      success: true,
      message: "withdrawal_rejected_and_refunded",
      refundedAmount: withdrawal.amount,
      newBalance: wallet.availableBalance,
    });
  } catch (err) {
    console.error("admin/reject-withdrawal error:", err);
    return res.status(500).json({ success: false, error: "server_error", message: err.message });
  }
});

module.exports = router;