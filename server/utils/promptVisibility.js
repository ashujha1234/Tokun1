/**
 * One definition of "this listing is live", for every route that shows or sells
 * a prompt.
 *
 * It used to exist only inside GET /api/prompt/others — the marketplace feed —
 * as an inline filter. Every other way of reaching a prompt had its own,
 * shorter idea of the rules, and each gap was reachable:
 *
 *   - GET /public/:id (the share link) checked `deleted` and `flagged` but not
 *     mediaValidation, so a listing the AI check had FLAGGED was hidden from the
 *     marketplace and still opened perfectly from a link the seller sent by hand.
 *   - POST /purchase/create-order checked neither, so that link could be paid
 *     for. Nothing between "seller sends link" and "buyer is charged" ever asked
 *     whether the listing was allowed to be sold.
 *   - POST /cart/add checked `deleted` only; /cart/checkout re-checked nothing,
 *     so anything already sitting in a cart survived being flagged afterwards.
 *   - GET /user/:userId and /by-seller/:sellerId listed flagged-by-validation
 *     prompts on the seller's public profile.
 *
 * So the rules live here once and the routes call them. A new endpoint that
 * forgets to is still a bug — but it is now one line to fix rather than four
 * different half-copies to find.
 *
 * WHAT COUNTS AS LIVE
 *   deleted            — removed by the seller or an admin.
 *   flagged            — a confirmed policy violation from a user report
 *                        (POST /api/prompt-reports/:id/flag).
 *   mediaValidation    — the AI prompt/media match check. Only "approved" (the
 *                        pipeline cleared it) and "admin_approved" (a human did)
 *                        are sellable. "flagged", "pending_review", "pending",
 *                        "admin_rejected" and "edit_requested" are not.
 *
 * Prompts uploaded before the validation pipeline existed carry no
 * mediaValidation.status at all and are grandfathered in — same as the feed has
 * always done, otherwise this would retroactively delist the whole back
 * catalogue.
 *
 * NOT included: seller payout verification. That one deliberately labels rather
 * than hides ("coming soon"), and the money routes reject it separately with
 * `seller_not_verified`.
 */

/** The only two mediaValidation statuses a buyer may reach. */
const CLEARED_VALIDATION_STATUSES = ["approved", "admin_approved"];

/* Legacy rows have no status persisted, so "cleared" has to include "absent"
   rather than being a plain $in. */
const VALIDATION_CLEARED = {
  $or: [
    { "mediaValidation.status": { $exists: false } },
    { "mediaValidation.status": { $in: CLEARED_VALIDATION_STATUSES } },
  ],
};

/**
 * Adds the visibility rules to a Mongo filter, in place, and returns it.
 *
 * Pushes onto `$and` instead of assigning it, so a caller that already has its
 * own `$and` (or a `$or` of its own, for a category filter) keeps it.
 */
function applyPublicPromptFilter(filter = {}) {
  filter.deleted = { $ne: true };
  filter.flagged = { $ne: true };
  if (!Array.isArray(filter.$and)) filter.$and = [];
  filter.$and.push(VALIDATION_CLEARED);
  return filter;
}

/**
 * Also drop one-time products that have already been bought.
 *
 * SEPARATE from applyPublicPromptFilter on purpose, because this is not the same
 * kind of hiding. Those rules are about a listing being *allowed* to be seen;
 * this one is about a listing being *worth showing* — it is a perfectly good
 * product that simply cannot be bought again by anyone, ever, because that is
 * what listing it as one-time means.
 *
 * So it goes on the two surfaces whose job is "here is what you can buy" — the
 * marketplace feed and the shared link — and NOT on a creator's profile, where a
 * sold piece is portfolio and evidence their work sells.
 *
 * `exclusive` alone is not enough and `sold` alone is not either: an ordinary
 * product can be sold a thousand times and stay on sale.
 */
function excludeSoldOut(filter = {}) {
  if (!Array.isArray(filter.$and)) filter.$and = [];
  filter.$and.push({ $nor: [{ exclusive: true, sold: true }] });
  return filter;
}

