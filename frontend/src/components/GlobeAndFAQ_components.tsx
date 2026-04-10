// // // // // ============================================================
// // // // // TOKUN.AI — Globe + FAQ + Ticker Components (MOBILE FIXED)
// // // // // ============================================================

// // // // import { useRef, useEffect, useState, useCallback } from "react";
// // // // import { motion, AnimatePresence } from "framer-motion";
// // // // import { ChevronDown } from "lucide-react";
// // // // import { useRef, useEffect, useState, Suspense } from "react";
// // // // import { motion, AnimatePresence } from "framer-motion";
// // // // import { ChevronDown } from "lucide-react";
// // // // import { Canvas, useFrame } from "@react-three/fiber";
// // // // import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
// // // // import * as THREE from "three";
// // // // // ─────────────────────────────────────────────
// // // // // 0. TICKER / MARQUEE SECTION
// // // // // Usage: <TickerSection />
// // // // // Place just after your Hero section, before Features
// // // // // ─────────────────────────────────────────────

// // // // const TICKER_ITEMS = [
// // // //   "SmartGen AI",
// // // //   "Prompt Optimization",
// // // //   "Token Reduction",
// // // //   "Prompt Marketplace",
// // // //   "LLM Compatible",
// // // //   "GPT-4 · Claude · Gemini",
// // // //   "Earn from Prompts",
// // // //   "AI-Powered Library",
// // // //   "24/7 Support",
// // // // ];

// // // // export function TickerSection() {
// // // //   // Duplicate items for seamless infinite loop
// // // //   const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

// // // //   return (
// // // //     <div
// // // //       style={{
// // // //         overflow: "hidden",
// // // //         padding: "20px 0",
// // // //         borderTop: "1px solid rgba(255,255,255,0.08)",
// // // //         borderBottom: "1px solid rgba(255,255,255,0.08)",
// // // //         background: "#0d0d1a",
// // // //         fontFamily: "Inter, ui-sans-serif, system-ui",
// // // //         margin: "48px 0",
// // // //       }}
// // // //     >
// // // //       <style>{`
// // // //         @keyframes tokun-ticker {
// // // //           from { transform: translateX(0); }
// // // //           to   { transform: translateX(-50%); }
// // // //         }
// // // //         .tokun-ticker-track {
// // // //           display: flex;
// // // //           animation: tokun-ticker 25s linear infinite;
// // // //           white-space: nowrap;
// // // //           width: max-content;
// // // //         }
// // // //         .tokun-ticker-track:hover {
// // // //           animation-play-state: paused;
// // // //         }
// // // //       `}</style>

// // // //       <div className="tokun-ticker-track">
// // // //         {items.map((item, i) => (
// // // //           <div
// // // //             key={i}
// // // //             style={{
// // // //               display: "flex",
// // // //               alignItems: "center",
// // // //               gap: 10,
// // // //               fontSize: 14,
// // // //               color: "rgba(255,255,255,0.45)",
// // // //               paddingRight: 48,
// // // //             }}
// // // //           >
// // // //             {/* Purple dot separator */}
// // // //             <span
// // // //               style={{
// // // //                 width: 4,
// // // //                 height: 4,
// // // //                 borderRadius: "50%",
// // // //                 background: "linear-gradient(90deg, #FF14EF, #1A73E8)",
// // // //                 flexShrink: 0,
// // // //                 display: "inline-block",
// // // //               }}
// // // //             />
// // // //             {item}
// // // //           </div>
// // // //         ))}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // // const GLOBE_USERS = [
// // // //   { lat: 35.6,  lon: 139.7, flag: "🇯🇵", name: "Yuki Tanaka",     city: "Tokyo, Japan",        msg: "I love SmartGen! Saves me hours every day ✨" },
// // // //   { lat: 51.5,  lon:  -0.1, flag: "🇬🇧", name: "James Harper",    city: "London, UK",          msg: "Cut my GPT-4 costs by 58% with Tokun!" },
// // // //   { lat: 37.7,  lon:-122.4, flag: "🇺🇸", name: "Sarah Chen",      city: "San Francisco, USA",  msg: "Best prompt tool on the market 🔥" },
// // // //   { lat: 48.8,  lon:   2.3, flag: "🇫🇷", name: "Léa Moreau",      city: "Paris, France",       msg: "Tokun marketplace made me $800 this month! 💰" },
// // // //   { lat: 28.6,  lon:  77.2, flag: "🇮🇳", name: "Arjun Sharma",    city: "New Delhi, India",    msg: "SmartGen is a total game changer for AI devs!" },
// // // //   { lat:-23.5,  lon: -46.6, flag: "🇧🇷", name: "Lucas Oliveira",  city: "São Paulo, Brazil",   msg: "Melhor ferramenta de prompts! 🚀" },
// // // //   { lat:  1.4,  lon: 103.8, flag: "🇸🇬", name: "Wei Liang",       city: "Singapore",           msg: "Our whole team switched to Tokun. No regrets!" },
// // // //   { lat: 55.7,  lon:  37.6, flag: "🇷🇺", name: "Dmitri Volkov",   city: "Moscow, Russia",      msg: "Token optimization is genuinely impressive 👏" },
// // // //   { lat:-33.8,  lon: 151.2, flag: "🇦🇺", name: "Emma Wilson",     city: "Sydney, Australia",   msg: "Love the prompt library! Saves so much time ⚡" },
// // // //   { lat: 52.5,  lon:  13.4, flag: "🇩🇪", name: "Klaus Weber",     city: "Berlin, Germany",     msg: "Tokun API integrates perfectly with our stack!" },
// // // //   { lat: 19.0,  lon:  72.8, flag: "🇮🇳", name: "Priya Nair",      city: "Mumbai, India",       msg: "SmartGen wrote a better prompt than me 😂❤️" },
// // // //   { lat: 40.7,  lon: -74.0, flag: "🇺🇸", name: "Alex Rivera",     city: "New York, USA",       msg: "50K prompts on Tokun already? So deserved!" },
// // // //   { lat: 31.2,  lon: 121.5, flag: "🇨🇳", name: "Li Wei",          city: "Shanghai, China",     msg: "Supports every LLM I use. Perfect tool!" },
// // // //   { lat: -1.3,  lon:  36.8, flag: "🇰🇪", name: "Amara Osei",      city: "Nairobi, Kenya",      msg: "Tokun is growing our AI startup faster 🌍" },
// // // //   { lat: 59.3,  lon:  18.1, flag: "🇸🇪", name: "Erik Lindqvist",  city: "Stockholm, Sweden",   msg: "Elegant, fast, support is amazing 🙌" },
// // // //   { lat: 25.2,  lon:  55.3, flag: "🇦🇪", name: "Farah Al-Nasser", city: "Dubai, UAE",          msg: "Prompt marketplace is a brilliant idea! 💡" },
// // // //   { lat: 41.0,  lon:  29.0, flag: "🇹🇷", name: "Ceren Yilmaz",    city: "Istanbul, Turkey",    msg: "Tokun helped me 10x my freelance AI work!" },
// // // // ];

// // // // const CANVAS_SIZE = 560;

// // // // type GlobeUser = typeof GLOBE_USERS[0] & {
// // // //   _sx: number; _sy: number; _vis: boolean;
// // // // };

// // // // type PopupData = {
// // // //   /** position in canvas-space (0–560) */
// // // //   csx: number;
// // // //   csy: number;
// // // //   user: GlobeUser;
// // // // };

// // // // export function GlobeSection() {
// // // //   const canvasRef    = useRef<HTMLCanvasElement>(null);
// // // //   const wrapRef      = useRef<HTMLDivElement>(null);
// // // //   const stateRef     = useRef({
// // // //     rotY: 0.4, rotX: 0.22,
// // // //     velY: 0.003,
// // // //     dragging: false, lastMX: 0, lastMY: 0,
// // // //     pulseT: 0,
// // // //     activeIdx: -1,
// // // //     queueIdx: 0,
// // // //     users: GLOBE_USERS.map(u => ({ ...u, _sx: 0, _sy: 0, _vis: false })) as GlobeUser[],
// // // //   });

// // // //   const [popup, setPopup] = useState<PopupData | null>(null);

// // // //   // ── Convert canvas-space → wrapper-percentage so popup stays inside ──
// // // //   const getPopupStyle = useCallback((p: PopupData): React.CSSProperties => {
// // // //     if (!wrapRef.current) return {};
// // // //     const wrapW = wrapRef.current.clientWidth;
// // // //     const wrapH = wrapRef.current.clientHeight;
// // // //     const scale = wrapW / CANVAS_SIZE;

// // // //     const sx = p.csx * scale;        // real px from left
// // // //     const sy = p.csy * scale;        // real px from top

// // // //     const CARD_W  = Math.min(220, wrapW * 0.58);
// // // //     const CARD_H  = 105;             // approx card height
// // // //     const MARGIN  = 8;

// // // //     // horizontal: clamp so card never overflows left or right
// // // //     let left = sx - CARD_W / 2;
// // // //     left = Math.max(MARGIN, Math.min(left, wrapW - CARD_W - MARGIN));

// // // //     // vertical: prefer above dot, fallback below
// // // //     let top: number;
// // // //     if (sy - CARD_H - 16 > MARGIN) {
// // // //       top = sy - CARD_H - 16;
// // // //     } else {
// // // //       top = sy + 20;
// // // //     }
// // // //     top = Math.max(MARGIN, Math.min(top, wrapH - CARD_H - MARGIN));

// // // //     return {
// // // //       position: "absolute",
// // // //       left,
// // // //       top,
// // // //       width: CARD_W,
// // // //     };
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     const canvas = canvasRef.current;
// // // //     if (!canvas) return;
// // // //     const ctx    = canvas.getContext("2d")!;
// // // //     const W = CANVAS_SIZE, H = CANVAS_SIZE;
// // // //     const cx = W / 2, cy = H / 2, R = 220;
// // // //     const s  = stateRef.current;

// // // //     function latLonToXYZ(lat: number, lon: number) {
// // // //       const phi   = (90 - lat) * Math.PI / 180;
// // // //       const theta = (lon + 180) * Math.PI / 180;
// // // //       return {
// // // //         x: -Math.sin(phi) * Math.cos(theta),
// // // //         y:  Math.cos(phi),
// // // //         z:  Math.sin(phi) * Math.sin(theta),
// // // //       };
// // // //     }

// // // //     function project(x: number, y: number, z: number) {
// // // //       const x1 =  x * Math.cos(s.rotY) + z * Math.sin(s.rotY);
// // // //       const z1 = -x * Math.sin(s.rotY) + z * Math.cos(s.rotY);
// // // //       const y2 =  y * Math.cos(s.rotX) - z1 * Math.sin(s.rotX);
// // // //       const z2 =  y * Math.sin(s.rotX) + z1 * Math.cos(s.rotX);
// // // //       return { sx: cx + x1 * R, sy: cy + y2 * R, z: z2 };
// // // //     }

// // // //     function drawGlobe() {
// // // //       ctx.clearRect(0, 0, W, H);

// // // //       const grd = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.35);
// // // //       grd.addColorStop(0, "rgba(255,20,239,0.14)");
// // // //       grd.addColorStop(0.5, "rgba(26,115,232,0.08)");
// // // //       grd.addColorStop(1, "transparent");
// // // //       ctx.fillStyle = grd;
// // // //       ctx.beginPath(); ctx.arc(cx, cy, R * 1.35, 0, Math.PI * 2); ctx.fill();

// // // //       const sph = ctx.createRadialGradient(cx - R * 0.28, cy - R * 0.28, R * 0.04, cx, cy, R);
// // // //       sph.addColorStop(0, "#1e1250");
// // // //       sph.addColorStop(0.45, "#0f0a2a");
// // // //       sph.addColorStop(1, "#030406");
// // // //       ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
// // // //       ctx.fillStyle = sph; ctx.fill();

// // // //       ctx.lineWidth = 0.5;
// // // //       for (let lat = -75; lat <= 75; lat += 15) {
// // // //         ctx.beginPath();
// // // //         ctx.strokeStyle = lat === 0 ? "rgba(255,20,239,0.22)" : "rgba(100,60,200,0.14)";
// // // //         let first = true;
// // // //         for (let lon = -180; lon <= 180; lon += 2) {
// // // //           const v = latLonToXYZ(lat, lon), p = project(v.x, v.y, v.z);
// // // //           if (p.z > -0.02) { if (first) { ctx.moveTo(p.sx, p.sy); first = false; } else ctx.lineTo(p.sx, p.sy); } else first = true;
// // // //         }
// // // //         ctx.stroke();
// // // //       }
// // // //       for (let lon = -180; lon <= 165; lon += 15) {
// // // //         ctx.beginPath(); ctx.strokeStyle = "rgba(100,60,200,0.10)";
// // // //         let first = true;
// // // //         for (let lat = -90; lat <= 90; lat += 2) {
// // // //           const v = latLonToXYZ(lat, lon), p = project(v.x, v.y, v.z);
// // // //           if (p.z > -0.02) { if (first) { ctx.moveTo(p.sx, p.sy); first = false; } else ctx.lineTo(p.sx, p.sy); } else first = true;
// // // //         }
// // // //         ctx.stroke();
// // // //       }

// // // //       ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
// // // //       ctx.strokeStyle = "rgba(255,20,239,0.45)"; ctx.lineWidth = 1.5; ctx.stroke();
// // // //       ctx.beginPath(); ctx.arc(cx, cy, R + 2, 0, Math.PI * 2);
// // // //       ctx.strokeStyle = "rgba(26,115,232,0.18)"; ctx.lineWidth = 3; ctx.stroke();

// // // //       s.pulseT += 0.06;

// // // //       s.users.forEach((u, i) => {
// // // //         const v = latLonToXYZ(u.lat, u.lon);
// // // //         const p = project(v.x, v.y, v.z);
// // // //         u._sx = p.sx; u._sy = p.sy; u._vis = p.z > 0;
// // // //         if (!u._vis) return;

// // // //         const a = 0.35 + p.z * 0.65;
// // // //         const isActive = i === s.activeIdx;

// // // //         if (isActive) {
// // // //           for (let ring = 0; ring < 3; ring++) {
// // // //             const phase = (s.pulseT + ring * 2.1) % (Math.PI * 2);
// // // //             const pr = 7 + ring * 6 + Math.sin(phase) * 3;
// // // //             const pa = Math.max(0, (1 - pr / 30) * 0.6);
// // // //             ctx.beginPath(); ctx.arc(p.sx, p.sy, pr, 0, Math.PI * 2);
// // // //             ctx.strokeStyle = `rgba(255,20,239,${pa})`; ctx.lineWidth = 1; ctx.stroke();
// // // //           }
// // // //           ctx.beginPath(); ctx.arc(p.sx, p.sy, 5, 0, Math.PI * 2);
// // // //           ctx.fillStyle = `rgba(255,150,255,${a})`; ctx.fill();
// // // //           ctx.beginPath(); ctx.arc(p.sx, p.sy, 2.5, 0, Math.PI * 2);
// // // //           ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();

// // // //           // Dotted vertical connector line
// // // //           const lineLen = 48;
// // // //           const above = p.sy > cy;
// // // //           const lineStartY = above ? p.sy - 6 : p.sy + 6;
// // // //           const lineEndY   = above ? p.sy - lineLen : p.sy + lineLen;
// // // //           ctx.save();
// // // //           ctx.setLineDash([3, 5]);
// // // //           ctx.beginPath();
// // // //           ctx.moveTo(p.sx, lineStartY);
// // // //           ctx.lineTo(p.sx, lineEndY);
// // // //           ctx.strokeStyle = `rgba(255,20,239,${a * 0.85})`;
// // // //           ctx.lineWidth = 1.5;
// // // //           ctx.stroke();
// // // //           ctx.restore();
// // // //         } else {
// // // //           ctx.beginPath(); ctx.arc(p.sx, p.sy, 3, 0, Math.PI * 2);
// // // //           ctx.fillStyle = `rgba(26,115,232,${a * 0.85})`; ctx.fill();
// // // //           ctx.beginPath(); ctx.arc(p.sx, p.sy, 1.5, 0, Math.PI * 2);
// // // //           ctx.fillStyle = `rgba(255,20,239,${a})`; ctx.fill();
// // // //         }
// // // //       });
// // // //     }

// // // //     function rotateToward(idx: number) {
// // // //       const u = s.users[idx];
// // // //       const v = latLonToXYZ(u.lat, u.lon);
// // // //       const targetRotY = -Math.atan2(v.x, v.z);
// // // //       let diff = targetRotY - s.rotY;
// // // //       while (diff > Math.PI) diff -= Math.PI * 2;
// // // //       while (diff < -Math.PI) diff += Math.PI * 2;
// // // //       s.velY = diff * 0.016 + 0.0015;
// // // //     }

// // // //     let cycleTO: ReturnType<typeof setTimeout>;

// // // //     function cycleUser() {
// // // //       s.activeIdx = s.queueIdx % s.users.length;
// // // //       s.queueIdx++;
// // // //       rotateToward(s.activeIdx);

// // // //       setTimeout(() => {
// // // //         const u = s.users[s.activeIdx];
// // // //         if (u._vis) {
// // // //           // Pass canvas-space coords; React component converts to real px
// // // //           setPopup({ csx: u._sx, csy: u._sy, user: { ...u } });
// // // //           setTimeout(() => {
// // // //             setPopup(null);
// // // //             s.activeIdx = -1;
// // // //             cycleTO = setTimeout(cycleUser, 1000);
// // // //           }, 4000);
// // // //         } else {
// // // //           s.activeIdx = -1;
// // // //           cycleTO = setTimeout(cycleUser, 800);
// // // //         }
// // // //       }, 700);
// // // //     }

// // // //     let raf: number;
// // // //     function animate() {
// // // //       if (!s.dragging) {
// // // //         s.rotY += s.velY;
// // // //         s.velY *= 0.993;
// // // //         if (Math.abs(s.velY) < 0.0018) s.velY = 0.0018;
// // // //       }
// // // //       drawGlobe();
// // // //       raf = requestAnimationFrame(animate);
// // // //     }
// // // //     animate();
// // // //     cycleTO = setTimeout(cycleUser, 1800);

// // // //     const onDown  = (e: MouseEvent) => { s.dragging = true; s.lastMX = e.clientX; s.lastMY = e.clientY; canvas.style.cursor = "grabbing"; };
// // // //     const onMove  = (e: MouseEvent) => {
// // // //       if (!s.dragging) return;
// // // //       const dx = e.clientX - s.lastMX, dy = e.clientY - s.lastMY;
// // // //       s.rotY += dx * 0.006; s.rotX += dy * 0.003;
// // // //       s.rotX = Math.max(-0.55, Math.min(0.55, s.rotX));
// // // //       s.lastMX = e.clientX; s.lastMY = e.clientY; s.velY = dx * 0.004;
// // // //     };
// // // //     const onUp    = () => { s.dragging = false; canvas.style.cursor = "grab"; };
// // // //     const onTouchStart = (e: TouchEvent) => { s.lastMX = e.touches[0].clientX; s.lastMY = e.touches[0].clientY; };
// // // //     const onTouchMove  = (e: TouchEvent) => {
// // // //       e.preventDefault();
// // // //       const dx = e.touches[0].clientX - s.lastMX, dy = e.touches[0].clientY - s.lastMY;
// // // //       s.rotY += dx * 0.006; s.rotX += dy * 0.003;
// // // //       s.rotX = Math.max(-0.55, Math.min(0.55, s.rotX));
// // // //       s.lastMX = e.touches[0].clientX; s.lastMY = e.touches[0].clientY;
// // // //     };

