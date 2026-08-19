import { useEffect, useState } from "react";
import { X, Download, Loader2, ShieldAlert } from "lucide-react";
import {
  previewDeliverable,
  releasePreview,
  downloadDeliverable,
  isPreviewableVideo,
} from "@/lib/serviceDeliverables";
import { toast } from "@/components/ui/use-toast";

type Props = {
  orderId: string;
  orderKind: "service" | "hire";
  index: number;
  name: string;
  token?: string;
  onClose: () => void;
  /** Falls back to the filename when the record carries a mime type. */
  mimeType?: string;
};

/* Repeating diagonal mark drawn OVER the player.
   A video can't be stamped the way an image can — server/utils/
   deliverableWatermark.js re-encodes an image in the time one request has, and
   an ffmpeg pass over a delivery video does not fit in that budget. So the mark
   is drawn here instead.

   Be clear about what that buys: a screen recording or a phone photo of the
   review comes out marked, which is the common case. The bytes behind the
   player are the original, so it is not a defence against someone reading the
   network tab. Burning it in needs an ffmpeg pass at upload time.

   pointer-events:none matters — without it this sheet eats the play button. */
const WatermarkOverlay = () => (
  <div
    aria-hidden
    className="absolute inset-0 overflow-hidden select-none"
    style={{ pointerEvents: "none" }}
  >
    <div
      className="absolute"
      style={{
        // Oversized and rotated so the tiling reaches every corner.
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        transform: "rotate(-30deg)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
      }}
    >
      {Array.from({ length: 9 }).map((_, row) => (
        <div
          key={row}
          className="flex justify-around whitespace-nowrap"
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "3px",
            color: "rgba(255,255,255,0.16)",
            textShadow: "0 1px 2px rgba(0,0,0,0.35)",
          }}
        >
          {Array.from({ length: 5 }).map((_, col) => (
            <span key={col}>TOKUN · PREVIEW</span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Shows a delivered image in place, instead of pushing it to the downloads
 * folder.
 *
 * The server already renders a watermarked copy while the money is still held
 * (see server/utils/deliverableWatermark.js) and serves it inline — this is the
 * screen that was missing to actually look at it. Reviewing work you have to
 * download first, one file at a time, is how a client ends up approving
 * something unseen.
 */
export default function DeliverablePreviewModal({
  orderId,
  orderKind,
  index,
  name,
  token,
  onClose,
  mimeType,
}: Props) {
  const isVideo = isPreviewableVideo(name, mimeType);
  const [preview, setPreview] = useState<{
    url: string;
    isObjectUrl: boolean;
    watermarked?: boolean;
    heldInEscrow?: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  /* One answer to "is the buyer looking at this before paying out?", however the
     server said it: `watermarked` on the image path (bytes were stamped), or
     `heldInEscrow` on the JSON path (bytes couldn't be — a video). Both are set
     only for the buyer while funds are unsettled. */
  const heldEscrow = !!preview && (preview.watermarked || preview.heldInEscrow);

  useEffect(() => {
    let cancelled = false;
    let opened: { url: string; isObjectUrl: boolean } | null = null;

    previewDeliverable(orderId, index, token, orderKind)
      .then((res) => {
        // Closing the modal mid-fetch must still free the blob, hence the local
        // handle rather than relying on state that never lands.
        if (cancelled) return releasePreview(res);
        opened = res;
        setPreview(res);
      })
      .catch((err: any) => {
        if (!cancelled) setError(err?.message || "Couldn't load this file.");
      });

    return () => {
      cancelled = true;
      releasePreview(opened);
    };
  }, [orderId, orderKind, index, token]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadDeliverable(orderId, index, name, token, orderKind);
    } catch (err: any) {
      toast({ title: "Download failed", description: err?.message || "Try again." });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[900px] max-h-full flex flex-col rounded-2xl border border-white/10 bg-[#121215] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <p className="flex-1 min-w-0 truncate text-sm text-white">{name}</p>

          {/* No Download while the money is still held.

              Offering it here contradicted the whole screen: the notice below
              says the file is yours once the work is approved, and a Download
              button beside it said otherwise. For a video it was worse than a
              contradiction — the watermark is drawn on the player, so the bytes
              behind that button are the clean original.

              `heldEscrow` is the server's own answer, not a guess from the UI:
              set only when the caller is the buyer AND the funds are unsettled.
              The creator looking at their own delivery, and the buyer after
              release, both still get the button. */}
          {!heldEscrow && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-white/15 text-[12px] text-white/80 hover:text-white hover:border-white/30 transition-colors disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Download
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="shrink-0 grid place-items-center w-8 h-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Said plainly, because the client is looking at a degraded copy and
            should know why rather than think the delivery itself is stamped. */}
        {heldEscrow && (
          <div className="flex items-start gap-2 px-4 py-2.5 bg-[#FABC4E]/[0.08] border-b border-[#FABC4E]/20">
            <ShieldAlert className="w-4 h-4 text-[#FABC4E] shrink-0 mt-px" />
            <p className="text-[11px] leading-relaxed text-[#FABC4E]">
              Watermarked preview — the payment is still held in escrow. Approve the
              work and the original file, without the watermark, is yours.
            </p>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-auto grid place-items-center p-4 bg-black/40">
          {error ? (
            <p className="text-sm text-white/50 py-16">{error}</p>
          ) : !preview ? (
            <div className="flex items-center gap-2 text-white/40 py-16">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading preview…</span>
            </div>
          ) : isVideo ? (
            /* Plays in place. The eye used to hand this url to
               `window.open`, and for a video that arrives as a signed blob URL
               with an attachment disposition the browser answered by saving it
               — so "preview" put the delivery on the client's disk, unmarked,
               before they had approved anything. */
            <div className="relative max-w-full">
              <video
                src={preview.url}
                controls
                autoPlay
                playsInline
                // Removes the download item from the native menu. Cosmetic, like
                // the overlay — the URL is still in the DOM.
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                className="max-w-full max-h-[70vh] rounded-lg bg-black"
                onError={() =>
                  setError("This video couldn't be played here. Try downloading it.")
                }
              />
              {preview.heldInEscrow && <WatermarkOverlay />}
            </div>
          ) : (
            <img
              src={preview.url}
              alt={name}
              className="max-w-full max-h-[70vh] object-contain"
              onError={() => setError("This file couldn't be displayed. Try downloading it.")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
