// // import { useState, useEffect } from "react";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import { llmService, type LLMProvider } from "@/services/llmService";
// // import { Label } from "@/components/ui/label";

// // interface LLMSelectorProps {
// //   onProviderChange?: (provider: LLMProvider) => void;
// // }

// // const LLMSelector = ({ onProviderChange }: LLMSelectorProps) => {
// //   const [provider, setProvider] = useState<LLMProvider>(llmService.getConfig().provider);

// //   const handleProviderChange = (value: string) => {
// //     const newProvider = value as LLMProvider;
// //     setProvider(newProvider);
// //     llmService.setConfig({ provider: newProvider });
// //     onProviderChange?.(newProvider);
// //   };

// //   useEffect(() => {
// //     setProvider(llmService.getConfig().provider);
// //   }, []);

// //   return (
// //     <div className="space-y-2">
// //       <Label htmlFor="llm-provider" className="text-white">LLM Provider</Label>

// //       <Select value={provider} onValueChange={handleProviderChange}>
// //         <SelectTrigger
// //           id="llm-provider"
// //           className="
// //             h-11 rounded-[12px]
// //             bg-[#121213] text-white
// //             border-0
// //             shadow-none
// //             focus:ring-0 focus:ring-offset-0 focus:outline-none
// //             data-[placeholder]:text-white/50
// //           "
// //         >
// //           <SelectValue placeholder="Select LLM provider" />
// //         </SelectTrigger>

// //         <SelectContent
// //           // optional: keep dropdown aligned and neat
// //           sideOffset={6}
// //           className="
// //             bg-[#121213] text-white
// //             border-0
// //             rounded-[12px]
// //             shadow-[0_10px_30px_rgba(0,0,0,0.45)]
// //           "
// //         >
// //           <SelectItem
// //             value="openai"
// //             className="text-white focus:bg-white/10 focus:text-white"
// //           >
// //             OpenAI (ChatGPT)
// //           </SelectItem>
// //           <SelectItem
// //             value="perplexity"
// //             className="text-white focus:bg-white/10 focus:text-white"
// //           >
// //             Perplexity AI
// //           </SelectItem>
// //           <SelectItem
// //             value="anthropic"
// //             className="text-white focus:bg-white/10 focus:text-white"
// //           >
// //             Anthropic Claude
// //           </SelectItem>
// //           <SelectItem
// //             value="google"
// //             className="text-white focus:bg-white/10 focus:text-white"
// //           >
// //             Google Gemini
// //           </SelectItem>
// //           <SelectItem
// //             value="other"
// //             className="text-white focus:bg-white/10 focus:text-white"
// //           >
// //             Other
// //           </SelectItem>
// //         </SelectContent>
// //       </Select>
// //     </div>
// //   );
// // };

// // import { useState, useEffect } from "react";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import { llmService, type LLMProvider } from "@/services/llmService";
// // import { Label } from "@/components/ui/label";
// // import { toast } from "@/components/ui/use-toast";

// // interface ApiProvider {
// //   _id: string;
// //   name: string;
// // }

// // interface LLMSelectorProps {
// //   onProviderChange?: (provider: LLMProvider) => void;
// // }

// // // Uses your .env value: VITE_API_URL=http://localhost:5000
// // const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
// // const API_URL = `${API_BASE}/api/llm-provider`;

// // const LLMSelector = ({ onProviderChange }: LLMSelectorProps) => {
// //   const [provider, setProvider] = useState<LLMProvider>(llmService.getConfig().provider);
// //   const [providers, setProviders] = useState<ApiProvider[]>([]);
// //   const [loading, setLoading] = useState(false);

// //   const handleProviderChange = (value: string) => {
// //     const newProvider = value as LLMProvider;
// //     setProvider(newProvider);
// //     llmService.setConfig({ provider: newProvider });
// //     onProviderChange?.(newProvider);
// //   };

// //   useEffect(() => {
// //     const fetchJSON = async (url: string, init?: RequestInit) => {
// //       const res = await fetch(url, init);
// //       const ct = res.headers.get("content-type") || "";
// //       const text = await res.text();
// //       if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
// //       if (!ct.includes("application/json")) {
// //         throw new Error(
// //           `Non-JSON response (content-type: ${ct}). Snippet: ${text.slice(0, 200)}`
// //         );
// //       }
// //       return JSON.parse(text);
// //     };

// //     const fetchProviders = async () => {
// //       try {
// //         setLoading(true);
// //         // If you don't use cookies/sessions for this route, remove credentials: "include"
// //         const data = await fetchJSON(API_URL, { credentials: "include" });
// //         if (!data?.success || !Array.isArray(data.providers)) {
// //           throw new Error("Unexpected response shape");
// //         }