// // // //     canvas.addEventListener("mousedown", onDown);
// // // //     window.addEventListener("mousemove", onMove);
// // // //     window.addEventListener("mouseup", onUp);
// // // //     canvas.addEventListener("touchstart", onTouchStart, { passive: true });
// // // //     canvas.addEventListener("touchmove", onTouchMove, { passive: false });

// // // //     return () => {
// // // //       cancelAnimationFrame(raf);
// // // //       clearTimeout(cycleTO);
// // // //       canvas.removeEventListener("mousedown", onDown);
// // // //       window.removeEventListener("mousemove", onMove);
// // // //       window.removeEventListener("mouseup", onUp);
// // // //       canvas.removeEventListener("touchstart", onTouchStart);
// // // //       canvas.removeEventListener("touchmove", onTouchMove);
// // // //     };
// // // //   }, []);

// // // //   const popupStyle = popup ? getPopupStyle(popup) : {};

// // // //   return (
// // // //     <div className="mt-28 text-center" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>

// // // //       <div className="flex justify-center mb-6">
// // // //   <div style={{
// // // //     display: "inline-block",
// // // //     borderRadius: 9999,
// // // //     border: "1px solid rgba(255,20,239,0.35)",
// // // //     padding: "6px 20px",
// // // //   }}>
// // // //     <span style={{
// // // //       fontWeight: 500, fontSize: 16,
// // // //       background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// // // //       WebkitBackgroundClip: "text", color: "transparent",
// // // //     }}>
// // // //       GLOBAL COMMUNITY
// // // //     </span>
// // // //   </div>
// // // // </div>

// // // //       <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved across the globe</h2>
// // // //       <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
// // // //         Thousands of prompt engineers from every corner of the world trust Tokun.AI daily.
// // // //       </p>

// // // //       {/*
// // // //         KEY FIX: wrapRef tracks real rendered size.
// // // //         overflow:hidden ensures popup never bleeds outside the globe box.
// // // //         Canvas uses width/height 100% so it scales to wrapper.
// // // //       */}
// // // //       <div
// // // //         ref={wrapRef}
// // // //         className="relative inline-block"
// // // //         style={{ maxWidth: 560, width: "100%", overflow: "hidden" }}
// // // //       >
// // // //         <canvas
// // // //           ref={canvasRef}
// // // //           width={CANVAS_SIZE}
// // // //           height={CANVAS_SIZE}
// // // //           style={{ width: "100%", height: "auto", cursor: "grab", display: "block" }}
// // // //         />

// // // //         <AnimatePresence>
// // // //           {popup && (
// // // //             <motion.div
// // // //               key={popup.user.name}
// // // //               initial={{ opacity: 0, scale: 0.92 }}
// // // //               animate={{ opacity: 1, scale: 1 }}
// // // //               exit={{ opacity: 0, scale: 0.92 }}
// // // //               transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
// // // //               style={{
// // // //                 ...popupStyle,
// // // //                 pointerEvents: "none",
// // // //                 zIndex: 10,
// // // //                 background: "#17171A",
// // // //                 border: "1px solid rgba(255,20,239,0.35)",
// // // //                 borderRadius: 14,
// // // //                 padding: "12px 14px",
// // // //                 boxShadow: "0 0 32px rgba(255,20,239,0.2), 0 4px 24px rgba(0,0,0,0.8)",
// // // //               }}
// // // //             >
// // // //               {/* Dotted connector tip — points toward the globe dot */}
// // // //               {(() => {
// // // //                 const wrapH = wrapRef.current?.clientHeight ?? CANVAS_SIZE;
// // // //                 const scale = (wrapRef.current?.clientWidth ?? CANVAS_SIZE) / CANVAS_SIZE;
// // // //                 const sy = popup.csy * scale;
// // // //                 const above = sy > wrapH / 2;
// // // //                 return (
// // // //                   <div style={{
// // // //                     position: "absolute",
// // // //                     [above ? "bottom" : "top"]: -28,
// // // //                     left: "50%",
// // // //                     transform: "translateX(-50%)",
// // // //                     width: 2,
// // // //                     height: 28,
// // // //                     background: `repeating-linear-gradient(
// // // //                       to ${above ? "bottom" : "top"},
// // // //                       rgba(255,20,239,0.75) 0px,
// // // //                       rgba(255,20,239,0.75) 3px,
// // // //                       transparent 3px,
// // // //                       transparent 8px
// // // //                     )`,
// // // //                   }} />
// // // //                 );
// // // //               })()}
// // // //               <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
// // // //                 <span style={{ fontSize: 18 }}>{popup.user.flag}</span>
// // // //                 <div>
// // // //                   <div style={{ fontSize: 12, fontWeight: 600, color: "#f0eeff" }}>{popup.user.name}</div>
// // // //                   <div style={{ fontSize: 10, color: "#6b6888" }}>{popup.user.city}</div>
// // // //                 </div>
// // // //               </div>
// // // //               <div style={{ fontSize: 11, color: "#b8b4cc", fontStyle: "italic", lineHeight: 1.6 }}>
// // // //                 "{popup.user.msg}"
// // // //               </div>
// // // //             </motion.div>
// // // //           )}
// // // //         </AnimatePresence>
// // // //       </div>

// // // //       <div style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap", marginTop: 32 }}>
// // // //         {[["120+", "Countries"], ["10K+", "Active Users"], ["50K+", "Prompts Created"]].map(([num, label]) => (
// // // //           <div key={label} style={{ textAlign: "center" }}>
// // // //             <div style={{
// // // //               fontSize: 28, fontWeight: 700,
// // // //               background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// // // //               WebkitBackgroundClip: "text", color: "transparent",
// // // //             }}>{num}</div>
// // // //             <div style={{ fontSize: 13, color: "#8884aa", marginTop: 4 }}>{label}</div>
// // // //           </div>
// // // //         ))}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }


// // // // // ─────────────────────────────────────────────
// // // // // 2. FAQ SECTION  (unchanged)
// // // // // ─────────────────────────────────────────────

// // // // const FAQ_ITEMS = [
// // // //   {
// // // //     q: "What LLMs does Tokun support?",
// // // //     a: "Tokun supports all major LLMs including GPT-4, GPT-4o, Claude 3 (Sonnet, Opus, Haiku), Gemini Pro/Ultra, Llama 3, Mistral, and more. New models are added within days of their public release.",
// // // //   },
// // // //   {
// // // //     q: "How does the token reduction actually work?",
// // // //     a: "SmartGen analyzes your intent and rewrites prompts to be semantically equivalent but structurally more efficient. It removes redundant instructions, consolidates overlapping requirements, and uses model-specific formatting that reduces token consumption without sacrificing output quality.",
// // // //   },
// // // //   {
// // // //     q: "How do I earn money on the marketplace?",
// // // //     a: "You list your optimized prompts with a price (one-time or subscription). When other users purchase your prompt, you receive 80% of the revenue. Payouts are processed monthly via Stripe to your bank account or PayPal.",
// // // //   },
// // // //   {
// // // //     q: "Is my prompt data private and secure?",
// // // //     a: "Yes. All prompts you create are private by default. We never train our models on your prompts without explicit consent. You choose what to share publicly on the marketplace. We are SOC2 Type II compliant.",
// // // //   },
// // // //   {
// // // //     q: "Can I use the API in production apps?",
// // // //     a: "Absolutely. The Tokun API is production-ready with 99.9% SLA uptime. Pro plans include 10,000 API calls/month. Teams plans have no limit. We offer dedicated infrastructure for enterprise customers requiring higher throughput.",
// // // //   },
// // // //   {
// // // //     q: "What makes Tokun different from just using ChatGPT directly?",
// // // //     a: "Tokun isn't a chatbot — it's an optimization layer. It takes your raw prompt ideas, refines them for any LLM, tracks performance metrics, and lets you monetize your best work. It works on top of any LLM, not instead of it.",
// // // //   },
// // // // ];

// // // // export function FAQSection() {
// // // //   const [openIdx, setOpenIdx] = useState<number | null>(null);
// // // //   const toggle = (i: number) => setOpenIdx(prev => prev === i ? null : i);

// // // //   return (
// // // //     <div className="mt-28" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>

// // // //       <div className="flex justify-center mb-6">
// // // //   <div style={{
// // // //     display: "inline-block",
// // // //     borderRadius: 9999,
// // // //     border: "1px solid rgba(255,20,239,0.35)",
// // // //     padding: "6px 20px",
// // // //   }}>
// // // //     <span style={{
// // // //       fontWeight: 500, fontSize: 16,
// // // //       background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// // // //       WebkitBackgroundClip: "text", color: "transparent",
// // // //     }}>
// // // //       FAQ
// // // //     </span>
// // // //   </div>
// // // // </div>

// // // //       <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Got questions?</h2>
// // // //       <p className="text-white/70 text-lg text-center mb-12">Everything you need to know about Tokun.AI</p>

// // // //       <div style={{ maxWidth: 740, margin: "0 auto", padding: "0 16px" }}>
// // // //         {FAQ_ITEMS.map((item, i) => {
// // // //           const isOpen = openIdx === i;
// // // //           return (
// // // //             <div key={i} style={{ borderBottom: "1px solid #1a1a1a", overflow: "hidden" }}>
// // // //               <button
// // // //                 type="button"
// // // //                 onClick={() => toggle(i)}
// // // //                 style={{
// // // //                   width: "100%", display: "flex", alignItems: "center",
// // // //                   justifyContent: "space-between", padding: "20px 0",
// // // //                   background: "transparent", border: "none", cursor: "pointer",
// // // //                   textAlign: "left", gap: 16,
// // // //                 }}
// // // //               >
// // // //                 <span style={{
// // // //                   fontSize: 16, fontWeight: 500,
// // // //                   color: isOpen ? "#fff" : "rgba(255,255,255,0.85)",
// // // //                   transition: "color 0.2s", lineHeight: 1.4,
// // // //                 }}>
// // // //                   {item.q}
// // // //                 </span>
// // // //                 <span style={{
// // // //                   flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
// // // //                   border: "1px solid rgba(255,255,255,0.2)",
// // // //                   display: "flex", alignItems: "center", justifyContent: "center",
// // // //                   background: "transparent",
// // // //                   transition: "all 0.3s",
// // // //                 }}>
// // // //                   <ChevronDown
// // // //                     size={15}
// // // //                     color="#fff"
// // // //                     style={{
// // // //                       transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
// // // //                       transition: "transform 0.3s ease",
// // // //                     }}
// // // //                   />
// // // //                 </span>
// // // //               </button>

// // // //               <AnimatePresence initial={false}>
// // // //                 {isOpen && (
// // // //                   <motion.div
// // // //                     initial={{ height: 0, opacity: 0 }}
// // // //                     animate={{ height: "auto", opacity: 1 }}
// // // //                     exit={{ height: 0, opacity: 0 }}
// // // //                     transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
// // // //                     style={{ overflow: "hidden" }}
// // // //                   >
// // // //                     <p style={{
// // // //                       fontSize: 14, color: "rgba(255,255,255,0.65)",
// // // //                       lineHeight: 1.8, paddingBottom: 20, paddingRight: 44,
// // // //                     }}>
// // // //                       {item.a}
// // // //                     </p>
// // // //                   </motion.div>
// // // //                 )}
// // // //               </AnimatePresence>
// // // //             </div>
// // // //           );
// // // //         })}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // // // ============================================================
// // // // // USAGE in Landing.tsx:
// // // // //
// // // // // import { TickerSection, GlobeSection, FAQSection } from "./GlobeAndFAQ_components";
// // // // //
// // // // // Place <TickerSection /> just AFTER your Hero section, before Features
// // // // //
// // // // // Place <GlobeSection /> before {/* TESTIMONIALS */}
// // // // // Place <FAQSection />  after  {/* FINAL CTA */}
// // // // // ============================================================








// // // // ============================================================
// // // // TOKUN.AI — Globe + FAQ + Ticker Components (3D GLB VERSION)
// // // // ============================================================

// // // import { useEffect, useRef, useState, Suspense } from "react";
// // // import { motion, AnimatePresence } from "framer-motion";
// // // import { ChevronDown } from "lucide-react";
// // // import { Canvas, useFrame } from "@react-three/fiber";
// // // import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
// // // import * as THREE from "three";

// // // // ─────────────────────────────────────────────
// // // // 0. TICKER / MARQUEE SECTION
// // // // Usage: <TickerSection />
// // // // ─────────────────────────────────────────────

// // // const TICKER_ITEMS = [
// // //   "SmartGen AI",
// // //   "Prompt Optimization",
// // //   "Token Reduction",
// // //   "Prompt Marketplace",
// // //   "LLM Compatible",
// // //   "GPT-4 · Claude · Gemini",
// // //   "Earn from Prompts",
// // //   "AI-Powered Library",
// // //   "24/7 Support",
// // // ];

// // // export function TickerSection() {
// // //   const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

// // //   return (
// // //     <div
// // //       style={{
// // //         overflow: "hidden",
// // //         padding: "20px 0",
// // //         borderTop: "1px solid rgba(255,255,255,0.08)",
// // //         borderBottom: "1px solid rgba(255,255,255,0.08)",
// // //         background: "#0d0d1a",
// // //         fontFamily: "Inter, ui-sans-serif, system-ui",
// // //         margin: "48px 0",
// // //       }}
// // //     >
// // //       <style>{`
// // //         @keyframes tokun-ticker {
// // //           from { transform: translateX(0); }
// // //           to   { transform: translateX(-50%); }
// // //         }
// // //         .tokun-ticker-track {
// // //           display: flex;
// // //           animation: tokun-ticker 25s linear infinite;
// // //           white-space: nowrap;
// // //           width: max-content;
// // //         }
// // //         .tokun-ticker-track:hover {
// // //           animation-play-state: paused;
// // //         }
// // //       `}</style>

// // //       <div className="tokun-ticker-track">
// // //         {items.map((item, i) => (
// // //           <div
// // //             key={i}
// // //             style={{
// // //               display: "flex",
// // //               alignItems: "center",
// // //               gap: 10,
// // //               fontSize: 14,
// // //               color: "rgba(255,255,255,0.45)",
// // //               paddingRight: 48,
// // //             }}
// // //           >
// // //             <span
// // //               style={{
// // //                 width: 4,
// // //                 height: 4,
// // //                 borderRadius: "50%",
// // //                 background: "linear-gradient(90deg, #FF14EF, #1A73E8)",
// // //                 flexShrink: 0,
// // //                 display: "inline-block",
// // //               }}
// // //             />
// // //             {item}
// // //           </div>
// // //         ))}
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // ─────────────────────────────────────────────
// // // // 1. 3D GLOBE SECTION (GLB MODEL)
// // // // ─────────────────────────────────────────────

// // // const GLOBE_USERS = [
// // //   { lat: 35.6, lon: 139.7, flag: "🇯🇵", name: "Yuki Tanaka", city: "Tokyo, Japan", msg: "I love SmartGen! Saves me hours every day ✨" },
// // //   { lat: 51.5, lon: -0.1, flag: "🇬🇧", name: "James Harper", city: "London, UK", msg: "Cut my GPT-4 costs by 58% with Tokun!" },
// // //   { lat: 37.7, lon: -122.4, flag: "🇺🇸", name: "Sarah Chen", city: "San Francisco, USA", msg: "Best prompt tool on the market 🔥" },
// // //   { lat: 48.8, lon: 2.3, flag: "🇫🇷", name: "Léa Moreau", city: "Paris, France", msg: "Tokun marketplace made me $800 this month! 💰" },
// // //   { lat: 28.6, lon: 77.2, flag: "🇮🇳", name: "Arjun Sharma", city: "New Delhi, India", msg: "SmartGen is a total game changer for AI devs!" },
// // //   { lat: -23.5, lon: -46.6, flag: "🇧🇷", name: "Lucas Oliveira", city: "São Paulo, Brazil", msg: "Melhor ferramenta de prompts! 🚀" },
// // //   { lat: 1.4, lon: 103.8, flag: "🇸🇬", name: "Wei Liang", city: "Singapore", msg: "Our whole team switched to Tokun. No regrets!" },
// // //   { lat: 55.7, lon: 37.6, flag: "🇷🇺", name: "Dmitri Volkov", city: "Moscow, Russia", msg: "Token optimization is genuinely impressive 👏" },
// // //   { lat: -33.8, lon: 151.2, flag: "🇦🇺", name: "Emma Wilson", city: "Sydney, Australia", msg: "Love the prompt library! Saves so much time ⚡" },
// // //   { lat: 52.5, lon: 13.4, flag: "🇩🇪", name: "Klaus Weber", city: "Berlin, Germany", msg: "Tokun API integrates perfectly with our stack!" },
// // //   { lat: 19.0, lon: 72.8, flag: "🇮🇳", name: "Priya Nair", city: "Mumbai, India", msg: "SmartGen wrote a better prompt than me 😂❤️" },
// // //   { lat: 40.7, lon: -74.0, flag: "🇺🇸", name: "Alex Rivera", city: "New York, USA", msg: "50K prompts on Tokun already? So deserved!" },
// // //   { lat: 31.2, lon: 121.5, flag: "🇨🇳", name: "Li Wei", city: "Shanghai, China", msg: "Supports every LLM I use. Perfect tool!" },
// // //   { lat: -1.3, lon: 36.8, flag: "🇰🇪", name: "Amara Osei", city: "Nairobi, Kenya", msg: "Tokun is growing our AI startup faster 🌍" },
// // //   { lat: 59.3, lon: 18.1, flag: "🇸🇪", name: "Erik Lindqvist", city: "Stockholm, Sweden", msg: "Elegant, fast, support is amazing 🙌" },
// // //   { lat: 25.2, lon: 55.3, flag: "🇦🇪", name: "Farah Al-Nasser", city: "Dubai, UAE", msg: "Prompt marketplace is a brilliant idea! 💡" },
// // //   { lat: 41.0, lon: 29.0, flag: "🇹🇷", name: "Ceren Yilmaz", city: "Istanbul, Turkey", msg: "Tokun helped me 10x my freelance AI work!" },
// // // ];

// // // type GlobeUser = typeof GLOBE_USERS[number];

// // // function GlobeModel() {
// // //   const groupRef = useRef<THREE.Group>(null);
// // //   const { scene } = useGLTF("/models/airports_around_the_world.glb");

// // //   useEffect(() => {
// // //     if (!scene || !groupRef.current) return;

// // //     scene.traverse((child: any) => {
// // //       if (child.isMesh) {
// // //         child.castShadow = false;
// // //         child.receiveShadow = false;

// // //         if (child.material) {
// // //           child.material.transparent = false;
// // //           child.material.depthWrite = true;
// // //         }
// // //       }
// // //     });

// // //     const box = new THREE.Box3().setFromObject(scene);
// // //     const size = new THREE.Vector3();
// // //     const center = new THREE.Vector3();

