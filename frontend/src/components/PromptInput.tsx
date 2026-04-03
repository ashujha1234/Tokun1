


import { toast as sonnerToast } from "sonner";

import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePrompt } from "@/contexts/PromptContext";
import { llmService } from "@/services/llmService";
import LLMSelector from "./LLMSelector";
import { Sparkles, Check, X, Loader2, Lightbulb, Copy, History } from "lucide-react";
import ModalComponent from "@/components/ModalComponent";
import { saveItem } from "@/lib/savedCollections";
import type { OptimizeUsage } from "@/services/llmService";
  import { socket } from "@/lib/socket";
interface OptimizationOption {
  text: string;
  tokens: number;
  words: number;
  description: string;
}

interface PromptInputProps {
  onTokensChange: (tokens: number, words: number) => void;
  onOptimize: (
    text: string,
    tokens: number,
    words: number,
    suggestions: string[],
    usage?: OptimizeUsage
  ) => void;
  initialText?: string;
}

const LLM_WEBSITES = {
  openai: { name: "ChatGPT", url: "https://chat.openai.com", bgColor: "bg-blue-500 hover:bg-blue-600", textColor: "text-white" },
  perplexity: { name: "Perplexity", url: "https://perplexity.ai", bgColor: "bg-blue-500 hover:bg-blue-600", textColor: "text-white" },
  anthropic: { name: "Claude", url: "https://claude.ai", bgColor: "bg-orange-500 hover:bg-orange-600", textColor: "text-white" },
  google: { name: "Gemini", url: "https://gemini.google.com", bgColor: "bg-purple-500 hover:bg-purple-600", textColor: "text-white" },
};

const PANEL_CLS = "rounded-2xl bg-[#121213] p-4 sm:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]";
const BOX_CLS = "rounded-xl border border-white/10 bg-[#151516] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]";
const BOX_PAD = "p-3 sm:p-4";
const SUBTLE_TEXT = "text-xs text-white/60";
const GRADIENT_BG = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";
const GRADIENT_TEXT = { backgroundImage: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)" };
const BTN_TEXT_CLS = "font-inter not-italic font-normal text-[14px] leading-[1] tracking-[0]";

/** API base: use .env VITE_API_URL (e.g. http://localhost:5000) or relative if proxied */
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
/** You mounted: app.use("/api/promptoptimizer", promptoptimizerRoutes) */
const PROMPT_OPTIMIZER_URL = API_BASE ? `${API_BASE}/api/promptoptimizer` : `/api/promptoptimizer`;
/** You mounted: app.use("/api/saved-collections", savedCollectionRoutes) */
const SAVED_COLLECTIONS_URL = API_BASE ? `${API_BASE}/api/saved-collections` : `/api/saved-collections`;

/** Map internal provider keys → DB provider names */
/** Map internal provider keys → EXACT backend names */
const providerLabel = (key: string): string => {
  const k = (key || "").toLowerCase();
  switch (k) {
    case "openai":      return "OpenAI (ChatGPT)";
    case "anthropic":   return "Anthropic Claude";
    case "google":      return "Google Gemini";
    case "perplexity":  return "Perplexity AI";
    case "other":       return "Other";
    default:            return "Other"; // safe fallback to a valid backend provider
  }
};

/** Where your JWT lives (adjust if your app uses a different key) */
const getAuthToken = () =>
  localStorage.getItem("auth_token") ||
  sessionStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("token") ||
  "";

/* ===== Helper: build the preview card text from the optimized text (FIXED VERSION) ===== */
const generateOptimizedVersion = (originalText: string, optimizedText: string) => {
  // ✅ FIX: Use the FULL optimized text, don't truncate it
  // Only clean up formatting but preserve all content
  const cleanOptimizedText = optimizedText
    .replace(/\n\s*\n/g, '\n') // Reduce multiple newlines to single
    .replace(/\s+/g, ' ')      // Normalize spaces
    .trim();

  const originalWords = originalText.split(/\s+/).filter(Boolean);
  const optimizedWords = cleanOptimizedText.split(/\s+/).filter(Boolean);
  
  // Calculate realistic token counts based on actual content
  const originalTokens = Math.ceil(originalText.length / 4);
  const optimizedTokens = Math.ceil(cleanOptimizedText.length / 4);

  return {
    text: cleanOptimizedText, // ✅ Use the full optimized text
    tokens: optimizedTokens,
    words: optimizedWords.length,
    description: "Optimized for clarity and conciseness",
  };
};

