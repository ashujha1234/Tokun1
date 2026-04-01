const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // ✅ required for Gmail 465
  auth: {
    user: process.env.SMTP_USER, // ✅ FIX
    pass: process.env.SMTP_PASS, // ✅ FIX
  },
});

// Optional but highly recommended
transporter.verify((err) => {
  if (err) {
    console.error("❌ SMTP ERROR:", err.message);
  } else {
    console.log("✅ SMTP ready");
  }
});

module.exports = transporter;
