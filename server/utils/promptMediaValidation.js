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
/* Cheap and small on purpose — extractVisualIntent below is a rewrite job, not
   a reasoning one, and it runs on every upload. */
const INTENT_MODEL = process.env.OPENAI_INTENT_MODEL || "gpt-4o-mini";

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

/* Fit the text to the model's limit WITHOUT dropping the end of it.
 *
 * This was `slice(0, 8000)` — the first 8000 characters and nothing else. For a
 * long, structured prompt that is the worst possible cut: sellers write the
 * mechanics first (setup, folder structure, commands, delivery format) and
 * describe what the thing should actually LOOK like at the bottom. So the one
 * passage the media can be compared against was the one passage thrown away,
 * and the score was computed against build instructions alone.
 *
 * Head and tail, with the middle marked as elided. */
const EMBED_CHAR_LIMIT = 8000;

function fitForEmbedding(text) {
  const s = String(text || "");
  /* The API rejects an empty string, and these now go up as one batch — an
     empty candidate would fail the whole request rather than just its own. A
     vision call that came back with nothing is the realistic way this happens. */
  if (!s.trim()) return " ";
  if (s.length <= EMBED_CHAR_LIMIT) return s;
  const half = Math.floor((EMBED_CHAR_LIMIT - 20) / 2);
  return `${s.slice(0, half)}\n…\n${s.slice(-half)}`;
}

/** One embedding. Kept as-is for callers that only have a single string. */
async function getEmbedding(text) {
  const [vector] = await getEmbeddings([text]);
  return vector;
}

/* Several at once. The embeddings endpoint takes an array, so scoring a prompt
   section by section costs one request rather than one per section. */
async function getEmbeddings(texts) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY missing");
  }

  const input = texts.map(fitForEmbedding);

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `OpenAI embeddings request failed: ${res.status}`);
  }
  // The API may return them out of order; `index` is authoritative.
  return data.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

/**
 * What the finished thing should LOOK like, pulled out of the instructions.
 *
 * This is the fix for the whole class of prompt that was being flagged unfairly.
 *
 * The score is a cosine similarity between the vision model's description of the
 * uploaded media and the seller's prompt text. That is only a fair comparison
 * when the prompt is mostly a description of an image. It is not fair at all for
 * a long production prompt — a motion-graphics brief, a UI build, a code
 * deliverable — where the text is 80% mechanics: scaffolding steps, folder
 * layouts, npm scripts, codec flags, schema definitions, README bullets. An
 * embedding averages over everything it is given, so that prompt's vector sits
 * in "software tooling" space while the media's sits in "dark dashboard
 * animation" space. The two barely overlap, the score collapses, and a perfectly
 * honest upload gets flagged for a mismatch that isn't there.
 *
 * So the prompt is first reduced to its visual claim — what a viewer would see —
 * and the media is compared against THAT. Same register as the vision
 * description on the other side of the comparison, which is the point: like
 * against like.
 *
 * Returns "" on any failure. The caller treats that as "no intent available"
 * and falls back to the other bases, so a missing key or an outage costs
 * accuracy, never the upload.
 */
async function extractVisualIntent(promptText) {
  const text = String(promptText || "").trim();
  if (!text) return "";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: INTENT_MODEL,
        max_tokens: 220,
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "You read a creative or technical brief and state, in 2-4 factual sentences, what the finished result would LOOK like on screen — concrete subjects, colours, composition, motion, setting. " +
              "Ignore everything about how it is built or delivered: setup steps, file and folder structure, libraries, commands, flags, formats, resolutions, licences, pricing. " +
              "Describe only what a viewer would see. If the brief describes no visual result at all, reply with an empty string.",
          },
          { role: "user", content: fitForEmbedding(text) },
        ],
      }),
    });

    const data = await res.json();
    if (!res.ok) return "";
    return data.choices?.[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.error("Visual-intent extraction failed:", err.message);
    return "";
  }
}

