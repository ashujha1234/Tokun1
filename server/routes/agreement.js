/**
 * Turns an agreement's HTML into a PDF for the browser to save.
 *
 * Why this exists: NdaCard.tsx builds the agreement markup client-side and its
 * "Download" button handed that straight to the browser as a .html file. A
 * signed contract saved as HTML opens as markup in most things people read
 * documents in, and it is the copy a party keeps — so it is the one that has to
 * be readable years later, on a machine that has never heard of this app.
 *
 * The browser cannot make the PDF itself: there is no PDF library in the
 * frontend bundle, and adding one to ship a document the server already knows
 * how to render would be two renderers to keep in step. So the markup comes
 * here and goes back as bytes, through the same renderer that produces the
 * emailed copy and the stored record — one implementation, one output.
 *
 * Behind requireAuth, and capped. Rendering is CPU work on the request thread,
 * and an open endpoint that does CPU work on a body you control is a way to
 * make a small App Service plan stop answering.
 */

const express = require("express");
const router = express.Router();

const { requireAuth } = require("../utils/auth");
const { agreementHtmlToPdf } = require("../services/agreementPdf.service");

/* Comfortably more than a long agreement with a full brief and a Schedule C —
   the largest this has produced is around 90 KB — and far below anything worth
   sending here. */
const MAX_HTML_BYTES = 2 * 1024 * 1024;

/**
 * POST /api/agreement/pdf
 * Body: { html, filename? }
 * → application/pdf
 */
router.post("/pdf", requireAuth, express.json({ limit: "4mb" }), async (req, res) => {
  try {
    const html = String(req.body?.html || "");
    if (!html.trim()) {
      return res.status(400).json({ success: false, error: "html_required" });
    }
    if (Buffer.byteLength(html, "utf8") > MAX_HTML_BYTES) {
      return res.status(413).json({ success: false, error: "html_too_large" });
    }

    /* Sanitised to a safe basename. The value reaches a Content-Disposition
       header, where a newline would let the caller write headers of their own
       and a slash would suggest a path. */
    const safeName =
      String(req.body?.filename || "Tokun-Agreement")
        .replace(/[^A-Za-z0-9._-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "Tokun-Agreement";
    const filename = safeName.toLowerCase().endsWith(".pdf") ? safeName : `${safeName}.pdf`;

    const pdf = await agreementHtmlToPdf(html, { title: filename.replace(/\.pdf$/i, "") });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdf.length);
    return res.end(pdf);
  } catch (err) {
    console.error("agreement pdf error:", err.message);
    return res.status(500).json({ success: false, error: "render_failed" });
  }
});

module.exports = router;
