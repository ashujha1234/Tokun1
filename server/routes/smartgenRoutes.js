// const express = require("express");
// const Smartgen = require("../models/Smartgen");
 
// const { requireAuth } = require("../utils/auth");
// const { ensureMonthlyQuota, spendMonthlyTokens } = require("../utils/quota");
// const multer = require("multer");
// const router = express.Router(); 
// const path = require("path");
// const { PLANS } = require("../config/plans");



// const { spendTokensForIndividual, spendTokensForTeamMember ,spendTokensForOrgOwner} = require("../service/spend");
// const User = require("../models/User");
// const Organization=require("../models/organization")




// // ✨ ADD THIS HELPER (e.g., near the top of the same router file or in a utils file and import it)
// /**
//  * Enforce Smartgen history cap for Free users.
//  * - Keeps only the most recent `cap` docs for the given user.
//  * - Deletes the oldest extras BEFORE creating a new one (prevents race on count==cap).
//  */
// async function enforceSmartgenHistoryLimit(user) {
  
//   const planKey = String(user?.plan || "free").toLowerCase();
//   const plan = PLANS[planKey];

//   // if plan doesn't exist or history is unlimited, skip
//   if (!plan || !plan.historyEntries || plan.historyEntries === "unlimited") return;

//   const cap = plan.historyEntries;
//   const filter = { userId: user._id, orgId: user.orgId || null };
//   const existingCount = await Smartgen.countDocuments(filter);

//   if (existingCount >= cap) {
//     const toDeleteCount = existingCount - cap + 1;
//     const oldest = await Smartgen.find(filter)
//       .sort({ createdAt: 1 })
//       .limit(toDeleteCount)
//       .select({ _id: 1 })
//       .lean();

//     const ids = oldest.map(d => d._id);
//     if (ids.length) {
//       await Smartgen.deleteMany({ _id: { $in: ids } });
//     }
//   }
// }



// // --- Multer setup (local disk) ---
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "../uploads")); // make sure /uploads exists
//   },
//   filename: function (req, file, cb) {
//     const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, unique + "-" + file.originalname);
//   },
// });
// const upload = multer({ storage });

// /**
//  * POST /api/smartgen
//  * Body: { inputPrompt, detailedPrompt, attachmentUrl?, tokensUsed }
//  * - tokensUsed is required and comes from frontend (already computed).
//  */

// // --- Create Smartgen (with optional single/multiple files) ---
// router.post("/", requireAuth, upload.array("attachments", 5), async (req, res) => {
//   try {
//     const { inputPrompt, detailedPrompt, tokensUsed } = req.body ?? {};
//     if (!inputPrompt || !detailedPrompt) {
//       return res.status(400).json({ success: false, error: "inputPrompt_and_detailedPrompt_required" });
//     }
//     const amount = Number(tokensUsed);
//     if (!Number.isFinite(amount) || amount <= 0) {
//       return res.status(400).json({ success: false, error: "tokensUsed_required_positive_number" });
//     }

//     //await ensureMonthlyQuota(req.user);
//    // await spendMonthlyTokens(req.user, amount);


//    // Handle IND vs ORG Team Member differently
//    let resuser=null;
//    let org=null;
// if (req.user.userType === "IND") {
//   await enforceSmartgenHistoryLimit(req.user);
// resuser=  await spendTokensForIndividual(req.user._id, amount, "smartgen");


// } else if (req.user.userType === "TM") {
//   org = await Organization.findById(req.user.orgId);
  
//   if(!org.plan)
//       return res.status(403).json({ success: false, error: "not proper plan purchased" });
     
//    resuser=await spendTokensForTeamMember(req.user._id, amount, "smartgen");
// } else if (req.user.userType === "ORG" && req.user.role === "Owner") {
//   // If an Org Owner themself runs Smartgen, treat them like IND Pro/Enterprise
//   org = await Organization.findById(req.user.orgId);
  
//   if(!org.plan)
//       return res.status(403).json({ success: false, error: "not proper plan purchased" });


//  resuser= await spendTokensForOrgOwner(req.user._id, amount, "smartgen");



