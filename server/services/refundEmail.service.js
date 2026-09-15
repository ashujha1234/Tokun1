// Refund and settlement emails.
//
// Nothing sent a refund email before this. A buyer whose refund was approved
// found out only if they happened to open the app and see the notification —
// for money leaving and coming back, an email is the receipt people expect and
// the one they'll go looking for weeks later when their bank statement doesn't
// match.
//
// Covers three shapes, because they are genuinely different messages:
//
//   • full refund      — "you're getting all of it back"
//   • partial split    — "you're getting some of it back, and here's why"
//   • seller settled   — the other side of a split, telling the creator what
//                        they were paid and what happened
//
// Every one of these is best-effort at the call site: a refund that has already
// gone through Razorpay must never be rolled back because SMTP was down.

/* Shell, escaping and money formatting come from services/emailLayout.js — this
   file used to carry its own copy of all three, which is how a second and then
   a third variant of the same email design came to exist. */
const transporter = require("../utils/mailer");
const {
  ACCENT,
  SITE,
  escapeHtml,
  rupees,
  onDate,
  shell,
  orderUrl,
  orderIdRow,
} = require("./emailLayout");

/* ── When it happened ────────────────────────────────────────────────────────
 *
 * A refund email arrives days after the purchase and is read weeks after that,
 * usually next to a bank statement that doesn't obviously match. Without dates
 * it says a refund happened but not which payment it reverses, and the first
 * question back to support is always "for which order, and from when?".
 *
 * Three moments, and they are genuinely different: when the money was taken,
 * when the buyer asked for it back, and when it was decided. A dispute about a
 * refund window is a dispute about the gap between the first two.
 *
 * Empty values are dropped by shell(), so an older record missing any of these
 * loses a line rather than printing "Invalid Date". */
function dateRows(
  { purchasedAt, requestedAt, decidedAt },
  { purchasedLabel = "Purchased on", requestedLabel = "Refund requested on", decidedLabel = "Decided on" } = {}
) {
  return [
    { label: purchasedLabel, value: purchasedAt ? onDate(purchasedAt) : "" },
    { label: requestedLabel, value: requestedAt ? onDate(requestedAt) : "" },
    { label: decidedLabel, value: decidedAt ? onDate(decidedAt) : "" },
  ];
}

/* ── Accents come from the palette, like every other template ──────────────
 *
 * This file was the one that didn't. It carried its own hex codes — #19E66C,
 * #FABC4E and #8F8996 — none of which are in ACCENT, so a refund email sat next
 * to a payout email in the same inbox wearing a different green. The grey was
 * the worst of it: it exists nowhere else in the product, and on a mail about
 * someone's money it reads as switched-off rather than serious.
 *
 * The palette is keyed by MEANING (see ACCENT in emailLayout.js), and these
 * five messages map onto it exactly:
 *
 *   money   you are getting something back    full refund, partial, payout
 *   danger  rejected, or you lost the amount  no refund, nil payout, declined
 *
 * "Rejected" and "lost" are the literal words in the danger definition, so the
 * two hardest emails here are the two the palette already had an answer for.
 *
 * Dark text on the accent stays as it was: #0B0B0D on the red is 5.2:1, white
 * on it would be 3.8:1. */
/* shell() renders the footer glyphs as cid: references, so every message
   built here has to carry the matching parts. This file posts through its own
   transporter rather than sendShellEmail, which is where they were lost. */
const { socialAttachments } = require("./emailSocialIcons");
/* Same one-liner buyerEmail/creatorEmail use, so every template greets the
   same way: "Hello Laxmi," not "Hello Laxmi Patil,". */
const firstName = (name) => String(name || "there").trim().split(/\s+/)[0];

/* What was actually bought, in the words the buyer used at checkout.
 *
 * Every refund email said "Item: <title>" and nothing else, so a refund for a
 * prompt, a booked service and a hired project all read identically. Someone
 * with more than one order open could not tell which one had been refunded
 * without opening the app — which is the thing the email exists to avoid.
 *
 * Unknown falls back to "Order" rather than guessing: a wrong label is worse
 * than a generic one on a mail about money. */
