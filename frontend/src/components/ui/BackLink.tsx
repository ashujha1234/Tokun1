import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

/**
 * The "Back" control, once.
 *
 * It was hand-written at every call site and no two agreed. Across the auth
 * pages and the admin screens there were three different colours (white/90,
 * white/70, white/45), two icon sizes (w-5 and w-4), a font stack pinned inline
 * on some and inherited on others, and hover styling on roughly half of them —
 * so the same control looked like a different thing depending which screen you
 * had reached it from, and one of them was a `<button>` while the rest were
 * links.
 *
 * `to` decides which it is, and that is a real distinction rather than a style
 * choice:
 *   - given    → a Link to a KNOWN place ("back to sign in"), which behaves like
 *                a link should: middle-click, open in a new tab, and it points
 *                somewhere sensible even when the page was opened from a URL
 *                with no history behind it.
 *   - omitted  → navigate(-1), for screens whose "back" is genuinely wherever
 *                you came from.
 *
 * `fallbackTo` is the third case, and it exists because of a real bug: the login
 * and signup screens both hard-coded `to="/"`. Reach /login from /about and
 * "Back" took you to the landing page — a place you had never been — and your
 * actual page was gone. Plain navigate(-1) fixes that but breaks the other
 * entry: someone opening /login from a bookmark or an email has no history to
 * go back to, and -1 walks them out of the site.
 *
 * So: step back if there IS a step, otherwise go to the named fallback.
 * `location.key` is React Router's own answer to "is this the first entry in
 * this session?" — it is the literal string "default" only for the very first
 * location, which is exactly the case where -1 must not be used.
 */
export default function BackLink({
  to,
  fallbackTo,
  label = "Back",
  className = "",
}: {
  /** Where back goes. Omit for "wherever you came from". */
  to?: string;
  /** Go back if there's history, else here. Ignored when `to` is given. */
  fallbackTo?: string;
  label?: string;
  className?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const shared =
    "inline-flex items-center gap-2 text-[15px] text-white/90 hover:text-white transition-colors";

  const content = (
    <>
      <ArrowLeft className="w-5 h-5 shrink-0" />
      <span>{label}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`${shared} ${className}`}>
        {content}
      </Link>
    );
  }

  /* Kept as a Link when there's a fallback, so it still opens in a new tab and
     shows a URL on hover. The click handler is what makes it "back" when there
     is somewhere to go back to; the href is what it means when there isn't. */
  if (fallbackTo) {
    return (
      <Link
        to={fallbackTo}
        className={`${shared} ${className}`}
        onClick={(e) => {
          // Leave modified clicks alone — cmd/ctrl/middle-click means "new tab",
          // and hijacking those is how a link stops behaving like a link.
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          if (location.key === "default") return; // no history — let the href win
          e.preventDefault();
          navigate(-1);
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => navigate(-1)} className={`${shared} ${className}`}>
      {content}
    </button>
  );
}
