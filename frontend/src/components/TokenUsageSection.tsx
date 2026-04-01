// // // // // // // // // // src/components/TokenUsageSection.tsx
// // // // // // // // // import React from "react";

// // // // // // // // // type Props = {
// // // // // // // // //   totalTokensUsed?: number;
// // // // // // // // //   tokenLimit?: number;
// // // // // // // // // };

// // // // // // // // // const TokenUsageSection: React.FC<Props> = ({
// // // // // // // // //   totalTokensUsed = 0,
// // // // // // // // //   tokenLimit = 100000,
// // // // // // // // // }) => {
// // // // // // // // //   const r = 45;
// // // // // // // // //   const circumference = 2 * Math.PI * r;

// // // // // // // // //   const safeUsed = Number.isFinite(totalTokensUsed) ? totalTokensUsed : 0;
// // // // // // // // //   const safeLimit = Number.isFinite(tokenLimit) && tokenLimit > 0 ? tokenLimit : 100000;

// // // // // // // // //   const progress = Math.max(0, Math.min(1, safeUsed / safeLimit));
// // // // // // // // //   const dashOffset = circumference - progress * circumference;

// // // // // // // // //   return (
// // // // // // // // //     <div className="flex justify-center mb-8">
// // // // // // // // //       <div
// // // // // // // // //         className="relative p-6"
// // // // // // // // //         style={{
// // // // // // // // //           backgroundColor: "#121213",
// // // // // // // // //           borderRadius: 16,
// // // // // // // // //           boxShadow: "0 8px 24px rgba(0,0,0,.6)",
// // // // // // // // //         }}
// // // // // // // // //       >
// // // // // // // // //         <div className="flex items-center gap-4">
// // // // // // // // //           <div className="relative w-24 h-24">
// // // // // // // // //             <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
// // // // // // // // //               <defs>
// // // // // // // // //                 <linearGradient id="tokenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
// // // // // // // // //                   <stop offset="0%" stopColor="#1A73E8" />
// // // // // // // // //                   <stop offset="100%" stopColor="#FF14EF" />
// // // // // // // // //                 </linearGradient>
// // // // // // // // //               </defs>

// // // // // // // // //               {/* Track */}
// // // // // // // // //               <circle cx="50" cy="50" r={r} stroke="rgba(30, 174, 219, 0.2)" strokeWidth="8" fill="none" />
// // // // // // // // //               {/* Progress */}
// // // // // // // // //               <circle
// // // // // // // // //                 cx="50" cy="50" r={r}
// // // // // // // // //                 stroke="url(#tokenGradient)" strokeWidth="8" fill="none" strokeLinecap="round"
// // // // // // // // //                 strokeDasharray={circumference}
// // // // // // // // //                 strokeDashoffset={dashOffset}
// // // // // // // // //               />
// // // // // // // // //             </svg>

// // // // // // // // //             <div className="absolute inset-0 flex items-center justify-center">
// // // // // // // // //               <span className="text-2xl font-bold text-white">{safeUsed}</span>
// // // // // // // // //             </div>
// // // // // // // // //           </div>

// // // // // // // // //           <div className="text-white">
// // // // // // // // //             <div className="flex items-center gap-4 mb-2">
// // // // // // // // //               <div className="flex items-center gap-2">
// // // // // // // // //                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
// // // // // // // // //                 <span className="text-sm text-gray-400">Used</span>
// // // // // // // // //                 <span className="font-bold">{safeUsed}</span>
// // // // // // // // //               </div>
// // // // // // // // //               <div className="flex items-center gap-2">
// // // // // // // // //                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
// // // // // // // // //                 <span className="text-sm text-gray-400">Limit</span>
// // // // // // // // //                 <span className="font-bold">{safeLimit.toLocaleString()}</span>
// // // // // // // // //               </div>
// // // // // // // // //             </div>
// // // // // // // // //             <p className="text-sm font-bold">
// // // // // // // // //               {Math.max(0, safeLimit - safeUsed).toLocaleString()} tokens remaining
// // // // // // // // //             </p>
// // // // // // // // //           </div>
// // // // // // // // //         </div>
// // // // // // // // //       </div>
// // // // // // // // //     </div>
// // // // // // // // //   );
// // // // // // // // // };

// // // // // // // // // export default TokenUsageSection;

// // // // // // // // // // // src/components/TokenUsageSection.tsx
// // // // // // // // // // import React, { useEffect, useMemo, useState } from "react";
// // // // // // // // // // // If you have an AuthContext that exposes a JWT, import it:
// // // // // // // // // // import { useAuth } from "@/contexts/AuthContext";

// // // // // // // // // // type Props = {
// // // // // // // // // //   /** Allow overriding via props if needed; otherwise fetched from API */
// // // // // // // // // //   totalTokensUsed?: number;
// // // // // // // // // //   tokenLimit?: number;
// // // // // // // // // //   /** Force refresh from parent when this changes (optional) */
// // // // // // // // // //   refreshKey?: string | number;
// // // // // // // // // // };

// // // // // // // // // // type QuotaResponse = {
// // // // // // // // // //   success: boolean;
// // // // // // // // // //   plan?: any;
// // // // // // // // // //   // one of these should exist:
// // // // // // // // // //   dailyTokensRemaining?: number;
// // // // // // // // // //   monthlyTokensRemaining?: number;
// // // // // // // // // //   // sometimes helpful if the limit lives on user
// // // // // // // // // //   user?: {
// // // // // // // // // //     dailyTokenLimit?: number;
// // // // // // // // // //     monthlyTokenLimit?: number;
// // // // // // // // // //     plan?: any;
// // // // // // // // // //   };
// // // // // // // // // // };

// // // // // // // // // // const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
// // // // // // // // // // const base = API_BASE || ""; // relative in dev if proxied

// // // // // // // // // // const TokenUsageSection: React.FC<Props> = ({
// // // // // // // // // //   totalTokensUsed,
// // // // // // // // // //   tokenLimit,
// // // // // // // // // //   refreshKey,
// // // // // // // // // // }) => {
// // // // // // // // // //   const { token } = useAuth?.() || ({} as any);

// // // // // // // // // //   const [loading, setLoading] = useState<boolean>(false);
// // // // // // // // // //   const [apiErr, setApiErr] = useState<string | null>(null);
// // // // // // // // // //   const [fetchedRemaining, setFetchedRemaining] = useState<number | null>(null);
// // // // // // // // // //   const [fetchedLimit, setFetchedLimit] = useState<number | null>(null);

// // // // // // // // // //   // fetch from backend
// // // // // // // // // //   useEffect(() => {
// // // // // // // // // //     let cancelled = false;
// // // // // // // // // //     const run = async () => {
// // // // // // // // // //       // If parent provided explicit numbers, don't fetch
// // // // // // // // // //       if (Number.isFinite(totalTokensUsed) && Number.isFinite(tokenLimit)) {
// // // // // // // // // //         setApiErr(null);
// // // // // // // // // //         return;
// // // // // // // // // //       }

// // // // // // // // // //       setLoading(true);
// // // // // // // // // //       setApiErr(null);
// // // // // // // // // //       try {
// // // // // // // // // //         const res = await fetch(`${base}/api/quota`, {
// // // // // // // // // //           method: "GET",
// // // // // // // // // //           headers: {
// // // // // // // // // //             ...(token ? { Authorization: `Bearer ${token}` } : {}),
// // // // // // // // // //           },
// // // // // // // // // //           credentials: "include", // keep if your server reads cookies/sessions
// // // // // // // // // //         });

// // // // // // // // // //         // Non-2xx: try to read error body
// // // // // // // // // //         if (!res.ok) {
// // // // // // // // // //           const txt = await res.text().catch(() => "");
// // // // // // // // // //           throw new Error(txt || `http_${res.status}`);
// // // // // // // // // //         }

// // // // // // // // // //         const data: QuotaResponse = await res.json();
// // // // // // // // // //         // Prefer monthly if present, else daily
// // // // // // // // // //         const remaining =
// // // // // // // // // //           (Number.isFinite(data.monthlyTokensRemaining)
// // // // // // // // // //             ? data.monthlyTokensRemaining
// // // // // // // // // //             : data.dailyTokensRemaining) ?? null;

// // // // // // // // // //         // Try to discover limit on user, else sensible defaults
// // // // // // // // // //         const limitGuess =
// // // // // // // // // //           (Number.isFinite(data.user?.monthlyTokenLimit)
// // // // // // // // // //             ? data.user?.monthlyTokenLimit
// // // // // // // // // //             : data.user?.dailyTokenLimit) ?? null;

// // // // // // // // // //         if (!cancelled) {
// // // // // // // // // //           setFetchedRemaining(
// // // // // // // // // //             remaining != null && Number.isFinite(remaining) ? Number(remaining) : 0
// // // // // // // // // //           );
// // // // // // // // // //           setFetchedLimit(
// // // // // // // // // //             limitGuess != null && Number.isFinite(limitGuess)
// // // // // // // // // //               ? Number(limitGuess)
// // // // // // // // // //               : 100000 // fallback limit
// // // // // // // // // //           );
// // // // // // // // // //         }
// // // // // // // // // //       } catch (e: any) {
// // // // // // // // // //         if (!cancelled) setApiErr(e?.message || "Failed to load quota");
// // // // // // // // // //       } finally {
// // // // // // // // // //         if (!cancelled) setLoading(false);
// // // // // // // // // //       }
// // // // // // // // // //     };
// // // // // // // // // //     run();
// // // // // // // // // //     return () => {
// // // // // // // // // //       cancelled = true;
// // // // // // // // // //     };
// // // // // // // // // //   }, [token, refreshKey, totalTokensUsed, tokenLimit]);

