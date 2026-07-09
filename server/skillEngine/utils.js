"use strict";

const {
  STOP_WORDS,
  KNOWN_LOCATIONS,
  AUDIENCE_PATTERNS,
  HIGH_INTENT_WORDS,
} = require("./constants");

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// PERFORMANCE LOGGING â single source of truth (imported by promptBuilder + dynamicDomain)
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function perfStart(label) {
  return { label, start: process.hrtime.bigint() };
}
function perfEnd(handle) {
  const ns  = process.hrtime.bigint() - handle.start;
  const ms  = Number(ns) / 1_000_000;
  const sec = (ms / 1000).toFixed(3);
  console.log(`â±  [PERF] ${handle.label}: ${ms.toFixed(1)}ms (${sec}s)`);
  return { ms, sec };
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// TEXT HELPERS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function countHighIntentWords(text) {
  const words = text.toLowerCase().split(/\s+/);
  return words.filter(w => HIGH_INTENT_WORDS.has(w)).length;
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// LOCATION DETECTION
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function detectLocation(text) {
  const lower = text.toLowerCase();
  for (const loc of KNOWN_LOCATIONS) {
    const pattern = new RegExp(`\\b${loc.replace(/\s+/g, "\\s+")}\\b`, "i");
    if (pattern.test(lower)) return loc;
  }
  // Fallback: look for "in <City>" pattern
  const inMatch = lower.match(/\bin\s+([a-z][a-z\s]{2,20}?)(?:\s|,|$)/);
  if (inMatch) {
    const candidate = inMatch[1].trim();
    if (candidate.length > 2 && !STOP_WORDS.has(candidate)) return candidate;
  }
  return null;
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// AUDIENCE DETECTION
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function detectAudience(text) {
  for (const pattern of AUDIENCE_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// BUDGET DETECTION
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function detectBudget(text) {
  const budgetPatterns = [
    /(?:budget|spend|invest|cost|price|invest(?:ment)?)\s+(?:of\s+)?(?:around\s+|about\s+|~)?([\$â¹Â£â¬]?\s*[\d,]+\s*(?:k|K|L|lac|lakh|cr|crore|M|million|thousand)?)/i,
    /([\$â¹Â£â¬]\s*[\d,]+\s*(?:k|K|L|lac|lakh|cr|crore|M|million|thousand)?)\s+(?:budget|spend|investment)/i,
    /(?:under|below|within|max(?:imum)?)\s+([\$â¹Â£â¬]?\s*[\d,]+\s*(?:k|K|L|lac|lakh|cr|crore|M|million|thousand)?)/i,
  ];
  for (const p of budgetPatterns) {
    const m = text.match(p);
    if (m) return m[1].trim();
  }
  return null;
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// TIMELINE DETECTION
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function detectTimeline(text) {
  const timelinePatterns = [
    /(?:launch(?:ing)?|ship(?:ping)?|go\s+live|open(?:ing)?|ready|deadline|by)\s+(?:in\s+)?(\d+\s+(?:day|week|month|year)s?)/i,
    /(\d+\s+(?:day|week|month|year)s?)\s+(?:timeline|deadline|window|runway)/i,
    /(?:within|in)\s+(\d+\s+(?:day|week|month|year)s?)/i,
    /by\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /(?:q[1-4])\s+(\d{4})/i,
  ];
  for (const p of timelinePatterns) {
    const m = text.match(p);
    if (m) return m[1].trim();
  }
  return null;
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// TEAM SIZE DETECTION
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function detectTeamSize(text) {
  const m = text.match(/\b(solo|alone|just\s+me|one\s+person|(\d+)\s+(?:person|people|developer|engineer|founder|co-founder)s?(?:\s+team)?)\b/i);
  if (m) return m[0];
  return null;
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// EXTRACT CONSTRAINTS (composite)
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function extractConstraints(text) {
  const constraints = {};

  const location = detectLocation(text);
  if (location) constraints.location = location;

  const audience = detectAudience(text);
  if (audience) constraints.audience = audience;

  const budget = detectBudget(text);
  if (budget) constraints.budget = budget;

  const timeline = detectTimeline(text);
  if (timeline) constraints.timeline = timeline;

  const teamSize = detectTeamSize(text);
  if (teamSize) constraints.teamSize = teamSize;

  // Guest count (event planning)
  const guestMatch = text.match(/\b(\d+)\s*(?:guests?|people|attendees?|pax)\b/i);
  if (guestMatch) constraints.guestCount = parseInt(guestMatch[1], 10);

  // Experience level
  const expMatch = text.match(/\b(beginner|intermediate|advanced|expert|senior|junior|no experience|new to)\b/i);
  if (expMatch) constraints.experienceLevel = expMatch[0];

  // Tech stack mentions
  const techKeywords = ["next.js","nextjs","react","vue","nuxt","supabase","firebase","node","python","flutter","swift","django","laravel","postgres","mongodb","redis","typescript","tailwind"];
  const detectedTech = techKeywords.filter(t => text.toLowerCase().includes(t));
  if (detectedTech.length > 0) constraints.techStack = detectedTech;

  return constraints;
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// SHOULD SUGGEST DEEP MODE
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function shouldSuggestDeepMode(text, constraints = {}) {
  const wordCount       = text.trim().split(/\s+/).length;
  const highIntentCount = countHighIntentWords(text);
  const constraintCount = Object.keys(constraints).length;

  // Short vague query â deep mode likely helpful
  if (wordCount < 15 && highIntentCount >= 1) return true;

  // Medium query with few constraints detected
  if (wordCount < 40 && constraintCount < 2) return true;

  // Query has high intent words but very little detail
  if (highIntentCount >= 2 && constraintCount < 1) return true;

  return false;
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// PROMPT QUALITY VALIDATORS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function validatePromptSections(prompt, requiredSections) {
  const missing = requiredSections.filter(s => !prompt.includes(s));
  return { valid: missing.length === 0, missing };
}

function estimateTokenCount(text) {
  // Rough estimate: ~4 chars per token
  return Math.ceil(text.length / 4);
}

function truncateToTokenLimit(text, maxTokens = 3000) {
  const estimatedTokens = estimateTokenCount(text);
  if (estimatedTokens <= maxTokens) return text;
  const charLimit = maxTokens * 4;
  return text.slice(0, charLimit) + "\n\n[Prompt truncated to stay within token limits]";
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// FORMATTING HELPERS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function titleCase(str) {
  return str
    .toLowerCase()
    .split(/[\s_-]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatConstraintSummary(constraints) {
  if (!constraints || Object.keys(constraints).length === 0) return "";
  const lines = [];
  if (constraints.location)        lines.push(`Location: ${constraints.location}`);
  if (constraints.audience)        lines.push(`Target audience: ${constraints.audience}`);
  if (constraints.budget)          lines.push(`Budget: ${constraints.budget}`);
  if (constraints.timeline)        lines.push(`Timeline: ${constraints.timeline}`);
  if (constraints.teamSize)        lines.push(`Team: ${constraints.teamSize}`);
  if (constraints.guestCount)      lines.push(`Guest count: ${constraints.guestCount}`);
  if (constraints.experienceLevel) lines.push(`Experience: ${constraints.experienceLevel}`);
  if (constraints.techStack?.length) lines.push(`Tech stack: ${constraints.techStack.join(", ")}`);
  return lines.join("\n");
}

module.exports = {
  tokenize,
  countHighIntentWords,
  detectLocation,
  detectAudience,
  detectBudget,
  detectTimeline,
  detectTeamSize,
  extractConstraints,
  shouldSuggestDeepMode,
  validatePromptSections,
  estimateTokenCount,
  truncateToTokenLimit,
  titleCase,
  formatConstraintSummary,
  perfStart,
  perfEnd,
};