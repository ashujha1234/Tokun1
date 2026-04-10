// ============================================================
// TOKUN.AI — Globe + FAQ + Ticker Components (MOBILE FIXED)
// ============================================================

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

// ─────────────────────────────────────────────
// 0. TICKER / MARQUEE SECTION
// Usage: <TickerSection />
// Place just after your Hero section, before Features
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
  // Duplicate items for seamless infinite loop
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
            {/* Purple dot separator */}
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

const GLOBE_USERS = [
  { lat: 35.6,  lon: 139.7, flag: "🇯🇵", name: "Yuki Tanaka",     city: "Tokyo, Japan",        msg: "I love SmartGen! Saves me hours every day ✨" },
  { lat: 51.5,  lon:  -0.1, flag: "🇬🇧", name: "James Harper",    city: "London, UK",          msg: "Cut my GPT-4 costs by 58% with Tokun!" },
  { lat: 37.7,  lon:-122.4, flag: "🇺🇸", name: "Sarah Chen",      city: "San Francisco, USA",  msg: "Best prompt tool on the market 🔥" },
  { lat: 48.8,  lon:   2.3, flag: "🇫🇷", name: "Léa Moreau",      city: "Paris, France",       msg: "Tokun marketplace made me $800 this month! 💰" },
  { lat: 28.6,  lon:  77.2, flag: "🇮🇳", name: "Arjun Sharma",    city: "New Delhi, India",    msg: "SmartGen is a total game changer for AI devs!" },
  { lat:-23.5,  lon: -46.6, flag: "🇧🇷", name: "Lucas Oliveira",  city: "São Paulo, Brazil",   msg: "Melhor ferramenta de prompts! 🚀" },
  { lat:  1.4,  lon: 103.8, flag: "🇸🇬", name: "Wei Liang",       city: "Singapore",           msg: "Our whole team switched to Tokun. No regrets!" },
  { lat: 55.7,  lon:  37.6, flag: "🇷🇺", name: "Dmitri Volkov",   city: "Moscow, Russia",      msg: "Token optimization is genuinely impressive 👏" },
  { lat:-33.8,  lon: 151.2, flag: "🇦🇺", name: "Emma Wilson",     city: "Sydney, Australia",   msg: "Love the prompt library! Saves so much time ⚡" },
  { lat: 52.5,  lon:  13.4, flag: "🇩🇪", name: "Klaus Weber",     city: "Berlin, Germany",     msg: "Tokun API integrates perfectly with our stack!" },
  { lat: 19.0,  lon:  72.8, flag: "🇮🇳", name: "Priya Nair",      city: "Mumbai, India",       msg: "SmartGen wrote a better prompt than me 😂❤️" },
  { lat: 40.7,  lon: -74.0, flag: "🇺🇸", name: "Alex Rivera",     city: "New York, USA",       msg: "50K prompts on Tokun already? So deserved!" },
  { lat: 31.2,  lon: 121.5, flag: "🇨🇳", name: "Li Wei",          city: "Shanghai, China",     msg: "Supports every LLM I use. Perfect tool!" },
  { lat: -1.3,  lon:  36.8, flag: "🇰🇪", name: "Amara Osei",      city: "Nairobi, Kenya",      msg: "Tokun is growing our AI startup faster 🌍" },
  { lat: 59.3,  lon:  18.1, flag: "🇸🇪", name: "Erik Lindqvist",  city: "Stockholm, Sweden",   msg: "Elegant, fast, support is amazing 🙌" },
  { lat: 25.2,  lon:  55.3, flag: "🇦🇪", name: "Farah Al-Nasser", city: "Dubai, UAE",          msg: "Prompt marketplace is a brilliant idea! 💡" },
  { lat: 41.0,  lon:  29.0, flag: "🇹🇷", name: "Ceren Yilmaz",    city: "Istanbul, Turkey",    msg: "Tokun helped me 10x my freelance AI work!" },
];

const CANVAS_SIZE = 560;

type GlobeUser = typeof GLOBE_USERS[0] & {
  _sx: number; _sy: number; _vis: boolean;
};

type PopupData = {
  /** position in canvas-space (0–560) */
  csx: number;
  csy: number;
  user: GlobeUser;
};

