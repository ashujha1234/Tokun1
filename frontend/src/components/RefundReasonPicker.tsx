/**
 * The reason picker in the refund dialog.
 *
 * A component rather than the same JSX in two files: there are two refund
 * dialogs — components/PromptHistory.tsx and pages/self-dash.tsx — because the
 * purchased-prompts grid is duplicated across those screens, and they have
 * already drifted once (see the note in lib/refundReasons.ts). The list itself
 * was shared; the markup around it was not, so a change to how it looks had to
 * be made twice or it was made once and forgotten.
 *
 * Buttons, not checkboxes. The reasons were a tick list, which spent a column of
 * every row on a control that repeats the state the row already shows, and read
 * as a form to fill in rather than a choice to make. Selection is now the row
 * itself: picked reasons carry the house gradient, the rest are quiet outlines.
 *
 * Still multi-select — several of these are true of the same purchase at once —
 * so each row is a toggle and says so with `aria-pressed`, which is what a
 * screen reader reads in place of a checkbox's checked state.
 */

import { REFUND_REASON_PRESETS } from "@/lib/refundReasons";

/* The same gradient the primary buttons use, in the same direction. */
const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

export default function RefundReasonPicker({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (reason: string) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Reason for the refund"
      className="space-y-2 max-h-[240px] overflow-y-auto pr-1"
    >
      {REFUND_REASON_PRESETS.map((preset) => {
        const on = selected.includes(preset);
        return (
          <button
            key={preset}
            type="button"
            onClick={() => onToggle(preset)}
            aria-pressed={on}
            className={`w-full text-left rounded-lg border px-3 py-2.5 text-sm leading-snug transition-colors ${
              on
                ? // Transparent border, not none: a border that disappears on
                  // selection changes the row's height by 2px and the whole list
                  // shifts as you pick.
                  "border-transparent text-white font-medium"
                : "border-white/10 bg-white/[0.02] text-white/85 hover:bg-white/[0.06] hover:border-white/20"
            }`}
            style={on ? { background: GRADIENT } : undefined}
          >
            {preset}
          </button>
        );
      })}
    </div>
  );
}
