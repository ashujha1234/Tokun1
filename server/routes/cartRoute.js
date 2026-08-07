
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
// Node's crypto module. Without this require, `crypto` resolved to the WebCrypto
// global (Node 18+), which has no createHmac — so /verify threw a TypeError on
// its very first statement and every cart payment 500'd before a single purchase
// was written.
const crypto = require("crypto");
const mongoose = require("mongoose");
const Purchase = require("../models/Purchase");
const { requireAuth, blockIfSuspended, blockOrgTeamMemberPurchase } = require("../utils/auth"); // your JWT middleware
const Cart=require('../models/Cart');
const user=require('../models/User');
const Prompt=require('../models/Prompt');
const  razorpay  = require("../utils/razorpay");
const { splitPromptSale } = require("../utils/commission");
const {
  getSellerLinkedAccountId,
  fetchTransferIdsByAccount,
  transferOnHoldUntil,
} = require("../utils/routePayouts");
const Wallet = require("../models/Wallet");
const PlatformWallet = require("../models/PlatformWallet");
const { route } = require("./authRoutes");
const { generateInvoicePDF } = require("../services/invoice.service");
const { sendInvoiceEmail } = require("../services/email.service");


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

    // totalPrice is the sum of list prices; totalTokunPrice is what checkout
    // will actually charge. Routed through the shared split so both agree with
    // /checkout even when a prompt's stored tokun_price is stale.
    cart.items.forEach((item) => {
      const s = splitPromptSale(item.prompt);
      totalPrice += s.listPrice;
      totalTokunPrice += s.buyerPays;
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

    // totalPrice is the sum of list prices; totalTokunPrice is what checkout
    // will actually charge. Routed through the shared split so both agree with
    // /checkout even when a prompt's stored tokun_price is stale.
    cart.items.forEach((item) => {
      const s = splitPromptSale(item.prompt);
      totalPrice += s.listPrice;
      totalTokunPrice += s.buyerPays;
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
router.post("/checkout", requireAuth, blockIfSuspended, blockOrgTeamMemberPurchase, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.prompt");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, error: "cart_empty" });
    }

    // calculate total
    let totalAmount = 0;
    const purchasablePrompts = [];

    // linked account id -> paise owed to that seller across this whole cart.
    // Aggregated per account rather than per prompt because a cart can hold two
    // prompts from the same seller, and Razorpay wants one transfer per
    // recipient on an order.
    const transferPaiseByAccount = new Map();

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

      // Same gate as the marketplace feed and single-prompt checkout — a
      // prompt requiring seller verification can't be bought via cart either,
      // even if it was added before the seller's account status changed.
      const linkedAccountId = await getSellerLinkedAccountId(p.userId);
      if (p.requiresSellerVerification && !linkedAccountId) {
        return res.status(403).json({
          success: false,
          error: `seller_not_verified: ${p.title}`,
        });
      }

      // Same buyer-facing figure as single-prompt checkout. Routed through the
      // shared split so a prompt with a stale tokun_price of 0 doesn't silently
      // contribute ₹0 to the order total.
      const split = splitPromptSale(p);
      totalAmount += Math.round(split.buyerPays * 100); // Razorpay in paise

      // Attach this seller's share to the order, exactly as single-prompt
      // checkout does. Without this the cart took the buyer's money and left it
      // in Tokun's balance — sellers were never paid for a cart purchase at all.
      if (linkedAccountId) {
        const key = String(linkedAccountId);
        transferPaiseByAccount.set(
          key,
          (transferPaiseByAccount.get(key) || 0) + Math.round(split.sellerNet * 100)
        );
      }

      purchasablePrompts.push(p);
    }

    // create one Razorpay order for all paid prompts
    let order = null;
    if (totalAmount > 0) {
      const shortReceipt = `tokun_cart${req.user._id.toString().slice(-6)}t${Date.now().toString().slice(-6)}`;

      const orderPayload = {
        amount: totalAmount,
        currency: "INR",
        receipt: shortReceipt,
        notes: {
          project: "Tokun",
          kind: "CART_CHECKOUT",
          userId: String(req.user._id),
        },
      };

      if (transferPaiseByAccount.size > 0) {
        orderPayload.transfers = [...transferPaiseByAccount.entries()].map(([account, amount]) => ({
          account,
          amount,
          currency: "INR",
          on_hold: 1,
          on_hold_until: transferOnHoldUntil(),
        }));
      }

      order = await razorpay.orders.create(orderPayload);
    }

    res.json({
      success: true,
      order,
      // Same reason as single-prompt checkout: the key that created the order
      // has to be the key checkout opens with, or Razorpay 401s.
      keyId: process.env.RAZORPAY_KEY_ID,
      prompts: purchasablePrompts.map((p) => ({ id: p._id, title: p.title, toatalprice: p.tokun_price})),
    });
  } catch (err) {
    console.error("Cart checkout error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// POST /api/cart/verify
router.post("/verify", requireAuth, blockIfSuspended, async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, pricePaid } = req.body;

    let cart = await Cart.findOne({ user: req.user._id }).populate("items.prompt");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, error: "cart_empty" });
    }

    // verify signature. Keyed off the env var, same as every other Razorpay
    // signature check in the app — `razorpay.key_secretT` was a typo for a
    // property the SDK instance doesn't expose either way, so the HMAC key was
    // undefined and no signature could ever have matched.
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, error: "invalid_signature" });
    }

    // Which sellers Razorpay already paid via a Route transfer on this order.
    // Looked up once for the whole payment rather than per item — a cart order
    // carries one transfer per seller, keyed by their linked account id.
    //
    // Failing this lookup is not fatal: the Wallet fallback below still pays
    // every seller correctly, which is the same trade-off single-prompt checkout
    // makes. It must NOT throw, or the buyer pays and receives nothing.
    let transferIdsByAccount = new Map();
    try {
      transferIdsByAccount = await fetchTransferIdsByAccount(razorpayPaymentId);
    } catch (routeErr) {
      console.error("Cart: Route transfer lookup failed (falling back to Wallet):", routeErr?.message);
    }

    // Each seller's linked account, resolved BEFORE the transaction opens so no
    // avoidable reads run inside it.
    const linkedAccountBySeller = new Map();
    for (const item of cart.items) {
      const sellerId = String(item.prompt?.userId || "");
      if (sellerId && !linkedAccountBySeller.has(sellerId)) {
        linkedAccountBySeller.set(sellerId, await getSellerLinkedAccountId(item.prompt.userId));
      }
    }

    // ── Everything that records the sale happens in ONE transaction ─────────
    // A cart can pay several sellers at once. Without this, a failure partway
    // through left some sellers paid and others not, some prompts marked sold
    // and others not, and the cart un-cleared — against a payment Razorpay had
    // already taken in full. Either the whole cart lands or none of it does.
    //
    // Nothing in here swallows its error: a failed wallet credit must roll the
    // purchases back, not be logged and forgotten.
    const purchases = [];
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Reset on retry — withTransaction may run this callback more than once
        // on a transient error, and appending twice would duplicate the invoice.
        purchases.length = 0;

        for (let item of cart.items) {
          const p = item.prompt;

          // skip free prompts (still save record)
          if (p.free || (!p.free && !p.exclusive) || (p.exclusive && !p.sold)) {
            // Don't process a prompt the buyer already owns. Guards both a
            // double-submitted /verify and a retry of this transaction.
            const alreadyOwned = await Purchase.findOne({
              buyer: req.user._id,
              prompt: p._id,
              paymentStatus: "SUCCESS",
            })
              .select({ _id: 1 })
              .session(session);
            if (alreadyOwned) continue;

            const split = splitPromptSale(p);

            const [purchase] = await Purchase.create(
              [
                {
                  buyer: req.user._id,
                  prompt: p._id,
                  pricePaid: split.buyerPays,
                  // Tokun's total cut (buyer-side fee + seller-side fee). The
                  // refund path recovers `pricePaid − platformCommission` from
                  // the seller, so omitting this — as this route used to — made a
                  // cart refund try to claw back the full amount from a seller
                  // who was only ever paid the net.
                  platformCommission: split.platformCut,
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
                },
              ],
              { session }
            );

            // mark exclusive as sold
            if (p.exclusive) {
              p.sold = true;
            }

            p.salesCount += 1;
            // Net of Tokun's cut — this is surfaced to the seller as earnings.
            p.totalRevenue += split.sellerNet;

            // ── Pay the seller ──────────────────────────────────────────────
            // Free prompts owe nobody anything; everything else is paid exactly
            // once, by whichever of the two paths applies.
            if (split.sellerNet > 0) {
              const linkedAccountId = linkedAccountBySeller.get(String(p.userId));
              const routeTransferId = linkedAccountId
                ? transferIdsByAccount.get(String(linkedAccountId))
                : null;

              if (routeTransferId) {
                // Razorpay already moved it at order time — record which
                // transfer covered this row so a refund reverses the right one.
                purchase.routeTransferId = routeTransferId;
              } else {
                // Seller isn't on Route (or the transfer didn't land) — credit
                // the Wallet ledger instead.
                await Wallet.creditSale(p.userId, split.sellerNet, {
                  purchaseId: purchase._id,
                  promptId: p._id,
                  promptTitle: p.title,
                  session,
                });
              }

              await PlatformWallet.recordCommission(split.platformCut, {
                source: "prompt_purchase",
                refId: purchase._id,
                description: `Commission: "${p.title}"`,
                session,
              });
            }

            await purchase.save({ session });
            await p.save({ session });

            req.user.purchasedPrompts.push(purchase._id);
            purchases.push(purchase);
          }
        }

        await req.user.save({ session });
        await Cart.deleteOne({ user: req.user._id }, { session }); // clear cart
      });
    } catch (txErr) {
      // Nothing was written — the buyer's payment stands, so this has to be
      // visible and retryable rather than reported as success.
      console.error("Cart verify transaction failed — nothing recorded:", txErr);
      return res.status(500).json({
        success: false,
        error: "cart_verify_failed",
        message:
          "Your payment went through but we couldn't record the purchase. Our team has been notified — please contact support with your payment ID.",
        razorpayPaymentId,
      });
    } finally {
      await session.endSession();
    }

    /* -------------------- INVOICE (safe — purchases already saved) -------------------- */
    try {
      if (purchases.length > 0 && req.user.email) {
        const invoiceNo = `INV-${purchases[0]._id}`;
        const date = new Date().toLocaleDateString("en-GB");

        const items = purchases.map((purchase) => ({
          title: purchase.promptSnapshot?.title || "Prompt",
          price: Number(purchase.pricePaid || 0),
        }));
        const subtotal = items.reduce((s, it) => s + it.price, 0);
        const gst = +(subtotal * 0.18).toFixed(2);
        const total = +(subtotal + gst).toFixed(2);

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
      // Invoice fail hone pe bhi checkout success hi return karo
      console.error("⚠️ Cart invoice/email failed (checkout still success):", invoiceErr.message);
    }

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