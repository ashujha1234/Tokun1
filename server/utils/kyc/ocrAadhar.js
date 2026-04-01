// // ocrAadhaar.js
// const sharp = require("sharp");
// const { createWorker } = require("tesseract.js");
// const { matchScore } = require("./nameMatch");

// // -------------------- Worker (single instance) --------------------
// let workerPromise;
// let ocrQueue = Promise.resolve(); // serialize recognize calls (worker is single)

// async function getWorker() {
//   if (!workerPromise) {
//     workerPromise = (async () => {
//       const w = await createWorker();
//       await w.loadLanguage("eng");
//       await w.initialize("eng");

//       // base params (will override per-call if needed)
//       await w.setParameters({
//         preserve_interword_spaces: "1",
//         user_defined_dpi: "300",
//         tessedit_ocr_engine_mode: "1", // LSTM only
//       });

//       return w;
//     })();
//   }
//   return workerPromise;
// }

// function clamp(n, min, max) {
//   return Math.max(min, Math.min(max, n));
// }

// function cleanOcrName(s) {
//   return String(s || "")
//     .replace(/[^A-Za-z\s]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// function isPlausibleName(s) {
//   const name = cleanOcrName(s);
//   if (!name) return false;

//   // must be 2-4 words typically
//   const parts = name.split(" ").filter(Boolean);
//   if (parts.length < 2 || parts.length > 5) return false;

//   // reject very short words like "I", "Il", "rn"
//   const longWords = parts.filter((p) => p.length >= 2);
//   if (longWords.length < 2) return false;

//   // avoid garbage all-lowercase like "mls itmnela"
//   const hasUpper = /[A-Z]/.test(name);
//   if (!hasUpper) return false;

//   // reject known non-name words (just in case)
//   if (/government|india|aadhaar|unique|male|female|dob|birth/i.test(name)) return false;

//   return true;
// }

// async function recognizeBuffer(buf, params = {}) {
//   const worker = await getWorker();
//   // queue to avoid parallel recognize calls on single worker
//   return (ocrQueue = ocrQueue.then(async () => {
//     await worker.setParameters(params);
//     return worker.recognize(buf);
//   }));
// }

// // -------------------- Preprocess helpers --------------------
// async function preprocessForName(imgSharp) {
//   // Strong preprocessing for name-line OCR
//   return imgSharp
//     .resize({ width: 1800, withoutEnlargement: false })
//     .grayscale()
//     .normalise()
//     .sharpen()
//     .threshold(180) // binarize; tune 160-200 if needed
//     .toBuffer();
// }

// function buildRois(w, h) {
//   // Multiple ROIs because different scans have different framing
//   // These are tuned for typical Aadhaar front layout (photo left, name on right)
//   const roisFrac = [
//     // ROI #1: Name line only (most reliable)
//     { l: 0.30, t: 0.32, r: 0.94, b: 0.39 },

//     // ROI #2: Slightly bigger around name area (some scans shift)
//     { l: 0.28, t: 0.28, r: 0.95, b: 0.41 },

//     // ROI #3: Right block (name + dob) fallback
//     { l: 0.28, t: 0.24, r: 0.96, b: 0.46 },
//   ];

//   return roisFrac.map((f) => {
//     const left = clamp(Math.round(w * f.l), 0, w - 2);
//     const top = clamp(Math.round(h * f.t), 0, h - 2);
//     const right = clamp(Math.round(w * f.r), left + 2, w);
//     const bottom = clamp(Math.round(h * f.b), top + 2, h);

//     return {
//       left,
//       top,
//       width: right - left,
//       height: bottom - top,
//     };
//   });
// }

// // -------------------- Main: Aadhaar name OCR (ROI) --------------------
// async function ocrAadhaarName(frontPath, profileName = "") {
//   // 1) rotate + trim borders (helps a LOT when black padding exists)
//   // NOTE: trim() uses top-left pixel as background; works well for black borders
//   const base = sharp(frontPath).rotate();

//   // Try trimmed first; if trim fails (rare), fallback to base
//   let img = base;
//   try {
//     img = base.trim(20);
//   } catch (_) {
//     img = base;
//   }

//   const meta = await img.metadata();
//   if (!meta?.width || !meta?.height) return null;

//   const rois = buildRois(meta.width, meta.height);

//   const candidates = [];

//   for (const roi of rois) {
//     try {
//       const cropped = img.extract(roi);

//       const buf = await preprocessForName(cropped);

//       const { data } = await recognizeBuffer(buf, {
//         tessedit_pageseg_mode: "7", // SINGLE LINE
//         tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ",
//       });

//       const text = cleanOcrName(data?.text || "");
//       const confidence = typeof data?.confidence === "number" ? data.confidence : null;

//       if (isPlausibleName(text)) {
//         let ms = 0;
//         if (profileName) ms = matchScore(profileName, text);
//         candidates.push({ text, confidence, ms });
//       }
//     } catch (_) {
//       // ignore ROI errors and continue
//     }
//   }

//   if (!candidates.length) return null;

//   // Pick best candidate:
//   // If profileName exists => max matchScore
//   // else => max confidence then longest
//   candidates.sort((a, b) => {
//     if (profileName) return (b.ms ?? 0) - (a.ms ?? 0);
//     if ((b.confidence ?? -1) !== (a.confidence ?? -1)) return (b.confidence ?? -1) - (a.confidence ?? -1);
//     return (b.text?.length ?? 0) - (a.text?.length ?? 0);
//   });

//   return candidates[0].text;
// }

// // -------------------- General OCR (fallback) --------------------
// async function ocrImage(imagePath) {
//   const img = sharp(imagePath).rotate();
//   const buf = await img
//     .resize({ width: 2000, withoutEnlargement: false })
//     .grayscale()
//     .normalise()
//     .sharpen()
//     .toBuffer();

//   const { data } = await recognizeBuffer(buf, {
//     tessedit_pageseg_mode: "6",
//   });

//   return data?.text || "";
// }

// module.exports = {
//   ocrAadhaarName,
//   ocrImage,
//   cleanOcrName,
// };


// ocrAadhaar.js
const path = require("path");
const { createWorker } = require("tesseract.js");

const TESSDATA_PATH = path.join(__dirname, "tessdata"); // <-- folder containing eng.traineddata

let workerPromise;
let ocrQueue = Promise.resolve();

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const w = await createWorker({
        // this tells tesseract.js where to load eng.traineddata from
        langPath: TESSDATA_PATH,
      });

      await w.loadLanguage("eng");
      await w.initialize("eng");

      await w.setParameters({
        preserve_interword_spaces: "1",
        user_defined_dpi: "300",
        tessedit_ocr_engine_mode: "1", // LSTM
      });

      return w;
    })();
  }
  return workerPromise;
}

async function recognizeBuffer(buf, params = {}) {
  const worker = await getWorker();
  return (ocrQueue = ocrQueue.then(async () => {
    await worker.setParameters(params);
    return worker.recognize(buf);
  }));
}

module.exports = { recognizeBuffer };