// // //     box.getSize(size);
// // //     box.getCenter(center);

// // //     scene.position.set(-center.x, -center.y, -center.z);

// // //     const maxAxis = Math.max(size.x, size.y, size.z) || 1;
// // //     const targetSize = 4.9;
// // //     const fitScale = targetSize / maxAxis;

// // //     groupRef.current.scale.setScalar(fitScale);
// // //     groupRef.current.position.set(0, -0.04, 0);
// // //   }, [scene]);

// // //   useFrame(() => {
// // //     if (!groupRef.current) return;
// // //     groupRef.current.rotation.y += 0.0032;
// // //   });

// // //   return (
// // //     <group ref={groupRef} rotation={[0.08, 0.5, 0]}>
// // //       <primitive object={scene} />
// // //     </group>
// // //   );
// // // }


// // // function GlobeFallback() {
// // //   return (
// // //     <div
// // //       className="w-full aspect-square rounded-full"
// // //       style={{
// // //         background:
// // //           "radial-gradient(circle at 50% 50%, rgba(255,20,239,0.18) 0%, rgba(26,115,232,0.14) 35%, rgba(3,4,6,1) 72%)",
// // //         border: "1px solid rgba(255,255,255,0.08)",
// // //       }}
// // //     />
// // //   );
// // // }



// // // export function GlobeSection() {
// // //   const [activeUser, setActiveUser] = useState<GlobeUser | null>(null);
// // //   const [userIndex, setUserIndex] = useState(0);

// // //   useEffect(() => {
// // //     setActiveUser(GLOBE_USERS[0]);

// // //     const interval = setInterval(() => {
// // //       setUserIndex((prev) => {
// // //         const next = (prev + 1) % GLOBE_USERS.length;
// // //         setActiveUser(GLOBE_USERS[next]);
// // //         return next;
// // //       });
// // //     }, 3500);

// // //     return () => clearInterval(interval);
// // //   }, []);

// // //   return (
// // //     <div
// // //       className="mt-24 text-center px-4"
// // //       style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
// // //     >
// // //       <div className="flex justify-center mb-6">
// // //         <div
// // //           style={{
// // //             display: "inline-block",
// // //             borderRadius: 9999,
// // //             border: "1px solid rgba(255,20,239,0.35)",
// // //             padding: "6px 20px",
// // //           }}
// // //         >
// // //           <span
// // //             style={{
// // //               fontWeight: 500,
// // //               fontSize: 16,
// // //               background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// // //               WebkitBackgroundClip: "text",
// // //               color: "transparent",
// // //             }}
// // //           >
// // //             GLOBAL COMMUNITY
// // //           </span>
// // //         </div>
// // //       </div>

// // //       <h2 className="text-4xl md:text-5xl font-bold mb-4">
// // //         Loved across the globe
// // //       </h2>

// // //       <p className="text-white/70 text-lg mb-6 max-w-xl mx-auto">
// // //         Thousands of prompt engineers from every corner of the world trust Tokun.AI daily.
// // //       </p>

// // //    <div className="relative mx-auto w-full max-w-[620px]">
// // //   <div
// // //     className="absolute inset-4 rounded-full blur-[90px] opacity-65"
// // //     style={{
// // //       background:
// // //         "radial-gradient(circle at center, rgba(255,20,239,0.28) 0%, rgba(26,115,232,0.22) 50%, transparent 76%)",
// // //     }}
// // //   />

// // //   <div className="relative w-full aspect-square rounded-full overflow-hidden">
// // //     <Suspense fallback={<GlobeFallback />}>
// // //       <Canvas
// // //         camera={{ position: [0, 0, 4.8], fov: 34 }}
// // //         dpr={[1, 2]}
// // //         style={{
// // //           background: "transparent",
// // //           borderRadius: "9999px",
// // //         }}
// // //       >
// // //         <ambientLight intensity={1.7} />
// // //         <directionalLight position={[4, 3, 5]} intensity={2.5} />
// // //         <directionalLight
// // //           position={[-4, -2, -3]}
// // //           intensity={1.25}
// // //           color="#1A73E8"
// // //         />
// // //         <pointLight position={[0, 0, 3]} intensity={1.6} color="#FF14EF" />
// // //         <Environment preset="city" />

// // //         <GlobeModel />

// // //         <OrbitControls
// // //           enableZoom={false}
// // //           enablePan={false}
// // //           autoRotate={false}
// // //           minPolarAngle={Math.PI / 2.12}
// // //           maxPolarAngle={Math.PI / 1.88}
// // //         />
// // //       </Canvas>
// // //     </Suspense>

// // //     <AnimatePresence mode="wait">
// // //       {activeUser && (
// // //         <motion.div
// // //           key={`${activeUser.name}-${userIndex}`}
// // //           initial={{ opacity: 0, y: 8, scale: 0.96 }}
// // //           animate={{ opacity: 1, y: 0, scale: 1 }}
// // //           exit={{ opacity: 0, y: -8, scale: 0.96 }}
// // //           transition={{ duration: 0.35 }}
// // //           className="absolute left-1/2 top-[11%] -translate-x-1/2 z-10 w-[76%] max-w-[215px] rounded-xl border px-3 py-2 text-left pointer-events-none"
// // //           style={{
// // //             background: "rgba(23,23,26,0.94)",
// // //             borderColor: "rgba(255,20,239,0.26)",
// // //             boxShadow:
// // //               "0 0 24px rgba(255,20,239,0.12), 0 8px 24px rgba(0,0,0,0.42)",
// // //             backdropFilter: "blur(8px)",
// // //           }}
// // //         >
// // //           <div className="flex items-center gap-2 mb-1.5">
// // //             <span style={{ fontSize: 15 }}>{activeUser.flag}</span>
// // //             <div className="min-w-0">
// // //               <div className="text-[11px] font-semibold text-white truncate">
// // //                 {activeUser.name}
// // //               </div>
// // //               <div className="text-[9px] text-white/55 truncate">
// // //                 {activeUser.city}
// // //               </div>
// // //             </div>
// // //           </div>

// // //           <p className="text-[10px] text-white/75 leading-relaxed line-clamp-3">
// // //             "{activeUser.msg}"
// // //           </p>
// // //         </motion.div>
// // //       )}
// // //     </AnimatePresence>
// // //   </div>
// // // </div>

// // //       <div
// // //         style={{
// // //           display: "flex",
// // //           gap: 48,
// // //           justifyContent: "center",
// // //           flexWrap: "wrap",
// // //           marginTop: 8,
// // //         }}
// // //       >
// // //         {[["120+", "Countries"], ["10K+", "Active Users"], ["50K+", "Prompts Created"]].map(
// // //           ([num, label]) => (
// // //             <div key={label} style={{ textAlign: "center" }}>
// // //               <div
// // //                 style={{
// // //                   fontSize: 28,
// // //                   fontWeight: 700,
// // //                   background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// // //                   WebkitBackgroundClip: "text",
// // //                   color: "transparent",
// // //                 }}
// // //               >
// // //                 {num}
// // //               </div>
// // //               <div style={{ fontSize: 13, color: "#8884aa", marginTop: 4 }}>
// // //                 {label}
// // //               </div>
// // //             </div>
// // //           )
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // // useGLTF.preload("/models/airports_around_the_world.glb");

// // // // ─────────────────────────────────────────────
// // // // 2. FAQ SECTION
// // // // ─────────────────────────────────────────────

// // // const FAQ_ITEMS = [
// // //   {
// // //     q: "What LLMs does Tokun support?",
// // //     a: "Tokun supports all major LLMs including GPT-4, GPT-4o, Claude 3 (Sonnet, Opus, Haiku), Gemini Pro/Ultra, Llama 3, Mistral, and more. New models are added within days of their public release.",
// // //   },
// // //   {
// // //     q: "How does the token reduction actually work?",
// // //     a: "SmartGen analyzes your intent and rewrites prompts to be semantically equivalent but structurally more efficient. It removes redundant instructions, consolidates overlapping requirements, and uses model-specific formatting that reduces token consumption without sacrificing output quality.",
// // //   },
// // //   {
// // //     q: "How do I earn money on the marketplace?",
// // //     a: "You list your optimized prompts with a price (one-time or subscription). When other users purchase your prompt, you receive 80% of the revenue. Payouts are processed monthly via Stripe to your bank account or PayPal.",
// // //   },
// // //   {
// // //     q: "Is my prompt data private and secure?",
// // //     a: "Yes. All prompts you create are private by default. We never train our models on your prompts without explicit consent. You choose what to share publicly on the marketplace. We are SOC2 Type II compliant.",
// // //   },
// // //   {
// // //     q: "Can I use the API in production apps?",
// // //     a: "Absolutely. The Tokun API is production-ready with 99.9% SLA uptime. Pro plans include 10,000 API calls/month. Teams plans have no limit. We offer dedicated infrastructure for enterprise customers requiring higher throughput.",
// // //   },
// // //   {
// // //     q: "What makes Tokun different from just using ChatGPT directly?",
// // //     a: "Tokun isn't a chatbot — it's an optimization layer. It takes your raw prompt ideas, refines them for any LLM, tracks performance metrics, and lets you monetize your best work. It works on top of any LLM, not instead of it.",
// // //   },
// // // ];

// // // export function FAQSection() {
// // //   const [openIdx, setOpenIdx] = useState<number | null>(null);
// // //   const toggle = (i: number) => setOpenIdx((prev) => (prev === i ? null : i));

// // //   return (
// // //     <div className="mt-28" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>
// // //       <div className="flex justify-center mb-6">
// // //         <div
// // //           style={{
// // //             display: "inline-block",
// // //             borderRadius: 9999,
// // //             border: "1px solid rgba(255,20,239,0.35)",
// // //             padding: "6px 20px",
// // //           }}
// // //         >
// // //           <span
// // //             style={{
// // //               fontWeight: 500,
// // //               fontSize: 16,
// // //               background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// // //               WebkitBackgroundClip: "text",
// // //               color: "transparent",
// // //             }}
// // //           >
// // //             FAQ
// // //           </span>
// // //         </div>
// // //       </div>

// // //       <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Got questions?</h2>
// // //       <p className="text-white/70 text-lg text-center mb-12">
// // //         Everything you need to know about Tokun.AI
// // //       </p>

// // //       <div style={{ maxWidth: 740, margin: "0 auto", padding: "0 16px" }}>
// // //         {FAQ_ITEMS.map((item, i) => {
// // //           const isOpen = openIdx === i;
// // //           return (
// // //             <div key={i} style={{ borderBottom: "1px solid #1a1a1a", overflow: "hidden" }}>
// // //               <button
// // //                 type="button"
// // //                 onClick={() => toggle(i)}
// // //                 style={{
// // //                   width: "100%",
// // //                   display: "flex",
// // //                   alignItems: "center",
// // //                   justifyContent: "space-between",
// // //                   padding: "20px 0",
// // //                   background: "transparent",
// // //                   border: "none",
// // //                   cursor: "pointer",
// // //                   textAlign: "left",
// // //                   gap: 16,
// // //                 }}
// // //               >
// // //                 <span
// // //                   style={{
// // //                     fontSize: 16,
// // //                     fontWeight: 500,
// // //                     color: isOpen ? "#fff" : "rgba(255,255,255,0.85)",
// // //                     transition: "color 0.2s",
// // //                     lineHeight: 1.4,
// // //                   }}
// // //                 >
// // //                   {item.q}
// // //                 </span>
// // //                 <span
// // //                   style={{
// // //                     flexShrink: 0,
// // //                     width: 28,
// // //                     height: 28,
// // //                     borderRadius: "50%",
// // //                     border: "1px solid rgba(255,255,255,0.2)",
// // //                     display: "flex",
// // //                     alignItems: "center",
// // //                     justifyContent: "center",
// // //                     background: "transparent",
// // //                     transition: "all 0.3s",
// // //                   }}
// // //                 >
// // //                   <ChevronDown
// // //                     size={15}
// // //                     color="#fff"
// // //                     style={{
// // //                       transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
// // //                       transition: "transform 0.3s ease",
// // //                     }}
// // //                   />
// // //                 </span>
// // //               </button>

// // //               <AnimatePresence initial={false}>
// // //                 {isOpen && (
// // //                   <motion.div
// // //                     initial={{ height: 0, opacity: 0 }}
// // //                     animate={{ height: "auto", opacity: 1 }}
// // //                     exit={{ height: 0, opacity: 0 }}
// // //                     transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
// // //                     style={{ overflow: "hidden" }}
// // //                   >
// // //                     <p
// // //                       style={{
// // //                         fontSize: 14,
// // //                         color: "rgba(255,255,255,0.65)",
// // //                         lineHeight: 1.8,
// // //                         paddingBottom: 20,
// // //                         paddingRight: 44,
// // //                       }}
// // //                     >
// // //                       {item.a}
// // //                     </p>
// // //                   </motion.div>
// // //                 )}
// // //               </AnimatePresence>
// // //             </div>
// // //           );
// // //         })}
// // //       </div>
// // //     </div>
// // //   );
// // // }








// // // // ============================================================
// // // // TOKUN.AI — Globe + FAQ + Ticker Components (FINAL 3D GLOBE)
// // // // ============================================================

// // // import { Suspense, useEffect, useMemo, useRef, useState } from "react";
// // // import { motion, AnimatePresence } from "framer-motion";
// // // import { ChevronDown } from "lucide-react";
// // // import { Canvas, useFrame } from "@react-three/fiber";
// // // import {
// // //   OrbitControls,
// // //   useGLTF,
// // //   Environment,
// // //   ContactShadows,
// // // } from "@react-three/drei";
// // // import * as THREE from "three";

// // // // ─────────────────────────────────────────────
// // // // 0. TICKER / MARQUEE SECTION
// // // // ─────────────────────────────────────────────

// // // const TICKER_ITEMS = [
// // //   "SmartGen AI",
// // //   "Prompt Optimization",
// // //   "Token Reduction",
// // //   "Prompt Marketplace",
// // //   "LLM Compatible",
// // //   "GPT-4 · Claude · Gemini",
// // //   "Earn from Prompts",
// // //   "AI-Powered Library",
// // //   "24/7 Support",
// // // ];

// // // export function TickerSection() {
// // //   const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

// // //   return (
// // //     <div
// // //       style={{
// // //         overflow: "hidden",
// // //         padding: "20px 0",
// // //         borderTop: "1px solid rgba(255,255,255,0.08)",
// // //         borderBottom: "1px solid rgba(255,255,255,0.08)",
// // //         background: "#0d0d1a",
// // //         fontFamily: "Inter, ui-sans-serif, system-ui",
// // //         margin: "48px 0",
// // //       }}
// // //     >
// // //       <style>{`
// // //         @keyframes tokun-ticker {
// // //           from { transform: translateX(0); }
// // //           to   { transform: translateX(-50%); }
// // //         }
// // //         .tokun-ticker-track {
// // //           display: flex;
// // //           animation: tokun-ticker 25s linear infinite;
// // //           white-space: nowrap;
// // //           width: max-content;
// // //         }
// // //         .tokun-ticker-track:hover {
// // //           animation-play-state: paused;
// // //         }
// // //       `}</style>

// // //       <div className="tokun-ticker-track">
// // //         {items.map((item, i) => (
// // //           <div
// // //             key={i}
// // //             style={{
// // //               display: "flex",
// // //               alignItems: "center",
// // //               gap: 10,
// // //               fontSize: 14,
// // //               color: "rgba(255,255,255,0.45)",
// // //               paddingRight: 48,
// // //             }}
// // //           >
// // //             <span
// // //               style={{
// // //                 width: 4,
// // //                 height: 4,
// // //                 borderRadius: "50%",
// // //                 background: "linear-gradient(90deg, #FF14EF, #1A73E8)",
// // //                 flexShrink: 0,
// // //                 display: "inline-block",
// // //               }}
// // //             />
// // //             {item}
// // //           </div>
// // //         ))}
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // ─────────────────────────────────────────────
// // // // 1. 3D GLOBE SECTION
// // // // ─────────────────────────────────────────────

// // // const GLOBE_USERS = [
// // //   { lat: 35.6, lon: 139.7, flag: "🇯🇵", name: "Yuki Tanaka", city: "Tokyo, Japan", msg: "I love SmartGen! Saves me hours every day ✨" },
// // //   { lat: 51.5, lon: -0.1, flag: "🇬🇧", name: "James Harper", city: "London, UK", msg: "Cut my GPT-4 costs by 58% with Tokun!" },
// // //   { lat: 37.7, lon: -122.4, flag: "🇺🇸", name: "Sarah Chen", city: "San Francisco, USA", msg: "Best prompt tool on the market 🔥" },
// // //   { lat: 48.8, lon: 2.3, flag: "🇫🇷", name: "Léa Moreau", city: "Paris, France", msg: "Tokun marketplace made me $800 this month! 💰" },
// // //   { lat: 28.6, lon: 77.2, flag: "🇮🇳", name: "Arjun Sharma", city: "New Delhi, India", msg: "SmartGen is a total game changer for AI devs!" },
// // //   { lat: -23.5, lon: -46.6, flag: "🇧🇷", name: "Lucas Oliveira", city: "São Paulo, Brazil", msg: "Melhor ferramenta de prompts! 🚀" },
// // //   { lat: 1.4, lon: 103.8, flag: "🇸🇬", name: "Wei Liang", city: "Singapore", msg: "Our whole team switched to Tokun. No regrets!" },
// // //   { lat: 55.7, lon: 37.6, flag: "🇷🇺", name: "Dmitri Volkov", city: "Moscow, Russia", msg: "Token optimization is genuinely impressive 👏" },
// // //   { lat: -33.8, lon: 151.2, flag: "🇦🇺", name: "Emma Wilson", city: "Sydney, Australia", msg: "Love the prompt library! Saves so much time ⚡" },
// // //   { lat: 52.5, lon: 13.4, flag: "🇩🇪", name: "Klaus Weber", city: "Berlin, Germany", msg: "Tokun API integrates perfectly with our stack!" },
// // //   { lat: 19.0, lon: 72.8, flag: "🇮🇳", name: "Priya Nair", city: "Mumbai, India", msg: "SmartGen wrote a better prompt than me 😂❤️" },
// // //   { lat: 40.7, lon: -74.0, flag: "🇺🇸", name: "Alex Rivera", city: "New York, USA", msg: "50K prompts on Tokun already? So deserved!" },
// // //   { lat: 31.2, lon: 121.5, flag: "🇨🇳", name: "Li Wei", city: "Shanghai, China", msg: "Supports every LLM I use. Perfect tool!" },
// // //   { lat: -1.3, lon: 36.8, flag: "🇰🇪", name: "Amara Osei", city: "Nairobi, Kenya", msg: "Tokun is growing our AI startup faster 🌍" },
// // //   { lat: 59.3, lon: 18.1, flag: "🇸🇪", name: "Erik Lindqvist", city: "Stockholm, Sweden", msg: "Elegant, fast, support is amazing 🙌" },
// // //   { lat: 25.2, lon: 55.3, flag: "🇦🇪", name: "Farah Al-Nasser", city: "Dubai, UAE", msg: "Prompt marketplace is a brilliant idea! 💡" },
// // //   { lat: 41.0, lon: 29.0, flag: "🇹🇷", name: "Ceren Yilmaz", city: "Istanbul, Turkey", msg: "Tokun helped me 10x my freelance AI work!" },
// // // ];

