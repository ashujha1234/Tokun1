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

    payoutMethod: {
      type: String,
      enum: ["bank", "upi"],
      default: "bank",
    },

    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
      required: function () {
        return this.payoutMethod !== "upi";
      },
      trim: true,
    },

    ifscCode: {
      type: String,
      required: function () {
        return this.payoutMethod !== "upi";
      },
      trim: true,
      uppercase: true,
    },

    bankName: {
      type: String,
      required: function () {
        return this.payoutMethod !== "upi";
      },
      trim: true,
    },

    upiId: {
      type: String,
      required: function () {
        return this.payoutMethod === "upi";
      },
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

    // Route (Linked Account) — test fields, wired at the same time as the
    // existing Fund Account so both can be compared while testing.
    panNumber: {
      type: String,
      default: null,
    },

    // Stored so the "needs clarification" screen can show back exactly what
    // the seller submitted at Route account-creation time.
    phone: {
      type: String,
      default: null,
    },

    routeLinkedAccountId: {
      type: String,
      default: null,
    },

    routeStakeholderId: {
      type: String,
      default: null,
    },

    routeProductId: {
      type: String,
      default: null,
    },

    routeStatus: {
      type: String,
      enum: ["CREATED", "FAILED", null],
      default: null,
    },

    routeError: {
      type: String,
      default: null,
    },

    // Razorpay's real verification state for this Linked Account — updated
    // by the account.* webhooks. This (not routeStatus, which only reflects
    // whether *creation* succeeded) is what gates prompt-marketplace listing.
    activationStatus: {
      type: String,
      enum: ["CREATED", "UNDER_REVIEW", "NEEDS_CLARIFICATION", "SUSPENDED", "REJECTED", "ACTIVATED", null],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BankAccount", BankAccountSchema);