// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");

// const User = require("../models/User");
// const { requireAuth } = require("../utils/auth");

// /* ================= STORAGE ================= */
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/profile");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

// /* ================= UPLOAD AVATAR ================= */
// router.post(
//   "/upload-avatar",
//   requireAuth,
//   upload.single("avatar"),
//   async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ success: false });
//       }

//       const user = await User.findById(req.user._id);
//       if (!user) {
//         return res.status(404).json({ success: false });
//       }

//       user.avatar = `/uploads/profile/${req.file.filename}`;
//       await user.save();

//       res.json({
//         success: true,
//         avatar: user.avatar,
//       });
//     } catch (err) {
//       console.error("Avatar upload error:", err);
//       res.status(500).json({ success: false });
//     }
//   }
// );

// module.exports = router;



// routes/user.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const User = require("../models/User");
const { requireAuth } = require("../utils/auth");

/* ================= STORAGE ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* ================= UPLOAD AVATAR ================= */
router.post(
  "/upload-avatar",
  requireAuth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      // 🔐 SECURITY: ensure logged-in user exists
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // ✅ ONLY update logged-in user's profile
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      user.avatar = `/uploads/profile/${req.file.filename}`;
      await user.save();

      return res.json({
        success: true,
        avatar: user.avatar,
        userId: user._id, // 🔥 send back owner id
      });
    } catch (err) {
      console.error("Avatar upload error:", err);
      return res.status(500).json({
        success: false,
        message: "Avatar upload failed",
      });
    }
  }
);


module.exports = router;
