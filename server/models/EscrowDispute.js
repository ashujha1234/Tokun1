const mongoose = require("mongoose");

/**
 * One cancellation-after-work-started, and the negotiation that decides how the
 * escrow gets split.
 *
 * Separate from the order itself because a dispute is a conversation with its
 * own history — a proposal, a counter, evidence, an admin verdict — while the
 * order only needs to record the number that finally moved. It also gives the
 * admin queue one collection to read instead of scanning two order types.
 *
 * Shared by hire deals and service bookings: the money maths is identical, only
 * the field names on the parent document differ (see escrowSettlement.service).
 */

const ProofFileSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    name: { type: String, default: "Proof of work" },
    size: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
    blobName: { type: String, default: "" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const EscrowDisputeSchema = new mongoose.Schema(
  {
    orderKind: { type: String, enum: ["hire", "service"], required: true, index: true },
    // Exactly one of these is set, matching orderKind.
    hireDealId: { type: mongoose.Schema.Types.ObjectId, ref: "HireDeal", default: null, index: true },
    serviceOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceOrder", default: null, index: true },

    // Normalised party refs so the admin queue doesn't have to know which
    // parent model it's looking at. "buyer" is the client, "seller" is the
    // freelancer, on both order kinds.
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    title: { type: String, default: "" },
    // What the client actually paid; the refund side of every split is a
    // fraction of this.
    totalPayable: { type: Number, required: true },
    // The seller's full payout had the work been approved; the payout side of
    // every split is a fraction of this.
    sellerAmount: { type: Number, required: true },

    raisedBy: { type: String, enum: ["buyer", "seller", "admin"], required: true },
    reason: { type: String, default: "", maxlength: 2000 },

    /*  OPEN          — client cancelled, seller hasn't claimed a share yet
     *  PROPOSED      — seller has proposed a split and attached evidence
     *  ADMIN_REVIEW  — the two didn't agree, an admin decides
     *  RESOLVED      — money has moved; the order carries the final numbers
     *  WITHDRAWN     — the client took the cancellation back
     */
    status: {
      type: String,
      enum: ["OPEN", "PROPOSED", "ADMIN_REVIEW", "RESOLVED", "WITHDRAWN"],
      default: "OPEN",
      index: true,
    },

    // Seller's claim: how much of the work they say is done, 0–100.
    proposedSellerPercent: { type: Number, default: null, min: 0, max: 100 },
    proposalNote: { type: String, default: "", maxlength: 2000 },
    proofFiles: { type: [ProofFileSchema], default: [] },
    proposedAt: { type: Date, default: null },

    // Buyer's answer to that claim.
    buyerResponse: { type: String, enum: ["accepted", "rejected", ""], default: "" },
    buyerResponseNote: { type: String, default: "", maxlength: 2000 },
    /* The client's own evidence.
       Only the seller could attach anything, which quietly made the case
       one-sided: a client disagreeing because the delivered work was unusable
       had nowhere to put the screenshots proving it, and an admin ruling on
       "who was right" saw files from one party and a paragraph from the other.
       Same shape and same gated download route as the seller's. */
    buyerProofFiles: { type: [ProofFileSchema], default: [] },
    buyerRespondedAt: { type: Date, default: null },

    // What actually happened.
    finalSellerPercent: { type: Number, default: null, min: 0, max: 100 },
    finalSellerPayout: { type: Number, default: 0 },
    finalRefundAmount: { type: Number, default: 0 },
    resolvedVia: { type: String, enum: ["mutual", "admin", "auto", ""], default: "" },
    resolvedAt: { type: Date, default: null },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null },
    adminNote: { type: String, default: "", maxlength: 2000 },
    razorpayRefundId: { type: String, default: "" },
  },
  { timestamps: true }
);

// The admin queue reads oldest-first within a status.
EscrowDisputeSchema.index({ status: 1, createdAt: 1 });

module.exports = mongoose.model("EscrowDispute", EscrowDisputeSchema);
