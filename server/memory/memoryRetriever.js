/**
 * server/memory/memoryRetriever.js
 *
 * Decides, per incoming request, whether any stored memory is relevant â and
 * if so, formats it into a compact block for injection into the system prompt.
 *
 * Cost-conscious by design:
 *   - Zero memory stored for this user  -> return null immediately, no LLM call.
 *   - 1-2 items stored                  -> skip the relevance LLM call, just
 *                                          include everything (cheaper & the
 *                                          judgment call barely matters at
 *                                          this scale).
 *   - 3+ items stored                   -> one cheap gpt-4o-mini relevance
 *                                          call picks which are relevant to
 *                                          THIS prompt, so unrelated projects
 *                                          don't bleed into context (e.g. the
 *                                          user's book project shouldn't show
 *                                          up when they ask about their SaaS).
 *
 * This is the piece Section 18 Phase 4 eventually upgrades to embeddings/
 * vector search â the function signature below is deliberately stable so
 * that swap doesn't ripple into index.js or promptBuilder.js later.
 */

const { getAllMemoriesForUser } = require("./memoryStore");

const RELEVANCE_MODEL = process.env.OPENAI_MEMORY_MODEL || "gpt-4o-mini";

async function openaiChat({ model, messages, max_tokens }) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model, messages, max_tokens, response_format: { type: "json_object" } }),
  });
  return res.json();
}
const RELEVANCE_THRESHOLD_COUNT = 3;

function formatProjectLine(p) {
  const bits = [`- [${p._id}] ${p.displayName} (${p.projectType})`, p.summary || ""];
  const decisionCount = (p.decisions || []).length;
  if (decisionCount) bits.push(`(${decisionCount} recorded decision${decisionCount > 1 ? "s" : ""})`);
  return bits.filter(Boolean).join(" â ");
}

/**
 * Renders a selected subset of memories into the exact text block that gets
 * injected into the system prompt.
 */
function renderMemoryBlock({ projects = [], preferences, longTerm = [] }) {
  const sections = [];

  if (projects.length) {
    sections.push(
      "Known ongoing projects for this user:\n" +
        projects
          .map(
            (p) =>
              `- ${p.displayName} (${p.projectType}): ${p.summary || "no summary yet"}` +
              (Object.keys(p.details || {}).length
                ? ` | Details: ${JSON.stringify(p.details)}`
                : "") +
              ((p.decisions || []).length
                ? ` | Recent decisions: ${p.decisions
                    .slice(-3)
                    .map((d) => d.text)
                    .join("; ")}`
                : "")
          )
          .join("\n")
    );
  }

  if (preferences && Object.values(preferences).some(Boolean)) {
    const prefBits = [];
    if (preferences.tone) prefBits.push(`tone: ${preferences.tone}`);
    if (preferences.outputFormat) prefBits.push(`output format: ${preferences.outputFormat}`);
    if (preferences.language) prefBits.push(`language: ${preferences.language}`);
    if (preferences.writingStyleNotes) prefBits.push(`style notes: ${preferences.writingStyleNotes}`);
    if (prefBits.length) sections.push(`Known user preferences: ${prefBits.join("; ")}`);
  }

  if (longTerm.length) {
    sections.push(
      "Other known facts about this user:\n" +
        longTerm.map((f) => `- ${f.label || f.key}: ${f.value}`).join("\n")
    );
  }

  if (!sections.length) return null;

  return (
    "USER MEMORY CONTEXT (from prior sessions â use only if relevant to the current request; " +
    "do not force it in if it doesn't apply):\n" +
    sections.join("\n\n")
  );
}

function safeParseJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return null;
  }
}

async function pickRelevantProjectsViaLLM(userPrompt, projects) {
  try {
    const data = await openaiChat({
      model: RELEVANCE_MODEL,
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content:
            'Given a user\'s new request and a list of their known ongoing projects, return ONLY a JSON object {"relevantIds": ["id1", "id2"]} containing the ids of projects that are plausibly related to the new request. If none are related, return {"relevantIds": []}. Do not explain.',
        },
        {
          role: "user",
          content: `New request: "${userPrompt}"\n\nKnown projects:\n${projects
            .map(formatProjectLine)
            .join("\n")}`,
        },
      ],
    });
    const parsed = safeParseJson(data?.choices?.[0]?.message?.content);
    const ids = new Set((parsed?.relevantIds || []).map(String));
    return projects.filter((p) => ids.has(String(p._id)));
  } catch (err) {
    console.error("[memoryRetriever] relevance call failed, falling back to all projects:", err?.message || err);
    return projects; // fail open â better to include slightly-irrelevant context than silently drop memory
  }
}

/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.userPrompt
 * @returns {Promise<string|null>} formatted context block, or null if nothing relevant/stored
 */
async function getRelevantMemoryContext({ userId, userPrompt }) {
  if (!userId) return null;

  const { projects, preferences, longTerm } = await getAllMemoriesForUser(userId);

  if (!projects.length && !preferences && !longTerm.length) return null;

  let relevantProjects = projects;
  if (projects.length >= RELEVANCE_THRESHOLD_COUNT) {
    relevantProjects = await pickRelevantProjectsViaLLM(userPrompt, projects);
  }

  return renderMemoryBlock({ projects: relevantProjects, preferences, longTerm });
}

module.exports = { getRelevantMemoryContext, _internal: { renderMemoryBlock } };