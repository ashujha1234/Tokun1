// services/escrowSettlement.service.js
//
// The one place escrowed money is split when a booking ends without the work
// being approved — a cancellation, or a dispute an admin has ruled on.
//
// Shared by hire deals and service bookings because the arithmetic is
// identical; only the field names on the parent document differ, which the
// ORDER_KINDS table below absorbs. Duplicating this per model is how the two
// would quietly drift into disagreeing about who is owed what.
//
// ── The split ───────────────────────────────────────────────────────────────
//
// ALL OR NOTHING. `sellerPercent` accepts 0 or 100 and nothing in between.
//
// It used to accept any percentage, so a booking could end with the money cut
// down the middle. That satisfied nobody: a cancellation or a dispute is an
// argument about who was in the right, and answering "who was right" with 40%
// leaves both sides feeling cheated and leaves an admin inventing a number they
// can't defend. Every ending now pays exactly one party — the buyer is refunded
// in full, or the seller is paid in full — and the buyer-side platform fee is
// kept either way.
//
// The arithmetic below is unchanged and still written in terms of p, because
// the two endpoints are p = 0 and p = 1 and the formulae are what prove the
// parts add up. Only the values in between are rejected, at the top of
// settleEscrow().
//
// Given
//
//     A  = amount                        (the agreed price)
//     pf = platformFee + platformFeeGst  (seller-side commission, incl. its GST)
//     cf = clientFee   + clientFeeGst    (buyer-side platform fee, incl. its GST)
//     F  = sellerAmount = A − pf         (seller's full payout if approved)
//     T  = totalPayable = A + cf         (what the buyer actually paid)
//     p  = sellerPercent / 100
//
// then:
//
//     seller receives   F × p
//     buyer is refunded A × (1 − p)
//     Tokun keeps       cf + pf × p
//
// Those three add up to exactly T, so nothing is invented or lost:
//
//     F·p + A(1−p) + cf + pf·p
//   = p(F + pf) + A − A·p + cf
//   = p·A + A − A·p + cf           [since F + pf = A]
//   = A + cf  =  T                 ✓
//
// Two shapes matter here:
//
//   1. The seller-side COMMISSION scales with the work done. Cancel at 0% and
//      Tokun earns no commission — the right answer, nothing was delivered.
//
//   2. The buyer-side PLATFORM FEE does not scale, and is never refunded. It
//      pays for running the transaction — the escrow, the payment rails, the
//      dispute machinery — and all of that was consumed whether or not the work
//      arrived. So `cf` sits outside the pool being divided: only the agreed
//      price A is ever split or returned. A buyer cancelling a ₹10,000 booking
//      gets ₹10,000 back, not the ₹10,354 they paid.
//
// This is why the refund is measured against A rather than T. It used to be T,
// which handed the platform fee back on every cancellation.
//
// ── How that maps onto Razorpay ─────────────────────────────────────────────
//
// The buyer's whole payment is a Route transfer sitting on_hold against it —
// `routeHeldAmount` = T, not just the seller's share. So:
//
//   1. reverse (held − sellerPayout) off the transfer → returns to our balance
//   2. refund  the buyer's share out of that balance
//   3. release whatever is left on hold               → the seller's share
//
// Order matters twice over. Step 2 has no funds behind it until step 1 has run,
// AND step 3 releases everything still on hold — so anything step 1 fails to
// reverse is paid to the seller by step 3.
//
// That second point is why step 1 runs on every settlement, not only the ones
// that refund something. At p = 100 the refund is ₹0 but the hold still carries
// the buyer's non-refundable platform fee, which has to come back out before
// the rest is released.
//
// At p = 0 steps 1 and 2 collapse into a single refund with reverse_all, which
// is atomic and therefore preferred.
//
// With the split restricted to all-or-nothing, step 1 at p = 100 reverses
// exactly the buyer's platform fee and nothing else — which is precisely the
// rule "the winner gets everything except the platform fee".

const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const HireDeal = require("../models/HireDeal");
const ServiceOrder = require("../models/ServiceOrder");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const PlatformWallet = require("../models/PlatformWallet");
const { releaseTransfer } = require("../utils/routeEscrow");
const { reverseTransfer } = require("../utils/routePayouts");
const {
  sendFullRefundEmail,
  sendPartialRefundEmail,
  sendNoRefundEmail,
  sendSellerSettlementEmail,
} = require("./refundEmail.service");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

