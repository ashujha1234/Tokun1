// // // routes/purchaseRoutes.js
// // const express = require("express");
// // const router = express.Router();
// // const Razorpay = require("../utils/razorpay");
// // const Prompt = require("../models/Prompt");
// // const Purchase = require("../models/Purchase");
// // const { requireAuth } = require("../utils/auth");
// // const { requireKycVerified } = require("../utils/requireKycVerified");
// // const { logActivity } = require("../utils/activityLogger");
// // const crypto = require('crypto');


// // // POST /api/purchase/create-order/:promptId
// // router.post("/create-order/:promptId", requireAuth,requireKycVerified, async (req, res) => {
// //   try {
// //     const { promptId } = req.params;
// //     const prompt = await Prompt.findById(promptId);
// //     if (!prompt) return res.status(404).json({ success: false, error: "prompt_not_found" });
// // // ✅ Check if exclusive prompt already sold
// // if (prompt.exclusive && prompt.sold) {
// //   return res.status(400).json({ success: false, error: "prompt_already_sold" });
// // }
// //     // Amount in paise (Razorpay works in smallest currency unit)
// //     const amount = Math.round(prompt.tokun_price * 100); // tokun_price * 100
// // const shortReceipt = `p${prompt._id.toString().slice(-6)}u${req.user._id.toString().slice(-6)}`;
// // // example: p12ab34u56cd78

// //     const order = await Razorpay.orders.create({
// //       amount,
// //       currency: "INR",
// //       receipt: shortReceipt,
// //    //   payment_capture: 1, // auto capture
// //     });
// //     console.log(order);
// //     res.json({ success: true, order, prompt: { id: prompt._id, title: prompt.title, price: prompt.price } });
// //   } catch (err) {
// //     console.error("Razorpay create order error:", err);
// //     res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });



// // // POST /api/purchase/verify/:promptId
// // router.post("/verify/:promptId", requireAuth, async (req, res) => {
// //   try {
// //     const { promptId } = req.params;
// //     const { razorpayPaymentId, razorpayOrderId, razorpaySignature, pricePaid } = req.body;

// //     const prompt = await Prompt.findById(promptId);
// //     if (!prompt) return res.status(404).json({ success: false, error: "prompt_not_found" });

// //     if (prompt.exclusive && prompt.sold) {
// //   return res.status(400).json({ success: false, error: "prompt_already_sold" });
// // }
// //     // Verify signature
// //     const generatedSignature = crypto
// //       .createHmac("sha256", "<REDACTED — was a hardcoded Razorpay key_secret>")
// //       .update(razorpayOrderId + "|" + razorpayPaymentId)
// //       .digest("hex");

// //       console.log(generatedSignature);
// //     console.log(razorpaySignature);
// //     if (generatedSignature !== razorpaySignature) {
// //       return res.status(400).json({ success: false, error: "invalid_payment_signature" });
// //     }

// //     // Check if already purchased
// //     const alreadyPurchased = await Purchase.findOne({ buyer: req.user._id, prompt: promptId });
// //     if (alreadyPurchased) return res.status(400).json({ success: false, error: "already_purchased" });

// //     // Save purchase record
// //     const purchase = await Purchase.create({
// //       buyer: req.user._id,
// //       prompt: prompt._id,
// //       pricePaid, // amount buyer paid = tokun_price
// //       razorpayPaymentId,
// //       razorpayOrderId,
// //       paymentStatus: "SUCCESS",
// //       promptSnapshot: {
// //         title: prompt.title,
// //         description: prompt.description,
// //         promptText: prompt.promptText,
// //         attachment: prompt.attachment,
// //         uploadCode: prompt.uploadCode,
// //         originalPrice: prompt.price, // seller revenue
// //       },
// //     });

// //     if (prompt.exclusive) {
// //   prompt.sold = true;
// // }

// //     // Update prompt stats
// //     prompt.salesCount += 1;
// //     prompt.totalRevenue += prompt.price; // seller earns only original price
// //     await prompt.save();

// //     // Update buyer's purchasedPrompts
// //     req.user.purchasedPrompts.push(purchase._id);
// //     await req.user.save();
      
// //    // ✅ YE ADD KARO YAHAN
// // await logActivity({
// //   type: "PRODUCT_PURCHASED",
// //   title: "Product purchased",
// //   description: `${req.user.name} bought "${prompt.title}"`,
// //   actorId: req.user._id,
// //   actorName: req.user.name,
// //   targetId: prompt._id,
// //   targetType: "Prompt",
// //   targetName: prompt.title,
// //   meta: {
// //     price: pricePaid,
// //     promptId: String(prompt._id),
// //     razorpayPaymentId,
// //   },
// // });





// //     res.json({ success: true, purchase });
// //   } catch (err) {
// //     console.error("Verify purchase error:", err);
// //     res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });



// // // routes/purchaseRoutes.js (same router)
// // router.get("/history", requireAuth, async (req, res) => {
// //   try {
// //     const purchases = await Purchase.find({ buyer: req.user._id })
// //       .sort({ purchasedAt: -1 })
// //       .populate("prompt", "title free price deleted");

// //     res.json({ success: true, purchases });
// //   } catch (err) {
// //     console.error("Buyer history error:", err);
// //     res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });



// // router.get("/analytics/sales", async (req, res) => {
// //   try {
// //     const monthlySales = await Purchase.aggregate([
// //       {
// //         $group: {
// //           _id: {
// //             year: { $year: "$createdAt" },
// //             month: { $month: "$createdAt" }
// //           },
// //           totalSales: { $sum: 1 },        // kitne prompts bike
// //           revenue: { $sum: "$pricePaid"} // optional
// //         }
// //       },
// //       { $sort: { "_id.year": 1, "_id.month": 1 } }
// //     ]);

// //     res.json({ success: true, monthlySales });

// //   } catch (err) {
// //     res.status(500).json({ success: false });
// //   }
// // });


// // module.exports = router;


