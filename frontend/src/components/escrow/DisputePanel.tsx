/**
 * The negotiation after a client cancels mid-work: does the payment go to the
 * creator or back to the client?
 *
 * All-or-nothing. This was a 0–100 slider and the money could be cut anywhere
 * down the middle; a mid-range claim satisfied neither side and an admin asked
 * to arbitrate one still had to rule wholly for one party. Both sides always
 * see the figure in rupees, because "the payment" means nothing until it says
 * ₹1,000.
 *
 * Shown to whichever party is looking; the panel switches on `role` rather than
 * existing twice.
 */

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import BriefAttachmentPicker from "./BriefAttachmentPicker";
import {
  fetchDispute,
  proposeSplit,
  respondToSplit,
  withdrawCancellation,
  rupees,
  formatDateTime,
  type BriefAttachment,
  type Dispute,
  type OrderKind,
  type SettlementPreview,
} from "@/lib/escrowApi";

const GRAD = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

/* Same arithmetic the server uses, so the slider can show live rupees without
   a round trip on every drag. The server recomputes on submit — this is a
   preview, never the source of truth.

   Tokun takes NO commission on a cancellation, so the whole amount the client
   paid splits between the two of them: the creator's share is measured against
   totalPayable, not against what would have been left after a fee.

   This used to mirror the old server formula and showed a "Platform fee" line —
   ₹25 of a ₹1,000 cancellation — which is now simply wrong, and worse than
   wrong on this screen: the creator was reading a smaller number than they'd
   actually be paid before deciding what to claim. */
function localPreview(totalPayable: number, _sellerAmount: number, percent: number): SettlementPreview {
  const p = Math.max(0, Math.min(100, percent)) / 100;
  const sellerPayout = +(totalPayable * p).toFixed(2);
  return {
    sellerPercent: percent,
    sellerPayout,
    platformKeeps: 0,
    refundAmount: +Math.max(0, totalPayable - sellerPayout).toFixed(2),
  };
}

function SplitBar({ preview, totalPayable }: { preview: SettlementPreview; totalPayable: number }) {
  const pct = (n: number) => (totalPayable > 0 ? (n / totalPayable) * 100 : 0);
  return (
    <div>
      {/* Two segments, not three. The platform-fee slice is gone because there
          is no platform fee on a cancellation — a row that always reads ₹0
          invites the question "why is Tokun taking anything?" and answers it
          badly. */}
      <div className="flex h-2.5 rounded-full overflow-hidden bg-white/[0.06]">
        <div style={{ width: `${pct(preview.sellerPayout)}%`, background: "#19E66C" }} />
        <div style={{ width: `${pct(preview.refundAmount)}%`, background: "#63A6F2" }} />
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2 text-center">
        <div>
          <p className="text-sm font-semibold text-[#19E66C]">{rupees(preview.sellerPayout)}</p>
          <p className="text-[10px] text-white/40 mt-0.5">To the creator</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#63A6F2]">{rupees(preview.refundAmount)}</p>
          <p className="text-[10px] text-white/40 mt-0.5">Refunded to client</p>
        </div>
      </div>
      <p className="mt-2 text-center text-[10px] text-white/30">
        Tokun takes no fee on a cancellation — the full amount goes to the two of you.
      </p>
    </div>
  );
}