// // // // // // // // // //   // compute used/limit from either props or fetched
// // // // // // // // // //   const safeLimit = useMemo(() => {
// // // // // // // // // //     // priority: prop -> fetched -> default
// // // // // // // // // //     if (Number.isFinite(tokenLimit) && (tokenLimit as number) > 0) {
// // // // // // // // // //       return tokenLimit as number;
// // // // // // // // // //     }
// // // // // // // // // //     if (Number.isFinite(fetchedLimit) && (fetchedLimit as number) > 0) {
// // // // // // // // // //       return fetchedLimit as number;
// // // // // // // // // //     }
// // // // // // // // // //     return 100000;
// // // // // // // // // //   }, [tokenLimit, fetchedLimit]);

// // // // // // // // // //   const safeRemaining = useMemo(() => {
// // // // // // // // // //     if (Number.isFinite(fetchedRemaining)) return fetchedRemaining as number;
// // // // // // // // // //     // if the parent passed totalTokensUsed only, estimate remaining from that
// // // // // // // // // //     if (Number.isFinite(totalTokensUsed)) {
// // // // // // // // // //       return Math.max(0, safeLimit - (totalTokensUsed as number));
// // // // // // // // // //     }
// // // // // // // // // //     // unknown; show 0 used until data arrives
// // // // // // // // // //     return safeLimit;
// // // // // // // // // //   }, [fetchedRemaining, totalTokensUsed, safeLimit]);

// // // // // // // // // //   const used = useMemo(() => {
// // // // // // // // // //     // priority: prop -> derived from fetched
// // // // // // // // // //     if (Number.isFinite(totalTokensUsed)) return totalTokensUsed as number;
// // // // // // // // // //     return Math.max(0, safeLimit - safeRemaining);
// // // // // // // // // //   }, [totalTokensUsed, safeLimit, safeRemaining]);

// // // // // // // // // //   // ring geometry
// // // // // // // // // //   const r = 45;
// // // // // // // // // //   const circumference = 2 * Math.PI * r;
// // // // // // // // // //   const progress = Math.max(0, Math.min(1, used / safeLimit));
// // // // // // // // // //   const dashOffset = circumference - progress * circumference;

// // // // // // // // // //   return (
// // // // // // // // // //     <div className="flex justify-center mb-8">
// // // // // // // // // //       <div
// // // // // // // // // //         className="relative p-6"
// // // // // // // // // //         style={{
// // // // // // // // // //           backgroundColor: "#121213",
// // // // // // // // // //           borderRadius: 16,
// // // // // // // // // //           boxShadow: "0 8px 24px rgba(0,0,0,.6)",
// // // // // // // // // //           minWidth: 320,
// // // // // // // // // //         }}
// // // // // // // // // //       >
// // // // // // // // // //         <div className="flex items-center gap-4">
// // // // // // // // // //           <div className="relative w-24 h-24">
// // // // // // // // // //             <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
// // // // // // // // // //               <defs>
// // // // // // // // // //                 <linearGradient id="tokenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
// // // // // // // // // //                   <stop offset="0%" stopColor="#1A73E8" />
// // // // // // // // // //                   <stop offset="100%" stopColor="#FF14EF" />
// // // // // // // // // //                 </linearGradient>
// // // // // // // // // //               </defs>

// // // // // // // // // //               {/* Track */}
// // // // // // // // // //               <circle cx="50" cy="50" r={r} stroke="rgba(30, 174, 219, 0.2)" strokeWidth="8" fill="none" />
// // // // // // // // // //               {/* Progress */}
// // // // // // // // // //               <circle
// // // // // // // // // //                 cx="50" cy="50" r={r}
// // // // // // // // // //                 stroke="url(#tokenGradient)" strokeWidth="8" fill="none" strokeLinecap="round"
// // // // // // // // // //                 strokeDasharray={circumference}
// // // // // // // // // //                 strokeDashoffset={dashOffset}
// // // // // // // // // //               />
// // // // // // // // // //             </svg>

// // // // // // // // // //             <div className="absolute inset-0 flex items-center justify-center">
// // // // // // // // // //               <span className="text-2xl font-bold text-white">
// // // // // // // // // //                 {loading ? "…" : used.toLocaleString()}
// // // // // // // // // //               </span>
// // // // // // // // // //             </div>
// // // // // // // // // //           </div>

// // // // // // // // // //           <div className="text-white">
// // // // // // // // // //             <div className="flex items-center gap-4 mb-2">
// // // // // // // // // //               <div className="flex items-center gap-2">
// // // // // // // // // //                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
// // // // // // // // // //                 <span className="text-sm text-gray-400">Used</span>
// // // // // // // // // //                 <span className="font-bold">{loading ? "…" : used.toLocaleString()}</span>
// // // // // // // // // //               </div>
// // // // // // // // // //               <div className="flex items-center gap-2">
// // // // // // // // // //                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
// // // // // // // // // //                 <span className="text-sm text-gray-400">Limit</span>
// // // // // // // // // //                 <span className="font-bold">{safeLimit.toLocaleString()}</span>
// // // // // // // // // //               </div>
// // // // // // // // // //             </div>

// // // // // // // // // //             <p className="text-sm font-bold">
// // // // // // // // // //               {Math.max(0, safeLimit - used).toLocaleString()} tokens remaining
// // // // // // // // // //             </p>

// // // // // // // // // //             {apiErr && (
// // // // // // // // // //               <p className="text-xs text-red-400 mt-1">
// // // // // // // // // //                 Failed to fetch quota: {apiErr}
// // // // // // // // // //               </p>
// // // // // // // // // //             )}
// // // // // // // // // //           </div>
// // // // // // // // // //         </div>
// // // // // // // // // //       </div>
// // // // // // // // // //     </div>
// // // // // // // // // //   );
// // // // // // // // // // };

// // // // // // // // // // export default TokenUsageSection;




// // // // // // // // // src/components/TokenUsageSection.tsx
// // // // // // // // import React, { useEffect, useMemo, useState } from "react";
// // // // // // // // import { useAuth } from "@/contexts/AuthContext"; // if you have it; safe to keep
// // // // // // // //                                                      // or remove the import & usages if not

// // // // // // // // type Props = {
// // // // // // // //   totalTokensUsed?: number;  // fallback if API doesn't return anything
// // // // // // // //   tokenLimit?: number;       // fallback if API doesn't return anything
// // // // // // // //   className?: string;
// // // // // // // // };

// // // // // // // // type QuotaApiResponse =
// // // // // // // //   | {
// // // // // // // //       success: boolean;
// // // // // // // //       user?: any;
// // // // // // // //       plan?: string;
// // // // // // // //       dailyTokensRemaining?: number;
// // // // // // // //       // other fields may exist
// // // // // // // //     }
// // // // // // // //   | { success: false; error: string };

// // // // // // // // const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// // // // // // // // const TokenUsageSection: React.FC<Props> = ({
// // // // // // // //   totalTokensUsed = 0,
// // // // // // // //   tokenLimit = 100000,
// // // // // // // //   className = "",
// // // // // // // // }) => {
// // // // // // // //   const { token: ctxToken } = useAuth?.() || ({} as any);
// // // // // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // // // // //   const [err, setErr] = useState<string | null>(null);

// // // // // // // //   const [serverRemaining, setServerRemaining] = useState<number | null>(null);
// // // // // // // //   const [serverLimit, setServerLimit] = useState<number | null>(null);

// // // // // // // //   const r = 45;
// // // // // // // //   const circumference = 2 * Math.PI * r;

// // // // // // // //   // Fetch quota on mount (and when API_BASE changes)
// // // // // // // //   async function fetchQuota() {
// // // // // // // //     setIsLoading(true);
// // // // // // // //     setErr(null);
// // // // // // // //     try {
// // // // // // // //       const localToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
// // // // // // // //       const authHeader =
// // // // // // // //         ctxToken || localToken ? { Authorization: `Bearer ${ctxToken || localToken}` } : {};

// // // // // // // //      const res = await fetch(`${API_BASE}/api/quota`, {
// // // // // // // //         method: "GET",
// // // // // // // //         headers: {
// // // // // // // //           "Content-Type": "application/json",
// // // // // // // //           ...authHeader,
// // // // // // // //         },
// // // // // // // //         credentials: "include", // supports cookie-based auth too
// // // // // // // //       });

// // // // // // // //       if (!res.ok) {
// // // // // // // //         const text = await res.text().catch(() => "");
// // // // // // // //         throw new Error(text || `HTTP ${res.status}`);
// // // // // // // //       }

// // // // // // // //       const data: QuotaApiResponse = await res.json();

// // // // // // // //       if (!("success" in data) || !data.success) {
// // // // // // // //         throw new Error(("error" in data && data.error) || "unknown_error");
// // // // // // // //       }

// // // // // // // //       // Try to read remaining directly, else from user
// // // // // // // //       const remainingFromTop =
// // // // // // // //         (data as any)?.dailyTokensRemaining; // if your route returns it at top-level
// // // // // // // //       const remainingFromUser =
// // // // // // // //         (data as any)?.user?.dailyTokensRemaining ??
// // // // // // // //         (data as any)?.user?.daily_tokens_remaining ??
// // // // // // // //         null;

// // // // // // // //       // Try to read a limit/cap if your backend exposes it on user
// // // // // // // //       const limitFromUser =
// // // // // // // //         (data as any)?.user?.dailyTokensCap ??
// // // // // // // //         (data as any)?.user?.daily_limit ??
// // // // // // // //         (data as any)?.user?.monthlyTokensCap ?? // some backends track monthly cap
// // // // // // // //         null;

// // // // // // // //       setServerRemaining(
// // // // // // // //         Number.isFinite(remainingFromTop) ? remainingFromTop :
// // // // // // // //         Number.isFinite(remainingFromUser) ? remainingFromUser : null
// // // // // // // //       );

