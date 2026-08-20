


// // import { useState, useEffect, useMemo } from "react";
// // import { useRef } from "react";

// // import { useNavigate } from "react-router-dom";
// // import {  AnimatePresence } from "framer-motion";
// // import { Button } from "@/components/ui/button";
// // import { ArrowRight, Sparkles, Zap, TrendingUp, Star, Sparkle, Mouse, MoveDown } from "lucide-react";
// // import {
// //   DropdownMenu,
// //   DropdownMenuContent,
// //   DropdownMenuTrigger,
// // } from "@/components/ui/dropdown-menu";
// // import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
// // import { motion, animate, useMotionValue, useMotionTemplate } from "framer-motion";
// // import Footer from "@/components/Footer";
// // import SubscriptionModal from "@/components/SubscriptionModal";
// // import { Settings, ChevronDown } from "lucide-react";
// // import { useAuth } from "@/contexts/AuthContext";
// // import { MessageCircleHeart, X } from "lucide-react";
// // import { GlobeSection, FAQSection , TickerSection } from "@/components/GlobeAndFAQ_components";
// // // top of file (with other lucide-react imports)
// // import { Check  } from "lucide-react";
// // import { LuBadgeCheck } from "react-icons/lu";
// // import { FaArrowRight } from "react-icons/fa";
// // import { FiArrowRight } from "react-icons/fi";
// // import AccountMenu from "@/components/AccountMenu";
// // const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

// // /* --- tiny helper: star with true gradient color using CSS mask --- */
// // function MaskedStar({ size = 14 }: { size?: number }) {
// //   const starMask = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896 4.665 23.165l1.401-8.168L.132 9.21l8.2-1.192z'/%3E%3C/svg%3E")`;
// //   const common: React.CSSProperties = {
// //     display: "inline-block",
// //     width: size,
// //     height: size,
// //     backgroundImage: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //     WebkitMaskImage: starMask,
// //     maskImage: starMask,
// //     WebkitMaskRepeat: "no-repeat",
// //     maskRepeat: "no-repeat",
// //     WebkitMaskPosition: "center",
// //     maskPosition: "center",
// //     WebkitMaskSize: "contain",
// //     maskSize: "contain",
// //   };
// //   return <span style={common} aria-hidden="true" />;
// // }

// // /* --- reusable badge button --- */
// // function GradientBadge({
// //   label = "Trusted by industry leaders",
// //   showIcon = true,
// // }: {
// //   label?: string;
// //   showIcon?: boolean;
// // }) {
// //   return (
// //     <button
// //       type="button"
// //       className="inline-flex items-center rounded-full"
// //       style={{
// //         background: "#252525",
// //         border: "1px solid #333335",
// //         padding: "10px 14px",
// //         gap: showIcon ? 8 : 0,
// //       }}
// //     >
// //       {showIcon ? <MaskedStar size={16} /> : null}
// //       <span
// //         className="bg-clip-text text-transparent"
// //         style={{
// //           backgroundImage: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //           fontFamily: "Inter, ui-sans-serif, system-ui",
// //           fontWeight: 500,
// //           fontSize: 16,
// //           lineHeight: "100%",
// //         }}
// //       >
// //         {label}
// //       </span>
// //     </button>
// //   );
// // }

// // type LandingProps = {
// //   variant?: "marketing" | "app";
// //   userFullName?: string;
// //   routes?: {
// //     login?: string;
// //     signup?: string;
// //     app?: string;
// //     promptLibrary?: string;
// //     smartgen?: string;
// //     marketplace?: string;
// //     dashboard?: string;
// //     profile?: string;
// //   };
// //   showFooter?: boolean;
// // };

// // export default function Landing({
// //   variant = "marketing",
// //   userFullName,
// //   routes = {
// //   login: "/login",
// //   signup: "/signup",
// //   app: "/app",
// //   promptLibrary: "/prompt-library",
// //   smartgen: "/smartgen",
// //   marketplace: "/prompt-marketplace",
// //   dashboard: "/app",
// //   profile: "/profile",
// // },
// //   showFooter = true,
// // }: LandingProps) {
// //   const navigate = useNavigate();
// //   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

// //   const color = useMotionValue(COLORS_TOP[0]);
// //   useEffect(() => {
// //     animate(color, COLORS_TOP, {
// //       ease: "easeInOut",
// //       duration: 10,
// //       repeat: Infinity,
// //       repeatType: "mirror",
// //     });
// //   }, [color]);

// //   useEffect(() => {
// //     const handleMouseMove = (e: MouseEvent) => {
// //       setMousePosition({
// //         x: (e.clientX / window.innerWidth) * 2 - 1,
// //         y: (e.clientY / window.innerHeight) * 2 - 1,
// //       });
// //     };
// //     window.addEventListener("mousemove", handleMouseMove);
// //     return () => window.removeEventListener("mousemove", handleMouseMove);
// //   }, []);

// //   const border = useMotionTemplate`1px solid ${color}`;
// //   const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;
// //   const go = (path?: string) => path && navigate(path);
// // const handleGetStarted = () => {
// //   if (isAuthenticated) {
// //     go(routes.dashboard);
// //   } else {
// //     go(routes.signup || "/signup");
// //   }
// // };
// //   // Steps
// //   const [activeStep, setActiveStep] = useState(0);
// //   const [hoveredStep, setHoveredStep] = useState<number | null>(null);
// //  const [activeOffer, setActiveOffer] = useState<number | null>(null);
  

// // // State add karo (existing states ke saath)
// // const [activeOfferIdx, setActiveOfferIdx] = useState<number | null>(null);
// // const [offerPhase,     setOfferPhase]     = useState<"grid" | "split">("grid");
// // const [offerBusy,      setOfferBusy]      = useState(false);

// // const openSplit = (idx: number) => {
// //   if (offerBusy) return;
// //   setOfferBusy(true);
// //   setTimeout(() => {
// //     setActiveOfferIdx(idx);
// //     setOfferPhase("split");
// //     setOfferBusy(false);
// //   }, 215);
// // };
// // const closeSplit = () => {
// //   if (offerBusy) return;
// //   setOfferBusy(true);
// //   setTimeout(() => {
// //     setOfferPhase("grid");
// //     setActiveOfferIdx(null);
// //     setOfferBusy(false);
// //   }, 200);
// // };


 

// //   // const [current, setCurrent] = useState(0);
// //   const [activeButton, setActiveButton] = useState<"left" | "right" | null>(null);
// //   const { isAuthenticated } = useAuth();

// //   const { user, logout } = useAuth();
// //   const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
// //   const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

// //   const displayName = useMemo(() => user?.name?.trim() || "", [user]);
// //   const displayEmail = useMemo(() => user?.email || "", [user]);
// //   const fullName = useMemo(() => {
// //     if (displayName) return displayName;
// //     if (displayEmail) return displayEmail.split("@")[0];
// //     return "User";
// //   }, [displayName, displayEmail]);

// //   const handleLogout = () => {
// //     logout();
// //     navigate("/login");
// //   };

// //   const themeBtn = (id: "light" | "dark" | "system", src: string, alt: string) => (
// //     <button
// //       type="button"
// //       onClick={() => setTheme(id)}
// //       className="inline-flex items-center justify-center rounded-full"
// //       style={{
// //         width: 28,
// //         height: 28,
// //         outline: theme === id ? "2px solid rgba(255,255,255,0.9)" : "none",
// //       }}
// //       aria-pressed={theme === id}
// //       aria-label={alt}
// //       title={alt}
// //     >
// //       <img src={src} alt="" className="w-4 h-4" />
// //     </button>
// //   );

// // const PlanStyledName = ({ user, fullName }: { user: any; fullName: string }) => {
// //   if (user?.plan === "pro") {
// //     return (
// //       <div className="flex items-center gap-2">
// //         <span className="truncate font-semibold bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] text-transparent bg-clip-text">
// //           Hello, {fullName}
// //         </span>
// //         <LuBadgeCheck
// //           className="w-[22px] h-[22px]"
// //           style={{ stroke: "url(#proGradient)", strokeWidth: 2 }}
// //         />
// //         <svg width="0" height="0">
// //           <defs>
// //             <linearGradient id="proGradient" x1="0%" y1="0%" x2="100%" y2="100%">
// //               <stop offset="0%" stopColor="#FF14EF" />
// //               <stop offset="100%" stopColor="#1A73E8" />
// //             </linearGradient>
// //           </defs>
// //         </svg>
// //       </div>
// //     );
// //   }

// //   if (user?.plan === "enterprise") {
// //     return (
// //       <div className="flex items-center gap-2">
// //         <span className="truncate font-semibold bg-gradient-to-r from-[#FACC15] to-[#CA8A04] text-transparent bg-clip-text">
// //           Hello, {fullName}
// //         </span>
// //         <LuBadgeCheck
// //           className="w-[22px] h-[22px]"
// //           style={{ stroke: "url(#enterpriseGradient)", strokeWidth: 2 }}
// //         />
// //         <svg width="0" height="0">
// //           <defs>
// //             <linearGradient id="enterpriseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
// //               <stop offset="0%" stopColor="#FACC15" />
// //               <stop offset="100%" stopColor="#CA8A04" />
// //             </linearGradient>
// //           </defs>
// //         </svg>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="flex items-center gap-2">
// //       <span className="truncate font-semibold text-white">
// //         Hello, {fullName}
// //       </span>
// //       <span className="px-2 py-0.5 text-xs rounded-md bg-gray-700 text-gray-300">
// //         FREE
// //       </span>
// //     </div>
// //   );
// // };



// //   /* ===== Feedback button placement logic =====
// //      Goal: place a 50x130 vertical pill above the Smartgen/Marketplace CTAs,
// //      and horizontally stick it to the right edge of the laptop screen. */
// //   const [fbPos, setFbPos] = useState<{ top: number; left: number } | null>(null);

// //     useEffect(() => {
// //   const PILL_W = 50;             // feedback pill width
// //   const PILL_H = 130;            // feedback pill height
// //   const SAFE = 12;               // margin from edges
// //   const BASE_WRAP_W = 1400;      // your max container width
// //   const DESKTOP_OFFSET = 400;    // your desired desktop offset to the right of the screen

// //   const calc = () => {
// //     const screen = document.getElementById("product-screen-mask");
// //     const ctas = document.getElementById("hero-ctas");
// //     const section = document.getElementById("landing-root");
// //     const wrap = document.getElementById("product-demo-wrap");
// //     if (!screen || !ctas || !section) return;

// //     const s = screen.getBoundingClientRect();
// //     const c = ctas.getBoundingClientRect();
// //     const root = section.getBoundingClientRect();
// //     const wrapRect = wrap?.getBoundingClientRect();

// //     // Scale the desktop offset with the actual wrapper width
// //     const wrapWidth = wrapRect?.width ?? BASE_WRAP_W;
// //     const scale = wrapWidth / BASE_WRAP_W;

// //     const isMobile = window.innerWidth < 640;
// //     // On mobile, keep it tight near the screen; on desktop, use your scaled 245px
// //     const offset = isMobile ? 8 : Math.round(DESKTOP_OFFSET * scale);

// //     // Compute left so the pill's RIGHT edge sits offset beyond the laptop screen's RIGHT edge
// //     let left = Math.round((s.right - root.left) + offset - PILL_W);

// //     // Clamp within the visible section to avoid disappearing off-screen
// //     const maxLeft = root.width - PILL_W - SAFE;
// //     const minLeft = SAFE;
// //     left = Math.max(minLeft, Math.min(left, maxLeft));

// //     // Place ABOVE CTAs: (top of CTAs) - (pill height) - gap
// //     let top = Math.round((c.top - root.top) - PILL_H - 12);
// //     const minTop = SAFE;
// //     const maxTop = root.height - PILL_H - SAFE;
// //     top = Math.max(minTop, Math.min(top, maxTop));

// //     setFbPos({ top, left });
// //   };

// //   calc();
// //   // Recompute on resize/scroll
// //   window.addEventListener("resize", calc);
// //   window.addEventListener("scroll", calc, { passive: true });

// //   // Recompute when the product demo wrapper resizes (e.g., container width changes)
// //   let ro: ResizeObserver | undefined;
// //   const wrapEl = document.getElementById("product-demo-wrap");
// //   if (wrapEl && "ResizeObserver" in window) {
// //     ro = new ResizeObserver(calc);
// //     ro.observe(wrapEl);
// //   }

// //   return () => {
// //     window.removeEventListener("resize", calc);
// //     window.removeEventListener("scroll", calc as any);
// //     ro?.disconnect();
// //   };
// // }, []);




// // const [feedbackOpen, setFeedbackOpen] = useState(false);
// // const [rating, setRating] = useState<number>(0);
// // const [hoverRating, setHoverRating] = useState<number>(0);

// // const [fbForm, setFbForm] = useState<{
// //   experience: string;
// //   name: string;
// //   role: string;
// //   org: string;
// //   file?: File | null;
// // }>({
// //   experience: "",
// //   name: "",
// //   role: "",
// //   org: "",
// //   file: null,
// // });

// // const MAX_CHARS = 500;

// // // Esc to close
// // useEffect(() => {
// //   if (!feedbackOpen) return;
// //   const onKey = (e: KeyboardEvent) => (e.key === "Escape" ? setFeedbackOpen(false) : null);
// //   window.addEventListener("keydown", onKey);
// //   return () => window.removeEventListener("keydown", onKey);
// // }, [feedbackOpen]);

// // const handleClear = () => {
// //   setRating(0);
// //   setHoverRating(0);
// //   setFbForm({ experience: "", name: "", role: "", org: "", file: null });
// // };

// // const handleSubmitFeedback = async () => {
// //   try {
// //     const formData = new FormData();
// //     formData.append("experience", fbForm.experience);
// //     formData.append("name", fbForm.name);
// //     formData.append("role", fbForm.role);
// //     formData.append("orgOrCompany", fbForm.org);
// //     formData.append("rating", String(rating));
// //     if (fbForm.file) formData.append("profilePicture", fbForm.file);

// //     const res = await fetch(`${API_BASE}/api/feedback`, {
// //       method: "POST",
// //       body: formData,
// //     });

// //     const data = await res.json();
// //     console.log("[FEEDBACK SUBMIT RESPONSE]", data);

// //     if (data.success) {
// //       // Add new feedback to list
// //       setFeedbacks((prev) => [data.feedback, ...prev]);
// //       setFeedbackOpen(false);
// //       handleClear();
// //       setThankOpen(true);
// //     } else {
// //       alert("Failed to submit feedback: " + (data.error || "Unknown error"));
// //     }
// //   } catch (err) {
// //     console.error("Submit feedback error:", err);
// //   }
// // };





// // // near your other feedback state
// // const [thankOpen, setThankOpen] = useState(false);
// // // testimonials now come from saved feedbacks
// // const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);


// // useEffect(() => {
// //   const fetchFeedbacks = async () => {
// //     try {
// //       const res = await fetch(`${API_BASE}/api/feedback`);
// //       const data = await res.json();
// //       console.log("[FEEDBACK FETCH RESPONSE]", data);

// //       if (data.success) {
// //         setFeedbacks(data.feedbacks);
// //       }
// //     } catch (err) {
// //       console.error("Fetch feedback error:", err);
// //     }
// //   };

// //   fetchFeedbacks();
// // }, []);


// // // === Feedback types + storage helpers + avatar utils ===
// // type Feedback = {
// //   id: string;
// //   when: number;
// //   name: string;
// //   role: string;
// //   org: string;
// //   rating: number;
// //   experience: string;
// //   avatar?: string; // data URL
// // };

// // const FB_KEY = "tokun_feedbacks";
// // const MAX_FEEDBACKS = 100;
// // const MAX_BYTES = 4_500_000; // ~4.5MB guard

// // function loadFeedbacks(): Feedback[] {
// //   try {
// //     const raw = localStorage.getItem(FB_KEY);
// //     return raw ? (JSON.parse(raw) as Feedback[]) : [];
// //   } catch {
// //     return [];
// //   }
// // }

// // function saveFeedbacksSafe(list: Feedback[]) {
// //   // keep last N & prune until size fits
// //   const pruned = list.slice(-MAX_FEEDBACKS);
// //   let json = JSON.stringify(pruned);
// //   while (json.length > MAX_BYTES && pruned.length) {
// //     pruned.shift();
// //     json = JSON.stringify(pruned);
// //   }
// //   try {
// //     localStorage.setItem(FB_KEY, json);
// //   } catch (e) {
// //     console.warn("localStorage save failed:", e);
// //   }
// // }

// // async function fileToAvatarDataUrl(file: File, size = 64, quality = 0.72): Promise<string> {
// //   const dataUrl = await new Promise<string>((res, rej) => {
// //     const r = new FileReader();
// //     r.onload = () => res(r.result as string);
// //     r.onerror = rej;
// //     r.readAsDataURL(file);
// //   });

// //   const img = await new Promise<HTMLImageElement>((res, rej) => {
// //     const i = new Image();
// //     i.onload = () => res(i);
// //     i.onerror = rej;
// //     i.src = dataUrl;
// //   });

// //   const canvas = document.createElement("canvas");
// //   canvas.width = canvas.height = size;
// //   const ctx = canvas.getContext("2d")!;
// //   const minSide = Math.min(img.width, img.height);
// //   const sx = (img.width - minSide) / 2;
// //   const sy = (img.height - minSide) / 2;
// //   ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
// //   return canvas.toDataURL("image/jpeg", quality);
// // }

// // function initialsFrom(name: string) {
// //   const parts = (name || "User").trim().split(/\s+/);
// //   return (parts[0]?.[0] || "U") + (parts[1]?.[0] || "");
// // }
// // function colorFor(name: string) {
// //   let h = 0;
// //   for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
// //   return `hsl(${h},70%,45%)`;
// // }
// // function svgInitialsAvatar(name: string, size = 64) {
// //   const initials = initialsFrom(name).toUpperCase();
// //   const bg = colorFor(name);
// //   const svg =
// //     `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
// //     `<rect width='100%' height='100%' rx='${size / 2}' fill='${bg}'/>` +
// //     `<text x='50%' y='54%' font-family='Inter,system-ui,sans-serif' font-size='${size * 0.42}' text-anchor='middle' fill='white' dy='.1em'>${initials}</text>` +
// //     `</svg>`;
// //   return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
// // }


// // const [current, setCurrent] = useState(0);

// // const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";


// // const FEATURE_PREVIEWS = [
// //   {
// //     icon: Zap,
// //     title: "Prompt Optimization",
// //     description:
// //       "Reduce token usage by up to 60% while maintaining meaning and effectiveness across all LLM platforms.",
// //     onClick: () => go(routes.smartgen),
// //     mediaSrc: "/icons/srt.mp4",
// //   },
// //   {
// //     icon: Sparkles,
// //     title: "Smartgen Generator",
// //     description:
// //       "Transform simple ideas into powerful, optimized prompts with our AI-powered generation system.",
// //     onClick: () => go(routes.smartgen),
// //     mediaSrc: "/icons/srt.mp4",
// //   },
// //   {
// //     icon: TrendingUp,
// //     title: "Prompt Marketplace",
// //     description:
// //       "Built a great prompt? Trade it. Monetize your creativity and earn from your best prompt innovations.",
// //     onClick: () => go(routes.marketplace),
// //    mediaSrc: "/icons/srt.mp4",
// //   },
// //   {
// //     icon: null,
// //     image: "/icons/circle.png",
// //     title: "Prompt Library",
// //     description:
// //       "Access categorized prompts for Coding, Design, Marketing, Video Creation, and more.",
// //     onClick: () => go(routes.promptLibrary),
// //     mediaSrc: "/icons/srt.mp4",
// //   },
// // ];


// // const [previewIndex, setPreviewIndex] = useState<number | null>(null);
// // const [previewPhase, setPreviewPhase] = useState<"idle" | "entering" | "open">("idle");
// // const previewTimerRef = useRef<number | null>(null);

// // const activeFeature =
// //   previewIndex !== null ? FEATURE_PREVIEWS[previewIndex] : null;

// // const openOfferPreview = (index: number) => {
// //   if (previewPhase !== "idle") return;

// //   if (previewTimerRef.current) {
// //     window.clearTimeout(previewTimerRef.current);
// //   }

// //   setPreviewIndex(index);
// //   setPreviewPhase("entering");

// //   previewTimerRef.current = window.setTimeout(() => {
// //     setPreviewPhase("open");
// //   }, 520);
// // };

// // const closeOfferPreview = () => {
// //   if (previewTimerRef.current) {
// //     window.clearTimeout(previewTimerRef.current);
// //     previewTimerRef.current = null;
// //   }

// //   setPreviewPhase("idle");
// //   setPreviewIndex(null);
// // };

// // useEffect(() => {
// //   return () => {
// //     if (previewTimerRef.current) {
// //       window.clearTimeout(previewTimerRef.current);
// //     }
// //   };
// // }, []);


// // const nextSlide = () => {
// //   setCurrent((prev) => (prev + 1) % feedbacks.length);
// // };

// // const prevSlide = () => {
// //   setCurrent((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);
// // };

// // // auto slide
// // useEffect(() => {
// //   if (feedbacks.length <= 1) return;

// //   const interval = setInterval(() => {
// //     nextSlide();
// //   }, 4000);

// //   return () => clearInterval(interval);
// // }, [feedbacks]);




// // const HOW_IT_WORKS_NUMBER_COLOR = "#252526";

// // const HOW_IT_WORKS_STEPS = [
// //   {
// //     step: "Input Idea",
// //     iconSrc: "/icons/Group 643.png",
// //     description: "Share your concept or requirement",
// //   },
// //   {
// //     step: "SmartGen",
// //     iconSrc: "/icons/Group 646.png",
// //     description: "AI generates optimized prompts",
// //   },
// //   {
// //     step: "Optimize",
// //     iconSrc: "/icons/iyt.png",
// //     description: "Reduce tokens, improve quality",
// //   },
// //   {
// //     step: "Save or Sale",
// //     iconSrc: "/icons/Group 650.png",
// //     description: "Store in library or marketplace",
// //   },
// //   {
// //     step: "Earn",
// //     iconSrc: "/icons/Group.png",
// //     description: "Monetize your best prompts",
// //   },
// // ];


// //   return (
// //     <motion.section
// //       id="landing-root"
// //       style={{ backgroundColor: "#030406" }}
// //     className="relative min-h-screen overflow-x-hidden text-gray-200 bg-[#030406]"
// //     >
// //       {/* --- Background image (homeban) --- */}
// //       <img
// //         src="/icons/homeban.png"
// //         alt="Tokun neon background"
// //      className="pointer-events-none select-none absolute -top-24 right-0 z-0 w-[72vw] max-w-none opacity-90 mix-blend-screen"
// //       />
// //       {/* Subtle radial glow behind hero copy */}
// //       <div
// //         aria-hidden
// // className="absolute left-1/2 top-24 z-0 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(191,44,255,0.22),rgba(0,0,0,0))] blur-3xl"
// //       />
// //       {/* Fine vignette to focus center */}
// //       <div
// //         aria-hidden
// //      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[1120px] bg-[radial-gradient(60%_50%_at_50%_30%,rgba(139,92,246,0.12),rgba(0,0,0,0))]"
// //       />

// //       {/* HEADER */}
// // <header className="relative z-20 w-full">
// //   <div className="px-4 md:px-6 lg:px-8 py-4 lg:py-6">
// //     <div className="container mx-auto flex items-center justify-between">

// //       {/* Logo */}
// //       <div className="flex items-center gap-2 sm:gap-3 min-w-0">
// //         <img
// //   src="/icons/Tokun.png"
// //   alt="Tokun.world Logo"
// //   className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain transition-transform duration-200 hover:scale-105"
// // />
// //       </div>

// //       {/* Right Section */}
// //       <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
// //         {variant === "marketing" ? (
// //           <>
// //             <button
// //               onClick={() => go(routes.login)}
// //               className="hidden sm:block text-white/95 hover:text-white transition-colors"
// //               style={{ fontSize: 14, fontWeight: 600 }}
// //             >
// //               Login
// //             </button>
// // <button
// //   type="button"
// //   onClick={handleGetStarted}
// //   className="inline-flex items-center justify-center rounded-full hover:opacity-95 transition-opacity"
// //   style={{
// //     height: 40,
// //     padding: "0 16px",
// //     borderRadius: 200,
// //     background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
// //     color: "#FFFFFF",
// //     fontFamily: "Inter, system-ui, Arial, sans-serif",
// //     fontWeight: 600,
// //     fontSize: 13,
// //     lineHeight: "20px",
// //     gap: 6,
// //   }}
// // >
// //   <span>Get Started</span>
// //   <span
// //     aria-hidden
// //     className="inline-flex items-center justify-center rounded-full bg-white"
// //     style={{ width: 22, height: 22 }}
// //   >
// //     <MdKeyboardArrowRight size={14} color="black" />
// //   </span>
// // </button>
// //           </>
// //         ) : (
// //           <DropdownMenu>
// //             <AccountMenu />
// //           </DropdownMenu>
// //         )}
// //       </div>
// //     </div>
// //   </div>
// // </header>

// //       {/* MAIN */}
// // <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-8 pb-0">
// //         {/* HERO */}
// //         <div className="text-center space-y-8 mb-20">
// //           {/* <div className="flex justify-center">
// //             <GradientBadge label="Trusted by industry leaders" showIcon />
// //           </div> */}

// //           <div
// //             className="transform transition-transform duration-300 ease-out"
// //             style={{
// //               transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`,
// //             }}
// //           >
// //            <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight flex justify-center">
// //   <span className="relative inline-flex items-center justify-center select-none">
// //     {/* ambient glow behind full word */}
// //     <motion.span
// //       aria-hidden
// //       className="absolute inset-0 blur-3xl"
// //       style={{
// //         background:
// //           "radial-gradient(circle at 50% 50%, rgba(255,20,239,0.28) 0%, rgba(26,115,232,0.22) 38%, rgba(0,0,0,0) 72%)",
// //       }}
// //       animate={{
// //         opacity: [0.35, 0.7, 0.35],
// //         scale: [0.96, 1.04, 0.96],
// //       }}
// //       transition={{
// //         duration: 4.5,
// //         repeat: Infinity,
// //         ease: "easeInOut",
// //       }}
// //     />

// //     {/* whole word breathing */}
// //     <motion.span
// //       className="relative inline-flex items-center"
// //       animate={{
// //         y: [0, -2, 0],
// //         scale: [1, 1.01, 1],
// //       }}
// //       transition={{
// //         duration: 4,
// //         repeat: Infinity,
// //         ease: "easeInOut",
// //       }}
// //     >
// //       {/* T */}
// //       <motion.span
// //         className="relative inline-block bg-clip-text text-transparent"
// //         style={{
// //           backgroundImage:
// //             "linear-gradient(180deg, #ffffff 0%, #dbe8ff 38%, #7dd3fc 72%, #ffffff 100%)",
// //           WebkitBackgroundClip: "text",
// //           backgroundClip: "text",
// //           textShadow: "0 0 18px rgba(125,211,252,0.18)",
// //         }}
// //         animate={{
// //           opacity: [1, 0.92, 1],
// //           filter: [
// //             "drop-shadow(0 0 4px rgba(125,211,252,0.14))",
// //             "drop-shadow(0 0 10px rgba(26,115,232,0.18))",
// //             "drop-shadow(0 0 4px rgba(125,211,252,0.14))",
// //           ],
// //         }}
// //         transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
// //       >
// //         T
// //       </motion.span>

// //       {/* O */}
// //       <motion.span
// //         className="relative inline-block bg-clip-text text-transparent"
// //         style={{
// //           backgroundImage:
// //             "linear-gradient(180deg, #ffffff 0%, #e8dcff 34%, #c084fc 68%, #ffffff 100%)",
// //           WebkitBackgroundClip: "text",
// //           backgroundClip: "text",
// //         }}
// //         animate={{
// //           opacity: [0.95, 1, 0.95],
// //           rotateZ: [0, 0.2, 0],
// //         }}
// //         transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
// //       >
// //         O
// //       </motion.span>

// //       {/* K */}
// //       <motion.span
// //         className="relative inline-block bg-clip-text text-transparent"
// //         style={{
// //           backgroundImage:
// //             "linear-gradient(180deg, #ffffff 0%, #d9dbff 30%, #60a5fa 65%, #ffffff 100%)",
// //           WebkitBackgroundClip: "text",
// //           backgroundClip: "text",
// //         }}
// //         animate={{
// //           opacity: [1, 0.94, 1],
// //         }}
// //         transition={{ duration: 2.9, repeat: Infinity, ease: "easeInOut" }}
// //       >
// //         K
// //       </motion.span>

// //       {/* U special AI core */}
// //       <span className="relative inline-flex items-center justify-center mx-[4px]">
// //         {/* outer ring */}
// //         <motion.span
// //           className="absolute rounded-full"
// //           style={{
// //             width: "1.12em",
// //             height: "1.12em",
// //             border: "1px solid rgba(125,211,252,0.42)",
// //             boxShadow:
// //               "0 0 16px rgba(26,115,232,0.25), inset 0 0 12px rgba(255,20,239,0.16)",
// //           }}
// //           animate={{
// //             scale: [0.88, 1.16, 0.88],
// //             opacity: [0.35, 0.9, 0.35],
// //           }}
// //           transition={{
// //             duration: 2.4,
// //             repeat: Infinity,
// //             ease: "easeInOut",
// //           }}
// //         />

// //         {/* inner ring */}
// //         <motion.span
// //           className="absolute rounded-full"
// //           style={{
// //             width: "0.78em",
// //             height: "0.78em",
// //             border: "1px solid rgba(255,20,239,0.35)",
// //           }}
// //           animate={{
// //             scale: [1.15, 0.92, 1.15],
// //             opacity: [0.15, 0.55, 0.15],
// //           }}
// //           transition={{
// //             duration: 2,
// //             repeat: Infinity,
// //             ease: "easeInOut",
// //           }}
// //         />

// //         {/* orbit dot pink */}
// //         <motion.span
// //           className="absolute rounded-full"
// //           style={{
// //             width: 7,
// //             height: 7,
// //             background: "#FF14EF",
// //             boxShadow: "0 0 14px rgba(255,20,239,0.9)",
// //             top: "50%",
// //             left: "50%",
// //             marginLeft: -3.5,
// //             marginTop: -3.5,
// //           }}
// //           animate={{
// //             x: [0, 16, 0, -16, 0],
// //             y: [-18, 0, 18, 0, -18],
// //             scale: [0.9, 1.1, 0.9, 1.1, 0.9],
// //           }}
// //           transition={{
// //             duration: 4.2,
// //             repeat: Infinity,
// //             ease: "linear",
// //           }}
// //         />

// //         {/* orbit dot blue */}
// //         <motion.span
// //           className="absolute rounded-full"
// //           style={{
// //             width: 6,
// //             height: 6,
// //             background: "#1A73E8",
// //             boxShadow: "0 0 14px rgba(26,115,232,0.95)",
// //             top: "50%",
// //             left: "50%",
// //             marginLeft: -3,
// //             marginTop: -3,
// //           }}
// //           animate={{
// //             x: [0, -14, 0, 14, 0],
// //             y: [16, 0, -16, 0, 16],
// //             scale: [1.05, 0.85, 1.05, 0.85, 1.05],
// //           }}
// //           transition={{
// //             duration: 3.6,
// //             repeat: Infinity,
// //             ease: "linear",
// //           }}
// //         />

// //         {/* U letter */}
// //         <motion.span
// //           className="relative inline-block bg-clip-text text-transparent"
// //           style={{
// //             backgroundImage:
// //               "linear-gradient(180deg, #ffffff 0%, #67e8f9 30%, #1A73E8 64%, #FF14EF 100%)",
// //             WebkitBackgroundClip: "text",
// //             backgroundClip: "text",
// //             textShadow: "0 0 22px rgba(26,115,232,0.28)",
// //           }}
// //           animate={{
// //             y: [0, -3, 0],
// //             filter: [
// //               "drop-shadow(0 0 8px rgba(26,115,232,0.22))",
// //               "drop-shadow(0 0 18px rgba(255,20,239,0.35))",
// //               "drop-shadow(0 0 8px rgba(26,115,232,0.22))",
// //             ],
// //           }}
// //           transition={{
// //             duration: 2.2,
// //             repeat: Infinity,
// //             ease: "easeInOut",
// //           }}
// //         >
// //           U
// //         </motion.span>
// //       </span>

// //       {/* N */}
// //       <motion.span
// //         className="relative inline-block bg-clip-text text-transparent"
// //         style={{
// //           backgroundImage:
// //             "linear-gradient(180deg, #ffffff 0%, #f0e9ff 34%, #f472b6 70%, #ffffff 100%)",
// //           WebkitBackgroundClip: "text",
// //           backgroundClip: "text",
// //         }}
// //         animate={{
// //           opacity: [0.96, 1, 0.96],
// //         }}
// //         transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut" }}
// //       >
// //         N
// //       </motion.span>

// //       {/* shimmer sweep */}
// //       <motion.span
// //         aria-hidden
// //         className="pointer-events-none absolute inset-0"
// //         style={{
// //           background:
// //             "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 48%, transparent 100%)",
// //           mixBlendMode: "screen",
// //           filter: "blur(10px)",
// //         }}
// //         animate={{ x: ["-130%", "130%"] }}
// //         transition={{
// //           duration: 2.6,
// //           repeat: Infinity,
// //           ease: "linear",
// //           repeatDelay: 1.1,
// //         }}
// //       />

// //       {/* top scanner line */}
// //       <motion.span
// //         aria-hidden
// //         className="pointer-events-none absolute left-0 right-0 h-[2px] rounded-full"
// //         style={{
// //           top: "16%",
// //           background:
// //             "linear-gradient(90deg, transparent 0%, rgba(103,232,249,0.85) 50%, transparent 100%)",
// //           boxShadow: "0 0 14px rgba(103,232,249,0.5)",
// //         }}
// //         animate={{
// //           x: ["-12%", "12%", "-12%"],
// //           opacity: [0.25, 0.95, 0.25],
// //         }}
// //         transition={{
// //           duration: 3.2,
// //           repeat: Infinity,
// //           ease: "easeInOut",
// //         }}
// //       />
// //     </motion.span>

// //     {/* bottom neon reflection */}
// //     <motion.span
// //       aria-hidden
// //       className="absolute left-[8%] right-[8%] -bottom-2 h-4 rounded-full blur-xl"
// //       style={{
// //         background:
// //           "linear-gradient(90deg, rgba(26,115,232,0.0) 0%, rgba(26,115,232,0.18) 30%, rgba(255,20,239,0.22) 70%, rgba(255,20,239,0.0) 100%)",
// //       }}
// //       animate={{
// //         opacity: [0.25, 0.55, 0.25],
// //         scaleX: [0.96, 1.03, 0.96],
// //       }}
// //       transition={{
// //         duration: 3.4,
// //         repeat: Infinity,
// //         ease: "easeInOut",
// //       }}
// //     />
// //   </span>
// // </h1>



// // {/* <img
// //   src="/icons/tokun-logo-transparent.png"
// //   alt="Tokun"
// //   className="w-[320px] sm:w-[440px] md:w-[560px] lg:w-[680px] object-contain"
// // /> */}

// //             <h2 className="text-3xl md:text-4xl font-bold mb-8">
// //               Enter the Promptverse
// //             </h2>
// //             <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
// //               Optimize your LLM prompts, generate better outcomes, and monetize your best prompts—all in one place.
// //             </p>
// //           </div>
// //         </div>

// //  {/* CTAs */}
// // <div
// //   id="hero-ctas"
// //   className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-6 sm:mt-20 mb-16"
// // >
// //   {/* Smartgen + Arrow */}
// //   <div className="relative">
// //     <motion.img
// //       src="/icons/arr.png"
// //       alt="arrow highlight"
// //       className="pointer-events-none select-none absolute -top-6 -left-8 w-9 sm:-top-7 sm:-left-10 sm:w-10"
// //     />
// //     <motion.button
// //       onClick={() => go(routes.smartgen)}
// //       whileHover={{ scale: 1.05 }}
// //       className="relative w-[200px] sm:w-[220px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold shadow-2xl border border-white/10 backdrop-blur-md flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg"
// //       style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
// //     >
// //       <div className="absolute inset-0 rounded-full bg-white opacity-10 blur-[6px] pointer-events-none" />
// //       <span>Try Smartgen</span>
// //       <span
// //         aria-hidden
// //         className="inline-flex items-center justify-center rounded-full bg-white"
// //         style={{ width: 24, height: 24 }}
// //       >
// //         <MdKeyboardArrowRight size={14} color="black" />
// //       </span>
// //     </motion.button>

// //     {/* <motion.button
// //   onClick={() => go(routes.smartgen)}
// //   whileHover={{ scale: 1.05 }}
// //   className="steam-btn relative w-[200px] sm:w-[220px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold"
// //   style={{ borderRadius: 9999 }}
// // >
// //   <span
// //     className="steam-btn-inner backdrop-blur-md border border-white/10"
// //     style={{
// //       borderRadius: 9999,
// //       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
// //       boxShadow: "0 10px 30px rgba(255,20,239,0.18)",
// //       gap: 12,
// //       fontSize: "inherit",
// //     }}
// //   >
// //     <span>Try Smartgen</span>
// //     <span
// //       aria-hidden
// //       className="inline-flex items-center justify-center rounded-full bg-white"
// //       style={{ width: 24, height: 24 }}
// //     >
// //       <MdKeyboardArrowRight size={14} color="black" />
// //     </span>
// //   </span>
// // </motion.button> */}
// //   </div>

// //  <motion.button
// //     onClick={() => go(routes.marketplace)}
// //     whileHover={{ 
// //       scale: 1.05,
// //       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
// //       borderColor: "transparent"
// //     }}
// //     initial={{
// //       background: "transparent",
// //       borderColor: "rgba(255,255,255,0.25)"
// //     }}
// //     className="relative w-[200px] sm:w-[220px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold shadow-2xl backdrop-blur-md flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg"
// //     style={{ 
// //       border: "1px solid rgba(255,255,255,0.25)"
// //     }}
// //   >
// //     Prompt Marketplace
// //   </motion.button>


// //   {/* <motion.button
// //   onClick={() => go(routes.marketplace)}
// //   whileHover={{ scale: 1.05 }}
// //   className="steam-btn relative w-[200px] sm:w-[220px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold"
// //   style={{ borderRadius: 9999 }}
// // >
// //   <span
// //     className="steam-btn-inner backdrop-blur-md border border-white/10"
// //     style={{
// //       borderRadius: 9999,
// //       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
// //       boxShadow: "0 10px 30px rgba(255,20,239,0.18)",
// //     }}
// //   >
// //     Prompt Marketplace
// //   </span>
// // </motion.button> */}
// // </div>
// //         {/* STATS */}
// //         {/* <section className="mt-20">
// //           <div className="container mx-auto px-6">
// //             <div className="flex flex-col md:flex-row justify-center items-center text-center gap-8 font-[Inter]">
// //               <div className="flex flex-col items-center">
// //                 <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px", fontWeight: 500 }}>
// //                   Prompts Optimized
// //                 </div>
// //                 <div className="text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
// //                   50k
// //                 </div>
// //               </div>

// //               <div className="hidden md:block h-[19px] w-px bg-white/40 mx-4"></div>

// //               <div className="flex flex-col items-center">
// //                 <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px" }}>
// //                   Average Token Reduction
// //                 </div>
// //                 <div className="text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
// //                   60%
// //                 </div>
// //               </div>

// //               <div className="hidden md:block h-[19px] w-px bg-white/40 mx-4"></div>

// //               <div className="flex flex-col items-center">
// //                 <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px" }}>
// //                   User Rating
// //                 </div>
// //                 <div className="flex items-center gap-2 text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
// //                   <Star className="h-5 w-5 text-white" />
// //                   4.9
// //                 </div>
// //               </div>

// //               <div className="hidden md:block h-[19px] w-px bg-white/40 mx-4"></div>

// //               <div className="flex flex-col items-center">
// //                 <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px" }}>
// //                   Support Available
// //                 </div>
// //                 <div className="text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
// //                   24/7
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </section> */}


// // <section className="mt-20">
// //   <div className="container mx-auto px-4 sm:px-6">
// //     <div className="grid grid-cols-2 md:flex md:flex-row justify-center items-center gap-6 md:gap-10 font-[Inter]">
      
// //       <div className="flex flex-col items-center">
// //         <div className="text-white/90 mb-2 font-medium text-xs sm:text-sm md:text-base">
// //           Prompts Optimized
// //         </div>
// //         <div className="text-white font-extrabold text-2xl md:text-4xl tracking-tight">
// //           50k
// //         </div>
// //       </div>

// //       <div className="flex flex-col items-center">
// //         <div className="text-white/90 mb-2 font-medium text-xs sm:text-sm md:text-base">
// //           Token Reduction
// //         </div>
// //         <div className="text-white font-extrabold text-2xl md:text-4xl tracking-tight">
// //           60%
// //         </div>
// //       </div>

// //       <div className="flex flex-col items-center">
// //         <div className="text-white/90 mb-2 font-medium text-xs sm:text-sm md:text-base">
// //           User Rating
// //         </div>
// //         <div className="flex items-center gap-2 text-white font-extrabold text-2xl md:text-4xl tracking-tight">
// //           <Star className="h-5 w-5 md:h-7 md:w-7 text-white" />
// //           4.9
// //         </div>
// //       </div>

// //       <div className="flex flex-col items-center">
// //         <div className="text-white/90 mb-2 font-medium text-xs sm:text-sm md:text-base">
// //           Support
// //         </div>
// //         <div className="text-white font-extrabold text-2xl md:text-4xl tracking-tight">
// //           24/7
// //         </div>
// //       </div>
// //     </div>
// //   </div>
// // </section>
// // {/* 
// //              <div className="mt-12">
// //   <TickerSection />
// // </div> */}

// //        <div className="mt-8 flex flex-col items-center justify-center text-center select-none">
// //   <Mouse className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-white/70" strokeWidth={2.25} />
// //   <div className="mt-2 text-white/80" style={{ fontFamily: "Inter, ui-sans-serif, system-ui", fontSize: 12, lineHeight: "16px" }}>
// //     Scroll down
// //   </div>
// //   <motion.div className="mt-2" animate={{ y: [0, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
// //     <MoveDown className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 text-white/80" strokeWidth={2.25} />
// //   </motion.div>
// // </div>

// // {/* ══════════ OFFER SECTION ══════════ */}
// // <div className="mt-28">
// //   <AnimatePresence mode="wait">
// //     {/* ─── GRID VIEW ─── */}
// //     {offerPhase === "grid" && (
// //       <motion.div
// //         key="offer-grid"
// //         initial={{ opacity: 0, scale: 0.94, y: 22 }}
// //         animate={{ opacity: 1, scale: 1, y: 0 }}
// //         exit={{ opacity: 0, scale: 0.96, y: 6 }}
// //         transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
// //       >
// //         <h2
// //           className="text-3xl md:text-5xl font-extrabold text-center mb-12 tracking-tight"
// //           style={{ letterSpacing: "-0.03em" }}
// //         >
// //           What We Offer
// //         </h2>

// //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
// //           {FEATURE_PREVIEWS.map((feature, i) => {
// //             const Icon = feature.icon;

// //             return (
// //               <motion.button
// //                 key={feature.title}
// //                 type="button"
// //                 onClick={() => openSplit(i)}
// //                 initial={{ opacity: 0, scale: 0.88, y: 18 }}
// //                 animate={{ opacity: 1, scale: 1, y: 0 }}
// //                 transition={{
// //                   duration: 0.45,
// //                   ease: [0.22, 1, 0.36, 1],
// //                   delay: i * 0.07,
// //                 }}
// //                 whileHover={{
// //                   y: -10,
// //                   scale: 1.025,
// //                   transition: {
// //                     type: "spring",
// //                     stiffness: 280,
// //                     damping: 18,
// //                   },
// //                 }}
// //                 whileTap={{ scale: 0.97 }}
// //                 className="group relative rounded-[28px] p-[1px] text-left overflow-hidden h-full"
// //                 style={{
// //                   background: "linear-gradient(160deg,#252528,#0d0e12)",
// //                 }}
// //               >
// //                 {/* Glow behind border */}
// //                 <div
// //                   className="pointer-events-none absolute -inset-px rounded-[29px] opacity-0 group-hover:opacity-100 transition-opacity duration-400"
// //                   style={{
// //                     background: "linear-gradient(135deg,#FF14EF,#1A73E8)",
// //                     filter: "blur(14px)",
// //                     zIndex: 0,
// //                   }}
// //                 />

// //                 {/* Border itself */}
// //                 <div
// //                   className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-350"
// //                   style={{
// //                     background: "linear-gradient(135deg,#FF14EF,#1A73E8)",
// //                   }}
// //                 />

// //                 <div className="relative rounded-[26px] bg-[#030406] group-hover:bg-[#06070d] transition-colors duration-300 p-6 flex flex-col gap-3 h-full z-[1]">
// //                   {/* Number - same as How It Works */}
// //                   <span
// //                     className="absolute top-3 right-3"
// //                     style={{
// //                       width: 26,
// //                       height: 24,
// //                       opacity: 1,
// //                       fontFamily: "Inter, ui-sans-serif, system-ui",
// //                       fontWeight: 500,
// //                       fontStyle: "normal",
// //                       fontSize: 20,
// //                       lineHeight: "100%",
// //                       letterSpacing: "0%",
// //                       textAlign: "right",
// //                       color: "#252526",
// //                     }}
// //                   >
// //                     {String(i + 1).padStart(2, "0")}
// //                   </span>

// //                   {/* Icon box */}
// //                   <div
// //                     className="w-11 h-11 rounded-[14px] flex items-center justify-center transition-all duration-300 group-hover:bg-white/8"
// //                     style={{
// //                       background: "rgba(255,255,255,0.04)",
// //                       border: "1px solid rgba(255,255,255,0.07)",
// //                     }}
// //                   >
// //                     {feature.image ? (
// //                       <img
// //                         src={feature.image}
// //                         className="h-6 w-6 object-contain"
// //                         alt=""
// //                       />
// //                     ) : Icon ? (
// //                       <>
// //                         <Icon
// //                           className="h-6 w-6"
// //                           style={{
// //                             stroke: "url(#ig-grid)",
// //                             strokeWidth: 1.7,
// //                             fill: "none",
// //                           }}
// //                         />
// //                         <svg width="0" height="0" aria-hidden>
// //                           <defs>
// //                             <linearGradient
// //                               id="ig-grid"
// //                               x1="0"
// //                               y1="0"
// //                               x2="0"
// //                               y2="1"
// //                             >
// //                               <stop offset="0%" stopColor="#1A73E8" />
// //                               <stop offset="100%" stopColor="#FF14EF" />
// //                             </linearGradient>
// //                           </defs>
// //                         </svg>
// //                       </>
// //                     ) : null}
// //                   </div>

// //                   <div
// //                     className="font-bold text-[17px] text-white tracking-tight leading-snug"
// //                     style={{ letterSpacing: "-0.02em" }}
// //                   >
// //                     {feature.title}
// //                   </div>

// //                   <div className="text-[11.5px] text-white/55 leading-relaxed flex-1">
// //                     {feature.description}
// //                   </div>

// //                   {/* Explore CTA */}
// //                   <div className="mt-auto flex items-center gap-1.5 text-[11px] font-semibold text-white/35 group-hover:text-white/75 transition-colors duration-300 tracking-wide">
// //                     <span>Explore</span>
// //                     <div className="w-[22px] h-[22px] rounded-full border border-current flex items-center justify-center text-[11px] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[#FF14EF] group-hover:to-[#1A73E8] group-hover:border-transparent group-hover:text-white">
// //                       →
// //                     </div>
// //                   </div>
// //                 </div>
// //               </motion.button>
// //             );
// //           })}
// //         </div>
// //       </motion.div>
// //     )}

// //     {/* ─── SPLIT VIEW ─── */}
// //     {offerPhase === "split" && (
// //       <motion.div
// //         key="offer-split"
// //         initial={{ opacity: 0, scale: 0.95 }}
// //         animate={{ opacity: 1, scale: 1 }}
// //         exit={{ opacity: 0, scale: 0.95 }}
// //         transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
// //       >
// //         <h2
// //           className="text-3xl md:text-5xl font-extrabold text-center mb-10 tracking-tight"
// //           style={{ letterSpacing: "-0.03em" }}
// //         >
// //           What We Offer
// //         </h2>

// //         <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-3.5 max-w-[1100px] mx-auto items-stretch">
// //           {/* LEFT — mini cards */}
// //           <div className="flex flex-col gap-2 h-full">
// //             {FEATURE_PREVIEWS.map((feature, i) => {
// //               const Icon = feature.icon;
// //               const isAct = i === activeOfferIdx;

// //               return (
// //                 <motion.button
// //                   key={feature.title}
// //                   type="button"
// //                   onClick={() => !offerBusy && setActiveOfferIdx(i)}
// //                   whileHover={
// //                     !isAct
// //                       ? {
// //                           x: 6,
// //                           transition: {
// //                             type: "spring",
// //                             stiffness: 320,
// //                             damping: 20,
// //                           },
// //                         }
// //                       : {}
// //                   }
// //                   whileTap={{ scale: 0.98 }}
// //                   className="relative rounded-[14px] p-[1px] text-left overflow-hidden flex-1 flex flex-col"
// //                   style={{
// //                     background: isAct
// //                       ? "linear-gradient(135deg,#FF14EF,#1A73E8)"
// //                       : "linear-gradient(160deg,#1e1e22,#0d0e12)",
// //                   }}
// //                 >
// //                   {/* Active left bar */}
// //                   {isAct && (
// //                     <motion.div
// //                       layoutId="active-bar"
// //                       className="absolute left-0 top-[10%] bottom-[10%] w-[2px] rounded-full z-10"
// //                       style={{
// //                         background:
// //                           "linear-gradient(to bottom,#FF14EF,#1A73E8)",
// //                       }}
// //                       transition={{
// //                         type: "spring",
// //                         stiffness: 400,
// //                         damping: 30,
// //                       }}
// //                     />
// //                   )}

// //                   <div
// //                     className="relative rounded-[12px] p-3 pr-9 flex items-start gap-2.5 h-full transition-colors duration-250"
// //                     style={{
// //                       background: isAct ? "rgba(8,16,36,.88)" : "#030406",
// //                     }}
// //                   >
// //                     {/* Number - same as How It Works */}
// //                     <span
// //                       className="absolute top-3 right-3"
// //                       style={{
// //                         width: 26,
// //                         height: 24,
// //                         opacity: 1,
// //                         fontFamily: "Inter, ui-sans-serif, system-ui",
// //                         fontWeight: 500,
// //                         fontStyle: "normal",
// //                         fontSize: 20,
// //                         lineHeight: "100%",
// //                         letterSpacing: "0%",
// //                         textAlign: "right",
// //                         color: "#252526",
// //                       }}
// //                     >
// //                       {String(i + 1).padStart(2, "0")}
// //                     </span>

// //                     <div className="flex-shrink-0 mt-[3px]">
// //                       {feature.image ? (
// //                         <img
// //                           src={feature.image}
// //                           className="h-4 w-4 object-contain"
// //                           alt=""
// //                         />
// //                       ) : Icon ? (
// //                         <>
// //                           <Icon
// //                             className="h-4 w-4"
// //                             style={{
// //                               stroke: "url(#ig-mini)",
// //                               strokeWidth: 1.7,
// //                               fill: "none",
// //                             }}
// //                           />
// //                           <svg width="0" height="0" aria-hidden>
// //                             <defs>
// //                               <linearGradient
// //                                 id="ig-mini"
// //                                 x1="0"
// //                                 y1="0"
// //                                 x2="0"
// //                                 y2="1"
// //                               >
// //                                 <stop offset="0%" stopColor="#1A73E8" />
// //                                 <stop offset="100%" stopColor="#FF14EF" />
// //                               </linearGradient>
// //                             </defs>
// //                           </svg>
// //                         </>
// //                       ) : null}
// //                     </div>

// //                     <div>
// //                       <div className="text-white font-bold text-[12px] leading-snug mb-0.5 tracking-tight">
// //                         {feature.title}
// //                       </div>
// //                       <div className="text-white/42 text-[10px] leading-relaxed">
// //                         {feature.description}
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </motion.button>
// //               );
// //             })}
// //           </div>

// //           {/* RIGHT — video pane */}
// //           <AnimatePresence mode="wait">
// //             {activeOfferIdx !== null &&
// //               (() => {
// //                 const f = FEATURE_PREVIEWS[activeOfferIdx];
// //                 const Icon = f.icon;

// //                 return (
// //                   <motion.div
// //                     key={`vp-${activeOfferIdx}`}
// //                     initial={{ opacity: 0, x: 36, scale: 0.95 }}
// //                     animate={{ opacity: 1, x: 0, scale: 1 }}
// //                     exit={{ opacity: 0, x: -20, scale: 0.97 }}
// //                     transition={{
// //                       duration: 0.46,
// //                       ease: [0.22, 1, 0.36, 1],
// //                     }}
// //                     className="relative rounded-[22px] overflow-hidden flex flex-col justify-end"
// //                     style={{
// //                       border: "1px solid rgba(255,255,255,.07)",
// //                       minHeight: 380,
// //                     }}
// //                   >
// //                     {/* Dynamic radial bg */}
// //                     <motion.div
// //                       key={`bg-${activeOfferIdx}`}
// //                       initial={{ opacity: 0 }}
// //                       animate={{ opacity: 1 }}
// //                       transition={{ duration: 0.7 }}
// //                       className="absolute inset-0"
// //                       style={{
// //                         background:
// //                           "radial-gradient(ellipse at 65% 25%, rgba(26,115,232,.22) 0%, rgba(255,20,239,.14) 45%, #020307 100%)",
// //                       }}
// //                     />

// //                     {/* Dot grid */}
// //                     <div
// //                       className="absolute inset-0 z-[1] pointer-events-none"
// //                       style={{
// //                         backgroundImage:
// //                           "linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",
// //                         backgroundSize: "40px 40px",
// //                       }}
// //                     />

// //                     {/* Scan line */}
// //                     <div className="absolute inset-0 overflow-hidden z-[2] pointer-events-none">
// //                       <div
// //                         className="absolute left-0 right-0 h-[2px]"
// //                         style={{
// //                           background:
// //                             "linear-gradient(90deg,transparent 0%,rgba(255,20,239,.6) 30%,rgba(26,115,232,.6) 70%,transparent 100%)",
// //                           animation:
// //                             "scan 2.8s cubic-bezier(.4,0,.6,1) infinite",
// //                           boxShadow: "0 0 12px rgba(255,20,239,.4)",
// //                         }}
// //                       />
// //                     </div>

// //                     {/* Dark overlay */}
// //                     <div
// //                       className="absolute inset-0 z-[3] pointer-events-none"
// //                       style={{
// //                         background:
// //                           "linear-gradient(to top,rgba(2,3,7,.95) 0%,rgba(2,3,7,.5) 35%,rgba(2,3,7,.1) 65%,transparent 100%)",
// //                       }}
// //                     />

// //                     {/* Video */}
// //                     <video
// //                       src={f.mediaSrc}
// //                       className="absolute inset-0 w-full h-full object-cover z-0"
// //                       autoPlay
// //                       muted
// //                       loop
// //                       playsInline
// //                     />

// //                     {/* Close */}
// //                     <button
// //                       type="button"
// //                       onClick={closeSplit}
// //                       aria-label="Back to grid"
// //                       className="absolute top-3 right-3 z-20 w-[30px] h-[30px] rounded-full flex items-center justify-center text-white/80 hover:text-white hover:scale-110 transition-all duration-200"
// //                       style={{
// //                         border: "1px solid rgba(255,255,255,.18)",
// //                         background: "rgba(0,0,0,.65)",
// //                         backdropFilter: "blur(6px)",
// //                       }}
// //                     >
// //                       <X className="h-3 w-3" />
// //                     </button>

// //                     {/* Center icon with pulse rings */}
// //                     <div className="absolute inset-0 flex items-center justify-center z-[4] pointer-events-none">
// //                       <div className="relative">
// //                         <div
// //                           className="absolute inset-[-8px] rounded-full"
// //                           style={{
// //                             border: "1px solid rgba(255,20,239,.25)",
// //                             animation: "pulse-ring 2.2s ease-in-out infinite",
// //                           }}
// //                         />
// //                         <div
// //                           className="absolute inset-[-16px] rounded-full"
// //                           style={{
// //                             border: "1px solid rgba(26,115,232,.15)",
// //                             animation:
// //                               "pulse-ring 2.2s ease-in-out .6s infinite",
// //                           }}
// //                         />

// //                         <div
// //                           className="w-[68px] h-[68px] rounded-full flex items-center justify-center relative z-[1]"
// //                           style={{
// //                             border: "1px solid rgba(255,255,255,.12)",
// //                             background: "rgba(255,255,255,.05)",
// //                             backdropFilter: "blur(10px)",
// //                           }}
// //                         >
// //                           {f.image ? (
// //                             <img
// //                               src={f.image}
// //                               className="h-6 w-6 object-contain"
// //                               alt=""
// //                             />
// //                           ) : Icon ? (
// //                             <>
// //                               <Icon
// //                                 className="h-6 w-6"
// //                                 style={{
// //                                   stroke: "url(#ig-video)",
// //                                   strokeWidth: 1.7,
// //                                   fill: "none",
// //                                 }}
// //                               />
// //                               <svg width="0" height="0" aria-hidden>
// //                                 <defs>
// //                                   <linearGradient
// //                                     id="ig-video"
// //                                     x1="0"
// //                                     y1="0"
// //                                     x2="0"
// //                                     y2="1"
// //                                   >
// //                                     <stop offset="0%" stopColor="#1A73E8" />
// //                                     <stop offset="100%" stopColor="#FF14EF" />
// //                                   </linearGradient>
// //                                 </defs>
// //                               </svg>
// //                             </>
// //                           ) : null}
// //                         </div>
// //                       </div>
// //                     </div>

// //                     {/* Bottom content */}
// //                     <div className="relative z-[5] p-5 md:p-6">
// //                       <div
// //                         className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mb-2.5 text-[9px] font-bold tracking-[.1em] uppercase text-white/50"
// //                         style={{
// //                           background: "rgba(255,255,255,.07)",
// //                           border: "1px solid rgba(255,255,255,.1)",
// //                         }}
// //                       >
// //                         <div
// //                           className="w-[5px] h-[5px] rounded-full"
// //                           style={{
// //                             background:
// //                               "linear-gradient(135deg,#FF14EF,#1A73E8)",
// //                           }}
// //                         />
// //                         {String(activeOfferIdx + 1).padStart(2, "0")} ·{" "}
// //                         {f.title.split(" ")[0]}
// //                       </div>

// //                       <motion.h3
// //                         key={`t-${activeOfferIdx}`}
// //                         initial={{ opacity: 0, y: 12 }}
// //                         animate={{ opacity: 1, y: 0 }}
// //                         transition={{
// //                           duration: 0.32,
// //                           ease: [0.22, 1, 0.36, 1],
// //                         }}
// //                         className="text-white font-black text-2xl md:text-3xl mb-2 leading-tight"
// //                         style={{ letterSpacing: "-0.03em" }}
// //                       >
// //                         {f.title}
// //                       </motion.h3>

// //                       <motion.p
// //                         key={`d-${activeOfferIdx}`}
// //                         initial={{ opacity: 0, y: 8 }}
// //                         animate={{ opacity: 1, y: 0 }}
// //                         transition={{
// //                           duration: 0.32,
// //                           delay: 0.06,
// //                           ease: [0.22, 1, 0.36, 1],
// //                         }}
// //                         className="text-white/60 text-xs leading-relaxed"
// //                       >
// //                         {f.description}
// //                       </motion.p>
// //                     </div>
// //                   </motion.div>
// //                 );
// //               })()}
// //           </AnimatePresence>
// //         </div>

// //         {/* Progress dots */}
// //         <div className="flex justify-center gap-1.5 mt-4">
// //           {FEATURE_PREVIEWS.map((_, i) => (
// //             <motion.button
// //               key={i}
// //               onClick={() => !offerBusy && setActiveOfferIdx(i)}
// //               animate={{ width: i === activeOfferIdx ? 20 : 4 }}
// //               transition={{ type: "spring", stiffness: 400, damping: 28 }}
// //               className="h-[4px] rounded-full"
// //               style={{
// //                 background:
// //                   i === activeOfferIdx
// //                     ? "linear-gradient(90deg,#FF14EF,#1A73E8)"
// //                     : "rgba(255,255,255,0.18)",
// //               }}
// //             />
// //           ))}
// //         </div>
// //       </motion.div>
// //     )}
// //   </AnimatePresence>
// // </div>

// //         {/* HOW IT WORKS + PRODUCT DEMO */}
// //         <div className="mt-28" style={{ borderWidth: "1px 0 1px 0", borderStyle: "solid", borderColor: "#171717", background: "#08090B" }}>
// //           <div className="pt-16 flex justify-center mb-8">
// //             <div className="p-[1px] rounded-full" style={{ background: "linear-gradient(90deg, #1A73E8 0%, #FF14EF 100%)" }}>
// //               <div className="px-5 py-2 rounded-full bg-black">
// //                 <span
// //                   style={{
// //                     fontFamily: "Inter, ui-sans-serif, system-ui",
// //                     fontWeight: 500,
// //                     fontSize: 16,
// //                     lineHeight: "100%",
// //                     background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //                     WebkitBackgroundClip: "text",
// //                     color: "transparent",
// //                   }}
// //                 >
// //                   PROCESS
// //                 </span>
// //               </div>
// //             </div>
// //           </div>











// //           {/* <div className="pt-16 flex justify-center mb-8">
// //   <button
// //     type="button"
// //     className="steam-btn rounded-full"
// //     style={{ borderRadius: 9999 }}
// //   >
// //     <span
// //       className="steam-btn-inner px-5 py-2"
// //       style={{
// //         borderRadius: 9999,
// //         background: "#000000",
// //       }}
// //     >
// //       <span
// //         style={{
// //           fontFamily: "Inter, ui-sans-serif, system-ui",
// //           fontWeight: 500,
// //           fontSize: 16,
// //           lineHeight: "100%",
// //           background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //           WebkitBackgroundClip: "text",
// //           color: "transparent",
// //         }}
// //       >
// //         PROCESS
// //       </span>
// //     </span>
// //   </button>
// // </div> */}
// //           {/* <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">How It Works</h2> */}
// //            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
// //   How It Works
// // </h2>

// //           {/* Steps grid */}
// //           {/* <div className="px-6">
// //             <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 mb-16">
// //               {[
// //                 { step: "Input Idea", Icon: Zap, description: "Share your concept or requirement" },
// //                 { step: "Smartgen", Icon: Sparkles, description: "AI generates optimized prompts" },
// //                 { step: "Optimize", Icon: Zap, description: "Reduce tokens, improve quality" },
// //                 { step: "Save or Sell", Icon: Sparkle, description: "Store in library or marketplace" },
// //                 { step: "Earn", Icon: Sparkle, description: "Monetize your best prompts" },
// //               ].map((item, i) => {
// //                 const isActive = i === activeStep;
// //                 const fill = isActive ? "linear-gradient(360deg, #1A1A1A 0%, #08090B 100%)" : "#030406";

// //                 return (
// //                   <button
// //                     key={i}
// //                     type="button"
// //                     onClick={() => setActiveStep(i)}
// //                     className="relative cursor-pointer select-none focus:outline-none"
// //                     style={{
// //                       width: "100%",
// //                       padding: 2,
// //                       borderRadius: 22,
// //                       background: "linear-gradient(180deg, #333333 0%, #12141A 100%)",
// //                     }}
// //                     onMouseEnter={(e) => {
// //                       const inner = e.currentTarget.querySelector<HTMLElement>("[data-inner]");
// //                       if (inner && !isActive) inner.style.background = "linear-gradient(360deg, #1A1A1A 0%, #08090B 100%)";
// //                     }}
// //                     onMouseLeave={(e) => {
// //                       const inner = e.currentTarget.querySelector<HTMLElement>("[data-inner]");
// //                       if (inner && !isActive) inner.style.background = "#030406";
// //                     }}
// //                   >
// //                     <div
// //                       data-inner
// //                       className="w-full h-full flex flex-col items-start justify-start p-5 text-left transition-colors overflow-hidden"
// //                       style={{
// //                         borderRadius: 18,
// //                         background: fill,
// //                         minHeight: 140,
// //                       }}
// //                     >
// //                       <div className="absolute top-3 right-4 text-white/40 font-semibold text-sm">
// //                         {String(i + 1).padStart(2, "0")}
// //                       </div>

// //                       <div className="mb-2">
// //                         <item.Icon className="h-8 w-8 text-white" />
// //                       </div>

// //                       <h3 className="text-white font-semibold text-[18px] sm:text-[20px] leading-snug break-words">
// //                         {item.step}
// //                       </h3>

// //                       <p className="text-white/70 mt-2 text-[14px] sm:text-[15px] leading-snug break-words whitespace-normal">
// //                         {item.description}
// //                       </p>
// //                     </div>
// //                   </button>
// //                 );
// //               })}
// //             </div>
// //           </div> */}


// //     <div className="px-0 sm:px-4 md:px-6">
// //   <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-16">
// //     {HOW_IT_WORKS_STEPS.map((item, i) => {
// //       const isActive = i === activeStep;

// //       const fill = isActive
// //         ? "linear-gradient(360deg, #1A1A1A 0%, #08090B 100%)"
// //         : "#030406";

// //       return (
// //         <button
// //           key={item.step}
// //           type="button"
// //           onClick={() => setActiveStep(i)}
// //           className="relative cursor-pointer select-none focus:outline-none w-full group"
// //           style={{
// //             padding: 1,
// //             borderRadius: 12,
// //             background: "linear-gradient(180deg, #333333 0%, #12141A 100%)",
// //           }}
// //         >
// //           <div
// //             className="relative w-full h-full flex flex-col items-start justify-start text-left transition-colors overflow-hidden"
// //             style={{
// //               borderRadius: 11,
// //               background: fill,
// //               minHeight: 140,
// //               padding: "18px 20px",
// //             }}
// //           >
// //             {/* Number */}
// //             <div
// //               className="absolute top-3 right-3"
// //               style={{
// //                 width: 26,
// //                 height: 24,
// //                 opacity: 1,
// //                 fontFamily: "Inter, ui-sans-serif, system-ui",
// //                 fontWeight: 500,
// //                 fontStyle: "normal",
// //                 fontSize: 20,
// //                 lineHeight: "100%",
// //                 letterSpacing: "0%",
// //                 textAlign: "right",
// //                 color: HOW_IT_WORKS_NUMBER_COLOR,
// //               }}
// //             >
// //               {String(i + 1).padStart(2, "0")}
// //             </div>

// //             {/* Icon */}
// //             <div className="mb-5">
// //               <img
// //                 src={item.iconSrc}
// //                 alt=""
// //                 draggable={false}
// //                 className="w-8 h-8 object-contain"
// //                 style={{
// //                   filter: "brightness(0) invert(1)",
// //                 }}
// //               />
// //             </div>

// //             {/* Title */}
// //             <h3
// //               className="text-white font-semibold leading-none"
// //               style={{
// //                 fontSize: i === 0 ? 22 : 20,
// //                 fontFamily: "Inter, ui-sans-serif, system-ui",
// //               }}
// //             >
// //               {item.step}
// //             </h3>

// //             {/* Description */}
// //             <p
// //               className="text-white/85 mt-3 leading-tight"
// //               style={{
// //                 fontSize: i === 0 ? 16 : 14,
// //                 fontFamily: "Inter, ui-sans-serif, system-ui",
// //                 maxWidth: 150,
// //               }}
// //             >
// //               {item.description}
// //             </p>
// //           </div>
// //         </button>
// //       );
// //     })}
// //   </div>
// // </div>
   
// //      {/* Product Demo */}
// // <div className="mt-28 relative overflow-hidden">

// //   <div className="container mx-auto px-6 text-center">

// //     {/* Heading */}
// //    <h3 className="text-3xl md:text-5xl font-bold text-white">
// //   Product Demo
// // </h3>

// //     <p className="text-white/70 text-lg mt-3 mb-12">
// //       Video demonstration of earn feature
// //     </p>

// //     {/* Demo Wrapper */}
// //     <div className="relative w-full max-w-[1200px] mx-auto">

// //       {/* Glow background */}
// //       <div
// //         className="absolute inset-0 blur-[120px] opacity-40"
// //         style={{
// //           background:
// //             "radial-gradient(circle at center, rgba(255,20,239,0.35) 0%, rgba(26,115,232,0.35) 100%)",
// //         }}
// //       />

// //       {/* Laptop with 3D animation */}
// //       <motion.div
// //         whileHover={{
// //           rotateX: 6,
// //           rotateY: -6,
// //           scale: 1.03,
// //         }}
// //         transition={{ type: "spring", stiffness: 120 }}
// //         className="relative mx-auto"
// //         style={{ perspective: 1200 }}
// //       >

// //         {/* Laptop Image */}
// //         <img
// //           src="/icons/ux.png"
// //           alt="Laptop demo"
// //           className="w-full h-auto select-none pointer-events-none"
// //           draggable={false}
// //         />

// //         {/* Screen Video */}
// //         <div
// //           className="absolute overflow-hidden rounded-[12px]"
// //           style={{
// //             top: "16.5%",
// //             left: "11.8%",
// //             width: "76.4%",
// //             height: "64%",
// //           }}
// //         >
// //     <video
// //   src="/icons/token.mp4"
// //   className="w-full h-full object-cover"
// //   autoPlay
// //   muted
// //   loop
// //   playsInline
// // />
// //         </div>

// //       </motion.div>

// //     </div>
// //   </div>
// // </div>
// //         </div>

// //         <GlobeSection /> {/* ← yahan add karo */}
// //           <FAQSection />   
// //         {/* FINAL CTA */}
// //         <div className="mt-28 text-center">
// //        <div className="flex justify-center mb-4">
// //   <button
// //     type="button"
// //     className="rounded-full"
// //     style={{
// //       borderRadius: 9999,
// //       padding: "1px",
// //       background: "linear-gradient(90deg, #1A73E8 0%, #FF14EF 100%)",
// //     }}
// //   >
// //     <span
// //       className="px-5 py-2 inline-flex items-center justify-center rounded-full"
// //       style={{
// //         borderRadius: 9999,
// //         background: "#000000",
// //       }}
// //     >
// //       <span
// //         style={{
// //           fontFamily: "Inter, ui-sans-serif, system-ui",
// //           fontWeight: 500,
// //           fontSize: 16,
// //           lineHeight: "100%",
// //           background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //           WebkitBackgroundClip: "text",
// //           color: "transparent",
// //         }}
// //       >
// //         REACH OUT ANY TIME
// //       </span>
// //     </span>
// //   </button>
// // </div>

// //        <h2 className="text-3xl md:text-5xl font-bold mb-6">
// //   Ready to optimize your prompts?
// // </h2>
// // <p className="text-base sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
// //   Join thousands of developers who are already saving costs and improving efficiency with TOKUN.
// // </p>

// //          <div className="relative inline-block overflow-visible isolate">
// //   <div
// //     className="pointer-events-none absolute -inset-x-16 -top-2 -bottom-10 rounded-[36px] z-0"
// //     style={{
// //       background: "linear-gradient(90deg, rgba(255,20,239,0.4) 0%, rgba(26,115,232,0.4) 100%)",
// //       filter: "blur(60px)",
// //       opacity: 1,
// //     }}
// //   />
// //   <div className="relative">
// //     <motion.img
// //       src="/icons/arr.png"
// //       alt="arrow highlight"
// //       className="pointer-events-none select-none absolute -top-6 -left-8 w-9 sm:-top-7 sm:-left-10 sm:w-10"
// //     />
// //     <motion.button
// //       onClick={() => go(routes.app)}
// //       whileHover={{ scale: 1.05 }}
// //       className="relative w-[200px] sm:w-[240px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold shadow-2xl border border-white/10 backdrop-blur-md flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg"
// //       style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
// //     >
// //       <div className="absolute inset-0 rounded-full bg-white opacity-10 blur-[6px] pointer-events-none" />
// //       <span>Start Optimizing Now</span>
// //       <span
// //         aria-hidden
// //         className="inline-flex items-center justify-center rounded-full bg-white"
// //         style={{ width: 24, height: 24 }}
// //       >
// //         <MdKeyboardArrowRight size={14} color="black" />
// //       </span>
// //     </motion.button>
// //     {/* <motion.button
// //   onClick={() => go(routes.app)}
// //   whileHover={{ scale: 1.05 }}
// //   className="steam-btn relative w-[200px] sm:w-[240px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold"
// //   style={{ borderRadius: 9999 }}
// // >
// //   <span
// //     className="steam-btn-inner backdrop-blur-md border border-white/10"
// //     style={{
// //       borderRadius: 9999,
// //       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
// //       boxShadow: "0 10px 30px rgba(255,20,239,0.18)",
// //       gap: 12,
// //     }}
// //   >
// //     <span>Start Optimizing Now</span>
// //     <span
// //       aria-hidden
// //       className="inline-flex items-center justify-center rounded-full bg-white"
// //       style={{ width: 24, height: 24 }}
// //     >
// //       <MdKeyboardArrowRight size={14} color="black" />
// //     </span>
// //   </span>
// // </motion.button> */}
// //   </div>
// // </div>
// //         </div>

// //         {/* TESTIMONIALS */}
// //           {/* TESTIMONIALS */}
// //       {/* TESTIMONIALS — SAME POSITION & DESIGN, keep < and > arrows; center when only one */}
// //            {/* TESTIMONIALS */}
// // <div className="mt-28 mb-8 relative font-[Inter] px-4">

// //   {/* TAG */}
// //   <div className="flex justify-center mb-4">
// //     <div
// //       className="p-[1px] rounded-full"
// //       style={{ background: "linear-gradient(90deg, #1A73E8 0%, #FF14EF 100%)" }}
// //     >
// //       <div className="px-5 py-2 rounded-full bg-black">
// //         <span
// //           style={{
// //             fontWeight: 500,
// //             fontSize: 16,
// //             background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //             WebkitBackgroundClip: "text",
// //             color: "transparent",
// //           }}
// //         >
// //           WALL OF LOVE
// //         </span>
// //       </div>
// //     </div>
// //   </div>

// //   {/* <div className="flex justify-center mb-4">
// //   <button
// //     type="button"
// //     className="steam-btn rounded-full"
// //     style={{ borderRadius: 9999 }}
// //   >
// //     <span
// //       className="steam-btn-inner px-5 py-2"
// //       style={{
// //         borderRadius: 9999,
// //         background: "#000000",
// //       }}
// //     >
// //       <span
// //         style={{
// //           fontWeight: 500,
// //           fontSize: 16,
// //           background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //           WebkitBackgroundClip: "text",
// //           color: "transparent",
// //         }}
// //       >
// //         WALL OF LOVE
// //       </span>
// //     </span>
// //   </button>
// // </div> */}

// //  <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-4">
// //   Loved by thinkers
// // </h2>

// // <p className="text-sm sm:text-lg text-white/70 text-center mb-12">
// //   Here's what people worldwide are saying
// // </p>

// //  {feedbacks.length === 0 ? (
// //   <div className="text-center text-white/60">
// //     No testimonials yet — be the first to leave feedback!
// //   </div>
// // ) : (
// //   <div className="flex justify-center items-center gap-3 sm:gap-6 px-3 sm:px-0">
// //     {/* LEFT BUTTON */}
// //     <button
// //       onClick={prevSlide}
// //       className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white text-white transition-all shrink-0"
// //     >
// //       <MdKeyboardArrowDown size={20} className="rotate-90 sm:text-[22px]" />
// //     </button>

// //     {/* SLIDER */}
// //     <div className="relative w-full max-w-[560px] overflow-hidden">
// //       <AnimatePresence mode="wait">
// //         <motion.div
// //           key={current}
// //           initial={{ opacity: 0, x: 120 }}
// //           animate={{ opacity: 1, x: 0 }}
// //           exit={{ opacity: 0, x: -120 }}
// //           transition={{ duration: 0.4 }}
// //           className="w-full"
// //         >
// //           {(() => {
// //             const t = feedbacks[current];
// //             return (
// //               <div
// //                 key={t.id}
// //                 className="relative flex flex-col justify-between p-4 sm:p-6 text-left bg-transparent overflow-hidden w-full"
// //                 style={{
// //                   border: "1px solid #333335",
// //                   borderRadius: 24,
// //                 }}
// //               >
// //                 {/* glow */}
// //                 <div
// //                   className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-28 h-28 sm:w-40 sm:h-40 rounded-full pointer-events-none"
// //                   style={{
// //                     background:
// //                       "radial-gradient(circle at center, rgba(255,20,239,0.25) 0%, rgba(26,115,232,0.25) 100%)",
// //                     filter: "blur(60px)",
// //                   }}
// //                 />

// //                 <div className="relative z-10 flex flex-col gap-3">
// //                   {/* stars */}
// //                   <div className="flex">
// //                     {Array.from({
// //                       length: Math.max(1, Math.min(5, Number(t.rating) || 5)),
// //                     }).map((_, i) => (
// //                       <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-white fill-white" />
// //                     ))}
// //                   </div>

// //                   {/* text */}
// //                   <p className="text-white/90 text-[13px] sm:text-[15px] leading-relaxed break-words">
// //                     "{t.experience}"
// //                   </p>

// //                   {/* user */}
// //                   <div className="flex items-center gap-3">
// //                     <img
// //                       src={t.avatar || svgInitialsAvatar(t.name || "User")}
// //                       alt={t.name || "User"}
// //                       className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
// //                     />
// //                     <div className="min-w-0">
// //                       <div className="font-semibold text-white text-sm sm:text-base truncate">
// //                         {t.name || "Anonymous"}
// //                       </div>
// //                       <div className="text-xs sm:text-sm text-white/60 break-words">
// //                         {[t.role, t.org].filter(Boolean).join(" • ")}
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             );
// //           })()}
// //         </motion.div>
// //       </AnimatePresence>
// //     </div>

// //     {/* RIGHT BUTTON */}
// //     <button
// //       onClick={nextSlide}
// //       className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white text-white transition-all shrink-0"
// //     >
// //       <MdKeyboardArrowDown size={20} className="-rotate-90 sm:text-[22px]" />
// //     </button>
// //   </div>
// // )}
// // </div>



// //         {showFooter && <Footer />}

// //         {/* Floating Action Button */}
// //         {/* Floating Action Button */}
// // {/* Floating Action Button */}
// // {/* Floating Action Button */}
// // {/* Floating Action Button */}
// // <div className="fixed bottom-24 right-8 z-50">
// //   <Button
// //     onClick={() =>
// //       variant === "marketing" ? go(routes.login) : go(routes.dashboard)
// //     }
// //     className="w-16 h-16 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 p-0"
// //     style={{
// //       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
// //       boxShadow: "0 0 40px rgba(26,115,232,0.35)",
// //     }}
// //   >
// //     <FiArrowRight
// //       className="text-white"
// //       style={{
// //         width: 38,
// //         height: 38,
// //         strokeWidth: 1.8,
// //       }}
// //     />
// //   </Button>
// // </div>
// //       </div>

// //       {/* ===== Feedback vertical pill (50x130) =====
// //           Placed above the Smartgen/Marketplace CTAs and sticks to the laptop screen's right edge */}
// //       {fbPos && (
// //     <button
// //   type="button"
// //   onClick={() => setFeedbackOpen(true)}   // 👈 open modal
// //   aria-label="Give feedback"
// //   className="absolute z-50 text-white font-semibold"
// // style={{
// //   position: 'fixed',           // 👈 add this
// //   width: 50,
// //   height: 130,
// //   opacity: 1,
// //   top: fbPos.top,
// //   left: fbPos.left,
// //   borderTopLeftRadius: 16,
// //   borderBottomLeftRadius: 16,
// //   borderTopRightRadius: 0,
// //   borderBottomRightRadius: 0,
// //   background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
// //   boxShadow: "0 0 28px rgba(26,115,232,0.25)",
// //   writingMode: "vertical-rl",
// //   textOrientation: "mixed",
// //   display: "flex",
// //   alignItems: "center",
// //   justifyContent: "center",
// //   letterSpacing: 1,
// // }}

// // >
// //   <span
// //     className="inline-flex items-center select-none"
// //     style={{
// //       transform: "rotate(180deg)", // bottom → top
// //       gap: 6,
// //       lineHeight: 1,
// //       fontFamily: "Inter, ui-sans-serif, system-ui",
// //       fontWeight: 400,
// //       fontStyle: "normal",
// //       fontSize: 16,
// //       color: "#fff",
// //       textAlign: "center",
// //     }}
// //   >
// //     <MessageCircleHeart
// //       aria-hidden
// //       style={{ width: 22, height: 22, transform: "rotate(180deg)" }} // keep icon upright
// //     />
// //     <span>Feedback</span>
// //   </span>
// // </button>


// //       )}

// //       {feedbackOpen && (
// //   <div role="dialog" aria-modal="true" className="fixed inset-0 z-[999] grid place-items-center">
// //     {/* Backdrop */}
// //     <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setFeedbackOpen(false)} />

// //     {/* Card: smaller + capped height + Inter Regular for everything */}
// //  <div
// //   className="relative rounded-2xl text-white shadow-2xl"
// //   style={{
// //     background: "#17171A", // ← was "#131313"
// //     width: "min(92vw, 520px)",
// //     maxHeight: "85vh",
// //     fontFamily: "Inter",
// //     fontWeight: 400,
// //     fontStyle: "normal",
// //   }}
// // >

// //       {/* Close */}
// //       <button
// //         aria-label="Close"
// //         onClick={() => setFeedbackOpen(false)}
// //         className="absolute right-2 top-2 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8"
// //       >
// //         <X className="w-4 h-4 text-white/90" />
// //       </button>

// //       {/* Scrollable content (scrollbar hidden) */}
// //       <div
// //         className="no-scrollbar overflow-y-auto px-5 md:px-6 py-6 md:py-7"
// //         style={{ maxHeight: "85vh" }}
// //       >
// //         {/* Title (regular weight) */}
// //         <h3 className="text-center text-[20px] md:text-[22px]" style={{ fontWeight: 400 }}>
// //           We Value Your Feedback
// //         </h3>
// //         <p className="text-center text-white/70 mt-2 leading-snug text-sm">
// //           Your feedback is important to us We take
// //           <br />
// //           it very seriously.
// //         </p>

// //         {/* Stars */}
// //         <div className="mt-5">
// //           <div className="flex items-center justify-center gap-4">
// //             {Array.from({ length: 5 }).map((_, i) => {
// //               const idx = i + 1;
// //               const active = (hoverRating || rating) >= idx;
// //               return (
// //                 <button
// //                   key={idx}
// //                   type="button"
// //                   onMouseEnter={() => setHoverRating(idx)}
// //                   onMouseLeave={() => setHoverRating(0)}
// //                   onClick={() => setRating(idx)}
// //                   className="p-1"
// //                   aria-label={`Rate ${idx} star${idx > 1 ? "s" : ""}`}
// //                   style={{ fontFamily: "Inter", fontWeight: 400 }}
// //                 >
// //                   <Star
// //                     className="w-6 h-6"
// //                     style={{
// //                       color: active ? "#FFFFFF" : "rgba(255,255,255,0.5)",
// //                       fill: active ? "#FFFFFF" : "transparent",
// //                     }}
// //                   />
// //                 </button>
// //               );
// //             })}
// //           </div>
// //           <div className="flex justify-between text-[11px] text-white/70 w-[240px] mx-auto mt-2">
// //             <span>Very bad</span>
// //             <span>Very Good</span>
// //           </div>
// //         </div>

// //         {/* Write your experience */}
// //         <div className="mt-6">
// //           <label className="block mb-2 text-white/90 text-sm">Write your experience</label>
// //           <div className="relative">
// //           <textarea
// //   value={fbForm.experience}
// //   onChange={(e) =>
// //     setFbForm((p) => ({ ...p, experience: e.target.value.slice(0, MAX_CHARS) }))
// //   }
// //   rows={4}
// //   className="w-full resize-none rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
// //   placeholder="Share your thoughts..."
// //   style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
// //   required
// // />

// //             <div className="absolute right-3 bottom-2 text-xs text-white/60">
// //               {fbForm.experience.length}/{MAX_CHARS}
// //             </div>
// //           </div>
// //         </div>

// //         {/* Name */}
// //         <div className="mt-5">
// //           <label className="block mb-2 text-white/90 text-sm">Your Name</label>
// //        <input
// //   value={fbForm.name}
// //   onChange={(e) => setFbForm((p) => ({ ...p, name: e.target.value }))}
// //   className="w-full rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
// //   placeholder="Your full name"
// //   style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
// //   required
// // />

// //         </div>

// //         {/* Role */}
// //         <div className="mt-5">
// //           <label className="block mb-2 text-white/90 text-sm">Your Role / Designation</label>
// //           <input
// //             value={fbForm.role}
// //             onChange={(e) => setFbForm((p) => ({ ...p, role: e.target.value }))}
// //             className="w-full rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
// //             placeholder="e.g., Assistant Manager"
// //             style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
// //           />
// //         </div>

// //         {/* Organization */}
// //         <div className="mt-5">
// //           <label className="block mb-2 text-white/90 text-sm">Organization / Company</label>
// //           <input
// //             value={fbForm.org}
// //             onChange={(e) => setFbForm((p) => ({ ...p, org: e.target.value }))}
// //             className="w-full rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
// //             placeholder="Company name"
// //             style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
// //           />
// //         </div>

// //         {/* File upload */}
// //         <div className="mt-5">
// //           <label className="block mb-2 text-white/90 text-sm">Profile Picture</label>
// //           <div className="flex items-center gap-3">
// //             <label
// //               className="cursor-pointer inline-flex items-center rounded-md px-4 py-2 text-sm text-white"
// //               style={{
// //                 background: "linear-gradient(270deg, #FF14EF 0%, #1A73E8 100%)",
// //                 fontFamily: "Inter",
// //                 fontWeight: 400,
// //                 fontStyle: "normal",
// //               }}
// //             >
// //               Choose file
// //               <input
// //                 type="file"
// //                 accept="image/*"
// //                 className="hidden"
// //                 onChange={(e) => setFbForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
// //               />
// //             </label>
// //             <div className="flex-1 truncate rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white/70"
// //                  style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}>
// //               {fbForm.file ? fbForm.file.name : "No file chosen"}
// //             </div>
// //           </div>
// //         </div>

// //         {/* Actions — right aligned; Clear sits directly left of Submit */}
// //         <div className="mt-6 flex items-center justify-end gap-3">
// //         <button
// //   type="button"
// //   onClick={handleClear}
// //   className="text-white/90 hover:text-white transition"
// //   style={{
// //     width: 100,
// //     height: 49,
// //     opacity: 1,
// //     borderRadius: 6,
// //     border: "1px solid #FFFFFF",
// //     display: "inline-flex",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     background: "transparent",
// //     fontFamily: "Inter",
// //     fontWeight: 400,
// //     fontStyle: "normal",
// //   }}
// // >
// //   Clear
// // </button>


// //          <button
// //   type="button"
// //   onClick={handleSubmitFeedback}
// //   className="text-white" // removed rounded-xl/px/py to avoid conflicts
// //   style={{
// //     width: 162,
// //     height: 49,
// //     opacity: 1,
// //     borderRadius: 6,
// //     padding: 15,
// //     gap: 10,
// //     display: "inline-flex",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     background: "linear-gradient(270deg, #FF14EF 0%, #1A73E8 100%)",
// //     fontFamily: "Inter",
// //     fontWeight: 400,
// //     fontStyle: "normal",
// //   }}
// // >
// //   Submit Feedback
// // </button>

// //         </div>
// //       </div>
// //     </div>
// //   </div>
// // )}




// // {thankOpen && (
// //   <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] grid place-items-center">
// //     {/* Backdrop */}
// //     <div
// //       className="absolute inset-0 bg-black/70 backdrop-blur-sm"
// //       onClick={() => setThankOpen(false)}
// //     />

// //     {/* Card */}
// //     <div
// //       className="relative rounded-2xl text-white shadow-2xl px-6 py-7"
// //       style={{
// //         background: "#17171A",
// //         width: "min(92vw, 500px)",
// //         border: "1px solid #333335",
// //       }}
// //     >
// //       {/* Close */}
// //       <button
// //         aria-label="Close"
// //         onClick={() => setThankOpen(false)}
// //         className="absolute right-2 top-2 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8"
// //       >
// //         <X className="w-4 h-4 text-white/90" />
// //       </button>

// //       {/* Green check icon */}
// //       <div className="grid place-items-center mb-4">
// //         <div
// //           className="grid place-items-center h-14 w-14 rounded-full"
// //           style={{ background: "rgba(16,185,129,0.18)" }}  /* dark green ring */
// //         >
// //           <div
// //             className="grid place-items-center h-10 w-10 rounded-full"
// //             style={{ background: "#16A34A" }}  /* green */
// //           >
// //             <Check className="w-6 h-6 text-black" />
// //           </div>
// //         </div>
// //       </div>

// //       {/* Text */}
// //       <h3 className="text-center text-[18px] md:text-[20px] font-medium">
// //         Thank you for your feedback!
// //       </h3>
// //       <p className="text-center text-white/70 mt-2 text-sm">
// //         We appreciate your feedback and will review it shortly.
// //       </p>

// //       {/* Actions */}
// //       <div className="mt-6 flex items-center justify-center gap-3">
// //         <button
// //           type="button"
// //           onClick={() => setThankOpen(false)}
// //           className="text-white/90 hover:text-white transition"
// //           style={{
// //             width: 110,
// //             height: 44,
// //             borderRadius: 6,
// //             border: "1px solid #FFFFFF",
// //             background: "transparent",
// //           }}
// //         >
// //           Cancel
// //         </button>

// //         <button
// //           type="button"
// //           onClick={() => {
// //             setThankOpen(false);
// //             handleClear();         // fresh form
// //             setFeedbackOpen(true); // reopen the form
// //           }}
// //           className="text-white"
// //           style={{
// //             width: 160,
// //             height: 44,
// //             borderRadius: 6,
// //             background: "#333335",
// //           }}
// //         >
// //           Submit Another
// //         </button>
// //       </div>
// //     </div>
// //   </div>
// // )}


// // <style>{`
// //   .steam-btn {
// //     position: relative;
// //     isolation: isolate;
// //     overflow: visible;
// //   }

// //   .steam-btn::before,
// //   .steam-btn::after {
// //     content: "";
// //     position: absolute;
// //     inset: -2px;
// //     border-radius: inherit;
// //     background: linear-gradient(
// //       45deg,
// //       #fb0094,
// //       #0000ff,
// //       #00ff00,
// //       #ffff00,
// //       #ff0000,
// //       #fb0094,
// //       #0000ff,
// //       #00ff00,
// //       #ffff00,
// //       #ff0000
// //     );
// //     background-size: 400%;
// //     z-index: -2;
// //     animation: steam 20s linear infinite;
// //   }

// //   .steam-btn::after {
// //     z-index: -3;
// //     filter: blur(22px);
// //     opacity: 0.95;
// //   }

// //   .steam-btn-inner {
// //     position: relative;
// //     z-index: 1;
// //     border-radius: inherit;
// //     width: 100%;
// //     height: 100%;
// //     display: inline-flex;
// //     align-items: center;
// //     justify-content: center;
// //   }

// //   @keyframes steam {
// //     0% { background-position: 0 0; }
// //     50% { background-position: 400% 0; }
// //     100% { background-position: 0 0; }
// //   }
// // `}


// // {`
// //   @keyframes scan {
// //     0%   { top: 0%;   opacity: 0; }
// //     5%   { opacity: 1; }
// //     95%  { opacity: 1; }
// //     100% { top: 100%; opacity: 0; }
// //   }
// //   @keyframes pulse-ring {
// //     0%, 100% { transform: scale(1);    opacity: .6; }
// //     50%       { transform: scale(1.07); opacity: 1; }
// //   }
// // `}



// // </style>

// //     </motion.section>
// //   );
// // }





// // import { useState, useEffect, useMemo } from "react";
// // import { useRef } from "react";

// // import { useNavigate } from "react-router-dom";
// // import {  AnimatePresence } from "framer-motion";
// // import { Button } from "@/components/ui/button";
// // import { ArrowRight, Sparkles, Zap, TrendingUp, Star, Sparkle, Mouse, MoveDown } from "lucide-react";
// // import {
// //   DropdownMenu,
// //   DropdownMenuContent,
// //   DropdownMenuTrigger,
// // } from "@/components/ui/dropdown-menu";
// // import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
// // import { motion, animate, useMotionValue, useMotionTemplate } from "framer-motion";
// // import Footer from "@/components/Footer";
// // import SubscriptionModal from "@/components/SubscriptionModal";
// // import { Settings, ChevronDown } from "lucide-react";
// // import { useAuth } from "@/contexts/AuthContext";
// // import { MessageCircleHeart, X } from "lucide-react";
// // import { GlobeSection, FAQSection , TickerSection } from "@/components/GlobeAndFAQ_components";
// // // top of file (with other lucide-react imports)
// // import { Check  } from "lucide-react";
// // import { LuBadgeCheck } from "react-icons/lu";
// // import { FaArrowRight } from "react-icons/fa";
// // import { FiArrowRight } from "react-icons/fi";
// // import AccountMenu from "@/components/AccountMenu";
// // const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

// // /* --- tiny helper: star with true gradient color using CSS mask --- */
// // function MaskedStar({ size = 14 }: { size?: number }) {
// //   const starMask = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896 4.665 23.165l1.401-8.168L.132 9.21l8.2-1.192z'/%3E%3C/svg%3E")`;
// //   const common: React.CSSProperties = {
// //     display: "inline-block",
// //     width: size,
// //     height: size,
// //     backgroundImage: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //     WebkitMaskImage: starMask,
// //     maskImage: starMask,
// //     WebkitMaskRepeat: "no-repeat",
// //     maskRepeat: "no-repeat",
// //     WebkitMaskPosition: "center",
// //     maskPosition: "center",
// //     WebkitMaskSize: "contain",
// //     maskSize: "contain",
// //   };
// //   return <span style={common} aria-hidden="true" />;
// // }

// // /* --- reusable badge button --- */
// // function GradientBadge({
// //   label = "Trusted by industry leaders",
// //   showIcon = true,
// // }: {
// //   label?: string;
// //   showIcon?: boolean;
// // }) {
// //   return (
// //     <button
// //       type="button"
// //       className="inline-flex items-center rounded-full"
// //       style={{
// //         background: "#252525",
// //         border: "1px solid #333335",
// //         padding: "10px 14px",
// //         gap: showIcon ? 8 : 0,
// //       }}
// //     >
// //       {showIcon ? <MaskedStar size={16} /> : null}
// //       <span
// //         className="bg-clip-text text-transparent"
// //         style={{
// //           backgroundImage: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //           fontFamily: "Inter, ui-sans-serif, system-ui",
// //           fontWeight: 500,
// //           fontSize: 16,
// //           lineHeight: "100%",
// //         }}
// //       >
// //         {label}
// //       </span>
// //     </button>
// //   );
// // }

// // type LandingProps = {
// //   variant?: "marketing" | "app";
// //   userFullName?: string;
// //   routes?: {
// //     login?: string;
// //     signup?: string;
// //     app?: string;
// //     promptLibrary?: string;
// //     smartgen?: string;
// //     marketplace?: string;
// //     dashboard?: string;
// //     profile?: string;
// //   };
// //   showFooter?: boolean;
// // };

// // export default function Landing({
// //   variant = "marketing",
// //   userFullName,
// //   routes = {
// //   login: "/login",
// //   signup: "/signup",
// //   app: "/app",
// //   promptLibrary: "/prompt-library",
// //   smartgen: "/smartgen",
// //   marketplace: "/prompt-marketplace",
// //   dashboard: "/app",
// //   profile: "/profile",
// // },
// //   showFooter = true,
// // }: LandingProps) {
// //   const navigate = useNavigate();
// //   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
// //   const [showTopBg, setShowTopBg] = useState(true);

// //   const color = useMotionValue(COLORS_TOP[0]);
// //   useEffect(() => {
// //     animate(color, COLORS_TOP, {
// //       ease: "easeInOut",
// //       duration: 10,
// //       repeat: Infinity,
// //       repeatType: "mirror",
// //     });
// //   }, [color]);

// //   useEffect(() => {
// //     const handleMouseMove = (e: MouseEvent) => {
// //       setMousePosition({
// //         x: (e.clientX / window.innerWidth) * 2 - 1,
// //         y: (e.clientY / window.innerHeight) * 2 - 1,
// //       });
// //     };
// //     window.addEventListener("mousemove", handleMouseMove);
// //     return () => window.removeEventListener("mousemove", handleMouseMove);
// //   }, []);
// //   useEffect(() => {
// //     let ticking = false;

// //     const updateTopBgVisibility = () => {
// //       const bgEnd = document.getElementById("top-bg-end");

// //       if (!bgEnd) {
// //         setShowTopBg(true);
// //         return;
// //       }

// //       const rect = bgEnd.getBoundingClientRect();

// //       // Static image background visible until the What We Offer heading area.
// //       // After that, the lower sections stay clean dark.
// //       setShowTopBg(rect.bottom > 96);
// //     };

// //     const onScrollOrResize = () => {
// //       if (ticking) return;

// //       ticking = true;
// //       window.requestAnimationFrame(() => {
// //         updateTopBgVisibility();
// //         ticking = false;
// //       });
// //     };

// //     updateTopBgVisibility();
// //     window.addEventListener("scroll", onScrollOrResize, { passive: true });
// //     window.addEventListener("resize", onScrollOrResize);

// //     return () => {
// //       window.removeEventListener("scroll", onScrollOrResize);
// //       window.removeEventListener("resize", onScrollOrResize);
// //     };
// //   }, []);

// //   const border = useMotionTemplate`1px solid ${color}`;
// //   const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;
// //   const go = (path?: string) => path && navigate(path);
// // const handleGetStarted = () => {
// //   if (isAuthenticated) {
// //     go(routes.dashboard);
// //   } else {
// //     go(routes.signup || "/signup");
// //   }
// // };
// //   // Steps
// //   const [activeStep, setActiveStep] = useState(0);
// //   const [hoveredStep, setHoveredStep] = useState<number | null>(null);
// //  const [activeOffer, setActiveOffer] = useState<number | null>(null);
  

// // // State add karo (existing states ke saath)
// // const [activeOfferIdx, setActiveOfferIdx] = useState<number | null>(null);
// // const [offerPhase,     setOfferPhase]     = useState<"grid" | "split">("grid");
// // const [offerBusy,      setOfferBusy]      = useState(false);

// // const openSplit = (idx: number) => {
// //   if (offerBusy) return;
// //   setOfferBusy(true);
// //   setTimeout(() => {
// //     setActiveOfferIdx(idx);
// //     setOfferPhase("split");
// //     setOfferBusy(false);
// //   }, 215);
// // };
// // const closeSplit = () => {
// //   if (offerBusy) return;
// //   setOfferBusy(true);
// //   setTimeout(() => {
// //     setOfferPhase("grid");
// //     setActiveOfferIdx(null);
// //     setOfferBusy(false);
// //   }, 200);
// // };


 

// //   // const [current, setCurrent] = useState(0);
// //   const [activeButton, setActiveButton] = useState<"left" | "right" | null>(null);
// //   const { isAuthenticated } = useAuth();

// //   const { user, logout } = useAuth();
// //   const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
// //   const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

// //   const displayName = useMemo(() => user?.name?.trim() || "", [user]);
// //   const displayEmail = useMemo(() => user?.email || "", [user]);
// //   const fullName = useMemo(() => {
// //     if (displayName) return displayName;
// //     if (displayEmail) return displayEmail.split("@")[0];
// //     return "User";
// //   }, [displayName, displayEmail]);

// //   const handleLogout = () => {
// //     logout();
// //     navigate("/login");
// //   };

// //   const themeBtn = (id: "light" | "dark" | "system", src: string, alt: string) => (
// //     <button
// //       type="button"
// //       onClick={() => setTheme(id)}
// //       className="inline-flex items-center justify-center rounded-full"
// //       style={{
// //         width: 28,
// //         height: 28,
// //         outline: theme === id ? "2px solid rgba(255,255,255,0.9)" : "none",
// //       }}
// //       aria-pressed={theme === id}
// //       aria-label={alt}
// //       title={alt}
// //     >
// //       <img src={src} alt="" className="w-4 h-4" />
// //     </button>
// //   );

// // const PlanStyledName = ({ user, fullName }: { user: any; fullName: string }) => {
// //   if (user?.plan === "pro") {
// //     return (
// //       <div className="flex items-center gap-2">
// //         <span className="truncate font-semibold bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] text-transparent bg-clip-text">
// //           Hello, {fullName}
// //         </span>
// //         <LuBadgeCheck
// //           className="w-[22px] h-[22px]"
// //           style={{ stroke: "url(#proGradient)", strokeWidth: 2 }}
// //         />
// //         <svg width="0" height="0">
// //           <defs>
// //             <linearGradient id="proGradient" x1="0%" y1="0%" x2="100%" y2="100%">
// //               <stop offset="0%" stopColor="#FF14EF" />
// //               <stop offset="100%" stopColor="#1A73E8" />
// //             </linearGradient>
// //           </defs>
// //         </svg>
// //       </div>
// //     );
// //   }

// //   if (user?.plan === "enterprise") {
// //     return (
// //       <div className="flex items-center gap-2">
// //         <span className="truncate font-semibold bg-gradient-to-r from-[#FACC15] to-[#CA8A04] text-transparent bg-clip-text">
// //           Hello, {fullName}
// //         </span>
// //         <LuBadgeCheck
// //           className="w-[22px] h-[22px]"
// //           style={{ stroke: "url(#enterpriseGradient)", strokeWidth: 2 }}
// //         />
// //         <svg width="0" height="0">
// //           <defs>
// //             <linearGradient id="enterpriseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
// //               <stop offset="0%" stopColor="#FACC15" />
// //               <stop offset="100%" stopColor="#CA8A04" />
// //             </linearGradient>
// //           </defs>
// //         </svg>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="flex items-center gap-2">
// //       <span className="truncate font-semibold text-white">
// //         Hello, {fullName}
// //       </span>
// //       <span className="px-2 py-0.5 text-xs rounded-md bg-gray-700 text-gray-300">
// //         FREE
// //       </span>
// //     </div>
// //   );
// // };



// //   /* ===== Feedback button placement logic =====
// //      Goal: place a 50x130 vertical pill above the Smartgen/Marketplace CTAs,
// //      and horizontally stick it to the right edge of the laptop screen. */
// //   const [fbPos, setFbPos] = useState<{ top: number; left: number } | null>(null);

// //     useEffect(() => {
// //   const PILL_W = 50;             // feedback pill width
// //   const PILL_H = 130;            // feedback pill height
// //   const SAFE = 12;               // margin from edges
// //   const BASE_WRAP_W = 1400;      // your max container width
// //   const DESKTOP_OFFSET = 400;    // your desired desktop offset to the right of the screen

// //   const calc = () => {
// //     const screen = document.getElementById("product-screen-mask");
// //     const ctas = document.getElementById("hero-ctas");
// //     const section = document.getElementById("landing-root");
// //     const wrap = document.getElementById("product-demo-wrap");
// //     if (!screen || !ctas || !section) return;

// //     const s = screen.getBoundingClientRect();
// //     const c = ctas.getBoundingClientRect();
// //     const root = section.getBoundingClientRect();
// //     const wrapRect = wrap?.getBoundingClientRect();

// //     // Scale the desktop offset with the actual wrapper width
// //     const wrapWidth = wrapRect?.width ?? BASE_WRAP_W;
// //     const scale = wrapWidth / BASE_WRAP_W;

// //     const isMobile = window.innerWidth < 640;
// //     // On mobile, keep it tight near the screen; on desktop, use your scaled 245px
// //     const offset = isMobile ? 8 : Math.round(DESKTOP_OFFSET * scale);

// //     // Compute left so the pill's RIGHT edge sits offset beyond the laptop screen's RIGHT edge
// //     let left = Math.round((s.right - root.left) + offset - PILL_W);

// //     // Clamp within the visible section to avoid disappearing off-screen
// //     const maxLeft = root.width - PILL_W - SAFE;
// //     const minLeft = SAFE;
// //     left = Math.max(minLeft, Math.min(left, maxLeft));

// //     // Place ABOVE CTAs: (top of CTAs) - (pill height) - gap
// //     let top = Math.round((c.top - root.top) - PILL_H - 12);
// //     const minTop = SAFE;
// //     const maxTop = root.height - PILL_H - SAFE;
// //     top = Math.max(minTop, Math.min(top, maxTop));

// //     setFbPos({ top, left });
// //   };

// //   calc();
// //   // Recompute on resize/scroll
// //   window.addEventListener("resize", calc);
// //   window.addEventListener("scroll", calc, { passive: true });

// //   // Recompute when the product demo wrapper resizes (e.g., container width changes)
// //   let ro: ResizeObserver | undefined;
// //   const wrapEl = document.getElementById("product-demo-wrap");
// //   if (wrapEl && "ResizeObserver" in window) {
// //     ro = new ResizeObserver(calc);
// //     ro.observe(wrapEl);
// //   }

// //   return () => {
// //     window.removeEventListener("resize", calc);
// //     window.removeEventListener("scroll", calc as any);
// //     ro?.disconnect();
// //   };
// // }, []);




// // const [feedbackOpen, setFeedbackOpen] = useState(false);
// // const [rating, setRating] = useState<number>(0);
// // const [hoverRating, setHoverRating] = useState<number>(0);

// // const [fbForm, setFbForm] = useState<{
// //   experience: string;
// //   name: string;
// //   role: string;
// //   org: string;
// //   file?: File | null;
// // }>({
// //   experience: "",
// //   name: "",
// //   role: "",
// //   org: "",
// //   file: null,
// // });

// // const MAX_CHARS = 500;

// // // Esc to close
// // useEffect(() => {
// //   if (!feedbackOpen) return;
// //   const onKey = (e: KeyboardEvent) => (e.key === "Escape" ? setFeedbackOpen(false) : null);
// //   window.addEventListener("keydown", onKey);
// //   return () => window.removeEventListener("keydown", onKey);
// // }, [feedbackOpen]);

// // const handleClear = () => {
// //   setRating(0);
// //   setHoverRating(0);
// //   setFbForm({ experience: "", name: "", role: "", org: "", file: null });
// // };

// // const handleSubmitFeedback = async () => {
// //   try {
// //     const formData = new FormData();
// //     formData.append("experience", fbForm.experience);
// //     formData.append("name", fbForm.name);
// //     formData.append("role", fbForm.role);
// //     formData.append("orgOrCompany", fbForm.org);
// //     formData.append("rating", String(rating));
// //     if (fbForm.file) formData.append("profilePicture", fbForm.file);

// //     const res = await fetch(`${API_BASE}/api/feedback`, {
// //       method: "POST",
// //       body: formData,
// //     });

// //     const data = await res.json();
// //     console.log("[FEEDBACK SUBMIT RESPONSE]", data);

// //     if (data.success) {
// //       // Add new feedback to list
// //       setFeedbacks((prev) => [data.feedback, ...prev]);
// //       setFeedbackOpen(false);
// //       handleClear();
// //       setThankOpen(true);
// //     } else {
// //       alert("Failed to submit feedback: " + (data.error || "Unknown error"));
// //     }
// //   } catch (err) {
// //     console.error("Submit feedback error:", err);
// //   }
// // };





// // // near your other feedback state
// // const [thankOpen, setThankOpen] = useState(false);
// // // testimonials now come from saved feedbacks
// // const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);


// // useEffect(() => {
// //   const fetchFeedbacks = async () => {
// //     try {
// //       const res = await fetch(`${API_BASE}/api/feedback`);
// //       const data = await res.json();
// //       console.log("[FEEDBACK FETCH RESPONSE]", data);

// //       if (data.success) {
// //         setFeedbacks(data.feedbacks);
// //       }
// //     } catch (err) {
// //       console.error("Fetch feedback error:", err);
// //     }
// //   };

// //   fetchFeedbacks();
// // }, []);


// // // === Feedback types + storage helpers + avatar utils ===
// // type Feedback = {
// //   id: string;
// //   when: number;
// //   name: string;
// //   role: string;
// //   org: string;
// //   rating: number;
// //   experience: string;
// //   avatar?: string; // data URL
// // };

// // const FB_KEY = "tokun_feedbacks";
// // const MAX_FEEDBACKS = 100;
// // const MAX_BYTES = 4_500_000; // ~4.5MB guard

// // function loadFeedbacks(): Feedback[] {
// //   try {
// //     const raw = localStorage.getItem(FB_KEY);
// //     return raw ? (JSON.parse(raw) as Feedback[]) : [];
// //   } catch {
// //     return [];
// //   }
// // }

// // function saveFeedbacksSafe(list: Feedback[]) {
// //   // keep last N & prune until size fits
// //   const pruned = list.slice(-MAX_FEEDBACKS);
// //   let json = JSON.stringify(pruned);
// //   while (json.length > MAX_BYTES && pruned.length) {
// //     pruned.shift();
// //     json = JSON.stringify(pruned);
// //   }
// //   try {
// //     localStorage.setItem(FB_KEY, json);
// //   } catch (e) {
// //     console.warn("localStorage save failed:", e);
// //   }
// // }

// // async function fileToAvatarDataUrl(file: File, size = 64, quality = 0.72): Promise<string> {
// //   const dataUrl = await new Promise<string>((res, rej) => {
// //     const r = new FileReader();
// //     r.onload = () => res(r.result as string);
// //     r.onerror = rej;
// //     r.readAsDataURL(file);
// //   });

// //   const img = await new Promise<HTMLImageElement>((res, rej) => {
// //     const i = new Image();
// //     i.onload = () => res(i);
// //     i.onerror = rej;
// //     i.src = dataUrl;
// //   });

// //   const canvas = document.createElement("canvas");
// //   canvas.width = canvas.height = size;
// //   const ctx = canvas.getContext("2d")!;
// //   const minSide = Math.min(img.width, img.height);
// //   const sx = (img.width - minSide) / 2;
// //   const sy = (img.height - minSide) / 2;
// //   ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
// //   return canvas.toDataURL("image/jpeg", quality);
// // }

// // function initialsFrom(name: string) {
// //   const parts = (name || "User").trim().split(/\s+/);
// //   return (parts[0]?.[0] || "U") + (parts[1]?.[0] || "");
// // }
// // function colorFor(name: string) {
// //   let h = 0;
// //   for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
// //   return `hsl(${h},70%,45%)`;
// // }
// // function svgInitialsAvatar(name: string, size = 64) {
// //   const initials = initialsFrom(name).toUpperCase();
// //   const bg = colorFor(name);
// //   const svg =
// //     `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
// //     `<rect width='100%' height='100%' rx='${size / 2}' fill='${bg}'/>` +
// //     `<text x='50%' y='54%' font-family='Inter,system-ui,sans-serif' font-size='${size * 0.42}' text-anchor='middle' fill='white' dy='.1em'>${initials}</text>` +
// //     `</svg>`;
// //   return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
// // }


// // const [current, setCurrent] = useState(0);

// // const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";


// // const FEATURE_PREVIEWS = [
// //   {
// //     icon: Zap,
// //     title: "Prompt Optimization",
// //     description:
// //       "Reduce token usage by up to 60% while maintaining meaning and effectiveness across all LLM platforms.",
// //     onClick: () => go(routes.smartgen),
// //     mediaSrc: "/icons/srt.mp4",
// //   },
// //   {
// //     icon: Sparkles,
// //     title: "Smartgen Generator",
// //     description:
// //       "Transform simple ideas into powerful, optimized prompts with our AI-powered generation system.",
// //     onClick: () => go(routes.smartgen),
// //     mediaSrc: "/icons/srt.mp4",
// //   },
// //   {
// //     icon: TrendingUp,
// //     title: "Prompt Marketplace",
// //     description:
// //       "Built a great prompt? Trade it. Monetize your creativity and earn from your best prompt innovations.",
// //     onClick: () => go(routes.marketplace),
// //    mediaSrc: "/icons/srt.mp4",
// //   },
// //   {
// //     icon: null,
// //     image: "/icons/circle.png",
// //     title: "Prompt Library",
// //     description:
// //       "Access categorized prompts for Coding, Design, Marketing, Video Creation, and more.",
// //     onClick: () => go(routes.promptLibrary),
// //     mediaSrc: "/icons/srt.mp4",
// //   },
// // ];


// // const [previewIndex, setPreviewIndex] = useState<number | null>(null);
// // const [previewPhase, setPreviewPhase] = useState<"idle" | "entering" | "open">("idle");
// // const previewTimerRef = useRef<number | null>(null);

// // const activeFeature =
// //   previewIndex !== null ? FEATURE_PREVIEWS[previewIndex] : null;

// // const openOfferPreview = (index: number) => {
// //   if (previewPhase !== "idle") return;

// //   if (previewTimerRef.current) {
// //     window.clearTimeout(previewTimerRef.current);
// //   }

// //   setPreviewIndex(index);
// //   setPreviewPhase("entering");

// //   previewTimerRef.current = window.setTimeout(() => {
// //     setPreviewPhase("open");
// //   }, 520);
// // };

// // const closeOfferPreview = () => {
// //   if (previewTimerRef.current) {
// //     window.clearTimeout(previewTimerRef.current);
// //     previewTimerRef.current = null;
// //   }

// //   setPreviewPhase("idle");
// //   setPreviewIndex(null);
// // };

// // useEffect(() => {
// //   return () => {
// //     if (previewTimerRef.current) {
// //       window.clearTimeout(previewTimerRef.current);
// //     }
// //   };
// // }, []);


// // const nextSlide = () => {
// //   setCurrent((prev) => (prev + 1) % feedbacks.length);
// // };

// // const prevSlide = () => {
// //   setCurrent((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);
// // };

// // // auto slide
// // useEffect(() => {
// //   if (feedbacks.length <= 1) return;

// //   const interval = setInterval(() => {
// //     nextSlide();
// //   }, 4000);

// //   return () => clearInterval(interval);
// // }, [feedbacks]);




// // const HOW_IT_WORKS_NUMBER_COLOR = "#252526";

// // const HOW_IT_WORKS_STEPS = [
// //   {
// //     step: "Input Idea",
// //     iconSrc: "/icons/Group 643.png",
// //     description: "Share your concept or requirement",
// //   },
// //   {
// //     step: "SmartGen",
// //     iconSrc: "/icons/Group 646.png",
// //     description: "AI generates optimized prompts",
// //   },
// //   {
// //     step: "Optimize",
// //     iconSrc: "/icons/iyt.png",
// //     description: "Reduce tokens, improve quality",
// //   },
// //   {
// //     step: "Save or Sale",
// //     iconSrc: "/icons/Group 650.png",
// //     description: "Store in library or marketplace",
// //   },
// //   {
// //     step: "Earn",
// //     iconSrc: "/icons/Group.png",
// //     description: "Monetize your best prompts",
// //   },
// // ];


// //   return (
// //     <motion.section
// //       id="landing-root"
// //       style={{ backgroundColor: "#030406" }}
// //     className="relative min-h-screen overflow-x-hidden text-gray-200 bg-[#030406]"
// //     >
// //       {/* Fixed top background: static while scrolling, hidden after What We Offer */}
// //       <div
// //         aria-hidden
// //         className={`pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-300 ${
// //           showTopBg ? "opacity-100" : "opacity-0"
// //         }`}
// //       >
// //         <img
// //           src="/icons/homeban.png"
// //           alt="Tokun neon background"
// //           className="select-none absolute -top-24 right-0 w-[72vw] max-w-none opacity-90 mix-blend-screen"
// //         />

// //         <div className="absolute left-1/2 top-24 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(191,44,255,0.22),rgba(0,0,0,0))] blur-3xl" />

// //         <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(139,92,246,0.12),rgba(0,0,0,0))]" />
// //       </div>

// //       {/* HEADER */}
// // <header className="relative z-20 w-full">
// //   <div className="px-4 md:px-6 lg:px-8 py-4 lg:py-6">
// //     <div className="container mx-auto flex items-center justify-between">

// //       {/* Logo */}
// //       <div className="flex items-center gap-2 sm:gap-3 min-w-0">
// //         <img
// //   src="/icons/Tokun.png"
// //   alt="Tokun.world Logo"
// //   className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain transition-transform duration-200 hover:scale-105"
// // />
// //       </div>

// //       {/* Right Section */}
// //       <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
// //         {variant === "marketing" ? (
// //           <>
// //             <button
// //               onClick={() => go(routes.login)}
// //               className="hidden sm:block text-white/95 hover:text-white transition-colors"
// //               style={{ fontSize: 14, fontWeight: 600 }}
// //             >
// //               Login
// //             </button>
// // <button
// //   type="button"
// //   onClick={handleGetStarted}
// //   className="inline-flex items-center justify-center rounded-full hover:opacity-95 transition-opacity"
// //   style={{
// //     height: 40,
// //     padding: "0 16px",
// //     borderRadius: 200,
// //     background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
// //     color: "#FFFFFF",
// //     fontFamily: "Inter, system-ui, Arial, sans-serif",
// //     fontWeight: 600,
// //     fontSize: 13,
// //     lineHeight: "20px",
// //     gap: 6,
// //   }}
// // >
// //   <span>Get Started</span>
// //   <span
// //     aria-hidden
// //     className="inline-flex items-center justify-center rounded-full bg-white"
// //     style={{ width: 22, height: 22 }}
// //   >
// //     <MdKeyboardArrowRight size={14} color="black" />
// //   </span>
// // </button>
// //           </>
// //         ) : (
// //           <DropdownMenu>
// //             <AccountMenu />
// //           </DropdownMenu>
// //         )}
// //       </div>
// //     </div>
// //   </div>
// // </header>

// //       {/* MAIN */}
// // <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-8 pb-0">
// //         {/* HERO */}
// //         <div className="text-center space-y-8 mb-20">
// //           {/* <div className="flex justify-center">
// //             <GradientBadge label="Trusted by industry leaders" showIcon />
// //           </div> */}

// //           <div
// //             className="transform transition-transform duration-300 ease-out"
// //             style={{
// //               transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`,
// //             }}
// //           >
// //            <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight flex justify-center">
// //   <span className="relative inline-flex items-center justify-center select-none">
// //     {/* ambient glow behind full word */}
// //     <motion.span
// //       aria-hidden
// //       className="absolute inset-0 blur-3xl"
// //       style={{
// //         background:
// //           "radial-gradient(circle at 50% 50%, rgba(255,20,239,0.28) 0%, rgba(26,115,232,0.22) 38%, rgba(0,0,0,0) 72%)",
// //       }}
// //       animate={{
// //         opacity: [0.35, 0.7, 0.35],
// //         scale: [0.96, 1.04, 0.96],
// //       }}
// //       transition={{
// //         duration: 4.5,
// //         repeat: Infinity,
// //         ease: "easeInOut",
// //       }}
// //     />

// //     {/* whole word breathing */}
// //     <motion.span
// //       className="relative inline-flex items-center"
// //       animate={{
// //         y: [0, -2, 0],
// //         scale: [1, 1.01, 1],
// //       }}
// //       transition={{
// //         duration: 4,
// //         repeat: Infinity,
// //         ease: "easeInOut",
// //       }}
// //     >
// //       {/* T */}
// //       <motion.span
// //         className="relative inline-block bg-clip-text text-transparent"
// //         style={{
// //           backgroundImage:
// //             "linear-gradient(180deg, #ffffff 0%, #dbe8ff 38%, #7dd3fc 72%, #ffffff 100%)",
// //           WebkitBackgroundClip: "text",
// //           backgroundClip: "text",
// //           textShadow: "0 0 18px rgba(125,211,252,0.18)",
// //         }}
// //         animate={{
// //           opacity: [1, 0.92, 1],
// //           filter: [
// //             "drop-shadow(0 0 4px rgba(125,211,252,0.14))",
// //             "drop-shadow(0 0 10px rgba(26,115,232,0.18))",
// //             "drop-shadow(0 0 4px rgba(125,211,252,0.14))",
// //           ],
// //         }}
// //         transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
// //       >
// //         T
// //       </motion.span>

// //       {/* O */}
// //       <motion.span
// //         className="relative inline-block bg-clip-text text-transparent"
// //         style={{
// //           backgroundImage:
// //             "linear-gradient(180deg, #ffffff 0%, #e8dcff 34%, #c084fc 68%, #ffffff 100%)",
// //           WebkitBackgroundClip: "text",
// //           backgroundClip: "text",
// //         }}
// //         animate={{
// //           opacity: [0.95, 1, 0.95],
// //           rotateZ: [0, 0.2, 0],
// //         }}
// //         transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
// //       >
// //         O
// //       </motion.span>

// //       {/* K */}
// //       <motion.span
// //         className="relative inline-block bg-clip-text text-transparent"
// //         style={{
// //           backgroundImage:
// //             "linear-gradient(180deg, #ffffff 0%, #d9dbff 30%, #60a5fa 65%, #ffffff 100%)",
// //           WebkitBackgroundClip: "text",
// //           backgroundClip: "text",
// //         }}
// //         animate={{
// //           opacity: [1, 0.94, 1],
// //         }}
// //         transition={{ duration: 2.9, repeat: Infinity, ease: "easeInOut" }}
// //       >
// //         K
// //       </motion.span>

// //       {/* U special AI core */}
// //       <span className="relative inline-flex items-center justify-center mx-[4px]">
// //         {/* outer ring */}
// //         <motion.span
// //           className="absolute rounded-full"
// //           style={{
// //             width: "1.12em",
// //             height: "1.12em",
// //             border: "1px solid rgba(125,211,252,0.42)",
// //             boxShadow:
// //               "0 0 16px rgba(26,115,232,0.25), inset 0 0 12px rgba(255,20,239,0.16)",
// //           }}
// //           animate={{
// //             scale: [0.88, 1.16, 0.88],
// //             opacity: [0.35, 0.9, 0.35],
// //           }}
// //           transition={{
// //             duration: 2.4,
// //             repeat: Infinity,
// //             ease: "easeInOut",
// //           }}
// //         />

// //         {/* inner ring */}
// //         <motion.span
// //           className="absolute rounded-full"
// //           style={{
// //             width: "0.78em",
// //             height: "0.78em",
// //             border: "1px solid rgba(255,20,239,0.35)",
// //           }}
// //           animate={{
// //             scale: [1.15, 0.92, 1.15],
// //             opacity: [0.15, 0.55, 0.15],
// //           }}
// //           transition={{
// //             duration: 2,
// //             repeat: Infinity,
// //             ease: "easeInOut",
// //           }}
// //         />

// //         {/* orbit dot pink */}
// //         <motion.span
// //           className="absolute rounded-full"
// //           style={{
// //             width: 7,
// //             height: 7,
// //             background: "#FF14EF",
// //             boxShadow: "0 0 14px rgba(255,20,239,0.9)",
// //             top: "50%",
// //             left: "50%",
// //             marginLeft: -3.5,
// //             marginTop: -3.5,
// //           }}
// //           animate={{
// //             x: [0, 16, 0, -16, 0],
// //             y: [-18, 0, 18, 0, -18],
// //             scale: [0.9, 1.1, 0.9, 1.1, 0.9],
// //           }}
// //           transition={{
// //             duration: 4.2,
// //             repeat: Infinity,
// //             ease: "linear",
// //           }}
// //         />

// //         {/* orbit dot blue */}
// //         <motion.span
// //           className="absolute rounded-full"
// //           style={{
// //             width: 6,
// //             height: 6,
// //             background: "#1A73E8",
// //             boxShadow: "0 0 14px rgba(26,115,232,0.95)",
// //             top: "50%",
// //             left: "50%",
// //             marginLeft: -3,
// //             marginTop: -3,
// //           }}
// //           animate={{
// //             x: [0, -14, 0, 14, 0],
// //             y: [16, 0, -16, 0, 16],
// //             scale: [1.05, 0.85, 1.05, 0.85, 1.05],
// //           }}
// //           transition={{
// //             duration: 3.6,
// //             repeat: Infinity,
// //             ease: "linear",
// //           }}
// //         />

// //         {/* U letter */}
// //         <motion.span
// //           className="relative inline-block bg-clip-text text-transparent"
// //           style={{
// //             backgroundImage:
// //               "linear-gradient(180deg, #ffffff 0%, #67e8f9 30%, #1A73E8 64%, #FF14EF 100%)",
// //             WebkitBackgroundClip: "text",
// //             backgroundClip: "text",
// //             textShadow: "0 0 22px rgba(26,115,232,0.28)",
// //           }}
// //           animate={{
// //             y: [0, -3, 0],
// //             filter: [
// //               "drop-shadow(0 0 8px rgba(26,115,232,0.22))",
// //               "drop-shadow(0 0 18px rgba(255,20,239,0.35))",
// //               "drop-shadow(0 0 8px rgba(26,115,232,0.22))",
// //             ],
// //           }}
// //           transition={{
// //             duration: 2.2,
// //             repeat: Infinity,
// //             ease: "easeInOut",
// //           }}
// //         >
// //           U
// //         </motion.span>
// //       </span>

// //       {/* N */}
// //       <motion.span
// //         className="relative inline-block bg-clip-text text-transparent"
// //         style={{
// //           backgroundImage:
// //             "linear-gradient(180deg, #ffffff 0%, #f0e9ff 34%, #f472b6 70%, #ffffff 100%)",
// //           WebkitBackgroundClip: "text",
// //           backgroundClip: "text",
// //         }}
// //         animate={{
// //           opacity: [0.96, 1, 0.96],
// //         }}
// //         transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut" }}
// //       >
// //         N
// //       </motion.span>

// //       {/* shimmer sweep */}
// //       <motion.span
// //         aria-hidden
// //         className="pointer-events-none absolute inset-0"
// //         style={{
// //           background:
// //             "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 48%, transparent 100%)",
// //           mixBlendMode: "screen",
// //           filter: "blur(10px)",
// //         }}
// //         animate={{ x: ["-130%", "130%"] }}
// //         transition={{
// //           duration: 2.6,
// //           repeat: Infinity,
// //           ease: "linear",
// //           repeatDelay: 1.1,
// //         }}
// //       />

// //       {/* top scanner line */}
// //       <motion.span
// //         aria-hidden
// //         className="pointer-events-none absolute left-0 right-0 h-[2px] rounded-full"
// //         style={{
// //           top: "16%",
// //           background:
// //             "linear-gradient(90deg, transparent 0%, rgba(103,232,249,0.85) 50%, transparent 100%)",
// //           boxShadow: "0 0 14px rgba(103,232,249,0.5)",
// //         }}
// //         animate={{
// //           x: ["-12%", "12%", "-12%"],
// //           opacity: [0.25, 0.95, 0.25],
// //         }}
// //         transition={{
// //           duration: 3.2,
// //           repeat: Infinity,
// //           ease: "easeInOut",
// //         }}
// //       />
// //     </motion.span>

// //     {/* bottom neon reflection */}
// //     <motion.span
// //       aria-hidden
// //       className="absolute left-[8%] right-[8%] -bottom-2 h-4 rounded-full blur-xl"
// //       style={{
// //         background:
// //           "linear-gradient(90deg, rgba(26,115,232,0.0) 0%, rgba(26,115,232,0.18) 30%, rgba(255,20,239,0.22) 70%, rgba(255,20,239,0.0) 100%)",
// //       }}
// //       animate={{
// //         opacity: [0.25, 0.55, 0.25],
// //         scaleX: [0.96, 1.03, 0.96],
// //       }}
// //       transition={{
// //         duration: 3.4,
// //         repeat: Infinity,
// //         ease: "easeInOut",
// //       }}
// //     />
// //   </span>
// // </h1>



// // {/* <img
// //   src="/icons/tokun-logo-transparent.png"
// //   alt="Tokun"
// //   className="w-[320px] sm:w-[440px] md:w-[560px] lg:w-[680px] object-contain"
// // /> */}

// //             <h2 className="text-3xl md:text-4xl font-bold mb-8">
// //               Enter the Promptverse
// //             </h2>
// //             <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
// //               Optimize your LLM prompts, generate better outcomes, and monetize your best prompts—all in one place.
// //             </p>
// //           </div>
// //         </div>

// //  {/* CTAs */}
// // <div
// //   id="hero-ctas"
// //   className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-6 sm:mt-20 mb-16"
// // >
// //   {/* Smartgen + Arrow */}
// //   <div className="relative">
// //     <motion.img
// //       src="/icons/arr.png"
// //       alt="arrow highlight"
// //       className="pointer-events-none select-none absolute -top-6 -left-8 w-9 sm:-top-7 sm:-left-10 sm:w-10"
// //     />
// //     <motion.button
// //       onClick={() => go(routes.smartgen)}
// //       whileHover={{ scale: 1.05 }}
// //       className="relative w-[200px] sm:w-[220px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold shadow-2xl border border-white/10 backdrop-blur-md flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg"
// //       style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
// //     >
// //       <div className="absolute inset-0 rounded-full bg-white opacity-10 blur-[6px] pointer-events-none" />
// //       <span>Try Smartgen</span>
// //       <span
// //         aria-hidden
// //         className="inline-flex items-center justify-center rounded-full bg-white"
// //         style={{ width: 24, height: 24 }}
// //       >
// //         <MdKeyboardArrowRight size={14} color="black" />
// //       </span>
// //     </motion.button>

// //     {/* <motion.button
// //   onClick={() => go(routes.smartgen)}
// //   whileHover={{ scale: 1.05 }}
// //   className="steam-btn relative w-[200px] sm:w-[220px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold"
// //   style={{ borderRadius: 9999 }}
// // >
// //   <span
// //     className="steam-btn-inner backdrop-blur-md border border-white/10"
// //     style={{
// //       borderRadius: 9999,
// //       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
// //       boxShadow: "0 10px 30px rgba(255,20,239,0.18)",
// //       gap: 12,
// //       fontSize: "inherit",
// //     }}
// //   >
// //     <span>Try Smartgen</span>
// //     <span
// //       aria-hidden
// //       className="inline-flex items-center justify-center rounded-full bg-white"
// //       style={{ width: 24, height: 24 }}
// //     >
// //       <MdKeyboardArrowRight size={14} color="black" />
// //     </span>
// //   </span>
// // </motion.button> */}
// //   </div>

// //  <motion.button
// //     onClick={() => go(routes.marketplace)}
// //     whileHover={{ 
// //       scale: 1.05,
// //       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
// //       borderColor: "transparent"
// //     }}
// //     initial={{
// //       background: "transparent",
// //       borderColor: "rgba(255,255,255,0.25)"
// //     }}
// //     className="relative w-[200px] sm:w-[220px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold shadow-2xl backdrop-blur-md flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg"
// //     style={{ 
// //       border: "1px solid rgba(255,255,255,0.25)"
// //     }}
// //   >
// //     Prompt Marketplace
// //   </motion.button>


// //   {/* <motion.button
// //   onClick={() => go(routes.marketplace)}
// //   whileHover={{ scale: 1.05 }}
// //   className="steam-btn relative w-[200px] sm:w-[220px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold"
// //   style={{ borderRadius: 9999 }}
// // >
// //   <span
// //     className="steam-btn-inner backdrop-blur-md border border-white/10"
// //     style={{
// //       borderRadius: 9999,
// //       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
// //       boxShadow: "0 10px 30px rgba(255,20,239,0.18)",
// //     }}
// //   >
// //     Prompt Marketplace
// //   </span>
// // </motion.button> */}
// // </div>
// //         {/* STATS */}
// //         {/* <section className="mt-20">
// //           <div className="container mx-auto px-6">
// //             <div className="flex flex-col md:flex-row justify-center items-center text-center gap-8 font-[Inter]">
// //               <div className="flex flex-col items-center">
// //                 <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px", fontWeight: 500 }}>
// //                   Prompts Optimized
// //                 </div>
// //                 <div className="text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
// //                   50k
// //                 </div>
// //               </div>

// //               <div className="hidden md:block h-[19px] w-px bg-white/40 mx-4"></div>

// //               <div className="flex flex-col items-center">
// //                 <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px" }}>
// //                   Average Token Reduction
// //                 </div>
// //                 <div className="text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
// //                   60%
// //                 </div>
// //               </div>

// //               <div className="hidden md:block h-[19px] w-px bg-white/40 mx-4"></div>

// //               <div className="flex flex-col items-center">
// //                 <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px" }}>
// //                   User Rating
// //                 </div>
// //                 <div className="flex items-center gap-2 text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
// //                   <Star className="h-5 w-5 text-white" />
// //                   4.9
// //                 </div>
// //               </div>

// //               <div className="hidden md:block h-[19px] w-px bg-white/40 mx-4"></div>

// //               <div className="flex flex-col items-center">
// //                 <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px" }}>
// //                   Support Available
// //                 </div>
// //                 <div className="text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
// //                   24/7
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </section> */}


// // <section className="mt-20">
// //   <div className="container mx-auto px-4 sm:px-6">
// //     <div className="grid grid-cols-2 md:flex md:flex-row justify-center items-center gap-6 md:gap-10 font-[Inter]">
      
// //       <div className="flex flex-col items-center">
// //         <div className="text-white/90 mb-2 font-medium text-xs sm:text-sm md:text-base">
// //           Prompts Optimized
// //         </div>
// //         <div className="text-white font-extrabold text-2xl md:text-4xl tracking-tight">
// //           50k
// //         </div>
// //       </div>

// //       <div className="flex flex-col items-center">
// //         <div className="text-white/90 mb-2 font-medium text-xs sm:text-sm md:text-base">
// //           Token Reduction
// //         </div>
// //         <div className="text-white font-extrabold text-2xl md:text-4xl tracking-tight">
// //           60%
// //         </div>
// //       </div>

// //       <div className="flex flex-col items-center">
// //         <div className="text-white/90 mb-2 font-medium text-xs sm:text-sm md:text-base">
// //           User Rating
// //         </div>
// //         <div className="flex items-center gap-2 text-white font-extrabold text-2xl md:text-4xl tracking-tight">
// //           <Star className="h-5 w-5 md:h-7 md:w-7 text-white" />
// //           4.9
// //         </div>
// //       </div>

// //       <div className="flex flex-col items-center">
// //         <div className="text-white/90 mb-2 font-medium text-xs sm:text-sm md:text-base">
// //           Support
// //         </div>
// //         <div className="text-white font-extrabold text-2xl md:text-4xl tracking-tight">
// //           24/7
// //         </div>
// //       </div>
// //     </div>
// //   </div>
// // </section>
// // {/* 
// //              <div className="mt-12">
// //   <TickerSection />
// // </div> */}

// //        <div className="mt-8 flex flex-col items-center justify-center text-center select-none">
// //   <Mouse className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-white/70" strokeWidth={2.25} />
// //   <div className="mt-2 text-white/80" style={{ fontFamily: "Inter, ui-sans-serif, system-ui", fontSize: 12, lineHeight: "16px" }}>
// //     Scroll down
// //   </div>
// //   <motion.div className="mt-2" animate={{ y: [0, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
// //     <MoveDown className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 text-white/80" strokeWidth={2.25} />
// //   </motion.div>
// // </div>

// // {/* ══════════ OFFER SECTION ══════════ */}
// // <div className="mt-28">
// //   <AnimatePresence mode="wait">
// //     {/* ─── GRID VIEW ─── */}
// //     {offerPhase === "grid" && (
// //       <motion.div
// //         key="offer-grid"
// //         initial={{ opacity: 0, scale: 0.94, y: 22 }}
// //         animate={{ opacity: 1, scale: 1, y: 0 }}
// //         exit={{ opacity: 0, scale: 0.96, y: 6 }}
// //         transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
// //       >
// //         <h2
// //           id="top-bg-end"
// //           className="text-3xl md:text-5xl font-extrabold text-center mb-12 tracking-tight"
// //           style={{ letterSpacing: "-0.03em" }}
// //         >
// //           What We Offer
// //         </h2>

// //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
// //           {FEATURE_PREVIEWS.map((feature, i) => {
// //             const Icon = feature.icon;

// //             return (
// //               <motion.button
// //                 key={feature.title}
// //                 type="button"
// //                 onClick={() => openSplit(i)}
// //                 initial={{ opacity: 0, scale: 0.88, y: 18 }}
// //                 animate={{ opacity: 1, scale: 1, y: 0 }}
// //                 transition={{
// //                   duration: 0.45,
// //                   ease: [0.22, 1, 0.36, 1],
// //                   delay: i * 0.07,
// //                 }}
// //                 whileHover={{
// //                   y: -10,
// //                   scale: 1.025,
// //                   transition: {
// //                     type: "spring",
// //                     stiffness: 280,
// //                     damping: 18,
// //                   },
// //                 }}
// //                 whileTap={{ scale: 0.97 }}
// //                 className="group relative rounded-[28px] p-[1px] text-left overflow-hidden h-full"
// //                 style={{
// //                   background: "linear-gradient(160deg,#252528,#0d0e12)",
// //                 }}
// //               >
// //                 {/* Glow behind border */}
// //                 <div
// //                   className="pointer-events-none absolute -inset-px rounded-[29px] opacity-0 group-hover:opacity-100 transition-opacity duration-400"
// //                   style={{
// //                     background: "linear-gradient(135deg,#FF14EF,#1A73E8)",
// //                     filter: "blur(14px)",
// //                     zIndex: 0,
// //                   }}
// //                 />

// //                 {/* Border itself */}
// //                 <div
// //                   className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-350"
// //                   style={{
// //                     background: "linear-gradient(135deg,#FF14EF,#1A73E8)",
// //                   }}
// //                 />

// //                 <div className="relative rounded-[26px] bg-[#030406] group-hover:bg-[#06070d] transition-colors duration-300 p-6 flex flex-col gap-3 h-full z-[1]">
// //                   {/* Number - same as How It Works */}
// //                   <span
// //                     className="absolute top-3 right-3"
// //                     style={{
// //                       width: 26,
// //                       height: 24,
// //                       opacity: 1,
// //                       fontFamily: "Inter, ui-sans-serif, system-ui",
// //                       fontWeight: 500,
// //                       fontStyle: "normal",
// //                       fontSize: 20,
// //                       lineHeight: "100%",
// //                       letterSpacing: "0%",
// //                       textAlign: "right",
// //                       color: "#252526",
// //                     }}
// //                   >
// //                     {String(i + 1).padStart(2, "0")}
// //                   </span>

// //                   {/* Icon box */}
// //                   <div
// //                     className="w-11 h-11 rounded-[14px] flex items-center justify-center transition-all duration-300 group-hover:bg-white/8"
// //                     style={{
// //                       background: "rgba(255,255,255,0.04)",
// //                       border: "1px solid rgba(255,255,255,0.07)",
// //                     }}
// //                   >
// //                     {feature.image ? (
// //                       <img
// //                         src={feature.image}
// //                         className="h-6 w-6 object-contain"
// //                         alt=""
// //                       />
// //                     ) : Icon ? (
// //                       <>
// //                         <Icon
// //                           className="h-6 w-6"
// //                           style={{
// //                             stroke: "url(#ig-grid)",
// //                             strokeWidth: 1.7,
// //                             fill: "none",
// //                           }}
// //                         />
// //                         <svg width="0" height="0" aria-hidden>
// //                           <defs>
// //                             <linearGradient
// //                               id="ig-grid"
// //                               x1="0"
// //                               y1="0"
// //                               x2="0"
// //                               y2="1"
// //                             >
// //                               <stop offset="0%" stopColor="#1A73E8" />
// //                               <stop offset="100%" stopColor="#FF14EF" />
// //                             </linearGradient>
// //                           </defs>
// //                         </svg>
// //                       </>
// //                     ) : null}
// //                   </div>

// //                   <div
// //                     className="font-bold text-[17px] text-white tracking-tight leading-snug"
// //                     style={{ letterSpacing: "-0.02em" }}
// //                   >
// //                     {feature.title}
// //                   </div>

// //                   <div className="text-[11.5px] text-white/55 leading-relaxed flex-1">
// //                     {feature.description}
// //                   </div>

// //                   {/* Explore CTA */}
// //                   <div className="mt-auto flex items-center gap-1.5 text-[11px] font-semibold text-white/35 group-hover:text-white/75 transition-colors duration-300 tracking-wide">
// //                     <span>Explore</span>
// //                     <div className="w-[22px] h-[22px] rounded-full border border-current flex items-center justify-center text-[11px] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[#FF14EF] group-hover:to-[#1A73E8] group-hover:border-transparent group-hover:text-white">
// //                       →
// //                     </div>
// //                   </div>
// //                 </div>
// //               </motion.button>
// //             );
// //           })}
// //         </div>
// //       </motion.div>
// //     )}

// //     {/* ─── SPLIT VIEW ─── */}
// //     {offerPhase === "split" && (
// //       <motion.div
// //         key="offer-split"
// //         initial={{ opacity: 0, scale: 0.95 }}
// //         animate={{ opacity: 1, scale: 1 }}
// //         exit={{ opacity: 0, scale: 0.95 }}
// //         transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
// //       >
// //         <h2
// //           id="top-bg-end"
// //           className="text-3xl md:text-5xl font-extrabold text-center mb-10 tracking-tight"
// //           style={{ letterSpacing: "-0.03em" }}
// //         >
// //           What We Offer
// //         </h2>

// //         <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-3.5 max-w-[1100px] mx-auto items-stretch">
// //           {/* LEFT — mini cards */}
// //           <div className="flex flex-col gap-2 h-full">
// //             {FEATURE_PREVIEWS.map((feature, i) => {
// //               const Icon = feature.icon;
// //               const isAct = i === activeOfferIdx;

// //               return (
// //                 <motion.button
// //                   key={feature.title}
// //                   type="button"
// //                   onClick={() => !offerBusy && setActiveOfferIdx(i)}
// //                   whileHover={
// //                     !isAct
// //                       ? {
// //                           x: 6,
// //                           transition: {
// //                             type: "spring",
// //                             stiffness: 320,
// //                             damping: 20,
// //                           },
// //                         }
// //                       : {}
// //                   }
// //                   whileTap={{ scale: 0.98 }}
// //                   className="relative rounded-[14px] p-[1px] text-left overflow-hidden flex-1 flex flex-col"
// //                   style={{
// //                     background: isAct
// //                       ? "linear-gradient(135deg,#FF14EF,#1A73E8)"
// //                       : "linear-gradient(160deg,#1e1e22,#0d0e12)",
// //                   }}
// //                 >
// //                   {/* Active left bar */}
// //                   {isAct && (
// //                     <motion.div
// //                       layoutId="active-bar"
// //                       className="absolute left-0 top-[10%] bottom-[10%] w-[2px] rounded-full z-10"
// //                       style={{
// //                         background:
// //                           "linear-gradient(to bottom,#FF14EF,#1A73E8)",
// //                       }}
// //                       transition={{
// //                         type: "spring",
// //                         stiffness: 400,
// //                         damping: 30,
// //                       }}
// //                     />
// //                   )}

// //                   <div
// //                     className="relative rounded-[12px] p-3 pr-9 flex items-start gap-2.5 h-full transition-colors duration-250"
// //                     style={{
// //                       background: isAct ? "rgba(8,16,36,.88)" : "#030406",
// //                     }}
// //                   >
// //                     {/* Number - same as How It Works */}
// //                     <span
// //                       className="absolute top-3 right-3"
// //                       style={{
// //                         width: 26,
// //                         height: 24,
// //                         opacity: 1,
// //                         fontFamily: "Inter, ui-sans-serif, system-ui",
// //                         fontWeight: 500,
// //                         fontStyle: "normal",
// //                         fontSize: 20,
// //                         lineHeight: "100%",
// //                         letterSpacing: "0%",
// //                         textAlign: "right",
// //                         color: "#252526",
// //                       }}
// //                     >
// //                       {String(i + 1).padStart(2, "0")}
// //                     </span>

// //                     <div className="flex-shrink-0 mt-[3px]">
// //                       {feature.image ? (
// //                         <img
// //                           src={feature.image}
// //                           className="h-4 w-4 object-contain"
// //                           alt=""
// //                         />
// //                       ) : Icon ? (
// //                         <>
// //                           <Icon
// //                             className="h-4 w-4"
// //                             style={{
// //                               stroke: "url(#ig-mini)",
// //                               strokeWidth: 1.7,
// //                               fill: "none",
// //                             }}
// //                           />
// //                           <svg width="0" height="0" aria-hidden>
// //                             <defs>
// //                               <linearGradient
// //                                 id="ig-mini"
// //                                 x1="0"
// //                                 y1="0"
// //                                 x2="0"
// //                                 y2="1"
// //                               >
// //                                 <stop offset="0%" stopColor="#1A73E8" />
// //                                 <stop offset="100%" stopColor="#FF14EF" />
// //                               </linearGradient>
// //                             </defs>
// //                           </svg>
// //                         </>
// //                       ) : null}
// //                     </div>

// //                     <div>
// //                       <div className="text-white font-bold text-[12px] leading-snug mb-0.5 tracking-tight">
// //                         {feature.title}
// //                       </div>
// //                       <div className="text-white/42 text-[10px] leading-relaxed">
// //                         {feature.description}
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </motion.button>
// //               );
// //             })}
// //           </div>

// //           {/* RIGHT — video pane */}
// //           <AnimatePresence mode="wait">
// //             {activeOfferIdx !== null &&
// //               (() => {
// //                 const f = FEATURE_PREVIEWS[activeOfferIdx];
// //                 const Icon = f.icon;

// //                 return (
// //                   <motion.div
// //                     key={`vp-${activeOfferIdx}`}
// //                     initial={{ opacity: 0, x: 36, scale: 0.95 }}
// //                     animate={{ opacity: 1, x: 0, scale: 1 }}
// //                     exit={{ opacity: 0, x: -20, scale: 0.97 }}
// //                     transition={{
// //                       duration: 0.46,
// //                       ease: [0.22, 1, 0.36, 1],
// //                     }}
// //                     className="relative rounded-[22px] overflow-hidden flex flex-col justify-end"
// //                     style={{
// //                       border: "1px solid rgba(255,255,255,.07)",
// //                       minHeight: 380,
// //                     }}
// //                   >
// //                     {/* Dynamic radial bg */}
// //                     <motion.div
// //                       key={`bg-${activeOfferIdx}`}
// //                       initial={{ opacity: 0 }}
// //                       animate={{ opacity: 1 }}
// //                       transition={{ duration: 0.7 }}
// //                       className="absolute inset-0"
// //                       style={{
// //                         background:
// //                           "radial-gradient(ellipse at 65% 25%, rgba(26,115,232,.22) 0%, rgba(255,20,239,.14) 45%, #020307 100%)",
// //                       }}
// //                     />

// //                     {/* Dot grid */}
// //                     <div
// //                       className="absolute inset-0 z-[1] pointer-events-none"
// //                       style={{
// //                         backgroundImage:
// //                           "linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",
// //                         backgroundSize: "40px 40px",
// //                       }}
// //                     />

// //                     {/* Scan line */}
// //                     <div className="absolute inset-0 overflow-hidden z-[2] pointer-events-none">
// //                       <div
// //                         className="absolute left-0 right-0 h-[2px]"
// //                         style={{
// //                           background:
// //                             "linear-gradient(90deg,transparent 0%,rgba(255,20,239,.6) 30%,rgba(26,115,232,.6) 70%,transparent 100%)",
// //                           animation:
// //                             "scan 2.8s cubic-bezier(.4,0,.6,1) infinite",
// //                           boxShadow: "0 0 12px rgba(255,20,239,.4)",
// //                         }}
// //                       />
// //                     </div>

// //                     {/* Dark overlay */}
// //                     <div
// //                       className="absolute inset-0 z-[3] pointer-events-none"
// //                       style={{
// //                         background:
// //                           "linear-gradient(to top,rgba(2,3,7,.95) 0%,rgba(2,3,7,.5) 35%,rgba(2,3,7,.1) 65%,transparent 100%)",
// //                       }}
// //                     />

// //                     {/* Video */}
// //                     <video
// //                       src={f.mediaSrc}
// //                       className="absolute inset-0 w-full h-full object-cover z-0"
// //                       autoPlay
// //                       muted
// //                       loop
// //                       playsInline
// //                     />

// //                     {/* Close */}
// //                     <button
// //                       type="button"
// //                       onClick={closeSplit}
// //                       aria-label="Back to grid"
// //                       className="absolute top-3 right-3 z-20 w-[30px] h-[30px] rounded-full flex items-center justify-center text-white/80 hover:text-white hover:scale-110 transition-all duration-200"
// //                       style={{
// //                         border: "1px solid rgba(255,255,255,.18)",
// //                         background: "rgba(0,0,0,.65)",
// //                         backdropFilter: "blur(6px)",
// //                       }}
// //                     >
// //                       <X className="h-3 w-3" />
// //                     </button>

// //                     {/* Center icon with pulse rings */}
// //                     <div className="absolute inset-0 flex items-center justify-center z-[4] pointer-events-none">
// //                       <div className="relative">
// //                         <div
// //                           className="absolute inset-[-8px] rounded-full"
// //                           style={{
// //                             border: "1px solid rgba(255,20,239,.25)",
// //                             animation: "pulse-ring 2.2s ease-in-out infinite",
// //                           }}
// //                         />
// //                         <div
// //                           className="absolute inset-[-16px] rounded-full"
// //                           style={{
// //                             border: "1px solid rgba(26,115,232,.15)",
// //                             animation:
// //                               "pulse-ring 2.2s ease-in-out .6s infinite",
// //                           }}
// //                         />

// //                         <div
// //                           className="w-[68px] h-[68px] rounded-full flex items-center justify-center relative z-[1]"
// //                           style={{
// //                             border: "1px solid rgba(255,255,255,.12)",
// //                             background: "rgba(255,255,255,.05)",
// //                             backdropFilter: "blur(10px)",
// //                           }}
// //                         >
// //                           {f.image ? (
// //                             <img
// //                               src={f.image}
// //                               className="h-6 w-6 object-contain"
// //                               alt=""
// //                             />
// //                           ) : Icon ? (
// //                             <>
// //                               <Icon
// //                                 className="h-6 w-6"
// //                                 style={{
// //                                   stroke: "url(#ig-video)",
// //                                   strokeWidth: 1.7,
// //                                   fill: "none",
// //                                 }}
// //                               />
// //                               <svg width="0" height="0" aria-hidden>
// //                                 <defs>
// //                                   <linearGradient
// //                                     id="ig-video"
// //                                     x1="0"
// //                                     y1="0"
// //                                     x2="0"
// //                                     y2="1"
// //                                   >
// //                                     <stop offset="0%" stopColor="#1A73E8" />
// //                                     <stop offset="100%" stopColor="#FF14EF" />
// //                                   </linearGradient>
// //                                 </defs>
// //                               </svg>
// //                             </>
// //                           ) : null}
// //                         </div>
// //                       </div>
// //                     </div>

// //                     {/* Bottom content */}
// //                     <div className="relative z-[5] p-5 md:p-6">
// //                       <div
// //                         className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mb-2.5 text-[9px] font-bold tracking-[.1em] uppercase text-white/50"
// //                         style={{
// //                           background: "rgba(255,255,255,.07)",
// //                           border: "1px solid rgba(255,255,255,.1)",
// //                         }}
// //                       >
// //                         <div
// //                           className="w-[5px] h-[5px] rounded-full"
// //                           style={{
// //                             background:
// //                               "linear-gradient(135deg,#FF14EF,#1A73E8)",
// //                           }}
// //                         />
// //                         {String(activeOfferIdx + 1).padStart(2, "0")} ·{" "}
// //                         {f.title.split(" ")[0]}
// //                       </div>

// //                       <motion.h3
// //                         key={`t-${activeOfferIdx}`}
// //                         initial={{ opacity: 0, y: 12 }}
// //                         animate={{ opacity: 1, y: 0 }}
// //                         transition={{
// //                           duration: 0.32,
// //                           ease: [0.22, 1, 0.36, 1],
// //                         }}
// //                         className="text-white font-black text-2xl md:text-3xl mb-2 leading-tight"
// //                         style={{ letterSpacing: "-0.03em" }}
// //                       >
// //                         {f.title}
// //                       </motion.h3>

// //                       <motion.p
// //                         key={`d-${activeOfferIdx}`}
// //                         initial={{ opacity: 0, y: 8 }}
// //                         animate={{ opacity: 1, y: 0 }}
// //                         transition={{
// //                           duration: 0.32,
// //                           delay: 0.06,
// //                           ease: [0.22, 1, 0.36, 1],
// //                         }}
// //                         className="text-white/60 text-xs leading-relaxed"
// //                       >
// //                         {f.description}
// //                       </motion.p>
// //                     </div>
// //                   </motion.div>
// //                 );
// //               })()}
// //           </AnimatePresence>
// //         </div>

// //         {/* Progress dots */}
// //         <div className="flex justify-center gap-1.5 mt-4">
// //           {FEATURE_PREVIEWS.map((_, i) => (
// //             <motion.button
// //               key={i}
// //               onClick={() => !offerBusy && setActiveOfferIdx(i)}
// //               animate={{ width: i === activeOfferIdx ? 20 : 4 }}
// //               transition={{ type: "spring", stiffness: 400, damping: 28 }}
// //               className="h-[4px] rounded-full"
// //               style={{
// //                 background:
// //                   i === activeOfferIdx
// //                     ? "linear-gradient(90deg,#FF14EF,#1A73E8)"
// //                     : "rgba(255,255,255,0.18)",
// //               }}
// //             />
// //           ))}
// //         </div>
// //       </motion.div>
// //     )}
// //   </AnimatePresence>
// // </div>

// //         {/* HOW IT WORKS + PRODUCT DEMO */}
// //         <div className="mt-28" style={{ borderWidth: "1px 0 1px 0", borderStyle: "solid", borderColor: "#171717", background: "#08090B" }}>
// //           <div className="pt-16 flex justify-center mb-8">
// //             <div className="p-[1px] rounded-full" style={{ background: "linear-gradient(90deg, #1A73E8 0%, #FF14EF 100%)" }}>
// //               <div className="px-5 py-2 rounded-full bg-black">
// //                 <span
// //                   style={{
// //                     fontFamily: "Inter, ui-sans-serif, system-ui",
// //                     fontWeight: 500,
// //                     fontSize: 16,
// //                     lineHeight: "100%",
// //                     background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //                     WebkitBackgroundClip: "text",
// //                     color: "transparent",
// //                   }}
// //                 >
// //                   PROCESS
// //                 </span>
// //               </div>
// //             </div>
// //           </div>











// //           {/* <div className="pt-16 flex justify-center mb-8">
// //   <button
// //     type="button"
// //     className="steam-btn rounded-full"
// //     style={{ borderRadius: 9999 }}
// //   >
// //     <span
// //       className="steam-btn-inner px-5 py-2"
// //       style={{
// //         borderRadius: 9999,
// //         background: "#000000",
// //       }}
// //     >
// //       <span
// //         style={{
// //           fontFamily: "Inter, ui-sans-serif, system-ui",
// //           fontWeight: 500,
// //           fontSize: 16,
// //           lineHeight: "100%",
// //           background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //           WebkitBackgroundClip: "text",
// //           color: "transparent",
// //         }}
// //       >
// //         PROCESS
// //       </span>
// //     </span>
// //   </button>
// // </div> */}
// //           {/* <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">How It Works</h2> */}
// //            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
// //   How It Works
// // </h2>

// //           {/* Steps grid */}
// //           {/* <div className="px-6">
// //             <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 mb-16">
// //               {[
// //                 { step: "Input Idea", Icon: Zap, description: "Share your concept or requirement" },
// //                 { step: "Smartgen", Icon: Sparkles, description: "AI generates optimized prompts" },
// //                 { step: "Optimize", Icon: Zap, description: "Reduce tokens, improve quality" },
// //                 { step: "Save or Sell", Icon: Sparkle, description: "Store in library or marketplace" },
// //                 { step: "Earn", Icon: Sparkle, description: "Monetize your best prompts" },
// //               ].map((item, i) => {
// //                 const isActive = i === activeStep;
// //                 const fill = isActive ? "linear-gradient(360deg, #1A1A1A 0%, #08090B 100%)" : "#030406";

// //                 return (
// //                   <button
// //                     key={i}
// //                     type="button"
// //                     onClick={() => setActiveStep(i)}
// //                     className="relative cursor-pointer select-none focus:outline-none"
// //                     style={{
// //                       width: "100%",
// //                       padding: 2,
// //                       borderRadius: 22,
// //                       background: "linear-gradient(180deg, #333333 0%, #12141A 100%)",
// //                     }}
// //                     onMouseEnter={(e) => {
// //                       const inner = e.currentTarget.querySelector<HTMLElement>("[data-inner]");
// //                       if (inner && !isActive) inner.style.background = "linear-gradient(360deg, #1A1A1A 0%, #08090B 100%)";
// //                     }}
// //                     onMouseLeave={(e) => {
// //                       const inner = e.currentTarget.querySelector<HTMLElement>("[data-inner]");
// //                       if (inner && !isActive) inner.style.background = "#030406";
// //                     }}
// //                   >
// //                     <div
// //                       data-inner
// //                       className="w-full h-full flex flex-col items-start justify-start p-5 text-left transition-colors overflow-hidden"
// //                       style={{
// //                         borderRadius: 18,
// //                         background: fill,
// //                         minHeight: 140,
// //                       }}
// //                     >
// //                       <div className="absolute top-3 right-4 text-white/40 font-semibold text-sm">
// //                         {String(i + 1).padStart(2, "0")}
// //                       </div>

// //                       <div className="mb-2">
// //                         <item.Icon className="h-8 w-8 text-white" />
// //                       </div>

// //                       <h3 className="text-white font-semibold text-[18px] sm:text-[20px] leading-snug break-words">
// //                         {item.step}
// //                       </h3>

// //                       <p className="text-white/70 mt-2 text-[14px] sm:text-[15px] leading-snug break-words whitespace-normal">
// //                         {item.description}
// //                       </p>
// //                     </div>
// //                   </button>
// //                 );
// //               })}
// //             </div>
// //           </div> */}


// //     <div className="px-0 sm:px-4 md:px-6">
// //   <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-16">
// //     {HOW_IT_WORKS_STEPS.map((item, i) => {
// //       const isActive = i === activeStep;

// //       const fill = isActive
// //         ? "linear-gradient(360deg, #1A1A1A 0%, #08090B 100%)"
// //         : "#030406";

// //       return (
// //         <button
// //           key={item.step}
// //           type="button"
// //           onClick={() => setActiveStep(i)}
// //           className="relative cursor-pointer select-none focus:outline-none w-full group"
// //           style={{
// //             padding: 1,
// //             borderRadius: 12,
// //             background: "linear-gradient(180deg, #333333 0%, #12141A 100%)",
// //           }}
// //         >
// //           <div
// //             className="relative w-full h-full flex flex-col items-start justify-start text-left transition-colors overflow-hidden"
// //             style={{
// //               borderRadius: 11,
// //               background: fill,
// //               minHeight: 140,
// //               padding: "18px 20px",
// //             }}
// //           >
// //             {/* Number */}
// //             <div
// //               className="absolute top-3 right-3"
// //               style={{
// //                 width: 26,
// //                 height: 24,
// //                 opacity: 1,
// //                 fontFamily: "Inter, ui-sans-serif, system-ui",
// //                 fontWeight: 500,
// //                 fontStyle: "normal",
// //                 fontSize: 20,
// //                 lineHeight: "100%",
// //                 letterSpacing: "0%",
// //                 textAlign: "right",
// //                 color: HOW_IT_WORKS_NUMBER_COLOR,
// //               }}
// //             >
// //               {String(i + 1).padStart(2, "0")}
// //             </div>

// //             {/* Icon */}
// //             <div className="mb-5">
// //               <img
// //                 src={item.iconSrc}
// //                 alt=""
// //                 draggable={false}
// //                 className="w-8 h-8 object-contain"
// //                 style={{
// //                   filter: "brightness(0) invert(1)",
// //                 }}
// //               />
// //             </div>

// //             {/* Title */}
// //             <h3
// //               className="text-white font-semibold leading-none"
// //               style={{
// //                 fontSize: i === 0 ? 22 : 20,
// //                 fontFamily: "Inter, ui-sans-serif, system-ui",
// //               }}
// //             >
// //               {item.step}
// //             </h3>

// //             {/* Description */}
// //             <p
// //               className="text-white/85 mt-3 leading-tight"
// //               style={{
// //                 fontSize: i === 0 ? 16 : 14,
// //                 fontFamily: "Inter, ui-sans-serif, system-ui",
// //                 maxWidth: 150,
// //               }}
// //             >
// //               {item.description}
// //             </p>
// //           </div>
// //         </button>
// //       );
// //     })}
// //   </div>
// // </div>
   
// //      {/* Product Demo */}
// // <div className="mt-28 relative overflow-hidden">

// //   <div className="container mx-auto px-6 text-center">

// //     {/* Heading */}
// //    <h3 className="text-3xl md:text-5xl font-bold text-white">
// //   Product Demo
// // </h3>

// //     <p className="text-white/70 text-lg mt-3 mb-12">
// //       Video demonstration of earn feature
// //     </p>

// //     {/* Demo Wrapper */}
// //     <div className="relative w-full max-w-[1200px] mx-auto">

// //       {/* Glow background */}
// //       <div
// //         className="absolute inset-0 blur-[120px] opacity-40"
// //         style={{
// //           background:
// //             "radial-gradient(circle at center, rgba(255,20,239,0.35) 0%, rgba(26,115,232,0.35) 100%)",
// //         }}
// //       />

// //       {/* Laptop with 3D animation */}
// //       <motion.div
// //         whileHover={{
// //           rotateX: 6,
// //           rotateY: -6,
// //           scale: 1.03,
// //         }}
// //         transition={{ type: "spring", stiffness: 120 }}
// //         className="relative mx-auto"
// //         style={{ perspective: 1200 }}
// //       >

// //         {/* Laptop Image */}
// //         <img
// //           src="/icons/ux.png"
// //           alt="Laptop demo"
// //           className="w-full h-auto select-none pointer-events-none"
// //           draggable={false}
// //         />

// //         {/* Screen Video */}
// //         <div
// //           className="absolute overflow-hidden rounded-[12px]"
// //           style={{
// //             top: "16.5%",
// //             left: "11.8%",
// //             width: "76.4%",
// //             height: "64%",
// //           }}
// //         >
// //     <video
// //   src="/icons/token.mp4"
// //   className="w-full h-full object-cover"
// //   autoPlay
// //   muted
// //   loop
// //   playsInline
// // />
// //         </div>

// //       </motion.div>

// //     </div>
// //   </div>
// // </div>
// //         </div>

// //         <GlobeSection /> {/* ← yahan add karo */}
// //           <FAQSection />   
// //         {/* FINAL CTA */}
// //         <div className="mt-28 text-center">
// //        <div className="flex justify-center mb-4">
// //   <button
// //     type="button"
// //     className="rounded-full"
// //     style={{
// //       borderRadius: 9999,
// //       padding: "1px",
// //       background: "linear-gradient(90deg, #1A73E8 0%, #FF14EF 100%)",
// //     }}
// //   >
// //     <span
// //       className="px-5 py-2 inline-flex items-center justify-center rounded-full"
// //       style={{
// //         borderRadius: 9999,
// //         background: "#000000",
// //       }}
// //     >
// //       <span
// //         style={{
// //           fontFamily: "Inter, ui-sans-serif, system-ui",
// //           fontWeight: 500,
// //           fontSize: 16,
// //           lineHeight: "100%",
// //           background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //           WebkitBackgroundClip: "text",
// //           color: "transparent",
// //         }}
// //       >
// //         REACH OUT ANY TIME
// //       </span>
// //     </span>
// //   </button>
// // </div>

// //        <h2 className="text-3xl md:text-5xl font-bold mb-6">
// //   Ready to optimize your prompts?
// // </h2>
// // <p className="text-base sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
// //   Join thousands of developers who are already saving costs and improving efficiency with TOKUN.
// // </p>

// //          <div className="relative inline-block overflow-visible isolate">
// //   <div
// //     className="pointer-events-none absolute -inset-x-16 -top-2 -bottom-10 rounded-[36px] z-0"
// //     style={{
// //       background: "linear-gradient(90deg, rgba(255,20,239,0.4) 0%, rgba(26,115,232,0.4) 100%)",
// //       filter: "blur(60px)",
// //       opacity: 1,
// //     }}
// //   />
// //   <div className="relative">
// //     <motion.img
// //       src="/icons/arr.png"
// //       alt="arrow highlight"
// //       className="pointer-events-none select-none absolute -top-6 -left-8 w-9 sm:-top-7 sm:-left-10 sm:w-10"
// //     />
// //     <motion.button
// //       onClick={() => go(routes.app)}
// //       whileHover={{ scale: 1.05 }}
// //       className="relative w-[200px] sm:w-[240px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold shadow-2xl border border-white/10 backdrop-blur-md flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg"
// //       style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
// //     >
// //       <div className="absolute inset-0 rounded-full bg-white opacity-10 blur-[6px] pointer-events-none" />
// //       <span>Start Optimizing Now</span>
// //       <span
// //         aria-hidden
// //         className="inline-flex items-center justify-center rounded-full bg-white"
// //         style={{ width: 24, height: 24 }}
// //       >
// //         <MdKeyboardArrowRight size={14} color="black" />
// //       </span>
// //     </motion.button>
// //     {/* <motion.button
// //   onClick={() => go(routes.app)}
// //   whileHover={{ scale: 1.05 }}
// //   className="steam-btn relative w-[200px] sm:w-[240px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold"
// //   style={{ borderRadius: 9999 }}
// // >
// //   <span
// //     className="steam-btn-inner backdrop-blur-md border border-white/10"
// //     style={{
// //       borderRadius: 9999,
// //       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
// //       boxShadow: "0 10px 30px rgba(255,20,239,0.18)",
// //       gap: 12,
// //     }}
// //   >
// //     <span>Start Optimizing Now</span>
// //     <span
// //       aria-hidden
// //       className="inline-flex items-center justify-center rounded-full bg-white"
// //       style={{ width: 24, height: 24 }}
// //     >
// //       <MdKeyboardArrowRight size={14} color="black" />
// //     </span>
// //   </span>
// // </motion.button> */}
// //   </div>
// // </div>
// //         </div>

// //         {/* TESTIMONIALS */}
// //           {/* TESTIMONIALS */}
// //       {/* TESTIMONIALS — SAME POSITION & DESIGN, keep < and > arrows; center when only one */}
// //            {/* TESTIMONIALS */}
// // <div className="mt-28 mb-8 relative font-[Inter] px-4">

// //   {/* TAG */}
// //   <div className="flex justify-center mb-4">
// //     <div
// //       className="p-[1px] rounded-full"
// //       style={{ background: "linear-gradient(90deg, #1A73E8 0%, #FF14EF 100%)" }}
// //     >
// //       <div className="px-5 py-2 rounded-full bg-black">
// //         <span
// //           style={{
// //             fontWeight: 500,
// //             fontSize: 16,
// //             background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //             WebkitBackgroundClip: "text",
// //             color: "transparent",
// //           }}
// //         >
// //           WALL OF LOVE
// //         </span>
// //       </div>
// //     </div>
// //   </div>

// //   {/* <div className="flex justify-center mb-4">
// //   <button
// //     type="button"
// //     className="steam-btn rounded-full"
// //     style={{ borderRadius: 9999 }}
// //   >
// //     <span
// //       className="steam-btn-inner px-5 py-2"
// //       style={{
// //         borderRadius: 9999,
// //         background: "#000000",
// //       }}
// //     >
// //       <span
// //         style={{
// //           fontWeight: 500,
// //           fontSize: 16,
// //           background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //           WebkitBackgroundClip: "text",
// //           color: "transparent",
// //         }}
// //       >
// //         WALL OF LOVE
// //       </span>
// //     </span>
// //   </button>
// // </div> */}

// //  <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-4">
// //   Loved by thinkers
// // </h2>

// // <p className="text-sm sm:text-lg text-white/70 text-center mb-12">
// //   Here's what people worldwide are saying
// // </p>

// //  {feedbacks.length === 0 ? (
// //   <div className="text-center text-white/60">
// //     No testimonials yet — be the first to leave feedback!
// //   </div>
// // ) : (
// //   <div className="flex justify-center items-center gap-3 sm:gap-6 px-3 sm:px-0">
// //     {/* LEFT BUTTON */}
// //     <button
// //       onClick={prevSlide}
// //       className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white text-white transition-all shrink-0"
// //     >
// //       <MdKeyboardArrowDown size={20} className="rotate-90 sm:text-[22px]" />
// //     </button>

// //     {/* SLIDER */}
// //     <div className="relative w-full max-w-[560px] overflow-hidden">
// //       <AnimatePresence mode="wait">
// //         <motion.div
// //           key={current}
// //           initial={{ opacity: 0, x: 120 }}
// //           animate={{ opacity: 1, x: 0 }}
// //           exit={{ opacity: 0, x: -120 }}
// //           transition={{ duration: 0.4 }}
// //           className="w-full"
// //         >
// //           {(() => {
// //             const t = feedbacks[current];
// //             return (
// //               <div
// //                 key={t.id}
// //                 className="relative flex flex-col justify-between p-4 sm:p-6 text-left bg-transparent overflow-hidden w-full"
// //                 style={{
// //                   border: "1px solid #333335",
// //                   borderRadius: 24,
// //                 }}
// //               >
// //                 {/* glow */}
// //                 <div
// //                   className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-28 h-28 sm:w-40 sm:h-40 rounded-full pointer-events-none"
// //                   style={{
// //                     background:
// //                       "radial-gradient(circle at center, rgba(255,20,239,0.25) 0%, rgba(26,115,232,0.25) 100%)",
// //                     filter: "blur(60px)",
// //                   }}
// //                 />

// //                 <div className="relative z-10 flex flex-col gap-3">
// //                   {/* stars */}
// //                   <div className="flex">
// //                     {Array.from({
// //                       length: Math.max(1, Math.min(5, Number(t.rating) || 5)),
// //                     }).map((_, i) => (
// //                       <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-white fill-white" />
// //                     ))}
// //                   </div>

// //                   {/* text */}
// //                   <p className="text-white/90 text-[13px] sm:text-[15px] leading-relaxed break-words">
// //                     "{t.experience}"
// //                   </p>

// //                   {/* user */}
// //                   <div className="flex items-center gap-3">
// //                     <img
// //                       src={t.avatar || svgInitialsAvatar(t.name || "User")}
// //                       alt={t.name || "User"}
// //                       className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
// //                     />
// //                     <div className="min-w-0">
// //                       <div className="font-semibold text-white text-sm sm:text-base truncate">
// //                         {t.name || "Anonymous"}
// //                       </div>
// //                       <div className="text-xs sm:text-sm text-white/60 break-words">
// //                         {[t.role, t.org].filter(Boolean).join(" • ")}
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             );
// //           })()}
// //         </motion.div>
// //       </AnimatePresence>
// //     </div>

// //     {/* RIGHT BUTTON */}
// //     <button
// //       onClick={nextSlide}
// //       className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white text-white transition-all shrink-0"
// //     >
// //       <MdKeyboardArrowDown size={20} className="-rotate-90 sm:text-[22px]" />
// //     </button>
// //   </div>
// // )}
// // </div>



// //         {showFooter && <Footer />}

// //         {/* Floating Action Button */}
// //         {/* Floating Action Button */}
// // {/* Floating Action Button */}
// // {/* Floating Action Button */}
// // {/* Floating Action Button */}
// // <div className="fixed bottom-24 right-8 z-50">
// //   <Button
// //     onClick={() =>
// //       variant === "marketing" ? go(routes.login) : go(routes.dashboard)
// //     }
// //     className="w-16 h-16 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 p-0"
// //     style={{
// //       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
// //       boxShadow: "0 0 40px rgba(26,115,232,0.35)",
// //     }}
// //   >
// //     <FiArrowRight
// //       className="text-white"
// //       style={{
// //         width: 38,
// //         height: 38,
// //         strokeWidth: 1.8,
// //       }}
// //     />
// //   </Button>
// // </div>
// //       </div>

// //       {/* ===== Feedback vertical pill (50x130) =====
// //           Placed above the Smartgen/Marketplace CTAs and sticks to the laptop screen's right edge */}
// //       {fbPos && (
// //     <button
// //   type="button"
// //   onClick={() => setFeedbackOpen(true)}   // 👈 open modal
// //   aria-label="Give feedback"
// //   className="absolute z-50 text-white font-semibold"
// // style={{
// //   position: 'fixed',           // 👈 add this
// //   width: 50,
// //   height: 130,
// //   opacity: 1,
// //   top: fbPos.top,
// //   left: fbPos.left,
// //   borderTopLeftRadius: 16,
// //   borderBottomLeftRadius: 16,
// //   borderTopRightRadius: 0,
// //   borderBottomRightRadius: 0,
// //   background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
// //   boxShadow: "0 0 28px rgba(26,115,232,0.25)",
// //   writingMode: "vertical-rl",
// //   textOrientation: "mixed",
// //   display: "flex",
// //   alignItems: "center",
// //   justifyContent: "center",
// //   letterSpacing: 1,
// // }}

// // >
// //   <span
// //     className="inline-flex items-center select-none"
// //     style={{
// //       transform: "rotate(180deg)", // bottom → top
// //       gap: 6,
// //       lineHeight: 1,
// //       fontFamily: "Inter, ui-sans-serif, system-ui",
// //       fontWeight: 400,
// //       fontStyle: "normal",
// //       fontSize: 16,
// //       color: "#fff",
// //       textAlign: "center",
// //     }}
// //   >
// //     <MessageCircleHeart
// //       aria-hidden
// //       style={{ width: 22, height: 22, transform: "rotate(180deg)" }} // keep icon upright
// //     />
// //     <span>Feedback</span>
// //   </span>
// // </button>


// //       )}

// //       {feedbackOpen && (
// //   <div role="dialog" aria-modal="true" className="fixed inset-0 z-[999] grid place-items-center">
// //     {/* Backdrop */}
// //     <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setFeedbackOpen(false)} />

// //     {/* Card: smaller + capped height + Inter Regular for everything */}
// //  <div
// //   className="relative rounded-2xl text-white shadow-2xl"
// //   style={{
// //     background: "#17171A", // ← was "#131313"
// //     width: "min(92vw, 520px)",
// //     maxHeight: "85vh",
// //     fontFamily: "Inter",
// //     fontWeight: 400,
// //     fontStyle: "normal",
// //   }}
// // >

// //       {/* Close */}
// //       <button
// //         aria-label="Close"
// //         onClick={() => setFeedbackOpen(false)}
// //         className="absolute right-2 top-2 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8"
// //       >
// //         <X className="w-4 h-4 text-white/90" />
// //       </button>

// //       {/* Scrollable content (scrollbar hidden) */}
// //       <div
// //         className="no-scrollbar overflow-y-auto px-5 md:px-6 py-6 md:py-7"
// //         style={{ maxHeight: "85vh" }}
// //       >
// //         {/* Title (regular weight) */}
// //         <h3 className="text-center text-[20px] md:text-[22px]" style={{ fontWeight: 400 }}>
// //           We Value Your Feedback
// //         </h3>
// //         <p className="text-center text-white/70 mt-2 leading-snug text-sm">
// //           Your feedback is important to us We take
// //           <br />
// //           it very seriously.
// //         </p>

// //         {/* Stars */}
// //         <div className="mt-5">
// //           <div className="flex items-center justify-center gap-4">
// //             {Array.from({ length: 5 }).map((_, i) => {
// //               const idx = i + 1;
// //               const active = (hoverRating || rating) >= idx;
// //               return (
// //                 <button
// //                   key={idx}
// //                   type="button"
// //                   onMouseEnter={() => setHoverRating(idx)}
// //                   onMouseLeave={() => setHoverRating(0)}
// //                   onClick={() => setRating(idx)}
// //                   className="p-1"
// //                   aria-label={`Rate ${idx} star${idx > 1 ? "s" : ""}`}
// //                   style={{ fontFamily: "Inter", fontWeight: 400 }}
// //                 >
// //                   <Star
// //                     className="w-6 h-6"
// //                     style={{
// //                       color: active ? "#FFFFFF" : "rgba(255,255,255,0.5)",
// //                       fill: active ? "#FFFFFF" : "transparent",
// //                     }}
// //                   />
// //                 </button>
// //               );
// //             })}
// //           </div>
// //           <div className="flex justify-between text-[11px] text-white/70 w-[240px] mx-auto mt-2">
// //             <span>Very bad</span>
// //             <span>Very Good</span>
// //           </div>
// //         </div>

// //         {/* Write your experience */}
// //         <div className="mt-6">
// //           <label className="block mb-2 text-white/90 text-sm">Write your experience</label>
// //           <div className="relative">
// //           <textarea
// //   value={fbForm.experience}
// //   onChange={(e) =>
// //     setFbForm((p) => ({ ...p, experience: e.target.value.slice(0, MAX_CHARS) }))
// //   }
// //   rows={4}
// //   className="w-full resize-none rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
// //   placeholder="Share your thoughts..."
// //   style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
// //   required
// // />

// //             <div className="absolute right-3 bottom-2 text-xs text-white/60">
// //               {fbForm.experience.length}/{MAX_CHARS}
// //             </div>
// //           </div>
// //         </div>

// //         {/* Name */}
// //         <div className="mt-5">
// //           <label className="block mb-2 text-white/90 text-sm">Your Name</label>
// //        <input
// //   value={fbForm.name}
// //   onChange={(e) => setFbForm((p) => ({ ...p, name: e.target.value }))}
// //   className="w-full rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
// //   placeholder="Your full name"
// //   style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
// //   required
// // />

// //         </div>

// //         {/* Role */}
// //         <div className="mt-5">
// //           <label className="block mb-2 text-white/90 text-sm">Your Role / Designation</label>
// //           <input
// //             value={fbForm.role}
// //             onChange={(e) => setFbForm((p) => ({ ...p, role: e.target.value }))}
// //             className="w-full rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
// //             placeholder="e.g., Assistant Manager"
// //             style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
// //           />
// //         </div>

// //         {/* Organization */}
// //         <div className="mt-5">
// //           <label className="block mb-2 text-white/90 text-sm">Organization / Company</label>
// //           <input
// //             value={fbForm.org}
// //             onChange={(e) => setFbForm((p) => ({ ...p, org: e.target.value }))}
// //             className="w-full rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
// //             placeholder="Company name"
// //             style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
// //           />
// //         </div>

// //         {/* File upload */}
// //         <div className="mt-5">
// //           <label className="block mb-2 text-white/90 text-sm">Profile Picture</label>
// //           <div className="flex items-center gap-3">
// //             <label
// //               className="cursor-pointer inline-flex items-center rounded-md px-4 py-2 text-sm text-white"
// //               style={{
// //                 background: "linear-gradient(270deg, #FF14EF 0%, #1A73E8 100%)",
// //                 fontFamily: "Inter",
// //                 fontWeight: 400,
// //                 fontStyle: "normal",
// //               }}
// //             >
// //               Choose file
// //               <input
// //                 type="file"
// //                 accept="image/*"
// //                 className="hidden"
// //                 onChange={(e) => setFbForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
// //               />
// //             </label>
// //             <div className="flex-1 truncate rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white/70"
// //                  style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}>
// //               {fbForm.file ? fbForm.file.name : "No file chosen"}
// //             </div>
// //           </div>
// //         </div>

// //         {/* Actions — right aligned; Clear sits directly left of Submit */}
// //         <div className="mt-6 flex items-center justify-end gap-3">
// //         <button
// //   type="button"
// //   onClick={handleClear}
// //   className="text-white/90 hover:text-white transition"
// //   style={{
// //     width: 100,
// //     height: 49,
// //     opacity: 1,
// //     borderRadius: 6,
// //     border: "1px solid #FFFFFF",
// //     display: "inline-flex",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     background: "transparent",
// //     fontFamily: "Inter",
// //     fontWeight: 400,
// //     fontStyle: "normal",
// //   }}
// // >
// //   Clear
// // </button>


// //          <button
// //   type="button"
// //   onClick={handleSubmitFeedback}
// //   className="text-white" // removed rounded-xl/px/py to avoid conflicts
// //   style={{
// //     width: 162,
// //     height: 49,
// //     opacity: 1,
// //     borderRadius: 6,
// //     padding: 15,
// //     gap: 10,
// //     display: "inline-flex",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     background: "linear-gradient(270deg, #FF14EF 0%, #1A73E8 100%)",
// //     fontFamily: "Inter",
// //     fontWeight: 400,
// //     fontStyle: "normal",
// //   }}
// // >
// //   Submit Feedback
// // </button>

// //         </div>
// //       </div>
// //     </div>
// //   </div>
// // )}




// // {thankOpen && (
// //   <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] grid place-items-center">
// //     {/* Backdrop */}
// //     <div
// //       className="absolute inset-0 bg-black/70 backdrop-blur-sm"
// //       onClick={() => setThankOpen(false)}
// //     />

// //     {/* Card */}
// //     <div
// //       className="relative rounded-2xl text-white shadow-2xl px-6 py-7"
// //       style={{
// //         background: "#17171A",
// //         width: "min(92vw, 500px)",
// //         border: "1px solid #333335",
// //       }}
// //     >
// //       {/* Close */}
// //       <button
// //         aria-label="Close"
// //         onClick={() => setThankOpen(false)}
// //         className="absolute right-2 top-2 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8"
// //       >
// //         <X className="w-4 h-4 text-white/90" />
// //       </button>

// //       {/* Green check icon */}
// //       <div className="grid place-items-center mb-4">
// //         <div
// //           className="grid place-items-center h-14 w-14 rounded-full"
// //           style={{ background: "rgba(16,185,129,0.18)" }}  /* dark green ring */
// //         >
// //           <div
// //             className="grid place-items-center h-10 w-10 rounded-full"
// //             style={{ background: "#16A34A" }}  /* green */
// //           >
// //             <Check className="w-6 h-6 text-black" />
// //           </div>
// //         </div>
// //       </div>

// //       {/* Text */}
// //       <h3 className="text-center text-[18px] md:text-[20px] font-medium">
// //         Thank you for your feedback!
// //       </h3>
// //       <p className="text-center text-white/70 mt-2 text-sm">
// //         We appreciate your feedback and will review it shortly.
// //       </p>

// //       {/* Actions */}
// //       <div className="mt-6 flex items-center justify-center gap-3">
// //         <button
// //           type="button"
// //           onClick={() => setThankOpen(false)}
// //           className="text-white/90 hover:text-white transition"
// //           style={{
// //             width: 110,
// //             height: 44,
// //             borderRadius: 6,
// //             border: "1px solid #FFFFFF",
// //             background: "transparent",
// //           }}
// //         >
// //           Cancel
// //         </button>

// //         <button
// //           type="button"
// //           onClick={() => {
// //             setThankOpen(false);
// //             handleClear();         // fresh form
// //             setFeedbackOpen(true); // reopen the form
// //           }}
// //           className="text-white"
// //           style={{
// //             width: 160,
// //             height: 44,
// //             borderRadius: 6,
// //             background: "#333335",
// //           }}
// //         >
// //           Submit Another
// //         </button>
// //       </div>
// //     </div>
// //   </div>
// // )}


// // <style>{`
// //   .steam-btn {
// //     position: relative;
// //     isolation: isolate;
// //     overflow: visible;
// //   }

// //   .steam-btn::before,
// //   .steam-btn::after {
// //     content: "";
// //     position: absolute;
// //     inset: -2px;
// //     border-radius: inherit;
// //     background: linear-gradient(
// //       45deg,
// //       #fb0094,
// //       #0000ff,
// //       #00ff00,
// //       #ffff00,
// //       #ff0000,
// //       #fb0094,
// //       #0000ff,
// //       #00ff00,
// //       #ffff00,
// //       #ff0000
// //     );
// //     background-size: 400%;
// //     z-index: -2;
// //     animation: steam 20s linear infinite;
// //   }

// //   .steam-btn::after {
// //     z-index: -3;
// //     filter: blur(22px);
// //     opacity: 0.95;
// //   }

// //   .steam-btn-inner {
// //     position: relative;
// //     z-index: 1;
// //     border-radius: inherit;
// //     width: 100%;
// //     height: 100%;
// //     display: inline-flex;
// //     align-items: center;
// //     justify-content: center;
// //   }

// //   @keyframes steam {
// //     0% { background-position: 0 0; }
// //     50% { background-position: 400% 0; }
// //     100% { background-position: 0 0; }
// //   }
// // `}


// // {`
// //   @keyframes scan {
// //     0%   { top: 0%;   opacity: 0; }
// //     5%   { opacity: 1; }
// //     95%  { opacity: 1; }
// //     100% { top: 100%; opacity: 0; }
// //   }
// //   @keyframes pulse-ring {
// //     0%, 100% { transform: scale(1);    opacity: .6; }
// //     50%       { transform: scale(1.07); opacity: 1; }
// //   }
// // `}



// // </style>

// //     </motion.section>
// //   );
// // }





// import { useState, useEffect, useMemo } from "react";
// import { useRef } from "react";

// import { useNavigate } from "react-router-dom";
// import {  AnimatePresence } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { ArrowRight, Sparkles, Zap, TrendingUp, Star, Sparkle, Mouse, MoveDown } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
// import { motion, animate, useMotionValue, useMotionTemplate } from "framer-motion";
// import Footer from "@/components/Footer";
// import SubscriptionModal from "@/components/SubscriptionModal";
// import { Settings, ChevronDown } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import { MessageCircleHeart, X } from "lucide-react";
// import { GlobeSection, FAQSection , TickerSection } from "@/components/GlobeAndFAQ_components";
// // top of file (with other lucide-react imports)
// import { Check  } from "lucide-react";
// import { LuBadgeCheck } from "react-icons/lu";
// import { FaArrowRight } from "react-icons/fa";
// import { FiArrowRight } from "react-icons/fi";
// import AccountMenu from "@/components/AccountMenu";
// const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

// /* --- tiny helper: star with true gradient color using CSS mask --- */
// function MaskedStar({ size = 14 }: { size?: number }) {
//   const starMask = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896 4.665 23.165l1.401-8.168L.132 9.21l8.2-1.192z'/%3E%3C/svg%3E")`;
//   const common: React.CSSProperties = {
//     display: "inline-block",
//     width: size,
//     height: size,
//     backgroundImage: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//     WebkitMaskImage: starMask,
//     maskImage: starMask,
//     WebkitMaskRepeat: "no-repeat",
//     maskRepeat: "no-repeat",
//     WebkitMaskPosition: "center",
//     maskPosition: "center",
//     WebkitMaskSize: "contain",
//     maskSize: "contain",
//   };
//   return <span style={common} aria-hidden="true" />;
// }

// /* --- reusable badge button --- */
// function GradientBadge({
//   label = "Trusted by industry leaders",
//   showIcon = true,
// }: {
//   label?: string;
//   showIcon?: boolean;
// }) {
//   return (
//     <button
//       type="button"
//       className="inline-flex items-center rounded-full"
//       style={{
//         background: "#252525",
//         border: "1px solid #333335",
//         padding: "10px 14px",
//         gap: showIcon ? 8 : 0,
//       }}
//     >
//       {showIcon ? <MaskedStar size={16} /> : null}
//       <span
//         className="bg-clip-text text-transparent"
//         style={{
//           backgroundImage: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//           fontFamily: "Inter, ui-sans-serif, system-ui",
//           fontWeight: 500,
//           fontSize: 16,
//           lineHeight: "100%",
//         }}
//       >
//         {label}
//       </span>
//     </button>
//   );
// }

// type LandingProps = {
//   variant?: "marketing" | "app";
//   userFullName?: string;
//   routes?: {
//     login?: string;
//     signup?: string;
//     app?: string;
//     promptLibrary?: string;
//     smartgen?: string;
//     marketplace?: string;
//     dashboard?: string;
//     profile?: string;
//   };
//   showFooter?: boolean;
// };

// export default function Landing({
//   variant = "marketing",
//   userFullName,
//   routes = {
//   login: "/login",
//   signup: "/signup",
//   app: "/app",
//   promptLibrary: "/prompt-library",
//   smartgen: "/smartgen",
//   marketplace: "/prompt-marketplace",
//   dashboard: "/app",
//   profile: "/profile",
// },
//   showFooter = true,
// }: LandingProps) {
//   const navigate = useNavigate();
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [showTopBg, setShowTopBg] = useState(true);

//   const color = useMotionValue(COLORS_TOP[0]);
//   useEffect(() => {
//     animate(color, COLORS_TOP, {
//       ease: "easeInOut",
//       duration: 10,
//       repeat: Infinity,
//       repeatType: "mirror",
//     });
//   }, [color]);

//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePosition({
//         x: (e.clientX / window.innerWidth) * 2 - 1,
//         y: (e.clientY / window.innerHeight) * 2 - 1,
//       });
//     };
//     window.addEventListener("mousemove", handleMouseMove);
//     return () => window.removeEventListener("mousemove", handleMouseMove);
//   }, []);
//   useEffect(() => {
//     let ticking = false;

//     const updateTopBgVisibility = () => {
//       const bgEnd = document.getElementById("top-bg-end");

//       if (!bgEnd) {
//         setShowTopBg(true);
//         return;
//       }

//       const rect = bgEnd.getBoundingClientRect();

//       // Static image background visible until the What We Offer heading area.
//       // After that, the lower sections stay clean dark.
//       setShowTopBg(rect.bottom > 96);
//     };

//     const onScrollOrResize = () => {
//       if (ticking) return;

//       ticking = true;
//       window.requestAnimationFrame(() => {
//         updateTopBgVisibility();
//         ticking = false;
//       });
//     };

//     updateTopBgVisibility();
//     window.addEventListener("scroll", onScrollOrResize, { passive: true });
//     window.addEventListener("resize", onScrollOrResize);

//     return () => {
//       window.removeEventListener("scroll", onScrollOrResize);
//       window.removeEventListener("resize", onScrollOrResize);
//     };
//   }, []);

//   const border = useMotionTemplate`1px solid ${color}`;
//   const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;
//   const go = (path?: string) => path && navigate(path);
// const handleGetStarted = () => {
//   if (isAuthenticated) {
//     go(routes.dashboard);
//   } else {
//     go(routes.signup || "/signup");
//   }
// };
//   // Steps
//   const [activeStep, setActiveStep] = useState(0);
//   const [hoveredStep, setHoveredStep] = useState<number | null>(null);
//  const [activeOffer, setActiveOffer] = useState<number | null>(null);
  

// // State add karo (existing states ke saath)
// const [activeOfferIdx, setActiveOfferIdx] = useState<number | null>(null);
// const [offerPhase,     setOfferPhase]     = useState<"grid" | "split">("grid");
// const [offerBusy,      setOfferBusy]      = useState(false);

// const openSplit = (idx: number) => {
//   if (offerBusy) return;
//   setOfferBusy(true);
//   setTimeout(() => {
//     setActiveOfferIdx(idx);
//     setOfferPhase("split");
//     setOfferBusy(false);
//   }, 215);
// };
// const closeSplit = () => {
//   if (offerBusy) return;
//   setOfferBusy(true);
//   setTimeout(() => {
//     setOfferPhase("grid");
//     setActiveOfferIdx(null);
//     setOfferBusy(false);
//   }, 200);
// };


 

//   // const [current, setCurrent] = useState(0);
//   const [activeButton, setActiveButton] = useState<"left" | "right" | null>(null);
//   const { isAuthenticated } = useAuth();

//   const { user, logout } = useAuth();
//   const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
//   const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

//   const displayName = useMemo(() => user?.name?.trim() || "", [user]);
//   const displayEmail = useMemo(() => user?.email || "", [user]);
//   const fullName = useMemo(() => {
//     if (displayName) return displayName;
//     if (displayEmail) return displayEmail.split("@")[0];
//     return "User";
//   }, [displayName, displayEmail]);

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   const themeBtn = (id: "light" | "dark" | "system", src: string, alt: string) => (
//     <button
//       type="button"
//       onClick={() => setTheme(id)}
//       className="inline-flex items-center justify-center rounded-full"
//       style={{
//         width: 28,
//         height: 28,
//         outline: theme === id ? "2px solid rgba(255,255,255,0.9)" : "none",
//       }}
//       aria-pressed={theme === id}
//       aria-label={alt}
//       title={alt}
//     >
//       <img src={src} alt="" className="w-4 h-4" />
//     </button>
//   );

// const PlanStyledName = ({ user, fullName }: { user: any; fullName: string }) => {
//   if (user?.plan === "pro") {
//     return (
//       <div className="flex items-center gap-2">
//         <span className="truncate font-semibold bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] text-transparent bg-clip-text">
//           Hello, {fullName}
//         </span>
//         <LuBadgeCheck
//           className="w-[22px] h-[22px]"
//           style={{ stroke: "url(#proGradient)", strokeWidth: 2 }}
//         />
//         <svg width="0" height="0">
//           <defs>
//             <linearGradient id="proGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//               <stop offset="0%" stopColor="#FF14EF" />
//               <stop offset="100%" stopColor="#1A73E8" />
//             </linearGradient>
//           </defs>
//         </svg>
//       </div>
//     );
//   }

//   if (user?.plan === "enterprise") {
//     return (
//       <div className="flex items-center gap-2">
//         <span className="truncate font-semibold bg-gradient-to-r from-[#FACC15] to-[#CA8A04] text-transparent bg-clip-text">
//           Hello, {fullName}
//         </span>
//         <LuBadgeCheck
//           className="w-[22px] h-[22px]"
//           style={{ stroke: "url(#enterpriseGradient)", strokeWidth: 2 }}
//         />
//         <svg width="0" height="0">
//           <defs>
//             <linearGradient id="enterpriseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//               <stop offset="0%" stopColor="#FACC15" />
//               <stop offset="100%" stopColor="#CA8A04" />
//             </linearGradient>
//           </defs>
//         </svg>
//       </div>
//     );
//   }

//   return (
//     <div className="flex items-center gap-2">
//       <span className="truncate font-semibold text-white">
//         Hello, {fullName}
//       </span>
//       <span className="px-2 py-0.5 text-xs rounded-md bg-gray-700 text-gray-300">
//         FREE
//       </span>
//     </div>
//   );
// };



//   /* ===== Feedback button placement logic =====
//      Goal: place a 50x130 vertical pill above the Smartgen/Marketplace CTAs,
//      and horizontally stick it to the right edge of the laptop screen. */
//   const [fbPos, setFbPos] = useState<{ top: number; left: number } | null>(null);

//     useEffect(() => {
//   const PILL_W = 50;             // feedback pill width
//   const PILL_H = 130;            // feedback pill height
//   const SAFE = 12;               // margin from edges
//   const BASE_WRAP_W = 1400;      // your max container width
//   const DESKTOP_OFFSET = 400;    // your desired desktop offset to the right of the screen

//   const calc = () => {
//     const screen = document.getElementById("product-screen-mask");
//     const ctas = document.getElementById("hero-ctas");
//     const section = document.getElementById("landing-root");
//     const wrap = document.getElementById("product-demo-wrap");
//     if (!screen || !ctas || !section) return;

//     const s = screen.getBoundingClientRect();
//     const c = ctas.getBoundingClientRect();
//     const root = section.getBoundingClientRect();
//     const wrapRect = wrap?.getBoundingClientRect();

//     // Scale the desktop offset with the actual wrapper width
//     const wrapWidth = wrapRect?.width ?? BASE_WRAP_W;
//     const scale = wrapWidth / BASE_WRAP_W;

//     const isMobile = window.innerWidth < 640;
//     // On mobile, keep it tight near the screen; on desktop, use your scaled 245px
//     const offset = isMobile ? 8 : Math.round(DESKTOP_OFFSET * scale);

//     // Compute left so the pill's RIGHT edge sits offset beyond the laptop screen's RIGHT edge
//     let left = Math.round((s.right - root.left) + offset - PILL_W);

//     // Clamp within the visible section to avoid disappearing off-screen
//     const maxLeft = root.width - PILL_W - SAFE;
//     const minLeft = SAFE;
//     left = Math.max(minLeft, Math.min(left, maxLeft));

//     // Place ABOVE CTAs: (top of CTAs) - (pill height) - gap
//     let top = Math.round((c.top - root.top) - PILL_H - 12);
//     const minTop = SAFE;
//     const maxTop = root.height - PILL_H - SAFE;
//     top = Math.max(minTop, Math.min(top, maxTop));

//     setFbPos({ top, left });
//   };

//   calc();
//   // Recompute on resize/scroll
//   window.addEventListener("resize", calc);
//   window.addEventListener("scroll", calc, { passive: true });

//   // Recompute when the product demo wrapper resizes (e.g., container width changes)
//   let ro: ResizeObserver | undefined;
//   const wrapEl = document.getElementById("product-demo-wrap");
//   if (wrapEl && "ResizeObserver" in window) {
//     ro = new ResizeObserver(calc);
//     ro.observe(wrapEl);
//   }

//   return () => {
//     window.removeEventListener("resize", calc);
//     window.removeEventListener("scroll", calc as any);
//     ro?.disconnect();
//   };
// }, []);




// const [feedbackOpen, setFeedbackOpen] = useState(false);
// const [rating, setRating] = useState<number>(0);
// const [hoverRating, setHoverRating] = useState<number>(0);

// const [fbForm, setFbForm] = useState<{
//   experience: string;
//   name: string;
//   role: string;
//   org: string;
//   file?: File | null;
// }>({
//   experience: "",
//   name: "",
//   role: "",
//   org: "",
//   file: null,
// });

// const MAX_CHARS = 500;

// // Esc to close
// useEffect(() => {
//   if (!feedbackOpen) return;
//   const onKey = (e: KeyboardEvent) => (e.key === "Escape" ? setFeedbackOpen(false) : null);
//   window.addEventListener("keydown", onKey);
//   return () => window.removeEventListener("keydown", onKey);
// }, [feedbackOpen]);

// const handleClear = () => {
//   setRating(0);
//   setHoverRating(0);
//   setFbForm({ experience: "", name: "", role: "", org: "", file: null });
// };

// const handleSubmitFeedback = async () => {
//   try {
//     const formData = new FormData();
//     formData.append("experience", fbForm.experience);
//     formData.append("name", fbForm.name);
//     formData.append("role", fbForm.role);
//     formData.append("orgOrCompany", fbForm.org);
//     formData.append("rating", String(rating));
//     if (fbForm.file) formData.append("profilePicture", fbForm.file);

//     const res = await fetch(`${API_BASE}/api/feedback`, {
//       method: "POST",
//       body: formData,
//     });

//     const data = await res.json();
//     console.log("[FEEDBACK SUBMIT RESPONSE]", data);

//     if (data.success) {
//       // Add new feedback to list
//       setFeedbacks((prev) => [data.feedback, ...prev]);
//       setFeedbackOpen(false);
//       handleClear();
//       setThankOpen(true);
//     } else {
//       alert("Failed to submit feedback: " + (data.error || "Unknown error"));
//     }
//   } catch (err) {
//     console.error("Submit feedback error:", err);
//   }
// };





// // near your other feedback state
// const [thankOpen, setThankOpen] = useState(false);
// // testimonials now come from saved feedbacks
// const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);


// useEffect(() => {
//   const fetchFeedbacks = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/api/feedback`);
//       const data = await res.json();
//       console.log("[FEEDBACK FETCH RESPONSE]", data);

//       if (data.success) {
//         setFeedbacks(data.feedbacks);
//       }
//     } catch (err) {
//       console.error("Fetch feedback error:", err);
//     }
//   };

//   fetchFeedbacks();
// }, []);


// // === Feedback types + storage helpers + avatar utils ===
// type Feedback = {
//   id: string;
//   when: number;
//   name: string;
//   role: string;
//   org: string;
//   rating: number;
//   experience: string;
//   avatar?: string; // data URL
// };

// const FB_KEY = "tokun_feedbacks";
// const MAX_FEEDBACKS = 100;
// const MAX_BYTES = 4_500_000; // ~4.5MB guard

// function loadFeedbacks(): Feedback[] {
//   try {
//     const raw = localStorage.getItem(FB_KEY);
//     return raw ? (JSON.parse(raw) as Feedback[]) : [];
//   } catch {
//     return [];
//   }
// }

// function saveFeedbacksSafe(list: Feedback[]) {
//   // keep last N & prune until size fits
//   const pruned = list.slice(-MAX_FEEDBACKS);
//   let json = JSON.stringify(pruned);
//   while (json.length > MAX_BYTES && pruned.length) {
//     pruned.shift();
//     json = JSON.stringify(pruned);
//   }
//   try {
//     localStorage.setItem(FB_KEY, json);
//   } catch (e) {
//     console.warn("localStorage save failed:", e);
//   }
// }

// async function fileToAvatarDataUrl(file: File, size = 64, quality = 0.72): Promise<string> {
//   const dataUrl = await new Promise<string>((res, rej) => {
//     const r = new FileReader();
//     r.onload = () => res(r.result as string);
//     r.onerror = rej;
//     r.readAsDataURL(file);
//   });

//   const img = await new Promise<HTMLImageElement>((res, rej) => {
//     const i = new Image();
//     i.onload = () => res(i);
//     i.onerror = rej;
//     i.src = dataUrl;
//   });

//   const canvas = document.createElement("canvas");
//   canvas.width = canvas.height = size;
//   const ctx = canvas.getContext("2d")!;
//   const minSide = Math.min(img.width, img.height);
//   const sx = (img.width - minSide) / 2;
//   const sy = (img.height - minSide) / 2;
//   ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
//   return canvas.toDataURL("image/jpeg", quality);
// }

// function initialsFrom(name: string) {
//   const parts = (name || "User").trim().split(/\s+/);
//   return (parts[0]?.[0] || "U") + (parts[1]?.[0] || "");
// }
// function colorFor(name: string) {
//   let h = 0;
//   for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
//   return `hsl(${h},70%,45%)`;
// }
// function svgInitialsAvatar(name: string, size = 64) {
//   const initials = initialsFrom(name).toUpperCase();
//   const bg = colorFor(name);
//   const svg =
//     `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
//     `<rect width='100%' height='100%' rx='${size / 2}' fill='${bg}'/>` +
//     `<text x='50%' y='54%' font-family='Inter,system-ui,sans-serif' font-size='${size * 0.42}' text-anchor='middle' fill='white' dy='.1em'>${initials}</text>` +
//     `</svg>`;
//   return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
// }


// const [current, setCurrent] = useState(0);

// const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";


// const FEATURE_PREVIEWS = [
//   {
//     icon: Zap,
//     title: "Prompt Optimization",
//     description:
//       "Reduce token usage by up to 60% while maintaining meaning and effectiveness across all LLM platforms.",
//     onClick: () => go(routes.smartgen),
//     mediaSrc: "/icons/srt.mp4",
//   },
//   {
//     icon: Sparkles,
//     title: "Smartgen Generator",
//     description:
//       "Transform simple ideas into powerful, optimized prompts with our AI-powered generation system.",
//     onClick: () => go(routes.smartgen),
//     mediaSrc: "/icons/srt.mp4",
//   },
//   {
//     icon: TrendingUp,
//     title: "Prompt Marketplace",
//     description:
//       "Built a great prompt? Trade it. Monetize your creativity and earn from your best prompt innovations.",
//     onClick: () => go(routes.marketplace),
//    mediaSrc: "/icons/srt.mp4",
//   },
//   {
//     icon: null,
//     image: "/icons/circle.png",
//     title: "Prompt Library",
//     description:
//       "Access categorized prompts for Coding, Design, Marketing, Video Creation, and more.",
//     onClick: () => go(routes.promptLibrary),
//     mediaSrc: "/icons/srt.mp4",
//   },
// ];


// const [previewIndex, setPreviewIndex] = useState<number | null>(null);
// const [previewPhase, setPreviewPhase] = useState<"idle" | "entering" | "open">("idle");
// const previewTimerRef = useRef<number | null>(null);

// const activeFeature =
//   previewIndex !== null ? FEATURE_PREVIEWS[previewIndex] : null;

// const openOfferPreview = (index: number) => {
//   if (previewPhase !== "idle") return;

//   if (previewTimerRef.current) {
//     window.clearTimeout(previewTimerRef.current);
//   }

//   setPreviewIndex(index);
//   setPreviewPhase("entering");

//   previewTimerRef.current = window.setTimeout(() => {
//     setPreviewPhase("open");
//   }, 520);
// };

// const closeOfferPreview = () => {
//   if (previewTimerRef.current) {
//     window.clearTimeout(previewTimerRef.current);
//     previewTimerRef.current = null;
//   }

//   setPreviewPhase("idle");
//   setPreviewIndex(null);
// };

// useEffect(() => {
//   return () => {
//     if (previewTimerRef.current) {
//       window.clearTimeout(previewTimerRef.current);
//     }
//   };
// }, []);


// const nextSlide = () => {
//   setCurrent((prev) => (prev + 1) % feedbacks.length);
// };

// const prevSlide = () => {
//   setCurrent((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);
// };

// // auto slide
// useEffect(() => {
//   if (feedbacks.length <= 1) return;

//   const interval = setInterval(() => {
//     nextSlide();
//   }, 4000);

//   return () => clearInterval(interval);
// }, [feedbacks]);




// const HOW_IT_WORKS_NUMBER_COLOR = "#252526";

// const HOW_IT_WORKS_STEPS = [
//   {
//     step: "Input Idea",
//     iconSrc: "/icons/Group 643.svg",
//     description: "Share your concept or requirement",
//   },
//   {
//     step: "SmartGen",
//     iconSrc: "/icons/Group 646.svg",
//     description: "AI generates optimized prompts",
//   },
//   {
//     step: "Optimize",
//     iconSrc: "/icons/wq.svg",
//     description: "Reduce tokens, improve quality",
//   },
//   {
//     step: "Save or Sale",
//     iconSrc: "/icons/Group 650.svg",
//     description: "Store in library or marketplace",
//   },
//   {
//     step: "Earn",
//     iconSrc: "/icons/Group.svg",
//     description: "Monetize your best prompts",
//   },
// ];


//   return (
//     <motion.section
//       id="landing-root"
//       style={{ backgroundColor: "#030406" }}
//     className="relative min-h-screen overflow-x-hidden text-gray-200 bg-[#030406]"
//     >
//       {/* Fixed top background: static while scrolling, hidden after What We Offer */}
//       <div
//         aria-hidden
//         className={`pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-300 ${
//           showTopBg ? "opacity-100" : "opacity-0"
//         }`}
//       >
//         <img
//           src="/icons/homeban.png"
//           alt="Tokun neon background"
//           className="select-none absolute -top-24 right-0 w-[72vw] max-w-none opacity-90 mix-blend-screen"
//         />

//         <div className="absolute left-1/2 top-24 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(191,44,255,0.22),rgba(0,0,0,0))] blur-3xl" />

//         <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(139,92,246,0.12),rgba(0,0,0,0))]" />
//       </div>

//       {/* HEADER */}
// <header className="relative z-20 w-full">
//   <div className="px-4 md:px-6 lg:px-8 py-4 lg:py-6">
//     <div className="container mx-auto flex items-center justify-between">

//       {/* Logo */}
//       <div className="flex items-center gap-2 sm:gap-3 min-w-0">
//         <img
//   src="/icons/Tokun.png"
//   alt="Tokun.world Logo"
//   className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain transition-transform duration-200 hover:scale-105"
// />
//       </div>

//       {/* Right Section */}
//       <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
//         {variant === "marketing" ? (
//           <>
//             <button
//               onClick={() => go(routes.login)}
//               className="hidden sm:block text-white/95 hover:text-white transition-colors"
//               style={{ fontSize: 14, fontWeight: 600 }}
//             >
//               Login
//             </button>
// <button
//   type="button"
//   onClick={handleGetStarted}
//   className="inline-flex items-center justify-center rounded-full hover:opacity-95 transition-opacity"
//   style={{
//     height: 40,
//     padding: "0 16px",
//     borderRadius: 200,
//     background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
//     color: "#FFFFFF",
//     fontFamily: "Inter, system-ui, Arial, sans-serif",
//     fontWeight: 600,
//     fontSize: 13,
//     lineHeight: "20px",
//     gap: 6,
//   }}
// >
//   <span>Get Started</span>
//   <span
//     aria-hidden
//     className="inline-flex items-center justify-center rounded-full bg-white"
//     style={{ width: 22, height: 22 }}
//   >
//     <MdKeyboardArrowRight size={14} color="black" />
//   </span>
// </button>
//           </>
//         ) : (
//           <DropdownMenu>
//             <AccountMenu />
//           </DropdownMenu>
//         )}
//       </div>
//     </div>
//   </div>
// </header>

//       {/* MAIN */}
// <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-0 sm:pt-2 pb-0">
//         {/* HERO */}
//         <div className="text-center space-y-5 mb-10 sm:mb-12">
//           {/* <div className="flex justify-center">
//             <GradientBadge label="Trusted by industry leaders" showIcon />
//           </div> */}

//           <div
//             className="transform transition-transform duration-300 ease-out"
//             style={{
//               transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`,
//             }}
//           >
//            <h1 className="text-6xl md:text-8xl font-bold mb-3 tracking-tight flex justify-center">
//   <span className="relative inline-flex items-center justify-center select-none">
//     {/* ambient glow behind full word */}
//     <motion.span
//       aria-hidden
//       className="absolute inset-0 blur-3xl"
//       style={{
//         background:
//           "radial-gradient(circle at 50% 50%, rgba(255,20,239,0.28) 0%, rgba(26,115,232,0.22) 38%, rgba(0,0,0,0) 72%)",
//       }}
//       animate={{
//         opacity: [0.35, 0.7, 0.35],
//         scale: [0.96, 1.04, 0.96],
//       }}
//       transition={{
//         duration: 4.5,
//         repeat: Infinity,
//         ease: "easeInOut",
//       }}
//     />

//     {/* whole word breathing */}
//     <motion.span
//       className="relative inline-flex items-center"
//       animate={{
//         y: [0, -2, 0],
//         scale: [1, 1.01, 1],
//       }}
//       transition={{
//         duration: 4,
//         repeat: Infinity,
//         ease: "easeInOut",
//       }}
//     >
//       {/* T */}
//       <motion.span
//         className="relative inline-block bg-clip-text text-transparent"
//         style={{
//           backgroundImage:
//             "linear-gradient(180deg, #ffffff 0%, #dbe8ff 38%, #7dd3fc 72%, #ffffff 100%)",
//           WebkitBackgroundClip: "text",
//           backgroundClip: "text",
//           textShadow: "0 0 18px rgba(125,211,252,0.18)",
//         }}
//         animate={{
//           opacity: [1, 0.92, 1],
//           filter: [
//             "drop-shadow(0 0 4px rgba(125,211,252,0.14))",
//             "drop-shadow(0 0 10px rgba(26,115,232,0.18))",
//             "drop-shadow(0 0 4px rgba(125,211,252,0.14))",
//           ],
//         }}
//         transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
//       >
//         T
//       </motion.span>

//       {/* O */}
//       <motion.span
//         className="relative inline-block bg-clip-text text-transparent"
//         style={{
//           backgroundImage:
//             "linear-gradient(180deg, #ffffff 0%, #e8dcff 34%, #c084fc 68%, #ffffff 100%)",
//           WebkitBackgroundClip: "text",
//           backgroundClip: "text",
//         }}
//         animate={{
//           opacity: [0.95, 1, 0.95],
//           rotateZ: [0, 0.2, 0],
//         }}
//         transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
//       >
//         O
//       </motion.span>

//       {/* K */}
//       <motion.span
//         className="relative inline-block bg-clip-text text-transparent"
//         style={{
//           backgroundImage:
//             "linear-gradient(180deg, #ffffff 0%, #d9dbff 30%, #60a5fa 65%, #ffffff 100%)",
//           WebkitBackgroundClip: "text",
//           backgroundClip: "text",
//         }}
//         animate={{
//           opacity: [1, 0.94, 1],
//         }}
//         transition={{ duration: 2.9, repeat: Infinity, ease: "easeInOut" }}
//       >
//         K
//       </motion.span>

//       {/* U special AI core */}
//       <span className="relative inline-flex items-center justify-center mx-[4px]">
//         {/* outer ring */}
//         <motion.span
//           className="absolute rounded-full"
//           style={{
//             width: "1.12em",
//             height: "1.12em",
//             border: "1px solid rgba(125,211,252,0.42)",
//             boxShadow:
//               "0 0 16px rgba(26,115,232,0.25), inset 0 0 12px rgba(255,20,239,0.16)",
//           }}
//           animate={{
//             scale: [0.88, 1.16, 0.88],
//             opacity: [0.35, 0.9, 0.35],
//           }}
//           transition={{
//             duration: 2.4,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />

//         {/* inner ring */}
//         <motion.span
//           className="absolute rounded-full"
//           style={{
//             width: "0.78em",
//             height: "0.78em",
//             border: "1px solid rgba(255,20,239,0.35)",
//           }}
//           animate={{
//             scale: [1.15, 0.92, 1.15],
//             opacity: [0.15, 0.55, 0.15],
//           }}
//           transition={{
//             duration: 2,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />

//         {/* orbit dot pink */}
//         <motion.span
//           className="absolute rounded-full"
//           style={{
//             width: 7,
//             height: 7,
//             background: "#FF14EF",
//             boxShadow: "0 0 14px rgba(255,20,239,0.9)",
//             top: "50%",
//             left: "50%",
//             marginLeft: -3.5,
//             marginTop: -3.5,
//           }}
//           animate={{
//             x: [0, 16, 0, -16, 0],
//             y: [-18, 0, 18, 0, -18],
//             scale: [0.9, 1.1, 0.9, 1.1, 0.9],
//           }}
//           transition={{
//             duration: 4.2,
//             repeat: Infinity,
//             ease: "linear",
//           }}
//         />

//         {/* orbit dot blue */}
//         <motion.span
//           className="absolute rounded-full"
//           style={{
//             width: 6,
//             height: 6,
//             background: "#1A73E8",
//             boxShadow: "0 0 14px rgba(26,115,232,0.95)",
//             top: "50%",
//             left: "50%",
//             marginLeft: -3,
//             marginTop: -3,
//           }}
//           animate={{
//             x: [0, -14, 0, 14, 0],
//             y: [16, 0, -16, 0, 16],
//             scale: [1.05, 0.85, 1.05, 0.85, 1.05],
//           }}
//           transition={{
//             duration: 3.6,
//             repeat: Infinity,
//             ease: "linear",
//           }}
//         />

//         {/* U letter */}
//         <motion.span
//           className="relative inline-block bg-clip-text text-transparent"
//           style={{
//             backgroundImage:
//               "linear-gradient(180deg, #ffffff 0%, #67e8f9 30%, #1A73E8 64%, #FF14EF 100%)",
//             WebkitBackgroundClip: "text",
//             backgroundClip: "text",
//             textShadow: "0 0 22px rgba(26,115,232,0.28)",
//           }}
//           animate={{
//             y: [0, -3, 0],
//             filter: [
//               "drop-shadow(0 0 8px rgba(26,115,232,0.22))",
//               "drop-shadow(0 0 18px rgba(255,20,239,0.35))",
//               "drop-shadow(0 0 8px rgba(26,115,232,0.22))",
//             ],
//           }}
//           transition={{
//             duration: 2.2,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         >
//           U
//         </motion.span>
//       </span>

//       {/* N */}
//       <motion.span
//         className="relative inline-block bg-clip-text text-transparent"
//         style={{
//           backgroundImage:
//             "linear-gradient(180deg, #ffffff 0%, #f0e9ff 34%, #f472b6 70%, #ffffff 100%)",
//           WebkitBackgroundClip: "text",
//           backgroundClip: "text",
//         }}
//         animate={{
//           opacity: [0.96, 1, 0.96],
//         }}
//         transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut" }}
//       >
//         N
//       </motion.span>

//       {/* shimmer sweep */}
//       <motion.span
//         aria-hidden
//         className="pointer-events-none absolute inset-0"
//         style={{
//           background:
//             "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 48%, transparent 100%)",
//           mixBlendMode: "screen",
//           filter: "blur(10px)",
//         }}
//         animate={{ x: ["-130%", "130%"] }}
//         transition={{
//           duration: 2.6,
//           repeat: Infinity,
//           ease: "linear",
//           repeatDelay: 1.1,
//         }}
//       />

//       {/* top scanner line */}
//       <motion.span
//         aria-hidden
//         className="pointer-events-none absolute left-0 right-0 h-[2px] rounded-full"
//         style={{
//           top: "16%",
//           background:
//             "linear-gradient(90deg, transparent 0%, rgba(103,232,249,0.85) 50%, transparent 100%)",
//           boxShadow: "0 0 14px rgba(103,232,249,0.5)",
//         }}
//         animate={{
//           x: ["-12%", "12%", "-12%"],
//           opacity: [0.25, 0.95, 0.25],
//         }}
//         transition={{
//           duration: 3.2,
//           repeat: Infinity,
//           ease: "easeInOut",
//         }}
//       />
//     </motion.span>

//     {/* bottom neon reflection */}
//     <motion.span
//       aria-hidden
//       className="absolute left-[8%] right-[8%] -bottom-2 h-4 rounded-full blur-xl"
//       style={{
//         background:
//           "linear-gradient(90deg, rgba(26,115,232,0.0) 0%, rgba(26,115,232,0.18) 30%, rgba(255,20,239,0.22) 70%, rgba(255,20,239,0.0) 100%)",
//       }}
//       animate={{
//         opacity: [0.25, 0.55, 0.25],
//         scaleX: [0.96, 1.03, 0.96],
//       }}
//       transition={{
//         duration: 3.4,
//         repeat: Infinity,
//         ease: "easeInOut",
//       }}
//     />
//   </span>
// </h1>



// {/* <img
//   src="/icons/tokun-logo-transparent.png"
//   alt="Tokun"
//   className="w-[320px] sm:w-[440px] md:w-[560px] lg:w-[680px] object-contain"
// /> */}

//             <h2 className="text-3xl md:text-4xl font-bold mb-4">
//               Enter the Promptverse
//             </h2>
//             <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
//               Optimize your LLM prompts, generate better outcomes, and monetize your best prompts—all in one place.
//             </p>
//           </div>
//         </div>

//  {/* CTAs */}
// <div
//   id="hero-ctas"
//   className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-2 sm:mt-8 mb-10"
// >
//   {/* Smartgen + Arrow */}
//   <div className="relative">
//     <motion.img
//       src="/icons/arr.png"
//       alt="arrow highlight"
//       className="pointer-events-none select-none absolute -top-6 -left-8 w-9 sm:-top-7 sm:-left-10 sm:w-10"
//     />
//     <motion.button
//       onClick={() => go(routes.smartgen)}
//       whileHover={{ scale: 1.05 }}
//       className="relative w-[200px] sm:w-[220px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold shadow-2xl border border-white/10 backdrop-blur-md flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg"
//       style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
//     >
//       <div className="absolute inset-0 rounded-full bg-white opacity-10 blur-[6px] pointer-events-none" />
//       <span>Try Smartgen</span>
//       <span
//         aria-hidden
//         className="inline-flex items-center justify-center rounded-full bg-white"
//         style={{ width: 24, height: 24 }}
//       >
//         <MdKeyboardArrowRight size={14} color="black" />
//       </span>
//     </motion.button>

//     {/* <motion.button
//   onClick={() => go(routes.smartgen)}
//   whileHover={{ scale: 1.05 }}
//   className="steam-btn relative w-[200px] sm:w-[220px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold"
//   style={{ borderRadius: 9999 }}
// >
//   <span
//     className="steam-btn-inner backdrop-blur-md border border-white/10"
//     style={{
//       borderRadius: 9999,
//       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
//       boxShadow: "0 10px 30px rgba(255,20,239,0.18)",
//       gap: 12,
//       fontSize: "inherit",
//     }}
//   >
//     <span>Try Smartgen</span>
//     <span
//       aria-hidden
//       className="inline-flex items-center justify-center rounded-full bg-white"
//       style={{ width: 24, height: 24 }}
//     >
//       <MdKeyboardArrowRight size={14} color="black" />
//     </span>
//   </span>
// </motion.button> */}
//   </div>

//  <motion.button
//     onClick={() => go(routes.marketplace)}
//     whileHover={{ 
//       scale: 1.05,
//       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
//       borderColor: "transparent"
//     }}
//     initial={{
//       background: "transparent",
//       borderColor: "rgba(255,255,255,0.25)"
//     }}
//     className="relative w-[200px] sm:w-[220px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold shadow-2xl backdrop-blur-md flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg"
//     style={{ 
//       border: "1px solid rgba(255,255,255,0.25)"
//     }}
//   >
//     Prompt Marketplace
//   </motion.button>


//   {/* <motion.button
//   onClick={() => go(routes.marketplace)}
//   whileHover={{ scale: 1.05 }}
//   className="steam-btn relative w-[200px] sm:w-[220px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold"
//   style={{ borderRadius: 9999 }}
// >
//   <span
//     className="steam-btn-inner backdrop-blur-md border border-white/10"
//     style={{
//       borderRadius: 9999,
//       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
//       boxShadow: "0 10px 30px rgba(255,20,239,0.18)",
//     }}
//   >
//     Prompt Marketplace
//   </span>
// </motion.button> */}
// </div>
//         {/* STATS */}
//         {/* <section className="mt-10">
//           <div className="container mx-auto px-6">
//             <div className="flex flex-col md:flex-row justify-center items-center text-center gap-8 font-[Inter]">
//               <div className="flex flex-col items-center">
//                 <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px", fontWeight: 500 }}>
//                   Prompts Optimized
//                 </div>
//                 <div className="text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
//                   50k
//                 </div>
//               </div>

//               <div className="hidden md:block h-[19px] w-px bg-white/40 mx-4"></div>

//               <div className="flex flex-col items-center">
//                 <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px" }}>
//                   Average Token Reduction
//                 </div>
//                 <div className="text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
//                   60%
//                 </div>
//               </div>

//               <div className="hidden md:block h-[19px] w-px bg-white/40 mx-4"></div>

//               <div className="flex flex-col items-center">
//                 <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px" }}>
//                   User Rating
//                 </div>
//                 <div className="flex items-center gap-2 text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
//                   <Star className="h-5 w-5 text-white" />
//                   4.9
//                 </div>
//               </div>

//               <div className="hidden md:block h-[19px] w-px bg-white/40 mx-4"></div>

//               <div className="flex flex-col items-center">
//                 <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px" }}>
//                   Support Available
//                 </div>
//                 <div className="text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
//                   24/7
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section> */}


// <section className="mt-20">
//   <div className="container mx-auto px-4 sm:px-6">
//     <div className="grid grid-cols-2 md:flex md:flex-row justify-center items-start gap-6 md:gap-10 font-[Inter]">
//       <div className="flex flex-col items-center">
//         <div className="text-white/90 mb-2 font-medium text-xs sm:text-sm md:text-base">
//           Prompts Optimized
//         </div>
//         <div className="text-white font-extrabold text-2xl md:text-4xl tracking-tight">
//           50k
//         </div>
//       </div>

//       <div
//         aria-hidden
//         className="hidden md:block shrink-0 mt-[2px]"
//         style={{
//           width: 0.5,
//           height: 19,
//           background: "#FFFFFF",
//           opacity: 0.4,
//         }}
//       />

//       <div className="flex flex-col items-center">
//         <div className="text-white/90 mb-2 font-medium text-xs sm:text-sm md:text-base">
//           Token Reduction
//         </div>
//         <div className="text-white font-extrabold text-2xl md:text-4xl tracking-tight">
//           60%
//         </div>
//       </div>

//       <div
//         aria-hidden
//         className="hidden md:block shrink-0 mt-[2px]"
//         style={{
//           width: 0.5,
//           height: 19,
//           background: "#FFFFFF",
//           opacity: 0.4,
//         }}
//       />

//       <div className="flex flex-col items-center">
//         <div className="text-white/90 mb-2 font-medium text-xs sm:text-sm md:text-base">
//           User Rating
//         </div>
//         <div className="flex items-center gap-2 text-white font-extrabold text-2xl md:text-4xl tracking-tight">
//           <Star className="h-5 w-5 md:h-7 md:w-7 text-white" />
//           4.9
//         </div>
//       </div>

//       <div
//         aria-hidden
//         className="hidden md:block shrink-0 mt-[2px]"
//         style={{
//           width: 0.5,
//           height: 19,
//           background: "#FFFFFF",
//           opacity: 0.4,
//         }}
//       />

//       <div className="flex flex-col items-center">
//         <div className="text-white/90 mb-2 font-medium text-xs sm:text-sm md:text-base">
//           Support
//         </div>
//         <div className="text-white font-extrabold text-2xl md:text-4xl tracking-tight">
//           24/7
//         </div>
//       </div>
//     </div>
//   </div>
// </section>
// {/* 
//              <div className="mt-12">
//   <TickerSection />
// </div> */}

//        <div className="mt-5 mb-4 flex flex-col items-center justify-center text-center select-none">
//   <Mouse className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-white/70" strokeWidth={2.25} />
//   <div className="mt-2 text-white/80" style={{ fontFamily: "Inter, ui-sans-serif, system-ui", fontSize: 12, lineHeight: "16px" }}>
//     Scroll down
//   </div>
//   <motion.div className="mt-2" animate={{ y: [0, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
//     <MoveDown className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 text-white/80" strokeWidth={2.25} />
//   </motion.div>
// </div>

// {/* ══════════ OFFER SECTION ══════════ */}
// <div className="mt-20">
//   <AnimatePresence mode="wait">
//     {/* ─── GRID VIEW ─── */}
//     {offerPhase === "grid" && (
//       <motion.div
//         key="offer-grid"
//         initial={{ opacity: 0, scale: 0.94, y: 22 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.96, y: 6 }}
//         transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
//       >
//         <h2
//           id="top-bg-end"
//           className="text-3xl md:text-5xl font-extrabold text-center mb-12 tracking-tight"
//           style={{ letterSpacing: "-0.03em" }}
//         >
//           What We Offer
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
//           {FEATURE_PREVIEWS.map((feature, i) => {
//             const Icon = feature.icon;

//             return (
//               <motion.button
//                 key={feature.title}
//                 type="button"
//                 onClick={() => openSplit(i)}
//                 initial={{ opacity: 0, scale: 0.88, y: 18 }}
//                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                 transition={{
//                   duration: 0.45,
//                   ease: [0.22, 1, 0.36, 1],
//                   delay: i * 0.07,
//                 }}
//                 whileHover={{
//                   y: -10,
//                   scale: 1.025,
//                   transition: {
//                     type: "spring",
//                     stiffness: 280,
//                     damping: 18,
//                   },
//                 }}
//                 whileTap={{ scale: 0.97 }}
//                 className="group relative rounded-[28px] p-[1px] text-left overflow-hidden h-full"
//                 style={{
//                   background: "linear-gradient(160deg,#252528,#0d0e12)",
//                 }}
//               >
//                 {/* Glow behind border */}
//                 <div
//                   className="pointer-events-none absolute -inset-px rounded-[29px] opacity-0 group-hover:opacity-100 transition-opacity duration-400"
//                   style={{
//                     background: "linear-gradient(135deg,#FF14EF,#1A73E8)",
//                     filter: "blur(14px)",
//                     zIndex: 0,
//                   }}
//                 />

//                 {/* Border itself */}
//                 <div
//                   className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-350"
//                   style={{
//                     background: "linear-gradient(135deg,#FF14EF,#1A73E8)",
//                   }}
//                 />

//                 <div className="relative rounded-[26px] bg-[#030406] group-hover:bg-[#06070d] transition-colors duration-300 p-6 flex flex-col gap-3 h-full z-[1]">
//                   {/* Number - same as How It Works */}
//                   <span
//                     className="absolute top-3 right-3"
//                     style={{
//                       width: 26,
//                       height: 24,
//                       opacity: 1,
//                       fontFamily: "Inter, ui-sans-serif, system-ui",
//                       fontWeight: 500,
//                       fontStyle: "normal",
//                       fontSize: 20,
//                       lineHeight: "100%",
//                       letterSpacing: "0%",
//                       textAlign: "right",
//                       color: "#252526",
//                     }}
//                   >
//                     {String(i + 1).padStart(2, "0")}
//                   </span>

//                   {/* Icon box */}
//                   <div
//                     className="w-11 h-11 rounded-[14px] flex items-center justify-center transition-all duration-300 group-hover:bg-white/8"
//                     style={{
//                       background: "rgba(255,255,255,0.04)",
//                       border: "1px solid rgba(255,255,255,0.07)",
//                     }}
//                   >
//                     {feature.image ? (
//                       <img
//                         src={feature.image}
//                         className="h-6 w-6 object-contain"
//                         alt=""
//                       />
//                     ) : Icon ? (
//                       <>
//                         <Icon
//                           className="h-6 w-6"
//                           style={{
//                             stroke: "url(#ig-grid)",
//                             strokeWidth: 1.7,
//                             fill: "none",
//                           }}
//                         />
//                         <svg width="0" height="0" aria-hidden>
//                           <defs>
//                             <linearGradient
//                               id="ig-grid"
//                               x1="0"
//                               y1="0"
//                               x2="0"
//                               y2="1"
//                             >
//                               <stop offset="0%" stopColor="#1A73E8" />
//                               <stop offset="100%" stopColor="#FF14EF" />
//                             </linearGradient>
//                           </defs>
//                         </svg>
//                       </>
//                     ) : null}
//                   </div>

//                   <div
//                     className="font-bold text-[17px] text-white tracking-tight leading-snug"
//                     style={{ letterSpacing: "-0.02em" }}
//                   >
//                     {feature.title}
//                   </div>

//                   <div className="text-[11.5px] text-white/55 leading-relaxed flex-1">
//                     {feature.description}
//                   </div>

//                   {/* Explore CTA */}
//                   <div className="mt-auto flex items-center gap-1.5 text-[11px] font-semibold text-white/35 group-hover:text-white/75 transition-colors duration-300 tracking-wide">
//                     <span>Explore</span>
//                     <div className="w-[22px] h-[22px] rounded-full border border-current flex items-center justify-center text-[11px] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[#FF14EF] group-hover:to-[#1A73E8] group-hover:border-transparent group-hover:text-white">
//                       →
//                     </div>
//                   </div>
//                 </div>
//               </motion.button>
//             );
//           })}
//         </div>
//       </motion.div>
//     )}

//     {/* ─── SPLIT VIEW ─── */}
//     {offerPhase === "split" && (
//       <motion.div
//         key="offer-split"
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.95 }}
//         transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
//       >
//         <h2
//           id="top-bg-end"
//           className="text-3xl md:text-5xl font-extrabold text-center mb-10 tracking-tight"
//           style={{ letterSpacing: "-0.03em" }}
//         >
//           What We Offer
//         </h2>

//         <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-3.5 max-w-[1100px] mx-auto items-stretch">
//           {/* LEFT — mini cards */}
//           <div className="flex flex-col gap-2 h-full">
//             {FEATURE_PREVIEWS.map((feature, i) => {
//               const Icon = feature.icon;
//               const isAct = i === activeOfferIdx;

//               return (
//                 <motion.button
//                   key={feature.title}
//                   type="button"
//                   onClick={() => !offerBusy && setActiveOfferIdx(i)}
//                   whileHover={
//                     !isAct
//                       ? {
//                           x: 6,
//                           transition: {
//                             type: "spring",
//                             stiffness: 320,
//                             damping: 20,
//                           },
//                         }
//                       : {}
//                   }
//                   whileTap={{ scale: 0.98 }}
//                   className="relative rounded-[14px] p-[1px] text-left overflow-hidden flex-1 flex flex-col"
//                   style={{
//                     background: isAct
//                       ? "linear-gradient(135deg,#FF14EF,#1A73E8)"
//                       : "linear-gradient(160deg,#1e1e22,#0d0e12)",
//                   }}
//                 >
//                   {/* Active left bar */}
//                   {isAct && (
//                     <motion.div
//                       layoutId="active-bar"
//                       className="absolute left-0 top-[10%] bottom-[10%] w-[2px] rounded-full z-10"
//                       style={{
//                         background:
//                           "linear-gradient(to bottom,#FF14EF,#1A73E8)",
//                       }}
//                       transition={{
//                         type: "spring",
//                         stiffness: 400,
//                         damping: 30,
//                       }}
//                     />
//                   )}

//                   <div
//                     className="relative rounded-[12px] p-3 pr-9 flex items-start gap-2.5 h-full transition-colors duration-250"
//                     style={{
//                       background: isAct ? "rgba(8,16,36,.88)" : "#030406",
//                     }}
//                   >
//                     {/* Number - same as How It Works */}
//                     <span
//                       className="absolute top-3 right-3"
//                       style={{
//                         width: 26,
//                         height: 24,
//                         opacity: 1,
//                         fontFamily: "Inter, ui-sans-serif, system-ui",
//                         fontWeight: 500,
//                         fontStyle: "normal",
//                         fontSize: 20,
//                         lineHeight: "100%",
//                         letterSpacing: "0%",
//                         textAlign: "right",
//                         color: "#252526",
//                       }}
//                     >
//                       {String(i + 1).padStart(2, "0")}
//                     </span>

//                     <div className="flex-shrink-0 mt-[3px]">
//                       {feature.image ? (
//                         <img
//                           src={feature.image}
//                           className="h-4 w-4 object-contain"
//                           alt=""
//                         />
//                       ) : Icon ? (
//                         <>
//                           <Icon
//                             className="h-4 w-4"
//                             style={{
//                               stroke: "url(#ig-mini)",
//                               strokeWidth: 1.7,
//                               fill: "none",
//                             }}
//                           />
//                           <svg width="0" height="0" aria-hidden>
//                             <defs>
//                               <linearGradient
//                                 id="ig-mini"
//                                 x1="0"
//                                 y1="0"
//                                 x2="0"
//                                 y2="1"
//                               >
//                                 <stop offset="0%" stopColor="#1A73E8" />
//                                 <stop offset="100%" stopColor="#FF14EF" />
//                               </linearGradient>
//                             </defs>
//                           </svg>
//                         </>
//                       ) : null}
//                     </div>

//                     <div>
//                       <div className="text-white font-bold text-[12px] leading-snug mb-0.5 tracking-tight">
//                         {feature.title}
//                       </div>
//                       <div className="text-white/42 text-[10px] leading-relaxed">
//                         {feature.description}
//                       </div>
//                     </div>
//                   </div>
//                 </motion.button>
//               );
//             })}
//           </div>

//           {/* RIGHT — video pane */}
//           <AnimatePresence mode="wait">
//             {activeOfferIdx !== null &&
//               (() => {
//                 const f = FEATURE_PREVIEWS[activeOfferIdx];
//                 const Icon = f.icon;

//                 return (
//                   <motion.div
//                     key={`vp-${activeOfferIdx}`}
//                     initial={{ opacity: 0, x: 36, scale: 0.95 }}
//                     animate={{ opacity: 1, x: 0, scale: 1 }}
//                     exit={{ opacity: 0, x: -20, scale: 0.97 }}
//                     transition={{
//                       duration: 0.46,
//                       ease: [0.22, 1, 0.36, 1],
//                     }}
//                     className="relative rounded-[22px] overflow-hidden flex flex-col justify-end"
//                     style={{
//                       border: "1px solid rgba(255,255,255,.07)",
//                       minHeight: 380,
//                     }}
//                   >
//                     {/* Dynamic radial bg */}
//                     <motion.div
//                       key={`bg-${activeOfferIdx}`}
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       transition={{ duration: 0.7 }}
//                       className="absolute inset-0"
//                       style={{
//                         background:
//                           "radial-gradient(ellipse at 65% 25%, rgba(26,115,232,.22) 0%, rgba(255,20,239,.14) 45%, #020307 100%)",
//                       }}
//                     />

//                     {/* Dot grid */}
//                     <div
//                       className="absolute inset-0 z-[1] pointer-events-none"
//                       style={{
//                         backgroundImage:
//                           "linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",
//                         backgroundSize: "40px 40px",
//                       }}
//                     />

//                     {/* Scan line */}
//                     <div className="absolute inset-0 overflow-hidden z-[2] pointer-events-none">
//                       <div
//                         className="absolute left-0 right-0 h-[2px]"
//                         style={{
//                           background:
//                             "linear-gradient(90deg,transparent 0%,rgba(255,20,239,.6) 30%,rgba(26,115,232,.6) 70%,transparent 100%)",
//                           animation:
//                             "scan 2.8s cubic-bezier(.4,0,.6,1) infinite",
//                           boxShadow: "0 0 12px rgba(255,20,239,.4)",
//                         }}
//                       />
//                     </div>

//                     {/* Dark overlay */}
//                     <div
//                       className="absolute inset-0 z-[3] pointer-events-none"
//                       style={{
//                         background:
//                           "linear-gradient(to top,rgba(2,3,7,.95) 0%,rgba(2,3,7,.5) 35%,rgba(2,3,7,.1) 65%,transparent 100%)",
//                       }}
//                     />

//                     {/* Video */}
//                     <video
//                       src={f.mediaSrc}
//                       className="absolute inset-0 w-full h-full object-cover z-0"
//                       autoPlay
//                       muted
//                       loop
//                       playsInline
//                     />

//                     {/* Close */}
//                     <button
//                       type="button"
//                       onClick={closeSplit}
//                       aria-label="Back to grid"
//                       className="absolute top-3 right-3 z-20 w-[30px] h-[30px] rounded-full flex items-center justify-center text-white/80 hover:text-white hover:scale-110 transition-all duration-200"
//                       style={{
//                         border: "1px solid rgba(255,255,255,.18)",
//                         background: "rgba(0,0,0,.65)",
//                         backdropFilter: "blur(6px)",
//                       }}
//                     >
//                       <X className="h-3 w-3" />
//                     </button>

//                     {/* Center icon with pulse rings */}
//                     <div className="absolute inset-0 flex items-center justify-center z-[4] pointer-events-none">
//                       <div className="relative">
//                         <div
//                           className="absolute inset-[-8px] rounded-full"
//                           style={{
//                             border: "1px solid rgba(255,20,239,.25)",
//                             animation: "pulse-ring 2.2s ease-in-out infinite",
//                           }}
//                         />
//                         <div
//                           className="absolute inset-[-16px] rounded-full"
//                           style={{
//                             border: "1px solid rgba(26,115,232,.15)",
//                             animation:
//                               "pulse-ring 2.2s ease-in-out .6s infinite",
//                           }}
//                         />

//                         <div
//                           className="w-[68px] h-[68px] rounded-full flex items-center justify-center relative z-[1]"
//                           style={{
//                             border: "1px solid rgba(255,255,255,.12)",
//                             background: "rgba(255,255,255,.05)",
//                             backdropFilter: "blur(10px)",
//                           }}
//                         >
//                           {f.image ? (
//                             <img
//                               src={f.image}
//                               className="h-6 w-6 object-contain"
//                               alt=""
//                             />
//                           ) : Icon ? (
//                             <>
//                               <Icon
//                                 className="h-6 w-6"
//                                 style={{
//                                   stroke: "url(#ig-video)",
//                                   strokeWidth: 1.7,
//                                   fill: "none",
//                                 }}
//                               />
//                               <svg width="0" height="0" aria-hidden>
//                                 <defs>
//                                   <linearGradient
//                                     id="ig-video"
//                                     x1="0"
//                                     y1="0"
//                                     x2="0"
//                                     y2="1"
//                                   >
//                                     <stop offset="0%" stopColor="#1A73E8" />
//                                     <stop offset="100%" stopColor="#FF14EF" />
//                                   </linearGradient>
//                                 </defs>
//                               </svg>
//                             </>
//                           ) : null}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Bottom content */}
//                     <div className="relative z-[5] p-5 md:p-6">
//                       <div
//                         className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mb-2.5 text-[9px] font-bold tracking-[.1em] uppercase text-white/50"
//                         style={{
//                           background: "rgba(255,255,255,.07)",
//                           border: "1px solid rgba(255,255,255,.1)",
//                         }}
//                       >
//                         <div
//                           className="w-[5px] h-[5px] rounded-full"
//                           style={{
//                             background:
//                               "linear-gradient(135deg,#FF14EF,#1A73E8)",
//                           }}
//                         />
//                         {String(activeOfferIdx + 1).padStart(2, "0")} ·{" "}
//                         {f.title.split(" ")[0]}
//                       </div>

//                       <motion.h3
//                         key={`t-${activeOfferIdx}`}
//                         initial={{ opacity: 0, y: 12 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{
//                           duration: 0.32,
//                           ease: [0.22, 1, 0.36, 1],
//                         }}
//                         className="text-white font-black text-2xl md:text-3xl mb-2 leading-tight"
//                         style={{ letterSpacing: "-0.03em" }}
//                       >
//                         {f.title}
//                       </motion.h3>

//                       <motion.p
//                         key={`d-${activeOfferIdx}`}
//                         initial={{ opacity: 0, y: 8 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{
//                           duration: 0.32,
//                           delay: 0.06,
//                           ease: [0.22, 1, 0.36, 1],
//                         }}
//                         className="text-white/60 text-xs leading-relaxed"
//                       >
//                         {f.description}
//                       </motion.p>
//                     </div>
//                   </motion.div>
//                 );
//               })()}
//           </AnimatePresence>
//         </div>

//         {/* Progress dots */}
//         <div className="flex justify-center gap-1.5 mt-4">
//           {FEATURE_PREVIEWS.map((_, i) => (
//             <motion.button
//               key={i}
//               onClick={() => !offerBusy && setActiveOfferIdx(i)}
//               animate={{ width: i === activeOfferIdx ? 20 : 4 }}
//               transition={{ type: "spring", stiffness: 400, damping: 28 }}
//               className="h-[4px] rounded-full"
//               style={{
//                 background:
//                   i === activeOfferIdx
//                     ? "linear-gradient(90deg,#FF14EF,#1A73E8)"
//                     : "rgba(255,255,255,0.18)",
//               }}
//             />
//           ))}
//         </div>
//       </motion.div>
//     )}
//   </AnimatePresence>
// </div>

//         {/* HOW IT WORKS + PRODUCT DEMO */}
//         <div className="mt-28" style={{ borderWidth: "1px 0 1px 0", borderStyle: "solid", borderColor: "#171717", background: "#08090B" }}>
//           <div className="pt-16 flex justify-center mb-8">
//             <div className="p-[1px] rounded-full" style={{ background: "linear-gradient(90deg, #1A73E8 0%, #FF14EF 100%)" }}>
//               <div className="px-5 py-2 rounded-full bg-black">
//                 <span
//                   style={{
//                     fontFamily: "Inter, ui-sans-serif, system-ui",
//                     fontWeight: 500,
//                     fontSize: 16,
//                     lineHeight: "100%",
//                     background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//                     WebkitBackgroundClip: "text",
//                     color: "transparent",
//                   }}
//                 >
//                   PROCESS
//                 </span>
//               </div>
//             </div>
//           </div>











//           {/* <div className="pt-16 flex justify-center mb-8">
//   <button
//     type="button"
//     className="steam-btn rounded-full"
//     style={{ borderRadius: 9999 }}
//   >
//     <span
//       className="steam-btn-inner px-5 py-2"
//       style={{
//         borderRadius: 9999,
//         background: "#000000",
//       }}
//     >
//       <span
//         style={{
//           fontFamily: "Inter, ui-sans-serif, system-ui",
//           fontWeight: 500,
//           fontSize: 16,
//           lineHeight: "100%",
//           background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//           WebkitBackgroundClip: "text",
//           color: "transparent",
//         }}
//       >
//         PROCESS
//       </span>
//     </span>
//   </button>
// </div> */}
//           {/* <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">How It Works</h2> */}
//            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
//   How It Works
// </h2>

//           {/* Steps grid */}
//           {/* <div className="px-6">
//             <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 mb-16">
//               {[
//                 { step: "Input Idea", Icon: Zap, description: "Share your concept or requirement" },
//                 { step: "Smartgen", Icon: Sparkles, description: "AI generates optimized prompts" },
//                 { step: "Optimize", Icon: Zap, description: "Reduce tokens, improve quality" },
//                 { step: "Save or Sell", Icon: Sparkle, description: "Store in library or marketplace" },
//                 { step: "Earn", Icon: Sparkle, description: "Monetize your best prompts" },
//               ].map((item, i) => {
//                 const isActive = i === activeStep;
//                 const fill = isActive ? "linear-gradient(360deg, #1A1A1A 0%, #08090B 100%)" : "#030406";

//                 return (
//                   <button
//                     key={i}
//                     type="button"
//                     onClick={() => setActiveStep(i)}
//                     className="relative cursor-pointer select-none focus:outline-none"
//                     style={{
//                       width: "100%",
//                       padding: 2,
//                       borderRadius: 22,
//                       background: "linear-gradient(180deg, #333333 0%, #12141A 100%)",
//                     }}
//                     onMouseEnter={(e) => {
//                       const inner = e.currentTarget.querySelector<HTMLElement>("[data-inner]");
//                       if (inner && !isActive) inner.style.background = "linear-gradient(360deg, #1A1A1A 0%, #08090B 100%)";
//                     }}
//                     onMouseLeave={(e) => {
//                       const inner = e.currentTarget.querySelector<HTMLElement>("[data-inner]");
//                       if (inner && !isActive) inner.style.background = "#030406";
//                     }}
//                   >
//                     <div
//                       data-inner
//                       className="w-full h-full flex flex-col items-start justify-start p-5 text-left transition-colors overflow-hidden"
//                       style={{
//                         borderRadius: 18,
//                         background: fill,
//                         minHeight: 140,
//                       }}
//                     >
//                       <div className="absolute top-3 right-4 text-white/40 font-semibold text-sm">
//                         {String(i + 1).padStart(2, "0")}
//                       </div>

//                       <div className="mb-2">
//                         <item.Icon className="h-8 w-8 text-white" />
//                       </div>

//                       <h3 className="text-white font-semibold text-[18px] sm:text-[20px] leading-snug break-words">
//                         {item.step}
//                       </h3>

//                       <p className="text-white/70 mt-2 text-[14px] sm:text-[15px] leading-snug break-words whitespace-normal">
//                         {item.description}
//                       </p>
//                     </div>
//                   </button>
//                 );
//               })}
//             </div>
//           </div> */}


//     <div className="px-0 sm:px-4 md:px-6">
//   <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-16">
//     {HOW_IT_WORKS_STEPS.map((item, i) => {
//       const isActive = i === activeStep;

//       const fill = isActive
//         ? "linear-gradient(360deg, #1A1A1A 0%, #08090B 100%)"
//         : "#030406";

//       return (
//         <button
//           key={item.step}
//           type="button"
//           onClick={() => setActiveStep(i)}
//           className="relative cursor-pointer select-none focus:outline-none w-full group"
//           style={{
//             padding: 1,
//             borderRadius: 12,
//             background: "linear-gradient(180deg, #333333 0%, #12141A 100%)",
//           }}
//         >
//           <div
//             className="relative w-full h-full flex flex-col items-start justify-start text-left transition-colors overflow-hidden"
//             style={{
//               borderRadius: 11,
//               background: fill,
//               minHeight: 140,
//               padding: "18px 20px",
//             }}
//           >
//             {/* Number */}
//             <div
//               className="absolute top-3 right-3"
//               style={{
//                 width: 26,
//                 height: 24,
//                 opacity: 1,
//                 fontFamily: "Inter, ui-sans-serif, system-ui",
//                 fontWeight: 500,
//                 fontStyle: "normal",
//                 fontSize: 20,
//                 lineHeight: "100%",
//                 letterSpacing: "0%",
//                 textAlign: "right",
//                 color: HOW_IT_WORKS_NUMBER_COLOR,
//               }}
//             >
//               {String(i + 1).padStart(2, "0")}
//             </div>

//             {/* Icon */}
//             <div className="mb-5">
//               <img
//                 src={item.iconSrc}
//                 alt=""
//                 draggable={false}
//                 className="w-8 h-8 object-contain"
//                 style={{
//                   filter: "brightness(0) invert(1)",
//                 }}
//               />
//             </div>

//             {/* Title */}
//             <h3
//               className="text-white font-semibold leading-none"
//               style={{
//                 fontSize: i === 0 ? 22 : 20,
//                 fontFamily: "Inter, ui-sans-serif, system-ui",
//               }}
//             >
//               {item.step}
//             </h3>

//             {/* Description */}
//             <p
//               className="text-white/85 mt-3 leading-tight"
//               style={{
//                 fontSize: i === 0 ? 16 : 14,
//                 fontFamily: "Inter, ui-sans-serif, system-ui",
//                 maxWidth: 150,
//               }}
//             >
//               {item.description}
//             </p>
//           </div>
//         </button>
//       );
//     })}
//   </div>
// </div>
   
//      {/* Product Demo */}
// <div className="mt-28 relative overflow-hidden">

//   <div className="container mx-auto px-6 text-center">

//     {/* Heading */}
//    <h3 className="text-3xl md:text-5xl font-bold text-white">
//   Product Demo
// </h3>

//     <p className="text-white/70 text-lg mt-3 mb-12">
//       Video demonstration of earn feature
//     </p>

//     {/* Demo Wrapper */}
//     <div className="relative w-full max-w-[1200px] mx-auto">

//       {/* Glow background */}
//       <div
//         className="absolute inset-0 blur-[120px] opacity-40"
//         style={{
//           background:
//             "radial-gradient(circle at center, rgba(255,20,239,0.35) 0%, rgba(26,115,232,0.35) 100%)",
//         }}
//       />

//       {/* Laptop with 3D animation */}
//       <motion.div
//         whileHover={{
//           rotateX: 6,
//           rotateY: -6,
//           scale: 1.03,
//         }}
//         transition={{ type: "spring", stiffness: 120 }}
//         className="relative mx-auto"
//         style={{ perspective: 1200 }}
//       >

//         {/* Laptop Image */}
//         <img
//           src="/icons/ux.png"
//           alt="Laptop demo"
//           className="w-full h-auto select-none pointer-events-none"
//           draggable={false}
//         />

//         {/* Screen Video */}
//         <div
//           className="absolute overflow-hidden rounded-[12px]"
//           style={{
//             top: "16.5%",
//             left: "11.8%",
//             width: "76.4%",
//             height: "64%",
//           }}
//         >
//     <video
//   src="/icons/token.mp4"
//   className="w-full h-full object-cover"
//   autoPlay
//   muted
//   loop
//   playsInline
// />
//         </div>

//       </motion.div>

//     </div>
//   </div>
// </div>
//         </div>

//         <GlobeSection /> {/* ← yahan add karo */}
//           <FAQSection />   
//         {/* FINAL CTA */}
//         <div className="mt-28 text-center">
//        <div className="flex justify-center mb-4">
//   <button
//     type="button"
//     className="rounded-full"
//     style={{
//       borderRadius: 9999,
//       padding: "1px",
//       background: "linear-gradient(90deg, #1A73E8 0%, #FF14EF 100%)",
//     }}
//   >
//     <span
//       className="px-5 py-2 inline-flex items-center justify-center rounded-full"
//       style={{
//         borderRadius: 9999,
//         background: "#000000",
//       }}
//     >
//       <span
//         style={{
//           fontFamily: "Inter, ui-sans-serif, system-ui",
//           fontWeight: 500,
//           fontSize: 16,
//           lineHeight: "100%",
//           background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//           WebkitBackgroundClip: "text",
//           color: "transparent",
//         }}
//       >
//         REACH OUT ANY TIME
//       </span>
//     </span>
//   </button>
// </div>

//        <h2 className="text-3xl md:text-5xl font-bold mb-6">
//   Ready to optimize your prompts?
// </h2>
// <p className="text-base sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
//   Join thousands of developers who are already saving costs and improving efficiency with TOKUN.
// </p>

//          <div className="relative inline-block overflow-visible isolate">
//   <div
//     className="pointer-events-none absolute -inset-x-16 -top-2 -bottom-10 rounded-[36px] z-0"
//     style={{
//       background: "linear-gradient(90deg, rgba(255,20,239,0.4) 0%, rgba(26,115,232,0.4) 100%)",
//       filter: "blur(60px)",
//       opacity: 1,
//     }}
//   />
//   <div className="relative">
//     <motion.img
//       src="/icons/arr.png"
//       alt="arrow highlight"
//       className="pointer-events-none select-none absolute -top-6 -left-8 w-9 sm:-top-7 sm:-left-10 sm:w-10"
//     />
//     <motion.button
//       onClick={() => go(routes.app)}
//       whileHover={{ scale: 1.05 }}
//       className="relative w-[200px] sm:w-[240px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold shadow-2xl border border-white/10 backdrop-blur-md flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg"
//       style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
//     >
//       <div className="absolute inset-0 rounded-full bg-white opacity-10 blur-[6px] pointer-events-none" />
//       <span>Start Optimizing Now</span>
//       <span
//         aria-hidden
//         className="inline-flex items-center justify-center rounded-full bg-white"
//         style={{ width: 24, height: 24 }}
//       >
//         <MdKeyboardArrowRight size={14} color="black" />
//       </span>
//     </motion.button>
//     {/* <motion.button
//   onClick={() => go(routes.app)}
//   whileHover={{ scale: 1.05 }}
//   className="steam-btn relative w-[200px] sm:w-[240px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold"
//   style={{ borderRadius: 9999 }}
// >
//   <span
//     className="steam-btn-inner backdrop-blur-md border border-white/10"
//     style={{
//       borderRadius: 9999,
//       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
//       boxShadow: "0 10px 30px rgba(255,20,239,0.18)",
//       gap: 12,
//     }}
//   >
//     <span>Start Optimizing Now</span>
//     <span
//       aria-hidden
//       className="inline-flex items-center justify-center rounded-full bg-white"
//       style={{ width: 24, height: 24 }}
//     >
//       <MdKeyboardArrowRight size={14} color="black" />
//     </span>
//   </span>
// </motion.button> */}
//   </div>
// </div>
//         </div>

//         {/* TESTIMONIALS */}
//           {/* TESTIMONIALS */}
//       {/* TESTIMONIALS — SAME POSITION & DESIGN, keep < and > arrows; center when only one */}
//            {/* TESTIMONIALS */}
// <div className="mt-28 mb-8 relative font-[Inter] px-4">

//   {/* TAG */}
//   <div className="flex justify-center mb-4">
//     <div
//       className="p-[1px] rounded-full"
//       style={{ background: "linear-gradient(90deg, #1A73E8 0%, #FF14EF 100%)" }}
//     >
//       <div className="px-5 py-2 rounded-full bg-black">
//         <span
//           style={{
//             fontWeight: 500,
//             fontSize: 16,
//             background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//             WebkitBackgroundClip: "text",
//             color: "transparent",
//           }}
//         >
//           WALL OF LOVE
//         </span>
//       </div>
//     </div>
//   </div>

//   {/* <div className="flex justify-center mb-4">
//   <button
//     type="button"
//     className="steam-btn rounded-full"
//     style={{ borderRadius: 9999 }}
//   >
//     <span
//       className="steam-btn-inner px-5 py-2"
//       style={{
//         borderRadius: 9999,
//         background: "#000000",
//       }}
//     >
//       <span
//         style={{
//           fontWeight: 500,
//           fontSize: 16,
//           background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//           WebkitBackgroundClip: "text",
//           color: "transparent",
//         }}
//       >
//         WALL OF LOVE
//       </span>
//     </span>
//   </button>
// </div> */}

//  <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-4">
//   Loved by thinkers
// </h2>

// <p className="text-sm sm:text-lg text-white/70 text-center mb-12">
//   Here's what people worldwide are saying
// </p>

//  {feedbacks.length === 0 ? (
//   <div className="text-center text-white/60">
//     No testimonials yet — be the first to leave feedback!
//   </div>
// ) : (
//   <div className="flex justify-center items-center gap-3 sm:gap-6 px-3 sm:px-0">
//     {/* LEFT BUTTON */}
//     <button
//       onClick={prevSlide}
//       className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white text-white transition-all shrink-0"
//     >
//       <MdKeyboardArrowDown size={20} className="rotate-90 sm:text-[22px]" />
//     </button>

//     {/* SLIDER */}
//     <div className="relative w-full max-w-[560px] overflow-hidden">
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={current}
//           initial={{ opacity: 0, x: 120 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: -120 }}
//           transition={{ duration: 0.4 }}
//           className="w-full"
//         >
//           {(() => {
//             const t = feedbacks[current];
//             return (
//               <div
//                 key={t.id}
//                 className="relative flex flex-col justify-between p-4 sm:p-6 text-left bg-transparent overflow-hidden w-full"
//                 style={{
//                   border: "1px solid #333335",
//                   borderRadius: 24,
//                 }}
//               >
//                 {/* glow */}
//                 <div
//                   className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-28 h-28 sm:w-40 sm:h-40 rounded-full pointer-events-none"
//                   style={{
//                     background:
//                       "radial-gradient(circle at center, rgba(255,20,239,0.25) 0%, rgba(26,115,232,0.25) 100%)",
//                     filter: "blur(60px)",
//                   }}
//                 />

//                 <div className="relative z-10 flex flex-col gap-3">
//                   {/* stars */}
//                   <div className="flex">
//                     {Array.from({
//                       length: Math.max(1, Math.min(5, Number(t.rating) || 5)),
//                     }).map((_, i) => (
//                       <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-white fill-white" />
//                     ))}
//                   </div>

//                   {/* text */}
//                   <p className="text-white/90 text-[13px] sm:text-[15px] leading-relaxed break-words">
//                     "{t.experience}"
//                   </p>

//                   {/* user */}
//                   <div className="flex items-center gap-3">
//                     <img
//                       src={t.avatar || svgInitialsAvatar(t.name || "User")}
//                       alt={t.name || "User"}
//                       className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
//                     />
//                     <div className="min-w-0">
//                       <div className="font-semibold text-white text-sm sm:text-base truncate">
//                         {t.name || "Anonymous"}
//                       </div>
//                       <div className="text-xs sm:text-sm text-white/60 break-words">
//                         {[t.role, t.org].filter(Boolean).join(" • ")}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })()}
//         </motion.div>
//       </AnimatePresence>
//     </div>

//     {/* RIGHT BUTTON */}
//     <button
//       onClick={nextSlide}
//       className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white text-white transition-all shrink-0"
//     >
//       <MdKeyboardArrowDown size={20} className="-rotate-90 sm:text-[22px]" />
//     </button>
//   </div>
// )}
// </div>



//         {showFooter && <Footer />}

//         {/* Floating Action Button */}
//         {/* Floating Action Button */}
// {/* Floating Action Button */}
// {/* Floating Action Button */}
// {/* Floating Action Button */}
// <div className="fixed bottom-24 right-8 z-50">
//   <Button
//     onClick={() =>
//       variant === "marketing" ? go(routes.login) : go(routes.dashboard)
//     }
//     className="w-16 h-16 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 p-0"
//     style={{
//       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
//       boxShadow: "0 0 40px rgba(26,115,232,0.35)",
//     }}
//   >
//     <FiArrowRight
//       className="text-white"
//       style={{
//         width: 38,
//         height: 38,
//         strokeWidth: 1.8,
//       }}
//     />
//   </Button>
// </div>
//       </div>

//       {/* ===== Feedback vertical pill (50x130) =====
//           Placed above the Smartgen/Marketplace CTAs and sticks to the laptop screen's right edge */}
//       {fbPos && (
//     <button
//   type="button"
//   onClick={() => setFeedbackOpen(true)}   // 👈 open modal
//   aria-label="Give feedback"
//   className="absolute z-50 text-white font-semibold"
// style={{
//   position: 'fixed',           // 👈 add this
//   width: 50,
//   height: 130,
//   opacity: 1,
//   top: fbPos.top,
//   left: fbPos.left,
//   borderTopLeftRadius: 16,
//   borderBottomLeftRadius: 16,
//   borderTopRightRadius: 0,
//   borderBottomRightRadius: 0,
//   background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
//   boxShadow: "0 0 28px rgba(26,115,232,0.25)",
//   writingMode: "vertical-rl",
//   textOrientation: "mixed",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   letterSpacing: 1,
// }}

// >
//   <span
//     className="inline-flex items-center select-none"
//     style={{
//       transform: "rotate(180deg)", // bottom → top
//       gap: 6,
//       lineHeight: 1,
//       fontFamily: "Inter, ui-sans-serif, system-ui",
//       fontWeight: 400,
//       fontStyle: "normal",
//       fontSize: 16,
//       color: "#fff",
//       textAlign: "center",
//     }}
//   >
//     <MessageCircleHeart
//       aria-hidden
//       style={{ width: 22, height: 22, transform: "rotate(180deg)" }} // keep icon upright
//     />
//     <span>Feedback</span>
//   </span>
// </button>


//       )}

//       {feedbackOpen && (
//   <div role="dialog" aria-modal="true" className="fixed inset-0 z-[999] grid place-items-center">
//     {/* Backdrop */}
//     <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setFeedbackOpen(false)} />

//     {/* Card: smaller + capped height + Inter Regular for everything */}
//  <div
//   className="relative rounded-2xl text-white shadow-2xl"
//   style={{
//     background: "#17171A", // ← was "#131313"
//     width: "min(92vw, 520px)",
//     maxHeight: "85vh",
//     fontFamily: "Inter",
//     fontWeight: 400,
//     fontStyle: "normal",
//   }}
// >

//       {/* Close */}
//       <button
//         aria-label="Close"
//         onClick={() => setFeedbackOpen(false)}
//         className="absolute right-2 top-2 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8"
//       >
//         <X className="w-4 h-4 text-white/90" />
//       </button>

//       {/* Scrollable content (scrollbar hidden) */}
//       <div
//         className="no-scrollbar overflow-y-auto px-5 md:px-6 py-6 md:py-7"
//         style={{ maxHeight: "85vh" }}
//       >
//         {/* Title (regular weight) */}
//         <h3 className="text-center text-[20px] md:text-[22px]" style={{ fontWeight: 400 }}>
//           We Value Your Feedback
//         </h3>
//         <p className="text-center text-white/70 mt-2 leading-snug text-sm">
//           Your feedback is important to us We take
//           <br />
//           it very seriously.
//         </p>

//         {/* Stars */}
//         <div className="mt-5">
//           <div className="flex items-center justify-center gap-4">
//             {Array.from({ length: 5 }).map((_, i) => {
//               const idx = i + 1;
//               const active = (hoverRating || rating) >= idx;
//               return (
//                 <button
//                   key={idx}
//                   type="button"
//                   onMouseEnter={() => setHoverRating(idx)}
//                   onMouseLeave={() => setHoverRating(0)}
//                   onClick={() => setRating(idx)}
//                   className="p-1"
//                   aria-label={`Rate ${idx} star${idx > 1 ? "s" : ""}`}
//                   style={{ fontFamily: "Inter", fontWeight: 400 }}
//                 >
//                   <Star
//                     className="w-6 h-6"
//                     style={{
//                       color: active ? "#FFFFFF" : "rgba(255,255,255,0.5)",
//                       fill: active ? "#FFFFFF" : "transparent",
//                     }}
//                   />
//                 </button>
//               );
//             })}
//           </div>
//           <div className="flex justify-between text-[11px] text-white/70 w-[240px] mx-auto mt-2">
//             <span>Very bad</span>
//             <span>Very Good</span>
//           </div>
//         </div>

//         {/* Write your experience */}
//         <div className="mt-6">
//           <label className="block mb-2 text-white/90 text-sm">Write your experience</label>
//           <div className="relative">
//           <textarea
//   value={fbForm.experience}
//   onChange={(e) =>
//     setFbForm((p) => ({ ...p, experience: e.target.value.slice(0, MAX_CHARS) }))
//   }
//   rows={4}
//   className="w-full resize-none rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
//   placeholder="Share your thoughts..."
//   style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
//   required
// />

//             <div className="absolute right-3 bottom-2 text-xs text-white/60">
//               {fbForm.experience.length}/{MAX_CHARS}
//             </div>
//           </div>
//         </div>

//         {/* Name */}
//         <div className="mt-5">
//           <label className="block mb-2 text-white/90 text-sm">Your Name</label>
//        <input
//   value={fbForm.name}
//   onChange={(e) => setFbForm((p) => ({ ...p, name: e.target.value }))}
//   className="w-full rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
//   placeholder="Your full name"
//   style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
//   required
// />

//         </div>

//         {/* Role */}
//         <div className="mt-5">
//           <label className="block mb-2 text-white/90 text-sm">Your Role / Designation</label>
//           <input
//             value={fbForm.role}
//             onChange={(e) => setFbForm((p) => ({ ...p, role: e.target.value }))}
//             className="w-full rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
//             placeholder="e.g., Assistant Manager"
//             style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
//           />
//         </div>

//         {/* Organization */}
//         <div className="mt-5">
//           <label className="block mb-2 text-white/90 text-sm">Organization / Company</label>
//           <input
//             value={fbForm.org}
//             onChange={(e) => setFbForm((p) => ({ ...p, org: e.target.value }))}
//             className="w-full rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
//             placeholder="Company name"
//             style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
//           />
//         </div>

//         {/* File upload */}
//         <div className="mt-5">
//           <label className="block mb-2 text-white/90 text-sm">Profile Picture</label>
//           <div className="flex items-center gap-3">
//             <label
//               className="cursor-pointer inline-flex items-center rounded-md px-4 py-2 text-sm text-white"
//               style={{
//                 background: "linear-gradient(270deg, #FF14EF 0%, #1A73E8 100%)",
//                 fontFamily: "Inter",
//                 fontWeight: 400,
//                 fontStyle: "normal",
//               }}
//             >
//               Choose file
//               <input
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={(e) => setFbForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
//               />
//             </label>
//             <div className="flex-1 truncate rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white/70"
//                  style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}>
//               {fbForm.file ? fbForm.file.name : "No file chosen"}
//             </div>
//           </div>
//         </div>

//         {/* Actions — right aligned; Clear sits directly left of Submit */}
//         <div className="mt-6 flex items-center justify-end gap-3">
//         <button
//   type="button"
//   onClick={handleClear}
//   className="text-white/90 hover:text-white transition"
//   style={{
//     width: 100,
//     height: 49,
//     opacity: 1,
//     borderRadius: 6,
//     border: "1px solid #FFFFFF",
//     display: "inline-flex",
//     alignItems: "center",
//     justifyContent: "center",
//     background: "transparent",
//     fontFamily: "Inter",
//     fontWeight: 400,
//     fontStyle: "normal",
//   }}
// >
//   Clear
// </button>


//          <button
//   type="button"
//   onClick={handleSubmitFeedback}
//   className="text-white" // removed rounded-xl/px/py to avoid conflicts
//   style={{
//     width: 162,
//     height: 49,
//     opacity: 1,
//     borderRadius: 6,
//     padding: 15,
//     gap: 10,
//     display: "inline-flex",
//     alignItems: "center",
//     justifyContent: "center",
//     background: "linear-gradient(270deg, #FF14EF 0%, #1A73E8 100%)",
//     fontFamily: "Inter",
//     fontWeight: 400,
//     fontStyle: "normal",
//   }}
// >
//   Submit Feedback
// </button>

//         </div>
//       </div>
//     </div>
//   </div>
// )}




// {thankOpen && (
//   <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] grid place-items-center">
//     {/* Backdrop */}
//     <div
//       className="absolute inset-0 bg-black/70 backdrop-blur-sm"
//       onClick={() => setThankOpen(false)}
//     />

//     {/* Card */}
//     <div
//       className="relative rounded-2xl text-white shadow-2xl px-6 py-7"
//       style={{
//         background: "#17171A",
//         width: "min(92vw, 500px)",
//         border: "1px solid #333335",
//       }}
//     >
//       {/* Close */}
//       <button
//         aria-label="Close"
//         onClick={() => setThankOpen(false)}
//         className="absolute right-2 top-2 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8"
//       >
//         <X className="w-4 h-4 text-white/90" />
//       </button>

//       {/* Green check icon */}
//       <div className="grid place-items-center mb-4">
//         <div
//           className="grid place-items-center h-14 w-14 rounded-full"
//           style={{ background: "rgba(16,185,129,0.18)" }}  /* dark green ring */
//         >
//           <div
//             className="grid place-items-center h-10 w-10 rounded-full"
//             style={{ background: "#16A34A" }}  /* green */
//           >
//             <Check className="w-6 h-6 text-black" />
//           </div>
//         </div>
//       </div>

//       {/* Text */}
//       <h3 className="text-center text-[18px] md:text-[20px] font-medium">
//         Thank you for your feedback!
//       </h3>
//       <p className="text-center text-white/70 mt-2 text-sm">
//         We appreciate your feedback and will review it shortly.
//       </p>

//       {/* Actions */}
//       <div className="mt-6 flex items-center justify-center gap-3">
//         <button
//           type="button"
//           onClick={() => setThankOpen(false)}
//           className="text-white/90 hover:text-white transition"
//           style={{
//             width: 110,
//             height: 44,
//             borderRadius: 6,
//             border: "1px solid #FFFFFF",
//             background: "transparent",
//           }}
//         >
//           Cancel
//         </button>

//         <button
//           type="button"
//           onClick={() => {
//             setThankOpen(false);
//             handleClear();         // fresh form
//             setFeedbackOpen(true); // reopen the form
//           }}
//           className="text-white"
//           style={{
//             width: 160,
//             height: 44,
//             borderRadius: 6,
//             background: "#333335",
//           }}
//         >
//           Submit Another
//         </button>
//       </div>
//     </div>
//   </div>
// )}


// <style>{`
//   .steam-btn {
//     position: relative;
//     isolation: isolate;
//     overflow: visible;
//   }

//   .steam-btn::before,
//   .steam-btn::after {
//     content: "";
//     position: absolute;
//     inset: -2px;
//     border-radius: inherit;
//     background: linear-gradient(
//       45deg,
//       #fb0094,
//       #0000ff,
//       #00ff00,
//       #ffff00,
//       #ff0000,
//       #fb0094,
//       #0000ff,
//       #00ff00,
//       #ffff00,
//       #ff0000
//     );
//     background-size: 400%;
//     z-index: -2;
//     animation: steam 20s linear infinite;
//   }

//   .steam-btn::after {
//     z-index: -3;
//     filter: blur(22px);
//     opacity: 0.95;
//   }

//   .steam-btn-inner {
//     position: relative;
//     z-index: 1;
//     border-radius: inherit;
//     width: 100%;
//     height: 100%;
//     display: inline-flex;
//     align-items: center;
//     justify-content: center;
//   }

//   @keyframes steam {
//     0% { background-position: 0 0; }
//     50% { background-position: 400% 0; }
//     100% { background-position: 0 0; }
//   }
// `}


// {`
//   @keyframes scan {
//     0%   { top: 0%;   opacity: 0; }
//     5%   { opacity: 1; }
//     95%  { opacity: 1; }
//     100% { top: 100%; opacity: 0; }
//   }
//   @keyframes pulse-ring {
//     0%, 100% { transform: scale(1);    opacity: .6; }
//     50%       { transform: scale(1.07); opacity: 1; }
//   }
// `}



// </style>

//     </motion.section>
//   );
// }





// import { useState, useEffect, useMemo } from "react";
// import { useRef } from "react";

// import { useNavigate } from "react-router-dom";
// import {  AnimatePresence } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { ArrowRight, Sparkles, Zap, TrendingUp, Star, Sparkle, Mouse, MoveDown } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
// import { motion, animate, useMotionValue, useMotionTemplate } from "framer-motion";
// import Footer from "@/components/Footer";
// import SubscriptionModal from "@/components/SubscriptionModal";
// import { Settings, ChevronDown,User } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import { MessageCircleHeart, X } from "lucide-react";
// import { GlobeSection, FAQSection , TickerSection } from "@/components/GlobeAndFAQ_components";
// // top of file (with other lucide-react imports)
// import { Check  } from "lucide-react";
// import { LuBadgeCheck } from "react-icons/lu";
// import { FaArrowRight } from "react-icons/fa";
// import { FiArrowRight } from "react-icons/fi";
// import AccountMenu from "@/components/AccountMenu";
// const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

// /* --- tiny helper: star with true gradient color using CSS mask --- */
// function MaskedStar({ size = 14 }: { size?: number }) {
//   const starMask = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896 4.665 23.165l1.401-8.168L.132 9.21l8.2-1.192z'/%3E%3C/svg%3E")`;
//   const common: React.CSSProperties = {
//     display: "inline-block",
//     width: size,
//     height: size,
//     backgroundImage: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//     WebkitMaskImage: starMask,
//     maskImage: starMask,
//     WebkitMaskRepeat: "no-repeat",
//     maskRepeat: "no-repeat",
//     WebkitMaskPosition: "center",
//     maskPosition: "center",
//     WebkitMaskSize: "contain",
//     maskSize: "contain",
//   };
//   return <span style={common} aria-hidden="true" />;
// }

// /* --- reusable badge button --- */
// function GradientBadge({
//   label = "Trusted by industry leaders",
//   showIcon = true,
// }: {
//   label?: string;
//   showIcon?: boolean;
// }) {
//   return (
//     <button
//       type="button"
//       className="inline-flex items-center rounded-full"
//       style={{
//         background: "#252525",
//         border: "1px solid #333335",
//         padding: "10px 14px",
//         gap: showIcon ? 8 : 0,
//       }}
//     >
//       {showIcon ? <MaskedStar size={16} /> : null}
//       <span
//         className="bg-clip-text text-transparent"
//         style={{
//           backgroundImage: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//           fontFamily: "Inter, ui-sans-serif, system-ui",
//           fontWeight: 500,
//           fontSize: 16,
//           lineHeight: "100%",
//         }}
//       >
//         {label}
//       </span>
//     </button>
//   );
// }

// type LandingProps = {
//   variant?: "marketing" | "app";
//   userFullName?: string;
//   routes?: {
//     login?: string;
//     signup?: string;
//     app?: string;
//     promptLibrary?: string;
//     smartgen?: string;
//     marketplace?: string;
//     dashboard?: string;
//     profile?: string;
//   };
//   showFooter?: boolean;
// };

// export default function Landing({
//   variant = "marketing",
//   userFullName,
//   routes = {
//   login: "/login",
//   signup: "/signup",
//   app: "/app",
//   promptLibrary: "/prompt-library",
//   smartgen: "/smartgen",
//   marketplace: "/prompt-marketplace",
//   dashboard: "/app",
//   profile: "/profile",
// },
//   showFooter = true,
// }: LandingProps) {
//   const navigate = useNavigate();
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [showTopBg, setShowTopBg] = useState(true);

//   const color = useMotionValue(COLORS_TOP[0]);
//   useEffect(() => {
//     animate(color, COLORS_TOP, {
//       ease: "easeInOut",
//       duration: 10,
//       repeat: Infinity,
//       repeatType: "mirror",
//     });
//   }, [color]);

//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePosition({
//         x: (e.clientX / window.innerWidth) * 2 - 1,
//         y: (e.clientY / window.innerHeight) * 2 - 1,
//       });
//     };
//     window.addEventListener("mousemove", handleMouseMove);
//     return () => window.removeEventListener("mousemove", handleMouseMove);
//   }, []);
//   useEffect(() => {
//     let ticking = false;

//     const updateTopBgVisibility = () => {
//       const bgEnd = document.getElementById("top-bg-end");

//       if (!bgEnd) {
//         setShowTopBg(true);
//         return;
//       }

//       const rect = bgEnd.getBoundingClientRect();

//       // Static image background visible until the What We Offer heading area.
//       // After that, the lower sections stay clean dark.
//       setShowTopBg(rect.bottom > 96);
//     };

//     const onScrollOrResize = () => {
//       if (ticking) return;

//       ticking = true;
//       window.requestAnimationFrame(() => {
//         updateTopBgVisibility();
//         ticking = false;
//       });
//     };

//     updateTopBgVisibility();
//     window.addEventListener("scroll", onScrollOrResize, { passive: true });
//     window.addEventListener("resize", onScrollOrResize);

//     return () => {
//       window.removeEventListener("scroll", onScrollOrResize);
//       window.removeEventListener("resize", onScrollOrResize);
//     };
//   }, []);

//   const border = useMotionTemplate`1px solid ${color}`;
//   const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;
//   const go = (path?: string) => path && navigate(path);
// const handleGetStarted = () => {
//   if (isAuthenticated) {
//     go(routes.app);        // ← dashboard ki jagah app
//   } else {
//     go(routes.signup || "/signup");
//   }
// };

//   // Steps
//   const [activeStep, setActiveStep] = useState(0);
//   const [hoveredStep, setHoveredStep] = useState<number | null>(null);
//  const [activeOffer, setActiveOffer] = useState<number | null>(null);
  

// // State add karo (existing states ke saath)
// const [activeOfferIdx, setActiveOfferIdx] = useState<number | null>(null);
// const [offerPhase,     setOfferPhase]     = useState<"grid" | "split">("grid");
// const [offerBusy,      setOfferBusy]      = useState(false);

// const openSplit = (idx: number) => {
//   if (offerBusy) return;
//   setOfferBusy(true);
//   setTimeout(() => {
//     setActiveOfferIdx(idx);
//     setOfferPhase("split");
//     setOfferBusy(false);
//   }, 215);
// };
// const closeSplit = () => {
//   if (offerBusy) return;
//   setOfferBusy(true);
//   setTimeout(() => {
//     setOfferPhase("grid");
//     setActiveOfferIdx(null);
//     setOfferBusy(false);
//   }, 200);
// };


 
// const [profileOpen, setProfileOpen] = useState(false);
// const [profileTab, setProfileTab] = useState<"profile" | "bank" | "billing">("profile");
//   // const [current, setCurrent] = useState(0);
//   const [activeButton, setActiveButton] = useState<"left" | "right" | null>(null);
//   const { isAuthenticated } = useAuth();

//   const { user, logout } = useAuth();
//   const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
//   const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

//   const displayName = useMemo(() => user?.name?.trim() || "", [user]);
//   const displayEmail = useMemo(() => user?.email || "", [user]);
//   const fullName = useMemo(() => {
//     if (displayName) return displayName;
//     if (displayEmail) return displayEmail.split("@")[0];
//     return "User";
//   }, [displayName, displayEmail]);

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   const themeBtn = (id: "light" | "dark" | "system", src: string, alt: string) => (
//     <button
//       type="button"
//       onClick={() => setTheme(id)}
//       className="inline-flex items-center justify-center rounded-full"
//       style={{
//         width: 28,
//         height: 28,
//         outline: theme === id ? "2px solid rgba(255,255,255,0.9)" : "none",
//       }}
//       aria-pressed={theme === id}
//       aria-label={alt}
//       title={alt}
//     >
//       <img src={src} alt="" className="w-4 h-4" />
//     </button>
//   );

// const PlanStyledName = ({ user, fullName }: { user: any; fullName: string }) => {
//   if (user?.plan === "pro") {
//     return (
//       <div className="flex items-center gap-2">
//         <span className="truncate font-semibold bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] text-transparent bg-clip-text">
//           Hello, {fullName}
//         </span>
//         <LuBadgeCheck
//           className="w-[22px] h-[22px]"
//           style={{ stroke: "url(#proGradient)", strokeWidth: 2 }}
//         />
//         <svg width="0" height="0">
//           <defs>
//             <linearGradient id="proGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//               <stop offset="0%" stopColor="#FF14EF" />
//               <stop offset="100%" stopColor="#1A73E8" />
//             </linearGradient>
//           </defs>
//         </svg>
//       </div>
//     );
//   }

//   if (user?.plan === "enterprise") {
//     return (
//       <div className="flex items-center gap-2">
//         <span className="truncate font-semibold bg-gradient-to-r from-[#FACC15] to-[#CA8A04] text-transparent bg-clip-text">
//           Hello, {fullName}
//         </span>
//         <LuBadgeCheck
//           className="w-[22px] h-[22px]"
//           style={{ stroke: "url(#enterpriseGradient)", strokeWidth: 2 }}
//         />
//         <svg width="0" height="0">
//           <defs>
//             <linearGradient id="enterpriseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//               <stop offset="0%" stopColor="#FACC15" />
//               <stop offset="100%" stopColor="#CA8A04" />
//             </linearGradient>
//           </defs>
//         </svg>
//       </div>
//     );
//   }

//   return (
//     <div className="flex items-center gap-2">
//       <span className="truncate font-semibold text-white">
//         Hello, {fullName}
//       </span>
//       <span className="px-2 py-0.5 text-xs rounded-md bg-gray-700 text-gray-300">
//         FREE
//       </span>
//     </div>
//   );
// };



//   /* ===== Feedback button placement logic =====
//      Goal: place a 50x130 vertical pill above the Smartgen/Marketplace CTAs,
//      and horizontally stick it to the right edge of the laptop screen. */
//   const [fbPos, setFbPos] = useState<{ top: number; left: number } | null>(null);

//     useEffect(() => {
//   const PILL_W = 50;             // feedback pill width
//   const PILL_H = 130;            // feedback pill height
//   const SAFE = 12;               // margin from edges
//   const BASE_WRAP_W = 1400;      // your max container width
//   const DESKTOP_OFFSET = 400;    // your desired desktop offset to the right of the screen

//   const calc = () => {
//     const screen = document.getElementById("product-screen-mask");
//     const ctas = document.getElementById("hero-ctas");
//     const section = document.getElementById("landing-root");
//     const wrap = document.getElementById("product-demo-wrap");
//     if (!screen || !ctas || !section) return;

//     const s = screen.getBoundingClientRect();
//     const c = ctas.getBoundingClientRect();
//     const root = section.getBoundingClientRect();
//     const wrapRect = wrap?.getBoundingClientRect();

//     // Scale the desktop offset with the actual wrapper width
//     const wrapWidth = wrapRect?.width ?? BASE_WRAP_W;
//     const scale = wrapWidth / BASE_WRAP_W;

//     const isMobile = window.innerWidth < 640;
//     // On mobile, keep it tight near the screen; on desktop, use your scaled 245px
//     const offset = isMobile ? 8 : Math.round(DESKTOP_OFFSET * scale);

//     // Compute left so the pill's RIGHT edge sits offset beyond the laptop screen's RIGHT edge
//     let left = Math.round((s.right - root.left) + offset - PILL_W);

//     // Clamp within the visible section to avoid disappearing off-screen
//     const maxLeft = root.width - PILL_W - SAFE;
//     const minLeft = SAFE;
//     left = Math.max(minLeft, Math.min(left, maxLeft));

//     // Place ABOVE CTAs: (top of CTAs) - (pill height) - gap
//     let top = Math.round((c.top - root.top) - PILL_H - 12);
//     const minTop = SAFE;
//     const maxTop = root.height - PILL_H - SAFE;
//     top = Math.max(minTop, Math.min(top, maxTop));

//     setFbPos({ top, left });
//   };

//   calc();
//   // Recompute on resize/scroll
//   window.addEventListener("resize", calc);
//   window.addEventListener("scroll", calc, { passive: true });

//   // Recompute when the product demo wrapper resizes (e.g., container width changes)
//   let ro: ResizeObserver | undefined;
//   const wrapEl = document.getElementById("product-demo-wrap");
//   if (wrapEl && "ResizeObserver" in window) {
//     ro = new ResizeObserver(calc);
//     ro.observe(wrapEl);
//   }

//   return () => {
//     window.removeEventListener("resize", calc);
//     window.removeEventListener("scroll", calc as any);
//     ro?.disconnect();
//   };
// }, []);




// const [feedbackOpen, setFeedbackOpen] = useState(false);
// const [rating, setRating] = useState<number>(0);
// const [hoverRating, setHoverRating] = useState<number>(0);

// const [fbForm, setFbForm] = useState<{
//   experience: string;
//   name: string;
//   role: string;
//   org: string;
//   file?: File | null;
// }>({
//   experience: "",
//   name: "",
//   role: "",
//   org: "",
//   file: null,
// });

// const MAX_CHARS = 500;

// // Esc to close
// useEffect(() => {
//   if (!feedbackOpen) return;
//   const onKey = (e: KeyboardEvent) => (e.key === "Escape" ? setFeedbackOpen(false) : null);
//   window.addEventListener("keydown", onKey);
//   return () => window.removeEventListener("keydown", onKey);
// }, [feedbackOpen]);

// const handleClear = () => {
//   setRating(0);
//   setHoverRating(0);
//   setFbForm({ experience: "", name: "", role: "", org: "", file: null });
// };

// const handleSubmitFeedback = async () => {
//   try {
//     const formData = new FormData();
//     formData.append("experience", fbForm.experience);
//     formData.append("name", fbForm.name);
//     formData.append("role", fbForm.role);
//     formData.append("orgOrCompany", fbForm.org);
//     formData.append("rating", String(rating));
//     if (fbForm.file) formData.append("profilePicture", fbForm.file);

//     const res = await fetch(`${API_BASE}/api/feedback`, {
//       method: "POST",
//       body: formData,
//     });

//     const data = await res.json();
//     console.log("[FEEDBACK SUBMIT RESPONSE]", data);

//     if (data.success) {
//       // Add new feedback to list
//       setFeedbacks((prev) => [data.feedback, ...prev]);
//       setFeedbackOpen(false);
//       handleClear();
//       setThankOpen(true);
//     } else {
//       alert("Failed to submit feedback: " + (data.error || "Unknown error"));
//     }
//   } catch (err) {
//     console.error("Submit feedback error:", err);
//   }
// };





// // near your other feedback state
// const [thankOpen, setThankOpen] = useState(false);
// // testimonials now come from saved feedbacks
// const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);


// useEffect(() => {
//   const fetchFeedbacks = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/api/feedback`);
//       const data = await res.json();
//       console.log("[FEEDBACK FETCH RESPONSE]", data);

//       if (data.success) {
//         setFeedbacks(data.feedbacks);
//       }
//     } catch (err) {
//       console.error("Fetch feedback error:", err);
//     }
//   };

//   fetchFeedbacks();
// }, []);


// // === Feedback types + storage helpers + avatar utils ===
// type Feedback = {
//   id: string;
//   when: number;
//   name: string;
//   role: string;
//   org: string;
//   rating: number;
//   experience: string;
//   avatar?: string; // data URL
// };

// const FB_KEY = "tokun_feedbacks";
// const MAX_FEEDBACKS = 100;
// const MAX_BYTES = 4_500_000; // ~4.5MB guard

// function loadFeedbacks(): Feedback[] {
//   try {
//     const raw = localStorage.getItem(FB_KEY);
//     return raw ? (JSON.parse(raw) as Feedback[]) : [];
//   } catch {
//     return [];
//   }
// }

// function saveFeedbacksSafe(list: Feedback[]) {
//   // keep last N & prune until size fits
//   const pruned = list.slice(-MAX_FEEDBACKS);
//   let json = JSON.stringify(pruned);
//   while (json.length > MAX_BYTES && pruned.length) {
//     pruned.shift();
//     json = JSON.stringify(pruned);
//   }
//   try {
//     localStorage.setItem(FB_KEY, json);
//   } catch (e) {
//     console.warn("localStorage save failed:", e);
//   }
// }

// async function fileToAvatarDataUrl(file: File, size = 64, quality = 0.72): Promise<string> {
//   const dataUrl = await new Promise<string>((res, rej) => {
//     const r = new FileReader();
//     r.onload = () => res(r.result as string);
//     r.onerror = rej;
//     r.readAsDataURL(file);
//   });

//   const img = await new Promise<HTMLImageElement>((res, rej) => {
//     const i = new Image();
//     i.onload = () => res(i);
//     i.onerror = rej;
//     i.src = dataUrl;
//   });

//   const canvas = document.createElement("canvas");
//   canvas.width = canvas.height = size;
//   const ctx = canvas.getContext("2d")!;
//   const minSide = Math.min(img.width, img.height);
//   const sx = (img.width - minSide) / 2;
//   const sy = (img.height - minSide) / 2;
//   ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
//   return canvas.toDataURL("image/jpeg", quality);
// }

// function initialsFrom(name: string) {
//   const parts = (name || "User").trim().split(/\s+/);
//   return (parts[0]?.[0] || "U") + (parts[1]?.[0] || "");
// }
// function colorFor(name: string) {
//   let h = 0;
//   for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
//   return `hsl(${h},70%,45%)`;
// }
// function svgInitialsAvatar(name: string, size = 64) {
//   const initials = initialsFrom(name).toUpperCase();
//   const bg = colorFor(name);
//   const svg =
//     `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
//     `<rect width='100%' height='100%' rx='${size / 2}' fill='${bg}'/>` +
//     `<text x='50%' y='54%' font-family='Inter,system-ui,sans-serif' font-size='${size * 0.42}' text-anchor='middle' fill='white' dy='.1em'>${initials}</text>` +
//     `</svg>`;
//   return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
// }


// const [current, setCurrent] = useState(0);

// const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";


// const FEATURE_PREVIEWS = [
//   {
//     icon: Zap,
//     title: "Prompt Optimization",
//     description:
//       "Reduce token usage by up to 60% while maintaining meaning and effectiveness across all LLM platforms.",
//     onClick: () => go(routes.smartgen),
//     mediaSrc: "/icons/srt.mp4",
//   },
//   {
//     icon: Sparkles,
//     title: "Smartgen Generator",
//     description:
//       "Transform simple ideas into powerful, optimized prompts with our AI-powered generation system.",
//     onClick: () => go(routes.smartgen),
//     mediaSrc: "/icons/srt.mp4",
//   },
//   {
//     icon: TrendingUp,
//     title: "Prompt Marketplace",
//     description:
//       "Built a great prompt? Trade it. Monetize your creativity and earn from your best prompt innovations.",
//     onClick: () => go(routes.marketplace),
//    mediaSrc: "/icons/srt.mp4",
//   },
//   {
//     icon: null,
//     image: "/icons/circle.png",
//     title: "Prompt Library",
//     description:
//       "Access categorized prompts for Coding, Design, Marketing, Video Creation, and more.",
//     onClick: () => go(routes.promptLibrary),
//     mediaSrc: "/icons/srt.mp4",
//   },
// ];


// const [previewIndex, setPreviewIndex] = useState<number | null>(null);
// const [previewPhase, setPreviewPhase] = useState<"idle" | "entering" | "open">("idle");
// const previewTimerRef = useRef<number | null>(null);

// const activeFeature =
//   previewIndex !== null ? FEATURE_PREVIEWS[previewIndex] : null;

// const openOfferPreview = (index: number) => {
//   if (previewPhase !== "idle") return;

//   if (previewTimerRef.current) {
//     window.clearTimeout(previewTimerRef.current);
//   }

//   setPreviewIndex(index);
//   setPreviewPhase("entering");

//   previewTimerRef.current = window.setTimeout(() => {
//     setPreviewPhase("open");
//   }, 520);
// };

// const closeOfferPreview = () => {
//   if (previewTimerRef.current) {
//     window.clearTimeout(previewTimerRef.current);
//     previewTimerRef.current = null;
//   }

//   setPreviewPhase("idle");
//   setPreviewIndex(null);
// };

// useEffect(() => {
//   return () => {
//     if (previewTimerRef.current) {
//       window.clearTimeout(previewTimerRef.current);
//     }
//   };
// }, []);


// const nextSlide = () => {
//   setCurrent((prev) => (prev + 1) % feedbacks.length);
// };

// const prevSlide = () => {
//   setCurrent((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);
// };

// // auto slide
// useEffect(() => {
//   if (feedbacks.length <= 1) return;

//   const interval = setInterval(() => {
//     nextSlide();
//   }, 4000);

//   return () => clearInterval(interval);
// }, [feedbacks]);




// const HOW_IT_WORKS_NUMBER_COLOR = "#3a3a3c";


// const HOW_IT_WORKS_STEPS = [
//   {
//     step: "Input Idea",
//     iconSrc: "/icons/Group 643.svg",
//     description: "Share your concept or requirement",
//   },
//   {
//     step: "SmartGen",
//     iconSrc: "/icons/Group 646.svg",
//     description: "AI generates optimized prompts",
//   },
//   {
//     step: "Optimize",
//     iconSrc: "/icons/wq.svg",
//     description: "Reduce tokens, improve quality",
//   },
//   {
//     step: "Save or Sale",
//     iconSrc: "/icons/Group 650.svg",
//     description: "Store in library or marketplace",
//   },
//   {
//     step: "Earn",
//     iconSrc: "/icons/Group.svg",
//     description: "Monetize your best prompts",
//   },
// ];


//   return (
//     <motion.section
//       id="landing-root"
//       style={{ backgroundColor: "#030406" }}
//    className="relative min-h-screen text-gray-200 bg-[#030406]"
//     >
//       {/* Fixed top background: static while scrolling, hidden after What We Offer */}
//       <div
//         aria-hidden
//         className={`pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-300 ${
//           showTopBg ? "opacity-100" : "opacity-0"
//         }`}
//       >
//         <img
//           src="/icons/homeban.png"
//           alt="Tokun neon background"
//           className="select-none absolute -top-24 right-0 w-[72vw] max-w-none opacity-90 mix-blend-screen"
//         />

//         <div className="absolute left-1/2 top-24 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(191,44,255,0.22),rgba(0,0,0,0))] blur-3xl" />

//         <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(139,92,246,0.12),rgba(0,0,0,0))]" />
//       </div>

//       {/* HEADER */}
// <header className="sticky top-0 z-50 w-full relative">


//   <div className="px-4 md:px-6 lg:px-8 py-4 lg:py-6">
//     <div className="container mx-auto flex items-center justify-between">

//       {/* Logo */}
//       <div className="flex items-center gap-2 sm:gap-3 min-w-0">
//         <img
//   src="/icons/Tokun.png"
//   alt="Tokun.world Logo"
//   className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain transition-transform duration-200 hover:scale-105"
// />
//       </div>

//       {/* Right Section */}
//       <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
//         {variant === "marketing" ? (
//           <>
//             <button
//               onClick={() => go(routes.login)}
//               className="hidden sm:block text-white/95 hover:text-white transition-colors"
//               style={{ fontSize: 14, fontWeight: 600 }}
//             >
//               Login
//             </button>
// <button
//   type="button"
//   onClick={handleGetStarted}
//   className="inline-flex items-center justify-center rounded-full hover:opacity-95 transition-opacity"
//   style={{
//     height: 40,
//     padding: "0 16px",
//     borderRadius: 200,
//     background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
//     color: "#FFFFFF",
//     fontFamily: "Inter, system-ui, Arial, sans-serif",
//     fontWeight: 600,
//     fontSize: 13,
//     lineHeight: "20px",
//     gap: 6,
//   }}
// >
//   <span>Get Started</span>
//   <span
//     aria-hidden
//     className="inline-flex items-center justify-center rounded-full bg-white"
//     style={{ width: 22, height: 22 }}
//   >
//     <MdKeyboardArrowRight size={14} color="black" />
//   </span>
// </button>
//           </>
//        ) : (
//   <DropdownMenu>
//     <DropdownMenuTrigger asChild>
//       <button
//         type="button"
//         aria-label="Account menu"
//         title={fullName}
//         className="group inline-flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#2C2C2C] text-white whitespace-nowrap"
//       >
//         {/* NAME + PLAN → hidden on mobile */}
//         <div className="hidden sm:flex items-center gap-2">

//           {/* PRO PLAN */}
//           {user?.plan === "pro" && (
//             <>
//               <span className="truncate font-semibold bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] text-transparent bg-clip-text">
//                 Hello, {fullName}
//               </span>
//               <LuBadgeCheck
//                 className="w-[22px] h-[22px]"
//                 style={{ stroke: "url(#proGradient)", strokeWidth: 2, fill: "none" }}
//               />
//               <svg width="0" height="0">
//                 <defs>
//                   <linearGradient id="proGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//                     <stop offset="0%" stopColor="#FF14EF" />
//                     <stop offset="100%" stopColor="#1A73E8" />
//                   </linearGradient>
//                 </defs>
//               </svg>
//             </>
//           )}

//           {/* ENTERPRISE PLAN */}
//           {user?.plan === "enterprise" && (
//             <>
//               <span className="truncate font-semibold bg-gradient-to-r from-[#FACC15] to-[#CA8A04] text-transparent bg-clip-text">
//                 Hello, {fullName}
//               </span>
//               <LuBadgeCheck
//                 className="w-[22px] h-[22px]"
//                 style={{ stroke: "url(#enterpriseGradient)", strokeWidth: 2, fill: "none" }}
//               />
//               <svg width="0" height="0">
//                 <defs>
//                   <linearGradient id="enterpriseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//                     <stop offset="0%" stopColor="#FACC15" />
//                     <stop offset="100%" stopColor="#CA8A04" />
//                   </linearGradient>
//                 </defs>
//               </svg>
//             </>
//           )}

//           {/* FREE PLAN */}
//           {(!user?.plan || user?.plan === "free") && (
//             <>
//               <span className="truncate font-semibold text-white">
//                 Hello, {fullName}
//               </span>
//               <span className="px-2 py-0.5 text-xs rounded-md bg-gray-700 text-gray-300">
//                 FREE
//               </span>
//             </>
//           )}
//         </div>

//         {/* DROPDOWN ICON → always visible */}
//         <span className="shrink-0 grid place-items-center rounded-full bg-white/95 w-6 h-6">
//           <ChevronDown className="w-3.5 h-3.5 text-black" />
//         </span>
//       </button>
//     </DropdownMenuTrigger>

//     <DropdownMenuContent
//       sideOffset={10}
//       align="end"
//       onCloseAutoFocus={(e) => e.preventDefault()}
//       className="no-scrollbar overflow-y-auto"
//       style={{
//         width: 240,
//         height: 650,
//         maxHeight: "85vh",
//         padding: 10,
//         borderRadius: 16,
//         background: "#21212180",
//         backdropFilter: "blur(20px)",
//         WebkitBackdropFilter: "blur(20px)",
//         border: "1px solid rgba(255,255,255,0.10)",
//         color: "#ffffff",
//         fontFamily: "Inter, system-ui, Arial, sans-serif",
//         fontWeight: 400,
//         fontStyle: "normal",
//       }}
//     >
//       <div className="flex flex-col h-full">
//         {/* Name / email */}
//         <div className="space-y-2">
//           <button
//             type="button"
//             onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); navigate(routes.profile || "/profile"); }}
//             className="block text-left text-white hover:underline"
//             style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 16, lineHeight: "100%" }}
//           >
//             {displayName || "Your Name"}
//           </button>
//           <div className="text-white/70" style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 12, lineHeight: "100%" }}>
//             {displayEmail || "your@email.com"}
//           </div>
//           <button
//             type="button"
//             // Landing.tsx mein Set up profile button ka onMouseDown
// onMouseDown={(e) => {
//   e.preventDefault();
//   e.stopPropagation();
//   const id = user?._id || user?.id;
//   if (id) {
//     navigate(`/profile/${id}`);
//   } else {
//     navigate(routes.profile || "/profile");
//   }
// }}
//             className="w-full mt-2 text-white"
//             style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 16, lineHeight: "100%", height: 39, borderRadius: 6, background: "#313131" }}
//           >
//             Set up profile
//           </button>
//         </div>



//           {/* My Wallet */}
//         <button
//           type="button"
//           onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); navigate("/wallet"); }}
//           className="w-full mt-6 flex shrink-0 items-center justify-center gap-2 text-white"
//           style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 16, height: 38, minHeight: 38, borderRadius: 6, background: "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)" }}
//         >
//           <img src="/icons/wallet.svg" alt="" className="w-4 h-4 shrink-0" />
//           <span>My Wallet</span>
//         </button>

        

//         {/* Dashboard Button */}
// <button
//   type="button"
//   onMouseDown={(e) => {
//   e.preventDefault();
//   e.stopPropagation();
//   navigate("/self-dash");
// }}

//   className="w-full mt-6 flex shrink-0 items-center justify-center gap-2 text-white"
//   style={{
//     fontFamily: "Inter",
//     fontWeight: 400,
//     fontSize: 16,
//     height: 38,
//     minHeight: 38,
//     borderRadius: 6,
//     background: "#313131",
//   }}
// >
//   <img src="/icons/self.svg" alt="" className="w-4 h-4 shrink-0" />
//   <span>Dashboard</span>
// </button>


      

//         {/* Settings */}
//        {/* Settings */}
// <button
//   type="button"
//   onClick={() => { setProfileOpen(true); setProfileTab("profile"); }}
//   className="w-full mt-6 flex items-center justify-between py-2 text-white border-t border-white/10"
//   style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 16 }}
// >
//   <span className="flex items-center gap-2">
//     <Settings className="w-5 h-5" />
//     Settings
//   </span>
//   <span className="text-lg leading-none">↗</span>
// </button>

//         {/* Lifetime Tokun saved */}
//         <div className="mt-4">
//           <div className="mb-2 text-center text-white/90" style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 16 }}>
//             Lifetime Tokun saved
//           </div>
//           <div style={{ width: "100%", height: 100, background: "#2A2A2A", borderRadius: 6, padding: "8px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
//             <div style={{ width: 56, height: 56, borderRadius: "50%", background: "conic-gradient(#FF14EF 0 60deg, #1A73E8 60deg 210deg, #5CE1E6 210deg 360deg)", display: "grid", placeItems: "center" }}>
//               <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#2A2A2A", display: "grid", placeItems: "center", color: "#fff", fontWeight: 500, fontSize: 14 }}>
//                 {user?.lifetimeTokunSaved ?? 150}
//               </div>
//             </div>
//             <div className="text-xs text-white/70">Total tokun saved till date</div>
//           </div>
//         </div>

//         {/* Links */}
//         <div className="grid shrink-0 gap-2 pt-2">
//           {[

//             { label: "Purchase History", onClick: () => navigate("/prompty-history?p=purchased"), icon: "↗" },
//             { label: "Upload History",   onClick: () => navigate("/prompty-history?p=uploaded"), icon: "↗" },
//             { label: "Pricing",          onClick: () => navigate("/subscription"), icon: "↗" },
//             { label: "Support",          onClick: () => navigate("/support"), icon: "↗" },
//             { label: "Logout",           onClick: handleLogout, icon: "↩" },
//           ].map((item) => (
//             <button
//               key={item.label}
//               type="button"
//               onClick={item.onClick}
//               className="w-full flex items-center justify-between py-2 text-left whitespace-nowrap"
//             >
//               <span style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 14 }}>{item.label}</span>
//               <span aria-hidden style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 14 }}>{item.icon}</span>
//             </button>
//           ))}
//         </div>

//         {/* Footer */}
//         <div className="mt-auto border-t border-white/10 flex items-center justify-between pt-4 text-xs text-gray-400">
//           <span>Privacy</span><span>•</span><span>Terms</span><span>•</span><span>Copyright</span>
//         </div>
//       </div>
//     </DropdownMenuContent>
//   </DropdownMenu>
// )}
//       </div>
//     </div>
//   </div>
// </header>

//       {/* MAIN */}
// <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-0 sm:pt-2 pb-0">
//         {/* FIRST SCREEN */}
//         <div className="min-h-[calc(100vh-150px)] flex flex-col">
//         {/* HERO */}
//         <div className="text-center space-y-5 mb-10 sm:mb-12">
//           {/* <div className="flex justify-center">
//             <GradientBadge label="Trusted by industry leaders" showIcon />
//           </div> */}

//           <div
//             className="transform transition-transform duration-300 ease-out"
//             style={{
//               transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`,
//             }}
//           >
//            <h1 className="text-6xl md:text-8xl font-bold mb-3 tracking-tight flex justify-center">
//   <span className="relative inline-flex items-center justify-center select-none">
//     {/* ambient glow behind full word */}
//     <motion.span
//       aria-hidden
//       className="absolute inset-0 blur-3xl"
//       style={{
//         background:
//           "radial-gradient(circle at 50% 50%, rgba(255,20,239,0.28) 0%, rgba(26,115,232,0.22) 38%, rgba(0,0,0,0) 72%)",
//       }}
//       animate={{
//         opacity: [0.35, 0.7, 0.35],
//         scale: [0.96, 1.04, 0.96],
//       }}
//       transition={{
//         duration: 4.5,
//         repeat: Infinity,
//         ease: "easeInOut",
//       }}
//     />

//     {/* whole word breathing */}
//     <motion.span
//       className="relative inline-flex items-center"
//       animate={{
//         y: [0, -2, 0],
//         scale: [1, 1.01, 1],
//       }}
//       transition={{
//         duration: 4,
//         repeat: Infinity,
//         ease: "easeInOut",
//       }}
//     >
//       {/* T */}
//       <motion.span
//         className="relative inline-block bg-clip-text text-transparent"
//         style={{
//           backgroundImage:
//             "linear-gradient(180deg, #ffffff 0%, #dbe8ff 38%, #7dd3fc 72%, #ffffff 100%)",
//           WebkitBackgroundClip: "text",
//           backgroundClip: "text",
//           textShadow: "0 0 18px rgba(125,211,252,0.18)",
//         }}
//         animate={{
//           opacity: [1, 0.92, 1],
//           filter: [
//             "drop-shadow(0 0 4px rgba(125,211,252,0.14))",
//             "drop-shadow(0 0 10px rgba(26,115,232,0.18))",
//             "drop-shadow(0 0 4px rgba(125,211,252,0.14))",
//           ],
//         }}
//         transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
//       >
//         T
//       </motion.span>

//       {/* O */}
//       <motion.span
//         className="relative inline-block bg-clip-text text-transparent"
//         style={{
//           backgroundImage:
//             "linear-gradient(180deg, #ffffff 0%, #e8dcff 34%, #c084fc 68%, #ffffff 100%)",
//           WebkitBackgroundClip: "text",
//           backgroundClip: "text",
//         }}
//         animate={{
//           opacity: [0.95, 1, 0.95],
//           rotateZ: [0, 0.2, 0],
//         }}
//         transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
//       >
//         O
//       </motion.span>

//       {/* K */}
//       <motion.span
//         className="relative inline-block bg-clip-text text-transparent"
//         style={{
//           backgroundImage:
//             "linear-gradient(180deg, #ffffff 0%, #d9dbff 30%, #60a5fa 65%, #ffffff 100%)",
//           WebkitBackgroundClip: "text",
//           backgroundClip: "text",
//         }}
//         animate={{
//           opacity: [1, 0.94, 1],
//         }}
//         transition={{ duration: 2.9, repeat: Infinity, ease: "easeInOut" }}
//       >
//         K
//       </motion.span>

//       {/* U special AI core */}
//       <span className="relative inline-flex items-center justify-center mx-[4px]">
//         {/* outer ring */}
//         <motion.span
//           className="absolute rounded-full"
//           style={{
//             width: "1.12em",
//             height: "1.12em",
//             border: "1px solid rgba(125,211,252,0.42)",
//             boxShadow:
//               "0 0 16px rgba(26,115,232,0.25), inset 0 0 12px rgba(255,20,239,0.16)",
//           }}
//           animate={{
//             scale: [0.88, 1.16, 0.88],
//             opacity: [0.35, 0.9, 0.35],
//           }}
//           transition={{
//             duration: 2.4,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />

//         {/* inner ring */}
//         <motion.span
//           className="absolute rounded-full"
//           style={{
//             width: "0.78em",
//             height: "0.78em",
//             border: "1px solid rgba(255,20,239,0.35)",
//           }}
//           animate={{
//             scale: [1.15, 0.92, 1.15],
//             opacity: [0.15, 0.55, 0.15],
//           }}
//           transition={{
//             duration: 2,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />

//         {/* orbit dot pink */}
//         <motion.span
//           className="absolute rounded-full"
//           style={{
//             width: 7,
//             height: 7,
//             background: "#FF14EF",
//             boxShadow: "0 0 14px rgba(255,20,239,0.9)",
//             top: "50%",
//             left: "50%",
//             marginLeft: -3.5,
//             marginTop: -3.5,
//           }}
//           animate={{
//             x: [0, 16, 0, -16, 0],
//             y: [-18, 0, 18, 0, -18],
//             scale: [0.9, 1.1, 0.9, 1.1, 0.9],
//           }}
//           transition={{
//             duration: 4.2,
//             repeat: Infinity,
//             ease: "linear",
//           }}
//         />

//         {/* orbit dot blue */}
//         <motion.span
//           className="absolute rounded-full"
//           style={{
//             width: 6,
//             height: 6,
//             background: "#1A73E8",
//             boxShadow: "0 0 14px rgba(26,115,232,0.95)",
//             top: "50%",
//             left: "50%",
//             marginLeft: -3,
//             marginTop: -3,
//           }}
//           animate={{
//             x: [0, -14, 0, 14, 0],
//             y: [16, 0, -16, 0, 16],
//             scale: [1.05, 0.85, 1.05, 0.85, 1.05],
//           }}
//           transition={{
//             duration: 3.6,
//             repeat: Infinity,
//             ease: "linear",
//           }}
//         />

//         {/* U letter */}
//         <motion.span
//           className="relative inline-block bg-clip-text text-transparent"
//           style={{
//             backgroundImage:
//               "linear-gradient(180deg, #ffffff 0%, #67e8f9 30%, #1A73E8 64%, #FF14EF 100%)",
//             WebkitBackgroundClip: "text",
//             backgroundClip: "text",
//             textShadow: "0 0 22px rgba(26,115,232,0.28)",
//           }}
//           animate={{
//             y: [0, -3, 0],
//             filter: [
//               "drop-shadow(0 0 8px rgba(26,115,232,0.22))",
//               "drop-shadow(0 0 18px rgba(255,20,239,0.35))",
//               "drop-shadow(0 0 8px rgba(26,115,232,0.22))",
//             ],
//           }}
//           transition={{
//             duration: 2.2,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         >
//           U
//         </motion.span>
//       </span>

//       {/* N */}
//       <motion.span
//         className="relative inline-block bg-clip-text text-transparent"
//         style={{
//           backgroundImage:
//             "linear-gradient(180deg, #ffffff 0%, #f0e9ff 34%, #f472b6 70%, #ffffff 100%)",
//           WebkitBackgroundClip: "text",
//           backgroundClip: "text",
//         }}
//         animate={{
//           opacity: [0.96, 1, 0.96],
//         }}
//         transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut" }}
//       >
//         N
//       </motion.span>

//       {/* shimmer sweep */}
//       <motion.span
//         aria-hidden
//         className="pointer-events-none absolute inset-0"
//         style={{
//           background:
//             "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 48%, transparent 100%)",
//           mixBlendMode: "screen",
//           filter: "blur(10px)",
//         }}
//         animate={{ x: ["-130%", "130%"] }}
//         transition={{
//           duration: 2.6,
//           repeat: Infinity,
//           ease: "linear",
//           repeatDelay: 1.1,
//         }}
//       />

//       {/* top scanner line */}
//       <motion.span
//         aria-hidden
//         className="pointer-events-none absolute left-0 right-0 h-[2px] rounded-full"
//         style={{
//           top: "16%",
//           background:
//             "linear-gradient(90deg, transparent 0%, rgba(103,232,249,0.85) 50%, transparent 100%)",
//           boxShadow: "0 0 14px rgba(103,232,249,0.5)",
//         }}
//         animate={{
//           x: ["-12%", "12%", "-12%"],
//           opacity: [0.25, 0.95, 0.25],
//         }}
//         transition={{
//           duration: 3.2,
//           repeat: Infinity,
//           ease: "easeInOut",
//         }}
//       />
//     </motion.span>

//     {/* bottom neon reflection */}
//     <motion.span
//       aria-hidden
//       className="absolute left-[8%] right-[8%] -bottom-2 h-4 rounded-full blur-xl"
//       style={{
//         background:
//           "linear-gradient(90deg, rgba(26,115,232,0.0) 0%, rgba(26,115,232,0.18) 30%, rgba(255,20,239,0.22) 70%, rgba(255,20,239,0.0) 100%)",
//       }}
//       animate={{
//         opacity: [0.25, 0.55, 0.25],
//         scaleX: [0.96, 1.03, 0.96],
//       }}
//       transition={{
//         duration: 3.4,
//         repeat: Infinity,
//         ease: "easeInOut",
//       }}
//     />
//   </span>
// </h1>



// {/* <img
//   src="/icons/tokun-logo-transparent.png"
//   alt="Tokun"
//   className="w-[320px] sm:w-[440px] md:w-[560px] lg:w-[680px] object-contain"
// /> */}

//             <h2 className="text-3xl md:text-4xl font-bold mb-4">
//               Enter the Promptverse
//             </h2>
//             <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
//               Optimize your LLM prompts, generate better outcomes, and monetize your best prompts—all in one place.
//             </p>
//           </div>
//         </div>

//  {/* CTAs */}
// <div
//   id="hero-ctas"
//   className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-2 sm:mt-8 mb-10"
// >
//   {/* Smartgen + Arrow */}
//   <div className="relative">
//     <motion.img
//       src="/icons/arr.png"
//       alt="arrow highlight"
//       className="pointer-events-none select-none absolute -top-6 -left-8 w-9 sm:-top-7 sm:-left-10 sm:w-10"
//     />
//     <motion.button
//       onClick={() => go(routes.smartgen)}
//       whileHover={{ scale: 1.05 }}
//       className="relative w-[200px] sm:w-[220px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold shadow-2xl border border-white/10 backdrop-blur-md flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg"
//       style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
//     >
//       <div className="absolute inset-0 rounded-full bg-white opacity-10 blur-[6px] pointer-events-none" />
//       <span>Try Smartgen</span>
//       <span
//         aria-hidden
//         className="inline-flex items-center justify-center rounded-full bg-white"
//         style={{ width: 24, height: 24 }}
//       >
//         <MdKeyboardArrowRight size={14} color="black" />
//       </span>
//     </motion.button>

//     {/* <motion.button
//   onClick={() => go(routes.smartgen)}
//   whileHover={{ scale: 1.05 }}
//   className="steam-btn relative w-[200px] sm:w-[220px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold"
//   style={{ borderRadius: 9999 }}
// >
//   <span
//     className="steam-btn-inner backdrop-blur-md border border-white/10"
//     style={{
//       borderRadius: 9999,
//       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
//       boxShadow: "0 10px 30px rgba(255,20,239,0.18)",
//       gap: 12,
//       fontSize: "inherit",
//     }}
//   >
//     <span>Try Smartgen</span>
//     <span
//       aria-hidden
//       className="inline-flex items-center justify-center rounded-full bg-white"
//       style={{ width: 24, height: 24 }}
//     >
//       <MdKeyboardArrowRight size={14} color="black" />
//     </span>
//   </span>
// </motion.button> */}
//   </div>

//  <motion.button
//     onClick={() => go(routes.marketplace)}
//     whileHover={{ 
//       scale: 1.05,
//       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
//       borderColor: "transparent"
//     }}
//     initial={{
//       background: "transparent",
//       borderColor: "rgba(255,255,255,0.25)"
//     }}
//     className="relative w-[200px] sm:w-[220px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold shadow-2xl backdrop-blur-md flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg"
//     style={{ 
//       border: "1px solid rgba(255,255,255,0.25)"
//     }}
//   >
//     Prompt Marketplace
//   </motion.button>


//   {/* <motion.button
//   onClick={() => go(routes.marketplace)}
//   whileHover={{ scale: 1.05 }}
//   className="steam-btn relative w-[200px] sm:w-[220px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold"
//   style={{ borderRadius: 9999 }}
// >
//   <span
//     className="steam-btn-inner backdrop-blur-md border border-white/10"
//     style={{
//       borderRadius: 9999,
//       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
//       boxShadow: "0 10px 30px rgba(255,20,239,0.18)",
//     }}
//   >
//     Prompt Marketplace
//   </span>
// </motion.button> */}
// </div>
//         {/* STATS */}
//         {/* <section className="mt-10">
//           <div className="container mx-auto px-6">
//             <div className="flex flex-col md:flex-row justify-center items-center text-center gap-8 font-[Inter]">
//               <div className="flex flex-col items-center">
//                 <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px", fontWeight: 500 }}>
//                   Prompts Optimized
//                 </div>
//                 <div className="text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
//                   50k
//                 </div>
//               </div>

//               <div className="hidden md:block h-[19px] w-px bg-white/40 mx-4"></div>

//               <div className="flex flex-col items-center">
//                 <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px" }}>
//                   Average Token Reduction
//                 </div>
//                 <div className="text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
//                   60%
//                 </div>
//               </div>

//               <div className="hidden md:block h-[19px] w-px bg-white/40 mx-4"></div>

//               <div className="flex flex-col items-center">
//                 <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px" }}>
//                   User Rating
//                 </div>
//                 <div className="flex items-center gap-2 text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
//                   <Star className="h-5 w-5 text-white" />
//                   4.9
//                 </div>
//               </div>

//               <div className="hidden md:block h-[19px] w-px bg-white/40 mx-4"></div>

//               <div className="flex flex-col items-center">
//                 <div className="text-white/90 mb-2 font-medium" style={{ fontSize: "20px", lineHeight: "24px" }}>
//                   Support Available
//                 </div>
//                 <div className="text-white font-semibold" style={{ fontSize: "16px", lineHeight: "20px" }}>
//                   24/7
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section> */}


// <section className="mt-12">
//   <div className="container mx-auto px-4 sm:px-6">
//     <div className="grid grid-cols-2 md:flex md:flex-row justify-center items-start gap-6 md:gap-10 font-[Inter]">
//       <div className="flex flex-col items-center">
//         <div className="text-white/90 mb-2 font-medium text-xs sm:text-sm md:text-base">
//           Prompts Optimized
//         </div>
//         <div className="text-white font-extrabold text-2xl md:text-4xl tracking-tight">
//           50k
//         </div>
//       </div>

//       <div
//         aria-hidden
//         className="hidden md:block shrink-0 mt-[2px]"
//         style={{
//           width: 0.5,
//           height: 19,
//           background: "#FFFFFF",
//           opacity: 0.4,
//         }}
//       />

//       <div className="flex flex-col items-center">
//         <div className="text-white/90 mb-2 font-medium text-xs sm:text-sm md:text-base">
//           Token Reduction
//         </div>
//         <div className="text-white font-extrabold text-2xl md:text-4xl tracking-tight">
//           60%
//         </div>
//       </div>

//       <div
//         aria-hidden
//         className="hidden md:block shrink-0 mt-[2px]"
//         style={{
//           width: 0.5,
//           height: 19,
//           background: "#FFFFFF",
//           opacity: 0.4,
//         }}
//       />

//       <div className="flex flex-col items-center">
//         <div className="text-white/90 mb-2 font-medium text-xs sm:text-sm md:text-base">
//           User Rating
//         </div>
//         <div className="flex items-center gap-2 text-white font-extrabold text-2xl md:text-4xl tracking-tight">
//           <Star className="h-5 w-5 md:h-7 md:w-7 text-white" />
//           4.9
//         </div>
//       </div>

//       <div
//         aria-hidden
//         className="hidden md:block shrink-0 mt-[2px]"
//         style={{
//           width: 0.5,
//           height: 19,
//           background: "#FFFFFF",
//           opacity: 0.4,
//         }}
//       />

//       <div className="flex flex-col items-center">
//         <div className="text-white/90 mb-2 font-medium text-xs sm:text-sm md:text-base">
//           Support
//         </div>
//         <div className="text-white font-extrabold text-2xl md:text-4xl tracking-tight">
//           24/7
//         </div>
//       </div>
//     </div>
//   </div>
// </section>
// {/* 
//              <div className="mt-12">
//   <TickerSection />
// </div> */}

//        <div className="mt-auto pb-6 flex flex-col items-center justify-center text-center select-none">
//   <Mouse className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-white/70" strokeWidth={2.25} />
//   <div className="mt-2 text-white/80" style={{ fontFamily: "Inter, ui-sans-serif, system-ui", fontSize: 12, lineHeight: "16px" }}>
//     Scroll down
//   </div>
//   <motion.div className="mt-2" animate={{ y: [0, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
//     <MoveDown className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 text-white/80" strokeWidth={2.25} />
//   </motion.div>
// </div>
//         </div>

// {/* ══════════ OFFER SECTION ══════════ */}
// <div className="mt-14">
//   <AnimatePresence mode="wait">
//     {/* ─── GRID VIEW ─── */}
//     {offerPhase === "grid" && (
//       <motion.div
//         key="offer-grid"
//         initial={{ opacity: 0, scale: 0.94, y: 22 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.96, y: 6 }}
//         transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
//       >
//         <h2
//           id="top-bg-end"
//           className="text-3xl md:text-5xl font-extrabold text-center mb-12 tracking-tight"
//           style={{ letterSpacing: "-0.03em" }}
//         >
//           What We Offer
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
//           {FEATURE_PREVIEWS.map((feature, i) => {
//             const Icon = feature.icon;

//             return (
//               <motion.button
//                 key={feature.title}
//                 type="button"
//                 onClick={() => openSplit(i)}
//                 initial={{ opacity: 0, scale: 0.88, y: 18 }}
//                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                 transition={{
//                   duration: 0.45,
//                   ease: [0.22, 1, 0.36, 1],
//                   delay: i * 0.07,
//                 }}
//                 whileHover={{
//                   y: -10,
//                   scale: 1.025,
//                   transition: {
//                     type: "spring",
//                     stiffness: 280,
//                     damping: 18,
//                   },
//                 }}
//                 whileTap={{ scale: 0.97 }}
//                 className="group relative rounded-[28px] p-[1px] text-left overflow-hidden h-full"
//                 style={{
//                   background: "linear-gradient(160deg,#252528,#0d0e12)",
//                 }}
//               >
//                 {/* Glow behind border */}
//                 <div
//                   className="pointer-events-none absolute -inset-px rounded-[29px] opacity-0 group-hover:opacity-100 transition-opacity duration-400"
//                   style={{
//                     background: "linear-gradient(135deg,#FF14EF,#1A73E8)",
//                     filter: "blur(14px)",
//                     zIndex: 0,
//                   }}
//                 />

//                 {/* Border itself */}
//                 <div
//                   className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-350"
//                   style={{
//                     background: "linear-gradient(135deg,#FF14EF,#1A73E8)",
//                   }}
//                 />

//                 <div className="relative rounded-[26px] bg-[#030406] group-hover:bg-[#06070d] transition-colors duration-300 p-6 flex flex-col gap-3 h-full z-[1]">
//                   {/* Number - same as How It Works */}
//                   <span
//                     className="absolute top-3 right-3"
//                   style={{
//                       width: 26,
//                       height: 24,
//                       opacity: 1,
//                       fontFamily: "Inter, ui-sans-serif, system-ui",
//                       fontWeight: 800,
//                       fontStyle: "normal",
//                       fontSize: 20,
//                       lineHeight: "100%",
//                       letterSpacing: "0%",
//                       textAlign: "right",
//                       color: "#3a3a3c",
//                     }}

//                   >
//                     {String(i + 1).padStart(2, "0")}
//                   </span>

//                   {/* Icon box */}
//                   <div
//                     className="w-11 h-11 rounded-[14px] flex items-center justify-center transition-all duration-300 group-hover:bg-white/8"
//                     style={{
//                       background: "rgba(255,255,255,0.04)",
//                       border: "1px solid rgba(255,255,255,0.07)",
//                     }}
//                   >
//                     {feature.image ? (
//                       <img
//                         src={feature.image}
//                         className="h-6 w-6 object-contain"
//                         alt=""
//                       />
//                     ) : Icon ? (
//                       <>
//                         <Icon
//                           className="h-6 w-6"
//                           style={{
//                             stroke: "url(#ig-grid)",
//                             strokeWidth: 1.7,
//                             fill: "none",
//                           }}
//                         />
//                         <svg width="0" height="0" aria-hidden>
//                           <defs>
//                             <linearGradient
//                               id="ig-grid"
//                               x1="0"
//                               y1="0"
//                               x2="0"
//                               y2="1"
//                             >
//                               <stop offset="0%" stopColor="#1A73E8" />
//                               <stop offset="100%" stopColor="#FF14EF" />
//                             </linearGradient>
//                           </defs>
//                         </svg>
//                       </>
//                     ) : null}
//                   </div>

//                   <div
//                     className="font-bold text-[17px] text-white tracking-tight leading-snug"
//                     style={{ letterSpacing: "-0.02em" }}
//                   >
//                     {feature.title}
//                   </div>

//                   <div className="text-[11.5px] text-white/55 leading-relaxed flex-1">
//                     {feature.description}
//                   </div>

//                   {/* Explore CTA */}
//                   <div className="mt-auto flex items-center gap-1.5 text-[11px] font-semibold text-white/35 group-hover:text-white/75 transition-colors duration-300 tracking-wide">
//                     <span>Explore</span>
//                     <div className="w-[22px] h-[22px] rounded-full border border-current flex items-center justify-center text-[11px] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[#FF14EF] group-hover:to-[#1A73E8] group-hover:border-transparent group-hover:text-white">
//                       →
//                     </div>
//                   </div>
//                 </div>
//               </motion.button>
//             );
//           })}
//         </div>
//       </motion.div>
//     )}

//     {/* ─── SPLIT VIEW ─── */}
//     {offerPhase === "split" && (
//       <motion.div
//         key="offer-split"
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.95 }}
//         transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
//       >
//         <h2
//           id="top-bg-end"
//           className="text-3xl md:text-5xl font-extrabold text-center mb-10 tracking-tight"
//           style={{ letterSpacing: "-0.03em" }}
//         >
//           What We Offer
//         </h2>

//         <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-3.5 max-w-[1100px] mx-auto items-stretch">
//           {/* LEFT — mini cards */}
//           <div className="flex flex-col gap-2 h-full">
//             {FEATURE_PREVIEWS.map((feature, i) => {
//               const Icon = feature.icon;
//               const isAct = i === activeOfferIdx;

//               return (
//                 <motion.button
//                   key={feature.title}
//                   type="button"
//                   onClick={() => !offerBusy && setActiveOfferIdx(i)}
//                   whileHover={
//                     !isAct
//                       ? {
//                           x: 6,
//                           transition: {
//                             type: "spring",
//                             stiffness: 320,
//                             damping: 20,
//                           },
//                         }
//                       : {}
//                   }
//                   whileTap={{ scale: 0.98 }}
//                   className="relative rounded-[14px] p-[1px] text-left overflow-hidden flex-1 flex flex-col"
//                   style={{
//                     background: isAct
//                       ? "linear-gradient(135deg,#FF14EF,#1A73E8)"
//                       : "linear-gradient(160deg,#1e1e22,#0d0e12)",
//                   }}
//                 >
//                   {/* Active left bar */}
//                   {isAct && (
//                     <motion.div
//                       layoutId="active-bar"
//                       className="absolute left-0 top-[10%] bottom-[10%] w-[2px] rounded-full z-10"
//                       style={{
//                         background:
//                           "linear-gradient(to bottom,#FF14EF,#1A73E8)",
//                       }}
//                       transition={{
//                         type: "spring",
//                         stiffness: 400,
//                         damping: 30,
//                       }}
//                     />
//                   )}

//                   <div
//                     className="relative rounded-[12px] p-3 pr-9 flex items-start gap-2.5 h-full transition-colors duration-250"
//                     style={{
//                       background: isAct ? "rgba(8,16,36,.88)" : "#030406",
//                     }}
//                   >
//                     {/* Number - same as How It Works */}
//                     <span
//                       className="absolute top-3 right-3"
//                       style={{
//                         width: 26,
//                         height: 24,
//                         opacity: 1,
//                         fontFamily: "Inter, ui-sans-serif, system-ui",
//                         fontWeight: 800,
//                         fontStyle: "normal",
//                         fontSize: 22,
//                         lineHeight: "100%",
//                         letterSpacing: "0%",
//                         textAlign: "right",
//                         color: "#3a3a3c",
//                       }}
//                     >
//                       {String(i + 1).padStart(2, "0")}
//                     </span>

//                     <div className="flex-shrink-0 mt-[3px]">
//                       {feature.image ? (
//                         <img
//                           src={feature.image}
//                           className="h-4 w-4 object-contain"
//                           alt=""
//                         />
//                       ) : Icon ? (
//                         <>
//                           <Icon
//                             className="h-4 w-4"
//                             style={{
//                               stroke: "url(#ig-mini)",
//                               strokeWidth: 1.7,
//                               fill: "none",
//                             }}
//                           />
//                           <svg width="0" height="0" aria-hidden>
//                             <defs>
//                               <linearGradient
//                                 id="ig-mini"
//                                 x1="0"
//                                 y1="0"
//                                 x2="0"
//                                 y2="1"
//                               >
//                                 <stop offset="0%" stopColor="#1A73E8" />
//                                 <stop offset="100%" stopColor="#FF14EF" />
//                               </linearGradient>
//                             </defs>
//                           </svg>
//                         </>
//                       ) : null}
//                     </div>

//                     <div>
//                       <div className="text-white font-bold text-[12px] leading-snug mb-0.5 tracking-tight">
//                         {feature.title}
//                       </div>
//                       <div className="text-white/42 text-[10px] leading-relaxed">
//                         {feature.description}
//                       </div>
//                     </div>
//                   </div>
//                 </motion.button>
//               );
//             })}
//           </div>

//           {/* RIGHT — video pane */}
//           <AnimatePresence mode="wait">
//             {activeOfferIdx !== null &&
//               (() => {
//                 const f = FEATURE_PREVIEWS[activeOfferIdx];
//                 const Icon = f.icon;

//                 return (
//                   <motion.div
//                     key={`vp-${activeOfferIdx}`}
//                     initial={{ opacity: 0, x: 36, scale: 0.95 }}
//                     animate={{ opacity: 1, x: 0, scale: 1 }}
//                     exit={{ opacity: 0, x: -20, scale: 0.97 }}
//                     transition={{
//                       duration: 0.46,
//                       ease: [0.22, 1, 0.36, 1],
//                     }}
//                     className="relative rounded-[22px] overflow-hidden flex flex-col justify-end"
//                     style={{
//                       border: "1px solid rgba(255,255,255,.07)",
//                       minHeight: 380,
//                     }}
//                   >
//                     {/* Dynamic radial bg */}
//                     <motion.div
//                       key={`bg-${activeOfferIdx}`}
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       transition={{ duration: 0.7 }}
//                       className="absolute inset-0"
//                       style={{
//                         background:
//                           "radial-gradient(ellipse at 65% 25%, rgba(26,115,232,.22) 0%, rgba(255,20,239,.14) 45%, #020307 100%)",
//                       }}
//                     />

//                     {/* Dot grid */}
//                     <div
//                       className="absolute inset-0 z-[1] pointer-events-none"
//                       style={{
//                         backgroundImage:
//                           "linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",
//                         backgroundSize: "40px 40px",
//                       }}
//                     />

//                     {/* Scan line */}
//                     <div className="absolute inset-0 overflow-hidden z-[2] pointer-events-none">
//                       <div
//                         className="absolute left-0 right-0 h-[2px]"
//                         style={{
//                           background:
//                             "linear-gradient(90deg,transparent 0%,rgba(255,20,239,.6) 30%,rgba(26,115,232,.6) 70%,transparent 100%)",
//                           animation:
//                             "scan 2.8s cubic-bezier(.4,0,.6,1) infinite",
//                           boxShadow: "0 0 12px rgba(255,20,239,.4)",
//                         }}
//                       />
//                     </div>

//                     {/* Dark overlay */}
//                     <div
//                       className="absolute inset-0 z-[3] pointer-events-none"
//                       style={{
//                         background:
//                           "linear-gradient(to top,rgba(2,3,7,.95) 0%,rgba(2,3,7,.5) 35%,rgba(2,3,7,.1) 65%,transparent 100%)",
//                       }}
//                     />

//                     {/* Video */}
//                     <video
//                       src={f.mediaSrc}
//                       className="absolute inset-0 w-full h-full object-cover z-0"
//                       autoPlay
//                       muted
//                       loop
//                       playsInline
//                     />

//                     {/* Close */}
//                     <button
//                       type="button"
//                       onClick={closeSplit}
//                       aria-label="Back to grid"
//                       className="absolute top-3 right-3 z-20 w-[30px] h-[30px] rounded-full flex items-center justify-center text-white/80 hover:text-white hover:scale-110 transition-all duration-200"
//                       style={{
//                         border: "1px solid rgba(255,255,255,.18)",
//                         background: "rgba(0,0,0,.65)",
//                         backdropFilter: "blur(6px)",
//                       }}
//                     >
//                       <X className="h-3 w-3" />
//                     </button>

//                     {/* Center icon with pulse rings */}
//                     <div className="absolute inset-0 flex items-center justify-center z-[4] pointer-events-none">
//                       <div className="relative">
//                         <div
//                           className="absolute inset-[-8px] rounded-full"
//                           style={{
//                             border: "1px solid rgba(255,20,239,.25)",
//                             animation: "pulse-ring 2.2s ease-in-out infinite",
//                           }}
//                         />
//                         <div
//                           className="absolute inset-[-16px] rounded-full"
//                           style={{
//                             border: "1px solid rgba(26,115,232,.15)",
//                             animation:
//                               "pulse-ring 2.2s ease-in-out .6s infinite",
//                           }}
//                         />

//                         <div
//                           className="w-[68px] h-[68px] rounded-full flex items-center justify-center relative z-[1]"
//                           style={{
//                             border: "1px solid rgba(255,255,255,.12)",
//                             background: "rgba(255,255,255,.05)",
//                             backdropFilter: "blur(10px)",
//                           }}
//                         >
//                           {f.image ? (
//                             <img
//                               src={f.image}
//                               className="h-6 w-6 object-contain"
//                               alt=""
//                             />
//                           ) : Icon ? (
//                             <>
//                               <Icon
//                                 className="h-6 w-6"
//                                 style={{
//                                   stroke: "url(#ig-video)",
//                                   strokeWidth: 1.7,
//                                   fill: "none",
//                                 }}
//                               />
//                               <svg width="0" height="0" aria-hidden>
//                                 <defs>
//                                   <linearGradient
//                                     id="ig-video"
//                                     x1="0"
//                                     y1="0"
//                                     x2="0"
//                                     y2="1"
//                                   >
//                                     <stop offset="0%" stopColor="#1A73E8" />
//                                     <stop offset="100%" stopColor="#FF14EF" />
//                                   </linearGradient>
//                                 </defs>
//                               </svg>
//                             </>
//                           ) : null}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Bottom content */}
//                     <div className="relative z-[5] p-5 md:p-6">
//                       <div
//                         className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mb-2.5 text-[9px] font-bold tracking-[.1em] uppercase text-white/50"
//                         style={{
//                           background: "rgba(255,255,255,.07)",
//                           border: "1px solid rgba(255,255,255,.1)",
//                         }}
//                       >
//                         <div
//                           className="w-[5px] h-[5px] rounded-full"
//                           style={{
//                             background:
//                               "linear-gradient(135deg,#FF14EF,#1A73E8)",
//                           }}
//                         />
//                         {String(activeOfferIdx + 1).padStart(2, "0")} ·{" "}
//                         {f.title.split(" ")[0]}
//                       </div>

//                       <motion.h3
//                         key={`t-${activeOfferIdx}`}
//                         initial={{ opacity: 0, y: 12 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{
//                           duration: 0.32,
//                           ease: [0.22, 1, 0.36, 1],
//                         }}
//                         className="text-white font-black text-2xl md:text-3xl mb-2 leading-tight"
//                         style={{ letterSpacing: "-0.03em" }}
//                       >
//                         {f.title}
//                       </motion.h3>

//                       <motion.p
//                         key={`d-${activeOfferIdx}`}
//                         initial={{ opacity: 0, y: 8 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{
//                           duration: 0.32,
//                           delay: 0.06,
//                           ease: [0.22, 1, 0.36, 1],
//                         }}
//                         className="text-white/60 text-xs leading-relaxed"
//                       >
//                         {f.description}
//                       </motion.p>
//                     </div>
//                   </motion.div>
//                 );
//               })()}
//           </AnimatePresence>
//         </div>

//         {/* Progress dots */}
//         <div className="flex justify-center gap-1.5 mt-4">
//           {FEATURE_PREVIEWS.map((_, i) => (
//             <motion.button
//               key={i}
//               onClick={() => !offerBusy && setActiveOfferIdx(i)}
//               animate={{ width: i === activeOfferIdx ? 20 : 4 }}
//               transition={{ type: "spring", stiffness: 400, damping: 28 }}
//               className="h-[4px] rounded-full"
//               style={{
//                 background:
//                   i === activeOfferIdx
//                     ? "linear-gradient(90deg,#FF14EF,#1A73E8)"
//                     : "rgba(255,255,255,0.18)",
//               }}
//             />
//           ))}
//         </div>
//       </motion.div>
//     )}
//   </AnimatePresence>
// </div>

//         {/* HOW IT WORKS + PRODUCT DEMO */}
//            <div className="mt-28 mx-4 md:mx-8 lg:mx-16" style={{ border: "1px solid #171717", borderRadius: 28, background: "#08090B", paddingBottom: "80px", overflow: "hidden" }}>


//           <div className="pt-16 flex justify-center mb-8">
//             <div className="p-[1px] rounded-full" style={{ background: "linear-gradient(90deg, #1A73E8 0%, #FF14EF 100%)" }}>
//               <div className="px-5 py-2 rounded-full bg-black">
//                 <span
//                   style={{
//                     fontFamily: "Inter, ui-sans-serif, system-ui",
//                     fontWeight: 500,
//                     fontSize: 16,
//                     lineHeight: "100%",
//                     background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//                     WebkitBackgroundClip: "text",
//                     color: "transparent",
//                   }}
//                 >
//                   PROCESS
//                 </span>
//               </div>
//             </div>
//           </div>











//           {/* <div className="pt-16 flex justify-center mb-8">
//   <button
//     type="button"
//     className="steam-btn rounded-full"
//     style={{ borderRadius: 9999 }}
//   >
//     <span
//       className="steam-btn-inner px-5 py-2"
//       style={{
//         borderRadius: 9999,
//         background: "#000000",
//       }}
//     >
//       <span
//         style={{
//           fontFamily: "Inter, ui-sans-serif, system-ui",
//           fontWeight: 500,
//           fontSize: 16,
//           lineHeight: "100%",
//           background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//           WebkitBackgroundClip: "text",
//           color: "transparent",
//         }}
//       >
//         PROCESS
//       </span>
//     </span>
//   </button>
// </div> */}
//           {/* <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">How It Works</h2> */}
//            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
//   How It Works
// </h2>

//           {/* Steps grid */}
//           {/* <div className="px-6">
//             <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 mb-16">
//               {[
//                 { step: "Input Idea", Icon: Zap, description: "Share your concept or requirement" },
//                 { step: "Smartgen", Icon: Sparkles, description: "AI generates optimized prompts" },
//                 { step: "Optimize", Icon: Zap, description: "Reduce tokens, improve quality" },
//                 { step: "Save or Sell", Icon: Sparkle, description: "Store in library or marketplace" },
//                 { step: "Earn", Icon: Sparkle, description: "Monetize your best prompts" },
//               ].map((item, i) => {
//                 const isActive = i === activeStep;
//                 const fill = isActive ? "linear-gradient(360deg, #1A1A1A 0%, #08090B 100%)" : "#030406";

//                 return (
//                   <button
//                     key={i}
//                     type="button"
//                     onClick={() => setActiveStep(i)}
//                     className="relative cursor-pointer select-none focus:outline-none"
//                     style={{
//                       width: "100%",
//                       padding: 2,
//                       borderRadius: 22,
//                       background: "linear-gradient(180deg, #333333 0%, #12141A 100%)",
//                     }}
//                     onMouseEnter={(e) => {
//                       const inner = e.currentTarget.querySelector<HTMLElement>("[data-inner]");
//                       if (inner && !isActive) inner.style.background = "linear-gradient(360deg, #1A1A1A 0%, #08090B 100%)";
//                     }}
//                     onMouseLeave={(e) => {
//                       const inner = e.currentTarget.querySelector<HTMLElement>("[data-inner]");
//                       if (inner && !isActive) inner.style.background = "#030406";
//                     }}
//                   >
//                     <div
//                       data-inner
//                       className="w-full h-full flex flex-col items-start justify-start p-5 text-left transition-colors overflow-hidden"
//                       style={{
//                         borderRadius: 18,
//                         background: fill,
//                         minHeight: 140,
//                       }}
//                     >
//                       <div className="absolute top-3 right-4 text-white/40 font-semibold text-sm">
//                         {String(i + 1).padStart(2, "0")}
//                       </div>

//                       <div className="mb-2">
//                         <item.Icon className="h-8 w-8 text-white" />
//                       </div>

//                       <h3 className="text-white font-semibold text-[18px] sm:text-[20px] leading-snug break-words">
//                         {item.step}
//                       </h3>

//                       <p className="text-white/70 mt-2 text-[14px] sm:text-[15px] leading-snug break-words whitespace-normal">
//                         {item.description}
//                       </p>
//                     </div>
//                   </button>
//                 );
//               })}
//             </div>
//           </div> */}


//     <div className="px-0 sm:px-4 md:px-6">
//   <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-16">
//     {HOW_IT_WORKS_STEPS.map((item, i) => {
//       const isActive = i === activeStep;

//       const fill = isActive
//         ? "linear-gradient(360deg, #1A1A1A 0%, #08090B 100%)"
//         : "#030406";

//       return (
//         <button
//           key={item.step}
//           type="button"
//           onClick={() => setActiveStep(i)}
//           className="relative cursor-pointer select-none focus:outline-none w-full group"
//           style={{
//             padding: 1,
//             borderRadius: 12,
//             background: "linear-gradient(180deg, #333333 0%, #12141A 100%)",
//           }}
//         >
//           <div
//             className="relative w-full h-full flex flex-col items-start justify-start text-left transition-colors overflow-hidden"
//             style={{
//               borderRadius: 11,
//               background: fill,
//               minHeight: 140,
//               padding: "18px 20px",
//             }}
//           >
//             {/* Number */}
//             <div
//               className="absolute top-3 right-3"
//               style={{
//                 width: 26,
//                 height: 24,
//                 opacity: 1,
//                 fontFamily: "Inter, ui-sans-serif, system-ui",
//                 fontWeight: 800,
//                 fontStyle: "normal",
//                 fontSize: 20,
//                 lineHeight: "100%",
//                 letterSpacing: "0%",
//                 textAlign: "right",
//                 color: HOW_IT_WORKS_NUMBER_COLOR,
//               }}
//             >
//               {String(i + 1).padStart(2, "0")}
//             </div>

//             {/* Icon */}
//             <div className="mb-5">
//               <img
//                 src={item.iconSrc}
//                 alt=""
//                 draggable={false}
//                 className="w-8 h-8 object-contain"
//                 style={{
//                   filter: "brightness(0) invert(1)",
//                 }}
//               />
//             </div>

//             {/* Title */}
//             <h3
//               className="text-white font-semibold leading-none"
//               style={{
//                 fontSize: i === 0 ? 22 : 20,
//                 fontFamily: "Inter, ui-sans-serif, system-ui",
//               }}
//             >
//               {item.step}
//             </h3>

//             {/* Description */}
//             <p
//               className="text-white/85 mt-3 leading-tight"
//               style={{
//                 fontSize: i === 0 ? 16 : 14,
//                 fontFamily: "Inter, ui-sans-serif, system-ui",
//                 maxWidth: 150,
//               }}
//             >
//               {item.description}
//             </p>
//           </div>
//         </button>
//       );
//     })}
//   </div>
// </div>
   
//      {/* Product Demo */}
// <div className="mt-16 relative overflow-hidden">


//   <div className="container mx-auto px-6 text-center">

//     {/* Heading */}
//    <h3 className="text-3xl md:text-5xl font-bold text-white">
//   Product Demo
// </h3>

//     <p className="text-white/70 text-lg mt-3 mb-12">
//       Video demonstration of earn feature
//     </p>

//     {/* Demo Wrapper */}
//     <div className="relative w-full max-w-[1200px] mx-auto">

//       {/* Glow background */}
//            <div className="hidden" />


//       {/* Laptop with 3D animation */}
//       <motion.div
//         whileHover={{
//           rotateX: 6,
//           rotateY: -6,
//           scale: 1.03,
//         }}
//         transition={{ type: "spring", stiffness: 120 }}
//         className="relative mx-auto"
//         style={{ perspective: 1200 }}
//       >

//         {/* Laptop Image */}
//         <img
//           src="/icons/ux.png"
//           alt="Laptop demo"
//           className="w-full h-auto select-none pointer-events-none"
//           draggable={false}
//         />

//         {/* Screen Video */}
//         <div
//           className="absolute overflow-hidden rounded-[12px]"
//           style={{
//             top: "16.5%",
//             left: "11.8%",
//             width: "76.4%",
//             height: "64%",
//           }}
//         >
//     <video
//   src="/icons/token.mp4"
//   className="w-full h-full object-cover"
//   autoPlay
//   muted
//   loop
//   playsInline
// />
//         </div>

//       </motion.div>

//     </div>
//   </div>
// </div>
//         </div>

//         <GlobeSection /> {/* ← yahan add karo */}
//           <FAQSection />   
//         {/* FINAL CTA */}
//         <div className="mt-28 text-center">
//        <div className="flex justify-center mb-4">
//   <button
//     type="button"
//     className="rounded-full"
//     style={{
//       borderRadius: 9999,
//       padding: "1px",
//       background: "linear-gradient(90deg, #1A73E8 0%, #FF14EF 100%)",
//     }}
//   >
//     <span
//       className="px-5 py-2 inline-flex items-center justify-center rounded-full"
//       style={{
//         borderRadius: 9999,
//         background: "#000000",
//       }}
//     >
//       <span
//         style={{
//           fontFamily: "Inter, ui-sans-serif, system-ui",
//           fontWeight: 500,
//           fontSize: 16,
//           lineHeight: "100%",
//           background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//           WebkitBackgroundClip: "text",
//           color: "transparent",
//         }}
//       >
//         REACH OUT ANY TIME
//       </span>
//     </span>
//   </button>
// </div>

//        <h2 className="text-3xl md:text-5xl font-bold mb-6">
//   Ready to optimize your prompts?
// </h2>
// <p className="text-base sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
//   Join thousands of developers who are already saving costs and improving efficiency with TOKUN.
// </p>

//          <div className="relative inline-block overflow-visible isolate">
//   <div
//     className="pointer-events-none absolute -inset-x-16 -top-2 -bottom-10 rounded-[36px] z-0"
//     style={{
//       background: "linear-gradient(90deg, rgba(255,20,239,0.4) 0%, rgba(26,115,232,0.4) 100%)",
//       filter: "blur(60px)",
//       opacity: 1,
//     }}
//   />
//   <div className="relative">
//     <motion.img
//       src="/icons/arr.png"
//       alt="arrow highlight"
//       className="pointer-events-none select-none absolute -top-6 -left-8 w-9 sm:-top-7 sm:-left-10 sm:w-10"
//     />
//     <motion.button
//       onClick={() => go(routes.app)}
//       whileHover={{ scale: 1.05 }}
//       className="relative w-[200px] sm:w-[240px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold shadow-2xl border border-white/10 backdrop-blur-md flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg"
//       style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
//     >
//       <div className="absolute inset-0 rounded-full bg-white opacity-10 blur-[6px] pointer-events-none" />
//       <span>Start Optimizing Now</span>
//       <span
//         aria-hidden
//         className="inline-flex items-center justify-center rounded-full bg-white"
//         style={{ width: 24, height: 24 }}
//       >
//         <MdKeyboardArrowRight size={14} color="black" />
//       </span>
//     </motion.button>
//     {/* <motion.button
//   onClick={() => go(routes.app)}
//   whileHover={{ scale: 1.05 }}
//   className="steam-btn relative w-[200px] sm:w-[240px] h-[50px] sm:h-[62px] rounded-full text-white font-semibold"
//   style={{ borderRadius: 9999 }}
// >
//   <span
//     className="steam-btn-inner backdrop-blur-md border border-white/10"
//     style={{
//       borderRadius: 9999,
//       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
//       boxShadow: "0 10px 30px rgba(255,20,239,0.18)",
//       gap: 12,
//     }}
//   >
//     <span>Start Optimizing Now</span>
//     <span
//       aria-hidden
//       className="inline-flex items-center justify-center rounded-full bg-white"
//       style={{ width: 24, height: 24 }}
//     >
//       <MdKeyboardArrowRight size={14} color="black" />
//     </span>
//   </span>
// </motion.button> */}
//   </div>
// </div>
//         </div>

//         {/* TESTIMONIALS */}
//           {/* TESTIMONIALS */}
//       {/* TESTIMONIALS — SAME POSITION & DESIGN, keep < and > arrows; center when only one */}
//            {/* TESTIMONIALS */}
// <div className="mt-28 mb-8 relative font-[Inter] px-4">

//   {/* TAG */}
//   <div className="flex justify-center mb-4">
//     <div
//       className="p-[1px] rounded-full"
//       style={{ background: "linear-gradient(90deg, #1A73E8 0%, #FF14EF 100%)" }}
//     >
//       <div className="px-5 py-2 rounded-full bg-black">
//         <span
//           style={{
//             fontWeight: 500,
//             fontSize: 16,
//             background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//             WebkitBackgroundClip: "text",
//             color: "transparent",
//           }}
//         >
//           WALL OF LOVE
//         </span>
//       </div>
//     </div>
//   </div>

//   {/* <div className="flex justify-center mb-4">
//   <button
//     type="button"
//     className="steam-btn rounded-full"
//     style={{ borderRadius: 9999 }}
//   >
//     <span
//       className="steam-btn-inner px-5 py-2"
//       style={{
//         borderRadius: 9999,
//         background: "#000000",
//       }}
//     >
//       <span
//         style={{
//           fontWeight: 500,
//           fontSize: 16,
//           background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//           WebkitBackgroundClip: "text",
//           color: "transparent",
//         }}
//       >
//         WALL OF LOVE
//       </span>
//     </span>
//   </button>
// </div> */}

//  <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-4">
//   Loved by thinkers
// </h2>

// <p className="text-sm sm:text-lg text-white/70 text-center mb-12">
//   Here's what people worldwide are saying
// </p>

//  {feedbacks.length === 0 ? (
//   <div className="text-center text-white/60">
//     No testimonials yet — be the first to leave feedback!
//   </div>
// ) : (
//   <div className="flex justify-center items-center gap-3 sm:gap-6 px-3 sm:px-0">
//     {/* LEFT BUTTON */}
//     <button
//       onClick={prevSlide}
//       className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white text-white transition-all shrink-0"
//     >
//       <MdKeyboardArrowDown size={20} className="rotate-90 sm:text-[22px]" />
//     </button>

//     {/* SLIDER */}
//     <div className="relative w-full max-w-[560px] overflow-hidden">
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={current}
//           initial={{ opacity: 0, x: 120 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: -120 }}
//           transition={{ duration: 0.4 }}
//           className="w-full"
//         >
//           {(() => {
//             const t = feedbacks[current];
//             return (
//               <div
//                 key={t.id}
//                 className="relative flex flex-col justify-between p-4 sm:p-6 text-left bg-transparent overflow-hidden w-full"
//                 style={{
//                   border: "1px solid #333335",
//                   borderRadius: 24,
//                 }}
//               >
//                 {/* glow */}
//                 <div
//                   className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-28 h-28 sm:w-40 sm:h-40 rounded-full pointer-events-none"
//                   style={{
//                     background:
//                       "radial-gradient(circle at center, rgba(255,20,239,0.25) 0%, rgba(26,115,232,0.25) 100%)",
//                     filter: "blur(60px)",
//                   }}
//                 />

//                 <div className="relative z-10 flex flex-col gap-3">
//                   {/* stars */}
//                   <div className="flex">
//                     {Array.from({
//                       length: Math.max(1, Math.min(5, Number(t.rating) || 5)),
//                     }).map((_, i) => (
//                       <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-white fill-white" />
//                     ))}
//                   </div>

//                   {/* text */}
//                   <p className="text-white/90 text-[13px] sm:text-[15px] leading-relaxed break-words">
//                     "{t.experience}"
//                   </p>

//                   {/* user */}
//                   <div className="flex items-center gap-3">
//                     <img
//                       src={t.avatar || svgInitialsAvatar(t.name || "User")}
//                       alt={t.name || "User"}
//                       className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
//                     />
//                     <div className="min-w-0">
//                       <div className="font-semibold text-white text-sm sm:text-base truncate">
//                         {t.name || "Anonymous"}
//                       </div>
//                       <div className="text-xs sm:text-sm text-white/60 break-words">
//                         {[t.role, t.org].filter(Boolean).join(" • ")}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })()}
//         </motion.div>
//       </AnimatePresence>
//     </div>

//     {/* RIGHT BUTTON */}
//     <button
//       onClick={nextSlide}
//       className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white text-white transition-all shrink-0"
//     >
//       <MdKeyboardArrowDown size={20} className="-rotate-90 sm:text-[22px]" />
//     </button>
//   </div>
// )}
// </div>



//         {showFooter && <Footer />}
//       {profileOpen && (
//   <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] grid place-items-center">
//     <div
//       className="absolute inset-0 bg-black/70 backdrop-blur-sm"
//       onClick={() => setProfileOpen(false)}
//     />
//     <div
//       className="relative w-[96vw] md:w-[min(96vw,900px)] max-h-[90vh] rounded-2xl text-white shadow-2xl overflow-hidden"
//       style={{ background: "#17171A", fontFamily: "Inter", fontWeight: 400 }}
//     >
//       <button
//         aria-label="Close"
//         onClick={() => setProfileOpen(false)}
//         className="absolute right-2 top-2 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8 z-10"
//       >
//         <X className="w-4 h-4 text-white/90" />
//       </button>

//       <div className="flex flex-col md:grid md:grid-cols-[240px,1fr] max-h-[90vh] overflow-hidden">
//         {/* Left nav */}
//         <aside
//           className="no-scrollbar overflow-x-auto md:overflow-y-auto md:pt-5 flex md:flex-col flex-row"
//           style={{ background: "#17171A", borderBottom: "1px solid #1C1C1C" }}
//         >
//           {[
//             { id: "profile", label: "Profile", Icon: User },
//             { id: "bank", label: "Bank Account", Icon: Landmark },
//             { id: "billing", label: "Billing information", Icon: CreditCard },
//           ].map((item) => {
//             const active = profileTab === (item.id as typeof profileTab);
//             return (
//               <button
//                 key={item.id}
//                 onClick={() => setProfileTab(item.id as typeof profileTab)}
//                 className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-4 text-left whitespace-nowrap md:w-full shrink-0"
//                 style={{
//                   background: active ? "#1C1C1C" : "transparent",
//                   color: active ? "#ffffff" : "rgba(255,255,255,0.78)",
//                   borderBottom: active ? "2px solid #FF14EF" : "2px solid transparent",
//                 }}
//               >
//                 <item.Icon className="w-5 h-5" />
//                 <span>{item.label}</span>
//               </button>
//             );
//           })}
//         </aside>

//         {/* Right content */}
//         <section className="no-scrollbar overflow-y-auto p-6 md:p-8" style={{ maxHeight: "90vh" }}>
//           <div className="mb-6">
//             <button
//               type="button"
//               className="inline-flex items-center justify-center gap-2 text-white"
//               style={{
//                 width: 169, height: 40, borderRadius: 6,
//                 background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
//               }}
//             >
//               <User className="w-4 h-4" />
//               <span className="text-sm font-medium">Individual</span>
//             </button>
//           </div>

//           {/* Profile Tab */}
//           {profileTab === "profile" && (
//             <div className="space-y-6">
//               <div>
//                 <label className="block mb-2 text-white/80 text-sm">Full Name</label>
//                 <input
//                   disabled
//                   value={displayName || ""}
//                   className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white/80 placeholder-white/40 outline-none"
//                   placeholder="Your name"
//                 />
//               </div>
//               <div>
//                 <label className="block mb-2 text-white/80 text-sm">Email</label>
//                 <input
//                   disabled
//                   value={displayEmail || ""}
//                   className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white/70 placeholder-white/40 outline-none"
//                   placeholder="you@example.com"
//                 />
//               </div>
//               <div className="flex items-center justify-between pt-2">
//                 <span className="text-white/80">Delete account</span>
//                 <button
//                   type="button"
//                   className="px-5 py-2 rounded-md text-red-400 border border-red-500/80 hover:bg-red-500/10 transition"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Bank Tab */}
//           {profileTab === "bank" && (
//             <div className="flex flex-col gap-4 rounded-xl border border-white/10 p-6" style={{ background: "#17171A" }}>
//               <h3 className="text-[22px]">Bank Account</h3>
//               <p className="text-white/70">Please add bank account.</p>
//               <button
//                 type="button"
//                 onClick={() => navigate("/wallet")}
//                 className="rounded-md px-4 py-2 text-white w-fit"
//                 style={{ background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)" }}
//               >
//                 Manage in Wallet
//               </button>
//             </div>
//           )}

//           {/* Billing Tab */}
//           {profileTab === "billing" && (
//             <div className="space-y-5">
//               <h3 className="text-[22px] mb-2">My Billing information</h3>
//               <div className="rounded-md overflow-hidden">
//                 <div className="grid grid-cols-[2fr,1fr,120px] items-center bg-[#1F1F22] px-4 py-3 text-white/80">
//                   <span>Item</span>
//                   <span>Date</span>
//                   <span className="text-right">Status</span>
//                 </div>
//                 <div className="text-center text-white/50 py-8">No billing records</div>
//               </div>
//             </div>
//           )}
//         </section>
//       </div>
//     </div>
//   </div>
// )}
        

//         {/* Floating Action Button */}
//         {/* Floating Action Button */}
// {/* Floating Action Button */}
// {/* Floating Action Button */}
// {/* Floating Action Button */}
// {/* Floating Action Button */}
// <div className="fixed bottom-24 right-8 z-50">
//   <Button
//     onClick={() =>
//       variant === "marketing" ? go(routes.login) : go(routes.dashboard)
//     }
//     className="w-16 h-16 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 p-0"
//     style={{
//       background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
//       boxShadow: "0 0 40px rgba(26,115,232,0.35)",
//     }}
//   >
//     <FiArrowRight
//       className="text-white"
//       style={{
//         width: 22,
//         height: 22,
//         strokeWidth: 1.8,
//       }}
//     />
//   </Button>
// </div>
//       </div>

//       {/* ===== Feedback vertical pill (50x130) =====
//           Placed above the Smartgen/Marketplace CTAs and sticks to the laptop screen's right edge */}
//       {fbPos && (
//     <button
//   type="button"
//   onClick={() => setFeedbackOpen(true)}   // 👈 open modal
//   aria-label="Give feedback"
//   className="absolute z-50 text-white font-semibold"
// style={{
//   position: 'fixed',           // 👈 add this
//   width: 50,
//   height: 130,
//   opacity: 1,
//   top: fbPos.top,
//   left: fbPos.left,
//   borderTopLeftRadius: 16,
//   borderBottomLeftRadius: 16,
//   borderTopRightRadius: 0,
//   borderBottomRightRadius: 0,
//   background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
//   boxShadow: "0 0 28px rgba(26,115,232,0.25)",
//   writingMode: "vertical-rl",
//   textOrientation: "mixed",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   letterSpacing: 1,
// }}

// >
//   <span
//     className="inline-flex items-center select-none"
//     style={{
//       transform: "rotate(180deg)", // bottom → top
//       gap: 6,
//       lineHeight: 1,
//       fontFamily: "Inter, ui-sans-serif, system-ui",
//       fontWeight: 400,
//       fontStyle: "normal",
//       fontSize: 16,
//       color: "#fff",
//       textAlign: "center",
//     }}
//   >
//     <MessageCircleHeart
//       aria-hidden
//       style={{ width: 22, height: 22, transform: "rotate(180deg)" }} // keep icon upright
//     />
//     <span>Feedback</span>
//   </span>
// </button>


//       )}

//       {feedbackOpen && (
//   <div role="dialog" aria-modal="true" className="fixed inset-0 z-[999] grid place-items-center">
//     {/* Backdrop */}
//     <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setFeedbackOpen(false)} />

//     {/* Card: smaller + capped height + Inter Regular for everything */}
//  <div
//   className="relative rounded-2xl text-white shadow-2xl"
//   style={{
//     background: "#17171A", // ← was "#131313"
//     width: "min(92vw, 520px)",
//     maxHeight: "85vh",
//     fontFamily: "Inter",
//     fontWeight: 400,
//     fontStyle: "normal",
//   }}
// >

//       {/* Close */}
//       <button
//         aria-label="Close"
//         onClick={() => setFeedbackOpen(false)}
//         className="absolute right-2 top-2 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8"
//       >
//         <X className="w-4 h-4 text-white/90" />
//       </button>

//       {/* Scrollable content (scrollbar hidden) */}
//       <div
//         className="no-scrollbar overflow-y-auto px-5 md:px-6 py-6 md:py-7"
//         style={{ maxHeight: "85vh" }}
//       >
//         {/* Title (regular weight) */}
//         <h3 className="text-center text-[20px] md:text-[22px]" style={{ fontWeight: 400 }}>
//           We Value Your Feedback
//         </h3>
//         <p className="text-center text-white/70 mt-2 leading-snug text-sm">
//           Your feedback is important to us We take
//           <br />
//           it very seriously.
//         </p>

//         {/* Stars */}
//         <div className="mt-5">
//           <div className="flex items-center justify-center gap-4">
//             {Array.from({ length: 5 }).map((_, i) => {
//               const idx = i + 1;
//               const active = (hoverRating || rating) >= idx;
//               return (
//                 <button
//                   key={idx}
//                   type="button"
//                   onMouseEnter={() => setHoverRating(idx)}
//                   onMouseLeave={() => setHoverRating(0)}
//                   onClick={() => setRating(idx)}
//                   className="p-1"
//                   aria-label={`Rate ${idx} star${idx > 1 ? "s" : ""}`}
//                   style={{ fontFamily: "Inter", fontWeight: 400 }}
//                 >
//                   <Star
//                     className="w-6 h-6"
//                     style={{
//                       color: active ? "#FFFFFF" : "rgba(255,255,255,0.5)",
//                       fill: active ? "#FFFFFF" : "transparent",
//                     }}
//                   />
//                 </button>
//               );
//             })}
//           </div>
//           <div className="flex justify-between text-[11px] text-white/70 w-[240px] mx-auto mt-2">
//             <span>Very bad</span>
//             <span>Very Good</span>
//           </div>
//         </div>

//         {/* Write your experience */}
//         <div className="mt-6">
//           <label className="block mb-2 text-white/90 text-sm">Write your experience</label>
//           <div className="relative">
//           <textarea
//   value={fbForm.experience}
//   onChange={(e) =>
//     setFbForm((p) => ({ ...p, experience: e.target.value.slice(0, MAX_CHARS) }))
//   }
//   rows={4}
//   className="w-full resize-none rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
//   placeholder="Share your thoughts..."
//   style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
//   required
// />

//             <div className="absolute right-3 bottom-2 text-xs text-white/60">
//               {fbForm.experience.length}/{MAX_CHARS}
//             </div>
//           </div>
//         </div>

//         {/* Name */}
//         <div className="mt-5">
//           <label className="block mb-2 text-white/90 text-sm">Your Name</label>
//        <input
//   value={fbForm.name}
//   onChange={(e) => setFbForm((p) => ({ ...p, name: e.target.value }))}
//   className="w-full rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
//   placeholder="Your full name"
//   style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
//   required
// />

//         </div>

//         {/* Role */}
//         <div className="mt-5">
//           <label className="block mb-2 text-white/90 text-sm">Your Role / Designation</label>
//           <input
//             value={fbForm.role}
//             onChange={(e) => setFbForm((p) => ({ ...p, role: e.target.value }))}
//             className="w-full rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
//             placeholder="e.g., Assistant Manager"
//             style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
//           />
//         </div>

//         {/* Organization */}
//         <div className="mt-5">
//           <label className="block mb-2 text-white/90 text-sm">Organization / Company</label>
//           <input
//             value={fbForm.org}
//             onChange={(e) => setFbForm((p) => ({ ...p, org: e.target.value }))}
//             className="w-full rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/15"
//             placeholder="Company name"
//             style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
//           />
//         </div>

//         {/* File upload */}
//         <div className="mt-5">
//           <label className="block mb-2 text-white/90 text-sm">Profile Picture</label>
//           <div className="flex items-center gap-3">
//             <label
//               className="cursor-pointer inline-flex items-center rounded-md px-4 py-2 text-sm text-white"
//               style={{
//                 background: "linear-gradient(270deg, #FF14EF 0%, #1A73E8 100%)",
//                 fontFamily: "Inter",
//                 fontWeight: 400,
//                 fontStyle: "normal",
//               }}
//             >
//               Choose file
//               <input
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={(e) => setFbForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
//               />
//             </label>
//             <div className="flex-1 truncate rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white/70"
//                  style={{ fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}>
//               {fbForm.file ? fbForm.file.name : "No file chosen"}
//             </div>
//           </div>
//         </div>

//         {/* Actions — right aligned; Clear sits directly left of Submit */}
//         <div className="mt-6 flex items-center justify-end gap-3">
//         <button
//   type="button"
//   onClick={handleClear}
//   className="text-white/90 hover:text-white transition"
//   style={{
//     width: 100,
//     height: 49,
//     opacity: 1,
//     borderRadius: 6,
//     border: "1px solid #FFFFFF",
//     display: "inline-flex",
//     alignItems: "center",
//     justifyContent: "center",
//     background: "transparent",
//     fontFamily: "Inter",
//     fontWeight: 400,
//     fontStyle: "normal",
//   }}
// >
//   Clear
// </button>


//          <button
//   type="button"
//   onClick={handleSubmitFeedback}
//   className="text-white" // removed rounded-xl/px/py to avoid conflicts
//   style={{
//     width: 162,
//     height: 49,
//     opacity: 1,
//     borderRadius: 6,
//     padding: 15,
//     gap: 10,
//     display: "inline-flex",
//     alignItems: "center",
//     justifyContent: "center",
//     background: "linear-gradient(270deg, #FF14EF 0%, #1A73E8 100%)",
//     fontFamily: "Inter",
//     fontWeight: 400,
//     fontStyle: "normal",
//   }}
// >
//   Submit Feedback
// </button>

//         </div>
//       </div>
//     </div>
//   </div>
// )}




// {thankOpen && (
//   <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] grid place-items-center">
//     {/* Backdrop */}
//     <div
//       className="absolute inset-0 bg-black/70 backdrop-blur-sm"
//       onClick={() => setThankOpen(false)}
//     />

//     {/* Card */}
//     <div
//       className="relative rounded-2xl text-white shadow-2xl px-6 py-7"
//       style={{
//         background: "#17171A",
//         width: "min(92vw, 500px)",
//         border: "1px solid #333335",
//       }}
//     >
//       {/* Close */}
//       <button
//         aria-label="Close"
//         onClick={() => setThankOpen(false)}
//         className="absolute right-2 top-2 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8"
//       >
//         <X className="w-4 h-4 text-white/90" />
//       </button>

//       {/* Green check icon */}
//       <div className="grid place-items-center mb-4">
//         <div
//           className="grid place-items-center h-14 w-14 rounded-full"
//           style={{ background: "rgba(16,185,129,0.18)" }}  /* dark green ring */
//         >
//           <div
//             className="grid place-items-center h-10 w-10 rounded-full"
//             style={{ background: "#16A34A" }}  /* green */
//           >
//             <Check className="w-6 h-6 text-black" />
//           </div>
//         </div>
//       </div>

//       {/* Text */}
//       <h3 className="text-center text-[18px] md:text-[20px] font-medium">
//         Thank you for your feedback!
//       </h3>
//       <p className="text-center text-white/70 mt-2 text-sm">
//         We appreciate your feedback and will review it shortly.
//       </p>

//       {/* Actions */}
//       <div className="mt-6 flex items-center justify-center gap-3">
//         <button
//           type="button"
//           onClick={() => setThankOpen(false)}
//           className="text-white/90 hover:text-white transition"
//           style={{
//             width: 110,
//             height: 44,
//             borderRadius: 6,
//             border: "1px solid #FFFFFF",
//             background: "transparent",
//           }}
//         >
//           Cancel
//         </button>

//         <button
//           type="button"
//           onClick={() => {
//             setThankOpen(false);
//             handleClear();         // fresh form
//             setFeedbackOpen(true); // reopen the form
//           }}
//           className="text-white"
//           style={{
//             width: 160,
//             height: 44,
//             borderRadius: 6,
//             background: "#333335",
//           }}
//         >
//           Submit Another
//         </button>
//       </div>
//     </div>
//   </div>
// )}


// <style>{`
//   .steam-btn {
//     position: relative;
//     isolation: isolate;
//     overflow: visible;
//   }

//   .steam-btn::before,
//   .steam-btn::after {
//     content: "";
//     position: absolute;
//     inset: -2px;
//     border-radius: inherit;
//     background: linear-gradient(
//       45deg,
//       #fb0094,
//       #0000ff,
//       #00ff00,
//       #ffff00,
//       #ff0000,
//       #fb0094,
//       #0000ff,
//       #00ff00,
//       #ffff00,
//       #ff0000
//     );
//     background-size: 400%;
//     z-index: -2;
//     animation: steam 20s linear infinite;
//   }

//   .steam-btn::after {
//     z-index: -3;
//     filter: blur(22px);
//     opacity: 0.95;
//   }

//   .steam-btn-inner {
//     position: relative;
//     z-index: 1;
//     border-radius: inherit;
//     width: 100%;
//     height: 100%;
//     display: inline-flex;
//     align-items: center;
//     justify-content: center;
//   }

//   @keyframes steam {
//     0% { background-position: 0 0; }
//     50% { background-position: 400% 0; }
//     100% { background-position: 0 0; }
//   }
// `}


// {`
//   @keyframes scan {
//     0%   { top: 0%;   opacity: 0; }
//     5%   { opacity: 1; }
//     95%  { opacity: 1; }
//     100% { top: 100%; opacity: 0; }
//   }
//   @keyframes pulse-ring {
//     0%, 100% { transform: scale(1);    opacity: .6; }
//     50%       { transform: scale(1.07); opacity: 1; }
//   }
// `}



// </style>

//     </motion.section>
//   );
// }



import { Suspense, lazy, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  ChevronDown,
  Facebook,
  Instagram,
  LayoutDashboard,
  Linkedin,
  LogOut,
  MessageSquarePlus,
  Gift,
  Mouse,
  Package,
  Play,
  Sparkles,
  Star,
  TrendingUp,
  Twitter,
  User as UserIcon,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useFreelancerMenu } from '@/hooks/useFreelancerMenu'
// The shared footer. This file used to define a private `Footer()` of its own
// further down, which shadowed this import — so any link added to the real
// footer (Refund Policy, Report Policy) never showed up on the landing page.
import Footer from '@/components/Footer'
import CookieConsentBanner from '@/components/CookieConsentBanner'
import CanvasErrorBoundary from '@/components/CanvasErrorBoundary'
/* The site bar, shared with every other page — see the note on LandingNav
   below. TokunLogo comes from there too, so the mark is one component. */
import SiteNav, { TokunLogo } from '@/components/SiteNav'
import { prefetchLandingRoutes } from '@/lib/prefetchRoutes'
import './landing-page.css'

const TOKUN_LOGO_SRC = '/icons/Tokun.png'
const API_BASE = ((import.meta as any).env?.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

/* Routes — apni app ke hisaab se yahan badal sakte ho */
const ROUTES = {
  login: '/login',
  signup: '/signup',
  app: '/app',
  promptLibrary: '/prompt-library',
  smartgen: '/smartgen',
  optimizer: '/prompt-optimization',
  marketplace: '/prompt-marketplace',
  findCreators: '/find-creators',
  dashboard: '/self-dash',
}

/* ============================================================
   Shared motion variant
   ============================================================ */

/* Scroll reveal.
 *
 * Every section of this page starts invisible and animates in when it reaches
 * the viewport, and the old numbers made that read as the page still loading:
 * a card waited until it was 60px INSIDE the view (see REVEAL_VIEWPORT below),
 * then waited out a stagger of up to 0.6s, then took another 0.65s to fade —
 * so at a normal scroll speed you arrived at blank space and watched it fill in
 * behind you.
 *
 * Same effect, retimed to finish before you get there: it starts well above the
 * fold, the per-card stagger is short and capped, and the fade is quick. The
 * travel is smaller too, since a 36px slide is what makes a late reveal read as
 * "jumping into place".
 */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      // Capped: a six-card grid used to spend 0.6s on the stagger alone, so the
      // last card in a row appeared long after the first.
      delay: Math.min(i, 3) * 0.05,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

/* Positive rootMargin — the reveal is armed 260px BEFORE the element scrolls
   into view, which is roughly a scroll-wheel notch of lead time. The values
   here were negative ('-40px' … '-80px'), which does the opposite: it shrinks
   the trigger box so the element has to be well inside the screen first. That
   single sign is most of what made the page feel like it was loading as you
   went down it. */
const REVEAL_VIEWPORT = { once: true, margin: '260px 0px 260px 0px' }

/* ============================================================
   Hooks
   ============================================================ */

function useIsInViewport(ref, { rootMargin = '0px' } = {}) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, rootMargin])

  return isVisible
}

function usePageVisible() {
  const [visible, setVisible] = useState(
    typeof document === 'undefined' ? true : document.visibilityState === 'visible'
  )

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  return visible
}

/* ============================================================
   TokunLogo (image with text fallback)
   ============================================================ */

/* TokunLogo now lives in components/SiteNav.tsx and is imported at the top of
   this file — the landing bar and the bar on every other page are one component,
   so the mark has to be one component too.

   It also lost its animations there: a hover spring plus a permanent float, both
   writing `transform` on the same element the scroll-condense scales, which made
   the logo grow and slide right when you hovered it after scrolling. The hover
   glow (a filter, in landing-page.css) is what's left. */

/* ============================================================
   HeroAccountMenu — logged-in user ka naam + dropdown
   (naye Promptverse design ke hisaab se, self-contained)
   ============================================================ */

function HeroAccountMenu() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Shared with Header.tsx's account dropdown, which is the other copy of this
  // menu. `modals` is rendered below the panel rather than inside it, so closing
  // the menu doesn't take the wizard with it.
  const freelancerMenu = useFreelancerMenu()

  const toTitleCase = (value: string) =>
    value
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')

  const fullName = user?.name?.trim()
    ? toTitleCase(user.name.trim())
    : (user?.email ? user.email.split('@')[0] : 'User')
  const plan = user?.plan || 'free'

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const go = (path) => {
    setOpen(false)
    navigate(path)
  }

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate('/login')
  }

  const planGradient =
    plan === 'pro'
      ? 'linear-gradient(90deg,#a855f7,#38bdf8)'
      : plan === 'enterprise'
      ? 'linear-gradient(90deg,#FACC15,#CA8A04)'
      : null

  const primaryItems = [
    // "Set up profile" read like an unfinished chore even for someone whose
    // profile was long since complete. Same wording as the Header's account
    // menu: this is simply where your account lives.
    {
      label: 'My Account',
      icon: UserIcon,
      onClick: () => {
        const id = user?._id || user?.id
        go(id ? `/profile/${id}` : '/profile')
      },
    },
    // Same entry as the Header's account menu, from the same hook — its label
    // tracks whether the user has no profile, a draft, or a live one. Dropped
    // once the profile is ACTIVE, because then it only points back at My
    // Account and the menu looks like it holds two profiles.
    ...(freelancerMenu.status === 'ACTIVE'
      ? []
      : [
          {
            label: freelancerMenu.label,
            icon: Briefcase,
            onClick: () => {
              setOpen(false)
              freelancerMenu.open()
            },
          },
        ]),
    /* "My Wallet" was here too — this menu is a second copy of the Header's
       account menu, so it has to be kept in step or the same dropdown shows
       different items depending on which page you opened it from. Hidden for
       the same reason: payments settle through Razorpay and seller earnings go
       to a linked account, so there is no balance to manage day to day. */
    { label: 'Dashboard', icon: LayoutDashboard, onClick: () => go('/self-dash') },
    // Kept in step with the Header's account menu — same entry, same target:
    // the dashboard's "My Products" tab (purchased + uploaded).
    { label: 'My Products', icon: Package, onClick: () => go('/self-dash?tab=prompts&p=purchased') },
    // Kept in step with the Header's account menu — same entry, same target.
    { label: 'Refer & Earn', icon: Gift, onClick: () => go('/refer') },
  ]

  const secondaryItems = [
    { label: 'My Feedback', onClick: () => go('/my-feedback') },
    // Kept in step with the Header's account menu — this is a second copy of the
    // same menu, so anything added there has to be added here too or the landing
    // page quietly falls behind (the footer had exactly this problem).
    { label: 'My Refunds', onClick: () => go('/my-refunds') },
    { label: 'Pricing', onClick: () => go('/subscription') },
    { label: 'Support', onClick: () => go('/support') },
  ]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          height: 40,
          padding: '0 8px 0 16px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#fff',
          cursor: 'pointer',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: 14,
          whiteSpace: 'nowrap',
        }}
      >
        {planGradient ? (
          <span
            style={{
              background: planGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Hello, {fullName}
          </span>
        ) : (
          <>
            <span>Hello, {fullName}</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 6,
                background: 'rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.75)',
              }}
            >
              FREE
            </span>
          </>
        )}
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#fff',
          }}
        >
          <ChevronDown size={14} color="#000" />
        </span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 10px)',
            width: 230,
            padding: 8,
            borderRadius: 16,
            background: 'rgba(20,18,30,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
            zIndex: 100,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* An email has no spaces in it, so there is nothing for the browser to
              break on: `anandapadmanabhan.s@techverse.world` is wider than this
              230px card and simply ran out the side of it, over the page.

              `overflowWrap: anywhere` lets it break mid-word onto a second line,
              which keeps the whole address readable — the point of showing it is
              so somebody can tell WHICH account they're signed in as, and half an
              address with an ellipsis often can't answer that. The name is capped
              at one line with an ellipsis instead, since a long name stays
              recognisable from its start, and `title` still gives the full one on
              hover. */}
          <div style={{ padding: '8px 10px 12px', minWidth: 0 }}>
            <div
              title={fullName}
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: '#fff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {fullName}
            </div>
            <div
              title={user?.email || ''}
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.55)',
                overflowWrap: 'anywhere',
                lineHeight: 1.35,
                marginTop: 2,
              }}
            >
              {user?.email || ''}
            </div>
          </div>

          {primaryItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 10px',
                borderRadius: 10,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                textAlign: 'left',
                transition: 'background 0.18s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}

          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '6px 4px' }} />

          {secondaryItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '9px 10px',
                borderRadius: 10,
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.85)',
                cursor: 'pointer',
                fontSize: 14,
                transition: 'background 0.18s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
              }}
            >
              {item.label}
            </button>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 10px',
              marginTop: 4,
              borderRadius: 10,
              background: 'transparent',
              border: 'none',
              color: '#ff6b6b',
              cursor: 'pointer',
              fontSize: 14,
              textAlign: 'left',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,107,107,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}

      {/* Outside the `open &&` panel above on purpose: the panel is unmounted
          when the menu closes, and clicking the freelancer item closes it. */}
      {freelancerMenu.modals}
    </div>
  )
}

/* ============================================================
   TokunAiAura
   ============================================================ */

const TITLE_ORBIT_RINGS = [
  { radius: 118, duration: 28, reverse: false, nodes: 3, offset: 0 },
  { radius: 142, duration: 36, reverse: true, nodes: 4, offset: 45 },
  { radius: 168, duration: 44, reverse: false, nodes: 3, offset: 90 },
]

const PAGE_ORBIT_RINGS = [
  { radius: 160, duration: 32, reverse: false, nodes: 4, offset: 0 },
  { radius: 200, duration: 40, reverse: true, nodes: 5, offset: 36 },
  { radius: 240, duration: 48, reverse: false, nodes: 4, offset: 72 },
]

const SYNAPSES = [
  { x1: '12%', y1: '22%', x2: '88%', y2: '28%' },
  { x1: '88%', y1: '28%', x2: '94%', y2: '62%' },
  { x1: '94%', y1: '62%', x2: '72%', y2: '88%' },
  { x1: '72%', y1: '88%', x2: '28%', y2: '88%' },
  { x1: '28%', y1: '88%', x2: '6%', y2: '62%' },
  { x1: '6%', y1: '62%', x2: '12%', y2: '22%' },
  { x1: '50%', y1: '10%', x2: '50%', y2: '90%' },
  { x1: '12%', y1: '22%', x2: '72%', y2: '88%' },
  { x1: '88%', y1: '28%', x2: '28%', y2: '88%' },
]

const TITLE_FLOATING_TOKENS = [
  { text: '{product}', x: '4%', y: '18%', delay: 0 },
  { text: '01', x: '90%', y: '14%', delay: 1.2 },
  { text: 'λ', x: '92%', y: '72%', delay: 0.6 },
  { text: '⟨AI⟩', x: '2%', y: '68%', delay: 1.8 },
  { text: 'token', x: '78%', y: '90%', delay: 2.4 },
  { text: '◇', x: '18%', y: '92%', delay: 3 },
]

const PAGE_FLOATING_TOKENS = [
  { text: '{product}', x: '6%', y: '14%', delay: 0 },
  { text: '01', x: '88%', y: '10%', delay: 1.2 },
  { text: 'λ', x: '94%', y: '38%', delay: 0.6 },
  { text: '⟨AI⟩', x: '3%', y: '42%', delay: 1.8 },
  { text: 'token', x: '82%', y: '62%', delay: 2.4 },
  { text: '◇', x: '10%', y: '72%', delay: 3 },
]

const AMBIENT_SYNAPSES = SYNAPSES.slice(0, 5)

function buildDataBits(count, scale = 1) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360
    const radius = (95 + (i % 4) * 18) * scale
    const r2 = radius + 12 * scale
    const toXY = (deg, r) => ({
      x: Math.cos((deg * Math.PI) / 180) * r,
      y: Math.sin((deg * Math.PI) / 180) * r * 0.45,
    })
    const p0 = toXY(angle, radius)
    const p1 = toXY(angle + 40, r2)
    const p2 = toXY(angle + 80, radius)
    return {
      id: i,
      duration: 3 + (i % 5) * 0.8,
      delay: i * 0.25,
      char: i % 2 === 0 ? '1' : '0',
      p0,
      p1,
      p2,
    }
  })
}

const TITLE_DATA_BITS = buildDataBits(16)
const PAGE_DATA_BITS = buildDataBits(28, 1.65)
const AMBIENT_DATA_BITS = buildDataBits(12, 1.5)

function OrbitRing({ radius, duration, reverse, nodes, offset }) {
  return (
    <div
      className={`tokun-ai-aura__ring${reverse ? ' tokun-ai-aura__ring--reverse' : ''}`}
      style={{ '--orbit-duration': `${duration}s` }}
    >
      {Array.from({ length: nodes }).map((_, i) => {
        const angle = offset + (360 / nodes) * i
        return (
          <div
            key={i}
            className="tokun-ai-aura__orbit-node"
            style={{ transform: `rotate(${angle}deg) translateY(-${radius}px)` }}
          >
            <span
              className="tokun-ai-aura__node-core"
              style={{ '--node-delay': `${i * 0.3}s` }}
            />
          </div>
        )
      })}
    </div>
  )
}

function TokunAiAura({ variant = 'title' }) {
  const rootRef = useRef(null)
  const isVisible = useIsInViewport(rootRef, { rootMargin: '80px' })
  const gradId = useId()

  const isPage = variant === 'page'
  const isAmbient = variant === 'ambient'
  const isSpread = isPage || isAmbient

  const orbitRings = isPage ? PAGE_ORBIT_RINGS : isAmbient ? [] : TITLE_ORBIT_RINGS
  const floatingTokens = isSpread ? PAGE_FLOATING_TOKENS : TITLE_FLOATING_TOKENS
  const dataBits = isPage ? PAGE_DATA_BITS : isAmbient ? AMBIENT_DATA_BITS : TITLE_DATA_BITS
  const synapses = isAmbient ? AMBIENT_SYNAPSES : SYNAPSES
  const showOrbits = !isAmbient && orbitRings.length > 0
  const showScan = !isAmbient

  return (
    <div
      ref={rootRef}
      className={`tokun-ai-aura tokun-ai-aura--${variant}${isVisible ? '' : ' tokun-ai-aura--paused'}`}
      aria-hidden="true"
    >
      <div className="tokun-ai-aura__pulse" />

      <svg className="tokun-ai-aura__synapses" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
            <stop offset="50%" stopColor="rgba(168, 85, 247, 0.8)" />
            <stop offset="100%" stopColor="rgba(244, 114, 182, 0)" />
          </linearGradient>
        </defs>
        {synapses.map((line, i) => (
          <line
            key={i}
            className="tokun-ai-aura__synapse"
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={`url(#${gradId})`}
            strokeWidth="0.15"
            vectorEffect="non-scaling-stroke"
            strokeDasharray="2 4"
            style={{ '--synapse-delay': `${i * 0.15}s` }}
          />
        ))}
        {!isAmbient && (
          <circle className="tokun-ai-aura__core" cx="50" cy="50" r="1.2" fill="rgba(168, 85, 247, 0.6)" />
        )}
      </svg>

      {showOrbits && (
        <div className="tokun-ai-aura__orbits">
          {orbitRings.map((ring, i) => (
            <OrbitRing key={i} {...ring} />
          ))}
        </div>
      )}

      <div className="tokun-ai-aura__bits">
        {dataBits.map((bit) => (
          <span
            key={bit.id}
            className="tokun-ai-aura__bit"
            style={{
              '--bit-duration': `${bit.duration}s`,
              '--bit-delay': `${bit.delay}s`,
              '--bit-x0': `${bit.p0.x}px`,
              '--bit-y0': `${bit.p0.y}px`,
              '--bit-x1': `${bit.p1.x}px`,
              '--bit-y1': `${bit.p1.y}px`,
              '--bit-x2': `${bit.p2.x}px`,
              '--bit-y2': `${bit.p2.y}px`,
            }}
          >
            {bit.char}
          </span>
        ))}
      </div>

      {floatingTokens.map((token) => (
        <span
          key={token.text + token.x}
          className="tokun-ai-aura__token"
          style={{ left: token.x, top: token.y, '--token-delay': `${token.delay}s` }}
        >
          {token.text}
        </span>
      ))}

      {showScan && <div className="tokun-ai-aura__scan" />}
    </div>
  )
}

/* ============================================================
   TokunTitle (letter gradients + aura)
   ============================================================ */

const TITLE_LETTERS = [
  { char: 'T', className: 'tokun-title__letter--t' },
  { char: 'O', className: 'tokun-title__letter--o' },
  { char: 'K', className: 'tokun-title__letter--k' },
  { char: 'U', className: 'tokun-title__letter--u' },
  { char: 'N', className: 'tokun-title__letter--n' },
]

function TokunTitle() {
  return (
    <div className="tokun-title">
      <div className="tokun-title__stage">
        <TokunAiAura />
        <h1 className="tokun-title__word" aria-label="TOKUN">
          {TITLE_LETTERS.map(({ char, className }, i) => (
            <span key={char + i} className={`tokun-title__letter ${className}`}>
              {char}
            </span>
          ))}
        </h1>
      </div>
    </div>
  )
}

/* ============================================================
   TypingSubtitle
   ============================================================ */

const QUIET = 'Enter the'
const ACCENT = 'Productverse'
const FULL_TEXT = `${QUIET} ${ACCENT}`

const TYPE_MS = 85
const DELETE_MS = 45
const PAUSE_TYPED_MS = 2200
const PAUSE_EMPTY_MS = 600

function TypingSubtitle() {
  const [count, setCount] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (reducedMotion) return

    const isComplete = count === FULL_TEXT.length
    const isEmpty = count === 0

    let delay
    if (!deleting && !isComplete) delay = TYPE_MS
    else if (!deleting && isComplete) delay = PAUSE_TYPED_MS
    else if (deleting && !isEmpty) delay = DELETE_MS
    else delay = PAUSE_EMPTY_MS

    const timer = setTimeout(() => {
      if (!deleting && !isComplete) setCount((c) => c + 1)
      else if (!deleting && isComplete) setDeleting(true)
      else if (deleting && !isEmpty) setCount((c) => c - 1)
      else setDeleting(false)
    }, delay)

    return () => clearTimeout(timer)
  }, [count, deleting, reducedMotion])

  const effectiveCount = reducedMotion ? FULL_TEXT.length : count
  const visible = FULL_TEXT.slice(0, effectiveCount)

  let quietPart = ''
  let showSpace = false
  let accentPart = ''

  if (visible.length <= QUIET.length) {
    quietPart = visible
  } else {
    quietPart = QUIET
    showSpace = visible.length > QUIET.length
    accentPart = visible.slice(QUIET.length + 1)
  }

  return (
    <span className="typing-subtitle" aria-label={FULL_TEXT}>
      {quietPart && <span className="hero__subtitle-quiet">{quietPart}</span>}
      {showSpace && (
        <span className="typing-subtitle__space" aria-hidden="true">
          {' '}
        </span>
      )}
      {accentPart && <span className="hero__subtitle-accent">{accentPart}</span>}
      {!reducedMotion && <span className="typing-subtitle__cursor" aria-hidden="true" />}
    </span>
  )
}

/* ============================================================
   AnimatedCounter
   ============================================================ */

function parseStatValue(value) {
  if (!/^[\d.]+/.test(value)) return null
  const match = value.match(/^([\d.]+)(.*)$/)
  if (!match) return null
  return { num: parseFloat(match[1]), suffix: match[2] }
}

function AnimatedCounter({ value, duration = 2 }) {
  const ref = useRef(null)
  /* Positive margin, for the same reason as REVEAL_VIEWPORT: at '-50px' the
     count only started once the number was already on screen, so a 2s count-up
     was still running long after the reader had passed it — the stat read as
     stuck on 0 while the rest of the row had settled. */
  const isInView = useInView(ref, { once: true, margin: '260px' })
  const parsed = parseStatValue(value)
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { duration: duration * 1000, bounce: 0 })

  useEffect(() => {
    if (isInView && parsed) motionValue.set(parsed.num)
  }, [isInView, motionValue, parsed])

  useEffect(() => {
    if (!parsed) return
    const el = ref.current
    if (!el) return

    return spring.on('change', (v) => {
      const formatted = Number.isInteger(parsed.num) ? Math.round(v) : v.toFixed(1)
      el.textContent = `${formatted}${parsed.suffix}`
    })
  }, [spring, parsed])

  const initial = parsed ? `0${parsed.suffix}` : value

  return <span ref={ref}>{initial}</span>
}

/* ============================================================
   HeroBackground
   ============================================================ */

const WAVES = [
  'M0,200 Q200,120 400,200 T800,200 T1200,200',
  'M0,220 Q250,140 500,220 T1000,220 T1500,220',
  'M0,240 Q300,160 600,240 T1200,240 T1800,240',
  'M0,260 Q350,180 700,260 T1400,260 T2100,260',
  'M0,280 Q400,200 800,280 T1600,280 T2400,280',
]

const PARTICLES_FULL = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: 15 + Math.random() * 70,
  y: 20 + Math.random() * 60,
  size: 1.5 + Math.random() * 2.5,
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 4,
}))

const PARTICLES_SUBTLE = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: 20 + (i * 9) % 60,
  y: 15 + (i * 11) % 50,
  size: 1.5 + (i % 2),
  delay: i * 0.6,
  duration: 5 + (i % 3),
}))

function HeroBackground({ variant = 'full' }) {
  const isSubtle = variant === 'subtle'
  const particles = isSubtle ? PARTICLES_SUBTLE : PARTICLES_FULL
  const waves = isSubtle ? WAVES.slice(0, 2) : WAVES
  const rootRef = useRef(null)
  const isVisible = useIsInViewport(rootRef, { rootMargin: '100px' })
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  const blob1X = useTransform(springX, [-1, 1], [-30, 30])
  const blob1Y = useTransform(springY, [-1, 1], [-20, 20])
  const blob2X = useTransform(springX, [-1, 1], [20, -20])
  const blob2Y = useTransform(springY, [-1, 1], [15, -15])

  useEffect(() => {
    if (!isVisible || isSubtle) return

    let frame = 0
    let pendingX = 0
    let pendingY = 0

    const handleMove = (e) => {
      pendingX = (e.clientX / window.innerWidth) * 2 - 1
      pendingY = (e.clientY / window.innerHeight) * 2 - 1
      if (frame) return
      frame = requestAnimationFrame(() => {
        mouseX.set(pendingX)
        mouseY.set(pendingY)
        frame = 0
      })
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [isVisible, isSubtle, mouseX, mouseY])

  return (
    <div
      ref={rootRef}
      className={`hero-bg hero-bg--${variant}${isVisible ? '' : ' hero-bg--paused'}`}
      aria-hidden="true"
    >
      <div className="hero-bg__gradient" />

      <motion.div
        className="hero-bg__blob-wrap hero-bg__blob-wrap--1"
        style={{ x: isVisible && !isSubtle ? blob1X : 0, y: isVisible && !isSubtle ? blob1Y : 0 }}
      >
        <div className="hero-bg__blob hero-bg__blob--1" />
      </motion.div>
      <motion.div
        className="hero-bg__blob-wrap hero-bg__blob-wrap--2"
        style={{ x: isVisible && !isSubtle ? blob2X : 0, y: isVisible && !isSubtle ? blob2Y : 0 }}
      >
        <div className="hero-bg__blob hero-bg__blob--2" />
      </motion.div>
      {!isSubtle && <div className="hero-bg__blob hero-bg__blob--3" />}

      <svg className="hero-bg__waves" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0)" />
            <stop offset="30%" stopColor="rgba(168, 85, 247, 0.15)" />
            <stop offset="70%" stopColor="rgba(56, 189, 248, 0.15)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
          </linearGradient>
        </defs>
        {waves.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="url(#waveGrad)"
            strokeWidth={0.8}
            initial={isSubtle ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: isSubtle ? 0.18 : 0.4 + i * 0.05 }}
            transition={
              isSubtle
                ? { duration: 0 }
                : { duration: 2.5, delay: 0.3 + i * 0.15, ease: 'easeOut' }
            }
          />
        ))}
      </svg>

      <div className="hero-bg__particles">
        {particles.map((p) => (
          <span
            key={p.id}
            className="hero-bg__particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              '--particle-duration': `${p.duration}s`,
              '--particle-delay': `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="hero-bg__grid" />
    </div>
  )
}

/* ============================================================
   ShaderBackground (WebGL plasma grid)
   ============================================================ */

const VS_SOURCE = `
  attribute vec4 aVertexPosition;
  void main() {
    gl_Position = aVertexPosition;
  }
`

const FS_SOURCE = `
  precision highp float;
  uniform vec2 iResolution;
  uniform float iTime;

  const float overallSpeed = 0.14;
  const float gridSmoothWidth = 0.015;
  const float axisWidth = 0.05;
  const float majorLineWidth = 0.025;
  const float minorLineWidth = 0.0125;
  const float majorLineFrequency = 5.0;
  const float minorLineFrequency = 1.0;
  const float scale = 5.0;
  const vec4 lineColor = vec4(0.55, 0.32, 0.95, 1.0);
  const float minLineWidth = 0.01;
  const float maxLineWidth = 0.18;
  const float lineSpeed = 1.0 * overallSpeed;
  const float lineAmplitude = 0.85;
  const float lineFrequency = 0.2;
  const float warpSpeed = 0.18 * overallSpeed;
  const float warpFrequency = 0.5;
  const float warpAmplitude = 0.9;
  const float offsetFrequency = 0.5;
  const float offsetSpeed = 1.33 * overallSpeed;
  const float minOffsetSpread = 0.6;
  const float maxOffsetSpread = 2.0;
  const int linesPerGroup = 12;

  #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
  #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
  #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))
  #define drawPeriodicLine(freq, width, t) drawCrispLine(freq / 2.0, width, abs(mod(t, freq) - (freq) / 2.0))

  float random(float t) {
    return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
  }

  float getPlasmaY(float x, float horizontalFade, float offset) {
    return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * lineAmplitude + offset;
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 space = (fragCoord - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;

    float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
    float verticalFade = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);

    space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + horizontalFade);
    space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * horizontalFade;

    vec4 lines = vec4(0.0);

    for (int l = 0; l < linesPerGroup; l++) {
      float normalizedLineIndex = float(l) / float(linesPerGroup);
      float offsetTime = iTime * offsetSpeed;
      float offsetPosition = float(l) + space.x * offsetFrequency;
      float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;
      float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 2.0;
      float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);
      float linePosition = getPlasmaY(space.x, horizontalFade, offset);
      float line = drawSmoothLine(linePosition, halfWidth, space.y) / 2.0 + drawCrispLine(linePosition, halfWidth * 0.15, space.y);

      float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
      vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));
      float circle = drawCircle(circlePosition, 0.01, space) * 3.0;

      line = line + circle;
      lines += line * lineColor * rand;
    }

    vec4 fragColor = lines * 0.9;
    fragColor.rgb *= mix(0.35, 1.0, verticalFade * horizontalFade + 0.25);
    fragColor.a = clamp(length(fragColor.rgb) * 1.4, 0.0, 0.85);

    gl_FragColor = fragColor;
  }
`

function loadShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function initShaderProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Shader program link error:', gl.getProgramInfoLog(program))
    return null
  }
  return program
}

function ShaderBackground({ className = '' }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const glRef = useRef(null)
  const programInfoRef = useRef(null)
  const positionBufferRef = useRef(null)
  const startTimeRef = useRef(Date.now())
  const isInView = useIsInViewport(containerRef, { rootMargin: '120px' })
  const pageVisible = usePageVisible()
  const shouldRender = isInView && pageVisible

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
    if (!gl) {
      console.warn('WebGL not supported.')
      return
    }

    const shaderProgram = initShaderProgram(gl, VS_SOURCE, FS_SOURCE)
    if (!shaderProgram) return

    glRef.current = gl
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const positionBuffer = gl.createBuffer()
    positionBufferRef.current = positionBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    )

    programInfoRef.current = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      },
      uniformLocations: {
        resolution: gl.getUniformLocation(shaderProgram, 'iResolution'),
        time: gl.getUniformLocation(shaderProgram, 'iTime'),
      },
    }

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      const w = Math.max(1, Math.floor(width))
      const h = Math.max(1, Math.floor(height))
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()
    startTimeRef.current = Date.now()

    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafRef.current)
      glRef.current = null
      programInfoRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!shouldRender) {
      cancelAnimationFrame(rafRef.current)
      return
    }

    const canvas = canvasRef.current
    const gl = glRef.current
    const programInfo = programInfoRef.current
    const positionBuffer = positionBufferRef.current
    if (!canvas || !gl || !programInfo || !positionBuffer) return

    const render = () => {
      const currentTime = (Date.now() - startTimeRef.current) / 1000
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(programInfo.program)
      gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height)
      gl.uniform1f(programInfo.uniformLocations.time, currentTime)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [shouldRender])

  return (
    <div ref={containerRef} className={`shader-background ${className}`.trim()} aria-hidden="true">
      <canvas ref={canvasRef} className="shader-background__canvas" />
    </div>
  )
}

/* ============================================================
   GradientButton (hero)
   ============================================================ */

function GradientButton({ children, variant = 'primary', className = '', to }) {
  const navigate = useNavigate()
  return (
    <motion.button
      type="button"
      onClick={() => to && navigate(to)}
      className={`hero-btn hero-btn--${variant} ${className}`}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {variant === 'primary' && (
        <span className="hero-btn__motion-lines" aria-hidden="true">
          <span /><span /><span />
        </span>
      )}
      <span className="hero-btn__text">{children}</span>
      {variant !== 'ghost' && (
        <span className="hero-btn__icon">
          <ArrowRight size={16} />
        </span>
      )}
    </motion.button>
  )
}

/* ============================================================
   Landing nav
   ============================================================

   Same scroll behaviour as the app header in components/Header.tsx, and
   deliberately the same CLASSES — `.site-header*` in index.css owns the panel,
   the column ladder and the travel, so the two bars can't drift apart. At the
   top it's fully transparent so the hero reads as full-bleed; past the
   threshold a frosted panel fades in and both ends pull towards the middle,
   leaving a rounded island floating over the page.

   Two differences from the app header, both landing-only and both in
   landing-page.css:
     - `fixed`, not `sticky` — see the note on .landing-nav for why a bar in
       flow put a black band above the hero.
     - the panel inset and the on-scroll logo scale are tuned for this bar's
       much taller logo (110px against the app's 56–88px).

   Contents stay just the two things: the mark, and the account dropdown (or
   the signed-out pair). None of the app header's icon rail belongs here.

   It lives OUTSIDE <Hero>: `.hero` sets `contain: layout`, which makes it the
   containing block for fixed children — a bar inside it would be anchored to
   the hero and scroll away with it, which is exactly what the old jump-to-CTA
   button did.
   ============================================================ */

/* Mirrors the app header's scroll state. Two thresholds, not one: a scroll
   that hovers on a single line flips the state every frame and the panel
   strobes. The gap between them is the dead zone. */
/* The bar itself is components/SiteNav.tsx now, floating variant, and the same
   component every other page renders (docked). Its markup, its scroll state and
   the signed-out Login / Get Started pair all used to be duplicated here, which
   is how the landing bar and the app bar ended up looking like two different
   products' headers.

   The one thing that stays landing-only is the signed-in slot: here it's the
   hero account dropdown, while the rest of the app has the full app header.
   SiteNav takes that as children. */
function LandingNav() {
  const { isAuthenticated } = useAuth()

  return <SiteNav>{isAuthenticated ? <HeroAccountMenu /> : undefined}</SiteNav>
}

/* ============================================================
   Hero
   ============================================================ */

const STATS = [
  { label: 'Products Optimized', value: '50k' },
  { label: 'Token Reduction', value: '60%' },
  { label: 'User Rating', value: '4.9', icon: Star },
  { label: 'Support', value: '24/7' },
]

const heroFadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
}

/**
 * The scroll cue's own click handler.
 *
 * It was a bare `href="#what-we-offer"`, which the browser answers by JUMPING
 * — the hero is gone and What We Offer is simply there, with no sense of having
 * moved between them. Worse, the anchor jump puts the section's top flush with
 * the viewport top, and the landing nav is FIXED over that, so the "Capabilities"
 * eyebrow and part of the heading landed underneath the bar.
 *
 * So: glide there, and stop below the nav (the offset is `scroll-margin-top` on
 * the section, in landing-page.css, so it applies to a hash-link arrival too).
 * The href stays as-is — it's still the correct link if JS hasn't loaded, and
 * middle-click still works.
 */
function scrollToWhatWeOffer(e: React.MouseEvent<HTMLAnchorElement>) {
  const target = document.getElementById('what-we-offer')
  if (!target) return // let the browser follow the href

  e.preventDefault()
  target.scrollIntoView({
    // Honoured, not assumed: a smooth 100vh glide is exactly what someone with
    // vestibular sensitivity turned this setting off for.
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
    block: 'start',
  })
}

function Hero() {
  return (
    <section className="hero">
      <HeroBackground />

      <div className="hero__content">
        <motion.div
          className="hero__title-wrap"
          initial="hidden"
          animate="visible"
          variants={heroFadeUp}
          custom={0}
        >
          <TokunTitle />
        </motion.div>

        <motion.h2
          className="hero__subtitle"
          initial="hidden"
          animate="visible"
          variants={heroFadeUp}
          custom={1}
        >
          <span className="hero__subtitle-line" aria-hidden="true" />
          <span className="hero__subtitle-text">
            <TypingSubtitle />
          </span>
          <span className="hero__subtitle-line" aria-hidden="true" />
        </motion.h2>

        <motion.p
          className="hero__description"
          initial="hidden"
          animate="visible"
          variants={heroFadeUp}
          custom={2}
        >
          Optimize your LLM products, generate better outcomes, and monetize your
          best products—all in one place.
        </motion.p>

        <motion.div
          className="hero__ctas"
          initial="hidden"
          animate="visible"
          variants={heroFadeUp}
          custom={3}
        >
          <GradientButton variant="primary" to={ROUTES.smartgen}>Try Smartgen</GradientButton>
          <Link to={ROUTES.marketplace} className="hero-btn hero-btn--ghost">
            <span className="hero-btn__text">Product Verse</span>
          </Link>
        </motion.div>

        <motion.div
          className="hero__stats"
          initial="hidden"
          animate="visible"
          variants={heroFadeUp}
          custom={4}
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} className="hero__stat">
              {i > 0 && <span className="hero__stat-divider" />}
              <span className="hero__stat-label">{stat.label}</span>
              <span className="hero__stat-value">
                {stat.icon && <stat.icon size={18} className="hero__stat-star" />}
                <AnimatedCounter value={stat.value} />
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <a
          href="#what-we-offer"
          className="hero__scroll-link"
          onClick={scrollToWhatWeOffer}
        >
          <div className="hero__scroll-inner">
            <Mouse size={20} strokeWidth={1.5} />
            <span>Scroll down</span>
            <ChevronDown size={16} />
          </div>
        </a>
      </motion.div>

      {/* The round "→" jump-to-CTA used to sit here, bottom-right. It read as a
          floating action button but never behaved like one: `.hero` sets
          `contain: layout`, which makes it the containing block for fixed
          children, so the FAB was anchored to the hero rather than the viewport
          and slid up out of view the moment you scrolled. The hero already has
          two CTAs and the scroll cue, so it's gone rather than re-anchored. */}
    </section>
  )
}

/* ============================================================
   WhatWeOffer
   ============================================================ */

const OFFERS = [
  {
    num: '01',
    icon: Zap,
    title: 'Prompt Optimiser',
    description:
      'Reduce token usage by up to 60% while maintaining meaning and effectiveness across all LLM platforms.',
    accent: '#38bdf8',
    href: ROUTES.optimizer,
  },
  {
    num: '02',
    icon: Sparkles,
    title: 'Smartgen',
    description:
      'Transform simple ideas into powerful, optimized products with our AI-powered generation system.',
    accent: '#a855f7',
    href: ROUTES.smartgen,
  },
  {
    num: '03',
    icon: TrendingUp,
    title: 'Product Verse',
    description:
      'Built a great product? Trade it. Monetize your creativity and earn from your best product innovations.',
    accent: '#ec4899',
    href: ROUTES.marketplace,
  },
  {
    // Replaced Prompt Library here. The library is a signed-in tool — it shows
    // you prompts you already have access to — so it had nothing to offer the
    // visitor this section is written for. Find Creators does: it's the half of
    // the product a logged-out reader can act on immediately.
    num: '04',
    icon: Users,
    title: 'Find Creators',
    description:
      'Hire the people behind the products. Browse verified creators, see their work, and book them with payment held safely.',
    accent: '#22d3ee',
    href: ROUTES.findCreators,
  },
]

function WhatWeOffer() {
  return (
    <section id="what-we-offer" className="what-we-offer">
      <div className="what-we-offer__shader-wrap">
        <ShaderBackground />
      </div>
      <div className="what-we-offer__bg-grid" aria-hidden="true" />

      <div className="what-we-offer__inner">
        <motion.div
          className="what-we-offer__header"
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          variants={fadeUp}
        >
          <span className="what-we-offer__eyebrow">Capabilities</span>
          <h2 className="what-we-offer__title">What We Offer</h2>
          <p className="what-we-offer__lead">
            Everything you need to craft, optimize, and monetize products in the
            age of AI.
          </p>
        </motion.div>

        <div className="what-we-offer__grid">
          {OFFERS.map((offer, i) => (
            <motion.article
              key={offer.num}
              className="offer-card"
              style={{ '--card-accent': offer.accent }}
              initial="hidden"
              whileInView="visible"
              viewport={REVEAL_VIEWPORT}
              variants={fadeUp}
              custom={i + 1}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <div className="offer-card__body">
                <div className="offer-card__top">
                  <span className="offer-card__icon">
                    <offer.icon size={18} strokeWidth={2} />
                  </span>
                  <span className="offer-card__num">{offer.num}</span>
                </div>

                <h3 className="offer-card__title">{offer.title}</h3>
                <p className="offer-card__desc">{offer.description}</p>

                {/* Driven by the offer's own `href` rather than a title match,
                    so adding a card is one entry in OFFERS.

                    All four now carry one. The Optimiser and Smartgen cards used
                    to fall through to the #explore branch below — an anchor with
                    no element of that name anywhere on the page, so "Explore" was
                    a button that did nothing at all. They were left that way
                    because both pages need a sign-in, but that is what RequireAuth
                    is for: it sends a signed-out visitor to /login instead of the
                    card silently ignoring the click.

                    The #explore fallback stays only to catch a future card added
                    without an href — it should not be reached today. */}
                {offer.href ? (
                  <Link to={offer.href} className="offer-card__link">
                    Explore
                    <span className="offer-card__link-icon">
                      <ArrowRight size={14} />
                    </span>
                  </Link>
                ) : (
                  <a href="#explore" className="offer-card__link">
                    Explore
                    <span className="offer-card__link-icon">
                      <ArrowRight size={14} />
                    </span>
                  </a>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   LaptopDemo
   ============================================================ */

/* The mock UI's tab strip. "Product Library" was the fourth one and is gone —
   the library is a signed-in tool and is already hidden from the app nav and the
   footer, so advertising it here sent people to something they can't see.

   ACTIVE_TAB is named rather than compared inline because the tab that was
   removed was ALSO the highlighted one: dropping it from this array left the
   strip with nothing active at all, and the next person to edit the list would
   have hit the same thing. */
const TABS = ['Smartgen', 'Prompt Optimiser', 'Product Verse']
const ACTIVE_TAB = 'Product Verse'

const SAVED_ITEMS = [
  { title: 'SEO Blog Writer', tag: 'Marketing', tokens: '-42%' },
  { title: 'React Component Gen', tag: 'Coding', tokens: '-38%' },
  { title: 'Product Launch Email', tag: 'Marketing', tokens: '-51%' },
]

function LaptopDemo() {
  return (
    <div className="laptop-demo">
      <div className="laptop-demo__ambient" aria-hidden="true" />

      <div className="laptop-demo__stage">
        <div className="laptop-demo__frame">
          <div className="laptop-demo__chrome">
            <div className="laptop-demo__dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="laptop-demo__url">
              <span className="laptop-demo__lock" aria-hidden="true" />
              app.tokun.world
            </div>
            <div className="laptop-demo__chrome-spacer" aria-hidden="true" />
          </div>

          <div className="laptop-demo__viewport">
            <div className="laptop-ui">
              <header className="laptop-ui__nav">
                <div className="laptop-ui__brand">
                  <span className="laptop-ui__brand-dot" />
                  TOKUN.WORLD
                </div>
                <div className="laptop-ui__actions">
                  <button type="button" className="laptop-ui__btn laptop-ui__btn--ghost">
                    + Post a prompt
                  </button>
                  <button type="button" className="laptop-ui__btn laptop-ui__btn--pro">
                    Get Pro
                  </button>
                  <span className="laptop-ui__user">Hello, Ashutosh</span>
                </div>
              </header>

              <h3 className="laptop-ui__title">Saved Items</h3>

              <div className="laptop-ui__tabs">
                {TABS.map((tab) => (
                  <span
                    key={tab}
                    className={`laptop-ui__tab${tab === ACTIVE_TAB ? ' laptop-ui__tab--active' : ''}`}
                  >
                    {tab}
                  </span>
                ))}
              </div>

              <div className="laptop-ui__list">
                {SAVED_ITEMS.map((item) => (
                  <div key={item.title} className="laptop-ui__row">
                    <div>
                      <p className="laptop-ui__row-title">{item.title}</p>
                      <span className="laptop-ui__row-tag">{item.tag}</span>
                    </div>
                    <span className="laptop-ui__row-stat">{item.tokens}</span>
                  </div>
                ))}
              </div>
            </div>

            <button type="button" className="laptop-demo__play" aria-label="Play product demo">
              <Play size={22} fill="currentColor" strokeWidth={0} />
            </button>
          </div>
        </div>

        <div className="laptop-demo__reflection" aria-hidden="true">
          <div className="laptop-demo__reflection-inner" />
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   HowItWorks
   ============================================================ */

const STEPS = [
  { num: '01', icon: MessageSquarePlus, title: 'Input Idea', description: 'Share your concept or requirement', accent: '#38bdf8' },
  { num: '02', icon: Sparkles, title: 'SmartGen', description: 'AI generates optimized products', accent: '#a855f7' },
  { num: '03', icon: Zap, title: 'Optimize', description: 'Reduce tokens, improve quality', accent: '#818cf8' },
  { num: '04', icon: BarChart3, title: 'Save or Sale', description: 'Store in library or marketplace', accent: '#ec4899' },
  { num: '05', icon: Wallet, title: 'Earn', description: 'Monetize your best products', accent: '#f472b6' },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works">
      <div className="how-it-works__grid-bg" aria-hidden="true" />

      <div className="how-it-works__inner">
        <motion.div
          className="how-it-works__header"
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          variants={fadeUp}
        >
          <span className="how-it-works__badge">Process</span>
          <h2 className="how-it-works__title">How It Works</h2>
        </motion.div>

        <div className="how-it-works__steps">
          {STEPS.map((step, i) => (
            <motion.article
              key={step.num}
              className="how-step"
              style={{ '--step-accent': step.accent }}
              initial="hidden"
              whileInView="visible"
              viewport={REVEAL_VIEWPORT}
              variants={fadeUp}
              custom={i + 1}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            >
              <div className="how-step__top">
                <span className="how-step__icon">
                  <step.icon size={20} strokeWidth={1.75} />
                </span>
                <span className="how-step__num">{step.num}</span>
              </div>
              <h3 className="how-step__title">{step.title}</h3>
              <p className="how-step__desc">{step.description}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="how-it-works__demo"
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          variants={fadeUp}
          custom={6}
        >
          <h3 className="how-it-works__demo-title">Product Demo</h3>
          <p className="how-it-works__demo-lead">Video demonstration of earn feature</p>
          <LaptopDemo />
        </motion.div>
      </div>
    </section>
  )
}

/* ============================================================
   CtaSection
   ============================================================ */

function CtaSection() {
  const navigate = useNavigate()
  return (
    <section id="cta" className="cta-section">
      <div className="cta-section__inner">
        <motion.div
          className="cta-section__header"
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          variants={fadeUp}
        >
          <span className="cta-section__badge">Reach out any time</span>
          <h2 className="cta-section__title">Ready to optimize your products?</h2>
          <p className="cta-section__lead">
            Join thousands of developers who are already saving costs and
            improving efficiency with TOKUN.
          </p>
        </motion.div>

        <motion.div
          className="cta-section__action"
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          variants={fadeUp}
          custom={2}
        >
          <div className="cta-section__btn-glow" aria-hidden="true" />
          {/* To the Optimiser, which is what the button says it does.

              It pointed at ROUTES.app — and /app renders THIS PAGE again, in its
              signed-in variant (see pages/AppPage.tsx). So "Start Optimizing Now"
              scrolled you back to a landing page that looks identical to the one
              you were already on, which reads as a button that does nothing at
              all rather than one that navigated. */}
          <motion.button
            type="button"
            className="cta-btn"
            onClick={() => navigate(ROUTES.optimizer)}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <span className="cta-btn__text">Start Optimizing Now</span>
            <span className="cta-btn__icon">
              <ArrowRight size={18} strokeWidth={2.5} />
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

/* ============================================================
   Testimonials (marquee)
   ============================================================ */

const TESTIMONIALS = [
  { name: 'Shivani', role: 'AI ML Developer', initial: 'S', accent: '#38bdf8', quote: "Tokun's optimization is a game-changer. I used to get 10x slower inference; now it's 3x faster with fewer tokens." },
  { name: 'Marcus Chen', role: 'Staff Engineer', initial: 'M', accent: '#a855f7', quote: 'SmartGen saved our team hours every week. The marketplace is where we discover products that work in production.' },
  { name: 'Elena Rodriguez', role: 'Product Lead', initial: 'E', accent: '#ec4899', quote: 'We cut API costs by 40% without sacrificing output quality. TOKUN feels like a senior product engineer on the team.' },
  { name: 'Bilal Ahmed', role: 'IT Manager', initial: 'B', accent: '#818cf8', quote: 'Implementing TOKUN was smooth and quick. The team adapted fast and our product workflows are noticeably cleaner.' },
  { name: 'Priya Nair', role: 'Product Engineer', initial: 'P', accent: '#f472b6', quote: 'The token reduction alone paid for itself in the first month. Optimization quality is consistently impressive.' },
  { name: 'James Okonkwo', role: 'Founder', initial: 'J', accent: '#38bdf8', quote: 'Our startup runs lean. TOKUN helps us ship AI features without burning through our inference budget.' },
  { name: 'Sofia Laurent', role: 'Data Scientist', initial: 'S', accent: '#a855f7', quote: 'I love how the library keeps our best products organized. Sharing across the team has never been this easy.' },
  { name: 'Arjun Patel', role: 'DevOps Lead', initial: 'A', accent: '#ec4899', quote: 'Reliable, fast, and beautifully designed. TOKUN slots right into our stack without any friction.' },
  { name: 'Nina Kowalski', role: 'Content Strategist', initial: 'N', accent: '#4ade80', quote: 'My marketing products went from bloated to razor-sharp. Output quality improved while costs dropped.' },
]


const ACCENT_COLORS = ['#38bdf8', '#a855f7', '#ec4899', '#818cf8', '#f472b6', '#4ade80', '#fb923c', '#34d399', '#f87171']

function TestimonialCard({ item }) {
  return (
    <article className="t-marquee-card" style={{ '--card-accent': item.accent } as any}>
      {item.rating > 0 && (
        <div className="t-marquee-card__stars">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ color: i < item.rating ? '#facc15' : 'rgba(255,255,255,0.2)', fontSize: 13 }}>★</span>
          ))}
        </div>
      )}
      <p className="t-marquee-card__quote">{item.quote}</p>
      <footer className="t-marquee-card__author">
        {item.profilePicture ? (
          <img
            src={`${API_BASE}${item.profilePicture}`}
            alt={item.name}
            className="t-marquee-card__avatar"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <span className="t-marquee-card__avatar">{item.initial}</span>
        )}
        <div>
          <cite className="t-marquee-card__name">{item.name}</cite>
          <p className="t-marquee-card__role">{item.role}</p>
        </div>
      </footer>
    </article>
  )
}

function MarqueeColumn({ items, duration, delay }: { items: any[], duration: number, delay: number }) {
  return (
    <div
      className="marquee-col"
      style={{ '--marquee-duration': `${duration}s`, '--marquee-delay': `${delay}s` } as any}
    >
      <div className="marquee-col__track">
        <div className="marquee-col__group">
          {items.map((item, i) => (
            <TestimonialCard key={`a-${i}`} item={item} />
          ))}
        </div>
        <div className="marquee-col__group" aria-hidden="true">
          {items.map((item, i) => (
            <TestimonialCard key={`b-${i}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Testimonials() {
  const sectionRef = useRef(null)
  const isVisible = useIsInViewport(sectionRef, { rootMargin: '100px' })
  const [liveItems, setLiveItems] = useState(TESTIMONIALS)

  useEffect(() => {
    fetch(`${API_BASE}/api/feedback/top`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.feedbacks?.length >= 1) {
          const mapped = data.feedbacks.map((f: any, i: number) => ({
            name: f.name,
            role: f.role || 'Tokun User',
            initial: (f.name?.[0] || 'U').toUpperCase(),
            accent: ACCENT_COLORS[i % ACCENT_COLORS.length],
            quote: f.experience,
            profilePicture: f.profilePicture || null,
            rating: Number(f.rating) || 0,
          }))
          // Fill up to 9 with hardcoded fallback if needed
          const combined = mapped.length >= 9
            ? mapped
            : [...mapped, ...TESTIMONIALS.slice(0, 9 - mapped.length)]
          setLiveItems(combined)
        }
      })
      .catch(() => {})
  }, [])

  const columns = [
    { items: liveItems.filter((_: any, i: number) => i % 3 === 0), duration: 32, delay: 0 },
    { items: liveItems.filter((_: any, i: number) => i % 3 === 1), duration: 38, delay: -12 },
    { items: liveItems.filter((_: any, i: number) => i % 3 === 2), duration: 35, delay: -22 },
  ]

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className={`testimonials${isVisible ? '' : ' testimonials--paused'}`}
    >
      <div className="testimonials__grid-bg" aria-hidden="true" />

      <div className="testimonials__inner">
        <motion.div
          className="testimonials__header"
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          variants={fadeUp}
        >
          <span className="testimonials__badge">Wall of Love</span>
          <h2 className="testimonials__title">What our users say</h2>
          <p className="testimonials__lead">See what our customers have to say about us</p>
        </motion.div>

        <motion.div
          className="testimonials__marquee"
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          variants={fadeUp}
          custom={2}
        >
          <div className="testimonials__fade testimonials__fade--top" aria-hidden="true" />
          <div className="testimonials__fade testimonials__fade--bottom" aria-hidden="true" />

          <div className="testimonials__columns">
            {columns.map((col, i) => (
              <MarqueeColumn key={i} items={col.items} duration={col.duration} delay={col.delay} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ============================================================
   GlobeSection (3D globe + rotating reviews)
   ============================================================ */

const GLOBE_USERS = [
  { lat: 35.6, lon: 139.7, flag: '🇯🇵', name: 'Yuki Tanaka', city: 'Tokyo, Japan', msg: 'I love SmartGen! Saves me hours every day ✨' },
  { lat: 51.5, lon: -0.1, flag: '🇬🇧', name: 'James Harper', city: 'London, UK', msg: 'Cut my GPT-4 costs by 58% with Tokun!' },
  { lat: 37.7, lon: -122.4, flag: '🇺🇸', name: 'Sarah Chen', city: 'San Francisco, USA', msg: 'Best product tool on the market 🔥' },
  { lat: 48.8, lon: 2.3, flag: '🇫🇷', name: 'Léa Moreau', city: 'Paris, France', msg: 'Tokun marketplace made me ₹800 this month! 💰' },
  { lat: 28.6, lon: 77.2, flag: '🇮🇳', name: 'Arjun Sharma', city: 'New Delhi, India', msg: 'SmartGen is a total game changer for AI devs!' },
  { lat: -23.5, lon: -46.6, flag: '🇧🇷', name: 'Lucas Oliveira', city: 'São Paulo, Brazil', msg: 'Melhor ferramenta de products! 🚀' },
  { lat: 1.4, lon: 103.8, flag: '🇸🇬', name: 'Wei Liang', city: 'Singapore', msg: 'Our whole team switched to Tokun. No regrets!' },
  { lat: 55.7, lon: 37.6, flag: '🇷🇺', name: 'Dmitri Volkov', city: 'Moscow, Russia', msg: 'Token optimization is genuinely impressive 👏' },
  { lat: -33.8, lon: 151.2, flag: '🇦🇺', name: 'Emma Wilson', city: 'Sydney, Australia', msg: 'Love the product library! Saves so much time ⚡' },
  { lat: 52.5, lon: 13.4, flag: '🇩🇪', name: 'Klaus Weber', city: 'Berlin, Germany', msg: 'Tokun API integrates perfectly with our stack!' },
  { lat: 19.0, lon: 72.8, flag: '🇮🇳', name: 'Priya Nair', city: 'Mumbai, India', msg: 'SmartGen wrote a better product than me 😂❤️' },
  { lat: 40.7, lon: -74.0, flag: '🇺🇸', name: 'Alex Rivera', city: 'New York, USA', msg: '50K products on Tokun already? So deserved!' },
  { lat: 31.2, lon: 121.5, flag: '🇨🇳', name: 'Li Wei', city: 'Shanghai, China', msg: 'Supports every LLM I use. Perfect tool!' },
  { lat: -1.3, lon: 36.8, flag: '🇰🇪', name: 'Amara Osei', city: 'Nairobi, Kenya', msg: 'Tokun is growing our AI startup faster 🌍' },
  { lat: 59.3, lon: 18.1, flag: '🇸🇪', name: 'Erik Lindqvist', city: 'Stockholm, Sweden', msg: 'Elegant, fast, support is amazing 🙌' },
  { lat: 25.2, lon: 55.3, flag: '🇦🇪', name: 'Farah Al-Nasser', city: 'Dubai, UAE', msg: 'Product marketplace is a brilliant idea! 💡' },
  { lat: 41.0, lon: 29.0, flag: '🇹🇷', name: 'Ceren Yilmaz', city: 'Istanbul, Turkey', msg: 'Tokun helped me 10x my freelance AI work!' },
]

const REVIEW_POSITIONS_DESKTOP = [
  { left: '18%', top: '22%', lineTo: 'bottom' },
  { left: '76%', top: '20%', lineTo: 'bottom' },
  { left: '86%', top: '49%', lineTo: 'left' },
  { left: '64%', top: '80%', lineTo: 'top' },
  { left: '24%', top: '80%', lineTo: 'top' },
  { left: '8%', top: '49%', lineTo: 'right' },
]

const REVIEW_POSITIONS_MOBILE = [
  { left: '50%', top: '12%', lineTo: 'bottom' },
  { left: '78%', top: '31%', lineTo: 'left' },
  { left: '78%', top: '64%', lineTo: 'left' },
  { left: '50%', top: '86%', lineTo: 'top' },
  { left: '22%', top: '64%', lineTo: 'right' },
  { left: '22%', top: '31%', lineTo: 'right' },
]

// three / drei / the 7.8 MB globe model all live in this chunk. It is fetched
// only when the globe is about to enter the viewport — see GlobeSection below.
const LandingGlobeCanvas = lazy(() => import('./LandingGlobeCanvas'))

/* What sits in the globe's place while its chunk and its 7.8 MB model load.
   This was a transparent box, so on a slow connection the section rendered its
   heading and then a hole — indistinguishable from something that had failed.
   A ring that is visibly waiting is not faster, but it is honest, and it stops
   people staring at a gap wondering whether to reload. */
/* `waiting` is the difference between "not here yet" and "not coming".
   The globe is skipped outright when the browser has no WebGL, and shown by the
   error boundary when it fails — in both of those it is never going to arrive, so
   a pulsing "LOADING GLOBE" would sit there lying about it forever. Same artwork,
   honest label, and no aria-busy on a thing that has stopped waiting. */
function GlobeFallback({ waiting = true }: { waiting?: boolean }) {
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '1 / 1',
        display: 'grid',
        placeItems: 'center',
      }}
      aria-busy={waiting || undefined}
      aria-label={waiting ? 'Loading the 3D globe' : 'Global community'}
    >
      <div
        style={{
          width: '62%',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.10)',
          background:
            'radial-gradient(circle at 50% 40%, rgba(124,58,237,0.14) 0%, rgba(37,99,235,0.06) 55%, transparent 72%)',
          display: 'grid',
          placeItems: 'center',
          animation: waiting ? 'globeFallbackPulse 1.8s ease-in-out infinite' : 'none',
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)' }}>
          {waiting ? 'LOADING GLOBE' : 'TOKUN.WORLD'}
        </span>
      </div>
    </div>
  )
}

function ReviewCard({ user, pos, cardKey, isMobile }) {
  const cardWidth = isMobile ? 110 : 170
  const titleFont = isMobile ? 8 : 10
  const subFont = isMobile ? 6 : 8
  const msgFont = isMobile ? 7 : 9

  const lineLen = isMobile ? 28 : 42
  const elbowLen = isMobile ? 24 : 34
  const sideLineLen = isMobile ? 28 : 30
  const gap = isMobile ? 4 : 6

  const cardLeft = Number.parseFloat(pos.left)
  const bendInward = cardLeft > 50 ? 'left' : 'right'
  const dashDown = 'repeating-linear-gradient(to bottom, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)'
  const dashUp = 'repeating-linear-gradient(to top, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)'
  const dashRight = 'repeating-linear-gradient(to right, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)'
  const dashLeft = 'repeating-linear-gradient(to left, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)'
  const dot = { width: 7, height: 7, borderRadius: '9999px', background: '#FF14EF', boxShadow: '0 0 10px rgba(255,20,239,0.7)' }

  return (
    <motion.div
      key={cardKey}
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -8 }}
      transition={{ duration: 0.35 }}
      style={{ position: 'absolute', left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)', width: cardWidth, zIndex: 20, pointerEvents: 'none' }}
    >
      <div
        style={{
          position: 'relative',
          background: 'rgba(23,23,26,0.94)',
          border: '1px solid rgba(255,20,239,0.26)',
          borderRadius: isMobile ? 8 : 12,
          padding: isMobile ? '5px 6px' : '8px 10px',
          boxShadow: '0 0 24px rgba(255,20,239,0.12), 0 8px 24px rgba(0,0,0,0.42)',
          backdropFilter: 'blur(8px)',
          color: 'white',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap, marginBottom: isMobile ? 4 : 5 }}>
          <span style={{ fontSize: isMobile ? 12 : 13 }}>{user.flag}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: titleFont, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize: subFont, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.city}</div>
          </div>
        </div>

        <p style={{ fontSize: msgFont, lineHeight: isMobile ? 1.35 : 1.5, color: 'rgba(255,255,255,0.76)', margin: 0 }}>"{user.msg}"</p>

        {pos.lineTo === 'bottom' && (
          <>
            <div style={{ position: 'absolute', left: '50%', top: '100%', transform: 'translateX(-50%)', width: 2, height: lineLen, background: dashDown }} />
            {bendInward === 'right' ? (
              <>
                <div style={{ position: 'absolute', left: '50%', top: `calc(100% + ${lineLen}px)`, width: elbowLen, height: 2, background: dashRight }} />
                <div style={{ position: 'absolute', left: `calc(50% + ${elbowLen - 4}px)`, top: `calc(100% + ${lineLen - 4}px)`, ...dot }} />
              </>
            ) : (
              <>
                <div style={{ position: 'absolute', right: '50%', top: `calc(100% + ${lineLen}px)`, width: elbowLen, height: 2, background: dashLeft }} />
                <div style={{ position: 'absolute', right: `calc(50% + ${elbowLen - 4}px)`, top: `calc(100% + ${lineLen - 4}px)`, ...dot }} />
              </>
            )}
          </>
        )}

        {pos.lineTo === 'top' && (
          <>
            <div style={{ position: 'absolute', left: '50%', bottom: '100%', transform: 'translateX(-50%)', width: 2, height: lineLen, background: dashUp }} />
            {bendInward === 'right' ? (
              <>
                <div style={{ position: 'absolute', left: '50%', bottom: `calc(100% + ${lineLen}px)`, width: elbowLen, height: 2, background: dashRight }} />
                <div style={{ position: 'absolute', left: `calc(50% + ${elbowLen - 4}px)`, bottom: `calc(100% + ${lineLen - 4}px)`, ...dot }} />
              </>
            ) : (
              <>
                <div style={{ position: 'absolute', right: '50%', bottom: `calc(100% + ${lineLen}px)`, width: elbowLen, height: 2, background: dashLeft }} />
                <div style={{ position: 'absolute', right: `calc(50% + ${elbowLen - 4}px)`, bottom: `calc(100% + ${lineLen - 4}px)`, ...dot }} />
              </>
            )}
          </>
        )}

        {pos.lineTo === 'left' && (
          <>
            <div style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', width: sideLineLen, height: 2, background: dashLeft }} />
            <div style={{ position: 'absolute', right: `calc(100% + ${sideLineLen - 4}px)`, top: '50%', transform: 'translateY(-50%)', ...dot }} />
          </>
        )}

        {pos.lineTo === 'right' && (
          <>
            <div style={{ position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)', width: sideLineLen, height: 2, background: dashRight }} />
            <div style={{ position: 'absolute', left: `calc(100% + ${sideLineLen - 4}px)`, top: '50%', transform: 'translateY(-50%)', ...dot }} />
          </>
        )}
      </div>
    </motion.div>
  )
}

function GlobeSection() {
  const [activeUser, setActiveUser] = useState(null)
  const [userIndex, setUserIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // The 3D chunk + model are only worth fetching once the reader is heading
  // here. 300px of margin gives the download a head start so the globe is
  // usually already there by the time the section is on screen.
  const canvasHostRef = useRef(null)
  /* 1200px of lead — roughly a screen and a half.
     It was 300px, which at scrolling speed is a fraction of a second, and what
     starts then is a 7.8 MB model file. On a phone that download is the whole
     wait: the chunk is already warm (see the idle prefetch below), so the only
     thing left to buy is time, and this buys about four times as much. */
  const globeNear = useInView(canvasHostRef, { once: true, margin: '1200px' })

  /* Can this browser actually give us a WebGL context?

     Asked once, and asked HERE rather than discovered by the renderer throwing
     inside the canvas. A context is refused more often than it sounds: Chrome
     caps how many one process may hold at around sixteen, so somebody with
     enough tabs open gets nothing; hardware acceleration may be off; a driver
     may be blocklisted. The probe context is thrown away immediately (`loseContext`)
     so the check itself doesn't spend one of that budget.
     `useState` with an initialiser, not an effect, so the first render already
     knows and we never mount a canvas we're about to tear down. */
  const [webglOk] = useState(() => {
    if (typeof document === 'undefined') return false
    try {
      const canvas = document.createElement('canvas')
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')
      if (!gl) return false
      ;(gl as any).getExtension?.('WEBGL_lose_context')?.loseContext?.()
      return true
    } catch {
      return false
    }
  })

  /* Fetch and parse the 3D chunk during idle time, long before the reader gets
     here — the render itself still waits for `globeNear`, so no WebGL context
     is created early.
     300px of margin is a fraction of a second at scrolling speed, and this
     chunk is the largest on the site (three.js). Starting it at that point
     meant the download AND the parse landed while the section was sliding into
     view, and parsing blocks the main thread — that was a real stall in the
     middle of the scroll, not just a late reveal. Idle time is free: the
     reader is looking at the hero.
     Skipped on Save-Data, where a megabyte of optional 3D is the wrong call. */
  useEffect(() => {
    if (navigator.connection?.saveData) return
    // Nothing to warm up if the globe is never going to mount.
    if (!webglOk) return

    const warm = () => {
      import('./LandingGlobeCanvas').catch(() => {
        // A failed prefetch is not an error worth surfacing — the Suspense
        // boundary will request it again when the section is actually reached.
      })
    }

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(warm, { timeout: 3000 })
      return () => window.cancelIdleCallback?.(id)
    }

    const timer = window.setTimeout(warm, 1500)
    return () => window.clearTimeout(timer)
  }, [webglOk])

  useEffect(() => {
    const sync = () => setIsMobile(window.innerWidth <= 640)
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  useEffect(() => {
    setActiveUser(GLOBE_USERS[0])
    const interval = setInterval(() => {
      setUserIndex((prev) => {
        const next = (prev + 1) % GLOBE_USERS.length
        setActiveUser(GLOBE_USERS[next])
        return next
      })
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const positions = isMobile ? REVIEW_POSITIONS_MOBILE : REVIEW_POSITIONS_DESKTOP
  const activeReviewPos = positions[userIndex % positions.length]

  return (
    <div className="globe-section">
      <div className="globe-section__badge">
        <span>Global Community</span>
      </div>

      <h2 className="globe-section__title">Loved across the globe</h2>
      <p className="globe-section__lead">
        Thousands of product engineers from every corner of the world trust Tokun.WORLD daily.
      </p>

      <div className="globe-wrap" style={{ maxWidth: isMobile ? 320 : 460 }}>
        <div className="globe-wrap__glow" />

        <div className="globe-canvas-box" ref={canvasHostRef}>
          {/* Two guards, and they catch different things.

              The boundary catches a throw from anywhere in the 3D subtree — a
              context that couldn't be created, a model that wouldn't parse, an
              HDR that didn't arrive — and swaps in the same artwork the loading
              state uses. Without it, React had no boundary above this point and
              a failed globe unmounted the entire page from here down: FAQ, CTA,
              testimonials, footer, all of it, leaving a black screen.

              `webglOk` stops us even getting that far when the browser has no
              context to give — which also spares those visitors the ~600 KB of
              three.js and the 8 MB model they could never have rendered.

              Suspense stays for what it is actually for: the lazy chunk and the
              model still loading. */}
          <CanvasErrorBoundary label="LandingGlobe" fallback={<GlobeFallback waiting={false} />}>
            <Suspense fallback={<GlobeFallback />}>
              {globeNear && webglOk ? (
                <LandingGlobeCanvas isMobile={isMobile} />
              ) : (
                <GlobeFallback waiting={webglOk} />
              )}
            </Suspense>
          </CanvasErrorBoundary>

          <AnimatePresence mode="wait">
            {activeUser && (
              <ReviewCard
                user={activeUser}
                pos={activeReviewPos}
                cardKey={`${activeUser.name}-${userIndex}`}
                isMobile={isMobile}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="globe-stats">
        {[['120+', 'Countries'], ['10K+', 'Active Users'], ['50K+', 'Prompts Created']].map(([num, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div className="globe-stat__num">{num}</div>
            <div className="globe-stat__label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   FAQSection
   ============================================================ */

const FAQ_ITEMS = [
  { q: 'What LLMs does Tokun support?', a: 'Tokun supports all major LLMs including GPT-4, GPT-4o, Claude 3 (Sonnet, Opus, Haiku), Gemini Pro/Ultra, Llama 3, Mistral, and more. New models are added within days of their public release.' },
  { q: 'How does the token reduction actually work?', a: 'SmartGen analyzes your intent and rewrites products to be semantically equivalent but structurally more efficient. It removes redundant instructions, consolidates overlapping requirements, and uses model-specific formatting that reduces token consumption without sacrificing output quality.' },
  { q: 'How do I earn money on the marketplace?', a: 'You list your optimized products with a price (one-time or subscription). When other users purchase your product, you receive 80% of the revenue. Payouts are processed monthly via Stripe to your bank account or PayPal.' },
  { q: 'Is my product data private and secure?', a: 'Yes. All products you create are private by default. We never train our models on your products without explicit consent. You choose what to share publicly on the marketplace. We are SOC2 Type II compliant.' },
  { q: 'Can I use the API in production apps?', a: 'Absolutely. The Tokun API is production-ready with 99.9% SLA uptime. Pro plans include 10,000 API calls/month. Teams plans have no limit. We offer dedicated infrastructure for enterprise customers requiring higher throughput.' },
  { q: 'What makes Tokun different from just using ChatGPT directly?', a: "Tokun isn't a chatbot — it's an optimization layer. It takes your raw product ideas, refines them for any LLM, tracks performance metrics, and lets you monetize your best work. It works on top of any LLM, not instead of it." },
]

function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null)
  const toggle = (i) => setOpenIdx((prev) => (prev === i ? null : i))

  return (
    <div className="faq">
      <div className="faq__badge-wrap">
        <div className="faq__badge"><span>FAQ</span></div>
      </div>

      <h2 className="faq__title">Got questions?</h2>
      <p className="faq__lead">Everything you need to know about Tokun.WORLD</p>

      <div className="faq__list">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIdx === i
          return (
            <div key={i} className={`faq__item${isOpen ? ' faq__item--open' : ''}`}>
              <button type="button" className="faq__q" onClick={() => toggle(i)}>
                <span className="faq__q-text">{item.q}</span>
                <span className="faq__toggle">
                  <ChevronDown size={15} color="#fff" />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p className="faq__a">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ============================================================
   Footer — see the `import Footer from '@/components/Footer'` at the top of
   this file. The local copy that used to live here has been removed: it
   duplicated the shared footer's markup with its own hardcoded link list, so
   the two drifted apart and the landing page silently missed new links.
   ============================================================ */

/* ============================================================
   LoadingScreen
   ============================================================ */

const PROMPT_STEPS = [
  'Initializing product engine…',
  'Analyzing token patterns…',
  'Optimizing neural pathways…',
  'Compressing context window…',
  'Entering the Productverse…',
]

// How long the curtain is guaranteed to stay up. It's a floor, not a timer —
// the curtain also waits for window 'load', so on a slow connection it stays
// longer. On a repeat visit within the same tab the bundle and images are
// already cached, so sitting through the full intro again is just a delay.
const MIN_LOAD_MS_FIRST = 1600
const MIN_LOAD_MS_REPEAT = 450
const SEEN_CURTAIN_KEY = 'tokun:seen-curtain'
const HOLD_AT_100_MS = 120
const CURTAIN_LIFT_S = 0.68

const NEURAL_LINKS = [
  [100, 36, 48, 72],
  [100, 36, 152, 72],
  [48, 72, 100, 120],
  [152, 72, 100, 120],
  [48, 72, 36, 148],
  [152, 72, 164, 148],
  [100, 120, 72, 162],
  [100, 120, 128, 162],
]

const NEURAL_NODES = [
  [100, 36],
  [48, 72],
  [152, 72],
  [100, 120],
  [36, 148],
  [164, 148],
  [72, 162],
  [128, 162],
]

function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState('loading')
  const onCompleteRef = useRef(onComplete)
  const phaseRef = useRef(phase)

  onCompleteRef.current = onComplete
  phaseRef.current = phase

  useEffect(() => {
    document.body.classList.add('is-loading')
    return () => document.body.classList.remove('is-loading')
  }, [])

  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem(SEEN_CURTAIN_KEY) === '1'
      sessionStorage.setItem(SEEN_CURTAIN_KEY, '1')
    } catch {
      // private mode / storage disabled — just treat it as a first visit
    }
    const minLoadMs = seen ? MIN_LOAD_MS_REPEAT : MIN_LOAD_MS_FIRST

    const start = performance.now()
    let raf = 0
    let finished = false
    let current = 0
    let pageReady = document.readyState === 'complete'

    const onLoad = () => {
      pageReady = true
    }
    window.addEventListener('load', onLoad)

    let progressDone = false

    const startCurtainLift = () => {
      if (finished) return
      finished = true
      cancelAnimationFrame(raf)

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        onCompleteRef.current?.()
        return
      }

      setTimeout(() => setPhase('lifting'), HOLD_AT_100_MS)
    }

    const complete = () => {
      if (progressDone) return
      progressDone = true
      const from = current
      const begin = performance.now()

      const runEnd = (now) => {
        const t = Math.min((now - begin) / 420, 1)
        const eased = 1 - (1 - t) ** 3
        const val = Math.round(from + (100 - from) * eased)
        current = val
        setProgress(val)

        if (t < 1) {
          requestAnimationFrame(runEnd)
        } else {
          startCurtainLift()
        }
      }

      requestAnimationFrame(runEnd)
    }

    const tick = (now) => {
      const elapsed = now - start
      const timeRatio = Math.min(elapsed / minLoadMs, 1)
      const eased = 1 - (1 - timeRatio) ** 2.2
      const next = Math.min(92, Math.floor(eased * 92))

      if (next > current) {
        current = next
        setProgress(next)
      }

      if (pageReady && elapsed >= minLoadMs) {
        complete()
      } else {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    const safety = setTimeout(complete, minLoadMs + 2000)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(safety)
      window.removeEventListener('load', onLoad)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % PROMPT_STEPS.length)
    }, 900)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className={`loading-screen${phase === 'lifting' ? ' loading-screen--lifting' : ''}`}
      initial={{ y: '0%' }}
      animate={{ y: phase === 'lifting' ? '-100%' : '0%' }}
      transition={{ duration: CURTAIN_LIFT_S, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => {
        if (phaseRef.current === 'lifting') onCompleteRef.current?.()
      }}
      aria-live="polite"
      aria-busy={phase === 'loading'}
      aria-label="Loading TOKUN"
    >
      <div className="loading-screen__folds" aria-hidden="true" />
      <div className="loading-screen__grid" aria-hidden="true" />
      <div className="loading-screen__glow" aria-hidden="true" />

      <motion.div
        className="loading-screen__content"
        animate={{ opacity: phase === 'lifting' ? 0 : 1, y: phase === 'lifting' ? -24 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="loading-screen__logo">
          <TokunLogo />
        </div>

        <div className="loading-screen__visual" aria-hidden="true">
          <svg className="loading-screen__neural" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="loadLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            {NEURAL_LINKS.map(([x1, y1, x2, y2], i) => (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="loading-screen__link"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
            {NEURAL_NODES.map(([cx, cy], i) => (
              <circle
                key={`n-${i}`}
                cx={cx}
                cy={cy}
                r={i === 0 ? 5 : 4}
                className="loading-screen__node"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </svg>

          <div className="loading-screen__core">
            <Sparkles size={28} strokeWidth={1.75} />
          </div>

          <div className="loading-screen__tokens">
            {['{prompt}', '</>', 'tokens', 'AI'].map((token, i) => (
              <span
                key={token}
                className="loading-screen__token"
                style={{ '--token-i': i }}
              >
                {token}
              </span>
            ))}
          </div>
        </div>

        <div className="loading-screen__prompt" key={stepIndex}>
          <span className="loading-screen__prompt-prefix">&gt;</span>
          {PROMPT_STEPS[stepIndex]}
          <span className="loading-screen__cursor" />
        </div>

        <div className="loading-screen__bar-wrap">
          <div className="loading-screen__bar-track">
            <motion.div
              className="loading-screen__bar-fill"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.35 }}
            />
          </div>
          <span className="loading-screen__percent">{progress}%</span>
        </div>
      </motion.div>

      <div className="loading-screen__hem" aria-hidden="true" />
      <div className="loading-screen__rod" aria-hidden="true" />
    </motion.div>
  )
}

/* ============================================================
   FeedbackButton — floating feedback tab on the right side
   ============================================================ */

const fbInputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '10px 14px',
  color: '#f3f4f6',
  fontSize: 13.5,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s, background 0.2s',
  backdropFilter: 'blur(6px)',
}

const fbLabelStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.4)',
  fontSize: 11,
  fontWeight: 700,
  display: 'block',
  marginBottom: 6,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

function FeedbackButton() {
  /* Two separate things this tab got wrong on a phone.
     One: it was sized for a desktop edge — 18px of vertical padding around a
     tracked-out vertical word and a 32px icon tile came to a ~130px slab down
     the side of a 390px screen.
     Two: it drifted. `whileHover` moved it 5px left, and a touch device fires
     hover on tap and never fires the leave, so after one press the tab sat
     offset from the edge with a gap of page showing through — and did it again,
     differently, on the next press. Hover is a pointer idiom; below this width
     the press feedback alone is enough. */
  /* Read on the FIRST render, not in an effect.
     Starting at `false` meant every load painted the desktop-sized slab and
     then swapped it for the compact one a frame later — a visible jump from
     big to small, on the phone where it is most obviously wrong. */
  const [isCompact, setIsCompact] = useState(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia('(max-width: 640px), (hover: none)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px), (hover: none)')
    const sync = () => setIsCompact(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  /* Whether this is a real pointer. The hover animation was gated on
     `isCompact`, whose query is an OR — so a wide screen that reports
     `hover: none` still got hover, and a phone whose browser claims
     `hover: hover` (some Android builds do) got it too. On a touch screen
     hover fires on tap and never leaves, so the tab sat at 1.02 scale, then
     0.95 on the next press, then back — that is the size flapping between
     presses. This is the test that actually means "a mouse". */
  const [hasPointer, setHasPointer] = useState(() =>
    typeof window === 'undefined'
      ? true
      : window.matchMedia('(hover: hover) and (pointer: fine)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setHasPointer(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [rating, setRating] = useState(0)
  const [hoverStar, setHoverStar] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [experience, setExperience] = useState('')
  const [role, setRole] = useState('')
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [issue, setIssue] = useState('')
  // What that note is. The field was labelled "Any Issue?" and nothing else, so
  // anyone with an idea rather than a bug had to file it as a bug.
  const [noteType, setNoteType] = useState<'issue' | 'suggestion'>('issue')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [otpSending, setOtpSending] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setRating(0); setHoverStar(0); setName(''); setEmail(''); setExperience('')
    setRole(''); setScreenshots([]); setIssue(''); setNoteType('issue')
    setError(''); setSubmitted(false); setStep('form'); setOtp('')
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(reset, 400)
  }

  const handleSendOtp = async () => {
    setError('')
    if (!name.trim()) { setError('Name is required'); return }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError('Valid email is required'); return }
    if (!experience.trim()) { setError('Please share your experience'); return }
    if (rating === 0) { setError('Please give a rating'); return }

    setOtpSending(true)
    try {
      const res = await fetch(`${API_BASE}/api/feedback/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error || 'Failed to send OTP'); setOtpSending(false); return }
      setStep('otp')
    } catch {
      setError('Network error. Please try again.')
    }
    setOtpSending(false)
  }

  const handleSubmit = async () => {
    setError('')
    if (otp.trim().length !== 6) { setError('Enter the 6-digit OTP'); return }

    setSubmitting(true)
    try {
      // Verify OTP
      const vRes = await fetch(`${API_BASE}/api/feedback/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      })
      const vData = await vRes.json()
      if (!vData.success) {
        const msg: Record<string,string> = { otp_invalid: 'Incorrect OTP.', otp_expired: 'OTP expired. Go back and resend.', otp_not_found: 'OTP not found. Go back and resend.' }
        setError(msg[vData.error] || 'OTP verification failed')
        setSubmitting(false)
        return
      }

      // Submit feedback
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('email', email.trim())
      formData.append('experience', experience.trim())
      formData.append('rating', String(rating))
      if (role.trim()) formData.append('role', role.trim())
      if (issue.trim()) {
        formData.append('issue', issue.trim())
        formData.append('noteType', noteType)
      }
      screenshots.forEach(f => formData.append('screenshots', f))

      const res = await fetch(`${API_BASE}/api/feedback`, { method: 'POST', body: formData })
      const data = await res.json()

      if (!data.success) { setError(data.error || 'Something went wrong'); setSubmitting(false); return }

      setSubmitted(true)
      setTimeout(handleClose, 2800)
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  const canProceed = name.trim().length > 0 && /\S+@\S+\.\S+/.test(email) && experience.trim().length > 0 && rating > 0

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'rgba(167,139,250,0.6)'
    e.currentTarget.style.background = 'rgba(139,92,246,0.1)'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)'
  }
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
    e.currentTarget.style.boxShadow = 'none'
  }

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

  return (
    <>
      {/* ── Floating tab button ── */}
      <motion.button
        onClick={() => setOpen(true)}
        aria-label="Share feedback"
        initial={false}
        whileHover={hasPointer ? { x: -5, scale: 1.02 } : undefined}
        /* Also pointer-only. A tap that turns into a scroll leaves framer
           waiting on a pointerup it never gets on some mobile browsers, so the
           tab stays shrunk mid-scroll — which reads as the thing resizing on
           its own. The button still gives feedback: it opens the panel. */
        whileTap={hasPointer ? { scale: 0.95 } : undefined}
        /* Anchoring lives in .feedback-tab (landing-page.css) because it needs
           a `top: 38%` → `top: 38svh` fallback pair, and an inline style can
           only hold one value per property: on a browser without svh the
           declaration is simply dropped and the tab loses its position
           entirely. See that rule for why svh matters here. */
        className="feedback-tab"
        style={{
          cursor: 'pointer',
          border: 'none',
          padding: 0,
          background: 'linear-gradient(160deg, #7c3aed 0%, #4f46e5 40%, #2563eb 100%)',
          borderRadius: isCompact ? '11px 0 0 11px' : '14px 0 0 14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isCompact ? 7 : 10,
          paddingTop: isCompact ? 11 : 18,
          paddingBottom: isCompact ? 11 : 18,
          paddingLeft: isCompact ? 7 : 11,
          paddingRight: isCompact ? 7 : 11,
          boxShadow: isCompact
            ? '-2px 0 16px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.15)'
            : '-4px 0 32px rgba(124,58,237,0.55), -1px 0 0 rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}
      >
        {/* Shiny top-left highlight */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '45%',
          borderRadius: isCompact ? '11px 0 0 0' : '14px 0 0 0',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        <span style={{
          writingMode: 'vertical-lr',
          transform: 'rotate(180deg)',
          textOrientation: 'mixed',
          color: '#fff',
          fontSize: isCompact ? 9.5 : 11.5,
          fontWeight: 800,
          /* The tracking is what actually made this tall — 0.14em over eight
             letters adds most of a character's height on its own. */
          letterSpacing: isCompact ? '0.06em' : '0.14em',
          textTransform: 'uppercase',
          lineHeight: 1,
          textShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}>
          Feedback
        </span>
        <div style={{
          width: isCompact ? 24 : 32,
          height: isCompact ? 24 : 32,
          borderRadius: isCompact ? 7 : 9,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}>
          <MessageSquarePlus size={isCompact ? 12 : 15} color="#fff" style={{ transform: 'scaleX(-1)' }} />
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="fb-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(6px)',
                zIndex: 1001,
              }}
            />

            {/* Panel — fixed top+bottom so it never overflows */}
            <motion.div
              key="fb-panel"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              style={{
                position: 'fixed',
                right: 0,
                top: 16,
                bottom: 16,
                zIndex: 1002,
                width: 370,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(10, 10, 20, 0.55)',
                backdropFilter: 'blur(28px) saturate(180%)',
                WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRight: 'none',
                borderRadius: '22px 0 0 22px',
                boxShadow: '-16px 0 70px rgba(124,58,237,0.3), 0 0 0 1px rgba(139,92,246,0.12) inset',
                overflow: 'hidden',
              }}
            >
              {/* Rainbow gradient top bar */}
              <div style={{
                height: 3,
                background: 'linear-gradient(90deg, #a855f7, #6366f1, #3b82f6, #06b6d4)',
                flexShrink: 0,
              }} />

              {/* Glass inner glow layer */}
              <div style={{
                position: 'absolute',
                top: 3, left: 0, right: 0,
                height: 120,
                background: 'linear-gradient(180deg, rgba(139,92,246,0.12) 0%, transparent 100%)',
                pointerEvents: 'none',
                borderRadius: '22px 0 0 0',
              }} />

              {/* Scrollable content */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '22px 24px 24px',
                scrollbarWidth: 'none',
                position: 'relative',
              }}>
                {submitted ? (
                  /* ── Success ── */
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300, textAlign: 'center', gap: 12 }}>
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} style={{ fontSize: 56 }}>🎉</motion.div>
                    <p style={{ color: '#c4b5fd', fontWeight: 800, fontSize: 18, margin: 0 }}>Thanks, {name}!</p>
                    <p style={{ color: '#4b5563', fontSize: 13, margin: 0, lineHeight: 1.5 }}>Your feedback helps us build<br />a better Tokun.</p>
                  </div>
                ) : step === 'otp' ? (
                  /* ── Step 2: OTP ── */
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <h3 style={{ color: '#f9fafb', fontWeight: 800, fontSize: 18, margin: 0 }}>Verify Email</h3>
                        <p style={{ color: '#4b5563', fontSize: 12.5, margin: '5px 0 0' }}>OTP sent to <span style={{ color: '#a78bfa' }}>{email}</span></p>
                      </div>
                      <button onClick={handleClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, lineHeight: 1 }}>×</button>
                    </div>
                    <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', margin: '16px 0' }} />

                    <div style={{ marginBottom: 20 }}>
                      <label style={fbLabelStyle}>6-digit OTP <span style={{ color: '#7c3aed' }}>*</span></label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter OTP"
                        style={{ ...fbInputStyle, letterSpacing: '0.3em', fontSize: 22, textAlign: 'center', fontWeight: 700 }}
                        onFocus={focusBorder}
                        onBlur={blurBorder}
                        autoFocus
                      />
                      <p style={{ color: '#6b7280', fontSize: 11.5, margin: '8px 0 0' }}>OTP expires in 5 minutes.</p>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: '#f87171', fontSize: 12, marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8 }}>⚠ {error}</motion.p>
                      )}
                    </AnimatePresence>

                    <button onClick={handleSubmit} disabled={submitting || otp.length !== 6} style={{ width: '100%', padding: '12px', background: otp.length === 6 ? 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)' : 'rgba(255,255,255,0.04)', border: otp.length === 6 ? 'none' : '1px solid rgba(255,255,255,0.06)', borderRadius: 12, color: otp.length === 6 ? '#fff' : '#374151', fontWeight: 700, fontSize: 14, cursor: submitting || otp.length !== 6 ? 'not-allowed' : 'pointer', transition: 'background 0.2s', letterSpacing: '0.02em', boxShadow: otp.length === 6 ? '0 4px 20px rgba(124,58,237,0.4)' : 'none' }}>
                      {submitting ? 'Verifying…' : 'Verify & Submit →'}
                    </button>
                    <button onClick={() => { setStep('form'); setError(''); setOtp('') }} style={{ width: '100%', marginTop: 10, padding: '10px', background: 'none', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>← Go back & resend OTP</button>
                  </>
                ) : (
                  /* ── Step 1: Form ── */
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <h3 style={{ color: '#f9fafb', fontWeight: 800, fontSize: 18, margin: 0, letterSpacing: '-0.01em' }}>Share Feedback</h3>
                        <p style={{ color: '#4b5563', fontSize: 12.5, margin: '5px 0 0', lineHeight: 1.4 }}>Tell us how Tokun is working for you</p>
                      </div>
                      <button onClick={handleClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, lineHeight: 1, flexShrink: 0, marginLeft: 10, backdropFilter: 'blur(4px)', transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')} onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}>×</button>
                    </div>
                    <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', margin: '16px 0' }} />

                    {/* Name */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={fbLabelStyle}>Name <span style={{ color: '#7c3aed' }}>*</span></label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={fbInputStyle} onFocus={focusBorder} onBlur={blurBorder} />
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={fbLabelStyle}>Email <span style={{ color: '#7c3aed' }}>*</span></label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={fbInputStyle} onFocus={focusBorder} onBlur={blurBorder} />
                    </div>

                    {/* Rating */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={fbLabelStyle}>Rating <span style={{ color: '#7c3aed' }}>*</span></label>
                      <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(6px)' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverStar(star)} onMouseLeave={() => setHoverStar(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 28, color: star <= (hoverStar || rating) ? '#fbbf24' : '#1f2937', transition: 'color 0.12s, transform 0.12s', transform: star <= (hoverStar || rating) ? 'scale(1.2)' : 'scale(1)', lineHeight: 1, filter: star <= (hoverStar || rating) ? 'drop-shadow(0 0 6px rgba(251,191,36,0.5))' : 'none' }}>★</button>
                        ))}
                        {(hoverStar || rating) > 0 && <span style={{ marginLeft: 6, color: '#8b5cf6', fontSize: 12, fontWeight: 600 }}>{ratingLabels[hoverStar || rating]}</span>}
                      </div>
                    </div>

                    {/* Experience */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={fbLabelStyle}>Your Experience <span style={{ color: '#7c3aed' }}>*</span></label>
                      <textarea value={experience} onChange={e => setExperience(e.target.value)} placeholder="What do you love? What could be better?" rows={4} style={{ ...fbInputStyle, resize: 'none' }} onFocus={focusBorder} onBlur={blurBorder} />
                    </div>

                    {/* Profession */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={fbLabelStyle}>Profession</label>
                      <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Developer, Designer, Student…" style={fbInputStyle} onFocus={focusBorder} onBlur={blurBorder} />
                    </div>

                    {/* Issue or suggestion — one field, two meanings */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={fbLabelStyle}>
                        Anything to tell us? <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional)</span>
                      </label>

                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        {([['issue', 'Report an issue'], ['suggestion', 'Suggest an idea']] as const).map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setNoteType(key)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 999,
                              fontSize: 12,
                              fontFamily: 'inherit',
                              cursor: 'pointer',
                              transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                              background: noteType === key ? 'rgba(167,139,250,0.16)' : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${noteType === key ? 'rgba(167,139,250,0.7)' : 'rgba(255,255,255,0.12)'}`,
                              color: noteType === key ? '#c4b5fd' : '#9ca3af',
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={issue}
                        onChange={e => setIssue(e.target.value)}
                        placeholder={noteType === 'suggestion'
                          ? 'What would you like us to build or change?'
                          : 'Describe any issue you faced…'}
                        style={fbInputStyle}
                        onFocus={focusBorder}
                        onBlur={blurBorder}
                      />
                    </div>

                    {/* Screenshots */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={fbLabelStyle}>Screenshots <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional, max 5)</span></label>
                      <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { const files = Array.from(e.target.files || []).slice(0, 5); setScreenshots(files) }} />
                      <button type="button" onClick={() => fileInputRef.current?.click()} style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: `1px dashed ${screenshots.length ? 'rgba(167,139,250,0.7)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 10, color: screenshots.length ? '#c4b5fd' : '#6b7280', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'border-color 0.2s, color 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>🖼️</span>
                        {screenshots.length ? `${screenshots.length} file${screenshots.length > 1 ? 's' : ''} selected` : 'Upload screenshots (optional)'}
                      </button>
                      {screenshots.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                          {screenshots.map((f, i) => <span key={i} style={{ fontSize: 11, padding: '3px 8px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 6, color: '#c4b5fd', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>)}
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: '#f87171', fontSize: 12, marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8 }}>⚠ {error}</motion.p>
                      )}
                    </AnimatePresence>

                    <button onClick={handleSendOtp} disabled={otpSending || !canProceed} style={{ width: '100%', padding: '12px', background: canProceed ? 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)' : 'rgba(255,255,255,0.04)', border: canProceed ? 'none' : '1px solid rgba(255,255,255,0.06)', borderRadius: 12, color: canProceed ? '#fff' : '#374151', fontWeight: 700, fontSize: 14, cursor: otpSending || !canProceed ? 'not-allowed' : 'pointer', transition: 'background 0.2s, box-shadow 0.2s', letterSpacing: '0.02em', boxShadow: canProceed ? '0 4px 20px rgba(124,58,237,0.4)' : 'none' }}>
                      {otpSending ? 'Sending OTP…' : 'Send OTP →'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/* ============================================================
   LandingPage — the single page that ties it all together
   ============================================================ */

export default function LandingPage() {
  const [showCurtain, setShowCurtain] = useState(true)
  const [belowFold, setBelowFold] = useState(false)

  const handleComplete = () => {
    setShowCurtain(false)
    // 2 rAF gap — curtain unmount ke baad paint clear hone do, tab heavy sections mount ho
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setBelowFold(true)
        // Landing is settled; spend the idle time pulling in the chunks for the
        // pages people click through to, so those navigations feel instant.
        prefetchLandingRoutes()
      })
    )
  }

  return (
    <>
      <div className="app-shell">
        {/* Landing's own bar: logo, and either the account dropdown or the two
            sign-in buttons. Transparent all the way down — no panel, no blur.

            Outside <Hero> because `.hero` sets `contain: layout`, which makes
            it the containing block for sticky children — a bar inside it would
            pin to the hero instead of the viewport. */}
        <LandingNav />

        {/* Above-fold — always ready, curtain ke peeche bhi render hota hai */}
        <Hero />
        <WhatWeOffer />
        <HowItWorks />

        {/* Below-fold — curtain hat ne ke baad mount hote hain, GPU free rehti hai */}
        {belowFold && (
          <>
            <GlobeSection />
            <FAQSection />
            <CtaSection />
            <Testimonials />
            <Footer />
          </>
        )}
      </div>

      <FeedbackButton />
      {showCurtain && <LoadingScreen onComplete={handleComplete} />}
      {!showCurtain && <CookieConsentBanner />}
    </>
  )
}