


// src/pages/PromptHistory.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Upload, Star, Trash ,BadgeDollarSign} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import DetailsPrompt, { MarketplacePrompt } from "./historyDetail";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Prompt = {
  id: number | string;
  title: string;
  description: string;
  category: string;
  price?: number;
  rating?: number;
  downloads?: number;
  imageUrl?: string;
  videoUrl?: string;
  preview?: string;
  isFree?: boolean;
  createdAt?: string;
  uploadedAt?: string;
  purchasedAt?: string;
  sales?: number;
  promptText?: string;
  fullPrompt?: string;
};

const GRAD = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const PURCHASE_BASE = `${API_BASE}/api/purchase`; // [API #3] base

/* ---------- Helpers ---------- */
function formatDate(dateString?: string) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
// Put this near the top (after imports) in PromptHistory.tsx
function pickCategoryFrom(src: any): string | undefined {
  if (!src) return;

  // common single-string fields
  if (typeof src.categoryName === "string" && src.categoryName.trim()) return src.categoryName.trim();
  if (typeof src.category === "string" && src.category.trim()) return src.category.trim();

  // single object with .name
  if (src.category && typeof src.category === "object" && typeof src.category.name === "string") {
    return src.category.name;
  }

  // arrays: objects or strings
  const cats = src.categories;
  if (Array.isArray(cats) && cats.length) {
    const first = cats[0];
    if (typeof first === "string" && first.trim()) return first.trim();
    if (first && typeof first === "object") {
      // try common keys
      if (typeof first.name === "string" && first.name.trim()) return first.name.trim();
      if (typeof first.label === "string" && first.label.trim()) return first.label.trim();
      if (typeof first.title === "string" && first.title.trim()) return first.title.trim();
    }
  }

  return undefined;
}

function resolveCategory(...sources: any[]): string {
  for (const s of sources) {
    const v = pickCategoryFrom(s);
    if (v) return v;
  }
  return "General";
}


function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center mt-6 md:mt-10 lg:mt-14 mb-8">
      <h1 className="text-3xl font-normal">{title}</h1>
      <p className="text-white/60 mt-2 text-sm">{subtitle}</p>
    </div>
  );
}