// // // // // // // //       setServerLimit(Number.isFinite(limitFromUser) ? limitFromUser : null);
// // // // // // // //     } catch (e: any) {
// // // // // // // //       setErr(e?.message || "Failed to fetch quota");
// // // // // // // //       setServerRemaining(null);
// // // // // // // //       setServerLimit(null);
// // // // // // // //     } finally {
// // // // // // // //       setIsLoading(false);
// // // // // // // //     }
// // // // // // // //   }

// // // // // // // //   useEffect(() => {
// // // // // // // //     fetchQuota();
// // // // // // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // // // // // //   }, [API_BASE]); // re-run if base changes

// // // // // // // //   // Decide final limit and used
// // // // // // // //   const finalLimit = useMemo(() => {
// // // // // // // //     const raw = Number.isFinite(serverLimit as number) && (serverLimit as number)! > 0
// // // // // // // //       ? (serverLimit as number)
// // // // // // // //       : tokenLimit;
// // // // // // // //     return Number.isFinite(raw) && raw > 0 ? raw : 100000;
// // // // // // // //   }, [serverLimit, tokenLimit]);

// // // // // // // //   const finalRemaining = useMemo(() => {
// // // // // // // //     if (Number.isFinite(serverRemaining as number) && (serverRemaining as number)! >= 0) {
// // // // // // // //       return Math.max(0, serverRemaining as number);
// // // // // // // //     }
// // // // // // // //     // If API didn't give remaining, fall back to props (limit - used)
// // // // // // // //     const fallback = Math.max(0, finalLimit - (Number.isFinite(totalTokensUsed) ? totalTokensUsed : 0));
// // // // // // // //     return fallback;
// // // // // // // //   }, [serverRemaining, finalLimit, totalTokensUsed]);

// // // // // // // //   const finalUsed = useMemo(() => {
// // // // // // // //     // Prefer to compute used from remaining & limit for consistency
// // // // // // // //     const computed = finalLimit - finalRemaining;
// // // // // // // //     if (Number.isFinite(computed) && computed >= 0) return computed;
// // // // // // // //     // Absolute last resort, props:
// // // // // // // //     return Math.max(0, Number.isFinite(totalTokensUsed) ? totalTokensUsed : 0);
// // // // // // // //   }, [finalLimit, finalRemaining, totalTokensUsed]);

// // // // // // // //   const progress = Math.max(0, Math.min(1, finalUsed / finalLimit));
// // // // // // // //   const dashOffset = circumference - progress * circumference;

// // // // // // // //   return (
// // // // // // // //     <div className={`flex justify-center mb-8 ${className}`}>
// // // // // // // //       <div
// // // // // // // //         className="relative p-6"
// // // // // // // //         style={{
// // // // // // // //           backgroundColor: "#121213",
// // // // // // // //           borderRadius: 16,
// // // // // // // //           boxShadow: "0 8px 24px rgba(0,0,0,.6)",
// // // // // // // //           minWidth: 320,
// // // // // // // //         }}
// // // // // // // //       >
// // // // // // // //         <div className="flex items-center gap-4">
// // // // // // // //           <div className="relative w-24 h-24">
// // // // // // // //             <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
// // // // // // // //               <defs>
// // // // // // // //                 <linearGradient id="tokenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
// // // // // // // //                   <stop offset="0%" stopColor="#1A73E8" />
// // // // // // // //                   <stop offset="100%" stopColor="#FF14EF" />
// // // // // // // //                 </linearGradient>
// // // // // // // //               </defs>

// // // // // // // //               {/* Track */}
// // // // // // // //               <circle cx="50" cy="50" r={r} stroke="rgba(30, 174, 219, 0.2)" strokeWidth="8" fill="none" />
// // // // // // // //               {/* Progress */}
// // // // // // // //               <circle
// // // // // // // //                 cx="50" cy="50" r={r}
// // // // // // // //                 stroke="url(#tokenGradient)" strokeWidth="8" fill="none" strokeLinecap="round"
// // // // // // // //                 strokeDasharray={circumference}
// // // // // // // //                 strokeDashoffset={dashOffset}
// // // // // // // //               />
// // // // // // // //             </svg>

// // // // // // // //             <div className="absolute inset-0 flex items-center justify-center">
// // // // // // // //               <span className="text-2xl font-bold text-white">
// // // // // // // //                 {isLoading ? "…" : finalUsed.toLocaleString()}
// // // // // // // //               </span>
// // // // // // // //             </div>
// // // // // // // //           </div>

// // // // // // // //           <div className="text-white">
// // // // // // // //             <div className="flex items-center gap-4 mb-2">
// // // // // // // //               <div className="flex items-center gap-2">
// // // // // // // //                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
// // // // // // // //                 <span className="text-sm text-gray-400">Used</span>
// // // // // // // //                 <span className="font-bold">{isLoading ? "…" : finalUsed.toLocaleString()}</span>
// // // // // // // //               </div>
// // // // // // // //               <div className="flex items-center gap-2">
// // // // // // // //                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
// // // // // // // //                 <span className="text-sm text-gray-400">Limit</span>
// // // // // // // //                 <span className="font-bold">{isLoading ? "…" : finalLimit.toLocaleString()}</span>
// // // // // // // //               </div>
// // // // // // // //             </div>

// // // // // // // //             <p className="text-sm font-bold">
// // // // // // // //               {isLoading ? "Loading…" : `${finalRemaining.toLocaleString()} tokens remaining`}
// // // // // // // //             </p>

// // // // // // // //             <div className="mt-3 flex items-center gap-2">
// // // // // // // //               <button
// // // // // // // //                 type="button"
// // // // // // // //                 onClick={fetchQuota}
// // // // // // // //                 className="px-3 py-1 rounded-lg text-sm bg-[#1A73E8] hover:opacity-90 transition"
// // // // // // // //                 disabled={isLoading}
// // // // // // // //                 title="Refresh usage"
// // // // // // // //               >
// // // // // // // //                 {isLoading ? "Refreshing…" : "Refresh"}
// // // // // // // //               </button>
// // // // // // // //               {err && <span className="text-xs text-red-400">({err})</span>}
// // // // // // // //             </div>
// // // // // // // //           </div>
// // // // // // // //         </div>
// // // // // // // //       </div>
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // export default TokenUsageSection;


// // // // // // // import React, { useEffect, useMemo, useState } from "react";
// // // // // // // import { useAuth } from "@/contexts/AuthContext";

// // // // // // // type Props = {
// // // // // // //   className?: string;
// // // // // // // };

// // // // // // // type QuotaApiResponse =
// // // // // // //   | {
// // // // // // //       success: boolean;
// // // // // // //       user?: any;
// // // // // // //       monthlyTokensCap?: number;
// // // // // // //       monthlyTokensUsed?: number;
// // // // // // //       monthlyTokensRemaining?: number;
// // // // // // //     }
// // // // // // //   | { success: false; error: string };

// // // // // // // const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// // // // // // // const TokenUsageSection: React.FC<Props> = ({ className = "" }) => {
// // // // // // //   const { user, token: ctxToken } = useAuth?.() || ({} as any);

// // // // // // //   // initial values from login/signup
// // // // // // //   const [serverUsed, setServerUsed] = useState<number | null>(
// // // // // // //     user?.monthlyTokensUsed ?? null
// // // // // // //   );
// // // // // // //   const [serverLimit, setServerLimit] = useState<number | null>(
// // // // // // //     user?.monthlyTokensCap ?? null
// // // // // // //   );
// // // // // // //   const [isLoading, setIsLoading] = useState(false);
// // // // // // //   const [err, setErr] = useState<string | null>(null);

// // // // // // //   const r = 45;
// // // // // // //   const circumference = 2 * Math.PI * r;

// // // // // // //   async function fetchQuota() {
// // // // // // //     setIsLoading(true);
// // // // // // //     setErr(null);
// // // // // // //     try {
// // // // // // //       const localToken =
// // // // // // //         typeof window !== "undefined" ? localStorage.getItem("token") : null;
// // // // // // //       const authHeader =
// // // // // // //         ctxToken || localToken
// // // // // // //           ? { Authorization: `Bearer ${ctxToken || localToken}` }
// // // // // // //           : {};

// // // // // // //       const res = await fetch(`${API_BASE}/api/quota`, {
// // // // // // //         method: "GET",
// // // // // // //         headers: {
// // // // // // //           "Content-Type": "application/json",
// // // // // // //           ...authHeader,
// // // // // // //         },
// // // // // // //         credentials: "include",
// // // // // // //       });

// // // // // // //       if (!res.ok) {
// // // // // // //         const text = await res.text().catch(() => "");
// // // // // // //         throw new Error(text || `HTTP ${res.status}`);
// // // // // // //       }

// // // // // // //       const data: QuotaApiResponse = await res.json();
// // // // // // //       if (!("success" in data) || !data.success) {
// // // // // // //         throw new Error(("error" in data && data.error) || "unknown_error");
// // // // // // //       }

// // // // // // //       const u = (data as any)?.user || {};
// // // // // // //       setServerUsed(
// // // // // // //         Number.isFinite(u.monthlyTokensUsed) ? u.monthlyTokensUsed : null
// // // // // // //       );
// // // // // // //       setServerLimit(
// // // // // // //         Number.isFinite(u.monthlyTokensCap) ? u.monthlyTokensCap : null
// // // // // // //       );
// // // // // // //     } catch (e: any) {
// // // // // // //       setErr(e?.message || "Failed to fetch quota");
// // // // // // //     } finally {
// // // // // // //       setIsLoading(false);
// // // // // // //     }
// // // // // // //   }

// // // // // // //   useEffect(() => {
// // // // // // //     if (!serverLimit || !serverUsed) fetchQuota();
// // // // // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // // // // //   }, [API_BASE]);

// // // // // // //   const finalLimit = useMemo(() => {
// // // // // // //     return serverLimit && serverLimit > 0 ? serverLimit : 100000;
// // // // // // //   }, [serverLimit]);

// // // // // // //   const finalUsed = useMemo(() => {
// // // // // // //     return serverUsed && serverUsed >= 0 ? serverUsed : 0;
// // // // // // //   }, [serverUsed]);

// // // // // // //   const finalRemaining = Math.max(0, finalLimit - finalUsed);
// // // // // // //   const progress = Math.max(0, Math.min(1, finalUsed / finalLimit));
// // // // // // //   const dashOffset = circumference - progress * circumference;

// // // // // // //   return (
// // // // // // //     <div className={`flex justify-center mb-8 ${className}`}>
// // // // // // //       <div
// // // // // // //         className="relative p-6"
// // // // // // //         style={{
// // // // // // //           backgroundColor: "#121213",
// // // // // // //           borderRadius: 16,
// // // // // // //           boxShadow: "0 8px 24px rgba(0,0,0,.6)",
// // // // // // //           minWidth: 320,
// // // // // // //         }}
// // // // // // //       >
// // // // // // //         <div className="flex items-center gap-4">
// // // // // // //           {/* Circle */}
// // // // // // //           <div className="relative w-24 h-24">
// // // // // // //             <svg
// // // // // // //               className="w-24 h-24 -rotate-90"
// // // // // // //               viewBox="0 0 100 100"
// // // // // // //               aria-hidden="true"
// // // // // // //             >
// // // // // // //               <defs>
// // // // // // //                 <linearGradient
// // // // // // //                   id="tokenGradient"
// // // // // // //                   x1="0%"
// // // // // // //                   y1="0%"
// // // // // // //                   x2="100%"
// // // // // // //                   y2="0%"
// // // // // // //                 >
// // // // // // //                   <stop offset="0%" stopColor="#1A73E8" />
// // // // // // //                   <stop offset="100%" stopColor="#FF14EF" />
// // // // // // //                 </linearGradient>
// // // // // // //               </defs>

// // // // // // //               {/* Track */}
// // // // // // //               <circle
// // // // // // //                 cx="50"
// // // // // // //                 cy="50"
// // // // // // //                 r={r}
// // // // // // //                 stroke="rgba(30, 174, 219, 0.2)"
// // // // // // //                 strokeWidth="8"
// // // // // // //                 fill="none"
// // // // // // //               />
// // // // // // //               {/* Progress */}
// // // // // // //               <circle
// // // // // // //                 cx="50"
// // // // // // //                 cy="50"
// // // // // // //                 r={r}
// // // // // // //                 stroke="url(#tokenGradient)"
// // // // // // //                 strokeWidth="8"
// // // // // // //                 fill="none"
// // // // // // //                 strokeLinecap="round"
// // // // // // //                 strokeDasharray={circumference}
// // // // // // //                 strokeDashoffset={dashOffset}
// // // // // // //               />
// // // // // // //             </svg>

// // // // // // //             <div className="absolute inset-0 flex items-center justify-center">
// // // // // // //               <span className="text-2xl font-bold text-white">
// // // // // // //                 {isLoading ? "…" : finalUsed.toLocaleString()}
// // // // // // //               </span>
// // // // // // //             </div>
// // // // // // //           </div>

// // // // // // //           {/* Side info */}
// // // // // // //           <div className="text-white">
// // // // // // //             <div className="flex items-center gap-4 mb-2">
// // // // // // //               <div className="flex items-center gap-2">
// // // // // // //                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
// // // // // // //                 <span className="text-sm text-gray-400">Used</span>
// // // // // // //                 <span className="font-bold">
// // // // // // //                   {isLoading ? "…" : finalUsed.toLocaleString()}
// // // // // // //                 </span>
// // // // // // //               </div>
// // // // // // //               <div className="flex items-center gap-2">
// // // // // // //                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
// // // // // // //                 <span className="text-sm text-gray-400">Limit</span>
// // // // // // //                 <span className="font-bold">
// // // // // // //                   {isLoading ? "…" : finalLimit.toLocaleString()}
// // // // // // //                 </span>
// // // // // // //               </div>
// // // // // // //             </div>

// // // // // // //             <p className="text-sm font-bold">
// // // // // // //               {isLoading
// // // // // // //                 ? "Loading…"
// // // // // // //                 : `${finalRemaining.toLocaleString()} tokens remaining`}
// // // // // // //             </p>

// // // // // // //             <div className="mt-3 flex items-center gap-2">
// // // // // // //               <button
// // // // // // //                 type="button"
// // // // // // //                 onClick={fetchQuota}
// // // // // // //                 className="px-3 py-1 rounded-lg text-sm bg-[#1A73E8] hover:opacity-90 transition"
// // // // // // //                 disabled={isLoading}
// // // // // // //                 title="Refresh usage"
// // // // // // //               >
// // // // // // //                 {isLoading ? "Refreshing…" : "Refresh"}
// // // // // // //               </button>
// // // // // // //               {err && (
// // // // // // //                 <span className="text-xs text-red-400">({err})</span>
// // // // // // //               )}
// // // // // // //             </div>
// // // // // // //           </div>
// // // // // // //         </div>
// // // // // // //       </div>
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default TokenUsageSection;


// // // // // // import React, { useEffect, useMemo, useState } from "react";
// // // // // // import { useAuth } from "@/contexts/AuthContext";

// // // // // // type Props = {
// // // // // //   className?: string;
// // // // // // };

// // // // // // type QuotaApiResponse =
// // // // // //   | {
// // // // // //       success: boolean;
// // // // // //       user?: any;
// // // // // //       monthlyTokensCap?: number;
// // // // // //       monthlyTokensUsed?: number;
// // // // // //       monthlyTokensRemaining?: number;
// // // // // //     }
// // // // // //   | { success: false; error: string };

// // // // // // const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// // // // // // const TokenUsageSection: React.FC<Props> = ({ className = "" }) => {
// // // // // //   const { user, token: ctxToken } = useAuth?.() || ({} as any);

// // // // // //   // initial values from login/signup
// // // // // //   const [serverUsed, setServerUsed] = useState<number | null>(
// // // // // //     user?.monthlyTokensUsed ?? null
// // // // // //   );
// // // // // //   const [serverLimit, setServerLimit] = useState<number | null>(
// // // // // //     user?.monthlyTokensCap ?? null
// // // // // //   );
// // // // // //   const [isLoading, setIsLoading] = useState(false);
// // // // // //   const [err, setErr] = useState<string | null>(null);

// // // // // //   const r = 45;
// // // // // //   const circumference = 2 * Math.PI * r;

// // // // // //   async function fetchQuota() {
// // // // // //     setIsLoading(true);
// // // // // //     setErr(null);
// // // // // //     try {
// // // // // //       const localToken =
// // // // // //         typeof window !== "undefined" ? localStorage.getItem("token") : null;
// // // // // //       const authHeader =
// // // // // //         ctxToken || localToken
// // // // // //           ? { Authorization: `Bearer ${ctxToken || localToken}` }
// // // // // //           : {};

// // // // // //       const res = await fetch(`${API_BASE}/api/quota`, {
// // // // // //         method: "GET",
// // // // // //         headers: {
// // // // // //           "Content-Type": "application/json",
// // // // // //           ...authHeader,
// // // // // //         },
// // // // // //         credentials: "include",
// // // // // //       });

// // // // // //       if (!res.ok) {
// // // // // //         const text = await res.text().catch(() => "");
// // // // // //         throw new Error(text || `HTTP ${res.status}`);
// // // // // //       }

// // // // // //       const data: QuotaApiResponse = await res.json();
// // // // // //       if (!("success" in data) || !data.success) {
// // // // // //         throw new Error(("error" in data && data.error) || "unknown_error");
// // // // // //       }

// // // // // //       const u = (data as any)?.user || {};
// // // // // //       setServerUsed(
// // // // // //         Number.isFinite(u.monthlyTokensUsed) ? u.monthlyTokensUsed : null
// // // // // //       );
// // // // // //       setServerLimit(
// // // // // //         Number.isFinite(u.monthlyTokensCap) ? u.monthlyTokensCap : null
// // // // // //       );
// // // // // //     } catch (e: any) {
// // // // // //       setErr(e?.message || "Failed to fetch quota");
// // // // // //     } finally {
// // // // // //       setIsLoading(false);
// // // // // //     }
// // // // // //   }

// // // // // //   useEffect(() => {
// // // // // //     // fetch immediately on mount
// // // // // //     fetchQuota();

// // // // // //     // auto refresh every 30s
// // // // // //     const interval = setInterval(fetchQuota, 30000);

// // // // // //     return () => clearInterval(interval);
// // // // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // // // //   }, [API_BASE]);

// // // // // //   const finalLimit = useMemo(() => {
// // // // // //     return serverLimit && serverLimit > 0 ? serverLimit : 100000;
// // // // // //   }, [serverLimit]);

// // // // // //   const finalUsed = useMemo(() => {
// // // // // //     return serverUsed && serverUsed >= 0 ? serverUsed : 0;
// // // // // //   }, [serverUsed]);

// // // // // //   const finalRemaining = Math.max(0, finalLimit - finalUsed);
// // // // // //   const progress = Math.max(0, Math.min(1, finalUsed / finalLimit));
// // // // // //   const dashOffset = circumference - progress * circumference;

