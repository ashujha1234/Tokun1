import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

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
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    // Focus lands in the search box, not the trigger, so opening and typing is
    // one motion.
    searchRef.current?.focus();
    setQuery("");
    setHighlight(0);
  }, [open]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
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
        <span className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear"
              onClick={(e) => {
                // Stops the trigger's own onClick from reopening the panel.
                e.stopPropagation();
                onChange("");
              }}
              className="text-white/35 hover:text-white/80 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <div
          className="absolute z-30 left-0 right-0 mt-1.5 rounded-xl border border-white/10 overflow-hidden shadow-2xl"
          style={{ background: "#0D1017" }}
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

          {/* Capped so a 200-item list can never push the page around. */}
          <div style={{ maxHeight: 220, overflowY: "auto" }} role="listbox">
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
        </div>
      )}
    </div>
  );
}
