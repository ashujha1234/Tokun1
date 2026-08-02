// // // // const fs = require("fs");
// // // // const path = require("path");
// // // // const puppeteer = require("puppeteer");

// // // // exports.generateInvoicePDF = async (data) => {
// // // //   const templatePath = path.join(
// // // //     __dirname,
// // // //     "../htmltemplate/invoice.html"
// // // //   );

// // // //   let html = fs.readFileSync(templatePath, "utf8");

// // // //   const rowsHtml = data.items
// // // //     .map(
// // // //       (item, i) => `
// // // //       <div class="row">
// // // //         <div>${i + 1}</div>
// // // //         <div>
// // // //           <div class="row-title">${item.title}</div>
// // // //           <div class="row-sub">${item.subtitle}</div>
// // // //         </div>
// // // //         <div style="text-align:right">₹${item.price}</div>
// // // //       </div>
// // // //     `
// // // //     )
// // // //     .join("");

// // // //   html = html
// // // //     .replace("{{LOGO}}", data.logo)
// // // //     .replace("{{DATE}}", data.date)
// // // //     .replace("{{INVOICE_NO}}", data.invoiceNo)
// // // //     .replace("{{BUYER_NAME}}", data.buyerName)
// // // //     .replace("{{BUYER_EMAIL}}", data.buyerEmail)
// // // //     .replace("{{ROWS}}", rowsHtml)
// // // //     .replace("{{SUBTOTAL}}", data.total)
// // // //     .replace("{{TOTAL}}", data.total);

// // // //   const browser = await puppeteer.launch({
// // // //     headless: "new",
// // // //     args: ["--no-sandbox", "--disable-setuid-sandbox"],
// // // //   });

// // // //   const page = await browser.newPage();
// // // //   await page.setContent(html, { waitUntil: "networkidle0" });

// // // //   const pdf = await page.pdf({
// // // //     format: "A4",
// // // //     printBackground: true,
// // // //   });

// // // //   await browser.close();
// // // //   return pdf;
// // // // };


// // // const fs = require("fs");
// // // const path = require("path");
// // // const puppeteer = require("puppeteer-core");
// // // const chromium = require("chromium");

// // // exports.generateInvoicePDF = async (data) => {
// // //   const templatePath = path.join(__dirname, "../htmltemplate/invoice.html");
// // //   let html = fs.readFileSync(templatePath, "utf8");

// // //   const rowsHtml = data.items
// // //     .map(
// // //       (item, i) => `
// // //       <div class="row">
// // //         <div>${i + 1}</div>
// // //         <div>
// // //           <div class="row-title">${item.title}</div>
// // //           <div class="row-sub">${item.subtitle}</div>
// // //         </div>
// // //         <div style="text-align:right">₹${item.price}</div>
// // //       </div>
// // //     `
// // //     )
// // //     .join("");

// // //   html = html
// // //     .replace("{{LOGO}}", data.logo)
// // //     .replace("{{DATE}}", data.date)
// // //     .replace("{{INVOICE_NO}}", data.invoiceNo)
// // //     .replace("{{BUYER_NAME}}", data.buyerName)
// // //     .replace("{{BUYER_EMAIL}}", data.buyerEmail)
// // //     .replace("{{ROWS}}", rowsHtml)
// // //     .replace("{{SUBTOTAL}}", data.total)
// // //     .replace("{{TOTAL}}", data.total);

// // //   // ✅ Azure ke liye chromium path use karo
// // //   const browser = await puppeteer.launch({
// // //     headless: true,
// // //     executablePath: chromium.path,
// // //     args: [
// // //       "--no-sandbox",
// // //       "--disable-setuid-sandbox",
// // //       "--disable-dev-shm-usage",
// // //       "--disable-gpu",
// // //       "--single-process",
// // //       "--no-zygote",
// // //     ],
// // //   });

// // //   try {
// // //     const page = await browser.newPage();
// // //     await page.setContent(html, { waitUntil: "networkidle0" });
// // //     const pdf = await page.pdf({
// // //       format: "A4",
// // //       printBackground: true,
// // //     });
// // //     return pdf;
// // //   } finally {
// // //     await browser.close(); // ✅ error pe bhi close hoga
// // //   }
// // // };



// // // const fs = require("fs");
// // // const path = require("path");
// // // const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

// // // /**
// // //  * Puppeteer/Chromium hataya — Azure App Service pe crash karta tha.
// // //  * Ab pdf-lib se pure Node.js mein PDF banta hai, koi browser nahi chahiye.
// // //  */
// // // exports.generateInvoicePDF = async (data) => {
// // //   const pdfDoc = await PDFDocument.create();
// // //   const page = pdfDoc.addPage([595, 842]); // A4 size in points

// // //   const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
// // //   const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

// // //   const { width, height } = page.getSize();
// // //   const L = 50;   // left margin
// // //   const R = width - 50; // right edge

// // //   // ── helpers ──────────────────────────────────────────────
// // //   const text = (str, x, y, { font = fontReg, size = 11, color = rgb(0, 0, 0) } = {}) => {
// // //     page.drawText(String(str ?? ""), { x, y, size, font, color });
// // //   };

// // //   const line = (y, { color = rgb(0.8, 0.8, 0.8), thickness = 0.5 } = {}) => {
// // //     page.drawLine({ start: { x: L, y }, end: { x: R, y }, thickness, color });
// // //   };

// // //   // ── Header bar ───────────────────────────────────────────
// // //   page.drawRectangle({
// // //     x: 0, y: height - 70,
// // //     width, height: 70,
// // //     color: rgb(0.07, 0.07, 0.09),
// // //   });

// // //   text("tokun.world", L, height - 42, { font: fontBold, size: 20, color: rgb(1, 1, 1) });
// // //   text("INVOICE", R - 65, height - 42, { font: fontBold, size: 18, color: rgb(1, 1, 1) });

// // //   // ── Invoice meta ─────────────────────────────────────────
// // //   let y = height - 100;

// // //   text(`Invoice No : ${data.invoiceNo}`, L, y, { font: fontBold, size: 10 });
// // //   text(`Date       : ${data.date}`, L, y - 18, { size: 10 });

// // //   // ── Billed To ────────────────────────────────────────────
// // //   y -= 55;
// // //   text("BILLED TO", L, y, { font: fontBold, size: 9, color: rgb(0.5, 0.5, 0.5) });
// // //   text(data.buyerName || "Customer", L, y - 16, { font: fontBold, size: 11 });
// // //   text(data.buyerEmail || "", L, y - 32, { size: 10, color: rgb(0.3, 0.3, 0.3) });

// // //   // ── Table header ─────────────────────────────────────────
// // //   y -= 75;
// // //   page.drawRectangle({
// // //     x: L, y: y - 6,
// // //     width: R - L, height: 22,
// // //     color: rgb(0.95, 0.95, 0.97),
// // //   });

// // //   text("#", L + 6, y + 4, { font: fontBold, size: 10 });
// // //   text("Description", L + 30, y + 4, { font: fontBold, size: 10 });
// // //   text("Amount", R - 70, y + 4, { font: fontBold, size: 10 });

// // //   // ── Table rows ───────────────────────────────────────────
// // //   data.items.forEach((item, i) => {
// // //     y -= 30;
// // //     text(String(i + 1), L + 6, y, { size: 10 });
// // //     text(item.title, L + 30, y, { font: fontBold, size: 10 });
// // //     text(item.subtitle || "", L + 30, y - 13, { size: 9, color: rgb(0.5, 0.5, 0.5) });
// // //     text(`INR ${item.price}`, R - 70, y, { size: 10 });
// // //     line(y - 20);
// // //   });

// // //   // ── Totals ───────────────────────────────────────────────
// // //   y -= 50;
// // //   const subtotal = data.items.reduce((s, it) => s + Number(it.price), 0);
// // //   const gst = +(subtotal * 0.18).toFixed(2);
// // //   const total = +(subtotal + gst).toFixed(2);

// // //   const totalsX = R - 200;

// // //   text("Subtotal", totalsX, y, { size: 10 });
// // //   text(`INR ${subtotal}`, R - 70, y, { size: 10 });

// // //   text("GST (18%)", totalsX, y - 18, { size: 10 });
// // //   text(`INR ${gst}`, R - 70, y - 18, { size: 10 });

