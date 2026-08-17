// import { useState } from "react";
// import Header from "@/components/Header";
// import { useAuth } from "@/contexts/AuthContext";
// import { X, Clock3 } from "lucide-react";

// const GRADIENT = "linear-gradient(270deg,#FF14EF 0%, #1A73E8 100%)";

// const toDateValue = (date: Date) => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

// const getMonthLabel = (date: Date) =>
//   date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

// const formatDashboardDate = (value: string) => {
//   if (!value) return "OCTOBER 24";
//   const [year, month, day] = value.split("-").map(Number);
//   if (!year || !month || !day) return "OCTOBER 24";
//   return new Date(year, month - 1, day)
//     .toLocaleDateString("en-US", { month: "long", day: "numeric" })
//     .toUpperCase();
// };

// type DashTab = "dashboard" | "requests" | "prompts" | "subscription";

// const SelfDash = () => {
//   const { user } = useAuth() as any;

//   const displayName =
//     user?.name?.trim() || user?.email?.split("@")?.[0] || "User";

//   const avatar =
//     user?.avatar?.startsWith("http")
//       ? user.avatar
//       : user?.avatar
//       ? `${import.meta.env.VITE_API_URL || ""}${user.avatar}`
//       : `https://i.pravatar.cc/160?u=${encodeURIComponent(displayName)}`;

//   const [activeTab, setActiveTab] = useState<DashTab>("dashboard");
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(toDateValue(new Date()));
//   const [calendarMonth, setCalendarMonth] = useState(() => {
//     const d = new Date();
//     d.setDate(1);
//     d.setHours(0, 0, 0, 0);
//     return d;
//   });

//   const stats = [
//     { title: "TOTAL PROJECTS", value: "42", badge: "+4", badgeColor: "#DDB7FF" },
//     { title: "ACTIVE REQUESTS", value: "12", badge: "+1", badgeColor: "#19E66C" },
//     { title: "EARNINGS", value: "₹2.5 L", badge: "+19%", badgeColor: "#DDB7FF" },
//     { title: "SUCCESS RATE", value: "94.2%", badge: "94.8%", badgeColor: "#19E66C" },
//   ];

//   const activeProjects = [
//     {
//       title: "FinTech App Redesign",
//       status: "IN PROGRESS",
//       start: "Oct 3",
//       finish: "Oct 24",
//       progress: 24,
//     },
//     {
//       title: "AI Powered Editing Tool",
//       status: "PENDING REVIEW",
//       start: "Oct 3",
//       finish: "Oct 24",
//       progress: 100,
//     },
//   ];

//   // 24 total requests across 3 pages (8 per page)
//   const allRequests = Array.from({ length: 24 }).map((_, index) => ({
//     id: index + 1,
//     title: "Enterprise CMS",
//     user: "Sarah Jenkins",
//     time: "2h ago",
//     price: "₹27k",
//     desc: "Looking for a full-stack developer to...",
//   }));

//   const myPrompts = [
//     { title: "Premium E-commerce Copy Prompt", status: "Published", price: "₹499" },
//     { title: "AI Sales Email Generator", status: "Draft", price: "₹299" },
//     { title: "Prompt Optimization Kit", status: "Published", price: "₹799" },
//   ];

//   const subscriptionData = {
//     plan: user?.plan || "Free",
//     renewal: "Oct 24, 2026",
//     usage: "38%",
//   };

//   const year = calendarMonth.getFullYear();
//   const month = calendarMonth.getMonth();
//   const firstDay = new Date(year, month, 1).getDay();
//   const totalDays = new Date(year, month + 1, 0).getDate();

//   const navItemStyle: React.CSSProperties = {
//     fontFamily: "Inter, sans-serif",
//     fontWeight: 700,
//     fontSize: 13,
//     lineHeight: "100%",
//     letterSpacing: "0.4px",
//   };

//   const WhiteIcon = ({
//     src,
//     size = 18,
//     opacity = 1,
//   }: {
//     src: string;
//     size?: number;
//     opacity?: number;
//   }) => (
//     <img
//       src={src}
//       alt=""
//       style={{
//         width: size,
//         height: size,
//         objectFit: "contain",
//         filter: "brightness(0) invert(1)",
//         opacity,
//       }}
//       onError={(e) => {
//         e.currentTarget.style.display = "none";
//       }}
//     />
//   );

//   const NavButton = ({
//     id,
//     label,
//     icon,
//   }: {
//     id: DashTab;
//     label: string;
//     icon: string;
//   }) => {
//     const active = activeTab === id;
//     return (
//       <button
//         type="button"
//         onClick={() => setActiveTab(id)}
//         className={`flex h-[38px] shrink-0 items-center gap-2 rounded-[7px] px-4 lg:h-[41px] lg:w-full lg:gap-3 ${
//           active ? "text-white" : "text-white/35 hover:bg-white/5"
//         }`}
//         style={{ ...navItemStyle, background: active ? GRADIENT : "transparent" }}
//       >
//         <WhiteIcon src={icon} opacity={active ? 1 : 0.35} />
//         <span className="whitespace-nowrap">{label}</span>
//       </button>
//     );
//   };

//   // ── RequestCard ────────────────────────────────────────
//   const RequestCard = ({ item }: { item: any }) => (
//     <div
//       style={{
//         borderRadius: 16,
//         background: "#FFFFFF05",
//         border: "1px solid #FFFFFF0F",
//         padding: "16px 12px 18px",
//         boxSizing: "border-box",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       {/* Title + price */}
//       <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
//         <div style={{ minWidth: 0 }}>
//           <h3
//             style={{
//               margin: 0,
//               fontFamily: "Inter, sans-serif",
//               fontWeight: 800,
//               fontSize: 14,
//               lineHeight: "100%",
//               color: "#FFFFFF",
//             }}
//           >
//             {item.title}
//           </h3>
//           <p
//             style={{
//               margin: "5px 0 0",
//               fontFamily: "Inter, sans-serif",
//               fontWeight: 400,
//               fontSize: 11,
//               lineHeight: "100%",
//               color: "#71717A",
//             }}
//           >
//             {item.user} • {item.time}
//           </p>
//         </div>
//         <span
//           style={{
//             fontFamily: "Inter, sans-serif",
//             fontWeight: 800,
//             fontSize: 12,
//             lineHeight: "100%",
//             color: "#DDB7FF",
//             flexShrink: 0,
//           }}
//         >
//           {item.price}
//         </span>
//       </div>

//       {/* Description */}
//       <p
//         style={{
//           margin: "9px 0 0",
//           fontFamily: "Inter, sans-serif",
//           fontWeight: 400,
//           fontSize: 12,
//           lineHeight: "16px",
//           color: "#71717A",
//         }}
//       >
//         {item.desc}
//       </p>

//       {/* Buttons — flex:1 fills card width, zero leftover */}
//       <div
//         style={{
//           marginTop: 14,
//           display: "flex",
//           alignItems: "center",
//           gap: 6,
//           width: "100%",
//         }}
//       >
//         {/* Accept Proposal */}
//         <button
//           type="button"
//           style={{
//             flex: 1,
//             minWidth: 0,
//             height: 35,
//             borderRadius: 8,
//             border: "none",
//             background: GRADIENT,
//             color: "#FFFFFF",
//             fontFamily: "Inter, sans-serif",
//             fontWeight: 400,
//             fontSize: 12,
//             lineHeight: "100%",
//             whiteSpace: "nowrap",
//             overflow: "hidden",
//             cursor: "pointer",
//             boxSizing: "border-box",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           Accept Proposal
//         </button>

//         {/* Counter Offer — dark bg, border, same shape/size as Accept */}
//         <button
//           type="button"
//           style={{
//             flex: 1,
//             minWidth: 0,
//             height: 35,
//             borderRadius: 8,
//             border: "1px solid #FFFFFF0D",
//             background: "#202020",
//             color: "#FFFFFF",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             gap: 7,
//             fontFamily: "Inter, sans-serif",
//             fontWeight: 400,
//             fontSize: 12,
//             lineHeight: "100%",
//             whiteSpace: "nowrap",
//             overflow: "hidden",
//             cursor: "pointer",
//             boxSizing: "border-box",
//           }}
//         >
//           <WhiteIcon src="/icons/counter.svg" size={13} />
//           Counter Offer
//         </button>

//         {/* X button */}
//         <button
//           type="button"
//           style={{
//             width: 35,
//             height: 35,
//             flexShrink: 0,
//             borderRadius: 8,
//             border: "none",
//             background: GRADIENT,
//             display: "grid",
//             placeItems: "center",
//             cursor: "pointer",
//             boxSizing: "border-box",
//           }}
//         >
//           <WhiteIcon src="/icons/crass.svg" size={14} />
//         </button>
//       </div>
//     </div>
//   );

//   // ── DashboardContent ───────────────────────────────────
//   const DashboardContent = () => (
//     <>
//       <div
//         className="relative z-10 mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-8 lg:grid-cols-4 lg:gap-7"
//         style={{
//           filter: showCalendar ? "blur(3px)" : "none",
//           opacity: showCalendar ? 0.65 : 1,
//           transition: "filter 0.2s ease, opacity 0.2s ease",
//           pointerEvents: showCalendar ? "none" : "auto",
//         }}
//       >
//         {stats.map((item) => (
//           <div
//             key={item.title}
//             className="relative overflow-hidden"
//             style={{
//               minHeight: 112,
//               borderRadius: 22,
//               background: "#00000080",
//               border: "1px solid #FFFFFF33",
//               backdropFilter: "blur(16px)",
//               WebkitBackdropFilter: "blur(16px)",
//               padding: "22px",
//               boxSizing: "border-box",
//             }}
//           >
//             <div className="flex items-center justify-between gap-3">
//               <p
//                 className="truncate"
//                 style={{
//                   margin: 0,
//                   fontFamily: "Inter, sans-serif",
//                   fontWeight: 700,
//                   fontSize: 9,
//                   lineHeight: "100%",
//                   letterSpacing: "0.8px",
//                   color: "#71717A",
//                   textTransform: "uppercase",
//                   whiteSpace: "nowrap",
//                   maxWidth: 130,
//                 }}
//               >
//                 {item.title}
//               </p>
//               <span
//                 className="grid h-[22px] min-w-[36px] shrink-0 place-items-center rounded-full bg-black px-2"
//                 style={{
//                   fontFamily: "Inter, sans-serif",
//                   fontWeight: 700,
//                   fontSize: 10,
//                   lineHeight: "100%",
//                   color: item.badgeColor,
//                 }}
//               >
//                 {item.badge}
//               </span>
//             </div>
//             <p
//               style={{
//                 margin: "26px 0 0",
//                 fontFamily: "Inter, sans-serif",
//                 fontWeight: 800,
//                 fontSize: 34,
//                 lineHeight: "100%",
//                 color: "#FFFFFF",
//               }}
//             >
//               {item.value}
//             </p>
//           </div>
//         ))}
//       </div>

//       <div className="relative z-10 mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1px_355px] lg:gap-6">
//         <div>
//           <div className="flex items-center justify-between">
//             <h2
//               style={{
//                 margin: 0,
//                 fontFamily: "Inter, sans-serif",
//                 fontWeight: 800,
//                 fontSize: 21,
//                 lineHeight: "100%",
//                 color: "#FFFFFF",
//               }}
//             >
//               Active Projects
//             </h2>
//             <button
//               type="button"
//               style={{
//                 fontFamily: "Inter, sans-serif",
//                 fontWeight: 800,
//                 fontSize: 12,
//                 lineHeight: "100%",
//                 letterSpacing: "1.5px",
//                 color: "#C084FC",
//               }}
//             >
//               VIEW ALL
//             </button>
//           </div>

//           <div className="mt-4 h-px w-full bg-white/10" />

//           <div className="mt-4 space-y-5">
//             {activeProjects.map((project) => (
//               <div
//                 key={project.title}
//                 style={{
//                   borderRadius: 16,
//                   background: "rgba(0,0,0,0.22)",
//                   border: "1px solid rgba(255,255,255,0.10)",
//                   padding: "22px 16px",
//                   boxSizing: "border-box",
//                 }}
//               >
//                 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//                   <h3
//                     style={{
//                       margin: 0,
//                       fontFamily: "Inter, sans-serif",
//                       fontWeight: 800,
//                       fontSize: 18,
//                       lineHeight: "120%",
//                       color: "#FFFFFF",
//                     }}
//                   >
//                     {project.title}
//                   </h3>
//                   <span
//                     className="w-fit"
//                     style={{
//                       height: 24,
//                       padding: "0 13px",
//                       borderRadius: 999,
//                       border:
//                         project.status === "IN PROGRESS"
//                           ? "1px solid rgba(250,188,78,0.28)"
//                           : "1px solid rgba(255,255,255,0.12)",
//                       background:
//                         project.status === "IN PROGRESS"
//                           ? "rgba(250,188,78,0.12)"
//                           : "rgba(255,255,255,0.06)",
//                       color:
//                         project.status === "IN PROGRESS" ? "#FABC4E" : "#A1A1AA",
//                       display: "inline-flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       fontFamily: "Inter, sans-serif",
//                       fontWeight: 800,
//                       fontSize: 10,
//                       lineHeight: "100%",
//                       letterSpacing: "1px",
//                     }}
//                   >
//                     {project.status}
//                   </span>
//                 </div>

//                 <div className="mt-7 flex items-center gap-2">
//                   <Clock3 size={20} color="#C084FC" />
//                   <p
//                     style={{
//                       margin: 0,
//                       fontFamily: "Inter, sans-serif",
//                       fontWeight: 800,
//                       fontSize: 12,
//                       lineHeight: "100%",
//                       letterSpacing: "2px",
//                       color: "#C084FC",
//                     }}
//                   >
//                     EXECUTION TIMELINE
//                   </p>
//                 </div>

//                 <div
//                   className="mt-4 h-[6px] max-w-[520px] overflow-hidden rounded-full"
//                   style={{ background: "#18181B80", border: "1px solid #FFFFFF1A" }}
//                 >
//                   <div
//                     style={{
//                       width: `${project.progress}%`,
//                       height: "100%",
//                       borderRadius: 999,
//                       background: "#D9A6FF",
//                     }}
//                   />
//                 </div>

//                 <div
//                   className="mt-3 flex max-w-[520px] items-center justify-between"
//                   style={{
//                     fontFamily: "Inter, sans-serif",
//                     fontWeight: 400,
//                     fontSize: 13,
//                     lineHeight: "100%",
//                     color: "#C9C2CE",
//                   }}
//                 >
//                   <span>Start: {project.start}</span>
//                   <span>Finish: {project.finish}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="hidden bg-white/20 lg:block" style={{ width: 1 }} />

//         <div className="flex flex-col gap-0">
//           <div className="flex items-center justify-between mb-4">
//             <h2
//               style={{
//                 margin: 0,
//                 fontFamily: "Inter, sans-serif",
//                 fontWeight: 800,
//                 fontSize: 21,
//                 lineHeight: "100%",
//                 color: "#FFFFFF",
//               }}
//             >
//               New Requests
//             </h2>
//             <span
//               className="rounded-full bg-white/10 px-2 py-1"
//               style={{
//                 fontFamily: "Inter, sans-serif",
//                 fontWeight: 800,
//                 fontSize: 11,
//                 lineHeight: "100%",
//                 color: "#FFFFFF",
//               }}
//             >
//               +1
//             </span>
//           </div>
//           <RequestCard item={allRequests[0]} />
//         </div>
//       </div>
//     </>
//   );

//   // ── RequestsContent ────────────────────────────────────
//   const RequestsContent = () => {
//     const PER_PAGE = 8;
//     const TOTAL_PAGES = Math.ceil(allRequests.length / PER_PAGE);
//     const [page, setPage] = useState(1);

//     const pageItems = allRequests.slice((page - 1) * PER_PAGE, page * PER_PAGE);

//     const btnBase: React.CSSProperties = {
//       width: 34,
//       height: 34,
//       borderRadius: 6,
//       fontFamily: "Inter, sans-serif",
//       fontWeight: 400,
//       fontSize: 14,
//       lineHeight: "100%",
//       display: "grid",
//       placeItems: "center",
//       cursor: "pointer",
//     };

//     const pageBtn = (active: boolean): React.CSSProperties => ({
//       ...btnBase,
//       border: active ? "none" : "1px solid #F5F5F5",
//       background: active ? GRADIENT : "transparent",
//       color: "#FFFFFF",
//     });

//     const navBtn: React.CSSProperties = {
//       ...btnBase,
//       border: "1px solid #F5F5F5",
//       background: "transparent",
//       color: "#FFFFFF",
//     };

//     return (
//       /* Full-height flex column — header + grid scroll + pagination pinned */
//       <div className="flex h-full flex-col overflow-hidden">
//         {/* ── Header ── */}
//         <div className="shrink-0">
//           <h1
//             style={{
//               margin: 0,
//               fontFamily: "Inter, sans-serif",
//               fontWeight: 800,
//               fontSize: 28,
//               lineHeight: "100%",
//               color: "#FFFFFF",
//             }}
//           >
//             New Requests
//           </h1>
//           <p
//             style={{
//               margin: "6px 0 0",
//               fontFamily: "Inter, sans-serif",
//               fontWeight: 400,
//               fontSize: 13,
//               lineHeight: "100%",
//               color: "#8F8996",
//             }}
//           >
//             Your project request activity is up{" "}
//             <span style={{ color: "#C084FC", fontWeight: 700 }}>15%</span> this week.
//           </p>
//         </div>

//         {/* ── Cards grid (scrollable) ── */}
//         <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
//           <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
//             {pageItems.map((item) => (
//               <RequestCard key={item.id} item={item} />
//             ))}
//           </div>
//         </div>

//         {/* ── Pagination — always visible at bottom ── */}
//         <div className="mt-3 flex shrink-0 items-center justify-center gap-2 pb-1">
//           {/* First */}
//           <button type="button" style={navBtn} onClick={() => setPage(1)}>«</button>
//           {/* Prev */}
//           <button
//             type="button"
//             style={navBtn}
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//           >‹</button>

//           {/* Page numbers */}
//           {Array.from({ length: TOTAL_PAGES }).map((_, i) => {
//             const p = i + 1;
//             return (
//               <button
//                 key={p}
//                 type="button"
//                 style={pageBtn(page === p)}
//                 onClick={() => setPage(p)}
//               >
//                 {p}
//               </button>
//             );
//           })}

//           {/* Next */}
//           <button
//             type="button"
//             style={navBtn}
//             onClick={() => setPage((p) => Math.min(TOTAL_PAGES, p + 1))}
//           >›</button>
//           {/* Last */}
//           <button type="button" style={navBtn} onClick={() => setPage(TOTAL_PAGES)}>»</button>
//         </div>
//       </div>
//     );
//   };

//   // ── PromptsContent ─────────────────────────────────────
//   const PromptsContent = () => (
//     <div className="relative z-10 mt-8">
//       <h2
//         style={{
//           margin: 0,
//           fontFamily: "Inter, sans-serif",
//           fontWeight: 800,
//           fontSize: 24,
//           lineHeight: "100%",
//           color: "#FFFFFF",
//         }}
//       >
//         My Prompts
//       </h2>
//       <div className="mt-6 grid gap-4">
//         {myPrompts.map((prompt) => (
//           <div
//             key={prompt.title}
//             className="flex flex-col gap-4 rounded-2xl border border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between"
//             style={{ background: "#FFFFFF05" }}
//           >
//             <div>
//               <h3
//                 style={{
//                   margin: 0,
//                   fontFamily: "Inter, sans-serif",
//                   fontWeight: 800,
//                   fontSize: 18,
//                   lineHeight: "120%",
//                   color: "#FFFFFF",
//                 }}
//               >
//                 {prompt.title}
//               </h3>
//               <p
//                 className="mt-2"
//                 style={{
//                   fontFamily: "Inter, sans-serif",
//                   fontWeight: 400,
//                   fontSize: 13,
//                   color: "#71717A",
//                 }}
//               >
//                 Status: {prompt.status}
//               </p>
//             </div>
//             <div className="flex items-center gap-3">
//               <span
//                 style={{
//                   fontFamily: "Inter, sans-serif",
//                   fontWeight: 800,
//                   fontSize: 16,
//                   color: "#C084FC",
//                 }}
//               >
//                 {prompt.price}
//               </span>
//               <button
//                 className="h-9 rounded-lg px-4 text-white"
//                 style={{
//                   background: GRADIENT,
//                   fontFamily: "Inter, sans-serif",
//                   fontSize: 13,
//                 }}
//               >
//                 View
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );

