// // src/routes/billingVerify.js
// /*const express = require("express");
// const crypto = require("crypto");
// const router = express.Router();
// const  razorpay  = require("../utils/razorpay");
// const SubscriptionPeriod = require("../models/SubscriptionPeriod");
// const Payment = require("../models/Payment");
// const User = require("../models/User");
// const Organization = require("../models/organization");

// const {
//   startUserPlan, renewUserPlanFromDue,
//   startOrgEnterprise, renewOrgFromDue,
// } = require("../service/billing");

// // Utility: verify signature
// function verifySignature(orderId, paymentId, signature) {
//   const hmac = crypto.createHmac("sha256", razorpay.key_secret);
//   hmac.update(orderId + "|" + paymentId);
//   const digest = hmac.digest("hex");
//   return digest === signature;
// }

// // Frontend calls this after successful Razorpay checkout
// router.post("/verifypayment", async (req, res) => {
//   try {
//     const {
//       paymentId,         // razorpay_payment_id
//       orderId,           // razorpay_order_id
//       signature,         // razorpay_signature
//     } = req.body || {};

//     if (!paymentId || !orderId || !signature) {
//       return res.status(400).json({ success: false, error: "missing_razorpay_fields" });
//     }
//     if (!verifySignature(orderId, paymentId, signature)) {
//       return res.status(400).json({ success: false, error: "invalid_signature" });
//     }

//     // Load payment row for this order
//     const payment = await Payment.findOne({ razorpay_order_id: orderId });
//     if (!payment) {
//       return res.status(404).json({ success: false, error: "payment_not_found" });
//     }

//     // Idempotency: if already processed, just return success
//     if (payment.status === "paid") {
//       return res.json({ success: true, alreadyProcessed: true });
//     }

//     // Mark paid
//     payment.status = "paid";
//     payment.razorpay_payment_id = paymentId;
//     payment.razorpay_signature = signature;
//     payment.processedAt = new Date();
//     await payment.save();

//     // Apply subscription change
//     if (payment.kind === "USER") {
//       const user = await User.findById(payment.userId);
//       if (!user) return res.status(404).json({ success: false, error: "user_not_found" });

//       // First purchase vs renewal
//       if (!user.plan || user.userType !== "IND" || user.plan=="free") {
//         await startUserPlan(user, payment.planKey, payment.billingCycle);
//       } else {
//         await renewUserPlanFromDue(user); // ← extend from previous due date
//       }

//       return res.json({
//         success: true,
//         kind: "USER",
//         plan: user.plan,
//         billingCycle: user.billingCycle,
//         currentPeriodEnd: user.currentPeriodEnd,
//       });
//     }

//     if (payment.kind === "ORG") {
//       const org = await Organization.findById(payment.orgId);
//       if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

//       // First purchase vs renewal
//       if (!org.plan) {
//         await startOrgEnterprise(org, payment.billingCycle);
//       } else {
//         await renewOrgFromDue(org); // ← extend from previous due date
//       }

//       return res.json({
//         success: true,
//         kind: "ORG",
//         orgId: org._id,
//         userId: payment.userId,
//         plan: org.plan,
//         billingCycle: org.billingCycle,
//         currentPeriodEnd: org.currentPeriodEnd,
//         orgPoolCap: org.orgPoolCap,
//         orgPoolUsed: org.orgPoolUsed,
//         orgExtraTokensRemaining: org.orgExtraTokensRemaining,
//       });
//     }

//     return res.status(400).json({ success: false, error: "unknown_payment_kind" });
//   } catch (e) {
//     console.error("billing/verify", e);
//     return res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// module.exports = router;
// */




// // src/routes/billingVerify.js
// const express = require("express");
// const crypto = require("crypto");
// const router = express.Router();

// // NOTE: keep your own Razorpay instance/export as-is
// const razorpay = require("../utils/razorpay");

