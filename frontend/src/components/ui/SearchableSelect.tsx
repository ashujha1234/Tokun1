import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";

/*
 * A compact combobox: closed it's just a field, open it drops a searchable,
 * scrolling list directly beneath.
 *
 * Replaces the `<input list>` + `<datalist>` pairs this app used for country and
 * language. A datalist renders the whole option set as one long native popup
 * with no way to narrow it — with ~200 countries that's a wall of text you have
 * to scroll past, and the styling can't be controlled at all.
 *
 * Behaviour worth keeping:
 *  - `allowCustom` lets a value that isn't in the list still be accepted, which
 *    matters because no country or language list we ship covers everyone.
 *  - The panel is capped and scrolls internally, so a long list never pushes the
 *    rest of the form down the page.
 *  - It is rendered in a portal and positioned `fixed`, so no scrolling or
 *    `overflow-hidden` ancestor can clip it — see the note on `placement`.
 *  - Filtering is prefix-first: typing "in" offers India before Argentina, even
 *    though both contain "in".
 */

export interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  /** Accept a typed value that isn't in `options`. Default true. */
  allowCustom?: boolean;
  disabled?: boolean;
  /** Shown above the list before anything is typed. */
  hint?: string;
  className?: string;
  ariaLabel?: string;
}

/** Height of the panel's search row, excluded from the list's own budget. */
const SEARCH_ROW = 46;
/** Never taller than this, however much room there is. */
const LIST_MAX = 220;
/** Never shorter than this — below ~3 rows the list stops being usable. */
const MIN_LIST = 132;