//   // ── SubscriptionContent ────────────────────────────────
//   const SubscriptionContent = () => (
//     <div className="relative z-10 mt-8">
//       <h2
//         style={{
//           margin: 0,
//           fontFamily: "Inter, sans-serif",
//           fontWeight: 800,
//           fontSize: 24,
//           lineHeight: "100%",
//           color: "#FFFFFF",
//         }}
//       >
//         My Subscription
//       </h2>
//       <div
//         className="mt-6 max-w-[520px] rounded-[24px] border border-white/10 p-6"
//         style={{ background: "#FFFFFF05" }}
//       >
//         <p
//           style={{
//             margin: 0,
//             fontFamily: "Inter, sans-serif",
//             fontWeight: 700,
//             fontSize: 12,
//             lineHeight: "100%",
//             letterSpacing: "1px",
//             color: "#71717A",
//             textTransform: "uppercase",
//           }}
//         >
//           Current Plan
//         </p>
//         <h3
//           className="mt-4 capitalize"
//           style={{
//             marginBottom: 0,
//             fontFamily: "Inter, sans-serif",
//             fontWeight: 800,
//             fontSize: 38,
//             lineHeight: "100%",
//             color: "#FFFFFF",
//           }}
//         >
//           {subscriptionData.plan}
//         </h3>
//         <div
//           className="mt-6 h-[6px] overflow-hidden rounded-full"
//           style={{ background: "#18181B80", border: "1px solid #FFFFFF1A" }}
//         >
//           <div
//             style={{
//               width: subscriptionData.usage,
//               height: "100%",
//               borderRadius: 999,
//               background: "#D9A6FF",
//             }}
//           />
//         </div>
//         <div
//           className="mt-4 flex items-center justify-between"
//           style={{
//             fontFamily: "Inter, sans-serif",
//             fontWeight: 400,
//             fontSize: 13,
//             color: "#C9C2CE",
//           }}
//         >
//           <span>Usage: {subscriptionData.usage}</span>
//           <span>Renewal: {subscriptionData.renewal}</span>
//         </div>
//         <button
//           className="mt-7 h-11 rounded-lg px-6 text-white"
//           style={{
//             background: GRADIENT,
//             fontFamily: "Inter, sans-serif",
//             fontWeight: 400,
//             fontSize: 14,
//           }}
//         >
//           Manage Subscription
//         </button>
//       </div>
//     </div>
//   );

//   // ── Render ─────────────────────────────────────────────
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-[#07080A] text-white">
//       <img
//         src="/icons/mpbg.png"
//         alt="background"
//         className="pointer-events-none fixed inset-0 z-0 h-screen w-full select-none object-cover opacity-80"
//       />

//       <div className="relative z-20">
//         <Header />
//       </div>

//       <main className="fixed inset-0 z-[60] flex items-start justify-center bg-black/35 px-3 pt-[60px] backdrop-blur-[20px] sm:px-6">
//         <div
//           className="relative flex w-full max-w-[1200px] overflow-hidden rounded-[24px] shadow-[0_40px_120px_rgba(0,0,0,0.65)] max-lg:flex-col sm:rounded-[32px]"
//           style={{
//             /* taller popup so 8 cards + pagination fit comfortably */
//             height: "min(920px, calc(100vh - 76px))",
//             background: "#21212180",
//             backdropFilter: "blur(20px)",
//             WebkitBackdropFilter: "blur(20px)",
//             border: "1px solid rgba(255,255,255,0.08)",
//             fontFamily: "Inter, sans-serif",
//           }}
//         >
//           {/* Close */}
//           <button
//             type="button"
//             onClick={() => window.history.back()}
//             className="absolute right-3 top-3 z-20 grid h-8 w-8 place-items-center rounded-full text-white/45 hover:bg-white/10 hover:text-white sm:right-5 sm:top-5"
//           >
//             <X size={22} />
//           </button>

//           {/* ── Sidebar ── */}
//           <aside className="shrink-0 border-white/10 bg-[#151517]/70 px-4 py-4 max-lg:border-b lg:h-full lg:w-[255px] lg:border-r lg:px-7 lg:py-8">
//             <div className="flex items-center gap-4 lg:block">
//               <div className="h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[18px] border border-white/20 bg-black/30 lg:h-[90px] lg:w-[90px] lg:rounded-[24px]">
//                 <img src={avatar} alt={displayName} className="h-full w-full object-cover" />
//               </div>

//               <div className="min-w-0 flex-1">
//                 <h2
//                   className="truncate text-white lg:mt-5"
//                   style={{
//                     fontFamily: "Inter, sans-serif",
//                     fontWeight: 400,
//                     fontSize: 21,
//                     lineHeight: "100%",
//                   }}
//                 >
//                   {displayName}
//                 </h2>

//                 <nav className="no-scrollbar mt-4 flex gap-2 overflow-x-auto lg:mt-10 lg:block lg:space-y-3">
//                   <NavButton id="dashboard"    label="DASHBOARD"       icon="/icons/self.svg" />
//                   <NavButton id="requests"     label="REQUESTS"        icon="/icons/req.svg"  />
//                   <NavButton id="prompts"      label="MY PRODUCTS"      icon="/icons/self.svg" />
//                   <NavButton id="subscription" label="MY SUBSCRIPTION" icon="/icons/req.svg"  />
//                 </nav>
//               </div>
//             </div>
//           </aside>

//           {/* ── Main content ── */}
//           {/*
//             For requests: the inner RequestsContent manages its own scroll.
//             For other tabs: the section itself scrolls.
//             We use overflow-y-auto on section always but RequestsContent
//             uses flex h-full so it fills the section without double-scroll.
//           */}
//           <section
//             className="relative min-w-0 flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8"
//             style={{
//               minHeight: 0,
//               paddingTop: activeTab === "requests" ? 20 : 32,
//               paddingBottom: activeTab === "requests" ? 12 : 32,
//             }}
//           >
//             {/* Glows */}
//             <div className="pointer-events-none absolute right-[40px] top-[70px] h-[180px] w-[180px] rounded-full bg-[#5D4DFF]/45 blur-[35px] sm:right-[120px] sm:h-[240px] sm:w-[240px]" />
//             <div className="pointer-events-none absolute left-[80px] top-[520px] h-[200px] w-[200px] rounded-full bg-[#FF14EF]/20 blur-[65px] lg:left-[230px] lg:top-[430px] lg:h-[230px] lg:w-[230px]" />

//             {/* Hello header — hidden on requests tab */}
//             {activeTab !== "requests" && (
//               <div className="relative z-[100] flex flex-col gap-5 pr-8 sm:flex-row sm:items-start sm:justify-between sm:pr-12">
//                 <div className="min-w-0">
//                   <h1
//                     className="truncate"
//                     style={{
//                       margin: 0,
//                       fontFamily: "Inter, sans-serif",
//                       fontWeight: 800,
//                       fontSize: "clamp(26px, 6vw, 34px)",
//                       lineHeight: "100%",
//                       color: "#FFFFFF",
//                     }}
//                   >
//                     Hello, {displayName}
//                   </h1>
//                   <p
//                     className="mt-3"
//                     style={{
//                       marginBottom: 0,
//                       fontFamily: "Inter, sans-serif",
//                       fontWeight: 400,
//                       fontSize: 15,
//                       lineHeight: "140%",
//                       color: "#8F8996",
//                     }}
//                   >
//                     Your recruitment performance is up{" "}
//                     <span style={{ color: "#C084FC" }}>12%</span> this week.
//                   </p>
//                 </div>

//                 {/* Date + Calendar */}
//                 <div className="relative flex items-center gap-4 sm:pr-1">
//                   <div className="text-left sm:text-right">
//                     <p
//                       style={{
//                         margin: 0,
//                         fontFamily: "Inter, sans-serif",
//                         fontWeight: 800,
//                         fontSize: 12,
//                         lineHeight: "100%",
//                         color: "#FFFFFF",
//                         textTransform: "uppercase",
//                       }}
//                     >
//                       {formatDashboardDate(selectedDate)}
//                     </p>
//                     <p
//                       style={{
//                         margin: "6px 0 0",
//                         fontFamily: "Inter, sans-serif",
//                         fontWeight: 400,
//                         fontSize: 11,
//                         lineHeight: "100%",
//                         color: "#A1A1AA",
//                       }}
//                     >
//                       10:45 AM GMT
//                     </p>
//                   </div>

//                   <div className="h-8 w-px bg-white/20" />

//                   <button
//                     type="button"
//                     onClick={() => setShowCalendar((v) => !v)}
//                     className="grid h-10 w-10 place-items-center rounded-xl border-0 bg-transparent p-0"
//                   >
//                     <img
//                       src="/icons/cale.svg"
//                       alt="calendar"
//                       className="h-7 w-7 object-contain"
//                       style={{ filter: "brightness(0) invert(1)", opacity: 1 }}
//                       onError={(e) => { e.currentTarget.style.display = "none"; }}
//                     />
//                   </button>

//                   {showCalendar && (
//                     <div className="absolute right-0 top-[52px] z-[99999] w-[280px] rounded-2xl border border-white/10 bg-[#101114] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.75)]">
//                       <div className="mb-3 flex items-center justify-between">
//                         <button
//                           type="button"
//                           onClick={() =>
//                             setCalendarMonth((prev) => {
//                               const next = new Date(prev);
//                               next.setMonth(next.getMonth() - 1);
//                               return next;
//                             })
//                           }
//                           className="h-8 w-8 rounded-full bg-white/10 text-white hover:bg-white/15"
//                         >‹</button>
//                         <p className="text-sm font-semibold text-white">{getMonthLabel(calendarMonth)}</p>
//                         <button
//                           type="button"
//                           onClick={() =>
//                             setCalendarMonth((prev) => {
//                               const next = new Date(prev);
//                               next.setMonth(next.getMonth() + 1);
//                               return next;
//                             })
//                           }
//                           className="h-8 w-8 rounded-full bg-white/10 text-white hover:bg-white/15"
//                         >›</button>
//                       </div>

//                       <div className="mb-2 grid grid-cols-7 gap-1 text-center">
//                         {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
//                           <span key={`${day}-${index}`} className="text-[11px] text-white/40">{day}</span>
//                         ))}
//                       </div>

//                       <div className="grid grid-cols-7 gap-1 text-center">
//                         {[...Array(firstDay)].map((_, i) => <span key={`empty-${i}`} />)}
//                         {[...Array(totalDays)].map((_, i) => {
//                           const day = i + 1;
//                           const currentDate = new Date(year, month, day);
//                           currentDate.setHours(0, 0, 0, 0);
//                           const value = toDateValue(currentDate);
//                           const active = selectedDate === value;
//                           return (
//                             <button
//                               key={day}
//                               type="button"
//                               onClick={() => { setSelectedDate(value); setShowCalendar(false); }}
//                               className={`h-8 rounded-full text-xs transition ${active ? "text-white" : "text-white/70 hover:bg-white/10"}`}
//                               style={active ? { background: GRADIENT } : {}}
//                             >
//                               {day}
//                             </button>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* ── Tab content ── */}
//             {/*
//               requests tab gets h-full so its inner flex layout fills the space.
//               Other tabs scroll naturally.
//             */}
//             <div className={activeTab === "requests" ? "relative z-10 h-[calc(100%-0px)]" : "relative z-10 mt-6"}>
//               {activeTab === "dashboard"    && <DashboardContent />}
//               {activeTab === "requests"     && <RequestsContent />}
//               {activeTab === "prompts"      && <PromptsContent />}
//               {activeTab === "subscription" && <SubscriptionContent />}
//             </div>

//             <div className="h-8 lg:hidden" />
//           </section>
//         </div>
//       </main>

//       <style>{`
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>
//     </div>
//   );
// };

// export default SelfDash;






import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import ShareWithTeamModal from "@/components/ShareWithTeamModal";
import {
  X,
  Clock3,
  ShoppingCart,
  Upload,
  Trash,
  Check,
  BadgeDollarSign,
  FileText,
  Link2,
  Pencil,
  Users,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import DetailsPrompt, { MarketplacePrompt } from "../components/historyDetail";
import NdaButton from "@/components/NdaCard";
import SellerLinkedAccountForm from "@/components/SellerLinkedAccountForm";
import OrgMembershipCard from "@/components/OrgMembershipCard";
import {
  SERVICE_LINK_LABELS,
  formatBytes,
  downloadDeliverable,
} from "@/lib/serviceDeliverables";
import SubmitWorkModal from "@/components/escrow/SubmitWorkModal";
import { deadlineLabel } from "@/lib/escrowApi";
// Shared with the refund dialog in components/PromptHistory.tsx.
import {
  REFUND_REASON_PRESETS,
  composeRefundReason,
  hasRefundReason,
} from "@/lib/refundReasons";

const GRADIENT = "linear-gradient(270deg,#FF14EF 0%, #1A73E8 100%)";
const GRAD = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

function getModerationBadge(status?: string): { label: string; bg: string; color: string } | null {
  switch (status) {
    case "pending":
    case "pending_review":
      return { label: "Pending Review", bg: "rgba(234,179,8,0.2)", color: "#facc15" };
    case "approved":
    case "admin_approved":
      return { label: "Approved", bg: "rgba(34,197,94,0.2)", color: "#4ade80" };
    case "admin_rejected":
      return { label: "Rejected", bg: "rgba(239,68,68,0.2)", color: "#f87171" };
    case "flagged":
      return { label: "Flagged", bg: "rgba(239,68,68,0.2)", color: "#f87171" };
    case "edit_requested":
      return { label: "Changes Requested", bg: "rgba(167,139,250,0.2)", color: "#c4b5fd" };
    default:
      return null;
  }
}
const SELECTED_CARD_BG =
  "linear-gradient(180deg, rgba(255, 20, 239, 0.5) 0%, rgba(26, 115, 232, 0.5) 100%)";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const PURCHASE_BASE = `${API_BASE}/api/purchase`;

const INR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMonthLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

/* "10:45 AM IST" — the viewer's own wall clock and their own zone abbreviation,
   not a fixed string. `timeZoneName: "short"` gives IST / GMT+5:30 / PST etc.
   from the browser, so it can't disagree with the time printed beside it. */
const formatClock = () =>
  new Date()
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    })
    .toUpperCase();

const formatDashboardDate = (value: string) => {
  if (!value) return "OCTOBER 24";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "OCTOBER 24";
  return new Date(year, month - 1, day)
    .toLocaleDateString("en-US", { month: "long", day: "numeric" })
    .toUpperCase();
};

// One list, so a ?tab= value can be checked against exactly the tabs that exist.
const VALID_DASH_TABS = [
  "dashboard",
  "requests",
  "serviceBookings",
  "prompts",
  "subscription",
] as const;
type DashTab = (typeof VALID_DASH_TABS)[number];
type PromptsTab = "purchased" | "uploaded";
type PlanKey = "Free" | "Pro" | "Enterprise";

type ServerPlanKey = "free" | "pro";
type BillingCycle = "monthly" | "yearly";

const CREATE_USER_ORDER_URL = `${API_BASE}/api/plans/subscribe/order/create/user`;
const VERIFY_USER_PAYMENT_URL = `${API_BASE}/api/plans/subscribe/verify/verifypayment`;

const CREATE_ORG_ORDER_URL = `${API_BASE}/api/plans/subscribe/order/create/org`;
const VERIFY_ORG_PAYMENT_URL = VERIFY_USER_PAYMENT_URL;

const toServerPlanKey = (ui: PlanKey): ServerPlanKey | null =>
  ui === "Free" ? "free" : ui === "Pro" ? "pro" : null;

const toBillingCycle = (annual: boolean): BillingCycle =>
  annual ? "yearly" : "monthly";

const getAuthToken = () =>
  localStorage.getItem("auth_token") ||
  sessionStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("token") ||
  "";




/* ─── Prompt type ───────────────────────────────────────── */
type Prompt = {
  id: number | string;
  title: string;
  description: string;
  category: string;
  price?: number;
  rating?: number;
  downloads?: number;
  imageUrl?: string;
  videoUrl?: string;
  preview?: string;
  isFree?: boolean;
  createdAt?: string;
  uploadedAt?: string;
  purchasedAt?: string;
  sales?: number;
  revenue?: number;
  isUploadedByMe?: boolean;
  promptText?: string;
  fullPrompt?: string;
  /* Purchased prompts only — the Purchase doc id is what the refund
     endpoint keys off, and refundStatus drives the button vs. badge. */
  purchaseId?: string;
  refundStatus?: "NONE" | "REQUESTED" | "APPROVED" | "REJECTED" | "REFUNDED";
  /** ISO timestamp after which this purchase can no longer be refunded. */
  refundEligibleUntil?: string | null;
  /** The server's own verdict on whether a refund can still be requested. */
  refundEligible?: boolean;
  mediaValidation?: {
    status?: string;
    score?: number | null;
    adminAction?: { action?: string | null; note?: string };
  };
};

/* ─── Category helper ───────────────────────────────────── */
function pickCategoryFrom(src: any): string | undefined {
  if (!src) return;
  if (typeof src.categoryName === "string" && src.categoryName.trim()) return src.categoryName.trim();
  if (typeof src.category === "string" && src.category.trim()) return src.category.trim();
  if (src.category && typeof src.category === "object" && typeof src.category.name === "string")
    return src.category.name;
  const cats = src.categories;
  if (Array.isArray(cats) && cats.length) {
    const first = cats[0];
    if (typeof first === "string" && first.trim()) return first.trim();
    if (first && typeof first === "object") {
      if (typeof first.name === "string" && first.name.trim()) return first.name.trim();
      if (typeof first.label === "string" && first.label.trim()) return first.label.trim();
      if (typeof first.title === "string" && first.title.trim()) return first.title.trim();
    }
  }
  return undefined;
}
function resolveCategory(...sources: any[]): string {
  for (const s of sources) {
    const v = pickCategoryFrom(s);
    if (v) return v;
  }
  return "General";
}


const formatShortDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const formatProjectStatus = (status?: string) => {
  switch (status) {
    case "PENDING_ACCEPTANCE":
      return "New Request";
    case "ACCEPTED_WAITING_PAYMENT":
      return "Waiting Payment";
    case "FUNDED":
      return "Funded";
    case "IN_PROGRESS":
      return "In Progress";
    case "WORK_SUBMITTED":
      return "Submitted";
    case "REVISION_REQUESTED":
      return "Revision";
    case "COMPLETED":
      return "Completed";
    default:
      return "Active";
  }
};

const getProjectProgress = (status?: string) => {
  switch (status) {
    case "ACCEPTED_WAITING_PAYMENT":
      return 12;
    case "FUNDED":
      return 28;
    case "IN_PROGRESS":
      return 55;
    case "WORK_SUBMITTED":
      return 85;
    case "REVISION_REQUESTED":
      return 70;
    case "COMPLETED":
      return 100;
    default:
      return 0;
  }
};

const getProjectStatusStyle = (status?: string): React.CSSProperties => {
  switch (status) {
    case "ACCEPTED_WAITING_PAYMENT":
      return {
        border: "1px solid rgba(250,188,78,0.28)",
        background: "rgba(250,188,78,0.12)",
        color: "#FABC4E",
      };
    case "FUNDED":
      return {
        border: "1px solid rgba(25,230,108,0.28)",
        background: "rgba(25,230,108,0.10)",
        color: "#19E66C",
      };
    case "IN_PROGRESS":
      return {
        border: "1px solid rgba(192,132,252,0.28)",
        background: "rgba(192,132,252,0.12)",
        color: "#C084FC",
      };
    case "WORK_SUBMITTED":
      return {
        border: "1px solid rgba(26,115,232,0.35)",
        background: "rgba(26,115,232,0.14)",
        color: "#7DB0FF",
      };
    case "REVISION_REQUESTED":
      return {
        border: "1px solid rgba(255,130,80,0.32)",
        background: "rgba(255,130,80,0.12)",
        color: "#FF9B6A",
      };
    case "COMPLETED":
      return {
        border: "1px solid rgba(25,230,108,0.32)",
        background: "rgba(25,230,108,0.12)",
        color: "#19E66C",
      };
    default:
      return {
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.06)",
        color: "#A1A1AA",
      };
  }
};



