// // // // routes/sellerRoutes.js
// // // const express = require("express");
// // // const mongoose = require("mongoose");
// // // const router = express.Router();

// // // const User = require("../models/User");
// // // const Prompt = require("../models/Prompt");

// // // // ✅ If tumhare project me already auth middleware hai,
// // // // to ye import use karo. Agar path different ho to adjust.
// // // // const { requireAuth, requireAdmin } = require("../utils/auth");

// // // // ✅ Safe fallback (agar tumhare project me requireAuth nahi hai)
// // // const requireAuth = (req, res, next) => next();
// // // const requireAdmin = (req, res, next) => next();

// // // /**
// // //  * GET /api/seller/:sellerId
// // //  * returns seller profile + KPIs
// // //  */
// // // router.get("/:sellerId", requireAuth, requireAdmin, async (req, res) => {
// // //   try {
// // //     const { sellerId } = req.params;

// // //     if (!mongoose.Types.ObjectId.isValid(sellerId)) {
// // //       return res.status(400).json({ success: false, error: "Invalid sellerId" });
// // //     }

// // //     const seller = await User.findById(sellerId).lean();

// // //     if (!seller) {
// // //       return res.status(404).json({ success: false, error: "Seller not found" });
// // //     }

// // //     // ✅ total earnings (sum sold prompts)
// // //     const earningsAgg = await Prompt.aggregate([
// // //       { $match: { userId: new mongoose.Types.ObjectId(sellerId), sold: true } },
// // //       {
// // //         $project: {
// // //           finalPrice: {
// // //             $cond: [
// // //               { $gt: ["$tokun_price", 0] },
// // //               "$tokun_price",
// // //               { $ifNull: ["$price", 0] },
// // //             ],
// // //           },
// // //         },
// // //       },
// // //       { $group: { _id: null, total: { $sum: "$finalPrice" } } },
// // //     ]);

// // //     const totalEarnings = earningsAgg?.[0]?.total || 0;

// // //     return res.json({
// // //       success: true,
// // //       seller: {
// // //         _id: String(seller._id),
// // //         name: seller.name || "Unknown",
// // //         email: seller.email || null,
// // //         location: seller.location || null,
// // //         joined: seller.createdAt || null,
// // //         status: seller.sellerStatus || "ACTIVE",
// // //         avatar: seller.avatarUrl || null,
// // //         verified: !!seller.isVerified,

// // //         totalEarnings,
// // //         rating: seller.sellerRating || 0,
// // //         reviewsCount: seller.sellerReviewsCount || 0,
// // //         refundRate: seller.sellerRefundRate || 0,
// // //         refundThreshold: seller.sellerRefundThreshold || 5,
// // //       },
// // //     });
// // //   } catch (err) {
// // //     console.error("GET /api/seller/:sellerId error:", err);
// // //     return res.status(500).json({ success: false, error: "Server error" });
// // //   }
// // // });

// // // /**
// // //  * PATCH /api/seller/:sellerId/status
// // //  * body: { status: "ACTIVE" | "SUSPENDED" }
// // //  */
// // // router.patch("/:sellerId/status", requireAuth, requireAdmin, async (req, res) => {
// // //   try {
// // //     const { sellerId } = req.params;
// // //     const { status } = req.body;

// // //     if (!mongoose.Types.ObjectId.isValid(sellerId)) {
// // //       return res.status(400).json({ success: false, error: "Invalid sellerId" });
// // //     }

// // //     if (!["ACTIVE", "SUSPENDED"].includes(status)) {
// // //       return res.status(400).json({ success: false, error: "Invalid status" });
// // //     }

// // //     const updated = await User.findByIdAndUpdate(
// // //       sellerId,
// // //       { sellerStatus: status },
// // //       { new: true }
// // //     ).lean();

// // //     if (!updated) {
// // //       return res.status(404).json({ success: false, error: "Seller not found" });
// // //     }

// // //     return res.json({
// // //       success: true,
// // //       seller: {
// // //         _id: String(updated._id),
// // //         status: updated.sellerStatus,
// // //       },
// // //     });
// // //   } catch (err) {
// // //     console.error("PATCH /api/seller/:sellerId/status error:", err);
// // //     return res.status(500).json({ success: false, error: "Server error" });
// // //   }
// // // });

// // // module.exports = router;


// // // routes/sellerRoutes.js
// // const express = require("express");
// // const mongoose = require("mongoose");
// // const router = express.Router();

// // const User = require("../models/User");
// // const Prompt = require("../models/Prompt");

// // // ✅ Replace these with your actual middlewares if present
// // const requireAuth = (req, res, next) => next();
// // const requireAdmin = (req, res, next) => next();

