// routes/purchaseRoutes.js
const express = require("express");
const router = express.Router();
const Razorpay = require("../utils/razorpay");
const Prompt = require("../models/Prompt");
const Purchase = require("../models/Purchase");
const { requireAuth } = require("../utils/auth");
const { requireKycVerified } = require("../utils/requireKycVerified");
const { logActivity } = require("../utils/activityLogger");
const crypto = require('crypto');


// POST /api/purchase/create-order/:promptId
router.post("/create-order/:promptId", requireAuth,requireKycVerified, async (req, res) => {
  try {
    const { promptId } = req.params;
    const prompt = await Prompt.findById(promptId);
    if (!prompt) return res.status(404).json({ success: false, error: "prompt_not_found" });
// ✅ Check if exclusive prompt already sold
if (prompt.exclusive && prompt.sold) {
  return res.status(400).json({ success: false, error: "prompt_already_sold" });
}
    // Amount in paise (Razorpay works in smallest currency unit)
    const amount = Math.round(prompt.tokun_price * 100); // tokun_price * 100
const shortReceipt = `p${prompt._id.toString().slice(-6)}u${req.user._id.toString().slice(-6)}`;
// example: p12ab34u56cd78

    const order = await Razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: shortReceipt,
   //   payment_capture: 1, // auto capture
    });
    console.log(order);
    res.json({ success: true, order, prompt: { id: prompt._id, title: prompt.title, price: prompt.price } });
  } catch (err) {
    console.error("Razorpay create order error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});



// POST /api/purchase/verify/:promptId
router.post("/verify/:promptId", requireAuth, async (req, res) => {
  try {
    const { promptId } = req.params;
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, pricePaid } = req.body;

    const prompt = await Prompt.findById(promptId);
    if (!prompt) return res.status(404).json({ success: false, error: "prompt_not_found" });

    if (prompt.exclusive && prompt.sold) {
  return res.status(400).json({ success: false, error: "prompt_already_sold" });
}
    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", "O9jzpGZzixxQp1iNXSheMDuN")
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

      console.log(generatedSignature);
    console.log(razorpaySignature);
    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, error: "invalid_payment_signature" });
    }

    // Check if already purchased
    const alreadyPurchased = await Purchase.findOne({ buyer: req.user._id, prompt: promptId });
    if (alreadyPurchased) return res.status(400).json({ success: false, error: "already_purchased" });

    // Save purchase record
    const purchase = await Purchase.create({
      buyer: req.user._id,
      prompt: prompt._id,
      pricePaid, // amount buyer paid = tokun_price
      razorpayPaymentId,
      razorpayOrderId,
      paymentStatus: "SUCCESS",
      promptSnapshot: {
        title: prompt.title,
        description: prompt.description,
        promptText: prompt.promptText,
        attachment: prompt.attachment,
        uploadCode: prompt.uploadCode,
        originalPrice: prompt.price, // seller revenue
      },
    });

    if (prompt.exclusive) {
  prompt.sold = true;
}

    // Update prompt stats
    prompt.salesCount += 1;
    prompt.totalRevenue += prompt.price; // seller earns only original price
    await prompt.save();

    // Update buyer's purchasedPrompts
    req.user.purchasedPrompts.push(purchase._id);
    await req.user.save();
      
   // ✅ YE ADD KARO YAHAN
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





    res.json({ success: true, purchase });
  } catch (err) {
    console.error("Verify purchase error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});



// routes/purchaseRoutes.js (same router)
router.get("/history", requireAuth, async (req, res) => {
  try {
    const purchases = await Purchase.find({ buyer: req.user._id })
      .sort({ purchasedAt: -1 })
      .populate("prompt", "title free price deleted");

    res.json({ success: true, purchases });
  } catch (err) {
    console.error("Buyer history error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});



router.get("/analytics/sales", async (req, res) => {
  try {
    const monthlySales = await Purchase.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalSales: { $sum: 1 },        // kitne prompts bike
          revenue: { $sum: "$pricePaid"} // optional
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({ success: true, monthlySales });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// GET /api/purchase/analytics/user-stats
router.get("/analytics/user-stats", requireAuth, async (req, res) => {
  try {
    // ✅ 1) Sell count = uploaded prompts count
    const uploads = await Prompt.aggregate([
      {
        $match: {
          deleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: "$userId",
          uploadedPrompts: { $sum: 1 },
          promptRevenue: { $sum: { $ifNull: ["$totalRevenue", 0] } },
          promptSalesCount: { $sum: { $ifNull: ["$salesCount", 0] } },
        },
      },
    ]);

    // ✅ 2) Buy count = purchased prompts count
    // NOTE: History page all purchases dikha raha hai, isliye yahan FAILED ko hata ke baaki count kar rahe hain.
    const buys = await Purchase.aggregate([
      {
        $match: {
          paymentStatus: { $ne: "FAILED" },
        },
      },
      {
        $group: {
          _id: "$buyer",
          buyProducts: { $sum: 1 },
          totalSpent: { $sum: { $ifNull: ["$pricePaid", 0] } },
        },
      },
    ]);

    // ✅ 3) Seller earning / volume
    // Seller earning original prompt price se count hogi, tokun/commission included price se nahi.
    const earnings = await Purchase.aggregate([
      {
        $match: {
          paymentStatus: { $ne: "FAILED" },
        },
      },
      {
        $lookup: {
          from: "prompts",
          localField: "prompt",
          foreignField: "_id",
          as: "promptDoc",
        },
      },
      {
        $unwind: {
          path: "$promptDoc",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: "$promptDoc.userId",
          soldProducts: { $sum: 1 },
          totalEarnings: {
            $sum: {
              $ifNull: [
                "$promptSnapshot.originalPrice",
                {
                  $ifNull: ["$promptDoc.price", "$pricePaid"],
                },
              ],
            },
          },
        },
      },
    ]);

    const map = new Map();

    const ensure = (id) => {
      const key = String(id || "");
      if (!key) return null;

      if (!map.has(key)) {
        map.set(key, {
          userId: key,
          uploadedPrompts: 0,
          buyProducts: 0,
          soldProducts: 0,
          totalSpent: 0,
          totalEarnings: 0,
        });
      }

      return map.get(key);
    };

    uploads.forEach((x) => {
      const row = ensure(x._id);
      if (!row) return;

      row.uploadedPrompts = Number(x.uploadedPrompts || 0);

      // fallback earning from Prompt.totalRevenue
      if (Number(x.promptRevenue || 0) > 0) {
        row.totalEarnings = Number(x.promptRevenue || 0);
      }
    });

    buys.forEach((x) => {
      const row = ensure(x._id);
      if (!row) return;

      row.buyProducts = Number(x.buyProducts || 0);
      row.totalSpent = Number(x.totalSpent || 0);
    });

    earnings.forEach((x) => {
      const row = ensure(x._id);
      if (!row) return;

      row.soldProducts = Number(x.soldProducts || 0);
      row.totalEarnings = Number(x.totalEarnings || 0);
    });

    return res.json({
      success: true,
      items: Array.from(map.values()),
      debug: {
        uploadsGroups: uploads.length,
        buysGroups: buys.length,
        earningsGroups: earnings.length,
        totalRows: map.size,
      },
    });
  } catch (err) {
    console.error("GET /analytics/user-stats error:", err);
    return res.status(500).json({
      success: false,
      error: "server_error",
      message: err.message,
    });
  }
});


module.exports = router;
