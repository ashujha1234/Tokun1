// src/components/escrow/WelcomeDoc.tsx
//
// The onboarding document for an engagement — "you've paid, now what?"
//
// ── Why this exists ─────────────────────────────────────────────────────────
//
// Between paying and receiving the work, a client had nothing. The order page
// showed a status enum and a progress bar; everything a person actually wants to
// know at that moment lived only in the code that enforced it:
//
//   • When is this due, and what happens if it's late?
//   • What do I have to do? (Nothing? Something? By when?)
//   • Where is my money right now, and what makes it come back if this fails?
//   • The work arrived — how long do I have to look at it before something
//     happens automatically? (72 hours. This was the single most consequential
//     rule on the platform and it was written down nowhere the client would see
//     before it fired.)
//   • It's wrong — is that a revision or a new order?
//
// That silence is expensive. It is the reason clients cancel out of anxiety
// rather than because anything is wrong, and the reason a routine auto-release
// reads as money being taken.
//
// So: one document, generated from the engagement itself, that answers all of
// it in order. Rendered as a printable sheet in the same house style as the
// agreement — the two are meant to be read together, and quote the same numbers
// from the same shared source (lib/engagementRules.ts).
//
// ── Audience-aware, deliberately ────────────────────────────────────────────
//
// The same six facts mean different things to the two sides. "Delivery is due
// on the 14th" is a promise to one party and a deadline for the other; the
// 72-hour window is a right for the client and a payout clock for the creator.
// So `viewerRole` picks the wording rather than there being one neutral doc that
// speaks to neither. Nothing is hidden from either side — the difference is
// person, not content.
//
// Nothing here is invented. A fact the engagement doesn't have is stated as
// absent, in the same way the agreement says "Not specified" rather than
// printing a plausible default.

import { useCallback, useMemo, useState } from "react";
import { RULES } from "@/lib/engagementRules";
import {
  buildWelcomeHtml as buildSharedWelcomeHtml,
  formatDate,
  money,
  daysUntil,
} from "@shared/welcomeDoc.mjs";

const GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

/* ---------- helpers (kept local and identical in behaviour to NdaCard's) ---------- */

export type WelcomeDocData = {
  orderKind: "hire" | "service";
  orderId?: string;
  title?: string;

  /** The brief, in the client's words. */
  brief?: string;
  /** "What you get" bullets from the listing, snapshotted at booking. */
  packageItems?: string[];
  /** Reference material the client attached — named, never linked. */
  attachments?: { name?: string; size?: number }[];

  // terms
  amount?: number;
  totalPayable?: number;
  currency?: string;
  deliveryDays?: number | null;
  deliveryDueAt?: string | null;
  targetDate?: string | null;
  revisionsAllowed?: number | null;
  revisionsUsed?: number;
  escrowExpiresAt?: string | null;

  // state
  status?: string;
  paymentStatus?: string;
  fundsStatus?: string;
  paidAt?: string | null;
  workSubmittedAt?: string | null;

  // parties
  clientName?: string;
  creatorName?: string;

  /** The access checklist for this engagement, when one has been raised. */
  accessItems?: {
    label?: string;
    kind?: string;
    note?: string;
    required?: boolean;
    status?: string;
  }[];

  /** Whose copy this is. Changes the wording throughout, never the content. */
  viewerRole: "buyer" | "seller";
};



/* ---------- the document ---------- */

/* esc/escBlock/formatDate/money/daysUntil and buildWelcomeHtml moved to
   server/shared/welcomeDoc.mjs, so the modal and the emailed PDF are the same
   document rather than two that drift. RULES is passed in because each side
   keeps its own copy of it. */
export const buildWelcomeHtml = (doc: WelcomeDocData): string =>
  buildSharedWelcomeHtml(doc, RULES);


/* ---------- download / print (same mechanics as the agreement) ---------- */

function downloadWelcome(doc: WelcomeDocData) {
  const html = buildWelcomeHtml(doc);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Tokun-Welcome-${doc.orderId || "engagement"}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function printWelcome(doc: WelcomeDocData) {
  const html = buildWelcomeHtml(doc);
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(iframe);
  const idoc = iframe.contentWindow?.document;
  if (!idoc) return;
  idoc.open();
  idoc.write(html);
  idoc.close();
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      /* A blocked print dialog is not worth an error — the download button is
         right next to it and produces the same document. */
    }
    setTimeout(() => iframe.parentNode?.removeChild(iframe), 1500);
  }, 350);
}

/* ---------- modal ---------- */

