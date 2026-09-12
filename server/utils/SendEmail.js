const nodemailer = require("nodemailer");

const port = Number(process.env.SMTP_PORT || 465);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,                 // smtp.gmail.com
  port,                                        // 465
  secure: true,                                // SSL for 465
  auth: {
    user: process.env.SMTP_USER,               // your Gmail
    pass: process.env.SMTP_PASS,               // App Password (16 chars)
  },
  tls: { minVersion: "TLSv1.2" },
});

transporter.verify()
  .catch(err => console.error("❌ SMTP error:", err?.response || err?.message || err));

async function sendEmail({ to, subject, html, text, attachments }) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM, // "Tokun <ashutoshjha1701@gmail.com>"
    to,
    subject,
    text,
    html,
    /* Carries the inline footer glyphs (services/emailSocialIcons.js). Omitted
       when empty rather than passed as [] — some transports treat an empty
       array as "this message has attachments" and mark it accordingly. */
    ...(attachments && attachments.length ? { attachments } : {}),
  });
}

module.exports = { sendEmail };
