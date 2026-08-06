// // import { useEffect, useRef, useState } from "react";
// // import { useLocation } from "react-router-dom";
// // import Header from "@/components/Header";
// // import { socket } from "@/lib/socket";
// // import { useAuth } from "@/contexts/AuthContext";
// // import { FiVideo, FiInfo, FiSend } from "react-icons/fi";
// // import { Search, Trash2, X, Plus, ArrowLeft } from "lucide-react";
// // import { useAgoraCall } from "@/hooks/useAgoraCall";

// // const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
// // const GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

// // type CounterPayload = {
// //   originalBudget: number;
// //   originalTargetDate: string;
// //   newBudget: string;
// //   newTargetDate: string;
// //   explanation: string;
// // };

// // function getAvatarUrl(avatar?: string) {
// //   if (!avatar) return "";
// //   if (avatar.startsWith("http")) return avatar;
// //   return `${API_BASE}${avatar}`;
// // }

// // function getFallbackAvatar(user?: any) {
// //   const key = user?._id || user?.id || user?.email || user?.name || "default-user";
// //   return `https://i.pravatar.cc/150?u=${encodeURIComponent(key)}`;
// // }

// // function getMessageSenderId(message: any) {
// //   return message?.senderId || message?.sender?._id || message?.sender || "";
// // }

// // function getLastMessageText(conversation: any) {
// //   const last = conversation?.lastMessage;
// //   if (!last) return "Start conversation";
// //   if (typeof last === "string") return last;
// //   if (last?.text) return last.text;
// //   return "Start conversation";
// // }

// // function formatTime(date?: string) {
// //   if (!date) return "";
// //   return new Date(date).toLocaleTimeString([], {
// //     hour: "2-digit",
// //     minute: "2-digit",
// //   });
// // }

// // function formatChatDate(date?: string) {
// //   const d = date ? new Date(date) : new Date();
// //   return d.toLocaleDateString("en-US", {
// //     month: "long",
// //     day: "numeric",
// //     year: "numeric",
// //   });
// // }

// // const toDateValue = (date: Date) => {
// //   const year = date.getFullYear();
// //   const month = String(date.getMonth() + 1).padStart(2, "0");
// //   const day = String(date.getDate()).padStart(2, "0");
// //   return `${year}-${month}-${day}`;
// // };

// // const getMonthLabel = (date: Date) =>
// //   date.toLocaleDateString("en-US", {
// //     month: "long",
// //     year: "numeric",
// //   });

// // const formatCounterDateDisplay = (value: string) => {
// //   if (!value) return "mm/dd/yyyy";
// //   const [year, month, day] = value.split("-").map(Number);
// //   if (!year || !month || !day) return "mm/dd/yyyy";
// //   return new Date(year, month - 1, day).toLocaleDateString("en-US");
// // };

// // function formatProposalDate(dateStr?: string) {
// //   if (!dateStr) return "-";
// //   if (["days", "weeks", "month", "unsure"].includes(dateStr)) return dateStr;
// //   const parsed = new Date(dateStr);
// //   if (Number.isNaN(parsed.getTime())) return dateStr;
// //   return parsed.toLocaleDateString("en-US", {
// //     month: "short",
// //     day: "numeric",
// //     year: "numeric",
// //   });
// // }

// // function parseHireCardData(text?: string) {
// //   if (!text) return null;
// //   const prefixes = ["HIRE_CARD::", "__HIRE_PROPOSAL__::"];
// //   const prefix = prefixes.find((p) => text.startsWith(p));
// //   if (!prefix) return null;
// //   try {
// //     return JSON.parse(text.replace(prefix, ""));
// //   } catch {
// //     return null;
// //   }
// // }

// // function parseCounterCardData(text?: string) {
// //   if (!text) return null;
// //   if (!text.startsWith("COUNTER_CARD::")) return null;
// //   try {
// //     return JSON.parse(text.replace("COUNTER_CARD::", ""));
// //   } catch {
// //     return null;
// //   }
// // }

// // // ─────────────────────────────────────────────
// // // UserAvatar
// // // ─────────────────────────────────────────────
// // function UserAvatar({
// //   user,
// //   size = "md",
// //   online = true,
// // }: {
// //   user?: any;
// //   size?: "sm" | "md" | "lg" | "xl";
// //   online?: boolean;
// // }) {
// //   const apiAvatar = getAvatarUrl(user?.avatar);
// //   const fallbackAvatar = getFallbackAvatar(user);
// //   const [src, setSrc] = useState(apiAvatar || fallbackAvatar);

// //   useEffect(() => {
// //     setSrc(apiAvatar || fallbackAvatar);
// //   }, [apiAvatar, fallbackAvatar]);

// //   const sizeClass =
// //     size === "sm"
// //       ? "w-8 h-8"
// //       : size === "lg"
// //       ? "w-12 h-12"
// //       : size === "xl"
// //       ? "w-24 h-24"
// //       : "w-11 h-11";

// //   return (
// //     <div className={`relative ${sizeClass} shrink-0 overflow-visible rounded-full`}>
// //       <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#222]">
// //         <img
// //           src={src}
// //           alt={user?.name || "User"}
// //           className="h-full w-full object-cover"
// //           onError={() => setSrc(fallbackAvatar)}
// //         />
// //       </div>
// //       {online && (
// //         <span className="absolute bottom-[1px] right-[-1px] h-[11px] w-[11px] rounded-full border-[2px] border-[#151517] bg-[#19E66C] shadow-[0_0_0_1px_rgba(25,230,108,0.25)]" />
// //       )}
// //     </div>
// //   );
// // }

// // // ─────────────────────────────────────────────
// // // SendButton
// // // ─────────────────────────────────────────────
// // function SendButton({
// //   disabled,
// //   onClick,
// // }: {
// //   disabled: boolean;
// //   onClick: () => void;
// // }) {
// //   const [iconFailed, setIconFailed] = useState(false);

// //   return (
// //     <button
// //       onClick={onClick}
// //       disabled={disabled}
// //       className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl disabled:cursor-not-allowed disabled:opacity-50"
// //       style={{ background: GRADIENT }}
// //     >
// //       {!iconFailed && (
// //         <img
// //           src="/icons/Container.svg"
// //           alt=""
// //           className="h-[22px] w-[22px] object-contain"
// //           onError={() => setIconFailed(true)}
// //         />
// //       )}
// //       {iconFailed && <FiSend className="text-[20px] text-white" />}
// //     </button>
// //   );
// // }

// // // ─────────────────────────────────────────────
// // // CounterOfferPopup
// // // ─────────────────────────────────────────────
// // function CounterOfferPopup({
// //   data,
// //   onClose,
// //   onSubmit,
// // }: {
// //   data: any;
// //   onClose: () => void;
// //   onSubmit: (payload: CounterPayload) => void;
// // }) {
// //   const [newBudget, setNewBudget] = useState("");
// //   const [newTargetDate, setNewTargetDate] = useState("");
// //   const [explanation, setExplanation] = useState("");
// //   const [showCounterCalendar, setShowCounterCalendar] = useState(false);
// //   const [counterCalendarMonth, setCounterCalendarMonth] = useState(() => {
// //     const today = new Date();
// //     today.setDate(1);
// //     today.setHours(0, 0, 0, 0);
// //     return today;
// //   });

// //   const inputBg = "#18181B80";
// //   const inputBorder = "1px solid #FFFFFF1A";

// //   const handleSubmit = () => {
// //     if (!newBudget.trim() || !newTargetDate.trim()) return;
// //     onSubmit({
// //       originalBudget: Number(data?.budget || 0),
// //       originalTargetDate: data?.targetDate || "",
// //       newBudget,
// //       newTargetDate,
// //       explanation,
// //     });
// //   };

// //   return (
// //     <div
// //       className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/55 px-4 backdrop-blur-[8px]"
// //       onClick={onClose}
// //     >
// //       <div
// //         onClick={(e) => e.stopPropagation()}
// //         style={{
// //           width: 560,
// //           maxWidth: "calc(100vw - 32px)",
// //           maxHeight: "calc(100vh - 80px)",
// //           overflowY: "auto",
// //           borderRadius: 26,
// //           background: "#212121",
// //           backdropFilter: "blur(20px)",
// //           WebkitBackdropFilter: "blur(20px)",
// //           padding: "32px",
// //           boxSizing: "border-box",
// //           color: "#FFFFFF",
// //           fontFamily: "Inter, sans-serif",
// //           boxShadow: "0 40px 120px rgba(0,0,0,0.65)",
// //         }}
// //       >
// //         <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
// //           <img
// //             src="/icons/counter.svg"
// //             alt=""
// //             style={{ width: 24, height: 24, objectFit: "contain", flexShrink: 0 }}
// //           />
// //           <h2
// //             style={{
// //               margin: 0,
// //               fontFamily: "Inter, sans-serif",
// //               fontWeight: 700,
// //               fontSize: 28,
// //               lineHeight: "36px",
// //               color: "#FFFFFF",
// //             }}
// //           >
// //             Counter Offer
// //           </h2>
// //         </div>

// //         {/* Original Proposal Summary */}
// //         <div
// //           style={{
// //             width: "100%",
// //             borderRadius: 24,
// //             border: "1px solid rgba(255,255,255,0.09)",
// //             background: "rgba(255,255,255,0.015)",
// //             padding: "22px",
// //             marginTop: 24,
// //             boxSizing: "border-box",
// //           }}
// //         >
// //           <p
// //             style={{
// //               margin: "0 0 16px",
// //               fontFamily: "Inter, sans-serif",
// //               fontWeight: 600,
// //               fontSize: 12,
// //               lineHeight: "12px",
// //               letterSpacing: "1.2px",
// //               color: "#C084FC",
// //               textTransform: "uppercase",
// //             }}
// //           >
// //             Original Proposal Summary
// //           </p>
// //           <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
// //             <div
// //               style={{
// //                 flex: "1 1 120px",
// //                 height: 60,
// //                 borderRadius: 14,
// //                 background: "#343434",
// //                 border: "1px solid #FFFFFF0D",
// //                 padding: "10px 16px",
// //                 boxSizing: "border-box",
// //               }}
// //             >
// //               <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>
// //                 TOTAL BUDGET
// //               </p>
// //               <p style={{ margin: "7px 0 0", fontWeight: 700, fontSize: 20, color: "#FFFFFF" }}>
// //                 ₹{Number(data?.budget || 0).toLocaleString("en-IN")}.00
// //               </p>
// //             </div>
// //             <div
// //               style={{
// //                 flex: "1 1 120px",
// //                 height: 60,
// //                 borderRadius: 14,
// //                 background: "#343434",
// //                 border: "1px solid #FFFFFF0D",
// //                 padding: "10px 16px",
// //                 boxSizing: "border-box",
// //               }}
// //             >
// //               <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>
// //                 TARGET DATE
// //               </p>
// //               <p style={{ margin: "7px 0 0", fontWeight: 700, fontSize: 20, color: "#FFFFFF" }}>
// //                 {formatProposalDate(data?.targetDate)}
// //               </p>
// //             </div>
// //           </div>
// //         </div>

// //         {/* New Budget + New Target Date */}
// //         <div
// //           style={{
// //             display: "grid",
// //             gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
// //             gap: 16,
// //             marginTop: 24,
// //           }}
// //         >
// //           {/* New Budget */}
// //           <div>
// //             <label style={{ display: "block", marginBottom: 12, fontWeight: 600, fontSize: 12, color: "#A1A1AA" }}>
// //               New Budget
// //             </label>
// //             <div
// //               style={{
// //                 height: 56,
// //                 borderRadius: 16,
// //                 border: inputBorder,
// //                 background: inputBg,
// //                 display: "flex",
// //                 alignItems: "center",
// //                 padding: "0 20px",
// //                 boxSizing: "border-box",
// //               }}
// //             >
// //               <span style={{ color: "#B985FF", fontSize: 22, fontWeight: 700, marginRight: 10 }}>₹</span>
// //               <input
// //                 value={newBudget}
// //                 onChange={(e) => setNewBudget(e.target.value)}
// //                 placeholder="0.00"
// //                 type="number"
// //                 className="counter-offer-number-input"
// //                 style={{
// //                   width: "100%",
// //                   background: "transparent",
// //                   border: "none",
// //                   outline: "none",
// //                   color: newBudget ? "#FFFFFF" : "#27272A",
// //                   fontFamily: "Inter, sans-serif",
// //                   fontWeight: 700,
// //                   fontSize: 22,
// //                 }}
// //               />
// //             </div>
// //           </div>

// //           {/* New Target Date — calendar opens UPWARD */}
// //           <div>
// //             <label style={{ display: "block", marginBottom: 12, fontWeight: 600, fontSize: 12, color: "#A1A1AA" }}>
// //               New Target Date
// //             </label>
// //             <div className="relative">
// //               <button
// //                 type="button"
// //                 onClick={() => setShowCounterCalendar((prev) => !prev)}
// //                 style={{
// //                   width: "100%",
// //                   height: 56,
// //                   borderRadius: 16,
// //                   border: inputBorder,
// //                   background: inputBg,
// //                   display: "flex",
// //                   alignItems: "center",
// //                   justifyContent: "space-between",
// //                   padding: "0 18px",
// //                   boxSizing: "border-box",
// //                   cursor: "pointer",
// //                 }}
// //               >
// //                 <span style={{ fontWeight: 700, fontSize: 18, color: newTargetDate ? "#FFFFFF" : "#27272A" }}>
// //                   {formatCounterDateDisplay(newTargetDate)}
// //                 </span>
// //                 <img
// //                   src="/icons/cale.svg"
// //                   alt="calendar"
// //                   style={{ width: 18, height: 18, objectFit: "contain", filter: "brightness(0) invert(1)" }}
// //                   onError={(e) => { e.currentTarget.style.display = "none"; }}
// //                 />
// //               </button>

// //               {/* Calendar opens UPWARD (bottom: 64px) so it doesn't go off-screen */}
// //               {showCounterCalendar &&
// //                 (() => {
// //                   const today = new Date();
// //                   today.setHours(0, 0, 0, 0);
// //                   const year = counterCalendarMonth.getFullYear();
// //                   const month = counterCalendarMonth.getMonth();
// //                   const firstDay = new Date(year, month, 1).getDay();
// //                   const totalDays = new Date(year, month + 1, 0).getDate();

// //                   const prevMonth = () =>
// //                     setCounterCalendarMonth((prev) => {
// //                       const next = new Date(prev);
// //                       next.setMonth(next.getMonth() - 1);
// //                       return next;
// //                     });
// //                   const nextMonth = () =>
// //                     setCounterCalendarMonth((prev) => {
// //                       const next = new Date(prev);
// //                       next.setMonth(next.getMonth() + 1);
// //                       return next;
// //                     });

// //                   return (
// //                     <div
// //                       className="absolute right-0 z-[1000000] rounded-xl bg-[#101114] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.75)] p-3"
// //                       style={{ top: "64px", width: 230 }}
// //                     >
// //                       <div className="flex items-center justify-between mb-2">
// //                         <button type="button" onClick={prevMonth} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs">‹</button>
// //                         <p className="text-xs font-semibold text-white">{getMonthLabel(counterCalendarMonth)}</p>
// //                         <button type="button" onClick={nextMonth} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs">›</button>
// //                       </div>
// //                       <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
// //                         {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
// //                           <span key={`${day}-${index}`} className="text-[9px] text-white/40">{day}</span>
// //                         ))}
// //                       </div>
// //                       <div className="grid grid-cols-7 gap-0.5 text-center">
// //                         {[...Array(firstDay)].map((_, i) => <span key={`empty-${i}`} />)}
// //                         {[...Array(totalDays)].map((_, i) => {
// //                           const day = i + 1;
// //                           const currentDate = new Date(year, month, day);
// //                           currentDate.setHours(0, 0, 0, 0);
// //                           const value = toDateValue(currentDate);
// //                           const active = newTargetDate === value;
// //                           const disabled = currentDate < today;
// //                           return (
// //                             <button
// //                               key={day}
// //                               type="button"
// //                               disabled={disabled}
// //                               onClick={() => { setNewTargetDate(value); setShowCounterCalendar(false); }}
// //                               className={`h-6 rounded-full text-[10px] transition ${disabled ? "text-white/20 cursor-not-allowed" : active ? "text-white" : "text-white/70 hover:bg-white/10"}`}
// //                               style={active && !disabled ? { background: GRADIENT } : {}}
// //                             >
// //                               {day}
// //                             </button>
// //                           );
// //                         })}
// //                       </div>
// //                     </div>
// //                   );
// //                 })()}
// //             </div>
// //           </div>
// //         </div>

// //         {/* Explanation */}
// //         <div style={{ marginTop: 26 }}>
// //           <label style={{ display: "block", marginBottom: 12, fontWeight: 600, fontSize: 12, color: "#A1A1AA" }}>
// //             Explanation To Client
// //           </label>
// //           <textarea
// //             className="counter-offer-textarea"
// //             value={explanation}
// //             onChange={(e) => setExplanation(e.target.value)}
// //             placeholder="Explain the reasoning behind your proposed changes..."
// //             style={{
// //               width: "100%",
// //               height: 110,
// //               borderRadius: 16,
// //               border: inputBorder,
// //               background: inputBg,
// //               padding: "18px 20px",
// //               boxSizing: "border-box",
// //               resize: "none",
// //               outline: "none",
// //               color: "#FFFFFF",
// //               fontFamily: "Inter, sans-serif",
// //               fontWeight: 400,
// //               fontSize: 16,
// //               lineHeight: "24px",
// //             }}
// //           />
// //         </div>

// //         <p
// //           style={{
// //             margin: "8px 0 22px",
// //             fontFamily: "Inter, sans-serif",
// //             fontWeight: 400,
// //             fontStyle: "italic",
// //             fontSize: 11,
// //             lineHeight: "16.5px",
// //             color: "#71717A",
// //           }}
// //         >
// //           This message will be attached to your updated proposal notification.
// //         </p>

// //         <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
// //           <button
// //             onClick={handleSubmit}
// //             disabled={!newBudget.trim() || !newTargetDate.trim()}
// //             style={{
// //               flex: "1 1 160px",
// //               maxWidth: 220,
// //               height: 50,
// //               borderRadius: 8,
// //               border: "none",
// //               background: GRADIENT,
// //               color: "#FFFFFF",
// //               cursor: !newBudget.trim() || !newTargetDate.trim() ? "not-allowed" : "pointer",
// //               opacity: !newBudget.trim() || !newTargetDate.trim() ? 0.5 : 1,
// //               fontFamily: "Inter, sans-serif",
// //               fontWeight: 400,
// //               fontSize: 16,
// //             }}
// //           >
// //             Send Counter Offer
// //           </button>
// //           <button
// //             onClick={onClose}
// //             style={{
// //               flex: "1 1 140px",
// //               maxWidth: 200,
// //               height: 50,
// //               borderRadius: 8,
// //               background: "#242424",
// //               border: "1px solid rgba(255,255,255,0.08)",
// //               color: "#FFFFFF",
// //               cursor: "pointer",
// //               fontFamily: "Inter, sans-serif",
// //               fontWeight: 400,
// //               fontSize: 16,
// //             }}
// //           >
// //             Cancel
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─────────────────────────────────────────────
// // // HireCard
// // // ─────────────────────────────────────────────
// // function HireCard({
// //   data,
// //   conversationId,
// //   senderId,
// // }: {
// //   data: any;
// //   conversationId?: string;
// //   senderId?: string;
// // }) {
// //   const TOP_GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";
// //   const [status, setStatus] = useState<"PENDING" | "ACCEPTED" | "COUNTERED">(data?.status || "PENDING");
// //   const [showCounterPopup, setShowCounterPopup] = useState(false);
// //   const [showProposalPopup, setShowProposalPopup] = useState(false);

// //   return (
// //     <>
// //       <div
// //         onClick={() => setShowProposalPopup(true)}
// //         style={{
// //           width: "100%",
// //           maxWidth: 505,
// //           borderRadius: 24,
// //           background: "#292929",
// //           overflow: "hidden",
// //           fontFamily: "Inter, sans-serif",
// //           boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
// //           cursor: "pointer",
// //         }}
// //       >
// //         <div
// //           style={{
// //             height: 50,
// //             background: TOP_GRADIENT,
// //             padding: "0 24px",
// //             display: "flex",
// //             alignItems: "center",
// //             justifyContent: "space-between",
// //             boxSizing: "border-box",
// //           }}
// //         >
// //           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
// //             <img src="/icons/proposal.svg" alt="" style={{ width: 16, height: 16, objectFit: "contain", flexShrink: 0 }} />
// //             <span style={{ fontWeight: 600, fontSize: 11, letterSpacing: "2.4px", color: "#FFFFFF" }}>
// //               PROJECT PROPOSAL
// //             </span>
// //           </div>
// //           <span
// //             style={{
// //               height: 24, padding: "0 14px", borderRadius: 999,
// //               display: "inline-flex", alignItems: "center", justifyContent: "center",
// //               background: "#FABC4E1A", border: "1px solid #FABC4E33",
// //               color: "#FABC4E", fontWeight: 700, fontSize: 10,
// //             }}
// //           >
// //             {status}
// //           </span>
// //         </div>

// //         <div style={{ background: "#292929", padding: "20px 24px 24px", boxSizing: "border-box" }}>
// //           <h3 style={{ margin: 0, fontWeight: 400, fontSize: 20, lineHeight: "28px", color: "#FFFFFF" }}>
// //             {data?.title || data?.projectTitle || "Project Proposal"}
// //           </h3>
// //           <p style={{ margin: "6px 0 32px", fontWeight: 400, fontSize: 13, lineHeight: "16px", color: "rgba(255,255,255,0.55)" }}>
// //             {data?.description || data?.projectDetails || "Project details will appear here."}
// //           </p>

// //           <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
// //             <div style={{ flex: "1 1 120px", borderRadius: 16, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px 12px", boxSizing: "border-box" }}>
// //               <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TOTAL BUDGET</p>
// //               <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 20, lineHeight: "1.2", color: "#FFFFFF" }}>₹{Number(data?.budget || 0).toLocaleString("en-IN")}.00</p>
// //             </div>
// //             <div style={{ flex: "1 1 120px", borderRadius: 16, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px 12px", boxSizing: "border-box" }}>
// //               <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TARGET DATE</p>
// //               <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 20, lineHeight: "1.2", color: "#FFFFFF" }}>{formatProposalDate(data?.targetDate)}</p>
// //             </div>
// //           </div>