// // /**
// //  * ✅ GET /api/seller?limit=4&page=1&search=
// //  * Dashboard table ke liye sellers list
// //  */
// // // router.get("/", requireAuth, requireAdmin, async (req, res) => {
// // //   try {
// // //     const limit = Math.min(parseInt(req.query.limit || "10", 10), 50);
// // //     const page = Math.max(parseInt(req.query.page || "1", 10), 1);
// // //     const search = (req.query.search || "").toString().trim();

// // //     const query = {
// // //       // seller likely IND/ORG (adjust if you have a "seller" flag)
// // //       userType: { $in: ["IND", "ORG"] },
// // //       ...(search
// // //         ? {
// // //             $or: [
// // //               { name: { $regex: search, $options: "i" } },
// // //               { email: { $regex: search, $options: "i" } },
// // //             ],
// // //           }
// // //         : {}),
// // //     };

// // //     const sellers = await User.find(query)
// // //       .select("name email avatarUrl isVerified createdAt sellerStatus status location sellerRating sellerReviewsCount")
// // //       .sort({ createdAt: -1 })
// // //       .skip((page - 1) * limit)
// // //       .limit(limit)
// // //       .lean();

// // //     // Optional: totalEarnings quick (only sold prompts)
// // //     const sellerIds = sellers.map((s) => s._id);

// // //     const earnings = await Prompt.aggregate([
// // //       { $match: { userId: { $in: sellerIds }, sold: true } },
// // //       {
// // //         $project: {
// // //           userId: 1,
// // //           finalPrice: {
// // //             $cond: [
// // //               { $gt: ["$tokun_price", 0] },
// // //               "$tokun_price",
// // //               { $ifNull: ["$price", 0] },
// // //             ],
// // //           },
// // //         },
// // //       },
// // //       { $group: { _id: "$userId", total: { $sum: "$finalPrice" } } },
// // //     ]);

// // //     const earningsMap = new Map(earnings.map((e) => [String(e._id), e.total]));

// // //     const mapped = sellers.map((s) => ({
// // //       _id: String(s._id),
// // //       name: s.name || "Unknown",
// // //       email: s.email || null,
// // //       avatar: s.avatarUrl || null,
// // //       verified: !!s.isVerified,
// // //       joined: s.createdAt || null,

// // //       // ✅ safe status mapping (your db may have any of these)
// // //       status: s.sellerStatus || s.status || "ACTIVE",

// // //       // Optional stats
// // //       totalEarnings: earningsMap.get(String(s._id)) || 0,
// // //       rating: s.sellerRating || 0,
// // //       reviewsCount: s.sellerReviewsCount || 0,
// // //       location: s.location || null,
// // //     }));

// // //     const total = await User.countDocuments(query);

// // //     return res.json({
// // //       success: true,
// // //       sellers: mapped,
// // //       pagination: {
// // //         total,
// // //         page,
// // //         limit,
// // //         totalPages: Math.ceil(total / limit),
// // //       },
// // //     });
// // //   } catch (err) {
// // //     console.error("GET /api/seller error:", err);
// // //     return res.status(500).json({ success: false, error: "Server error" });
// // //   }
// // // });


// // router.get("/", requireAuth, requireAdmin, async (req, res) => {
// //   try {
// //     const rawLimit = req.query.limit;
// //     const page = Math.max(parseInt(req.query.page || "1", 10), 1);
// //     const search = (req.query.search || "").toString().trim();

// //     // ✅ if limit=0 => fetch all
// //     const limit = rawLimit === undefined ? 10 : Math.max(parseInt(rawLimit, 10), 0);

// //      const query = {
// //   ...(search
// //     ? {
// //         $or: [
// //           { name: { $regex: search, $options: "i" } },
// //           { email: { $regex: search, $options: "i" } },
// //         ],
// //       }
// //     : {}),
// // };

// //     let q = User.find(query)
// //       .select("name email avatarUrl isVerified createdAt sellerStatus status location sellerRating sellerReviewsCount")
// //       .sort({ createdAt: -1 })
// //       .lean();

// //     // ✅ apply pagination only when limit > 0
// //     if (limit > 0) {
// //       q = q.skip((page - 1) * limit).limit(limit);
// //     }

// //     const sellers = await q;
// //     const total = await User.countDocuments(query);

// //     return res.json({
// //       success: true,
// //       sellers: sellers.map((s) => ({
// //         _id: String(s._id),
// //         name: s.name || "Unknown",
// //         email: s.email || null,
// //         avatar: s.avatarUrl || null,
// //         verified: !!s.isVerified,
// //         joined: s.createdAt || null,
// //         status: s.sellerStatus || s.status || "ACTIVE",
// //         rating: s.sellerRating || 0,
// //         reviewsCount: s.sellerReviewsCount || 0,
// //         location: s.location || null,
// //       })),
// //       pagination: {
// //         total,
// //         page,
// //         limit: limit === 0 ? total : limit,
// //         totalPages: limit === 0 ? 1 : Math.ceil(total / limit),
// //       },
// //     });
// //   } catch (err) {
// //     console.error("GET /api/seller error:", err);
// //     return res.status(500).json({ success: false, error: "Server error" });
// //   }
// // });

