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

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const SITE = (process.env.SITE_URL || "").replace(/\/$/, "");

/* Same table-and-inline-styles shell as the refund emails, for the same reason:
   email clients strip <style> blocks and don't do flexbox. Kept visually in
   line with those so both look like they came from the same product. */
function shell({ heading, accent, introHtml, rows, footerNote, cta }) {
  const rowsHtml = (rows || [])
    .map(
      (r) => `
      <tr>
        <td style="padding:11px 0;font-size:13px;color:rgba(255,255,255,0.55);border-bottom:1px solid #222222">
          ${escapeHtml(r.label)}
        </td>
        <td align="right" style="padding:11px 0;font-size:13px;color:${r.emphasis ? accent : "#ffffff"};font-weight:${r.emphasis ? 700 : 400};border-bottom:1px solid #222222">
          ${escapeHtml(r.value)}
        </td>
      </tr>`
    )
    .join("");

  const ctaHtml = cta
    ? `<tr><td style="padding:4px 28px 26px">
         <a href="${cta.href}" style="display:inline-block;padding:12px 22px;border-radius:100px;background:${accent};color:#0B0B0D;font-size:14px;font-weight:700;text-decoration:none">${escapeHtml(cta.label)}</a>
       </td></tr>`
    : "";

  return `
  <div style="margin:0;padding:0;background:#0B0B0D;font-family:Inter,Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B0B0D;padding:32px 16px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#121214;border:1px solid #232326;border-radius:16px;overflow:hidden">
          <tr><td style="height:4px;background:${accent};line-height:4px;font-size:0">&nbsp;</td></tr>
          <tr><td style="padding:28px 28px 8px">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;color:${accent};text-transform:uppercase">Tokun.World</p>
            <h1 style="margin:0;font-size:22px;line-height:30px;color:#ffffff;font-weight:800">${escapeHtml(heading)}</h1>
          </td></tr>
          <tr><td style="padding:12px 28px 0;font-size:14px;line-height:22px;color:rgba(255,255,255,0.65)">
            ${introHtml}
          </td></tr>
          <tr><td style="padding:20px 28px 4px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
          </td></tr>
          <tr><td style="padding:22px 28px 0">&nbsp;</td></tr>
          ${ctaHtml}
          <tr><td style="padding:0 28px 28px;font-size:12px;line-height:19px;color:rgba(255,255,255,0.40)">
            ${footerNote}
          </td></tr>
        </table>
        <p style="margin:18px 0 0;font-size:11px;color:rgba(255,255,255,0.28)">
          You're receiving this because of a request on your Tokun.World account.
        </p>
      </td></tr>
    </table>
  </div>`;
}

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