/**
 * The prompt in pieces, so one strongly-visual passage can be found in a long
 * document.
 *
 * The safety net for when extractVisualIntent is unavailable (no key, an outage,
 * a brief it declined to summarise). Splitting on blank lines and numbered
 * headings is enough: sellers already separate "how to build it" from "what it
 * looks like" that way, and the paragraph that describes the look then gets to
 * be compared on its own instead of being averaged into the commands around it.
 *
 * Short fragments are dropped — a line like "3. STRUCTURE" embeds to noise and
 * would only add a spurious low score to the pool.
 */
function promptSections(text) {
  const MIN_CHARS = 120;
  const MAX_SECTIONS = 12;

  return String(text || "")
    .split(/\n\s*\n|\n(?=\s*\d+[.)]\s+[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= MIN_CHARS)
    .slice(0, MAX_SECTIONS);
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
const toScore = (similarity) => Math.max(0, Math.min(100, Math.round(similarity * 100)));

/**
 * How well does the uploaded media match what the seller said they were selling?
 *
 * Three ways of asking, and the best answer wins:
 *
 *   whole    the full prompt text against the description. What this always
 *            did, kept so nothing that scored well before scores worse now.
 *   intent   the prompt reduced to its visual claim (extractVisualIntent).
 *            The comparison that is actually fair for an instruction-heavy
 *            brief, and normally the winner for one.
 *   section  the single best-matching passage of the prompt. The fallback when
 *            intent extraction is unavailable, and the thing that rescues a
 *            long document with one good visual paragraph in it.
 *
 * The MAXIMUM rather than an average, deliberately. Each basis is a different
 * way of asking one yes/no question — "is this media what this prompt is
 * about?" — and one convincing yes is a yes. Averaging would let the two weaker
 * framings drag down a match the third had already established, which is the
 * exact failure being fixed here: a genuine upload marked down for the parts of
 * its prompt that were never about the picture.
 *
 * It cannot make a real mismatch pass. Every basis is still a similarity against
 * the same media description, so media that has nothing to do with the prompt
 * scores low on all three — the extra bases give an honest prompt more ways to
 * be recognised, not a dishonest one a way through.
 *
 * Returns the score alone (unchanged signature); scoreMatchDetail below is the
 * same computation with the workings kept.
 */
async function computeMatchScore(aiDescription, promptText) {
  return (await scoreMatchDetail(aiDescription, promptText)).score;
}

async function scoreMatchDetail(aiDescription, promptText) {
  const intent = await extractVisualIntent(promptText);
  const sections = promptSections(promptText);

  /* One request for all of it. The candidates are positional — index 0 is the
     media description, 1 is the whole prompt, then the intent (when there is
     one), then each section. */
  const candidates = [aiDescription, promptText];
  if (intent) candidates.push(intent);
  candidates.push(...sections);

  const vectors = await getEmbeddings(candidates);
  const mediaVector = vectors[0];
  const simTo = (i) => cosineSimilarity(mediaVector, vectors[i]);

  const bases = { whole: toScore(simTo(1)) };
  let cursor = 2;
  if (intent) bases.intent = toScore(simTo(cursor++));
  if (sections.length) {
    bases.section = Math.max(...sections.map((_, i) => toScore(simTo(cursor + i))));
  }

  const score = Math.max(...Object.values(bases));
  // Which framing carried it — recorded so the thresholds can be retuned
  // against what actually happens rather than against a guess.
  const basis = Object.keys(bases).find((k) => bases[k] === score) || "whole";

  return { score, basis, bases, intent };
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

    const { score, basis, bases } = await scoreMatchDetail(aiDescription, prompt.promptText);
    const status = statusForScore(score);

    prompt.mediaValidation.status = status;
    prompt.mediaValidation.score = score;
    prompt.mediaValidation.aiDescription = aiDescription;
    prompt.mediaValidation.checkedAt = new Date();
    prompt.mediaValidation.error = null;
    // Which comparison produced the score, and what the others said. The only
    // way to retune the thresholds against real uploads instead of guessing —
    // see scoreMatchDetail.
    prompt.mediaValidation.scoreBasis = basis;
    prompt.mediaValidation.scoreBreakdown = bases;
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
  scoreMatchDetail,
  extractVisualIntent,
  promptSections,
  getEmbedding,
  getEmbeddings,
  cosineSimilarity,
  describeImageWithVision,
  describeVideoWithVision,
  extractVideoKeyFrames,
  statusForScore,
};