/* ===== Original helper (kept to satisfy "do not remove anything") — not used for panel now ===== */
const generateOptimizationSuggestions = (originalText: string) => {
  const suggestions: string[] = [];
  if (originalText.includes("please") || originalText.includes("kindly")) {
    suggestions.push("Remove unnecessary politeness words like 'please' and 'kindly'");
  }
  if (originalText.includes("I want you to") || originalText.includes("I would like you to")) {
    suggestions.push("Replace 'I want you to' with direct commands for brevity");
  }
  if (originalText.match(/\b(very|really|quite|extremely|absolutely)\b/gi)) {
    suggestions.push("Remove unnecessary intensifiers like 'very', 'really', 'quite'");
  }
  if (originalText.includes("in order to")) {
    suggestions.push("Replace 'in order to' with simple 'to'");
  }
  if (originalText.match(/\b(that is|which is|who is)\b/gi)) {
    suggestions.push("Remove unnecessary relative clauses to reduce word count");
  }
  if (originalText.split(/\s+/).length > 50) {
    suggestions.push("Break down complex sentences into shorter, clearer statements");
  }
  if (originalText.match(/\b(actually|basically|essentially|fundamentally)\b/gi)) {
    suggestions.push("Remove filler words like 'actually', 'basically', 'essentially'");
  }
  if (originalText.includes("make sure") || originalText.includes("ensure that")) {
    suggestions.push("Use 'ensure' instead of 'make sure that' for conciseness");
  }
  suggestions.push("Use active voice instead of passive voice when possible");
  suggestions.push("Combine related sentences to reduce repetition");
  suggestions.push("Focus on essential information and remove background context");
  return suggestions.slice(0, 6);
};

/* ===== Sanitize model-provided suggestions: remove meta/weak verbs; ensure concise, sentence form ===== */
const sanitizeFromModel = (s: string) => {
  if (!s) return "";
  let t = s.replace(/\s+/g, " ").trim();

  // Strip meta openers
  t = t.replace(/^(here(?:'|')s|this is|try|suggestion|alternative|version|option)[:\- ]+/i, "");
  // Strip polite prefaces
  t = t.replace(/^(please|kindly|can you|could you|would you|i want you to)[:\- ]+/i, "");
  // Replace verbose connector
  t = t.replace(/\bin order to\b/gi, "to");
  // Remove weak verbs at the start
  t = t.replace(/^(refine|rewrite|improve|optimi[sz]e|streamline|revise|enhance)\b[:\- ]*/i, "");
  // Clean trailing separators
  t = t.replace(/[:;]\s*$/g, "");
  // Ensure terminal punctuation
  if (!/[.!?]$/.test(t)) t += ".";
  // Capitalize first letter
  t = t.charAt(0).toUpperCase() + t.slice(1);
  return t;
};

// ✅ Extension-safe storage helper (fix for setStorage error)
const isExtensionContext =
  typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;