// const SubscriptionPeriod = require("../models/SubscriptionPeriod"); // NEW
// const Payment = require("../models/Payment");
// const User = require("../models/User");
// // If your file is named Organization.js, keep your path; don't change if it's correct in your project
// const Organization = require("../models/organization");

// const {
//   startUserPlan, renewUserPlanFromDue,
//   startOrgEnterprise, renewOrgFromDue,
// } = require("../service/billing");

// // Utility: verify signature (kept as-is)
// function verifySignature(orderId, paymentId, signature) {
//   const hmac = crypto.createHmac("sha256", razorpay.key_secret);
//   hmac.update(orderId + "|" + paymentId);
//   const digest = hmac.digest("hex");
//   return digest === signature;
// }

// // Frontend calls this after successful Razorpay checkout
// router.post("/verifypayment", async (req, res) => {
//   try {
//     const {
//       paymentId,         // razorpay_payment_id
//       orderId,           // razorpay_order_id
//       signature,         // razorpay_signature
//     } = req.body || {};

//     if (!paymentId || !orderId || !signature) {
//       return res.status(400).json({ success: false, error: "missing_razorpay_fields" });
//     }
//     if (!verifySignature(orderId, paymentId, signature)) {
//       return res.status(400).json({ success: false, error: "invalid_signature" });
//     }

//     // Load payment row for this order
//     const payment = await Payment.findOne({ razorpay_order_id: orderId });
//     if (!payment) {
//       return res.status(404).json({ success: false, error: "payment_not_found" });
//     }

//     // Idempotency: if already processed, just return success
//     if (payment.status === "paid") {
//       return res.json({ success: true, alreadyProcessed: true });
//     }

//     // Mark paid
//     payment.status = "paid";
//     payment.razorpay_payment_id = paymentId;
//     payment.razorpay_signature = signature;
//     payment.processedAt = new Date();
//     await payment.save();

//     // ----------------------------------------------------
//     // USER PURCHASE / RENEWAL
//     // ----------------------------------------------------
//     if (payment.kind === "USER") {
//       const user = await User.findById(payment.userId);
//       if (!user) return res.status(404).json({ success: false, error: "user_not_found" });

//       // We need to persist an anchored period row:
//       //  - First purchase:  [now, now+cycle]
//       //  - Renewal:         [previousDue, previousDue+cycle]
//       let periodStart;            // NEW
//       let periodEnd;              // NEW
//       let subscriptionPeriodDoc;  // NEW

//       // Capture the key values used for the period record
//       const planKeyAtPayment = payment.planKey;             // 'free' | 'pro'
//       const cycleAtPayment   = payment.billingCycle;        // 'monthly' | 'yearly'
//       const amountAtPayment  = payment.amount;              // paise
//       const currencyAtPay    = payment.currency || "INR";

//       // First purchase vs renewal (your original rule: treat 'free' as first purchase too)
//       if (!user.plan || user.userType !== "IND" || user.plan === "free") {
//         // FIRST PURCHASE: anchor starts at current time BEFORE startUserPlan mutates user
//         const beforeStart = new Date();                     // NEW
//         await startUserPlan(user, planKeyAtPayment, cycleAtPayment);
//         // After startUserPlan, user.currentPeriodEnd points to the first due date
//         periodStart = beforeStart;                          // NEW
//         periodEnd   = user.currentPeriodEnd;                // NEW

//         // NEW: write a SubscriptionPeriod row
//         subscriptionPeriodDoc = await SubscriptionPeriod.create({
//           subjectType: "USER",
//           subjectId: user._id,
//           planKey: user.plan,                               // 'free' | 'pro'
//           billingCycle: user.billingCycle,                  // 'monthly' | 'yearly'
//           periodStart,
//           periodEnd,
//           amount: amountAtPayment,
//           currency: currencyAtPay,
//           paymentId: payment._id,
//           razorpay_order_id: payment.razorpay_order_id,
//           razorpay_payment_id: payment.razorpay_payment_id,
//           status: "active",
//         });
//       } else {
//         // RENEWAL: anchor from previous due date (no freebies)
//         const previousDue = user.currentPeriodEnd;          // NEW (this is the anchor)
//         await renewUserPlanFromDue(user);                   // shifts currentPeriodEnd forward by 1 cycle
//         periodStart = previousDue;                          // NEW
//         periodEnd   = user.currentPeriodEnd;                // NEW