// // // // // //   return (
// // // // // //     <div className={`flex justify-center mb-8 ${className}`}>
// // // // // //       <div
// // // // // //         className="relative p-6"
// // // // // //         style={{
// // // // // //           backgroundColor: "#121213",
// // // // // //           borderRadius: 16,
// // // // // //           boxShadow: "0 8px 24px rgba(0,0,0,.6)",
// // // // // //           minWidth: 320,
// // // // // //         }}
// // // // // //       >
// // // // // //         <div className="flex items-center gap-4">
// // // // // //           {/* Circle */}
// // // // // //           <div className="relative w-24 h-24">
// // // // // //             <svg
// // // // // //               className="w-24 h-24 -rotate-90"
// // // // // //               viewBox="0 0 100 100"
// // // // // //               aria-hidden="true"
// // // // // //             >
// // // // // //               <defs>
// // // // // //                 <linearGradient
// // // // // //                   id="tokenGradient"
// // // // // //                   x1="0%"
// // // // // //                   y1="0%"
// // // // // //                   x2="100%"
// // // // // //                   y2="0%"
// // // // // //                 >
// // // // // //                   <stop offset="0%" stopColor="#1A73E8" />
// // // // // //                   <stop offset="100%" stopColor="#FF14EF" />
// // // // // //                 </linearGradient>
// // // // // //               </defs>

// // // // // //               {/* Track */}
// // // // // //               <circle
// // // // // //                 cx="50"
// // // // // //                 cy="50"
// // // // // //                 r={r}
// // // // // //                 stroke="rgba(30, 174, 219, 0.2)"
// // // // // //                 strokeWidth="8"
// // // // // //                 fill="none"
// // // // // //               />
// // // // // //               {/* Progress */}
// // // // // //               <circle
// // // // // //                 cx="50"
// // // // // //                 cy="50"
// // // // // //                 r={r}
// // // // // //                 stroke="url(#tokenGradient)"
// // // // // //                 strokeWidth="8"
// // // // // //                 fill="none"
// // // // // //                 strokeLinecap="round"
// // // // // //                 strokeDasharray={circumference}
// // // // // //                 strokeDashoffset={dashOffset}
// // // // // //               />
// // // // // //             </svg>

// // // // // //             <div className="absolute inset-0 flex items-center justify-center">
// // // // // //               <span className="text-2xl font-bold text-white">
// // // // // //                 {isLoading ? "…" : finalUsed.toLocaleString()}
// // // // // //               </span>
// // // // // //             </div>
// // // // // //           </div>

// // // // // //           {/* Side info */}
// // // // // //           <div className="text-white">
// // // // // //             <div className="flex items-center gap-4 mb-2">
// // // // // //               <div className="flex items-center gap-2">
// // // // // //                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
// // // // // //                 <span className="text-sm text-gray-400">Used</span>
// // // // // //                 <span className="font-bold">
// // // // // //                   {isLoading ? "…" : finalUsed.toLocaleString()}
// // // // // //                 </span>
// // // // // //               </div>
// // // // // //               <div className="flex items-center gap-2">
// // // // // //                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
// // // // // //                 <span className="text-sm text-gray-400">Limit</span>
// // // // // //                 <span className="font-bold">
// // // // // //                   {isLoading ? "…" : finalLimit.toLocaleString()}
// // // // // //                 </span>
// // // // // //               </div>
// // // // // //             </div>

// // // // // //             <p className="text-sm font-bold">
// // // // // //               {isLoading
// // // // // //                 ? "Loading…"
// // // // // //                 : `${finalRemaining.toLocaleString()} tokens remaining`}
// // // // // //             </p>

// // // // // //             <div className="mt-3 flex items-center gap-2">
// // // // // //               <button
// // // // // //                 type="button"
// // // // // //                 onClick={fetchQuota}
// // // // // //                 className="px-3 py-1 rounded-lg text-sm bg-[#1A73E8] hover:opacity-90 transition"
// // // // // //                 disabled={isLoading}
// // // // // //                 title="Refresh usage"
// // // // // //               >
// // // // // //                 {isLoading ? "Refreshing…" : "Refresh"}
// // // // // //               </button>
// // // // // //               {err && (
// // // // // //                 <span className="text-xs text-red-400">({err})</span>
// // // // // //               )}
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // export default TokenUsageSection;


// // // // // import React, { useMemo, useState } from "react";
// // // // // import { useAuth } from "@/contexts/AuthContext";

// // // // // type Props = {
// // // // //   className?: string;
// // // // // };

// // // // // const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// // // // // const TokenUsageSection: React.FC<Props> = ({ className = "" }) => {
// // // // // const { user, token: ctxToken, persistAuth } = useAuth();


// // // // //   const [isLoading, setIsLoading] = useState(false);
// // // // //   const [err, setErr] = useState<string | null>(null);

// // // // //   const r = 45;
// // // // //   const circumference = 2 * Math.PI * r;

// // // // //   async function fetchQuota() {
// // // // //     setIsLoading(true);
// // // // //     setErr(null);
// // // // //     try {
// // // // //       const localToken =
// // // // //         typeof window !== "undefined" ? localStorage.getItem("token") : null;
// // // // //       const authHeader =
// // // // //         ctxToken || localToken
// // // // //           ? { Authorization: `Bearer ${ctxToken || localToken}` }
// // // // //           : {};

// // // // //       const res = await fetch(`${API_BASE}/api/quota`, {
// // // // //         method: "GET",
// // // // //         headers: {
// // // // //           "Content-Type": "application/json",
// // // // //           ...authHeader,
// // // // //         },
// // // // //         credentials: "include",
// // // // //       });

// // // // //      const data = await res.json();
// // // // // if (data?.success && data.user) {
// // // // //   // 👇 Update AuthContext so UI refreshes
// // // // //   persistAuth({ user: data.user });
// // // // // }


// // // // //       // 🔑 Instead of local state, just let persistAuth update user in context.
// // // // //       // No manual setServerUsed/setServerLimit anymore.
// // // // //     } catch (e: any) {
// // // // //       setErr(e?.message || "Failed to fetch quota");
// // // // //     } finally {
// // // // //       setIsLoading(false);
// // // // //     }
// // // // //   }

// // // // //   // --- Directly bind to AuthContext.user ---
// // // // //      const finalLimit = useMemo(() => {
// // // // //   return typeof user?.monthlyTokensCap === "number"
// // // // //     ? user.monthlyTokensCap
// // // // //     : 0;  // better default
// // // // // }, [user?.monthlyTokensCap]);

// // // // // const finalUsed = useMemo(() => {
// // // // //   return typeof user?.monthlyTokensUsed === "number"
// // // // //     ? user.monthlyTokensUsed
// // // // //     : 0;
// // // // // }, [user?.monthlyTokensUsed]);


// // // // //   const finalRemaining = Math.max(0, finalLimit - finalUsed);
// // // // //   const progress = Math.max(0, Math.min(1, finalUsed / finalLimit));
// // // // //   const dashOffset = circumference - progress * circumference;

// // // // //   return (
// // // // //     <div className={`flex justify-center mb-8 ${className}`}>
// // // // //       <div
// // // // //         className="relative p-6"
// // // // //         style={{
// // // // //           backgroundColor: "#121213",
// // // // //           borderRadius: 16,
// // // // //           boxShadow: "0 8px 24px rgba(0,0,0,.6)",
// // // // //           minWidth: 320,
// // // // //         }}
// // // // //       >
// // // // //         <div className="flex items-center gap-4">
// // // // //           {/* Circle */}
// // // // //           <div className="relative w-24 h-24">
// // // // //             <svg
// // // // //               className="w-24 h-24 -rotate-90"
// // // // //               viewBox="0 0 100 100"
// // // // //               aria-hidden="true"
// // // // //             >
// // // // //               <defs>
// // // // //                 <linearGradient
// // // // //                   id="tokenGradient"
// // // // //                   x1="0%"
// // // // //                   y1="0%"
// // // // //                   x2="100%"
// // // // //                   y2="0%"
// // // // //                 >
// // // // //                   <stop offset="0%" stopColor="#1A73E8" />
// // // // //                   <stop offset="100%" stopColor="#FF14EF" />
// // // // //                 </linearGradient>
// // // // //               </defs>

// // // // //               <circle
// // // // //                 cx="50"
// // // // //                 cy="50"
// // // // //                 r={r}
// // // // //                 stroke="rgba(30, 174, 219, 0.2)"
// // // // //                 strokeWidth="8"
// // // // //                 fill="none"
// // // // //               />
// // // // //               <circle
// // // // //                 cx="50"
// // // // //                 cy="50"
// // // // //                 r={r}
// // // // //                 stroke="url(#tokenGradient)"
// // // // //                 strokeWidth="8"
// // // // //                 fill="none"
// // // // //                 strokeLinecap="round"
// // // // //                 strokeDasharray={circumference}
// // // // //                 strokeDashoffset={dashOffset}
// // // // //               />
// // // // //             </svg>

// // // // //             <div className="absolute inset-0 flex items-center justify-center">
// // // // //               <span className="text-2xl font-bold text-white">
// // // // //                 {isLoading ? "…" : finalUsed.toLocaleString()}
// // // // //               </span>
// // // // //             </div>
// // // // //           </div>

// // // // //           {/* Side info */}
// // // // //           <div className="text-white">
// // // // //             <div className="flex items-center gap-4 mb-2">
// // // // //               <div className="flex items-center gap-2">
// // // // //                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
// // // // //                 <span className="text-sm text-gray-400">Used</span>
// // // // //                 <span className="font-bold">
// // // // //                   {isLoading ? "…" : finalUsed.toLocaleString()}
// // // // //                 </span>
// // // // //               </div>
// // // // //               <div className="flex items-center gap-2">
// // // // //                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
// // // // //                 <span className="text-sm text-gray-400">Limit</span>
// // // // //                 <span className="font-bold">
// // // // //                   {isLoading ? "…" : finalLimit.toLocaleString()}
// // // // //                 </span>
// // // // //               </div>
// // // // //             </div>

// // // // //             <p className="text-sm font-bold">
// // // // //               {isLoading
// // // // //                 ? "Loading…"
// // // // //                 : `${finalRemaining.toLocaleString()} tokens remaining`}
// // // // //             </p>