const setStorage = (key: string, value: any): void => {
  try {
    if (isExtensionContext) {
      chrome.storage.local.set({ [key]: value });
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.warn("Storage set failed:", err);
  }
};

const PromptInput = ({ onTokensChange, onOptimize, initialText = "" }: PromptInputProps) => {
     const location = useLocation();   // <-- MUST COME FIRST
  const navigate = useNavigate();
  const { user } = useAuth();

  // ❗ Use sessionId from URL: /prompt-optimizer?sessionId=abc123
  const searchParams = new URLSearchParams(location.search);
  // const collabSessionId = searchParams.get("sessionId") || "default-session";
   const collabSessionId = searchParams.get("sessionId");
  // realtime sync helpers
  const textRef = useRef<string>("");
  const isRemoteUpdateRef = useRef<boolean>(false);

  //inivite
  // const [inviteModal, setInviteModal] = useState(false);
const [inviteEmail, setInviteEmail] = useState("");

  const [isCollabActive, setIsCollabActive] = useState<boolean>(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [optimizationOption, setOptimizationOption] = useState<OptimizationOption | null>(null);
  const [lastUsage, setLastUsage] = useState<OptimizeUsage | undefined>(undefined);
  const [hasCleared, setHasCleared] = useState(false);
  const { refreshQuota } = useAuth();
  const { toast } = useToast();

  const navInitialText: string = (location.state as any)?.initialText || "";
  const navPreCount = (location.state as any)?.preCount || null;

  // initialize from prop OR navigation state
  const { optimizerInput, setOptimizerInput, clearOptimizer } = usePrompt();
  const [text, setText] = useState<string>(optimizerInput || initialText || navInitialText);

  // make countTokens always call onTokensChange, with a fallback
  const countTokens = async (newText: string) => {
    try {
      const { tokens, words } = await llmService.countTokens(newText);
      onTokensChange(tokens, words);
    } catch {
      // fallback: works offline / without API keys
      const words = newText.trim() ? newText.trim().split(/\s+/).length : 0;
      const tokens = Math.ceil(newText.length / 4);
      onTokensChange(tokens, words);
    }
  };

  // hydrate on mount/when nav state changes; prefer preCount if provided
  useEffect(() => {
    // ⛔ Skip restoring if user cleared the input
    if (hasCleared) return;

    const candidate = (initialText && initialText.trim()) || navInitialText;
    if (!candidate) return;

    if (candidate !== text) setText(candidate);

    if (navPreCount && Number.isFinite(navPreCount.tokens)) {
      onTokensChange(navPreCount.tokens, navPreCount.words ?? 0);
    } else {
      countTokens(candidate);
    }
  }, [initialText, navInitialText, hasCleared]);

  // also re-count whenever text changes programmatically (safety net)
  useEffect(() => {
    if (text?.trim()) countTokens(text);
    // NOTE: handleTextChange already counts on user input;
    // this covers programmatic updates only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useEffect(() => {
  textRef.current = text;
}, [text]);

// ===== REAL-TIME COLLABORATION =====
// useEffect(() => {
//   if (!collabSessionId) return;
//   setIsCollabActive(true); // 👈 collaboration started
//   // join room
//   socket.emit("join-session", {
//     sessionId: collabSessionId,
//     userId: user?.id || null,
//   });

//   // initial content from DB
//   const handleInitial = (payload: { sessionId: string; text: string }) => {
//     if (payload.sessionId !== collabSessionId) return;

//     // only update if local is empty or different
//     if (!textRef.current.trim() || textRef.current === optimizerInput) {
//       isRemoteUpdateRef.current = true;
//       setText(payload.text || "");
//       isRemoteUpdateRef.current = false;
//     }
//   };


// const handleSessionEnded = ({ sessionId }: { sessionId: string }) => {
//   if (sessionId !== collabSessionId) return;

//   sonnerToast.info("Collaboration ended", {
//     description: "The collaboration session has been closed.",
//   });

//   setIsCollabActive(false);
//   setText("");

//   // ✅ REMOVE sessionId from URL without navigation
//   const url = new URL(window.location.href);
//   url.searchParams.delete("sessionId");
//   window.history.replaceState({}, "", url.pathname);
// };


// socket.on("session-ended", handleSessionEnded);

// return () => {
//   socket.off("session-ended", handleSessionEnded);
// };







//   // remote edits from others
//   const handleRemoteChange = (payload: { sessionId: string; text: string }) => {
//     if (payload.sessionId !== collabSessionId) return;

//     if (payload.text !== textRef.current) {
//       isRemoteUpdateRef.current = true;
//       setText(payload.text);
//       isRemoteUpdateRef.current = false;
//     }
//   };

//   socket.on("prompt-initial", handleInitial);
//   socket.on("prompt-change", handleRemoteChange);

//   return () => {
//     socket.emit("leave-session", {
//       sessionId: collabSessionId,
//       userId: user?.id || null,
//     });

//     socket.off("prompt-initial", handleInitial);
//     socket.off("prompt-change", handleRemoteChange);
//   };
// }, [collabSessionId, user?.id]);


useEffect(() => {
  if (!collabSessionId) {
    // ❌ NOT in collaboration
    setIsCollabActive(false);
    return;
  }

  // ✅ IN collaboration
  setIsCollabActive(true);

  socket.emit("join-session", {
    sessionId: collabSessionId,
    userId: user?.id || null,
  });

  const handleInitial = (payload: { sessionId: string; text: string }) => {
    if (payload.sessionId !== collabSessionId) return;

    isRemoteUpdateRef.current = true;
    setText(payload.text || "");
    textRef.current = payload.text || "";
    isRemoteUpdateRef.current = false;
  };

  const handleRemoteChange = (payload: { sessionId: string; text: string }) => {
    if (payload.sessionId !== collabSessionId) return;

    if (payload.text !== textRef.current) {
      isRemoteUpdateRef.current = true;
      setText(payload.text);
      textRef.current = payload.text;
      isRemoteUpdateRef.current = false;
    }
  };

  const handleSessionEnded = ({ sessionId }: { sessionId: string }) => {
    if (sessionId !== collabSessionId) return;

    sonnerToast.info("Collaboration ended", {
      description: "The collaboration session has been closed.",
    });

    setIsCollabActive(false);
    setText("");
    textRef.current = "";

    const url = new URL(window.location.href);
    url.searchParams.delete("sessionId");
    window.history.replaceState({}, "", url.pathname);
  };

  socket.on("prompt-initial", handleInitial);
  socket.on("prompt-change", handleRemoteChange);
  socket.on("session-ended", handleSessionEnded);

  return () => {
    socket.emit("leave-session", {
      sessionId: collabSessionId,
      userId: user?.id || null,
    });

    socket.off("prompt-initial", handleInitial);
    socket.off("prompt-change", handleRemoteChange);
    socket.off("session-ended", handleSessionEnded);
  };
}, [collabSessionId, user?.id]);

  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const saveAnchorRef = useRef<HTMLButtonElement | null>(null);

  /** Keep track of the _id returned by /api/promptoptimizer so we can save to collections */
  const [optimizerDocId, setOptimizerDocId] = useState<string | null>(null);

  const [centerToast, setCenterToast] = useState<{ title: string; desc?: string } | null>(null);
   const [inviteModal, setInviteModal] = useState(false);
const [inviteName, setInviteName] = useState("");
// const [inviteEmail, setInviteEmail] = useState("");
const [inviteMessage, setInviteMessage] = useState("");

  const showCenterToast = (title: string, desc?: string, ms = 5000) => {
    setCenterToast({ title, desc });
    window.clearTimeout((showCenterToast as any)._t);
    (showCenterToast as any)._t = window.setTimeout(() => setCenterToast(null), ms);
  };

// const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//   const newText = e.target.value;
//   setText(newText);
//   setOptimizerInput(newText); // persist in sessionStorage (per user)
//   countTokens(newText);
//   setOptimizationOption(null);
//   setOptimizerDocId(null);
//   setLastUsage(undefined);
// };


const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const newText = e.target.value;

  // update UI
  setText(newText);
  textRef.current = newText;

  // local logic
  setOptimizerInput(newText);
  countTokens(newText);
  setOptimizationOption(null);
  setOptimizerDocId(null);
  setLastUsage(undefined);

  // ❗ Avoid echo-loop if update is from server
  if (isRemoteUpdateRef.current) return;

  // ===== SEND TO OTHER USERS =====
  socket.emit("prompt-change", {
    sessionId: collabSessionId,
    text: newText,
    userId: user?.id || null,
  });
};

const handleConfirmEndSession = () => {
  socket.emit("end-session", {
    sessionId: collabSessionId,
    userId: user?.id,
  });

  setShowEndConfirm(false);
};


  const handleOptimize = async () => {
    if (!text.trim()) {
      toast({ title: "Empty prompt", description: "Please enter text to optimize", variant: "destructive" });
      return;
    }

    const config = llmService.getConfig();
    if (!config.apiKey) {
      toast({
        title: "API key missing",
        description: `Please set your ${config.provider.toUpperCase()} API key in the settings`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log("%c[OPTIMIZE] LLM provider:", "color:#7c3aed;font-weight:bold;", config.provider);

      // 1) Call optimizer
      const { optimizedText, suggestions, usage } = await llmService.optimizePrompt(text);
      setLastUsage(usage);

      // 2) Build preview text then get REAL counts for that preview
      const option = generateOptimizedVersion(text, optimizedText);
      // ✅ FIX: Use the actual optimized text for token counting, not the truncated version
      const { tokens, words } = await llmService.countTokens(optimizedText);

      // 3) Update preview card
      setOptimizationOption({ ...option, tokens, words });
      setOptimizerDocId(null);

      // 4) Clean suggestions (max 3)
      const cleaned = (suggestions || []).map(sanitizeFromModel).filter(Boolean);
      const uniq: string[] = [];
      const seen = new Set<string>();
      for (const s of cleaned) {
        const k = s.toLowerCase();
        if (!seen.has(k)) { seen.add(k); uniq.push(s); }
        if (uniq.length === 3) break;
      }
      while (uniq.length < 3) {
        const fallback = sanitizeFromModel(optimizedText);
        if (!seen.has(fallback.toLowerCase())) { seen.add(fallback.toLowerCase()); uniq.push(fallback); }
        else break;
      }

      // 5) Tell parent about counts (NO usage → only original vs optimized rings)
      onOptimize(option.text, tokens, words, uniq.slice(0, 3), undefined);

      // 6) SAVE to /api/promptoptimizer HERE (on Optimize button)
      console.log(
        "%c[OPTIMIZE] Saving to /api/promptoptimizer…",
        "color:#2563eb;font-weight:bold;"
      );
      const saved = await saveOptimization(option.text, tokens);
      console.log("%c[OPTIMIZE] Saved response:", "color:#2563eb;", {
        provider: config.provider,
        requestTokensEstimated: tokens,
        serverResponse: saved,
      });
      if (saved?.id) setOptimizerDocId(saved.id);

      // 🚨 ADD THIS: Refresh token counts after optimization
      try {
        await refreshQuota();
        console.log("PromptInput: Token count refreshed after optimization");
      } catch (error) {
        console.error("PromptInput: Token refresh failed", error);
      }

    } catch (error) {
      console.error("Error optimizing prompt:", error);
      toast({
        title: "Optimization failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const goToOptimizerHistory = () => {
    navigate("/history?tab=optimizer", { replace: false });
  };

  /** POST to /api/promptoptimizer with Authorization: Bearer <token> */
  const saveOptimization = async (outputText: string, fallbackTokens: number) => {
    const cfg = llmService.getConfig();
    const llmProviderName = providerLabel(cfg.provider);

    const tokensUsed =
      typeof lastUsage?.total === "number" && lastUsage.total > 0
        ? lastUsage.total
        : Math.max(1, Number.isFinite(fallbackTokens) ? fallbackTokens : 1);

    const payload = {
      llmProviderName,
      inputPrompt: text,
      outputPrompt: outputText,
      tokensUsed,
    };

    console.log("%c[SAVE] Payload → /api/promptoptimizer", "color:#9333ea;font-weight:bold;", payload);

    const token = getAuthToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(PROMPT_OPTIMIZER_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const raw = await res.text();
    let data: any = {};
    try { data = JSON.parse(raw); } catch {}

    if (!res.ok) {
      throw new Error(data?.error || `http_${res.status}`);
    }

    // Expect your API to return { optimizedPrompt: { _id, inputPrompt, outputPrompt, tokensUsed, ... }, dailyTokensRemaining? }
    const id = data?.optimizedPrompt?._id || data?.optimizedPrompt?.id || data?._id || null;
    if (id) setOptimizerDocId(id);

    return { id, data };
  };

  /** POST to /api/saved-collections for section promptOptimizer */
  const saveToSavedCollections = async (refId: string, collectionTitle?: string, name?: string) => {
    const token = getAuthToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const body = {
      section: "promptOptimizer",
      refId,
      collectionTitle: collectionTitle || undefined,
      name: name || undefined,
    };

    const res = await fetch(SAVED_COLLECTIONS_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      credentials: "include",
    });

    const raw = await res.text();
    let data: any = {};
    try { data = JSON.parse(raw); } catch {}

    if (!res.ok) {
      throw new Error(data?.error || `http_${res.status}`);
    }

    return data;
  };

  const selectOption = async (option: OptimizationOption) => {
    try {
      await navigator.clipboard.writeText(option.text);
      showCenterToast("Optimized prompt copied", "It's on your clipboard and ready to use.");

      // reset parent & UI
      onOptimize("", 0, 0, [], undefined);
      setOptimizationOption(null);
      setText("");
      setOptimizerDocId(null);
      setLastUsage(undefined);
      await countTokens("");
    } catch (err: any) {
      toast({ title: "Copy failed", description: err?.message || "Could not copy the prompt.", variant: "destructive" });
    }
  };

  const openLLMWebsite = (provider: keyof typeof LLM_WEBSITES, promptText?: string) => {
    const llm = LLM_WEBSITES[provider];
    const text = (promptText || "").trim();
    const encoded = encodeURIComponent(text);

    let url = llm.url;
    switch (provider) {
      case "perplexity": url = `${llm.url}/?q=${encoded}`; break;
      case "google":     url = `${llm.url}/app?q=${encoded}`; break;
      case "openai":     url = `${llm.url}/?prompt=${encoded}`; break;
      default:           url = llm.url;
    }

    if (text) navigator.clipboard.writeText(text).catch(() => {});
    window.open(url, "_blank", "noopener,noreferrer");

    // Centered message only
    showCenterToast(`Optimized prompt copied`, `Paste in ${llm.name} with ⌘V / Ctrl+V.`);
  };

  /**
   * Save button (cop.png) → modal opens → onSave from modal
   * - If no optimizerDocId yet, save prompt to /api/promptoptimizer first (using current optimized text or raw text)
   * - Then save to /api/saved-collections with section="promptOptimizer"
   */
  const handleSaveFromDropdown = async (payload?: { title?: string; category?: string; quick?: boolean }) => {
    const textToSave = optimizationOption?.text || text;
    if (!textToSave.trim()) {
      toast({ title: "Nothing to save", description: "Generate or enter a prompt first.", variant: "destructive" });
      return;
    }

    const isQuick = !!payload?.quick || !payload?.title?.trim();
    const collectionTitle = isQuick ? undefined : payload?.title?.trim();
    const friendlyName = undefined; // you can map title→name if you prefer

    try {
      // Ensure the optimized prompt exists in /api/promptoptimizer and we have its id
      let id = optimizerDocId;
      if (!id) {
        const { tokens } = await llmService.countTokens(textToSave);
        const saved = await saveOptimization(textToSave, tokens);
        id = saved.id || null;
        setOptimizerDocId(id);
      }

      if (!id) {
        throw new Error("Could not determine optimizer document ID.");
      }

      // Save reference into Saved Collections (promptOptimizer section)
      await saveToSavedCollections(id, collectionTitle, friendlyName);

      // Optional: also mirror to local quick "All Saved" (purely UI convenience)
      if (isQuick) {
        saveItem({ title: "", prompt: textToSave, type: "prompt-optimization", category: "All Saved" });
      } else {
        saveItem({ title: collectionTitle || "", prompt: textToSave, type: "prompt-optimization", category: "Prompt Optimiser" });
      }

      setIsSaveOpen(false);
      toast({
        title: "Saved",
        description: isQuick ? "Saved to All Saved." : `Saved to collection "${collectionTitle}".`,
      });
    } catch (err: any) {
      console.error("Save to saved-collections error:", err);
      toast({
        title: "Save failed",
        description: err?.message || "Could not save to saved collections.",
        variant: "destructive",
      });
    }
  };


 const sendInvite = async (payload: { email: string; name?: string; message?: string }) => {
  if (!collabSessionId) {
    sonnerToast.error("No collaboration session", {
      description: "Start a collaboration before inviting someone.",
    });
    return false;
  }

  try {
    const res = await fetch(`${API_BASE}/api/prompt-collab/sendCollabInvite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        sessionId: collabSessionId, // ✅ REQUIRED
        email: payload.email,
        name: payload.name,
        message: payload.message,
      }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      sonnerToast.success("Invitation Sent", {
        description: `Invitation sent to ${payload.email}`,
      });
      return true;
    } else {
      sonnerToast.error("Failed", {
        description: data.message || "Could not send invite",
      });
      return false;
    }
  } catch (err) {
    console.error("sendInvite error:", err);
    sonnerToast.error("Network Error", {
      description: "Could not send invite",
    });
    return false;
  }
};


const startCollaboration = async (): Promise<string | null> => {
  try {
    const res = await fetch(`${API_BASE}/api/prompt-collab/start`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    const data = await res.json();

    if (!res.ok || !data.sessionId) {
      toast({
        title: "Failed to start collaboration",
        description: data.message,
        variant: "destructive",
      });
      return null;
    }

    navigate(`/prompt-optimization?sessionId=${data.sessionId}`, {
  replace: true,
});

    return data.sessionId;
  } catch (err) {
    console.error(err);
    toast({
      title: "Network error",
      variant: "destructive",
    });
    return null;
  }
};







  return (
   <div className="w-full space-y-4">
      <div className="mb-3 flex justify-center sm:justify-start">
  <LLMSelector />
</div>

      <div className={PANEL_CLS}>
        <div className={`${BOX_CLS} ${BOX_PAD} relative`}>
        <Textarea
    placeholder="Enter your prompt here..."
    className="min-h-[180px] bg-transparent resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pr-10"
    value={text}
    onChange={handleTextChange}
  />

 {/* ✅ Large, visible Clear button */}
  {text.trim() && (
    <button
      type="button"
      onClick={() => {
        setText("");
        setOptimizerInput("");
        localStorage.removeItem("optimizerInput");
      }}
      className="absolute top-2.5 right-3 flex items-center justify-center w-6 h-6 rounded-full bg-[#2a2a2a] text-white/70 hover:text-white hover:bg-[#3a3a3a] transition-all duration-200 shadow-sm"
      title="Clear input"
      aria-label="Clear input"
    >
      ✕
    </button>
  )}
</div>

       <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            <span className={SUBTLE_TEXT}>
              Optimizing your prompt can significantly reduce token usage.
            </span>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap justify-center sm:justify-end gap-3 w-full">
  <Button
    variant="outline"
    className="rounded-2xl w-[140px] h-[40px] bg-#252525/40 border-white/10 text-white"
    onClick={goToOptimizerHistory}
    title="View your saved optimizations"
  >
    <History className="h-4 w-4 mr-2" />
    History
  </Button>

  {optimizationOption && (
    <Button
      onClick={() => {
        clearOptimizer();
        setText("");
        setOptimizationOption(null);
        setOptimizerDocId(null);
        setHasCleared(true);
        setLastUsage(undefined);
        onOptimize("", 0, 0, [], undefined);
        localStorage.removeItem("optimizerInput");
        countTokens("");
      }}
      className="rounded-2xl w-[140px] h-[40px] text-white border-0 transition-all duration-300"
      style={{ background: "#252525" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundImage = GRADIENT_BG)
      }
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundImage = "";
        e.currentTarget.style.background = "#252525";
      }}
    >
      <span className={BTN_TEXT_CLS}>Clear</span>
    </Button>
  )}

  <Button
    onClick={handleOptimize}
    disabled={isProcessing || !text}
    className="rounded-2xl w-[140px] h-[40px] text-white border-0 transition-all duration-300"
    style={{ background: "#252525" }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.backgroundImage = GRADIENT_BG)
    }
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundImage = "";
      e.currentTarget.style.background = "#252525";
    }}
  >
    {isProcessing ? (
      <>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        <span className={BTN_TEXT_CLS}>Optimizing...</span>
      </>
    ) : (
      <>
        <Sparkles className="h-4 w-4 mr-2" />
        <span className={BTN_TEXT_CLS}>Optimize</span>
      </>
    )}
  </Button>

  {!isCollabActive ? (
    <Button
      onClick={async () => {
        let sessionId = collabSessionId;
        if (!sessionId) {
          sessionId = await startCollaboration();
          if (!sessionId) return;
        }
        setInviteModal(true);
      }}
      className="rounded-2xl w-[140px] h-[40px] text-white border-0 transition-all duration-300"
      style={{ backgroundImage: GRADIENT_BG }}
    >
      Invite Collaborator
    </Button>
  ) : (
    <Button
      onClick={() => setShowEndConfirm(true)}
      className="rounded-2xl w-[140px] h-[40px] px-4 text-sm text-white border-0 bg-red-600 hover:bg-red-700"
    >
      End Session
    </Button>
  )}
</div>
        </div>

        {optimizationOption && (
          <div className="mt-5">
            <div className={`${BOX_CLS} ${BOX_PAD} relative`}>
              <Textarea
                readOnly
                value={optimizationOption.text}
                className="min-h-[160px] bg-transparent resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-text"
              />
              <div className="mt-3 flex justify-end">
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full border text-xs" style={{ borderColor: "#333335" }}>
                    <span className="bg-clip-text text-transparent" style={GRADIENT_TEXT}>
                      {optimizationOption.tokens} tokens
                    </span>
                  </span>
                  <span className="px-3 py-1 rounded-full border text-xs" style={{ borderColor: "#333335" }}>
                    <span className="bg-clip-text text-transparent" style={GRADIENT_TEXT}>
                      {optimizationOption.words} words
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-3">
                <button
                  className="flex items-center justify-center bg-white min-w-[100px] h-[40px] rounded-[200px] hover:opacity-90 transition"
                  onClick={() => openLLMWebsite("openai", optimizationOption.text)}
                  title="Open ChatGPT"
                >
                  <img src="/icons/chatgpt.png" alt="ChatGPT" className="w-[60px] h-[22px] object-contain" />
                </button>
                <button
                  className="flex items-center justify-center bg-white min-w-[100px] h-[40px] rounded-[200px] hover:opacity-90 transition"
                  onClick={() => openLLMWebsite("anthropic", optimizationOption.text)}
                  title="Open Claude"
                >
                  <img src="/icons/claude.png" alt="Claude" className="w-[60px] h-[22px] object-contain" />
                </button>
                <button
                  className="flex items-center justify-center bg-white min-w-[100px] h-[40px] rounded-[200px] hover:opacity-90 transition"
                  onClick={() => openLLMWebsite("google", optimizationOption.text)}
                  title="Open Gemini"
                >
                  <img src="/icons/Gemini.png" alt="Gemini" className="w-[60px] h-[22px] object-contain" />
                </button>
                <button
                  className="flex items-center justify-center bg-white min-w-[100px] h-[40px] rounded-[200px] hover:opacity-90 transition"
                  onClick={() => openLLMWebsite("perplexity", optimizationOption.text)}
                  title="Open Perplexity"
                >
                  <img src="/icons/perplexity.png" alt="Perplexity" className="w-[60px] h-[22px] object-contain" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  ref={saveAnchorRef}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 border border-[#333335]"
                  style={{ background: isSaveOpen ? GRADIENT_BG : "#252525" }}
                  onClick={() => setIsSaveOpen(v => !v)}
                  title="Save / Quick save"
                  aria-label="Save menu"
                >
                  <img src="/icons/cop.png" alt="Save" className="w-5 h-5 object-contain" />
                </button>
                <button
                  className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center hover:opacity-90 border border-[#333335]"
                  onClick={() =>
                    navigator.clipboard.writeText(optimizationOption.text).then(() =>
                      toast({ title: "Copied", description: "Optimized prompt copied to clipboard" })
                    )
                  }
                  title="Copy"
                  aria-label="Copy"
                >
                  <Copy className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <span className={SUBTLE_TEXT}>Optimizing your prompt can significantly reduce token usage.</span>
              </div>
              <Button
                onClick={() => selectOption(optimizationOption)}
                className="rounded-2xl w-full sm:w-auto sm:min-w-[170px] text-white border-0"
                size="sm"
                style={{ backgroundImage: GRADIENT_BG }}
              >
                <Check className="h-4 w-4 mr-2" />
                <span className={BTN_TEXT_CLS}>Use this version</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      <ModalComponent
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        onSave={handleSaveFromDropdown}
        anchorRef={saveAnchorRef}
      />
      
      {centerToast && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
          <div
            className="
              pointer-events-auto w-[min(92vw,420px)] rounded-xl
              border border-white/10 bg-black
              shadow-[0_14px_50px_rgba(0,0,0,.7)]
              animate-in fade-in-0 zoom-in-95 slide-in-from-top-4 duration-200
            "
            role="status"
            aria-live="polite"
          >
            <div className="p-5 sm:p-6 flex items-start gap-3.5">
              <div
                className="h-10 w-10 rounded-lg grid place-items-center shrink-0"
                style={{ backgroundImage: GRADIENT_BG }}
              >
                <Sparkles className="h-5 w-5 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-[15px] leading-tight">
                  {centerToast.title}
                </div>
                {centerToast.desc && (
                  <div className="text-white/80 text-[13px] mt-1 leading-snug">
                    {centerToast.desc}
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-[3px] w-full overflow-hidden rounded-b-[10px] bg-white/10">
              <div
                className="h-full w-0"
                style={{
                  backgroundImage: GRADIENT_BG,
                  animation: "toastProgress 5s linear forwards",
                }}
              />
            </div>
          </div>
        </div>
      )}


 {inviteModal && (
  <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
    <div className="w-full max-w-[540px] rounded-2xl bg-[#0F0F10] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,.65)]">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6">
        <h2 className="text-xl font-semibold text-white">Invite Collaborator</h2>
        <button
          onClick={() => setInviteModal(false)}
          className="rounded-md p-1 text-white/40 hover:text-white/80 hover:bg-white/5 transition"
          aria-label="Close"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 pb-6 pt-5 space-y-5">
        
        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm text-white/80">Name</label>
          <input
            type="text"
            placeholder="Enter full name"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            className="
              w-full h-11 rounded-lg px-3
              bg-transparent border border-white/10
              text-white placeholder:text-white/30
              focus:outline-none focus:ring-1 focus:ring-white/20
            "
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm text-white/80">Email</label>
          <input
            type="email"
            placeholder="Enter email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="
              w-full h-11 rounded-lg px-3
              bg-transparent border border-white/10
              text-white placeholder:text-white/30
              focus:outline-none focus:ring-1 focus:ring-white/20
            "
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="text-sm text-white/80">Your message here</label>
          <textarea
            placeholder="Describe your experience..."
            value={inviteMessage}
            onChange={(e) => setInviteMessage(e.target.value)}
            className="
              w-full min-h-[110px] rounded-lg p-3
              bg-transparent border border-white/10
              text-white placeholder:text-white/30
              resize-none
              focus:outline-none focus:ring-1 focus:ring-white/20
            "
          />
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            onClick={() => {
              setInviteModal(false);
              setInviteName("");
              setInviteEmail("");
              setInviteMessage("");
            }}
            className="text-white/80 hover:text-white transition"
          >
            Cancel
          </button>

          <button
            onClick={async () => {
              if (!inviteEmail.trim()) {
                toast({
                  title: "Email required",
                  description: "Please enter an email to send the invite.",
                  variant: "destructive",
                });
                return;
              }

              // If your backend only accepts email, call: await sendInvite(inviteEmail);
              await sendInvite({
                email: inviteEmail.trim(),
                name: inviteName.trim() || undefined,
                message: inviteMessage.trim() || undefined,
              });

              setInviteModal(false);
              setInviteName("");
              setInviteEmail("");
              setInviteMessage("");
            }}
            className="
              h-11 px-7 rounded-lg text-white font-medium
              shadow-[0_6px_20px_rgba(0,0,0,.35)]
              hover:opacity-95 transition
            "
            style={{ backgroundImage: GRADIENT_BG }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{showEndConfirm && (
  <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
    <div className="w-full max-w-[420px] rounded-2xl bg-[#0F0F10] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,.65)]">
      
      {/* Close */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => setShowEndConfirm(false)}
          className="text-white/40 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
          <span className="text-red-500 text-2xl">⛔</span>
        </div>
      </div>

      {/* Text */}
      <div className="px-6 pt-4 pb-6 text-center space-y-2">
        <h2 className="text-xl font-semibold text-white">
          End Session
        </h2>
        <p className="text-white/70 text-sm">
          Are you sure you want to end this Collaboration?
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 px-6 pb-6">
        <button
          onClick={handleConfirmEndSession}
          className="flex-1 h-11 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
        >
          Yes
        </button>

        <button
          onClick={() => setShowEndConfirm(false)}
          className="flex-1 h-11 rounded-lg bg-[#2A2A2A] text-white hover:bg-[#3A3A3A] transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default PromptInput;