// // const express = require("express");
// // const router = express.Router();
// // const Notification = require("../models/Notification");
// // const SharedPrompt = require("../models/SharedPrompt");
// // const Organization = require("../models/organization");
// // const Prompt = require("../models/Prompt");
// // const Purchase = require("../models/Purchase");

// // const { requireAuth } = require("../utils/auth");


// // // ===============================
// // // 1️⃣  TEAM MEMBER → Request a prompt
// // // ===============================
// // router.post("/team/request/:promptId", requireAuth, async (req, res) => {
// //   try {
// //     const user = req.user;
// //     const { promptId } = req.params;
// //     const { message } = req.body;

// //     if (user.userType !== "TM" || !user.orgId)
// //       return res.status(403).json({ success: false, error: "not_team_member" });

// //     const prompt = await Prompt.findById(promptId);
// //     if (!prompt || prompt.deleted)
// //       return res.status(404).json({ success: false, error: "prompt_not_found" });

// //     await Notification.create({
// //       senderId: user._id,
// //       receiverOrgId: user.orgId,
// //       type: "TM_REQUEST",
// //       promptId: prompt._id,
// //       message: message || `${user.name} requested to purchase "${prompt.title}"`,
// //     });

// //     res.json({ success: true, message: "request_sent_to_org" });
// //   } catch (err) {
// //     console.error("team/request error:", err);
// //     res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });


// // // ===============================
// // // 2️⃣  ORGANIZATION → Suggest a prompt to member
// // // ===============================
// // router.post("/org/suggest/:promptId", requireAuth, async (req, res) => {
// //   try {
// //     const user = req.user;
// //     const { promptId } = req.params;
// //     const { memberId, message } = req.body;

// //     if (user.userType !== "ORG" || user.role !== "Owner")
// //       return res.status(403).json({ success: false, error: "not_org_owner" });

// //     const prompt = await Prompt.findById(promptId);
// //     if (!prompt || prompt.deleted)
// //       return res.status(404).json({ success: false, error: "prompt_not_found" });

// //     await Notification.create({
// //       senderId: user._id,
// //       receiverUserId: memberId,
// //       type: "ORG_SUGGEST",
// //       promptId: prompt._id,
// //       message: message || `Organization suggests prompt "${prompt.title}"`,
// //     });

// //     res.json({ success: true, message: "suggestion_sent_to_member" });
// //   } catch (err) {
// //     console.error("org/suggest error:", err);
// //     res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });


// // // ===============================
// // // 3️⃣  ORGANIZATION → Share purchased prompt
// // // ===============================
// // router.post("/org/share/:promptId", requireAuth, async (req, res) => {
// //   try {
// //     const user = req.user;
// //     const { promptId } = req.params;
// //     const { memberIds } = req.body; // array of userIds (or ["all"])

// //     if (user.userType !== "ORG" || user.role !== "Owner")
// //       return res.status(403).json({ success: false, error: "not_org_owner" });

// //     const org = await Organization.findById(user.orgId);
// //     if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

// //     const prompt = await Prompt.findById(promptId);
// //     if (!prompt) return res.status(404).json({ success: false, error: "prompt_not_found" });

// //     let membersToShare = [];

// //     if (Array.isArray(memberIds) && memberIds.includes("all")) {
// //       membersToShare = org.members.map((m) => m.userId);
// //     } else {
// //       membersToShare = memberIds;
// //     }

// //     // create shared prompt record
// //     const shared = await SharedPrompt.create({
// //       orgId: org._id,
// //       promptId,
// //       sharedTo: membersToShare,
// //       sharedBy: user._id,
// //     });

// //     // send notifications
// //     const notifs = membersToShare.map((id) => ({
// //       senderId: user._id,
// //       receiverUserId: id,
// //       type: "ORG_SHARE",
// //       promptId,
// //       message: `Organization shared prompt "${prompt.title}" with you.`,
// //     }));
// //     await Notification.insertMany(notifs);

// //     res.json({ success: true, shared, notified: membersToShare.length });
// //   } catch (err) {
// //     console.error("org/share error:", err);
// //     res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });


// // // ===============================
// // // 4️⃣  Get notifications (Org or Team Member)
// // // ===============================
// // router.get("/notifications", requireAuth, async (req, res) => {
// //   try {
// //     const user = req.user;
// //     let filter = {};

// //     if (user.userType === "ORG") {
// //       filter.receiverOrgId = user.orgId;
// //     } else {
// //       filter.receiverUserId = user._id;
// //     }

// //     const notifs = await Notification.find(filter)
// //       .populate("promptId", "title price free exclusive")
// //       .sort({ createdAt: -1 });

// //     res.json({ success: true, notifications: notifs });
// //   } catch (err) {
// //     console.error("notifications error:", err);
// //     res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });


// // // ===============================
// // // 5️⃣  Mark notification as read
// // // ===============================
// // router.post("/notifications/read/:id", requireAuth, async (req, res) => {
// //   try {
// //     console.log(req.user);
// //     const notif = await Notification.findById(req.params.id);
// //     if (!notif) return res.status(404).json({ success: false, error: "not_found" });
// //     notif.read = true;
// //     await notif.save();
// //     res.json({ success: true });
// //   } catch (err) {
// //     res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });




// //  // ===============================
// // // TEAM MEMBER → Get prompts shared by organization (purchased prompts only)
// // // ===============================
// // router.get("/shared/team", requireAuth, async (req, res) => {
// //   try {
// //     const user = req.user;

// //     // Must be a team member
// //     if (user.userType !== "TM" || !user.orgId) {
// //       return res.status(403).json({ success: false, error: "not_team_member" });
// //     }

// //     // 1️⃣ Get all shared prompts for this member
// //     const sharedRecords = await SharedPrompt.find({
// //       sharedTo: { $in: [user._id] },
// //       orgId: user.orgId,
// //     })
// //       .populate("promptId")
// //       .populate("sharedBy", "name email")
// //       .sort({ createdAt: -1 });

// //     if (!sharedRecords.length)
// //       return res.json({ success: true, count: 0, sharedPrompts: [] });

// //     const promptIds = sharedRecords.map((sp) => sp.promptId?._id || sp.promptId);

// //     // 2️⃣ Find organization purchases (buyer = orgId or ownerId)
// //     const orgPurchases = await Purchase.find({
// //       prompt: { $in: promptIds },
// //       buyer: { $in: [user.orgId, user._id] }, // support both
// //       paymentStatus: "SUCCESS",
// //     });

// //     // 3️⃣ Build detailed response
// //     const results = await Promise.all(
// //       sharedRecords.map(async (sp) => {
// //         const pId = String(sp.promptId?._id || sp.promptId);
// //         const purchase = orgPurchases.find((p) => String(p.prompt) === pId);

// //         let promptData = null;

// //         // ✅ if the live prompt still exists → fetch fresh details
// //         const fullPrompt = sp.promptId
// //           ? await Prompt.findById(sp.promptId)
// //               .populate("categories", "name")
// //               .lean()
// //           : null;