// //         setProviders(data.providers);

// //         const names = data.providers.map((p: ApiProvider) => p.name);
// //         console.log("LLM providers from API:", names);

// //         // Auto-select first available if saved provider isn't present
// //         if (names.length && !names.includes(provider)) {
// //           handleProviderChange(names[0]);
// //         }
// //       } catch (err: any) {
// //         console.error("Fetch providers error:", err);
// //         toast({
// //           title: "Couldn’t load providers",
// //           description: err?.message || "Please try again.",
// //           // //         });
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchProviders();
// //     setProvider(llmService.getConfig().provider);
// //   }, []); // eslint-disable-line react-hooks/exhaustive-deps

// //   return (
// //     <div className="space-y-2">
// //       <Label htmlFor="llm-provider" className="text-white">LLM Provider</Label>

// //       <Select
// //         value={provider}
// //         onValueChange={handleProviderChange}
// //         disabled={loading || providers.length === 0}
// //       >
// //         <SelectTrigger
// //           id="llm-provider"
// //           className="
// //             h-11 rounded-[12px]
// //             bg-[#121213] text-white
// //             border-0
// //             shadow-none
// //             focus:ring-0 focus:ring-offset-0 focus:outline-none
// //             data-[placeholder]:text-white/50
// //           "
// //         >
// //           <SelectValue placeholder={loading ? "Loading..." : "Select LLM provider"} />
// //         </SelectTrigger>

// //         <SelectContent
// //           sideOffset={6}
// //           className="
// //             bg-[#121213] text-white
// //             border-0
// //             rounded-[12px]
// //             shadow-[0_10px_30px_rgba(0,0,0,0.45)]
// //           "
// //         >
// //           {providers.length === 0 ? (
// //             <div className="px-3 py-2 text-sm text-white/60">
// //               {loading ? "Loading..." : "No providers found"}
// //             </div>
// //           ) : (
// //             providers.map((p) => (
// //               <SelectItem
// //                 key={p._id}
// //                 value={p.name}
// //                 className="text-white focus:bg-white/10 focus:text-white"
// //               >
// //                 {p.name}
// //               </SelectItem>
// //             ))
// //           )}
// //         </SelectContent>
// //       </Select>
// //     </div>
// //   );
// // };

// // export default LLMSelector;



// import { useCallback, useEffect, useMemo, useState } from "react";
// import { llmService, type LLMProvider } from "@/services/llmService";
// import { Label } from "@/components/ui/label";
// import { toast } from "@/components/ui/use-toast";

// interface ApiProvider { _id: string; name: string; }
// interface LLMSelectorProps { onProviderChange?: (provider: LLMProvider) => void; }

// const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
// const API_URL = `${API_BASE}/api/llm-provider`;

// /** Map backend labels → internal keys (handles your backend names) */
// const apiNameToKey = (name: string): LLMProvider | null => {
//   const s = (name || "").toLowerCase().trim();
//   if (s.includes("openai") || s.includes("chatgpt")) return "openai";          // "OpenAI (ChatGPT)"
//   if (s.includes("perplexity")) return "perplexity";                           // "Perplexity AI"
//   if (s.includes("claude") || s.includes("anthropic")) return "anthropic";     // "Anthropic Claude"
//   if (s.includes("gemini") || s.includes("google")) return "google";           // "Google Gemini"
//   if (s === "other") return null;                                              // ignore “Other”
//   return null;
// };

// /** Fixed buttons (icons must exist in /public/icons) */
// const OPTIONS: Array<{ key: LLMProvider; icon: string; alt: string }> = [
//   { key: "openai",     icon: "/icons/chatgpt.png",    alt: "ChatGPT" },
//   { key: "perplexity", icon: "/icons/perplexity.png", alt: "Perplexity" },
//   { key: "anthropic",  icon: "/icons/claude.png",     alt: "Claude" },
//   { key: "google",     icon: "/icons/Gemini.png",     alt: "Gemini" },
// ];

// const LLMSelector = ({ onProviderChange }: LLMSelectorProps) => {
//   const [provider, setProvider] = useState<LLMProvider | null>(llmService.getConfig().provider);
//   const [providers, setProviders] = useState<ApiProvider[]>([]);
//   const [loading, setLoading] = useState(false);

//   /** Lock: after selecting one, other buttons disabled; selected remains clickable to deselect */
  



