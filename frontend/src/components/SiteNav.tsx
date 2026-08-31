import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

/* The landing stylesheet owns this bar — `.landing-nav*`, `.tokun-logo*`,
   `.hero-nav__link` and `.hero-btn*` all live there, and `.site-header*` (the
   panel, the column ladder, the on-scroll travel) lives in index.css. Imported
   here rather than copied, because two copies of a header's CSS is how the two
   headers drifted apart in the first place. Same module Landing imports, so it
   is one stylesheet in the bundle, not two. */
import "@/pages/landing-page.css";
import UploadProductButton from "@/components/UploadProductButton";
import ModeToggle from "@/components/ModeToggle";
import { useMode } from "@/contexts/ModeContext";

const TOKUN_LOGO_SRC = "/icons/Tokun.png";

/**
 * THE header. One component, every page.
 *
 * There used to be two: the landing page had its own bar, and everything else
 * had the app header — which for a signed-out visitor meant a cart button, an
 * Upload Product button and a lone "Log in" pill, none of which work without a
 * session. The two were different sizes, different logos, different buttons, so
 * moving from the landing page to /about looked like arriving at a different
 * product.
 *
 * Now both render this. `docked` is the only difference and it is a real one:
 *
 *   floating (default, landing)  position: fixed. The hero is built to sit
 *                                under a floating bar and reserves its height
 *                                via --landing-nav-h.
 *   docked (every other page)    position: sticky, i.e. in flow. An ordinary
 *                                page reserves nothing, so a fixed bar would
 *                                crop the top of its content.
 *
 * `children` replaces the signed-out Login/Get Started pair — the landing page
 * passes its account dropdown there when someone is signed in.
 */
