// src/pages/PromptMarketplacePage.tsx
import { useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search, TrendingUp, ShieldCheck, ArrowRight, ArrowUpRight, Wallet, Eye,
  Check, Sparkles, ChevronLeft, ChevronRight, Rocket, Shirt, Play,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppNavigation from "@/components/AppNavigation";

/* ---------------------------------------------------------------------- */
/*  Shared constants                                                      */
/* ---------------------------------------------------------------------- */
const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";
const GRADIENT_90 = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

/**
 * 🖼️ Banner assets
 * Drop the 3 banner images you sent me into `public/icons/` using these
 * exact file names (or change the paths below to whatever you name them):
 *   1) banner-nebula-core.png    -> the neon cyberpunk-city / energy-orb shot
 *   2) banner-crystal-tower.png  -> the glass/crystal skyscraper sculpture
 *   3) banner-logo-identity.png  -> the "Logo & Brand Identity AI Prompts" shot
 * If all 3 look the same on your machine, it's almost always because they
 * got saved with the same filename and overwrote each other — re-save each
 * one with its own distinct name above.
 */
const BANNERS = {
  hero: "/icons/banner-nebula-core.png",
  crystal: "/icons/banner-crystal-tower.png",
  brandIdentity: "/icons/banner-logo-identity.png",
};

/**
 * 🌐 Stock photo filler
 * The prompt-card thumbnails below use Picsum (picsum.photos) — a free,
 * hotlink-friendly placeholder photo service, so every card gets its own
 * distinct real photo instead of the same 2 banners repeating. Each `seed`
 * always returns the same photo, so the grid stays stable on refresh.
 * Swap any of these for your own generated artwork whenever it's ready —
 * just replace the URL string, no other code changes needed.
 */
const stockImage = (seed: string, w = 600, h = 400) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

/**
 * 🎬 Optional hover-preview videos
 * Any prompt card below can take an optional `videoUrl`. On hover, the card
 * smoothly cross-fades from the static image to that video (autoplay, muted,
 * looped). Drop .mp4 files into `public/icons/` and point to them here, e.g.
 * "/icons/preview-solarpunk-loop.mp4". Prompts with no `videoUrl` just get a
 * smooth zoom on the image instead — video is never required.
 */

/* ---------------------------------------------------------------------- */
/*  Types + mock data                                                     */
/* ---------------------------------------------------------------------- */
type Prompt = {
  id: number;
  title: string;
  model: string;
  price: string;
  imageUrl: string;
  videoUrl?: string;
};

type FeaturedPrompt = {
  id: number;
  title: string;
  description: string;
  model: string;
  category: string;
  price: string;
  badge: "STAFF PICK" | "PREMIUM";
  imageUrl: string;
  videoUrl?: string;
};

/**
 * 🎬 Hover-preview videos
 * These point to real, publicly hosted sample films (Blender Foundation /
 * Google's open sample bucket — free to use, always online) just so the
 * hover-preview actually plays something right now. Swap any of these for
 * your own short prompt-preview clips whenever you have them — the player
 * logic doesn't change, only the URL does.
 */
const sampleVideo = (name: string) =>
  `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/${name}.mp4`;

const newestPrompts: Prompt[] = [
  { id: 101, title: "Aurora Ink Portrait", model: "Midjourney v6", price: "$9.50", imageUrl: stockImage("aurora-ink-portrait") },
  { id: 102, title: "Glassmorphic UI Kit", model: "DALL-E 3", price: "$11.00", imageUrl: stockImage("glassmorphic-ui-kit") },
  { id: 103, title: "Solarpunk Skyline", model: "Midjourney v6", price: "$12.25", imageUrl: stockImage("solarpunk-skyline"), videoUrl: sampleVideo("ElephantsDream") },
  { id: 104, title: "Obsidian Jewelry Macro", model: "Stable Diffusion", price: "$8.75", imageUrl: stockImage("obsidian-jewelry-macro") },
  { id: 105, title: "Paper-cut Wildlife Diorama", model: "DALL-E 3", price: "$10.00", imageUrl: stockImage("papercut-wildlife-diorama") },
];

const popularThisMonthPrompts: Prompt[] = [
  { id: 1, title: "Neon Luminescence", model: "Midjourney v6", price: "$8.99", imageUrl: stockImage("neon-luminescence"), videoUrl: sampleVideo("Sintel") },
  { id: 2, title: "Cyberpunk Metropolis", model: "DALL-E 3", price: "$12.50", imageUrl: stockImage("cyberpunk-metropolis"), videoUrl: sampleVideo("ForBiggerFun") },
  { id: 3, title: "Fluorescent Portraits", model: "Stable Diffusion", price: "$9.00", imageUrl: stockImage("fluorescent-portraits") },
  { id: 4, title: "Crystalline Geometry", model: "Midjourney v6", price: "$11.99", imageUrl: stockImage("crystalline-geometry") },
  { id: 5, title: "Quantum Dreamscape", model: "Midjourney v6", price: "$10.50", imageUrl: stockImage("quantum-dreamscape") },
  { id: 6, title: "Chrome Botanica", model: "DALL-E 3", price: "$13.25", imageUrl: stockImage("chrome-botanica") },
];

const tshirtDesignPrompts: Prompt[] = [
  { id: 201, title: "Retro Streetwear Graphic", model: "Midjourney v6", price: "$7.99", imageUrl: stockImage("retro-streetwear-graphic") },
  { id: 202, title: "Minimalist Line Art Tee", model: "DALL-E 3", price: "$6.50", imageUrl: stockImage("minimalist-line-art-tee") },
  { id: 203, title: "Y2K Neon Print", model: "Midjourney v6", price: "$8.25", imageUrl: stockImage("y2k-neon-print"), videoUrl: sampleVideo("BigBuckBunny") },
  { id: 204, title: "Vintage Band Tee Design", model: "Stable Diffusion", price: "$7.00", imageUrl: stockImage("vintage-band-tee-design") },
  { id: 205, title: "Bold Typographic Slogan", model: "DALL-E 3", price: "$6.99", imageUrl: stockImage("bold-typographic-slogan") },
];

const featuredPrompts: FeaturedPrompt[] = [
  {
    id: 1,
    title: "Modern Architectural Renders",
    description: "Master golden hour lighting for minimalist interior and exterior villa designs with perfect shadows.",
    model: "Midjourney v6",
    category: "Architecture",
    price: "$12.99",
    badge: "STAFF PICK",
    imageUrl: stockImage("modern-architectural-renders"),
  },
  {
    id: 2,
    title: "Hyper-Realistic Oil Texture",
    description: "Emulate thick impasto brushstrokes and classic lighting for digital paintings that look physical.",
    model: "DALL-E 3",
    category: "Illustration",
    price: "$15.00",
    badge: "PREMIUM",
    imageUrl: stockImage("hyper-realistic-oil-texture"),
  },
  {
    id: 3,
    title: "Vaporwave Album Art",
    description: "Retro-futuristic gradients, chrome type, and sunset grids built for cover art that pops on a shelf.",
    model: "Midjourney v6",
    category: "Music",
    price: "$10.50",
    badge: "STAFF PICK",
    imageUrl: stockImage("vaporwave-album-art"),
    videoUrl: sampleVideo("TearsOfSteel"),
  },
  {
    id: 4,
    title: "Minimalist Product Renders",
    description: "Studio-clean product shots with soft shadows and premium materials, ready for e-commerce.",
    model: "DALL-E 3",
    category: "Product",
    price: "$13.75",
    badge: "PREMIUM",
    imageUrl: stockImage("minimalist-product-renders"),
  },
];

/* ---------------------------------------------------------------------- */
/*  Small shared bits                                                     */
/* ---------------------------------------------------------------------- */
const Eyebrow = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wide" style={{ color: "#22D3EE" }}>
    {icon}
    <span>{children}</span>
  </div>
);

