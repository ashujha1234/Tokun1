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
const { siteUrl } = require("../utils/siteUrl");

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

/* ── Text and surface colours. Solid hex, never rgba() ───────────────────────
 *
 * These were written as rgba(255,255,255,α) — white at an opacity, letting the
 * dark background show through. That reads fine in a browser and is the single
 * most common way to make email text disappear.
 *
 * Two separate failures:
 *
 *   1. Outlook renders mail through Word, which does not understand rgba().
 *      The declaration is dropped, the element inherits from its parent, and
 *      nothing up the chain sets a colour — so the client default applies,
 *      which is black. Black on a #121214 card is 1.12:1. Not "dim": gone.
 *
 *   2. Where rgba DID work, the faintest steps were below the readable floor
 *      anyway — the footer note came out 3.84:1 and the "you're receiving
 *      this" line 2.41:1, against the 4.5:1 that body text needs.
 *
 * Every value below is the flattened equivalent, brightened where it had to be,
 * and checked against the surface it sits on:
 *
 *   strong 18.71:1   body 11.12:1   muted 6.87:1   faint 5.77:1   fine 4.63:1
 *
 * If you add a colour here, flatten it yourself — an email has no compositing
 * layer to fall back on. */
const TEXT = {
  strong: "#FFFFFF", // headings, row values, anything load-bearing
  body: "#C7C7CD", // paragraphs
  muted: "#9C9CA5", // row labels, subtitles
  faint: "#8E8E98", // footer note
  fine: "#7A7A84", // the "receiving because" line, on the page background
};

const SURFACE = {
  page: "#0B0B0D", // outside the card
  card: "#121214", // the card itself
  inset: "#1E1E20", // boxes inside the card (was rgba(255,255,255,0.04))
  hair: "#232326", // card border
  rule: "#222222", // row separators
};

const SITE = siteUrl();

/**
 * The footer. One of them, for every template.
 *
 * There used to be five. shell() ended with a single line of fine print and no
 * links; the two invite templates had "© 2025" and Privacy/Terms; the OTP
 * template had a paragraph plus an unsubscribe link; the collaboration invite
 * had its own again; the invoice had none. Nothing was shared, so "change the
 * footer" meant finding all five and getting all five right.
 *
 * Now: social row, legal links, copyright, and the reason this email arrived —
 * in that order, in one place. The file-based templates render it through the
 * {{footer}} placeholder (see emailSocialIcons.withFooter); shell() calls it
 * directly.
 *
 * The year is computed. It was written out as 2025 in three templates, which
 * was already wrong by the time anyone read it.
 */
/**
 * The footer itself, as a self-contained table.
 *
 * A table rather than loose rows because the five templates that need it are
 * built differently — shell() is one big table, the invite templates nest
 * tables, the collaboration invite is divs. A complete <table> is valid inside
 * any of them; a bare <tr> is valid inside only one.
 */