// // routes/purchaseRoutes.js  — sirf verify endpoint dikhaya hai, baaki wahi rahega
// // Bas yeh 2 cheezein add karo:
// //   1. Top mein:  const Wallet = require("../models/Wallet");
// //   2. verify route mein prompt.save() ke baad:  await Wallet.creditSale(...)





// // ── FULL verify route (replace karo apna) ──────────────────────────────────
// const express = require("express");
// const router = express.Router();
// const Razorpay = require("../utils/razorpay");
// const Prompt = require("../models/Prompt");
// const Purchase = require("../models/Purchase");
// const Wallet = require("../models/Wallet");           // ← NEW
// const { requireAuth } = require("../utils/auth");
// const { requireKycVerified } = require("../utils/requireKycVerified");
// const { logActivity } = require("../utils/activityLogger");
// const crypto = require("crypto");


// // POST /api/purchase/create-order/:promptId
// router.post("/create-order/:promptId", requireAuth, requireKycVerified, async (req, res) => {
//   try {
//     const { promptId } = req.params;
//     const prompt = await Prompt.findById(promptId);
//     if (!prompt) return res.status(404).json({ success: false, error: "prompt_not_found" });

//     if (prompt.exclusive && prompt.sold) {
//       return res.status(400).json({ success: false, error: "prompt_already_sold" });
//     }

//     const amount = Math.round(prompt.tokun_price * 100);
//     const shortReceipt = `p${prompt._id.toString().slice(-6)}u${req.user._id.toString().slice(-6)}`;

//     const order = await Razorpay.orders.create({
//       amount,
//       currency: "INR",
//       receipt: shortReceipt,
//     });

//     console.log(order);
//     res.json({ success: true, order, prompt: { id: prompt._id, title: prompt.title, price: prompt.price } });
//   } catch (err) {
//     console.error("Razorpay create order error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });


// // POST /api/purchase/verify/:promptId
// router.post("/verify/:promptId", requireAuth, async (req, res) => {
//   try {
//     const { promptId } = req.params;
//     const { razorpayPaymentId, razorpayOrderId, razorpaySignature, pricePaid } = req.body;

//     const prompt = await Prompt.findById(promptId);
//     if (!prompt) return res.status(404).json({ success: false, error: "prompt_not_found" });

//     if (prompt.exclusive && prompt.sold) {
//       return res.status(400).json({ success: false, error: "prompt_already_sold" });
//     }

//     // Verify signature
//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "<REDACTED — was a hardcoded Razorpay key_secret>")
//       .update(razorpayOrderId + "|" + razorpayPaymentId)
//       .digest("hex");

//     if (generatedSignature !== razorpaySignature) {
//       return res.status(400).json({ success: false, error: "invalid_payment_signature" });
//     }

//     // Already purchased?
//     const alreadyPurchased = await Purchase.findOne({ buyer: req.user._id, prompt: promptId });
//     if (alreadyPurchased) return res.status(400).json({ success: false, error: "already_purchased" });

//     // Save purchase record
//     const purchase = await Purchase.create({
//       buyer: req.user._id,
//       prompt: prompt._id,
//       pricePaid,
//       razorpayPaymentId,
//       razorpayOrderId,
//       paymentStatus: "SUCCESS",
//       promptSnapshot: {
//         title: prompt.title,
//         description: prompt.description,
//         promptText: prompt.promptText,
//         attachment: prompt.attachment,
//         uploadCode: prompt.uploadCode,
//         originalPrice: prompt.price,
//       },
//     });

//     if (prompt.exclusive) {
//       prompt.sold = true;
//     }

//     // Update prompt stats
//     prompt.salesCount += 1;
//     prompt.totalRevenue += prompt.price;
//     await prompt.save();

//     // ── Credit seller's wallet ──────────────────────────────────────── NEW ──
//     // prompt.seller  = the uploader's userId (adjust field name if different)
//     const sellerId = prompt.seller || prompt.uploadedBy || prompt.creator;
//     if (sellerId) {
//       try {
//         await Wallet.creditSale(sellerId, prompt.price, {
//           purchaseId: purchase._id,
//           promptId: prompt._id,
//           promptTitle: prompt.title,
//         });
//       } catch (walletErr) {
//         // wallet credit fail hone pe bhi purchase success return karo
//         console.error("⚠️ Wallet credit failed (purchase still success):", walletErr.message);
//       }
//     }
//     // ─────────────────────────────────────────────────────────────────────────

//     // Update buyer's purchasedPrompts
//     req.user.purchasedPrompts.push(purchase._id);
//     await req.user.save();

//     await logActivity({
//       type: "PRODUCT_PURCHASED",
//       title: "Product purchased",
//       description: `${req.user.name} bought "${prompt.title}"`,
//       actorId: req.user._id,
//       actorName: req.user.name,
//       targetId: prompt._id,
//       targetType: "Prompt",
//       targetName: prompt.title,
//       meta: {
//         price: pricePaid,
//         promptId: String(prompt._id),
//         razorpayPaymentId,
//       },
//     });

//     res.json({ success: true, purchase });
//   } catch (err) {
//     console.error("Verify purchase error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });


// // GET /api/purchase/history
// router.get("/history", requireAuth, async (req, res) => {
//   try {
//     const purchases = await Purchase.find({ buyer: req.user._id })
//       .sort({ purchasedAt: -1 })
//       .populate("prompt", "title free price deleted");

//     res.json({ success: true, purchases });
//   } catch (err) {
//     console.error("Buyer history error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });


// // GET /api/purchase/analytics/sales
// router.get("/analytics/sales", async (req, res) => {
//   try {
//     const monthlySales = await Purchase.aggregate([
//       {
//         $group: {
//           _id: {
//             year: { $year: "$createdAt" },
//             month: { $month: "$createdAt" },
//           },
//           totalSales: { $sum: 1 },
//           revenue: { $sum: "$pricePaid" },
//         },
//       },
//       { $sort: { "_id.year": 1, "_id.month": 1 } },
//     ]);

