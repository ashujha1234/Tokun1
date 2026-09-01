// const express = require("express");
// const Razorpay = require("razorpay");
// const crypto = require("crypto");

// const router = express.Router();

// const { requireAuth } = require("../utils/auth");
// const HireDeal = require("../models/HireDeal");
// const Notification = require("../models/Notification");
// const Message = require("../models/Message");

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // Rasu creates hire proposal before sending hire card
// router.post("/create-proposal", requireAuth, async (req, res) => {
//   try {
//     const {
//       freelancerId,
//       conversationId,
//       title,
//       description,
//       budget,
//       targetDate,
//       deliveryPreference,
//     } = req.body;

//     if (!freelancerId || !conversationId) {
//       return res.status(400).json({
//         success: false,
//         error: "freelancerId and conversationId are required",
//       });
//     }

//     if (String(freelancerId) === String(req.user._id)) {
//       return res.status(400).json({
//         success: false,
//         error: "You cannot hire yourself",
//       });
//     }

//     const amount = Number(budget);

//     if (!amount || amount <= 0) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid budget amount",
//       });
//     }

//     const platformFee = 0;
//     const freelancerAmount = amount - platformFee;

//     const deal = await HireDeal.create({
//       clientId: req.user._id,
//       freelancerId,
//       chatId: conversationId,
//       title: title || "Project Proposal",
//       description: description || "",
//       amount,
//       platformFee,
//       freelancerAmount,
//       currency: "INR",
//       deliveryDate: targetDate ? new Date(targetDate) : undefined,
//       status: "PENDING_ACCEPTANCE",
//       paymentStatus: "NOT_PAID",
//       fundsStatus: "NOT_HELD",
//     });

//     const cardPayload = {
//       hireDealId: String(deal._id),
//       dealId: String(deal._id),
//       title: title || "Project Proposal",
//       projectTitle: title || "Project Proposal",
//       description: description || "",
//       projectDetails: description || "",
//       budget: amount,
//       amount,
//       targetDate,
//       deliveryPreference: deliveryPreference || "complete",
//       status: "PENDING",
//     };

//     return res.json({
//       success: true,
//       deal,
//       cardPayload,
//     });
//   } catch (err) {
//     console.error("create hire proposal error:", err);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to create hire proposal",
//     });
//   }
// });

// // Ashutosh accepts hire proposal
// router.post("/:dealId/accept", requireAuth, async (req, res) => {
//   try {
//     const deal = await HireDeal.findById(req.params.dealId)
//       .populate("clientId", "name email profileImage image")
//       .populate("freelancerId", "name email profileImage image");

//     if (!deal) {
//       return res.status(404).json({
//         success: false,
//         error: "Hire deal not found",
//       });
//     }

//     if (String(deal.freelancerId._id) !== String(req.user._id)) {
//       return res.status(403).json({
//         success: false,
//         error: "You cannot accept this proposal",
//       });
//     }

//     if (deal.status !== "PENDING_ACCEPTANCE") {
//       return res.status(400).json({
//         success: false,
//         error: "This proposal is already processed",
//       });
//     }

//     deal.status = "ACCEPTED_WAITING_PAYMENT";
//     deal.acceptedAt = new Date();
//     await deal.save();

//     await Message.create({
//   conversationId: deal.chatId,
//   sender: req.user._id,
//   text: `HIRE_ACCEPTED::${JSON.stringify({
//     hireDealId: String(deal._id),
//     title: deal.title,
//     budget: deal.amount,
//     amount: deal.amount,
//     targetDate: deal.deliveryDate,
//     status: "ACCEPTED",
//     message: `${deal.freelancerId.name || "Freelancer"} accepted your hire proposal.`,
//   })}`,
//   readBy: [req.user._id],
// });

//     await Notification.create({
//       senderId: req.user._id,
//       senderName: deal.freelancerId.name,
//       senderEmail: deal.freelancerId.email,
//       senderImage: deal.freelancerId.profileImage || deal.freelancerId.image,

//       receiverUserId: deal.clientId._id,

//       type: "HIRE_PAYMENT_REQUIRED",
//       hireDealId: deal._id,
//       chatId: deal.chatId,
//       amount: deal.amount,

//       message: `${deal.freelancerId.name || "Freelancer"} accepted your hire proposal. Make payment to start work.`,
//       meta: {
//         title: deal.title,
//         freelancerName: deal.freelancerId.name,
//         freelancerEmail: deal.freelancerId.email,
//         deliveryDate: deal.deliveryDate,
//         paymentRequired: true,
//       },
//     });

//     return res.json({
//       success: true,
//       message: "Hire proposal accepted",
//       deal,
//     });
//   } catch (err) {
//     console.error("accept hire error:", err);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to accept hire proposal",
//     });
//   }
// });

// // Rasu creates Razorpay order
// router.post("/:dealId/create-payment-order", requireAuth, async (req, res) => {
//   try {
//     const deal = await HireDeal.findById(req.params.dealId);

//     if (!deal) {
//       return res.status(404).json({
//         success: false,
//         error: "Hire deal not found",
//       });
//     }

//     if (String(deal.clientId) !== String(req.user._id)) {
//       return res.status(403).json({
//         success: false,
//         error: "Only client can make payment",
//       });
//     }

//     if (deal.status !== "ACCEPTED_WAITING_PAYMENT") {
//       return res.status(400).json({
//         success: false,
//         error: "Deal is not ready for payment",
//       });
//     }

//     const order = await razorpay.orders.create({
//       amount: Math.round(Number(deal.amount) * 100),
//       currency: deal.currency || "INR",
//       receipt: `hire_${deal._id}`,
//       notes: {
//         dealId: String(deal._id),
//         clientId: String(deal.clientId),
//         freelancerId: String(deal.freelancerId),
//       },
//     });

//     deal.razorpayOrderId = order.id;
//     deal.paymentStatus = "ORDER_CREATED";
//     await deal.save();

//     return res.json({
//       success: true,
//       key: process.env.RAZORPAY_KEY_ID,
//       order,
//     });
//   } catch (err) {
//     console.error("create hire payment order error:", err);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to create payment order",
//     });
//   }
// });

// // Razorpay payment verify
// router.post("/:dealId/verify-payment", requireAuth, async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//     } = req.body;

//     const deal = await HireDeal.findById(req.params.dealId)
//       .populate("clientId", "name email profileImage image")
//       .populate("freelancerId", "name email profileImage image");

//     if (!deal) {
//       return res.status(404).json({
//         success: false,
//         error: "Hire deal not found",
//       });
//     }

//     if (String(deal.clientId._id) !== String(req.user._id)) {
//       return res.status(403).json({
//         success: false,
//         error: "Only client can verify this payment",
//       });
//     }

//     const body = `${razorpay_order_id}|${razorpay_payment_id}`;

//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid payment signature",
//       });
//     }

//     deal.razorpayOrderId = razorpay_order_id;
//     deal.razorpayPaymentId = razorpay_payment_id;
//     deal.razorpaySignature = razorpay_signature;
//     deal.paymentStatus = "PAID";
//     deal.fundsStatus = "HELD_BY_TOKUN";
//     deal.status = "FUNDED";
//     deal.paidAt = new Date();

//     await deal.save();

//     await Notification.create({
//       senderId: deal.clientId._id,
//       senderName: deal.clientId.name,
//       senderEmail: deal.clientId.email,
//       senderImage: deal.clientId.profileImage || deal.clientId.image,

//       receiverUserId: deal.freelancerId._id,

//       type: "HIRE_PAYMENT_DONE",
//       hireDealId: deal._id,
//       chatId: deal.chatId,
//       amount: deal.amount,

//       message: `${deal.clientId.name || "Client"} made the payment. Amount is safely held by Tokun. You can start work now.`,
//       meta: {
//         title: deal.title,
//         clientName: deal.clientId.name,
//         amount: deal.amount,
//         fundsStatus: "HELD_BY_TOKUN",
//       },
//     });