// // // type GlobeUser = typeof GLOBE_USERS[number];

// // // function AtmosphereShell() {
// // //   const glowRef = useRef<THREE.Mesh>(null);
// // //   const outerRef = useRef<THREE.Mesh>(null);

// // //   useFrame((state) => {
// // //     if (glowRef.current) {
// // //       glowRef.current.rotation.y = state.clock.elapsedTime * 0.08;
// // //     }
// // //     if (outerRef.current) {
// // //       outerRef.current.rotation.y = -state.clock.elapsedTime * 0.05;
// // //     }
// // //   });

// // //   return (
// // //     <>
// // //       <mesh ref={glowRef}>
// // //         <sphereGeometry args={[1.95, 64, 64]} />
// // //         <meshPhongMaterial
// // //           color="#10172f"
// // //           transparent
// // //           opacity={0.18}
// // //           shininess={120}
// // //           specular={new THREE.Color("#9cd8ff")}
// // //         />
// // //       </mesh>

// // //       <mesh ref={outerRef}>
// // //         <sphereGeometry args={[2.1, 64, 64]} />
// // //         <meshBasicMaterial
// // //           color="#4c82ff"
// // //           transparent
// // //           opacity={0.06}
// // //           side={THREE.BackSide}
// // //         />
// // //       </mesh>
// // //     </>
// // //   );
// // // }

// // // function GlobeModel() {
// // //   const groupRef = useRef<THREE.Group>(null);
// // //   const { scene } = useGLTF("/models/airports_around_the_world.glb");
// // //   const clonedScene = useMemo(() => scene.clone(true), [scene]);

// // //   useEffect(() => {
// // //     if (!clonedScene || !groupRef.current) return;

// // //     clonedScene.traverse((child: any) => {
// // //       if (child.isMesh) {
// // //         child.castShadow = true;
// // //         child.receiveShadow = true;

// // //         const mats = Array.isArray(child.material)
// // //           ? child.material
// // //           : [child.material];

// // //         mats.forEach((mat: any) => {
// // //           if (!mat) return;
// // //           mat.transparent = false;
// // //           mat.depthWrite = true;

// // //           if ("roughness" in mat && typeof mat.roughness === "number") {
// // //             mat.roughness = Math.min(mat.roughness, 0.8);
// // //           }

// // //           if ("metalness" in mat && typeof mat.metalness === "number") {
// // //             mat.metalness = Math.max(mat.metalness, 0.08);
// // //           }
// // //         });
// // //       }
// // //     });

// // //     const box = new THREE.Box3().setFromObject(clonedScene);
// // //     const size = new THREE.Vector3();
// // //     const center = new THREE.Vector3();

// // //     box.getSize(size);
// // //     box.getCenter(center);

// // //     clonedScene.position.set(-center.x, -center.y, -center.z);

// // //     // Big but still inside the atmosphere shell
// // //     const maxAxis = Math.max(size.x, size.y, size.z) || 1;
// // //     const targetMaxAxis = 2.85;
// // //     const fitScale = targetMaxAxis / maxAxis;

// // //     groupRef.current.scale.setScalar(fitScale);
// // //     groupRef.current.position.set(0, -0.08, 0);
// // //   }, [clonedScene]);

// // //   useFrame((state) => {
// // //     if (!groupRef.current) return;

// // //     groupRef.current.rotation.y += 0.0028;
// // //     groupRef.current.rotation.x =
// // //       0.26 + Math.sin(state.clock.elapsedTime * 0.7) * 0.02;
// // //     groupRef.current.rotation.z =
// // //       -0.06 + Math.sin(state.clock.elapsedTime * 0.45) * 0.01;
// // //   });

// // //   return (
// // //     <group ref={groupRef}>
// // //       <primitive object={clonedScene} />
// // //     </group>
// // //   );
// // // }

// // // function GlobeScene() {
// // //   return (
// // //     <>
// // //       <fog attach="fog" args={["#030406", 5.8, 10.5]} />

// // //       <ambientLight intensity={0.85} />
// // //       <hemisphereLight
// // //         args={["#cfe8ff", "#0a0d17", 0.75]}
// // //       />
// // //       <directionalLight position={[5, 4, 6]} intensity={2.2} />
// // //       <directionalLight position={[-3, -2, -4]} intensity={0.9} color="#1A73E8" />
// // //       <pointLight position={[2, 1, 4]} intensity={1.2} color="#FF14EF" />
// // //       <spotLight
// // //         position={[0, 6, 6]}
// // //         angle={0.45}
// // //         penumbra={1}
// // //         intensity={1.4}
// // //         color="#ffffff"
// // //       />

// // //       <Environment preset="city" />

// // //       <AtmosphereShell />
// // //       <GlobeModel />

// // //       <ContactShadows
// // //         position={[0, -2.1, 0]}
// // //         opacity={0.32}
// // //         scale={5.8}
// // //         blur={2.8}
// // //         far={5.5}
// // //         color="#000000"
// // //       />

// // //       <OrbitControls
// // //         enableZoom={false}
// // //         enablePan={false}
// // //         autoRotate={false}
// // //         minPolarAngle={Math.PI / 2.2}
// // //         maxPolarAngle={Math.PI / 1.82}
// // //       />
// // //     </>
// // //   );
// // // }

// // // function GlobeFallback() {
// // //   return (
// // //     <div
// // //       className="w-full aspect-square rounded-full"
// // //       style={{
// // //         background:
// // //           "radial-gradient(circle at 50% 50%, rgba(255,20,239,0.18) 0%, rgba(26,115,232,0.14) 35%, rgba(3,4,6,1) 72%)",
// // //         border: "1px solid rgba(255,255,255,0.08)",
// // //       }}
// // //     />
// // //   );
// // // }

// // // export function GlobeSection() {
// // //   const [activeUser, setActiveUser] = useState<GlobeUser | null>(null);
// // //   const [userIndex, setUserIndex] = useState(0);

// // //   useEffect(() => {
// // //     setActiveUser(GLOBE_USERS[0]);

// // //     const interval = setInterval(() => {
// // //       setUserIndex((prev) => {
// // //         const next = (prev + 1) % GLOBE_USERS.length;
// // //         setActiveUser(GLOBE_USERS[next]);
// // //         return next;
// // //       });
// // //     }, 3500);

// // //     return () => clearInterval(interval);
// // //   }, []);

// // //   return (
// // //     <div
// // //       className="mt-24 text-center px-4"
// // //       style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
// // //     >
// // //       <div className="flex justify-center mb-6">
// // //         <div
// // //           style={{
// // //             display: "inline-block",
// // //             borderRadius: 9999,
// // //             border: "1px solid rgba(255,20,239,0.35)",
// // //             padding: "6px 20px",
// // //           }}
// // //         >
// // //           <span
// // //             style={{
// // //               fontWeight: 500,
// // //               fontSize: 16,
// // //               background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// // //               WebkitBackgroundClip: "text",
// // //               color: "transparent",
// // //             }}
// // //           >
// // //             GLOBAL COMMUNITY
// // //           </span>
// // //         </div>
// // //       </div>

// // //       <h2 className="text-4xl md:text-5xl font-bold mb-4">
// // //         Loved across the globe
// // //       </h2>

// // //       <p className="text-white/70 text-lg mb-6 max-w-xl mx-auto">
// // //         Thousands of prompt engineers from every corner of the world trust Tokun.AI daily.
// // //       </p>

// // //       <div className="relative mx-auto w-full max-w-[760px]">
// // //         {/* Back glow */}
// // //         <div
// // //           className="absolute inset-0 blur-[110px] opacity-70"
// // //           style={{
// // //             background:
// // //               "radial-gradient(circle at center, rgba(255,20,239,0.30) 0%, rgba(26,115,232,0.24) 50%, transparent 78%)",
// // //           }}
// // //         />

// // //         {/* Main globe block */}
// // //         <div className="relative w-full aspect-square">
// // //           {/* Inner highlights */}
// // //           <div
// // //             className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[82%] h-[82%] rounded-full"
// // //             style={{
// // //               background:
// // //                 "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.10) 0%, rgba(255,20,239,0.10) 22%, rgba(26,115,232,0.08) 46%, rgba(0,0,0,0) 72%)",
// // //               filter: "blur(26px)",
// // //             }}
// // //           />

// // //           <div
// // //             className="absolute left-1/2 bottom-[10%] -translate-x-1/2 w-[44%] h-[10%] rounded-full"
// // //             style={{
// // //               background: "rgba(0,0,0,0.45)",
// // //               filter: "blur(18px)",
// // //             }}
// // //           />

// // //           <Suspense fallback={<GlobeFallback />}>
// // //             <Canvas
// // //               camera={{ position: [0, 0.25, 5.4], fov: 30 }}
// // //               dpr={[1, 2]}
// // //               style={{ background: "transparent" }}
// // //             >
// // //               <GlobeScene />
// // //             </Canvas>
// // //           </Suspense>

// // //           {/* Review card */}
// // //           <AnimatePresence mode="wait">
// // //             {activeUser && (
// // //               <motion.div
// // //                 key={`${activeUser.name}-${userIndex}`}
// // //                 initial={{ opacity: 0, y: 8, scale: 0.96 }}
// // //                 animate={{ opacity: 1, y: 0, scale: 1 }}
// // //                 exit={{ opacity: 0, y: -8, scale: 0.96 }}
// // //                 transition={{ duration: 0.35 }}
// // //                 className="absolute left-1/2 top-[16%] -translate-x-1/2 z-10 w-[76%] max-w-[215px] rounded-xl border px-3 py-2 text-left pointer-events-none"
// // //                 style={{
// // //                   background: "rgba(23,23,26,0.94)",
// // //                   borderColor: "rgba(255,20,239,0.26)",
// // //                   boxShadow:
// // //                     "0 0 24px rgba(255,20,239,0.12), 0 8px 24px rgba(0,0,0,0.42)",
// // //                   backdropFilter: "blur(8px)",
// // //                 }}
// // //               >
// // //                 <div className="flex items-center gap-2 mb-1.5">
// // //                   <span style={{ fontSize: 15 }}>{activeUser.flag}</span>
// // //                   <div className="min-w-0">
// // //                     <div className="text-[11px] font-semibold text-white truncate">
// // //                       {activeUser.name}
// // //                     </div>
// // //                     <div className="text-[9px] text-white/55 truncate">
// // //                       {activeUser.city}
// // //                     </div>
// // //                   </div>
// // //                 </div>

// // //                 <p className="text-[10px] text-white/75 leading-relaxed line-clamp-3">
// // //                   "{activeUser.msg}"
// // //                 </p>
// // //               </motion.div>
// // //             )}
// // //           </AnimatePresence>
// // //         </div>
// // //       </div>

// // //       <div
// // //         style={{
// // //           display: "flex",
// // //           gap: 48,
// // //           justifyContent: "center",
// // //           flexWrap: "wrap",
// // //           marginTop: 8,
// // //         }}
// // //       >
// // //         {[["120+", "Countries"], ["10K+", "Active Users"], ["50K+", "Prompts Created"]].map(
// // //           ([num, label]) => (
// // //             <div key={label} style={{ textAlign: "center" }}>
// // //               <div
// // //                 style={{
// // //                   fontSize: 28,
// // //                   fontWeight: 700,
// // //                   background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// // //                   WebkitBackgroundClip: "text",
// // //                   color: "transparent",
// // //                 }}
// // //               >
// // //                 {num}
// // //               </div>
// // //               <div style={{ fontSize: 13, color: "#8884aa", marginTop: 4 }}>
// // //                 {label}
// // //               </div>
// // //             </div>
// // //           )
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // useGLTF.preload("/models/airports_around_the_world.glb");

// // // // ─────────────────────────────────────────────
// // // // 2. FAQ SECTION
// // // // ─────────────────────────────────────────────

// // // const FAQ_ITEMS = [
// // //   {
// // //     q: "What LLMs does Tokun support?",
// // //     a: "Tokun supports all major LLMs including GPT-4, GPT-4o, Claude 3 (Sonnet, Opus, Haiku), Gemini Pro/Ultra, Llama 3, Mistral, and more. New models are added within days of their public release.",
// // //   },
// // //   {
// // //     q: "How does the token reduction actually work?",
// // //     a: "SmartGen analyzes your intent and rewrites prompts to be semantically equivalent but structurally more efficient. It removes redundant instructions, consolidates overlapping requirements, and uses model-specific formatting that reduces token consumption without sacrificing output quality.",
// // //   },
// // //   {
// // //     q: "How do I earn money on the marketplace?",
// // //     a: "You list your optimized prompts with a price (one-time or subscription). When other users purchase your prompt, you receive 80% of the revenue. Payouts are processed monthly via Stripe to your bank account or PayPal.",
// // //   },
// // //   {
// // //     q: "Is my prompt data private and secure?",
// // //     a: "Yes. All prompts you create are private by default. We never train our models on your prompts without explicit consent. You choose what to share publicly on the marketplace. We are SOC2 Type II compliant.",
// // //   },
// // //   {
// // //     q: "Can I use the API in production apps?",
// // //     a: "Absolutely. The Tokun API is production-ready with 99.9% SLA uptime. Pro plans include 10,000 API calls/month. Teams plans have no limit. We offer dedicated infrastructure for enterprise customers requiring higher throughput.",
// // //   },
// // //   {
// // //     q: "What makes Tokun different from just using ChatGPT directly?",
// // //     a: "Tokun isn't a chatbot — it's an optimization layer. It takes your raw prompt ideas, refines them for any LLM, tracks performance metrics, and lets you monetize your best work. It works on top of any LLM, not instead of it.",
// // //   },
// // // ];

// // // export function FAQSection() {
// // //   const [openIdx, setOpenIdx] = useState<number | null>(null);
// // //   const toggle = (i: number) => setOpenIdx((prev) => (prev === i ? null : i));

// // //   return (
// // //     <div className="mt-28" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>
// // //       <div className="flex justify-center mb-6">
// // //         <div
// // //           style={{
// // //             display: "inline-block",
// // //             borderRadius: 9999,
// // //             border: "1px solid rgba(255,20,239,0.35)",
// // //             padding: "6px 20px",
// // //           }}
// // //         >
// // //           <span
// // //             style={{
// // //               fontWeight: 500,
// // //               fontSize: 16,
// // //               background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// // //               WebkitBackgroundClip: "text",
// // //               color: "transparent",
// // //             }}
// // //           >
// // //             FAQ
// // //           </span>
// // //         </div>
// // //       </div>

// // //       <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Got questions?</h2>
// // //       <p className="text-white/70 text-lg text-center mb-12">
// // //         Everything you need to know about Tokun.AI
// // //       </p>

// // //       <div style={{ maxWidth: 740, margin: "0 auto", padding: "0 16px" }}>
// // //         {FAQ_ITEMS.map((item, i) => {
// // //           const isOpen = openIdx === i;
// // //           return (
// // //             <div key={i} style={{ borderBottom: "1px solid #1a1a1a", overflow: "hidden" }}>
// // //               <button
// // //                 type="button"
// // //                 onClick={() => toggle(i)}
// // //                 style={{
// // //                   width: "100%",
// // //                   display: "flex",
// // //                   alignItems: "center",
// // //                   justifyContent: "space-between",
// // //                   padding: "20px 0",
// // //                   background: "transparent",
// // //                   border: "none",
// // //                   cursor: "pointer",
// // //                   textAlign: "left",
// // //                   gap: 16,
// // //                 }}
// // //               >
// // //                 <span
// // //                   style={{
// // //                     fontSize: 16,
// // //                     fontWeight: 500,
// // //                     color: isOpen ? "#fff" : "rgba(255,255,255,0.85)",
// // //                     transition: "color 0.2s",
// // //                     lineHeight: 1.4,
// // //                   }}
// // //                 >
// // //                   {item.q}
// // //                 </span>
// // //                 <span
// // //                   style={{
// // //                     flexShrink: 0,
// // //                     width: 28,
// // //                     height: 28,
// // //                     borderRadius: "50%",
// // //                     border: "1px solid rgba(255,255,255,0.2)",
// // //                     display: "flex",
// // //                     alignItems: "center",
// // //                     justifyContent: "center",
// // //                     background: "transparent",
// // //                     transition: "all 0.3s",
// // //                   }}
// // //                 >
// // //                   <ChevronDown
// // //                     size={15}
// // //                     color="#fff"
// // //                     style={{
// // //                       transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
// // //                       transition: "transform 0.3s ease",
// // //                     }}
// // //                   />
// // //                 </span>
// // //               </button>

// // //               <AnimatePresence initial={false}>
// // //                 {isOpen && (
// // //                   <motion.div
// // //                     initial={{ height: 0, opacity: 0 }}
// // //                     animate={{ height: "auto", opacity: 1 }}
// // //                     exit={{ height: 0, opacity: 0 }}
// // //                     transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
// // //                     style={{ overflow: "hidden" }}
// // //                   >
// // //                     <p
// // //                       style={{
// // //                         fontSize: 14,
// // //                         color: "rgba(255,255,255,0.65)",
// // //                         lineHeight: 1.8,
// // //                         paddingBottom: 20,
// // //                         paddingRight: 44,
// // //                       }}
// // //                     >
// // //                       {item.a}
// // //                     </p>
// // //                   </motion.div>
// // //                 )}
// // //               </AnimatePresence>
// // //             </div>
// // //           );
// // //         })}
// // //       </div>
// // //     </div>
// // //   );
// // // }




// // // ============================================================
// // // TOKUN.AI — Globe + FAQ + Ticker Components (FINAL 3D GLOBE WITH ANCHORED REVIEWS)
// // // ============================================================

// // import { Suspense, useEffect, useMemo, useRef, useState } from "react";
// // import { motion, AnimatePresence } from "framer-motion";
// // import { ChevronDown } from "lucide-react";
// // import { Canvas, useFrame } from "@react-three/fiber";
// // import {
// //   OrbitControls,
// //   useGLTF,
// //   Environment,
// //   ContactShadows,
// //   Html,
// // } from "@react-three/drei";
// // import * as THREE from "three";

// // // ─────────────────────────────────────────────
// // // 0. TICKER / MARQUEE SECTION
// // // ─────────────────────────────────────────────

// // const TICKER_ITEMS = [
// //   "SmartGen AI",
// //   "Prompt Optimization",
// //   "Token Reduction",
// //   "Prompt Marketplace",
// //   "LLM Compatible",
// //   "GPT-4 · Claude · Gemini",
// //   "Earn from Prompts",
// //   "AI-Powered Library",
// //   "24/7 Support",
// // ];

// // export function TickerSection() {
// //   const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

// //   return (
// //     <div
// //       style={{
// //         overflow: "hidden",
// //         padding: "20px 0",
// //         borderTop: "1px solid rgba(255,255,255,0.08)",
// //         borderBottom: "1px solid rgba(255,255,255,0.08)",
// //         background: "#0d0d1a",
// //         fontFamily: "Inter, ui-sans-serif, system-ui",
// //         margin: "48px 0",
// //       }}
// //     >
// //       <style>{`
// //         @keyframes tokun-ticker {
// //           from { transform: translateX(0); }
// //           to   { transform: translateX(-50%); }
// //         }
// //         .tokun-ticker-track {
// //           display: flex;
// //           animation: tokun-ticker 25s linear infinite;
// //           white-space: nowrap;
// //           width: max-content;
// //         }
// //         .tokun-ticker-track:hover {
// //           animation-play-state: paused;
// //         }
// //       `}</style>

