const fs = require("fs");
const path = require("path");
const transporter = require("../utils/mailer");
const { siteUrl: site } = require("../utils/siteUrl");
const { getPrivacyPolicyPDF } = require("./privacyPolicyPdf.service");
const { PLAN_CARD_CONTENT, PLAN_GRADIENTS } = require("../config/planCardContent");
/* Shared with every other template. This file used rgba() for its secondary
   text, which Outlook drops — see the note above TEXT in emailLayout.js. */
const { TEXT, SURFACE } = require("./emailLayout");
/* The invoice was the one transactional email with no social footer. */
const { withFooter, socialAttachments } = require("./emailSocialIcons");
const { getInvoiceCopy } = require("../config/invoiceCopy");

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// The intro line every invoice email opens with — makes it unambiguous what
// the email/attached PDF is for: a subscription, a prompt, a booked service or
// a funded project. Copy comes from config/invoiceCopy.js, the same source the
// PDF reads, so the email body and its own attachment can never say different
// things about one payment.
function buildIntroText(planCard, kind) {
  /* The subscription line says the one thing the card below it cannot.
   *
   * It used to read "This is your invoice for your Tokun Pro subscription —
   * thank you for subscribing!", which named the plan a third time (the card
   * and the line item already do) and told the reader nothing.
   *
   * What is actually missing from a subscription invoice is when the plan runs
   * out and whether the card gets charged again. Tokun sells a period outright
   * — there is no stored mandate and nothing renews on its own (see the header
   * of services/subscriptionEmail.service.js) — and that is exactly the thing
   * a new subscriber assumes the opposite of.
   *
   * Falls back to the old shape without a date rather than printing "until
   * undefined": an invoice sent before currentPeriodEnd was wired through is
   * still a valid invoice. */
  if (planCard) {
    const planKey = String(planCard.plan || "pro").toLowerCase();
    const content = PLAN_CARD_CONTENT[planKey] || PLAN_CARD_CONTENT.pro;
    const until = planCard.currentPeriodEnd
      ? new Date(planCard.currentPeriodEnd).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";
    return (
      (until
        ? `Your ${escapeHtml(content.title)} plan is active until <strong style="color:#ffffff">${escapeHtml(until)}</strong>. `
        : `Your ${escapeHtml(content.title)} plan is now active. `) +
      "It won't renew on its own — nothing is charged to your card again. " +
      "We'll email you a few days before it ends.<br/><br/>Thank you for subscribing!"
    );
  }
  return escapeHtml(getInvoiceCopy(kind).intro);
}

/* Escrow is the thing buyers most often misunderstand — "I paid, so why hasn't
   the freelancer been paid yet?" — so the answer goes on the receipt they'll
   still have months from now. Empty for prompts-with-no-note and subscriptions,
   in which case nothing renders. */
function buildInvoiceNoteHtml(planCard, kind) {
  if (planCard) return "";
  const note = getInvoiceCopy(kind).note;
  if (!note) return "";

  return `
    <tr><td style="padding:18px 0 0">
      <div style="border-radius:10px;background:${SURFACE.inset};border:1px solid ${SURFACE.rule};padding:14px 16px;font-size:12px;line-height:19px;color:${TEXT.muted}">
        ${escapeHtml(note)}
      </div>
    </td></tr>`;
}

