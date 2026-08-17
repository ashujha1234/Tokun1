import { useCallback, useEffect, useRef, useState } from "react";
import { avatarFor, onAvatarError } from "@/lib/avatar";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MessageCircle,
  Paperclip,
  RefreshCw,
  Send,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { socket } from "@/lib/socket";
import { toast } from "@/components/ui/use-toast";
import BriefAttachmentPicker from "@/components/escrow/BriefAttachmentPicker";
import type { BriefAttachment } from "@/lib/escrowApi";
import {
  getServiceDetail,
  serviceMediaUrl,
  type ServiceDetailPayload,
} from "@/lib/discoverApi";

/*
 * /service/:serviceId — the page a buyer lands on from the directory.
 *
 * Three things live here that don't exist anywhere else:
 *
 *  - A gallery. Services can carry up to 8 uploads and the cards only ever
 *    showed the first, so everything after it was unreachable.
 *  - An order panel that states the terms (price, delivery, revisions,
 *    deliverables) before asking for a decision. The old flow opened a booking
 *    dialog straight from a card, so the buyer agreed to a price having seen a
 *    thumbnail and a title.
 *  - A contact path that doesn't leave the page. Asking a question used to mean
 *    navigating to /chat and losing the service you were reading about — so the
 *    question and the thing it's about were never on screen together.
 */

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

const AVAILABILITY_LABEL: Record<string, string> = {
  full_time: "Available full-time",
  part_time: "Available part-time",
  occasional: "Available occasionally",
};

const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url);


/* ══════════════════════ gallery ══════════════════════ */

