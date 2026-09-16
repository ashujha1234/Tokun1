// Everything Tokun emails a BUYER or CLIENT that isn't an invoice or a refund.
//
// Invoices (services/email.service.js) and refunds (refundEmail.service.js)
// were already covered. What wasn't: every point between paying and the money
// being paid out. A client paid, and then heard nothing — not when the work
// arrived, not when their review window was about to expire and release the
// payment automatically, not when a dispute they were part of moved.
//
// The auto-release ones matter most. The money moves on a timer whether the
// client looks or not, so an email is the only honest way to run that clock.
//
// ── "Escrow" appears nowhere in these ──────────────────────────────────────
//
// It used to, eleven times: "held in escrow", "amount in escrow", "nothing
// moves out of escrow". It is a term of art, and these emails are read by
// someone who has just been told their money is somewhere they did not put it.
// Plain wording says the identical thing — Tokun holds the payment, nobody is
// paid until X — without asking the reader to already know a word.
//
// Best-effort at every call site, same rule as everywhere else.

const {
  ACCENT,
  SITE,
  escapeHtml,
  rupees,
  onDate,
  orderUrl,
  orderIdRow,
  sendShellEmail,
} = require("./emailLayout");

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
  orderId,
}) =>
  sendShellEmail({
    to,
    subject: `${creatorName || "Your creator"} delivered "${title || "your order"}"`,
    heading: "Your work has been delivered",
    accent: ACCENT.info,
    preheader: autoReleaseAt
      ? `Review it before ${onDate(autoReleaseAt)}, or the payment releases automatically.`
      : "Review it and approve or request changes.",
    greeting: firstName(clientName),
    introHtml: `${escapeHtml(
      creatorName || "Your creator"
    )} has submitted the work for <strong style="color:#fff">${escapeHtml(
      title || "your order"
    )}</strong>. Have a look and either approve it or ask for changes.`,
    rows: [
      orderIdRow(orderId),
      { label: amount ? "Payment held by Tokun" : "", value: amount ? rupees(amount) : "" },
      {
        label: autoReleaseAt ? "Releases automatically on" : "",
        value: autoReleaseAt ? onDate(autoReleaseAt) : "",
        emphasis: true,
      },
    ],
    cta: { label: "Review the delivery", href: `${SITE}${orderPath || "/orders"}` },
    footerNote: autoReleaseAt
      ? "If you don't approve or request changes by that date, the payment is released to the creator automatically. That's there so a delivered job can't be left in limbo — but it does mean the clock runs whether you open this or not."
      : "Tokun holds the payment until you approve it or request changes.",
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
  orderId,
}) =>
  sendShellEmail({
    to,
    subject: `Approve or request changes on "${title || "your order"}" — ${
      hoursLeft ? `${hoursLeft} hours left` : "closing soon"
    }`,
    heading: "Your review window is closing",
    accent: ACCENT.warn,
    preheader: `Payment releases to ${creatorName || "the creator"} on ${onDate(releasesAt)}.`,
    greeting: firstName(clientName),
    introHtml: `The work on <strong style="color:#fff">${escapeHtml(
      title || "your order"
    )}</strong> is still waiting for your review. When the window closes, the payment Tokun is holding is released to ${escapeHtml(
      creatorName || "the creator"
    )} automatically.`,
    rows: [
      orderIdRow(orderId),
      { label: amount ? "Payment held by Tokun" : "", value: amount ? rupees(amount) : "" },
      { label: "Releases on", value: onDate(releasesAt), emphasis: true },
    ],
    cta: { label: "Review it now", href: `${SITE}${orderPath || "/orders"}` },
    footerNote:
      "If something is wrong with the delivery, request changes or open a dispute before this date — both stop the timer. Once it releases, the money has gone to the creator and a refund is no longer straightforward.",
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
exports.sendDisputeOpenedEmail = async ({
  to,
  recipientName,
  openedByName,
  title,
  reason,
  amount,
  orderKind,
  orderId,
}) =>
  sendShellEmail({
    to,
    subject: `A dispute was opened on "${title || "your order"}"`,
    heading: "A dispute has been opened",
    accent: ACCENT.warn,
    preheader: `${openedByName || "The other party"} has raised a dispute. The payment stays held.`,
    greeting: firstName(recipientName),
    introHtml: `${escapeHtml(
      openedByName || "The other party"
    )} has opened a dispute on <strong style="color:#fff">${escapeHtml(
      title || "your order"
    )}</strong>. Nobody is paid while it's open.`,
    rows: [
      orderIdRow(orderId),
      { label: reason ? "Their reason" : "", value: reason || "" },
      { label: amount ? "Payment held by Tokun" : "", value: amount ? rupees(amount) : "" },
    ],
    /* "Open the dispute" now opens THE dispute. It pointed at /orders — the
       whole list — so the creator whose payout had just been frozen and who has
       to file a completion claim to get any of it arrived at a list of every
       booking they have and had to work out which one this was about. The
       #dispute fragment lands on the panel that holds the claim form; see the
       anchor in frontend/src/pages/OrderDetailPage.tsx. */
    cta: {
      label: "Open the dispute",
      href: orderUrl(orderKind, orderId, "#dispute") || `${SITE}/orders`,
    },
    footerNote:
      "Most disputes are settled between the two of you — you can propose a split from the order page. If you can't agree, either side can escalate it to Tokun and we'll decide based on what was delivered.",
    receivingBecause: "an order on your Tokun.World account",
  });

/** Escalated to Tokun — neither side is deciding this any more. */
exports.sendDisputeEscalatedEmail = async ({
  to,
  recipientName,
  title,
  escalatedByName,
  orderKind,
  orderId,
}) =>
  sendShellEmail({
    to,
    subject: `"${title || "Your order"}" has been escalated to Tokun`,
    heading: "The dispute is now with our team",
    accent: ACCENT.warn,
    preheader: "We'll review what was agreed and delivered, then decide.",
    greeting: firstName(recipientName),
    introHtml: `The dispute on <strong style="color:#fff">${escapeHtml(
      title || "your order"
    )}</strong> has been escalated to Tokun${
      escalatedByName ? ` by ${escapeHtml(escalatedByName)}` : ""
    }. Our team will review the order, the delivery and the messages between you.`,
    rows: [orderIdRow(orderId)],
    /* The footer note asks them to add their evidence to the order, so the
       button has to open that order — not the list it sits in. */
    cta: {
      label: "Add your evidence",
      href: orderUrl(orderKind, orderId, "#dispute") || `${SITE}/orders`,
    },
    footerNote:
      "Tokun holds the payment until we decide. If you have anything that supports your side — files, screenshots, messages — add it to the order now; it's what we'll be looking at.",
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
  orderKind,
  orderId,
}) =>
  sendShellEmail({
    to,
    subject: `Dispute resolved on "${title || "your order"}"`,
    heading: "The dispute has been settled",
    accent: ACCENT.info,
    preheader: outcome ? String(outcome).slice(0, 120) : "Here's how the payment was split.",
    greeting: firstName(recipientName),
    introHtml: `The dispute on <strong style="color:#fff">${escapeHtml(
      title || "your order"
    )}</strong> has been settled${decidedBy ? ` by ${escapeHtml(decidedBy)}` : ""}.`,
    rows: [
      orderIdRow(orderId),
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
    /* Lands on the settled outcome rather than the top of the order — by the
       time this is read the dispute panel is gone and "How this was settled" is
       what the reader came for. Same anchor, which the order page hands over
       once the dispute closes. */
    cta: {
      label: "See the full decision",
      href: orderUrl(orderKind, orderId, "#dispute") || `${SITE}/orders`,
    },
    footerNote:
      "Refunds go back to the original payment method and usually take 5–7 working days. Creator payouts settle to the linked bank account in 2–3 working days.",
    receivingBecause: "an order on your Tokun.World account",
  });

/* ────────────────────────── ACCESS CHECKLIST ──────────────────────────── */

/**
 * The creator is waiting on you, and has been for a while.
 *
 * Nothing chased this before. A creator could raise a structured ask, the client
 * could never open it, and the only thing that happened was that the creator ran
 * out of time — the checklist recorded the delay for a dispute nobody had
 * started yet. This is the message that stops the delay instead of documenting
 * it.
 *
 * Deliberately says the deadline moved. That is the part a client acts on:
 * "send the files" is a chore, "your delivery date has already slipped four days
 * and is still slipping" is a consequence.
 */
exports.sendAccessItemsPendingEmail = async ({
  to,
  clientName,
  creatorName,
  title,
  items = [],
  waitingDays,
  extendedDays,
  orderKind,
  orderId,
}) =>
  sendShellEmail({
    to,
    subject: `${creatorName || "Your creator"} is waiting on ${items.length} thing${
      items.length === 1 ? "" : "s"
    } for "${title || "your order"}"`,
    heading: "Your creator can't finish without these",
    accent: ACCENT.warn,
    preheader: `${items.length} outstanding item${items.length === 1 ? "" : "s"}${
      waitingDays ? ` — waiting ${waitingDays} day${waitingDays === 1 ? "" : "s"}` : ""
    }.`,
    greeting: firstName(clientName),
    introHtml: `${escapeHtml(
      creatorName || "Your creator"
    )} asked you for a few things before the work on <strong style="color:#fff">${escapeHtml(
      title || "your order"
    )}</strong> can be finished, and ${
      waitingDays
        ? `has been waiting ${waitingDays} day${waitingDays === 1 ? "" : "s"}`
        : "is still waiting"
    }.`,
    rows: [
      orderIdRow(orderId),
      {
        label: "Still needed",
        /* One line each rather than a count: a client who sees "3 items" has to
           open the app to find out whether any of them is something they could
           deal with in a minute. */
        value: items.map((i) => `- ${i}`).join("\n"),
        block: true,
      },
      {
        label: extendedDays ? "Delivery date moved by" : "",
        value: extendedDays ? `${extendedDays} day${extendedDays === 1 ? "" : "s"}` : "",
        emphasis: true,
      },
    ],
    cta: {
      label: "Send what's needed",
      href: orderUrl(orderKind, orderId, "#access-checklist") || `${SITE}/orders`,
    },
    footerNote:
      "The delivery date extends for as long as any of this is outstanding, so the work lands later for every day it waits. If you can't provide something, say so on the item — a clear \"we don't have this\" lets the creator work around it, and is far better than silence.",
    receivingBecause: "an order you paid for on Tokun.World",
  });


/* ───────────────────────────── REFUND INTAKE ──────────────────────────── */

/**
 * "We got your refund request."
 *
 * The decision already emailed; the receipt didn't. Without it, a buyer who
 * files a request at midnight has no evidence it landed, and support gets a
 * "did you get my refund request?" message the next morning.
 */
exports.sendRefundRequestReceivedEmail = async ({
  to,
  buyerName,
  itemTitle,
  amount,
  reason,
  orderId,
  refundRequestId,
  /* The two dates this email is read against: when the money went out, and
     when the request landed. The 24-hour refund window is the gap between
     them, so a buyer who is later told they were outside it can see for
     themselves rather than take our word for it. */
  purchasedAt,
  requestedAt,
}) =>
  sendShellEmail({
    to,
    subject: `We've got your refund request for "${itemTitle || "your purchase"}"`,
    heading: "Refund request received",
    accent: ACCENT.info,
    preheader: "Our team is reviewing it — you'll get a decision by email.",
    greeting: firstName(buyerName),
    introHtml: `We've received your refund request for <strong style="color:#fff">${escapeHtml(
      itemTitle || "your purchase"
    )}</strong> and it's with our team.`,
    rows: [
      orderIdRow(orderId),
      { label: purchasedAt ? "Purchased on" : "", value: purchasedAt ? onDate(purchasedAt) : "" },
      { label: requestedAt ? "Requested on" : "", value: requestedAt ? onDate(requestedAt) : "" },
      { label: amount ? "Amount requested" : "", value: amount ? rupees(amount) : "" },
      { label: reason ? "Your reason" : "", value: reason || "" },
    ],
    /* Singular, and pointed at this one. "Track your refunds" opening the whole
       list is the same problem as the dispute link: the person clicking it has
       one request in mind and the page gave them all of them. /my-refunds
       scrolls to and rings the id it is given. */
    cta: {
      label: "Track this refund",
      href: refundRequestId
        ? `${SITE}/my-refunds?request=${refundRequestId}`
        : `${SITE}/my-refunds`,
    },
    footerNote:
      "Requests are usually reviewed within 1–2 working days, and we'll email you either way. If it's approved, the money goes back to your original payment method within 5–7 working days after that.",
    receivingBecause: "a refund request on your Tokun.World account",
  });
