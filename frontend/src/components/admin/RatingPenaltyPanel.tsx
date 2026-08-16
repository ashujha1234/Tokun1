// A creator's rating adjustments: what their reviews say, what's been deducted,
// every deduction ever applied, and the button to lift one.
//
// Without this an admin could apply a penalty and never see it again. Two
// admins working two different cases would each dock a star, neither knowing
// about the other, and the creator would quietly lose two — with no screen
// anywhere that could explain where their rating went.
//
// Shown on the creator's admin profile, where someone deciding whether to
// penalise is already standing.

import { useCallback, useEffect, useState } from "react";
import { Star, Undo2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { adminAuthHeaders } from "@/lib/adminAuth";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

type Penalty = {
  id: string;
  stars: number;
  reason: string;
  context: {
    kind: "refund" | "dispute" | "manual";
    orderKind?: string | null;
    title?: string;
  };
  active: boolean;
  appliedBy: string;
  appliedAt: string;
  revokedAt?: string | null;
  revokeReason?: string;
};

type CreatorRating = {
  id: string;
  name?: string;
  rating: number;
  reviews: number;
  penaltyTotal: number;
};

const when = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const contextLabel = (c: Penalty["context"]) => {
  if (c.kind === "refund") return c.title ? `Refund · ${c.title}` : "Refund";
  if (c.kind === "dispute") {
    const side = c.orderKind === "hire" ? "Hire" : c.orderKind === "service" ? "Service" : "";
    return [side, "dispute", c.title ? `· ${c.title}` : ""].filter(Boolean).join(" ");
  }
  return "Applied manually";
};

export default function RatingPenaltyPanel({
  creatorId,
  /** Optional: screens that already build their own admin headers pass theirs.
      Everything else falls back to the shared reader. */
  getAuthHeaders = adminAuthHeaders,
  /** Bumped by the parent after a new penalty is applied, to force a refetch. */
  refreshKey = 0,
}: {
  creatorId?: string;
  getAuthHeaders?: () => Record<string, string>;
  refreshKey?: number;
}) {
  const [creator, setCreator] = useState<CreatorRating | null>(null);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    if (!creatorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/rating-penalties/${creatorId}`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) {
        setCreator(data.creator);
        setPenalties(data.penalties || []);
      }
    } catch {
      /* falls through to the empty state */
    } finally {
      setLoading(false);
    }
  }, [creatorId, getAuthHeaders]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const revoke = async (id: string) => {
    setRevoking(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/rating-penalties/${id}/revoke`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({ note: note.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || "Couldn't lift it");
      }

      toast({
        title: "Adjustment lifted",
        description: `Rating restored to ${data.summary?.rating ?? "—"}/5. The creator has been emailed.`,
      });
      setConfirmId(null);
      setNote("");
      await load();
    } catch (err: any) {
      toast({ title: "Not lifted", description: err?.message || "Try again." });
    } finally {
      setRevoking(null);
    }
  };

  if (!creatorId) return null;

  const active = penalties.filter((p) => p.active);
  const past = penalties.filter((p) => !p.active);

  /* Nothing to show and nothing to explain — an empty panel on every clean
     creator's profile would just be furniture. */
  if (!loading && !penalties.length && !creator?.penaltyTotal) return null;

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">Rating adjustments</h3>
        {creator && (
          <p className="text-xs text-white/45">
            {creator.reviews} review{creator.reviews === 1 ? "" : "s"} ·{" "}
            <span className="text-white/70">{creator.rating}/5 shown</span>
            {creator.penaltyTotal > 0 && (
              <span className="text-amber-300"> · {creator.penaltyTotal}★ deducted</span>
            )}
          </p>
        )}
      </div>

      {loading && <p className="mt-3 text-xs text-white/40">Loading…</p>}

      {/* The number that matters when deciding whether to add another. */}
      {!loading && active.length > 0 && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
          <Star className="h-3.5 w-3.5 shrink-0 text-amber-300" />
          <p className="text-[12px] text-amber-100">
            {creator?.penaltyTotal}★ currently coming off this creator across {active.length}{" "}
            adjustment{active.length === 1 ? "" : "s"}.
          </p>
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2">
        {penalties.map((p) => (
          <div
            key={p.id}
            className={`rounded-lg border px-3 py-2.5 ${
              p.active ? "border-white/10 bg-black/20" : "border-white/5 bg-black/10 opacity-60"
            }`}
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  p.active ? "bg-amber-400/20 text-amber-200" : "bg-white/10 text-white/50"
                }`}
              >
                −{p.stars}★
              </span>
              <span className="text-[11.5px] text-white/55">{contextLabel(p.context)}</span>
              <span className="ml-auto text-[10.5px] text-white/30">
                {when(p.appliedAt)} · {p.appliedBy}
              </span>
            </div>

            <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/75">{p.reason}</p>

            {!p.active && (
              <p className="mt-1 text-[11px] text-white/40">
                Lifted {when(p.revokedAt)}
                {p.revokeReason ? ` — ${p.revokeReason}` : ""}
              </p>
            )}

            {p.active &&
              (confirmId === p.id ? (
                <div className="mt-2.5 rounded-lg border border-sky-500/25 bg-sky-500/10 p-2.5">
                  <p className="text-[11.5px] text-white/80">
                    Lift this {p.stars}★ deduction? Their rating goes back up and they'll be emailed.
                  </p>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={200}
                    placeholder="Optional note for the creator"
                    className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-2.5 py-1.5 text-[12px] text-white placeholder:text-white/25 focus:border-sky-400/60 focus:outline-none"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => revoke(p.id)}
                      disabled={revoking === p.id}
                      className="rounded-md bg-sky-500 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
                    >
                      {revoking === p.id ? "Lifting…" : "Yes, lift it"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmId(null);
                        setNote("");
                      }}
                      disabled={revoking === p.id}
                      className="rounded-md bg-white/5 px-3 py-1.5 text-[12px] text-white/70 hover:bg-white/10 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmId(p.id)}
                  className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] text-sky-300/80 hover:text-sky-200"
                >
                  <Undo2 className="h-3 w-3" />
                  Lift this adjustment
                </button>
              ))}
          </div>
        ))}
      </div>

      {!loading && past.length > 0 && active.length === 0 && (
        <p className="mt-2 text-[11px] text-white/35">
          Nothing is currently being deducted — the entries above were lifted.
        </p>
      )}
    </div>
  );
}
