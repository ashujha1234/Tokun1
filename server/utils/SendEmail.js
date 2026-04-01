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

// log what we're actually using (dev only)
console.log("SMTP config in use:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  from: process.env.EMAIL_FROM,
});

transporter.verify()
  .then(() => console.log("✅ SMTP ready"))
  .catch(err => console.error("❌ SMTP error:", err?.response || err?.message || err));

async function sendEmail({ to, subject, html, text }) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM, // "Tokun <ashutoshjha1701@gmail.com>"
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendEmail };
