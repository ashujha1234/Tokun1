/**
 * An image, full size, with a way to save it.
 *
 * Chat rendered attachments as a 240px-wide <img> and nothing else: no click
 * target, no full view, no download. A screenshot someone sent you was
 * something you could squint at, and that was all — the only way to see it
 * properly was to open the network tab.
 *
 * Download goes through fetch → blob → object URL rather than a plain
 * `<a download>`: the attachment is served from the API host, and the download
 * attribute is ignored cross-origin, so an anchor would have opened the image in
 * a tab instead of saving it. The anchor is kept as the fallback for the case
 * where the fetch is refused (no CORS headers on that host) — a new tab is worse
 * than saving, but much better than a dead button.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Loader2, X, ExternalLink } from "lucide-react";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";

export default function ImageLightbox({
  open,
  url,
  name,
  onClose,
}: {
  open: boolean;
  url: string;
  /** Used as the filename on disk and as the alt text. */
  name?: string;
  onClose: () => void;
}) {
  useBodyScrollLock(open);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !url) return null;

  const filename = (name || "image").replace(/[/\\?%*:|"<>]/g, "_");

  const download = async () => {
    setSaving(true);
    try {
      /* same-origin, not include: chat attachments are public Azure blob URLs,
         and a credentialed cross-origin request needs
         Access-Control-Allow-Credentials on the response — which a blob
         container doesn't send, so `include` would fail every download that
         actually works. Cookies still go out for our own host. */
      const res = await fetch(url, { credentials: "same-origin" });
      if (!res.ok) throw new Error(`http_${res.status}`);
      const blobUrl = URL.createObjectURL(await res.blob());

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch {
      // Couldn't read the bytes — hand it to the browser instead of failing.
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setSaving(false);
    }
  };

  /* PORTALLED TO <body>, and that is the whole reason a chat image opened
     halfway down the screen instead of over it.

     `position: fixed` resolves against the nearest ancestor carrying a filter,
     transform or backdrop-filter — not the viewport. The chat is rendered
     inside a `fixed inset-0 … backdrop-blur-md` panel (see ChatPage), so this
     overlay took ITS box as the viewport: a "fullscreen" lightbox laid out
     inside a panel that is itself inset and top-aligned with 60px of padding,
     which is exactly the low, cropped result. No amount of z-index or inset
     fixes it from in here — it has to leave the subtree. */
  return createPortal(
    <div
      className="fixed inset-0 z-[9999999] flex flex-col bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label={name || "Image"}
      onClick={onClose}
    >
      <div
        className="flex items-center gap-2 px-4 py-3"
        // The bar is a control strip, not part of the click-away area.
        onClick={(e) => e.stopPropagation()}
      >
        <p className="flex-1 min-w-0 truncate text-sm text-white/80">{name || "Image"}</p>

        <button
          type="button"
          onClick={download}
          disabled={saving}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/15 px-3 text-[13px] text-white/85 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download
        </button>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/15 px-3 text-[13px] text-white/85 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          Open
        </a>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid h-9 w-9 place-items-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 min-h-0 grid place-items-center p-4">
        <img
          src={url}
          alt={name || "Image"}
          className="max-h-full max-w-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>,
    document.body
  );
}
