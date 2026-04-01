const multer = require("multer");
const path = require("path");

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf|mp4/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());

  if (ext) cb(null, true);
  else cb(new Error("Invalid file type"));
};

module.exports = multer({
  storage: multer.memoryStorage(), // ✅ IMPORTANT
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});
