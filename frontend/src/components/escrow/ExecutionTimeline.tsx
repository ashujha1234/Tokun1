/**
 * Where a booking has got to, and what happens next.
 *
 * The order page listed facts — brief, files, money — but never said which
 * stage the thing was actually at, so neither side could tell whether they were
 * waiting on the other or the other was waiting on them. That question is the
 * single most common reason people open a booking at all.
 *
 * Deliberately shows the WHOLE path including steps not yet reached, because
 * "what comes after this" is half the answer. The pending steps are dimmed
 * rather than hidden.
 */

import { formatDateTime } from "@/lib/escrowApi";

type Step = {
  key: string;
  label: string;
  /** Set once the step has happened. */
  at?: string | null;
  /** The step the booking is sitting on right now. */
  current?: boolean;
  /** Whose move it is, shown only on the current step. */
  waitingOn?: string;
};

const DOT = {
  done: { bg: "#19E66C", ring: "rgba(25,230,108,0.18)" },
  current: { bg: "#C084FC", ring: "rgba(192,132,252,0.22)" },
  pending: { bg: "rgba(255,255,255,0.16)", ring: "transparent" },
};

export default function ExecutionTimeline({
  status,
  role,
  createdAt,
  paidAt,
  workStartedAt,
  workSubmittedAt,
  approvedAt,
  revisionCount = 0,
}: {
  status: string;
  role: "buyer" | "seller";
  createdAt?: string | null;
  paidAt?: string | null;
  workStartedAt?: string | null;
  workSubmittedAt?: string | null;
  approvedAt?: string | null;
  revisionCount?: number;
}) {
  const isBuyer = role === "buyer";

  const steps: Step[] = [
    { key: "booked", label: "Booked", at: createdAt },
    { key: "paid", label: "Paid — held in escrow", at: paidAt },
    {
      key: "started",
      label: "Work started",
      at: workStartedAt,
      current: status === "FUNDED" || status === "IN_PROGRESS",
      waitingOn:
        status === "FUNDED"
          ? isBuyer
            ? "Waiting for the creator to start"
            : "Your move — start the work"
          : isBuyer
          ? "In progress"
          : "In progress — submit when ready",
    },
    {
      key: "submitted",
      label:
        revisionCount > 0
          ? `Delivered (${revisionCount + 1} submission${revisionCount ? "s" : ""})`
          : "Delivered",
      at: workSubmittedAt,
      current: status === "WORK_SUBMITTED" || status === "REVISION_REQUESTED",
      waitingOn:
        status === "WORK_SUBMITTED"
          ? isBuyer
            ? "Your move — approve or request a revision"
            : "Waiting for the client to review"
          : isBuyer
          ? "Waiting for the creator to resubmit"
          : "Your move — make the changes and resubmit",
    },
    {
      key: "approved",
      label: "Approved — payment released",
      at: approvedAt,
      current: status === "COMPLETED",
    },
  ];

  // A cancellation replaces the last step rather than appending to it: once
  // it's disputed or settled, "approved" is no longer where this is heading.
  if (["DISPUTED", "SETTLED", "REFUNDED", "CANCELLED"].includes(status)) {
    steps[steps.length - 1] = {
      key: "ended",
      label:
        status === "DISPUTED"
          ? "Cancellation — being settled"
          : status === "SETTLED"
          ? "Cancelled — payment split"
          : status === "REFUNDED"
          ? "Cancelled — refunded"
          : "Cancelled",
      current: status === "DISPUTED",
      at: status === "DISPUTED" ? null : approvedAt,
    };
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <p className="text-[10px] font-bold tracking-[1.4px] text-white/40 uppercase mb-4">
        Execution timeline
      </p>

      <div className="relative">
        {steps.map((step, i) => {
          const done = Boolean(step.at);
          const tone = done ? DOT.done : step.current ? DOT.current : DOT.pending;
          const isLast = i === steps.length - 1;

          return (
            <div key={step.key} className="relative flex gap-3 pb-5 last:pb-0">
              {/* Connector, drawn behind the dot and stopped on the last row. */}
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute left-[5px] top-3 bottom-0 w-px"
                  style={{ background: done ? "rgba(25,230,108,0.25)" : "rgba(255,255,255,0.08)" }}
                />
              )}

              <span
                className="relative z-10 mt-1 w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  background: tone.bg,
                  boxShadow: tone.ring !== "transparent" ? `0 0 0 4px ${tone.ring}` : undefined,
                }}
              />

              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm leading-tight ${
                    done ? "text-white" : step.current ? "text-white" : "text-white/35"
                  }`}
                >
                  {step.label}
                </p>
                {step.at ? (
                  <p className="text-[11px] text-white/35 mt-0.5">{formatDateTime(step.at)}</p>
                ) : step.current && step.waitingOn ? (
                  <p className="text-[11px] mt-0.5 text-[#C084FC]">{step.waitingOn}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
