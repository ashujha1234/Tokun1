
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
const { promptUnavailableReason } = require("../utils/promptVisibility");
const ledger = require("../utils/ledger");
const {
  getSellerLinkedAccountId,
  fetchTransferIdsByAccount,
  transferOnHoldUntil,
} = require("../utils/routePayouts");
// Wallet import removed with the payout fallback — all prompt payouts are
// Razorpay Route transfers now.
const PlatformWallet = require("../models/PlatformWallet");
const { route } = require("./authRoutes");
const { generateInvoicePDF } = require("../services/invoice.service");
const { sendInvoiceEmail } = require("../services/email.service");
const { sendPromptSoldEmail } = require("../services/creatorEmail.service");
const {
  reserveCreditForOrder,
  bindCreditToOrder,
  consumeReservedCredit,
  reserveBuyerDiscount,
  consumeBuyerDiscount,
} = require("../services/referral.service");
const CommissionRebate = require("../models/CommissionRebate");


// POST /api/cart/add/:promptId
router.post("/add/:promptId", requireAuth, async (req, res) => {
  try {
    const { promptId } = req.params;
    const prompt = await Prompt.findById(promptId);

    if (!prompt) {
      return res.status(404).json({ success: false, error: "prompt_not_found" });
    }

    /* Deleted, flagged by a report, or not cleared by the media check — the
       same gate the marketplace feed applies, and the same one Buy Now applies.
       It used to test `deleted` alone, so a listing that had been flagged (or
       had failed prompt/media validation and was sitting in the review queue)
       could be added from a shared link and then paid for through checkout. */
    const blocked = promptUnavailableReason(prompt);
    if (blocked) {
      return res.status(400).json({ success: false, ...blocked });
    }

    // block if one-time and already sold
    if (prompt.exclusive && prompt.sold) {
      return res.status(400).json({ success: false, error: "prompt_already_sold" });
    }

    // Already bought it — adding it again could only lead to paying twice for
    // the same thing. Caught here so the buyer is told immediately rather than
    // finding out at checkout.
    const owned = await Purchase.findOne({
      buyer: req.user._id,
      prompt: prompt._id,
      paymentStatus: "SUCCESS",
    }).select({ _id: 1 });
    if (owned) {
      return res.status(400).json({
        success: false,
        error: "already_purchased",
        message: "You already own this product — find it in your purchase history.",
      });
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

    /* ✅ filter out anything that is no longer sellable — deleted, flagged by a
       report, or pulled back into the media-validation queue. Was `deleted`
       only, so a flagged listing sat in the cart looking perfectly normal and
       only failed at checkout (and before that gate existed, didn't fail at
       all). Dropped from the saved cart rather than hidden, same as the owned
       items below, so it doesn't come back on the next load. */
    cart.items = cart.items.filter(
      (item) => item.prompt && !promptUnavailableReason(item.prompt)
    );

    // …and anything already owned. A prompt bought outside the cart (Buy Now,
    // or a shared/org purchase) used to stay in the cart forever and get
    // charged for again at checkout. Dropped from the saved cart, not just
    // hidden, so it doesn't reappear on the next load.
    const owned = await Purchase.find({
      buyer: req.user._id,
      paymentStatus: "SUCCESS",
      prompt: { $in: cart.items.map((i) => i.prompt._id) },
    })
      .select({ prompt: 1 })
      .lean();

    if (owned.length) {
      const ownedIds = new Set(owned.map((p) => String(p.prompt)));
      cart.items = cart.items.filter((i) => !ownedIds.has(String(i.prompt._id)));
    }

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

    // Anything the buyer already owns must not be charged for. /verify skips
    // creating a duplicate purchase for these, so without this the buyer would
    // pay for the item and get no purchase record in return. This is the money
    // side of the same problem GET / fixes for display.
    const alreadyOwned = await Purchase.find({
      buyer: req.user._id,
      paymentStatus: "SUCCESS",
      prompt: { $in: cart.items.map((i) => i.prompt?._id).filter(Boolean) },
    })
      .select({ prompt: 1 })
      .lean();
    const ownedIds = new Set(alreadyOwned.map((p) => String(p.prompt)));

    const payableItems = cart.items.filter(
      (i) => i.prompt && !ownedIds.has(String(i.prompt._id))
    );

    if (payableItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: "cart_already_purchased",
        message: "You already own everything in your cart.",
      });
    }

    // calculate total
    let totalAmount = 0;
    const purchasablePrompts = [];

    // linked account id -> paise owed to that seller across this whole cart.
    // Aggregated per account rather than per prompt because a cart can hold two
    // prompts from the same seller, and Razorpay wants one transfer per
    // recipient on an order.
    const transferPaiseByAccount = new Map();
    /* Credits held during this checkout, bound to the order once it exists.
       A cart can hold prompts from several sellers, so there can be more than
       one — each is that seller's own credit, spent on their own line. */
    const reservedCredits = [];
    let tokunCutPaise = 0;

    for (let item of payableItems) {
      const p = item.prompt;

      /* Re-checked here, not just at /add. A cart is not a snapshot — it can sit
         for days, and a listing can be flagged, deleted, or fail its media check
         at any point after it went in. Without this, anything already in a cart
         was permanently past the gate: the one place that checked was the moment
         it was added.

         Checked BEFORE the `free` shortcut below, because a free product still
         gets delivered by checkout — "no payment" is not "no gate". */
      const blocked = promptUnavailableReason(p);
      if (blocked) {
        return res.status(400).json({
          success: false,
          error: `${blocked.error}: ${p.title}`,
          message: `"${p.title}" isn't available any more. Remove it from your cart to check out.`,
        });
      }

      // skip free prompts → they don't require payment
      if (p.free) {
        purchasablePrompts.push(p);
        continue;
      }

      // block if exclusive already sold
      if (p.exclusive && p.sold) {
        return res.status(400).json({ success: false, error: `prompt_already_sold: ${p.title}` });
      }

      /* Same gate as single-prompt checkout: every seller in the cart needs an
         activated linked account, not just the ones whose listing carries
         requiresSellerVerification. That flag defaults to false and is only
         set on new uploads, so gating on it let a legacy listing through and
         sent its seller's share to the internal Wallet — a payout path that no
         longer exists. */
      const linkedAccountId = await getSellerLinkedAccountId(p.userId);
      if (!linkedAccountId) {
        return res.status(403).json({
          success: false,
          error: `seller_not_verified: ${p.title}`,
          message: `"${p.title}" can't be bought right now — its Creator hasn't finished payout setup. Remove it from your cart to check out.`,
        });
      }

      // Same buyer-facing figure as single-prompt checkout. Routed through the
      // shared split so a prompt with a stale tokun_price of 0 doesn't silently
      // contribute ₹0 to the order total.
      const split = splitPromptSale(p);
      totalAmount += Math.round(split.buyerPays * 100); // Razorpay in paise
      /* Tokun's cut across the whole cart, less anything a seller's own waiver
         has already given away. This is the ceiling for the buyer's discount
         below — the two rewards share one pot. */
      tokunCutPaise += Math.round(split.platformCut * 100);

      // Attach this seller's share to the order, exactly as single-prompt
      // checkout does. Without this the cart took the buyer's money and left it
      // in Tokun's balance — sellers were never paid for a cart purchase at all.
      if (linkedAccountId) {
        /* Refer & Earn, same rule as Buy Now.
           It has to be here too: which checkout a buyer happens to use is not
           something the seller controls, and "your next sale is commission-free
           — unless they add it to the cart first" is not a promise anyone can
           act on. */
        let sellerReceives = split.sellerNet;
        try {
          const credit = await reserveCreditForOrder({
            sellerId: p.userId,
            listPrice: split.listPrice,
          });
          if (credit) {
            const waived = Math.min(split.sellerFee, credit.maxAmount);
            sellerReceives = +(split.sellerNet + waived).toFixed(2);
            tokunCutPaise -= Math.round(waived * 100);
            reservedCredits.push({ credit, sellerId: p.userId, waived });
          }
        } catch (creditErr) {
          console.error("Cart referral credit lookup failed (sale unaffected):", creditErr.message);
        }

        const key = String(linkedAccountId);
        transferPaiseByAccount.set(
          key,
          (transferPaiseByAccount.get(key) || 0) + Math.round(sellerReceives * 100)
        );
      }

      purchasablePrompts.push(p);
    }

    /* The buyer's Refer & Earn welcome discount, applied once across the whole
       cart rather than per item — it is one credit, and a cart is one payment.
       Ceiling is what's left of Tokun's cut after any seller waivers above, so
       the transfers can never add up to more than the buyer pays. */
    let cartDiscount = 0;
    let buyerDiscountCredit = null;

    if (totalAmount > 0) {
      try {
        const held = await reserveBuyerDiscount({
          buyerId: req.user._id,
          buyerPays: totalAmount / 100,
          tokunCut: Math.max(0, tokunCutPaise / 100),
        });
        if (held) {
          cartDiscount = held.discount;
          buyerDiscountCredit = held.credit;
          totalAmount -= Math.round(cartDiscount * 100);
        }
      } catch (discountErr) {
        console.error("Cart buyer discount failed (checkout unaffected):", discountErr.message);
      }
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

      // Bind each held credit to the order that now exists — /verify matches
      // on it exactly. See the note on reservedForOrderId.
      for (const { credit } of reservedCredits) {
        await bindCreditToOrder(credit._id, order.id).catch((e) =>
          console.error("Cart referral credit bind failed:", e.message)
        );
      }
      if (buyerDiscountCredit) {
        await bindCreditToOrder(buyerDiscountCredit._id, order.id).catch((e) =>
          console.error("Cart buyer discount bind failed:", e.message)
        );
      }
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

    /* The buyer's welcome discount, if this checkout spent one. Read once here
       rather than per line: it was applied to the ORDER as a whole, and the
       loop below shares it out across the lines. */
    const buyerDiscountCreditDoc = await CommissionRebate.findOne({
      userId: req.user._id,
      kind: "buyer_discount",
      status: { $in: ["RESERVED", "USED"] },
      reservedForOrderId: String(razorpayOrderId || ""),
    }).lean();

    /* The denominator for that share-out — what the cart came to before the
       discount, computed the same way checkout computed it. */
    const cartTotalBeforeDiscount = cart.items.reduce((sum, item) => {
      const s = splitPromptSale(item.prompt);
      return sum + Number(s.buyerPays || 0);
    }, 0);

    /* Taken from the ORDER, with the credit row as the fallback — the same fix
       as POST /api/purchase/verify, for the same reason.

       Reading it off the credit alone recorded the full price whenever that
       lookup came back empty, while the card had been charged the discounted
       amount: the purchase rows said ₹1,030 on a sale paid at ₹978.50. And the
       lookup can come back empty without the buyer doing anything wrong — the
       reservation is released when a checkout looks abandoned, and
       bindCreditToOrder's failure is logged rather than raised. Razorpay was
       handed the discounted figure at checkout, so its order is the only record
       that cannot disagree with the card. */
    let cartDiscountApplied = null;
    try {
      const order = await razorpay.orders.fetch(String(razorpayOrderId));
      const paise = Number(order?.amount_paid) || Number(order?.amount) || 0;
      if (paise > 0) {
        cartDiscountApplied = +Math.max(0, cartTotalBeforeDiscount - paise / 100).toFixed(2);
      }
    } catch (orderErr) {
      console.error("Cart order fetch failed at verify:", orderErr?.message || orderErr);
    }

    if (cartDiscountApplied == null) {
      cartDiscountApplied = Number(buyerDiscountCreditDoc?.amountPaid || 0);
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
    /* Lines whose commission was waived. Credits are closed out AFTER the
       transaction commits — marking one spent inside a transaction that then
       rolls back would burn the reward on a sale that never happened. */
    const waivedLines = [];
    // Ledger rows are COLLECTED inside the transaction and written after it
    // commits. Writing them inline would either join the transaction (so a
    // bookkeeping failure could abort a paid checkout) or sit outside it (so a
    // rolled-back checkout would leave ledger rows for purchases that never
    // existed). Neither is acceptable in a ledger.
    let ledgerRows = [];
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Reset on retry — withTransaction may run this callback more than once
        // on a transient error, and appending twice would duplicate the invoice.
        purchases.length = 0;
        ledgerRows = [];

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

            /* Refer & Earn: was this seller's line built commission-free?
               Matched on the order this checkout created, so a stale hold from
               somebody's abandoned cart can't be read as this one. The numbers
               recorded below have to be the ones Razorpay actually transferred
               — the refund path recovers `pricePaid − platformCommission`. */
            const waivedCredit = await CommissionRebate.findOne({
              userId: p.userId,
              status: "RESERVED",
              reservedForOrderId: String(razorpayOrderId || ""),
            })
              .session(session)
              .lean();

            const commissionWaived = waivedCredit
              ? Math.min(split.sellerFee, waivedCredit.maxAmount)
              : 0;
            const sellerNet = +(split.sellerNet + commissionWaived).toFixed(2);

            /* The cart-level welcome discount, spread across the lines in
               proportion to what each one cost.

               It has to be split: a refund gives back one purchase's
               `pricePaid`, so charging the whole discount to a single line
               would over-refund every other line in the cart and under-refund
               that one. */
            const lineShare = cartTotalBeforeDiscount > 0
              ? split.buyerPays / cartTotalBeforeDiscount
              : 0;
            const lineDiscount = +(cartDiscountApplied * lineShare).toFixed(2);
            const chargedForLine = +(split.buyerPays - lineDiscount).toFixed(2);
            const platformCut = +(chargedForLine - sellerNet).toFixed(2);

            if (commissionWaived > 0) waivedLines.push({ sellerId: p.userId, commissionWaived, title: p.title });

            const [purchase] = await Purchase.create(
              [
                {
                  buyer: req.user._id,
                  prompt: p._id,
                  pricePaid: chargedForLine,
                  // Tokun's total cut (buyer-side fee + seller-side fee). The
                  // refund path recovers `pricePaid − platformCommission` from
                  // the seller, so omitting this — as this route used to — made a
                  // cart refund try to claw back the full amount from a seller
                  // who was only ever paid the net.
                  platformCommission: platformCut,
                  // The non-refundable half of that cut, itemised — a refund
                  // returns the list price and keeps these.
                  platformFee: split.platformFee,
                  platformFeeGst: split.platformFeeGst,
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
            // What was actually transferred, waiver included.
            p.totalRevenue += sellerNet;

            // ── Pay the seller ──────────────────────────────────────────────
            // Free prompts owe nobody anything; everything else is paid exactly
            // once, by whichever of the two paths applies.
            if (sellerNet > 0) {
              const linkedAccountId = linkedAccountBySeller.get(String(p.userId));
              const routeTransferId = linkedAccountId
                ? transferIdsByAccount.get(String(linkedAccountId))
                : null;

              if (routeTransferId) {
                // Razorpay already moved it at order time — record which
                // transfer covered this row so a refund reverses the right one.
                purchase.routeTransferId = routeTransferId;
              }
              /* No `else` any more. It used to credit the internal Wallet, and
                 that was wrong in both directions: a seller with a linked
                 account whose transfer id merely failed to resolve got paid
                 twice, and a seller without one was being paid through a
                 mechanism that no longer exists. Checkout now requires every
                 seller in the cart to have an activated linked account (see
                 the gate at order creation), so Route is the only path. */

              // Earnings and tax recorded apart: platformCut includes the GST
              // charged on the fee, and that portion is owed to the government
              // rather than withdrawable by Tokun.
              await PlatformWallet.recordCommission(
                +(platformCut - Number(split.platformFeeGst || 0)).toFixed(2),
                {
                  source: "prompt_purchase",
                  refId: purchase._id,
                  description: `Commission: "${p.title}"`,
                  session,
                }
              );

              await PlatformWallet.recordGst(Number(split.platformFeeGst || 0), {
                source: "prompt_purchase",
                refId: purchase._id,
                description: `GST on fee: "${p.title}"`,
                session,
              });
            }

            await purchase.save({ session });
            await p.save({ session });

            req.user.purchasedPrompts.push(purchase._id);
            purchases.push(purchase);

            // Pure JS, no I/O — cannot affect the transaction. Flushed below,
            // once the commit has actually happened.
            //
            // NOTE there is no per-item PAYMENT row. The buyer made ONE payment
            // for the whole cart, and the ledger records what happened, not how
            // many things it bought — a row per item would report a ₹900 cart
            // as ₹900 collected three times. The single payment row is written
            // after the loop; the per-seller rows below are the ones that
            // genuinely differ per item.
            if (sellerNet > 0) {
              // Always a Route transfer now. A missing id means we failed to
              // read it, not that the money didn't move — flagged rather than
              // reclassified as some other kind of payout.
              const resolvedTransfer = !!purchase.routeTransferId;
              ledgerRows.push({
                kind: "TRANSFER",
                direction: "OUT",
                purpose: "PROMPT_PURCHASE",
                amount: ledger.toPaise(sellerNet),
                occurredAt: new Date(),
                razorpayTransferId: purchase.routeTransferId || "",
                razorpayPaymentId,
                source: "api",
                user: p.userId,
                counterparty: req.user._id,
                purchase: purchase._id,
                prompt: p._id,
                meta: {
                  via: "route",
                  viaCart: true,
                  ...(resolvedTransfer ? {} : { needsReconciliation: true }),
                },
              });
            }
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

    /* ── ANSWER THE BUYER HERE ────────────────────────────────────────────────
       The transaction has committed, so every prompt in the cart is owned and
       the cart is cleared — that is the whole of what the buyer is waiting to
       hear. What follows is ledger rows and an invoice email, and the email
       alone (Gmail SMTP, two PDF attachments) took seconds the buyer spent
       staring at Razorpay's spinner. Both already treated their own failures
       as non-fatal, so neither belongs in front of the response. */
    res.json({ success: true, purchases });

    if (cartDiscountApplied > 0) {
      try {
        await consumeBuyerDiscount({
          buyerId: req.user._id,
          razorpayOrderId,
          purchaseId: purchases[0]?._id || null,
          discount: cartDiscountApplied,
        });
      } catch (discountErr) {
        console.error("Cart buyer discount consume failed:", discountErr.message);
      }
    }

    /* Close out any Refer & Earn credits this checkout spent. No money moves
       here — Razorpay already transferred the larger amount to each seller. */
    for (const line of waivedLines) {
      try {
        const bought = purchases.find((pu) => String(pu.prompt) === String(line.sellerId));
        await consumeReservedCredit({
          sellerId: line.sellerId,
          razorpayOrderId,
          purchaseId: bought?._id || null,
          amountWaived: line.commissionWaived,
          promptTitle: line.title,
        });
      } catch (creditErr) {
        console.error("Cart referral credit consume failed:", creditErr.message);
      }
    }

    settleAfterCheckout().catch((bgErr) => {
      console.error("Post-checkout settlement failed:", bgErr);
    });

    async function settleAfterCheckout() {
      /* -------------------- LEDGER (safe — the transaction has committed) ----- */
      if (purchases.length > 0) {
        // One payment in, once. Deduped against the webhook's own row for the
        // same payment id, so whichever arrives first wins and the other is a
        // no-op. The individual purchases live in meta rather than in the
        // linkage columns, because this row belongs to all of them.
        const cartTotal = purchases.reduce((sum, p) => sum + Number(p.pricePaid || 0), 0);
        await ledger.record({
          kind: "PAYMENT",
          direction: "IN",
          purpose: "PROMPT_PURCHASE",
          amount: ledger.toPaise(cartTotal),
          occurredAt: purchases[0].purchasedAt || new Date(),
          razorpayPaymentId,
          razorpayOrderId,
          source: "api",
          user: req.user._id,
          meta: {
            viaCart: true,
            items: purchases.length,
            purchaseIds: purchases.map((p) => String(p._id)),
          },
        });
      }

      // Sequential rather than Promise.all: a burst of concurrent duplicate-key
      // errors is noisier than it's worth for a handful of cart items.
      for (const row of ledgerRows) {
        await ledger.record(row);
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
          // GST off — see services/invoice.service.js for why.
          // const gst = +(subtotal * 0.18).toFixed(2);
          const gst = 0;
          const total = +subtotal.toFixed(2);

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
        // Invoice fail hone pe bhi checkout success hi return karo
        console.error("⚠️ Cart invoice/email failed (checkout still success):", invoiceErr.message);
      }

      /* One "you made a sale" email per seller in the cart.
         A cart can pay several creators at once, and each of them owns exactly
         one line of it — so the email is per purchase, not per checkout, and
         carries only that creator's own numbers. Sequential rather than
         Promise.all: this is already off the response path, and a burst of
         parallel SMTP connections to Gmail is how you get rate-limited. */
      for (const purchase of purchases) {
        try {
          const prompt = await Prompt.findById(purchase.prompt).select("title userId");
          if (!prompt?.userId) continue;

          // `user` (lowercase) is this file's import of the User MODEL — see the
          // requires at the top. Not to be confused with req.user, the buyer.
          const seller = await user.findById(prompt.userId).select("name email");
          if (!seller?.email) continue;

          await sendPromptSoldEmail({
            to: seller.email,
            sellerName: seller.name,
            productTitle: prompt.title || purchase.promptSnapshot?.title,
            buyerName: req.user.name,
            salePrice: purchase.pricePaid,
            platformCut: purchase.platformCommission,
            netEarning:
              Number(purchase.pricePaid || 0) - Number(purchase.platformCommission || 0),
            soldAt: purchase.purchasedAt,
          });
        } catch (sellerMailErr) {
          console.error(
            `⚠️ Seller sale email failed for purchase ${purchase._id} (sale unaffected):`,
            sellerMailErr.message
          );
        }
      }
    } // ── end settleAfterCheckout ──
  } catch (err) {
    console.error("Cart verify error:", err);
    // Already answered — see settleAfterCheckout above.
    if (res.headersSent) return;
    res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports=router;

//68d3837b193561fe32c38957 paid 100
//68d3856b193561fe32c38978 free
//68d3858d193561fe32c3897e exclusive