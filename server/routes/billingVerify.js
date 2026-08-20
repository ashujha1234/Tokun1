// // // src/routes/billingVerify.js
// // /*const express = require("express");
// // const crypto = require("crypto");
// // const router = express.Router();
// // const  razorpay  = require("../utils/razorpay");
// // const SubscriptionPeriod = require("../models/SubscriptionPeriod");
// // const Payment = require("../models/Payment");
// // const User = require("../models/User");
// // const Organization = require("../models/organization");

// // const {
// //   startUserPlan, renewUserPlanFromDue,
// //   startOrgEnterprise, renewOrgFromDue,
// // } = require("../service/billing");

// // // Utility: verify signature
// // function verifySignature(orderId, paymentId, signature) {
// //   const hmac = crypto.createHmac("sha256", razorpay.key_secret);
// //   hmac.update(orderId + "|" + paymentId);
// //   const digest = hmac.digest("hex");
// //   return digest === signature;
// // }

// // // Frontend calls this after successful Razorpay checkout
// // router.post("/verifypayment", async (req, res) => {
// //   try {
// //     const {
// //       paymentId,         // razorpay_payment_id
// //       orderId,           // razorpay_order_id
// //       signature,         // razorpay_signature
// //     } = req.body || {};

// //     if (!paymentId || !orderId || !signature) {
// //       return res.status(400).json({ success: false, error: "missing_razorpay_fields" });
// //     }
// //     if (!verifySignature(orderId, paymentId, signature)) {
// //       return res.status(400).json({ success: false, error: "invalid_signature" });
// //     }

// //     // Load payment row for this order
// //     const payment = await Payment.findOne({ razorpay_order_id: orderId });
// //     if (!payment) {
// //       return res.status(404).json({ success: false, error: "payment_not_found" });
// //     }

// //     // Idempotency: if already processed, just return success
// //     if (payment.status === "paid") {
// //       return res.json({ success: true, alreadyProcessed: true });
// //     }

// //     // Mark paid
// //     payment.status = "paid";
// //     payment.razorpay_payment_id = paymentId;
// //     payment.razorpay_signature = signature;
// //     payment.processedAt = new Date();
// //     await payment.save();

// //     // Apply subscription change
// //     if (payment.kind === "USER") {
// //       const user = await User.findById(payment.userId);
// //       if (!user) return res.status(404).json({ success: false, error: "user_not_found" });

// //       // First purchase vs renewal
// //       if (!user.plan || user.userType !== "IND" || user.plan=="free") {
// //         await startUserPlan(user, payment.planKey, payment.billingCycle);
// //       } else {
// //         await renewUserPlanFromDue(user); // ← extend from previous due date
// //       }

// //       return res.json({
// //         success: true,
// //         kind: "USER",
// //         plan: user.plan,
// //         billingCycle: user.billingCycle,
// //         currentPeriodEnd: user.currentPeriodEnd,
// //       });
// //     }

// //     if (payment.kind === "ORG") {
// //       const org = await Organization.findById(payment.orgId);
// //       if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

// //       // First purchase vs renewal
// //       if (!org.plan) {
// //         await startOrgEnterprise(org, payment.billingCycle);
// //       } else {
// //         await renewOrgFromDue(org); // ← extend from previous due date
// //       }

// //       return res.json({
// //         success: true,
// //         kind: "ORG",
// //         orgId: org._id,
// //         userId: payment.userId,
// //         plan: org.plan,
// //         billingCycle: org.billingCycle,
// //         currentPeriodEnd: org.currentPeriodEnd,
// //         orgPoolCap: org.orgPoolCap,
// //         orgPoolUsed: org.orgPoolUsed,
// //         orgExtraTokensRemaining: org.orgExtraTokensRemaining,
// //       });
// //     }

// //     return res.status(400).json({ success: false, error: "unknown_payment_kind" });
// //   } catch (e) {
// //     console.error("billing/verify", e);
// //     return res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });

// // module.exports = router;
// // */




