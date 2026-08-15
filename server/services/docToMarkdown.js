"use strict";

/**
 * Document → Markdown conversion for SmartGen.
 *
 * Wraps @firecrawl/anydoc (Rust core, Node binding) which turns Office/PDF/
 * OpenDocument bytes into structure-preserving Markdown — real `##` headings,
 * `| pipe |` tables, bullet lists — instead of the flat text `pdf-parse` gives
 * us. That structure matters twice over: the user gets usable .md, and when the
 * text is handed to an LLM the model sees a document instead of a blob.
 */

const anydoc = require("@firecrawl/anydoc");

/* Extensions anydoc itself handles. Several are aliases it normalises
   internally (docm→docx, xls→xlsx, pps→ppt, …) — we just pass them through. */
const ANYDOC_EXTENSIONS = [
  "pdf",
  "doc", "docx", "docm", "odt", "rtf", "epub",
  "ppt", "pptx", "pptm", "pps", "ppsx", "ppsm", "pot", "odp",
  "xls", "xlsx", "xlsm", "xlsb", "ods",
  "csv",
];

/* Already text — anydoc refuses these (no format signature), and there is
   nothing to convert anyway, so we hand the bytes back as-is. */
const PLAIN_TEXT_EXTENSIONS = ["txt", "md", "markdown"];

const SUPPORTED_EXTENSIONS = [...ANYDOC_EXTENSIONS, ...PLAIN_TEXT_EXTENSIONS];

/** Value for a frontend `<input type="file" accept="…">`. */
const ACCEPT_ATTRIBUTE = SUPPORTED_EXTENSIONS.map((e) => `.${e}`).join(",");

const MAX_FILE_BYTES = 20 * 1024 * 1024;

class DocConversionError extends Error {
  constructor(code, message) {
    super(message || code);
    this.name = "DocConversionError";
    this.code = code;
  }
}

function extensionOf(filename) {
  const match = /\.([a-z0-9]+)$/i.exec(String(filename || "").trim());
  return match ? match[1].toLowerCase() : "";
}

/**
 * Resolve which parser to use.
 *
 * Byte sniffing comes first so a mislabeled file (a .docx someone renamed to
 * .pdf) still converts correctly. It falls back to the extension because CSV —
 * and plain text generally — has no magic bytes to sniff, so `formatFromBytes`
 * returns null for it and anydoc would otherwise reject the file outright.
 */
function resolveFormat(buffer, filename) {
  const ext = extensionOf(filename);
  if (PLAIN_TEXT_EXTENSIONS.includes(ext)) return { kind: "text", ext };

  let sniffed = null;
  try {
    sniffed = anydoc.formatFromBytes(buffer);
  } catch {
    sniffed = null;
  }
  const format = sniffed || anydoc.formatFromExtension(ext);
  if (!format) return { kind: "unsupported", ext };
  return { kind: "anydoc", ext, format };
}

/* anydoc reports an image-only PDF by refusing it rather than returning empty
   output. That is a genuinely different failure from a corrupt file — the user
   can act on it (re-export with text, or run it through OCR) — so it gets its
   own error code instead of being folded into a generic parse failure. */
function isOcrRequiredError(err) {
  const message = String(err?.message || "");
  return /OCR is required/i.test(message) || /ImageBased/i.test(message);
}

/**
 * Convert an uploaded document to Markdown.
 *
 * @param {Buffer} buffer   raw file bytes (multer memoryStorage)
 * @param {string} filename original filename, used for format fallback
 * @returns {Promise<{ markdown: string, format: string, charCount: number }>}
 * @throws {DocConversionError} unsupported_format | needs_ocr |
 *         could_not_read_document | empty_document
 */
async function convertToMarkdown(buffer, filename) {
  if (!buffer || !buffer.length) {
    throw new DocConversionError("empty_document", "The uploaded file is empty.");
  }

  const resolved = resolveFormat(buffer, filename);

  if (resolved.kind === "unsupported") {
    throw new DocConversionError(
      "unsupported_format",
      `.${resolved.ext || "?"} files aren't supported.`
    );
  }

  let markdown;

  if (resolved.kind === "text") {
    markdown = buffer.toString("utf8").replace(/\r\n?/g, "\n").trim();
  } else {
    try {
      markdown = String(await anydoc.toMarkdownBytes(buffer, resolved.format) || "").trim();
    } catch (err) {
      if (isOcrRequiredError(err)) {
        throw new DocConversionError(
          "needs_ocr",
          "This document has no selectable text — it looks like scanned images."
        );
      }
      /* The extension lied and the bytes are really just text (a .txt renamed
         .pdf, an export with the wrong suffix). Byte sniffing can't catch this
         one — plain text has no signature to sniff — so anydoc telling us so is
         the first reliable signal. Take it and pass the text through. */
      if (/plain text/i.test(String(err?.message || ""))) {
        markdown = buffer.toString("utf8").replace(/\r\n?/g, "\n").trim();
        resolved.format = "txt";
      } else {
        console.error("[docToMarkdown] conversion failed:", err?.message || err);
        throw new DocConversionError(
          "could_not_read_document",
          "This file couldn't be read — it may be corrupted or password-protected."
        );
      }
    }
  }

  if (!markdown || markdown.length < 10) {
    throw new DocConversionError(
      "empty_document",
      "No readable content was found in this document."
    );
  }

  return {
    markdown,
    format: resolved.kind === "text" ? resolved.ext : resolved.format,
    charCount: markdown.length,
  };
}

module.exports = {
  convertToMarkdown,
  DocConversionError,
  SUPPORTED_EXTENSIONS,
  ACCEPT_ATTRIBUTE,
  MAX_FILE_BYTES,
  extensionOf,
};
