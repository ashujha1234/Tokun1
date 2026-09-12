/**
 * The platform rules an engagement is actually run by.
 *
 * These are not product copy — every one of them mirrors a constant on the
 * server that enforces it, named beside it. They live in one module because two
 * documents now quote them at the parties:
 *
 *   • the signed agreement (components/NdaCard.tsx), where they are TERMS —
 *     "the escrow auto-releases" is not a term, "the escrow auto-releases 72
 *     hours after delivery if you don't respond" is;
 *   • the welcome doc (components/escrow/WelcomeDoc.tsx), where they are the
 *     explanation of what is about to happen.
 *
 * A signed contract and an onboarding doc quoting different numbers for the same
 * rule is worse than either quoting none, which is the entire reason this is a
 * shared module rather than two copies.
 *
 * If a server constant changes, change it here — and bump AGREEMENT_VERSION in
 * NdaCard.tsx, so a record signed under the old numbers stays identifiable as
 * having been signed under the old numbers.
 */
export const RULES = {
  /** cron/autoReleaseEscrow.js + cron/autoReleaseServiceEscrow.js */
  autoReleaseHours: 72,
  /** cron/autoReleaseEscrow.js — WARN_BEFORE_HOURS */
  autoReleaseWarningHours: 24,
  /** utils/escrowWindow.js — RAZORPAY_MAX_HOLD_DAYS */
  maxHoldDays: 90,
  /** utils/escrowWindow.js — MAX_DELIVERY_DAYS */
  maxDeliveryDays: 60,
  /** utils/escrowWindow.js — ESCROW_WARNING_DAYS */
  escrowWarningDays: 7,
  /** cron/staleRequestWatch.js — RESPONSE_DAYS */
  unpaidRequestExpiryDays: 3,
  /** cron/stalledRevisionWatch.js — WARN_AFTER_DAYS */
  revisionStallWarnDays: 7,
  /** cron/stalledRevisionWatch.js — ESCALATE_AFTER_DAYS */
  revisionStallEscalateDays: 14,
  /** routes/progressReview.js — REQUEST_COOLDOWN_HOURS */
  progressRequestCooldownHours: 24,
  /** routes/progressReview.js — REVIEW_MAX_MEDIA */
  progressMaxMedia: 6,
  /** Agreement clause 27 — how long confidentiality survives completion. */
  confidentialityYears: 2,
} as const;
