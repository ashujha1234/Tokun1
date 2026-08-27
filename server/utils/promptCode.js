/**
 * The code half of a listing — what a seller may attach, and what a stranger is
 * allowed to see of it before paying.
 *
 * A coding prompt's deliverable is usually two things: the prompt text and the
 * code it produces. The prompt text already has a rule ("paid, never on a public
 * read, added back only when the listing is free" — see attachFreePromptText in
 * routes/promptRoutes.js). The code had none: it was accepted as an opaque file,
 * stored, and then never shown to anyone, buyer included.
 *
 * So this file draws the same line the prompt text has, in one place:
 *
 *   codeAssets   the product. Excluded from every public read
 *                (PUBLIC_PROMPT_EXCLUDED_FIELDS) and served only by
 *                GET /api/prompt/:id/code, which checks a purchase first.
 *   codeMeta     the shop window. Languages, file names, sizes, and a short
 *                head-of-file teaser. Public by design.
 *
 * The teaser is CUT HERE, on the server, and only the cut copy is ever written
 * to codeMeta. Sending the whole file down and blurring it in CSS would put the
 * paid content in the response body of an unauthenticated endpoint, one DevTools
 * pane away from anybody who wanted it — which is the same mistake as shipping
 * promptText to /public/:id.
 */

/* Ten is not a technical limit; it is the point past which "a code sample" has
   become "a repository", and a repository wants a .zip and a README rather than
   ten tabs in a viewer. */
const MAX_CODE_ASSETS = 10;

/* Per pasted snippet. Large enough for a real single-file module (a 100k file is
   roughly 2,500 lines of dense source) and small enough that ten of them cannot
   turn one Mongo document into a megabyte. */
const MAX_INLINE_CHARS = 100_000;

/* Per uploaded code file. Deliberately far below the 100MB attachment ceiling —
   an attachment is a 4K video, a code file is text or a modest archive, and a
   50MB "code file" is somebody uploading their node_modules. */
const MAX_CODE_FILE_MB = 10;
const MAX_CODE_FILE_BYTES = MAX_CODE_FILE_MB * 1024 * 1024;

/* How much of the first pasted snippet a non-buyer sees. Twelve lines is about
   one import block plus a signature — enough to judge the style, the language
   and whether it is real code, and not enough to be the product. */
const TEASER_LINES = 12;

/* And a ceiling per line, because a minified bundle is "one line" and would
   otherwise put the entire file in the teaser. */
const TEASER_LINE_CHARS = 240;

/**
 * The languages the picker offers.
 *
 * A closed list rather than free text: this value ends up as a CSS class on the
 * viewer and as a filter facet later, and "JS" / "js" / "Javascript" / "node"
 * are four spellings of one thing. `label` is what the seller picks, `id` is
 * what is stored.
 */
const CODE_LANGUAGES = [
  { id: "javascript", label: "JavaScript", ext: ".js" },
  { id: "typescript", label: "TypeScript", ext: ".ts" },
  { id: "jsx", label: "React (JSX/TSX)", ext: ".tsx" },
  { id: "python", label: "Python", ext: ".py" },
  { id: "java", label: "Java", ext: ".java" },
  { id: "csharp", label: "C#", ext: ".cs" },
  { id: "cpp", label: "C / C++", ext: ".cpp" },
  { id: "go", label: "Go", ext: ".go" },
  { id: "rust", label: "Rust", ext: ".rs" },
  { id: "php", label: "PHP", ext: ".php" },
  { id: "ruby", label: "Ruby", ext: ".rb" },
  { id: "swift", label: "Swift", ext: ".swift" },
  { id: "kotlin", label: "Kotlin", ext: ".kt" },
  { id: "sql", label: "SQL", ext: ".sql" },
  { id: "bash", label: "Shell / Bash", ext: ".sh" },
  { id: "html", label: "HTML", ext: ".html" },
  { id: "css", label: "CSS / SCSS", ext: ".css" },
  { id: "json", label: "JSON", ext: ".json" },
  { id: "yaml", label: "YAML", ext: ".yaml" },
  { id: "markdown", label: "Markdown", ext: ".md" },
  { id: "other", label: "Other", ext: ".txt" },
];

const LANGUAGE_IDS = new Set(CODE_LANGUAGES.map((l) => l.id));
const LANGUAGE_LABELS = new Map(CODE_LANGUAGES.map((l) => [l.id, l.label]));

/**
 * Extensions accepted as an uploaded code FILE.
 *
 * A whitelist and not a blocklist. The code container is public-read (see
 * utils/uploadToAzure.js), so anything accepted here becomes a file this
 * platform hosts and serves on its own domain — an unrestricted picker turns the
 * marketplace into a file host for whatever anybody wants to distribute, and the
 * one category of file nobody needs to attach to a prompt is an executable.
 */
