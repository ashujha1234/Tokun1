import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const API_BASE = `${(import.meta.env.VITE_API_URL || "http://localhost:5002").replace(
  /\/$/,
  ""
)}/api/admin/prompt-validation`;

// ─── HEADERS ───────────────────────────────────────────────────────────────
function getAuthHeaders() {
  const token = localStorage.getItem("tokun_admin_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── HELPERS ───────────────────────────────────────────────────────────────
const shortId = (id: any) => String(id || "").slice(-6).toUpperCase();

const STATUS_CONFIG: any = {
  pending: { label: "Pending", color: "#9CA3AF", bg: "#1F2937", dot: "#6B7280" },
  approved: { label: "Approved (auto)", color: "#065F46", bg: "#D1FAE5", dot: "#10B981" },
  pending_review: { label: "Pending Review", color: "#1D4ED8", bg: "#DBEAFE", dot: "#3B82F6" },
  flagged: { label: "Flagged", color: "#92400E", bg: "#FEF3C7", dot: "#F59E0B" },
  admin_approved: { label: "Admin Approved", color: "#065F46", bg: "#D1FAE5", dot: "#10B981" },
  admin_rejected: { label: "Admin Rejected", color: "#991B1B", bg: "#FEE2E2", dot: "#EF4444" },
  edit_requested: { label: "Edit Requested", color: "#5B21B6", bg: "#EDE9FE", dot: "#7C3AED" },
};

function Badge({ config }: any) {
  if (!config) return null;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600,
        letterSpacing: "0.02em", background: config.bg, color: config.color,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: config.dot, flexShrink: 0 }} />
      {config.label}
    </span>
  );
}

function Avatar({ name = "", size = 32 }: any) {
  const initials = String(name).split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "#374151", color: "#D1D5DB",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.4, fontWeight: 700, flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
}

function ScoreDial({ score }: { score: number | null }) {
  if (score === null || score === undefined) {
    return <span style={{ color: "#4B5563", fontSize: 12 }}>—</span>;
  }
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#3B82F6" : "#EF4444";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
      <span style={{ fontWeight: 700, color: "#F9FAFB", fontSize: 13 }}>{score}</span>
      <span style={{ color: "#6B7280", fontSize: 11 }}>/100</span>
    </span>
  );
}

