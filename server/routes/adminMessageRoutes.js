// server/routes/adminMessageRoutes.js
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const AdminConversation = require("../models/AdminConversation");
const AdminMessage = require("../models/AdminMessage");
const User = require("../models/User");

// ✅ Normal chat models — admin ka message inko mein mirror karenge
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const { requireAuth } = require("../utils/auth");

const uploadToAzure = require("../utils/uploadToAzure");
const upload = require("../utils/chatUpload");

// Optional Seller model
let Seller = null;
try {
  Seller = require("../models/Seller");
} catch (err) {
  Seller = null;
}

/* ===============================
   HELPERS
================================ */

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(String(id || ""));
};

const getId = (value) => {
  if (!value) return "";
  if (value._id) return String(value._id);
  return String(value);
};

const normalizeUser = (user) => {
  if (!user) return null;

  return {
    _id: String(user._id),
    id: String(user._id),
    name: user.name || "Unknown",
    email: user.email || "",
    avatar: user.avatar || user.avatarUrl || "",
    avatarUrl: user.avatarUrl || user.avatar || "",
    role: user.role || "",
    userType: user.userType || "",
  };
};

const serializeMessage = (message, myId) => {
  const m = typeof message.toObject === "function" ? message.toObject() : message;

  const senderId = getId(m.sender);
  const receiverId = getId(m.receiver);

  return {
    _id: String(m._id),
    id: String(m._id),
    conversationId: String(m.conversationId),
    sender: m.sender,
    receiver: m.receiver,
    senderId,
    receiverId,
    senderType: m.senderType || "",
    text: m.text || "",
    attachment: m.attachment || null,
    readBy: m.readBy || [],
    isMine: myId ? senderId === String(myId) : false,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
};

const resolveSellerUser = async (sellerOrUserId) => {
  if (!isValidObjectId(sellerOrUserId)) return null;

  // Case 1: direct User _id
  const directUser = await User.findById(sellerOrUserId).select(
    "name email avatar avatarUrl role userType isAdmin"
  );

  if (directUser) return directUser;

  // Case 2: Seller document _id
  if (!Seller) return null;

  const sellerDoc = await Seller.findById(sellerOrUserId).lean();
  if (!sellerDoc) return null;

  // sirf actual seller-user fields (userId / user)
  const possibleUserIds = [sellerDoc.userId, sellerDoc.user].filter(Boolean);

  for (const possibleId of possibleUserIds) {
    const realUserId = getId(possibleId);

    if (isValidObjectId(realUserId)) {
      const linkedUser = await User.findById(realUserId).select(
        "name email avatar avatarUrl role userType isAdmin"
      );

      if (linkedUser) return linkedUser;
    }
  }

  // Case 3: fallback by email (admin ko skip)
  if (sellerDoc.email) {
    const emailUser = await User.findOne({
      email: String(sellerDoc.email).trim().toLowerCase(),
      isAdmin: { $ne: true },
    }).select("name email avatar avatarUrl role userType isAdmin");

    if (emailUser) return emailUser;
  }

  return null;
};

// ✅ Race-safe: upsert se duplicate-key crash nahi hoga
const getOrCreateConversation = async ({ adminId, sellerUserId }) => {
  return AdminConversation.findOneAndUpdate(
    { adminId, sellerId: sellerUserId },
    {
      $setOnInsert: {
        adminId,
        sellerId: sellerUserId,
        participants: [adminId, sellerUserId],
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

const emitAdminMessage = (req, conversation, message, receiverId) => {
  const io = req.app.get("io");

  if (!io) {
    console.log("⚠️ Socket io not found on app");
    return;
  }

  const payload = {
    success: true,
    conversationId: String(conversation._id),
    conversation: {
      _id: String(conversation._id),
      id: String(conversation._id),
      adminId: conversation.adminId,
      sellerId: conversation.sellerId,
      lastMessage: conversation.lastMessage,
      lastSender: conversation.lastSender,
      updatedAt: conversation.updatedAt,
    },
    message: serializeMessage(message),
  };

  io.to(`admin-message:${conversation._id}`).emit("admin-message:new", payload);
  io.to(`admin-message-user:${receiverId}`).emit("admin-message:new", payload);

  // fallback room
  io.to(String(receiverId)).emit("admin-message:new", payload);
};

/* =====================================================
   ✅ Admin ke liye ek "chat user" (User doc) ensure karo,
   taaki seller ke normal inbox mein "Tokun Admin" naam
   dikhe (Unknown nahi). Email se dhoondhta hai — baar-baar
   naya user nahi banata.

   NOTE: agar admin ka email pehle se kisi NORMAL user ka hai,
   to yahan ek dedicated email use karo (jaise admin-bot@tokun.world)
   taaki galat user "Tokun Admin" na ban jaye.
===================================================== */
const ADMIN_CHAT_NAME = "Tokun Admin";

const getAdminChatUser = async (adminUser) => {
  const adminEmail = String(adminUser?.email || "admin@tokun.world").toLowerCase();

  let chatUser = await User.findOne({ email: adminEmail });

  if (!chatUser) {
    chatUser = await User.create({
      name: ADMIN_CHAT_NAME,
      email: adminEmail,
      isVerified: true,
      role: "Admin",
      avatarUrl: "/icons/admin-avatar.png", // apna avatar path ya null
    });
  } else if (chatUser.name !== ADMIN_CHAT_NAME) {
    // naam force set — hamesha "Tokun Admin" dikhe
    chatUser.name = ADMIN_CHAT_NAME;
    await chatUser.save();
  }

  return chatUser;
};

/* =====================================================
   ✅ MIRROR: admin ka message normal /api/chat system
   mein bhi daalo, taaki seller ko apne normal inbox
   (Chat.tsx) mein "Tokun Admin" ke naam se dikhe.
===================================================== */
const mirrorToUserChat = async (req, { adminUser, sellerUserId, text, attachment }) => {
  try {
    // ✅ Admin ka chat-user (User doc) — "Tokun Admin"
    const adminChatUser = await getAdminChatUser(adminUser);
    const adminChatUserId = adminChatUser._id;

    // admin(chat-user) + seller ke beech normal conversation dhoondho ya banao
    let convo = await Conversation.findOne({
      participants: { $all: [adminChatUserId, sellerUserId] },
    });

    if (!convo) {
      convo = await Conversation.create({
        participants: [adminChatUserId, sellerUserId],
      });
    }

    const message = await Message.create({
      conversationId: convo._id,
      sender: adminChatUserId,
      readBy: [adminChatUserId],
      ...(text ? { text } : {}),
      ...(attachment ? { attachment } : {}),
    });

    // conversation ka last message update
    convo.lastMessage = text || attachment?.name || "";
    convo.lastSender = adminChatUserId;
    convo.updatedAt = new Date();
    await convo.save();

    // Chat.tsx jis shape ko expect karta hai wahi banao (naam populate hoga)
    const populated = await Message.findById(message._id).populate(
      "sender",
      "name avatar avatarUrl role"
    );

    // ✅ Chat.tsx "new-message" event pe sunta hai
    const io = req.app.get("io");
    if (io) {
      // aapka socket server "join-chat" pe socket.join(String(conversationId)) karta hai
      io.to(String(convo._id)).emit("new-message", populated);
      // fallback: seller ke personal room mein bhi
      io.to(String(sellerUserId)).emit("new-message", populated);
    }

    return { conversation: convo, message: populated };
  } catch (err) {
    // Mirror fail ho to bhi admin flow break nahi hona chahiye
    console.error("mirrorToUserChat error:", err);
    return null;
  }
};

/* =====================================================
   ADMIN: CREATE / GET SELLER CONVERSATION
   POST /api/admin-message/admin/conversation/:sellerId
===================================================== */

router.post("/admin/conversation/:sellerId", requireAuth, async (req, res) => {
  try {
    const adminId = req.user?._id;
    const { sellerId } = req.params;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: "Login required",
      });
    }

    const sellerUser = await resolveSellerUser(sellerId);

    if (!sellerUser) {
      return res.status(404).json({
        success: false,
        error: "Seller user not found",
      });
    }

    // Agar admin khud resolve ho gaya, to id/link galat hai
    if (String(sellerUser._id) === String(adminId)) {
      return res.status(400).json({
        success: false,
        error: "You cannot message yourself (id/link issue).",
      });
    }

    const conversation = await getOrCreateConversation({
      adminId,
      sellerUserId: sellerUser._id,
    });

    await AdminMessage.updateMany(
      {
        conversationId: conversation._id,
        sender: { $ne: adminId },
        readBy: { $ne: adminId },
      },
      {
        $addToSet: { readBy: adminId },
      }
    );

    const messages = await AdminMessage.find({
      conversationId: conversation._id,
    })
      .populate("sender", "name email avatar avatarUrl role userType")
      .populate("receiver", "name email avatar avatarUrl role userType")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      conversation,
      seller: normalizeUser(sellerUser),
      messages: messages.map((m) => serializeMessage(m, adminId)),
    });
  } catch (err) {
    console.error("Admin conversation error:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Server error",
    });
  }
});