class EscrowNotSettleableError extends Error {
  // `code` is optional so callers that want to distinguish a specific refusal
  // (an out-of-range percent, say) from the generic one can.
  constructor(message, code) {
    super(message || "escrow_not_settleable");
    this.code = code || "ESCROW_NOT_SETTLEABLE";
  }
}

/**
 * The money moved but the order could not be marked settled.
 *
 * Distinct from every other failure here because the advice is the opposite:
 * do NOT retry. Retrying re-refunds. This exists because that case used to be
 * indistinguishable from "Razorpay rejected it", and callers told the user
 * "Nothing was changed — please try again" while a refund was already on its
 * way to their card.
 */
class EscrowSettledButNotRecordedError extends Error {
  constructor(message, details = {}) {
    super(message || "escrow_settled_but_not_recorded");
    this.code = "ESCROW_SETTLED_NOT_RECORDED";
    this.details = details;
  }
}

/* Everything that differs between the two order types. Adding a third kind of
   escrowed work later means one more entry here, not another copy of the
   arithmetic above. */
const ORDER_KINDS = {
  hire: {
    model: HireDeal,
    label: "hire deal",
    buyerField: "clientId",
    sellerField: "freelancerId",
    sellerAmountField: "freelancerAmount",
    titleField: "title",
    releasedFundsStatus: "RELEASED_TO_FREELANCER",
    refundedFundsStatus: "REFUNDED_TO_CLIENT",
    commissionSource: "hire_escrow",
    walletCredit: (sellerId, amount, order) =>
      Wallet.creditHireEscrow(sellerId, amount, { dealId: order._id, dealTitle: order.title }),
  },
  service: {
    model: ServiceOrder,
    label: "service booking",
    buyerField: "buyerId",
    sellerField: "sellerId",
    sellerAmountField: "sellerAmount",
    titleField: "serviceTitle",
    releasedFundsStatus: "RELEASED_TO_SELLER",
    refundedFundsStatus: "REFUNDED_TO_BUYER",
    commissionSource: "service_purchase",
    walletCredit: (sellerId, amount, order) =>
      Wallet.creditServiceSale(sellerId, amount, {
        orderId: order._id,
        serviceTitle: order.serviceTitle,
      }),
  },
};

function getKind(orderKind) {
  const kind = ORDER_KINDS[orderKind];
  if (!kind) throw new EscrowNotSettleableError(`unknown_order_kind:${orderKind}`);
  return kind;
}

/**
 * The three numbers, rounded to paise-safe rupees.
 *
 * Rounded independently and then the refund is derived as the remainder, so
 * rounding can never make the parts add up to more than the buyer actually
 * paid — over-refunding is money out of Tokun's own pocket.
 *
 * ── waiveCommission ────────────────────────────────────────────────────────
 *
 * Tokun earns its commission for delivering a completed job. A cancellation or
 * a dispute is not that, so it takes nothing: the ENTIRE amount the buyer paid
 * splits between the two parties and nothing is held back.
 *
 *   normal (waive = false)   seller = sellerFull × p, Tokun = fee + commission × p
 *   dispute (waive = true)   seller = amount × p,     Tokun = fee
 *
 * At p = 0 the two are identical — everything refundable has been refunded —
 * which is why cancellations looked correct before this existed. The difference
 * only shows at the other end: an admin ruling wholly for the freelancer used
 * to pay them sellerFull (₹2,850 of a ₹3,000 deal) while Tokun quietly kept
 * ₹150 of a job it had just adjudicated. Now they get the full ₹3,000.
 *
 * The waiver applies to the seller-side COMMISSION only. The buyer's platform
 * fee is non-refundable in every branch — there is no percentage at which it
 * comes back.
 */