// //       <div className="tokun-ticker-track">
// //         {items.map((item, i) => (
// //           <div
// //             key={i}
// //             style={{
// //               display: "flex",
// //               alignItems: "center",
// //               gap: 10,
// //               fontSize: 14,
// //               color: "rgba(255,255,255,0.45)",
// //               paddingRight: 48,
// //             }}
// //           >
// //             <span
// //               style={{
// //                 width: 4,
// //                 height: 4,
// //                 borderRadius: "50%",
// //                 background: "linear-gradient(90deg, #FF14EF, #1A73E8)",
// //                 flexShrink: 0,
// //                 display: "inline-block",
// //               }}
// //             />
// //             {item}
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // // ─────────────────────────────────────────────
// // // 1. 3D GLOBE SECTION
// // // ─────────────────────────────────────────────

// // const GLOBE_USERS = [
// //   { lat: 35.6, lon: 139.7, flag: "🇯🇵", name: "Yuki Tanaka", city: "Tokyo, Japan", msg: "I love SmartGen! Saves me hours every day ✨" },
// //   { lat: 51.5, lon: -0.1, flag: "🇬🇧", name: "James Harper", city: "London, UK", msg: "Cut my GPT-4 costs by 58% with Tokun!" },
// //   { lat: 37.7, lon: -122.4, flag: "🇺🇸", name: "Sarah Chen", city: "San Francisco, USA", msg: "Best prompt tool on the market 🔥" },
// //   { lat: 48.8, lon: 2.3, flag: "🇫🇷", name: "Léa Moreau", city: "Paris, France", msg: "Tokun marketplace made me $800 this month! 💰" },
// //   { lat: 28.6, lon: 77.2, flag: "🇮🇳", name: "Arjun Sharma", city: "New Delhi, India", msg: "SmartGen is a total game changer for AI devs!" },
// //   { lat: -23.5, lon: -46.6, flag: "🇧🇷", name: "Lucas Oliveira", city: "São Paulo, Brazil", msg: "Melhor ferramenta de prompts! 🚀" },
// //   { lat: 1.4, lon: 103.8, flag: "🇸🇬", name: "Wei Liang", city: "Singapore", msg: "Our whole team switched to Tokun. No regrets!" },
// //   { lat: 55.7, lon: 37.6, flag: "🇷🇺", name: "Dmitri Volkov", city: "Moscow, Russia", msg: "Token optimization is genuinely impressive 👏" },
// //   { lat: -33.8, lon: 151.2, flag: "🇦🇺", name: "Emma Wilson", city: "Sydney, Australia", msg: "Love the prompt library! Saves so much time ⚡" },
// //   { lat: 52.5, lon: 13.4, flag: "🇩🇪", name: "Klaus Weber", city: "Berlin, Germany", msg: "Tokun API integrates perfectly with our stack!" },
// //   { lat: 19.0, lon: 72.8, flag: "🇮🇳", name: "Priya Nair", city: "Mumbai, India", msg: "SmartGen wrote a better prompt than me 😂❤️" },
// //   { lat: 40.7, lon: -74.0, flag: "🇺🇸", name: "Alex Rivera", city: "New York, USA", msg: "50K prompts on Tokun already? So deserved!" },
// //   { lat: 31.2, lon: 121.5, flag: "🇨🇳", name: "Li Wei", city: "Shanghai, China", msg: "Supports every LLM I use. Perfect tool!" },
// //   { lat: -1.3, lon: 36.8, flag: "🇰🇪", name: "Amara Osei", city: "Nairobi, Kenya", msg: "Tokun is growing our AI startup faster 🌍" },
// //   { lat: 59.3, lon: 18.1, flag: "🇸🇪", name: "Erik Lindqvist", city: "Stockholm, Sweden", msg: "Elegant, fast, support is amazing 🙌" },
// //   { lat: 25.2, lon: 55.3, flag: "🇦🇪", name: "Farah Al-Nasser", city: "Dubai, UAE", msg: "Prompt marketplace is a brilliant idea! 💡" },
// //   { lat: 41.0, lon: 29.0, flag: "🇹🇷", name: "Ceren Yilmaz", city: "Istanbul, Turkey", msg: "Tokun helped me 10x my freelance AI work!" },
// // ];

// // type GlobeUser = typeof GLOBE_USERS[number];

// // function latLonToVector3(lat: number, lon: number, radius: number) {
// //   const phi = (90 - lat) * Math.PI / 180;
// //   const theta = (lon + 180) * Math.PI / 180;

// //   return new THREE.Vector3(
// //     -radius * Math.sin(phi) * Math.cos(theta),
// //     radius * Math.cos(phi),
// //     radius * Math.sin(phi) * Math.sin(theta)
// //   );
// // }

// // function AtmosphereShell() {
// //   const glowRef = useRef<THREE.Mesh>(null);
// //   const outerRef = useRef<THREE.Mesh>(null);

// //   useFrame((state) => {
// //     if (glowRef.current) {
// //       glowRef.current.rotation.y = state.clock.elapsedTime * 0.06;
// //     }
// //     if (outerRef.current) {
// //       outerRef.current.rotation.y = -state.clock.elapsedTime * 0.04;
// //     }
// //   });

// //   return (
// //     <>
// //       <mesh ref={glowRef}>
// //         <sphereGeometry args={[1.82, 64, 64]} />
// //         <meshPhongMaterial
// //           color="#10172f"
// //           transparent
// //           opacity={0.16}
// //           shininess={120}
// //           specular={new THREE.Color("#9cd8ff")}
// //         />
// //       </mesh>

// //       <mesh ref={outerRef}>
// //         <sphereGeometry args={[1.98, 64, 64]} />
// //         <meshBasicMaterial
// //           color="#4c82ff"
// //           transparent
// //           opacity={0.05}
// //           side={THREE.BackSide}
// //         />
// //       </mesh>
// //     </>
// //   );
// // }

// // function GlobeModel() {
// //   const groupRef = useRef<THREE.Group>(null);
// //   const { scene } = useGLTF("/models/airports_around_the_world.glb");
// //   const clonedScene = useMemo(() => scene.clone(true), [scene]);

// //   useEffect(() => {
// //     if (!clonedScene || !groupRef.current) return;

// //     clonedScene.traverse((child: any) => {
// //       if (child.isMesh) {
// //         child.castShadow = true;
// //         child.receiveShadow = true;

// //         const mats = Array.isArray(child.material)
// //           ? child.material
// //           : [child.material];

// //         mats.forEach((mat: any) => {
// //           if (!mat) return;
// //           mat.transparent = false;
// //           mat.depthWrite = true;

// //           if ("roughness" in mat && typeof mat.roughness === "number") {
// //             mat.roughness = Math.min(mat.roughness, 0.82);
// //           }

// //           if ("metalness" in mat && typeof mat.metalness === "number") {
// //             mat.metalness = Math.max(mat.metalness, 0.08);
// //           }
// //         });
// //       }
// //     });

// //     const box = new THREE.Box3().setFromObject(clonedScene);
// //     const size = new THREE.Vector3();
// //     const center = new THREE.Vector3();

// //     box.getSize(size);
// //     box.getCenter(center);

// //     clonedScene.position.set(-center.x, -center.y, -center.z);

// //     // Slightly smaller than previous version
// //     const maxAxis = Math.max(size.x, size.y, size.z) || 1;
// //     const targetMaxAxis = 2.55;
// //     const fitScale = targetMaxAxis / maxAxis;

// //     groupRef.current.scale.setScalar(fitScale);
// //     groupRef.current.position.set(0, -0.08, 0);
// //   }, [clonedScene]);

// //   return (
// //     <group ref={groupRef}>
// //       <primitive object={clonedScene} />
// //     </group>
// //   );
// // }

// // // function GlobeAnchoredReview({ user }: { user: GlobeUser }) {
// // //   const markerRef = useRef<THREE.Group>(null);
// // //   const pulseRef = useRef<THREE.Mesh>(null);

// // //   const anchorPosition = useMemo(() => {
// // //     return latLonToVector3(user.lat, user.lon, 1.34);
// // //   }, [user]);

// // //   useFrame((state) => {
// // //     if (pulseRef.current) {
// // //       const s = 1 + Math.sin(state.clock.elapsedTime * 3.2) * 0.18;
// // //       pulseRef.current.scale.setScalar(s);
// // //     }
// // //   });

// // //   return (
// // //     <group ref={markerRef} position={anchorPosition}>
// // //       {/* glowing dot */}
// // //       <mesh>
// // //         <sphereGeometry args={[0.03, 20, 20]} />
// // //         <meshBasicMaterial color="#ffffff" />
// // //       </mesh>

// // //       <mesh ref={pulseRef}>
// // //         <sphereGeometry args={[0.055, 20, 20]} />
// // //         <meshBasicMaterial color="#FF14EF" transparent opacity={0.35} />
// // //       </mesh>

// // //       <Html
// // //         position={[0, 0, 0]}
// // //         transform={false}
// // //         zIndexRange={[50, 0]}
// // //         style={{ pointerEvents: "none" }}
// // //       >
// // //         <div
// // //           style={{
// // //             position: "relative",
// // //             transform: "translate(-50%, calc(-100% - 40px))",
// // //             width: "215px",
// // //           }}
// // //         >
// // //           <motion.div
// // //             key={user.name}
// // //             initial={{ opacity: 0, y: 8, scale: 0.96 }}
// // //             animate={{ opacity: 1, y: 0, scale: 1 }}
// // //             exit={{ opacity: 0, y: -8, scale: 0.96 }}
// // //             transition={{ duration: 0.35 }}
// // //             style={{
// // //               background: "rgba(23,23,26,0.94)",
// // //               border: "1px solid rgba(255,20,239,0.26)",
// // //               borderRadius: 14,
// // //               padding: "10px 12px",
// // //               boxShadow:
// // //                 "0 0 24px rgba(255,20,239,0.12), 0 8px 24px rgba(0,0,0,0.42)",
// // //               backdropFilter: "blur(8px)",
// // //               color: "white",
// // //               textAlign: "left",
// // //             }}
// // //           >
// // //             <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
// // //               <span style={{ fontSize: 15 }}>{user.flag}</span>
// // //               <div style={{ minWidth: 0 }}>
// // //                 <div
// // //                   style={{
// // //                     fontSize: 11,
// // //                     fontWeight: 600,
// // //                     color: "#fff",
// // //                     whiteSpace: "nowrap",
// // //                     overflow: "hidden",
// // //                     textOverflow: "ellipsis",
// // //                   }}
// // //                 >
// // //                   {user.name}
// // //                 </div>
// // //                 <div
// // //                   style={{
// // //                     fontSize: 9,
// // //                     color: "rgba(255,255,255,0.55)",
// // //                     whiteSpace: "nowrap",
// // //                     overflow: "hidden",
// // //                     textOverflow: "ellipsis",
// // //                   }}
// // //                 >
// // //                   {user.city}
// // //                 </div>
// // //               </div>
// // //             </div>

// // //             <p
// // //               style={{
// // //                 fontSize: 10,
// // //                 lineHeight: 1.55,
// // //                 color: "rgba(255,255,255,0.76)",
// // //                 margin: 0,
// // //               }}
// // //             >
// // //               "{user.msg}"
// // //             </p>
// // //           </motion.div>

// // //           {/* dotted connector line */}
// // //           <div
// // //             style={{
// // //               position: "absolute",
// // //               left: "50%",
// // //               top: "100%",
// // //               transform: "translateX(-50%)",
// // //               width: 2,
// // //               height: 32,
// // //               background:
// // //                 "repeating-linear-gradient(to bottom, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)",
// // //               filter: "drop-shadow(0 0 8px rgba(255,20,239,0.45))",
// // //             }}
// // //           />
// // //         </div>
// // //       </Html>
// // //     </group>
// // //   );
// // // }



// // function GlobeAnchoredReview({ user }: { user: GlobeUser }) {
// //   const markerRef = useRef<THREE.Group>(null);
// //   const pulseRef = useRef<THREE.Mesh>(null);

// //   const isMobile =
// //     typeof window !== "undefined" ? window.innerWidth <= 640 : false;

// //   const cardWidth = isMobile ? 150 : 215;
// //   const connectorHeight = isMobile ? 22 : 32;
// //   const offsetY = isMobile ? 26 : 40;

// //   const anchorPosition = useMemo(() => {
// //     return latLonToVector3(user.lat, user.lon, 1.34);
// //   }, [user]);

// //   useFrame((state) => {
// //     if (pulseRef.current) {
// //       const s = 1 + Math.sin(state.clock.elapsedTime * 3.2) * 0.18;
// //       pulseRef.current.scale.setScalar(s);
// //     }
// //   });

// //   return (
// //     <group ref={markerRef} position={anchorPosition}>
// //       <mesh>
// //         <sphereGeometry args={[0.03, 20, 20]} />
// //         <meshBasicMaterial color="#ffffff" />
// //       </mesh>

// //       <mesh ref={pulseRef}>
// //         <sphereGeometry args={[0.055, 20, 20]} />
// //         <meshBasicMaterial color="#FF14EF" transparent opacity={0.35} />
// //       </mesh>

// //       <Html
// //         position={[0, 0, 0]}
// //         transform={false}
// //         zIndexRange={[50, 0]}
// //         style={{ pointerEvents: "none" }}
// //       >
// //         <div
// //           style={{
// //             position: "relative",
// //             transform: `translate(-50%, calc(-100% - ${offsetY}px))`,
// //             width: cardWidth,
// //             maxWidth: "calc(100vw - 24px)",
// //           }}
// //         >
// //           <motion.div
// //             key={user.name}
// //             initial={{ opacity: 0, y: 8, scale: 0.96 }}
// //             animate={{ opacity: 1, y: 0, scale: 1 }}
// //             exit={{ opacity: 0, y: -8, scale: 0.96 }}
// //             transition={{ duration: 0.35 }}
// //             style={{
// //               background: "rgba(23,23,26,0.94)",
// //               border: "1px solid rgba(255,20,239,0.26)",
// //               borderRadius: isMobile ? 12 : 14,
// //               padding: isMobile ? "8px 10px" : "10px 12px",
// //               boxShadow:
// //                 "0 0 24px rgba(255,20,239,0.12), 0 8px 24px rgba(0,0,0,0.42)",
// //               backdropFilter: "blur(8px)",
// //               color: "white",
// //               textAlign: "left",
// //             }}
// //           >
// //             <div
// //               style={{
// //                 display: "flex",
// //                 alignItems: "center",
// //                 gap: isMobile ? 6 : 8,
// //                 marginBottom: isMobile ? 4 : 6,
// //               }}
// //             >
// //               <span style={{ fontSize: isMobile ? 13 : 15 }}>{user.flag}</span>
// //               <div style={{ minWidth: 0 }}>
// //                 <div
// //                   style={{
// //                     fontSize: isMobile ? 10 : 11,
// //                     fontWeight: 600,
// //                     color: "#fff",
// //                     whiteSpace: "nowrap",
// //                     overflow: "hidden",
// //                     textOverflow: "ellipsis",
// //                   }}
// //                 >
// //                   {user.name}
// //                 </div>
// //                 <div
// //                   style={{
// //                     fontSize: isMobile ? 8 : 9,
// //                     color: "rgba(255,255,255,0.55)",
// //                     whiteSpace: "nowrap",
// //                     overflow: "hidden",
// //                     textOverflow: "ellipsis",
// //                   }}
// //                 >
// //                   {user.city}
// //                 </div>
// //               </div>
// //             </div>

// //             <p
// //               style={{
// //                 fontSize: isMobile ? 9 : 10,
// //                 lineHeight: isMobile ? 1.4 : 1.55,
// //                 color: "rgba(255,255,255,0.76)",
// //                 margin: 0,
// //               }}
// //             >
// //               "{user.msg}"
// //             </p>
// //           </motion.div>

// //           <div
// //             style={{
// //               position: "absolute",
// //               left: "50%",
// //               top: "100%",
// //               transform: "translateX(-50%)",
// //               width: 2,
// //               height: connectorHeight,
// //               background:
// //                 "repeating-linear-gradient(to bottom, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)",
// //               filter: "drop-shadow(0 0 8px rgba(255,20,239,0.45))",
// //             }}
// //           />
// //         </div>
// //       </Html>
// //     </group>
// //   );
// // }

// // function GlobeRig({ activeUser }: { activeUser: GlobeUser | null }) {
// //   const globeRef = useRef<THREE.Group>(null);
// //   const targetYRef = useRef(0.45);
// //   const baseSpinRef = useRef(0.0032); // old-style continuous spin

// //   useEffect(() => {
// //     if (!activeUser) return;

// //     const v = latLonToVector3(activeUser.lat, activeUser.lon, 1);
// //     targetYRef.current = -Math.atan2(v.x, v.z);
// //   }, [activeUser]);

// //   useFrame((state, delta) => {
// //     if (!globeRef.current) return;

// //     const currentY = globeRef.current.rotation.y;
// //     const targetY = targetYRef.current;

// //     let diff = targetY - currentY;
// //     while (diff > Math.PI) diff -= Math.PI * 2;
// //     while (diff < -Math.PI) diff += Math.PI * 2;

// //     // Always keep rotating like before
// //     const autoSpin = baseSpinRef.current;

// //     // Slight steering toward the active coordinate, but never fully stop
// //     const steer = diff * Math.min(0.035, delta * 1.9);

// //     globeRef.current.rotation.y += autoSpin + steer;

// //     // keep that old 3D tilt motion
// //     globeRef.current.rotation.x =
// //       0.24 + Math.sin(state.clock.elapsedTime * 0.7) * 0.02;
// //     globeRef.current.rotation.z =
// //       -0.05 + Math.sin(state.clock.elapsedTime * 0.45) * 0.01;
// //   });

// //   return (
// //     <group ref={globeRef}>
// //       <GlobeModel />
// //       {activeUser ? <GlobeAnchoredReview user={activeUser} /> : null}
// //     </group>
// //   );
// // }

// // function GlobeScene({ activeUser }: { activeUser: GlobeUser | null }) {
// //   return (
// //     <>
// //       <fog attach="fog" args={["#030406", 5.8, 10.5]} />

// //       <ambientLight intensity={0.8} />
// //       <hemisphereLight args={["#cfe8ff", "#0a0d17", 0.72]} />
// //       <directionalLight position={[5, 4, 6]} intensity={2.0} />
// //       <directionalLight position={[-3, -2, -4]} intensity={0.85} color="#1A73E8" />
// //       <pointLight position={[2, 1, 4]} intensity={1.15} color="#FF14EF" />
// //       <spotLight
// //         position={[0, 6, 6]}
// //         angle={0.45}
// //         penumbra={1}
// //         intensity={1.35}
// //         color="#ffffff"
// //       />

// //       <Environment preset="city" />

// //       <AtmosphereShell />
// //       <GlobeRig activeUser={activeUser} />