//     await Message.create({
//       chatId: deal.chatId,
//       senderId: deal.clientId._id,
//       receiverId: deal.freelancerId._id,
//       type: "HIRE_PAYMENT_DONE",
//       message: `Payment done. ₹${deal.amount} is safely held by Tokun.`,
//       hireDealId: deal._id,
//       amount: deal.amount,
//       meta: {
//         status: deal.status,
//         fundsStatus: deal.fundsStatus,
//       },
//     });

//     return res.json({
//       success: true,
//       message: "Payment verified and held by Tokun",
//       deal,
//     });
//   } catch (err) {
//     console.error("verify hire payment error:", err);
//     return res.status(500).json({
//       success: false,
//       error: "Payment verification failed",
//     });
//   }
// });

// module.exports = router;




const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const router = express.Router();
const Wallet = require("../models/Wallet");
const PlatformWallet = require("../models/PlatformWallet");
const { requireAuth, blockIfSuspended } = require("../utils/auth");
const HireDeal = require("../models/HireDeal");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const { releaseEscrowToFreelancer, EscrowAlreadyReleasedError } = require("../services/escrowRelease.service");
const { actorFromReq } = require("../utils/activityLogger");
const { checkPayoutReady, buildHeldTransfer } = require("../utils/routeEscrow");
const { assertSuperCreatorActive } = require("../utils/superCreatorGate");
const { validateTargetDate, escrowExpiryFrom } = require("../utils/escrowWindow");
const { transactionSplit, SERVICE_COMMISSION_PERCENT } = require("../utils/fees");
const { normalizeBriefAttachments } = require("./briefAttachments");
const { resolveHireRevisionsAllowed, getRevisionState } = require("../utils/revisionPolicy");
const { tempUploadDir } = require("../utils/privateUploadDirs");
const {
  normalizeDeliverableLink,
  uploadWorkFileToAzure,
  getWorkFileDownloadUrl,
  isAllowedWorkFile,
  WORK_FILE_MAX_BYTES,
  WORK_FILE_MAX_LABEL,
} = require("../utils/serviceWorkStorage");
const { isPreviewableVideo, isSettled } = require("../utils/deliverableWatermark");
// The one place that decides what a client may see before the money moves —
// shared with the service and checkpoint routes.
const { serveHeldPreview } = require("../utils/escrowPreviewGate");
const { warmVideoPreview } = require("../utils/deliverableVideoPreview");
const { fetchTransferIdsByAccount } = require("../utils/routePayouts");
const { generateInvoicePDF } = require("../services/invoice.service");
const { sendInvoiceEmail } = require("../services/email.service");
const {
  sendNewWorkRequestEmail,
  sendRevisionRequestedEmail,
  sendEscrowReleasedEmail,
} = require("../services/creatorEmail.service");
const { sendWorkSubmittedEmail } = require("../services/buyerEmail.service");
// Same window the stale-request cron closes on, read the same way, so the
// deadline promised in the email is the deadline actually enforced.
const REQUEST_RESPONSE_DAYS = Number(process.env.REQUEST_RESPONSE_DAYS || 3);
// Mirrors cron/autoReleaseEscrow.js. If that changes, this must too — the email
// promises a date the cron is the one actually keeping.
const AUTO_RELEASE_HOURS = 72;

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) wallet = await Wallet.create({ userId });
  return wallet;
};
// ─── Work file upload setup ─────────────────────────────
/* Pre-Azure deliverables, read-only — the gated download route still streams
   these for old records. Nothing writes here any more and /uploads no longer
   serves it; see utils/privateUploadDirs.js. */
const legacyWorkDir = path.join(__dirname, "../uploads/hire-work");

/* The scratch copy multer writes before uploadWorkFileToAzure() streams it into
   the private container. Outside the served tree: this used to be
   uploads/hire-work, which express.static hands to anyone — so a delivery was
   public for the length of its own upload, and permanently if the process died
   mid-way. */
const workTempDir = tempUploadDir("hire-work");

const workStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, workTempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const base = path
      .basename(file.originalname || "work-file", ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .slice(0, 80);

    cb(null, `${Date.now()}-${base || "work-file"}${ext}`);
  },
});

/* Same ceiling and same allowlist as a service booking's work file — this is
   the same act (a creator handing over the delivery) and there is no reason the
   two flows disagree.

   They did disagree: this was 50 MB while the service route took
   WORK_FILE_MAX_BYTES and the shared SubmitWorkModal offered the larger number
   to both. So a freelancer on a hire deal picked a file the modal accepted, sat
   through the upload, and got a bare multer error — and the modal, which reads
   `message` out of a JSON body, had nothing to show but "Failed to upload".
   That is the same wall a revision resubmission hits, when the seller is
   re-sending the whole deliverable a second time. */
const uploadWorkFile = multer({
  storage: workStorage,
  limits: { fileSize: WORK_FILE_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (isAllowedWorkFile(file.originalname)) return cb(null, true);
    cb(new Error("unsupported_work_file_type"));
  },
});

/* Multer's failures used to reach Express's default handler, which answers with
   an HTML error page; the client's res.json() then threw and the freelancer saw
   a generic failure with no reason. Mirrors handleWorkFileUpload in
   serviceRoutes.js. */
function handleWorkFileUpload(req, res, next) {
  uploadWorkFile.single("file")(req, res, (err) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "file_too_large",
        message: `Each file must be under ${WORK_FILE_MAX_LABEL}. For anything bigger, share a GitHub repo or Drive link instead.`,
      });
    }
    if (String(err.message).includes("unsupported_work_file_type")) {
      return res.status(400).json({
        success: false,
        error: "unsupported_work_file_type",
        message:
          "That file type isn't accepted. Zip the folder and upload the .zip — that's also the only way to keep a code project's folder structure intact.",
      });
    }
    console.error("hire work upload error:", err);
    return res.status(400).json({
      success: false,
      error: "upload_failed",
      message: "Could not read that file. Please try again.",
    });
  });
}














