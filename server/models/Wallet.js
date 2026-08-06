// src/models/Wallet.js
const mongoose = require("mongoose");

/**
 * Wallet — one document per user (seller).
 *
 * Fields:
 *  userId          : ref to User
 *  availableBalance: money ready to withdraw (credited on each sale, debited on withdrawal)
 *  totalRevenue    : lifetime earnings (never decremented — only goes up on sale)
 *  monthlyEarning  : earnings in the current calendar month (reset on cron / recalculated on read)
 *
 * Transactions sub-array keeps a lightweight ledger so the frontend can show
 * "Payment History" without a separate collection query every time.
 */

const TransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    // Optional refs for traceability
    purchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      default: null,
    },
    promptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prompt",
      default: null,
    },
    hireDealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HireDeal",
      default: null,
    },
    serviceOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceOrder",
      default: null,
    },
    status: {
      type: String,
      enum: ["Completed", "Pending", "Failed"],
      default: "Completed",
    },
  },
  { timestamps: true }
);

const WalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one wallet per user
      index: true,
    },
    availableBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Lightweight ledger (last 100 entries kept; older ones can be archived)
    transactions: {
      type: [TransactionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

/* ─────────────────────────────────────────────
   Static helpers
───────────────────────────────────────────── */

/**
 * Credit the seller's wallet when a prompt is purchased.
 * Call this from purchaseRoutes.js → verify endpoint, after payment confirmed.
 *
 * @param {ObjectId|string} sellerId   - prompt.seller (uploader)
 * @param {number}          amount     - prompt.price  (seller's cut)
 * @param {object}          meta       - { purchaseId, promptId, promptTitle }
 */
WalletSchema.statics.creditSale = async function (sellerId, amount, meta = {}) {
  // `session` is optional: cart checkout credits several sellers inside one
  // transaction so a mid-loop failure can't leave some paid and some not.
  // Callers that pass nothing behave exactly as before.
  const { purchaseId = null, promptId = null, promptTitle = "Prompt sold", session = null } = meta;

  const wallet = await this.findOneAndUpdate(
    { userId: sellerId },
    {
      $inc: {
        availableBalance: amount,
        totalRevenue: amount,
      },
      $push: {
        transactions: {
          $each: [
            {
              type: "credit",
              amount,
              description: `Sale: "${promptTitle}"`,
              purchaseId,
              promptId,
              status: "Completed",
            },
          ],
          $sort: { createdAt: -1 },
          $slice: 100, // keep only the most recent 100
        },
      },
    },
    {
      new: true,
      upsert: true, // create wallet if it doesn't exist yet
      setDefaultsOnInsert: true,
      ...(session ? { session } : {}),
    }
  );

  return wallet;
};

/**
 * Credit the freelancer's wallet when hire-deal escrow is released.
 * Mirrors creditSale's atomic findOneAndUpdate shape but links a HireDeal
 * instead of a Purchase/Prompt.
 *
 * @param {ObjectId|string} freelancerId
 * @param {number}          amount     - deal.freelancerAmount (net of platformFee)
 * @param {object}          meta       - { dealId, dealTitle }
 */
WalletSchema.statics.creditHireEscrow = async function (freelancerId, amount, meta = {}) {
  const { dealId = null, dealTitle = "Hire deal" } = meta;

  const wallet = await this.findOneAndUpdate(
    { userId: freelancerId },
    {
      $inc: {
        availableBalance: amount,
        totalRevenue: amount,
      },
      $push: {
        transactions: {
          $each: [
            {
              type: "credit",
              amount,
              description: `Escrow released: "${dealTitle}"`,
              hireDealId: dealId,
              status: "Completed",
            },
          ],
          $sort: { createdAt: -1 },
          $slice: 100,
        },
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return wallet;
};

/**
 * Credit the seller's wallet when a booked service is paid for.
 * Mirrors creditSale/creditHireEscrow's atomic findOneAndUpdate shape but
 * links a ServiceOrder instead.
 *
 * @param {ObjectId|string} sellerId
 * @param {number}          amount     - order.sellerAmount (net of platformFee)
 * @param {object}          meta       - { orderId, serviceTitle }
 */
WalletSchema.statics.creditServiceSale = async function (sellerId, amount, meta = {}) {
  const { orderId = null, serviceTitle = "Service booked" } = meta;

  const wallet = await this.findOneAndUpdate(
    { userId: sellerId },
    {
      $inc: {
        availableBalance: amount,
        totalRevenue: amount,
      },
      $push: {
        transactions: {
          $each: [
            {
              type: "credit",
              amount,
              description: `Service booked: "${serviceTitle}"`,
              serviceOrderId: orderId,
              status: "Completed",
            },
          ],
          $sort: { createdAt: -1 },
          $slice: 100,
        },
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return wallet;
};

/**
 * Debit the wallet on a withdrawal request.
 *
 * @param {ObjectId|string} userId
 * @param {number}          amount
 * @param {string}          description
 */
WalletSchema.statics.debitWithdrawal = async function (userId, amount, description = "Withdrawal") {
  const wallet = await this.findOne({ userId });
  if (!wallet) throw new Error("wallet_not_found");
  if (wallet.availableBalance < amount) throw new Error("insufficient_balance");

  wallet.availableBalance -= amount;
  wallet.transactions.unshift({
    type: "debit",
    amount,
    description,
    status: "Pending", // mark completed after bank confirms
  });
  // keep last 100
  if (wallet.transactions.length > 100) wallet.transactions = wallet.transactions.slice(0, 100);

  await wallet.save();
  return wallet;
};

/**
 * Reverse a sale credit when a buyer's refund is approved and the seller
 * had no Route linked account at purchase time (Wallet-ledger fallback
 * path) — there's no Razorpay transfer to reverse, only this internal
 * ledger entry that gave the seller credit for the sale.
 *
 * Throws "insufficient_balance" if the seller already withdrew past this
 * amount — the buyer's Razorpay refund still goes through independently,
 * this only fails to claw back the seller's wallet credit and needs manual
 * admin follow-up (e.g. deduct from a future payout).
 *
 * @param {ObjectId|string} sellerId
 * @param {number}          amount
 * @param {object}          meta - { purchaseId, promptId, promptTitle }
 */
WalletSchema.statics.debitRefund = async function (sellerId, amount, meta = {}) {
  const { purchaseId = null, promptId = null, promptTitle = "Prompt refunded" } = meta;

  const wallet = await this.findOne({ userId: sellerId });
  if (!wallet) throw new Error("wallet_not_found");
  if (wallet.availableBalance < amount) throw new Error("insufficient_balance");

  wallet.availableBalance -= amount;
  wallet.transactions.unshift({
    type: "debit",
    amount,
    description: `Refund: "${promptTitle}"`,
    purchaseId,
    promptId,
    status: "Completed",
  });
  if (wallet.transactions.length > 100) wallet.transactions = wallet.transactions.slice(0, 100);

  await wallet.save();
  return wallet;
};

module.exports = mongoose.model("Wallet", WalletSchema);