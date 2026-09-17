/**
 * Renders a stored agreement's HTML into a PDF.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * The signed agreement is generated as HTML by frontend/src/components/
 * NdaCard.tsx, uploaded as a text/html file, and was attached to the
 * engagement-funded email as `Tokun-Agreement-<who>-<id>.html`.
 *
 * Gmail does not render an HTML attachment — for good reason, since it would be
 * running someone else's markup inside the mail client — so it shows the file's
 * SOURCE instead. The recipient opens their signed contract and gets a wall of
 * `<div class="clause"><h3>15. …`. Every party on every funded engagement has
 * been sent their agreement in that state.
 *
 * ── Why not a real HTML engine ──────────────────────────────────────────────
 *
 * There isn't one available and adding one is not free: Puppeteer means
 * bundling Chromium, which is a few hundred megabytes and a process launch per
 * render on an App Service plan sized for a Node API. The dependencies present
 * are pdf-lib (draws primitives) and pdf-parse (reads).
 *
 * That trade is only worth making for arbitrary HTML. This HTML is not
 * arbitrary — we generate it ourselves, from one function, using about a dozen
 * tags. So this renders exactly that vocabulary and nothing else:
 *
 *     h1 h2            the TOKUN wordmark and document title
 *     div.sec          section band ("Schedule B — Commercial Terms")
 *     h3               clause heading ("15. How the money is held")
 *     p td             body text
 *     li               bulleted
 *     div.k / div.v    the key/value cells the row() helper emits
 *     b strong i em    inline weight and slant
 *
 * Anything else is unwrapped to its text. If NdaCard starts emitting a tag that
 * carries meaning, add it to BLOCKS below — the failure mode is a paragraph
 * that loses its styling, not a broken file.
 *
 * ── The HTML remains the record ─────────────────────────────────────────────
 *
 * utils/ndaRecord.js stores a SHA-256 of the uploaded file, so the HTML is the
 * artifact a signature is provable against. This PDF is a readable copy made
 * for the email; it is deliberately NOT written back over the stored blob, and
 * the hash still describes what was actually signed.
 */

const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

/* A4 in points, with margins wide enough that a clause doesn't read as a wall. */
const PAGE = { w: 595.28, h: 841.89 };
const MARGIN = { top: 56, bottom: 56, left: 54, right: 54 };
const CONTENT_W = PAGE.w - MARGIN.left - MARGIN.right;

/* ── The palette, taken from the stylesheet the page uses ───────────────────
 *
 * The agreement has a look on the website — a white sheet, a purple wordmark,
 * purple uppercase section bands, tinted boxes around the brief and the grids.
 * Rendering it as plain black text produced a document that was correct and
 * unrecognisable: a party who signed it on screen and then opened the PDF could
 * reasonably wonder whether it was the same agreement.
 *
 * These are the exact values from .sheet/.sec/.quote/.grid in NdaCard.tsx. A
 * PDF drawn with primitives will never be the page, but it can be the same
 * document — same colours, same bands, same boxes, same order. */
const hex = (h) =>
  rgb(
    parseInt(h.slice(1, 3), 16) / 255,
    parseInt(h.slice(3, 5), 16) / 255,
    parseInt(h.slice(5, 7), 16) / 255
  );

const INK = hex("#14121b"); // .cell .v — body and values
const MUTED = hex("#8b8794"); // .cell .k, .tag, .note — labels and fine print
const SOFT = hex("#6b6675"); // .subtitle, .sig .line
const BRAND = hex("#7c3aed"); // .brand h1, .sec — the purple
const RULE = hex("#ece9f3"); // .sec bottom border, .grid border
const BOX_BG = hex("#faf9fc"); // .grid, .quote background
const BOX_BAR = hex("#d9d0f5"); // .quote left bar

