/**
 * The delivery deadline, after the time the creator spent waiting on the client.
 *
 * ── What this changes ───────────────────────────────────────────────────────
 *
 * Clause 11 of the agreement says the delivery date extends by the length of
 * any delay caused by the client not providing something required. Until now
 * that was a sentence and nothing else: models/AccessRequest.js accumulated
 * `blockedHours` correctly, and NOTHING read it. The number existed so a
 * creator could point at it in a dispute — which means the protection only
 * arrived after the argument had already started, and only if someone looked.
 *
 * Meanwhile `isDeliveryOverdue()` compared the raw `deliveryDueAt`, so a creator
 * blocked for nine days on an asset the client never sent was shown as late,
 * and the submit guard blocked them on a deadline that was never theirs to miss.
 *
 * ── Why the stored date is not moved ────────────────────────────────────────
 *
 * The obvious implementation writes the new date back onto the order. The
 * AccessRequest header argues against exactly that, and it is right: a deadline
 * that silently rewrites itself is worse than the problem, because neither
 * party can afterwards say what was agreed, and the agreed date is the one on
 * the signed document.
 *
 * So this derives instead. `deliveryDueAt` keeps meaning "the date both sides
 * agreed", and the effective date is that plus the blocked time — computed the
 * same way everywhere, shown with its reason attached, and reversible if the
 * blocked hours are ever disputed. Nothing is overwritten, and the extension
 * can always be explained in terms of the numbers it came from.
 *
 * ── The other clock the creator does not control: revisions ─────────────────
 *
 * The submit guard notes that a revision does not extend the promise, and that
 * "a revision requested in the last hours of the window can leave the seller
 * unable to answer it". That is not a rare edge — the client chooses when to
 * review, so they choose how much of the window is left when the revision
 * lands, and the creator is then late for work they were handed with no time
 * to do it. Meanwhile the revision email has been printing a row labelled
 * "New due date" containing the OLD date, because nothing ever computed one.
 *
 * Two things are given back, and they answer two different unfairnesses:
 *
 *   reviewHours   the time the delivery sat with the client. The creator did
 *                 not have the work and could not act on it; that time was
 *                 never theirs to spend.
 *
 *   minRevisionHours  a floor from the moment the revision was asked for. Even
 *                 an instantly-requested revision is new work and needs
 *                 somewhere to be done.
 *
 * The floor is a max(), not an addition — a creator with six days left does not
 * get a seventh for being sent a revision.
 */

const { RULES } = require("../config/engagementRules");

/**
 * Hours this checklist has held the work up, INCLUDING the period still open.
 *
 * recomputeStatus() banks a period only when it ends, so a checklist blocked
 * right now has the current wait sitting in `blockedSince` and not yet in
 * `blockedHours`. Reading only the banked figure — the obvious mistake — gives
 * an extension of zero for precisely the order that is being held up as you
 * look at it.
 *
 * @param {object|null} request  an AccessRequest document or lean object
 */
function blockedHoursNow(request, now = new Date()) {
  if (!request) return 0;
  const banked = Number(request.blockedHours || 0);
  if (!request.blockedSince) return banked;

  const openMs = now.getTime() - new Date(request.blockedSince).getTime();
  // Floored to whole hours, matching recomputeStatus() so the number does not
  // jump when an open period is banked.
  return banked + Math.max(0, Math.floor(openMs / 36e5));
}

/**
 * Hours a delivery spent sitting with the client before being sent back.
 *
 * Derived from the record rather than accumulated into a field, because the
 * record already carries both halves — `submissions[].submittedAt` and
 * `revisions[].requestedAt` — and a stored counter would be a second source of
 * truth that can drift from them.
 *
 * Each revision is paired with the LATEST submission that preceded it, rather
 * than by array index. The two arrays do alternate in practice, but a pairing
 * that depends on that would silently produce nonsense the first time an order
 * is repaired by hand or a submission is recorded out of order.
 */
