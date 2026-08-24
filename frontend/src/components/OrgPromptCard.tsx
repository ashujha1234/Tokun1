import type { ReactNode } from "react";
import PromptThumb from "@/components/PromptThumb";
import { mediaUrl } from "@/lib/mediaUrl";

/**
 * One prompt row on the org dashboard — shared with the team, or requested by a
 * member.
 *
 * Both panels used to print a bare title and a name ("demo / by Pepsi"), which
 * told the owner nothing about what the prompt actually is. This gives them the
 * same shape they already recognise from the marketplace: thumbnail, title,
 * category and price.
 *
 * Kept generic (`meta` + `action`) so the three panels stay visually identical
 * while saying different things underneath.
 *
 * The whole row is the click target when `onOpen` is given, because that is how
 * a prompt behaves everywhere else in the product — in the marketplace, in
 * Saved, in Notifications, you click the card and the product panel opens. Here
 * the only way in was a "View & buy" button on the requests panel, and the other
 * two rows didn't open at all: the owner could see that something had been
 * shared or bought without ever being able to look at it.
 */
export default function OrgPromptCard({
  title,
  thumbnail,
  category,
  price,
  isFree,
  deleted,
  meta,
  note,
  action,
  onOpen,
}: {
  title: string;
  thumbnail?: string | null;
  category?: string | null;
  price?: number;
  isFree?: boolean;
  deleted?: boolean;
  /** Small line under the title — who shared/requested it and when. */
  meta?: ReactNode;
  /** Optional free-text the member wrote with their request. */
  note?: string | null;
  /** Buttons on the right. */
  action?: ReactNode;
  /** Opens the product panel. Omitted when there's no product left to open. */
  onOpen?: () => void;
}) {
  return (
    <div
      onClick={onOpen}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={
        onOpen
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen();
              }
            }
          : undefined
      }
      className={`flex items-center gap-4 px-5 py-4 bg-white/[0.02] ${
        onOpen ? "cursor-pointer transition-colors hover:bg-white/[0.06]" : ""
      }`}
    >
      <PromptThumb src={mediaUrl(thumbnail || "")} alt={title} className="w-12 h-12" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-white truncate">{title}</span>
          {category && (
            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/50">
              {category}
            </span>
          )}
          {/* The prompt can be removed from the marketplace after it was shared
              or requested — say so rather than showing a dead row. */}
          {deleted && (
            <span className="shrink-0 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-red-300/80">
              Removed
            </span>
          )}
        </div>

        {meta && <div className="mt-1 text-xs text-white/45 truncate">{meta}</div>}

        {note && (
          <div className="mt-1 text-xs italic text-white/55 truncate max-w-[420px]">
            "{note}"
          </div>
        )}
      </div>

      {/* The row itself opens the panel, so a button inside it must not also
          fire that — its own handler is the more specific one. */}
      <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
        {isFree ? (
          <span className="text-xs font-medium text-emerald-400">Free</span>
        ) : (
          price != null &&
          price > 0 && (
            <span className="text-sm font-semibold text-white/85">
              ₹{Number(price).toLocaleString("en-IN")}
            </span>
          )
        )}
        {action}
      </div>
    </div>
  );
}