// //       <ContactShadows
// //         position={[0, -1.95, 0]}
// //         opacity={0.28}
// //         scale={5.2}
// //         blur={2.5}
// //         far={5.2}
// //         color="#000000"
// //       />

// //       <OrbitControls
// //         enableZoom={false}
// //         enablePan={false}
// //         autoRotate={false}
// //         minPolarAngle={Math.PI / 2.18}
// //         maxPolarAngle={Math.PI / 1.84}
// //       />
// //     </>
// //   );
// // }

// // function GlobeFallback() {
// //   return (
// //     <div
// //       className="w-full aspect-square rounded-full"
// //       style={{
// //         background:
// //           "radial-gradient(circle at 50% 50%, rgba(255,20,239,0.18) 0%, rgba(26,115,232,0.14) 35%, rgba(3,4,6,1) 72%)",
// //         border: "1px solid rgba(255,255,255,0.08)",
// //       }}
// //     />
// //   );
// // }

// // export function GlobeSection() {
// //   const [activeUser, setActiveUser] = useState<GlobeUser | null>(null);
// //   const [userIndex, setUserIndex] = useState(0);

// //   useEffect(() => {
// //     setActiveUser(GLOBE_USERS[0]);

// //     const interval = setInterval(() => {
// //       setUserIndex((prev) => {
// //         const next = (prev + 1) % GLOBE_USERS.length;
// //         setActiveUser(GLOBE_USERS[next]);
// //         return next;
// //       });
// //     }, 3500);

// //     return () => clearInterval(interval);
// //   }, []);

// //   return (
// //     <div
// //       className="mt-24 text-center px-4"
// //       style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
// //     >
// //       <div className="flex justify-center mb-6">
// //         <div
// //           style={{
// //             display: "inline-block",
// //             borderRadius: 9999,
// //             border: "1px solid rgba(255,20,239,0.35)",
// //             padding: "6px 20px",
// //           }}
// //         >
// //           <span
// //             style={{
// //               fontWeight: 500,
// //               fontSize: 16,
// //               background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //               WebkitBackgroundClip: "text",
// //               color: "transparent",
// //             }}
// //           >
// //             GLOBAL COMMUNITY
// //           </span>
// //         </div>
// //       </div>

// //       <h2 className="text-4xl md:text-5xl font-bold mb-4">
// //         Loved across the globe
// //       </h2>

// //       <p className="text-white/70 text-lg mb-6 max-w-xl mx-auto">
// //         Thousands of prompt engineers from every corner of the world trust Tokun.AI daily.
// //       </p>

// //       <div className="relative mx-auto w-full max-w-[710px]">
// //         <div
// //           className="absolute inset-0 blur-[105px] opacity-65"
// //           style={{
// //             background:
// //               "radial-gradient(circle at center, rgba(255,20,239,0.28) 0%, rgba(26,115,232,0.22) 50%, transparent 78%)",
// //           }}
// //         />

// //         <div className="relative w-full aspect-square">
// //           <div
// //             className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[82%] h-[82%] rounded-full"
// //             style={{
// //               background:
// //                 "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.10) 0%, rgba(255,20,239,0.10) 22%, rgba(26,115,232,0.08) 46%, rgba(0,0,0,0) 72%)",
// //               filter: "blur(26px)",
// //             }}
// //           />

// //           <div
// //             className="absolute left-1/2 bottom-[10%] -translate-x-1/2 w-[42%] h-[9%] rounded-full"
// //             style={{
// //               background: "rgba(0,0,0,0.42)",
// //               filter: "blur(18px)",
// //             }}
// //           />

// //           <Suspense fallback={<GlobeFallback />}>
// //             <Canvas
// //               camera={{ position: [0, 0.22, 5.55], fov: 31 }}
// //               dpr={[1, 2]}
// //               style={{ background: "transparent" }}
// //             >
// //               <GlobeScene activeUser={activeUser} />
// //             </Canvas>
// //           </Suspense>
// //         </div>
// //       </div>

// //       <div
// //         style={{
// //           display: "flex",
// //           gap: 48,
// //           justifyContent: "center",
// //           flexWrap: "wrap",
// //           marginTop: 8,
// //         }}
// //       >
// //         {[["120+", "Countries"], ["10K+", "Active Users"], ["50K+", "Prompts Created"]].map(
// //           ([num, label]) => (
// //             <div key={label} style={{ textAlign: "center" }}>
// //               <div
// //                 style={{
// //                   fontSize: 28,
// //                   fontWeight: 700,
// //                   background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //                   WebkitBackgroundClip: "text",
// //                   color: "transparent",
// //                 }}
// //               >
// //                 {num}
// //               </div>
// //               <div style={{ fontSize: 13, color: "#8884aa", marginTop: 4 }}>
// //                 {label}
// //               </div>
// //             </div>
// //           )
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // useGLTF.preload("/models/airports_around_the_world.glb");

// // // ─────────────────────────────────────────────
// // // 2. FAQ SECTION
// // // ─────────────────────────────────────────────

// // const FAQ_ITEMS = [
// //   {
// //     q: "What LLMs does Tokun support?",
// //     a: "Tokun supports all major LLMs including GPT-4, GPT-4o, Claude 3 (Sonnet, Opus, Haiku), Gemini Pro/Ultra, Llama 3, Mistral, and more. New models are added within days of their public release.",
// //   },
// //   {
// //     q: "How does the token reduction actually work?",
// //     a: "SmartGen analyzes your intent and rewrites prompts to be semantically equivalent but structurally more efficient. It removes redundant instructions, consolidates overlapping requirements, and uses model-specific formatting that reduces token consumption without sacrificing output quality.",
// //   },
// //   {
// //     q: "How do I earn money on the marketplace?",
// //     a: "You list your optimized prompts with a price (one-time or subscription). When other users purchase your prompt, you receive 80% of the revenue. Payouts are processed monthly via Stripe to your bank account or PayPal.",
// //   },
// //   {
// //     q: "Is my prompt data private and secure?",
// //     a: "Yes. All prompts you create are private by default. We never train our models on your prompts without explicit consent. You choose what to share publicly on the marketplace. We are SOC2 Type II compliant.",
// //   },
// //   {
// //     q: "Can I use the API in production apps?",
// //     a: "Absolutely. The Tokun API is production-ready with 99.9% SLA uptime. Pro plans include 10,000 API calls/month. Teams plans have no limit. We offer dedicated infrastructure for enterprise customers requiring higher throughput.",
// //   },
// //   {
// //     q: "What makes Tokun different from just using ChatGPT directly?",
// //     a: "Tokun isn't a chatbot — it's an optimization layer. It takes your raw prompt ideas, refines them for any LLM, tracks performance metrics, and lets you monetize your best work. It works on top of any LLM, not instead of it.",
// //   },
// // ];

// // export function FAQSection() {
// //   const [openIdx, setOpenIdx] = useState<number | null>(null);
// //   const toggle = (i: number) => setOpenIdx((prev) => (prev === i ? null : i));

// //   return (
// //     <div className="mt-28" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>
// //       <div className="flex justify-center mb-6">
// //         <div
// //           style={{
// //             display: "inline-block",
// //             borderRadius: 9999,
// //             border: "1px solid rgba(255,20,239,0.35)",
// //             padding: "6px 20px",
// //           }}
// //         >
// //           <span
// //             style={{
// //               fontWeight: 500,
// //               fontSize: 16,
// //               background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //               WebkitBackgroundClip: "text",
// //               color: "transparent",
// //             }}
// //           >
// //             FAQ
// //           </span>
// //         </div>
// //       </div>

// //       <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Got questions?</h2>
// //       <p className="text-white/70 text-lg text-center mb-12">
// //         Everything you need to know about Tokun.AI
// //       </p>

// //       <div style={{ maxWidth: 740, margin: "0 auto", padding: "0 16px" }}>
// //         {FAQ_ITEMS.map((item, i) => {
// //           const isOpen = openIdx === i;
// //           return (
// //             <div key={i} style={{ borderBottom: "1px solid #1a1a1a", overflow: "hidden" }}>
// //               <button
// //                 type="button"
// //                 onClick={() => toggle(i)}
// //                 style={{
// //                   width: "100%",
// //                   display: "flex",
// //                   alignItems: "center",
// //                   justifyContent: "space-between",
// //                   padding: "20px 0",
// //                   background: "transparent",
// //                   border: "none",
// //                   cursor: "pointer",
// //                   textAlign: "left",
// //                   gap: 16,
// //                 }}
// //               >
// //                 <span
// //                   style={{
// //                     fontSize: 16,
// //                     fontWeight: 500,
// //                     color: isOpen ? "#fff" : "rgba(255,255,255,0.85)",
// //                     transition: "color 0.2s",
// //                     lineHeight: 1.4,
// //                   }}
// //                 >
// //                   {item.q}
// //                 </span>
// //                 <span
// //                   style={{
// //                     flexShrink: 0,
// //                     width: 28,
// //                     height: 28,
// //                     borderRadius: "50%",
// //                     border: "1px solid rgba(255,255,255,0.2)",
// //                     display: "flex",
// //                     alignItems: "center",
// //                     justifyContent: "center",
// //                     background: "transparent",
// //                     transition: "all 0.3s",
// //                   }}
// //                 >
// //                   <ChevronDown
// //                     size={15}
// //                     color="#fff"
// //                     style={{
// //                       transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
// //                       transition: "transform 0.3s ease",
// //                     }}
// //                   />
// //                 </span>
// //               </button>

// //               <AnimatePresence initial={false}>
// //                 {isOpen && (
// //                   <motion.div
// //                     initial={{ height: 0, opacity: 0 }}
// //                     animate={{ height: "auto", opacity: 1 }}
// //                     exit={{ height: 0, opacity: 0 }}
// //                     transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
// //                     style={{ overflow: "hidden" }}
// //                   >
// //                     <p
// //                       style={{
// //                         fontSize: 14,
// //                         color: "rgba(255,255,255,0.65)",
// //                         lineHeight: 1.8,
// //                         paddingBottom: 20,
// //                         paddingRight: 44,
// //                       }}
// //                     >
// //                       {item.a}
// //                     </p>
// //                   </motion.div>
// //                 )}
// //               </AnimatePresence>
// //             </div>
// //           );
// //         })}
// //       </div>
// //     </div>
// //   );
// // }





// // ============================================================
// // TOKUN.AI — Globe + FAQ + Ticker Components (FINAL CORRECTED)
// // ============================================================

// import { Suspense, useEffect, useMemo, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ChevronDown } from "lucide-react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import {
//   OrbitControls,
//   useGLTF,
//   Environment,
//   ContactShadows,
// } from "@react-three/drei";
// import * as THREE from "three";

// // ─────────────────────────────────────────────
// // 0. TICKER / MARQUEE SECTION
// // ─────────────────────────────────────────────

// const TICKER_ITEMS = [
//   "SmartGen AI",
//   "Prompt Optimization",
//   "Token Reduction",
//   "Prompt Marketplace",
//   "LLM Compatible",
//   "GPT-4 · Claude · Gemini",
//   "Earn from Prompts",
//   "AI-Powered Library",
//   "24/7 Support",
// ];

// export function TickerSection() {
//   const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

//   return (
//     <div
//       style={{
//         overflow: "hidden",
//         padding: "20px 0",
//         borderTop: "1px solid rgba(255,255,255,0.08)",
//         borderBottom: "1px solid rgba(255,255,255,0.08)",
//         background: "#0d0d1a",
//         fontFamily: "Inter, ui-sans-serif, system-ui",
//         margin: "48px 0",
//       }}
//     >
//       <style>{`
//         @keyframes tokun-ticker {
//           from { transform: translateX(0); }
//           to   { transform: translateX(-50%); }
//         }
//         .tokun-ticker-track {
//           display: flex;
//           animation: tokun-ticker 25s linear infinite;
//           white-space: nowrap;
//           width: max-content;
//         }
//         .tokun-ticker-track:hover {
//           animation-play-state: paused;
//         }
//       `}</style>

//       <div className="tokun-ticker-track">
//         {items.map((item, i) => (
//           <div
//             key={i}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 10,
//               fontSize: 14,
//               color: "rgba(255,255,255,0.45)",
//               paddingRight: 48,
//             }}
//           >
//             <span
//               style={{
//                 width: 4,
//                 height: 4,
//                 borderRadius: "50%",
//                 background: "linear-gradient(90deg, #FF14EF, #1A73E8)",
//                 flexShrink: 0,
//                 display: "inline-block",
//               }}
//             />
//             {item}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// // 1. 3D GLOBE SECTION
// // ─────────────────────────────────────────────

// const GLOBE_USERS = [
//   { lat: 35.6, lon: 139.7, flag: "🇯🇵", name: "Yuki Tanaka", city: "Tokyo, Japan", msg: "I love SmartGen! Saves me hours every day ✨" },
//   { lat: 51.5, lon: -0.1, flag: "🇬🇧", name: "James Harper", city: "London, UK", msg: "Cut my GPT-4 costs by 58% with Tokun!" },
//   { lat: 37.7, lon: -122.4, flag: "🇺🇸", name: "Sarah Chen", city: "San Francisco, USA", msg: "Best prompt tool on the market 🔥" },
//   { lat: 48.8, lon: 2.3, flag: "🇫🇷", name: "Léa Moreau", city: "Paris, France", msg: "Tokun marketplace made me $800 this month! 💰" },
//   { lat: 28.6, lon: 77.2, flag: "🇮🇳", name: "Arjun Sharma", city: "New Delhi, India", msg: "SmartGen is a total game changer for AI devs!" },
//   { lat: -23.5, lon: -46.6, flag: "🇧🇷", name: "Lucas Oliveira", city: "São Paulo, Brazil", msg: "Melhor ferramenta de prompts! 🚀" },
//   { lat: 1.4, lon: 103.8, flag: "🇸🇬", name: "Wei Liang", city: "Singapore", msg: "Our whole team switched to Tokun. No regrets!" },
//   { lat: 55.7, lon: 37.6, flag: "🇷🇺", name: "Dmitri Volkov", city: "Moscow, Russia", msg: "Token optimization is genuinely impressive 👏" },
//   { lat: -33.8, lon: 151.2, flag: "🇦🇺", name: "Emma Wilson", city: "Sydney, Australia", msg: "Love the prompt library! Saves so much time ⚡" },
//   { lat: 52.5, lon: 13.4, flag: "🇩🇪", name: "Klaus Weber", city: "Berlin, Germany", msg: "Tokun API integrates perfectly with our stack!" },
//   { lat: 19.0, lon: 72.8, flag: "🇮🇳", name: "Priya Nair", city: "Mumbai, India", msg: "SmartGen wrote a better prompt than me 😂❤️" },
//   { lat: 40.7, lon: -74.0, flag: "🇺🇸", name: "Alex Rivera", city: "New York, USA", msg: "50K prompts on Tokun already? So deserved!" },
//   { lat: 31.2, lon: 121.5, flag: "🇨🇳", name: "Li Wei", city: "Shanghai, China", msg: "Supports every LLM I use. Perfect tool!" },
//   { lat: -1.3, lon: 36.8, flag: "🇰🇪", name: "Amara Osei", city: "Nairobi, Kenya", msg: "Tokun is growing our AI startup faster 🌍" },
//   { lat: 59.3, lon: 18.1, flag: "🇸🇪", name: "Erik Lindqvist", city: "Stockholm, Sweden", msg: "Elegant, fast, support is amazing 🙌" },
//   { lat: 25.2, lon: 55.3, flag: "🇦🇪", name: "Farah Al-Nasser", city: "Dubai, UAE", msg: "Prompt marketplace is a brilliant idea! 💡" },
//   { lat: 41.0, lon: 29.0, flag: "🇹🇷", name: "Ceren Yilmaz", city: "Istanbul, Turkey", msg: "Tokun helped me 10x my freelance AI work!" },
// ];

// type GlobeUser = typeof GLOBE_USERS[number];

// const REVIEW_POSITIONS_DESKTOP = [
//   { left: "23%", top: "22%", lineTo: "bottom" as const },
//   { left: "73%", top: "20%", lineTo: "bottom" as const },
//   { left: "83%", top: "49%", lineTo: "left" as const },
//   { left: "61%", top: "78%", lineTo: "top" as const },
//   { left: "28%", top: "76%", lineTo: "top" as const },
//   { left: "11%", top: "49%", lineTo: "right" as const },
// ];

// const REVIEW_POSITIONS_MOBILE = [
//   { left: "50%", top: "12%", lineTo: "bottom" as const },
//   { left: "78%", top: "31%", lineTo: "left" as const },
//   { left: "78%", top: "64%", lineTo: "left" as const },
//   { left: "50%", top: "86%", lineTo: "top" as const },
//   { left: "22%", top: "64%", lineTo: "right" as const },
//   { left: "22%", top: "31%", lineTo: "right" as const },
// ];

// function AtmosphereShell() {
//   const glowRef = useRef<THREE.Mesh>(null);
//   const outerRef = useRef<THREE.Mesh>(null);

//   useFrame((state) => {
//     if (glowRef.current) {
//       glowRef.current.rotation.y = state.clock.elapsedTime * 0.06;
//     }
//     if (outerRef.current) {
//       outerRef.current.rotation.y = -state.clock.elapsedTime * 0.04;
//     }
//   });

//   return (
//     <>
//       <mesh ref={glowRef}>
//         <sphereGeometry args={[1.82, 64, 64]} />
//         <meshPhongMaterial
//           color="#10172f"
//           transparent
//           opacity={0.16}
//           shininess={120}
//           specular={new THREE.Color("#9cd8ff")}
//         />
//       </mesh>

//       <mesh ref={outerRef}>
//         <sphereGeometry args={[1.98, 64, 64]} />
//         <meshBasicMaterial
//           color="#4c82ff"
//           transparent
//           opacity={0.05}
//           side={THREE.BackSide}
//         />
//       </mesh>
//     </>
//   );
// }

// function GlobeModel() {
//   const groupRef = useRef<THREE.Group>(null);
//   const { scene } = useGLTF("/models/airports_around_the_world.glb");
//   const clonedScene = useMemo(() => scene.clone(true), [scene]);

//   useEffect(() => {
//     if (!clonedScene || !groupRef.current) return;

//     clonedScene.traverse((child: any) => {
//       if (child.isMesh) {
//         child.castShadow = true;
//         child.receiveShadow = true;

//         const mats = Array.isArray(child.material)
//           ? child.material
//           : [child.material];

//         mats.forEach((mat: any) => {
//           if (!mat) return;
//           mat.transparent = false;
//           mat.depthWrite = true;

//           if ("roughness" in mat && typeof mat.roughness === "number") {
//             mat.roughness = Math.min(mat.roughness, 0.82);
//           }

//           if ("metalness" in mat && typeof mat.metalness === "number") {
//             mat.metalness = Math.max(mat.metalness, 0.08);
//           }
//         });
//       }
//     });

//     const box = new THREE.Box3().setFromObject(clonedScene);
//     const size = new THREE.Vector3();
//     const center = new THREE.Vector3();

//     box.getSize(size);
//     box.getCenter(center);

//     clonedScene.position.set(-center.x, -center.y, -center.z);

