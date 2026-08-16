// The reviews block on a product — the summary, the list, and the form for
// people who bought it.
//
// Its own component rather than more markup inside DetailsPrompt: that file is
// already 1,700 lines, and this needs its own fetching, its own loading states
// and its own form state. It's rendered from the details panel wherever that
// panel appears — the marketplace, a profile, or the saved collection.

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { StarRating, StarInput } from "@/components/StarRating";
import {
  fetchProductReviews,
  fetchMyProductReview,
  submitProductReview,
  deleteProductReview,
  type ProductReview,
  type ReviewSummary,
} from "@/lib/productReviews";

const PAGE_SIZE = 5;

const initials = (name?: string) => (name || "U").trim().slice(0, 2).toUpperCase();

const whenText = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export default function ProductReviews({
  promptId,
  /** The signed-in user owns this listing — they get the list, never the form. */
  isOwnProduct = false,
  onSummaryChange,
}: {
  promptId: string;
  isOwnProduct?: boolean;
  onSummaryChange?: (summary: ReviewSummary) => void;
}) {
  const { user, token } = useAuth() as any;

  const [summary, setSummary] = useState<ReviewSummary>({ average: 0, count: 0, breakdown: {} });
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const [canReview, setCanReview] = useState(false);
  const [myReview, setMyReview] = useState<{ id: string; rating: number; comment: string } | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    async (skip = 0) => {
      if (!promptId) return;
      try {
        const data = await fetchProductReviews(promptId, { limit: PAGE_SIZE, skip });
        // Appended on "load more", replaced on a fresh read — otherwise posting
        // a review duplicates the first page underneath itself.
        setReviews((prev) => (skip === 0 ? data.reviews : [...prev, ...data.reviews]));
        setSummary(data.summary);
        setHasMore(data.hasMore);
        onSummaryChange?.(data.summary);
      } catch {
        // A product with no reviews and a failed fetch look the same to the
        // reader, and neither is worth a red error box inside a purchase flow.
      } finally {
        setLoading(false);
      }
    },
    [promptId, onSummaryChange]
  );

  useEffect(() => {
    setLoading(true);
    load(0);
  }, [load]);

  // Eligibility is a separate, authenticated read — it's the only thing that
  // knows whether this person bought the product.
  useEffect(() => {
    let cancelled = false;
    if (!promptId || !user || isOwnProduct) {
      setCanReview(false);
      setMyReview(null);
      return;
    }

    fetchMyProductReview(promptId, token).then((res) => {
      if (cancelled) return;
      setCanReview(res.canReview);
      setMyReview(res.myReview);
      if (res.myReview) {
        setRating(res.myReview.rating);
        setComment(res.myReview.comment);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [promptId, user, token, isOwnProduct]);

  const save = async () => {
    if (!rating) {
      toast({ title: "Pick a rating", description: "Tap a star from 1 to 5." });
      return;
    }

    setSaving(true);
    try {
      await submitProductReview(promptId, { rating, comment }, token);
      toast({
        title: myReview ? "Review updated" : "Thanks for reviewing",
        description: "It's now on the product page.",
      });
      setFormOpen(false);
      setMyReview({ id: myReview?.id || "", rating, comment });
      await load(0);
    } catch (err: any) {
      toast({ title: "Couldn't save your review", description: err?.message || "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await deleteProductReview(promptId, token);
      setMyReview(null);
      setRating(0);
      setComment("");
      setFormOpen(false);
      toast({ title: "Review removed" });
      await load(0);
    } catch (err: any) {
      toast({ title: "Couldn't remove it", description: err?.message || "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const total = summary.count || 0;

  return (
    <div className="mt-8 border-t border-white/10 pt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold text-white">Reviews</h3>
          <div className="mt-2">
            <StarRating value={summary.average} count={total} size={16} />
          </div>
        </div>

        {canReview && !formOpen && (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="shrink-0 h-9 px-4 rounded-full text-[13px] font-medium text-white bg-white/10 hover:bg-white/15 transition"
          >
            {myReview ? "Edit your review" : "Write a review"}
          </button>
        )}
      </div>

      {/* The 5→1 histogram. Only once there's enough for the shape to mean
          something — a single bar at "5" is just the average again. */}
      {total >= 3 && (
        <div className="mt-4 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const n = Number(summary.breakdown?.[star] || 0);
            const pct = total ? Math.round((n / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-[11px] text-white/45">
                <span className="w-3 text-right">{star}</span>
                <div className="h-1.5 flex-1 rounded-full bg-white/8 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#FACC15" }} />
                </div>
                <span className="w-6 text-right tabular-nums">{n}</span>
              </div>
            );
          })}
        </div>
      )}

      {formOpen && (
        <div className="mt-5 rounded-[12px] border border-white/10 bg-[#1C1C1E] p-4">
          <p className="text-[12px] font-semibold tracking-wide text-white/50 mb-3">
            {myReview ? "EDIT YOUR REVIEW" : "HOW WAS IT?"}
          </p>

          <StarInput value={rating} onChange={setRating} disabled={saving} />

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={2000}
            rows={4}
            disabled={saving}
            placeholder="What did you use it for, and did it deliver? Specifics help the next buyer more than a score does."
            className="mt-3 w-full rounded-[10px] bg-white/5 border border-white/10 px-3 py-2.5 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#1A73E8] resize-none"
          />

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="h-9 px-4 rounded-full text-[13px] font-semibold text-white bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : myReview ? "Update review" : "Post review"}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              disabled={saving}
              className="h-9 px-4 rounded-full text-[13px] text-white/70 bg-white/5 hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            {myReview && (
              <button
                type="button"
                onClick={remove}
                disabled={saving}
                className="ml-auto h-9 px-3 rounded-full text-[12px] text-red-300/80 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-5 space-y-4">
        {loading && <p className="text-[13px] text-white/40">Loading reviews…</p>}

        {!loading && !reviews.length && (
          <p className="text-[13px] text-white/40">
            {canReview
              ? "No reviews yet — you bought this, so yours would be the first."
              : "No reviews yet. Only people who've bought this product can leave one."}
          </p>
        )}

        {reviews.map((r) => (
          <div key={r.id} className="rounded-[12px] border border-white/8 bg-white/[0.02] p-3.5">
            <div className="flex items-center gap-2.5">
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white"
                style={{ background: "#2A2A2A" }}
              >
                {initials(r.buyer?.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-white">{r.buyer?.name}</p>
                <p className="text-[11px] text-white/35">
                  {/* Said on every row on purpose: it's what separates this from
                      an open comment section. */}
                  Verified buyer · {whenText(r.createdAt)}
                </p>
              </div>
              <div className="ml-auto shrink-0">
                <StarRating value={r.rating} count={1} size={12} showValue={false} />
              </div>
            </div>

            {r.comment && (
              <p className="mt-2.5 text-[13px] leading-relaxed text-white/75 whitespace-pre-wrap">{r.comment}</p>
            )}

            {r.response && (
              <div className="mt-3 rounded-[10px] border-l-2 border-[#1A73E8] bg-white/[0.03] px-3 py-2">
                <p className="text-[11px] font-semibold text-white/45">Seller's reply</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-white/70 whitespace-pre-wrap">{r.response}</p>
              </div>
            )}
          </div>
        ))}

        {hasMore && !loading && (
          <button
            type="button"
            onClick={() => load(reviews.length)}
            className="w-full h-9 rounded-full text-[13px] text-white/70 bg-white/5 hover:bg-white/10 transition"
          >
            Show more reviews
          </button>
        )}
      </div>
    </div>
  );
}
