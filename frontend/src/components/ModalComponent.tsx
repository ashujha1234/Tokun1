// // 


// import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
// import { createPortal } from "react-dom";
// import { Button } from "@/components/ui/button";

// export default function ModalComponent({
//   isOpen,
//   onClose,
//   onSave,
//   anchorRef,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave?: (payload?: { title?: string; type?: string; category?: string; quick?: boolean }) => void;
//   anchorRef?: React.RefObject<HTMLElement>;
// }) {
//   const [title, setTitle] = useState("");
//   const [isCreating, setIsCreating] = useState(false);
//   const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
//   const panelRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (isOpen) { setTitle(""); setIsCreating(false); }
//   }, [isOpen]);

//   const updatePosition = () => {
//     const a = anchorRef?.current;
//     const width = 340, gap = 8, margin = 12;
//     if (!a) { setPos({ top: 80, left: window.innerWidth - width - margin }); return; }
//     const r = a.getBoundingClientRect();
//     const left = Math.min(Math.max(margin, r.right - width), window.innerWidth - width - margin);
//     const top = r.bottom + gap;
//     setPos({ top, left });
//   };

//   useLayoutEffect(() => { if (isOpen) updatePosition(); }, [isOpen]);
//   useEffect(() => {
//     if (!isOpen) return;
//     const onScroll = () => updatePosition();
//     const onResize = () => updatePosition();
//     window.addEventListener("scroll", onScroll, true);
//     window.addEventListener("resize", onResize);
//     return () => {
//       window.removeEventListener("scroll", onScroll, true);
//       window.removeEventListener("resize", onResize);
//     };
//   }, [isOpen]);

//   useEffect(() => {
//     if (!isOpen) return;
//     const onDocClick = (e: MouseEvent) => {
//       const t = e.target as Node;
//       if (panelRef.current && !panelRef.current.contains(t) && !anchorRef?.current?.contains(t)) onClose();
//     };
//     const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
//     document.addEventListener("mousedown", onDocClick);
//     document.addEventListener("keydown", onKey);
//     return () => {
//       document.removeEventListener("mousedown", onDocClick);
//       document.removeEventListener("keydown", onKey);
//     };
//   }, [isOpen, onClose, anchorRef]);

//   if (!isOpen) return null;

//   const handleCreate = () => {
//     onSave?.({ title: title.trim(), type: "prompt-optimization" });
//     onClose();
//   };

//   // Quick-save to All Saved (no name required)
//   const handleQuickSaveAll = () => {
//     onSave?.({ category: "All Saved", quick: true, type: "prompt-optimization" });
//     onClose();
//   };

//   const panel = (
//     <>
//       <div
//         ref={panelRef}
//         className="fixed z-[10000] w-[340px] rounded-2xl border border-[#282829] bg-[#17171A] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.45)] font-inter"
//         style={{ top: pos.top, left: pos.left }}
//         role="dialog"
//         aria-modal="false"
//       >
//         {/* All Saved header = quick save */}
//         <div className="flex items-center justify-between mb-3">
//           <button
//             onClick={handleQuickSaveAll}
//             className="flex items-center gap-3 rounded-[10px] px-2 py-1 hover:bg-white/5"
//             title="Save to All Saved"
//           >
//             <img src="/icons/mod1.png" alt="" className="h-5 w-5" />
//             <span className="text-[15px] leading-[1.2] text-white">All Saved</span>
//           </button>
//           <button
//             onClick={handleQuickSaveAll}
//             title="Quick save to All Saved"
//             aria-label="Quick save"
//             className="h-8 w-8 rounded-full grid place-items-center hover:bg-white/10"
//           >
//             <img src="/icons/cop.png" alt="Save" className="h-5 w-5 opacity-90" />
//           </button>
//         </div>

