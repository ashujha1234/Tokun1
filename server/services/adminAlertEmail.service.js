// Alerts to the Tokun team for things that sit in a queue until a human acts.
//
// Every one of these already created an ADMIN_* notification — visible only to
// someone who happens to open the admin panel. That's fine for a dashboard
// count and useless as a work queue: a dispute escalated at 6pm on Friday, a
// refund request, an intro video blocking a creator from earning, a reported
// product still on sale — all of them wait, silently, for the next time someone
// logs in.
//
// One recipient, ADMIN_ALERT_EMAIL, falling back to SUPPORT_EMAIL and then to
// the address Tokun sends from (so alerts still land somewhere real rather than
// vanishing if the env var was never set). Comma-separated addresses work —
// nodemailer accepts them as-is.

const { ACCENT, SITE, escapeHtml, rupees, onDate, sendShellEmail } = require("./emailLayout");

const adminRecipient = () =>
  process.env.ADMIN_ALERT_EMAIL || process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || "";

/**
 * The one shape all of these take: what happened, the facts, and a link
 * straight into the admin screen that clears it.
 *
 * @param {object} args
 * @param {string} args.subject
 * @param {string} args.heading
 * @param {string} args.introHtml
 * @param {Array}  [args.rows]
 * @param {string} args.adminPath   path within the admin panel
 * @param {string} [args.ctaLabel]
 * @param {string} [args.accent]
 * @param {string} [args.footerNote]
 */
async function sendAdminAlert({
  subject,
  heading,
  introHtml,
  rows,
  adminPath,
  ctaLabel = "Open the admin panel",
  accent = ACCENT.warn,
  footerNote = "This is queued in the admin panel until someone actions it — nothing moves on its own.",
}) {
  const to = adminRecipient();
  if (!to) return;

  return sendShellEmail({
    to,
    subject: `[Tokun admin] ${subject}`,
    heading,
    accent,
    introHtml,
    rows,
    cta: { label: ctaLabel, href: `${SITE}${adminPath}` },
    footerNote,
    receivingBecause: "you're on the Tokun.World admin alert list",
  });
}

exports.sendAdminAlert = sendAdminAlert;

/** A dispute neither side could settle. Money is frozen until Tokun decides. */
exports.alertDisputeEscalated = async ({ orderTitle, orderId, amount, buyerName, sellerName, reason }) =>
  sendAdminAlert({
    subject: `Dispute escalated — "${orderTitle || orderId}"`,
    heading: "A dispute needs a decision",
    accent: ACCENT.danger,
    introHtml: `The two parties couldn't settle <strong style="color:#fff">${escapeHtml(
      orderTitle || String(orderId || "an order")
    )}</strong> between themselves, so it's been escalated to Tokun. The payment is frozen in escrow until someone rules on it.`,
    rows: [
      { label: "Order", value: orderTitle || String(orderId || "—") },
      { label: buyerName ? "Client" : "", value: buyerName || "" },
      { label: sellerName ? "Creator" : "", value: sellerName || "" },
      { label: amount ? "In escrow" : "", value: amount ? rupees(amount) : "", emphasis: true },
      { label: reason ? "Stated reason" : "", value: reason || "" },
    ],
    adminPath: "/admin/disputes",
    ctaLabel: "Review the dispute",
    footerNote:
      "Both sides have been emailed that it's with us. Until it's decided, neither the creator gets paid nor the client refunded.",
  });

/** A buyer wants their money back on a prompt. 24-hour window, so it's timed. */
exports.alertRefundRequested = async ({ itemTitle, buyerName, amount, reason, requestedAt }) =>
  sendAdminAlert({
    subject: `Refund requested — "${itemTitle || "a product"}"`,
    heading: "A refund is waiting for review",
    introHtml: `${escapeHtml(buyerName || "A buyer")} has requested a refund on <strong style="color:#fff">${escapeHtml(
      itemTitle || "a product"
    )}</strong>.`,
    rows: [
      { label: "Product", value: itemTitle || "—" },
      { label: "Buyer", value: buyerName || "—" },
      { label: amount ? "Amount" : "", value: amount ? rupees(amount) : "", emphasis: true },
      { label: reason ? "Reason given" : "", value: reason || "" },
      { label: requestedAt ? "Requested" : "", value: requestedAt ? onDate(requestedAt) : "" },
    ],
    adminPath: "/admin/refunds",
    ctaLabel: "Review the refund",
    footerNote:
      "The buyer has been told to expect a decision within 1–2 working days. Approving reverses the seller's share as well, so check the sale before you do.",
  });

/**
 * An intro video is sitting unreviewed.
 *
 * Worth an alert on its own: this review is a gate. Until it's cleared the
 * creator cannot list a single service or accept any hire work, so every hour
 * it sits in the queue is an hour they're locked out of earning.
 */
exports.alertIntroVideoReviewNeeded = async ({ creatorName, creatorEmail, profileId }) =>
  sendAdminAlert({
    subject: `Intro video to review — ${creatorName || creatorEmail || "a creator"}`,
    heading: "A creator is waiting to be unlocked",
    accent: ACCENT.info,
    introHtml: `${escapeHtml(
      creatorName || "A creator"
    )} has submitted an intro video for review. Until it's approved they can't list services or accept project requests.`,
    rows: [
      { label: "Creator", value: creatorName || "—" },
      { label: creatorEmail ? "Email" : "", value: creatorEmail || "" },
      { label: profileId ? "Profile" : "", value: profileId ? String(profileId) : "" },
    ],
    adminPath: "/admin/freelancer-review",
    ctaLabel: "Review the video",
    footerNote:
      "The creator has been told reviews usually take under a working day, and they're emailed either way once you decide.",
  });

/** A product was reported and is still visible until someone looks. */
exports.alertProductReported = async ({ productTitle, productId, reporterName, reason, sellerName }) =>
  sendAdminAlert({
    subject: `Product reported — "${productTitle || productId}"`,
    heading: "A product has been reported",
    introHtml: `${escapeHtml(reporterName || "Someone")} reported <strong style="color:#fff">${escapeHtml(
      productTitle || String(productId || "a product")
    )}</strong>.`,
    rows: [
      { label: "Product", value: productTitle || String(productId || "—") },
      { label: sellerName ? "Seller" : "", value: sellerName || "" },
      { label: reporterName ? "Reported by" : "", value: reporterName || "" },
      { label: reason ? "Reason" : "", value: reason || "" },
    ],
    adminPath: "/admin/prompt-validation",
    ctaLabel: "Review the report",
    footerNote:
      "The seller has been emailed that a report was filed. If the product is still listed, it stays on sale until someone acts on this.",
  });