// //         if (purchase) {
// //           // ✅ Merge snapshot + live prompt data
// //           const snap = purchase.promptSnapshot || {};
// //           promptData = {
// //             id: pId,
// //             title: snap.title || fullPrompt?.title || "Untitled Prompt",
// //             description: snap.description || fullPrompt?.description || "",
// //             promptText: snap.promptText || fullPrompt?.promptText || "",
// //             price: fullPrompt?.price || 0,
// //             tokun_price: fullPrompt?.tokun_price || 0,
// //             free: fullPrompt?.free ?? false,
// //             exclusive: fullPrompt?.exclusive ?? false,
// //             sold: fullPrompt?.sold ?? false,
// //             tags: fullPrompt?.tags || [],
// //             categories: fullPrompt?.categories || [],
// //             ratings: fullPrompt?.ratings || [],
// //             averageRating: fullPrompt?.averageRating || 0,
// //             salesCount: fullPrompt?.salesCount || 0,
// //             totalRevenue: fullPrompt?.totalRevenue || 0,
// //             attachment:
// //               snap.attachment || fullPrompt?.attachment || {},
// //             uploadCode:
// //               snap.uploadCode || fullPrompt?.uploadCode || [],
// //             deleted: fullPrompt?.deleted ?? false,
// //             deletedAt: fullPrompt?.deletedAt || null,
// //           };
// //         } else if (fullPrompt) {
// //           // ✅ fallback if no purchase found but prompt still exists
// //           promptData = {
// //             id: fullPrompt._id,
// //             title: fullPrompt.title,
// //             description: fullPrompt.description || "",
// //             promptText: fullPrompt.promptText || "",
// //             price: fullPrompt.price || 0,
// //             tokun_price: fullPrompt.tokun_price || 0,
// //             free: fullPrompt.free || false,
// //             exclusive: fullPrompt.exclusive || false,
// //             sold: fullPrompt.sold || false,
// //             tags: fullPrompt.tags || [],
// //             categories: fullPrompt.categories || [],
// //             ratings: fullPrompt.ratings || [],
// //             averageRating: fullPrompt.averageRating || 0,
// //             salesCount: fullPrompt.salesCount || 0,
// //             totalRevenue: fullPrompt.totalRevenue || 0,
// //             attachment: fullPrompt.attachment || {},
// //             uploadCode: fullPrompt.uploadCode || [],
// //             deleted: fullPrompt.deleted || false,
// //             deletedAt: fullPrompt.deletedAt || null,
// //           };
// //         }

// //         return {
// //           id: sp._id,
// //           sharedAt: sp.createdAt,
// //           sharedBy: sp.sharedBy?.name || "Organization",
// //           orgId: sp.orgId,
// //           prompt: promptData,
// //         };
// //       })
// //     );

// //     res.json({
// //       success: true,
// //       count: results.length,
// //       sharedPrompts: results.filter((r) => r.prompt !== null),
// //     });
// //   } catch (err) {
// //     console.error("shared/team error:", err);
// //     res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });

// // module.exports = router;


// // routes/prompt-collab.js
// const express = require("express");
// const router = express.Router();

// const Notification = require("../models/Notification");
// const SharedPrompt = require("../models/SharedPrompt");
// const Organization = require("../models/organization");
// const Prompt = require("../models/Prompt");
// const Purchase = require("../models/Purchase");

// const { requireAuth } = require("../utils/auth");

// /**
//  * Helper to snapshot sender fields into Notification
//  */
// function senderSnapshot(user) {
//   return {
//     senderId: user._id,
//     senderName: user.name || "",
//     senderEmail: user.email || "",
//     senderImage: user.profileImage || "", // ensure your User model has profileImage
//   };
// }

// /* ===============================
//  * 1️⃣  TEAM MEMBER → Request a prompt
//  * =============================== */
// router.post("/team/request/:promptId", requireAuth, async (req, res) => {
//   try {
//     const user = req.user;
//     const { promptId } = req.params;
//     const { message } = req.body;

//     if (user.userType !== "TM" || !user.orgId) {
//       return res.status(403).json({ success: false, error: "not_team_member" });
//     }

//     const prompt = await Prompt.findById(promptId);
//     if (!prompt || prompt.deleted) {
//       return res.status(404).json({ success: false, error: "prompt_not_found" });
//     }

//     await Notification.create({
//       ...senderSnapshot(user),
//       receiverOrgId: user.orgId,
//       type: "TM_REQUEST",
//       promptId: prompt._id,
//       message: message || `${user.name} requested to purchase "${prompt.title}"`,
//     });

//     res.json({ success: true, message: "request_sent_to_org" });
//   } catch (err) {
//     console.error("team/request error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// /* ===============================
//  * 2️⃣  ORGANIZATION → Suggest a prompt to member
//  * =============================== */
// router.post("/org/suggest/:promptId", requireAuth, async (req, res) => {
//   try {
//     const user = req.user;
//     const { promptId } = req.params;
//     const { memberId, message } = req.body;

//     if (user.userType !== "ORG" || user.role !== "Owner") {
//       return res.status(403).json({ success: false, error: "not_org_owner" });
//     }

//     const prompt = await Prompt.findById(promptId);
//     if (!prompt || prompt.deleted) {
//       return res.status(404).json({ success: false, error: "prompt_not_found" });
//     }

