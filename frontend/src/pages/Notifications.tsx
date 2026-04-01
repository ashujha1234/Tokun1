
// // import { useEffect, useState } from "react";
// // import Header from "@/components/Header";
// // import Footer from "@/components/Footer";
// // import { X } from "lucide-react";
// // import { useAuth } from "@/contexts/AuthContext";
// // import { toast } from "@/components/ui/use-toast";
// // import DetailsPrompt from "@/components/DetailsPrompt";

// // type Notif = {
// //   _id: string;
// //   type: "ORG_SUGGEST" | "ORG_SHARE" | "ORG_SHARE_PURCHASED" | "TM_REQUEST" | string;
// //   message?: string;
// //   read?: boolean;
// //   createdAt?: string;
// //   promptId?: {
// //     _id: string;
// //     title?: string;
// //     price?: number;
// //     free?: boolean;
// //     exclusive?: boolean;
// //     attachment?: {
// //       path?: string;
// //     };
// //   } | null;
// //   senderName?: string;
// //   senderEmail?: string;
// //   senderImage?: string;
// // };

// // type SharedPrompt = {
// //   id: string;
// //   sharedAt?: string;
// //   senderName?: string;
// //   senderEmail?: string;
// //   senderImage?: string;
// //   message?: string | null;
// //   prompt?: {
// //     id: string;
// //     title: string;
// //     price?: number;
// //     free?: boolean;
// //     exclusive?: boolean;
// //     attachment?: {
// //       path?: string;
// //     };
// //   };
// // };

// // const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// // export default function NotificationsPage() {
// //   const [notifications, setNotifications] = useState<Notif[]>([]);
// //   const [sharedPrompts, setSharedPrompts] = useState<(Notif | SharedPrompt)[]>([]);
// //   const [orgPurchasedPrompts, setOrgPurchasedPrompts] = useState<SharedPrompt[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [tab, setTab] = useState<"all" | "shared" | "purchased" | "unread">("all");
// //   const [detailsOpen, setDetailsOpen] = useState(false);
// //   const [detailsPrompt, setDetailsPrompt] = useState<any>(null);

// //   const { token, user } = useAuth();
// //   const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

// //   /* ---------------- Fetch Notifications ---------------- */
// //   const fetchNotifications = async () => {
// //     if (!token) return;
// //     setLoading(true);
// //     try {
// //       const res = await fetch(`${API_BASE}/api/prompt-collab/notifications`, {
// //         headers: { ...(authHeader as any) },
// //       });
// //       const data = await res.json();
// //       if (data?.success) setNotifications(data.notifications || []);
// //     } catch (e) {
// //       console.error("notifications fetch failed:", e);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   /* ---------------- Fetch Org Purchased ---------------- */
// //   const fetchOrgPurchasedPrompts = async () => {
// //     if (!token || user?.userType !== "TM") return;
// //     try {
// //       const res = await fetch(`${API_BASE}/api/prompt-collab/shared/team`, {
// //         headers: { ...(authHeader as any) },
// //         credentials: "include",
// //       });
// //       const data = await res.json();
// //       if (data?.success) setOrgPurchasedPrompts(data.sharedPrompts || []);
// //     } catch (err) {
// //       console.error("Failed to load org purchased prompts:", err);
// //     }
// //   };

// //   /* ---------------- Build Shared with Me ---------------- */
// //   const loadSharedPrompts = async () => {
// //     const suggested = (notifications || []).filter(
// //       (n) =>
// //         (n.type === "ORG_SUGGEST" || n.type === "ORG_SHARE" || n.type === "ORG_SHARE_PURCHASED") &&
// //         n.promptId
// //     );

// //     const purchased = await fetch(`${API_BASE}/api/prompt-collab/shared/team`, {
// //       headers: { ...(authHeader as any) },
// //       credentials: "include",
// //     }).then((res) => res.json().catch(() => ({ sharedPrompts: [] })));

// //     const allShared = [...suggested, ...(purchased?.sharedPrompts || [])];
// //     const uniqueShared = Array.from(
// //       new Map(
// //         allShared.map((item: any) => [item?.promptId?._id || item?.prompt?.id, item])
// //       ).values()
// //     );

// //     setSharedPrompts(uniqueShared);
// //   };

// //   useEffect(() => {
// //     if (!token) return;
// //     fetchNotifications();
// //     if (user?.userType === "TM") fetchOrgPurchasedPrompts();
// //   }, [token]);

// //   useEffect(() => {
// //     if (notifications.length > 0) loadSharedPrompts();
// //   }, [notifications]);