// // // src/routes/billingVerify.js
// // const express = require("express");
// // const crypto = require("crypto");
// // const router = express.Router();

// // // NOTE: keep your own Razorpay instance/export as-is
// // const razorpay = require("../utils/razorpay");

// // const SubscriptionPeriod = require("../models/SubscriptionPeriod"); // NEW
// // const Payment = require("../models/Payment");
// // const User = require("../models/User");
// // // If your file is named Organization.js, keep your path; don't change if it's correct in your project
// // const Organization = require("../models/organization");

// // const {
// //   startUserPlan, renewUserPlanFromDue,
// //   startOrgEnterprise, renewOrgFromDue,
// // } = require("../service/billing");

// // // Utility: verify signature (kept as-is)
// // function verifySignature(orderId, paymentId, signature) {
// //   const hmac = crypto.createHmac("sha256", razorpay.key_secret);
// //   hmac.update(orderId + "|" + paymentId);
// //   const digest = hmac.digest("hex");
// //   return digest === signature;
// // }

// // // Frontend calls this after successful Razorpay checkout
// // router.post("/verifypayment", async (req, res) => {
// //   try {
// //     const {
// //       paymentId,         // razorpay_payment_id
// //       orderId,           // razorpay_order_id
// //       signature,         // razorpay_signature
// //     } = req.body || {};

// //     if (!paymentId || !orderId || !signature) {
// //       return res.status(400).json({ success: false, error: "missing_razorpay_fields" });
// //     }
// //     if (!verifySignature(orderId, paymentId, signature)) {
// //       return res.status(400).json({ success: false, error: "invalid_signature" });
// //     }

// //     // Load payment row for this order
// //     const payment = await Payment.findOne({ razorpay_order_id: orderId });
// //     if (!payment) {
// //       return res.status(404).json({ success: false, error: "payment_not_found" });
// //     }

// //     // Idempotency: if already processed, just return success
// //     if (payment.status === "paid") {
// //       return res.json({ success: true, alreadyProcessed: true });
// //     }

// //     // Mark paid
// //     payment.status = "paid";
// //     payment.razorpay_payment_id = paymentId;
// //     payment.razorpay_signature = signature;
// //     payment.processedAt = new Date();
// //     await payment.save();

// //     // ----------------------------------------------------
// //     // USER PURCHASE / RENEWAL
// //     // ----------------------------------------------------
// //     if (payment.kind === "USER") {
// //       const user = await User.findById(payment.userId);
// //       if (!user) return res.status(404).json({ success: false, error: "user_not_found" });

// //       // We need to persist an anchored period row:
// //       //  - First purchase:  [now, now+cycle]
// //       //  - Renewal:         [previousDue, previousDue+cycle]
// //       let periodStart;            // NEW
// //       let periodEnd;              // NEW
// //       let subscriptionPeriodDoc;  // NEW

// //       // Capture the key values used for the period record
// //       const planKeyAtPayment = payment.planKey;             // 'free' | 'pro'
// //       const cycleAtPayment   = payment.billingCycle;        // 'monthly' | 'yearly'
// //       const amountAtPayment  = payment.amount;              // paise
// //       const currencyAtPay    = payment.currency || "INR";

// //       // First purchase vs renewal (your original rule: treat 'free' as first purchase too)
// //       if (!user.plan || user.userType !== "IND" || user.plan === "free") {
// //         // FIRST PURCHASE: anchor starts at current time BEFORE startUserPlan mutates user
// //         const beforeStart = new Date();                     // NEW
// //         await startUserPlan(user, planKeyAtPayment, cycleAtPayment);
// //         // After startUserPlan, user.currentPeriodEnd points to the first due date
// //         periodStart = beforeStart;                          // NEW
// //         periodEnd   = user.currentPeriodEnd;                // NEW