function reviewHoursFrom(order) {
  const submissions = (order?.submissions || [])
    .map((s) => (s?.submittedAt ? new Date(s.submittedAt).getTime() : null))
    .filter(Boolean)
    .sort((a, b) => a - b);
  if (!submissions.length) return 0;

  let total = 0;
  for (const rev of order?.revisions || []) {
    if (!rev?.requestedAt) continue;
    const asked = new Date(rev.requestedAt).getTime();

    // The delivery this revision was answering.
    let submitted = null;
    for (const t of submissions) {
      if (t <= asked) submitted = t;
      else break;
    }
    // A revision with no submission before it is a data oddity, not a review
    // period. Skipped rather than counted from zero, which would hand the
    // creator the whole age of the order.
    if (submitted === null) continue;

    total += Math.max(0, Math.floor((asked - submitted) / 36e5));
  }
  return total;
}

/** The most recent revision request, or null. */
function lastRevisionAt(order) {
  const times = (order?.revisions || [])
    .map((r) => (r?.requestedAt ? new Date(r.requestedAt).getTime() : null))
    .filter(Boolean);
  return times.length ? new Date(Math.max(...times)) : null;
}

/**
 * The date the creator is actually held to.
 *
 * @param {object} order    needs deliveryDueAt/deliveryDate, submissions, revisions
 * @param {object} request  the AccessRequest checklist, or null
 * @returns {Date|null} null when the order has no due date at all, which is a
 *   real state for a hire deal agreed without one — callers must not turn that
 *   into "now" and make everything overdue.
 */
function effectiveDueAt(order, request, now = new Date()) {
  const dueAt = order?.deliveryDueAt || order?.deliveryDate;
  if (!dueAt) return null;

  const hours = blockedHoursNow(request, now) + reviewHoursFrom(order);
  let due = new Date(new Date(dueAt).getTime() + hours * 36e5);

  /* The floor. max() so it only ever rescues a revision that landed with no
     room left — it never shortens a deadline and never stacks on a comfortable
     one. */
  const revisedAt = lastRevisionAt(order);
  if (revisedAt) {
    const floor = new Date(revisedAt.getTime() + RULES.minRevisionHours * 36e5);
    if (floor > due) due = floor;
  }

  return due;
}

/** Overdue against the effective date, not the agreed one. */
function isOverdueAfterBlocking(order, request, now = new Date()) {
  const due = effectiveDueAt(order, request, now);
  return !!due && due.getTime() < now.getTime();
}

/**
 * Everything a screen or an email needs to show the deadline honestly: the
 * agreed date, the extended one, and why they differ.
 *
 * Always returns both dates even when they are the same, so a caller never has
 * to decide whether an extension "counts" — `extendedHours > 0` is the one
 * check, in one place.
 */
function deadlineState(order, request, now = new Date()) {
  const dueAt = order?.deliveryDueAt || order?.deliveryDate || null;
  const blockedHours = blockedHoursNow(request, now);
  const reviewHours = reviewHoursFrom(order);
  const agreed = dueAt ? new Date(dueAt) : null;
  const effective = effectiveDueAt(order, request, now);

  /* Reported as the real gap between the two dates, not as the sum of the parts
     — the floor can push the date past what blocked + review add up to, and a
     screen saying "extended by 2 days" above two dates 4 days apart is worse
     than no explanation. The parts are alongside it, for the "why". */
  const extendedHours =
    agreed && effective ? Math.max(0, Math.round((effective - agreed) / 36e5)) : 0;

  return {
    agreedDueAt: agreed,
    effectiveDueAt: effective,
    extendedHours,
    extendedDays: Math.floor(extendedHours / 24),
    // What the extension is made of.
    blockedHours,
    reviewHours,
    // Still waiting right now, as opposed to having waited at some point.
    blockedNow: !!request?.blockedSince,
    outstandingRequired: (request?.items || []).filter(
      (i) => i?.required !== false && i?.status === "PENDING"
    ).length,
    overdue: !!effective && effective.getTime() < now.getTime(),
  };
}

module.exports = {
  blockedHoursNow,
  reviewHoursFrom,
  effectiveDueAt,
  isOverdueAfterBlocking,
  deadlineState,
};
