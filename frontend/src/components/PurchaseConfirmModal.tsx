import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ImageOff, Lock, ShieldCheck, X } from "lucide-react";

/**
 * The review step between "Buy Now" and Razorpay.
 *
 * Buy Now used to go straight to the payment sheet, where the only number on
 * screen was a total the buyer had never seen: listings advertise the list
 * price, but the charge is the list price plus Tokun's platform fee and GST on
 * that fee. The fee appeared for the first time inside Razorpay, attached to
 * nothing, with no way back to check what it was for.
 *
 * So this shows what is being bought, what each part of the money is, and the
 * terms that govern it — and asks the buyer to accept them before a payment
 * sheet opens. It is deliberately a review screen, not a second checkout: it
 * creates no order and charges nothing.
 */

export type PurchasePreviewPrompt = {
  id: string | number;
  title: string;
  description?: string;
  /** The seller's list price — what the listing advertises. */
  price?: number;
  /** List price + platform fee + GST — what the card is charged. */
  tokunPrice?: number;
  imageUrl?: string;
  videoUrl?: string;
  uploaderName?: string;
  exclusive?: boolean;
};

const inr = (value: number) =>
  `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function PurchaseConfirmModal({
  open,
  prompt,
  onClose,
  onConfirm,
  busy = false,
}: {
  open: boolean;
  prompt: PurchasePreviewPrompt | null;
  onClose: () => void;
  onConfirm: () => void;
  /** True while the order is being created, so the button can't be double-fired. */
  busy?: boolean;
}) {
  const [agreed, setAgreed] = useState(false);

  // Consent is per purchase. Carrying a tick over from the last prompt would
  // mean the second thing someone bought was never actually agreed to.
  useEffect(() => {
    if (open) setAgreed(false);
  }, [open, prompt?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open || !prompt) return null;

  const listPrice = Number(prompt.price || 0);
  /* Falls back to the list price rather than 0 — a listing saved before the
     fee existed carries no tokun_price, and it is sold at its list price. */
  const total = Number(prompt.tokunPrice || 0) > 0 ? Number(prompt.tokunPrice) : listPrice;
  // One line, because that is how it is charged: the fee and the GST on it are
  // never taken apart anywhere the buyer can act on them.
  const platformFee = Math.max(0, +(total - listPrice).toFixed(2));

  const preview = prompt.imageUrl || prompt.videoUrl;

  return createPortal(
    <div
      className="fixed inset-0 z-[1200] grid place-items-center p-4"
      style={{ background: "rgba(0,0,0,0.78)" }}
      onClick={() => !busy && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Review your purchase"
    >
      <div
        className="w-full max-w-[520px] max-h-[92vh] overflow-y-auto rounded-2xl border border-white/10 text-white"
        style={{ background: "#131316" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-5 pb-4">
          <div>
            <h2 className="text-lg font-semibold">Review your purchase</h2>
            <p className="text-[12px] text-white/45 mt-0.5">
              Nothing is charged until you continue.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="shrink-0 text-white/50 hover:text-white transition-colors disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5">
          <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-black/40 grid place-items-center">
              {prompt.imageUrl ? (
                <img src={prompt.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : prompt.videoUrl ? (
                <video
                  src={prompt.videoUrl}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <ImageOff className="text-white/25" size={18} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug break-words">{prompt.title}</p>
              {prompt.uploaderName && (
                <p className="text-[12px] text-white/45 mt-0.5">by {prompt.uploaderName}</p>
              )}
              {prompt.exclusive && (
                /* A one-time listing is sold once and then gone. Saying so here
                   is the difference between an informed purchase and a
                   surprise. */
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#3A2A08] text-[#FBBF24]">
                  ONE-TIME SALE — SOLD ONCE, THEN DELISTED
                </span>
              )}
              {!preview && (
                <p className="text-[11px] text-white/30 mt-1">This listing has no preview.</p>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-2.5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-white/60">Product price</span>
              <span className="text-white/90">{inr(listPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-white/60">Platform fee (incl. GST)</span>
              <span className="text-white/90">{inr(platformFee)}</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Total payable</span>
              <span className="text-lg font-bold">{inr(total)}</span>
            </div>
          </div>

          <ul className="mt-4 space-y-2 text-[12px] text-white/55">
            <li className="flex gap-2">
              <Lock className="w-3.5 h-3.5 mt-[2px] shrink-0 text-white/35" />
              The full product unlocks as soon as the payment succeeds, and stays in
              your purchase history.
            </li>
            <li className="flex gap-2">
              <ShieldCheck className="w-3.5 h-3.5 mt-[2px] shrink-0 text-white/35" />
              Payment is processed by Razorpay. Tokun never sees your card details.
            </li>
            <li className="flex gap-2">
              <span className="w-3.5 shrink-0" />
              {/* The two facts a buyer needs BEFORE paying, not after: how long
                  they have to ask for money back, and that the fee above is not
                  part of what comes back. */}
              You can request a refund within 24 hours of purchase. The platform fee
              is non-refundable.
            </li>
          </ul>

          <label className="mt-4 flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-[3px] h-4 w-4 shrink-0 accent-[#1A73E8] cursor-pointer"
            />
            <span className="text-[12px] text-white/70 leading-relaxed">
              I agree to the{" "}
              {/* New tab on purpose — reading the terms must not throw away the
                  purchase you were halfway through. */}
              <Link
                to="/terms"
                target="_blank"
                rel="noreferrer"
                className="text-white underline underline-offset-2"
              >
                Terms &amp; Conditions
              </Link>
              {" and "}
              <Link
                to="/refund-policy"
                target="_blank"
                rel="noreferrer"
                className="text-white underline underline-offset-2"
              >
                Refund Policy
              </Link>
              .
            </span>
          </label>
        </div>

        <div className="p-5 pt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-11 px-5 rounded-full text-sm font-medium text-white bg-white/[0.06] border border-white/10 hover:bg-white/[0.12] transition disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!agreed || busy}
            className="flex-1 h-11 rounded-full text-sm font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
          >
            {busy ? "Opening payment…" : `Pay ${inr(total)}`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
