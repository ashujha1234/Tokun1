// // // routes/sellerRoutes.js
// // const express = require("express");
// // const mongoose = require("mongoose");
// // const router = express.Router();

// // const User = require("../models/User");
// // const Prompt = require("../models/Prompt");

// // // ✅ If tumhare project me already auth middleware hai,
// // // to ye import use karo. Agar path different ho to adjust.
// // // const { requireAuth, requireAdmin } = require("../utils/auth");

// // // ✅ Safe fallback (agar tumhare project me requireAuth nahi hai)
// // const requireAuth = (req, res, next) => next();
// // const requireAdmin = (req, res, next) => next();

// // /**
// //  * GET /api/seller/:sellerId
// //  * returns seller profile + KPIs
// //  */
// // router.get("/:sellerId", requireAuth, requireAdmin, async (req, res) => {
// //   try {
// //     const { sellerId } = req.params;

// //     if (!mongoose.Types.ObjectId.isValid(sellerId)) {
// //       return res.status(400).json({ success: false, error: "Invalid sellerId" });
// //     }

// //     const seller = await User.findById(sellerId).lean();

// //     if (!seller) {
// //       return res.status(404).json({ success: false, error: "Seller not found" });
// //     }

// //     // ✅ total earnings (sum sold prompts)
// //     const earningsAgg = await Prompt.aggregate([
// //       { $match: { userId: new mongoose.Types.ObjectId(sellerId), sold: true } },
// //       {
// //         $project: {
// //           finalPrice: {
// //             $cond: [
// //               { $gt: ["$tokun_price", 0] },
// //               "$tokun_price",
// //               { $ifNull: ["$price", 0] },
// //             ],
// //           },
// //         },
// //       },
// //       { $group: { _id: null, total: { $sum: "$finalPrice" } } },
// //     ]);

// //     const totalEarnings = earningsAgg?.[0]?.total || 0;

// //     return res.json({
// //       success: true,
// //       seller: {
// //         _id: String(seller._id),
// //         name: seller.name || "Unknown",
// //         email: seller.email || null,
// //         location: seller.location || null,
// //         joined: seller.createdAt || null,
// //         status: seller.sellerStatus || "ACTIVE",
// //         avatar: seller.avatarUrl || null,
// //         verified: !!seller.isVerified,

// //         totalEarnings,
// //         rating: seller.sellerRating || 0,
// //         reviewsCount: seller.sellerReviewsCount || 0,
// //         refundRate: seller.sellerRefundRate || 0,
// //         refundThreshold: seller.sellerRefundThreshold || 5,
// //       },
// //     });
// //   } catch (err) {
// //     console.error("GET /api/seller/:sellerId error:", err);
// //     return res.status(500).json({ success: false, error: "Server error" });
// //   }
// // });

// // /**
// //  * PATCH /api/seller/:sellerId/status
// //  * body: { status: "ACTIVE" | "SUSPENDED" }
// //  */
// // router.patch("/:sellerId/status", requireAuth, requireAdmin, async (req, res) => {
// //   try {
// //     const { sellerId } = req.params;
// //     const { status } = req.body;

// //     if (!mongoose.Types.ObjectId.isValid(sellerId)) {
// //       return res.status(400).json({ success: false, error: "Invalid sellerId" });
// //     }

// //     if (!["ACTIVE", "SUSPENDED"].includes(status)) {
// //       return res.status(400).json({ success: false, error: "Invalid status" });
// //     }

// //     const updated = await User.findByIdAndUpdate(
// //       sellerId,
// //       { sellerStatus: status },
// //       { new: true }
// //     ).lean();

// //     if (!updated) {
// //       return res.status(404).json({ success: false, error: "Seller not found" });
// //     }

// //     return res.json({
// //       success: true,
// //       seller: {
// //         _id: String(updated._id),
// //         status: updated.sellerStatus,
// //       },
// //     });
// //   } catch (err) {
// //     console.error("PATCH /api/seller/:sellerId/status error:", err);
// //     return res.status(500).json({ success: false, error: "Server error" });
// //   }
// // });

