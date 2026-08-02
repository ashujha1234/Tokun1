// Generates the Tokun.World Privacy Policy as a PDF using pdf-lib (pure Node,
// no headless browser) — same reason invoice.service.js moved off Puppeteer:
// Puppeteer/Chromium crashed on Azure App Service.
//
// Content is static, so the PDF is built once and cached in memory for the
// lifetime of the process; every purchase/subscription email reuses the
// same buffer instead of re-rendering it.
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: [
      "Account information you provide when signing up — name, email address, and organization details.",
      "Content you create or upload — prompts, optimizations, uploaded files, and marketplace listings.",
      "Payment and billing information processed through our payment partner (Razorpay) — we do not store your full card details on our servers.",
      "Usage data such as token consumption, feature usage, and device/browser information used to operate and improve the service.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: [
      "To provide, operate, and maintain the Tokun platform, including Smartgen, Prompt Optimizer, the Prompt Marketplace, and Hire.",
      "To process payments, subscriptions, wallet top-ups, and withdrawals.",
      "To communicate with you about your account, transactions, and service updates.",
      "To detect, prevent, and address fraud, abuse, or security issues.",
    ],
  },
  {
    title: "3. Payments & Wallet",
    body: [
      "All payments are processed via Razorpay. Tokun does not store your card, UPI, or bank credentials directly.",
      "Wallet balances shown in your account represent amounts owed to you and are tracked internally; funds are only transferred to your bank account or UPI ID when you request a withdrawal.",
      "Bank account and UPI details you add for withdrawals are shared with Razorpay to enable payouts.",
    ],
  },
  {
    title: "4. Your Content",
    body: [
      "You retain ownership of prompts and content you create or upload. By listing a prompt on the Marketplace, you grant buyers a license to use that prompt as described at the time of purchase.",
      "You are responsible for ensuring you have the right to upload and sell any content you list.",
    ],
  },
  {
    title: "5. Data Sharing",
    body: [
      "We share data with service providers strictly to operate the platform — for example, Razorpay for payments, and email/communication providers for account notifications.",
      "We do not sell your personal information to third parties.",
    ],
  },
  {
    title: "6. Data Security",
    body: [
      "We use reasonable technical and organizational measures to protect your data, including encrypted transmission and access controls.",
      "No system is 100% secure; you use the platform at your own risk with respect to unforeseen security incidents.",
    ],
  },
  {
    title: "7. Your Rights",
    body: [
      "You may request access to, correction of, or deletion of your personal data by contacting support.",
      "You may close your account at any time; some records (e.g. transaction history) may be retained as required by law.",
    ],
  },
  {
    title: "8. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. Continued use of Tokun after changes take effect constitutes acceptance of the revised policy.",
    ],
  },
];

let cachedPdfBuffer = null;

async function buildPrivacyPolicyPDF() {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const PAGE_W = 595;
  const PAGE_H = 842; // A4
  const L = 50;
  const R = PAGE_W - 50;
  const TOP = PAGE_H - 60;
  const BOTTOM = 50;

  const COLORS = {
    bg: rgb(0.071, 0.071, 0.071),
    footer: rgb(0.102, 0.102, 0.102),
    white: rgb(1, 1, 1),
    muted: rgb(0.65, 0.65, 0.65),
    pink: rgb(1.0, 0.078, 0.937),
    blue: rgb(0.102, 0.451, 0.910),
  };

  let page = null;
  let y = 0;

  const wrapText = (str, font, size, maxWidth) => {
    const words = String(str ?? "").split(/\s+/).filter(Boolean);
    const lines = [];
    let current = "";
    for (const word of words) {
      const test = current ? current + " " + word : word;
      if (font.widthOfTextAtSize(test, size) <= maxWidth) {
        current = test;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  const newPage = ({ header = false } = {}) => {
    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: COLORS.bg });
    y = TOP;

    if (header) {
      const headerH = 80;
      const stripes = 80;
      for (let i = 0; i < stripes; i++) {
        const t = i / (stripes - 1);
        page.drawRectangle({
          x: (PAGE_W / stripes) * i,
          y: PAGE_H - headerH,
          width: PAGE_W / stripes + 1,
          height: headerH,
          color: rgb(
            COLORS.pink.red + (COLORS.blue.red - COLORS.pink.red) * t,
            COLORS.pink.green + (COLORS.blue.green - COLORS.pink.green) * t,
            COLORS.pink.blue + (COLORS.blue.blue - COLORS.pink.blue) * t
          ),
        });
      }
      page.drawText("Tokun.World", { x: L, y: PAGE_H - 46, size: 20, font: fontBold, color: COLORS.white });
      const label = "Privacy Policy";
      const labelW = fontReg.widthOfTextAtSize(label, 12);
      page.drawText(label, { x: R - labelW, y: PAGE_H - 40, size: 12, font: fontReg, color: COLORS.white });
      y = PAGE_H - headerH - 34;
    }
  };

  const ensureSpace = (needed) => {
    if (y - needed < BOTTOM) newPage();
  };

  const drawParagraph = (str, { font = fontReg, size = 11, color = COLORS.white, gap = 15, maxWidth = R - L, x = L } = {}) => {
    const lines = wrapText(str, font, size, maxWidth);
    for (const line of lines) {
      ensureSpace(gap);
      page.drawText(line, { x, y, size, font, color });
      y -= gap;
    }
  };

  const drawBullet = (str, { size = 11, gap = 15 } = {}) => {
    const bulletX = L;
    const textX = L + 14;
    const maxWidth = R - textX;
    const lines = wrapText(str, fontReg, size, maxWidth);
    lines.forEach((line, idx) => {
      ensureSpace(gap);
      if (idx === 0) {
        page.drawText("•", { x: bulletX, y, size, font: fontReg, color: COLORS.muted });
      }
      page.drawText(line, { x: textX, y, size, font: fontReg, color: COLORS.white });
      y -= gap;
    });
  };

  newPage({ header: true });

  drawParagraph(
    "This policy explains what information Tokun collects, how it is used, and the choices you have regarding your data — including Smartgen, Prompt Optimizer, the Prompt Marketplace, Hire, and Wallet.",
    { color: COLORS.muted, gap: 15 }
  );
  y -= 12;

  for (const section of SECTIONS) {
    ensureSpace(24);
    page.drawText(section.title, { x: L, y, size: 13, font: fontBold, color: COLORS.white });
    y -= 20;

    for (const line of section.body) {
      drawBullet(line);
      y -= 4;
    }
    y -= 10;
  }

  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: 40, color: COLORS.footer });
  page.drawText("Questions? Contact support@tokun.world", {
    x: L,
    y: 16,
    size: 9,
    font: fontReg,
    color: COLORS.muted,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

exports.getPrivacyPolicyPDF = async () => {
  if (!cachedPdfBuffer) {
    cachedPdfBuffer = await buildPrivacyPolicyPDF();
  }
  return cachedPdfBuffer;
};