function footerBlock({ receivingBecause = "activity on your Tokun.World account" } = {}) {
  const { socialRowHtml } = require("./emailSocialIcons");
  const social = socialRowHtml();
  const link = (href, label) =>
    `<a href="${href}" style="color:${TEXT.muted};text-decoration:none;padding:0 8px">${label}</a>`;

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
    ${social ? `<tr><td align="center" style="padding:18px 20px 8px">${social}</td></tr>` : ""}
    <tr><td align="center" style="padding:6px 20px 0;font-size:12px;font-family:Inter,Arial,Helvetica,sans-serif">
      ${link(`${SITE}/privacy-policy`, "Privacy")}<span style="color:${SURFACE.rule}">|</span>${link(
        `${SITE}/terms`,
        "Terms"
      )}<span style="color:${SURFACE.rule}">|</span>${link(SITE, "Tokun.World")}
    </td></tr>
    <tr><td align="center" style="padding:10px 20px 22px;font-size:11px;line-height:18px;color:${
      TEXT.fine
    };font-family:Inter,Arial,Helvetica,sans-serif">
      You're receiving this because of ${escapeHtml(receivingBecause)}.<br/>
      © ${new Date().getFullYear()} Tokun.World. All rights reserved.
    </td></tr>
  </table>`;
}

/** The same footer wrapped as a row, for shell()'s single outer table. */
function footerHtml(opts) {
  return `<tr><td colspan="2" style="padding:0">${footerBlock(opts)}</td></tr>`;
}

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
  /* Long values get their own full-width line instead of being squeezed into
     the right-hand column.

     A two-column row works for "₹45,000.00" and "26 Sept 2026". It does not
     work for a refund reason, which is a sentence someone typed — right-aligned
     into roughly half of 560px, a 200-character explanation came out as a
     ragged column ten words tall next to a one-word label. The reason is the
     part of a refund email that actually gets read.

     Switched on automatically past 60 characters, so no call site has to decide
     — and `block: true` forces it for anything shorter that still reads as
     prose. */
  const LONG_VALUE = 60;

  const rowsHtml = (rows || [])
    .filter((r) => r && r.value !== undefined && r.value !== null && r.value !== "")
    .map((r) => {
      const value = String(r.value);
      const isBlock = r.block === true || value.length > LONG_VALUE;

      /* A row whose value is somewhere to go rather than something to read.
         The alternative is printing a URL as text and hoping the reader copies
         it — which is what the intro-video alert did, and why it showed a
         24-character id nobody could act on. */
      const paint = (text) =>
        r.href
          ? `<a href="${r.href}" style="color:${accent};text-decoration:underline">${escapeHtml(
              text
            )}</a>`
          : escapeHtml(text);

      if (isBlock) {
        return `
      <tr>
        <td colspan="2" style="padding:11px 0;border-bottom:1px solid ${SURFACE.rule}">
          <div style="font-size:13px;color:${TEXT.muted};margin-bottom:5px">${escapeHtml(r.label)}</div>
          <div style="font-size:13px;line-height:20px;color:${
            r.emphasis ? accent : TEXT.strong
          };font-weight:${r.emphasis ? 700 : 400};white-space:pre-wrap;word-break:break-word">${paint(
            value
          )}</div>
        </td>
      </tr>`;
      }

      return `
      <tr>
        <td style="padding:11px 0;font-size:13px;color:${TEXT.muted};border-bottom:1px solid ${SURFACE.rule}">
          ${escapeHtml(r.label)}
        </td>
        <td align="right" style="padding:11px 0;font-size:13px;color:${
          r.emphasis ? accent : TEXT.strong
        };font-weight:${r.emphasis ? 700 : 400};border-bottom:1px solid ${
          SURFACE.rule
        };word-break:break-word">
          ${paint(value)}
        </td>
      </tr>`;
    })
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
  <div style="margin:0;padding:0;background:${SURFACE.page};color:${TEXT.body};font-family:Inter,Arial,Helvetica,sans-serif">
    ${preheaderHtml}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SURFACE.page};padding:32px 16px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${SURFACE.card};border:1px solid ${SURFACE.hair};border-radius:16px;overflow:hidden">
          <tr><td style="height:4px;background:${accent};line-height:4px;font-size:0">&nbsp;</td></tr>
          <tr><td style="padding:28px 28px 8px">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;color:${accent};text-transform:uppercase">Tokun.World</p>
            <h1 style="margin:0;font-size:22px;line-height:30px;color:${TEXT.strong};font-weight:800">${escapeHtml(
              heading
            )}</h1>
          </td></tr>
          <tr><td style="padding:12px 28px 0;font-size:14px;line-height:22px;color:${TEXT.body}">
            ${introHtml}
          </td></tr>
          ${tableHtml}
          ${ctaHtml}
          <tr><td style="padding:22px 28px 4px;font-size:12px;line-height:19px;color:${TEXT.faint}">
            ${footerNote || ""}
          </td></tr>
          ${footerHtml({ receivingBecause })}
        </table>
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
async function sendShellEmail({ to, subject, attachments, ...shellOpts }) {
  if (!to) return;

  /* shell() renders the footer icons as cid: references, so the message has to
     carry the matching parts or they arrive broken. Added here rather than at
     36 call sites — a caller that forgets would send an email with four empty
     boxes in it, and there would be no reason for any of them to remember. */
  const { socialAttachments } = require("./emailSocialIcons");
  const all = [...(attachments || []), ...socialAttachments()];

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: shell(shellOpts),
    /* Passed through to nodemailer untouched: [{ filename, content }]. Omitted
       entirely when there is nothing to attach, because nodemailer treats an
       empty array differently from an absent key on some transports. */
    ...(all.length ? { attachments: all } : {}),
  });
}

module.exports = { ACCENT, TEXT, SURFACE, SITE, escapeHtml, rupees, onDate, shell, footerHtml, footerBlock, sendShellEmail };