function computeSplit(order, kind, sellerPercent, waiveCommission = false) {
  const p = Math.max(0, Math.min(100, Number(sellerPercent))) / 100;

  const totalPayable = Number(order.totalPayable || 0);
  const sellerFull = Number(order[kind.sellerAmountField] || 0);

  /* The buyer's platform fee and its GST. Kept whatever happens, so it never
     enters the pool being divided. Falls back to (totalPayable − amount) for
     orders written before clientFeeGst existed — on those the fee was whatever
     was charged on top of the agreed price, which is the same quantity. */
  const recordedFee = Number(order.clientFee || 0) + Number(order.clientFeeGst || 0);
  const agreedPrice = Number(order.amount || 0);
  const nonRefundableFee = +Math.max(
    0,
    // The fallback only applies when there IS a recorded price to subtract
    // from. Without that guard an order missing `amount` would treat the entire
    // payment as a non-refundable fee and refund the buyer nothing.
    recordedFee > 0 || agreedPrice <= 0 ? recordedFee : totalPayable - agreedPrice
  ).toFixed(2);

  // What's actually up for division: the agreed price, nothing more. On a
  // legacy order with no `amount` recorded this lands back on totalPayable,
  // which is the old behaviour.
  const divisible = +Math.max(0, totalPayable - nonRefundableFee).toFixed(2);

  const commissionNet = waiveCommission ? 0 : Number(order.platformFee || 0);
  const commissionGst = waiveCommission ? 0 : Number(order.platformFeeGst || 0);
  const commissionFull = commissionNet + commissionGst;

  // With the commission waived the seller's share is measured against the whole
  // divisible amount, not against what was left after Tokun's cut.
  const sellerBase = waiveCommission ? divisible : sellerFull;

  const sellerPayout = +(sellerBase * p).toFixed(2);
  const commissionKept = +(commissionFull * p).toFixed(2);
  // The remainder of the DIVISIBLE amount, not of the whole payment — the fee
  // above was already carved out. Derived rather than multiplied so rounding
  // can never refund more than was actually collected.
  const refundAmount = +Math.max(0, divisible - sellerPayout - commissionKept).toFixed(2);

  /* Tokun's take, separated into what it EARNED and what it merely COLLECTED.
     The GST half is owed to the government, so it must not reach
     PlatformWallet.totalRevenue ("lifetime commission earned") or
     availableBalance (what an admin may withdraw). Reporting the two as one
     number overstates a ₹10,000 job's margin by ₹234. */
  const gstKept = +(commissionGst * p + Number(order.clientFeeGst || 0)).toFixed(2);
  const platformRevenue = +(commissionNet * p + Number(order.clientFee || 0)).toFixed(2);

  return {
    p,
    sellerPayout,
    // Total cash Tokun retains — revenue plus tax collected. This is the figure
    // that reconciles: sellerPayout + commissionKept + refundAmount = totalPayable.
    commissionKept: +(commissionKept + nonRefundableFee).toFixed(2),
    platformRevenue,
    gstKept,
    refundAmount,
    sellerFull,
    totalPayable,
    nonRefundableFee,
  };
}

/**
 * Split (or fully refund, or fully release) one order's escrow and record it.
 *
 * @param {"hire"|"service"} orderKind
 * @param {string} orderId
 * @param {object} opts
 * @param {number} opts.sellerPercent  0–100
 * @param {string} opts.reason
 * @param {"buyer"|"seller"|"admin"} opts.actor  who caused this
 * @returns {Promise<{order: object, sellerPayout: number, refundAmount: number, refund: object|null}>}
 */