// //   /* ---------------- Mark All Read ---------------- */
// //   const markAllRead = async () => {
// //     if (!token) return;
// //     try {
// //       const unread = notifications.filter((n) => !n.read);
// //       await Promise.all(
// //         unread.map((n) =>
// //           fetch(`${API_BASE}/api/prompt-collab/notifications/read/${encodeURIComponent(n._id)}`, {
// //             method: "POST",
// //             headers: { ...(authHeader as any) },
// //           })
// //         )
// //       );
// //       setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
// //     } catch (e) {
// //       console.error("markAllRead failed:", e);
// //     }
// //   };

// //   const openPromptDetails = async (promptId: string) => {
// //     try {
// //       const res = await fetch(`${API_BASE}/api/prompt/${promptId}`, {
// //         headers: { ...(authHeader as any) },
// //         credentials: "include",
// //       });
// //       const data = await res.json();
// //       if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to fetch prompt");
// //       setDetailsPrompt(data.prompt);
// //       setDetailsOpen(true);
// //     } catch (err: any) {
// //       toast({
// //         title: "Could not load prompt",
// //         description: err?.message || "Please try again.",
// //         variant: "destructive",
// //       });
// //     }
// //   };

// //   const renderPromptImage = (path?: string) => {
// //     return path ? (
// //       <img src={`${API_BASE}${path}`} alt="Prompt" className="w-full h-full object-cover" />
// //     ) : (
// //       <img src="/icons/pm2.png" alt="Prompt" className="w-full h-full object-cover" />
// //     );
// //   };

// //  const SenderBlock = (props: { name?: string; email?: string }) => (
// //   <div className="mt-3">
// //     <div className="text-sm font-semibold text-white">{props.name || "Unknown Sender"}</div>
// //     <div className="text-xs text-white/50">{props.email || "No email available"}</div>
// //   </div>
// // );


// //   const tabBtn = (id: typeof tab, label: string) => (
// //     <button
// //       key={id}
// //       onClick={() => setTab(id)}
// //       className={`relative pb-2 text-sm ${tab === id ? "text-white" : "text-white/80 hover:text-white"}`}
// //       style={{ borderBottom: tab === id ? "2px solid #A855F7" : "2px solid transparent" }}
// //     >
// //       {label}
// //     </button>
// //   );

// //   return (
// //     <>
// //       <Header />
// //       <main className="text-white">
// //         <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
// //           <div className="flex items-center justify-between mb-6">
// //             <h1 className="text-2xl font-semibold">Notifications</h1>
// //             {notifications.some((n) => !n.read) && (
// //               <button onClick={markAllRead} className="text-sm text-white/70 hover:text-white">
// //                 ✓ Mark all as Read
// //               </button>
// //             )}
// //           </div>

// //           <div className="flex items-center gap-6 mb-6">
// //             {tabBtn("all", "All")}
// //             {tabBtn("shared", "Shared with me")}
// //             {tabBtn("purchased", "Org Purchased")}
// //             {tabBtn("unread", "Unread")}
// //           </div>

// //           {/* 📨 Shared with me */}
// //           {tab === "shared" && (
// //             <div className="divide-y divide-white/10">
// //               {sharedPrompts.map((item: any, idx) => {
// //                 const prompt = item?.promptId || item?.prompt || {};
// //                 const promptId = prompt?._id || prompt?.id;
// //                 const attachmentPath = prompt?.attachment?.path;

// //                 return (
// //                   <div key={idx} className="flex items-start gap-4 py-5">
// //                     <div className="shrink-0 rounded-lg overflow-hidden" style={{ width: 64, height: 64 }}>
// //                       {renderPromptImage(attachmentPath)}
// //                     </div>

// //                     <div className="flex-1 min-w-0">
// //                       {item?.message && <div className="text-sm text-white/90 font-semibold mb-1">{item?.message}</div>}
// //                       <div className="text-[15px] font-medium text-white">{prompt?.title || "Untitled Prompt"}</div>
// //                       {typeof prompt?.price === "number" && (
// //                         <div className="text-sm text-white/60 mt-1">₹{prompt.price.toLocaleString()}</div>
// //                       )}

// //                       {/* ✅ Sender info */}
// //                       <SenderBlock
// //                         name={item?.senderName || item?.sharedBy || "Organization"}
// //                         email={item?.senderEmail || ""}
// //                         image={item?.senderImage || ""}
// //                       />

// //                       <div className="text-xs text-white/50 mt-1">
// //                         {item?.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
// //                       </div>

