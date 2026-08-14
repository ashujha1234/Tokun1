import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Tag as TagIcon, X } from "lucide-react";
import { ALL_PROMPT_TAGS, sameTag, searchPromptTags, tagGroup } from "@/lib/promptTags";

/**
 * Type-to-search tag input for the prompt upload form.
 *
 * Built to behave like the freelancer SkillsPicker, because it is the same
 * job: a long controlled vocabulary that has to stay searchable. What was here
 * before was a bare text box plus five hardcoded design words, so a seller
 * listing anything else guessed at spelling and their tag matched nothing.
 *
 * Free text is still reachable through the explicit "Add …" row — the catalog
 * is a well-trodden path, not a fence.
 */
export default function TagPicker({
  tags,
  onChange,
  max = 5,
  inputClassName = "",
}: {
  tags: string[];
  onChange: (next: string[]) => void;
  max?: number;
  /** The form's own field styling, so this input matches the ones around it. */
  inputClassName?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* The list is portalled to <body> and positioned in viewport coordinates.
     Inline it would be clipped: this field sits inside the upload dialog's
     scrolling body, and an absolutely positioned panel can't escape that box —
     the suggestions were cut off exactly when the field was near the bottom,
     which is where it usually is. */
  const [rect, setRect] = useState<
    { left: number; top: number; width: number; maxHeight: number } | null
  >(null);

  const measure = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom - 12;
    const above = r.top - 12;

    // Opens upward when there isn't room underneath — on a phone this field is
    // often the last thing above the keyboard.
    const flip = below < 180 && above > below;
    const maxHeight = Math.min(260, Math.max(140, flip ? above : below));

    setRect({
      left: r.left,
      top: flip ? r.top - 6 - maxHeight : r.bottom + 6,
      width: r.width,
      maxHeight,
    });
  }, []);

  const full = tags.length >= max;

  const suggestions = useMemo(
    () => (full ? [] : searchPromptTags(query, tags)),
    [query, tags, full]
  );

  /* An exact catalog hit is already offered as a normal row, so the "Add …"
     row only appears for something genuinely new — otherwise every query would
     end with a redundant "Add Logo" under "Logo". */
  const trimmed = query.trim();
  const canCreate =
    !full &&
    trimmed.length >= 2 &&
    !ALL_PROMPT_TAGS.some((t) => sameTag(t, trimmed)) &&
    !tags.some((t) => sameTag(t, trimmed));

  const optionCount = suggestions.length + (canCreate ? 1 : 0);

  useEffect(() => setHighlight(0), [query]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // The list is a portal, so it is NOT inside wrapRef — without checking it
      // too, clicking a suggestion would close the list before it registered.
      if (wrapRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    measure();
    // Capture phase: the dialog body is the element that scrolls, and a scroll
    // event on it doesn't bubble to window.
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open, measure]);

  const add = (tag: string) => {
    const value = tag.trim();
    if (!value || tags.length >= max) return;
    // Case-insensitive, so "ui design" can't be added next to "UI Design".
    if (tags.some((t) => sameTag(t, value))) {
      setQuery("");
      return;
    }
    onChange([...tags, value]);
    setQuery("");
  };

  const remove = (tag: string) => onChange(tags.filter((t) => t !== tag));

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // Never lets the picker submit the surrounding upload form.
      e.preventDefault();
      if (!open) return;
      if (highlight < suggestions.length) add(suggestions[highlight]);
      else if (canCreate) add(trimmed);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (optionCount ? (h + 1) % optionCount : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (optionCount ? (h - 1 + optionCount) % optionCount : 0));
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && !query && tags.length) {
      remove(tags[tags.length - 1]);
    }
  };

  return (
    <div>
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] border border-white/10 px-3 py-1 text-[13px] text-white"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                aria-label={`Remove ${tag}`}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div ref={wrapRef} className="relative">
        <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          disabled={full}
          placeholder={
            full
              ? `${max} tags is the maximum — remove one to add another`
              : "Start typing — “logo”, “seo”, “portrait”, “resume”…"
          }
          className={`${inputClassName} pl-9`}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />

      </div>

      <p className="mt-2 text-[11px] text-white/40">
        {tags.length}/{max} tags · buyers search by these, so pick the words they'd type.
      </p>

      {open &&
        !full &&
        rect &&
        createPortal(
          <div
            ref={listRef}
            className="rounded-xl border border-white/10 overflow-hidden shadow-2xl"
            /* z above the upload dialog (1100), the same rung the category
               dropdowns in this form already use. */
            style={{
              position: "fixed",
              left: rect.left,
              top: rect.top,
              width: rect.width,
              background: "#131419",
              maxHeight: rect.maxHeight,
              overflowY: "auto",
              zIndex: 1200,
            }}
            role="listbox"
          >
            {!trimmed && suggestions.length > 0 && (
              <p className="px-3 pt-2.5 pb-1 text-[10px] uppercase tracking-wide text-white/35">
                Popular tags
              </p>
            )}

            {suggestions.map((tag, i) => (
              <button
                key={tag}
                type="button"
                role="option"
                aria-selected={i === highlight}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => add(tag)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors"
                style={{ background: i === highlight ? "rgba(255,255,255,0.07)" : "transparent" }}
              >
                <span className="text-sm text-white truncate">{tag}</span>
                {/* Where the tag sits in the catalog — the thing that keeps a
                    list this long readable while you scan it. */}
                <span className="text-[10px] text-white/35 shrink-0">{tagGroup(tag)}</span>
              </button>
            ))}

            {canCreate && (
              <button
                type="button"
                role="option"
                aria-selected={highlight === suggestions.length}
                onMouseEnter={() => setHighlight(suggestions.length)}
                onClick={() => add(trimmed)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left border-t border-white/10"
                style={{
                  background:
                    highlight === suggestions.length ? "rgba(255,255,255,0.07)" : "transparent",
                }}
              >
                <Plus className="w-3.5 h-3.5" style={{ color: "#1A73E8" }} />
                <span className="text-sm text-white/80">
                  Add “<span className="text-white font-medium">{trimmed}</span>” as a new tag
                </span>
              </button>
            )}

            {!suggestions.length && !canCreate && (
              <p className="px-3 py-4 text-sm text-white/40">
                {trimmed ? "Nothing matched — try a shorter word." : "No suggestions left."}
              </p>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