// // //   line(y - 28, { color: rgb(0.6, 0.6, 0.6), thickness: 1 });

// // //   text("TOTAL", totalsX, y - 44, { font: fontBold, size: 12 });
// // //   text(`INR ${total}`, R - 70, y - 44, { font: fontBold, size: 12 });

// // //   // ── Footer ───────────────────────────────────────────────
// // //   page.drawRectangle({
// // //     x: 0, y: 0,
// // //     width, height: 40,
// // //     color: rgb(0.07, 0.07, 0.09),
// // //   });
// // //   text("Thank you for choosing tokun.world", L, 14, {
// // //     size: 9,
// // //     color: rgb(0.8, 0.8, 0.8),
// // //   });

// // //   // ── Serialize ────────────────────────────────────────────
// // //   const pdfBytes = await pdfDoc.save();
// // //   return Buffer.from(pdfBytes);
// // // };



// // // const fs = require("fs");
// // // const path = require("path");
// // // const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

// // // exports.generateInvoicePDF = async (data) => {
// // //   const pdfDoc = await PDFDocument.create();
// // //   const page = pdfDoc.addPage([595, 842]); // A4

// // //   const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
// // //   const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

// // //   const { width, height } = page.getSize();
// // //   const L = 50;
// // //   const R = width - 50;

// // //   const COLORS = {
// // //     bg: rgb(0.04, 0.05, 0.08),          // main dark bg
// // //     panel: rgb(0.09, 0.10, 0.16),       // card/panel
// // //     panel2: rgb(0.13, 0.14, 0.22),      // lighter panel
// // //     line: rgb(0.22, 0.24, 0.34),        // divider
// // //     white: rgb(1, 1, 1),
// // //     soft: rgb(0.78, 0.80, 0.88),
// // //     muted: rgb(0.58, 0.62, 0.72),
// // //     pink: rgb(1.0, 0.08, 0.94),
// // //     purple: rgb(0.64, 0.30, 1.0),
// // //     blue: rgb(0.10, 0.45, 0.91),
// // //   };

// // //   const text = (
// // //     str,
// // //     x,
// // //     y,
// // //     { font = fontReg, size = 11, color = COLORS.white } = {}
// // //   ) => {
// // //     page.drawText(String(str ?? ""), { x, y, size, font, color });
// // //   };

// // //   const line = (y, { color = COLORS.line, thickness = 0.7 } = {}) => {
// // //     page.drawLine({
// // //       start: { x: L, y },
// // //       end: { x: R, y },
// // //       thickness,
// // //       color,
// // //     });
// // //   };

// // //   // full page dark background
// // //   page.drawRectangle({
// // //     x: 0,
// // //     y: 0,
// // //     width,
// // //     height,
// // //     color: COLORS.bg,
// // //   });

// // //   // top header band
// // //   page.drawRectangle({
// // //     x: 0,
// // //     y: height - 78,
// // //     width,
// // //     height: 78,
// // //     color: COLORS.panel,
// // //   });

// // //   // accent bar
// // //   page.drawRectangle({
// // //     x: 0,
// // //     y: height - 78,
// // //     width,
// // //     height: 6,
// // //     color: COLORS.pink,
// // //   });
// // //   page.drawRectangle({
// // //     x: width * 0.34,
// // //     y: height - 78,
// // //     width: width * 0.33,
// // //     height: 6,
// // //     color: COLORS.purple,
// // //   });
// // //   page.drawRectangle({
// // //     x: width * 0.67,
// // //     y: height - 78,
// // //     width: width * 0.33,
// // //     height: 6,
// // //     color: COLORS.blue,
// // //   });

// // //   text("tokun.world", L, height - 48, {
// // //     font: fontBold,
// // //     size: 20,
// // //     color: COLORS.white,
// // //   });

// // //   text("INVOICE", R - 72, height - 48, {
// // //     font: fontBold,
// // //     size: 18,
// // //     color: COLORS.white,
// // //   });

// // //   let y = height - 112;

// // //   // meta
// // //   text(`Invoice No : ${data.invoiceNo}`, L, y, {
// // //     font: fontBold,
// // //     size: 10,
// // //     color: COLORS.soft,
// // //   });
// // //   text(`Date       : ${data.date}`, L, y - 18, {
// // //     size: 10,
// // //     color: COLORS.soft,
// // //   });

// // //   // billed to card
// // //   y -= 62;
// // //   page.drawRectangle({
// // //     x: L - 10,
// // //     y: y - 54,
// // //     width: 250,
// // //     height: 70,
// // //     color: COLORS.panel,
// // //   });

// // //   text("BILLED TO", L, y, {
// // //     font: fontBold,
// // //     size: 9,
// // //     color: COLORS.pink,
// // //   });
// // //   text(data.buyerName || "Customer", L, y - 18, {
// // //     font: fontBold,
// // //     size: 12,
// // //     color: COLORS.white,
// // //   });
// // //   text(data.buyerEmail || "", L, y - 35, {
// // //     size: 10,
// // //     color: COLORS.muted,
// // //   });

// // //   // table header
// // //   y -= 88;
// // //   page.drawRectangle({
// // //     x: L,
// // //     y: y - 8,
// // //     width: R - L,
// // //     height: 26,
// // //     color: COLORS.panel2,
// // //   });

// // //   text("#", L + 8, y + 2, { font: fontBold, size: 10, color: COLORS.white });
// // //   text("Description", L + 30, y + 2, {
// // //     font: fontBold,
// // //     size: 10,
// // //     color: COLORS.white,
// // //   });
// // //   text("Amount", R - 74, y + 2, {
// // //     font: fontBold,
// // //     size: 10,
// // //     color: COLORS.white,
// // //   });

// // //   // rows
// // //   data.items.forEach((item, i) => {
// // //     y -= 34;

// // //     page.drawRectangle({
// // //       x: L,
// // //       y: y - 18,
// // //       width: R - L,
// // //       height: 34,
// // //       color: i % 2 === 0 ? COLORS.panel : COLORS.bg,
// // //     });

// // //     text(String(i + 1), L + 8, y, { size: 10, color: COLORS.soft });
// // //     text(item.title || "", L + 30, y, {
// // //       font: fontBold,
// // //       size: 10,
// // //       color: COLORS.white,
// // //     });
// // //     text(item.subtitle || "", L + 30, y - 13, {
// // //       size: 9,
// // //       color: COLORS.muted,
// // //     });
// // //     text(`INR ${item.price}`, R - 74, y, {
// // //       size: 10,
// // //       color: COLORS.soft,
// // //     });

// // //     line(y - 22, { color: COLORS.line, thickness: 0.5 });
// // //   });

// // //   // totals
// // //   y -= 58;
// // //   const subtotal = data.items.reduce((s, it) => s + Number(it.price || 0), 0);
// // //   const gst = +(subtotal * 0.18).toFixed(2);
// // //   const total = +(subtotal + gst).toFixed(2);

// // //   const totalsX = R - 200;

// // //   page.drawRectangle({
// // //     x: totalsX - 16,
// // //     y: y - 60,
// // //     width: 190,
// // //     height: 78,
// // //     color: COLORS.panel,
// // //   });

// // //   text("Subtotal", totalsX, y, { size: 10, color: COLORS.soft });
// // //   text(`INR ${subtotal}`, R - 74, y, { size: 10, color: COLORS.soft });

// // //   text("GST (18%)", totalsX, y - 20, { size: 10, color: COLORS.soft });
// // //   text(`INR ${gst}`, R - 74, y - 20, { size: 10, color: COLORS.soft });

// // //   line(y - 30, { color: COLORS.purple, thickness: 1.2 });

// // //   text("TOTAL", totalsX, y - 48, {
// // //     font: fontBold,
// // //     size: 12,
// // //     color: COLORS.white,
// // //   });
// // //   text(`INR ${total}`, R - 74, y - 48, {
// // //     font: fontBold,
// // //     size: 12,
// // //     color: COLORS.pink,
// // //   });

// // //   // footer
// // //   page.drawRectangle({
// // //     x: 0,
// // //     y: 0,
// // //     width,
// // //     height: 44,
// // //     color: COLORS.panel,
// // //   });

// // //   page.drawRectangle({
// // //     x: 0,
// // //     y: 38,
// // //     width,
// // //     height: 6,
// // //     color: COLORS.blue,
// // //   });

