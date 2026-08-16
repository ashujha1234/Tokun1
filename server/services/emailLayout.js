// The one HTML shell every transactional email on Tokun is built from.
//
// This markup already existed twice — once in refundEmail.service.js and once,
// with a CTA button bolted on, in requestExpiryEmail.service.js. A third copy
// was about to be written for the creator/buyer/admin emails, and by then the
// three would have drifted the first time anyone touched padding. Both original
// copies now import from here, so there is exactly one place where a Tokun
// email's shape is decided.
//
// Deliberately table-and-inline-styles throughout: email clients strip <style>
// blocks and don't do flexbox or grid. Dark palette, matching the invoice
// template in htmltemplate/invoiceEmail.html.

const transporter = require("../utils/mailer");

/* The accent runs down the top bar, the eyebrow and any CTA. Picked by MEANING,
   not by taste — a creator learns to read the colour before the words:
     money   money has moved in your favour
     info    something happened, no action needed
     warn    you have to do something, or something is waiting on you
     danger  rejected, removed, suspended, lost
     brand   Tokun itself — plans, account, platform news */
const ACCENT = {
  money: "#22C55E",
  info: "#1A73E8",
  warn: "#F59E0B",
  danger: "#EF4444",
  brand: "#FF14EF",
};

const SITE = (process.env.SITE_URL || "https://tokun.world").replace(/\/$/, "");

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const rupees = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/* Dates on an email are read days later, out of context, so they carry the year
   and no time — "16 Aug 2026", never "today" or "in 2 days". */
const onDate = (value) => {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

/**
 * @param {object}  opts
 * @param {string}  opts.heading      the one line that says what happened
 * @param {string}  opts.accent       one of ACCENT
 * @param {string}  opts.introHtml    already-escaped HTML; 1–3 sentences
 * @param {Array}   [opts.rows]       [{label, value, emphasis}] detail table
 * @param {object}  [opts.cta]        {label, href}
 * @param {string}  [opts.footerNote] the "what happens next" line
 * @param {string}  [opts.preheader]  inbox preview text, hidden in the body
 * @param {string}  [opts.receivingBecause]
 */
function shell({
  heading,
  accent = ACCENT.info,
  introHtml,
  rows,
  footerNote,
  cta,
  preheader,
  receivingBecause = "activity on your Tokun.World account",
}) {
  const rowsHtml = (rows || [])
    .filter((r) => r && r.value !== undefined && r.value !== null && r.value !== "")
    .map(
      (r) => `
      <tr>
        <td style="padding:11px 0;font-size:13px;color:rgba(255,255,255,0.55);border-bottom:1px solid #222222">
          ${escapeHtml(r.label)}
        </td>
        <td align="right" style="padding:11px 0;font-size:13px;color:${
          r.emphasis ? accent : "#ffffff"
        };font-weight:${r.emphasis ? 700 : 400};border-bottom:1px solid #222222">
          ${escapeHtml(r.value)}
        </td>
      </tr>`
    )
    .join("");

  const tableHtml = rowsHtml
    ? `<tr><td style="padding:20px 28px 4px">
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
       </td></tr>`
    : "";

  /* Dark text on the accent, not white: every accent here is a mid-tone, and
     white-on-amber is unreadable in the one place it matters most. */
  const ctaHtml = cta
    ? `<tr><td style="padding:22px 28px 4px">
         <a href="${cta.href}" style="display:inline-block;padding:12px 22px;border-radius:100px;background:${accent};color:#0B0B0D;font-size:14px;font-weight:700;text-decoration:none">${escapeHtml(
           cta.label
         )}</a>
       </td></tr>`
    : "";

  // Gmail and Outlook show this next to the subject. Without it they pull the
  // first words of the body, which here is always the word "Tokun.World".
  const preheaderHtml = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0">${escapeHtml(
        preheader
      )}</div>`
    : "";

  return `
  <div style="margin:0;padding:0;background:#0B0B0D;font-family:Inter,Arial,Helvetica,sans-serif">
    ${preheaderHtml}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B0B0D;padding:32px 16px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#121214;border:1px solid #232326;border-radius:16px;overflow:hidden">
          <tr><td style="height:4px;background:${accent};line-height:4px;font-size:0">&nbsp;</td></tr>
          <tr><td style="padding:28px 28px 8px">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;color:${accent};text-transform:uppercase">Tokun.World</p>
            <h1 style="margin:0;font-size:22px;line-height:30px;color:#ffffff;font-weight:800">${escapeHtml(
              heading
            )}</h1>
          </td></tr>
          <tr><td style="padding:12px 28px 0;font-size:14px;line-height:22px;color:rgba(255,255,255,0.65)">
            ${introHtml}
          </td></tr>
          ${tableHtml}
          ${ctaHtml}
          <tr><td style="padding:22px 28px 28px;font-size:12px;line-height:19px;color:rgba(255,255,255,0.40)">
            ${footerNote || ""}
          </td></tr>
        </table>
        <p style="margin:18px 0 0;font-size:11px;color:rgba(255,255,255,0.28)">
          You're receiving this because of ${escapeHtml(receivingBecause)}.
        </p>
      </td></tr>
    </table>
  </div>`;
}

/**
 * Build the shell and send it.
 *
 * Returns silently when there's no address — several call sites work from
 * populated documents where the counterparty may have been deleted, and a
 * missing email must not throw inside a settlement or a cron sweep.
 */
async function sendShellEmail({ to, subject, ...shellOpts }) {
  if (!to) return;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: shell(shellOpts),
  });
}

module.exports = { ACCENT, SITE, escapeHtml, rupees, onDate, shell, sendShellEmail };
