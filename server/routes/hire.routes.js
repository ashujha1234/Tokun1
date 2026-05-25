const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const router = express.Router();

const { requireAuth } = require("../utils/auth");
const HireDeal = require("../models/HireDeal");
const Notification = require("../models/Notification");
const Message = require("../models/Message");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Rasu creates hire proposal before sending hire card
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

    const platformFee = 0;
    const freelancerAmount = amount - platformFee;

    const deal = await HireDeal.create({
      clientId: req.user._id,
      freelancerId,
      chatId: conversationId,
      title: title || "Project Proposal",
      description: description || "",
      amount,
      platformFee,
      freelancerAmount,
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

    return res.json({
      success: true,
      deal,
      cardPayload,
    });
  } catch (err) {
    console.error("create hire proposal error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to create hire proposal",
    });
  }
});

// Ashutosh accepts hire proposal
router.post("/:dealId/accept", requireAuth, async (req, res) => {
  try {
    const deal = await HireDeal.findById(req.params.dealId)
      .populate("clientId", "name email profileImage image")
      .populate("freelancerId", "name email profileImage image");

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: "Hire deal not found",
      });
    }

    if (String(deal.freelancerId._id) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: "You cannot accept this proposal",
      });
    }

    if (deal.status !== "PENDING_ACCEPTANCE") {
      return res.status(400).json({
        success: false,
        error: "This proposal is already processed",
      });
    }

    deal.status = "ACCEPTED_WAITING_PAYMENT";
    deal.acceptedAt = new Date();
    await deal.save();

    await Message.create({
  conversationId: deal.chatId,
  sender: req.user._id,
  text: `HIRE_ACCEPTED::${JSON.stringify({
    hireDealId: String(deal._id),
    title: deal.title,
    budget: deal.amount,
    amount: deal.amount,
    targetDate: deal.deliveryDate,
    status: "ACCEPTED",
    message: `${deal.freelancerId.name || "Freelancer"} accepted your hire proposal.`,
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

    return res.json({
      success: true,
      message: "Hire proposal accepted",
      deal,
    });
  } catch (err) {
    console.error("accept hire error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to accept hire proposal",
    });
  }
});

// Rasu creates Razorpay order
router.post("/:dealId/create-payment-order", requireAuth, async (req, res) => {
  try {
    const deal = await HireDeal.findById(req.params.dealId);

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: "Hire deal not found",
      });
    }

    if (String(deal.clientId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: "Only client can make payment",
      });
    }

    if (deal.status !== "ACCEPTED_WAITING_PAYMENT") {
      return res.status(400).json({
        success: false,
        error: "Deal is not ready for payment",
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
    return res.status(500).json({
      success: false,
      error: "Failed to create payment order",
    });
  }
});

// Razorpay payment verify
router.post("/:dealId/verify-payment", requireAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const deal = await HireDeal.findById(req.params.dealId)
      .populate("clientId", "name email profileImage image")
      .populate("freelancerId", "name email profileImage image");

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: "Hire deal not found",
      });
    }

    if (String(deal.clientId._id) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: "Only client can verify this payment",
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment signature",
      });
    }

    deal.razorpayOrderId = razorpay_order_id;
    deal.razorpayPaymentId = razorpay_payment_id;
    deal.razorpaySignature = razorpay_signature;
    deal.paymentStatus = "PAID";
    deal.fundsStatus = "HELD_BY_TOKUN";
    deal.status = "FUNDED";
    deal.paidAt = new Date();

    await deal.save();

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

      message: `${deal.clientId.name || "Client"} made the payment. Amount is safely held by Tokun. You can start work now.`,
      meta: {
        title: deal.title,
        clientName: deal.clientId.name,
        amount: deal.amount,
        fundsStatus: "HELD_BY_TOKUN",
      },
    });

    await Message.create({
      chatId: deal.chatId,
      senderId: deal.clientId._id,
      receiverId: deal.freelancerId._id,
      type: "HIRE_PAYMENT_DONE",
      message: `Payment done. ₹${deal.amount} is safely held by Tokun.`,
      hireDealId: deal._id,
      amount: deal.amount,
      meta: {
        status: deal.status,
        fundsStatus: deal.fundsStatus,
      },
    });

    return res.json({
      success: true,
      message: "Payment verified and held by Tokun",
      deal,
    });
  } catch (err) {
    console.error("verify hire payment error:", err);
    return res.status(500).json({
      success: false,
      error: "Payment verification failed",
    });
  }
});

module.exports = router;