/* =====================================================
   ADMIN: LIST CONVERSATIONS
   GET /api/admin-message/admin/conversations
===================================================== */

router.get("/admin/conversations", requireAuth, async (req, res) => {
  try {
    const adminId = req.user?._id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: "Login required",
      });
    }

    const conversations = await AdminConversation.find({
      adminId,
    })
      .populate("adminId", "name email avatar avatarUrl role userType")
      .populate("sellerId", "name email avatar avatarUrl role userType")
      .populate("lastSender", "name email avatar avatarUrl role userType")
      .sort({ updatedAt: -1 });

    const enriched = await Promise.all(
      conversations.map(async (c) => {
        const unreadCount = await AdminMessage.countDocuments({
          conversationId: c._id,
          sender: { $ne: adminId },
          readBy: { $ne: adminId },
        });

        return {
          _id: String(c._id),
          id: String(c._id),
          conversationId: String(c._id),
          admin: c.adminId,
          seller: c.sellerId,
          otherUser: c.sellerId,
          lastMessage: c.lastMessage || "",
          lastSender: c.lastSender || null,
          unreadCount,
          updatedAt: c.updatedAt,
          createdAt: c.createdAt,
        };
      })
    );

    res.json({
      success: true,
      conversations: enriched,
    });
  } catch (err) {
    console.error("Admin conversations error:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Server error",
    });
  }
});

