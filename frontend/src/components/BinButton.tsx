/**
 * The app's one delete control — a red bin whose lid tips open on hover.
 *
 * A component rather than the markup repeated per call site for the same reason
 * ConfirmModal is one: the delete affordance appears in ~15 places (cart rows,
 * history lists, saved collections, admin tables, bank-account rows), and
 * pasted-in copies drift — one loses the hover, one keeps a stale red, one
 * forgets the aria-label.
 *
 * SIZED, because the original is 55px square and most of those call sites are a
 * 36px cart row or a 16px icon in a table cell. `lg` is the source dimensions;
 * `md` and `sm` scale the box, radius, border and both SVG widths together, so
 * the bin keeps its proportions instead of a 55px graphic being squeezed into a
 * 32px box. Pick the one that matches the row it sits in — `sm` for dense lists
 * and table cells, `md` for card actions and cart rows, `lg` only where it is
 * the primary thing in its own space.
 *
 * Built with Tailwind + inline dimensions rather than the source's global
 * `.bin-button` / `.bin-top` classes: those are three unscoped selectors in a
 * codebase where every other component is Tailwind, and a fixed 55px in CSS is
 * exactly what the size variants exist to avoid.
 *
 * This is only the button. Whether a click deletes immediately or opens
 * ConfirmModal first is the CALLER's decision, and it turns on whether the
 * thing can be got back: a cart item is one click from returning, a published
 * product and a linked bank account are not.
 */

import { useId } from "react";

export type BinButtonSize = "sm" | "md" | "lg";

/* Derived from the 55px original: lid 17/55 of the box, body 15/55. Kept as a
   table of whole pixels rather than computed from a ratio — these end up as
   SVG widths, and a fractional px there renders a soft, half-lit edge. */
const SIZES: Record<
  BinButtonSize,
  { box: number; radius: number; border: number; lid: number; body: number }
> = {
  sm: { box: 32, radius: 9, border: 2, lid: 10, body: 9 },
  md: { box: 40, radius: 11, border: 2, lid: 12, body: 11 },
  lg: { box: 55, radius: 15, border: 3, lid: 17, body: 15 },
};

export default function BinButton({
  onClick,
  label,
  size = "md",
  disabled = false,
  className = "",
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Names what gets deleted — this is an icon-only button, so it is the only
      thing a screen reader or a hover has to go on. Required for that reason. */
  label: string;
  size?: BinButtonSize;
  disabled?: boolean;
  className?: string;
}) {
  const dims = SIZES[size];

  /* The source SVG hardcodes mask id "path-1-inside-1_8_19". Every bin in a
     list would then declare the same id, and `url(#…)` resolves to whichever
     the document hit first — invalid markup that happens to look right only
     because all the masks are identical. useId() keeps each one its own. */
  const maskId = useId();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`group inline-flex shrink-0 flex-col items-center justify-center bg-[rgb(255,95,95)] transition-[background-color,transform] duration-300 hover:bg-[rgb(255,0,0)] active:scale-90 disabled:pointer-events-none disabled:opacity-50 ${className}`}
      style={{
        width: dims.box,
        height: dims.box,
        borderRadius: dims.radius,
        border: `${dims.border}px solid rgb(255,201,201)`,
      }}
    >
      {/* The lid. transform-origin right, so it tips off the bin rather than
          spinning about its middle. */}
      <svg
        className="origin-right transition-transform duration-300 group-hover:rotate-45"
        style={{ width: dims.lid }}
        viewBox="0 0 39 7"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <line y1="5" x2="39" y2="5" stroke="white" strokeWidth="4" />
        <line x1="12" y1="1.5" x2="26.0357" y2="1.5" stroke="white" strokeWidth="3" />
      </svg>

      {/* The body, with its two stripes. */}
      <svg
        style={{ width: dims.body }}
        viewBox="0 0 33 39"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <mask id={maskId} fill="white">
          <path d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z" />
        </mask>
        <path
          d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
          fill="white"
          mask={`url(#${maskId})`}
        />
        <path d="M12 6L12 29" stroke="white" strokeWidth="4" />
        <path d="M21 6V29" stroke="white" strokeWidth="4" />
      </svg>
    </button>
  );
}