/* size / leading / space above / colour, per block kind. */
const STYLE = {
  // .brand h1 — the wordmark, purple and letter-spaced.
  title: { size: 20, lead: 26, above: 0, bold: true, color: BRAND, center: true, track: 3 },
  // .doc-title — centred, and .tag/.subtitle under it.
  docTitle: { size: 15, lead: 21, above: 10, bold: true, center: true },
  subtitle: { size: 8.5, lead: 13, above: 4, color: MUTED, center: true, caps: true, track: 1.6 },
  // .sec — small, uppercase, purple, with a hairline under it.
  section: { size: 8.5, lead: 13, above: 22, bold: true, color: BRAND, caps: true, track: 1.6, rule: true },
  heading: { size: 10.5, lead: 15, above: 13, bold: true },
  body: { size: 9.5, lead: 14, above: 6 },
  bullet: { size: 9.5, lead: 14, above: 4, indent: 14 },
  // .cell .k / .lbl — tiny uppercase grey labels.
  key: { size: 7.5, lead: 11, above: 9, color: MUTED, caps: true, track: 1.1 },
  // .cell .v — the value, semibold and dark.
  value: { size: 9.5, lead: 13, above: 1, bold: true },
  // .quote — the brief, in a tinted box with a purple bar down its left edge.
  quote: { size: 9.5, lead: 14, above: 6, box: true, indent: 12 },
  // .note / .disclaimer — the small print at the end.
  note: { size: 8, lead: 12, above: 8, color: MUTED },
  // A step heading, carrying its number as a prefix.
  stepLabel: { size: 10, lead: 14, above: 11, bold: true },
  // .dot never becomes a line of its own — see pendingPrefix in the draw loop.
  stepnum: { size: 10, lead: 0, above: 0 },
  /* .sig — drawn by hand in the loop rather than flowed as text, so only the
     gap above it is read from here. */
  sigpanel: { size: 9.5, lead: 14, above: 26 },
};

/* ── The signature block ────────────────────────────────────────────────────
 *
 * .sig is the one part of the agreement that is NOT a run of text, and it was
 * the one part that did not survive this renderer.
 *
 * Two things were wrong. The signature itself is an <img> holding a data URI
 * drawn on the signing canvas, and the scan below only ever collected TEXT — so
 * a tag carrying no text contributed nothing and the signature silently
 * vanished. What arrived was the names, the emails and "Signed 4 Sep 2026" in a
 * single stacked column: a contract that says it was signed and shows no
 * signature, which is the one thing a party opens it to check.
 *
 * And .sig is a two-column grid. Flowed as ordinary blocks, the Client's name,
 * email and date ran straight into the Creator's with nothing between them, so
 * even the text that did arrive did not read as two parties.
 *
 * So the block is lifted out before the scan, parsed into its two columns, and
 * drawn to the same shape the page uses: name, email, the signature above a
 * rule, then the date and the party's role under it. A marker is left in its
 * place so it still renders where it belongs in the document.
 */

/** Gap between the two signature columns, and the height reserved for the
    signature itself between the email and the rule it sits on. */
const SIG_GAP = 26;
const SIG_AREA_H = 46;

/** Index of the `</div>` closing the div whose BODY starts at `from`, or -1. */
function matchingDivEnd(s, from) {
  const re = /<div\b[^>]*>|<\/div\s*>/gi;
  re.lastIndex = from;
  let depth = 0;
  let m;
  while ((m = re.exec(s))) {
    if (m[0][1] === "/") {
      if (depth === 0) return m.index;
      depth -= 1;
    } else depth += 1;
  }
  return -1;
}

/** The immediate <div> children of a fragment, as their inner HTML. */
function topLevelDivs(inner) {
  const out = [];
  const re = /<div\b[^>]*>/gi;
  let m;
  while ((m = re.exec(inner))) {
    const bodyStart = m.index + m[0].length;
    const end = matchingDivEnd(inner, bodyStart);
    if (end < 0) break;
    out.push(inner.slice(bodyStart, end));
    re.lastIndex = end;
  }
  return out;
}

const stripTags = (h) => decodeEntities(String(h || "").replace(/<[^>]+>/g, " "))
  .replace(/\s+/g, " ")
  .trim();

/* Inner HTML of the first div/span carrying `cls`.
 *
 * The closing tag is matched by BACKREFERENCE to the opening one, and that is
 * the whole trick: .line is a <div> containing a <span class="role">, so a
 * pattern ending in `</(?:div|span)>` stopped at the span's close and returned
 * a fragment with the role's opening tag but not its closing one. The role then
 * could not be found inside it, and the date line came out as
 * "Signed 4 Sep 2026 - Receiving Party" in one undifferentiated run. */
const innerOfClass = (html, cls) => {
  const re = new RegExp(
    `<(div|span)\\s[^>]*class="[^"]*\\b${cls}\\b[^"]*"[^>]*>([\\s\\S]*?)<\\/\\1\\s*>`,
    "i"
  );
  return (String(html).match(re) || [])[2] || "";
};

/**
 * Lifts <div class="sig"> out of the document.
 *
 * @returns {{ html: string, panels: Array<{name,email,sig,when,role}> }}
 *          `html` with the block swapped for a marker, and one entry per party
 *          in the order the page lays them out (Client first).
 */
