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

const transporter = require("../utils/mailer");

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* Inline styles and a table layout throughout, because email clients strip
   <style> blocks and don't do flexbox. Matches the dark palette the invoice
   email already uses so the two look like they come from the same place. */
function shell({ heading, accent, introHtml, rows, footerNote }) {
  const rowsHtml = (rows || [])
    .map(
      (r) => `
      <tr>
        <td style="padding:11px 0;font-size:13px;color:rgba(255,255,255,0.55);border-bottom:1px solid #222222">
          ${escapeHtml(r.label)}
        </td>
        <td align="right" style="padding:11px 0;font-size:13px;color:${r.emphasis ? accent : "#ffffff"};font-weight:${r.emphasis ? 700 : 400};border-bottom:1px solid #222222;white-space:nowrap">
          ${escapeHtml(r.value)}
        </td>
      </tr>`
    )
    .join("");

  return `
  <div style="margin:0;padding:0;background:#0B0B0D;font-family:Inter,Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B0B0D;padding:32px 16px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#121214;border:1px solid #232326;border-radius:16px;overflow:hidden">
          <tr>
            <td style="height:4px;background:${accent};line-height:4px;font-size:0">&nbsp;</td>
          </tr>
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
          <tr><td style="padding:20px 28px 28px;font-size:12px;line-height:19px;color:rgba(255,255,255,0.40)">
            ${footerNote}
          </td></tr>
        </table>
        <p style="margin:18px 0 0;font-size:11px;color:rgba(255,255,255,0.28)">
          You're receiving this because of a transaction on your Tokun.World account.
        </p>
      </td></tr>
    </table>
  </div>`;
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
exports.sendFullRefundEmail = async ({ to, buyerName, itemTitle, amount, reason, referenceId }) => {
  if (!to) return;

  const rows = [
    { label: "Item", value: itemTitle || "—" },
    { label: "Refunded to you", value: rupees(amount), emphasis: true },
  ];
  if (reason) rows.push({ label: "Reason", value: reason });
  if (referenceId) rows.push({ label: "Reference", value: referenceId });

  const html = shell({
    heading: "Your refund is on its way",
    accent: "#19E66C",
    introHtml: `Hi ${escapeHtml(buyerName || "there")}, we've refunded your payment in full.`,
    rows,
    footerNote: BANK_TIMING_NOTE,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Refund processed — ${rupees(amount)} for "${itemTitle || "your order"}"`,
    html,
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
  refundAmount,
  sellerPayout,
  sellerPercent,
  totalPaid,
  decidedBy,
  note,
  referenceId,
}) => {
  if (!to) return;

  const rows = [
    { label: "Item", value: itemTitle || "—" },
    { label: "You originally paid", value: rupees(totalPaid) },
    { label: `Paid to the creator (${sellerPercent}% completed)`, value: rupees(sellerPayout) },
    { label: "Refunded to you", value: rupees(refundAmount), emphasis: true },
  ];
  if (note) rows.push({ label: "Note", value: note });
  if (referenceId) rows.push({ label: "Reference", value: referenceId });

  const decidedLine =
    decidedBy === "admin"
      ? "Our team reviewed the work that had been done and decided this split."
      : "This split was agreed between you and the creator.";

  const html = shell({
    heading: "Your cancellation has been settled",
    accent: "#FABC4E",
    introHtml: `Hi ${escapeHtml(buyerName || "there")}, "${escapeHtml(itemTitle || "your booking")}" was cancelled after work had started. ${escapeHtml(decidedLine)} The creator was paid for the share they completed, and the rest is coming back to you.`,
    rows,
    footerNote: BANK_TIMING_NOTE,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Cancellation settled — ${rupees(refundAmount)} refunded for "${itemTitle || "your booking"}"`,
    html,
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
  totalPaid,
  sellerPayout,
  decidedBy,
  note,
}) => {
  if (!to) return;

  const rows = [
    { label: "Item", value: itemTitle || "—" },
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
    accent: "#8F8996",
    introHtml: `Hi ${escapeHtml(
      buyerName || "there"
    )}, "${escapeHtml(itemTitle || "your booking")}" has been settled and no refund is due. ${escapeHtml(decidedLine)}`,
    rows,
    footerNote:
      "If you believe this is wrong, reply to this email with anything that wasn't already submitted and we'll look again.",
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Cancellation settled — no refund for "${itemTitle || "your booking"}"`,
    html,
  });
};

exports.sendSellerSettlementEmail = async ({
  to,
  sellerName,
  itemTitle,
  sellerPayout,
  sellerPercent,
  fullAmount,
  decidedBy,
  note,
}) => {
  if (!to) return;

  const isNil = Number(sellerPayout || 0) <= 0;

  const rows = [
    { label: "Item", value: itemTitle || "—" },
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
  if (note) rows.push({ label: "Note", value: note });

  const decidedLine =
    decidedBy === "admin"
      ? "Our team reviewed the work and decided this split."
      : "This split was agreed between you and the client.";

  const html = shell({
    heading: isNil ? "A booking was cancelled" : "Your cancellation payout",
    accent: isNil ? "#8F8996" : "#19E66C",
    introHtml: `Hi ${escapeHtml(sellerName || "there")}, "${escapeHtml(itemTitle || "your booking")}" was cancelled. ${escapeHtml(decidedLine)}`,
    rows,
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
  });
};

/** Buyer's refund request was turned down. */
exports.sendRefundRejectedEmail = async ({ to, buyerName, itemTitle, adminNote }) => {
  if (!to) return;

  const rows = [{ label: "Item", value: itemTitle || "—" }];
  if (adminNote) rows.push({ label: "Reason", value: adminNote });

  const html = shell({
    heading: "About your refund request",
    accent: "#8F8996",
    introHtml: `Hi ${escapeHtml(buyerName || "there")}, we've reviewed your refund request and can't approve it this time.`,
    rows,
    footerNote:
      "If you think something was missed, reply to this email with any extra detail and our team will take another look.",
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Your refund request for "${itemTitle || "your order"}"`,
    html,
  });
};
