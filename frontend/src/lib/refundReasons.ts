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
  "The prompt doesn't match its description",
  "The output quality is poor or unusable",
  "It doesn't work on the AI model it says it supports",
  "The preview image or video doesn't match what I received",
  "The prompt is incomplete or cut off",
  "I bought this by mistake, or twice",
] as const;

/**
 * Flattens the ticked reasons and the free-text note into the single string the
 * endpoint accepts.
 *
 * Bullets are added only when there is more than one line — a lone reason
 * arriving as a one-item bullet list reads like a formatting mistake.
 */
export function composeRefundReason(ticks: string[], note: string): string {
  const trimmedNote = note.trim();
  const parts = [...ticks, trimmedNote ? `Other: ${trimmedNote}` : ""].filter(Boolean);

  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return `• ${parts.join("\n• ")}`;
}

/** A tick or a note is each a complete reason on its own. */
export function hasRefundReason(ticks: string[], note: string): boolean {
  return ticks.length > 0 || !!note.trim();
}
