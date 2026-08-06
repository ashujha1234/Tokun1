// src/models/PlatformWallet.js
const mongoose = require("mongoose");

/**
 * PlatformWallet — a single singleton document tracking Tokun's own commission
 * earnings across the whole platform (prompt purchases, hire escrow releases,
 * and subscription payments — subscriptions are 100% Tokun revenue).
 *
 * Fields:
 *  availableBalance: commission not yet marked as withdrawn
 *  totalRevenue    : lifetime commission earned (never decremented — only goes up)
 *  totalWithdrawn  : lifetime amount admin has marked as withdrawn
 *
 * Mirrors the per-seller Wallet model's shape/pattern, but there's only ever
 * one PlatformWallet document (key: "platform").
 */

const TransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["commission", "withdrawal", "refund"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      enum: ["prompt_purchase", "hire_escrow", "service_purchase", "subscription", "manual_withdrawal"],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

const PlatformWalletSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "platform",
      unique: true,
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
    totalWithdrawn: {
      type: Number,
      default: 0,
      min: 0,
    },
    transactions: {
      type: [TransactionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

/**
 * Record commission earned by the platform (prompt purchase or hire escrow release).
 * @param {number} amount
 * @param {object} meta - { source: "prompt_purchase"|"hire_escrow", refId, description }
 */
PlatformWalletSchema.statics.recordCommission = async function (amount, meta = {}) {
  if (!amount || amount <= 0) return null;
  // `session` is optional — see Wallet.creditSale. Cart checkout records the
  // commission for every item in the same transaction as the purchases, so the
  // ledger can't end up crediting a sale that was rolled back.
  const { source, refId = null, description = "", session = null } = meta;

  return this.findOneAndUpdate(
    { key: "platform" },
    {
      $inc: { availableBalance: amount, totalRevenue: amount },
      $push: {
        transactions: {
          $each: [{ type: "commission", amount, source, refId, description }],
          $sort: { createdAt: -1 },
          $slice: 500,
        },
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true, ...(session ? { session } : {}) }
  );
};

/**
 * Mark an amount as withdrawn (manually transferred to Tokun's own bank account).
 * @param {number} amount
 * @param {string} note
 */
PlatformWalletSchema.statics.markWithdrawn = async function (amount, note = "") {
  const wallet = await this.findOne({ key: "platform" });
  if (!wallet) throw new Error("platform_wallet_not_found");
  if (amount <= 0) throw new Error("invalid_amount");
  if (wallet.availableBalance < amount) throw new Error("insufficient_balance");

  wallet.availableBalance -= amount;
  wallet.totalWithdrawn += amount;
  wallet.transactions.unshift({
    type: "withdrawal",
    amount,
    source: "manual_withdrawal",
    description: note || "Marked as withdrawn by admin",
  });
  wallet.transactions = wallet.transactions.slice(0, 500);
  await wallet.save();
  return wallet;
};

/**
 * Reverse commission earned on a sale that's since been refunded.
 * Best-effort: allowed to take availableBalance to 0 (not below, via a
 * clamped decrement) since Tokun's own commission pool can't go negative
 * the way a seller's individual wallet reasonably could pre-payout.
 * @param {number} amount
 * @param {object} meta - { source, refId, description }
 */
PlatformWalletSchema.statics.reverseCommission = async function (amount, meta = {}) {
  if (!amount || amount <= 0) return null;
  const { source, refId = null, description = "" } = meta;

  const wallet = await this.findOne({ key: "platform" });
  if (!wallet) return null;

  const decrement = Math.min(amount, wallet.availableBalance);
  wallet.availableBalance -= decrement;
  wallet.transactions.unshift({ type: "refund", amount, source, refId, description });
  wallet.transactions = wallet.transactions.slice(0, 500);
  await wallet.save();
  return wallet;
};

module.exports = mongoose.model("PlatformWallet", PlatformWalletSchema);
