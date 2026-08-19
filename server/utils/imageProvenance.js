const sharp = require("sharp");
const { createWorker } = require("tesseract.js");

/**
 * "Is this image really theirs?" — the two checks an upload has to pass beyond
 * the exact-bytes duplicate test.
 *
 * THE HOLE THIS CLOSES
 * Uploads were de-duplicated by SHA-256 of the file. That only ever catches the
 * same FILE: screenshot a listing off the marketplace and the bytes are new —
 * different dimensions, re-encoded by the OS, a different container — so the
 * hash misses completely and the copy goes up as an original. The visible
 * "Tokun.world" watermark we burn into every image was doing nothing to stop it;
 * it was a label, not a check, and nothing ever read it back.
 *
 * TWO CHECKS, BECAUSE THEY COVER EACH OTHER'S GAPS
 *
 *  1. PERCEPTUAL HASH — what the image LOOKS like, not what it is made of.
 *     Survives re-encoding, rescaling, screenshot compression and small crops,
 *     so a screenshot lands within a few bits of the original it was taken from.
 *     Precise (it names the listing that was copied) and cheap. Its gap: it can
 *     only match listings whose own hash we already stored, so it is blind to
 *     everything uploaded before this shipped.
 *
 *  2. WATERMARK DETECTION — OCR looking for our own mark in the picture.
 *     Every marketplace image has "Tokun.world" composited into it, so finding
 *     that text in something being uploaded means it came off our own site,
 *     whoever listed it and whenever. That is exactly the case (1) is blind to.
 *     Its gap: OCR is fuzzy and a hard crop can cut the mark away — which is
 *     what (1) is for.
 *
 * Both are for IMAGES. A video attachment gets neither: sharp can't read one,
 * and prompt videos never had the visible watermark composited in to begin with.
 */

/* ── Perceptual hash (pHash, 64-bit, DCT-based) ──────────────────────────────
   The classic construction: greyscale → 32×32 → 2-D DCT → keep the top-left 8×8
   block of low-frequency coefficients → one bit per coefficient against their
   median. Low frequencies are the broad structure of the picture, which is what
   a re-encode leaves alone; the detail a JPEG pass mangles lives in the high
   frequencies that get thrown away here. */

const SIZE = 32;
const BLOCK = 8;

// cos[(2x+1)·u·π / 2N], precomputed once — the inner loop runs 32×32×32×2 times
// per image and this is the only expensive term in it.
const COS = (() => {
  const table = new Float64Array(SIZE * SIZE);
  for (let u = 0; u < SIZE; u++) {
    for (let x = 0; x < SIZE; x++) {
      table[u * SIZE + x] = Math.cos(((2 * x + 1) * u * Math.PI) / (2 * SIZE));
    }
  }
  return table;
})();

/* Separable 2-D DCT-II: rows, then columns. The usual orthonormal scaling
   factors are left out on purpose — every bit below is a comparison against the
   median of these same coefficients, and a constant factor cancels out of both
   sides of that. */
function dct2d(pixels) {
  const rows = new Float64Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let u = 0; u < SIZE; u++) {
      let sum = 0;
      for (let x = 0; x < SIZE; x++) sum += pixels[y * SIZE + x] * COS[u * SIZE + x];
      rows[y * SIZE + u] = sum;
    }
  }

  const out = new Float64Array(SIZE * SIZE);
  for (let u = 0; u < SIZE; u++) {
    for (let v = 0; v < SIZE; v++) {
      let sum = 0;
      for (let y = 0; y < SIZE; y++) sum += rows[y * SIZE + u] * COS[v * SIZE + y];
      out[v * SIZE + u] = sum;
    }
  }
  return out;
}

/**
 * 64-bit perceptual hash of an image, as 16 hex characters.
 *
 * Returns null for anything that isn't a readable image (a video buffer, a
 * corrupt file) — callers treat null as "no opinion", never as "clean".
 */