//     res.json({ success: true, monthlySales });
//   } catch (err) {
//     res.status(500).json({ success: false });
//   }
// });


// module.exports = router;












// routes/purchaseRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Razorpay = require("../utils/razorpay");
const Prompt = require("../models/Prompt");
const Purchase = require("../models/Purchase");
const Cart = require("../models/Cart");
const Category = require("../models/Category");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const PlatformWallet = require("../models/PlatformWallet");
const BankAccount = require("../models/BankAccount");
const { requireAuth, blockIfSuspended, blockOrgTeamMemberPurchase } = require("../utils/auth");
const { splitPromptSale } = require("../utils/commission");
const ledger = require("../utils/ledger");
const { requireKycVerified } = require("../utils/requireKycVerified");
const { logActivity } = require("../utils/activityLogger");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const { embedWatermark, extractWatermark } = require("../utils/nvisibleWatermark");
const { generateInvoicePDF } = require("../services/invoice.service");
const { sendInvoiceEmail } = require("../services/email.service");
const { sendPromptSoldEmail } = require("../services/creatorEmail.service");
const { sendRefundRequestReceivedEmail } = require("../services/buyerEmail.service");
const { alertRefundRequested } = require("../services/adminAlertEmail.service");
const multer = require("multer");
const uploadToAzure = require("../utils/uploadToAzure");
const RefundRequest = require("../models/RefundRequest");
const Notification = require("../models/Notification");
const { notifyAdmins } = require("../utils/notifyAdmins");

// Route plumbing lives in utils/routePayouts so the cart flow uses the exact
// same rules — a seller must be paid once, by one path, for the same window,
// whichever checkout they were bought through.
const {
  REFUND_WINDOW_HOURS,
  getSellerLinkedAccountId,
  fetchTransfersForPayment,
  transferOnHoldUntil,
} = require("../utils/routePayouts");

