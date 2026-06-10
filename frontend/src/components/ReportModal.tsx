// ─── FILE: src/components/ReportModal.tsx ────────────────────────────────────
// Usage in Chat.tsx or ProposalDetailModal:
//   <ReportModal
//     open={reportOpen}
//     onClose={() => setReportOpen(false)}
//     dealId={dealId}
//     token={token}
//   />
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { X, ShieldAlert, CheckCircle2 } from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

const REASONS = [
  { value: "SCAM",                  label: "Scam / Fraud",              desc: "They tried to defraud me" },
  { value: "FAKE_WORK",             label: "Fake / Stolen Work",        desc: "Submitted someone else's work" },
  { value: "NO_DELIVERY",           label: "No Delivery",               desc: "Never delivered the project" },
  { value: "INAPPROPRIATE_BEHAVIOR",label: "Inappropriate Behavior",    desc: "Abusive or threatening messages" },
  { value: "PAYMENT_FRAUD",         label: "Payment Fraud",             desc: "Issues with payment handling" },
  { value: "OTHER",                 label: "Other",                     desc: "Something else" },
];

export function ReportModal({
  open,
  onClose,
  dealId,
  token,
}: {
  open: boolean;
  onClose: () => void;
  dealId: string;
  token?: string;
}) {
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError("Please select a reason.");
      return;
    }
    if (!token) {
      setError("Please login again.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/report`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hireDealId: dealId,
          reason: selectedReason,
          description,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to submit");
      setDone(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit report.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setDescription("");
    setDone(false);
    setError("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/65 px-4 backdrop-blur-[10px]"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 520,
          maxWidth: "calc(100vw - 32px)",
          borderRadius: 26,
          background: "#1A1A1A",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.70)",
          padding: "28px 28px 24px",
          boxSizing: "border-box",
          color: "#FFFFFF",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.25)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <ShieldAlert size={20} color="#EF4444" />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2.5px", color: "#EF4444", textTransform: "uppercase" }}>
                Report Issue
              </div>
              <h2 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: "#F9FAFB", lineHeight: "1.2" }}>
                Report this deal
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{ border: "none", background: "transparent", color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {done ? (
          /* ── Success state ── */
          <div style={{ marginTop: 32, textAlign: "center", padding: "12px 0 8px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(25,230,108,0.12)", border: "1.5px solid rgba(25,230,108,0.28)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
              <CheckCircle2 size={30} color="#19E66C" />
            </div>
            <h3 style={{ margin: "18px 0 0", fontSize: 20, fontWeight: 800, color: "#FFFFFF" }}>Report Submitted</h3>
            <p style={{ margin: "10px 0 0", fontSize: 13, lineHeight: "20px", color: "rgba(255,255,255,0.55)" }}>
              Our team will review this report within 24–48 hours. If the claim is valid, appropriate action will be taken and funds may be held or refunded.
            </p>
            <button
              type="button"
              onClick={handleClose}
              style={{ marginTop: 24, width: "100%", height: 46, borderRadius: 8, border: "none", background: GRADIENT, color: "#FFFFFF", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
            >
              Done
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <>
            <p style={{ margin: "14px 0 20px", fontSize: 13, lineHeight: "19px", color: "rgba(255,255,255,0.50)" }}>
              Select a reason and describe the issue. Our team reviews all reports within 24–48 hours.
            </p>

            {/* Reason grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {REASONS.map((r) => {
                const active = selectedReason === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => { setSelectedReason(r.value); setError(""); }}
                    style={{
                      borderRadius: 12,
                      border: active ? "1px solid rgba(239,68,68,0.50)" : "1px solid rgba(255,255,255,0.08)",
                      background: active ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.03)",
                      padding: "11px 14px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: active ? "#FCA5A5" : "#FFFFFF", lineHeight: "1" }}>
                      {r.label}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.40)", lineHeight: "1.3" }}>
                      {r.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Description */}
            <div style={{ marginTop: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", color: "rgba(255,255,255,0.40)", textTransform: "uppercase" }}>
                Additional Details <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened in detail..."
                style={{
                  width: "100%",
                  height: 100,
                  resize: "none",
                  outline: "none",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.25)",
                  padding: "12px 14px",
                  color: "#FFFFFF",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  lineHeight: "19px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {error && (
              <div style={{ marginTop: 10, fontSize: 12, color: "#FCA5A5", fontWeight: 500 }}>
                ⚠ {error}
              </div>
            )}

            {/* Note */}
            <div
              style={{
                marginTop: 14,
                borderRadius: 10,
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.14)",
                padding: "10px 13px",
                fontSize: 11,
                lineHeight: "17px",
                color: "rgba(255,255,255,0.40)",
              }}
            >
              ⚠ False reports may result in your account being penalized. Report only genuine issues.
            </div>

            {/* Buttons */}
            <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={handleClose}
                style={{ flex: 1, height: 46, borderRadius: 8, border: "1px solid rgba(255,255,255,0.10)", background: "#242424", color: "#FFFFFF", cursor: "pointer", fontSize: 14 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !selectedReason}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 8,
                  border: "none",
                  background: loading || !selectedReason ? "rgba(239,68,68,0.35)" : "rgba(239,68,68,0.85)",
                  color: "#FFFFFF",
                  cursor: loading || !selectedReason ? "not-allowed" : "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}