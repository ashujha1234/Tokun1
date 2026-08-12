// Watermarking for delivered images, until the booking is settled.
//
// The problem this closes: a client can preview a delivery before approving it,
// which they must be able to do — you can't fairly approve work you haven't
// seen. But for a designer or illustrator, *seeing* the image is most of the
// value. Nothing stopped a client previewing the final artwork, screenshotting
// it, and then requesting a cancellation.
//
// So while the money is still held, previewed images carry a Tokun watermark.
// The instant the escrow settles — approved, auto-released, or split — the
// original is served instead. Nothing is destroyed: the clean file is what was
// uploaded and is what the client gets. The watermark is applied on the way
// OUT, per request, not baked into storage.
//
// Only images. A PDF, zip or video is either not previewable in the browser
// anyway or would need a fundamentally different treatment; pretending to
// protect those would be worse than being clear that we don't.

const sharp = require("sharp");

const WATERMARKABLE = /\.(jpe?g|png|webp|gif|tiff|bmp)$/i;

/** Is this something we can meaningfully watermark? */
function isWatermarkableImage(name, mimeType) {
  if (String(mimeType || "").startsWith("image/")) {
    // SVG is text, not raster — compositing onto it doesn't work.
    return !/svg/i.test(mimeType);
  }
  return WATERMARKABLE.test(String(name || ""));
}

/**
 * Has this order been settled, i.e. should the client get the clean file?
 *
 * Keyed on the MONEY, not the order status. `fundsStatus` is what actually
 * says the seller has been paid — and it's the same field the release paths
 * write, so a watermark can't outlive the payment or drop before it.
 */
function isSettled(fundsStatus) {
  return ["RELEASED_TO_SELLER", "RELEASED_TO_FREELANCER", "AUTO_RELEASED", "PARTIALLY_SETTLED"].includes(
    String(fundsStatus || "")
  );
}

/* Diagonal repeating text, sized to the image.
   Built as SVG and composited once rather than tiled by sharp, because a
   single overlay is one operation regardless of how many repetitions it draws.

   Deliberately hard to remove but easy to see past: low opacity so the work is
   genuinely reviewable, repeated across the whole frame so cropping it out
   takes the image with it. A corner badge would be a two-second crop. */
function buildWatermarkSvg(width, height) {
  // Scaled to the image so a thumbnail and a 4K render both look right.
  const fontSize = Math.max(18, Math.round(Math.min(width, height) / 16));
  const stepX = fontSize * 11;
  const stepY = fontSize * 5;

  const rows = [];
  // Diagonal coverage: the -30° rotation means the corners need extra passes
  // beyond the raw dimensions, hence the generous bounds.
  for (let y = -height; y < height * 2; y += stepY) {
    for (let x = -width; x < width * 2; x += stepX) {
      rows.push(
        `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="rgba(255,255,255,0.22)" transform="rotate(-30 ${x} ${y})">TOKUN · PREVIEW</text>`
      );
    }
  }

  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
       <g>${rows.join("")}</g>
     </svg>`
  );
}

/**
 * Returns a watermarked copy of an image buffer.
 *
 * On any failure the ORIGINAL is returned rather than throwing. That direction
 * is deliberate: a client who can't preview the work at all can't approve it,
 * and a stuck approval is a worse outcome than an unwatermarked preview. The
 * failure is logged so it doesn't pass silently.
 */
async function watermarkImageBuffer(buffer) {
  try {
    const image = sharp(buffer, { failOn: "none" });
    const meta = await image.metadata();

    const width = meta.width || 0;
    const height = meta.height || 0;
    if (!width || !height) return buffer;

    // Below this the text would be illegible and the file is too small to be
    // worth stealing anyway.
    if (width < 120 || height < 120) return buffer;

    return await image
      .composite([{ input: buildWatermarkSvg(width, height), top: 0, left: 0 }])
      // Re-encoded as PNG so transparency survives and every input format
      // takes the same path out.
      .png()
      .toBuffer();
  } catch (err) {
    console.error("Watermarking failed, serving the original:", err.message);
    return buffer;
  }
}

module.exports = {
  isWatermarkableImage,
  isSettled,
  watermarkImageBuffer,
};