//     const maxAxis = Math.max(size.x, size.y, size.z) || 1;
//     const targetMaxAxis = 2.45;
//     const fitScale = targetMaxAxis / maxAxis;

//     groupRef.current.scale.setScalar(fitScale);
//     groupRef.current.position.set(0, -0.08, 0);
//   }, [clonedScene]);

//   return (
//     <group ref={groupRef}>
//       <primitive object={clonedScene} />
//     </group>
//   );
// }

// function GlobeRig() {
//   const globeRef = useRef<THREE.Group>(null);

//   useFrame((state) => {
//     if (!globeRef.current) return;

//     globeRef.current.rotation.y += 0.0034;
//     globeRef.current.rotation.x =
//       0.24 + Math.sin(state.clock.elapsedTime * 0.7) * 0.02;
//     globeRef.current.rotation.z =
//       -0.05 + Math.sin(state.clock.elapsedTime * 0.45) * 0.01;
//   });

//   return (
//     <group ref={globeRef} rotation={[0.24, 0.45, -0.05]}>
//       <GlobeModel />
//     </group>
//   );
// }

// function GlobeScene() {
//   return (
//     <>
//       <fog attach="fog" args={["#030406", 5.8, 10.5]} />

//       <ambientLight intensity={0.8} />
//       <hemisphereLight args={["#cfe8ff", "#0a0d17", 0.72]} />
//       <directionalLight position={[5, 4, 6]} intensity={2.0} />
//       <directionalLight position={[-3, -2, -4]} intensity={0.85} color="#1A73E8" />
//       <pointLight position={[2, 1, 4]} intensity={1.15} color="#FF14EF" />
//       <spotLight
//         position={[0, 6, 6]}
//         angle={0.45}
//         penumbra={1}
//         intensity={1.35}
//         color="#ffffff"
//       />

//       <Environment preset="city" />
//       <AtmosphereShell />
//       <GlobeRig />

//       <ContactShadows
//         position={[0, -1.95, 0]}
//         opacity={0.28}
//         scale={5.2}
//         blur={2.5}
//         far={5.2}
//         color="#000000"
//       />

//       <OrbitControls
//         enableZoom={false}
//         enablePan={false}
//         autoRotate={false}
//         minPolarAngle={Math.PI / 2.18}
//         maxPolarAngle={Math.PI / 1.84}
//       />
//     </>
//   );
// }

// function GlobeFallback() {
//   return (
//     <div
//       className="w-full aspect-square"
//       style={{
//         background:
//           "radial-gradient(circle at 50% 50%, rgba(255,20,239,0.18) 0%, rgba(26,115,232,0.14) 35%, rgba(3,4,6,1) 72%)",
//       }}
//     />
//   );
// }

// function ReviewCard({
//   user,
//   pos,
//   cardKey,
//   isMobile,
// }: {
//   user: GlobeUser;
//   pos: { left: string; top: string; lineTo: "bottom" | "top" | "left" | "right" };
//   cardKey: string;
//   isMobile: boolean;
// }) {
//   const cardWidth = isMobile ? 110 : 215;   // 142 → 110
// const titleFont = isMobile ? 8  : 11;     // 9 → 8
// const subFont   = isMobile ? 6  : 9;      // 7 → 6
// const msgFont   = isMobile ? 7  : 10;     // 8 → 7
// // const lineLen   = isMobile ? 14 : 34;     // 22 → 14
// const lineLen = isMobile ? 30 : 50;  
// const gap       = isMobile ? 4  : 8;      // 5 → 4

//   return (
//     <motion.div
//       key={cardKey}
//       initial={{ opacity: 0, scale: 0.94, y: 8 }}
//       animate={{ opacity: 1, scale: 1, y: 0 }}
//       exit={{ opacity: 0, scale: 0.94, y: -8 }}
//       transition={{ duration: 0.35 }}
//       style={{
//         position: "absolute",
//         left: pos.left,
//         top: pos.top,
//         transform: "translate(-50%, -50%)",
//         width: cardWidth,
//         zIndex: 20,
//         pointerEvents: "none",
//       }}
//     >
//       <div
//         style={{
//           position: "relative",
//           background: "rgba(23,23,26,0.94)",
//           border: "1px solid rgba(255,20,239,0.26)",
//           borderRadius: isMobile ? 8 : 14,

//           padding: isMobile ? "5px 6px" : "10px 12px",
//           boxShadow:
//             "0 0 24px rgba(255,20,239,0.12), 0 8px 24px rgba(0,0,0,0.42)",
//           backdropFilter: "blur(8px)",
//           color: "white",
//           textAlign: "left",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap,
//             marginBottom: isMobile ? 4 : 6,
//           }}
//         >
//           <span style={{ fontSize: isMobile ? 12 : 15 }}>{user.flag}</span>
//           <div style={{ minWidth: 0 }}>
//             <div
//               style={{
//                 fontSize: titleFont,
//                 fontWeight: 600,
//                 color: "#fff",
//                 whiteSpace: "nowrap",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//               }}
//             >
//               {user.name}
//             </div>
//             <div
//               style={{
//                 fontSize: subFont,
//                 color: "rgba(255,255,255,0.55)",
//                 whiteSpace: "nowrap",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//               }}
//             >
//               {user.city}
//             </div>
//           </div>
//         </div>

//         <p
//           style={{
//             fontSize: msgFont,
//             lineHeight: isMobile ? 1.35 : 1.55,
//             color: "rgba(255,255,255,0.76)",
//             margin: 0,
//           }}
//         >
//           "{user.msg}"
//         </p>

//        {pos.lineTo === "bottom" && (
//   <>
//     <div style={{
//       position: "absolute",
//       left: "50%",
//       top: "100%",
//       transform: "translateX(-50%)",
//       width: 2,
//       height: lineLen,
//       background: "repeating-linear-gradient(to bottom, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)",
//     }} />
//     {/* horizontal line globe edge tak */}
//     <div style={{
//       position: "absolute",
//       left: "50%",
//       top: `calc(100% + ${lineLen}px)`,
//       width: isMobile ? 40 : 60,
//       height: 2,
//       background: "repeating-linear-gradient(to right, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)",
//     }} />
//     <div style={{
//       position: "absolute",
//       left: `calc(50% + ${isMobile ? 40 : 60}px)`,
//       top: `calc(100% + ${lineLen - 4}px)`,
//       width: 7, height: 7,
//       borderRadius: "9999px",
//       background: "#FF14EF",
//       boxShadow: "0 0 10px rgba(255,20,239,0.7)",
//     }} />
//   </>
// )}

// {pos.lineTo === "top" && (
//   <>
//     <div style={{
//       position: "absolute",
//       left: "50%",
//       bottom: "100%",
//       transform: "translateX(-50%)",
//       width: 2,
//       height: lineLen,
//       background: "repeating-linear-gradient(to top, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)",
//     }} />
//     <div style={{
//       position: "absolute",
//       left: "50%",
//       bottom: `calc(100% + ${lineLen}px)`,
//       width: isMobile ? 40 : 60,
//       height: 2,
//       background: "repeating-linear-gradient(to right, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)",
//     }} />
//     <div style={{
//       position: "absolute",
//       left: `calc(50% + ${isMobile ? 40 : 60}px)`,
//       bottom: `calc(100% + ${lineLen - 4}px)`,
//       width: 7, height: 7,
//       borderRadius: "9999px",
//       background: "#FF14EF",
//       boxShadow: "0 0 10px rgba(255,20,239,0.7)",
//     }} />
//   </>
// )}

// {pos.lineTo === "left" && (
//   <>
//     <div style={{
//       position: "absolute",
//       right: "100%",
//       top: "50%",
//       transform: "translateY(-50%)",
//       width: lineLen,
//       height: 2,
//       background: "repeating-linear-gradient(to left, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)",
//     }} />
//     <div style={{
//       position: "absolute",
//       right: `calc(100% + ${lineLen - 4}px)`,
//       top: "50%",
//       transform: "translateY(-50%)",
//       width: 7, height: 7,
//       borderRadius: "9999px",
//       background: "#FF14EF",
//       boxShadow: "0 0 10px rgba(255,20,239,0.7)",
//     }} />
//   </>
// )}

// {pos.lineTo === "right" && (
//   <>
//     <div style={{
//       position: "absolute",
//       left: "100%",
//       top: "50%",
//       transform: "translateY(-50%)",
//       width: lineLen,
//       height: 2,
//       background: "repeating-linear-gradient(to right, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)",
//     }} />
//     <div style={{
//       position: "absolute",
//       left: `calc(100% + ${lineLen - 4}px)`,
//       top: "50%",
//       transform: "translateY(-50%)",
//       width: 7, height: 7,
//       borderRadius: "9999px",
//       background: "#FF14EF",
//       boxShadow: "0 0 10px rgba(255,20,239,0.7)",
//     }} />
//   </>
// )}
//       </div>
//     </motion.div>
//   );
// }

// export function GlobeSection() {
//   const [activeUser, setActiveUser] = useState<GlobeUser | null>(null);
//   const [userIndex, setUserIndex] = useState(0);
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const sync = () => setIsMobile(window.innerWidth <= 640);
//     sync();
//     window.addEventListener("resize", sync);
//     return () => window.removeEventListener("resize", sync);
//   }, []);

//   useEffect(() => {
//     setActiveUser(GLOBE_USERS[0]);

//     const interval = setInterval(() => {
//       setUserIndex((prev) => {
//         const next = (prev + 1) % GLOBE_USERS.length;
//         setActiveUser(GLOBE_USERS[next]);
//         return next;
//       });
//     }, 3500);

//     return () => clearInterval(interval);
//   }, []);

//   const positions = isMobile ? REVIEW_POSITIONS_MOBILE : REVIEW_POSITIONS_DESKTOP;
//   const activeReviewPos = positions[userIndex % positions.length];

//   return (
//     <div
//       className="mt-24 text-center px-4"
//       style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
//     >
//       <div className="flex justify-center mb-6">
//         <div
//           style={{
//             display: "inline-block",
//             borderRadius: 9999,
//             border: "1px solid rgba(255,20,239,0.35)",
//             padding: "6px 20px",
//           }}
//         >
//           <span
//             style={{
//               fontWeight: 500,
//               fontSize: 16,
//               background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//               WebkitBackgroundClip: "text",
//               color: "transparent",
//             }}
//           >
//             GLOBAL COMMUNITY
//           </span>
//         </div>
//       </div>

//       <h2 className="text-4xl md:text-5xl font-bold mb-4">
//         Loved across the globe
//       </h2>

//       <p className="text-white/70 text-lg mb-6 max-w-xl mx-auto">
//         Thousands of prompt engineers from every corner of the world trust Tokun.AI daily.
//       </p>

//       <div
//         className="relative mx-auto w-full"
//    style={{ maxWidth: isMobile ? 520 : 700 }}
//       >
//         <div
//           className="absolute inset-0 blur-[105px] opacity-65"
//           style={{
//             background:
//               "radial-gradient(circle at center, rgba(255,20,239,0.28) 0%, rgba(26,115,232,0.22) 50%, transparent 78%)",
//           }}
//         />

//         <div className="relative w-full aspect-square">
//           <div
//             className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
//             style={{
//               width: "82%",
//               height: "82%",
//               background:
//                 "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.10) 0%, rgba(255,20,239,0.10) 22%, rgba(26,115,232,0.08) 46%, rgba(0,0,0,0) 72%)",
//               filter: "blur(26px)",
//             }}
//           />

//           <div
//             className="absolute left-1/2 bottom-[10%] -translate-x-1/2"
//             style={{
//               width: "42%",
//               height: "9%",
//               background: "rgba(0,0,0,0.42)",
//               filter: "blur(18px)",
//             }}
//           />

//           <Suspense fallback={<GlobeFallback />}>
//             <Canvas
//               camera={{
//   position: isMobile ? [0, 0.18, 5.45] : [0, 0.22, 5.35],
//   fov: isMobile ? 33 : 31,
// }}
//               dpr={[1, 2]}
//               style={{ background: "transparent" }}
//             >
//               <GlobeScene />
//             </Canvas>
//           </Suspense>

//           <AnimatePresence mode="wait">
//             {activeUser && (
//               <ReviewCard
//                 user={activeUser}
//                 pos={activeReviewPos}
//                 cardKey={`${activeUser.name}-${userIndex}`}
//                 isMobile={isMobile}
//               />
//             )}
//           </AnimatePresence>
//         </div>
//       </div>

//       <div
//   style={{
//     display: "flex",
//     gap: isMobile ? 16 : 48,
//     justifyContent: "center",
//     flexWrap: "nowrap",
//     marginTop: 8,
//   }}
// >
//   {[["120+", "Countries"], ["10K+", "Active Users"], ["50K+", "Prompts Created"]].map(
//     ([num, label]) => (
//       <div key={label} style={{ textAlign: "center" }}>
//         <div
//           style={{
//             fontSize: isMobile ? 16 : 28,
//             fontWeight: 700,
//             background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//             WebkitBackgroundClip: "text",
//             color: "transparent",
//             whiteSpace: "nowrap",
//           }}
//         >
//           {num}
//         </div>
//         <div style={{ fontSize: isMobile ? 10 : 13, color: "#8884aa", marginTop: isMobile ? 2 : 4, whiteSpace: "nowrap" }}>
//           {label}
//         </div>
//       </div>
//     )
//   )}
// </div>
// </div>
// );
// }
// useGLTF.preload("/models/airports_around_the_world.glb");

// // ─────────────────────────────────────────────
// // 2. FAQ SECTION
// // ─────────────────────────────────────────────

// const FAQ_ITEMS = [
//   {
//     q: "What LLMs does Tokun support?",
//     a: "Tokun supports all major LLMs including GPT-4, GPT-4o, Claude 3 (Sonnet, Opus, Haiku), Gemini Pro/Ultra, Llama 3, Mistral, and more. New models are added within days of their public release.",
//   },
//   {
//     q: "How does the token reduction actually work?",
//     a: "SmartGen analyzes your intent and rewrites prompts to be semantically equivalent but structurally more efficient. It removes redundant instructions, consolidates overlapping requirements, and uses model-specific formatting that reduces token consumption without sacrificing output quality.",
//   },
//   {
//     q: "How do I earn money on the marketplace?",
//     a: "You list your optimized prompts with a price (one-time or subscription). When other users purchase your prompt, you receive 80% of the revenue. Payouts are processed monthly via Stripe to your bank account or PayPal.",
//   },
//   {
//     q: "Is my prompt data private and secure?",
//     a: "Yes. All prompts you create are private by default. We never train our models on your prompts without explicit consent. You choose what to share publicly on the marketplace. We are SOC2 Type II compliant.",
//   },
//   {
//     q: "Can I use the API in production apps?",
//     a: "Absolutely. The Tokun API is production-ready with 99.9% SLA uptime. Pro plans include 10,000 API calls/month. Teams plans have no limit. We offer dedicated infrastructure for enterprise customers requiring higher throughput.",
//   },
//   {
//     q: "What makes Tokun different from just using ChatGPT directly?",
//     a: "Tokun isn't a chatbot — it's an optimization layer. It takes your raw prompt ideas, refines them for any LLM, tracks performance metrics, and lets you monetize your best work. It works on top of any LLM, not instead of it.",
//   },
// ];

// export function FAQSection() {
//   const [openIdx, setOpenIdx] = useState<number | null>(null);
//   const toggle = (i: number) => setOpenIdx((prev) => (prev === i ? null : i));

//   return (
//     <div className="mt-28" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>
//       <div className="flex justify-center mb-6">
//         <div
//           style={{
//             display: "inline-block",
//             borderRadius: 9999,
//             border: "1px solid rgba(255,20,239,0.35)",
//             padding: "6px 20px",
//           }}
//         >
//           <span
//             style={{
//               fontWeight: 500,
//               fontSize: 16,
//               background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//               WebkitBackgroundClip: "text",
//               color: "transparent",
//             }}
//           >
//             FAQ
//           </span>
//         </div>
//       </div>

//       <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Got questions?</h2>
//       <p className="text-white/70 text-lg text-center mb-12">
//         Everything you need to know about Tokun.AI
//       </p>

//       <div style={{ maxWidth: 740, margin: "0 auto", padding: "0 16px" }}>
//         {FAQ_ITEMS.map((item, i) => {
//           const isOpen = openIdx === i;
//           return (
//             <div key={i} style={{ borderBottom: "1px solid #1a1a1a", overflow: "hidden" }}>
//               <button
//                 type="button"
//                 onClick={() => toggle(i)}
//                 style={{
//                   width: "100%",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   padding: "20px 0",
//                   background: "transparent",
//                   border: "none",
//                   cursor: "pointer",
//                   textAlign: "left",
//                   gap: 16,
//                 }}
//               >
//                 <span
//                   style={{
//                     fontSize: 16,
//                     fontWeight: 500,
//                     color: isOpen ? "#fff" : "rgba(255,255,255,0.85)",
//                     transition: "color 0.2s",
//                     lineHeight: 1.4,
//                   }}
//                 >
//                   {item.q}
//                 </span>
//                 <span
//                   style={{
//                     flexShrink: 0,
//                     width: 28,
//                     height: 28,
//                     borderRadius: "50%",
//                     border: "1px solid rgba(255,255,255,0.2)",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     background: "transparent",
//                     transition: "all 0.3s",
//                   }}
//                 >
//                   <ChevronDown
//                     size={15}
//                     color="#fff"
//                     style={{
//                       transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
//                       transition: "transform 0.3s ease",
//                     }}
//                   />
//                 </span>
//               </button>

//               <AnimatePresence initial={false}>
//                 {isOpen && (
//                   <motion.div
//                     initial={{ height: 0, opacity: 0 }}
//                     animate={{ height: "auto", opacity: 1 }}
//                     exit={{ height: 0, opacity: 0 }}
//                     transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
//                     style={{ overflow: "hidden" }}
//                   >
//                     <p
//                       style={{
//                         fontSize: 14,
//                         color: "rgba(255,255,255,0.65)",
//                         lineHeight: 1.8,
//                         paddingBottom: 20,
//                         paddingRight: 44,
//                       }}
//                     >
//                       {item.a}
//                     </p>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }



// ============================================================
// TOKUN.AI — Globe + FAQ + Ticker Components
// ============================================================

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

// ─────────────────────────────────────────────
// 0. TICKER / MARQUEE SECTION
// ─────────────────────────────────────────────

const TICKER_ITEMS = [
  "SmartGen AI",
  "Prompt Optimization",
  "Token Reduction",
  "Prompt Marketplace",
  "LLM Compatible",
  "GPT-4 · Claude · Gemini",
  "Earn from Prompts",
  "AI-Powered Library",
  "24/7 Support",
];

