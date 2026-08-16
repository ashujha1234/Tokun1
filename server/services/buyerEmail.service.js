// Everything Tokun emails a BUYER or CLIENT that isn't an invoice or a refund.
//
// Invoices (services/email.service.js) and refunds (refundEmail.service.js)
// were already covered. What wasn't: every point between paying and the money
// leaving escrow. A client paid, and then heard nothing — not when the work
// arrived, not when their review window was about to expire and release the
// payment automatically, not when a dispute they were part of moved.
//
// The auto-release ones matter most. Money leaves escrow on a timer whether the
// client looks or not, so an email is the only honest way to run that clock.
//
// Best-effort at every call site, same rule as everywhere else.

const { ACCENT, SITE, escapeHtml, rupees, onDate, sendShellEmail } = require("./emailLayout");

const firstName = (name) => String(name || "there").trim().split(/\s+/)[0];

/* ──────────────────────────── DELIVERY REVIEW ─────────────────────────── */

/**
 * The creator submitted their work.
 *
 * Carries the auto-release date, because that is the fact with consequences:
 * do nothing and the payment goes through on its own.
 */
exports.sendWorkSubmittedEmail = async ({
  to,
  clientName,
  creatorName,
  title,
  amount,
  autoReleaseAt,
  orderPath,
}) =>
  sendShellEmail({
    to,
    subject: `${creatorName || "Your creator"} delivered "${title || "your order"}"`,
    heading: "Your work has been delivered",
    accent: ACCENT.info,
    preheader: autoReleaseAt
      ? `Review it before ${onDate(autoReleaseAt)}, or the payment releases automatically.`
      : "Review it and approve or request changes.",
    introHtml: `Hi ${escapeHtml(firstName(clientName))}, ${escapeHtml(
      creatorName || "your creator"
    )} has submitted the work for <strong style="color:#fff">${escapeHtml(
      title || "your order"
    )}</strong>. Have a look and either approve it or ask for changes.`,
    rows: [
      { label: amount ? "Held in escrow" : "", value: amount ? rupees(amount) : "" },
      {
        label: autoReleaseAt ? "Releases automatically on" : "",
        value: autoReleaseAt ? onDate(autoReleaseAt) : "",
        emphasis: true,
      },
    ],
    cta: { label: "Review the delivery", href: `${SITE}${orderPath || "/orders"}` },
    footerNote: autoReleaseAt
      ? "If you don't approve or request changes by that date, the payment is released to the creator automatically. That's there so a delivered job can't be left in limbo — but it does mean the clock runs whether you open this or not."
      : "The payment stays in escrow until you approve it or request changes.",
    receivingBecause: "an order you paid for on Tokun.World",
  });

/**
 * Last call before the auto-release timer fires.
 *
 * Sent by the escrow deadline cron. Deliberately blunt: this is the point where
 * silence costs the client the ability to ask for anything.
 */
exports.sendAutoReleaseApproachingEmail = async ({
  to,
  clientName,
  creatorName,
  title,
  amount,
  releasesAt,
  hoursLeft,
  orderPath,
}) =>
  sendShellEmail({
    to,
    subject: `Approve or request changes on "${title || "your order"}" — ${
      hoursLeft ? `${hoursLeft} hours left` : "closing soon"
    }`,
    heading: "Your review window is closing",
    accent: ACCENT.warn,
    preheader: `Payment releases to ${creatorName || "the creator"} on ${onDate(releasesAt)}.`,
    introHtml: `Hi ${escapeHtml(
      firstName(clientName)
    )}, the work on <strong style="color:#fff">${escapeHtml(
      title || "your order"
    )}</strong> is still waiting for your review. When the window closes, the payment held in escrow is released to ${escapeHtml(
      creatorName || "the creator"
    )} automatically.`,
    rows: [
      { label: amount ? "Amount in escrow" : "", value: amount ? rupees(amount) : "" },
      { label: "Releases on", value: onDate(releasesAt), emphasis: true },
    ],
    cta: { label: "Review it now", href: `${SITE}${orderPath || "/orders"}` },
    footerNote:
      "If something is wrong with the delivery, request changes or open a dispute before this date — both stop the timer. After it releases, the money has left escrow and a refund is no longer straightforward.",
    receivingBecause: "an order you paid for on Tokun.World",
  });

/* ─────────────────────────────── DISPUTES ─────────────────────────────── */

/**
 * A dispute was opened on an order you're part of.
 *
 * Goes to the OTHER side — whoever didn't open it. Both parties get the same
 * facts, which is the point: a dispute where one side is better informed than
 * the other isn't a fair one.
 */
