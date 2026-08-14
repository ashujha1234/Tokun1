/**
 * The refund dialog's reason list, shared.
 *
 * There are two refund dialogs — one in components/PromptHistory.tsx and one in
 * pages/self-dash.tsx — because the purchased-prompts grid is duplicated between
 * those two screens. They already drifted once: self-dash kept a plain textarea
 * after PromptHistory grew a tick list, so the same action asked for different
 * things depending on which page you started from. Both now read the presets and
 * the composing rule from here, so a change lands in both or in neither.
 *
 * The server (POST /api/purchase/:purchaseId/refund-request) takes a single
 * `reason` string and only checks that it isn't empty, so everything the buyer
 * picks has to be flattened into one readable block before it is sent.
 */

/* Full sentences, not codes: this text is sent verbatim and read by an admin
   in the refunds queue, where "QUALITY" would need a lookup table to mean
   anything. Ordered by how often each is the real problem. */
export const REFUND_REASON_PRESETS = [
  "The product doesn't match its description",
  "The output quality is poor or unusable",
  "It doesn't work on the AI model it says it supports",
  "The preview image or video doesn't match what I received",
  "The product is incomplete or cut off",
  "I bought this by mistake, or twice",
] as const;

/**
 * The TICKED reasons only, as one string.
 *
 * The buyer's own sentence is NOT folded in here any more — it is sent as a
 * separate `description` field, so the admin queue can show "what they picked"
 * and "what they wrote" as two different things, and so a given reason can be
 * counted across requests. Mixing them made both impossible.
 *
 * Bullets appear only when there is more than one line: a single reason arriving
 * as a one-item bullet list reads like a formatting mistake.
 */
export function composeRefundReason(ticks: string[]): string {
  const parts = ticks.filter(Boolean);

  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return `• ${parts.join("\n• ")}`;
}

/** A tick or a note is each a complete reason on its own. */
export function hasRefundReason(ticks: string[], note: string): boolean {
  return ticks.length > 0 || !!note.trim();
}

/**
 * Splits a stored refund request into the two things the admin UI shows.
 *
 * Requests filed before `description` existed have everything in one string,
 * with the buyer's own words on a line beginning "Other: " — so the admin page
 * displayed "• Other: thanks" inside the reason block, where the label made no
 * sense and the note was not where it belonged. This pulls that line back out.
 *
 * Newer requests already arrive split and pass through untouched; the bullet
 * prefixes are stripped either way, since they were only ever a way of packing
 * several lines into one field.
 */
export function splitRefundReason(
  reason?: string,
  description?: string
): { reason: string; description: string } {
  const lines = String(reason || "")
    .split("\n")
    .map((l) => l.replace(/^[•\s]+/, "").trim())
    .filter(Boolean);

  const stored = String(description || "").trim();

  // An explicit description always wins — never second-guess a field the buyer
  // filled in against a prefix parsed out of free text.
  if (stored) {
    return { reason: lines.join("\n"), description: stored };
  }

  const otherIdx = lines.findIndex((l) => /^other\s*:/i.test(l));
  if (otherIdx === -1) {
    return { reason: lines.join("\n"), description: "" };
  }

  const legacyNote = lines[otherIdx].replace(/^other\s*:\s*/i, "").trim();
  const rest = lines.filter((_, i) => i !== otherIdx);
  return { reason: rest.join("\n"), description: legacyNote };
}