//         {/* Create collection (custom name) */}
//         <button
//           onClick={() => setIsCreating(true)}
//           className="flex w-full items-center gap-3 rounded-[16px] px-3 py-3 text-left hover:bg-white/5"
//           title="Create collection with custom name"
//         >
//           <img src="/icons/dd1.png" alt="" className="h-5 w-5 shrink-0" />
//           <span className="text-white text-[14px]">Create collection</span>
//         </button>

//         {isCreating && (
//           <div className="mt-3">
//             <label className="text-[12px] leading-[1.15] text-white/70">Name/Title</label>
//             <input
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="e.g., Advanced Code Review Prompt"
//               className="mt-2 h-[44px] w-full rounded-[12px] bg-[#252526] px-3 text-[14px] text-white placeholder:text-[#3B3B3B] outline-none"
//               autoFocus
//             />
//           </div>
//         )}

//         <div className="mt-4 flex items-center gap-3">
//           <Button onClick={onClose} variant="outline" className="h-[44px] flex-1 rounded-full border-0 bg-[#333335] text-white">
//             Cancel
//           </Button>
//           <Button
//             onClick={handleCreate}
//             disabled={!isCreating || !title.trim()}
//             className="h-[44px] flex-1 rounded-full text-white disabled:opacity-50"
//             style={{ backgroundImage: "linear-gradient(90deg,#FF14EF 0%, #1A73E8 100%)" }}
//           >
//             Create
//           </Button>
//         </div>
//       </div>

//       {/* caret */}
//       <div
//         className="fixed z-[9999] pointer-events-none"
//         style={{
//           top: pos.top - 6,
//           left: pos.left + 300,
//           width: 12,
//           height: 12,
//           transform: "rotate(45deg)",
//           background: "#17171A",
//           borderLeft: "1px solid #282829",
//           borderTop: "1px solid #282829",
//         }}
//       />
//     </>
//   );

//   return createPortal(panel, document.body);
// }




// import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
// import { createPortal } from "react-dom";
// import { Button } from "@/components/ui/button";

// export default function ModalComponent({
//   isOpen,
//   onClose,
//   onSave,
//   anchorRef,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave?: (payload?: { title?: string; type?: string; category?: string; quick?: boolean }) => void;
//   anchorRef?: React.RefObject<HTMLElement>;
// }) {
//   const [title, setTitle] = useState("");
//   const [isCreating, setIsCreating] = useState(false);
//   const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
//   const panelRef = useRef<HTMLDivElement | null>(null);
//   const inputRef = useRef<HTMLInputElement | null>(null);

//   useEffect(() => {
//     if (isOpen) {
//       setTitle("");
//       setIsCreating(false);
//     }
//   }, [isOpen]);

//   const updatePosition = () => {
//     const a = anchorRef?.current;
//     const width = 340, gap = 8, margin = 12;
//     if (!a) {
//       setPos({ top: 80, left: window.innerWidth - width - margin });
//       return;
//     }
//     const r = a.getBoundingClientRect();
//     const left = Math.min(Math.max(margin, r.right - width), window.innerWidth - width - margin);
//     const top = r.bottom + gap;
//     setPos({ top, left });
//   };

//   useLayoutEffect(() => { if (isOpen) updatePosition(); }, [isOpen]);

//   useEffect(() => {
//     if (!isOpen) return;
//     const onScroll = () => updatePosition();
//     const onResize = () => updatePosition();
//     window.addEventListener("scroll", onScroll, true);
//     window.addEventListener("resize", onResize);
//     return () => {
//       window.removeEventListener("scroll", onScroll, true);
//       window.removeEventListener("resize", onResize);
//     };
//   }, [isOpen]);

//   useEffect(() => {
//     if (!isOpen) return;
//     const onDocClick = (e: MouseEvent) => {
//       const t = e.target as Node;
//       if (panelRef.current && !panelRef.current.contains(t) && !anchorRef?.current?.contains(t)) onClose();
//     };
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     document.addEventListener("mousedown", onDocClick);
//     document.addEventListener("keydown", onKey);
//     return () => {
//       document.removeEventListener("mousedown", onDocClick);
//       document.removeEventListener("keydown", onKey);
//     };
//   }, [isOpen, onClose, anchorRef]);

