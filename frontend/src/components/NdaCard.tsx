// src/components/NdaCard.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { NDA_SIGNED_EVENT } from "@/hooks/useDealRecord";
/* The platform rules the agreement has to state rather than imply. Shared with
   the welcome doc, which explains the same rules in plain language — a signed
   contract and an onboarding doc quoting different numbers for the same rule
   would be worse than either quoting none. */
import { RULES } from "@/lib/engagementRules";

const GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

/* The version of the terms below.
 *
 * Stamped onto every signature record (NdaRecord.agreementVersion) so that two
 * years from now, reading a dispute, it is possible to say which text the
 * parties actually agreed to rather than which text is current. Bump this on
 * ANY change to the clauses or to the shared RULES.
 *
 *   1.0  Original — NDA only: confidentiality, ownership, revisions, 12 clauses.
 *   2.0  Full engagement agreement: scope, payment & escrow mechanics,
 *        acceptance, delivery, client materials & access, warranties,
 *        indemnity, liability cap, cancellation, non-circumvention,
 *        subcontracting, tax, data protection, force majeure, notices,
 *        assignment, severability.
 */
export const AGREEMENT_VERSION = "2.0";

/* ---------- helpers ---------- */

function formatDate(value?: string | Date) {
  if (!value) return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/** Date AND time, for the things whose exact moment is the point — a signature. */
function formatDateTime(value?: string | Date) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}, ${d.toLocaleTimeString(
    "en-IN",
    { hour: "2-digit", minute: "2-digit" }
  )} IST`;
}

function money(n?: number | null, currency = "INR") {
  const value = Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency === "INR" ? `₹${value}` : `${currency} ${value}`;
}

function fileSize(bytes?: number) {
  const n = Number(bytes || 0);
  if (!n) return "";
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/* Status codes are internal vocabulary; an agreement two people sign shouldn't
   read "HELD_BY_TOKUN". Anything unmapped falls back to a de-snaked version
   rather than being hidden, so a new state never silently disappears from a
   signed document. */
const FUNDS_LABELS: Record<string, string> = {
  NOT_HELD: "Not yet funded",
  HELD_BY_TOKUN: "Held by Tokun",
  RELEASED_TO_SELLER: "Released to the creator",
  RELEASED_TO_FREELANCER: "Released to the creator",
  AUTO_RELEASED: "Auto-released to the creator",
  REFUNDED_TO_BUYER: "Refunded to the client",
  PARTIALLY_SETTLED: "Settled in part between the parties",
  DISPUTED: "Under dispute",
};

/* Schedule C row states. Same reasoning as FUNDS_LABELS — a document two people
   sign shouldn't read "NOT_APPLICABLE". */
const ACCESS_STATUS_LABELS: Record<string, string> = {
  PENDING: "Outstanding",
  PROVIDED: "Provided",
  DECLINED: "Declined by client",
  NOT_APPLICABLE: "Not applicable",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  ACCEPTED_WAITING_PAYMENT: "Accepted — awaiting payment",
  FUNDED: "Funded, work not started",
  IN_PROGRESS: "Work in progress",
  WORK_SUBMITTED: "Work submitted, under review",
  REVISION_REQUESTED: "Revision requested",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  DISPUTED: "Under dispute",
  REFUNDED: "Refunded",
  SETTLED: "Settled",
};

function humanise(code?: string, map: Record<string, string> = {}) {
  const key = String(code || "");
  if (!key) return "";
  if (map[key]) return map[key];
  return key
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

function esc(s?: string) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Free text the parties wrote, kept as they wrote it — line breaks and all. */
function escBlock(s?: string) {
  return esc(s).replace(/\r?\n/g, "<br/>");
}

export type NdaData = {
  dealId?: string;
  /** Which side of the marketplace this came from — the wording differs. */
  engagement?: "service" | "hire";

  // ── what the work is ──
  projectTitle?: string;
  /** The brief: what the client actually asked for, in their words. */
  description?: string;
  /** The listing that was booked, and its public description (services only). */
  serviceTitle?: string;
  serviceDescription?: string;
  /** "What you get" bullets from the listing, snapshotted into the agreement. */
  packageItems?: string[];
  /** Reference material attached to the brief — named, never linked. */
  attachments?: { name?: string; size?: number }[];

  // ── terms ──
  deliveryLabel?: string;
  deliveryDays?: number | null;
  deliveryDueAt?: string;
  targetDate?: string;
  revisionsLabel?: string;
  revisionsAllowed?: number | null;

  // ── money ──
  budget?: number;
  amount?: number;
  clientFee?: number;
  /* GST on the client-side platform fee. Part of what the client actually paid,
     so it belongs in Schedule B — leaving it out made totalPayable look like
     arithmetic that didn't add up. */
  clientFeeGst?: number;
  totalPayable?: number;
  currency?: string;
  /* The creator's side of the same transaction: Tokun's commission and the GST
     on it. Shown because clause 10 states who bears which fee, and a clause
     about a deduction the document never quantifies is not a term. */
  platformFee?: number;
  platformFeeGst?: number;
  /** amount − platformFee − platformFeeGst: the creator's net on full release. */
  sellerAmount?: number;

  /* ── client-provided materials & access (Schedule C) ──
     The access checklist for this engagement, if one was raised. Labels and
     state only — never a credential, never a link. Clause 13 is what these are
     governed by, and this is the record of what was actually asked for. */
  accessItems?: {
    label?: string;
    kind?: string;
    required?: boolean;
    status?: string;
    providedAt?: string;
  }[];

  /** Stamped into the footer so a signed copy names the terms it was signed under. */
  agreementVersion?: string;

  // ── state ──
  status?: string;
  paymentStatus?: string;
  fundsStatus?: string;
  escrowExpiresAt?: string;
  bookedAt?: string;
  paidAt?: string;

  // ── parties ──
  clientName?: string;
  clientEmail?: string;
  freelancerName?: string;
  freelancerEmail?: string;
  clientSignedAt?: string;
  freelancerSignedAt?: string;

  effectiveDate?: string;
};

/* ---------- NDA HTML builder ---------- */

/* The agreement.
 *
 * It used to carry seven facts: title, one line of description, budget, target
 * date, two names and an ID. Everything that makes an engagement specific — what
 * was actually ordered, what the listing promised, how many revisions, what the
 * client attached to the brief, what was paid and what is still held in escrow —
 * was on the order screen and nowhere in the document the parties signed. An NDA
 * that can't identify the work it covers is decoration; if it ever has to be
 * read in a dispute, the schedules below are the part that matters.
 *
 * ── Why this is no longer only an NDA (v2.0) ─────────────────────────────────
 *
 * The document covered confidentiality, ownership and revisions, and nothing
 * else. Everything that actually gets argued about lived only in code:
 *
 *   • Payment. The escrow mechanics, whose fee is whose, what GST is charged
 *     on, when money moves — all enforced by the server, none of it written
 *     down anywhere the two parties had agreed to.
 *   • Acceptance. Work auto-releases 72 hours after delivery if the client says
 *     nothing. That is the single most consequential rule on the platform and
 *     the signed document did not mention it.
 *   • Cancellation. There is a whole dispute-and-settlement flow with an admin
 *     ruling on a percentage split, and the agreement said only "Tokun may
 *     release, refund or split".
 *   • Liability, warranties, indemnity, taxes, subcontracting, off-platform
 *     circumvention, client-supplied access — absent entirely. In a dispute
 *     these are exactly the questions asked, and there was no agreed answer to
 *     any of them.
 *
 * So the schedules stay and the clause set is now the whole engagement: an NDA
 * that also happens to be the services contract, rather than an NDA sitting
 * next to a contract that never existed. Confidentiality is Part II, and
 * clauses 2, 3, 4 and 5 are word-for-word what they were — nothing was
 * weakened to make room, only added around.
 *
 * Everything here comes from the order itself. Nothing is invented: a field the
 * booking doesn't have renders as "Not specified" rather than a plausible
 * default, because a signed document inventing terms is worse than one admitting
 * a gap. The platform's own rules come from RULES above, which mirrors the
 * server constants that enforce them — a stated term and an enforced term have
 * to be the same term.
 */
export function buildNdaHtml(nda: NdaData, sigs?: { client?: string; freelancer?: string }): string {
  const isService = nda.engagement === "service";
  const currency = nda.currency || "INR";

  const title = esc(nda.projectTitle || nda.serviceTitle || "Project Engagement");
  const dealId = esc(nda.dealId || "—");
  const client = esc(nda.clientName || (isService ? "Client (Disclosing Party)" : "Client (Disclosing Party)"));
  const freelancer = esc(nda.freelancerName || "Creator (Receiving Party)");
  const today = esc(formatDate(nda.effectiveDate));

  const NOT_SPECIFIED = `<span style="color:#a29daf;font-weight:500">Not specified</span>`;
  const val = (v?: string | number | null) =>
    v === 0 || (v !== undefined && v !== null && String(v).trim() !== "") ? esc(String(v)) : NOT_SPECIFIED;

  /* ── the terms, as text ── */
  const price = nda.budget ?? nda.amount;
  const deliveryTerm = (() => {
    if (nda.deliveryDays) return `${nda.deliveryDays} day${nda.deliveryDays === 1 ? "" : "s"} from payment`;
    if (nda.deliveryLabel) return nda.deliveryLabel;
    return "";
  })();
  const revisionTerm = (() => {
    if (typeof nda.revisionsAllowed === "number") {
      return `${nda.revisionsAllowed} revision${nda.revisionsAllowed === 1 ? "" : "s"} included`;
    }
    if (nda.revisionsLabel) return nda.revisionsLabel;
    // null on a booking made under no cap. That IS the term, and it's a
    // materially different one from "not specified".
    if (nda.revisionsAllowed === null) return "Unlimited (no cap agreed at booking)";
    return "";
  })();

  const row = (k: string, v: string, wide = false) =>
    `<div class="${wide ? "cell full" : "cell"}"><div class="k">${esc(k)}</div><div class="v">${v}</div></div>`;

  const packageList = (nda.packageItems || []).filter((s) => String(s || "").trim());
  const attachments = (nda.attachments || []).filter((a) => String(a?.name || "").trim());
  const accessItems = (nda.accessItems || []).filter((a) => String(a?.label || "").trim());

  /* Money, as the clauses need to be able to name it.
     `moneyVal` prints "Not specified" for a genuinely absent figure but keeps a
     real 0 — a zero platform fee is a term, not a gap. */
  const moneyVal = (n?: number | null) =>
    n === undefined || n === null ? NOT_SPECIFIED : esc(money(n, currency));

  // The liability cap in clause 23 is a number, not a phrase. It is the price
  // of this engagement — the most either side can lose here is what was put
  // into it — so the clause quotes it when the order knows it.
  const capText = price === undefined || price === null ? "the total price payable for this engagement" : money(price, currency);

  const clientSideExtras =
    (Number(nda.clientFee) || 0) + (Number(nda.clientFeeGst) || 0);
  const creatorSideDeductions =
    (Number(nda.platformFee) || 0) + (Number(nda.platformFeeGst) || 0);

  const label = {
    creator: isService ? "Creator (Seller)" : "Creator (Freelancer)",
    client: isService ? "Client (Buyer)" : "Client",
    booking: isService ? "booking" : "engagement",
  };

  const sigBox = (dataUrl?: string) =>
    dataUrl
      ? `<img loading="lazy" decoding="async" src="${dataUrl}" style="height:52px;display:block;margin-bottom:6px;max-width:220px;" alt="signature"/>`
      : `<div style="height:52px;margin-bottom:6px;border-bottom:1px dashed #bbb;"></div>`;

  // Short enough to sit on one line beside the role chip — the timestamp is the
  // part with legal weight, "electronically" is already said in clause 12.
  const signedLine = (at?: string) =>
    at ? `Signed ${esc(formatDateTime(at))}` : `Signature / Date`;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/>
<title>Engagement Agreement &amp; NDA — ${title}</title>
<style>
  @page{size:A4;margin:18mm 16mm}
  *{box-sizing:border-box}
  body{margin:0;font-family:Georgia,"Times New Roman",serif;color:#14121b;background:#f3f2f7;line-height:1.55;font-size:12.5px}
  .sheet{max-width:820px;margin:24px auto;background:#fff;padding:44px 50px 52px;box-shadow:0 12px 50px rgba(0,0,0,.18)}
  .brand{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #7c3aed;padding-bottom:14px;margin-bottom:22px}
  .brand h1{font-family:Inter,Arial,sans-serif;font-size:22px;letter-spacing:4px;margin:0;color:#7c3aed}
  .brand .tag{font-family:Inter,Arial,sans-serif;font-size:10px;letter-spacing:2px;color:#8b8794;text-transform:uppercase}
  h2.doc-title{font-family:Inter,Arial,sans-serif;text-align:center;font-size:19px;margin:4px 0;letter-spacing:.5px}
  .subtitle{text-align:center;color:#6b6675;font-size:11px;margin-bottom:22px;font-family:Inter,Arial,sans-serif}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 22px;background:#faf9fc;border:1px solid #ece9f3;border-radius:10px;padding:15px 17px;margin-bottom:18px;font-family:Inter,Arial,sans-serif;font-size:11.5px}
  .grid.three{grid-template-columns:1fr 1fr 1fr}
  .cell .k{color:#8b8794;font-size:8.5px;letter-spacing:1.3px;text-transform:uppercase}
  .cell .v{color:#14121b;font-weight:600;margin-top:2px;word-break:break-word}
  .full{grid-column:1/-1}
  .sec{font-family:Inter,Arial,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7c3aed;margin:26px 0 8px;padding-bottom:5px;border-bottom:1px solid #ece9f3}
  h3{font-family:Inter,Arial,sans-serif;font-size:12.5px;margin:18px 0 5px;color:#2a2536}
  p{margin:0 0 9px}
  ol{margin:0 0 9px;padding-left:20px}ol li{margin-bottom:6px}
  ul.items{margin:0;padding-left:18px;font-family:Inter,Arial,sans-serif;font-size:11.5px}
  ul.items li{margin-bottom:4px}
  .quote{background:#faf9fc;border-left:3px solid #d9d0f5;border-radius:0 8px 8px 0;padding:12px 14px;margin:0 0 12px;font-size:12px;white-space:normal}
  .quote .lbl{font-family:Inter,Arial,sans-serif;font-size:8.5px;letter-spacing:1.3px;text-transform:uppercase;color:#8b8794;margin-bottom:5px}
  table.files{width:100%;border-collapse:collapse;font-family:Inter,Arial,sans-serif;font-size:11px;margin-bottom:10px}
  table.files td{padding:5px 8px;border-bottom:1px solid #f0edf6;vertical-align:top}
  table.files td.sz{text-align:right;color:#8b8794;white-space:nowrap;width:80px}
  .note{font-family:Inter,Arial,sans-serif;font-size:10.5px;color:#8b8794;margin:0 0 10px}
  .sig{display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-top:38px;page-break-inside:avoid}
  .sig .name{font-weight:700;color:#14121b;font-family:Inter,Arial,sans-serif;margin-bottom:2px}
  .sig .email{font-family:Inter,Arial,sans-serif;font-size:10.5px;color:#8b8794;margin-bottom:8px;word-break:break-all}
  .sig .line{border-top:1px solid #14121b;padding-top:6px;font-family:Inter,Arial,sans-serif;font-size:10.5px;color:#6b6675}
  .role{font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:#8b8794;font-family:Inter,Arial,sans-serif}
  .disclaimer{margin-top:30px;padding-top:13px;border-top:1px dashed #d9d5e2;font-size:9.5px;color:#8b8794;font-family:Inter,Arial,sans-serif;line-height:1.6}
  .clause{page-break-inside:avoid}
  @media print{body{background:#fff}.sheet{box-shadow:none;margin:0;max-width:none;padding:0}}
</style></head>
<body><div class="sheet">
  <div class="brand"><h1>TOKUN</h1><span class="tag">Payment-Protected Engagement</span></div>
  <h2 class="doc-title">SERVICES, CONFIDENTIALITY &amp;<br/>NON-DISCLOSURE AGREEMENT</h2>
  <div class="subtitle">Executed electronically by both parties on the Tokun platform · ${
    isService ? "Service booking" : "Direct hire engagement"
  } · Terms v${esc(nda.agreementVersion || AGREEMENT_VERSION)}</div>

  <div class="sec">Parties &amp; Agreement</div>
  <div class="grid">
    ${row("Effective Date", val(formatDate(nda.effectiveDate)))}
    ${row(isService ? "Booking / Agreement ID" : "Deal / Agreement ID", val(nda.dealId))}
    ${row(
      "Disclosing Party (Client)",
      `${val(nda.clientName)}${nda.clientEmail ? `<div style="font-weight:500;color:#6b6675;font-size:10.5px">${esc(nda.clientEmail)}</div>` : ""}`
    )}
    ${row(
      "Receiving Party (Creator)",
      `${val(nda.freelancerName)}${nda.freelancerEmail ? `<div style="font-weight:500;color:#6b6675;font-size:10.5px">${esc(nda.freelancerEmail)}</div>` : ""}`
    )}
    ${row("Engagement Type", isService ? "Fixed-price service booking" : "Negotiated project engagement")}
    ${row("Funds Held By", "Tokun (held until the work is approved or settled)")}
  </div>

  <div class="sec">Schedule A — The Engagement</div>
  <div class="grid">
    ${row(isService ? "Service Booked" : "Project Title", val(nda.projectTitle || nda.serviceTitle), true)}
    ${isService && nda.serviceTitle && nda.projectTitle !== nda.serviceTitle ? row("Listing Title", val(nda.serviceTitle), true) : ""}
    ${row("Delivery Terms", val(deliveryTerm))}
    ${row("Revisions Included", val(revisionTerm))}
    ${row("Delivery Due", val(nda.deliveryDueAt ? formatDate(nda.deliveryDueAt) : ""))}
    ${row(
      isService ? "Client's Preferred Date" : "Agreed Delivery Date",
      val(nda.targetDate ? formatDate(nda.targetDate) : "")
    )}
    ${row("Current Stage", val(humanise(nda.status, STATUS_LABELS)))}
    ${row("Booked On", val(nda.bookedAt ? formatDate(nda.bookedAt) : ""))}
  </div>

  ${
    packageList.length
      ? `<h3>A.1 &nbsp;What the engagement includes</h3>
         <p class="note">As listed by the creator and snapshotted at booking. These are the terms this agreement covers.</p>
         <ul class="items">${packageList.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`
      : ""
  }

  ${
    nda.serviceDescription
      ? `<h3>A.2 &nbsp;Scope as listed by the creator</h3>
         <div class="quote"><div class="lbl">Listing description</div>${escBlock(nda.serviceDescription)}</div>`
      : ""
  }

  <h3>${packageList.length || nda.serviceDescription ? "A.3" : "A.1"} &nbsp;The client's brief</h3>
  <div class="quote">
    <div class="lbl">${isService ? "Requirements submitted with the booking" : "Project description agreed between the parties"}</div>
    ${
      nda.description
        ? escBlock(nda.description)
        : `<span style="color:#a29daf">No written brief was submitted with this ${isService ? "booking" : "engagement"}; the scope is as set out above and as agreed in the parties' Tokun chat.</span>`
    }
  </div>

  ${
    attachments.length
      ? `<h3>Reference material shared with the brief</h3>
         <p class="note">Named here so the record shows what was handed over. These files are Confidential Information under clause 2 — they are stored privately by Tokun and are not linked from this document.</p>
         <table class="files">${attachments
           .map(
             (a) =>
               `<tr><td>${esc(a.name)}</td><td class="sz">${esc(fileSize(a.size))}</td></tr>`
           )
           .join("")}</table>`
      : ""
  }

  <div class="sec">Schedule B — Commercial Terms</div>
  <div class="grid three">
    ${row(isService ? "Listed Price" : "Agreed Project Value", moneyVal(price))}
    ${row("Client Platform Fee", moneyVal(nda.clientFee))}
    ${row("GST on Client Fee", moneyVal(nda.clientFeeGst))}
    ${row("Total Paid by Client", moneyVal(nda.totalPayable))}
    ${row("Currency", esc(currency))}
    ${row("Payment Status", val(humanise(nda.paymentStatus)))}
    ${row("Payment Status", val(humanise(nda.fundsStatus, FUNDS_LABELS)))}
    ${nda.paidAt ? row("Funded On", esc(formatDate(nda.paidAt))) : ""}
    ${nda.escrowExpiresAt ? row("Payment Must Settle By", esc(formatDate(nda.escrowExpiresAt))) : ""}
  </div>

  ${
    /* The creator's side of the same money.
       Shown to BOTH parties on purpose. Clause 14 states that each side bears
       its own platform fee, and a clause imposing a deduction that the document
       never quantifies is not a term the creator can be said to have agreed to.
       It is also the only place the creator's net is written down against a
       signature. Omitted entirely when the order carries no commission figures
       (older records), rather than printed as three blanks. */
    creatorSideDeductions > 0 || nda.sellerAmount !== undefined
      ? `<h3>B.1 &nbsp;The creator's side</h3>
         <div class="grid three">
           ${row("Tokun Commission", moneyVal(nda.platformFee))}
           ${row("GST on Commission", moneyVal(nda.platformFeeGst))}
           ${row("Creator's Net on Full Release", moneyVal(nda.sellerAmount))}
         </div>`
      : ""
  }

  <p class="note">The figures above are the amounts recorded on this ${label.booking} at the time this document was
  generated, and are the amounts this Agreement refers to. ${
    clientSideExtras > 0
      ? `The client pays ${esc(money(price ?? 0, currency))} for the work plus ${esc(money(clientSideExtras, currency))} in platform fee and GST. `
      : ""
  }GST is charged on Tokun's fees only, never on the price of the work itself — that supply is the creator's own and its tax is the creator's own (clause 17).</p>

  ${
    /* Schedule C — what the client has to hand over.
       Only rendered when an access checklist was actually raised on the order,
       because an empty "materials required" schedule on an engagement that
       needed none reads as an unmet obligation. Labels and status only: the
       responses live on the order, and a credential is never written into a
       document that gets downloaded (clause 6). */
    accessItems.length
      ? `<div class="sec">Schedule C — Client-Provided Materials &amp; Access</div>
         <p class="note">The items the creator requires from the client in order to perform the engagement, as raised on
         this ${label.booking}. Governed by clause 11. Access is granted by invitation to the creator's own account —
         passwords are never exchanged through Tokun and are not recorded here.</p>
         <table class="files">${accessItems
           .map(
             (a) =>
               `<tr><td>${esc(a.label)}${
                 a.required === false
                   ? ` <span style="color:#8b8794;font-size:9.5px">(optional)</span>`
                   : ""
               }</td><td class="sz">${esc(humanise(a.status, ACCESS_STATUS_LABELS) || "Pending")}</td></tr>`
           )
           .join("")}</table>`
      : ""
  }

  <div class="sec">Part I — The Agreement</div>

  <div class="clause"><h3>1. Purpose &amp; structure</h3>
  <p>This Agreement governs both (a) the disclosure of confidential information between the parties and (b) the performance and payment of the engagement described in Schedule A, contracted and paid for through Tokun's payment protection service. Schedules A, B and (where present) C form part of this Agreement and are as binding as the clauses below.</p>
  <p>In this Agreement the <b>Client</b> is the Disclosing Party named above (the party paying), and the <b>Creator</b> is the Receiving Party named above (the party performing the work). <b>Tokun</b> means the platform holding the payment. Where a clause refers to something being "in writing", a message sent inside Tokun between the two parties satisfies it.</p></div>

  <div class="sec">Part II — Confidentiality</div>

  <div class="clause"><h3>2. Confidential Information</h3><p>"Confidential Information" means any non-public information either party discloses to the other for the Purpose, in any form, including: the brief and any reference material attached to it (named above); source files, designs, code, copy, footage and prompts; credentials, API keys and access to any system; business plans, pricing, unreleased products and customer data; every message, file and mid-project checkpoint exchanged inside Tokun; and the unreleased deliverables themselves.</p></div>

  <div class="clause"><h3>3. Obligations of the Receiving Party (Creator)</h3>
  <ol>
    <li>Use the Confidential Information solely to perform the Purpose in Schedule A.</li>
    <li>Not disclose, publish, resell, or share it with any third party without prior written consent, including with subcontractors not disclosed to the Disclosing Party.</li>
    <li>Protect it with at least the same care used for its own confidential material.</li>
    <li>Not reuse project-specific deliverables for any other client, or in a public portfolio, without the Disclosing Party's consent.</li>
    <li>Not train, fine-tune or publish any model or dataset on the Confidential Information.</li>
  </ol></div>

  <div class="clause"><h3>4. Obligations of the Disclosing Party (Client)</h3>
  <ol>
    <li>Treat the creator's working files, methods, drafts and pricing as confidential.</li>
    <li>Not use, publish, distribute or commercially exploit any deliverable — or any watermarked preview, review copy or progress checkpoint of it — before the payment for this engagement is released or settled. Previews are provided so the work can be reviewed and approved, and for no other purpose.</li>
    <li>Not remove, obscure or circumvent any watermark applied to a preview.</li>
  </ol></div>

  <div class="clause"><h3>5. Exclusions</h3><p>Confidential Information does not include information that becomes public through no fault of the receiving party, was lawfully known before disclosure, is received lawfully from a third party without restriction, or is independently developed without use of the Confidential Information.</p></div>

  <div class="clause"><h3>6. Credentials &amp; system access</h3>
  <p>Where the engagement requires the Creator to work inside the Client's systems, access shall be granted by <b>invitation to an account the Creator controls</b>, at the lowest privilege sufficient for the work, and shall be revoked by the Client on completion, cancellation or termination.</p>
  <p>Neither party shall send a password, private key, one-time code or other shared secret through Tokun chat, this Agreement, an access checklist or any attachment to them. Tokun is not a credential store and does not undertake to protect a secret disclosed to it in breach of this clause. A party that discloses a credential in breach of this clause bears the consequences of that disclosure, and shall rotate the credential promptly on becoming aware of it.</p>
  <p>The Creator shall not use any access granted under this clause for any purpose other than the Purpose, shall not retain it after revocation, and shall notify the Client without undue delay on becoming aware of any unauthorised use of it.</p></div>

  <div class="clause"><h3>7. Return or destruction</h3><p>On completion, cancellation, or written request, each party shall return or securely destroy the other's Confidential Information, save for one archival copy kept for legal and tax record-keeping, and save for the records Tokun retains as the holder of the funds (including this Agreement, the brief, the checkpoints and the delivered files) so that a dispute can be adjudicated on evidence.</p></div>

  <div class="sec">Part III — The Work</div>

  <div class="clause"><h3>8. Scope of services</h3>
  <p>The Creator shall perform the engagement described in Schedule A with reasonable skill and care, to a standard reasonably expected of a competent practitioner in that field. Schedule A — the ${
    isService ? "listing, the package items and the client's brief" : "project title, description and agreed terms"
  } — is the whole of what is contracted for.</p>
  <p>Anything not stated in Schedule A is out of scope. Out-of-scope work is not covered by this Agreement, is not covered by the payment held against it, and gives rise to no obligation on either party until agreed under clause 9.</p></div>

  <div class="clause"><h3>9. Revisions &amp; change requests</h3>
  <p><b>Revisions.</b> The engagement includes the revisions stated in Schedule A${
    typeof nda.revisionsAllowed === "number"
      ? ` — ${nda.revisionsAllowed} revision${nda.revisionsAllowed === 1 ? "" : "s"}`
      : ""
  }. A revision means correcting or refining the work against the scope already agreed. Once the included revisions are used, further changes require a variation under this clause.</p>
  <p><b>Not a revision.</b> A request that adds a deliverable, changes the brief, or asks for a different direction from the one agreed is a change of scope, not a revision, however it is described.</p>
  <p><b>Variations.</b> A change of scope takes effect only when both parties agree it in writing, including any change to price and to the delivery date. A variation agreed without a change to the amount held does not increase the sum the Creator can be paid from this engagement.</p>
  <p><b>Unanswered revisions.</b> Where the Client has requested a revision and the Creator does not respond, Tokun will remind the Creator after ${RULES.revisionStallWarnDays} days and may refer the engagement to the dispute process in clause 26 after ${RULES.revisionStallEscalateDays} days.</p></div>

  <div class="clause"><h3>10. Delivery &amp; timelines</h3>
  <p><b>The clock.</b> ${
    nda.deliveryDays
      ? `Delivery is due ${nda.deliveryDays} day${nda.deliveryDays === 1 ? "" : "s"} from the date the payment is funded${
          nda.deliveryDueAt ? `, being ${esc(formatDate(nda.deliveryDueAt))}` : ""
        }.`
      : `No fixed number of delivery days was agreed for this ${label.booking}; the Creator shall deliver within a reasonable time, and by any date stated in Schedule A.`
  } The period runs from payment, not from the Creator starting work — otherwise a Creator who never starts would never be late.</p>
  <p><b>Extensions.</b> The delivery date moves only by written agreement, or by the length of any delay caused by the Client failing to provide something required under clause 11, or by an event under clause 24.</p>
  <p><b>Late delivery.</b> If the Creator has not delivered by the due date, the Client may (a) allow further time in writing, or (b) cancel under clause 25, in which case the extent of the work actually performed determines the split. Late delivery is a factor Tokun will weigh in any ruling under clause 26.</p>
  <p><b>The outer limit.</b> Held funds cannot be kept beyond ${RULES.maxHoldDays} days from payment — this is a limit of the payment processor and neither party nor Tokun can extend it. Every engagement must therefore reach release, refund or settlement before ${
    nda.escrowExpiresAt ? esc(formatDate(nda.escrowExpiresAt)) : `that date`
  }. Both parties are warned ${RULES.escrowWarningDays} days beforehand. Delivery terms longer than ${RULES.maxDeliveryDays} days cannot be offered for this reason.</p></div>

  <div class="clause"><h3>11. Client-provided materials &amp; access</h3>
  <p>The Client shall provide, promptly and in a usable form, the materials, information, approvals and access the Creator reasonably requires to perform the engagement${
    /* Only cite Schedule C when there IS one. A signed contract pointing at a
       schedule the document doesn't contain is a defect in the document, not a
       harmless cross-reference — and most engagements have no checklist at the
       moment of signing, so the unconditional version was the common case. */
    accessItems.length
      ? ` — including everything listed in Schedule C, and anything later requested through Tokun's access checklist for this ${label.booking}`
      : `, including anything requested through Tokun's access checklist for this ${label.booking}`
  }.</p>
  <p>The Client warrants that it owns or is licensed to supply everything it provides, and that the Creator's use of it for the Purpose infringes no third-party right. Clause 22 applies to any claim that it does.</p>
  <p>Where the Creator is delayed because a required item is outstanding, the delivery date in clause 10 extends by the length of that delay, and the Creator shall not be treated as late for that period. Access granted under this clause is subject to clause 6.</p></div>

  <div class="clause"><h3>12. Progress checkpoints</h3><p>While the work is underway the Client may ask, through Tokun, to see how it is progressing, and the Creator shall respond by sharing a checkpoint or by explaining why one cannot be shared at that time. A request may be made no more than once every ${RULES.progressRequestCooldownHours} hours. A shared checkpoint is not a delivery, is not an acceptance, and does not bind either party as to how complete the work is; it is a record, kept by Tokun, of what existed on that date, and both parties agree it may be used as evidence under clause 26.</p></div>

  <div class="clause"><h3>13. Subcontracting</h3><p>The Creator shall perform the engagement personally and may not subcontract or assign any part of it without the Client's prior written consent. Where consent is given, the Creator (a) remains fully liable for the work and for the subcontractor's acts and omissions as if they were its own, and (b) shall bind the subcontractor to confidentiality obligations no less protective than Parts II and VIII of this Agreement before disclosing anything to them.</p></div>

  <div class="sec">Part IV — Money</div>

  <div class="clause"><h3>14. Price, fees &amp; what each party pays</h3>
  <p>The price of the engagement is the amount stated in Schedule B and is fixed. It is not an estimate and is not adjustable for the time the work actually takes.</p>
  <p><b>The Client pays</b> the price plus Tokun's client-side platform fee and the GST on that fee. <b>The Creator receives</b> the price less Tokun's commission and the GST on that commission. Each party bears its own platform fee; neither fee is part of the other's consideration, and neither is refundable on cancellation except where clause 25 says otherwise.</p>
  <p>All amounts are in ${esc(currency)}. Bank charges, currency conversion and payment-instrument charges on either side are borne by the party incurring them.</p></div>

  <div class="clause"><h3>15. How the money is held</h3>
  <p>The Client pays before work begins. Tokun holds the funds — it does not pay them to the Creator on receipt and does not treat them as its own. The Creator is not entitled to payment on funding; funding entitles the Creator to <i>begin</i>, and the Client to require performance.</p>
  <p>Funds are released only: on the Client approving the delivery; on automatic release under clause 16; on refund to the Client; or on a split under clause 25 or a ruling under clause 26. Nothing else releases them, and neither party may instruct Tokun to release them on any other basis.</p>
  <p>The held payment secures this engagement alone. It is not security for any other engagement between the parties, and cannot be set off against one.</p></div>

  <div class="clause"><h3>16. Acceptance &amp; automatic release</h3>
  <p><b>This clause decides when the Creator gets paid. Both parties should read it.</b></p>
  <p>On delivery the Client shall, within ${RULES.autoReleaseHours} hours, either approve the delivery or request a revision to which it is entitled under clause 9. The Client is reminded ${RULES.autoReleaseWarningHours} hours before that period ends.</p>
  <p><b>If the Client does neither, the delivery is deemed accepted and the payment is released to the Creator automatically at the end of that period.</b> Silence is acceptance. The Client's remedies after automatic release are those in clause 26 and at law; the money will already have moved.</p>
  <p>Requesting a revision within the period stops the clock. It restarts, in full, on the Creator's resubmission. Approval, once given, is final as to acceptance of the delivery and is not withdrawable, and ownership passes under clause 18.</p></div>

  <div class="clause"><h3>17. Taxes</h3>
  <p>GST is charged by Tokun on Tokun's own fees only — the client-side platform fee and the commission — and never on the price of the work. That price is the Creator's own supply to the Client.</p>
  <p>Each party is responsible for its own taxes on this engagement, including the Creator's income tax and any GST the Creator is itself required to charge, register for or remit on its supply. Tokun's invoice is not a tax invoice for the Creator's supply. Where the Client is required by law to withhold tax at source from the price, it shall do so and provide the Creator with the corresponding certificate; a withholding correctly made is treated as paid to the Creator for the purposes of this Agreement.</p></div>

  <div class="sec">Part V — Rights in the Work</div>

  <div class="clause"><h3>18. Ownership &amp; transfer of deliverables</h3>
  <p>Ownership of the final approved deliverables described in Schedule A transfers to the Client upon full release of the held amount in Schedule B, unless otherwise agreed in writing. Until that release the deliverables remain the property of the Creator, and the Client's only right in them is to review them for the purpose of approval under clause 16.</p>
  <p>On transfer, the Creator assigns to the Client all right, title and interest in those deliverables, including copyright, worldwide and for their full term, and waives any moral right it is capable of waiving. The Creator shall, at the Client's reasonable request and cost, do anything further reasonably needed to give effect to that assignment.</p>
  <p>Where the payment is settled only in part, ownership transfers only to the extent of the work paid for, and the parties shall record in writing what that covers. Where the payment is refunded in full, no ownership transfers and the Client shall destroy every copy of the deliverables in its possession.</p>
  <p><b>Retained tools.</b> The Creator retains ownership of the general skills, methods, know-how, and pre-existing or reusable tools, libraries, components and templates it used to make the deliverables, and grants the Client a perpetual, worldwide, non-exclusive, royalty-free licence to use them to the extent they are embedded in the deliverables. This does not entitle the Creator to withhold anything Schedule A requires it to hand over.</p></div>

  <div class="clause"><h3>19. Third-party &amp; licensed assets</h3><p>Where a deliverable incorporates a font, stock asset, plugin, library, model or other third-party material, the Creator shall disclose it in writing on or before delivery, together with the licence it is supplied under and any restriction or ongoing fee attached to it. The Creator shall not incorporate material it is not licensed to use for the Purpose, or whose licence does not permit the Client's intended use as stated in Schedule A. Any ongoing third-party licence fee is the Client's, unless Schedule A says the Creator bears it.</p></div>

  <div class="clause"><h3>20. Portfolio &amp; publicity</h3><p>The Creator may not publish, display or describe this engagement or any deliverable — in a portfolio, case study, showreel, social post or otherwise — without the Client's prior written consent, which the Client may refuse. This restates clause 3.4 and is not weakened by the transfer of ownership under clause 18. Neither party may use the other's name, logo or trade marks without consent. A rating or review left through Tokun's review feature is permitted and is not publicity for the purposes of this clause.</p></div>

  <div class="sec">Part VI — Risk</div>

  <div class="clause"><h3>21. Warranties</h3>
  <p><b>The Creator warrants</b> that: the deliverables are its own original work or material it is licensed to supply; it has the right to grant the assignment in clause 18; the deliverables will not knowingly infringe any third-party intellectual property right; it will comply with applicable law in performing the engagement; and it will not include malicious code, an undisclosed backdoor, or any hidden means of disabling or reclaiming the deliverables.</p>
  <p><b>The Client warrants</b> that: it has the right to supply everything it provides under clause 11; the Creator's use of that material for the Purpose infringes no third-party right; and the Purpose is lawful.</p>
  <p><b>Both parties warrant</b> that they have the capacity and authority to enter into this Agreement, and that the identity and email recorded against their signature are their own.</p>
  <p>Except as set out in this clause, and to the extent the law permits, no other warranty, condition or term is given by either party — including any implied warranty of merchantability or fitness for a particular purpose.</p></div>

  <div class="clause"><h3>22. Indemnity</h3><p>Each party shall indemnify the other against loss, damage, cost and reasonable legal expense arising from a third-party claim caused by that party's breach of clause 21 (warranties), Part II (confidentiality) or clause 6 (credentials). The indemnified party shall notify the other promptly of any such claim, shall not settle it without the other's consent, and shall give the other reasonable assistance in defending it. This clause is not subject to the cap in clause 23.</p></div>

  <div class="clause"><h3>23. Limitation of liability</h3>
  <p>Neither party is liable to the other for loss of profit, loss of revenue, loss of business, loss of anticipated saving, loss of goodwill, or any indirect or consequential loss, however arising.</p>
  <p>Each party's total liability to the other under or in connection with this Agreement is limited in aggregate to <b>${esc(capText)}</b>.</p>
  <p>Nothing in this clause limits liability for death or personal injury caused by negligence, for fraud or fraudulent misrepresentation, for a party's indemnity under clause 22, for a breach of Part II (confidentiality) or clause 6 (credentials), or for any liability that cannot lawfully be limited.</p>
  <p><b>Tokun's position.</b> Tokun is not a party to this Agreement. It holds the payment and operates the platform, gives no warranty as to the work, the parties, or the outcome of the engagement, and does not guarantee the performance of either party. Its role and its own liability are governed by its platform terms.</p></div>

  <div class="clause"><h3>24. Force majeure</h3><p>Neither party is in breach for a failure or delay caused by an event beyond its reasonable control — including natural disaster, war, civil unrest, epidemic, government action, failure of a public network or utility, or the extended outage of a third-party platform the engagement depends on. The affected party shall notify the other in writing without undue delay, and the delivery date extends by the length of the event. Inability to pay is never a force majeure event. Where the event continues for more than thirty (30) days, either party may cancel under clause 25 and the payment shall be settled according to the work actually performed.</p></div>

  <div class="sec">Part VII — Ending the Engagement</div>

  <div class="clause"><h3>25. Cancellation &amp; termination</h3>
  <p><b>Before the payment is funded.</b> Either party may withdraw at any time, at no cost and with no liability to the other. An unpaid proposal or booking lapses automatically after ${RULES.unpaidRequestExpiryDays} days.</p>
  <p><b>After funding, before work has started.</b> The Client may cancel and the price is refunded. Tokun's fees are dealt with under Tokun's refund policy.</p>
  <p><b>After work has started.</b> The money cannot simply go back. Either party may propose cancellation, stating what share of the price the Creator has earned. If the other party accepts, Tokun settles on that basis: the accepted share is released to the Creator and the balance refunded to the Client. If they do not agree, clause 26 applies.</p>
  <p><b>Termination for cause.</b> Either party may terminate immediately on written notice if the other commits a material breach of this Agreement and does not remedy it within seven (7) days of being asked to, or breaches Part II or clause 6 at all. Termination for cause does not by itself determine how the payment is settled — that is decided under this clause or clause 26 on the basis of the work performed and the breach.</p>
  <p><b>On any ending.</b> The Client shall revoke every access granted under clause 6; each party shall comply with clause 7; and the clauses listed in clause 27 survive.</p></div>

  <div class="clause"><h3>26. Disputes &amp; Tokun's role</h3>
  <p><b>Between the parties first.</b> The parties shall attempt in good faith to resolve any disagreement between themselves through Tokun, including by proposing a split under clause 25.</p>
  <p><b>Then Tokun.</b> Where they do not agree, either party may refer the matter to Tokun, which may release, refund or split the payment, including by the decision of a Tokun administrator. In deciding, Tokun may rely on the record it holds: this Agreement, the brief and its attachments, the messages between the parties, the progress checkpoints, the submissions and their history, and the delivery dates. <b>The parties accept that a decision made by Tokun on that record binds them as to how the held money is distributed</b>, and that this is a commercial allocation of funds Tokun holds, not an adjudication of their legal rights.</p>
  <p><b>Then the courts.</b> Nothing in this clause prevents either party from pursuing its remedies at law, including against the other for any shortfall. A party that does so may not require Tokun to reverse a distribution already made.</p></div>

  <div class="clause"><h3>27. Term &amp; survival</h3><p>This Agreement takes effect on the Effective Date and continues until the engagement is completed, cancelled or terminated and the payment is settled. The confidentiality obligations in Part II remain in force for ${RULES.confidentialityYears === 2 ? "two (2)" : String(RULES.confidentialityYears)} years after that date; obligations concerning credentials, personal data and trade secrets survive without limit. Clauses 7, 18, 19, 20, 21, 22, 23, 26, 28, 29, 30 and 34 survive the ending of this Agreement.</p></div>

  <div class="sec">Part VIII — General</div>

  <div class="clause"><h3>28. Non-circumvention &amp; off-platform dealing</h3><p>This engagement was introduced, contracted and secured through Tokun, and that payment protection is what both parties are relying on. Neither party shall solicit or agree to move this engagement, or the payment for it, off the platform, and neither shall ask the other to pay or be paid outside it. A party that takes payment for this engagement outside Tokun loses that protection and clause 26 in respect of it, and remains liable to Tokun for the fees it would have earned. This clause does not prevent the parties from freely contracting with each other, on or off Tokun, for different work.</p></div>

  <div class="clause"><h3>29. Non-solicitation</h3><p>For twelve (12) months after this Agreement ends, neither party shall knowingly solicit or induce an employee, contractor or subcontractor of the other whom it came to know through this engagement to terminate their engagement with that party. A general advertisement not directed at that person is not a breach of this clause.</p></div>

  <div class="clause"><h3>30. Data protection</h3><p>Where the Client provides the Creator with personal data, the Client is the controller of it and the Creator processes it only on the Client's instructions and only for the Purpose. The Creator shall keep it secure, shall not transfer it to anyone else without consent (clause 13 applies to subcontractors), shall notify the Client without undue delay on becoming aware of any breach affecting it, and shall delete or return it under clause 7. Each party shall comply with applicable data-protection law, including India's Digital Personal Data Protection Act, 2023, in respect of this engagement.</p></div>

  <div class="clause"><h3>31. Notices</h3><p>A notice under this Agreement is validly given if sent through Tokun's messaging to the other party's account for this ${label.booking}, or by email to the address recorded against that party's signature above. A notice sent through Tokun is deemed received when it appears in the conversation; one sent by email, on the next business day. A party whose email address changes shall keep its Tokun account current, and a notice sent to the address on record is validly given whether or not it is read.</p></div>

  <div class="clause"><h3>32. Assignment</h3><p>Neither party may assign or transfer this Agreement, or any right under it, without the other's prior written consent, save that either party may assign it as part of a transfer of substantially the whole of its business, on written notice to the other. The Creator's obligation to perform personally is governed by clause 13. Nothing in this clause restricts the Client's disposal of deliverables it has come to own under clause 18.</p></div>

  <div class="clause"><h3>33. Entire agreement, variation &amp; severability</h3><p>This Agreement, together with its Schedules, is the entire agreement between the parties on this engagement and supersedes any earlier understanding on it, including anything said in chat before it was signed — save that nothing in this clause excludes liability for fraudulent misrepresentation. It may be varied only in writing agreed by both parties (clause 9 governs changes of scope). No failure or delay in enforcing a right waives it. If any provision is held invalid or unenforceable, it shall be modified to the least extent necessary to make it enforceable, or if that is not possible severed, and the rest of the Agreement stands.</p></div>

  <div class="clause"><h3>34. Governing law</h3><p>This Agreement is governed by the laws of India, and the parties submit to the exclusive jurisdiction of the courts at the Disclosing Party's place of business.</p></div>

  <div class="clause"><h3>35. Electronic execution</h3><p>Each party signs this Agreement electronically on Tokun. The parties agree that a signature captured and stored in this way, together with the timestamp recorded against it, is valid, binding and admissible, and that neither party will dispute its validity on the grounds of its electronic form alone. This Agreement is binding on each party from the moment that party signs; it is fully executed when both have signed, and payment cannot be made until then.</p></div>

  <div class="sig">
    <div>
      <div class="name">${client}</div>
      ${nda.clientEmail ? `<div class="email">${esc(nda.clientEmail)}</div>` : ""}
      ${sigBox(sigs?.client)}
      <div class="line">${signedLine(nda.clientSignedAt)} <span class="role">&nbsp;•&nbsp; Disclosing Party</span></div>
    </div>
    <div>
      <div class="name">${freelancer}</div>
      ${nda.freelancerEmail ? `<div class="email">${esc(nda.freelancerEmail)}</div>` : ""}
      ${sigBox(sigs?.freelancer)}
      <div class="line">${signedLine(nda.freelancerSignedAt)} <span class="role">&nbsp;•&nbsp; Receiving Party</span></div>
    </div>
  </div>

  <div class="disclaimer">
    Generated by Tokun for ${isService ? "booking" : "deal"} ${dealId} on ${today}, under terms version ${esc(nda.agreementVersion || AGREEMENT_VERSION)}.
    The details in Schedules A, B and C are taken from the engagement record as it stood at that moment; the live record on Tokun governs if the two ever differ.
    The platform periods stated in clauses 9, 10, 12, 16 and 25 are the periods Tokun actually enforced at that version.
    This is a convenience template, not legal advice — for high-value or unusual work, have your own counsel review it before signing.
    The Agreement is fully executed once both parties have signed and submitted their copy, and payment cannot be made until then.
  </div>