/* ─── WhiteIcon ─────────────────────────────────────────── */
const WhiteIcon = ({
  src,
  size = 18,
  opacity = 1,
}: {
  src: string;
  size?: number;
  opacity?: number;
}) => (
  <img
    src={src}
    alt=""
    style={{
      width: size,
      height: size,
      objectFit: "contain",
      filter: "brightness(0) invert(1)",
      opacity,
    }}
    onError={(e) => { e.currentTarget.style.display = "none"; }}
  />
);

/* ─── Plan Banner ───────────────────────────────────────── */
function PlanBanner({
  planLabel = "Active Membership",
  planName = "Free Plan",
  subtitle,
  expiryDate,
  onRenew,
  onUpgrade,
}: {
  planLabel?: string;
  planName?: string;
  subtitle?: string;
  expiryDate?: string;
  onRenew: () => void;
  onUpgrade: () => void;
}) {
  const formattedExpiry = expiryDate
    ? new Date(expiryDate).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div
      className="w-full mt-4 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      style={{
        background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
        boxShadow: "0 10px 30px rgba(26,115,232,0.25)",
      }}
    >
      <div className="text-white">
        <div className="text-sm opacity-90">{planLabel}</div>
        <div className="text-2xl md:text-[28px] leading-none font-semibold mt-1">{planName}</div>
        {formattedExpiry && (
          <div className="text-sm opacity-90 mt-1">
            Status: Active | Expires on {formattedExpiry}
          </div>
        )}
        {subtitle && <div className="text-sm opacity-90 mt-1">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onRenew}
          className="h-10 px-4 rounded-lg text-white text-sm font-medium"
          style={{ border: "1px solid rgba(255,255,255,0.55)", background: "transparent" }}
        >
          Renew
        </button>
        <button
          onClick={onUpgrade}
          className="h-10 px-4 rounded-lg text-sm font-semibold"
          style={{ background: "#FFFFFF", color: "#111" }}
        >
          ⚡ Upgrade plan
        </button>
      </div>
    </div>
  );
}