// ─── CREATE PROPOSAL ───────────────────────────────────────────────────────────
router.post("/create-proposal", requireAuth, blockIfSuspended, async (req, res) => {
  try {
    const {
      freelancerId,
      conversationId,
      title,
      description,
      budget,
      targetDate,
      deliveryPreference,
      briefAttachments,
      revisionsAllowed,
    } = req.body;

    if (!freelancerId || !conversationId) {
      return res.status(400).json({
        success: false,
        error: "freelancerId and conversationId are required",
      });
    }

    if (String(freelancerId) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        error: "You cannot hire yourself",
      });
    }

    const amount = Number(budget);
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid budget amount",
      });
    }

    // Sending a proposal to someone who can't be paid is a dead end — they
    // physically cannot accept it, so the client would write a whole brief and
    // then hit a wall at the accept step. Checked here as well as at accept and
    // payment, because a disabled button in the UI is not a control.
    const payoutReady = await checkPayoutReady(freelancerId, "buyer");
    if (!payoutReady.ok) {
      return res.status(409).json({
        success: false,
        error: payoutReady.error,
        reason: payoutReady.reason,
        message: payoutReady.message,
      });
    }

    /* And their intro video has to be approved. Same reasoning as the payout
       check above — this is about the person being proposed to, not the person
       proposing, so the message is written for the buyer to read.

       This is deliberately the freelancer's own message suppressed: telling a
       client "their video was rejected" leaks a moderation decision about
       someone else, so all unapproved states collapse to one neutral line. */
    const videoGate = await assertSuperCreatorActive(freelancerId);
    if (!videoGate.ok) {
      return res.status(409).json({
        success: false,
        error: videoGate.error,
        message: "This Super Creator isn't approved to take on work yet.",
      });
    }

    // A date the escrow can't reach is worse than no date: Razorpay stops
    // holding the money at 90 days from payment, so a delivery further out than
    // 60 leaves no room for review, revisions or a dispute before the hold
    // lapses.
    const dateCheck = validateTargetDate(targetDate);
    if (!dateCheck.ok) {
      return res.status(400).json({
        success: false,
        error: dateCheck.error,
        message: dateCheck.message,
      });
    }

    /* Both sides, from utils/fees.js — the same rates a service booking and a
       prompt sale use, so a client is never charged a different platform fee
       depending on which screen they bought from.

       Client:     amount + platform fee + GST on that fee
       Freelancer: amount − commission − GST on that commission

       Fixed here, at proposal time, alongside the rest of the terms. */
    const split = transactionSplit(amount, SERVICE_COMMISSION_PERCENT);

    const platformFee = split.seller.commission;
    const platformFeeGst = split.seller.commissionGst;
    const freelancerAmount = split.seller.netToSeller;
    const clientFee = split.buyer.platformFee;
    const clientFeeGst = split.buyer.platformFeeGst;
    const totalPayable = split.buyer.totalPayable;

    const deal = await HireDeal.create({
      clientId: req.user._id,
      freelancerId,
      chatId: conversationId,
      title: title || "Project Proposal",
      description: description || "",
      // Only blobName-bearing descriptors survive normalisation, so a client
      // can't get an arbitrary URL stored as if it were an uploaded file.
      briefAttachments: normalizeBriefAttachments(briefAttachments),
      // Fixed now, at proposal time, so neither side can change the terms once
      // the money is in escrow. Hire deals were uncapped before this: a client
      // could send the same project back indefinitely while the freelancer's
      // payout sat frozen.
      revisionsAllowed: resolveHireRevisionsAllowed(revisionsAllowed),
      amount,
      platformFee,
      platformFeeGst,
      freelancerAmount,
      clientFee,
      clientFeeGst,
      totalPayable,
      currency: "INR",
      deliveryDate: targetDate ? new Date(targetDate) : undefined,
      status: "PENDING_ACCEPTANCE",
      paymentStatus: "NOT_PAID",
      fundsStatus: "NOT_HELD",
    });

    const cardPayload = {
      hireDealId: String(deal._id),
      dealId: String(deal._id),
      title: title || "Project Proposal",
      projectTitle: title || "Project Proposal",
      description: description || "",
      projectDetails: description || "",
      budget: amount,
      amount,
      targetDate,
      deliveryPreference: deliveryPreference || "complete",
      // Names only, indexed — the freelancer decides whether to accept from
      // this card, so reference files they can't see may as well not have been
      // attached. No URLs: downloads go through the gated brief route by index,
      // because a brief can hold unreleased material.
      briefAttachments: (deal.briefAttachments || []).map((f, index) => ({
        index,
        name: f.name,
        size: f.size,
      })),
      status: "PENDING",
    };

    /* Tell the freelancer a request has landed.

       There was nothing here at all — not even a notification. The proposal
       went out as a chat card and that was the whole of it, which is why the
       stale-request cron exists: it emails this same person three days later
       to say they missed something nobody told them about. This is that email,
       sent at the point it can still be acted on. */
    try {
      const freelancer = await User.findById(freelancerId).select("name email").lean();
      if (freelancer?.email) {
        await sendNewWorkRequestEmail({
          to: freelancer.email,
          creatorName: freelancer.name,
          clientName: req.user.name,
          title: deal.title,
          amount: deal.amount,
          kind: "project",
          respondWithinDays: REQUEST_RESPONSE_DAYS,
          deliveryDate: deal.deliveryDate,
        });
      }
    } catch (mailErr) {
      console.error("New hire request email failed (proposal still created):", mailErr.message);
    }

    return res.json({ success: true, deal, cardPayload });
  } catch (err) {
    console.error("create hire proposal error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to create hire proposal",
    });
  }
});




// ─── Upload work file before submitting project ──────────
router.post("/:dealId/upload-work-file", requireAuth, handleWorkFileUpload, async (req, res) => {
  /* Multer has already written the file to disk by the time any of the checks
     below run, so every early return has to remove it — otherwise a rejected
     upload leaves gigabytes in uploads/hire-work forever. Only the success path
     hands the temp copy to uploadWorkFileToAzure(), which unlinks it itself. */
  const cleanupTemp = () => {
    if (req.file?.path) fs.promises.unlink(req.file.path).catch(() => {});
  };

  try {
    const deal = await HireDeal.findById(req.params.dealId);

    if (!deal) {
      cleanupTemp();
      return res.status(404).json({
        success: false,
        error: "Deal not found",
      });
    }

    if (String(deal.freelancerId) !== String(req.user._id)) {
      cleanupTemp();
      return res.status(403).json({
        success: false,
        error: "Only freelancer can upload work files",
      });
    }

    if (!["FUNDED", "IN_PROGRESS", "REVISION_REQUESTED"].includes(deal.status)) {
      cleanupTemp();
      return res.status(400).json({
        success: false,
        error: `Cannot upload files. Current status: ${deal.status}`,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    /* Streamed into the PRIVATE container, same as service deliverables.
       These used to land on local disk under /uploads/hire-work, which
       express.static serves publicly with guessable filenames — so a client's
       paid-for deliverable was fetchable by anyone who could construct the URL,
       before approval and by people who weren't party to the deal at all.
       Reads now go through the gated download route below. */
    const { blobName, url } = await uploadWorkFileToAzure(
      req.file.path,
      req.file.originalname,
      `hire/${deal._id}`
    );

    return res.json({
      success: true,
      file: {
        url,
        blobName,
        kind: "file",
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (err) {
    cleanupTemp();
    console.error("upload work file error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to upload work file",
      message: "Upload failed on our side. Please try that file again.",
    });
  }
});

// ─── NDA UPLOAD ────────────────────────────────────────────────────────────────
/* Signed NDAs, outside /uploads: an agreement between two parties is not
   public, and the UI reads the stored URL only as a "has this side signed?"
   flag (see components/NdaCard.tsx), never as a link. */
const ndaUploadDir = tempUploadDir("nda");
if (!fs.existsSync(ndaUploadDir)) fs.mkdirSync(ndaUploadDir, { recursive: true });

const ndaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ndaUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || ".pdf");
    cb(null, `nda-${Date.now()}${ext}`);
  },
});
const uploadNdaFile = multer({ storage: ndaStorage, limits: { fileSize: 20 * 1024 * 1024 } });

router.post("/:dealId/upload-nda", requireAuth, uploadNdaFile.single("nda"), async (req, res) => {
  try {
    const deal = await HireDeal.findById(req.params.dealId)
      .populate("clientId", "name email profileImage image")
      .populate("freelancerId", "name email profileImage image");
    if (!deal) return res.status(404).json({ success: false, error: "Deal not found" });

    const userId = String(req.user._id);
    const isClient = String(deal.clientId._id) === userId;
    const isFreelancer = String(deal.freelancerId._id) === userId;

    if (!isClient && !isFreelancer)
      return res.status(403).json({ success: false, error: "Not part of this deal" });

    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });

    const fileUrl = `/uploads/nda/${req.file.filename}`;
    const now = new Date();

    /* The drawn signature, kept so the agreement renders signed forever.
       It used to live only in the modal's own state, so reopening the NDA
       showed a blank signature line. Capped: this is a small canvas PNG, and
       anything larger is not a signature. */
    const signatureDataUrl = String(req.body?.signature || "");
    const validSignature =
      signatureDataUrl.startsWith("data:image/") && signatureDataUrl.length <= 200_000
        ? signatureDataUrl
        : "";

    if (isClient) {
      deal.ndaClientUrl = fileUrl;
      deal.ndaClientSignedAt = now;
      if (validSignature) deal.ndaClientSignature = validSignature;
    } else {
      deal.ndaFreelancerUrl = fileUrl;
      deal.ndaFreelancerSignedAt = now;
      if (validSignature) deal.ndaFreelancerSignature = validSignature;
    }

    await deal.save();

    const bothSigned = !!(deal.ndaClientUrl && deal.ndaFreelancerUrl);
    const signer = isClient ? deal.clientId : deal.freelancerId;
    const otherParty = isClient ? deal.freelancerId : deal.clientId;
    const signerRoleLabel = isClient ? "Client" : "Freelancer";

    // 🔔 Notify the other party that this side has signed the NDA
    await Notification.create({
      senderId: signer._id,
      senderName: signer.name,
      senderEmail: signer.email,
      senderImage: signer.profileImage || signer.image,
      receiverUserId: otherParty._id,
      type: "HIRE_NDA_SIGNED",
      hireDealId: deal._id,
      chatId: deal.chatId,
      message: bothSigned
        ? `${signer.name || signerRoleLabel} has signed the NDA. Both parties have now signed — the NDA is complete!`
        : `${signer.name || signerRoleLabel} has signed the NDA for "${deal.title}". Waiting for you to sign.`,
      meta: { title: deal.title, signedBy: signerRoleLabel.toLowerCase(), bothSigned },
    });

    // 🔔 If this signature completes the NDA, also confirm it to the signer themself
    if (bothSigned) {
      await Notification.create({
        senderId: otherParty._id,
        senderName: otherParty.name,
        senderEmail: otherParty.email,
        senderImage: otherParty.profileImage || otherParty.image,
        receiverUserId: signer._id,
        type: "HIRE_NDA_SIGNED",
        hireDealId: deal._id,
        chatId: deal.chatId,
        message: `Both parties have signed the NDA for "${deal.title}". The NDA is complete!`,
        meta: { title: deal.title, bothSigned: true },
      });
    }

    return res.json({
      success: true,
      role: isClient ? "client" : "freelancer",
      url: fileUrl,
      bothSigned,
    });
  } catch (err) {
    console.error("upload-nda error:", err);
    return res.status(500).json({ success: false, error: "Failed to upload NDA" });
  }
});

