// Refer & Earn — the rules, in one file.
//
// The deal: your invite makes their first prompt sale, and then you BOTH get
// one sale each with Tokun's 10% commission handed back. The invited creator
// also gets a week at the top of the marketplace, because their real problem
// isn't money — it's that a brand-new listing has no reviews and nobody finds it.
//
// Two things this file is careful about:
//
//   1. Nothing pays out until a sale has SETTLED. A sale is not final when it
//      happens: prompts carry a 24-hour refund window. Rewarding at sale time
//      means someone buys their own prompt, collects the reward, and refunds.
//
//   2. The reward is spent where the money is divided. Razorpay is told how to
//      split a sale when the ORDER is created, so that is where the commission
//      is left out — the creator is paid the full list price by the same
//      transfer as always. An earlier version rebated into the internal Wallet
//      instead, which was wrong: a prompt seller's money never goes through the
//      Wallet at all, so the reward would have landed somewhere they never look.

const crypto = require("crypto");
const mongoose = require("mongoose");

const User = require("../models/User");
const Prompt = require("../models/Prompt");
const Purchase = require("../models/Purchase");
const Referral = require("../models/Referral");
const CommissionRebate = require("../models/CommissionRebate");
const Notification = require("../models/Notification");
const BankAccount = require("../models/BankAccount");
const cfg = require("../config/referral");

/* ────────────────────────────── CODES ────────────────────────────── */

/* No I, O, 0 or 1. These codes get read off a screen and typed by hand, and
   those four are the pairs people get wrong. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length = 7) {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/**
 * This user's code, minted on first use.
 *
 * Lazy on purpose: most accounts never open the Refer & Earn page, and giving
 * every signup a code fills the unique index with strings nobody will share.
 */
async function getOrCreateReferralCode(userId) {
  const user = await User.findById(userId).select("referralCode");
  if (!user) return null;
  if (user.referralCode) return user.referralCode;

  // Retry on collision rather than trusting 32^7 to never repeat.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    try {
      await User.updateOne({ _id: userId }, { $set: { referralCode: code } });
      return code;
    } catch (err) {
      if (err?.code !== 11000) throw err;
    }
  }
  throw new Error("referral_code_generation_failed");
}

/* ──────────────────────── ATTRIBUTION (SIGNUP) ──────────────────────── */

/**
 * Attach a new signup to whoever invited them.
 *
 * Called from the signup path, always best-effort: a bad or unknown code must
 * never stop someone creating an account.
 */
async function attachReferral(newUserId, rawCode) {
  const code = String(rawCode || "").trim().toUpperCase();
  if (!code) return null;

  try {
    const referrer = await User.findOne({ referralCode: code }).select("_id isDeleted").lean();
    if (!referrer || referrer.isDeleted) return null;

    // Referring yourself, via a second email on the same browser.
    if (String(referrer._id) === String(newUserId)) return null;

    // A→B and B→A. Two friends could otherwise mint a reward for each other.
    const reverse = await Referral.findOne({
      referrerId: newUserId,
      referredId: referrer._id,
    }).lean();
    if (reverse) return null;

    await User.updateOne(
      { _id: newUserId, referredBy: null },
      { $set: { referredBy: referrer._id, referredAt: new Date() } }
    );

    // The unique index on referredId makes a second attach a no-op rather than
    // a second payout.
    const referral = await Referral.create({
      referrerId: referrer._id,
      referredId: newUserId,
      code,
      status: "PENDING",
    });

    /* The welcome discount, issued NOW rather than on qualification.
       It is the reason someone accepts an invite in the first place, so it has
       to exist before they've done anything — and it costs Tokun nothing until
       they actually buy something. The referrer's side still waits for a real,
       settled sale. */
    await CommissionRebate.create({
      userId: newUserId,
      referralId: referral._id,
      role: "referred",
      kind: "buyer_discount",
      discountPercent: cfg.BUYER_DISCOUNT_PERCENT,
      maxAmount: cfg.BUYER_DISCOUNT_MAX,
      minSaleAmount: 0, // any purchase; there's nothing to protect against here
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + cfg.BUYER_DISCOUNT_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    });

    return referral;
  } catch (err) {
    if (err?.code === 11000) return null; // already attributed
    console.error("Referral attach failed (signup unaffected):", err.message);
    return null;
  }
}

/* ─────────────────────────── ANTI-ABUSE ─────────────────────────── */