function Gallery({ media, title }: { media: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const items = media.map(serviceMediaUrl).filter(Boolean) as string[];

  if (items.length === 0) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-white/[0.03] border border-white/10 grid place-items-center">
        <p className="text-white/25 text-sm">No preview provided</p>
      </div>
    );
  }

  const current = items[Math.min(index, items.length - 1)];
  const step = (delta: number) => setIndex((i) => (i + delta + items.length) % items.length);

  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10">
        {isVideo(current) ? (
          // `key` forces a fresh element per item — without it the browser keeps
          // playing the previous video and just swaps the source underneath.
          <video key={current} src={current} controls className="w-full aspect-video object-contain bg-black" />
        ) : (
          <img src={current} alt={title} className="w-full aspect-video object-contain bg-black" />
        )}

        {items.length > 1 && (
          <>
            <button
              onClick={() => step(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full grid place-items-center bg-black/60 text-white hover:bg-black/80 transition"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => step(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full grid place-items-center bg-black/60 text-white hover:bg-black/80 transition"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {items.map((item, i) => (
            <button
              key={item}
              onClick={() => setIndex(i)}
              className="relative w-[92px] h-[58px] rounded-lg overflow-hidden shrink-0 transition-all"
              style={{
                border: i === index ? "2px solid #1A73E8" : "1px solid rgba(255,255,255,0.12)",
                opacity: i === index ? 1 : 0.6,
              }}
            >
              {isVideo(item) ? (
                <>
                  <video src={item} className="w-full h-full object-cover" preload="metadata" muted />
                  <span className="absolute inset-0 grid place-items-center bg-black/30">
                    <span className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white ml-0.5" />
                  </span>
                </>
              ) : (
                <img src={item} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════ inline chat ══════════════════════ */

interface ChatMsg {
  _id?: string;
  senderId: any;
  text: string;
  createdAt?: string;
}

/**
 * The message panel that opens from the bottom-left widget and from "Ask a
 * question".
 *
 * It talks to the same conversation the full /chat page uses, so a question
 * asked here appears there and vice versa — it is a second window onto one
 * thread, not a separate inbox. Only the send and the initial history are
 * handled; live delivery is /chat's job, and duplicating its socket wiring here
 * would mean two places to keep correct.
 */
function ContactPanel({
  seller,
  serviceTitle,
  open,
  onClose,
  token,
  currentUserId,
  presetText,
}: {
  seller: ServiceDetailPayload["seller"];
  serviceTitle: string;
  open: boolean;
  onClose: () => void;
  token: string | null;
  /** Needed by the socket emit — the server takes the sender from the payload. */
  currentUserId: string | null;
  presetText?: string;
}) {
  const navigate = useNavigate();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && presetText) setInput(presetText);
  }, [open, presetText]);

  // The conversation is only created when the panel is actually opened — doing
  // it on page load would leave an empty thread in the seller's inbox for every
  // visitor who merely looked.
  useEffect(() => {
    if (!open || !token || conversationId) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chat/conversation`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId: seller.userId }),
        });
        const data = await res.json();
        if (cancelled || !data?.success || !data.conversation) return;

        setConversationId(data.conversation._id);

        const msgRes = await fetch(`${API_BASE}/api/chat/messages/${data.conversation._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const msgData = await msgRes.json();
        if (!cancelled && msgData?.messages) setMessages(msgData.messages);
      } catch {
        /* the composer still works; the send will report its own failure */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, token, seller.userId, conversationId]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  /* Sending is a socket emit, not a POST — there is no REST endpoint for
     messages, and inventing one would put a second write path next to the one
     /chat already uses. The server saves the row and broadcasts "new-message"
     to the conversation room, which is what appends it below. */
  const send = () => {
    const text = input.trim();
    if (!text || !conversationId || !currentUserId) return;

    socket.emit("send-message", {
      conversationId,
      senderId: currentUserId,
      text,
    });
    setInput("");
  };

  // Joining the room is what makes the broadcast reach this panel — including
  // the echo of the message just sent, which is how it lands in the list.
  useEffect(() => {
    if (!open || !conversationId) return;

    socket.emit("join-chat", { conversationId });

    const onNew = (msg: any) => {
      if (String(msg?.conversationId) !== String(conversationId)) return;
      setMessages((prev) =>
        // The room echoes to every member including the sender, and a reopened
        // panel replays history — so an id already present is skipped.
        prev.some((m) => m._id && String(m._id) === String(msg._id)) ? prev : [...prev, msg]
      );
    };

    socket.on("new-message", onNew);
    return () => {
      socket.off("new-message", onNew);
    };
  }, [open, conversationId]);

  if (!open) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9998] w-[min(92vw,380px)] rounded-2xl border border-white/12 shadow-2xl overflow-hidden flex flex-col"
      style={{ background: "#0E0F12", maxHeight: "min(70vh, 560px)" }}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 shrink-0">
        <img
          src={avatarFor(seller)}
            onError={onAvatarError(seller)}
          alt={seller.name}
          className="w-9 h-9 rounded-full object-cover shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-medium truncate">Message {seller.name}</p>
        </div>
        <button onClick={onClose} className="text-white/45 hover:text-white transition-colors" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>

      {!token ? (
        <div className="p-6 text-center">
          <p className="text-white/60 text-sm mb-4">Log in to message {seller.name}.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 rounded-full text-sm font-medium text-white"
            style={{ background: GRADIENT }}
          >
            Log in
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 min-h-[120px]">
            {loading && (
              <p className="text-white/35 text-xs text-center py-4">Opening conversation…</p>
            )}

            {!loading && messages.length === 0 && (
              <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] px-3 py-2.5">
                <p className="text-white/50 text-[11px]">
                  Ask about <span className="text-white/80">{serviceTitle}</span> — requirements,
                  timeline, budget, anything.
                </p>
              </div>
            )}

            {messages.map((m, i) => {
              const mine = String(m.senderId?._id || m.senderId) !== String(seller.userId);
              return (
                <div key={m._id || i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-snug"
                    style={
                      mine
                        ? { background: "#1A73E8", color: "#fff" }
                        : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.9)" }
                    }
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-white/10 p-3 shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  // Enter sends, Shift+Enter breaks the line — the convention
                  // every messenger uses.
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={2}
                maxLength={2500}
                placeholder={`Ask ${seller.name} a question…`}
                className="flex-1 resize-none rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#1A73E8]"
              />
              <button
                onClick={send}
                disabled={!input.trim() || !conversationId}
                className="w-9 h-9 rounded-full grid place-items-center text-white shrink-0 disabled:opacity-40"
                style={{ background: GRADIENT }}
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => navigate("/chat", { state: { conversationId } })}
              className="mt-2 text-[11px] text-white/35 hover:text-white/70 transition-colors"
            >
              Open full conversation →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════ page ══════════════════════ */

export default function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth() as any;

  const [data, setData] = useState<ServiceDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [presetText, setPresetText] = useState<string | undefined>();

  const [booking, setBooking] = useState(false);
  const [note, setNote] = useState("");
  // Reference material for the brief — uploaded as they're picked, submitted as
  // descriptors alongside the booking.
  const [briefFiles, setBriefFiles] = useState<BriefAttachment[]>([]);
  const [orderOpen, setOrderOpen] = useState(false);

  const load = useCallback(async () => {
    if (!serviceId) return;
    setLoading(true);
    setError(null);

    const res = await getServiceDetail(serviceId, token);
    setLoading(false);

    if (!res.ok) {
      setError(res.message || "This service isn't available.");
      return;
    }
    setData(res.data);
  }, [serviceId, token]);

  useEffect(() => {
    load();
  }, [load]);

  /* The one way this page opens a conversation. Both entry points — the
     bottom-left widget and "Contact me" in the sidebar — land here, so they
     can't drift into behaving differently. */
  const openChat = (preset?: string) => {
    setPresetText(preset);
    setChatOpen(true);
  };

  /* Mirrors BookNowPopup.handleConfirm, which is the flow that actually works:
     open the conversation FIRST, book against it, then drop a SERVICE_CARD::
     message into that thread and land the buyer there.

     The card is the whole point — it is where the buyer pays. Booking without
     posting it (which is what this did) created a real order that neither side
     could see or act on: the seller got a notification about an order with no
     card, and the buyer had no way to complete payment. */
  const requestToOrder = async () => {
    if (!token || !user?._id) {
      navigate("/login");
      return;
    }
    if (!data) return;

    setBooking(true);
    try {
      // The conversation has to exist before booking, because the order stores
      // its id — an order created without one has no thread to carry the card.
      const convRes = await fetch(`${API_BASE}/api/chat/conversation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: data.seller.userId }),
      });
      const convData = await convRes.json().catch(() => ({}));
      const conversationId = convData?.conversation?._id;

      if (!convRes.ok || !conversationId) {
        throw new Error("Couldn't open a conversation with this Creator.");
      }

      const res = await fetch(`${API_BASE}/api/services/${data.service._id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          note: note.trim(),
          conversationId,
          briefAttachments: briefFiles,
        }),
      });
      const result = await res.json().catch(() => ({}));

      if (!res.ok || !result?.success || !result?.cardPayload) {
        throw new Error(
          result?.error === "cannot_book_own_service"
            ? "This is your own service."
            : result?.message || "Please try again."
        );
      }

      socket.emit("join-chat", { conversationId });
      socket.emit("send-message", {
        conversationId,
        senderId: String(user._id),
        text: `SERVICE_CARD::${JSON.stringify(result.cardPayload)}`,
      });

      setOrderOpen(false);
      setNote("");
      setBriefFiles([]);
      toast({
        title: "Request sent",
        description: "Complete payment in chat to confirm.",
      });
      navigate("/chat", { state: { conversationId } });
    } catch (err: any) {
      toast({
        title: "Couldn't place the request",
        description: err?.message || "Check your connection and try again.",
      });
    } finally {
      setBooking(false);
    }
  };

  const shell = (children: React.ReactNode) => (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Header is `sticky top-0` on its own -- nesting a second sticky at
          the same offset makes the two fight and the bar jitters on scroll. */}
      <Header />
      <div className="container mx-auto px-4 sm:px-6 py-8 pb-24">{children}</div>
      <Footer />
    </div>
  );

  if (loading) {
    return shell(
      <div className="py-24 text-center">
        <Loader2 className="w-6 h-6 mx-auto animate-spin text-white/40" />
        <p className="text-white/50 text-sm mt-3">Loading service…</p>
      </div>
    );
  }

  if (error || !data) {
    return shell(
      <div className="py-24 text-center max-w-md mx-auto">
        <p className="text-white/60 text-sm mb-5">{error || "This service isn't available."}</p>
        <button
          onClick={() => navigate("/find-creators")}
          className="px-5 py-2.5 rounded-full text-sm font-medium text-white"
          style={{ background: GRADIENT }}
        >
          Browse services
        </button>
      </div>
    );
  }

  const { service, seller, otherServices } = data;
  const isOwn = user?._id && String(user._id) === seller.userId;

  const breadcrumb = [
    service.parentCategory?.name || service.category?.name,
    service.parentCategory ? service.category?.name : null,
    service.subCategory?.name,
  ].filter(Boolean) as string[];

  /* What the price actually buys.
     `deliverables` is what the create form collects now — free-form lines the
     seller wrote. The screens/prototype/fileType trio is the older, design-only
     shape; it is only read when a service has no deliverables, so listings made
     before the change still say what they include instead of showing nothing. */
  const included: string[] = service.deliverables?.length
    ? service.deliverables
    : ([
        service.screens,
        service.prototype && `Prototype: ${service.prototype}`,
        service.fileType && `Source files: ${service.fileType}`,
      ].filter(Boolean) as string[]);

  return shell(
    <>
      {breadcrumb.length > 0 && (
        <nav className="flex items-center gap-2 text-[12px] text-white/35 mb-5 flex-wrap">
          <button onClick={() => navigate("/find-creators")} className="hover:text-white/70 transition-colors">
            Services
          </button>
          {breadcrumb.map((crumb) => (
            <span key={crumb} className="flex items-center gap-2">
              <span>/</span>
              <span className="text-white/55">{crumb}</span>
            </span>
          ))}
        </nav>
      )}

      {service.status === "draft" && (
        <div
          className="mb-5 rounded-xl border px-4 py-3"
          style={{ borderColor: "rgba(245,158,11,0.32)", background: "rgba(245,158,11,0.07)" }}
        >
          <p className="text-xs text-amber-200">
            This is a draft — only you can see it. Publish it from your profile to let buyers book.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr),380px] gap-8 items-start">
        {/* ── main ── */}
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-[28px] font-bold text-white leading-snug mb-4">
            {service.title}
          </h1>

          {/* Seller row */}
          <button
            onClick={() => navigate(`/profile/${seller.userId}`)}
            className="flex items-center gap-3 mb-6 group text-left"
          >
            <img
              src={avatarFor(seller)}
            onError={onAvatarError(seller)}
              alt={seller.name}
              className="w-11 h-11 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0">
              <span className="flex items-center gap-1.5 flex-wrap">
                <span className="text-white font-semibold text-sm group-hover:underline">
                  {seller.name}
                </span>
                {seller.verified && <ShieldCheck className="w-3.5 h-3.5" style={{ color: "#22D3EE" }} />}
                {seller.rating > 0 && (
                  <span className="inline-flex items-center gap-1 text-[12px] text-white/60">
                    <Star className="w-3 h-3" style={{ color: "#FFD34D" }} />
                    {seller.rating.toFixed(1)}
                    {seller.reviewsCount > 0 && (
                      <span className="text-white/35">({seller.reviewsCount})</span>
                    )}
                  </span>
                )}
              </span>
              <span className="block text-white/40 text-[12px] truncate">
                {/* "Freelancer" and "Product creator" were both left over from
                    before the tier was named. The platform says Creator for
                    anyone who sells, and Super Creator for a cleared freelancer
                    profile — one vocabulary, or the same person is three
                    different things across three pages. */}
                {seller.professionalTitle ||
                  (seller.superCreator ? "Super Creator" : "Creator")}
                {seller.freelancerLocation ? ` · ${seller.freelancerLocation}` : ""}
              </span>
            </div>
          </button>

          <Gallery media={service.media} title={service.title} />

          {/* Description */}
          <section className="mt-8 rounded-2xl border border-white/10 bg-[#101012] p-5 sm:p-6">
            <h2 className="text-white font-semibold text-[15px] mb-3">About this service</h2>
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
              {service.description}
            </p>
          </section>

          {/* Seller facts, when they have a freelancer profile behind them. */}
          {seller.isFreelancer && (
            <section className="mt-5 rounded-2xl border border-white/10 bg-[#101012] p-5 sm:p-6">
              <h2 className="text-white font-semibold text-[15px] mb-4">About the freelancer</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {seller.freelancerLocation && (
                  <div>
                    <p className="text-white/35 text-[10px] uppercase tracking-wide mb-1">From</p>
                    <p className="text-white text-sm">{seller.freelancerLocation}</p>
                  </div>
                )}
                {!!seller.languages?.length && (
                  <div>
                    <p className="text-white/35 text-[10px] uppercase tracking-wide mb-1">Speaks</p>
                    <p className="text-white text-sm">
                      {seller.languages.map((l) => l.name).join(", ")}
                    </p>
                  </div>
                )}
                {seller.availability && (
                  <div>
                    <p className="text-white/35 text-[10px] uppercase tracking-wide mb-1">
                      Availability
                    </p>
                    <p className="text-white text-sm">{AVAILABILITY_LABEL[seller.availability]}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate(`/profile/${seller.userId}`)}
                className="mt-4 text-[12px] text-sky-300 hover:underline"
              >
                See full profile →
              </button>
            </section>
          )}

          {/* Other work by the same person */}
          {otherServices.length > 0 && (
            <section className="mt-5">
              <h2 className="text-white font-semibold text-[15px] mb-3">
                More from {seller.name}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {otherServices.map((other) => {
                  const cover = serviceMediaUrl(other.cover);
                  return (
                    <button
                      key={other._id}
                      onClick={() => navigate(`/service/${other._id}`)}
                      className="text-left rounded-xl border border-white/10 bg-[#101012] overflow-hidden hover:border-white/25 transition-colors"
                    >
                      <div className="h-[90px] bg-black">
                        {cover &&
                          (isVideo(cover) ? (
                            <video src={cover} className="w-full h-full object-cover" muted preload="metadata" />
                          ) : (
                            <img src={cover} alt="" className="w-full h-full object-cover" />
                          ))}
                      </div>
                      <div className="p-2.5">
                        <p className="text-white text-[12px] line-clamp-2 leading-snug">
                          {other.title}
                        </p>
                        <p className="text-white/45 text-[11px] mt-1.5">₹{other.price}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* ── order panel ── */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-white/10 bg-[#101012] overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex items-baseline justify-between gap-3 mb-4">
                <span className="text-white text-2xl font-bold">₹{service.price}</span>
                {service.subCategory && (
                  <span className="text-white/35 text-[11px] truncate">{service.subCategory.name}</span>
                )}
              </div>

              <div className="flex items-center gap-5 text-[12px] text-white/60 mb-4">
                {service.delivery && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {service.delivery}
                  </span>
                )}
                {service.revisions && (
                  <span className="inline-flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    {service.revisions}
                  </span>
                )}
              </div>

              {included.length > 0 && (
                <div className="border-t border-white/[0.07] pt-4 mb-5">
                  <p className="text-white/35 text-[10px] uppercase tracking-wide mb-2">
                    What's included
                  </p>
                  <ul className="space-y-1.5">
                    {included.map((item) => (
                      <li key={item} className="text-white/70 text-[12px] flex gap-2">
                        <span className="text-white/25">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isOwn ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="text-white/55 text-xs">
                    This is your service. Buyers see a request button here.
                  </p>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => (token ? setOrderOpen(true) : navigate("/login"))}
                    disabled={seller.suspended || service.status === "draft"}
                    className="w-full h-11 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                    style={{ background: GRADIENT }}
                  >
                    Request to order
                  </button>

                  {/* Contact me → opens the same chat panel the bottom-left
                      widget does, straight away.
                      It used to drop down a "How can I help?" menu with three
                      options that all ended in the very same panel — a menu
                      whose only real effect was one extra click between wanting
                      to say something and being able to type it. */}
                  <button
                    onClick={() => openChat()}
                    className="w-full mt-2.5 h-11 rounded-xl text-sm font-medium text-white/85 border border-white/15 hover:border-white/30 transition-colors"
                  >
                    Contact me
                  </button>
                </>
              )}
            </div>

            {seller.hourlyRate != null && !isOwn && (
              <div className="border-t border-white/[0.07] p-5 sm:p-6">
                <p className="text-white text-[13px] font-medium mb-1">Need flexibility?</p>
                <p className="text-white/45 text-[11px] mb-3">
                  Hire by the hour instead — better for long-running work.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-semibold">₹{seller.hourlyRate}/hour</span>
                  <button
                    onClick={() =>
                      openChat(
                        `Hi ${seller.name}, I'd like to discuss an hourly arrangement rather than a fixed package.`
                      )
                    }
                    className="text-[12px] text-sky-300 hover:underline"
                  >
                    Ask about hourly
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── request-to-order confirmation ──
          A short step between the button and the order, because the note is the
          only place the buyer says what they actually want. */}
      {orderOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm grid place-items-center p-4">
          <div className="w-full max-w-[480px] rounded-2xl border border-white/10 bg-[#0E0F12] overflow-hidden">
            <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-white/[0.07]">
              <div>
                <h3 className="text-white text-lg font-semibold">Request to order</h3>
                <p className="text-white/45 text-xs mt-0.5">
                  {seller.name} confirms first — you're asked to pay only after that.
                </p>
              </div>
              <button
                onClick={() => setOrderOpen(false)}
                className="text-white/45 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 mb-4">
                <p className="text-white text-sm line-clamp-2">{service.title}</p>
                <div className="flex items-center gap-4 mt-2 text-[12px] text-white/50">
                  <span className="text-white font-semibold">₹{service.price}</span>
                  {service.delivery && <span>{service.delivery}</span>}
                  {service.revisions && <span>{service.revisions}</span>}
                </div>
              </div>

              <label className="text-xs text-white/60 mb-1.5 block">
                What do you need? (optional, but it speeds things up)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 2000))}
                rows={4}
                placeholder="Requirements, links, deadline…"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#1A73E8] resize-y"
              />

              {/* The brief used to be text only, so every real one started with
                  a Drive link pasted into chat that nobody could find again.
                  These ride on the order itself and are still there if a
                  cancellation later asks what was actually agreed. */}
              <div className="mt-4">
                <BriefAttachmentPicker
                  value={briefFiles}
                  onChange={setBriefFiles}
                  token={token}
                  disabled={booking}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.07]">
              <button
                onClick={() => setOrderOpen(false)}
                disabled={booking}
                className="px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={requestToOrder}
                disabled={booking}
                className="px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                style={{ background: GRADIENT }}
              >
                {booking ? "Sending…" : "Send request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── bottom-left contact widget ──
          Present from the moment the page loads, collapsed. It is the persistent
          way back to the seller while reading, so a question never requires
          hunting for the sidebar. Hidden on your own service — there is nobody
          to message. */}
      {!isOwn && !chatOpen && (
        <button
          onClick={() => openChat()}
          className="fixed bottom-4 left-4 z-[9997] flex items-center gap-3 rounded-2xl border border-white/12 pl-3 pr-4 py-2.5 shadow-2xl hover:border-white/25 transition-colors"
          style={{ background: "#0E0F12" }}
        >
          <img
            src={avatarFor(seller)}
            onError={onAvatarError(seller)}
            alt={seller.name}
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
          <span className="text-left">
            <span className="block text-white text-[13px] font-medium leading-tight">
              Message {seller.name}
            </span>
            {seller.professionalTitle && (
              <span className="block text-white/40 text-[11px] leading-tight mt-0.5 max-w-[180px] truncate">
                {seller.professionalTitle}
              </span>
            )}
          </span>
          <MessageCircle className="w-4 h-4 text-white/30 shrink-0" />
        </button>
      )}

      <ContactPanel
        seller={seller}
        serviceTitle={service.title}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        token={token}
        currentUserId={user?._id ? String(user._id) : null}
        presetText={presetText}
      />
    </>
  );
}