// ─── ACCEPT PROPOSAL ───────────────────────────────────────────────────────────
router.post("/:dealId/accept", requireAuth, async (req, res) => {
  try {
    const deal = await HireDeal.findById(req.params.dealId)
      .populate("clientId", "name email profileImage image")
      .populate("freelancerId", "name email profileImage image");

    if (!deal) {
      return res.status(404).json({ success: false, error: "Hire deal not found" });
    }

    if (String(deal.freelancerId._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, error: "You cannot accept this proposal" });
    }

    if (deal.status !== "PENDING_ACCEPTANCE") {
      return res.status(400).json({ success: false, error: "This proposal is already processed" });
    }

    // Accepting is a commitment to be paid, and the money is routed to this
    // freelancer's Razorpay linked account and held there. An account Razorpay
    // hasn't ACTIVATED can't receive a transfer, so accepting would strand the
    // client's payment. Blocked here — with wording aimed at the freelancer,
    // since they're the one who has to fix it.
    const payoutReady = await checkPayoutReady(deal.freelancerId._id, "self");
    if (!payoutReady.ok) {
      return res.status(409).json({
        success: false,
        error: payoutReady.error,
        reason: payoutReady.reason,
        message: payoutReady.message,
      });
    }

    deal.status = "ACCEPTED_WAITING_PAYMENT";
    deal.acceptedAt = new Date();
    await deal.save();

    // ✅ FIXED: correct fields for Message model (conversationId + sender)
    await Message.create({
      conversationId: deal.chatId,
      sender: req.user._id,
      text: `HIRE_ACCEPTED::${JSON.stringify({
        hireDealId: String(deal._id),
        dealId: String(deal._id),
        title: deal.title,
        budget: deal.amount,
        amount: deal.amount,
        targetDate: deal.deliveryDate,
        status: "ACCEPTED",
        message: `${deal.freelancerId.name || "The creator"} accepted your hire proposal. Please make payment to begin.`,
      })}`,
      readBy: [req.user._id],
    });

    await Notification.create({
      senderId: req.user._id,
      senderName: deal.freelancerId.name,
      senderEmail: deal.freelancerId.email,
      senderImage: deal.freelancerId.profileImage || deal.freelancerId.image,
      receiverUserId: deal.clientId._id,
      type: "HIRE_PAYMENT_REQUIRED",
      hireDealId: deal._id,
      chatId: deal.chatId,
      amount: deal.amount,
      message: `${deal.freelancerId.name || "The creator"} accepted your hire proposal. Make payment to start work.`,
      meta: {
        title: deal.title,
        freelancerName: deal.freelancerId.name,
        freelancerEmail: deal.freelancerId.email,
        deliveryDate: deal.deliveryDate,
        paymentRequired: true,
      },
    });

    return res.json({ success: true, message: "Hire proposal accepted", deal });
  } catch (err) {
    console.error("accept hire error:", err);
    return res.status(500).json({ success: false, error: "Failed to accept hire proposal" });
  }
});

// ─── CANCEL / DECLINE (pre-payment only) ────────────────────────────────────────
router.post("/:dealId/cancel", requireAuth, async (req, res) => {
  try {
    const { reason } = req.body || {};
    const deal = await HireDeal.findById(req.params.dealId);

    if (!deal) {
      return res.status(404).json({ success: false, error: "Hire deal not found" });
    }

    const isClient = String(deal.clientId) === String(req.user._id);
    const isFreelancer = String(deal.freelancerId) === String(req.user._id);
    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, error: "Not part of this deal" });
    }

    if (!["PENDING_ACCEPTANCE", "ACCEPTED_WAITING_PAYMENT"].includes(deal.status)) {
      return res.status(400).json({
        success: false,
        error: "Deal can only be cancelled before payment. Use the refund flow once funded.",
      });
    }
    if (deal.paymentStatus !== "NOT_PAID") {
      return res.status(400).json({
        success: false,
        error: "Deal has already been paid for — cancellation isn't available anymore.",
      });
    }

    deal.status = "CANCELLED";
    deal.cancelledAt = new Date();
    deal.cancelReason = String(reason || "").slice(0, 500);
    // Which SIDE walked away, matching what the settlement service writes. This
    // used to store req.user._id, which only worked because a duplicate schema
    // declaration had quietly retyped the field as an ObjectId — the same
    // duplicate that made every post-payment settlement throw.
    deal.cancelledBy = isClient ? "buyer" : "seller";
    await deal.save();

    return res.json({ success: true, message: "Deal cancelled", deal });
  } catch (err) {
    console.error("cancel hire deal error:", err);
    return res.status(500).json({ success: false, error: "Failed to cancel deal" });
  }
});

