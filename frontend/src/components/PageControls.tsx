import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Back, and back-to-top — on every page, from one place.
 *
 * Added here rather than to each screen because there are ~48 routes and each
 * one lays its header out differently: dropping a back link into all of them by
 * hand is how you end up with it on thirty and missing on eighteen, at four
 * different sizes. Mounted once in App.tsx, outside <Routes>, it is on all of
 * them by construction.
 *
 * The two live together so they can't overlap: they share one stack in the
 * corner and the spacing is decided here, not by two components guessing at each
 * other's position.
 */

/** How far down before "back to top" earns its place. Roughly a screen. */
const SHOW_TOP_AFTER_PX = 600;

/**
 * Neither control belongs on the auth screens: they already carry their own
 * inline BackLink, a second back control on a login form is just confusing, and
 * none of them is long enough to scroll.
 */
const HIDDEN_ON = [
  "/login",
  "/signup",
  "/verify-login",
  "/verify-signup",
  "/admin-login",
  "/admin-forgot-password",
];

/**
 * Pages that get back-to-top but NOT back.
 *
 *  /      the landing page. There is nowhere "back" from the front door — but it
 *         is a long scroll, so getting back to the top is exactly what it needs.
 *  /app   the SAME Landing component in its signed-in variant (see
 *         pages/AppPage.tsx), which is the version most people actually see.
 *
 * The marketplace is deliberately on neither list. It is the longest scroll in
 * the app — rails, then a grid that pages in more on demand — and its own inline
 * "Back to marketplace" only exists inside the search-results view, where it
 * clears the search rather than leaving the page.
 */
const NO_BACK_ON = ["/", "/app"];

export default function PageControls() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      setScrolled(window.scrollY > SHOW_TOP_AFTER_PX);
    };
    /* rAF-throttled and passive: this runs on every page in the app, and scroll
       fires far more often than the screen repaints. */
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (HIDDEN_ON.includes(pathname)) return null;

  const showBack = !NO_BACK_ON.includes(pathname);

  /* The ONE page with a fixed bottom nav bar to clear.
   *
   * That bar is `md:hidden fixed bottom-0` in pages/Dashboard.tsx and is about
   * 55px tall, so the controls have to sit above it — but only here. The offset
   * used to be unconditional (`bottom-20` on every phone), which paid for a nav
   * bar that 47 of the 48 routes don't have: on all of those the arrow floated
   * 80px off the bottom edge for no reason, which is what reads as it being too
   * high up.
   *
   * The breakpoint matters as much as the route. It was `bottom-20 sm:bottom-6`,
   * and the nav bar is `md:hidden` — so between 640px and 767px the bar was on
   * screen while the controls had already dropped to 24px, and the arrow sat on
   * top of the very thing the offset existed to avoid. Matching `md` here is
   * what actually closes that.
   */
  const clearsBottomNav = pathname === "/admin/dashboard";

  const button =
    "grid h-11 w-11 place-items-center rounded-full text-white shadow-lg transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

  return (
    /* z-[9998] keeps these under every modal and under the cookie banner, both
       of which should cover them. The bottom offset is per-route — see
       clearsBottomNav above. */
    <div
      className={`fixed ${
        clearsBottomNav ? "bottom-20 md:bottom-6" : "bottom-6"
      } right-6 z-[9998] flex flex-col items-center gap-3`}
    >
      <button
        type="button"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
              ? ("instant" as ScrollBehavior)
              : "smooth",
          })
        }
        aria-label="Back to top"
        title="Back to top"
        /* Hidden rather than unmounted, so it fades instead of blinking, and the
           back button below it doesn't jump as this one comes and goes. */
        className={`${button} ${
          scrolled ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3"
        }`}
        style={{
          background: "linear-gradient(270deg, #FF14EF 0%, #1A73E8 100%)",
          boxShadow: "0 8px 28px rgba(168, 85, 247, 0.35)",
        }}
      >
        <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
      </button>

      {/* FLOATING BACK BUTTON — PARKED, not deleted.

          Commented out on request for now. Back-to-top above stays: that one is
          about a long page, this one duplicated the browser's own back button
          on every screen in the app, sitting over page content to do it.

          Everything it needs is still here (showBack, NO_BACK_ON, the shared
          `button` class) so putting it back is uncommenting this block. The
          inline BackLink on the auth screens is unaffected — that one is part of
          those layouts, not this overlay. */}
      {/* {showBack && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          title="Go back"
          className={button}
          style={{
            background: "rgba(28,28,30,0.92)",
            border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(8px)",
          }}
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
        </button>
      )} */}
    </div>
  );
}
