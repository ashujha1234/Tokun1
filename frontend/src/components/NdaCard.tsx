// src/components/NdaCard.tsx
// ────────────────────────────────────────────────────────────────────────────
// TOKUN — Non-Disclosure Agreement (NDA) card
//
// Kya karta hai:
//  - Jab freelancer proposal ACCEPT karta hai, HireAcceptedCard ke andar
//    <NdaButton/> dikhta hai.
//  - Deal ki info se ek proper NDA (project title, budget, timeline, parties,
//    confidentiality clauses) client-side generate hota hai.
//  - User "Download PDF" (print → Save as PDF), "Print", ya "Download .html"
//    se copy le sakta hai. Koi backend / API change nahi.
//
// Integration (Chat.tsx ke HireAcceptedCard ke andar, buttons ke aas paas):
//     import NdaButton from "@/components/NdaCard";
//     ...
//     <NdaButton dealId={dealId} token={token} apiBase={API_BASE} fallback={data} />
//
// SelfDash / ProposalDetailModal mein bhi same tarah drop kar sakte ho.
// ────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";

const GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

/* ---------- helpers ---------- */

function formatDate(value?: string | Date) {
  if (!value) return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function money(n?: number) {
  const v = Number(n || 0);
  return `₹${v.toLocaleString("en-IN")}.00`;
}

function esc(s?: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export type NdaData = {
  dealId?: string;
  projectTitle?: string;
  description?: string;
  budget?: number;
  amount?: number;
  targetDate?: string;
  clientName?: string;
  freelancerName?: string;
  effectiveDate?: string;
};

/* ---------- NDA HTML builder (printable A4 document) ---------- */

export function buildNdaHtml(nda: NdaData): string {
  const title = esc(nda.projectTitle || "Project Engagement");
  const description = esc(nda.description || "Confidential project work as discussed between the parties.");
  const budget = money(nda.budget ?? nda.amount);
  const target = nda.targetDate ? esc(formatDate(nda.targetDate)) : "As mutually agreed";
  const dealId = esc(nda.dealId || "—");
  const client = esc(nda.clientName || "Client (Disclosing Party)");
  const freelancer = esc(nda.freelancerName || "Freelancer (Receiving Party)");
  const today = esc(formatDate(nda.effectiveDate));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>NDA — ${title}</title>
<style>
  @page { size: A4; margin: 22mm 18mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Georgia", "Times New Roman", serif;
    color: #14121b;
    background: #f3f2f7;
    line-height: 1.55;
    font-size: 13px;
  }
  .sheet {
    max-width: 820px;
    margin: 24px auto;
    background: #ffffff;
    padding: 48px 54px 56px;
    box-shadow: 0 12px 50px rgba(0,0,0,0.18);
  }
  .brand {
    display:flex; align-items:center; justify-content:space-between;
    border-bottom: 3px solid #7c3aed; padding-bottom: 14px; margin-bottom: 26px;
  }
  .brand h1 {
    font-family: "Inter", Arial, sans-serif;
    font-size: 22px; letter-spacing: 4px; margin: 0; color: #7c3aed;
  }
  .brand .tag { font-family:"Inter",Arial,sans-serif; font-size: 10px; letter-spacing: 2px; color:#8b8794; text-transform: uppercase; }
  h2.doc-title {
    font-family: "Inter", Arial, sans-serif; text-align:center;
    font-size: 20px; margin: 4px 0 4px; letter-spacing: 0.5px;
  }
  .subtitle { text-align:center; color:#6b6675; font-size: 11px; margin-bottom: 26px; font-family:"Inter",Arial,sans-serif; }
  .meta {
    display:grid; grid-template-columns: 1fr 1fr; gap: 10px 24px;
    background:#faf9fc; border:1px solid #ece9f3; border-radius: 10px;
    padding: 16px 18px; margin-bottom: 26px; font-family:"Inter",Arial,sans-serif; font-size: 12px;
  }
  .meta .k { color:#8b8794; font-size: 9px; letter-spacing: 1.4px; text-transform: uppercase; }
  .meta .v { color:#14121b; font-weight: 600; margin-top: 2px; }
  .full { grid-column: 1 / -1; }
  h3 { font-family:"Inter",Arial,sans-serif; font-size: 13px; margin: 22px 0 6px; color:#2a2536; }
  p { margin: 0 0 10px; }
  ol { margin: 0 0 10px; padding-left: 20px; }
  ol li { margin-bottom: 7px; }
  .sig {
    display:grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 46px;
  }
  .sig .line { border-top: 1px solid #14121b; padding-top: 6px; font-family:"Inter",Arial,sans-serif; font-size: 11px; color:#6b6675; }
  .sig .name { font-weight: 700; color:#14121b; margin-bottom: 30px; font-family:"Inter",Arial,sans-serif; }
  .role { font-size: 9px; letter-spacing: 1.2px; text-transform: uppercase; color:#8b8794; font-family:"Inter",Arial,sans-serif; }
  .disclaimer { margin-top: 34px; padding-top: 14px; border-top: 1px dashed #d9d5e2; font-size: 10px; color:#8b8794; font-family:"Inter",Arial,sans-serif; }
  @media print {
    body { background:#fff; }
    .sheet { box-shadow:none; margin:0; max-width:none; padding:0; }
  }
</style>
</head>
<body>
  <div class="sheet">
    <div class="brand">
      <h1>TOKUN</h1>
      <span class="tag">Escrow-Protected Engagement</span>
    </div>

    <h2 class="doc-title">NON-DISCLOSURE &amp; CONFIDENTIALITY AGREEMENT</h2>
    <div class="subtitle">Executed electronically on acceptance of the project proposal via the Tokun platform</div>

    <div class="meta">
      <div><div class="k">Effective Date</div><div class="v">${today}</div></div>
      <div><div class="k">Agreement / Deal ID</div><div class="v">${dealId}</div></div>
      <div><div class="k">Disclosing Party (Client)</div><div class="v">${client}</div></div>
      <div><div class="k">Receiving Party (Freelancer)</div><div class="v">${freelancer}</div></div>
      <div><div class="k">Project Budget (Escrow)</div><div class="v">${budget}</div></div>
      <div><div class="k">Target Delivery</div><div class="v">${target}</div></div>
      <div class="full"><div class="k">Project Title</div><div class="v">${title}</div></div>
    </div>

    <h3>Project / Work Description</h3>
    <p>${description}</p>

    <h3>1. Purpose</h3>
    <p>This Agreement governs the disclosure of confidential information between the Disclosing Party and the
    Receiving Party in connection with the above-described project (the “Purpose”), engaged and funded through
    the Tokun platform's escrow service.</p>

    <h3>2. Confidential Information</h3>
    <p>“Confidential Information” means any non-public information disclosed by the Disclosing Party, whether oral,
    written, electronic or visual, including but not limited to project briefs, source files, designs, code,
    credentials, business plans, customer data, deliverables, and any material shared inside the Tokun chat or
    file exchange relating to the Purpose.</p>

    <h3>3. Obligations of the Receiving Party</h3>
    <ol>
      <li>Use the Confidential Information solely to perform the Purpose.</li>
      <li>Not disclose, publish, resell, or share it with any third party without prior written consent.</li>
      <li>Protect it with at least the same care used for its own confidential material.</li>
      <li>Not reuse project-specific deliverables or assets for any other client or public portfolio without consent.</li>
    </ol>

    <h3>4. Exclusions</h3>
    <p>Confidential Information does not include information that is or becomes public through no fault of the
    Receiving Party, was lawfully known before disclosure, or is independently developed without use of the
    Confidential Information.</p>

    <h3>5. Ownership &amp; Deliverables</h3>
    <p>Upon full release of escrow funds for the Purpose, ownership of the final approved deliverables transfers to
    the Disclosing Party, unless otherwise agreed in writing. Until payment is released, all deliverables remain
    the property of the Receiving Party and access is restricted as per Tokun's escrow rules.</p>

    <h3>6. Term</h3>
    <p>Confidentiality obligations under this Agreement remain in effect during the engagement and for a period of
    two (2) years following its completion or termination.</p>

    <h3>7. Return / Destruction</h3>
    <p>Upon request or completion, each party shall return or securely destroy the other party's Confidential
    Information, except one archival copy retained for legal record-keeping.</p>

    <h3>8. Remedies &amp; Governing Law</h3>
    <p>The parties agree that a breach may cause irreparable harm entitling the affected party to seek injunctive
    relief in addition to other remedies. This Agreement is governed by the laws of India, and disputes are
    subject to the jurisdiction of the courts at the Disclosing Party's place of business.</p>

    <div class="sig">
      <div>
        <div class="name">${client}</div>
        <div class="line">Signature / Date <span class="role">&nbsp; • &nbsp; Disclosing Party</span></div>
      </div>
      <div>
        <div class="name">${freelancer}</div>
        <div class="line">Signature / Date <span class="role">&nbsp; • &nbsp; Receiving Party</span></div>
      </div>
    </div>

    <div class="disclaimer">
      This document is generated automatically by Tokun as a convenience template and is deemed accepted by both
      parties upon acceptance of the project proposal. It is not a substitute for professional legal advice.
      Keep a copy for your records — you can download it and share the signed copy with the other party in the
      Tokun chat.
    </div>
  </div>
</body>
</html>`;
}

/* ---------- download / print utilities (no external libs) ---------- */

function downloadHtml(nda: NdaData) {
  const html = buildNdaHtml(nda);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Tokun-NDA-${nda.dealId || "agreement"}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function printNda(nda: NdaData) {
  const html = buildNdaHtml(nda);
  // Hidden iframe → avoids popup blockers. User "Save as PDF" from print dialog.
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  const go = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      /* ignore */
    }
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 1500);
  };
  // give the iframe a moment to render styles/fonts
  setTimeout(go, 350);
}

/* ---------- NDA Modal ---------- */

function NdaModal({ nda, onClose }: { nda: NdaData; onClose: () => void }) {
  const srcDoc = useMemo(() => buildNdaHtml(nda), [nda]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{ zIndex: 2147483000, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 760,
          maxWidth: "calc(100vw - 24px)",
          height: "min(88vh, 900px)",
          borderRadius: 22,
          background: "#161421",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "Inter, sans-serif",
          color: "#fff",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>📄</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Non-Disclosure Agreement</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                {nda.projectTitle || "Project Engagement"}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>

        {/* preview */}
        <div style={{ flex: 1, minHeight: 0, background: "#f3f2f7" }}>
          <iframe
            title="NDA preview"
            srcDoc={srcDoc}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        </div>

        {/* footer actions */}
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "14px 20px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() => downloadHtml(nda)}
            style={{
              height: 42,
              padding: "0 18px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "#242130",
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            ⬇ Download .html
          </button>
          <button
            onClick={() => printNda(nda)}
            style={{
              height: 42,
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
            ⬇ Download PDF / Print
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Public button (drop this into HireAcceptedCard / SelfDash) ---------- */

export default function NdaButton({
  dealId,
  token,
  apiBase,
  fallback,
  variant = "full",
}: {
  dealId?: string;
  token?: string;
  apiBase?: string;
  /** card payload (data) — used if API fetch is unavailable */
  fallback?: Partial<NdaData> & { title?: string };
  variant?: "full" | "compact";
}) {
  const [open, setOpen] = useState(false);
  const [deal, setDeal] = useState<any>(null);

  // Best-effort: full deal se description + party names le aao (optional).
  useEffect(() => {
    if (!dealId || !token || !apiBase) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/hire/${dealId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = await res.json().catch(() => ({}));
        if (alive && d?.success && d?.deal) setDeal(d.deal);
      } catch {
        /* silent — fallback data still works */
      }
    })();
    return () => {
      alive = false;
    };
  }, [dealId, token, apiBase]);

  const nda: NdaData = useMemo(
    () => ({
      dealId: dealId || fallback?.dealId,
      projectTitle: deal?.title || fallback?.projectTitle || fallback?.title,
      description: deal?.description || fallback?.description,
      budget: deal?.amount ?? fallback?.budget ?? fallback?.amount,
      amount: deal?.amount ?? fallback?.amount,
      targetDate: deal?.deliveryDate || fallback?.targetDate,
      clientName: deal?.clientId?.name || fallback?.clientName,
      freelancerName: deal?.freelancerId?.name || fallback?.freelancerName,
      effectiveDate: deal?.acceptedAt || fallback?.effectiveDate,
    }),
    [deal, dealId, fallback]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={
          variant === "compact"
            ? {
                height: 36,
                padding: "0 14px",
                borderRadius: 8,
                border: "1px solid rgba(192,132,252,0.35)",
                background: "rgba(192,132,252,0.10)",
                color: "#D7B6FF",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "Inter, sans-serif",
              }
            : {
                marginTop: 12,
                width: "100%",
                height: 44,
                borderRadius: 10,
                border: "1px solid rgba(192,132,252,0.30)",
                background: "rgba(192,132,252,0.08)",
                color: "#E7D6FF",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                fontFamily: "Inter, sans-serif",
              }
        }
      >
        <span style={{ fontSize: 15 }}>📄</span>
        View &amp; Download NDA
      </button>

      {open && <NdaModal nda={nda} onClose={() => setOpen(false)} />}
    </>
  );
}