</div></body></html>`;
}

/* ---------- download / print ---------- */

/**
 * Saves the agreement as a PDF.
 *
 * Was a .html download. A signed contract is the one document a party keeps for
 * years, and an .html file opens as markup in most things people read documents
 * in — the same reason the emailed copy stopped being HTML.
 *
 * Rendered by the server rather than here, through the same renderer that
 * produces the emailed copy and the stored record
 * (server/services/agreementPdf.service.js). One implementation: a PDF library
 * in this bundle would be a second one to keep in step with it, for a document
 * the server already knows how to draw.
 *
 * Falls back to the browser's own print-to-PDF if the request fails, so the
 * button always does something — that path needs no network and no auth.
 */
async function downloadPdf(
  nda: NdaData,
  sigs?: { client?: string; freelancer?: string },
  apiBase?: string,
  token?: string
) {
  const html = buildNdaHtml(nda, sigs);
  const filename = `Tokun-Agreement-${nda.dealId || "engagement"}.pdf`;

  if (!apiBase || !token) return printNda(nda, sigs);

  try {
    const res = await fetch(`${apiBase}/api/agreement/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ html, filename }),
    });
    if (!res.ok) throw new Error(String(res.status));

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch {
    printNda(nda, sigs);
  }
}

function printNda(nda: NdaData, sigs?: { client?: string; freelancer?: string }) {
  const html = buildNdaHtml(nda, sigs);
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (!doc) return;
  doc.open(); doc.write(html); doc.close();
  setTimeout(() => {
    try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); } catch { /**/ }
    setTimeout(() => iframe.parentNode?.removeChild(iframe), 1500);
  }, 350);
}