function extractSignaturePanels(html) {
  const s = String(html);
  const m = s.match(/<div\s[^>]*class="[^"]*\bsig\b[^"]*"[^>]*>/i);
  if (!m) return { html: s, panels: [] };

  const bodyStart = m.index + m[0].length;
  const end = matchingDivEnd(s, bodyStart);
  if (end < 0) return { html: s, panels: [] };

  const panels = topLevelDivs(s.slice(bodyStart, end)).map((col) => {
    const lineHtml = innerOfClass(col, "line");
    const roleHtml = innerOfClass(lineHtml, "role");
    return {
      name: stripTags(innerOfClass(col, "name")),
      email: stripTags(innerOfClass(col, "email")),
      // The drawn signature, as the data URI the canvas produced.
      sig: (col.match(/<img[^>]*\bsrc="(data:image\/[a-z+.-]+;base64,[^"]*)"/i) || [])[1] || "",
      when: stripTags(lineHtml.replace(roleHtml, "")).replace(/[\s•·-]+$/, "").trim(),
      role: stripTags(roleHtml).replace(/^[\s•·-]+/, "").trim(),
    };
  });

  const closeEnd = s.indexOf(">", end) + 1;
  const marked =
    s.slice(0, m.index) + '<div class="sigpanel">signatures</div>' + s.slice(closeEnd);

  return { html: marked, panels };
}

/* ── Text that a standard PDF font can actually draw ────────────────────────
 *
 * StandardFonts are WinAnsi-encoded and pdf-lib THROWS on a character outside
 * it — so one rupee sign in a price field would fail the whole render, and the
 * caller would lose the attachment rather than get an imperfect one.
 *
 * The agreement is full of exactly those characters: ₹ in every money field, an
 * em dash in most headings, curly quotes wherever someone typed a brief into
 * the box. Mapped to their ASCII equivalents rather than dropped, because a
 * price that reads "Rs 12,000.00" is right and one that reads "12,000.00" is a
 * different number to anyone reading it. */
const CHAR_MAP = {
  "₹": "Rs ", "—": " - ", "–": "-", "‘": "'", "’": "'",
  "“": '"', "”": '"', "…": "...", " ": " ", "•": "-",
  "→": "->", "✓": "yes", "✗": "no", "×": "x",
};

function toDrawable(str) {
  let out = String(str ?? "").replace(/[₹—–‘’“”… •→✓✗×]/g, (c) => CHAR_MAP[c]);
  /* Keep only what WinAnsi can actually encode.
   *
   * This was \x20-\xFF, which looks like the Latin-1 range and is not: it also
   * admits U+007F and the C1 block U+0080-U+009F, and pdf-lib THROWS on those —
   *
   *     WinAnsi cannot encode "" (0x0081)
   *
   * WinAnsi does define printable glyphs at byte values 0x80-0x9F, but they are
   * the typographic ones (euro, curly quotes, em dash), which in a JS string
   * are U+20AC, U+2018, U+2014 — mapped above. A character actually AT U+0081
   * is a control with no glyph anywhere, and nothing legible is lost by
   * dropping it.
   *
   * They get in through the brief. Text pasted out of Word or Google Docs
   * carries them routinely, so one client pasting their requirements made the
   * whole agreement unrenderable: the render threw, and the caller fell back to
   * attaching the HTML — which is exactly the ".html that opens as code" this
   * renderer exists to stop.
   *
   * Dropped rather than substituted: a stray "?" in a contract reads like a
   * redaction. */
  return out.replace(/[^\x09\x0A\x20-\x7E\xA0-\xFF]/g, "");
}

const ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  mdash: "—", ndash: "–", hellip: "…", rsquo: "’", lsquo: "‘",
  ldquo: "“", rdquo: "”", times: "×", middot: "·", bull: "•",
};

function decodeEntities(s) {
  return String(s)
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => (ENTITIES[name.toLowerCase()] ?? m));
}

/* Which tags start a block, and what kind of block it is. Order matters: the
   first pattern that matches an opening tag wins, so div.sec is tested before
   the bare div that everything else falls into. */
