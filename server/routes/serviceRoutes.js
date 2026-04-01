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
const Service = require("../models/Service");
const upload = require("../utils/serviceUpload");
const { requireAuth } = require("../utils/auth");
const uploadToAzure = require("../utils/uploadToAzure");
const router = express.Router();

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

module.exports = router;
