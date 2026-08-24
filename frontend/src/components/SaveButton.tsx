/**
 * One save button, for everything that can be saved.
 *
 * There were three: a 42px circle with a PNG in the product panel, a 38px
 * circle with a lucide bookmark in Smartgen, and nothing at all on a creator
 * card. Same action, three shapes, and two of them unlabelled — a circle with an
 * icon in it is a guess until you hover it and read the tooltip.
 *
 * This one says "Save", and says "Saved" once it is. The animation (see
 * SaveButton.css) is the gradient tile growing to swallow the label, which is
 * also what makes the label affordable in a tight row: it costs 100px at rest
 * and folds away the moment you reach for it.
 */

import { Bookmark, Loader2 } from "lucide-react";
import "./SaveButton.css";

export default function SaveButton({
  saved,
  busy = false,
  disabled = false,
  size = "md",
  label = "Save",
  savedLabel = "Saved",
  onClick,
  className = "",
}: {
  saved: boolean;
  /** A save or unsave is in flight. */
  busy?: boolean;
  disabled?: boolean;
  /** "sm" runs the same animation at card scale — see .save-btn--sm. */
  size?: "sm" | "md";
  label?: string;
  savedLabel?: string;
  onClick: () => void;
  className?: string;
}) {
  const iconPx = size === "sm" ? 11 : 15;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      /* The state is on the element rather than in a class name so the CSS can
         key the saved colour off it, and so assistive tech and the tooltip agree
         with what the tile is showing. */
      data-saved={saved ? "true" : "false"}
      aria-pressed={saved}
      title={saved ? "Remove from saved" : "Save to your collection"}
      className={`save-btn ${size === "sm" ? "save-btn--sm" : ""} ${className}`}
    >
      <span className="save-btn__icon">
        {busy ? (
          <Loader2 size={iconPx} color="#fff" className="animate-spin" />
        ) : (
          <Bookmark size={iconPx} color="#fff" fill={saved ? "#fff" : "none"} />
        )}
      </span>
      <span className="save-btn__text">{saved ? savedLabel : label}</span>
    </button>
  );
}