const ArrowNav = ({ onLeft, onRight }: { onLeft: () => void; onRight: () => void }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={onLeft}
      aria-label="Scroll left"
      className="w-9 h-9 rounded-full grid place-items-center text-white/80 hover:text-white transition-colors"
      style={{ background: "#1C1C1C", border: "1px solid rgba(255,255,255,0.12)" }}
    >
      <ChevronLeft className="h-4 w-4" />
    </button>
    <button
      onClick={onRight}
      aria-label="Scroll right"
      className="w-9 h-9 rounded-full grid place-items-center text-white/80 hover:text-white transition-colors"
      style={{ background: "#1C1C1C", border: "1px solid rgba(255,255,255,0.12)" }}
    >
      <ChevronRight className="h-4 w-4" />
    </button>
  </div>
);

/**
 * Smooth hover media: shows the static image by default. If a `videoUrl` is
 * provided, hovering also pops it up into a large centered overlay that
 * plays the video (muted, looped) — media only, no title/price/description.
 * If there's no video, hovering just gives the thumbnail a gentle smooth
 * zoom. Used by every prompt card on the page so the behavior is consistent.
 */
const PromptMedia = ({
  imageUrl,
  videoUrl,
  className,
  children,
}: {
  imageUrl: string;
  videoUrl?: string;
  className?: string;
  children?: ReactNode;
}) => {
  const [hovering, setHovering] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const popupVideoRef = useRef<HTMLVideoElement>(null);
  const showVideo = Boolean(videoUrl) && !videoFailed;

  const handleEnter = () => setHovering(true);
  const handleLeave = () => {
    setHovering(false);
    if (popupVideoRef.current) {
      popupVideoRef.current.pause();
      popupVideoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className={`relative bg-[#0B0B0B] ${className ?? ""}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <img
        src={imageUrl}
        alt=""
        className="w-full h-full object-cover transition-transform duration-500 ease-out"
        style={{ transform: hovering ? "scale(1.06)" : "scale(1)" }}
      />

      {showVideo && (
        <div
          className="absolute bottom-2 right-2 w-6 h-6 rounded-full grid place-items-center transition-opacity duration-300"
          style={{ background: "rgba(0,0,0,0.55)", opacity: hovering ? 0 : 1 }}
        >
          <Play className="h-3 w-3 text-white" fill="white" />
        </div>
      )}

      {children}

      {/* Pop-up preview — portaled to <body> so it always floats centered,
          on top of everything, unaffected by any card's overflow/scroll.
          Uses a plain @keyframes animation (injected below) instead of a
          Tailwind plugin, so it works even if tailwindcss-animate isn't
          installed in this project. */}
      {hovering &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none px-6" style={{ zIndex: 999 }}>
            <style>{`
              @keyframes promptPopupFadeIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes promptPopupZoomIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
            `}</style>
            <div
              className="absolute inset-0"
              style={{ background: "rgba(6,6,8,0.72)", backdropFilter: "blur(10px)", animation: "promptPopupFadeIn 0.2s ease-out" }}
            />
            <div
              className="relative rounded-[24px] overflow-hidden shadow-2xl"
              style={{
                width: showVideo ? "min(680px, 88vw)" : "min(520px, 88vw)",
                aspectRatio: showVideo ? "16 / 9" : "4 / 3",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "#0B0B0B",
                animation: "promptPopupZoomIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {showVideo ? (
                <video
                  ref={popupVideoRef}
                  src={videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  onError={() => setVideoFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

/* ---------------------------------------------------------------------- */
/*  Hero — banner + title + search all in one, sits right under the header */
/* ---------------------------------------------------------------------- */
const HeroBanner = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    toast({ title: "Searching marketplace", description: `Looking up "${query}"...` });
  };

  return (
    <div className="relative w-full overflow-hidden rounded-[28px]" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
      <img
        src={BANNERS.hero}
        alt="Prompt Marketplace"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(6,6,8,0.55) 0%, rgba(6,6,8,0.78) 55%, rgba(6,6,8,0.94) 100%)" }}
      />

      {/* Connect wallet pill */}
      <button
        className="absolute top-5 right-5 flex items-center gap-2 text-[12px] font-medium text-white px-4 py-2 rounded-full"
        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(6px)" }}
      >
        <Wallet className="h-3.5 w-3.5" />
        Connect Wallet
      </button>

      {/* Floating asset card */}
      <div
        className="hidden lg:block absolute bottom-8 right-8 rounded-2xl px-4 py-3 text-white"
        style={{ background: "rgba(15,15,17,0.55)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}
      >
        <p className="text-[11px] text-white/60">Asset ID: <span className="text-white/90">#9982</span></p>
        <p className="text-[11px] text-white/60">Creator: <span className="text-white/90">NeonForge</span></p>
        <p className="text-[11px] text-white/60">Current Bid: <span className="font-semibold" style={{ color: "#22D3EE" }}>1.5 ETH</span></p>
      </div>

      <div className="relative z-10 px-6 sm:px-10 py-16 sm:py-24 flex flex-col items-center text-center">
        <Eyebrow icon={<TrendingUp className="h-4 w-4" />}>GLOBAL LEADERBOARD</Eyebrow>

        <h1
          className="mt-4 text-white text-[32px] sm:text-[44px] md:text-[52px] font-semibold leading-[1.05]"
          style={{ fontFamily: "Inter" }}
        >
          Prompt{" "}
          <span style={{ background: GRADIENT_90, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Marketplace
          </span>
        </h1>

        <p className="mt-4 text-white/75 max-w-[560px] text-[14px] sm:text-[15px] leading-relaxed">
          Access 310k+ high-quality AI prompts for art, logic, architecture, and business optimization.
        </p>

        {/* Search */}
        <form
          className="mt-8 flex items-center w-full max-w-[700px] h-[46px] sm:h-[50px] rounded-[200px] overflow-hidden px-2"
          style={{ background: "rgba(18,18,19,0.85)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            handleSearch(String(data.get("q") ?? ""));
          }}
        >
          <Search className="h-5 w-5 text-white/40 ml-2" />
          <input
            name="q"
            placeholder="Search prompts for 'Hyper-realistic architecture'..."
            className="ml-3 flex-1 bg-transparent outline-none text-white placeholder:text-white/40 text-sm"
          />
          <button
            type="submit"
            className="text-white font-medium text-sm"
            style={{ width: "90px", height: "36px", borderRadius: "200px", background: GRADIENT_90 }}
          >
            Search
          </button>
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate("/marketplace/trending")}
            className="flex items-center gap-2 h-11 px-6 rounded-full text-white text-[13px] font-semibold"
            style={{ background: GRADIENT_90 }}
          >
            Browse Collection
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[12, 32, 47].map((imgId) => (
                <img
                  key={imgId}
                  src={`https://i.pravatar.cc/64?img=${imgId}`}
                  alt=""
                  className="w-7 h-7 rounded-full border-2 object-cover"
                  style={{ borderColor: "#0B0B0B" }}
                />
              ))}
            </div>
            <span className="text-[12px] text-white/60">Used by 12k+ creators today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------- */
/*  "Create an AI app using prompts" promo strip                          */
/* ---------------------------------------------------------------------- */
const CreateAppBanner = () => {
  const navigate = useNavigate();

  return (
    <div
      className="relative overflow-hidden rounded-[24px] px-6 sm:px-8 py-6 sm:py-7 flex flex-col sm:flex-row items-center justify-between gap-5"
      style={{ background: "linear-gradient(120deg, #14141A 0%, #1C1420 60%, #14141A 100%)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center gap-4 text-center sm:text-left">
        <div className="w-12 h-12 rounded-2xl grid place-items-center shrink-0" style={{ background: GRADIENT }}>
          <Rocket className="h-6 w-6 text-white" />
        </div>
        <div>
          <h4 className="text-white text-[17px] font-semibold">Create an AI app using prompts</h4>
          <p className="text-white/60 text-[13px] mt-1 max-w-[420px]">
            Turn any prompt into a shareable AI app in minutes — no code required.
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate("/marketplace/apps/new")}
        className="shrink-0 h-11 px-6 rounded-full text-white text-[13px] font-semibold"
        style={{ background: GRADIENT_90 }}
      >
        Get Started
      </button>
    </div>
  );
};

/* ---------------------------------------------------------------------- */
/*  Generic scrollable prompt row (Newest / Most Popular / T-Shirt, etc.) */
/* ---------------------------------------------------------------------- */
const PromptCard = ({ prompt, onGet }: { prompt: Prompt; onGet: () => void }) => (
  <Card
    className="shrink-0 overflow-hidden transition-transform duration-300 hover:-translate-y-1"
    style={{ width: 240, borderRadius: 20, background: "#1C1C1C", border: "1px solid rgba(255,255,255,0.1)" }}
  >
    <CardContent className="p-3">
      <PromptMedia imageUrl={prompt.imageUrl} videoUrl={prompt.videoUrl} className="w-full h-[140px] rounded-[14px] overflow-hidden">
        <div
          className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
          style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          {prompt.model}
        </div>
      </PromptMedia>

      <h4 className="mt-3 text-[14px] font-semibold text-white leading-snug">{prompt.title}</h4>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[14px] font-semibold" style={{ color: "#22D3EE" }}>{prompt.price}</span>
        <button
          onClick={onGet}
          className="text-[12px] font-medium text-white px-3 py-1.5 rounded-full"
          style={{ background: "#333335" }}
        >
          Get Prompt
        </button>
      </div>
    </CardContent>
  </Card>
);

const PromptRow = ({
  eyebrowIcon,
  eyebrow,
  title,
  exploreHref,
  items,
}: {
  eyebrowIcon: ReactNode;
  eyebrow: string;
  title: string;
  exploreHref: string;
  items: Prompt[];
}) => {
  const railRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const scroll = (dir: "left" | "right") =>
    railRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });

  const handleGetPrompt = (t: string) =>
    toast({ title: "Added to cart", description: `"${t}" is ready for checkout.` });

  return (
    <section>
      <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
        <div>
          <Eyebrow icon={eyebrowIcon}>{eyebrow}</Eyebrow>
          <h3 className="mt-2 text-white text-[22px] sm:text-[26px] font-semibold">{title}</h3>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(exploreHref)}
            className="flex items-center gap-1 text-[13px] font-medium"
            style={{ color: "#22D3EE" }}
          >
            Explore all
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
          <ArrowNav onLeft={() => scroll("left")} onRight={() => scroll("right")} />
        </div>
      </div>

      <div ref={railRef} className="flex gap-5 overflow-x-auto scroll-smooth pb-2 no-scrollbar">
        {items.map((p) => (
          <PromptCard key={p.id} prompt={p} onGet={() => handleGetPrompt(p.title)} />
        ))}
      </div>
    </section>
  );
};