const KIND_LABEL = {
  prompt: "Product",
  service: "Service booking",
  hire: "Project",
  project: "Project",
  booking: "Service booking",
};
const kindLabel = (kind) => KIND_LABEL[String(kind || "").toLowerCase()] || "Order";

/* ── Where these emails send people ─────────────────────────────────────────
 *
 * Not one of the five templates here had a button. Every other transactional
 * email on Tokun ends with somewhere to go; the ones about money coming back —
 * the emails people most want to check on — ended with a paragraph of fine
 * print and nothing to click. The instruction was "go and look in the app",
 * unwritten.
 *
 * And a button is only worth having if it lands on the right thing. "Track your
 * refund" opening the full list of every refund you have ever had is barely
 * better than no link: the reader still has to find the one the email is about.
 * So each of these points at THIS settlement — the order page for a booking or
 * a project, anchored on the dispute panel, and the specific request on
 * /my-refunds for a prompt, which has no order page of its own.
 *
 * The itemKind vocabulary here is wider than orderUrl's (a "project" is a hire,
 * a "booking" is a service), so it is normalised before being handed over
 * rather than teaching the shared helper this file's synonyms. */
const LINK_KIND = { hire: "hire", project: "hire", service: "service", booking: "service" };

/**
 * @param {string} label  what the button says
 * @returns {{label: string, href: string}} always resolvable — /my-refunds is
 *   the floor, so a call site missing both ids still gets a working button
 *   rather than one pointing at "undefined".
 */
function settlementCta({ itemKind, orderId, refundRequestId }, label) {
  const href =
    orderUrl(LINK_KIND[String(itemKind || "").toLowerCase()], orderId, "#dispute") ||
    (refundRequestId ? `${SITE}/my-refunds?request=${refundRequestId}` : `${SITE}/my-refunds`);
  return { label, href };
}


// Said on every buyer-facing refund email. People chase support on day two
// otherwise, and the answer is always the same.
const BANK_TIMING_NOTE =
  "Refunds are sent back to the original payment method and usually appear within 5–7 working days, depending on your bank. You don't need to do anything.";

/**
 * Buyer got all of their money back.
 *
 * @param {object} args
 * @param {string} args.to
 * @param {string} args.buyerName
 * @param {string} args.itemTitle    what was refunded
 * @param {number} args.amount
 * @param {string} [args.reason]     shown only when there is one worth showing
 * @param {string} [args.referenceId]
 */
