const mongoose = require("mongoose");

const DeliverableSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    name: { type: String, default: "Work file" },
    description: { type: String, default: "Work file" },
    size: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
    uploadedAt: { type: Date, default: Date.now },

    // "file"  — uploaded to Tokun's storage, downloadable through the gated
    //           /deliverables/:index/download route.
    // "link"  — a URL the seller pasted (GitHub repo, Drive folder, Figma,
    //           WeTransfer). Needed because a real code delivery is often a
    //           repo, and because a 4K render or a game build is bigger than
    //           any upload limit worth supporting.
    kind: { type: String, enum: ["file", "link"], default: "file" },

    // Recognised link source ("github", "gitlab", "drive", …) so the UI can
    // label it instead of showing a bare URL. "" for uploaded files.
    provider: { type: String, default: "" },

    // Azure blob name for kind:"file". The container is private, so the blob
    // URL alone is not usable — the download route mints a short-lived SAS from
    // this. Empty on records created before the move off local disk, which the
    // same route falls back to serving from ../uploads/service-work.
    blobName: { type: String, default: "" },

    /* ── Watermarked video review copy ─────────────────────────────────────
       A video delivery can't be stamped per request the way an image can, so a
       downscaled, watermark-burned re-encode is prepared once (see
       utils/deliverableVideoPreview.js) and THAT is what a buyer gets while the
       payment is held. These three fields are the record of that job:

         previewBlobName  the derived blob, "" until it exists
         previewStatus    "" (not applicable / not started) | PENDING | READY | FAILED
         previewAttempts  guard against re-encoding an unencodable file on every
                          page load
         previewError     why it failed, for support — never shown verbatim

       Only ever set on video files. Everything else is either stamped inline
       (images) or stays locked until release. */
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

