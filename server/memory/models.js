/**
 * server/memory/models.js
 *
 * Persistent memory schemas for SmartGen.
 *
 * ASSUMPTION: project already uses Mongoose (standard for a Node/Express + MongoDB
 * stack like TOKUN's). If you're on the raw `mongodb` driver instead, these schemas
 * translate 1:1 into plain collections â see the comment block at the bottom.
 *
 * Layers implemented here:
 *   - ProjectMemory     -> Section 18 "Project Memory" (Phase 1)
 *   - PreferenceMemory  -> Section 18 "Preference Memory" (Phase 2)
 *   - LongTermMemory    -> Section 18 "Long-term Memory" (Phase 3, lightweight version)
 *
 * Short-term memory is intentionally NOT persisted here â it already exists as the
 * "last 3 versions" history in SmarterPrompt.tsx / current conversation state.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

/* ------------------------------------------------------------------ */
/* Project Memory                                                      */
/* One document per distinct project/business/goal a user is working  */
/* on. Updated in place as the user provides new information â never   */
/* duplicated. `decisions` is an append-only log so we retain history  */
/* even as `summary`/`details` get overwritten with the latest state.  */
/* ------------------------------------------------------------------ */
const decisionEntrySchema = new Schema(
  {
    text: { type: String, required: true },
    recordedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const projectMemorySchema = new Schema(
  {
    userId: { type: String, required: true, index: true },

    // Stable identity for fuzzy-matching future mentions of the same project.
    // e.g. "organic skincare business" -> normalizedName: "organic skincare business"
    normalizedName: { type: String, required: true },
    displayName: { type: String, required: true }, // human-friendly, e.g. "Organic Skincare Business"

    // Coarse classification, used both for matching and for prompt injection.
    // e.g. "business" | "saas" | "book" | "interview_prep" | "startup" | "other"
    projectType: { type: String, default: "other", index: true },

    // Free-text rolling summary of what this project currently is / where it stands.
    // This gets REPLACED (not appended) each time we extract new info, so it always
    // reflects the latest understanding.
    summary: { type: String, default: "" },

    // Structured, loosely-typed bag for domain-specific facts extracted over time
    // (e.g. { industry: "skincare", geography: "India", stage: "pre-launch" }).
    // Merged shallowly on update â new keys added, existing keys overwritten.
    details: { type: Schema.Types.Mixed, default: {} },

    // Append-only. Never edited or deleted automatically â gives the extractor
    // and any future UI a full audit trail of how the project evolved.
    decisions: { type: [decisionEntrySchema], default: [] },

    status: {
      type: String,
      enum: ["active", "paused", "completed", "abandoned"],
      default: "active",
    },

    lastMentionedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

projectMemorySchema.index({ userId: 1, normalizedName: 1 }, { unique: true });

/* ------------------------------------------------------------------ */
/* Preference Memory                                                   */
/* One document per user. Simple overwrite semantics â the latest      */
/* stated/inferred preference wins.                                    */
/* ------------------------------------------------------------------ */
const preferenceMemorySchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },

    tone: { type: String, default: null }, // e.g. "direct", "warm", "formal"
    outputFormat: { type: String, default: null }, // e.g. "concise", "detailed", "bulleted"
    language: { type: String, default: null }, // e.g. "en", "hinglish"
    preferredMode: {
      type: String,
      enum: ["normal", "skill", "deep", null],
      default: null,
    },
    writingStyleNotes: { type: String, default: "" }, // free text, e.g. "prefers short sentences, no jargon"
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/* Long-Term Memory                                                     */
/* Standalone facts about the user that aren't tied to one project.    */
/* Deduped by `key` so re-stating the same fact updates it in place.   */
/* ------------------------------------------------------------------ */
const longTermMemorySchema = new Schema(
  {
    userId: { type: String, required: true, index: true },

    // Short machine-friendly key for dedup, e.g. "occupation", "location", "team_size"
    key: { type: String, required: true },
    value: { type: String, required: true },

    // Free text, only used when composing the prompt-injection block.
    label: { type: String, default: "" }, // e.g. "Location"

    lastConfirmedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

longTermMemorySchema.index({ userId: 1, key: 1 }, { unique: true });

module.exports = {
  ProjectMemory: mongoose.model("ProjectMemory", projectMemorySchema),
  PreferenceMemory: mongoose.model("PreferenceMemory", preferenceMemorySchema),
  LongTermMemory: mongoose.model("LongTermMemory", longTermMemorySchema),
};

/* ------------------------------------------------------------------ *
 * IF YOU USE THE RAW `mongodb` DRIVER INSTEAD OF MONGOOSE:
 * Skip this file's exports. Instead, use three collections â
 * "projectMemories", "preferenceMemories", "longTermMemories" â with
 * the same field shapes shown above, and create these indexes once
 * at startup:
 *
 *   db.collection("projectMemories").createIndex(
 *     { userId: 1, normalizedName: 1 }, { unique: true }
 *   );
 *   db.collection("preferenceMemories").createIndex(
 *     { userId: 1 }, { unique: true }
 *   );
 *   db.collection("longTermMemories").createIndex(
 *     { userId: 1, key: 1 }, { unique: true }
 *   );
 *
 * memoryStore.js below is written against the Mongoose model API
 * (findOne/updateOne/save). If you're on the raw driver, swap those
 * calls for db.collection(...).findOne / updateOne â the logic and
 * shape of everything else is unchanged.
 * ------------------------------------------------------------------ */