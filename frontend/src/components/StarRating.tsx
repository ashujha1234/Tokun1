// Stars. Used on marketplace cards, in the saved collection, and in the
// product details panel — one component so a 4.3 never renders three different
// ways depending on which screen you're looking at.

import { useState } from "react";

/* Half-stars via a clipped overlay rather than a separate half-star glyph: an
   average of 4.3 should look like 4.3, and rounding it to 4 or 4.5 on the card
   while the details panel prints "4.3" is the kind of small lie people notice. */
function Star({ fill, size }: { fill: number; size: number }) {
  const clamped = Math.max(0, Math.min(1, fill));

  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: size, height: size, lineHeight: 0 }}
      aria-hidden
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="absolute inset-0">
        <path
          d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.35 6.19 20.4l1.1-6.47-4.7-4.58 6.5-.95L12 2.5z"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${clamped * 100}%` }}
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#FACC15">
          <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.35 6.19 20.4l1.1-6.47-4.7-4.58 6.5-.95L12 2.5z" />
        </svg>
      </span>
    </span>
  );
}

export function StarRating({
  value,
  count,
  size = 14,
  showValue = true,
  compact = false,
  className = "",
}: {
  value?: number | null;
  /** Number of reviews behind the average. 0 or undefined renders "No reviews yet". */
  count?: number;
  size?: number;
  showValue?: boolean;
  /**
   * One star and the number, instead of five stars.
   *
   * For listing cards. A row of five stars on a card is five glyphs the eye has
   * to count to extract one number — and on a grid of twenty cards it's a
   * hundred of them competing with the thumbnails and prices that are actually
   * doing the selling. The full row stays on the details panel, where the
   * rating is the thing being read rather than scanned past.
   */
  compact?: boolean;
  className?: string;
}) {
  const avg = Number(value || 0);
  const reviews = Number(count || 0);

  if (compact) {
    if (!reviews || avg <= 0) {
      return (
        <span
          className={`inline-flex items-center gap-1 text-white/35 ${className}`}
          style={{ fontSize: size }}
        >
          <Star fill={0} size={size} />
          No reviews
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1 ${className}`}
        style={{ fontSize: size }}
        aria-label={`Rated ${avg.toFixed(1)} out of 5 from ${reviews} review${reviews === 1 ? "" : "s"}`}
      >
        <Star fill={1} size={size} />
        <span className="font-semibold text-white/85">{avg.toFixed(1)}</span>
        <span className="text-white/40">({reviews})</span>
      </span>
    );
  }

  /* An unreviewed product says so. The alternative — five grey stars — reads as
     "rated zero", which is a much worse thing to say about something nobody has
     got round to reviewing yet. */
  if (!reviews || avg <= 0) {
    return (
      <span className={`inline-flex items-center gap-1 text-white/40 ${className}`} style={{ fontSize: size - 2 }}>
        <Star fill={0} size={size} />
        No reviews yet
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      aria-label={`Rated ${avg.toFixed(1)} out of 5 from ${reviews} review${reviews === 1 ? "" : "s"}`}
    >
      <span className="inline-flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} fill={avg - i} size={size} />
        ))}
      </span>
      {showValue && (
        <span className="text-white/70" style={{ fontSize: size - 1 }}>
          {avg.toFixed(1)}
          <span className="text-white/35"> ({reviews})</span>
        </span>
      )}
    </span>
  );
}

/** The input version — click to set, hover to preview. */
export function StarInput({
  value,
  onChange,
  size = 28,
  disabled = false,
}: {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="inline-flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          className="p-0.5 bg-transparent border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ lineHeight: 0, cursor: disabled ? "not-allowed" : "pointer" }}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          aria-pressed={value === n}
        >
          <Star fill={shown >= n ? 1 : 0} size={size} />
        </button>
      ))}
    </div>
  );
}

export default StarRating;