// } else {
//   return res.status(403).json({ success: false, error: "invalid_user_type" });
// }


//  // 🟡 ADDED: Enforce Free-plan Smartgen history cap (keeps only latest 5 for Free IND users)


//     const files = (req.files || []).map(f => ({
//       filename: f.originalname,
//       path: "/uploads/" + f.filename, // accessible if you serve /uploads statically
//       mimetype: f.mimetype,
//       size: f.size,
//     }));

//     const doc = await Smartgen.create({
//       userId: req.user._id,
//       orgId: req.user.orgId || null,
//       inputPrompt,
//       detailedPrompt,
//       attachments: files,
//       tokensUsed: amount,
//     });

//     return res.json({
//       success: true,
//       item: {
//         id: doc._id,
//         userId: doc.userId,
//         orgId: doc.orgId,
//         inputPrompt: doc.inputPrompt,
//         detailedPrompt: doc.detailedPrompt,
//         attachments: doc.attachments,
//         tokensUsed: doc.tokensUsed,
//         createdAt: doc.createdAt,
//       },
//       user: resuser.user,
//       org: resuser.org,
//     });
//   } catch (err) {
//     if (err?.code === "insufficient_quota") {
//       return res.status(402).json({ success: false, error: "insufficient_quota" });
//     }
//     console.error("POST /smartgen error:", err);
//     return res.status(500).json({ success: false, error: "server_error" });
//   }
// });


// // routes/smartgenRoutes.js
// router.put("/:id", requireAuth, upload.array("attachments", 5), async (req, res) => {
//   try {
//     const { inputPrompt, detailedPrompt, tokensUsed } = req.body ?? {};
//     const smartgenId = req.params.id;

//     // Check if Smartgen exists and belongs to the current user
//     const smartgen = await Smartgen.findOne({ _id: smartgenId, userId: req.user._id });
//     if (!smartgen) {
//       return res.status(404).json({ success: false, error: "smartgen_not_found_or_access_denied" });
//     }

//     // Validate the required fields
//     if (inputPrompt && detailedPrompt) {
//       smartgen.inputPrompt = inputPrompt;
//       smartgen.detailedPrompt = detailedPrompt;
//     }

//     const amount = Number(tokensUsed);
//     if (tokensUsed && (!Number.isFinite(amount) || amount <= 0)) {
//       return res.status(400).json({ success: false, error: "tokensUsed_required_positive_number" });
//     }
 
//     // If tokens were updated, we need to spend them and check daily quota
//     if (tokensUsed) {
//       await ensureMonthlyQuota(req.user);  // Ensure the daily quota is not exceeded
//       await spendMonthlyTokens(req.user, amount);  // Spend the tokens for this Smartgen
//       smartgen.tokensUsed = amount;  // Update the tokensUsed field
//     }

//     // Handle attachments
//     const files = (req.files || []).map(f => ({
//       filename: f.originalname,
//       path: "/uploads/" + f.filename, // Make it accessible if served statically
//       mimetype: f.mimetype,
//       size: f.size,
//     }));

//     if (files.length > 0) {
//       // Append the new files to the existing attachments, if any
//       smartgen.attachments = [...smartgen.attachments, ...files];
//     }

//     // Save the updated Smartgen document
//     await smartgen.save();

//     return res.json({
//       success: true,
//       item: {
//         id: smartgen._id,
//         userId: smartgen.userId,
//         orgId: smartgen.orgId,
//         inputPrompt: smartgen.inputPrompt,
//         detailedPrompt: smartgen.detailedPrompt,
//         attachments: smartgen.attachments,
//         tokensUsed: smartgen.tokensUsed,
//         createdAt: smartgen.createdAt,
//         updatedAt: smartgen.updatedAt,
//       },
//       dailyTokensRemaining: req.user.dailyTokensRemaining,
//     });
//   } catch (err) {
//     if (err?.code === "insufficient_quota") {
//       return res.status(402).json({ success: false, error: "insufficient_quota" });
//     }
//     console.error("PUT /smartgen error:", err);
//     return res.status(500).json({ success: false, error: "server_error" });
//   }
// });