exports.sendDisputeOpenedEmail = async ({ to, recipientName, openedByName, title, reason, amount }) =>
  sendShellEmail({
    to,
    subject: `A dispute was opened on "${title || "your order"}"`,
    heading: "A dispute has been opened",
    accent: ACCENT.warn,
    preheader: `${openedByName || "The other party"} has raised a dispute. The payment stays in escrow.`,
    introHtml: `Hi ${escapeHtml(firstName(recipientName))}, ${escapeHtml(
      openedByName || "the other party"
    )} has opened a dispute on <strong style="color:#fff">${escapeHtml(
      title || "your order"
    )}</strong>. Nothing moves out of escrow while it's open.`,
    rows: [
      { label: reason ? "Their reason" : "", value: reason || "" },
      { label: amount ? "Amount in escrow" : "", value: amount ? rupees(amount) : "" },
    ],
    cta: { label: "Open the dispute", href: `${SITE}/orders` },
    footerNote:
      "Most disputes are settled between the two of you — you can propose a split from the order page. If you can't agree, either side can escalate it to Tokun and we'll decide based on what was delivered.",
    receivingBecause: "an order on your Tokun.World account",
  });

/** Escalated to Tokun — neither side is deciding this any more. */
exports.sendDisputeEscalatedEmail = async ({ to, recipientName, title, escalatedByName }) =>
  sendShellEmail({
    to,
    subject: `"${title || "Your order"}" has been escalated to Tokun`,
    heading: "The dispute is now with our team",
    accent: ACCENT.warn,
    preheader: "We'll review what was agreed and delivered, then decide.",
    introHtml: `Hi ${escapeHtml(firstName(recipientName))}, the dispute on <strong style="color:#fff">${escapeHtml(
      title || "your order"
    )}</strong> has been escalated to Tokun${
      escalatedByName ? ` by ${escapeHtml(escalatedByName)}` : ""
    }. Our team will review the order, the delivery and the messages between you.`,
    cta: { label: "View the order", href: `${SITE}/orders` },
    footerNote:
      "The payment stays in escrow until we decide. If you have anything that supports your side — files, screenshots, messages — add it to the order now; it's what we'll be looking at.",
    receivingBecause: "an order on your Tokun.World account",
  });

/** Decided. Both sides get this, with the numbers. */
exports.sendDisputeResolvedEmail = async ({
  to,
  recipientName,
  title,
  outcome,
  refundAmount,
  sellerPayout,
  decidedBy,
}) =>
  sendShellEmail({
    to,
    subject: `Dispute resolved on "${title || "your order"}"`,
    heading: "The dispute has been settled",
    accent: ACCENT.info,
    preheader: outcome ? String(outcome).slice(0, 120) : "Here's how the payment was split.",
    introHtml: `Hi ${escapeHtml(firstName(recipientName))}, the dispute on <strong style="color:#fff">${escapeHtml(
      title || "your order"
    )}</strong> has been settled${decidedBy ? ` by ${escapeHtml(decidedBy)}` : ""}.`,
    rows: [
      { label: outcome ? "Outcome" : "", value: outcome || "" },
      {
        label: refundAmount !== undefined ? "Refunded to the client" : "",
        value: refundAmount !== undefined ? rupees(refundAmount) : "",
      },
      {
        label: sellerPayout !== undefined ? "Paid to the creator" : "",
        value: sellerPayout !== undefined ? rupees(sellerPayout) : "",
        emphasis: true,
      },
    ],
    cta: { label: "View the order", href: `${SITE}/orders` },
    footerNote:
      "Refunds go back to the original payment method and usually take 5–7 working days. Creator payouts settle to the linked bank account in 2–3 working days.",
    receivingBecause: "an order on your Tokun.World account",
  });

/* ───────────────────────────── REFUND INTAKE ──────────────────────────── */

/**
 * "We got your refund request."
 *
 * The decision already emailed; the receipt didn't. Without it, a buyer who
 * files a request at midnight has no evidence it landed, and support gets a
 * "did you get my refund request?" message the next morning.
 */
exports.sendRefundRequestReceivedEmail = async ({ to, buyerName, itemTitle, amount, reason }) =>
  sendShellEmail({
    to,
    subject: `We've got your refund request for "${itemTitle || "your purchase"}"`,
    heading: "Refund request received",
    accent: ACCENT.info,
    preheader: "Our team is reviewing it — you'll get a decision by email.",
    introHtml: `Hi ${escapeHtml(
      firstName(buyerName)
    )}, we've received your refund request for <strong style="color:#fff">${escapeHtml(
      itemTitle || "your purchase"
    )}</strong> and it's with our team.`,
    rows: [
      { label: amount ? "Amount requested" : "", value: amount ? rupees(amount) : "" },
      { label: reason ? "Your reason" : "", value: reason || "" },
    ],
    cta: { label: "Track your refunds", href: `${SITE}/my-refunds` },
    footerNote:
      "Requests are usually reviewed within 1–2 working days, and we'll email you either way. If it's approved, the money goes back to your original payment method within 5–7 working days after that.",
    receivingBecause: "a refund request on your Tokun.World account",
  });
