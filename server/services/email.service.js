const fs = require("fs");
const path = require("path");
const transporter = require("../utils/mailer");

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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

  // 🔁 Replace placeholders
  html = html
    .replace(/{{INVOICE_NO}}/g, invoiceNo)
    .replace(/{{DATE}}/g, date)
    .replace(/{{BUYER_NAME}}/g, escapeHtml(buyerName))
    .replace(/{{BUYER_EMAIL}}/g, escapeHtml(buyerEmail))
    .replace(/{{ITEMS_ROWS}}/g, itemsRows)
    .replace(/{{SUBTOTAL}}/g, subtotal)
    .replace(/{{GST}}/g, gst)
    .replace(/{{TOTAL}}/g, total);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Your Tokun.world Invoice #${invoiceNo}`,
    html,
    attachments: [
      {
        filename: `invoice-${invoiceNo}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
};
