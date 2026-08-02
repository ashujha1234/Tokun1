import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, ShieldCheck, MessageCircle, Briefcase } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";
const GRADIENT_90 = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

interface Creator {
  _id: string;
  name: string;
  avatar: string | null;
  verified: boolean;
  rating: number;
  reviewsCount: number;
  totalUploadedPrompts: number;
  totalSoldPrompts: number;
  totalEarnings: number;
  location: string | null;
}

const initials = (name?: string) => (name || "U").trim().slice(0, 2).toUpperCase();

const CreatorCard = ({
  creator,
  onMessage,
  onHire,
  messaging,
}: {
  creator: Creator;
  onMessage: (creator: Creator) => void;
  onHire: (creator: Creator) => void;
  messaging: boolean;
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="group relative rounded-2xl p-6 flex flex-col gap-5 transition-all duration-200 hover:-translate-y-1"
      style={{
        background: "#141416",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ boxShadow: "0 0 0 1px rgba(255,20,239,0.25), 0 12px 40px rgba(26,115,232,0.15)" }}
      />

      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate(`/profile/${creator._id}`)}
      >
        <div className="relative shrink-0">
          {creator.avatar ? (
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-14 h-14 rounded-full object-cover"
              style={{ border: "2px solid rgba(255,255,255,0.1)" }}
            />
          ) : (
            <div
              className="w-14 h-14 rounded-full grid place-items-center text-white text-sm font-semibold"
              style={{ background: GRADIENT_90 }}
            >
              {initials(creator.name)}
            </div>
          )}
          {creator.verified && (
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full grid place-items-center"
              style={{ background: "#0B0B0B", border: "2px solid #0B0B0B" }}
            >
              <ShieldCheck className="w-4 h-4" style={{ color: "#22D3EE" }} />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-white font-semibold text-[15px] truncate">{creator.name}</div>
          {creator.location && (
            <div className="text-white/40 text-[12px] truncate">{creator.location}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl py-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
          <div className="text-white text-[15px] font-semibold">{creator.totalUploadedPrompts}</div>
          <div className="text-white/40 text-[10px] mt-0.5">Prompts</div>
        </div>
        <div className="rounded-xl py-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
          <div className="text-white text-[15px] font-semibold">{creator.totalSoldPrompts}</div>
          <div className="text-white/40 text-[10px] mt-0.5">Sold</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={() => onMessage(creator)}
          disabled={messaging}
          className="flex-1 h-10 rounded-full flex items-center justify-center gap-1.5 text-[13px] font-medium text-white transition-colors disabled:opacity-50"
          style={{ background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <MessageCircle className="w-4 h-4" />
          Message
        </button>
        <button
          onClick={() => onHire(creator)}
          className="flex-1 h-10 rounded-full flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white"
          style={{ background: GRADIENT }}
        >
          <Briefcase className="w-4 h-4" />
          Hire
        </button>
      </div>
    </div>
  );
};

const FindCreatorsPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth() as any;
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [messagingId, setMessagingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setLoadError(false);
        const res = await fetch(`${API_BASE}/api/seller?limit=0`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        const data = await res.json();
        if (!cancelled && data?.success) {
          const list: Creator[] = (data.sellers || []).filter(
            (s: Creator) => (s.totalUploadedPrompts || 0) > 0
          );
          setCreators(list);
        } else if (!cancelled) {
          setLoadError(true);
        }
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return creators;
    return creators.filter((c) => c.name?.toLowerCase().includes(q));
  }, [creators, search]);

  const handleMessage = async (creator: Creator) => {
    if (!token) {
      toast({ title: "Please log in to message creators" });
      navigate("/login");
      return;
    }
    try {
      setMessagingId(creator._id);
      const res = await fetch(`${API_BASE}/api/chat/conversation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: creator._id }),
      });
      const data = await res.json();
      if (data?.success && data.conversation) {
        navigate("/chat", { state: { conversationId: data.conversation._id } });
      } else {
        toast({ title: "Could not start conversation", variant: "destructive" });
      }
    } catch {
      toast({ title: "Could not start conversation", variant: "destructive" });
    } finally {
      setMessagingId(null);
    }
  };

  const handleHire = (creator: Creator) => {
    navigate(`/profile/${creator._id}`, { state: { openHire: true } });
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-50">
        <Header />
      </div>

      <div className="container mx-auto px-4 sm:px-6 pb-16">
        <div className="pt-14 pb-10 text-center max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            <div
              className="flex items-center gap-2 text-[12px] font-semibold tracking-wide px-3 py-1.5 rounded-full"
              style={{ color: "#22D3EE", background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>OUR COMMUNITY</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Find Creators</h1>
          <p className="text-white/50 text-sm sm:text-base">
            Discover talented prompt creators on Tokun. Message them directly or hire them for custom work.
          </p>

          <div className="relative mt-8 max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search creators by name..."
              className="w-full h-12 pl-11 pr-4 rounded-full text-sm text-white placeholder:text-white/40 outline-none"
              style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[240px] rounded-2xl animate-pulse"
                style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.06)" }}
              />
            ))}
          </div>
        )}

        {!loading && loadError && (
          <p className="text-center text-white/50 text-sm py-16">
            Could not load creators right now. Please try again later.
          </p>
        )}

        {!loading && !loadError && filtered.length === 0 && (
          <p className="text-center text-white/50 text-sm py-16">No creators found.</p>
        )}

        {!loading && !loadError && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((creator) => (
              <CreatorCard
                key={creator._id}
                creator={creator}
                onMessage={handleMessage}
                onHire={handleHire}
                messaging={messagingId === creator._id}
              />
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10 mt-4">
        <Footer />
      </div>
    </div>
  );
};

export default FindCreatorsPage;