function StatCard({ icon, label, value, accent }: any) {
  return (
    <div
      style={{
        background: "#111827", border: "1px solid #1F2937", borderRadius: 12,
        padding: "16px 18px", display: "flex", alignItems: "center", gap: 12,
      }}
    >
      <div
        style={{
          width: 40, height: 40, borderRadius: 10, background: `${accent}22`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#F9FAFB", lineHeight: 1.1 }}>{value}</p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CA3AF" }}>{label}</p>
      </div>
    </div>
  );
}

const cancelBtnStyle: any = {
  padding: "9px 18px", borderRadius: 8, border: "1px solid #374151",
  background: "transparent", color: "#D1D5DB", fontSize: 13, fontWeight: 600,
  cursor: "pointer", fontFamily: "inherit",
};

const primaryBtnStyle = (bg: string): any => ({
  padding: "9px 18px", borderRadius: 8, border: "none",
  background: bg, color: "#0B0F19", fontSize: 13, fontWeight: 700,
  cursor: "pointer", fontFamily: "inherit",
});

// ─── DETAIL / ACTION MODAL ─────────────────────────────────────────────────
function PromptDetailModal({ prompt, onClose, onAction, actionLoading }: any) {
  const [note, setNote] = useState("");
  const mv = prompt?.mediaValidation || {};
  const att = prompt?.attachment;

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
          padding: 28, width: "100%", maxWidth: 640,
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: 10, background: "#1E293B",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}
          >
            🎬
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#F9FAFB", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {prompt?.title}
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>#{shortId(prompt?._id)}</p>
          </div>
          <button
            onClick={onClose}
            style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#6B7280", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Seller */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Avatar name={prompt?.userId?.name || ""} size={28} />
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#F9FAFB" }}>{prompt?.userId?.name || "Unknown"}</p>
            <p style={{ margin: 0, fontSize: 11, color: "#6B7280" }}>{prompt?.userId?.email || "—"}</p>
          </div>
          <span style={{ marginLeft: "auto" }}>
            <Badge config={STATUS_CONFIG[mv.status]} />
          </span>
        </div>

        {/* Attachment preview */}
        <div
          style={{
            background: "#0D1117", border: "1px solid #374151", borderRadius: 10,
            padding: 10, marginBottom: 16, display: "flex", justifyContent: "center",
          }}
        >
          {att?.type === "video" ? (
            <video src={att?.path} controls style={{ maxWidth: "100%", maxHeight: 260, borderRadius: 8 }} />
          ) : (
            <img src={att?.path} alt="attachment" style={{ maxWidth: "100%", maxHeight: 260, borderRadius: 8, objectFit: "contain" }} />
          )}
        </div>

        {/* Score */}
        <div
          style={{
            background: "#111827", borderRadius: 10, padding: 14,
            border: "1px solid #374151", marginBottom: 16,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Match Score (signal only — final call is yours)
          </span>
          <ScoreDial score={mv.score} />
        </div>

        {/* Prompt text */}
        <div style={{ background: "#111827", borderRadius: 10, padding: 14, border: "1px solid #374151", marginBottom: 12 }}>
          <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Seller's Prompt Text
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#D1D5DB", lineHeight: "20px", whiteSpace: "pre-wrap" }}>
            {prompt?.promptText || "—"}
          </p>
        </div>

        {/* AI description */}
        <div style={{ background: "#111827", borderRadius: 10, padding: 14, border: "1px solid #374151", marginBottom: 16 }}>
          <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            AI-Generated Media Description
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#D1D5DB", lineHeight: "20px", whiteSpace: "pre-wrap" }}>
            {mv.aiDescription || (mv.error ? `Validation failed: ${mv.error}` : "Not yet checked.")}
          </p>
        </div>

        {/* Prior admin action, if any */}
        {mv.adminAction?.action && (
          <div style={{ background: "#111827", borderRadius: 10, padding: 14, border: "1px solid #374151", marginBottom: 16 }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Last Admin Action
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#D1D5DB" }}>
              {mv.adminAction.action} {mv.adminAction.note ? `— "${mv.adminAction.note}"` : ""}
            </p>
          </div>
        )}

        {/* Note + actions */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", display: "block", marginBottom: 6 }}>
            Note <span style={{ color: "#4B5563", fontWeight: 400 }}>(required for Reject / Request Edit)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Explain your decision — shown to the seller for reject/request-edit..."
            rows={3}
            style={{
              width: "100%", padding: "10px 14px", fontSize: 13,
              border: "1px solid #374151", borderRadius: 8, outline: "none",
              boxSizing: "border-box", fontFamily: "inherit",
              color: "#F9FAFB", background: "#0D1117", resize: "vertical", lineHeight: "20px",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button disabled={actionLoading} onClick={() => onAction("revalidate", "")} style={cancelBtnStyle}>
            ↺ Re-validate
          </button>
          <button disabled={actionLoading} onClick={() => onAction("request-edit", note)} style={primaryBtnStyle("#A78BFA")}>
            Request Edit
          </button>
          <button disabled={actionLoading} onClick={() => onAction("reject", note)} style={primaryBtnStyle("#F87171")}>
            Reject
          </button>
          <button disabled={actionLoading} onClick={() => onAction("approve", note)} style={primaryBtnStyle("#34D399")}>
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function PromptValidationAdminDashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  /* Denominators for the per-status counts below. Without them the cards say
     "12 flagged" out of an unknown total, which is not a number anyone can act
     on. totalPrompts is every upload; listedProducts is the live catalogue. */
  const [totals, setTotals] = useState<{ totalPrompts: number; listedProducts: number }>({
    totalPrompts: 0,
    listedProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" = server default (pending_review + flagged)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<any>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`${API_BASE}/queue?${params}`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      let data: any = null;
      try { data = await res.json(); } catch { data = null; }

      if (!res.ok) throw new Error(data?.error || data?.message || `Server error: ${res.status}`);
      if (!data?.success) throw new Error(data?.error || "Unknown error");

      setItems(data.items || []);
      setStats(data.stats || {});
      setTotals({
        totalPrompts: Number(data.totalPrompts || 0),
        listedProducts: Number(data.listedProducts || 0),
      });
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch queue");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const showToast = (message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (action: "approve" | "reject" | "request-edit" | "revalidate", note: string) => {
    if (!selected) return;

    if ((action === "reject" || action === "request-edit") && !note.trim()) {
      showToast("A note is required for this action.", "error");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${selected._id}/${action}`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({ note }),
      });
      let data: any = null;
      try { data = await res.json(); } catch { data = null; }
      if (!res.ok || !data?.success) throw new Error(data?.error || data?.message || `${action} failed`);

      const ACTION_SUCCESS_MESSAGES: Record<string, string> = {
        approve: "Prompt approved successfully.",
        reject: "Prompt rejected successfully.",
        "request-edit": "Edit request sent to the seller.",
        revalidate: "Re-validation started.",
      };
      showToast(ACTION_SUCCESS_MESSAGES[action] || "Done.", "success");
      setSelected(null);
      fetchQueue();
    } catch (err: any) {
      showToast(err?.message || `${action} failed`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh", background: "#07080B",
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", color: "#F9FAFB",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { outline: 2px solid #6366F1 !important; outline-offset: 1px; }
        button:hover { opacity: 0.88; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #111827; }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 99px; }
      `}</style>

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#F9FAFB", margin: "0 0 4px" }}>
            Prompt-Media Match Validation
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
            AI-scored match between uploaded media and prompt text — score is a signal only, you make the final call.
          </p>
        </div>

        {/* Totals — the denominator the per-status cards below are a slice of. */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 16 }}>
          <StatCard
            icon="📦"
            label="Total prompts uploaded"
            value={totals.totalPrompts.toLocaleString()}
            accent="#A78BFA"
          />
          <StatCard
            icon="🛒"
            label="Live products on marketplace"
            value={totals.listedProducts.toLocaleString()}
            accent="#22D3EE"
          />
          <StatCard
            icon="⏳"
            label="Awaiting a decision"
            value={(
              (stats.pending || 0) +
              (stats.pending_review || 0) +
              (stats.flagged || 0)
            ).toLocaleString()}
            accent="#F472B6"
          />
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
          <StatCard icon="🚩" label="Flagged" value={stats.flagged || 0} accent="#F59E0B" />
          <StatCard icon="👀" label="Pending Review" value={stats.pending_review || 0} accent="#3B82F6" />
          <StatCard icon="✅" label="Auto-Approved" value={stats.approved || 0} accent="#10B981" />
          <StatCard icon="🛡️" label="Admin Approved" value={stats.admin_approved || 0} accent="#10B981" />
          <StatCard icon="⛔" label="Admin Rejected" value={stats.admin_rejected || 0} accent="#EF4444" />
        </div>

        {/* Table card */}
        <div style={{ background: "#111827", borderRadius: 16, border: "1px solid #1F2937", overflow: "hidden" }}>
          {/* Filter bar */}
          <div
            style={{
              padding: "14px 20px", borderBottom: "1px solid #1F2937",
              display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
            }}
          >
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#F9FAFB", flex: 1 }}>Review Queue</p>
            <input
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              placeholder="Search by title..."
              style={{
                padding: "8px 12px", border: "1px solid #374151", borderRadius: 8,
                fontSize: 13, fontFamily: "inherit", color: "#F9FAFB",
                background: "#1F2937", minWidth: 180,
              }}
            />
            <select
              value={statusFilter}
              onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
              style={{
                padding: "8px 12px", border: "1px solid #374151", borderRadius: 8,
                fontSize: 13, fontFamily: "inherit", color: "#F9FAFB",
                background: "#1F2937", cursor: "pointer",
              }}
            >
              <option value="">Needs Review (default)</option>
              <option value="all">All Statuses</option>
              <option value="pending">Pending (checking now)</option>
              <option value="flagged">Flagged</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Auto-Approved</option>
              <option value="admin_approved">Admin Approved</option>
              <option value="admin_rejected">Admin Rejected</option>
              <option value="edit_requested">Edit Requested</option>
            </select>
            <button onClick={fetchQueue} style={{ ...cancelBtnStyle, padding: "8px 14px" }}>
              ↺ Refresh
            </button>
          </div>

          {/* Body */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B7280", fontSize: 14 }}>
              Loading queue...
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#EF4444", fontSize: 14 }}>
              ⚠️ {error}
              <br />
              <button onClick={fetchQueue} style={{ marginTop: 12, ...cancelBtnStyle }}>Retry</button>
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B7280", fontSize: 14 }}>
              Nothing here. 🎉
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 800 }}>
                <thead>
                  <tr style={{ background: "#0D1117" }}>
                    {["Prompt", "Seller", "Type", "Score", "Status", "Checked", "Action"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 600,
                          color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em",
                          borderBottom: "1px solid #1F2937", whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any) => (
                    <tr key={item._id} style={{ borderBottom: "1px solid #1F2937" }}>
                      <td style={{ padding: "14px 16px", maxWidth: 220 }}>
                        <div style={{ fontWeight: 600, color: "#F9FAFB", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: 11, color: "#6B7280" }}>#{shortId(item._id)}</div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar name={item.userId?.name || ""} size={26} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 500, color: "#F9FAFB", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 110 }}>
                              {item.userId?.name || "Unknown"}
                            </div>
                            <div style={{ fontSize: 11, color: "#6B7280" }}>{item.userId?.email || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {item.attachment?.type === "video" ? "🎥 Video" : "🖼️ Image"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <ScoreDial score={item.mediaValidation?.score ?? null} />
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <Badge config={STATUS_CONFIG[item.mediaValidation?.status]} />
                      </td>
                      <td style={{ padding: "14px 16px", whiteSpace: "nowrap", color: "#9CA3AF", fontSize: 12 }}>
                        {item.mediaValidation?.checkedAt
                          ? new Date(item.mediaValidation.checkedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button
                          onClick={() => setSelected(item)}
                          style={{
                            padding: "6px 14px", borderRadius: 7, border: "1px solid #4F46E5",
                            color: "#818CF8", background: "rgba(99,102,241,0.1)",
                            fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "14px 20px", borderTop: "1px solid #1F2937" }}>
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} style={cancelBtnStyle}>
                ← Prev
              </button>
              <span style={{ alignSelf: "center", fontSize: 13, color: "#9CA3AF" }}>
                Page {page} of {totalPages}
              </span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} style={cancelBtnStyle}>
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <PromptDetailModal
          prompt={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
          actionLoading={actionLoading}
        />
      )}

      {toast && (
        <div
          style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 2000,
            padding: "12px 20px", borderRadius: 10,
            background: toast.type === "error" ? "#7F1D1D" : "#064E3B",
            color: "#F9FAFB", fontSize: 13, fontWeight: 600,
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