// ─── CREATE RAZORPAY ORDER ──────────────────────────────────────────────────────
router.post("/:dealId/create-payment-order", requireAuth, blockIfSuspended, async (req, res) => {
  try {
    const deal = await HireDeal.findById(req.params.dealId);

    if (!deal) {
      return res.status(404).json({ success: false, error: "Hire deal not found" });
    }

    if (String(deal.clientId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, error: "Only client can make payment" });
    }

    // ✅ Allow both statuses — if already paid, block; otherwise proceed
    if (deal.paymentStatus === "PAID") {
      return res.status(400).json({ success: false, error: "Payment already done" });
    }

    if (deal.status !== "ACCEPTED_WAITING_PAYMENT") {
      return res.status(400).json({ success: false, error: "Deal is not ready for payment" });
    }

    if (!(deal.ndaClientUrl && deal.ndaFreelancerUrl)) {
      return res.status(400).json({
        success: false,
        error: "NDA_NOT_SIGNED",
        message: "Please sign the NDA before making payment.",
      });
    }

    const chargeAmount = Number(deal.totalPayable || deal.amount);

    // Re-checked even though accept already gated on it — the account can be
    // suspended in between, and this is the last moment before the client's
    // money is actually taken.
    const payoutReady = await checkPayoutReady(deal.freelancerId, "buyer");
    if (!payoutReady.ok) {
      return res.status(409).json({
        success: false,
        error: payoutReady.error,
        reason: payoutReady.reason,
        message: payoutReady.message,
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(chargeAmount * 100),
      currency: deal.currency || "INR",
      receipt: `tokun_hire_${deal._id}`,
      notes: {
        project: "Tokun",
        kind: "HIRE_ESCROW",
        dealId: String(deal._id),
        clientId: String(deal.clientId),
        freelancerId: String(deal.freelancerId),
      },
      /* Escrow. Attached to the order so Razorpay applies it as part of the
         capture — no window where the money is taken but the transfer failed.

         The FULL amount goes on hold, not the freelancer's post-commission
         share. Tokun's cut is reversed out of the hold when the work is
         approved; until then it sits in the same held transfer as the rest.

         This used to hold freelancerAmount only, and it broke the one case that
         matters most: an admin ruling wholly in the freelancer's favour owes
         them the whole ₹3,000 (Tokun waives its commission on anything it has
         to arbitrate) against a ₹2,850 hold. The ₹150 gap cannot be sent
         afterwards — a transfer from our own balance is a separate Razorpay
         feature that answers "This feature is not enabled for this merchant".
         Holding the whole amount means every outcome is payable out of the
         hold, with no second call needed. */
      transfers: [
        buildHeldTransfer({
          account: payoutReady.linkedAccountId,
          amountRupees: deal.totalPayable,
          notes: {
            kind: "HIRE_ESCROW",
            dealId: String(deal._id),
            dealTitle: deal.title,
          },
        }),
      ],
    });

    deal.razorpayOrderId = order.id;
    deal.routeLinkedAccountId = payoutReady.linkedAccountId;
    deal.paymentStatus = "ORDER_CREATED";
    await deal.save();

    return res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order,
    });
  } catch (err) {
    console.error("create hire payment order error:", err);
    return res.status(500).json({ success: false, error: "Failed to create payment order" });
  }
});

// ─── VERIFY PAYMENT ─────────────────────────────────────────────────────────────
router.post("/:dealId/verify-payment", requireAuth, blockIfSuspended, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const deal = await HireDeal.findById(req.params.dealId)
      .populate("clientId", "name email profileImage image")
      .populate("freelancerId", "name email profileImage image");

    if (!deal) {
      return res.status(404).json({ success: false, error: "Hire deal not found" });
    }

    if (String(deal.clientId._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, error: "Only client can verify this payment" });
    }

    // ✅ Signature verify
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: "Invalid payment signature" });
    }

    deal.razorpayOrderId = razorpay_order_id;
    deal.razorpayPaymentId = razorpay_payment_id;
    deal.razorpaySignature = razorpay_signature;
    deal.paymentStatus = "PAID";
    deal.fundsStatus = "HELD_BY_TOKUN";
    deal.status = "FUNDED";
    deal.paidAt = new Date();
    // Razorpay won't hold the transfer past this, so every decision about this
    // money has to happen before it.
    deal.escrowExpiresAt = escrowExpiryFrom(deal.paidAt);

    // The transfer was attached to the Razorpay order so it already exists —
    // but its id is only knowable by asking, and without it we'd have no handle
    // to release the escrow with later.
    //
    // Non-fatal on purpose: the payment IS captured and the money IS held by
    // Razorpay whether or not this lookup succeeds. Failing the request would
    // tell the client their payment didn't work, which is false. The transfer.*
    // webhook fills the id in if this misses.
    try {
      const transfersByAccount = await fetchTransferIdsByAccount(razorpay_payment_id);
      const transferId = deal.routeLinkedAccountId
        ? transfersByAccount.get(String(deal.routeLinkedAccountId))
        : [...transfersByAccount.values()][0];
      if (transferId) {
        deal.routeTransferId = transferId;
        deal.routeTransferStatus = "on_hold";
        // What the hold actually carries. Recorded rather than re-derived,
        // because deals funded before this change hold freelancerAmount and the
        // settlement math has to be able to tell the two apart.
        deal.routeHeldAmount = deal.totalPayable;
      }
    } catch (transferErr) {
      console.error("Hire deal transfer lookup failed:", transferErr.message);
    }

    await deal.save();

    // ✅ FIXED: correct Message fields
    await Message.create({
      conversationId: deal.chatId,
      sender: deal.clientId._id,
      text: `✅ Payment done! ₹${deal.amount.toLocaleString("en-IN")} is safely held by Tokun Escrow. Work can begin now.`,
      readBy: [deal.clientId._id],
    });

    // ✅ Notify freelancer
    await Notification.create({
      senderId: deal.clientId._id,
      senderName: deal.clientId.name,
      senderEmail: deal.clientId.email,
      senderImage: deal.clientId.profileImage || deal.clientId.image,
      receiverUserId: deal.freelancerId._id,
      type: "HIRE_PAYMENT_DONE",
      hireDealId: deal._id,
      chatId: deal.chatId,
      amount: deal.amount,
      message: `${deal.clientId.name || "Client"} made the payment. ₹${deal.amount} is safely held by Tokun. You can start work now.`,
      meta: {
        title: deal.title,
        clientName: deal.clientId.name,
        amount: deal.amount,
        fundsStatus: "HELD_BY_TOKUN",
      },
    });

    /* -------------------- INVOICE (safe — deal already saved) -------------------- */
    try {
      const client = deal.clientId;
      if (client?.email) {
        const invoiceNo = `INV-${deal._id}`;
        const date = new Date(deal.paidAt || Date.now()).toLocaleDateString("en-GB");

        const chargeAmount = Number(deal.totalPayable || deal.amount);
        const items = [
          {
            title: `Hire: ${deal.title || "Custom work"}`,
            subtitle: deal.freelancerId?.name ? `Freelancer: ${deal.freelancerId.name}` : undefined,
            price: chargeAmount,
          },
        ];
        // GST is off, matching generateInvoicePDF and the prompt/cart flows.
        //
        // It was being ADDED on top of chargeAmount — but chargeAmount IS what
        // Razorpay collected, so the email body claimed a total the client
        // never paid. The attached PDF had GST switched off already, so the
        // email and its own attachment disagreed on the same invoice.
        //
        // Re-enable only once GST registration and the inclusive/exclusive
        // treatment are settled — and change the CHARGE at the same time, not
        // just the invoice.
        const subtotal = chargeAmount;
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
          buyerName: client.name || "Customer",
          buyerEmail: client.email || "",
          items,
          // Makes the invoice say what this payment actually is — money held in
          // escrow until the client approves, and split by completion if the
          // project is cancelled after work starts.
          kind: "hire",
        });

        await sendInvoiceEmail({
          to: client.email,
          buyerName: client.name || "Customer",
          buyerEmail: client.email,
          items,
          invoiceNo,
          date,
          subtotal,
          gst,
          total,
          pdfBuffer,
          kind: "hire",
        });
      }
    } catch (invoiceErr) {
      // Invoice fail hone pe bhi payment-verified success hi return karo
      console.error("⚠️ Hire invoice/email failed (payment still verified):", invoiceErr.message);
    }

    return res.json({
      success: true,
      message: "Payment verified and held by Tokun",
      deal,
    });
  } catch (err) {
    console.error("verify hire payment error:", err);
    return res.status(500).json({ success: false, error: "Payment verification failed" });
  }
});