// // //   text("Thank you for choosing tokun.world", L, 16, {
// // //     size: 9,
// // //     color: COLORS.soft,
// // //   });

// // //   const pdfBytes = await pdfDoc.save();
// // //   return Buffer.from(pdfBytes);
// // // };



// // // utils/generateInvoicePDF.js
// // const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
// // const { PLAN_CARD_CONTENT, PLAN_GRADIENTS } = require("../config/planCardContent");

// // const hexToRgb = (hex) => {
// //   const n = parseInt(hex.replace("#", ""), 16);
// //   return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
// // };

// // exports.generateInvoicePDF = async (data) => {
// //   const pdfDoc = await PDFDocument.create();
// //   const page = pdfDoc.addPage([595, 842]); // A4

// //   const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
// //   const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

// //   const { width, height } = page.getSize();
// //   const L = 50;
// //   const R = width - 50;

// //   // Palette matches the invoice email template exactly (htmltemplate/invoiceEmail.html):
// //   // #121212 card, #2a2a2a dividers, #1a1a1a footer, #ff14ef → #1a73e8 header gradient.
// //   const COLORS = {
// //     bg: rgb(0.071, 0.071, 0.071),
// //     footer: rgb(0.102, 0.102, 0.102),
// //     line: rgb(0.165, 0.165, 0.165),
// //     white: rgb(1, 1, 1),
// //     soft: rgb(1, 1, 1),
// //     muted: rgb(0.6, 0.6, 0.6),
// //     pink: rgb(1.0, 0.078, 0.937),
// //     purple: rgb(0.64, 0.3, 1.0),
// //     blue: rgb(0.102, 0.451, 0.910),
// //   };

// //   const text = (
// //     str,
// //     x,
// //     y,
// //     { font = fontReg, size = 11, color = COLORS.white } = {}
// //   ) => {
// //     page.drawText(String(str ?? ""), { x, y, size, font, color });
// //   };

// //   // ✅ right-aligned text (amounts ke liye)
// //   const textRight = (
// //     str,
// //     rightX,
// //     y,
// //     { font = fontReg, size = 11, color = COLORS.white } = {}
// //   ) => {
// //     const s = String(str ?? "");
// //     const w = font.widthOfTextAtSize(s, size);
// //     page.drawText(s, { x: rightX - w, y, size, font, color });
// //   };

// //   // ✅ FIX: pdf-lib text wrap nahi karta — ye helper text ko maxWidth ke andar
// //   // words mein todta hai. maxLines ke baad "..." laga ke truncate karta hai.
// //   const wrapText = (str, font, size, maxWidth, maxLines = 2) => {
// //     const words = String(str ?? "").split(/\s+/).filter(Boolean);
// //     const lines = [];
// //     let current = "";

// //     for (const word of words) {
// //       const test = current ? current + " " + word : word;
// //       if (font.widthOfTextAtSize(test, size) <= maxWidth) {
// //         current = test;
// //       } else {
// //         if (current) lines.push(current);
// //         // ekdum lamba single word ho to usko bhi kaat do
// //         let w = word;
// //         while (font.widthOfTextAtSize(w, size) > maxWidth && w.length > 1) {
// //           w = w.slice(0, -1);
// //         }
// //         current = w;
// //         if (lines.length >= maxLines) break;
// //       }
// //     }
// //     if (current && lines.length < maxLines) lines.push(current);

// //     // agar poora text fit nahi hua to last line pe "..."
// //     const joined = lines.join(" ");
// //     const original = words.join(" ");
// //     if (joined.length < original.length && lines.length) {
// //       let last = lines[lines.length - 1];
// //       while (
// //         font.widthOfTextAtSize(last + "...", size) > maxWidth &&
// //         last.length > 1
// //       ) {
// //         last = last.slice(0, -1);
// //       }
// //       lines[lines.length - 1] = last + "...";
// //     }
// //     return lines;
// //   };

// //   const line = (y, { color = COLORS.line, thickness = 0.7 } = {}) => {
// //     page.drawLine({
// //       start: { x: L, y },
// //       end: { x: R, y },
// //       thickness,
// //       color,
// //     });
// //   };

// //   const textCenter = (str, cx, cy, { font = fontReg, size = 11, color = COLORS.white } = {}) => {
// //     const s = String(str ?? "");
// //     const w = font.widthOfTextAtSize(s, size);
// //     page.drawText(s, { x: cx - w / 2, y: cy, size, font, color });
// //   };

// //   // Approximates a rounded rect by drawing many thin horizontal bands, each
// //   // inset near the top/bottom edges per the circle equation — avoids
// //   // pdf-lib clipping-path complexity while still giving real rounded corners.
// //   const drawRoundedGradientRect = ({ x, y, width: w, height: h, radius, colorTop, colorBottom, stripeCount = 70 }) => {
// //     const inset = (dist) => {
// //       if (dist >= radius) return 0;
// //       const dy = radius - dist;
// //       return radius - Math.sqrt(Math.max(0, radius * radius - dy * dy));
// //     };
// //     const stripeH = h / stripeCount;
// //     for (let i = 0; i < stripeCount; i++) {
// //       const stripeY = y + i * stripeH;
// //       const stripeCenterY = stripeY + stripeH / 2;
// //       const distFromTop = y + h - stripeCenterY;
// //       const distFromBottom = stripeCenterY - y;
// //       const insetAmt = Math.max(inset(distFromTop), inset(distFromBottom));
// //       const t = stripeCount > 1 ? i / (stripeCount - 1) : 0;
// //       const color = rgb(
// //         colorBottom.red + (colorTop.red - colorBottom.red) * t,
// //         colorBottom.green + (colorTop.green - colorBottom.green) * t,
// //         colorBottom.blue + (colorTop.blue - colorBottom.blue) * t
// //       );
// //       page.drawRectangle({
// //         x: x + insetAmt,
// //         y: stripeY,
// //         width: Math.max(0, w - insetAmt * 2),
// //         height: stripeH + 0.6,
// //         color,
// //       });
// //     }
// //   };

// //   // Simple vector checkmark (✓) drawn as two line segments — StandardFonts
// //   // can't encode the real "✓" glyph (WinAnsi), so this avoids that crash.
// //   const drawCheckmark = (x, y, size, color) => {
// //     page.drawLine({
// //       start: { x, y: y + size * 0.42 },
// //       end: { x: x + size * 0.36, y: y + size * 0.08 },
// //       thickness: 1.6,
// //       color,
// //     });
// //     page.drawLine({
// //       start: { x: x + size * 0.36, y: y + size * 0.08 },
// //       end: { x: x + size, y: y + size * 0.7 },
// //       thickness: 1.6,
// //       color,
// //     });
// //   };

// //   // full page = the email's dark card background (#121212)
// //   page.drawRectangle({ x: 0, y: 0, width, height, color: COLORS.bg });

// //   /* ================= HEADER (pink → blue gradient band) ================= */
// //   const headerH = 90;
// //   const stripes = 80;
// //   for (let i = 0; i < stripes; i++) {
// //     const t = i / (stripes - 1);
// //     page.drawRectangle({
// //       x: (width / stripes) * i,
// //       y: height - headerH,
// //       width: width / stripes + 1, // +1 avoids hairline gaps between stripes
// //       height: headerH,
// //       color: rgb(
// //         COLORS.pink.red + (COLORS.blue.red - COLORS.pink.red) * t,
// //         COLORS.pink.green + (COLORS.blue.green - COLORS.pink.green) * t,
// //         COLORS.pink.blue + (COLORS.blue.blue - COLORS.pink.blue) * t
// //       ),
// //     });
// //   }

// //   text("Tokun.World", L, height - 46, { font: fontBold, size: 20 });
// //   textRight(`Invoice #${data.invoiceNo}`, R, height - 40, { size: 12 });
// //   textRight(data.date, R, height - 56, { size: 12 });

// //   let y = height - headerH - 40;

// //   /* ================= BILLING INFO (FROM left / Bill To right) ================= */
// //   text("FROM", L, y, { font: fontBold, size: 10 });
// //   text("Tokun.World", L, y - 18, { size: 12 });
// //   text("support@tokun.world", L, y - 34, { size: 12 });