/* =====================================================
   ADMIN: FETCH MESSAGES
   GET /api/admin-message/admin/messages/:conversationId
===================================================== */

router.get("/admin/messages/:conversationId", requireAuth, async (req, res) => {
  try {
    const adminId = req.user?._id;
    const { conversationId } = req.params;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: "Login required",
      });
    }

    if (!isValidObjectId(conversationId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid conversationId",
      });
    }

    const conversation = await AdminConversation.findOne({
      _id: conversationId,
      adminId,
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        error: "Conversation not found or not allowed",
      });
    }

    await AdminMessage.updateMany(
      {
        conversationId,
        sender: { $ne: adminId },
        readBy: { $ne: adminId },
      },
      {
        $addToSet: { readBy: adminId },
      }
    );

    const messages = await AdminMessage.find({
      conversationId,
    })
      .populate("sender", "name email avatar avatarUrl role userType")
      .populate("receiver", "name email avatar avatarUrl role userType")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      conversation,
      messages: messages.map((m) => serializeMessage(m, adminId)),
    });
  } catch (err) {
    console.error("Admin fetch messages error:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Server error",
    });
  }
});

/* =====================================================
   ADMIN: SEND MESSAGE
   POST /api/admin-message/admin/send
   body: { conversationId, text }
===================================================== */

