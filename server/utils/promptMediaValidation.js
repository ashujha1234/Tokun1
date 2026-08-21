// utils/promptMediaValidation.js
//
// Prompt-Media Match Validation — describes the seller's uploaded image/video
// via GPT-4o Vision, embeds that description + the prompt text (OpenAI
// text-embedding-3-small), and scores their cosine similarity 0-100. The
// score routes the prompt into approved / pending_review / flagged, which
// gates marketplace visibility (see GET /others in routes/promptRoutes.js)
// until an admin reviews it via routes/adminPromptValidation.js.
//
// Follows the existing raw-fetch OpenAI convention used elsewhere in this
// codebase (e.g. memory/memoryRetriever.js) — no `openai` SDK dependency.

const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const Prompt = require("../models/Prompt");
const Notification = require("../models/Notification");
const { notifyAdmins } = require("./notifyAdmins");

const VISION_MODEL = process.env.OPENAI_VISION_MODEL || "gpt-4o";
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

/* Auto-approve at 70, not 80.
 *
 * The score is a cosine similarity between two embeddings scaled to 0-100
 * (see computeMatchScore), and that scale does not behave like a percentage:
 * for text-embedding-3-small, two texts that genuinely describe the same thing
 * land around 45-65, and 80+ effectively requires the seller's prompt and the
 * vision description to be worded almost identically — which never happens,
 * because one is marketing copy and the other is a flat list of what is visible
 * in four frames. At 80 nearly everything fell short of auto-approval and the
 * marketplace filled with prompts waiting on a human.
 *
 * Env-overridable so this can be retuned against real numbers without a
 * deploy — the right threshold is the one a labelled set of genuine and
 * deliberately-mismatched pairs separates at, not a number picked in advance.
 */
const APPROVE_THRESHOLD = Number(process.env.MEDIA_MATCH_APPROVE_THRESHOLD) || 70;
const REVIEW_THRESHOLD = Number(process.env.MEDIA_MATCH_REVIEW_THRESHOLD) || 60;

// ── ffmpeg binaries — same optional-static-binary fallback as addTokunIntro.js ──
let FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";
let FFPROBE = process.env.FFPROBE_PATH || "ffprobe";
try {
  const ffs = require("ffmpeg-static");
  if (ffs) FFMPEG = ffs;
  const ffp = require("ffprobe-static");
  if (ffp?.path) FFPROBE = ffp.path;
} catch (_) {
  /* packages optional — system ffmpeg/ffprobe on PATH used instead */
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args);
    let stderr = "";
    p.stderr.on("data", (d) => (stderr += d.toString()));
    p.on("error", reject);
    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}: ${stderr.slice(-500)}`));
    });
  });
}

function probeDuration(filePath) {
  return new Promise((resolve, reject) => {
    const args = ["-v", "error", "-show_entries", "format=duration", "-of", "json", filePath];
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
        const duration = Math.max(0.5, parseFloat(parsed.format?.duration || "0") || 0.5);
        resolve({ duration });
      } catch (e) {
        reject(e);
      }
    });
  });
}

function tmpFile(ext) {
  return path.join(os.tmpdir(), `tokun-mediacheck-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
}

function extractFrame(inputPath, timestampSeconds, outputPath) {
  const args = [
    "-y", "-hide_banner", "-loglevel", "error",
    "-ss", String(Math.max(0, timestampSeconds)),
    "-i", inputPath,
    "-frames:v", "1", "-q:v", "2",
    outputPath,
  ];
  return run(FFMPEG, args);
}

// Downloads the video, extracts 4 evenly-spaced frames (start, ~33%, ~66%,
// end), returns them as base64 data URIs (no need to host them anywhere —
// GPT-4o Vision accepts inline base64 images directly).
async function extractVideoKeyFrames(videoUrl) {
  const videoPath = tmpFile("mp4");
  const framePaths = [];

  try {
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new Error(`Failed to download video for validation: ${videoRes.status}`);
    const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
    fs.writeFileSync(videoPath, videoBuffer);

    const { duration } = await probeDuration(videoPath);
    const timestamps = [
      Math.min(0.1, duration / 2),
      duration * 0.33,
      duration * 0.66,
      Math.max(duration - 0.2, duration * 0.9),
    ];

    const frames = [];
    for (const ts of timestamps) {
      const framePath = tmpFile("jpg");
      framePaths.push(framePath);
      await extractFrame(videoPath, ts, framePath);
      const frameBuffer = fs.readFileSync(framePath);
      frames.push(`data:image/jpeg;base64,${frameBuffer.toString("base64")}`);
    }
    return frames;
  } finally {
    try { fs.existsSync(videoPath) && fs.unlinkSync(videoPath); } catch (_) {}
    framePaths.forEach((p) => {
      try { fs.existsSync(p) && fs.unlinkSync(p); } catch (_) {}
    });
  }
}

async function describeImageWithVision(imageUrlOrDataUri) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY missing");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content:
            "You objectively describe the visual content of an image in 2-3 factual sentences — concrete subjects, actions, setting. Do not speculate about anything not visible.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Describe exactly what is shown in this image." },
            { type: "image_url", image_url: { url: imageUrlOrDataUri } },
          ],
        },
      ],
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `OpenAI vision request failed: ${res.status}`);
  }
  return data.choices?.[0]?.message?.content?.trim() || "";
}

