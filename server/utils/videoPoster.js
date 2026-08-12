// One still frame per uploaded video, so a listing card never has to download
// the video itself just to show a thumbnail.
//
// The problem this closes: service cards render `<video>` directly. Chrome
// answers `preload="metadata"` with `Range: bytes=0-` — an open-ended range,
// i.e. the whole file — so opening the Services tab with three video listings
// pulled 45 MB before anything appeared, one of them a 27 MB 2160×3840 60fps
// clip being painted into a 160px-tall box.
//
// A poster is a ~40 KB JPEG. The card shows it instantly and the video is never
// fetched unless someone opens the listing.

const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

let FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";
try {
  const ffs = require("ffmpeg-static");
  if (ffs) FFMPEG = ffs;
} catch {
  /* optional — a system ffmpeg on PATH works too */
}

const VIDEO_EXT = /\.(mp4|webm|ogg|mov|m4v)$/i;

/** Is this upload a video, i.e. does it need a poster? */
function isVideoUpload(name, mimeType) {
  if (String(mimeType || "").startsWith("video/")) return true;
  return VIDEO_EXT.test(String(name || ""));
}

function run(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFMPEG, args);
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", reject);
    proc.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(stderr.slice(-400) || `ffmpeg exited ${code}`))
    );
  });
}

/**
 * Grabs a representative frame and returns it as a JPEG buffer.
 *
 * Returns null on any failure rather than throwing: a listing without a poster
 * still works (it falls back to the old behaviour), but an upload that fails
 * because a thumbnail couldn't be made would be a much worse trade.
 *
 * @param {Buffer} videoBuffer the uploaded file
 * @param {string} ext original extension, only used to name the temp file
 */
async function generateVideoPoster(videoBuffer, ext = ".mp4") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tokun-poster-"));
  const inPath = path.join(dir, `in${ext.startsWith(".") ? ext : `.${ext}`}`);
  const outPath = path.join(dir, "poster.jpg");

  try {
    fs.writeFileSync(inPath, videoBuffer);

    /* One second in, not frame zero: a lot of stock and screen-recorded footage
       opens on black or a fade, which makes for a thumbnail that says nothing.
       -ss before -i seeks by keyframe, which is fast and accurate enough here.

       Scaled to 720px wide max — the card renders at ~380px, and a poster
       heavier than the thing it replaced would defeat the point. */
    await run([
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-ss",
      "1",
      "-i",
      inPath,
      "-frames:v",
      "1",
      "-vf",
      "scale='min(720,iw)':-2",
      "-q:v",
      "4",
      outPath,
    ]);

    if (!fs.existsSync(outPath)) return null;
    const buf = fs.readFileSync(outPath);
    return buf.length ? buf : null;
  } catch (err) {
    // A clip shorter than a second lands here — retry from the very start
    // before giving up, since that is the one failure worth a second attempt.
    try {
      await run([
        "-y", "-hide_banner", "-loglevel", "error",
        "-i", inPath,
        "-frames:v", "1",
        "-vf", "scale='min(720,iw)':-2",
        "-q:v", "4",
        outPath,
      ]);
      if (fs.existsSync(outPath)) {
        const buf = fs.readFileSync(outPath);
        if (buf.length) return buf;
      }
    } catch {
      /* fall through to the log below */
    }
    console.error("Video poster generation failed:", err.message);
    return null;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

module.exports = { isVideoUpload, generateVideoPoster };