const CODE_FILE_EXTENSIONS = new Set([
  ".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".vue", ".svelte",
  ".py", ".ipynb", ".rb", ".go", ".rs", ".java", ".kt", ".kts", ".swift",
  ".c", ".h", ".cc", ".cpp", ".hpp", ".cs", ".php", ".scala", ".dart",
  ".sh", ".bash", ".zsh", ".ps1", ".sql", ".r", ".m", ".pl", ".lua",
  ".html", ".htm", ".css", ".scss", ".sass", ".less",
  ".json", ".yaml", ".yml", ".toml", ".xml", ".env.example",
  ".md", ".txt", ".csv", ".ipynb", ".sol", ".tf", ".dockerfile",
  ".zip", ".tar", ".gz", ".tgz",
]);

/** Lowercased extension including the dot, or "" for an extensionless name. */
function extensionOf(filename) {
  const name = String(filename || "");
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return "";
  return name.slice(dot).toLowerCase();
}

/**
 * Is this an acceptable code file?
 *
 * Extensionless names are allowed through by name rather than by extension —
 * `Dockerfile`, `Makefile` and `Procfile` are real files a seller would attach
 * and none of them has a suffix to check.
 */
const EXTENSIONLESS_ALLOWED = new Set(["dockerfile", "makefile", "procfile", "rakefile", "gemfile"]);

function isAllowedCodeFile(filename) {
  const ext = extensionOf(filename);
  if (!ext) return EXTENSIONLESS_ALLOWED.has(String(filename || "").toLowerCase());
  return CODE_FILE_EXTENSIONS.has(ext);
}

/**
 * Guess a language id from a filename, for uploaded files where the seller
 * never picked one. Best-effort and cosmetic — it only decides which word sits
 * on the tab and which highlighter runs.
 */
const EXT_TO_LANGUAGE = {
  ".js": "javascript", ".mjs": "javascript", ".cjs": "javascript",
  ".jsx": "jsx", ".tsx": "jsx",
  ".ts": "typescript",
  ".py": "python", ".ipynb": "python",
  ".java": "java", ".kt": "kotlin", ".kts": "kotlin",
  ".cs": "csharp",
  ".c": "cpp", ".h": "cpp", ".cc": "cpp", ".cpp": "cpp", ".hpp": "cpp",
  ".go": "go", ".rs": "rust", ".php": "php", ".rb": "ruby", ".swift": "swift",
  ".sql": "sql",
  ".sh": "bash", ".bash": "bash", ".zsh": "bash",
  ".html": "html", ".htm": "html",
  ".css": "css", ".scss": "css", ".sass": "css", ".less": "css",
  ".json": "json", ".yaml": "yaml", ".yml": "yaml",
  ".md": "markdown",
};

function languageFromFilename(filename) {
  return EXT_TO_LANGUAGE[extensionOf(filename)] || "other";
}

/** The stored id, or "other" for anything unrecognised. Never throws. */
function normalizeLanguage(value) {
  const id = String(value || "").trim().toLowerCase();
  return LANGUAGE_IDS.has(id) ? id : "other";
}

/**
 * Only http(s), and only an absolute URL.
 *
 * A repo link is rendered as an anchor on a page other people open, so a
 * `javascript:` or `data:` value here is a stored XSS vector handed to every
 * visitor of the listing. Rejecting the scheme is the whole check — where the
 * link points is the buyer's problem, what it *does* when clicked is ours.
 */
function isSafeHttpUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validates the inline and link entries the seller typed, and returns them in
 * storage shape.
 *
 * `raw` is whatever came out of `JSON.parse` on a multipart text field, so it is
 * assumed to be hostile: every branch below is reachable by a hand-written
 * request even though the modal cannot produce it.
 *
 * Returns `{ assets }` or `{ error, message }` — the second is sent back
 * verbatim as a 400, so `message` is written for the seller, not the log.
 */
