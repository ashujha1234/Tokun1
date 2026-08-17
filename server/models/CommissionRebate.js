const mongoose = require("mongoose");

/**
 * "One prompt sale with no Tokun commission."
 *
 * The reward both sides of a qualified referral receive. It is spent where the
 * money is actually divided: POST /api/purchase/create-order builds the
 * Razorpay Route transfer, and when the seller holds a credit that transfer
 * carries the FULL list price instead of the usual 90%. Razorpay pays them the
 * extra in the same settlement as every other sale.
 *
 * An earlier version credited the difference to the internal Wallet instead.
 * That was wrong: a prompt seller's money never passes through the Wallet —
 * `Wallet.creditSale` survives only in commented-out code — so the reward would
 * have landed somewhere they have no reason to look, reachable only through a
 * withdrawal flow they've never used.
 *
 * Statuses:
 *   ACTIVE  — waiting for a sale big enough to be worth spending it on
 *   USED    — paid out; `usedOnPurchaseId` says which sale
 *   EXPIRED — nobody sold anything in time
 *   REVOKED — the account was suspended, or an admin pulled it
 */
const CommissionRebateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    source: { type: String, enum: ["referral"], default: "referral" },

    /* Two rewards, one shape — both are "a credit this user holds, spent once,
       capped, expiring", so they share a collection rather than duplicating the
       reserve/consume/expire machinery twice.

       seller_commission — the creator sells and Tokun takes no commission
       buyer_discount    — the invited person buys and pays less, out of
                           TOKUN's cut; the seller is paid in full either way */
    kind: {
      type: String,
      enum: ["seller_commission", "buyer_discount"],
      default: "seller_commission",
      index: true,
    },
    referralId: { type: mongoose.Schema.Types.ObjectId, ref: "Referral", default: null },
    /* Which side of the referral earned it — only used to word the notification
       ("your invite went live" vs "you went live"). */
    role: { type: String, enum: ["referrer", "referred"], required: true },

    /* buyer_discount only: the percentage off, and what it's capped at. Kept
       separate from percentOfCommission below, which means something else. */
    discountPercent: { type: Number, default: 0 },

    /* The terms, COPIED from config/referral.js at issue time rather than read
       live. A credit issued under a ₹500 cap must keep its ₹500 cap even if the
       cap is lowered next month — otherwise the promise made to the creator
       changes after they've earned it. */
    percentOfCommission: { type: Number, default: 100 },
    maxAmount: { type: Number, required: true },
    minSaleAmount: { type: Number, required: true },

    status: {
      type: String,
      /* RESERVED is the checkout window. The transfer split is decided when the
         order is created, before the buyer has paid or walked away, so a credit
         has to be held from that moment — otherwise two checkouts opened
         seconds apart would both be built commission-free off one credit.
         Reservations that never turn into a payment are released on a timer
         (releaseStaleReservations). */
      enum: ["ACTIVE", "RESERVED", "USED", "EXPIRED", "REVOKED"],
      default: "ACTIVE",
      index: true,
    },
    reservedAt: { type: Date, default: null },
    /* The Razorpay order this reservation belongs to, written once the order
       exists. Consumption matches on it EXACTLY.

       Matching on "this seller has something reserved" instead would misfire:
       buyer A opens checkout and abandons it, buyer B opens one (no credit left
       to reserve, so B's order is built at the normal split), B pays — and the
       verify step would find A's stale reservation and record B's sale as
       commission-free when Razorpay had already transferred the normal amount. */
    reservedForOrderId: { type: String, default: "", index: true },
    expiresAt: { type: Date, required: true },

    // Set when it pays out.
    usedOnPurchaseId: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase", default: null },
    amountPaid: { type: Number, default: 0 },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// The hot read: "does this seller have a credit waiting?"
CommissionRebateSchema.index({ userId: 1, status: 1, expiresAt: 1 });

module.exports = mongoose.model("CommissionRebate", CommissionRebateSchema);