// //   const billTo = "Bill To";
// //   textRight(billTo, R, y, { font: fontBold, size: 10 });
// //   textRight(data.buyerName || "Customer", R, y - 18, { font: fontBold, size: 12 });
// //   textRight(data.buyerEmail || "", R, y - 34, { size: 12 });

// //   y -= 54;
// //   line(y, { color: COLORS.line, thickness: 1 });

// //   /* ================= INTRO DESCRIPTION (every invoice) ================= */
// //   y -= 24;
// //   const introText = data.planCard
// //     ? `This is your invoice for your Tokun ${(PLAN_CARD_CONTENT[String(data.planCard.plan || "pro").toLowerCase()] || PLAN_CARD_CONTENT.pro).title} subscription — thank you for subscribing!`
// //     : "This is your invoice for your recent purchase from Tokun.World.";
// //   {
// //     const introLines = wrapText(introText, fontReg, 11, R - L, 2);
// //     for (const l2 of introLines) {
// //       text(l2, L, y, { size: 11, color: COLORS.muted });
// //       y -= 15;
// //     }
// //   }
// //   y -= 6;

// //   /* ================= PLAN CARD (subscriptions only) — mirrors the real
// //      pricing card on the Subscription page (title/subtitle/price/tokens/
// //      feature rows, rounded corners, gradient by tier) ================= */
// //   if (data.planCard) {
// //     const planKeyRaw = String(data.planCard.plan || "pro").toLowerCase();
// //     const content = PLAN_CARD_CONTENT[planKeyRaw] || PLAN_CARD_CONTENT.pro;
// //     const grad = PLAN_GRADIENTS[planKeyRaw] || PLAN_GRADIENTS.pro;
// //     const gradFrom = hexToRgb(grad.from);
// //     const gradTo = hexToRgb(grad.to);
// //     const cycleLabel = data.planCard.billingCycle === "yearly" ? "year" : "month";
// //     const priceDisplay = `INR ${Number(data.planCard.price ?? 0).toFixed(0)}`;
// //     const cardRadius = 18;

// //     const cardW = 300;
// //     const cardX = L + (R - L - cardW) / 2;
// //     const buttonH = 36;
// //     const cardH = 208 + content.extras.length * 20 + buttonH;

// //     y -= content.highlight ? 24 : 10;
// //     const cardTop = y;
// //     const cardBottom = cardTop - cardH;

// //     drawRoundedGradientRect({
// //       x: cardX,
// //       y: cardBottom,
// //       width: cardW,
// //       height: cardH,
// //       radius: cardRadius,
// //       colorTop: gradFrom,
// //       colorBottom: gradTo,
// //     });

// //     const cx = cardX + cardW / 2;
// //     let cy = cardTop - 30;

// //     if (content.highlight) {
// //       const badge = content.highlight;
// //       const badgeSize = 10;
// //       const badgeW = fontBold.widthOfTextAtSize(badge, badgeSize) + 24;
// //       const badgeH = 22;
// //       drawRoundedGradientRect({
// //         x: cx - badgeW / 2,
// //         y: cardTop - badgeH / 2,
// //         width: badgeW,
// //         height: badgeH,
// //         radius: badgeH / 2,
// //         colorTop: hexToRgb(PLAN_GRADIENTS.pro.from),
// //         colorBottom: hexToRgb(PLAN_GRADIENTS.pro.to),
// //       });
// //       textCenter(badge, cx, cardTop - badgeH / 2 - 3, { font: fontBold, size: badgeSize, color: COLORS.white });
// //       cy = cardTop - 52;
// //     }

// //     textCenter(content.title, cx, cy, { font: fontBold, size: 30 });
// //     cy -= 20;
// //     textCenter(content.subtitle, cx, cy, { size: 11, color: rgb(0.88, 0.88, 0.88) });
// //     cy -= 38;
// //     textCenter(`${priceDisplay} /${cycleLabel}`, cx, cy, { font: fontBold, size: 22 });
// //     cy -= 32;

// //     textCenter(`Monthly Tokens: ${content.tokens}`, cx, cy, { size: 12 });
// //     cy -= 26;

// //     for (const extra of content.extras) {
// //       const isNegative = extra.value === "No" || extra.value === "—";
// //       const markColor = isNegative ? rgb(0.94, 0.4, 0.4) : rgb(0.55, 0.95, 0.65);
// //       // StandardFonts (WinAnsi) can't encode "₹" — swap to "Rs." for the PDF only
// //       const valueText = extra.value.replace(/₹/g, "Rs. ");
// //       const rowText = `${extra.label} - ${valueText}`;
// //       const rowW = fontReg.widthOfTextAtSize(rowText, 10.5);
// //       const markSize = 11;
// //       const gap = 8;
// //       const rowX = cx - (rowW + markSize + gap) / 2;
// //       if (isNegative) {
// //         page.drawLine({ start: { x: rowX, y: cy + markSize * 0.55 }, end: { x: rowX + markSize, y: cy + markSize * 0.15 }, thickness: 1.6, color: markColor });
// //         page.drawLine({ start: { x: rowX, y: cy + markSize * 0.15 }, end: { x: rowX + markSize, y: cy + markSize * 0.55 }, thickness: 1.6, color: markColor });
// //       } else {
// //         drawCheckmark(rowX, cy - 1, markSize, markColor);
// //       }
// //       page.drawText(rowText, { x: rowX + markSize + gap, y: cy, size: 10.5, font: fontReg, color: COLORS.white });
// //       cy -= 20;
// //     }

// //     // Gradient "More info." pill button, matching the Subscription page card
// //     cy -= 8;
// //     const buttonW = cardW - 44;
// //     drawRoundedGradientRect({
// //       x: cx - buttonW / 2,
// //       y: cy - buttonH,
// //       width: buttonW,
// //       height: buttonH,
// //       radius: buttonH / 2,
// //       colorTop: hexToRgb(PLAN_GRADIENTS.pro.from),
// //       colorBottom: hexToRgb(PLAN_GRADIENTS.pro.to),
// //     });
// //     textCenter("More info.", cx, cy - buttonH / 2 - 4, { font: fontBold, size: 12, color: COLORS.white });

// //     y = cardBottom - 26;
// //   }

// //   /* ================= ITEMS ================= */
// //   const COL = {
// //     desc: L,
// //     amountRight: R,
// //     descMaxWidth: R - L - 90, // leaves room for the amount column
// //   };

// //   y -= 26;
// //   text("DESCRIPTION", COL.desc, y, { font: fontBold, size: 9, color: COLORS.muted });
// //   textRight("AMOUNT", COL.amountRight, y, { font: fontBold, size: 9, color: COLORS.muted });
// //   y -= 10;
// //   line(y, { color: COLORS.line, thickness: 1 });

// //   data.items.forEach((item) => {
// //     const titleLines = wrapText(item.title, fontBold, 13, COL.descMaxWidth, 2);
// //     const subLines = item.subtitle
// //       ? wrapText(item.subtitle, fontReg, 11, COL.descMaxWidth, 1)
// //       : [];

// //     y -= 22;
// //     let ty = y;

// //     textRight(`INR ${Number(item.price || 0).toFixed(2)}`, COL.amountRight, ty, { size: 13 });

// //     for (const tl of titleLines) {
// //       text(tl, COL.desc, ty, { font: fontBold, size: 13 });
// //       ty -= 16;
// //     }
// //     for (const sl of subLines) {
// //       text(sl, COL.desc, ty, { size: 11, color: COLORS.muted });
// //       ty -= 16;
// //     }

// //     y = ty - 6;
// //     line(y, { color: COLORS.line, thickness: 1 });
// //   });

// //   /* ================= TOTALS (right-aligned, like the email) ================= */
// //   const subtotal = data.items.reduce((s, it) => s + Number(it.price || 0), 0);
// //   const gst = +(subtotal * 0.18).toFixed(2);
// //   const total = +(subtotal + gst).toFixed(2);

// //   y -= 26;
// //   textRight(`Subtotal: INR ${subtotal.toFixed(2)}`, R, y, { size: 12 });
// //   y -= 18;
// //   textRight(`GST (18%): INR ${gst.toFixed(2)}`, R, y, { size: 12 });
// //   y -= 24;
// //   textRight(`Total: INR ${total.toFixed(2)}`, R, y, { font: fontBold, size: 16 });

// //   y -= 20;
// //   line(y, { color: COLORS.line, thickness: 1 });

// //   /* ================= FOOTER ================= */
// //   page.drawRectangle({ x: 0, y: 0, width, height: 50, color: COLORS.footer });
// //   text("Thank you for your purchase.", L, 28, { size: 10, color: COLORS.muted });

// //   const pdfBytes = await pdfDoc.save();
// //   return Buffer.from(pdfBytes);
// // };



// // utils/generateInvoicePDF.js
// const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
// const { PLAN_CARD_CONTENT, PLAN_GRADIENTS } = require("../config/planCardContent");

// const hexToRgb = (hex) => {
//   const n = parseInt(hex.replace("#", ""), 16);
//   return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
// };

// exports.generateInvoicePDF = async (data) => {
//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage([595, 842]); // A4

//   const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//   const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

//   const { width, height } = page.getSize();
//   const L = 50;
//   const R = width - 50;

//   // Palette matches the invoice email template exactly (htmltemplate/invoiceEmail.html):
//   // #121212 card, #2a2a2a dividers, #1a1a1a footer, #ff14ef → #1a73e8 header gradient.
//   const COLORS = {
//     bg: rgb(0.071, 0.071, 0.071),
//     footer: rgb(0.102, 0.102, 0.102),
//     line: rgb(0.165, 0.165, 0.165),
//     white: rgb(1, 1, 1),
//     soft: rgb(1, 1, 1),
//     muted: rgb(0.6, 0.6, 0.6),
//     pink: rgb(1.0, 0.078, 0.937),
//     purple: rgb(0.64, 0.3, 1.0),
//     blue: rgb(0.102, 0.451, 0.910),
//   };

//   const text = (
//     str,
//     x,
//     y,
//     { font = fontReg, size = 11, color = COLORS.white } = {}
//   ) => {
//     page.drawText(String(str ?? ""), { x, y, size, font, color });
//   };

//   // ✅ right-aligned text (amounts ke liye)
//   const textRight = (
//     str,
//     rightX,
//     y,
//     { font = fontReg, size = 11, color = COLORS.white } = {}
//   ) => {
//     const s = String(str ?? "");
//     const w = font.widthOfTextAtSize(s, size);
//     page.drawText(s, { x: rightX - w, y, size, font, color });
//   };

//   // ✅ FIX: pdf-lib text wrap nahi karta — ye helper text ko maxWidth ke andar
//   // words mein todta hai. maxLines ke baad "..." laga ke truncate karta hai.
//   const wrapText = (str, font, size, maxWidth, maxLines = 2) => {
//     const words = String(str ?? "").split(/\s+/).filter(Boolean);
//     const lines = [];
//     let current = "";

//     for (const word of words) {
//       const test = current ? current + " " + word : word;
//       if (font.widthOfTextAtSize(test, size) <= maxWidth) {
//         current = test;
//       } else {
//         if (current) lines.push(current);
//         // ekdum lamba single word ho to usko bhi kaat do
//         let w = word;
//         while (font.widthOfTextAtSize(w, size) > maxWidth && w.length > 1) {
//           w = w.slice(0, -1);
//         }
//         current = w;
//         if (lines.length >= maxLines) break;
//       }
//     }
//     if (current && lines.length < maxLines) lines.push(current);

//     // agar poora text fit nahi hua to last line pe "..."
//     const joined = lines.join(" ");
//     const original = words.join(" ");
//     if (joined.length < original.length && lines.length) {
//       let last = lines[lines.length - 1];
//       while (
//         font.widthOfTextAtSize(last + "...", size) > maxWidth &&
//         last.length > 1
//       ) {
//         last = last.slice(0, -1);
//       }
//       lines[lines.length - 1] = last + "...";
//     }
//     return lines;
//   };

//   const line = (y, { color = COLORS.line, thickness = 0.7 } = {}) => {
//     page.drawLine({
//       start: { x: L, y },
//       end: { x: R, y },
//       thickness,
//       color,
//     });
//   };

//   const textCenter = (str, cx, cy, { font = fontReg, size = 11, color = COLORS.white } = {}) => {
//     const s = String(str ?? "");
//     const w = font.widthOfTextAtSize(s, size);
//     page.drawText(s, { x: cx - w / 2, y: cy, size, font, color });
//   };

//   // Approximates a rounded rect by drawing many thin horizontal bands, each
//   // inset near the top/bottom edges per the circle equation — avoids
//   // pdf-lib clipping-path complexity while still giving real rounded corners.
//   const drawRoundedGradientRect = ({ x, y, width: w, height: h, radius, colorTop, colorBottom, stripeCount = 70 }) => {
//     const inset = (dist) => {
//       if (dist >= radius) return 0;
//       const dy = radius - dist;
//       return radius - Math.sqrt(Math.max(0, radius * radius - dy * dy));
//     };
//     const stripeH = h / stripeCount;
//     for (let i = 0; i < stripeCount; i++) {
//       const stripeY = y + i * stripeH;
//       const stripeCenterY = stripeY + stripeH / 2;
//       const distFromTop = y + h - stripeCenterY;
//       const distFromBottom = stripeCenterY - y;
//       const insetAmt = Math.max(inset(distFromTop), inset(distFromBottom));
//       const t = stripeCount > 1 ? i / (stripeCount - 1) : 0;
//       const color = rgb(
//         colorBottom.red + (colorTop.red - colorBottom.red) * t,
//         colorBottom.green + (colorTop.green - colorBottom.green) * t,
//         colorBottom.blue + (colorTop.blue - colorBottom.blue) * t
//       );
//       page.drawRectangle({
//         x: x + insetAmt,
//         y: stripeY,
//         width: Math.max(0, w - insetAmt * 2),
//         height: stripeH + 0.6,
//         color,
//       });
//     }
//   };

//   // Simple vector checkmark (✓) drawn as two line segments — StandardFonts
//   // can't encode the real "✓" glyph (WinAnsi), so this avoids that crash.
//   const drawCheckmark = (x, y, size, color) => {
//     page.drawLine({
//       start: { x, y: y + size * 0.42 },
//       end: { x: x + size * 0.36, y: y + size * 0.08 },
//       thickness: 1.6,
//       color,
//     });
//     page.drawLine({
//       start: { x: x + size * 0.36, y: y + size * 0.08 },
//       end: { x: x + size, y: y + size * 0.7 },
//       thickness: 1.6,
//       color,
//     });
//   };

//   // full page = the email's dark card background (#121212)
//   page.drawRectangle({ x: 0, y: 0, width, height, color: COLORS.bg });

//   /* ================= HEADER (pink → blue gradient band) ================= */
//   const headerH = 90;
//   const stripes = 80;
//   for (let i = 0; i < stripes; i++) {
//     const t = i / (stripes - 1);
//     page.drawRectangle({
//       x: (width / stripes) * i,
//       y: height - headerH,
//       width: width / stripes + 1, // +1 avoids hairline gaps between stripes
//       height: headerH,
//       color: rgb(
//         COLORS.pink.red + (COLORS.blue.red - COLORS.pink.red) * t,
//         COLORS.pink.green + (COLORS.blue.green - COLORS.pink.green) * t,
//         COLORS.pink.blue + (COLORS.blue.blue - COLORS.pink.blue) * t
//       ),
//     });
//   }

//   text("Tokun.World", L, height - 46, { font: fontBold, size: 20 });
//   textRight(`Invoice #${data.invoiceNo}`, R, height - 40, { size: 12 });
//   textRight(data.date, R, height - 56, { size: 12 });

//   let y = height - headerH - 40;

//   /* ================= BILLING INFO (FROM left / Bill To right) ================= */
//   text("FROM", L, y, { font: fontBold, size: 10 });
//   text("Tokun.World", L, y - 18, { size: 12 });
//   text("support@tokun.world", L, y - 34, { size: 12 });

//   const billTo = "Bill To";
//   textRight(billTo, R, y, { font: fontBold, size: 10 });
//   textRight(data.buyerName || "Customer", R, y - 18, { font: fontBold, size: 12 });
//   textRight(data.buyerEmail || "", R, y - 34, { size: 12 });

//   y -= 54;
//   line(y, { color: COLORS.line, thickness: 1 });

