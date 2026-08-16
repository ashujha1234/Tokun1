// Everything Tokun emails a CREATOR — the person selling prompts, services or
// their time.
//
// Before this file, a creator got exactly three emails in the entire product:
// an escrow settlement, and two "your request expired" notices from the cron.
// Everything else — a sale, a payout account going live, a product being
// approved or rejected, a booking landing, money being released — existed only
// as an in-app notification. That is the wrong medium for all of it: a creator
// is not sitting in the dashboard waiting, and the two expiry emails prove the
// point, since both fire only after a creator has already missed something they
// were never told about.
//
// Every function here is best-effort at the call site. A sale is recorded, a
// payout is made and a product goes live whether or not SMTP is reachable —
// none of these may ever throw into the flow that called them.

const { ACCENT, SITE, escapeHtml, rupees, onDate, sendShellEmail } = require("./emailLayout");

const firstName = (name) => String(name || "there").trim().split(/\s+/)[0];

/* ─────────────────────────── SELLING PRODUCTS ─────────────────────────── */

/**
 * Someone bought your product.
 *
 * The single biggest gap in the old setup: the BUYER got an invoice and the
 * seller — whose money it is — got nothing but a notification badge. The
 * numbers are itemised because "you sold something" without "and this is what
 * you'll be paid" is the half of it creators actually write in asking about.
 */
exports.sendPromptSoldEmail = async ({
  to,
  sellerName,
  productTitle,
  buyerName,
  salePrice,
  platformCut,
  netEarning,
  soldAt,
}) =>
  sendShellEmail({
    to,
    subject: `You sold "${productTitle || "a product"}" — ${rupees(netEarning)} on its way`,
    heading: "You made a sale",
    accent: ACCENT.money,
    preheader: `${rupees(netEarning)} from "${productTitle || "your product"}"`,
    introHtml: `Hi ${escapeHtml(firstName(sellerName))}, ${escapeHtml(
      buyerName || "someone"
    )} just bought <strong style="color:#fff">${escapeHtml(
      productTitle || "your product"
    )}</strong>.`,
    rows: [
      { label: "Sold on", value: onDate(soldAt || new Date()) },
      { label: "Sale price", value: rupees(salePrice) },
      { label: "Tokun fee", value: `− ${rupees(platformCut)}` },
      { label: "You receive", value: rupees(netEarning), emphasis: true },
    ],
    cta: { label: "View your sales", href: `${SITE}/self-dash?tab=prompts&p=uploaded` },
    footerNote:
      "Your share is transferred to your linked bank account by Razorpay — it usually settles within 2–3 working days. Buyers can request a refund within 24 hours of purchase; if one is approved, we'll email you separately.",
    receivingBecause: "a sale on your Tokun.World creator account",
  });

/* ──────────────────────── PAYOUT ACCOUNT (RAZORPAY) ───────────────────── */

/**
 * Your payout account is live — this is the moment selling actually starts.
 *
 * Until Razorpay activates the linked account, a creator's products are hidden
 * from buyers. That state was communicated by a banner on a dashboard the
 * creator had no reason to revisit, so people waited days without knowing they
 * were already clear to sell.
 */
exports.sendPayoutAccountActivatedEmail = async ({ to, creatorName }) =>
  sendShellEmail({
    to,
    subject: "Your payout account is active — your products are live",
    heading: "You're ready to get paid",
    accent: ACCENT.money,
    preheader: "Razorpay has verified your account. Your products are visible to buyers.",
    introHtml: `Hi ${escapeHtml(
      firstName(creatorName)
    )}, Razorpay has finished verifying your payout account. Your products are now visible to buyers and any sale is transferred straight to your bank account.`,
    cta: { label: "Go to your dashboard", href: `${SITE}/self-dash` },
    footerNote:
      "Nothing else is needed from you. If you change your bank details later, the account goes back for verification and your products are hidden until it clears again.",
    receivingBecause: "your Tokun.World payout account",
  });