async function settleEscrow(orderKind, orderId, opts = {}) {
  const kind = getKind(orderKind);
  const { sellerPercent, reason = "", actor = "admin", waiveCommission = false } = opts;

  /* All-or-nothing, enforced here rather than at each caller so no future route
     can reintroduce a split by passing 37. Anything that isn't exactly 0 or 100
     is a bug in the caller, not a settlement to attempt. */
  if (Number(sellerPercent) !== 0 && Number(sellerPercent) !== 100) {
    throw new EscrowNotSettleableError(
      "A settlement pays one party in full — sellerPercent must be 0 (refund the buyer) or 100 (pay the seller).",
      "invalid_seller_percent"
    );
  }

  if (!Number.isFinite(Number(sellerPercent))) {
    throw new EscrowNotSettleableError("seller_percent_required");
  }

  const now = new Date();

  // ── Atomic claim ────────────────────────────────────────────────────────
  // Same guard the release path uses: only the caller whose update actually
  // matches a still-HELD document goes on to touch Razorpay. Two admins
  // clicking at once, or an admin racing the client's own accept, can't both
  // refund the same payment.
  const claimed = await kind.model.findOneAndUpdate(
    { _id: orderId, fundsStatus: "HELD_BY_TOKUN" },
    { $set: { fundsStatus: "DISPUTED" } },
    { new: true }
  );

  if (!claimed) {
    throw new EscrowNotSettleableError(
      "This booking's funds are no longer in escrow — they were already released or refunded."
    );
  }

  const split = computeSplit(claimed, kind, sellerPercent, waiveCommission);
  const revert = async (errMessage) => {
    await kind.model.updateOne(
      { _id: orderId },
      { $set: { fundsStatus: "HELD_BY_TOKUN", routeTransferError: String(errMessage || "").slice(0, 500) } }
    );
  };

  let refund = null;

  /* What the Route transfer is actually holding.
     Orders funded after the escrow started holding the whole payment record it;
     older ones don't, and for those the hold is the seller's post-commission
     share, which is what it always was. */
  const heldAmount = Number(claimed.routeHeldAmount) || Number(split.sellerFull) || 0;

  try {
    const hasTransfer = Boolean(claimed.routeTransferId);
    const refundsAnything = split.refundAmount > 0;
    const paysSellerAnything = split.sellerPayout > 0;

    /* Checked before anything moves. The reversal below is not undoable by a
       retry — reversing twice takes the money out twice — so a settlement that
       is going to fail for want of a payment id has to fail while the hold is
       still untouched. */
    if (refundsAnything && !claimed.razorpayPaymentId) {
      throw new EscrowNotSettleableError(
        "This booking has no Razorpay payment on record, so no refund can be issued."
      );
    }

    // p = 0 with a Route transfer: reverse_all does the reversal and the refund
    // in one call, so there's no window where the transfer is reversed but the
    // buyer hasn't been paid back. Everything else reverses explicitly below.
    const fullRefund = refundsAnything && !paysSellerAnything;

    /* Free up everything the seller ISN'T owed, before anything else needs it.
       Two things depend on this having run: a refund has no funds behind it
       otherwise, and `releaseTransfer` below lets go of whatever is still on
       hold — so anything not reversed here reaches the seller.

       Measured against what the transfer ACTUALLY HOLDS, not against the
       seller's post-commission share. The hold carries the WHOLE payment
       (routeHeldAmount = totalPayable), so at 100% to the seller this still has
       the buyer's non-refundable platform fee to take back out. Older orders
       hold only the seller's share and `heldAmount` falls back to that, so
       their arithmetic is unchanged.

       This deliberately runs whether or not there is also a refund. It used to
       live inside the refund branch, which meant a 100% ruling — where the
       refund is ₹0 — skipped it entirely and released the full hold: on a ₹200
       booking the creator was paid ₹206, keeping the ₹6 platform fee that is
       non-refundable in every branch.

       Clamped at zero: on a legacy order with the commission waived the seller
       can be owed more than the hold carries, and asking Razorpay to reverse a
       negative amount is not a thing. */
    const reverseAmount = +Math.max(0, heldAmount - split.sellerPayout).toFixed(2);
    if (hasTransfer && paysSellerAnything && !fullRefund && reverseAmount > 0) {
      await reverseTransfer(claimed.routeTransferId, reverseAmount);
    }

    if (refundsAnything) {
      refund = await razorpay.payments.refund(claimed.razorpayPaymentId, {
        amount: Math.round(split.refundAmount * 100),
        notes: {
          reason: String(reason || "Escrow settlement").slice(0, 200),
          orderKind,
          orderId: String(orderId),
          sellerPercent: String(sellerPercent),
        },
        ...(hasTransfer && fullRefund ? { reverse_all: 1 } : {}),
      });
    }

    if (paysSellerAnything) {
      if (hasTransfer) {
        // Whatever survived the reversal above is exactly the seller's share.
        await releaseTransfer(claimed.routeTransferId);

        /* Legacy orders only.
           An order funded after the escrow started holding the whole payment
           can always pay the seller out of the hold, so this is 0 and nothing
           happens. Orders funded BEFORE that hold only the seller's
           post-commission share — ₹2,850 of a ₹3,000 deal — and a ruling wholly
           in their favour owes them the full ₹3,000.

           That ₹150 gap cannot be sent over Route. The obvious call is a direct
           transfer from our balance to their linked account, and it answers:

             POST /v1/transfers { account: acc_…, amount: … }
             → "This feature is not enabled for this merchant."

           Transfers from account balance are a separately-gated feature, unlike
           the payment-linked transfers everything else here uses. So for these
           older orders the remainder goes to the seller's Tokun wallet, which
           they can withdraw from. New orders never reach this. */
        const topUp = +Math.max(0, split.sellerPayout - heldAmount).toFixed(2);
        if (topUp > 0) {
          try {
            await kind.walletCredit(claimed[kind.sellerField], topUp, claimed);
            console.log(
              `[Settlement] legacy hold on ${orderKind} ${orderId}: ₹${topUp} credited to the ` +
                `seller's Tokun wallet (the Route hold could only carry ₹${heldAmount}).`
            );
          } catch (topUpErr) {
            // Loud, but not fatal: the seller already has everything the hold
            // could carry, and this remainder is recoverable by hand.
            console.error(
              `SETTLEMENT TOP-UP FAILED — ${orderKind} ${orderId}: ₹${topUp} was not credited.`,
              topUpErr.message
            );
          }
        }
      } else {
        // Booked before Route escrow shipped — that money really is in the
        // internal ledger, so it settles the old way.
        await kind.walletCredit(claimed[kind.sellerField], split.sellerPayout, claimed);
      }
    }
  } catch (err) {
    // Nothing has reached the seller (the transfer is still on hold) and, if
    // the refund itself threw, nothing has reached the buyer either. Putting
    // the order back to HELD_BY_TOKUN makes the whole settlement retryable
    // rather than leaving it in a state that claims money moved.
    await revert(err?.message);
    throw err;
  }

  // ── Everything below is bookkeeping: the money has already moved, so a
  // failure here is logged rather than thrown. Rolling the order back now would
  // claim the escrow is still held when it demonstrably isn't.
  try {
    const settlementNote = `Settlement (${sellerPercent}%): "${claimed[kind.titleField] || kind.label}"`;

    // Revenue and tax are recorded separately — the GST half never touches the
    // withdrawable balance.
    if (split.platformRevenue > 0) {
      await PlatformWallet.recordCommission(split.platformRevenue, {
        source: kind.commissionSource,
        refId: claimed._id,
        description: settlementNote,
      });
    }

    if (split.gstKept > 0) {
      await PlatformWallet.recordGst(split.gstKept, {
        source: kind.commissionSource,
        refId: claimed._id,
        description: `GST — ${settlementNote}`,
      });
    }
  } catch (commissionErr) {
    console.error("PlatformWallet commission record failed (settlement):", commissionErr.message);
  }

  try {
    if (split.sellerPayout > 0) {
      await User.findByIdAndUpdate(claimed[kind.sellerField], {
        $inc: { totalEarnings: split.sellerPayout },
      });
    }
  } catch (statsErr) {
    console.error("Seller earnings stat update failed (settlement):", statsErr.message);
  }

  const isFullRefund = split.sellerPayout <= 0;
  const isFullRelease = split.refundAmount <= 0;

  const finalUpdate = {
    status: isFullRefund ? "REFUNDED" : isFullRelease ? "COMPLETED" : "SETTLED",
    fundsStatus: isFullRefund
      ? kind.refundedFundsStatus
      : isFullRelease
      ? kind.releasedFundsStatus
      : "PARTIALLY_SETTLED",
    settlementSellerPercent: Number(sellerPercent),
    settlementSellerPayout: split.sellerPayout,
    refundAmount: split.refundAmount,
    cancelledBy: actor,
    cancelledAt: now,
    routeTransferError: "",
  };
  if (split.refundAmount > 0) {
    finalUpdate.refundedAt = now;
    if (refund?.id) finalUpdate.razorpayRefundId = refund.id;
  }
  if (split.sellerPayout > 0 && claimed.routeTransferId) {
    finalUpdate.routeTransferStatus = "released";
    finalUpdate.transferReleasedAt = now;
  }
  // HireDeal spells this one differently and ServiceOrder doesn't have it;
  // setting a path a schema doesn't declare is simply ignored by Mongoose.
  if (reason) finalUpdate.cancelReason = reason;
  if (orderKind === "hire" && reason) finalUpdate.refundReason = reason;

  /* Same rule as the bookkeeping block above — the money has already moved, so
     this must not surface as a retryable "nothing happened". It is the one write
     that isn't optional, though: without it the order still reads HELD/DISPUTED
     and nobody can tell the settlement ran. So: try, then say precisely what
     went wrong. */
  let order;
  try {
    order = await kind.model.findByIdAndUpdate(orderId, { $set: finalUpdate }, { new: true });
  } catch (writeErr) {
    console.error(
      `SETTLEMENT RECORDED-STATE FAILURE — money HAS moved for ${orderKind} ${orderId}. ` +
        `refund=${split.refundAmount} sellerPayout=${split.sellerPayout} razorpayRefundId=${refund?.id || "-"}`,
      writeErr
    );
    throw new EscrowSettledButNotRecordedError(
      "The refund and payout went through, but this booking couldn't be marked settled. " +
        "Do not retry — that would refund a second time. Support has the details.",
      {
        orderKind,
        orderId: String(orderId),
        refundAmount: split.refundAmount,
        sellerPayout: split.sellerPayout,
        razorpayRefundId: refund?.id || null,
        cause: writeErr?.message,
      }
    );
  }

  // ── Receipts. Sent from here rather than from each caller so every route
  // into a settlement — mutual agreement, admin ruling, seller walkaway —
  // produces the same email. Best-effort: the money has already moved, and a
  // mail failure must not make a completed settlement look like it failed.
  try {
    const [buyer, seller] = await Promise.all([
      User.findById(claimed[kind.buyerField]).select("name email"),
      User.findById(claimed[kind.sellerField]).select("name email"),
    ]);
    const itemTitle = claimed[kind.titleField] || kind.label;
    const decidedBy = actor === "admin" ? "admin" : "mutual";

    /* Every outcome is emailed, to both sides.
       All three of these used to be gated on `refundAmount > 0`, so a ruling
       wholly in the creator's favour — the single most contested outcome there
       is — sent NOBODY anything. The creator was paid without being told, and
       the client, who had just lost the whole amount, heard nothing at all.
       That gate made sense when a 100% settlement meant an ordinary completion;
       this function is only ever reached by a cancellation or a dispute. */
    if (split.refundAmount > 0 && split.sellerPayout <= 0) {
      await sendFullRefundEmail({
        to: buyer?.email,
        buyerName: buyer?.name,
        itemTitle,
        amount: split.refundAmount,
        reason,
        referenceId: refund?.id,
      });
    } else if (split.refundAmount > 0) {
      await sendPartialRefundEmail({
        to: buyer?.email,
        buyerName: buyer?.name,
        itemTitle,
        refundAmount: split.refundAmount,
        sellerPayout: split.sellerPayout,
        sellerPercent: Number(sellerPercent),
        totalPaid: split.totalPayable,
        decidedBy,
        note: reason,
        referenceId: refund?.id,
      });
    } else {
      // Nothing coming back. Its own email because the refund templates all
      // open with "your refund is on its way", which is the opposite of what
      // happened here.
      await sendNoRefundEmail({
        to: buyer?.email,
        buyerName: buyer?.name,
        itemTitle,
        totalPaid: split.totalPayable,
        sellerPayout: split.sellerPayout,
        decidedBy,
        note: reason,
      });
    }

    await sendSellerSettlementEmail({
      to: seller?.email,
      sellerName: seller?.name,
      itemTitle,
      sellerPayout: split.sellerPayout,
      sellerPercent: Number(sellerPercent),
      fullAmount: split.sellerFull,
      decidedBy,
      note: reason,
    });
  } catch (mailErr) {
    console.error("Settlement email failed (settlement itself succeeded):", mailErr.message);
  }

  return {
    order,
    sellerPayout: split.sellerPayout,
    refundAmount: split.refundAmount,
    commissionKept: split.commissionKept,
    refund,
  };
}

