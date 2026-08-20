import { useEffect, useState } from "react";
import { Sparkles, Check, Copy, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DetailsPrompt from "@/components/DetailsPrompt";
import VideoReelCard from "@/components/VideoReelCard";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { mediaUrl } from "@/lib/mediaUrl";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

/* The one category this page lists.
   It is the "Logo & Branding" child of Design, so the listing endpoint has to
   match it against a prompt's `subCategories` — which is why GET /api/prompt/others
   now checks both fields rather than `categories` alone. */
const LOGO_CATEGORY = "Logo & Branding";

/* Shaped to satisfy DetailsPrompt's MarketplacePrompt as well as this page's
   own cards, so opening a listing here doesn't need a second fetch. */
type LogoPrompt = {
  id: string;
  title: string;
  description: string;
  price: number;
  /** List price plus Tokun's fee — what the buyer is actually charged. */
  tokunPrice: number;
  isFree: boolean;
  imageUrl?: string;
  videoUrl?: string;
  category: string;
  rating: number;
  reviewCount: number;
  downloads: number;
  uploaderId?: string;
  uploaderName?: string;
  exclusive?: boolean;
  sold?: boolean;
  sellerVerificationPending?: boolean;
};

const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

const GRADIENTS = [
  ["#1A73E8", "#FF14EF"],
  ["#22D3EE", "#1A73E8"],
  ["#7C3AED", "#FF14EF"],
  ["#19E66C", "#1A73E8"],
  ["#FF14EF", "#7C3AED"],
] as const;

interface BrandLogo {
  name: string;
  industry: string;
  prompt: string;
  variant: number;
  gradient: readonly [string, string];
}

const BRAND_LOGOS: BrandLogo[] = [
  {
    name: "Nova Fintech",
    industry: "Fintech",
    variant: 1,
    gradient: GRADIENTS[0],
    prompt:
      "Minimalist vector logo mark for a fintech startup: a single hexagon outline with a sharp ascending arrow cutting through its center, one gradient color (electric blue to magenta), flat 2D vector style, no text, transparent background, high-contrast corporate look.",
  },
  {
    name: "Quantum Labs",
    industry: "AI Research",
    variant: 2,
    gradient: GRADIENTS[1],
    prompt:
      "Vector logo icon for an AI research lab: two overlapping triangles forming a faceted diamond shape, crystalline geometric style, cool blue monochrome gradient, ultra-minimalist, sharp edges, no text, suitable for dark app icons.",
  },
  {
    name: "Vertex Studio",
    industry: "Design Studio",
    variant: 3,
    gradient: GRADIENTS[2],
    prompt:
      "Clean vector icon mark: a bold angular letterform built from three sharp triangular facets, single-color gradient fill, modern geometric style, flat vector, corporate branding, no extra text.",
  },
  {
    name: "Lumen Health",
    industry: "Healthcare",
    variant: 4,
    gradient: GRADIENTS[3],
    prompt:
      "Vector logo for a healthcare brand: a perfect circle with four thin radiating light-ray cuts through the center forming a subtle cross, soft gradient from teal to blue, minimal medical-tech aesthetic, flat icon, no text.",
  },
  {
    name: "Orbit Logistics",
    industry: "Logistics",
    variant: 5,
    gradient: GRADIENTS[4],
    prompt:
      "Minimalist vector icon: two concentric orbital rings with a single solid node on the outer ring, representing movement and logistics, monochrome gradient (charcoal to electric blue), flat vector, high contrast, corporate tech feel.",
  },
  {
    name: "Prism Media",
    industry: "Media & Entertainment",
    variant: 6,
    gradient: GRADIENTS[0],
    prompt:
      "Vector brand mark: an isometric triangular prism split into three flat color facets suggesting light refraction, gradient from magenta to blue, crystalline geometric design, no text, clean corporate vector icon.",
  },
  {
    name: "Apex Ventures",
    industry: "Venture Capital",
    variant: 7,
    gradient: GRADIENTS[1],
    prompt:
      "Vector logo icon for a venture capital firm: a single sharp triangular peak with a thin horizontal baseline, bold minimalist geometry, one solid gradient tone, high-contrast corporate branding, flat vector, no text.",
  },
  {
    name: "Nexus Robotics",
    industry: "Robotics & Automation",
    variant: 8,
    gradient: GRADIENTS[2],
    prompt:
      "Vector icon for a robotics company: three small hexagons interlocked around a central node forming a network symbol, precise geometric vector lines, cool gradient (blue to violet), minimalist tech branding, flat design, no text.",
  },
  {
    name: "Zenith Realty",
    industry: "Real Estate",
    variant: 9,
    gradient: GRADIENTS[3],
    prompt:
      "Minimalist vector logo for a real estate brand: three ascending triangular shapes forming an abstract skyline silhouette, single gradient fill, flat corporate vector style, clean negative space, no text.",
  },
  {
    name: "Flux Energy",
    industry: "Clean Energy",
    variant: 10,
    gradient: GRADIENTS[4],
    prompt:
      "Vector logo mark for a clean energy brand: a continuous looping arrow forming an infinity-like curve with a gradient stroke (green to electric blue), smooth vector curves, minimalist and modern, flat icon, no text.",
  },
];

const LogoMark = ({ variant, gradient, id }: { variant: number; gradient: readonly [string, string]; id: string }) => {
  const gradId = `brand-grad-${id}`;
  const stroke = `url(#${gradId})`;

  const shapes: Record<number, JSX.Element> = {
    1: (
      <>
        <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="none" stroke={stroke} strokeWidth={4} />
        <path d="M30 60 L48 40 L58 50 L75 28" fill="none" stroke={stroke} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    2: (
      <>
        <polygon points="50,12 82,50 50,88 18,50" fill="none" stroke={stroke} strokeWidth={4} />
        <line x1="50" y1="12" x2="50" y2="88" stroke={stroke} strokeWidth={3} />
        <line x1="18" y1="50" x2="82" y2="50" stroke={stroke} strokeWidth={3} />
      </>
    ),
    3: (
      <>
        <polygon points="50,12 78,88 50,66 22,88" fill="none" stroke={stroke} strokeWidth={4} strokeLinejoin="round" />
      </>
    ),
    4: (
      <>
        <circle cx="50" cy="50" r="34" fill="none" stroke={stroke} strokeWidth={4} />
        <line x1="50" y1="16" x2="50" y2="34" stroke={stroke} strokeWidth={4} strokeLinecap="round" />
        <line x1="50" y1="66" x2="50" y2="84" stroke={stroke} strokeWidth={4} strokeLinecap="round" />
        <line x1="16" y1="50" x2="34" y2="50" stroke={stroke} strokeWidth={4} strokeLinecap="round" />
        <line x1="66" y1="50" x2="84" y2="50" stroke={stroke} strokeWidth={4} strokeLinecap="round" />
      </>
    ),
    5: (
      <>
        <circle cx="50" cy="50" r="36" fill="none" stroke={stroke} strokeWidth={3} />
        <circle cx="50" cy="50" r="22" fill="none" stroke={stroke} strokeWidth={3} />
        <circle cx="86" cy="50" r="5" fill={stroke} />
      </>
    ),
    6: (
      <>
        <polygon points="50,14 84,74 16,74" fill="none" stroke={stroke} strokeWidth={4} strokeLinejoin="round" />
        <line x1="50" y1="14" x2="50" y2="74" stroke={stroke} strokeWidth={3} />
      </>
    ),
    7: (
      <>
        <polygon points="50,14 82,80 18,80" fill="none" stroke={stroke} strokeWidth={4} strokeLinejoin="round" />
        <line x1="26" y1="80" x2="74" y2="80" stroke={stroke} strokeWidth={4} strokeLinecap="round" />
      </>
    ),
    8: (
      <>
        <polygon points="50,30 62,37 62,51 50,58 38,51 38,37" fill="none" stroke={stroke} strokeWidth={3} />
        <polygon points="24,58 36,65 36,79 24,86 12,79 12,65" fill="none" stroke={stroke} strokeWidth={3} />
        <polygon points="76,58 88,65 88,79 76,86 64,79 64,65" fill="none" stroke={stroke} strokeWidth={3} />
        <line x1="44" y1="54" x2="30" y2="62" stroke={stroke} strokeWidth={2.5} />
        <line x1="56" y1="54" x2="70" y2="62" stroke={stroke} strokeWidth={2.5} />
      </>
    ),
    9: (
      <>
        <polygon points="20,82 20,54 32,54 32,82" fill="none" stroke={stroke} strokeWidth={3.5} />
        <polygon points="40,82 40,34 56,34 56,82" fill="none" stroke={stroke} strokeWidth={3.5} />
        <polygon points="64,82 64,46 80,46 80,82" fill="none" stroke={stroke} strokeWidth={3.5} />
      </>
    ),
    10: (
      <path
        d="M28 60 C10 60 10 40 28 40 C46 40 54 60 72 60 C90 60 90 40 72 40"
        fill="none"
        stroke={stroke}
        strokeWidth={5}
        strokeLinecap="round"
      />
    ),
  };

  return (
    <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradient[0]} />
          <stop offset="100%" stopColor={gradient[1]} />
        </linearGradient>
      </defs>
      {shapes[variant] || shapes[1]}
    </svg>
  );
};

const LogoPromptCard = ({ logo }: { logo: BrandLogo }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(logo.prompt);
      setCopied(true);
      toast({ title: "Product copied", description: `Ready to paste into Smartgen.` });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Could not copy" });
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div
        className="h-[160px] flex items-center justify-center shrink-0"
        style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.06), transparent 70%), #0B0B0D" }}
      >
        <LogoMark variant={logo.variant} gradient={logo.gradient} id={String(logo.variant)} />
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <div className="text-white font-semibold text-[15px]">{logo.name}</div>
          <div className="text-white/40 text-[11px] mt-0.5">{logo.industry}</div>
        </div>

        <div
          className="rounded-xl p-3 text-[12px] leading-relaxed text-white/60 flex-1"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {logo.prompt}
        </div>

        <button
          onClick={handleCopy}
          className="h-9 rounded-lg flex items-center justify-center gap-2 text-[12px] font-medium text-white transition-colors"
          style={{ background: copied ? "rgba(25,230,108,0.12)" : "rgba(255,255,255,0.06)", border: `1px solid ${copied ? "rgba(25,230,108,0.3)" : "rgba(255,255,255,0.1)"}`, color: copied ? "#19E66C" : undefined }}
        >
          {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy Product"}
        </button>
      </div>
    </div>
  );
};

