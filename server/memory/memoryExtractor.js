/**
 * server/memory/memoryExtractor.js
 *
 * Runs AFTER a SmartGen response has already been sent to the user (fire-and-
 * forget from index.js â see INTEGRATION.md). Uses one cheap gpt-4o-mini call
 * with JSON mode to pull structured memory out of the interaction, then hands
 * it to memoryStore for upsert (dedup/merge, never blind-append).
 *
 * Deliberately conservative: if the user prompt doesn't contain anything
 * memory-worthy (e.g. "help me with marketing" with no new project info),
 * the extractor should return empty arrays and nothing gets written. This
 * is enforced via the prompt instructions below, not by heuristics here â
 * keep it that way, don't try to pre-filter with regex, it'll drift out of
 * sync the same way detectIntentCategory's regex list did.
 */

const {
  upsertProjectMemory,
  upsertPreferenceMemory,
  upsertLongTermFacts,
} = require("./memoryStore");

const EXTRACTOR_MODEL = process.env.OPENAI_MEMORY_MODEL || "gpt-4o-mini";

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

const EXTRACTION_SYSTEM_PROMPT = `You extract durable, reusable memory from a single user interaction with an AI prompt-optimization tool. You are NOT summarizing the conversation â you are deciding what's worth remembering for future, unrelated sessions.

Return ONLY a JSON object, no prose, no markdown fences, matching exactly this shape:

{
  "projects": [
    {
      "displayName": "string, human-friendly project/business/goal name",
      "projectType": "business" | "saas" | "book" | "interview_prep" | "startup" | "career" | "other",
      "summary": "1-3 sentence current-state summary of this project, written so it reads correctly on its own months later",
      "details": { "any": "relevant structured facts, e.g. industry, geography, stage, audience" },
      "newDecisions": ["short statements of any concrete decision or direction stated in THIS interaction only"]
    }
  ],
  "preferences": {
    "tone": "string or null",
    "outputFormat": "string or null",
    "language": "string or null",
    "preferredMode": "normal" | "skill" | "deep" | null,
    "writingStyleNotes": "string or empty"
  },
  "longTermFacts": [
    { "key": "short_snake_case_key", "value": "string", "label": "Human Readable Label" }
  ]
}

Rules:
- If nothing in this interaction is worth remembering long-term, return empty arrays/nulls for everything. Do NOT invent content to fill the shape.
- Only include a project if the user actually revealed something about a specific project/business/goal â not for generic requests unrelated to any project.
- "newDecisions" must ONLY contain things explicitly stated or clearly decided in this interaction, never inferred assumptions.
- Preferences should only be set if there's a real signal (explicit statement, or a clear repeated pattern) â do not guess from a single ambiguous cue.
- Keep summaries and facts free of PII beyond what the user already volunteered (business names, industry, etc. are fine).

CRITICAL â longTermFacts vs project "details" (this distinction matters a lot):
- "longTermFacts" is ONLY for facts about the USER as a person, true across ALL their projects: occupation, location, team size, years of experience, general working style. These get shown to the user in every future conversation regardless of topic.
- Any metric, benchmark, or target that belongs to ONE specific project (e.g. "YouTube CTR target: 4-10%", "target profit margin: 15%", "gross margin target: 55-65%") belongs in that project's "details" object, NEVER in "longTermFacts".
- Test before adding to longTermFacts: "Would this fact make sense to show the user in a conversation about a COMPLETELY DIFFERENT, unrelated project?" If no, it belongs in that project's "details" instead.
- When in doubt, prefer putting a fact in a project's "details" over "longTermFacts" â longTermFacts should rarely have more than 2-3 entries per user, ever.

CRITICAL â classifying the project correctly (common mistake to avoid):
- "User prompt" reflects what the user actually wants to build or do in the real world. This is the source of truth for "displayName", "projectType", and "summary".
- "Generated output" is SmartGen's own instructional system prompt telling ANOTHER model how to produce a deliverable (e.g. "create a comprehensive guide", "write a 2,000-word article", "produce a training plan"). This describes the FORMAT of the output, not the nature of the user's underlying project.
- Do NOT classify projectType as "book" just because the generated output describes writing a guide, article, or document. A user asking to "build a Shopify store" is running an e-commerce/business project â even though SmartGen's output happens to be phrased as a guide for them to follow. Only use "book" when the user's actual real-world goal (per the user prompt) IS writing a book or long-form publication.
- Test: "What is the user actually doing in the real world â running a business, building software, preparing for something, or writing a publication?" Answer based on the user prompt's real intent, not the deliverable-format language in the generated output.`;

function safeParseJson(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.userPrompt      - the raw prompt the user submitted
 * @param {string} params.optimizedText   - the generated system prompt (Skill/Deep) or output (Normal)
 * @param {string} [params.intentCategory] - e.g. "recipe_cooking", useful context, not required
 */
async function extractAndStoreMemories({ userId, userPrompt, optimizedText, intentCategory }) {
  if (!userId || !userPrompt) return; // no-op without an identity to attach memory to

  try {
    const data = await openaiChat({
      model: EXTRACTOR_MODEL,
      max_tokens: 700,
      messages: [
        { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
        {
          role: "user",
          content: `USER'S ACTUAL REQUEST (this reflects their real-world intent â use this for displayName/projectType/summary): "${userPrompt}"

Intent category (if known): ${intentCategory || "unknown"}

SMARTGEN'S GENERATED OUTPUT (this is an instructional system prompt describing a deliverable format â do NOT use its format language like "guide" or "article" to determine projectType; only use it to enrich "details" and "newDecisions"):
${String(optimizedText || "").slice(0, 2000)}`,
        },
      ],
    });

    const raw = data?.choices?.[0]?.message?.content;
    const parsed = safeParseJson(raw);
    if (!parsed) return; // fail silently â memory extraction must never break the main flow

    const jobs = [];

    if (Array.isArray(parsed.projects)) {
      for (const project of parsed.projects) {
        if (project && project.displayName) jobs.push(upsertProjectMemory(userId, project));
      }
    }

    if (parsed.preferences && typeof parsed.preferences === "object") {
      jobs.push(upsertPreferenceMemory(userId, parsed.preferences));
    }

    if (Array.isArray(parsed.longTermFacts) && parsed.longTermFacts.length) {
      jobs.push(upsertLongTermFacts(userId, parsed.longTermFacts));
    }

    await Promise.all(jobs);
  } catch (err) {
    // Memory is a background enhancement â never let it surface as a user-facing error.
    console.error("[memoryExtractor] extraction failed (non-fatal):", err?.message || err);
  }
}

module.exports = { extractAndStoreMemories };