// A file the BUYER attached to their brief, as opposed to a DeliverableSchema
// which is what the seller sends back. Read through the gated
// /api/brief/.../download route, so blobName is the field that matters — the
// url alone points at a private blob and won't open.
const BriefAttachmentSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    blobName: { type: String, default: "" },
    name: { type: String, default: "Attachment" },
    size: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const RevisionSchema = new mongoose.Schema(
  {
    reason: { type: String, default: "" },
    requestedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// One delivery attempt. `deliverables` on the order is only ever the newest
// one; without this history a resubmission after a revision silently erased
// what was sent the first time, leaving an admin handling a dispute with no
// record of the original delivery.
const SubmissionSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    note: { type: String, default: "" },
    deliverables: { type: [DeliverableSchema], default: [] },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ServiceOrderSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", default: null },

    serviceTitle: { type: String, required: true },
    serviceMedia: { type: String, default: null },

    // amount        = service.price at time of booking (seller's listed price)
    // platformFee   = Tokun's cut, deducted from the seller's payout
    // sellerAmount  = amount - platformFee (credited to seller wallet on release)
    // clientFee     = Tokun's cut added on top of what the buyer pays
    // totalPayable  = amount + clientFee (charged to buyer via Razorpay)
    amount: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    sellerAmount: { type: Number, required: true },
    clientFee: { type: Number, default: 0 },
    totalPayable: { type: Number, required: true },

    /* GST on Tokun's two fees — never on the gig price itself, which is the
       seller's own supply and their own tax liability.

       Held separately because these are NOT Tokun's money: they're collected
       on the government's behalf and owed onward. Anything reporting platform
       revenue has to add platformFee + clientFee and leave these two out.

       0 on orders taken before GST was switched on, and 0 whenever
       TOKUN_GST_PERCENT is 0. */
    platformFeeGst: { type: Number, default: 0 },
    clientFeeGst: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },

    note: { type: String, default: "" },
    // Reference material the buyer attached to their brief — a style deck, a
    // logo, screenshots of what's wrong. The brief used to be text only, so
    // every real one started with a Drive link pasted into chat that nobody
    // could find again. Kept on the order so a dispute can still see what was
    // actually asked for.
    briefAttachments: { type: [BriefAttachmentSchema], default: [] },
    preferredDate: { type: Date, default: null },

    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },

    /* ── Route escrow ──────────────────────────────────────────────────────
       The seller's money is held by Razorpay as a transfer with on_hold: 1
       (no on_hold_until), not sat in a Tokun-internal wallet number. These
       fields are how we find that transfer again to release it.

       Empty on orders funded before this shipped — those still settle through
       the Wallet ledger, which is why the release path keeps that fallback. */
    routeTransferId: { type: String, default: "" },
    // Snapshot of which linked account it was routed to. The seller can add or
    // re-onboard an account later; this records where THIS order's money went.
    routeLinkedAccountId: { type: String, default: "" },
    /* What the Route transfer actually holds. New bookings hold the full
       amount the buyer paid; Tokun's commission is reversed out at release
       rather than never being held. 0 on bookings funded before that changed —
       see the note on HireDeal.routeHeldAmount for why. */
    routeHeldAmount: { type: Number, default: 0 },
    // Razorpay's own transfer state, kept current by the transfer.* webhooks.
    // Intentionally not an enum — Razorpay owns this vocabulary, same reasoning
    // as BankAccount.activationStatus.
    routeTransferStatus: { type: String, default: "" },
    routeTransferError: { type: String, default: "" },
    transferReleasedAt: { type: Date, default: null },

    // Razorpay holds a transfer for at most 90 days from the payment. After
    // this instant the escrow is no longer something we can rely on, so the
    // order MUST have been released, refunded or split before it. Set at
    // payment; watched by cron/escrowDeadlineWatch.js.
    escrowExpiresAt: { type: Date, default: null, index: true },
    escrowWarningSentAt: { type: Date, default: null },

    /* ── Delivery deadline ─────────────────────────────────────────────────
       What the listing promised ("7 Days Delivery"), turned into a real date.

       deliveryDays is snapshotted at booking for the same reason
       revisionsAllowed is: the seller editing the listing to "30 Days" next
       week must not change the terms of a booking already paid for.

       deliveryDueAt is set at PAYMENT — paidAt + deliveryDays. The clock does
       not wait for the seller to press "Start work", because then a seller who
       never starts would never be late.

       Both are null for orders booked before this existed, and for listings
       that promised no specific number of days. Null means no deadline: the
       submit guard skips them rather than inventing terms after the fact. */
    deliveryDays: { type: Number, default: null },
    deliveryDueAt: { type: Date, default: null, index: true },

    paymentStatus: {
      type: String,
      enum: ["NOT_PAID", "ORDER_CREATED", "PAID"],
      default: "NOT_PAID",
      index: true,
    },

    // No PENDING_ACCEPTANCE state — services are fixed-price/instantly bookable,
    // so a booking starts straight in the NDA+payment gate (mirrors HireDeal's
    // ACCEPTED_WAITING_PAYMENT onward).
    status: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "FUNDED",
        "IN_PROGRESS",
        "WORK_SUBMITTED",
        "REVISION_REQUESTED",
        "COMPLETED",
        "CANCELLED",
        // Cancelled after work had started, so the money can't just go back —
        // the parties (or an admin) have to agree how to split it. Deliberately
        // frozen: the auto-release cron skips this status, otherwise a dispute
        // raised on day 3 would be settled by the clock on day 4.
        "DISPUTED",
        // Terminal money states. REFUNDED = buyer got everything back;
        // SETTLED = the escrow was split between the two.
        "REFUNDED",
        "SETTLED",
      ],
      default: "PENDING_PAYMENT",
      index: true,
    },

    fundsStatus: {
      type: String,
      enum: [
        "NOT_HELD",
        "HELD_BY_TOKUN",
        "RELEASED_TO_SELLER",
        "AUTO_RELEASED",
        "REFUNDED_TO_BUYER",
        // Part reversed to the buyer, the rest released to the seller.
        "PARTIALLY_SETTLED",
        "DISPUTED",
      ],
      default: "NOT_HELD",
      index: true,
    },

    /* ── Cancellation / settlement outcome ─────────────────────────────────
       Written once, when a cancellation or dispute is finally resolved. The
       negotiation itself lives on EscrowDispute; these are the numbers that
       actually moved, kept on the order so any screen showing it can explain
       where the money went without a second lookup. */
    cancelledBy: { type: String, enum: ["buyer", "seller", "admin", ""], default: "" },
    cancelReason: { type: String, default: "" },
    cancelledAt: { type: Date, default: null },
    // 0–100. What share of the agreed price the seller was judged to have
    // earned. 0 = full refund, 100 = full release.
    settlementSellerPercent: { type: Number, default: null },
    settlementSellerPayout: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0 },
    refundedAt: { type: Date, default: null },
    razorpayRefundId: { type: String, default: "" },

    /* See the same block in models/HireDeal.js for the full story: these held a
       "/uploads/service-nda/…" path that the file was never written to — the
       upload went to the OS temp directory and stayed there until the host
       wiped it. The UI reads them only as "has this side signed?", which is why
       a missing document never surfaced as a bug. Kept, so that boolean keeps
       working for every existing record. */
    ndaBuyerUrl: { type: String, default: "" },
    ndaSellerUrl: { type: String, default: "" },

    /* The blob in the private `service-nda` container. Read through a SAS
       minted per request, after checking the caller is party to this order. */
    ndaBuyerBlob: { type: String, default: "" },
    ndaSellerBlob: { type: String, default: "" },

    ndaBuyerSignedAt: Date,
    ndaSellerSignedAt: Date,

    /* The drawn signature itself, as a small PNG data URL.
       Without this the signature was component state in the NDA modal: it
       showed while you were signing and vanished the moment the modal closed,
       so reopening the agreement showed a blank signature line. The uploaded
       copy still existed as a file, but the document everyone actually looks at
       rendered unsigned — which defeats the point of signing it.
       Stored per party so the agreement shows BOTH signatures, permanently. */
    ndaBuyerSignature: { type: String, default: "" },
    ndaSellerSignature: { type: String, default: "" },

    // Latest submission's files/links + note. Kept as top-level fields because
    // the chat card and both dashboards already read them; `submissions` below
    // is the full history.
    deliverables: { type: [DeliverableSchema], default: [] },
    submissionNote: { type: String, default: "" },
    submissions: { type: [SubmissionSchema], default: [] },

    revisions: { type: [RevisionSchema], default: [] },

    // Set when the "your revision has gone unanswered" nudge was sent, so it
    // only ever goes once. Cleared implicitly by a resubmission, which moves
    // the order out of REVISION_REQUESTED entirely.
    revisionStallWarnedAt: { type: Date, default: null },

    // How many revisions this booking includes, snapshotted from the service's
    // `revisions` text when the order was created. null = unlimited.
    // Orders created before this field existed have it undefined, which
    // getRevisionState() reads as unlimited — they were booked under no cap and
    // shouldn't retroactively gain one.
    revisionsAllowed: { type: Number, default: null },

    paidAt: { type: Date, default: null },
    workStartedAt: Date,
    workSubmittedAt: Date,
    approvedAt: Date,
    releasedAt: Date,
    autoReleased: { type: Boolean, default: false },
    autoReleasedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceOrder", ServiceOrderSchema);