//   useEffect(() => {
//     const fetchJSON = async (url: string, init?: RequestInit) => {
//       const res = await fetch(url, init);
//       const ct = res.headers.get("content-type") || "";
//       const text = await res.text();
//       if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
//       if (!ct.includes("application/json")) throw new Error(`Non-JSON response: ${ct}`);
//       return JSON.parse(text);
//     };

//     const load = async () => {
//       try {
//         setLoading(true);
//         const data = await fetchJSON(API_URL, { credentials: "include" });
//         if (!data?.success || !Array.isArray(data.providers)) throw new Error("Unexpected response shape");
//         setProviders(data.providers);

//         // allowed keys from backend (skip “Other”)
//         const allowed = new Set<LLMProvider>(
//           data.providers.map((p: ApiProvider) => apiNameToKey(p.name)).filter(Boolean) as LLMProvider[]
//         );

//         // ensure current provider is allowed; if not, pick first allowed but don't lock
//         const current = llmService.getConfig().provider as LLMProvider;
//         if (allowed.size && !allowed.has(current)) {
//           const first = OPTIONS.find(o => allowed.has(o.key))?.key || "openai";
//           setProvider(first);
//           // NOTE: do not lock or call setConfig here—only when user actively selects
//         } else {
//           setProvider(current || "openai");
//         }
//       } catch (err: any) {
//         console.error(err);
//         // toast({
//         //   title: "Couldn’t load providers",
//         //   description: err?.message || "Please try again.",
//         //   //         // });
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//   }, []); // eslint-disable-line react-hooks/exhaustive-deps

//   // If API gave none / mapping failed, show all; else only allowed
//   const visibleOptions = useMemo(() => {
//     if (!providers.length) return OPTIONS;
//     const allowed = new Set<LLMProvider>(
//       providers.map(p => apiNameToKey(p.name)).filter(Boolean) as LLMProvider[]
//     );
//     return allowed.size ? OPTIONS.filter(o => allowed.has(o.key)) : OPTIONS;
//   }, [providers]);

  

//   return (
//     <div className="space-y-2">
//    <Label className="text-white block text-center sm:text-left">
//   LLM Provider
// </Label>

//       <div
//   role="radiogroup"
//   aria-label="LLM Provider"
//   className="flex flex-wrap justify-center sm:justify-start gap-3"
// >
//         {visibleOptions.map(({ key, icon, alt }) => {
//           const isSelected = provider === key;
//           // Disable others when locked; keep the selected one clickable so you can deselect
//           const isDisabled = loading || (locked && provider !== key);

//           return (
//      <button
//   key={key}
//   type="button"
//   role="radio"
//   aria-checked={isSelected}
//   aria-label={alt}
//   disabled={isDisabled}
//   onClick={() => handleClick(key)}
//   onKeyDown={(e) => {
//     if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
//       e.preventDefault();
//       handleClick(key);
//     }
//   }}
//   className={[
//     "flex items-center gap-2",
//     "w-[130px] h-[42px] rounded-[10px]",
//     "transition-all select-none px-3",
//     isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
//     isSelected
//       ? "border-[1.5px] border-[#1A73E8] bg-[#1a1a1b]"
//       : "border border-white/10 bg-[#1a1a1b] hover:border-white/25 hover:bg-[#222224]",
//   ].join(" ")}
// >
//   {/* Radio dot */}
//   <span
//     className="flex items-center justify-center w-[14px] h-[14px] rounded-full flex-shrink-0 transition-all"
//     style={{
//       border: isSelected
//         ? "1.5px solid #1A73E8"
//         : "1.5px solid rgba(255,255,255,0.3)",
//     }}
//   >
//     <span
//       className="w-[7px] h-[7px] rounded-full block transition-all"
//       style={{ background: isSelected ? "#1A73E8" : "transparent" }}
//     />
//   </span>

//   {/* Icon inside white pill */}
//   <span className="flex items-center justify-center bg-white rounded-[6px] px-[6px] py-[3px]">
//     <img
//       src={icon}
//       alt={alt}
//       className="h-[18px] w-auto object-contain"
//       draggable={false}
//     />
//   </span>
// </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default LLMSelector;


import { useEffect, useMemo, useState } from "react";
import { llmService, type LLMProvider } from "@/services/llmService";
import { Label } from "@/components/ui/label";
import type { IconType } from "react-icons";
import { SiOpenai, SiClaude, SiGooglegemini, SiPerplexity } from "react-icons/si";

interface ApiProvider {
  _id: string;
  name: string;
}

interface LLMSelectorProps {
  onProviderChange?: (provider: LLMProvider) => void;
}

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
const API_URL = `${API_BASE}/api/llm-provider`;