export default function DisputePanel({
  orderKind,
  orderId,
  role,
  token,
  onChanged,
}: {
  orderKind: OrderKind;
  orderId: string;
  role: "buyer" | "seller";
  token?: string;
  onChanged: () => void | Promise<void>;
}) {
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  /* The seller's claim, now all-or-nothing: 100 = "I delivered it, the payment
     is mine", 0 = "I agree to cancel". `null` until they pick, so the submit
     button can't fire on a default nobody chose — it used to start at 50%. */
  const [percent, setPercent] = useState<number | null>(null);
  const [proposalNote, setProposalNote] = useState("");
  const [proofFiles, setProofFiles] = useState<BriefAttachment[]>([]);
  // The client's, kept separate from the creator's above — they're two
  // different people's evidence and the admin needs to know whose is whose.
  const [buyerProofFiles, setBuyerProofFiles] = useState<BriefAttachment[]>([]);

  // Buyer's answer
  const [responseNote, setResponseNote] = useState("");

  const load = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await fetchDispute(orderKind, orderId, token);
      setDispute(data.dispute);
      if (data.dispute?.proposedSellerPercent !== null && data.dispute?.proposedSellerPercent !== undefined) {
        setPercent(data.dispute.proposedSellerPercent);
      }
    } catch {
      // A missing dispute is the normal case, not an error worth surfacing.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderKind, orderId, token]);

  const run = async (fn: () => Promise<any>, successTitle: string) => {
    try {
      setBusy(true);
      const result = await fn();
      toast({ title: successTitle, description: result?.message || "" });
      await load();
      await onChanged();
    } catch (err: any) {
      toast({ title: "Couldn't do that", description: err?.message || "Please try again." });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="text-white/45 text-sm">Loading cancellation…</p>;
  if (!dispute) return null;

  const preview = localPreview(dispute.totalPayable, dispute.sellerAmount, percent ?? 0);
  const proposedPreview =
    dispute.proposedSellerPercent !== null
      ? localPreview(dispute.totalPayable, dispute.sellerAmount, dispute.proposedSellerPercent)
      : null;

  return (
    <div className="rounded-2xl border border-[#FABC4E]/25 bg-[#FABC4E]/[0.05] p-5 space-y-4">
      <div>
        <p className="text-[10px] font-bold tracking-[1.6px] text-[#FABC4E] uppercase">
          Cancellation in progress
        </p>
        <p className="mt-1.5 text-sm text-white/70 leading-relaxed">
          {dispute.reason
            ? `The client cancelled: "${dispute.reason}"`
            : "The client cancelled this booking."}
        </p>
        <p className="mt-1 text-[11px] text-white/35">Opened {formatDateTime(dispute.createdAt)}</p>
      </div>

      {/* ── Seller, nothing claimed yet ───────────────────────────────────── */}
      {dispute.status === "OPEN" && role === "seller" && (
        <div className="space-y-4 pt-1">
          {/* Two choices, not a slider.

              This was a 0–100 range defaulting to 50%, and a mid-range claim
              was the worst outcome available: the client read it as an
              admission the job was unfinished, the creator read it as a
              discount they'd been talked into, and if it went to arbitration an
              admin had to rule all-or-nothing anyway. Every ending pays exactly
              one party now. */}
          <p className="text-sm text-white/70">
            The client wants to cancel. Either the work was delivered and the payment is yours, or
            it wasn't and it goes back to them.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPercent(100)}
              className={[
                "rounded-xl border p-3 text-left transition",
                percent === 100
                  ? "border-[#FF14EF]/50 bg-[#FF14EF]/10"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
              ].join(" ")}
            >
              <p className="text-sm font-semibold text-white">I delivered the work</p>
              <p className="mt-1 text-[11px] text-white/45">
                Claim the payment — {rupees(dispute.totalPayable)}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPercent(0)}
              className={[
                "rounded-xl border p-3 text-left transition",
                percent === 0
                  ? "border-[#FF14EF]/50 bg-[#FF14EF]/10"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
              ].join(" ")}
            >
              <p className="text-sm font-semibold text-white">I agree to cancel</p>
              <p className="mt-1 text-[11px] text-white/45">
                The client is refunded and you're paid nothing
              </p>
            </button>
          </div>

          <p className="text-[11px] text-white/35">
            Tokun takes no commission on a cancellation. Only the non-refundable platform fee is
            kept, whichever way this goes.
          </p>

          <div>
            <p className="text-sm font-medium mb-2">What you completed</p>
            <textarea
              value={proposalNote}
              onChange={(e) => setProposalNote(e.target.value)}
              placeholder="Describe what's done — the client and, if it comes to it, our team will read this."
              className="w-full h-24 rounded-lg bg-[#1A1A1A] border border-white/10 p-3 text-sm outline-none resize-none"
            />
          </div>

          <BriefAttachmentPicker
            value={proofFiles}
            onChange={setProofFiles}
            token={token}
            label="Attach proof of work"
            hint="Screenshots, files, a screen recording — anything showing what exists. This is what our team looks at if the client doesn't agree."
            disabled={busy}
          />

          <button
            type="button"
            disabled={busy || percent === null}
            onClick={() =>
              run(
                () =>
                  proposeSplit(
                    orderKind,
                    orderId,
                    { sellerPercent: percent as number, note: proposalNote, proofFiles },
                    token
                  ),
                "Sent to the client"
              )
            }
            className="w-full h-11 rounded-full text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: GRAD }}
          >
            {busy
              ? "Sending…"
              : percent === null
              ? "Pick one of the two above"
              : percent === 100
              ? `Claim the payment — ${rupees(preview.sellerPayout)}`
              : `Agree to cancel — ${rupees(preview.refundAmount)} back to the client`}
          </button>
        </div>
      )}

      {dispute.status === "OPEN" && role === "buyer" && (
        <div className="space-y-3 pt-1">
          <p className="text-sm text-white/60">
            Waiting for the creator to say how much they completed. Nothing has moved — your{" "}
            {rupees(dispute.totalPayable)} is still held.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => withdrawCancellation(orderKind, orderId, token), "Cancellation withdrawn")}
            className="w-full h-10 rounded-full text-sm font-medium text-white/70 border border-white/15 hover:bg-white/[0.06] disabled:opacity-60"
          >
            Changed your mind? Withdraw the cancellation
          </button>
        </div>
      )}

      {/* ── Claim on the table ────────────────────────────────────────────── */}
      {dispute.status === "PROPOSED" && proposedPreview && (
        <div className="space-y-4 pt-1">
          <div className="rounded-xl bg-black/25 border border-white/[0.07] p-4">
            {/* A percentage here was reporting a split that can no longer
                happen. The claim is one of two things now, so it's said as
                one of two things. */}
            <p className="text-sm font-semibold mb-3">
              {dispute.proposedSellerPercent === 100
                ? "The creator says the work was delivered and is claiming the payment"
                : "The creator has agreed to cancel — the payment comes back to you"}
            </p>
            <SplitBar preview={proposedPreview} totalPayable={dispute.totalPayable} />
            {dispute.proposalNote && (
              <p className="mt-3 pt-3 border-t border-white/[0.07] text-sm text-white/65 whitespace-pre-line">
                {dispute.proposalNote}
              </p>
            )}
            {dispute.proofFiles?.length > 0 && (
              <p className="mt-2 text-[11px] text-white/40">
                {dispute.proofFiles.length} proof file
                {dispute.proofFiles.length === 1 ? "" : "s"} attached
              </p>
            )}
          </div>

          {role === "buyer" ? (
            <>
              <div>
                <p className="text-sm font-medium mb-2">Your response (optional)</p>
                <textarea
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  placeholder="If you don't agree, say why — our team will read this."
                  className="w-full h-20 rounded-lg bg-[#1A1A1A] border border-white/10 p-3 text-sm outline-none resize-none"
                />
              </div>

              {/* The client's side of the evidence. Only the creator could
                  attach anything before, so a client whose complaint was about
                  the work itself — it doesn't run, it's the wrong thing — had
                  nothing to show for it, and the arbitrator saw files from one
                  party and a paragraph from the other. */}
              <BriefAttachmentPicker
                value={buyerProofFiles}
                onChange={setBuyerProofFiles}
                token={token}
                label="Attach your own evidence (optional)"
                hint="Screenshots, a screen recording, the file you received — anything showing the problem. Only used if you disagree and our team has to decide."
                disabled={busy}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    run(
                      () =>
                        respondToSplit(
                          orderKind,
                          orderId,
                          { action: "reject", note: responseNote, proofFiles: buyerProofFiles },
                          token
                        ),
                      "Sent to our team"
                    )
                  }
                  className="flex-1 h-11 rounded-full text-sm font-medium text-white/70 border border-white/15 hover:bg-white/[0.06] disabled:opacity-60"
                >
                  I don't agree
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    run(
                      () => respondToSplit(orderKind, orderId, { action: "accept", note: responseNote }, token),
                      "Settled"
                    )
                  }
                  className="flex-1 h-11 rounded-full text-sm font-semibold text-white bg-[#19E66C] hover:bg-[#0BA84A] disabled:opacity-60"
                >
                  {busy ? "Settling…" : `Accept — get ${rupees(proposedPreview.refundAmount)} back`}
                </button>
              </div>
              <p className="text-[11px] text-white/35 text-center leading-relaxed">
                Accepting settles it immediately. Disagreeing sends it to our team, who'll review the
                proof and decide.
              </p>
            </>
          ) : (
            <p className="text-sm text-white/60">
              Waiting for the client to accept or dispute your claim. You can update it until they
              respond.
            </p>
          )}
        </div>
      )}

      {dispute.status === "ADMIN_REVIEW" && (
        <div className="rounded-xl bg-black/25 border border-white/[0.07] p-4">
          <p className="text-sm font-semibold text-[#C084FC] mb-1.5">⚖️ With our team</p>
          <p className="text-sm text-white/60 leading-relaxed">
            The two of you didn't agree on the split, so Tokun is reviewing the work and will decide
            how the payment is divided. You'll both be emailed as soon as it's settled.
          </p>
          {dispute.buyerResponseNote && (
            <p className="mt-3 pt-3 border-t border-white/[0.07] text-sm text-white/55 whitespace-pre-line">
              Client's note: {dispute.buyerResponseNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