// // GET /api/smartgen
// // Query params: page, limit, orgOnly
// router.get("/", requireAuth, async (req, res) => {
//   try {
//     const page  = Math.max(1, parseInt(req.query.page || "1", 10));
//     const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
//     const orgOnly = String(req.query.orgOnly || "false") === "true";

//     const filter = { isDeleted: false };

//     if (orgOnly && req.user.orgId) {
//       // fetch all Smartgen items in the same org
//       filter.orgId = req.user.orgId;
//     } else {
//       // fetch only the user's own
//       filter.userId = req.user._id;
//     }

//     const [items, total] = await Promise.all([
//       Smartgen.find(filter)
//         .sort({ createdAt: -1 })
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .lean(),
//       Smartgen.countDocuments(filter),
//     ]);

//     return res.json({
//       success: true,
//       page,
//       limit,
//       total,
//       items: items.map(x => ({
//         id: x._id,
//         userId: x.userId,
//         orgId: x.orgId,
//         inputPrompt: x.inputPrompt,
//         detailedPrompt: x.detailedPrompt,
//         attachmentUrl: x.attachmentUrl,
//         tokensUsed: x.tokensUsed,
//         createdAt: x.createdAt,
//         updatedAt: x.updatedAt,
//       })),
//     });
//   } catch (err) {
//     console.error("GET /smartgen error:", err);
//     return res.status(500).json({ success: false, error: "server_error" });
//   }
// });


// // GET /api/smartgen/:id
// router.get("/:id", requireAuth, async (req, res) => {
//   try {
//     const doc = await Smartgen.findById(req.params.id);
//     if (!doc || doc.isDeleted) {
//       return res.status(404).json({ success: false, error: "not_found" });
//     }

//     const isOwner = String(doc.userId) === String(req.user._id);
//     const sameOrg = doc.orgId && req.user.orgId && String(doc.orgId) === String(req.user.orgId);

//     if (!isOwner && !sameOrg) {
//       return res.status(403).json({ success: false, error: "forbidden" });
//     }

//     return res.json({
//       success: true,
//       item: {
//         id: doc._id,
//         userId: doc.userId,
//         orgId: doc.orgId,
//         inputPrompt: doc.inputPrompt,
//         detailedPrompt: doc.detailedPrompt,
//         attachmentUrl: doc.attachmentUrl,
//         tokensUsed: doc.tokensUsed,
//         createdAt: doc.createdAt,
//         updatedAt: doc.updatedAt,
//       },
//     });
//   } catch (err) {
//     console.error("GET /smartgen/:id error:", err);
//     return res.status(500).json({ success: false, error: "server_error" });
//   }
// });

//  // DELETE /api/smartgen/:id → delete one smartgen by ID
// router.delete("/:id", requireAuth, async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Ensure the record belongs to the logged-in user
//     const deleted = await Smartgen.findOneAndDelete({
//       _id: id,
//       userId: req.user._id,
//     });

//     if (!deleted) {
//       return res
//         .status(404)
//         .json({ success: false, error: "smartgen_not_found" });
//     }

//     res.json({ success: true, message: "Smartgen deleted", deleted });
//   } catch (err) {
//     console.error("Delete Smartgen error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// // DELETE /api/smartgen/user/all → delete all smartgens for current user
// router.delete("/user/all", requireAuth, async (req, res) => {
//   try {
//     const result = await Smartgen.deleteMany({ userId: req.user._id });

//     res.json({
//       success: true,
//       message: `Deleted ${result.deletedCount} Smartgen records`,
//     });
//   } catch (err) {
//     console.error("Delete All Smartgens error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });


// module.exports = router;


// server/routes/smartgenRoutes.js
const express = require("express");
const Smartgen = require("../models/Smartgen");
const { requireAuth } = require("../utils/auth");
const { ensureMonthlyQuota, spendMonthlyTokens } = require("../utils/quota");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const { PLANS } = require("../config/plans");
const { spendTokensForIndividual, spendTokensForTeamMember, spendTokensForOrgOwner } = require("../service/spend");
const User = require("../models/User");
const Organization = require("../models/organization");

