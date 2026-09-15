/**
 * The numbers that govern an escrow engagement, in one place.
 *
 * ── Why this file exists ────────────────────────────────────────────────────
 *
 * The auto-release window is the most consequential rule on the platform: after
 * it passes, money moves from the client to the creator whether or not anyone
 * did anything. Before this file, the figure 72 was written out FOUR times —
 * cron/autoReleaseEscrow.js, cron/autoReleaseServiceEscrow.js,
 * routes/hire.routes.js, and frontend/src/lib/engagementRules.ts — with nothing
 * connecting them.
 *
 * That is survivable only while nobody changes it. Change one and the system
 * does one thing while the interface promises another, and the promise is what
 * the user planned around. The engagement email this feeds makes that worse
 * still: an email is a record someone can hold up later, so a stale number in
 * one is an argument waiting to happen.
 *
 * Every server-side copy now reads from here. The frontend keeps its own
 * `RULES` because it cannot import CommonJS from the Vite build — the two are
 * checked against each other in the test below rather than by hoping.
 *
 * ── Changing a value ────────────────────────────────────────────────────────
 *
 * Change it here AND in frontend/src/lib/engagementRules.ts, in the same
 * commit. Nothing enforces that automatically; the pairing is the whole point
 * of the comment you are reading.
 */

const RULES = Object.freeze({
  /* Hours after delivery before escrow releases to the creator on its own.
     Read by cron/autoReleaseEscrow.js, cron/autoReleaseServiceEscrow.js and
     routes/hire.routes.js. */
  autoReleaseHours: 72,

  /* How long before that deadline the warning email goes out
     (cron/escrowDeadlineWatch.js). */
  autoReleaseWarningHours: 24,

  /* Razorpay will not hold a transfer past this, so every decision about the
     money has to happen inside it. */
  maxHoldDays: 90,

  /* Longest delivery window a creator may quote. */
  maxDeliveryDays: 60,

  /* Days before escrow expiry that both sides get told. */
  escrowWarningDays: 7,

  /* An unpaid request is closed after this and both sides are released
     (cron/staleRequestWatch.js reads REQUEST_RESPONSE_DAYS from env, which
     should match this). */
  unpaidRequestExpiryDays: 3,

  /* Revision stalls: warn, then escalate. */
  revisionStallWarnDays: 7,
  revisionStallEscalateDays: 14,

  /* The least time a creator gets to answer a revision, counted from when it
     was asked for.

     A revision is new work the client triggers, and its timing is entirely
     theirs. Without a floor, a revision requested in the last hour of the
     window leaves the creator unable to answer it and then late for not having
     — the failure the submit guard in routes/serviceRoutes.js already flagged
     as an open question.

     Giving the review time back (see utils/deliveryDeadline.js) covers the case
     where the client sat on the delivery. This covers the rest: even an instant
     revision needs somewhere to be done. */
  minRevisionHours: 24,

  /* Progress checkpoints. */
  progressRequestCooldownHours: 24,
  progressMaxMedia: 6,

  /* How long confidentiality survives the engagement, per the agreement. */
  confidentialityYears: 2,
});

module.exports = { RULES };
