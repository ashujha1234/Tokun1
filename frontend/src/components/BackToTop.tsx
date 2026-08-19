import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * "Back to top", on every page.
 *
 * The nav lives at the top of the document — the header is `sticky`, so it goes
 * away as you scroll — and several pages here are long: the marketplace, the
 * saved list, the blog, a profile. Reaching the menu meant scrolling all the way
 * back by hand.
 *
 * Mounted once in App.tsx rather than added per page, which is the only way it
 * ends up on ALL of them instead of on whichever ones someone remembered.
 */

/** How far down before it appears. Roughly a screen — below that the top is
    still in easy reach and a floating button is just something in the way. */
const SHOW_AFTER_PX = 600;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    /* rAF-throttled: scroll fires far more often than the screen repaints, and
       this runs on every page in the app. passive, because it never calls
       preventDefault and saying so lets the browser scroll without waiting. */
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update(); // in case we arrive already scrolled (a hash link, a restored tab)
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() =>
        /* Explicit "smooth", not left to the CSS scroll-behavior in index.css —
           this should glide even on a page that has overridden it. Anyone with
           "reduce motion" on gets an instant jump instead, which is exactly what
           that setting is asking for. */
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? ("instant" as ScrollBehavior)
            : "smooth",
        })
      }
      aria-label="Back to top"
      title="Back to top"
      /* Hidden rather than unmounted, so it can fade instead of blinking in and
         out. pointer-events-none while hidden keeps it from swallowing clicks on
         whatever is underneath it. */
      /* bottom-20 on a phone, bottom-6 from `sm` up: the dashboard puts a fixed
         bottom nav bar on small screens (md:hidden, so it's there at sm too) and
         at bottom-6 this landed on top of it. z-[9998] keeps it under every
         modal and under the cookie banner, both of which should cover it. */
      className={`fixed bottom-20 sm:bottom-6 right-6 z-[9998] grid h-11 w-11 place-items-center rounded-full text-white shadow-lg transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
        visible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3"
      }`}
      style={{
        background: "linear-gradient(270deg, #FF14EF 0%, #1A73E8 100%)",
        boxShadow: "0 8px 28px rgba(168, 85, 247, 0.35)",
      }}
    >
      <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
    </button>
  );
}