// Same content/gradient the invoice PDF draws — kept identical so the email
// body and the attached PDF always show the same plan card. Real CSS here,
// so (unlike the PDF) this gets true rounded corners and a clickable button.
function buildPlanCardHtml(planCard) {
  if (!planCard) return "";

  const planKey = String(planCard.plan || "pro").toLowerCase();
  const content = PLAN_CARD_CONTENT[planKey] || PLAN_CARD_CONTENT.pro;
  const grad = PLAN_GRADIENTS[planKey] || PLAN_GRADIENTS.pro;
  const proGrad = PLAN_GRADIENTS.pro;
  const cycle = planCard.billingCycle === "yearly" ? "year" : "month";
  const price = `₹${Number(planCard.price ?? 0).toLocaleString("en-IN")}`;
  const siteUrl = site();

  const extrasHtml = content.extras
    .map((e) => {
      const negative = e.value === "No" || e.value === "—";
      const mark = negative
        ? `<span style="color:#f87171;font-weight:700">✗</span>`
        : `<span style="color:#6ee7a8;font-weight:700">✓</span>`;
      return `<div style="font-size:12px;color:#ffffff;margin-top:8px">${mark} ${escapeHtml(e.label)} - <strong>${escapeHtml(e.value)}</strong></div>`;
    })
    .join("");

  // Absolutely positioned (not a negative margin inside the padded cell) so
  // it reliably straddles the card's top edge in Gmail — negative margins
  // inside a padded <td> don't consistently render across email clients.
  const badgeHtml = content.highlight
    ? `<div style="position:absolute;top:-13px;left:50%;transform:translateX(-50%);white-space:nowrap;padding:6px 16px;border-radius:999px;background:linear-gradient(270deg,${proGrad.from},${proGrad.to});font-size:10px;font-weight:700;letter-spacing:0.04em;color:#ffffff">${escapeHtml(content.highlight.toUpperCase())}</div>`
    : "";

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
      <tr>
        <td align="center">
          <table width="300" cellpadding="0" cellspacing="0" style="border-radius:20px;background:linear-gradient(180deg,${grad.from} 0%,${grad.to} 100%)">
            <tr>
              <td align="center" style="position:relative;padding:34px 24px 26px;border-radius:20px">
                ${badgeHtml}
                <div style="font-size:32px;font-weight:700;color:#ffffff;line-height:1.1">${escapeHtml(content.title)}</div>
                <div style="font-size:11px;color:#F2F2F4;margin-top:6px">${escapeHtml(content.subtitle)}</div>
                <div style="font-size:22px;font-weight:700;color:#ffffff;margin-top:20px">${price} <span style="font-size:13px;font-weight:400">/${cycle}</span></div>
                <div style="font-size:12px;color:#ffffff;margin-top:18px">Monthly Tokens: ${escapeHtml(content.tokens)}</div>
                <div style="margin-top:4px">${extrasHtml}</div>
                <a href="${siteUrl}/subscription" style="display:inline-block;margin-top:22px;padding:12px 40px;border-radius:999px;background:linear-gradient(270deg,${proGrad.from},${proGrad.to});color:#ffffff;font-size:13px;font-weight:700;text-decoration:none">More info.</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

exports.sendInvoiceEmail = async ({
  to,
  buyerName,
  buyerEmail,
  invoiceNo,
  date,
  items,
  subtotal,
  gst,
  total,
  pdfBuffer,
  planCard,
  // "prompt" | "service" | "hire" — decides the intro line and the escrow /
  // refund note. Omitted falls back to the generic wording.
  kind,
  /* [{label, value}] — payment method, gateway transaction id, currency,
     order id, project title. Built by services/paymentDetails.service.js and
     passed to generateInvoicePDF() unchanged, so the body and its own
     attachment cannot list different things. */
  details,
}) => {
  const templatePath = path.join(
    __dirname,
    "../htmltemplate/invoiceEmail.html"
  );

  let html = fs.readFileSync(templatePath, "utf8");

  const itemsRows = (items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;font-size:13px;color:#ffffff;border-bottom:1px solid #222222">
          <strong>${escapeHtml(item.title)}</strong>
          ${item.subtitle ? `<br/><span style="font-size:11px;color:${TEXT.muted}">${escapeHtml(item.subtitle)}</span>` : ""}
        </td>
        <td align="right" style="padding:12px 0;font-size:13px;color:#ffffff;border-bottom:1px solid #222222;white-space:nowrap">
          ₹${Number(item.price || 0).toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  /* Same rows the PDF draws. Skipped where a value could not be determined —
     a blank "Payment method:" line is worse than no line, because it reads as
     information we lost rather than information we never had. */
  const detailRowsHtml = (details || [])
    .filter((d) => d && d.value)
    .map(
      (d) => `
      <tr>
        <td style="padding:6px 0;font-size:12px;color:${TEXT.muted};white-space:nowrap">${escapeHtml(d.label)}</td>
        <td align="right" style="padding:6px 0;font-size:12px;color:#ffffff;word-break:break-word">${escapeHtml(d.value)}</td>
      </tr>`
    )
    .join("");

  const detailBlockHtml = detailRowsHtml
    ? `<tr><td style="padding:18px 24px 0">
         <div style="border-radius:10px;background:${SURFACE.inset};border:1px solid ${SURFACE.rule};padding:12px 16px">
           <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${detailRowsHtml}</table>
         </div>
       </td></tr>`
    : "";

  const planCardHtml = buildPlanCardHtml(planCard);
  const introText = buildIntroText(planCard, kind);
  const invoiceNoteHtml = buildInvoiceNoteHtml(planCard, kind);

  // 🔁 Replace placeholders
  html = html
    .replace(/{{INVOICE_NO}}/g, invoiceNo)
    .replace(/{{DATE}}/g, date)
    .replace(/{{BUYER_NAME}}/g, escapeHtml(buyerName))
    .replace(/{{BUYER_EMAIL}}/g, escapeHtml(buyerEmail))
    .replace(
      /{{INTRO_ROW}}/g,
      introText
        ? `<tr><td style="padding:20px 24px 0;font-size:13px;line-height:1.6;color:#C7C7CD">${introText}</td></tr>`
        : ""
    )
    .replace(/{{DETAIL_ROWS}}/g, detailBlockHtml)
    .replace(/{{INVOICE_NOTE_HTML}}/g, invoiceNoteHtml)
    .replace(/{{PLAN_CARD_HTML}}/g, planCardHtml)
    .replace(/{{ITEMS_ROWS}}/g, itemsRows)
    .replace(/{{SUBTOTAL}}/g, subtotal)
    .replace(/{{GST}}/g, gst)
    .replace(/{{TOTAL}}/g, total);

  html = withFooter(html, { receivingBecause: "a payment on your Tokun.World account" });

  const attachments = [
    {
      filename: `invoice-${invoiceNo}.pdf`,
      content: pdfBuffer,
    },
  ];

  // Inline footer glyphs, referenced by the {{socialRow}} markup above.
  attachments.push(...socialAttachments());

  try {
    const privacyPolicyPdf = await getPrivacyPolicyPDF();
    attachments.push({
      filename: "tokun-privacy-policy.pdf",
      content: privacyPolicyPdf,
    });
  } catch (err) {
    // Invoice email ka core purpose invoice bhejna hai — privacy policy attach
    // na ho paaye to bhi invoice email fail nahi hona chahiye.
    console.error("⚠️ Privacy policy PDF attach failed (invoice email still sent):", err.message);
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Your Tokun.World Invoice #${invoiceNo}`,
    html,
    attachments,
  });
};
