

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ── binaries ─────────────────────────────────────────────────────────────
let FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";
let FFPROBE = process.env.FFPROBE_PATH || "ffprobe";
try {

  const ffs = require("ffmpeg-static");
  if (ffs) FFMPEG = ffs;
  const ffp = require("ffprobe-static");
  if (ffp?.path) FFPROBE = ffp.path;
} catch (_) {
  /* packages optional — system ffmpeg use hoga */
}

const INTRO_PATH = path.join(__dirname, "..", "assets", "tokun-intro.mp4");

// ── low-level runners ────────────────────────────────────────────────────
function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args);
    let stderr = "";
    p.stderr.on("data", (d) => (stderr += d.toString()));
    p.on("error", reject);
    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}: ${stderr.slice(-800)}`));
    });
  });
}

function probe(filePath) {
  return new Promise((resolve, reject) => {
    const args = [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=width,height,r_frame_rate",
      "-show_entries", "format=duration",
      "-of", "json",
      filePath,
    ];
    const p = spawn(FFPROBE, args);
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => (out += d.toString()));
    p.stderr.on("data", (d) => (err += d.toString()));
    p.on("error", reject);
    p.on("close", (code) => {
      if (code !== 0) return reject(new Error(`ffprobe failed: ${err}`));
      try {
        const parsed = JSON.parse(out);
        const s = parsed.streams?.[0];
        if (!s) return reject(new Error("no video stream found"));
        const [num, den] = String(s.r_frame_rate || "30/1").split("/").map(Number);
        const fps = den ? Math.min(60, Math.max(15, Math.round(num / den))) : 30;
        const width = Math.max(2, Math.floor((s.width || 1280) / 2) * 2);  // even (x264)
        const height = Math.max(2, Math.floor((s.height || 720) / 2) * 2);
        const duration = Math.max(0.5, parseFloat(parsed.format?.duration || "10") || 10);
        resolve({ width, height, fps, duration });
      } catch (e) {
        reject(e);
      }
    });
  });
}

function tmpFile(ext) {
  return path.join(
    os.tmpdir(),
    `tokun-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  );
}

/**
 * Video buffer ke aage TOKUN.AI intro jodta hai.
 * @param {Buffer} videoBuffer  multer memoryStorage se mila file.buffer
 * @param {string} [ext="mp4"]  original extension (mp4/mov/webm...) — output hamesha mp4
 * @returns {Promise<Buffer>}   processed buffer; error par ORIGINAL buffer (fail-safe)
 */
async function addTokunIntro(videoBuffer, ext = "mp4") {
  const inPath = tmpFile((ext || "mp4").replace(/[^a-z0-9]/gi, "") || "mp4");
  const outPath = tmpFile("mp4");

  const cleanup = () => {
    try { fs.existsSync(inPath) && fs.unlinkSync(inPath); } catch (_) {}
    try { fs.existsSync(outPath) && fs.unlinkSync(outPath); } catch (_) {}
  };

  try {
    if (!fs.existsSync(INTRO_PATH)) {
      console.warn("[TokunIntro] intro file missing at", INTRO_PATH, "— skipping");
      return videoBuffer;
    }

    // buffer → temp file (ffmpeg ke liye)
    fs.writeFileSync(inPath, videoBuffer);

    const { width, height, fps, duration } = await probe(inPath);

    // Intro ko upload ki resolution par scale+letterbox, fps match
    const vf0 = `[0:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${fps},format=yuv420p[v0]`;
    const vf1 = `[1:v]setsar=1,fps=${fps},format=yuv420p[v1]`;

    const baseOut = [
      "-map", "[v]", "-map", "[a]",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
      "-c:a", "aac", "-b:a", "128k",
      "-movflags", "+faststart",
      outPath,
    ];

    // Attempt 1: upload video ka apna audio use karo
    const argsWithAudio = [
      "-y", "-hide_banner", "-loglevel", "error",
      "-i", INTRO_PATH,
      "-i", inPath,
      "-filter_complex",
      `${vf0};${vf1};` +
        `[0:a]aformat=sample_rates=44100:channel_layouts=stereo[a0];` +
        `[1:a]aformat=sample_rates=44100:channel_layouts=stereo[a1];` +
        `[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]`,
      ...baseOut,
    ];

    try {
      await run(FFMPEG, argsWithAudio);
    } catch (_) {
      // Attempt 2: upload mein audio hi nahi hai → silent track (video-duration tak trimmed)
      const argsNoAudio = [
        "-y", "-hide_banner", "-loglevel", "error",
        "-i", INTRO_PATH,
        "-i", inPath,
        "-f", "lavfi", "-t", String(duration.toFixed(2)),
        "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
        "-filter_complex",
        `${vf0};${vf1};` +
          `[0:a]aformat=sample_rates=44100:channel_layouts=stereo[a0];` +
          `[2:a]aformat=sample_rates=44100:channel_layouts=stereo[a1];` +
          `[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]`,
        "-shortest",
        ...baseOut,
      ];
      await run(FFMPEG, argsNoAudio);
    }

    const outBuffer = fs.readFileSync(outPath);
    if (!outBuffer.length) throw new Error("empty output");

    return outBuffer;
  } catch (err) {
    console.error("[TokunIntro] failed, uploading original:", err.message);
    return videoBuffer; // fail-safe
  } finally {
    cleanup();
  }
}

module.exports = { addTokunIntro };