// //         // NEW: write a SubscriptionPeriod row
// //         subscriptionPeriodDoc = await SubscriptionPeriod.create({
// //           subjectType: "USER",
// //           subjectId: user._id,
// //           planKey: user.plan,                               // 'free' | 'pro'
// //           billingCycle: user.billingCycle,                  // 'monthly' | 'yearly'
// //           periodStart,
// //           periodEnd,
// //           amount: amountAtPayment,
// //           currency: currencyAtPay,
// //           paymentId: payment._id,
// //           razorpay_order_id: payment.razorpay_order_id,
// //           razorpay_payment_id: payment.razorpay_payment_id,
// //           status: "active",
// //         });
// //       } else {
// //         // RENEWAL: anchor from previous due date (no freebies)
// //         const previousDue = user.currentPeriodEnd;          // NEW (this is the anchor)
// //         await renewUserPlanFromDue(user);                   // shifts currentPeriodEnd forward by 1 cycle
// //         periodStart = previousDue;                          // NEW
// //         periodEnd   = user.currentPeriodEnd;                // NEW

// //         // NEW: write a SubscriptionPeriod row
// //         subscriptionPeriodDoc = await SubscriptionPeriod.create({
// //           subjectType: "USER",
// //           subjectId: user._id,
// //           planKey: user.plan,
// //           billingCycle: user.billingCycle,
// //           periodStart,
// //           periodEnd,
// //           amount: amountAtPayment,
// //           currency: currencyAtPay,
// //           paymentId: payment._id,
// //           razorpay_order_id: payment.razorpay_order_id,
// //           razorpay_payment_id: payment.razorpay_payment_id,
// //           status: "active",
// //         });
// //       }

// //       return res.json({
// //         success: true,
// //         kind: "USER",
// //         plan: user.plan,
// //         billingCycle: user.billingCycle,
// //         currentPeriodEnd: user.currentPeriodEnd,
// //         // NEW: echo back the period we just recorded
// //         subscriptionPeriod: {
// //           id: subscriptionPeriodDoc?._id,
// //           periodStart,
// //           periodEnd,
// //         },
// //       });
// //     }

// //     // ----------------------------------------------------
// //     // ORG PURCHASE / RENEWAL
// //     // ----------------------------------------------------
// //     if (payment.kind === "ORG") {
// //       console.log("Organization purchase called");
// //       const org = await Organization.findById(payment.orgId);
// //       if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

// //       let periodStart;            // NEW
// //       let periodEnd;              // NEW
// //       let subscriptionPeriodDoc;  // NEW

// //       const planKeyAtPayment = "enterprise";
// //       const cycleAtPayment   = payment.billingCycle;
// //       const amountAtPayment  = payment.amount;
// //       const currencyAtPay    = payment.currency || "INR";
// //       console.log(org.plan);
// //       if (!org.plan) {
// //         // FIRST PURCHASE for org
// //         const beforeStart = new Date();                     // NEW
// //         await startOrgEnterprise(org, cycleAtPayment);
// //         periodStart = beforeStart;                          // NEW
// //         periodEnd   = org.currentPeriodEnd;                 // NEW

// //         // NEW: write a SubscriptionPeriod row
// //         subscriptionPeriodDoc = await SubscriptionPeriod.create({
// //           subjectType: "ORG",
// //           subjectId: org._id,
// //           planKey: planKeyAtPayment,                        // 'enterprise'
// //           billingCycle: org.billingCycle,                   // 'monthly' | 'yearly'
// //           periodStart,
// //           periodEnd,
// //           amount: amountAtPayment,
// //           currency: currencyAtPay,
// //           paymentId: payment._id,
// //           razorpay_order_id: payment.razorpay_order_id,
// //           razorpay_payment_id: payment.razorpay_payment_id,
// //           status: "active",
// //         });
// //       } else {
// //         // RENEWAL for org (anchor from previous due date)
// //         const previousDue = org.currentPeriodEnd;           // NEW
// //         await renewOrgFromDue(org);                         // moves currentPeriodEnd forward by 1 cycle
// //         periodStart = previousDue;                          // NEW
// //         periodEnd   = org.currentPeriodEnd;                 // NEW

