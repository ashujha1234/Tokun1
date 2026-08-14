import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, BellOff, CheckCircle2, Flag, ShieldAlert, AlertTriangle } from "lucide-react";
// Shared with the dashboard's bell, so both open the same screen for a given
// notification type.
import { adminNotificationHref } from "@/lib/adminNotificationRoutes";

const API_BASE = `${(import.meta.env.VITE_API_URL || "http://localhost:5002").replace(
  /\/$/,
  ""
)}/api/admin/notifications`;

function getToken() {
  const token =
    localStorage.getItem("tokun_admin_token") ||
    localStorage.getItem("adminToken") ||
    "";
  return token.replace(/^Bearer\s+/i, "").trim();
}

function getAuthHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

type AdminNotif = {
  _id: string;
  type: string;
  message?: string;
  meta?: Record<string, any>;
  promptId?: { _id: string; title?: string; attachment?: { path?: string } } | null;
  read: boolean;
  createdAt: string;
};

const typeConfig: Record<string, { icon: ReactNode; accent: string; label: string }> = {
  ADMIN_PROMPT_REPORTED: { icon: <Flag size={18} />, accent: "#f59e0b", label: "Product Reported" },
  ADMIN_PROMPT_FLAGGED: { icon: <ShieldAlert size={18} />, accent: "#ef4444", label: "Auto-Flagged" },
  ADMIN_REVIEW_NEEDED: { icon: <AlertTriangle size={18} />, accent: "#eab308", label: "Review Needed" },
  DEFAULT: { icon: <Bell size={18} />, accent: "#6b7280", label: "Notification" },
};

const getTypeConfig = (type: string) => typeConfig[type] ?? typeConfig.DEFAULT;

const timeAgo = (dateStr?: string) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

export default function AdminNotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AdminNotif[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "unread">("all");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/`, { headers: getAuthHeaders() });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Fetch admin notifications failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`${API_BASE}/${id}/read`, { method: "POST", headers: getAuthHeaders() });
    } catch (err) {
      console.error("Mark admin notification read failed:", err);
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch(`${API_BASE}/read-all`, { method: "POST", headers: getAuthHeaders() });
    } catch (err) {
      console.error("Mark all admin notifications read failed:", err);
    }
  };

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const visible = tab === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const TabPill = ({ id, label, count }: { id: typeof tab; label: string; count: number }) => (
    <button
      onClick={() => setTab(id)}
      style={
        tab === id
          ? { background: "linear-gradient(135deg,#FF14EF,#8A4BFF,#1A73E8)", border: "1px solid transparent" }
          : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }
      }
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white transition-all duration-200"
    >
      {label}
      {count > 0 && (
        <span
          className="flex items-center justify-center rounded-full text-[10px] font-bold min-w-[18px] h-[18px] px-1"
          style={{ background: tab === id ? "rgba(255,255,255,0.25)" : "rgba(239,68,68,0.85)" }}
        >
          {count}
        </span>
      )}
    </button>
  );

  const NotifCard = (n: AdminNotif) => {
    const cfg = getTypeConfig(n.type);
    const fallbackTitle =
      n.type === "ADMIN_PROMPT_REPORTED"
        ? "New report"
        : n.type === "ADMIN_PROMPT_FLAGGED"
        ? "Auto-flagged upload"
        : n.type === "ADMIN_REVIEW_NEEDED"
        ? "Manual review needed"
        : "Notification";

    /* Every card now goes somewhere. It used to only mark itself read, so a
       notification about a refund or a flagged upload was a dead end — the
       admin still had to go and find the queue it was talking about. */
    const href = adminNotificationHref(n);

    return (
      <button
        key={n._id}
        onClick={() => {
          if (!n.read) markRead(n._id);
          if (href) navigate(href);
        }}
        title={href ? "Open" : undefined}
        className={`w-full text-left${href ? " cursor-pointer" : " cursor-default"}`}
        style={{
          background: !n.read ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.025)",
          border: `1px solid ${!n.read ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)"}`,
          borderLeft: `3px solid ${cfg.accent}`,
          borderRadius: 16,
          marginBottom: 10,
          padding: "18px 20px",
          display: "block",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="shrink-0 flex items-center justify-center rounded-xl"
            style={{ width: 44, height: 44, background: `${cfg.accent}22`, border: `1px solid ${cfg.accent}44`, color: cfg.accent }}
          >
            {cfg.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: `${cfg.accent}20`, color: cfg.accent }}
                >
                  {cfg.label}
                </span>
                {!n.read && <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />}
              </div>
              <span className="text-xs text-white/40 shrink-0">{timeAgo(n.createdAt)}</span>
            </div>

            <p className="text-sm text-white/90 font-semibold leading-snug mb-1">
              {n.promptId?.title || fallbackTitle}
            </p>
            {n.message && <p className="text-[13px] text-white/60 mt-0.5">{n.message}</p>}
          </div>
        </div>
      </button>
    );
  };

  const EmptyState = ({ text }: { text: string }) => (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <BellOff size={28} className="text-white/30" />
      </div>
      <p className="text-white/40 text-sm">{text}</p>
    </div>
  );

  return (
    <div className="min-h-screen text-white" style={{ background: "#07080B" }}>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.85)" }}>
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-xs text-white/40 mt-0.5">Reports, flagged uploads &amp; review alerts</p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <CheckCircle2 size={13} />
              Mark all read
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <TabPill id="all" label="All" count={notifications.length} />
          <TabPill id="unread" label="Unread" count={unreadCount} />
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              />
            ))}
          </div>
        )}

        {!loading && (
          <div>
            {visible.map((n) => NotifCard(n))}
            {!visible.length && (
              <EmptyState text={tab === "unread" ? "You're all caught up!" : "No notifications yet."} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
