// // src/pages/PromptOptimizerPage.tsx
// import { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import TokenCircle from "@/components/TokenCircle";
// import PromptInput from "@/components/PromptInput";
// import { llmService } from "@/services/llmService"; // for optional fallback pre-count

// export default function PromptOptimizerPage() {
//   const { state } = useLocation();
//   const initialTextFromSmartgen: string = state?.initialText || "";

//   const [originalTokens, setOriginalTokens]   = useState(0);
//   const [originalWords, setOriginalWords]     = useState(0);
//   const [optimizedTokens, setOptimizedTokens] = useState(0);
//   const [optimizedWords, setOptimizedWords]   = useState(0);

//   // (Optional safety) If child counting somehow fails, pre-count once here
//   useEffect(() => {
//     if (!initialTextFromSmartgen) return;
//     llmService.countTokens(initialTextFromSmartgen)
//       .then(({ tokens, words }) => {
//         setOriginalTokens(tokens);
//         setOriginalWords(words);
//       })
//       .catch(() => {
//         // lightweight fallback estimate
//         const words = initialTextFromSmartgen.trim().split(/\s+/).filter(Boolean).length;
//         const tokens = Math.ceil(initialTextFromSmartgen.length / 4);
//         setOriginalTokens(tokens);
//         setOriginalWords(words);
//       });
//   }, [initialTextFromSmartgen]);

//   return (
//     <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
//       <TokenCircle
//         originalTokens={originalTokens}
//         optimizedTokens={optimizedTokens}
//         optimizedWords={optimizedWords}
//       />

//       <PromptInput
//         initialText={initialTextFromSmartgen}   // ← CRITICAL
//         onTokensChange={(t, w) => {             // called when text (incl. initial) is set
//           setOriginalTokens(t);
//           setOriginalWords(w);
//         }}
//         onOptimize={(_, t, w) => {              // called after Optimize
//           setOptimizedTokens(t);
//           setOptimizedWords(w);
//         }}
//       />
//     </div>
//   );
// }



// src/pages/PromptOptimizerPage.tsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TokenCircle from "@/components/TokenCircle";
import PromptInput from "@/components/PromptInput";
import { llmService } from "@/services/llmService"; // for optional fallback pre-count
 
export default function PromptOptimizerPage() {
  const { state } = useLocation();
  const initialTextFromSmartgen: string = state?.initialText || "";
 
  const [originalTokens, setOriginalTokens]   = useState(0);
  const [originalWords, setOriginalWords]     = useState(0);
  const [optimizedTokens, setOptimizedTokens] = useState(0);
  const [optimizedWords, setOptimizedWords]   = useState(0);
 
  // (Optional safety) If child counting somehow fails, pre-count once here
  useEffect(() => {
    if (!initialTextFromSmartgen) return;
    llmService.countTokens(initialTextFromSmartgen)
      .then(({ tokens, words }) => {
        setOriginalTokens(tokens);
        setOriginalWords(words);
      })
      .catch(() => {
        // lightweight fallback estimate
        const words = initialTextFromSmartgen.trim().split(/\s+/).filter(Boolean).length;
        const tokens = Math.ceil(initialTextFromSmartgen.length / 4);
        setOriginalTokens(tokens);
        setOriginalWords(words);
      });
  }, [initialTextFromSmartgen]);
 
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <TokenCircle
        originalTokens={originalTokens}
        optimizedTokens={optimizedTokens}
        optimizedWords={optimizedWords}
      />
 
      <PromptInput
        initialText={initialTextFromSmartgen}   // ← CRITICAL
        onTokensChange={(t, w) => {             // called when text (incl. initial) is set
          setOriginalTokens(t);
          setOriginalWords(w);
        }}
        onOptimize={(_, t, w) => {              // called after Optimize
          setOptimizedTokens(t);
          setOptimizedWords(w);
        }}
      />
    </div>
  );
}