exports.sendFullRefundEmail = async ({ to, buyerName, itemTitle,
  itemKind, amount, reason, referenceId, orderId, refundRequestId,
  purchasedAt, requestedAt, refundedAt,
  /* This template serves two arrivals: a prompt refund the buyer asked for,
     and a cancellation settled wholly in their favour. The dates are the same
     three moments either way, but the middle one is "you asked" in the first
     and "it was called off" in the second, so the caller names them. */
  dateLabels }) => {
  if (!to) return;

  const rows = [
    { label: "Type", value: kindLabel(itemKind) },
    { label: "Item", value: itemTitle || "—" },
    /* Above the money, not buried under it: this is the line someone quotes
       when they forward the email to support or to their bank. */
    orderIdRow(orderId),
    ...dateRows({ purchasedAt, requestedAt, decidedAt: refundedAt }, {
      decidedLabel: "Refunded on",
      ...(dateLabels || {}),
    }),
    { label: "Refunded to you", value: rupees(amount), emphasis: true },
  ];
  if (reason) rows.push({ label: "Reason", value: reason, block: true });
  if (referenceId) rows.push({ label: "Reference", value: referenceId });

  const html = shell({
    heading: "Your refund is on its way",
    accent: ACCENT.money,
    greeting: firstName(buyerName),
    introHtml: `We've refunded your payment in full.`,
    rows,
    cta: settlementCta({ itemKind, orderId, refundRequestId }, "Track this refund"),
    footerNote: BANK_TIMING_NOTE,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Refund processed — ${rupees(amount)} for "${itemTitle || "your order"}"`,
    html,
    attachments: socialAttachments(),
  });
};

/**
 * Buyer got part of their money back — a cancellation settled at some split.
 *
 * The percentage alone is a number nobody can check, so the email spells out
 * both sides: what the creator was paid AND what came back. That's what makes
 * the figure verifiable rather than something to argue with support about.
 */
exports.sendPartialRefundEmail = async ({
  to,
  buyerName,
  itemTitle,
  itemKind,
  refundAmount,
  sellerPayout,
  sellerPercent,
  totalPaid,
  decidedBy,
  note,
  referenceId,
  orderId,
  refundRequestId,
  purchasedAt,
  requestedAt,
  settledAt,
}) => {
  if (!to) return;

  const rows = [
    { label: "Type", value: kindLabel(itemKind) },
    { label: "Item", value: itemTitle || "—" },
    orderIdRow(orderId),
    ...dateRows(
      { purchasedAt, requestedAt, decidedAt: settledAt },
      { purchasedLabel: "Booked on", requestedLabel: "Cancelled on", decidedLabel: "Settled on" }
    ),
    { label: "You originally paid", value: rupees(totalPaid) },
    { label: `Paid to the creator (${sellerPercent}% completed)`, value: rupees(sellerPayout) },
    { label: "Refunded to you", value: rupees(refundAmount), emphasis: true },
  ];
  if (note) rows.push({ label: "Note", value: note, block: true });
  if (referenceId) rows.push({ label: "Reference", value: referenceId });

  const decidedLine =
    decidedBy === "admin"
      ? "Our team reviewed the work that had been done and decided this split."
      : "This split was agreed between you and the creator.";

  const html = shell({
    heading: "Your cancellation has been settled",
    accent: ACCENT.money,
    greeting: firstName(buyerName),
    introHtml: `"${escapeHtml(itemTitle || "your booking")}" was cancelled after work had started. ${escapeHtml(decidedLine)} The creator was paid for the share they completed, and the rest is coming back to you.`,
    rows,
    cta: settlementCta({ itemKind, orderId, refundRequestId }, "See this settlement"),
    footerNote: BANK_TIMING_NOTE,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Cancellation settled — ${rupees(refundAmount)} refunded for "${itemTitle || "your booking"}"`,
    html,
    attachments: socialAttachments(),
  });
};

/**
 * The creator's side of the same event: what they were paid, and why it wasn't
 * the full amount.
 */
/**
 * Buyer got NOTHING back — the cancellation was settled wholly in the creator's
 * favour.
 *
 * The hardest email of the set, and the one that was missing entirely: every
 * message here was gated on there being a refund, so the person who lost the
 * whole amount was the only one told nothing. Silence after losing ₹12,000
 * reads as the money having vanished.
 *
 * Deliberately does not apologise or soften. It states the outcome, the amount,
 * who decided it, and their reason — everything needed to dispute it further if
 * they think it's wrong.
 */
