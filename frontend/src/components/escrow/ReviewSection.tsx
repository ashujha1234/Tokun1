/**
 * Reviews on a profile, and the box for leaving one on a finished booking.
 *
 * Two separate scores, never blended: "as a creator" is what clients said about
 * their work, "as a client" is what creators said about working for them. Being
 * good to hire and being good to work for are different claims, and an average
 * of the two asserts neither.
 */

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const GRAD = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

type Review = {
  _id: string;
  rating: number;
  comment: string;
  orderTitle: string;
  orderKind: "hire" | "service";
  outcome: string;
  reviewerRole: "buyer" | "seller";
  reviewer: { _id: string; name?: string; avatarUrl?: string } | null;
  response: string;
  respondedAt: string | null;
  createdAt: string;
};

type Summary = { total: number; average: number; stars: Record<string, number> };

const formatDate = (v: string) =>
  v ? new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

// A low rating on a job that ended in a dispute reads very differently from one
// on a job delivered in full. Hiding that difference would mislead.
const OUTCOME_LABEL: Record<string, string> = {
  SETTLED: "Cancelled — payment split",
  REFUNDED: "Cancelled — refunded",
  CANCELLED: "Cancelled",
};

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={n <= Math.round(value) ? "fill-[#FFD34D] text-[#FFD34D]" : "text-white/15"}
        />
      ))}
    </span>
  );
}