/**
 * Razorpay wants something from you before you can be paid.
 *
 * One function for REJECTED / NEEDS_CLARIFICATION / SUSPENDED, because the
 * only real difference is the sentence in the middle — and three near-identical
 * templates would drift.
 */
exports.sendPayoutAccountNeedsAttentionEmail = async ({ to, creatorName, status, message }) => {
  const copy = {
    NEEDS_CLARIFICATION: {
      subject: "Action needed on your payout account",
      heading: "Razorpay needs a bit more from you",
      line: "Razorpay has asked for more information before it can verify your payout account. Until that's resolved, your products stay hidden from buyers.",
    },
    REJECTED: {
      subject: "Your payout account couldn't be verified",
      heading: "Payout verification failed",
      line: "Razorpay couldn't verify the details you submitted, so your payout account hasn't been set up. You can correct them and submit again — this is usually a mismatch between the name, PAN or bank account.",
    },
    SUSPENDED: {
      subject: "Your payout account has been suspended",
      heading: "Payouts are on hold",
      line: "Your payout account has been suspended, so nothing can be paid out and your products are hidden from buyers.",
    },
  }[String(status || "").toUpperCase()] || {
    subject: "Action needed on your payout account",
    heading: "Your payout account needs attention",
    line: "Something needs sorting out on your payout account before you can be paid.",
  };

  return sendShellEmail({
    to,
    subject: copy.subject,
    heading: copy.heading,
    accent: status === "REJECTED" || status === "SUSPENDED" ? ACCENT.danger : ACCENT.warn,
    preheader: "Your products stay hidden from buyers until this is resolved.",
    introHtml: `Hi ${escapeHtml(firstName(creatorName))}, ${escapeHtml(copy.line)}`,
    rows: message ? [{ label: "What Razorpay said", value: message }] : [],
    cta: { label: "Fix it now", href: `${SITE}/self-dash` },
    footerNote:
      "Open your dashboard and use the payout banner at the top to resubmit. Anything you've already sold is unaffected — this only blocks new sales and transfers.",
    receivingBecause: "your Tokun.World payout account",
  });
};

/* ────────────────────────── PRODUCT MODERATION ────────────────────────── */

/** Your product passed review and is on the marketplace. */
exports.sendProductApprovedEmail = async ({ to, creatorName, productTitle, productId }) =>
  sendShellEmail({
    to,
    subject: `"${productTitle || "Your product"}" is live on Tokun`,
    heading: "Your product is live",
    accent: ACCENT.money,
    preheader: "It's approved and buyers can find it now.",
    introHtml: `Hi ${escapeHtml(
      firstName(creatorName)
    )}, <strong style="color:#fff">${escapeHtml(
      productTitle || "your product"
    )}</strong> has passed review and is now listed on the marketplace.`,
    cta: {
      label: "See it on the marketplace",
      href: productId ? `${SITE}/prompt-marketplace?prompt=${productId}` : `${SITE}/prompt-marketplace`,
    },
    footerNote:
      "We'll email you the moment it sells. Products can be edited any time from My Products — significant changes go back through review.",
    receivingBecause: "a product you uploaded to Tokun.World",
  });

/**
 * Review didn't pass. Covers both outright rejection and "fix this and
 * resubmit", because to the creator they are the same task with a different
 * amount of hope attached — and the reason is the only part that matters.
 */