// // /**
// //  * ✅ GET /api/seller/:sellerId
// //  * returns seller profile + KPIs (tumhara existing)
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

// //         // ✅ safe
// //         status: seller.sellerStatus || seller.status || "ACTIVE",

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
// //  * ✅ PATCH /api/seller/:sellerId/status
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







// /**
//  * ✅ GET /api/seller?limit=4&page=1&search=
//  * - limit not provided => default 10
//  * - limit=0 => fetch all
//  * - returns counts: uploaded prompts, sold prompts, earnings
//  */
// // router.get("/", requireAuth, requireAdmin, async (req, res) => {
// //   try {
// //     const rawLimit = req.query.limit;
// //     const page = Math.max(parseInt(req.query.page || "1", 10), 1);
// //     const search = (req.query.search || "").toString().trim();

// //     // ✅ limit: if undefined -> 10, if "0" -> all, else min(50)
// //     let limit = rawLimit === undefined ? 10 : Math.max(parseInt(rawLimit, 10), 0);
// //     if (limit > 50) limit = 50; // safety cap when paginating

// //     const query = {
// //       ...(search
// //         ? {
// //             $or: [
// //               { name: { $regex: search, $options: "i" } },
// //               { email: { $regex: search, $options: "i" } },
// //             ],
// //           }
// //         : {}),
// //     };

// //     // 1) fetch sellers list
// //     let q = User.find(query)
// //       .select(
// //         "name email avatarUrl isVerified createdAt sellerStatus status location sellerRating sellerReviewsCount"
// //       )
// //       .sort({ createdAt: -1 })
// //       .lean();

// //     // ✅ apply pagination only when limit > 0
// //     if (limit > 0) {
// //       q = q.skip((page - 1) * limit).limit(limit);
// //     }

// //     const sellers = await q;
// //     const total = await User.countDocuments(query);

// //     const sellerIds = sellers.map((s) => s._id);

// //     // if no sellers found
// //     if (!sellerIds.length) {
// //       return res.json({
// //         success: true,
// //         sellers: [],
// //         pagination: {
// //           total,
// //           page,
// //           limit: limit === 0 ? total : limit,
// //           totalPages: limit === 0 ? 1 : Math.ceil(total / limit),
// //         },
// //       });
// //     }

// //     // 2) total prompts uploaded per seller
// //     const uploadedAgg = await Prompt.aggregate([
// //       { $match: { userId: { $in: sellerIds } } },
// //       { $group: { _id: "$userId", totalUploaded: { $sum: 1 } } },
// //     ]);

// //     // 3) total prompts sold per seller
// //     const soldAgg = await Prompt.aggregate([
// //       { $match: { userId: { $in: sellerIds }, sold: true } },
// //       { $group: { _id: "$userId", totalSold: { $sum: 1 } } },
// //     ]);

// //     // 4) total earnings per seller (sum of sold prompt price)
// //     const earningsAgg = await Prompt.aggregate([
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

// //     const uploadedMap = new Map(uploadedAgg.map((e) => [String(e._id), e.totalUploaded]));
// //     const soldMap = new Map(soldAgg.map((e) => [String(e._id), e.totalSold]));
// //     const earningsMap = new Map(earningsAgg.map((e) => [String(e._id), e.total]));

// //     // 5) response mapping
// //     const mapped = sellers.map((s) => ({
// //       _id: String(s._id),
// //       name: s.name || "Unknown",
// //       email: s.email || null,
// //       avatar: s.avatarUrl || null,
// //       verified: !!s.isVerified,
// //       joined: s.createdAt || null,

// //       // ✅ status fallback
// //       status: s.sellerStatus || s.status || "ACTIVE",

// //       rating: s.sellerRating || 0,
// //       reviewsCount: s.sellerReviewsCount || 0,
// //       location: s.location || null,

// //       // ✅ NEW IMPORTANT FIELDS
// //       totalUploadedPrompts: uploadedMap.get(String(s._id)) || 0,
// //       totalSoldPrompts: soldMap.get(String(s._id)) || 0,
// //       totalEarnings: earningsMap.get(String(s._id)) || 0,
// //     }));

// //     return res.json({
// //       success: true,
// //       sellers: mapped,
// //       pagination: {
// //         total,
// //         page,
// //         limit: limit === 0 ? total : limit,
// //         totalPages: limit === 0 ? 1 : Math.ceil(total / limit),
// //       },
// //     });
// //   } catch (err) {
// //     console.error("GET /api/seller error:", err);
// //     return res.status(500).json({ success: false, error: "Server error" });
// //   }
// // });
// // routes/sellerRoutes.js