//     await Notification.create({
//       ...senderSnapshot(user),
//       receiverUserId: memberId,
//       type: "ORG_SUGGEST",
//       promptId: prompt._id,
//       message: message || `Organization suggests prompt "${prompt.title}"`,
//     });

//     res.json({ success: true, message: "suggestion_sent_to_member" });
//   } catch (err) {
//     console.error("org/suggest error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// /* ===============================
//  * 3️⃣  ORGANIZATION → Share purchased prompt
//  *     (creates shared prompt record + notifies members)
//  * =============================== */
// router.post("/org/share/:promptId", requireAuth, async (req, res) => {
//   try {
//     const user = req.user;
//     const { promptId } = req.params;
//     const { memberIds } = req.body; // array of userIds (or ["all"])

//     if (user.userType !== "ORG" || user.role !== "Owner") {
//       return res.status(403).json({ success: false, error: "not_org_owner" });
//     }

//     const org = await Organization.findById(user.orgId);
//     if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

//     const prompt = await Prompt.findById(promptId);
//     if (!prompt) return res.status(404).json({ success: false, error: "prompt_not_found" });

//     let membersToShare = [];
//     if (Array.isArray(memberIds) && memberIds.includes("all")) {
//       membersToShare = org.members.map((m) => m.userId);
//     } else {
//       membersToShare = memberIds || [];
//     }

//     // create shared prompt record (for the "Org Purchased" tab)
//     const shared = await SharedPrompt.create({
//       orgId: org._id,
//       promptId,
//       sharedTo: membersToShare,
//       sharedBy: user._id,
//     });

//     // send notifications (for All / Shared with me tabs)
//     const notifs = membersToShare.map((id) => ({
//       ...senderSnapshot(user),
//       receiverUserId: id,
//       type: "ORG_SHARE",
//       promptId,
//       message: `Organization shared prompt "${prompt.title}" with you.`,
//     }));
//     if (notifs.length) await Notification.insertMany(notifs);

//     res.json({ success: true, shared, notified: membersToShare.length });
//   } catch (err) {
//     console.error("org/share error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// /* ===============================
//  * 4️⃣  Get notifications (Org or Team Member)
//  * =============================== */
// router.get("/notifications", requireAuth, async (req, res) => {
//   try {
//     const user = req.user;
//     const filter = {};

//     if (user.userType === "ORG") {
//       filter.receiverOrgId = user.orgId;
//     } else {
//       filter.receiverUserId = user._id;
//     }

//     const notifs = await Notification.find(filter)
//       .populate("promptId", "title price free exclusive attachment")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, notifications: notifs });
//   } catch (err) {
//     console.error("notifications error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// /* ===============================
//  * 5️⃣  Mark notification as read
//  * =============================== */
// router.post("/notifications/read/:id", requireAuth, async (req, res) => {
//   try {
//     const notif = await Notification.findById(req.params.id);
//     if (!notif) return res.status(404).json({ success: false, error: "not_found" });
//     notif.read = true;
//     await notif.save();
//     res.json({ success: true });
//   } catch (err) {
//     console.error("notifications/read error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// /* ===============================
//  * 6️⃣  TEAM MEMBER → Get prompts shared by organization (purchased prompts only)
//  *     This powers the "Org Purchased" tab
//  * =============================== */
// router.get("/shared/team", requireAuth, async (req, res) => {
//   try {
//     const user = req.user;

//     if (user.userType !== "TM" || !user.orgId) {
//       return res.status(403).json({ success: false, error: "not_team_member" });
//     }

//     // Shared records that target this team member
//     const sharedRecords = await SharedPrompt.find({
//       sharedTo: { $in: [user._id] },
//       orgId: user.orgId,
//     })
//       .populate("promptId")
//       .populate("sharedBy", "name email profileImage")
//       .sort({ createdAt: -1 });

//     if (!sharedRecords.length) {
//       return res.json({ success: true, count: 0, sharedPrompts: [] });
//     }

//     const promptIds = sharedRecords.map((sp) => sp.promptId?._id || sp.promptId);

