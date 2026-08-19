/**
 * End-to-end check of the screenshot-reupload block, against the real database.
 *
 *   node scripts/checkScreenshotUpload.js
 *
 * It writes one throwaway prompt row, screenshots its own image the way a copier
 * would (watermark composited in, rescaled, JPEG re-encoded), and runs that back
 * through the same lookup the upload route uses. Then it deletes the row.
 *
 * Read-only against everything else — it only ever removes the document it
 * created, by the _id it got back.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const sharp = require("sharp");
const Prompt = require("../models/Prompt");
const {
  perceptualHash,
  looksLikeDuplicate,
  hasTokunWatermark,
  hammingDistance,
} = require("../utils/imageProvenance");

const art = async () =>
  sharp(
    Buffer.from(
      `<svg width="1000" height="700">
         <rect width="1000" height="700" fill="#0d1b3a"/>
         <circle cx="320" cy="250" r="160" fill="#7c3aed"/>
         <circle cx="660" cy="400" r="190" fill="#1d4ed8"/>
         <rect x="120" y="520" width="700" height="90" fill="rgba(255,255,255,0.18)"/>
       </svg>`
    )
  )
    .png()
    .toBuffer();

/** The marketplace watermark, same construction as routes/promptRoutes.js. */
const watermark = async (buffer) => {
  const meta = await sharp(buffer).metadata();
  const w = meta.width;
  const fontSize = Math.max(20, Math.floor(w / 18));
  const wm = Buffer.from(
    `<svg width="${w}" height="${fontSize + 20}">
       <text x="12" y="${fontSize}" font-size="${fontSize}" fill="rgba(255,255,255,0.45)"
             font-family="Arial" font-weight="bold">Tokun.world</text>
     </svg>`
  );
  return sharp(buffer).composite([{ input: wm, gravity: "southeast" }]).toBuffer();
};

const findLookalike = async (phash, excludeId) => {
  const filter = { attachmentPhash: { $nin: ["", null] } };
  if (excludeId) filter._id = { $ne: excludeId };
  const listed = await Prompt.find(filter).select("_id title attachmentPhash").lean();
  return listed.find((p) => looksLikeDuplicate(phash, p.attachmentPhash)) || null;
};

let created = null;
let failures = 0;

const check = (label, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}  (got ${actual}, expected ${expected})`);
};

(async () => {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

  const original = await art();
  const originalPhash = await perceptualHash(original);

  created = await Prompt.create({
    userId: new mongoose.Types.ObjectId(),
    title: "[test] screenshot-block fixture",
    promptText: `fixture ${Date.now()}`,
    attachment: {
      filename: "fixture.png",
      path: "https://example.invalid/fixture.png",
      mimetype: "image/png",
      size: original.length,
      type: "image",
    },
    attachmentPhash: originalPhash,
  });
  console.log(`listed a fixture prompt (${created._id}) with phash ${originalPhash}\n`);

  // What the copier actually does: right-click / screenshot the displayed
  // (watermarked) image, then upload that file.
  const displayed = await watermark(original);
  const screenshot = await sharp(displayed).resize({ width: 640 }).jpeg({ quality: 72 }).toBuffer();
  const screenshotPhash = await perceptualHash(screenshot);

  console.log("the copy:");
  console.log(`  distance from the listed image: ${hammingDistance(originalPhash, screenshotPhash)} bits\n`);

  console.log("checks:");
  check("screenshot is recognised as an existing listing", !!(await findLookalike(screenshotPhash)), true);
  check("screenshot still shows the Tokun watermark", await hasTokunWatermark(screenshot), true);

  // A genuinely different image has to sail through both, or the fix is worse
  // than the bug.
  const other = await sharp(
    Buffer.from(
      `<svg width="900" height="600">
         <rect width="900" height="600" fill="#2f1b0d"/>
         <rect x="60" y="80" width="360" height="360" fill="#f59e0b"/>
         <circle cx="700" cy="420" r="120" fill="#10b981"/>
       </svg>`
    )
  )
    .png()
    .toBuffer();

  check("an unrelated image is not called a duplicate", !!(await findLookalike(await perceptualHash(other))), false);
  check("an unrelated image has no watermark", await hasTokunWatermark(other), false);

  // The seller's own resubmit of the same image must not be blocked by itself.
  check(
    "resubmitting the same listing's own image is allowed",
    !!(await findLookalike(originalPhash, created._id)),
    false
  );

  console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll checks passed.");
})()
  .catch((err) => {
    console.error("\nERROR:", err.message);
    failures++;
  })
  .finally(async () => {
    if (created) {
      await Prompt.deleteOne({ _id: created._id });
      console.log(`cleaned up fixture ${created._id}`);
    }
    await mongoose.disconnect();
    process.exit(failures ? 1 : 0);
  });
