
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import Header from "@/components/Header";
// import AppNavigation from "@/components/AppNavigation";
// import TokenCircle from "@/components/TokenCircle";
// import PromptInput from "@/components/PromptInput";
// import SuggestionsPanel from "@/components/SuggestionsPanel";
// import ApiKeyModal from "@/components/ApiKeyModal";
// import SmarterPrompt from "@/components/SmarterPrompt";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { llmService } from "@/services/llmService";
// import { Button } from "@/components/ui/button";
// import { ArrowRight, Sparkles, Settings } from "lucide-react";
// import { toast } from "@/components/ui/use-toast";
// import TokenUsageStats from "@/components/TokenUsageStats";
// import { useAuth } from "@/contexts/AuthContext";
// import TokenUsageSection from "@/components/TokenUsageSection";
// // Check if running in extension context
// const isExtensionContext = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

// // Helper function for safely accessing chrome storage
// const getChromeStorage = (key: string, defaultValue: any): Promise<any> => {
//   return new Promise((resolve) => {
//     if (isExtensionContext) {
//       chrome.storage.local.get([key], (result) => {
//         resolve(result[key] !== undefined ? result[key] : defaultValue);
//       });
//     } else {
//       // Use localStorage as fallback when not in extension context
//       const value = localStorage.getItem(key);
//       resolve(value !== null ? JSON.parse(value) : defaultValue);
//     }
//   });
// };

// // Helper function for safely setting chrome storage
// const setChromeStorage = (key: string, value: any): void => {
//   if (isExtensionContext) {
//     chrome.storage.local.set({ [key]: value });
//   } else {
//     // Use localStorage as fallback when not in extension context
//     localStorage.setItem(key, JSON.stringify(value));
//   }
// };

// const Index = () => {
//   const { isAuthenticated } = useAuth();
//   const navigate = useNavigate();
//   const [activeSection, setActiveSection] = useState("smartgen");
//   const [originalTokens, setOriginalTokens] = useState(0);
//   const [originalWords, setOriginalWords] = useState(0);
//   const [optimizedTokens, setOptimizedTokens] = useState(0);
//   const [optimizedWords, setOptimizedWords] = useState(0);
//   const [optimizedText, setOptimizedText] = useState("");
//   const [suggestions, setSuggestions] = useState<string[]>([]);
//   const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
//   const [tokenLimit, setTokenLimit] = useState(100000);
//   const [isKeySet, setIsKeySet] = useState(false);
//   const [totalTokensUsed, setTotalTokensUsed] = useState(0);
//   const [promptText, setPromptText] = useState("");

//   // Check if API key is set on first load
//   useEffect(() => {
//     const config = llmService.getConfig();
//     setIsKeySet(!!config.apiKey);
//     if (!config.apiKey) {
//       setApiKeyModalOpen(true);
//     }
    
//     // Load saved total tokens from storage
//     const loadInitialData = async () => {
//       const savedTokens = await getChromeStorage('total_tokens_used', 0);
//       setTotalTokensUsed(Number(savedTokens));
      
//       const savedLimit = await getChromeStorage('token_limit', 100000);
//       setTokenLimit(Number(savedLimit));
//     };
    
//     loadInitialData();
//   }, []);

//   // Redirect to login if not authenticated
//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate("/login");
//     }
//   }, [isAuthenticated, navigate]);

//   const handleTokensChange = (tokens: number, words: number) => {
//     setOriginalTokens(tokens);
//     setOriginalWords(words);
//   };

//   const handleOptimize = (text: string, tokens: number, words: number, newSuggestions: string[]) => {
//     setOptimizedText(text);
//     setOptimizedTokens(tokens);
//     setOptimizedWords(words);
//     setSuggestions(newSuggestions);
    
//     const reduction = originalTokens - tokens;
//     const percentReduction = originalTokens > 0 ? Math.round((reduction / originalTokens) * 100) : 0;
    
//     // Update total tokens used
//     const newTotalTokens = totalTokensUsed + originalTokens;
//     setTotalTokensUsed(newTotalTokens);
    
//     // Save to storage
//     setChromeStorage('total_tokens_used', newTotalTokens);
    
//     toast({
//       title: "Prompt Optimized",
//       description: `Reduced by ${reduction} tokens (${percentReduction}%)`,
//     });
//   };

