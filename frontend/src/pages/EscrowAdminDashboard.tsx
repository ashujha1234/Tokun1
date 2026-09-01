import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const API_BASE = `${(import.meta.env.VITE_API_URL || "http://localhost:5002").replace(
  /\/$/,
  ""
)}/api/admin/escrow`;

const REPORT_API = `${(import.meta.env.VITE_API_URL || "http://localhost:5002").replace(
  /\/$/,
  ""
)}/api/report`;

// ─── HEADERS ───────────────────────────────────────────────────────────────
function getAuthHeaders() {
  const token = localStorage.getItem("tokun_admin_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── HELPERS ───────────────────────────────────────────────────────────────
const fmt = (n: any) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const shortId = (id: any) => String(id || "").slice(-6).toUpperCase();

const STATUS_CONFIG: any = {
  WORK_SUBMITTED: { label: "Work Submitted", color: "#7C3AED", bg: "#EDE9FE" },
  IN_PROGRESS: { label: "In Progress", color: "#1D4ED8", bg: "#DBEAFE" },
  COMPLETED: { label: "Completed", color: "#065F46", bg: "#D1FAE5" },
  REFUNDED: { label: "Refunded", color: "#991B1B", bg: "#FEE2E2" },
  DISPUTED: { label: "Disputed", color: "#92400E", bg: "#FEF3C7" },
};

const FUNDS_CONFIG: any = {
  HELD_BY_TOKUN: {
    label: "In Escrow",
    color: "#92400E",
    bg: "#FEF3C7",
    dot: "#F59E0B",
  },
  RELEASED_TO_FREELANCER: {
    label: "Released",
    color: "#065F46",
    bg: "#D1FAE5",
    dot: "#10B981",
  },
  REFUNDED_TO_CLIENT: {
    label: "Refunded",
    color: "#991B1B",
    bg: "#FEE2E2",
    dot: "#EF4444",
  },
};

const REPORT_REASON_LABELS: any = {
  SCAM: "Scam",
  FAKE_WORK: "Fake Work",
  NO_DELIVERY: "No Delivery",
  INAPPROPRIATE_BEHAVIOR: "Inappropriate Behavior",
  PAYMENT_FRAUD: "Payment Fraud",
  OTHER: "Other",
};

const REPORT_STATUS_CONFIG: any = {
  PENDING: { label: "Pending", color: "#92400E", bg: "#FEF3C7", dot: "#F59E0B" },
  UNDER_REVIEW: { label: "Under Review", color: "#1D4ED8", bg: "#DBEAFE", dot: "#3B82F6" },
  RESOLVED: { label: "Resolved", color: "#065F46", bg: "#D1FAE5", dot: "#10B981" },
  DISMISSED: { label: "Dismissed", color: "#6B7280", bg: "#1F2937", dot: "#9CA3AF" },
};

// ─── BADGE ─────────────────────────────────────────────────────────────────
function Badge({ config }: any) {
  if (!config) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.02em",
        background: config.bg,
        color: config.color,
      }}
    >
      {config.dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: config.dot,
            flexShrink: 0,
          }}
        />
      )}
      {config.label}
    </span>
  );
}

// ─── AVATAR ────────────────────────────────────────────────────────────────
function Avatar({ name = "", size = 32 }: any) {
  const initials = String(name)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const colors = [
    ["#EDE9FE", "#5B21B6"],
    ["#DBEAFE", "#1D4ED8"],
    ["#D1FAE5", "#065F46"],
    ["#FEF3C7", "#92400E"],
    ["#FCE7F3", "#9D174D"],
    ["#E0F2FE", "#0369A1"],
  ];

  const [bg, fg] = colors[(String(name).charCodeAt(0) || 0) % colors.length];

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
}