//   useEffect(() => {
//     if (isOpen && isCreating) {
//       // small defer so element exists
//       setTimeout(() => inputRef.current?.focus(), 0);
//     }
//   }, [isOpen, isCreating]);

//   if (!isOpen) return null;

//   const handleCreate = () => {
//     const trimmed = title.trim();
//     if (!trimmed) return;
//     onSave?.({ title: trimmed, type: "prompt-optimization" });
//     onClose();
//   };

//   const handleQuickSaveAll = () => {
//     onSave?.({ category: "All Saved", quick: true, type: "prompt-optimization" });
//     onClose();
//   };

//   const panel = (
//     <>
//       <div
//         ref={panelRef}
//         className="fixed z-[10000] w-[340px] rounded-2xl border border-[#282829] bg-[#17171A] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.45)] font-inter"
//         style={{ top: pos.top, left: pos.left }}
//         role="dialog"
//         aria-modal="false"
//         aria-labelledby="smartgen-save-title"
//       >
//         {/* All Saved = quick save */}
//         <div className="flex items-center justify-between mb-3">
//           <button
//             onClick={handleQuickSaveAll}
//             className="flex items-center gap-3 rounded-[10px] px-2 py-1 hover:bg-white/5"
//             title="Save to All Saved"
//             aria-label="Save to All Saved"
//           >
//             <img src="/icons/mod1.png" alt="" className="h-5 w-5" />
//             <span id="smartgen-save-title" className="text-[15px] leading-[1.2] text-white">All Saved</span>
//           </button>
//           <button
//             onClick={handleQuickSaveAll}
//             title="Quick save to All Saved"
//             aria-label="Quick save"
//             className="h-8 w-8 rounded-full grid place-items-center hover:bg-white/10"
//           >
//             <img src="/icons/cop.png" alt="Save" className="h-5 w-5 opacity-90" />
//           </button>
//         </div>

//         {/* Create collection */}
//         <button
//           onClick={() => setIsCreating(true)}
//           className="flex w-full items-center gap-3 rounded-[16px] px-3 py-3 text-left hover:bg-white/5"
//           title="Create collection with custom name"
//         >
//           <img src="/icons/dd1.png" alt="" className="h-5 w-5 shrink-0" />
//           <span className="text-white text-[14px]">Create collection</span>
//         </button>

//         {isCreating && (
//           <div className="mt-3">
//             <label className="text-[12px] leading-[1.15] text-white/70">Name/Title</label>
//             <input
//               ref={inputRef}
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" && title.trim()) {
//                   e.preventDefault();
//                   handleCreate();
//                 }
//               }}
//               placeholder="e.g., Advanced Code Review Prompt"
//               className="mt-2 h-[44px] w-full rounded-[12px] bg-[#252526] px-3 text-[14px] text-white placeholder:text-[#3B3B3B] outline-none"
//             />
//           </div>
//         )}

//         <div className="mt-4 flex items-center gap-3">
//           <Button
//             onClick={onClose}
//             variant="outline"
//             className="h-[44px] flex-1 rounded-full border-0 bg-[#333335] text-white"
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleCreate}
//             disabled={!isCreating || !title.trim()}
//             className="h-[44px] flex-1 rounded-full text-white disabled:opacity-50"
//             style={{ backgroundImage: "linear-gradient(90deg,#FF14EF 0%, #1A73E8 100%)" }}
//           >
//             Create
//           </Button>
//         </div>
//       </div>

//       {/* caret */}
//       <div
//         className="fixed z-[9999] pointer-events-none"
//         style={{
//           top: pos.top - 6,
//           left: pos.left + 300,
//           width: 12,
//           height: 12,
//           transform: "rotate(45deg)",
//           background: "#17171A",
//           borderLeft: "1px solid #282829",
//           borderTop: "1px solid #282829",
//         }}
//       />
//     </>
//   );

//   return createPortal(panel, document.body);
// }
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

