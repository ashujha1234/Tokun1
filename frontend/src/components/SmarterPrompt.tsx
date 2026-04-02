

// src/components/SmarterPrompt.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { usePrompt } from "@/contexts/PromptContext";
import {
  Wand2,
  Copy,
  Download,
  ExternalLink,
  
  Send,
  Sparkles,
  History
} from "lucide-react";
import ModalComponent from "@/components/ModalComponent";
import { saveItem } from "@/lib/savedCollections";
import { llmService } from "@/services/llmService";
import { useAuth } from "@/contexts/AuthContext";

interface SmarterPromptProps {
  onPromptGenerated?: (prompt: string) => void;
  onUseInOptimizer?: (prompt: string) => void;
  /** If parent already created Smartgen and knows the id, pass it here */
  smartgenId?: string;
}

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const GRADIENT =
  "linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)";
const CARD_FRAME =
  "w-full max-w-[1000px] rounded-[30px] border border-[#282829] bg-[#121213] overflow-hidden";

const IdeasStrip = ({
  exampleIdeas,
  activeIndex,
  setActiveIndex,
  handleExampleClick,
}: {
  exampleIdeas: { img: string; title: string; text: string }[];
  activeIndex: number;
  setActiveIndex: (n: number) => void;
  handleExampleClick: (idea: any) => void;
}) => {
  return (
    <div className="mx-auto w-full px-4 font-inter">
      <div className="mx-auto w-full max-w-[1047.5px] h-[110px] rounded-[20px] border border-[#282829] bg-[#121213] overflow-hidden">
        <div className="h-full overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory">
          <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] h-full min-w-[1040px] md:min-w-0 md:grid-cols-4">
            {exampleIdeas.map((idea, idx) => (
              <button
                key={idx}
                onClick={() => {
                  handleExampleClick(idea);
                  setActiveIndex(idx);
                }}
                className={[
                  "relative h-[110px] w-full text-left",
                  "flex items-center gap-3 px-5 snap-start",
                  idx !== 0 ? "border-l border-[#282829]" : "",
                  idx === activeIndex ? "bg-white/5" : "hover:bg-white/7",
                ].join(" ")}
                aria-label={idea.title}
                title={idea.title}
              >
                <img src={idea.img} alt="" className="h-6 w-6 object-contain" />
                <div className="flex flex-col items-start">
                  <div className="text-white font-semibold leading-[1.1] text-[15px]">
                    {idea.title}
                  </div>
                  <div className="text-white/80 text-[12px] leading-[1.2] mt-[6px]">
                    {idea.text}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SmarterPrompt = ({
  onPromptGenerated,
  onUseInOptimizer,
  smartgenId: smartgenIdProp,
}: SmarterPromptProps) => {
  const navigate = useNavigate();

const sendTOptimizer = async () => {
  if (!detailedPrompt?.trim()) return;
  // optional: also copy to clipboard
  try { await navigator.clipboard.writeText(detailedPrompt); } catch {}

  navigate("/prompt-optimization", {
    state: { initialText: detailedPrompt }, // <-- this feeds the next page
    replace: false,
  });
};


const goToSmartgenHistory = () => {
  // opens /history and selects the Smartgen tab
  navigate("/history?tab=smartgen", { replace: false });
};

  // main state
  const [isGenerating, setIsGenerating] = useState(false);
  const {userPrompt, setUserPrompt, detailedPrompt, setDetailedPrompt, clearPrompts } = usePrompt();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeAction, setActiveAction] =
    useState<"copy" | "download" | "save" | "open" | null>(null);
  const [tokenEfficiencyScore, setTokenEfficiencyScore] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [smartgenId, setSmartgenId] = useState<string | undefined>(
    smartgenIdProp
  );

  // save modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const saveBtnRef = useRef<HTMLButtonElement | null>(null);

  // auth
  const { token, user, persistAuth } = useAuth() as any;
   
  

  // ---------- MIC (speech-to-text) ----------
  const recognitionRef = useRef<any>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
   
    const [isEditingDetailed, setIsEditingDetailed] = useState(false);
const [editablePrompt, setEditablePrompt] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onresult = (event: any) => {
          try {
            const transcript = event.results[0][0].transcript;
            setUserPrompt(userPrompt ? userPrompt + " " + transcript : transcript);
          } catch {}
          setIsListening(false);
        };
        rec.onerror = () => {
          setIsListening(false);
          toast({
            title: "Speech recognition failed",
            description: "Please try again or use text input",
            variant: "destructive",
          });
        };
        rec.onend = () => setIsListening(false);
        recognitionRef.current = rec;
      }
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && speechSupported) {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch {
        setIsListening(false);
      }
    }
  };
  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } finally {
      setIsListening(false);
    }
  };
  // -----------------------------------------

  useEffect(() => {
    if (smartgenIdProp && smartgenIdProp !== smartgenId) {
      setSmartgenId(smartgenIdProp);
    }
  }, [smartgenIdProp]);

  const exampleIdeas = [
    {
      text: "Help me create a marketing strategy",
      img: "/icons/i1.png",
      title: "Marketing Strategy",
    },
    {
      text: "Write a technical tutorial for beginners",
      img: "/icons/i2.png",
      title: "Technical Tutorial",
    },
    {
      text: "Analyze competitor pricing models",
      img: "/icons/i3.png",
      title: "Pricing Models",
    },
    { text: "Design a user onboarding flow", img: "/icons/i4.png", title: "Design" },
  ];

  const handleExampleClick = (idea: any) => setUserPrompt(idea.text);

  // ---- server helpers (unchanged logic, condensed logs) ----
  const logFormData = (fd: FormData) => {
    const preview: Record<string, any[]> = {};
    for (const [k, v] of fd.entries()) {
      if (!preview[k]) preview[k] = [];
      if (v instanceof File)
        preview[k].push({ fileName: v.name, size: v.size, type: v.type });
      else preview[k].push(v);
    }
    console.log("[Smartgen -> FormData]", preview);
  };
