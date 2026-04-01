// models/SubscriptionPeriod.js
const mongoose = require("mongoose");

const SubscriptionPeriodSchema = new mongoose.Schema(
  {
    // Who this period belongs to
    subjectType: { type: String, enum: ["USER", "ORG"], required: true },
    subjectId:   { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

    // Plan / billing info at the time of activation
    planKey:       { type: String, required: true },             // 'free'|'pro'|'enterprise'
    billingCycle:  { type: String, enum: ["monthly","yearly"], required: true },

    // Period window (inclusive start, exclusive end is typical; you can treat end as due date)
    periodStart:   { type: Date, required: true },               // first activation or previous due
    periodEnd:     { type: Date, required: true },               // next due date

    // Financials at purchase time
    amount:        { type: Number, required: true },             // in paise (Razorpay) or cents
    currency:      { type: String, default: "INR" },

    // Link to payment record (optional but useful)
    paymentId:     { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
    razorpay_order_id:   { type: String },
    razorpay_payment_id: { type: String },

    // Status of this period
    // 'active' means it was paid and period is currently in effect (now in [start,end))
    // 'expired' if now >= periodEnd; 'scheduled' if you pre-create the next period before start.
    status: { type: String, enum: ["active","expired","scheduled","canceled"], default: "active" },
  },
  { timestamps: true }
);

// helpful index to avoid dup periods for the same window
SubscriptionPeriodSchema.index(
  { subjectType: 1, subjectId: 1, periodStart: 1, periodEnd: 1 },
  { unique: true }
);

module.exports = mongoose.model("SubscriptionPeriod", SubscriptionPeriodSchema);