/**
 * The strongest check available, and it costs one query.
 *
 * Selling requires a Razorpay linked account, and Razorpay allows one per PAN.
 * So two accounts that share a PAN are one person — which is exactly the shape
 * of every self-referral worth blocking. Email is free and unlimited; a PAN
 * is not.
 */
async function sharesPayoutIdentity(userA, userB) {
  const accounts = await BankAccount.find({ userId: { $in: [userA, userB] } })
    .select("userId panNumber")
    .lean();

  const panFor = (id) =>
    accounts
      .filter((a) => String(a.userId) === String(id) && a.panNumber)
      .map((a) => String(a.panNumber).trim().toUpperCase());

  const a = new Set(panFor(userA));
  return panFor(userB).some((pan) => a.has(pan));
}

/** How many rewards this person has already earned this calendar month. */
async function rewardsThisMonth(userId) {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  return CommissionRebate.countDocuments({
    userId,
    role: "referrer",
    createdAt: { $gte: start },
  });
}

/* ─────────────────────────── ISSUING REWARDS ─────────────────────────── */

function rebateDoc(userId, referralId, role) {
  return {
    userId,
    referralId,
    role,
    kind: "seller_commission",
    percentOfCommission: cfg.REBATE_PERCENT_OF_COMMISSION,
    /* Copied, not referenced. A credit earned under today's terms keeps
       today's terms — see the note in models/CommissionRebate.js. */
    maxAmount: cfg.REBATE_MAX_AMOUNT,
    minSaleAmount: cfg.REBATE_MIN_SALE_AMOUNT,
    status: "ACTIVE",
    expiresAt: new Date(Date.now() + cfg.REBATE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
  };
}

async function notify(userId, message, meta) {
  try {
    await Notification.create({
      receiverUserId: userId,
      senderName: "Tokun",
      type: "REFERRAL_REWARD",
      message,
      meta,
    });
  } catch (err) {
    console.error("Referral notification failed:", err.message);
  }
}

/**
 * The invited creator's first sale has settled — pay out the referral.
 *
 * @returns {boolean} whether anything was issued
 */
async function qualifyReferral(referral, purchase) {
  // Blocked before anything is issued, and the reason is recorded so "where's
  // my reward?" has an answer.
  const block = async (reason) => {
    referral.status = "BLOCKED";
    referral.blockedReason = reason;
    await referral.save();
    console.log(`[Referral] ${referral._id} blocked: ${reason}`);
    return false;
  };

  if (await sharesPayoutIdentity(referral.referrerId, referral.referredId)) {
    return block("same_payout_identity");
  }

  if ((await rewardsThisMonth(referral.referrerId)) >= cfg.MAX_REWARDS_PER_MONTH) {
    return block("referrer_monthly_cap");
  }

  const [referrer, referred] = await Promise.all([
    User.findById(referral.referrerId).select("name sellerStatus isDeleted").lean(),
    User.findById(referral.referredId).select("name sellerStatus isDeleted").lean(),
  ]);

  if (!referrer || referrer.isDeleted || referrer.sellerStatus === "SUSPENDED") {
    return block("referrer_not_eligible");
  }
  if (!referred || referred.isDeleted || referred.sellerStatus === "SUSPENDED") {
    return block("referred_not_eligible");
  }

  /* ONE reward for the invited person — whichever they reach first.

     They are handed a welcome discount the moment they sign up, and they reach
     this line by making their first SALE. Issue the commission-free sale
     unconditionally and someone who had already spent the discount on a
     purchase collects twice off a single invite, both halves out of Tokun's cut
     on sales it never chose.

     So the two are mutually exclusive, resolved by whichever came first:
       purchase completed (USED)    → no sale-side credit; nothing to revoke
       anything else                → sale-side credit issued, and the discount
                                      is revoked so it can't be spent later as
                                      a second reward

     Only a completed purchase counts as taken. A RESERVED credit is an order
     that was built and not paid for, which is not a reward anybody received —
     see UNSPENT above.

     The REFERRER's credit is untouched by any of this: theirs is earned for
     making the introduction, and it is the only thing they ever get. */
  const welcome = await CommissionRebate.findOne({
    userId: referral.referredId,
    kind: "buyer_discount",
  })
    .sort({ createdAt: -1 })
    .lean();

  const welcomeTaken = welcome?.status === "USED";

  const toIssue = [rebateDoc(referral.referrerId, referral._id, "referrer")];
  if (!welcomeTaken) toIssue.push(rebateDoc(referral.referredId, referral._id, "referred"));

  await CommissionRebate.create(toIssue);

  if (!welcomeTaken && welcome && UNSPENT.includes(welcome.status)) {
    /* Held-but-unpaid is revoked along with untouched: the sale got there
       first, so the discount was never theirs to spend. The guard keeps it
       from stepping on a purchase that settles in the same moment. */
    await CommissionRebate.updateOne(
      { _id: welcome._id, status: { $in: UNSPENT } },
      { $set: { status: "REVOKED", reservedAt: null, reservedForOrderId: "" } }
    );
  }

  /* The invited creator's other half of the reward. On the User rather than
     each Prompt, so listings they upload during the boost window are covered
     too — see the sort in GET /api/prompt/others. */
  const boostUntil = new Date(Date.now() + cfg.BOOST_DAYS * 24 * 60 * 60 * 1000);
  await User.updateOne(
    { _id: referral.referredId },
    { $set: { marketplaceBoostUntil: boostUntil } }
  );

  referral.status = "QUALIFIED";
  referral.qualifyingPurchaseId = purchase._id;
  referral.qualifiedAt = new Date();
  await referral.save();

  await notify(
    referral.referrerId,
    `${referred.name || "Someone you invited"} made their first sale — your next prompt sale is commission-free.`,
    { referralId: String(referral._id) }
  );
  /* Worded from what they actually got. Promising a commission-free sale to
     someone who spent their reward on a purchase is the kind of message that
     turns a perk into a support ticket. */
  await notify(
    referral.referredId,
    welcomeTaken
      ? `Your first sale is in, and your products are featured for ${cfg.BOOST_DAYS} days. Your Refer & Earn reward went to your welcome discount.`
      : `Your first sale is in. Your next one is commission-free, and your products are featured for ${cfg.BOOST_DAYS} days.`,
    { referralId: String(referral._id) }
  );

  console.log(
    `[Referral] ${referral._id} qualified — ${toIssue.length} rebate(s) issued` +
      (welcomeTaken ? " (invitee already spent their welcome discount)." : ".")
  );
  return true;
}

/* ────────────────────── SPENDING A CREDIT ────────────────────── */

/*
 * How the reward is actually delivered.
 *
 * Not as a wallet credit — that was my first attempt and it was wrong. A prompt
 * seller's money never touches the internal Wallet: `Wallet.creditSale` exists
 * only in commented-out code, and every payout is a Razorpay Route transfer
 * straight to their linked bank account. Rebating into the Wallet would have
 * parked the reward somewhere a prompt seller has no reason to look, reachable
 * only through a withdrawal flow they've never used.
 *
 * So the credit does what it says on the tin: Tokun's 10% is left out of the
 * transfer split when the ORDER is created, and Razorpay pays the creator the
 * full list price in the same payout as every other sale. One payment, one
 * settlement, nothing to reconcile.
 *
 * That timing is what forces the reserve/consume dance below. The split is
 * fixed before the buyer has paid — or decided not to — so a credit has to be
 * held while checkout is open and released if the buyer walks away.
 */

/**
 * Is this seller's next sale commission-free?
 *
 * Called while an order is being built. Holds the credit so a second checkout
 * on the same seller, opened seconds later, can't spend it too.
 *
 * @returns {object|null} the reserved credit
 */
async function reserveCreditForOrder({ sellerId, listPrice }) {
  const now = new Date();

  /* Claimed with a conditional update rather than find-then-save: two buyers
     opening checkout on the same seller in the same second would both pass a
     plain read, and both orders would be built commission-free. */
  const credit = await CommissionRebate.findOneAndUpdate(
    {
      userId: sellerId,
      kind: "seller_commission",
      status: "ACTIVE",
      expiresAt: { $gt: now },
      minSaleAmount: { $lte: listPrice },
    },
    { $set: { status: "RESERVED", reservedAt: now, reservedForOrderId: "" } },
    { sort: { expiresAt: 1 }, new: true } // the one closest to expiring
  );

  return credit || null;
}

/**
 * Bind a reservation to the Razorpay order that came back.
 *
 * Split from reserveCreditForOrder because the order id doesn't exist until
 * after the order is created, and the credit has to be held before that.
 */
async function bindCreditToOrder(creditId, razorpayOrderId) {
  await CommissionRebate.updateOne(
    { _id: creditId, status: "RESERVED" },
    { $set: { reservedForOrderId: String(razorpayOrderId || "") } }
  );
}

/**
 * The buyer paid — the reward has been delivered by the transfer itself.
 *
 * Called from POST /verify. There is no money to move here: Razorpay already
 * sent the creator the full amount. This only closes the credit out.
 */
async function consumeReservedCredit({ sellerId, razorpayOrderId, purchaseId, amountWaived, promptTitle }) {
  const credit = await CommissionRebate.findOneAndUpdate(
    {
      userId: sellerId,
      kind: "seller_commission",
      status: "RESERVED",
      reservedForOrderId: String(razorpayOrderId || ""),
    },
    {
      $set: {
        status: "USED",
        usedOnPurchaseId: purchaseId,
        amountPaid: amountWaived,
        paidAt: new Date(),
        reservedAt: null,
      },
    },
    { new: true }
  );

  if (!credit) return null;

  await notify(
    sellerId,
    `Refer & Earn: no Tokun commission on "${promptTitle}" — the full ₹${Number(amountWaived).toFixed(2)} extra went straight to your bank with the sale.`,
    { purchaseId: String(purchaseId), waived: amountWaived }
  );

  console.log(`[Referral] Credit ${credit._id} spent — ₹${amountWaived} commission waived.`);
  return credit;
}

/* ───────────────────── THE BUYER'S SIDE ───────────────────── */

/* The welcome discount belongs to the buyer until they actually spend it.
 *
 * "Spent" means one of exactly two things: a purchase completed (USED), or their
 * first sale settled and the reward went there instead (REVOKED, see
 * qualifyReferral). Anything else and it is still theirs.
 *
 * RESERVED is NOT spent. It only means an order was built with it, which happens
 * before the buyer has paid or walked away — so treating it as gone made an
 * abandoned checkout eat the discount: the coupon disappeared from the review
 * dialog and the next order was billed at full price, for as long as an hour,
 * over a purchase that never happened.
 *
 * So every read that asks "does this buyer still have their discount?" matches
 * both, and a new checkout simply moves the hold to the new order.
 */
const UNSPENT = ["ACTIVE", "RESERVED"];

/**
 * What a welcome discount is worth on one sale.
 *
 * Three ceilings, and the last one is load-bearing.
 *
 * The discount comes out of Tokun's cut, never the seller's — the seller's
 * transfer is built from the undiscounted split and must still fit inside what
 * the buyer pays. Discount more than Tokun's whole cut and the transfer exceeds
 * the payment, which Razorpay rejects outright.
 *
 * Pulled out into its own function because two callers need the identical
 * answer: reserveBuyerDiscount, which builds the order, and previewBuyerDiscount,
 * which is what the checkout modal shows. A second copy of this arithmetic is a
 * modal that promises one figure and a card that gets charged another.
 */
function buyerDiscountAmount({ buyerPays, tokunCut, percent, maxAmount }) {
  const raw = (Number(buyerPays) * Number(percent)) / 100;
  return +Math.min(raw, Number(maxAmount), Number(tokunCut)).toFixed(2);
}

/**
 * The same answer as reserveBuyerDiscount, with nothing claimed.
 *
 * The checkout modal has to name the figure before the buyer commits, and a
 * preview that reserved the credit would burn it every time somebody opened the
 * dialog and thought better of it.
 *
 * It reads the seller's reward too, because at checkout that one is settled
 * first and comes out of the same pot — ignore it and the modal would offer a
 * discount the order can't fund.
 *
 * @param {object} split the output of splitPromptSale for this listing
 * @returns {{discount:number, percent:number, maxAmount:number, expiresAt:Date}|null}
 */
async function previewBuyerDiscount({ buyerId, sellerId, split }) {
  const now = new Date();

  const credit = await CommissionRebate.findOne({
    userId: buyerId,
    kind: "buyer_discount",
    status: { $in: UNSPENT }, // a held-but-unpaid checkout still counts as theirs
    expiresAt: { $gt: now },
  })
    .sort({ expiresAt: 1 }) // the one closest to expiring, as the reserve does
    .lean();

  if (!credit) return null;

  const sellerCredit = await CommissionRebate.findOne({
    userId: sellerId,
    kind: "seller_commission",
    status: "ACTIVE",
    expiresAt: { $gt: now },
    minSaleAmount: { $lte: split.listPrice },
  })
    .sort({ expiresAt: 1 })
    .lean();

  const waived = sellerCredit ? Math.min(split.sellerFee, sellerCredit.maxAmount) : 0;
  const tokunCut = +(split.platformCut - waived).toFixed(2);

  const discount = buyerDiscountAmount({
    buyerPays: split.buyerPays,
    tokunCut,
    percent: credit.discountPercent,
    maxAmount: credit.maxAmount,
  });

  if (discount <= 0) return null;

  return {
    discount,
    percent: credit.discountPercent,
    maxAmount: credit.maxAmount,
    expiresAt: credit.expiresAt,
  };
}

/**
 * Does this buyer have a welcome discount to spend on this order?
 *
 * @param {number} buyerPays what the buyer would pay without it
 * @param {number} tokunCut  Tokun's total take on the sale — the ceiling
 * @returns {{credit: object, discount: number}|null}
 */
async function reserveBuyerDiscount({ buyerId, buyerPays, tokunCut }) {
  const now = new Date();

  /* Re-holds a credit this buyer already had reserved, rather than passing over
     it. That reservation is one of their own abandoned checkouts — the hold
     moves to the new order and the discount is theirs again.

     Unlike the seller's credit, where matching only ACTIVE is what stops TWO
     DIFFERENT buyers building commission-free orders off one seller's credit,
     this one is scoped to a single account: the only person who can hold it is
     the person it belongs to. The cost is a buyer who deliberately keeps two
     discounted payment sheets open and pays both — the first payment burns the
     credit (see consumeBuyerDiscount) and the second gets a discount with
     nothing behind it. One extra discount, capped, and it takes intent. Losing
     the coupon over a cancelled purchase was hitting everyone, by accident. */
  const credit = await CommissionRebate.findOneAndUpdate(
    {
      userId: buyerId,
      kind: "buyer_discount",
      status: { $in: UNSPENT },
      expiresAt: { $gt: now },
    },
    { $set: { status: "RESERVED", reservedAt: now, reservedForOrderId: "" } },
    { sort: { expiresAt: 1 }, new: true }
  );

  if (!credit) return null;

  // Same arithmetic the checkout modal previewed with — see buyerDiscountAmount.
  const discount = buyerDiscountAmount({
    buyerPays,
    tokunCut,
    percent: credit.discountPercent,
    maxAmount: credit.maxAmount,
  });

  if (discount > 0) {
    /* Parked on the credit so /verify reads back the exact figure the order was
       built with. Recomputing there would risk a rounding difference between
       what Razorpay charged and what gets recorded. */
    await CommissionRebate.updateOne({ _id: credit._id }, { $set: { amountPaid: discount } });
  }

  if (discount <= 0) {
    // Nothing to give on this sale — hand the credit straight back.
    await CommissionRebate.updateOne(
      { _id: credit._id, status: "RESERVED" },
      { $set: { status: "ACTIVE", reservedAt: null } }
    );
    return null;
  }

  return { credit, discount };
}

/** The buyer paid the reduced amount — close the discount out. */
async function consumeBuyerDiscount({ buyerId, razorpayOrderId, purchaseId, discount }) {
  const spend = {
    $set: {
      status: "USED",
      usedOnPurchaseId: purchaseId,
      amountPaid: discount,
      paidAt: new Date(),
      reservedAt: null,
    },
  };

  /* This order's own hold first. */
  let credit = await CommissionRebate.findOneAndUpdate(
    {
      userId: buyerId,
      kind: "buyer_discount",
      status: "RESERVED",
      reservedForOrderId: String(razorpayOrderId || ""),
    },
    spend,
    { new: true }
  );

  /* Failing that, whatever unspent discount they still hold.

     Reachable because a later checkout moves the hold (see
     reserveBuyerDiscount): the buyer opens order A, opens order B, then pays A
     — the credit is bound to B by then, so matching on the order id alone would
     find nothing and a discount that WAS given would go unrecorded. Recording
     it against the sale that actually happened is what makes the next order
     find no credit, which is the whole point of spending it.

     Safe against double-spend by construction: the update matches only unspent
     statuses, so the second of two settled orders finds nothing left. */
  if (!credit) {
    credit = await CommissionRebate.findOneAndUpdate(
      {
        userId: buyerId,
        kind: "buyer_discount",
        status: { $in: UNSPENT },
      },
      spend,
      { sort: { expiresAt: 1 }, new: true }
    );
  }

  if (credit) {
    await notify(
      buyerId,
      `Your Refer & Earn welcome discount saved you ₹${Number(discount).toFixed(2)} on this purchase.`,
      { purchaseId: String(purchaseId), discount }
    );
  }

  return credit;
}

/**
 * Checkout was opened and abandoned. Give the credit back.
 *
 * Razorpay orders don't tell us they were abandoned, so this is time-based:
 * anything reserved longer than a checkout could plausibly stay open is free
 * again. Swept by cron/referralSettlement.js.
 */
/**
 * The buyer closed the payment sheet without paying — hand their credits back
 * now instead of waiting for the timer.
 *
 * Without this a checkout that was opened and dismissed held the welcome
 * discount as RESERVED for up to an hour, and RESERVED is invisible to both the
 * checkout preview and the next order: the coupon vanished from the dialog and
 * the next attempt was billed at full price. From the buyer's side they had
 * cancelled a purchase and lost a discount they never spent.
 *
 * Scoped to the exact Razorpay order, so it can only ever release what that one
 * checkout reserved. The buyer's own credit is matched on their user id too;
 * the seller's is matched through the listing, since a buyer holds no claim on
 * it beyond having opened this order.
 *
 * @returns {number} how many reservations were released
 */
async function releaseCheckoutReservations({ buyerId, sellerId, razorpayOrderId }) {
  const orderId = String(razorpayOrderId || "");
  if (!orderId) return 0;

  const back = { $set: { status: "ACTIVE", reservedAt: null, reservedForOrderId: "" } };

  const [buyer, seller] = await Promise.all([
    CommissionRebate.updateMany(
      {
        userId: buyerId,
        kind: "buyer_discount",
        status: "RESERVED",
        reservedForOrderId: orderId,
      },
      back
    ),
    sellerId
      ? CommissionRebate.updateMany(
          {
            userId: sellerId,
            kind: "seller_commission",
            status: "RESERVED",
            reservedForOrderId: orderId,
          },
          back
        )
      : Promise.resolve({ modifiedCount: 0 }),
  ]);

  return (buyer.modifiedCount || 0) + (seller.modifiedCount || 0);
}

async function releaseStaleReservations(minutes = 60) {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);

  const res = await CommissionRebate.updateMany(
    { status: "RESERVED", reservedAt: { $lte: cutoff } },
    { $set: { status: "ACTIVE", reservedAt: null, reservedForOrderId: "" } }
  );

  return res.modifiedCount || 0;
}