//   /* ================= INTRO DESCRIPTION (every invoice) ================= */
//   y -= 24;
//   const introText = data.planCard
//     ? `This is your invoice for your Tokun ${(PLAN_CARD_CONTENT[String(data.planCard.plan || "pro").toLowerCase()] || PLAN_CARD_CONTENT.pro).title} subscription — thank you for subscribing!`
//     : "This is your invoice for your recent purchase from Tokun.World.";
//   {
//     const introLines = wrapText(introText, fontReg, 11, R - L, 2);
//     for (const l2 of introLines) {
//       text(l2, L, y, { size: 11, color: COLORS.muted });
//       y -= 15;
//     }
//   }
//   y -= 6;

//   /* ================= PLAN CARD (subscriptions only) — mirrors the real
//      pricing card on the Subscription page (title/subtitle/price/tokens/
//      feature rows, rounded corners, gradient by tier) ================= */
//   if (data.planCard) {
//     const planKeyRaw = String(data.planCard.plan || "pro").toLowerCase();
//     const content = PLAN_CARD_CONTENT[planKeyRaw] || PLAN_CARD_CONTENT.pro;
//     const grad = PLAN_GRADIENTS[planKeyRaw] || PLAN_GRADIENTS.pro;
//     const gradFrom = hexToRgb(grad.from);
//     const gradTo = hexToRgb(grad.to);
//     const cycleLabel = data.planCard.billingCycle === "yearly" ? "year" : "month";
//     const priceDisplay = `INR ${Number(data.planCard.price ?? 0).toFixed(0)}`;
//     const cardRadius = 18;

//     const cardW = 300;
//     const cardX = L + (R - L - cardW) / 2;
//     const buttonH = 36;
//     const cardH = 208 + content.extras.length * 20 + buttonH;

//     y -= content.highlight ? 24 : 10;
//     const cardTop = y;
//     const cardBottom = cardTop - cardH;

//     drawRoundedGradientRect({
//       x: cardX,
//       y: cardBottom,
//       width: cardW,
//       height: cardH,
//       radius: cardRadius,
//       colorTop: gradFrom,
//       colorBottom: gradTo,
//     });

//     const cx = cardX + cardW / 2;
//     let cy = cardTop - 30;

//     if (content.highlight) {
//       const badge = content.highlight;
//       const badgeSize = 10;
//       const badgeW = fontBold.widthOfTextAtSize(badge, badgeSize) + 24;
//       const badgeH = 22;
//       // ✅ FIX: badge now uses THIS plan's own gradient (gradFrom/gradTo)
//       // instead of always PLAN_GRADIENTS.pro — so the enterprise badge
//       // renders gold instead of staying pink/blue.
//       drawRoundedGradientRect({
//         x: cx - badgeW / 2,
//         y: cardTop - badgeH / 2,
//         width: badgeW,
//         height: badgeH,
//         radius: badgeH / 2,
//         colorTop: gradFrom,
//         colorBottom: gradTo,
//       });
//       textCenter(badge, cx, cardTop - badgeH / 2 - 3, { font: fontBold, size: badgeSize, color: COLORS.white });
//       cy = cardTop - 52;
//     }

//     textCenter(content.title, cx, cy, { font: fontBold, size: 30 });
//     cy -= 20;
//     textCenter(content.subtitle, cx, cy, { size: 11, color: rgb(0.88, 0.88, 0.88) });
//     cy -= 38;
//     textCenter(`${priceDisplay} /${cycleLabel}`, cx, cy, { font: fontBold, size: 22 });
//     cy -= 32;

//     textCenter(`Monthly Tokens: ${content.tokens}`, cx, cy, { size: 12 });
//     cy -= 26;

//     for (const extra of content.extras) {
//       const isNegative = extra.value === "No" || extra.value === "—";
//       const markColor = isNegative ? rgb(0.94, 0.4, 0.4) : rgb(0.55, 0.95, 0.65);
//       // StandardFonts (WinAnsi) can't encode "₹" — swap to "Rs." for the PDF only
//       const valueText = extra.value.replace(/₹/g, "Rs. ");
//       const rowText = `${extra.label} - ${valueText}`;
//       const rowW = fontReg.widthOfTextAtSize(rowText, 10.5);
//       const markSize = 11;
//       const gap = 8;
//       const rowX = cx - (rowW + markSize + gap) / 2;
//       if (isNegative) {
//         page.drawLine({ start: { x: rowX, y: cy + markSize * 0.55 }, end: { x: rowX + markSize, y: cy + markSize * 0.15 }, thickness: 1.6, color: markColor });
//         page.drawLine({ start: { x: rowX, y: cy + markSize * 0.15 }, end: { x: rowX + markSize, y: cy + markSize * 0.55 }, thickness: 1.6, color: markColor });
//       } else {
//         drawCheckmark(rowX, cy - 1, markSize, markColor);
//       }
//       page.drawText(rowText, { x: rowX + markSize + gap, y: cy, size: 10.5, font: fontReg, color: COLORS.white });
//       cy -= 20;
//     }

//     // Gradient "More info." pill button, matching the Subscription page card.
//     // ✅ FIX: also uses THIS plan's own gradient now (was hardcoded to pro).
//     cy -= 8;
//     const buttonW = cardW - 44;
//     drawRoundedGradientRect({
//       x: cx - buttonW / 2,
//       y: cy - buttonH,
//       width: buttonW,
//       height: buttonH,
//       radius: buttonH / 2,
//       colorTop: gradFrom,
//       colorBottom: gradTo,
//     });
//     textCenter("More info.", cx, cy - buttonH / 2 - 4, { font: fontBold, size: 12, color: COLORS.white });

//     y = cardBottom - 26;
//   }

//   /* ================= ITEMS ================= */
//   const COL = {
//     desc: L,
//     amountRight: R,
//     descMaxWidth: R - L - 90, // leaves room for the amount column
//   };

//   y -= 26;
//   text("DESCRIPTION", COL.desc, y, { font: fontBold, size: 9, color: COLORS.muted });
//   textRight("AMOUNT", COL.amountRight, y, { font: fontBold, size: 9, color: COLORS.muted });
//   y -= 10;
//   line(y, { color: COLORS.line, thickness: 1 });

//   data.items.forEach((item) => {
//     const titleLines = wrapText(item.title, fontBold, 13, COL.descMaxWidth, 2);
//     const subLines = item.subtitle
//       ? wrapText(item.subtitle, fontReg, 11, COL.descMaxWidth, 1)
//       : [];

//     y -= 22;
//     let ty = y;

//     textRight(`INR ${Number(item.price || 0).toFixed(2)}`, COL.amountRight, ty, { size: 13 });

//     for (const tl of titleLines) {
//       text(tl, COL.desc, ty, { font: fontBold, size: 13 });
//       ty -= 16;
//     }
//     for (const sl of subLines) {
//       text(sl, COL.desc, ty, { size: 11, color: COLORS.muted });
//       ty -= 16;
//     }

//     y = ty - 6;
//     line(y, { color: COLORS.line, thickness: 1 });
//   });

//   /* ================= TOTALS (right-aligned, like the email) ================= */
//   const subtotal = data.items.reduce((s, it) => s + Number(it.price || 0), 0);
//   const gst = +(subtotal * 0.18).toFixed(2);
//   const total = +(subtotal + gst).toFixed(2);

//   y -= 26;
//   textRight(`Subtotal: INR ${subtotal.toFixed(2)}`, R, y, { size: 12 });
//   y -= 18;
//   textRight(`GST (18%): INR ${gst.toFixed(2)}`, R, y, { size: 12 });
//   y -= 24;
//   textRight(`Total: INR ${total.toFixed(2)}`, R, y, { font: fontBold, size: 16 });

//   y -= 20;
//   line(y, { color: COLORS.line, thickness: 1 });

//   /* ================= FOOTER ================= */
//   page.drawRectangle({ x: 0, y: 0, width, height: 50, color: COLORS.footer });
//   text("Thank you for your purchase.", L, 28, { size: 10, color: COLORS.muted });

//   const pdfBytes = await pdfDoc.save();
//   return Buffer.from(pdfBytes);
// };