router.post("/admin/send", requireAuth, async (req, res) => {
  try {
    const adminId = req.user?._id;
    const { conversationId, text } = req.body;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: "Login required",
      });
    }

    if (!isValidObjectId(conversationId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid conversationId",
      });
    }

    const cleanText = String(text || "").trim();

    if (!cleanText) {
      return res.status(400).json({
        success: false,
        error: "Message text is required",
      });
    }

    const conversation = await AdminConversation.findOne({
      _id: conversationId,
      adminId,
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        error: "Conversation not found or not allowed",
      });
    }

    const receiverId = conversation.sellerId;

    const created = await AdminMessage.create({
      conversationId: conversation._id,
      sender: adminId,
      receiver: receiverId,
      senderType: "admin",
      text: cleanText,
      readBy: [adminId],
    });

    conversation.lastMessage = cleanText;
    conversation.lastSender = adminId;
    conversation.updatedAt = new Date();
    await conversation.save();

    const message = await AdminMessage.findById(created._id)
      .populate("sender", "name email avatar avatarUrl role userType")
      .populate("receiver", "name email avatar avatarUrl role userType");

    emitAdminMessage(req, conversation, message, receiverId);

    // 🔽 normal chat inbox mein bhi mirror karo ("Tokun Admin" ke naam se)
    await mirrorToUserChat(req, {
      adminUser: req.user,
      sellerUserId: receiverId,
      text: cleanText,
    });

    res.json({
      success: true,
      conversation,
      message: serializeMessage(message, adminId),
    });
  } catch (err) {
    console.error("Admin send message error:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Server error",
    });
  }
});

/* =====================================================
   ADMIN: SEND ATTACHMENT
   POST /api/admin-message/admin/attachment
   form-data: file, conversationId
===================================================== */

router.post(
  "/admin/attachment",
  requireAuth,
  upload.single("file"),
  async (req, res) => {
    try {
      const adminId = req.user?._id;
      const { conversationId } = req.body;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          error: "Login required",
        });
      }

      if (!isValidObjectId(conversationId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid conversationId",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "File is required",
        });
      }

      const conversation = await AdminConversation.findOne({
        _id: conversationId,
        adminId,
      });

      if (!conversation) {
        return res.status(403).json({
          success: false,
          error: "Conversation not found or not allowed",
        });
      }

      const receiverId = conversation.sellerId;

      const azureUrl = await uploadToAzure(
        req.file.buffer,
        req.file.originalname,
        "admin-message-attachments"
      );

      const attachment = {
        url: azureUrl,
        name: req.file.originalname,
        type: req.file.mimetype.startsWith("image") ? "image" : "file",
      };

      const created = await AdminMessage.create({
        conversationId: conversation._id,
        sender: adminId,
        receiver: receiverId,
        senderType: "admin",
        text: "",
        attachment,
        readBy: [adminId],
      });

      conversation.lastMessage = req.file.originalname;
      conversation.lastSender = adminId;
      conversation.updatedAt = new Date();
      await conversation.save();

      const message = await AdminMessage.findById(created._id)
        .populate("sender", "name email avatar avatarUrl role userType")
        .populate("receiver", "name email avatar avatarUrl role userType");

      emitAdminMessage(req, conversation, message, receiverId);

      // 🔽 normal chat inbox mein bhi mirror karo ("Tokun Admin" ke naam se)
      await mirrorToUserChat(req, {
        adminUser: req.user,
        sellerUserId: receiverId,
        attachment,
      });

      res.json({
        success: true,
        conversation,
        message: serializeMessage(message, adminId),
      });
    } catch (err) {
      console.error("Admin attachment error:", err);
      res.status(500).json({
        success: false,
        error: err?.message || "Server error",
      });
    }
  }
);

/* =====================================================
   SELLER: LIST ADMIN CONVERSATIONS
   GET /api/admin-message/seller/conversations
===================================================== */