function normalizeAuthoredCodeAssets(raw) {
  if (raw === undefined || raw === null || raw === "") return { assets: [] };

  let parsed = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { error: "invalid_code_assets", message: "Couldn't read the code you attached. Please try again." };
    }
  }

  if (!Array.isArray(parsed)) {
    return { error: "invalid_code_assets", message: "Couldn't read the code you attached. Please try again." };
  }

  if (parsed.length > MAX_CODE_ASSETS) {
    return {
      error: "too_many_code_assets",
      message: `You can attach at most ${MAX_CODE_ASSETS} code items to one product.`,
    };
  }

  const assets = [];

  for (const entry of parsed) {
    if (!entry || typeof entry !== "object") continue;
    const kind = String(entry.kind || "").trim();

    if (kind === "inline") {
      /* Trailing whitespace only, and only at the end. Leading indentation is
         part of a pasted snippet — trimming both ends would silently dedent the
         first line of anything copied out of a nested block. */
      const content = String(entry.content ?? "").replace(/\s+$/, "");

      // An empty row is the modal's own "add another" placeholder that the
      // seller never filled in. Dropping it is friendlier than refusing the
      // whole upload over a blank box they had already stopped looking at.
      if (!content) continue;

      if (content.length > MAX_INLINE_CHARS) {
        return {
          error: "code_too_long",
          message: `One of your snippets is too long (${Math.round(content.length / 1000)}k characters). Upload it as a file instead — the limit for pasted code is ${MAX_INLINE_CHARS / 1000}k.`,
        };
      }

      const language = normalizeLanguage(entry.language);
      assets.push({
        kind: "inline",
        language,
        // Falls back to a generated name so every tab in the viewer has a
        // label — "snippet.py" beats an unnamed tab.
        filename: String(entry.filename || "").trim() ||
          `snippet${(CODE_LANGUAGES.find((l) => l.id === language) || {}).ext || ".txt"}`,
        content,
        url: "",
        mimetype: "text/plain",
        size: Buffer.byteLength(content, "utf8"),
      });
      continue;
    }

    if (kind === "link") {
      const url = String(entry.url || "").trim();
      if (!url) continue;

      if (!isSafeHttpUrl(url)) {
        return {
          error: "invalid_code_link",
          message: "Repository links must be full http:// or https:// URLs.",
        };
      }

      assets.push({
        kind: "link",
        language: normalizeLanguage(entry.language),
        filename: String(entry.filename || "").trim() || "Repository",
        content: "",
        url,
        mimetype: "text/uri-list",
        size: 0,
      });
      continue;
    }

    // "file" entries are built from req.files on the server, never from the
    // body — accepting one here would let a caller point a listing's paid
    // download at any URL they liked.
  }

  return { assets };
}

/**
 * The public summary of a set of code assets.
 *
 * Everything a card badge or a locked panel needs, and nothing a buyer paid for.
 * The teaser comes from the first INLINE asset only: a file's bytes are not read
 * back to excerpt them (that would mean downloading every upload to build a
 * preview), and a link has nothing to excerpt at all — those two show a file
 * list instead, which is the honest description of what is on offer.
 */
function buildCodeMeta(assets) {
  const list = Array.isArray(assets) ? assets : [];

  if (!list.length) {
    return {
      hasCode: false,
      languages: [],
      inlineCount: 0,
      fileCount: 0,
      linkCount: 0,
      totalLines: 0,
      preview: "",
      previewLanguage: "",
      previewTruncated: false,
      files: [],
    };
  }

  const inline = list.filter((a) => a.kind === "inline");
  const first = inline[0];

  let preview = "";
  let previewTruncated = false;

  if (first) {
    const lines = String(first.content || "").split("\n");
    preview = lines
      .slice(0, TEASER_LINES)
      .map((l) => (l.length > TEASER_LINE_CHARS ? `${l.slice(0, TEASER_LINE_CHARS)}…` : l))
      .join("\n");
    previewTruncated = lines.length > TEASER_LINES;
  }

  return {
    hasCode: true,
    // Deduped and ordered as the seller attached them, so the badge row reads
    // "Python · SQL" rather than repeating one language per file.
    languages: [...new Set(list.map((a) => a.language).filter((l) => l && l !== "other"))],
    inlineCount: inline.length,
    fileCount: list.filter((a) => a.kind === "file").length,
    linkCount: list.filter((a) => a.kind === "link").length,
    totalLines: inline.reduce((n, a) => n + String(a.content || "").split("\n").length, 0),
    preview,
    previewLanguage: first ? first.language : "",
    previewTruncated,
    /* Names and sizes only. A buyer deciding whether to pay wants to know they
       are getting `scraper.py` and `requirements.txt` rather than "2 files", and
       neither field is the content. `url` is deliberately absent — that is the
       download, and it lives behind GET /:id/code. */
    files: list.map((a) => ({
      kind: a.kind,
      filename: a.filename,
      language: a.language,
      size: a.size || 0,
    })),
  };
}

/** Human label for a stored language id — "javascript" → "JavaScript". */
const languageLabel = (id) => LANGUAGE_LABELS.get(id) || "Code";

module.exports = {
  MAX_CODE_ASSETS,
  MAX_INLINE_CHARS,
  MAX_CODE_FILE_MB,
  MAX_CODE_FILE_BYTES,
  TEASER_LINES,
  CODE_LANGUAGES,
  CODE_FILE_EXTENSIONS,
  extensionOf,
  isAllowedCodeFile,
  languageFromFilename,
  normalizeLanguage,
  isSafeHttpUrl,
  normalizeAuthoredCodeAssets,
  buildCodeMeta,
  languageLabel,
};