const FIELD_CLASS =
  "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#1A73E8] transition-colors";

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  allowCustom = true,
  disabled = false,
  hint,
  className = "",
  ariaLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* Where the panel goes: above or below the field, how wide, and how tall the
     list may be.

     THE PANEL IS RENDERED IN A PORTAL, POSITIONED `fixed`. That is the whole
     reason the Languages list stopped being cut off at the bottom.

     It used to be an `absolute` child of the field. Every dialog this component
     appears in scrolls its own body (`p-6 overflow-y-auto`) inside a card that
     is `overflow-hidden` — and an absolutely-positioned child is clipped by any
     scrolling or hidden ancestor, no matter how much room the window has. So on
     the last field of a step the list was sliced off at the edge of the card:
     the rows were there, drawn, and unreachable.

     A fixed element in a portal has no such ancestor — the viewport is the only
     thing that can clip it, which is exactly what `measure` below accounts for.
     (The marketplace's category rail solves the identical problem the same way;
     see the note on the hover panel in PromptMarketplacePage.) */
  const [placement, setPlacement] = useState<{
    dropUp: boolean;
    listMax: number;
    left: number;
    top: number;
    bottom: number;
    width: number;
  } | null>(null);

  const measure = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Gap left for the window's own edge, so the panel never touches it.
    const below = window.innerHeight - r.bottom - 16;
    const above = r.top - 16;

    // Flips only when the other side is genuinely roomier — not on a few pixels,
    // which would make the panel jump sides as the page scrolls.
    const dropUp = below < SEARCH_ROW + MIN_LIST && above > below;
    const room = (dropUp ? above : below) - SEARCH_ROW;

    setPlacement({
      dropUp,
      listMax: Math.max(MIN_LIST, Math.min(LIST_MAX, room)),
      /* Viewport coordinates, because the panel is `fixed`. Width is copied from
         the field so the two still line up — a portalled panel can't inherit it
         from `left-0 right-0` any more. */
      left: r.left,
      top: r.bottom + 6,
      bottom: window.innerHeight - r.top + 6,
      width: r.width,
    });
  }, []);

  useEffect(() => {
    if (!open) {
      // Dropped so a stale rect can't flash the panel in the wrong place on the
      // next open — measure() fills it in again before anything is drawn.
      setPlacement(null);
      return;
    }

    setQuery("");
    setHighlight(0);
    measure();

    /* Focus lands in the search box, not the trigger, so opening and typing is
       one motion. Deferred a frame: measure() above is what causes the panel to
       render at all, so the input this is reaching for does not exist yet on
       this pass. */
    const frame = requestAnimationFrame(() => searchRef.current?.focus());

    /* Capture phase: the element that scrolls is the dialog body, and a scroll
       event on it does not bubble to window. The panel is `fixed`, so if the
       field moves under it and this doesn't re-run, the two come apart. */
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open, measure]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // Both, because the panel is portalled to <body> and so is NOT inside
      // wrapRef any more — testing the wrapper alone would treat every click on
      // an option as a click outside and close the list before it registered.
      if (wrapRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;

    // Prefix matches first, then substring — so "in" gives India before
    // Argentina, and "ge" gives Germany before Nigeria.
    const prefix: string[] = [];
    const contains: string[] = [];
    for (const option of options) {
      const lower = option.toLowerCase();
      if (lower.startsWith(q)) prefix.push(option);
      else if (lower.includes(q)) contains.push(option);
    }
    return [...prefix, ...contains];
  }, [options, query]);

  const typed = query.trim();
  // Offer the typed value only when it isn't already an exact option — otherwise
  // the same string appears twice in the list.
  const canUseCustom =
    allowCustom &&
    typed.length > 0 &&
    !options.some((o) => o.toLowerCase() === typed.toLowerCase());

  const rowCount = filtered.length + (canUseCustom ? 1 : 0);

  const commit = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (rowCount ? (h + 1) % rowCount : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (rowCount ? (h - 1 + rowCount) % rowCount : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight < filtered.length) commit(filtered[highlight]);
      else if (canUseCustom) commit(typed);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {/* Trigger — reads as the field itself, not as a button next to one. */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`${FIELD_CLASS} flex items-center justify-between gap-2 text-left disabled:opacity-50`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span className={value ? "text-white truncate" : "text-white/30 truncate"}>
          {value || placeholder}
        </span>
        {/* Chevron alone. There was a ✕ beside it that emptied the field, and it
            was the wrong control on every field that uses this: country and city
            are required-ish single choices you replace rather than blank, and it
            sat close enough to the chevron that reaching for the list cleared the
            answer instead. Replacing a value is what the list is for — open it
            and pick another. */}
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && placement && createPortal(
        <div
          ref={panelRef}
          /* z-index above the dialogs this opens inside (they sit at z-[9999]),
             because in a portal it is a sibling of them rather than a
             descendant — the field's own stacking context no longer carries it
             along. */
          className="fixed z-[10000] rounded-xl border border-white/10 overflow-hidden shadow-2xl"
          style={{
            background: "#0D1017",
            left: placement.left,
            width: placement.width,
            ...(placement.dropUp
              ? { bottom: placement.bottom }
              : { top: placement.top }),
          }}
        >
          <div className="relative border-b border-white/8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/35 pointer-events-none" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlight(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Type to search…"
              className="w-full bg-transparent pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none"
            />
          </div>

          {/* Capped to the room measured beside the field, so a 200-item list can
              neither push the page around nor run off the end of a dialog. */}
          <div style={{ maxHeight: placement.listMax, overflowY: "auto" }} role="listbox">
            {hint && !query && (
              <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wide text-white/30">
                {hint}
              </p>
            )}

            {filtered.map((option, i) => {
              const selected = option === value;
              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => commit(option)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-sm text-white transition-colors"
                  style={{
                    background: i === highlight ? "rgba(255,255,255,0.07)" : "transparent",
                  }}
                >
                  <span className="truncate">{option}</span>
                  {selected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "#19E66C" }} />}
                </button>
              );
            })}

            {canUseCustom && (
              <button
                type="button"
                role="option"
                aria-selected={highlight === filtered.length}
                onMouseEnter={() => setHighlight(filtered.length)}
                onClick={() => commit(typed)}
                className="w-full px-3 py-2 text-left text-sm text-white/80 border-t border-white/10 transition-colors"
                style={{
                  background:
                    highlight === filtered.length ? "rgba(255,255,255,0.07)" : "transparent",
                }}
              >
                Use “<span className="text-white font-medium">{typed}</span>”
              </button>
            )}

            {rowCount === 0 && (
              <p className="px-3 py-4 text-sm text-white/40">No matches.</p>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
