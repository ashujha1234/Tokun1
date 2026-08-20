// Watermarking for delivered media, until the booking is settled.
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
// Video is handled by deliverableVideoPreview.js, which burns the same mark
// into a downscaled re-encode. Everything else — a zip, a PSD, a font, a PDF —
// has no protectable preview form at all, so the download routes keep it locked
// until the money moves rather than pretending.
//
// ─── THE ONE RULE IN HERE ──────────────────────────────────────────────────
//
// renderWatermarkedImage() NEVER returns the original bytes. It returns
// {ok:true, buffer} only when a mark was genuinely composited in, and
// {ok:false, reason} otherwise. This function used to swallow every failure and
// hand back the untouched original — and the caller then sent it with
// `X-Tokun-Watermarked: 1` on it. So the one case where protection mattered
// most (a format sharp couldn't decode) was the exact case where the buyer got
// the clean file, with a header on it claiming otherwise, and no log line the
// client could see. A refusal the caller has to handle is the only version of
// this that can't lie.

const sharp = require("sharp");

/* Formats we can decode and re-encode. HEIC/HEIF is in the list because
   iPhone-shot work arrives as .heic constantly and this build of sharp
   (libvips with libheif) decodes it — but the decision is still made at
   RUN time by whether the composite actually succeeded, not by this regex. */
const WATERMARKABLE = /\.(jpe?g|png|webp|gif|tiff?|bmp|avif|heics?|heifs?|svg)$/i;

/* An SVG is text, not pixels — it can't be composited onto, so it is
   RASTERISED first and the buyer's preview comes back as a PNG. Before, SVG was
   excluded from watermarking altogether, which (once the download gate landed)
   meant a logo delivery couldn't be previewed by the buyer at all: the one
   deliverable type where "look at it before approving" is the entire review. */
const SVG_RE = /(^|\/)svg(\+xml)?$/i;

/** Is this something we can meaningfully watermark? */
function isWatermarkableImage(name, mimeType) {
  const mime = String(mimeType || "");
  if (mime.startsWith("image/")) return true;
  return WATERMARKABLE.test(String(name || ""));
}

function isSvgInput(name, mimeType) {
  return SVG_RE.test(String(mimeType || "")) || /\.svgz?$/i.test(String(name || ""));
}

/**
 * Is this something a browser can PLAY in place?
 *
 * Needed because the escrow gate treats video differently from everything else:
 * a client genuinely cannot approve a video delivery without watching it, so a
 * watermarked re-encode is prepared for them (deliverableVideoPreview.js).
 * A zip, a PSD, a font or a PDF has no such need — for those, "preview" and
 * "have the file" are the same thing, so they stay locked until the money moves.
 */
