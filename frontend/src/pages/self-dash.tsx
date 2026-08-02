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
//                   <NavButton id="prompts"      label="MY PROMPTS"      icon="/icons/self.svg" />
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
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import DetailsPrompt, { MarketplacePrompt } from "../components/historyDetail";
import NdaButton from "@/components/NdaCard";

const GRADIENT = "linear-gradient(270deg,#FF14EF 0%, #1A73E8 100%)";
const GRAD = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";
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

const formatDashboardDate = (value: string) => {
  if (!value) return "OCTOBER 24";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "OCTOBER 24";
  return new Date(year, month - 1, day)
    .toLocaleDateString("en-US", { month: "long", day: "numeric" })
    .toUpperCase();
};

type DashTab = "dashboard" | "requests" | "serviceBookings" | "prompts" | "subscription";
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
}: {
  prompt: Prompt;
  showImages?: boolean;
  playingVideo: number | string | null;
  onToggleVideo: (id: number | string) => void;
  onPreview: (p: Prompt) => void;
  isUploaded?: boolean;
  onDelete?: (p: Prompt) => void;
}) {
  const isPlaying = playingVideo === prompt.id;
  const priceLabel = prompt.isFree ? "FREE" : `₹${(prompt.price ?? 0).toFixed(2)}`;
  const isVideo = !showImages && !!prompt.videoUrl;

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
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete?.(prompt); }}
                  className="flex items-center justify-center"
                  style={{ width: 32, height: 32, borderRadius: 50, background: "rgba(255,255,255,0.12)" }}
                >
                  <Trash className="h-3.5 w-3.5 text-white/90" />
                </button>
              ) : (
                <div
                  className="flex items-center justify-center"
                  style={{ width: 32, height: 32, borderRadius: 50, background: "rgba(255,255,255,0.12)" }}
                >
                  <img src="/icons/cop1.png" alt="cop1" className="h-3.5" />
                </div>
              )}
            </div>
          </div>
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
          <div className="mt-auto pt-3 px-1 flex items-center gap-2">
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
          </div>
        )}
      </CardContent>
    </Card>
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
  const { user, token } = useAuth() as any;

  const displayName = user?.name?.trim() || user?.email?.split("@")?.[0] || "User";
  const avatar =
    user?.avatar?.startsWith("http")
      ? user.avatar
      : user?.avatar
      ? `${import.meta.env.VITE_API_URL || ""}${user.avatar}`
      : `https://i.pravatar.cc/160?u=${encodeURIComponent(displayName)}`;

  const location = useLocation();
  const initialParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [activeTab, setActiveTab] = useState<DashTab>(
    initialParams.get("tab") === "prompts" ? "prompts" : "dashboard"
  );
  const [promptsTab, setPromptsTab] = useState<PromptsTab>(
    initialParams.get("p") === "uploaded" ? "uploaded" : "purchased"
  );
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
      prefill: {
        name: user?.name || "Tokun User",
        email: user?.email || "user@example.com",
        contact: user?.phone || "9999999999",
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

const startUserSubscriptionPurchase = async (
  plan: PlanKey,
  annual: boolean
) => {
  const planKey = toServerPlanKey(plan);

  if (!planKey) {
    toast({
      title: "Invalid plan",
      description: "Enterprise plan uses organization checkout.",
      variant: "destructive",
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

    await verifyUserPayment(checkoutRes);

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
        variant: "destructive",
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
      variant: "destructive",
    });
    return;
  }

  const orgId = user?.orgId || null;

  if (!orgId) {
    toast({
      title: "Organization missing",
      description: "We could not find your Organization ID.",
      variant: "destructive",
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
        variant: "destructive",
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
  variant: "destructive",
});

    return;
  }

  if (!token) {
    toast({
      title: "Login required",
      description: "Please login again.",
      variant: "destructive",
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

    if (!res.ok || !data?.success) {
      throw new Error(data?.error || "Failed to accept proposal");
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
      variant: "destructive",
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
        const revenue = Number(doc.revenue ?? doc.totalRevenue ?? doc.totalEarning ?? doc.earnings ?? doc.cost ?? doc.totalCost ?? (sales * price) ?? 0);
        return {
          id, title, description, category, price, rating,
          downloads: doc.downloads || 0, sales, revenue,
          imageUrl, videoUrl,
          preview: description || (promptText?.slice(0, 140) || ""),
          isFree, uploadedAt, isUploadedByMe: true, promptText, fullPrompt,
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
    const ok = window.confirm("Delete this prompt permanently?");
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
      toast({ title: "Deleted", description: "Prompt removed from your uploads." });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err?.message || "Could not delete.", variant: "destructive" });
    }
  };

  /* ── Totals ── */
  const totalPurchasedBill = purchaseHistory.reduce((sum, p) => sum + (p.price || 0), 0);
  const totalEarningsINR = uploadHistory.reduce((sum, p) => sum + ((p.sales ?? 0) * (p.price ?? 0)), 0);





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
                    <div key={r._id} style={{ borderRadius: 16, background: "#FFFFFF05", border: "1px solid #FFFFFF0F", padding: "16px" }}>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span style={{ fontWeight: 700, color: "#FFFFFF", fontSize: 14 }}>{r.title}</span>
                        {statusBadge(r.status)}
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "#8F8996" }}>
                        From {r.buyerName} · ₹{Number(r.amount).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5 text-white/45">No new booking requests yet.</div>
                )}
              </div>

              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16, color: "#FFFFFF", margin: "0 0 12px" }}>Active Bookings</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {summary?.projects?.length ? (
                  summary.projects.map((p) => (
                    <div key={p._id} style={{ borderRadius: 16, background: "#FFFFFF05", border: "1px solid #FFFFFF0F", padding: "16px" }}>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span style={{ fontWeight: 700, color: "#FFFFFF", fontSize: 14 }}>{p.title}</span>
                        {statusBadge(p.status)}
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "#8F8996" }}>
                        {p.buyerName} · ₹{Number(p.sellerAmount ?? p.amount).toLocaleString("en-IN")}
                      </p>
                      {canSubmit(p.status) && (
                        <button
                          type="button"
                          onClick={() => setSubmitFor(p)}
                          className="mt-3 w-full h-9 rounded-lg text-sm font-semibold text-white"
                          style={{ background: GRAD }}
                        >
                          Submit Work
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5 text-white/45">No active bookings yet.</div>
                )}
              </div>
            </>
          )}
        </div>

        {submitFor && (
          <SubmitServiceWorkModal
            order={submitFor}
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

    return (
      <div className="relative z-10">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 style={{ margin: 0, fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 22, lineHeight: "100%", color: "#FFFFFF" }}>
            My Prompts
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
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
            ? "Prompts you bought"
            : "Prompts uploaded by you"}
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
</div>

        {/* Grid */}
        {isLoading ? (
          <p className="text-white/50 text-sm py-8 text-center">Loading…</p>
        ) : isError ? (
          <p className="text-red-400 text-sm py-8 text-center">{isError}</p>
        ) : items.length === 0 ? (
          <EmptyState message={isPurchased ? "No prompts purchased yet." : "No uploaded prompts yet."} />
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
                  <NavButton id="prompts"         label="MY PROMPTS"      icon="/icons/self.svg" />
                  <NavButton id="subscription"    label="MY SUBSCRIPTION" icon="/icons/req.svg"  />
                </nav>
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <section
            className="relative min-w-0 flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8"
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
                    <p style={{ margin: "6px 0 0", fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 11, lineHeight: "100%", color: "#A1A1AA" }}>10:45 AM GMT</p>
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
                        <button type="button" onClick={() => setCalendarMonth((prev) => { const next = new Date(prev); next.setMonth(next.getMonth() + 1); return next; })} className="h-8 w-8 rounded-full bg-white/10 text-white hover:bg-white/15">›</button>
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
                          return (
                            <button key={day} type="button" onClick={() => { setSelectedDate(value); setShowCalendar(false); }} className={`h-8 rounded-full text-xs transition ${active ? "text-white" : "text-white/70 hover:bg-white/10"}`} style={active ? { background: GRADIENT } : {}}>
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

            <div className={activeTab === "requests" ? "relative z-10 h-[calc(100%-0px)]" : "relative z-10 mt-6"}>
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
        variant: "destructive",
      });
      return;
    }

    if (!dealId) {
      toast({
  title: "Deal not found",
  description: "Project ID is missing. Please refresh and try again.",
  variant: "destructive",
});

      return;
    }

    if (!canSubmitWork) {
     toast({
  title: "Cannot submit yet",
  description: "Project can only be submitted after client payment is received.",
  variant: "destructive",
});

      return;
    }

    if (!selectedFiles.length) {
      toast({
  title: "No files attached",
  description: "Please attach files before submitting.",
  variant: "destructive",
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
        variant: "destructive",
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

/* ── Submit Work modal for a booked service (mirrors ProposalDetailModal's
   handleSubmitWork, pointed at /api/services/orders/... instead) ── */
function SubmitServiceWorkModal({
  order,
  token,
  onClose,
  onSubmitted,
}: {
  order: any;
  token?: string;
  onClose: () => void;
  onSubmitted: () => void | Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!token) {
      toast({ title: "Login required", description: "Please login again.", variant: "destructive" });
      return;
    }
    if (!selectedFiles.length && !note.trim()) {
      toast({ title: "Nothing to submit", description: "Attach a file or add a note.", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const uploadedFiles: any[] = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch(`${API_BASE}/api/services/orders/${order._id}/upload-work-file`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
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

      const submitRes = await fetch(`${API_BASE}/api/services/orders/${order._id}/submit-work`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ note, deliverables: uploadedFiles }),
      });
      const submitData = await submitRes.json().catch(() => ({}));
      if (!submitRes.ok || !submitData?.success) {
        throw new Error(submitData?.error || "Failed to submit work");
      }

      toast({ title: "Work submitted", description: "Sent to the client for review in chat." });
      await onSubmitted();
      onClose();
    } catch (err: any) {
      toast({ title: "Submit failed", description: err?.message || "Could not submit work.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-[440px] max-w-full rounded-2xl bg-[#0E0F12] text-white border border-white/10">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <p className="font-semibold">Submit Work</p>
            <p className="text-xs text-white/50">{order?.title}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Files</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-11 rounded-lg border border-dashed border-white/20 text-sm text-white/60 hover:border-white/40"
            >
              {selectedFiles.length ? `${selectedFiles.length} file(s) selected` : "Attach files"}
            </button>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Note (optional)</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything the client should know about this delivery…"
              className="w-full h-24 rounded-lg bg-[#1A1A1A] border border-white/10 p-3 text-sm outline-none resize-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-11 rounded-full text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: GRAD }}
          >
            {submitting ? "Submitting…" : "Submit to Client"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelfDash;