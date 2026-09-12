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

const GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

/* ---------- helpers (kept local and identical in behaviour to NdaCard's) ---------- */

function esc(s?: string) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escBlock(s?: string) {
  return esc(s).replace(/\r?\n/g, "<br/>");
}

function formatDate(value?: string | Date | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function money(n?: number | null, currency = "INR") {
  if (n === undefined || n === null) return "";
  const value = Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency === "INR" ? `₹${value}` : `${currency} ${value}`;
}

/** Whole days from now until `when`; negative when it has passed. */
function daysUntil(when?: string | null) {
  if (!when) return null;
  const t = new Date(when).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / 86_400_000);
}

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

/* ── The stages an engagement moves through ────────────────────────────────
   Named for what happens, not for the enum, and each carries the one thing
   the viewer actually needs to know while it is the current stage.
   `key` matches the order's status so the current stage can be marked; DISPUTED
   and the terminal money states are deliberately not stages — they are
   outcomes, and are covered in "If something goes wrong". */
const STAGES = [
  {
    key: "FUNDED",
    label: "Funded",
    buyer: "Your payment is held in escrow. The creator can now start.",
    seller: "The money is in escrow. You're clear to start — press Start work.",
  },
  {
    key: "IN_PROGRESS",
    label: "In progress",
    buyer: "The work is underway. You can ask to see progress at any point.",
    seller: "You're building. Share a checkpoint if the client asks for one.",
  },
  {
    key: "WORK_SUBMITTED",
    label: "Delivered — your review",
    buyer: `The work is with you. You have ${RULES.autoReleaseHours} hours to approve it or ask for a revision.`,
    seller: `Delivered. If the client says nothing for ${RULES.autoReleaseHours} hours, the escrow releases to you automatically.`,
  },
  {
    key: "REVISION_REQUESTED",
    label: "Revision",
    buyer: "You've sent it back with notes. The clock restarts when they resubmit.",
    seller: "A revision is outstanding. Resubmitting restarts the client's review window.",
  },
  {
    key: "COMPLETED",
    label: "Complete",
    buyer: "Approved, released, and the deliverables are yours.",
    seller: "Approved and released. The payout is on your earnings record.",
  },
] as const;

/* ---------- the document ---------- */

