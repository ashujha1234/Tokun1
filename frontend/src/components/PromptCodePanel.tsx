/**
 * The code half of a listing, on the details panel.
 *
 * Two states, and which one you get is decided by the server, not by this file:
 *
 *   LOCKED   `code` — the public summary from Prompt.codeMeta. File names,
 *            languages, sizes and a teaser that was already cut to twelve lines
 *            before it left the server. There is nothing here to un-blur.
 *   UNLOCKED `owned` is true, so it asks GET /api/prompt/:id/code, which checks
 *            for a purchase and answers 403 if there isn't one.
 *
 * That split is the whole point. Sending the full source down and hiding it in
 * CSS would put paid content in the response body of an unauthenticated
 * endpoint — the same mistake as shipping promptText to /public/:id, one
 * DevTools pane away from anybody who wanted it.
 *
 * No syntax highlighter. Adding one means a dependency and a language grammar
 * per listing for what is, on a details panel, a colour scheme — monospace with
 * line numbers reads perfectly well and the buyer pastes it into their own
 * editor within the minute anyway.
 */

import { useEffect, useState } from "react";
import { Code2, FileCode, Link2, Lock, Copy, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

/** The public summary — Prompt.codeMeta, as it arrives on any listing payload. */
export type PromptCodeMeta = {
  hasCode?: boolean;
  languages?: string[];
  inlineCount?: number;
  fileCount?: number;
  linkCount?: number;
  totalLines?: number;
  preview?: string;
  previewLanguage?: string;
  previewTruncated?: boolean;
  files?: { kind: string; filename: string; language: string; size: number }[];
};

/** One unlocked asset, as GET /:id/code returns it. */
type CodeAsset = {
  kind: "inline" | "file" | "link";
  language: string;
  filename: string;
  content: string;
  url: string;
  mimetype: string;
  size: number;
};

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  jsx: "React",
  python: "Python",
  java: "Java",
  csharp: "C#",
  cpp: "C/C++",
  go: "Go",
  rust: "Rust",
  php: "PHP",
  ruby: "Ruby",
  swift: "Swift",
  kotlin: "Kotlin",
  sql: "SQL",
  bash: "Shell",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  yaml: "YAML",
  markdown: "Markdown",
};

/**
 * Stored language id → the word a human reads. "javascript" → "JavaScript".
 *
 * Exported because the marketplace cards label their "code included" chip with
 * it too, and two spellings of the same language across the card and the panel
 * would read as two different things.
 */
export const codeLanguageLabel = (id?: string) => (id ? LANGUAGE_LABELS[id] || "Code" : "Code");

const label = codeLanguageLabel;

const formatSize = (bytes: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Source in a fixed-height, scrolling box with a gutter.
 *
 * `whitespace-pre` and not `pre-wrap`: wrapping source silently re-indents it,
 * and a line that wraps no longer lines up with its number in the gutter — so a
 * long line scrolls sideways instead, the way an editor does it.
 */
function CodeBlock({ content, faded = false }: { content: string; faded?: boolean }) {
  const lines = content.split("\n");

  return (
    <div className="relative">
      <div className="max-h-[320px] overflow-auto rounded-[10px] border border-white/10 bg-[#0F1013]">
        <table className="w-full border-collapse font-mono text-[12.5px] leading-[1.65]">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                {/* select-none so dragging across the block copies the code and
                    not "1 2 3 4" down the left edge of it. */}
                <td className="w-[1%] select-none whitespace-nowrap border-r border-white/[0.06] px-2.5 text-right align-top text-white/25">
                  {i + 1}
                </td>
                <td className="whitespace-pre px-3 align-top text-white/80">{line || " "}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cosmetic only — the content below this gradient does not exist in the
          payload. It says "there is more" without implying it is being hidden
          from you client-side. */}
      {faded && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-[10px] bg-gradient-to-t from-[#0F1013] to-transparent" />
      )}
    </div>
  );
}

/**
 * The refund terms for a code product, said in the two places they matter.
 *
 * WHY IT IS WORDED THIS WAY. The obvious rule — "refundable only if you haven't
 * opened it" — is self-contradictory: reading the code is the only way to judge
 * whether it is worth keeping, so that rule refuses refunds to precisely the
 * buyer with the strongest case, the one who opened the file and found it
 * broken. The line that actually works is read vs take: you can read what you
 * bought, and taking a copy is what moves the decision to a human.
 *
 * Shown BEFORE the Copy and Download buttons, not after. Terms a buyer discovers
 * once they have already pressed the button are not terms, they are an excuse.
 */
