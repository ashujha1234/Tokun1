// // src/components/SuggestionsPanel.tsx
// import { Card, CardContent } from "@/components/ui/card";
// import { Sparkles, Lightbulb, CheckCircle, Copy } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";

// interface SuggestionsPanelProps {
//   suggestions: string[];
// }

// const SuggestionsPanel = ({ suggestions }: SuggestionsPanelProps) => {
//   const { toast } = useToast();
//   const top3 = (suggestions || []).slice(0, 3);

//   return (
//     <div className="space-y-6">
//       {/* AI-Powered Suggestions Card */}
//       <Card className="border-0 bg-[#121213] rounded-3xl shadow-[0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden">
//         <CardContent className="px-8 py-10">
//           {top3.length > 0 ? (
//             <>
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="p-2 rounded-full bg-gradient-to-br from-[#1A73E8] to-[#FF14EF]">
//                   <Lightbulb className="h-6 w-6 text-white" />
//                 </div>
//                 <div>
//                   <h3 className="text-white text-xl font-semibold">
//                     AI-Powered Suggestions
//                   </h3>
//                   <p className="text-sm text-white/60">
//                     Smart recommendations to optimize your prompts and reduce token usage
//                   </p>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 {top3.map((suggestion, i) => (
//                   <div
//                     key={i}
//                     className="relative group p-4 rounded-2xl bg-[#0f0f10] border border-white/10 transition-transform hover:translate-y-[-1px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
//                   >
//                     <div className="flex items-start gap-3">
//                       <div className="mt-1 p-1.5 rounded-full bg-gradient-to-br from-[#1A73E8]/40 to-[#FF14EF]/40">
//                         <CheckCircle className="h-4 w-4 text-white" />
//                       </div>
//                       <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
//                         {suggestion}
//                       </p>
//                     </div>

//                     {/* Copy (hover only) */}
//                   <button
//   onClick={async () => {
//     await navigator.clipboard.writeText(suggestion);
//     toast({
//       title: "Copied",
//       description: "This version has been copied to clipboard",
//     });
//   }}
//   className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 w-9 h-9 rounded-full border border-white/10 flex items-center justify-center bg-black/30 hover:bg-black/50"
//   title="Copy"
//   aria-label="Copy"
// >
//   <Copy className="w-4 h-4 text-white/90" />
// </button>


//                     <div className="pointer-events-none absolute inset-y-0 right-0 w-1/5 rounded-r-2xl bg-gradient-to-l from-[#FF14EF]/10 via-transparent to-transparent" />
//                   </div>
//                 ))}

//                 <div className="mt-6 rounded-2xl border border-white/10 p-4">
//                   <div className="flex items-center gap-2 text-sm font-medium">
//                     <Sparkles className="h-4 w-4 text-white" />
//                     <span className="text-white">
//                       {top3.length} optimization {top3.length === 1 ? "tip" : "tips"} available
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </>
//           ) : (
//             <div className="text-center max-w-[520px] mx-auto">
//               <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-gradient-to-br from-[#1A73E8] to-[#FF14EF] grid place-items-center">
//                 <Lightbulb className="h-7 w-7 text-white" />
//               </div>

//               <h3 className="text-white text-2xl font-semibold mb-2">
//                 AI-Powered Suggestions
//               </h3>
//               <p className="text-white/70 text-base mb-8">
//                 Smart recommendations to optimize your prompts and reduce token usage
//               </p>

//               <h4 className="text-white text-lg font-medium mb-2">Ready to Optimize</h4>
//               <p className="text-white/60 text-sm leading-relaxed px-6">
//                 Enter your prompt and click optimize to receive personalized suggestions
//                 for improving efficiency and reducing token usage.
//               </p>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default SuggestionsPanel;


// src/components/SuggestionsPanel.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Lightbulb, CheckCircle, Copy } from "lucide-react";
import { useState } from "react";

interface SuggestionsPanelProps {
  suggestions: string[];
}

const GRADIENT_BG = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

const SuggestionsPanel = ({ suggestions }: SuggestionsPanelProps) => {
  const top3 = (suggestions || []).slice(0, 3);

  // Local state for center toast
  const [centerToast, setCenterToast] = useState<{ title: string; desc?: string } | null>(null);

  const showCenterToast = (title: string, desc?: string, ms = 2000) => {
    setCenterToast({ title, desc });
    window.clearTimeout((showCenterToast as any)._t);
    (showCenterToast as any)._t = window.setTimeout(() => setCenterToast(null), ms);
  };

  return (
    <div className="space-y-6">
      {/* AI-Powered Suggestions Card */}
      <Card className="border-0 bg-[#121213] rounded-3xl shadow-[0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden">
        <CardContent className="px-8 py-10">
          {top3.length > 0 ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-gradient-to-br from-[#1A73E8] to-[#FF14EF]">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white text-xl font-semibold">
                    AI-Powered Suggestions
                  </h3>
                  <p className="text-sm text-white/60">
                    Smart recommendations to optimize your prompts and reduce token usage
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {top3.map((suggestion, i) => (
                  <div
                    key={i}
                    className="relative group p-4 rounded-2xl bg-[#0f0f10] border border-white/10 transition-transform hover:translate-y-[-1px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-1.5 rounded-full bg-gradient-to-br from-[#1A73E8]/40 to-[#FF14EF]/40">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                        {suggestion}
                      </p>
                    </div>

                    {/* Copy button */}
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(suggestion);
                        showCenterToast("Copied", "This prompt has been copied to clipboard");
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 w-9 h-9 rounded-full border border-white/10 flex items-center justify-center bg-black/30 hover:bg-black/50"
                      title="Copy"
                      aria-label="Copy"
                    >
                      <Copy className="w-4 h-4 text-white/90" />
                    </button>

                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/5 rounded-r-2xl bg-gradient-to-l from-[#FF14EF]/10 via-transparent to-transparent" />
                  </div>
                ))}

                <div className="mt-6 rounded-2xl border border-white/10 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-white" />
                    <span className="text-white">
                      {top3.length} optimization {top3.length === 1 ? "tip" : "tips"} available
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center max-w-[520px] mx-auto">
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-gradient-to-br from-[#1A73E8] to-[#FF14EF] grid place-items-center">
                <Lightbulb className="h-7 w-7 text-white" />
              </div>

              <h3 className="text-white text-2xl font-semibold mb-2">
                AI-Powered Suggestions
              </h3>
              <p className="text-white/70 text-base mb-8">
                Smart recommendations to optimize your prompts and reduce token usage
              </p>

              <h4 className="text-white text-lg font-medium mb-2">Ready to Optimize</h4>
              <p className="text-white/60 text-sm leading-relaxed px-6">
                Enter your prompt and click optimize to receive personalized suggestions
                for improving efficiency and reducing token usage.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Center Toast */}
      {centerToast && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
          <div
            className="pointer-events-auto w-[min(90vw,420px)] rounded-xl border border-white/10 bg-black shadow-[0_14px_50px_rgba(0,0,0,.7)] animate-in fade-in-0 zoom-in-95 duration-200"
          >
            <div className="p-5 sm:p-6 flex items-start gap-3.5">
              <div
                className="h-10 w-10 rounded-lg grid place-items-center shrink-0"
                style={{ backgroundImage: GRADIENT_BG }}
              >
                <Copy className="h-5 w-5 text-white" />
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
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionsPanel;
