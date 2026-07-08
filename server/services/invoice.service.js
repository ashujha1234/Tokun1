// // const fs = require("fs");
// // const path = require("path");
// // const puppeteer = require("puppeteer");

// // exports.generateInvoicePDF = async (data) => {
// //   const templatePath = path.join(
// //     __dirname,
// //     "../htmltemplate/invoice.html"
// //   );

// //   let html = fs.readFileSync(templatePath, "utf8");

// //   const rowsHtml = data.items
// //     .map(
// //       (item, i) => `
// //       <div class="row">
// //         <div>${i + 1}</div>
// //         <div>
// //           <div class="row-title">${item.title}</div>
// //           <div class="row-sub">${item.subtitle}</div>
// //         </div>
// //         <div style="text-align:right">₹${item.price}</div>
// //       </div>
// //     `
// //     )
// //     .join("");

// //   html = html
// //     .replace("{{LOGO}}", data.logo)
// //     .replace("{{DATE}}", data.date)
// //     .replace("{{INVOICE_NO}}", data.invoiceNo)
// //     .replace("{{BUYER_NAME}}", data.buyerName)
// //     .replace("{{BUYER_EMAIL}}", data.buyerEmail)
// //     .replace("{{ROWS}}", rowsHtml)
// //     .replace("{{SUBTOTAL}}", data.total)
// //     .replace("{{TOTAL}}", data.total);

// //   const browser = await puppeteer.launch({
// //     headless: "new",
// //     args: ["--no-sandbox", "--disable-setuid-sandbox"],
// //   });

// //   const page = await browser.newPage();
// //   await page.setContent(html, { waitUntil: "networkidle0" });

// //   const pdf = await page.pdf({
// //     format: "A4",
// //     printBackground: true,
// //   });

// //   await browser.close();
// //   return pdf;
// // };


// const fs = require("fs");
// const path = require("path");
// const puppeteer = require("puppeteer-core");
// const chromium = require("chromium");

// exports.generateInvoicePDF = async (data) => {
//   const templatePath = path.join(__dirname, "../htmltemplate/invoice.html");
//   let html = fs.readFileSync(templatePath, "utf8");

//   const rowsHtml = data.items
//     .map(
//       (item, i) => `
//       <div class="row">
//         <div>${i + 1}</div>
//         <div>
//           <div class="row-title">${item.title}</div>
//           <div class="row-sub">${item.subtitle}</div>
//         </div>
//         <div style="text-align:right">₹${item.price}</div>
//       </div>
//     `
//     )
//     .join("");

//   html = html
//     .replace("{{LOGO}}", data.logo)
//     .replace("{{DATE}}", data.date)
//     .replace("{{INVOICE_NO}}", data.invoiceNo)
//     .replace("{{BUYER_NAME}}", data.buyerName)
//     .replace("{{BUYER_EMAIL}}", data.buyerEmail)
//     .replace("{{ROWS}}", rowsHtml)
//     .replace("{{SUBTOTAL}}", data.total)
//     .replace("{{TOTAL}}", data.total);

//   // ✅ Azure ke liye chromium path use karo
//   const browser = await puppeteer.launch({
//     headless: true,
//     executablePath: chromium.path,
//     args: [
//       "--no-sandbox",
//       "--disable-setuid-sandbox",
//       "--disable-dev-shm-usage",
//       "--disable-gpu",
//       "--single-process",
//       "--no-zygote",
//     ],
//   });

//   try {
//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: "networkidle0" });
//     const pdf = await page.pdf({
//       format: "A4",
//       printBackground: true,
//     });
//     return pdf;
//   } finally {
//     await browser.close(); // ✅ error pe bhi close hoga
//   }
// };



// const fs = require("fs");
// const path = require("path");
// const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

// /**
//  * Puppeteer/Chromium hataya — Azure App Service pe crash karta tha.
//  * Ab pdf-lib se pure Node.js mein PDF banta hai, koi browser nahi chahiye.
//  */
// exports.generateInvoicePDF = async (data) => {
//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage([595, 842]); // A4 size in points

//   const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//   const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

//   const { width, height } = page.getSize();
//   const L = 50;   // left margin
//   const R = width - 50; // right edge

//   // ── helpers ──────────────────────────────────────────────
//   const text = (str, x, y, { font = fontReg, size = 11, color = rgb(0, 0, 0) } = {}) => {
//     page.drawText(String(str ?? ""), { x, y, size, font, color });
//   };

//   const line = (y, { color = rgb(0.8, 0.8, 0.8), thickness = 0.5 } = {}) => {
//     page.drawLine({ start: { x: L, y }, end: { x: R, y }, thickness, color });
//   };

