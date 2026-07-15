// src/components/NdaCard.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

/* ---------- helpers ---------- */

function formatDate(value?: string | Date) {
  if (!value) return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
function money(n?: number) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}.00`;
}
function esc(s?: string) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

/* ---------- NDA HTML builder ---------- */

export function buildNdaHtml(nda: NdaData, sigs?: { client?: string; freelancer?: string }): string {
  const title = esc(nda.projectTitle || "Project Engagement");
  const description = esc(nda.description || "Confidential project work as discussed between the parties.");
  const budget = money(nda.budget ?? nda.amount);
  const target = nda.targetDate ? esc(formatDate(nda.targetDate)) : "As mutually agreed";
  const dealId = esc(nda.dealId || "—");
  const client = esc(nda.clientName || "Client (Disclosing Party)");
  const freelancer = esc(nda.freelancerName || "Freelancer (Receiving Party)");
  const today = esc(formatDate(nda.effectiveDate));

  const sigBox = (dataUrl?: string) =>
    dataUrl
      ? `<img src="${dataUrl}" style="height:52px;display:block;margin-bottom:6px;max-width:220px;" alt="signature"/>`
      : `<div style="height:52px;margin-bottom:6px;border-bottom:1px dashed #bbb;"></div>`;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/>
<title>NDA — ${title}</title>
<style>
  @page{size:A4;margin:22mm 18mm}
  *{box-sizing:border-box}
  body{margin:0;font-family:Georgia,"Times New Roman",serif;color:#14121b;background:#f3f2f7;line-height:1.55;font-size:13px}
  .sheet{max-width:820px;margin:24px auto;background:#fff;padding:48px 54px 56px;box-shadow:0 12px 50px rgba(0,0,0,.18)}
  .brand{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #7c3aed;padding-bottom:14px;margin-bottom:26px}
  .brand h1{font-family:Inter,Arial,sans-serif;font-size:22px;letter-spacing:4px;margin:0;color:#7c3aed}
  .brand .tag{font-family:Inter,Arial,sans-serif;font-size:10px;letter-spacing:2px;color:#8b8794;text-transform:uppercase}
  h2.doc-title{font-family:Inter,Arial,sans-serif;text-align:center;font-size:20px;margin:4px 0;letter-spacing:.5px}
  .subtitle{text-align:center;color:#6b6675;font-size:11px;margin-bottom:26px;font-family:Inter,Arial,sans-serif}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;background:#faf9fc;border:1px solid #ece9f3;border-radius:10px;padding:16px 18px;margin-bottom:26px;font-family:Inter,Arial,sans-serif;font-size:12px}
  .meta .k{color:#8b8794;font-size:9px;letter-spacing:1.4px;text-transform:uppercase}
  .meta .v{color:#14121b;font-weight:600;margin-top:2px}
  .full{grid-column:1/-1}
  h3{font-family:Inter,Arial,sans-serif;font-size:13px;margin:22px 0 6px;color:#2a2536}
  p{margin:0 0 10px}ol{margin:0 0 10px;padding-left:20px}ol li{margin-bottom:7px}
  .sig{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:46px}
  .sig .name{font-weight:700;color:#14121b;font-family:Inter,Arial,sans-serif;margin-bottom:6px}
  .sig .line{border-top:1px solid #14121b;padding-top:6px;font-family:Inter,Arial,sans-serif;font-size:11px;color:#6b6675}
  .role{font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:#8b8794;font-family:Inter,Arial,sans-serif}
  .disclaimer{margin-top:34px;padding-top:14px;border-top:1px dashed #d9d5e2;font-size:10px;color:#8b8794;font-family:Inter,Arial,sans-serif}
  @media print{body{background:#fff}.sheet{box-shadow:none;margin:0;max-width:none;padding:0}}
</style></head>
<body><div class="sheet">
  <div class="brand"><h1>TOKUN</h1><span class="tag">Escrow-Protected Engagement</span></div>
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
  <h3>Project / Work Description</h3><p>${description}</p>
  <h3>1. Purpose</h3><p>This Agreement governs the disclosure of confidential information between the Disclosing Party and the Receiving Party in connection with the above-described project, engaged through Tokun's escrow service.</p>
  <h3>2. Confidential Information</h3><p>"Confidential Information" means any non-public information disclosed by the Disclosing Party — project briefs, source files, designs, code, credentials, business plans, customer data, and any material shared inside Tokun chat or file exchange.</p>
  <h3>3. Obligations of the Receiving Party</h3>
  <ol>
    <li>Use the Confidential Information solely to perform the Purpose.</li>
    <li>Not disclose, publish, resell, or share it with any third party without prior written consent.</li>
    <li>Protect it with at least the same care used for its own confidential material.</li>
    <li>Not reuse project-specific deliverables for any other client or public portfolio without consent.</li>
  </ol>
  <h3>4. Exclusions</h3><p>Does not include information that becomes public through no fault of the Receiving Party, was lawfully known before disclosure, or is independently developed without use of the Confidential Information.</p>
  <h3>5. Ownership &amp; Deliverables</h3><p>Upon full release of escrow funds, ownership of the final approved deliverables transfers to the Disclosing Party, unless otherwise agreed in writing.</p>
  <h3>6. Term</h3><p>Confidentiality obligations remain in effect during the engagement and for two (2) years following its completion or termination.</p>
  <h3>7. Return / Destruction</h3><p>Upon request or completion, each party shall return or securely destroy the other party's Confidential Information, except one archival copy for legal record-keeping.</p>
  <h3>8. Governing Law</h3><p>This Agreement is governed by the laws of India. Disputes are subject to the jurisdiction of the courts at the Disclosing Party's place of business.</p>
  <div class="sig">
    <div>
      <div class="name">${client}</div>
      ${sigBox(sigs?.client)}
      <div class="line">Signature / Date <span class="role">&nbsp;•&nbsp; Disclosing Party</span></div>
    </div>
    <div>
      <div class="name">${freelancer}</div>
      ${sigBox(sigs?.freelancer)}
      <div class="line">Signature / Date <span class="role">&nbsp;•&nbsp; Receiving Party</span></div>
    </div>
  </div>
  <div class="disclaimer">This document is generated automatically by Tokun as a convenience template and is not a substitute for professional legal advice. Both parties must sign and upload their copy to complete the NDA process.</div>
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

function NdaModal({ nda, onClose, dealId, token, apiBase }: {
  nda: NdaData; onClose: () => void;
  dealId?: string; token?: string; apiBase?: string;
}) {
  const { user } = useAuth() as any;
  const [tab, setTab] = useState<"preview" | "sign">("preview");
  const [mySig, setMySig] = useState<string>("");                     // my confirmed signature data URL
  const [step, setStep] = useState<1 | 2>(1);                         // 1 = signing, 2 = auto-submitting/submitted
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadError, setUploadError] = useState("");
  const pendingFileRef = useRef<File | null>(null);                   // signed doc, kept around so a failed auto-submit can retry

  // NDA upload status from deal
  const [ndaStatus, setNdaStatus] = useState<{ clientUrl?: string; freelancerUrl?: string } | null>(null);
  const [role, setRole] = useState<"client" | "freelancer" | null>(null);

  const fetchDealStatus = useCallback(() => {
    if (!dealId || !token || !apiBase) return;
    fetch(`${apiBase}/api/hire/${dealId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d?.deal) {
          setNdaStatus({ clientUrl: d.deal.ndaClientUrl, freelancerUrl: d.deal.ndaFreelancerUrl });
          // Determine role
          const clientId = String(d.deal.clientId?._id || d.deal.clientId || "");
          const myId = String(user?._id || user?.id || "");
          setRole(clientId === myId ? "client" : "freelancer");
        }
      })
      .catch(() => {});
  }, [dealId, token, apiBase, user]);

  useEffect(() => { fetchDealStatus(); }, [fetchDealStatus]);

  const sigs = useMemo(() => ({
    client: role === "client" ? mySig || undefined : undefined,
    freelancer: role === "freelancer" ? mySig || undefined : undefined,
  }), [role, mySig]);

  const srcDoc = useMemo(() => buildNdaHtml(nda, sigs), [nda, sigs]);

  const handleUpload = useCallback(async (file: File) => {
    if (!dealId || !token || !apiBase) { setUploadError("Open this NDA from inside a deal chat to enable upload."); return; }
    pendingFileRef.current = file;
    setUploading(true); setUploadError(""); setUploadMsg("");
    const form = new FormData();
    form.append("nda", file);
    try {
      const res = await fetch(`${apiBase}/api/hire/${dealId}/upload-nda`, {
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
      } else {
        setUploadError(data.error || "Submission failed. Try again.");
      }
    } catch { setUploadError("Network error. Try again."); }
    setUploading(false);
  }, [dealId, token, apiBase, fetchDealStatus]);

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
    handleUpload(file);
  }, [role, nda, handleUpload]);

  const retrySubmit = useCallback(() => {
    if (pendingFileRef.current) handleUpload(pendingFileRef.current);
  }, [handleUpload]);

  const myUploaded = role === "client" ? !!ndaStatus?.clientUrl : !!ndaStatus?.freelancerUrl;
  const otherUploaded = role === "client" ? !!ndaStatus?.freelancerUrl : !!ndaStatus?.clientUrl;
  const bothSigned = !!(ndaStatus?.clientUrl && ndaStatus?.freelancerUrl);

  const roleLabel = role === "client" ? "Client (Disclosing Party)" : "Freelancer (Receiving Party)";
  const otherLabel = role === "client" ? "Freelancer" : "Client";

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
            {role && !bothSigned && <span style={{ fontSize: 11, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", padding: "3px 12px", borderRadius: 20 }}>You: {role}</span>}
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

export default function NdaButton({ dealId, token, apiBase, fallback, variant = "full" }: {
  dealId?: string; token?: string; apiBase?: string;
  fallback?: Partial<NdaData> & { title?: string };
  variant?: "full" | "compact";
}) {
  const [open, setOpen] = useState(false);
  const [deal, setDeal] = useState<any>(null);

  useEffect(() => {
    if (!dealId || !token || !apiBase) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/hire/${dealId}`, { headers: { Authorization: `Bearer ${token}` } });
        const d = await res.json().catch(() => ({}));
        if (alive && d?.success && d?.deal) setDeal(d.deal);
      } catch { /**/ }
    })();
    return () => { alive = false; };
  }, [dealId, token, apiBase]);

  const nda: NdaData = useMemo(() => ({
    dealId: dealId || fallback?.dealId,
    projectTitle: deal?.title || fallback?.projectTitle || fallback?.title,
    description: deal?.description || fallback?.description,
    budget: deal?.amount ?? fallback?.budget ?? fallback?.amount,
    amount: deal?.amount ?? fallback?.amount,
    targetDate: deal?.deliveryDate || fallback?.targetDate,
    clientName: deal?.clientId?.name || fallback?.clientName,
    freelancerName: deal?.freelancerId?.name || fallback?.freelancerName,
    effectiveDate: deal?.acceptedAt || fallback?.effectiveDate,
  }), [deal, dealId, fallback]);

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
        <NdaModal nda={nda} onClose={() => setOpen(false)} dealId={dealId} token={token} apiBase={apiBase} />
      )}
    </>
  );
}
