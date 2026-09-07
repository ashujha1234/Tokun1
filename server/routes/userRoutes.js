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

const sharp = require("sharp");

const User = require("../models/User");
const { requireAuth } = require("../utils/auth");
const uploadToAzure = require("../utils/uploadToAzure");

/* ================= STORAGE =================
   Memory storage — the file buffer goes straight to Azure Blob Storage
   (uploads/profile local-disk storage doesn't survive a redeploy/restart,
   same reasoning as services/prompts already using uploadToAzure). */
/* This filter is why nobody on the platform had a profile picture.
   Two faults, and it needed both to be this bad:

   1. It required the EXTENSION to match /jpeg|jpg|png|webp/. A photo picked on
      an iPhone or from macOS Photos is a .HEIC, so it was refused at the door —
      the single most likely file a person tries to upload.

   2. It rejected with a plain `new Error(...)`. index.js branches on
      `err instanceof multer.MulterError`, so a look-alike falls through to the
      500 branch: the caller got `{"error":"server_error"}` with no hint that
      the file type was the problem. The frontend then swallowed that (its catch
      only console.error'd, and console is stripped from production builds), so
      the whole thing was: pick a photo, nothing happens, no error, forever.

   Now: mimetype prefix only, as a cheap early reject at the stream boundary.
   The REAL gate is decoding the bytes with sharp in the handler — an extension
   and a client-declared mimetype are both trivially wrong or spoofed. */
const fileFilter = (_req, file, cb) => {
  if (String(file.mimetype || "").toLowerCase().startsWith("image/")) return cb(null, true);

  // A real MulterError, so index.js answers 400 with this message instead of 500.
  const err = new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname);
  err.message = "That file isn't an image. Please choose a photo.";
  return cb(err);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
});

/* Avatars render at 96px in the profile hero and 32px in the header, so the
   stored file only has to survive a retina 2x of the largest use plus the
   full-size photo dialog. 512 is generous for that and turns a 12 MB iPhone
   photo into ~40 kB — the picture loads instantly and the blob costs nothing.
   `withoutEnlargement` so a small upload is never upscaled into blur. */
const AVATAR_MAX_PX = 512;

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

      /* Decode, then re-encode to WebP. Both halves matter:

         Decoding is the real file-type check — the filter above only saw a
         client-declared mimetype. sharp throws on anything that isn't an
         image it can parse, and that throw is what makes the check honest.

         Re-encoding is what makes an iPhone upload usable at all. HEIC is
         accepted now, but Chrome and Firefox cannot RENDER it — stored as-is
         it would be a broken <img> for most of the internet while looking
         fine in Safari. WebP renders everywhere and is what the rest of the
         app already serves.

         Rotation: `.rotate()` with no argument applies the EXIF orientation
         and then drops the tag. Without it a photo taken in portrait on a
         phone is stored 90° off, because the pixels are landscape and only the
         EXIF flag said otherwise — and stripping metadata (which re-encoding
         does) would throw that flag away. It also drops GPS coordinates, which
         a phone photo carries and a public avatar should not. */
      let webp;
      try {
        webp = await sharp(req.file.buffer)
          .rotate()
          .resize(AVATAR_MAX_PX, AVATAR_MAX_PX, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
      } catch {
        return res.status(400).json({
          success: false,
          error: "image_unreadable",
          message: "That image couldn't be read. Try a JPG, PNG, WebP or HEIC photo.",
        });
      }

      /* Named .webp because that is what the bytes now are. uploadToAzure picks
         the Content-Type off the extension, and a mislabelled blob is served as
         application/octet-stream — which the browser downloads instead of
         rendering, so the <img> would silently show nothing. */
      const azureUrl = await uploadToAzure(webp, "avatar.webp", "avatars");

      // NOTE: the schema field is `avatarUrl` (not `avatar`) — writing to
      // `user.avatar` here was a silent no-op under Mongoose's strict mode,
      // which is why uploads never actually persisted past the current
      // session. Keep the JSON response key as `avatar` so existing
      // frontend callers don't need to change.
      user.avatarUrl = azureUrl;
      await user.save();

      return res.json({
        success: true,
        avatar: user.avatarUrl,
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