exports.sendProductRejectedEmail = async ({
  to,
  creatorName,
  productTitle,
  reason,
  editable = true,
}) =>
  sendShellEmail({
    to,
    subject: editable
      ? `Changes needed on "${productTitle || "your product"}"`
      : `"${productTitle || "Your product"}" wasn't approved`,
    heading: editable ? "Your product needs changes" : "Your product wasn't approved",
    accent: editable ? ACCENT.warn : ACCENT.danger,
    preheader: reason ? String(reason).slice(0, 120) : "Review didn't pass.",
    introHtml: `Hi ${escapeHtml(
      firstName(creatorName)
    )}, we reviewed <strong style="color:#fff">${escapeHtml(
      productTitle || "your product"
    )}</strong> and ${
      editable
        ? "it needs a few changes before it can go live."
        : "unfortunately it can't be listed as it is."
    }`,
    rows: reason ? [{ label: "Reason", value: reason }] : [],
    cta: { label: "Open My Products", href: `${SITE}/self-dash?tab=prompts&p=uploaded` },
    footerNote: editable
      ? "Edit the product from My Products and submit it again — it goes back into the review queue straight away."
      : "If you think this was a mistake, reply to this email or contact support and we'll take another look.",
    receivingBecause: "a product you uploaded to Tokun.World",
  });

/** Someone reported one of your products and it's been pulled pending review. */
exports.sendProductReportedEmail = async ({ to, creatorName, productTitle, reason, takenDown }) =>
  sendShellEmail({
    to,
    subject: `A report was filed against "${productTitle || "your product"}"`,
    heading: takenDown ? "Your product has been hidden" : "Your product was reported",
    accent: ACCENT.warn,
    preheader: takenDown
      ? "It's hidden from buyers while we review the report."
      : "We're reviewing a report about it.",
    introHtml: `Hi ${escapeHtml(
      firstName(creatorName)
    )}, someone reported <strong style="color:#fff">${escapeHtml(
      productTitle || "your product"
    )}</strong>${
      takenDown
        ? ", and it's been hidden from the marketplace while our team reviews it"
        : ", and our team is reviewing it"
    }.`,
    rows: reason ? [{ label: "Reported for", value: reason }] : [],
    cta: { label: "Open My Products", href: `${SITE}/self-dash?tab=prompts&p=uploaded` },
    footerNote:
      "You don't need to do anything yet. If the report doesn't hold up, the product goes back to normal and nothing changes. If it does, we'll email you with what needs fixing. Sales already made are not affected.",
    receivingBecause: "a product you uploaded to Tokun.World",
  });

/** Selling privileges suspended. */
exports.sendSellingSuspendedEmail = async ({ to, creatorName, reason }) =>
  sendShellEmail({
    to,
    subject: "Your selling access has been suspended",
    heading: "Selling is suspended on your account",
    accent: ACCENT.danger,
    preheader: "Your products are hidden and new sales are blocked.",
    introHtml: `Hi ${escapeHtml(
      firstName(creatorName)
    )}, selling has been suspended on your Tokun account. Your products are hidden from the marketplace and you can't take new orders.`,
    rows: reason ? [{ label: "Reason", value: reason }] : [],
    footerNote:
      "Money already earned and any work in progress is unaffected — existing orders still settle normally. Reply to this email if you'd like this reviewed.",
    receivingBecause: "your Tokun.World creator account",
  });

/* ─────────────────────── WORK: REQUESTS AND ORDERS ────────────────────── */

/**
 * A client wants to hire you / has booked a service.
 *
 * This is the email the whole system was missing. The cron already emails a
 * creator when a request EXPIRES after 7 days of silence — a message that only
 * ever needs sending because nothing told them it had arrived.
 */