//   // ── Header bar ───────────────────────────────────────────
//   page.drawRectangle({
//     x: 0, y: height - 70,
//     width, height: 70,
//     color: rgb(0.07, 0.07, 0.09),
//   });

//   text("tokun.world", L, height - 42, { font: fontBold, size: 20, color: rgb(1, 1, 1) });
//   text("INVOICE", R - 65, height - 42, { font: fontBold, size: 18, color: rgb(1, 1, 1) });

//   // ── Invoice meta ─────────────────────────────────────────
//   let y = height - 100;

//   text(`Invoice No : ${data.invoiceNo}`, L, y, { font: fontBold, size: 10 });
//   text(`Date       : ${data.date}`, L, y - 18, { size: 10 });

//   // ── Billed To ────────────────────────────────────────────
//   y -= 55;
//   text("BILLED TO", L, y, { font: fontBold, size: 9, color: rgb(0.5, 0.5, 0.5) });
//   text(data.buyerName || "Customer", L, y - 16, { font: fontBold, size: 11 });
//   text(data.buyerEmail || "", L, y - 32, { size: 10, color: rgb(0.3, 0.3, 0.3) });

//   // ── Table header ─────────────────────────────────────────
//   y -= 75;
//   page.drawRectangle({
//     x: L, y: y - 6,
//     width: R - L, height: 22,
//     color: rgb(0.95, 0.95, 0.97),
//   });

//   text("#", L + 6, y + 4, { font: fontBold, size: 10 });
//   text("Description", L + 30, y + 4, { font: fontBold, size: 10 });
//   text("Amount", R - 70, y + 4, { font: fontBold, size: 10 });

//   // ── Table rows ───────────────────────────────────────────
//   data.items.forEach((item, i) => {
//     y -= 30;
//     text(String(i + 1), L + 6, y, { size: 10 });
//     text(item.title, L + 30, y, { font: fontBold, size: 10 });
//     text(item.subtitle || "", L + 30, y - 13, { size: 9, color: rgb(0.5, 0.5, 0.5) });
//     text(`INR ${item.price}`, R - 70, y, { size: 10 });
//     line(y - 20);
//   });

//   // ── Totals ───────────────────────────────────────────────
//   y -= 50;
//   const subtotal = data.items.reduce((s, it) => s + Number(it.price), 0);
//   const gst = +(subtotal * 0.18).toFixed(2);
//   const total = +(subtotal + gst).toFixed(2);

//   const totalsX = R - 200;

//   text("Subtotal", totalsX, y, { size: 10 });
//   text(`INR ${subtotal}`, R - 70, y, { size: 10 });

//   text("GST (18%)", totalsX, y - 18, { size: 10 });
//   text(`INR ${gst}`, R - 70, y - 18, { size: 10 });

//   line(y - 28, { color: rgb(0.6, 0.6, 0.6), thickness: 1 });

//   text("TOTAL", totalsX, y - 44, { font: fontBold, size: 12 });
//   text(`INR ${total}`, R - 70, y - 44, { font: fontBold, size: 12 });

//   // ── Footer ───────────────────────────────────────────────
//   page.drawRectangle({
//     x: 0, y: 0,
//     width, height: 40,
//     color: rgb(0.07, 0.07, 0.09),
//   });
//   text("Thank you for choosing tokun.world", L, 14, {
//     size: 9,
//     color: rgb(0.8, 0.8, 0.8),
//   });

//   // ── Serialize ────────────────────────────────────────────
//   const pdfBytes = await pdfDoc.save();
//   return Buffer.from(pdfBytes);
// };



const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