//         // NEW: write a SubscriptionPeriod row
//         subscriptionPeriodDoc = await SubscriptionPeriod.create({
//           subjectType: "USER",
//           subjectId: user._id,
//           planKey: user.plan,
//           billingCycle: user.billingCycle,
//           periodStart,
//           periodEnd,
//           amount: amountAtPayment,
//           currency: currencyAtPay,
//           paymentId: payment._id,
//           razorpay_order_id: payment.razorpay_order_id,
//           razorpay_payment_id: payment.razorpay_payment_id,
//           status: "active",
//         });
//       }

//       return res.json({
//         success: true,
//         kind: "USER",
//         plan: user.plan,
//         billingCycle: user.billingCycle,
//         currentPeriodEnd: user.currentPeriodEnd,
//         // NEW: echo back the period we just recorded
//         subscriptionPeriod: {
//           id: subscriptionPeriodDoc?._id,
//           periodStart,
//           periodEnd,
//         },
//       });
//     }

//     // ----------------------------------------------------
//     // ORG PURCHASE / RENEWAL
//     // ----------------------------------------------------
//     if (payment.kind === "ORG") {
//       console.log("Organization purchase called");
//       const org = await Organization.findById(payment.orgId);
//       if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

//       let periodStart;            // NEW
//       let periodEnd;              // NEW
//       let subscriptionPeriodDoc;  // NEW

//       const planKeyAtPayment = "enterprise";
//       const cycleAtPayment   = payment.billingCycle;
//       const amountAtPayment  = payment.amount;
//       const currencyAtPay    = payment.currency || "INR";
//       console.log(org.plan);
//       if (!org.plan) {
//         // FIRST PURCHASE for org
//         const beforeStart = new Date();                     // NEW
//         await startOrgEnterprise(org, cycleAtPayment);
//         periodStart = beforeStart;                          // NEW
//         periodEnd   = org.currentPeriodEnd;                 // NEW

//         // NEW: write a SubscriptionPeriod row
//         subscriptionPeriodDoc = await SubscriptionPeriod.create({
//           subjectType: "ORG",
//           subjectId: org._id,
//           planKey: planKeyAtPayment,                        // 'enterprise'
//           billingCycle: org.billingCycle,                   // 'monthly' | 'yearly'
//           periodStart,
//           periodEnd,
//           amount: amountAtPayment,
//           currency: currencyAtPay,
//           paymentId: payment._id,
//           razorpay_order_id: payment.razorpay_order_id,
//           razorpay_payment_id: payment.razorpay_payment_id,
//           status: "active",
//         });
//       } else {
//         // RENEWAL for org (anchor from previous due date)
//         const previousDue = org.currentPeriodEnd;           // NEW
//         await renewOrgFromDue(org);                         // moves currentPeriodEnd forward by 1 cycle
//         periodStart = previousDue;                          // NEW
//         periodEnd   = org.currentPeriodEnd;                 // NEW

//         // NEW: write a SubscriptionPeriod row
//         subscriptionPeriodDoc = await SubscriptionPeriod.create({
//           subjectType: "ORG",
//           subjectId: org._id,
//           planKey: planKeyAtPayment,
//           billingCycle: org.billingCycle,
//           periodStart,
//           periodEnd,
//           amount: amountAtPayment,
//           currency: currencyAtPay,
//           paymentId: payment._id,
//           razorpay_order_id: payment.razorpay_order_id,
//           razorpay_payment_id: payment.razorpay_payment_id,
//           status: "active",
//         });
//       }

