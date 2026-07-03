import { useEffect, useState } from "react";
import {
  Download,
  RefreshCcw,
  Play,
  X,
  Search,
  ShieldAlert,
  CheckCircle2,
  EyeOff,
  Ban,
  RotateCcw,
} from "lucide-react";

const API_BASE =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

type RecordingStatus =
  | "clean"
  | "flagged"
  | "approved"
  | "fraud"
  | "rejected"
  | "hidden";

type StatusFilter = "all" | RecordingStatus;

type RecordingRow = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  videoUrl: string;
  fileSize: number;
  createdAt: string;

  promptName?: string;
  promptTitle?: string;

  status: RecordingStatus;
  riskScore: number;
  riskFlags: string[];
  duplicateOf?: any;
  adminNote?: string;
};

const kpiCardBase =
  "rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.03] border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

function fmtSize(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function timeAgo(d: string) {
  const date = new Date(d).getTime();
  if (Number.isNaN(date)) return "—";

  const diff = Date.now() - date;
  const m = Math.max(0, Math.floor(diff / 60000));

  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;

  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;

  return `${Math.floor(h / 24)}d ago`;
}

function getPromptDisplayName(row: RecordingRow) {
  return row.promptName || row.promptTitle || "—";
}

function statusBadge(status: RecordingStatus) {
  const cls =
    status === "fraud"
      ? "bg-red-500/15 text-red-300 border-red-400/20"
      : status === "flagged"
      ? "bg-yellow-500/15 text-yellow-200 border-yellow-400/20"
      : status === "approved"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/20"
      : status === "rejected"
      ? "bg-orange-500/15 text-orange-300 border-orange-400/20"
      : status === "hidden"
      ? "bg-white/10 text-white/50 border-white/10"
      : "bg-blue-500/15 text-blue-200 border-blue-400/20";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs capitalize ${cls}`}
    >
      {status}
    </span>
  );
}

function riskLabel(riskScore: number) {
  if (riskScore >= 70) return "High";
  if (riskScore >= 40) return "Medium";
  if (riskScore > 0) return "Low";
  return "Safe";
}

function riskClass(riskScore: number) {
  if (riskScore >= 70) return "text-red-300";
  if (riskScore >= 40) return "text-yellow-200";
  if (riskScore > 0) return "text-orange-200";
  return "text-emerald-300";
}

function readableFlag(flag: string) {
  return String(flag || "").replaceAll("_", " ");
}

export default function ScreenRecordingsAdmin({
  getToken,
}: {
  getToken: () => string;
}) {
  const [rows, setRows] = useState<RecordingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [playing, setPlaying] = useState<RecordingRow | null>(null);

  async function fetchRecordings() {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);

      const url = `${API_BASE}/api/screen-recording/all${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to load recordings");
      }

      const mapped: RecordingRow[] = (data.recordings || []).map((r: any) => {
        const promptName =
          r.promptName ||
          r.prompt?.name ||
          r.prompt?.title ||
          r.promptTitle ||
          r.title ||
          "";

        return {
          id: String(r._id || r.id),
          userId: String(r.userId?._id || r.userId || ""),

          userName: r.userId?.name || r.guestName || "Unknown",
          userEmail: r.userId?.email || r.guestEmail || "—",
          userAvatar: r.userId?.avatarUrl || r.userId?.avatar || "",

          videoUrl: r.videoUrl?.startsWith("http")
            ? r.videoUrl
            : `${API_BASE}${r.videoUrl}`,

          fileSize: Number(r.fileSize || 0),
          createdAt: r.createdAt || new Date().toISOString(),

          promptName,
          promptTitle: r.promptTitle || promptName || "",

          status: r.status || "clean",
          riskScore: Number(r.riskScore || 0),
          riskFlags: Array.isArray(r.riskFlags) ? r.riskFlags : [],
          duplicateOf: r.duplicateOf || null,
          adminNote: r.adminNote || "",
        };
      });

      setRows(mapped);
    } catch (e: any) {
      setError(e?.message || "Failed to load recordings");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  async function reviewRecording(id: string, action: string) {
    const note =
      action === "mark_fraud"
        ? "Marked as fraud by admin"
        : action === "approve"
        ? "Approved by admin"
        : action === "reject"
        ? "Rejected by admin"
        : action === "hide"
        ? "Hidden by admin"
        : "Flag cleared by admin";

    setActionLoading(`${id}-${action}`);
    setError(null);

    try {
      const token = getToken();

      const res = await fetch(`${API_BASE}/api/screen-recording/${id}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ action, note }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Action failed");
      }

      await fetchRecordings();
    } catch (e: any) {
      setError(e?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  useEffect(() => {
    fetchRecordings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase();

    const promptDisplayName = getPromptDisplayName(r).toLowerCase();

    const matchesQuery =
      !q ||
      r.userName.toLowerCase().includes(q) ||
      r.userEmail.toLowerCase().includes(q) ||
      promptDisplayName.includes(q) ||
      (r.promptTitle || "").toLowerCase().includes(q) ||
      (r.promptName || "").toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      r.riskFlags.join(" ").toLowerCase().includes(q);

    return matchesQuery;
  });

  const totalSize = rows.reduce((s, r) => s + r.fileSize, 0);
  const flaggedCount = rows.filter((r) => r.status === "flagged").length;
  const fraudCount = rows.filter((r) => r.status === "fraud").length;
  const duplicateCount = rows.filter((r) => r.duplicateOf).length;

  return (
    <>
      {playing && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={() => setPlaying(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(95vw, 900px)",
              borderRadius: 16,
              overflow: "hidden",
              background: "#0F1117",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {playing.userName}
                </div>

                <div className="text-xs text-white/50 truncate">
                  {playing.userEmail} • {timeAgo(playing.createdAt)}
                </div>

                <div className="mt-1 text-xs text-yellow-200/90 truncate">
                  Prompt: {getPromptDisplayName(playing)}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={playing.videoUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-4 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-sm text-white flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>

                <button
                  onClick={() => setPlaying(null)}
                  className="h-9 w-9 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center"
                >
                  <X className="h-4 w-4 text-white/80" />
                </button>
              </div>
            </div>

            <video
              src={playing.videoUrl}
              controls
              autoPlay
              preload="auto"
              className="w-full max-h-[70vh] bg-black"
            />
          </div>
        </div>
      )}

      <div className="mt-2 md:mt-0">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-[24px] md:text-[34px] leading-[1.1] font-semibold">
              Screen Recordings
            </h1>
            <p className="mt-2 text-white/60 text-sm">
              User screen recordings with prompt name, duplicate and fraud
              detection
            </p>
          </div>

          <button
            onClick={fetchRecordings}
            disabled={loading}
            className="h-9 self-start rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/80 hover:bg-white/[0.07] disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">
            TOTAL RECORDINGS
          </div>
          <div className="mt-4 text-3xl font-semibold">{rows.length}</div>
        </div>

        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">FLAGGED</div>
          <div className="mt-4 text-3xl font-semibold text-yellow-200">
            {flaggedCount}
          </div>
        </div>

        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">FRAUD</div>
          <div className="mt-4 text-3xl font-semibold text-red-300">
            {fraudCount}
          </div>
        </div>

        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">
            DUPLICATES
          </div>
          <div className="mt-4 text-3xl font-semibold text-orange-200">
            {duplicateCount}
          </div>
        </div>

        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">
            TOTAL SIZE
          </div>
          <div className="mt-4 text-3xl font-semibold">
            {fmtSize(totalSize)}
          </div>
        </div>
      </section>

      <section className={`${kpiCardBase} mt-6 p-4`}>
        <div className="relative">
          <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
            placeholder="Search by user name, email, prompt name, status, or fraud flag..."
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              "all",
              "clean",
              "flagged",
              "approved",
              "fraud",
              "rejected",
              "hidden",
            ] as const
          ).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`h-9 rounded-lg border px-3 text-xs capitalize ${
                statusFilter === s
                  ? "border-white/25 bg-white/15 text-white"
                  : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.07]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <section className={`${kpiCardBase} mt-6 overflow-hidden`}>
        {loading && (
          <div className="p-6 text-white/70 text-sm">Loading recordings…</div>
        )}

        {!!error && !loading && (
          <div className="p-6 text-red-400 text-sm">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="hidden md:grid md:grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
              <div className="col-span-2">User</div>
              <div className="col-span-3">Prompt Name</div>
              <div className="col-span-2">Risk</div>
              <div className="col-span-1">Size</div>
              <div className="col-span-1">Recorded</div>
              <div className="col-span-3 text-right">Admin Actions</div>
            </div>

            <div className="divide-y divide-white/10">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-5 py-5 bg-white/[0.02]"
                >
                  <div className="md:col-span-2 flex items-center gap-3 min-w-0">
                    <img
                      src={
                        r.userAvatar ||
                        `https://i.pravatar.cc/80?u=${encodeURIComponent(
                          r.userName
                        )}`
                      }
                      alt={r.userName}
                      className="h-10 w-10 rounded-full object-cover border border-white/10 shrink-0"
                    />

                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white/90 truncate">
                        {r.userName}
                      </div>
                      <div className="text-xs text-white/45 truncate">
                        {r.userEmail}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-3 min-w-0">
                    <div className="text-sm text-white/80 truncate">
                      {getPromptDisplayName(r)}
                    </div>

                    {r.promptTitle && r.promptName && r.promptTitle !== r.promptName && (
                      <div className="mt-1 text-xs text-white/40 truncate">
                        Title: {r.promptTitle}
                      </div>
                    )}

                    {r.duplicateOf?.promptTitle && (
                      <div className="mt-1 text-[11px] text-yellow-200/80 truncate">
                        Duplicate of: {r.duplicateOf.promptTitle}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {statusBadge(r.status)}
                      <span className={`text-xs ${riskClass(r.riskScore)}`}>
                        {riskLabel(r.riskScore)} · {r.riskScore}
                      </span>
                    </div>

                    {r.riskFlags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {r.riskFlags.slice(0, 3).map((flag) => (
                          <span
                            key={flag}
                            className="rounded-md bg-red-500/10 border border-red-400/10 px-2 py-0.5 text-[10px] text-red-200"
                          >
                            {readableFlag(flag)}
                          </span>
                        ))}
                      </div>
                    )}

                    {r.duplicateOf && (
                      <div className="mt-1 text-[11px] text-yellow-200/80">
                        Duplicate detected
                      </div>
                    )}

                    {r.adminNote && (
                      <div className="mt-1 text-[11px] text-white/40 truncate">
                        Note: {r.adminNote}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-1 flex items-center text-sm text-white/70">
                    {fmtSize(r.fileSize)}
                  </div>

                  <div className="md:col-span-1 flex items-center text-sm text-white/60">
                    {timeAgo(r.createdAt)}
                  </div>

                  <div className="md:col-span-3 flex flex-wrap items-center justify-start md:justify-end gap-2">
                    <button
                      onClick={() => setPlaying(r)}
                      className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-sm text-white flex items-center gap-1.5"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Play
                    </button>

                    <a
                      href={r.videoUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] flex items-center justify-center"
                    >
                      <Download className="h-4 w-4 text-white/70" />
                    </a>

                    <button
                      disabled={actionLoading === `${r.id}-approve`}
                      onClick={() => reviewRecording(r.id, "approve")}
                      className="h-9 px-3 rounded-lg border border-emerald-400/20 bg-emerald-500/10 hover:bg-emerald-500/15 text-xs text-emerald-200 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve
                    </button>

                    <button
                      disabled={actionLoading === `${r.id}-mark_fraud`}
                      onClick={() => reviewRecording(r.id, "mark_fraud")}
                      className="h-9 px-3 rounded-lg border border-red-400/20 bg-red-500/10 hover:bg-red-500/15 text-xs text-red-200 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Fraud
                    </button>

                    <button
                      disabled={actionLoading === `${r.id}-reject`}
                      onClick={() => reviewRecording(r.id, "reject")}
                      className="h-9 px-3 rounded-lg border border-orange-400/20 bg-orange-500/10 hover:bg-orange-500/15 text-xs text-orange-200 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Reject
                    </button>

                    <button
                      disabled={actionLoading === `${r.id}-hide`}
                      onClick={() => reviewRecording(r.id, "hide")}
                      className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-xs text-white/70 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Hide
                    </button>

                    {(r.status === "flagged" ||
                      r.status === "fraud" ||
                      r.status === "rejected" ||
                      r.status === "hidden") && (
                      <button
                        disabled={actionLoading === `${r.id}-clear_flag`}
                        onClick={() => reviewRecording(r.id, "clear_flag")}
                        className="h-9 px-3 rounded-lg border border-blue-400/20 bg-blue-500/10 hover:bg-blue-500/15 text-xs text-blue-200 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="p-8 text-center text-sm text-white/60">
                  No recordings found.
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
}