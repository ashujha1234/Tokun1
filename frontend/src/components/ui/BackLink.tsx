import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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
 */
export default function BackLink({
  to,
  label = "Back",
  className = "",
}: {
  /** Where back goes. Omit for "wherever you came from". */
  to?: string;
  label?: string;
  className?: string;
}) {
  const navigate = useNavigate();

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

  return (
    <button type="button" onClick={() => navigate(-1)} className={`${shared} ${className}`}>
      {content}
    </button>
  );
}