export default function SiteNav({
  docked = false,
  children,
}: {
  docked?: boolean;
  children?: ReactNode;
}) {
  const scrolled = useHeaderScrolled();
  /* No `useAuth` here any more. The session used to decide whether Upload
     Product was shown; the mode decides it now, and ModeContext already folds
     the session into that (a visitor with no account cannot be in Creator
     mode). One question asked in one place. */
  const { shows } = useMode();

  /* CREATOR MODE ONLY, session or no session.
   *
   * This was `!isAuthenticated || shows("upload")` — always shown to a
   * signed-out visitor, as a marketing CTA for the selling half of the product.
   * That argument doesn't survive the toggle being on the same bar: it read
   * "Buyer", highlighted, two inches to the right of an Upload Product button.
   * A control that states the mode and a bar that contradicts it is worse than
   * a missed CTA.
   *
   * WHAT THIS MEANS IN PRACTICE: an anonymous visitor never sees it. They are
   * always in Buyer mode — pressing Creator on the toggle sends them to signup
   * rather than switching (see ModeToggle), and ModeContext resolves `shows`
   * against "buyer" for anyone who can't be in Creator mode. So the button now
   * appears only once someone has an account and has chosen the creator side.
   *
   * `shows` still answers true for everything when MODE_UI_ENABLED is off, so
   * turning that flag off puts the button back unconditionally, as before. */
  const showUpload = shows("upload");

  return (
    <nav
      className={`site-header landing-nav${docked ? " landing-nav--docked" : ""}${
        scrolled ? " site-header--scrolled" : ""
      }`}
    >
      {/* Decorative panel + glow, and a SIBLING of the row rather than its
          parent — so it can clip its own glow without ever clipping a dropdown,
          and nothing here can sit between the logo and the pointer. */}
      <div aria-hidden className="site-header__bg">
        <span className="site-header__glow" />
      </div>

      <div className="site-header__inner landing-nav__inner">
        <div className="site-header__brand">
          <TokunLogo />
        </div>

        <div className="site-header__actions landing-nav__actions">
          {/* Upload sits LEFT of the toggle.
              The other way round it landed between the toggle and the account
              menu — two account-level controls with a page action wedged
              through the middle of them. Reading right to left, the cluster
              nearest the avatar should be the ones that belong to the account:
              which mode you are in, and who you are.

              Signed OUT this is a marketing CTA — selling is half of what this
              product is, and the bar a first-time visitor sees never said so.
              Signed IN it is a tool, and a tool belongs to Creator mode: a
              buyer who has chosen the buying half of the app should not be
              carrying an Upload button around the landing page. Two different
              jobs for one button, which is why the condition is on the session
              rather than on the mode alone. */}
          {showUpload && <UploadProductButton />}

          {/* Here as well as in the app header, because this is the bar a
              signed-out visitor actually sees — putting the Buyer/Creator
              choice only behind a login means nobody meets it until after they
              have picked a side. Pressing Creator without an account goes to
              signup and lands there in Creator mode (see ModeToggle). */}
          <ModeToggle />

          {children ?? (
            <>
              {/* Links, not buttons: middle-click and open-in-new-tab both
                  work, which is what people do with these two. */}
              <Link to="/login" className="hero-nav__link">
                Login
              </Link>
              <GetStartedButton />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/**
 * The mark. Deliberately motionless.
 *
 * It used to carry a framer-motion hover spring (scale 1.06) and a permanent
 * 4-second float, and the hover was actively broken once the bar had condensed:
 * `.site-header__logo` / `.tokun-logo__link` is scaled down on scroll with
 * `transform-origin: left center` and a 760ms transition, so hovering swapped
 * that transform for the hover one and the logo grew and slid to the right over
 * three-quarters of a second. Two animations fighting over one `transform`.
 *
 * The glow still lifts on hover (`.tokun-logo:hover .tokun-logo__img` in
 * landing-page.css) — that's a filter, it doesn't touch transform, and it is
 * enough to say "this is clickable" without the mark moving anywhere.
 */
export function TokunLogo({ src = TOKUN_LOGO_SRC }: { src?: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="tokun-logo" aria-label="TOKUN home">
      <Link to="/" className="tokun-logo__link">
        {failed ? (
          <span className="tokun-logo__fallback">TOKUN</span>
        ) : (
          /* eager + high priority, and NOT lazy — this one is the exception.
             Every other <img> in the app is lazily loaded, which is right for
             cards, avatars and chat images. This one sits in the header, is on
             screen before anything else, and Lighthouse measures it as the
             Largest Contentful Paint element on most pages. Lazy-loading it
             added 1.16 s of "load delay" to LCP — the browser will not even
             start fetching a lazy image until layout has run, so the single
             most visible thing on the page was the last to be asked for. */
          <img
            src={src}
            alt="TOKUN"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="tokun-logo__img"
            onError={() => setFailed(true)}
          />
        )}
      </Link>
    </div>
  );
}

/* The signed-out CTA. Same DOM and classes as the landing hero's small gradient
   button, so the two are the same object rather than two things that resemble
   each other. The hover spring stays here: it's a button, moving on hover is
   what a button is meant to do — unlike the logo, whose transform is already
   owned by the scroll condense. */
function GetStartedButton() {
  const navigate = useNavigate();

  return (
    <motion.button
      type="button"
      onClick={() => navigate("/signup")}
      className="hero-btn hero-btn--small"
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <span className="hero-btn__text">Get Started</span>
      <span className="hero-btn__icon">
        <ArrowRight size={16} />
      </span>
    </motion.button>
  );
}

/**
 * Is the page scrolled far enough for the bar to become a solid panel?
 *
 * Two thresholds, not one: a scroll that hovers on a single line flips the
 * state every frame and the panel strobes. The gap between them is the dead
 * zone. Exported because the app header (components/Header.tsx) shows the same
 * panel on the same schedule.
 */
export function useHeaderScrolled() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const SHOW_AT = 80;
    const HIDE_AT = 40;

    let frame = 0;
    // Mirrors `scrolled` outside React so the rAF callback can read the current
    // value without the effect depending on it — a dependency there would tear
    // the listener down and rebuild it on every toggle.
    let visible = false;

    const measure = () => {
      frame = 0;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const next = visible ? y > HIDE_AT : y > SHOW_AT;
      // Scroll fires far more often than the screen refreshes and nearly every
      // one reads the same answer; only touching state on a real change keeps
      // React out of the scroll path.
      if (next !== visible) {
        visible = next;
        setScrolled(next);
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure(); // a reload part-way down the page must not start transparent
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return scrolled;
}
