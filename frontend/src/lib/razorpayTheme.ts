/**
 * Tokun's branding for Razorpay Checkout, in one place.
 *
 * Nine call sites open Checkout — cart, single-product buy from three pages,
 * wallet top-up, subscription from two places, a hire payment and a service
 * booking — and each had written its own options. They had drifted: the brand
 * name was "Tokun" in some and "Tokun.world" in others, the accent was Tokun
 * blue in most, a status green (#19E66C) on hire payments, and a page-local
 * ACCENT on service bookings. None of them sent a logo, so the buyer's last
 * screen before paying carried no mark at all.
 *
 * WHAT RAZORPAY ACTUALLY LETS US CHANGE FROM CODE
 * Checkout renders in an iframe on Razorpay's own origin, so there is no CSS to
 * inject and no dark-mode switch. The options below are the whole surface:
 * `theme.color` (CTA button, method icons, links), `theme.backdrop_color` (the
 * area around the modal), `image`, `name` and `description`.
 *
 * The modal's own background, its font, its border radius and the desktop
 * sidebar graphic are NOT settable from here — they live in the Razorpay
 * dashboard under Account & Settings → Checkout Settings → Branding, and they
 * apply to Invoices and Payment Links too. Set them there to finish the look.
 */

/* `theme.color` is not just an accent — per Razorpay's own docs it paints "the
   Pay button, side bar and title underline". The side bar is that whole left
   panel carrying the logo and price summary, i.e. the largest surface on the
   screen and the one that has to look like Tokun.

   IT CANNOT BE A GRADIENT. This field takes one solid hex; Checkout renders in
   an iframe on Razorpay's own origin, so there is no stylesheet of ours that
   reaches it and no way to hand it `linear-gradient(...)`. The only route to a
   real gradient on that panel is the "Sidebar Graphic" image in the Razorpay
   dashboard (Account & Settings → Checkout Settings → Branding), which is a
   picture you upload, not a value this code can send.

   So the panel gets the ONE colour closest to Tokun's gradient: #A855F7, the
   50% stop of `#FF14EF → #A855F7 → #1A73E8` as the app itself declares it —
   the middle of the same pink-to-blue run the logo is drawn in.

   Two colours came before it and both were wrong. Tokun blue (#1A73E8) landed
   almost exactly on Razorpay's own default #3395FF, so the panel still read as
   theirs. Near-black (#17171A) matched the app but not the brand — the whole
   point of that panel is that it carries the mark. */
const ACCENT = "#A855F7";

/** Pure black, so the panel above reads as a surface lifted off it. Only a
 *  solid hex is accepted here, so this is opaque — the page behind is covered
 *  rather than dimmed. */
const BACKDROP = "#000000";

const BRAND_NAME = "Tokun";

/* Absolute, because the <img> lives inside Razorpay's iframe: a relative
   "/favicon.ico" (which the wallet top-up was sending) resolves against
   Razorpay's origin, not ours, and quietly renders nothing.

   favicon-512x512.png rather than favicon.ico: square, 512px, transparent, and
   the mark itself is the pink→blue crystal — so it reads on the dark side bar
   ACCENT now paints, and would still read on a white one.

   ON LOCALHOST THIS LOGO WILL NOT APPEAR, and that is not a bug to chase.
   Checkout runs in an iframe on https://api.razorpay.com, so an http://localhost
   image is mixed content and the browser blocks it; Razorpay then falls back to
   the first letter of `name`, which is the "T" tile you see in dev. Over https
   in production it loads. */
const logoUrl = () => `${window.location.origin}/favicon-512x512.png`;

/**
 * Stamps Tokun's identity onto a Checkout options object.
 *
 * Branding deliberately overrides whatever the call site passed for `name`,
 * `image` and `theme` — that is the point of having one source. Everything the
 * flow owns (`description`, `prefill`, `notes`, `handler`, `modal`, `amount`)
 * passes through untouched.
 */
export function withTokunBranding<T extends Record<string, any>>(options: T) {
  return {
    ...options,
    name: BRAND_NAME,
    image: logoUrl(),
    theme: { color: ACCENT, backdrop_color: BACKDROP },
  };
}
