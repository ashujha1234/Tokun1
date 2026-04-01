// src/components/TokenCircle.tsx
import React, { useMemo } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";

interface TokenCircleProps {
  originalTokens: number;
  optimizedTokens: number;
  optimizedWords?: number; // NEW
}

const GRADIENT_CSS = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

const GradientText = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT_CSS }}>
    {children}
  </span>
);

function GradientRing({
  size = 120,              // ↓ smaller ring (was 150/180)
  stroke = 16,
  value,
  label,
  progress = 1,
}: {
  size?: number;
  stroke?: number;
  value: number | string;
  label: string;
  progress?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gradId = useMemo(
    () => `grad-${label.replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 8)}`,
    [label]
  );

  const pct = Math.max(0, Math.min(1, progress));
  const dashArray = c;
  const dashOffset = c * (1 - pct);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradId} x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#1A73E8" />
            <stop offset="100%" stopColor="#FF14EF" />
          </linearGradient>
        </defs>

        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
          />
        </g>

        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={22}        // ↓ was 28
          fontWeight={600}
          fill="#FFFFFF"
        >
          {value}
        </text>
      </svg>

      <p className="mt-2 text-xs text-white/60">{label}</p> {/* ↓ was mt-3 text-sm */}
    </div>
  );
}

const TokenCircle = ({ originalTokens, optimizedTokens, optimizedWords = 0 }: TokenCircleProps) => { const safeOriginal = Math.max(0, originalTokens || 0); const safeOptimized = Math.max(0, optimizedTokens || 0); const saved = Math.max(0, safeOriginal - safeOptimized); const pct = safeOriginal > 0 ? Math.max(0, Math.min(100, Math.round((saved / safeOriginal) * 100))) : 0; const optimizedProgress = safeOriginal > 0 ? Math.min(1, safeOptimized / safeOriginal) : 0; const fmt = (n: number) => n.toLocaleString();



  return (
    <div
      className="w-full rounded-[16px] opacity-100"
      style={{ backgroundColor: "#121213", transform: "rotate(0deg)" }}
    >
      <div className="py-4 px-4 h-full flex flex-col"> {/* ↓ was py-6 */}
        {/* Header */}
        <div className="text-center mb-3"> {/* ↓ was mb-6 */}
          <h3 className="text-white/95 text-lg font-semibold">Tokun Reduction</h3> {/* ↓ was text-xl */}
          <p className="text-white/60 text-xs mt-1"> {/* ↓ was text-sm */}
            Optimize your prompt to see tokun reduction statistics
          </p>
        </div>

        {/* Rings row */}
        <div className="mx-auto w-full max-w-[480px] flex items-center justify-between"> {/* ↓ was 520px */}
          <GradientRing value={fmt(safeOriginal)} label="Original" progress={1} />
          <div className="flex items-center justify-center mx-3"> {/* ↓ was mx-4 */}
            <ArrowDown className="h-5 w-5 text-white/70" /> {/* ↓ was h-6 w-6 */}
          </div>
          <GradientRing value={fmt(safeOptimized)} label="Optimized" progress={optimizedProgress} />
        </div>

        {/* Compact stats */}
        {(safeOptimized > 0 || optimizedWords > 0) && ( <div className="mt-6 flex justify-center"> <div className="flex justify-between w-full max-w-[520px] p-4 bg-tokun/5 rounded-lg border border-tokun/20"> <div> <p className="text-sm text-muted-foreground">Optimized Tokens</p> <p className="text-2xl font-bold text-tokun">{safeOptimized}</p> </div> <div className="flex items-center text-muted-foreground"> <ArrowRight className="h-6 w-6 mx-4" /> </div> <div> <p className="text-sm text-muted-foreground">Optimized Words</p> <p className="text-2xl font-bold text-tokun">{optimizedWords}</p> </div> </div> </div> )}

        {/* Bottom pill */}
        <div className="mt-5 flex justify-center"> {/* ↓ was mt-8 */}
          <div
            className="flex items-center justify-center border border-white/10 rounded-[10px]"
            style={{ width: 220, height: 44, background: "transparent" }} 
          >
            <span className="text-sm">
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT_CSS }}>
                {pct}%
              </span>
              <span className="text-white/40 mx-2">|</span>
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT_CSS }}>
                {saved} tokuns saved
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenCircle;