// //         // NEW: write a SubscriptionPeriod row
// //         subscriptionPeriodDoc = await SubscriptionPeriod.create({
// //           subjectType: "ORG",
// //           subjectId: org._id,
// //           planKey: planKeyAtPayment,
// //           billingCycle: org.billingCycle,
// //           periodStart,
// //           periodEnd,
// //           amount: amountAtPayment,
// //           currency: currencyAtPay,
// //           paymentId: payment._id,
// //           razorpay_order_id: payment.razorpay_order_id,
// //           razorpay_payment_id: payment.razorpay_payment_id,
// //           status: "active",
// //         });
// //       }

// //       return res.json({
// //         success: true,
// //         kind: "ORG",
// //         orgId: org._id,
// //         userId: payment.userId,
// //         plan: org.plan,
// //         billingCycle: org.billingCycle,
// //         currentPeriodEnd: org.currentPeriodEnd,
// //         orgPoolCap: org.orgPoolCap,
// //         orgPoolUsed: org.orgPoolUsed,
// //         orgExtraTokensRemaining: org.orgExtraTokensRemaining,
// //         // NEW: echo back the period we just recorded
// //         subscriptionPeriod: {
// //           id: subscriptionPeriodDoc?._id,
// //           periodStart,
// //           periodEnd,
// //         },
// //       });
// //     }

// //     // Fallback
// //     return res.status(400).json({ success: false, error: "unknown_payment_kind" });
// //   } catch (e) {
// //     console.error("billing/verify", e);
// //     return res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });

// // module.exports = router;


// const express = require("express");
// const crypto = require("crypto");
// const router = express.Router();

// const razorpay = require("../utils/razorpay");

// const SubscriptionPeriod = require("../models/SubscriptionPeriod");
// const Payment = require("../models/Payment");
// const User = require("../models/User");
// const Organization = require("../models/organization");

// const {
//   startUserPlan,
//   renewUserPlanFromDue,
//   startOrgEnterprise,
//   renewOrgFromDue,
// } = require("../service/billing");

// const { generateInvoicePDF } = require("../services/invoice.service");
// const { sendInvoiceEmail } = require("../services/email.service");

// /* -------------------- Razorpay signature verify -------------------- */
// function verifySignature(orderId, paymentId, signature) {
//   const hmac = crypto.createHmac("sha256", razorpay.key_secret);
//   hmac.update(`${orderId}|${paymentId}`);
//   return hmac.digest("hex") === signature;
// }

// /* -------------------- VERIFY PAYMENT -------------------- */
// router.post("/verifypayment", async (req, res) => {
//   try {
//     const { paymentId, orderId, signature } = req.body || {};

//     if (!paymentId || !orderId || !signature) {
//       return res.status(400).json({ success: false, error: "missing_razorpay_fields" });
//     }

//     if (!verifySignature(orderId, paymentId, signature)) {
//       return res.status(400).json({ success: false, error: "invalid_signature" });
//     }

//     const payment = await Payment.findOne({ razorpay_order_id: orderId });
//     if (!payment) {
//       return res.status(404).json({ success: false, error: "payment_not_found" });
//     }

//     // Idempotency
//     if (payment.status === "paid") {
//       return res.json({ success: true, alreadyProcessed: true });
//     }

//     /* -------------------- MARK PAID -------------------- */
//     payment.status = "paid";
//     payment.razorpay_payment_id = paymentId;
//     payment.razorpay_signature = signature;
//     payment.processedAt = new Date();
//     await payment.save();

//     /* ====================================================
//        USER PLAN
//     ==================================================== */
//     if (payment.kind === "USER") {
//       const user = await User.findById(payment.userId);
//       if (!user) return res.status(404).json({ success: false, error: "user_not_found" });

//       let periodStart, periodEnd, subscriptionPeriodDoc;

//       const planKey = payment.planKey;          // free | pro
//       const billingCycle = payment.billingCycle;
//       const amount = payment.amount;