/** Convenience wrapper: buyer gets everything back, seller gets nothing. */
function refundEscrowFully(orderKind, orderId, opts = {}) {
  return settleEscrow(orderKind, orderId, { ...opts, sellerPercent: 0 });
}

/**
 * What a given split would pay out, without moving anything. Backs the
 * "you'll get ₹X, they'll get ₹Y" preview on the settlement screen so nobody
 * agrees to a percentage without seeing the rupees.
 */
function previewSettlement(order, orderKind, sellerPercent, waiveCommission = true) {
  const kind = getKind(orderKind);
  /* Defaults to waiving, because every caller of this is a preview of a
     CANCELLATION or a DISPUTE — the admin queue's rupee ladder and the figure
     shown to a client deciding whether to accept a creator's claim. Showing a
     number the settlement won't actually pay is the one thing a preview must
     never do. */
  const split = computeSplit(order, kind, sellerPercent, waiveCommission);
  return {
    sellerPercent: Number(sellerPercent),
    sellerPayout: split.sellerPayout,
    refundAmount: split.refundAmount,
    platformKeeps: split.commissionKept,
  };
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

module.exports = {
  settleEscrow,
  refundEscrowFully,
  previewSettlement,
  computeSplit,
  ORDER_KINDS,
  getKind,
  EscrowNotSettleableError,
  EscrowSettledButNotRecordedError,
  isValidObjectId,
};