exports.sendNewWorkRequestEmail = async ({
  to,
  creatorName,
  clientName,
  title,
  amount,
  kind = "project", // "project" | "booking"
  respondWithinDays,
  deliveryDate,
}) =>
  sendShellEmail({
    to,
    subject: `New ${kind} request from ${clientName || "a client"}${
      amount ? ` — ${rupees(amount)}` : ""
    }`,
    heading: kind === "booking" ? "You have a new booking" : "You have a new project request",
    accent: ACCENT.warn,
    preheader: respondWithinDays
      ? `Respond within ${respondWithinDays} days or it closes automatically.`
      : "A client is waiting on your reply.",
    introHtml: `Hi ${escapeHtml(firstName(creatorName))}, <strong style="color:#fff">${escapeHtml(
      clientName || "a client"
    )}</strong> has sent you a ${escapeHtml(kind)} request for <strong style="color:#fff">${escapeHtml(
      title || "your work"
    )}</strong>.`,
    rows: [
      { label: "Client", value: clientName || "—" },
      { label: kind === "booking" ? "Booking" : "Project", value: title || "—" },
      { label: amount ? "Amount" : "", value: amount ? rupees(amount) : "", emphasis: true },
      { label: deliveryDate ? "Wanted by" : "", value: deliveryDate ? onDate(deliveryDate) : "" },
    ],
    cta: { label: "Open the request", href: `${SITE}/self-dash?tab=requests` },
    footerNote: respondWithinDays
      ? `Requests close automatically after ${respondWithinDays} days without a reply, and the client is free to take it elsewhere. Accepting is not a commitment to start — payment is held in escrow until you deliver.`
      : "Payment is held in escrow until you deliver and the client approves, so you're covered either way.",
    receivingBecause: "a request sent to you on Tokun.World",
  });

/** The client asked for changes before approving. */
exports.sendRevisionRequestedEmail = async ({ to, creatorName, clientName, title, note, dueAt }) =>
  sendShellEmail({
    to,
    subject: `Revision requested on "${title || "your delivery"}"`,
    heading: "The client asked for changes",
    accent: ACCENT.warn,
    preheader: note ? String(note).slice(0, 120) : "Your delivery needs another pass.",
    introHtml: `Hi ${escapeHtml(firstName(creatorName))}, ${escapeHtml(
      clientName || "the client"
    )} has reviewed your work on <strong style="color:#fff">${escapeHtml(
      title || "the order"
    )}</strong> and asked for changes before approving it.`,
    rows: [
      { label: note ? "What they asked for" : "", value: note || "" },
      { label: dueAt ? "New due date" : "", value: dueAt ? onDate(dueAt) : "" },
    ],
    cta: { label: "Open the order", href: `${SITE}/orders` },
    footerNote:
      "The payment stays in escrow until the revision is approved. If the request is unreasonable or outside what was agreed, open a dispute from the order and our team will look at it.",
    receivingBecause: "an order on your Tokun.World creator account",
  });

/** Escrow released — the client approved, or the auto-release timer ran out. */
exports.sendEscrowReleasedEmail = async ({
  to,
  creatorName,
  title,
  amount,
  automatic = false,
  clientName,
}) =>
  sendShellEmail({
    to,
    subject: `${rupees(amount)} released for "${title || "your work"}"`,
    heading: "You've been paid",
    accent: ACCENT.money,
    preheader: automatic
      ? "The review window closed, so the payment was released automatically."
      : `${clientName || "The client"} approved your work.`,
    introHtml: `Hi ${escapeHtml(firstName(creatorName))}, ${
      automatic
        ? "the review window on"
        : `${escapeHtml(clientName || "the client")} has approved your work on`
    } <strong style="color:#fff">${escapeHtml(title || "the order")}</strong>${
      automatic ? " closed without changes being requested" : ""
    }, and the escrow has been released to you.`,
    rows: [
      { label: "Released to you", value: rupees(amount), emphasis: true },
      { label: "Released", value: automatic ? "Automatically (review window passed)" : "By the client" },
    ],
    cta: { label: "View your earnings", href: `${SITE}/self-dash` },
    footerNote:
      "Razorpay transfers this to your linked bank account — it usually settles within 2–3 working days.",
    receivingBecause: "an order on your Tokun.World creator account",
  });