// utils/generateInvoicePDF.js
const {
  PDFDocument,
  rgb,
  StandardFonts,
  moveTo,
  lineTo,
  appendBezierCurve,
  clip,
  endPath,
  pushGraphicsState,
  popGraphicsState,
} = require("pdf-lib");
const { PLAN_CARD_CONTENT, PLAN_GRADIENTS } = require("../config/planCardContent");

const hexToRgb = (hex) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

// ✅ FIX: the stripe-based gradient trick (see drawRoundedGradientRect below)
// banding-artifacts on very small, fully-curved shapes — a pill-shaped badge
// or button whose height ≈ its own corner radius has almost no "flat"
// region, so every one of the 70 stripes is only ~0.3–0.5pt thick. PDF
// viewers (Gmail's included) then show visible seams between those
// near-sub-pixel bands — a "venetian blind" look. On a shape that small the
// gradient is barely visible anyway, so for badge/button we blend the two
// stops into one solid color instead of drawing a real gradient — same
// helper, same visual "brand" color, but no seams because there's no
// stripe-to-stripe color change left to leak through.
const mixColor = (c1, c2, t = 0.5) =>
  rgb(
    c1.red + (c2.red - c1.red) * t,
    c1.green + (c2.green - c1.green) * t,
    c1.blue + (c2.blue - c1.blue) * t
  );