exports.generateInvoicePDF = async (data) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  const L = 50;
  const R = width - 50;

  const COLORS = {
    bg: rgb(0.04, 0.05, 0.08),          // main dark bg
    panel: rgb(0.09, 0.10, 0.16),       // card/panel
    panel2: rgb(0.13, 0.14, 0.22),      // lighter panel
    line: rgb(0.22, 0.24, 0.34),        // divider
    white: rgb(1, 1, 1),
    soft: rgb(0.78, 0.80, 0.88),
    muted: rgb(0.58, 0.62, 0.72),
    pink: rgb(1.0, 0.08, 0.94),
    purple: rgb(0.64, 0.30, 1.0),
    blue: rgb(0.10, 0.45, 0.91),
  };

  const text = (
    str,
    x,
    y,
    { font = fontReg, size = 11, color = COLORS.white } = {}
  ) => {
    page.drawText(String(str ?? ""), { x, y, size, font, color });
  };

  const line = (y, { color = COLORS.line, thickness = 0.7 } = {}) => {
    page.drawLine({
      start: { x: L, y },
      end: { x: R, y },
      thickness,
      color,
    });
  };

  // full page dark background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: COLORS.bg,
  });

  // top header band
  page.drawRectangle({
    x: 0,
    y: height - 78,
    width,
    height: 78,
    color: COLORS.panel,
  });

  // accent bar
  page.drawRectangle({
    x: 0,
    y: height - 78,
    width,
    height: 6,
    color: COLORS.pink,
  });
  page.drawRectangle({
    x: width * 0.34,
    y: height - 78,
    width: width * 0.33,
    height: 6,
    color: COLORS.purple,
  });
  page.drawRectangle({
    x: width * 0.67,
    y: height - 78,
    width: width * 0.33,
    height: 6,
    color: COLORS.blue,
  });

  text("tokun.world", L, height - 48, {
    font: fontBold,
    size: 20,
    color: COLORS.white,
  });

  text("INVOICE", R - 72, height - 48, {
    font: fontBold,
    size: 18,
    color: COLORS.white,
  });

  let y = height - 112;

  // meta
  text(`Invoice No : ${data.invoiceNo}`, L, y, {
    font: fontBold,
    size: 10,
    color: COLORS.soft,
  });
  text(`Date       : ${data.date}`, L, y - 18, {
    size: 10,
    color: COLORS.soft,
  });

  // billed to card
  y -= 62;
  page.drawRectangle({
    x: L - 10,
    y: y - 54,
    width: 250,
    height: 70,
    color: COLORS.panel,
  });

  text("BILLED TO", L, y, {
    font: fontBold,
    size: 9,
    color: COLORS.pink,
  });
  text(data.buyerName || "Customer", L, y - 18, {
    font: fontBold,
    size: 12,
    color: COLORS.white,
  });
  text(data.buyerEmail || "", L, y - 35, {
    size: 10,
    color: COLORS.muted,
  });

  // table header
  y -= 88;
  page.drawRectangle({
    x: L,
    y: y - 8,
    width: R - L,
    height: 26,
    color: COLORS.panel2,
  });

  text("#", L + 8, y + 2, { font: fontBold, size: 10, color: COLORS.white });
  text("Description", L + 30, y + 2, {
    font: fontBold,
    size: 10,
    color: COLORS.white,
  });
  text("Amount", R - 74, y + 2, {
    font: fontBold,
    size: 10,
    color: COLORS.white,
  });

  // rows
  data.items.forEach((item, i) => {
    y -= 34;

    page.drawRectangle({
      x: L,
      y: y - 18,
      width: R - L,
      height: 34,
      color: i % 2 === 0 ? COLORS.panel : COLORS.bg,
    });

    text(String(i + 1), L + 8, y, { size: 10, color: COLORS.soft });
    text(item.title || "", L + 30, y, {
      font: fontBold,
      size: 10,
      color: COLORS.white,
    });
    text(item.subtitle || "", L + 30, y - 13, {
      size: 9,
      color: COLORS.muted,
    });
    text(`INR ${item.price}`, R - 74, y, {
      size: 10,
      color: COLORS.soft,
    });

    line(y - 22, { color: COLORS.line, thickness: 0.5 });
  });

  // totals
  y -= 58;
  const subtotal = data.items.reduce((s, it) => s + Number(it.price || 0), 0);
  const gst = +(subtotal * 0.18).toFixed(2);
  const total = +(subtotal + gst).toFixed(2);

  const totalsX = R - 200;

  page.drawRectangle({
    x: totalsX - 16,
    y: y - 60,
    width: 190,
    height: 78,
    color: COLORS.panel,
  });

  text("Subtotal", totalsX, y, { size: 10, color: COLORS.soft });
  text(`INR ${subtotal}`, R - 74, y, { size: 10, color: COLORS.soft });

  text("GST (18%)", totalsX, y - 20, { size: 10, color: COLORS.soft });
  text(`INR ${gst}`, R - 74, y - 20, { size: 10, color: COLORS.soft });

  line(y - 30, { color: COLORS.purple, thickness: 1.2 });

  text("TOTAL", totalsX, y - 48, {
    font: fontBold,
    size: 12,
    color: COLORS.white,
  });
  text(`INR ${total}`, R - 74, y - 48, {
    font: fontBold,
    size: 12,
    color: COLORS.pink,
  });

  // footer
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 44,
    color: COLORS.panel,
  });

  page.drawRectangle({
    x: 0,
    y: 38,
    width,
    height: 6,
    color: COLORS.blue,
  });

  text("Thank you for choosing tokun.world", L, 16, {
    size: 9,
    color: COLORS.soft,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};