/* ---------- NEW: Plan banner (gradient) shown in Purchased tab ---------- */
function PlanBanner({
  planLabel = "Active Membership",
  planName = "Free Plan",
  subtitle,
  expiryDate,
  onRenew,
  onUpgrade,
}: {
  planLabel?: string;
  planName?: string;
  subtitle?: string;
  expiryDate?: string;
  onRenew: () => void;
  onUpgrade: () => void;
}) {
  const formattedExpiry = expiryDate
    ? new Date(expiryDate).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div
      className="w-full mt-6 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      style={{
        background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
        boxShadow: "0 10px 30px rgba(26,115,232,0.25)",
      }}
    >
      {/* Left side: Plan info */}
      <div className="text-white">
        <div className="text-sm opacity-90">{planLabel}</div>
        <div className="text-2xl md:text-[28px] leading-none font-semibold mt-1">
          {planName}
        </div>

        {/* Expiry line */}
        {formattedExpiry && (
          <div className="text-sm opacity-90 mt-1">
            Status: Active | Expires on {formattedExpiry}
          </div>
        )}

        {/* Subtitle (optional) */}
        {subtitle && (
          <div className="text-sm opacity-90 mt-1">{subtitle}</div>
        )}
      </div>

      {/* Right side: Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRenew}
          className="h-10 px-4 rounded-lg text-white text-sm font-medium"
          style={{ border: "1px solid rgba(255,255,255,0.55)", background: "transparent" }}
        >
          Renew
        </button>
        <button
          onClick={onUpgrade}
          className="h-10 px-4 rounded-lg text-sm font-semibold"
          style={{ background: "#FFFFFF", color: "#111" }}
        >
          ⚡ Upgrade plan
        </button>
      </div>
    </div>
  );
}


/* ---------- NEW: Subscriptions Page Section ---------- */
type PlanKey = "Free" | "Pro" | "Enterprise";

// reuse your existing GRAD from this file
const SELECTED_CARD_BG =
  "linear-gradient(180deg, rgba(255, 20, 239, 0.5) 0%, rgba(26, 115, 232, 0.5) 100%)";

const INR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

function SubscriptionsSection({
  user,
  onRenew,
  onUpgrade,
}: {
  user: any;
  onRenew: () => void;
  onUpgrade: () => void;
}) {
  const [annual, setAnnual] = useState(false);
  const [selected, setSelected] = useState<PlanKey>("Pro");

  const prices = { Free: 0, Pro: 799, Enterprise: 7999 } as const;
  const tokens = { Free: "5,000", Pro: "100,000", Enterprise: "1,000,000" } as const;

  const priceFor = (p: PlanKey) => {
    const m = prices[p];
    const v = annual ? Math.round(m * 0.8) : m; // same discount logic as your page
    return `${INR(v)}/month`;
  };

  const currentPlan =
    user?.plan
      ? `${String(user.plan).charAt(0).toUpperCase() + String(user.plan).slice(1)} Plan`
      : "Free Plan";

  return (
    <div className="mt-2">
      {/* ✅ Current plan banner */}
      <PlanBanner
        planLabel="Active Membership"
        planName={currentPlan}
        expiryDate={user?.currentPeriodEnd}
        subtitle="Your active subscription details"
        onRenew={onRenew}
        onUpgrade={onUpgrade}
      />

      {/* ✅ Billing toggle (same style concept) */}
      <div className="mt-8 mb-8 flex items-center justify-center gap-4 sm:gap-6 text-[12px]">
        <span className="leading-none">Billed monthly</span>
        <Switch
          id="billing-sub-tab"
          checked={annual}
          onCheckedChange={setAnnual}
          className={[
            "relative inline-flex h-5 w-9 rounded-full border border-white/20 transition-colors",
            "data-[state=checked]:border-transparent",
            "[&>span]:pointer-events-none [&>span]:block [&>span]:h-4 [&>span]:w-4 [&>span]:rounded-full [&>span]:bg-white [&>span]:transition-transform",
            "[&>span]:translate-x-0.5 data-[state=checked]:[&>span]:translate-x-[18px]",
          ].join(" ")}
          style={annual ? { background: GRAD } : { background: "#17171A" }}
        />
        <span className="leading-none">
          Billed yearly <span>(Save up to 20%)</span>
        </span>
      </div>

      {/* ✅ Your 3 real plan cards */}
   <div className="mt-0 flex justify-center">
  <div className="grid grid-cols-1 sm:grid-cols-[repeat(3,250px)] gap-3">

  
        <PlanCard
          selected={selected === "Free"}
          onSelect={() => setSelected("Free")}
          onChoose={() => {
            setSelected("Free");
            onUpgrade(); // hook your real flow later
          }}
          title="Free"
          subtitle="(Individuals)"
          price={priceFor("Free")}
          tokens={tokens.Free}
          extras={[{ label: "Extra Tokens Feature", value: "No" }]}
        />

        <PlanCard
          selected={selected === "Pro"}
          onSelect={() => setSelected("Pro")}
          onChoose={() => {
            setSelected("Pro");
            onUpgrade();
          }}
          title="Pro"
          subtitle="(Individuals)"
          price={priceFor("Pro")}
          tokens={tokens.Pro}
          highlight="Most Popular"
          extras={[
            { label: "Extra Tokens Feature", value: "Yes" },
            { label: "No. of Extra Tokens", value: "50,000" },
            { label: "Extra Token Price", value: "₹200" },
          ]}
        />

        <PlanCard
          selected={selected === "Enterprise"}
          onSelect={() => setSelected("Enterprise")}
          onChoose={() => {
            setSelected("Enterprise");
            onUpgrade();
          }}
          title="Enterprise"
          subtitle="(Organization)"
          price={priceFor("Enterprise")}
          tokens={tokens.Enterprise}
          extras={[
            { label: "Extra Tokens Feature", value: "Yes" },
            { label: "No. of Extra Tokens", value: "100,000" },
            { label: "Extra Token Price", value: "₹199" },
          ]}
        />
      </div>
       </div>
      {/* Optional small note line */}
      <p className='text-center text-[11px] mt-6 font-["Inter"] leading-[1]'>
        {annual ? "Billed yearly (Save up to 20%)" : " "}
      </p>
    </div>
  );
}



function PlanCard({
  selected,
  onSelect,
  onChoose,
  title,
  subtitle,
  price,
  tokens,
  extras,
  highlight,
}: {
  selected: boolean;
  onSelect: () => void;
  onChoose: () => void;
  title: string;
  subtitle: string;
  price: string; // e.g. "₹799/month"
  tokens: string;
  extras: { label: string; value: string }[];
  highlight?: string;
}) {
  const [amount, per] = price.split("/");

  return (
    <Card
      onClick={onSelect}
      className="relative cursor-pointer flex flex-col"
      style={{
        width: 250,
        height: 400,
        borderRadius: 16,
        border: "1px solid #35343C",
        background: selected ? SELECTED_CARD_BG : "#0D0D0E",
        color: "#FFFFFF",
      }}
    >
      {highlight && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full text-[10px] font-medium border border-white/25"
          style={{ background: GRAD, color: "#fff" }}
        >
          {highlight}
        </div>
      )}

      <CardHeader className="pt-5 pb-2">
        <div className="space-y-3">
          <CardTitle className='text-center font-["Inter"] font-semibold text-[32px] leading-[1]'>
            {title}
          </CardTitle>
          <div className='text-center font-["Inter"] text-[12px] leading-[1]'>{subtitle}</div>
          <div className="text-center mt-6">
            <span className='font-["Inter"] font-semibold text-[28px] leading-[1]'>{amount}</span>
            <span className='ml-1 align-middle font-["Inter"] font-normal text-[16px] leading-[1]'>
              /{per}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex items-center justify-center">
        <div className="w-[220px] mx-auto">
          <div className='text-center font-["Inter"] text-[16px] leading-[1] whitespace-nowrap'>
            Monthly Tokens: {tokens}
          </div>

          <ul className="mt-4 space-y-2 mx-auto">
            {extras.map((e) => {
              const negative = e.value === "No" || e.value === "—";
              return (
                <li
                  key={e.label}
                  className="grid grid-cols-[16px_max-content_8px_1fr] gap-x-2 items-center"
                >
                  {negative ? (
                    <X className="h-[14px] w-[14px]" />
                  ) : (
                    <Check className="h-[14px] w-[14px]" />
                  )}
                  <span className='font-["Inter"] text-[12px] leading-[1]'>{e.label}</span>
                  <span className='font-["Inter"] text-[12px] leading-[1]'>:</span>
                  <span className='font-["Inter"] text-[12px] leading-[1] font-medium'>
                    {e.value}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>

      <CardFooter className="pt-3 pb-5 flex justify-center">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onChoose();
          }}
          className='font-["Inter"] text-[16px] w-[200px] h-[50px] rounded-[6px]'
          style={
            selected
              ? { background: GRAD, border: "1px solid #FFFFFF", color: "#fff" }
              : { background: "transparent", border: "1px solid #FFFFFF", color: "#fff" }
          }
          variant="ghost"
        >
          Choose Plan
        </Button>
      </CardFooter>
    </Card>
  );
}




/* ---------- Purchased stats (card style + three dropdowns) ---------- */
function PurchasedStatsBar({
  totalCount,
  totalBill,
  years,
  selectedYear,
  onYearChange,
  selectedType, // "All membership" | "Membership" | "Prompts"
  onTypeChange,
  onResetAll,
  currency = "₹",
}: {
  totalCount: number;
  totalBill: number;
  years: (string | number)[];
  selectedYear: string;
  onYearChange: (y: string) => void;
  selectedType: string;
  onTypeChange: (t: string) => void;
  onResetAll: () => void;
  currency?: string;
}) {
  return (
    <div className="mb-6 mt-6">
      {/* Cards (same look as Uploaded) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full rounded-2xl p-5" style={{ background: "#1C1C1C" }}>
          <p className="text-white/85 text-sm">Total purchased Prompt</p>
          <div className="mt-1 text-[22px] font-semibold text-white">{totalCount}</div>
        </div>

        <div className="w-full rounded-2xl p-5" style={{ background: "#1C1C1C" }}>
          <p className="text-white/85 text-sm">Total Bill</p>
          <div className="mt-1 text-[22px] font-semibold text-white">
            {currency}
            {totalBill.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Dropdown row: Year | All membership | All */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 sm:gap-4">
        {/* Year (default 2025, includes All) */}
        <div
          className="h-10 px-4 rounded-xl text-white/90 bg-[#030406] flex items-center"
          style={{ border: "1px solid #FFFFFF" }}
        >
          <select
            className="bg-[#030406] text-white outline-none text-sm"
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
          >
            {years.map((y) => (
              <option key={String(y)} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* All membership (dropdown look, default text) */}
        <div
          className="h-10 px-4 rounded-xl text-white/90 bg-[#030406] flex items-center"
          style={{ border: "1px solid #FFFFFF" }}
        >
          <select
            className="bg-[#030406] text-white outline-none text-sm"
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
          >
            <option>All membership</option>
            <option>Membership</option>
            <option>Prompts</option>
          </select>
        </div>

        {/* All (dropdown look; clicking resets both filters) */}
        <div
          className="h-10 px-4 rounded-xl text-white/90 bg-[#030406] flex items-center"
          style={{ border: "1px solid #FFFFFF" }}
        >
          <select
            className="bg-[#030406] text-white outline-none text-sm"
            value="All"
            onClick={onResetAll}
            onChange={onResetAll as any}
            title="Reset all"
          >
            <option>All</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/* ---------- Empty state ---------- */
function EmptyStateCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Card
      className="relative overflow-hidden"
      style={{
        width: 306,
        height: 520,
        background: "#0B0B0B",
        borderRadius: 30,
        border: "1px solid #111419",
      }}
    >
      <CardContent className="h-full p-4">
        {/* Icon chip (lowered) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-12 w-10 h-10 rounded-full bg-white/10 grid place-items-center">
          <ShoppingCart className="h-5 w-5 text-white/80" />
        </div>

        {/* Center text */}
        <div className="h-full flex flex-col items-center justify-center text-center px-4">
          <div className="mt-8" />
          <p className="text-white/90 text-[15px] font-medium">{title}</p>
          <p className="text-white/70 text-[12.5px] leading-relaxed mt-3">{description}</p>
        </div>

        {/* CTA — centered */}
      <button
  onClick={onClick}
  className="absolute left-1/2 -translate-x-1/2 bottom-6 h-10 px-6 rounded-[12px] text-white text-[14px] font-medium shadow whitespace-nowrap"
  style={{ background: GRAD, maxWidth: "90%" }}
>
  Purchase Prompt
</button>

      </CardContent>
    </Card>
  );
}

/* ---------- Grid Card ---------- */
function HistoryGridCard({
  prompt,
  showImages = true,
  playingVideo,
  onToggleVideo,
  onPreview,
  isUploaded = false,
  onDelete,
}: {
  prompt: Prompt;
  showImages?: boolean;
  playingVideo: number | string | null;
  onToggleVideo: (id: number | string) => void;
  onPreview: (p: Prompt) => void;
  isUploaded?: boolean;
  onDelete?: (p: Prompt) => void;
}) {
  const isPlaying = playingVideo === prompt.id;

  const priceLabel = prompt.isFree ? "FREE" : `₹${(prompt.price ?? 0).toFixed(2)}`;
  const showPurchaseOverlay = !isUploaded && !prompt.fullPrompt; // only if not owned

  return (
    <Card
      key={prompt.id}
      onClick={() => onPreview(prompt)}
      className="overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
      style={{ width: 306, height: 520, background: "#1C1C1C", borderRadius: 30 }}
    >
      <CardContent className="p-4 h-full flex flex-col">
        {/* MEDIA */}
        <div
          className="relative w-full overflow-hidden group"
          style={{ height: 240, borderRadius: 20, backgroundColor: "#0B0B0B" }}
        >
          {showImages ? (
            <img src={prompt.imageUrl} alt={prompt.title} className="w-full h-full object-cover" />
          ) : (
            <>
              <video
                className="w-full h-full object-cover"
                src={prompt.videoUrl}
                loop
                muted
                playsInline
                ref={(el) => {
                  if (!el) return;
                  if (isPlaying) el.play().catch(() => {});
                  else el.pause();
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVideo(prompt.id);
                }}
                className="absolute inset-0 flex items-center justify-center"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                <span className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/75 grid place-items-center text-white transition-colors">
                  {isPlaying ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="5" width="4" height="14" rx="1" />
                      <rect x="14" y="5" width="4" height="14" rx="1" />
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7-11-7z" />
                    </svg>
                  )}
                </span>
              </button>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">0:20</div>
            </>
          )}

          {/* Category pill */}
          <div
            className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
            style={{ background: GRAD }}
          >
            {prompt.category?.toUpperCase()}
          </div>

          {/* Overlay pill area */}
          {isUploaded ? (
            // In uploaded section: show PRICE instead of "PURCHASE TO UNLOCK"
            <div
              className="absolute top-11 left-3 mt-2 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
              style={{ background: GRAD }}
            >
              {priceLabel}
            </div>
          ) : showPurchaseOverlay ? (
            <div
              className="absolute top-11 left-3 mt-2 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
              style={{ background: GRAD }}
            >
              PURCHASE TO UNLOCK
            </div>
          ) : null}

          {/* Rating pill */}
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-white bg-black/40 border border-white/40 backdrop-blur-sm">
              <Star className="h-3.5 w-3.5 text-white" />
              {typeof prompt.rating === "number" ? prompt.rating : "—"}
            </div>
          </div>
        </div>

        {/* TEXT CONTENT */}
        <div className="mt-4">
          {prompt.preview && <p className="text-[12px] text-white/60 line-clamp-1">{prompt.preview}</p>}
          <h3 className="mt-1 text-[18px] leading-snug font-semibold text-white line-clamp-2">{prompt.title}</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-white/70 line-clamp-2">{prompt.description}</p>
        </div>

        {/* FOOTER */}
        {isUploaded ? (
          // Uploaded: price pill on the LEFT, delete icon pill on the RIGHT
          <div className="mt-auto pt-4 flex items-center justify-between">
            <div
              className="flex items-center justify-center"
              style={{ minWidth: 65, height: 40, borderRadius: 50, padding: "0 14px", background: "#333335" }}
            >
              <span className="text-[13px] text-white/90">{priceLabel}</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(prompt);
              }}
              className="flex items-center justify-center"
              style={{ minWidth: 48, height: 40, borderRadius: 50, padding: "0 14px", background: "#333335" }}
              aria-label="Delete prompt"
              title="Delete"
            >
              <Trash className="h-4 w-4 text-white/90" />
            </button>
          </div>
        ) : (
          // Purchased (unchanged): keep icon pill + price pill on the left side
          <div className="mt-auto pt-4 flex items-center gap-3 justify-start">
            <div
              className="flex items-center justify-center"
              style={{ minWidth: 65, height: 40, borderRadius: 50, background: "#333335", padding: "0 10px" }}
            >
              <img src="/icons/cop1.png" alt="cop1" />
            </div>

            <div
              className="flex items-center justify-center"
              style={{ minWidth: 65, height: 40, borderRadius: 50, padding: "0 14px", background: "#333335" }}
            >
              <span className="text-[13px] text-white/90">{priceLabel}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------- Uploaded stats ---------- */
function UploadedStatsBar({
  totalUploads,
  totalEarningsINR,
  years,
  selectedYear,
  onYearChange,
  selectedType,
  onTypeChange,
}: {
  totalUploads: number;
  totalEarningsINR: number;
  years: (string | number)[];
  selectedYear: string;
  onYearChange: (y: string) => void;
  selectedType: string;
  onTypeChange: (t: string) => void;
}) {
  return (
    <div className="mb-6">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full rounded-2xl p-5" style={{ background: "#1C1C1C" }}>
          <p className="text-white/85 text-sm">Total upload Prompt</p>
          <div className="mt-1 text-[22px] font-semibold text-white">{totalUploads}</div>
        </div>

        <div className="w-full rounded-2xl p-5" style={{ background: "#1C1C1C" }}>
          <p className="text-white/85 text-sm">Total Earning</p>
          <div className="mt-1 text-[22px] font-semibold text-white">₹{totalEarningsINR.toFixed(2)}</div>
        </div>
      </div>

   {/* Filters under the cards */}
<div className="mt-4 w-full">
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">

    {/* Year Dropdown */}
  <div
  className="
    w-full sm:w-auto
    h-9 sm:h-10
    px-3 sm:px-4
    rounded-lg sm:rounded-xl
    text-white/90
    bg-[#030406]
    flex items-center
  "
  style={{ border: "1px solid #FFFFFF" }}
>
      <select
        className="
          w-full
          bg-transparent
          text-white
          outline-none
          text-sm
          appearance-none
        "
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
      >
        {years.map((y) => (
          <option key={String(y)} value={String(y)}>
            {y}
          </option>
        ))}
        {!years.includes("All") && <option value="All">All</option>}
      </select>
    </div>

    {/* Type Dropdown */}
   <div
  className="
    w-full sm:w-auto
    h-9 sm:h-10
    px-3 sm:px-4
    rounded-lg sm:rounded-xl
    text-white/90
    bg-[#030406]
    flex items-center
  "
  style={{ border: "1px solid #FFFFFF" }}
>
     <select
  className="
    w-full
    bg-transparent
    text-white
    outline-none
    text-xs sm:text-sm
    appearance-none
  "
  style={{
    colorScheme: "dark" // ✅ fixes white dropdown issue
  }}
  value={selectedYear}
  onChange={(e) => onYearChange(e.target.value)}
>
        <option>All</option>
        <option>Paid</option>
        <option>Free</option>
      </select>
    </div>

  </div>
</div>
    </div>
  );
}

/* ---------- PAGE ---------- */
export default function PromptHistory() {
  // Purchased: LIVE via [API #3] + event updates
  const [purchaseHistory, setPurchaseHistory] = useState<Prompt[]>([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [purchasesError, setPurchasesError] = useState<string | null>(null);
     
  // Uploaded: fetched from API
  const [uploadHistory, setUploadHistory] = useState<Prompt[]>([]);
  const [uploadsLoading, setUploadsLoading] = useState<boolean>(false);
  const [uploadsError, setUploadsError] = useState<string | null>(null);

  // Filters (Uploaded)
  const [yearFilter, setYearFilter] = useState<string>("2025");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const [playingVideo, setPlayingVideo] = useState<number | string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsPrompt, setDetailsPrompt] = useState<MarketplacePrompt | null>(null);
   
   const [deletingIds, setDeletingIds] = useState<Set<string | number>>(new Set());


  const { token, user } = (useAuth?.() as any) || ({} as any);

  // const { token } = (useAuth?.() as any) || ({} as any);

  // URL-driven tab control
   // URL-driven tab control
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = (
    searchParams.get("p") === "purchased"
      ? "purchased"
      : searchParams.get("p") === "subscriptions"
      ? "subscriptions"
      : "uploaded"
  ) as "purchased" | "uploaded" | "subscriptions";

  const [tab, setTab] = useState<"purchased" | "uploaded" | "subscriptions">(initialTab);

  useEffect(() => {
    const p = searchParams.get("p");
    if (p === "purchased" || p === "uploaded" || p === "subscriptions") {
      setTab(p);
    }
  }, [searchParams]);

  const handleTabChange = (v: string) => {
    const next = (
      v === "purchased" ? "purchased" :
      v === "subscriptions" ? "subscriptions" :
      "uploaded"
    ) as "purchased" | "uploaded" | "subscriptions";

    setTab(next);
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set("p", next);
      return sp;
    });
  };


  // Purchased filters
  const [purchasedYear, setPurchasedYear] = useState<string>("2025");
  const [purchasedType, setPurchasedType] = useState<string>("All membership");

  // Years for the dropdown (includes base + detected + "All")
  const purchaseYears = useMemo(() => {
    const years = new Set<string>();
    purchaseHistory.forEach((p) => {
      const y = p.purchasedAt ? String(new Date(p.purchasedAt).getFullYear()) : undefined;
      if (y) years.add(y);
    });
    const base = ["2025", "2024", "2023"];
    const merged = Array.from(new Set([...base, ...Array.from(years)]));
    return [...merged, "All"];
  }, [purchaseHistory]);

  // Totals for Purchased (use pricePaid mapped into .price)
  const totalPurchasedCount = purchaseHistory.length;
  const totalPurchasedBill = purchaseHistory.reduce((sum, p) => sum + (p.price || 0), 0);

  const onToggleVideo = (id: number | string) => setPlayingVideo((prev) => (prev === id ? null : id));

  const openDetails = (p: Prompt) => {
    setDetailsPrompt(p as unknown as MarketplacePrompt);
    setDetailsOpen(true);
  };

  // [API #3] GET /api/purchase/history → map to Prompt-like items
  const fetchPurchaseHistory = async () => {
    if (!token) return;
    try {
      setPurchasesLoading(true);
      setPurchasesError(null);

      const res = await fetch(`${PURCHASE_BASE}/history`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const body = await res.json();

      if (!res.ok || !body?.success) {
        throw new Error(body?.error || "server_error");
      }

const mapped: Prompt[] = (body.purchases || []).map((p: any) => {
  const snap = p?.promptSnapshot || {};
  const pop = p?.prompt;

  const promptId =
    (pop && typeof pop === "object" && pop._id) ||
    (typeof pop === "string" ? pop : p?._id);

  const title =
    (pop && typeof pop === "object" && pop.title) ||
    snap.title ||
    "Untitled";

  const description = snap.description || "";
  const promptText = snap.promptText || "";
  const fullPrompt = snap.promptText || undefined; // owned → full
  const pricePaid =
    typeof p?.pricePaid === "number" ? p.pricePaid : snap.originalPrice || 0;
  const isFree = snap.originalPrice === 0 || pricePaid === 0;

  const att = snap.attachment || null;
  // const mediaPath = att?.path ? `${API_BASE}${att.path}` : undefined;
     const mediaPath = att?.path || undefined;
  const imageUrl = att?.type === "image" ? mediaPath : undefined;
  const videoUrl = att?.type === "video" ? mediaPath : undefined;

  // ✅ Correct category resolution (prompt → snapshot → purchase record)
  const category = resolveCategory(pop, snap, p);

  return {
    id: String(promptId || p._id),
    title,
    description,
    category,
    price: pricePaid,
    imageUrl,
    videoUrl,
    preview: description || (promptText ? String(promptText).slice(0, 140) : ""),
    isFree,
    purchasedAt: p?.purchasedAt,
    promptText,
    fullPrompt,
  } as Prompt;
});



      mapped.sort((a, b) => {
        const ta = a.purchasedAt ? new Date(a.purchasedAt).getTime() : 0;
        const tb = b.purchasedAt ? new Date(b.purchasedAt).getTime() : 0;
        return tb - ta;
      });

      setPurchaseHistory(mapped);
    } catch (err: any) {
      setPurchasesError(err?.message || "Failed to load purchase history");
      toast({
        title: "Couldn’t load purchases",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchasesLoading(false);
    }
  };

  // Initial fetch + live update on tokun:purchased
  useEffect(() => {
    fetchPurchaseHistory();

    const onNewPurchase = (e: any) => {
      try {
        const purchase = e?.detail;
        if (!purchase) return;

        const snap = purchase?.promptSnapshot || {};
        const pop = purchase?.prompt;

        const promptId =
          (pop && typeof pop === "object" && pop._id) ||
          (typeof pop === "string" ? pop : purchase?._id);

        const title =
          (pop && typeof pop === "object" && pop.title) ||
          snap.title ||
          "Untitled";

        const description = snap.description || "";
        const promptText = snap.promptText || "";
        const fullPrompt = snap.promptText || undefined;
        const pricePaid =
          typeof purchase?.pricePaid === "number" ? purchase.pricePaid : snap.originalPrice || 0;
        const isFree = snap.originalPrice === 0 || pricePaid === 0;

        const att = snap.attachment || null;
      const mediaPath = att?.path || undefined;
        const imageUrl = att?.type === "image" ? mediaPath : undefined;
        const videoUrl = att?.type === "video" ? mediaPath : undefined;

     const mappedOne: Prompt = {
  id: String(promptId || purchase._id),
  title,
  description,
  category: resolveCategory(pop, snap, purchase), // ✅ use the helper here too
  price: pricePaid,
  imageUrl,
  videoUrl,
  preview: description || (promptText ? String(promptText).slice(0, 140) : ""),
  isFree,
  purchasedAt: purchase?.purchasedAt,
  promptText,
  fullPrompt,
};


        setPurchaseHistory((prev) => {
          if (prev.some((x) => String(x.id) === String(mappedOne.id))) return prev;
          return [mappedOne, ...prev];
        });
      } catch (e) {
        // noop
      }
    };

    window.addEventListener("tokun:purchased" as any, onNewPurchase);
    return () => window.removeEventListener("tokun:purchased" as any, onNewPurchase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Uploaded: fetched from API
  useEffect(() => {
    const loadUploads = async () => {
      try {
        setUploadsLoading(true);
        setUploadsError(null);

        const res = await fetch(`${API_BASE}/api/prompt/my`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || "server_error");
        }

        const mapped: Prompt[] = (data.prompts || []).map((doc: any) => {
          const id = doc._id;
          const title = doc.title || "Untitled";
          const description = doc.description || "";
          const promptText = doc.promptText || "";
          const fullPrompt = promptText;
          const price = Number(doc.price || 0);
          const isFree = !!doc.free;
          const rating = typeof doc.averageRating === "number" ? doc.averageRating : 0;
          const uploadedAt = doc.createdAt;
          const category =
            (doc.categories?.[0]?.name as string) ||
            (Array.isArray(doc.categories) ? doc.categories.join(", ") : "") ||
            "General";

          const att = doc.attachment || null;
         const mediaPath = att?.path || undefined;
          const imageUrl = att?.type === "image" ? mediaPath : undefined;
          const videoUrl = att?.type === "video" ? mediaPath : undefined;

          const sales =
            Number(doc.sales ?? doc.purchases ?? doc.totalSales ?? doc.totalPurchases) || 0;

          return {
            id,
            title,
            description,
            category,
            price,
            rating,
            downloads: doc.downloads || 0,
            sales,
            imageUrl,
            videoUrl,
            preview: description || (promptText?.slice(0, 140) || ""),
            isFree,
            uploadedAt,
            promptText,
            fullPrompt,
          } as Prompt;
        });

        setUploadHistory(mapped);
      } catch (err: any) {
        setUploadsError(err?.message || "Failed to load uploads");
        toast({
          title: "Couldn’t load your uploads",
          description: err?.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        setUploadsLoading(false);
      }
    };

    loadUploads();
  }, [token]);

  // Years present in uploads (for the filter dropdown)
  const uploadYears = useMemo(() => {
    const years = new Set<string>();
    uploadHistory.forEach((p) => {
      const y = p.uploadedAt ? String(new Date(p.uploadedAt).getFullYear()) : undefined;
      if (y) years.add(y);
    });
    const base = ["2025", "2024", "2023"];
    const merged = Array.from(new Set([...base, ...Array.from(years)]));
    return [...merged, "All"];
  }, [uploadHistory]);

  // Apply simple filters for stats (optional; grid remains unfiltered)
  const filteredForStats = useMemo(() => {
    return uploadHistory.filter((p) => {
      const byYear =
        yearFilter === "All"
          ? true
          : p.uploadedAt && String(new Date(p.uploadedAt).getFullYear()) === yearFilter;
      const byType = typeFilter === "All" ? true : typeFilter === "Paid" ? !p.isFree : !!p.isFree;
      return byYear && byType;
    });
  }, [uploadHistory, yearFilter, typeFilter]);

  const totalUploads = filteredForStats.length;
  const totalEarningsINR = filteredForStats.reduce((sum, p) => {
    const salesCount = typeof p.sales === "number" ? p.sales : p.downloads || 0;
    const price = p.price ?? 0;
    return sum + salesCount * price;
  }, 0);

  // ---- DELETE uploaded prompt ----
  const handleDeletePrompt = async (p: Prompt) => {
    const id = String(p.id);
    const ok = window.confirm("Delete this prompt permanently?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/api/prompt/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        throw new Error(data?.error || `Failed to delete (${res.status})`);
      }

      setUploadHistory((prev) => prev.filter((x) => String(x.id) !== id));
      if (detailsOpen && detailsPrompt && String((detailsPrompt as any).id) === id) {
        setDetailsOpen(false);
      }
      toast({ title: "Deleted", description: "Prompt removed from your uploads." });
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err?.message || "Could not delete the prompt.",
        variant: "destructive",
      });
    }
  };



  

  return (
    <div className="min-h-screen flex flex-col bg-[#07080A] text-white">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1280px] px-4 md:px-6 pt-20 md:pt-12 pb-20">
          {/* Header */}


          {/* Tabs header */}
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
               <SectionHeader
    title={
      tab === "purchased"
        ? "Purchased History"
        : tab === "subscriptions"
        ? "My Subscriptions"
        : "Upload History"
    }
    subtitle={
      tab === "purchased"
        ? "A record of all the prompts you’ve bought in one place."
        : tab === "subscriptions"
        ? "Manage your plan, billing, and upgrades here."
        : "Track all the prompts you’ve uploaded in one place."
    }
  />

      <div className="flex items-center justify-center">
  <TabsList className="grid grid-cols-3 w-[480px] bg-white/5 border border-white/10 rounded-full p-1">
    <TabsTrigger
      value="purchased"
      className={[
        "rounded-full text-white bg-[#17171A]",
        "data-[state=active]:text-white",
        "data-[state=active]:bg-[linear-gradient(270.19deg,#1A73E8_0.16%,#FF14EF_99.84%)]",
        "data-[state=active]:shadow-[0_8px_24px_rgba(255,20,239,0.35)]",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 text-xs">
        <ShoppingCart className="h-4 w-4" />
        <span>Purchased</span>
      </div>
    </TabsTrigger>

    <TabsTrigger
      value="uploaded"
      className={[
        "rounded-full text-white bg-[#17171A]",
        "data-[state=active]:text-white",
        "data-[state=active]:bg-[linear-gradient(270.19deg,#1A73E8_0.16%,#FF14EF_99.84%)]",
        "data-[state=active]:shadow-[0_8px_24px_rgba(255,20,239,0.35)]",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 text-xs">
        <Upload className="h-4 w-4" />
        <span>Uploaded</span>
      </div>
    </TabsTrigger>

    <TabsTrigger
      value="subscriptions"
      className={[
        "rounded-full text-white bg-[#17171A]",
        "data-[state=active]:text-white",
        "data-[state=active]:bg-[linear-gradient(270.19deg,#1A73E8_0.16%,#FF14EF_99.84%)]",
        "data-[state=active]:shadow-[0_8px_24px_rgba(255,20,239,0.35)]",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 text-xs">
        <BadgeDollarSign className="h-4 w-4" />
        <span>My Subscriptions</span>
      </div>
    </TabsTrigger>
  </TabsList>
</div>


            {/* Purchased grid (API-driven) */}
            <TabsContent value="purchased" className="mt-0">
            


              <PurchasedStatsBar
                totalCount={totalPurchasedCount}
                totalBill={totalPurchasedBill}
                years={purchaseYears}
                selectedYear={purchasedYear}
                onYearChange={setPurchasedYear}
                selectedType={purchasedType}
                onTypeChange={setPurchasedType}
                onResetAll={() => {
                  setPurchasedYear("All");
                  setPurchasedType("All membership");
                }}
                currency="₹"
              />

              {purchasesLoading ? (
                <p className="text-white/70 text-sm">Loading your purchases…</p>
              ) : purchasesError ? (
                <p className="text-red-400 text-sm">{purchasesError}</p>
              ) : purchaseHistory.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                  <EmptyStateCard
                    title="No prompts purchased yet."
                    description="Visit the marketplace to explore and purchase prompts."
                    onClick={() =>
                      toast({
                        title: "Go to marketplace",
                        description: "Hook up navigation here.",
                      })
                    }
                  />
                </div>
              ) : (
                  <div className="flex justify-center">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">


                  {purchaseHistory.map((prompt) => (
                    <HistoryGridCard
                      key={prompt.id}
                      prompt={prompt}
                      showImages={!!prompt.imageUrl}
                      playingVideo={playingVideo}
                      onToggleVideo={onToggleVideo}
                      onPreview={openDetails}
                      // isUploaded omitted → purchased behavior
                    />
                  ))}
                </div>
                </div>
              )}
            </TabsContent>

            {/* Uploaded grid — API-driven */}
            <TabsContent value="uploaded" className="mt-6">
              <UploadedStatsBar
                totalUploads={totalUploads}
                totalEarningsINR={totalEarningsINR}
                years={uploadYears}
                selectedYear={yearFilter}
                onYearChange={setYearFilter}
                selectedType={typeFilter}
                onTypeChange={setTypeFilter}
              />

              {uploadsLoading ? (
                <p className="text-white/70 text-sm">Loading your uploads…</p>
              ) : uploadsError ? (
                <p className="text-red-400 text-sm">{uploadsError}</p>
              ) : uploadHistory.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                  <EmptyStateCard
                    title="No uploaded prompts yet."
                    description="Upload your first prompt from the marketplace screen."
                    onClick={() =>
                      toast({
                        title: "Open upload screen",
                        description: "Hook up navigation to your upload flow.",
                      })
                    }
                  />
                </div>
              ) : (
                 <div className="flex justify-center">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

 
                  {uploadHistory.map((prompt) => (
                    <HistoryGridCard
                      key={prompt.id}
                      prompt={prompt}
                      showImages={!!prompt.imageUrl}
                      playingVideo={playingVideo}
                      onToggleVideo={onToggleVideo}
                      onPreview={openDetails}
                      isUploaded
                      onDelete={handleDeletePrompt}
                    />
                  ))}
                </div>
                 </div>
              )}
            </TabsContent>
            {/* Subscriptions tab — plan lives here */}
<TabsContent value="subscriptions" className="mt-0">
  <SubscriptionsSection
    user={user}
    onRenew={() => {
      toast({ title: "Renew", description: "Renew flow goes here." });
    }}
    onUpgrade={() => {
      toast({ title: "Upgrade plan", description: "Upgrade flow goes here." });
    }}
  />
</TabsContent>

          </Tabs>

          {/* Details Modal */}
          <DetailsPrompt
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            prompt={detailsPrompt}
            owned={!!(detailsPrompt && (detailsPrompt as any).fullPrompt)}
            onPurchase={() => {}}
            showImages
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