const postCreateSmartgen = async ({
  inputPrompt,
  detailedPrompt,
  tokensUsed,
}: {
  inputPrompt: string;
  detailedPrompt: string;
  tokensUsed: number;
}) => {
  const safeTokens = Math.max(1, Number.isFinite(tokensUsed) ? tokensUsed : 0);
  const fd = new FormData();
  fd.append("inputPrompt", inputPrompt);
  fd.append("detailedPrompt", detailedPrompt);
  fd.append("tokensUsed", String(safeTokens));
  for (const f of files) fd.append("attachments", f);

  const base = API_BASE.replace(/\/+$/, "");
  const url = `${base}/api/smartgen`;

  const res = await fetch(url, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: fd,
    credentials: "include",
  });

  const raw = await res.text();
  let data: any = {};
  try { data = JSON.parse(raw); } catch {}

  if (!res.ok) {
    // map common server errors to nicer messages
   const code = data?.error || `http_${res.status}`;
const nice =
  code === "plan_required" ? "Plan required. Please purchase a plan."
: code === "subscription_inactive" ? "Your subscription is inactive."
: code === "org_subscription_inactive" ? "Your organization’s subscription is inactive."
: code === "member_cap_exceeded" ? "Your member token cap is exhausted."
: code === "org_pool_exhausted" ? "Organization token pool is exhausted."
: code === "token_quota_exceeded" ? "Monthly token quota exceeded."
: code === "insufficient_quota" ? "Insufficient token quota."
: code === "invalid_user_type" ? "Your account type cannot use Smartgen."
: code;

  }
  // Optional UI hint: if server includes daily tokens, show it; otherwise generic success
  const newId = data?.item?.id || data?.item?._id;
  if (newId) setSmartgenId(newId);

  const hasDaily = typeof data?.dailyTokensRemaining === "number";
  toast({
    title: "Smartgen created",
    description: hasDaily
      ? `Daily tokens remaining: ${data.dailyTokensRemaining}`
      : "Created successfully.",
  });

  // Only update auth if backend returned anything quota-related
  if (user && persistAuth) {
    const patch: any = { user: { ...user } };
    if (hasDaily) patch.user.dailyTokensRemaining = data.dailyTokensRemaining;
    // Keep future-friendly: if server later adds monthly, this won’t break
    if (typeof data?.monthlyTokensRemaining === "number") {
      patch.user.monthlyTokensRemaining = data.monthlyTokensRemaining;
    }
    if (data?.plan) patch.user.plan = data.plan;
    if (hasDaily || typeof data?.monthlyTokensRemaining === "number" || data?.plan) {
      persistAuth(patch);
    }
  }
  return data?.item;
};
  const putUpdateSmartgen = async ({
  id,
  inputPrompt,
  detailedPrompt,
  tokensUsed,
}: {
  id: string;
  inputPrompt: string;
  detailedPrompt: string;
  tokensUsed: number;
}) => {
  const safeTokens = Math.max(1, Number.isFinite(tokensUsed) ? tokensUsed : 0);
  const fd = new FormData();
  fd.append("inputPrompt", inputPrompt);
  fd.append("detailedPrompt", detailedPrompt);
  fd.append("tokensUsed", String(safeTokens));
  for (const f of files) fd.append("attachments", f);

  const base = API_BASE.replace(/\/+$/, "");
  const url = `${base}/api/smartgen/${id}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: fd,
    credentials: "include",
  });

  const raw = await res.text();
  let data: any = {};
  try { data = JSON.parse(raw); } catch {}

  if (!res.ok) {
    const code = data?.error || `http_${res.status}`;
    const nice =
      code === "insufficient_quota" ? "Insufficient token quota."
      : code === "not proper plan purchased" ? "Plan required. Please purchase a plan."
      : code === "smartgen_not_found_or_access_denied" ? "Not found or access denied."
      : code;
    throw new Error(nice);
  }

  const hasDaily = typeof data?.dailyTokensRemaining === "number";
  toast({
    title: "Smartgen updated",
    description: hasDaily
      ? `Daily tokens remaining: ${data.dailyTokensRemaining}`
      : "Updated successfully.",
  });

  // Update auth quotas only if present
  if (user && persistAuth) {
    const patch: any = { user: { ...user } };
    if (hasDaily) patch.user.dailyTokensRemaining = data.dailyTokensRemaining;
    if (typeof data?.monthlyTokensRemaining === "number") {
      patch.user.monthlyTokensRemaining = data.monthlyTokensRemaining;
    }
    if (data?.plan) patch.user.plan = data.plan;
    if (hasDaily || typeof data?.monthlyTokensRemaining === "number" || data?.plan) {
      persistAuth(patch);
    }
  }

  const newId = data?.item?.id || data?.item?._id;
  if (newId) setSmartgenId(newId);

  return data?.item;
};

const upsertSmartgen = async (payload: {
  inputPrompt: string;
  detailedPrompt: string;
  tokensUsed: number;
}) => {
  try {
    if (smartgenId) {
      const updated = await putUpdateSmartgen({ id: smartgenId, ...payload });
      console.log("✅ PUT updated item:", updated);
      return updated;
    } else {
      console.log("↪ Using POST (no smartgenId yet) …");
      const created = await postCreateSmartgen(payload);
      console.log("✅ POST created item:", created);
      return created;
    }
  } catch (e: any) {
    console.error("[Smartgen upsert error]", e);
    toast({
      title: "Save failed",
      description: e?.message || "Unable to save Smartgen",
      variant: "destructive",
    });
    throw e; // Re-throw to handle in calling function
  }
};

  const saveSmartgenToServer = async ({
    collectionTitle,
    name,
  }: {
    collectionTitle?: string;
    name: string;
  }) => {
    if (!token) {
      toast({
        title: "Not signed in",
        description: "Please login to save.",
        variant: "destructive",
      });
      return null;
    }
    if (!smartgenId) {
      toast({
        title: "Nothing to save yet",
        description: "Generate a Smartgen first, then try saving.",
        variant: "destructive",
      });
      return null;
    }

    const base = API_BASE.replace(/\/+$/, "");
    const url = `${base}/api/saved-collections`;

    const payload = {
      section: "smartgen",
      refId: smartgenId,
      collectionTitle: collectionTitle?.trim() || undefined,
      name: name?.trim() || undefined,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const raw = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(raw);
    } catch {}

    if (!res.ok) {
      const msg =
        data?.error === "invalid_section"
          ? "Invalid section"
          : data?.error === "invalid_refId"
          ? "Invalid reference id"
          : data?.error || `http_${res.status}`;
      throw new Error(msg);
    }

    return data;
  };

  /** Generate detailed prompt (fast llmService) + upsert */
const generateDetailedPrompt = async () => {
  const promptToProcess = userPrompt.trim();
  if (!promptToProcess) {
    toast({
      title: "No prompt provided",
      description: "Please enter a prompt first",
      variant: "destructive",
    });
    return;
  }
  setIsGenerating(true);

  try {
    const result = await llmService.generateDetailedPrompt(promptToProcess);

    setDetailedPrompt(result.optimizedText);

    const originalTokens = Math.ceil(promptToProcess.length / 4);
    const tokensUsed =
      originalTokens +
      Math.ceil((result?.optimizedText?.length || 0) / 4);

    const efficiencyScore = Math.min(
      95,
      Math.max(
        60,
        100 -
          Math.round(
            (((result?.tokens ??
              Math.ceil((result?.optimizedText?.length || 0) / 4)) -
              originalTokens) /
              Math.max(originalTokens, 1)) *
              50
          )
      )
    );
    setTokenEfficiencyScore(efficiencyScore);

    // Call onPromptGenerated AFTER the API call that consumes tokens
    const saved = await upsertSmartgen({
      inputPrompt: promptToProcess,
      detailedPrompt: result.optimizedText,
      tokensUsed,
    });
    
    if (saved) {
      console.log("💾 Upsert success:", saved);
      // NOW call the callback to refresh tokens
      onPromptGenerated?.(result.optimizedText);
    }

    toast({
      title: "Detailed Prompt Generated!",
      description: "Your detailed prompt is ready",
    });

  } catch (err: any) {
    console.error(err);
    const msg =
      err?.code === "llm_timeout" || err?.message === "llm_timeout"
        ? "The AI request took too long. Please try again, or shorten the prompt."
        : err?.message || "Failed to generate prompt";
    toast({ title: "Error", description: msg, variant: "destructive" });
  } finally {
    setIsGenerating(false);
  }
};
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied successfully`,
    });
  };

  const downloadPrompt = () => {
    const element = document.createElement("a");
    const file = new Blob([detailedPrompt], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "detailed-prompt.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({
      title: "Download started",
      description: "Your prompt has been downloaded as a text file",
    });
  };

    // send detailed prompt to Prompt Optimizer
  const sendToOptimizer = async () => {
      if (!detailedPrompt?.trim()) {
       toast({
         title: "No detailed prompt",
         description: "Generate a detailed prompt first.",
         variant: "destructive",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(detailedPrompt);
        toast({
             title: "Copied",
      description: "Detailed prompt copied and opening Prompt Optimizer…",
    });
    navigate("/prompt-optimization", {
      state: { initialText: detailedPrompt },
      replace: false,
    });
    setDetailedPrompt(detailedPrompt); // Explicitly sync with context
  } catch (e) {
    console.error("Clipboard error:", e);
    toast({
      title: "Error",
      description: "Failed to copy to clipboard, but opening Prompt Optimizer…",
      variant: "destructive",
    });
    navigate("/prompt-optimization", {
      state: { initialText: detailedPrompt },
      replace: false,
    });
    setDetailedPrompt(detailedPrompt); // Ensure context is updated
  }
}; 

  return (
    <div className="space-y-6">
      {detailedPrompt && (
        <IdeasStrip
          exampleIdeas={exampleIdeas}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          handleExampleClick={handleExampleClick}
        />
      )}

         <div className="mx-auto w-full max-w-[1050px] rounded-[36px] bg-[#121213] overflow-visible px-2 md:px-0">
        <div className="flex justify-center px-4 pt-4 md:pt-6">
          <div className="relative w-full max-w-[1000px] min-h-[150px] md:h-[200px] rounded-[30px] bg-[#121213] border border-[#282829] text-white overflow-hidden">
           <div className="h-full flex flex-col md:block">
  <div className="flex-1 flex">
    <div className="w-3 md:w-12" />
    <div className="flex-1 pr-3 md:pr-14 pl-2 py-4">
      <Textarea
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        placeholder="Write a technical tutorial for beginners"
        className="w-full min-h-[120px] md:h-full bg-transparent border-none resize-none text-white placeholder-white/70 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] md:text-base leading-relaxed placeholder:text-[13px] md:placeholder:text-base placeholder:leading-none placeholder:whitespace-nowrap"
      />
    </div>
    <div className="w-3 md:w-12" />
  </div>
</div>

           

{/* Bottom-right controls (Mic, History, Clear*, Generate) */}
<div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-full px-3 md:left-auto md:right-3 md:translate-x-0 md:w-auto md:px-0">
  <div className="flex items-center justify-center md:justify-end gap-2">

    {/* Mic — hide after detailed prompt appears */}
    {speechSupported && !Boolean(detailedPrompt.trim()) && (
      <button
        onClick={isListening ? stopListening : startListening}
        className="relative h-8 w-8 md:h-9 md:w-9 rounded-full grid place-items-center flex-shrink-0 overflow-visible border border-[#333335] text-white transition-all duration-300"
        style={{ background: "#2C2C2C" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundImage =
            "linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)")
        }
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundImage = "";
          e.currentTarget.style.background = "#2C2C2C";
        }}
        title={isListening ? "Stop voice input" : "Start voice input"}
        aria-label="Microphone"
      >
        {isListening && (
          <>
            <span
              className="absolute inset-0 rounded-full opacity-60 animate-ping"
              style={{ background: "linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)" }}
            />
            <span
              className="absolute inset-0 rounded-full opacity-40 animate-ping"
              style={{
                background: "linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)",
                animationDelay: "0.4s",
              }}
            />
          </>
        )}
        <img
          src="/icons/mic.png"
          alt="Mic"
          className={`h-4 w-4 ${isListening ? "animate-pulse" : ""}`}
        />
      </button>
    )}

    {/* History */}
    <button
      onClick={goToSmartgenHistory}
      className="h-8 md:h-9 px-3 rounded-full flex items-center justify-center gap-2 flex-shrink-0 border border-[#333335] text-white transition-all duration-300"
      style={{ background: "#2C2C2C" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundImage =
          "linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)")
      }
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundImage = "";
        e.currentTarget.style.background = "#2C2C2C";
      }}
      title="Prompt history"
      aria-label="Prompt history"
    >
      <History className="h-4 w-4" />
      <span className="text-xs md:text-sm whitespace-nowrap">History</span>
    </button>

    {/* Clear */}
    {Boolean(detailedPrompt.trim()) && (
      <button
        onClick={() => clearPrompts()}
        className="h-8 md:h-9 px-3 rounded-full flex items-center justify-center text-white text-xs md:text-sm border border-[#333335] transition-all duration-300 flex-shrink-0"
        style={{ background: "#2C2C2C" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundImage =
            "linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)")
        }
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundImage = "";
          e.currentTarget.style.background = "#2C2C2C";
        }}
        title="Clear"
        aria-label="Clear"
      >
        Clear
      </button>
    )}

    {/* Generate */}
    <button
      onClick={generateDetailedPrompt}
      disabled={isGenerating || !userPrompt.trim()}
      className={`flex items-center justify-center flex-shrink-0 rounded-[8px]
        bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]
        transition-all duration-300 hover:opacity-90 active:scale-[0.98] disabled:opacity-50
        ${
          detailedPrompt.trim()
            ? "h-8 px-3 gap-1.5 text-[12px] md:w-[120px] md:h-[38px] md:text-sm"
            : "h-8 px-3 gap-1.5 text-[12px] md:w-[131px] md:h-[40px] md:text-sm"
        }`}
    >
      {isGenerating ? "Generating..." : "Generate"}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`${detailedPrompt.trim() ? "h-3.5 w-3.5" : "h-3.5 w-3.5 md:h-4 md:w-4"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</div>
          </div>
        </div>

        {!detailedPrompt && (
          <div className="flex justify-center px-4 -mt-px pb-4 md:pb-6">
           <div className="relative w-full max-w-[1000px] min-h-[220px] md:h-[200px] rounded-[30px] bg-[#121213] border border-[#282829] text-white overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 h-full">
                {exampleIdeas.map((idea, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        handleExampleClick(idea);
                        setActiveIndex(index);
                      }}
                      className={[
                        "relative h-full w-full text-left",
                        "flex flex-col items-start justify-start px-6 pt-8 pb-4",
                        index !== 0 ? "border-l border-[#282829]" : "",
                        isActive ? "bg-white/5" : "hover:bg-white/7",
                      ].join(" ")}
                    >
                      <img
                        src={idea.img}
                        alt={idea.title}
                        className="h-6 w-6 mb-2"
                      />
                      <div
                        className="text-white font-semibold leading-[1.1] text-[15px]"
                        style={{ fontFamily: "Inter" }}
                      >
                        {idea.title}
                      </div>
                      <div
                        className="text-white/70 text-[15px] leading-[1.2] mt-[6px]"
                        style={{ fontFamily: "Inter" }}
                      >
                        {idea.text}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {detailedPrompt && (
          <div className="px-4 pb-6">
            <div className="mx-auto w-full max-w-[1000px]">
              <div className="text-center my-6">
                <h3 className="text-white font-semibold text-xl md:text-2xl">
                  Detailed Prompt
                </h3>
              </div>

              <div className={`${CARD_FRAME} relative p-4 md:p-5`}>
     <div className="relative text-white/90 text-sm leading-relaxed pr-4 md:pr-[12rem] pb-24 md:pb-22">
  {isEditingDetailed ? (
    <Textarea
      value={editablePrompt}
      onChange={(e) => setEditablePrompt(e.target.value)}
      className="w-full min-h-[200px] bg-[#1a1a1a] border border-[#333] text-white resize-vertical p-3 rounded-md"
    />
  ) : (
    <div className="whitespace-pre-line">{detailedPrompt}</div>
  )}
</div>

                {/* Actions (bottom-right): Optimize (left of Save), Save, Copy, Download, Open */}
                {/* Actions (bottom-right): Optimise, Save, Copy, Download, Open */}
<div className="mt-6 md:mt-0 md:absolute md:bottom-4 md:right-4 flex flex-wrap items-center gap-3">
  {/* Optimise → navigate to Prompt Optimizer */}
<button
  onClick={sendTOptimizer}
  className="h-10 px-4 rounded-full flex items-center gap-2 border border-[#333335] text-white transition-all duration-300"
  style={{
    background: "#252525", // default dark bg
  }}
  onMouseEnter={(e) =>
    (e.currentTarget.style.backgroundImage =
      "linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)")
  }
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundImage = "";
    e.currentTarget.style.background = "#252525";
  }}
  title="Optimise in Prompt Optimizer"
  aria-label="Optimise in Prompt Optimizer"
>
   <Sparkles className="h-4 w-4" />
  <span className="text-sm font-inter">Optimise</span>
</button>

 {!isEditingDetailed && (
  <button
    onClick={() => {
      setEditablePrompt(detailedPrompt);
      setIsEditingDetailed(true);
    }}
    className="h-10 px-4 rounded-full flex items-center gap-2 border border-[#333335] text-white transition-all duration-300"
    style={{ background: "#252525" }}
  >
    ✏️ Edit
  </button>
)}

{isEditingDetailed && (
  <>
    <button
      onClick={() => setIsEditingDetailed(false)}
      className="h-10 px-4 rounded-full flex items-center gap-2 border border-[#333335] text-white transition-all duration-300"
      style={{ background: "#252525" }}
    >
      ❌ Cancel
    </button>

    <button
      onClick={async () => {
        try {
          setIsGenerating(true);
          const result = await llmService.generateDetailedPrompt(editablePrompt);
          setDetailedPrompt(result.optimizedText);
          setIsEditingDetailed(false);
          toast({
            title: "Regenerated!",
            description: "Detailed prompt regenerated from your edited version.",
          });

          await upsertSmartgen({
            inputPrompt: userPrompt,
            detailedPrompt: result.optimizedText,
            tokensUsed: Math.ceil(result.optimizedText.length / 4),
          });
        } catch (e: any) {
          toast({
            title: "Error",
            description: e?.message || "Failed to regenerate prompt",
            variant: "destructive",
          });
        } finally {
          setIsGenerating(false);
        }
      }}
      className="h-10 px-4 rounded-full flex items-center gap-2 border border-[#333335] text-white transition-all duration-300"
      style={{
        background: "linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)",
      }}
    >
      🔄 Regenerate
    </button>
  </>
)}

  {/* Save (cop.png) */}
  <button
    ref={saveBtnRef}
    onClick={() => setIsModalOpen((v) => !v)}
    aria-pressed={isModalOpen}
    title="Save"
    aria-label="Save"
    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors border"
    style={{ background: isModalOpen ? GRADIENT : "#252525", borderColor: "#333335" }}
  >
    <img src="/icons/cop.png" alt="Save" className="w-5 h-5 object-contain" />
  </button>

  <button
    onClick={() => { setActiveAction("copy"); copyToClipboard(detailedPrompt, "Prompt"); }}
    aria-pressed={activeAction === "copy"}
    className="h-9 w-9 rounded-full flex items-center justify-center transition-colors"
    style={{ background: activeAction === "copy" ? GRADIENT : "#252525" }}
    title="Copy"
  >
    <Copy className="h-4 w-4 text-white" />
  </button>

  <button
    onClick={() => { setActiveAction("download"); downloadPrompt(); }}
    aria-pressed={activeAction === "download"}
    className="h-9 w-9 rounded-full flex items-center justify-center transition-colors"
    style={{ background: activeAction === "download" ? GRADIENT : "#252525" }}
    title="Download"
  >
    <Download className="h-4 w-4 text-white" />
  </button>

  <button
    onClick={() => {
      setActiveAction("open");
      const encodedPrompt = encodeURIComponent(detailedPrompt);
      window.open(`https://chat.openai.com/?prompt=${encodedPrompt}`, "_blank");
    }}
    aria-pressed={activeAction === "open"}
    className="h-9 w-9 rounded-full flex items-center justify-center transition-colors"
    style={{ background: activeAction === "open" ? GRADIENT : "#252525" }}
    title="Open in ChatGPT"
  >
    <ExternalLink className="h-4 w-4 text-white" />
  </button>