function RefundNote({ owned }: { owned: boolean }) {
  return (
    <p className="mt-2 text-[11px] leading-relaxed text-white/40">
      {owned
        ? "You can read this code as much as you like. Downloading or copying it sends any refund request to manual review."
        : "After buying, you can read the code freely. Downloading or copying it sends any refund request to manual review."}
    </p>
  );
}

export default function PromptCodePanel({
  promptId,
  code,
  owned = false,
  isFree = false,
}: {
  promptId: string;
  code?: PromptCodeMeta | null;
  /** Bought it, uploaded it, or your org shared it — anything that unlocks. */
  owned?: boolean;
  /** Nothing was paid, so there is no refund to have terms about. */
  isFree?: boolean;
}) {
  const { toast } = useToast();

  const [assets, setAssets] = useState<CodeAsset[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(0);

  const hasCode = !!code?.hasCode;

  /* Only asked for once the panel knows the caller owns it. An unowned listing
     never makes this request — a 403 per listing view would be noise in the
     server log and a wasted round trip, and the locked state is already fully
     rendered from `code`. */
  useEffect(() => {
    if (!owned || !hasCode || !promptId) return;

    let cancelled = false;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/prompt/${encodeURIComponent(promptId)}/code`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (!res.ok || !data?.success) {
          setError(data?.message || "Couldn't load the code for this product.");
          return;
        }
        setAssets(data.codeAssets || []);
        setActive(0);
      } catch {
        if (!cancelled) setError("Couldn't reach the server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [owned, hasCode, promptId]);

  // Nothing attached — render nothing at all rather than an empty "Code" heading
  // on the many listings that are prompt-only.
  if (!hasCode) return null;

  /* Tells the server the buyer took a copy — see POST /:id/code/access.
   *
   * The server cannot see this happen: a snippet is copied out of the DOM with
   * no request at all, and a file downloads straight from its blob URL. So it is
   * reported, and reported AFTER the fact — nothing here is awaited and a
   * failure is swallowed, because a bookkeeping call must never be the reason a
   * buyer can't copy code they paid for.
   *
   * Skipped for a seller looking at their own listing. `owned` covers both, and
   * an uploader has no purchase to record against anyway (recordCodeAccess
   * no-ops), but not firing the request at all keeps the seller's own preview
   * silent. */
  const reportTake = (action: "copied" | "downloaded") => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    fetch(`${API_BASE}/api/prompt/${encodeURIComponent(promptId)}/code/access`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ action }),
      /* Survives the page being closed by the download that triggered it — a
         plain fetch is cancelled on unload and the report would be lost exactly
         when it matters. */
      keepalive: true,
    }).catch(() => {});
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      reportTake("copied");
      toast({ title: "Copied", description: "Code copied to clipboard." });
    } catch {
      // No report on a failure: nothing reached the clipboard, so nothing was
      // taken.
      toast({ title: "Copy failed", description: "Your browser blocked clipboard access." });
    }
  };

  /* Built and revoked per click rather than held as state: a blob URL pins its
     contents in memory for as long as it exists, and a buyer who never presses
     Download shouldn't pay for a second copy of every file they own. */
  const downloadInline = (asset: CodeAsset) => {
    const url = URL.createObjectURL(new Blob([asset.content], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = asset.filename || "code.txt";
    a.click();
    URL.revokeObjectURL(url);
    reportTake("downloaded");
  };

  const header = (
    <div className="mb-2.5 flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-wide text-white/50">
        <Code2 className="h-3.5 w-3.5" />
        {owned ? "CODE INCLUDED" : "CODE PREVIEW"}
      </span>
      <span className="text-[11px] text-white/40">
        {[
          code?.languages?.length ? code.languages.map(label).join(" · ") : null,
          code?.files?.length === 1 ? "1 file" : `${code?.files?.length || 0} files`,
        ]
          .filter(Boolean)
          .join("  ·  ")}
      </span>
    </div>
  );

  /* ── UNLOCKED ─────────────────────────────────────────────────────────── */
  if (owned) {
    const current = assets?.[active];

    return (
      <div className="mt-6 rounded-[12px] border border-white/10 bg-[#1C1C1E] p-4">
        {header}

        {loading && <p className="text-[13px] text-white/50">Loading code…</p>}

        {error && (
          <p className="rounded-[8px] border border-red-500/20 bg-red-500/[0.07] px-3 py-2 text-[13px] text-red-300">
            {error}
          </p>
        )}

        {!loading && !error && assets && assets.length > 0 && (
          <>
            {/* Tabs only once there is something to switch between — a single
                file gets its name printed in the toolbar below instead. */}
            {assets.length > 1 && (
              <div className="mb-2.5 flex gap-1.5 overflow-x-auto no-scrollbar">
                {assets.map((a, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`shrink-0 rounded-[7px] px-2.5 py-1.5 text-[12px] transition-colors ${
                      i === active
                        ? "bg-white/[0.12] text-white"
                        : "bg-white/[0.04] text-white/55 hover:text-white/80"
                    }`}
                  >
                    {a.filename || `${label(a.language)} ${i + 1}`}
                  </button>
                ))}
              </div>
            )}

            {current && (
              <>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="truncate text-[12px] text-white/45">
                    {current.filename}
                    {current.size ? ` · ${formatSize(current.size)}` : ""}
                  </span>

                  <div className="flex shrink-0 gap-2">
                    {current.kind === "inline" && (
                      <>
                        <button
                          type="button"
                          onClick={() => copy(current.content)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-white/10 bg-[#242427] px-2.5 text-[12px] text-white/80 transition-colors hover:bg-[#2E2E32] hover:text-white"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadInline(current)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-white/10 bg-[#242427] px-2.5 text-[12px] text-white/80 transition-colors hover:bg-[#2E2E32] hover:text-white"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </button>
                      </>
                    )}

                    {current.kind === "file" && (
                      <a
                        href={current.url}
                        download={current.filename}
                        /* The file comes straight from its blob URL, so this
                           click is the only moment the server can learn about
                           it. Reported and then allowed to proceed — the report
                           is keepalive, so it survives the navigation. */
                        onClick={() => reportTake("downloaded")}
                        className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-white/10 bg-[#242427] px-2.5 text-[12px] text-white/80 transition-colors hover:bg-[#2E2E32] hover:text-white"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                    )}

                    {current.kind === "link" && (
                      <a
                        href={current.url}
                        target="_blank"
                        /* noreferrer as well as noopener: the target gets a
                           window.opener handle without the first and a full
                           Referer header without the second. */
                        rel="noopener noreferrer"
                        className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-white/10 bg-[#242427] px-2.5 text-[12px] text-white/80 transition-colors hover:bg-[#2E2E32] hover:text-white"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open
                      </a>
                    )}
                  </div>
                </div>

                {/* Above the code and directly under the buttons it is about,
                    so it is on screen at the moment the choice is made. */}
                {!isFree && current.kind !== "link" && <RefundNote owned />}

                {current.kind === "inline" ? (
                  <CodeBlock content={current.content} />
                ) : (
                  <div className="flex items-center gap-2.5 rounded-[10px] border border-white/10 bg-[#0F1013] px-3.5 py-4 text-[13px] text-white/60">
                    {current.kind === "file" ? (
                      <FileCode className="h-4 w-4 shrink-0" />
                    ) : (
                      <Link2 className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate">
                      {current.kind === "file"
                        ? "Download it with the button above."
                        : current.url}
                    </span>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* The listing's codeMeta says there is code and the unlocked fetch came
            back empty. That is a real state — a listing deleted after purchase
            whose snapshot predates codeAssets — and saying so beats an empty box. */}
        {!loading && !error && assets && assets.length === 0 && (
          <p className="text-[13px] text-white/50">
            No code files are attached to your copy of this product.
          </p>
        )}
      </div>
    );
  }

  /* ── LOCKED ───────────────────────────────────────────────────────────── */
  return (
    <div className="mt-6 rounded-[12px] border border-white/10 bg-[#1C1C1E] p-4">
      {header}

      {code?.preview ? (
        <CodeBlock content={code.preview} faded={!!code.previewTruncated} />
      ) : (
        /* Files or a link only — there is no inline source to excerpt, so the
           honest preview is the manifest of what you would be getting. */
        <div className="space-y-1.5 rounded-[10px] border border-white/10 bg-[#0F1013] p-3">
          {(code?.files || []).map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-[12.5px] text-white/60">
              {f.kind === "link" ? (
                <Link2 className="h-3.5 w-3.5 shrink-0 text-white/35" />
              ) : (
                <FileCode className="h-3.5 w-3.5 shrink-0 text-white/35" />
              )}
              <span className="truncate">{f.filename}</span>
              {!!f.size && <span className="ml-auto shrink-0 text-white/30">{formatSize(f.size)}</span>}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-[12px] text-white/45">
        <Lock className="h-3.5 w-3.5" />
        <span>
          {code?.totalLines
            ? `Showing the first lines of ${code.totalLines.toLocaleString()} — buy to unlock the full code`
            : "Buy this product to unlock the full code"}
        </span>
      </div>

      {/* The terms, before the money — a buyer deciding whether to pay should
          know what the refund rule is while they are still deciding. */}
      {!isFree && <RefundNote owned={false} />}
    </div>
  );
}