// ─── STAT CARD ─────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent }: any) {
  return (
    <div
      style={{
        background: "#1F2937",
        border: "1px solid #374151",
        borderRadius: 12,
        padding: "18px 20px",
        borderTop: `3px solid ${accent || "#6366F1"}`,
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#F9FAFB" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ─── TOAST ─────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: any) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 9999,
        background:
          type === "success" ? "#065F46" : type === "error" ? "#991B1B" : "#1E293B",
        color: "#fff",
        borderRadius: 10,
        padding: "12px 20px",
        fontSize: 14,
        fontWeight: 500,
        boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        animation: "slideIn 0.25s ease",
        maxWidth: 360,
      }}
    >
      <span style={{ fontSize: 18 }}>
        {type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}
      </span>
      {message}
    </div>
  );
}

// ─── MODAL SHELL ───────────────────────────────────────────────────────────
function ModalShell({ children, onClose }: any) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1F2937",
          border: "1px solid #374151",
          borderRadius: 16,
          padding: 28,
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          animation: "popIn 0.2s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── BUTTON STYLES ─────────────────────────────────────────────────────────
const primaryBtnStyle: any = {
  padding: "10px 18px",
  borderRadius: 8,
  border: "none",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  transition: "opacity 0.15s",
};

const cancelBtnStyle: any = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "1px solid #374151",
  background: "transparent",
  color: "#D1D5DB",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
};