//       return res.json({
//         success: true,
//         kind: "ORG",
//         orgId: org._id,
//         userId: payment.userId,
//         plan: org.plan,
//         billingCycle: org.billingCycle,
//         currentPeriodEnd: org.currentPeriodEnd,
//         orgPoolCap: org.orgPoolCap,
//         orgPoolUsed: org.orgPoolUsed,
//         orgExtraTokensRemaining: org.orgExtraTokensRemaining,
//         // NEW: echo back the period we just recorded
//         subscriptionPeriod: {
//           id: subscriptionPeriodDoc?._id,
//           periodStart,
//           periodEnd,
//         },
//       });
//     }

//     // Fallback
//     return res.status(400).json({ success: false, error: "unknown_payment_kind" });
//   } catch (e) {
//     console.error("billing/verify", e);
//     return res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// module.exports = router;


const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const razorpay = require("../utils/razorpay");

const SubscriptionPeriod = require("../models/SubscriptionPeriod");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Organization = require("../models/organization");

const {
  startUserPlan,
  renewUserPlanFromDue,
  startOrgEnterprise,
  renewOrgFromDue,
} = require("../service/billing");

const { generateInvoicePDF } = require("../services/invoice.service");
const { sendInvoiceEmail } = require("../services/email.service");

/* -------------------- Razorpay signature verify -------------------- */
function verifySignature(orderId, paymentId, signature) {
  const hmac = crypto.createHmac("sha256", razorpay.key_secret);
  hmac.update(`${orderId}|${paymentId}`);
  return hmac.digest("hex") === signature;
}

