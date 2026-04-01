// import { useState, useEffect } from "react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { llmService, type LLMProvider } from "@/services/llmService";
// import { Label } from "@/components/ui/label";

// interface LLMSelectorProps {
//   onProviderChange?: (provider: LLMProvider) => void;
// }

// const LLMSelector = ({ onProviderChange }: LLMSelectorProps) => {
//   const [provider, setProvider] = useState<LLMProvider>(llmService.getConfig().provider);

//   const handleProviderChange = (value: string) => {
//     const newProvider = value as LLMProvider;
//     setProvider(newProvider);
//     llmService.setConfig({ provider: newProvider });
//     onProviderChange?.(newProvider);
//   };

//   useEffect(() => {
//     setProvider(llmService.getConfig().provider);
//   }, []);

//   return (
//     <div className="space-y-2">
//       <Label htmlFor="llm-provider" className="text-white">LLM Provider</Label>

//       <Select value={provider} onValueChange={handleProviderChange}>
//         <SelectTrigger
//           id="llm-provider"
//           className="
//             h-11 rounded-[12px]
//             bg-[#121213] text-white
//             border-0
//             shadow-none
//             focus:ring-0 focus:ring-offset-0 focus:outline-none
//             data-[placeholder]:text-white/50
//           "
//         >
//           <SelectValue placeholder="Select LLM provider" />
//         </SelectTrigger>

//         <SelectContent
//           // optional: keep dropdown aligned and neat
//           sideOffset={6}
//           className="
//             bg-[#121213] text-white
//             border-0
//             rounded-[12px]
//             shadow-[0_10px_30px_rgba(0,0,0,0.45)]
//           "
//         >
//           <SelectItem
//             value="openai"
//             className="text-white focus:bg-white/10 focus:text-white"
//           >
//             OpenAI (ChatGPT)
//           </SelectItem>
//           <SelectItem
//             value="perplexity"
//             className="text-white focus:bg-white/10 focus:text-white"
//           >
//             Perplexity AI
//           </SelectItem>
//           <SelectItem
//             value="anthropic"
//             className="text-white focus:bg-white/10 focus:text-white"
//           >
//             Anthropic Claude
//           </SelectItem>
//           <SelectItem
//             value="google"
//             className="text-white focus:bg-white/10 focus:text-white"
//           >
//             Google Gemini
//           </SelectItem>
//           <SelectItem
//             value="other"
//             className="text-white focus:bg-white/10 focus:text-white"
//           >
//             Other
//           </SelectItem>
//         </SelectContent>
//       </Select>
//     </div>
//   );
// };

// import { useState, useEffect } from "react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { llmService, type LLMProvider } from "@/services/llmService";
// import { Label } from "@/components/ui/label";
// import { toast } from "@/components/ui/use-toast";

// interface ApiProvider {
//   _id: string;
//   name: string;
// }

// interface LLMSelectorProps {
//   onProviderChange?: (provider: LLMProvider) => void;
// }

// // Uses your .env value: VITE_API_URL=http://localhost:5000
// const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
// const API_URL = `${API_BASE}/api/llm-provider`;

// const LLMSelector = ({ onProviderChange }: LLMSelectorProps) => {
//   const [provider, setProvider] = useState<LLMProvider>(llmService.getConfig().provider);
//   const [providers, setProviders] = useState<ApiProvider[]>([]);
//   const [loading, setLoading] = useState(false);

//   const handleProviderChange = (value: string) => {
//     const newProvider = value as LLMProvider;
//     setProvider(newProvider);
//     llmService.setConfig({ provider: newProvider });
//     onProviderChange?.(newProvider);
//   };

//   useEffect(() => {
//     const fetchJSON = async (url: string, init?: RequestInit) => {
//       const res = await fetch(url, init);
//       const ct = res.headers.get("content-type") || "";
//       const text = await res.text();
//       if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
//       if (!ct.includes("application/json")) {
//         throw new Error(
//           `Non-JSON response (content-type: ${ct}). Snippet: ${text.slice(0, 200)}`
//         );
//       }
//       return JSON.parse(text);
//     };