//       if (!user.plan || user.plan === "free") {
//         const start = new Date();
//         await startUserPlan(user, planKey, billingCycle);
//         periodStart = start;
//         periodEnd = user.currentPeriodEnd;
//       } else {
//         periodStart = user.currentPeriodEnd;
//         await renewUserPlanFromDue(user);
//         periodEnd = user.currentPeriodEnd;
//       }

//       subscriptionPeriodDoc = await SubscriptionPeriod.create({
//         subjectType: "USER",
//         subjectId: user._id,
//         planKey: user.plan,
//         billingCycle: user.billingCycle,
//         periodStart,
//         periodEnd,
//         amount,
//         currency: "INR",
//         paymentId: payment._id,
//         razorpay_order_id: payment.razorpay_order_id,
//         razorpay_payment_id: payment.razorpay_payment_id,
//         status: "active",
//       });

//       /* -------------------- INVOICE -------------------- */
//       const invoiceNo = `INV-${payment._id}`;
//       const date = new Date(payment.processedAt).toLocaleDateString("en-GB");

//       const subtotal = amount;
//       const gst = +(subtotal * 0.18).toFixed(2);
//       const total = +(subtotal + gst).toFixed(2);

//       // const pdfBuffer = await generateInvoicePDF({
//       //   logo: "",
//       //   date,
//       //   invoiceNo,
//       //   buyerName: user.name,
//       //   buyerEmail: user.email,
//       //   items: [
//       //     {
//       //       title: planKey.toUpperCase(),
//       //       subtitle: billingCycle,
//       //       price: subtotal,
//       //     },
//       //   ],
//       //   total: total.toFixed(2),
//       // });

//       // BAAD MEIN — invoice fail hone pe bhi payment success return karo
// let pdfBuffer = null;
// try {
//   pdfBuffer = await generateInvoicePDF({
//     logo: "",
//     date,
//     invoiceNo,
//     buyerName: user.name,
//     buyerEmail: user.email,
//     items: [{ title: planKey.toUpperCase(), subtitle: billingCycle, price: subtotal }],
//     total: total.toFixed(2),
//   });

//       const PLAN_META = {
//         pro: {
//           name: "Pro",
//           tokens: "100,000",
//           features: `
//             ✓ Extra Tokens Feature<br/>
//             ✓ 50,000 Extra Tokens<br/>
//             ✓ Extra Token Price ₹200
//           `,
//         },
//       };

//       // await sendInvoiceEmail({
//       //   to: user.email,
//       //   buyerName: user.name,
//       //   buyerEmail: user.email,
//       //   plan: PLAN_META[planKey],
//       //   price: subtotal,
//       //   tokens: PLAN_META[planKey]?.tokens,
//       //   invoiceNo,
//       //   date,
//       //   subtotal,
//       //   gst,
//       //   total,
//       //   pdfBuffer,
//       // });
      



//   await sendInvoiceEmail({
//     to: user.email,
//     buyerName: user.name,
//     buyerEmail: user.email,
//     plan: PLAN_META[planKey],
//     price: subtotal,
//     tokens: PLAN_META[planKey]?.tokens,
//     invoiceNo,
//     date,
//     subtotal,
//     gst,
//     total,
//     pdfBuffer,
//   });

//   console.log("✅ Invoice email sent to", user.email);
// } catch (invoiceErr) {
//   console.error("⚠️ Invoice generation/email failed (payment still success):", invoiceErr.message);
//   // payment already saved — don't throw
// }
//       return res.json({
//         success: true,
//         kind: "USER",
//         plan: user.plan,
//         billingCycle: user.billingCycle,
//         currentPeriodEnd: user.currentPeriodEnd,
//         subscriptionPeriod: {
//           id: subscriptionPeriodDoc._id,
//           periodStart,
//           periodEnd,
//         },
//       });
//     }

//     /* ====================================================
//        ORG PLAN (ENTERPRISE)
//     ==================================================== */
//     if (payment.kind === "ORG") {
//       const org = await Organization.findById(payment.orgId);
//       if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

