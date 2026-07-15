"use strict";

const mongoose = require("mongoose");
const { STOP_WORDS, UNIVERSAL_FALLBACK_DOMAIN, DEEP_QUESTIONS } = require("./constants");
const { detectTutorialIntent, detectWebsiteBuildIntent } = require("./detection");
const { extractConstraints, perfStart, perfEnd } = require("./utils");

// perfStart/perfEnd imported from utils.js â single source of truth

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// MONGOOSE SCHEMAS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const DynamicDomainSchema = new mongoose.Schema({
  domainKey:  { type: String, unique: true, required: true, index: true },
  role:       { type: String, required: true },
  knowledge:  { type: String, required: true },
  tone:       { type: String, required: true },
  keywords:   [{ type: String }],
  usageCount: { type: Number, default: 1 },
  createdAt:  { type: Date, default: Date.now },
  updatedAt:  { type: Date, default: Date.now },
});
DynamicDomainSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days
const DynamicDomain = mongoose.models.DynamicDomain ||
  mongoose.model("DynamicDomain", DynamicDomainSchema);

const QuestionCacheSchema = new mongoose.Schema({
  cacheKey:  { type: String, unique: true, required: true, index: true },
  questions: [{ type: mongoose.Schema.Types.Mixed }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
QuestionCacheSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days
const QuestionCache = mongoose.models.QuestionCache ||
  mongoose.model("QuestionCache", QuestionCacheSchema);

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// IN-MEMORY CACHES
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const memoryCache        = new Map();
const questionMemoryCache = new Map();

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// KEY NORMALISATION
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function normalizeCacheKey(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2)
    .sort()
    .join("_")
    .slice(0, 100);
}

function normalizeQuestionKey(userText, domainId, subcategoryId) {
  const textPart = userText.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w)).sort().slice(0, 8).join("_");
  return `q_${domainId || "generic"}_${subcategoryId || "all"}_${textPart}`.slice(0, 120);
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// getCachedDomain / cacheDomain
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
async function getCachedDomain(userText) {
  const key = normalizeCacheKey(userText);

  if (memoryCache.has(key)) {
    const entry = memoryCache.get(key);
    if (Date.now() - entry.timestamp < 24 * 60 * 60 * 1000) return entry.domain;
    memoryCache.delete(key);
  }

  try {
    const doc = await DynamicDomain.findOne({ domainKey: key }).lean();
    if (doc) {
      const domain = {
        id: `cached_${doc._id}`,
        role: doc.role,
        knowledge: doc.knowledge,
        tone: doc.tone,
        keywords: doc.keywords || [],
        isDynamic: true,
        fromCache: true,
      };
      memoryCache.set(key, { domain, timestamp: Date.now() });
      DynamicDomain.updateOne({ _id: doc._id }, { $inc: { usageCount: 1 } }).catch(() => {});
      return domain;
    }
  } catch { /* MongoDB unavailable */ }

  return null;
}

async function cacheDomain(userText, domain) {
  const key = normalizeCacheKey(userText);
  memoryCache.set(key, { domain, timestamp: Date.now() });
  try {
    await DynamicDomain.findOneAndUpdate(
      { domainKey: key },
      { role: domain.role, knowledge: domain.knowledge, tone: domain.tone, keywords: domain.keywords || [], updatedAt: new Date() },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.warn("[skillEngine] Cache save failed (non-critical):", err.message);
  }
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// getDynamicDomain â AI-powered fallback for unrecognised domains
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
async function getDynamicDomain(userText) {
  if (!process.env.OPENAI_API_KEY) {
    // No LLM available â return universal fallback so Deep Mode is never blocked
    return UNIVERSAL_FALLBACK_DOMAIN;
  }

  const perfHandle = perfStart("getDynamicDomain (LLM fallback)");

  const cached = await getCachedDomain(userText);
  if (cached) {
    perfEnd(perfHandle);
    return cached;
  }


  try {
    const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
    // AbortController timeout: 10s â prevents silent hangs on slow/unresponsive OpenAI responses
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 10000);

    let response;
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        signal: controller.signal,
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.2,
          max_tokens: 500,
          messages: [
            {
              role: "system",
              content: `You are a domain classification and expert persona generator. Given a user's request, identify the most specific domain/category it belongs to and generate an expert persona for it.

Return STRICT JSON ONLY (no markdown, no preamble):
{
  "domainName": "short human-readable domain name (e.g. 'Travel Planning', 'Event Planning', 'AI Headshot Business')",
  "role": "specific expert role with years of experience - be concrete and vivid (50-80 words)",
  "knowledge": "5-7 domain-specific benchmarks with real numbers, each on a new line starting with '- '",
  "tone": "3-5 tone descriptors separated by commas",
  "keywords": ["5-8 relevant single-word or phrase keywords for this domain"]
}

Rules:
- Role must name the exact specialisation with years of experience
- Knowledge must have REAL benchmark numbers (not vague statements)
- Tone must be domain-appropriate
- Never return null or empty values`,
            },
            { role: "user", content: `User request: "${userText}"` },
          ],
          response_format: { type: "json_object" },
        }),
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const data    = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) { perfEnd(perfHandle); return null; }

    const parsed = JSON.parse(content);
    const dynamicDomain = {
      id:             `dynamic_${Date.now()}`,
      domainName:     parsed.domainName  || "General",
      role:           parsed.role        || "domain expert with deep experience",
      knowledge:      parsed.knowledge   || "",
      tone:           parsed.tone        || "professional, clear, immediately actionable",
      keywords:       parsed.keywords    || [],
      isDynamic:      true,
      criticalUnknowns: [],
    };

    await cacheDomain(userText, dynamicDomain);
    perfEnd(perfHandle);
    return dynamicDomain;

  } catch (err) {
    console.warn("[skillEngine] Dynamic domain generation failed:", err.message);
    perfEnd(perfHandle);
    // CRITICAL: Never return null â always fall back to universal domain so Deep Mode stays accessible
    return UNIVERSAL_FALLBACK_DOMAIN;
  }
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// generateDynamicSubcategories
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
async function generateDynamicSubcategories(domainName, userText) {
  const genericSubcategories = [
    { id: "strategy_planning",  label: "Strategy & Planning" },
    { id: "execution_roadmap",  label: "Execution Roadmap" },
    { id: "monetization",       label: "Monetization" },
    { id: "growth_marketing",   label: "Growth & Marketing" },
  ];

  if (!process.env.OPENAI_API_KEY) return genericSubcategories;

  try {
    const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
    // AbortController timeout: 8s â subcategory generation is lower priority, tighter budget
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 8000);

    let response;
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        signal: controller.signal,
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          max_tokens: 300,
          messages: [
            {
              role: "system",
              content: `Generate exactly 4 specific subcategories for a domain. Return STRICT JSON ARRAY only:
[{"id":"snake_case_id","label":"Human Readable Label"},{"id":"...","label":"..."},{"id":"...","label":"..."},{"id":"...","label":"..."}]
Rules:
- IDs must be snake_case, under 30 chars
- Labels must be 2-4 words, title case
- Subcategories must be SPECIFIC to the domain - not generic
- Think: what are the 4 most distinct sub-problems someone in this domain faces?`,
            },
            { role: "user", content: `Domain: "${domainName}"\nUser request: "${userText.slice(0, 150)}"` },
          ],
        }),
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const data    = await response.json();
    const raw     = data?.choices?.[0]?.message?.content?.trim() || "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed  = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length >= 2) {
      return parsed.slice(0, 4).filter(s => s.id && s.label);
    }
    return genericSubcategories;
  } catch (err) {
    console.warn("[skillEngine] generateDynamicSubcategories failed:", err.message);
    return genericSubcategories;
  }
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// generateDynamicCriticalUnknowns
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
async function generateDynamicCriticalUnknowns(domainName, userText) {
  const genericUnknowns = [
    "the specific goal and what success looks like in concrete, measurable terms",
    "current stage: idea, early research, MVP built, or already operating",
    "available budget or resources (time, money, team) for this project",
    "target audience: who this is for and their primary pain point",
    "biggest obstacle or risk that could prevent this from succeeding",
  ];

  if (!process.env.OPENAI_API_KEY) return genericUnknowns;

  try {
    const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
    // AbortController timeout: 8s â critical unknowns generation is lower priority, tighter budget
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 8000);

    let response;
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        signal: controller.signal,
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          max_tokens: 400,
          messages: [
            {
              role: "system",
              content: `Generate exactly 5 "critical unknowns" for a domain - the pieces of missing information that, if answered, would most change the advice given.

Return STRICT JSON ARRAY of 5 strings only:
["unknown 1 as a noun phrase","unknown 2","unknown 3","unknown 4","unknown 5"]

Rules:
- Each unknown is a noun phrase (NOT a question, NOT "what is X" - just "X")
- Examples: "target customer segment and their primary pain point", "available startup budget in local currency", "current stage: idea, early traction, or scaling"
- Must be SPECIFIC to this domain - not generic
- These are used to generate follow-up questions, so they must be genuinely unknown from the request`,
            },
            { role: "user", content: `Domain: "${domainName}"\nUser request: "${userText.slice(0, 200)}"` },
          ],
        }),
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const data    = await response.json();
    const raw     = data?.choices?.[0]?.message?.content?.trim() || "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed  = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length >= 3) {
      return parsed.slice(0, 5).filter(u => typeof u === "string" && u.length > 5);
    }
    return genericUnknowns;
  } catch (err) {
    console.warn("[skillEngine] generateDynamicCriticalUnknowns failed:", err.message);
    return genericUnknowns;
  }
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// _fallbackQuestions
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function _fallbackQuestions(domain) {
  const unknowns = domain?.criticalUnknowns || [];
  if (unknowns.length === 0) return DEEP_QUESTIONS["generic"];
  return unknowns.slice(0, 3).map((u, i) => ({
    id:          `fallback_q${i + 1}`,
    question:    u.charAt(0).toUpperCase() + u.slice(1) + "?",
    type:        "text",
    placeholder: "Your answer here...",
  }));
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// shouldSkipQuestions
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function shouldSkipQuestions(userText, domain, extractedConstraints) {
  const wordCount       = userText.trim().split(/\s+/).length;
  const constraintCount = Object.keys(extractedConstraints || {}).length;
  const criticalUnknowns = domain?.criticalUnknowns || [];

  // Never skip for universal fallback or dynamic domains â they benefit most from questions
  if (domain?.isUniversalFallback || domain?.isDynamic) {
    return { skip: false, reason: "" };
  }

  // Only skip if prompt is very detailed AND has many constraints detected
  if (wordCount >= 30 && constraintCount >= 4) {
    return { skip: true, reason: "Prompt is detailed enough â skipping question phase." };
  }

  if (criticalUnknowns.length > 0 && constraintCount >= 3) {
    const constraintValues = Object.values(extractedConstraints || {}).map(v => String(v).toLowerCase());
    const coveredCount = criticalUnknowns.filter(unknown => {
      const unknownWords = unknown.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      return unknownWords.some(w => constraintValues.some(v => v.includes(w)));
    }).length;
    // Only skip if 80%+ of critical unknowns are covered
    if (coveredCount >= Math.ceil(criticalUnknowns.length * 0.8)) {
      return { skip: true, reason: "Most critical unknowns already addressed in prompt." };
    }
  }

  return { skip: false, reason: "" };
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// generateQuestionsWithLLM
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
async function generateQuestionsWithLLM(userText, domain, subcategoryLabel) {
  if (!process.env.OPENAI_API_KEY) return _fallbackQuestions(domain);

  const perfHandle = perfStart("generateQuestionsWithLLM");

  const isTutorial  = detectTutorialIntent(userText);
  const isWebsite   = detectWebsiteBuildIntent(userText);
  const constraints = extractConstraints(userText);

  const alreadyKnown = Object.entries(constraints)
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
    .join("\n");

  const domainCriticalUnknowns = domain?.criticalUnknowns || [];
  const criticalUnknownsList = domainCriticalUnknowns.length > 0
    ? domainCriticalUnknowns.map((u, i) => `${i + 1}. ${u}`).join("\n")
    : "No domain-specific critical unknowns â generate the most impactful general questions.";

  const systemPrompt = `You generate targeted Deep Mode follow-up questions for an AI prompt-optimisation tool.
Your job: identify which CRITICAL UNKNOWNS are still unanswered and ask ONLY those.

USER REQUEST: "${userText}"
DOMAIN: ${domain?.id?.replace(/_/g, " ") || "General"} (${domain?.role || "expert"})
SUBCATEGORY FOCUS: ${subcategoryLabel || "none"}
${isTutorial ? "INTENT: Technical tutorial â prioritise technology choice, skill level, mini-project scope." : ""}
${isWebsite  ? "INTENT: Build a website/platform â prioritise tech stack, features, monetisation, launch timeline." : ""}
${domain?.id === "ai_image_gen"    ? "INTENT: AI image generation â prioritise platform/aspect ratio, tool experience level, specific problem with current outputs, aesthetic reference." : ""}
${domain?.id === "travel_planning" ? "INTENT: Travel planning â prioritise destination, duration, group size, and total budget." : ""}
${domain?.id === "event_planning"  ? "INTENT: Event planning â prioritise event type, guest count, budget, and date/timeline." : ""}

WHAT WE ALREADY KNOW â DO NOT ASK ABOUT THESE:
${alreadyKnown || "Nothing detected yet."}

CRITICAL UNKNOWNS FOR THIS DOMAIN (ask unfilled ones only):
${criticalUnknownsList}

RULES:
1. Cross-reference ALREADY KNOWN. Skip anything already answered.
2. Select the 3 most impactful unfilled unknowns â the ones most changing the advice.
3. Hard cap: 3 questions maximum.
4. Questions must be specific to THIS domain â not generic.
5. For select-type: 3â5 realistic, domain-specific options (not "Option A/B/C").
6. For text-type: concrete placeholder showing what a great answer looks like.
7. Never ask "Tell us more" or "Any other context?" â every question targets a specific gap.

Return JSON ARRAY ONLY (no wrapper, no markdown fences):
[
  { "id": "snake_case_id", "question": "Question text", "type": "text", "placeholder": "e.g. concrete example" },
  { "id": "another_id",   "question": "Question text",  "type": "select", "options": ["A", "B", "C"] }
]`;

  try {
    const fetchFn = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
    // AbortController timeout: 10s â prevents silent hangs on slow/unresponsive OpenAI responses
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 10000);

    let response;
    try {
      response = await fetchFn("https://api.openai.com/v1/chat/completions", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        signal:  controller.signal,
        body: JSON.stringify({
          model: "gpt-4o-mini", temperature: 0.3, max_tokens: 800,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user",   content: userText },
          ],
        }),
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const data      = await response.json();
    const raw       = data?.choices?.[0]?.message?.content?.trim() || "";
    const cleaned   = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const questions = JSON.parse(cleaned);

    if (!Array.isArray(questions) || questions.length === 0) throw new Error("Empty or invalid question array");
    perfEnd(perfHandle);
    return questions.filter(q => q && q.id && q.question && q.type).slice(0, 3);

  } catch (err) {
    console.warn("[skillEngine] LLM question generation failed:", err.message);
    perfEnd(perfHandle);
    return _fallbackQuestions(domain);
  }
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// getDeepQuestions (async, DB-cached version used by server routes)
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
async function getDeepQuestions(userText, domainId, subcategoryId, subcategoryLabel) {
  const { DOMAINS } = require("./constants");
  const { detectDomain } = require("./detection");

  const domain = domainId
    ? DOMAINS.find(d => d.id === domainId) || null
    : detectDomain(userText);

  const extractedConstraints = extractConstraints(userText || "");
  const { skip, reason } = shouldSkipQuestions(userText, domain, extractedConstraints);
  if (skip) {
    return [];
  }

  const cacheKey = normalizeQuestionKey(userText || "", domainId, subcategoryId);

  if (questionMemoryCache.has(cacheKey)) {
    const entry = questionMemoryCache.get(cacheKey);
    if (Date.now() - entry.timestamp < 24 * 60 * 60 * 1000) return entry.questions;
    questionMemoryCache.delete(cacheKey);
  }

  try {
    const cached = await QuestionCache.findOne({ cacheKey }).lean();
    if (cached?.questions?.length > 0) {
      questionMemoryCache.set(cacheKey, { questions: cached.questions, timestamp: Date.now() });
      return cached.questions;
    }
  } catch { /* MongoDB unavailable */ }

  const questions = await generateQuestionsWithLLM(userText || "", domain, subcategoryLabel || null);

  questionMemoryCache.set(cacheKey, { questions, timestamp: Date.now() });
  try {
    await QuestionCache.findOneAndUpdate(
      { cacheKey },
      { questions, updatedAt: new Date() },
      { upsert: true, new: true }
    );
  } catch { /* non-critical */ }

  return questions;
}

module.exports = {
  getDynamicDomain,
  getCachedDomain,
  cacheDomain,
  generateDynamicSubcategories,
  generateDynamicCriticalUnknowns,
  generateQuestionsWithLLM,
  getDeepQuestions,
  shouldSkipQuestions,
  UNIVERSAL_FALLBACK_DOMAIN,
};