async function perceptualHash(buffer) {
  try {
    /* .rotate() applies the EXIF orientation before anything else: a phone
       screenshot that carries one would otherwise hash as a rotated picture and
       match nothing. fit "fill" ignores aspect ratio deliberately — the hash has
       to be comparable across a wide crop and a tall one of the same image. */
    const { data, info } = await sharp(buffer)
      .rotate()
      .greyscale()
      .resize(SIZE, SIZE, { fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Greyscale usually gives 1 channel, but an image with alpha comes back
    // with 2 — step by the real channel count and read only the grey plane.
    const step = info.channels || 1;
    const pixels = new Float64Array(SIZE * SIZE);
    for (let i = 0; i < SIZE * SIZE; i++) pixels[i] = data[i * step];

    const freq = dct2d(pixels);

    const block = [];
    for (let v = 0; v < BLOCK; v++) {
      for (let u = 0; u < BLOCK; u++) block.push(freq[v * SIZE + u]);
    }

    /* Median of the AC coefficients only. [0][0] is the DC term — the average
       brightness of the whole image — and it dwarfs the other 63, so including
       it would drag the median up and flatten most of the bits to zero. */
    const ac = block.slice(1).sort((a, b) => a - b);
    const median = ac[Math.floor(ac.length / 2)];

    let hex = "";
    for (let i = 0; i < block.length; i += 4) {
      let nibble = 0;
      for (let j = 0; j < 4; j++) nibble = (nibble << 1) | (block[i + j] > median ? 1 : 0);
      hex += nibble.toString(16);
    }
    return hex;
  } catch (err) {
    console.error("perceptualHash failed:", err.message);
    return null;
  }
}

/** Bits that differ between two hex hashes. Infinity when either is missing. */
function hammingDistance(a, b) {
  if (!a || !b || a.length !== b.length) return Infinity;
  let distance = 0;
  for (let i = 0; i < a.length; i++) {
    let diff = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (diff) {
      distance += diff & 1;
      diff >>= 1;
    }
  }
  return distance;
}

/**
 * How many of the 64 bits may differ before two images count as the same one.
 *
 * Measured, not guessed — see scripts/checkPerceptualHash.js. A screenshot of a
 * watermarked listing (rescaled, JPEG re-encoded) lands at 0-6 bits from its
 * original; unrelated pictures sit well above 20. 10 leaves room for a rough
 * screenshot without reaching anything genuinely different.
 */
const DUPLICATE_DISTANCE = 10;

const looksLikeDuplicate = (a, b) => hammingDistance(a, b) <= DUPLICATE_DISTANCE;

/* ── Watermark detection ─────────────────────────────────────────────────────
   OCR over the whole picture, not just the corner the mark is composited into.
   The mark sits at a known place in OUR file, but a screenshot is whatever the
   person framed — the listing card with page around it, a crop, a photo of a
   screen — so "bottom strip" would only hold for a screenshot taken exactly one
   way. */

// One worker for the process, started on first use. Spinning one up per upload
// costs a second or two of pure setup — the KYC OCR does the same, for the same
// reason (see utils/kyc/ocrFrontNameRegion.js).
let workerPromise;
function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("eng").catch((err) => {
      // Cleared so a transient startup failure doesn't disable OCR for the
      // lifetime of the process.
      workerPromise = null;
      throw err;
    });
  }
  return workerPromise;
}

/* Deliberately loose, because the mark is white text at 45% opacity over
   whatever the picture happens to be — OCR reads it as "tokun", "t0kun" or
   "tokunworld" depending on the background it lands on. All the text is stripped
   to lowercase letters and digits first, so spacing and punctuation can't matter.
   "tokun" is not a word that turns up in an unrelated image by accident. */
const WATERMARK_RE = /t[o0]kun/;

/** Recognition is capped: past this the answer isn't worth the seller's wait. */
const OCR_TIMEOUT_MS = 20000;

/**
 * True when our own watermark is visible in the image.
 *
 * FAILS OPEN. OCR that errors or runs long returns false — "we couldn't tell",
 * never "it's clean". Blocking a legitimate upload because Tesseract was slow
 * would be a worse bug than the one this exists to catch, and the perceptual
 * hash is still standing behind it.
 */
async function hasTokunWatermark(buffer) {
  try {
    /* Small, flat text is what this has to read, so the image is pushed up to a
       width Tesseract can work with and the contrast stretched — the mark is
       semi-transparent white and on a light background it is nearly invisible
       until it's normalised. */
    const prepared = await sharp(buffer)
      .rotate()
      .greyscale()
      .resize({ width: 1400, withoutEnlargement: false, fit: "inside" })
      .normalise()
      .toBuffer();

    const worker = await getWorker();

    const recognition = worker.recognize(prepared);
    const timeout = new Promise((resolve) =>
      setTimeout(() => resolve(null), OCR_TIMEOUT_MS)
    );
    const result = await Promise.race([recognition, timeout]);
    if (!result) {
      console.warn("Watermark OCR timed out — upload allowed through");
      return false;
    }

    const text = String(result.data?.text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    return WATERMARK_RE.test(text);
  } catch (err) {
    console.error("Watermark OCR failed (upload allowed through):", err.message);
    return false;
  }
}

module.exports = {
  perceptualHash,
  hammingDistance,
  looksLikeDuplicate,
  hasTokunWatermark,
  DUPLICATE_DISTANCE,
};