export function buildWelcomeHtml(doc: WelcomeDocData): string {
  const isBuyer = doc.viewerRole === "buyer";
  const currency = doc.currency || "INR";
  const isService = doc.orderKind === "service";

  const other = isBuyer ? doc.creatorName : doc.clientName;
  const otherLabel = isBuyer ? "the creator" : "the client";
  const you = isBuyer ? doc.clientName : doc.creatorName;

  const packageList = (doc.packageItems || []).filter((s) => String(s || "").trim());
  const attachments = (doc.attachments || []).filter((a) => String(a?.name || "").trim());
  const accessItems = (doc.accessItems || []).filter((a) => String(a?.label || "").trim());
  const outstandingAccess = accessItems.filter((a) => (a.status || "PENDING") === "PENDING");

  const currentIndex = STAGES.findIndex((s) => s.key === doc.status);
  const dueIn = daysUntil(doc.deliveryDueAt);

  const revisionTerm = (() => {
    if (typeof doc.revisionsAllowed === "number") {
      const used = Number(doc.revisionsUsed || 0);
      const left = Math.max(0, doc.revisionsAllowed - used);
      return `${doc.revisionsAllowed} included · ${left} left`;
    }
    // null is a term, not a gap: booked under no cap.
    if (doc.revisionsAllowed === null) return "Unlimited — no cap was agreed";
    return "Not specified";
  })();

  const NOT_SET = `<span class="muted">Not set</span>`;
  const or = (v: string) => (v ? esc(v) : NOT_SET);

  const fact = (k: string, v: string, hint?: string) =>
    `<div class="fact"><div class="k">${esc(k)}</div><div class="v">${v}</div>${
      hint ? `<div class="hint">${esc(hint)}</div>` : ""
    }</div>`;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/>
<title>Welcome — ${esc(doc.title || "Your engagement")}</title>
<style>
  @page{size:A4;margin:18mm 16mm}
  *{box-sizing:border-box}
  body{margin:0;font-family:Inter,-apple-system,"Segoe UI",Arial,sans-serif;color:#14121b;background:#f3f2f7;line-height:1.6;font-size:13px}
  .sheet{max-width:820px;margin:24px auto;background:#fff;padding:44px 50px 52px;box-shadow:0 12px 50px rgba(0,0,0,.18)}
  .brand{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #7c3aed;padding-bottom:14px;margin-bottom:26px}
  .brand h1{font-size:22px;letter-spacing:4px;margin:0;color:#7c3aed}
  .brand .tag{font-size:10px;letter-spacing:2px;color:#8b8794;text-transform:uppercase}
  h2.doc-title{font-size:24px;margin:0 0 6px;letter-spacing:-.3px;font-family:Georgia,serif}
  .lede{color:#5c5768;font-size:13.5px;margin:0 0 26px;max-width:62ch}
  .sec{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7c3aed;margin:30px 0 10px;padding-bottom:5px;border-bottom:1px solid #ece9f3}
  h3{font-size:13.5px;margin:18px 0 5px;color:#2a2536}
  p{margin:0 0 10px}
  .muted{color:#a29daf;font-weight:500}
  .facts{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:6px}
  .fact{background:#faf9fc;border:1px solid #ece9f3;border-radius:10px;padding:12px 14px}
  .fact .k{color:#8b8794;font-size:8.5px;letter-spacing:1.3px;text-transform:uppercase}
  .fact .v{color:#14121b;font-weight:700;margin-top:3px;font-size:14px;word-break:break-word}
  .fact .hint{color:#8b8794;font-size:10px;margin-top:3px;line-height:1.4}
  .steps{list-style:none;padding:0;margin:0}
  .steps li{display:flex;gap:12px;padding:11px 0;border-bottom:1px solid #f2eff8}
  .steps li:last-child{border-bottom:none}
  .dot{width:22px;height:22px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;background:#f0ecf9;color:#a29daf;margin-top:2px}
  .dot.done{background:#dcfce7;color:#16a34a}
  .dot.now{background:#7c3aed;color:#fff}
  .steps .label{font-weight:700;font-size:12.5px;color:#2a2536}
  .steps .label .badge{font-size:8.5px;letter-spacing:1.2px;text-transform:uppercase;color:#7c3aed;background:#f3eeff;border-radius:20px;padding:2px 8px;margin-left:8px;vertical-align:1px}
  .steps .what{color:#5c5768;font-size:12px;margin-top:1px}
  ul.items{margin:0 0 10px;padding-left:18px}
  ul.items li{margin-bottom:5px}
  table.tbl{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:12px}
  table.tbl td{padding:7px 9px;border-bottom:1px solid #f0edf6;vertical-align:top}
  table.tbl td.r{text-align:right;color:#8b8794;white-space:nowrap;width:120px}
  .quote{background:#faf9fc;border-left:3px solid #d9d0f5;border-radius:0 8px 8px 0;padding:12px 14px;margin:0 0 12px;font-size:12.5px}
  .quote .lbl{font-size:8.5px;letter-spacing:1.3px;text-transform:uppercase;color:#8b8794;margin-bottom:5px}
  .callout{border-radius:10px;padding:14px 16px;margin:0 0 14px;font-size:12.5px;line-height:1.6}
  .callout.warn{background:#fffbeb;border:1px solid #fde68a}
  .callout.info{background:#f5f3ff;border:1px solid #ddd6fe}
  .callout .t{font-weight:700;margin-bottom:3px}
  .foot{margin-top:34px;padding-top:14px;border-top:1px dashed #d9d5e2;font-size:10px;color:#8b8794;line-height:1.7}
  .nowrap{white-space:nowrap}
  @media print{body{background:#fff}.sheet{box-shadow:none;margin:0;max-width:none;padding:0}}
</style></head>
<body><div class="sheet">
  <div class="brand"><h1>TOKUN</h1><span class="tag">Escrow-Protected Engagement</span></div>

  <h2 class="doc-title">${isBuyer ? "Welcome — here's how this works" : "Your engagement — what happens now"}</h2>
  <p class="lede">${
    isBuyer
      ? `${you ? `${esc(you)}, y` : "Y"}our payment for <b>${esc(doc.title || "this engagement")}</b> is held in escrow${
          other ? ` and ${esc(other)} has been notified` : ""
        }. This document is the whole process in order: what happens next, what we need from you, where your money sits, and what to do if something isn't right. Nothing in it is a surprise later.`
      : `${you ? `${esc(you)}, t` : "T"}his is the engagement <b>${esc(doc.title || "you've taken on")}</b>${
          other ? ` for ${esc(other)}` : ""
        }. The client's money is already held in escrow, so the only thing between you and the payout is the work. Here is the sequence, the deadline, and exactly what releases the money.`
  }</p>

  <div class="sec">The engagement at a glance</div>
  <div class="facts">
    ${fact(
      isBuyer ? "You paid" : "You'll receive",
      or(money(isBuyer ? (doc.totalPayable ?? doc.amount) : doc.amount, currency)),
      isBuyer
        ? "Held in escrow, not paid out yet"
        : "Before Tokun's commission — see your earnings record"
    )}
    ${fact(
      "Delivery due",
      doc.deliveryDueAt
        ? `<span class="nowrap">${esc(formatDate(doc.deliveryDueAt))}</span>`
        : doc.targetDate
          ? `<span class="nowrap">${esc(formatDate(doc.targetDate))}</span>`
          : NOT_SET,
      doc.deliveryDueAt && dueIn !== null
        ? dueIn >= 0
          ? `${dueIn} day${dueIn === 1 ? "" : "s"} from today`
          : `${Math.abs(dueIn)} day${Math.abs(dueIn) === 1 ? "" : "s"} overdue`
        : doc.deliveryDays
          ? `${doc.deliveryDays} days from payment`
          : "No fixed number of days was agreed"
    )}
    ${fact("Revisions", or(revisionTerm), isBuyer ? "Beyond this needs a new booking" : "A cap the client agreed to at booking")}
  </div>

  <div class="sec">What happens next</div>
  <ol class="steps">
    ${STAGES.map((s, i) => {
      const done = currentIndex > -1 && i < currentIndex;
      const now = currentIndex === i;
      return `<li>
        <div class="dot ${done ? "done" : now ? "now" : ""}">${done ? "✓" : i + 1}</div>
        <div>
          <div class="label">${esc(s.label)}${now ? `<span class="badge">You are here</span>` : ""}</div>
          <div class="what">${esc(isBuyer ? s.buyer : s.seller)}</div>
        </div>
      </li>`;
    }).join("")}
  </ol>
  ${
    currentIndex === -1
      ? `<p class="muted" style="font-size:11.5px">This engagement is currently outside the normal sequence${
          doc.status ? ` (${esc(String(doc.status).toLowerCase().replace(/_/g, " "))})` : ""
        } — see "If something isn't right" below.</p>`
      : ""
  }

  <div class="sec">${isBuyer ? "What we need from you" : "What you need from the client"}</div>
  ${
    accessItems.length
      ? `<p>${
          isBuyer
            ? `${other ? esc(other) : "The creator"} has asked for the following. Work can't start properly until the required items are in, and any delay here moves the delivery date out by the same amount.`
            : `You've asked the client for the following. Anything still outstanding extends your delivery deadline by the length of the delay — you are not late for time spent waiting on the client.`
        }</p>
        <table class="tbl">${accessItems
          .map(
            (a) =>
              `<tr><td><b>${esc(a.label)}</b>${
                a.required === false ? ` <span class="muted">(optional)</span>` : ""
              }${a.note ? `<div class="muted" style="font-size:11px;font-weight:400">${escBlock(a.note)}</div>` : ""}</td>
              <td class="r">${esc(
                (a.status || "PENDING") === "PENDING"
                  ? "Outstanding"
                  : a.status === "PROVIDED"
                    ? "✓ Provided"
                    : a.status === "DECLINED"
                      ? "Declined"
                      : "Not applicable"
              )}</td></tr>`
          )
          .join("")}</table>
        ${
          outstandingAccess.length
            ? `<div class="callout warn"><div class="t">${outstandingAccess.length} item${
                outstandingAccess.length === 1 ? "" : "s"
              } still outstanding</div>${
                isBuyer
                  ? `Open the access checklist on your order page to upload files or confirm access. <b>Never type a password, private key or one-time code anywhere on Tokun</b> — grant access by inviting ${
                      other ? esc(other) : "the creator"
                    } to the account instead, and revoke it when the work is done.`
                  : `The client hasn't provided these yet. Nudge them in chat — and never ask for a password: ask to be invited to the account.`
              }</div>`
            : ""
        }`
      : `<p>${
          isBuyer
            ? `Nothing yet. If ${
                other ? esc(other) : "the creator"
              } needs assets, brand files or access to one of your systems, they'll raise a checklist on this order and you'll be notified. When they do: <b>never type a password, private key or one-time code into Tokun.</b> Grant access by inviting them to the account, at the lowest level that lets them work, and revoke it when the engagement ends.`
            : `You haven't raised an access checklist on this engagement. If you need brand files, copy, credentials-level access or approvals to do the work, raise one from the order page — it gives the client a clear list, records what was asked for, and extends your delivery deadline for any delay in providing it. Ask to be invited to systems; never ask for a password.`
        }</p>`
  }

  ${
    doc.brief || packageList.length || attachments.length
      ? `<div class="sec">What was agreed</div>
         ${
           packageList.length
             ? `<h3>What the engagement includes</h3>
                <ul class="items">${packageList.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`
             : ""
         }
         ${
           doc.brief
             ? `<div class="quote"><div class="lbl">${
                 isService ? "The brief submitted with the booking" : "The project as agreed between you"
               }</div>${escBlock(doc.brief)}</div>`
             : ""
         }
         ${
           attachments.length
             ? `<h3>Reference material attached to the brief</h3>
                <table class="tbl">${attachments
                  .map(
                    (a) =>
                      `<tr><td>${esc(a.name)}</td><td class="r">${
                        a.size ? esc(`${Math.max(1, Math.round(Number(a.size) / 1024))} KB`) : ""
                      }</td></tr>`
                  )
                  .join("")}</table>`
             : ""
         }
         <p class="muted" style="font-size:11.5px">Anything not listed above is out of scope. It isn't covered by the escrow held against this engagement, and needs a new booking or a written variation both of you agree to.</p>`
      : ""
  }

  <div class="sec">Where the money is</div>
  <p>${
    isBuyer
      ? `Your payment is held by Tokun. It is <b>not</b> with ${
          other ? esc(other) : "the creator"
        } and won't be until the work is approved. That is what makes paying up front safe.`
      : `The client's payment is already held by Tokun, so the money exists before you start. It isn't yours yet — it becomes yours on approval, or automatically as described below.`
  }</p>
  <table class="tbl">
    <tr><td><b>What releases it</b></td><td>${
      isBuyer
        ? "You approving the delivery — or the automatic release below."
        : "The client approving your delivery — or the automatic release below."
    }</td></tr>
    <tr><td><b>Automatic release</b></td><td>If the delivery is neither approved nor sent back for a revision within <b>${
      RULES.autoReleaseHours
    } hours</b>, it counts as accepted and the escrow releases ${
      isBuyer ? "to the creator" : "to you"
    }. ${
      isBuyer
        ? `You're reminded ${RULES.autoReleaseWarningHours} hours before that happens. Silence is acceptance — this is the one deadline worth putting in your calendar.`
        : `The client is reminded ${RULES.autoReleaseWarningHours} hours beforehand.`
    }</td></tr>
    <tr><td><b>What sends it back</b></td><td>${
      isBuyer
        ? "A revision request you're entitled to, a cancellation you both agree on, or a dispute decided in your favour."
        : "A cancellation you both agree on, or a dispute decided for the client. A cancellation after work has started is normally settled as a split."
    }</td></tr>
    <tr><td><b>The outer limit</b></td><td>Escrow can't be held past <b>${
      doc.escrowExpiresAt ? esc(formatDate(doc.escrowExpiresAt)) : `${RULES.maxHoldDays} days from payment`
    }</b> — a payment-processor limit neither of you nor Tokun can extend. Everything has to be settled before then, and you're both warned ${
      RULES.escrowWarningDays
    } days ahead.</td></tr>
  </table>

  <div class="sec">Seeing progress</div>
  <p>${
    isBuyer
      ? `You don't have to wait until delivery to see something. Ask for a progress checkpoint from your order page and ${
          other ? esc(other) : "the creator"
        } will share a screenshot or a short recording — or explain why now isn't a good time, which is a fair answer. One request every ${
          RULES.progressRequestCooldownHours
        } hours, so it stays a checkpoint rather than a standing demand. Anything shared this way is watermarked while the money is held, and is kept by Tokun as a dated record of what existed.`
      : `The client can ask to see how the work is going, at most once every ${
          RULES.progressRequestCooldownHours
        } hours. Answer with a screenshot or a short recording — or decline with a reason, which is a first-class answer and not a black mark. It's worth doing: a checkpoint is a dated record held by Tokun of what existed on that day, and it is the strongest evidence you have if the engagement is ever cancelled mid-way.`
  }</p>

  <div class="sec">If something isn't right</div>
  <table class="tbl">
    <tr><td><b>${isBuyer ? "The work isn't what I asked for" : "The client isn't happy"}</b></td><td>${
      isBuyer
        ? `Request a revision instead of approving. That stops the ${RULES.autoReleaseHours}-hour clock, and it restarts in full when they resubmit. Adding something that wasn't in the brief is a change of scope, not a revision — that needs a new booking.`
        : `A revision request pauses the release clock and restarts it when you resubmit. If what they're asking for wasn't in the brief, say so — that's a change of scope and needs a new booking, not a free round.`
    }</td></tr>
    <tr><td><b>${isBuyer ? "Nothing is happening" : "The client has gone quiet"}</b></td><td>${
      isBuyer
        ? `Ask for a progress checkpoint first. If the delivery date passes with nothing delivered, you can allow more time in writing or cancel — and how much was actually done decides how the escrow splits.`
        : `An unanswered revision is chased after ${RULES.revisionStallWarnDays} days and can be referred to Tokun after ${RULES.revisionStallEscalateDays}. If you're waiting on the client for something from the access checklist, your deadline extends for that time.`
    }</td></tr>
    <tr><td><b>Cancelling</b></td><td>Before work starts, the payment is refunded. After it starts the money can't just go back: either of you can propose a split, saying what share ${
      isBuyer ? "the creator" : "you"
    } has earned, and if the other accepts, Tokun settles on that basis.</td></tr>
    <tr><td><b>No agreement</b></td><td>Either of you can refer it to Tokun, which decides how the escrow is distributed on the record it holds — this document's engagement, the brief, your messages, the checkpoints and the delivery dates. That is why checkpoints and written messages matter more than they look.</td></tr>
  </table>

  <div class="callout info">
    <div class="t">Your signed agreement is the binding version</div>
    This document explains the process in plain language. The engagement agreement and NDA that ${
      isBuyer ? "you and " : ""
    }${other ? esc(other) : "both parties"} signed is what actually binds ${
      isBuyer ? "you" : "you both"
    } — including confidentiality, who owns the deliverables and when, and the ${
      RULES.autoReleaseHours
    }-hour acceptance rule described above. Open it from your order page any time. Where the two differ, the signed agreement governs.
  </div>

  <div class="foot">
    Generated by Tokun for ${isService ? "booking" : "deal"} ${esc(doc.orderId || "—")} on ${esc(
      formatDate(new Date())
    )}, for ${isBuyer ? "the client" : "the creator"}.
    The dates and amounts above are this engagement's record as it stood at that moment — the live record on your order page governs if the two ever differ.
    Questions Tokun can answer, rather than ${esc(otherLabel)}: use Support from your account menu.
  </div>
</div></body></html>`;
}

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
            text: `The work is with you. Approve it or ask for a revision within ${RULES.autoReleaseHours} hours of delivery — after that it counts as accepted and the escrow releases automatically.`,
          }
        : {
            tone: "info" as const,
            text: `Delivered. If the client neither approves nor asks for a revision within ${RULES.autoReleaseHours} hours, the escrow releases to you automatically.`,
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
          ? `Delivery is ${Math.abs(dueIn)} day${Math.abs(dueIn) === 1 ? "" : "s"} overdue. You can allow more time in writing, or cancel — how much was actually done decides how the escrow splits.`
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
        ? "Your payment is held in escrow and won't reach the creator until you approve the work."
        : "The client's payment is held in escrow. It's released to you when they approve the delivery.",
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
                {isBuyer ? "In escrow" : "Your side"}{" "}
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