exports.sendNoRefundEmail = async ({
  to,
  buyerName,
  itemTitle,
  itemKind,
  totalPaid,
  sellerPayout,
  decidedBy,
  note,
  orderId,
  purchasedAt,
  requestedAt,
  settledAt,
}) => {
  if (!to) return;

  const rows = [
    { label: "Type", value: kindLabel(itemKind) },
    { label: "Item", value: itemTitle || "—" },
    orderIdRow(orderId),
    ...dateRows(
      { purchasedAt, requestedAt, decidedAt: settledAt },
      { purchasedLabel: "Booked on", requestedLabel: "Cancelled on", decidedLabel: "Settled on" }
    ),
    { label: "You paid", value: rupees(totalPaid) },
    { label: "Released to the creator", value: rupees(sellerPayout), emphasis: true },
    { label: "Refunded to you", value: rupees(0) },
  ];
  if (note) rows.push({ label: "Reason given", value: note });

  const decidedLine =
    decidedBy === "admin"
      ? "Our team reviewed the work, the progress records and both sides' evidence, and decided the creator had completed what was agreed."
      : "This outcome was agreed between you and the creator.";

  const html = shell({
    heading: "This cancellation was settled in the creator's favour",
    accent: ACCENT.danger,
    greeting: firstName(buyerName),
    introHtml: `"${escapeHtml(itemTitle || "your booking")}" has been settled and no refund is due. ${escapeHtml(decidedLine)}`,
    rows,
    /* The one email here where the button is more than convenience: the case
       against this outcome is built from the progress records and the messages
       on the order, and this is what puts them in front of the person who has
       just been told they lost. */
    cta: settlementCta({ itemKind, orderId }, "See how this was decided"),
    footerNote:
      "If you believe this is wrong, reply to this email with anything that wasn't already submitted and we'll look again.",
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Cancellation settled — no refund for "${itemTitle || "your booking"}"`,
    html,
    attachments: socialAttachments(),
  });
};

exports.sendSellerSettlementEmail = async ({
  to,
  sellerName,
  itemTitle,
  itemKind,
  sellerPayout,
  sellerPercent,
  fullAmount,
  decidedBy,
  note,
  orderId,
  purchasedAt,
  settledAt,
}) => {
  if (!to) return;

  const isNil = Number(sellerPayout || 0) <= 0;

  const rows = [
    { label: "Type", value: kindLabel(itemKind) },
    { label: "Item", value: itemTitle || "—" },
    orderIdRow(orderId),
    /* The creator never filed anything, so the middle date would be the
       client's request and is not theirs to answer for. */
    { label: "Booked on", value: purchasedAt ? onDate(purchasedAt) : "" },
    { label: "Settled on", value: settledAt ? onDate(settledAt) : "" },
    { label: "Full payout if completed", value: rupees(fullAmount) },
    { label: "Assessed as completed", value: `${sellerPercent}%` },
  ];

  /* Without this the table contradicts itself: "full payout if completed
     ₹11,400" sitting directly above "paid to you ₹12,000". The difference is
     Tokun's commission, which is waived on anything that had to be cancelled or
     arbitrated — so the payout genuinely can exceed the normal-completion
     figure, and the reader deserves to be told why rather than left to wonder
     whether the numbers are broken. */
  const waived = +(Number(sellerPayout || 0) - Number(fullAmount || 0)).toFixed(2);
  if (waived > 0) {
    rows.push({ label: "Tokun commission waived", value: `+ ${rupees(waived)}` });
  }

  rows.push({ label: "Paid to you", value: rupees(sellerPayout), emphasis: true });
  if (note) rows.push({ label: "Note", value: note, block: true });

  const decidedLine =
    decidedBy === "admin"
      ? "Our team reviewed the work and decided this split."
      : "This split was agreed between you and the client.";

  const html = shell({
    heading: isNil ? "A booking was cancelled" : "Your cancellation payout",
    accent: isNil ? ACCENT.danger : ACCENT.money,
    greeting: firstName(sellerName),
    introHtml: `"${escapeHtml(itemTitle || "your booking")}" was cancelled. ${escapeHtml(decidedLine)}`,
    rows,
    cta: settlementCta({ itemKind, orderId }, "Open the booking"),
    footerNote: isNil
      ? "Nothing was paid out for this booking. If you believe this is wrong, reply to this email and our team will take another look."
      : "This settles to your linked bank account on its usual schedule. If you believe the split is wrong, reply to this email and our team will take another look.",
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: isNil
      ? `Booking cancelled — "${itemTitle || "your booking"}"`
      : `Cancellation payout — ${rupees(sellerPayout)} for "${itemTitle || "your booking"}"`,
    html,
    attachments: socialAttachments(),
  });
};

/** Buyer's refund request was turned down. */
exports.sendRefundRejectedEmail = async ({ to, buyerName, itemTitle,
  itemKind, adminNote, orderId, refundRequestId,
  purchasedAt, requestedAt, decidedAt }) => {
  if (!to) return;

  const rows = [{ label: "Type", value: kindLabel(itemKind) },
    { label: "Item", value: itemTitle || "—" },
    orderIdRow(orderId),
    ...dateRows({ purchasedAt, requestedAt, decidedAt })];
  if (adminNote) rows.push({ label: "Reason", value: adminNote, block: true });

  const html = shell({
    heading: "About your refund request",
    accent: ACCENT.danger,
    greeting: firstName(buyerName),
    introHtml: `We've reviewed your refund request and can't approve it this time.`,
    rows,
    cta: settlementCta({ itemKind, orderId, refundRequestId }, "See this refund request"),
    footerNote:
      "If you think something was missed, reply to this email with any extra detail and our team will take another look.",
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Your refund request for "${itemTitle || "your order"}"`,
    html,
    attachments: socialAttachments(),
  });
};
