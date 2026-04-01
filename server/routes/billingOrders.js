// src/routes/billingOrders.js
const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const  razorpay  = require("../utils/razorpay");
const { priceFor, PLANS } = require("../config/plans");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Organization = require("../models/organization");
const { generateInvoicePDF } = require("../services/invoice.service");
const { sendInvoiceEmail } = require("../services/email.service");

const { requireAuth } = require("../utils/auth");

// Create IND order (free or pro)
router.post("/create/user", requireAuth, async (req, res) => {
  try {
    const { planKey, billingCycle } = req.body || {};
    if (!["free", "pro"].includes(planKey)) {
      return res.status(400).json({ success: false, error: "invalid_plan" });
    }
    if (!["monthly", "yearly"].includes(billingCycle)) {
      return res.status(400).json({ success: false, error: "invalid_billing_cycle" });
    }

    const user = await User.findById(req.user._id);
    if (!user || user.userType !== "IND") {
      return res.status(403).json({ success: false, error: "not_individual_account" });
    }

    // Free plan: no order needed. You can directly start/renew (or skip purchase)
    if (planKey === "free") {
      return res.json({ success: true, free: true, message: "no_payment_required" });
    }

    const amount = priceFor(planKey, billingCycle) * 100; // paise
const receipt = `user-${user._id.toString().slice(-6)}-${Date.now()}`;
    console.log(amount);
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt,
      notes: {
        kind: "USER",
        planKey,
        billingCycle,
        userId: String(user._id),
      },
    });

    const payment = await Payment.create({
      kind: "USER",
      userId: user._id,
      planKey,
      billingCycle,
      amount:amount/100,
      currency: "INR",
      razorpay_order_id: order.id,
      status: "created",
    });

    return res.json({
      success: true,
      order,
      key: razorpay.key_id,
      paymentId: payment._id,
    });
  } catch (e) {
    console.error("orders/user", e);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// Create ORG order (enterprise)
router.post("/create/org", requireAuth, async (req, res) => {
  try {
    const { orgId, billingCycle ,  planKey} = req.body || {};
    if (!orgId) return res.status(400).json({ success: false, error: "orgId_required" });
    if (!planKey) return res.status(400).json({ success: false, error: "planKey_required" });

    if (!["monthly", "yearly"].includes(billingCycle)) {
      return res.status(400).json({ success: false, error: "invalid_billing_cycle" });
    }

    const caller = await User.findById(req.user._id);
    console.log(caller);
    if (!caller || caller.userType !== "ORG" || caller.role !== "Owner" || String(caller.orgId) !== String(orgId)) {
      return res.status(403).json({ success: false, error: "not_org_owner" });
    }

    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

    //const planKey = "enterprise";
    const amount = priceFor(planKey, billingCycle) * 100; // paise
   // const receipt = `org-${org._id}-${Date.now()}`;
const receipt = `org-${org._id.toString().slice(-6)}-${Date.now()}`;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt,
      notes: {
        kind: "ORG",
        planKey,
        billingCycle,
        orgId: String(org._id),
        ownerId: String(caller._id),
      },
    });

    const payment = await Payment.create({
      kind: "ORG",
      orgId: org._id,
      userId:req.user._id,
      planKey,
      billingCycle,
      amount: amount/100,
      currency: "INR",
      razorpay_order_id: order.id,
      status: "created",
    });

    return res.json({
      success: true,
      order,
      key: razorpay.key_id,
      paymentId: payment._id,
    });
  } catch (e) {
    console.error("orders/org", e);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
