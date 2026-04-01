const sharp = require("sharp");
const { createWorker } = require("tesseract.js");

let workerPromise;
async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const w = await createWorker("eng");
      await w.setParameters({
        tessedit_pageseg_mode: "6",
        preserve_interword_spaces: "1",
      });
      return w;
    })();
  }
  return workerPromise;
}

async function ocrFrontNameRegion(frontPath) {
  const img = sharp(frontPath).rotate();
  const meta = await img.metadata();

  const roi = {
    left: Math.round(meta.width * 0.33),
    top: Math.round(meta.height * 0.14),
    width: Math.round(meta.width * 0.64),
    height: Math.round(meta.height * 0.34),
  };

  const buf = await img
    .extract(roi)
    .resize({ width: 1400 })
    .grayscale()
    .normalise()
    .sharpen()
    .toBuffer();

  const worker = await getWorker();
  const { data } = await worker.recognize(buf);
  return data.text || "";
}

module.exports = { ocrFrontNameRegion };