function ScoreBlock({ label, summary }: { label: string; summary: Summary }) {
  if (!summary.total) return null;
  return (
    <div className="flex-1 min-w-[160px]">
      <p className="text-[10px] font-bold tracking-[1.2px] text-white/35 uppercase">{label}</p>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="text-2xl font-extrabold">{summary.average.toFixed(1)}</span>
        <div>
          <Stars value={summary.average} />
          <p className="text-[11px] text-white/35 mt-0.5">
            {summary.total} review{summary.total === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* The histogram, because a 4.5 built from 4s and 5s is a different thing
          from a 4.5 built from 5s and 1s. */}
      <div className="mt-2.5 space-y-1">
        {[5, 4, 3, 2, 1].map((star) => {
          const n = summary.stars?.[star] || 0;
          const pct = summary.total ? (n / summary.total) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-[10px] text-white/30 w-2.5">{star}</span>
              <div className="flex-1 h-1 rounded-full bg-white/[0.07] overflow-hidden">
                <div className="h-full rounded-full bg-[#FFD34D]" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[10px] text-white/25 w-4 text-right">{n}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Profile section ──────────────────────────────────────────────────────── */

export default function ReviewSection({
  userId,
  viewerId,
  token,
}: {
  userId: string;
  viewerId?: string;
  token?: string;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<{ asCreator: Summary; asClient: Summary } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "creator" | "client">("all");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/reviews/user/${userId}?as=${filter}&limit=20`);
      const data = await res.json().catch(() => ({}));
      if (data?.success) {
        setReviews(data.reviews || []);
        setSummary(data.summary || null);
      }
    } catch {
      // A profile without its reviews still renders — not worth an error state.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, filter]);

  const submitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/reviews/${reviewId}/respond`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ response: replyText.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.message || "Couldn't post your reply.");
      setReplyTo(null);
      setReplyText("");
      await load();
    } catch (err: any) {
      toast({ title: "Reply failed", description: err?.message || "Please try again." });
    }
  };

  const hasAny = (summary?.asCreator.total || 0) + (summary?.asClient.total || 0) > 0;
  const isOwnProfile = viewerId && String(viewerId) === String(userId);

  if (loading) return <p className="text-white/45 text-sm">Loading reviews…</p>;

  if (!hasAny) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
        <p className="text-white/50 text-sm">No reviews yet.</p>
        <p className="mt-1 text-xs text-white/30">
          Reviews appear here once a booking with this person is finished.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {summary && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap gap-6">
            <ScoreBlock label="As a creator" summary={summary.asCreator} />
            <ScoreBlock label="As a client" summary={summary.asClient} />
          </div>
        </div>
      )}

      {/* Only offered when there's actually something on both sides to split. */}
      {summary && summary.asCreator.total > 0 && summary.asClient.total > 0 && (
        <div className="flex items-center gap-2">
          {(
            [
              { id: "all", label: "All" },
              { id: "creator", label: "As a creator" },
              { id: "client", label: "As a client" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 h-8 rounded-full text-xs font-medium transition ${
                filter === f.id
                  ? "bg-white/[0.10] text-white"
                  : "text-white/50 hover:bg-white/[0.06]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 grid place-items-center text-sm font-semibold shrink-0 overflow-hidden">
                {r.reviewer?.avatarUrl ? (
                  <img loading="lazy" decoding="async" src={r.reviewer.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  (r.reviewer?.name || "U").charAt(0).toUpperCase()
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium truncate">
                    {r.reviewer?.name || "Someone"}
                  </span>
                  <span className="text-[11px] text-white/30 shrink-0">{formatDate(r.createdAt)}</span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Stars value={r.rating} size={13} />
                  <span className="text-[11px] text-white/35">
                    {r.reviewerRole === "buyer" ? "as a client" : "as a creator"} · {r.orderTitle}
                  </span>
                  {OUTCOME_LABEL[r.outcome] && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/45">
                      {OUTCOME_LABEL[r.outcome]}
                    </span>
                  )}
                </div>

                {r.comment && (
                  <p className="mt-2 text-sm text-white/75 whitespace-pre-line leading-relaxed">
                    {r.comment}
                  </p>
                )}

                {r.response ? (
                  <div className="mt-3 pl-3 border-l-2 border-white/10">
                    <p className="text-[11px] text-white/35 mb-1">
                      Reply · {formatDate(r.respondedAt || "")}
                    </p>
                    <p className="text-sm text-white/65 whitespace-pre-line">{r.response}</p>
                  </div>
                ) : (
                  isOwnProfile &&
                  token && (
                    <div className="mt-3">
                      {replyTo === r._id ? (
                        <>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Your reply is public and can't be edited afterwards."
                            className="w-full h-20 rounded-lg bg-[#1A1A1A] border border-white/10 p-3 text-sm outline-none resize-none"
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => {
                                setReplyTo(null);
                                setReplyText("");
                              }}
                              className="h-8 px-3 rounded-full text-xs text-white/60 border border-white/15 hover:bg-white/[0.06]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => submitReply(r._id)}
                              className="h-8 px-4 rounded-full text-xs font-semibold text-white"
                              style={{ background: GRAD }}
                            >
                              Post reply
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => setReplyTo(r._id)}
                          className="text-xs text-[#63A6F2] hover:underline"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Write-a-review, from someone's profile ───────────────────────────────
   A review is about a PERSON, not a single job — so it's written from their
   profile, once, by anyone who has actually paid them (or been paid by them).
   That last part is the only thing separating a rating system from a place
   competitors leave one star, so the button explains itself rather than
   silently disappearing. */

export function WriteReviewButton({
  userId,
  userName,
  token,
  onPosted,
}: {
  userId: string;
  userName?: string;
  token?: string;
  onPosted?: () => void;
}) {
  const [eligibility, setEligibility] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!token || !userId) return;
    try {
      const res = await fetch(`${API_BASE}/api/reviews/eligibility/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) setEligibility(data);
    } catch {
      // Button just doesn't appear.
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, token]);

  const submit = async () => {
    if (!rating) {
      toast({ title: "Pick a rating", description: "How many stars?" });
      return;
    }
    try {
      setBusy(true);
      const res = await fetch(`${API_BASE}/api/reviews/user/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.message || "Couldn't post your review.");
      toast({ title: "Review posted", description: "It's on their profile now." });
      setOpen(false);
      setRating(0);
      setComment("");
      await load();
      onPosted?.();
    } catch (err: any) {
      toast({ title: "Couldn't post", description: err?.message || "Please try again." });
    } finally {
      setBusy(false);
    }
  };

  // Own profile, or not logged in — nothing to offer.
  if (!token || !eligibility || eligibility.reason === "self") return null;

  if (eligibility.reason === "already_reviewed") {
    return (
      <span className="inline-flex items-center gap-2 text-xs text-white/40">
        <Stars value={eligibility.myReview?.rating || 0} size={13} />
        You've reviewed {userName || "them"}
      </span>
    );
  }

  // Said out loud rather than hiding the button, so "why can't I review?" has
  // a visible answer.
  if (!eligibility.canReview) {
    return (
      <span
        className="text-xs text-white/30"
        title="Reviews come from people who've actually transacted — that's what stops them being gamed."
      >
        Buy a prompt or book {userName || "them"} to leave a review
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-semibold text-white border border-white/15 hover:bg-white/[0.08] transition"
      >
        <Star className="w-3.5 h-3.5" />
        Write a review
      </button>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <p className="text-[10px] font-bold tracking-[1.4px] text-white/40 uppercase mb-1">
        Review {userName || "this creator"}
      </p>
      {eligibility.basis && (
        <p className="text-xs text-white/35 mb-3.5">
          Based on “{eligibility.basis.orderTitle}”
        </p>
      )}

      <div className="flex items-center gap-1.5 mb-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                n <= (hover || rating) ? "fill-[#FFD34D] text-[#FFD34D]" : "text-white/15"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What was your experience? Be specific — that's what makes a review useful to the next person."
        className="w-full h-24 rounded-lg bg-black/30 border border-white/10 p-3 text-sm outline-none resize-none"
      />

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setOpen(false)}
          disabled={busy}
          className="flex-1 h-10 rounded-full text-xs font-medium text-white/60 border border-white/15 hover:bg-white/[0.06]"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={busy}
          className="flex-1 h-10 rounded-full text-xs font-semibold text-white disabled:opacity-60"
          style={{ background: GRAD }}
        >
          {busy ? "Posting…" : "Post review"}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-white/30 text-center">
        Public, and can't be edited once posted.
      </p>
    </div>
  );
}