//   // Check if token usage is getting low and alert the user
//   useEffect(() => {
//     const remainingTokens = tokenLimit - totalTokensUsed;
//     if (remainingTokens <= 10000 && remainingTokens > 0) {
//       toast({
//         title: "Token Limit Warning",
//         description: `You have only ${remainingTokens.toLocaleString()} tokens left in your allocation`,
//         variant: "destructive",
//       });
//     }
//   }, [totalTokensUsed, tokenLimit]);

//  const handleSmartgenPromptGenerated = (prompt: string) => {
//   const generatedTokens = Math.ceil(prompt.length / 4);
//   const newTotalTokens = totalTokensUsed + generatedTokens;

//   setTotalTokensUsed(newTotalTokens);
//   setChromeStorage('total_tokens_used', newTotalTokens);

//   toast({
//     title: "Detailed Prompt Generated",
//     description: "Your enhanced prompt is ready. You can now export or use it.",
//   });
// };


//   const handleUseInOptimizer = (prompt: string) => {
//     setPromptText(prompt);
//     setActiveSection("prompt-optimization");
//     // Scroll to the prompt optimization section
//     setTimeout(() => {
//       const element = document.getElementById('prompt-optimization');
//       if (element) {
//         element.scrollIntoView({ behavior: 'smooth' });
//       }
//     }, 100);
//   };

//   if (!isAuthenticated) {
//     return null;
//   }

//   return (
//     <div className="dark min-h-screen text-foreground" style={{ backgroundColor: '#030406' }}>
//       <div className="container mx-auto px-4 py-6">
//         <Header />
        
//        {/* Token Usage Section */}
//         <TokenUsageSection 
//   totalTokensUsed={totalTokensUsed} 
//   tokenLimit={tokenLimit} 
// />






//         {/* What would you like to create today? heading */}
//         <div className="mb-8 text-center">
//           <h1 className="text-4xl font-bold text-white mb-6">What would you like to create today?</h1>
//         </div>
        
//         <AppNavigation 
//           activeSection={activeSection}
//           onSectionChange={setActiveSection}
//         />
        
//         {/* Smartgen Section - Now appears first */}
//         <section id="smartgen" className="py-8">
//  <div className="mb-8 mx-auto text-center w-[701px]">
//   <p className="text-white text-[32px] leading-[100%]" style={{ letterSpacing: "0%" }}>
//     <span style={{ fontFamily: "Inter", fontWeight: 600 }}>
//       Smartgen – Get detailed prompts for{" "}
//     </span>
//     <span style={{ fontFamily: "DM Serif Text", fontWeight: 400, fontStyle: "italic" }}>
//       any topic
//     </span>
//     <span style={{ fontFamily: "Inter", fontWeight: 600 }}>.</span>
//   </p>
// </div>



//           <SmarterPrompt 
//             onPromptGenerated={handleSmartgenPromptGenerated}
//             onUseInOptimizer={handleUseInOptimizer}
//           />
//         </section>

//         {/* Prompt Optimization Section */}
//         <section id="prompt-optimization" className="py-8 border-t border-border/20">
         
          
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
//             {/* Main panel */}
       
            
//             {/* Side panel with token visualization */}
//            <div className="space-y-8">
//  <Card
//   className="bg-[#121213] border-none shadow-none py-6"
// >
//   <CardHeader className="pb-2">
//     <CardTitle className="text-lg text-center text-tokun"></CardTitle>
//   </CardHeader>
//   <CardContent>
//     {/* NEW usage: pass original & optimized; no extra stats underneath */}
//     <TokenCircle
//       originalTokens={originalTokens}
//       optimizedTokens={optimizedTokens}
//     />
//   </CardContent>
// </Card>

              
              
              
// <Card
//   className="border-none shadow-lg w-full"
//   style={{ backgroundColor: "#121213" }}
// >
//   <CardHeader className="pb-2">
//     <CardTitle className="text-center text-white text-xl font-semibold">
//       Quick Actions
//     </CardTitle>
//   </CardHeader>