export function GlobeSection() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const wrapRef      = useRef<HTMLDivElement>(null);
  const stateRef     = useRef({
    rotY: 0.4, rotX: 0.22,
    velY: 0.003,
    dragging: false, lastMX: 0, lastMY: 0,
    pulseT: 0,
    activeIdx: -1,
    queueIdx: 0,
    users: GLOBE_USERS.map(u => ({ ...u, _sx: 0, _sy: 0, _vis: false })) as GlobeUser[],
  });

  const [popup, setPopup] = useState<PopupData | null>(null);

  // ── Convert canvas-space → wrapper-percentage so popup stays inside ──
  const getPopupStyle = useCallback((p: PopupData): React.CSSProperties => {
    if (!wrapRef.current) return {};
    const wrapW = wrapRef.current.clientWidth;
    const wrapH = wrapRef.current.clientHeight;
    const scale = wrapW / CANVAS_SIZE;

    const sx = p.csx * scale;        // real px from left
    const sy = p.csy * scale;        // real px from top

    const CARD_W  = Math.min(220, wrapW * 0.58);
    const CARD_H  = 105;             // approx card height
    const MARGIN  = 8;

    // horizontal: clamp so card never overflows left or right
    let left = sx - CARD_W / 2;
    left = Math.max(MARGIN, Math.min(left, wrapW - CARD_W - MARGIN));

    // vertical: prefer above dot, fallback below
    let top: number;
    if (sy - CARD_H - 16 > MARGIN) {
      top = sy - CARD_H - 16;
    } else {
      top = sy + 20;
    }
    top = Math.max(MARGIN, Math.min(top, wrapH - CARD_H - MARGIN));

    return {
      position: "absolute",
      left,
      top,
      width: CARD_W,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext("2d")!;
    const W = CANVAS_SIZE, H = CANVAS_SIZE;
    const cx = W / 2, cy = H / 2, R = 220;
    const s  = stateRef.current;

    function latLonToXYZ(lat: number, lon: number) {
      const phi   = (90 - lat) * Math.PI / 180;
      const theta = (lon + 180) * Math.PI / 180;
      return {
        x: -Math.sin(phi) * Math.cos(theta),
        y:  Math.cos(phi),
        z:  Math.sin(phi) * Math.sin(theta),
      };
    }

    function project(x: number, y: number, z: number) {
      const x1 =  x * Math.cos(s.rotY) + z * Math.sin(s.rotY);
      const z1 = -x * Math.sin(s.rotY) + z * Math.cos(s.rotY);
      const y2 =  y * Math.cos(s.rotX) - z1 * Math.sin(s.rotX);
      const z2 =  y * Math.sin(s.rotX) + z1 * Math.cos(s.rotX);
      return { sx: cx + x1 * R, sy: cy + y2 * R, z: z2 };
    }

    function drawGlobe() {
      ctx.clearRect(0, 0, W, H);

      const grd = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.35);
      grd.addColorStop(0, "rgba(255,20,239,0.14)");
      grd.addColorStop(0.5, "rgba(26,115,232,0.08)");
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.35, 0, Math.PI * 2); ctx.fill();

      const sph = ctx.createRadialGradient(cx - R * 0.28, cy - R * 0.28, R * 0.04, cx, cy, R);
      sph.addColorStop(0, "#1e1250");
      sph.addColorStop(0.45, "#0f0a2a");
      sph.addColorStop(1, "#030406");
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = sph; ctx.fill();

      ctx.lineWidth = 0.5;
      for (let lat = -75; lat <= 75; lat += 15) {
        ctx.beginPath();
        ctx.strokeStyle = lat === 0 ? "rgba(255,20,239,0.22)" : "rgba(100,60,200,0.14)";
        let first = true;
        for (let lon = -180; lon <= 180; lon += 2) {
          const v = latLonToXYZ(lat, lon), p = project(v.x, v.y, v.z);
          if (p.z > -0.02) { if (first) { ctx.moveTo(p.sx, p.sy); first = false; } else ctx.lineTo(p.sx, p.sy); } else first = true;
        }
        ctx.stroke();
      }
      for (let lon = -180; lon <= 165; lon += 15) {
        ctx.beginPath(); ctx.strokeStyle = "rgba(100,60,200,0.10)";
        let first = true;
        for (let lat = -90; lat <= 90; lat += 2) {
          const v = latLonToXYZ(lat, lon), p = project(v.x, v.y, v.z);
          if (p.z > -0.02) { if (first) { ctx.moveTo(p.sx, p.sy); first = false; } else ctx.lineTo(p.sx, p.sy); } else first = true;
        }
        ctx.stroke();
      }

      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,20,239,0.45)"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, R + 2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(26,115,232,0.18)"; ctx.lineWidth = 3; ctx.stroke();

      s.pulseT += 0.06;

      s.users.forEach((u, i) => {
        const v = latLonToXYZ(u.lat, u.lon);
        const p = project(v.x, v.y, v.z);
        u._sx = p.sx; u._sy = p.sy; u._vis = p.z > 0;
        if (!u._vis) return;

        const a = 0.35 + p.z * 0.65;
        const isActive = i === s.activeIdx;

        if (isActive) {
          for (let ring = 0; ring < 3; ring++) {
            const phase = (s.pulseT + ring * 2.1) % (Math.PI * 2);
            const pr = 7 + ring * 6 + Math.sin(phase) * 3;
            const pa = Math.max(0, (1 - pr / 30) * 0.6);
            ctx.beginPath(); ctx.arc(p.sx, p.sy, pr, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255,20,239,${pa})`; ctx.lineWidth = 1; ctx.stroke();
          }
          ctx.beginPath(); ctx.arc(p.sx, p.sy, 5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,150,255,${a})`; ctx.fill();
          ctx.beginPath(); ctx.arc(p.sx, p.sy, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();

          // Dotted vertical connector line
          const lineLen = 48;
          const above = p.sy > cy;
          const lineStartY = above ? p.sy - 6 : p.sy + 6;
          const lineEndY   = above ? p.sy - lineLen : p.sy + lineLen;
          ctx.save();
          ctx.setLineDash([3, 5]);
          ctx.beginPath();
          ctx.moveTo(p.sx, lineStartY);
          ctx.lineTo(p.sx, lineEndY);
          ctx.strokeStyle = `rgba(255,20,239,${a * 0.85})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        } else {
          ctx.beginPath(); ctx.arc(p.sx, p.sy, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(26,115,232,${a * 0.85})`; ctx.fill();
          ctx.beginPath(); ctx.arc(p.sx, p.sy, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,20,239,${a})`; ctx.fill();
        }
      });
    }

    function rotateToward(idx: number) {
      const u = s.users[idx];
      const v = latLonToXYZ(u.lat, u.lon);
      const targetRotY = -Math.atan2(v.x, v.z);
      let diff = targetRotY - s.rotY;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      s.velY = diff * 0.016 + 0.0015;
    }

    let cycleTO: ReturnType<typeof setTimeout>;

    function cycleUser() {
      s.activeIdx = s.queueIdx % s.users.length;
      s.queueIdx++;
      rotateToward(s.activeIdx);

      setTimeout(() => {
        const u = s.users[s.activeIdx];
        if (u._vis) {
          // Pass canvas-space coords; React component converts to real px
          setPopup({ csx: u._sx, csy: u._sy, user: { ...u } });
          setTimeout(() => {
            setPopup(null);
            s.activeIdx = -1;
            cycleTO = setTimeout(cycleUser, 1000);
          }, 4000);
        } else {
          s.activeIdx = -1;
          cycleTO = setTimeout(cycleUser, 800);
        }
      }, 700);
    }

    let raf: number;
    function animate() {
      if (!s.dragging) {
        s.rotY += s.velY;
        s.velY *= 0.993;
        if (Math.abs(s.velY) < 0.0018) s.velY = 0.0018;
      }
      drawGlobe();
      raf = requestAnimationFrame(animate);
    }
    animate();
    cycleTO = setTimeout(cycleUser, 1800);

    const onDown  = (e: MouseEvent) => { s.dragging = true; s.lastMX = e.clientX; s.lastMY = e.clientY; canvas.style.cursor = "grabbing"; };
    const onMove  = (e: MouseEvent) => {
      if (!s.dragging) return;
      const dx = e.clientX - s.lastMX, dy = e.clientY - s.lastMY;
      s.rotY += dx * 0.006; s.rotX += dy * 0.003;
      s.rotX = Math.max(-0.55, Math.min(0.55, s.rotX));
      s.lastMX = e.clientX; s.lastMY = e.clientY; s.velY = dx * 0.004;
    };
    const onUp    = () => { s.dragging = false; canvas.style.cursor = "grab"; };
    const onTouchStart = (e: TouchEvent) => { s.lastMX = e.touches[0].clientX; s.lastMY = e.touches[0].clientY; };
    const onTouchMove  = (e: TouchEvent) => {
      e.preventDefault();
      const dx = e.touches[0].clientX - s.lastMX, dy = e.touches[0].clientY - s.lastMY;
      s.rotY += dx * 0.006; s.rotX += dy * 0.003;
      s.rotX = Math.max(-0.55, Math.min(0.55, s.rotX));
      s.lastMX = e.touches[0].clientX; s.lastMY = e.touches[0].clientY;
    };

    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(cycleTO);
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  const popupStyle = popup ? getPopupStyle(popup) : {};

  return (
    <div className="mt-28 text-center" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>

      <div className="flex justify-center mb-6">
  <div style={{
    display: "inline-block",
    borderRadius: 9999,
    border: "1px solid rgba(255,20,239,0.35)",
    padding: "6px 20px",
  }}>
    <span style={{
      fontWeight: 500, fontSize: 16,
      background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
      WebkitBackgroundClip: "text", color: "transparent",
    }}>
      GLOBAL COMMUNITY
    </span>
  </div>
</div>

      <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved across the globe</h2>
      <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
        Thousands of prompt engineers from every corner of the world trust Tokun.AI daily.
      </p>

      {/*
        KEY FIX: wrapRef tracks real rendered size.
        overflow:hidden ensures popup never bleeds outside the globe box.
        Canvas uses width/height 100% so it scales to wrapper.
      */}
      <div
        ref={wrapRef}
        className="relative inline-block"
        style={{ maxWidth: 560, width: "100%", overflow: "hidden" }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{ width: "100%", height: "auto", cursor: "grab", display: "block" }}
        />

        <AnimatePresence>
          {popup && (
            <motion.div
              key={popup.user.name}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                ...popupStyle,
                pointerEvents: "none",
                zIndex: 10,
                background: "#17171A",
                border: "1px solid rgba(255,20,239,0.35)",
                borderRadius: 14,
                padding: "12px 14px",
                boxShadow: "0 0 32px rgba(255,20,239,0.2), 0 4px 24px rgba(0,0,0,0.8)",
              }}
            >
              {/* Dotted connector tip — points toward the globe dot */}
              {(() => {
                const wrapH = wrapRef.current?.clientHeight ?? CANVAS_SIZE;
                const scale = (wrapRef.current?.clientWidth ?? CANVAS_SIZE) / CANVAS_SIZE;
                const sy = popup.csy * scale;
                const above = sy > wrapH / 2;
                return (
                  <div style={{
                    position: "absolute",
                    [above ? "bottom" : "top"]: -28,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 2,
                    height: 28,
                    background: `repeating-linear-gradient(
                      to ${above ? "bottom" : "top"},
                      rgba(255,20,239,0.75) 0px,
                      rgba(255,20,239,0.75) 3px,
                      transparent 3px,
                      transparent 8px
                    )`,
                  }} />
                );
              })()}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{popup.user.flag}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#f0eeff" }}>{popup.user.name}</div>
                  <div style={{ fontSize: 10, color: "#6b6888" }}>{popup.user.city}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#b8b4cc", fontStyle: "italic", lineHeight: 1.6 }}>
                "{popup.user.msg}"
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap", marginTop: 32 }}>
        {[["120+", "Countries"], ["10K+", "Active Users"], ["50K+", "Prompts Created"]].map(([num, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{
              fontSize: 28, fontWeight: 700,
              background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
              WebkitBackgroundClip: "text", color: "transparent",
            }}>{num}</div>
            <div style={{ fontSize: 13, color: "#8884aa", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
// 2. FAQ SECTION  (unchanged)
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
  const toggle = (i: number) => setOpenIdx(prev => prev === i ? null : i);

  return (
    <div className="mt-28" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>

      <div className="flex justify-center mb-6">
  <div style={{
    display: "inline-block",
    borderRadius: 9999,
    border: "1px solid rgba(255,20,239,0.35)",
    padding: "6px 20px",
  }}>
    <span style={{
      fontWeight: 500, fontSize: 16,
      background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
      WebkitBackgroundClip: "text", color: "transparent",
    }}>
      FAQ
    </span>
  </div>
</div>

      <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Got questions?</h2>
      <p className="text-white/70 text-lg text-center mb-12">Everything you need to know about Tokun.AI</p>

      <div style={{ maxWidth: 740, margin: "0 auto", padding: "0 16px" }}>
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={i} style={{ borderBottom: "1px solid #1a1a1a", overflow: "hidden" }}>
              <button
                type="button"
                onClick={() => toggle(i)}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  justifyContent: "space-between", padding: "20px 0",
                  background: "transparent", border: "none", cursor: "pointer",
                  textAlign: "left", gap: 16,
                }}
              >
                <span style={{
                  fontSize: 16, fontWeight: 500,
                  color: isOpen ? "#fff" : "rgba(255,255,255,0.85)",
                  transition: "color 0.2s", lineHeight: 1.4,
                }}>
                  {item.q}
                </span>
                <span style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "transparent",
                  transition: "all 0.3s",
                }}>
                  <ChevronDown
                    size={15}
                    color="#fff"
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease",
                    }}
                  />
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
                    <p style={{
                      fontSize: 14, color: "rgba(255,255,255,0.65)",
                      lineHeight: 1.8, paddingBottom: 20, paddingRight: 44,
                    }}>
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

// ============================================================
// USAGE in Landing.tsx:
//
// import { TickerSection, GlobeSection, FAQSection } from "./GlobeAndFAQ_components";
//
// Place <TickerSection /> just AFTER your Hero section, before Features
//
// Place <GlobeSection /> before {/* TESTIMONIALS */}
// Place <FAQSection />  after  {/* FINAL CTA */}
// ============================================================