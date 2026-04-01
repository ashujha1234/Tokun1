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

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|mp4/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime =
    file.mimetype.startsWith("image/") ||
    file.mimetype === "video/mp4";

  if (ext && mime) cb(null, true);
  else cb(new Error("Invalid file type"));
};

module.exports = multer({
  storage: multer.memoryStorage(), // ✅ IMPORTANT
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});