// const express = require("express");
// const mongoose = require("mongoose");
// const router = express.Router();

// const User = require("../models/User");
// const Prompt = require("../models/Prompt");

// // ✅ Replace these with your actual middlewares if present
// const requireAuth = (req, res, next) => next();
// const requireAdmin = (req, res, next) => next();

// router.get("/", requireAuth, requireAdmin, async (req, res) => {
//   try {
//     const rawLimit = req.query.limit;
//     const page = Math.max(parseInt(req.query.page || "1", 10), 1);
//     const search = (req.query.search || "").toString().trim();

//     // ✅ if limit=0 => fetch all
//     const limit =
//       rawLimit === undefined ? 10 : Math.max(parseInt(rawLimit, 10), 0);

   
//     const showDeleted = req.query.deleted === "true";

    
//     const query = {
//       isDeleted: showDeleted ? true : { $ne: true },
//       ...(search ? {
//         $or: [
//           { name: { $regex: search, $options: "i" } },
//           { email: { $regex: search, $options: "i" } },
//         ],
//       } : {}),
//     };

//     let q = User.find(query)
//       .select(
//         "name email avatarUrl isVerified createdAt sellerStatus status location sellerRating sellerReviewsCount"
//       )
//       .sort({ createdAt: -1 })
//       .lean();

//     if (limit > 0) {
//       q = q.skip((page - 1) * limit).limit(limit);
//     }

//     const sellers = await q;
//     const total = await User.countDocuments(query);

//     // ✅ compute totalProducts per seller (uploaded prompts count)
//     const userIds = sellers.map((u) => u._id);

//     const countsAgg = await Prompt.aggregate([
//       { $match: { userId: { $in: userIds } } }, // all uploaded prompts
//       {
//         $group: {
//           _id: "$userId",
//           totalProducts: { $sum: 1 },
//           soldProducts: {
//             $sum: {
//               $cond: [{ $eq: ["$sold", true] }, 1, 0],
//             },
//           },
//         },
//       },
//     ]);

//     const countsMap = new Map(
//       countsAgg.map((x) => [
//         String(x._id),
//         { total: x.totalProducts || 0, sold: x.soldProducts || 0 },
//       ])
//     );

//     return res.json({
//       success: true,
//       sellers: sellers.map((s) => {
//         const c = countsMap.get(String(s._id)) || { total: 0, sold: 0 };

//         return {
//           _id: String(s._id),
//           name: s.name || "Unknown",
//           email: s.email || null,
//           avatar: s.avatarUrl || null,
//           verified: !!s.isVerified,
//           joined: s.createdAt || null,
//           status: s.sellerStatus || s.status || "ACTIVE",
//           rating: s.sellerRating || 0,
//           reviewsCount: s.sellerReviewsCount || 0,
//           location: s.location || null,

//           // ✅ NOW FRONTEND WILL GET THIS
//           totalProducts: c.total,     // uploaded prompts count
//           soldProducts: c.sold,       // sold prompts count (optional)
//         };
//       }),
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
//  * returns seller profile + KPIs + (optional counts)
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

//     // ✅ earnings
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

//     // ✅ uploaded count
//     const uploadedCount = await Prompt.countDocuments({
//       userId: new mongoose.Types.ObjectId(sellerId),
//     });

//     // ✅ sold count
//     const soldCount = await Prompt.countDocuments({
//       userId: new mongoose.Types.ObjectId(sellerId),
//       sold: true,
//     });

//     return res.json({
//       success: true,
//       seller: {
//         _id: String(seller._id),
//         name: seller.name || "Unknown",
//         email: seller.email || null,
//         location: seller.location || null,
//         joined: seller.createdAt || null,

//         status: seller.sellerStatus || seller.status || "ACTIVE",
//         avatar: seller.avatarUrl || null,
//         verified: !!seller.isVerified,

//         totalEarnings,
//         rating: seller.sellerRating || 0,
//         reviewsCount: seller.sellerReviewsCount || 0,
//         refundRate: seller.sellerRefundRate || 0,
//         refundThreshold: seller.sellerRefundThreshold || 5,

//         // ✅ extra
//         totalUploadedPrompts: uploadedCount,
//         totalSoldPrompts: soldCount,
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



// router.patch("/:sellerId/block", requireAuth, requireAdmin, async (req, res) => {
//   try {
//     const { sellerId } = req.params;
//     const { action } = req.body; // "block" | "unblock"

//     if (!mongoose.Types.ObjectId.isValid(sellerId)) {
//       return res.status(400).json({ success: false, error: "Invalid sellerId" });
//     }

//     if (!["block", "unblock"].includes(action)) {
//       return res.status(400).json({ success: false, error: "action must be 'block' or 'unblock'" });
//     }

