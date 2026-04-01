// src/contexts/PagesContext.tsx
const PagesContext = createContext<PagesContextType | undefined>(undefined);

type PagesContextType = {
  // Smartgen
  smartgenPrompt: string;
  detailedPrompt: string;
  setSmartgenPrompt: (val: string) => void;
  setDetailedPrompt: (val: string) => void;
  smartgenFiles: File[];
  setSmartgenFiles: (val: File[]) => void;

  // Optimizer
  optimizerText: string;
  optimizedText: string;
  optimizerSuggestions: string[];
  setOptimizerText: (val: string) => void;
  setOptimizedText: (val: string) => void;
  setOptimizerSuggestions: (val: string[]) => void;
};

export const PagesProvider = ({ children }: { children: ReactNode }) => {
  const [smartgenPrompt, setSmartgenPrompt] = useState("");
  const [detailedPrompt, setDetailedPrompt] = useState("");
  const [smartgenFiles, setSmartgenFiles] = useState<File[]>([]);

  const [optimizerText, setOptimizerText] = useState("");
  const [optimizedText, setOptimizedText] = useState("");
  const [optimizerSuggestions, setOptimizerSuggestions] = useState<string[]>([]);

  return (
    <PagesContext.Provider
      value={{
        smartgenPrompt,
        detailedPrompt,
        setSmartgenPrompt,
        setDetailedPrompt,
        smartgenFiles,
        setSmartgenFiles,

        optimizerText,
        optimizedText,
        optimizerSuggestions,
        setOptimizerText,
        setOptimizedText,
        setOptimizerSuggestions,
      }}
    >
      {children}
    </PagesContext.Provider>
  );
};