//       let periodStart, periodEnd, subscriptionPeriodDoc;
//       const amount = payment.amount;

//       if (!org.plan) {
//         const start = new Date();
//         await startOrgEnterprise(org, payment.billingCycle);
//         periodStart = start;
//         periodEnd = org.currentPeriodEnd;
//       } else {
//         periodStart = org.currentPeriodEnd;
//         await renewOrgFromDue(org);
//         periodEnd = org.currentPeriodEnd;
//       }

//       subscriptionPeriodDoc = await SubscriptionPeriod.create({
//         subjectType: "ORG",
//         subjectId: org._id,
//         planKey: "enterprise",
//         billingCycle: org.billingCycle,
//         periodStart,
//         periodEnd,
//         amount,
//         currency: "INR",
//         paymentId: payment._id,
//         razorpay_order_id: payment.razorpay_order_id,
//         razorpay_payment_id: payment.razorpay_payment_id,
//         status: "active",
//       });

//       /* -------------------- INVOICE -------------------- */
//       const owner = await User.findById(payment.userId);

//       const invoiceNo = `INV-${payment._id}`;
//       const date = new Date(payment.processedAt).toLocaleDateString("en-GB");

//       const subtotal = amount;
//       const gst = +(subtotal * 0.18).toFixed(2);
//       const total = +(subtotal + gst).toFixed(2);

//       const pdfBuffer = await generateInvoicePDF({
//         logo: "",
//         date,
//         invoiceNo,
//         buyerName: owner.name,
//         buyerEmail: owner.email,
//         items: [
//           {
//             title: "ENTERPRISE",
//             subtitle: payment.billingCycle,
//             price: subtotal,
//           },
//         ],
//         total: total.toFixed(2),
//       });

//       await sendInvoiceEmail({
//         to: owner.email,
//         buyerName: owner.name,
//         buyerEmail: owner.email,
//         plan: {
//           name: "Enterprise",
//           tokens: "1,000,000",
//           features: `
//             ✓ Team Access<br/>
//             ✓ Unlimited History<br/>
//             ✓ Priority Support
//           `,
//         },
//         price: subtotal,
//         tokens: "1,000,000",
//         invoiceNo,
//         date,
//         subtotal,
//         gst,
//         total,
//         pdfBuffer,
//       });

//       return res.json({
//         success: true,
//         kind: "ORG",
//         orgId: org._id,
//         plan: org.plan,
//         billingCycle: org.billingCycle,
//         currentPeriodEnd: org.currentPeriodEnd,
//         subscriptionPeriod: {
//           id: subscriptionPeriodDoc._id,
//           periodStart,
//           periodEnd,
//         },
//       });
//     }