router.get("/seller/conversations", requireAuth, async (req, res) => {
  try {
    const sellerId = req.user?._id;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        error: "Login required",
      });
    }

    const conversations = await AdminConversation.find({
      sellerId,
    })
      .populate("adminId", "name email avatar avatarUrl role userType")
      .populate("sellerId", "name email avatar avatarUrl role userType")
      .populate("lastSender", "name email avatar avatarUrl role userType")
      .sort({ updatedAt: -1 });

    const enriched = await Promise.all(
      conversations.map(async (c) => {
        const unreadCount = await AdminMessage.countDocuments({
          conversationId: c._id,
          sender: { $ne: sellerId },
          readBy: { $ne: sellerId },
        });

        return {
          _id: String(c._id),
          id: String(c._id),
          conversationId: String(c._id),
          admin: c.adminId,
          seller: c.sellerId,
          otherUser: c.adminId,
          lastMessage: c.lastMessage || "",
          lastSender: c.lastSender || null,
          unreadCount,
          updatedAt: c.updatedAt,
          createdAt: c.createdAt,
        };
      })
    );

    res.json({
      success: true,
      conversations: enriched,
    });
  } catch (err) {
    console.error("Seller admin conversations error:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Server error",
    });
  }
});

/* =====================================================
   SELLER: FETCH ADMIN MESSAGES
   GET /api/admin-message/seller/messages/:conversationId
===================================================== */

router.get("/seller/messages/:conversationId", requireAuth, async (req, res) => {
  try {
    const sellerId = req.user?._id;
    const { conversationId } = req.params;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        error: "Login required",
      });
    }

    if (!isValidObjectId(conversationId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid conversationId",
      });
    }

    const conversation = await AdminConversation.findOne({
      _id: conversationId,
      sellerId,
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        error: "Conversation not found or not allowed",
      });
    }

    await AdminMessage.updateMany(
      {
        conversationId,
        sender: { $ne: sellerId },
        readBy: { $ne: sellerId },
      },
      {
        $addToSet: { readBy: sellerId },
      }
    );

    const messages = await AdminMessage.find({
      conversationId,
    })
      .populate("sender", "name email avatar avatarUrl role userType")
      .populate("receiver", "name email avatar avatarUrl role userType")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      conversation,
      messages: messages.map((m) => serializeMessage(m, sellerId)),
    });
  } catch (err) {
    console.error("Seller fetch admin messages error:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Server error",
    });
  }
});

/* =====================================================
   SELLER: REPLY TO ADMIN
   POST /api/admin-message/seller/reply
   body: { conversationId, text }
===================================================== */

router.post("/seller/reply", requireAuth, async (req, res) => {
  try {
    const sellerId = req.user?._id;
    const { conversationId, text } = req.body;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        error: "Login required",
      });
    }

    if (!isValidObjectId(conversationId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid conversationId",
      });
    }

    const cleanText = String(text || "").trim();

    if (!cleanText) {
      return res.status(400).json({
        success: false,
        error: "Message text is required",
      });
    }

    const conversation = await AdminConversation.findOne({
      _id: conversationId,
      sellerId,
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        error: "Conversation not found or not allowed",
      });
    }

    const receiverId = conversation.adminId;

    const created = await AdminMessage.create({
      conversationId: conversation._id,
      sender: sellerId,
      receiver: receiverId,
      senderType: "seller",
      text: cleanText,
      readBy: [sellerId],
    });

    conversation.lastMessage = cleanText;
    conversation.lastSender = sellerId;
    conversation.updatedAt = new Date();
    await conversation.save();

    const message = await AdminMessage.findById(created._id)
      .populate("sender", "name email avatar avatarUrl role userType")
      .populate("receiver", "name email avatar avatarUrl role userType");

    emitAdminMessage(req, conversation, message, receiverId);

    res.json({
      success: true,
      conversation,
      message: serializeMessage(message, sellerId),
    });
  } catch (err) {
    console.error("Seller reply admin message error:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Server error",
    });
  }
});

module.exports = router;