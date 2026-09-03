// const mongoose = require("mongoose");

// const HireDealSchema = new mongoose.Schema(
//   {



// workStartedAt:   { type: Date },
// workSubmittedAt: { type: Date },
// approvedAt:      { type: Date },
// razorpayPayoutId: { type: String },
// deliverables: [{
//   url:         { type: String },
//   description: { type: String },
// }],
// revisions: [{
//   reason:      { type: String },
//   requestedAt: { type: Date },
// }],

// // Status enum update
// status: {
//   type: String,
//   enum: [
//     "PENDING_ACCEPTANCE",
//     "ACCEPTED_WAITING_PAYMENT",
//     "FUNDED",
//     "IN_PROGRESS",
//     "WORK_SUBMITTED",
//     "REVISION_REQUESTED",
//     "COMPLETED",
//     "DISPUTED",
//     "REFUNDED",
//   ],
// },
// fundsStatus: {
//   type: String,
//   enum: [
//     "NOT_HELD",
//     "HELD_BY_TOKUN",
//     "RELEASED_TO_FREELANCER",
//     "AUTO_RELEASED",
//     "REFUNDED_TO_CLIENT",
//     "DISPUTED",
//   ],
// },







//     clientId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },

//     freelancerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },

//    chatId: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: "Conversation",
//   required: true,
// },

//     proposalMessageId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Message",
//     },

//     title: {
//       type: String,
//       default: "Hire Proposal",
//     },

//     description: {
//       type: String,
//       default: "",
//     },

//     amount: {
//       type: Number,
//       required: true,
//       min: 1,
//     },

//     platformFee: {
//       type: Number,
//       default: 0,
//     },

//     freelancerAmount: {
//       type: Number,
//       required: true,
//     },

//     currency: {
//       type: String,
//       default: "INR",
//     },

//     deliveryDate: {
//       type: Date,
//     },

//     status: {
//   type: String,
//   enum: [
//     "PENDING_ACCEPTANCE",
//     "ACCEPTED_WAITING_PAYMENT",
//     "FUNDED",
//     "IN_PROGRESS",
//     "WORK_SUBMITTED",
//     "REVISION_REQUESTED",
//     "COMPLETED",
//     "CANCELLED",
//     "REJECTED",
//   ],
//   default: "PENDING_ACCEPTANCE",
//   index: true,
// },

//     paymentStatus: {
//       type: String,
//       enum: ["NOT_PAID", "ORDER_CREATED", "PAID", "FAILED", "REFUNDED"],
//       default: "NOT_PAID",
//     },

//     fundsStatus: {
//       type: String,
//       enum: [
//         "NOT_HELD",
//         "HELD_BY_TOKUN",
//         "RELEASED_TO_FREELANCER",
//         "REFUNDED_TO_CLIENT",
//       ],
//       default: "NOT_HELD",
//     },

//     razorpayOrderId: String,
//     razorpayPaymentId: String,
//     razorpaySignature: String,

//     acceptedAt: Date,
//     paidAt: Date,
//     releasedAt: Date,
//   },
//   { timestamps: true }
// );



// module.exports = mongoose.model("HireDeal", HireDealSchema);


const mongoose = require("mongoose");

const DeliverableSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "Work file",
    },
    description: {
      type: String,
      default: "Work file",
    },
    size: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: "",
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },

    /* Mirrors ServiceOrder's DeliverableSchema.
       "file"  — uploaded to Tokun's private storage, fetched through the gated
                 download route.
       "link"  — a URL the freelancer pasted: a repo, a Drive folder, or the
                 deployed site itself. For built software that IS the delivery,
                 and hire deals had no way to express it. */
    kind: { type: String, enum: ["file", "link"], default: "file" },
    provider: { type: String, default: "" },
    blobName: { type: String, default: "" },

    /* The watermarked video review copy — same fields, same meaning and the
       same job as ServiceOrder's DeliverableSchema; see the long note there.
       A client watching a video delivery before release is watching this
       re-encode, not the master. */
    previewBlobName: { type: String, default: "" },
    previewStatus: {
      type: String,
      enum: ["", "PENDING", "READY", "FAILED"],
      default: "",
    },
    previewAttempts: { type: Number, default: 0 },
    previewError: { type: String, default: "" },
  },
  { _id: false }
);

const RevisionSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      default: "",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const HireDealSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    proposalMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    title: {
      type: String,
      default: "Hire Proposal",
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    // Reference material the CLIENT attached to the brief — a style deck, a
    // spec, screenshots. Distinct from `deliverables`, which is what the
    // freelancer sends back. The brief used to be text only, so every real one
    // started with a Drive link pasted into chat that nobody could find again.
    // Read through the gated /api/brief/.../download route, so `blobName` is
    // the field that matters — the url alone points at a private blob.
    briefAttachments: {
      type: [
        new mongoose.Schema(
          {
            url: { type: String, default: "" },
            blobName: { type: String, default: "" },
            name: { type: String, default: "Attachment" },
            size: { type: Number, default: 0 },
            mimeType: { type: String, default: "" },
            uploadedAt: { type: Date, default: Date.now },
          },
          { _id: false }
        ),
      ],
      default: [],
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    platformFee: {
      type: Number,
      default: 0,
    },

    freelancerAmount: {
      type: Number,
      required: true,
    },

    // Buyer-side platform fee. Its own rate now (TOKUN_PLATFORM_FEE_PERCENT) —
    // this used to be described as "same % as platformFee", which stopped being
    // true once the two sides were separated.
    clientFee: {
      type: Number,
      default: 0,
    },

    /* GST on Tokun's two fees, never on the project price itself. Held apart
       from the fees because this money is collected for the government, not
       earned — see the same fields on ServiceOrder. */
    platformFeeGst: {
      type: Number,
      default: 0,
    },
    clientFeeGst: {
      type: Number,
      default: 0,
    },

    // amount + clientFee + clientFeeGst — the real Razorpay order amount
    totalPayable: {
      type: Number,
    },

    currency: {
      type: String,
      default: "INR",
    },

    deliveryDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: [
        "PENDING_ACCEPTANCE",
        "ACCEPTED_WAITING_PAYMENT",
        "FUNDED",
        "IN_PROGRESS",
        "WORK_SUBMITTED",
        "REVISION_REQUESTED",
        "COMPLETED",
        "CANCELLED",
        "REJECTED",
        // Cancelled after work had started, so the money can't just go back —
        // the parties (or an admin) have to agree how to split it. The
        // auto-release cron skips this status, otherwise a dispute raised on
        // day 3 would be settled by the clock on day 4.
        "DISPUTED",
        "REFUNDED",
        // The escrow was split between the two rather than going wholly to
        // either side.
        "SETTLED",
      ],
      default: "PENDING_ACCEPTANCE",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["NOT_PAID", "ORDER_CREATED", "PAID", "FAILED", "REFUNDED"],
      default: "NOT_PAID",
      index: true,
    },

    fundsStatus: {
      type: String,
      enum: [
        "NOT_HELD",
        "HELD_BY_TOKUN",
        "RELEASED_TO_FREELANCER",
        "AUTO_RELEASED",
        "REFUNDED_TO_CLIENT",
        // Part reversed to the client, the rest released to the freelancer.
        "PARTIALLY_SETTLED",
        "DISPUTED",
      ],
      default: "NOT_HELD",
      index: true,
    },

    razorpayOrderId: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    razorpayPayoutId: {
      type: String,
      default: "",
    },

    /* ── Route escrow ──────────────────────────────────────────────────────
       The freelancer's money is held by Razorpay as a transfer with
       on_hold: 1 (no on_hold_until) rather than sitting in a Tokun-internal
       wallet number. These fields are how we find that transfer to release it.

       Empty on deals funded before this shipped — those still settle through
       the Wallet ledger, which is why the release path keeps that fallback. */
    routeTransferId: {
      type: String,
      default: "",
    },
    // Snapshot of which linked account this deal's money was routed to; the
    // freelancer can re-onboard or switch accounts later.
    routeLinkedAccountId: {
      type: String,
      default: "",
    },
    /* How much is actually sitting on hold in the Route transfer.
       New deals hold the FULL amount the client paid, not the freelancer's
       post-commission share. Tokun's cut is reversed out of the hold at
       release time instead of never entering it.

       Why: a dispute can end with the freelancer owed the whole amount (Tokun
       waives its commission when it has to arbitrate). A hold of only
       ₹2,850 on a ₹3,000 deal cannot pay that, and the ₹150 shortfall can't be
       sent separately — Razorpay's transfer-from-balance API is a different
       feature and answers "This feature is not enabled for this merchant".

       Empty/0 on deals funded before this changed: those hold the old
       freelancer-share amount, and the settlement math falls back to it. */
    routeHeldAmount: {
      type: Number,
      default: 0,
    },
    // Razorpay's own transfer state, kept current by the transfer.* webhooks.
    // Not an enum on purpose — Razorpay owns this vocabulary.
    routeTransferStatus: {
      type: String,
      default: "",
    },
    routeTransferError: {
      type: String,
      default: "",
    },
    transferReleasedAt: {
      type: Date,
      default: null,
    },

    // Razorpay holds a transfer for at most 90 days from the payment. After
    // this instant the escrow is no longer something we can rely on, so the
    // deal MUST have been released, refunded or split before it. Set at
    // payment; watched by cron/escrowDeadlineWatch.js.
    escrowExpiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    escrowWarningSentAt: {
      type: Date,
      default: null,
    },

    acceptedAt: Date,
    paidAt: Date,
    workStartedAt: Date,
    workSubmittedAt: Date,
    approvedAt: Date,
    releasedAt: Date,

    // Refund audit trail (previously set in code but not persisted — schema bug)
    refundedAt: Date,
    refundReason: { type: String, default: "" },
    razorpayRefundId: { type: String, default: "" },

    /* ── Cancellation / settlement outcome ─────────────────────────────────
       Written once, when a cancellation or dispute is finally resolved. The
       negotiation itself lives on EscrowDispute; these are the numbers that
       actually moved, kept on the deal so any screen showing it can explain
       where the money went without a second lookup. */
    /* WHICH SIDE ended it — not which user.
       Declared once, here. There used to be a second `cancelledBy` further down
       typed as an ObjectId ref, and in Mongoose the LAST declaration of a path
       wins: the schema silently became ObjectId, so every settlement — which
       writes "buyer"/"seller"/"admin" — died with
         CastError: Cast to ObjectId failed for value "seller" at path "cancelledBy"
       and it died AFTER Razorpay had already moved the money, leaving deals
       stuck in DISPUTED with the refund already paid out. Same story for
       `cancelledAt`, which was also declared twice. */
    cancelledBy: { type: String, enum: ["buyer", "seller", "admin", ""], default: "" },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: "" },
    // 0–100. What share of the agreed price the freelancer was judged to have
    // earned. 0 = full refund, 100 = full release.
    settlementSellerPercent: { type: Number, default: null },
    settlementSellerPayout: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0 },

    // Auto-release audit trail (same previously-silent-drop issue)
    autoReleased: { type: Boolean, default: false },
    autoReleasedAt: Date,

    /* Cancel/decline (pre-payment only) shares cancelledAt / cancelledBy /
       cancelReason with the settlement block above — a deal only ends once, so
       one set of fields describes it whether it ended before or after payment.
       (These three were re-declared here, which is what broke the path type.) */

    /* Where the signed PDF actually is.
     *
     * These two used to be the only NDA storage fields, holding a path like
     * "/uploads/nda/nda-1234.pdf" — a path the file was never written to. The
     * upload landed in the OS temp directory (utils/privateUploadDirs.js) and
     * nothing ever moved it anywhere else, so the stored string pointed at a
     * location that had never held it, on a route that refuses to serve that
     * prefix in any case.
     *
     * It went unnoticed because the UI only reads these as a boolean — see
     * NdaCard.tsx, which asks `!!clientUrl` to decide whether a side has signed
     * and never renders them as a link. The flag was right. The document was
     * being written to a scratch directory that App Service wipes.
     *
     * They are kept, and still hold a URL, so every existing record keeps
     * answering that boolean exactly as before. New uploads point them at the
     * gated download route below rather than at a static path.
     */
    ndaClientUrl: { type: String, default: "" },
    ndaFreelancerUrl: { type: String, default: "" },

    /* The blob the PDF is really stored as, in the PRIVATE `nda` container.
     *
     * Separate from the URL fields above rather than replacing them, because a
     * blob name is not a URL: reading one means minting a short-lived SAS at
     * request time, after checking the caller is a party to this deal. Storing
     * a readable URL instead would be a permanent unauthenticated link to a
     * signed legal agreement.
     *
     * Empty on every pre-existing record, which is the honest state — those
     * files are gone, and a blank field says so rather than implying a document
     * that cannot be fetched. */
    ndaClientBlob: { type: String, default: "" },
    ndaFreelancerBlob: { type: String, default: "" },

    /* The drawn signature itself, as a small PNG data URL.
       Without this the signature was component state in the NDA modal: it
       showed while you were signing and vanished the moment the modal closed,
       so reopening the agreement showed a blank signature line. Stored per
       party so the agreement shows BOTH signatures, permanently. */
    ndaClientSignature: { type: String, default: "" },
    ndaFreelancerSignature: { type: String, default: "" },
    ndaClientSignedAt: Date,
    ndaFreelancerSignedAt: Date,

    deliverables: {
      type: [DeliverableSchema],
      default: [],
    },

    submissionNote: {
      type: String,
      default: "",
    },

    // Every delivery attempt, appended. `deliverables` above is only ever the
    // newest one, so without this a resubmission after a revision silently
    // erased what was sent the first time — leaving an admin ruling on
    // "this isn't what you delivered originally" with no record to check.
    // Service bookings got this first; hire deals had the same hole.
    submissions: {
      type: [
        new mongoose.Schema(
          {
            version: { type: Number, required: true },
            note: { type: String, default: "" },
            deliverables: { type: [DeliverableSchema], default: [] },
            submittedAt: { type: Date, default: Date.now },
          },
          { _id: false }
        ),
      ],
      default: [],
    },

    revisions: {
      type: [RevisionSchema],
      default: [],
    },

    // Set when the "your revision has gone unanswered" nudge was sent, so it
    // only ever goes once. Cleared implicitly by a resubmission, which moves
    // the order out of REVISION_REQUESTED entirely.
    revisionStallWarnedAt: { type: Date, default: null },

    // How many revisions this deal includes, fixed when the proposal is made.
    // null = unlimited.
    //
    // Service bookings got this cap first; hire deals were left uncapped, which
    // meant a client could send the same project back indefinitely and the
    // freelancer's payout would sit in escrow for as long as the client felt
    // like — the exact exploit the service-side cap exists to close.
    //
    // Deals created before this field existed read as undefined, which
    // getRevisionState() treats as unlimited: they were agreed under no cap and
    // shouldn't retroactively gain one.
    revisionsAllowed: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HireDeal", HireDealSchema);