/* -------------------- VERIFY PAYMENT -------------------- */
router.post("/verifypayment", async (req, res) => {
  try {
    const { paymentId, orderId, signature } = req.body || {};

    if (!paymentId || !orderId || !signature) {
      return res.status(400).json({ success: false, error: "missing_razorpay_fields" });
    }

    if (!verifySignature(orderId, paymentId, signature)) {
      return res.status(400).json({ success: false, error: "invalid_signature" });
    }

    const payment = await Payment.findOne({ razorpay_order_id: orderId });
    if (!payment) {
      return res.status(404).json({ success: false, error: "payment_not_found" });
    }

    // Idempotency
    if (payment.status === "paid") {
      return res.json({ success: true, alreadyProcessed: true });
    }

    /* -------------------- MARK PAID -------------------- */
    payment.status = "paid";
    payment.razorpay_payment_id = paymentId;
    payment.razorpay_signature = signature;
    payment.processedAt = new Date();
    await payment.save();

    /* ====================================================
       USER PLAN
    ==================================================== */
    if (payment.kind === "USER") {
      const user = await User.findById(payment.userId);
      if (!user) return res.status(404).json({ success: false, error: "user_not_found" });

      let periodStart, periodEnd, subscriptionPeriodDoc;

      const planKey = payment.planKey;          // free | pro
      const billingCycle = payment.billingCycle;
      const amount = payment.amount;

      if (!user.plan || user.plan === "free") {
        const start = new Date();
        await startUserPlan(user, planKey, billingCycle);
        periodStart = start;
        periodEnd = user.currentPeriodEnd;
      } else {
        periodStart = user.currentPeriodEnd;
        await renewUserPlanFromDue(user);
        periodEnd = user.currentPeriodEnd;
      }

      subscriptionPeriodDoc = await SubscriptionPeriod.create({
        subjectType: "USER",
        subjectId: user._id,
        planKey: user.plan,
        billingCycle: user.billingCycle,
        periodStart,
        periodEnd,
        amount,
        currency: "INR",
        paymentId: payment._id,
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_payment_id: payment.razorpay_payment_id,
        status: "active",
      });

      /* -------------------- INVOICE -------------------- */
      const invoiceNo = `INV-${payment._id}`;
      const date = new Date(payment.processedAt).toLocaleDateString("en-GB");

      const subtotal = amount;
      const gst = +(subtotal * 0.18).toFixed(2);
      const total = +(subtotal + gst).toFixed(2);

      const pdfBuffer = await generateInvoicePDF({
        logo: "",
        date,
        invoiceNo,
        buyerName: user.name,
        buyerEmail: user.email,
        items: [
          {
            title: planKey.toUpperCase(),
            subtitle: billingCycle,
            price: subtotal,
          },
        ],
        total: total.toFixed(2),
      });

      const PLAN_META = {
        pro: {
          name: "Pro",
          tokens: "100,000",
          features: `
            ✓ Extra Tokens Feature<br/>
            ✓ 50,000 Extra Tokens<br/>
            ✓ Extra Token Price ₹200
          `,
        },
      };

      await sendInvoiceEmail({
        to: user.email,
        buyerName: user.name,
        buyerEmail: user.email,
        plan: PLAN_META[planKey],
        price: subtotal,
        tokens: PLAN_META[planKey]?.tokens,
        invoiceNo,
        date,
        subtotal,
        gst,
        total,
        pdfBuffer,
      });

      return res.json({
        success: true,
        kind: "USER",
        plan: user.plan,
        billingCycle: user.billingCycle,
        currentPeriodEnd: user.currentPeriodEnd,
        subscriptionPeriod: {
          id: subscriptionPeriodDoc._id,
          periodStart,
          periodEnd,
        },
      });
    }

    /* ====================================================
       ORG PLAN (ENTERPRISE)
    ==================================================== */
    if (payment.kind === "ORG") {
      const org = await Organization.findById(payment.orgId);
      if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

      let periodStart, periodEnd, subscriptionPeriodDoc;
      const amount = payment.amount;

      if (!org.plan) {
        const start = new Date();
        await startOrgEnterprise(org, payment.billingCycle);
        periodStart = start;
        periodEnd = org.currentPeriodEnd;
      } else {
        periodStart = org.currentPeriodEnd;
        await renewOrgFromDue(org);
        periodEnd = org.currentPeriodEnd;
      }

      subscriptionPeriodDoc = await SubscriptionPeriod.create({
        subjectType: "ORG",
        subjectId: org._id,
        planKey: "enterprise",
        billingCycle: org.billingCycle,
        periodStart,
        periodEnd,
        amount,
        currency: "INR",
        paymentId: payment._id,
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_payment_id: payment.razorpay_payment_id,
        status: "active",
      });

      /* -------------------- INVOICE -------------------- */
      const owner = await User.findById(payment.userId);

      const invoiceNo = `INV-${payment._id}`;
      const date = new Date(payment.processedAt).toLocaleDateString("en-GB");

      const subtotal = amount;
      const gst = +(subtotal * 0.18).toFixed(2);
      const total = +(subtotal + gst).toFixed(2);

      const pdfBuffer = await generateInvoicePDF({
        logo: "",
        date,
        invoiceNo,
        buyerName: owner.name,
        buyerEmail: owner.email,
        items: [
          {
            title: "ENTERPRISE",
            subtitle: payment.billingCycle,
            price: subtotal,
          },
        ],
        total: total.toFixed(2),
      });

      await sendInvoiceEmail({
        to: owner.email,
        buyerName: owner.name,
        buyerEmail: owner.email,
        plan: {
          name: "Enterprise",
          tokens: "1,000,000",
          features: `
            ✓ Team Access<br/>
            ✓ Unlimited History<br/>
            ✓ Priority Support
          `,
        },
        price: subtotal,
        tokens: "1,000,000",
        invoiceNo,
        date,
        subtotal,
        gst,
        total,
        pdfBuffer,
      });

      return res.json({
        success: true,
        kind: "ORG",
        orgId: org._id,
        plan: org.plan,
        billingCycle: org.billingCycle,
        currentPeriodEnd: org.currentPeriodEnd,
        subscriptionPeriod: {
          id: subscriptionPeriodDoc._id,
          periodStart,
          periodEnd,
        },
      });
    }

    return res.status(400).json({ success: false, error: "unknown_payment_kind" });
  } catch (err) {
    console.error("billingVerify error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
