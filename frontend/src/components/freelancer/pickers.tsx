import { useEffect, useMemo, useRef, useState, type InputHTMLAttributes } from "react";
import { Check, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { COUNTRIES, LANGUAGES } from "@/lib/referenceData";
import {
  searchSkills,
  createSkill,
  SKILL_LEVELS,
  LANGUAGE_LEVELS,
  type CatalogSkill,
  type ProfileLanguage,
  type ProfileSkill,
  type SkillLevel,
  type SpecializationGroup,
} from "@/lib/freelancerApi";

/*
 * Field-level building blocks for freelancer data, shared by the onboarding
 * wizard and the profile page's section editor.
 *
 * They live here rather than inside either screen because both edit the same
 * fields, and the last time this logic was duplicated across two account menus
 * the copies drifted (see the note in Header.tsx).
 */

export const inputClass =
  "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#1A73E8] transition-colors";
export const labelClass = "text-xs text-white/60 mb-1.5 block";

/* Date and month fields.

   `color-scheme: dark` is the whole point. A native <input type="month"> is
   painted by the browser, not by us: on a light color-scheme it draws a white
   calendar icon and a white picker panel, which is what sat glowing on these
   dark dialogs. Telling the control it lives on a dark surface makes the
   browser render its own furniture to match — one declaration instead of
   inverting the icon with a filter and still getting a white dropdown.

   The min-width matters too: an empty month field renders as "--------- ----"
   plus the icon, which needs about 150px. Below that the browser clips it, and
   in a half-width grid cell it overlapped whatever sat beside it. */
export const dateInputClass = `${inputClass} [color-scheme:dark] min-w-[150px]`;

/* A labelled date cell. The fields carried only an aria-label, so on screen two
   identical empty boxes sat side by side with nothing saying which was the start
   and which the end. */
export function DateField({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1 min-w-0">
      <span className="text-[11px] uppercase tracking-[0.08em] text-white/40">{label}</span>
      <input type="month" className={dateInputClass} aria-label={label} {...props} />
    </label>
  );
}

const ACCENT = "#1A73E8";

/* ══════════════════════ country ══════════════════════ */

export function CountryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      options={COUNTRIES}
      placeholder="Select a country"
      ariaLabel="Country"
    />
  );
}

/* ══════════════════════ languages ══════════════════════ */

/**
 * Name + proficiency rows.
 *
 * The name field is a SearchableSelect rather than a text input with a datalist:
 * the old datalist rendered every language as one long native popup with no way
 * to narrow it down.
 */
