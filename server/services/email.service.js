const fs = require("fs");
const path = require("path");
const transporter = require("../utils/mailer");

exports.sendInvoiceEmail = async ({
  to,
  buyerName,
  buyerEmail,
  plan,
  price,
  tokens,
  invoiceNo,
  date,
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

  // 🔁 Replace placeholders
  html = html
    .replace(/{{INVOICE_NO}}/g, invoiceNo)
    .replace(/{{DATE}}/g, date)
    .replace(/{{BUYER_NAME}}/g, buyerName)
    .replace(/{{BUYER_EMAIL}}/g, buyerEmail)
    .replace(/{{PLAN_NAME}}/g, plan.name)
    .replace(/{{PLAN_PRICE}}/g, price)
    .replace(/{{TOKENS}}/g, tokens)
    .replace(/{{PLAN_FEATURES}}/g, plan.features)
    .replace(/{{SUBTOTAL}}/g, subtotal)
    .replace(/{{GST}}/g, gst)
    .replace(/{{TOTAL}}/g, total);

  await transporter.sendMail({
from: process.env.EMAIL_FROM,

    to,
    subject: `Your Tokun.ai Invoice – ${plan.name} Plan`,
    html,
    attachments: [
      {
        filename: `invoice-${invoiceNo}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
};