//     const fetchProviders = async () => {
//       try {
//         setLoading(true);
//         // If you don't use cookies/sessions for this route, remove credentials: "include"
//         const data = await fetchJSON(API_URL, { credentials: "include" });
//         if (!data?.success || !Array.isArray(data.providers)) {
//           throw new Error("Unexpected response shape");
//         }

//         setProviders(data.providers);

//         const names = data.providers.map((p: ApiProvider) => p.name);
//         console.log("LLM providers from API:", names);

//         // Auto-select first available if saved provider isn't present
//         if (names.length && !names.includes(provider)) {
//           handleProviderChange(names[0]);
//         }
//       } catch (err: any) {
//         console.error("Fetch providers error:", err);
//         toast({
//           title: "Couldn’t load providers",
//           description: err?.message || "Please try again.",
//           variant: "destructive",
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProviders();
//     setProvider(llmService.getConfig().provider);
//   }, []); // eslint-disable-line react-hooks/exhaustive-deps

//   return (
//     <div className="space-y-2">
//       <Label htmlFor="llm-provider" className="text-white">LLM Provider</Label>

//       <Select
//         value={provider}
//         onValueChange={handleProviderChange}
//         disabled={loading || providers.length === 0}
//       >
//         <SelectTrigger
//           id="llm-provider"
//           className="
//             h-11 rounded-[12px]
//             bg-[#121213] text-white
//             border-0
//             shadow-none
//             focus:ring-0 focus:ring-offset-0 focus:outline-none
//             data-[placeholder]:text-white/50
//           "
//         >
//           <SelectValue placeholder={loading ? "Loading..." : "Select LLM provider"} />
//         </SelectTrigger>

//         <SelectContent
//           sideOffset={6}
//           className="
//             bg-[#121213] text-white
//             border-0
//             rounded-[12px]
//             shadow-[0_10px_30px_rgba(0,0,0,0.45)]
//           "
//         >
//           {providers.length === 0 ? (
//             <div className="px-3 py-2 text-sm text-white/60">
//               {loading ? "Loading..." : "No providers found"}
//             </div>
//           ) : (
//             providers.map((p) => (
//               <SelectItem
//                 key={p._id}
//                 value={p.name}
//                 className="text-white focus:bg-white/10 focus:text-white"
//               >
//                 {p.name}
//               </SelectItem>
//             ))
//           )}
//         </SelectContent>
//       </Select>
//     </div>
//   );
// };

// export default LLMSelector;



import { useCallback, useEffect, useMemo, useState } from "react";
import { llmService, type LLMProvider } from "@/services/llmService";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface ApiProvider { _id: string; name: string; }
interface LLMSelectorProps { onProviderChange?: (provider: LLMProvider) => void; }

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
const API_URL = `${API_BASE}/api/llm-provider`;

/** Map backend labels → internal keys (handles your backend names) */
const apiNameToKey = (name: string): LLMProvider | null => {
  const s = (name || "").toLowerCase().trim();
  if (s.includes("openai") || s.includes("chatgpt")) return "openai";          // "OpenAI (ChatGPT)"
  if (s.includes("perplexity")) return "perplexity";                           // "Perplexity AI"
  if (s.includes("claude") || s.includes("anthropic")) return "anthropic";     // "Anthropic Claude"
  if (s.includes("gemini") || s.includes("google")) return "google";           // "Google Gemini"
  if (s === "other") return null;                                              // ignore “Other”
  return null;
};

/** Fixed buttons (icons must exist in /public/icons) */
const OPTIONS: Array<{ key: LLMProvider; icon: string; alt: string }> = [
  { key: "openai",     icon: "/icons/chatgpt.png",    alt: "ChatGPT" },
  { key: "perplexity", icon: "/icons/perplexity.png", alt: "Perplexity" },
  { key: "anthropic",  icon: "/icons/claude.png",     alt: "Claude" },
  { key: "google",     icon: "/icons/Gemini.png",     alt: "Gemini" },
];

