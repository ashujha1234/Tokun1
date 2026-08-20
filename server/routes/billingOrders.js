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

/* How close to the due date a subscription may be renewed. Shared with the
   dashboard's Renew button, which hides itself outside this window (see
   SubscriptionsSection in frontend/src/pages/self-dash.tsx) — the check lives
   here as well because the button is not what holds the money. */
const RENEWAL_WINDOW_DAYS = 7;

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

    /* Not a month early.

       Renewing the plan you're already on extends it from the existing due date
       (renewUserPlanFromDue in service/billing.js), so no time was ever lost —
       but nothing stopped an active subscriber being charged again the day after
       they paid, and the dashboard's Renew button offered exactly that. A charge
       for something the account already has, four weeks before it needs it, is
       not a renewal; it is a surprise on a card statement.

       So renewal opens only inside the window before the due date. Anything else
       — a different plan, a lapsed subscription, no due date on record — is
       untouched and goes through as before. */
    if (
      user.plan === planKey &&
      user.subscriptionStatus === "active" &&
      user.currentPeriodEnd
    ) {
      const msLeft = new Date(user.currentPeriodEnd).getTime() - Date.now();
      const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));

      if (daysLeft > RENEWAL_WINDOW_DAYS) {
        return res.status(400).json({
          success: false,
          error: "renewal_too_early",
          currentPeriodEnd: user.currentPeriodEnd,
          daysLeft,
          message: `Your ${planKey.toUpperCase()} plan is already active until ${new Date(
            user.currentPeriodEnd
          ).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}. You can renew it in the last ${RENEWAL_WINDOW_DAYS} days before that.`,
        });
      }
    }

    const amount = priceFor(planKey, billingCycle) * 100; // paise
const receipt = `tokun_user-${user._id.toString().slice(-6)}-${Date.now()}`;
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt,
      notes: {
        project: "Tokun",
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
    if (!caller || caller.userType !== "ORG" || caller.role !== "Owner" || String(caller.orgId) !== String(orgId)) {
      return res.status(403).json({ success: false, error: "not_org_owner" });
    }

    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

    // Same rule as the individual route above — an active org plan isn't
    // renewable until it's near its due date.
    if (
      org.plan === planKey &&
      org.subscriptionStatus === "active" &&
      org.currentPeriodEnd
    ) {
      const daysLeft = Math.ceil(
        (new Date(org.currentPeriodEnd).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );
      if (daysLeft > RENEWAL_WINDOW_DAYS) {
        return res.status(400).json({
          success: false,
          error: "renewal_too_early",
          currentPeriodEnd: org.currentPeriodEnd,
          daysLeft,
          message: `This organization's ${String(planKey).toUpperCase()} plan is active until ${new Date(
            org.currentPeriodEnd
          ).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}. You can renew it in the last ${RENEWAL_WINDOW_DAYS} days before that.`,
        });
      }
    }

    //const planKey = "enterprise";
    const amount = priceFor(planKey, billingCycle) * 100; // paise
   // const receipt = `org-${org._id}-${Date.now()}`;
const receipt = `tokun_org-${org._id.toString().slice(-6)}-${Date.now()}`;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt,
      notes: {
        project: "Tokun",
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
