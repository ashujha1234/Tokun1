// // import React, { createContext, useContext, useState, useEffect } from "react";
 
// // interface PromptState {
// //   userPrompt: string;
// //   detailedPrompt: string;
// //   setUserPrompt: (prompt: string) => void;
// //   setDetailedPrompt: (prompt: string) => void;
// //   clearPrompts: () => void;
// // }
 
// // const PromptContext = createContext<PromptState | undefined>(undefined);
 
// // export const PromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
// //   const [userPrompt, setUserPrompt] = useState<string>(
// //     localStorage.getItem("userPrompt") || ""
// //   );
// //   const [detailedPrompt, setDetailedPrompt] = useState<string>(
// //     localStorage.getItem("detailedPrompt") || ""
// //   );
 
// //   useEffect(() => {
// //     localStorage.setItem("userPrompt", userPrompt);
// //   }, [userPrompt]);
 
// //   useEffect(() => {
// //     localStorage.setItem("detailedPrompt", detailedPrompt);
// //   }, [detailedPrompt]);
 
// //   const clearPrompts = () => {
// //     setUserPrompt("");
// //     setDetailedPrompt("");
// //     localStorage.removeItem("userPrompt");
// //     localStorage.removeItem("detailedPrompt");
// //   };
 
// //   return (
// //     <PromptContext.Provider value={{ userPrompt, detailedPrompt, setUserPrompt, setDetailedPrompt, clearPrompts }}>
// //       {children}
// //     </PromptContext.Provider>
// //   );
// // };
 
// // export const usePrompt = () => {
// //   const context = useContext(PromptContext);
// //   if (context === undefined) {
// //     throw new Error("usePrompt must be used within a PromptProvider");
// //   }
// //   return context;
// // };


// import React, { createContext, useContext, useState } from "react";
 
// interface PromptState {
//   userPrompt: string;
//   detailedPrompt: string;
//   setUserPrompt: (prompt: string) => void;
//   setDetailedPrompt: (prompt: string) => void;
//   clearPrompts: () => void;
// }
 
// const PromptContext = createContext<PromptState | undefined>(undefined);
 
// export const PromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [userPrompt, setUserPromptState] = useState<string>(
//     localStorage.getItem("userPrompt") || ""
//   );
//   const [detailedPrompt, setDetailedPromptState] = useState<string>(
//     localStorage.getItem("detailedPrompt") || ""
//   );
 
//   // ⚡ Immediate and consistent sync to localStorage
//   const setUserPrompt = (prompt: string) => {
//     setUserPromptState(prompt);
//     if (prompt.trim() === "") {
//       localStorage.removeItem("userPrompt");
//     } else {
//       localStorage.setItem("userPrompt", prompt);
//     }
//   };
 
//   const setDetailedPrompt = (prompt: string) => {
//     setDetailedPromptState(prompt);
//     if (prompt.trim() === "") {
//       localStorage.removeItem("detailedPrompt");
//     } else {
//       localStorage.setItem("detailedPrompt", prompt);
//     }
//   };
 
//   // 🧹 Used by SmartGen’s “Clear” and by manual input clearing
//   const clearPrompts = () => {
//     setUserPromptState("");
//     setDetailedPromptState("");
//     localStorage.removeItem("userPrompt");
//     localStorage.removeItem("detailedPrompt");
//   };
 
//   return (
//     <PromptContext.Provider
//       value={{
//         userPrompt,
//         detailedPrompt,
//         setUserPrompt,
//         setDetailedPrompt,
//         clearPrompts,
//       }}
//     >
//       {children}
//     </PromptContext.Provider>
//   );
// };
 
// export const usePrompt = () => {
//   const context = useContext(PromptContext);
//   if (!context) {
//     throw new Error("usePrompt must be used within a PromptProvider");
//   }
//   return context;
// };


// src/contexts/PromptContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface PromptState {
  // SmartGen
  userPrompt: string;
  detailedPrompt: string;
  setUserPrompt: (prompt: string) => void;
  setDetailedPrompt: (prompt: string) => void;
  clearPrompts: () => void;

  // Optimizer
  optimizerInput: string;
  optimizerResult: string;
  setOptimizerInput: (text: string) => void;
  setOptimizerResult: (text: string) => void;
  clearOptimizer: () => void;
}

const PromptContext = createContext<PromptState | undefined>(undefined);