/* ---------- Signature Canvas ---------- */

function SignatureCanvas({ onConfirm }: { onConfirm: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasSig, setHasSig] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const getPos = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const src = "touches" in e ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 2.2; ctx.lineCap = "round"; ctx.lineJoin = "round";

    const onStart = (e: MouseEvent | TouchEvent) => { e.preventDefault(); drawing.current = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    const onMove = (e: MouseEvent | TouchEvent) => { if (!drawing.current) return; e.preventDefault(); const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); setHasSig(true); };
    const onEnd = () => { drawing.current = false; };

    canvas.addEventListener("mousedown", onStart);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onEnd);
    canvas.addEventListener("mouseleave", onEnd);
    canvas.addEventListener("touchstart", onStart, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("touchend", onEnd);

    return () => {
      canvas.removeEventListener("mousedown", onStart);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseup", onEnd);
      canvas.removeEventListener("mouseleave", onEnd);
      canvas.removeEventListener("touchstart", onStart);
      canvas.removeEventListener("touchmove", onMove);
      canvas.removeEventListener("touchend", onEnd);
    };
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSig(false); setConfirmed(false);
  }, []);

  const confirm = useCallback(() => {
    if (!canvasRef.current || !hasSig) return;
    onConfirm(canvasRef.current.toDataURL("image/png"));
    setConfirmed(true);
  }, [hasSig, onConfirm]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={560}
        height={110}
        style={{ width: "100%", height: 110, display: "block", borderRadius: 12, border: confirmed ? "2px solid #4ade80" : "1.5px dashed rgba(255,255,255,0.2)", background: "#fff", cursor: confirmed ? "default" : "crosshair", touchAction: "none" }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={clear} style={{ height: 36, padding: "0 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)", cursor: "pointer", fontSize: 12 }}>
          Clear
        </button>
        <button onClick={confirm} disabled={!hasSig || confirmed} style={{ flex: 1, height: 36, borderRadius: 8, border: "none", background: confirmed ? "rgba(74,222,128,0.15)" : hasSig ? GRADIENT : "rgba(255,255,255,0.06)", color: confirmed ? "#4ade80" : hasSig ? "#fff" : "rgba(255,255,255,0.25)", cursor: hasSig && !confirmed ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, transition: "all .2s" }}>
          {confirmed ? "✓ Signature Confirmed" : "Confirm Signature"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Step indicator ---------- */

function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: done ? "#4ade80" : active ? GRADIENT : "rgba(255,255,255,0.08)", color: done || active ? "#fff" : "rgba(255,255,255,0.3)", flexShrink: 0 }}>
        {done ? "✓" : n}
      </div>
    </div>
  );
}

