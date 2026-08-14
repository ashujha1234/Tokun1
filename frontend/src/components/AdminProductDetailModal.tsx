import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ImageOff, X } from "lucide-react";

/**
 * The whole listing, for an admin deciding whether it should stay up.
 *
 * The products grid shows a thumbnail, a title and a price — which is enough to
 * recognise a listing and nothing like enough to moderate one. Every question
 * moderation actually asks ("does this do what it claims", "is this someone
 * else's work", "does the preview match the product") is answered by the prompt
 * text, and there was no screen anywhere in the admin that showed it.
 *
 * Read-only on purpose: the moderation buttons stay on the card, so this can't
 * become a second, competing place to act.
 */

export type AdminProductDetail = {
  id: string;
  title: string;
  description?: string;
  /** The paid content. Served only by admin-only endpoints. */
  promptText?: string;
  price: number;
  isFree?: boolean;
  status?: string;
  imageUrl?: string;
  videoUrl?: string;
  categories?: string[];
  tags?: string[];
  uploaderName?: string;
  uploaderEmail?: string;
  createdAt?: string;
  mediaStatus?: string;
  exclusive?: boolean;
  sold?: boolean;
  salesCount?: number;
  totalRevenue?: number;
};

const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wide text-white/40">{label}</div>
    <div className="text-[13px] text-white/85 mt-0.5 break-words">
      {value === 0 || value ? value : "—"}
    </div>
  </div>
);

export default function AdminProductDetailModal({
  product,
  onClose,
}: {
  product: AdminProductDetail | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!product) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1200] grid place-items-center p-4"
      style={{ background: "rgba(0,0,0,0.78)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.title}
    >
      <div
        className="w-full max-w-[780px] max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 text-white"
        style={{ background: "#131316" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-5 pb-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-white/40">Listing detail</p>
            <h2 className="text-lg font-semibold mt-1 break-words">{product.title}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
              {product.status && (
                <span className="px-2 py-0.5 rounded-full bg-white/[0.07] border border-white/10 text-white/70">
                  {product.status}
                </span>
              )}
              {(product.categories || []).map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/60"
                >
                  {c}
                </span>
              ))}
              {product.exclusive && (
                <span className="px-2 py-0.5 rounded-full text-[#FBBF24]" style={{ background: "#3A2A08" }}>
                  ONE-TIME{product.sold ? " • SOLD" : ""}
                </span>
              )}
              {product.mediaStatus && (
                <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/45">
                  media: {product.mediaStatus}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5">
          <div className="rounded-xl overflow-hidden bg-black/40 border border-white/10 grid place-items-center min-h-[220px]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full max-h-[42vh] object-contain"
              />
            ) : product.videoUrl ? (
              // Controls, because "the video isn't what was advertised" can only
              // be checked by watching it.
              <video
                src={product.videoUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full max-h-[42vh] object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/30 py-16">
                <ImageOff size={22} />
                <span className="text-xs">No preview on this listing</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {product.description && (
            <div>
              <div className="text-[11px] uppercase tracking-wide text-white/40 mb-1.5">
                Listing description
              </div>
              <p className="text-sm text-white/75 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          <div>
            <div className="text-[11px] uppercase tracking-wide text-white/40 mb-1.5">
              Full prompt text
            </div>
            <pre
              className="max-h-[300px] overflow-auto rounded-xl border border-white/10 bg-black/30 p-3 text-[12px] leading-relaxed text-white/80 whitespace-pre-wrap break-words"
              style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace" }}
            >
              {product.promptText || "— not available —"}
            </pre>
          </div>

          {!!product.tags?.length && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[11px] text-white/55">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10">
            <Field
              label="Price"
              value={product.isFree ? "Free" : `₹${Number(product.price || 0).toLocaleString("en-IN")}`}
            />
            <Field label="Sales" value={product.salesCount ?? 0} />
            <Field
              label="Revenue"
              value={`₹${Number(product.totalRevenue || 0).toLocaleString("en-IN")}`}
            />
            <Field
              label="Listed"
              value={
                product.createdAt ? new Date(product.createdAt).toLocaleDateString("en-IN") : undefined
              }
            />
            <Field label="Creator" value={product.uploaderName} />
            <Field label="Creator email" value={product.uploaderEmail} />
            <Field label="Listing ID" value={product.id} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