//   <CardContent className="space-y-3 flex flex-col items-center">
//     {[
//       isKeySet ? "Update API Settings" : "Set API Settings",
//       "Adjust Token Limit",
//       "Reset Token Count",
//     ].map((text, index) => (
//       <Button
//         key={index}
//         className="w-full max-w-[500px] h-[50px] rounded-[16px] border border-[#282829] bg-transparent text-white justify-start pl-5 hover:bg-white/5"
//         variant="ghost"
//         onClick={() => {
//           if (index === 0) {
//             setApiKeyModalOpen(true);
//           } else if (index === 1) {
//             const newLimit = parseInt(
//               prompt("Enter new token limit:", tokenLimit.toString()) ||
//                 String(tokenLimit)
//             );
//             if (!isNaN(newLimit) && newLimit > 0) {
//               setTokenLimit(newLimit);
//               setChromeStorage("token_limit", newLimit);
//               toast({
//                 title: "Token limit updated",
//                 description: `New limit: ${newLimit.toLocaleString()} tokens`,
//               });
//             }
//           } else if (index === 2) {
//             if (confirm("Reset total token count?")) {
//               setTotalTokensUsed(0);
//               setChromeStorage("total_tokens_used", 0);
//               toast({
//                 title: "Token count reset",
//                 description: "Total token count has been reset to zero",
//               });
//             }
//           }
//         }}
//       >
//         {text}
//       </Button>
//     ))}
//   </CardContent>
// </Card>


              
//               <div className="block lg:hidden">
//                 <SuggestionsPanel 
//                   suggestions={suggestions}
//                   originalTokens={originalTokens}
//                   optimizedTokens={optimizedTokens}
//                 />
//               </div>
//             </div>






            
//           </div>
//         </section>
        
//         <footer className="py-8 mt-8 text-center text-sm text-muted-foreground">
//           <p>© 2025 TOKUN. All rights reserved.</p>
//         </footer>
//       </div>
      
//       <ApiKeyModal 
//         open={apiKeyModalOpen}
//         onOpenChange={setApiKeyModalOpen}
//         onSave={() => setIsKeySet(true)}
//       />
//     </div>
//   );
// };

// export default Index;


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AppNavigation from "@/components/AppNavigation";
import TokenCircle from "@/components/TokenCircle";
import PromptInput from "@/components/PromptInput";
import SuggestionsPanel from "@/components/SuggestionsPanel";
import ApiKeyModal from "@/components/ApiKeyModal";
import SmarterPrompt from "@/components/SmarterPrompt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { llmService } from "@/services/llmService";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import TokenUsageSection from "@/components/TokenUsageSection";

// Check if running in extension context
const isExtensionContext = typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;

// Helper function for safely accessing chrome storage
const getChromeStorage = (key: string, defaultValue: any): Promise<any> => {
  return new Promise((resolve) => {
    if (isExtensionContext) {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] !== undefined ? result[key] : defaultValue);
      });
    } else {
      const value = localStorage.getItem(key);
      resolve(value !== null ? JSON.parse(value) : defaultValue);
    }
  });
};