// ─── GET DEAL BY ID (frontend ke liye) ─────────────────────────────────────────
router.get("/:dealId", requireAuth, async (req, res) => {
  try {
    const deal = await HireDeal.findById(req.params.dealId)
      .populate("clientId", "name email profileImage image")
      .populate("freelancerId", "name email profileImage image");

    if (!deal) {
      return res.status(404).json({ success: false, error: "Deal not found" });
    }

    /* Optional chaining because a populated ref comes back NULL when the user
       it points at no longer exists — clientId/freelancerId are required on the
       schema, so they are never null in the document itself, only after
       populate fails to resolve them. Dereferencing that null threw a 500 on a
       deal whose counterparty had been deleted, which made the deal
       unreachable for the party who was still around.

       Failing to `false` is the safe direction: an id that can't be resolved
       can't be matched against the caller, so they are not a party to it. The
       surviving party still matches on their own side. */
    const isParty =
      String(deal.clientId?._id || "") === String(req.user._id) ||
      String(deal.freelancerId?._id || "") === String(req.user._id);

    if (!isParty) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    // Sent alongside the deal so the order screen can show "1 of 3 revisions
    // used" without re-deriving the cap. The service endpoint has always
    // returned this; hire deals only gained a cap alongside it, so this is the
    // matching half.
    return res.json({ success: true, deal, revisionState: getRevisionState(deal) });
  } catch (err) {
    console.error("get deal error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch deal" });
  }
});
/* ══════════════════════════════════════════════════════════════════════════
   GET /api/hire/:dealId/deliverables/:index/download

   The gate that makes escrow mean something on hire deals too. Mirrors the
   service route: /uploads was public static with guessable filenames, so a
   deliverable was fetchable by anyone who could construct the URL — before the
   client had approved, and by people who weren't party to the deal.

   Also where the watermark is applied. A client has to be able to SEE the work
   to approve it, but for image work seeing it is most of the value — nothing
   stopped someone previewing the final artwork and then cancelling. So while
   the money is still held, the client gets a stamped copy; the moment the
   escrow settles they get the original. The freelancer is never watermarked.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/:dealId/deliverables/:index/download", requireAuth, async (req, res) => {
  try {
    const deal = await HireDeal.findById(req.params.dealId).select(
      "clientId freelancerId deliverables fundsStatus"
    );
    if (!deal) return res.status(404).json({ success: false, error: "deal_not_found" });

    const isClient = String(deal.clientId) === String(req.user._id);
    const isFreelancer = String(deal.freelancerId) === String(req.user._id);
    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }

    const index = Number(req.params.index);
    const deliverable = deal.deliverables?.[index];
    if (!deliverable) {
      return res.status(404).json({ success: false, error: "deliverable_not_found" });
    }

    if (deliverable.kind === "link") {
      return res.json({ success: true, url: deliverable.url, kind: "link" });
    }

    // Pre-Azure record: still on this host's disk. Resolved here because the
    // escrow gate below needs to know where the bytes live either way.
    const legacyName = path.basename(String(deliverable.url || ""));
    const legacyPath = legacyName ? path.join(legacyWorkDir, legacyName) : "";
    const legacyExists = !!legacyPath && fs.existsSync(legacyPath);

    if (!deliverable.blobName && !legacyExists) {
      return res.status(404).json({
        success: false,
        error: "file_missing",
        message: "This file is no longer available. Ask the creator to re-upload it.",
      });
    }

    /* Same rule as the service route, decided by the same code: while the money
       is held the client gets MARKED BYTES or nothing — a stamped image, a
       watermark-burned video re-encode, or a refusal. Never the original.

       What this replaces is worth naming. An image whose format sharp couldn't
       decode came back untouched with `X-Tokun-Watermarked: 1` on it, and a
       video came back as a signed URL to the master with the mark drawn in CSS
       over the player. Both told the client they were protected while handing
       over the clean file. See utils/escrowPreviewGate.js. */
    if (isClient && !isSettled(deal.fundsStatus)) {
      return serveHeldPreview({
        res,
        name: deliverable.name,
        mimeType: deliverable.mimeType,
        blobName: deliverable.blobName || "",
        legacyPath: deliverable.blobName ? "" : legacyPath,
        state: deliverable,
        persist: (patch) =>
          HireDeal.updateOne(
            { _id: deal._id },
            {
              $set: Object.fromEntries(
                Object.entries(patch).map(([k, v]) => [`deliverables.${index}.${k}`, v])
              ),
            }
          ),
      });
    }

    // Settled, or the freelancer asking for their own file: the original.
    if (deliverable.blobName) {
      return res.json({
        success: true,
        kind: "file",
        name: deliverable.name,
        url: getWorkFileDownloadUrl(deliverable.blobName),
        heldInEscrow: false,
      });
    }

    // Streamed through the same auth check rather than handing back the public
    // /uploads path.
    return res.download(legacyPath, deliverable.name || legacyName);
  } catch (err) {
    console.error("download hire deliverable error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// ─── 1. Work Submit (Ashutosh submits deliverables) ───
// ─── Submit work deliverables ────────────────────────────
router.post("/:dealId/submit-work", requireAuth, async (req, res) => {
  try {
    const { deliverables, note } = req.body;

    const deal = await HireDeal.findById(req.params.dealId)
      .populate("clientId", "name email profileImage image")
      .populate("freelancerId", "name email profileImage image");

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: "Deal not found",
      });
    }

    if (String(deal.freelancerId._id) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: "Only freelancer can submit work",
      });
    }

    if (!["FUNDED", "IN_PROGRESS", "REVISION_REQUESTED"].includes(deal.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot submit. Current status: ${deal.status}`,
      });
    }

    /* A delivery is either an uploaded file or a LINK the freelancer pasted —
       a GitHub repo, a Drive folder, a deployed URL. Service bookings accepted
       links already; hire deals didn't, which meant the most common way to hand
       over a built site ("here's the deployment") had nowhere to go. */
    const normalizedDeliverables = [];
    for (const d of Array.isArray(deliverables) ? deliverables : []) {
      if (d?.kind === "link") {
        const link = normalizeDeliverableLink(d.url, d.name);
        if (!link.ok) {
          return res.status(400).json({ success: false, error: "invalid_link", message: link.message });
        }
        normalizedDeliverables.push({
          kind: "link",
          provider: link.provider,
          url: link.url,
          name: link.label,
          description: d.description || link.label,
          size: 0,
          mimeType: "",
          blobName: "",
          uploadedAt: new Date(),
        });
        continue;
      }

      if (!d?.url) continue;
      normalizedDeliverables.push({
        kind: "file",
        provider: "",
        url: d.url,
        blobName: d.blobName || "",
        name: d.name || d.description || "Work file",
        description: d.description || d.name || "Work file",
        size: d.size || 0,
        mimeType: d.mimeType || "",
        uploadedAt: new Date(),
      });
    }

    if (!normalizedDeliverables.length && !String(note || "").trim()) {
      return res.status(400).json({
        success: false,
        error: "empty_submission",
        message: "Attach a file, add a repo/deployment link, or write a note before submitting.",
      });
    }

    deal.status = "WORK_SUBMITTED";
    deal.workSubmittedAt = new Date();
    deal.deliverables = normalizedDeliverables;
    // Appended, never replaced — see the comment on HireDeal.submissions.
    deal.submissions = [
      ...(deal.submissions || []),
      {
        version: (deal.submissions?.length || 0) + 1,
        note: note || "",
        deliverables: normalizedDeliverables,
        submittedAt: new Date(),
      },
    ];
    deal.submissionNote = note || "";
    await deal.save();

    /* Start the watermarked review copy of any video straight away — an ffmpeg
       pass over a real edit is minutes, and the client shouldn't meet a spinner
       on their first click. Fire-and-forget: their own request re-checks and
       records the outcome, and a failed encode must not fail this submission. */
    deal.deliverables.forEach((d, i) => {
      if (d.kind === "link" || !d.blobName) return;
      if (!isPreviewableVideo(d.name, d.mimeType)) return;
      warmVideoPreview({
        blobName: d.blobName,
        state: d,
        persist: (patch) =>
          HireDeal.updateOne(
            { _id: deal._id },
            {
              $set: Object.fromEntries(
                Object.entries(patch).map(([k, v]) => [`deliverables.${i}.${k}`, v])
              ),
            }
          ),
      });
    });

    await Notification.create({
      senderId: req.user._id,
      senderName: deal.freelancerId.name,
      senderEmail: deal.freelancerId.email,
      senderImage: deal.freelancerId.profileImage || deal.freelancerId.image,

      receiverUserId: deal.clientId._id,

      type: "HIRE_WORK_SUBMITTED",
      hireDealId: deal._id,
      chatId: deal.chatId,

      message: `${deal.freelancerId.name || "The creator"} submitted the project work. Review it and approve or request revision.`,
      meta: {
        title: deal.title,
        note: note || "",
        deliverables: normalizedDeliverables,
        status: "WORK_SUBMITTED",
      },
    });

    /* The client gets this by email too, and it carries the auto-release date.
       That date is the part with consequences: do nothing for 72 hours and the
       escrow pays out on its own (cron/autoReleaseEscrow.js). Running that
       clock on an in-app badge alone was never fair to the person whose money
       it is. */
    try {
      await sendWorkSubmittedEmail({
        to: deal.clientId.email,
        clientName: deal.clientId.name,
        creatorName: deal.freelancerId.name,
        title: deal.title,
        amount: deal.freelancerAmount ?? deal.amount,
        autoReleaseAt: new Date(Date.now() + AUTO_RELEASE_HOURS * 60 * 60 * 1000),
        orderPath: `/orders/hire/${deal._id}`,
      });
    } catch (mailErr) {
      console.error("Work-submitted email failed (submission stands):", mailErr.message);
    }

    await Message.create({
      conversationId: deal.chatId,
      sender: req.user._id,
      text: `WORK_SUBMITTED::${JSON.stringify({
        hireDealId: String(deal._id),
        dealId: String(deal._id),
        title: deal.title,
        amount: deal.amount,
        budget: deal.amount,
        note: note || "",
        // Indexed, not URL-bearing: an uploaded file is fetched through
        // /deliverables/:index/download, so the chat message itself never
        // carries anything openable without an auth check — and the client's
        // copy goes through the watermark on the way out.
        deliverables: normalizedDeliverables.map((d, index) => ({
          index,
          kind: d.kind || "file",
          provider: d.provider || "",
          name: d.name,
          size: d.size || 0,
          mimeType: d.mimeType || "",
          url: d.kind === "link" ? d.url : "",
        })),
        status: "WORK_SUBMITTED",
        message: `${deal.freelancerId.name || "The creator"} submitted the project work. Please review the attached files.`,
      })}`,
      readBy: [req.user._id],
    });

    return res.json({
      success: true,
      message: "Work submitted successfully",
      deal,
    });
  } catch (err) {
    console.error("submit-work error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to submit work",
    });
  }
});

// ─── 2. Start Work ───
router.post("/:dealId/start-work", requireAuth, async (req, res) => {
  try {
    const deal = await HireDeal.findById(req.params.dealId)
      .populate("clientId", "name email")
      .populate("freelancerId", "name email");

    if (!deal) return res.status(404).json({ success: false, error: "Deal not found" });
    if (String(deal.freelancerId._id) !== String(req.user._id))
      return res.status(403).json({ success: false, error: "Only freelancer can start work" });
    if (deal.status !== "FUNDED")
      return res.status(400).json({ success: false, error: `Cannot start. Status: ${deal.status}` });

    deal.status = "IN_PROGRESS";
    deal.workStartedAt = new Date();
    await deal.save();

    await Notification.create({
      senderId: req.user._id,
      senderName: deal.freelancerId.name,
      receiverUserId: deal.clientId._id,
      type: "HIRE_WORK_STARTED",
      hireDealId: deal._id,
      message: `${deal.freelancerId.name} ne kaam shuru kar diya!`,
      meta: { title: deal.title },
    });

    return res.json({ success: true, message: "Work started", deal });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to start work" });
  }
});

// ─── 3. Approve Work + Release Payment ───

router.post("/:dealId/approve-work", requireAuth, async (req, res) => {
  try {
    const deal = await HireDeal.findById(req.params.dealId)
      .populate("clientId", "name email")
      .populate("freelancerId", "name email");
 
    if (!deal)
      return res.status(404).json({ success: false, error: "Deal not found" });
 
    if (String(deal.clientId._id) !== String(req.user._id))
      return res
        .status(403)
        .json({ success: false, error: "Only client can approve" });
 
    if (deal.status !== "WORK_SUBMITTED")
      return res.status(400).json({
        success: false,
        error: `Cannot approve. Current status: ${deal.status}`,
      });
 
    if (deal.fundsStatus !== "HELD_BY_TOKUN")
      return res
        .status(400)
        .json({ success: false, error: "Funds not in escrow" });

    const payoutAmount = Number(deal.freelancerAmount || 0);

    if (!payoutAmount || payoutAmount <= 0)
      return res
        .status(400)
        .json({ success: false, error: "Invalid payout amount" });

    // ── Atomically claim + credit freelancer wallet + record commission ────
    // (shared with admin force-release and the auto-release cron so this
    // logic only exists once, and the same deal can never be credited twice)
    let releaseResult;
    try {
      releaseResult = await releaseEscrowToFreelancer(deal._id, "client_approved", actorFromReq(req));
    } catch (releaseErr) {
      if (releaseErr instanceof EscrowAlreadyReleasedError) {
        return res.status(400).json({
          success: false,
          error: "Escrow was already released for this deal",
        });
      }
      throw releaseErr;
    }
    const wallet = releaseResult.wallet;
    deal.status = releaseResult.deal.status;
    deal.fundsStatus = releaseResult.deal.fundsStatus;
    deal.approvedAt = releaseResult.deal.approvedAt;
    deal.releasedAt = releaseResult.deal.releasedAt;

    // ── Notify freelancer ───────────────────────────────────────────────────
    await Notification.create({
      senderId: deal.clientId._id,
      senderName: deal.clientId.name,
      receiverUserId: deal.freelancerId._id,
      type: "HIRE_PAYMENT_RELEASED",
      hireDealId: deal._id,
      amount: payoutAmount,
      message: `${deal.clientId.name} approved your work! ₹${payoutAmount} has been credited to your Tokun Wallet. You can withdraw to your bank anytime.`,
      meta: {
        title: deal.title,
        amount: payoutAmount,
        fundsStatus: "RELEASED_TO_FREELANCER",
      },
    });

    // Getting paid is worth an email — this was in-app only.
    try {
      await sendEscrowReleasedEmail({
        to: deal.freelancerId.email,
        creatorName: deal.freelancerId.name,
        clientName: deal.clientId.name,
        title: deal.title,
        amount: payoutAmount,
        automatic: false,
      });
    } catch (mailErr) {
      console.error("Escrow-released email failed (payout stands):", mailErr.message);
    }
 
    // ── Chat message ────────────────────────────────────────────────────────
    await Message.create({
      conversationId: deal.chatId,
      sender: req.user._id,
      text: `ESCROW_RELEASED::${JSON.stringify({
        hireDealId: String(deal._id),
        title: deal.title,
        amount: payoutAmount,
        status: "COMPLETED",
        message: `✅ Payment released! ₹${payoutAmount} has been credited to the creator's Tokun Wallet.`,
      })}`,
      readBy: [req.user._id],
    });
 
    return res.json({
      success: true,
      message: `₹${payoutAmount} credited to the creator's Tokun Wallet`,
      deal,
      // null once the money goes out over Route instead of the internal
      // ledger — there is no Tokun-side balance to report, Razorpay settles it
      // to the freelancer's own bank. Only legacy deals still return a wallet.
      walletBalance: wallet ? wallet.availableBalance : null,
    });
  } catch (err) {
    console.error("approve-work error:", err);
    return res
      .status(500)
      .json({ success: false, error: err?.message || "Failed to approve work" });
  }
});
// ─── 4. Request Revision ───
router.post("/:dealId/request-revision", requireAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const deal = await HireDeal.findById(req.params.dealId)
      .populate("clientId", "name email")
      .populate("freelancerId", "name email");

    if (!deal) return res.status(404).json({ success: false, error: "Deal not found" });
    if (String(deal.clientId._id) !== String(req.user._id))
      return res.status(403).json({ success: false, error: "Only client can request revision" });
    if (deal.status !== "WORK_SUBMITTED")
      return res.status(400).json({ success: false, error: "Work not submitted yet" });

    // The cap agreed at proposal time. Without this the endpoint just appended,
    // so a client could send the same project back forever and the
    // freelancer's payout would stay frozen in escrow for as long as they felt
    // like — and now that escrow has a hard 90-day ceiling, an uncapped loop
    // can run the whole hold out.
    const revisionState = getRevisionState(deal);
    if (revisionState.exhausted) {
      return res.status(400).json({
        success: false,
        error: "revisions_exhausted",
        message: `This project included ${revisionState.allowed} revision${
          revisionState.allowed === 1 ? "" : "s"
        }, and you've used ${revisionState.used}. Approve the work, or cancel and let our team decide the split if something is genuinely wrong.`,
        revisionState,
      });
    }

    deal.status = "REVISION_REQUESTED";
    deal.revisions = [...(deal.revisions || []), { reason, requestedAt: new Date() }];
    await deal.save();

    const updatedRevisionState = getRevisionState(deal);

    await Notification.create({
      senderId: req.user._id,
      senderName: deal.clientId.name,
      receiverUserId: deal.freelancerId._id,
      type: "HIRE_REVISION_REQUESTED",
      hireDealId: deal._id,
      message: `${deal.clientId.name} requested a revision (${updatedRevisionState.label}): ${reason || "No reason given"}`,
      meta: { title: deal.title, reason, revisionState: updatedRevisionState },
    });

    // A revision is work the freelancer has to actually do, and the payout sits
    // frozen until it's done — not something to leave sitting in a badge.
    try {
      await sendRevisionRequestedEmail({
        to: deal.freelancerId.email,
        creatorName: deal.freelancerId.name,
        clientName: deal.clientId.name,
        title: deal.title,
        note: reason,
        dueAt: deal.deliveryDate,
      });
    } catch (mailErr) {
      console.error("Revision email failed (revision still recorded):", mailErr.message);
    }

    return res.json({
      success: true,
      message: updatedRevisionState.unlimited
        ? "Revision requested"
        : `Revision requested — ${updatedRevisionState.remaining} of ${updatedRevisionState.allowed} left`,
      deal,
      revisionState: updatedRevisionState,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to request revision" });
  }
});

