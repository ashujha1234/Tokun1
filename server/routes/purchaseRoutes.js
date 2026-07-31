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
const Razorpay = require("../utils/razorpay");
const Prompt = require("../models/Prompt");
const Purchase = require("../models/Purchase");
const Wallet = require("../models/Wallet");
const PlatformWallet = require("../models/PlatformWallet");
const { requireAuth } = require("../utils/auth");
const { requireKycVerified } = require("../utils/requireKycVerified");
const { logActivity } = require("../utils/activityLogger");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const { embedWatermark, extractWatermark } = require("../utils/nvisibleWatermark");
const { generateInvoicePDF } = require("../services/invoice.service");
const { sendInvoiceEmail } = require("../services/email.service");

// POST /api/purchase/create-order/:promptId
router.post("/create-order/:promptId", requireAuth, requireKycVerified, async (req, res) => {
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

    const amount = Math.round(prompt.tokun_price * 100);

    const shortReceipt = `p${prompt._id
      .toString()
      .slice(-6)}u${req.user._id.toString().slice(-6)}`;

    const order = await Razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: shortReceipt,
    });

    return res.json({
      success: true,
      order,
      prompt: {
        id: prompt._id,
        title: prompt.title,
        price: prompt.price,
        tokun_price: prompt.tokun_price,
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
router.post("/verify/:promptId", requireAuth, async (req, res) => {
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

    // Buyer pays tokun_price (price + commission markup) — seller only ever gets
    // prompt.price, so the difference is Tokun's cut for this sale.
    const platformCommission = Math.max(0, +(Number(pricePaid || 0) - Number(prompt.price || 0)).toFixed(2));

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

    // Update prompt sales stats
    prompt.salesCount += 1;
    prompt.totalRevenue += prompt.price;
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

    // Credit seller wallet
    try {
      await Wallet.creditSale(sellerId, prompt.price, {
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