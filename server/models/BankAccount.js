// // models/BankAccount.js
// const mongoose = require("mongoose");

// const BankAccountSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     accountHolderName: { type: String, required: true, trim: true },
//     accountNumber: { type: String, required: true, trim: true },
//     ifscCode: { type: String, required: true, trim: true },
//     bankName: { type: String, required: true, trim: true },
//     default: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("BankAccount", BankAccountSchema);


// models/BankAccount.js
const mongoose = require("mongoose");

const BankAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    ifscCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    default: {
      type: Boolean,
      default: false,
      index: true,
    },

    // RazorpayX fields
    razorpayContactId: {
      type: String,
      default: null,
    },

    razorpayFundAccountId: {
      type: String,
      default: null,
      index: true,
    },

    razorpayFundAccountStatus: {
      type: String,
      enum: ["CREATED", "FAILED", null],
      default: null,
    },

    razorpayError: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BankAccount", BankAccountSchema);