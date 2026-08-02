// const express = require("express");
// const Service = require("../models/Service");
// const upload = require("../utils/serviceUpload");
// const { requireAuth } = require("../utils/auth");

// const router = express.Router();

// /* ================= CREATE SERVICE ================= */
// router.post(
//   "/create",
//   requireAuth,
//   upload.array("media", 8),
//   async (req, res) => {
//     try {
//       const {
//         title,
//         description,
//         category,
//         subCategory,
//         screens,
//         prototype,
//         fileType,
//         delivery,
//         revisions,
//         price,
//       } = req.body;

//       if (!title || !description || !category || !price) {
//         return res.status(400).json({
//           success: false,
//           error: "Missing required fields",
//         });
//       }

//       const media = req.files?.map(
//         (f) => `/uploads/services/${f.filename}`
//       ) || [];

//       const service = await Service.create({
//         userId: req.user._id,
//         title,
//         description,
//         category,
//         subCategory,
//         screens,
//         prototype,
//         fileType,
//         delivery,
//         revisions,
//         price,
//         media,
//       });

//       res.json({ success: true, service });
//     } catch (e) {
//       console.error("Create service error:", e);
//       res.status(500).json({ success: false, error: "Create failed" });
//     }
//   }
// );


// /* ================= GET USER SERVICES ================= */
// router.get("/my", requireAuth, async (req, res) => {
//   try {
//     const services = await Service.find({ userId: req.user._id })
//       .populate("category", "name")
//       .populate("subCategory", "name")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, services });
//   } catch (e) {
//     console.error("Get services error:", e);
//     res.status(500).json({ success: false });
//   }
// });


// // GET services of ANY user (public)
// router.get("/user/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ success: false });
//     }

//     const services = await Service.find({ userId })
//       .populate("category", "name")
//       .populate("subCategory", "name")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, services });
//   } catch (err) {
//     console.error("Get user services error:", err);
//     res.status(500).json({ success: false });
//   }
// });


// module.exports = router;

const express = require("express");
const mongoose = require("mongoose"); // ✅ FIX
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Service = require("../models/Service");
const ServiceOrder = require("../models/ServiceOrder");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const razorpay = require("../utils/razorpay");
const upload = require("../utils/serviceUpload");
const { requireAuth } = require("../utils/auth");
const uploadToAzure = require("../utils/uploadToAzure");
const { generateInvoicePDF } = require("../services/invoice.service");
const { sendInvoiceEmail } = require("../services/email.service");
const {
  releaseServiceEscrowToSeller,
  ServiceEscrowAlreadyReleasedError,
} = require("../services/serviceEscrowRelease.service");
const router = express.Router();

// ─── Work file upload setup (mirrors hire.routes.js's hire-work dir) ───
const workUploadDir = path.join(__dirname, "../uploads/service-work");
if (!fs.existsSync(workUploadDir)) fs.mkdirSync(workUploadDir, { recursive: true });

const workStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, workUploadDir),
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
const uploadWorkFile = multer({ storage: workStorage, limits: { fileSize: 50 * 1024 * 1024 } });

// ─── NDA upload setup (mirrors hire.routes.js's nda dir) ───
const ndaUploadDir = path.join(__dirname, "../uploads/service-nda");
if (!fs.existsSync(ndaUploadDir)) fs.mkdirSync(ndaUploadDir, { recursive: true });

const ndaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ndaUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || ".pdf");
    cb(null, `nda-${Date.now()}${ext}`);
  },
});
const uploadNdaFile = multer({ storage: ndaStorage, limits: { fileSize: 20 * 1024 * 1024 } });

/* ================= CREATE SERVICE ================= */
router.post(
  "/create",
  requireAuth,
  upload.array("media", 8),
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        subCategory,
        screens,
        prototype,
        fileType,
        delivery,
        revisions,
        price,
      } = req.body;

      if (!title || !description || !category || !price) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

const media = [];

