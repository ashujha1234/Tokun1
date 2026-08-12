import { useCallback, useEffect, useMemo, useState } from "react";

/*
 * Admin screen for freelancers, rendered as the "Freelancers" tab of the admin
 * Dashboard.
 *
 * FREELANCER PROFILES ARE NOT APPROVED. A profile goes live the moment its owner
 * finishes onboarding, so the "Freelancers" tab here is a read-only roster.
 *
 * The one thing an admin decides is the INTRO VIDEO — the only field where a
 * freelancer publishes footage of a person under Tokun's name. That's the
 * "Intro videos" tab, and it's what this screen opens on.
 *
 * Follows the conventions of its siblings (PromptValidationAdminDashboard,
 * AdminRefundsPage): inline styles rather than the app's Tailwind theme, and the
 * separate `tokun_admin_token` — admin screens authenticate as an admin, not as
 * the signed-in user.
 */

const RAW_API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const API_BASE = `${RAW_API_BASE}/api/admin/freelancers`;

function getAuthHeaders() {
  const token = localStorage.getItem("tokun_admin_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Uploaded videos are served from the API origin, not the app's. */
const mediaUrl = (url?: string | null) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${RAW_API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
};

type Mode = "videos" | "roster";
type VideoStatus = "PENDING" | "APPROVED" | "REJECTED" | "NONE";
type ProfileStatus = "ACTIVE" | "DRAFT";

const VIDEO_TABS: { id: VideoStatus; label: string }[] = [
  { id: "PENDING", label: "Pending review" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Rejected" },
  { id: "NONE", label: "No video" },
];

const ROSTER_TABS: { id: ProfileStatus; label: string }[] = [
  { id: "ACTIVE", label: "Live" },
  { id: "DRAFT", label: "Drafts" },
];

const CHIP: Record<string, { color: string; bg: string; dot: string; label: string }> = {
  PENDING: { color: "#93C5FD", bg: "rgba(59,130,246,0.14)", dot: "#3B82F6", label: "Pending" },
  APPROVED: { color: "#6EE7B7", bg: "rgba(16,185,129,0.14)", dot: "#10B981", label: "Approved" },
  REJECTED: { color: "#FCA5A5", bg: "rgba(239,68,68,0.14)", dot: "#EF4444", label: "Rejected" },
  NONE: { color: "#D1D5DB", bg: "rgba(156,163,175,0.14)", dot: "#9CA3AF", label: "No video" },
  ACTIVE: { color: "#6EE7B7", bg: "rgba(16,185,129,0.14)", dot: "#10B981", label: "Live" },
  DRAFT: { color: "#D1D5DB", bg: "rgba(156,163,175,0.14)", dot: "#9CA3AF", label: "Draft" },
};

const SKILL_LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

interface IntroVideoRow {
  status: VideoStatus;
  url: string | null;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  originalName: string;
  uploadedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  submissionCount: number;
}

interface QueueRow {
  _id: string;
  status: ProfileStatus;
  displayName: string;
  professionalTitle: string;
  country?: string;
  city?: string;
  skillCount: number;
  topSkills: string[];
  specializations: string[];
  activatedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
  introVideo: IntroVideoRow;
  user: {
    _id: string;
    name?: string;
    email?: string;
    avatarUrl?: string | null;
    userType?: string;
    kycStatus?: string;
    isVerified?: boolean;
    createdAt?: string;
  } | null;
}

interface ProfileDetail extends QueueRow {
  about?: string;
  languages?: { name: string; level: string }[];
  skills?: { name: string; slug: string; level: string }[];
  workExperience?: {
    title: string;
    company?: string;
    from?: string | null;
    to?: string | null;
    current?: boolean;
    description?: string;
  }[];
  education?: {
    institution: string;
    degree?: string;
    fieldOfStudy?: string;
    from?: string | null;
    to?: string | null;
  }[];
  certifications?: { name: string; issuer?: string; issuedAt?: string | null; url?: string }[];
  portfolioLinks?: string[];
  hourlyRate?: number | null;
  availability?: string | null;
  payoutReadyAt?: string | null;
}

const formatDate = (v?: string | null) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// "2023-04" → "Apr 2023". Parsed by hand rather than through Date: the value is a
// month with no day, and Date would invent one then shift it in another timezone.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatMonth = (v?: string | null) => {
  if (!v || !/^\d{4}-\d{2}$/.test(v)) return "";
  const [year, month] = v.split("-");
  return `${MONTHS[Number(month) - 1] || month} ${year}`;
};

const dateRange = (from?: string | null, to?: string | null, current?: boolean) => {
  const start = formatMonth(from);
  const end = current ? "Present" : formatMonth(to);
  if (!start && !end) return "";
  return [start || "?", end || "?"].join(" – ");
};

// How long this video has been waiting. The number that actually matters when
// triaging, and it isn't obvious from a date alone.
const waitingFor = (uploadedAt?: string | null) => {
  if (!uploadedAt) return "";
  const ms = Date.now() - new Date(uploadedAt).getTime();
  if (Number.isNaN(ms) || ms < 0) return "";
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

function Badge({ status }: { status: string }) {
  const s = CHIP[status] || CHIP.NONE;
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
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {s.label}
    </span>
  );
}

function Avatar({ name = "", url, size = 34 }: { name?: string; url?: string | null; size?: number }) {
  const initials = String(name)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (url) {
    return (
      <img
        src={url}
        alt=""
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#374151",
        color: "#D1D5DB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
}

const Chip = ({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "accent" }) => (
  <span
    style={{
      display: "inline-block",
      padding: "3px 9px",
      borderRadius: 99,
      fontSize: 11,
      background: tone === "accent" ? "rgba(26,115,232,0.15)" : "rgba(255,255,255,0.06)",
      color: tone === "accent" ? "#93C5FD" : "rgba(255,255,255,0.78)",
      border: `1px solid ${tone === "accent" ? "rgba(26,115,232,0.3)" : "rgba(255,255,255,0.09)"}`,
    }}
  >
    {children}
  </span>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 18 }}>
    <h4
      style={{
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "rgba(255,255,255,0.4)",
        marginBottom: 8,
      }}
    >
      {title}
    </h4>
    {children}
  </div>
);

export default function FreelancerReviewAdminDashboard() {
  // Opens on the video queue, because that's the only thing here that needs a
  // decision. The roster is a lookup tool.
  const [mode, setMode] = useState<Mode>("videos");
  const [videoStatus, setVideoStatus] = useState<VideoStatus>("PENDING");
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>("ACTIVE");

  const [rows, setRows] = useState<QueueRow[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProfileDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteFile, setDeleteFile] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const status = mode === "videos" ? videoStatus : profileStatus;
      const path = mode === "videos" ? "/videos" : "";
      const url = `${API_BASE}${path}?status=${status}&page=${page}&limit=25${
        debouncedSearch ? `&q=${encodeURIComponent(debouncedSearch)}` : ""
      }`;

      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || data?.error || `Request failed (${res.status})`);
      }

      setRows(data.profiles || []);
      setStatusCounts(data.statusCounts || {});
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (e: any) {
      setError(e?.message || "Could not load freelancers.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [mode, videoStatus, profileStatus, page, debouncedSearch]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    setActionError(null);
    setRejectOpen(false);
    setRejectReason("");
    setDeleteFile(false);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/${selectedId}`, { headers: getAuthHeaders() });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || data?.success === false) {
          throw new Error(data?.message || "Could not load this profile.");
        }
        setDetail(data.profile);
      } catch (e: any) {
        if (!cancelled) setActionError(e?.message || "Could not load this profile.");
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const act = async (action: "approve" | "reject", body?: Record<string, unknown>) => {
    if (!selectedId) return;
    setActing(true);
    setActionError(null);

    try {
      const res = await fetch(`${API_BASE}/${selectedId}/video/${action}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(body || {}),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || data?.error || "Action failed.");
      }

      // The row has left this tab, so the detail panel closes and the queue
      // reloads — leaving it open would show a decision already made.
      setSelectedId(null);
      setRejectOpen(false);
      setRejectReason("");
      setDeleteFile(false);
      await fetchQueue();
    } catch (e: any) {
      setActionError(e?.message || "Action failed.");
    } finally {
      setActing(false);
    }
  };

  const pendingCount = statusCounts.PENDING || 0;

  const headerCell: React.CSSProperties = {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "rgba(255,255,255,0.4)",
    fontWeight: 600,
    whiteSpace: "nowrap",
  };
  const bodyCell: React.CSSProperties = {
    padding: "12px",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    verticalAlign: "top",
  };

  const selectedRowSummary = useMemo(
    () => rows.find((r) => r._id === selectedId) || null,
    [rows, selectedId]
  );

  const video = detail?.introVideo;
  const canApprove = video?.status === "PENDING" || video?.status === "REJECTED";
  const canReject = video?.status === "PENDING" || video?.status === "APPROVED";
  const videoUrl = mediaUrl(video?.url);

  const tabButton = (active: boolean, label: string, count: number | undefined, onClick: () => void) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        padding: "7px 13px",
        borderRadius: 10,
        fontSize: 12.5,
        fontWeight: active ? 600 : 500,
        color: active ? "#fff" : "rgba(255,255,255,0.6)",
        background: active ? "rgba(255,20,239,0.14)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? "rgba(255,20,239,0.35)" : "rgba(255,255,255,0.08)"}`,
        cursor: "pointer",
      }}
    >
      {label}
      {count !== undefined && (
        <span style={{ marginLeft: 6, color: "rgba(255,255,255,0.4)" }}>{count}</span>
      )}
    </button>
  );

  return (
    <div style={{ color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Freelancers</h2>
        {mode === "videos" && pendingCount > 0 && (
          <span style={{ fontSize: 12, color: "#93C5FD" }}>{pendingCount} video(s) waiting</span>
        )}
      </div>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>
        Freelancer profiles go live without review — the intro video is the only thing approved here.
        Approving publishes the video on their public profile.
      </p>

      {/* Mode switch: what needs deciding vs. who exists. */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {tabButton(mode === "videos", "Intro videos", undefined, () => {
          setMode("videos");
          setPage(1);
          setSelectedId(null);
        })}
        {tabButton(mode === "roster", "All freelancers", undefined, () => {
          setMode("roster");
          setPage(1);
          setSelectedId(null);
        })}
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {mode === "videos"
          ? VIDEO_TABS.map((tab) =>
              tabButton(videoStatus === tab.id, tab.label, statusCounts[tab.id] ?? 0, () => {
                setVideoStatus(tab.id);
                setPage(1);
                setSelectedId(null);
              })
            )
          : ROSTER_TABS.map((tab) =>
              tabButton(profileStatus === tab.id, tab.label, statusCounts[tab.id] ?? 0, () => {
                setProfileStatus(tab.id);
                setPage(1);
                setSelectedId(null);
              })
            )}
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, title or skill…"
        style={{
          width: "100%",
          maxWidth: 380,
          padding: "9px 12px",
          borderRadius: 10,
          fontSize: 13,
          color: "#fff",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          outline: "none",
          marginBottom: 14,
        }}
      />

      {error && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            marginBottom: 14,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            fontSize: 12.5,
            color: "#FCA5A5",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.02)",
          overflowX: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead>
            <tr>
              <th style={headerCell}>Freelancer</th>
              <th style={headerCell}>Title</th>
              {mode === "videos" ? (
                <>
                  <th style={headerCell}>Video</th>
                  <th style={headerCell}>Uploaded</th>
                  <th style={headerCell}>Video status</th>
                </>
              ) : (
                <>
                  <th style={headerCell}>Specializations</th>
                  <th style={headerCell}>Skills</th>
                  <th style={headerCell}>Profile</th>
                </>
              )}
              <th style={headerCell} />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} style={{ ...bodyCell, color: "rgba(255,255,255,0.45)" }}>
                  Loading…
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...bodyCell, color: "rgba(255,255,255,0.45)" }}>
                  {debouncedSearch
                    ? "Nothing matched that search."
                    : mode === "videos" && videoStatus === "PENDING"
                    ? "No videos waiting — the queue is clear."
                    : "Nothing here yet."}
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((row) => (
                <tr
                  key={row._id}
                  onClick={() => setSelectedId(row._id)}
                  style={{
                    cursor: "pointer",
                    background: selectedId === row._id ? "rgba(255,255,255,0.04)" : "transparent",
                  }}
                >
                  <td style={bodyCell}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={row.displayName || row.user?.name} url={row.user?.avatarUrl} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {row.displayName || row.user?.name || "—"}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                          {row.user?.email || "—"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={bodyCell}>
                    <div>{row.professionalTitle || "—"}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                      {[row.city, row.country].filter(Boolean).join(", ") || "—"}
                    </div>
                  </td>

                  {mode === "videos" ? (
                    <>
                      <td style={bodyCell}>
                        {row.introVideo.durationSeconds != null ? (
                          <>
                            <div>{Math.round(row.introVideo.durationSeconds)}s</div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "rgba(255,255,255,0.4)",
                                marginTop: 2,
                              }}
                            >
                              {row.introVideo.width}×{row.introVideo.height}
                              {row.introVideo.sizeBytes
                                ? ` · ${formatBytes(row.introVideo.sizeBytes)}`
                                : ""}
                            </div>
                          </>
                        ) : (
                          <span style={{ color: "rgba(255,255,255,0.35)" }}>—</span>
                        )}
                      </td>

                      <td style={{ ...bodyCell, whiteSpace: "nowrap" }}>
                        <div>{formatDate(row.introVideo.uploadedAt)}</div>
                        {videoStatus === "PENDING" && (
                          <div
                            style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}
                          >
                            {waitingFor(row.introVideo.uploadedAt)}
                          </div>
                        )}
                        {row.introVideo.submissionCount > 1 && (
                          <div
                            style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}
                          >
                            attempt {row.introVideo.submissionCount}
                          </div>
                        )}
                      </td>

                      <td style={bodyCell}>
                        <Badge status={row.introVideo.status} />
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={bodyCell}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 220 }}>
                          {row.specializations.length ? (
                            row.specializations.slice(0, 3).map((s) => (
                              <Chip key={s} tone="accent">
                                {s}
                              </Chip>
                            ))
                          ) : (
                            <span style={{ color: "rgba(255,255,255,0.35)" }}>—</span>
                          )}
                          {row.specializations.length > 3 && (
                            <Chip>+{row.specializations.length - 3}</Chip>
                          )}
                        </div>
                      </td>

                      <td style={bodyCell}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 200 }}>
                          {row.topSkills.map((s) => (
                            <Chip key={s}>{s}</Chip>
                          ))}
                          {row.skillCount > row.topSkills.length && (
                            <Chip>+{row.skillCount - row.topSkills.length}</Chip>
                          )}
                        </div>
                      </td>

                      <td style={bodyCell}>
                        <Badge status={row.status} />
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                          {formatDate(row.activatedAt || row.createdAt)}
                        </div>
                      </td>
                    </>
                  )}

                  <td style={{ ...bodyCell, textAlign: "right", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: 12, color: "#93C5FD" }}>
                      {mode === "videos" && row.introVideo.status === "PENDING" ? "Review →" : "Open →"}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page <= 1}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              color: "#fff",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: page <= 1 ? "not-allowed" : "pointer",
              opacity: page <= 1 ? 0.4 : 1,
            }}
          >
            Previous
          </button>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            Page {page} of {pages} · {total} total
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, pages))}
            disabled={page >= pages}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              color: "#fff",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: page >= pages ? "not-allowed" : "pointer",
              opacity: page >= pages ? 0.4 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* ───────────── detail drawer ───────────── */}
      {selectedId && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", justifyContent: "flex-end" }}
        >
          <div
            onClick={() => setSelectedId(null)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.62)" }}
          />

          <div
            style={{
              position: "relative",
              width: "min(600px, 100%)",
              height: "100%",
              background: "#0B0D12",
              borderLeft: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <Avatar
                name={detail?.displayName || selectedRowSummary?.displayName}
                url={detail?.user?.avatarUrl || selectedRowSummary?.user?.avatarUrl}
                size={44}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  {detail?.displayName || selectedRowSummary?.displayName || "Loading…"}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                  {detail?.professionalTitle || selectedRowSummary?.professionalTitle || ""}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                  {detail?.user?.email || selectedRowSummary?.user?.email || ""}
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 20,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              {detailLoading && (
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>Loading profile…</p>
              )}

              {detail && (
                <>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                    <Badge status={detail.status} />
                    <Badge status={detail.introVideo.status} />
                    {detail.user?.kycStatus && detail.user.kycStatus !== "NOT_SUBMITTED" && (
                      <Chip>KYC: {detail.user.kycStatus}</Chip>
                    )}
                    <Chip>{detail.payoutReadyAt ? "Payouts ready" : "No payout account yet"}</Chip>
                  </div>

                  {/* The video first — it's the reason this drawer is open. */}
                  <Section title="Intro video">
                    {videoUrl ? (
                      <>
                        <video
                          src={videoUrl}
                          controls
                          preload="metadata"
                          style={{
                            width: "100%",
                            borderRadius: 10,
                            background: "#000",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        />
                        <p
                          style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 8 }}
                        >
                          {Math.round(video?.durationSeconds || 0)}s · {video?.width}×{video?.height}
                          {video?.sizeBytes ? ` · ${formatBytes(video.sizeBytes)}` : ""}
                          {video?.originalName ? ` · ${video.originalName}` : ""}
                        </p>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>
                          Uploaded {formatDate(video?.uploadedAt)}
                          {video?.submissionCount && video.submissionCount > 1
                            ? ` · attempt ${video.submissionCount}`
                            : ""}
                          {video?.reviewedAt ? ` · last decision ${formatDate(video.reviewedAt)}` : ""}
                        </p>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
                          Format was already checked automatically (length, resolution, 16:9,
                          landscape). Your call is about the content.
                        </p>
                      </>
                    ) : (
                      <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)" }}>
                        {video?.status === "NONE"
                          ? "This freelancer hasn't uploaded a video."
                          : "The video file is no longer stored."}
                      </p>
                    )}

                    {video?.status === "REJECTED" && video.rejectionReason && (
                      <div
                        style={{
                          padding: "10px 12px",
                          borderRadius: 10,
                          marginTop: 12,
                          background: "rgba(239,68,68,0.09)",
                          border: "1px solid rgba(239,68,68,0.28)",
                        }}
                      >
                        <div
                          style={{ fontSize: 10, color: "rgba(252,165,165,0.7)", marginBottom: 4 }}
                        >
                          REASON SENT TO THEM
                        </div>
                        <div style={{ fontSize: 12.5, color: "#FCA5A5" }}>
                          {video.rejectionReason}
                        </div>
                      </div>
                    )}
                  </Section>

                  <Section title="Profile">
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                      {[detail.city, detail.country].filter(Boolean).join(", ") || "No location given"}
                      {detail.hourlyRate ? ` · ₹${detail.hourlyRate}/hr` : ""}
                      {detail.availability ? ` · ${detail.availability.replace("_", " ")}` : ""}
                    </p>
                  </Section>

                  {detail.about && (
                    <Section title="About">
                      <p
                        style={{
                          fontSize: 13,
                          color: "rgba(255,255,255,0.78)",
                          whiteSpace: "pre-line",
                          lineHeight: 1.55,
                        }}
                      >
                        {detail.about}
                      </p>
                    </Section>
                  )}

                  {!!detail.specializations?.length && (
                    <Section title="Specializations">
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {detail.specializations.map((s) => (
                          <Chip key={s} tone="accent">
                            {s}
                          </Chip>
                        ))}
                      </div>
                    </Section>
                  )}

                  {!!detail.skills?.length && (
                    <Section title={`Skills (${detail.skills.length})`}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {detail.skills.map((s) => (
                          <Chip key={s.slug}>
                            {s.name}
                            <span style={{ color: "rgba(255,255,255,0.4)" }}>
                              {" "}
                              · {SKILL_LEVEL_LABEL[s.level] || s.level}
                            </span>
                          </Chip>
                        ))}
                      </div>
                    </Section>
                  )}

                  {!!detail.languages?.length && (
                    <Section title="Languages">
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {detail.languages.map((l) => (
                          <Chip key={l.name}>
                            {l.name}
                            <span style={{ color: "rgba(255,255,255,0.4)" }}> · {l.level}</span>
                          </Chip>
                        ))}
                      </div>
                    </Section>
                  )}

                  {!!detail.workExperience?.length && (
                    <Section title="Work experience">
                      {detail.workExperience.map((w, i) => (
                        <div key={i} style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 13, color: "#fff" }}>
                            {w.title}
                            {w.company ? ` · ${w.company}` : ""}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                            {dateRange(w.from, w.to, w.current)}
                          </div>
                        </div>
                      ))}
                    </Section>
                  )}

                  {!!detail.education?.length && (
                    <Section title="Education">
                      {detail.education.map((e, i) => (
                        <div key={i} style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 13, color: "#fff" }}>
                            {e.degree ? `${e.degree}, ` : ""}
                            {e.institution}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                            {[e.fieldOfStudy, dateRange(e.from, e.to)].filter(Boolean).join(" · ")}
                          </div>
                        </div>
                      ))}
                    </Section>
                  )}

                  {!!detail.certifications?.length && (
                    <Section title="Certifications">
                      {detail.certifications.map((c, i) => (
                        <div key={i} style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 13, color: "#fff" }}>
                            {c.name}
                            {c.issuer ? ` · ${c.issuer}` : ""}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                            {formatMonth(c.issuedAt)}
                            {c.url && (
                              <>
                                {c.issuedAt ? " · " : ""}
                                <a
                                  href={c.url}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  style={{ color: "#93C5FD" }}
                                >
                                  verify
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </Section>
                  )}

                  {!!detail.portfolioLinks?.length && (
                    <Section title="Portfolio">
                      {detail.portfolioLinks.map((link) => (
                        <div key={link} style={{ marginBottom: 4 }}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noreferrer noopener"
                            style={{ fontSize: 12.5, color: "#93C5FD", wordBreak: "break-all" }}
                          >
                            {link}
                          </a>
                        </div>
                      ))}
                    </Section>
                  )}

                  <Section title="Account">
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
                      Account name: {detail.user?.name || "—"}
                      <br />
                      Type: {detail.user?.userType || "—"}
                      {detail.user?.isVerified ? " · email verified" : ""}
                      <br />
                      Joined: {formatDate(detail.user?.createdAt)}
                      <br />
                      Profile live since: {formatDate(detail.activatedAt)}
                    </p>
                    {detail.user?._id && (
                      <a
                        href={`/profile/${detail.user._id}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        style={{ fontSize: 12, color: "#93C5FD" }}
                      >
                        Open their public profile →
                      </a>
                    )}
                  </Section>
                </>
              )}
            </div>

            {/* Decision bar — video only. There is no profile to approve. */}
            {detail && (canApprove || canReject) && (
              <div
                style={{
                  padding: 16,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  background: "#0B0D12",
                }}
              >
                {actionError && (
                  <div
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      marginBottom: 10,
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      fontSize: 12,
                      color: "#FCA5A5",
                    }}
                  >
                    {actionError}
                  </div>
                )}

                {rejectOpen ? (
                  <>
                    <label
                      style={{
                        display: "block",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.55)",
                        marginBottom: 6,
                      }}
                    >
                      What's wrong with the video? This is sent to them word for word.
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. The video doesn't show you or a team member speaking — please re-record introducing yourself."
                      style={{
                        width: "100%",
                        minHeight: 78,
                        padding: "9px 11px",
                        borderRadius: 10,
                        fontSize: 12.5,
                        color: "#fff",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 10,
                        fontSize: 11.5,
                        color: "rgba(255,255,255,0.7)",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={deleteFile}
                        onChange={(e) => setDeleteFile(e.target.checked)}
                      />
                      Also delete the file — use this when the content itself is the problem
                    </label>

                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button
                        onClick={() => act("reject", { reason: rejectReason.trim(), deleteFile })}
                        disabled={acting || rejectReason.trim().length < 10}
                        style={{
                          flex: 1,
                          padding: "9px 14px",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#fff",
                          background: "#DC2626",
                          border: "none",
                          cursor:
                            acting || rejectReason.trim().length < 10 ? "not-allowed" : "pointer",
                          opacity: acting || rejectReason.trim().length < 10 ? 0.5 : 1,
                        }}
                      >
                        {acting ? "Sending…" : "Send rejection"}
                      </button>
                      <button
                        onClick={() => {
                          setRejectOpen(false);
                          setActionError(null);
                        }}
                        disabled={acting}
                        style={{
                          padding: "9px 14px",
                          borderRadius: 10,
                          fontSize: 13,
                          color: "rgba(255,255,255,0.8)",
                          background: "transparent",
                          border: "1px solid rgba(255,255,255,0.15)",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                    {rejectReason.trim().length > 0 && rejectReason.trim().length < 10 && (
                      <p style={{ fontSize: 11, color: "rgba(252,165,165,0.8)", marginTop: 6 }}>
                        Write at least a sentence — they have to be able to act on it.
                      </p>
                    )}
                  </>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    {canApprove && (
                      <button
                        onClick={() => act("approve")}
                        disabled={acting}
                        style={{
                          flex: 1,
                          padding: "10px 14px",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#fff",
                          background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
                          border: "none",
                          cursor: acting ? "not-allowed" : "pointer",
                          opacity: acting ? 0.6 : 1,
                        }}
                      >
                        {acting ? "Working…" : "Approve video"}
                      </button>
                    )}
                    {canReject && (
                      <button
                        onClick={() => setRejectOpen(true)}
                        disabled={acting}
                        style={{
                          flex: canApprove ? "0 0 auto" : 1,
                          padding: "10px 14px",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#FCA5A5",
                          background: "transparent",
                          border: "1px solid rgba(239,68,68,0.4)",
                          cursor: acting ? "not-allowed" : "pointer",
                        }}
                      >
                        {video?.status === "APPROVED" ? "Take down" : "Reject"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
