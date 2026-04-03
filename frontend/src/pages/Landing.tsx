


import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {  AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, TrendingUp, Star, Sparkle, Mouse, MoveDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
import { motion, animate, useMotionValue, useMotionTemplate } from "framer-motion";
import Footer from "@/components/Footer";
import SubscriptionModal from "@/components/SubscriptionModal";
import { Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircleHeart, X } from "lucide-react";
// top of file (with other lucide-react imports)
import { Check  } from "lucide-react";
import { LuBadgeCheck } from "react-icons/lu";
import AccountMenu from "@/components/AccountMenu";
const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

/* --- tiny helper: star with true gradient color using CSS mask --- */
function MaskedStar({ size = 14 }: { size?: number }) {
  const starMask = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896 4.665 23.165l1.401-8.168L.132 9.21l8.2-1.192z'/%3E%3C/svg%3E")`;
  const common: React.CSSProperties = {
    display: "inline-block",
    width: size,
    height: size,
    backgroundImage: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
    WebkitMaskImage: starMask,
    maskImage: starMask,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  };
  return <span style={common} aria-hidden="true" />;
}

/* --- reusable badge button --- */
function GradientBadge({
  label = "Trusted by industry leaders",
  showIcon = true,
}: {
  label?: string;
  showIcon?: boolean;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center rounded-full"
      style={{
        background: "#252525",
        border: "1px solid #333335",
        padding: "10px 14px",
        gap: showIcon ? 8 : 0,
      }}
    >
      {showIcon ? <MaskedStar size={16} /> : null}
      <span
        className="bg-clip-text text-transparent"
        style={{
          backgroundImage: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
          fontFamily: "Inter, ui-sans-serif, system-ui",
          fontWeight: 500,
          fontSize: 16,
          lineHeight: "100%",
        }}
      >
        {label}
      </span>
    </button>
  );
}

type LandingProps = {
  variant?: "marketing" | "app";
  userFullName?: string;
  routes?: {
    login?: string;
    app?: string;
    promptLibrary?: string;
    smartgen?: string;
    marketplace?: string;
    dashboard?: string;
    profile?: string;
  };
  showFooter?: boolean;
};

export default function Landing({
  variant = "marketing",
  userFullName,
  routes = {
    login: "/login",
    app: "/app",
    promptLibrary: "/prompt-library",
    smartgen: "/smartgen",
    marketplace: "/prompt-marketplace",
    dashboard: "/app",
    profile: "/profile",
  },
  showFooter = true,
}: LandingProps) {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const color = useMotionValue(COLORS_TOP[0]);
  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, [color]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;
  const go = (path?: string) => path && navigate(path);

  // Steps
  const [activeStep, setActiveStep] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  
   





















  // const [current, setCurrent] = useState(0);
  const [activeButton, setActiveButton] = useState<"left" | "right" | null>(null);
  const { isAuthenticated } = useAuth();

  const { user, logout } = useAuth();
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  const displayName = useMemo(() => user?.name?.trim() || "", [user]);
  const displayEmail = useMemo(() => user?.email || "", [user]);
  const fullName = useMemo(() => {
    if (displayName) return displayName;
    if (displayEmail) return displayEmail.split("@")[0];
    return "User";
  }, [displayName, displayEmail]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const themeBtn = (id: "light" | "dark" | "system", src: string, alt: string) => (
    <button
      type="button"
      onClick={() => setTheme(id)}
      className="inline-flex items-center justify-center rounded-full"
      style={{
        width: 28,
        height: 28,
        outline: theme === id ? "2px solid rgba(255,255,255,0.9)" : "none",
      }}
      aria-pressed={theme === id}
      aria-label={alt}
      title={alt}
    >
      <img src={src} alt="" className="w-4 h-4" />
    </button>
  );

const PlanStyledName = ({ user, fullName }: { user: any; fullName: string }) => {
  // PRO
  if (user?.plan === "pro") {
    return (
      <div className="flex items-center gap-2">
       <PlanStyledName user={user} fullName={fullName} />
        <LuBadgeCheck
          className="w-[22px] h-[22px]"
          style={{ stroke: "url(#proGradient)", strokeWidth: 2 }}
        />
        <svg width="0" height="0">
          <defs>
            <linearGradient id="proGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF14EF" />
              <stop offset="100%" stopColor="#1A73E8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // ENTERPRISE
  if (user?.plan === "enterprise") {
    return (
      <div className="flex items-center gap-2">
        <span className="truncate font-semibold bg-gradient-to-r from-[#FACC15] to-[#CA8A04] text-transparent bg-clip-text">
          Hello, {fullName}
        </span>
        <LuBadgeCheck
          className="w-[22px] h-[22px]"
          style={{ stroke: "url(#enterpriseGradient)", strokeWidth: 2 }}
        />
        <svg width="0" height="0">
          <defs>
            <linearGradient id="enterpriseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // FREE (default)
  return (
    <div className="flex items-center gap-2">
      <span className="truncate font-semibold text-white">
        Hello, {fullName}
      </span>
      <span className="px-2 py-0.5 text-xs rounded-md bg-gray-700 text-gray-300">
        FREE
      </span>
    </div>
  );
};




  /* ===== Feedback button placement logic =====
     Goal: place a 50x130 vertical pill above the Smartgen/Marketplace CTAs,
     and horizontally stick it to the right edge of the laptop screen. */
  const [fbPos, setFbPos] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
  const PILL_W = 50;             // feedback pill width
  const PILL_H = 130;            // feedback pill height
  const SAFE = 12;               // margin from edges
  const BASE_WRAP_W = 1400;      // your max container width
  const DESKTOP_OFFSET = 400;    // your desired desktop offset to the right of the screen

  const calc = () => {
    const screen = document.getElementById("product-screen-mask");
    const ctas = document.getElementById("hero-ctas");
    const section = document.getElementById("landing-root");
    const wrap = document.getElementById("product-demo-wrap");
    if (!screen || !ctas || !section) return;

    const s = screen.getBoundingClientRect();
    const c = ctas.getBoundingClientRect();
    const root = section.getBoundingClientRect();
    const wrapRect = wrap?.getBoundingClientRect();

    // Scale the desktop offset with the actual wrapper width
    const wrapWidth = wrapRect?.width ?? BASE_WRAP_W;
    const scale = wrapWidth / BASE_WRAP_W;

    const isMobile = window.innerWidth < 640;
    // On mobile, keep it tight near the screen; on desktop, use your scaled 245px
    const offset = isMobile ? 8 : Math.round(DESKTOP_OFFSET * scale);

    // Compute left so the pill's RIGHT edge sits offset beyond the laptop screen's RIGHT edge
    let left = Math.round((s.right - root.left) + offset - PILL_W);

    // Clamp within the visible section to avoid disappearing off-screen
    const maxLeft = root.width - PILL_W - SAFE;
    const minLeft = SAFE;
    left = Math.max(minLeft, Math.min(left, maxLeft));

    // Place ABOVE CTAs: (top of CTAs) - (pill height) - gap
    let top = Math.round((c.top - root.top) - PILL_H - 12);
    const minTop = SAFE;
    const maxTop = root.height - PILL_H - SAFE;
    top = Math.max(minTop, Math.min(top, maxTop));

    setFbPos({ top, left });
  };

  calc();
  // Recompute on resize/scroll
  window.addEventListener("resize", calc);
  window.addEventListener("scroll", calc, { passive: true });

  // Recompute when the product demo wrapper resizes (e.g., container width changes)
  let ro: ResizeObserver | undefined;
  const wrapEl = document.getElementById("product-demo-wrap");
  if (wrapEl && "ResizeObserver" in window) {
    ro = new ResizeObserver(calc);
    ro.observe(wrapEl);
  }

  return () => {
    window.removeEventListener("resize", calc);
    window.removeEventListener("scroll", calc as any);
    ro?.disconnect();
  };
}, []);




const [feedbackOpen, setFeedbackOpen] = useState(false);
const [rating, setRating] = useState<number>(0);
const [hoverRating, setHoverRating] = useState<number>(0);

const [fbForm, setFbForm] = useState<{
  experience: string;
  name: string;
  role: string;
  org: string;
  file?: File | null;
}>({
  experience: "",
  name: "",
  role: "",
  org: "",
  file: null,
});

const MAX_CHARS = 500;

// Esc to close
useEffect(() => {
  if (!feedbackOpen) return;
  const onKey = (e: KeyboardEvent) => (e.key === "Escape" ? setFeedbackOpen(false) : null);
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [feedbackOpen]);

const handleClear = () => {
  setRating(0);
  setHoverRating(0);
  setFbForm({ experience: "", name: "", role: "", org: "", file: null });
};

const handleSubmitFeedback = async () => {
  try {
    const formData = new FormData();
    formData.append("experience", fbForm.experience);
    formData.append("name", fbForm.name);
    formData.append("role", fbForm.role);
    formData.append("orgOrCompany", fbForm.org);
    formData.append("rating", String(rating));
    if (fbForm.file) formData.append("profilePicture", fbForm.file);

    const res = await fetch(`${API_BASE}/api/feedback`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("[FEEDBACK SUBMIT RESPONSE]", data);

    if (data.success) {
      // Add new feedback to list
      setFeedbacks((prev) => [data.feedback, ...prev]);
      setFeedbackOpen(false);
      handleClear();
      setThankOpen(true);
    } else {
      alert("Failed to submit feedback: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Submit feedback error:", err);
  }
};





// near your other feedback state
const [thankOpen, setThankOpen] = useState(false);
// testimonials now come from saved feedbacks
const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);


useEffect(() => {
  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/feedback`);
      const data = await res.json();
      console.log("[FEEDBACK FETCH RESPONSE]", data);

      if (data.success) {
        setFeedbacks(data.feedbacks);
      }
    } catch (err) {
      console.error("Fetch feedback error:", err);
    }
  };

  fetchFeedbacks();
}, []);


// === Feedback types + storage helpers + avatar utils ===
type Feedback = {
  id: string;
  when: number;
  name: string;
  role: string;
  org: string;
  rating: number;
  experience: string;
  avatar?: string; // data URL
};

const FB_KEY = "tokun_feedbacks";
const MAX_FEEDBACKS = 100;
const MAX_BYTES = 4_500_000; // ~4.5MB guard

function loadFeedbacks(): Feedback[] {
  try {
    const raw = localStorage.getItem(FB_KEY);
    return raw ? (JSON.parse(raw) as Feedback[]) : [];
  } catch {
    return [];
  }
}

function saveFeedbacksSafe(list: Feedback[]) {
  // keep last N & prune until size fits
  const pruned = list.slice(-MAX_FEEDBACKS);
  let json = JSON.stringify(pruned);
  while (json.length > MAX_BYTES && pruned.length) {
    pruned.shift();
    json = JSON.stringify(pruned);
  }
  try {
    localStorage.setItem(FB_KEY, json);
  } catch (e) {
    console.warn("localStorage save failed:", e);
  }
}

async function fileToAvatarDataUrl(file: File, size = 64, quality = 0.72): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const minSide = Math.min(img.width, img.height);
  const sx = (img.width - minSide) / 2;
  const sy = (img.height - minSide) / 2;
  ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", quality);
}

function initialsFrom(name: string) {
  const parts = (name || "User").trim().split(/\s+/);
  return (parts[0]?.[0] || "U") + (parts[1]?.[0] || "");
}
function colorFor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h},70%,45%)`;
}
function svgInitialsAvatar(name: string, size = 64) {
  const initials = initialsFrom(name).toUpperCase();
  const bg = colorFor(name);
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
    `<rect width='100%' height='100%' rx='${size / 2}' fill='${bg}'/>` +
    `<text x='50%' y='54%' font-family='Inter,system-ui,sans-serif' font-size='${size * 0.42}' text-anchor='middle' fill='white' dy='.1em'>${initials}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}


const [current, setCurrent] = useState(0);

const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";






const nextSlide = () => {
  setCurrent((prev) => (prev + 1) % feedbacks.length);
};

const prevSlide = () => {
  setCurrent((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);
};

// auto slide
useEffect(() => {
  if (feedbacks.length <= 1) return;

  const interval = setInterval(() => {
    nextSlide();
  }, 4000);

  return () => clearInterval(interval);
}, [feedbacks]);










  return (
    <motion.section
      id="landing-root"
      style={{ backgroundColor: "#030406" }}
      className="relative min-h-screen overflow-hidden text-gray-200"
    >
      {/* --- Background image (homeban) --- */}
      <img
        src="/icons/homeban.png"
        alt="Tokun neon background"
        className="pointer-events-none select-none absolute -top-24 right-0 w-[72vw] max-w-none opacity-90 mix-blend-screen"
      />
      {/* Subtle radial glow behind hero copy */}
      <div
        aria-hidden
        className="absolute left-1/2 top-24 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(191,44,255,0.22),rgba(0,0,0,0))] blur-3xl"
      />
      {/* Fine vignette to focus center */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(139,92,246,0.12),rgba(0,0,0,0))]"
      />

      {/* HEADER */}
  <header className="w-full fixed top-0 left-0 right-0 z-50">
  <div className="px-4 md:px-6 lg:px-8 py-4 lg:py-6">
    <div className="container mx-auto flex items-center justify-between">

      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <img
  src="/icons/Tokun.png"
  alt="Tokun.ai Logo"
  className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain transition-transform duration-200 hover:scale-105"
/>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
        {variant === "marketing" ? (
          <>
            <button
              onClick={() => go(routes.login)}
              className="hidden sm:block text-white/95 hover:text-white transition-colors"
              style={{ fontSize: 14, fontWeight: 600 }}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => go(routes.dashboard)}
              className="inline-flex items-center justify-center rounded-full hover:opacity-95 transition-opacity"
              style={{
                height: 40,
                padding: "0 16px",
                borderRadius: 200,
                background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
                color: "#FFFFFF",
                fontFamily: "Inter, system-ui, Arial, sans-serif",
                fontWeight: 600,
                fontSize: 13,
                lineHeight: "20px",
                gap: 6,
              }}
            >
              <span>Dashboard</span>
              <span
                aria-hidden
                className="inline-flex items-center justify-center rounded-full bg-white"
                style={{ width: 22, height: 22 }}
              >
                <MdKeyboardArrowRight size={14} color="black" />
              </span>
            </button>
          </>
        ) : (
          <DropdownMenu>
            <AccountMenu />
          </DropdownMenu>
        )}
      </div>
    </div>
  </div>
</header>

      {/* MAIN */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-32 sm:pt-36 md:pt-24 lg:pt-24 pb-20">
        {/* HERO */}
        <div className="text-center space-y-8 mb-20">
          {/* <div className="flex justify-center">
            <GradientBadge label="Trusted by industry leaders" showIcon />
          </div> */}

          <div
            className="transform transition-transform duration-300 ease-out"
            style={{
              transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`,
            }}
          >
           <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight flex justify-center">
  <span className="relative inline-flex items-center justify-center select-none">
    {/* ambient glow behind full word */}
    <motion.span
      aria-hidden
      className="absolute inset-0 blur-3xl"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, rgba(255,20,239,0.28) 0%, rgba(26,115,232,0.22) 38%, rgba(0,0,0,0) 72%)",
      }}
      animate={{
        opacity: [0.35, 0.7, 0.35],
        scale: [0.96, 1.04, 0.96],
      }}
      transition={{
        duration: 4.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />

    {/* whole word breathing */}
    <motion.span
      className="relative inline-flex items-center"
      animate={{
        y: [0, -2, 0],
        scale: [1, 1.01, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* T */}
      <motion.span
        className="relative inline-block bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #ffffff 0%, #dbe8ff 38%, #7dd3fc 72%, #ffffff 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          textShadow: "0 0 18px rgba(125,211,252,0.18)",
        }}
        animate={{
          opacity: [1, 0.92, 1],
          filter: [
            "drop-shadow(0 0 4px rgba(125,211,252,0.14))",
            "drop-shadow(0 0 10px rgba(26,115,232,0.18))",
            "drop-shadow(0 0 4px rgba(125,211,252,0.14))",
          ],
        }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        T
      </motion.span>

      {/* O */}
      <motion.span
        className="relative inline-block bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #ffffff 0%, #e8dcff 34%, #c084fc 68%, #ffffff 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
        }}
        animate={{
          opacity: [0.95, 1, 0.95],
          rotateZ: [0, 0.2, 0],
        }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      >
        O
      </motion.span>

      {/* K */}
      <motion.span
        className="relative inline-block bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #ffffff 0%, #d9dbff 30%, #60a5fa 65%, #ffffff 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
        }}
        animate={{
          opacity: [1, 0.94, 1],
        }}
        transition={{ duration: 2.9, repeat: Infinity, ease: "easeInOut" }}
      >
        K
      </motion.span>

      {/* U special AI core */}
      <span className="relative inline-flex items-center justify-center mx-[4px]">
        {/* outer ring */}
        <motion.span
          className="absolute rounded-full"
          style={{
            width: "1.12em",
            height: "1.12em",
            border: "1px solid rgba(125,211,252,0.42)",
            boxShadow:
              "0 0 16px rgba(26,115,232,0.25), inset 0 0 12px rgba(255,20,239,0.16)",
          }}
          animate={{
            scale: [0.88, 1.16, 0.88],
            opacity: [0.35, 0.9, 0.35],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* inner ring */}
        <motion.span
          className="absolute rounded-full"
          style={{
            width: "0.78em",
            height: "0.78em",
            border: "1px solid rgba(255,20,239,0.35)",
          }}
          animate={{
            scale: [1.15, 0.92, 1.15],
            opacity: [0.15, 0.55, 0.15],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* orbit dot pink */}
        <motion.span
          className="absolute rounded-full"
          style={{
            width: 7,
            height: 7,
            background: "#FF14EF",
            boxShadow: "0 0 14px rgba(255,20,239,0.9)",
            top: "50%",
            left: "50%",
            marginLeft: -3.5,
            marginTop: -3.5,
          }}
          animate={{
            x: [0, 16, 0, -16, 0],
            y: [-18, 0, 18, 0, -18],
            scale: [0.9, 1.1, 0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 4.2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* orbit dot blue */}
        <motion.span
          className="absolute rounded-full"
          style={{
            width: 6,
            height: 6,
            background: "#1A73E8",
            boxShadow: "0 0 14px rgba(26,115,232,0.95)",
            top: "50%",
            left: "50%",
            marginLeft: -3,
            marginTop: -3,
          }}
          animate={{
            x: [0, -14, 0, 14, 0],
            y: [16, 0, -16, 0, 16],
            scale: [1.05, 0.85, 1.05, 0.85, 1.05],
          }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* U letter */}
        <motion.span
          className="relative inline-block bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(180deg, #ffffff 0%, #67e8f9 30%, #1A73E8 64%, #FF14EF 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            textShadow: "0 0 22px rgba(26,115,232,0.28)",
          }}
          animate={{
            y: [0, -3, 0],
            filter: [
              "drop-shadow(0 0 8px rgba(26,115,232,0.22))",
              "drop-shadow(0 0 18px rgba(255,20,239,0.35))",
              "drop-shadow(0 0 8px rgba(26,115,232,0.22))",
            ],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          U
        </motion.span>
      </span>

      {/* N */}
      <motion.span
        className="relative inline-block bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #ffffff 0%, #f0e9ff 34%, #f472b6 70%, #ffffff 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
        }}
        animate={{
          opacity: [0.96, 1, 0.96],
        }}
        transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut" }}
      >
        N
      </motion.span>

      {/* shimmer sweep */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 48%, transparent 100%)",
          mixBlendMode: "screen",
          filter: "blur(10px)",
        }}
        animate={{ x: ["-130%", "130%"] }}
        transition={{
          duration: 2.6,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 1.1,
        }}
      />

      {/* top scanner line */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 h-[2px] rounded-full"
        style={{
          top: "16%",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(103,232,249,0.85) 50%, transparent 100%)",
          boxShadow: "0 0 14px rgba(103,232,249,0.5)",
        }}
        animate={{
          x: ["-12%", "12%", "-12%"],
          opacity: [0.25, 0.95, 0.25],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.span>

    {/* bottom neon reflection */}
    <motion.span
      aria-hidden
      className="absolute left-[8%] right-[8%] -bottom-2 h-4 rounded-full blur-xl"
      style={{
        background:
          "linear-gradient(90deg, rgba(26,115,232,0.0) 0%, rgba(26,115,232,0.18) 30%, rgba(255,20,239,0.22) 70%, rgba(255,20,239,0.0) 100%)",
      }}
      animate={{
        opacity: [0.25, 0.55, 0.25],
        scaleX: [0.96, 1.03, 0.96],
      }}
      transition={{
        duration: 3.4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </span>
</h1>

            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Enter the Promptverse
            </h2>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Optimize your LLM prompts, generate better outcomes, and monetize your best prompts—all in one place.
            </p>
          </div>
        </div>

 {/* CTAs */}
<div
  id="hero-ctas"
  className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-6 sm:mt-20 mb-16"
>
  {/* Smartgen + Arrow */}
  <div className="relative">
    <motion.img
      src="/icons/arr.png"
      alt="arrow highlight"
      className="pointer-events-none select-none absolute -top-6 -left-8 w-9 sm:-top-7 sm:-left-10 sm:w-10"
    />
    <motion.button
      onClick={() => go(routes.smartgen)}
      whileHover={{ scale: 1.05 }}
      className="relative w-[200px] sm:w-[220px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold shadow-2xl border border-white/10 backdrop-blur-md flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg"
      style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
    >
      <div className="absolute inset-0 rounded-full bg-white opacity-10 blur-[6px] pointer-events-none" />
      <span>Try Smartgen</span>
      <span
        aria-hidden
        className="inline-flex items-center justify-center rounded-full bg-white"
        style={{ width: 24, height: 24 }}
      >
        <MdKeyboardArrowRight size={14} color="black" />
      </span>
    </motion.button>
  </div>

  <motion.button
    onClick={() => go(routes.marketplace)}
    whileHover={{ scale: 1.05 }}
    className="relative w-[200px] sm:w-[220px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold shadow-2xl border border-white/10 backdrop-blur-md flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg"
    style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
  >
    Prompt Marketplace
  </motion.button>
</div>
        {/* STATS */}
        {/* <section className="mt-20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-center items-center text-center gap-8 font-[Inter]">
              <div className="flex flex-col items-center">
                <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px", fontWeight: 500 }}>
                  Prompts Optimized
                </div>
                <div className="text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
                  50k
                </div>
              </div>

              <div className="hidden md:block h-[19px] w-px bg-white/40 mx-4"></div>

              <div className="flex flex-col items-center">
                <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px" }}>
                  Average Token Reduction
                </div>
                <div className="text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
                  60%
                </div>
              </div>

              <div className="hidden md:block h-[19px] w-px bg-white/40 mx-4"></div>

              <div className="flex flex-col items-center">
                <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px" }}>
                  User Rating
                </div>
                <div className="flex items-center gap-2 text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
                  <Star className="h-5 w-5 text-white" />
                  4.9
                </div>
              </div>

              <div className="hidden md:block h-[19px] w-px bg-white/40 mx-4"></div>

              <div className="flex flex-col items-center">
                <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px" }}>
                  Support Available
                </div>
                <div className="text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
                  24/7
                </div>
              </div>
            </div>
          </div>
        </section> */}



        <section className="mt-20">
  <div className="container mx-auto px-4 sm:px-6">
    <div className="grid grid-cols-2 md:flex md:flex-row justify-center items-center gap-6 md:gap-8 font-[Inter]">
      
      <div className="flex flex-col items-center">
        <div className="text-white/90 mb-2 font-medium text-sm sm:text-base md:text-xl">
          Prompts Optimized
        </div>
        <div className="text-white font-semibold text-sm sm:text-base">
          50k
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="text-white/90 mb-2 font-medium text-sm sm:text-base md:text-xl">
          Token Reduction
        </div>
        <div className="text-white font-semibold text-sm sm:text-base">
          60%
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="text-white/90 mb-2 font-medium text-sm sm:text-base md:text-xl">
          User Rating
        </div>
        <div className="flex items-center gap-1 text-white font-semibold text-sm sm:text-base">
          <Star className="h-4 w-4 text-white" />
          4.9
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="text-white/90 mb-2 font-medium text-sm sm:text-base md:text-xl">
          Support
        </div>
        <div className="text-white font-semibold text-sm sm:text-base">
          24/7
        </div>
      </div>
    </div>
  </div>
</section>

        <div className="mt-12 flex flex-col items-center justify-center text-center select-none">
          <Mouse className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-white/70" strokeWidth={2.25} />
          <div className="mt-3 text-white/80" style={{ fontFamily: "Inter, ui-sans-serif, system-ui", fontSize: 14, lineHeight: "18px" }}>
            Scroll down
          </div>
          <motion.div className="mt-3" animate={{ y: [0, 8, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
            <MoveDown className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-white/80" strokeWidth={2.25} />
          </motion.div>
        </div>

        {/* WHAT WE OFFER */}
        <div className="mt-28">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
            What We Offer
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 auto-rows-fr">
            {[
              {
                icon: Zap,
                title: "Prompt Optimization",
                description: "Reduce token usage by up to 60% while maintaining meaning and effectiveness across all LLM platforms.",
              },
              {
                icon: Sparkles,
                title: "Smartgen Generator",
                description: "Transform simple ideas into powerful, optimized prompts with our AI-powered generation system.",
              },
              {
                icon: TrendingUp,
                title: "Prompt Marketplace",
                description: "Built a great prompt? Trade it. Monetize your creativity and earn from your best prompt innovations.",
              },
              {
                icon: null,
                image: "/icons/circle.png",
                title: "Prompt Library",
                description: "Access categorized prompts for Coding, Design, Marketing, Video Creation, and more.",
              },
            ].map((feature, index) => (
              <div key={index} className="rounded-[32px] p-[1px] h-full" style={{ background: "linear-gradient(180deg, #333333 0%, #12141A 100%)" }}>
                <div className="rounded-[30px] bg-[#030406] p-6 md:p-8 flex h-full flex-col">
                  <div className="mb-4">
                    {feature.image ? (
                      <img src={feature.image} alt="" className="h-8 w-8 object-contain" />
                    ) : (
                      <>
                        <feature.icon className="h-8 w-8" style={{ stroke: "url(#icon-gradient)", strokeWidth: 1.5, fill: "none" }} />
                        <svg width="0" height="0" aria-hidden>
                          <defs>
                            <linearGradient id="icon-gradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#1A73E8" />
                              <stop offset="100%" stopColor="#FF14EF" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </>
                    )}
                  </div>

                  <h3
                    className="mb-3 text-white"
                    style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "24px", lineHeight: "100%", letterSpacing: "0" }}
                  >
                    {feature.title}
                  </h3>

                  <p
                    className="text-white/80"
                    style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "14px", lineHeight: "100%", letterSpacing: "0" }}
                  >
                    {feature.description}
                  </p>

                  <div className="mt-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HOW IT WORKS + PRODUCT DEMO */}
        <div className="mt-28" style={{ borderWidth: "1px 0 1px 0", borderStyle: "solid", borderColor: "#171717", background: "#08090B" }}>
          <div className="pt-16 flex justify-center mb-8">
            <div className="p-[1px] rounded-full" style={{ background: "linear-gradient(90deg, #1A73E8 0%, #FF14EF 100%)" }}>
              <div className="px-5 py-2 rounded-full bg-black">
                <span
                  style={{
                    fontFamily: "Inter, ui-sans-serif, system-ui",
                    fontWeight: 500,
                    fontSize: 16,
                    lineHeight: "100%",
                    background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  PROCESS
                </span>
              </div>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">How It Works</h2>

          {/* Steps grid */}
          {/* <div className="px-6">
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 mb-16">
              {[
                { step: "Input Idea", Icon: Zap, description: "Share your concept or requirement" },
                { step: "Smartgen", Icon: Sparkles, description: "AI generates optimized prompts" },
                { step: "Optimize", Icon: Zap, description: "Reduce tokens, improve quality" },
                { step: "Save or Sell", Icon: Sparkle, description: "Store in library or marketplace" },
                { step: "Earn", Icon: Sparkle, description: "Monetize your best prompts" },
              ].map((item, i) => {
                const isActive = i === activeStep;
                const fill = isActive ? "linear-gradient(360deg, #1A1A1A 0%, #08090B 100%)" : "#030406";

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveStep(i)}
                    className="relative cursor-pointer select-none focus:outline-none"
                    style={{
                      width: "100%",
                      padding: 2,
                      borderRadius: 22,
                      background: "linear-gradient(180deg, #333333 0%, #12141A 100%)",
                    }}
                    onMouseEnter={(e) => {
                      const inner = e.currentTarget.querySelector<HTMLElement>("[data-inner]");
                      if (inner && !isActive) inner.style.background = "linear-gradient(360deg, #1A1A1A 0%, #08090B 100%)";
                    }}
                    onMouseLeave={(e) => {
                      const inner = e.currentTarget.querySelector<HTMLElement>("[data-inner]");
                      if (inner && !isActive) inner.style.background = "#030406";
                    }}
                  >
                    <div
                      data-inner
                      className="w-full h-full flex flex-col items-start justify-start p-5 text-left transition-colors overflow-hidden"
                      style={{
                        borderRadius: 18,
                        background: fill,
                        minHeight: 140,
                      }}
                    >
                      <div className="absolute top-3 right-4 text-white/40 font-semibold text-sm">
                        {String(i + 1).padStart(2, "0")}
                      </div>

                      <div className="mb-2">
                        <item.Icon className="h-8 w-8 text-white" />
                      </div>

                      <h3 className="text-white font-semibold text-[18px] sm:text-[20px] leading-snug break-words">
                        {item.step}
                      </h3>

                      <p className="text-white/70 mt-2 text-[14px] sm:text-[15px] leading-snug break-words whitespace-normal">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div> */}



         <div className="px-4 sm:px-6">
  <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-16">
    {[
      { step: "Input Idea", Icon: Zap, description: "Share your concept or requirement" },
      { step: "Smartgen", Icon: Sparkles, description: "AI generates optimized prompts" },
      { step: "Optimize", Icon: Zap, description: "Reduce tokens, improve quality" },
      { step: "Save or Sell", Icon: Sparkle, description: "Store in library or marketplace" },
      { step: "Earn", Icon: Sparkle, description: "Monetize your best prompts" },
    ].map((item, i) => {
      const isActive = i === activeStep;
      const fill = isActive ? "linear-gradient(360deg, #1A1A1A 0%, #08090B 100%)" : "#030406";

      return (
        <button
          key={i}
          type="button"
          onClick={() => setActiveStep(i)}
          className="relative cursor-pointer select-none focus:outline-none w-full"
          style={{
            padding: 2,
            borderRadius: 22,
            background: "linear-gradient(180deg, #333333 0%, #12141A 100%)",
          }}
        >
          <div
            data-inner
            className="w-full h-full flex flex-col items-start justify-start p-4 text-left transition-colors"
            style={{
              borderRadius: 18,
              background: fill,
              minHeight: 120,
            }}
          >
            <div className="absolute top-2 right-3 text-white/40 font-semibold text-xs sm:text-sm">
              {String(i + 1).padStart(2, "0")}
            </div>

            <div className="mb-2">
              <item.Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>

            <h3 className="text-white font-semibold text-base sm:text-lg md:text-xl leading-snug">
              {item.step}
            </h3>

            <p className="text-white/70 mt-1 text-xs sm:text-sm leading-snug">
              {item.description}
            </p>
          </div>
        </button>
      );
    })}
  </div>
</div>



     {/* Product Demo */}
<div className="mt-28 relative overflow-hidden">

  <div className="container mx-auto px-6 text-center">

    {/* Heading */}
    <h3 className="text-3xl md:text-4xl font-bold text-white">
      Product Demo
    </h3>

    <p className="text-white/70 text-lg mt-3 mb-12">
      Video demonstration of earn feature
    </p>

    {/* Demo Wrapper */}
    <div className="relative w-full max-w-[1200px] mx-auto">

      {/* Glow background */}
      <div
        className="absolute inset-0 blur-[120px] opacity-40"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,20,239,0.35) 0%, rgba(26,115,232,0.35) 100%)",
        }}
      />

      {/* Laptop with 3D animation */}
      <motion.div
        whileHover={{
          rotateX: 6,
          rotateY: -6,
          scale: 1.03,
        }}
        transition={{ type: "spring", stiffness: 120 }}
        className="relative mx-auto"
        style={{ perspective: 1200 }}
      >

        {/* Laptop Image */}
        <img
          src="/icons/ux.png"
          alt="Laptop demo"
          className="w-full h-auto select-none pointer-events-none"
          draggable={false}
        />

        {/* Screen Video */}
        <div
          className="absolute overflow-hidden rounded-[12px]"
          style={{
            top: "16.5%",
            left: "11.8%",
            width: "76.4%",
            height: "64%",
          }}
        >
          <video
            src="/icons/token.mp4"
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>

      </motion.div>

    </div>
  </div>
</div>
        </div>

        {/* FINAL CTA */}
        <div className="mt-28 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-[1px] rounded-full" style={{ background: "linear-gradient(90deg, #1A73E8 0%, #FF14EF 100%)" }}>
              <div className="px-5 py-2 rounded-full bg-black">
                <span
                  style={{
                    fontFamily: "Inter, ui-sans-serif, system-ui",
                    fontWeight: 500,
                    fontSize: 16,
                    lineHeight: "100%",
                    background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  REACH OUT ANY TIME
                </span>
              </div>
            </div>
          </div>

         <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-6">
  Ready to optimize your prompts?
</h2>
<p className="text-base sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
  Join thousands of developers who are already saving costs and improving efficiency with TOKUN.
</p>

         <div className="relative inline-block overflow-visible isolate">
  <div
    className="pointer-events-none absolute -inset-x-16 -top-2 -bottom-10 rounded-[36px] z-0"
    style={{
      background: "linear-gradient(90deg, rgba(255,20,239,0.4) 0%, rgba(26,115,232,0.4) 100%)",
      filter: "blur(60px)",
      opacity: 1,
    }}
  />
  <div className="relative">
    <motion.img
      src="/icons/arr.png"
      alt="arrow highlight"
      className="pointer-events-none select-none absolute -top-6 -left-8 w-9 sm:-top-7 sm:-left-10 sm:w-10"
    />
    <motion.button
      onClick={() => go(routes.app)}
      whileHover={{ scale: 1.05 }}
      className="relative w-[200px] sm:w-[240px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold shadow-2xl border border-white/10 backdrop-blur-md flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg"
      style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
    >
      <div className="absolute inset-0 rounded-full bg-white opacity-10 blur-[6px] pointer-events-none" />
      <span>Start Optimizing Now</span>
      <span
        aria-hidden
        className="inline-flex items-center justify-center rounded-full bg-white"
        style={{ width: 24, height: 24 }}
      >
        <MdKeyboardArrowRight size={14} color="black" />
      </span>
    </motion.button>
  </div>
</div>
        </div>

        {/* TESTIMONIALS */}
          {/* TESTIMONIALS */}
      {/* TESTIMONIALS — SAME POSITION & DESIGN, keep < and > arrows; center when only one */}
           {/* TESTIMONIALS */}
<div className="mt-28 mb-20 relative font-[Inter] px-4">

  {/* TAG */}
  <div className="flex justify-center mb-4">
    <div
      className="p-[1px] rounded-full"
      style={{ background: "linear-gradient(90deg, #1A73E8 0%, #FF14EF 100%)" }}
    >
      <div className="px-5 py-2 rounded-full bg-black">
        <span
          style={{
            fontWeight: 500,
            fontSize: 16,
            background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          WALL OF LOVE
        </span>
      </div>
    </div>
  </div>

 <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-4">
  Loved by thinkers
</h2>

<p className="text-sm sm:text-lg text-white/70 text-center mb-12">
  Here's what people worldwide are saying
</p>

 {feedbacks.length === 0 ? (
  <div className="text-center text-white/60">
    No testimonials yet — be the first to leave feedback!
  </div>
) : (
  <div className="flex justify-center items-center gap-3 sm:gap-6 px-3 sm:px-0">
    {/* LEFT BUTTON */}
    <button
      onClick={prevSlide}
      className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white text-white transition-all shrink-0"
    >
      <MdKeyboardArrowDown size={20} className="rotate-90 sm:text-[22px]" />
    </button>

    {/* SLIDER */}
    <div className="relative w-full max-w-[560px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 120 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -120 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          {(() => {
            const t = feedbacks[current];
            return (
              <div
                key={t.id}
                className="relative flex flex-col justify-between p-4 sm:p-6 text-left bg-transparent overflow-hidden w-full"
                style={{
                  border: "1px solid #333335",
                  borderRadius: 24,
                }}
              >
                {/* glow */}
                <div
                  className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-28 h-28 sm:w-40 sm:h-40 rounded-full pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at center, rgba(255,20,239,0.25) 0%, rgba(26,115,232,0.25) 100%)",
                    filter: "blur(60px)",
                  }}
                />

                <div className="relative z-10 flex flex-col gap-3">
                  {/* stars */}
                  <div className="flex">
                    {Array.from({
                      length: Math.max(1, Math.min(5, Number(t.rating) || 5)),
                    }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-white fill-white" />
                    ))}
                  </div>

                  {/* text */}
                  <p className="text-white/90 text-[13px] sm:text-[15px] leading-relaxed break-words">
                    "{t.experience}"
                  </p>

                  {/* user */}
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar || svgInitialsAvatar(t.name || "User")}
                      alt={t.name || "User"}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-white text-sm sm:text-base truncate">
                        {t.name || "Anonymous"}
                      </div>
                      <div className="text-xs sm:text-sm text-white/60 break-words">
                        {[t.role, t.org].filter(Boolean).join(" • ")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.div>
      </AnimatePresence>
    </div>

    {/* RIGHT BUTTON */}
    <button
      onClick={nextSlide}
      className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white text-white transition-all shrink-0"
    >
      <MdKeyboardArrowDown size={20} className="-rotate-90 sm:text-[22px]" />
    </button>
  </div>
)}
</div>


        {showFooter && <Footer />}

        {/* Floating Action Button */}
        <div className="fixed bottom-24 right-8 z-50">
          <Button
            onClick={() =>
              variant === "marketing" ? go(routes.login) : go(routes.dashboard)
            }
            className="w-16 h-16 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300"
            style={{
              background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
              boxShadow: "0 0 40px rgba(26,115,232,0.35)",
            }}
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* ===== Feedback vertical pill (50x130) =====
          Placed above the Smartgen/Marketplace CTAs and sticks to the laptop screen's right edge */}
      {fbPos && (
    <button
  type="button"
  onClick={() => setFeedbackOpen(true)}   // 👈 open modal
  aria-label="Give feedback"
  className="absolute z-50 text-white font-semibold"
style={{
  position: 'fixed',           // 👈 add this
  width: 50,
  height: 130,
  opacity: 1,
  top: fbPos.top,
  left: fbPos.left,
  borderTopLeftRadius: 16,
  borderBottomLeftRadius: 16,
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
  background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
  boxShadow: "0 0 28px rgba(26,115,232,0.25)",
  writingMode: "vertical-rl",
  textOrientation: "mixed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  letterSpacing: 1,
}}

>
  <span
    className="inline-flex items-center select-none"
    style={{
      transform: "rotate(180deg)", // bottom → top
      gap: 6,
      lineHeight: 1,
      fontFamily: "Inter, ui-sans-serif, system-ui",
      fontWeight: 400,
      fontStyle: "normal",
      fontSize: 16,
      color: "#fff",
      textAlign: "center",
    }}
  >
    <MessageCircleHeart
      aria-hidden
      style={{ width: 22, height: 22, transform: "rotate(180deg)" }} // keep icon upright
    />
    <span>Feedback</span>
  </span>
</button>


      )}

      {feedbackOpen && (
  <div role="dialog" aria-modal="true" className="fixed inset-0 z-[999] grid place-items-center">
    {/* Backdrop */}
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setFeedbackOpen(false)} />

    {/* Card: smaller + capped height + Inter Regular for everything */}
 <div
  className="relative rounded-2xl text-white shadow-2xl"
  style={{
    background: "#17171A", // ← was "#131313"
    width: "min(92vw, 520px)",
    maxHeight: "85vh",
    fontFamily: "Inter",
    fontWeight: 400,
    fontStyle: "normal",
  }}
>

      {/* Close */}
      <button
        aria-label="Close"
        onClick={() => setFeedbackOpen(false)}
        className="absolute right-2 top-2 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8"
      >
        <X className="w-4 h-4 text-white/90" />
      </button>

      {/* Scrollable content (scrollbar hidden) */}
      <div
        className="no-scrollbar overflow-y-auto px-5 md:px-6 py-6 md:py-7"
        style={{ maxHeight: "85vh" }}
      >
        {/* Title (regular weight) */}
        <h3 className="text-center text-[20px] md:text-[22px]" style={{ fontWeight: 400 }}>
          We Value Your Feedback
        </h3>
        <p className="text-center text-white/70 mt-2 leading-snug text-sm">
          Your feedback is important to us We take
          <br />
          it very seriously.
        </p>

        {/* Stars */}
        <div className="mt-5">
          <div className="flex items-center justify-center gap-4">
            {Array.from({ length: 5 }).map((_, i) => {
              const idx = i + 1;
              const active = (hoverRating || rating) >= idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onMouseEnter={() => setHoverRating(idx)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(idx)}
                  className="p-1"
                  aria-label={`Rate ${idx} star${idx > 1 ? "s" : ""}`}
                  style={{ fontFamily: "Inter", fontWeight: 400 }}
                >
                  <Star
                    className="w-6 h-6"
                    style={{
                      color: active ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                      fill: active ? "#FFFFFF" : "transparent",
                    }}
                  />
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] text-white/70 w-[240px] mx-auto mt-2">
            <span>Very bad</span>
            <span>Very Good</span>
          </div>
        </div>

        {/* Write your experience */}
        <div className="mt-6">
          <label className="block mb-2 text-white/90 text-sm">Write your experience</label>
          <div className="relative">
          <textarea
  value={fbForm.experience}
  onChange={(e) =>
    setFbForm((p) => ({ ...p, experience: e.target.value.slice(0, MAX_CHARS) }))
  }
  rows={4}
  className="w-full resize-none rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
  placeholder="Share your thoughts..."
  style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
  required
/>

            <div className="absolute right-3 bottom-2 text-xs text-white/60">
              {fbForm.experience.length}/{MAX_CHARS}
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="mt-5">
          <label className="block mb-2 text-white/90 text-sm">Your Name</label>
       <input
  value={fbForm.name}
  onChange={(e) => setFbForm((p) => ({ ...p, name: e.target.value }))}
  className="w-full rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
  placeholder="Your full name"
  style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
  required
/>

        </div>

        {/* Role */}
        <div className="mt-5">
          <label className="block mb-2 text-white/90 text-sm">Your Role / Designation</label>
          <input
            value={fbForm.role}
            onChange={(e) => setFbForm((p) => ({ ...p, role: e.target.value }))}
            className="w-full rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
            placeholder="e.g., Assistant Manager"
            style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
          />
        </div>

        {/* Organization */}
        <div className="mt-5">
          <label className="block mb-2 text-white/90 text-sm">Organization / Company</label>
          <input
            value={fbForm.org}
            onChange={(e) => setFbForm((p) => ({ ...p, org: e.target.value }))}
            className="w-full rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
            placeholder="Company name"
            style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
          />
        </div>

        {/* File upload */}
        <div className="mt-5">
          <label className="block mb-2 text-white/90 text-sm">Profile Picture</label>
          <div className="flex items-center gap-3">
            <label
              className="cursor-pointer inline-flex items-center rounded-md px-4 py-2 text-sm text-white"
              style={{
                background: "linear-gradient(270deg, #FF14EF 0%, #1A73E8 100%)",
                fontFamily: "Inter",
                fontWeight: 400,
                fontStyle: "normal",
              }}
            >
              Choose file
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFbForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
              />
            </label>
            <div className="flex-1 truncate rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white/70"
                 style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}>
              {fbForm.file ? fbForm.file.name : "No file chosen"}
            </div>
          </div>
        </div>

        {/* Actions — right aligned; Clear sits directly left of Submit */}
        <div className="mt-6 flex items-center justify-end gap-3">
        <button
  type="button"
  onClick={handleClear}
  className="text-white/90 hover:text-white transition"
  style={{
    width: 100,
    height: 49,
    opacity: 1,
    borderRadius: 6,
    border: "1px solid #FFFFFF",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    fontFamily: "Inter",
    fontWeight: 400,
    fontStyle: "normal",
  }}
>
  Clear
</button>


         <button
  type="button"
  onClick={handleSubmitFeedback}
  className="text-white" // removed rounded-xl/px/py to avoid conflicts
  style={{
    width: 162,
    height: 49,
    opacity: 1,
    borderRadius: 6,
    padding: 15,
    gap: 10,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(270deg, #FF14EF 0%, #1A73E8 100%)",
    fontFamily: "Inter",
    fontWeight: 400,
    fontStyle: "normal",
  }}
>
  Submit Feedback
</button>

        </div>
      </div>
    </div>
  </div>
)}




{thankOpen && (
  <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] grid place-items-center">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      onClick={() => setThankOpen(false)}
    />

    {/* Card */}
    <div
      className="relative rounded-2xl text-white shadow-2xl px-6 py-7"
      style={{
        background: "#17171A",
        width: "min(92vw, 500px)",
        border: "1px solid #333335",
      }}
    >
      {/* Close */}
      <button
        aria-label="Close"
        onClick={() => setThankOpen(false)}
        className="absolute right-2 top-2 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8"
      >
        <X className="w-4 h-4 text-white/90" />
      </button>

      {/* Green check icon */}
      <div className="grid place-items-center mb-4">
        <div
          className="grid place-items-center h-14 w-14 rounded-full"
          style={{ background: "rgba(16,185,129,0.18)" }}  /* dark green ring */
        >
          <div
            className="grid place-items-center h-10 w-10 rounded-full"
            style={{ background: "#16A34A" }}  /* green */
          >
            <Check className="w-6 h-6 text-black" />
          </div>
        </div>
      </div>

      {/* Text */}
      <h3 className="text-center text-[18px] md:text-[20px] font-medium">
        Thank you for your feedback!
      </h3>
      <p className="text-center text-white/70 mt-2 text-sm">
        We appreciate your feedback and will review it shortly.
      </p>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setThankOpen(false)}
          className="text-white/90 hover:text-white transition"
          style={{
            width: 110,
            height: 44,
            borderRadius: 6,
            border: "1px solid #FFFFFF",
            background: "transparent",
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => {
            setThankOpen(false);
            handleClear();         // fresh form
            setFeedbackOpen(true); // reopen the form
          }}
          className="text-white"
          style={{
            width: 160,
            height: 44,
            borderRadius: 6,
            background: "#333335",
          }}
        >
          Submit Another
        </button>
      </div>
    </div>
  </div>
)}


    </motion.section>
  );
}