/**
 * The same rules against one already-loaded document.
 *
 * Returns null when the listing is live, otherwise `{ error, message }` — the
 * shape the routes send straight back, and the message the buyer actually
 * reads. Callers that must not confirm a hidden listing even exists (the share
 * link) translate any non-null result into a flat 404 instead.
 *
 * Works on lean objects and on hydrated documents alike.
 */
function promptUnavailableReason(prompt) {
  if (!prompt || prompt.deleted) {
    return {
      error: "prompt_not_found",
      message: "This product is no longer available.",
    };
  }

  if (prompt.flagged) {
    return {
      error: "prompt_unavailable",
      message: "This product has been removed from the marketplace.",
    };
  }

  const status = prompt.mediaValidation?.status;
  if (status && !CLEARED_VALIDATION_STATUSES.includes(status)) {
    return {
      error: "prompt_under_review",
      message:
        "This product is still being reviewed and can't be bought yet. Please check back later.",
    };
  }

  return null;
}

/** Convenience for the read paths: true when the listing may be shown. */
const isPromptPubliclyVisible = (prompt) => promptUnavailableReason(prompt) === null;

/**
 * What a public read of a Prompt must NOT include.
 *
 * The three unauthenticated endpoints (`/public/:id`, `/user/:userId`,
 * `/by-seller/:sellerId`) each carried their own `.select("-promptText")`. That
 * shape is the problem, not the field: an exclusion list names the things you
 * remembered, so every field added to the schema afterwards is public by
 * default and nobody is asked about it.
 *
 * `uploadCode` is what that cost. It is the second thing a buyer pays for — the
 * seller's code files — and it went out, with working URLs, on all three routes
 * to callers with no session. The blobs live in a container created with
 * `access: "container"` (see utils/uploadToAzure.js), so the URL IS the access
 * control: anyone handed one could download the file without buying anything.
 * Buyers still receive it the way they always did, through the copy taken into
 * Purchase.promptSnapshot at checkout.
 *
 * The rest are internal and have no reader outside the server:
 *   promptHash / attachmentHash / attachmentPhash — the duplicate- and
 *     stolen-media detectors. Publishing them tells anyone trying to slip a
 *     copy past those checks exactly what they are being compared against.
 *   ratings — the embedded `{userId, rating}` rows. Who rated what is nobody
 *     else's business; the aggregate lives in averageRating/reviewAverage,
 *     which stay.
 *
 * ── ADDING A FIELD TO THE PROMPT SCHEMA ──
 * If it is paid content, a secret, or somebody's private business, add it here.
 * One list, three routes, so it cannot be remembered in two of them.
 *
 * Two knowingly left in, because a client reads them and removing them blind
 * would break a screen — both worth a second look on their own:
 *   mediaValidation  a moderation decision about the seller, public today.
 *                    components/historyDetail.tsx reads it back off
 *                    `/public/:id` to draw its badge.
 *   totalRevenue     the seller's earnings on that listing.
 */
const PUBLIC_PROMPT_EXCLUDED_FIELDS = [
  "promptText",
  "uploadCode",
  /* The same reasoning as uploadCode, one field newer. `codeAssets` carries the
     pasted source itself, not just a URL to it, so leaking this one needs no
     download at all — the code would simply be sitting in the JSON. What a
     non-buyer is meant to see of it is `codeMeta`, which stays: it holds file
     names, languages and a teaser already cut to twelve lines by
     buildCodeMeta(). See utils/promptCode.js. */
  "codeAssets",
  "promptHash",
  "attachmentHash",
  "attachmentPhash",
  "ratings",
];

/** Ready to hand to `.select()` — `"-promptText -uploadCode …"`. */
const PUBLIC_PROMPT_PROJECTION = PUBLIC_PROMPT_EXCLUDED_FIELDS.map((f) => `-${f}`).join(" ");

module.exports = {
  CLEARED_VALIDATION_STATUSES,
  VALIDATION_CLEARED,
  applyPublicPromptFilter,
  excludeSoldOut,
  promptUnavailableReason,
  isPromptPubliclyVisible,
  PUBLIC_PROMPT_EXCLUDED_FIELDS,
  PUBLIC_PROMPT_PROJECTION,
};