// GET /api/purchase/seller-payout-status/:promptId
// Buyer-facing check — lets the frontend disable "Buy Now" before the buyer
// even attempts checkout, instead of failing later.
router.get("/seller-payout-status/:promptId", async (req, res) => {
  try {
    const { promptId } = req.params;

    const prompt = await Prompt.findById(promptId).select("userId");
    if (!prompt) {
      return res.status(404).json({ success: false, error: "prompt_not_found" });
    }

    const linkedAccountId = await getSellerLinkedAccountId(prompt.userId);

    return res.json({
      success: true,
      hasPayoutSetup: Boolean(linkedAccountId),
    });
  } catch (err) {
    console.error("seller-payout-status error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// POST /api/purchase/create-order/:promptId
// KYC is only needed by SELLERS (for payouts), not buyers — so purchasing no
// longer requires requireKycVerified.
router.post("/create-order/:promptId", requireAuth, blockIfSuspended, blockOrgTeamMemberPurchase, async (req, res) => {
  try {
    const { promptId } = req.params;

    const prompt = await Prompt.findById(promptId);
    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: "prompt_not_found",
      });
    }

    if (prompt.exclusive && prompt.sold) {
      return res.status(400).json({
        success: false,
        error: "prompt_already_sold",
      });
    }

    const seller = await User.findById(prompt.userId).select("sellerStatus isDeleted");
    if (!seller || seller.isDeleted || seller.sellerStatus === "SUSPENDED") {
      return res.status(403).json({
        success: false,
        error: "seller_suspended",
      });
    }

    const split = splitPromptSale(prompt);
    const amount = Math.round(split.buyerPays * 100);

    const shortReceipt = `tokun_p${prompt._id
      .toString()
      .slice(-6)}u${req.user._id.toString().slice(-6)}`;

    // If the seller has a registered Route Linked Account, attach a transfer
    // for their share (list price, net of Tokun's seller-side commission).
    // Sellers without one yet fall back to the existing Wallet-ledger path.
    const linkedAccountId = await getSellerLinkedAccountId(prompt.userId);

    /* An activated linked account is now required to buy ANY prompt.

       It used to be gated on prompt.requiresSellerVerification, which defaults
       to false and is only set true on new uploads — so every legacy listing
       could still be bought from a seller who had never onboarded, and their
       share went to the internal Wallet instead. That fallback is gone: all
       payouts are Route transfers, so a seller with no linked account has
       nowhere for the money to land. */
    if (!linkedAccountId) {
      return res.status(403).json({
        success: false,
        error: "seller_not_verified",
        message:
          "This seller hasn't finished their payout setup yet, so their listings can't be bought right now.",
      });
    }

    const orderPayload = {
      amount,
      currency: "INR",
      receipt: shortReceipt,
      notes: {
        project: "Tokun",
        kind: "PROMPT_PURCHASE",
        promptId: String(prompt._id),
        userId: String(req.user._id),
      },
    };

    if (linkedAccountId) {
      orderPayload.transfers = [
        {
          account: linkedAccountId,
          amount: Math.round(split.sellerNet * 100),
          currency: "INR",
          on_hold: 1,
          on_hold_until: transferOnHoldUntil(),
        },
      ];
    }

    const order = await Razorpay.orders.create(orderPayload);

    return res.json({
      success: true,
      order,
      // The key_id this order was actually created under. Checkout must be
      // opened with the SAME key or Razorpay rejects the preferences call with
      // 401 — which is exactly what happened when the backend moved to a new key
      // pair and the frontend build was still baked with the old one. Sending it
      // alongside the order makes the two impossible to drift apart.
      // key_id is public by design; the secret never leaves the server.
      keyId: process.env.RAZORPAY_KEY_ID,
      prompt: {
        id: prompt._id,
        title: prompt.title,
        price: prompt.price,
        tokun_price: prompt.tokun_price,
      },
      // The buyer's side of the split, so the checkout screen can show what the
      // platform fee actually is instead of the amount appearing out of nowhere
      // when Razorpay opens.
      pricing: {
        listPrice: split.listPrice,
        platformFee: split.buyerFee,
        total: split.buyerPays,
      },
    });
  } catch (err) {
    // Razorpay's own rejection reason, logged in full. A bare "server_error"
    // told us nothing: the same 500 covers a bad transfer amount, a linked
    // account that belongs to a different Razorpay account than the configured
    // keys, and a genuine crash — and on a hosted environment there's no way to
    // tell them apart without this.
    const rzp = err?.error || err?.response?.error || null;
    console.error("Razorpay create order error:", {
      message: err?.message,
      razorpayCode: rzp?.code,
      razorpayDescription: rzp?.description,
      razorpayField: rzp?.field,
      razorpayReason: rzp?.reason,
      statusCode: err?.statusCode,
    });

    // A Razorpay rejection is a 502 (upstream said no), not a 500 (we broke) —
    // and the description is safe to return: it names the offending field, not
    // any credential.
    if (rzp?.description) {
      return res.status(502).json({
        success: false,
        error: "razorpay_order_failed",
        message: rzp.description,
        field: rzp.field || null,
      });
    }

    return res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});


// POST /api/purchase/verify/:promptId
router.post("/verify/:promptId", requireAuth, blockIfSuspended, blockOrgTeamMemberPurchase, async (req, res) => {
  try {
    const { promptId } = req.params;

    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      pricePaid,
    } = req.body;

    const prompt = await Prompt.findById(promptId);

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: "prompt_not_found",
      });
    }

    const seller = await User.findById(prompt.userId).select("sellerStatus isDeleted");
    if (!seller || seller.isDeleted || seller.sellerStatus === "SUSPENDED") {
      return res.status(403).json({
        success: false,
        error: "seller_suspended",
      });
    }

    if (prompt.exclusive && prompt.sold) {
      return res.status(400).json({
        success: false,
        error: "prompt_already_sold",
      });
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        error: "invalid_payment_signature",
      });
    }

    // Check if buyer already purchased this prompt
    const alreadyPurchased = await Purchase.findOne({
      buyer: req.user._id,
      prompt: promptId,
    });

    if (alreadyPurchased) {
      return res.status(400).json({
        success: false,
        error: "already_purchased",
      });
    }

    // Tokun's cut is charged on both sides: added on top of the list price for
    // the buyer, taken off the top of the seller's payout. platformCommission is
    // the total of the two — and the refund path recovers
    // `pricePaid − platformCommission` from the seller, which is exactly
    // split.sellerNet, so the reversal stays symmetric with what was paid out.
    const split = splitPromptSale(prompt);
    const platformCommission = split.platformCut;

    // Create purchase record
    const purchase = await Purchase.create({
      buyer: req.user._id,
      prompt: prompt._id,
      pricePaid,
      platformCommission,
      // Carried onto the purchase so a refund can tell the non-refundable fee
      // apart from the rest of Tokun's cut.
      platformFee: split.platformFee,
      platformFeeGst: split.platformFeeGst,
      razorpayPaymentId,
      razorpayOrderId,
      paymentStatus: "SUCCESS",
     promptSnapshot: {
        title: prompt.title,
        description: prompt.description,
        promptText: embedWatermark(prompt.promptText, String(req.user._id)), // ← marked
        attachment: prompt.attachment,
        uploadCode: prompt.uploadCode,
        originalPrice: prompt.price,
      },

    });

    // Mark exclusive prompt as sold
    if (prompt.exclusive) {
      prompt.sold = true;
    }

    // Update prompt sales stats. totalRevenue tracks what the SELLER earned,
    // net of Tokun's cut — it's surfaced to the seller as their earnings, so
    // crediting the gross list price here would overstate it by the commission.
    prompt.salesCount += 1;
    prompt.totalRevenue += split.sellerNet;
    await prompt.save();

    // IMPORTANT:
    // Tumhare Prompt model me seller/uploader ka field userId hai.
    // Isliye sellerId = prompt.userId
    const sellerId = prompt.userId;

    if (!sellerId) {
      console.error("seller_id_missing for prompt:", prompt._id);

      return res.status(500).json({
        success: false,
        error: "seller_id_missing",
      });
    }

    // Update buyer's purchasedPrompts
    req.user.purchasedPrompts.push(purchase._id);
    await req.user.save();

    /* ── ANSWER THE BUYER HERE ────────────────────────────────────────────────
       Everything the buyer's ownership depends on is now written: the Purchase
       row, the prompt's sold/stats flags, and the buyer's purchasedPrompts.
       From here on it's bookkeeping and paperwork — a Razorpay transfers
       lookup, ledger rows, the platform wallet, the invoice PDF and an SMTP
       send to Gmail. Those took SECONDS, and the buyer sat on Razorpay's
       spinner for every one of them before the app could react.

       So: reply now, finish the rest after. The work below still runs, still
       logs its own failures, and none of it was ever allowed to fail the
       purchase anyway — the try/catch blocks around it said so already. */
    res.json({
      success: true,
      purchase,
    });

    settleAfterPurchase().catch((bgErr) => {
      // Nothing above this point is at risk — the buyer owns the prompt and
      // has been told so. This is the last line of defence so an unhandled
      // rejection can't take the process down.
      console.error("Post-purchase settlement failed:", bgErr);
    });

    /* Everything the buyer doesn't have to wait for. Declared as a closure over
       the handler's locals rather than a module-level helper so it can't drift
       from the values the purchase was actually recorded with. */
    async function settleAfterPurchase() {
      // If Route already moved the money (order had a transfer attached
      // because the seller was registered at create-order time), don't ALSO
      // credit the Wallet ledger — that would double-pay the seller.
      let routeTransferId = null;
      try {
        const transfersResp = await fetchTransfersForPayment(razorpayPaymentId);
        routeTransferId = transfersResp?.items?.[0]?.id || null;
      } catch (routeErr) {
        // Not fatal — either the seller wasn't on Route yet (no transfer to
        // find) or the lookup failed; the Wallet fallback below still pays
        // the seller correctly either way.
        console.error("Route transfer lookup failed (falling back to Wallet):", routeErr?.message);
      }

      // Ledger row for the payment, tied to our own entities. The webhook records
      // the same payment from Razorpay's side with the gateway fee attached; the
      // natural-key index collapses the two. What only this side knows is WHICH
      // purchase, prompt, buyer and seller the money was for — the webhook
      // payload can't say.
      await ledger.record({
        kind: "PAYMENT",
        direction: "IN",
        purpose: "PROMPT_PURCHASE",
        amount: ledger.toPaise(pricePaid),
        occurredAt: purchase.purchasedAt || new Date(),
        razorpayPaymentId,
        razorpayOrderId,
        source: "api",
        user: req.user._id,
        counterparty: sellerId,
        purchase: purchase._id,
        prompt: prompt._id,
        meta: {
          listPrice: split.listPrice,
          sellerNet: split.sellerNet,
          platformCommission,
        },
      });

      if (routeTransferId) {
        purchase.routeTransferId = routeTransferId;
        await purchase.save();

        // The seller's side of the same sale. Recorded here as well as from the
        // transfer.* webhook because a Route transfer attached at order-creation
        // time may never produce an event we see.
        await ledger.record({
          kind: "TRANSFER",
          direction: "OUT",
          purpose: "PROMPT_PURCHASE",
          amount: ledger.toPaise(split.sellerNet),
          occurredAt: new Date(),
          razorpayTransferId: routeTransferId,
          razorpayPaymentId,
          source: "api",
          user: sellerId,
          counterparty: req.user._id,
          purchase: purchase._id,
          prompt: prompt._id,
          meta: { via: "route" },
        });
      } else {
        /* No transfer id came back from the lookup.

           This is NOT "the seller didn't get paid". A linked account is required
           at order-creation (see the gate above), so the transfer is attached to
           the order and Razorpay executes it at capture regardless of whether
           this lookup succeeded — the only thing missing is our record of which
           transfer id covered it.

           Crediting the Wallet here, which is what used to happen, paid the
           seller a SECOND time whenever this lookup merely failed on a network
           blip. The ledger row below is flagged for reconciliation instead. */
        console.error(
          "Route transfer id not resolved for payment",
          razorpayPaymentId,
          "- purchase",
          String(purchase._id)
        );

        // Still a TRANSFER — Razorpay is moving the money — just one whose id we
        // failed to read. `needsReconciliation` is the flag to grep for when a
        // seller's transfer id is missing from a purchase.
        await ledger.record({
          kind: "TRANSFER",
          direction: "OUT",
          purpose: "PROMPT_PURCHASE",
          amount: ledger.toPaise(split.sellerNet),
          occurredAt: new Date(),
          razorpayPaymentId,
          source: "api",
          user: sellerId,
          counterparty: req.user._id,
          purchase: purchase._id,
          prompt: prompt._id,
          meta: { via: "route", needsReconciliation: true },
        });
      }

      // Record Tokun's commission cut for this sale (non-fatal — purchase already succeeded)
      try {
        // Earnings, net of the GST charged on the platform fee. That GST goes to
        // gstCollected instead — it's owed to the government, not earned here.
        const gstOnFees = Number(split.platformFeeGst || 0);
        await PlatformWallet.recordCommission(+(platformCommission - gstOnFees).toFixed(2), {
          source: "prompt_purchase",
          refId: purchase._id,
          description: `Commission: "${prompt.title}"`,
        });
        await PlatformWallet.recordGst(gstOnFees, {
          source: "prompt_purchase",
          refId: purchase._id,
          description: `GST on fee: "${prompt.title}"`,
        });
      } catch (revErr) {
        console.error("PlatformWallet commission record failed:", revErr);
      }

      // Buying a prompt directly (Buy Now) left it sitting in the cart, because
      // nothing outside the cart flow ever touched the cart. It would then be
      // charged for again at cart checkout — and the verify step's
      // already-owned guard would skip creating the purchase, so the buyer paid
      // and received nothing. Pulling it out here closes that off at the source.
      try {
        await Cart.updateOne(
          { user: req.user._id },
          { $pull: { items: { prompt: prompt._id } } }
        );
      } catch (cartErr) {
        // Non-fatal: the purchase is done and owned. GET /api/cart filters
        // already-purchased items anyway, so a failure here is cosmetic.
        console.error("Cart cleanup after purchase failed:", cartErr?.message);
      }

      /* -------------------- INVOICE (safe — purchase already saved) -------------------- */
      try {
        const invoiceNo = `INV-${purchase._id}`;
        const date = new Date(purchase.createdAt || Date.now()).toLocaleDateString("en-GB");

        // Mirrors generateInvoicePDF's own maths so the email body matches the
        // attached PDF exactly. GST is off in both — see the note in
        // services/invoice.service.js.
        const subtotal = Number(pricePaid || 0);
        // const gst = +(subtotal * 0.18).toFixed(2);
        const gst = 0;
        const total = +subtotal.toFixed(2);
        const items = [
          {
            title: prompt.title,
            price: subtotal,
          },
        ];

        const logoPath = path.join(__dirname, "../assets/icons/Tokun.png");
        const logoBase64 = fs.existsSync(logoPath)
          ? `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`
          : "";

        const pdfBuffer = await generateInvoicePDF({
          logo: logoBase64,
          date,
          invoiceNo,
          buyerName: req.user.name || "Customer",
          buyerEmail: req.user.email || "",
          items,
          // Instant delivery and a 24-hour refund window — a very different
          // thing from the escrow-backed service and hire invoices.
          kind: "prompt",
        });

        if (req.user.email) {
          await sendInvoiceEmail({
            to: req.user.email,
            buyerName: req.user.name || "Customer",
            buyerEmail: req.user.email,
            items,
            invoiceNo,
            date,
            subtotal,
            gst,
            total,
            pdfBuffer,
            kind: "prompt",
          });
        }
      } catch (invoiceErr) {
        // Invoice fail hone pe bhi purchase success hi return karo
        console.error("⚠️ Prompt invoice/email failed (purchase still success):", invoiceErr.message);
      }

      /* -------------------- THE SELLER'S SIDE OF THE SAME SALE --------------
         The buyer has had an invoice since day one. The seller — whose money
         this is — got a notification badge and nothing else, so a creator could
         make a sale on Monday and not find out until they next opened the
         dashboard. Itemised the way their earnings page is, because "you sold
         something" without "and this is what you'll be paid" is the half
         creators actually write in asking about. */
      try {
        const seller = await User.findById(sellerId).select("name email");
        if (seller?.email) {
          await sendPromptSoldEmail({
            to: seller.email,
            sellerName: seller.name,
            productTitle: prompt.title,
            buyerName: req.user.name,
            salePrice: pricePaid,
            platformCut: platformCommission,
            netEarning: split.sellerNet,
            soldAt: purchase.purchasedAt,
          });
        }
      } catch (sellerMailErr) {
        console.error(
          "⚠️ Seller sale email failed (the sale itself is unaffected):",
          sellerMailErr.message
        );
      }

      // Log activity
      await logActivity({
        type: "PRODUCT_PURCHASED",
        title: "Product purchased",
        description: `${req.user.name} bought "${prompt.title}"`,
        actorId: req.user._id,
        actorName: req.user.name,
        targetId: prompt._id,
        targetType: "Prompt",
        targetName: prompt.title,
        meta: {
          price: pricePaid,
          promptId: String(prompt._id),
          razorpayPaymentId,
        },
      });
    } // ── end settleAfterPurchase ──
  } catch (err) {
    console.error("Verify purchase error:", err);

    /* The response may already have gone out — everything after res.json() is
       background work. Trying to send a second one throws
       ERR_HTTP_HEADERS_SENT and buries the real error. */
    if (res.headersSent) return;

    return res.status(500).json({
      success: false,
      error: "server_error",
      message: err.message,
    });
  }
});