const BrandPromptsPage = () => {
  const navigate = useNavigate();

  /* Real listings, not the hardcoded BRAND_LOGOS set this page used to show.
     Those ten were mock concepts with SVG marks drawn in this file — nothing a
     buyer could open or purchase, and nothing a seller could get listed on. */
  const [logoPrompts, setLogoPrompts] = useState<LogoPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  /* For the cards: the cart the whole app shares, and who is looking — a seller
     browsing this page must not be offered their own listing. */
  const { addToCart } = useCart();
  const { user } = useAuth() as any;
  const currentUserId = user?._id || user?.id || null;

  /* Opening a card used to navigate to /prompt-marketplace?prompt=<id> and let
     that page open the panel — so looking at one logo prompt cost a full page
     load and dumped you on a different screen, with the whole marketplace
     behind the modal. The panel is a component; it opens here. */
  const [detailsPrompt, setDetailsPrompt] = useState<LogoPrompt | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const res = await fetch(
          `${API_BASE}/api/prompt/others?category=${encodeURIComponent(LOGO_CATEGORY)}`,
          { credentials: "include" }
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (!res.ok || !data?.success) {
          throw new Error(data?.error || "Couldn't load logo prompts.");
        }

        setLogoPrompts(
          (data.prompts || []).map((doc: any) => {
            const att = doc?.attachment || null;
            const media = att?.path ? mediaUrl(att.path) : undefined;
            return {
              id: String(doc._id),
              title: doc.title || "Untitled",
              description: doc.description || "",
              /* The card shows what the buyer pays, but the details panel
                 breaks the fee out and needs both figures — it was reading the
                 fee-inclusive number as the list price and showing the fee
                 twice. */
              price: Number(doc.price ?? 0),
              tokunPrice: Number(doc.tokun_price ?? doc.price ?? 0),
              isFree: !!doc.free,
              imageUrl: att?.type === "image" ? media : undefined,
              videoUrl: att?.type === "video" ? media : undefined,
              category: doc.categories?.[0]?.name || LOGO_CATEGORY,
              /* Buyer reviews first, the legacy embedded field second — the
                 same order mapPromptDoc uses in the marketplace. Reading
                 averageRating alone showed no stars here for a product that
                 has a score everywhere else. */
              rating: Number(doc.reviewAverage ?? doc.averageRating ?? 0),
              reviewCount: Number(doc.reviewCount ?? 0),
              downloads: Number(doc.downloads ?? 0),
              uploaderId: doc?.userId?._id ? String(doc.userId._id) : undefined,
              uploaderName: doc?.userId?.name || "",
              exclusive: !!doc.exclusive,
              sold: !!doc.sold,
              sellerVerificationPending: !!doc.sellerVerificationPending,
            };
          })
        );
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message || "Couldn't load logo prompts.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const checklist = [
    "Vector-ready minimalist aesthetics",
    "High-contrast tech branding logic",
    "Corporate color palette consistency",
  ];

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Header is `sticky top-0` on its own -- nesting a second sticky at
          the same offset makes the two fight and the bar jitters on scroll. */}
      <Header />

      <div className="container mx-auto px-4 sm:px-6 pb-20">
        <div className="pt-14 pb-12 text-center max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            <span
              className="px-3 py-1 rounded-full text-[11px] font-semibold text-white/85"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              SPECIALIZED PROMPTS
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Logo &amp; Brand Identity
            <br />
            <span style={{ background: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Engineered for Pro Designers
            </span>
          </h1>

          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            Elevate your branding workflow with products specifically designed for vector-style logos,
            consistent brand assets, and crystalline geometric designs.
          </p>

          <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {checklist.map((item) => (
              <li key={item} className="flex items-center gap-2 text-[13px] text-white/75">
                <span className="w-5 h-5 rounded-full grid place-items-center shrink-0" style={{ background: "rgba(26,115,232,0.15)" }}>
                  <Check className="h-3 w-3" style={{ color: "#1A73E8" }} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-4 w-4" style={{ color: "#22D3EE" }} />
          <span className="text-[12px] font-semibold tracking-wide" style={{ color: "#22D3EE" }}>
            {loading
              ? "LOADING LOGO PROMPTS…"
              : `${logoPrompts.length} LOGO ${logoPrompts.length === 1 ? "PROMPT" : "PROMPTS"} ON THE MARKETPLACE`}
          </span>
        </div>

        {loading && <p className="text-white/50 text-sm py-10 text-center">Loading…</p>}

        {!loading && loadError && (
          <p className="text-red-400 text-sm py-10 text-center">{loadError}</p>
        )}

        {/* Empty is a real state here, and the old copy explained only half of
            it: picking "{LOGO_CATEGORY}" during upload is necessary but not
            sufficient. Every new listing also waits on the prompt-media check
            before the marketplace — and therefore this page — will show it, so
            a seller who had just uploaded read "tag it while uploading" as
            "your tag didn't save". */}
        {!loading && !loadError && logoPrompts.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-white/70 text-sm">No logo products listed yet.</p>
            <p className="text-white/40 text-xs mt-2 max-w-md mx-auto leading-relaxed">
              A product shows up here once its Creator files it under Design →
              "{LOGO_CATEGORY}" and it clears the media review every new listing
              goes through. Just uploaded one? It appears as soon as that review
              passes.
            </p>
          </div>
        )}

        {!loading && !loadError && logoPrompts.length > 0 && (
          /* The same card as the marketplace, the profile, the saved list and
             My Products — see VideoReelCard. This page had its own: a 180px
             thumbnail with the title, description and price stacked under it,
             so a logo product looked like a different kind of thing here than
             it did anywhere else, and it carried no cart or buy button at all.

             items-start so a reel keeps its 9:16 shape; grid items stretch to
             the tallest in the row by default, which overrides the card's
             aspect-ratio. */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start">
            {logoPrompts.map((p) => (
              <VideoReelCard
                key={p.id}
                prompt={p}
                isPurchased={false}
                isOwn={!!p.uploaderId && String(p.uploaderId) === String(currentUserId || "")}
                hasPayoutSetup={p.sellerVerificationPending ? false : undefined}
                onVideoPlay={() => {}}
                onAddToCart={async () => {
                  const result = await addToCart(String(p.id));
                  toast(
                    result.ok
                      ? { title: "Added to Cart", description: `"${p.title}" was added.` }
                      : {
                          title:
                            result.error === "already_in_cart"
                              ? "Already in your cart"
                              : "Couldn't add to cart",
                          description: result.message,
                        },
                  );
                }}
                /* Checkout lives on the marketplace — the Razorpay flow is not
                   duplicated per page. Same hand-off the details panel does. */
                onBuyNow={() => navigate(`/prompt-marketplace?prompt=${encodeURIComponent(p.id)}`)}
                onOpenDetails={() => {
                  setDetailsPrompt(p);
                  setDetailsOpen(true);
                }}
                onNavigateToProfile={(id) => id && navigate(`/profile/${id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Same panel the marketplace opens, so a listing looks and behaves
          identically wherever it was found. Add to cart works from here (the
          panel talks to the cart context itself); Buy Now hands off to the
          marketplace, which owns the Razorpay checkout — that flow is not
          duplicated per page. */}
      <DetailsPrompt
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        prompt={detailsPrompt}
        onPurchase={(p) => navigate(`/prompt-marketplace?prompt=${p.id}`)}
      />

      <div className="relative z-10 mt-4">
        <Footer />
      </div>
    </div>
  );
};

export default BrandPromptsPage;
