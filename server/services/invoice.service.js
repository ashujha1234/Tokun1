const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

exports.generateInvoicePDF = async (data) => {
  const templatePath = path.join(
    __dirname,
    "../htmltemplate/invoice.html"
  );

  let html = fs.readFileSync(templatePath, "utf8");

  const rowsHtml = data.items
    .map(
      (item, i) => `
      <div class="row">
        <div>${i + 1}</div>
        <div>
          <div class="row-title">${item.title}</div>
          <div class="row-sub">${item.subtitle}</div>
        </div>
        <div style="text-align:right">₹${item.price}</div>
      </div>
    `
    )
    .join("");

  html = html
    .replace("{{LOGO}}", data.logo)
    .replace("{{DATE}}", data.date)
    .replace("{{INVOICE_NO}}", data.invoiceNo)
    .replace("{{BUYER_NAME}}", data.buyerName)
    .replace("{{BUYER_EMAIL}}", data.buyerEmail)
    .replace("{{ROWS}}", rowsHtml)
    .replace("{{SUBTOTAL}}", data.total)
    .replace("{{TOTAL}}", data.total);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return pdf;
};