// Describes a video by describing 4 key frames individually, then joining
// them into one combined description string (per spec — no extra
// summarization call, just a labeled join).
async function describeVideoWithVision(videoUrl) {
  const frames = await extractVideoKeyFrames(videoUrl);
  const labels = ["start", "~33%", "~66%", "end"];

  const descriptions = [];
  for (let i = 0; i < frames.length; i++) {
    const desc = await describeImageWithVision(frames[i]);
    descriptions.push(`Frame (${labels[i] || i}): ${desc}`);
  }
  return descriptions.join("\n");
}

async function getEmbedding(text) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY missing");
  }

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: String(text || "").slice(0, 8000), // stay well under the model's token limit
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `OpenAI embeddings request failed: ${res.status}`);
  }
  return data.data[0].embedding;
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// text-embedding-3-small similarities for genuinely related text are
// virtually always in [0,1] — scaling that range directly to [0,100] (rather
// than the theoretical [-1,1] → [0,100] remap) keeps the thresholds below
// meaningful instead of compressed into the upper half of the scale.
async function computeMatchScore(aiDescription, promptText) {
  const [descEmbedding, promptEmbedding] = await Promise.all([
    getEmbedding(aiDescription),
    getEmbedding(promptText),
  ]);
  const similarity = cosineSimilarity(descEmbedding, promptEmbedding);
  return Math.max(0, Math.min(100, Math.round(similarity * 100)));
}

function statusForScore(score) {
  if (score >= APPROVE_THRESHOLD) return "approved";
  if (score >= REVIEW_THRESHOLD) return "pending_review";
  return "flagged";
}

// Orchestrator — only needs a promptId, so it's reusable both for the
// fire-and-forget call right after upload and for an admin "re-validate"
// action later. Never throws — failures land the prompt in pending_review
// (safe default: queue for a human rather than silently auto-approving or
// leaving the seller's upload stuck forever).
async function runPromptMediaValidation(promptId) {
  const prompt = await Prompt.findById(promptId);
  if (!prompt) return;

  try {
    const attachmentType = prompt.attachment?.type;
    const attachmentUrl = prompt.attachment?.path;
    if (!attachmentUrl) throw new Error("Prompt has no attachment to validate");

    const aiDescription =
      attachmentType === "video"
        ? await describeVideoWithVision(attachmentUrl)
        : await describeImageWithVision(attachmentUrl);

    const score = await computeMatchScore(aiDescription, prompt.promptText);
    const status = statusForScore(score);

    prompt.mediaValidation.status = status;
    prompt.mediaValidation.score = score;
    prompt.mediaValidation.aiDescription = aiDescription;
    prompt.mediaValidation.checkedAt = new Date();
    prompt.mediaValidation.error = null;
    await prompt.save();

    /* Both of these need a human, and both must reach an admin.
       This used to fire for "flagged" only. "pending_review" — the middling
       score, and the fallback the catch block below uses — went into the queue
       with nobody told it was there. Video uploads land in it far more often
       than images do (a video has to be sampled into frames first, which is
       another way for the check to come back inconclusive), which is why video
       reviews in particular looked like they never arrived. */
    if (status === "flagged" || status === "pending_review") {
      const isFlagged = status === "flagged";

      await Notification.create({
        receiverUserId: prompt.userId,
        type: "PROMPT_MEDIA_REVIEW",
        promptId: prompt._id,
        message: isFlagged
          ? `Your prompt "${prompt.title}" is under review — the uploaded media doesn't closely match your prompt text. Our team will take a look shortly.`
          : `Your prompt "${prompt.title}" is being checked by our team before it goes live. We'll let you know as soon as it's approved.`,
        meta: { score, mediaValidationStatus: status },
      });

      await notifyAdmins({
        type: isFlagged ? "ADMIN_PROMPT_FLAGGED" : "ADMIN_PROMPT_REVIEW",
        promptId: prompt._id,
        message: isFlagged
          ? `"${prompt.title}" was auto-flagged by media validation (score ${score}/100) — needs review.`
          : `"${prompt.title}" needs a manual check (score ${score}/100 — inconclusive).`,
        meta: { score, mediaValidationStatus: status, mediaType: attachmentType || "unknown" },
      }).catch((err) => console.error("Admin review-notification failed:", err.message));
    }
  } catch (err) {
    console.error("Prompt media validation failed:", promptId?.toString?.(), err.message);
    prompt.mediaValidation.status = "pending_review";
    prompt.mediaValidation.checkedAt = new Date();
    prompt.mediaValidation.error = err.message;
    try {
      await prompt.save();
    } catch (saveErr) {
      console.error("Failed to persist media validation failure state:", saveErr.message);
    }

    /* The pipeline itself broke — an unreachable file, an ffmpeg failure, an
       OpenAI outage. The upload is now parked waiting for a human and, before
       this, nobody was told. That is the case most likely to strand a seller
       indefinitely, so it is the one that most needs to reach an admin. */
    await notifyAdmins({
      type: "ADMIN_PROMPT_REVIEW",
      promptId: prompt._id,
      message: `"${prompt.title}" could not be auto-checked (${err.message}) — needs a manual review.`,
      meta: { mediaValidationStatus: "pending_review", error: err.message },
    }).catch((notifyErr) =>
      console.error("Admin review-notification failed:", notifyErr.message)
    );
  }
}

module.exports = {
  runPromptMediaValidation,
  computeMatchScore,
  getEmbedding,
  cosineSimilarity,
  describeImageWithVision,
  describeVideoWithVision,
  extractVideoKeyFrames,
  statusForScore,
};
