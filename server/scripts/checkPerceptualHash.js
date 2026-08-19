/**
 * Measures the perceptual-hash thresholds in utils/imageProvenance.js.
 *
 * Run it after touching the hash: `node scripts/checkPerceptualHash.js`.
 *
 * It builds a few images with sharp, puts each through what a screenshot
 * actually does to a picture — the Tokun watermark composited in, a rescale, a
 * lossy JPEG pass — and prints the bit distance between original and copy, then
 * between unrelated images. The gap between those two numbers is the whole
 * reason a threshold can exist at all; if it ever closes, the threshold in
 * imageProvenance.js is wrong.
 */

const sharp = require("sharp");
const { perceptualHash, hammingDistance, DUPLICATE_DISTANCE } = require("../utils/imageProvenance");

/* Not noise: a hash is only meaningful on an image with structure, and random
   pixels have no low-frequency content for the DCT to hold on to. These are
   crude but they have shapes, edges and gradients — like the artwork actually
   being listed. */
const scene = async (seed) => {
  const w = 900;
  const h = 600;
  const shapes = Array.from({ length: 9 }, (_, i) => {
    const x = ((seed * 137 + i * 91) % 800) + 20;
    const y = ((seed * 71 + i * 53) % 500) + 20;
    const r = 30 + ((seed * 13 + i * 29) % 70);
    const hue = (seed * 47 + i * 40) % 360;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="hsl(${hue},70%,${35 + (i % 4) * 12}%)"/>`;
  }).join("");

  return sharp(
    Buffer.from(
      `<svg width="${w}" height="${h}">
         <rect width="${w}" height="${h}" fill="hsl(${(seed * 97) % 360},45%,18%)"/>
         ${shapes}
         <rect x="60" y="${380 + (seed % 60)}" width="700" height="120" fill="rgba(255,255,255,0.14)"/>
       </svg>`
    )
  )
    .png()
    .toBuffer();
};

/** The marketplace watermark, same construction as routes/promptRoutes.js. */
const watermark = async (buffer) => {
  const meta = await sharp(buffer).metadata();
  const w = meta.width || 800;
  const fontSize = Math.max(20, Math.floor(w / 18));
  const wm = Buffer.from(
    `<svg width="${w}" height="${fontSize + 20}">
       <text x="12" y="${fontSize}" font-size="${fontSize}" fill="rgba(255,255,255,0.45)"
             font-family="Arial" font-weight="bold">Tokun.world</text>
     </svg>`
  );
  return sharp(buffer).composite([{ input: wm, gravity: "southeast" }]).toBuffer();
};

/** What a screenshot does to a picture: rescaled by the display, re-encoded. */
const screenshotOf = async (buffer, { width, quality }) =>
  sharp(buffer).resize({ width }).jpeg({ quality }).toBuffer();

(async () => {
  const originals = await Promise.all([1, 2, 3, 4].map(scene));
  const hashes = await Promise.all(originals.map(perceptualHash));

  console.log("=== a screenshot vs the listing it was taken from ===");
  let worstCopy = 0;
  for (const [i, original] of originals.entries()) {
    const shown = await watermark(original);
    for (const variant of [
      { label: "full size, high quality ", width: 900, quality: 92 },
      { label: "half size, phone-ish    ", width: 450, quality: 75 },
      { label: "small, heavy compression", width: 320, quality: 45 },
      { label: "upscaled from a crop-ish", width: 1400, quality: 80 },
    ]) {
      const shot = await screenshotOf(shown, variant);
      const d = hammingDistance(hashes[i], await perceptualHash(shot));
      worstCopy = Math.max(worstCopy, d);
      console.log(`  image ${i + 1}  ${variant.label}  distance ${String(d).padStart(2)}`);
    }
  }

  console.log("\n=== unrelated images ===");
  let closestUnrelated = Infinity;
  for (let i = 0; i < hashes.length; i++) {
    for (let j = i + 1; j < hashes.length; j++) {
      const d = hammingDistance(hashes[i], hashes[j]);
      closestUnrelated = Math.min(closestUnrelated, d);
      console.log(`  image ${i + 1} vs image ${j + 1}                       distance ${String(d).padStart(2)}`);
    }
  }

  console.log(`\nworst copy distance      ${worstCopy}`);
  console.log(`closest unrelated pair   ${closestUnrelated}`);
  console.log(`threshold in use         ${DUPLICATE_DISTANCE}`);

  const ok = worstCopy <= DUPLICATE_DISTANCE && closestUnrelated > DUPLICATE_DISTANCE;
  console.log(ok ? "\nOK — threshold separates copies from originals." : "\nFAIL — threshold needs revisiting.");
  process.exit(ok ? 0 : 1);
})();
