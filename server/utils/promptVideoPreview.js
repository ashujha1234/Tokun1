/**
 * A poster frame and a short preview clip for an uploaded prompt video.
 *
 * Why this exists, in numbers. The 4K listing on the marketplace is 59 seconds
 * of 2560×1440 at 7.9 Mbps — 56 MB. Its MP4 is already fast-start (moov before
 * mdat), so streaming is not the problem; the bitrate is. A viewer on 4 Mbps
 * cannot play it in real time at all, and the detail panel has nothing to show
 * until enough of it has arrived.
 *
 * So the marketplace stops showing the original:
 *
 *   poster   one JPEG, 720p wide, ~40 KB — paints the instant the panel opens
 *   preview  8 seconds, 720p, silent, ~1 MB — plays on any connection
 *
 * The original stays exactly where it was and is still what a buyer receives.
 * This is the same trade services already make (see utils/videoPoster.js); it
 * had simply never been applied to prompt uploads.
 *
 * ffmpeg comes from ffmpeg-static, already a dependency of this project.
 */

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

/** Preview shape. Deliberately small numbers; see the note above. */
const PREVIEW_SECONDS = 8;
const PREVIEW_HEIGHT = 720;
/* 30 is visually fine at this size and roughly halves the file against 26.
   The preview is a sales pitch, not the product. */
const PREVIEW_CRF = 30;

function run(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    p.stderr.on("data", (d) => { stderr += d.toString(); });
    p.on("error", reject);
    p.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(stderr.slice(-500) || `ffmpeg exited ${code}`))
    );
  });
}

/**
 * @param {Buffer} videoBuffer the uploaded original
 * @param {string} ext         its extension, for ffmpeg's demuxer
 * @returns {Promise<{poster: Buffer, preview: Buffer}>}
 */
async function makePosterAndPreview(videoBuffer, ext = ".mp4") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tokun-prompt-video-"));
  const src = path.join(dir, `src${ext}`);
  const posterPath = path.join(dir, "poster.jpg");
  const previewPath = path.join(dir, "preview.mp4");

  try {
    fs.writeFileSync(src, videoBuffer);

    /* One second in, not frame zero: a lot of clips open on black or on a fade,
       and a black poster looks identical to a broken one. */
    await run([
      "-y", "-ss", "1", "-i", src,
      "-frames:v", "1",
      "-vf", `scale=-2:${PREVIEW_HEIGHT}`,
      "-q:v", "4",
      posterPath,
    ]);

    await run([
      "-y", "-i", src,
      "-t", String(PREVIEW_SECONDS),
      // Silent on purpose: these autoplay in a grid, and a muted track is
      // bytes nobody hears.
      "-an",
      "-vf", `scale=-2:${PREVIEW_HEIGHT}`,
      "-c:v", "libx264", "-preset", "veryfast", "-crf", String(PREVIEW_CRF),
      // yuv420p so Safari and older Android will decode it at all.
      "-pix_fmt", "yuv420p",
      // The whole point — headers at the front, so playback can start on the
      // first few KB instead of after the last.
      "-movflags", "+faststart",
      previewPath,
    ]);

    return {
      poster: fs.readFileSync(posterPath),
      preview: fs.readFileSync(previewPath),
    };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

module.exports = { makePosterAndPreview, PREVIEW_SECONDS, PREVIEW_HEIGHT };
