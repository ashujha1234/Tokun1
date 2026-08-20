// A REAL watermark burned into a delivered video, for the window where the
// buyer can watch it but hasn't paid out yet.
//
// ─── WHAT WAS WRONG ────────────────────────────────────────────────────────
//
// Images were stamped server-side; video was not. The download route handed a
// buyer with funds still in escrow a signed URL to the ORIGINAL file and set
// `heldInEscrow: true`, and the client drew a CSS watermark on top of the
// <video> element. That overlay survives a screen recording, which is the
// common case — but the src attribute in the DOM is the clean master, one
// right-click or one network-tab copy away. For video work, where the delivery
// IS the frames, that is the whole protection gone: a client could watch it,
// save the untouched file, and cancel.
//
// So the bytes get marked. ffmpeg re-encodes the delivery once, downscaled,
// with the same diagonal TOKUN · PREVIEW tiling the image path composites, and
// the buyer is only ever given THAT file while the money is held. The master is
// untouched in the private container and is what they get on release.
//
// ─── WHY IT IS PREPARED IN THE BACKGROUND ──────────────────────────────────
//
// An ffmpeg pass over a real delivery is seconds for a 20 MB clip and minutes
// for a 4K master — nowhere near a request budget. So the first request for an
// unprepared video starts the job, waits a few seconds in case it is a small
// one, and otherwise answers "preparing". The result is cached beside the
// original (blobName + PREVIEW_SUFFIX) and recorded on the deliverable, so this
// is paid once per file, not once per view.
//
// The submit path warms it too, so in practice the buyer's first click finds it
// ready.
//
// ─── AND WHEN IT CANNOT BE DONE ────────────────────────────────────────────
//
// The job fails: a corrupt upload, an exotic codec, no ffmpeg on the host, a
// file past MAX_SOURCE_BYTES. The answer is a refusal — never the original.
// That does cost the buyer their preview, and they can still request a revision,
// cancel, or raise a dispute (an admin sees everything unwatermarked). Handing
// over the clean master to keep the preview working is what this file exists to
// stop.

const { spawn } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sharp = require("sharp");

const { buildWatermarkSvg } = require("./deliverableWatermark");
const {
  downloadWorkFileToPath,
  uploadDerivedFileToAzure,
  workBlobExists,
} = require("./serviceWorkStorage");
const { tempUploadDir } = require("./privateUploadDirs");

let FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";
try {
  const ffs = require("ffmpeg-static");
  if (ffs) FFMPEG = ffs;
} catch {
  /* optional — a system ffmpeg on PATH works too (same as videoPoster.js) */
}

/* Appended to the source blob name, so a preview is always findable from its
   original and can never collide with a real upload (a seller cannot name a
   file into this namespace — blob names are minted server-side). */
const PREVIEW_SUFFIX = ".tokun-preview.mp4";

/* Long edge of the preview. 854 is DVD-ish: unambiguous for judging pacing,
   framing, colour and edit decisions, and useless as a deliverable. */
const PREVIEW_MAX_WIDTH = 854;

/* Past this we don't try. A 2 GB master would hold an encoder slot for a very
   long time, and a buyer refreshing the page would queue another. The refusal
   message asks the creator for a review copy, which is the honest ask. */
const MAX_SOURCE_BYTES = 1.5 * 1024 * 1024 * 1024;

/* One job can't run forever. Generous: a 40-minute 4K master on a small box is
   genuinely slow, and killing a job that was going to succeed means the buyer
   can never review the work. */
const JOB_TIMEOUT_MS = 20 * 60 * 1000;

/* How many encodes at once. ffmpeg will happily eat every core; two leaves the
   API responsive on the small instances this runs on. Everything else waits. */
const MAX_CONCURRENT = 2;

/* How long a request will hold on hoping the job finishes. Small clips land
   inside this and the buyer never sees a "preparing" state at all. */
const GRACE_MS = 6000;

/* A failed job is retried once — a transient blob read or an OOM-killed encoder
   shouldn't lock a delivery out of review forever — and then left alone, so a
   genuinely unencodable file isn't re-attempted on every page load. */
const MAX_ATTEMPTS = 2;

/* Previews for PRE-AZURE deliverables, which have no blob to sit beside. Under
   the private temp root (never inside /uploads), and disposable: if the host
   clears its temp dir the next request just rebuilds. */
const localCacheDir = () => tempUploadDir("preview-cache");

/* Jobs in flight, keyed by source. Without this, three buyers opening the same
   delivery would start three encodes of the same file. */
const inFlight = new Map();

let running = 0;
const waiting = [];

function acquireSlot() {
  if (running < MAX_CONCURRENT) {
    running += 1;
    return Promise.resolve();
  }
  return new Promise((resolve) => waiting.push(resolve));
}

