import { useEffect, useState } from "react";
import { Download, RefreshCcw, Play, X, Search } from "lucide-react";

const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

type RecordingRow = {
  id: string; userId: string; userName: string; userEmail: string;
  userAvatar?: string; videoUrl: string; fileSize: number;
  createdAt: string; promptTitle?: string;
};

const kpiCardBase = "rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.03] border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

function fmtSize(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ScreenRecordingsAdmin({ getToken }: { getToken: () => string }) {
  const [rows, setRows] = useState<RecordingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [playing, setPlaying] = useState<RecordingRow | null>(null);

  async function fetchRecordings() {
    setLoading(true); setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/screen-recording/all`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to load recordings");

      const mapped: RecordingRow[] = (data.recordings || []).map((r: any) => ({
        id: String(r._id || r.id),
        userId: String(r.userId?._id || r.userId || ""),

        // ✅ populate se aaya toh woh, warna guestName fallback
        userName:  r.userId?.name  || r.guestName  || "Unknown",
        userEmail: r.userId?.email || r.guestEmail || "—",
        userAvatar: r.userId?.avatarUrl || r.userId?.avatar || "",

        videoUrl: r.videoUrl?.startsWith("http") ? r.videoUrl : `${API_BASE}${r.videoUrl}`,
        fileSize: Number(r.fileSize || 0),
        createdAt: r.createdAt || new Date().toISOString(),
        promptTitle: r.promptTitle || "",
      }));

      setRows(mapped);
    } catch (e: any) {
      setError(e?.message || "Failed to load recordings");
      setRows([]);
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchRecordings(); }, []);

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return r.userName.toLowerCase().includes(q) || r.userEmail.toLowerCase().includes(q) || (r.promptTitle || "").toLowerCase().includes(q);
  });

  return (
    <>
      {playing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" onClick={() => setPlaying(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(95vw, 900px)", borderRadius: 16, overflow: "hidden", background: "#0F1117", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div>
                <div className="text-sm font-semibold text-white">{playing.userName}</div>
                <div className="text-xs text-white/50">{playing.userEmail} • {timeAgo(playing.createdAt)}</div>
              </div>
              <div className="flex items-center gap-3">
                <a href={playing.videoUrl} download target="_blank" rel="noopener noreferrer"
                  className="h-9 px-4 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-sm text-white flex items-center gap-2">
                  <Download className="h-4 w-4" /> Download
                </a>
                <button onClick={() => setPlaying(null)} className="h-9 w-9 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center">
                  <X className="h-4 w-4 text-white/80" />
                </button>
              </div>
            </div>
            {/* ✅ preload=auto taaki video turant load ho */}
            <video src={playing.videoUrl} controls autoPlay preload="auto" className="w-full max-h-[70vh] bg-black" />
          </div>
        </div>
      )}

      <div className="mt-2 md:mt-0">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-[24px] md:text-[34px] leading-[1.1] font-semibold">Screen Recordings</h1>
            <p className="mt-2 text-white/60 text-sm">User screen recordings captured during prompt uploads</p>
          </div>
          <button onClick={fetchRecordings} disabled={loading}
            className="h-9 self-start rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/80 hover:bg-white/[0.07] disabled:opacity-50 flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">TOTAL RECORDINGS</div>
          <div className="mt-4 text-3xl font-semibold">{rows.length}</div>
        </div>
        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">TOTAL SIZE</div>
          <div className="mt-4 text-3xl font-semibold">{fmtSize(rows.reduce((s, r) => s + r.fileSize, 0))}</div>
        </div>
        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">UNIQUE USERS</div>
          <div className="mt-4 text-3xl font-semibold">{new Set(rows.map((r) => r.userId || r.userName)).size}</div>
        </div>
      </section>

      <section className={`${kpiCardBase} mt-6 p-4`}>
        <div className="relative">
          <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
            placeholder="Search by user name, email, or prompt title..." />
        </div>
      </section>

      <section className={`${kpiCardBase} mt-6 overflow-hidden`}>
        {loading && <div className="p-6 text-white/70 text-sm">Loading recordings…</div>}
        {!!error && !loading && <div className="p-6 text-red-400 text-sm">{error}</div>}

        {!loading && !error && (
          <>
            <div className="hidden md:grid md:grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
              <div className="col-span-3">User</div>
              <div className="col-span-3">Prompt</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Recorded</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y divide-white/10">
              {filtered.map((r) => (
                <div key={r.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-5 py-5 bg-white/[0.02]">
                  <div className="md:col-span-3 flex items-center gap-3 min-w-0">
                    <img
                      src={r.userAvatar || `https://i.pravatar.cc/80?u=${encodeURIComponent(r.userName)}`}
                      alt={r.userName}
                      className="h-10 w-10 rounded-full object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white/90 truncate">{r.userName}</div>
                      <div className="text-xs text-white/45 truncate">{r.userEmail}</div>
                    </div>
                  </div>
                  <div className="md:col-span-3 flex items-center text-sm text-white/70 truncate">{r.promptTitle || "—"}</div>
                  <div className="md:col-span-2 flex items-center text-sm text-white/70">{fmtSize(r.fileSize)}</div>
                  <div className="md:col-span-2 flex items-center text-sm text-white/60">{timeAgo(r.createdAt)}</div>
                  <div className="md:col-span-2 flex items-center justify-end gap-2">
                    <button onClick={() => setPlaying(r)}
                      className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-sm text-white flex items-center gap-1.5">
                      <Play className="h-3.5 w-3.5" /> Play
                    </button>
                    <a href={r.videoUrl} download target="_blank" rel="noopener noreferrer"
                      className="h-9 w-9 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] flex items-center justify-center">
                      <Download className="h-4 w-4 text-white/70" />
                    </a>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-sm text-white/60">No recordings found.</div>
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
}