//     const newStatus = action === "block" ? "SUSPENDED" : "ACTIVE";

//     const updated = await User.findByIdAndUpdate(
//       sellerId,
//       { sellerStatus: newStatus },
//       { new: true }
//     ).lean();

//     if (!updated) {
//       return res.status(404).json({ success: false, error: "Seller not found" });
//     }

//     return res.json({
//       success: true,
//       seller: {
//         _id: String(updated._id),
//         status: newStatus,
//       },
//     });
//   } catch (err) {
//     console.error("PATCH /api/seller/:sellerId/block error:", err);
//     return res.status(500).json({ success: false, error: "Server error" });
//   }
// });

// // ============================================
// // PATCH /api/seller/:sellerId/soft-delete
// // Soft delete ya restore karo seller ko
// // ============================================
// router.patch("/:sellerId/soft-delete", requireAuth, requireAdmin, async (req, res) => {
//   try {
//     const { sellerId } = req.params;
//     const { action } = req.body; // "delete" | "restore"

//     if (!mongoose.Types.ObjectId.isValid(sellerId)) {
//       return res.status(400).json({ success: false, error: "Invalid sellerId" });
//     }

//     if (!["delete", "restore"].includes(action)) {
//       return res.status(400).json({ success: false, error: "action must be 'delete' or 'restore'" });
//     }

//     const updateFields =
//       action === "delete"
//         ? { isDeleted: true, deletedAt: new Date(), sellerStatus: "SUSPENDED" }
//         : { isDeleted: false, deletedAt: null };

//     const updated = await User.findByIdAndUpdate(sellerId, updateFields, {
//       new: true,
//     }).lean();

//     if (!updated) {
//       return res.status(404).json({ success: false, error: "Seller not found" });
//     }

//     return res.json({
//       success: true,
//       seller: {
//         _id: String(updated._id),
//         isDeleted: updated.isDeleted,
//         status: updated.sellerStatus || "ACTIVE",
//       },
//     });
//   } catch (err) {
//     console.error("PATCH /api/seller/:sellerId/soft-delete error:", err);
//     return res.status(500).json({ success: false, error: "Server error" });
//   }
// });





// module.exports = router;


// routes/sellerRoutes.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const User = require("../models/User");
const Prompt = require("../models/Prompt");
const Purchase = require("../models/Purchase");
const HireDeal = require("../models/HireDeal");
const BankAccount = require("../models/BankAccount");
const Notification = require("../models/Notification");
const { notifyAdmins } = require("../utils/notifyAdmins");
const { requireAuth } = require("../utils/auth");

// When a seller gets suspended: auto-cancel their not-yet-paid hire deals
// (no money involved, safe to automate) and flag any funded/in-progress
// deals for an admin to manually review — a real Razorpay refund is a
// financial action best left to a human decision, not an automatic one.
async function cancelUnpaidDealsForSuspendedSeller(sellerId) {
  const unpaidDeals = await HireDeal.find({
    freelancerId: sellerId,
    status: { $in: ["PENDING_ACCEPTANCE", "ACCEPTED_WAITING_PAYMENT"] },
  });

  for (const deal of unpaidDeals) {
    deal.status = "CANCELLED";
    deal.cancelledAt = new Date();
    deal.cancelReason = "Seller account suspended by admin";
    await deal.save();
    await Notification.create({
      receiverUserId: deal.clientId,
      type: "HIRE_DEAL_CANCELLED_SUSPENSION",
      hireDealId: deal._id,
      message: "A hire deal was cancelled because the seller's account was suspended.",
      meta: { dealId: deal._id, reason: "seller_suspended" },
    });
  }

  const fundedDeals = await HireDeal.find({
    freelancerId: sellerId,
    fundsStatus: "HELD_BY_TOKUN",
  }).select("_id clientId");

  if (fundedDeals.length) {
    await notifyAdmins({
      type: "ADMIN_REVIEW_NEEDED",
      message: `${fundedDeals.length} funded hire deal(s) need manual refund review — seller was just suspended.`,
      meta: { sellerId, dealIds: fundedDeals.map((d) => String(d._id)) },
    });
  }

  return { cancelledCount: unpaidDeals.length, fundedNeedingReviewCount: fundedDeals.length };
}

function requireAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ success: false, error: "forbidden" });
  }
  next();
}

/**
 * GET /api/seller?limit=4&page=1&search=
 * Seller list + uploaded count + sold count + earning + buy count
 *
 * Deliberately public (no requireAuth/requireAdmin) — this is also the
 * directory the public "Find Creators" page (frontend/src/pages/
 * FindCreatorsPage.tsx) fetches for logged-out visitors. The `?deleted=true`
 * admin-only view is gated separately below via requireAdmin on that param.
 */
