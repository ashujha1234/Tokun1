// Emails for a request that was closed because nobody answered it.
//
// The in-app notification alone isn't enough here. A client who sent a hire
// proposal and heard nothing has stopped opening the app — that's exactly the
// person the notification never reaches. The email is what tells them the
// request is dead, that they weren't charged, and that they're free to send it
// to someone else.
//
// Both sides get one, for different reasons: the client needs to know they can
// move on, the creator needs to know they let a paying request lapse.
//
// Best-effort at the call site: the request has already been cancelled in the
// database, and SMTP being down must not undo that or stop the run.

const transporter = require("../utils/mailer");
/* Shell/escaping/site URL come from services/emailLayout.js — see the note
   there about the three copies this design used to have. */
const { escapeHtml, SITE, shell } = require("./emailLayout");

// Said on every one of these. It's the first question either side has.
const NO_CHARGE_NOTE =
  "No payment was taken at any point — this request never reached the payment stage, so there is nothing to refund and nothing to do.";

/**
 * To the CLIENT: your hire proposal expired because the creator never replied.
 */
exports.sendHireRequestExpiredToClient = async ({
  to,
  clientName,
  freelancerName,
  title,
  days,
  amount,
}) => {
  if (!to) return;

  const rows = [
    { label: "Project", value: title || "—" },
    { label: "Sent to", value: freelancerName || "the creator" },
    { label: "Waited", value: `${days} days, no response`, emphasis: true },
  ];
  if (amount) rows.push({ label: "Proposed budget", value: `₹${Number(amount).toLocaleString("en-IN")}` });

  const html = shell({
    heading: "Your request was closed",
    accent: "#FABC4E",
    introHtml: `Hi ${escapeHtml(clientName || "there")}, ${escapeHtml(
      freelancerName || "the creator"
    )} didn't respond to your request within ${days} days, so we've closed it. You're free to send the same brief to someone else.`,
    rows,
    footerNote: NO_CHARGE_NOTE,
    cta: SITE ? { href: `${SITE}/find-creators`, label: "Find another creator" } : null,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Request closed — no response for "${title || "your project"}"`,
    html,
  });
};

/**
 * To the CREATOR: a request you never opened has expired.
 *
 * Worth sending even though it reflects badly on them — a creator who has
 * simply stopped getting notification emails should find out that real work
 * came in and went away again.
 */
exports.sendHireRequestExpiredToFreelancer = async ({
  to,
  freelancerName,
  clientName,
  title,
  days,
  amount,
}) => {
  if (!to) return;

  const rows = [
    { label: "Project", value: title || "—" },
    { label: "From", value: clientName || "a client" },
    { label: "Expired after", value: `${days} days`, emphasis: true },
  ];
  if (amount) rows.push({ label: "Budget", value: `₹${Number(amount).toLocaleString("en-IN")}` });

  const html = shell({
    heading: "A request expired before you replied",
    accent: "#FABC4E",
    introHtml: `Hi ${escapeHtml(freelancerName || "there")}, a request from ${escapeHtml(
      clientName || "a client"
    )} went unanswered for ${days} days, so it was closed automatically. Replying within ${days} days keeps requests open.`,
    rows,
    footerNote: NO_CHARGE_NOTE,
    cta: SITE ? { href: `${SITE}/orders`, label: "Open my requests" } : null,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Request expired — "${title || "a project"}"`,
    html,
  });
};

/**
 * To the CLIENT: your service booking expired because payment was never made.
 *
 * Deliberately worded differently from the hire version. A service booking has
 * no acceptance step — the ball was in the client's court the whole time, and
 * telling them "the creator didn't respond" would be false.
 */
exports.sendServiceRequestExpiredToClient = async ({ to, clientName, title, days, amount }) => {
  if (!to) return;

  const rows = [
    { label: "Service", value: title || "—" },
    { label: "Closed after", value: `${days} days unpaid`, emphasis: true },
  ];
  if (amount) rows.push({ label: "Amount", value: `₹${Number(amount).toLocaleString("en-IN")}` });

  const html = shell({
    heading: "Your booking request was closed",
    accent: "#FABC4E",
    introHtml: `Hi ${escapeHtml(
      clientName || "there"
    )}, your booking wasn't paid for within ${days} days, so we've closed the request. You can book the same service again whenever you're ready.`,
    rows,
    footerNote: NO_CHARGE_NOTE,
    cta: SITE ? { href: `${SITE}/find-creators`, label: "Browse services" } : null,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Booking closed — "${title || "your booking"}"`,
    html,
  });
};

/** To the CREATOR: a booking request on your service lapsed unpaid. */
exports.sendServiceRequestExpiredToSeller = async ({
  to,
  sellerName,
  clientName,
  title,
  days,
  amount,
}) => {
  if (!to) return;

  const rows = [
    { label: "Service", value: title || "—" },
    { label: "From", value: clientName || "a client" },
    { label: "Closed after", value: `${days} days unpaid`, emphasis: true },
  ];
  if (amount) rows.push({ label: "Amount", value: `₹${Number(amount).toLocaleString("en-IN")}` });

  const html = shell({
    heading: "A booking request expired",
    accent: "#FABC4E",
    introHtml: `Hi ${escapeHtml(sellerName || "there")}, a booking request from ${escapeHtml(
      clientName || "a client"
    )} was closed because payment wasn't completed within ${days} days.`,
    rows,
    footerNote: NO_CHARGE_NOTE,
    cta: SITE ? { href: `${SITE}/orders`, label: "Open my orders" } : null,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Booking request expired — "${title || "a service"}"`,
    html,
  });
};
