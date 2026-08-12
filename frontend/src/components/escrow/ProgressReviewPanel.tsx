/**
 * Mid-project checkpoints — the client asks to see how things are going, the
 * creator answers with a screenshot or a short recording, or declines.
 *
 * On a 60-day project the alternative is paying up front and then waiting two
 * months on nothing but trust, and that silence is what makes clients cancel
 * out of anxiety rather than because anything is wrong.
 *
 * Declining is a real option here, not a failure — being able to demand a demo
 * on any afternoon would just be a new way to interrupt someone mid-work. The
 * server enforces one open request at a time and a cooldown; this reflects
 * whatever it says rather than deciding for itself.
 */

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import BriefAttachmentPicker from "./BriefAttachmentPicker";
import {
  fetchProgressReviews,
  requestProgressReview,
  respondToProgressReview,
  openProgressMedia,
  uploadProgressMedia,
  formatDateTime,
  type BriefAttachment,
  type OrderKind,
  type ProgressReview,
} from "@/lib/escrowApi";

const GRAD = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

const MEDIA_ICON = { image: "🖼", video: "🎬", file: "📎" } as const;

function ReviewCard({
  review,
  token,
}: {
  review: ProgressReview;
  token?: string;
}) {
  const isShared = review.status === "SHARED";
  const isDeclined = review.status === "DECLINED";

  return (
    <div className="rounded-xl bg-black/25 border border-white/[0.07] p-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] text-white/40">{formatDateTime(review.createdAt)}</span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={
            isShared
              ? { color: "#19E66C", background: "rgba(25,230,108,0.10)" }
              : isDeclined
              ? { color: "#FABC4E", background: "rgba(250,188,78,0.10)" }
              : { color: "#63A6F2", background: "rgba(26,115,232,0.10)" }
          }
        >
          {isShared ? "SHARED" : isDeclined ? "DECLINED" : "WAITING"}
        </span>
      </div>

      {review.requestNote && (
        <p className="mt-2 text-sm text-white/55 italic">Asked: “{review.requestNote}”</p>
      )}

      {isShared && (
        <>
          {review.progressPercent !== null && (
            <div className="mt-3">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-xs text-white/45">Creator's estimate</span>
                <span className="text-sm font-semibold">{review.progressPercent}% done</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${review.progressPercent}%`, background: GRAD }}
                />
              </div>
            </div>
          )}

          {review.responseNote && (
            <p className="mt-3 text-sm text-white/75 whitespace-pre-line">{review.responseNote}</p>
          )}

          {review.media?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {review.media.map((m) => (
                <button
                  key={m.index}
                  type="button"
                  onClick={() =>
                    openProgressMedia(review._id, m.index, token).catch((err: any) =>
                      toast({ title: "Couldn't open", description: err?.message || "Try again." })
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white/70 hover:border-white/25"
                >
                  <span>{MEDIA_ICON[m.kind] || "📎"}</span>
                  <span className="max-w-[160px] truncate">{m.name}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {isDeclined && (
        <p className="mt-2 text-sm text-white/60">
          {review.declineReason || "The creator couldn't share an update right now."}
        </p>
      )}
    </div>
  );
}

export default function ProgressReviewPanel({
  orderKind,
  orderId,
  token,
}: {
  orderKind: OrderKind;
  orderId: string;
  token?: string;
}) {
  const [reviews, setReviews] = useState<ProgressReview[]>([]);
  const [openRequest, setOpenRequest] = useState<{ _id: string; requestNote: string } | null>(null);
  const [canRequest, setCanRequest] = useState(false);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [askOpen, setAskOpen] = useState(false);
  const [askNote, setAskNote] = useState("");

  const [replyNote, setReplyNote] = useState("");
  const [replyPercent, setReplyPercent] = useState<number | "">("");
  const [replyMedia, setReplyMedia] = useState<BriefAttachment[]>([]);
  const [declining, setDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const load = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await fetchProgressReviews(orderKind, orderId, token);
      setReviews(data.reviews || []);
      setOpenRequest(data.openRequest);
      setCanRequest(data.canRequest);
      setRole(data.viewerRole);
    } catch {
      // Non-critical panel — an empty state is a fine failure mode here.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderKind, orderId, token]);

  const run = async (fn: () => Promise<any>, title: string) => {
    try {
      setBusy(true);
      await fn();
      toast({ title });
      setAskOpen(false);
      setAskNote("");
      setReplyNote("");
      setReplyPercent("");
      setReplyMedia([]);
      setDeclining(false);
      setDeclineReason("");
      await load();
    } catch (err: any) {
      toast({ title: "Couldn't do that", description: err?.message || "Please try again." });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="text-white/45 text-sm">Loading progress updates…</p>;

  const sellerMustReply = role === "seller" && openRequest;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-[1.4px] text-white/40 uppercase">
            Progress updates
          </p>
          <p className="mt-1 text-xs text-white/40">
            {role === "buyer"
              ? "Ask to see how the work is coming along, before it's delivered."
              : "The client can ask for a checkpoint while you work."}
          </p>
        </div>
        {role === "buyer" && canRequest && !askOpen && (
          <button
            type="button"
            onClick={() => setAskOpen(true)}
            className="shrink-0 h-9 px-4 rounded-full text-xs font-semibold text-white"
            style={{ background: GRAD }}
          >
            Ask for an update
          </button>
        )}
      </div>

      {/* ── Buyer composing a request ─────────────────────────────────────── */}
      {askOpen && (
        <div className="rounded-xl bg-black/25 border border-white/[0.07] p-3.5 space-y-3">
          <textarea
            value={askNote}
            onChange={(e) => setAskNote(e.target.value)}
            placeholder="What would you like to see? e.g. 'Could you show the homepage layout so far?'"
            className="w-full h-20 rounded-lg bg-[#1A1A1A] border border-white/10 p-3 text-sm outline-none resize-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAskOpen(false)}
              disabled={busy}
              className="flex-1 h-9 rounded-full text-xs font-medium text-white/70 border border-white/15 hover:bg-white/[0.06]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(() => requestProgressReview(orderKind, orderId, askNote, token), "Update requested")
              }
              className="flex-1 h-9 rounded-full text-xs font-semibold text-white disabled:opacity-60"
              style={{ background: GRAD }}
            >
              {busy ? "Sending…" : "Send request"}
            </button>
          </div>
        </div>
      )}

      {role === "buyer" && !canRequest && !openRequest && !askOpen && (
        <p className="text-xs text-white/35 leading-relaxed">
          Updates can be asked for while work is underway. You asked recently, so there's a short
          wait before the next one.
        </p>
      )}

      {role === "buyer" && openRequest && (
        <p className="text-xs text-[#63A6F2]">
          You've asked for an update — waiting for the creator to reply.
        </p>
      )}

      {/* ── Seller answering ──────────────────────────────────────────────── */}
      {sellerMustReply && (
        <div className="rounded-xl border border-[#63A6F2]/25 bg-[#1A73E8]/[0.08] p-3.5 space-y-3">
          <p className="text-sm font-semibold text-[#9CC5F5]">The client asked for an update</p>
          {openRequest.requestNote && (
            <p className="text-sm text-white/65 italic">“{openRequest.requestNote}”</p>
          )}

          {declining ? (
            <>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Let them know why — e.g. 'Mid-render, I'll have something to show on Thursday.'"
                className="w-full h-20 rounded-lg bg-[#1A1A1A] border border-white/10 p-3 text-sm outline-none resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeclining(false)}
                  disabled={busy}
                  className="flex-1 h-9 rounded-full text-xs font-medium text-white/70 border border-white/15 hover:bg-white/[0.06]"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    run(
                      () =>
                        respondToProgressReview(
                          orderKind,
                          orderId,
                          { action: "decline", reason: declineReason },
                          token
                        ),
                      "Client notified"
                    )
                  }
                  className="flex-1 h-9 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/15 disabled:opacity-60"
                >
                  {busy ? "Sending…" : "Send"}
                </button>
              </div>
            </>
          ) : (
            <>
              <BriefAttachmentPicker
                value={replyMedia}
                onChange={setReplyMedia}
                token={token}
                uploader={uploadProgressMedia}
                max={6}
                maxBytes={100 * 1024 * 1024}
                label="Attach a screenshot or recording"
                hint="A short screen recording is usually the clearest thing you can send. Max 100 MB each."
                disabled={busy}
              />

              <div>
                <p className="text-sm font-medium mb-2">Note</p>
                <textarea
                  value={replyNote}
                  onChange={(e) => setReplyNote(e.target.value)}
                  placeholder="Where things stand and what's next…"
                  className="w-full h-20 rounded-lg bg-[#1A1A1A] border border-white/10 p-3 text-sm outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Roughly how far along? <span className="text-white/35">(optional)</span>
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={replyPercent === "" ? 50 : replyPercent}
                    onChange={(e) => setReplyPercent(Number(e.target.value))}
                    className="flex-1 accent-[#FF14EF]"
                  />
                  <span className="text-sm font-semibold w-12 text-right">
                    {replyPercent === "" ? "—" : `${replyPercent}%`}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-white/35">
                  An estimate for the client, not a commitment — it doesn't fix what you're paid.
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDeclining(true)}
                  disabled={busy}
                  className="flex-1 h-10 rounded-full text-xs font-medium text-white/70 border border-white/15 hover:bg-white/[0.06]"
                >
                  Not right now
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    run(
                      () =>
                        respondToProgressReview(
                          orderKind,
                          orderId,
                          {
                            action: "share",
                            note: replyNote,
                            progressPercent: replyPercent === "" ? null : replyPercent,
                            media: replyMedia,
                          },
                          token
                        ),
                      "Update shared"
                    )
                  }
                  className="flex-1 h-10 rounded-full text-xs font-semibold text-white disabled:opacity-60"
                  style={{ background: GRAD }}
                >
                  {busy ? "Sharing…" : "Share update"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {reviews.length > 0 ? (
        <div className="space-y-2.5">
          {reviews.map((r) => (
            <ReviewCard key={r._id} review={r} token={token} />
          ))}
        </div>
      ) : (
        !askOpen &&
        !sellerMustReply && <p className="text-xs text-white/30">No progress updates yet.</p>
      )}
    </div>
  );
}