</div>

              </div>

              {/* chips (kept) */}
              {/* <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-2">
                
                </div>
              </div> */}
            </div>
          </div>
        )}
      </div>

      {isGenerating && (
        <div className="text-center text-muted-foreground mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-tokun rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-tokun rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-tokun rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <p>Creating detailed prompt...</p>
        </div>
      )}

      <ModalComponent
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (payload) => {
          const finalTitle =
            (payload?.title ?? "").trim() ||
            (userPrompt || "Untitled").trim();
          const isQuick = !!payload?.quick;

          try {
            const serverResp = await saveSmartgenToServer({
              collectionTitle: isQuick ? undefined : finalTitle,
              name: finalTitle,
            });

            if (serverResp?.success) {
              toast({
                title: "Saved",
                description: isQuick
                  ? "Added to All Saved (Smartgen)."
                  : `Created/updated collection “${finalTitle}”.`,
              });
            } else {
              saveItem({
                title: finalTitle,
                prompt: detailedPrompt || "No result yet",
                type: "smartgen",
                category: isQuick ? "All Saved" : finalTitle,
              });
              toast({
                title: "Saved locally",
                description:
                  "Could not confirm server save, mirrored to local.",
              });
            }
          } catch (e: any) {
            saveItem({
              title: finalTitle,
              prompt: detailedPrompt || "No result yet",
              type: "smartgen",
              category: isQuick ? "All Saved" : finalTitle,
            });
            toast({
              title: "Saved locally",
              description:
                e?.message ||
                "Server save failed; mirrored to local storage.",
            });
          } finally {
            setIsModalOpen(false);
          }
        }}
        anchorRef={saveBtnRef}
      />
    </div>
  );
};

export default SmarterPrompt;