router.get("/", async (req, res) => {
  try {
    const rawLimit = req.query.limit;
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const search = (req.query.search || "").toString().trim();
    const showDeleted = req.query.deleted === "true";

    if (showDeleted && !req.isAdmin) {
      return res.status(403).json({ success: false, error: "forbidden" });
    }

    const limit =
      rawLimit === undefined ? 10 : Math.max(parseInt(rawLimit, 10), 0);

    // A "seller" is a user who has actually uploaded at least one (non-deleted)
    // prompt — without this, every registered user (buyers included) showed up
    // here labeled as a seller.
    const sellerIds = await Prompt.find({ deleted: { $ne: true } }).distinct("userId");

    const query = {
      _id: { $in: sellerIds },
      isDeleted: showDeleted ? true : { $ne: true },
      // Suspended sellers shouldn't be publicly discoverable/hireable either —
      // same intent as hiding their listings from the marketplace feed.
      ...(showDeleted ? {} : { sellerStatus: { $ne: "SUSPENDED" } }),
      ...(search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
    };

    let q = User.find(query)
      .select(
        "name email avatarUrl isVerified createdAt sellerStatus status location sellerRating sellerReviewsCount isDeleted deletedAt plan userType orgId"
      )
      .sort({ createdAt: -1 })
      .lean();

    if (limit > 0) {
      q = q.skip((page - 1) * limit).limit(limit);
    }

    // Independent of each other — the count doesn't need the page's rows.
    const [sellers, total] = await Promise.all([q, User.countDocuments(query)]);

    const userIds = sellers.map((u) => u._id);

    if (!userIds.length) {
      return res.json({
        success: true,
        sellers: [],
        pagination: {
          total,
          page,
          limit: limit === 0 ? total : limit,
          totalPages: limit === 0 ? 1 : Math.ceil(total / limit),
        },
      });
    }

    /**
     * ✅ 1) Sell/upload count = Prompt.userId count
     */
    const uploadedAggP = Prompt.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          deleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: "$userId",
          totalProducts: { $sum: 1 },
        },
      },
    ]);

    /**
     * ✅ 2) Seller sold count + earning = Purchase -> Prompt owner
     * Do NOT use Prompt.sold because sold=true only works for exclusive prompts.
     */
    const salesAggP = Purchase.aggregate([
      {
        $match: {
          paymentStatus: { $ne: "FAILED" },
        },
      },
      {
        $lookup: {
          from: "prompts",
          localField: "prompt",
          foreignField: "_id",
          as: "promptDoc",
        },
      },
      {
        $unwind: {
          path: "$promptDoc",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          "promptDoc.userId": { $in: userIds },
        },
      },
      {
        $group: {
          _id: "$promptDoc.userId",
          soldProducts: { $sum: 1 },
          totalEarnings: {
            $sum: {
              $ifNull: [
                "$promptSnapshot.originalPrice",
                {
                  $ifNull: ["$promptDoc.price", "$pricePaid"],
                },
              ],
            },
          },
        },
      },
    ]);

    /**
     * ✅ 3) Buy count = Purchase.buyer count
     */
    const buyAggP = Purchase.aggregate([
      {
        $match: {
          buyer: { $in: userIds },
          paymentStatus: { $ne: "FAILED" },
        },
      },
      {
        $group: {
          _id: "$buyer",
          buyProducts: { $sum: 1 },
          totalSpent: { $sum: { $ifNull: ["$pricePaid", 0] } },
        },
      },
    ]);

    // Whether each seller has an ACTIVATED Razorpay linked account — used by
    // the admin dashboard's "Pending Approval" seller count (a seller who's
    // uploaded prompts but hasn't finished payout verification yet).
    const bankAccountsP = BankAccount.find({ userId: { $in: userIds } })
      .select("userId activationStatus")
      .lean();

    /* These four don't depend on each other, so they run together. They were
       four sequential awaits, which cost four round trips to Atlas on a page
       that is otherwise just waiting — and this endpoint has no pagination
       when limit=0, so each one is a full pass.

       This await has to stay ABOVE the maps below: they read uploadedAgg /
       salesAgg / buyAgg, and while it sat underneath them every single call to
       this endpoint died in the temporal dead zone with "Cannot access
       'uploadedAgg' before initialization" — a 500 that emptied the prompt-seller
       half of the Find Creators directory for everyone. */
    const [uploadedAgg, salesAgg, buyAgg, bankAccounts] = await Promise.all([
      uploadedAggP,
      salesAggP,
      buyAggP,
      bankAccountsP,
    ]);

    const uploadedMap = new Map(
      uploadedAgg.map((x) => [String(x._id), Number(x.totalProducts || 0)])
    );

    const salesMap = new Map(
      salesAgg.map((x) => [
        String(x._id),
        {
          soldProducts: Number(x.soldProducts || 0),
          totalEarnings: Number(x.totalEarnings || 0),
        },
      ])
    );

    const buyMap = new Map(
      buyAgg.map((x) => [
        String(x._id),
        {
          buyProducts: Number(x.buyProducts || 0),
          totalSpent: Number(x.totalSpent || 0),
        },
      ])
    );

    const activatedSellerIds = new Set(
      bankAccounts.filter((b) => b.activationStatus === "ACTIVATED").map((b) => String(b.userId))
    );

    const mapped = sellers.map((s) => {
      const id = String(s._id);
      const sales = salesMap.get(id) || {
        soldProducts: 0,
        totalEarnings: 0,
      };
      const buys = buyMap.get(id) || {
        buyProducts: 0,
        totalSpent: 0,
      };

      return {
        _id: id,
        name: s.name || "Unknown",
        email: s.email || null,
        avatar: s.avatarUrl || null,
        verified: !!s.isVerified,
        joined: s.createdAt || null,
        status: s.sellerStatus || s.status || "ACTIVE",
        rating: s.sellerRating || 0,
        reviewsCount: s.sellerReviewsCount || 0,
        location: s.location || null,
        isDeleted: !!s.isDeleted,
        deletedAt: s.deletedAt || null,

        // For the "Plan" column — userType lets the UI show Enterprise for
        // org owners/team members (whose `plan` field is null).
        plan: s.plan ?? null,
        userType: s.userType || "IND",

        // Pending approval = seller has uploaded prompts but hasn't finished
        // Razorpay payout verification yet.
        linkedAccountActivated: activatedSellerIds.has(id),

        // ✅ Seller/upload stats
        totalProducts: uploadedMap.get(id) || 0,
        totalUploadedPrompts: uploadedMap.get(id) || 0,

        // ✅ Seller sales stats
        soldProducts: sales.soldProducts,
        totalSoldPrompts: sales.soldProducts,
        totalEarnings: sales.totalEarnings,
        volume: sales.totalEarnings,

        // ✅ Buyer stats
        buyProducts: buys.buyProducts,
        totalSpent: buys.totalSpent,
      };
    });

    return res.json({
      success: true,
      sellers: mapped,
      pagination: {
        total,
        page,
        limit: limit === 0 ? total : limit,
        totalPages: limit === 0 ? 1 : Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("GET /api/seller error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message,
    });
  }
});

