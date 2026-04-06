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



const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

/**
 * Puppeteer/Chromium hataya — Azure App Service pe crash karta tha.
 * Ab pdf-lib se pure Node.js mein PDF banta hai, koi browser nahi chahiye.
 */
exports.generateInvoicePDF = async (data) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size in points

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  const L = 50;   // left margin
  const R = width - 50; // right edge

  // ── helpers ──────────────────────────────────────────────
  const text = (str, x, y, { font = fontReg, size = 11, color = rgb(0, 0, 0) } = {}) => {
    page.drawText(String(str ?? ""), { x, y, size, font, color });
  };

  const line = (y, { color = rgb(0.8, 0.8, 0.8), thickness = 0.5 } = {}) => {
    page.drawLine({ start: { x: L, y }, end: { x: R, y }, thickness, color });
  };

  // ── Header bar ───────────────────────────────────────────
  page.drawRectangle({
    x: 0, y: height - 70,
    width, height: 70,
    color: rgb(0.07, 0.07, 0.09),
  });

  text("tokun.ai", L, height - 42, { font: fontBold, size: 20, color: rgb(1, 1, 1) });
  text("INVOICE", R - 65, height - 42, { font: fontBold, size: 18, color: rgb(1, 1, 1) });

  // ── Invoice meta ─────────────────────────────────────────
  let y = height - 100;

  text(`Invoice No : ${data.invoiceNo}`, L, y, { font: fontBold, size: 10 });
  text(`Date       : ${data.date}`, L, y - 18, { size: 10 });

  // ── Billed To ────────────────────────────────────────────
  y -= 55;
  text("BILLED TO", L, y, { font: fontBold, size: 9, color: rgb(0.5, 0.5, 0.5) });
  text(data.buyerName || "Customer", L, y - 16, { font: fontBold, size: 11 });
  text(data.buyerEmail || "", L, y - 32, { size: 10, color: rgb(0.3, 0.3, 0.3) });

  // ── Table header ─────────────────────────────────────────
  y -= 75;
  page.drawRectangle({
    x: L, y: y - 6,
    width: R - L, height: 22,
    color: rgb(0.95, 0.95, 0.97),
  });

  text("#", L + 6, y + 4, { font: fontBold, size: 10 });
  text("Description", L + 30, y + 4, { font: fontBold, size: 10 });
  text("Amount", R - 70, y + 4, { font: fontBold, size: 10 });

  // ── Table rows ───────────────────────────────────────────
  data.items.forEach((item, i) => {
    y -= 30;
    text(String(i + 1), L + 6, y, { size: 10 });
    text(item.title, L + 30, y, { font: fontBold, size: 10 });
    text(item.subtitle || "", L + 30, y - 13, { size: 9, color: rgb(0.5, 0.5, 0.5) });
    text(`INR ${item.price}`, R - 70, y, { size: 10 });
    line(y - 20);
  });

  // ── Totals ───────────────────────────────────────────────
  y -= 50;
  const subtotal = data.items.reduce((s, it) => s + Number(it.price), 0);
  const gst = +(subtotal * 0.18).toFixed(2);
  const total = +(subtotal + gst).toFixed(2);

  const totalsX = R - 200;

  text("Subtotal", totalsX, y, { size: 10 });
  text(`INR ${subtotal}`, R - 70, y, { size: 10 });

  text("GST (18%)", totalsX, y - 18, { size: 10 });
  text(`INR ${gst}`, R - 70, y - 18, { size: 10 });

  line(y - 28, { color: rgb(0.6, 0.6, 0.6), thickness: 1 });

  text("TOTAL", totalsX, y - 44, { font: fontBold, size: 12 });
  text(`INR ${total}`, R - 70, y - 44, { font: fontBold, size: 12 });

  // ── Footer ───────────────────────────────────────────────
  page.drawRectangle({
    x: 0, y: 0,
    width, height: 40,
    color: rgb(0.07, 0.07, 0.09),
  });
  text("Thank you for choosing tokun.ai", L, 14, {
    size: 9,
    color: rgb(0.8, 0.8, 0.8),
  });

  // ── Serialize ────────────────────────────────────────────
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};