function releaseSlot() {
  const next = waiting.shift();
  if (next) return next();
  running = Math.max(0, running - 1);
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFMPEG, args);
    let stderr = "";
    let done = false;

    const timer = setTimeout(() => {
      if (done) return;
      proc.kill("SIGKILL");
      reject(new Error(`ffmpeg timed out after ${Math.round(JOB_TIMEOUT_MS / 1000)}s`));
    }, JOB_TIMEOUT_MS);

    proc.stderr.on("data", (d) => {
      // Bounded: a chatty encoder on a long file would otherwise grow this
      // string for twenty minutes.
      stderr = (stderr + d.toString()).slice(-4000);
    });
    proc.on("error", (err) => {
      done = true;
      clearTimeout(timer);
      reject(err);
    });
    proc.on("close", (code) => {
      done = true;
      clearTimeout(timer);
      if (code === 0) return resolve();
      reject(new Error(stderr.slice(-400) || `ffmpeg exited ${code}`));
    });
  });
}

/* The mark, as a transparent PNG.

   Rendered at 1280×720 and stretched onto the video by scale2ref rather than
   measured per file: it saves probing the source for its dimensions (ffprobe
   isn't shipped with ffmpeg-static), and the mark is diagonal tiled text, which
   tolerates a little anisotropic stretch without becoming less legible. */
async function buildOverlayPng(outPath) {
  const png = await sharp(Buffer.from(buildWatermarkSvg(1280, 720)))
    .png()
    .toBuffer();
  await fs.promises.writeFile(outPath, png);
  return outPath;
}

/**
 * One encode: source file in, watermarked mp4 out.
 *
 * The filtergraph, in order:
 *   scale   — long edge to PREVIEW_MAX_WIDTH, height forced even (-2) because
 *             yuv420p/H.264 cannot encode odd dimensions;
 *   fps     — capped at 30, so a 60fps master doesn't cost double for a review;
 *   scale2ref — stretches the overlay PNG to whatever the scaled video is;
 *   overlay — burns it in. This is the line that makes the mark real.
 *
 * -map 0:a? keeps audio if there is any (a voiceover or a music cut is part of
 * what's being reviewed) and doesn't fail the job when there isn't.
 * -map_metadata -1 drops the source's metadata, which on a phone-shot master
 * includes GPS coordinates.
 */
async function encodePreview(inPath, outPath) {
  const overlayPath = path.join(path.dirname(outPath), "wm.png");
  await buildOverlayPng(overlayPath);

  await runFfmpeg([
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    inPath,
    "-i",
    overlayPath,
    "-filter_complex",
    `[0:v]scale='min(${PREVIEW_MAX_WIDTH},iw)':-2,fps=fps=30[v];[1:v][v]scale2ref[wm][vv];[vv][wm]overlay=0:0:format=auto[out]`,
    "-map",
    "[out]",
    "-map",
    "0:a?",
    "-map_metadata",
    "-1",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "30",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "96k",
    "-ac",
    "2",
    // Puts the moov atom first so the browser can start playing before the
    // whole file has arrived — otherwise a 200 MB review copy is a blank
    // player until it's fully downloaded.
    "-movflags",
    "+faststart",
    "-max_muxing_queue_size",
    "1024",
    outPath,
  ]);

  const stat = await fs.promises.stat(outPath).catch(() => null);
  if (!stat || !stat.size) throw new Error("ffmpeg produced no output");
  return outPath;
}

function localCachePath(key) {
  const hash = crypto.createHash("sha1").update(String(key)).digest("hex");
  return path.join(localCacheDir(), `${hash}.mp4`);
}

/** Does the cached preview for this source still exist where we left it? */
async function previewIsCached({ previewBlobName, legacyPath }) {
  if (previewBlobName) return workBlobExists(previewBlobName);
  if (legacyPath) {
    const cached = localCachePath(legacyPath);
    return fs.promises
      .stat(cached)
      .then((s) => s.size > 0)
      .catch(() => false);
  }
  return false;
}

/* The actual job. Returns the patch to persist on the deliverable. */
async function buildPreview({ blobName, legacyPath }) {
  await acquireSlot();
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "tokun-vpreview-"));

  try {
    let sourcePath = legacyPath;

    if (blobName) {
      sourcePath = path.join(workDir, `source${path.extname(blobName) || ".mp4"}`);
      await downloadWorkFileToPath(blobName, sourcePath);
    }

    const stat = await fs.promises.stat(sourcePath);
    if (stat.size > MAX_SOURCE_BYTES) {
      // Not an error in the "something broke" sense — a deliberate limit, so it
      // is recorded as such and not retried.
      return {
        status: "FAILED",
        patch: { previewStatus: "FAILED", previewError: "source_too_large" },
      };
    }

    const outPath = path.join(workDir, "preview.mp4");
    await encodePreview(sourcePath, outPath);

    if (blobName) {
      const previewBlobName = `${blobName}${PREVIEW_SUFFIX}`;
      await uploadDerivedFileToAzure(outPath, previewBlobName, "video/mp4");
      return {
        status: "READY",
        previewBlobName,
        patch: { previewBlobName, previewStatus: "READY", previewError: "" },
      };
    }

    // Pre-Azure record: keep the preview on local disk beside nothing, keyed by
    // the source path. `rename` across devices can fail, hence the copy.
    const cached = localCachePath(legacyPath);
    await fs.promises.copyFile(outPath, cached);
    return {
      status: "READY",
      localPath: cached,
      patch: { previewStatus: "READY", previewError: "" },
    };
  } catch (err) {
    console.error(
      `Video preview build failed for ${blobName || legacyPath}: ${err.message}`
    );
    return {
      status: "FAILED",
      patch: { previewStatus: "FAILED", previewError: String(err.message).slice(0, 300) },
    };
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
    releaseSlot();
  }
}

