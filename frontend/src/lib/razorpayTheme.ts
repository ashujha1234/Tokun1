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

   This was Tokun blue (#1A73E8) first, which was a real change and a pointless
   one: Razorpay's default is #3395FF, so blue became a slightly deeper blue and
   the panel still read as Razorpay's, not ours. The app is near-black
   everywhere, so that is what the panel should be.

   #17171A is the card surface used throughout the app, sitting just off the
   #000 backdrop below so the modal's edge stays visible instead of dissolving
   into the page. Anything Razorpay also tints with this — the CTA, the title
   underline — lands dark on their white pane, which is white-on-#17171A at
   about 18:1. */
const ACCENT = "#17171A";

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