//     // Purchases by org (or member) for those prompts
//     const orgPurchases = await Purchase.find({
//       prompt: { $in: promptIds },
//       buyer: { $in: [user.orgId, user._id] },
//       paymentStatus: "SUCCESS",
//     });

//     // Merge purchase snapshot with current prompt
//     const results = await Promise.all(
//       sharedRecords.map(async (sp) => {
//         const pId = String(sp.promptId?._id || sp.promptId);
//         const purchase = orgPurchases.find((p) => String(p.prompt) === pId);

//         let promptData = null;

//         const fullPrompt = sp.promptId
//           ? await Prompt.findById(sp.promptId).populate("categories", "name").lean()
//           : null;

//         if (purchase) {
//           const snap = purchase.promptSnapshot || {};
//           promptData = {
//             id: pId,
//             title: snap.title || fullPrompt?.title || "Untitled Prompt",
//             description: snap.description || fullPrompt?.description || "",
//             promptText: snap.promptText || fullPrompt?.promptText || "",
//             price: fullPrompt?.price || 0,
//             tokun_price: fullPrompt?.tokun_price || 0,
//             free: fullPrompt?.free ?? false,
//             exclusive: fullPrompt?.exclusive ?? false,
//             sold: fullPrompt?.sold ?? false,
//             tags: fullPrompt?.tags || [],
//             categories: fullPrompt?.categories || [],
//             ratings: fullPrompt?.ratings || [],
//             averageRating: fullPrompt?.averageRating || 0,
//             salesCount: fullPrompt?.salesCount || 0,
//             totalRevenue: fullPrompt?.totalRevenue || 0,
//             attachment: snap.attachment || fullPrompt?.attachment || {},
//             uploadCode: snap.uploadCode || fullPrompt?.uploadCode || [],
//             deleted: fullPrompt?.deleted ?? false,
//             deletedAt: fullPrompt?.deletedAt || null,
//           };
//         } else if (fullPrompt) {
//           promptData = {
//             id: fullPrompt._id,
//             title: fullPrompt.title,
//             description: fullPrompt.description || "",
//             promptText: fullPrompt.promptText || "",
//             price: fullPrompt.price || 0,
//             tokun_price: fullPrompt.tokun_price || 0,
//             free: fullPrompt.free || false,
//             exclusive: fullPrompt.exclusive || false,
//             sold: fullPrompt.sold || false,
//             tags: fullPrompt.tags || [],
//             categories: fullPrompt.categories || [],
//             ratings: fullPrompt.ratings || [],
//             averageRating: fullPrompt.averageRating || 0,
//             salesCount: fullPrompt.salesCount || 0,
//             totalRevenue: fullPrompt.totalRevenue || 0,
//             attachment: fullPrompt.attachment || {},
//             uploadCode: fullPrompt.uploadCode || [],
//             deleted: fullPrompt.deleted || false,
//             deletedAt: fullPrompt.deletedAt || null,
//           };
//         }

//         return {
//           id: sp._id,
//           sharedAt: sp.createdAt,
//           orgId: sp.orgId,
//           // expose sender info for UI
//           senderName: sp.sharedBy?.name || "Organization",
//           senderEmail: sp.sharedBy?.email || "",
//           senderImage: sp.sharedBy?.profileImage || "",
//           message: null, // shared/team doesn't carry a message; UI will handle empty
//           prompt: promptData,
//         };
//       })
//     );

//     res.json({
//       success: true,
//       count: results.length,
//       sharedPrompts: results.filter((r) => r.prompt !== null),
//     });
//   } catch (err) {
//     console.error("shared/team error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// module.exports = router;



// routes/prompt-collab.js
const express = require("express");
const mongoose = require("mongoose"); // ✅ FIX
const router = express.Router();
const Notification = require("../models/Notification");
const SharedPrompt = require("../models/SharedPrompt");
const Organization = require("../models/organization");
const Prompt = require("../models/Prompt");
const Purchase = require("../models/Purchase");
const { sendEmail } = require("../utils/SendEmail");
const { requireAuth } = require("../utils/auth");
const CollabSession = require("../models/CollabSession");
// const inviteCollaborativeTemplate = require("../htmltemplate/")
const fs = require("fs");
const path = require("path");