if (req.files?.length) {
  for (const file of req.files) {
   const azureUrl = await uploadToAzure(
  file.buffer,          // ✅ buffer
  file.originalname,    // ✅ filename
  "services"             // ✅ container
);
    media.push(azureUrl);
  }
}

      const service = await Service.create({
        userId: req.user._id,
        title,
        description,
        category,
        subCategory,
        screens,
        prototype,
        fileType,
        delivery,
        revisions,
        price,
        media,
      });

      res.json({ success: true, service });
    } catch (e) {
      console.error("Create service error:", e);
      res.status(500).json({ success: false });
    }
  }
);

/* ================= GET OWN SERVICES ================= */
router.get("/my", requireAuth, async (req, res) => {
  try {
    const services = await Service.find({ userId: req.user._id })
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, services });
  } catch (e) {
    console.error("Get services error:", e);
    res.status(500).json({ success: false });
  }
});

/* ================= GET PUBLIC USER SERVICES ================= */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false });
    }

    const services = await Service.find({ userId })
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, services });
  } catch (err) {
    console.error("Get user services error:", err);
    res.status(500).json({ success: false });
  }
});

/* ================= BOOK SERVICE — CREATE ORDER + CHAT CARD ================= */
// Mirrors /api/hire/create-proposal: this only records the booking, it does
// NOT create a Razorpay order yet — that happens later when the buyer clicks
// "Pay Now" on the card inside chat (create-payment-order below).
router.post("/:serviceId/book", requireAuth, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { note, preferredDate, conversationId } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ success: false, error: "invalid_service_id" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, error: "service_not_found" });
    }

    if (String(service.userId) === String(req.user._id)) {
      return res.status(400).json({ success: false, error: "cannot_book_own_service" });
    }

    const amount = Number(service.price);
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: "invalid_service_price" });
    }

    // Same commission model as the hire-escrow flow: Tokun's cut is deducted
    // from the seller's payout AND added on top of what the buyer pays.
    const commissionPercent = Number(process.env.TOKUN_COMMISSION_PERCENT || 0);
    const platformFee = +(amount * commissionPercent / 100).toFixed(2);
    const sellerAmount = +(amount - platformFee).toFixed(2);
    const clientFee = +(amount * commissionPercent / 100).toFixed(2);
    const totalPayable = +(amount + clientFee).toFixed(2);

    const order = await ServiceOrder.create({
      buyerId: req.user._id,
      sellerId: service.userId,
      serviceId: service._id,
      chatId: conversationId || null,
      serviceTitle: service.title,
      serviceMedia: service.media?.[0] || null,
      amount,
      platformFee,
      sellerAmount,
      clientFee,
      totalPayable,
      currency: "INR",
      note: note || "",
      preferredDate: preferredDate ? new Date(preferredDate) : null,
      status: "PENDING_PAYMENT",
      paymentStatus: "NOT_PAID",
    });

    const cardPayload = {
      serviceOrderId: String(order._id),
      orderId: String(order._id),
      serviceId: String(service._id),
      title: service.title,
      serviceTitle: service.title,
      amount: totalPayable,
      basePrice: amount,
      note: order.note,
      preferredDate: order.preferredDate,
      media: order.serviceMedia,
      status: "PENDING_PAYMENT",
      message: `Booking request for "${service.title}". Complete payment to confirm.`,
    };

    // Notify seller a booking request has come in
    try {
      const buyer = await mongoose.model("User").findById(req.user._id).select("name email profileImage image");
      await Notification.create({
        senderId: req.user._id,
        senderName: buyer?.name,
        senderEmail: buyer?.email,
        senderImage: buyer?.profileImage || buyer?.image,
        receiverUserId: service.userId,
        type: "SERVICE_BOOKING_REQUESTED",
        amount,
        message: `${buyer?.name || "A client"} wants to book your service "${service.title}".`,
        meta: { serviceTitle: service.title, orderId: String(order._id), amount },
      });
    } catch (notifyErr) {
      console.error("Service booking-requested notification failed:", notifyErr);
    }

    return res.json({ success: true, order, cardPayload });
  } catch (err) {
    console.error("book service error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= NDA UPLOAD (both parties sign) ================= */
router.post("/orders/:orderId/upload-nda", requireAuth, uploadNdaFile.single("nda"), async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.orderId)
      .populate("buyerId", "name email profileImage image")
      .populate("sellerId", "name email profileImage image");
    if (!order) return res.status(404).json({ success: false, error: "order_not_found" });

    const userId = String(req.user._id);
    const isBuyer = String(order.buyerId._id) === userId;
    const isSeller = String(order.sellerId._id) === userId;
    if (!isBuyer && !isSeller) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }

    if (!req.file) return res.status(400).json({ success: false, error: "no_file_uploaded" });

    const fileUrl = `/uploads/service-nda/${req.file.filename}`;
    const now = new Date();

    if (isBuyer) {
      order.ndaBuyerUrl = fileUrl;
      order.ndaBuyerSignedAt = now;
    } else {
      order.ndaSellerUrl = fileUrl;
      order.ndaSellerSignedAt = now;
    }
    await order.save();

    const bothSigned = !!(order.ndaBuyerUrl && order.ndaSellerUrl);
    const signer = isBuyer ? order.buyerId : order.sellerId;
    const otherParty = isBuyer ? order.sellerId : order.buyerId;
    const signerRoleLabel = isBuyer ? "Client" : "Creator";

    try {
      await Notification.create({
        senderId: signer._id,
        senderName: signer.name,
        senderEmail: signer.email,
        senderImage: signer.profileImage || signer.image,
        receiverUserId: otherParty._id,
        type: "SERVICE_NDA_SIGNED",
        message: bothSigned
          ? `${signer.name || signerRoleLabel} has signed the NDA. Both parties have now signed — the NDA is complete!`
          : `${signer.name || signerRoleLabel} has signed the NDA for "${order.serviceTitle}". Waiting for you to sign.`,
        meta: { serviceTitle: order.serviceTitle, signedBy: signerRoleLabel.toLowerCase(), bothSigned },
      });
      if (bothSigned) {
        await Notification.create({
          senderId: otherParty._id,
          senderName: otherParty.name,
          senderEmail: otherParty.email,
          senderImage: otherParty.profileImage || otherParty.image,
          receiverUserId: signer._id,
          type: "SERVICE_NDA_SIGNED",
          message: `Both parties have signed the NDA for "${order.serviceTitle}". The NDA is complete!`,
          meta: { serviceTitle: order.serviceTitle, bothSigned: true },
        });
      }
    } catch (notifyErr) {
      console.error("Service NDA notification failed:", notifyErr);
    }

    return res.json({ success: true, role: isBuyer ? "buyer" : "seller", url: fileUrl, bothSigned });
  } catch (err) {
    console.error("upload-nda (service) error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= BOOK SERVICE — CREATE RAZORPAY ORDER (pay-now, in chat) ================= */
router.post("/orders/:orderId/create-payment-order", requireAuth, async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, error: "order_not_found" });
    }

    if (String(order.buyerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({ success: false, error: "already_paid" });
    }

    if (!(order.ndaBuyerUrl && order.ndaSellerUrl)) {
      return res.status(400).json({
        success: false,
        error: "NDA_NOT_SIGNED",
        message: "Please sign the NDA before making payment.",
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(order.totalPayable) * 100),
      currency: order.currency || "INR",
      receipt: `tokun_svc_${order._id}`,
      notes: {
        project: "Tokun",
        kind: "SERVICE_ORDER",
        orderId: String(order._id),
        serviceId: String(order.serviceId),
        buyerId: String(order.buyerId),
        sellerId: String(order.sellerId),
      },
    });

    order.razorpayOrderId = razorpayOrder.id;
    order.paymentStatus = "ORDER_CREATED";
    await order.save();

    return res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order: razorpayOrder,
    });
  } catch (err) {
    console.error("create service payment order error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= BOOK SERVICE — VERIFY PAYMENT ================= */
router.post("/orders/:orderId/verify-payment", requireAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    const order = await ServiceOrder.findById(orderId)
      .populate("buyerId", "name email profileImage image")
      .populate("sellerId", "name email profileImage image");

    if (!order) {
      return res.status(404).json({ success: false, error: "order_not_found" });
    }

    if (String(order.buyerId._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({ success: false, error: "already_paid" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: "invalid_payment_signature" });
    }

    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = "PAID";
    order.fundsStatus = "HELD_BY_TOKUN";
    order.status = "FUNDED";
    order.paidAt = new Date();
    await order.save();

    // Plain confirmation message in chat (mirrors hire.routes.js verify-payment)
    if (order.chatId) {
      try {
        await Message.create({
          conversationId: order.chatId,
          sender: order.buyerId._id,
          text: `✅ Payment done! ₹${order.totalPayable.toLocaleString("en-IN")} is safely held by Tokun Escrow. Work can begin now.`,
          readBy: [order.buyerId._id],
        });
      } catch (msgErr) {
        console.error("Service paid chat message failed:", msgErr);
      }
    }

    // Notify seller — funds are held, not yet released
    try {
      await Notification.create({
        senderId: order.buyerId._id,
        senderName: order.buyerId.name,
        senderEmail: order.buyerId.email,
        senderImage: order.buyerId.profileImage || order.buyerId.image,
        receiverUserId: order.sellerId._id,
        type: "SERVICE_ORDER_PAID",
        amount: order.amount,
        message: `${order.buyerId.name || "A client"} made the payment for "${order.serviceTitle}". ₹${order.sellerAmount} is safely held by Tokun. You can start work now.`,
        meta: {
          serviceTitle: order.serviceTitle,
          orderId: String(order._id),
          amount: order.sellerAmount,
          fundsStatus: "HELD_BY_TOKUN",
        },
      });
    } catch (notifyErr) {
      console.error("Service order notification failed:", notifyErr);
    }

    // Invoice email (non-fatal)
    try {
      const buyer = order.buyerId;
      if (buyer?.email) {
        const invoiceNo = `INV-${order._id}`;
        const date = new Date(order.paidAt || Date.now()).toLocaleDateString("en-GB");
        const subtotal = Number(order.totalPayable);
        const gst = +(subtotal * 0.18).toFixed(2);
        const total = +(subtotal + gst).toFixed(2);
        const items = [{ title: `Service: ${order.serviceTitle}`, price: subtotal }];

        const logoPath = path.join(__dirname, "../assets/icons/Tokun.png");
        const logoBase64 = fs.existsSync(logoPath)
          ? `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`
          : "";

        const pdfBuffer = await generateInvoicePDF({
          logo: logoBase64,
          date,
          invoiceNo,
          buyerName: buyer.name || "Customer",
          buyerEmail: buyer.email || "",
          items,
        });

        await sendInvoiceEmail({
          to: buyer.email,
          buyerName: buyer.name || "Customer",
          buyerEmail: buyer.email,
          items,
          invoiceNo,
          date,
          subtotal,
          gst,
          total,
          pdfBuffer,
        });
      }
    } catch (invoiceErr) {
      console.error("⚠️ Service invoice/email failed (payment still verified):", invoiceErr.message);
    }

    return res.json({ success: true, order });
  } catch (err) {
    console.error("verify service payment error:", err);
    return res.status(500).json({ success: false, error: "server_error", message: err.message });
  }
});

/* ================= UPLOAD WORK FILE (seller, before submit) ================= */
router.post("/orders/:orderId/upload-work-file", requireAuth, uploadWorkFile.single("file"), async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, error: "order_not_found" });

    if (String(order.sellerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }

    if (!["FUNDED", "IN_PROGRESS", "REVISION_REQUESTED"].includes(order.status)) {
      return res.status(400).json({ success: false, error: `Cannot upload files. Current status: ${order.status}` });
    }

    if (!req.file) return res.status(400).json({ success: false, error: "no_file_uploaded" });

    const fileUrl = `/uploads/service-work/${req.file.filename}`;

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
    console.error("upload service work file error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= START WORK (seller) ================= */
router.post("/orders/:orderId/start-work", requireAuth, async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.orderId)
      .populate("buyerId", "name email")
      .populate("sellerId", "name email");

    if (!order) return res.status(404).json({ success: false, error: "order_not_found" });
    if (String(order.sellerId._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }
    if (order.status !== "FUNDED") {
      return res.status(400).json({ success: false, error: `Cannot start. Status: ${order.status}` });
    }

    order.status = "IN_PROGRESS";
    order.workStartedAt = new Date();
    await order.save();

    try {
      await Notification.create({
        senderId: req.user._id,
        senderName: order.sellerId.name,
        receiverUserId: order.buyerId._id,
        type: "SERVICE_WORK_STARTED",
        message: `${order.sellerId.name || "The creator"} started working on "${order.serviceTitle}".`,
        meta: { serviceTitle: order.serviceTitle },
      });
    } catch (notifyErr) {
      console.error("Service work-started notification failed:", notifyErr);
    }

    return res.json({ success: true, message: "Work started", order });
  } catch (err) {
    console.error("start service work error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= SUBMIT WORK (seller) ================= */
router.post("/orders/:orderId/submit-work", requireAuth, async (req, res) => {
  try {
    const { deliverables, note } = req.body || {};

    const order = await ServiceOrder.findById(req.params.orderId)
      .populate("buyerId", "name email profileImage image")
      .populate("sellerId", "name email profileImage image");

    if (!order) return res.status(404).json({ success: false, error: "order_not_found" });
    if (String(order.sellerId._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }
    if (!["FUNDED", "IN_PROGRESS", "REVISION_REQUESTED"].includes(order.status)) {
      return res.status(400).json({ success: false, error: `Cannot submit. Current status: ${order.status}` });
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
      return res.status(400).json({ success: false, error: "Attach at least one file or add a note" });
    }

    order.status = "WORK_SUBMITTED";
    order.workSubmittedAt = new Date();
    order.deliverables = normalizedDeliverables;
    order.submissionNote = note || "";
    await order.save();

    try {
      await Notification.create({
        senderId: req.user._id,
        senderName: order.sellerId.name,
        senderEmail: order.sellerId.email,
        senderImage: order.sellerId.profileImage || order.sellerId.image,
        receiverUserId: order.buyerId._id,
        type: "SERVICE_WORK_SUBMITTED",
        message: `${order.sellerId.name || "The creator"} submitted the work for "${order.serviceTitle}". Review it and approve or request revision.`,
        meta: { serviceTitle: order.serviceTitle, note: note || "", deliverables: normalizedDeliverables },
      });
    } catch (notifyErr) {
      console.error("Service work-submitted notification failed:", notifyErr);
    }

    if (order.chatId) {
      try {
        await Message.create({
          conversationId: order.chatId,
          sender: req.user._id,
          text: `SERVICE_WORK_SUBMITTED::${JSON.stringify({
            serviceOrderId: String(order._id),
            orderId: String(order._id),
            title: order.serviceTitle,
            amount: order.sellerAmount,
            note: note || "",
            deliverables: normalizedDeliverables,
            status: "WORK_SUBMITTED",
            message: `${order.sellerId.name || "The creator"} submitted the work. Please review the attached files.`,
          })}`,
          readBy: [req.user._id],
        });
      } catch (msgErr) {
        console.error("Service work-submitted chat message failed:", msgErr);
      }
    }

    return res.json({ success: true, message: "Work submitted successfully", order });
  } catch (err) {
    console.error("submit service work error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= APPROVE WORK + RELEASE PAYMENT (buyer) ================= */
router.post("/orders/:orderId/approve-work", requireAuth, async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.orderId)
      .populate("buyerId", "name email")
      .populate("sellerId", "name email");

    if (!order) return res.status(404).json({ success: false, error: "order_not_found" });
    if (String(order.buyerId._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }
    if (order.status !== "WORK_SUBMITTED") {
      return res.status(400).json({ success: false, error: `Cannot approve. Current status: ${order.status}` });
    }
    if (order.fundsStatus !== "HELD_BY_TOKUN") {
      return res.status(400).json({ success: false, error: "Funds not in escrow" });
    }

    const payoutAmount = Number(order.sellerAmount || 0);
    if (!payoutAmount || payoutAmount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid payout amount" });
    }

    let releaseResult;
    try {
      releaseResult = await releaseServiceEscrowToSeller(order._id, "buyer_approved");
    } catch (releaseErr) {
      if (releaseErr instanceof ServiceEscrowAlreadyReleasedError) {
        return res.status(400).json({ success: false, error: "Escrow was already released for this order" });
      }
      throw releaseErr;
    }
    const wallet = releaseResult.wallet;
    order.status = releaseResult.order.status;
    order.fundsStatus = releaseResult.order.fundsStatus;
    order.approvedAt = releaseResult.order.approvedAt;
    order.releasedAt = releaseResult.order.releasedAt;

    try {
      await Notification.create({
        senderId: order.buyerId._id,
        senderName: order.buyerId.name,
        receiverUserId: order.sellerId._id,
        type: "SERVICE_PAYMENT_RELEASED",
        amount: payoutAmount,
        message: `${order.buyerId.name} approved your work! ₹${payoutAmount} has been credited to your Tokun Wallet. You can withdraw to your bank anytime.`,
        meta: { serviceTitle: order.serviceTitle, amount: payoutAmount, fundsStatus: "RELEASED_TO_SELLER" },
      });
    } catch (notifyErr) {
      console.error("Service payment-released notification failed:", notifyErr);
    }

    if (order.chatId) {
      try {
        await Message.create({
          conversationId: order.chatId,
          sender: req.user._id,
          text: `ESCROW_RELEASED::${JSON.stringify({
            serviceOrderId: String(order._id),
            title: order.serviceTitle,
            amount: payoutAmount,
            status: "COMPLETED",
            message: `✅ Payment released! ₹${payoutAmount} has been credited to the creator's Tokun Wallet.`,
          })}`,
          readBy: [req.user._id],
        });
      } catch (msgErr) {
        console.error("Service escrow-released chat message failed:", msgErr);
      }
    }

    return res.json({
      success: true,
      message: `₹${payoutAmount} credited to creator's Tokun Wallet`,
      order,
      walletBalance: wallet.availableBalance,
    });
  } catch (err) {
    console.error("approve service work error:", err);
    return res.status(500).json({ success: false, error: err?.message || "server_error" });
  }
});

/* ================= REQUEST REVISION (buyer) ================= */
router.post("/orders/:orderId/request-revision", requireAuth, async (req, res) => {
  try {
    const { reason } = req.body || {};
    const order = await ServiceOrder.findById(req.params.orderId)
      .populate("buyerId", "name email")
      .populate("sellerId", "name email");

    if (!order) return res.status(404).json({ success: false, error: "order_not_found" });
    if (String(order.buyerId._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }
    if (order.status !== "WORK_SUBMITTED") {
      return res.status(400).json({ success: false, error: "Work not submitted yet" });
    }

    order.status = "REVISION_REQUESTED";
    order.revisions = [...(order.revisions || []), { reason, requestedAt: new Date() }];
    await order.save();

    try {
      await Notification.create({
        senderId: req.user._id,
        senderName: order.buyerId.name,
        receiverUserId: order.sellerId._id,
        type: "SERVICE_REVISION_REQUESTED",
        message: `${order.buyerId.name} requested a revision: ${reason || "No reason given"}`,
        meta: { serviceTitle: order.serviceTitle, reason },
      });
    } catch (notifyErr) {
      console.error("Service revision-requested notification failed:", notifyErr);
    }

    return res.json({ success: true, message: "Revision requested", order });
  } catch (err) {
    console.error("request service revision error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= GET MY BOOKED ORDERS (buyer) ================= */
router.get("/orders/my", requireAuth, async (req, res) => {
  try {
    const orders = await ServiceOrder.find({ buyerId: req.user._id, paymentStatus: "PAID" })
      .populate("sellerId", "name email profileImage image avatarUrl")
      .sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (err) {
    console.error("get my service orders error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= GET RECEIVED ORDERS (seller) ================= */
router.get("/orders/received", requireAuth, async (req, res) => {
  try {
    const orders = await ServiceOrder.find({ sellerId: req.user._id, paymentStatus: "PAID" })
      .populate("buyerId", "name email profileImage image avatarUrl")
      .sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (err) {
    console.error("get received service orders error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= SELLER SUMMARY (for self-dash "Service Bookings" tab) ================= */
// Mirrors GET /api/hire/my/earnings's shape, scoped to service bookings only.
router.get("/orders/seller-summary", requireAuth, async (req, res) => {
  try {
    const sellerId = req.user._id;

    // New Requests: buyer booked but hasn't paid (NDA/payment pending) yet
    const requestOrders = await ServiceOrder.find({
      sellerId,
      status: "PENDING_PAYMENT",
    })
      .populate("buyerId", "name email profileImage image avatarUrl")
      .sort({ createdAt: -1 });

    // Active Projects: funded onward
    const projectOrders = await ServiceOrder.find({
      sellerId,
      status: { $in: ["FUNDED", "IN_PROGRESS", "WORK_SUBMITTED", "REVISION_REQUESTED", "COMPLETED"] },
    })
      .populate("buyerId", "name email profileImage image avatarUrl")
      .sort({ paidAt: -1, createdAt: -1 });

    const completedOrders = await ServiceOrder.find({
      sellerId,
      status: "COMPLETED",
      fundsStatus: { $in: ["RELEASED_TO_SELLER", "AUTO_RELEASED"] },
    }).sort({ approvedAt: -1 });

    const totalEarnings = completedOrders.reduce((sum, o) => sum + Number(o.sellerAmount || 0), 0);

    return res.json({
      success: true,
      totalEarnings,
      activeRequests: requestOrders.length,
      totalProjects: projectOrders.length,
      requests: requestOrders.map((o) => ({
        _id: o._id,
        title: o.serviceTitle,
        amount: o.amount,
        buyerId: o.buyerId,
        buyerName: o.buyerId?.name || "Client",
        preferredDate: o.preferredDate,
        status: o.status,
        createdAt: o.createdAt,
      })),
      projects: projectOrders.map((o) => ({
        _id: o._id,
        title: o.serviceTitle,
        amount: o.amount,
        sellerAmount: o.sellerAmount,
        buyerId: o.buyerId,
        buyerName: o.buyerId?.name || "Client",
        preferredDate: o.preferredDate,
        status: o.status,
        fundsStatus: o.fundsStatus,
        paymentStatus: o.paymentStatus,
        paidAt: o.paidAt,
        workStartedAt: o.workStartedAt,
        workSubmittedAt: o.workSubmittedAt,
        approvedAt: o.approvedAt,
        deliverables: o.deliverables || [],
        submissionNote: o.submissionNote || "",
        revisions: o.revisions || [],
        createdAt: o.createdAt,
      })),
      deals: completedOrders.map((o) => ({
        _id: o._id,
        title: o.serviceTitle,
        amount: o.sellerAmount,
        approvedAt: o.approvedAt,
        status: o.status,
      })),
    });
  } catch (err) {
    console.error("fetch service seller-summary error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ================= GET SINGLE ORDER (chat card live-status refresh) ================= */
router.get("/orders/:orderId", requireAuth, async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.orderId)
      .populate("buyerId", "name email profileImage image avatarUrl")
      .populate("sellerId", "name email profileImage image avatarUrl");

    if (!order) return res.status(404).json({ success: false, error: "order_not_found" });

    const isParty =
      String(order.buyerId._id) === String(req.user._id) ||
      String(order.sellerId._id) === String(req.user._id);

    if (!isParty) return res.status(403).json({ success: false, error: "not_authorized" });

    return res.json({ success: true, order });
  } catch (err) {
    console.error("get service order error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
