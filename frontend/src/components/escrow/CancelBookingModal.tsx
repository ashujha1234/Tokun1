/**
 * Cancelling a funded booking.
 *
 * What cancelling MEANS depends on who's doing it and whether work had started,
 * and the difference is large enough that showing one generic "are you sure?"
 * would be misleading:
 *
 *   • nothing started yet → full refund, immediately, no admin
 *   • the creator walks   → full refund to the client, immediately
 *   • the client cancels
 *     mid-work            → nothing is refunded yet; the creator states how
 *                           much they completed and the money gets split
 *
 * So the modal states the actual consequence before asking for confirmation.
 * The server decides the real outcome — this only predicts it from the same
 * inputs, and the response says which branch actually ran.
 */

import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { cancelOrder, rupees, type OrderKind } from "@/lib/escrowApi";

const WORK_STARTED = ["IN_PROGRESS", "WORK_SUBMITTED", "REVISION_REQUESTED"];

export default function CancelBookingModal({
  orderKind,
  orderId,
  title,
  status,
  role,
  totalPayable,
  token,
  onClose,
  onDone,
}: {
  orderKind: OrderKind;
  orderId: string;
  title: string;
  status: string;
  role: "buyer" | "seller";
  totalPayable: number;
  token?: string;
  onClose: () => void;
  onDone: () => void | Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const workStarted = WORK_STARTED.includes(status);
  const goesToNegotiation = role === "buyer" && workStarted;

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast({ title: "Add a reason", description: "The other side needs to know why." });
      return;
    }

    try {
      setSubmitting(true);
      const result = await cancelOrder(orderKind, orderId, reason.trim(), token);
      toast({
        title: result.outcome === "full_refund" ? "Cancelled and refunded" : "Cancellation started",
        description: result.message,
      });
      await onDone();
      onClose();
    } catch (err: any) {
      toast({ title: "Couldn't cancel", description: err?.message || "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-8"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[520px] max-w-full max-h-full flex flex-col rounded-2xl bg-[#0E0F12] text-white border border-white/10 overflow-hidden"
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b border-white/10 shrink-0">
          <div className="min-w-0">
            <p className="font-semibold">Cancel this booking</p>
            <p className="text-xs text-white/50 truncate mt-0.5">{title}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-lg leading-none">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* The consequence, stated before the confirm button rather than
              discovered after it. */}
          {goesToNegotiation ? (
            <div className="rounded-xl border border-[#FABC4E]/25 bg-[#FABC4E]/[0.08] p-4">
              <p className="text-sm font-semibold text-[#FABC4E] mb-2">
                Work has already started — you won't be refunded in full
              </p>
              <p className="text-sm text-white/65 leading-relaxed">
                The creator has put time into this, so the payment gets split rather than returned.
                Cancelling here pauses the work and asks them to state how much they completed. You
                can accept their figure, or reject it and have our team decide.
              </p>
              <p className="mt-3 text-xs text-white/40">
                Nothing moves until one of those happens. Your {rupees(totalPayable)} stays held
                until then.
              </p>
            </div>
          ) : role === "seller" ? (
            <div className="rounded-xl border border-[#FF6B6B]/25 bg-[#FF6B6B]/[0.08] p-4">
              <p className="text-sm font-semibold text-[#FF8F8F] mb-2">
                The client gets a full refund
              </p>
              <p className="text-sm text-white/65 leading-relaxed">
                Walking away from work that's already been paid for refunds the client{" "}
                {rupees(totalPayable)} in full — including any work you've already done. It's also
                recorded on your account, and repeated cancellations lead to suspension.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-[#19E66C]/25 bg-[#19E66C]/[0.08] p-4">
              <p className="text-sm font-semibold text-[#19E66C] mb-2">
                You'll get a full refund
              </p>
              <p className="text-sm text-white/65 leading-relaxed">
                Work hasn't started, so nothing has been lost on either side. The full{" "}
                {rupees(totalPayable)} goes back to your original payment method — usually within
                5–7 working days.
              </p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium mb-2">
              Reason <span className="text-white/35">(the other side will see this)</span>
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                role === "seller"
                  ? "Let the client know why you can't continue…"
                  : "What changed?"
              }
              className="w-full h-24 rounded-lg bg-[#1A1A1A] border border-white/10 p-3 text-sm outline-none resize-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-white/10 flex gap-2 shrink-0">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 h-11 rounded-full text-sm font-medium text-white/70 border border-white/15 hover:bg-white/[0.06] disabled:opacity-60"
          >
            Keep the booking
          </button>
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="flex-1 h-11 rounded-full text-sm font-semibold text-white bg-[#C0392B] hover:bg-[#A93226] disabled:opacity-60"
          >
            {submitting
              ? "Cancelling…"
              : goesToNegotiation
              ? "Cancel and start a split"
              : "Cancel and refund"}
          </button>
        </div>
      </div>
    </div>
  );
}