const BLOCKS = [
  { re: /^<h1\b/i, kind: "title" },
  { re: /^<h2\b/i, kind: "docTitle" },
  { re: /^<span\s[^>]*class="[^"]*\btag\b/i, kind: "subtitle" },
  { re: /^<[a-z]+\s[^>]*class="[^"]*\bsubtitle\b/i, kind: "subtitle" },
  { re: /^<[a-z]+\s[^>]*class="[^"]*\b(note|disclaimer)\b/i, kind: "note" },
  { re: /^<div\s[^>]*class="[^"]*\bsec\b/i, kind: "section" },
  { re: /^<h3\b/i, kind: "heading" },
  { re: /^<div\s[^>]*class="[^"]*\bk\b/i, kind: "key" },
  { re: /^<div\s[^>]*class="[^"]*\bv\b/i, kind: "value" },
  /* The brief sits in div.quote with a div.lbl caption above it, and the text
     is a direct child of the div rather than inside a <p>. */
  { re: /^<div\s[^>]*class="[^"]*\blbl\b/i, kind: "key" },
  { re: /^<div\s[^>]*class="[^"]*\bquote\b/i, kind: "quote" },
  /* The numbered steps in the welcome doc: <li> holds a .dot carrying the step
     number, then a .label and a .what beside it. Without these the <li> block
     swallowed the number and the step came out as "-1" on one line with
     "FundedYou are here" under it. */
  { re: /^<div\s[^>]*class="[^"]*\bdot\b/i, kind: "stepnum" },
  { re: /^<div\s[^>]*class="[^"]*\blabel\b/i, kind: "stepLabel" },
  { re: /^<div\s[^>]*class="[^"]*\bwhat\b/i, kind: "body" },
  /* The marker extractSignaturePanels() leaves behind. It has to be in this
     table so the panel keeps its place in the flow — the signatures belong
     above the disclaimer, where the page puts them, not appended at the end. */
  { re: /^<div\s[^>]*class="[^"]*\bsigpanel\b/i, kind: "sigpanel" },
  { re: /^<li\b/i, kind: "bullet" },
  { re: /^<(p|td|th)\b/i, kind: "body" },
];

/**
 * HTML → [{ kind, runs: [{ text, bold, italic }] }]
 *
 * A hand-rolled scan rather than a parser dependency. The input is machine-
 * generated and well-formed, and the only structure that matters here is "which
 * tag opened this run of text".
 */
function parseBlocks(html) {
  let s = String(html);
  // Everything before the body is styling and metadata.
  s = s.replace(/<head[\s\S]*?<\/head>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<br\s*\/?>/gi, "\n");

  const blocks = [];
  let current = null;
  let bold = 0;
  let italic = 0;

  const push = (text) => {
    if (!text) return;
    const clean = decodeEntities(text).replace(/[ \t]+/g, " ");

    /* Text arriving with no open block starts one.
     *
     * The original dropped it, and that quietly lost the single most important
     * paragraph in the document: the client's brief is a direct child of
     * <div class="quote">, not wrapped in a <p>, so it fell outside every
     * pattern in BLOCKS and never reached the page. The agreement rendered
     * perfectly and simply did not contain what the client asked for.
     *
     * Any tag this file has not been taught now degrades to a paragraph rather
     * than to nothing, which is the right direction for a contract: wrong
     * styling is a cosmetic problem, missing text is a legal one. */
    if (!current) {
      if (!clean.trim()) return;
      current = { kind: "body", runs: [] };
    }

    if (!clean.trim() && !current.runs.length) return;
    current.runs.push({ text: clean, bold: bold > 0, italic: italic > 0 });
  };

  const close = () => {
    if (current && current.runs.some((r) => r.text.trim())) blocks.push(current);
    current = null;
  };

  const tagRe = /<[^>]+>/g;
  let last = 0;
  let m;
  while ((m = tagRe.exec(s))) {
    push(s.slice(last, m.index));
    last = tagRe.lastIndex;

    const tag = m[0];
    const closing = /^<\//.test(tag);
    const name = (tag.match(/^<\/?\s*([a-z0-9]+)/i) || [])[1]?.toLowerCase();

    if (name === "b" || name === "strong") bold += closing ? -1 : 1;
    else if (name === "i" || name === "em") italic += closing ? -1 : 1;
    else if (!closing) {
      /* A chip rendered beside the text it annotates — .badge is "You are here"
         next to "Funded". Flowing them into one run produced "FundedYou are
         here": the markup relies on the box around the badge to separate them,
         and a PDF line has no boxes. */
      if (/class="[^"]*\bbadge\b/i.test(tag) && current && current.runs.some((r) => r.text.trim())) {
        current.runs.push({ text: " \u2014 ", bold: false, italic: false });
      }

      const hit = BLOCKS.find((b) => b.re.test(tag));
      if (hit) {
        close();
        current = { kind: hit.kind, runs: [] };
      }
    } else if (/^<\/(p|h1|h2|h3|li|td|th|div|span)/i.test(tag)) {
      close();
    }

    if (bold < 0) bold = 0;
    if (italic < 0) italic = 0;
  }
  push(s.slice(last));
  close();

  return blocks;
}

