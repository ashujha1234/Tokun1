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
const { requireAuth } = require("../utils/auth");
const HireDeal = require("../models/HireDeal");
const Notification = require("../models/Notification");
const Message = require("../models/Message");

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
const workUploadDir = path.join(__dirname, "../uploads/hire-work");

if (!fs.existsSync(workUploadDir)) {
  fs.mkdirSync(workUploadDir, { recursive: true });
}

const workStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, workUploadDir);
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

const uploadWorkFile = multer({
  storage: workStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});














// ─── CREATE PROPOSAL ───────────────────────────────────────────────────────────
router.post("/create-proposal", requireAuth, async (req, res) => {
  try {
    const {
      freelancerId,
      conversationId,
      title,
      description,
      budget,
      targetDate,
      deliveryPreference,
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

    const deal = await HireDeal.create({
      clientId: req.user._id,
      freelancerId,
      chatId: conversationId,
      title: title || "Project Proposal",
      description: description || "",
      amount,
      platformFee: 0,
      freelancerAmount: amount,
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
      status: "PENDING",
    };

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
router.post("/:dealId/upload-work-file", requireAuth, uploadWorkFile.single("file"), async (req, res) => {
  try {
    const deal = await HireDeal.findById(req.params.dealId);

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: "Deal not found",
      });
    }

    if (String(deal.freelancerId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: "Only freelancer can upload work files",
      });
    }

    if (!["FUNDED", "IN_PROGRESS", "REVISION_REQUESTED"].includes(deal.status)) {
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

    const fileUrl = `/uploads/hire-work/${req.file.filename}`;

    return res.json({
      success: true,
      file: {
        url: fileUrl,
        name: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (err) {
    console.error("upload work file error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to upload work file",
    });
  }
});

// ─── NDA UPLOAD ────────────────────────────────────────────────────────────────
const ndaUploadDir = path.join(__dirname, "../uploads/nda");
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

    if (isClient) {
      deal.ndaClientUrl = fileUrl;
      deal.ndaClientSignedAt = now;
    } else {
      deal.ndaFreelancerUrl = fileUrl;
      deal.ndaFreelancerSignedAt = now;
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
        message: `${deal.freelancerId.name || "Freelancer"} accepted your hire proposal. Please make payment to begin.`,
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
      message: `${deal.freelancerId.name || "Freelancer"} accepted your hire proposal. Make payment to start work.`,
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

// ─── CREATE RAZORPAY ORDER ──────────────────────────────────────────────────────
router.post("/:dealId/create-payment-order", requireAuth, async (req, res) => {
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

    const order = await razorpay.orders.create({
      amount: Math.round(Number(deal.amount) * 100),
      currency: deal.currency || "INR",
      receipt: `hire_${deal._id}`,
      notes: {
        dealId: String(deal._id),
        clientId: String(deal.clientId),
        freelancerId: String(deal.freelancerId),
      },
    });

    deal.razorpayOrderId = order.id;
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
router.post("/:dealId/verify-payment", requireAuth, async (req, res) => {
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

    const isParty =
      String(deal.clientId._id) === String(req.user._id) ||
      String(deal.freelancerId._id) === String(req.user._id);

    if (!isParty) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    return res.json({ success: true, deal });
  } catch (err) {
    console.error("get deal error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch deal" });
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

    const normalizedDeliverables = Array.isArray(deliverables)
      ? deliverables.map((d) => ({
          url: d.url,
          name: d.name || d.description || "Work file",
          description: d.description || d.name || "Work file",
          size: d.size || 0,
          mimeType: d.mimeType || "",
          uploadedAt: new Date(),
        }))
      : [];

    if (!normalizedDeliverables.length && !String(note || "").trim()) {
      return res.status(400).json({
        success: false,
        error: "Attach at least one file or add a note",
      });
    }

    deal.status = "WORK_SUBMITTED";
    deal.workSubmittedAt = new Date();
    deal.deliverables = normalizedDeliverables;
    deal.submissionNote = note || "";
    await deal.save();

    await Notification.create({
      senderId: req.user._id,
      senderName: deal.freelancerId.name,
      senderEmail: deal.freelancerId.email,
      senderImage: deal.freelancerId.profileImage || deal.freelancerId.image,

      receiverUserId: deal.clientId._id,

      type: "HIRE_WORK_SUBMITTED",
      hireDealId: deal._id,
      chatId: deal.chatId,

      message: `${deal.freelancerId.name || "Freelancer"} submitted the project work. Review it and approve or request revision.`,
      meta: {
        title: deal.title,
        note: note || "",
        deliverables: normalizedDeliverables,
        status: "WORK_SUBMITTED",
      },
    });

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
        deliverables: normalizedDeliverables,
        status: "WORK_SUBMITTED",
        message: `${deal.freelancerId.name || "Freelancer"} submitted the project work. Please review the attached files.`,
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
 
    // ── Credit freelancer Tokun Wallet ──────────────────────────────────────
    const wallet = await getOrCreateWallet(deal.freelancerId._id);
    wallet.availableBalance = (wallet.availableBalance || 0) + payoutAmount;
    wallet.totalRevenue = (wallet.totalRevenue || 0) + payoutAmount;
 
    wallet.transactions.unshift({
      type: "credit",
      status: "Completed",
      amount: payoutAmount,
      description: `Escrow released: ${deal.title || "Hire Deal"}`,
      createdAt: new Date(),
      meta: {
        source: "escrow_release",
        hireDealId: String(deal._id),
        clientName: deal.clientId?.name || "",
        clientId: deal.clientId?._id || null,
      },
    });
 
    await wallet.save();
 
    // ── Update deal ─────────────────────────────────────────────────────────
    deal.status = "COMPLETED";
    deal.fundsStatus = "RELEASED_TO_FREELANCER";
    deal.approvedAt = new Date();
    await deal.save();
 
    // ── Update freelancer user stats ────────────────────────────────────────
    await User.findByIdAndUpdate(deal.freelancerId._id, {
      $inc: {
        totalEarnings: payoutAmount,
        completedDeals: 1,
      },
    });
 
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
 
    // ── Chat message ────────────────────────────────────────────────────────
    await Message.create({
      conversationId: deal.chatId,
      sender: req.user._id,
      text: `ESCROW_RELEASED::${JSON.stringify({
        hireDealId: String(deal._id),
        title: deal.title,
        amount: payoutAmount,
        status: "COMPLETED",
        message: `✅ Payment released! ₹${payoutAmount} has been credited to freelancer's Tokun Wallet.`,
      })}`,
      readBy: [req.user._id],
    });
 
    return res.json({
      success: true,
      message: `₹${payoutAmount} credited to freelancer's Tokun Wallet`,
      deal,
      walletBalance: wallet.availableBalance,
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

    deal.status = "REVISION_REQUESTED";
    deal.revisions = [...(deal.revisions || []), { reason, requestedAt: new Date() }];
    await deal.save();

    await Notification.create({
      senderId: req.user._id,
      senderName: deal.clientId.name,
      receiverUserId: deal.freelancerId._id,
      type: "HIRE_REVISION_REQUESTED",
      hireDealId: deal._id,
      message: `${deal.clientId.name} ne revision manga: ${reason || "No reason given"}`,
      meta: { title: deal.title, reason },
    });

    return res.json({ success: true, message: "Revision requested", deal });
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


