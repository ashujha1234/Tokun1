
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../utils/auth"); // your JWT middleware
const Cart=require('../models/Cart');
const user=require('../models/User');
const Prompt=require('../models/Prompt');
const  razorpay  = require("../utils/razorpay");
const { route } = require("./authRoutes");


// POST /api/cart/add/:promptId
router.post("/add/:promptId", requireAuth, async (req, res) => {
  try {
    const { promptId } = req.params;
    const prompt = await Prompt.findById(promptId);

    if (!prompt) {
      return res.status(404).json({ success: false, error: "prompt_not_found" });
    }

    // block if prompt is deleted
    if (prompt.deleted) {
      return res.status(400).json({ success: false, error: "prompt_deleted" });
    }

    // block if one-time and already sold
    if (prompt.exclusive && prompt.sold) {
      return res.status(400).json({ success: false, error: "prompt_already_sold" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    // prevent duplicates
    if (cart.items.find((i) => i.prompt.toString() === promptId)) {
      return res.status(400).json({ success: false, error: "already_in_cart" });
    }

    cart.items.push({ prompt: prompt._id });
    await cart.save();

    // repopulate prompts and filter deleted
    cart = await Cart.findById(cart._id).populate("items.prompt");
    cart.items = cart.items.filter((i) => i.prompt && !i.prompt.deleted);
    await cart.save();

    // calculate totals
    let totalItems = cart.items.length;
    let totalPrice = 0;
    let totalTokunPrice = 0;

    cart.items.forEach((item) => {
      const p = item.prompt;
      totalPrice += p.free ? 0 : p.price;
      totalTokunPrice += p.free ? 0 : p.tokun_price;
    });

    res.json({
      success: true,
      cart,
      totalItems,
      totalPrice,
      totalTokunPrice,
    });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});


// GET /api/cart
router.get("/", requireAuth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.prompt");

    if (!cart) {
      return res.json({
        success: true,
        cart: { items: [] },
        totalItems: 0,
        totalPrice: 0,
        totalTokunPrice: 0,
      });
    }

    // ✅ filter out deleted prompts
    cart.items = cart.items.filter((item) => item.prompt && !item.prompt.deleted);

    // if any items removed, save cart
    await cart.save();

    let totalItems = cart.items.length;
    let totalPrice = 0;
    let totalTokunPrice = 0;

    cart.items.forEach((item) => {
      const p = item.prompt;
      totalPrice += p.free ? 0 : p.price;
      totalTokunPrice += p.free ? 0 : p.tokun_price;
    });

    res.json({
      success: true,
      cart,
      totalItems,
      totalPrice,
      totalTokunPrice,
    });
  } catch (err) {
    console.error("Cart fetch error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});


// DELETE /api/cart/remove/:promptId
router.delete("/remove/:promptId", requireAuth, async (req, res) => {
  try {
    const { promptId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, error: "cart_not_found" });

    cart.items = cart.items.filter((i) => i.prompt.toString() !== promptId);
    await cart.save();

    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, error: "server_error" });
  }
});


// POST /api/cart/checkout
router.post("/checkout", requireAuth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.prompt");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, error: "cart_empty" });
    }

    // calculate total
    let totalAmount = 0;
    const purchasablePrompts = [];

    for (let item of cart.items) {
      const p = item.prompt;

      // skip free prompts → they don't require payment
      if (p.free) {
        purchasablePrompts.push(p);
        continue;
      }

      // block if exclusive already sold
      if (p.exclusive && p.sold) {
        return res.status(400).json({ success: false, error: `prompt_already_sold: ${p.title}` });
      }

      totalAmount += p.tokun_price * 100; // Razorpay in paise
      purchasablePrompts.push(p);
    }

    // create one Razorpay order for all paid prompts
    let order = null;
    if (totalAmount > 0) {
      const shortReceipt = `cart${req.user._id.toString().slice(-6)}t${Date.now().toString().slice(-6)}`;
      order = await razorpay.orders.create({
        amount: totalAmount,
        currency: "INR",
        receipt: shortReceipt,
      });
    }

    res.json({
      success: true,
      order,
      prompts: purchasablePrompts.map((p) => ({ id: p._id, title: p.title, toatalprice: p.tokun_price})),
    });
  } catch (err) {
    console.error("Cart checkout error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// POST /api/cart/verify
router.post("/verify", requireAuth, async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, pricePaid } = req.body;

    let cart = await Cart.findOne({ user: req.user._id }).populate("items.prompt");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, error: "cart_empty" });
    }

    // verify signature
    const generatedSignature = crypto
      .createHmac("sha256", razorpay.key_secretT)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, error: "invalid_signature" });
    }

    // process each prompt
    const purchases = [];
    for (let item of cart.items) {
      const p = item.prompt;

      // skip free prompts (still save record)
      if (p.free || (!p.free && !p.exclusive) || (p.exclusive && !p.sold)) {
        const purchase = await Purchase.create({
          buyer: req.user._id,
          prompt: p._id,
          pricePaid: p.free ? 0 : p.tokun_price,
          razorpayPaymentId,
          razorpayOrderId,
          paymentStatus: "SUCCESS",
          promptSnapshot: {
            title: p.title,
            description: p.description,
            promptText: p.promptText,
            attachment: p.attachment,
            uploadCode: p.uploadCode,
            originalPrice: p.price,
          },
        });

        // mark exclusive as sold
        if (p.exclusive) {
          p.sold = true;
        }

        p.salesCount += 1;
        p.totalRevenue += p.price;
        await p.save();

        req.user.purchasedPrompts.push(purchase._id);
        purchases.push(purchase);
      }
    }

    await req.user.save();
    await Cart.deleteOne({ user: req.user._id }); // clear cart

    res.json({ success: true, purchases });
  } catch (err) {
    console.error("Cart verify error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports=router;

//68d3837b193561fe32c38957 paid 100
//68d3856b193561fe32c38978 free
//68d3858d193561fe32c3897e exclusive