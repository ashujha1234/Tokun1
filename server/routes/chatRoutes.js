const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const uploadToAzure = require("../utils/uploadToAzure");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { requireAuth } = require("../utils/auth");
const upload = require("../utils/chatUpload");
/* ===============================
   CREATE / GET CONVERSATION
================================ */
router.post("/conversation", requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;
    const myId = req.user._id;

    // ✅ FIX 1: Validate userId BEFORE querying MongoDB
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid userId",
      });
    }

    let convo = await Conversation.findOne({
      participants: { $all: [myId, userId] },
    });

    if (!convo) {
      convo = await Conversation.create({
        participants: [myId, userId],
      });
    }

    res.json({ success: true, conversation: convo });
  } catch (err) {
    console.error("Conversation error:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

/* ===============================
   FETCH MESSAGES
================================ */
router.get("/messages/:conversationId", requireAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // ✅ FIX 2: Validate conversationId
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid conversationId",
      });
    }

    const messages = await Message.find({
      conversationId,
    }).sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});


router.get("/conversations", requireAuth, async (req, res) => {
  const myId = req.user._id;

  const conversations = await Conversation.find({
    participants: myId,
  })
.populate("participants", "name avatar role")
    .populate("lastSender", "name")
    .sort({ updatedAt: -1 });

  // Add unread count
  const enriched = await Promise.all(
    conversations.map(async (c) => {
      const unreadCount = await Message.countDocuments({
        conversationId: c._id,
        readBy: { $ne: myId },
      });

      const otherUser = c.participants.find(
        (p) => p._id.toString() !== myId.toString()
      );

      return {
        _id: c._id,
        otherUser,
        lastMessage: c.lastMessage,
        unreadCount,
        updatedAt: c.updatedAt,
      };
    })
  );

  res.json({ success: true, conversations: enriched });
});


router.delete("/conversation/:conversationId", requireAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const myId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ success: false, error: "Invalid ID" });
    }

    const convo = await Conversation.findOne({
      _id: conversationId,
      participants: myId,
    });

    if (!convo) {
      return res.status(403).json({ success: false, error: "Not allowed" });
    }

    await Message.deleteMany({ conversationId });
    await Conversation.deleteOne({ _id: conversationId });

    res.json({ success: true });
  } catch (err) {
    console.error("Delete chat error:", err);
    res.status(500).json({ success: false });
  }
});


router.post(
  "/attachment",
  requireAuth,
  upload.single("file"),
  async (req, res) => {
    try {
      const { conversationId } = req.body;

      if (!req.file) {
        return res.status(400).json({ success: false });
      }

      // 🔥 Upload to Azure
      const azureUrl = await uploadToAzure(
        req.file.buffer,          // ✅ buffer exists now
        req.file.originalname,
        "chat-attachments"        // container name
      );

      const message = await Message.create({
        conversationId,
        sender: req.user._id,
        attachment: {
          url: azureUrl,          // ✅ FULL URL
          name: req.file.originalname,
          type: req.file.mimetype.startsWith("image")
            ? "image"
            : "file",
        },
      });

      res.json({ success: true, message });
    } catch (err) {
      console.error("Attachment error:", err);
      res.status(500).json({ success: false });
    }
  }
);


module.exports = router;
