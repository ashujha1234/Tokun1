import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import SellPromptModal from "@/components/SellPromptModal";

type AfterSubmitCb = (() => void) | null;

type Ctx = {
  openModal: (afterSubmit?: () => void) => void;
  closeModal: () => void;
  setAfterSubmit: (fn: AfterSubmitCb) => void;
};

const SellPromptModalCtx = createContext<Ctx | null>(null);

export const SellPromptModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [afterSubmit, setAfterSubmit] = useState<AfterSubmitCb>(null);

  const openModal = useCallback((cb?: () => void) => {
    if (cb) setAfterSubmit(() => cb);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => setOpen(false), []);

  const handleSubmitted = useCallback(() => {
    // close, then let the page that asked for it refresh itself
    setOpen(false);
    afterSubmit?.();
  }, [afterSubmit]);

  const value = useMemo<Ctx>(() => ({ openModal, closeModal, setAfterSubmit }), [openModal, closeModal]);

  return (
    <SellPromptModalCtx.Provider value={value}>
      {children}
      {/* single global instance, controlled here */}
      <SellPromptModal open={open} onOpenChange={setOpen} onPromptSubmitted={handleSubmitted} />
    </SellPromptModalCtx.Provider>
  );
};

export const useSellPromptModal = () => {
  const ctx = useContext(SellPromptModalCtx);
  if (!ctx) throw new Error("useSellPromptModal must be used inside SellPromptModalProvider");
  return ctx;
};