// // module.exports = router;


// // routes/sellerRoutes.js
// const express = require("express");
// const mongoose = require("mongoose");
// const router = express.Router();

// const User = require("../models/User");
// const Prompt = require("../models/Prompt");

// // ✅ Replace these with your actual middlewares if present
// const requireAuth = (req, res, next) => next();
// const requireAdmin = (req, res, next) => next();

// /**
//  * ✅ GET /api/seller?limit=4&page=1&search=
//  * Dashboard table ke liye sellers list
//  */
// // router.get("/", requireAuth, requireAdmin, async (req, res) => {
// //   try {
// //     const limit = Math.min(parseInt(req.query.limit || "10", 10), 50);
// //     const page = Math.max(parseInt(req.query.page || "1", 10), 1);
// //     const search = (req.query.search || "").toString().trim();

// //     const query = {
// //       // seller likely IND/ORG (adjust if you have a "seller" flag)
// //       userType: { $in: ["IND", "ORG"] },
// //       ...(search
// //         ? {
// //             $or: [
// //               { name: { $regex: search, $options: "i" } },
// //               { email: { $regex: search, $options: "i" } },
// //             ],
// //           }
// //         : {}),
// //     };

// //     const sellers = await User.find(query)
// //       .select("name email avatarUrl isVerified createdAt sellerStatus status location sellerRating sellerReviewsCount")
// //       .sort({ createdAt: -1 })
// //       .skip((page - 1) * limit)
// //       .limit(limit)
// //       .lean();

// //     // Optional: totalEarnings quick (only sold prompts)
// //     const sellerIds = sellers.map((s) => s._id);

// //     const earnings = await Prompt.aggregate([
// //       { $match: { userId: { $in: sellerIds }, sold: true } },
// //       {
// //         $project: {
// //           userId: 1,
// //           finalPrice: {
// //             $cond: [
// //               { $gt: ["$tokun_price", 0] },
// //               "$tokun_price",
// //               { $ifNull: ["$price", 0] },
// //             ],
// //           },
// //         },
// //       },
// //       { $group: { _id: "$userId", total: { $sum: "$finalPrice" } } },
// //     ]);

// //     const earningsMap = new Map(earnings.map((e) => [String(e._id), e.total]));

// //     const mapped = sellers.map((s) => ({
// //       _id: String(s._id),
// //       name: s.name || "Unknown",
// //       email: s.email || null,
// //       avatar: s.avatarUrl || null,
// //       verified: !!s.isVerified,
// //       joined: s.createdAt || null,

// //       // ✅ safe status mapping (your db may have any of these)
// //       status: s.sellerStatus || s.status || "ACTIVE",

// //       // Optional stats
// //       totalEarnings: earningsMap.get(String(s._id)) || 0,
// //       rating: s.sellerRating || 0,
// //       reviewsCount: s.sellerReviewsCount || 0,
// //       location: s.location || null,
// //     }));

// //     const total = await User.countDocuments(query);

// //     return res.json({
// //       success: true,
// //       sellers: mapped,
// //       pagination: {
// //         total,
// //         page,
// //         limit,
// //         totalPages: Math.ceil(total / limit),
// //       },
// //     });
// //   } catch (err) {
// //     console.error("GET /api/seller error:", err);
// //     return res.status(500).json({ success: false, error: "Server error" });
// //   }
// // });


// router.get("/", requireAuth, requireAdmin, async (req, res) => {
//   try {
//     const rawLimit = req.query.limit;
//     const page = Math.max(parseInt(req.query.page || "1", 10), 1);
//     const search = (req.query.search || "").toString().trim();

//     // ✅ if limit=0 => fetch all
//     const limit = rawLimit === undefined ? 10 : Math.max(parseInt(rawLimit, 10), 0);

