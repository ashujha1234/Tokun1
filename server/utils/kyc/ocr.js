const Tesseract = require("tesseract.js");

async function ocrImage(filePath) {
  const out = await Tesseract.recognize(filePath, "eng+hin", {
    logger: () => {}, // mute
  });
  return (out?.data?.text || "").trim();
}

module.exports = { ocrImage };