exports.generateInvoicePDF = async (data) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  const L = 50;
  const R = width - 50;

  // Palette matches the invoice email template exactly (htmltemplate/invoiceEmail.html):
  // #121212 card, #2a2a2a dividers, #1a1a1a footer, #ff14ef → #1a73e8 header gradient.
  const COLORS = {
    bg: rgb(0.071, 0.071, 0.071),
    footer: rgb(0.102, 0.102, 0.102),
    line: rgb(0.165, 0.165, 0.165),
    white: rgb(1, 1, 1),
    soft: rgb(1, 1, 1),
    muted: rgb(0.6, 0.6, 0.6),
    pink: rgb(1.0, 0.078, 0.937),
    purple: rgb(0.64, 0.3, 1.0),
    blue: rgb(0.102, 0.451, 0.910),
  };

  const text = (
    str,
    x,
    y,
    { font = fontReg, size = 11, color = COLORS.white } = {}
  ) => {
    page.drawText(String(str ?? ""), { x, y, size, font, color });
  };

  // ✅ right-aligned text (amounts ke liye)
  const textRight = (
    str,
    rightX,
    y,
    { font = fontReg, size = 11, color = COLORS.white } = {}
  ) => {
    const s = String(str ?? "");
    const w = font.widthOfTextAtSize(s, size);
    page.drawText(s, { x: rightX - w, y, size, font, color });
  };

  // ✅ FIX: pdf-lib text wrap nahi karta — ye helper text ko maxWidth ke andar
  // words mein todta hai. maxLines ke baad "..." laga ke truncate karta hai.
  const wrapText = (str, font, size, maxWidth, maxLines = 2) => {
    const words = String(str ?? "").split(/\s+/).filter(Boolean);
    const lines = [];
    let current = "";

    for (const word of words) {
      const test = current ? current + " " + word : word;
      if (font.widthOfTextAtSize(test, size) <= maxWidth) {
        current = test;
      } else {
        if (current) lines.push(current);
        // ekdum lamba single word ho to usko bhi kaat do
        let w = word;
        while (font.widthOfTextAtSize(w, size) > maxWidth && w.length > 1) {
          w = w.slice(0, -1);
        }
        current = w;
        if (lines.length >= maxLines) break;
      }
    }
    if (current && lines.length < maxLines) lines.push(current);

    // agar poora text fit nahi hua to last line pe "..."
    const joined = lines.join(" ");
    const original = words.join(" ");
    if (joined.length < original.length && lines.length) {
      let last = lines[lines.length - 1];
      while (
        font.widthOfTextAtSize(last + "...", size) > maxWidth &&
        last.length > 1
      ) {
        last = last.slice(0, -1);
      }
      lines[lines.length - 1] = last + "...";
    }
    return lines;
  };

  const line = (y, { color = COLORS.line, thickness = 0.7 } = {}) => {
    page.drawLine({
      start: { x: L, y },
      end: { x: R, y },
      thickness,
      color,
    });
  };

  const textCenter = (str, cx, cy, { font = fontReg, size = 11, color = COLORS.white } = {}) => {
    const s = String(str ?? "");
    const w = font.widthOfTextAtSize(s, size);
    page.drawText(s, { x: cx - w / 2, y: cy, size, font, color });
  };

  // Real rounded corners: clip to a proper bezier rounded-rect path (the
  // previous version approximated rounding with hundreds of inset rectangle
  // strips, which rendered as a visible staircase — this uses an actual
  // smooth curve, so any fill drawn afterward comes out cleanly rounded).
  const BEZIER_K = 0.5522847498;
  const pushRoundedClip = (x, y, w, h, radius) => {
    const r = Math.max(0, Math.min(radius, w / 2, h / 2));
    const k = r * BEZIER_K;
    page.pushOperators(
      pushGraphicsState(),
      moveTo(x + r, y),
      lineTo(x + w - r, y),
      appendBezierCurve(x + w - r + k, y, x + w, y + r - k, x + w, y + r),
      lineTo(x + w, y + h - r),
      appendBezierCurve(x + w, y + h - r + k, x + w - r + k, y + h, x + w - r, y + h),
      lineTo(x + r, y + h),
      appendBezierCurve(x + r - k, y + h, x, y + h - r + k, x, y + h - r),
      lineTo(x, y + r),
      appendBezierCurve(x, y + r - k, x + r - k, y, x + r, y),
      clip(),
      endPath()
    );
  };
  const popClip = () => page.pushOperators(popGraphicsState());

  const drawRoundedGradientRect = ({ x, y, width: w, height: h, radius, colorTop, colorBottom, stripeCount = 48 }) => {
    pushRoundedClip(x, y, w, h, radius);
    const stripeH = h / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      const stripeY = y + i * stripeH;
      const t = stripeCount > 1 ? i / (stripeCount - 1) : 0;
      const color = rgb(
        colorBottom.red + (colorTop.red - colorBottom.red) * t,
        colorBottom.green + (colorTop.green - colorBottom.green) * t,
        colorBottom.blue + (colorTop.blue - colorBottom.blue) * t
      );
      page.drawRectangle({
        x,
        y: stripeY,
        width: w,
        height: stripeH + 0.6,
        color,
      });
    }
    popClip();
  };

  // Simple vector checkmark (✓) drawn as two line segments — StandardFonts
  // can't encode the real "✓" glyph (WinAnsi), so this avoids that crash.
  const drawCheckmark = (x, y, size, color) => {
    page.drawLine({
      start: { x, y: y + size * 0.42 },
      end: { x: x + size * 0.36, y: y + size * 0.08 },
      thickness: 1.6,
      color,
    });
    page.drawLine({
      start: { x: x + size * 0.36, y: y + size * 0.08 },
      end: { x: x + size, y: y + size * 0.7 },
      thickness: 1.6,
      color,
    });
  };

  // full page = the email's dark card background (#121212)
  page.drawRectangle({ x: 0, y: 0, width, height, color: COLORS.bg });

  /* ================= HEADER (pink → blue gradient band) ================= */
  const headerH = 90;
  const stripes = 80;
  for (let i = 0; i < stripes; i++) {
    const t = i / (stripes - 1);
    page.drawRectangle({
      x: (width / stripes) * i,
      y: height - headerH,
      width: width / stripes + 1, // +1 avoids hairline gaps between stripes
      height: headerH,
      color: rgb(
        COLORS.pink.red + (COLORS.blue.red - COLORS.pink.red) * t,
        COLORS.pink.green + (COLORS.blue.green - COLORS.pink.green) * t,
        COLORS.pink.blue + (COLORS.blue.blue - COLORS.pink.blue) * t
      ),
    });
  }

  text("Tokun.World", L, height - 46, { font: fontBold, size: 20 });
  textRight(`Invoice #${data.invoiceNo}`, R, height - 40, { size: 12 });
  textRight(data.date, R, height - 56, { size: 12 });

  let y = height - headerH - 40;

  /* ================= BILLING INFO (FROM left / Bill To right) ================= */
  text("FROM", L, y, { font: fontBold, size: 10 });
  text("Tokun.World", L, y - 18, { size: 12 });
  text("support@tokun.world", L, y - 34, { size: 12 });

  const billTo = "Bill To";
  textRight(billTo, R, y, { font: fontBold, size: 10 });
  textRight(data.buyerName || "Customer", R, y - 18, { font: fontBold, size: 12 });
  textRight(data.buyerEmail || "", R, y - 34, { size: 12 });

  y -= 54;
  line(y, { color: COLORS.line, thickness: 1 });

  /* ================= INTRO DESCRIPTION (every invoice) ================= */
  y -= 24;
  const introText = data.planCard
    ? `This is your invoice for your Tokun ${(PLAN_CARD_CONTENT[String(data.planCard.plan || "pro").toLowerCase()] || PLAN_CARD_CONTENT.pro).title} subscription — thank you for subscribing!`
    : "This is your invoice for your recent purchase from Tokun.World.";
  {
    const introLines = wrapText(introText, fontReg, 11, R - L, 2);
    for (const l2 of introLines) {
      text(l2, L, y, { size: 11, color: COLORS.muted });
      y -= 15;
    }
  }
  y -= 6;

  /* ================= PLAN CARD (subscriptions only) — mirrors the real
     pricing card on the Subscription page (title/subtitle/price/tokens/
     feature rows, rounded corners, gradient by tier) ================= */
  if (data.planCard) {
    const planKeyRaw = String(data.planCard.plan || "pro").toLowerCase();
    const content = PLAN_CARD_CONTENT[planKeyRaw] || PLAN_CARD_CONTENT.pro;
    const grad = PLAN_GRADIENTS[planKeyRaw] || PLAN_GRADIENTS.pro;
    const gradFrom = hexToRgb(grad.from);
    const gradTo = hexToRgb(grad.to);
    const cycleLabel = data.planCard.billingCycle === "yearly" ? "year" : "month";
    const priceDisplay = `INR ${Number(data.planCard.price ?? 0).toFixed(0)}`;
    const cardRadius = 18;

    const cardW = 300;
    const cardX = L + (R - L - cardW) / 2;
    const buttonH = 36;
    const cardH = 208 + content.extras.length * 20 + buttonH;

    y -= content.highlight ? 24 : 10;
    const cardTop = y;
    const cardBottom = cardTop - cardH;

    drawRoundedGradientRect({
      x: cardX,
      y: cardBottom,
      width: cardW,
      height: cardH,
      radius: cardRadius,
      colorTop: gradFrom,
      colorBottom: gradTo,
    });

    const cx = cardX + cardW / 2;
    let cy = cardTop - 30;

    if (content.highlight) {
      const badge = content.highlight;
      const badgeSize = 10;
      const badgeW = fontBold.widthOfTextAtSize(badge, badgeSize) + 24;
      const badgeH = 22;
      // ✅ FIX: badge uses THIS plan's own gradient color (not hardcoded
      // pro), blended into one solid tone so the tiny fully-curved pill
      // doesn't show the stripe-seam artifact (see mixColor comment above).
      const badgeColor = mixColor(gradFrom, gradTo, 0.5);
      drawRoundedGradientRect({
        x: cx - badgeW / 2,
        y: cardTop - badgeH / 2,
        width: badgeW,
        height: badgeH,
        radius: badgeH / 2,
        colorTop: badgeColor,
        colorBottom: badgeColor,
      });
      textCenter(badge, cx, cardTop - badgeH / 2 - 3, { font: fontBold, size: badgeSize, color: COLORS.white });
      cy = cardTop - 52;
    }

    textCenter(content.title, cx, cy, { font: fontBold, size: 30 });
    cy -= 20;
    textCenter(content.subtitle, cx, cy, { size: 11, color: rgb(0.88, 0.88, 0.88) });
    cy -= 38;
    textCenter(`${priceDisplay} /${cycleLabel}`, cx, cy, { font: fontBold, size: 22 });
    cy -= 32;

    textCenter(`Monthly Tokens: ${content.tokens}`, cx, cy, { size: 12 });
    cy -= 26;

    for (const extra of content.extras) {
      const isNegative = extra.value === "No" || extra.value === "—";
      const markColor = isNegative ? rgb(0.94, 0.4, 0.4) : rgb(0.55, 0.95, 0.65);
      // StandardFonts (WinAnsi) can't encode "₹" — swap to "Rs." for the PDF only
      const valueText = extra.value.replace(/₹/g, "Rs. ");
      const rowText = `${extra.label} - ${valueText}`;
      const rowW = fontReg.widthOfTextAtSize(rowText, 10.5);
      const markSize = 11;
      const gap = 8;
      const rowX = cx - (rowW + markSize + gap) / 2;
      if (isNegative) {
        page.drawLine({ start: { x: rowX, y: cy + markSize * 0.55 }, end: { x: rowX + markSize, y: cy + markSize * 0.15 }, thickness: 1.6, color: markColor });
        page.drawLine({ start: { x: rowX, y: cy + markSize * 0.15 }, end: { x: rowX + markSize, y: cy + markSize * 0.55 }, thickness: 1.6, color: markColor });
      } else {
        drawCheckmark(rowX, cy - 1, markSize, markColor);
      }
      page.drawText(rowText, { x: rowX + markSize + gap, y: cy, size: 10.5, font: fontReg, color: COLORS.white });
      cy -= 20;
    }

    // "More info." pill button, matching the Subscription page card.
    // ✅ FIX: uses THIS plan's own gradient (was hardcoded to pro), blended
    // into one solid tone — same reasoning as the badge fix above.
    cy -= 8;
    const buttonW = cardW - 44;
    const buttonColor = mixColor(gradFrom, gradTo, 0.5);
    drawRoundedGradientRect({
      x: cx - buttonW / 2,
      y: cy - buttonH,
      width: buttonW,
      height: buttonH,
      radius: buttonH / 2,
      colorTop: buttonColor,
      colorBottom: buttonColor,
    });
    textCenter("More info.", cx, cy - buttonH / 2 - 4, { font: fontBold, size: 12, color: COLORS.white });

    y = cardBottom - 26;
  }

  /* ================= ITEMS ================= */
  const COL = {
    desc: L,
    amountRight: R,
    descMaxWidth: R - L - 90, // leaves room for the amount column
  };

  y -= 26;
  text("DESCRIPTION", COL.desc, y, { font: fontBold, size: 9, color: COLORS.muted });
  textRight("AMOUNT", COL.amountRight, y, { font: fontBold, size: 9, color: COLORS.muted });
  y -= 10;
  line(y, { color: COLORS.line, thickness: 1 });

  data.items.forEach((item) => {
    const titleLines = wrapText(item.title, fontBold, 13, COL.descMaxWidth, 2);
    const subLines = item.subtitle
      ? wrapText(item.subtitle, fontReg, 11, COL.descMaxWidth, 1)
      : [];

    y -= 22;
    let ty = y;

    textRight(`INR ${Number(item.price || 0).toFixed(2)}`, COL.amountRight, ty, { size: 13 });

    for (const tl of titleLines) {
      text(tl, COL.desc, ty, { font: fontBold, size: 13 });
      ty -= 16;
    }
    for (const sl of subLines) {
      text(sl, COL.desc, ty, { size: 11, color: COLORS.muted });
      ty -= 16;
    }

    y = ty - 6;
    line(y, { color: COLORS.line, thickness: 1 });
  });

  /* ================= TOTALS (right-aligned, like the email) ================= */
  const subtotal = data.items.reduce((s, it) => s + Number(it.price || 0), 0);
  const gst = +(subtotal * 0.18).toFixed(2);
  const total = +(subtotal + gst).toFixed(2);

  y -= 26;
  textRight(`Subtotal: INR ${subtotal.toFixed(2)}`, R, y, { size: 12 });
  y -= 18;
  textRight(`GST (18%): INR ${gst.toFixed(2)}`, R, y, { size: 12 });
  y -= 24;
  textRight(`Total: INR ${total.toFixed(2)}`, R, y, { font: fontBold, size: 16 });

  y -= 20;
  line(y, { color: COLORS.line, thickness: 1 });

  /* ================= FOOTER ================= */
  page.drawRectangle({ x: 0, y: 0, width, height: 50, color: COLORS.footer });
  text("Thank you for your purchase.", L, 28, { size: 10, color: COLORS.muted });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};