export default function ModalComponent({
  isOpen,
  onClose,
  onSave,
  anchorRef,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (payload?: { title?: string; type?: string; category?: string; quick?: boolean }) => void;
  anchorRef?: React.RefObject<HTMLElement>;
}) {
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setIsCreating(false);
    }
  }, [isOpen]);

  const updatePosition = () => {
    const a = anchorRef?.current;
    const width = 340, gap = 8, margin = 12;
    if (!a) {
      setPos({ top: 80, left: window.innerWidth - width - margin });
      return;
    }
    const r = a.getBoundingClientRect();
    const left = Math.min(Math.max(margin, r.right - width), window.innerWidth - width - margin);
    const top = r.bottom + gap;
    setPos({ top, left });
  };

  useLayoutEffect(() => { if (isOpen) updatePosition(); }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(t) && !anchorRef?.current?.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose, anchorRef]);

  useEffect(() => {
    if (isOpen && isCreating) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen, isCreating]);

  if (!isOpen) return null;

  const handleCreate = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave?.({ title: trimmed, type: "prompt-optimization" });
    onClose();
  };

  const handleQuickSaveAll = () => {
    onSave?.({ category: "All Saved", quick: true, type: "prompt-optimization" });
    onClose();
  };

  const panel = (
    <>
      <div
        ref={panelRef}
        className="fixed z-[10000] w-[340px] rounded-2xl border border-[#282829] bg-[#17171A] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.45)] font-inter"
        style={{ top: pos.top, left: pos.left }}
        role="dialog"
        aria-modal="false"
        aria-labelledby="smartgen-save-title"
      >
        {/* All Saved = quick save */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleQuickSaveAll}
            className="flex items-center gap-3 rounded-[10px] px-2 py-1 hover:bg-white/5"
            title="Save to All Saved"
            aria-label="Save to All Saved"
          >
            <img src="/icons/mod1.png" alt="" className="h-5 w-5" />
            <span id="smartgen-save-title" className="text-[15px] leading-[1.2] text-white">All Saved</span>
          </button>
          <button
            onClick={handleQuickSaveAll}
            title="Quick save to All Saved"
            aria-label="Quick save"
            className="h-8 w-8 rounded-full grid place-items-center hover:bg-white/10"
          >
            <img src="/icons/cop.png" alt="Save" className="h-5 w-5 opacity-90" />
          </button>
        </div>

        {/* Create collection */}
        <button
          onClick={() => setIsCreating(true)}
          className="flex w-full items-center gap-3 rounded-[16px] px-3 py-3 text-left hover:bg-white/5"
          title="Create collection with custom name"
        >
          <img src="/icons/dd1.png" alt="" className="h-5 w-5 shrink-0" />
          <span className="text-white text-[14px]">Create collection</span>
        </button>

        {isCreating && (
          <div className="mt-3">
            <label className="text-[12px] leading-[1.15] text-white/70">Name/Title</label>
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && title.trim()) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              placeholder="e.g., Advanced Code Review Prompt"
              className="mt-2 h-[44px] w-full rounded-[12px] bg-[#252526] px-3 text-[14px] text-white placeholder:text-[#3B3B3B] outline-none"
            />
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="h-[44px] flex-1 rounded-full border-0 bg-[#333335] text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!isCreating || !title.trim()}
            className="h-[44px] flex-1 rounded-full text-white disabled:opacity-50"
            style={{ backgroundImage: "linear-gradient(90deg,#FF14EF 0%, #1A73E8 100%)" }}
          >
            Create
          </Button>
        </div>
      </div>

      {/* caret */}
      <div
        className="fixed z-[9999] pointer-events-none"
        style={{
          top: pos.top - 6,
          left: pos.left + 300,
          width: 12,
          height: 12,
          transform: "rotate(45deg)",
          background: "#17171A",
          borderLeft: "1px solid #282829",
          borderTop: "1px solid #282829",
        }}
      />
    </>
  );

  return createPortal(panel, document.body);
}