export function LanguagesEditor({
  languages,
  onChange,
  max = 15,
}: {
  languages: ProfileLanguage[];
  onChange: (next: ProfileLanguage[]) => void;
  max?: number;
}) {
  // A language already chosen is dropped from the other rows' options, so the
  // same one can't be added twice at two different levels.
  const optionsFor = (index: number) => {
    const taken = new Set(
      languages.filter((_, i) => i !== index).map((l) => l.name.toLowerCase())
    );
    return LANGUAGES.filter((l) => !taken.has(l.toLowerCase()));
  };

  return (
    <div>
      {languages.length > 0 && (
        <div className="space-y-2 mb-2">
          {languages.map((lang, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <SearchableSelect
                  value={lang.name}
                  onChange={(name) =>
                    onChange(languages.map((l, i) => (i === index ? { ...l, name } : l)))
                  }
                  options={optionsFor(index)}
                  placeholder="Select a language"
                  ariaLabel="Language"
                />
              </div>
              <select
                value={lang.level}
                onChange={(e) =>
                  onChange(
                    languages.map((l, i) =>
                      i === index ? { ...l, level: e.target.value as any } : l
                    )
                  )
                }
                className="rounded-lg bg-white/5 border border-white/10 px-2 py-2.5 text-xs text-white outline-none focus:border-[#1A73E8] shrink-0"
                aria-label="Proficiency"
              >
                {LANGUAGE_LEVELS.map((l) => (
                  <option key={l.value} value={l.value} className="bg-[#0B0F17]">
                    {l.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onChange(languages.filter((_, i) => i !== index))}
                className="text-white/40 hover:text-red-400 transition-colors shrink-0 mt-2.5"
                aria-label="Remove language"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {languages.length < max && (
        <button
          type="button"
          onClick={() => onChange([...languages, { name: "", level: "conversational" }])}
          className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add a language
        </button>
      )}
    </div>
  );
}

/* ══════════════════════ skills ══════════════════════ */

/**
 * Type-to-search skill picker.
 *
 * Typing "c++" must offer "C++" as a selectable row rather than being stored as
 * whatever was typed. Free text is only reachable through the explicit "Add …"
 * row, which creates a real catalog entry first — so every skill on a profile is
 * a slug that something else can be searched by.
 */
export function SkillsPicker({
  selected,
  onChange,
  token,
}: {
  selected: ProfileSkill[];
  onChange: (next: ProfileSkill[]) => void;
  token: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogSkill[]>([]);
  const [exactMatch, setExactMatch] = useState(true);
  // Whether this query could be added as a new skill at all — false for input
  // the server would reject (all punctuation, too short).
  const [creatable, setCreatable] = useState(false);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  // Guards against an earlier, slower request overwriting a later one's results —
  // the classic autocomplete flicker where the list snaps back to matches for a
  // prefix you've already typed past.
  const requestSeq = useRef(0);

  const selectedSlugs = useMemo(() => new Set(selected.map((s) => s.slug)), [selected]);

  useEffect(() => {
    const seq = ++requestSeq.current;
    const trimmed = query.trim();

    setSearching(true);
    // 220ms: long enough to skip most intermediate keystrokes, short enough that
    // the list feels attached to the typing.
    const timer = window.setTimeout(async () => {
      const res = await searchSkills(trimmed, 12, token);
      if (seq !== requestSeq.current) return;

      setSearching(false);
      if (res.ok) {
        setResults(res.data.skills || []);
        setExactMatch(trimmed ? !!res.data.exactMatch : true);
        setCreatable(trimmed ? res.data.creatable !== false : false);
        setHighlight(0);
      } else {
        setResults([]);
        setCreatable(false);
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [query, token]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const add = (skill: CatalogSkill) => {
    if (selectedSlugs.has(skill.slug)) {
      // Already on the list — clearing the box is the useful feedback here, since
      // re-adding would silently do nothing.
      setQuery("");
      return;
    }
    if (selected.length >= 30) {
      setError("30 skills is the maximum.");
      return;
    }
    onChange([
      ...selected,
      { skillId: skill._id ?? null, name: skill.name, slug: skill.slug, level: "intermediate" },
    ]);
    setQuery("");
    setError(null);
  };

  // Only reachable from the "Add <query>" row, i.e. when the catalog has no exact
  // match. Creates the catalog row, then selects it.
  const addCustom = async () => {
    const name = query.trim();
    if (name.length < 2) return;

    setCreating(true);
    setError(null);
    const res = await createSkill(name, token);
    setCreating(false);

    if (!res.ok) {
      setError(res.message);
      return;
    }
    add(res.data.skill);
  };

  const setLevel = (slug: string, level: SkillLevel) => {
    onChange(selected.map((s) => (s.slug === slug ? { ...s, level } : s)));
  };

  const remove = (slug: string) => onChange(selected.filter((s) => s.slug !== slug));

  const visible = results.filter((r) => !selectedSlugs.has(r.slug));
  const canCreate =
    !!query.trim() && query.trim().length >= 2 && creatable && !exactMatch && !searching;
  // The create row sits at the end of the list and is keyboard-reachable like any
  // other option.
  const optionCount = visible.length + (canCreate ? 1 : 0);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (optionCount ? (h + 1) % optionCount : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (optionCount ? (h - 1 + optionCount) % optionCount : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight < visible.length) add(visible[highlight]);
      else if (canCreate) addCustom();
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && !query && selected.length) {
      // Matches how every other chip input behaves.
      remove(selected[selected.length - 1].slug);
    }
  };

  return (
    <div>
      <div ref={wrapRef} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Try “c++”, “react”, “figma”, “seo”…"
          className={`${inputClass} pl-9 pr-9`}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 animate-spin" />
        )}

        {open && (
          <div
            className="absolute z-30 left-0 right-0 mt-1.5 rounded-xl border border-white/10 overflow-hidden shadow-2xl"
            style={{ background: "#0D1017", maxHeight: 260, overflowY: "auto" }}
            role="listbox"
          >
            {!query.trim() && visible.length > 0 && (
              <p className="px-3 pt-2.5 pb-1 text-[10px] uppercase tracking-wide text-white/35">
                Popular on Tokun
              </p>
            )}

            {visible.map((skill, i) => (
              <button
                key={skill.slug}
                type="button"
                role="option"
                aria-selected={i === highlight}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => add(skill)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors"
                style={{ background: i === highlight ? "rgba(255,255,255,0.07)" : "transparent" }}
              >
                <span className="text-sm text-white truncate">{skill.name}</span>
                {skill.group && (
                  <span className="text-[10px] text-white/35 shrink-0">{skill.group}</span>
                )}
              </button>
            ))}

            {canCreate && (
              <button
                type="button"
                role="option"
                aria-selected={highlight === visible.length}
                onMouseEnter={() => setHighlight(visible.length)}
                onClick={addCustom}
                disabled={creating}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left border-t border-white/10 disabled:opacity-60"
                style={{
                  background:
                    highlight === visible.length ? "rgba(255,255,255,0.07)" : "transparent",
                }}
              >
                {creating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white/60" />
                ) : (
                  <Plus className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                )}
                <span className="text-sm text-white/80">
                  Add “<span className="text-white font-medium">{query.trim()}</span>” as a new skill
                </span>
              </button>
            )}

            {!visible.length && !canCreate && !searching && (
              <p className="px-3 py-4 text-sm text-white/40">
                {query.trim() ? "Nothing matched — try a shorter word." : "No suggestions yet."}
              </p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-[11px] text-red-400 mt-2">{error}</p>}

      {selected.length > 0 ? (
        <div className="mt-3 space-y-2">
          {selected.map((skill) => (
            <div
              key={skill.slug}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
            >
              <span className="text-sm text-white flex-1 truncate">{skill.name}</span>
              <select
                value={skill.level}
                onChange={(e) => setLevel(skill.slug, e.target.value as SkillLevel)}
                className="rounded-md bg-white/5 border border-white/10 px-2 py-1 text-xs text-white outline-none focus:border-[#1A73E8]"
                aria-label={`${skill.name} level`}
              >
                {SKILL_LEVELS.map((l) => (
                  <option key={l.value} value={l.value} className="bg-[#0B0F17]">
                    {l.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => remove(skill.slug)}
                className="text-white/40 hover:text-red-400 transition-colors shrink-0"
                aria-label={`Remove ${skill.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <p className="text-[11px] text-white/35">
            {selected.length} skill{selected.length === 1 ? "" : "s"} · buyers can filter by these
          </p>
        </div>
      ) : (
        <p className="mt-3 text-[11px] text-white/35">
          Nothing added yet. Pick from the list so your skills stay searchable.
        </p>
      )}
    </div>
  );
}

/* ══════════════════════ specializations ══════════════════════ */

/** Grouped multi-select, capped at 8. */
export function SpecializationsPicker({
  groups,
  selectedIds,
  onChange,
}: {
  groups: SpecializationGroup[];
  selectedIds: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="space-y-5">
      {groups.length === 0 && <p className="text-sm text-white/40">Loading specializations…</p>}

      {groups.map((group) => (
        <div key={group.group}>
          <p className="text-[10px] uppercase tracking-wide text-white/35 mb-2">{group.group}</p>
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => {
              const active = selectedIds.includes(item._id);
              const atLimit = !active && selectedIds.length >= 8;

              return (
                <button
                  key={item._id}
                  type="button"
                  disabled={atLimit}
                  title={atLimit ? "8 specializations is the maximum" : item.description}
                  onClick={() =>
                    onChange(
                      active
                        ? selectedIds.filter((id) => id !== item._id)
                        : [...selectedIds, item._id]
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: active ? "rgba(26,115,232,0.16)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? ACCENT : "rgba(255,255,255,0.10)"}`,
                    color: active ? "#fff" : "rgba(255,255,255,0.72)",
                  }}
                  aria-pressed={active}
                >
                  {active && <Check className="w-3 h-3" />}
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedIds.length > 0 && (
        <p className="text-[11px] text-white/35">{selectedIds.length} of 8 selected</p>
      )}
    </div>
  );
}

/* ══════════════════════ repeatable rows ══════════════════════ */

/** One shell for experience / education / certifications — only the fields differ. */
export function RepeatableRows<T>({
  items,
  onChange,
  blank,
  addLabel,
  renderRow,
  max = 15,
  emptyHint,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  blank: () => T;
  addLabel: string;
  renderRow: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  max?: number;
  emptyHint: string;
}) {
  return (
    <div>
      {items.length === 0 ? (
        <p className="text-[11px] text-white/35 mb-3">{emptyHint}</p>
      ) : (
        <div className="space-y-3 mb-3">
          {items.map((item, index) => (
            <div key={index} className="rounded-lg border border-white/10 bg-black/20 p-3 relative">
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="absolute top-2 right-2 text-white/35 hover:text-red-400 transition-colors"
                aria-label="Remove entry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {renderRow(item, (p) =>
                onChange(items.map((it, i) => (i === index ? { ...it, ...p } : it)))
              )}
            </div>
          ))}
        </div>
      )}

      {items.length < max && (
        <button
          type="button"
          onClick={() => onChange([...items, blank()])}
          className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {addLabel}
        </button>
      )}
    </div>
  );
}