// ─── RELEASE MODAL ─────────────────────────────────────────────────────────
function ReleaseModal({ deal, onConfirm, onClose, loading }: any) {
  const noBankDetails = !deal?.freelancerId?.razorpayFundAccountId;

  return (
    <ModalShell onClose={onClose}>
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            width: 48, height: 48, borderRadius: 12, background: "#064E3B",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, marginBottom: 16,
          }}
        >💸</div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: "#F9FAFB", margin: "0 0 6px" }}>
          Release Payment
        </h3>
        <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>
          Funds will be transferred to the freelancer via Razorpay IMPS immediately.
        </p>
      </div>

      <div
        style={{
          background: "#111827", borderRadius: 10, padding: 16,
          border: "1px solid #374151", marginBottom: 16,
        }}
      >
        {[
          ["Deal", deal?.title],
          ["Creator", deal?.freelancerId?.name],
          ["Total held", fmt(deal?.amount || 0)],
          ["Creator receives", fmt(deal?.freelancerAmount || 0)],
          ["Platform fee", fmt((deal?.amount || 0) - (deal?.freelancerAmount || 0))],
        ].map(([k, v], i) => (
          <div
            key={i}
            style={{
              display: "flex", justifyContent: "space-between", fontSize: 13,
              padding: "6px 0", borderBottom: i < 4 ? "1px solid #374151" : "none", gap: 12,
            }}
          >
            <span style={{ color: "#9CA3AF" }}>{k}</span>
            <span style={{ fontWeight: i === 3 ? 700 : 500, color: i === 3 ? "#10B981" : "#F9FAFB", textAlign: "right" }}>
              {v}
            </span>
          </div>
        ))}
      </div>

      {noBankDetails && (
        <div
          style={{
            background: "#451A03", border: "1px solid #92400E", borderRadius: 8,
            padding: "10px 14px", fontSize: 13, color: "#FCD34D", marginBottom: 16,
            display: "flex", gap: 8, alignItems: "flex-start",
          }}
        >
          <span>⚠️</span>
          <span>Creator has no bank account linked. Release will fail on Razorpay.</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={cancelBtnStyle}>Cancel</button>
        <button
          onClick={() => onConfirm(deal._id)}
          disabled={loading || noBankDetails}
          style={{
            ...primaryBtnStyle,
            background: noBankDetails ? "#374151" : "#059669",
            color: noBankDetails ? "#6B7280" : "#fff",
            cursor: noBankDetails ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Processing..." : `Confirm Release ${fmt(deal?.freelancerAmount || 0)}`}
        </button>
      </div>
    </ModalShell>
  );
}

// ─── REFUND MODAL ──────────────────────────────────────────────────────────
function RefundModal({ deal, onConfirm, onClose, loading }: any) {
  const [reason, setReason] = useState("");

  return (
    <ModalShell onClose={onClose}>
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            width: 48, height: 48, borderRadius: 12, background: "#450A0A",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, marginBottom: 16,
          }}
        >↩️</div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: "#F9FAFB", margin: "0 0 6px" }}>
          Refund to Client
        </h3>
        <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>
          Full amount will be refunded to the client via Razorpay.
        </p>
      </div>

      <div
        style={{
          background: "#111827", borderRadius: 10, padding: 16,
          border: "1px solid #374151", marginBottom: 16,
        }}
      >
        {[
          ["Deal", deal?.title],
          ["Client", deal?.clientId?.name],
          ["Refund amount", fmt(deal?.amount || 0)],
        ].map(([k, v], i) => (
          <div
            key={i}
            style={{
              display: "flex", justifyContent: "space-between", fontSize: 13,
              padding: "6px 0", borderBottom: i < 2 ? "1px solid #374151" : "none", gap: 12,
            }}
          >
            <span style={{ color: "#9CA3AF" }}>{k}</span>
            <span style={{ fontWeight: i === 2 ? 700 : 500, color: i === 2 ? "#EF4444" : "#F9FAFB", textAlign: "right" }}>
              {v}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label
          style={{ fontSize: 13, fontWeight: 500, color: "#D1D5DB", display: "block", marginBottom: 6 }}
        >
          Reason{" "}
          <span style={{ color: "#6B7280", fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Dispute resolved in client's favour"
          style={{
            width: "100%", padding: "10px 14px", fontSize: 14,
            border: "1px solid #374151", borderRadius: 8, outline: "none",
            boxSizing: "border-box", fontFamily: "inherit",
            color: "#F9FAFB", background: "#111827",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={cancelBtnStyle}>Cancel</button>
        <button
          onClick={() => onConfirm(deal._id, reason)}
          disabled={loading}
          style={{ ...primaryBtnStyle, background: "#DC2626", color: "#fff", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Processing..." : `Confirm Refund ${fmt(deal?.amount || 0)}`}
        </button>
      </div>
    </ModalShell>
  );
}

// ─── REPORT DETAIL MODAL ───────────────────────────────────────────────────
function ReportDetailModal({ report, onClose, onStatusUpdate, loading }: any) {
  const [adminNote, setAdminNote] = useState(report?.adminNote || "");
  const [selectedStatus, setSelectedStatus] = useState(report?.status || "PENDING");

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1F2937", border: "1px solid #374151", borderRadius: 16,
          padding: 28, width: "100%", maxWidth: 520,
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)", animation: "popIn 0.2s ease",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: 10, background: "#451A03",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}
          >🚨</div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#F9FAFB" }}>
              Report Detail
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>
              #{shortId(report?._id)}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto", background: "transparent", border: "none",
              color: "#6B7280", cursor: "pointer", fontSize: 18, lineHeight: 1,
            }}
          >✕</button>
        </div>

        {/* Deal Info */}
        <div
          style={{
            background: "#111827", borderRadius: 10, padding: 14,
            border: "1px solid #374151", marginBottom: 16,
          }}
        >
          <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Deal Info
          </p>
          {[
            ["Deal Title", report?.hireDealId?.title || "—"],
            ["Amount", fmt(report?.hireDealId?.amount || 0)],
            ["Deal Status", report?.hireDealId?.status || "—"],
          ].map(([k, v], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", borderBottom: i < 2 ? "1px solid #1F2937" : "none", gap: 12 }}>
              <span style={{ color: "#9CA3AF" }}>{k}</span>
              <span style={{ color: "#F9FAFB", fontWeight: 500, textAlign: "right" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* People Info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Reported By", user: report?.reportedBy, icon: "👤" },
            { label: "Reported User", user: report?.reportedUser, icon: "🎯" },
          ].map(({ label, user, icon }) => (
            <div
              key={label}
              style={{ background: "#111827", border: "1px solid #374151", borderRadius: 10, padding: 12 }}
            >
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {label}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar name={user?.name || ""} size={28} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#F9FAFB", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user?.name || "Unknown"}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user?.email || "—"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reason & Description */}
        <div
          style={{
            background: "#111827", borderRadius: 10, padding: 14,
            border: "1px solid #374151", marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Reason
            </p>
            <span
              style={{
                padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                background: "#451A03", color: "#FCD34D",
              }}
            >
              {REPORT_REASON_LABELS[report?.reason] || report?.reason}
            </span>
          </div>
          {report?.description && (
            <p style={{ margin: 0, fontSize: 13, color: "#D1D5DB", lineHeight: "20px" }}>
              {report.description}
            </p>
          )}
          {!report?.description && (
            <p style={{ margin: 0, fontSize: 13, color: "#4B5563", fontStyle: "italic" }}>
              No description provided.
            </p>
          )}
        </div>

        {/* Admin Action */}
        <div
          style={{
            background: "#111827", borderRadius: 10, padding: 14,
            border: "1px solid #374151", marginBottom: 16,
          }}
        >
          <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Admin Action
          </p>

          <label style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", display: "block", marginBottom: 6 }}>
            Update Status
          </label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {["PENDING", "UNDER_REVIEW", "RESOLVED", "DISMISSED"].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                style={{
                  padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: selectedStatus === s ? "1px solid #6366F1" : "1px solid #374151",
                  background: selectedStatus === s ? "rgba(99,102,241,0.15)" : "transparent",
                  color: selectedStatus === s ? "#818CF8" : "#9CA3AF",
                  transition: "all 0.15s",
                }}
              >
                {REPORT_STATUS_CONFIG[s]?.label || s}
              </button>
            ))}
          </div>

          <label style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", display: "block", marginBottom: 6 }}>
            Admin Note{" "}
            <span style={{ color: "#4B5563", fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Add internal notes about this report..."
            rows={3}
            style={{
              width: "100%", padding: "10px 14px", fontSize: 13,
              border: "1px solid #374151", borderRadius: 8, outline: "none",
              boxSizing: "border-box", fontFamily: "inherit",
              color: "#F9FAFB", background: "#0D1117",
              resize: "vertical", lineHeight: "20px",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          <button
            onClick={() => onStatusUpdate(report._id, selectedStatus, adminNote)}
            disabled={loading}
            style={{
              ...primaryBtnStyle,
              background: "#6366F1", color: "#fff",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── REPORTS PANEL ─────────────────────────────────────────────────────────
function ReportsPanel({ showToast }: { showToast: (msg: string, type?: string) => void }) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      /* /admin/all is now admin-gated. It never sent a header because the route
         was open; handleStatusUpdate below already used getAuthHeaders(). */
      const res = await fetch(`${REPORT_API}/admin/all`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to fetch reports");
      setReports(data.reports || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleStatusUpdate = async (reportId: string, status: string, adminNote: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${REPORT_API}/${reportId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, adminNote }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(data?.error || "Update failed");
      showToast("Report status updated!", "success");
      setSelectedReport(null);
      fetchReports();
    } catch (err: any) {
      showToast(err?.message || "Update failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = statusFilter
    ? reports.filter((r) => r.status === statusFilter)
    : reports;

  const pendingCount = reports.filter((r) => r.status === "PENDING").length;
  const underReviewCount = reports.filter((r) => r.status === "UNDER_REVIEW").length;

  return (
    <div>
      {/* Summary strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          { label: "Total Reports", value: reports.length, color: "#6366F1" },
          { label: "Pending", value: pendingCount, color: "#F59E0B" },
          { label: "Under Review", value: underReviewCount, color: "#3B82F6" },
          { label: "Resolved", value: reports.filter((r) => r.status === "RESOLVED").length, color: "#10B981" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: "#1F2937", border: "1px solid #374151",
              borderRadius: 10, padding: "14px 16px",
              borderLeft: `3px solid ${color}`,
            }}
          >
            <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>{label}</p>
            <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 700, color: "#F9FAFB" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div
        style={{
          background: "#111827", borderRadius: 16, border: "1px solid #1F2937", overflow: "hidden",
        }}
      >
        {/* Filter bar */}
        <div
          style={{
            padding: "14px 20px", borderBottom: "1px solid #1F2937",
            display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
          }}
        >
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#F9FAFB", flex: 1 }}>
            All Reports
          </p>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "8px 12px", border: "1px solid #374151", borderRadius: 8,
              fontSize: 13, fontFamily: "inherit", color: "#F9FAFB",
              background: "#1F2937", cursor: "pointer",
            }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
          <button
            onClick={fetchReports}
            style={{
              padding: "8px 14px", border: "1px solid #374151", borderRadius: 8,
              background: "#1F2937", cursor: "pointer", fontSize: 13,
              color: "#D1D5DB", fontFamily: "inherit",
            }}
          >
            ↺ Refresh
          </button>
        </div>

        {/* Table body */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B7280", fontSize: 14 }}>
            Loading reports...
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#EF4444", fontSize: 14 }}>
            ⚠️ {error}
            <br />
            <button onClick={fetchReports} style={{ marginTop: 12, ...cancelBtnStyle }}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B7280", fontSize: 14 }}>
            {statusFilter ? "No reports with this status." : "No reports yet. 🎉"}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 800 }}>
              <thead>
                <tr style={{ background: "#0D1117" }}>
                  {["Report ID", "Deal", "Reported By", "Reported User", "Reason", "Status", "Date", "Action"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "11px 16px", textAlign: "left", fontSize: 11,
                        fontWeight: 600, color: "#6B7280", textTransform: "uppercase",
                        letterSpacing: "0.06em", borderBottom: "1px solid #1F2937",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((report: any) => (
                  <tr key={report._id} style={{ borderBottom: "1px solid #1F2937" }}>
                    {/* Report ID */}
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          fontFamily: "monospace", fontSize: 12, color: "#9CA3AF",
                          background: "#1F2937", padding: "3px 7px", borderRadius: 6,
                        }}
                      >
                        #{shortId(report._id)}
                      </span>
                    </td>

                    {/* Deal */}
                    <td style={{ padding: "14px 16px", maxWidth: 160 }}>
                      <div
                        style={{
                          fontWeight: 600, color: "#F9FAFB",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}
                      >
                        {report.hireDealId?.title || "—"}
                      </div>
                      <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                        {fmt(report.hireDealId?.amount || 0)}
                      </div>
                    </td>

                    {/* Reported By */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar name={report.reportedBy?.name || ""} size={28} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 500, color: "#F9FAFB", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 110 }}>
                            {report.reportedBy?.name || "Unknown"}
                          </div>
                          <div style={{ fontSize: 11, color: "#6B7280" }}>
                            {report.reportedBy?.email || "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Reported User */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar name={report.reportedUser?.name || ""} size={28} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 500, color: "#F9FAFB", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 110 }}>
                            {report.reportedUser?.name || "Unknown"}
                          </div>
                          <div style={{ fontSize: 11, color: "#6B7280" }}>
                            {report.reportedUser?.email || "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Reason */}
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                          background: "#451A03", color: "#FCD34D",
                        }}
                      >
                        {REPORT_REASON_LABELS[report.reason] || report.reason}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "14px 16px" }}>
                      <Badge config={REPORT_STATUS_CONFIG[report.status]} />
                    </td>

                    {/* Date */}
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap", color: "#9CA3AF", fontSize: 12 }}>
                      {report.createdAt
                        ? new Date(report.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Action */}
                    <td style={{ padding: "14px 16px" }}>
                      <button
                        onClick={() => setSelectedReport(report)}
                        style={{
                          padding: "6px 14px", borderRadius: 7,
                          border: "1px solid #4F46E5",
                          color: "#818CF8", background: "rgba(99,102,241,0.1)",
                          fontSize: 12, fontWeight: 600, cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Review →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onStatusUpdate={handleStatusUpdate}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function EscrowAdminDashboard() {
  const [deals, setDeals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [toast, setToast] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fundsFilter, setFundsFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState<any>(null);

  // ── NEW: tab state ──
  const [activeTab, setActiveTab] = useState<"escrow" | "reports">("escrow");

  // ─── FETCH DEALS ───────────────────────────────────────────────────────
  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (statusFilter) params.set("status", statusFilter);
      if (fundsFilter) params.set("fundsStatus", fundsFilter);
      if (search) params.set("search", search);

      const res = await fetch(`${API_BASE}/deals?${params}`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      let data: any = null;
      try { data = await res.json(); } catch { data = null; }

      if (!res.ok) throw new Error(data?.error || data?.message || `Server error: ${res.status}`);
      if (!data?.success) throw new Error(data?.error || "Unknown error");

      setDeals(data.deals || []);
      setStats(data.stats || {});
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch deals");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, fundsFilter, search]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const showToast = (message: string, type = "success") => setToast({ message, type });

  // ─── RELEASE ───────────────────────────────────────────────────────────
  // `orderKind` tells the server which collection the id belongs to — the list
  // carries hire deals and service bookings now, and a service booking settles
  // through a different code path.
  const handleRelease = async (dealId: string, orderKind?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${dealId}/release`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({ orderKind: orderKind || "hire" }),
      });
      let data: any = null;
      try { data = await res.json(); } catch { data = null; }
      if (!res.ok || !data?.success) throw new Error(data?.error || data?.message || "Release failed");
      showToast("Payment released successfully!", "success");
      setModal(null);
      fetchDeals();
      localStorage.setItem("tokun:lastRelease", Date.now().toString());
    } catch (err: any) {
      showToast(err?.message || "Release failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── REFUND ────────────────────────────────────────────────────────────
  const handleRefund = async (dealId: string, reason: string, orderKind?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${dealId}/refund`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason, orderKind: orderKind || "hire" }),
      });
      let data: any = null;
      try { data = await res.json(); } catch { data = null; }
      if (!res.ok || !data?.success) throw new Error(data?.error || data?.message || "Refund failed");
      showToast("Refund processed successfully!", "success");
      setModal(null);
      fetchDeals();
    } catch (err: any) {
      showToast(err?.message || "Refund failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── RENDER ────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#07080B",
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
        color: "#F9FAFB",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes slideIn {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes popIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus {
          outline: 2px solid #6366F1 !important;
          outline-offset: 1px;
        }
        button:hover { opacity: 0.88; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #111827; }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 99px; }
      `}</style>

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 24px" }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#F9FAFB", margin: "0 0 4px" }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
            Manage held funds, release payments, process refunds, and review user reports
          </p>
        </div>

        {/* ── STAT CARDS (only on escrow tab) ── */}
        {activeTab === "escrow" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 28,
            }}
          >
            <StatCard icon="💰" label="Total Volume" value={fmt(stats.totalVolume || 0)} sub="All deals" accent="#6366F1" />
            <StatCard icon="🔒" label="Held in Escrow" value={fmt(stats.heldFunds || 0)} sub="Awaiting release" accent="#F59E0B" />
            <StatCard icon="✅" label="Released" value={fmt(stats.releasedFunds || 0)} sub="To creators" accent="#10B981" />
            <StatCard icon="⏳" label="Pending Review" value={stats.pendingReview || 0} sub="Work submitted" accent="#EF4444" />
          </div>
        )}

        {/* ── TABS ── */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 20,
            background: "#111827",
            borderRadius: 10,
            padding: 4,
            width: "fit-content",
            border: "1px solid #1F2937",
          }}
        >
          {[
            { id: "escrow", label: "💰 Escrow Deals" },
            { id: "reports", label: "🚨 Reports" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                background: activeTab === id ? "#1F2937" : "transparent",
                color: activeTab === id ? "#F9FAFB" : "#6B7280",
                boxShadow: activeTab === id ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── REPORTS TAB ── */}
        {activeTab === "reports" && <ReportsPanel showToast={showToast} />}

        {/* ── ESCROW TAB ── */}
        {activeTab === "escrow" && (
          <div
            style={{
              background: "#111827",
              borderRadius: 16,
              border: "1px solid #1F2937",
              overflow: "hidden",
            }}
          >
            {/* ── FILTERS ── */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #1F2937",
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                <span
                  style={{
                    position: "absolute", left: 12, top: "50%",
                    transform: "translateY(-50%)", color: "#6B7280", fontSize: 15,
                  }}
                >🔍</span>
                <input
                  type="text"
                  placeholder="Search deals, clients, creators..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  style={{
                    width: "100%", padding: "9px 12px 9px 36px",
                    border: "1px solid #374151", borderRadius: 8,
                    fontSize: 14, fontFamily: "inherit",
                    color: "#F9FAFB", background: "#1F2937",
                  }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                style={{
                  padding: "9px 12px", border: "1px solid #374151", borderRadius: 8,
                  fontSize: 14, fontFamily: "inherit", color: "#F9FAFB",
                  background: "#1F2937", cursor: "pointer",
                }}
              >
                <option value="">All Statuses</option>
                <option value="WORK_SUBMITTED">Work Submitted</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="REFUNDED">Refunded</option>
                <option value="DISPUTED">Disputed</option>
              </select>

              <select
                value={fundsFilter}
                onChange={(e) => { setFundsFilter(e.target.value); setPage(1); }}
                style={{
                  padding: "9px 12px", border: "1px solid #374151", borderRadius: 8,
                  fontSize: 14, fontFamily: "inherit", color: "#F9FAFB",
                  background: "#1F2937", cursor: "pointer",
                }}
              >
                <option value="">All Funds Status</option>
                <option value="HELD_BY_TOKUN">Held in Escrow</option>
                <option value="RELEASED_TO_FREELANCER">Released</option>
                <option value="REFUNDED_TO_CLIENT">Refunded</option>
              </select>

              <button
                onClick={fetchDeals}
                style={{
                  padding: "9px 16px", border: "1px solid #374151", borderRadius: 8,
                  background: "#1F2937", cursor: "pointer", fontSize: 14,
                  color: "#D1D5DB", fontFamily: "inherit",
                }}
              >
                ↺ Refresh
              </button>
            </div>

            {/* ── TABLE BODY ── */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B7280", fontSize: 14 }}>
                Loading deals...
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#EF4444", fontSize: 14 }}>
                ⚠️ {error}
                <br />
                <button onClick={fetchDeals} style={{ marginTop: 12, ...cancelBtnStyle }}>Retry</button>
              </div>
            ) : deals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B7280", fontSize: 14 }}>
                No deals found matching your filters.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 900 }}>
                  <thead>
                    <tr style={{ background: "#0D1117" }}>
                      {["Deal ID", "Title", "Client", "Creator", "Amount", "Deal Status", "Funds", "Actions"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "11px 16px", textAlign: "left", fontSize: 11,
                            fontWeight: 600, color: "#6B7280", textTransform: "uppercase",
                            letterSpacing: "0.06em", borderBottom: "1px solid #1F2937",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {deals.map((deal: any) => {
                      const canRelease = deal.fundsStatus === "HELD_BY_TOKUN";
                      const canRefund = deal.fundsStatus === "HELD_BY_TOKUN";

                      return (
                        <tr key={deal._id} style={{ borderBottom: "1px solid #1F2937" }}>
                          {/* Deal ID */}
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                fontFamily: "monospace", fontSize: 12, color: "#9CA3AF",
                                background: "#1F2937", padding: "3px 7px", borderRadius: 6,
                              }}
                            >
                              #{shortId(deal._id)}
                            </span>
                          </td>

                          {/* Title */}
                          <td style={{ padding: "14px 16px", maxWidth: 180 }}>
                            <div
                              style={{
                                fontWeight: 600, color: "#F9FAFB",
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                              }}
                            >
                              {deal.title || "Untitled Deal"}
                            </div>
                            <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                              {deal.createdAt
                                ? new Date(deal.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric", month: "short", year: "numeric",
                                  })
                                : "—"}
                            </div>
                          </td>

                          {/* Client */}
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Avatar name={deal.clientId?.name || ""} size={30} />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 500, color: "#F9FAFB", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>
                                  {deal.clientId?.name || "Unknown"}
                                </div>
                                <div style={{ fontSize: 11, color: "#6B7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>
                                  {deal.clientId?.email || "—"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Freelancer */}
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Avatar name={deal.freelancerId?.name || ""} size={30} />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 500, color: "#F9FAFB", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>
                                  {deal.freelancerId?.name || "Unknown"}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                                  <span style={{ fontSize: 10 }}>
                                    {deal.freelancerId?.razorpayFundAccountId ? "✅" : "⚠️"}
                                  </span>
                                  <span style={{ fontSize: 11, color: deal.freelancerId?.razorpayFundAccountId ? "#10B981" : "#F59E0B" }}>
                                    {deal.freelancerId?.razorpayFundAccountId ? "Bank linked" : "No bank"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Amount */}
                          <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                            <div style={{ fontWeight: 700, color: "#F9FAFB", fontSize: 14 }}>
                              {fmt(deal.amount)}
                            </div>
                            <div style={{ fontSize: 11, color: "#10B981", marginTop: 2 }}>
                              → {fmt(deal.freelancerAmount)}
                            </div>
                          </td>

                          {/* Deal Status */}
                          <td style={{ padding: "14px 16px" }}>
                            <Badge config={STATUS_CONFIG[deal.status]} />
                          </td>

                          {/* Funds Status */}
                          <td style={{ padding: "14px 16px" }}>
                            <Badge config={FUNDS_CONFIG[deal.fundsStatus]} />
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", gap: 8 }}>
                              {canRelease && (
                                <button
                                  onClick={() => setModal({ type: "release", deal })}
                                  style={{
                                    padding: "6px 12px", borderRadius: 7,
                                    border: "1px solid #059669", color: "#10B981",
                                    background: "rgba(16,185,129,0.1)", fontSize: 12,
                                    fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                                    display: "flex", alignItems: "center", gap: 5,
                                  }}
                                >
                                  💸 Release
                                </button>
                              )}
                              {canRefund && (
                                <button
                                  onClick={() => setModal({ type: "refund", deal })}
                                  style={{
                                    padding: "6px 12px", borderRadius: 7,
                                    border: "1px solid #DC2626", color: "#EF4444",
                                    background: "rgba(220,38,38,0.1)", fontSize: 12,
                                    fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                                    display: "flex", alignItems: "center", gap: 5,
                                  }}
                                >
                                  ↩ Refund
                                </button>
                              )}
                              {!canRelease && !canRefund && (
                                <span style={{ fontSize: 12, color: "#374151" }}>—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── PAGINATION ── */}
            {!loading && totalPages > 1 && (
              <div
                style={{
                  padding: "14px 20px", borderTop: "1px solid #1F2937",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 13, color: "#6B7280" }}>
                  Page {page} of {totalPages}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ ...cancelBtnStyle, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ ...cancelBtnStyle, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {modal?.type === "release" && (
        <ReleaseModal
          deal={modal.deal}
          onConfirm={(id: string) => handleRelease(id, modal.deal?.orderKind)}
          onClose={() => setModal(null)}
          loading={actionLoading}
        />
      )}
      {modal?.type === "refund" && (
        <RefundModal
          deal={modal.deal}
          onConfirm={(id: string, reason: string) =>
            handleRefund(id, reason, modal.deal?.orderKind)
          }
          onClose={() => setModal(null)}
          loading={actionLoading}
        />
      )}

      {/* ── TOAST ── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}