/* ─── Plan Card ─────────────────────────────────────────── */
function PlanCard({
  selected,
  onSelect,
  onChoose,
  title,
  subtitle,
  price,
  tokens,
  extras,
  highlight,
}: {
  selected: boolean;
  onSelect: () => void;
  onChoose: () => void;
  title: string;
  subtitle: string;
  price: string;
  tokens: string;
  extras: { label: string; value: string }[];
  highlight?: string;
}) {
  const [amount, per] = price.split("/");
  return (
    <Card
      onClick={onSelect}
      className="relative cursor-pointer flex flex-col"
      style={{
        width: 220,
        height: 380,
        borderRadius: 16,
        border: "1px solid #35343C",
        background: selected ? SELECTED_CARD_BG : "#0D0D0E",
        color: "#FFFFFF",
      }}
    >
      {highlight && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full text-[10px] font-medium border border-white/25"
          style={{ background: GRAD, color: "#fff" }}
        >
          {highlight}
        </div>
      )}
      <CardHeader className="pt-4 pb-2">
        <div className="space-y-2">
          <CardTitle className='text-center font-["Inter"] font-semibold text-[26px] leading-[1]'>
            {title}
          </CardTitle>
          <div className='text-center font-["Inter"] text-[11px] leading-[1]'>{subtitle}</div>
          <div className="text-center mt-4">
            <span className='font-["Inter"] font-semibold text-[22px] leading-[1]'>{amount}</span>
            <span className='ml-1 align-middle font-["Inter"] font-normal text-[13px] leading-[1]'>
              /{per}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <div className="w-[190px] mx-auto">
          <div className='text-center font-["Inter"] text-[13px] leading-[1] whitespace-nowrap'>
            Monthly Tokens: {tokens}
          </div>
          <ul className="mt-3 space-y-2 mx-auto">
            {extras.map((e) => {
              const negative = e.value === "No" || e.value === "—";
              return (
                <li key={e.label} className="grid grid-cols-[14px_max-content_6px_1fr] gap-x-2 items-center">
                  {negative ? (
                    <X className="h-[12px] w-[12px]" />
                  ) : (
                    <Check className="h-[12px] w-[12px]" />
                  )}
                  <span className='font-["Inter"] text-[11px] leading-[1]'>{e.label}</span>
                  <span className='font-["Inter"] text-[11px] leading-[1]'>:</span>
                  <span className='font-["Inter"] text-[11px] leading-[1] font-medium'>{e.value}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-4 flex justify-center">
        <Button
          onClick={(e) => { e.stopPropagation(); onChoose(); }}
          className='font-["Inter"] text-[14px] w-[170px] h-[42px] rounded-[6px]'
          style={
            selected
              ? { background: GRAD, border: "1px solid #FFFFFF", color: "#fff" }
              : { background: "transparent", border: "1px solid #FFFFFF", color: "#fff" }
          }
          variant="ghost"
        >
          Choose Plan
        </Button>
      </CardFooter>
    </Card>
  );
}

/* ─── Subscriptions Section ─────────────────────────────── */
function SubscriptionsSection({
  user,
  onRenew,
  onUpgrade,
}: {
  user: any;
  onRenew: (plan: PlanKey, annual: boolean) => void;
  onUpgrade: (plan: PlanKey, annual: boolean) => void;
}) {
  const [annual, setAnnual] = useState(false);
  const [selected, setSelected] = useState<PlanKey>("Pro");

  const prices = { Free: 0, Pro: 799, Enterprise: 7999 } as const;
  const tokens = { Free: "5,000", Pro: "100,000", Enterprise: "1,000,000" } as const;

  const priceFor = (p: PlanKey) => {
    const m = prices[p];
    const v = annual ? Math.round(m * 0.8) : m;
    return `${INR(v)}/month`;
  };

  const currentPlan = user?.plan
    ? `${String(user.plan).charAt(0).toUpperCase() + String(user.plan).slice(1)} Plan`
    : "Free Plan";

  return (
    <div className="mt-2">
      <PlanBanner
        planLabel="Active Membership"
        planName={currentPlan}
        expiryDate={user?.currentPeriodEnd}
        subtitle="Your active subscription details"
        onRenew={() => onRenew(selected, annual)}
        onUpgrade={() => onUpgrade(selected, annual)}
      />

      <div className="mt-6 mb-5 flex items-center justify-center gap-4 text-[12px]">
        <span className="leading-none text-white/80">Billed monthly</span>

        <Switch
          id="billing-sub-tab"
          checked={annual}
          onCheckedChange={setAnnual}
          className={[
            "relative inline-flex h-5 w-9 rounded-full border border-white/20 transition-colors",
            "data-[state=checked]:border-transparent",
            "[&>span]:pointer-events-none [&>span]:block [&>span]:h-4 [&>span]:w-4 [&>span]:rounded-full [&>span]:bg-white [&>span]:transition-transform",
            "[&>span]:translate-x-0.5 data-[state=checked]:[&>span]:translate-x-[18px]",
          ].join(" ")}
          style={annual ? { background: GRAD } : { background: "#17171A" }}
        />

        <span className="leading-none text-white/80">
          Billed yearly <span className="text-white/50">(Save up to 20%)</span>
        </span>
      </div>

      <div className="mt-0 flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(3,220px)] gap-3">
          <PlanCard
            selected={selected === "Free"}
            onSelect={() => setSelected("Free")}
            onChoose={() => {
              setSelected("Free");
              onUpgrade("Free", annual);
            }}
            title="Free"
            subtitle="(Individuals)"
            price={priceFor("Free")}
            tokens={tokens.Free}
            extras={[{ label: "Extra Tokens Feature", value: "No" }]}
          />

          <PlanCard
            selected={selected === "Pro"}
            onSelect={() => setSelected("Pro")}
            onChoose={() => {
              setSelected("Pro");
              onUpgrade("Pro", annual);
            }}
            title="Pro"
            subtitle="(Individuals)"
            price={priceFor("Pro")}
            tokens={tokens.Pro}
            highlight="Most Popular"
            extras={[
              { label: "Extra Tokens Feature", value: "Yes" },
              { label: "No. of Extra Tokens", value: "50,000" },
              { label: "Extra Token Price", value: "₹200" },
            ]}
          />

          <PlanCard
            selected={selected === "Enterprise"}
            onSelect={() => setSelected("Enterprise")}
            onChoose={() => {
              setSelected("Enterprise");
              onUpgrade("Enterprise", annual);
            }}
            title="Enterprise"
            subtitle="(Organization)"
            price={priceFor("Enterprise")}
            tokens={tokens.Enterprise}
            extras={[
              { label: "Extra Tokens Feature", value: "Yes" },
              { label: "No. of Extra Tokens", value: "100,000" },
              { label: "Extra Token Price", value: "₹199" },
            ]}
          />
        </div>
      </div>

      <p className="text-center text-[11px] mt-5 text-white/40">
        {annual ? "Billed yearly (Save up to 20%)" : " "}
      </p>
    </div>
  );
}

/* ─── History Grid Card ─────────────────────────────────── */
function HistoryGridCard({
  prompt,
  showImages = true,
  playingVideo,
  onToggleVideo,
  onPreview,
  isUploaded = false,
  onDelete,
  onEdit,
  onShare,
  onRequestRefund,
}: {
  prompt: Prompt;
  showImages?: boolean;
  playingVideo: number | string | null;
  onToggleVideo: (id: number | string) => void;
  onPreview: (p: Prompt) => void;
  isUploaded?: boolean;
  onDelete?: (p: Prompt) => void;
  onEdit?: (p: Prompt) => void;
  onShare?: (p: Prompt) => void;
  onRequestRefund?: (p: Prompt) => void;
}) {
  const isPlaying = playingVideo === prompt.id;
  const priceLabel = prompt.isFree ? "FREE" : `₹${(prompt.price ?? 0).toFixed(2)}`;
  const isVideo = !showImages && !!prompt.videoUrl;
  const needsEdit = isUploaded && prompt.mediaValidation?.status === "edit_requested";
  const { user } = useAuth() as any;
  const canShareWithTeam =
    !isUploaded &&
    !!onShare &&
    user?.userType === "ORG" &&
    user?.role === "Owner";

  /* Free prompts were never charged, so there's nothing to refund — and the
     24-hour window has to close on screen as well as on the server.

     It didn't before: the button stayed on every purchase forever, so a buyer
     could open a week-old product, write out a reason, attach screenshots and
     submit, only to be told `refund_window_expired`. The deadline comes from
     the API (refundEligibleUntil) rather than being recomputed here, so what's
     offered is exactly what will be accepted. */
  const refundWindowOpen =
    prompt.refundEligible ??
    (prompt.refundEligibleUntil
      ? Date.now() < new Date(prompt.refundEligibleUntil).getTime()
      : // Older responses didn't carry the field. Showing the button and
        // letting the server refuse is friendlier than hiding a refund someone
        // is still entitled to.
        true);

  const canRefund =
    !isUploaded &&
    !!onRequestRefund &&
    !prompt.isFree &&
    !!prompt.purchaseId &&
    refundWindowOpen;
  const refundPending =
    !!prompt.refundStatus && prompt.refundStatus !== "NONE";
  const refundBadge = refundPending
    ? {
        label:
          prompt.refundStatus === "REQUESTED"
            ? "Refund Requested"
            : prompt.refundStatus === "APPROVED"
            ? "Refund Approved"
            : prompt.refundStatus === "REJECTED"
            ? "Refund Rejected"
            : "Refunded",
        bg:
          prompt.refundStatus === "REJECTED"
            ? "rgba(239,68,68,0.15)"
            : "rgba(34,197,94,0.15)",
        color: prompt.refundStatus === "REJECTED" ? "#f87171" : "#4ade80",
      }
    : null;

  // Video prompts: media fills the whole card edge-to-edge, with an
  // explicit Details button (title/description are hidden under the video
  // now, so the old "just tap the card" affordance isn't discoverable).
  if (isVideo) {
    return (
      <Card
        onClick={() => onPreview(prompt)}
        className="relative overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
        style={{ width: 260, height: 460, background: "#0B0B0B", borderRadius: 24 }}
      >
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={prompt.videoUrl}
          loop
          muted
          playsInline
          ref={(el) => {
            if (!el) return;
            if (isPlaying) el.play().catch(() => {});
            else el.pause();
          }}
        />

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleVideo(prompt.id); }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {!isPlaying && (
            <span className="w-12 h-12 rounded-full bg-black/55 hover:bg-black/70 grid place-items-center text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7-11-7z" />
              </svg>
            </span>
          )}
        </button>

        {/* Category pill */}
        <div
          className="absolute top-3 left-3 px-2 py-1 text-[10px] font-semibold text-white rounded-full"
          style={{ background: GRAD }}
        >
          {prompt.category?.toUpperCase()}
        </div>

        {/* Moderation status pill */}
        {isUploaded && getModerationBadge(prompt.mediaValidation?.status) && (
          <div
            className="absolute top-3 right-3 px-2 py-1 text-[10px] font-semibold rounded-full"
            style={{
              background: getModerationBadge(prompt.mediaValidation?.status)!.bg,
              color: getModerationBadge(prompt.mediaValidation?.status)!.color,
            }}
          >
            {getModerationBadge(prompt.mediaValidation?.status)!.label}
          </div>
        )}

        {/* Bottom scrim: title + price + details + delete/buy-again */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 pt-12 pb-3"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 60%, transparent 100%)" }}
        >
          <h3 className="text-[14px] leading-snug font-semibold text-white line-clamp-1">{prompt.title}</h3>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div
              className="flex items-center justify-center shrink-0"
              style={{ minWidth: 56, height: 32, borderRadius: 50, padding: "0 12px", background: "rgba(255,255,255,0.12)" }}
            >
              <span className="text-[12px] text-white/90">{priceLabel}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onPreview(prompt); }}
                className="text-[12px] font-medium text-white"
                style={{ height: 32, padding: "0 14px", borderRadius: 50, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                Details ›
              </button>
              {isUploaded ? (
                <>
                  {needsEdit && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onEdit?.(prompt); }}
                      className="flex items-center justify-center"
                      style={{ width: 32, height: 32, borderRadius: 50, background: "rgba(167,139,250,0.25)" }}
                      title="Admin requested changes — edit & resubmit"
                    >
                      <Pencil className="h-3.5 w-3.5 text-white/90" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete?.(prompt); }}
                    className="flex items-center justify-center"
                    style={{ width: 32, height: 32, borderRadius: 50, background: "rgba(255,255,255,0.12)" }}
                  >
                    <Trash className="h-3.5 w-3.5 text-white/90" />
                  </button>
                </>
              ) : (
                <>
                  {canShareWithTeam && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onShare?.(prompt); }}
                      className="flex items-center justify-center"
                      style={{ width: 32, height: 32, borderRadius: 50, background: "rgba(255,20,239,0.2)" }}
                      title="Share with team"
                    >
                      <Users className="h-3.5 w-3.5 text-white/90" />
                    </button>
                  )}
                  <div
                    className="flex items-center justify-center"
                    style={{ width: 32, height: 32, borderRadius: 50, background: "rgba(255,255,255,0.12)" }}
                  >
                    <img src="/icons/cop1.png" alt="cop1" className="h-3.5" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Refund control — its own row, the pill row above is already full */}
          {canRefund && (
            <div className="mt-2 flex justify-end">
              {refundBadge ? (
                <span
                  className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                  style={{ background: refundBadge.bg, color: refundBadge.color }}
                >
                  {refundBadge.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRequestRefund?.(prompt); }}
                  className="text-[11px] font-medium text-white/75 hover:text-white underline underline-offset-2"
                >
                  Request Refund
                </button>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card
      onClick={() => onPreview(prompt)}
      className="overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
      style={{ width: 260, height: 460, background: "#1C1C1C", borderRadius: 24 }}
    >
      <CardContent className="p-3 h-full flex flex-col">
        {/* MEDIA */}
        <div
          className="relative w-full overflow-hidden group"
          style={{ height: 200, borderRadius: 16, backgroundColor: "#0B0B0B" }}
        >
          <img src={prompt.imageUrl} alt={prompt.title} className="w-full h-full object-cover" />
          {/* Category pill */}
          <div
            className="absolute top-2 left-2 px-2 py-1 text-[10px] font-semibold text-white rounded-full"
            style={{ background: GRAD }}
          >
            {prompt.category?.toUpperCase()}
          </div>

          {/* Moderation status pill */}
          {isUploaded && getModerationBadge(prompt.mediaValidation?.status) && (
            <div
              className="absolute top-2 right-2 px-2 py-1 text-[10px] font-semibold rounded-full"
              style={{
                background: getModerationBadge(prompt.mediaValidation?.status)!.bg,
                color: getModerationBadge(prompt.mediaValidation?.status)!.color,
              }}
            >
              {getModerationBadge(prompt.mediaValidation?.status)!.label}
            </div>
          )}
        </div>

        {/* TEXT */}
        <div className="mt-3 px-1">
          <h3 className="text-[15px] leading-snug font-semibold text-white line-clamp-2">{prompt.title}</h3>
          {prompt.fullPrompt ? (
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/70 line-clamp-2">{prompt.fullPrompt}</p>
          ) : (
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/70 line-clamp-2">{prompt.description}</p>
          )}
        </div>

        {/* FOOTER */}
        {isUploaded ? (
          <div className="mt-auto pt-3 px-1 flex items-center justify-between">
            <div
              className="flex items-center justify-center"
              style={{ minWidth: 60, height: 36, borderRadius: 50, padding: "0 12px", background: "#333335" }}
            >
              <span className="text-[12px] text-white/90">{priceLabel}</span>
            </div>
            {needsEdit && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEdit?.(prompt); }}
                className="flex items-center justify-center"
                style={{ minWidth: 42, height: 36, borderRadius: 50, padding: "0 12px", background: "rgba(167,139,250,0.25)" }}
                title="Admin requested changes — edit & resubmit"
              >
                <Pencil className="h-3.5 w-3.5 text-white/90" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete?.(prompt); }}
              className="flex items-center justify-center"
              style={{ minWidth: 42, height: 36, borderRadius: 50, padding: "0 12px", background: "#333335" }}
            >
              <Trash className="h-3.5 w-3.5 text-white/90" />
            </button>
          </div>
        ) : (
          <div className="mt-auto pt-3 px-1">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center"
                style={{ minWidth: 42, height: 36, borderRadius: 50, background: "#333335", padding: "0 10px" }}
              >
                <img src="/icons/cop1.png" alt="cop1" className="h-4" />
              </div>
              <div
                className="flex items-center justify-center"
                style={{ minWidth: 60, height: 36, borderRadius: 50, padding: "0 12px", background: "#333335" }}
              >
                <span className="text-[12px] text-white/90">{priceLabel}</span>
              </div>
              {canShareWithTeam && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onShare?.(prompt); }}
                  className="flex items-center justify-center"
                  style={{ minWidth: 42, height: 36, borderRadius: 50, padding: "0 12px", background: "rgba(255,20,239,0.2)" }}
                  title="Share with team"
                >
                  <Users className="h-3.5 w-3.5 text-white/90" />
                </button>
              )}
            </div>

            {/* Refund control — separate row so it never squeezes the pills */}
            {canRefund && (
              <div className="mt-2 flex justify-end">
                {refundBadge ? (
                  <span
                    className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                    style={{ background: refundBadge.bg, color: refundBadge.color }}
                  >
                    {refundBadge.label}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRequestRefund?.(prompt); }}
                    className="text-[11px] font-medium text-white/70 hover:text-white underline underline-offset-2"
                  >
                    Request Refund
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Resubmit Prompt Modal (edit_requested only) ───────── */
function ResubmitPromptModal({
  prompt,
  token,
  onClose,
  onResubmitted,
}: {
  prompt: Prompt;
  token: string;
  onClose: () => void;
  onResubmitted: (updated: any) => void;
}) {
  const [title, setTitle] = useState(prompt.title || "");
  const [description, setDescription] = useState(prompt.description || "");
  const [promptText, setPromptText] = useState(prompt.promptText || prompt.fullPrompt || "");
  const [newAttachment, setNewAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const note = prompt.mediaValidation?.adminAction?.note;

  const handleSubmit = async () => {
    if (!title.trim() || !promptText.trim()) {
      setError("Title and product text are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("description", description.trim());
      fd.append("promptText", promptText.trim());
      if (newAttachment) fd.append("attachment", newAttachment);

      const res = await fetch(`${API_BASE}/api/prompt/${encodeURIComponent(String(prompt.id))}/resubmit`, {
        method: "PUT",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: fd,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || "Could not resubmit this prompt.");
      }

      onResubmitted(data.prompt);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#A78BFA]";
  const labelClass = "text-xs text-white/60 mb-1 block";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-[520px] max-w-full overflow-y-auto rounded-2xl border border-purple-500/20 bg-[#14101F] p-6 text-white"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Edit & Resubmit</h3>
            <p className="text-xs text-white/50">Only fixing what the admin flagged is required.</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>

        {note && (
          <div className="mb-4 rounded-lg border border-purple-400/30 bg-purple-500/10 px-3 py-2 text-sm text-purple-100">
            <strong>Admin requested:</strong> {note}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className={labelClass}>Title</label>
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea className={inputClass} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Product text</label>
            <textarea className={inputClass} rows={4} value={promptText} onChange={(e) => setPromptText(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>
              Replace image/video <span className="text-white/30">(optional — leave empty to keep the current one)</span>
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setNewAttachment(e.target.files?.[0] || null)}
              className="w-full text-xs text-white/60"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-5 w-full rounded-lg bg-[#A78BFA] px-5 py-2.5 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Resubmitting…" : "Resubmit for review"}
        </button>
      </div>
    </div>
  );
}

/* ─── Empty State ───────────────────────────────────────── */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-white/40">
      <ShoppingCart className="h-10 w-10 mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
const SelfDash = () => {
  // persistAuth/refreshQuota so a plan bought on this page shows up on it
  // immediately — see applyPlanFromVerify below.
  const { user, token, persistAuth, refreshQuota } = useAuth() as any;

  const displayName = user?.name?.trim() || user?.email?.split("@")?.[0] || "User";
  const avatar =
    user?.avatar?.startsWith("http")
      ? user.avatar
      : user?.avatar
      ? `${import.meta.env.VITE_API_URL || ""}${user.avatar}`
      : `https://i.pravatar.cc/160?u=${encodeURIComponent(displayName)}`;

  const location = useLocation();
  const initialParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  /* ?tab= used to be understood only when it said "prompts", so every other
     deep link — most importantly ?tab=subscription, where the Subscription
     page sends someone straight after paying — silently landed on the
     dashboard tab instead. Validated against the real tab list now. */
  const readTabParam = (raw: string | null): DashTab | null =>
    raw && (VALID_DASH_TABS as readonly string[]).includes(raw) ? (raw as DashTab) : null;

  const [activeTab, setActiveTab] = useState<DashTab>(
    () => readTabParam(initialParams.get("tab")) ?? "dashboard"
  );
  const [promptsTab, setPromptsTab] = useState<PromptsTab>(
    initialParams.get("p") === "uploaded" ? "uploaded" : "purchased"
  );

  // The account menu links here while the user may already be on this page —
  // without this, the URL changes but the visible tab doesn't.
  useEffect(() => {
    const tab = readTabParam(initialParams.get("tab"));
    const p = initialParams.get("p");
    if (tab) setActiveTab(tab);
    if (p === "purchased" || p === "uploaded") setPromptsTab(p);
  }, [initialParams]);

  /* The clock next to the date. Ticks on the minute rather than every second —
     it only ever shows hours and minutes, so a per-second interval would be
     re-rendering the dashboard 59 times for nothing. */
  const [clockLabel, setClockLabel] = useState(formatClock);
  useEffect(() => {
    const id = window.setInterval(() => setClockLabel(formatClock()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(toDateValue(new Date()));
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d;
  });

  /* ── Purchased state ── */
  const [purchaseHistory, setPurchaseHistory] = useState<Prompt[]>([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [purchasesError, setPurchasesError] = useState<string | null>(null);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
const [acceptingRequestId, setAcceptingRequestId] = useState<string | number | null>(null);
  /* ── Uploaded state ── */
  const [uploadHistory, setUploadHistory] = useState<Prompt[]>([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [uploadsError, setUploadsError] = useState<string | null>(null);

  /* ── Details ── */
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsPrompt, setDetailsPrompt] = useState<MarketplacePrompt | null>(null);
  const [playingVideo, setPlayingVideo] = useState<number | string | null>(null);
   
const [creatingPlan, setCreatingPlan] = useState(false);

const ensureRazorpay = () =>
  new Promise<void>((resolve, reject) => {
    if ((window as any).Razorpay) return resolve();

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("razorpay_script_load_failed"));
    document.body.appendChild(script);
  });

const openCheckout = ({
  key,
  order,
}: {
  key: string;
  order: any;
}) => {
  return new Promise<{
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }>((resolve, reject) => {
    const rzp = new (window as any).Razorpay({
      key,
      order_id: order.id,
      name: "Tokun.world",
      description: "Subscription Payment",
      /* `contact: user?.phone || "9999999999"` was here. User has no phone
         field, so that fallback fired every single time and shipped a fake
         number to Razorpay. The field is now left empty for the payer to fill.
         Same for the email/name fallbacks — a real value or nothing. */
      prefill: {
        ...(user?.name ? { name: user.name } : {}),
        ...(user?.email ? { email: user.email } : {}),
      },
      notes: order.notes || {},
      handler: (response: any) => {
        resolve(response);
      },
      modal: {
        ondismiss: () => reject(new Error("checkout_dismissed")),
      },
    });

    rzp.open();
  });
};

const verifyUserPayment = async (payload: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) => {
  const res = await fetch(VERIFY_USER_PAYMENT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paymentId: payload.razorpay_payment_id,
      orderId: payload.razorpay_order_id,
      signature: payload.razorpay_signature,
    }),
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data?.success) {
    throw new Error(data?.error || `verify_failed_${res.status}`);
  }

  return data;
};

/* Nothing used to touch the signed-in user after a subscription verified, so
   the page kept rendering the plan it had cached at login — "Free Plan" on a
   banner belonging to someone who had just paid for Pro. It only corrected
   itself whenever something else happened to refresh the account, which is
   the delay you'd see.

   The verify response already carries the authoritative plan, cycle and period
   end, so those go into the auth context straight away; refreshQuota() then
   follows up with the new token allowance. */
const applyPlanFromVerify = (data: any) => {
  const patch: Record<string, any> = {};
  if (data?.plan) patch.plan = data.plan;
  if (data?.billingCycle) patch.billingCycle = data.billingCycle;
  if (data?.currentPeriodEnd) patch.currentPeriodEnd = data.currentPeriodEnd;

  if (Object.keys(patch).length) persistAuth?.({ user: patch });

  // Token limits, extra-token balance and org pool live behind /api/quota —
  // not in the verify response. Fire and forget; the banner above doesn't
  // wait on it.
  refreshQuota?.().catch?.(() => {});
};

const startUserSubscriptionPurchase = async (
  plan: PlanKey,
  annual: boolean
) => {
  const planKey = toServerPlanKey(plan);

  if (!planKey) {
    toast({
      title: "Invalid plan",
      description: "Enterprise plan uses organization checkout.",
    });
    return;
  }

  if (creatingPlan) return;

  setCreatingPlan(true);

  try {
    const authToken = token || getAuthToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const res = await fetch(CREATE_USER_ORDER_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        planKey,
        billingCycle: toBillingCycle(annual),
      }),
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.success) {
      throw new Error(data?.error || `create_order_failed_${res.status}`);
    }

    if (data?.free === true || data?.message === "no_payment_required") {
      toast({
        title: "Plan updated",
        description: "Free plan activated successfully.",
      });
      return;
    }

    await ensureRazorpay();

    const checkoutRes = await openCheckout({
      key: data.key,
      order: data.order,
    });

    const verified = await verifyUserPayment(checkoutRes);

    applyPlanFromVerify(verified);
    // Already on the dashboard — put the plan they just bought in front of
    // them rather than leaving them on whichever tab they started from.
    setActiveTab("subscription");

    toast({
      title: "Payment successful",
      description: `${plan} plan activated successfully.`,
    });
  } catch (err: any) {
    if (err?.message === "checkout_dismissed") {
      toast({
        title: "Checkout closed",
        description: "Payment was not completed.",
      });
    } else {
      toast({
        title: "Subscription failed",
        description: err?.message || "Could not start subscription payment.",
      });
    }
  } finally {
    setCreatingPlan(false);
  }
};

const startEnterpriseSubscriptionPurchase = async (annual: boolean) => {
  if (creatingPlan) return;

  const authToken = token || getAuthToken();

  if (!authToken) {
    toast({
      title: "Login required",
      description: "Please login again.",
    });
    return;
  }

  const orgId = user?.orgId || null;

  if (!orgId) {
    toast({
      title: "Organization missing",
      description: "We could not find your Organization ID.",
    });
    return;
  }

  setCreatingPlan(true);

  try {
    const res = await fetch(CREATE_ORG_ORDER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        orgId,
        billingCycle: toBillingCycle(annual),
        planKey: "enterprise",
      }),
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.success) {
      throw new Error(data?.error || `create_org_order_failed_${res.status}`);
    }

    await ensureRazorpay();

    const checkoutRes = await openCheckout({
      key: data.key,
      order: data.order,
    });

    const verifyRes = await fetch(VERIFY_ORG_PAYMENT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        paymentId: checkoutRes.razorpay_payment_id,
        orderId: checkoutRes.razorpay_order_id,
        signature: checkoutRes.razorpay_signature,
      }),
      credentials: "include",
    });

    const verifyJson = await verifyRes.json().catch(() => ({}));

    if (!verifyRes.ok || !verifyJson?.success) {
      throw new Error(
        verifyJson?.error || `verify_org_failed_${verifyRes.status}`
      );
    }

    applyPlanFromVerify(verifyJson);
    setActiveTab("subscription");

    toast({
      title: "Payment successful",
      description: "Enterprise plan activated successfully.",
    });
  } catch (err: any) {
    if (err?.message === "checkout_dismissed") {
      toast({
        title: "Checkout closed",
        description: "Payment was not completed.",
      });
    } else {
      toast({
        title: "Enterprise checkout failed",
        description: err?.message || "Could not complete enterprise payment.",
      });
    }
  } finally {
    setCreatingPlan(false);
  }
};

const startSubscriptionPurchase = async (
  plan: PlanKey,
  annual: boolean
) => {
  if (plan === "Enterprise") {
    await startEnterpriseSubscriptionPurchase(annual);
    return;
  }

  await startUserSubscriptionPurchase(plan, annual);
};
// Existing useEffects ke saath
const [hireEarnings, setHireEarnings] = useState<{
  totalEarnings: number;
  totalDeals: number;
  totalProjects?: number;
  activeRequests?: number;
  requests: any[];
  projects: any[];
  deals: any[];
}>({
  totalEarnings: 0,
  totalDeals: 0,
  totalProjects: 0,
  activeRequests: 0,
  requests: [],
  projects: [],
  deals: [],
});

const fetchHireEarnings = async () => {
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/hire/my/earnings`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok || !data?.success) {
      throw new Error(data?.error || "Failed to fetch hire earnings");
    }

    setHireEarnings({
      totalEarnings: Number(data.totalEarnings || 0),
      totalDeals: Number(data.totalDeals || 0),
      totalProjects: Number(data.totalProjects || data.totalDeals || 0),
      activeRequests: Number(data.activeRequests || 0),
      requests: Array.isArray(data.requests) ? data.requests : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      deals: Array.isArray(data.deals) ? data.deals : [],
    });
  } catch (err) {
    console.error("Hire earnings fetch failed:", err);
  }
};

useEffect(() => {
  fetchHireEarnings();
}, [token]);

// Route payout setup — drives the "set up your payout account" banner below.
const [hasPayoutSetup, setHasPayoutSetup] = useState<boolean | null>(null);
// Server's answer to "may this account sell at all". False only for team
// members, whose org lists and gets paid on its own Route account. Defaults to
// true so an existing seller never loses their payout banners while the first
// payout-status response is still in flight.
const [canSell, setCanSell] = useState(true);
// CREATED | UNDER_REVIEW | NEEDS_CLARIFICATION | SUSPENDED | REJECTED | ACTIVATED | null
const [activationStatus, setActivationStatus] = useState<string | null>(null);
const [payoutAccountId, setPayoutAccountId] = useState<string | null>(null);
const [payoutMessage, setPayoutMessage] = useState<string | null>(null);
const [payoutRequirements, setPayoutRequirements] = useState<any[]>([]);
const [payoutSubmittedDetails, setPayoutSubmittedDetails] = useState<any[]>([]);
const [requiresResubmission, setRequiresResubmission] = useState(false);
const [sellerFormOpen, setSellerFormOpen] = useState(false);
const [clarificationModalOpen, setClarificationModalOpen] = useState(false);
const [clarificationReviewModalOpen, setClarificationReviewModalOpen] = useState(false);
const [clarificationInputs, setClarificationInputs] = useState<Record<string, string>>({});
const [clarificationSubmitting, setClarificationSubmitting] = useState(false);

const fetchPayoutStatus = async () => {
  if (!token) return;
  try {
    const res = await fetch(`${API_BASE}/api/bankaccount/payout-status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok && data?.success) {
      // Absent on older responses — treat a missing field as "can sell" rather
      // than hiding a real seller's payout setup.
      setCanSell(data.canSell !== false);
      setHasPayoutSetup(Boolean(data.hasPayoutSetup));
      setActivationStatus(data.activationStatus || null);
      setPayoutAccountId(data.accountId || null);
      setPayoutMessage(data.message || null);
      const requirements = Array.isArray(data.requirements) ? data.requirements : [];
      const submittedDetails = Array.isArray(data.submittedDetails) ? data.submittedDetails : [];
      setPayoutRequirements(requirements);
      setPayoutSubmittedDetails(submittedDetails);
      setRequiresResubmission(Boolean(data.requiresResubmission));

      // Only fields Razorpay actually flagged as wrong are editable — it
      // rejects the whole submission if any other field is included, so
      // there's no point letting the seller edit anything else. Prefill
      // those with what was actually submitted, so they edit the existing
      // value instead of retyping from a blank box. Doesn't clobber
      // anything they're already mid-typing.
      const flaggedRefs = new Set(requirements.map((r: any) => r.field_reference));
      setClarificationInputs((prev) => {
        const next = { ...prev };
        submittedDetails.forEach((d: any) => {
          if (d.fieldReference && flaggedRefs.has(d.fieldReference) && next[d.fieldReference] === undefined) {
            next[d.fieldReference] = d.value || "";
          }
        });
        return next;
      });
    }
  } catch (err) {
    console.error("Payout status fetch failed:", err);
  }
};

useEffect(() => {
  fetchPayoutStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [token]);

// Only flagged fields are editable and prefilled with the current value, so
// only actually-changed fields get submitted (unchanged ones would otherwise
// trigger a pointless re-PATCH to Razorpay every time). The backend groups
// whatever's sent by scope (e.g. all "settlements.*" fields become a single
// Razorpay PATCH instead of one call per field).
const submitAllClarifications = async () => {
  const updates = payoutSubmittedDetails
    .filter((d) => d.fieldReference)
    .map((d) => ({
      fieldReference: d.fieldReference as string,
      value: (clarificationInputs[d.fieldReference] ?? "").trim(),
      original: (d.value || "").trim(),
    }))
    .filter((u) => u.value && u.value !== u.original)
    .map(({ fieldReference, value }) => ({ fieldReference, value }));

  if (!updates.length || !payoutAccountId) return;

  setClarificationSubmitting(true);
  try {
    const res = await fetch(`${API_BASE}/api/bankaccount/${payoutAccountId}/resolve-clarification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ updates }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.success) {
      toast({
        title: "Couldn't update these fields",
        description: data?.message || "Please try again.",
      });
      return;
    }

    const skippedFields: string[] = Array.isArray(data.skippedFields) ? data.skippedFields : [];
    if (skippedFields.length) {
      const skippedLabels = skippedFields
        .map((ref) => payoutSubmittedDetails.find((d) => d.fieldReference === ref)?.label || ref)
        .join(", ");
      toast({
        title: "Some edits weren't sent",
        description: `${skippedLabels} — Razorpay hasn't flagged ${skippedFields.length > 1 ? "these" : "this"} field${skippedFields.length > 1 ? "s" : ""} for clarification, so ${skippedFields.length > 1 ? "they weren't" : "it wasn't"} submitted.`,
      });
    }
    setClarificationInputs({});
    // Close the edit popup and show a "please wait" confirmation instead —
    // Razorpay's re-check isn't instant, so this stops the seller from
    // immediately resubmitting the same fields again.
    setClarificationModalOpen(false);
    setClarificationReviewModalOpen(true);
    await fetchPayoutStatus();
  } catch (err) {
    console.error("Resolve clarification failed:", err);
    toast({ title: "Something went wrong", description: "Please try again." });
  } finally {
    setClarificationSubmitting(false);
  }
};


useEffect(() => {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === "tokun:lastRelease") {
      fetchHireEarnings();
    }
  };
  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}, [token]);



const handleAcceptRequest = async (item: any) => {
  const dealId = item?.id || item?.raw?._id;

  if (!dealId) {
    toast({
  title: "Deal not found",
  description: "Could not find the request deal ID. Please refresh.",
});

    return;
  }

  if (!token) {
    toast({
      title: "Login required",
      description: "Please login again.",
    });
    return;
  }

  try {
    setAcceptingRequestId(dealId);

    const res = await fetch(`${API_BASE}/api/hire/${dealId}/accept`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json().catch(() => ({}));

    // `message` first: the payout-account gate answers with a sentence the
    // freelancer can act on, while `error` is a slug like
    // "payout_account_not_active".
    if (!res.ok || !data?.success) {
      throw new Error(data?.message || data?.error || "Failed to accept proposal");
    }

   toast({
  title: "Project accepted",
  description: "Request moved to Active Projects.",
});

    await fetchHireEarnings();
    setActiveTab("dashboard");
  } catch (err: any) {
    toast({
      title: "Accept failed",
      description: err?.message || "Could not accept request.",
    });
  } finally {
    setAcceptingRequestId(null);
  }
};






  const onToggleVideo = (id: number | string) => setPlayingVideo((prev) => (prev === id ? null : id));
  const openDetails = (p: Prompt) => {
    setDetailsPrompt(p as unknown as MarketplacePrompt);
    setDetailsOpen(true);
  };

  /* ── Fetch purchased ── */
  const fetchPurchaseHistory = async () => {
    if (!token) return;
    try {
      setPurchasesLoading(true);
      setPurchasesError(null);
      const res = await fetch(`${PURCHASE_BASE}/history`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const body = await res.json();
      if (!res.ok || !body?.success) throw new Error(body?.error || "server_error");

      const mapped: Prompt[] = (body.purchases || []).map((p: any) => {
        const snap = p?.promptSnapshot || {};
        const pop = p?.prompt;
        const promptId = (pop && typeof pop === "object" && pop._id) || (typeof pop === "string" ? pop : p?._id);
        const title = (pop && typeof pop === "object" && pop.title) || snap.title || "Untitled";
        const description = snap.description || "";
        const promptText = snap.promptText || "";
        const fullPrompt = snap.promptText || promptText || " ";
        const pricePaid = typeof p?.pricePaid === "number" ? p.pricePaid : snap.originalPrice || 0;
        const isFree = snap.originalPrice === 0 || pricePaid === 0;
        const att = snap.attachment || null;
        const mediaPath = att?.path || undefined;
        const imageUrl = att?.type === "image" ? mediaPath : undefined;
        const videoUrl = att?.type === "video" ? mediaPath : undefined;
        const category = resolveCategory(pop, snap, p);
        return {
          id: String(promptId || p._id),
          title, description, category,
          price: pricePaid, imageUrl, videoUrl,
          preview: description || (promptText ? String(promptText).slice(0, 140) : ""),
          isFree, purchasedAt: p?.purchasedAt,
          isUploadedByMe: false, promptText, fullPrompt,
          purchaseId: String(p?._id || ""),
          refundStatus: p?.refundStatus || "NONE",
          /* When the refund window shuts, as computed by the server from
             REFUND_WINDOW_HOURS — the same value POST /refund-request enforces.
             Not recalculated here from purchasedAt: a hardcoded "24" in the
             browser would disagree with the server the moment that env var
             changes, and offer a refund the API then refuses. */
          refundEligibleUntil: p?.refundEligibleUntil || null,
          refundEligible: !!p?.refundEligible,
        } as Prompt;
      });

      mapped.sort((a, b) => {
        const ta = a.purchasedAt ? new Date(a.purchasedAt).getTime() : 0;
        const tb = b.purchasedAt ? new Date(b.purchasedAt).getTime() : 0;
        return tb - ta;
      });
      setPurchaseHistory(mapped);
    } catch (err: any) {
      setPurchasesError(err?.message || "Failed to load purchase history");
    } finally {
      setPurchasesLoading(false);
    }
  };

  /* ── Request refund (buyer) ──
     Same dialog as components/PromptHistory.tsx, because the purchased-prompts
     grid exists on both screens. The reason list and the composing rule live in
     lib/refundReasons so the two can't drift apart again — this one kept a bare
     textarea after the other grew a tick list, so the same action asked for
     different things depending on where you started. */
  const [refundTarget, setRefundTarget] = useState<Prompt | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundReasonTicks, setRefundReasonTicks] = useState<string[]>([]);
  const [refundFiles, setRefundFiles] = useState<File[]>([]);
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  // Matches the multer limits on POST /:purchaseId/refund-request.
  const MAX_REFUND_FILES = 5;
  const MAX_REFUND_FILE_MB = 5;

  const addRefundFiles = (picked: FileList | null) => {
    if (!picked?.length) return;
    const incoming = Array.from(picked);

    const tooBig = incoming.find((f) => f.size > MAX_REFUND_FILE_MB * 1024 * 1024);
    if (tooBig) {
      toast({ title: "Image too large", description: `Each image must be under ${MAX_REFUND_FILE_MB}MB.` });
      return;
    }

    setRefundFiles((prev) => {
      const room = MAX_REFUND_FILES - prev.length;
      if (room <= 0) {
        toast({ title: "Limit reached", description: `You can attach up to ${MAX_REFUND_FILES} images.` });
        return prev;
      }
      return [...prev, ...incoming.slice(0, room)];
    });
  };

  const removeRefundFile = (index: number) =>
    setRefundFiles((prev) => prev.filter((_, i) => i !== index));

  const toggleRefundReason = (reason: string) =>
    setRefundReasonTicks((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );

  const refundReasonGiven = hasRefundReason(refundReasonTicks, refundReason);

  const openRefundModal = (p: Prompt) => {
    setRefundReason("");
    setRefundReasonTicks([]);
    setRefundFiles([]);
    setRefundTarget(p);
  };

  const submitRefundRequest = async () => {
    if (!refundTarget?.purchaseId || !refundReasonGiven) return;
    try {
      setRefundSubmitting(true);
      /* Multipart, since screenshots can ride along. No Content-Type header on
         purpose — the browser must set it to include the multipart boundary. */
      const form = new FormData();
      /* Two fields, deliberately separate: `reason` is what the buyer ticked,
         `description` is what they typed. The admin queue labels and counts them
         differently, which it cannot do if they arrive concatenated. */
      form.append("reason", composeRefundReason(refundReasonTicks));
      if (refundReason.trim()) form.append("description", refundReason.trim());
      refundFiles.forEach((file) => form.append("attachments", file));

      const res = await fetch(
        `${PURCHASE_BASE}/${encodeURIComponent(refundTarget.purchaseId)}/refund-request`,
        {
          method: "POST",
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          credentials: "include",
          body: form,
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        const errorMessages: Record<string, string> = {
          refund_window_expired: "The refund window for this purchase has closed.",
          refund_already_requested: "You've already requested a refund for this purchase.",
          refund_already_approved: "This purchase has already been refunded.",
          refund_already_rejected: "A refund request for this purchase was already rejected.",
        };
        throw new Error(errorMessages[data?.error] || data?.error || "Could not submit refund request.");
      }

      setPurchaseHistory((prev) =>
        prev.map((p) =>
          p.purchaseId === refundTarget.purchaseId ? { ...p, refundStatus: "REQUESTED" } : p
        )
      );
      toast({ title: "Refund requested", description: "We'll email you once an admin reviews it." });
      setRefundTarget(null);
    } catch (err: any) {
      toast({
        title: "Refund request failed",
        description: err?.message || "Please try again.",
      });
    } finally {
      setRefundSubmitting(false);
    }
  };

  /* ── Fetch uploaded ── */
  const fetchUploadHistory = async () => {
    if (!token) return;
    try {
      setUploadsLoading(true);
      setUploadsError(null);
      const res = await fetch(`${API_BASE}/api/prompt/my`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || "server_error");

      const mapped: Prompt[] = (data.prompts || []).map((doc: any) => {
        const id = doc._id;
        const title = doc.title || "Untitled";
        const description = doc.description || "";
        const promptText = doc.promptText || "";
        const fullPrompt = promptText;
        const price = Number(doc.price || 0);
        const isFree = !!doc.free;
        const rating = typeof doc.averageRating === "number" ? doc.averageRating : 0;
        const uploadedAt = doc.createdAt;
        const category =
          (doc.categories?.[0]?.name as string) ||
          (Array.isArray(doc.categories) ? doc.categories.join(", ") : "") ||
          "General";
        const att = doc.attachment || null;
        const mediaPath = att?.path || undefined;
        const imageUrl = att?.type === "image" ? mediaPath : undefined;
        const videoUrl = att?.type === "video" ? mediaPath : undefined;
        const sales = Number(doc.sales ?? doc.purchases ?? doc.totalSales ?? doc.totalPurchases ?? doc.salesCount ?? doc.purchaseCount ?? doc.orderCount ?? 0);
        /* No `sales * price` fallback. That was the last one in the chain, and
           it is not a worse estimate of the seller's earnings — it is a
           different quantity: what buyers spent, before commission. The server
           sends `totalRevenue` (what was actually transferred) on every listing,
           so reaching the fallback means the number is unknown, and 0 says that
           honestly. */
        const revenue = Number(doc.revenue ?? doc.totalRevenue ?? doc.totalEarning ?? doc.earnings ?? 0);
        return {
          id, title, description, category, price, rating,
          downloads: doc.downloads || 0, sales, revenue,
          imageUrl, videoUrl,
          preview: description || (promptText?.slice(0, 140) || ""),
          isFree, uploadedAt, isUploadedByMe: true, promptText, fullPrompt,
          mediaValidation: doc.mediaValidation,
        } as Prompt;
      });
      setUploadHistory(mapped);
    } catch (err: any) {
      setUploadsError(err?.message || "Failed to load uploads");
    } finally {
      setUploadsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseHistory();
    fetchUploadHistory();
    const onNewPurchase = (e: any) => {
      try {
        const purchase = e?.detail;
        if (!purchase) return;
        const snap = purchase?.promptSnapshot || {};
        const pop = purchase?.prompt;
        const promptId = (pop && typeof pop === "object" && pop._id) || (typeof pop === "string" ? pop : purchase?._id);
        const title = (pop && typeof pop === "object" && pop.title) || snap.title || "Untitled";
        const description = snap.description || "";
        const promptText = snap.promptText || "";
        const fullPrompt = snap.promptText || promptText || " ";
        const pricePaid = typeof purchase?.pricePaid === "number" ? purchase.pricePaid : snap.originalPrice || 0;
        const isFree = snap.originalPrice === 0 || pricePaid === 0;
        const att = snap.attachment || null;
        const mediaPath = att?.path || undefined;
        const imageUrl = att?.type === "image" ? mediaPath : undefined;
        const videoUrl = att?.type === "video" ? mediaPath : undefined;
        const mappedOne: Prompt = {
          id: String(promptId || purchase._id),
          title, description,
          category: resolveCategory(pop, snap, purchase),
          price: pricePaid, imageUrl, videoUrl,
          preview: description || (promptText ? String(promptText).slice(0, 140) : ""),
          isFree, purchasedAt: purchase?.purchasedAt, promptText, fullPrompt,
          purchaseId: String(purchase?._id || ""),
          refundStatus: purchase?.refundStatus || "NONE",
        };
        setPurchaseHistory((prev) => {
          if (prev.some((x) => String(x.id) === String(mappedOne.id))) return prev;
          return [mappedOne, ...prev];
        });
      } catch (_) {}
    };
    window.addEventListener("tokun:purchased" as any, onNewPurchase);
    return () => window.removeEventListener("tokun:purchased" as any, onNewPurchase);
  }, [token]);

  /* ── Delete uploaded ── */
  const handleDeletePrompt = async (p: Prompt) => {
    const id = String(p.id);
    const ok = window.confirm("Delete this product permanently?");
    if (!ok) return;
    try {
      const res = await fetch(`${API_BASE}/api/prompt/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) throw new Error(data?.error || `Failed to delete (${res.status})`);
      setUploadHistory((prev) => prev.filter((x) => String(x.id) !== id));
      if (detailsOpen && detailsPrompt && String((detailsPrompt as any).id) === id) setDetailsOpen(false);
      toast({ title: "Deleted", description: "Product removed from your uploads." });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err?.message || "Could not delete." });
    }
  };

  /* ── Resubmit (edit-requested prompts only) ── */
  const [resubmitTarget, setResubmitTarget] = useState<Prompt | null>(null);
  const [shareTarget, setShareTarget] = useState<Prompt | null>(null);

  /* ── Totals ── */
  const totalPurchasedBill = purchaseHistory.reduce((sum, p) => sum + (p.price || 0), 0);

  /* What actually reached the seller's payout account, not what the listings
     advertise.

     This was `sales × price` — the list price times the number of sales, which
     is the money the BUYERS spent, before Tokun's seller commission comes off
     the top. On a ₹1,000 prompt the seller is transferred ₹900, so every sale
     overstated their earnings by ₹100, and the figure grew further apart the
     more they sold.

     `revenue` is the right number and was already on the object: the server
     keeps `Prompt.totalRevenue` as a running sum of exactly what was
     transferred per sale — net of commission, and INCLUDING a Refer & Earn
     commission-free sale, where the seller really did keep the full list price.
     That is not something a multiplication here could ever have worked out. */
  const totalEarningsINR = uploadHistory.reduce((sum, p) => sum + (p.revenue ?? 0), 0);





const normalizeStatus = (status?: string) =>
  String(status || "").trim().toUpperCase();

const getHireDealId = (item: any, index: number, prefix: string) =>
  String(
    item?._id ||
      item?.id ||
      item?.dealId ||
      item?.raw?._id ||
      `${prefix}-${index}`
  );

const allHireDealMap = new Map<string, any>();

[
  ...(hireEarnings.requests || []),
  ...(hireEarnings.projects || []),
  ...(hireEarnings.deals || []),
].forEach((item, index) => {
  const id = getHireDealId(item, index, "hire");
  allHireDealMap.set(id, item);
});

const allHireDeals = Array.from(allHireDealMap.values());

const isAcceptedDeal = (deal: any) => {
  const status = normalizeStatus(deal?.status);

  return (
    [
      "ACCEPTED_WAITING_PAYMENT",
      "FUNDED",
      "IN_PROGRESS",
      "WORK_SUBMITTED",
      "REVISION_REQUESTED",
      "COMPLETED",
      "DELIVERED",
    ].includes(status) ||
    !!deal?.acceptedAt ||
    !!deal?.workStartedAt ||
    !!deal?.workSubmittedAt ||
    !!deal?.completedAt
  );
};

const isDeliveredDeal = (deal: any) => {
  const status = normalizeStatus(deal?.status);

  return (
    ["COMPLETED", "DELIVERED", "PAYMENT_RELEASED", "RELEASED"].includes(
      status
    ) ||
    !!deal?.completedAt ||
    !!deal?.releasedAt ||
    !!deal?.paymentReleasedAt
  );
};

const totalRequestsAccepted = allHireDeals.filter(isAcceptedDeal).length;
const totalRequestsDelivered = allHireDeals.filter(isDeliveredDeal).length;

const calculatedSuccessRate =
  totalRequestsAccepted > 0
    ? Math.round((totalRequestsDelivered / totalRequestsAccepted) * 1000) / 10
    : 0;

const successRateLabel = `${calculatedSuccessRate}%`;
const successRateBadge =
  totalRequestsAccepted > 0
    ? `${totalRequestsDelivered}/${totalRequestsAccepted}`
    : "0/0";








  /* ── Calendar ── */
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  /* This picker reads a date, it doesn't book one — every figure on the page
     behind it is something that already happened. Tomorrow was selectable, and
     picking it just relabelled the header with a date no data could exist for.
     Midnight local, so "today" itself stays available all day. */
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  // Paging past the current month would land on a grid where every day is
  // disabled, so the arrow that gets you there is switched off instead.
  const atCurrentMonth =
    year === todayStart.getFullYear() && month === todayStart.getMonth();

  /* ── Stats data ── */
  const stats = [
  {
    title: "ACTIVE REQUESTS",
    value: String(hireEarnings.activeRequests || 0),
    badge: `+${hireEarnings.activeRequests || 0}`,
    badgeColor: "#19E66C",
  },
  {
    title: "EARNINGS",
    value: `₹${(totalEarningsINR + hireEarnings.totalEarnings).toLocaleString()}`,
    badge: "+19%",
    badgeColor: "#DDB7FF",
  },
  {
    title: "TOTAL PROJECTS",
    value: String(hireEarnings.totalProjects ?? hireEarnings.totalDeals ?? 0),
    badge: `+${hireEarnings.totalProjects ?? hireEarnings.totalDeals ?? 0}`,
    badgeColor: "#DDB7FF",
  },
 {
  title: "SUCCESS RATE",
  value: successRateLabel,
  badge: successRateBadge,
  badgeColor:
    calculatedSuccessRate >= 70
      ? "#19E66C"
      : calculatedSuccessRate >= 40
      ? "#FABC4E"
      : "#FF6B6B",
},
];

const activeProjects = (hireEarnings.projects || []).map((project: any, index: number) => {
  const amount = Number(project.amount || project.budget || 0);
  const status = project.status || "ACCEPTED_WAITING_PAYMENT";

 return {
  id: project._id || index + 1,
  title: project.title || "Active Project",
  user: project.clientName || project.clientId?.name || "Client",
  price: INR(amount),
  budget: amount,
  status,
  statusText: formatProjectStatus(status),
  start: formatShortDate(project.acceptedAt || project.createdAt),
  finish: formatShortDate(project.deliveryDate),
  progress: getProjectProgress(status),
  desc: project.description || "Project accepted from client. Work progress will appear here.",
  description: project.description || "",
  deliveryDate: project.deliveryDate,
  createdAt: project.createdAt,
  acceptedAt: project.acceptedAt,

  fundsStatus: project.fundsStatus,
  paymentStatus: project.paymentStatus,
  workStartedAt: project.workStartedAt,
  workSubmittedAt: project.workSubmittedAt,
  deliverables: project.deliverables || [],
  submissionNote: project.submissionNote || "",
  revisions: project.revisions || [],

  raw: project,
};
});

const allRequests = (hireEarnings.requests || []).map((request: any, index: number) => {
  const amount = Number(request.amount || request.budget || 0);
  const status = request.status || "PENDING_ACCEPTANCE";

  return {
    id: request._id || index + 1,
    title: request.title || "Project Request",
    user: request.clientName || request.clientId?.name || "Client",
    price: INR(amount),
    budget: amount,
    status,
    statusText: formatProjectStatus(status),
    time: formatShortDate(request.createdAt),
    desc: request.description || "Client sent you a project request.",
    description: request.description || "",
    deliveryDate: request.deliveryDate,
    createdAt: request.createdAt,
    raw: request,
  };
});

 

  /* ── Nav button ── */
  const navItemStyle: React.CSSProperties = {
    fontFamily: "Inter, sans-serif",
    fontWeight: 700,
    fontSize: 13,
    lineHeight: "100%",
    letterSpacing: "0.4px",
  };

  const NavButton = ({ id, label, icon }: { id: DashTab; label: string; icon: string }) => {
    const active = activeTab === id;
    return (
      <button
        type="button"
        onClick={() => setActiveTab(id)}
        className={`flex h-[38px] shrink-0 items-center gap-2 rounded-[7px] px-4 lg:h-[41px] lg:w-full lg:gap-3 ${
          active ? "text-white" : "text-white/35 hover:bg-white/5"
        }`}
        style={{ ...navItemStyle, background: active ? GRADIENT : "transparent" }}
      >
        <WhiteIcon src={icon} opacity={active ? 1 : 0.35} />
        <span className="whitespace-nowrap">{label}</span>
      </button>
    );
  };

  /* ── Request Card ── */
const RequestCard = ({ item }: { item: any }) => {
  const isAccepting = acceptingRequestId === item.id;

  return (
    <div
      style={{
        borderRadius: 16,
        background: "#FFFFFF05",
        border: "1px solid #FFFFFF0F",
        padding: "16px 12px 18px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: 14,
              lineHeight: "100%",
              color: "#FFFFFF",
            }}
          >
            {item.title}
          </h3>

          <p
            style={{
              margin: "5px 0 0",
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: 11,
              lineHeight: "100%",
              color: "#71717A",
            }}
          >
            {item.user} • {item.time}
          </p>
        </div>

        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: 12,
            lineHeight: "100%",
            color: "#DDB7FF",
            flexShrink: 0,
          }}
        >
          {item.price}
        </span>
      </div>

      <p
        style={{
          margin: "9px 0 0",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 12,
          lineHeight: "16px",
          color: "#71717A",
        }}
      >
        {item.desc}
      </p>

      <div style={{ marginTop: 10 }}>
        <span
          style={{
            height: 22,
            padding: "0 10px",
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: 9,
            lineHeight: "100%",
            letterSpacing: "0.8px",
            ...getProjectStatusStyle(item.status),
          }}
        >
          {item.statusText || formatProjectStatus(item.status)}
        </span>
      </div>

      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
        <button
          type="button"
          disabled={isAccepting}
          onClick={() => handleAcceptRequest(item)}
          style={{
            flex: 1,
            minWidth: 0,
            height: 35,
            borderRadius: 8,
            border: "none",
            background: GRADIENT,
            color: "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: 12,
            lineHeight: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            cursor: isAccepting ? "not-allowed" : "pointer",
            opacity: isAccepting ? 0.6 : 1,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isAccepting ? "Accepting..." : "Accept Proposal"}
        </button>

        <button
          type="button"
          style={{
            flex: 1,
            minWidth: 0,
            height: 35,
            borderRadius: 8,
            border: "1px solid #FFFFFF0D",
            background: "#202020",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: 12,
            lineHeight: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          <WhiteIcon src="/icons/counter.svg" size={13} />
          Counter Offer
        </button>

        <button
          type="button"
          style={{
            width: 35,
            height: 35,
            flexShrink: 0,
            borderRadius: 8,
            border: "none",
            background: GRADIENT,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          <WhiteIcon src="/icons/crass.svg" size={14} />
        </button>
      </div>
    </div>
  );
};

  /* ══ TAB CONTENTS ══════════════════════════════════════ */

  /* Dashboard */
  const DashboardContent = () => (
    <>
      <div className="relative z-10 mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-8 lg:grid-cols-4 lg:gap-7" style={{ filter: showCalendar ? "blur(3px)" : "none", opacity: showCalendar ? 0.65 : 1, transition: "filter 0.2s ease, opacity 0.2s ease", pointerEvents: showCalendar ? "none" : "auto" }}>
        {stats.map((item) => (
          <div key={item.title} className="relative overflow-hidden" style={{ minHeight: 112, borderRadius: 22, background: "#00000080", border: "1px solid #FFFFFF33", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", padding: "22px", boxSizing: "border-box" }}>
            <div className="flex items-center justify-between gap-3">
              <p className="truncate" style={{ margin: 0, fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 9, lineHeight: "100%", letterSpacing: "0.8px", color: "#71717A", textTransform: "uppercase", whiteSpace: "nowrap", maxWidth: 130 }}>{item.title}</p>
              <span className="grid h-[22px] min-w-[36px] shrink-0 place-items-center rounded-full bg-black px-2" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 10, lineHeight: "100%", color: item.badgeColor }}>{item.badge}</span>
            </div>
            <p style={{ margin: "26px 0 0", fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 34, lineHeight: "100%", color: "#FFFFFF" }}>{item.value}</p>
          </div>
        ))}
      </div>
      <div className="relative z-10 mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1px_355px] lg:gap-6">
        <div>
          <div className="flex items-center justify-between">
            <h2 style={{ margin: 0, fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 21, lineHeight: "100%", color: "#FFFFFF" }}>Active Projects</h2>
            <button type="button" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 12, lineHeight: "100%", letterSpacing: "1.5px", color: "#C084FC" }}>VIEW ALL</button>
          </div>
          <div className="mt-4 h-px w-full bg-white/10" />
         
<div className="mt-4 space-y-5">
  {activeProjects.length > 0 ? (
    activeProjects.map((project) => {
      const statusStyle = getProjectStatusStyle(project.status);

      return (
        <div
          key={project.id}
          onClick={() => {
  setSelectedProject(project);
  setProposalOpen(true);
}}
          style={{
            borderRadius: 16,
            background: "rgba(0,0,0,0.22)",
            border: "1px solid rgba(255,255,255,0.10)",
            padding: "22px 16px",
            boxSizing: "border-box",
            cursor: "pointer",
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  margin: 0,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 800,
                  fontSize: 18,
                  lineHeight: "120%",
                  color: "#FFFFFF",
                }}
              >
                {project.title}
              </h3>

              <p
                style={{
                  margin: "7px 0 0",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: "100%",
                  color: "#71717A",
                }}
              >
                Client: {project.user} • {project.price}
              </p>
            </div>

            <span
              className="w-fit"
              style={{
                height: 24,
                padding: "0 13px",
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Inter, sans-serif",
                fontWeight: 800,
                fontSize: 10,
                lineHeight: "100%",
                letterSpacing: "1px",
                ...statusStyle,
              }}
            >
              {project.statusText}
            </span>
          </div>

          <p
            style={{
              margin: "14px 0 0",
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: 13,
              lineHeight: "18px",
              color: "#8F8996",
            }}
          >
            {project.desc}
          </p>

          <div className="mt-7 flex items-center gap-2">
            <Clock3 size={20} color="#C084FC" />
            <p
              style={{
                margin: 0,
                fontFamily: "Inter, sans-serif",
                fontWeight: 800,
                fontSize: 12,
                lineHeight: "100%",
                letterSpacing: "2px",
                color: "#C084FC",
              }}
            >
              EXECUTION TIMELINE
            </p>
          </div>

          <div
            className="mt-4 h-[6px] max-w-[520px] overflow-hidden rounded-full"
            style={{
              background: "#18181B80",
              border: "1px solid #FFFFFF1A",
            }}
          >
            <div
              style={{
                width: `${project.progress}%`,
                height: "100%",
                borderRadius: 999,
                background: "#D9A6FF",
              }}
            />
          </div>

          <div
            className="mt-3 flex max-w-[520px] items-center justify-between"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: 13,
              lineHeight: "100%",
              color: "#C9C2CE",
            }}
          >
            <span>Start: {project.start}</span>
            <span>Finish: {project.finish}</span>
          </div>
        </div>
      );
    })
  ) : (
    <div
      style={{
        borderRadius: 16,
        background: "rgba(0,0,0,0.22)",
        border: "1px dashed rgba(255,255,255,0.14)",
        padding: "32px 18px",
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          margin: "0 auto",
          borderRadius: 16,
          background: "rgba(192,132,252,0.10)",
          border: "1px solid rgba(192,132,252,0.20)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Clock3 size={22} color="#C084FC" />
      </div>

      <h3
        style={{
          margin: "14px 0 0",
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 17,
          color: "#FFFFFF",
        }}
      >
        No active projects yet
      </h3>

      <p
        style={{
          margin: "8px auto 0",
          maxWidth: 360,
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 13,
          lineHeight: "19px",
          color: "#71717A",
        }}
      >
        done
      </p>
    </div>
  )}
</div>


        </div>
        <div className="hidden bg-white/20 lg:block" style={{ width: 1 }} />
        <div className="flex flex-col gap-0">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ margin: 0, fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 21, lineHeight: "100%", color: "#FFFFFF" }}>New Requests</h2>
          <span
  className="rounded-full bg-white/10 px-2 py-1"
  style={{
    fontFamily: "Inter, sans-serif",
    fontWeight: 800,
    fontSize: 11,
    lineHeight: "100%",
    color: "#FFFFFF",
  }}
>
  +{hireEarnings.activeRequests || 0}
</span>
          </div>
      {allRequests.length > 0 ? (
  <RequestCard item={allRequests[0]} />
) : (
  <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5 text-white/45">
    No new project requests yet.
  </div>
)}
        </div>
      </div>
    </>
  );

  /* Requests */
  const RequestsContent = () => {
    const PER_PAGE = 8;
 const TOTAL_PAGES = Math.max(1, Math.ceil(allRequests.length / PER_PAGE));
    const [page, setPage] = useState(1);
    const pageItems = allRequests.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const btnBase: React.CSSProperties = { width: 34, height: 34, borderRadius: 6, fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 14, lineHeight: "100%", display: "grid", placeItems: "center", cursor: "pointer" };
    const pageBtn = (active: boolean): React.CSSProperties => ({ ...btnBase, border: active ? "none" : "1px solid #F5F5F5", background: active ? GRADIENT : "transparent", color: "#FFFFFF" });
    const navBtn: React.CSSProperties = { ...btnBase, border: "1px solid #F5F5F5", background: "transparent", color: "#FFFFFF" };
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="shrink-0">
          <h1 style={{ margin: 0, fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 28, lineHeight: "100%", color: "#FFFFFF" }}>New Requests</h1>
          <p style={{ margin: "6px 0 0", fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 13, lineHeight: "100%", color: "#8F8996" }}>Your project request activity is up <span style={{ color: "#C084FC", fontWeight: 700 }}>15%</span> this week.</p>
        </div>
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
      {pageItems.length > 0 ? (
  pageItems.map((item) => <RequestCard key={item.id} item={item} />)
) : (
  <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5 text-white/45">
    No new project requests yet.
  </div>
)}
          </div>
        </div>
        <div className="mt-3 flex shrink-0 items-center justify-center gap-2 pb-1">
          <button type="button" style={navBtn} onClick={() => setPage(1)}>«</button>
          <button type="button" style={navBtn} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => {
            const p = i + 1;
            return <button key={p} type="button" style={pageBtn(page === p)} onClick={() => setPage(p)}>{p}</button>;
          })}
          <button type="button" style={navBtn} onClick={() => setPage((p) => Math.min(TOTAL_PAGES, p + 1))}>›</button>
          <button type="button" style={navBtn} onClick={() => setPage(TOTAL_PAGES)}>»</button>
        </div>
      </div>
    );
  };

  /* ── SERVICE BOOKINGS — separate section from Hire deals ── */
  const ServiceBookingsContent = () => {
    const [summary, setSummary] = useState<{
      totalEarnings: number;
      activeRequests: number;
      totalProjects: number;
      requests: any[];
      projects: any[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitFor, setSubmitFor] = useState<any | null>(null);
    // Which booking's detail popup is open. The cards only ever showed a title,
    // a client name and an amount, so the seller couldn't tell what the client
    // had actually paid for without digging through chat.
    const [detailForId, setDetailForId] = useState<string | null>(null);

    const fetchSummary = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/services/orders/seller-summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data?.success) setSummary(data);
      } catch {
        // silently ignore — tab still renders with empty state
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchSummary();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const statusBadge = (status: string) => {
      const map: Record<string, { label: string; color: string; bg: string }> = {
        PENDING_PAYMENT: { label: "Awaiting NDA & Payment", color: "#FABC4E", bg: "rgba(250,188,78,0.12)" },
        FUNDED: { label: "Funded — Start Work", color: "#1A73E8", bg: "rgba(26,115,232,0.12)" },
        IN_PROGRESS: { label: "In Progress", color: "#1A73E8", bg: "rgba(26,115,232,0.12)" },
        WORK_SUBMITTED: { label: "Submitted — Awaiting Review", color: "#C084FC", bg: "rgba(192,132,252,0.12)" },
        REVISION_REQUESTED: { label: "Revision Requested", color: "#FABC4E", bg: "rgba(250,188,78,0.12)" },
        COMPLETED: { label: "Completed & Paid", color: "#19E66C", bg: "rgba(25,230,108,0.12)" },
      };
      const s = map[status] || { label: status, color: "#8F8996", bg: "rgba(255,255,255,0.06)" };
      return (
        <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: "4px 10px", borderRadius: 999 }}>
          {s.label}
        </span>
      );
    };

    const canSubmit = (status: string) => ["FUNDED", "IN_PROGRESS", "REVISION_REQUESTED"].includes(status);
    // The server refuses a submission past the delivery date, so the button
    // that opens the upload modal has to go with it.
    const canStillDeliver = (p: any) => canSubmit(p?.status) && !p?.deliveryOverdue;

    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="shrink-0">
          <h1 style={{ margin: 0, fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 28, lineHeight: "100%", color: "#FFFFFF" }}>
            Service Bookings
          </h1>
          <p style={{ margin: "6px 0 0", fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 13, lineHeight: "100%", color: "#8F8996" }}>
            Bookings clients have made for the services you sell.
          </p>
        </div>

        {/* Stat tiles */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
          {[
            { label: "Active Requests", value: summary?.activeRequests ?? 0 },
            { label: "Earnings", value: `₹${(summary?.totalEarnings ?? 0).toLocaleString("en-IN")}` },
            { label: "Total Projects", value: summary?.totalProjects ?? 0 },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 p-4"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.035) 100%)" }}
            >
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "1.2px", color: "#8F8996", textTransform: "uppercase" }}>{s.label}</p>
              <p style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 800, color: "#FFFFFF" }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
          {loading ? (
            <p className="text-white/45 text-sm">Loading bookings…</p>
          ) : (
            <>
              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16, color: "#FFFFFF", margin: "0 0 12px" }}>New Requests</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-8">
                {summary?.requests?.length ? (
                  summary.requests.map((r) => (
                    <button
                      key={r._id}
                      type="button"
                      onClick={() => setDetailForId(r._id)}
                      className="text-left hover:border-white/25 transition"
                      style={{ borderRadius: 16, background: "#FFFFFF05", border: "1px solid #FFFFFF0F", padding: "16px" }}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span style={{ fontWeight: 700, color: "#FFFFFF", fontSize: 14 }}>{r.title}</span>
                        {statusBadge(r.status)}
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "#8F8996" }}>
                        From {r.buyerName} · ₹{Number(r.amount).toLocaleString("en-IN")}
                      </p>
                      {r.note && (
                        <p style={{ margin: "8px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: "18px" }} className="line-clamp-2">
                          “{r.note}”
                        </p>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5 text-white/45">No new booking requests yet.</div>
                )}
              </div>

              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16, color: "#FFFFFF", margin: "0 0 12px" }}>Active Bookings</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {summary?.projects?.length ? (
                  summary.projects.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => setDetailForId(p._id)}
                      className="cursor-pointer hover:border-white/25 transition"
                      style={{ borderRadius: 16, background: "#FFFFFF05", border: "1px solid #FFFFFF0F", padding: "16px" }}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        {p.serviceMedia && (
                          <img
                            src={p.serviceMedia}
                            alt=""
                            className="w-11 h-11 rounded-lg object-cover shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <span style={{ fontWeight: 700, color: "#FFFFFF", fontSize: 14 }} className="truncate">
                              {p.title}
                            </span>
                            {statusBadge(p.status)}
                          </div>
                          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8F8996" }}>
                            {p.buyerName} · ₹{Number(p.sellerAmount ?? p.amount).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      {p.note && (
                        <p style={{ margin: "0 0 8px", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: "18px" }} className="line-clamp-2">
                          “{p.note}”
                        </p>
                      )}

                      {/* The delivery clock. Kept on the card, not just inside
                          the detail popup — a deadline nobody sees until they
                          open the booking is a deadline that gets missed. */}
                      {(() => {
                        const dl = deadlineLabel(p.deliveryDueAt);
                        if (!dl || !canSubmit(p.status)) return null;
                        return (
                          <p
                            style={{
                              margin: "0 0 8px",
                              fontSize: 11,
                              fontWeight: 600,
                              color:
                                dl.tone === "late"
                                  ? "#FF8F8F"
                                  : dl.tone === "soon"
                                    ? "#FABC4E"
                                    : "#8F8996",
                            }}
                          >
                            ⏱ Delivery {dl.text}
                          </p>
                        );
                      })()}

                      {/* Revision budget, so the seller can see at a glance
                          whether a client has any sendbacks left. */}
                      {p.revisionState && p.revisionState.used > 0 && (
                        <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 600, color: "#FABC4E" }}>
                          ↺ {p.revisionState.label}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailForId(p._id);
                          }}
                          className="flex-1 h-9 rounded-lg text-sm font-medium text-white/70 border border-white/12 hover:bg-white/[0.06]"
                        >
                          View details
                        </button>
                        {canStillDeliver(p) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSubmitFor(p);
                            }}
                            className="flex-1 h-9 rounded-lg text-sm font-semibold text-white"
                            style={{ background: GRAD }}
                          >
                            {p.status === "REVISION_REQUESTED" ? "Resubmit" : "Submit Work"}
                          </button>
                        )}

                        {canSubmit(p.status) && p.deliveryOverdue && (
                          <button
                            type="button"
                            disabled
                            title="The delivery deadline for this booking has passed."
                            className="flex-1 h-9 rounded-lg text-sm font-semibold text-white/40 border border-white/10 cursor-not-allowed"
                          >
                            Deadline passed
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5 text-white/45">No active bookings yet.</div>
                )}
              </div>
            </>
          )}
        </div>

        {detailForId && (
          <BookingDetailModal
            orderId={detailForId}
            token={token}
            onClose={() => setDetailForId(null)}
            onChanged={fetchSummary}
            onSubmitWork={(order) => {
              setDetailForId(null);
              setSubmitFor(order);
            }}
          />
        )}

        {/* The shared modal, not a local copy. There used to be two — and they
            had already drifted: this one accepted repo/deployment links while
            the hire-side one didn't, so the same freelancer could hand over a
            deployed URL for a service booking but not for a project. */}
        {submitFor && (
          <SubmitWorkModal
            orderKind="service"
            orderId={String(submitFor._id)}
            title={submitFor.title || submitFor.serviceTitle}
            isResubmit={submitFor.status === "REVISION_REQUESTED"}
            token={token}
            onClose={() => setSubmitFor(null)}
            onSubmitted={fetchSummary}
          />
        )}
      </div>
    );
  };

  /* ── MY PROMPTS — with Purchased / Uploaded toggle ── */
  const PromptsContent = () => {
    const isPurchased = promptsTab === "purchased";
    const isLoading = isPurchased ? purchasesLoading : uploadsLoading;
    const isError = isPurchased ? purchasesError : uploadsError;
    const items = isPurchased ? purchaseHistory : uploadHistory;

    /* Stats */
    const statLabel1 = isPurchased ? "Total Purchased" : "Total Uploaded";
    const statVal1 = isPurchased ? purchaseHistory.length : uploadHistory.length;
    const statLabel2 = isPurchased ? "Total Bill" : "Total Earnings";
    const statVal2 = isPurchased
      ? `₹${totalPurchasedBill.toFixed(2)}`
      : `₹${totalEarningsINR.toFixed(2)}`;
    const soldPromptsCount = uploadHistory.filter((p) => (p.sales || 0) > 0).length;
    const totalUnitsSold = uploadHistory.reduce((sum, p) => sum + (p.sales || 0), 0);

    return (
      <div className="relative z-10">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 style={{ margin: 0, fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 22, lineHeight: "100%", color: "#FFFFFF" }}>
            My Products
          </h2>

          {/* Toggle pill */}
          <div
            className="flex items-center rounded-full p-1 gap-1"
            style={{ background: "#1C1C1C", border: "1px solid #35343C" }}
          >
            <button
              type="button"
              onClick={() => setPromptsTab("purchased")}
              className="flex items-center gap-2 px-4 h-9 rounded-full text-sm font-semibold transition-all"
              style={{
                background: promptsTab === "purchased" ? GRADIENT : "transparent",
                color: "#FFFFFF",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Purchased
            </button>
            <button
              type="button"
              onClick={() => setPromptsTab("uploaded")}
              className="flex items-center gap-2 px-4 h-9 rounded-full text-sm font-semibold transition-all"
              style={{
                background: promptsTab === "uploaded" ? GRADIENT : "transparent",
                color: "#FFFFFF",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <Upload className="h-3.5 w-3.5" />
              Uploaded
            </button>
          </div>
        </div>

        {/* Stat cards */}
       {/* Glass Stat cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
  <div
    className="relative overflow-hidden rounded-2xl border border-white/10 p-4"
    style={{
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.035) 100%)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.10), 0 18px 45px rgba(0,0,0,0.28)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
    }}
  >
    <div
      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl"
      style={{
        background:
          promptsTab === "purchased"
            ? "rgba(26,115,232,0.32)"
            : "rgba(255,20,239,0.28)",
      }}
    />

    <div
      className="pointer-events-none absolute -bottom-12 -left-8 h-24 w-24 rounded-full blur-2xl"
      style={{
        background: "rgba(255,20,239,0.18)",
      }}
    />

    <div className="relative z-10 flex items-start justify-between gap-3">
      <div>
        <p
          className="text-[11px] uppercase tracking-[0.18em] text-white/45"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {statLabel1}
        </p>

        <div
          className="mt-2 text-[26px] font-extrabold leading-none text-white"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {statVal1}
        </div>

        <p className="mt-2 text-xs text-white/40">
          {promptsTab === "purchased"
            ? "Products you bought"
            : "Products uploaded by you"}
        </p>
      </div>

      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,20,239,0.20), rgba(26,115,232,0.18))",
        }}
      >
        {promptsTab === "purchased" ? (
          <ShoppingCart className="h-5 w-5 text-white/85" />
        ) : (
          <Upload className="h-5 w-5 text-white/85" />
        )}
      </div>
    </div>
  </div>

  <div
    className="relative overflow-hidden rounded-2xl border border-white/10 p-4"
    style={{
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.035) 100%)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.10), 0 18px 45px rgba(0,0,0,0.28)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
    }}
  >
    <div
      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl"
      style={{
        background:
          promptsTab === "purchased"
            ? "rgba(255,20,239,0.30)"
            : "rgba(34,197,94,0.22)",
      }}
    />

    <div
      className="pointer-events-none absolute -bottom-12 -left-8 h-24 w-24 rounded-full blur-2xl"
      style={{
        background: "rgba(26,115,232,0.18)",
      }}
    />

    <div className="relative z-10 flex items-start justify-between gap-3">
      <div>
        <p
          className="text-[11px] uppercase tracking-[0.18em] text-white/45"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {statLabel2}
        </p>

       {promptsTab === "uploaded" ? (
  <>
    <div className="mt-2 text-[26px] font-extrabold leading-none text-white">
      ₹{(totalEarningsINR + hireEarnings.totalEarnings).toLocaleString()}
    </div>

    <p className="mt-2 text-xs text-white/40">
      Prompts: ₹{totalEarningsINR.toLocaleString()} + Hire: ₹{hireEarnings.totalEarnings.toLocaleString()}
    </p>
  </>
) : (
  <>
    <div
      className="mt-2 text-[26px] font-extrabold leading-none text-white"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {statVal2}
    </div>

    <p className="mt-2 text-xs text-white/40">
      Total amount spent
    </p>
  </>
)}
      </div>

      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,20,239,0.20), rgba(26,115,232,0.18))",
        }}
      >
        <BadgeDollarSign className="h-5 w-5 text-white/85" />
      </div>
    </div>
  </div>

  {promptsTab === "uploaded" && (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 p-4"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.035) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.10), 0 18px 45px rgba(0,0,0,0.28)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl"
        style={{ background: "rgba(34,197,94,0.25)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-8 h-24 w-24 rounded-full blur-2xl"
        style={{ background: "rgba(255,20,239,0.15)" }}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p
            className="text-[11px] uppercase tracking-[0.18em] text-white/45"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Prompts Sold
          </p>

          <div
            className="mt-2 text-[26px] font-extrabold leading-none text-white"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {soldPromptsCount} <span className="text-white/40 text-base font-semibold">/ {uploadHistory.length}</span>
          </div>

          <p className="mt-2 text-xs text-white/40">
            {totalUnitsSold} total sale{totalUnitsSold === 1 ? "" : "s"} across your prompts
          </p>
        </div>

        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10"
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.22), rgba(26,115,232,0.18))",
          }}
        >
          <ShoppingCart className="h-5 w-5 text-white/85" />
        </div>
      </div>
    </div>
  )}
</div>

        {/* Grid */}
        {isLoading ? (
          <p className="text-white/50 text-sm py-8 text-center">Loading…</p>
        ) : isError ? (
          <p className="text-red-400 text-sm py-8 text-center">{isError}</p>
        ) : items.length === 0 ? (
          <EmptyState message={isPurchased ? "No products purchased yet." : "No uploaded products yet."} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {items.map((prompt) => (
              <HistoryGridCard
                key={prompt.id}
                prompt={prompt}
                showImages={!prompt.videoUrl}
                playingVideo={playingVideo}
                onToggleVideo={onToggleVideo}
                onPreview={openDetails}
                isUploaded={!isPurchased}
                onDelete={!isPurchased ? handleDeletePrompt : undefined}
                onEdit={!isPurchased ? setResubmitTarget : undefined}
                onShare={isPurchased ? setShareTarget : undefined}
                onRequestRefund={isPurchased ? openRefundModal : undefined}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  /* Subscription */
 const SubscriptionContent = () => (
  <div className="relative z-10">
    <h2
      style={{
        margin: 0,
        fontFamily: "Inter, sans-serif",
        fontWeight: 800,
        fontSize: 22,
        lineHeight: "100%",
        color: "#FFFFFF",
      }}
    >
      My Subscription
    </h2>

    <SubscriptionsSection
      user={user}
      onRenew={(plan, annual) => startSubscriptionPurchase(plan, annual)}
      onUpgrade={(plan, annual) => startSubscriptionPurchase(plan, annual)}
    />

    {creatingPlan && (
      <p className="mt-4 text-center text-xs text-white/50">
        Opening payment checkout...
      </p>
    )}
  </div>
);
  /* ══ RENDER ════════════════════════════════════════════ */
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07080A] text-white">
      <img
        src="/icons/mpbg.png"
        alt="background"
        className="pointer-events-none fixed inset-0 z-0 h-screen w-full select-none object-cover opacity-80"
      />
      <div className="relative z-20">
        <Header />
      </div>

      <main className="fixed inset-0 z-[60] flex items-start justify-center bg-black/35 px-3 pt-[60px] backdrop-blur-[20px] sm:px-6">
        <div
          className="relative flex w-full max-w-[1200px] overflow-hidden rounded-[24px] shadow-[0_40px_120px_rgba(0,0,0,0.65)] max-lg:flex-col sm:rounded-[32px]"
          style={{
            height: "min(920px, calc(100vh - 76px))",
            background: "#21212180",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="absolute right-3 top-3 z-20 grid h-8 w-8 place-items-center rounded-full text-white/45 hover:bg-white/10 hover:text-white sm:right-5 sm:top-5"
          >
            <X size={22} />
          </button>

          {/* ── Sidebar ── */}
          <aside className="shrink-0 border-white/10 bg-[#151517]/70 px-4 py-4 max-lg:border-b lg:h-full lg:w-[255px] lg:border-r lg:px-7 lg:py-8">
            <div className="flex items-center gap-4 lg:block">
              <div className="h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[18px] border border-white/20 bg-black/30 lg:h-[90px] lg:w-[90px] lg:rounded-[24px]">
                <img src={avatar} alt={displayName} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-white lg:mt-5" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 21, lineHeight: "100%" }}>
                  {displayName}
                </h2>
                <nav className="no-scrollbar mt-4 flex gap-2 overflow-x-auto lg:mt-10 lg:block lg:space-y-3">
                  <NavButton id="dashboard"       label="DASHBOARD"       icon="/icons/self.svg" />
                  <NavButton id="requests"        label="REQUESTS"        icon="/icons/req.svg"  />
                  <NavButton id="serviceBookings" label="SERVICE BOOKINGS" icon="/icons/service.svg" />
                  <NavButton id="prompts"         label="MY PRODUCTS"      icon="/icons/self.svg" />
                  <NavButton id="subscription"    label="MY SUBSCRIPTION" icon="/icons/req.svg"  />
                </nav>
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          {/* The requests tab is the one panel that manages its own height —
              header, an internally-scrolling list, then pagination pinned below
              it. That only works if this section is a flex column, so the panel
              can take "whatever is left after the payout banners" rather than a
              flat 100%. */}
          <section
            className={`relative min-w-0 flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 ${
              activeTab === "requests" ? "flex flex-col" : ""
            }`}
            style={{
              minHeight: 0,
              paddingTop: activeTab === "requests" ? 20 : 32,
              paddingBottom: activeTab === "requests" ? 12 : 32,
            }}
          >
            {/* Glows */}
            <div className="pointer-events-none absolute right-[40px] top-[70px] h-[180px] w-[180px] rounded-full bg-[#5D4DFF]/45 blur-[35px] sm:right-[120px] sm:h-[240px] sm:w-[240px]" />
            <div className="pointer-events-none absolute left-[80px] top-[520px] h-[200px] w-[200px] rounded-full bg-[#FF14EF]/20 blur-[65px] lg:left-[230px] lg:top-[430px] lg:h-[230px] lg:w-[230px]" />

            {/* Hello header — hidden on requests & prompts tab (prompts has its own header) */}
            {activeTab !== "requests" && activeTab !== "prompts" && activeTab !== "subscription" && (
              <div className="relative z-[100] flex flex-col gap-5 pr-8 sm:flex-row sm:items-start sm:justify-between sm:pr-12">
                <div className="min-w-0">
                  <h1 className="truncate" style={{ margin: 0, fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: "clamp(26px, 6vw, 34px)", lineHeight: "100%", color: "#FFFFFF" }}>
                    Hello, {displayName}
                  </h1>
                  <p className="mt-3" style={{ marginBottom: 0, fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 15, lineHeight: "140%", color: "#8F8996" }}>
                    Your recruitment performance is up{" "}
                    <span style={{ color: "#C084FC" }}>12%</span> this week.
                  </p>
                </div>

                {/* Date + Calendar */}
                <div className="relative flex items-center gap-4 sm:pr-1">
                  <div className="text-left sm:text-right">
                    <p style={{ margin: 0, fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 12, lineHeight: "100%", color: "#FFFFFF", textTransform: "uppercase" }}>
                      {formatDashboardDate(selectedDate)}
                    </p>
                    {/* Was the literal string "10:45 AM GMT" — a mockup value that
                        shipped, so the dashboard told everyone it was quarter to
                        eleven in London no matter when or where they opened it.
                        Real clock now, in the viewer's own timezone. */}
                    <p style={{ margin: "6px 0 0", fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 11, lineHeight: "100%", color: "#A1A1AA" }}>{clockLabel}</p>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <button type="button" onClick={() => setShowCalendar((v) => !v)} className="grid h-10 w-10 place-items-center rounded-xl border-0 bg-transparent p-0">
                    <img src="/icons/cale.svg" alt="calendar" className="h-7 w-7 object-contain" style={{ filter: "brightness(0) invert(1)", opacity: 1 }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  </button>

                  {showCalendar && (
                    <div className="absolute right-0 top-[52px] z-[99999] w-[280px] rounded-2xl border border-white/10 bg-[#101114] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.75)]">
                      <div className="mb-3 flex items-center justify-between">
                        <button type="button" onClick={() => setCalendarMonth((prev) => { const next = new Date(prev); next.setMonth(next.getMonth() - 1); return next; })} className="h-8 w-8 rounded-full bg-white/10 text-white hover:bg-white/15">‹</button>
                        <p className="text-sm font-semibold text-white">{getMonthLabel(calendarMonth)}</p>
                        <button
                          type="button"
                          disabled={atCurrentMonth}
                          aria-label="Next month"
                          onClick={() => setCalendarMonth((prev) => { const next = new Date(prev); next.setMonth(next.getMonth() + 1); return next; })}
                          className="h-8 w-8 rounded-full bg-white/10 text-white transition enabled:hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
                        >›</button>
                      </div>
                      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
                        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                          <span key={`${day}-${index}`} className="text-[11px] text-white/40">{day}</span>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {[...Array(firstDay)].map((_, i) => <span key={`empty-${i}`} />)}
                        {[...Array(totalDays)].map((_, i) => {
                          const day = i + 1;
                          const currentDate = new Date(year, month, day);
                          currentDate.setHours(0, 0, 0, 0);
                          const value = toDateValue(currentDate);
                          const active = selectedDate === value;
                          const isFuture = currentDate.getTime() > todayStart.getTime();
                          return (
                            <button
                              key={day}
                              type="button"
                              disabled={isFuture}
                              aria-disabled={isFuture}
                              onClick={() => { setSelectedDate(value); setShowCalendar(false); }}
                              className={`h-8 rounded-full text-xs transition ${
                                active
                                  ? "text-white"
                                  : isFuture
                                  /* Dimmed rather than hidden — the row still has
                                     to read as a month, and a gap where the 29th
                                     should be reads as a rendering fault. */
                                  ? "cursor-not-allowed text-white/20"
                                  : "text-white/70 hover:bg-white/10"
                              }`}
                              style={active ? { background: GRADIENT } : {}}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Payout status, and the org card that replaces it ───────────
                These all used to carry `mx-4` on top of the section's own
                `px-4 sm:px-6 lg:px-8`, so they sat 16px further in than the
                greeting above them and the tab content below — and the gap grew
                with the breakpoint, since the section padding scales and a flat
                mx-4 doesn't. They render outside the tab switch, so that
                mismatch showed on every tab. The section supplies the gutter;
                these just stack inside it. */}

            {/* A team member's org identity and allowance. Renders nothing for
                anyone else, and takes the place of the seller-payout banners
                below — which a TM should never see, since payout-status reports
                canSell:false for them. */}
            <OrgMembershipCard className="relative z-10 mt-4" />

            {canSell && hasPayoutSetup === false && !requiresResubmission && (
              <div className="relative z-10 mt-4 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                <strong>Action required:</strong> Please set up your bank/linked account so people can buy your products.
                <button
                  type="button"
                  onClick={() => setSellerFormOpen(true)}
                  className="ml-3 rounded-md bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-100 hover:bg-yellow-500/30"
                >
                  Set up now
                </button>
              </div>
            )}

            {canSell && hasPayoutSetup === false && requiresResubmission && (
              <div className="relative z-10 mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                <strong>{activationStatus === "REJECTED" ? "Verification failed:" : "Account disabled:"}</strong>{" "}
                {payoutMessage || "Please resubmit your payout details."}
                <button
                  type="button"
                  onClick={() => setSellerFormOpen(true)}
                  className="ml-3 rounded-md bg-red-500/20 px-3 py-1 text-xs font-medium text-red-100 hover:bg-red-500/30"
                >
                  Resubmit details
                </button>
              </div>
            )}

            {hasPayoutSetup === true && activationStatus === "NEEDS_CLARIFICATION" && (
              <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                <span>Razorpay needs more information to verify your payout account. Your products stay hidden from buyers until this is resolved.</span>
                <button
                  type="button"
                  onClick={() => setClarificationModalOpen(true)}
                  style={{ background: "linear-gradient(270deg,#FFB020 0%, #FF5B1E 100%)" }}
                  className="rounded-md px-3 py-1.5 text-xs font-semibold text-black shadow-sm transition hover:opacity-90"
                >
                  Clarification Needed
                </button>
              </div>
            )}

            {hasPayoutSetup === true && (activationStatus === "UNDER_REVIEW" || activationStatus === "CREATED") && (
              <div className="relative z-10 mt-4 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                <strong>Under review:</strong> {payoutMessage || "Your payout account is being verified. Your prompts will go live as soon as verification completes."}
              </div>
            )}

            {hasPayoutSetup === true && activationStatus === "ACTIVATED" && (
              <div className="relative z-10 mt-4 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                <strong>Payout account activated:</strong> Buyers can now see and purchase your products.
              </div>
            )}

            {token && (
              <SellerLinkedAccountForm
                open={sellerFormOpen}
                onClose={() => setSellerFormOpen(false)}
                token={token}
                apiBase={API_BASE}
                onSubmitted={() => {
                  setSellerFormOpen(false);
                  fetchPayoutStatus();
                }}
              />
            )}

            {clarificationModalOpen && (
              <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
                <div className="max-h-[85vh] w-[520px] max-w-full overflow-y-auto rounded-2xl border border-amber-500/20 bg-[#171008] text-white">
                  <div className="flex items-center justify-between border-b border-amber-500/20 p-4">
                    <div>
                      <p className="font-semibold text-amber-100">Clarification needed</p>
                      <p className="text-xs text-amber-100/50">{payoutMessage}</p>
                    </div>
                    <button onClick={() => setClarificationModalOpen(false)} className="text-white/60 hover:text-white">✕</button>
                  </div>

                  <div className="space-y-4 p-4">
                    {payoutSubmittedDetails.length > 0 && (
                      <>
                        <p className="text-xs text-amber-100/60">
                          Here's what you submitted. Only fields tagged "Needs fix" — the ones Razorpay actually
                          flagged — can be edited and resubmitted.
                        </p>
                        <div className="space-y-2">
                          {payoutSubmittedDetails.map((detail) => {
                            const req = payoutRequirements.find((r) => r.field_reference === detail.fieldReference);

                            if (!req) {
                              return (
                                <div key={detail.key} className="flex flex-wrap items-center gap-2 rounded-md bg-white/5 px-3 py-2">
                                  <span className="min-w-[160px] flex-1 text-xs font-medium text-white/70">{detail.label}</span>
                                  <span className="text-xs text-white/50">{detail.value || "—"}</span>
                                </div>
                              );
                            }

                            const fieldRef = detail.fieldReference as string;
                            return (
                              <div key={detail.key} className="flex flex-wrap items-center gap-2 rounded-md border border-amber-400/30 bg-amber-500/5 px-3 py-2">
                                <div className="min-w-[160px] flex-1 text-xs text-amber-100/80">
                                  <span className="font-medium text-amber-100">{detail.label}</span>
                                  <span className="ml-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-amber-200">
                                    Needs fix
                                  </span>
                                  {req.description ? <div className="mt-0.5 text-amber-100/60">{req.description}</div> : null}
                                </div>
                                <input
                                  className="w-40 rounded-md border border-amber-400/40 bg-white/5 px-2 py-1 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
                                  value={clarificationInputs[fieldRef] ?? detail.value ?? ""}
                                  onChange={(e) =>
                                    setClarificationInputs((prev) => ({ ...prev, [fieldRef]: e.target.value }))
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          disabled={
                            clarificationSubmitting ||
                            !payoutSubmittedDetails.some(
                              (d) =>
                                d.fieldReference &&
                                (clarificationInputs[d.fieldReference] ?? "").trim() &&
                                (clarificationInputs[d.fieldReference] ?? "").trim() !== (d.value || "").trim()
                            )
                          }
                          onClick={submitAllClarifications}
                          className="w-full rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-40"
                        >
                          {clarificationSubmitting ? "Submitting…" : "Submit updates"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {clarificationReviewModalOpen && (
              <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
                <div className="w-[420px] max-w-full rounded-2xl border border-amber-500/20 bg-[#171008] p-6 text-center text-white">
                  <h3 className="mb-2 text-lg font-semibold text-amber-100">Submitted for review</h3>
                  <p className="mb-6 text-sm text-white/60">
                    Please wait — we re-checking your updated details. This can take a few minutes, so
                    there's no need to submit again in the meantime.
                  </p>
                  <button
                    onClick={() => setClarificationReviewModalOpen(false)}
                    className="w-full rounded-lg bg-amber-500 px-5 py-2 text-sm font-medium text-black hover:bg-amber-400"
                  >
                    Got it
                  </button>
                </div>
              </div>
            )}

            {shareTarget && (
              <ShareWithTeamModal
                open={!!shareTarget}
                onOpenChange={(open) => !open && setShareTarget(null)}
                promptId={String(shareTarget.id)}
                promptTitle={shareTarget.title}
                thumbnail={shareTarget.imageUrl}
              />
            )}

            {resubmitTarget && (
              <ResubmitPromptModal
                prompt={resubmitTarget}
                token={token}
                onClose={() => setResubmitTarget(null)}
                onResubmitted={(updated) => {
                  setUploadHistory((prev) =>
                    prev.map((p) =>
                      String(p.id) === String(updated._id)
                        ? { ...p, title: updated.title, description: updated.description, promptText: updated.promptText, fullPrompt: updated.promptText, mediaValidation: updated.mediaValidation }
                        : p
                    )
                  );
                  toast({ title: "Resubmitted", description: "Sent back for a fresh review." });
                }}
              />
            )}

            {/* `h-[calc(100%-0px)]` was a flat `height: 100%` measured against
                the whole section, so it knew nothing about the payout banners
                sitting above it — the panel ran a banner's worth of height past
                the bottom edge, and with no top margin on this branch (only the
                other tabs get mt-6) "New Requests" was jammed straight up under
                the banner with no gap at all. flex-1 measures what's actually
                left; min-h-0 lets the list inside it scroll rather than forcing
                the column open. */}
            <div
              className={
                activeTab === "requests"
                  ? "relative z-10 mt-4 min-h-0 flex-1"
                  : "relative z-10 mt-6"
              }
            >
              {activeTab === "dashboard"       && <DashboardContent />}
              {activeTab === "requests"        && <RequestsContent />}
              {activeTab === "serviceBookings" && <ServiceBookingsContent />}
              {activeTab === "prompts"         && <PromptsContent />}
              {activeTab === "subscription"    && <SubscriptionContent />}
            </div>

            <div className="h-8 lg:hidden" />
          </section>
        </div>
      </main>

      {/* Details drawer */}
     {/* Details drawer */}
{detailsOpen && (
  <>
    <DetailsPrompt
      open={detailsOpen}
      onOpenChange={(open) => {
        setDetailsOpen(open);
        if (!open) setDetailsPrompt(null);
      }}
      prompt={detailsPrompt}
      owned={
        !!detailsPrompt &&
        (!!(detailsPrompt as any).purchasedAt ||
          !!(detailsPrompt as any).isUploadedByMe)
      }
      onPurchase={() => {}}
    />

    <style>{`
      [data-radix-popper-content-wrapper] {
        z-index: 999999 !important;
      }

      [role="dialog"] {
        z-index: 999999 !important;
      }

      [data-state="open"].fixed {
        z-index: 999998 !important;
      }
    `}</style>
  </>
)}


{proposalOpen && selectedProject && (
 <ProposalDetailModal
  open={proposalOpen}
  project={selectedProject}
  token={token}
  onSubmitted={fetchHireEarnings}
  onClose={() => {
    setProposalOpen(false);
    setSelectedProject(null);
  }}
/>


)}





      {/* Request refund on a purchased prompt.
          The page shell is `fixed z-[60]`, so the portalled dialog's default
          z-50 would land behind it — both overlay and content get lifted. */}
      {!!refundTarget && (
        <style>{`
          [data-state="open"].fixed { z-index: 999998 !important; }
          [role="dialog"] { z-index: 999999 !important; }
        `}</style>
      )}
      <Dialog open={!!refundTarget} onOpenChange={(open) => !open && setRefundTarget(null)}>
        <DialogContent className="z-[999999] bg-[#1C1C1C] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/60 -mt-2">
            Tell us why "{refundTarget?.title}" isn't what you expected. An admin will review
            this before any refund is processed.
          </p>
          {/* Tick list first, free text second — same as the dialog in
              PromptHistory. Presets come from lib/refundReasons so the two
              screens always offer the identical set. */}
          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {REFUND_REASON_PRESETS.map((preset) => {
              const checked = refundReasonTicks.includes(preset);
              return (
                <label
                  key={preset}
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                    checked
                      ? "border-white/25 bg-white/[0.07]"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRefundReason(preset)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#FF14EF]"
                  />
                  <span className="text-sm text-white/85 leading-snug">{preset}</span>
                </label>
              );
            })}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-white/45 mb-2">
              Anything else? (optional)
            </label>
            <Textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Add your own reason or any detail that helps us review this."
              className="bg-black/30 border-white/10 text-white min-h-[90px]"
              maxLength={1000}
            />
          </div>

          {/* Screenshots — same as the PromptHistory dialog. */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/45 mb-2">
              Attach screenshots (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                addRefundFiles(e.target.files);
                e.target.value = "";
              }}
              className="block w-full text-xs text-white/60 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/15 file:cursor-pointer"
            />
            <p className="mt-1.5 text-[11px] text-white/35">
              Up to {MAX_REFUND_FILES} images, {MAX_REFUND_FILE_MB}MB each.
            </p>

            {refundFiles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {refundFiles.map((file, i) => (
                  <div key={`${file.name}-${i}`} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                      className="h-16 w-16 object-cover rounded-lg border border-white/15"
                    />
                    <button
                      type="button"
                      onClick={() => removeRefundFile(i)}
                      aria-label={`Remove ${file.name}`}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-black/80 border border-white/20 text-white text-[11px] leading-none grid place-items-center hover:bg-black"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setRefundTarget(null)} disabled={refundSubmitting}>
              Cancel
            </Button>
            {/* A tick OR a note is enough — requiring the textarea meant
                retyping something you had just ticked. */}
            <Button onClick={submitRefundRequest} disabled={!refundReasonGiven || refundSubmitting}>
              {refundSubmitting ? "Submitting…" : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};


function ProposalDetailModal({
  open,
  project,
  token,
  onSubmitted,
  onClose,
}: {
  open: boolean;
  project: any;
  token?: string;
  onSubmitted?: () => void | Promise<void>;
  onClose: () => void;
}) {
  if (!open || !project) return null;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submittingWork, setSubmittingWork] = useState(false);

  const raw = project.raw || {};

  const rawDealId = project?.id || raw?._id;
  const dealId =
    rawDealId && typeof rawDealId === "object" && rawDealId._id
      ? String(rawDealId._id)
      : rawDealId
      ? String(rawDealId)
      : "";

  const currentStatus = project?.status || raw?.status;

  const canSubmitWork = [
    "FUNDED",
    "IN_PROGRESS",
    "REVISION_REQUESTED",
    "WORK_SUBMITTED",
  ].includes(currentStatus);

  const title = project.title || raw.title || "Active Project";

  const description =
    project.description ||
    project.desc ||
    raw.description ||
    "Project details will appear here.";

  const budgetText =
    project.price || INR(Number(project.budget || raw.amount || raw.budget || 0));

  const targetDate = project.finish || formatShortDate(raw.deliveryDate);
  const startDate = project.start || "Today";
  const progress = Number(project.progress || getProjectProgress(currentStatus));

  const handleAttachFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setSelectedFiles((prev) => [...prev, ...files].slice(0, 10));
    e.target.value = "";
  };

  const handleSubmitWork = async () => {
    if (!token) {
      toast({
        title: "Login required",
        description: "Please login again.",
      });
      return;
    }

    if (!dealId) {
      toast({
  title: "Deal not found",
  description: "Project ID is missing. Please refresh and try again.",
});

      return;
    }

    if (!canSubmitWork) {
     toast({
  title: "Cannot submit yet",
  description: "Project can only be submitted after client payment is received.",
});

      return;
    }

    if (!selectedFiles.length) {
      toast({
  title: "No files attached",
  description: "Please attach files before submitting.",
});

      return;
    }

    try {
      setSubmittingWork(true);

      const uploadedFiles: any[] = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch(`${API_BASE}/api/hire/${dealId}/upload-work-file`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const uploadData = await uploadRes.json().catch(() => ({}));

        if (!uploadRes.ok || !uploadData?.success) {
          throw new Error(uploadData?.error || `Failed to upload ${file.name}`);
        }

        uploadedFiles.push({
          url: uploadData.file.url,
          name: uploadData.file.name,
          description: uploadData.file.name,
          size: uploadData.file.size,
          mimeType: uploadData.file.mimeType,
        });
      }

      const submitRes = await fetch(`${API_BASE}/api/hire/${dealId}/submit-work`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note: "",
          deliverables: uploadedFiles,
        }),
      });

      const submitData = await submitRes.json().catch(() => ({}));

      if (!submitRes.ok || !submitData?.success) {
        throw new Error(submitData?.error || "Failed to submit files");
      }

      toast({
  title: "Files submitted",
  description: "Project files sent to client for review in chat.",
});

      await onSubmitted?.();
      onClose();
    } catch (err: any) {
      toast({
        title: "Submit failed",
        description: err?.message || "Could not submit files.",
      });
    } finally {
      setSubmittingWork(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md"
      style={{ zIndex: 2147483647 }}
      onClick={onClose}
    >
      <div
        className="text-white shadow-[0_35px_100px_rgba(0,0,0,0.65)]"
        style={{
          position: "absolute",
          top: 102,
          left: "50%",
          transform: "translateX(-50%)",
          width: 675,
          height: 877,
          maxWidth: "calc(100vw - 24px)",
          maxHeight: "calc(100vh - 120px)",
          borderRadius: 30,
          background: "#202020",
          opacity: 1,
          padding: "30px 50px",
          overflowY: "auto",
          boxSizing: "border-box",
          fontFamily: "Inter, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            right: 18,
            top: 17,
            width: 28,
            height: 28,
            display: "grid",
            placeItems: "center",
            border: "none",
            background: "transparent",
            color: "rgba(255,255,255,0.30)",
            cursor: "pointer",
          }}
        >
          <X size={22} />
        </button>

        {/* Proposal number */}
        <div
          style={{
            fontWeight: 800,
            fontSize: 11,
            lineHeight: "100%",
            letterSpacing: "3.5px",
            color: "#C783FF",
            textTransform: "uppercase",
          }}
        >
          Proposal #{String(project.id || "").slice(-6) || "23456"}
        </div>

        {/* Title */}
        <h2
          style={{
            margin: "14px 0 0",
            fontWeight: 800,
            fontSize: 38,
            lineHeight: "105%",
            color: "#F3EAF9",
            letterSpacing: "-1.4px",
          }}
        >
          {title}
        </h2>

        {/* Proposal Summary */}
        <div
          style={{
            marginTop: 27,
            width: "100%",
            minHeight: 152,
            borderRadius: 28,
            padding: "30px 31px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.025))",
            border: "1px solid rgba(255,255,255,0.11)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 12,
              lineHeight: "100%",
              letterSpacing: "3px",
              color: "#C783FF",
              textTransform: "uppercase",
            }}
          >
            Proposal Summary
          </div>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 22,
            }}
          >
            <div
              style={{
                height: 60,
                borderRadius: 15,
                background: "#333333",
                border: "1px solid rgba(255,255,255,0.05)",
                padding: "13px 16px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 8,
                  lineHeight: "100%",
                  letterSpacing: "1.8px",
                  color: "rgba(255,255,255,0.28)",
                  textTransform: "uppercase",
                }}
              >
                Total Budget
              </div>

              <div
                style={{
                  marginTop: 9,
                  fontWeight: 800,
                  fontSize: 22,
                  lineHeight: "100%",
                  color: "#FFFFFF",
                }}
              >
                {budgetText}
              </div>
            </div>

            <div
              style={{
                height: 60,
                borderRadius: 15,
                background: "#333333",
                border: "1px solid rgba(255,255,255,0.05)",
                padding: "13px 16px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 8,
                  lineHeight: "100%",
                  letterSpacing: "1.8px",
                  color: "rgba(255,255,255,0.28)",
                  textTransform: "uppercase",
                }}
              >
                Target Date
              </div>

              <div
                style={{
                  marginTop: 9,
                  fontWeight: 800,
                  fontSize: 22,
                  lineHeight: "100%",
                  color: "#FFFFFF",
                }}
              >
                {targetDate}
              </div>
            </div>
          </div>
        </div>

        {/* Project Overview */}
        <div style={{ marginTop: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <FileText size={17} color="#C783FF" />

            <span
              style={{
                fontWeight: 800,
                fontSize: 12,
                lineHeight: "100%",
                letterSpacing: "3px",
                color: "#C783FF",
                textTransform: "uppercase",
              }}
            >
              Project Overview
            </span>
          </div>

          <div
            style={{
              marginTop: 19,
              fontWeight: 400,
              fontSize: 16,
              lineHeight: "18px",
              color: "#CFC3D4",
              whiteSpace: "pre-line",
            }}
          >
            {description}
          </div>
        </div>

        {/* Execution Timeline */}
        <div
          style={{
            marginTop: 31,
            width: "100%",
            minHeight: 112,
            borderRadius: 15,
            background: "#1D1D1D",
            border: "1px solid rgba(255,255,255,0.10)",
            padding: "15px 16px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock3 size={18} color="#C783FF" />

            <span
              style={{
                fontWeight: 800,
                fontSize: 12,
                lineHeight: "100%",
                letterSpacing: "2.5px",
                color: "#C783FF",
                textTransform: "uppercase",
              }}
            >
              Execution Timeline
            </span>
          </div>

          <div
            style={{
              marginTop: 20,
              height: 8,
              overflow: "hidden",
              borderRadius: 999,
              background: "#4A4250",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.max(2, Math.min(progress, 100))}%`,
                borderRadius: 999,
                background: "#D5A0FF",
              }}
            />
          </div>

          <div
            style={{
              marginTop: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontWeight: 400,
              fontSize: 12,
              lineHeight: "100%",
              color: "#D8CDD9",
            }}
          >
            <span>Start: {startDate}</span>
            <span>Finish: {targetDate}</span>
          </div>
        </div>

        {/* Bottom buttons */}
        <div
          style={{
            marginTop: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={handleAttachFiles}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!canSubmitWork || submittingWork}
            style={{
              width: 180,
              height: 49,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "#242424",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontWeight: 400,
              fontSize: 16,
              cursor: !canSubmitWork || submittingWork ? "not-allowed" : "pointer",
              opacity: !canSubmitWork || submittingWork ? 0.55 : 1,
            }}
          >
            <Link2 size={17} />
            {selectedFiles.length > 0
              ? `${selectedFiles.length} File${selectedFiles.length > 1 ? "s" : ""}`
              : "Attach Files"}
          </button>

          <button
            type="button"
            onClick={handleSubmitWork}
            disabled={!canSubmitWork || submittingWork}
            style={{
              width: 190,
              height: 49,
              borderRadius: 8,
              border: "none",
              background: GRADIENT,
              color: "#FFFFFF",
              fontWeight: 400,
              fontSize: 16,
              cursor: !canSubmitWork || submittingWork ? "not-allowed" : "pointer",
              opacity: !canSubmitWork || submittingWork ? 0.55 : 1,
            }}
          >
            {submittingWork ? "Submitting..." : "Submit Files"}
          </button>
        </div>

        {selectedFiles.length > 0 && (
          <div
            style={{
              marginTop: 12,
              textAlign: "center",
              fontSize: 11,
              lineHeight: "16px",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            {selectedFiles.map((file) => file.name).join(", ")}
          </div>
        )}
        {/* ── NDA (project accept hone ke baad download) ── */}
        {dealId && (
          <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
            <NdaButton
              dealId={dealId}
              token={token}
              apiBase={API_BASE}
              fallback={project}
              variant="compact"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Shared helpers for service-order deliverables ──────────────────────── */

const formatDate = (value?: string | Date | null) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

const handleDeliverableDownload = async (
  orderId: string,
  index: number,
  fallbackName: string,
  token?: string
) => {
  try {
    await downloadDeliverable(orderId, index, fallbackName, token);
  } catch (err: any) {
    toast({ title: "Download failed", description: err?.message || "Please try again." });
  }
};

/* ── Booking detail popup ─────────────────────────────────────────────────
   Answers the question the bookings list couldn't: what did this client pay
   for, what did they ask for, what did the listing promise, and where is the
   money. */
function BookingDetailModal({
  orderId,
  token,
  onClose,
  onChanged,
  onSubmitWork,
}: {
  orderId: string;
  token?: string;
  onClose: () => void;
  onChanged: () => void | Promise<void>;
  onSubmitWork: (order: any) => void;
}) {
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const load = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/services/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) setOrder({ ...data.order, revisionState: data.revisionState });
    } catch {
      // Empty state below covers it — no toast for a popup the user can reopen.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, token]);

  const handleStartWork = async () => {
    if (!token) return;
    try {
      setStarting(true);
      const res = await fetch(`${API_BASE}/api/services/orders/${orderId}/start-work`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.message || data?.error || "Could not start");
      toast({ title: "Work started", description: "The client has been notified." });
      await load();
      await onChanged();
    } catch (err: any) {
      toast({ title: "Couldn't start work", description: err?.message || "Please try again." });
    } finally {
      setStarting(false);
    }
  };

  const service = order?.serviceId && typeof order.serviceId === "object" ? order.serviceId : null;
  const buyer = order?.buyerId && typeof order.buyerId === "object" ? order.buyerId : null;
  const revisionState = order?.revisionState;
  const canSubmit = ["FUNDED", "IN_PROGRESS", "REVISION_REQUESTED"].includes(order?.status);

  const timeline = [
    { label: "Booked", at: order?.createdAt },
    { label: "Paid", at: order?.paidAt },
    { label: "Work started", at: order?.workStartedAt },
    { label: "Work submitted", at: order?.workSubmittedAt },
    { label: "Approved & released", at: order?.approvedAt },
  ].filter((t) => t.at);

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-xs text-white/45 shrink-0">{label}</span>
      <span className="text-sm text-white text-right">{value}</span>
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4">
      <p className="text-[10px] font-bold tracking-[1.4px] text-white/40 uppercase mb-2.5">{title}</p>
      {children}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-8"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[620px] max-w-full max-h-full flex flex-col rounded-2xl bg-[#0E0F12] text-white border border-white/10 overflow-hidden"
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b border-white/10 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            {order?.serviceMedia && (
              <img src={order.serviceMedia} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-semibold truncate">{order?.serviceTitle || "Booking"}</p>
              <p className="text-xs text-white/45 mt-0.5">
                Order #{String(orderId).slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-lg leading-none">✕</button>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto">
          {loading ? (
            <p className="text-white/45 text-sm">Loading booking…</p>
          ) : !order ? (
            <p className="text-white/45 text-sm">Couldn't load this booking. Close and try again.</p>
          ) : (
            <>
              <Section title="Client">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 grid place-items-center text-sm font-semibold shrink-0">
                    {(buyer?.name || "C").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{buyer?.name || "Client"}</p>
                    {buyer?.email && <p className="text-xs text-white/45 truncate">{buyer.email}</p>}
                  </div>
                </div>
              </Section>

              {/* The buyer's own brief. This is the field the seller was
                  missing entirely — the list never carried it. */}
              <Section title="What the client asked for">
                {order.note ? (
                  <p className="text-sm text-white/80 whitespace-pre-line leading-relaxed">{order.note}</p>
                ) : (
                  <p className="text-sm text-white/40">
                    No brief was written — the client booked the service as listed.
                  </p>
                )}
                {order.preferredDate && (
                  <p className="text-xs text-white/45 mt-3">
                    Preferred delivery date: {formatDate(order.preferredDate).split(",")[0]}
                  </p>
                )}
              </Section>

              {/* Terms live on the Service, not the order — the order only ever
                  snapshotted the title. */}
              {service && (
                <Section title="What this service promises">
                  {service.deliverables?.length ? (
                    <ul className="space-y-1.5 mb-3">
                      {service.deliverables.map((d: string, i: number) => (
                        <li key={i} className="text-sm text-white/75 flex gap-2">
                          <span className="text-white/30">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/50">
                    {service.delivery && <span>⏱ {service.delivery}</span>}
                    {service.revisions && <span>↺ {service.revisions}</span>}
                    <span>₹{Number(service.price || 0).toLocaleString("en-IN")} listed</span>
                  </div>
                </Section>
              )}

              <Section title="Payment">
                <Row label="Service price" value={`₹${Number(order.amount || 0).toLocaleString("en-IN")}`} />
                {/* Itemised: a flat "platform fee" line couldn't explain why a
                    10% commission takes 11.8% off the payout. */}
                {!!order.platformFee && (
                  <Row
                    label="Commission"
                    value={<span className="text-white/60">− ₹{Number(order.platformFee).toLocaleString("en-IN")}</span>}
                  />
                )}
                {!!order.platformFeeGst && (
                  <Row
                    label="GST on commission"
                    value={<span className="text-white/60">− ₹{Number(order.platformFeeGst).toLocaleString("en-IN")}</span>}
                  />
                )}
                <Row
                  label="You receive"
                  value={
                    <span className="font-semibold text-[#19E66C]">
                      ₹{Number(order.sellerAmount || 0).toLocaleString("en-IN")}
                    </span>
                  }
                />
                <div className="h-px bg-white/[0.07] my-2" />
                <Row label="Client paid" value={`₹${Number(order.totalPayable || 0).toLocaleString("en-IN")}`} />
                <Row
                  label="Escrow"
                  value={
                    order.fundsStatus === "HELD_BY_TOKUN"
                      ? "Held by Tokun"
                      : ["RELEASED_TO_SELLER", "AUTO_RELEASED"].includes(order.fundsStatus)
                      ? "Released to your wallet"
                      : "Not funded yet"
                  }
                />
              </Section>

              {/* The date this booking has to be delivered by, and how long is
                  left on it. Only while the work is still owed — after delivery
                  it's history, and the timeline below already records it. */}
              {canSubmit && order.deliveryDueAt && (
                <Section title="Delivery deadline">
                  <Row
                    label="Due"
                    value={new Date(order.deliveryDueAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  />
                  {(() => {
                    const dl = deadlineLabel(order.deliveryDueAt);
                    if (!dl) return null;
                    return (
                      <p
                        className="mt-1 text-sm font-semibold"
                        style={{
                          color:
                            dl.tone === "late"
                              ? "#FF8F8F"
                              : dl.tone === "soon"
                                ? "#FABC4E"
                                : "#63A6F2",
                        }}
                      >
                        {dl.text}
                      </p>
                    );
                  })()}
                  {order.deliveryOverdue && (
                    <p className="mt-2 text-[12px] leading-relaxed text-white/55">
                      You can no longer submit work on this booking. Talk to the client — they
                      can cancel for a refund, or Tokun can settle it between you.
                    </p>
                  )}
                </Section>
              )}

              <Section title="Revisions">
                <p className="text-sm text-white/80">
                  {revisionState?.unlimited
                    ? "Unlimited revisions included"
                    : `${revisionState?.used ?? 0} of ${revisionState?.allowed ?? 0} used${
                        revisionState?.exhausted ? " — no revisions left" : ""
                      }`}
                </p>
                {order.revisions?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {order.revisions.map((r: any, i: number) => (
                      <div key={i} className="rounded-lg bg-black/25 border border-white/[0.07] p-2.5">
                        <p className="text-[11px] text-white/40">
                          Revision {i + 1} · {formatDate(r.requestedAt)}
                        </p>
                        <p className="text-sm text-white/75 mt-1 whitespace-pre-line">
                          {r.reason || "No reason given"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {order.deliverables?.length > 0 && (
                <Section title={`Delivered${order.submissions?.length > 1 ? ` (v${order.submissions.length})` : ""}`}>
                  <div className="space-y-2">
                    {order.deliverables.map((d: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 rounded-lg bg-black/25 border border-white/[0.07] px-3 py-2"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <span>{d.kind === "link" ? "🔗" : "📎"}</span>
                          <div className="min-w-0">
                            <p className="text-sm truncate">{d.name}</p>
                            <p className="text-[11px] text-white/35">
                              {d.kind === "link"
                                ? SERVICE_LINK_LABELS[d.provider] || "External link"
                                : formatBytes(d.size)}
                            </p>
                          </div>
                        </div>
                        {d.kind === "link" ? (
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#63A6F2] hover:underline shrink-0"
                          >
                            Open
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeliverableDownload(orderId, i, d.name, token)}
                            className="text-xs text-[#63A6F2] hover:underline shrink-0"
                          >
                            Download
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {order.submissionNote && (
                    <p className="mt-3 text-sm text-white/60 whitespace-pre-line">{order.submissionNote}</p>
                  )}
                </Section>
              )}

              {timeline.length > 0 && (
                <Section title="Timeline">
                  <div className="space-y-1.5">
                    {timeline.map((t) => (
                      <div key={t.label} className="flex justify-between gap-4">
                        <span className="text-sm text-white/70">{t.label}</span>
                        <span className="text-xs text-white/40">{formatDate(t.at)}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}
        </div>

        {!loading && order && (order.status === "FUNDED" || canSubmit) && (
          <div className="p-4 border-t border-white/10 flex gap-2 shrink-0">
            {order.status === "FUNDED" && (
              <button
                onClick={handleStartWork}
                disabled={starting}
                className="flex-1 h-11 rounded-full text-sm font-semibold text-white border border-white/15 hover:bg-white/[0.06] disabled:opacity-60"
              >
                {starting ? "Starting…" : "Start Work"}
              </button>
            )}
            {canSubmit && !order.deliveryOverdue && (
              <button
                onClick={() => onSubmitWork({ ...order, _id: orderId, title: order.serviceTitle })}
                className="flex-1 h-11 rounded-full text-sm font-semibold text-white"
                style={{ background: GRAD }}
              >
                {order.status === "REVISION_REQUESTED" ? "Resubmit Work" : "Submit Work"}
              </button>
            )}

            {/* The server rejects a late delivery, so this says why rather than
                letting the seller find out after picking their files. */}
            {canSubmit && order.deliveryOverdue && (
              <button
                type="button"
                disabled
                title="The delivery deadline for this booking has passed."
                className="flex-1 h-11 rounded-full text-sm font-semibold text-white/40 border border-white/10 cursor-not-allowed"
              >
                Deadline passed — can't submit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SelfDash;