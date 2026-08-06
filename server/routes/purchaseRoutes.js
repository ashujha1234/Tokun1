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
// //       .createHmac("sha256", "O9jzpGZzixxQp1iNXSheMDuN")
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
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "O9jzpGZzixxQp1iNXSheMDuN")
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
const Category = require("../models/Category");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const PlatformWallet = require("../models/PlatformWallet");
const BankAccount = require("../models/BankAccount");
const { requireAuth, blockIfSuspended, blockOrgTeamMemberPurchase } = require("../utils/auth");
const { splitPromptSale } = require("../utils/commission");
const { requireKycVerified } = require("../utils/requireKycVerified");
const { logActivity } = require("../utils/activityLogger");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const { embedWatermark, extractWatermark } = require("../utils/nvisibleWatermark");
const { generateInvoicePDF } = require("../services/invoice.service");
const { sendInvoiceEmail } = require("../services/email.service");
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

    // Prompts uploaded after the Route-onboarding-first flow shipped require
    // an activated linked account to be purchasable at all — mirrors the
    // same gate GET /others uses to hide them from the marketplace feed, so
    // a direct/cart link can't bypass it. Older prompts (flag defaults
    // false) still fall back to the Wallet ledger, same as always.
    if (prompt.requiresSellerVerification && !linkedAccountId) {
      return res.status(403).json({
        success: false,
        error: "seller_not_verified",
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
    console.error("Razorpay create order error:", err);
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

    if (routeTransferId) {
      purchase.routeTransferId = routeTransferId;
      await purchase.save();
    } else {
      // Fallback: seller hasn't onboarded to Route yet. Same net as the Route
      // transfer above — list price less Tokun's seller-side commission — so a
      // seller earns the same either way.
      try {
        await Wallet.creditSale(sellerId, split.sellerNet, {
          purchaseId: purchase._id,
          promptId: prompt._id,
          promptTitle: prompt.title,
        });
      } catch (walletErr) {
        console.error("Wallet credit failed:", walletErr);

        return res.status(500).json({
          success: false,
          error: "wallet_credit_failed",
          message: walletErr.message,
        });
      }
    }

    // Record Tokun's commission cut for this sale (non-fatal — purchase already succeeded)
    try {
      await PlatformWallet.recordCommission(platformCommission, {
        source: "prompt_purchase",
        refId: purchase._id,
        description: `Commission: "${prompt.title}"`,
      });
    } catch (revErr) {
      console.error("PlatformWallet commission record failed:", revErr);
    }

    // Update buyer's purchasedPrompts
    req.user.purchasedPrompts.push(purchase._id);
    await req.user.save();

    /* -------------------- INVOICE (safe — purchase already saved) -------------------- */
    try {
      const invoiceNo = `INV-${purchase._id}`;
      const date = new Date(purchase.createdAt || Date.now()).toLocaleDateString("en-GB");

      // generateInvoicePDF derives subtotal/GST/total from `items` itself
      // (subtotal = sum of item prices, GST = 18% on top) — mirror the same
      // math here so the email body matches the attached PDF exactly.
      const subtotal = Number(pricePaid || 0);
      const gst = +(subtotal * 0.18).toFixed(2);
      const total = +(subtotal + gst).toFixed(2);
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
        });
      }
    } catch (invoiceErr) {
      // Invoice fail hone pe bhi purchase success hi return karo
      console.error("⚠️ Prompt invoice/email failed (purchase still success):", invoiceErr.message);
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

    return res.json({
      success: true,
      purchase,
    });
  } catch (err) {
    console.error("Verify purchase error:", err);

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
      .populate("prompt", "title free price deleted");

    return res.json({
      success: true,
      purchases,
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
router.post("/:purchaseId/refund-request", requireAuth, async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const reason = String(req.body?.reason || "").trim();

    if (!reason) {
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

    const refundRequest = await RefundRequest.create({
      purchase: purchase._id,
      buyer: req.user._id,
      seller: purchase.prompt.userId,
      prompt: purchase.prompt._id,
      reason,
      refundAmount: purchase.pricePaid,
    });

    purchase.refundStatus = "REQUESTED";
    await purchase.save();

    await notifyAdmins({
      type: "ADMIN_REFUND_REQUESTED",
      promptId: purchase.prompt._id,
      message: `Refund requested for "${purchase.prompt.title}" by ${req.user.name || req.user.email}: ${reason}`,
      meta: { refundRequestId: refundRequest._id, purchaseId: purchase._id },
    });

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