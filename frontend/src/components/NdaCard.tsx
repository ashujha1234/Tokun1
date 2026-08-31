// src/components/NdaCard.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { NDA_SIGNED_EVENT } from "@/hooks/useDealRecord";

const GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

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
  HELD_BY_TOKUN: "Held in escrow by Tokun",
  RELEASED_TO_SELLER: "Released to the creator",
  RELEASED_TO_FREELANCER: "Released to the creator",
  AUTO_RELEASED: "Auto-released to the creator",
  REFUNDED_TO_BUYER: "Refunded to the client",
  PARTIALLY_SETTLED: "Settled in part between the parties",
  DISPUTED: "Under dispute",
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
  totalPayable?: number;
  currency?: string;

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
 * Everything here comes from the order itself. Nothing is invented: a field the
 * booking doesn't have renders as "Not specified" rather than a plausible
 * default, because a signed document inventing terms is worse than one admitting
 * a gap.
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
<title>NDA — ${title}</title>
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
  <div class="brand"><h1>TOKUN</h1><span class="tag">Escrow-Protected Engagement</span></div>
  <h2 class="doc-title">NON-DISCLOSURE &amp; CONFIDENTIALITY AGREEMENT</h2>
  <div class="subtitle">Executed electronically by both parties on the Tokun platform · ${
    isService ? "Service booking" : "Direct hire engagement"
  }</div>

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
    ${row("Escrow Agent", "Tokun (funds held until the work is approved or settled)")}
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
    ${row(isService ? "Listed Price" : "Agreed Project Value", price === undefined || price === null ? NOT_SPECIFIED : esc(money(price, currency)))}
    ${row("Client Platform Fee", nda.clientFee === undefined || nda.clientFee === null ? NOT_SPECIFIED : esc(money(nda.clientFee, currency)))}
    ${row("Total Paid by Client", nda.totalPayable === undefined || nda.totalPayable === null ? NOT_SPECIFIED : esc(money(nda.totalPayable, currency)))}
    ${row("Currency", esc(currency))}
    ${row("Payment Status", val(humanise(nda.paymentStatus)))}
    ${row("Escrow Status", val(humanise(nda.fundsStatus, FUNDS_LABELS)))}
    ${nda.paidAt ? row("Funded On", esc(formatDate(nda.paidAt))) : ""}
    ${nda.escrowExpiresAt ? row("Escrow Must Settle By", esc(formatDate(nda.escrowExpiresAt))) : ""}
  </div>
  <p class="note">The figures above are the amounts recorded on this ${
    isService ? "booking" : "deal"
  } at the time this document was generated. The creator's own payout is net of Tokun's commission and is shown on their earnings record.</p>

  <div class="sec">Terms</div>

  <div class="clause"><h3>1. Purpose</h3><p>This Agreement governs the disclosure of confidential information between the Disclosing Party and the Receiving Party in connection with the engagement described in Schedule A, contracted and paid for through Tokun's escrow service. Schedules A and B form part of this Agreement.</p></div>

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
    <li>Not use, publish, distribute or commercially exploit any deliverable — or any watermarked preview, review copy or progress checkpoint of it — before the escrow for this engagement is released or settled. Previews are provided so the work can be reviewed and approved, and for no other purpose.</li>
    <li>Not remove, obscure or circumvent any watermark applied to a preview.</li>
  </ol></div>

  <div class="clause"><h3>5. Exclusions</h3><p>Confidential Information does not include information that becomes public through no fault of the receiving party, was lawfully known before disclosure, is received lawfully from a third party without restriction, or is independently developed without use of the Confidential Information.</p></div>

  <div class="clause"><h3>6. Ownership &amp; transfer of deliverables</h3><p>Ownership of the final approved deliverables described in Schedule A transfers to the Disclosing Party upon full release of the escrow amount in Schedule B, unless otherwise agreed in writing. Until that release the deliverables remain the property of the Receiving Party. Where the escrow is settled only in part, ownership transfers only to the extent of the work paid for, and the parties shall record what that covers in writing.</p></div>

  <div class="clause"><h3>7. Revisions &amp; scope</h3><p>The engagement includes the revisions stated in Schedule A. Work beyond the scope in Schedule A is not covered by this Agreement or by the escrow held against it, and requires a new booking or a written variation agreed by both parties.</p></div>

  <div class="clause"><h3>8. Term</h3><p>The confidentiality obligations in this Agreement take effect on the Effective Date and remain in force during the engagement and for two (2) years after its completion, cancellation or termination. Obligations concerning credentials, personal data and trade secrets survive without limit.</p></div>

  <div class="clause"><h3>9. Return or destruction</h3><p>On completion, cancellation, or written request, each party shall return or securely destroy the other's Confidential Information, save for one archival copy kept for legal and tax record-keeping, and save for the records Tokun retains as escrow agent (including this Agreement, the brief, the checkpoints and the delivered files) so that a dispute can be adjudicated on evidence.</p></div>

  <div class="clause"><h3>10. Disputes &amp; Tokun's role</h3><p>Tokun holds the escrow and may release, refund or split it in accordance with its escrow terms, including on the decision of a Tokun administrator where the parties do not agree. Tokun is not a party to the underlying work contract and gives no warranty as to the work itself. Nothing in this clause prevents either party from pursuing its legal remedies.</p></div>

  <div class="clause"><h3>11. Governing law</h3><p>This Agreement is governed by the laws of India, and the parties submit to the exclusive jurisdiction of the courts at the Disclosing Party's place of business.</p></div>

  <div class="clause"><h3>12. Electronic execution</h3><p>Each party signs this Agreement electronically on Tokun. The parties agree that a signature captured and stored in this way, together with the timestamp recorded against it, is valid, binding and admissible, and that neither party will dispute its validity on the grounds of its electronic form alone.</p></div>

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
    Generated by Tokun for ${isService ? "booking" : "deal"} ${dealId} on ${today}. The details in Schedules A and B are taken from the engagement record as it stood at that moment; the live record on Tokun governs if the two ever differ.
    This is a convenience template, not legal advice — for high-value or unusual work, have your own counsel review it. The NDA is complete once both parties have signed and submitted their copy.
  </div>
