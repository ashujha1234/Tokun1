// models/WalletWithdrawal.js
const mongoose = require("mongoose");

const WalletWithdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    bankAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankAccount",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 100,
    },

    serviceFee: {
      type: Number,
      default: 0,
    },

    netAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Failed", "Rejected"],
      default: "Pending",
      index: true,
    },

    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WalletWithdrawal", WalletWithdrawalSchema);