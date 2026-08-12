// utils/introVideoValidation.js
//
// Checks a freelancer's uploaded intro video against the requirements shown in
// the upload UI: 20–60 seconds, at least 1280×720, 16:9 landscape, up to 5 GB.
//
// Measured with ffprobe on the file we received, NOT trusted from the browser.
// The client checks the same things before uploading so the freelancer finds out
// in a second instead of after a long upload, but a client-reported duration is
// just a number in a form field — the gate has to be here.
//
// Two subtleties that produce wrong verdicts if ignored:
//
//   * Rotation metadata. A phone films portrait and tags the stream "rotate 90"
//     while storing it as 1920×1080. Reading width/height raw would pass a
//     portrait video as landscape, which is precisely the case the "filmed in
//     landscape mode" rule exists to catch. Dimensions are swapped for 90/270°.
//
//   * Anamorphic pixels. Some encoders store a 16:9 frame as non-square pixels
//     (e.g. 1440×1080 with a 4:3 sample aspect). Display aspect is what a viewer
//     sees, so the sample aspect ratio is applied before comparing.

const { spawn } = require("child_process");
const { INTRO_VIDEO_RULES } = require("../models/FreelancerProfile");

// Same optional-static-binary fallback as utils/promptMediaValidation.js and
// utils/addTokunIntro.js — bundled binaries if present, system ffprobe if not.
let FFPROBE = process.env.FFPROBE_PATH || "ffprobe";
try {
  const ffp = require("ffprobe-static");
  if (ffp?.path) FFPROBE = ffp.path;
} catch (_) {
  /* package optional — system ffprobe on PATH used instead */
}

const PROBE_TIMEOUT_MS = 30_000;

/**
 * Reads the first video stream's duration, dimensions and rotation.
 * Rejects if the file isn't probeable — which is itself a useful answer, since a
 * file ffprobe can't read is a file no browser will play either.
 */
function probeVideo(filePath) {
  return new Promise((resolve, reject) => {
    // Full -show_streams rather than a narrow -show_entries list. Rotation is
    // reported under `side_data_list` on newer builds and `tags.rotate` on
    // older ones, and asking for `stream_side_data` by name makes ffprobe
    // versions that don't know that section fail the whole command with
    // "No match for section" — which the bundled ffprobe-static does. Taking
    // the full stream object costs a little more output and works everywhere.
    const args = [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_streams",
      "-show_format",
      "-of", "json",
      filePath,
    ];

    const proc = spawn(FFPROBE, args);
    let out = "";
    let err = "";
    let settled = false;

    // A malformed or truncated upload can leave ffprobe spinning. Without this
    // the request hangs until the HTTP layer gives up, with the temp file still
    // on disk and no error anyone can act on.
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      proc.kill("SIGKILL");
      reject(new Error("ffprobe timed out reading this file"));
    }, PROBE_TIMEOUT_MS);

    proc.stdout.on("data", (d) => (out += d.toString()));
    proc.stderr.on("data", (d) => (err += d.toString()));

    proc.on("error", (e) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(e);
    });

    proc.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      if (code !== 0) {
        return reject(new Error(`ffprobe failed: ${err.slice(-300)}`));
      }

      let parsed;
      try {
        parsed = JSON.parse(out);
      } catch (e) {
        return reject(new Error("Could not read this file's video information"));
      }

      const stream = parsed?.streams?.[0];
      if (!stream) {
        return reject(new Error("No video track found in this file"));
      }

      const rawWidth = Number(stream.width) || 0;
      const rawHeight = Number(stream.height) || 0;

      // Duration lives on the stream for some containers and only on the
      // container for others (notably fragmented MP4), so both are consulted.
      const duration =
        Number(stream.duration) || Number(parsed?.format?.duration) || 0;

      // Rotation is reported in three different places depending on ffprobe
      // version and container; whichever is present wins.
      const rotationRaw =
        stream.rotation ??
        stream.tags?.rotate ??
        stream.side_data_list?.find?.((s) => s.rotation !== undefined)?.rotation ??
        0;
      // Normalised to 0/90/180/270 — the value can be negative (-90) and can
      // exceed a full turn.
      const rotation = ((Math.round(Number(rotationRaw) || 0) % 360) + 360) % 360;
      const rotated = rotation === 90 || rotation === 270;

      const width = rotated ? rawHeight : rawWidth;
      const height = rotated ? rawWidth : rawHeight;

      // "num:den" — 0:1 or N/A means "unknown", which means square.
      const parseRatio = (value) => {
        const match = String(value || "").match(/^(\d+):(\d+)$/);
        if (!match) return null;
        const num = Number(match[1]);
        const den = Number(match[2]);
        if (!num || !den) return null;
        return num / den;
      };

      const sampleAspect = parseRatio(stream.sample_aspect_ratio) || 1;
      const displayAspect = parseRatio(stream.display_aspect_ratio);

      // Display aspect if the file states one, otherwise derived from the
      // (rotation-corrected) dimensions and pixel shape.
      const aspect =
        displayAspect ||
        (height > 0 ? (width * sampleAspect) / height : 0);

      resolve({
        width,
        height,
        rawWidth,
        rawHeight,
        rotation,
        durationSeconds: Math.round(duration * 100) / 100,
        aspect,
      });
    });
  });
}

/**
 * Probes the file and returns every rule it breaks.
 *
 * Returns ALL failures rather than the first, because the UI lists them
 * together — a freelancer whose video is portrait AND too short should be told
 * both at once instead of re-exporting twice.
 *
 * @returns {Promise<{ok: boolean, errors: string[], meta: object}>}
 */
async function validateIntroVideo(filePath, sizeBytes) {
  const rules = INTRO_VIDEO_RULES;
  const meta = await probeVideo(filePath);
  const errors = [];

  if (meta.durationSeconds < rules.minSeconds || meta.durationSeconds > rules.maxSeconds) {
    errors.push(
      `Make sure your video is between ${rules.minSeconds} - ${rules.maxSeconds} seconds (this one is ${Math.round(
        meta.durationSeconds
      )}s).`
    );
  }

  if (meta.width < rules.minWidth || meta.height < rules.minHeight) {
    errors.push(
      `Your video needs to be at least ${rules.minWidth}×${rules.minHeight} (this one is ${meta.width}×${meta.height}).`
    );
  }

  // Checked before the aspect rule so a portrait video gets the message that
  // actually tells it what to do, rather than a bare ratio complaint.
  if (meta.height > meta.width) {
    errors.push("Your video needs to be filmed in landscape mode.");
  } else if (Math.abs(meta.aspect - rules.aspectRatio) > rules.aspectTolerance) {
    errors.push(
      `Your video aspect ratio needs to be 16:9 (this one is about ${meta.aspect.toFixed(2)}:1).`
    );
  }

  if (sizeBytes > rules.maxBytes) {
    errors.push(
      `Your video must be under ${Math.round(rules.maxBytes / 1024 / 1024 / 1024)} GB.`
    );
  }

  return { ok: errors.length === 0, errors, meta };
}

module.exports = { validateIntroVideo, probeVideo, INTRO_VIDEO_RULES };
