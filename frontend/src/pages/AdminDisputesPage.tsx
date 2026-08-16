/**
 * Arbitration queue: cancellations the two parties couldn't settle themselves.
 *
 * The whole screen is built around one decision — who was in the right — and it
 * is all-or-nothing: the payment goes wholly to the creator or wholly back to
 * the client, minus the non-refundable platform fee either way. There is
 * deliberately no percentage and no pair of free-form "refund X / pay Y"
 * inputs. Two independent amounts can be set to figures that don't add up to
 * what the buyer paid, and a partial ruling leaves Tokun defending a number it
 * invented.
 *
 * Everything an admin needs to judge that number is on the detail view: the
 * creator's claim and proof, the client's objection, and — most usefully — the
 * progress checkpoints recorded while the work was still going, which unlike
 * the claim were produced before the argument started and with both sides'
 * agreement.
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Scale, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import RatingPenaltyControl from "@/components/admin/RatingPenaltyControl";

const API_BASE = `${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api/admin/disputes`;

function getAuthHeaders() {
  const token = localStorage.getItem("tokun_admin_token") || localStorage.getItem("adminToken") || "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}` } : {}),
  };
}

const rupees = (n?: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const when = (v?: string | null) =>
  v ? new Date(v).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "—";

type Dispute = {
  _id: string;
  orderKind: "hire" | "service";
  title: string;
  status: string;
  /** Which side asked to cancel. "admin" when a cron referred it. */
  raisedBy?: "buyer" | "seller" | "admin";
  reason: string;
  totalPayable: number;
  sellerAmount: number;
  proposedSellerPercent: number | null;
  proposalNote: string;
  proofFiles: { name: string; size: number }[];
  /** The client's own evidence, attached when they disagreed with the claim. */
  buyerProofFiles?: { name: string; size: number }[];
  buyerResponse: string;
  buyerResponseNote: string;
  createdAt: string;
  finalSellerPercent?: number | null;
  finalSellerPayout?: number;
  finalRefundAmount?: number;
  buyerId?: { _id: string; name?: string; email?: string };
  sellerId?: { _id: string; name?: string; email?: string; cancelledAfterPaymentCount?: number };
  preview?: { sellerPayout: number; refundAmount: number; platformKeeps: number } | null;
};

type ProgressReview = {
  _id: string;
  status: string;
  requestNote: string;
  responseNote: string;
  declineReason: string;
  progressPercent: number | null;
  media: { index: number; name: string; kind: string }[];
  createdAt: string;
};

const TABS = [
  { id: "ADMIN_REVIEW", label: "Needs a decision" },
  { id: "PROPOSED", label: "Awaiting client" },
  { id: "OPEN", label: "Awaiting creator" },
  { id: "RESOLVED", label: "Resolved" },
];

/**
 * Who asked to cancel, named.
 *
 * The queue used to label every reason "Client: …" regardless of who actually
 * raised it, so a cancellation started by the creator read as the client's
 * words — which is the wrong way round for the person about to rule on it.
 */
function cancelledBy(d: Dispute): { role: string; name: string } {
  if (d.raisedBy === "seller") return { role: "Creator", name: d.sellerId?.name || "the creator" };
  if (d.raisedBy === "admin") return { role: "Tokun", name: "referred automatically" };
  return { role: "Client", name: d.buyerId?.name || "the client" };
}

/** One row of previewSettlement() — see services/escrowSettlement.service.js. */
type SettlementPreview = {
  sellerPercent: number;
  sellerPayout: number;
  refundAmount: number;
  /** The buyer's platform fee, plus any commission kept. Never refunded. */
  platformKeeps: number;
};

type Submission = {
  version: number;
  note: string;
  submittedAt: string;
  files: { name: string; kind: string; size: number; url: string | null }[];
};

/**
 * Opens a piece of evidence in a new tab.
 *
 * Both routes hand back a short-lived signed URL rather than the file, so this
 * is a fetch-then-open rather than a plain link. Errors are surfaced — an
 * arbitrator silently getting nothing when they click "proof" is how a ruling
 * ends up being made without it.
 */
