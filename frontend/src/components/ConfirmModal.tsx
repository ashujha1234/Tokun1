/**
 * The "are you sure?" step, in the app instead of in the browser.
 *
 * Everything destructive here used to go through `window.confirm`, which is a
 * white OS box in the middle of a dark page: it looks like it belongs to the
 * browser rather than to Tokun, it can't say anything more than one line of
 * plain text, and — the part that actually matters — it blocks the whole tab
 * while it's up, so an upload or a fetch in flight behind it just stops.
 *
 * A component rather than the same JSX in each place: the products grid exists
 * twice (pages/self-dash.tsx and components/PromptHistory.tsx) with the same
 * delete on both, which is exactly how two confirms end up asking the same
 * question in two different ways. Same reasoning as RefundReasonPicker.
 *
 * THE SURFACE IS THE TOAST'S, deliberately and to the token: rounded-2xl,
 * border-white/15, bg-white/10, backdrop-blur-xl, shadow-2xl (see the variants
 * in components/ui/toast.tsx). This is the app's one way of speaking to someone
 * about something that just happened or is about to; a second panel style with
 * its own colours read as a different product, which is the same reason the
 * toast has no `destructive` variant. Severity is carried by the wording — "This
 * can't be undone" — not by turning the box red.
 *
 * Deliberately NOT a toast, though. A toast tells you what happened; this has to
 * be answered before anything happens, and it must be possible to say no —
 * which is the one thing a toast has nowhere to put.
 */

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";

/* The primary-button gradient, same direction as everywhere else. */
const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  /** One or two sentences. Say what will happen, not "are you sure". */
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Keeps the dialog up with a spinner while the action runs. */
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useBodyScrollLock(open);

  /* Escape cancels. window.confirm answered the Escape key too, and losing that
     is the kind of small regression that makes a replacement feel worse than
     what it replaced. Not wired to Enter: the default action here is usually
     the destructive one, and a stray Enter should not delete a product. */
  useEffect(() => {
    if (!open || busy) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/75 px-4"
      /* Click-away cancels, but not mid-action — dismissing the dialog while the
         request is running would leave the answer on screen with no dialog. */
      onClick={() => !busy && onCancel()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="w-full max-w-[420px] rounded-2xl border border-white/15 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-modal-title" className="text-sm font-semibold">
          {title}
        </h3>
        {/* text-white/70 is the toast description's own colour. */}
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/70">{message}</p>

        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-9 rounded-lg border border-white/20 px-4 text-[13px] text-white/75 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-[13px] font-semibold text-white disabled:opacity-60"
            style={{ background: GRADIENT }}
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