/**
 * How wide a run actually draws, tracking included.
 *
 * Drawing, wrapping and centring all have to agree on this, or a tracked line
 * centres off-axis and wraps in the wrong place.
 */
function runWidth(run, fonts, st) {
  const w = fonts.pick(run).widthOfTextAtSize(run.text, st.size);
  return st.track ? w + st.track * run.text.length : w;
}

/**
 * Greedy word wrap over styled runs. Returns lines of runs.
 *
 * Whitespace-faithful on purpose. The obvious version — split each run on " "
 * and put a space before every word after the first — inserts spaces that were
 * never in the source at every tag boundary, because a run break is not a word
 * break. `<i>begin</i>, and the Client` is two runs, the second starting at the
 * comma, and that version rendered it "begin , and the Client".
 *
 * So the text is tokenised into words and the actual gaps between them, and a
 * gap is only drawn where the source had one.
 */
function wrapRuns(runs, fonts, size, maxWidth, track = 0) {
  const widthOf = (text, run) =>
    fonts.pick(run).widthOfTextAtSize(text, size) + track * text.length;

  // Flatten to tokens that remember which run they came from. \n is a <br>
  // that survived the scan and forces a break.
  const tokens = [];
  for (const run of runs) {
    for (const piece of run.text.split(/(\n|\s+)/)) {
      if (piece === "") continue;
      if (piece === "\n") tokens.push({ kind: "break" });
      else if (/^\s+$/.test(piece)) tokens.push({ kind: "space", run });
      else tokens.push({ kind: "word", text: piece, run });
    }
  }

  const lines = [];
  let line = [];
  let width = 0;
  let pendingSpace = null;

  const flush = () => {
    lines.push(line);
    line = [];
    width = 0;
    pendingSpace = null; // a gap at a line break is not drawn
  };

  for (const t of tokens) {
    if (t.kind === "break") {
      flush();
      continue;
    }
    if (t.kind === "space") {
      if (line.length) pendingSpace = t.run;
      continue;
    }

    const gap = pendingSpace ? widthOf(" ", pendingSpace) : 0;
    const w = widthOf(t.text, t.run);

    if (line.length && width + gap + w > maxWidth) {
      flush();
      line.push({ ...t.run, text: t.text });
      width = w;
      continue;
    }

    if (pendingSpace) {
      line.push({ ...pendingSpace, text: " " });
      width += gap;
      pendingSpace = null;
    }
    line.push({ ...t.run, text: t.text });
    width += w;
  }
  if (line.length) lines.push(line);
  return lines;
}

/**
 * Wrap for the signature columns: on spaces, and INSIDE a token that cannot fit
 * on a line of its own.
 *
 * wrapRuns() only breaks at spaces, which is right for prose and wrong for the
 * one field here that routinely has none — an email address. A long one ran
 * straight out of its column and across the page margin, over the column beside
 * it. The stylesheet says `word-break:break-all` on .sig .email for exactly
 * this reason; this is that rule.
 */
function wrapHard(text, font, size, maxW) {
  const lines = [];
  let line = "";
  const flush = () => {
    if (line) lines.push(line);
    line = "";
  };

  for (const word of toDrawable(text || "").split(/\s+/).filter(Boolean)) {
    let rest = word;

    while (font.widthOfTextAtSize(rest, size) > maxW) {
      let cut = 1;
      while (cut < rest.length && font.widthOfTextAtSize(rest.slice(0, cut + 1), size) <= maxW) {
        cut += 1;
      }
      flush();
      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }

    const next = line ? `${line} ${rest}` : rest;
    if (font.widthOfTextAtSize(next, size) > maxW) {
      flush();
      line = rest;
    } else {
      line = next;
    }
  }

  flush();
  return lines;
}

/**
 * @param {string|Buffer} html   the stored agreement
 * @param {object} [opts]
 * @param {string} [opts.title]  PDF metadata title
 * @param {{client?: string, freelancer?: string}} [opts.signatures]
 *        Data URIs to fall back on for a party whose signature the stored
 *        markup does not carry. A signature already IN the document always
 *        wins — this only fills a box that was drawn empty, which happens
 *        when a copy was signed before the other party had signed at all.
 * @returns {Promise<Buffer>}
 */
