/**
 * server/memory/memoryStore.js
 *
 * All read/write access to memory collections goes through here. This is where
 * the "update instead of duplicate" logic lives (per your spec: "if a user
 * changes their project direction... SmartGen should modify the stored memory
 * rather than creating duplicate or outdated entries").
 */

const { ProjectMemory, PreferenceMemory, LongTermMemory } = require("./models");

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function normalize(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Cheap token-overlap similarity â good enough for matching short project
// names without pulling in an embeddings dependency. Swap for embedding
// cosine-similarity later (see Section 18 Phase 4) without changing the
// calling code below.
function similarity(a, b) {
  const setA = new Set(normalize(a).split(" ").filter(Boolean));
  const setB = new Set(normalize(b).split(" ").filter(Boolean));
  if (!setA.size || !setB.size) return 0;
  let overlap = 0;
  for (const tok of setA) if (setB.has(tok)) overlap++;
  return overlap / Math.max(setA.size, setB.size);
}

const MATCH_THRESHOLD = 0.4; // lowered from 0.5 â see tuning note below

/* ------------------------------------------------------------------ */
/* Project Memory                                                      */
/* ------------------------------------------------------------------ */

/**
 * Finds the best existing project match for a user, if any.
 * Matches on projectType first (if given), then name similarity.
 *
 * TUNING NOTE (fixed after real-world test): two same-type projects sharing
 * just one distinctive keyword (e.g. "Sourdough Bakery" vs "Bakery Pricing
 * Strategy" â both "business" type, both containing "bakery") were scoring
 * below the old 0.5 threshold and creating duplicates. The type-match bonus
 * was raised from 0.15 to 0.2 and the threshold lowered to 0.4 so this case
 * merges correctly, while two same-type projects with ZERO shared keywords
 * (e.g. "Bakery" vs "SaaS Product") still won't cross the threshold and
 * correctly remain separate.
 */
async function findMatchingProject(userId, { displayName, projectType }) {
  const candidates = await ProjectMemory.find({ userId }).lean();
  if (!candidates.length) return null;

  let best = null;
  let bestScore = 0;
  for (const c of candidates) {
    let score = similarity(displayName, c.displayName);
    if (projectType && c.projectType && projectType === c.projectType) {
      score += 0.2; // was 0.15 â same-type projects need less name overlap to merge
    }
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return bestScore >= MATCH_THRESHOLD ? best : null;
}

/**
 * Creates a new project, or updates an existing one in place.
 * - `summary` is replaced with the latest version.
 * - `details` is shallow-merged (new keys added, existing keys overwritten).
 * - `decisions` are appended, never removed.
 */
async function upsertProjectMemory(userId, projectData) {
  const { displayName, projectType, summary, details = {}, newDecisions = [] } = projectData;
  if (!displayName) return null;

  const match = await findMatchingProject(userId, { displayName, projectType });

  if (match) {
    const mergedDetails = { ...(match.details || {}), ...details };
    const appendedDecisions = [
      ...(match.decisions || []),
      ...newDecisions.map((text) => ({ text, recordedAt: new Date() })),
    ];

    await ProjectMemory.updateOne(
      { _id: match._id },
      {
        $set: {
          summary: summary || match.summary,
          details: mergedDetails,
          decisions: appendedDecisions,
          lastMentionedAt: new Date(),
          // Keep displayName fresh in case phrasing improved, but don't
          // touch normalizedName (that's the stable matching key).
          displayName: displayName || match.displayName,
        },
      }
    );
    return { id: match._id, created: false };
  }

  const doc = await ProjectMemory.create({
    userId,
    normalizedName: normalize(displayName),
    displayName,
    projectType: projectType || "other",
    summary: summary || "",
    details,
    decisions: newDecisions.map((text) => ({ text, recordedAt: new Date() })),
    lastMentionedAt: new Date(),
  });
  return { id: doc._id, created: true };
}

async function getActiveProjects(userId) {
  return ProjectMemory.find({ userId, status: "active" })
    .sort({ lastMentionedAt: -1 })
    .lean();
}

/* ------------------------------------------------------------------ */
/* Preference Memory                                                    */
/* ------------------------------------------------------------------ */

async function upsertPreferenceMemory(userId, prefs = {}) {
  const update = {};
  for (const field of ["tone", "outputFormat", "language", "preferredMode"]) {
    if (prefs[field] !== undefined && prefs[field] !== null) update[field] = prefs[field];
  }
  if (prefs.writingStyleNotes) update.writingStyleNotes = prefs.writingStyleNotes;
  if (!Object.keys(update).length) return null;

  return PreferenceMemory.findOneAndUpdate(
    { userId },
    { $set: update },
    { upsert: true, new: true }
  );
}

async function getPreferences(userId) {
  return PreferenceMemory.findOne({ userId }).lean();
}

/* ------------------------------------------------------------------ */
/* Long-Term Memory                                                    */
/* ------------------------------------------------------------------ */

async function upsertLongTermFacts(userId, facts = []) {
  // facts: [{ key, value, label }]
  const results = [];
  for (const fact of facts) {
    if (!fact || !fact.key || !fact.value) continue;
    const doc = await LongTermMemory.findOneAndUpdate(
      { userId, key: fact.key },
      { $set: { value: fact.value, label: fact.label || fact.key, lastConfirmedAt: new Date() } },
      { upsert: true, new: true }
    );
    results.push(doc);
  }
  return results;
}

async function getLongTermFacts(userId) {
  return LongTermMemory.find({ userId }).lean();
}

/* ------------------------------------------------------------------ */
/* Aggregate fetch â used by memoryRetriever                            */
/* ------------------------------------------------------------------ */

async function getAllMemoriesForUser(userId) {
  const [projects, preferences, longTerm] = await Promise.all([
    getActiveProjects(userId),
    getPreferences(userId),
    getLongTermFacts(userId),
  ]);
  return { projects, preferences, longTerm };
}

module.exports = {
  upsertProjectMemory,
  getActiveProjects,
  upsertPreferenceMemory,
  getPreferences,
  upsertLongTermFacts,
  getLongTermFacts,
  getAllMemoriesForUser,
  // exported for testing / tuning
  _internal: { normalize, similarity, MATCH_THRESHOLD },
};