// // // // //             <div className="mt-3 flex items-center gap-2">
// // // // //               <button
// // // // //                 type="button"
// // // // //                 onClick={fetchQuota}
// // // // //                 className="px-3 py-1 rounded-lg text-sm bg-[#1A73E8] hover:opacity-90 transition"
// // // // //                 disabled={isLoading}
// // // // //               >
// // // // //                 {isLoading ? "Refreshing…" : "Refresh"}
// // // // //               </button>
// // // // //               {err && <span className="text-xs text-red-400">({err})</span>}
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default TokenUsageSection;


// // // // import React, { useMemo, useState } from "react";
// // // // import { useAuth } from "@/contexts/AuthContext";

// // // // type Props = { className?: string };
// // // // const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// // // // const TokenUsageSection: React.FC<Props> = ({ className = "" }) => {
// // // //   const { user, token: ctxToken, persistAuth } = useAuth();
// // // //   const [isLoading, setIsLoading] = useState(false);
// // // //   const [err, setErr] = useState<string | null>(null);

// // // //   const r = 45;
// // // //   const circumference = 2 * Math.PI * r;

// // // //   // Choose which numbers to show:
// // // //   const isOrg = user?.userType === "ORG";
// // // //   const limit = useMemo(() => {
// // // //     if (isOrg && typeof user?.orgPoolCap === "number") return user.orgPoolCap;
// // // //     return typeof user?.monthlyTokensCap === "number" ? user.monthlyTokensCap : 0;
// // // //   }, [isOrg, user?.orgPoolCap, user?.monthlyTokensCap]);

// // // //   const used = useMemo(() => {
// // // //     if (isOrg && typeof user?.orgPoolUsed === "number") return user.orgPoolUsed;
// // // //     return typeof user?.monthlyTokensUsed === "number" ? user.monthlyTokensUsed : 0;
// // // //   }, [isOrg, user?.orgPoolUsed, user?.monthlyTokensUsed]);

// // // //   const remaining = Math.max(0, limit - used);
// // // //   const progress = limit > 0 ? Math.max(0, Math.min(1, used / limit)) : 0;
// // // //   const dashOffset = circumference - progress * circumference;

// // // //   async function fetchQuota() {
// // // //     setIsLoading(true);
// // // //     setErr(null);
// // // //     try {
// // // //       const localToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
// // // //       const authHeader =
// // // //         ctxToken || localToken ? { Authorization: `Bearer ${ctxToken || localToken}` } : {};

// // // //       const res = await fetch(`${API_BASE}/api/quota`, {
// // // //         method: "GET",
// // // //         headers: { "Content-Type": "application/json", ...authHeader },
// // // //         credentials: "include",
// // // //       });

// // // //       const data = await res.json();
// // // //       if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to fetch quota");

// // // //       // Merge ORG pool (if present) onto the stored user so UI updates
// // // //       const mergedUser = {
// // // //         ...(data.user || {}),
// // // //         ...(data.org
// // // //           ? {
// // // //               orgId: data.org._id ?? data.user?.orgId,
// // // //               plan: data.org.plan ?? data.user?.plan,
// // // //               orgPoolCap: data.org.orgPoolCap,
// // // //               orgPoolUsed: data.org.orgPoolUsed,
// // // //               orgExtraTokensRemaining: data.org.orgExtraTokensRemaining,
// // // //             }
// // // //           : {}),
// // // //       };

// // // //       persistAuth({ user: mergedUser });
// // // //     } catch (e: any) {
// // // //       setErr(e?.message || "Failed to fetch quota");
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   }

// // // //   return (
// // // //     <div className={`flex justify-center mb-8 ${className}`}>
// // // //       <div
// // // //         className="relative p-6"
// // // //         style={{
// // // //           backgroundColor: "#121213",
// // // //           borderRadius: 16,
// // // //           boxShadow: "0 8px 24px rgba(0,0,0,.6)",
// // // //           minWidth: 320,
// // // //         }}
// // // //       >
// // // //         <div className="flex items-center gap-4">
// // // //           {/* Circle */}
// // // //           <div className="relative w-24 h-24">
// // // //             <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
// // // //               <defs>
// // // //                 <linearGradient id="tokenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
// // // //                   <stop offset="0%" stopColor="#1A73E8" />
// // // //                   <stop offset="100%" stopColor="#FF14EF" />
// // // //                 </linearGradient>
// // // //               </defs>

// // // //               <circle cx="50" cy="50" r={r} stroke="rgba(30, 174, 219, 0.2)" strokeWidth="8" fill="none" />
// // // //               <circle
// // // //                 cx="50"
// // // //                 cy="50"
// // // //                 r={r}
// // // //                 stroke="url(#tokenGradient)"
// // // //                 strokeWidth="8"
// // // //                 fill="none"
// // // //                 strokeLinecap="round"
// // // //                 strokeDasharray={circumference}
// // // //                 strokeDashoffset={dashOffset}
// // // //               />
// // // //             </svg>

// // // //             <div className="absolute inset-0 flex items-center justify-center">
// // // //               <span className="text-2xl font-bold text-white">
// // // //                 {isLoading ? "…" : used.toLocaleString()}
// // // //               </span>
// // // //             </div>
// // // //           </div>

// // // //           {/* Side info */}
// // // //           <div className="text-white">
// // // //             <div className="text-xs text-gray-400 mb-1">
// // // //               {isOrg ? "Organization pool" : "Individual tokens"}
// // // //             </div>

// // // //             <div className="flex items-center gap-4 mb-2">
// // // //               <div className="flex items-center gap-2">
// // // //                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
// // // //                 <span className="text-sm text-gray-400">Used</span>
// // // //                 <span className="font-bold">{isLoading ? "…" : used.toLocaleString()}</span>
// // // //               </div>
// // // //               <div className="flex items-center gap-2">
// // // //                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
// // // //                 <span className="text-sm text-gray-400">Limit</span>
// // // //                 <span className="font-bold">{isLoading ? "…" : limit.toLocaleString()}</span>
// // // //               </div>
// // // //             </div>

// // // //             <p className="text-sm font-bold">
// // // //               {isLoading ? "Loading…" : `${remaining.toLocaleString()} tokens remaining`}
// // // //             </p>

// // // //             <div className="mt-3 flex items-center gap-2">
// // // //               <button
// // // //                 type="button"
// // // //                 onClick={fetchQuota}
// // // //                 className="px-3 py-1 rounded-lg text-sm bg-[#1A73E8] hover:opacity-90 transition"
// // // //                 disabled={isLoading}
// // // //               >
// // // //                 {isLoading ? "Refreshing…" : "Refresh"}
// // // //               </button>
// // // //               {err && <span className="text-xs text-red-400">({err})</span>}
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default TokenUsageSection;

// // // import React, { useEffect, useMemo, useState } from "react";
// // // import { useAuth } from "@/contexts/AuthContext";

// // // type Props = { className?: string };

// // // const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// // // const TokenUsageSection: React.FC<Props> = ({ className = "" }) => {
// // //   const { user, token: ctxToken, persistAuth } = useAuth();

// // //   const [isLoading, setIsLoading] = useState(false);
// // //   const [err, setErr] = useState<string | null>(null);

// // //   const r = 45;
// // //   const circumference = 2 * Math.PI * r;

// // //   // Pull latest quota (will also hydrate org snapshot into the user)
// // //   async function fetchQuota() {
// // //     setIsLoading(true);
// // //     setErr(null);
// // //     try {
// // //       const localToken =
// // //         typeof window !== "undefined" ? localStorage.getItem("token") : null;
// // //       const authHeader =
// // //         ctxToken || localToken
// // //           ? { Authorization: `Bearer ${ctxToken || localToken}` }
// // //           : {};

// // //       const res = await fetch(`${API_BASE}/api/quota`, {
// // //         method: "GET",
// // //         headers: { "Content-Type": "application/json", ...authHeader },
// // //         credentials: "include",
// // //       });

// // //       const data = await res.json();

// // //       // Merge IND updates (if server sent user)
// // //       let merged = data?.user || null;

// // //       // Merge ORG snapshot (server may send `organization` or `org`)
// // //       const org = data?.organization || data?.org;
// // //       if (merged && org) {
// // //         merged = {
// // //           ...merged,
// // //           plan: org.plan ?? merged.plan,
// // //           billingCycle: org.billingCycle ?? merged.billingCycle,
// // //           currentPeriodEnd: org.currentPeriodEnd ?? merged.currentPeriodEnd,

// // //           // ORG pool fields that UI reads:
// // //           orgPoolCap: org.orgPoolCap,
// // //           orgPoolUsed: org.orgPoolUsed,
// // //           orgExtraTokensRemaining: org.orgExtraTokensRemaining ?? 0,

// // //           // make sure orgId stays filled
// // //           orgId: merged.orgId ?? org._id,
// // //         };
// // //       }

// // //       if (merged) persistAuth({ user: merged }); // <- updates context + localStorage
// // //     } catch (e: any) {
// // //       setErr(e?.message || "Failed to fetch quota");
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   }

// // //   // Optional: auto-hydrate on mount
// // //   useEffect(() => {
// // //     fetchQuota();
// // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // //   }, []);

// // //   // Decide which counters to show
  
// // //   const isOrg =
// // //   (user?.userType === "ORG" || user?.role === "Owner" || user?.orgId) &&
// // //   (user?.plan === "enterprise" || typeof (user as any)?.orgPoolCap === "number");

// // // const finalLimit = isOrg ? (user as any)?.orgPoolCap ?? 0 : user?.monthlyTokensCap ?? 0;
// // // const finalUsed  = isOrg ? (user as any)?.orgPoolUsed ?? 0 : user?.monthlyTokensUsed ?? 0;

// // //   const finalRemaining = Math.max(0, finalLimit - finalUsed);
// // //   const progress = Math.max(0, Math.min(1, finalLimit ? finalUsed / finalLimit : 0));
// // //   const dashOffset = circumference - progress * circumference;

