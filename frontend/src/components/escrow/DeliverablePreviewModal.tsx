import { useEffect, useState } from "react";
import { X, Download, Loader2, ShieldAlert } from "lucide-react";
import {
  previewDeliverable,
  releasePreview,
  downloadDeliverable,
} from "@/lib/serviceDeliverables";
import { toast } from "@/components/ui/use-toast";

type Props = {
  orderId: string;
  orderKind: "service" | "hire";
  index: number;
  name: string;
  token?: string;
  onClose: () => void;
};

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
}: Props) {
  const [preview, setPreview] = useState<{
    url: string;
    isObjectUrl: boolean;
    watermarked?: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

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
        {preview?.watermarked && (
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