const apiNameToKey = (name: string): LLMProvider | null => {
  const s = (name || "").toLowerCase().trim();
  if (s.includes("openai") || s.includes("chatgpt")) return "openai";
  if (s.includes("perplexity")) return "perplexity";
  if (s.includes("claude") || s.includes("anthropic")) return "anthropic";
  if (s.includes("gemini") || s.includes("google")) return "google";
  return null;
};

/**
 * The models, their logos and their order — one list.
 *
 * Exported because the "open this in…" row that appears under a finished
 * optimisation renders the same four models. That row had its own hardcoded
 * copy using PNG logos on white pills, in a different order, so the same four
 * models looked like two unrelated sets of buttons on one screen.
 *
 * react-icons brand logos — the same set and colours SmartGen uses.
 */
export const LLM_OPTIONS: Array<{
  key: LLMProvider;
  Icon: IconType;
  color: string;
  label: string;
}> = [
  { key: "openai", Icon: SiOpenai, color: "#ffffff", label: "ChatGPT" },
  { key: "perplexity", Icon: SiPerplexity, color: "#1FB8CD", label: "Perplexity" },
  { key: "anthropic", Icon: SiClaude, color: "#D97757", label: "Claude" },
  { key: "google", Icon: SiGooglegemini, color: "#4285F4", label: "Gemini" },
];

const OPTIONS = LLM_OPTIONS;

const LLMSelector = ({ onProviderChange }: LLMSelectorProps) => {
  const [provider, setProvider] = useState<LLMProvider>(
    llmService.getConfig().provider || "openai"
  );
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJSON = async (url: string, init?: RequestInit) => {
      const res = await fetch(url, init);
      const text = await res.text();
      const ct = res.headers.get("content-type") || "";

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      if (!ct.includes("application/json")) throw new Error(`Non-JSON response: ${ct}`);

      return JSON.parse(text);
    };

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchJSON(API_URL, { credentials: "include" });

        if (!data?.success || !Array.isArray(data.providers)) {
          throw new Error("Unexpected response shape");
        }

        setProviders(data.providers);

        const allowed = data.providers
          .map((p: ApiProvider) => apiNameToKey(p.name))
          .filter(Boolean) as LLMProvider[];

        if (allowed.length > 0 && !allowed.includes(provider)) {
          const next = allowed[0];
          setProvider(next);
          llmService.setConfig({ provider: next });
          onProviderChange?.(next);
        }
      } catch (err) {
        console.error("Failed to load providers", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const visibleOptions = useMemo(() => {
    if (!providers.length) return OPTIONS;

    const allowed = new Set(
      providers.map((p) => apiNameToKey(p.name)).filter(Boolean) as LLMProvider[]
    );

    return allowed.size ? OPTIONS.filter((o) => allowed.has(o.key)) : OPTIONS;
  }, [providers]);

  const handleClick = (key: LLMProvider) => {
    setProvider(key);
    llmService.setConfig({ provider: key });
    onProviderChange?.(key);
  };

  return (
    <div className="space-y-2">
      <Label className="text-white block text-center sm:text-left">
        LLM Provider
      </Label>

      <div
        role="radiogroup"
        aria-label="LLM Provider"
        className="flex flex-wrap justify-center sm:justify-start gap-3"
      >
        {visibleOptions.map(({ key, Icon, color, label }) => {
          const isSelected = provider === key;

          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={label}
              disabled={loading}
              onClick={() => handleClick(key)}
              className={[
                "flex items-center gap-2",
                /* Width from the label, not a fixed 140px — that box was
                   narrower than "Perplexity", which arrived on screen as
                   "Perple…". A provider you cannot read the name of is not a
                   choice. min-w keeps the four chips evenly weighted. */
                "min-w-[124px] h-[42px] rounded-full px-4",
                "transition-all select-none",
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                /* Selected reads as selected on its own — tinted fill, brand
                   border, brighter text. The radio dot next to it was doing that
                   job twice, in the visual language of a settings form. */
                isSelected
                  ? "border-[1.5px] border-[#1A73E8] bg-[#1A73E8]/[0.14] shadow-[0_0_0_3px_rgba(26,115,232,0.10)]"
                  : "border border-white/10 bg-[#1a1a1b] hover:border-white/25 hover:bg-[#222224]",
              ].join(" ")}
            >
              {/* No radio dot. `role="radio"` + `aria-checked` above already
                  carry the state for assistive tech, and the fill and border say
                  it visually — the dot only made four brand chips look like a
                  half-finished form. */}
              <Icon size={18} color={color} className="flex-shrink-0" />
              <span className={`text-sm whitespace-nowrap ${isSelected ? "text-white font-medium" : "text-white/75"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LLMSelector;