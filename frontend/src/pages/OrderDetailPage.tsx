/**
 * One order, seen by whichever side is looking at it.
 *
 * Everything that can happen to a funded booking between payment and closure
 * lives here — the brief and its attachments, progress checkpoints, the
 * delivery, cancellation, and the split negotiation if a cancellation isn't
 * clean. Before this, those were scattered: the seller's view was a modal four
 * clicks inside Service Bookings, and the buyer had no view at all beyond a
 * card in a chat thread.
 *
 * Hire deals and service bookings render identically because they behave
 * identically at this stage; the only real difference is which endpoint the
 * order comes from and what its fields are called, which `normalizeOrder`
 * absorbs.
 */

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import CancelBookingModal from "@/components/escrow/CancelBookingModal";
import DisputePanel from "@/components/escrow/DisputePanel";
import ProgressReviewPanel from "@/components/escrow/ProgressReviewPanel";
import ExecutionTimeline from "@/components/escrow/ExecutionTimeline";
import SubmitWorkModal from "@/components/escrow/SubmitWorkModal";
import {
  openBriefAttachment,
  rupees,
  formatDateTime,
  deadlineLabel,
  type OrderKind,
} from "@/lib/escrowApi";
import {
  downloadDeliverable,
  isPreviewable,
  formatBytes,
  SERVICE_LINK_LABELS,
} from "@/lib/serviceDeliverables";
import DeliverablePreviewModal from "@/components/escrow/DeliverablePreviewModal";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const GRAD = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

const STATUS_TONE: Record<string, { color: string; bg: string }> = {
  FUNDED: { color: "#63A6F2", bg: "rgba(26,115,232,0.10)" },
  IN_PROGRESS: { color: "#63A6F2", bg: "rgba(26,115,232,0.10)" },
  WORK_SUBMITTED: { color: "#C084FC", bg: "rgba(192,132,252,0.10)" },
  REVISION_REQUESTED: { color: "#FABC4E", bg: "rgba(250,188,78,0.10)" },
  DISPUTED: { color: "#FABC4E", bg: "rgba(250,188,78,0.10)" },
  COMPLETED: { color: "#19E66C", bg: "rgba(25,230,108,0.10)" },
  SETTLED: { color: "#8F8996", bg: "rgba(255,255,255,0.05)" },
  REFUNDED: { color: "#8F8996", bg: "rgba(255,255,255,0.05)" },
  CANCELLED: { color: "#8F8996", bg: "rgba(255,255,255,0.05)" },
};

const CANCELLABLE = ["FUNDED", "IN_PROGRESS", "WORK_SUBMITTED", "REVISION_REQUESTED"];
const WORK_UNDERWAY = ["FUNDED", "IN_PROGRESS", "REVISION_REQUESTED"];