export function TickerSection() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div
      style={{
        overflow: "hidden",
        padding: "20px 0",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "#0d0d1a",
        fontFamily: "Inter, ui-sans-serif, system-ui",
        margin: "48px 0",
      }}
    >
      <style>{`
        @keyframes tokun-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .tokun-ticker-track {
          display: flex;
          animation: tokun-ticker 25s linear infinite;
          white-space: nowrap;
          width: max-content;
        }
        .tokun-ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="tokun-ticker-track">
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14,
              color: "rgba(255,255,255,0.45)",
              paddingRight: 48,
            }}
          >
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "linear-gradient(90deg, #FF14EF, #1A73E8)",
                flexShrink: 0,
                display: "inline-block",
              }}
            />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 1. 3D GLOBE SECTION
// ─────────────────────────────────────────────

const GLOBE_USERS = [
  { lat: 35.6, lon: 139.7, flag: "🇯🇵", name: "Yuki Tanaka", city: "Tokyo, Japan", msg: "I love SmartGen! Saves me hours every day ✨" },
  { lat: 51.5, lon: -0.1, flag: "🇬🇧", name: "James Harper", city: "London, UK", msg: "Cut my GPT-4 costs by 58% with Tokun!" },
  { lat: 37.7, lon: -122.4, flag: "🇺🇸", name: "Sarah Chen", city: "San Francisco, USA", msg: "Best prompt tool on the market 🔥" },
  { lat: 48.8, lon: 2.3, flag: "🇫🇷", name: "Léa Moreau", city: "Paris, France", msg: "Tokun marketplace made me $800 this month! 💰" },
  { lat: 28.6, lon: 77.2, flag: "🇮🇳", name: "Arjun Sharma", city: "New Delhi, India", msg: "SmartGen is a total game changer for AI devs!" },
  { lat: -23.5, lon: -46.6, flag: "🇧🇷", name: "Lucas Oliveira", city: "São Paulo, Brazil", msg: "Melhor ferramenta de prompts! 🚀" },
  { lat: 1.4, lon: 103.8, flag: "🇸🇬", name: "Wei Liang", city: "Singapore", msg: "Our whole team switched to Tokun. No regrets!" },
  { lat: 55.7, lon: 37.6, flag: "🇷🇺", name: "Dmitri Volkov", city: "Moscow, Russia", msg: "Token optimization is genuinely impressive 👏" },
  { lat: -33.8, lon: 151.2, flag: "🇦🇺", name: "Emma Wilson", city: "Sydney, Australia", msg: "Love the prompt library! Saves so much time ⚡" },
  { lat: 52.5, lon: 13.4, flag: "🇩🇪", name: "Klaus Weber", city: "Berlin, Germany", msg: "Tokun API integrates perfectly with our stack!" },
  { lat: 19.0, lon: 72.8, flag: "🇮🇳", name: "Priya Nair", city: "Mumbai, India", msg: "SmartGen wrote a better prompt than me 😂❤️" },
  { lat: 40.7, lon: -74.0, flag: "🇺🇸", name: "Alex Rivera", city: "New York, USA", msg: "50K prompts on Tokun already? So deserved!" },
  { lat: 31.2, lon: 121.5, flag: "🇨🇳", name: "Li Wei", city: "Shanghai, China", msg: "Supports every LLM I use. Perfect tool!" },
  { lat: -1.3, lon: 36.8, flag: "🇰🇪", name: "Amara Osei", city: "Nairobi, Kenya", msg: "Tokun is growing our AI startup faster 🌍" },
  { lat: 59.3, lon: 18.1, flag: "🇸🇪", name: "Erik Lindqvist", city: "Stockholm, Sweden", msg: "Elegant, fast, support is amazing 🙌" },
  { lat: 25.2, lon: 55.3, flag: "🇦🇪", name: "Farah Al-Nasser", city: "Dubai, UAE", msg: "Prompt marketplace is a brilliant idea! 💡" },
  { lat: 41.0, lon: 29.0, flag: "🇹🇷", name: "Ceren Yilmaz", city: "Istanbul, Turkey", msg: "Tokun helped me 10x my freelance AI work!" },
];

type GlobeUser = typeof GLOBE_USERS[number];

const REVIEW_POSITIONS_DESKTOP = [
  { left: "18%", top: "22%", lineTo: "bottom" as const },
  { left: "76%", top: "20%", lineTo: "bottom" as const },
  { left: "86%", top: "49%", lineTo: "left" as const },
  { left: "64%", top: "80%", lineTo: "top" as const },
  { left: "24%", top: "80%", lineTo: "top" as const },
  { left: "8%",  top: "49%", lineTo: "right" as const },
];

const REVIEW_POSITIONS_MOBILE = [
  { left: "50%", top: "12%", lineTo: "bottom" as const },
  { left: "78%", top: "31%", lineTo: "left" as const },
  { left: "78%", top: "64%", lineTo: "left" as const },
  { left: "50%", top: "86%", lineTo: "top" as const },
  { left: "22%", top: "64%", lineTo: "right" as const },
  { left: "22%", top: "31%", lineTo: "right" as const },
];

// ── AtmosphereShell HATAYA — yahi dark circular bg bana raha tha ──

function GlobeModel() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/airports_around_the_world.glb");
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    if (!clonedScene || !groupRef.current) return;

    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const mats = Array.isArray(child.material)
          ? child.material
          : [child.material];

        mats.forEach((mat: any) => {
          if (!mat) return;
          mat.transparent = false;
          mat.depthWrite = true;
          if ("roughness" in mat && typeof mat.roughness === "number") {
            mat.roughness = Math.min(mat.roughness, 0.82);
          }
          if ("metalness" in mat && typeof mat.metalness === "number") {
            mat.metalness = Math.max(mat.metalness, 0.08);
          }
        });
      }
    });

    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    clonedScene.position.set(-center.x, -center.y, -center.z);

    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const fitScale = 2.45 / maxAxis;
    groupRef.current.scale.setScalar(fitScale);
    groupRef.current.position.set(0, -0.08, 0);
  }, [clonedScene]);

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

function GlobeRig() {
  const globeRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!globeRef.current) return;
    globeRef.current.rotation.y += 0.0034;
    globeRef.current.rotation.x =
      0.24 + Math.sin(state.clock.elapsedTime * 0.7) * 0.02;
    globeRef.current.rotation.z =
      -0.05 + Math.sin(state.clock.elapsedTime * 0.45) * 0.01;
  });

  return (
    <group ref={globeRef} rotation={[0.24, 0.45, -0.05]}>
      <GlobeModel />
    </group>
  );
}

function GlobeScene() {
  return (
    <>
      {/* fog HATAYA — transparent bg ke liye */}
      {/* AtmosphereShell HATAYA — dark sphere create karta tha */}
      {/* ContactShadows HATAYA — neeche shadow patch bana raha tha */}

      <ambientLight intensity={0.8} />
      <hemisphereLight args={["#cfe8ff", "#0a0d17", 0.72]} />
      <directionalLight position={[5, 4, 6]} intensity={2.0} />
      <directionalLight position={[-3, -2, -4]} intensity={0.85} color="#1A73E8" />
      <pointLight position={[2, 1, 4]} intensity={1.15} color="#FF14EF" />
      <spotLight
        position={[0, 6, 6]}
        angle={0.45}
        penumbra={1}
        intensity={1.35}
        color="#ffffff"
      />

      <Environment preset="city" />
      <GlobeRig />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 2.18}
        maxPolarAngle={Math.PI / 1.84}
      />
    </>
  );
}

function GlobeFallback() {
  return <div className="w-full aspect-square" style={{ background: "transparent" }} />;
}

function ReviewCard({
  user,
  pos,
  cardKey,
  isMobile,
}: {
  user: GlobeUser;
  pos: { left: string; top: string; lineTo: "bottom" | "top" | "left" | "right" };
  cardKey: string;
  isMobile: boolean;
}) {
  const cardWidth = isMobile ? 110 : 170;
  const titleFont = isMobile ? 8 : 10;
  const subFont = isMobile ? 6 : 8;
  const msgFont = isMobile ? 7 : 9;

  const lineLen = isMobile ? 28 : 42;      // vertical
  const elbowLen = isMobile ? 24 : 34;     // L-shape horizontal
  const sideLineLen = isMobile ? 28 : 30;  // straight side lines
  const gap = isMobile ? 4 : 6;

  // card kis side par hai uske hisaab se line globe ki taraf bend hogi
  const cardLeft = Number.parseFloat(pos.left);
  const bendInward = cardLeft > 50 ? "left" : "right";

  return (
    <motion.div
      key={cardKey}
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -8 }}
      transition={{ duration: 0.35 }}
      style={{
        position: "absolute",
        left: pos.left,
        top: pos.top,
        transform: "translate(-50%, -50%)",
        width: cardWidth,
        zIndex: 20,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          background: "rgba(23,23,26,0.94)",
          border: "1px solid rgba(255,20,239,0.26)",
          borderRadius: isMobile ? 8 : 12,
          padding: isMobile ? "5px 6px" : "8px 10px",
          boxShadow: "0 0 24px rgba(255,20,239,0.12), 0 8px 24px rgba(0,0,0,0.42)",
          backdropFilter: "blur(8px)",
          color: "white",
          textAlign: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap,
            marginBottom: isMobile ? 4 : 5,
          }}
        >
          <span style={{ fontSize: isMobile ? 12 : 13 }}>{user.flag}</span>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: titleFont,
                fontWeight: 600,
                color: "#fff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.name}
            </div>
            <div
              style={{
                fontSize: subFont,
                color: "rgba(255,255,255,0.55)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.city}
            </div>
          </div>
        </div>

        <p
          style={{
            fontSize: msgFont,
            lineHeight: isMobile ? 1.35 : 1.5,
            color: "rgba(255,255,255,0.76)",
            margin: 0,
          }}
        >
          "{user.msg}"
        </p>

        {/* BOTTOM: vertical ↓ + inward horizontal */}
        {pos.lineTo === "bottom" && (
          <>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "100%",
                transform: "translateX(-50%)",
                width: 2,
                height: lineLen,
                background:
                  "repeating-linear-gradient(to bottom, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)",
              }}
            />

            {bendInward === "right" ? (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: `calc(100% + ${lineLen}px)`,
                    width: elbowLen,
                    height: 2,
                    background:
                      "repeating-linear-gradient(to right, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${elbowLen - 4}px)`,
                    top: `calc(100% + ${lineLen - 4}px)`,
                    width: 7,
                    height: 7,
                    borderRadius: "9999px",
                    background: "#FF14EF",
                    boxShadow: "0 0 10px rgba(255,20,239,0.7)",
                  }}
                />
              </>
            ) : (
              <>
                <div
                  style={{
                    position: "absolute",
                    right: "50%",
                    top: `calc(100% + ${lineLen}px)`,
                    width: elbowLen,
                    height: 2,
                    background:
                      "repeating-linear-gradient(to left, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: `calc(50% + ${elbowLen - 4}px)`,
                    top: `calc(100% + ${lineLen - 4}px)`,
                    width: 7,
                    height: 7,
                    borderRadius: "9999px",
                    background: "#FF14EF",
                    boxShadow: "0 0 10px rgba(255,20,239,0.7)",
                  }}
                />
              </>
            )}
          </>
        )}

        {/* TOP: vertical ↑ + inward horizontal */}
        {pos.lineTo === "top" && (
          <>
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: "100%",
                transform: "translateX(-50%)",
                width: 2,
                height: lineLen,
                background:
                  "repeating-linear-gradient(to top, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)",
              }}
            />

            {bendInward === "right" ? (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: `calc(100% + ${lineLen}px)`,
                    width: elbowLen,
                    height: 2,
                    background:
                      "repeating-linear-gradient(to right, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${elbowLen - 4}px)`,
                    bottom: `calc(100% + ${lineLen - 4}px)`,
                    width: 7,
                    height: 7,
                    borderRadius: "9999px",
                    background: "#FF14EF",
                    boxShadow: "0 0 10px rgba(255,20,239,0.7)",
                  }}
                />
              </>
            ) : (
              <>
                <div
                  style={{
                    position: "absolute",
                    right: "50%",
                    bottom: `calc(100% + ${lineLen}px)`,
                    width: elbowLen,
                    height: 2,
                    background:
                      "repeating-linear-gradient(to left, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: `calc(50% + ${elbowLen - 4}px)`,
                    bottom: `calc(100% + ${lineLen - 4}px)`,
                    width: 7,
                    height: 7,
                    borderRadius: "9999px",
                    background: "#FF14EF",
                    boxShadow: "0 0 10px rgba(255,20,239,0.7)",
                  }}
                />
              </>
            )}
          </>
        )}

        {/* LEFT: straight horizontal */}
        {pos.lineTo === "left" && (
          <>
            <div
              style={{
                position: "absolute",
                right: "100%",
                top: "50%",
                transform: "translateY(-50%)",
                width: sideLineLen,
                height: 2,
                background:
                  "repeating-linear-gradient(to left, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: `calc(100% + ${sideLineLen - 4}px)`,
                top: "50%",
                transform: "translateY(-50%)",
                width: 7,
                height: 7,
                borderRadius: "9999px",
                background: "#FF14EF",
                boxShadow: "0 0 10px rgba(255,20,239,0.7)",
              }}
            />
          </>
        )}

        {/* RIGHT: straight horizontal */}
        {pos.lineTo === "right" && (
          <>
            <div
              style={{
                position: "absolute",
                left: "100%",
                top: "50%",
                transform: "translateY(-50%)",
                width: sideLineLen,
                height: 2,
                background:
                  "repeating-linear-gradient(to right, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `calc(100% + ${sideLineLen - 4}px)`,
                top: "50%",
                transform: "translateY(-50%)",
                width: 7,
                height: 7,
                borderRadius: "9999px",
                background: "#FF14EF",
                boxShadow: "0 0 10px rgba(255,20,239,0.7)",
              }}
            />
          </>
        )}
      </div>
    </motion.div>
  );
}
export function GlobeSection() {
  const [activeUser, setActiveUser] = useState<GlobeUser | null>(null);
  const [userIndex, setUserIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const sync = () => setIsMobile(window.innerWidth <= 640);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    setActiveUser(GLOBE_USERS[0]);
    const interval = setInterval(() => {
      setUserIndex((prev) => {
        const next = (prev + 1) % GLOBE_USERS.length;
        setActiveUser(GLOBE_USERS[next]);
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const positions = isMobile ? REVIEW_POSITIONS_MOBILE : REVIEW_POSITIONS_DESKTOP;
  const activeReviewPos = positions[userIndex % positions.length];

  return (
    <div
      className="mt-24 text-center px-4"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui", background: "transparent" }}
    >
      {/* Badge */}
      <div className="flex justify-center mb-6">
        <div style={{ display: "inline-block", borderRadius: 9999, border: "1px solid rgba(255,20,239,0.35)", padding: "6px 20px" }}>
          <span style={{ fontWeight: 500, fontSize: 16, background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)", WebkitBackgroundClip: "text", color: "transparent" }}>
            GLOBAL COMMUNITY
          </span>
        </div>
      </div>

      <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved across the globe</h2>
      <p className="text-white/70 text-lg mb-6 max-w-xl mx-auto">
        Thousands of prompt engineers from every corner of the world trust Tokun.AI daily.
      </p>

      {/* Globe wrapper — koi background nahi, sirf subtle glow */}
      <div
        className="relative mx-auto w-full"
        style={{ maxWidth: isMobile ? 480 : 680 }}
      >
        {/* Sirf ek bahut halka glow — koi solid bg nahi */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(255,20,239,0.10) 0%, rgba(26,115,232,0.08) 38%, transparent 65%)",
            filter: "blur(55px)",
          }}
        />

        <div className="relative w-full aspect-square">
          <Suspense fallback={<GlobeFallback />}>
            <Canvas
              camera={{
                position: isMobile ? [0, 0.18, 5.45] : [0, 0.22, 5.35],
                fov: isMobile ? 33 : 31,
              }}
              dpr={[1, 2]}
              gl={{ alpha: true }}
              style={{ background: "transparent" }}
            >
              <GlobeScene />
            </Canvas>
          </Suspense>

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

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: isMobile ? 20 : 72,
          justifyContent: "center",
          flexWrap: "nowrap",
          marginTop: isMobile ? 12 : 32,
        }}
      >
        {[["120+", "Countries"], ["10K+", "Active Users"], ["50K+", "Prompts Created"]].map(
          ([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: isMobile ? 16 : 28,
                  fontWeight: 700,
                  background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  whiteSpace: "nowrap",
                }}
              >
                {num}
              </div>
              <div style={{ fontSize: isMobile ? 10 : 13, color: "#8884aa", marginTop: isMobile ? 2 : 6, whiteSpace: "nowrap" }}>
                {label}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

useGLTF.preload("/models/airports_around_the_world.glb");

// ─────────────────────────────────────────────
// 2. FAQ SECTION
// ─────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What LLMs does Tokun support?",
    a: "Tokun supports all major LLMs including GPT-4, GPT-4o, Claude 3 (Sonnet, Opus, Haiku), Gemini Pro/Ultra, Llama 3, Mistral, and more. New models are added within days of their public release.",
  },
  {
    q: "How does the token reduction actually work?",
    a: "SmartGen analyzes your intent and rewrites prompts to be semantically equivalent but structurally more efficient. It removes redundant instructions, consolidates overlapping requirements, and uses model-specific formatting that reduces token consumption without sacrificing output quality.",
  },
  {
    q: "How do I earn money on the marketplace?",
    a: "You list your optimized prompts with a price (one-time or subscription). When other users purchase your prompt, you receive 80% of the revenue. Payouts are processed monthly via Stripe to your bank account or PayPal.",
  },
  {
    q: "Is my prompt data private and secure?",
    a: "Yes. All prompts you create are private by default. We never train our models on your prompts without explicit consent. You choose what to share publicly on the marketplace. We are SOC2 Type II compliant.",
  },
  {
    q: "Can I use the API in production apps?",
    a: "Absolutely. The Tokun API is production-ready with 99.9% SLA uptime. Pro plans include 10,000 API calls/month. Teams plans have no limit. We offer dedicated infrastructure for enterprise customers requiring higher throughput.",
  },
  {
    q: "What makes Tokun different from just using ChatGPT directly?",
    a: "Tokun isn't a chatbot — it's an optimization layer. It takes your raw prompt ideas, refines them for any LLM, tracks performance metrics, and lets you monetize your best work. It works on top of any LLM, not instead of it.",
  },
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const toggle = (i: number) => setOpenIdx((prev) => (prev === i ? null : i));

  return (
    <div className="mt-28" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>
      <div className="flex justify-center mb-6">
        <div style={{ display: "inline-block", borderRadius: 9999, border: "1px solid rgba(255,20,239,0.35)", padding: "6px 20px" }}>
          <span style={{ fontWeight: 500, fontSize: 16, background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)", WebkitBackgroundClip: "text", color: "transparent" }}>
            FAQ
          </span>
        </div>
      </div>

      <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Got questions?</h2>
      <p className="text-white/70 text-lg text-center mb-12">
        Everything you need to know about Tokun.AI
      </p>

      <div style={{ maxWidth: 740, margin: "0 auto", padding: "0 16px" }}>
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={i} style={{ borderBottom: "1px solid #1a1a1a", overflow: "hidden" }}>
              <button
                type="button"
                onClick={() => toggle(i)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", gap: 16 }}
              >
                <span style={{ fontSize: 16, fontWeight: 500, color: isOpen ? "#fff" : "rgba(255,255,255,0.85)", transition: "color 0.2s", lineHeight: 1.4 }}>
                  {item.q}
                </span>
                <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", transition: "all 0.3s" }}>
                  <ChevronDown size={15} color="#fff" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }} />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, paddingBottom: 20, paddingRight: 44 }}>
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}