function WelcomeModal({ doc, onClose }: { doc: WelcomeDocData; onClose: () => void }) {
  const srcDoc = useMemo(() => buildWelcomeHtml(doc), [doc]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-3"
      style={{ zIndex: 2147482000, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 780,
          maxWidth: "calc(100vw - 20px)",
          height: "min(93vh, 940px)",
          borderRadius: 22,
          background: "#14121E",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 48px 120px rgba(0,0,0,0.7)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "Inter, sans-serif",
          color: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span style={{ fontSize: 20 }}>👋</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {doc.viewerRole === "buyer" ? "Welcome — how this works" : "What happens now"}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {doc.title || "Your engagement"}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              cursor: "pointer",
              fontSize: 16,
              flexShrink: 0,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0, background: "#f3f2f7" }}>
          <iframe
            title="Welcome document"
            srcDoc={srcDoc}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "13px 20px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            justifyContent: "flex-end",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => downloadWelcome(doc)}
            style={{
              height: 40,
              padding: "0 18px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.8)",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            ⬇ Download .html
          </button>
          <button
            onClick={() => printWelcome(doc)}
            style={{
              height: 40,
              padding: "0 22px",
              borderRadius: 8,
              border: "none",
              background: GRADIENT,
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ⬇ Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- the card that opens it ---------- */

/**
 * The panel on the order page. Two jobs:
 *
 *   1. Answer the three questions everyone has, inline, without a click —
 *      what's due when, what's outstanding from me, and what happens on its own
 *      if I do nothing. A document nobody opens answers nothing.
 *   2. Open the full sheet for the rest.
 *
 * `dismissible` is deliberately NOT offered. The panel is not a promotion; it
 * carries the auto-release deadline, and a client who dismissed it in week one
 * and lost the escrow in week three would be right to be annoyed.
 */
export default function WelcomeDocPanel({ doc }: { doc: WelcomeDocData }) {
  const [open, setOpen] = useState(false);
  const isBuyer = doc.viewerRole === "buyer";

  const dueIn = daysUntil(doc.deliveryDueAt);
  const outstanding = (doc.accessItems || []).filter(
    (a) => String(a?.label || "").trim() && (a.status || "PENDING") === "PENDING"
  ).length;

  /* The one thing that is true right now and has a clock on it. Ordered by
     urgency, not by category: a review window closing in hours outranks a
     delivery date next week. */
  const headline = useMemo(() => {
    if (doc.status === "WORK_SUBMITTED") {
      return isBuyer
        ? {
            tone: "urgent" as const,
            text: `The work is with you. Approve it or ask for a revision within ${RULES.autoReleaseHours} hours of delivery — after that it counts as accepted and the payment releases automatically.`,
          }
        : {
            tone: "info" as const,
            text: `Delivered. If the client neither approves nor asks for a revision within ${RULES.autoReleaseHours} hours, the payment releases to you automatically.`,
          };
    }
    if (outstanding > 0) {
      return {
        tone: "urgent" as const,
        text: isBuyer
          ? `${outstanding} item${outstanding === 1 ? "" : "s"} on the access checklist ${
              outstanding === 1 ? "is" : "are"
            } still outstanding. Work can't properly start without them, and the delivery date moves out for any delay.`
          : `You're waiting on the client for ${outstanding} checklist item${
              outstanding === 1 ? "" : "s"
            }. Your delivery deadline extends by the length of that delay.`,
      };
    }
    if (dueIn !== null && dueIn < 0) {
      return {
        tone: "urgent" as const,
        text: isBuyer
          ? `Delivery is ${Math.abs(dueIn)} day${Math.abs(dueIn) === 1 ? "" : "s"} overdue. You can allow more time in writing, or cancel — how much was actually done decides how the payment splits.`
          : `Delivery is ${Math.abs(dueIn)} day${Math.abs(dueIn) === 1 ? "" : "s"} past the agreed date. Deliver, or agree an extension with the client in writing.`,
      };
    }
    if (dueIn !== null) {
      return {
        tone: "info" as const,
        text: isBuyer
          ? `Delivery is due in ${dueIn} day${dueIn === 1 ? "" : "s"}. You can ask to see progress at any point before then.`
          : `You have ${dueIn} day${dueIn === 1 ? "" : "s"} until the agreed delivery date.`,
      };
    }
    return {
      tone: "info" as const,
      text: isBuyer
        ? "Your payment is held by Tokun and won't reach the creator until you approve the work."
        : "The client's payment is held by Tokun. It's released to you when they approve the delivery.",
    };
  }, [doc.status, outstanding, dueIn, isBuyer]);

  return (
    <>
      <div
        className="rounded-2xl p-4 sm:p-5"
        style={{
          background:
            headline.tone === "urgent"
              ? "linear-gradient(135deg, rgba(250,188,78,0.10), rgba(255,255,255,0.03))"
              : "rgba(255,255,255,0.04)",
          border: `1px solid ${
            headline.tone === "urgent" ? "rgba(250,188,78,0.28)" : "rgba(255,255,255,0.09)"
          }`,
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-lg leading-none mt-0.5 shrink-0">
            {headline.tone === "urgent" ? "⏳" : "👋"}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white/90">
              {isBuyer ? "Welcome — start here" : "What happens now"}
            </h3>
            <p className="text-xs text-white/55 mt-1.5 leading-relaxed">{headline.text}</p>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] text-white/40">
              <span>
                Due{" "}
                <span className="text-white/70">
                  {doc.deliveryDueAt || doc.targetDate
                    ? formatDate(doc.deliveryDueAt || doc.targetDate)
                    : "not set"}
                </span>
              </span>
              <span>
                Revisions{" "}
                <span className="text-white/70">
                  {typeof doc.revisionsAllowed === "number"
                    ? `${Math.max(0, doc.revisionsAllowed - Number(doc.revisionsUsed || 0))} of ${doc.revisionsAllowed} left`
                    : doc.revisionsAllowed === null
                      ? "unlimited"
                      : "not set"}
                </span>
              </span>
              <span>
                {isBuyer ? "Held by Tokun" : "Your side"}{" "}
                <span className="text-white/70">
                  {money(isBuyer ? (doc.totalPayable ?? doc.amount) : doc.amount, doc.currency) || "—"}
                </span>
              </span>
            </div>

            <button
              onClick={() => setOpen(true)}
              className="mt-4 h-9 px-4 rounded-lg text-xs font-semibold text-white inline-flex items-center gap-2 transition hover:opacity-90"
              style={{ background: GRADIENT }}
            >
              📄 Read the full guide
            </button>
          </div>
        </div>
      </div>

      {open && <WelcomeModal doc={doc} onClose={() => setOpen(false)} />}
    </>
  );
}