const LLMSelector = ({ onProviderChange }: LLMSelectorProps) => {
  const [provider, setProvider] = useState<LLMProvider | null>(llmService.getConfig().provider);
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [loading, setLoading] = useState(false);

  /** Lock: after selecting one, other buttons disabled; selected remains clickable to deselect */
  const [locked, setLocked] = useState(false);

  const applyProvider = useCallback((value: LLMProvider) => {
    setProvider(value);
    llmService.setConfig({ provider: value });     // your API integration
    onProviderChange?.(value);
    setLocked(true);                               // lock others
  }, [onProviderChange]);

  useEffect(() => {
    const fetchJSON = async (url: string, init?: RequestInit) => {
      const res = await fetch(url, init);
      const ct = res.headers.get("content-type") || "";
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      if (!ct.includes("application/json")) throw new Error(`Non-JSON response: ${ct}`);
      return JSON.parse(text);
    };

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchJSON(API_URL, { credentials: "include" });
        if (!data?.success || !Array.isArray(data.providers)) throw new Error("Unexpected response shape");
        setProviders(data.providers);

        // allowed keys from backend (skip “Other”)
        const allowed = new Set<LLMProvider>(
          data.providers.map((p: ApiProvider) => apiNameToKey(p.name)).filter(Boolean) as LLMProvider[]
        );

        // ensure current provider is allowed; if not, pick first allowed but don't lock
        const current = llmService.getConfig().provider as LLMProvider;
        if (allowed.size && !allowed.has(current)) {
          const first = OPTIONS.find(o => allowed.has(o.key))?.key || "openai";
          setProvider(first);
          // NOTE: do not lock or call setConfig here—only when user actively selects
        } else {
          setProvider(current || "openai");
        }
      } catch (err: any) {
        console.error(err);
        toast({
          title: "Couldn’t load providers",
          description: err?.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If API gave none / mapping failed, show all; else only allowed
  const visibleOptions = useMemo(() => {
    if (!providers.length) return OPTIONS;
    const allowed = new Set<LLMProvider>(
      providers.map(p => apiNameToKey(p.name)).filter(Boolean) as LLMProvider[]
    );
    return allowed.size ? OPTIONS.filter(o => allowed.has(o.key)) : OPTIONS;
  }, [providers]);

  const handleClick = (key: LLMProvider) => {
    if (locked) {
      // Only the selected button is enabled; clicking it toggles (deselects + unlocks)
      if (provider === key) {
        setLocked(false);
        setProvider(null); // clear selection; do NOT call setConfig on deselect
      }
      return;
    }
    // not locked → select and lock
    applyProvider(key);
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
        {visibleOptions.map(({ key, icon, alt }) => {
          const isSelected = provider === key;
          // Disable others when locked; keep the selected one clickable so you can deselect
          const isDisabled = loading || (locked && provider !== key);

          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={alt}
              disabled={isDisabled}
              onClick={() => handleClick(key)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
                  e.preventDefault();
                  handleClick(key);
                }
              }}
              className={[
                "flex items-center justify-center gap-2",
                "w-[120px] h-[40px] rounded-[6px] bg-white",
                "border border-[#e9e9ea] shadow-[0_1px_0_#e9e9ea_inset]",
                "transition-all select-none",
                isDisabled ? "opacity-70 cursor-not-allowed" : "hover:shadow-md",
                isSelected ? "ring-2 ring-[#1A73E8]/50" : "ring-0",
              ].join(" ")}
            >
              {/* radio 'o' with spacing */}
              <span
                className={[
                  "flex items-center justify-center",
                  "w-4 h-4 rounded-full border",
                  isSelected ? "border-[#1A73E8]" : "border-gray-400",
                ].join(" ")}
              >
                <span className={["block w-2 h-2 rounded-full", isSelected ? "bg-[#1A73E8]" : "bg-transparent"].join(" ")} />
              </span>

              {/* icon (no text) */}
              <img src={icon} alt={alt} className="h-5 w-auto object-contain" draggable={false} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LLMSelector;