</div></body></html>`;
}

/* ---------- download / print ---------- */

function downloadHtml(nda: NdaData, sigs?: { client?: string; freelancer?: string }) {
  const html = buildNdaHtml(nda, sigs);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `Tokun-NDA-${nda.dealId || "agreement"}.html`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
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
  }, [dealId, token, apiBase, fetchDealStatus, basePath]);

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
    const file = new File([blob], `Tokun-NDA-${nda.dealId || "agreement"}.html`, { type: "text/html" });
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
              <div style={{ fontWeight: 700, fontSize: 15 }}>Non-Disclosure Agreement</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{nda.projectTitle || "Project Engagement"}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {bothSigned && <span style={{ fontSize: 11, background: "rgba(74,222,128,0.12)", color: "#4ade80", padding: "3px 12px", borderRadius: 20, fontWeight: 700 }}>✓ NDA Complete</span>}
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
          <button style={tabBtn("preview")} onClick={() => setTab("preview")}>Preview NDA</button>
          <button style={tabBtn("sign")} onClick={() => setTab("sign")}>✍ Sign &amp; Upload</button>
        </div>

        {/* ─── PREVIEW TAB ─── */}
        {tab === "preview" && (
          <>
            <div style={{ flex: 1, minHeight: 0, background: "#f3f2f7" }}>
              <iframe title="NDA preview" srcDoc={srcDoc} style={{ width: "100%", height: "100%", border: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 10, padding: "13px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", justifyContent: "flex-end", flexShrink: 0 }}>
              <button onClick={() => downloadHtml(nda, sigs)} style={{ height: 40, padding: "0 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.8)", cursor: "pointer", fontSize: 13 }}>⬇ Download .html</button>
              <button onClick={() => printNda(nda, sigs)} style={{ height: 40, padding: "0 22px", borderRadius: 8, border: "none", background: GRADIENT, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>⬇ Save as PDF</button>
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
        totalPayable: deal?.totalPayable,
        currency: deal?.currency,
        status: deal?.status,
        paymentStatus: deal?.paymentStatus,
        fundsStatus: deal?.fundsStatus,
        escrowExpiresAt: deal?.escrowExpiresAt,
        bookedAt: deal?.createdAt,
        paidAt: deal?.paidAt,
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
      totalPayable: deal?.totalPayable,
      currency: deal?.currency,
      status: deal?.status,
      paymentStatus: deal?.paymentStatus,
      fundsStatus: deal?.fundsStatus,
      escrowExpiresAt: deal?.escrowExpiresAt,
      bookedAt: deal?.createdAt,
      paidAt: deal?.paidAt,
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
        View, Sign &amp; Upload NDA
      </button>

      {open && (
        <NdaModal nda={nda} onClose={() => setOpen(false)} dealId={dealId} token={token} apiBase={apiBase} resource={resource} />
      )}
    </>
  );
}
