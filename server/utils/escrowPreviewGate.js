// What a buyer is allowed to see while their payment is still in escrow.
//
// Three routes need exactly this decision — service deliverables, hire
// deliverables, and mid-project checkpoint media — and they had drifted into
// three slightly different answers to it. Worse, all three shared the same two
// bugs:
//
//   1. Anything the image watermarker couldn't decode (HEIC off an iPhone, an
//      SVG logo, a 16-bit TIFF) came back as the UNTOUCHED ORIGINAL with
//      `X-Tokun-Watermarked: 1` set on it. The header was a claim nobody
//      checked, and it was false exactly when it mattered.
//   2. Video was handed over as a signed URL to the master file with
//      `heldInEscrow: true`, and the mark was drawn in CSS over the player.
//      The frames the client watched were marked; the file behind the <video>
//      src was not.
//
// So the decision lives here once, and it has one shape: while the money is
// held, a buyer gets MARKED BYTES or NOTHING. Never the original, and never a
// header that says marked when it isn't.
//
//   image  → re-encoded PNG with the mark composited in (SVG is rasterised
//            first, HEIC decoded), or a refusal if that fails
//   video  → a watermark-burned, downscaled re-encode prepared in the
//            background, or "preparing" / a refusal
//   other  → locked. A zip, a PSD, a font, a PDF has no protectable preview
//            form: for those, "preview" and "have the file" are the same thing.
//
// The seller/freelancer looking at their own work, an admin ruling on a
// dispute, and the buyer after release all bypass this file entirely — they are
// entitled to the original and the callers only reach in here when `held`.

const fs = require("fs");

const {
  isWatermarkableImage,
  isPreviewableVideo,
  renderWatermarkedImage,
  PREVIEW_UNAVAILABLE_MESSAGE,
} = require("./deliverableWatermark");
const {
  ensureVideoPreview,
  PREVIEW_PREPARING_MESSAGE,
  PREVIEW_TOO_LARGE_MESSAGE,
} = require("./deliverableVideoPreview");
const { getWorkFileDownloadUrl } = require("./serviceWorkStorage");

const LOCKED_MESSAGE =
  "This file unlocks once the payment is released. Approve the work — or request a revision — and it's yours to download.";

/* ASCII-only, quote-free stem for a Content-Disposition header.

   HTTP headers are latin-1, so a Devanagari or emoji filename has to be
   transliterated to underscores or the header is invalid. The extension is
   dropped because the caller appends the REAL one — what comes back is a PNG or
   an mp4 whatever the source was, and "artwork.png.png" or "edit.mov.mp4" reads
   like a bug to whoever it lands on. */
function headerSafeStem(name, fallback) {
  const base = String(name || fallback).replace(/\.[A-Za-z0-9]{1,8}$/, "");
  return (base || fallback).replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "");
}

/**
 * What kind of preview, if any, this file can have.
 * Exported so callers can label a locked file in the UI without guessing.
 */
function previewKind(name, mimeType) {
  if (isWatermarkableImage(name, mimeType)) return "image";
  if (isPreviewableVideo(name, mimeType)) return "video";
  return "none";
}

async function readImageBytes({ blobName, legacyPath }) {
  if (blobName) {
    // Fetched server-side and re-encoded, because handing over the SAS URL
    // would hand over the untouched original — the whole thing being prevented.
    const upstream = await fetch(getWorkFileDownloadUrl(blobName));
    if (!upstream.ok) throw new Error(`blob fetch failed: ${upstream.status}`);
    return Buffer.from(await upstream.arrayBuffer());
  }
  return fs.promises.readFile(legacyPath);
}

/**
 * Answers one request for held-in-escrow media. ALWAYS sends a response.
 *
 * @param {object}   args
 * @param {object}   args.res
 * @param {string}   args.name       original filename, for type-sniffing and the header
 * @param {string}   args.mimeType   recorded mime type, if any
 * @param {string}   args.blobName   private blob (post-Azure records)
 * @param {string}   args.legacyPath local file (pre-Azure records) — one of the two
 * @param {object}   args.state      the media subdoc, read for its preview* fields
 * @param {Function} args.persist    async (patch) => void, writes those fields back
 */
async function serveHeldPreview({ res, name, mimeType, blobName, legacyPath, state, persist }) {
  const kind = previewKind(name, mimeType);

  /* Nothing previewable. This is the honest end of the trade: the seller was
     promised the work stays locked until the buyer approves, and for a source
     file that promise can only be kept by enforcing it. */
  if (kind === "none") {
    return res.status(403).json({
      success: false,
      error: "deliverable_locked",
      previewKind: "none",
      message: LOCKED_MESSAGE,
    });
  }

  if (kind === "video") {
    const preview = await ensureVideoPreview({ blobName, legacyPath, state, persist });

    if (preview.status === "READY" && preview.previewBlobName) {
      return res.json({
        success: true,
        kind: "file",
        name,
        // A SAS to the DERIVED blob. The master's blobName is never signed
        // while the money is held.
        url: getWorkFileDownloadUrl(preview.previewBlobName),
        heldInEscrow: true,
        // The mark is IN the frames. The player must not draw its own on top,
        // and the buyer is not being shown the original.
        watermarked: true,
        burnedIn: true,
      });
    }

    if (preview.status === "READY" && preview.localPath) {
      // Pre-Azure record: the preview only exists on this host's disk, so it is
      // streamed. sendFile handles Range, which is what lets the player seek.
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("X-Tokun-Watermarked", "1");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="preview-${headerSafeStem(name, "video")}.mp4"`
      );
      return res.sendFile(preview.localPath);
    }

    if (preview.status === "PENDING") {
      // 202: the request was understood and the work is happening. The client
      // polls this rather than treating it as a dead end.
      return res.status(202).json({
        success: false,
        error: "preview_preparing",
        previewKind: "video",
        retryAfterMs: 8000,
        message: PREVIEW_PREPARING_MESSAGE,
      });
    }

    return res.status(403).json({
      success: false,
      error: "preview_unavailable",
      previewKind: "video",
      message:
        preview.reason === "source_too_large"
          ? PREVIEW_TOO_LARGE_MESSAGE
          : PREVIEW_UNAVAILABLE_MESSAGE,
    });
  }

  // ── image ──────────────────────────────────────────────────────────────
  let stamped;
  try {
    stamped = await renderWatermarkedImage(await readImageBytes({ blobName, legacyPath }), {
      name,
      mimeType,
    });
  } catch (err) {
    console.error(`Held preview read failed for ${name}: ${err.message}`);
    stamped = { ok: false, reason: "read_failed" };
  }

  if (!stamped.ok) {
    /* The refusal that used to be a silent leak. An undecodable image is not a
       reason to hand over the original — it's a reason to say we couldn't make
       a safe copy. */
    return res.status(403).json({
      success: false,
      error: "preview_unavailable",
      previewKind: "image",
      message: PREVIEW_UNAVAILABLE_MESSAGE,
    });
  }

  res.setHeader("Content-Type", stamped.contentType);
  // Set ONLY on this line, and only after a composite that actually succeeded.
  res.setHeader("X-Tokun-Watermarked", "1");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="preview-${headerSafeStem(name, "image")}.png"`
  );
  return res.send(stamped.buffer);
}

module.exports = { serveHeldPreview, previewKind, LOCKED_MESSAGE };