/* ---------- NDA Modal ---------- */

function NdaModal({ nda, onClose, dealId, token, apiBase, resource = "hire" }: {
  nda: NdaData; onClose: () => void;
  dealId?: string; token?: string; apiBase?: string;
  resource?: "hire" | "service";
}) {
  const { user } = useAuth() as any;
  const basePath = resource === "service" ? "services/orders" : "hire";
  const [tab, setTab] = useState<"preview" | "sign">("preview");
  const [mySig, setMySig] = useState<string>("");                     // my confirmed signature data URL
  const [step, setStep] = useState<1 | 2>(1);                         // 1 = signing, 2 = auto-submitting/submitted
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadError, setUploadError] = useState("");
  const pendingFileRef = useRef<File | null>(null);                   // signed doc, kept around so a failed auto-submit can retry

  // NDA upload status from deal
  const [ndaStatus, setNdaStatus] = useState<{
    clientUrl?: string;
    freelancerUrl?: string;
    // Read back from the order so the agreement renders signed on every future
    // open, by both parties — not just in the session where it was signed.
    clientSignature?: string;
    freelancerSignature?: string;
  } | null>(null);
  const [role, setRole] = useState<"client" | "freelancer" | null>(null);

  const fetchDealStatus = useCallback(() => {
    if (!dealId || !token || !apiBase) return;
    fetch(`${apiBase}/api/${basePath}/${dealId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const record = resource === "service" ? d?.order : d?.deal;
        if (record) {
          setNdaStatus(
            resource === "service"
              ? {
                  clientUrl: record.ndaBuyerUrl,
                  freelancerUrl: record.ndaSellerUrl,
                  clientSignature: record.ndaBuyerSignature,
                  freelancerSignature: record.ndaSellerSignature,
                }
              : {
                  clientUrl: record.ndaClientUrl,
                  freelancerUrl: record.ndaFreelancerUrl,
                  clientSignature: record.ndaClientSignature,
                  freelancerSignature: record.ndaFreelancerSignature,
                }
          );
          // Determine role
          const partyAId = String(
            (resource === "service" ? record.buyerId?._id || record.buyerId : record.clientId?._id || record.clientId) || ""
          );
          const myId = String(user?._id || user?.id || "");
          setRole(partyAId === myId ? "client" : "freelancer");
        }
      })
      .catch(() => {});
  }, [dealId, token, apiBase, user, basePath, resource]);

  useEffect(() => { fetchDealStatus(); }, [fetchDealStatus]);

  /* Both parties' signatures, read from the order — so the agreement stays
     signed forever and each side sees the other's signature too.
     `mySig` still wins for whoever is signing right now, because it's on screen
     before the save round-trips. Previously this was mySig ONLY, which is why
     the signature vanished the moment the modal closed. */
  const sigs = useMemo(() => ({
    client:
      (role === "client" ? mySig : "") || ndaStatus?.clientSignature || undefined,
    freelancer:
      (role === "freelancer" ? mySig : "") || ndaStatus?.freelancerSignature || undefined,
  }), [role, mySig, ndaStatus]);

  const srcDoc = useMemo(() => buildNdaHtml(nda, sigs), [nda, sigs]);

  const handleUpload = useCallback(async (file: File, signature?: string) => {
    if (!dealId || !token || !apiBase) { setUploadError("Open this NDA from inside a deal chat to enable upload."); return; }
    pendingFileRef.current = file;
    setUploading(true); setUploadError(""); setUploadMsg("");
    const form = new FormData();
    form.append("nda", file);
    // Sent alongside the document so the signature survives this modal being
    // closed. It used to live only in component state, so reopening the NDA
    // rendered a blank signature line even though it had been signed.
    if (signature) form.append("signature", signature);
    /* Which version of the terms this signature is against.
       Sent from here rather than assumed on the server: the server has no way
       to know what text the browser actually rendered and the party actually
       read, and that is precisely the fact a signature record needs to hold. */
    form.append("agreementVersion", nda.agreementVersion || AGREEMENT_VERSION);
    try {
      const res = await fetch(`${apiBase}/api/${basePath}/${dealId}/upload-nda`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (data.success) {
        setUploadMsg(data.bothSigned
          ? "Both parties have signed and submitted! ✓ NDA is complete."
          : "Your signed NDA has been submitted. Waiting for the other party to sign.");
        pendingFileRef.current = null;
        fetchDealStatus();
        /* The Pay button lives on a card in the chat behind this dialog, which
           is not an ancestor of it — there is no prop to hand the result back
           through. It listens for this instead, so a client who has just signed
           doesn't sit in front of a disabled button until they reload. */
        try {
          window.dispatchEvent(
            new CustomEvent(NDA_SIGNED_EVENT, {
              detail: { dealId, resource, bothSigned: !!data.bothSigned },
            })
          );
        } catch {}
      } else {
        setUploadError(data.error || "Submission failed. Try again.");
      }
    } catch { setUploadError("Network error. Try again."); }
    setUploading(false);
  }, [dealId, token, apiBase, fetchDealStatus, basePath, resource, nda.agreementVersion]);

  // As soon as the signature is confirmed, build the final signed document
  // right here (same HTML the Preview/Download buttons would produce, with
  // the signature baked in) and submit it immediately — no manual
  // download-then-reupload step for either party.
  const handleSigConfirmed = useCallback((dataUrl: string) => {
    setMySig(dataUrl);
    setStep(2);
    const mySigs = {
      client: role === "client" ? dataUrl : undefined,
      freelancer: role === "freelancer" ? dataUrl : undefined,
    };
    const html = buildNdaHtml(nda, mySigs);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const file = new File([blob], `Tokun-Agreement-${nda.dealId || "engagement"}.html`, { type: "text/html" });
    handleUpload(file, dataUrl);
  }, [role, nda, handleUpload]);

  const retrySubmit = useCallback(() => {
    if (pendingFileRef.current) handleUpload(pendingFileRef.current, mySig || undefined);
  }, [handleUpload, mySig]);

  const myUploaded = role === "client" ? !!ndaStatus?.clientUrl : !!ndaStatus?.freelancerUrl;
  const otherUploaded = role === "client" ? !!ndaStatus?.freelancerUrl : !!ndaStatus?.clientUrl;
  const bothSigned = !!(ndaStatus?.clientUrl && ndaStatus?.freelancerUrl);

  const roleLabel =
    resource === "service"
      ? role === "client" ? "Buyer (Disclosing Party)" : "Creator (Receiving Party)"
      : role === "client" ? "Client (Disclosing Party)" : "Creator (Receiving Party)";
  const otherLabel =
    resource === "service"
      ? role === "client" ? "Creator" : "Buyer"
      : role === "client" ? "Creator" : "Client";

  const tabBtn = (t: "preview" | "sign") => ({
    flex: 1, height: 34, borderRadius: 8, border: "none",
    background: tab === t ? "rgba(255,255,255,0.11)" : "transparent",
    color: tab === t ? "#fff" : "rgba(255,255,255,0.38)",
    cursor: "pointer", fontSize: 13, fontWeight: tab === t ? 700 : 500,
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center px-3" style={{ zIndex: 2147483000, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(14px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 760, maxWidth: "calc(100vw - 20px)", height: "min(93vh, 930px)", borderRadius: 22, background: "#14121E", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 48px 120px rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "Inter, sans-serif", color: "#fff" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>📄</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Engagement Agreement &amp; NDA</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{nda.projectTitle || "Project Engagement"}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {bothSigned && <span style={{ fontSize: 11, background: "rgba(74,222,128,0.12)", color: "#4ade80", padding: "3px 12px", borderRadius: 20, fontWeight: 700 }}>✓ Fully Executed</span>}
            {role && !bothSigned && (
              <span style={{ fontSize: 11, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", padding: "3px 12px", borderRadius: 20 }}>
                You: {resource === "service" ? (role === "client" ? "buyer" : "creator") : role}
              </span>
            )}
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, padding: "10px 16px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
          <button style={tabBtn("preview")} onClick={() => setTab("preview")}>Preview Agreement</button>
          <button style={tabBtn("sign")} onClick={() => setTab("sign")}>✍ Sign &amp; Upload</button>
        </div>

        {/* ─── PREVIEW TAB ─── */}
        {tab === "preview" && (
          <>
            <div style={{ flex: 1, minHeight: 0, background: "#f3f2f7" }}>
              <iframe title="NDA preview" srcDoc={srcDoc} style={{ width: "100%", height: "100%", border: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 10, padding: "13px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", justifyContent: "flex-end", flexShrink: 0 }}>
              <button onClick={() => downloadPdf(nda, sigs, apiBase, token)} style={{ height: 40, padding: "0 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.8)", cursor: "pointer", fontSize: 13 }}>⬇ Download PDF</button>
              <button onClick={() => printNda(nda, sigs)} style={{ height: 40, padding: "0 22px", borderRadius: 8, border: "none", background: GRADIENT, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>🖨 Print</button>
            </div>
          </>
        )}

        {/* ─── SIGN & UPLOAD TAB ─── */}
        {tab === "sign" && (
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "22px 24px 28px" }}>

            {/* Status row */}
            <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
              {[
                { label: `You (${roleLabel.split(" ")[0]})`, done: myUploaded },
                { label: otherLabel, done: otherUploaded },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: s.done ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${s.done ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.07)"}`, fontSize: 12, fontWeight: 600, color: s.done ? "#4ade80" : "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{s.done ? "✓" : "○"}</span>{s.label} — {s.done ? "Signed & uploaded" : "Pending"}
                </div>
              ))}
            </div>

            {/* Already uploaded by me */}
            {myUploaded ? (
              <div style={{ padding: "18px 20px", borderRadius: 14, background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.22)", marginBottom: 20, fontSize: 13 }}>
                <div style={{ fontWeight: 700, color: "#4ade80", marginBottom: 4 }}>✓ You've already uploaded your signed NDA</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{bothSigned ? "Both parties have signed. The NDA is complete!" : `Waiting for the ${otherLabel} to sign and upload.`}</div>
              </div>
            ) : (
              <>
                {/* Step 1 — Draw signature */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <StepDot n={1} active={step === 1} done={step > 1} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>Draw your signature</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Signing as: <span style={{ color: "rgba(255,255,255,0.65)" }}>{roleLabel}</span></div>
                    </div>
                  </div>
                  {step === 1 && (
                    <>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "0 0 10px" }}>Draw your signature inside the box below using your mouse or finger.</p>
                      <SignatureCanvas onConfirm={handleSigConfirmed} />
                    </>
                  )}
                  {step > 1 && (
                    <div style={{ fontSize: 12, color: "#4ade80" }}>✓ Signature confirmed — visible on the NDA preview</div>
                  )}
                </div>

                {/* Step 2 — Auto-submit (no manual download/re-upload needed) */}
                <div style={{ opacity: step >= 2 ? 1 : 0.35, transition: "opacity .3s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <StepDot n={2} active={uploading} done={!!uploadMsg} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>Submitting your signed NDA</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                        {uploading ? "Uploading your signed copy…" : uploadMsg ? "Submitted automatically after signing" : "Happens automatically once you confirm your signature"}
                      </div>
                    </div>
                  </div>
                  {uploadMsg && <p style={{ fontSize: 13, color: "#4ade80", marginTop: 4, fontWeight: 600 }}>✓ {uploadMsg}</p>}
                  {uploadError && (
                    <div style={{ marginTop: 4 }}>
                      <p style={{ fontSize: 12, color: "#f87171", marginBottom: 8 }}>⚠ {uploadError}</p>
                      <button
                        onClick={retrySubmit}
                        disabled={uploading}
                        style={{ height: 38, padding: "0 20px", borderRadius: 8, border: "none", background: uploading ? "rgba(255,255,255,0.06)" : GRADIENT, color: uploading ? "rgba(255,255,255,0.35)" : "#fff", cursor: uploading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700 }}
                      >
                        {uploading ? "Retrying…" : "Retry Submission"}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Public NdaButton ---------- */

export default function NdaButton({ dealId, token, apiBase, fallback, variant = "full", resource = "hire" }: {
  dealId?: string; token?: string; apiBase?: string;
  fallback?: Partial<NdaData> & { title?: string };
  variant?: "full" | "compact";
  resource?: "hire" | "service";
}) {
  const [open, setOpen] = useState(false);
  const [deal, setDeal] = useState<any>(null);
  const basePath = resource === "service" ? "services/orders" : "hire";

  useEffect(() => {
    if (!dealId || !token || !apiBase) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/${basePath}/${dealId}`, { headers: { Authorization: `Bearer ${token}` } });
        const d = await res.json().catch(() => ({}));
        const record = resource === "service" ? d?.order : d?.deal;
        if (alive && d?.success && record) setDeal(record);
      } catch { /**/ }
    })();
    return () => { alive = false; };
  }, [dealId, token, apiBase, basePath, resource]);

  /* Everything the signed document quotes comes from here.
     The order endpoints already return all of it — the listing terms via the
     populated `serviceId`, the brief, the fee breakdown, the escrow state — it
     simply wasn't being read. `fallback` still covers the case where the NDA is
     opened from a chat card before the fetch lands. */
  const nda: NdaData = useMemo(() => {
    if (resource === "service") {
      const listing = deal?.serviceId || {};
      return {
        engagement: "service",
        dealId: dealId || fallback?.dealId,
        projectTitle: deal?.serviceTitle || fallback?.projectTitle || fallback?.title,
        serviceTitle: listing.title || deal?.serviceTitle,
        serviceDescription: listing.description,
        // The listing's "what you get" bullets, with the pre-2024 package
        // fields as a fallback so an old listing still describes itself.
        packageItems: (listing.deliverables?.length
          ? listing.deliverables
          : [listing.screens, listing.prototype && `Prototype: ${listing.prototype}`, listing.fileType]
        )?.filter(Boolean),
        description: deal?.note || fallback?.description,
        attachments: deal?.briefAttachments,
        deliveryLabel: listing.delivery,
        deliveryDays: deal?.deliveryDays,
        deliveryDueAt: deal?.deliveryDueAt,
        revisionsLabel: listing.revisions,
        revisionsAllowed: deal?.revisionsAllowed,
        budget: deal?.amount ?? fallback?.budget ?? fallback?.amount,
        amount: deal?.amount ?? fallback?.amount,
        clientFee: deal?.clientFee,
        clientFeeGst: deal?.clientFeeGst,
        totalPayable: deal?.totalPayable,
        // Schedule B.1 — the creator's side of the same money. Clause 14 binds
        // them to a deduction, so the document has to state it.
        platformFee: deal?.platformFee,
        platformFeeGst: deal?.platformFeeGst,
        sellerAmount: deal?.sellerAmount,
        currency: deal?.currency,
        status: deal?.status,
        paymentStatus: deal?.paymentStatus,
        fundsStatus: deal?.fundsStatus,
        escrowExpiresAt: deal?.escrowExpiresAt,
        bookedAt: deal?.createdAt,
        paidAt: deal?.paidAt,
        // Schedule C. Attached to the order response by the access-request
        // router; absent on an engagement where no checklist was ever raised,
        // and the schedule is then omitted rather than printed empty.
        accessItems: deal?.accessItems,
        targetDate: deal?.preferredDate || fallback?.targetDate,
        clientName: deal?.buyerId?.name || fallback?.clientName,
        clientEmail: deal?.buyerId?.email,
        freelancerName: deal?.sellerId?.name || fallback?.freelancerName,
        freelancerEmail: deal?.sellerId?.email,
        clientSignedAt: deal?.ndaBuyerSignedAt,
        freelancerSignedAt: deal?.ndaSellerSignedAt,
        effectiveDate: deal?.createdAt || fallback?.effectiveDate,
      };
    }
    return {
      engagement: "hire",
      dealId: dealId || fallback?.dealId,
      projectTitle: deal?.title || fallback?.projectTitle || fallback?.title,
      description: deal?.description || fallback?.description,
      attachments: deal?.briefAttachments,
      revisionsAllowed: deal?.revisionsAllowed,
      budget: deal?.amount ?? fallback?.budget ?? fallback?.amount,
      amount: deal?.amount ?? fallback?.amount,
      clientFee: deal?.clientFee,
      clientFeeGst: deal?.clientFeeGst,
      totalPayable: deal?.totalPayable,
      platformFee: deal?.platformFee,
      platformFeeGst: deal?.platformFeeGst,
      // HireDeal calls it freelancerAmount; the document calls both sides'
      // net "the creator's", so it is normalised here rather than in the doc.
      sellerAmount: deal?.freelancerAmount,
      currency: deal?.currency,
      status: deal?.status,
      paymentStatus: deal?.paymentStatus,
      fundsStatus: deal?.fundsStatus,
      escrowExpiresAt: deal?.escrowExpiresAt,
      bookedAt: deal?.createdAt,
      paidAt: deal?.paidAt,
      accessItems: deal?.accessItems,
      // A hire deal has no listing to snapshot delivery days from — the
      // proposal carries only a target date — so clause 10 reads its
      // "no fixed number of days" branch, which is the truth for hire.
      targetDate: deal?.deliveryDate || fallback?.targetDate,
      clientName: deal?.clientId?.name || fallback?.clientName,
      clientEmail: deal?.clientId?.email,
      freelancerName: deal?.freelancerId?.name || fallback?.freelancerName,
      freelancerEmail: deal?.freelancerId?.email,
      clientSignedAt: deal?.ndaClientSignedAt,
      freelancerSignedAt: deal?.ndaFreelancerSignedAt,
      effectiveDate: deal?.acceptedAt || fallback?.effectiveDate,
    };
  }, [deal, dealId, fallback, resource]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={
          variant === "compact"
            ? { height: 36, padding: "0 14px", borderRadius: 8, border: "1px solid rgba(192,132,252,0.35)", background: "rgba(192,132,252,0.10)", color: "#D7B6FF", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "Inter, sans-serif" }
            : { marginTop: 12, width: "100%", height: 44, borderRadius: 10, border: "1px solid rgba(192,132,252,0.30)", background: "rgba(192,132,252,0.08)", color: "#E7D6FF", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontFamily: "Inter, sans-serif" }
        }
      >
        <span style={{ fontSize: 15 }}>📄</span>
        View, Sign &amp; Upload Agreement
      </button>

      {open && (
        <NdaModal nda={nda} onClose={() => setOpen(false)} dealId={dealId} token={token} apiBase={apiBase} resource={resource} />
      )}
    </>
  );
}