//      const query = {
//   ...(search
//     ? {
//         $or: [
//           { name: { $regex: search, $options: "i" } },
//           { email: { $regex: search, $options: "i" } },
//         ],
//       }
//     : {}),
// };

//     let q = User.find(query)
//       .select("name email avatarUrl isVerified createdAt sellerStatus status location sellerRating sellerReviewsCount")
//       .sort({ createdAt: -1 })
//       .lean();

//     // ✅ apply pagination only when limit > 0
//     if (limit > 0) {
//       q = q.skip((page - 1) * limit).limit(limit);
//     }

//     const sellers = await q;
//     const total = await User.countDocuments(query);

//     return res.json({
//       success: true,
//       sellers: sellers.map((s) => ({
//         _id: String(s._id),
//         name: s.name || "Unknown",
//         email: s.email || null,
//         avatar: s.avatarUrl || null,
//         verified: !!s.isVerified,
//         joined: s.createdAt || null,
//         status: s.sellerStatus || s.status || "ACTIVE",
//         rating: s.sellerRating || 0,
//         reviewsCount: s.sellerReviewsCount || 0,
//         location: s.location || null,
//       })),
//       pagination: {
//         total,
//         page,
//         limit: limit === 0 ? total : limit,
//         totalPages: limit === 0 ? 1 : Math.ceil(total / limit),
//       },
//     });
//   } catch (err) {
//     console.error("GET /api/seller error:", err);
//     return res.status(500).json({ success: false, error: "Server error" });
//   }
// });

// /**
//  * ✅ GET /api/seller/:sellerId
//  * returns seller profile + KPIs (tumhara existing)
//  */
// router.get("/:sellerId", requireAuth, requireAdmin, async (req, res) => {
//   try {
//     const { sellerId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(sellerId)) {
//       return res.status(400).json({ success: false, error: "Invalid sellerId" });
//     }

//     const seller = await User.findById(sellerId).lean();
//     if (!seller) {
//       return res.status(404).json({ success: false, error: "Seller not found" });
//     }

//     const earningsAgg = await Prompt.aggregate([
//       { $match: { userId: new mongoose.Types.ObjectId(sellerId), sold: true } },
//       {
//         $project: {
//           finalPrice: {
//             $cond: [
//               { $gt: ["$tokun_price", 0] },
//               "$tokun_price",
//               { $ifNull: ["$price", 0] },
//             ],
//           },
//         },
//       },
//       { $group: { _id: null, total: { $sum: "$finalPrice" } } },
//     ]);

//     const totalEarnings = earningsAgg?.[0]?.total || 0;

//     return res.json({
//       success: true,
//       seller: {
//         _id: String(seller._id),
//         name: seller.name || "Unknown",
//         email: seller.email || null,
//         location: seller.location || null,
//         joined: seller.createdAt || null,

//         // ✅ safe
//         status: seller.sellerStatus || seller.status || "ACTIVE",

//         avatar: seller.avatarUrl || null,
//         verified: !!seller.isVerified,

//         totalEarnings,
//         rating: seller.sellerRating || 0,
//         reviewsCount: seller.sellerReviewsCount || 0,
//         refundRate: seller.sellerRefundRate || 0,
//         refundThreshold: seller.sellerRefundThreshold || 5,
//       },
//     });
//   } catch (err) {
//     console.error("GET /api/seller/:sellerId error:", err);
//     return res.status(500).json({ success: false, error: "Server error" });
//   }
// });

// /**
//  * ✅ PATCH /api/seller/:sellerId/status
//  */
// router.patch("/:sellerId/status", requireAuth, requireAdmin, async (req, res) => {
//   try {
//     const { sellerId } = req.params;
//     const { status } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(sellerId)) {
//       return res.status(400).json({ success: false, error: "Invalid sellerId" });
//     }
//     if (!["ACTIVE", "SUSPENDED"].includes(status)) {
//       return res.status(400).json({ success: false, error: "Invalid status" });
//     }

//     const updated = await User.findByIdAndUpdate(
//       sellerId,
//       { sellerStatus: status },
//       { new: true }
//     ).lean();