/* ---------------------------------------------------------------------- */
/*  Featured prompts (2-up grid)                                          */
/* ---------------------------------------------------------------------- */
const FeaturedSection = () => {
  const handleQuickView = (title: string) =>
    toast({ title: "Quick view", description: `Opening preview for "${title}".` });

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <div>
          <Eyebrow icon={<ShieldCheck className="h-4 w-4" />}>VERIFIED EXCELLENCE</Eyebrow>
          <h3 className="mt-2 text-white text-[22px] sm:text-[26px] font-semibold">Featured Prompts</h3>
        </div>
      </div>
      <p className="text-white/60 text-[13px] max-w-[520px] mb-6">
        Curated selection of professional-grade prompts hand-picked by our prompt engineering specialists.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredPrompts.map((p) => (
          <Card
            key={p.id}
            className="overflow-hidden transition-transform duration-300 hover:-translate-y-1"
            style={{ borderRadius: 24, background: "#1C1C1C", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <CardContent className="p-0">
              <PromptMedia imageUrl={p.imageUrl} videoUrl={p.videoUrl} className="w-full h-[220px]">
                <div
                  className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-semibold text-white"
                  style={{ background: p.badge === "STAFF PICK" ? "rgba(255,255,255,0.15)" : GRADIENT, backdropFilter: "blur(4px)" }}
                >
                  {p.badge}
                </div>
              </PromptMedia>

              <div className="p-6">
                <div className="flex items-center gap-2 text-[11px] text-white/50 mb-2">
                  <span>{p.model}</span>
                  <span>•</span>
                  <span>{p.category}</span>
                </div>

                <h4 className="text-[18px] font-semibold text-white">{p.title}</h4>
                <p className="mt-2 text-[13px] leading-relaxed text-white/65 max-w-[420px]">{p.description}</p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-[18px] font-semibold text-white">{p.price}</span>
                  <button
                    onClick={() => handleQuickView(p.title)}
                    className="flex items-center gap-2 text-[13px] font-medium text-white px-4 py-2 rounded-full"
                    style={{ background: GRADIENT }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Quick View
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

/* ---------------------------------------------------------------------- */
/*  Logo & Brand Identity spotlight                                       */
/* ---------------------------------------------------------------------- */
const BrandIdentitySpotlight = () => {
  const navigate = useNavigate();
  const checklist = [
    "Vector-ready minimalist aesthetics",
    "High-contrast tech branding logic",
    "Corporate color palette consistency",
  ];

  return (
    <div
      className="relative overflow-hidden rounded-[28px] p-8 sm:p-10"
      style={{
        background: "linear-gradient(135deg, #16161A 0%, #1C1C24 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <span
            className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold text-white/85"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            SPECIALIZED PROMPTS
          </span>

          <h3 className="mt-4 text-white text-[26px] sm:text-[30px] font-semibold leading-tight">
            Logo &amp; Brand Identity
            <br />
            <span style={{ background: GRADIENT_90, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Engineered for Pro Designers
            </span>
          </h3>

          <p className="mt-4 text-white/65 text-[14px] leading-relaxed max-w-[440px]">
            Elevate your branding workflow with prompts specifically designed for vector-style
            logos, consistent brand assets, and crystalline geometric designs.
          </p>

          <ul className="mt-5 space-y-2.5">
            {checklist.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[13px] text-white/80">
                <span
                  className="w-5 h-5 rounded-full grid place-items-center shrink-0"
                  style={{ background: "rgba(26,115,232,0.15)" }}
                >
                  <Check className="h-3 w-3" style={{ color: "#1A73E8" }} />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={() => navigate("/marketplace/category/design")}
            className="mt-7 h-11 px-6 rounded-full text-white text-[13px] font-semibold"
            style={{ background: GRADIENT }}
          >
            Explore Brand Prompts
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            <img src={BANNERS.brandIdentity} alt="Logo & Brand Identity AI prompts" className="w-full h-[220px] object-cover" />
            <p className="text-center text-[12px] text-white/60 py-2">Crystalline Logic</p>
          </div>
          <div className="rounded-2xl overflow-hidden self-end" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            <img src={BANNERS.crystal} alt="Retro brand kit" className="w-full h-[170px] object-cover" />
            <p className="text-center text-[12px] text-white/60 py-2">Retro Brand Kit</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------- */
/*  Sell / Hire dual CTA — background photo + glass panel                 */
/* ---------------------------------------------------------------------- */
const GlassCTACard = ({
  bgSeed,
  bgGradient,
  title,
  description,
  ctaLabel,
  ctaBg,
  onClick,
}: {
  bgSeed: string;
  bgGradient: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaBg: string;
  onClick: () => void;
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-[24px]"
      style={{ border: "1px solid rgba(255,255,255,0.08)", background: bgGradient }}
    >
      {!imgFailed && (
        <img
          src={stockImage(bgSeed, 900, 700)}
          alt=""
          onError={() => setImgFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, rgba(10,10,12,0.35) 0%, rgba(8,8,10,0.85) 100%)" }}
      />

      {/* Glass panel floating on top of the background photo */}
      <div
        className="relative m-3 sm:m-4 rounded-[20px] p-6 sm:p-7"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <h4 className="text-white text-[20px] font-semibold">{title}</h4>
        <p className="mt-3 text-white/75 text-[13px] leading-relaxed max-w-[360px]">{description}</p>
        <button
          onClick={onClick}
          className="mt-6 h-10 px-5 rounded-full text-white text-[13px] font-semibold"
          style={{ background: ctaBg }}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
};

const SellHireSection = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GlassCTACard
        bgSeed="sell-your-prompts-bg"
        bgGradient="linear-gradient(135deg, #1C1620 0%, #14141A 100%)"
        title="Sell your prompts"
        description="Upload your prompts, connect with Stripe, and join a global community of elite prompt engineers. Become a seller in just 2 minutes."
        ctaLabel="Start Selling"
        ctaBg={GRADIENT}
        onClick={() => navigate("/marketplace/sell")}
      />

      <GlassCTACard
        bgSeed="hire-an-ai-expert-bg"
        bgGradient="linear-gradient(135deg, #101A1E 0%, #14141A 100%)"
        title="Hire an AI Expert"
        description="Commission custom prompt solutions and fine-tuned AI workflows from world-class prompt engineers for your specific business needs."
        ctaLabel="Find a Creator"
        ctaBg="#1A73E8"
        onClick={() => navigate("/marketplace/experts")}
      />
    </div>
  );
};

/* ---------------------------------------------------------------------- */
/*  Page                                                                  */
/* ---------------------------------------------------------------------- */
const PromptMarketplacePage = () => {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-50">
        <Header />
      </div>

      <div className="container mx-auto px-4 sm:px-6 pb-16">
        {/* Hero sits right at the top — title + search live on the banner itself */}
        <div className="pt-6">
          <HeroBanner />
        </div>

        <div className="space-y-16 mt-16">
          <CreateAppBanner />

          <PromptRow
            eyebrowIcon={<Sparkles className="h-4 w-4" />}
            eyebrow="JUST ADDED"
            title="Newest Prompts"
            exploreHref="/marketplace?sort=newest"
            items={newestPrompts}
          />

          <PromptRow
            eyebrowIcon={<TrendingUp className="h-4 w-4" />}
            eyebrow="TRENDING THIS MONTH"
            title="Most Popular Prompts This Month"
            exploreHref="/marketplace?sort=popular&range=month"
            items={popularThisMonthPrompts}
          />

          <PromptRow
            eyebrowIcon={<Shirt className="h-4 w-4" />}
            eyebrow="APPAREL"
            title="T-Shirt Design Prompts"
            exploreHref="/marketplace/category/tshirt-design"
            items={tshirtDesignPrompts}
          />

          <FeaturedSection />
          <BrandIdentitySpotlight />
          <SellHireSection />
        </div>

        {/* Navigation — parked down here for now so it doesn't break the hero/banner layout above.
            Move this <div> wherever you'd like once you decide where it belongs on this page. */}
        <div className="flex flex-col items-center mt-16">
          <AppNavigation
            activeSection="marketplace"
            onSectionChange={(section) => console.log("Section changed:", section)}
          />
        </div>
      </div>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
};

export default PromptMarketplacePage;