// // //   return (
// // //     <div className={`flex justify-center mb-8 ${className}`}>
// // //       <div
// // //         className="relative p-6"
// // //         style={{
// // //           backgroundColor: "#121213",
// // //           borderRadius: 16,
// // //           boxShadow: "0 8px 24px rgba(0,0,0,.6)",
// // //           minWidth: 320,
// // //         }}
// // //       >
// // //         <div className="text-white mb-3">
// // //           <div className="text-xs opacity-70">
// // //             {isOrg ? "Organization Pool" : "Individual Tokens"}
// // //           </div>
// // //           <div className="text-sm opacity-60">
// // //             {isOrg
// // //               ? `Plan: Enterprise • Cycle: ${user?.billingCycle ?? "-"}`
// // //               : `Plan: ${user?.plan ?? "-"} • Cycle: ${user?.billingCycle ?? "-"}`}
// // //           </div>
// // //         </div>

// // //         <div className="flex items-center gap-4">
// // //           {/* Ring */}
// // //           <div className="relative w-24 h-24">
// // //             <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
// // //               <defs>
// // //                 <linearGradient id="tokenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
// // //                   <stop offset="0%" stopColor="#1A73E8" />
// // //                   <stop offset="100%" stopColor="#FF14EF" />
// // //                 </linearGradient>
// // //               </defs>
// // //               <circle
// // //                 cx="50"
// // //                 cy="50"
// // //                 r={r}
// // //                 stroke="rgba(30, 174, 219, 0.2)"
// // //                 strokeWidth="8"
// // //                 fill="none"
// // //               />
// // //               <circle
// // //                 cx="50"
// // //                 cy="50"
// // //                 r={r}
// // //                 stroke="url(#tokenGradient)"
// // //                 strokeWidth="8"
// // //                 fill="none"
// // //                 strokeLinecap="round"
// // //                 strokeDasharray={circumference}
// // //                 strokeDashoffset={dashOffset}
// // //               />
// // //             </svg>
// // //             <div className="absolute inset-0 flex items-center justify-center">
// // //               <span className="text-2xl font-bold text-white">
// // //                 {isLoading ? "…" : finalUsed.toLocaleString()}
// // //               </span>
// // //             </div>
// // //           </div>

// // //           {/* Side info */}
// // //           <div className="text-white">
// // //             <div className="flex items-center gap-4 mb-2">
// // //               <div className="flex items-center gap-2">
// // //                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
// // //                 <span className="text-sm text-gray-400">Used</span>
// // //                 <span className="font-bold">
// // //                   {isLoading ? "…" : finalUsed.toLocaleString()}
// // //                 </span>
// // //               </div>
// // //               <div className="flex items-center gap-2">
// // //                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
// // //                 <span className="text-sm text-gray-400">Limit</span>
// // //                 <span className="font-bold">
// // //                   {isLoading ? "…" : finalLimit.toLocaleString()}
// // //                 </span>
// // //               </div>
// // //             </div>

// // //             <p className="text-sm font-bold">
// // //               {isLoading ? "Loading…" : `${finalRemaining.toLocaleString()} tokens remaining`}
// // //             </p>

// // //             <div className="mt-3 flex items-center gap-2">
// // //               <button
// // //                 type="button"
// // //                 onClick={fetchQuota}
// // //                 className="px-3 py-1 rounded-lg text-sm bg-[#1A73E8] hover:opacity-90 transition"
// // //                 disabled={isLoading}
// // //               >
// // //                 {isLoading ? "Refreshing…" : "Refresh"}
// // //               </button>
// // //               {err && <span className="text-xs text-red-400">({err})</span>}
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default TokenUsageSection;


// // // src/components/TokenUsageSection.tsx
// // import React, { useEffect, useMemo, useState } from "react";
// // import { useAuth } from "@/contexts/AuthContext";

// // type Props = { className?: string };
// // const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// // const TokenUsageSection: React.FC<Props> = ({ className = "" }) => {
// //   const { user, token: ctxToken, persistAuth } = useAuth();
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [err, setErr] = useState<string | null>(null);

// //   const r = 45;
// //   const circumference = 2 * Math.PI * r;

// //   async function fetchQuota() {
// //     setIsLoading(true);
// //     setErr(null);
// //     try {
// //       const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
// //       const authHeader =
// //         ctxToken || storedToken ? { Authorization: `Bearer ${ctxToken || storedToken}` } : {};

// //       const res = await fetch(`${API_BASE}/api/quota`, {
// //         method: "GET",
// //         headers: { "Content-Type": "application/json", ...authHeader },
// //         credentials: "include",
// //       });
// //       const data = await res.json();

// //       const apiUser = data?.user || null;
// //       const org = data?.organization || data?.org || null;

// //       if (apiUser || org) {
// //         const merged = {
// //           ...(user || {}),
// //           ...(apiUser || {}),
// //           ...(org
// //             ? {
// //                 plan: org.plan ?? user?.plan,
// //                 billingCycle: org.billingCycle ?? user?.billingCycle,
// //                 currentPeriodEnd: org.currentPeriodEnd ?? user?.currentPeriodEnd,
// //                 orgPoolCap: org.orgPoolCap,
// //                 orgPoolUsed: org.orgPoolUsed,
// //                 orgExtraTokensRemaining: org.orgExtraTokensRemaining ?? 0,
// //                 orgId: user?.orgId ?? org._id,
// //               }
// //             : {}),
// //         };
// //         persistAuth({ user: merged });
// //       }
// //     } catch (e: any) {
// //       setErr(e?.message || "Failed to fetch quota");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   }

// //   useEffect(() => {
// //     fetchQuota();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   const isOrg = useMemo(() => {
// //     const hasOrgId = !!user?.orgId || user?.userType === "ORG" || user?.role === "Owner";
// //     const hasOrgPool = typeof (user as any)?.orgPoolCap === "number";
// //     const isEnterprise = user?.plan === "enterprise";
// //     return hasOrgId && (hasOrgPool || isEnterprise);
// //   }, [user]);

// //   const finalLimit = useMemo(
// //     () => (isOrg ? (user as any)?.orgPoolCap ?? 0 : user?.monthlyTokensCap ?? 0),
// //     [isOrg, user]
// //   );
// //   const finalUsed = useMemo(
// //     () => (isOrg ? (user as any)?.orgPoolUsed ?? 0 : user?.monthlyTokensUsed ?? 0),
// //     [isOrg, user]
// //   );

// //   const remaining = Math.max(0, finalLimit - finalUsed);
// //   const progress = finalLimit > 0 ? Math.max(0, Math.min(1, finalUsed / finalLimit)) : 0;
// //   const dashOffset = circumference - progress * circumference;

// //   return (
// //     <div className={`flex justify-center mb-8 ${className}`}>
// //       <div
// //         className="relative p-6"
// //         style={{
// //           backgroundColor: "#121213",
// //           borderRadius: 16,
// //           boxShadow: "0 8px 24px rgba(0,0,0,.6)",
// //           minWidth: 320,
// //         }}
// //       >
// //         {/* Removed header text block */}

// //         <div className="flex items-center gap-4">
// //           {/* Ring */}
// //           <div className="relative w-24 h-24">
// //             <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
// //               <defs>
// //                 <linearGradient id="tokenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
// //                   <stop offset="0%" stopColor="#1A73E8" />
// //                   <stop offset="100%" stopColor="#FF14EF" />
// //                 </linearGradient>
// //               </defs>
// //               <circle cx="50" cy="50" r={r} stroke="rgba(30, 174, 219, 0.2)" strokeWidth="8" fill="none" />
// //               <circle
// //                 cx="50"
// //                 cy="50"
// //                 r={r}
// //                 stroke="url(#tokenGradient)"
// //                 strokeWidth="8"
// //                 fill="none"
// //                 strokeLinecap="round"
// //                 strokeDasharray={circumference}
// //                 strokeDashoffset={dashOffset}
// //               />
// //             </svg>
// //             <div className="absolute inset-0 flex items-center justify-center">
// //               <span className="text-2xl font-bold text-white">
// //                 {isLoading ? "…" : Number(finalUsed || 0).toLocaleString()}
// //               </span>
// //             </div>
// //           </div>

// //           {/* Side info */}
// //           <div className="text-white">
// //             <div className="flex items-center gap-4 mb-2">
// //               <div className="flex items-center gap-2">
// //                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
// //                 <span className="text-sm text-gray-400">Used</span>
// //                 <span className="font-bold">{isLoading ? "…" : Number(finalUsed || 0).toLocaleString()}</span>
// //               </div>
// //               <div className="flex items-center gap-2">
// //                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
// //                 <span className="text-sm text-gray-400">Limit</span>
// //                 <span className="font-bold">{isLoading ? "…" : Number(finalLimit || 0).toLocaleString()}</span>
// //               </div>
// //             </div>

// //             <p className="text-sm font-bold">
// //               {isLoading ? "Loading…" : `${Number(remaining || 0).toLocaleString()} tokens remaining`}
// //             </p>

// //             <div className="mt-3 flex items-center gap-2">
// //               <button
// //                 type="button"
// //                 onClick={fetchQuota}
// //                 className="px-3 py-1 rounded-lg text-sm bg-[#1A73E8] hover:opacity-90 transition"
// //                 disabled={isLoading}
// //               >
// //                 {isLoading ? "Refreshing…" : "Refresh"}
// //               </button>
// //               {err && <span className="text-xs text-red-400">({err})</span>}
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default TokenUsageSection;



// import React, { useEffect, useMemo, useState } from "react";
// import { useAuth } from "@/contexts/AuthContext";
// import { quotaEvents } from "@/lib/quotaEvents";
// type Props = { className?: string };
// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// const TokenUsageSection: React.FC<Props> = ({ className = "" }) => {
//   const { user, token: ctxToken, persistAuth } = useAuth();
//   const [isLoading, setIsLoading] = useState(false);
//   const [err, setErr] = useState<string | null>(null);
//   const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

