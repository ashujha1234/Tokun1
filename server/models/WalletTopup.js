// // models/WalletTopup.js
// const mongoose = require("mongoose");

// const WalletTopupSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },

//     // Wallet me jitna credit hoga
//     amount: {
//       type: Number,
//       required: true,
//       min: 1,
//     },

//     // Platform/service fee
//     serviceFee: {
//       type: Number,
//       default: 0,
//     },

//     // Razorpay se user se jitna charge hoga
//     debitAmount: {
//       type: Number,
//       required: true,
//       min: 1,
//     },

//     selectedMethod: {
//       type: String,
//       enum: ["upi", "card", "netbanking"],
//       default: "upi",
//     },

//     currency: {
//       type: String,
//       default: "INR",
//     },

//     razorpayOrderId: {
//       type: String,
//       required: true,
//       unique: true,
//       index: true,
//     },

//     razorpayPaymentId: {
//       type: String,
//       default: null,
//       index: true,
//     },

//     status: {
//       type: String,
//       enum: ["created", "paid", "failed"],
//       default: "created",
//       index: true,
//     },

//     method: {
//       type: String,
//       default: "unknown",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("WalletTopup", WalletTopupSchema);



// models/WalletTopup.js
const mongoose = require("mongoose");

const WalletTopupSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Wallet me jitna credit hoga
    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    // Platform/service fee
    serviceFee: {
      type: Number,
      default: 0,
    },

    // Razorpay se user se jitna charge hoga
    debitAmount: {
      type: Number,
      required: true,
      min: 1,
    },

    selectedMethod: {
      type: String,
    enum: ["upi", "netbanking", "qr", "card", "bank_transfer"],
      default: "upi",
    },

    currency: {
      type: String,
      default: "INR",
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
      index: true,
    },

    method: {
      type: String,
      default: "unknown",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WalletTopup", WalletTopupSchema);