// //                       {promptId && (
// //                         <button
// //                           onClick={() => openPromptDetails(promptId)}
// //                           className="mt-3 px-4 py-2 rounded-md text-white text-sm bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
// //                         >
// //                           View
// //                         </button>
// //                       )}
// //                     </div>
// //                   </div>
// //                 );
// //               })}
// //             </div>
// //           )}

// //           {/* 🏢 Org Purchased */}
// //           {tab === "purchased" && (
// //             <div className="divide-y divide-white/10">
// //               {orgPurchasedPrompts.map((item, idx) => {
// //                 const prompt = item?.prompt || {};
// //                 const attachmentPath = prompt?.attachment?.path;

// //                 return (
// //                   <div key={idx} className="flex items-start gap-4 py-5">
// //                     <div className="shrink-0 rounded-lg overflow-hidden" style={{ width: 64, height: 64 }}>
// //                       {renderPromptImage(attachmentPath)}
// //                     </div>
// //                     <div className="flex-1 min-w-0">
// //                       <div className="text-[15px] font-medium text-white">{prompt?.title || "Untitled Prompt"}</div>
// //                       {typeof prompt?.price === "number" && (
// //                         <div className="text-sm text-white/60 mt-1">₹{prompt.price.toLocaleString()}</div>
// //                       )}

// //                       {/* ✅ Sender info */}
// //                       <SenderBlock
// //                         name={item?.senderName || "Organization"}
// //                         email={item?.senderEmail || ""}
// //                         image={item?.senderImage || ""}
// //                       />

// //                       {prompt?.id && (
// //                         <button
// //                           onClick={() => openPromptDetails(prompt.id)}
// //                           className="mt-3 px-4 py-2 rounded-md text-white text-sm bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
// //                         >
// //                           View
// //                         </button>
// //                       )}
// //                     </div>
// //                   </div>
// //                 );
// //               })}
// //             </div>
// //           )}

// //           {/* 📬 All Notifications */}
// //           {tab === "all" && (
// //             <div className="divide-y divide-white/10">
// //               {notifications.map((n) => {
// //                 const attachmentPath = n.promptId?.attachment?.path;
// //                 return (
// //                   <div key={n._id} className="flex items-start gap-4 py-5">
// //                     <div className="shrink-0 rounded-lg overflow-hidden" style={{ width: 64, height: 64 }}>
// //                       {renderPromptImage(attachmentPath)}
// //                     </div>
// //                     <div className="flex-1 min-w-0">
// //                       {n.message && <div className="text-sm text-white/90 font-semibold mb-1">{n.message}</div>}
// //                       {n.promptId && <div className="text-[15px] mt-1 font-medium">{n.promptId.title}</div>}

// //                       {/* ✅ Sender info */}
// //                       <SenderBlock name={n.senderName} email={n.senderEmail} image={n.senderImage} />
// //                     </div>
// //                   </div>
// //                 );
// //               })}
// //             </div>
// //           )}
// //         </div>
// //         <DetailsPrompt
// //           open={detailsOpen}
// //           onOpenChange={setDetailsOpen}
// //           prompt={detailsPrompt}
// //           owned={false}
// //           onPurchase={() => setDetailsOpen(false)}
// //           onEnlargeMedia={() => {}}
// //         />
        
// //       </main>
// //       <Footer />
// //     </>
// //   );
// // }


// import { useEffect, useState } from "react";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import { useAuth } from "@/contexts/AuthContext";
// import { toast } from "@/components/ui/use-toast";
// import DetailsPrompt from "@/components/DetailsPrompt";

// type Notif = {
//   _id: string;
//   type: "ORG_SUGGEST" | "ORG_SHARE" | "ORG_SHARE_PURCHASED" | "TM_REQUEST" | string;
//   message?: string;
//   read?: boolean;
//   createdAt?: string;
//   promptId?: {
//     _id: string;
//     title?: string;
//     price?: number;
//     attachment?: { path?: string };
//   } | null;
//   // may arrive either flattened (senderName/email) or nested in senderId
//   senderName?: string;
//   senderEmail?: string;
//   senderId?: { name?: string; email?: string };
// };