//     if (!updated) {
//       return res.status(404).json({ success: false, error: "Seller not found" });
//     }

//     return res.json({
//       success: true,
//       seller: {
//         _id: String(updated._id),
//         status: updated.sellerStatus,
//       },
//     });
//   } catch (err) {
//     console.error("PATCH /api/seller/:sellerId/status error:", err);
//     return res.status(500).json({ success: false, error: "Server error" });
//   }
// });

// module.exports = router;







/**
 * ✅ GET /api/seller?limit=4&page=1&search=
 * - limit not provided => default 10
 * - limit=0 => fetch all
 * - returns counts: uploaded prompts, sold prompts, earnings
 */
// router.get("/", requireAuth, requireAdmin, async (req, res) => {
//   try {
//     const rawLimit = req.query.limit;
//     const page = Math.max(parseInt(req.query.page || "1", 10), 1);
//     const search = (req.query.search || "").toString().trim();

//     // ✅ limit: if undefined -> 10, if "0" -> all, else min(50)
//     let limit = rawLimit === undefined ? 10 : Math.max(parseInt(rawLimit, 10), 0);
//     if (limit > 50) limit = 50; // safety cap when paginating

//     const query = {
//       ...(search
//         ? {
//             $or: [
//               { name: { $regex: search, $options: "i" } },
//               { email: { $regex: search, $options: "i" } },
//             ],
//           }
//         : {}),
//     };

//     // 1) fetch sellers list
//     let q = User.find(query)
//       .select(
//         "name email avatarUrl isVerified createdAt sellerStatus status location sellerRating sellerReviewsCount"
//       )
//       .sort({ createdAt: -1 })
//       .lean();

//     // ✅ apply pagination only when limit > 0
//     if (limit > 0) {
//       q = q.skip((page - 1) * limit).limit(limit);
//     }

//     const sellers = await q;
//     const total = await User.countDocuments(query);

//     const sellerIds = sellers.map((s) => s._id);

//     // if no sellers found
//     if (!sellerIds.length) {
//       return res.json({
//         success: true,
//         sellers: [],
//         pagination: {
//           total,
//           page,
//           limit: limit === 0 ? total : limit,
//           totalPages: limit === 0 ? 1 : Math.ceil(total / limit),
//         },
//       });
//     }

//     // 2) total prompts uploaded per seller
//     const uploadedAgg = await Prompt.aggregate([
//       { $match: { userId: { $in: sellerIds } } },
//       { $group: { _id: "$userId", totalUploaded: { $sum: 1 } } },
//     ]);

//     // 3) total prompts sold per seller
//     const soldAgg = await Prompt.aggregate([
//       { $match: { userId: { $in: sellerIds }, sold: true } },
//       { $group: { _id: "$userId", totalSold: { $sum: 1 } } },
//     ]);

//     // 4) total earnings per seller (sum of sold prompt price)
//     const earningsAgg = await Prompt.aggregate([
//       { $match: { userId: { $in: sellerIds }, sold: true } },
//       {
//         $project: {
//           userId: 1,
//           finalPrice: {
//             $cond: [
//               { $gt: ["$tokun_price", 0] },
//               "$tokun_price",
//               { $ifNull: ["$price", 0] },
//             ],
//           },
//         },
//       },
//       { $group: { _id: "$userId", total: { $sum: "$finalPrice" } } },
//     ]);

//     const uploadedMap = new Map(uploadedAgg.map((e) => [String(e._id), e.totalUploaded]));
//     const soldMap = new Map(soldAgg.map((e) => [String(e._id), e.totalSold]));
//     const earningsMap = new Map(earningsAgg.map((e) => [String(e._id), e.total]));

//     // 5) response mapping
//     const mapped = sellers.map((s) => ({
//       _id: String(s._id),
//       name: s.name || "Unknown",
//       email: s.email || null,
//       avatar: s.avatarUrl || null,
//       verified: !!s.isVerified,
//       joined: s.createdAt || null,

