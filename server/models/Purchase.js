// const mongoose = require("mongoose");

// const PurchaseSchema = new mongoose.Schema({
//   buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   prompt: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", required: true },
//   pricePaid: { type: Number, required: true },
//   razorpayPaymentId: { type: String },
//   paymentStatus: { type: String, enum: ["SUCCESS", "FAILED", "PENDING"], default: "PENDING" },
//   purchasedAt: { type: Date, default: Date.now },
//   promptSnapshot: { // store snapshot for deleted prompts
//     title: String,
//     description: String,
//     promptText: String,
//     attachment: Object,
//     uploadCode: [Object],
//   },
//   { timestamps: true } ,// ✅ ADD THIS
// });

// module.exports = mongoose.model("Purchase", PurchaseSchema);


const mongoose = require("mongoose");

const PurchaseSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    prompt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prompt",
      required: true,
    },
    pricePaid: {
      type: Number,
      required: true,
    },
    platformCommission: {
      type: Number,
      default: 0,
    },
    /* The buyer-side platform fee that made up part of pricePaid, and the GST
       charged on it. Stored separately from platformCommission because these
       two are NON-REFUNDABLE: a refund returns the list price, not the fee for
       running the transaction. Without them the refund path had no way to tell
       the fee apart from the seller's commission inside platformCommission.

       0 on purchases made before this existed, which is correct — those were
       taken under the old rule where the whole payment came back. */
    platformFee: {
      type: Number,
      default: 0,
    },
    platformFeeGst: {
      type: Number,
      default: 0,
    },
    razorpayPaymentId: {
      type: String,
    },
    /* The order the payment settled against.
       POST /verify has always passed this to Purchase.create, but the field
       didn't exist — mongoose drops unknown keys in strict mode, so every
       purchase on record has no order id at all. That is the link between a
       sale and the Razorpay order that carries the amount actually charged and
       the discount in its notes; without it neither a refund nor a support
       query can be checked against the payment. Absent on rows written before
       this existed. */
    razorpayOrderId: {
      type: String,
      index: true,
      default: null,
    },
    // Set only when the seller had an activated Route Linked Account at
    // purchase time — the order's transfers[] moved money there directly.
    routeTransferId: {
      type: String,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["SUCCESS", "FAILED", "PENDING"],
      default: "PENDING",
    },
    // Mirrors the linked RefundRequest's lifecycle so purchase-history reads
    // don't need a second query — RefundRequest stays the source of truth
    // for the reason/admin note/audit trail.
    refundStatus: {

    /* When the referral job last looked at this sale.
       The job sweeps every purchase that has outlived the refund window and
       either qualifies a referral or pays out a rebate against it. Without a
       marker it would do both again on the next tick, every hour, forever. */
    referralProcessedAt: { type: Date, default: null },
      type: String,
      enum: ["NONE", "REQUESTED", "APPROVED", "REJECTED", "REFUNDED"],
      default: "NONE",
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    razorpayRefundId: {
      type: String,
      default: null,
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
    /* What the buyer has actually DONE with the code they bought.
     *
     * Exists to answer one question an admin could not previously ask at all:
     * "did this person read the code, or did they take a copy and then ask for
     * their money back?" Before this, a refund on a code product was decided
     * with no information whatsoever about whether the product had been
     * consumed.
     *
     * THE DISTINCTION IS READ vs TAKE, and it is deliberately not
     * "opened vs unopened". Nobody can judge whether code is worth keeping
     * without reading it, so treating a read as consumption would refuse
     * refunds to exactly the buyer with the most legitimate complaint — the one
     * who opened the file and found it broken. Reading is inspection. Copying
     * or downloading is possession, and that is the line worth recording.
     *
     * A SIGNAL, NOT A LOCK. `viewed` cannot be enforced — DevTools, select-all
     * and a screenshot all defeat it. The value is in the timeline it gives an
     * admin: "viewed 6 min after purchase, downloaded at 7, refund requested at
     * 12" reads very differently from "viewed, downloaded, refund six hours
     * later because a dependency is missing". Neither number decides the refund;
     * the reason does. These make the reason checkable.
     *
     * Counts only ever grow, and reads are LIVE rather than frozen at
     * request-time on purpose — a download that happens after the refund is
     * filed is itself something the admin should see.
     */
    codeAccess: {
      firstViewedAt: { type: Date, default: null },
      lastViewedAt: { type: Date, default: null },
      viewCount: { type: Number, default: 0 },
      firstTakenAt: { type: Date, default: null },
      lastTakenAt: { type: Date, default: null },
      takeCount: { type: Number, default: 0 },
    },

    promptSnapshot: {
      title: String,
      description: String,
      promptText: String,
      attachment: Object,
      uploadCode: [Object],
      /* The buyer's own copy of the code, frozen at the moment of sale.
         `uploadCode` above only ever held uploaded FILES; a pasted snippet lives
         nowhere else, so without this a seller deleting their listing would take
         the buyer's code with it. GET /api/prompt/:id/code falls back to this
         when the live prompt is gone. Absent on purchases made before code
         assets existed, which had none to copy. */
      codeAssets: [Object],
    },
  },
  {
    timestamps: true, // ✅ CORRECT PLACE
  }
);

module.exports = mongoose.model("Purchase", PurchaseSchema);
