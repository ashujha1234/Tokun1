// The admin's inbox for creator messages — icon, unread badge, and the list.
//
// The creator side of this conversation has existed for a while: a suspended
// account gets a notification telling them to ask an admin why, and
// /support/admin-chat is where that goes. The admin side had no entry point at
// all — no icon, no badge, no list. Messages arrived into a database nobody was
// looking at, so the appeal route we tell people to use was a dead end.
//
// Modelled on the notification bell next to it: same button shape, same
// dropdown, so the header reads as one row of controls rather than two ideas.

import { useCallback, useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AdminSellerMessageModal from "@/components/AdminSellerMessageModal";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

// How often the badge re-checks. Long enough not to be chatty, short enough
// that an admin sitting on the dashboard sees an appeal within the minute.
const POLL_MS = 30_000;

type Conversation = {
  conversationId: string;
  seller?: { _id?: string; name?: string; email?: string; avatarUrl?: string; avatar?: string };
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
};

const initials = (name?: string, email?: string) =>
  (name || email || "U").trim().slice(0, 2).toUpperCase();

const whenShort = (iso?: string) => {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.round(mins / 60)}h`;
  return `${Math.round(mins / 1440)}d`;
};

export default function AdminMessagesBell({
  getToken,
}: {
  /** The dashboard already resolves the admin token from storage; reuse it
      rather than guessing at key names a second time. */
  getToken: () => string | null | undefined;
}) {
  const [unread, setUnread] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [openThread, setOpenThread] = useState<Conversation | null>(null);

  const authHeaders = useCallback((): Record<string, string> => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getToken]);

  /* The badge only. Its own endpoint because this runs on a timer and the list
     query below populates three refs and counts per thread. */
  const loadUnread = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin-message/admin/unread-count`, {
        headers: authHeaders(),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) setUnread(Number(data.total) || 0);
    } catch {
      // A failed poll leaves the last known count. Zeroing it would be a lie
      // in the one direction that matters.
    }
  }, [authHeaders]);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin-message/admin/conversations`, {
        headers: authHeaders(),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) setConversations(data.conversations || []);
    } catch {
      /* handled by the empty state */
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    loadUnread();
    const id = window.setInterval(loadUnread, POLL_MS);
    return () => window.clearInterval(id);
  }, [loadUnread]);

  return (
    <>
      <DropdownMenu
        onOpenChange={(isOpen) => {
          if (isOpen) loadConversations();
        }}
      >
        <DropdownMenuTrigger asChild>
          <button
            className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] flex items-center justify-center shrink-0"
            aria-label={unread > 0 ? `Messages, ${unread} unread` : "Messages"}
          >
            <MessageSquare className="h-[18px] w-[18px] sm:h-5 sm:w-5 text-white/80" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-[10px] w-4 h-4 grid place-items-center rounded-full">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-[calc(100vw-1.5rem)] max-w-[380px] bg-[#0F1117] border border-white/10 text-white p-2"
        >
          <div className="flex items-center justify-between px-2 py-2">
            <span className="font-semibold text-sm">Messages</span>
            <span className="text-[11px] text-white/40">
              {unread > 0 ? `${unread} unread` : "All caught up"}
            </span>
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {loading && conversations.length === 0 && (
              <p className="px-2 py-6 text-center text-xs text-white/40">Loading…</p>
            )}

            {!loading && conversations.length === 0 && (
              <p className="px-3 py-6 text-center text-xs text-white/40">
                No one has messaged the team yet. Suspended creators are pointed here to appeal.
              </p>
            )}

            {conversations.map((c) => (
              <button
                key={c.conversationId}
                type="button"
                onClick={() => setOpenThread(c)}
                className="w-full flex items-start gap-2.5 rounded-lg px-2 py-2.5 text-left hover:bg-white/[0.06] transition"
              >
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-[11px] font-semibold">
                  {initials(c.seller?.name, c.seller?.email)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-medium">
                      {c.seller?.name || c.seller?.email || "Unknown"}
                    </span>
                    <span className="ml-auto shrink-0 text-[10px] text-white/35">
                      {whenShort(c.updatedAt)}
                    </span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-2">
                    <span className="truncate text-[11.5px] text-white/45">
                      {c.lastMessage || "No messages yet"}
                    </span>
                    {c.unreadCount > 0 && (
                      <span className="ml-auto shrink-0 rounded-full bg-sky-500/20 px-1.5 text-[10px] font-semibold text-sky-300">
                        {c.unreadCount}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* The same thread window the seller profile's Message button opens, so
          replying from the inbox and replying from a profile are one code path. */}
      <AdminSellerMessageModal
        open={!!openThread}
        seller={
          openThread
            ? {
                id: String(openThread.seller?._id || ""),
                name: openThread.seller?.name || openThread.seller?.email || "Unknown",
                email: openThread.seller?.email || "",
                avatar: openThread.seller?.avatarUrl || openThread.seller?.avatar || "",
              }
            : null
        }
        subjectRole="Creator"
        onClose={() => {
          setOpenThread(null);
          // Opening a thread marks it read server-side; pull the new count so
          // the badge doesn't keep claiming messages the admin just read.
          loadUnread();
          loadConversations();
        }}
      />
    </>
  );
}