//       // ✅ status fallback
//       status: s.sellerStatus || s.status || "ACTIVE",

//       rating: s.sellerRating || 0,
//       reviewsCount: s.sellerReviewsCount || 0,
//       location: s.location || null,

//       // ✅ NEW IMPORTANT FIELDS
//       totalUploadedPrompts: uploadedMap.get(String(s._id)) || 0,
//       totalSoldPrompts: soldMap.get(String(s._id)) || 0,
//       totalEarnings: earningsMap.get(String(s._id)) || 0,
//     }));

//     return res.json({
//       success: true,
//       sellers: mapped,
//       pagination: {
//         total,
//         page,
//         limit: limit === 0 ? total : limit,
//         totalPages: limit === 0 ? 1 : Math.ceil(total / limit),
//       },
//     });
//   } catch (err) {
//     console.error("GET /api/seller error:", err);
//     return res.status(500).json({ success: false, error: "Server error" });
//   }
// });
// routes/sellerRoutes.js





const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const User = require("../models/User");
const Prompt = require("../models/Prompt");

// ✅ Replace these with your actual middlewares if present
const requireAuth = (req, res, next) => next();
const requireAdmin = (req, res, next) => next();

router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const rawLimit = req.query.limit;
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const search = (req.query.search || "").toString().trim();

    // ✅ if limit=0 => fetch all
    const limit =
      rawLimit === undefined ? 10 : Math.max(parseInt(rawLimit, 10), 0);

   
    const showDeleted = req.query.deleted === "true";

    
    const query = {
      isDeleted: showDeleted ? true : { $ne: true },
      ...(search ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      } : {}),
    };

    let q = User.find(query)
      .select(
        "name email avatarUrl isVerified createdAt sellerStatus status location sellerRating sellerReviewsCount"
      )
      .sort({ createdAt: -1 })
      .lean();

    if (limit > 0) {
      q = q.skip((page - 1) * limit).limit(limit);
    }

    const sellers = await q;
    const total = await User.countDocuments(query);

    // ✅ compute totalProducts per seller (uploaded prompts count)
    const userIds = sellers.map((u) => u._id);

    const countsAgg = await Prompt.aggregate([
      { $match: { userId: { $in: userIds } } }, // all uploaded prompts
      {
        $group: {
          _id: "$userId",
          totalProducts: { $sum: 1 },
          soldProducts: {
            $sum: {
              $cond: [{ $eq: ["$sold", true] }, 1, 0],
            },
          },
        },
      },
    ]);

    const countsMap = new Map(
      countsAgg.map((x) => [
        String(x._id),
        { total: x.totalProducts || 0, sold: x.soldProducts || 0 },
      ])
    );

    return res.json({
      success: true,
      sellers: sellers.map((s) => {
        const c = countsMap.get(String(s._id)) || { total: 0, sold: 0 };

        return {
          _id: String(s._id),
          name: s.name || "Unknown",
          email: s.email || null,
          avatar: s.avatarUrl || null,
          verified: !!s.isVerified,
          joined: s.createdAt || null,
          status: s.sellerStatus || s.status || "ACTIVE",
          rating: s.sellerRating || 0,
          reviewsCount: s.sellerReviewsCount || 0,
          location: s.location || null,

          // ✅ NOW FRONTEND WILL GET THIS
          totalProducts: c.total,     // uploaded prompts count
          soldProducts: c.sold,       // sold prompts count (optional)
        };
      }),
      pagination: {
        total,
        page,
        limit: limit === 0 ? total : limit,
        totalPages: limit === 0 ? 1 : Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("GET /api/seller error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});


/**
 * ✅ GET /api/seller/:sellerId
 * returns seller profile + KPIs + (optional counts)
 */
router.get("/:sellerId", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ success: false, error: "Invalid sellerId" });
    }

    const seller = await User.findById(sellerId).lean();
    if (!seller) {
      return res.status(404).json({ success: false, error: "Seller not found" });
    }

    // ✅ earnings
    const earningsAgg = await Prompt.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(sellerId), sold: true } },
      {
        $project: {
          finalPrice: {
            $cond: [
              { $gt: ["$tokun_price", 0] },
              "$tokun_price",
              { $ifNull: ["$price", 0] },
            ],
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$finalPrice" } } },
    ]);

    const totalEarnings = earningsAgg?.[0]?.total || 0;

    // ✅ uploaded count
    const uploadedCount = await Prompt.countDocuments({
      userId: new mongoose.Types.ObjectId(sellerId),
    });

    // ✅ sold count
    const soldCount = await Prompt.countDocuments({
      userId: new mongoose.Types.ObjectId(sellerId),
      sold: true,
    });

    return res.json({
      success: true,
      seller: {
        _id: String(seller._id),
        name: seller.name || "Unknown",
        email: seller.email || null,
        location: seller.location || null,
        joined: seller.createdAt || null,

        status: seller.sellerStatus || seller.status || "ACTIVE",
        avatar: seller.avatarUrl || null,
        verified: !!seller.isVerified,

        totalEarnings,
        rating: seller.sellerRating || 0,
        reviewsCount: seller.sellerReviewsCount || 0,
        refundRate: seller.sellerRefundRate || 0,
        refundThreshold: seller.sellerRefundThreshold || 5,

        // ✅ extra
        totalUploadedPrompts: uploadedCount,
        totalSoldPrompts: soldCount,
      },
    });
  } catch (err) {
    console.error("GET /api/seller/:sellerId error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * ✅ PATCH /api/seller/:sellerId/status
 */
router.patch("/:sellerId/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ success: false, error: "Invalid sellerId" });
    }
    if (!["ACTIVE", "SUSPENDED"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const updated = await User.findByIdAndUpdate(
      sellerId,
      { sellerStatus: status },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, error: "Seller not found" });
    }

    return res.json({
      success: true,
      seller: {
        _id: String(updated._id),
        status: updated.sellerStatus,
      },
    });
  } catch (err) {
    console.error("PATCH /api/seller/:sellerId/status error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});



router.patch("/:sellerId/block", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { action } = req.body; // "block" | "unblock"

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ success: false, error: "Invalid sellerId" });
    }

    if (!["block", "unblock"].includes(action)) {
      return res.status(400).json({ success: false, error: "action must be 'block' or 'unblock'" });
    }

    const newStatus = action === "block" ? "SUSPENDED" : "ACTIVE";

    const updated = await User.findByIdAndUpdate(
      sellerId,
      { sellerStatus: newStatus },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, error: "Seller not found" });
    }

    return res.json({
      success: true,
      seller: {
        _id: String(updated._id),
        status: newStatus,
      },
    });
  } catch (err) {
    console.error("PATCH /api/seller/:sellerId/block error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// ============================================
// PATCH /api/seller/:sellerId/soft-delete
// Soft delete ya restore karo seller ko
// ============================================
router.patch("/:sellerId/soft-delete", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { action } = req.body; // "delete" | "restore"

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ success: false, error: "Invalid sellerId" });
    }

    if (!["delete", "restore"].includes(action)) {
      return res.status(400).json({ success: false, error: "action must be 'delete' or 'restore'" });
    }

    const updateFields =
      action === "delete"
        ? { isDeleted: true, deletedAt: new Date(), sellerStatus: "SUSPENDED" }
        : { isDeleted: false, deletedAt: null };

    const updated = await User.findByIdAndUpdate(sellerId, updateFields, {
      new: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({ success: false, error: "Seller not found" });
    }

    return res.json({
      success: true,
      seller: {
        _id: String(updated._id),
        isDeleted: updated.isDeleted,
        status: updated.sellerStatus || "ACTIVE",
      },
    });
  } catch (err) {
    console.error("PATCH /api/seller/:sellerId/soft-delete error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});





module.exports = router;
