import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";

const API_BASE = `${(import.meta.env.VITE_API_URL || "http://localhost:5002").replace(
  /\/$/,
  ""
)}/api/admin/refunds`;

function getAuthHeaders() {
  const token = localStorage.getItem("tokun_admin_token") || localStorage.getItem("adminToken") || "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}` } : {}),
  };
}

type RefundRequest = {
  _id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason: string;
  refundAmount: number;
  adminNote?: string;
  createdAt: string;
  resolvedAt?: string;
  buyer?: { _id: string; name?: string; email?: string };
  seller?: { _id: string; name?: string; email?: string };
  prompt?: { _id: string; title?: string };
  purchase?: {
    _id: string;
    pricePaid?: number;
    razorpayPaymentId?: string;
    routeTransferId?: string | null;
    purchasedAt?: string;
  };
};

const TABS: Array<{ id: "PENDING" | "APPROVED" | "REJECTED"; label: string }> = [
  { id: "PENDING", label: "Pending" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Rejected" },
];

export default function AdminRefundsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const fetchRequests = async (status: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/?status=${status}`, { headers: getAuthHeaders() });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) setRequests(data.refundRequests || []);
    } catch (err) {
      console.error("Fetch refund requests failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(tab);
  }, [tab]);

  const approve = async (id: string) => {
    if (!window.confirm("Approve this refund? This will refund the buyer via Razorpay immediately.")) return;
    try {
      setActioningId(id);
      const res = await fetch(`${API_BASE}/${id}/approve`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ adminNote: noteDraft[id] || "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || "Failed to approve refund");
      }
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to approve refund");
    } finally {
      setActioningId(null);
    }
  };

  const reject = async (id: string) => {
    const adminNote = noteDraft[id] || "";
    if (!adminNote.trim()) {
      alert("Add a short note explaining why this refund is being rejected.");
      return;
    }
    try {
      setActioningId(id);
      const res = await fetch(`${API_BASE}/${id}/reject`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ adminNote }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to reject refund");
      }
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to reject refund");
    } finally {
      setActioningId(null);
    }
  };

  const tabCounts = useMemo(() => ({ [tab]: requests.length }), [tab, requests.length]);

  return (
    <div className="min-h-screen text-white" style={{ background: "#07080B" }}>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Refund Requests</h1>
            <p className="text-xs text-white/40 mt-0.5">Review buyer refund requests for prompt purchases</p>
          </div>
          <button
            onClick={() => fetchRequests(tab)}
            className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
            aria-label="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={
                tab === t.id
                  ? { background: "linear-gradient(135deg,#FF14EF,#8A4BFF,#1A73E8)", border: "1px solid transparent" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }
              }
              className="px-4 py-2 rounded-full text-sm font-medium text-white transition-all"
            >
              {t.label}
              {tab === t.id && tabCounts[t.id] > 0 ? ` (${tabCounts[t.id]})` : ""}
            </button>
          ))}
        </div>

        {loading && <p className="text-white/50 text-sm py-10 text-center">Loading…</p>}

        {!loading && !requests.length && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Clock className="text-white/30" size={28} />
            <p className="text-white/40 text-sm">No {tab.toLowerCase()} refund requests.</p>
          </div>
        )}

        {!loading &&
          requests.map((r) => (
            <div
              key={r._id}
              className="mb-4 p-5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm font-semibold">{r.prompt?.title || "Untitled prompt"}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Buyer: {r.buyer?.name || r.buyer?.email || "Unknown"} · Seller:{" "}
                    {r.seller?.name || r.seller?.email || "Unknown"}
                  </p>
                </div>
                <span className="text-sm font-bold text-white/90 shrink-0">₹{r.refundAmount}</span>
              </div>

              <p className="text-sm text-white/70 bg-black/20 rounded-lg p-3 mb-3">{r.reason}</p>

              <div className="flex items-center gap-3 text-[11px] text-white/40 mb-3 flex-wrap">
                <span>Requested {new Date(r.createdAt).toLocaleString("en-IN")}</span>
                <span>
                  Payout method: {r.purchase?.routeTransferId ? "Route transfer" : "Wallet ledger"}
                </span>
                {!r.purchase?.razorpayPaymentId && (
                  <span className="text-red-400">No Razorpay payment ID on record</span>
                )}
              </div>

              {r.status === "PENDING" ? (
                <>
                  <textarea
                    value={noteDraft[r._id] || ""}
                    onChange={(e) => setNoteDraft((prev) => ({ ...prev, [r._id]: e.target.value }))}
                    placeholder="Admin note (required to reject, optional to approve)"
                    className="w-full text-sm rounded-lg p-2.5 mb-3 bg-black/30 border border-white/10 text-white placeholder:text-white/30"
                    rows={2}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => approve(r._id)}
                      disabled={actioningId === r._id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}
                    >
                      <CheckCircle2 size={14} />
                      Approve &amp; Refund
                    </button>
                    <button
                      onClick={() => reject(r._id)}
                      disabled={actioningId === r._id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                      style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-white/50">
                  {r.status === "APPROVED" ? "Refunded" : "Rejected"} on{" "}
                  {r.resolvedAt ? new Date(r.resolvedAt).toLocaleString("en-IN") : "—"}
                  {r.adminNote ? ` — "${r.adminNote}"` : ""}
                </p>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