// Enforce history cap for Free users
async function enforceSmartgenHistoryLimit(user) {
  const planKey = String(user?.plan || "free").toLowerCase();
  const plan = PLANS[planKey];
  if (!plan || !plan.historyEntries || plan.historyEntries === "unlimited") return;

  const cap = plan.historyEntries;
  const filter = { userId: user._id, orgId: user.orgId || null };
  const existingCount = await Smartgen.countDocuments(filter);

  if (existingCount >= cap) {
    const toDeleteCount = existingCount - cap + 1;
    const oldest = await Smartgen.find(filter)
      .sort({ createdAt: 1 })
      .limit(toDeleteCount)
      .select({ _id: 1 })
      .lean();

    const ids = oldest.map(d => d._id);
    if (ids.length) {
      await Smartgen.deleteMany({ _id: { $in: ids } });
    }
  }
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  },
});
const upload = multer({ storage });

/**
 * POST /api/smartgen
 */
router.post("/", requireAuth, upload.array("attachments", 5), async (req, res) => {
  try {
    const { inputPrompt, detailedPrompt, tokensUsed } = req.body ?? {};
    if (!inputPrompt || !detailedPrompt) {
      return res.status(400).json({ success: false, error: "inputPrompt_and_detailedPrompt_required" });
    }
    const amount = Number(tokensUsed);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, error: "tokensUsed_required_positive_number" });
    }

    let updatedUser = null;
    let updatedOrg = null;

    if (req.user.userType === "IND") {
      await enforceSmartgenHistoryLimit(req.user);
      await spendTokensForIndividual(req.user._id, amount, "smartgen");
      updatedUser = await User.findById(req.user._id);
      req.user = updatedUser; // Update req.user

    } else if (req.user.userType === "TM") {
      updatedOrg = await Organization.findById(req.user.orgId);
      if (!updatedOrg.plan) return res.status(403).json({ success: false, error: "not proper plan purchased" });
      await spendTokensForTeamMember(req.user._id, amount, "smartgen");
      updatedUser = await User.findById(req.user._id);
      updatedOrg = await Organization.findById(req.user.orgId);
      req.user = updatedUser;

    } else if (req.user.userType === "ORG" && req.user.role === "Owner") {
      updatedOrg = await Organization.findById(req.user.orgId);
      if (!updatedOrg.plan) return res.status(403).json({ success: false, error: "not proper plan purchased" });
      await spendTokensForOrgOwner(req.user._id, amount, "smartgen");
      updatedUser = await User.findById(req.user._id);
      updatedOrg = await Organization.findById(req.user.orgId);
      req.user = updatedUser;

    } else {
      return res.status(403).json({ success: false, error: "invalid_user_type" });
    }

    const files = (req.files || []).map(f => ({
      filename: f.originalname,
      path: "/uploads/" + f.filename,
      mimetype: f.mimetype,
      size: f.size,
    }));

    const doc = await Smartgen.create({
      userId: req.user._id,
      orgId: req.user.orgId || null,
      inputPrompt,
      detailedPrompt,
      attachments: files,
      tokensUsed: amount,
    });

    return res.json({
      success: true,
      item: {
        id: doc._id,
        userId: doc.userId,
        orgId: doc.orgId,
        inputPrompt: doc.inputPrompt,
        detailedPrompt: doc.detailedPrompt,
        attachments: doc.attachments,
        tokensUsed: doc.tokensUsed,
        createdAt: doc.createdAt,
      },
      user: updatedUser,   // FRESH USER
      org: updatedOrg,     // FRESH ORG
    });
  } catch (err) {
    if (err?.code === "insufficient_quota") {
      return res.status(402).json({ success: false, error: "insufficient_quota" });
    }
    console.error("POST /smartgen error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// PUT /:id
router.put("/:id", requireAuth, upload.array("attachments", 5), async (req, res) => {
  try {
    const { inputPrompt, detailedPrompt, tokensUsed } = req.body ?? {};
    const smartgenId = req.params.id;

    const smartgen = await Smartgen.findOne({ _id: smartgenId, userId: req.user._id });
    if (!smartgen) {
      return res.status(404).json({ success: false, error: "smartgen_not_found_or_access_denied" });
    }

    if (inputPrompt && detailedPrompt) {
      smartgen.inputPrompt = inputPrompt;
      smartgen.detailedPrompt = detailedPrompt;
    }

    const amount = Number(tokensUsed);
    if (tokensUsed && (!Number.isFinite(amount) || amount <= 0)) {
      return res.status(400).json({ success: false, error: "tokensUsed_required_positive_number" });
    }

    if (tokensUsed) {
      await ensureMonthlyQuota(req.user);
      await spendMonthlyTokens(req.user, amount);
      smartgen.tokensUsed = amount;
    }

    const files = (req.files || []).map(f => ({
      filename: f.originalname,
      path: "/uploads/" + f.filename,
      mimetype: f.mimetype,
      size: f.size,
    }));

    if (files.length > 0) {
      smartgen.attachments = [...smartgen.attachments, ...files];
    }

    await smartgen.save();

    return res.json({
      success: true,
      item: {
        id: smartgen._id,
        userId: smartgen.userId,
        orgId: smartgen.orgId,
        inputPrompt: smartgen.inputPrompt,
        detailedPrompt: smartgen.detailedPrompt,
        attachments: smartgen.attachments,
        tokensUsed: smartgen.tokensUsed,
        createdAt: smartgen.createdAt,
        updatedAt: smartgen.updatedAt,
      },
      dailyTokensRemaining: req.user.dailyTokensRemaining,
    });
  } catch (err) {
    if (err?.code === "insufficient_quota") {
      return res.status(402).json({ success: false, error: "insufficient_quota" });
    }
    console.error("PUT /smartgen error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// GET /
router.get("/", requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
    const orgOnly = String(req.query.orgOnly || "false") === "true";

    const filter = { isDeleted: false };

    if (orgOnly && req.user.orgId) {
      filter.orgId = req.user.orgId;
    } else {
      filter.userId = req.user._id;
    }

    const [items, total] = await Promise.all([
      Smartgen.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Smartgen.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      page,
      limit,
      total,
      items: items.map(x => ({
        id: x._id,
        userId: x.userId,
        orgId: x.orgId,
        inputPrompt: x.inputPrompt,
        detailedPrompt: x.detailedPrompt,
        attachmentUrl: x.attachmentUrl,
        tokensUsed: x.tokensUsed,
        createdAt: x.createdAt,
        updatedAt: x.updatedAt,
      })),
    });
  } catch (err) {
    console.error("GET /smartgen error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// GET /:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const doc = await Smartgen.findById(req.params.id);
    if (!doc || doc.isDeleted) {
      return res.status(404).json({ success: false, error: "not_found" });
    }

    const isOwner = String(doc.userId) === String(req.user._id);
    const sameOrg = doc.orgId && req.user.orgId && String(doc.orgId) === String(req.user.orgId);

    if (!isOwner && !sameOrg) {
      return res.status(403).json({ success: false, error: "forbidden" });
    }

    return res.json({
      success: true,
      item: {
        id: doc._id,
        userId: doc.userId,
        orgId: doc.orgId,
        inputPrompt: doc.inputPrompt,
        detailedPrompt: doc.detailedPrompt,
        attachmentUrl: doc.attachmentUrl,
        tokensUsed: doc.tokensUsed,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (err) {
    console.error("GET /smartgen/:id error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// DELETE /:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Smartgen.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!deleted) {
      return res.status(404).json({ success: false, error: "smartgen_not_found" });
    }

    res.json({ success: true, message: "Smartgen deleted", deleted });
  } catch (err) {
    console.error("Delete Smartgen error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// DELETE /user/all
router.delete("/user/all", requireAuth, async (req, res) => {
  try {
    const result = await Smartgen.deleteMany({ userId: req.user._id });
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} Smartgen records`,
    });
  } catch (err) {
    console.error("Delete All Smartgens error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;