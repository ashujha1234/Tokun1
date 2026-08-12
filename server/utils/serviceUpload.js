// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const mongoose = require("mongoose");
// const uploadToAzure = require("../utils/uploadToAzure");
// const uploadDir = path.join(__dirname, "../uploads/services");
// fs.mkdirSync(uploadDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: uploadDir,
//   filename: (_req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const fileFilter = (_req, file, cb) => {
//   const allowed = /jpeg|jpg|png|mp4/;
//   const ext = allowed.test(path.extname(file.originalname).toLowerCase());
//   if (ext) cb(null, true);
//   else cb(new Error("Invalid file type"));
// };

// module.exports = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 50 * 1024 * 1024 },
// });


const multer = require("multer");
const path = require("path");

/* The accepted set has to match what the picker offers. It was
   /jpeg|jpg|png|mp4/ while the form's input said accept="image/*,video/mp4" —
   so the browser happily offered a .webp or .gif screenshot and the server threw
   "Invalid file type" on submit, after the upload had already run.

   Extension AND mime are both checked: an extension is just a string, and some
   browsers send application/octet-stream for video. */
const ALLOWED_EXT = /\.(jpe?g|png|webp|gif|mp4|webm)$/i;
const ALLOWED_MIME = /^(image\/(jpeg|png|webp|gif)|video\/(mp4|webm))$/i;

const fileFilter = (_req, file, cb) => {
  const okExt = ALLOWED_EXT.test(file.originalname || "");
  const okMime = ALLOWED_MIME.test(file.mimetype || "");

  if (okExt && okMime) cb(null, true);
  else cb(new Error("Invalid file type"));
};

module.exports = multer({
  storage: multer.memoryStorage(), // ✅ IMPORTANT
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});