// //           <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
// //             <button
// //               onClick={(e) => { e.stopPropagation(); setStatus("ACCEPTED"); }}
// //               style={{ flex: "1 1 140px", height: 48, border: "none", borderRadius: 8, background: TOP_GRADIENT, color: "#FFFFFF", cursor: "pointer", fontWeight: 400, fontSize: 15 }}
// //             >
// //               Accept Proposal
// //             </button>
// //             <button
// //               onClick={(e) => { e.stopPropagation(); setShowCounterPopup(true); }}
// //               style={{
// //                 flex: "1 1 130px", height: 48, borderRadius: 8, background: "#202020",
// //                 border: "1px solid #FFFFFF0D", color: "#FFFFFF", cursor: "pointer",
// //                 display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
// //                 fontWeight: 400, fontSize: 15,
// //               }}
// //             >
// //               <img src="/icons/counter.svg" alt="" style={{ width: 18, height: 18, objectFit: "contain", flexShrink: 0 }} />
// //               Counter Offer
// //             </button>
// //             <button
// //               onClick={(e) => { e.stopPropagation(); }}
// //               style={{
// //                 width: 48, height: 48, flexShrink: 0, borderRadius: 8, border: "none",
// //                 background: TOP_GRADIENT, color: "#FFFFFF", cursor: "pointer",
// //                 display: "flex", alignItems: "center", justifyContent: "center",
// //               }}
// //             >
// //               <img src="/icons/crass.svg" alt="" style={{ width: 14, height: 14, objectFit: "contain" }} />
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       {showProposalPopup && (
// //         <ProjectProposalDetailsPopup
// //           data={data}
// //           status={status}
// //           onClose={() => setShowProposalPopup(false)}
// //           onAccept={() => { setStatus("ACCEPTED"); setShowProposalPopup(false); }}
// //           onReject={() => { setShowProposalPopup(false); }}
// //           onCounter={() => { setShowProposalPopup(false); setShowCounterPopup(true); }}
// //         />
// //       )}

// //       {showCounterPopup && (
// //         <CounterOfferPopup
// //           data={data}
// //           onClose={() => setShowCounterPopup(false)}
// //           onSubmit={(payload) => {
// //             socket.emit("send-message", {
// //               conversationId,
// //               senderId,
// //               text: `COUNTER_CARD::${JSON.stringify({
// //                 newBudget: payload.newBudget,
// //                 newTargetDate: payload.newTargetDate,
// //                 explanation: payload.explanation,
// //                 originalBudget: payload.originalBudget,
// //                 originalTargetDate: payload.originalTargetDate,
// //                 status: "PENDING",
// //               })}`,
// //             });
// //             setStatus("COUNTERED");
// //             setShowCounterPopup(false);
// //           }}
// //         />
// //       )}
// //     </>
// //   );
// // }

// // function ProjectProposalDetailsPopup({
// //   data, status, onClose, onAccept, onReject, onCounter,
// // }: {
// //   data: any; status: string; onClose: () => void;
// //   onAccept: () => void; onReject: () => void; onCounter: () => void;
// // }) {
// //   const proposalTitle = data?.title || data?.projectTitle || "Project Proposal";
// //   const proposalDescription = data?.description || data?.projectDetails ||
// //     "The Nexus Dashboard Redesign aims to modernize the current user experience by implementing a high-performance, glassmorphic UI system.";

// //   return (
// //     <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/55 px-4 backdrop-blur-[8px]" onClick={onClose}>
// //       <div
// //         onClick={(e) => e.stopPropagation()}
// //         style={{
// //           width: 620, maxWidth: "calc(100vw - 32px)", maxHeight: "calc(100vh - 70px)",
// //           overflowY: "auto", borderRadius: 30, background: "#212121",
// //           backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
// //           padding: "34px 28px 24px", boxSizing: "border-box", color: "#FFFFFF",
// //           fontFamily: "Inter, sans-serif", boxShadow: "0 40px 120px rgba(0,0,0,0.65)", position: "relative",
// //         }}
// //       >
// //         <button onClick={onClose} style={{ position: "absolute", right: 22, top: 18, width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
// //           <img src="/icons/crass.svg" alt="" style={{ width: 18, height: 18, objectFit: "contain", opacity: 0.55 }} />
// //         </button>

// //         <h2 style={{ margin: "0 0 24px", paddingRight: 30, fontWeight: 700, fontSize: "clamp(22px, 5vw, 34px)", lineHeight: "42px", color: "#F5EDFF" }}>
// //           {proposalTitle}
// //         </h2>

// //         <div style={{ width: "100%", borderRadius: 24, border: "1px solid #FFFFFF1A", background: "#FFFFFF08", padding: "26px 20px", boxSizing: "border-box", marginBottom: 30 }}>
// //           <p style={{ margin: "0 0 16px", fontWeight: 600, fontSize: 12, letterSpacing: "1.2px", color: "#C084FC", textTransform: "uppercase" }}>
// //             PROPOSAL SUMMARY
// //           </p>
// //           <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
// //             <div style={{ flex: "1 1 120px", height: 60, borderRadius: 16, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px", boxSizing: "border-box" }}>
// //               <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TOTAL BUDGET</p>
// //               <p style={{ margin: "7px 0 0", fontWeight: 700, fontSize: 20, color: "#FFFFFF" }}>₹{Number(data?.budget || 0).toLocaleString("en-IN")}.00</p>
// //             </div>
// //             <div style={{ flex: "1 1 120px", height: 60, borderRadius: 16, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px", boxSizing: "border-box" }}>
// //               <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TARGET DATE</p>
// //               <p style={{ margin: "7px 0 0", fontWeight: 700, fontSize: 20, color: "#FFFFFF" }}>{formatProposalDate(data?.targetDate)}</p>
// //             </div>
// //           </div>
// //         </div>

// //         <div style={{ marginBottom: 22 }}>
// //           <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
// //             <img src="/icons/proposal.svg" alt="" style={{ width: 18, height: 18, objectFit: "contain", flexShrink: 0 }} />
// //             <p style={{ margin: 0, fontWeight: 400, fontSize: 16, color: "#C084FC", textTransform: "uppercase" }}>PROJECT OVERVIEW</p>
// //           </div>
// //           <p style={{ margin: 0, fontWeight: 400, fontSize: 15, lineHeight: "20px", color: "#C9C2CE", whiteSpace: "pre-line" }}>
// //             {proposalDescription}
// //           </p>
// //         </div>

// //         <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.015)", padding: "18px 16px", boxSizing: "border-box", marginBottom: 22 }}>
// //           <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
// //             <span style={{ color: "#C084FC", fontSize: 18 }}>◷</span>
// //             <p style={{ margin: 0, fontWeight: 600, fontSize: 12, letterSpacing: "1.8px", color: "#C084FC", textTransform: "uppercase" }}>EXECUTION TIMELINE</p>
// //           </div>
// //           <div style={{ width: "100%", height: 8, borderRadius: 999, background: "rgba(255,255,255,0.12)", overflow: "hidden", marginBottom: 10 }}>
// //             <div style={{ width: "2%", height: "100%", borderRadius: 999, background: "#C084FC" }} />
// //           </div>
// //           <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, lineHeight: "18px", color: "#D4D4D8" }}>
// //             <span>Start: Today</span>
// //             <span>Finish: {formatProposalDate(data?.targetDate)}</span>
// //           </div>
// //         </div>

// //         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
// //           <p style={{ margin: 0, fontWeight: 600, fontSize: 12, color: "#C084FC", textTransform: "uppercase" }}>DELIVERY PREFERENCE</p>
// //           <div style={{ height: 48, padding: "0 18px", borderRadius: 8, border: "1px solid #FFFFFF0D", background: "#343434", display: "flex", alignItems: "center", gap: 10, color: "#FFFFFF", fontWeight: 400, fontSize: 15 }}>
// //             <span>↔</span> Complete Project Files
// //           </div>
// //         </div>

// //         <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
// //           <button onClick={onCounter} style={{ flex: "1 1 140px", height: 49, borderRadius: 8, border: "1px solid #FFFFFF0D", background: "#202020", color: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontWeight: 400, fontSize: 15 }}>
// //             <img src="/icons/counter.svg" alt="" style={{ width: 18, height: 18, objectFit: "contain", flexShrink: 0 }} />
// //             Counter Offer
// //           </button>
// //           <button onClick={onAccept} style={{ flex: "1 1 150px", height: 49, border: "none", borderRadius: 8, background: GRADIENT, color: "#FFFFFF", cursor: "pointer", fontWeight: 400, fontSize: 15 }}>
// //             Accept Proposal
// //           </button>
// //           <button onClick={onReject} style={{ flex: "1 1 120px", height: 49, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "#202020", color: "#FFFFFF", cursor: "pointer", fontWeight: 400, fontSize: 15 }}>
// //             Reject
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─────────────────────────────────────────────
// // // CounterProposalCard
// // // ─────────────────────────────────────────────
// // function CounterProposalCard({ data }: { data: any }) {
// //   const TOP_GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";
// //   const [status, setStatus] = useState<"PENDING" | "ACCEPTED" | "DECLINED">(data?.status || "PENDING");

// //   return (
// //     <div style={{ width: "100%", maxWidth: 505, borderRadius: 24, background: "#292929", overflow: "hidden", fontFamily: "Inter, sans-serif", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}>
// //       <div style={{ height: 50, background: TOP_GRADIENT, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box" }}>
// //         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
// //           <img src="/icons/proposal.svg" alt="" style={{ width: 16, height: 16, objectFit: "contain", flexShrink: 0 }} />
// //           <span style={{ fontWeight: 600, fontSize: 11, letterSpacing: "2.4px", color: "#FFFFFF" }}>COUNTER PROPOSAL</span>
// //         </div>
// //         <span style={{ height: 24, padding: "0 14px", borderRadius: 999, display: "inline-flex", alignItems: "center", background: "#FABC4E1A", border: "1px solid #FABC4E33", color: "#FABC4E", fontWeight: 700, fontSize: 10 }}>
// //           {status}
// //         </span>
// //       </div>

// //       <div style={{ background: "#292929", padding: "20px 24px 24px", boxSizing: "border-box" }}>
// //         <div style={{ display: "flex", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
// //           <div style={{ flex: "1 1 120px", borderRadius: 16, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px 12px", boxSizing: "border-box" }}>
// //             <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TOTAL BUDGET</p>
// //             <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 20, lineHeight: "1.2", color: "#FFFFFF" }}>₹{Number(data?.newBudget || 0).toLocaleString("en-IN")}.00</p>
// //           </div>
// //           <div style={{ flex: "1 1 120px", borderRadius: 16, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px 12px", boxSizing: "border-box" }}>
// //             <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TARGET DATE</p>
// //             <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 20, lineHeight: "1.2", color: "#FFFFFF" }}>{formatProposalDate(data?.newTargetDate)}</p>
// //           </div>
// //         </div>

// //         {data?.explanation && (
// //           <div style={{ borderRadius: 16, background: "#18181B80", border: "1px solid #FFFFFF0D", padding: "16px", boxSizing: "border-box", marginBottom: 32 }}>
// //             <p style={{ margin: 0, fontStyle: "italic", fontSize: 13, lineHeight: "16px", color: "rgba(255,255,255,0.55)", whiteSpace: "pre-line" }}>
// //               {data.explanation}
// //             </p>
// //           </div>
// //         )}

// //         {status === "PENDING" ? (
// //           <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
// //             <button
// //               onClick={() => setStatus("ACCEPTED")}
// //               style={{ flex: "1 1 160px", height: 48, border: "none", borderRadius: 8, background: TOP_GRADIENT, color: "#FFFFFF", cursor: "pointer", fontWeight: 400, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
// //             >
// //               <span style={{ width: 22, height: 22, borderRadius: "50%", border: "1.5px solid #FFFFFF", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 600 }}>✓</span>
// //               Accept Counter Offer
// //             </button>
// //             <button
// //               onClick={() => setStatus("DECLINED")}
// //               style={{ flex: "1 1 130px", height: 49, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "#242424", color: "#FFFFFF", cursor: "pointer", fontWeight: 400, fontSize: 15 }}
// //             >
// //               Decline
// //             </button>
// //           </div>
// //         ) : (
// //           <div style={{ height: 48, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: status === "ACCEPTED" ? "rgba(25,230,108,0.1)" : "rgba(255,80,80,0.1)", border: `1px solid ${status === "ACCEPTED" ? "rgba(25,230,108,0.25)" : "rgba(255,80,80,0.25)"}`, color: status === "ACCEPTED" ? "#19E66C" : "#FF5050", fontWeight: 600, fontSize: 14 }}>
// //             {status === "ACCEPTED" ? "✓ Counter Offer Accepted" : "✗ Counter Offer Declined"}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // // ─────────────────────────────────────────────
// // // Main Chat Component
// // // ─────────────────────────────────────────────
// // export default function Chat() {
// //   const { token, user } = useAuth() as any;
// //   const location = useLocation();

// //   const ringingAudio = useRef<HTMLAudioElement | null>(null);
// //   const fileInputRef = useRef<HTMLInputElement>(null);
// //   const bottomRef = useRef<HTMLDivElement>(null);
// //   const callTimeoutRef = useRef<any>(null);

// //   const [conversations, setConversations] = useState<any[]>([]);
// //   const [activeConvo, setActiveConvo] = useState<any>(null);
// //   const [messages, setMessages] = useState<any[]>([]);
// //   const [input, setInput] = useState("");
// //   const [showProfile, setShowProfile] = useState(false);
// //   const [incomingCall, setIncomingCall] = useState<any>(null);
// //   const [callType, setCallType] = useState<"video" | "audio">("video");
// //   const [openChatPopup, setOpenChatPopup] = useState(true);
// //   const [loadingConversations, setLoadingConversations] = useState(false);
// //   const [loadingMessages, setLoadingMessages] = useState(false);
// //   // Mobile: "list" = sidebar visible, "chat" = chat visible
// //   const [mobileView, setMobileView] = useState<"list" | "chat">("list");

// //   const { joinCall, leaveCall } = useAgoraCall();
// //   const sharedResources = messages.filter((m) => m.attachment);

// //   useEffect(() => {
// //     ringingAudio.current = new Audio("/sounds/messenger.mp3");
// //     ringingAudio.current.loop = true;
// //   }, []);

// //   useEffect(() => {
// //     if (!token) return;
// //     setLoadingConversations(true);
// //     fetch(`${API_BASE}/api/chat/conversations`, {
// //       headers: { Authorization: `Bearer ${token}` },
// //     })
// //       .then((r) => r.json())
// //       .then((d) => {
// //         if (d?.success && Array.isArray(d.conversations)) {
// //           setConversations(d.conversations);
// //           const stateConversationId = location.state?.conversationId;
// //           if (stateConversationId) {
// //             const found = d.conversations.find((c: any) => c._id === stateConversationId);
// //             if (found) { setActiveConvo(found); setMobileView("chat"); }
// //             else if (d.conversations.length > 0) setActiveConvo(d.conversations[0]);
// //           } else if (d.conversations.length > 0) {
// //             setActiveConvo(d.conversations[0]);
// //           }
// //         }
// //       })
// //       .catch((err) => console.error("Load conversations error:", err))
// //       .finally(() => setLoadingConversations(false));
// //   }, [token, location.state]);

// //   useEffect(() => {
// //     if (!token) return;
// //     const markAllReadOnOpen = async () => {
// //       try {
// //         const res = await fetch(`${API_BASE}/api/chat/conversations/read-all`, {
// //           method: "POST",
// //           headers: { Authorization: `Bearer ${token}` },
// //         });
// //         const data = await res.json().catch(() => ({}));
// //         if (!res.ok || !data?.success) throw new Error(data?.error || `read-all failed: ${res.status}`);
// //         setConversations((prev) => prev.map((c) => ({ ...c, unreadCount: 0 })));
// //         window.dispatchEvent(new CustomEvent("chat-read"));
// //       } catch (err) {
// //         console.error("Mark all read failed", err);
// //       }
// //     };
// //     markAllReadOnOpen();
// //   }, [token]);

// //   useEffect(() => {
// //     if (!activeConvo || !token) return;
// //     setLoadingMessages(true);
// //     fetch(`${API_BASE}/api/chat/messages/${activeConvo._id}`, {
// //       headers: { Authorization: `Bearer ${token}` },
// //     })
// //       .then((r) => r.json())
// //       .then((d) => {
// //         if (d?.success && Array.isArray(d.messages)) setMessages(d.messages);
// //         else setMessages([]);
// //       })
// //       .catch((err) => console.error("Load messages error:", err))
// //       .finally(() => setLoadingMessages(false));

// //     socket.emit("join-chat", { conversationId: activeConvo._id });

// //     const markRead = async () => {
// //       try {
// //         const res = await fetch(`${API_BASE}/api/chat/conversations/${activeConvo._id}/read`, {
// //           method: "POST",
// //           headers: { Authorization: `Bearer ${token}` },
// //         });
// //         const data = await res.json().catch(() => ({}));
// //         if (!res.ok || !data?.success) throw new Error(data?.error || `read failed: ${res.status}`);
// //         setConversations((prev) => prev.map((c) => (c._id === activeConvo._id ? { ...c, unreadCount: 0 } : c)));
// //         window.dispatchEvent(new CustomEvent("chat-read"));
// //       } catch (err) {
// //         console.error("Mark single conversation read failed", err);
// //       }
// //     };
// //     markRead();
// //   }, [activeConvo, token]);

// //   useEffect(() => {
// //     const handleNewMessage = (msg: any) => {
// //       if (msg.conversationId === activeConvo?._id) setMessages((prev) => [...prev, msg]);
// //       setConversations((prev) =>
// //         prev.map((c) =>
// //           c._id === msg.conversationId
// //             ? { ...c, lastMessage: msg.text || c.lastMessage, updatedAt: msg.createdAt || new Date().toISOString() }
// //             : c
// //         )
// //       );
// //     };
// //     socket.on("new-message", handleNewMessage);
// //     return () => socket.off("new-message", handleNewMessage);
// //   }, [activeConvo]);

// //   useEffect(() => {
// //     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
// //   }, [messages]);

// //   useEffect(() => {
// //     const handleCallAccepted = async ({ conversationId }: any) => {
// //       clearTimeout(callTimeoutRef.current);
// //       await joinCall(conversationId, user?._id, true);
// //     };
// //     socket.on("call-accepted", handleCallAccepted);
// //     return () => socket.off("call-accepted", handleCallAccepted);
// //   }, [joinCall, user?._id]);

// //   useEffect(() => {
// //     const handleIncomingCall = ({ fromUser, conversationId, type }: any) => {
// //       setIncomingCall({ fromUser, conversationId, type });
// //       setCallType(type || "video");
// //       ringingAudio.current?.play().catch(() => {});
// //       callTimeoutRef.current = setTimeout(() => {
// //         ringingAudio.current?.pause();
// //         setIncomingCall(null);
// //         socket.emit("missed-call", { toUserId: fromUser._id, conversationId });
// //       }, 30000);
// //     };
// //     const handleCallEnded = () => {
// //       ringingAudio.current?.pause();
// //       leaveCall();
// //       setIncomingCall(null);
// //     };
// //     socket.on("incoming-call", handleIncomingCall);
// //     socket.on("call-ended", handleCallEnded);
// //     return () => {
// //       socket.off("incoming-call", handleIncomingCall);
// //       socket.off("call-ended", handleCallEnded);
// //     };
// //   }, [leaveCall]);

// //   const sendMessage = () => {
// //     if (!input.trim() || !activeConvo || !user?._id) return;
// //     socket.emit("send-message", {
// //       conversationId: activeConvo._id,
// //       senderId: user._id,
// //       text: input,
// //     });
// //     setInput("");
// //   };

// //   const handleAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const file = e.target.files?.[0];
// //     if (!file || !activeConvo) return;
// //     const formData = new FormData();
// //     formData.append("file", file);
// //     formData.append("conversationId", activeConvo._id);
// //     const res = await fetch(`${API_BASE}/api/chat/attachment`, {
// //       method: "POST",
// //       headers: { Authorization: `Bearer ${token}` },
// //       body: formData,
// //     });
// //     const data = await res.json();
// //     if (data?.message) {
// //       setMessages((prev) => [...prev, data.message]);
// //       socket.emit("new-message", data.message);
// //     }
// //     if (fileInputRef.current) fileInputRef.current.value = "";
// //   };

// //   const connectGoogle = () => {
// //     const w = 500, h = 600;
// //     const left = window.screenX + (window.outerWidth - w) / 2;
// //     const top = window.screenY + (window.outerHeight - h) / 2;
// //     window.open(`${API_BASE}/api/auth/google`, "googleAuth", `width=${w},height=${h},left=${left},top=${top}`);
// //   };

// //   useEffect(() => {
// //     const listener = (e: MessageEvent) => { if (e.data?.success) alert("Google connected successfully"); };
// //     window.addEventListener("message", listener);
// //     return () => window.removeEventListener("message", listener);
// //   }, []);

// //   const startMeetCall = async () => {
// //     if (!activeConvo) return;
// //     const res = await fetch(`${API_BASE}/api/google-meet/create`, {
// //       method: "POST",
// //       headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
// //       body: JSON.stringify({ summary: `Meeting with ${activeConvo.otherUser?.name || "User"}` }),
// //     });
// //     const data = await res.json();
// //     if (data.error === "google_not_connected") { connectGoogle(); return; }
// //     if (!data?.meetLink) return;
// //     socket.emit("send-message", {
// //       conversationId: activeConvo._id,
// //       senderId: user._id,
// //       text: `📞 Google Meet: ${data.meetLink}`,
// //     });
// //     window.open(data.meetLink, "_blank");
// //   };

// //   const renderMessageText = (text: string) => {
// //     const urlRegex = /(https?:\/\/[^\s]+)/g;
// //     return text.split(urlRegex).map((part, i) =>
// //       part.match(urlRegex) ? (
// //         <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="break-all text-blue-400 underline hover:text-blue-300">{part}</a>
// //       ) : (
// //         <span key={i}>{part}</span>
// //       )
// //     );
// //   };

// //   const deleteActiveConversation = async () => {
// //     if (!activeConvo) return;
// //     if (!confirm("Delete this chat?")) return;
// //     await fetch(`${API_BASE}/api/chat/conversation/${activeConvo._id}`, {
// //       method: "DELETE",
// //       headers: { Authorization: `Bearer ${token}` },
// //     });
// //     setActiveConvo(null);
// //     setMessages([]);
// //     setConversations((prev) => prev.filter((c) => c._id !== activeConvo._id));
// //     setMobileView("list");
// //   };

// //   return (
// //     <div className="relative min-h-screen overflow-hidden bg-[#07080A] text-white">
// //       <img
// //         src="/icons/mpbg.png"
// //         alt="background"
// //         className="pointer-events-none fixed inset-0 z-0 h-screen w-full select-none object-contain object-top"
// //       />

// //       <div className="relative z-20">
// //         <Header />
// //       </div>

// //       {/* Landing page content — hidden on mobile to save space */}
// //       <main className="relative z-10 hidden md:flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-20">
// //         <div className="w-full max-w-[560px] rounded-[32px] border border-white/10 bg-white/[0.06] px-8 py-10 text-center shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-sm">
// //           <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: GRADIENT }}>
// //             <FiSend className="text-[30px] text-white" />
// //           </div>
// //           <h1 className="text-[32px] font-semibold leading-[40px] text-white" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>Messages</h1>
// //           <p className="mx-auto mt-3 max-w-[360px] text-[16px] font-normal leading-[24px] text-white/55" style={{ fontFamily: "Inter, sans-serif" }}>
// //             Your conversations will appear here.
// //           </p>
// //           <button
// //             onClick={() => setOpenChatPopup(true)}
// //             className="mt-8 h-12 rounded-full px-8 text-[14px] font-semibold leading-[20px] text-white transition hover:opacity-90"
// //             style={{ background: GRADIENT, fontFamily: "Inter, sans-serif" }}
// //           >
// //             Open Message
// //           </button>
// //         </div>
// //       </main>

// //       {openChatPopup && (
// //         <div className="fixed inset-0 z-[99999] flex items-start justify-center bg-black/45 px-0 sm:px-6 pb-0 sm:pb-5 pt-0 sm:pt-[60px] backdrop-blur-md">
// //           {/*
// //             DESKTOP: max-w popup with rounded corners
// //             MOBILE: full screen, no rounding
// //           */}
// //           <div className="relative h-[100dvh] sm:h-[calc(100vh-80px)] sm:min-h-[610px] w-full sm:w-[1240px] sm:max-w-[calc(100vw-48px)] overflow-hidden sm:rounded-[32px] bg-[#171717] shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
// //             <div className="flex h-full overflow-hidden">

// //               {/* ── SIDEBAR ── */}
// //               {/* Desktop: always visible. Mobile: visible only when mobileView === "list" */}
// //               <aside
// //                 className={`
// //                   ${mobileView === "list" ? "flex" : "hidden"}
// //                   sm:flex
// //                   relative h-full w-full sm:w-[322px] shrink-0 flex-col bg-[#151517]
// //                 `}
// //               >
// //                 <div className="absolute right-0 top-0 h-full w-px bg-white/10 hidden sm:block" />

// //                 <div className="px-5 sm:px-8 pt-6 sm:pt-8">
// //                   <div className="flex items-center justify-between text-white">
// //                     <h2 className="text-[20px] sm:text-[24px] font-medium leading-[32px]" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
// //                       Messages
// //                     </h2>
// //                     <div className="flex items-center gap-3">
// //                       <img src="/icons/pen.svg" alt="" className="h-[22px] w-[22px] object-contain" />
// //                       {/* Close button only on mobile */}
// //                       <button
// //                         onClick={() => setOpenChatPopup(false)}
// //                         className="sm:hidden grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white"
// //                       >
// //                         <X size={16} />
// //                       </button>
// //                     </div>
// //                   </div>
// //                   <div className="mt-5 sm:mt-7 flex h-[34px] items-center rounded-lg bg-white/85 px-4 text-zinc-900">
// //                     <input className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500" placeholder="Search chats..." />
// //                     <Search size={20} />
// //                   </div>
// //                 </div>

// //                 <div className="mt-6 sm:mt-8 flex-1 overflow-y-auto">
// //                   {loadingConversations ? (
// //                     <p className="px-5 sm:px-8 text-sm text-white/40">Loading chats...</p>
// //                   ) : conversations.length === 0 ? (
// //                     <p className="px-5 sm:px-8 text-sm text-white/40">No conversations yet.</p>
// //                   ) : (
// //                     conversations.map((c) => {
// //                       const active = activeConvo?._id === c._id;
// //                       const lastText = getLastMessageText(c);
// //                       return (
// //                         <button
// //                           key={c._id}
// //                           onClick={() => {
// //                             setActiveConvo(c);
// //                             setShowProfile(false);
// //                             setMobileView("chat"); // on mobile, switch to chat view
// //                           }}
// //                           className={`relative flex w-full gap-4 px-5 sm:px-8 py-4 sm:py-5 text-left transition ${active ? "bg-[#221b2e]" : "hover:bg-white/[0.03]"}`}
// //                         >
// //                           {active && (
// //                             <span className="absolute right-0 top-0 h-full w-[3px] bg-gradient-to-b from-fuchsia-500 to-blue-500" />
// //                           )}
// //                           <UserAvatar user={c.otherUser} size="lg" online />
// //                           <div className="min-w-0 flex-1">
// //                             <div className="flex items-start justify-between gap-3">
// //                               <p className="truncate text-[14px] font-semibold leading-[20px] text-white" style={{ fontFamily: "Inter, sans-serif" }}>
// //                                 {c.otherUser?.name || "Unknown User"}
// //                               </p>
// //                               <span className="shrink-0 text-[11px] leading-[16px] text-zinc-500" style={{ fontFamily: "Inter, sans-serif" }}>
// //                                 {formatTime(c.lastMessage?.createdAt || c.updatedAt) || "Now"}
// //                               </span>
// //                             </div>
// //                             <p className={`mt-1 truncate text-[14px] font-normal leading-[20px] ${active ? "text-purple-200" : "text-zinc-400"}`} style={{ fontFamily: "Inter, sans-serif" }}>
// //                               {lastText}
// //                             </p>
// //                             {active && (
// //                               <p className="mt-1 text-[14px] font-normal italic leading-[20px] text-zinc-500" style={{ fontFamily: "Inter, sans-serif" }}>
// //                                 Typing...
// //                               </p>
// //                             )}
// //                           </div>
// //                         </button>
// //                       );
// //                     })
// //                   )}
// //                 </div>
// //               </aside>

// //               {/* ── MAIN CHAT AREA ── */}
// //               {/* Desktop: always visible. Mobile: visible only when mobileView === "chat" */}
// //               <main
// //                 className={`
// //                   ${mobileView === "chat" ? "flex" : "hidden"}
// //                   sm:flex
// //                   min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#171717]
// //                 `}
// //               >
// //                 {/* Header */}
// //                 <header className="flex h-16 sm:h-20 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-8">
// //                   {activeConvo ? (
// //                     <div className="flex items-center gap-2 sm:gap-4 min-w-0">
// //                       {/* Back arrow — mobile only */}
// //                       <button
// //                         onClick={() => setMobileView("list")}
// //                         className="sm:hidden mr-1 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white shrink-0"
// //                       >
// //                         <ArrowLeft size={16} />
// //                       </button>
// //                       <UserAvatar user={activeConvo.otherUser} size="md" online />
// //                       <div className="min-w-0">
// //                         <h1 className="truncate text-[13px] sm:text-[14px] font-semibold leading-[20px] text-white" style={{ fontFamily: "Inter, sans-serif" }}>
// //                           {activeConvo.otherUser?.name || "Unknown User"}
// //                         </h1>
// //                         <p className="text-[11px] sm:text-[12px] font-normal leading-[18px] text-zinc-500" style={{ fontFamily: "Inter, sans-serif" }}>
// //                           <span className="text-emerald-400">Active Now</span>
// //                           {activeConvo.otherUser?.role ? ` • ${activeConvo.otherUser.role}` : ""}
// //                         </p>
// //                       </div>
// //                     </div>
// //                   ) : (
// //                     <div>
// //                       <h1 className="text-[14px] font-semibold leading-[20px] text-white" style={{ fontFamily: "Inter, sans-serif" }}>Select Chat</h1>
// //                       <p className="text-[12px] leading-[18px] text-zinc-500" style={{ fontFamily: "Inter, sans-serif" }}>Choose a conversation</p>
// //                     </div>
// //                   )}

// //                   <div className="flex items-center gap-2 sm:gap-4 shrink-0">
// //                     <button
// //                       onClick={startMeetCall}
// //                       disabled={!activeConvo}
// //                       className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full bg-white/[0.06] text-white hover:bg-white/10 disabled:opacity-40"
// //                       title="Google Meet"
// //                     >
// //                       <FiVideo className="text-[16px] sm:text-[19px] text-white" />
// //                     </button>
// //                     <button
// //                       onClick={() => setShowProfile((v) => !v)}
// //                       disabled={!activeConvo}
// //                       className="hidden sm:grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-white hover:bg-white/10 disabled:opacity-40"
// //                       title="Info"
// //                     >
// //                       <FiInfo className="text-[19px] text-white" />
// //                     </button>
// //                     <button
// //                       onClick={deleteActiveConversation}
// //                       disabled={!activeConvo}
// //                       className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full bg-[#5A1518] text-white hover:bg-[#751B20] disabled:opacity-40"
// //                       title="Delete"
// //                     >
// //                       <Trash2 size={15} />
// //                     </button>
// //                     {/* Close button — desktop only */}
// //                     <button
// //                       onClick={() => setOpenChatPopup(false)}
// //                       className="hidden sm:grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-white hover:bg-white/10"
// //                       title="Close"
// //                     >
// //                       <X size={20} />
// //                     </button>
// //                   </div>
// //                 </header>

// //                 {/* Messages */}
// //                 <section className="min-h-0 flex-1 overflow-y-auto px-3 sm:px-20 py-4 sm:py-5">
// //                   <div className="mx-auto w-fit rounded-full bg-white px-4 py-1.5 text-[10px] font-medium uppercase text-zinc-600" style={{ fontFamily: "Inter, sans-serif" }}>
// //                     {formatChatDate()}
// //                   </div>

// //                   {!activeConvo ? (
// //                     <div className="flex h-full items-center justify-center">
// //                       <p className="text-sm text-white/40">Select a conversation to start chatting.</p>
// //                     </div>
// //                   ) : loadingMessages ? (
// //                     <div className="flex h-full items-center justify-center">
// //                       <p className="text-sm text-white/40">Loading messages...</p>
// //                     </div>
// //                   ) : messages.length === 0 ? (
// //                     <div className="flex h-full items-center justify-center">
// //                       <p className="text-sm text-white/40">No messages yet.</p>
// //                     </div>
// //                   ) : (
// //                     messages.map((m) => {
// //                       const senderId = getMessageSenderId(m);
// //                       const isMine = senderId === user?._id;
// //                       const hireData = parseHireCardData(m.text);
// //                       const counterData = parseCounterCardData(m.text);

// //                       return (
// //                         <div
// //                           key={m._id}
// //                           className={`mt-4 sm:mt-5 flex items-start gap-2 sm:gap-4 ${isMine ? "justify-end" : "justify-start"}`}
// //                         >
// //                           {!isMine && <UserAvatar user={activeConvo.otherUser} size="sm" online={false} />}
// //                           <div className="max-w-[85%] sm:max-w-[610px]">
// //                             {hireData ? (
// //                               <HireCard data={hireData} conversationId={activeConvo._id} senderId={user?._id} />
// //                             ) : counterData ? (
// //                               <CounterProposalCard data={counterData} />
// //                             ) : (
// //                               m.text && (
// //                                 <div
// //                                   className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-[14px] sm:text-[15px] font-normal leading-[22px] tracking-[0px] break-words whitespace-pre-line ${isMine ? "text-white" : "bg-[#2b2b2b] text-zinc-200"}`}
// //                                   style={{ background: isMine ? GRADIENT : undefined, fontFamily: "Plus Jakarta Sans, sans-serif" }}
// //                                 >
// //                                   {renderMessageText(m.text)}
// //                                 </div>
// //                               )
// //                             )}

// //                             {m.attachment && (
// //                               <div className="mt-2">
// //                                 {m.attachment.type === "image" ? (
// //                                   <img src={m.attachment.url} className="max-w-[200px] sm:max-w-[240px] rounded-lg" />
// //                                 ) : (
// //                                   <a href={m.attachment.url} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-blue-400 underline">
// //                                     📎 {m.attachment.name}
// //                                   </a>
// //                                 )}
// //                               </div>
// //                             )}

// //                             <p className={`mt-1 sm:mt-2 text-xs text-zinc-600 ${isMine ? "text-right" : "text-left"}`}>
// //                               {formatTime(m.createdAt)}
// //                             </p>
// //                           </div>
// //                           {isMine && <UserAvatar user={user} size="sm" online={false} />}
// //                         </div>
// //                       );
// //                     })
// //                   )}
// //                   <div ref={bottomRef} />
// //                 </section>

// //                 {/* Footer */}
// //                 <footer className="shrink-0 border-t border-white/5 px-3 sm:px-8 py-3 sm:py-6">
// //                   <div className="flex items-center gap-2 sm:gap-6">
// //                     <button
// //                       onClick={() => fileInputRef.current?.click()}
// //                       disabled={!activeConvo}
// //                       className="grid h-7 w-7 place-items-center rounded-full border border-zinc-500 text-zinc-500 hover:text-white disabled:opacity-40 shrink-0"
// //                     >
// //                       <Plus size={20} />
// //                     </button>
// //                     <input ref={fileInputRef} type="file" hidden onChange={handleAttachment} />
// //                     <div className="flex h-11 sm:h-12 flex-1 items-center gap-2 sm:gap-4 rounded-2xl bg-white px-3 sm:px-5 text-zinc-900">
// //                       <input
// //                         value={input}
// //                         onChange={(e) => setInput(e.target.value)}
// //                         onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
// //                         disabled={!activeConvo}
// //                         className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed"
// //                         placeholder={activeConvo ? "Type a message..." : "Select conversation first"}
// //                       />
// //                       <button onClick={() => fileInputRef.current?.click()} disabled={!activeConvo} className="disabled:opacity-40 shrink-0">
// //                         <img src="/icons/calo.svg" alt="" className="h-[24px] w-[24px] sm:h-[28px] sm:w-[28px] object-contain opacity-80 hover:opacity-100" />
// //                       </button>
// //                     </div>
// //                     <SendButton disabled={!activeConvo} onClick={sendMessage} />
// //                   </div>
// //                 </footer>
// //               </main>

// //               {/* ── PROFILE SIDEBAR ── */}
// //               {showProfile && activeConvo && (
// //                 <aside className="absolute right-0 top-16 sm:top-20 h-[calc(100%-64px)] sm:h-[calc(100%-80px)] w-[280px] sm:w-[300px] border-l border-white/10 bg-[#151517] p-4 sm:p-6 shadow-2xl z-50">
// //                   <div className="flex justify-end">
// //                     <button onClick={() => setShowProfile(false)} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white">
// //                       <X size={16} />
// //                     </button>
// //                   </div>
// //                   <div className="mt-6 text-center">
// //                     <div className="mx-auto flex h-24 w-24 items-center justify-center">
// //                       <UserAvatar user={activeConvo.otherUser} size="xl" online />
// //                     </div>
// //                     <h3 className="mt-5 text-[14px] font-semibold leading-[20px]" style={{ fontFamily: "Inter, sans-serif" }}>
// //                       {activeConvo.otherUser?.name}
// //                     </h3>
// //                     <p className="mb-6 text-xs text-white/50">{activeConvo.otherUser?.role || "User"}</p>
// //                     <h4 className="mb-3 text-xs font-semibold uppercase text-white/40">Shared Resources</h4>
// //                     <div className="space-y-3">
// //                       {sharedResources.length === 0 && <p className="text-xs text-white/40">No shared files yet</p>}
// //                       {sharedResources.map((m, i) => (
// //                         <a key={i} href={m.attachment.url} target="_blank" rel="noopener noreferrer" className="block break-all rounded-lg bg-[#202020] px-3 py-2 text-xs hover:bg-white/10">
// //                           📎 {m.attachment.name}
// //                         </a>
// //                       ))}
// //                     </div>
// //                   </div>
// //                 </aside>
// //               )}

// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* ── INCOMING CALL ── */}
// //       {incomingCall && (
// //         <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 px-4">
// //           <div className="w-[92vw] max-w-[360px] rounded-2xl bg-[#121212] p-6 text-center text-white">
// //             <p className="mb-1 text-lg font-semibold">Incoming {callType === "audio" ? "Audio" : "Video"} Call</p>
// //             <p className="mb-6 text-sm text-white/60">{incomingCall.fromUser.name} is calling you</p>
// //             <div className="flex justify-center gap-4">
// //               <button
// //                 onClick={async () => {
// //                   clearTimeout(callTimeoutRef.current);
// //                   ringingAudio.current?.pause();
// //                   await joinCall(incomingCall.conversationId, user._id);
// //                   socket.emit("call-accepted", { toUserId: incomingCall.fromUser._id, conversationId: incomingCall.conversationId });
// //                   setIncomingCall(null);
// //                 }}
// //                 className="rounded-full bg-green-500 px-6 py-2 font-medium text-black"
// //               >
// //                 Accept
// //               </button>
// //               <button
// //                 onClick={() => {
// //                   clearTimeout(callTimeoutRef.current);
// //                   ringingAudio.current?.pause();
// //                   socket.emit("end-call", { toUserId: incomingCall.fromUser._id });
// //                   setIncomingCall(null);
// //                 }}
// //                 className="rounded-full bg-red-500 px-6 py-2 font-medium text-white"
// //               >
// //                 Reject
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }





// import { useEffect, useRef, useState } from "react";
// import { useLocation } from "react-router-dom";
// import Header from "@/components/Header";
// import { socket } from "@/lib/socket";
// import { useAuth } from "@/contexts/AuthContext";
// import { FiVideo, FiInfo, FiSend } from "react-icons/fi";
// import { Search, Trash2, X, Plus, ArrowLeft } from "lucide-react";
// import { useAgoraCall } from "@/hooks/useAgoraCall";

// const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
// const GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

// type CounterPayload = {
//   originalBudget: number;
//   originalTargetDate: string;
//   newBudget: string;
//   newTargetDate: string;
//   explanation: string;
// };

// function getAvatarUrl(avatar?: string) {
//   if (!avatar) return "";
//   if (avatar.startsWith("http")) return avatar;
//   return `${API_BASE}${avatar}`;
// }

// function getFallbackAvatar(user?: any) {
//   const key = user?._id || user?.id || user?.email || user?.name || "default-user";
//   return `https://i.pravatar.cc/150?u=${encodeURIComponent(key)}`;
// }

// function getMessageSenderId(message: any) {
//   return message?.senderId || message?.sender?._id || message?.sender || "";
// }

// function getLastMessageText(conversation: any) {
//   const last = conversation?.lastMessage;
//   if (!last) return "Start conversation";
//   if (typeof last === "string") return last;
//   if (last?.text) return last.text;
//   return "Start conversation";
// }

// function formatTime(date?: string) {
//   if (!date) return "";
//   return new Date(date).toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

// function formatChatDate(date?: string) {
//   const d = date ? new Date(date) : new Date();
//   return d.toLocaleDateString("en-US", {
//     month: "long",
//     day: "numeric",
//     year: "numeric",
//   });
// }

// const toDateValue = (date: Date) => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

// const getMonthLabel = (date: Date) =>
//   date.toLocaleDateString("en-US", {
//     month: "long",
//     year: "numeric",
//   });

// const formatCounterDateDisplay = (value: string) => {
//   if (!value) return "mm/dd/yyyy";
//   const [year, month, day] = value.split("-").map(Number);
//   if (!year || !month || !day) return "mm/dd/yyyy";
//   return new Date(year, month - 1, day).toLocaleDateString("en-US");
// };

// function formatProposalDate(dateStr?: string) {
//   if (!dateStr) return "-";
//   if (["days", "weeks", "month", "unsure"].includes(dateStr)) return dateStr;
//   const parsed = new Date(dateStr);
//   if (Number.isNaN(parsed.getTime())) return dateStr;
//   return parsed.toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   });
// }

// function parseHireCardData(text?: string) {
//   if (!text) return null;
//   const prefixes = ["HIRE_CARD::", "__HIRE_PROPOSAL__::"];
//   const prefix = prefixes.find((p) => text.startsWith(p));
//   if (!prefix) return null;
//   try {
//     return JSON.parse(text.replace(prefix, ""));
//   } catch {
//     return null;
//   }
// }

// function parseCounterCardData(text?: string) {
//   if (!text) return null;
//   if (!text.startsWith("COUNTER_CARD::")) return null;
//   try {
//     return JSON.parse(text.replace("COUNTER_CARD::", ""));
//   } catch {
//     return null;
//   }
// }

// // ─────────────────────────────────────────────
// // UserAvatar
// // ─────────────────────────────────────────────
// function UserAvatar({
//   user,
//   size = "md",
//   online = true,
// }: {
//   user?: any;
//   size?: "sm" | "md" | "lg" | "xl";
//   online?: boolean;
// }) {
//   const apiAvatar = getAvatarUrl(user?.avatar);
//   const fallbackAvatar = getFallbackAvatar(user);
//   const [src, setSrc] = useState(apiAvatar || fallbackAvatar);

//   useEffect(() => {
//     setSrc(apiAvatar || fallbackAvatar);
//   }, [apiAvatar, fallbackAvatar]);

//   const sizeClass =
//     size === "sm"
//       ? "w-8 h-8"
//       : size === "lg"
//       ? "w-12 h-12"
//       : size === "xl"
//       ? "w-24 h-24"
//       : "w-11 h-11";

//   return (
//     <div className={`relative ${sizeClass} shrink-0 overflow-visible rounded-full`}>
//       <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#222]">
//         <img
//           src={src}
//           alt={user?.name || "User"}
//           className="h-full w-full object-cover"
//           onError={() => setSrc(fallbackAvatar)}
//         />
//       </div>
//       {online && (
//         <span className="absolute bottom-[1px] right-[-1px] h-[11px] w-[11px] rounded-full border-[2px] border-[#151517] bg-[#19E66C] shadow-[0_0_0_1px_rgba(25,230,108,0.25)]" />
//       )}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// // SendButton
// // ─────────────────────────────────────────────
// function SendButton({
//   disabled,
//   onClick,
// }: {
//   disabled: boolean;
//   onClick: () => void;
// }) {
//   const [iconFailed, setIconFailed] = useState(false);

//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl disabled:cursor-not-allowed disabled:opacity-50"
//       style={{ background: GRADIENT }}
//     >
//       {!iconFailed && (
//         <img
//           src="/icons/Container.svg"
//           alt=""
//           className="h-[22px] w-[22px] object-contain"
//           onError={() => setIconFailed(true)}
//         />
//       )}
//       {iconFailed && <FiSend className="text-[20px] text-white" />}
//     </button>
//   );
// }

// // ─────────────────────────────────────────────
// // CounterOfferPopup
// // ─────────────────────────────────────────────
// function CounterOfferPopup({
//   data,
//   onClose,
//   onSubmit,
// }: {
//   data: any;
//   onClose: () => void;
//   onSubmit: (payload: CounterPayload) => void;
// }) {
//   const [newBudget, setNewBudget] = useState("");
//   const [newTargetDate, setNewTargetDate] = useState("");
//   const [explanation, setExplanation] = useState("");
//   const [showCounterCalendar, setShowCounterCalendar] = useState(false);
//   const [counterCalendarMonth, setCounterCalendarMonth] = useState(() => {
//     const today = new Date();
//     today.setDate(1);
//     today.setHours(0, 0, 0, 0);
//     return today;
//   });

//   const inputBg = "#18181B80";
//   const inputBorder = "1px solid #FFFFFF1A";

//   const handleSubmit = () => {
//     if (!newBudget.trim() || !newTargetDate.trim()) return;
//     onSubmit({
//       originalBudget: Number(data?.budget || 0),
//       originalTargetDate: data?.targetDate || "",
//       newBudget,
//       newTargetDate,
//       explanation,
//     });
//   };

//   return (
//     <div
//       className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/55 px-4 backdrop-blur-[8px]"
//       onClick={onClose}
//     >
//       <div
//         onClick={(e) => e.stopPropagation()}
//         style={{
//           width: 560,
//           maxWidth: "calc(100vw - 32px)",
//           maxHeight: "calc(100vh - 80px)",
//           overflowY: "auto",
//           borderRadius: 26,
//           background: "#212121",
//           backdropFilter: "blur(20px)",
//           WebkitBackdropFilter: "blur(20px)",
//           padding: "32px",
//           boxSizing: "border-box",
//           color: "#FFFFFF",
//           fontFamily: "Inter, sans-serif",
//           boxShadow: "0 40px 120px rgba(0,0,0,0.65)",
//         }}
//       >
//         <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
//           <img
//             src="/icons/counter.svg"
//             alt=""
//             style={{ width: 24, height: 24, objectFit: "contain", flexShrink: 0 }}
//           />
//           <h2
//             style={{
//               margin: 0,
//               fontFamily: "Inter, sans-serif",
//               fontWeight: 700,
//               fontSize: 28,
//               lineHeight: "36px",
//               color: "#FFFFFF",
//             }}
//           >
//             Counter Offer
//           </h2>
//         </div>

//         {/* Original Proposal Summary */}
//         <div
//           style={{
//             width: "100%",
//             borderRadius: 24,
//             border: "1px solid rgba(255,255,255,0.09)",
//             background: "rgba(255,255,255,0.015)",
//             padding: "22px",
//             marginTop: 24,
//             boxSizing: "border-box",
//           }}
//         >
//           <p
//             style={{
//               margin: "0 0 16px",
//               fontFamily: "Inter, sans-serif",
//               fontWeight: 600,
//               fontSize: 12,
//               lineHeight: "12px",
//               letterSpacing: "1.2px",
//               color: "#C084FC",
//               textTransform: "uppercase",
//             }}
//           >
//             Original Proposal Summary
//           </p>
//           <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
//             <div
//               style={{
//                 flex: "1 1 120px",
//                 height: 60,
//                 borderRadius: 14,
//                 background: "#343434",
//                 border: "1px solid #FFFFFF0D",
//                 padding: "10px 16px",
//                 boxSizing: "border-box",
//               }}
//             >
//               <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>
//                 TOTAL BUDGET
//               </p>
//               <p style={{ margin: "7px 0 0", fontWeight: 700, fontSize: 20, color: "#FFFFFF" }}>
//                 ₹{Number(data?.budget || 0).toLocaleString("en-IN")}.00
//               </p>
//             </div>
//             <div
//               style={{
//                 flex: "1 1 120px",
//                 height: 60,
//                 borderRadius: 14,
//                 background: "#343434",
//                 border: "1px solid #FFFFFF0D",
//                 padding: "10px 16px",
//                 boxSizing: "border-box",
//               }}
//             >
//               <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>
//                 TARGET DATE
//               </p>
//               <p style={{ margin: "7px 0 0", fontWeight: 700, fontSize: 20, color: "#FFFFFF" }}>
//                 {formatProposalDate(data?.targetDate)}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* New Budget + New Target Date */}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
//             gap: 16,
//             marginTop: 24,
//           }}
//         >
//           {/* New Budget */}
//           <div>
//             <label style={{ display: "block", marginBottom: 12, fontWeight: 600, fontSize: 12, color: "#A1A1AA" }}>
//               New Budget
//             </label>
//             <div
//               style={{
//                 height: 56,
//                 borderRadius: 16,
//                 border: inputBorder,
//                 background: inputBg,
//                 display: "flex",
//                 alignItems: "center",
//                 padding: "0 20px",
//                 boxSizing: "border-box",
//               }}
//             >
//               <span style={{ color: "#B985FF", fontSize: 22, fontWeight: 700, marginRight: 10 }}>₹</span>
//               <input
//                 value={newBudget}
//                 onChange={(e) => setNewBudget(e.target.value)}
//                 placeholder="0.00"
//                 type="number"
//                 className="counter-offer-number-input"
//                 style={{
//                   width: "100%",
//                   background: "transparent",
//                   border: "none",
//                   outline: "none",
//                   color: newBudget ? "#FFFFFF" : "#27272A",
//                   fontFamily: "Inter, sans-serif",
//                   fontWeight: 700,
//                   fontSize: 22,
//                 }}
//               />
//             </div>
//           </div>

//           {/* New Target Date — calendar opens UPWARD */}
//           <div>
//             <label style={{ display: "block", marginBottom: 12, fontWeight: 600, fontSize: 12, color: "#A1A1AA" }}>
//               New Target Date
//             </label>
//             <div className="relative">
//               <button
//                 type="button"
//                 onClick={() => setShowCounterCalendar((prev) => !prev)}
//                 style={{
//                   width: "100%",
//                   height: 56,
//                   borderRadius: 16,
//                   border: inputBorder,
//                   background: inputBg,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   padding: "0 18px",
//                   boxSizing: "border-box",
//                   cursor: "pointer",
//                 }}
//               >
//                 <span style={{ fontWeight: 700, fontSize: 18, color: newTargetDate ? "#FFFFFF" : "#27272A" }}>
//                   {formatCounterDateDisplay(newTargetDate)}
//                 </span>
//                 <img
//                   src="/icons/cale.svg"
//                   alt="calendar"
//                   style={{ width: 18, height: 18, objectFit: "contain", filter: "brightness(0) invert(1)" }}
//                   onError={(e) => { e.currentTarget.style.display = "none"; }}
//                 />
//               </button>

//               {/* Calendar opens UPWARD (bottom: 64px) so it doesn't go off-screen */}
//               {showCounterCalendar &&
//                 (() => {
//                   const today = new Date();
//                   today.setHours(0, 0, 0, 0);
//                   const year = counterCalendarMonth.getFullYear();
//                   const month = counterCalendarMonth.getMonth();
//                   const firstDay = new Date(year, month, 1).getDay();
//                   const totalDays = new Date(year, month + 1, 0).getDate();

//                   const prevMonth = () =>
//                     setCounterCalendarMonth((prev) => {
//                       const next = new Date(prev);
//                       next.setMonth(next.getMonth() - 1);
//                       return next;
//                     });
//                   const nextMonth = () =>
//                     setCounterCalendarMonth((prev) => {
//                       const next = new Date(prev);
//                       next.setMonth(next.getMonth() + 1);
//                       return next;
//                     });

//                   return (
//                     <div
//                       className="absolute right-0 z-[1000000] rounded-xl bg-[#101114] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.75)] p-3"
//                       style={{ top: "64px", width: 230 }}
//                     >
//                       <div className="flex items-center justify-between mb-2">
//                         <button type="button" onClick={prevMonth} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs">‹</button>
//                         <p className="text-xs font-semibold text-white">{getMonthLabel(counterCalendarMonth)}</p>
//                         <button type="button" onClick={nextMonth} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs">›</button>
//                       </div>
//                       <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
//                         {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
//                           <span key={`${day}-${index}`} className="text-[9px] text-white/40">{day}</span>
//                         ))}
//                       </div>
//                       <div className="grid grid-cols-7 gap-0.5 text-center">
//                         {[...Array(firstDay)].map((_, i) => <span key={`empty-${i}`} />)}
//                         {[...Array(totalDays)].map((_, i) => {
//                           const day = i + 1;
//                           const currentDate = new Date(year, month, day);
//                           currentDate.setHours(0, 0, 0, 0);
//                           const value = toDateValue(currentDate);
//                           const active = newTargetDate === value;
//                           const disabled = currentDate < today;
//                           return (
//                             <button
//                               key={day}
//                               type="button"
//                               disabled={disabled}
//                               onClick={() => { setNewTargetDate(value); setShowCounterCalendar(false); }}
//                               className={`h-6 rounded-full text-[10px] transition ${disabled ? "text-white/20 cursor-not-allowed" : active ? "text-white" : "text-white/70 hover:bg-white/10"}`}
//                               style={active && !disabled ? { background: GRADIENT } : {}}
//                             >
//                               {day}
//                             </button>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   );
//                 })()}
//             </div>
//           </div>
//         </div>

//         {/* Explanation */}
//         <div style={{ marginTop: 26 }}>
//           <label style={{ display: "block", marginBottom: 12, fontWeight: 600, fontSize: 12, color: "#A1A1AA" }}>
//             Explanation To Client
//           </label>
//           <textarea
//             className="counter-offer-textarea"
//             value={explanation}
//             onChange={(e) => setExplanation(e.target.value)}
//             placeholder="Explain the reasoning behind your proposed changes..."
//             style={{
//               width: "100%",
//               height: 110,
//               borderRadius: 16,
//               border: inputBorder,
//               background: inputBg,
//               padding: "18px 20px",
//               boxSizing: "border-box",
//               resize: "none",
//               outline: "none",
//               color: "#FFFFFF",
//               fontFamily: "Inter, sans-serif",
//               fontWeight: 400,
//               fontSize: 16,
//               lineHeight: "24px",
//             }}
//           />
//         </div>

//         <p
//           style={{
//             margin: "8px 0 22px",
//             fontFamily: "Inter, sans-serif",
//             fontWeight: 400,
//             fontStyle: "italic",
//             fontSize: 11,
//             lineHeight: "16.5px",
//             color: "#71717A",
//           }}
//         >
//           This message will be attached to your updated proposal notification.
//         </p>

//         <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
//           <button
//             onClick={handleSubmit}
//             disabled={!newBudget.trim() || !newTargetDate.trim()}
//             style={{
//               flex: "1 1 160px",
//               maxWidth: 220,
//               height: 50,
//               borderRadius: 8,
//               border: "none",
//               background: GRADIENT,
//               color: "#FFFFFF",
//               cursor: !newBudget.trim() || !newTargetDate.trim() ? "not-allowed" : "pointer",
//               opacity: !newBudget.trim() || !newTargetDate.trim() ? 0.5 : 1,
//               fontFamily: "Inter, sans-serif",
//               fontWeight: 400,
//               fontSize: 16,
//             }}
//           >
//             Send Counter Offer
//           </button>
//           <button
//             onClick={onClose}
//             style={{
//               flex: "1 1 140px",
//               maxWidth: 200,
//               height: 50,
//               borderRadius: 8,
//               background: "#242424",
//               border: "1px solid rgba(255,255,255,0.08)",
//               color: "#FFFFFF",
//               cursor: "pointer",
//               fontFamily: "Inter, sans-serif",
//               fontWeight: 400,
//               fontSize: 16,
//             }}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// // HireCard
// // ─────────────────────────────────────────────
// function HireCard({
//   data,
//   conversationId,
//   senderId,
//   token,
// }: {
//   data: any;
//   conversationId?: string;
//   senderId?: string;
//   token?: string;
// }) {
//   const TOP_GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";
//   const [status, setStatus] = useState<"PENDING" | "ACCEPTED" | "COUNTERED">(data?.status || "PENDING");
//   const [showCounterPopup, setShowCounterPopup] = useState(false);
//   const [showProposalPopup, setShowProposalPopup] = useState(false);
//   const [acceptLoading, setAcceptLoading] = useState(false);

//   const dealId = data?.hireDealId || data?.dealId || data?._id;

//   const handleAcceptProposal = async () => {
//     try {
//       if (acceptLoading || status === "ACCEPTED") return;

//       if (!token) {
//         alert("Login required. Please login again.");
//         return;
//       }

//       if (!dealId) {
//         alert("Hire deal id missing. Please create HireDeal when sending hire card.");
//         return;
//       }

//       setAcceptLoading(true);

//       const res = await fetch(`${API_BASE}/api/hire/${dealId}/accept`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       const result = await res.json().catch(() => ({}));

//       if (!res.ok || !result?.success) {
//         throw new Error(result?.error || "Failed to accept proposal");
//       }

//       setStatus("ACCEPTED");
//       setShowProposalPopup(false);

//       // Chat me client ko instant accepted message dikhane ke liye.
//       // Backend route notification/payment-required record create karega.
//       socket.emit("send-message", {
//         conversationId,
//         senderId,
//         text: `✅ Proposal accepted: ${data?.title || data?.projectTitle || "Project Proposal"}`,
//       });
//     } catch (err: any) {
//       console.error("Accept proposal error:", err);
//       alert(err?.message || "Failed to accept proposal");
//     } finally {
//       setAcceptLoading(false);
//     }
//   };

//   return (
//     <>
//       <div
//         onClick={() => setShowProposalPopup(true)}
//         style={{
//           width: "100%",
//           maxWidth: 505,
//           borderRadius: 24,
//           background: "#292929",
//           overflow: "hidden",
//           fontFamily: "Inter, sans-serif",
//           boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
//           cursor: "pointer",
//         }}
//       >
//         <div
//           style={{
//             height: 50,
//             background: TOP_GRADIENT,
//             padding: "0 24px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             boxSizing: "border-box",
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <img src="/icons/proposal.svg" alt="" style={{ width: 16, height: 16, objectFit: "contain", flexShrink: 0 }} />
//             <span style={{ fontWeight: 600, fontSize: 11, letterSpacing: "2.4px", color: "#FFFFFF" }}>
//               PROJECT PROPOSAL
//             </span>
//           </div>
//           <span
//             style={{
//               height: 24, padding: "0 14px", borderRadius: 999,
//               display: "inline-flex", alignItems: "center", justifyContent: "center",
//               background: "#FABC4E1A", border: "1px solid #FABC4E33",
//               color: "#FABC4E", fontWeight: 700, fontSize: 10,
//             }}
//           >
//             {status}
//           </span>
//         </div>

//         <div style={{ background: "#292929", padding: "20px 24px 24px", boxSizing: "border-box" }}>
//           <h3 style={{ margin: 0, fontWeight: 400, fontSize: 20, lineHeight: "28px", color: "#FFFFFF" }}>
//             {data?.title || data?.projectTitle || "Project Proposal"}
//           </h3>
//           <p style={{ margin: "6px 0 32px", fontWeight: 400, fontSize: 13, lineHeight: "16px", color: "rgba(255,255,255,0.55)" }}>
//             {data?.description || data?.projectDetails || "Project details will appear here."}
//           </p>

//           <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
//             <div style={{ flex: "1 1 120px", borderRadius: 16, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px 12px", boxSizing: "border-box" }}>
//               <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TOTAL BUDGET</p>
//               <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 20, lineHeight: "1.2", color: "#FFFFFF" }}>₹{Number(data?.budget || 0).toLocaleString("en-IN")}.00</p>
//             </div>
//             <div style={{ flex: "1 1 120px", borderRadius: 16, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px 12px", boxSizing: "border-box" }}>
//               <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TARGET DATE</p>
//               <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 20, lineHeight: "1.2", color: "#FFFFFF" }}>{formatProposalDate(data?.targetDate)}</p>
//             </div>
//           </div>

//           <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
//             <button
//               disabled={acceptLoading || status === "ACCEPTED"}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleAcceptProposal();
//               }}
//               style={{
//                 flex: "1 1 140px",
//                 height: 48,
//                 border: "none",
//                 borderRadius: 8,
//                 background: TOP_GRADIENT,
//                 color: "#FFFFFF",
//                 cursor: acceptLoading || status === "ACCEPTED" ? "not-allowed" : "pointer",
//                 opacity: acceptLoading || status === "ACCEPTED" ? 0.6 : 1,
//                 fontWeight: 400,
//                 fontSize: 15,
//               }}
//             >
//               {acceptLoading ? "Accepting..." : status === "ACCEPTED" ? "Accepted" : "Accept Proposal"}
//             </button>
//             <button
//               onClick={(e) => { e.stopPropagation(); setShowCounterPopup(true); }}
//               style={{
//                 flex: "1 1 130px", height: 48, borderRadius: 8, background: "#202020",
//                 border: "1px solid #FFFFFF0D", color: "#FFFFFF", cursor: "pointer",
//                 display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
//                 fontWeight: 400, fontSize: 15,
//               }}
//             >
//               <img src="/icons/counter.svg" alt="" style={{ width: 18, height: 18, objectFit: "contain", flexShrink: 0 }} />
//               Counter Offer
//             </button>
//             <button
//               onClick={(e) => { e.stopPropagation(); }}
//               style={{
//                 width: 48, height: 48, flexShrink: 0, borderRadius: 8, border: "none",
//                 background: TOP_GRADIENT, color: "#FFFFFF", cursor: "pointer",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//               }}
//             >
//               <img src="/icons/crass.svg" alt="" style={{ width: 14, height: 14, objectFit: "contain" }} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {showProposalPopup && (
//         <ProjectProposalDetailsPopup
//           data={data}
//           status={status}
//           acceptLoading={acceptLoading}
//           onClose={() => setShowProposalPopup(false)}
//           onAccept={handleAcceptProposal}
//           onReject={() => { setShowProposalPopup(false); }}
//           onCounter={() => { setShowProposalPopup(false); setShowCounterPopup(true); }}
//         />
//       )}

//       {showCounterPopup && (
//         <CounterOfferPopup
//           data={data}
//           onClose={() => setShowCounterPopup(false)}
//           onSubmit={(payload) => {
//             socket.emit("send-message", {
//               conversationId,
//               senderId,
//               text: `COUNTER_CARD::${JSON.stringify({
//                 newBudget: payload.newBudget,
//                 newTargetDate: payload.newTargetDate,
//                 explanation: payload.explanation,
//                 originalBudget: payload.originalBudget,
//                 originalTargetDate: payload.originalTargetDate,
//                 status: "PENDING",
//               })}`,
//             });
//             setStatus("COUNTERED");
//             setShowCounterPopup(false);
//           }}
//         />
//       )}
//     </>
//   );
// }

// function ProjectProposalDetailsPopup({
//   data, status, acceptLoading, onClose, onAccept, onReject, onCounter,
// }: {
//   data: any; status: string; acceptLoading?: boolean; onClose: () => void;
//   onAccept: () => void; onReject: () => void; onCounter: () => void;
// }) {
//   const proposalTitle = data?.title || data?.projectTitle || "Project Proposal";
//   const proposalDescription = data?.description || data?.projectDetails ||
//     "The Nexus Dashboard Redesign aims to modernize the current user experience by implementing a high-performance, glassmorphic UI system.";

//   return (
//     <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/55 px-4 backdrop-blur-[8px]" onClick={onClose}>
//       <div
//         onClick={(e) => e.stopPropagation()}
//         style={{
//           width: 620, maxWidth: "calc(100vw - 32px)", maxHeight: "calc(100vh - 70px)",
//           overflowY: "auto", borderRadius: 30, background: "#212121",
//           backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
//           padding: "34px 28px 24px", boxSizing: "border-box", color: "#FFFFFF",
//           fontFamily: "Inter, sans-serif", boxShadow: "0 40px 120px rgba(0,0,0,0.65)", position: "relative",
//         }}
//       >
//         <button onClick={onClose} style={{ position: "absolute", right: 22, top: 18, width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
//           <img src="/icons/crass.svg" alt="" style={{ width: 18, height: 18, objectFit: "contain", opacity: 0.55 }} />
//         </button>

//         <h2 style={{ margin: "0 0 24px", paddingRight: 30, fontWeight: 700, fontSize: "clamp(22px, 5vw, 34px)", lineHeight: "42px", color: "#F5EDFF" }}>
//           {proposalTitle}
//         </h2>

//         <div style={{ width: "100%", borderRadius: 24, border: "1px solid #FFFFFF1A", background: "#FFFFFF08", padding: "26px 20px", boxSizing: "border-box", marginBottom: 30 }}>
//           <p style={{ margin: "0 0 16px", fontWeight: 600, fontSize: 12, letterSpacing: "1.2px", color: "#C084FC", textTransform: "uppercase" }}>
//             PROPOSAL SUMMARY
//           </p>
//           <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
//             <div style={{ flex: "1 1 120px", height: 60, borderRadius: 16, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px", boxSizing: "border-box" }}>
//               <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TOTAL BUDGET</p>
//               <p style={{ margin: "7px 0 0", fontWeight: 700, fontSize: 20, color: "#FFFFFF" }}>₹{Number(data?.budget || 0).toLocaleString("en-IN")}.00</p>
//             </div>
//             <div style={{ flex: "1 1 120px", height: 60, borderRadius: 16, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px", boxSizing: "border-box" }}>
//               <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TARGET DATE</p>
//               <p style={{ margin: "7px 0 0", fontWeight: 700, fontSize: 20, color: "#FFFFFF" }}>{formatProposalDate(data?.targetDate)}</p>
//             </div>
//           </div>
//         </div>

//         <div style={{ marginBottom: 22 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
//             <img src="/icons/proposal.svg" alt="" style={{ width: 18, height: 18, objectFit: "contain", flexShrink: 0 }} />
//             <p style={{ margin: 0, fontWeight: 400, fontSize: 16, color: "#C084FC", textTransform: "uppercase" }}>PROJECT OVERVIEW</p>
//           </div>
//           <p style={{ margin: 0, fontWeight: 400, fontSize: 15, lineHeight: "20px", color: "#C9C2CE", whiteSpace: "pre-line" }}>
//             {proposalDescription}
//           </p>
//         </div>

//         <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.015)", padding: "18px 16px", boxSizing: "border-box", marginBottom: 22 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
//             <span style={{ color: "#C084FC", fontSize: 18 }}>◷</span>
//             <p style={{ margin: 0, fontWeight: 600, fontSize: 12, letterSpacing: "1.8px", color: "#C084FC", textTransform: "uppercase" }}>EXECUTION TIMELINE</p>
//           </div>
//           <div style={{ width: "100%", height: 8, borderRadius: 999, background: "rgba(255,255,255,0.12)", overflow: "hidden", marginBottom: 10 }}>
//             <div style={{ width: "2%", height: "100%", borderRadius: 999, background: "#C084FC" }} />
//           </div>
//           <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, lineHeight: "18px", color: "#D4D4D8" }}>
//             <span>Start: Today</span>
//             <span>Finish: {formatProposalDate(data?.targetDate)}</span>
//           </div>
//         </div>

//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
//           <p style={{ margin: 0, fontWeight: 600, fontSize: 12, color: "#C084FC", textTransform: "uppercase" }}>DELIVERY PREFERENCE</p>
//           <div style={{ height: 48, padding: "0 18px", borderRadius: 8, border: "1px solid #FFFFFF0D", background: "#343434", display: "flex", alignItems: "center", gap: 10, color: "#FFFFFF", fontWeight: 400, fontSize: 15 }}>
//             <span>↔</span> Complete Project Files
//           </div>
//         </div>

//         <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
//           <button onClick={onCounter} style={{ flex: "1 1 140px", height: 49, borderRadius: 8, border: "1px solid #FFFFFF0D", background: "#202020", color: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontWeight: 400, fontSize: 15 }}>
//             <img src="/icons/counter.svg" alt="" style={{ width: 18, height: 18, objectFit: "contain", flexShrink: 0 }} />
//             Counter Offer
//           </button>
//           <button
//             onClick={onAccept}
//             disabled={acceptLoading || status === "ACCEPTED"}
//             style={{
//               flex: "1 1 150px",
//               height: 49,
//               border: "none",
//               borderRadius: 8,
//               background: GRADIENT,
//               color: "#FFFFFF",
//               cursor: acceptLoading || status === "ACCEPTED" ? "not-allowed" : "pointer",
//               opacity: acceptLoading || status === "ACCEPTED" ? 0.6 : 1,
//               fontWeight: 400,
//               fontSize: 15,
//             }}
//           >
//             {acceptLoading ? "Accepting..." : status === "ACCEPTED" ? "Accepted" : "Accept Proposal"}
//           </button>
//           <button onClick={onReject} style={{ flex: "1 1 120px", height: 49, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "#202020", color: "#FFFFFF", cursor: "pointer", fontWeight: 400, fontSize: 15 }}>
//             Reject
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// // CounterProposalCard
// // ─────────────────────────────────────────────
// function CounterProposalCard({ data }: { data: any }) {
//   const TOP_GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";
//   const [status, setStatus] = useState<"PENDING" | "ACCEPTED" | "DECLINED">(data?.status || "PENDING");

//   return (
//     <div style={{ width: "100%", maxWidth: 505, borderRadius: 24, background: "#292929", overflow: "hidden", fontFamily: "Inter, sans-serif", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}>
//       <div style={{ height: 50, background: TOP_GRADIENT, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           <img src="/icons/proposal.svg" alt="" style={{ width: 16, height: 16, objectFit: "contain", flexShrink: 0 }} />
//           <span style={{ fontWeight: 600, fontSize: 11, letterSpacing: "2.4px", color: "#FFFFFF" }}>COUNTER PROPOSAL</span>
//         </div>
//         <span style={{ height: 24, padding: "0 14px", borderRadius: 999, display: "inline-flex", alignItems: "center", background: "#FABC4E1A", border: "1px solid #FABC4E33", color: "#FABC4E", fontWeight: 700, fontSize: 10 }}>
//           {status}
//         </span>
//       </div>

//       <div style={{ background: "#292929", padding: "20px 24px 24px", boxSizing: "border-box" }}>
//         <div style={{ display: "flex", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
//           <div style={{ flex: "1 1 120px", borderRadius: 16, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px 12px", boxSizing: "border-box" }}>
//             <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TOTAL BUDGET</p>
//             <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 20, lineHeight: "1.2", color: "#FFFFFF" }}>₹{Number(data?.newBudget || 0).toLocaleString("en-IN")}.00</p>
//           </div>
//           <div style={{ flex: "1 1 120px", borderRadius: 16, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px 12px", boxSizing: "border-box" }}>
//             <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TARGET DATE</p>
//             <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 20, lineHeight: "1.2", color: "#FFFFFF" }}>{formatProposalDate(data?.newTargetDate)}</p>
//           </div>
//         </div>

//         {data?.explanation && (
//           <div style={{ borderRadius: 16, background: "#18181B80", border: "1px solid #FFFFFF0D", padding: "16px", boxSizing: "border-box", marginBottom: 32 }}>
//             <p style={{ margin: 0, fontStyle: "italic", fontSize: 13, lineHeight: "16px", color: "rgba(255,255,255,0.55)", whiteSpace: "pre-line" }}>
//               {data.explanation}
//             </p>
//           </div>
//         )}

//         {status === "PENDING" ? (
//           <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
//             <button
//               onClick={() => setStatus("ACCEPTED")}
//               style={{ flex: "1 1 160px", height: 48, border: "none", borderRadius: 8, background: TOP_GRADIENT, color: "#FFFFFF", cursor: "pointer", fontWeight: 400, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
//             >
//               <span style={{ width: 22, height: 22, borderRadius: "50%", border: "1.5px solid #FFFFFF", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 600 }}>✓</span>
//               Accept Counter Offer
//             </button>
//             <button
//               onClick={() => setStatus("DECLINED")}
//               style={{ flex: "1 1 130px", height: 49, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "#242424", color: "#FFFFFF", cursor: "pointer", fontWeight: 400, fontSize: 15 }}
//             >
//               Decline
//             </button>
//           </div>
//         ) : (
//           <div style={{ height: 48, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: status === "ACCEPTED" ? "rgba(25,230,108,0.1)" : "rgba(255,80,80,0.1)", border: `1px solid ${status === "ACCEPTED" ? "rgba(25,230,108,0.25)" : "rgba(255,80,80,0.25)"}`, color: status === "ACCEPTED" ? "#19E66C" : "#FF5050", fontWeight: 600, fontSize: 14 }}>
//             {status === "ACCEPTED" ? "✓ Counter Offer Accepted" : "✗ Counter Offer Declined"}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// // Main Chat Component
// // ─────────────────────────────────────────────
// export default function Chat() {
//   const { token, user } = useAuth() as any;
//   const location = useLocation();

//   const ringingAudio = useRef<HTMLAudioElement | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const bottomRef = useRef<HTMLDivElement>(null);
//   const callTimeoutRef = useRef<any>(null);

//   const [conversations, setConversations] = useState<any[]>([]);
//   const [activeConvo, setActiveConvo] = useState<any>(null);
//   const [messages, setMessages] = useState<any[]>([]);
//   const [input, setInput] = useState("");
//   const [showProfile, setShowProfile] = useState(false);
//   const [incomingCall, setIncomingCall] = useState<any>(null);
//   const [callType, setCallType] = useState<"video" | "audio">("video");
//   const [openChatPopup, setOpenChatPopup] = useState(true);
//   const [loadingConversations, setLoadingConversations] = useState(false);
//   const [loadingMessages, setLoadingMessages] = useState(false);
//   // Mobile: "list" = sidebar visible, "chat" = chat visible
//   const [mobileView, setMobileView] = useState<"list" | "chat">("list");

//   const { joinCall, leaveCall } = useAgoraCall();
//   const sharedResources = messages.filter((m) => m.attachment);

//   useEffect(() => {
//     ringingAudio.current = new Audio("/sounds/messenger.mp3");
//     ringingAudio.current.loop = true;
//   }, []);

//   useEffect(() => {
//     if (!token) return;
//     setLoadingConversations(true);
//     fetch(`${API_BASE}/api/chat/conversations`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((r) => r.json())
//       .then((d) => {
//         if (d?.success && Array.isArray(d.conversations)) {
//           setConversations(d.conversations);
//           const stateConversationId = location.state?.conversationId;
//           if (stateConversationId) {
//             const found = d.conversations.find((c: any) => c._id === stateConversationId);
//             if (found) { setActiveConvo(found); setMobileView("chat"); }
//             else if (d.conversations.length > 0) setActiveConvo(d.conversations[0]);
//           } else if (d.conversations.length > 0) {
//             setActiveConvo(d.conversations[0]);
//           }
//         }
//       })
//       .catch((err) => console.error("Load conversations error:", err))
//       .finally(() => setLoadingConversations(false));
//   }, [token, location.state]);

//   useEffect(() => {
//     if (!token) return;
//     const markAllReadOnOpen = async () => {
//       try {
//         const res = await fetch(`${API_BASE}/api/chat/conversations/read-all`, {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json().catch(() => ({}));
//         if (!res.ok || !data?.success) throw new Error(data?.error || `read-all failed: ${res.status}`);
//         setConversations((prev) => prev.map((c) => ({ ...c, unreadCount: 0 })));
//         window.dispatchEvent(new CustomEvent("chat-read"));
//       } catch (err) {
//         console.error("Mark all read failed", err);
//       }
//     };
//     markAllReadOnOpen();
//   }, [token]);

//   useEffect(() => {
//     if (!activeConvo || !token) return;
//     setLoadingMessages(true);
//     fetch(`${API_BASE}/api/chat/messages/${activeConvo._id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((r) => r.json())
//       .then((d) => {
//         if (d?.success && Array.isArray(d.messages)) setMessages(d.messages);
//         else setMessages([]);
//       })
//       .catch((err) => console.error("Load messages error:", err))
//       .finally(() => setLoadingMessages(false));

//     socket.emit("join-chat", { conversationId: activeConvo._id });

//     const markRead = async () => {
//       try {
//         const res = await fetch(`${API_BASE}/api/chat/conversations/${activeConvo._id}/read`, {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json().catch(() => ({}));
//         if (!res.ok || !data?.success) throw new Error(data?.error || `read failed: ${res.status}`);
//         setConversations((prev) => prev.map((c) => (c._id === activeConvo._id ? { ...c, unreadCount: 0 } : c)));
//         window.dispatchEvent(new CustomEvent("chat-read"));
//       } catch (err) {
//         console.error("Mark single conversation read failed", err);
//       }
//     };
//     markRead();
//   }, [activeConvo, token]);

//   useEffect(() => {
//     const handleNewMessage = (msg: any) => {
//       if (msg.conversationId === activeConvo?._id) setMessages((prev) => [...prev, msg]);
//       setConversations((prev) =>
//         prev.map((c) =>
//           c._id === msg.conversationId
//             ? { ...c, lastMessage: msg.text || c.lastMessage, updatedAt: msg.createdAt || new Date().toISOString() }
//             : c
//         )
//       );
//     };
//     socket.on("new-message", handleNewMessage);
//     return () => socket.off("new-message", handleNewMessage);
//   }, [activeConvo]);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//     const handleCallAccepted = async ({ conversationId }: any) => {
//       clearTimeout(callTimeoutRef.current);
//       await joinCall(conversationId, user?._id, true);
//     };
//     socket.on("call-accepted", handleCallAccepted);
//     return () => socket.off("call-accepted", handleCallAccepted);
//   }, [joinCall, user?._id]);

//   useEffect(() => {
//     const handleIncomingCall = ({ fromUser, conversationId, type }: any) => {
//       setIncomingCall({ fromUser, conversationId, type });
//       setCallType(type || "video");
//       ringingAudio.current?.play().catch(() => {});
//       callTimeoutRef.current = setTimeout(() => {
//         ringingAudio.current?.pause();
//         setIncomingCall(null);
//         socket.emit("missed-call", { toUserId: fromUser._id, conversationId });
//       }, 30000);
//     };
//     const handleCallEnded = () => {
//       ringingAudio.current?.pause();
//       leaveCall();
//       setIncomingCall(null);
//     };
//     socket.on("incoming-call", handleIncomingCall);
//     socket.on("call-ended", handleCallEnded);
//     return () => {
//       socket.off("incoming-call", handleIncomingCall);
//       socket.off("call-ended", handleCallEnded);
//     };
//   }, [leaveCall]);

//   const sendMessage = () => {
//     if (!input.trim() || !activeConvo || !user?._id) return;
//     socket.emit("send-message", {
//       conversationId: activeConvo._id,
//       senderId: user._id,
//       text: input,
//     });
//     setInput("");
//   };

//   const handleAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || !activeConvo) return;
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("conversationId", activeConvo._id);
//     const res = await fetch(`${API_BASE}/api/chat/attachment`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${token}` },
//       body: formData,
//     });
//     const data = await res.json();
//     if (data?.message) {
//       setMessages((prev) => [...prev, data.message]);
//       socket.emit("new-message", data.message);
//     }
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const connectGoogle = () => {
//     const w = 500, h = 600;
//     const left = window.screenX + (window.outerWidth - w) / 2;
//     const top = window.screenY + (window.outerHeight - h) / 2;
//     window.open(`${API_BASE}/api/auth/google`, "googleAuth", `width=${w},height=${h},left=${left},top=${top}`);
//   };

//   useEffect(() => {
//     const listener = (e: MessageEvent) => { if (e.data?.success) alert("Google connected successfully"); };
//     window.addEventListener("message", listener);
//     return () => window.removeEventListener("message", listener);
//   }, []);

//   const startMeetCall = async () => {
//     if (!activeConvo) return;
//     const res = await fetch(`${API_BASE}/api/google-meet/create`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//       body: JSON.stringify({ summary: `Meeting with ${activeConvo.otherUser?.name || "User"}` }),
//     });
//     const data = await res.json();
//     if (data.error === "google_not_connected") { connectGoogle(); return; }
//     if (!data?.meetLink) return;
//     socket.emit("send-message", {
//       conversationId: activeConvo._id,
//       senderId: user._id,
//       text: `📞 Google Meet: ${data.meetLink}`,
//     });
//     window.open(data.meetLink, "_blank");
//   };

//   const renderMessageText = (text: string) => {
//     const urlRegex = /(https?:\/\/[^\s]+)/g;
//     return text.split(urlRegex).map((part, i) =>
//       part.match(urlRegex) ? (
//         <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="break-all text-blue-400 underline hover:text-blue-300">{part}</a>
//       ) : (
//         <span key={i}>{part}</span>
//       )
//     );
//   };

//   const deleteActiveConversation = async () => {
//     if (!activeConvo) return;
//     if (!confirm("Delete this chat?")) return;
//     await fetch(`${API_BASE}/api/chat/conversation/${activeConvo._id}`, {
//       method: "DELETE",
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     setActiveConvo(null);
//     setMessages([]);
//     setConversations((prev) => prev.filter((c) => c._id !== activeConvo._id));
//     setMobileView("list");
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-[#07080A] text-white">
//       <img
//         src="/icons/mpbg.png"
//         alt="background"
//         className="pointer-events-none fixed inset-0 z-0 h-screen w-full select-none object-contain object-top"
//       />

//       <div className="relative z-20">
//         <Header />
//       </div>

//       {/* Landing page content — hidden on mobile to save space */}
//       <main className="relative z-10 hidden md:flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-20">
//         <div className="w-full max-w-[560px] rounded-[32px] border border-white/10 bg-white/[0.06] px-8 py-10 text-center shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-sm">
//           <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: GRADIENT }}>
//             <FiSend className="text-[30px] text-white" />
//           </div>
//           <h1 className="text-[32px] font-semibold leading-[40px] text-white" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>Messages</h1>
//           <p className="mx-auto mt-3 max-w-[360px] text-[16px] font-normal leading-[24px] text-white/55" style={{ fontFamily: "Inter, sans-serif" }}>
//             Your conversations will appear here.
//           </p>
//           <button
//             onClick={() => setOpenChatPopup(true)}
//             className="mt-8 h-12 rounded-full px-8 text-[14px] font-semibold leading-[20px] text-white transition hover:opacity-90"
//             style={{ background: GRADIENT, fontFamily: "Inter, sans-serif" }}
//           >
//             Open Message
//           </button>
//         </div>
//       </main>

//       {openChatPopup && (
//         <div className="fixed inset-0 z-[99999] flex items-start justify-center bg-black/45 px-0 sm:px-6 pb-0 sm:pb-5 pt-0 sm:pt-[60px] backdrop-blur-md">
//           {/*
//             DESKTOP: max-w popup with rounded corners
//             MOBILE: full screen, no rounding
//           */}
//           <div className="relative h-[100dvh] sm:h-[calc(100vh-80px)] sm:min-h-[610px] w-full sm:w-[1240px] sm:max-w-[calc(100vw-48px)] overflow-hidden sm:rounded-[32px] bg-[#171717] shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
//             <div className="flex h-full overflow-hidden">

//               {/* ── SIDEBAR ── */}
//               {/* Desktop: always visible. Mobile: visible only when mobileView === "list" */}
//               <aside
//                 className={`
//                   ${mobileView === "list" ? "flex" : "hidden"}
//                   sm:flex
//                   relative h-full w-full sm:w-[322px] shrink-0 flex-col bg-[#151517]
//                 `}
//               >
//                 <div className="absolute right-0 top-0 h-full w-px bg-white/10 hidden sm:block" />

//                 <div className="px-5 sm:px-8 pt-6 sm:pt-8">
//                   <div className="flex items-center justify-between text-white">
//                     <h2 className="text-[20px] sm:text-[24px] font-medium leading-[32px]" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
//                       Messages
//                     </h2>
//                     <div className="flex items-center gap-3">
//                       <img src="/icons/pen.svg" alt="" className="h-[22px] w-[22px] object-contain" />
//                       {/* Close button only on mobile */}
//                       <button
//                         onClick={() => setOpenChatPopup(false)}
//                         className="sm:hidden grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white"
//                       >
//                         <X size={16} />
//                       </button>
//                     </div>
//                   </div>
//                   <div className="mt-5 sm:mt-7 flex h-[34px] items-center rounded-lg bg-white/85 px-4 text-zinc-900">
//                     <input className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500" placeholder="Search chats..." />
//                     <Search size={20} />
//                   </div>
//                 </div>

//                 <div className="mt-6 sm:mt-8 flex-1 overflow-y-auto">
//                   {loadingConversations ? (
//                     <p className="px-5 sm:px-8 text-sm text-white/40">Loading chats...</p>
//                   ) : conversations.length === 0 ? (
//                     <p className="px-5 sm:px-8 text-sm text-white/40">No conversations yet.</p>
//                   ) : (
//                     conversations.map((c) => {
//                       const active = activeConvo?._id === c._id;
//                       const lastText = getLastMessageText(c);
//                       return (
//                         <button
//                           key={c._id}
//                           onClick={() => {
//                             setActiveConvo(c);
//                             setShowProfile(false);
//                             setMobileView("chat"); // on mobile, switch to chat view
//                           }}
//                           className={`relative flex w-full gap-4 px-5 sm:px-8 py-4 sm:py-5 text-left transition ${active ? "bg-[#221b2e]" : "hover:bg-white/[0.03]"}`}
//                         >
//                           {active && (
//                             <span className="absolute right-0 top-0 h-full w-[3px] bg-gradient-to-b from-fuchsia-500 to-blue-500" />
//                           )}
//                           <UserAvatar user={c.otherUser} size="lg" online />
//                           <div className="min-w-0 flex-1">
//                             <div className="flex items-start justify-between gap-3">
//                               <p className="truncate text-[14px] font-semibold leading-[20px] text-white" style={{ fontFamily: "Inter, sans-serif" }}>
//                                 {c.otherUser?.name || "Unknown User"}
//                               </p>
//                               <span className="shrink-0 text-[11px] leading-[16px] text-zinc-500" style={{ fontFamily: "Inter, sans-serif" }}>
//                                 {formatTime(c.lastMessage?.createdAt || c.updatedAt) || "Now"}
//                               </span>
//                             </div>
//                             <p className={`mt-1 truncate text-[14px] font-normal leading-[20px] ${active ? "text-purple-200" : "text-zinc-400"}`} style={{ fontFamily: "Inter, sans-serif" }}>
//                               {lastText}
//                             </p>
//                             {active && (
//                               <p className="mt-1 text-[14px] font-normal italic leading-[20px] text-zinc-500" style={{ fontFamily: "Inter, sans-serif" }}>
//                                 Typing...
//                               </p>
//                             )}
//                           </div>
//                         </button>
//                       );
//                     })
//                   )}
//                 </div>
//               </aside>

//               {/* ── MAIN CHAT AREA ── */}
//               {/* Desktop: always visible. Mobile: visible only when mobileView === "chat" */}
//               <main
//                 className={`
//                   ${mobileView === "chat" ? "flex" : "hidden"}
//                   sm:flex
//                   min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#171717]
//                 `}
//               >
//                 {/* Header */}
//                 <header className="flex h-16 sm:h-20 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-8">
//                   {activeConvo ? (
//                     <div className="flex items-center gap-2 sm:gap-4 min-w-0">
//                       {/* Back arrow — mobile only */}
//                       <button
//                         onClick={() => setMobileView("list")}
//                         className="sm:hidden mr-1 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white shrink-0"
//                       >
//                         <ArrowLeft size={16} />
//                       </button>
//                       <UserAvatar user={activeConvo.otherUser} size="md" online />
//                       <div className="min-w-0">
//                         <h1 className="truncate text-[13px] sm:text-[14px] font-semibold leading-[20px] text-white" style={{ fontFamily: "Inter, sans-serif" }}>
//                           {activeConvo.otherUser?.name || "Unknown User"}
//                         </h1>
//                         <p className="text-[11px] sm:text-[12px] font-normal leading-[18px] text-zinc-500" style={{ fontFamily: "Inter, sans-serif" }}>
//                           <span className="text-emerald-400">Active Now</span>
//                           {activeConvo.otherUser?.role ? ` • ${activeConvo.otherUser.role}` : ""}
//                         </p>
//                       </div>
//                     </div>
//                   ) : (
//                     <div>
//                       <h1 className="text-[14px] font-semibold leading-[20px] text-white" style={{ fontFamily: "Inter, sans-serif" }}>Select Chat</h1>
//                       <p className="text-[12px] leading-[18px] text-zinc-500" style={{ fontFamily: "Inter, sans-serif" }}>Choose a conversation</p>
//                     </div>
//                   )}

//                   <div className="flex items-center gap-2 sm:gap-4 shrink-0">
//                     <button
//                       onClick={startMeetCall}
//                       disabled={!activeConvo}
//                       className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full bg-white/[0.06] text-white hover:bg-white/10 disabled:opacity-40"
//                       title="Google Meet"
//                     >
//                       <FiVideo className="text-[16px] sm:text-[19px] text-white" />
//                     </button>
//                     <button
//                       onClick={() => setShowProfile((v) => !v)}
//                       disabled={!activeConvo}
//                       className="hidden sm:grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-white hover:bg-white/10 disabled:opacity-40"
//                       title="Info"
//                     >
//                       <FiInfo className="text-[19px] text-white" />
//                     </button>
//                     <button
//                       onClick={deleteActiveConversation}
//                       disabled={!activeConvo}
//                       className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full bg-[#5A1518] text-white hover:bg-[#751B20] disabled:opacity-40"
//                       title="Delete"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                     {/* Close button — desktop only */}
//                     <button
//                       onClick={() => setOpenChatPopup(false)}
//                       className="hidden sm:grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-white hover:bg-white/10"
//                       title="Close"
//                     >
//                       <X size={20} />
//                     </button>
//                   </div>
//                 </header>

//                 {/* Messages */}
//                 <section className="min-h-0 flex-1 overflow-y-auto px-3 sm:px-20 py-4 sm:py-5">
//                   <div className="mx-auto w-fit rounded-full bg-white px-4 py-1.5 text-[10px] font-medium uppercase text-zinc-600" style={{ fontFamily: "Inter, sans-serif" }}>
//                     {formatChatDate()}
//                   </div>

//                   {!activeConvo ? (
//                     <div className="flex h-full items-center justify-center">
//                       <p className="text-sm text-white/40">Select a conversation to start chatting.</p>
//                     </div>
//                   ) : loadingMessages ? (
//                     <div className="flex h-full items-center justify-center">
//                       <p className="text-sm text-white/40">Loading messages...</p>
//                     </div>
//                   ) : messages.length === 0 ? (
//                     <div className="flex h-full items-center justify-center">
//                       <p className="text-sm text-white/40">No messages yet.</p>
//                     </div>
//                   ) : (
//                     messages.map((m) => {
//                       const senderId = getMessageSenderId(m);
//                       const isMine = senderId === user?._id;
//                       const hireData = parseHireCardData(m.text);
//                       const counterData = parseCounterCardData(m.text);

//                       return (
//                         <div
//                           key={m._id}
//                           className={`mt-4 sm:mt-5 flex items-start gap-2 sm:gap-4 ${isMine ? "justify-end" : "justify-start"}`}
//                         >
//                           {!isMine && <UserAvatar user={activeConvo.otherUser} size="sm" online={false} />}
//                           <div className="max-w-[85%] sm:max-w-[610px]">
//                             {hireData ? (
//                               <HireCard
//                                 data={hireData}
//                                 conversationId={activeConvo._id}
//                                 senderId={user?._id}
//                                 token={token}
//                               />
//                             ) : counterData ? (
//                               <CounterProposalCard data={counterData} />
//                             ) : (
//                               m.text && (
//                                 <div
//                                   className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-[14px] sm:text-[15px] font-normal leading-[22px] tracking-[0px] break-words whitespace-pre-line ${isMine ? "text-white" : "bg-[#2b2b2b] text-zinc-200"}`}
//                                   style={{ background: isMine ? GRADIENT : undefined, fontFamily: "Plus Jakarta Sans, sans-serif" }}
//                                 >
//                                   {renderMessageText(m.text)}
//                                 </div>
//                               )
//                             )}

//                             {m.attachment && (
//                               <div className="mt-2">
//                                 {m.attachment.type === "image" ? (
//                                   <img src={m.attachment.url} className="max-w-[200px] sm:max-w-[240px] rounded-lg" />
//                                 ) : (
//                                   <a href={m.attachment.url} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-blue-400 underline">
//                                     📎 {m.attachment.name}
//                                   </a>
//                                 )}
//                               </div>
//                             )}

//                             <p className={`mt-1 sm:mt-2 text-xs text-zinc-600 ${isMine ? "text-right" : "text-left"}`}>
//                               {formatTime(m.createdAt)}
//                             </p>
//                           </div>
//                           {isMine && <UserAvatar user={user} size="sm" online={false} />}
//                         </div>
//                       );
//                     })
//                   )}
//                   <div ref={bottomRef} />
//                 </section>

//                 {/* Footer */}
//                 <footer className="shrink-0 border-t border-white/5 px-3 sm:px-8 py-3 sm:py-6">
//                   <div className="flex items-center gap-2 sm:gap-6">
//                     <button
//                       onClick={() => fileInputRef.current?.click()}
//                       disabled={!activeConvo}
//                       className="grid h-7 w-7 place-items-center rounded-full border border-zinc-500 text-zinc-500 hover:text-white disabled:opacity-40 shrink-0"
//                     >
//                       <Plus size={20} />
//                     </button>
//                     <input ref={fileInputRef} type="file" hidden onChange={handleAttachment} />
//                     <div className="flex h-11 sm:h-12 flex-1 items-center gap-2 sm:gap-4 rounded-2xl bg-white px-3 sm:px-5 text-zinc-900">
//                       <input
//                         value={input}
//                         onChange={(e) => setInput(e.target.value)}
//                         onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
//                         disabled={!activeConvo}
//                         className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed"
//                         placeholder={activeConvo ? "Type a message..." : "Select conversation first"}
//                       />
//                       <button onClick={() => fileInputRef.current?.click()} disabled={!activeConvo} className="disabled:opacity-40 shrink-0">
//                         <img src="/icons/calo.svg" alt="" className="h-[24px] w-[24px] sm:h-[28px] sm:w-[28px] object-contain opacity-80 hover:opacity-100" />
//                       </button>
//                     </div>
//                     <SendButton disabled={!activeConvo} onClick={sendMessage} />
//                   </div>
//                 </footer>
//               </main>

//               {/* ── PROFILE SIDEBAR ── */}
//               {showProfile && activeConvo && (
//                 <aside className="absolute right-0 top-16 sm:top-20 h-[calc(100%-64px)] sm:h-[calc(100%-80px)] w-[280px] sm:w-[300px] border-l border-white/10 bg-[#151517] p-4 sm:p-6 shadow-2xl z-50">
//                   <div className="flex justify-end">
//                     <button onClick={() => setShowProfile(false)} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white">
//                       <X size={16} />
//                     </button>
//                   </div>
//                   <div className="mt-6 text-center">
//                     <div className="mx-auto flex h-24 w-24 items-center justify-center">
//                       <UserAvatar user={activeConvo.otherUser} size="xl" online />
//                     </div>
//                     <h3 className="mt-5 text-[14px] font-semibold leading-[20px]" style={{ fontFamily: "Inter, sans-serif" }}>
//                       {activeConvo.otherUser?.name}
//                     </h3>
//                     <p className="mb-6 text-xs text-white/50">{activeConvo.otherUser?.role || "User"}</p>
//                     <h4 className="mb-3 text-xs font-semibold uppercase text-white/40">Shared Resources</h4>
//                     <div className="space-y-3">
//                       {sharedResources.length === 0 && <p className="text-xs text-white/40">No shared files yet</p>}
//                       {sharedResources.map((m, i) => (
//                         <a key={i} href={m.attachment.url} target="_blank" rel="noopener noreferrer" className="block break-all rounded-lg bg-[#202020] px-3 py-2 text-xs hover:bg-white/10">
//                           📎 {m.attachment.name}
//                         </a>
//                       ))}
//                     </div>
//                   </div>
//                 </aside>
//               )}

//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── INCOMING CALL ── */}
//       {incomingCall && (
//         <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 px-4">
//           <div className="w-[92vw] max-w-[360px] rounded-2xl bg-[#121212] p-6 text-center text-white">
//             <p className="mb-1 text-lg font-semibold">Incoming {callType === "audio" ? "Audio" : "Video"} Call</p>
//             <p className="mb-6 text-sm text-white/60">{incomingCall.fromUser.name} is calling you</p>
//             <div className="flex justify-center gap-4">
//               <button
//                 onClick={async () => {
//                   clearTimeout(callTimeoutRef.current);
//                   ringingAudio.current?.pause();
//                   await joinCall(incomingCall.conversationId, user._id);
//                   socket.emit("call-accepted", { toUserId: incomingCall.fromUser._id, conversationId: incomingCall.conversationId });
//                   setIncomingCall(null);
//                 }}
//                 className="rounded-full bg-green-500 px-6 py-2 font-medium text-black"
//               >
//                 Accept
//               </button>
//               <button
//                 onClick={() => {
//                   clearTimeout(callTimeoutRef.current);
//                   ringingAudio.current?.pause();
//                   socket.emit("end-call", { toUserId: incomingCall.fromUser._id });
//                   setIncomingCall(null);
//                 }}
//                 className="rounded-full bg-red-500 px-6 py-2 font-medium text-white"
//               >
//                 Reject
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { socket } from "@/lib/socket";
import { useAuth } from "@/contexts/AuthContext";
import { FiVideo, FiInfo, FiSend } from "react-icons/fi";
import { Search, Trash2, X, Plus, ArrowLeft, ShieldAlert, Check, Pencil } from "lucide-react";
import { useAgoraCall } from "@/hooks/useAgoraCall";
import { ReportModal } from "@/components/ReportModal";
import NdaButton from "@/components/NdaCard";
import { toast } from "@/components/ui/use-toast";
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

type CounterPayload = {
  originalBudget: number;
  originalTargetDate: string;
  newBudget: string;
  newTargetDate: string;
  explanation: string;
};

function getAvatarUrl(avatar?: string) {
  if (!avatar) return "";
  if (avatar.startsWith("http")) return avatar;
  return `${API_BASE}${avatar}`;
}

function getFallbackAvatar(user?: any) {
  const key = user?._id || user?.id || user?.email || user?.name || "default-user";
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(key)}`;
}

function getMessageSenderId(message: any) {
  return message?.senderId || message?.sender?._id || message?.sender || "";
}

function getLastMessageText(conversation: any) {
  const last = conversation?.lastMessage;
  if (!last) return "Start conversation";
  if (typeof last === "string") return last;
  if (last?.text) return last.text;
  return "Start conversation";
}

function formatTime(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatChatDate(date?: string) {
  const d = date ? new Date(date) : new Date();
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMonthLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const formatCounterDateDisplay = (value: string) => {
  if (!value) return "mm/dd/yyyy";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "mm/dd/yyyy";
  return new Date(year, month - 1, day).toLocaleDateString("en-US");
};

function formatProposalDate(dateStr?: string) {
  if (!dateStr) return "-";
  if (["days", "weeks", "month", "unsure"].includes(dateStr)) return dateStr;
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getFileUrl(url?: string) {
  if (!url) return "#";
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
}

function formatFileSize(size?: number) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function parseHireCardData(text?: string) {
  if (!text) return null;
  const prefixes = ["HIRE_CARD::", "__HIRE_PROPOSAL__::"];
  const prefix = prefixes.find((p) => text.startsWith(p));
  if (!prefix) return null;
  try { return JSON.parse(text.replace(prefix, "")); } catch { return null; }
}

function parseCounterCardData(text?: string) {
  if (!text) return null;
  if (!text.startsWith("COUNTER_CARD::")) return null;
  try { return JSON.parse(text.replace("COUNTER_CARD::", "")); } catch { return null; }
}

// ── NEW: HIRE_ACCEPTED parser ──
function parseHireAcceptedData(text?: string) {
  if (!text) return null;
  if (!text.startsWith("HIRE_ACCEPTED::")) return null;
  try { return JSON.parse(text.replace("HIRE_ACCEPTED::", "")); } catch { return null; }
}

// ── Parser functions ──
function parseWorkSubmittedData(text?: string) {
  if (!text) return null;
  if (!text.startsWith("WORK_SUBMITTED::")) return null;
  try { return JSON.parse(text.replace("WORK_SUBMITTED::", "")); } catch { return null; }
}

function parseEscrowReleasedData(text?: string) {
  if (!text) return null;
  if (!text.startsWith("ESCROW_RELEASED::")) return null;
  try { return JSON.parse(text.replace("ESCROW_RELEASED::", "")); } catch { return null; }
}

function parseServiceCardData(text?: string) {
  if (!text) return null;
  if (!text.startsWith("SERVICE_CARD::")) return null;
  try { return JSON.parse(text.replace("SERVICE_CARD::", "")); } catch { return null; }
}

function parseServiceWorkSubmittedData(text?: string) {
  if (!text) return null;
  if (!text.startsWith("SERVICE_WORK_SUBMITTED::")) return null;
  try { return JSON.parse(text.replace("SERVICE_WORK_SUBMITTED::", "")); } catch { return null; }
}

function RevisionReasonPopup({
  open,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/60 px-4 backdrop-blur-[12px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 520,
          maxWidth: "calc(100vw - 32px)",
          borderRadius: 26,
          background: "#212121",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.65)",
          padding: "28px",
          boxSizing: "border-box",
          color: "#FFFFFF",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "2.6px",
                color: "#C783FF",
                textTransform: "uppercase",
              }}
            >
              Request Revision
            </div>

            <h2
              style={{
                margin: "10px 0 0",
                fontSize: 28,
                lineHeight: "34px",
                fontWeight: 800,
                color: "#F3EAF9",
              }}
            >
              Tell freelancer what to change
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              width: 30,
              height: 30,
              border: "none",
              background: "transparent",
              color: "rgba(255,255,255,0.35)",
              cursor: loading ? "not-allowed" : "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <X size={22} />
          </button>
        </div>

        <div
          style={{
            marginTop: 22,
            borderRadius: 18,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: 14,
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: 10,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "1.7px",
              color: "rgba(255,255,255,0.45)",
              textTransform: "uppercase",
            }}
          >
            Revision Reason
          </label>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Example: Please update the homepage spacing, fix mobile layout, and attach final source files again."
            autoFocus
            style={{
              width: "100%",
              height: 130,
              resize: "none",
              outline: "none",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 14,
              background: "rgba(0,0,0,0.22)",
              padding: "14px",
              color: "#FFFFFF",
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              lineHeight: "20px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <p
          style={{
            margin: "10px 0 0",
            fontSize: 12,
            lineHeight: "18px",
            color: "rgba(255,255,255,0.42)",
          }}
        >
          Ye reason freelancer ko notification mein jayega aur project status revision requested ho jayega.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              width: 150,
              height: 46,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "#242424",
              color: "#FFFFFF",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontSize: 14,
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onSubmit(reason.trim())}
            disabled={loading}
            style={{
              width: 190,
              height: 46,
              borderRadius: 8,
              border: "none",
              background: GRADIENT,
              color: "#FFFFFF",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.65 : 1,
              fontSize: 14,
            }}
          >
            {loading ? "Requesting..." : "Send Revision"}
          </button>
        </div>
      </div>
    </div>
  );
}



function WorkSubmittedCard({
  data,
  isMine,
  token,
}: {
  data: any;
  isMine?: boolean;
  token?: string;
}) {
  const [actionState, setActionState] = useState<
    "idle" | "approving" | "revising" | "done"
  >("idle");
  const [result, setResult] = useState<"approved" | "revision" | null>(null);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  // ── Load real deal status on mount so refresh works correctly ─────────────
  const dealId = data?.hireDealId || data?.dealId;

  useEffect(() => {
    if (!dealId || !token) return;
    fetch(`${API_BASE}/api/hire/${dealId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d?.success || !d?.deal) return;
        const deal = d.deal;
        if (
          deal.status === "COMPLETED" &&
          deal.fundsStatus === "RELEASED_TO_FREELANCER"
        ) {
          setResult("approved");
          setActionState("done");
        } else if (deal.status === "REVISION_REQUESTED") {
          setResult("revision");
          setActionState("done");
        }
      })
      .catch(() => {
        // silently ignore — card still works without pre-loaded status
      });
  }, [dealId, token]);

  const isApproved = actionState === "done" && result === "approved";

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!token) {
      alert("Please login again.");
      return;
    }
    if (!dealId) {
      alert("Deal ID missing. Please refresh and try again.");
      return;
    }
    setActionState("approving");
    try {
      const res = await fetch(`${API_BASE}/api/hire/${dealId}/approve-work`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d?.success) throw new Error(d?.error || "Approval failed");
      setResult("approved");
      setActionState("done");
    } catch (err: any) {
      alert(err?.message || "Could not approve. Please try again.");
      setActionState("idle");
    }
  };

  // ── Revision ──────────────────────────────────────────────────────────────
  const handleRevisionSubmit = async (reason: string) => {
    if (!token || !dealId) return;
    setActionState("revising");
    try {
      const res = await fetch(
        `${API_BASE}/api/hire/${dealId}/request-revision`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: reason || "Revision requested" }),
        }
      );
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d?.success)
        throw new Error(d?.error || "Revision request failed");
      setRevisionOpen(false);
      setResult("revision");
      setActionState("done");
    } catch (err: any) {
      alert(err?.message || "Revision request failed");
      setActionState("idle");
    }
  };

  // ── Download helper (fetch + blob so auth header can be sent if needed) ───
  const handleDownload = async (
    e: React.MouseEvent,
    fileUrl: string,
    fileName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(fileUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "work-file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: open in new tab
      window.open(fileUrl, "_blank");
    }
  };

  // ── Preview helper ────────────────────────────────────────────────────────
  // Static files served by Express don't need auth — just open in new tab.
  // If your backend requires auth for /uploads, swap this for a fetch+blob
  // approach similar to handleDownload above but without the download attribute.
  const handlePreview = (e: React.MouseEvent, fileUrl: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const PURPLE = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

  return (
    <>
      <div
        style={{
          width: "100%",
          maxWidth: 505,
          borderRadius: 24,
          background: "#1E1A2A",
          overflow: "hidden",
          fontFamily: "Inter, sans-serif",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(192,132,252,0.15)",
        }}
      >
        {/* ── Top bar ── */}
        <div
          style={{
            height: 50,
            background: PURPLE,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.25)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              📦
            </span>
            <span
              style={{
                fontWeight: 600,
                fontSize: 11,
                letterSpacing: "2.4px",
                color: "#FFFFFF",
              }}
            >
              WORK SUBMITTED
            </span>
          </div>
          <span
            style={{
              height: 24,
              padding: "0 14px",
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.30)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 10,
            }}
          >
            {result === "approved"
              ? "APPROVED"
              : result === "revision"
              ? "REVISION"
              : "REVIEW"}
          </span>
        </div>

        {/* ── Body ── */}
        <div
          style={{ padding: "20px 24px 24px", boxSizing: "border-box" }}
        >
          <h3
            style={{
              margin: "0 0 6px",
              fontWeight: 600,
              fontSize: 18,
              color: "#FFFFFF",
            }}
          >
            {data?.title || "Project"}
          </h3>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
              lineHeight: "18px",
            }}
          >
            {data?.message || "Work has been submitted for review."}
          </p>

          {/* ── Files ── */}
          {data?.deliverables?.length > 0 && (
            <div
              style={{
                borderRadius: 14,
                background: "rgba(192,132,252,0.06)",
                border: "1px solid rgba(192,132,252,0.15)",
                padding: "14px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 18 }}>📁</span>
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "1.6px",
                    color: "rgba(192,132,252,0.85)",
                  }}
                >
                  PROJECT FILES
                </p>
                {/* Show lock badge for client before approval */}
                {!isApproved && !isMine && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.8px",
                      color: "rgba(250,188,78,0.9)",
                      background: "rgba(250,188,78,0.12)",
                      border: "1px solid rgba(250,188,78,0.25)",
                      borderRadius: 999,
                      padding: "3px 8px",
                    }}
                  >
                    🔒 APPROVE TO DOWNLOAD
                  </span>
                )}
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {data.deliverables.map((d: any, i: number) => {
                  // Build correct file URL
                  const fileUrl = d.url?.startsWith("http")
                    ? d.url
                    : `${API_BASE}${d.url}`;

                  const fileName =
                    d.name || d.description || `file-${i + 1}`;

                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        borderRadius: 10,
                        background: "rgba(0,0,0,0.22)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        padding: "10px 12px",
                        color: "#FFFFFF",
                      }}
                    >
                      {/* File name */}
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <span style={{ fontSize: 15 }}>📎</span>
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: 13,
                            color: "#EDE9FE",
                          }}
                        >
                          {fileName}
                        </span>
                      </span>

                      {/* Actions */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexShrink: 0,
                        }}
                      >
                        {/* File size */}
                        <span
                          style={{
                            fontSize: 10,
                            color: "rgba(255,255,255,0.38)",
                          }}
                        >
                          {d.size
                            ? d.size < 1024 * 1024
                              ? `${(d.size / 1024).toFixed(1)} KB`
                              : `${(d.size / 1024 / 1024).toFixed(2)} MB`
                            : ""}
                        </span>

                        {/* ── PREVIEW — always available for everyone ── */}
                        <button
                          onClick={(e) => handlePreview(e, fileUrl)}
                          title="Preview file"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: "rgba(192,132,252,0.12)",
                            border: "1px solid rgba(192,132,252,0.22)",
                            color: "#C084FC",
                            fontSize: 13,
                            cursor: "pointer",
                            background: "none",
                          }}
                        >
                          👁
                        </button>

                        {/* ── DOWNLOAD — only after approve OR for freelancer ── */}
                        {isApproved || isMine ? (
                          <button
                            onClick={(e) =>
                              handleDownload(e, fileUrl, fileName)
                            }
                            title="Download file"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              background: "rgba(25,230,108,0.10)",
                              border: "1px solid rgba(25,230,108,0.22)",
                              color: "#19E66C",
                              fontSize: 16,
                              cursor: "pointer",
                              fontWeight: 700,
                            }}
                          >
                            ↓
                          </button>
                        ) : (
                          /* Locked download for client before approval */
                          <div
                            title="Download unlocks after you approve and release payment"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.10)",
                              color: "rgba(255,255,255,0.22)",
                              fontSize: 13,
                              cursor: "not-allowed",
                            }}
                          >
                            🔒
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submission note */}
              {data?.note && (
                <div
                  style={{
                    marginTop: 12,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "10px 12px",
                    fontSize: 12,
                    lineHeight: "18px",
                    color: "rgba(255,255,255,0.65)",
                    whiteSpace: "pre-line",
                  }}
                >
                  {data.note}
                </div>
              )}

              {/* Auto-release notice for client */}
              {!isMine && !isApproved && (
                <div
                  style={{
                    marginTop: 10,
                    borderRadius: 8,
                    background: "rgba(26,115,232,0.08)",
                    border: "1px solid rgba(26,115,232,0.15)",
                    padding: "8px 12px",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.45)",
                    lineHeight: "17px",
                  }}
                >
                  ⏱ Payment auto-releases to freelancer in{" "}
                  <strong style={{ color: "rgba(255,255,255,0.65)" }}>
                    72 hours
                  </strong>{" "}
                  if no action is taken. Preview files, then approve or request
                  revision.
                </div>
              )}
            </div>
          )}

          {/* ── Client action buttons ── */}
          {!isMine && actionState !== "done" && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={handleApprove}
                disabled={actionState !== "idle"}
                style={{
                  flex: "1 1 150px",
                  height: 48,
                  border: "none",
                  borderRadius: 8,
                  background:
                    "linear-gradient(90deg, #19E66C 0%, #0BA84A 100%)",
                  color: "#fff",
                  cursor:
                    actionState !== "idle" ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                  opacity: actionState !== "idle" ? 0.6 : 1,
                }}
              >
                {actionState === "approving"
                  ? "Releasing Payment..."
                  : "✓ Approve & Release Payment"}
              </button>

              <button
                onClick={() => setRevisionOpen(true)}
                disabled={actionState !== "idle"}
                style={{
                  flex: "1 1 130px",
                  height: 48,
                  borderRadius: 8,
                  background: "#202020",
                  border: "1px solid rgba(192,132,252,0.22)",
                  color: "rgba(255,255,255,0.75)",
                  cursor:
                    actionState !== "idle" ? "not-allowed" : "pointer",
                  fontWeight: 400,
                  fontSize: 14,
                  opacity: actionState !== "idle" ? 0.6 : 1,
                }}
              >
                ↺ Request Revision
              </button>
            </div>
          )}

          {/* ── Result states ── */}
          {actionState === "done" && result === "approved" && (
            <div
              style={{
                height: 48,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(25,230,108,0.1)",
                border: "1px solid rgba(25,230,108,0.25)",
                color: "#19E66C",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              ✓ Payment Released — Files unlocked for download
            </div>
          )}

          {actionState === "done" && result === "revision" && (
            <div
              style={{
                height: 48,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(250,188,78,0.1)",
                border: "1px solid rgba(250,188,78,0.25)",
                color: "#FABC4E",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              ↺ Revision requested — Freelancer will resubmit
            </div>
          )}

          {/* Freelancer view */}
          {isMine && (
            <div
              style={{
                height: 48,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(192,132,252,0.06)",
                border: "1px solid rgba(192,132,252,0.15)",
                color: "rgba(192,132,252,0.8)",
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              ⏳ Waiting for client review — Payment auto-releases in 72 hours
            </div>
          )}
        </div>


{/* Report button */}
          {dealId && (
            <>
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                style={{
                  marginTop: 10,
                  width: "100%",
                  height: 36,
                  borderRadius: 8,
                  border: "1px solid rgba(239,68,68,0.25)",
                  background: "rgba(239,68,68,0.06)",
                  color: "rgba(239,68,68,0.70)",
                  fontWeight: 500,
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                }}
              >
                <ShieldAlert size={13} />
                Report an Issue
              </button>

              <ReportModal
                open={reportOpen}
                onClose={() => setReportOpen(false)}
                dealId={dealId}
                token={token}
              />
            </>
          )}



      </div>

      <RevisionReasonPopup
        open={revisionOpen}
        loading={actionState === "revising"}
        onClose={() => {
          if (actionState !== "revising") setRevisionOpen(false);
        }}
        onSubmit={handleRevisionSubmit}
      />
    </>
  );
}

function EscrowReleasedCard({ data }: { data: any }) {
  return (
    <div style={{ width: "100%", maxWidth: 505, borderRadius: 20, background: "#0F1F14", overflow: "hidden", fontFamily: "Inter, sans-serif", boxShadow: "0 0 0 1px rgba(25,230,108,0.2)" }}>
      <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(25,230,108,0.15)", border: "1.5px solid rgba(25,230,108,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
          ✅
        </div>
        <div>
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#19E66C" }}>Payment Released!</h3>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: "18px" }}>
            ₹{Number(data?.amount || 0).toLocaleString("en-IN")} has been transferred from Tokun Escrow to freelancer's bank account.
          </p>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(25,230,108,0.1)", padding: "12px 24px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: "rgba(25,230,108,0.6)", fontWeight: 600, letterSpacing: "1px" }}>PROJECT COMPLETED</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{data?.title}</span>
      </div>
    </div>
  );
}



// ─────────────────────────────────────────────
// UserAvatar
// ─────────────────────────────────────────────
/**
 * Delivery state for one of YOUR OWN messages.
 *
 *   ✓    sent      — stored, the recipient wasn't connected
 *   ✓✓   delivered — reached a connected recipient
 *   ✓✓   read      — recipient opened the thread (blue)
 *
 * Read is checked before delivered because a read message is necessarily
 * delivered, and `recipientIds` excludes the sender — being in your own
 * readBy (which the server sets on send) must not count as "they read it".
 */
function MessageTicks({
  message,
  recipientIds,
}: {
  message: any;
  recipientIds: string[];
}) {
  if (!recipientIds.length) return null;

  const readBy = (message?.readBy || []).map(String);
  const deliveredTo = (message?.deliveredTo || []).map(String);

  const readByAny = recipientIds.some((id) => readBy.includes(id));
  const deliveredToAny = recipientIds.some((id) => deliveredTo.includes(id));

  const state = readByAny ? "read" : deliveredToAny ? "delivered" : "sent";
  const label = state === "read" ? "Read" : state === "delivered" ? "Delivered" : "Sent";

  return (
    <span
      title={label}
      aria-label={label}
      className={`inline-flex items-center ${state === "read" ? "text-sky-400" : "text-zinc-500"}`}
    >
      <Check size={13} strokeWidth={3} />
      {state !== "sent" && <Check size={13} strokeWidth={3} className="-ml-[7px]" />}
    </span>
  );
}

function UserAvatar({
  // Defaults to OFF. It used to default to true and every call site relied on
  // that, so the green "online" dot appeared on everyone permanently — it
  // carried no information at all. Callers now pass real presence.
  user, size = "md", online = false,
}: {
  user?: any; size?: "sm" | "md" | "lg" | "xl"; online?: boolean;
}) {
  const apiAvatar = getAvatarUrl(user?.avatar);
  const fallbackAvatar = getFallbackAvatar(user);
  const [src, setSrc] = useState(apiAvatar || fallbackAvatar);

  useEffect(() => { setSrc(apiAvatar || fallbackAvatar); }, [apiAvatar, fallbackAvatar]);

  const sizeClass =
    size === "sm" ? "w-8 h-8"
    : size === "lg" ? "w-12 h-12"
    : size === "xl" ? "w-24 h-24"
    : "w-11 h-11";

  return (
    <div className={`relative ${sizeClass} shrink-0 overflow-visible rounded-full`}>
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#222]">
        <img src={src} alt={user?.name || "User"} className="h-full w-full object-cover" onError={() => setSrc(fallbackAvatar)} />
      </div>
      {online && (
        <span className="absolute bottom-[1px] right-[-1px] h-[11px] w-[11px] rounded-full border-[2px] border-[#151517] bg-[#19E66C] shadow-[0_0_0_1px_rgba(25,230,108,0.25)]" />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SendButton
// ─────────────────────────────────────────────
function SendButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  const [iconFailed, setIconFailed] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl disabled:cursor-not-allowed disabled:opacity-50"
      style={{ background: GRADIENT }}
    >
      {!iconFailed && (
        <img src="/icons/Container.svg" alt="" className="h-[22px] w-[22px] object-contain" onError={() => setIconFailed(true)} />
      )}
      {iconFailed && <FiSend className="text-[20px] text-white" />}
    </button>
  );
}

// ─────────────────────────────────────────────
// HireAcceptedCard
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// HireAcceptedCard — COMPLETE FIXED VERSION
// ─────────────────────────────────────────────
function HireAcceptedCard({
  data,
  isMine,
  token,
}: {
  data: any;
  isMine?: boolean;
  token?: string;
}) {
 const GREEN_GRADIENT = "#156015";
const CARD_BG = "#161A18";


  const [payState, setPayState] = useState<"idle" | "loading" | "paid">("idle");
  const [declined, setDeclined] = useState(false);

  if (declined) return null;

  // ✅ FIXED: dealId extraction — handles string, object, or nested _id
  const rawId = data?.hireDealId || data?.dealId || data?._id;
  const dealId =
    rawId && typeof rawId === "object" && rawId._id
      ? String(rawId._id)
      : rawId
      ? String(rawId)
      : null;

  const handlePayNow = async () => {
    if (!token) {
      alert("Login required. Please login again.");
      return;
    }
    if (!dealId) {
      console.error("HireAcceptedCard: dealId missing. data =", data);
      alert("Deal ID not found. Please refresh the page and try again.");
      return;
    }

    setPayState("loading");

    try {
      // Step 1: Create Razorpay order
      const orderRes = await fetch(
        `${API_BASE}/api/hire/${dealId}/create-payment-order`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        if (orderData.error === "NDA_NOT_SIGNED") {
          toast({
            title: "Sign the NDA first",
            description: orderData.message || "Both parties must sign the NDA before payment can be made.",
            variant: "destructive",
          });
          setPayState("idle");
          return;
        }
        throw new Error(orderData.error || "Failed to create payment order");
      }

      const { key, order } = orderData;

      // Step 2: Open Razorpay checkout
      const rzp = new (window as any).Razorpay({
        key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Tokun",
        description: `Payment for: ${data?.title || "Project"}`,
        order_id: order.id,
        theme: { color: "#19E66C" },

        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(
              `${API_BASE}/api/hire/${dealId}/verify-payment`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            setPayState("paid");
          } catch (err: any) {
            console.error("Verify error:", err);
            alert(err.message || "Payment verification failed");
            setPayState("idle");
          }
        },

        modal: {
          ondismiss: () => setPayState("idle"),
        },
      });

      rzp.open();
    } catch (err: any) {
      console.error("Pay error:", err);
      alert(err.message || "Payment failed");
      setPayState("idle");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 505,
        borderRadius: 24,
        background: CARD_BG,
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(25,230,108,0.15)",
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          height: 50,
          background: GREEN_GRADIENT,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            ✓
          </span>
          <span
            style={{
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: "2.4px",
              color: "#FFFFFF",
            }}
          >
            PROPOSAL ACCEPTED
          </span>
        </div>

        <span
          style={{
            height: 24,
            padding: "0 14px",
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            background:
              payState === "paid"
                ? "rgba(255,255,255,0.30)"
                : "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.30)",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: "1px",
          }}
        >
          {payState === "paid" ? "PAID" : "ACCEPTED"}
        </span>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "20px 24px 24px", boxSizing: "border-box" }}>
        {/* Title */}
        <h3
          style={{
            margin: "0 0 6px",
            fontWeight: 600,
            fontSize: 18,
            lineHeight: "26px",
            color: "#FFFFFF",
          }}
        >
          {data?.title || "Project Proposal"}
        </h3>

        {/* Message */}
        <p
          style={{
            margin: "0 0 22px",
            fontWeight: 400,
            fontSize: 13,
            lineHeight: "18px",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          {data?.message ||
            "Proposal has been accepted. Payment required to start work."}
        </p>

        {/* Budget + Date */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 22,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: "1 1 120px",
              borderRadius: 14,
              background: "#0F2018",
              border: "1px solid rgba(25,230,108,0.18)",
              padding: "10px 16px 12px",
              boxSizing: "border-box",
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 9,
                letterSpacing: "1.6px",
                color: "rgba(25,230,108,0.55)",
              }}
            >
              TOTAL BUDGET
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontWeight: 700,
                fontSize: 20,
                lineHeight: "1.2",
                color: "#FFFFFF",
              }}
            >
              ₹{Number(data?.budget || data?.amount || 0).toLocaleString("en-IN")}.00
            </p>
          </div>

          <div
            style={{
              flex: "1 1 120px",
              borderRadius: 14,
              background: "#0F2018",
              border: "1px solid rgba(25,230,108,0.18)",
              padding: "10px 16px 12px",
              boxSizing: "border-box",
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 9,
                letterSpacing: "1.6px",
                color: "rgba(25,230,108,0.55)",
              }}
            >
              TARGET DATE
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontWeight: 700,
                fontSize: 20,
                lineHeight: "1.2",
                color: "#FFFFFF",
              }}
            >
              {formatProposalDate(data?.targetDate)}
            </p>
          </div>
        </div>

        {/* Escrow info */}
        <div
          style={{
            borderRadius: 12,
          background: "rgba(74,222,128,0.04)",
border: "1px solid rgba(74,222,128,0.10)",

            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>💡</span>
          <p
            style={{
              margin: 0,
              fontWeight: 400,
              fontSize: 12,
              lineHeight: "18px",
              color: "rgba(255,255,255,0.65)",
            }}
          >
            Funds will be securely held by{" "}
            <strong style={{ color: "#156015" }}>Tokun Escrow</strong> until
            work is completed and approved.
          </p>
        </div>

        {/* ── Client ko dikhao (isMine = false) ── */}
        {!isMine && (
          <>
            {payState === "paid" ? (
              <div
                style={{
                  height: 48,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "rgba(25,230,108,0.1)",
                  border: "1px solid rgba(25,230,108,0.25)",
                  color: "#19E66C",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                ✓ Payment Successful — Work can begin!
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {/* Pay Now */}
                <button
                  onClick={handlePayNow}
                  disabled={payState === "loading"}
                  style={{
                    flex: "1 1 150px",
                    height: 48,
                    border: "none",
                    borderRadius: 8,
                    background:
                      payState === "loading"
                        ? "rgba(25,230,108,0.5)"
                        : GREEN_GRADIENT,
                    color: "#FFFFFF",
                    cursor: payState === "loading" ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {payState === "loading" ? (
                    "Opening..."
                  ) : (
                    <>
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.25)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                        }}
                      >
                        ₹
                      </span>
                      Pay Now — ₹{Number(data?.budget || data?.amount || 0).toLocaleString("en-IN")}
                    </>
                  )}
                </button>
              {/* Escrow info div ke baad */}

                {/* Decline */}
                <button
                  onClick={() => setDeclined(true)}
                  style={{
                    flex: "1 1 120px",
                    height: 48,
                    borderRadius: 8,
                    background: "#202020",
                    border: "1px solid rgba(25,230,108,0.22)",
                    color: "rgba(255,255,255,0.75)",
                    cursor: "pointer",
                    fontWeight: 400,
                    fontSize: 14,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "20%",
                      bottom: "20%",
                      width: 3,
                      borderRadius: 999,
                      background: "linear-gradient(to bottom, #19E66C, #0BA84A)",
                      opacity: 0.7,
                    }}
                  />
                  Decline
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Freelancer ko sirf status dikhao ── */}
     {/* ── Freelancer ko sirf status dikhao ── */}
        {isMine && (
          <div
            style={{
              height: 48,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(25,230,108,0.06)",
              border: "1px solid rgba(25,230,108,0.15)",
              color: "rgba(25,230,108,0.8)",
              fontWeight: 500,
              fontSize: 13,
              gap: 8,
            }}
          >
            ⏳ Waiting for client payment...
          </div>
        )}

        {/* ── NDA — accept hote hi DONO (client + freelancer) ko dikhega ── */}
        {dealId && (
          <NdaButton
            dealId={dealId}
            token={token}
            apiBase={API_BASE}
            fallback={data}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ServiceOrderCard — Book Now chat card (fixed-price service booking)
// ─────────────────────────────────────────────
function ServiceOrderCard({
  data,
  isMine,
  token,
}: {
  data: any;
  isMine?: boolean;
  token?: string;
}) {
  const ACCENT = "#1A73E8";
  const CARD_BG = "#151A20";

  const [payState, setPayState] = useState<"idle" | "loading" | "paid">("idle");

  const rawId = data?.serviceOrderId || data?.orderId || data?._id;
  const orderId =
    rawId && typeof rawId === "object" && rawId._id ? String(rawId._id) : rawId ? String(rawId) : null;

  const handlePayNow = async () => {
    if (!token) {
      alert("Login required. Please login again.");
      return;
    }
    if (!orderId) {
      console.error("ServiceOrderCard: orderId missing. data =", data);
      alert("Order ID not found. Please refresh the page and try again.");
      return;
    }

    setPayState("loading");

    try {
      const orderRes = await fetch(`${API_BASE}/api/services/orders/${orderId}/create-payment-order`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        if (orderData.error === "NDA_NOT_SIGNED") {
          toast({
            title: "Sign the NDA first",
            description: orderData.message || "Both parties must sign the NDA before payment can be made.",
            variant: "destructive",
          });
          setPayState("idle");
          return;
        }
        throw new Error(orderData.error || "Failed to create payment order");
      }

      const { key, order } = orderData;

      const rzp = new (window as any).Razorpay({
        key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Tokun",
        description: `Booking: ${data?.title || data?.serviceTitle || "Service"}`,
        order_id: order.id,
        theme: { color: ACCENT },

        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`${API_BASE}/api/services/orders/${orderId}/verify-payment`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            setPayState("paid");
          } catch (err: any) {
            console.error("Verify error:", err);
            alert(err.message || "Payment verification failed");
            setPayState("idle");
          }
        },

        modal: {
          ondismiss: () => setPayState("idle"),
        },
      });

      rzp.open();
    } catch (err: any) {
      console.error("Pay error:", err);
      alert(err.message || "Payment failed");
      setPayState("idle");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 505,
        borderRadius: 24,
        background: CARD_BG,
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
        boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(26,115,232,0.15)",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          height: 50,
          background: ACCENT,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            🛒
          </span>
          <span style={{ fontWeight: 600, fontSize: 11, letterSpacing: "2.4px", color: "#FFFFFF" }}>
            SERVICE BOOKING
          </span>
        </div>

        <span
          style={{
            height: 24,
            padding: "0 14px",
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            background: payState === "paid" ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.30)",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: "1px",
          }}
        >
          {payState === "paid" ? "PAID" : "PENDING PAYMENT"}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px 24px", boxSizing: "border-box" }}>
        <h3 style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 18, lineHeight: "26px", color: "#FFFFFF" }}>
          {data?.title || data?.serviceTitle || "Service Booking"}
        </h3>

        <p style={{ margin: "0 0 22px", fontWeight: 400, fontSize: 13, lineHeight: "18px", color: "rgba(255,255,255,0.55)" }}>
          {data?.message || "Booking request sent. Complete payment to confirm."}
        </p>

        <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
          <div
            style={{
              flex: "1 1 120px",
              borderRadius: 14,
              background: "#0F1A26",
              border: "1px solid rgba(26,115,232,0.18)",
              padding: "10px 16px 12px",
              boxSizing: "border-box",
            }}
          >
            <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(26,115,232,0.65)" }}>
              TOTAL
            </p>
            <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 20, lineHeight: "1.2", color: "#FFFFFF" }}>
              ₹{Number(data?.amount || data?.basePrice || 0).toLocaleString("en-IN")}
            </p>
          </div>

          {data?.note && (
            <div
              style={{
                flex: "1 1 160px",
                borderRadius: 14,
                background: "#0F1A26",
                border: "1px solid rgba(26,115,232,0.18)",
                padding: "10px 16px 12px",
                boxSizing: "border-box",
              }}
            >
              <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(26,115,232,0.65)" }}>
                PREFERENCE
              </p>
              <p style={{ margin: "4px 0 0", fontWeight: 600, fontSize: 13, lineHeight: "1.3", color: "#FFFFFF" }}>
                {data.note}
              </p>
            </div>
          )}
        </div>

        <div
          style={{
            borderRadius: 12,
            background: "rgba(26,115,232,0.04)",
            border: "1px solid rgba(26,115,232,0.10)",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>💳</span>
          <p style={{ margin: 0, fontWeight: 400, fontSize: 12, lineHeight: "18px", color: "rgba(255,255,255,0.65)" }}>
            Funds will be securely held by <strong style={{ color: "#1A73E8" }}>Tokun Escrow</strong> until work is completed and approved.
          </p>
        </div>

        {orderId && (
          <NdaButton
            dealId={orderId}
            token={token}
            apiBase={API_BASE}
            fallback={data}
            resource="service"
          />
        )}

        {/* Buyer (sent the card) pays; seller just sees status */}
        {isMine ? (
          payState === "paid" ? (
            <div
              style={{
                height: 48,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "rgba(26,115,232,0.1)",
                border: "1px solid rgba(26,115,232,0.25)",
                color: "#1A73E8",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              ✓ Payment Successful — Booking confirmed!
            </div>
          ) : (
            <button
              onClick={handlePayNow}
              disabled={payState === "loading"}
              style={{
                width: "100%",
                height: 48,
                border: "none",
                borderRadius: 8,
                background: payState === "loading" ? "rgba(26,115,232,0.5)" : ACCENT,
                color: "#FFFFFF",
                cursor: payState === "loading" ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {payState === "loading" ? (
                "Opening..."
              ) : (
                <>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.25)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                    }}
                  >
                    ₹
                  </span>
                  Pay Now — ₹{Number(data?.amount || data?.basePrice || 0).toLocaleString("en-IN")}
                </>
              )}
            </button>
          )
        ) : (
          <div
            style={{
              height: 48,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(26,115,232,0.06)",
              border: "1px solid rgba(26,115,232,0.15)",
              color: "rgba(26,115,232,0.8)",
              fontWeight: 500,
              fontSize: 13,
              gap: 8,
            }}
          >
            {payState === "paid" ? "✓ Payment received" : "⏳ Waiting for client payment..."}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ServiceWorkSubmittedCard — forked from WorkSubmittedCard, points at
// /api/services/orders/... instead of /api/hire/...
// ─────────────────────────────────────────────
function ServiceWorkSubmittedCard({
  data,
  isMine,
  token,
}: {
  data: any;
  isMine?: boolean;
  token?: string;
}) {
  const [actionState, setActionState] = useState<"idle" | "approving" | "revising" | "done">("idle");
  const [result, setResult] = useState<"approved" | "revision" | null>(null);
  const [revisionOpen, setRevisionOpen] = useState(false);

  const orderId = data?.serviceOrderId || data?.orderId;

  useEffect(() => {
    if (!orderId || !token) return;
    fetch(`${API_BASE}/api/services/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d?.success || !d?.order) return;
        const order = d.order;
        if (order.status === "COMPLETED" && ["RELEASED_TO_SELLER", "AUTO_RELEASED"].includes(order.fundsStatus)) {
          setResult("approved");
          setActionState("done");
        } else if (order.status === "REVISION_REQUESTED") {
          setResult("revision");
          setActionState("done");
        }
      })
      .catch(() => {});
  }, [orderId, token]);

  const isApproved = actionState === "done" && result === "approved";

  const handleApprove = async () => {
    if (!token) {
      alert("Please login again.");
      return;
    }
    if (!orderId) {
      alert("Order ID missing. Please refresh and try again.");
      return;
    }
    setActionState("approving");
    try {
      const res = await fetch(`${API_BASE}/api/services/orders/${orderId}/approve-work`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d?.success) throw new Error(d?.error || "Approval failed");
      setResult("approved");
      setActionState("done");
    } catch (err: any) {
      alert(err?.message || "Could not approve. Please try again.");
      setActionState("idle");
    }
  };

  const handleRevisionSubmit = async (reason: string) => {
    if (!token || !orderId) return;
    setActionState("revising");
    try {
      const res = await fetch(`${API_BASE}/api/services/orders/${orderId}/request-revision`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "Revision requested" }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d?.success) throw new Error(d?.error || "Revision request failed");
      setRevisionOpen(false);
      setResult("revision");
      setActionState("done");
    } catch (err: any) {
      alert(err?.message || "Revision request failed");
      setActionState("idle");
    }
  };

  const handleDownload = async (e: React.MouseEvent, fileUrl: string, fileName: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(fileUrl, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "work-file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(fileUrl, "_blank");
    }
  };

  const handlePreview = (e: React.MouseEvent, fileUrl: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const ACCENT = "#1A73E8";

  return (
    <>
      <div
        style={{
          width: "100%",
          maxWidth: 505,
          borderRadius: 24,
          background: "#151A20",
          overflow: "hidden",
          fontFamily: "Inter, sans-serif",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(26,115,232,0.15)",
        }}
      >
        {/* Top bar */}
        <div style={{ height: 50, background: ACCENT, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>
              📦
            </span>
            <span style={{ fontWeight: 600, fontSize: 11, letterSpacing: "2.4px", color: "#FFFFFF" }}>WORK SUBMITTED</span>
          </div>
          <span style={{ height: 24, padding: "0 14px", borderRadius: 999, display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)", color: "#FFFFFF", fontWeight: 700, fontSize: 10 }}>
            {result === "approved" ? "APPROVED" : result === "revision" ? "REVISION" : "REVIEW"}
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px 24px", boxSizing: "border-box" }}>
          <h3 style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 18, color: "#FFFFFF" }}>{data?.title || "Service Booking"}</h3>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: "18px" }}>
            {data?.message || "Work has been submitted for review."}
          </p>

          {data?.deliverables?.length > 0 && (
            <div style={{ borderRadius: 14, background: "rgba(26,115,232,0.06)", border: "1px solid rgba(26,115,232,0.15)", padding: "14px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>📁</span>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "1.6px", color: "rgba(26,115,232,0.85)" }}>DELIVERED FILES</p>
                {!isApproved && !isMine && (
                  <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, letterSpacing: "0.8px", color: "rgba(250,188,78,0.9)", background: "rgba(250,188,78,0.12)", border: "1px solid rgba(250,188,78,0.25)", borderRadius: 999, padding: "3px 8px" }}>
                    🔒 APPROVE TO DOWNLOAD
                  </span>
                )}
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {data.deliverables.map((d: any, i: number) => {
                  const fileUrl = d.url?.startsWith("http") ? d.url : `${API_BASE}${d.url}`;
                  const fileName = d.name || d.description || `file-${i + 1}`;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: 10, background: "rgba(0,0,0,0.22)", border: "1px solid rgba(255,255,255,0.08)", padding: "10px 12px", color: "#FFFFFF" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: 15 }}>📎</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13, color: "#D6E7FB" }}>{fileName}</span>
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.38)" }}>
                          {d.size ? (d.size < 1024 * 1024 ? `${(d.size / 1024).toFixed(1)} KB` : `${(d.size / 1024 / 1024).toFixed(2)} MB`) : ""}
                        </span>
                        <button onClick={(e) => handlePreview(e, fileUrl)} title="Preview file" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(26,115,232,0.22)", color: "#63A6F2", fontSize: 13, cursor: "pointer", background: "none" }}>
                          👁
                        </button>
                        {isApproved || isMine ? (
                          <button onClick={(e) => handleDownload(e, fileUrl, fileName)} title="Download file" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, background: "rgba(25,230,108,0.10)", border: "1px solid rgba(25,230,108,0.22)", color: "#19E66C", fontSize: 16, cursor: "pointer", fontWeight: 700 }}>
                            ↓
                          </button>
                        ) : (
                          <div title="Download unlocks after you approve and release payment" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.22)", fontSize: 13, cursor: "not-allowed" }}>
                            🔒
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {data?.note && (
                <div style={{ marginTop: 12, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "10px 12px", fontSize: 12, lineHeight: "18px", color: "rgba(255,255,255,0.65)", whiteSpace: "pre-line" }}>
                  {data.note}
                </div>
              )}

              {!isMine && !isApproved && (
                <div style={{ marginTop: 10, borderRadius: 8, background: "rgba(26,115,232,0.08)", border: "1px solid rgba(26,115,232,0.15)", padding: "8px 12px", fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: "17px" }}>
                  ⏱ Payment auto-releases to the creator in <strong style={{ color: "rgba(255,255,255,0.65)" }}>72 hours</strong> if no action is taken. Preview files, then approve or request revision.
                </div>
              )}
            </div>
          )}

          {/* Buyer action buttons */}
          {!isMine && actionState !== "done" && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={handleApprove}
                disabled={actionState !== "idle"}
                style={{ flex: "1 1 150px", height: 48, border: "none", borderRadius: 8, background: "linear-gradient(90deg, #19E66C 0%, #0BA84A 100%)", color: "#fff", cursor: actionState !== "idle" ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 14, opacity: actionState !== "idle" ? 0.6 : 1 }}
              >
                {actionState === "approving" ? "Releasing Payment..." : "✓ Approve & Release Payment"}
              </button>

              <button
                onClick={() => setRevisionOpen(true)}
                disabled={actionState !== "idle"}
                style={{ flex: "1 1 130px", height: 48, borderRadius: 8, background: "#202020", border: "1px solid rgba(26,115,232,0.22)", color: "rgba(255,255,255,0.75)", cursor: actionState !== "idle" ? "not-allowed" : "pointer", fontWeight: 400, fontSize: 14, opacity: actionState !== "idle" ? 0.6 : 1 }}
              >
                ↺ Request Revision
              </button>
            </div>
          )}

          {actionState === "done" && result === "approved" && (
            <div style={{ height: 48, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(25,230,108,0.1)", border: "1px solid rgba(25,230,108,0.25)", color: "#19E66C", fontWeight: 600, fontSize: 14 }}>
              ✓ Payment Released — Files unlocked for download
            </div>
          )}

          {actionState === "done" && result === "revision" && (
            <div style={{ height: 48, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(250,188,78,0.1)", border: "1px solid rgba(250,188,78,0.25)", color: "#FABC4E", fontWeight: 600, fontSize: 14 }}>
              ↺ Revision requested — Creator will resubmit
            </div>
          )}

          {isMine && (
            <div style={{ height: 48, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(26,115,232,0.06)", border: "1px solid rgba(26,115,232,0.15)", color: "rgba(26,115,232,0.8)", fontWeight: 500, fontSize: 13 }}>
              ⏳ Waiting for client review — Payment auto-releases in 72 hours
            </div>
          )}
        </div>
      </div>

      <RevisionReasonPopup
        open={revisionOpen}
        loading={actionState === "revising"}
        onClose={() => {
          if (actionState !== "revising") setRevisionOpen(false);
        }}
        onSubmit={handleRevisionSubmit}
      />
    </>
  );
}

// ─────────────────────────────────────────────
// CounterOfferPopup
// ─────────────────────────────────────────────
function CounterOfferPopup({
  data, onClose, onSubmit,
}: {
  data: any; onClose: () => void; onSubmit: (payload: CounterPayload) => void;
}) {
  const [newBudget, setNewBudget] = useState("");
  const [newTargetDate, setNewTargetDate] = useState("");
  const [explanation, setExplanation] = useState("");
  const [showCounterCalendar, setShowCounterCalendar] = useState(false);
  const [counterCalendarMonth, setCounterCalendarMonth] = useState(() => {
    const today = new Date(); today.setDate(1); today.setHours(0, 0, 0, 0); return today;
  });

  const inputBg = "#18181B80";
  const inputBorder = "1px solid #FFFFFF1A";

  const handleSubmit = () => {
    if (!newBudget.trim() || !newTargetDate.trim()) return;
    onSubmit({
      originalBudget: Number(data?.budget || 0),
      originalTargetDate: data?.targetDate || "",
      newBudget, newTargetDate, explanation,
    });
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/55 px-4 backdrop-blur-[8px]" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560, maxWidth: "calc(100vw - 32px)", maxHeight: "calc(100vh - 80px)",
          overflowY: "auto", borderRadius: 26, background: "#212121",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          padding: "32px", boxSizing: "border-box", color: "#FFFFFF",
          fontFamily: "Inter, sans-serif", boxShadow: "0 40px 120px rgba(0,0,0,0.65)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="/icons/counter.svg" alt="" style={{ width: 24, height: 24, objectFit: "contain", flexShrink: 0 }} />
          <h2 style={{ margin: 0, fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 28, lineHeight: "36px", color: "#FFFFFF" }}>
            Counter Offer
          </h2>
        </div>

        <div style={{ width: "100%", borderRadius: 24, border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.015)", padding: "22px", marginTop: 24, boxSizing: "border-box" }}>
          <p style={{ margin: "0 0 16px", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 12, lineHeight: "12px", letterSpacing: "1.2px", color: "#C084FC", textTransform: "uppercase" }}>
            Original Proposal Summary
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 120px", height: 60, borderRadius: 14, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px", boxSizing: "border-box" }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TOTAL BUDGET</p>
              <p style={{ margin: "7px 0 0", fontWeight: 700, fontSize: 20, color: "#FFFFFF" }}>₹{Number(data?.budget || 0).toLocaleString("en-IN")}.00</p>
            </div>
            <div style={{ flex: "1 1 120px", height: 60, borderRadius: 14, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px", boxSizing: "border-box" }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TARGET DATE</p>
              <p style={{ margin: "7px 0 0", fontWeight: 700, fontSize: 20, color: "#FFFFFF" }}>{formatProposalDate(data?.targetDate)}</p>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 24 }}>
          <div>
            <label style={{ display: "block", marginBottom: 12, fontWeight: 600, fontSize: 12, color: "#A1A1AA" }}>New Budget</label>
            <div style={{ height: 56, borderRadius: 16, border: inputBorder, background: inputBg, display: "flex", alignItems: "center", padding: "0 20px", boxSizing: "border-box" }}>
              <span style={{ color: "#B985FF", fontSize: 22, fontWeight: 700, marginRight: 10 }}>₹</span>
              <input
                value={newBudget} onChange={(e) => setNewBudget(e.target.value)} placeholder="0.00" type="number"
                className="counter-offer-number-input"
                style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: newBudget ? "#FFFFFF" : "#27272A", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 22 }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 12, fontWeight: 600, fontSize: 12, color: "#A1A1AA" }}>New Target Date</label>
            <div className="relative">
              <button
                type="button" onClick={() => setShowCounterCalendar((prev) => !prev)}
                style={{ width: "100%", height: 56, borderRadius: 16, border: inputBorder, background: inputBg, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", boxSizing: "border-box", cursor: "pointer" }}
              >
                <span style={{ fontWeight: 700, fontSize: 18, color: newTargetDate ? "#FFFFFF" : "#27272A" }}>{formatCounterDateDisplay(newTargetDate)}</span>
                <img src="/icons/cale.svg" alt="calendar" style={{ width: 18, height: 18, objectFit: "contain", filter: "brightness(0) invert(1)" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </button>
              {showCounterCalendar && (() => {
                const today = new Date(); today.setHours(0, 0, 0, 0);
                const year = counterCalendarMonth.getFullYear();
                const month = counterCalendarMonth.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const totalDays = new Date(year, month + 1, 0).getDate();
                const prevMonth = () => setCounterCalendarMonth((prev) => { const next = new Date(prev); next.setMonth(next.getMonth() - 1); return next; });
                const nextMonth = () => setCounterCalendarMonth((prev) => { const next = new Date(prev); next.setMonth(next.getMonth() + 1); return next; });
                return (
                  <div className="absolute right-0 z-[1000000] rounded-xl bg-[#101114] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.75)] p-3" style={{ top: "64px", width: 230 }}>
                    <div className="flex items-center justify-between mb-2">
                      <button type="button" onClick={prevMonth} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs">‹</button>
                      <p className="text-xs font-semibold text-white">{getMonthLabel(counterCalendarMonth)}</p>
                      <button type="button" onClick={nextMonth} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs">›</button>
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
                      {["S","M","T","W","T","F","S"].map((day, index) => <span key={`${day}-${index}`} className="text-[9px] text-white/40">{day}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 text-center">
                      {[...Array(firstDay)].map((_, i) => <span key={`empty-${i}`} />)}
                      {[...Array(totalDays)].map((_, i) => {
                        const day = i + 1;
                        const currentDate = new Date(year, month, day); currentDate.setHours(0, 0, 0, 0);
                        const value = toDateValue(currentDate);
                        const active = newTargetDate === value;
                        const disabled = currentDate < today;
                        return (
                          <button key={day} type="button" disabled={disabled} onClick={() => { setNewTargetDate(value); setShowCounterCalendar(false); }}
                            className={`h-6 rounded-full text-[10px] transition ${disabled ? "text-white/20 cursor-not-allowed" : active ? "text-white" : "text-white/70 hover:bg-white/10"}`}
                            style={active && !disabled ? { background: GRADIENT } : {}}
                          >{day}</button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 26 }}>
          <label style={{ display: "block", marginBottom: 12, fontWeight: 600, fontSize: 12, color: "#A1A1AA" }}>Explanation To Client</label>
          <textarea
            className="counter-offer-textarea" value={explanation} onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explain the reasoning behind your proposed changes..."
            style={{ width: "100%", height: 110, borderRadius: 16, border: inputBorder, background: inputBg, padding: "18px 20px", boxSizing: "border-box", resize: "none", outline: "none", color: "#FFFFFF", fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 16, lineHeight: "24px" }}
          />
        </div>

        <p style={{ margin: "8px 0 22px", fontFamily: "Inter, sans-serif", fontWeight: 400, fontStyle: "italic", fontSize: 11, lineHeight: "16.5px", color: "#71717A" }}>
          This message will be attached to your updated proposal notification.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <button onClick={handleSubmit} disabled={!newBudget.trim() || !newTargetDate.trim()}
            style={{ flex: "1 1 160px", maxWidth: 220, height: 50, borderRadius: 8, border: "none", background: GRADIENT, color: "#FFFFFF", cursor: !newBudget.trim() || !newTargetDate.trim() ? "not-allowed" : "pointer", opacity: !newBudget.trim() || !newTargetDate.trim() ? 0.5 : 1, fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 16 }}>
            Send Counter Offer
          </button>
          <button onClick={onClose}
            style={{ flex: "1 1 140px", maxWidth: 200, height: 50, borderRadius: 8, background: "#242424", border: "1px solid rgba(255,255,255,0.08)", color: "#FFFFFF", cursor: "pointer", fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 16 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HireCard
// ─────────────────────────────────────────────
function HireCard({
  data, conversationId, senderId, token,
}: {
  data: any; conversationId?: string; senderId?: string; token?: string;
}) {
  const TOP_GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";
  const [status, setStatus] = useState<"PENDING" | "ACCEPTED" | "COUNTERED">(data?.status || "PENDING");
  const [showCounterPopup, setShowCounterPopup] = useState(false);
  const [showProposalPopup, setShowProposalPopup] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const dealId = data?.hireDealId || data?.dealId || data?._id;
 
  // ── On mount, check real deal status from API ──
  useEffect(() => {
    if (!dealId || !token) return;
    fetch(`${API_BASE}/api/hire/${dealId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d?.success || !d?.deal) return;
        const s = d.deal.status;
        if (
          s === "ACCEPTED_WAITING_PAYMENT" ||
          s === "FUNDED" ||
          s === "IN_PROGRESS" ||
          s === "WORK_SUBMITTED" ||
          s === "COMPLETED"
        ) {
          setStatus("ACCEPTED");
        }
      })
      .catch(() => {});
  }, [dealId, token]);
 
  const handleAcceptProposal = async () => {
    try {
      if (acceptLoading || status === "ACCEPTED") return;
      if (!token) { alert("Login required. Please login again."); return; }
      if (!dealId) { alert("Hire deal id missing."); return; }
      setAcceptLoading(true);
      const res = await fetch(`${API_BASE}/api/hire/${dealId}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result?.success) throw new Error(result?.error || "Failed to accept proposal");
      setStatus("ACCEPTED");
      setShowProposalPopup(false);
    } catch (err: any) {
      alert(err?.message || "Failed to accept proposal");
    } finally {
      setAcceptLoading(false);
    }
  };
 
  const isAccepted = status === "ACCEPTED";
 
  return (
    <>
      <div
        onClick={() => setShowProposalPopup(true)}
        style={{ width: "100%", maxWidth: 505, borderRadius: 24, background: "#292929", overflow: "hidden", fontFamily: "Inter, sans-serif", boxShadow: "0 20px 60px rgba(0,0,0,0.35)", cursor: "pointer" }}
      >
        <div style={{ height: 50, background: TOP_GRADIENT, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/icons/proposal.svg" alt="" style={{ width: 16, height: 16, objectFit: "contain", flexShrink: 0 }} />
            <span style={{ fontWeight: 600, fontSize: 11, letterSpacing: "2.4px", color: "#FFFFFF" }}>PROJECT PROPOSAL</span>
          </div>
          <span style={{
            height: 24, padding: "0 14px", borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: isAccepted ? "rgba(25,230,108,0.18)" : "#FABC4E1A",
            border: isAccepted ? "1px solid rgba(25,230,108,0.35)" : "1px solid #FABC4E33",
            color: isAccepted ? "#19E66C" : "#FABC4E",
            fontWeight: 700, fontSize: 10,
          }}>
            {isAccepted ? "ACCEPTED" : status}
          </span>
        </div>
 
        <div style={{ background: "#292929", padding: "20px 24px 24px", boxSizing: "border-box" }}>
          <h3 style={{ margin: 0, fontWeight: 400, fontSize: 20, lineHeight: "28px", color: "#FFFFFF" }}>
            {data?.title || data?.projectTitle || "Project Proposal"}
          </h3>
          <p style={{ margin: "6px 0 24px", fontWeight: 400, fontSize: 13, lineHeight: "16px", color: "rgba(255,255,255,0.55)" }}>
            {data?.description || data?.projectDetails || "Project details will appear here."}
          </p>
 
          <div style={{ display: "flex", gap: 16, marginBottom: isAccepted ? 0 : 32, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 120px", borderRadius: 16, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px 12px", boxSizing: "border-box" }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TOTAL BUDGET</p>
              <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 20, lineHeight: "1.2", color: "#FFFFFF" }}>₹{Number(data?.budget || 0).toLocaleString("en-IN")}.00</p>
            </div>
            <div style={{ flex: "1 1 120px", borderRadius: 16, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px 12px", boxSizing: "border-box" }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TARGET DATE</p>
              <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 20, lineHeight: "1.2", color: "#FFFFFF" }}>{formatProposalDate(data?.targetDate)}</p>
            </div>
          </div>
 
          {/* ── Show buttons only if NOT accepted ── */}
          {!isAccepted && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
              <button
                disabled={acceptLoading}
                onClick={(e) => { e.stopPropagation(); handleAcceptProposal(); }}
                style={{ flex: "1 1 140px", height: 48, border: "none", borderRadius: 8, background: TOP_GRADIENT, color: "#FFFFFF", cursor: acceptLoading ? "not-allowed" : "pointer", opacity: acceptLoading ? 0.6 : 1, fontWeight: 400, fontSize: 15 }}
              >
                {acceptLoading ? "Accepting..." : "Accept Proposal"}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowCounterPopup(true); }}
                style={{ flex: "1 1 130px", height: 48, borderRadius: 8, background: "#202020", border: "1px solid #FFFFFF0D", color: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 400, fontSize: 15 }}
              >
                <img src="/icons/counter.svg" alt="" style={{ width: 18, height: 18, objectFit: "contain", flexShrink: 0 }} />
                Counter Offer
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); }}
                style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 8, border: "none", background: TOP_GRADIENT, color: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <img src="/icons/crass.svg" alt="" style={{ width: 14, height: 14, objectFit: "contain" }} />
              </button>
            </div>
          )}
 
          {/* ── Accepted state banner ── */}
          {isAccepted && (
            <div style={{ marginTop: 16, height: 44, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(25,230,108,0.07)", border: "1px solid rgba(25,230,108,0.18)", color: "rgba(25,230,108,0.8)", fontWeight: 600, fontSize: 13 }}>
              ✓ Proposal Accepted — Waiting for payment
            </div>
          )}
        </div>
      </div>
 
      {showProposalPopup && (
        <ProjectProposalDetailsPopup
          data={data}
          status={status}
          acceptLoading={acceptLoading}
          onClose={() => setShowProposalPopup(false)}
          onAccept={handleAcceptProposal}
          onReject={() => setShowProposalPopup(false)}
          onCounter={() => { setShowProposalPopup(false); setShowCounterPopup(true); }}
        />
      )}
 
      {showCounterPopup && (
        <CounterOfferPopup
          data={data}
          onClose={() => setShowCounterPopup(false)}
          onSubmit={(payload) => {
            socket.emit("send-message", {
              conversationId, senderId,
              text: `COUNTER_CARD::${JSON.stringify({ newBudget: payload.newBudget, newTargetDate: payload.newTargetDate, explanation: payload.explanation, originalBudget: payload.originalBudget, originalTargetDate: payload.originalTargetDate, status: "PENDING" })}`,
            });
            setStatus("COUNTERED");
            setShowCounterPopup(false);
          }}
        />
      )}
    </>
  );
}
 


function ProjectProposalDetailsPopup({
  data, status, acceptLoading, onClose, onAccept, onReject, onCounter,
}: {
  data: any; status: string; acceptLoading?: boolean; onClose: () => void;
  onAccept: () => void; onReject: () => void; onCounter: () => void;
}) {
  const proposalTitle = data?.title || data?.projectTitle || "Project Proposal";
  const proposalDescription = data?.description || data?.projectDetails ||
    "The Nexus Dashboard Redesign aims to modernize the current user experience by implementing a high-performance, glassmorphic UI system.";

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/55 px-4 backdrop-blur-[8px]" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: 620, maxWidth: "calc(100vw - 32px)", maxHeight: "calc(100vh - 70px)", overflowY: "auto", borderRadius: 30, background: "#212121", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "34px 28px 24px", boxSizing: "border-box", color: "#FFFFFF", fontFamily: "Inter, sans-serif", boxShadow: "0 40px 120px rgba(0,0,0,0.65)", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", right: 22, top: 18, width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src="/icons/crass.svg" alt="" style={{ width: 18, height: 18, objectFit: "contain", opacity: 0.55 }} />
        </button>
        <h2 style={{ margin: "0 0 24px", paddingRight: 30, fontWeight: 700, fontSize: "clamp(22px, 5vw, 34px)", lineHeight: "42px", color: "#F5EDFF" }}>{proposalTitle}</h2>
        <div style={{ width: "100%", borderRadius: 24, border: "1px solid #FFFFFF1A", background: "#FFFFFF08", padding: "26px 20px", boxSizing: "border-box", marginBottom: 30 }}>
          <p style={{ margin: "0 0 16px", fontWeight: 600, fontSize: 12, letterSpacing: "1.2px", color: "#C084FC", textTransform: "uppercase" }}>PROPOSAL SUMMARY</p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 120px", height: 60, borderRadius: 16, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px", boxSizing: "border-box" }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TOTAL BUDGET</p>
              <p style={{ margin: "7px 0 0", fontWeight: 700, fontSize: 20, color: "#FFFFFF" }}>₹{Number(data?.budget || 0).toLocaleString("en-IN")}.00</p>
            </div>
            <div style={{ flex: "1 1 120px", height: 60, borderRadius: 16, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px", boxSizing: "border-box" }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TARGET DATE</p>
              <p style={{ margin: "7px 0 0", fontWeight: 700, fontSize: 20, color: "#FFFFFF" }}>{formatProposalDate(data?.targetDate)}</p>
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <img src="/icons/proposal.svg" alt="" style={{ width: 18, height: 18, objectFit: "contain", flexShrink: 0 }} />
            <p style={{ margin: 0, fontWeight: 400, fontSize: 16, color: "#C084FC", textTransform: "uppercase" }}>PROJECT OVERVIEW</p>
          </div>
          <p style={{ margin: 0, fontWeight: 400, fontSize: 15, lineHeight: "20px", color: "#C9C2CE", whiteSpace: "pre-line" }}>{proposalDescription}</p>
        </div>
        <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.015)", padding: "18px 16px", boxSizing: "border-box", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ color: "#C084FC", fontSize: 18 }}>◷</span>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 12, letterSpacing: "1.8px", color: "#C084FC", textTransform: "uppercase" }}>EXECUTION TIMELINE</p>
          </div>
          <div style={{ width: "100%", height: 8, borderRadius: 999, background: "rgba(255,255,255,0.12)", overflow: "hidden", marginBottom: 10 }}>
            <div style={{ width: "2%", height: "100%", borderRadius: 999, background: "#C084FC" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, lineHeight: "18px", color: "#D4D4D8" }}>
            <span>Start: Today</span><span>Finish: {formatProposalDate(data?.targetDate)}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 12, color: "#C084FC", textTransform: "uppercase" }}>DELIVERY PREFERENCE</p>
          <div style={{ height: 48, padding: "0 18px", borderRadius: 8, border: "1px solid #FFFFFF0D", background: "#343434", display: "flex", alignItems: "center", gap: 10, color: "#FFFFFF", fontWeight: 400, fontSize: 15 }}>
            <span>↔</span> Complete Project Files
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button onClick={onCounter} style={{ flex: "1 1 140px", height: 49, borderRadius: 8, border: "1px solid #FFFFFF0D", background: "#202020", color: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontWeight: 400, fontSize: 15 }}>
            <img src="/icons/counter.svg" alt="" style={{ width: 18, height: 18, objectFit: "contain", flexShrink: 0 }} />Counter Offer
          </button>
          <button onClick={onAccept} disabled={acceptLoading || status === "ACCEPTED"}
            style={{ flex: "1 1 150px", height: 49, border: "none", borderRadius: 8, background: GRADIENT, color: "#FFFFFF", cursor: acceptLoading || status === "ACCEPTED" ? "not-allowed" : "pointer", opacity: acceptLoading || status === "ACCEPTED" ? 0.6 : 1, fontWeight: 400, fontSize: 15 }}>
            {acceptLoading ? "Accepting..." : status === "ACCEPTED" ? "Accepted" : "Accept Proposal"}
          </button>
          <button onClick={onReject} style={{ flex: "1 1 120px", height: 49, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "#202020", color: "#FFFFFF", cursor: "pointer", fontWeight: 400, fontSize: 15 }}>Reject</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CounterProposalCard
// ─────────────────────────────────────────────
function CounterProposalCard({ data }: { data: any }) {
  const TOP_GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";
  const [status, setStatus] = useState<"PENDING" | "ACCEPTED" | "DECLINED">(data?.status || "PENDING");

  return (
    <div style={{ width: "100%", maxWidth: 505, borderRadius: 24, background: "#292929", overflow: "hidden", fontFamily: "Inter, sans-serif", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}>
      <div style={{ height: 50, background: TOP_GRADIENT, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/icons/proposal.svg" alt="" style={{ width: 16, height: 16, objectFit: "contain", flexShrink: 0 }} />
          <span style={{ fontWeight: 600, fontSize: 11, letterSpacing: "2.4px", color: "#FFFFFF" }}>COUNTER PROPOSAL</span>
        </div>
        <span style={{ height: 24, padding: "0 14px", borderRadius: 999, display: "inline-flex", alignItems: "center", background: "#FABC4E1A", border: "1px solid #FABC4E33", color: "#FABC4E", fontWeight: 700, fontSize: 10 }}>
          {status}
        </span>
      </div>
      <div style={{ background: "#292929", padding: "20px 24px 24px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 120px", borderRadius: 16, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px 12px", boxSizing: "border-box" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TOTAL BUDGET</p>
            <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 20, lineHeight: "1.2", color: "#FFFFFF" }}>₹{Number(data?.newBudget || 0).toLocaleString("en-IN")}.00</p>
          </div>
          <div style={{ flex: "1 1 120px", borderRadius: 16, background: "#343434", border: "1px solid #FFFFFF0D", padding: "10px 16px 12px", boxSizing: "border-box" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 9, letterSpacing: "1.6px", color: "rgba(255,255,255,0.35)" }}>TARGET DATE</p>
            <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 20, lineHeight: "1.2", color: "#FFFFFF" }}>{formatProposalDate(data?.newTargetDate)}</p>
          </div>
        </div>
        {data?.explanation && (
          <div style={{ borderRadius: 16, background: "#18181B80", border: "1px solid #FFFFFF0D", padding: "16px", boxSizing: "border-box", marginBottom: 32 }}>
            <p style={{ margin: 0, fontStyle: "italic", fontSize: 13, lineHeight: "16px", color: "rgba(255,255,255,0.55)", whiteSpace: "pre-line" }}>{data.explanation}</p>
          </div>
        )}
        {status === "PENDING" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => setStatus("ACCEPTED")}
              style={{ flex: "1 1 160px", height: 48, border: "none", borderRadius: 8, background: TOP_GRADIENT, color: "#FFFFFF", cursor: "pointer", fontWeight: 400, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", border: "1.5px solid #FFFFFF", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 600 }}>✓</span>
              Accept Counter Offer
            </button>
            <button onClick={() => setStatus("DECLINED")}
              style={{ flex: "1 1 130px", height: 49, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "#242424", color: "#FFFFFF", cursor: "pointer", fontWeight: 400, fontSize: 15 }}>
              Decline
            </button>
          </div>
        ) : (
          <div style={{ height: 48, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: status === "ACCEPTED" ? "rgba(25,230,108,0.1)" : "rgba(255,80,80,0.1)", border: `1px solid ${status === "ACCEPTED" ? "rgba(25,230,108,0.25)" : "rgba(255,80,80,0.25)"}`, color: status === "ACCEPTED" ? "#19E66C" : "#FF5050", fontWeight: 600, fontSize: 14 }}>
            {status === "ACCEPTED" ? "✓ Counter Offer Accepted" : "✗ Counter Offer Declined"}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Chat Component
// ─────────────────────────────────────────────
export default function Chat() {
  const { token, user } = useAuth() as any;
  const location = useLocation();

  const ringingAudio = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const callTimeoutRef = useRef<any>(null);

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvo, setActiveConvo] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callType, setCallType] = useState<"video" | "audio">("video");
  const [openChatPopup, setOpenChatPopup] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  // Set of userIds the server reports as connected right now. Drives the avatar
  // presence dot, which used to be hardcoded on for everyone.
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  // conversationId -> userId currently typing in it.
  const [typingBy, setTypingBy] = useState<Record<string, string>>({});
  const typingTimers = useRef<Record<string, any>>({});
  // Our own outgoing typing state, so typing:start is emitted once per burst
  // rather than on every keystroke.
  const typingSentRef = useRef(false);
  const typingStopTimer = useRef<any>(null);

  // Message being edited inline, and the draft text for it.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const { joinCall, leaveCall } = useAgoraCall();
  const sharedResources = messages.filter((m) => m.attachment);

  // Who the ticks are about: everyone in this conversation except me. Excluding
  // myself matters — the server puts the sender in `readBy` on send, so counting
  // that would make every message you send instantly show as read.
  const recipientIds = useMemo(() => {
    const others = Array.isArray(activeConvo?.participants)
      ? activeConvo.participants.map((p: any) => String(p?._id || p))
      : activeConvo?.otherUser?._id
        ? [String(activeConvo.otherUser._id)]
        : [];
    return others.filter((id: string) => id && id !== String(user?._id));
  }, [activeConvo, user?._id]);

  useEffect(() => {
    ringingAudio.current = new Audio("/sounds/messenger.mp3");
    ringingAudio.current.loop = true;
  }, []);

  useEffect(() => {
    if (!token) return;
    setLoadingConversations(true);
    fetch(`${API_BASE}/api/chat/conversations`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && Array.isArray(d.conversations)) {
          setConversations(d.conversations);
          const stateConversationId = location.state?.conversationId;
          if (stateConversationId) {
            const found = d.conversations.find((c: any) => c._id === stateConversationId);
            if (found) { setActiveConvo(found); setMobileView("chat"); }
            else if (d.conversations.length > 0) setActiveConvo(d.conversations[0]);
          } else if (d.conversations.length > 0) {
            setActiveConvo(d.conversations[0]);
          }
        }
      })
      .catch((err) => console.error("Load conversations error:", err))
      .finally(() => setLoadingConversations(false));
  }, [token, location.state]);

  useEffect(() => {
    if (!token) return;
    const markAllReadOnOpen = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chat/conversations/read-all`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) throw new Error(data?.error || `read-all failed: ${res.status}`);
        setConversations((prev) => prev.map((c) => ({ ...c, unreadCount: 0 })));
        window.dispatchEvent(new CustomEvent("chat-read"));
      } catch (err) { console.error("Mark all read failed", err); }
    };
    markAllReadOnOpen();
  }, [token]);

  useEffect(() => {
    if (!activeConvo || !token) return;
    setLoadingMessages(true);
    fetch(`${API_BASE}/api/chat/messages/${activeConvo._id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d?.success && Array.isArray(d.messages)) setMessages(d.messages); else setMessages([]); })
      .catch((err) => console.error("Load messages error:", err))
      .finally(() => setLoadingMessages(false));

    socket.emit("join-chat", { conversationId: activeConvo._id });

    const markRead = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chat/conversations/${activeConvo._id}/read`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) throw new Error(data?.error || `read failed: ${res.status}`);
        setConversations((prev) => prev.map((c) => (c._id === activeConvo._id ? { ...c, unreadCount: 0 } : c)));
        window.dispatchEvent(new CustomEvent("chat-read"));
      } catch (err) { console.error("Mark single conversation read failed", err); }
    };
    markRead();
  }, [activeConvo, token]);

  useEffect(() => {
    const handleNewMessage = (msg: any) => {
      if (msg.conversationId === activeConvo?._id) {
        setMessages((prev) => [...prev, msg]);
        // Someone else's message arriving while their thread is open is read
        // immediately — that's what turns their ticks blue without them having
        // to reopen anything.
        if (getMessageSenderId(msg) !== user?._id && user?._id) {
          socket.emit("message:read", { conversationId: msg.conversationId, userId: user._id });
        }
      }
      setConversations((prev) =>
        prev.map((c) => c._id === msg.conversationId ? { ...c, lastMessage: msg.text || c.lastMessage, updatedAt: msg.createdAt || new Date().toISOString() } : c)
      );
    };
    socket.on("new-message", handleNewMessage);
    return () => socket.off("new-message", handleNewMessage);
  }, [activeConvo, user?._id]);

  /* ── Presence ──────────────────────────────────────────────────────────
     Previously every avatar rendered a green dot unconditionally (UserAvatar
     defaulted `online` to true), so "online" meant nothing. This tracks the set
     of genuinely-connected users and the avatars read from it. */
  useEffect(() => {
    const handleUpdate = ({ userId: id, online }: any) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (online) next.add(String(id));
        else next.delete(String(id));
        return next;
      });
    };
    const handleState = ({ online }: any) => {
      setOnlineUsers(new Set((online || []).map(String)));
    };

    socket.on("presence:update", handleUpdate);
    socket.on("presence:state", handleState);
    return () => {
      socket.off("presence:update", handleUpdate);
      socket.off("presence:state", handleState);
    };
  }, []);

  // Ask for the current state whenever the conversation list changes — presence
  // broadcasts only cover transitions, so anyone already online before this
  // client connected would otherwise never show as online.
  useEffect(() => {
    const ids = conversations.map((c: any) => c?.otherUser?._id).filter(Boolean).map(String);
    if (!ids.length) return;
    socket.emit("presence:get", { userIds: ids }, (res: any) => {
      if (res?.online) setOnlineUsers(new Set(res.online.map(String)));
    });
  }, [conversations]);

  /* ── Typing ───────────────────────────────────────────────────────────
     The sidebar used to print "Typing..." for whichever conversation was
     selected, which had nothing to do with typing. This is the real signal. */
  useEffect(() => {
    const handleStart = ({ conversationId, userId: from }: any) => {
      if (String(from) === String(user?._id)) return; // never your own
      setTypingBy((prev) => ({ ...prev, [String(conversationId)]: String(from) }));

      // Safety net: if the stop event is lost (tab closed, flaky network) the
      // indicator would otherwise stay on screen forever.
      if (typingTimers.current[String(conversationId)]) {
        clearTimeout(typingTimers.current[String(conversationId)]);
      }
      typingTimers.current[String(conversationId)] = setTimeout(() => {
        setTypingBy((prev) => {
          const next = { ...prev };
          delete next[String(conversationId)];
          return next;
        });
      }, 5000);
    };

    const handleStop = ({ conversationId }: any) => {
      clearTimeout(typingTimers.current[String(conversationId)]);
      setTypingBy((prev) => {
        const next = { ...prev };
        delete next[String(conversationId)];
        return next;
      });
    };

    socket.on("typing:start", handleStart);
    socket.on("typing:stop", handleStop);
    return () => {
      socket.off("typing:start", handleStart);
      socket.off("typing:stop", handleStop);
    };
  }, [user?._id]);

  /* ── Read receipts / edits / deletes ─────────────────────────────────── */
  useEffect(() => {
    const handleRead = ({ conversationId, userId: readerId }: any) => {
      if (conversationId !== activeConvo?._id) return;
      setMessages((prev) =>
        prev.map((m: any) =>
          (m.readBy || []).map(String).includes(String(readerId))
            ? m
            : { ...m, readBy: [...(m.readBy || []), readerId], deliveredTo: [...(m.deliveredTo || []), readerId] }
        )
      );
    };

    const handleEdited = ({ _id, text, editedAt }: any) => {
      setMessages((prev) => prev.map((m: any) => (m._id === _id ? { ...m, text, editedAt } : m)));
    };

    const handleDeleted = ({ _id, deletedAt }: any) => {
      setMessages((prev) =>
        prev.map((m: any) => (m._id === _id ? { ...m, deleted: true, deletedAt, text: "", attachment: null } : m))
      );
    };

    socket.on("message:read", handleRead);
    socket.on("message:edited", handleEdited);
    socket.on("message:deleted", handleDeleted);
    return () => {
      socket.off("message:read", handleRead);
      socket.off("message:edited", handleEdited);
      socket.off("message:deleted", handleDeleted);
    };
  }, [activeConvo?._id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const handleCallAccepted = async ({ conversationId }: any) => {
      clearTimeout(callTimeoutRef.current);
      await joinCall(conversationId, user?._id, true);
    };
    socket.on("call-accepted", handleCallAccepted);
    return () => socket.off("call-accepted", handleCallAccepted);
  }, [joinCall, user?._id]);

  useEffect(() => {
    const handleIncomingCall = ({ fromUser, conversationId, type }: any) => {
      setIncomingCall({ fromUser, conversationId, type });
      setCallType(type || "video");
      ringingAudio.current?.play().catch(() => {});
      callTimeoutRef.current = setTimeout(() => {
        ringingAudio.current?.pause();
        setIncomingCall(null);
        socket.emit("missed-call", { toUserId: fromUser._id, conversationId });
      }, 30000);
    };
    const handleCallEnded = () => { ringingAudio.current?.pause(); leaveCall(); setIncomingCall(null); };
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-ended", handleCallEnded);
    return () => { socket.off("incoming-call", handleIncomingCall); socket.off("call-ended", handleCallEnded); };
  }, [leaveCall]);

  /* ── Outgoing typing signal ────────────────────────────────────────────
     Emits typing:start once when a burst begins, then typing:stop after a short
     idle gap — not one event per keystroke. */
  const notifyTyping = () => {
    if (!activeConvo || !user?._id) return;

    if (!typingSentRef.current) {
      typingSentRef.current = true;
      socket.emit("typing:start", { conversationId: activeConvo._id, userId: user._id });
    }

    clearTimeout(typingStopTimer.current);
    typingStopTimer.current = setTimeout(() => stopTyping(), 2000);
  };

  const stopTyping = () => {
    clearTimeout(typingStopTimer.current);
    if (!typingSentRef.current || !activeConvo || !user?._id) return;
    typingSentRef.current = false;
    socket.emit("typing:stop", { conversationId: activeConvo._id, userId: user._id });
  };

  // Leaving a conversation (or unmounting) must clear our typing state, or the
  // other side is left looking at "typing…" for a thread we've closed.
  useEffect(() => {
    return () => stopTyping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvo?._id]);

  const sendMessage = () => {
    if (!input.trim() || !activeConvo || !user?._id) return;
    socket.emit("send-message", { conversationId: activeConvo._id, senderId: user._id, text: input });
    stopTyping(); // sending ends the burst; don't wait for the idle timer
    setInput("");
  };

  const submitEdit = () => {
    const clean = editDraft.trim();
    if (!editingId || !clean || !user?._id) return;
    socket.emit("message:edit", { messageId: editingId, userId: user._id, text: clean });
    setEditingId(null);
    setEditDraft("");
  };

  const deleteMessage = (messageId: string) => {
    if (!user?._id) return;
    socket.emit("message:delete", { messageId, userId: user._id });
  };

  const handleAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConvo) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversationId", activeConvo._id);
    const res = await fetch(`${API_BASE}/api/chat/attachment`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
    const data = await res.json();
    if (data?.message) { setMessages((prev) => [...prev, data.message]); socket.emit("new-message", data.message); }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const connectGoogle = () => {
    const w = 500, h = 600;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    window.open(`${API_BASE}/api/auth/google`, "googleAuth", `width=${w},height=${h},left=${left},top=${top}`);
  };

  useEffect(() => {
    const listener = (e: MessageEvent) => { if (e.data?.success) alert("Google connected successfully"); };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);
   
const startMeetCall = () => {
  if (!activeConvo || !user?._id) return;
  
  const roomId = `tokun-${activeConvo._id}`;
  const meetUrl = `https://meet.jit.si/${roomId}`;
  
  // Sirf chat mein link bhejo
  socket.emit("send-message", {
    conversationId: activeConvo._id,
    senderId: user._id,
    text: `📞 Join the call ${meetUrl}`,
  });
  
  // Apna browser bhi open karo
  window.open(meetUrl, "_blank", "noopener,noreferrer");
};

  const renderMessageText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) =>
      part.match(urlRegex)
        ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="break-all text-blue-400 underline hover:text-blue-300">{part}</a>
        : <span key={i}>{part}</span>
    );
  };

  const deleteActiveConversation = async () => {
    if (!activeConvo) return;
    if (!confirm("Delete this chat?")) return;
    await fetch(`${API_BASE}/api/chat/conversation/${activeConvo._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setActiveConvo(null); setMessages([]);
    setConversations((prev) => prev.filter((c) => c._id !== activeConvo._id));
    setMobileView("list");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07080A] text-white">
      <img src="/icons/mpbg.png" alt="background" className="pointer-events-none fixed inset-0 z-0 h-screen w-full select-none object-contain object-top" />
      <div className="relative z-20"><Header /></div>

      <main className="relative z-10 hidden md:flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-20">
        <div className="w-full max-w-[560px] rounded-[32px] border border-white/10 bg-white/[0.06] px-8 py-10 text-center shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: GRADIENT }}>
            <FiSend className="text-[30px] text-white" />
          </div>
          <h1 className="text-[32px] font-semibold leading-[40px] text-white" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>Messages</h1>
          <p className="mx-auto mt-3 max-w-[360px] text-[16px] font-normal leading-[24px] text-white/55" style={{ fontFamily: "Inter, sans-serif" }}>Your conversations will appear here.</p>
          <button onClick={() => setOpenChatPopup(true)} className="mt-8 h-12 rounded-full px-8 text-[14px] font-semibold leading-[20px] text-white transition hover:opacity-90" style={{ background: GRADIENT, fontFamily: "Inter, sans-serif" }}>
            Open Message
          </button>
        </div>
      </main>

      {openChatPopup && (
        <div className="fixed inset-0 z-[99999] flex items-start justify-center bg-black/45 px-0 sm:px-6 pb-0 sm:pb-5 pt-0 sm:pt-[60px] backdrop-blur-md">
          <div className="relative h-[100dvh] sm:h-[calc(100vh-80px)] sm:min-h-[610px] w-full sm:w-[1240px] sm:max-w-[calc(100vw-48px)] overflow-hidden sm:rounded-[32px] bg-[#171717] shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
            <div className="flex h-full overflow-hidden">

              {/* ── SIDEBAR ── */}
              <aside className={`${mobileView === "list" ? "flex" : "hidden"} sm:flex relative h-full w-full sm:w-[322px] shrink-0 flex-col bg-[#151517]`}>
                <div className="absolute right-0 top-0 h-full w-px bg-white/10 hidden sm:block" />
                <div className="px-5 sm:px-8 pt-6 sm:pt-8">
                  <div className="flex items-center justify-between text-white">
                    <h2 className="text-[20px] sm:text-[24px] font-medium leading-[32px]" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>Messages</h2>
                    <div className="flex items-center gap-3">
                      <img src="/icons/pen.svg" alt="" className="h-[22px] w-[22px] object-contain" />
                      <button onClick={() => setOpenChatPopup(false)} className="sm:hidden grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white"><X size={16} /></button>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-7 flex h-[34px] items-center rounded-lg bg-white/85 px-4 text-zinc-900">
                    <input className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500" placeholder="Search chats..." />
                    <Search size={20} />
                  </div>
                </div>
                <div className="mt-6 sm:mt-8 flex-1 overflow-y-auto">
                  {loadingConversations ? (
                    <p className="px-5 sm:px-8 text-sm text-white/40">Loading chats...</p>
                  ) : conversations.length === 0 ? (
                    <p className="px-5 sm:px-8 text-sm text-white/40">No conversations yet.</p>
                  ) : (
                    conversations.map((c) => {
                      const active = activeConvo?._id === c._id;
                      const lastText = getLastMessageText(c);
                      return (
                        <button key={c._id} onClick={() => { setActiveConvo(c); setShowProfile(false); setMobileView("chat"); }}
                          className={`relative flex w-full gap-4 px-5 sm:px-8 py-4 sm:py-5 text-left transition ${active ? "bg-[#221b2e]" : "hover:bg-white/[0.03]"}`}>
                          {active && <span className="absolute right-0 top-0 h-full w-[3px] bg-gradient-to-b from-fuchsia-500 to-blue-500" />}
                          <UserAvatar
                            user={c.otherUser}
                            size="lg"
                            online={onlineUsers.has(String(c.otherUser?._id))}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="truncate text-[14px] font-semibold leading-[20px] text-white" style={{ fontFamily: "Inter, sans-serif" }}>{c.otherUser?.name || "Unknown User"}</p>
                              <span className="shrink-0 text-[11px] leading-[16px] text-zinc-500" style={{ fontFamily: "Inter, sans-serif" }}>{formatTime(c.lastMessage?.createdAt || c.updatedAt) || "Now"}</span>
                            </div>
                            {/* "Typing..." used to render whenever this row was the
                                SELECTED one — it tracked selection, not typing.
                                Now it replaces the preview only while the other
                                person is actually typing. */}
                            {typingBy[String(c._id)] ? (
                              <p className="mt-1 text-[14px] font-normal italic leading-[20px] text-emerald-400" style={{ fontFamily: "Inter, sans-serif" }}>
                                Typing…
                              </p>
                            ) : (
                              <p className={`mt-1 truncate text-[14px] font-normal leading-[20px] ${active ? "text-purple-200" : "text-zinc-400"}`} style={{ fontFamily: "Inter, sans-serif" }}>{lastText}</p>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </aside>

              {/* ── MAIN CHAT AREA ── */}
              <main className={`${mobileView === "chat" ? "flex" : "hidden"} sm:flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#171717]`}>
                {/* Header */}
                <header className="flex h-16 sm:h-20 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-8">
                  {activeConvo ? (
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                      <button onClick={() => setMobileView("list")} className="sm:hidden mr-1 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white shrink-0"><ArrowLeft size={16} /></button>
                      <UserAvatar
                        user={activeConvo.otherUser}
                        size="md"
                        online={onlineUsers.has(String(activeConvo.otherUser?._id))}
                      />
                      <div className="min-w-0">
                        <h1 className="truncate text-[13px] sm:text-[14px] font-semibold leading-[20px] text-white" style={{ fontFamily: "Inter, sans-serif" }}>{activeConvo.otherUser?.name || "Unknown User"}</h1>
                        {/* Was a hardcoded green "Active Now" on every thread.
                            Reflects real presence now, and typing takes priority
                            over it while it's happening. */}
                        <p className="text-[11px] sm:text-[12px] font-normal leading-[18px] text-zinc-500" style={{ fontFamily: "Inter, sans-serif" }}>
                          {typingBy[String(activeConvo._id)] ? (
                            <span className="text-emerald-400 italic">Typing…</span>
                          ) : onlineUsers.has(String(activeConvo.otherUser?._id)) ? (
                            <span className="text-emerald-400">Active now</span>
                          ) : (
                            <span className="text-zinc-500">Offline</span>
                          )}
                          {activeConvo.otherUser?.role ? ` • ${activeConvo.otherUser.role}` : ""}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-[14px] font-semibold leading-[20px] text-white" style={{ fontFamily: "Inter, sans-serif" }}>Select Chat</h1>
                      <p className="text-[12px] leading-[18px] text-zinc-500" style={{ fontFamily: "Inter, sans-serif" }}>Choose a conversation</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <button onClick={startMeetCall} disabled={!activeConvo} className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full bg-white/[0.06] text-white hover:bg-white/10 disabled:opacity-40" title="Google Meet">
                      <FiVideo className="text-[16px] sm:text-[19px] text-white" />
                    </button>
                    <button onClick={() => setShowProfile((v) => !v)} disabled={!activeConvo} className="hidden sm:grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-white hover:bg-white/10 disabled:opacity-40" title="Info">
                      <FiInfo className="text-[19px] text-white" />
                    </button>
                    <button onClick={deleteActiveConversation} disabled={!activeConvo} className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full bg-[#5A1518] text-white hover:bg-[#751B20] disabled:opacity-40" title="Delete">
                      <Trash2 size={15} />
                    </button>
                    <button onClick={() => setOpenChatPopup(false)} className="hidden sm:grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-white hover:bg-white/10" title="Close">
                      <X size={20} />
                    </button>
                  </div>
                </header>

                {/* Messages */}
                <section className="min-h-0 flex-1 overflow-y-auto px-3 sm:px-20 py-4 sm:py-5">
                  <div className="mx-auto w-fit rounded-full bg-white px-4 py-1.5 text-[10px] font-medium uppercase text-zinc-600" style={{ fontFamily: "Inter, sans-serif" }}>
                    {formatChatDate()}
                  </div>

                  {!activeConvo ? (
                    <div className="flex h-full items-center justify-center"><p className="text-sm text-white/40">Select a conversation to start chatting.</p></div>
                  ) : loadingMessages ? (
                    <div className="flex h-full items-center justify-center"><p className="text-sm text-white/40">Loading messages...</p></div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center"><p className="text-sm text-white/40">No messages yet.</p></div>
                  ) : (
                    messages.map((m) => {
                      const senderId = getMessageSenderId(m);
                      const isMine = senderId === user?._id;
                      const hireData = parseHireCardData(m.text);
                      const counterData = parseCounterCardData(m.text);
                      // ── NEW: parse HIRE_ACCEPTED ──
                      const hireAcceptedData = parseHireAcceptedData(m.text);

                       const workSubmittedData = parseWorkSubmittedData(m.text);   // ← nayi
const escrowReleasedData = parseEscrowReleasedData(m.text);
const serviceCardData = parseServiceCardData(m.text);
const serviceWorkSubmittedData = parseServiceWorkSubmittedData(m.text);
                      return (
                        <div key={m._id} className={`mt-4 sm:mt-5 flex items-start gap-2 sm:gap-4 ${isMine ? "justify-end" : "justify-start"}`}>
                          {!isMine && <UserAvatar user={activeConvo.otherUser} size="sm" online={false} />}
                          <div className="max-w-[85%] sm:max-w-[610px]">
                            {hireData ? (
                              <HireCard data={hireData} conversationId={activeConvo._id} senderId={user?._id} token={token} />
                           ) : counterData ? (
  <CounterProposalCard data={counterData} />
) : hireAcceptedData ? (
  <HireAcceptedCard data={hireAcceptedData} isMine={isMine} token={token} />
) : workSubmittedData ? (
  <WorkSubmittedCard data={workSubmittedData} isMine={isMine} token={token} />
) : escrowReleasedData ? (
  <EscrowReleasedCard data={escrowReleasedData} />
) : serviceCardData ? (
  <ServiceOrderCard data={serviceCardData} isMine={isMine} token={token} />
) : serviceWorkSubmittedData ? (
  <ServiceWorkSubmittedCard data={serviceWorkSubmittedData} isMine={isMine} token={token} />
) : m.deleted ? (
  // Soft-deleted: the row stays so the thread keeps its shape, but the text is
  // gone server-side too, not just hidden here.
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 sm:px-4 py-2 sm:py-3 text-[13px] italic text-zinc-500">
    This message was deleted
  </div>
) : editingId === m._id ? (
  <div className="rounded-2xl border border-white/15 bg-[#2b2b2b] p-2">
    <textarea
      value={editDraft}
      onChange={(e) => setEditDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitEdit(); }
        if (e.key === "Escape") { setEditingId(null); setEditDraft(""); }
      }}
      rows={2}
      autoFocus
      className="w-full resize-none bg-transparent px-2 py-1 text-[14px] text-white outline-none"
    />
    <div className="mt-1 flex items-center justify-end gap-2">
      <button onClick={() => { setEditingId(null); setEditDraft(""); }} className="rounded-md px-2.5 py-1 text-xs text-zinc-400 hover:bg-white/10">Cancel</button>
      <button onClick={submitEdit} disabled={!editDraft.trim()} className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-black disabled:opacity-40">Save</button>
    </div>
  </div>
) : (
                              m.text && (
                                <div className="group/msg relative">
                                  <div
                                    className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-[14px] sm:text-[15px] font-normal leading-[22px] tracking-[0px] break-words whitespace-pre-line ${isMine ? "text-white" : "bg-[#2b2b2b] text-zinc-200"}`}
                                    style={{ background: isMine ? GRADIENT : undefined, fontFamily: "Plus Jakarta Sans, sans-serif" }}
                                  >
                                    {renderMessageText(m.text)}
                                  </div>

                                  {/* Edit / delete — own plain-text messages only.
                                      Deliberately not offered on the hire/service
                                      cards above: their text is a structured
                                      payload those flows parse. The server
                                      re-checks ownership on both events. */}
                                  {isMine && (
                                    <div className="absolute -top-2 right-1 hidden items-center gap-1 rounded-full border border-white/10 bg-[#1c1c1e] px-1 py-0.5 shadow-lg group-hover/msg:flex">
                                      <button
                                        onClick={() => { setEditingId(m._id); setEditDraft(m.text || ""); }}
                                        title="Edit message"
                                        aria-label="Edit message"
                                        className="grid h-6 w-6 place-items-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
                                      >
                                        <Pencil size={12} />
                                      </button>
                                      <button
                                        onClick={() => deleteMessage(m._id)}
                                        title="Delete message"
                                        aria-label="Delete message"
                                        className="grid h-6 w-6 place-items-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-red-400"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )
                            )}

                            {m.attachment && (
                              <div className="mt-2">
                                {m.attachment.type === "image" ? (
                                  <img src={m.attachment.url} className="max-w-[200px] sm:max-w-[240px] rounded-lg" />
                                ) : (
                                  <a href={m.attachment.url} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-blue-400 underline">📎 {m.attachment.name}</a>
                                )}
                              </div>
                            )}
                            <div className={`mt-1 sm:mt-2 flex items-center gap-1.5 text-xs text-zinc-600 ${isMine ? "justify-end" : "justify-start"}`}>
                              <span>{formatTime(m.createdAt)}</span>
                              {/* Shown so an edit can't quietly change what was
                                  agreed without the other side noticing. */}
                              {m.editedAt && !m.deleted && <span className="italic text-zinc-500">edited</span>}
                              {isMine && !m.deleted && (
                                <MessageTicks message={m} recipientIds={recipientIds} />
                              )}
                            </div>
                          </div>
                          {isMine && <UserAvatar user={user} size="sm" online={false} />}
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </section>

                {/* Footer */}
                <footer className="shrink-0 border-t border-white/5 px-3 sm:px-8 py-3 sm:py-6">
                  <div className="flex items-center gap-2 sm:gap-6">
                    <button onClick={() => fileInputRef.current?.click()} disabled={!activeConvo} className="grid h-7 w-7 place-items-center rounded-full border border-zinc-500 text-zinc-500 hover:text-white disabled:opacity-40 shrink-0">
                      <Plus size={20} />
                    </button>
                    <input ref={fileInputRef} type="file" hidden onChange={handleAttachment} />
                    <div className="flex h-11 sm:h-12 flex-1 items-center gap-2 sm:gap-4 rounded-2xl bg-white px-3 sm:px-5 text-zinc-900">
                      <input
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          // Emitting the real typing signal. notifyTyping()
                          // debounces internally, so this is safe per keystroke.
                          if (e.target.value.trim()) notifyTyping();
                          else stopTyping();
                        }}
                        onBlur={stopTyping}
                        onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                        disabled={!activeConvo}
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed"
                        placeholder={activeConvo ? "Type a message..." : "Select conversation first"} />
                      <button onClick={() => fileInputRef.current?.click()} disabled={!activeConvo} className="disabled:opacity-40 shrink-0">
                        <img src="/icons/calo.svg" alt="" className="h-[24px] w-[24px] sm:h-[28px] sm:w-[28px] object-contain opacity-80 hover:opacity-100" />
                      </button>
                    </div>
                    <SendButton disabled={!activeConvo} onClick={sendMessage} />
                  </div>
                </footer>
              </main>

              {/* ── PROFILE SIDEBAR ── */}
              {showProfile && activeConvo && (
                <aside className="absolute right-0 top-16 sm:top-20 h-[calc(100%-64px)] sm:h-[calc(100%-80px)] w-[280px] sm:w-[300px] border-l border-white/10 bg-[#151517] p-4 sm:p-6 shadow-2xl z-50">
                  <div className="flex justify-end">
                    <button onClick={() => setShowProfile(false)} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white"><X size={16} /></button>
                  </div>
                  <div className="mt-6 text-center">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center"><UserAvatar user={activeConvo.otherUser} size="xl" online={onlineUsers.has(String(activeConvo.otherUser?._id))} /></div>
                    <h3 className="mt-5 text-[14px] font-semibold leading-[20px]" style={{ fontFamily: "Inter, sans-serif" }}>{activeConvo.otherUser?.name}</h3>
                    <p className="mb-6 text-xs text-white/50">{activeConvo.otherUser?.role || "User"}</p>
                    <h4 className="mb-3 text-xs font-semibold uppercase text-white/40">Shared Resources</h4>
                    <div className="space-y-3">
                      {sharedResources.length === 0 && <p className="text-xs text-white/40">No shared files yet</p>}
                      {sharedResources.map((m, i) => (
                        <a key={i} href={m.attachment.url} target="_blank" rel="noopener noreferrer" className="block break-all rounded-lg bg-[#202020] px-3 py-2 text-xs hover:bg-white/10">📎 {m.attachment.name}</a>
                      ))}
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── INCOMING CALL ── */}
      {incomingCall && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 px-4">
          <div className="w-[92vw] max-w-[360px] rounded-2xl bg-[#121212] p-6 text-center text-white">
            <p className="mb-1 text-lg font-semibold">Incoming {callType === "audio" ? "Audio" : "Video"} Call</p>
            <p className="mb-6 text-sm text-white/60">{incomingCall.fromUser.name} is calling you</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  clearTimeout(callTimeoutRef.current);
                  ringingAudio.current?.pause();
                  await joinCall(incomingCall.conversationId, user._id);
                  socket.emit("call-accepted", { toUserId: incomingCall.fromUser._id, conversationId: incomingCall.conversationId });
                  setIncomingCall(null);
                }}
                className="rounded-full bg-green-500 px-6 py-2 font-medium text-black"
              >Accept</button>
              <button
                onClick={() => {
                  clearTimeout(callTimeoutRef.current);
                  ringingAudio.current?.pause();
                  socket.emit("end-call", { toUserId: incomingCall.fromUser._id });
                  setIncomingCall(null);
                }}
                className="rounded-full bg-red-500 px-6 py-2 font-medium text-white"
              >Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
