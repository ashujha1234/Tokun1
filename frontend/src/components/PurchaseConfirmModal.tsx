import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Check, ImageOff, Lock, ShieldCheck, Tag, X } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

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

/**
 * The server's own read of this listing: what it charges, and whether the
 * buyer's Refer & Earn welcome discount applies to it.
 *
 * Priced at live rates, so it is the figure Razorpay will be given — the props
 * below are whatever the calling page had to hand, and some callers carry no
 * tokun_price at all.
 */
type CheckoutPreview = {
  available: boolean;
  listPrice: number;
  platformFee: number;
  total: number;
  payable: number;
  /** Coupon fields, present only when `available`. */
  code?: string;
  percent?: number;
  /** Rupees off, already capped — the exact figure order creation will use. */
  discount?: number;
};

/**
 * The same review step, for a whole cart.
 *
 * Checkout used to go straight to Razorpay: the cart drawer closed, the page
 * behind it came back, and the next thing on screen was a payment sheet — no
 * confirmation of what was being bought, and none of the terms that Buy Now
 * makes a buyer accept first. Two paths to the same purchase asking for
 * different consent is not a difference either path can justify, so this dialog
 * takes a cart as well as a listing.
 *
 * The numbers come from the caller (GET /api/cart computes them, discount
 * included), because a cart is one payment across several sellers and there is
 * no per-listing quote to fetch.
 */
export type PurchasePreviewCart = {
  items: { id: string | number; title: string; listPrice: number; imageUrl?: string }[];
  listTotal: number;
  platformFee: number;
  /** Rupees off, already capped by the server. 0 when there is no credit. */
  discount: number;
  discountPercent?: number;
  /** What will be charged, discount included. */
  payable: number;
};

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

