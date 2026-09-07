/**
 * Real token counting.
 *
 * ── What this replaces ──────────────────────────────────────────────────────
 *
 * Three different estimates were in play at once, and no two of them agreed:
 *
 *   services/llmService.ts   words × 1.3   (the live counter as you type)
 *   components/PromptInput   chars ÷ 4     (the before/after panel)
 *   routes /api/optimize     word counts   (metrics, which the UI ignored)
 *
 * So the number beside the box while you typed and the number in the result
 * panel were computed two different ways, and the reduction percentage the
 * server had already worked out was thrown away. On English prose the two
 * approximations land within a few percent of the truth and of each other,
 * which is why this went unnoticed. On anything else they do not:
 *
 *   "hello world"                      chars÷4 → 3    real → 2
 *   JSON, code, punctuation-dense text  chars÷4 under-counts badly; every
 *                                       brace, quote and operator is its own
 *                                       token where a word of prose is one
 *   Hindi, Arabic, CJK                  chars÷4 under-counts by 2–4×; scripts
 *                                       outside Latin cost several tokens per
 *                                       character
 *   Emoji                               one glyph can be 3–5 tokens
 *
 * A tool whose entire claim is "we cut your token count by up to 60%" cannot
 * measure that with a rule of thumb. This counts with the same BPE tables the
 * model itself uses, so the before, the after and the percentage are the real
 * numbers.
 *
 * ── Why the server and not the browser ──────────────────────────────────────
 *
 * The rank tables are large — a couple of megabytes per encoding. Shipping one
 * to every visitor to put a number next to a textarea is the wrong trade, so
 * the count is asked for over HTTP (see POST /api/tokens/count) and the client
 * keeps a rough estimate on screen only until the real one arrives.
 *
 * ── Encodings ───────────────────────────────────────────────────────────────
 *
 * Which table applies depends on the model, and getting it wrong is a silent
 * wrong answer rather than an error:
 *
 *   o200k_base   GPT-4o and o1 families — what this app actually calls
 *   cl100k_base  GPT-4, GPT-3.5, text-embedding-3
 *
 * Both are loaded lazily and only if asked for, so the common path costs one
 * table rather than two.
 */

/* Required on first use, not at module load. These are the multi-megabyte
   tables described above, and requiring both at boot would add them to every
   process that touches this file — including the ones that never count a
   token. */
let o200k = null;
let cl100k = null;

function o200kEncoder() {
  if (!o200k) o200k = require("gpt-tokenizer/encoding/o200k_base");
  return o200k;
}

function cl100kEncoder() {
  if (!cl100k) cl100k = require("gpt-tokenizer/encoding/cl100k_base");
  return cl100k;
}

/**
 * The encoding a model uses.
 *
 * Prefix matching rather than an exact list: OpenAI ships dated snapshots
 * ("gpt-4o-mini-2024-07-18") and a table of exact names goes stale the week
 * after it is written, falling through to the wrong encoding without saying so.
 *
 * o200k is the default for anything unrecognised, because it is what every
 * current model uses; an unknown name is far more likely to be a new model than
 * an old one.
 */
function encodingFor(model) {
  const m = String(model || "").toLowerCase();

  // Explicitly older families, which are still selectable in the UI.
  if (m.startsWith("gpt-4-") || m === "gpt-4") return "cl100k_base";
  if (m.startsWith("gpt-3.5")) return "cl100k_base";
  if (m.startsWith("text-embedding-ada")) return "cl100k_base";
  if (m.startsWith("text-embedding-3")) return "cl100k_base";

  return "o200k_base";
}

/**
 * How many tokens this text is, for this model.
 *
 * Returns 0 for empty input rather than throwing — the live counter calls this
 * on every pause, including the pause after clearing the box.
 *
 * @param {string} text
 * @param {string} [model]
 * @returns {{tokens: number, encoding: string}}
 */
function countTokens(text, model) {
  const str = typeof text === "string" ? text : String(text ?? "");
  const encoding = encodingFor(model);

  if (!str) return { tokens: 0, encoding };

  const encoder = encoding === "cl100k_base" ? cl100kEncoder() : o200kEncoder();
  return { tokens: encoder.encode(str).length, encoding };
}

/** Words, counted the one way, so nothing else has to guess at it. */
function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Before, after, and what came off — the numbers the optimiser's whole claim
 * rests on.
 *
 * `reductionPercent` is deliberately clamped at zero. A negative reduction is
 * an optimiser that made the text longer, and the route already retries and
 * then falls back to the user's own text when that happens — so a negative
 * number here would mean something upstream failed, and showing "-12% reduced"
 * is worse than showing nothing gained.
 */
function compare(originalText, optimizedText, model) {
  const before = countTokens(originalText, model);
  const after = countTokens(optimizedText, model);

  const saved = Math.max(0, before.tokens - after.tokens);
  const reductionPercent =
    before.tokens > 0 ? Math.round((saved / before.tokens) * 100) : 0;

  return {
    encoding: before.encoding,
    originalTokens: before.tokens,
    optimizedTokens: after.tokens,
    originalWordCount: countWords(originalText),
    optimizedWordCount: countWords(optimizedText),
    tokensSaved: saved,
    reductionPercent,
  };
}

module.exports = { countTokens, countWords, compare, encodingFor };
