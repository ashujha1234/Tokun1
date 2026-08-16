// The admin control for deducting stars from a creator's rating.
//
// Lives in one component because it appears in two places that must behave
// identically — the refund queue and the dispute ruling screen. A second copy
// would drift on the two things that matter most here: the minimum reason
// length, and the fact that the creator is always told.
//
// Collapsed by default. This is a judgement an admin makes occasionally, on a
// case they've read — not a button that should be sitting open on every row
// inviting a reflex click.

import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { adminAuthHeaders } from "@/lib/adminAuth";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

/* Presets rather than a free number field. A deduction is a rough judgement of
   severity, and offering three steps makes admins pick one of three consistent
   ones instead of inventing 0.3 on a Tuesday and 0.8 on a Thursday. */
const STEPS = [
  { stars: 0.5, label: "0.5★", hint: "Sloppy, but they delivered something" },
  { stars: 1, label: "1★", hint: "Clearly at fault on this order" },
  { stars: 2, label: "2★", hint: "Serious — took the money, delivered nothing" },
];

export type PenaltyContext = {
  kind: "refund" | "dispute" | "manual";
  refundRequestId?: string;
  disputeId?: string;
  orderKind?: "hire" | "service";
  orderId?: string;
  promptId?: string;
  title?: string;
};

export default function RatingPenaltyControl({
  creatorId,
  creatorName,
  context,
  getAuthHeaders = adminAuthHeaders,
  onApplied,
}: {
  creatorId?: string;
  creatorName?: string;
  context: PenaltyContext;
  /** Optional: screens with their own admin headers pass theirs; the rest use
      the shared reader in lib/adminAuth. */
  getAuthHeaders?: () => Record<string, string>;
  onApplied?: (summary: { rating: number; count: number; penalty: number }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState<number>(1);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<{ rating: number; stars: number } | null>(null);

  // Nothing to penalise — a refund row whose seller failed to populate, say.
  if (!creatorId) return null;

  const apply = async () => {
    if (reason.trim().length < 10) {
      toast({
        title: "Write a reason first",
        description: "The creator is shown this word for word — give them something they can act on.",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/rating-penalties`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ creatorId, stars, reason: reason.trim(), context }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || "Couldn't apply the penalty");
      }

      setDone({ rating: data.summary?.rating ?? 0, stars });
      setOpen(false);
      onApplied?.(data.summary);
      toast({
        title: `${stars}★ deducted`,
        description: `${creatorName || "The creator"} is now on ${data.summary?.rating ?? "—"}/5 and has been emailed the reason.`,
      });
    } catch (err: any) {
      toast({ title: "Not applied", description: err?.message || "Try again." });
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-100">
        Rating reduced by {done.stars}★ — {creatorName || "the creator"} is now on {done.rating}/5 and
        has been emailed.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 text-[12px] text-amber-300/80 underline underline-offset-2 hover:text-amber-200"
      >
        Reduce {creatorName || "creator"}'s rating…
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-3">
      <p className="text-[12px] font-semibold text-amber-100">
        Reduce {creatorName || "this creator"}'s rating
      </p>
      {/* Said out loud, because the opposite assumption is the dangerous one. */}
      <p className="mt-1 text-[11px] leading-relaxed text-amber-100/60">
        Only if they're actually at fault. A refund on its own isn't proof — buyers change their
        minds. This is emailed to them with your reason and can be lifted later.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <button
            key={s.stars}
            type="button"
            title={s.hint}
            onClick={() => setStars(s.stars)}
            className={`rounded-full px-3 py-1 text-[12px] font-medium transition ${
              stars === s.stars
                ? "bg-amber-400 text-black"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="mt-1.5 text-[11px] text-white/40">
        {STEPS.find((s) => s.stars === stars)?.hint}
      </p>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        maxLength={1000}
        disabled={saving}
        placeholder="What did they do? The creator reads this exactly as written."
        className="mt-2 w-full resize-none rounded-md border border-white/10 bg-black/30 px-2.5 py-2 text-[12.5px] text-white placeholder:text-white/25 focus:border-amber-400/60 focus:outline-none"
      />

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={apply}
          disabled={saving}
          className="rounded-md bg-amber-400 px-3 py-1.5 text-[12px] font-semibold text-black hover:bg-amber-300 disabled:opacity-50"
        >
          {saving ? "Applying…" : `Deduct ${stars}★`}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={saving}
          className="rounded-md bg-white/5 px-3 py-1.5 text-[12px] text-white/70 hover:bg-white/10 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