async function agreementHtmlToPdf(html, { title = "Tokun Agreement", signatures = null } = {}) {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await doc.embedFont(StandardFonts.HelveticaOblique);
  const boldItalic = await doc.embedFont(StandardFonts.HelveticaBoldOblique);

  const fonts = {
    pick: (r) => (r.bold && r.italic ? boldItalic : r.bold ? boldFont : r.italic ? italicFont : regular),
  };

  doc.setTitle(title);
  doc.setProducer("Tokun.World");
  doc.setCreationDate(new Date());

  /* The signature grid, lifted out before the scan — see extractSignaturePanels. */
  const { html: flowHtml, panels } = extractSignaturePanels(html);

  /* A party who signed first has the other side's box empty in their stored
     copy, because it WAS empty when they signed it. The order record holds both
     signatures, so a caller that has it can pass them and the emailed copy
     shows the agreement as it stands now — fully executed, the same way the
     page shows it. Never overwrites a signature the document already carries. */
  if (signatures && panels.length) {
    const fallback = [signatures.client, signatures.freelancer];
    panels.forEach((panel, i) => {
      if (!panel.sig && typeof fallback[i] === "string" && fallback[i].startsWith("data:image/")) {
        panel.sig = fallback[i];
      }
    });
  }

  const blocks = parseBlocks(flowHtml);

  /* Nothing recognisable in the input is a FAILURE, not an empty document.
     Without this the renderer happily returns a 957-byte blank page and the
     caller, seeing no exception, attaches it — so a party's signed agreement
     arrives as one empty sheet. That is strictly worse than the HTML it
     replaced, because the HTML at least still contains the agreement.

     Throwing puts it through the caller's fallback instead (see
     services/engagementEmail.service.js), which sends the original file and
     logs why. */
  if (!blocks.length) {
    throw new Error("agreement markup produced no renderable content");
  }

  let page = doc.addPage([PAGE.w, PAGE.h]);
  let y = PAGE.h - MARGIN.top;

  const newPage = () => {
    page = doc.addPage([PAGE.w, PAGE.h]);
    y = PAGE.h - MARGIN.top;
  };

  /* The step number belongs to the heading that follows it, not to a line of
     its own — and the <li> around it must not also draw a bullet, or every step
     reads as "-1". */
  let pendingPrefix = "";

  /* Embeds one signature data URI. Returns null for anything it cannot read —
     a signature that fails to draw must cost the signature, never the
     agreement, so the box falls back to the empty rule below. */
  const embedSignature = async (dataUrl) => {
    try {
      const [, mime, b64] = String(dataUrl).match(/^data:(image\/[a-z+.-]+);base64,(.+)$/i) || [];
      if (!b64) return null;
      const bytes = Buffer.from(b64, "base64");
      if (!bytes.length) return null;
      return /jpe?g/i.test(mime) ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
    } catch (err) {
      console.error("agreementPdf: signature image skipped:", err.message);
      return null;
    }
  };

  /* The two-column signature grid, drawn to the shape .sig has on the page:
     name, email, the signature sitting ON the rule, then the date and the
     party's role under it. Both columns are measured together and drawn
     together, so the two sides line up whatever either one contains. */
  const drawSignaturePanels = async (list) => {
    const colW = (CONTENT_W - SIG_GAP) / 2;
    const columns = await Promise.all(
      list.slice(0, 2).map(async (panel) => ({
        ...panel,
        image: panel.sig ? await embedSignature(panel.sig) : null,
        nameLines: wrapHard(panel.name, boldFont, 10.5, colW),
        emailLines: wrapHard(panel.email, regular, 8, colW).slice(0, 2),
      }))
    );
    if (!columns.length) return;

    const nameRows = Math.max(1, ...columns.map((c) => c.nameLines.length));
    const emailRows = Math.max(0, ...columns.map((c) => c.emailLines.length));
    const height = nameRows * 14 + emailRows * 11 + SIG_AREA_H + 8 + 12;

    /* page-break-inside: avoid, as the stylesheet has it. A signature split
       across two sheets is the one break that makes a contract look altered. */
    if (y - height < MARGIN.bottom) newPage();

    const top = y;
    columns.forEach((col, i) => {
      const x = MARGIN.left + i * (colW + SIG_GAP);
      let cy = top;

      const drawLineOfText = (text, size, font, color) => {
        try {
          page.drawText(text, { x, y: cy, size, font, color });
        } catch (err) {
          /* Per-line, like the main loop is per-run: one unrenderable character
             in a name costs that line, not the panel. */
          console.error("agreementPdf: skipped a signature line:", err.message);
        }
      };

      col.nameLines.forEach((line) => {
        cy -= 14;
        drawLineOfText(line, 10.5, boldFont, INK);
      });
      cy -= (nameRows - col.nameLines.length) * 14;

      col.emailLines.forEach((line) => {
        cy -= 11;
        drawLineOfText(line, 8, regular, MUTED);
      });
      cy -= (emailRows - col.emailLines.length) * 11;

      const ruleY = cy - SIG_AREA_H;

      if (col.image) {
        /* Scaled to fit the box and drawn just above the rule, the way a
           signature sits on a printed line. */
        const scale = Math.min(colW / col.image.width, (SIG_AREA_H - 6) / col.image.height);
        page.drawImage(col.image, {
          x,
          y: ruleY + 3,
          width: col.image.width * scale,
          height: col.image.height * scale,
        });
      } else {
        /* Nobody has signed this side. A dashed line says "still to sign",
           where empty space over a solid rule reads as a signature that failed
           to print. */
        page.drawLine({
          start: { x, y: ruleY + 12 },
          end: { x: x + colW, y: ruleY + 12 },
          thickness: 0.8,
          color: RULE,
          dashArray: [3, 3],
        });
      }

      page.drawLine({
        start: { x, y: ruleY },
        end: { x: x + colW, y: ruleY },
        thickness: 0.8,
        color: INK,
      });

      const lineY = ruleY - 10;
      const when = toDrawable(col.when || "Signature / Date");
      try {
        page.drawText(when, { x, y: lineY, size: 8, font: regular, color: SOFT });
      } catch (err) {
        console.error("agreementPdf: skipped a signature date:", err.message);
      }

      if (col.role) {
        /* Uppercase and letter-spaced, as .role is — character by character,
           because pdf-lib has no tracking option. */
        let rx = x + regular.widthOfTextAtSize(when, 8) + 8;
        for (const ch of toDrawable(col.role).toUpperCase()) {
          try {
            page.drawText(ch, { x: rx, y: lineY, size: 6.5, font: regular, color: MUTED });
          } catch (err) {
            console.error("agreementPdf: skipped a role character:", err.message);
          }
          rx += regular.widthOfTextAtSize(ch, 6.5) + 1.1;
        }
      }
    });

    y = top - height;
  };

  for (const block of blocks) {
    const st = STYLE[block.kind] || STYLE.body;

    if (block.kind === "sigpanel") {
      if (panels.length) {
        y -= st.above;
        await drawSignaturePanels(panels);
      }
      continue;
    }

    if (block.kind === "stepnum") {
      const n = block.runs.map((r) => r.text).join("").trim();
      pendingPrefix = n ? `${n}. ` : "";
      continue;
    }
    const indent = st.indent || 0;

    if (pendingPrefix) {
      block.runs.unshift({ text: pendingPrefix, bold: true, italic: false });
      pendingPrefix = "";
    }

    let runs = block.runs.map((r) => ({
      ...r,
      text: toDrawable(r.text),
      bold: r.bold || !!st.bold,
      italic: r.italic,
    }));
    if (st.caps) runs = runs.map((r) => ({ ...r, text: r.text.toUpperCase() }));

    const lines = wrapRuns(runs, fonts, st.size, CONTENT_W - indent, st.track || 0);
    if (!lines.length) continue;

    y -= st.above;

    /* A section band that lands at the very bottom would be a heading with its
       clause on the next page. Kept with at least two lines of what follows. */
    const needed = st.lead * Math.min(lines.length, 2) + (st.above || 0);
    if (y - needed < MARGIN.bottom) newPage();

    /* .quote — a tinted panel with a purple bar down its left edge. Drawn
       before the text so it sits behind it, which means its height has to be
       known up front: that is why the lines are wrapped above rather than as
       they are drawn. */
    if (st.box) {
      const boxH = lines.length * st.lead + 14;
      const boxTop = y + 4;
      page.drawRectangle({
        x: MARGIN.left,
        y: boxTop - boxH,
        width: CONTENT_W,
        height: boxH,
        color: BOX_BG,
      });
      page.drawRectangle({
        x: MARGIN.left,
        y: boxTop - boxH,
        width: 2.5,
        height: boxH,
        color: BOX_BAR,
      });
      y -= 7;
    }

    lines.forEach((line, i) => {
      if (y - st.lead < MARGIN.bottom) newPage();
      y -= st.lead;

      /* .doc-title and .brand h1 are centred; everything else runs from the
         left margin. Measured per line, so a wrapped title centres each of its
         lines rather than the block. */
      const lineW = line.reduce((w, r) => w + runWidth(r, fonts, st), 0);
      let x = st.center
        ? MARGIN.left + Math.max(0, (CONTENT_W - lineW) / 2)
        : MARGIN.left + indent;

      /* Only the first line. Drawn on every line, a three-line bullet came out
         as three bullets, which reads as three obligations rather than one. */
      if (block.kind === "bullet" && i === 0) {
        page.drawText("-", { x: MARGIN.left, y, size: st.size, font: regular, color: st.color || INK });
      }
      for (const run of line) {
        if (!run.text) continue;
        const font = fonts.pick(run);
        /* Per-run guard. toDrawable() should have made every character
           encodable, but this is a legal document assembled from text other
           people typed, and the cost of being wrong once is that the entire
           agreement falls back to an .html attachment. Here the worst an
           unanticipated character can do is cost one word.

           The width is still advanced, so the rest of the line keeps its
           position instead of sliding left over the gap. */
        try {
          if (st.track) {
            /* Letter-spacing, the way .sec and .brand h1 use it. pdf-lib has no
               tracking option and there is no faking it inside one string:
               injecting a space between characters spaces them by a SPACE, and
               "PAYMENT-PROTECTED ENGAGEMENT" came out as an unreadable ladder.
               So the characters are placed individually, `track` POINTS apart. */
            let cx = x;
            for (const ch of run.text) {
              page.drawText(ch, { x: cx, y, size: st.size, font, color: st.color || INK });
              cx += font.widthOfTextAtSize(ch, st.size) + st.track;
            }
          } else {
            page.drawText(run.text, { x, y, size: st.size, font, color: st.color || INK });
          }
        } catch (err) {
          console.error("agreementPdf: skipped an unrenderable run:", err.message);
        }
        x += runWidth(run, fonts, st);
      }
    });

    /* .sec's border-bottom. Drawn after the text, under the last line, which is
       where the CSS puts it — above it the band reads as a separator belonging
       to the section before. */
    if (st.rule) {
      page.drawLine({
        start: { x: MARGIN.left, y: y - 5 },
        end: { x: PAGE.w - MARGIN.right, y: y - 5 },
        thickness: 0.7,
        color: RULE,
      });
      y -= 5;
    }

    if (st.box) y -= 7;
  }

  /* Page numbers last, once the count is known. An unpaginated contract is the
     one document where "is anything missing?" has no answer. */
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    const label = `Page ${i + 1} of ${pages.length}`;
    const size = 8;
    p.drawText(label, {
      x: PAGE.w - MARGIN.right - regular.widthOfTextAtSize(label, size),
      y: MARGIN.bottom - 24,
      size,
      font: regular,
      color: MUTED,
    });
  });

  return Buffer.from(await doc.save());
}

