// // src/pages/PromptOptimization.tsx
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";
// import { usePrompt } from "@/contexts/PromptContext";
// import Footer from "@/components/Footer";
// import Header from "@/components/Header";
// import PromptInput from "@/components/PromptInput";
// import SuggestionsPanel from "@/components/SuggestionsPanel";
// import TokenCircle from "@/components/TokenCircle";
// import ApiKeyModal from "@/components/ApiKeyModal";
// import TokenUsageSection from "@/components/TokenUsageSection";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import AppNavigation from "@/components/AppNavigation";
// import { llmService } from "@/services/llmService";

// type NavState = { initialText?: string } | null;

// export default function PromptOptimizationPage() {
//   const { isAuthenticated, refreshQuota } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const navState = (location.state as NavState) || null;

//   // ✅ Import all required prompt context methods
//   const {
//     setDetailedPrompt,
//     optimizerInput,
//     setOptimizerInput,
//     optimizerResult,
//     setOptimizerResult,
//     clearOptimizer,
//   } = usePrompt();

//   const [isLoading, setIsLoading] = useState(true);
//   const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
//   const [isKeySet, setIsKeySet] = useState(false);

//   const [originalTokens, setOriginalTokens] = useState(0);
//   const [originalWords, setOriginalWords] = useState(0);
//   const [optimizedTokens, setOptimizedTokens] = useState(0);
//   const [optimizedWords, setOptimizedWords] = useState(0);
//   const [suggestions, setSuggestions] = useState<string[]>([]);

//   // ✅ Initialize on mount
//   useEffect(() => {
//     setIsLoading(false);
//     if (!isAuthenticated) navigate("/login");

//     const cfg = llmService.getConfig();
//     setIsKeySet(!!cfg.apiKey);
//     if (!cfg.apiKey) setApiKeyModalOpen(true);

//     // ✅ Load SmartGen/Optimizer initial text if coming from nav state
//     if (navState?.initialText && !optimizerInput) {
//       setOptimizerInput(navState.initialText);
//     }
//   }, [isAuthenticated, navigate, navState, optimizerInput, setOptimizerInput]);

//   const handleTokensChange = (tokens: number, words: number) => {
//     setOriginalTokens(tokens);
//     setOriginalWords(words);
//   };

//   // ✅ When Optimize finishes
//   const handleOptimize = async (
//   text: string,
//   tokens: number,
//   words: number,
//   newSuggestions: string[]
// ) => {
//   setOptimizerResult(text); // ✅ only Optimizer result
//   setOptimizedWords(words);
//   setSuggestions(newSuggestions);
//   setOptimizedTokens(tokens);

//   try {
//     await refreshQuota();
//     console.log("PromptOptimization: Token count refreshed after optimization");
//   } catch (error) {
//     console.error("PromptOptimization: Refresh failed", error);
//   }
// };


//   // ✅ Handle Clear button click
//   const handleClearAll = () => {
//     clearOptimizer(); // clears both input + result for current user
//     setSuggestions([]);
//     setOriginalTokens(0);
//     setOriginalWords(0);
//     setOptimizedTokens(0);
//     setOptimizedWords(0);
//   };

//   const onSetApi = () => setApiKeyModalOpen(true);

//   if (isLoading) return null;

//   return (
//     <div className="dark min-h-screen" style={{ backgroundColor: "#030406" }}>
//       <div className="container mx-auto px-4 py-6">
//         <Header />

//         {/* Header Section */}
//        <div className="mt-6 sm:mt-8 text-center space-y-3">
//   <div className="flex justify-center pt-4 sm:pt-0">
//     <TokenUsageSection />
//   </div>
//           <h2
//             style={{
//               fontFamily: "Inter",
//               fontWeight: 600,
//               fontSize: 32,
//               color: "#fff",
//               marginTop: 12,
//             }}
//           >
//             Prompt Optimization Dashboard
//           </h2>
//         </div>

//         {/* Navigation */}
//         <div className="mt-4 flex justify-center">
//           <AppNavigation />
//         </div>