/**
 * ✅ GET /api/seller/:sellerId
 * Seller profile + uploaded count + sold count + earning
 */
router.get("/:sellerId", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid sellerId",
      });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    const seller = await User.findById(sellerObjectId).lean();

    if (!seller) {
      return res.status(404).json({
        success: false,
        error: "Seller not found",
      });
    }

    /**
     * ✅ Uploaded count
     */
    const uploadedCount = await Prompt.countDocuments({
      userId: sellerObjectId,
      deleted: { $ne: true },
    });

    /**
     * ✅ Sold count + earning from Purchase collection
     */
    const salesAgg = await Purchase.aggregate([
      {
        $match: {
          paymentStatus: { $ne: "FAILED" },
        },
      },
      {
        $lookup: {
          from: "prompts",
          localField: "prompt",
          foreignField: "_id",
          as: "promptDoc",
        },
      },
      {
        $unwind: {
          path: "$promptDoc",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          "promptDoc.userId": sellerObjectId,
        },
      },
      {
        $group: {
          _id: "$promptDoc.userId",
          soldProducts: { $sum: 1 },
          totalEarnings: {
            $sum: {
              $ifNull: [
                "$promptSnapshot.originalPrice",
                {
                  $ifNull: ["$promptDoc.price", "$pricePaid"],
                },
              ],
            },
          },
        },
      },
    ]);

    const sales = salesAgg[0] || {
      soldProducts: 0,
      totalEarnings: 0,
    };

    /**
     * ✅ Buyer count for this user
     */
    const buyAgg = await Purchase.aggregate([
      {
        $match: {
          buyer: sellerObjectId,
          paymentStatus: { $ne: "FAILED" },
        },
      },
      {
        $group: {
          _id: "$buyer",
          buyProducts: { $sum: 1 },
          totalSpent: { $sum: { $ifNull: ["$pricePaid", 0] } },
        },
      },
    ]);

    const buys = buyAgg[0] || {
      buyProducts: 0,
      totalSpent: 0,
    };

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
        rating: seller.sellerRating || 0,
        reviewsCount: seller.sellerReviewsCount || 0,
        refundRate: seller.sellerRefundRate || 0,
        refundThreshold: seller.sellerRefundThreshold || 5,
        isDeleted: !!seller.isDeleted,

        // For the "Plan" indicator on the profile.
        plan: seller.plan ?? null,
        userType: seller.userType || "IND",

        // ✅ Uploaded/sell stats
        totalProducts: uploadedCount,
        totalUploadedPrompts: uploadedCount,

        // ✅ Sold/earning stats from Purchase
        soldProducts: Number(sales.soldProducts || 0),
        totalSoldPrompts: Number(sales.soldProducts || 0),
        totalEarnings: Number(sales.totalEarnings || 0),
        volume: Number(sales.totalEarnings || 0),

        // ✅ Buyer stats
        buyProducts: Number(buys.buyProducts || 0),
        totalSpent: Number(buys.totalSpent || 0),
      },
    });
  } catch (err) {
    console.error("GET /api/seller/:sellerId error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message,
    });
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
      return res.status(400).json({
        success: false,
        error: "Invalid sellerId",
      });
    }

    if (!["ACTIVE", "SUSPENDED"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
      });
    }

    const updated = await User.findByIdAndUpdate(
      sellerId,
      { sellerStatus: status },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Seller not found",
      });
    }

    await Notification.create({
      receiverUserId: updated._id,
      type: status === "SUSPENDED" ? "SELLER_SUSPENDED" : "SELLER_UNSUSPENDED",
      message:
        status === "SUSPENDED"
          ? "Your account has been suspended by an admin. You've been logged out and can no longer sell on the platform."
          : "Your account has been reactivated. You can sell on the platform again.",
      meta: { adminAction: status === "SUSPENDED" ? "suspended" : "unsuspended" },
    });

    let cascade = null;
    if (status === "SUSPENDED") {
      cascade = await cancelUnpaidDealsForSuspendedSeller(sellerId);
    }

    return res.json({
      success: true,
      seller: {
        _id: String(updated._id),
        status: updated.sellerStatus,
      },
      cascade,
    });
  } catch (err) {
    console.error("PATCH /api/seller/:sellerId/status error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message,
    });
  }
});

/**
 * ✅ PATCH /api/seller/:sellerId/block
 */
router.patch("/:sellerId/block", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { action } = req.body; // "block" | "unblock"

    /* The account holder is told *why* they lost access, so the reason is part
       of the request, not an admin-only audit note. Blocking without one used
       to leave the user with a dead account and a generic message. */
    const reason = String(req.body.reason || "").trim();

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid sellerId",
      });
    }

    if (!["block", "unblock"].includes(action)) {
      return res.status(400).json({
        success: false,
        error: "action must be 'block' or 'unblock'",
      });
    }

    if (action === "block" && reason.length < 5) {
      return res.status(400).json({
        success: false,
        error: "A reason of at least 5 characters is required to suspend an account",
      });
    }

    const newStatus = action === "block" ? "SUSPENDED" : "ACTIVE";

    const updated = await User.findByIdAndUpdate(
      sellerId,
      { sellerStatus: newStatus },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Seller not found",
      });
    }

    /* Suspension does NOT sign anyone out — see the login route, which lets a
       suspended account in on purpose. Only transacting is blocked
       (blockIfSuspended). So the message says exactly what stopped, what still
       works, and points at the support chat: an appeal is the whole reason the
       account keeps its session. `actionUrl` is what the notification UI turns
       into a button. */
    await Notification.create({
      receiverUserId: updated._id,
      type: newStatus === "SUSPENDED" ? "SELLER_SUSPENDED" : "SELLER_UNSUSPENDED",
      message:
        newStatus === "SUSPENDED"
          ? `Your account has been suspended by an admin. Reason: ${reason} — buying, selling, services, hire deals and withdrawals are paused. You are still signed in and can view your account. If you think this is a mistake, message the admin team directly and ask.`
          : reason
          ? `Your account has been reactivated. Note from the admin: ${reason}`
          : "Your account has been reactivated. You can buy, sell, and withdraw again.",
      meta: {
        adminAction: action,
        reason,
        ...(newStatus === "SUSPENDED"
          ? { actionUrl: "/support/admin-chat", actionLabel: "Message the admin team" }
          : {}),
      },
    });

    let cascade = null;
    if (newStatus === "SUSPENDED") {
      cascade = await cancelUnpaidDealsForSuspendedSeller(sellerId);
    }

    return res.json({
      success: true,
      seller: {
        _id: String(updated._id),
        status: newStatus,
      },
      cascade,
    });
  } catch (err) {
    console.error("PATCH /api/seller/:sellerId/block error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message,
    });
  }
});

/* PATCH /api/seller/:sellerId/soft-delete was here.

   Removed with the admin-facing delete action. It set isDeleted + SUSPENDED on
   an account, which is a harsher version of a suspension with no path back for
   the account holder: a deleted user can't sign in, so they can't reach the
   support chat to ask why. Suspension covers every case an admin actually
   needs — it stops all transacting and the person can still log in and appeal.

   `isDeleted` itself is untouched: it's still set by a user deleting their own
   account, and still honoured by the login gate and blockIfSuspended. */

module.exports = router;

