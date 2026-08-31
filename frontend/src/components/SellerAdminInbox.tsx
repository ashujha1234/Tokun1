import React, { useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { io, Socket } from "socket.io-client";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5002").replace(/\/$/, "");

const getToken = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("tokun_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    "";
  return token.replace(/^Bearer\s+/i, "").trim();
};

const getCurrentUserId = () => localStorage.getItem("userId") || localStorage.getItem("tokun_user_id") || "";

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

type AdminConversation = {
  _id: string;
  id?: string;
  conversationId?: string;
  admin?: { name?: string; email?: string; avatar?: string; avatarUrl?: string };
  lastMessage?: string;
  unreadCount?: number;
  updatedAt?: string;
};

type AdminMessage = {
  _id: string;
  conversationId: string;
  senderRole: "ADMIN" | "SELLER";
  text?: string;
  isMine?: boolean;
  createdAt?: string;
  attachment?: {
    url?: string;
    name?: string;
    type?: "image" | "file";
  } | null;
};

const formatTime = (dateLike?: string) => {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

export default function SellerAdminInbox() {
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [selected, setSelected] = useState<AdminConversation | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const selectedId = selected?._id || selected?.id || selected?.conversationId || "";

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    );
  }, [messages]);

  const addOrReplaceMessage = (next: AdminMessage) => {
    setMessages((prev) => {
      const exists = prev.some((m) => m._id === next._id);
      if (exists) return prev.map((m) => (m._id === next._id ? next : m));
      return [...prev, next];
    });
  };

  /* Opens the user's thread with the admin team, creating it if this is the
     first message. Without this the inbox could only ever show a conversation
     an admin had started — which is no use to the person this screen exists
     for: someone who has just been suspended and wants to ask why. */
  const startConversation = async () => {
    try {
      setStarting(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/admin-message/seller/conversation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(
          data?.error === "no_admin_available"
            ? "No admin is available to take messages right now. Please try again shortly."
            : data?.error || "Couldn't open the chat"
        );
      }
      await loadConversations();
    } catch (e: any) {
      setError(e?.message || "Couldn't open the chat");
    } finally {
      setStarting(false);
    }
  };

  const loadConversations = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/api/admin-message/seller/conversations`, {
        headers: authHeaders(),
        credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to load messages");
      setConversations(data.conversations || []);
      // Select the newest thread whenever nothing is selected — including
      // right after startConversation() creates the first one.
      if (data.conversations?.[0]) {
        setSelected((prev) => prev || data.conversations[0]);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load messages");
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!conversationId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/admin-message/seller/messages/${conversationId}`, {
        headers: authHeaders(),
        credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to load chat");
      setMessages(data.messages || []);
      socketRef.current?.emit("admin-message:join", { conversationId });
    } catch (e: any) {
      setError(e?.message || "Failed to load chat");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    const text = draft.trim();
    if (!text || !selectedId || sending) return;

    try {
      setSending(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/admin-message/seller/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ conversationId: selectedId, text }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(data?.error || "Reply failed");
      addOrReplaceMessage(data.message);
      setDraft("");
      await loadConversations();
    } catch (e: any) {
      setError(e?.message || "Reply failed");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    socketRef.current = io(API_BASE, {
      transports: ["websocket"],
      withCredentials: true,
      auth: {
        token: getToken(),
        userId: getCurrentUserId(),
      },
    });

    socketRef.current.on("admin-message:new", (payload: any) => {
      const incoming = payload?.message;
      if (!incoming) return;
      loadConversations();
      if (selectedId && String(incoming.conversationId) === String(selectedId)) {
        addOrReplaceMessage(incoming);
      }
    });

    loadConversations();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId) loadMessages(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-[620px] rounded-2xl border border-white/10 bg-[#050607] text-white grid grid-cols-1 md:grid-cols-[320px_1fr] overflow-hidden">
      <aside className="border-r border-white/10 bg-[#111]">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-xl font-semibold">Admin Messages</h2>
          <p className="text-sm text-white/50 mt-1">Support and compliance messages</p>
        </div>

        <div className="divide-y divide-white/10">
          {conversations.map((c) => {
            const id = c._id || c.id || c.conversationId || "";
            const active = id === selectedId;
            return (
              <button
                key={id}
                onClick={() => setSelected(c)}
                className={["w-full text-left p-4 hover:bg-white/[0.04]", active ? "bg-white/[0.06]" : ""].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-sm">{c.admin?.name || "Tokun Admin"}</div>
                  {!!c.unreadCount && <span className="text-xs bg-sky-500 text-black rounded-full px-2 py-0.5">{c.unreadCount}</span>}
                </div>
                <div className="text-xs text-white/45 mt-1 truncate">{c.lastMessage || "No message"}</div>
              </button>
            );
          })}

          {conversations.length === 0 && (
            <div className="p-5">
              <p className="text-sm text-white/50">No admin messages yet.</p>
              <p className="mt-1 text-xs text-white/35">
                Start a thread if you need to ask the team about your account —
                for example, why it was suspended.
              </p>
              <button
                onClick={startConversation}
                disabled={starting}
                className="mt-3 w-full h-10 rounded-xl bg-[#249AF2] hover:opacity-90 text-sm font-semibold text-[#06111A] disabled:opacity-50"
              >
                {starting ? "Opening…" : "Message the admin team"}
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex flex-col min-h-[620px]">
        <div className="h-[72px] px-5 border-b border-white/10 flex items-center justify-between bg-[#121212]">
          <div>
            <div className="font-semibold">{selected?.admin?.name || "Tokun Admin"}</div>
            <div className="text-xs text-white/45">Admin Support</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading && <div className="text-sm text-white/50 text-center py-10">Loading chat...</div>}
          {error && <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</div>}

          {sortedMessages.map((m) => {
            const mine = !!m.isMine || m.senderRole === "SELLER";
            return (
              <div key={m._id} className={["flex", mine ? "justify-end" : "justify-start"].join(" ")}>
                <div>
                  {m.attachment?.url && (
                    <div className="mb-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 max-w-[520px]">
                      {m.attachment.type === "image" ? (
                        <img loading="lazy" decoding="async" src={m.attachment.url} alt={m.attachment.name || "attachment"} className="max-h-[220px] rounded-lg" />
                      ) : (
                        <a href={m.attachment.url} target="_blank" rel="noreferrer" className="text-sky-300 hover:underline text-sm">{m.attachment.name || "Attachment"}</a>
                      )}
                    </div>
                  )}

                  {!!m.text && (
                    <div className={["max-w-[620px] rounded-2xl px-5 py-3 text-sm leading-relaxed", mine ? "bg-[#249AF2] text-[#06111A]" : "bg-[#171717] border border-white/10 text-white/80"].join(" ")}>
                      {m.text}
                    </div>
                  )}
                  <div className={["mt-1 text-[11px] text-white/35", mine ? "text-right" : "text-left"].join(" ")}>{formatTime(m.createdAt)}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-white/10 bg-[#151515] p-4 flex gap-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendReply();
              }
            }}
            rows={1}
            placeholder="Reply to admin..."
            className="min-h-[46px] flex-1 resize-none rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-sky-400/40"
          />
          <button
            onClick={sendReply}
            disabled={!draft.trim() || sending || !selectedId}
            className="h-[46px] px-5 rounded-xl bg-[#249AF2] text-black disabled:opacity-50 inline-flex items-center gap-2 font-semibold"
          >
            Send <Send className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