// Adjust path based on your structure: `routes/promptCollab.js` -> `../htmltemplate/...`
const inviteCollaborativeTemplate = fs.readFileSync(
  path.join(__dirname, "../htmltemplate/inviteCollaborativeTemplate.html"),
  "utf8"
);

const User = require("../models/User");   // ⭐ REQUIRED
/* ---------------- Helper: snapshot sender info ---------------- */
function senderSnapshot(user) {
  return {
    senderId: user._id,
    senderName: user.name || "",
    senderEmail: user.email || "",
    senderImage: user.profileImage || "",
  };
}

/* ===============================
 * 1️⃣ TEAM MEMBER → Request a prompt
 * =============================== */
router.post("/team/request/:promptId", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { promptId } = req.params;
    const { message } = req.body;

    if (user.userType !== "TM" || !user.orgId)
      return res.status(403).json({ success: false, error: "not_team_member" });

    const prompt = await Prompt.findById(promptId);
    if (!prompt || prompt.deleted)
      return res.status(404).json({ success: false, error: "prompt_not_found" });

    await Notification.create({
      ...senderSnapshot(user),
      receiverOrgId: user.orgId,
      type: "TM_REQUEST",
      promptId: prompt._id,
      message: message || `${user.name} requested to purchase "${prompt.title}"`,
    });

    res.json({ success: true, message: "request_sent_to_org" });
  } catch (err) {
    console.error("team/request error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ===============================
 * 2️⃣ ORGANIZATION → Suggest a prompt
 * =============================== */
router.post("/org/suggest/:promptId", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { promptId } = req.params;
    const { memberId, message } = req.body;

    if (user.userType !== "ORG" || user.role !== "Owner")
      return res.status(403).json({ success: false, error: "not_org_owner" });

    const prompt = await Prompt.findById(promptId);
    if (!prompt || prompt.deleted)
      return res.status(404).json({ success: false, error: "prompt_not_found" });

    await Notification.create({
      ...senderSnapshot(user),
      receiverUserId: memberId,
      type: "ORG_SUGGEST",
      promptId: prompt._id,
      message: message || `Organization suggests prompt "${prompt.title}"`,
    });

    res.json({ success: true, message: "suggestion_sent_to_member" });
  } catch (err) {
    console.error("org/suggest error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ===============================
 * 3️⃣ ORGANIZATION → Share purchased prompt
 * =============================== */
router.post("/org/share/:promptId", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { promptId } = req.params;
    const { memberIds } = req.body;

    if (user.userType !== "ORG" || user.role !== "Owner")
      return res.status(403).json({ success: false, error: "not_org_owner" });

    const org = await Organization.findById(user.orgId);
    if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

    const prompt = await Prompt.findById(promptId);
    if (!prompt) return res.status(404).json({ success: false, error: "prompt_not_found" });

    const membersToShare = memberIds?.includes("all")
      ? org.members.map((m) => m.userId)
      : memberIds || [];

    await SharedPrompt.create({
      orgId: org._id,
      promptId,
      sharedTo: membersToShare,
      sharedBy: user._id,
    });

    const notifs = membersToShare.map((id) => ({
      ...senderSnapshot(user),
      receiverUserId: id,
      type: "ORG_SHARE",
      promptId,
      message: `Organization shared prompt "${prompt.title}" with you.`,
    }));
    if (notifs.length) await Notification.insertMany(notifs);

    res.json({ success: true, notified: membersToShare.length });
  } catch (err) {
    console.error("org/share error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ===============================
 * 4️⃣ Get Notifications
 * =============================== */
router.get("/notifications", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const filter =
      user.userType === "ORG"
        ? { receiverOrgId: user.orgId }
        : { receiverUserId: user._id };

    const notifs = await Notification.find(filter)
      .populate("promptId", "title price free exclusive attachment")
      .sort({ createdAt: -1 });

    res.json({ success: true, notifications: notifs });
  } catch (err) {
    console.error("notifications error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ===============================
 * 5️⃣ Mark notification as read
 * =============================== */
router.post("/notifications/read/:id", requireAuth, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ success: false, error: "not_found" });
    notif.read = true;
    await notif.save();
    res.json({ success: true });
  } catch (err) {
    console.error("notifications/read error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ===============================
 * 6️⃣ TEAM MEMBER → Get shared purchased prompts
 * =============================== */
router.get("/shared/team", requireAuth, async (req, res) => {
  try {
    const user = req.user;

    if (user.userType !== "TM" || !user.orgId) {
      return res.status(403).json({ success: false, error: "not_team_member" });
    }

    const sharedRecords = await SharedPrompt.find({
      sharedTo: { $in: [user._id] },
      orgId: user.orgId,
    })
      .populate("promptId")
      .populate("sharedBy", "name email profileImage")
      .sort({ createdAt: -1 });

    if (!sharedRecords.length)
      return res.json({ success: true, count: 0, sharedPrompts: [] });

    const promptIds = sharedRecords.map((sp) => sp.promptId?._id || sp.promptId);

    const orgPurchases = await Purchase.find({
      prompt: { $in: promptIds },
      buyer: { $in: [user.orgId, user._id] },
      paymentStatus: "SUCCESS",
    });

    const results = await Promise.all(
      sharedRecords.map(async (sp) => {
        const fullPrompt = sp.promptId
          ? await Prompt.findById(sp.promptId)
              .populate("categories", "name")
              .lean()
          : null;

        const snap = orgPurchases.find(
          (p) => String(p.prompt) === String(sp.promptId?._id)
        )?.promptSnapshot || {};

        const promptData = fullPrompt
          ? {
              id: fullPrompt._id,
              title: snap.title || fullPrompt.title,
              price: fullPrompt.price,
              attachment: fullPrompt.attachment || snap.attachment || {},
            }
          : null;

        return {
          id: sp._id,
          sharedAt: sp.createdAt,
          orgId: sp.orgId,
          senderName: sp.sharedBy?.name || "Organization",
          senderEmail: sp.sharedBy?.email || "",
          senderImage: sp.sharedBy?.profileImage || "",
          prompt: promptData,
        };
      })
    );

    res.json({
      success: true,
      count: results.length,
      sharedPrompts: results.filter((r) => r.prompt),
    });
  } catch (err) {
    console.error("shared/team error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});


// // routes/promptCollabRoutes.js (or wherever)
// router.post("/sendCollabInvite", requireAuth, async (req, res) => {
//   try {
//     console.log("📨 sendCollabInvite hit");

//     const { name, email, message, promptId, sessionId } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         error: "Email is required",
//       });
//     }

//     // For collab, sessionId is important
//     if (!sessionId) {
//       return res.status(400).json({
//         success: false,
//         error: "sessionId is required for collaboration invite",
//       });
//     }

//     // current logged-in user
//     const sender = req.user;
//     const senderId = sender && sender._id;

//     if (!senderId) {
//       return res.status(401).json({ success: false, error: "Unauthorized" });
//     }

//     // 1️⃣ Check if email exists in Tokun
//     const normalizedEmail = email.toLowerCase().trim();
//     const receiverUser = await User.findOne({ email: normalizedEmail });

//     if (!receiverUser) {
//       return res.status(404).json({
//         success: false,
//         error: "No user with this email exists on Tokun",
//       });
//     }

//     // prevent sending invite to self
//     if (receiverUser._id.toString() === senderId.toString()) {
//       return res.status(400).json({
//         success: false,
//         error: "You cannot send a collaboration invite to yourself",
//       });
//     }

//     // 2️⃣ Optional: build final message
//     const finalMessage =
//       (message && message.trim()) ||
//       `${sender.name || "Someone"} invited you to collaborate on a prompt in Tokun.`;

//     // 3️⃣ Build notification payload
//     const notificationPayload = {
//       senderId,
//       senderName: sender.name || "",
//       senderEmail: sender.email || "",
//       senderImage: sender.profileImage || "",

//       receiverUserId: receiverUser._id,

//       type: "COLLAB_INVITE",
//       message: finalMessage,
//       sessionId,
//     };

//     if (promptId) {
//       notificationPayload.promptId = promptId;
//     }

//     const notification = await Notification.create(notificationPayload);

//     return res.status(201).json({
//       success: true,
//       message: "Collaboration invite sent successfully",
//       notification,
//       receiver: {
//         id: receiverUser.id,
//         name: receiverUser.name,
//         email: receiverUser.email,
//       },
//     });
//   } catch (err) {
//     console.error("Error in sendCollabInvite:", err);
//     return res.status(500).json({
//       success: false,
//       error: "Something went wrong while sending collab invite",
//       details: err.message,
//     });
//   }
// });



router.post("/start", requireAuth, async (req, res) => {
  try {
    // 1️⃣ Check if user already has an active session
    const existing = await CollabSession.findOne({
      "participants.userId": req.user._id,
      isActive: true,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        sessionId: existing.sessionId,
        reused: true,
      });
    }

    // 2️⃣ Create NEW session
    const sessionId = new mongoose.Types.ObjectId().toString();

    const session = await CollabSession.create({
      sessionId,          // ✅ UNIQUE
      text: "",
      isActive: true,
      participants: [{ userId: req.user._id }],
    });

    return res.status(201).json({
      success: true,
      sessionId: session.sessionId,
      reused: false,
    });
  } catch (err) {
    console.error("start collab error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to start collaboration",
    });
  }
});







router.post("/sendCollabInvite", requireAuth, async (req, res) => {
  try {
    console.log("hi i am");
    const { name, email, message, promptId , sessionId  } = req.body;

    if (!email || !message) {
      return res.status(400).json({
        message: "Email and message are required",
      });
    }

      // ✅ Optionally enforce sessionId
    if (!sessionId) {
      return res.status(400).json({
        message: "Missing collaboration sessionId",
      });
    }

    // current logged-in user
    const senderId = req.user && req.user._id;
    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 1️⃣ Check if email exists in Tokun
    const normalizedEmail = email.toLowerCase().trim();
    const receiverUser = await User.findOne({ email: normalizedEmail });

    if (!receiverUser) {
      return res.status(404).json({
        message: "No user with this email exists on Tokun",
      });
    }

    // prevent sending invite to self
    if (receiverUser._id.toString() === senderId.toString()) {
      return res.status(400).json({
        message: "You cannot send a collaboration invite to yourself",
      });
    }

    // Optional: build final message
const senderName = req.user?.name || "Someone";

const finalMessage = `${senderName} invited you to collaborate on a prompt in Tokun.`;


    // 2️⃣ Create notification
    const notificationPayload = {
      senderId,
      receiverUserId: receiverUser._id,
      type: "COLLAB_INVITE",
      message: finalMessage,
        sessionId, // 👈 store sessionId in notification
    };

    if (promptId) {
      notificationPayload.promptId = promptId; // only if relevant
    }

    const notification = await Notification.create(notificationPayload);

    // 3️⃣ Send email invite
    try {
          const inviteUrl =
  `${process.env.SITE_URL || "https://tokun.ai"}/prompt-optimizer?sessionId=${encodeURIComponent(sessionId)}`;
 // 👈 nice UX: direct collab link
      const html = inviteCollaborativeTemplate
        .replace(/{{Name}}/g, name || receiverUser.name || "there")
        .replace(/{{SenderName}}/g, req.user?.name || "Someone")
        .replace(/{{CollaborationLink}}/g, inviteUrl);

      await sendEmail({
        to: email,
        subject: "Invitation to collaborate on a prompt on Tokun.ai",
        html,
      });
    } catch (mailErr) {
      console.error(`Failed to send invitation to ${email}:`, mailErr);
      return res.status(500).json({
        message: "email_failed while sending collab invite",
      });
    }

    return res.status(201).json({
      message: "Collaboration invite sent successfully",
      notification,
      receiver: {
        id: receiverUser.id,
        name: receiverUser.name,
        email: receiverUser.email,
      },
    });
  } catch (err) {
    console.error("Error in sendCollabInvite:", err);
    return res.status(500).json({
      message: "Something went wrong while sending collab invite",
      error: err.message,
    });
  }
});



module.exports = router;
