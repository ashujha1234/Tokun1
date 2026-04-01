// src/models/Payment.js
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    // Common
    kind: { type: String, enum: ["USER", "ORG"], required: true },
    planKey: { type: String, required: true },               // 'free'|'pro'|'enterprise'
    billingCycle: { type: String, enum: ["monthly","yearly"], required: true },
    amount: { type: Number, required: true },                // paise
    currency: { type: String, default: "INR" },

    // Razorpay order/payment IDs
    razorpay_order_id: { type: String, index: true },
    razorpay_payment_id: { type: String, index: true },
    razorpay_signature: { type: String },

    // Who is paying
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },

    // State
    status: { type: String, enum: ["created","paid","failed","refunded"], default: "created" },

    // Safety
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