// ─── 5. GET deal status (SelfDash ke liye) ───
router.get("/:dealId", requireAuth, async (req, res) => {
  try {
    const deal = await HireDeal.findById(req.params.dealId)
      .populate("clientId", "name email avatar")
      .populate("freelancerId", "name email avatar");

    if (!deal) return res.status(404).json({ success: false, error: "Deal not found" });

    const isParty =
      String(deal.clientId._id) === String(req.user._id) ||
      String(deal.freelancerId._id) === String(req.user._id);

    if (!isParty) return res.status(403).json({ success: false, error: "Not authorized" });

    return res.json({ success: true, deal });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch deal" });
  }
});


// ─── GET my earnings + requests + active projects (SelfDash ke liye) ───
/**
 * GET /api/hire/my/refunds — hire deals of mine that were refunded.
 *
 * Deliberately different in shape from a prompt refund: there is no request
 * flow here. A client cannot file a hire refund — an admin issues it from the
 * escrow dashboard (adminEscrow.js) — so these only ever exist in one state,
 * already refunded. The UI must not imply a pending/declined step that doesn't
 * exist.
 *
 * Scoped to clientId because the client is the side the money goes back to.
 */
router.get("/my/refunds", requireAuth, async (req, res) => {
  try {
    const deals = await HireDeal.find({
      clientId: req.user._id,
      status: "REFUNDED",
    })
      .select("title amount totalPayable refundedAt refundReason razorpayRefundId createdAt freelancerId")
      .populate("freelancerId", "name email")
      .sort({ refundedAt: -1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      refunds: deals.map((d) => ({
        id: String(d._id),
        title: d.title || "Hire deal",
        // totalPayable is what the client actually paid (amount + clientFee),
        // and it's what adminEscrow refunds — not `amount`.
        refundAmount: Number(d.totalPayable || d.amount || 0),
        reason: d.refundReason || "",
        razorpayRefundId: d.razorpayRefundId || null,
        refundedAt: d.refundedAt || null,
        createdAt: d.createdAt,
        counterpartyName: d.freelancerId?.name || d.freelancerId?.email || null,
      })),
    });
  } catch (err) {
    console.error("hire my/refunds error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

router.get("/my/earnings", requireAuth, async (req, res) => {
  try {
    const freelancerId = req.user._id;

    // New Requests: client ne hire request bheji, freelancer ne accept nahi kiya
    const requestDeals = await HireDeal.find({
      freelancerId,
      status: "PENDING_ACCEPTANCE",
    })
      .populate("clientId", "name email profileImage image avatar")
      .sort({ createdAt: -1 });

    // Active Projects: freelancer ne accept kar liya
    const projectDeals = await HireDeal.find({
      freelancerId,
      status: {
        $in: [
          "ACCEPTED_WAITING_PAYMENT",
          "FUNDED",
          "IN_PROGRESS",
          "WORK_SUBMITTED",
          "REVISION_REQUESTED",
          "COMPLETED",
        ],
      },
    })
      .populate("clientId", "name email profileImage image avatar")
      .sort({ acceptedAt: -1, createdAt: -1 });

    // Earnings: sirf completed + released payment
    const completedDeals = await HireDeal.find({
      freelancerId,
      status: "COMPLETED",
      fundsStatus: "RELEASED_TO_FREELANCER",
    }).sort({ approvedAt: -1 });

    const totalEarnings = completedDeals.reduce(
      (sum, d) => sum + Number(d.freelancerAmount || 0),
      0
    );

    return res.json({
      success: true,

      // earning card ke liye
      totalEarnings,

      // active requests card ke liye
      activeRequests: requestDeals.length,

      // total projects card ke liye
      totalDeals: projectDeals.length,
      totalProjects: projectDeals.length,

      // New Requests section ke liye
      requests: requestDeals.map((d) => ({
        _id: d._id,
        title: d.title,
        description: d.description,
        amount: d.amount,
        budget: d.amount,
        clientId: d.clientId,
        clientName: d.clientId?.name || "Client",
        deliveryDate: d.deliveryDate,
        status: d.status,
        createdAt: d.createdAt,
      })),

      // Active Projects section ke liye
     projects: projectDeals.map((d) => ({
  _id: d._id,
  title: d.title,
  description: d.description,
  amount: d.amount,
  budget: d.amount,
  clientId: d.clientId,
  clientName: d.clientId?.name || "Client",
  deliveryDate: d.deliveryDate,
  status: d.status,
  fundsStatus: d.fundsStatus,
  paymentStatus: d.paymentStatus,
  acceptedAt: d.acceptedAt,
  createdAt: d.createdAt,
  workStartedAt: d.workStartedAt,
  workSubmittedAt: d.workSubmittedAt,
  approvedAt: d.approvedAt,
  deliverables: d.deliverables || [],
  submissionNote: d.submissionNote || "",
  revisions: d.revisions || [],
})),

      // earning history ke liye
      deals: completedDeals.map((d) => ({
        _id: d._id,
        title: d.title,
        amount: d.freelancerAmount,
        clientId: d.clientId,
        approvedAt: d.approvedAt,
        status: d.status,
      })),
    });
  } catch (err) {
    console.error("fetch my earnings error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch earnings",
    });
  }
});

module.exports = router;