// GET /api/purchase/history
router.get("/history", requireAuth, async (req, res) => {
  try {
    const purchases = await Purchase.find({ buyer: req.user._id })
      .sort({ purchasedAt: -1 })
      .populate("prompt", "title free price deleted")
      .lean();

    /* When each purchase stops being refundable, computed here rather than in
       the browser.

       The 24-hour window is enforced by POST /:purchaseId/refund-request from
       REFUND_WINDOW_HOURS, which is env-configurable. A client that hardcodes
       "24" to decide whether to show the button will disagree with the server
       the moment that value changes — offering a refund the API then refuses,
       or hiding one it would have accepted. Sending the deadline means the UI
       can only ever show what the server will actually honour. */
    const windowMs = REFUND_WINDOW_HOURS * 3600 * 1000;
    const decorated = purchases.map((p) => {
      const purchasedAt = new Date(p.purchasedAt || p.createdAt).getTime();
      const eligibleUntil = Number.isFinite(purchasedAt) ? purchasedAt + windowMs : null;

      return {
        ...p,
        refundEligibleUntil: eligibleUntil ? new Date(eligibleUntil).toISOString() : null,
        // Free prompts were never charged, and a purchase already in a refund
        // flow can't start a second one — both are refusals the server makes
        // anyway, so the flag matches the API exactly.
        refundEligible:
          !!eligibleUntil &&
          Date.now() < eligibleUntil &&
          (p.refundStatus || "NONE") === "NONE" &&
          Number(p.pricePaid || 0) > 0,
      };
    });

    return res.json({
      success: true,
      purchases: decorated,
      refundWindowHours: REFUND_WINDOW_HOURS,
    });
  } catch (err) {
    console.error("Buyer history error:", err);

    return res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});


// Admin-only. Local guard mirroring sellerRoutes.js — requireAuth sets
// req.isAdmin from the admin JWT; this just rejects non-admins.
function requireAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ success: false, error: "forbidden" });
  }
  next();
}