export const PromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getCurrentUserId = useCallback(() => {
    try {
      const u = localStorage.getItem("tokun_user");
      if (u) return JSON.parse(u)?.id || "anonymous";
    } catch {}
    return "anonymous";
  }, []);

  // ---- Storage keys (user-scoped) ----
  const sgUserPromptKey = (id?: string) => `userPrompt_${id ?? getCurrentUserId()}`;
  const sgDetailedPromptKey = (id?: string) => `detailedPrompt_${id ?? getCurrentUserId()}`;
  const optInputKey = (id?: string) => `optimizer_input_${id ?? getCurrentUserId()}`;
  const optResultKey = (id?: string) => `optimizer_result_${id ?? getCurrentUserId()}`;

  // ---- React state ----
  const [userPrompt, setUserPromptState] = useState("");
  const [detailedPrompt, setDetailedPromptState] = useState("");
  const [optimizerInput, setOptimizerInputState] = useState("");
  const [optimizerResult, setOptimizerResultState] = useState("");

  // ---- Load on mount or auth change ----
  useEffect(() => {
    const loadUserData = () => {
      const id = getCurrentUserId();
      if (id === "anonymous") {
        setUserPromptState("");
        setDetailedPromptState("");
        setOptimizerInputState("");
        setOptimizerResultState("");
        return;
      }

      setUserPromptState(sessionStorage.getItem(sgUserPromptKey(id)) || "");
      setDetailedPromptState(sessionStorage.getItem(sgDetailedPromptKey(id)) || "");
      setOptimizerInputState(sessionStorage.getItem(optInputKey(id)) || "");
      setOptimizerResultState(sessionStorage.getItem(optResultKey(id)) || "");
    };

    loadUserData();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "tokun_user" || e.key === "token") loadUserData();
      if (e.key === "token" && e.newValue === null) {
        clearPrompts();
        clearOptimizer();
      }
    };

    const onCustomLogout = () => {
      clearPrompts();
      clearOptimizer();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("tokun_logout", onCustomLogout);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("tokun_logout", onCustomLogout);
    };
  }, [getCurrentUserId]);

  // ---- SmartGen setters ----
  const setUserPrompt = (v: string) => {
    setUserPromptState(v);
    const id = getCurrentUserId();
    if (id !== "anonymous") {
      if (v.trim()) sessionStorage.setItem(sgUserPromptKey(id), v);
      else sessionStorage.removeItem(sgUserPromptKey(id));
    }
  };
  const setDetailedPrompt = (v: string) => {
    setDetailedPromptState(v);
    const id = getCurrentUserId();
    if (id !== "anonymous") {
      if (v.trim()) sessionStorage.setItem(sgDetailedPromptKey(id), v);
      else sessionStorage.removeItem(sgDetailedPromptKey(id));
    }
  };
  const clearPrompts = () => {
    const id = getCurrentUserId();
    setUserPromptState("");
    setDetailedPromptState("");
    if (id !== "anonymous") {
      sessionStorage.removeItem(sgUserPromptKey(id));
      sessionStorage.removeItem(sgDetailedPromptKey(id));
    }
  };

  // ---- Optimizer setters ----
  const setOptimizerInput = (v: string) => {
    setOptimizerInputState(v);
    const id = getCurrentUserId();
    if (id !== "anonymous") {
      if (v.trim()) sessionStorage.setItem(optInputKey(id), v);
      else sessionStorage.removeItem(optInputKey(id));
    }
  };
  const setOptimizerResult = (v: string) => {
    setOptimizerResultState(v);
    const id = getCurrentUserId();
    if (id !== "anonymous") {
      if (v.trim()) sessionStorage.setItem(optResultKey(id), v);
      else sessionStorage.removeItem(optResultKey(id));
    }
  };
  const clearOptimizer = () => {
    const id = getCurrentUserId();
    setOptimizerInputState("");
    setOptimizerResultState("");
    if (id !== "anonymous") {
      sessionStorage.removeItem(optInputKey(id));
      sessionStorage.removeItem(optResultKey(id));
    }
  };

  return (
    <PromptContext.Provider
      value={{
        userPrompt,
        detailedPrompt,
        setUserPrompt,
        setDetailedPrompt,
        clearPrompts,
        optimizerInput,
        optimizerResult,
        setOptimizerInput,
        setOptimizerResult,
        clearOptimizer,
      }}
    >
      {children}
    </PromptContext.Provider>
  );
};

export const usePrompt = () => {
  const ctx = useContext(PromptContext);
  if (!ctx) throw new Error("usePrompt must be used within a PromptProvider");
  return ctx;
};