// Helper function for safely setting chrome storage
const setChromeStorage = (key: string, value: any): void => {
  if (isExtensionContext) {
    chrome.storage.local.set({ [key]: value });
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("smartgen");
  const [originalTokens, setOriginalTokens] = useState(0);
  const [originalWords, setOriginalWords] = useState(0);
  const [optimizedTokens, setOptimizedTokens] = useState(0);
  const [optimizedWords, setOptimizedWords] = useState(0);
  const [optimizedText, setOptimizedText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [tokenLimit, setTokenLimit] = useState(100000);
  const [isKeySet, setIsKeySet] = useState(false);
  const [totalTokensUsed, setTotalTokensUsed] = useState(0);
  const [promptText, setPromptText] = useState("");

  // Check if API key is set on first load
  useEffect(() => {
    const config = llmService.getConfig();
    setIsKeySet(!!config.apiKey);
    if (!config.apiKey) {
      setApiKeyModalOpen(true);
    }

    const loadInitialData = async () => {
      const savedTokens = await getChromeStorage("total_tokens_used", 0);
      setTotalTokensUsed(Number(savedTokens));

      const savedLimit = await getChromeStorage("token_limit", 100000);
      setTokenLimit(Number(savedLimit));
    };

    loadInitialData();
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleTokensChange = (tokens: number, words: number) => {
    setOriginalTokens(tokens);
    setOriginalWords(words);
  };

  const handleOptimize = (text: string, tokens: number, words: number, newSuggestions: string[]) => {
    setOptimizedText(text);
    setOptimizedTokens(tokens);
    setOptimizedWords(words);
    setSuggestions(newSuggestions);

    const reduction = originalTokens - tokens;
    const percentReduction = originalTokens > 0 ? Math.round((reduction / originalTokens) * 100) : 0;

    // Update total tokens used
    const newTotalTokens = totalTokensUsed + originalTokens;
    setTotalTokensUsed(newTotalTokens);

    // Save to storage
    setChromeStorage("total_tokens_used", newTotalTokens);

    // ✅ Removed toast
    // e.g. Previously: "Prompt Optimized", "Reduced by ... tokens"
  };

  // Check if token usage is getting low (no alert now)
  useEffect(() => {
    const remainingTokens = tokenLimit - totalTokensUsed;
    if (remainingTokens <= 10000 && remainingTokens > 0) {
      // ✅ Removed destructive toast
    }
  }, [totalTokensUsed, tokenLimit]);

  const handleSmartgenPromptGenerated = (prompt: string) => {
    const generatedTokens = Math.ceil(prompt.length / 4);
    const newTotalTokens = totalTokensUsed + generatedTokens;

    setTotalTokensUsed(newTotalTokens);
    setChromeStorage("total_tokens_used", newTotalTokens);

    // ✅ Removed toast
    // e.g. Previously: "Detailed Prompt Generated"
  };

  const handleUseInOptimizer = (prompt: string) => {
    setPromptText(prompt);
    setActiveSection("prompt-optimization");

    setTimeout(() => {
      const element = document.getElementById("prompt-optimization");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dark min-h-screen text-foreground" style={{ backgroundColor: "#030406" }}>
      <div className="container mx-auto px-4 py-6">
        <Header />

        {/* Token Usage Section */}
        <TokenUsageSection totalTokensUsed={totalTokensUsed} tokenLimit={tokenLimit} />

        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-6">What would you like to create today?</h1>
        </div>

        <AppNavigation activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* Smartgen Section */}
        <section id="smartgen" className="py-8">
          <div className="mb-8 mx-auto text-center w-[701px]">
            <p className="text-white text-[32px] leading-[100%]" style={{ letterSpacing: "0%" }}>
              <span style={{ fontFamily: "Inter", fontWeight: 600 }}>Smartgen – Get detailed prompts for{" "}</span>
              <span style={{ fontFamily: "DM Serif Text", fontWeight: 400, fontStyle: "italic" }}>any topic</span>
              <span style={{ fontFamily: "Inter", fontWeight: 600 }}>.</span>
            </p>
          </div>

          <SmarterPrompt onPromptGenerated={handleSmartgenPromptGenerated} onUseInOptimizer={handleUseInOptimizer} />
        </section>

        {/* Prompt Optimization Section */}
        <section id="prompt-optimization" className="py-8 border-t border-border/20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Side panel with token visualization */}
            <div className="space-y-8">
              <Card className="bg-[#121213] border-none shadow-none py-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-center text-tokun"></CardTitle>
                </CardHeader>
                <CardContent>
                  <TokenCircle originalTokens={originalTokens} optimizedTokens={optimizedTokens} />
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg w-full" style={{ backgroundColor: "#121213" }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-center text-white text-xl font-semibold">Quick Actions</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3 flex flex-col items-center">
                  {[
                    isKeySet ? "Update API Settings" : "Set API Settings",
                    "Adjust Token Limit",
                    "Reset Token Count",
                  ].map((text, index) => (
                    <Button
                      key={index}
                      className="w-full max-w-[500px] h-[50px] rounded-[16px] border border-[#282829] bg-transparent text-white justify-start pl-5 hover:bg-white/5"
                      variant="ghost"
                      onClick={() => {
                        if (index === 0) {
                          setApiKeyModalOpen(true);
                        } else if (index === 1) {
                          const newLimit = parseInt(prompt("Enter new token limit:", tokenLimit.toString()) || String(tokenLimit));
                          if (!isNaN(newLimit) && newLimit > 0) {
                            setTokenLimit(newLimit);
                            setChromeStorage("token_limit", newLimit);
                            // ✅ Removed toast
                          }
                        } else if (index === 2) {
                          if (confirm("Reset total token count?")) {
                            setTotalTokensUsed(0);
                            setChromeStorage("total_tokens_used", 0);
                            // ✅ Removed toast
                          }
                        }
                      }}
                    >
                      {text}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <div className="block lg:hidden">
                <SuggestionsPanel suggestions={suggestions} />
              </div>
            </div>
          </div>
        </section>

        <footer className="py-8 mt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 TOKUN. All rights reserved.</p>
        </footer>
      </div>

      <ApiKeyModal open={apiKeyModalOpen} onOpenChange={setApiKeyModalOpen} onSave={() => setIsKeySet(true)} />
    </div>
  );
};

export default Index;