// GET /api/purchase/admin/user/:userId
// Itemized "bought" list for ANY user, for the admin user-profile view.
// Keyed by the :userId param (unlike /history which is the logged-in buyer),
// so it's admin-gated. Powers the "Purchased Prompts" section of a user's
// admin profile — the counts/totals already come from GET /api/seller/:id.
router.get("/admin/user/:userId", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: "invalid_user_id" });
    }

    const purchases = await Purchase.find({
      buyer: userId,
      paymentStatus: { $ne: "FAILED" },
    })
      .sort({ purchasedAt: -1 })
      .populate("prompt", "title price free deleted")
      .lean();

    // Fall back to the snapshot title so prompts deleted after purchase still
    // show up (that's exactly the kind of thing an admin wants to see).
    const items = purchases.map((p) => ({
      id: String(p._id),
      promptId: String(p.prompt?._id || p.prompt || ""),
      title: p.prompt?.title || p.promptSnapshot?.title || "Untitled Prompt",
      pricePaid: Number(p.pricePaid || 0),
      paymentStatus: p.paymentStatus,
      refundStatus: p.refundStatus,
      purchasedAt: p.purchasedAt || p.createdAt,
      deleted: !!p.prompt?.deleted,
    }));

    const totalSpent = items
      .filter((i) => i.paymentStatus === "SUCCESS")
      .reduce((sum, i) => sum + i.pricePaid, 0);

    return res.json({
      success: true,
      count: items.length,
      totalSpent,
      purchases: items,
    });
  } catch (err) {
    console.error("GET /api/purchase/admin/user/:userId error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// POST /api/purchase/:purchaseId/refund-request
// Buyer files a refund request with a reason, within REFUND_WINDOW_HOURS of
// the purchase. Admin reviews it separately (server/routes/adminRefunds.js).
/* Evidence the buyer attaches to a refund request — normally a screenshot of
   the output they actually got. Memory storage because the file goes straight
   to Azure Blob and is never written to this box's disk; capped at 5 files of
   5 MB so a refund form can't be used to push large uploads. */
const refundUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

router.post("/:purchaseId/refund-request", requireAuth, refundUpload.array("attachments", 5), async (req, res) => {
  try {
    const { purchaseId } = req.params;
    /* Two separate fields now: `reason` is what the buyer ticked, `description`
       is what they typed. They used to arrive concatenated, which meant the
       admin queue could not tell a standard complaint from a free-text note and
       nothing could be counted per reason. */
    const reason = String(req.body?.reason || "").trim();
    const description = String(req.body?.description || "").trim();

    /* Either one alone is a complete request — a buyer who only writes a
       sentence has still given a reason, so `description` is promoted rather
       than rejected. Without this, a note-only request would 400. */
    const effectiveReason = reason || description;
    if (!effectiveReason) {
      return res.status(400).json({ success: false, error: "reason_required" });
    }

    const purchase = await Purchase.findOne({ _id: purchaseId, buyer: req.user._id }).populate(
      "prompt",
      "title userId"
    );

    if (!purchase) {
      return res.status(404).json({ success: false, error: "purchase_not_found" });
    }

    if (purchase.refundStatus !== "NONE") {
      return res.status(400).json({ success: false, error: "refund_already_" + purchase.refundStatus.toLowerCase() });
    }

    const purchasedAt = new Date(purchase.purchasedAt || purchase.createdAt).getTime();
    const windowMs = REFUND_WINDOW_HOURS * 3600 * 1000;
    if (Date.now() - purchasedAt > windowMs) {
      return res.status(400).json({ success: false, error: "refund_window_expired" });
    }

    if (!purchase.prompt || !purchase.prompt.userId) {
      return res.status(400).json({ success: false, error: "seller_missing" });
    }

    /* Uploaded after every validation above has passed, so a request that was
       going to be rejected anyway (wrong buyer, window expired, already
       requested) never costs a Blob write.

       Failures here are swallowed deliberately: the refund request itself is
       what the buyer came to file, and losing it because a screenshot upload
       failed would be a far worse outcome than recording it without images. */
    let attachments = [];
    if (req.files?.length) {
      try {
        attachments = await Promise.all(
          req.files.map((f) => uploadToAzure(f.buffer, f.originalname, "refund-attachments"))
        );
      } catch (uploadErr) {
        console.error("Refund attachment upload failed:", uploadErr?.message);
      }
    }

    const refundRequest = await RefundRequest.create({
      purchase: purchase._id,
      buyer: req.user._id,
      seller: purchase.prompt.userId,
      prompt: purchase.prompt._id,
      // effectiveReason, not reason: a note-only request stores that note here
      // too, so `reason` is never empty and the admin row always has something
      // to show even when nothing was ticked.
      reason: effectiveReason,
      description,
      attachments,
      refundAmount: purchase.pricePaid,
    });

    purchase.refundStatus = "REQUESTED";
    await purchase.save();

    await notifyAdmins({
      type: "ADMIN_REFUND_REQUESTED",
      promptId: purchase.prompt._id,
      message: `Refund requested for "${purchase.prompt.title}" by ${req.user.name || req.user.email}: ${effectiveReason}`,
      // attachmentCount, so an admin can tell from the notification alone that
      // there is evidence to open — the URLs themselves live on the request.
      meta: {
        refundRequestId: refundRequest._id,
        purchaseId: purchase._id,
        attachmentCount: attachments.length,
      },
    });

    /* Two emails the notification above can't replace.

       The buyer gets a receipt: the decision was already emailed, the intake
       never was, so someone filing at midnight had no evidence it landed and
       support fielded "did you get my request?" the next morning.

       The team gets the alert: ADMIN_REFUND_REQUESTED is only visible to
       someone who opens the admin panel, and a refund sitting unread is a
       buyer waiting on their money. Both best-effort — the request is already
       saved and must not fail on SMTP. */
    try {
      await sendRefundRequestReceivedEmail({
        to: req.user.email,
        buyerName: req.user.name,
        itemTitle: purchase.prompt.title,
        amount: purchase.pricePaid,
        reason: effectiveReason,
      });
    } catch (mailErr) {
      console.error("Refund-received email failed (request still filed):", mailErr.message);
    }

    try {
      await alertRefundRequested({
        itemTitle: purchase.prompt.title,
        buyerName: req.user.name || req.user.email,
        amount: purchase.pricePaid,
        reason: effectiveReason,
        requestedAt: refundRequest.createdAt,
      });
    } catch (mailErr) {
      console.error("Admin refund alert failed:", mailErr.message);
    }

    return res.json({ success: true, refundRequest });
  } catch (err) {
    console.error("refund-request error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// GET /api/purchase/refund-requests/mine — buyer's own refund request history
router.get("/refund-requests/mine", requireAuth, async (req, res) => {
  try {
    const refundRequests = await RefundRequest.find({ buyer: req.user._id })
      .populate("prompt", "title")
      .sort({ createdAt: -1 });
    return res.json({ success: true, refundRequests });
  } catch (err) {
    console.error("refund-requests/mine error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// GET /api/purchase/analytics/sales
router.get("/analytics/sales", async (req, res) => {
  try {
    const monthlySales = await Purchase.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalSales: { $sum: 1 },
          revenue: { $sum: "$pricePaid" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    return res.json({
      success: true,
      monthlySales,
    });
  } catch (err) {
    console.error("Sales analytics error:", err);

    return res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

// GET /api/purchase/analytics/sales-by-category?months=6
// Monthly sales count broken down by prompt category — capped to the top N
// categories (by total sales in-range) plus an "Other" bucket, since this
// platform has 20+ categories and a chart can't show that many series at once.
router.get("/analytics/sales-by-category", async (req, res) => {
  try {
    const TOP_N = 6;
    const monthsBack = Math.max(1, Math.min(24, parseInt(req.query.months, 10) || 6));

    const since = new Date();
    since.setMonth(since.getMonth() - (monthsBack - 1));
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const raw = await Purchase.aggregate([
      { $match: { paymentStatus: "SUCCESS", createdAt: { $gte: since } } },
      {
        $lookup: {
          from: "prompts",
          localField: "prompt",
          foreignField: "_id",
          as: "promptDoc",
        },
      },
      { $unwind: "$promptDoc" },
      { $addFields: { categoryId: { $arrayElemAt: ["$promptDoc.categories", 0] } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            categoryId: "$categoryId",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryIds = [...new Set(raw.map((r) => r._id.categoryId).filter(Boolean).map(String))];
    const categoryDocs = await Category.find({ _id: { $in: categoryIds } }).select("name");
    const categoryNameById = new Map(categoryDocs.map((c) => [String(c._id), c.name]));
    const nameFor = (id) => categoryNameById.get(String(id)) || "Uncategorized";

    // Totals across the whole range decide which categories are "top" —
    // not per-month totals, so the top-N set stays stable month to month.
    const totalsByCategory = new Map();
    for (const r of raw) {
      const name = nameFor(r._id.categoryId);
      totalsByCategory.set(name, (totalsByCategory.get(name) || 0) + r.count);
    }

    const topCategories = [...totalsByCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N)
      .map(([name]) => name);
    const topSet = new Set(topCategories);
    const hasOther = totalsByCategory.size > topCategories.length;

    // Month buckets across the full range, including months with zero sales.
    const monthKeys = [];
    const monthLabels = new Map();
    const cursor = new Date(since);
    for (let i = 0; i < monthsBack; i++) {
      const key = `${cursor.getFullYear()}-${cursor.getMonth() + 1}`;
      monthKeys.push(key);
      monthLabels.set(key, cursor.toLocaleDateString("en-US", { month: "short", year: "numeric" }));
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const rows = new Map(monthKeys.map((k) => [k, { month: monthLabels.get(k) }]));
    for (const r of raw) {
      const key = `${r._id.year}-${r._id.month}`;
      const row = rows.get(key);
      if (!row) continue;
      const name = nameFor(r._id.categoryId);
      const bucket = topSet.has(name) ? name : "Other";
      row[bucket] = (row[bucket] || 0) + r.count;
    }

    return res.json({
      success: true,
      categories: hasOther ? [...topCategories, "Other"] : topCategories,
      data: monthKeys.map((k) => rows.get(k)),
    });
  } catch (err) {
    console.error("Sales-by-category analytics error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// Shared by the two trend endpoints below — builds { key -> label } month
// buckets so months with zero activity still show up as a 0 in the chart.
function buildMonthBuckets(monthsBack) {
  const since = new Date();
  since.setMonth(since.getMonth() - (monthsBack - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const keys = [];
  const labels = new Map();
  const cursor = new Date(since);
  for (let i = 0; i < monthsBack; i++) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth() + 1}`;
    keys.push(key);
    labels.set(key, cursor.toLocaleDateString("en-US", { month: "short", year: "numeric" }));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return { since, keys, labels };
}

// GET /api/purchase/analytics/seller-trends?months=6
// Real seller-side signal: money actually paid out to sellers (revenue minus
// platform commission) and how many distinct sellers made at least one sale
// that month — NOT the same platform-wide revenue/count pair shown before.
router.get("/analytics/seller-trends", async (req, res) => {
  try {
    const monthsBack = Math.max(1, Math.min(24, parseInt(req.query.months, 10) || 6));
    const { since, keys, labels } = buildMonthBuckets(monthsBack);

    const raw = await Purchase.aggregate([
      { $match: { paymentStatus: "SUCCESS", createdAt: { $gte: since } } },
      {
        $lookup: {
          from: "prompts",
          localField: "prompt",
          foreignField: "_id",
          as: "promptDoc",
        },
      },
      { $unwind: "$promptDoc" },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          earnings: { $sum: { $subtract: ["$pricePaid", { $ifNull: ["$platformCommission", 0] }] } },
          sellerIds: { $addToSet: "$promptDoc.userId" },
        },
      },
    ]);

    const byKey = new Map(raw.map((r) => [`${r._id.year}-${r._id.month}`, r]));

    return res.json({
      success: true,
      data: keys.map((k) => {
        const r = byKey.get(k);
        return {
          month: labels.get(k),
          sellerEarnings: r ? Math.round(r.earnings) : 0,
          activeSellers: r ? r.sellerIds.length : 0,
        };
      }),
    });
  } catch (err) {
    console.error("Seller trends analytics error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// GET /api/purchase/analytics/user-trends?months=6
// Real user-side signal: new signups and total buyer spend per month —
// distinct from the seller-trends numbers above, not a relabeled duplicate.
router.get("/analytics/user-trends", async (req, res) => {
  try {
    const monthsBack = Math.max(1, Math.min(24, parseInt(req.query.months, 10) || 6));
    const { since, keys, labels } = buildMonthBuckets(monthsBack);

    const [signupsRaw, spendRaw] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
      Purchase.aggregate([
        { $match: { paymentStatus: "SUCCESS", createdAt: { $gte: since } } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            totalSpend: { $sum: "$pricePaid" },
          },
        },
      ]),
    ]);

    const signupsByKey = new Map(signupsRaw.map((r) => [`${r._id.year}-${r._id.month}`, r.count]));
    const spendByKey = new Map(spendRaw.map((r) => [`${r._id.year}-${r._id.month}`, r.totalSpend]));

    return res.json({
      success: true,
      data: keys.map((k) => ({
        month: labels.get(k),
        newSignups: signupsByKey.get(k) || 0,
        totalSpend: Math.round(spendByKey.get(k) || 0),
      })),
    });
  } catch (err) {
    console.error("User trends analytics error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// POST /api/purchase/trace-leak   body: { leakedText: "..." }
router.post("/trace-leak", requireAuth, async (req, res) => {
  try {
    // TODO: admin-only check yahaan laga lena
    const buyerId = extractWatermark(req.body.leakedText || "");
    if (!buyerId) {
      return res.json({ success: true, buyerId: null, message: "no_watermark_found" });
    }
    return res.json({ success: true, buyerId });
  } catch (err) {
    console.error("trace-leak error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;