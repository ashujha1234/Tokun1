/**
 * Is this upload actually the kind of file it claims to be?
 *
 * ── The hole this closes ────────────────────────────────────────────────────
 *
 * POST /api/prompt decided image-vs-video from `file.mimetype`, which multer
 * takes from the Content-Type of the multipart part — i.e. from the client. A
 * request could declare `video/mp4` on any 100 MB payload and it would:
 *
 *   1. skip the perceptual-hash and watermark screening, which is image-only,
 *   2. never be decoded by anything, because the video branch passed the buffer
 *      straight through, and
 *   3. land in the `prompt-attachments` container, which uploadToAzure creates
 *      with `access: "container"` — public read AND public list.
 *
 * Not a script-execution risk: a browser will not run HTML served as
 * video/mp4. It is arbitrary file hosting, at 100 MB a time, on a public
 * container — which is worth closing on its own.
 *
 * Images were incidentally safer, because sharp throws on a non-image, but only
 * incidentally: `watermarkImage` catches its own failure and falls back to the
 * original buffer, so a decode failure there does not reject the upload. Both
 * types are now checked explicitly rather than as a side effect.
 *
 * ── Why the bytes, not the extension or the header ─────────────────────────
 *
 * Magic-number sniffing would tell us "this begins like an MP4", which a
 * crafted file can also do. Decoding is the actual question — the file has to
 * be something ffprobe/sharp can read a stream out of — so that is what this
 * asks. ffprobe and sharp are already dependencies (promptMediaValidation.js
 * uses both), so this adds no new ones.
 */

const { spawn } = require("child_process");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");

let FFPROBE = process.env.FFPROBE_PATH || "ffprobe";
try {
  const ffp = require("ffprobe-static");
  if (ffp?.path) FFPROBE = ffp.path;
} catch {
  /* Fall back to whatever is on PATH — same tolerance as
     promptMediaValidation.js, which resolves the binary the same way. */
}

/* ffprobe needs a path, not a buffer, and the upload is in memory (multer is
   configured with memoryStorage). Written to the OS temp dir and removed in a
   finally, so a rejected upload leaves nothing behind — the same rule the
   Azure-upload ordering follows elsewhere in this route. */
function tempPath(ext) {
  return path.join(
    os.tmpdir(),
    `tokun-attach-${Date.now()}-${Math.random().toString(36).slice(2)}${ext || ""}`
  );
}

const PROBE_TIMEOUT_MS = 15000;

function probeStreams(filePath) {
  return new Promise((resolve, reject) => {
    const args = [
      "-v", "error",
      "-show_entries", "stream=codec_type,codec_name",
      "-of", "json",
      filePath,
    ];
    const p = spawn(FFPROBE, args);

    let out = "";
    let err = "";
    /* A malformed file can make ffprobe sit and read forever, and this runs
       inside a request. Killed rather than waited on. */
    const killer = setTimeout(() => {
      p.kill("SIGKILL");
      reject(new Error("ffprobe timed out"));
    }, PROBE_TIMEOUT_MS);

    p.stdout.on("data", (d) => (out += d.toString()));
    p.stderr.on("data", (d) => (err += d.toString()));
    p.on("error", (e) => {
      clearTimeout(killer);
      reject(e);
    });
    p.on("close", (code) => {
      clearTimeout(killer);
      if (code !== 0) return reject(new Error(`ffprobe exited ${code}: ${err.slice(-200)}`));
      try {
        resolve(JSON.parse(out).streams || []);
      } catch (e) {
        reject(e);
      }
    });
  });
}

/**
 * Verify a buffer really is a decodable video with at least one video stream.
 *
 * Audio-only files are rejected deliberately: this is a marketplace listing's
 * cover media, and an MP3 renamed to .mp4 would render as a black rectangle.
 *
 * Returns { ok: true, codec } or { ok: false, reason }. Never throws — a
 * probe failure IS the rejection, and the caller is a request handler.
 */
async function verifyVideoBuffer(buffer, originalName = "") {
  const ext = path.extname(originalName || "").toLowerCase() || ".mp4";
  const file = tempPath(ext);

  try {
    await fs.writeFile(file, buffer);
    const streams = await probeStreams(file);
    const video = streams.find((s) => s.codec_type === "video");

    if (!video) {
      return {
        ok: false,
        reason: streams.length
          ? "This file has no video track — it looks like audio or data rather than a video."
          : "This file could not be read as a video.",
      };
    }
    return { ok: true, codec: video.codec_name || null };
  } catch (e) {
    return { ok: false, reason: "This file could not be read as a video." };
  } finally {
    await fs.unlink(file).catch(() => {});
  }
}

/**
 * Verify a buffer really is a decodable image.
 *
 * sharp's metadata() reads the header and will throw on anything it cannot
 * parse, which is the check we want. Dimensions are returned because a 0-width
 * "image" is technically parseable and useless.
 */
async function verifyImageBuffer(buffer) {
  try {
    const sharp = require("sharp");
    const meta = await sharp(buffer).metadata();
    if (!meta?.width || !meta?.height) {
      return { ok: false, reason: "This file could not be read as an image." };
    }
    return { ok: true, format: meta.format || null, width: meta.width, height: meta.height };
  } catch {
    return { ok: false, reason: "This file could not be read as an image." };
  }
}

module.exports = { verifyVideoBuffer, verifyImageBuffer };