//     return res.status(400).json({ success: false, error: "unknown_payment_kind" });
//   } catch (err) {
//     console.error("billingVerify error:", err);
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
const PlatformWallet = require("../models/PlatformWallet");

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
      return res
        .status(400)
        .json({ success: false, error: "missing_razorpay_fields" });
    }

    if (!verifySignature(orderId, paymentId, signature)) {
      return res
        .status(400)
        .json({ success: false, error: "invalid_signature" });
    }

    const payment = await Payment.findOne({ razorpay_order_id: orderId });
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, error: "payment_not_found" });
    }

    // Idempotency — agar already paid hai toh seedha success return karo
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
      if (!user)
        return res
          .status(404)
          .json({ success: false, error: "user_not_found" });

      let periodStart, periodEnd, subscriptionPeriodDoc;

      const planKey = payment.planKey;       // free | pro
      const billingCycle = payment.billingCycle;
      const amount = payment.amount;

      // First purchase vs renewal
      if (!user.plan || user.plan === "free") {
        const start = new Date();
        await startUserPlan(user, planKey, billingCycle);
        periodStart = start;
        periodEnd = user.currentPeriodEnd;
      } else {
        periodStart = user.currentPeriodEnd;
        /* Renew on the cycle that was PAID FOR, not the one on the account.
           renewUserPlanFromDue() extends by one `user.billingCycle`, and
           nothing here had updated that from the payment — so a monthly
           subscriber who renewed with the yearly toggle on was charged the
           yearly price (₹7,668) and given one extra MONTH. The cycle is set
           first; renewUserPlanFromDue saves the user, so this is persisted with
           it. */
        if (billingCycle && billingCycle !== user.billingCycle) {
          user.billingCycle = billingCycle;
        }
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

      /* ── ANSWER THE SUBSCRIBER HERE ──────────────────────────────────────
         The plan is live: the payment is marked paid, the user's plan/cycle/
         period have been written and the SubscriptionPeriod row exists. What
         follows is an invoice PDF and a Gmail SMTP send with it attached,
         which took seconds — seconds the subscriber spent on Razorpay's
         spinner watching a plan they had already paid for fail to appear.
         Both were already "log it and carry on" on failure, so neither has
         any business holding up the response. */
      res.json({
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

      settleUserSubscription().catch((bgErr) => {
        console.error("Post-subscription settlement failed (USER):", bgErr);
      });

      async function settleUserSubscription() {
        /* -------------------- USER INVOICE (safe — payment already saved) -------------------- */
        try {
          const invoiceNo = `INV-${payment._id}`;
          const date = new Date(payment.processedAt).toLocaleDateString("en-GB");

          /* GST off, exactly as the PDF has it.

             This used to add 18% here and nowhere else, so a ₹799 Pro plan
             produced an email reading "Total: ₹942.82" with a ₹799 PDF stapled
             to it — two different totals for one payment, neither matching the
             ₹799 Razorpay actually charged. generateInvoicePDF ignores any
             `total` passed to it and computes subtotal-with-no-GST itself (see
             the note in services/invoice.service.js), which is why only the
             email drifted. Re-enable in BOTH places, and only once the charge
             itself includes GST. */
          const subtotal = amount;
          const gst = 0;
          const total = +Number(subtotal).toFixed(2);

          const planCard = { plan: planKey, billingCycle, price: subtotal };

          const pdfBuffer = await generateInvoicePDF({
            logo: "",
            date,
            invoiceNo,
            buyerName: user.name || "Customer",
            buyerEmail: user.email || "",
            items: [
              {
                title: planKey.toUpperCase(),
                subtitle: billingCycle,
                price: subtotal,
              },
            ],
            total: total.toFixed(2),
            planCard,
          });

          if (user.email) {
            await sendInvoiceEmail({
              to: user.email,
              buyerName: user.name || "Customer",
              buyerEmail: user.email,
              items: [
                {
                  title: planKey.toUpperCase(),
                  subtitle: billingCycle,
                  price: subtotal,
                },
              ],
              invoiceNo,
              date,
              subtotal,
              gst,
              total,
              pdfBuffer,
              /* Was omitted, so the email rendered without the plan card the
                 PDF has — no plan summary and, more to the point, no "More
                 info." button, which is the one place it can actually be
                 clicked (a PDF's version is a picture of a button). The email
                 template has always had a {{PLAN_CARD_HTML}} slot; nothing was
                 filling it. Passing it also fixes the opening line, which read
                 "your recent purchase" instead of naming the subscription. */
              planCard,
            });
          }
        } catch (invoiceErr) {
          // Invoice fail hone pe bhi payment success return karo
          console.error(
            "⚠️ USER invoice/email failed (payment still success):",
            invoiceErr.message
          );
        }

        // Subscriptions have no seller to split with — the full amount is
        // Tokun's own revenue, so it goes straight into the admin dashboard's
        // platform-revenue ledger (safe — payment already saved above).
        try {
          await PlatformWallet.recordCommission(amount, {
            source: "subscription",
            refId: payment._id,
            description: `${planKey.toUpperCase()} subscription (${billingCycle})`,
          });
        } catch (revErr) {
          console.error("⚠️ PlatformWallet commission record failed (USER subscription):", revErr.message);
        }
      } // ── end settleUserSubscription ──

      return;
    }

    /* ====================================================
       ORG PLAN (ENTERPRISE)
    ==================================================== */
    if (payment.kind === "ORG") {
      const org = await Organization.findById(payment.orgId);
      if (!org)
        return res
          .status(404)
          .json({ success: false, error: "org_not_found" });

      let periodStart, periodEnd, subscriptionPeriodDoc;
      const amount = payment.amount;

      // First purchase vs renewal
      if (!org.plan) {
        const start = new Date();
        await startOrgEnterprise(org, payment.billingCycle);
        periodStart = start;
        periodEnd = org.currentPeriodEnd;
      } else {
        periodStart = org.currentPeriodEnd;
        // Same as the USER branch: extend by the cycle that was paid for.
        if (payment.billingCycle && payment.billingCycle !== org.billingCycle) {
          org.billingCycle = payment.billingCycle;
        }
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

      // Same reasoning as the USER branch above: the org's plan is live, so
      // the answer goes out now and the paperwork follows.
      res.json({
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

      settleOrgSubscription().catch((bgErr) => {
        console.error("Post-subscription settlement failed (ORG):", bgErr);
      });

      async function settleOrgSubscription() {
        /* -------------------- ORG INVOICE (safe — payment already saved) -------------------- */
        try {
          // owner null-safe fetch
          const owner = payment.userId
            ? await User.findById(payment.userId).catch(() => null)
            : null;

          if (!owner) {
            console.warn(
              "[billingVerify] ORG: owner user not found for invoice, skipping email"
            );
          } else {
            const invoiceNo = `INV-${payment._id}`;
            const date = new Date(payment.processedAt).toLocaleDateString("en-GB");

            // GST off and plan card passed through, for the same reasons as
            // the USER branch above — the two must stay in step.
            const subtotal = amount;
            const gst = 0;
            const total = +Number(subtotal).toFixed(2);

            const planCard = {
              plan: "enterprise",
              billingCycle: payment.billingCycle,
              price: subtotal,
            };

            const pdfBuffer = await generateInvoicePDF({
              logo: "",
              date,
              invoiceNo,
              buyerName: owner.name || "Customer",
              buyerEmail: owner.email || "",
              items: [
                {
                  title: "ENTERPRISE",
                  subtitle: payment.billingCycle,
                  price: subtotal,
                },
              ],
              total: total.toFixed(2),
              planCard,
            });

            if (owner.email) {
              await sendInvoiceEmail({
                to: owner.email,
                buyerName: owner.name || "Customer",
                buyerEmail: owner.email,
                items: [
                  {
                    title: "ENTERPRISE",
                    subtitle: payment.billingCycle,
                    price: subtotal,
                  },
                ],
                invoiceNo,
                date,
                subtotal,
                gst,
                total,
                pdfBuffer,
                planCard,
              });
            }
          }
        } catch (invoiceErr) {
          // Invoice fail hone pe bhi payment success return karo
          console.error(
            "⚠️ ORG invoice/email failed (payment still success):",
            invoiceErr.message
          );
        }

        // Subscriptions have no seller to split with — the full amount is
        // Tokun's own revenue, so it goes straight into the admin dashboard's
        // platform-revenue ledger (safe — payment already saved above).
        try {
          await PlatformWallet.recordCommission(amount, {
            source: "subscription",
            refId: payment._id,
            description: `ENTERPRISE subscription (${payment.billingCycle})`,
          });
        } catch (revErr) {
          console.error("⚠️ PlatformWallet commission record failed (ORG subscription):", revErr.message);
        }
      } // ── end settleOrgSubscription ──

      return;
    }

    // Fallback
    return res
      .status(400)
      .json({ success: false, error: "unknown_payment_kind" });
  } catch (err) {
    console.error("billingVerify error:", err);
    // The response may already be out — the invoice/ledger work runs after it.
    if (res.headersSent) return;
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;