/** Flattens the two order shapes into the one this page renders. */
function normalizeOrder(kind: OrderKind, raw: any, viewerId: string) {
  const isHire = kind === "hire";
  const buyer = isHire ? raw.clientId : raw.buyerId;
  const seller = isHire ? raw.freelancerId : raw.sellerId;

  /* Both sides are matched explicitly, and neither-matches resolves to null.
     This used to be `buyer matches ? "buyer" : "seller"` — an else branch that
     called anyone who wasn't the buyer a seller, without ever looking at the
     seller's id. A populated ref comes back NULL when the user it points at has
     been deleted, so on such an order `buyer?._id` is undefined, the match
     fails, and the CLIENT was labelled the seller — which is what put a "Start
     work" button on the client's own order page.

     null is the safe resolution: every action below is gated on an explicit
     "buyer" or "seller", so an order whose viewer can't be identified renders
     read-only rather than offering the other side's actions. */
  const viewerIsBuyer = !!buyer?._id && String(buyer._id) === viewerId;
  const viewerIsSeller = !!seller?._id && String(seller._id) === viewerId;

  return {
    id: String(raw._id),
    title: isHire ? raw.title : raw.serviceTitle,
    description: isHire ? raw.description : "",
    note: raw.note || "",
    briefAttachments: raw.briefAttachments || [],
    buyer,
    seller,
    role: (viewerIsBuyer ? "buyer" : viewerIsSeller ? "seller" : null) as
      | "buyer"
      | "seller"
      | null,
    status: raw.status,
    fundsStatus: raw.fundsStatus,
    amount: Number(raw.amount || 0),
    totalPayable: Number(raw.totalPayable || raw.amount || 0),
    sellerAmount: Number((isHire ? raw.freelancerAmount : raw.sellerAmount) || 0),
    platformFee: Number(raw.platformFee || 0),
    platformFeeGst: Number(raw.platformFeeGst || 0),
    // What the buyer was charged on top of the price, and the GST on it.
    clientFee: Number(raw.clientFee || 0),
    clientFeeGst: Number(raw.clientFeeGst || 0),
    deliverables: raw.deliverables || [],
    submissionNote: raw.submissionNote || "",
    revisions: raw.revisions || [],
    settlementSellerPercent: raw.settlementSellerPercent,
    settlementSellerPayout: raw.settlementSellerPayout,
    refundAmount: raw.refundAmount,
    escrowExpiresAt: raw.escrowExpiresAt,
    // Service bookings only — a hire deal carries a target date instead, so
    // these stay null and the deadline block simply doesn't render.
    deliveryDays: raw.deliveryDays ?? null,
    deliveryDueAt: raw.deliveryDueAt || null,
    // The server's verdict, not the browser's clock. A machine running a few
    // minutes behind must not show "Submit work" for an order the server will
    // reject.
    deliveryOverdue: !!raw.deliveryOverdue,
    chatId: raw.chatId,
    createdAt: raw.createdAt,
    paidAt: raw.paidAt,
    workStartedAt: raw.workStartedAt,
    workSubmittedAt: raw.workSubmittedAt,
    approvedAt: raw.approvedAt,
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-[10px] font-bold tracking-[1.4px] text-white/40 uppercase mb-3">{title}</p>
      {children}
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderKind, orderId } = useParams<{ orderKind: OrderKind; orderId: string }>();
  const { user, token } = useAuth() as any;
  const navigate = useNavigate();

  const [order, setOrder] = useState<ReturnType<typeof normalizeOrder> | null>(null);
  const [revisionState, setRevisionState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");
  // Which delivered file is open in the preview modal, by index. null = closed.
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  // Which action is in flight — used to disable the whole row, so a client
  // can't fire "approve" and "request revision" at each other.
  const [busyAction, setBusyAction] = useState<string | null>(null);

  // The delivery countdown is the one thing on this page that changes without
  // anyone touching it, so it gets its own minute tick. Minute, not second:
  // the label never shows anything finer than minutes.
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const kind = (orderKind === "hire" ? "hire" : "service") as OrderKind;

  const load = useCallback(async () => {
    if (!token || !orderId || !user?._id) return;
    try {
      setLoading(true);
      setError("");
      // Two endpoints rather than a new unified one — both already return the
      // whole document to either party, and both already enforce that.
      const url =
        kind === "hire"
          ? `${API_BASE}/api/hire/${orderId}`
          : `${API_BASE}/api/services/orders/${orderId}`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || "Couldn't load this order.");
      }
      const raw = kind === "hire" ? data.deal : data.order;
      setOrder(normalizeOrder(kind, raw, String(user._id)));
      setRevisionState(data.revisionState || null);
    } catch (err: any) {
      setError(err?.message || "Couldn't load this order.");
    } finally {
      setLoading(false);
    }
  }, [kind, orderId, token, user?._id]);

  useEffect(() => {
    load();
  }, [load]);

  /* One POST helper for start-work / approve-work / request-revision — the
     three differ only in path and body, and the paths differ only by order
     kind. Reloads afterwards so the timeline and status reflect the change
     without a manual refresh. */
  const act = useCallback(
    async (action: string, successTitle: string, body?: Record<string, unknown>) => {
      if (!token) return;
      const base =
        kind === "hire"
          ? `${API_BASE}/api/hire/${orderId}`
          : `${API_BASE}/api/services/orders/${orderId}`;

      try {
        setBusyAction(action);
        const res = await fetch(`${base}/${action}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body || {}),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
          throw new Error(data?.message || data?.error || "Couldn't complete that.");
        }
        toast({ title: successTitle, description: data.message || "" });
        setRevisionOpen(false);
        setRevisionReason("");
        await load();
      } catch (err: any) {
        toast({ title: "Couldn't complete that", description: err?.message || "Please try again." });
      } finally {
        setBusyAction(null);
      }
    },
    [kind, orderId, token, load]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-white">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <p className="text-white/45 text-sm">Loading order…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-white">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <p className="text-[#FABC4E] text-sm">{error || "Order not found."}</p>
          <button
            onClick={() => navigate("/orders")}
            className="mt-4 h-10 px-5 rounded-full text-sm font-semibold text-white"
            style={{ background: GRAD }}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const tone = STATUS_TONE[order.status] || STATUS_TONE.CANCELLED;
  const counterparty = order.role === "buyer" ? order.seller : order.buyer;
  const isDisputed = order.status === "DISPUTED";
  const canCancel = CANCELLABLE.includes(order.status) && order.fundsStatus === "HELD_BY_TOKUN";
  const showProgress = WORK_UNDERWAY.includes(order.status) || order.status === "DISPUTED";
  // The deadline only means anything while the work is still owed.
  const deadline = WORK_UNDERWAY.includes(order.status)
    ? deadlineLabel(order.deliveryDueAt, nowTick)
    : null;
  // The server's flag is the authority, but a page left open past the deadline
  // has to catch up on its own — otherwise the button stays live until reload.
  const missedDeadline = order.deliveryOverdue || !!deadline?.overdue;
  // Blocked the moment the promised date passes. The server rejects a late
  // submission outright, so offering the button would only produce an error
  // after the seller has picked their files.
  const canSubmitWork = WORK_UNDERWAY.includes(order.status) && !missedDeadline;
  // Cancelling means something different once the seller has invested time,
  // which changes both the button's label and the warning under it.
  const workUnderway = ["IN_PROGRESS", "WORK_SUBMITTED", "REVISION_REQUESTED"].includes(order.status);

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white">
      <Header />

      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 space-y-4">
        <button
          onClick={() => navigate("/orders")}
          className="text-sm text-white/45 hover:text-white transition"
        >
          ← Orders
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold truncate">{order.title}</h1>
            <p className="mt-1.5 text-sm text-white/45">
              {order.role === "buyer" ? "You hired" : "Hired by"}{" "}
              <span className="text-white/70">{counterparty?.name || "—"}</span>
              {" · "}
              {kind === "hire" ? "Project" : "Service booking"}
            </p>
          </div>
          <span
            className="shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full"
            style={{ color: tone.color, background: tone.bg }}
          >
            {order.status.replace(/_/g, " ")}
          </span>
        </div>

        {/* The cancellation negotiation outranks everything else on the page —
            it's the only thing either side can act on while it's open. */}
        {isDisputed && (
          <DisputePanel
            orderKind={kind}
            orderId={order.id}
            role={order.role}
            token={token}
            onChanged={load}
          />
        )}

        {/* Settled outcomes say where the money went, not just "Cancelled". */}
        {order.settlementSellerPercent !== null && order.settlementSellerPercent !== undefined && (
          <Section title="How this was settled">
            <p className="text-sm text-white/75">
              Assessed at <strong>{order.settlementSellerPercent}%</strong> completed —{" "}
              {rupees(order.settlementSellerPayout)} to the creator,{" "}
              {rupees(order.refundAmount)} refunded to the client.
            </p>
          </Section>
        )}

        {/* The promised delivery date, kept in front of both sides for as long
            as the work is owed. It sits above the timeline because once a
            deadline is close it outranks everything else here. */}
        {deadline && (
          <div
            className="rounded-2xl border p-4 sm:p-5"
            style={{
              borderColor:
                deadline.tone === "late"
                  ? "rgba(255,107,107,0.35)"
                  : deadline.tone === "soon"
                    ? "rgba(250,188,78,0.35)"
                    : "rgba(255,255,255,0.10)",
              background:
                deadline.tone === "late"
                  ? "rgba(255,107,107,0.07)"
                  : deadline.tone === "soon"
                    ? "rgba(250,188,78,0.06)"
                    : "rgba(255,255,255,0.03)",
            }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-[10px] font-bold tracking-[1.4px] text-white/40 uppercase">
                Delivery deadline
              </p>
              <p
                className="text-sm font-semibold"
                style={{
                  color:
                    deadline.tone === "late"
                      ? "#FF8F8F"
                      : deadline.tone === "soon"
                        ? "#FABC4E"
                        : "#63A6F2",
                }}
              >
                {deadline.text}
              </p>
            </div>

            <p className="mt-1.5 text-sm text-white/75">
              {formatDateTime(order.deliveryDueAt)}
              {order.deliveryDays ? (
                <span className="text-white/35">
                  {" "}
                  · {order.deliveryDays} day{order.deliveryDays === 1 ? "" : "s"} from payment
                </span>
              ) : null}
            </p>

            {/* Says what the passed deadline actually means for whoever is
                reading, rather than leaving them to find out by clicking. */}
            {missedDeadline && (
              <p className="mt-3 pt-3 border-t border-white/[0.07] text-[12px] leading-relaxed text-white/60">
                {order.role === "seller"
                  ? "You can no longer submit work on this booking. Talk to the client — they can cancel for a refund, or Tokun can settle it between you."
                  : "The creator has missed the delivery date and can no longer submit work. You can cancel below and get your payment back, or agree a new plan with them in chat."}
              </p>
            )}
          </div>
        )}

        {/* Where this has got to and whose move it is — the question people
            open a booking to answer, which the page never used to state. */}
        <ExecutionTimeline
          status={order.status}
          role={order.role}
          createdAt={order.createdAt}
          paidAt={order.paidAt}
          workStartedAt={order.workStartedAt}
          workSubmittedAt={order.workSubmittedAt}
          approvedAt={order.approvedAt}
          revisionCount={order.revisions.length}
        />

        <Section title="What the client asked for">
          {order.note || order.description ? (
            <p className="text-sm text-white/80 whitespace-pre-line leading-relaxed">
              {order.note || order.description}
            </p>
          ) : (
            <p className="text-sm text-white/40">
              No brief was written — the service was booked as listed.
            </p>
          )}

          {order.briefAttachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {order.briefAttachments.map((a: any, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    openBriefAttachment(kind, order.id, i, token).catch((err: any) =>
                      toast({ title: "Couldn't open", description: err?.message || "Try again." })
                    )
                  }
                  className="w-full flex items-center justify-between gap-3 rounded-lg bg-black/25 border border-white/[0.07] px-3 py-2 hover:border-white/25 transition"
                >
                  <span className="text-sm truncate">📎 {a.name}</span>
                  <span className="text-[11px] text-white/35 shrink-0">{formatBytes(a.size)}</span>
                </button>
              ))}
            </div>
          )}
        </Section>

        {showProgress && (
          <ProgressReviewPanel orderKind={kind} orderId={order.id} token={token} />
        )}

        {order.deliverables.length > 0 && (
          <Section title="Delivered">
            <div className="space-y-2">
              {order.deliverables.map((d: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-lg bg-black/25 border border-white/[0.07] px-3 py-2"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span>{d.kind === "link" ? "🔗" : "📎"}</span>
                    <div className="min-w-0">
                      <p className="text-sm truncate">{d.name}</p>
                      <p className="text-[11px] text-white/35">
                        {d.kind === "link"
                          ? SERVICE_LINK_LABELS[d.provider] || "External link"
                          : formatBytes(d.size)}
                      </p>
                    </div>
                  </div>
                  {d.kind === "link" ? (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#63A6F2] hover:underline shrink-0"
                    >
                      Open
                    </a>
                  ) : isPreviewable(d.name, d.mimeType) ? (
                    // Images and video open in place. The server watermarks the
                    // image bytes while the money is held, and the player marks
                    // its own surface for video; downloading first just to look
                    // at the work defeated the point of either.
                    <button
                      type="button"
                      onClick={() => setPreviewIndex(i)}
                      className="text-xs text-[#63A6F2] hover:underline shrink-0"
                    >
                      Preview
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        // `kind` matters: without it this defaulted to the
                        // service endpoint, so a hire deal's files 404'd.
                        downloadDeliverable(order.id, i, d.name, token, kind).catch((err: any) =>
                          toast({ title: "Download failed", description: err?.message || "Try again." })
                        )
                      }
                      className="text-xs text-[#63A6F2] hover:underline shrink-0"
                    >
                      Download
                    </button>
                  )}
                </div>
              ))}
            </div>
            {order.submissionNote && (
              <p className="mt-3 text-sm text-white/60 whitespace-pre-line">{order.submissionNote}</p>
            )}
          </Section>
        )}

        <Section title="Payment">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-white/45">Price</span>
              <span>{rupees(order.amount)}</span>
            </div>
            {/* Each side sees only its own deductions or additions — a buyer
                doesn't need the seller's commission, and vice versa. Both are
                itemised rather than rolled into one number, because "10%
                commission" doesn't explain an 11.8% deduction. */}
            {order.role === "seller" && !!order.platformFee && (
              <>
                <div className="flex justify-between">
                  <span className="text-white/45">Commission</span>
                  <span className="text-white/60">− {rupees(order.platformFee)}</span>
                </div>
                {!!order.platformFeeGst && (
                  <div className="flex justify-between">
                    <span className="text-white/45">GST on commission</span>
                    <span className="text-white/60">− {rupees(order.platformFeeGst)}</span>
                  </div>
                )}
              </>
            )}

            {order.role === "buyer" && !!order.clientFee && (
              <>
                <div className="flex justify-between">
                  <span className="text-white/45">Platform fee</span>
                  <span className="text-white/60">+ {rupees(order.clientFee)}</span>
                </div>
                {!!order.clientFeeGst && (
                  <div className="flex justify-between">
                    <span className="text-white/45">GST on platform fee</span>
                    <span className="text-white/60">+ {rupees(order.clientFeeGst)}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between pt-1.5 border-t border-white/[0.07]">
              <span className="text-white/45">
                {order.role === "buyer" ? "You paid" : "You receive"}
              </span>
              <span className="font-semibold">
                {rupees(order.role === "buyer" ? order.totalPayable : order.sellerAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/45">Escrow</span>
              <span>
                {order.fundsStatus === "HELD_BY_TOKUN"
                  ? "Held by Tokun"
                  : ["RELEASED_TO_SELLER", "RELEASED_TO_FREELANCER", "AUTO_RELEASED"].includes(
                      order.fundsStatus
                    )
                  ? "Released to the creator"
                  : order.fundsStatus === "PARTIALLY_SETTLED"
                  ? "Split between both sides"
                  : ["REFUNDED_TO_BUYER", "REFUNDED_TO_CLIENT"].includes(order.fundsStatus)
                  ? "Refunded"
                  : "Not funded"}
              </span>
            </div>
          </div>

          {/* The one thing a buyer is most likely to be surprised by later, so
              it's said while the money is still held rather than at the moment
              a refund comes back smaller than they expected. */}
          {order.role === "buyer" && !!order.clientFee && order.fundsStatus === "HELD_BY_TOKUN" && (
            <p className="mt-3 pt-3 border-t border-white/[0.07] text-[11px] text-white/35 leading-relaxed">
              The platform fee of {rupees(order.clientFee + order.clientFeeGst)} isn't refunded if
              this booking is cancelled — a cancellation returns the{" "}
              {rupees(order.amount)} price.
            </p>
          )}

          {/* The hard ceiling is worth stating while it still matters. */}
          {order.fundsStatus === "HELD_BY_TOKUN" && order.escrowExpiresAt && (
            <p className="mt-3 pt-3 border-t border-white/[0.07] text-[11px] text-white/35 leading-relaxed">
              This payment can be held until {formatDateTime(order.escrowExpiresAt).split(",")[0]}.
              Everything has to be settled before then.
            </p>
          )}
        </Section>

        {revisionState && (
          <Section title="Revisions">
            <p className="text-sm text-white/75">
              {revisionState.unlimited
                ? "Unlimited revisions included"
                : `${revisionState.used} of ${revisionState.allowed} used${
                    revisionState.exhausted ? " — none left" : ""
                  }`}
            </p>
            {order.revisions.length > 0 && (
              <div className="mt-3 space-y-2">
                {order.revisions.map((r: any, i: number) => (
                  <div key={i} className="rounded-lg bg-black/25 border border-white/[0.07] p-2.5">
                    <p className="text-[11px] text-white/40">
                      Revision {i + 1} · {formatDateTime(r.requestedAt)}
                    </p>
                    <p className="text-sm text-white/75 mt-1 whitespace-pre-line">
                      {r.reason || "No reason given"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {/* Every action that moves this booking forward, on the page that
              shows it. Approving used to be possible only from a card buried in
              a chat thread — so a client who opened their order to review the
              delivery had to go and find the conversation to accept it. */}
          {order.role === "seller" && order.status === "FUNDED" && (
            <button
              onClick={() => act("start-work", "Work started")}
              disabled={busyAction !== null}
              className="h-11 px-6 rounded-full text-sm font-semibold text-white border border-white/15 hover:bg-white/[0.06] disabled:opacity-60"
            >
              {busyAction === "start-work" ? "Starting…" : "Start work"}
            </button>
          )}

          {order.role === "buyer" && order.status === "WORK_SUBMITTED" && (
            <>
              <button
                onClick={() => act("approve-work", "Payment released")}
                disabled={busyAction !== null}
                className="h-11 px-6 rounded-full text-sm font-semibold text-white bg-[#19E66C] hover:bg-[#0BA84A] disabled:opacity-60"
              >
                {busyAction === "approve-work"
                  ? "Releasing…"
                  : `✓ Approve & release ${rupees(order.sellerAmount)}`}
              </button>

              {/* Disabled once the booking's revisions are spent — the server
                  refuses either way; this stops the client discovering the
                  limit only after typing out a reason. */}
              <button
                onClick={() => setRevisionOpen(true)}
                disabled={busyAction !== null || revisionState?.exhausted}
                title={revisionState?.exhausted ? "No revisions left on this booking" : undefined}
                className="h-11 px-5 rounded-full text-sm font-medium text-white/70 border border-white/15 hover:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ↺ Request a revision
              </button>
            </>
          )}

          {order.role === "seller" && canSubmitWork && (
            <button
              onClick={() => setSubmitOpen(true)}
              className="h-11 px-6 rounded-full text-sm font-semibold text-white"
              style={{ background: GRAD }}
            >
              {order.status === "REVISION_REQUESTED" ? "Resubmit work" : "Submit work"}
            </button>
          )}

          {/* Shown disabled rather than removed: a button that vanishes reads
              as a bug, and the reason is the whole point. */}
          {order.role === "seller" && WORK_UNDERWAY.includes(order.status) && missedDeadline && (
            <button
              type="button"
              disabled
              title="The delivery deadline for this booking has passed."
              className="h-11 px-6 rounded-full text-sm font-semibold text-white/40 border border-white/10 cursor-not-allowed"
            >
              Deadline passed — can't submit
            </button>
          )}

          {order.chatId && (
            <button
              onClick={() => navigate("/chat", { state: { conversationId: order.chatId } })}
              className="h-11 px-5 rounded-full text-sm font-medium text-white/70 border border-white/15 hover:bg-white/[0.06]"
            >
              Open chat
            </button>
          )}

          {/* Labelled for what it actually does. Cancelling mid-work doesn't
              refund you — it opens a split that the two sides settle, or an
              admin rules on. Calling that "Cancel booking" hid the entire
              dispute mechanism behind a word that promises the opposite. */}
          {canCancel && !isDisputed && (
            <button
              onClick={() => setCancelOpen(true)}
              className="h-11 px-5 rounded-full text-sm font-medium text-[#FF8F8F] border border-[#FF6B6B]/25 hover:bg-[#FF6B6B]/[0.08]"
            >
              {workUnderway
                ? order.role === "buyer"
                  ? "Cancel & raise a dispute"
                  : "Cancel this booking"
                : "Cancel booking"}
            </button>
          )}
        </div>

        {/* Says where the dispute route IS, rather than leaving people to
            discover that it lives behind the cancel button. */}
        {canCancel && !isDisputed && workUnderway && (
          <p className="text-[11px] text-white/30 leading-relaxed">
            {order.role === "buyer"
              ? "Something wrong? Cancelling pauses the work and opens a settlement — the creator states how much they completed, you accept it or Tokun decides. Your payment stays held until then."
              : "Can't continue? Cancelling refunds the client in full and is recorded on your account."}
          </p>
        )}
      </div>

      {/* Revision reason. Required, because "please change it" with no detail
          just burns one of a fixed number of revisions. */}
      {revisionOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => busyAction === null && setRevisionOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[520px] max-w-full rounded-2xl bg-[#0E0F12] text-white border border-white/10 overflow-hidden"
          >
            <div className="p-5 border-b border-white/10">
              <p className="font-semibold">What needs changing?</p>
              <p className="text-xs text-white/45 mt-1">
                {revisionState && !revisionState.unlimited
                  ? `This booking includes ${revisionState.allowed} revision${
                      revisionState.allowed === 1 ? "" : "s"
                    }. After this one you'll have ${Math.max(0, (revisionState.remaining ?? 0) - 1)} left — put everything in one message.`
                  : "The creator sees this exactly as you write it."}
              </p>
            </div>

            <div className="p-5">
              <textarea
                value={revisionReason}
                onChange={(e) => setRevisionReason(e.target.value)}
                autoFocus
                placeholder="Be specific — what's wrong, and what would make it right."
                className="w-full h-32 rounded-lg bg-[#1A1A1A] border border-white/10 p-3 text-sm outline-none resize-none"
              />
            </div>

            <div className="p-4 border-t border-white/10 flex gap-2">
              <button
                onClick={() => setRevisionOpen(false)}
                disabled={busyAction !== null}
                className="flex-1 h-11 rounded-full text-sm font-medium text-white/70 border border-white/15 hover:bg-white/[0.06] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!revisionReason.trim()) {
                    toast({
                      title: "Add a reason",
                      description: "The creator needs to know what to change.",
                    });
                    return;
                  }
                  act("request-revision", "Revision requested", { reason: revisionReason.trim() });
                }}
                disabled={busyAction !== null}
                className="flex-1 h-11 rounded-full text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: GRAD }}
              >
                {busyAction === "request-revision" ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {submitOpen && (
        <SubmitWorkModal
          orderKind={kind}
          orderId={order.id}
          title={order.title}
          isResubmit={order.status === "REVISION_REQUESTED"}
          token={token}
          onClose={() => setSubmitOpen(false)}
          onSubmitted={load}
        />
      )}

      {cancelOpen && (
        <CancelBookingModal
          orderKind={kind}
          orderId={order.id}
          title={order.title}
          status={order.status}
          role={order.role}
          totalPayable={order.totalPayable}
          token={token}
          onClose={() => setCancelOpen(false)}
          onDone={load}
        />
      )}

      {previewIndex !== null && order.deliverables[previewIndex] && (
        <DeliverablePreviewModal
          orderId={order.id}
          orderKind={kind}
          index={previewIndex}
          name={order.deliverables[previewIndex].name}
          mimeType={order.deliverables[previewIndex].mimeType}
          token={token}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </div>
  );
}