/**
 * Turns an uploaded agreement on disk into a PDF, in place.
 *
 * Called by both upload-nda routes BEFORE the file is hashed, which is the
 * whole point: utils/ndaRecord.js stores a SHA-256 of what was uploaded, so
 * whatever this returns is the artifact a signature is provable against. Do the
 * conversion after the hash and the record describes a file nobody keeps.
 *
 * A file that is already a PDF is passed straight through — a party who
 * uploaded their own signed copy must not have it re-rendered through a
 * renderer that only understands our markup.
 *
 * Never throws. If the conversion fails the original file is used exactly as
 * before: an agreement stored as HTML is a worse artifact than a PDF, but no
 * agreement at all fails the signature, and the signature is the thing with
 * legal weight.
 *
 * @returns {Promise<{path: string, originalName: string, converted: boolean}>}
 */
async function normaliseAgreementFileToPdf(tempPath, originalName = "agreement") {
  const fsp = require("fs/promises");
  const baseName = String(originalName).replace(/\.[^.]+$/, "") || "agreement";

  try {
    const buf = await fsp.readFile(tempPath);
    if (buf.slice(0, 5).toString("latin1") === "%PDF-") {
      return { path: tempPath, originalName: `${baseName}.pdf`, converted: false };
    }

    const pdf = await agreementHtmlToPdf(buf, { title: baseName });
    const pdfPath = `${tempPath}.pdf`;
    await fsp.writeFile(pdfPath, pdf);

    /* The original is now dead weight. uploadFileToBlob() only unlinks the path
       it is given, so without this the HTML copy stays in the temp directory
       until the instance recycles. Failure here is not worth surfacing. */
    await fsp.unlink(tempPath).catch(() => {});

    return { path: pdfPath, originalName: `${baseName}.pdf`, converted: true };
  } catch (err) {
    console.error("agreement PDF conversion failed, storing the upload as-is:", err.message);
    return { path: tempPath, originalName, converted: false };
  }
}

module.exports = { agreementHtmlToPdf, normaliseAgreementFileToPdf };