async function openEvidence(path: string) {
  try {
    const res = await fetch(`${API_BASE}${path}`, { headers: getAuthHeaders() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success || !data?.url) {
      toast({
        title: "Couldn't open this file",
        description: data?.message || data?.error || "Try again in a moment.",
      });
      return;
    }
    window.open(data.url, "_blank", "noopener,noreferrer");
  } catch {
    toast({ title: "Couldn't reach the server", description: "Check your connection and try again." });
  }
}

/** Progress-review media lives on its own route, outside /admin/disputes. */
async function openProgressMedia(reviewId: string, index: number) {
  const base = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/api/progress-review/${reviewId}/media/${index}/download`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success || !data?.url) {
      toast({
        title: "Couldn't open this file",
        description: data?.message || data?.error || "Try again in a moment.",
      });
      return;
    }
    window.open(data.url, "_blank", "noopener,noreferrer");
  } catch {
    toast({ title: "Couldn't reach the server", description: "Check your connection and try again." });
  }
}

export default function AdminDisputesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("ADMIN_REVIEW");
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{
    dispute: Dispute;
    progressReviews: ProgressReview[];
    submissions?: Submission[];
    timeline?: { label: string; at: string }[];
    /* What each ruling actually pays, computed server-side by
       previewSettlement() off the real order — one entry for 0% and one for
       100%. Showing `totalPayable` here instead was wrong by the buyer's
       platform fee: a ₹3,000 deal reads ₹3,090, but only ₹3,000 is ever
       refundable or payable. The fee is non-refundable in every branch of the
       settlement, so it can never be part of either figure. */
    previews?: SettlementPreview[];
  } | null>(null);
  /* An admin ruling awards the whole amount to one side — there is no partial
     split at this stage, so there is no percentage to hold. */
  const [winner, setWinner] = useState<"client" | "freelancer" | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [resolving, setResolving] = useState(false);
  // Second step of the settle button — see the confirm panel in the footer.
  const [confirmSettle, setConfirmSettle] = useState(false);

  /* What each ruling pays, taken from the server's own settlement preview
     rather than re-derived here — the same function the settlement itself runs,
     so the screen can't promise a number the money won't match.

     null when the preview is missing, which only happens if the order behind
     the dispute is gone. The settlement would fail in that case anyway, so the
     amounts render as "—" and the ruling button stays disabled rather than
     showing a figure nobody can honour. */
  const previewAt = (percent: number) =>
    detail?.previews?.find((p) => p.sellerPercent === percent) || null;

  const clientWinsAmount = previewAt(0)?.refundAmount ?? null;
  const creatorWinsAmount = previewAt(100)?.sellerPayout ?? null;
  // The buyer-side platform fee — kept whichever way the ruling goes.
  const platformKeeps = previewAt(0)?.platformKeeps ?? null;

  const winnerAmount = winner === "client" ? clientWinsAmount : creatorWinsAmount;
  const money = (n: number | null) => (n === null ? "—" : rupees(n));

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}?status=${tab}`, { headers: getAuthHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.message || data?.error || "Couldn't load disputes.");
      setDisputes(data.disputes || []);
    } catch (err: any) {
      setError(err?.message || "Couldn't load disputes.");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const openDetail = async (id: string) => {
    setOpenId(id);
    setDetail(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`, { headers: getAuthHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.message || "Couldn't load that dispute.");
      setDetail({
        dispute: data.dispute,
        progressReviews: data.progressReviews || [],
        submissions: data.submissions || [],
        timeline: data.timeline || [],
        previews: data.previews || [],
      });
      // No default winner. An arbitrator should have to pick a side rather than
      // find one pre-selected and confirm it.
      setWinner(null);
      setAdminNote("");
      setConfirmSettle(false);
    } catch (err: any) {
      setError(err?.message || "Couldn't load that dispute.");
      setOpenId(null);
    }
  };

  const resolve = async () => {
    if (!detail || !winner) return;

    try {
      setResolving(true);
      const res = await fetch(`${API_BASE}/${detail.dispute._id}/resolve`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ winner, adminNote }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.message || data?.error || "Settlement failed.");
      toast({ title: "Settled", description: data.message });
      setOpenId(null);
      setDetail(null);
      await loadList();
    } catch (err: any) {
      toast({ title: "Settlement failed", description: err?.message || "Please try again." });
    } finally {
      setResolving(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <Scale className="w-6 h-6" /> Cancellation disputes
            </h1>
            <p className="mt-1.5 text-sm text-white/45">
              Cancellations the two sides couldn't settle. Oldest first — a dispute waiting three
              days matters more than one raised this morning.
            </p>
          </div>
          <button
            onClick={loadList}
            className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-white/15 text-sm text-white/70 hover:bg-white/[0.06]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 h-9 rounded-full text-sm font-medium transition ${
                tab === t.id ? "bg-white/[0.10] text-white" : "text-white/55 hover:bg-white/[0.06]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {loading ? (
            <p className="text-white/45 text-sm py-4">Loading…</p>
          ) : error ? (
            <p className="text-[#FABC4E] text-sm py-4">{error}</p>
          ) : !disputes.length ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/40 text-sm">
              Nothing in this queue.
            </div>
          ) : (
            disputes.map((d) => (
              <button
                key={d._id}
                onClick={() => openDetail(d._id)}
                className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/25 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{d.title || "Untitled"}</p>
                    <p className="mt-1 text-xs text-white/40">
                      {d.orderKind === "hire" ? "Project" : "Service"} · {d.buyerId?.name || "Client"} ↔{" "}
                      {d.sellerId?.name || "Creator"} · opened {when(d.createdAt)}
                    </p>
                    {/* Which side started this, said before the reason — the
                        same sentence means opposite things depending on it. */}
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/60">
                      Cancelled by {cancelledBy(d).role}
                    </p>
                    {d.reason && (
                      <p className="mt-1.5 text-xs text-white/55 line-clamp-2">
                        {cancelledBy(d).role}: “{d.reason}”
                      </p>
                    )}
                    {/* A creator who has walked away before is context the
                        decision genuinely needs. */}
                    {!!d.sellerId?.cancelledAfterPaymentCount && (
                      <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#FABC4E]">
                        <AlertTriangle className="w-3 h-3" />
                        Creator has abandoned {d.sellerId.cancelledAfterPaymentCount} paid booking
                        {d.sellerId.cancelledAfterPaymentCount === 1 ? "" : "s"} before
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm">{rupees(d.totalPayable)}</p>
                    {/* Percentages were reporting a partial split that can no
                        longer happen — a claim is now one of two positions. */}
                    {d.proposedSellerPercent !== null && (
                      <p className="mt-1 text-[11px] text-white/45">
                        {d.proposedSellerPercent === 100
                          ? "Creator claims the payment"
                          : "Creator agreed to cancel"}
                      </p>
                    )}
                    {d.status === "RESOLVED" && d.finalSellerPercent !== null && (
                      <p className="mt-1 text-[11px] text-[#19E66C]">
                        {d.finalSellerPercent === 100 ? "Paid to creator" : "Refunded to client"}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Decision view ──────────────────────────────────────────────────── */}
      {openId && (
        <div
          className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center px-4 py-8"
          onClick={() => !resolving && setOpenId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[680px] max-w-full max-h-full flex flex-col rounded-2xl bg-[#0E0F12] border border-white/10 overflow-hidden"
          >
            {!detail ? (
              <p className="p-8 text-white/45 text-sm">Loading dispute…</p>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3 p-5 border-b border-white/10 shrink-0">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{detail.dispute.title}</p>
                    <p className="text-xs text-white/45 mt-0.5">
                      {detail.dispute.buyerId?.email} ↔ {detail.dispute.sellerId?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => !resolving && setOpenId(null)}
                    className="text-white/60 hover:text-white text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-5 space-y-4 overflow-y-auto">
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4">
                    <p className="text-[10px] font-bold tracking-[1.4px] text-white/40 uppercase mb-2">
                      Who cancelled, and why
                    </p>
                    {/* Named, not just role-labelled: the ruling below is about
                        these two people, and "the client" is not who an admin
                        is reading about three tabs later. */}
                    <p className="text-sm font-semibold text-white mb-1.5">
                      {cancelledBy(detail.dispute).role}
                      <span className="font-normal text-white/45">
                        {" "}
                        — {cancelledBy(detail.dispute).name}
                      </span>
                    </p>
                    <p className="text-sm text-white/75 whitespace-pre-line">
                      {detail.dispute.reason || "No reason given."}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4">
                    <p className="text-[10px] font-bold tracking-[1.4px] text-white/40 uppercase mb-2">
                      Creator's claim
                    </p>
                    {detail.dispute.proposedSellerPercent !== null ? (
                      <>
                        <p className="text-sm">
                          <strong>
                            {detail.dispute.proposedSellerPercent === 100
                              ? "Says the work was delivered"
                              : "Agreed to cancel"}
                          </strong>
                        </p>
                        {detail.dispute.proposalNote && (
                          <p className="mt-2 text-sm text-white/65 whitespace-pre-line">
                            {detail.dispute.proposalNote}
                          </p>
                        )}
                        {/* Clickable. These were listed by filename only, so the
                            proof existed on screen and could not be looked at. */}
                        {detail.dispute.proofFiles?.length > 0 && (
                          <div className="mt-2.5 space-y-1.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
                              Proof of work ({detail.dispute.proofFiles.length})
                            </p>
                            {detail.dispute.proofFiles.map((f, i) => (
                              <button
                                key={`${f.name}-${i}`}
                                type="button"
                                onClick={() => openEvidence(`/${detail.dispute._id}/proof/${i}/download`)}
                                className="w-full flex items-center justify-between gap-3 rounded-lg bg-black/25 border border-white/[0.07] px-3 py-2 text-left hover:border-white/25 transition"
                              >
                                <span className="text-xs text-white/75 truncate">📎 {f.name}</span>
                                <span className="text-[10px] text-[#63A6F2] shrink-0">Open ↗</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-white/40">No claim submitted.</p>
                    )}
                    {(detail.dispute.buyerResponseNote ||
                      !!detail.dispute.buyerProofFiles?.length) && (
                      <div className="mt-3 pt-3 border-t border-white/[0.07]">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35 mb-1.5">
                          Client disagreed
                        </p>
                        {detail.dispute.buyerResponseNote && (
                          <p className="text-sm text-white/65 whitespace-pre-line">
                            {detail.dispute.buyerResponseNote}
                          </p>
                        )}
                        {/* The client's own files. Both sides get to show their
                            work now, so a ruling isn't made on one party's
                            evidence and the other party's adjectives. */}
                        {!!detail.dispute.buyerProofFiles?.length && (
                          <div className="mt-2 space-y-1.5">
                            {detail.dispute.buyerProofFiles.map((f, i) => (
                              <button
                                key={`${f.name}-${i}`}
                                type="button"
                                onClick={() =>
                                  openEvidence(
                                    `/${detail.dispute._id}/proof/${i}/download?side=buyer`
                                  )
                                }
                                className="w-full flex items-center justify-between gap-3 rounded-lg bg-black/25 border border-white/[0.07] px-3 py-2 text-left hover:border-white/25 transition"
                              >
                                <span className="text-xs text-white/75 truncate">📎 {f.name}</span>
                                <span className="text-[10px] text-[#63A6F2] shrink-0">Open ↗</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* The strongest evidence available: recorded while the work
                      was still going, at the client's own request. */}
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4">
                    <p className="text-[10px] font-bold tracking-[1.4px] text-white/40 uppercase mb-2">
                      Progress checkpoints during the work
                    </p>
                    {detail.progressReviews.length ? (
                      <div className="space-y-2">
                        {detail.progressReviews.map((r) => (
                          <div key={r._id} className="rounded-lg bg-black/25 border border-white/[0.07] p-2.5">
                            <p className="text-[11px] text-white/40">
                              {when(r.createdAt)} · {r.status}
                              {r.progressPercent !== null ? ` · creator said ${r.progressPercent}% done` : ""}
                            </p>
                            {r.responseNote && (
                              <p className="mt-1 text-sm text-white/70 whitespace-pre-line">{r.responseNote}</p>
                            )}
                            {r.declineReason && (
                              <p className="mt-1 text-sm text-white/55">Declined: {r.declineReason}</p>
                            )}
                            {r.media?.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {r.media.map((m, i) => (
                                  <button
                                    key={`${m.name}-${i}`}
                                    type="button"
                                    onClick={() => openProgressMedia(r._id, i)}
                                    className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] border border-white/[0.08] px-2 py-1 text-[11px] text-white/70 hover:border-white/25 hover:text-white transition"
                                  >
                                    📎 <span className="max-w-[180px] truncate">{m.name}</span>
                                    <span className="text-[#63A6F2]">↗</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/40">
                        None — the client never asked for an update, so there's no independent record
                        of progress.
                      </p>
                    )}
                  </div>

                  {/* Was anything actually handed over? The single question these
                      cases turn on, and the screen had no answer for it — every
                      submission was already in the API response and none of it
                      was rendered. */}
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4">
                    <p className="text-[10px] font-bold tracking-[1.4px] text-white/40 uppercase mb-2">
                      What was delivered
                    </p>
                    {detail.submissions?.length ? (
                      <div className="space-y-2.5">
                        {detail.submissions.map((s) => (
                          <div key={s.version} className="rounded-lg bg-black/25 border border-white/[0.07] p-2.5">
                            <p className="text-[11px] text-white/40">
                              Submission {s.version} · {when(s.submittedAt)}
                            </p>
                            {s.note && (
                              <p className="mt-1 text-sm text-white/70 whitespace-pre-line">{s.note}</p>
                            )}
                            {s.files?.length > 0 ? (
                              <div className="mt-1.5 space-y-1">
                                {s.files.map((f, i) => (
                                  <p key={`${f.name}-${i}`} className="text-[11px] text-white/55">
                                    {f.kind === "link" && f.url ? (
                                      <a
                                        href={f.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#63A6F2] hover:underline"
                                      >
                                        🔗 {f.name} ↗
                                      </a>
                                    ) : (
                                      <>📎 {f.name}</>
                                    )}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-1 text-[11px] text-white/30">No files on this submission.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#FABC4E]">
                        Nothing was ever submitted — the creator never delivered any work through
                        Tokun.
                      </p>
                    )}
                  </div>

                  {/* Order of events, so "they went quiet for three weeks" is
                      checkable rather than something one side asserts. */}
                  {!!detail.timeline?.length && (
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4">
                      <p className="text-[10px] font-bold tracking-[1.4px] text-white/40 uppercase mb-2">
                        Timeline
                      </p>
                      <div className="space-y-1.5">
                        {detail.timeline.map((e, i) => (
                          <div key={i} className="flex items-baseline gap-2.5">
                            <span className="text-[11px] text-white/35 shrink-0 w-[130px]">
                              {when(e.at)}
                            </span>
                            <span className="text-xs text-white/70">{e.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* The decision itself — who was in the right. There is no
                      slider any more: an admin ruling awards the whole amount to
                      one side. A partial split is something the two of them can
                      agree between themselves; once it reaches arbitration,
                      answering "who was right" with 40% satisfies neither of
                      them and leaves Tokun defending a number it made up. */}
                  <div className="rounded-xl border border-[#C084FC]/25 bg-[#C084FC]/[0.06] p-4">
                    <p className="text-sm font-semibold mb-1">Your ruling</p>
                    <p className="text-[11px] text-white/45 mb-3">
                      {money(clientWinsAmount)} goes to whoever was in the right — Tokun
                      waives its commission.
                      {platformKeeps ? (
                        <>
                          {" "}
                          The {rupees(platformKeeps)} platform fee the client paid on top is
                          not refundable either way.
                        </>
                      ) : null}
                    </p>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setWinner("client");
                          // Switching sides must invalidate a pending confirm.
                          setConfirmSettle(false);
                        }}
                        className={`rounded-xl border p-3 text-left transition ${
                          winner === "client"
                            ? "border-[#63A6F2] bg-[#63A6F2]/[0.12]"
                            : "border-white/10 bg-white/[0.03] hover:border-white/25"
                        }`}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">
                          Client wins
                        </p>
                        <p className="mt-1 text-sm font-semibold truncate">
                          {detail.dispute.buyerId?.name || "Client"}
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#63A6F2]">
                          {money(clientWinsAmount)} refunded
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setWinner("freelancer");
                          setConfirmSettle(false);
                        }}
                        className={`rounded-xl border p-3 text-left transition ${
                          winner === "freelancer"
                            ? "border-[#19E66C] bg-[#19E66C]/[0.12]"
                            : "border-white/10 bg-white/[0.03] hover:border-white/25"
                        }`}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">
                          Creator wins
                        </p>
                        <p className="mt-1 text-sm font-semibold truncate">
                          {detail.dispute.sellerId?.name || "Creator"}
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#19E66C]">
                          {money(creatorWinsAmount)} paid out
                        </p>
                      </button>
                    </div>

                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Reasoning — both parties see this in their email."
                      className="mt-4 w-full h-20 rounded-lg bg-[#1A1A1A] border border-white/10 p-3 text-sm outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="p-4 border-t border-white/10 shrink-0">
                  {/* Two-step, in page. This used to be a window.confirm — a
                      grey OS box in the middle of a purple modal, and one the
                      admin could dismiss with a stray Enter. The names and the
                      amount are still spelled out, because the move is
                      irreversible. */}
                  {confirmSettle ? (
                    <div className="rounded-2xl border border-[#C084FC]/30 bg-[#C084FC]/10 p-3">
                      <p className="text-xs text-white/85">
                        Award {money(winnerAmount)} to{" "}
                        {winner === "client"
                          ? detail.dispute.buyerId?.name || "the client"
                          : detail.dispute.sellerId?.name || "the creator"}
                        ? This moves money and can't be undone.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={resolve}
                          disabled={resolving}
                          className="flex-1 h-10 rounded-full text-sm font-semibold text-white bg-[#C084FC] hover:bg-[#A855F7] disabled:opacity-50"
                        >
                          {resolving ? "Settling…" : "Yes, settle now"}
                        </button>
                        <button
                          onClick={() => setConfirmSettle(false)}
                          disabled={resolving}
                          className="h-10 px-4 rounded-full text-sm font-semibold text-white/80 bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmSettle(true)}
                      disabled={
                        resolving ||
                        !winner ||
                        // No preview means the order behind this dispute is gone
                        // — the settlement would fail, so don't offer to run it.
                        winnerAmount === null ||
                        detail.dispute.status === "RESOLVED"
                      }
                      className="w-full h-11 rounded-full text-sm font-semibold text-white bg-[#C084FC] hover:bg-[#A855F7] disabled:opacity-50"
                    >
                      {detail.dispute.status === "RESOLVED"
                        ? "Already settled"
                        : !winner
                        ? "Pick who was in the right"
                        : winner === "client"
                        ? `Refund ${money(clientWinsAmount)} to ${detail.dispute.buyerId?.name || "the client"}`
                        : `Pay ${money(creatorWinsAmount)} to ${detail.dispute.sellerId?.name || "the creator"}`}
                    </button>
                  )}

                  {/* Ruling for the client says the creator lost the argument.
                      It does not automatically say they were negligent — a job
                      can fall apart with nobody behaving badly. So the rating
                      deduction is a second, separate decision, taken here where
                      the admin has just read the whole case. */}
                  <RatingPenaltyControl
                    creatorId={detail.dispute.sellerId?._id}
                    creatorName={detail.dispute.sellerId?.name || "the creator"}
                    getAuthHeaders={getAuthHeaders}
                    context={{
                      kind: "dispute",
                      disputeId: detail.dispute._id,
                      orderKind: detail.dispute.orderKind as "hire" | "service",
                      title: detail.dispute.title || "",
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