/** A buyer left you a review. */
exports.sendReviewReceivedEmail = async ({ to, creatorName, reviewerName, rating, comment, title }) =>
  sendShellEmail({
    to,
    subject: `${reviewerName || "A client"} left you a ${rating ? `${rating}-star ` : ""}review`,
    heading: "You have a new review",
    accent: Number(rating) >= 4 ? ACCENT.money : ACCENT.info,
    preheader: comment ? String(comment).slice(0, 120) : "A client reviewed your work.",
    introHtml: `Hi ${escapeHtml(firstName(creatorName))}, ${escapeHtml(
      reviewerName || "a client"
    )} left a review${title ? ` on <strong style="color:#fff">${escapeHtml(title)}</strong>` : ""}.`,
    rows: [
      { label: rating ? "Rating" : "", value: rating ? `${rating} / 5` : "", emphasis: true },
      { label: comment ? "What they said" : "", value: comment || "" },
    ],
    cta: { label: "See your profile", href: `${SITE}/self-dash` },
    footerNote:
      "Reviews show on your public profile and on everything you list — they're the main thing buyers read before hiring.",
    receivingBecause: "a review left on your Tokun.World profile",
  });

/* ───────────────────────── SUPER CREATOR STATUS ───────────────────────── */

/**
 * Intro video approved — the moment a creator becomes a Super Creator and can
 * actually list services and take hire work. Everything before this point is
 * setup; this is the unlock, and it was previously a silent one.
 */
exports.sendIntroVideoApprovedEmail = async ({ to, creatorName }) =>
  sendShellEmail({
    to,
    subject: "You're approved — you can start selling services on Tokun",
    heading: "You're a Super Creator",
    accent: ACCENT.money,
    preheader: "Your intro video is approved. Services and hire work are unlocked.",
    introHtml: `Hi ${escapeHtml(
      firstName(creatorName)
    )}, your intro video has been approved. Your profile is live in Find Creators, and you can now list services and accept project requests.`,
    cta: { label: "List your first service", href: `${SITE}/self-dash` },
    footerNote:
      "Clients pay into escrow before you start, so the money is committed before the work is. Keep your response time short — requests close automatically after 7 days of silence.",
    receivingBecause: "your Tokun.World creator profile",
  });

/** Intro video rejected — say why, and make resubmitting the obvious next step. */
exports.sendIntroVideoRejectedEmail = async ({ to, creatorName, reason }) =>
  sendShellEmail({
    to,
    subject: "Your intro video needs another take",
    heading: "Your intro video wasn't approved",
    accent: ACCENT.warn,
    preheader: reason ? String(reason).slice(0, 120) : "Record another one and resubmit.",
    introHtml: `Hi ${escapeHtml(
      firstName(creatorName)
    )}, we reviewed your intro video and it isn't quite there yet. You can record another one and submit it straight away — there's no waiting period.`,
    rows: reason ? [{ label: "What needs fixing", value: reason }] : [],
    cta: { label: "Upload a new video", href: `${SITE}/self-dash` },
    footerNote:
      "Until a video is approved you can still sell prompts, but services and hire work stay locked. Keep it under a minute, well-lit, and say what you do and who you do it for.",
    receivingBecause: "your Tokun.World creator profile",
  });

/**
 * Profile finished and live, but the video is still in the queue.
 *
 * The genuinely confusing state: onboarding says "done", the profile is ACTIVE,
 * and the creator assumes they're selling — while the video gate quietly blocks
 * every service and hire listing. Nothing told them.
 */
exports.sendIntroVideoPendingEmail = async ({ to, creatorName }) =>
  sendShellEmail({
    to,
    subject: "Your profile is live — one review left before you can sell services",
    heading: "Almost there",
    accent: ACCENT.info,
    preheader: "Your intro video is with our reviewers. Services unlock once it's approved.",
    introHtml: `Hi ${escapeHtml(
      firstName(creatorName)
    )}, your creator profile is complete and live. One thing is still pending: your intro video is with our reviewers, and services and hire work stay locked until it's approved.`,
    cta: { label: "Check your status", href: `${SITE}/self-dash` },
    footerNote:
      "Reviews are usually done within a working day, and we'll email you either way. In the meantime you can upload and sell prompts as normal.",
    receivingBecause: "your Tokun.World creator profile",
  });