//   const r = 45;
//   const circumference = 2 * Math.PI * r;
//  async function fetchQuota() {
//   setIsLoading(true);
//   setErr(null);
//   try {
//     const storedToken =
//       typeof window !== "undefined" ? localStorage.getItem("token") : null;
//     const authHeader =
//       ctxToken || storedToken
//         ? { Authorization: `Bearer ${ctxToken || storedToken}` }
//         : {};

//     const res = await fetch(`${API_BASE}/api/quota`, {
//       method: "GET",
//       headers: { "Content-Type": "application/json", ...authHeader },
//       credentials: "include",
//     });

//     const data = await res.json();
//     const apiUser = data?.user || null;
//     const org = data?.organization || data?.org || null;

//     if (apiUser || org) {
//       // ✅ Always prefer fresh backend values — spread user LAST
//       const merged = {
//         ...(apiUser || {}),
//         ...(org
//           ? {
//               plan: org.plan,
//               billingCycle: org.billingCycle,
//               currentPeriodEnd: org.currentPeriodEnd,
//               orgPoolCap: org.orgPoolCap,
//               orgPoolUsed: org.orgPoolUsed,
//               orgExtraTokensRemaining: org.orgExtraTokensRemaining ?? 0,
//               orgId: org._id,
//             }
//           : {}),
//         ...(user || {}), // spread LAST to keep context-specific props (like role) but not overwrite org data
//       };

//       // ✅ Ensure reference changes every time → triggers re-render
//       persistAuth({ user: { ...merged } });
//     }

//     setLastUpdated(new Date());
//   } catch (e: any) {
//     setErr(e?.message || "Failed to fetch quota");
//   } finally {
//     setIsLoading(false);
//   }
// }

// useEffect(() => {
//   // initial + periodic refresh
//   fetchQuota();
//   const interval = setInterval(fetchQuota, 30000);

//   // refresh when tab gains focus
//   const handleFocus = () => fetchQuota();
//   window.addEventListener("focus", handleFocus);

//   // refresh instantly when other modules emit
//   const handleImmediateRefresh = () => fetchQuota();
//   quotaEvents.on(handleImmediateRefresh);

//   return () => {
//     clearInterval(interval);
//     window.removeEventListener("focus", handleFocus);
//     quotaEvents.off(handleImmediateRefresh);
//   };
// }, []);


 
  

//   // 🔁 Refresh again when user returns to the tab
//   useEffect(() => {
//     const handleFocus = () => fetchQuota();
//     window.addEventListener("focus", handleFocus);
//     return () => window.removeEventListener("focus", handleFocus);
//   }, []);

//   const isOrg = useMemo(() => {
//     const hasOrgId = !!user?.orgId || user?.userType === "ORG" || user?.role === "Owner";
//     const hasOrgPool = typeof (user as any)?.orgPoolCap === "number";
//     const isEnterprise = user?.plan === "enterprise";
//     return hasOrgId && (hasOrgPool || isEnterprise);
//   }, [user]);

//   const finalLimit = useMemo(
//     () => (isOrg ? (user as any)?.orgPoolCap ?? 0 : user?.monthlyTokensCap ?? 0),
//     [isOrg, user]
//   );

//   const finalUsed = useMemo(
//     () => (isOrg ? (user as any)?.orgPoolUsed ?? 0 : user?.monthlyTokensUsed ?? 0),
//     [isOrg, user]
//   );

//   const remaining = Math.max(0, finalLimit - finalUsed);
//   const progress = finalLimit > 0 ? Math.max(0, Math.min(1, finalUsed / finalLimit)) : 0;
//   const dashOffset = circumference - progress * circumference;

//   return (
//     <div className={`flex justify-center mb-8 ${className}`}>
//       <div
//         className="relative p-6"
//         style={{
//           backgroundColor: "#121213",
//           borderRadius: 16,
//           boxShadow: "0 8px 24px rgba(0,0,0,.6)",
//           minWidth: 320,
//         }}
//       >
//         <div className="flex items-center gap-4">
//           {/* Circular Ring */}
//           <div className="relative w-24 h-24">
//             <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
//               <defs>
//                 <linearGradient id="tokenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
//                   <stop offset="0%" stopColor="#1A73E8" />
//                   <stop offset="100%" stopColor="#FF14EF" />
//                 </linearGradient>
//               </defs>
//               <circle
//                 cx="50"
//                 cy="50"
//                 r={r}
//                 stroke="rgba(30, 174, 219, 0.2)"
//                 strokeWidth="8"
//                 fill="none"
//               />
//               <circle
//                 cx="50"
//                 cy="50"
//                 r={r}
//                 stroke="url(#tokenGradient)"
//                 strokeWidth="8"
//                 fill="none"
//                 strokeLinecap="round"
//                 strokeDasharray={circumference}
//                 strokeDashoffset={dashOffset}
//               />
//             </svg>
//             <div className="absolute inset-0 flex items-center justify-center">
//               <span className="text-2xl font-bold text-white">
//                 {isLoading ? "…" : Number(finalUsed || 0).toLocaleString()}
//               </span>
//             </div>
//           </div>

//           {/* Side info */}
//           <div className="text-white">
//             <div className="flex items-center gap-4 mb-2">
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
//                 <span className="text-sm text-gray-400">Used</span>
//                 <span className="font-bold">
//                   {isLoading ? "…" : Number(finalUsed || 0).toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
//                 <span className="text-sm text-gray-400">Limit</span>
//                 <span className="font-bold">
//                   {isLoading ? "…" : Number(finalLimit || 0).toLocaleString()}
//                 </span>
//               </div>
//             </div>

//             <p className="text-sm font-bold">
//               {isLoading ? "Loading…" : `${Number(remaining || 0).toLocaleString()} tokens remaining`}
//             </p>

//             {/* ✅ Show last updated time */}
//             {lastUpdated && (
//               <p className="text-xs text-gray-500 mt-2">
//                 Last updated: {lastUpdated.toLocaleTimeString()}
//               </p>
//             )}

//             {/* ✅ Optional error display */}
//             {err && <p className="mt-2 text-xs text-red-400">({err})</p>}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TokenUsageSection;


// src/components/TokenUsageSection.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

type Props = { className?: string };
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TokenUsageSection: React.FC<Props> = ({ className = "" }) => {
  const { user, token: ctxToken, refreshQuota } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const r = 45;
  const circumference = 2 * Math.PI * r;

  async function fetchQuota() {
    setIsLoading(true);
    setErr(null);
    try {
      await refreshQuota(); // Use the centralized refresh function
      setLastUpdated(new Date());
    } catch (e: any) {
      setErr(e?.message || "Failed to fetch quota");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchQuota();
  }, []);

  useEffect(() => {
    const handleFocus = () => fetchQuota();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const isOrg = useMemo(() => {
    const hasOrgId = !!user?.orgId || user?.userType === "ORG" || user?.role === "Owner";
    const hasOrgPool = typeof (user as any)?.orgPoolCap === "number";
    const isEnterprise = user?.plan === "enterprise";
    return hasOrgId && (hasOrgPool || isEnterprise);
  }, [user]);

  const finalLimit = useMemo(
    () => (isOrg ? (user as any)?.orgPoolCap ?? 0 : user?.monthlyTokensCap ?? 0),
    [isOrg, user]
  );

  const finalUsed = useMemo(
    () => (isOrg ? (user as any)?.orgPoolUsed ?? 0 : user?.monthlyTokensUsed ?? 0),
    [isOrg, user]
  );

  // DEBUG: Token change detect
  useEffect(() => {
    if (user) {
      console.log("TokenUsageSection: UI Updated!", {
        used: finalUsed,
        limit: finalLimit,
        remaining: finalLimit - finalUsed,
        time: new Date().toLocaleTimeString(),
      });
    }
  }, [finalUsed, finalLimit]);

  const remaining = Math.max(0, finalLimit - finalUsed);
  const progress = finalLimit > 0 ? Math.max(0, Math.min(1, finalUsed / finalLimit)) : 0;
  const dashOffset = circumference - progress * circumference;

return (
  <div className={`flex justify-center mb-5 sm:mb-8 px-3 ${className}`}>
    <div
      className="relative w-full max-w-sm sm:max-w-none p-4 sm:p-6"
      style={{
        backgroundColor: "#121213",
        borderRadius: 16,
        boxShadow: "0 8px 24px rgba(0,0,0,.6)",
      }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
          <svg
            className="w-20 h-20 sm:w-24 sm:h-24 -rotate-90"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="tokenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1A73E8" />
                <stop offset="100%" stopColor="#FF14EF" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r={r}
              stroke="rgba(30, 174, 219, 0.2)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r={r}
              stroke="url(#tokenGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg sm:text-2xl font-bold text-white">
              {isLoading ? "..." : Number(finalUsed || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="text-white min-w-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
              <span className="text-xs sm:text-sm text-gray-400">Used</span>
              <span className="font-bold text-sm sm:text-base">
                {isLoading ? "..." : Number(finalUsed || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-[#1A73E8] to-[#FF14EF]" />
              <span className="text-xs sm:text-sm text-gray-400">Limit</span>
              <span className="font-bold text-sm sm:text-base">
                {isLoading ? "..." : Number(finalLimit || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-bold leading-snug">
            {isLoading ? "Loading..." : `${Number(remaining || 0).toLocaleString()} tokens remaining`}
          </p>

          {lastUpdated && (
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1 sm:mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}

          {err && <p className="mt-2 text-[11px] sm:text-xs text-red-400">({err})</p>}
        </div>
      </div>
    </div>
  </div>
);
};

export default TokenUsageSection;