function isPreviewableVideo(name, mimeType) {
  if (String(mimeType || "").startsWith("video/")) return true;
  return /\.(mp4|mov|webm|m4v|ogv|mkv|avi)$/i.test(String(name || ""));
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

/* A preview is capped at this on its long edge.

   Two reasons, and the second is the point: re-encoding a 10000px scan as PNG
   per request is expensive, and a full-resolution "preview" is a print-ready
   file with some text on it. 2000px is comfortably enough to judge the work. */
const PREVIEW_MAX_EDGE = 2000;

/* Ceiling on decoded pixels. An SVG (or a crafted TIFF) declaring enormous
   dimensions would otherwise be a memory bomb aimed at the server by way of a
   deliverable upload. sharp's own default is ~268MP, which is far past
   anything a real delivery needs. */
const MAX_INPUT_PIXELS = 60 * 1000 * 1000;

/* Diagonal repeating text, sized to the image.
   Built as SVG and composited once rather than tiled by sharp, because a
   single overlay is one operation regardless of how many repetitions it draws.

   Deliberately hard to remove but easy to see past: low opacity so the work is
   genuinely reviewable, repeated across the whole frame so cropping it out
   takes the image with it. A corner badge would be a two-second crop. */
function buildWatermarkSvg(width, height) {
  // Scaled to the image so a thumbnail and a 4K render both look right. The
  // floor is 10 rather than 18 so a 96px icon still gets marked instead of
  // being waved through — every previewed pixel is marked or refused.
  const fontSize = Math.max(10, Math.round(Math.min(width, height) / 16));
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
 * Renders a watermarked PNG preview of an image buffer.
 *
 * @returns {Promise<{ok: true, buffer: Buffer, contentType: string}
 *                 | {ok: false, reason: string}>}
 *
 * On failure the ORIGINAL IS NOT RETURNED — see the rule at the top of this
 * file. The caller decides what a failure means, and for a buyer whose payment
 * is still in escrow the only honest answer is "we couldn't prepare a protected
 * preview of this one", never the clean file.
 */
async function renderWatermarkedImage(buffer, { name, mimeType } = {}) {
  try {
    if (!buffer || !buffer.length) return { ok: false, reason: "empty_file" };

    let pipeline = sharp(buffer, {
      failOn: "none",
      limitInputPixels: MAX_INPUT_PIXELS,
      // Only read by the SVG loader. 96 renders a viewBox-only icon at a
      // usable size instead of a 16px smudge; the resize below caps the top end.
      density: isSvgInput(name, mimeType) ? 96 : 72,
    });

    const meta = await pipeline.metadata();

    /* An SVG whose root is sized in percentages (or not sized at all) comes
       back tiny or dimensionless. Rasterise it at a fixed width instead — a
       vector has no natural resolution, so picking one is the only option. */
    const vector = meta.format === "svg" || isSvgInput(name, mimeType);
    if (vector && (!meta.width || !meta.height || meta.width < 600)) {
      pipeline = sharp(buffer, {
        failOn: "none",
        limitInputPixels: MAX_INPUT_PIXELS,
        density: 96,
      }).resize({ width: 1200, fit: "inside", withoutEnlargement: false });
    } else if ((meta.width || 0) > PREVIEW_MAX_EDGE || (meta.height || 0) > PREVIEW_MAX_EDGE) {
      pipeline = pipeline.resize({
        width: PREVIEW_MAX_EDGE,
        height: PREVIEW_MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    /* Flattened to PNG first, then measured. The dimensions the overlay has to
       match are the ones AFTER the resize/rasterise above, and reading them off
       the input metadata (as this used to) is how you get a mark that covers
       part of the frame. One extra encode, and it is the only way the overlay
       is guaranteed to line up. */
    const base = await pipeline.png().toBuffer({ resolveWithObject: true });
    const width = base.info.width || 0;
    const height = base.info.height || 0;
    if (!width || !height) return { ok: false, reason: "undecodable" };

    const stamped = await sharp(base.data, { limitInputPixels: MAX_INPUT_PIXELS })
      .composite([{ input: buildWatermarkSvg(width, height), top: 0, left: 0 }])
      // PNG so transparency survives and every input format takes the same
      // path out.
      .png()
      .toBuffer();

    if (!stamped || !stamped.length) return { ok: false, reason: "encode_failed" };
    return { ok: true, buffer: stamped, contentType: "image/png", width, height };
  } catch (err) {
    // Logged, not swallowed into a successful-looking response. The caller
    // turns this into a refusal the buyer can actually read.
    console.error(
      `Watermarking failed for ${name || "image"} (${mimeType || "unknown type"}): ${err.message}`
    );
    return { ok: false, reason: "watermark_failed" };
  }
}

/* What the download routes tell the buyer when the mark couldn't be applied.
   Kept here so all three routes say the same thing. */
const PREVIEW_UNAVAILABLE_MESSAGE =
  "We couldn't prepare a protected preview of this file, so it stays locked while the payment is held. Ask the creator to re-send it in a standard format (JPG, PNG, PDF or MP4) — or approve the work and download the original.";

module.exports = {
  isWatermarkableImage,
  isPreviewableVideo,
  isSettled,
  renderWatermarkedImage,
  // Exported so the video pass burns in the SAME mark, at the same angle and
  // opacity, rather than a second one that drifts from this one over time.
  buildWatermarkSvg,
  PREVIEW_UNAVAILABLE_MESSAGE,
};