/**
 * The one entry point the routes call.
 *
 * @param {object}   args
 * @param {string}   args.blobName    source blob, for anything uploaded since the move to Azure
 * @param {string}   args.legacyPath  local path, for pre-Azure records (one of the two)
 * @param {object}   args.state       the deliverable/media subdoc — read for previewBlobName / previewStatus / previewAttempts
 * @param {Function} args.persist     async (patch) => void, writes those fields back
 * @param {boolean}  args.wait        false to start the job and return immediately (warm-up path)
 *
 * @returns {Promise<{status: "READY"|"PENDING"|"FAILED", previewBlobName?: string, localPath?: string, reason?: string}>}
 */
async function ensureVideoPreview({ blobName, legacyPath, state = {}, persist, wait = true }) {
  if (!blobName && !legacyPath) return { status: "FAILED", reason: "no_source" };

  const key = blobName ? `blob:${blobName}` : `file:${legacyPath}`;
  const save = async (patch) => {
    if (!persist) return;
    try {
      await persist(patch);
    } catch (err) {
      // A preview that exists but wasn't recorded costs one rebuild later; it
      // must not fail the request that produced it.
      console.error(`Could not record video preview state for ${key}: ${err.message}`);
    }
  };

  // Already built — but only trust the record if the file is actually still
  // there. A cleared temp dir, or a container someone tidied, would otherwise
  // hand out a SAS URL to nothing.
  if (state.previewStatus === "READY") {
    const cached = await previewIsCached({
      previewBlobName: state.previewBlobName,
      legacyPath: blobName ? null : legacyPath,
    });
    if (cached) {
      return blobName
        ? { status: "READY", previewBlobName: state.previewBlobName }
        : { status: "READY", localPath: localCachePath(legacyPath) };
    }
  }

  const attempts = Number(state.previewAttempts || 0);
  if (state.previewStatus === "FAILED" && attempts >= MAX_ATTEMPTS) {
    return { status: "FAILED", reason: state.previewError || "preview_failed" };
  }

  let job = inFlight.get(key);
  if (!job) {
    await save({ previewStatus: "PENDING", previewAttempts: attempts + 1 });

    job = buildPreview({ blobName, legacyPath })
      .then(async (result) => {
        await save(result.patch);
        return result;
      })
      .finally(() => inFlight.delete(key));

    inFlight.set(key, job);
    // Unhandled rejections are impossible — buildPreview resolves on failure —
    // but a persist error inside the .then() would surface here.
    job.catch(() => {});
  }

  if (!wait) return { status: "PENDING" };

  /* Wait a little, then answer honestly either way. `timer` is cleared so a
     20-minute encode doesn't hold an open handle (and the event loop) for the
     rest of the grace period after the race is over. */
  let timer;
  const grace = new Promise((resolve) => {
    timer = setTimeout(() => resolve(null), GRACE_MS);
  });

  const finished = await Promise.race([job, grace]).finally(() => clearTimeout(timer));
  if (!finished) return { status: "PENDING" };
  if (finished.status === "READY") {
    return blobName
      ? { status: "READY", previewBlobName: finished.previewBlobName }
      : { status: "READY", localPath: finished.localPath };
  }
  return { status: "FAILED", reason: finished.patch?.previewError || "preview_failed" };
}

/**
 * Fire-and-forget warm-up, called when work is submitted.
 *
 * Deliberately swallows everything: a failed warm-up is not a failed
 * submission, and the buyer's own request will retry (and record) it anyway.
 */
function warmVideoPreview(args) {
  ensureVideoPreview({ ...args, wait: false }).catch(() => {});
}

const PREVIEW_PREPARING_MESSAGE =
  "We're preparing a watermarked review copy of this video — a large file takes a couple of minutes. Try again in a moment.";

const PREVIEW_TOO_LARGE_MESSAGE =
  "This video is too large for us to prepare a watermarked review copy, so it stays locked while the payment is held. Ask the creator to send a smaller review cut, or approve the work to get the original.";

module.exports = {
  ensureVideoPreview,
  warmVideoPreview,
  PREVIEW_SUFFIX,
  PREVIEW_PREPARING_MESSAGE,
  PREVIEW_TOO_LARGE_MESSAGE,
  MAX_SOURCE_BYTES,
};
