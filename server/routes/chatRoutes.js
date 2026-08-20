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


/* The chat list.
   Took ~4.2s for eleven conversations, almost all of it self-inflicted:

     • one countDocuments PER conversation — eleven separate round trips to
       Atlas just to produce eleven numbers (2,694ms of the total)
     • a `lastSender` populate whose result was never read; the response below
       has never contained it (another ~430ms)
     • full Mongoose hydration of documents that get flattened immediately

   Now: one find, one aggregation, no hydration. */
router.get("/conversations", requireAuth, async (req, res) => {
  try {
    const myId = req.user._id;

    const conversations = await Conversation.find({ participants: myId })
      .select("participants lastMessage updatedAt")
      /* `avatarUrl`, which is the field the User model actually has. This asked
         for "avatar" — a field that does not exist on User — so mongoose
         returned every participant with a name, a role and NO photo, and the
         chat list drew initials for people who had uploaded one. The projection
         was quietly wrong: asking for a field that isn't there is not an error,
         it just comes back missing. */
      .populate("participants", "name avatarUrl role")
      .sort({ updatedAt: -1 })
      .lean();

    if (!conversations.length) {
      return res.json({ success: true, conversations: [] });
    }

    /* Every unread count in a single pass, keyed by conversation. The previous
       loop asked the same question once per row; this asks it once. */
    const counts = await Message.aggregate([
      {
        $match: {
          conversationId: { $in: conversations.map((c) => c._id) },
          sender: { $ne: myId },
          readBy: { $ne: myId },
        },
      },
      { $group: { _id: "$conversationId", n: { $sum: 1 } } },
    ]);

    const unreadBy = new Map(counts.map((c) => [String(c._id), c.n]));
    const me = String(myId);

    const enriched = conversations.map((c) => ({
      _id: c._id,
      otherUser: (c.participants || []).find((p) => String(p._id) !== me),
      lastMessage: c.lastMessage,
      unreadCount: unreadBy.get(String(c._id)) || 0,
      updatedAt: c.updatedAt,
    }));

    res.json({ success: true, conversations: enriched });
  } catch (err) {
    console.error("GET /api/chat/conversations error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});


// DELETE /conversation/:conversationId was removed along with the chat UI's
// delete button.
//
// Worth stating why it went rather than just being left unreachable: it
// hard-deleted the Conversation AND every Message in it, for BOTH participants,
// on one person's say-so. The other side lost the entire history — including
// anything agreed about a paid hire — with no record and no way back.
//
// The route is gone rather than merely unused for the same reason the
// message:edit / message:delete socket handlers were removed (see the note in
// index.js): an endpoint the UI no longer exposes is still reachable by a
// hand-crafted request, so leaving it live would mean chat history is only as
// immutable as an attacker chooses.


router.post(
  "/attachment",
  requireAuth,
  upload.single("file"),
  async (req, res) => {
    try {
      const { conversationId, clientId } = req.body;

      if (!req.file) {
        return res.status(400).json({ success: false });
      }

      if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ success: false, error: "Invalid conversationId" });
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
  readBy: [req.user._id],
  attachment: {
    url: azureUrl,
    name: req.file.originalname,
    /* image | video | file.
       "video" is new: everything that wasn't an image used to be "file", so a
       clip someone sent rendered as a 📎 link — no player, and no way to watch
       it without leaving the conversation. The client falls back to the file
       extension for messages written before this, so old rows still play. */
    type: req.file.mimetype.startsWith("image")
      ? "image"
      : req.file.mimetype.startsWith("video")
        ? "video"
        : "file",
  },
});

      // Keep the thread preview in step with text messages, which already do
      // this — otherwise sending a file leaves the list showing the previous
      // message and the thread doesn't move to the top.
      const isImage = req.file.mimetype.startsWith("image");
      const isVideo = req.file.mimetype.startsWith("video");
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: isImage
          ? "📷 Photo"
          : isVideo
            ? "🎬 Video"
            : `📎 ${req.file.originalname}`,
        lastSender: req.user._id,
        updatedAt: new Date(),
      });

      // Broadcast. This route used to return the message and nothing else — the
      // client emitted "new-message" itself, which the server has no handler
      // for, so the other side never saw an attachment until a reload.
      try {
        const io = req.app.get("io");
        const notify = req.app.get("notifyChatRecipients");
        const convo = await Conversation.findById(conversationId).select("participants").lean();
        const recipients = (convo?.participants || [])
          .map(String)
          .filter((p) => p !== String(req.user._id));

        if (io) {
          io.to(String(conversationId)).emit("new-message", {
            _id: message._id,
            conversationId: String(conversationId),
            clientId: clientId || null,
            sender: String(req.user._id),
            attachment: message.attachment,
            createdAt: message.createdAt,
            deliveredTo: [],
            readBy: [String(req.user._id)],
          });
        }
        if (typeof notify === "function") {
          notify(recipients, {
            conversationId: String(conversationId),
            messageId: String(message._id),
            senderId: String(req.user._id),
            preview: isImage ? "📷 Photo" : `📎 ${req.file.originalname}`,
          });
        }
      } catch (e) {
        // The upload succeeded and is being returned; a failed broadcast only
        // costs the recipient a refresh.
        console.error("Attachment broadcast failed:", e?.message);
      }

      res.json({ success: true, message });
    } catch (err) {
      console.error("Attachment error:", err);
      res.status(500).json({ success: false });
    }
  }
);

/* ===============================
   MARK CONVERSATION AS READ
================================ */
router.post("/conversations/:conversationId/read", requireAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const myId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ success: false, error: "Invalid ID" });
    }

    // ✅ Us conversation ke saare messages me apna _id readBy me add karo
    await Message.updateMany(
      {
        conversationId,
        readBy: { $ne: myId }, // sirf unread messages update karo
      },
      {
        // deliveredTo too: reading something necessarily means it reached you,
        // so a message can never be read-but-not-delivered.
        $addToSet: { readBy: myId, deliveredTo: myId },
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ success: false });
  }
});


router.post("/conversations/read-all", requireAuth, async (req, res) => {
  try {
    const myId = req.user._id;

    await Message.updateMany(
      {
        sender: { $ne: myId },
        readBy: { $ne: myId },
      },
      {
        // deliveredTo too: reading something necessarily means it reached you,
        // so a message can never be read-but-not-delivered.
        $addToSet: { readBy: myId, deliveredTo: myId },
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Mark all read error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


module.exports = router;
