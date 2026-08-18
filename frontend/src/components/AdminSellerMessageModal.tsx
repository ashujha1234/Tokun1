import React, { useEffect, useMemo, useRef, useState } from "react";
import { avatarFor, avatarFallback } from "@/lib/avatar";
import { X, Image as ImageIcon, Paperclip, Send, Sparkles } from "lucide-react";
import { io, Socket } from "socket.io-client";

type SellerProfileForChat = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  verified?: boolean;
  totalEarnings?: number;
};

type AdminChatMessage = {
  _id: string;
  id?: string;
  conversationId: string;
  senderId?: string;
  receiverId?: string;
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

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5002").replace(/\/$/, "");

// ✅ ADMIN token ko PRIORITY do — warna normal user (jaise rasu) ka "token"
// pehle mil jaata tha aur admin request user ke roop mein jaati thi.
const getAdminToken = () => {
  const token =
    localStorage.getItem("tokun_admin_token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("tokun_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    "";

  return token.replace(/^Bearer\s+/i, "").trim();
};

const authHeaders = (): Record<string, string> => {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Admin ki apni id — token ke saath consistent rakho
const getAdminUserId = () => {
  return (
    localStorage.getItem("tokun_admin_id") ||
    localStorage.getItem("adminId") ||
    localStorage.getItem("userId") ||
    localStorage.getItem("tokun_user_id") ||
    ""
  );
};

const formatTime = (dateLike?: string) => {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

export default function AdminSellerMessageModal({
  open,
  seller,
  onClose,
  /* Who the admin is actually talking to. The modal is reused for sellers,
     plain users, and org owners, but every label in it said "Seller" — so
     messaging an organisation's owner from the Org tab opened a window titled
     "Message Seller" about someone who has never sold anything. */
  subjectRole = "Creator",
  subjectContext,
}: {
  open: boolean;
  seller: SellerProfileForChat | null;
  onClose: () => void;
  /** e.g. "Seller", "User", "Org owner" — used in headings and empty states. */
  subjectRole?: string;
  /** Extra line under the name, e.g. the organisation they own. */
  subjectContext?: string;
}) {
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const titleSeller = seller?.name || subjectRole;

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    );
  }, [messages]);

  const addOrReplaceMessage = (next: AdminChatMessage) => {
    setMessages((prev) => {
      const id = next._id || next.id;
      if (!id) return [...prev, next];
      const exists = prev.some((m) => (m._id || m.id) === id);
      if (exists) return prev.map((m) => ((m._id || m.id) === id ? next : m));
      return [...prev, next];
    });
  };

  const loadConversation = async () => {
    if (!seller?.id) return;

    // 🔎 debug: kaunsi id ja rahi hai + admin id
    console.log("📤 messaging seller.id =", seller.id, "| adminId =", getAdminUserId());

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/api/admin-message/admin/conversation/${seller.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        credentials: "include",
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || data?.message || "Conversation load failed");
      }

      const cid = String(data.conversation?._id || data.conversation?.id || "");
      setConversationId(cid);
      setMessages(data.messages || []);

      if (socketRef.current && cid) {
        socketRef.current.emit("admin-message:join", { conversationId: cid });
      }
    } catch (e: any) {
      setError(e?.message || "Conversation load failed");
      setConversationId("");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const connectSocket = () => {
    if (socketRef.current) return;

    socketRef.current = io(API_BASE, {
      transports: ["websocket"],
      withCredentials: true,
      auth: {
        token: getAdminToken(),
        userId: getAdminUserId(),
      },
    });

    socketRef.current.on("admin-message:new", (payload: any) => {
      const incoming = payload?.message;
      if (!incoming) return;
      if (conversationId && String(incoming.conversationId) !== String(conversationId)) return;
      addOrReplaceMessage(incoming);
    });
  };

  const sendText = async () => {
    const text = draft.trim();
    if (!text || !conversationId || sending) return;

    try {
      setSending(true);
      setError(null);

      const res = await fetch(`${API_BASE}/api/admin-message/admin/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ conversationId, text }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || data?.message || "Message send failed");
      }

      addOrReplaceMessage(data.message);
      setDraft("");
    } catch (e: any) {
      setError(e?.message || "Message send failed");
    } finally {
      setSending(false);
    }
  };

  const sendAttachment = async (file: File) => {
    if (!conversationId || uploading) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("conversationId", conversationId);
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/api/admin-message/admin/attachment`, {
        method: "POST",
        headers: {
          ...authHeaders(),
        },
        credentials: "include",
        body: formData,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || data?.message || "Attachment upload failed");
      }

      addOrReplaceMessage(data.message);
    } catch (e: any) {
      setError(e?.message || "Attachment upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  useEffect(() => {
    if (!open) return;
    connectSocket();
    loadConversation();

    return () => {
      if (socketRef.current && conversationId) {
        socketRef.current.emit("admin-message:leave", { conversationId });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, seller?.id]);

  useEffect(() => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit("admin-message:join", { conversationId });
    }
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  if (!open || !seller) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-5">
      <div className="w-full max-w-[1180px] h-[86vh] rounded-[24px] overflow-hidden border border-white/10 bg-[#050607] shadow-2xl flex flex-col">
        <div className="h-[76px] px-5 md:px-7 border-b border-white/10 bg-[#121212] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={avatarFor(seller)}
              alt={titleSeller}
              className="h-11 w-11 rounded-full object-cover border border-white/10"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="text-white text-lg font-semibold truncate">
                  Message {titleSeller}
                </h2>
                <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              </div>
              <div className="text-xs text-white/50 truncate">
                {[subjectRole, seller.email, subjectContext].filter(Boolean).join(" • ")}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center"
          >
            <X className="h-5 w-5 text-white/70" />
          </button>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_310px]">
          <div className="flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 bg-[#050607]">
              <div className="mx-auto max-w-[900px]">
                <div className="flex justify-center mb-6">
                  <span className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] text-[11px] uppercase tracking-[0.18em] text-white/45">
                    Admin Seller Chat
                  </span>
                </div>

                {loading && <div className="text-sm text-white/55 text-center py-10">Loading conversation...</div>}
                {!loading && sortedMessages.length === 0 && (
                  <div className="text-sm text-white/55 text-center py-10">
                    No messages yet. Send first message to {titleSeller}.
                  </div>
                )}

                <div className="space-y-6">
                  {sortedMessages.map((m) => {
                   const myId = String(getAdminUserId() || "");
const msgSenderId = String(
  m.senderId || (m as any)?.sender?._id || (m as any)?.sender || ""
);
const mine =
  (myId && msgSenderId && msgSenderId === myId) ||
  !!m.isMine ||
  m.senderRole === "ADMIN" ||
  (m as any)?.senderType === "admin";
                    const text = String(m.text || "").trim();

                    return (
                      <div key={m._id || m.id} className={["flex gap-3", mine ? "justify-end" : "justify-start"].join(" ")}>
                        {!mine && (
                          <img
                            src={avatarFor(seller)}
                            className="h-8 w-8 rounded-full object-cover border border-white/10 mt-1"
                            alt="seller"
                          />
                        )}

                        <div className={mine ? "items-end flex flex-col" : "items-start flex flex-col"}>
                          {m.attachment?.url && (
                            <div className={["mb-2 rounded-2xl p-3 border max-w-[560px]", mine ? "bg-white/10 border-white/10" : "bg-[#171717] border-white/10"].join(" ")}>
                              {m.attachment.type === "image" ? (
                                <img src={m.attachment.url} alt={m.attachment.name || "attachment"} className="max-h-[240px] rounded-xl object-cover" />
                              ) : (
                                <a href={m.attachment.url} target="_blank" rel="noreferrer" className="text-sm text-sky-300 hover:underline">
                                  {m.attachment.name || "Attachment"}
                                </a>
                              )}
                            </div>
                          )}

                          {text && (
                            <div className={["max-w-[620px] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-lg", mine ? "bg-[#249AF2] text-[#06111A] rounded-br-md" : "bg-[#171717] border border-white/10 text-white/80 rounded-bl-md"].join(" ")}>
                              {text}
                            </div>
                          )}

                          <div className={["mt-1 text-[11px] text-white/35", mine ? "text-right" : "text-left"].join(" ")}>
                            {formatTime(m.createdAt)} {mine ? "· Sent" : ""}
                          </div>
                        </div>

                        {mine && <div className="h-8 w-8 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center mt-1">ADM</div>}
                      </div>
                    );
                  })}
                </div>

                <div ref={bottomRef} />
              </div>
            </div>

            <div className="border-t border-white/10 bg-[#151515] px-4 md:px-6 py-4">
              {error && <div className="mb-3 text-xs text-red-300 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">{error}</div>}

              <div className="flex items-end gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) sendAttachment(file);
                  }}
                />

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={!conversationId || uploading}
                  className="h-11 w-11 rounded-xl border border-white/10 bg-black/40 hover:bg-white/[0.06] disabled:opacity-50 flex items-center justify-center text-white/60"
                >
                  <Paperclip className="h-5 w-5" />
                </button>

                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendText();
                    }
                  }}
                  rows={1}
                  placeholder={`Type your message to ${titleSeller}...`}
                  className="min-h-[46px] max-h-[120px] flex-1 resize-none rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-sky-400/40"
                />

                <button
                  type="button"
                  onClick={sendText}
                  disabled={sending || !draft.trim() || !conversationId}
                  className="h-11 px-6 rounded-xl bg-[#249AF2] hover:opacity-90 disabled:opacity-50 text-sm font-semibold text-[#06111A] inline-flex items-center gap-2"
                >
                  {sending ? "Sending..." : "Send"}
                  <Send className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-white/35">
                <div><span className="inline-block h-2 w-2 rounded-full bg-emerald-400 mr-2" />Admin is active</div>
                <div>Press Shift+Enter for new line</div>
              </div>
            </div>
          </div>

          <aside className="hidden lg:flex flex-col border-l border-white/10 bg-[#151515] p-6">
            <h3 className="text-lg font-semibold text-white">{subjectRole} Overview</h3>
            <div className="mt-3 h-px bg-white/10" />

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-[10px] uppercase tracking-wide text-white/40">Total Sales</div>
                <div className="mt-2 text-lg font-semibold text-white">₹{Number(seller.totalEarnings || 0).toLocaleString("en-IN")}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-[10px] uppercase tracking-wide text-white/40">Trust Score</div>
                <div className="mt-2 text-lg font-semibold text-emerald-400">{seller.verified ? "98%" : "70%"}</div>
              </div>
            </div>

            <div className="mt-7">
              <div className="text-xs uppercase tracking-[0.18em] text-white/45">Recent Activity</div>
              <div className="mt-4 space-y-5">
                <div className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-blue-400" /><div><div className="text-sm text-white/75">{subjectRole} profile opened</div><div className="text-xs text-white/35">Just now</div></div></div>
                <div className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-orange-400" /><div><div className="text-sm text-white/75">KYC status checked</div><div className="text-xs text-white/35">{seller.verified ? "Verified" : "Pending"}</div></div></div>
                <div className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" /><div><div className="text-sm text-white/75">Message channel ready</div><div className="text-xs text-white/35">Live support</div></div></div>
              </div>
            </div>

            <div className="mt-auto rounded-2xl border border-sky-500/25 bg-sky-500/10 p-4">
              <div className="text-sm font-semibold text-sky-300 inline-flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI Smart Reply</div>
              <p className="mt-3 text-xs text-white/60 leading-relaxed">Use this for KYC or payout related answers.</p>
              <button
                type="button"
                onClick={() => setDraft("Please update your KYC documents through the Compliance Portal. Our team will review them and update your status shortly.")}
                className="mt-4 w-full h-10 rounded-xl bg-[#249AF2] hover:opacity-90 text-sm font-semibold text-[#06111A]"
              >
                Insert Suggestion
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}