//         {/* Main grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
//           <div className="lg:col-span-2 space-y-8">
//             {/* Prompt Input + Optimization */}
//             <Card className="bg-transparent border-none shadow-none">
//               <CardContent className="pt-6">
//                 <PromptInput
//                   onTokensChange={handleTokensChange}
//                   onOptimize={handleOptimize}
//                   initialText={optimizerInput}
//                 />
//               </CardContent>
//             </Card>

//             {/* Suggestions (Desktop only) */}
//             <div className="hidden lg:block">
//               <SuggestionsPanel
//                 suggestions={suggestions}
//                 originalTokens={originalTokens}
//                 optimizedTokens={optimizedTokens}
//               />
//             </div>
//           </div>

//           {/* Right column */}
//           <div className="space-y-8">
//             {/* Token Usage Ring */}
//             <Card className="bg-[#121213] border-none shadow-lg py-6">
//               <CardContent>
//                 <TokenCircle
//                   originalTokens={originalTokens}
//                   optimizedTokens={optimizedTokens}
//                   optimizedWords={optimizedWords}
//                 />
//               </CardContent>
//             </Card>

//             {/* Quick Actions */}
//             <Card
//               className="border-none shadow-lg w-full"
//               style={{ backgroundColor: "#121213" }}
//             >
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-center text-white text-xl font-semibold">
//                   Quick Actions
//                 </CardTitle>
//               </CardHeader>

//               <CardContent className="space-y-3 flex flex-col items-center">
//                 <Button
//                   className="w-full max-w-[500px] h-[50px] rounded-[16px] border border-[#282829] bg-transparent text-white justify-start pl-5 hover:bg-white/5"
//                   variant="ghost"
//                   onClick={onSetApi}
//                 >
//                   {isKeySet ? "Update API Settings" : "Set API Settings"}
//                 </Button>

//                 {/* ✅ Add Clear All button */}
//                 <Button
//                   className="w-full max-w-[500px] h-[50px] rounded-[16px] border border-[#282829] bg-transparent text-white justify-start pl-5 hover:bg-white/5"
//                   variant="ghost"
//                   onClick={handleClearAll}
//                 >
//                   Clear Optimizer Data
//                 </Button>
//               </CardContent>
//             </Card>

//             {/* Suggestions (Mobile only) */}
//             <div className="block lg:hidden">
//               <SuggestionsPanel
//                 suggestions={suggestions}
//                 originalTokens={originalTokens}
//                 optimizedTokens={optimizedTokens}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <footer className="py-8 mt-8 text-center text-sm text-muted-foreground">
//           <p>© 2025 TOKUN. All rights reserved.</p>
//         </footer>
//       </div>

//       <ApiKeyModal
//         open={apiKeyModalOpen}
//         onOpenChange={setApiKeyModalOpen}
//         onSave={() => setIsKeySet(true)}
//       />
//       <div>
//               <Footer />
//             </div>
//     </div>
//   );
// }





// src/pages/PromptOptimization.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePrompt } from "@/contexts/PromptContext";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PromptInput from "@/components/PromptInput";
import SuggestionsPanel from "@/components/SuggestionsPanel";
import TokenCircle from "@/components/TokenCircle";
import ApiKeyModal from "@/components/ApiKeyModal";
import TokenUsageSection from "@/components/TokenUsageSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppNavigation from "@/components/AppNavigation";
import { llmService } from "@/services/llmService";

type NavState = { initialText?: string } | null;

