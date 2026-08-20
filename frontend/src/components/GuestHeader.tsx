import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * The header a signed-OUT visitor gets, on every page.
 *
 * The landing page has always shown "Login / Get Started" to a visitor, and
 * every other page showed the app header instead — with a cart button, an
 * "Upload Product" button, and a single "Log in" pill. None of those work
 * without a session: the cart is server-side and keyed on the token (see
 * CartContext, which bails when there is none), and Upload Product only leads
 * back to a login wall. So a visitor on /about got a toolbar of things that
 * couldn't do anything, and no obvious way to sign up.
 *
 * Now Header renders THIS instead whenever the session is known to be absent,
 * so the header is the same promise on every page: come in, or make an account.
 *
 * Deliberately `sticky` rather than the landing nav's `fixed`. The landing hero
 * is built to sit under a floating bar; an ordinary page is not, and a fixed
 * header would crop the first 80px of it. Same `.site-header` shell either way,
 * so it looks like one bar that follows you around.
 */
export default function GuestHeader() {
  const navigate = useNavigate();

  /* The panel behind the bar fades in once you've scrolled off the top —
     otherwise the bar is transparent over whatever happens to be under it.
     Two thresholds, not one: a scroll that hovers on a single line flips the
     state every frame and the bar strobes. Same values as Header's own. */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const SHOW_AT = 80;
    const HIDE_AT = 40;
    let frame = 0;
    let visible = false;

    const measure = () => {
      frame = 0;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const next = visible ? y > HIDE_AT : y > SHOW_AT;
      if (next !== visible) {
        visible = next;
        setScrolled(next);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      className={`site-header sticky top-0 left-0 right-0 z-50 flex justify-center pointer-events-none${
        scrolled ? " site-header--scrolled" : ""
      }`}
    >
      {/* Decorative panel + glow, a sibling of the row so it can never sit
          between the logo and the pointer. Styles are in index.css, shared with
          the signed-in header. */}
      <div aria-hidden className="site-header__bg">
        <span className="site-header__glow" />
      </div>

      <div className="site-header__inner pointer-events-auto relative z-10 w-full text-white px-4 sm:px-6 py-2 flex items-center justify-between">
        {/* Home, not /app: there's no session, so /app would bounce them. */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="site-header__brand flex items-center gap-2 sm:gap-3 min-w-0 group shrink-0"
          aria-label="Go to home"
        >
          <img
            src="/icons/Tokun.png"
            alt="Tokun.world Logo"
            className="site-header__logo w-auto max-w-none object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </button>

        <div className="site-header__actions flex items-center gap-4 sm:gap-6 shrink-0">
          {/* A link, not a button: middle-click and open-in-new-tab both work,
              which is what people do with "Login". */}
          <Link
            to="/login"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors whitespace-nowrap"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="inline-flex items-center px-4 h-9 rounded-full text-sm font-medium text-white whitespace-nowrap border border-white/10"
            style={{ background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)" }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