const inr = (value: number) =>
  `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function PurchaseConfirmModal({
  open,
  prompt,
  cart = null,
  onClose,
  onConfirm,
  busy = false,
}: {
  open: boolean;
  prompt: PurchasePreviewPrompt | null;
  /** Cart mode. Mutually exclusive with `prompt`; see PurchasePreviewCart. */
  cart?: PurchasePreviewCart | null;
  onClose: () => void;
  onConfirm: () => void;
  /** True while the order is being created, so the button can't be double-fired. */
  busy?: boolean;
}) {
  const { token } = useAuth() as any;
  const [agreed, setAgreed] = useState(false);
  const [quote, setQuote] = useState<CheckoutPreview | null>(null);
  const [applied, setApplied] = useState(false);

  // Consent is per purchase. Carrying a tick over from the last prompt would
  // mean the second thing someone bought was never actually agreed to.
  useEffect(() => {
    if (open) setAgreed(false);
  }, [open, prompt?.id, cart?.items?.length]);

  /* Priced afresh each time the dialog opens.

     Per listing because the discount is capped against Tokun's cut on that one
     sale, so it genuinely differs between prompts — and live because the credit
     may have been spent in another tab since the page loaded. */
  useEffect(() => {
    // Cart mode carries its own figures — there is no single listing to price.
    if (!open || cart || !prompt?.id) return;

    let cancelled = false;
    setQuote(null);
    setApplied(false);

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/referrals/checkout-preview/${prompt.id}`,
          {
            credentials: "include",
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        );
        const json = await res.json().catch(() => ({}));
        if (!cancelled && res.ok && json?.success) setQuote(json);
      } catch {
        // Falls back to the figures the page passed in, and nothing is blocked.
        // Order creation applies the credit either way, so the worst case is a
        // buyer charged less than the dialog quoted — never more.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, cart, prompt?.id, token]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open || (!prompt && !cart)) return null;

  /* The server's quote wins wherever it arrived: it is priced at live rates and
     is what Razorpay will be given. The props are the fallback, for the moment
     before it lands and for the case where it never does.

     tokunPrice falls back to the list price rather than 0 — a listing saved
     before the fee existed carries no tokun_price and is sold at its list
     price. */
  const listPrice = cart
    ? cart.listTotal
    : quote
      ? quote.listPrice
      : Number(prompt?.price || 0);
  const total = cart
    ? +(cart.listTotal + cart.platformFee).toFixed(2)
    : quote
      ? quote.total
      : Number(prompt?.tokunPrice || 0) > 0
        ? Number(prompt?.tokunPrice)
        : Number(prompt?.price || 0);
  // One line, because that is how it is charged: the fee and the GST on it are
  // never taken apart anywhere the buyer can act on them.
  const platformFee = cart
    ? cart.platformFee
    : quote
      ? quote.platformFee
      : Math.max(0, +(total - listPrice).toFixed(2));

  // The coupon half of the quote. `couponValue` is what it is worth on this
  // listing; `discount` is what comes off the bill, which is zero until applied.
  const coupon = cart ? null : quote?.available ? quote : null;
  const couponValue = Number(coupon?.discount || 0);
  /* Cart mode: the credit is applied to the order by /api/cart/checkout, so it
     is a fact here, not a button. Single-listing mode keeps the Apply step — see
     the coupon block below. */
  const discount = cart ? cart.discount : applied && coupon ? couponValue : 0;
  const discountLabelPercent = cart ? cart.discountPercent : coupon?.percent;
  const payable = cart ? cart.payable : applied && coupon ? coupon.payable : total;

  const preview = prompt?.imageUrl || prompt?.videoUrl;

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
          {/* Cart mode: the list of what is being bought, one row each, so the
              numbers below can be checked against something. */}
          {cart ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] divide-y divide-white/[0.06]">
              {cart.items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 p-3">
                  <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-black/40 grid place-items-center">
                    {it.imageUrl ? (
                      <img loading="lazy" decoding="async" src={it.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageOff className="text-white/25" size={16} />
                    )}
                  </div>
                  <p className="min-w-0 flex-1 text-[13px] leading-snug break-words">{it.title}</p>
                  <span className="shrink-0 text-[13px] text-white/70 tabular-nums">
                    {inr(it.listPrice)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
          <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-black/40 grid place-items-center">
              {prompt?.imageUrl ? (
                <img loading="lazy" decoding="async" src={prompt.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : prompt.videoUrl ? (
                <video
                  src={prompt?.videoUrl}
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
              <p className="text-sm font-semibold leading-snug break-words">{prompt?.title}</p>
              {prompt?.uploaderName && (
                <p className="text-[12px] text-white/45 mt-0.5">by {prompt?.uploaderName}</p>
              )}
              {prompt?.exclusive && (
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
          )}

          {/* The welcome discount, for a buyer who was invited by someone and
              hasn't spent it yet.

              Filled in and read only: there is nothing to type. The credit sits
              on the account, not behind a string somebody could guess, and a box
              you can edit invites a buyer to try codes that were never going to
              work. The button is the whole interaction — it's here so the saving
              is something they DO, and see land on the total, rather than a
              number that was quietly different from the listing all along. */}
          {coupon && (
            <div
              className={`mt-4 rounded-xl border p-4 transition-colors ${
                applied
                  ? "border-emerald-500/30 bg-emerald-500/[0.07]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag className={`h-3.5 w-3.5 ${applied ? "text-emerald-300" : "text-white/40"}`} />
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                  {applied ? "Coupon applied" : "You have a coupon"}
                </p>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <input
                  readOnly
                  value={coupon.code}
                  aria-label="Your welcome coupon"
                  className={`min-w-0 flex-1 rounded-lg border bg-black/30 px-3 py-2.5 font-mono text-[15px] font-bold tracking-[0.14em] outline-none ${
                    applied
                      ? "border-emerald-500/30 text-emerald-300"
                      : "border-dashed border-white/20 text-white"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setApplied(true)}
                  disabled={applied || busy}
                  className={`h-[42px] shrink-0 rounded-lg px-4 text-[13px] font-semibold transition ${
                    applied
                      ? "cursor-default bg-emerald-500/15 text-emerald-300"
                      : "text-white hover:opacity-90"
                  }`}
                  style={
                    applied
                      ? undefined
                      : { background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }
                  }
                >
                  {applied ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" /> Applied
                    </span>
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>

              <p className="mt-2 text-[12px] leading-relaxed text-white/45">
                {applied ? (
                  <>
                    <span className="font-semibold text-emerald-300">
                      {coupon.percent}% off — you save {inr(couponValue)}
                    </span>{" "}
                    on this purchase.
                  </>
                ) : (
                  <>
                    {coupon.percent}% off your first purchase, from the invite you signed up
                    with. Worth {inr(couponValue)} on this listing.
                  </>
                )}
              </p>
            </div>
          )}

          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-2.5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-white/60">
                {cart ? `Products (${cart.items.length})` : "Product price"}
              </span>
              <span className="text-white/90">{inr(listPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-white/60">Platform fee (incl. GST)</span>
              <span className="text-white/90">{inr(platformFee)}</span>
            </div>

            {discount > 0 && (
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-emerald-300/85">
                  Welcome discount{discountLabelPercent ? ` (${discountLabelPercent}%)` : ""}
                </span>
                <span className="font-semibold text-emerald-300">−{inr(discount)}</span>
              </div>
            )}

            <div className="h-px bg-white/10" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Total payable</span>
              <span className="flex items-baseline gap-2">
                {discount > 0 && (
                  // The old total stays on screen next to the new one — a price
                  // that simply changes is a price you have to take on trust.
                  <span className="text-[13px] text-white/35 line-through">{inr(total)}</span>
                )}
                <span className="text-lg font-bold">{inr(payable)}</span>
              </span>
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
            {busy ? "Opening payment…" : `Pay ${inr(payable)}`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