export default function PromptOptimizationPage() {
  const { isAuthenticated, refreshQuota } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as NavState) || null;

  const {
    setDetailedPrompt,
    optimizerInput,
    setOptimizerInput,
    optimizerResult,
    setOptimizerResult,
    clearOptimizer,
  } = usePrompt();

  const [isLoading, setIsLoading] = useState(true);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [isKeySet, setIsKeySet] = useState(false);

  const [originalTokens, setOriginalTokens] = useState(0);
  const [originalWords, setOriginalWords] = useState(0);
  const [optimizedTokens, setOptimizedTokens] = useState(0);
  const [optimizedWords, setOptimizedWords] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setIsLoading(false);
    if (!isAuthenticated) navigate("/login");

    const cfg = llmService.getConfig();
    setIsKeySet(!!cfg.apiKey);
    if (!cfg.apiKey) setApiKeyModalOpen(true);

    if (navState?.initialText && !optimizerInput) {
      setOptimizerInput(navState.initialText);
    }
  }, [isAuthenticated, navigate, navState, optimizerInput, setOptimizerInput]);

  const handleTokensChange = (tokens: number, words: number) => {
    setOriginalTokens(tokens);
    setOriginalWords(words);
  };

  const handleOptimize = async (
    text: string,
    tokens: number,
    words: number,
    newSuggestions: string[]
  ) => {
    setOptimizerResult(text);
    setOptimizedWords(words);
    setSuggestions(newSuggestions);
    setOptimizedTokens(tokens);

    try {
      await refreshQuota();
      console.log("PromptOptimization: Token count refreshed after optimization");
    } catch (error) {
      console.error("PromptOptimization: Refresh failed", error);
    }
  };

  const handleClearAll = () => {
    clearOptimizer();
    setSuggestions([]);
    setOriginalTokens(0);
    setOriginalWords(0);
    setOptimizedTokens(0);
    setOptimizedWords(0);
  };

  const onSetApi = () => setApiKeyModalOpen(true);

  if (isLoading) return null;

  return (
    <div className="dark min-h-screen" style={{ backgroundColor: "#030406" }}>
      <div className="container mx-auto px-4 py-6">

        <Header />
          <Header />
        {/* Header Section */}
      <Header />

{/* Header Section */}
{/* Header Section */}
<div className="mt-20 sm:mt-24 lg:mt-28 text-center">
  <h2
    className="text-[22px] sm:text-[28px] lg:text-[32px] font-semibold text-white mb-2 sm:mb-3"
    style={{ fontFamily: "Inter" }}
  >
    Prompt Optimization Dashboard
  </h2>

  <div className="flex justify-center">
    <TokenUsageSection className="mt-1 sm:mt-2 lg:mt-2" />
  </div>
</div>

        {/* Navigation */}
        <div className="mt-4 flex justify-center">
          <AppNavigation />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

          <div className="lg:col-span-2 space-y-8">

            {/* Prompt Input */}
            <Card className="bg-transparent border-none shadow-none">
              <CardContent className="pt-6">
                <PromptInput
                  onTokensChange={handleTokensChange}
                  onOptimize={handleOptimize}
                  initialText={optimizerInput}
                />
              </CardContent>
            </Card>

            {/* Suggestions (Desktop only) */}
            <div className="hidden lg:block">
              <SuggestionsPanel
                suggestions={suggestions}
                originalTokens={originalTokens}
                optimizedTokens={optimizedTokens}
              />
            </div>

          </div>

          {/* Right column */}
          <div className="space-y-8">

            {/* Token Circle */}
            <Card className="bg-[#121213] border-none shadow-lg py-6">
              <CardContent>
                <TokenCircle
                  originalTokens={originalTokens}
                  optimizedTokens={optimizedTokens}
                  optimizedWords={optimizedWords}
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card
              className="border-none shadow-lg w-full"
              style={{ backgroundColor: "#121213" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-white text-xl font-semibold">
                  Quick Actions
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 flex flex-col items-center">

                <Button
                  className="w-full max-w-[500px] h-[50px] rounded-[16px] border border-[#282829] bg-transparent text-white justify-start pl-5 hover:bg-white/5"
                  variant="ghost"
                  onClick={onSetApi}
                >
                  {isKeySet ? "Update API Settings" : "Set API Settings"}
                </Button>

                <Button
                  className="w-full max-w-[500px] h-[50px] rounded-[16px] border border-[#282829] bg-transparent text-white justify-start pl-5 hover:bg-white/5"
                  variant="ghost"
                  onClick={handleClearAll}
                >
                  Clear Optimizer Data
                </Button>

              </CardContent>
            </Card>

            {/* Suggestions (Mobile only) */}
            <div className="block lg:hidden">
              <SuggestionsPanel
                suggestions={suggestions}
                originalTokens={originalTokens}
                optimizedTokens={optimizedTokens}
              />
            </div>

          </div>
        </div>

        {/* Footer */}
       

      </div>

      <ApiKeyModal
        open={apiKeyModalOpen}
        onOpenChange={setApiKeyModalOpen}
        onSave={() => setIsKeySet(true)}
      />

      <div>
        <Footer />
      </div>

    </div>
  );
}

