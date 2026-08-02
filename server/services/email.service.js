const fs = require("fs");
const path = require("path");
const transporter = require("../utils/mailer");
const { getPrivacyPolicyPDF } = require("./privacyPolicyPdf.service");
const { PLAN_CARD_CONTENT, PLAN_GRADIENTS } = require("../config/planCardContent");

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// The intro line every invoice email opens with — makes it unambiguous what
// the email/attached PDF is for, subscription or a regular purchase.
function buildIntroText(planCard) {
  if (planCard) {
    const planKey = String(planCard.plan || "pro").toLowerCase();
    const content = PLAN_CARD_CONTENT[planKey] || PLAN_CARD_CONTENT.pro;
    return `This is your invoice for your Tokun ${escapeHtml(content.title)} subscription — thank you for subscribing!`;
  }
  return "This is your invoice for your recent purchase from Tokun.World.";
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
  const siteUrl = process.env.SITE_URL || "https://tokun.world";

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
    ? `<div style="position:absolute;top:-13px;left:50%;transform:translateX(-50%);white-space:nowrap;padding:6px 16px;border-radius:999px;background:linear-gradient(270deg,${proGrad.from},${proGrad.to});font-size:10px;font-weight:700;letter-spacing:0.04em;color:#ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.35)">${escapeHtml(content.highlight.toUpperCase())}</div>`
    : "";

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px">
      <tr>
        <td align="center">
          <table width="300" cellpadding="0" cellspacing="0" style="border-radius:20px;background:linear-gradient(180deg,${grad.from} 0%,${grad.to} 100%)">
            <tr>
              <td align="center" style="position:relative;padding:34px 24px 26px;border-radius:20px">
                ${badgeHtml}
                <div style="font-size:32px;font-weight:700;color:#ffffff;line-height:1.1">${escapeHtml(content.title)}</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.85);margin-top:6px">${escapeHtml(content.subtitle)}</div>
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
          ${item.subtitle ? `<br/><span style="font-size:11px;color:rgba(255,255,255,0.5)">${escapeHtml(item.subtitle)}</span>` : ""}
        </td>
        <td align="right" style="padding:12px 0;font-size:13px;color:#ffffff;border-bottom:1px solid #222222;white-space:nowrap">
          ₹${Number(item.price || 0).toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  const planCardHtml = buildPlanCardHtml(planCard);
  const introText = buildIntroText(planCard);

  // 🔁 Replace placeholders
  html = html
    .replace(/{{INVOICE_NO}}/g, invoiceNo)
    .replace(/{{DATE}}/g, date)
    .replace(/{{BUYER_NAME}}/g, escapeHtml(buyerName))
    .replace(/{{BUYER_EMAIL}}/g, escapeHtml(buyerEmail))
    .replace(/{{INTRO_TEXT}}/g, introText)
    .replace(/{{PLAN_CARD_HTML}}/g, planCardHtml)
    .replace(/{{ITEMS_ROWS}}/g, itemsRows)
    .replace(/{{SUBTOTAL}}/g, subtotal)
    .replace(/{{GST}}/g, gst)
    .replace(/{{TOTAL}}/g, total);

  const attachments = [
    {
      filename: `invoice-${invoiceNo}.pdf`,
      content: pdfBuffer,
    },
  ];

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