// type SharedPrompt = {
//   id: string;
//   sharedAt?: string;
//   message?: string | null;
//   // normalized sender info coming from backend
//   senderName?: string;
//   senderEmail?: string;
//   prompt?: {
//     id: string;
//     title: string;
//     price?: number;
//     attachment?: { path?: string };
//   };
// };

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// export default function NotificationsPage() {
//   const [notifications, setNotifications] = useState<Notif[]>([]);
//   const [sharedPrompts, setSharedPrompts] = useState<(Notif | SharedPrompt)[]>([]);
//   const [orgPurchasedPrompts, setOrgPurchasedPrompts] = useState<SharedPrompt[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [tab, setTab] = useState<"all" | "shared" | "purchased" | "unread">("all");
//   const [detailsOpen, setDetailsOpen] = useState(false);
//   const [detailsPrompt, setDetailsPrompt] = useState<any>(null);

//   const { token, user } = useAuth();
//   const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

//   const fetchNotifications = async () => {
//     if (!token) return;
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/api/prompt-collab/notifications`, {
//         headers: { ...(authHeader as any) },
//       });
//       const data = await res.json();
//       if (data?.success) setNotifications(data.notifications || []);
//     } catch (e) {
//       console.error("notifications fetch failed:", e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchOrgPurchasedPrompts = async () => {
//     if (!token || user?.userType !== "TM") return;
//     try {
//       const res = await fetch(`${API_BASE}/api/prompt-collab/shared/team`, {
//         headers: { ...(authHeader as any) },
//         credentials: "include",
//       });
//       const data = await res.json();
//       if (data?.success) setOrgPurchasedPrompts(data.sharedPrompts || []);
//     } catch (err) {
//       console.error("Failed to load org purchased prompts:", err);
//     }
//   };

//   const loadSharedPrompts = async () => {
//     const suggested = (notifications || []).filter(
//       (n) =>
//         (n.type === "ORG_SUGGEST" || n.type === "ORG_SHARE" || n.type === "ORG_SHARE_PURCHASED") &&
//         n.promptId
//     );

//     const purchased = await fetch(`${API_BASE}/api/prompt-collab/shared/team`, {
//       headers: { ...(authHeader as any) },
//       credentials: "include",
//     }).then((res) => res.json().catch(() => ({ sharedPrompts: [] })));

//     const allShared = [...suggested, ...(purchased?.sharedPrompts || [])];
//     const uniqueShared = Array.from(
//       new Map(allShared.map((item: any) => [item?.promptId?._id || item?.prompt?.id, item])).values()
//     );
//     setSharedPrompts(uniqueShared);
//   };

//   useEffect(() => {
//     if (!token) return;
//     fetchNotifications();
//     if (user?.userType === "TM") fetchOrgPurchasedPrompts();
//   }, [token]);

//   useEffect(() => {
//     if (notifications.length > 0) loadSharedPrompts();
//   }, [notifications]);

//   const markAllRead = async () => {
//     if (!token) return;
//     try {
//       const unread = notifications.filter((n) => !n.read);
//       await Promise.all(
//         unread.map((n) =>
//           fetch(`${API_BASE}/api/prompt-collab/notifications/read/${encodeURIComponent(n._id)}`, {
//             method: "POST",
//             headers: { ...(authHeader as any) },
//           })
//         )
//       );
//       setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
//     } catch (e) {
//       console.error("markAllRead failed:", e);
//     }
//   };

//  const openPromptDetails = async (promptId: string) => {
//   try {
//     const res = await fetch(`${API_BASE}/api/prompt/${promptId}`, {
//       headers: { ...(authHeader as any) },
//       credentials: "include",
//     });
//     const data = await res.json();
//     if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to fetch prompt");

//     const p = data.prompt;

//     // ✅ Normalize the data shape for DetailsPrompt
//     const normalizedPrompt = {
//       id: p._id,
//       title: p.title || "Untitled Prompt",
//       description: p.description || "",
//       price: p.price || 0,
//       rating: p.averageRating || 0,
//       downloads: p.downloads || 0,
//       category:
//         (Array.isArray(p.categories) && p.categories[0]?.name) ||
//         p.category ||
//         "General",
//       imageUrl: p.attachment?.type === "image" ? `${API_BASE}${p.attachment.path}` : undefined,
//       videoUrl: p.attachment?.type === "video" ? `${API_BASE}${p.attachment.path}` : undefined,
//       fullPrompt: p.promptText || "",
//     };

//     setDetailsPrompt(normalizedPrompt);
//     setDetailsOpen(true);
//   } catch (err: any) {
//     toast({
//       title: "Could not load prompt",
//       description: err?.message || "Please try again.",
//       variant: "destructive",
//     });
//   }
// };


//   const renderPromptImage = (path?: string) => {
//     return path ? (
//       <img src={`${API_BASE}${path}`} alt="Prompt" className="w-full h-full object-cover" />
//     ) : (
//       <img src="/icons/pm2.png" alt="Prompt" className="w-full h-full object-cover" />
//     );
//   };

//   // same typography as your All tab (no avatar)
//   const SenderBlock = (props: { name?: string; email?: string }) => (
//     <div className="mt-3">
//       <div className="text-sm font-semibold text-white">{props.name || "Unknown Sender"}</div>
//       <div className="text-xs text-white/50">{props.email || ""}</div>
//     </div>
//   );

//   const tabBtn = (id: typeof tab, label: string) => (
//     <button
//       key={id}
//       onClick={() => setTab(id)}
//       className={`relative pb-2 text-sm ${tab === id ? "text-white" : "text-white/80 hover:text-white"}`}
//       style={{ borderBottom: tab === id ? "2px solid #A855F7" : "2px solid transparent" }}
//     >
//       {label}
//     </button>
//   );

//   // 🔁 single card renderer used by All / Shared / Purchased to keep them identical
//   const renderCard = (opts: {
//     key: string | number;
//     message?: string;
//     title?: string;
//     attachmentPath?: string;
//     senderName?: string;
//     senderEmail?: string;
//     promptId?: string;
//   }) => (
//     <div key={opts.key} className="flex items-start gap-4 py-5">
//       <div className="shrink-0 rounded-lg overflow-hidden" style={{ width: 64, height: 64 }}>
//         {renderPromptImage(opts.attachmentPath)}
//       </div>
//       <div className="flex-1 min-w-0">
//         {opts.message && <div className="text-sm text-white/90 font-semibold mb-1">{opts.message}</div>}
//         {opts.title && <div className="text-[15px] mt-1 font-medium">{opts.title}</div>}
//         <SenderBlock name={opts.senderName} email={opts.senderEmail} />
//         {opts.promptId && (
//           <button
//             onClick={() => openPromptDetails(opts.promptId!)}
//             className="mt-3 px-4 py-2 rounded-md text-white text-sm bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
//           >
//             View
//           </button>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <>
//       <Header />
//       <main className="text-white">
//         <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
//           <div className="flex items-center justify-between mb-6">
//             <h1 className="text-2xl font-semibold">Notifications</h1>
//             {notifications.some((n) => !n.read) && (
//               <button onClick={markAllRead} className="text-sm text-white/70 hover:text-white">
//                 ✓ Mark all as Read
//               </button>
//             )}
//           </div>

//           <div className="flex items-center gap-6 mb-6">
//             {tabBtn("all", "All")}
//             {tabBtn("shared", "Shared with me")}
//             {/* {tabBtn("purchased", "Org Purchased")} */}
//             {tabBtn("unread", "Unread")}
//           </div>

//           {loading && <div className="text-white/60 mb-3 text-sm">Loading…</div>}

//           {/* 🔔 All */}
//           {tab === "all" && (
//             <div className="divide-y divide-white/10">
//               {notifications.map((n) =>
//                 renderCard({
//                   key: n._id,
//                   message: n.message,
//                   title: n.promptId?.title,
//                   attachmentPath: n.promptId?.attachment?.path,
//                   senderName: n.senderName || n.senderId?.name || "Organization",
//                   senderEmail: n.senderEmail || n.senderId?.email || "",
//                   promptId: n.promptId?._id,
//                 })
//               )}
//               {!notifications.length && !loading && (
//                 <div className="py-16 text-center text-white/60">No notifications here.</div>
//               )}
//             </div>
//           )}

//           {/* 👥 Shared with me — EXACT SAME LAYOUT AS ALL */}
//           {tab === "shared" && (
//             <div className="divide-y divide-white/10">
//               {sharedPrompts.map((item: any, idx) => {
//                 const prompt = item?.promptId || item?.prompt || {};
//                 return renderCard({
//                   key: idx,
//                   message: item?.message,
//                   title: prompt?.title,
//                   attachmentPath: prompt?.attachment?.path,
//                   senderName: item?.senderName || item?.senderId?.name || item?.sharedBy || "Organization",
//                   senderEmail: item?.senderEmail || item?.senderId?.email || "",
//                   promptId: prompt?._id || prompt?.id,
//                 });
//               })}
//               {!sharedPrompts.length && (
//                 <div className="py-16 text-center text-white/60">No shared prompts yet.</div>
//               )}
//             </div>
//           )}

//           {/* 🏢 Org Purchased — IDENTICAL LAYOUT */}
//           {tab === "purchased" && (
//             <div className="divide-y divide-white/10">
//               {orgPurchasedPrompts.map((item, idx) =>
//                 renderCard({
//                   key: idx,
//                   message: item?.message || undefined,
//                   title: item?.prompt?.title,
//                   attachmentPath: item?.prompt?.attachment?.path,
//                   senderName: item?.senderName || "Organization",
//                   senderEmail: item?.senderEmail || "",
//                   promptId: item?.prompt?.id,
//                 })
//               )}
//               {!orgPurchasedPrompts.length && (
//                 <div className="py-16 text-center text-white/60">
//                   No purchased prompts shared with you yet.
//                 </div>
//               )}
//             </div>
//           )}

//           {/* 📨 Unread */}
//           {tab === "unread" && (
//             <div className="divide-y divide-white/10">
//               {notifications
//                 .filter((n) => !n.read)
//                 .map((n) =>
//                   renderCard({
//                     key: n._id,
//                     message: n.message,
//                     title: n.promptId?.title,
//                     attachmentPath: n.promptId?.attachment?.path,
//                     senderName: n.senderName || n.senderId?.name || "Organization",
//                     senderEmail: n.senderEmail || n.senderId?.email || "",
//                     promptId: n.promptId?._id,
//                   })
//                 )}
//               {!notifications.filter((n) => !n.read).length && (
//                 <div className="py-16 text-center text-white/60">No unread notifications.</div>
//               )}
//             </div>
//           )}
//         </div>

//        <DetailsPrompt
//   open={detailsOpen}
//   onOpenChange={setDetailsOpen}
//   prompt={detailsPrompt}
//   owned={false}
//   onPurchase={(p) => {
//     console.log("Purchasing:", p);
//     setDetailsOpen(false);
//   }}
// />

//       </main>
//       <Footer />
//     </>
//   );
// }

import { FaCaretLeft } from "react-icons/fa";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import DetailsPrompt from "@/components/DetailsPrompt";
import { useNavigate } from "react-router-dom";
// type Notif = {
//   _id: string;
//   type: "ORG_SUGGEST" | "ORG_SHARE" | "ORG_SHARE_PURCHASED" | "TM_REQUEST" | string;
//   message?: string;
//   read?: boolean;
//   createdAt?: string;
//   promptId?: {
//     _id: string;
//     title?: string;
//     price?: number;
//     description?: string;
//     attachment?: { path?: string; type?: string };
//   } | null;
//   senderName?: string;
//   senderEmail?: string;
//   senderId?: { name?: string; email?: string };
// };

type Notif = {
  _id: string;
  type:
    | "ORG_SUGGEST"
    | "ORG_SHARE"
    | "ORG_SHARE_PURCHASED"
    | "TM_REQUEST"
    | "COLLAB_INVITE"
    | string;

  message?: string;
  read?: boolean;
  createdAt?: string;

  // ✅ for collab invite
  sessionId?: string;

  promptId?: {
    _id: string;
    title?: string;
    price?: number;
    description?: string;
    attachment?: { path?: string; type?: string };
    promptText?: string;
    categories?: any[];
    category?: string;
  } | null;

  senderName?: string;
  senderEmail?: string;
  senderId?: { name?: string; email?: string };
};


type SharedPrompt = {
  id: string;
  sharedAt?: string;
  message?: string | null;
  senderName?: string;
  senderEmail?: string;
  prompt?: {
    id: string;
    title: string;
    price?: number;
    description?: string;
    attachment?: { path?: string; type?: string };
  };
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [sharedPrompts, setSharedPrompts] = useState<(Notif | SharedPrompt)[]>([]);
  const [orgPurchasedPrompts, setOrgPurchasedPrompts] = useState<SharedPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"all" | "shared" | "purchased" | "unread">("all");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsPrompt, setDetailsPrompt] = useState<any>(null);

  const { token, user } = useAuth();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/prompt-collab/notifications`, {
        headers: { ...(authHeader as any) },
      });
      const data = await res.json();
      if (data?.success) setNotifications(data.notifications || []);
    } catch (e) {
      console.error("notifications fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgPurchasedPrompts = async () => {
    if (!token || user?.userType !== "TM") return;
    try {
      const res = await fetch(`${API_BASE}/api/prompt-collab/shared/team`, {
        headers: { ...(authHeader as any) },
        credentials: "include",
      });
      const data = await res.json();
      if (data?.success) setOrgPurchasedPrompts(data.sharedPrompts || []);
    } catch (err) {
      console.error("Failed to load org purchased prompts:", err);
    }
  };

  const loadSharedPrompts = async () => {
    const suggested = (notifications || []).filter(
      (n) =>
        (n.type === "ORG_SUGGEST" || n.type === "ORG_SHARE" || n.type === "ORG_SHARE_PURCHASED") &&
        n.promptId
    );

    const purchased = await fetch(`${API_BASE}/api/prompt-collab/shared/team`, {
      headers: { ...(authHeader as any) },
      credentials: "include",
    }).then((res) => res.json().catch(() => ({ sharedPrompts: [] })));

    const allShared = [...suggested, ...(purchased?.sharedPrompts || [])];
    const uniqueShared = Array.from(
      new Map(allShared.map((item: any) => [item?.promptId?._id || item?.prompt?.id, item])).values()
    );
    setSharedPrompts(uniqueShared);
  };

  useEffect(() => {
    if (!token) return;
    fetchNotifications();
    if (user?.userType === "TM") fetchOrgPurchasedPrompts();
  }, [token]);

  useEffect(() => {
    if (notifications.length > 0) loadSharedPrompts();
  }, [notifications]);

  const markAllRead = async () => {
    if (!token) return;
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(
        unread.map((n) =>
          fetch(`${API_BASE}/api/prompt-collab/notifications/read/${encodeURIComponent(n._id)}`, {
            method: "POST",
            headers: { ...(authHeader as any) },
          })
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error("markAllRead failed:", e);
    }
  };

  // ✅ Normalize data and open popup instantly
  const openPromptDetails = (prompt: any) => {
    if (!prompt?._id && !prompt?.id) {
      toast({
        title: "Prompt not found",
        description: "Could not open this prompt. Try refreshing.",
        variant: "destructive",
      });
      return;
    }
   
    const normalizedPrompt = {
      id: prompt._id || prompt.id,
      title: prompt.title || "Untitled Prompt",
      description: prompt.description || "",
      price: prompt.price || 0,
      rating: prompt.averageRating || 0,
      downloads: prompt.downloads || 0,
      category:
        (Array.isArray(prompt.categories) && prompt.categories[0]?.name) ||
        prompt.category ||
        "General",
      imageUrl: prompt.attachment?.type === "image" ? `${API_BASE}${prompt.attachment?.path}` : undefined,
      videoUrl: prompt.attachment?.type === "video" ? `${API_BASE}${prompt.attachment?.path}` : undefined,
      fullPrompt: prompt.promptText || "",
    };

    setDetailsPrompt(normalizedPrompt);
    setDetailsOpen(true);
  };



  // ⭐ Accept collaboration invite → redirect to optimizer with sessionId
// ⭐ Accept collaboration invite → redirect to optimizer with sessionId
const acceptInvite = (sessionId: string) => {
  if (!sessionId) {
    toast({
      title: "Invalid session",
      description: "Could not join collaboration session.",
      variant: "destructive",
    });
    return;
  }

  // 👇 must match your Route path exactly
  navigate(`/prompt-optimization?sessionId=${sessionId}`);
};





  const renderPromptImage = (path?: string) => {
    return path ? (
      <img src={`${API_BASE}${path}`} alt="Prompt" className="w-full h-full object-cover" />
    ) : (
      <img src="/icons/pm2.png" alt="Prompt" className="w-full h-full object-cover" />
    );
  };

  const SenderBlock = (props: { name?: string; email?: string }) => (
    <div className="mt-3">
      <div className="text-sm font-semibold text-white">{props.name || "Unknown Sender"}</div>
      <div className="text-xs text-white/50">{props.email || ""}</div>
    </div>
  );

  const tabBtn = (id: typeof tab, label: string) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      className={`relative pb-2 text-sm ${tab === id ? "text-white" : "text-white/80 hover:text-white"}`}
      style={{ borderBottom: tab === id ? "2px solid #A855F7" : "2px solid transparent" }}
    >
      {label}
    </button>
  );

  const renderCard = (opts: {
    key: string | number;
    message?: string;
    title?: string;
    attachmentPath?: string;
    senderName?: string;
    senderEmail?: string;
    prompt?: any;
    actionButton?: React.ReactNode; // ✅ NEW
  }) => (
    <div key={opts.key} className="flex items-start gap-4 py-5">
      <div className="shrink-0 rounded-lg overflow-hidden" style={{ width: 64, height: 64 }}>
        {renderPromptImage(opts.attachmentPath)}
      </div>

      <div className="flex-1 min-w-0">
        {opts.message && (
          <div className="text-sm text-white/90 font-semibold mb-1">
            {opts.message}
          </div>
        )}

        {opts.title && (
          <div className="text-[15px] mt-1 font-medium">
            {opts.title}
          </div>
        )}

        <SenderBlock name={opts.senderName} email={opts.senderEmail} />

        {/* ✅ Buttons row */}
        <div className="mt-3 flex items-center gap-2">
          {/* Default View button (only if prompt exists) */}
          {opts.prompt && (
            <button
              onClick={() => openPromptDetails(opts.prompt)}
              className="px-4 py-2 rounded-md text-white text-sm bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
            >
              View
            </button>
          )}

          {/* Custom action button (Accept/Join etc.) */}
          {opts.actionButton}
        </div>
      </div>
    </div>
  );


  return (
    <>
      <Header />
      <main className="text-white pt-24 md:pt-28">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
       
 <div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <button
      onClick={() => navigate("/smartgen")}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-white/80 hover:text-white hover:bg-white/10 transition"
      aria-label="Back to SmartGen"
      title="Back to SmartGen"
    >
      <FaCaretLeft className="text-white text-lg -ml-1" />
      <span className="text-sm font-medium">Back</span>
    </button>

    <h1 className="text-2xl font-semibold">Notifications</h1>
  </div>

  {notifications.some((n) => !n.read) && (
    <button onClick={markAllRead} className="text-sm text-white/70 hover:text-white">
      ✓ Mark all as Read
    </button>
  )}
</div>

          <div className="flex items-center gap-6 mb-6">
            {tabBtn("all", "All")}
            {tabBtn("shared", "Shared with me")}
            {tabBtn("unread", "Unread")}
          </div>

          {loading && <div className="text-white/60 mb-3 text-sm">Loading…</div>}

  {tab === "all" && (
  <div className="divide-y divide-white/10">
    {notifications.map((n) => {

      // ✅ Collaboration Invite UI
      if (n.type === "COLLAB_INVITE") {
        return renderCard({
          key: n._id,
          message: n.message || "You have a collaboration invite",
          title: "Prompt Optimizer Collaboration",
          attachmentPath: "/icons/collab.png",
          senderName: n.senderName || n.senderId?.name || "Collaborator",
          senderEmail: n.senderEmail || n.senderId?.email || "",
          prompt: null,
          actionButton: (
            <button
              onClick={() => acceptInvite(n.sessionId || "")}
              className="px-4 py-2 rounded-md text-white text-sm bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
            >
              Accept & Join
            </button>
          ),
        });
      }

      // ✅ Default
      return renderCard({
        key: n._id,
        message: n.message,
        title: n.promptId?.title,
        attachmentPath: n.promptId?.attachment?.path,
        senderName: n.senderName || n.senderId?.name || "Organization",
        senderEmail: n.senderEmail || n.senderId?.email || "",
        prompt: n.promptId,
      });
    })}

    {!notifications.length && !loading && (
      <div className="py-16 text-center text-white/60">No notifications here.</div>
    )}
  </div>
)}


          {tab === "shared" && (
            <div className="divide-y divide-white/10">
              {sharedPrompts.map((item: any, idx) => {
                const prompt = item?.promptId || item?.prompt || {};
                return renderCard({
                  key: idx,
                  message: item?.message,
                  title: prompt?.title,
                  attachmentPath: prompt?.attachment?.path,
                  senderName: item?.senderName || item?.senderId?.name || item?.sharedBy || "Organization",
                  senderEmail: item?.senderEmail || item?.senderId?.email || "",
                  prompt,
                });
              })}
              {!sharedPrompts.length && (
                <div className="py-16 text-center text-white/60">No shared prompts yet.</div>
              )}
            </div>
          )}

          {tab === "unread" && (
            <div className="divide-y divide-white/10">
              {notifications
                .filter((n) => !n.read)
                .map((n) =>
                  renderCard({
                    key: n._id,
                    message: n.message,
                    title: n.promptId?.title,
                    attachmentPath: n.promptId?.attachment?.path,
                    senderName: n.senderName || n.senderId?.name || "Organization",
                    senderEmail: n.senderEmail || n.senderId?.email || "",
                    prompt: n.promptId,
                  })
                )}
              {!notifications.filter((n) => !n.read).length && (
                <div className="py-16 text-center text-white/60">No unread notifications.</div>
              )}
            </div>
          )}
        </div>

        <DetailsPrompt
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          prompt={detailsPrompt}
          owned={false}
          onPurchase={(p) => {
            console.log("Purchasing:", p);
            setDetailsOpen(false);
          }}
        />
      </main>
      <Footer />
    </>
  );
}