/* ──────────────────────────── THE SWEEP ──────────────────────────── */

/**
 * Process every prompt sale that has outlived its refund window.
 *
 * Order matters inside the loop: a rebate is spent BEFORE a new one can be
 * issued for the same sale, so the sale that earns a credit never also spends
 * it. The reward is for the NEXT sale, which is what was promised.
 */
async function settleReferralsForPurchase(purchase) {
  const prompt = await Prompt.findById(purchase.prompt).select("title userId price free");
  if (!prompt) return;

  /* Credits are spent at checkout now, not here — see reserveCreditForOrder.
     All this job still does is decide whether a settled sale QUALIFIES a
     referral, which is a question only time can answer. */

  // Does this sale qualify the seller's own referral? Only their first.
  try {
    const referral = await Referral.findOne({ referredId: prompt.userId, status: "PENDING" });
    if (referral) await qualifyReferral(referral, purchase);
  } catch (err) {
    console.error(`[Referral] Qualification failed for purchase ${purchase._id}:`, err.message);
  }
}

/** Expire credits nobody spent, so the outstanding liability stays bounded. */
async function expireOldCredits() {
  const res = await CommissionRebate.updateMany(
    { status: "ACTIVE", expiresAt: { $lte: new Date() } },
    { $set: { status: "EXPIRED" } }
  );
  return res.modifiedCount || 0;
}

module.exports = {
  getOrCreateReferralCode,
  attachReferral,
  settleReferralsForPurchase,
  expireOldCredits,
  qualifyReferral,
  reserveCreditForOrder,
  bindCreditToOrder,
  consumeReservedCredit,
  reserveBuyerDiscount,
  previewBuyerDiscount,
  consumeBuyerDiscount,
  releaseCheckoutReservations,
  releaseStaleReservations,
};
