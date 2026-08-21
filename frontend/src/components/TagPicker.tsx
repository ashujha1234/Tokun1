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

  /* Nothing until something is typed.

     Focusing the field used to drop the whole 24-tag catalog over the form —
     and what sits directly under this field is the attachment dropzone, a div
     whose onClick opens a file picker. A list that long, unasked for, covering
     a file trigger is how a click on "Photorealistic" ended up opening Finder.

     It was also the wrong list: "Popular tags" led with Photorealistic,
     Cinematic, Portrait — image words — to a seller who might be listing an SEO
     or a coding prompt. Suggestions are only useful once there's something to
     match against. */
  const suggestions = useMemo(
    () => (full || !query.trim() ? [] : searchPromptTags(query, tags)),
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

  /* Keep the arrow-key selection inside the visible window.
     A search can return 24 tags into roughly 260px of list, so pressing Down
     past the fifth moved the highlight onto a row that had scrolled out of
     sight — the selection was still correct and Enter still added the right
     tag, but there was nothing on screen saying so. `block: "nearest"` scrolls
     the list by the minimum needed and leaves it alone when the row is already
     visible, rather than jumping the highlight to the middle on every step. */
  useEffect(() => {
    if (!open) return;
    const row = listRef.current?.children?.[highlight] as HTMLElement | undefined;
    row?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

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

    /* Scrolling the SUGGESTION LIST doesn't move the input, so re-measuring on
       it is pointless — and because the capture-phase listener below sees every
       scroll in the document, including the list's own, it fired on each wheel
       tick and handed back a fresh rect object that re-rendered the list under
       the cursor. */
    const onScroll = (e: Event) => {
      const target = e.target as Node | null;
      if (target && listRef.current?.contains(target)) return;
      measure();
    };

    // Capture phase: the dialog body is the element that scrolls, and a scroll
    // event on it doesn't bubble to window.
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", measure);
    };
  }, [open, measure]);

  /* Lets the list scroll at all.
   *
   * The upload form is a Radix modal Dialog, and a modal Dialog wraps its
   * content in react-remove-scroll, which stops the page moving behind it by
   * listening for `wheel` and `touchmove` ON THE DOCUMENT and calling
   * preventDefault() for anything that didn't originate inside DialogContent.
   *
   * This list is portalled to <body> — deliberately, so it isn't clipped by the
   * dialog's scrolling body — which puts it outside that container. So the lock
   * classified every wheel tick over the suggestions as "the page trying to
   * scroll behind the modal" and cancelled it: the list had `overflow-y: auto`
   * and a maxHeight, a search can return up to 24 tags against ~260px of room,
   * and the ones past the fifth were simply unreachable with a mouse or a
   * finger. The keyboard's arrow keys worked the whole time, which is the same
   * tell as the pointer-events bug noted below — anything routed through the
   * pointer was being intercepted, anything else was fine.
   *
   * Those document listeners are on the BUBBLE phase, so stopping propagation
   * at the list is enough: the event never reaches them, nothing calls
   * preventDefault, and the browser scrolls the list natively. Registered on the
   * node directly rather than via onWheel — React attaches its own listeners at
   * the root container, which a <body> portal doesn't bubble through. Passive
   * false to match how the lock registers, so ordering is not left to chance. */
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const keepInside = (e: Event) => e.stopPropagation();
    el.addEventListener("wheel", keepInside, { passive: false });
    el.addEventListener("touchmove", keepInside, { passive: false });
    return () => {
      el.removeEventListener("wheel", keepInside);
      el.removeEventListener("touchmove", keepInside);
    };
    /* Every condition the list's own render is gated on, so the listener is
       attached the moment the node exists. `rect` because it only mounts once
       measured; `optionCount` because it also only mounts once there is
       something to show — typing the first matching letter brings the panel up
       without touching any of the others, and an effect that didn't watch it
       would leave that panel unscrollable. */
  }, [open, full, rect, optionCount]);

  /* Committing on mousedown fixed one bug and left a subtler one behind.
     mousedown tears this list down, and Chrome then dispatches the click on
     whatever the pointer has become — with the list gone, that is the
     attachment dropzone sitting directly beneath this field, a div whose
     onClick opens the OS file picker. Picking "Logo" opened Finder.

     So the picker swallows exactly one click, in the capture phase on window,
     right after it commits: nothing downstream ever sees the stray event. */
  const armedRef = useRef<((e: MouseEvent) => void) | null>(null);

  const disarm = useCallback(() => {
    if (!armedRef.current) return;
    window.removeEventListener("click", armedRef.current, true);
    armedRef.current = null;
  }, []);

  const swallowNextClick = useCallback(() => {
    disarm();
    const kill = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      disarm();
    };
    armedRef.current = kill;
    window.addEventListener("click", kill, true);
    // A mousedown doesn't always produce a click — drag off the row and none
    // arrives — so the trap is never left armed for the user's next real one.
    window.setTimeout(disarm, 400);
  }, [disarm]);

  useEffect(() => disarm, [disarm]);

  const add = (tag: string) => {
    const value = tag.trim();
    if (!value || tags.length >= max) return;
    setQuery("");
    /* The chip above the field is the whole confirmation. An empty list left
       hovering over the dropzone is just a lid over the next control. */
    setOpen(false);
    // Case-insensitive, so "ui design" can't be added next to "UI Design".
    if (tags.some((t) => sameTag(t, value))) return;
    onChange([...tags, value]);
  };

  /** Pointer path into `add` — commits before mouseup, then eats the click. */
  const pick = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    swallowNextClick();
    add(tag);
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

      {/* No panel unless there is something in it to pick.
       *
       * `optionCount` is the suggestions plus the "Add …" row. Without it the
       * list rendered whenever the field had focus, and since suggestions are
       * empty until something is typed (see the note on `suggestions`), simply
       * clicking into the field dropped a panel over the form saying "No
       * suggestions left." — an empty dropdown that answered a question nobody
       * had asked and covered the attachment dropzone directly beneath it. The
       * same panel came back on any query that matched nothing.
       *
       * That empty state is gone rather than reworded: a dropdown with no
       * options is not a dropdown. The field's own placeholder already says what
       * to type, and the chips above say what has been picked. */}
      {open &&
        !full &&
        rect &&
        optionCount > 0 &&
        createPortal(
          <div
            ref={listRef}
            className="rounded-xl border border-white/10 overflow-hidden shadow-2xl"
            /* Radix's modal Dialog parks `pointer-events: none` on <body> and
               re-enables it only inside DialogContent. This list is portalled to
               <body>, a sibling of the dialog — so it inherited "none", and a
               cursor click sailed straight THROUGH it into the attachment
               dropzone below, which is why the mouse selected nothing and the OS
               file picker opened instead. Keyboard Enter worked all along
               because it never consults pointer-events. */
            style={{
              position: "fixed",
              left: rect.left,
              top: rect.top,
              width: rect.width,
              background: "#131419",
              maxHeight: rect.maxHeight,
              overflowY: "auto",
              // z above the upload dialog (1100), the same rung the category
              // dropdowns in this form already use.
              zIndex: 1200,
              pointerEvents: "auto",
            }}
            /* Radix decides "clicked outside, dismiss" from a document-level
               pointerdown, and by DOM position this list IS outside the dialog.
               Without this, picking a tag would close the whole upload form. */
            onPointerDown={(e) => e.stopPropagation()}
            role="listbox"
          >
            {suggestions.map((tag, i) => (
              <button
                key={tag}
                type="button"
                role="option"
                aria-selected={i === highlight}
                onMouseEnter={() => setHighlight(i)}
                /* mousedown, not click: by the time a click arrives the input
                   may have blurred and this list unmounted. See `pick`. */
                onMouseDown={(e) => pick(e, tag)}
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
                onMouseDown={(e) => pick(e, trimmed)}
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

          </div>,
          document.body
        )}
    </div>
  );
}
