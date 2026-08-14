
// // // import { useEffect, useState } from "react";
// // // import Header from "@/components/Header";
// // // import Footer from "@/components/Footer";
// // // import { X } from "lucide-react";
// // // import { useAuth } from "@/contexts/AuthContext";
// // // import { toast } from "@/components/ui/use-toast";
// // // import DetailsPrompt from "@/components/DetailsPrompt";

// // // type Notif = {
// // //   _id: string;
// // //   type: "ORG_SUGGEST" | "ORG_SHARE" | "ORG_SHARE_PURCHASED" | "TM_REQUEST" | string;
// // //   message?: string;
// // //   read?: boolean;
// // //   createdAt?: string;
// // //   promptId?: {
// // //     _id: string;
// // //     title?: string;
// // //     price?: number;
// // //     free?: boolean;
// // //     exclusive?: boolean;
// // //     attachment?: {
// // //       path?: string;
// // //     };
// // //   } | null;
// // //   senderName?: string;
// // //   senderEmail?: string;
// // //   senderImage?: string;
// // // };

// // // type SharedPrompt = {
// // //   id: string;
// // //   sharedAt?: string;
// // //   senderName?: string;
// // //   senderEmail?: string;
// // //   senderImage?: string;
// // //   message?: string | null;
// // //   prompt?: {
// // //     id: string;
// // //     title: string;
// // //     price?: number;
// // //     free?: boolean;
// // //     exclusive?: boolean;
// // //     attachment?: {
// // //       path?: string;
// // //     };
// // //   };
// // // };

// // // const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// // // export default function NotificationsPage() {
// // //   const [notifications, setNotifications] = useState<Notif[]>([]);
// // //   const [sharedPrompts, setSharedPrompts] = useState<(Notif | SharedPrompt)[]>([]);
// // //   const [orgPurchasedPrompts, setOrgPurchasedPrompts] = useState<SharedPrompt[]>([]);
// // //   const [loading, setLoading] = useState(false);
// // //   const [tab, setTab] = useState<"all" | "shared" | "purchased" | "unread">("all");
// // //   const [detailsOpen, setDetailsOpen] = useState(false);
// // //   const [detailsPrompt, setDetailsPrompt] = useState<any>(null);

// // //   const { token, user } = useAuth();
// // //   const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

// // //   /* ---------------- Fetch Notifications ---------------- */
// // //   const fetchNotifications = async () => {
// // //     if (!token) return;
// // //     setLoading(true);
// // //     try {
// // //       const res = await fetch(`${API_BASE}/api/prompt-collab/notifications`, {
// // //         headers: { ...(authHeader as any) },
// // //       });
// // //       const data = await res.json();
// // //       if (data?.success) setNotifications(data.notifications || []);
// // //     } catch (e) {
// // //       console.error("notifications fetch failed:", e);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   /* ---------------- Fetch Org Purchased ---------------- */
// // //   const fetchOrgPurchasedPrompts = async () => {
// // //     if (!token || user?.userType !== "TM") return;
// // //     try {
// // //       const res = await fetch(`${API_BASE}/api/prompt-collab/shared/team`, {
// // //         headers: { ...(authHeader as any) },
// // //         credentials: "include",
// // //       });
// // //       const data = await res.json();
// // //       if (data?.success) setOrgPurchasedPrompts(data.sharedPrompts || []);
// // //     } catch (err) {
// // //       console.error("Failed to load org purchased prompts:", err);
// // //     }
// // //   };

// // //   /* ---------------- Build Shared with Me ---------------- */
// // //   const loadSharedPrompts = async () => {
// // //     const suggested = (notifications || []).filter(
// // //       (n) =>
// // //         (n.type === "ORG_SUGGEST" || n.type === "ORG_SHARE" || n.type === "ORG_SHARE_PURCHASED") &&
// // //         n.promptId
// // //     );

// // //     const purchased = await fetch(`${API_BASE}/api/prompt-collab/shared/team`, {
// // //       headers: { ...(authHeader as any) },
// // //       credentials: "include",
// // //     }).then((res) => res.json().catch(() => ({ sharedPrompts: [] })));

// // //     const allShared = [...suggested, ...(purchased?.sharedPrompts || [])];
// // //     const uniqueShared = Array.from(
// // //       new Map(
// // //         allShared.map((item: any) => [item?.promptId?._id || item?.prompt?.id, item])
// // //       ).values()
// // //     );

// // //     setSharedPrompts(uniqueShared);
// // //   };

// // //   useEffect(() => {
// // //     if (!token) return;
// // //     fetchNotifications();
// // //     if (user?.userType === "TM") fetchOrgPurchasedPrompts();
// // //   }, [token]);

// // //   useEffect(() => {
// // //     if (notifications.length > 0) loadSharedPrompts();
// // //   }, [notifications]);

// // //   /* ---------------- Mark All Read ---------------- */
// // //   const markAllRead = async () => {
// // //     if (!token) return;
// // //     try {
// // //       const unread = notifications.filter((n) => !n.read);
// // //       await Promise.all(
// // //         unread.map((n) =>
// // //           fetch(`${API_BASE}/api/prompt-collab/notifications/read/${encodeURIComponent(n._id)}`, {
// // //             method: "POST",
// // //             headers: { ...(authHeader as any) },
// // //           })
// // //         )
// // //       );
// // //       setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
// // //     } catch (e) {
// // //       console.error("markAllRead failed:", e);
// // //     }
// // //   };

// // //   const openPromptDetails = async (promptId: string) => {
// // //     try {
// // //       const res = await fetch(`${API_BASE}/api/prompt/${promptId}`, {
// // //         headers: { ...(authHeader as any) },
// // //         credentials: "include",
// // //       });
// // //       const data = await res.json();
// // //       if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to fetch prompt");
// // //       setDetailsPrompt(data.prompt);
// // //       setDetailsOpen(true);
// // //     } catch (err: any) {
// // //       toast({
// // //         title: "Could not load prompt",
// // //         description: err?.message || "Please try again.",
// // //         // // //       });
// // //     }
// // //   };

// // //   const renderPromptImage = (path?: string) => {
// // //     return path ? (
// // //       <img src={`${API_BASE}${path}`} alt="Prompt" className="w-full h-full object-cover" />
// // //     ) : (
// // //       <img src="/icons/pm2.png" alt="Prompt" className="w-full h-full object-cover" />
// // //     );
// // //   };

// // //  const SenderBlock = (props: { name?: string; email?: string }) => (
// // //   <div className="mt-3">
// // //     <div className="text-sm font-semibold text-white">{props.name || "Unknown Sender"}</div>
// // //     <div className="text-xs text-white/50">{props.email || "No email available"}</div>
// // //   </div>
// // // );


// // //   const tabBtn = (id: typeof tab, label: string) => (
// // //     <button
// // //       key={id}
// // //       onClick={() => setTab(id)}
// // //       className={`relative pb-2 text-sm ${tab === id ? "text-white" : "text-white/80 hover:text-white"}`}
// // //       style={{ borderBottom: tab === id ? "2px solid #A855F7" : "2px solid transparent" }}
// // //     >
// // //       {label}
// // //     </button>
// // //   );

// // //   return (
// // //     <>
// // //       <Header />
// // //       <main className="text-white">
// // //         <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
// // //           <div className="flex items-center justify-between mb-6">
// // //             <h1 className="text-2xl font-semibold">Notifications</h1>
// // //             {notifications.some((n) => !n.read) && (
// // //               <button onClick={markAllRead} className="text-sm text-white/70 hover:text-white">
// // //                 ✓ Mark all as Read
// // //               </button>
// // //             )}
// // //           </div>

// // //           <div className="flex items-center gap-6 mb-6">
// // //             {tabBtn("all", "All")}
// // //             {tabBtn("shared", "Shared with me")}
// // //             {tabBtn("purchased", "Org Purchased")}
// // //             {tabBtn("unread", "Unread")}
// // //           </div>

// // //           {/* 📨 Shared with me */}
// // //           {tab === "shared" && (
// // //             <div className="divide-y divide-white/10">
// // //               {sharedPrompts.map((item: any, idx) => {
// // //                 const prompt = item?.promptId || item?.prompt || {};
// // //                 const promptId = prompt?._id || prompt?.id;
// // //                 const attachmentPath = prompt?.attachment?.path;

// // //                 return (
// // //                   <div key={idx} className="flex items-start gap-4 py-5">
// // //                     <div className="shrink-0 rounded-lg overflow-hidden" style={{ width: 64, height: 64 }}>
// // //                       {renderPromptImage(attachmentPath)}
// // //                     </div>

// // //                     <div className="flex-1 min-w-0">
// // //                       {item?.message && <div className="text-sm text-white/90 font-semibold mb-1">{item?.message}</div>}
// // //                       <div className="text-[15px] font-medium text-white">{prompt?.title || "Untitled Prompt"}</div>
// // //                       {typeof prompt?.price === "number" && (
// // //                         <div className="text-sm text-white/60 mt-1">₹{prompt.price.toLocaleString()}</div>
// // //                       )}

// // //                       {/* ✅ Sender info */}
// // //                       <SenderBlock
// // //                         name={item?.senderName || item?.sharedBy || "Organization"}
// // //                         email={item?.senderEmail || ""}
// // //                         image={item?.senderImage || ""}
// // //                       />

// // //                       <div className="text-xs text-white/50 mt-1">
// // //                         {item?.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
// // //                       </div>

// // //                       {promptId && (
// // //                         <button
// // //                           onClick={() => openPromptDetails(promptId)}
// // //                           className="mt-3 px-4 py-2 rounded-md text-white text-sm bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
// // //                         >
// // //                           View
// // //                         </button>
// // //                       )}
// // //                     </div>
// // //                   </div>
// // //                 );
// // //               })}
// // //             </div>
// // //           )}

// // //           {/* 🏢 Org Purchased */}
// // //           {tab === "purchased" && (
// // //             <div className="divide-y divide-white/10">
// // //               {orgPurchasedPrompts.map((item, idx) => {
// // //                 const prompt = item?.prompt || {};
// // //                 const attachmentPath = prompt?.attachment?.path;

// // //                 return (
// // //                   <div key={idx} className="flex items-start gap-4 py-5">
// // //                     <div className="shrink-0 rounded-lg overflow-hidden" style={{ width: 64, height: 64 }}>
// // //                       {renderPromptImage(attachmentPath)}
// // //                     </div>
// // //                     <div className="flex-1 min-w-0">
// // //                       <div className="text-[15px] font-medium text-white">{prompt?.title || "Untitled Prompt"}</div>
// // //                       {typeof prompt?.price === "number" && (
// // //                         <div className="text-sm text-white/60 mt-1">₹{prompt.price.toLocaleString()}</div>
// // //                       )}

// // //                       {/* ✅ Sender info */}
// // //                       <SenderBlock
// // //                         name={item?.senderName || "Organization"}
// // //                         email={item?.senderEmail || ""}
// // //                         image={item?.senderImage || ""}
// // //                       />

// // //                       {prompt?.id && (
// // //                         <button
// // //                           onClick={() => openPromptDetails(prompt.id)}
// // //                           className="mt-3 px-4 py-2 rounded-md text-white text-sm bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
// // //                         >
// // //                           View
// // //                         </button>
// // //                       )}
// // //                     </div>
// // //                   </div>
// // //                 );
// // //               })}
// // //             </div>
// // //           )}

// // //           {/* 📬 All Notifications */}
// // //           {tab === "all" && (
// // //             <div className="divide-y divide-white/10">
// // //               {notifications.map((n) => {
// // //                 const attachmentPath = n.promptId?.attachment?.path;
// // //                 return (
// // //                   <div key={n._id} className="flex items-start gap-4 py-5">
// // //                     <div className="shrink-0 rounded-lg overflow-hidden" style={{ width: 64, height: 64 }}>
// // //                       {renderPromptImage(attachmentPath)}
// // //                     </div>
// // //                     <div className="flex-1 min-w-0">
// // //                       {n.message && <div className="text-sm text-white/90 font-semibold mb-1">{n.message}</div>}
// // //                       {n.promptId && <div className="text-[15px] mt-1 font-medium">{n.promptId.title}</div>}

// // //                       {/* ✅ Sender info */}
// // //                       <SenderBlock name={n.senderName} email={n.senderEmail} image={n.senderImage} />
// // //                     </div>
// // //                   </div>
// // //                 );
// // //               })}
// // //             </div>
// // //           )}
// // //         </div>
// // //         <DetailsPrompt
// // //           open={detailsOpen}
// // //           onOpenChange={setDetailsOpen}
// // //           prompt={detailsPrompt}
// // //           owned={false}
// // //           onPurchase={() => setDetailsOpen(false)}
// // //           onEnlargeMedia={() => {}}
// // //         />
        
// // //       </main>
// // //       <Footer />
// // //     </>
// // //   );
// // // }


// // import { useEffect, useState } from "react";
// // import Header from "@/components/Header";
// // import Footer from "@/components/Footer";
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
// //     attachment?: { path?: string };
// //   } | null;
// //   // may arrive either flattened (senderName/email) or nested in senderId
// //   senderName?: string;
// //   senderEmail?: string;
// //   senderId?: { name?: string; email?: string };
// // };

// // type SharedPrompt = {
// //   id: string;
// //   sharedAt?: string;
// //   message?: string | null;
// //   // normalized sender info coming from backend
// //   senderName?: string;
// //   senderEmail?: string;
// //   prompt?: {
// //     id: string;
// //     title: string;
// //     price?: number;
// //     attachment?: { path?: string };
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
// //       new Map(allShared.map((item: any) => [item?.promptId?._id || item?.prompt?.id, item])).values()
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

// //  const openPromptDetails = async (promptId: string) => {
// //   try {
// //     const res = await fetch(`${API_BASE}/api/prompt/${promptId}`, {
// //       headers: { ...(authHeader as any) },
// //       credentials: "include",
// //     });
// //     const data = await res.json();
// //     if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to fetch prompt");

// //     const p = data.prompt;

// //     // ✅ Normalize the data shape for DetailsPrompt
// //     const normalizedPrompt = {
// //       id: p._id,
// //       title: p.title || "Untitled Prompt",
// //       description: p.description || "",
// //       price: p.price || 0,
// //       rating: p.averageRating || 0,
// //       downloads: p.downloads || 0,
// //       category:
// //         (Array.isArray(p.categories) && p.categories[0]?.name) ||
// //         p.category ||
// //         "General",
// //       imageUrl: p.attachment?.type === "image" ? `${API_BASE}${p.attachment.path}` : undefined,
// //       videoUrl: p.attachment?.type === "video" ? `${API_BASE}${p.attachment.path}` : undefined,
// //       fullPrompt: p.promptText || "",
// //     };

// //     setDetailsPrompt(normalizedPrompt);
// //     setDetailsOpen(true);
// //   } catch (err: any) {
// //     toast({
// //       title: "Could not load prompt",
// //       description: err?.message || "Please try again.",
// //       // //     });
// //   }
// // };


// //   const renderPromptImage = (path?: string) => {
// //     return path ? (
// //       <img src={`${API_BASE}${path}`} alt="Prompt" className="w-full h-full object-cover" />
// //     ) : (
// //       <img src="/icons/pm2.png" alt="Prompt" className="w-full h-full object-cover" />
// //     );
// //   };

// //   // same typography as your All tab (no avatar)
// //   const SenderBlock = (props: { name?: string; email?: string }) => (
// //     <div className="mt-3">
// //       <div className="text-sm font-semibold text-white">{props.name || "Unknown Sender"}</div>
// //       <div className="text-xs text-white/50">{props.email || ""}</div>
// //     </div>
// //   );

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

// //   // 🔁 single card renderer used by All / Shared / Purchased to keep them identical
// //   const renderCard = (opts: {
// //     key: string | number;
// //     message?: string;
// //     title?: string;
// //     attachmentPath?: string;
// //     senderName?: string;
// //     senderEmail?: string;
// //     promptId?: string;
// //   }) => (
// //     <div key={opts.key} className="flex items-start gap-4 py-5">
// //       <div className="shrink-0 rounded-lg overflow-hidden" style={{ width: 64, height: 64 }}>
// //         {renderPromptImage(opts.attachmentPath)}
// //       </div>
// //       <div className="flex-1 min-w-0">
// //         {opts.message && <div className="text-sm text-white/90 font-semibold mb-1">{opts.message}</div>}
// //         {opts.title && <div className="text-[15px] mt-1 font-medium">{opts.title}</div>}
// //         <SenderBlock name={opts.senderName} email={opts.senderEmail} />
// //         {opts.promptId && (
// //           <button
// //             onClick={() => openPromptDetails(opts.promptId!)}
// //             className="mt-3 px-4 py-2 rounded-md text-white text-sm bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
// //           >
// //             View
// //           </button>
// //         )}
// //       </div>
// //     </div>
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
// //             {/* {tabBtn("purchased", "Org Purchased")} */}
// //             {tabBtn("unread", "Unread")}
// //           </div>

// //           {loading && <div className="text-white/60 mb-3 text-sm">Loading…</div>}

// //           {/* 🔔 All */}
// //           {tab === "all" && (
// //             <div className="divide-y divide-white/10">
// //               {notifications.map((n) =>
// //                 renderCard({
// //                   key: n._id,
// //                   message: n.message,
// //                   title: n.promptId?.title,
// //                   attachmentPath: n.promptId?.attachment?.path,
// //                   senderName: n.senderName || n.senderId?.name || "Organization",
// //                   senderEmail: n.senderEmail || n.senderId?.email || "",
// //                   promptId: n.promptId?._id,
// //                 })
// //               )}
// //               {!notifications.length && !loading && (
// //                 <div className="py-16 text-center text-white/60">No notifications here.</div>
// //               )}
// //             </div>
// //           )}

// //           {/* 👥 Shared with me — EXACT SAME LAYOUT AS ALL */}
// //           {tab === "shared" && (
// //             <div className="divide-y divide-white/10">
// //               {sharedPrompts.map((item: any, idx) => {
// //                 const prompt = item?.promptId || item?.prompt || {};
// //                 return renderCard({
// //                   key: idx,
// //                   message: item?.message,
// //                   title: prompt?.title,
// //                   attachmentPath: prompt?.attachment?.path,
// //                   senderName: item?.senderName || item?.senderId?.name || item?.sharedBy || "Organization",
// //                   senderEmail: item?.senderEmail || item?.senderId?.email || "",
// //                   promptId: prompt?._id || prompt?.id,
// //                 });
// //               })}
// //               {!sharedPrompts.length && (
// //                 <div className="py-16 text-center text-white/60">No shared prompts yet.</div>
// //               )}
// //             </div>
// //           )}

// //           {/* 🏢 Org Purchased — IDENTICAL LAYOUT */}
// //           {tab === "purchased" && (
// //             <div className="divide-y divide-white/10">
// //               {orgPurchasedPrompts.map((item, idx) =>
// //                 renderCard({
// //                   key: idx,
// //                   message: item?.message || undefined,
// //                   title: item?.prompt?.title,
// //                   attachmentPath: item?.prompt?.attachment?.path,
// //                   senderName: item?.senderName || "Organization",
// //                   senderEmail: item?.senderEmail || "",
// //                   promptId: item?.prompt?.id,
// //                 })
// //               )}
// //               {!orgPurchasedPrompts.length && (
// //                 <div className="py-16 text-center text-white/60">
// //                   No purchased prompts shared with you yet.
// //                 </div>
// //               )}
// //             </div>
// //           )}

// //           {/* 📨 Unread */}
// //           {tab === "unread" && (
// //             <div className="divide-y divide-white/10">
// //               {notifications
// //                 .filter((n) => !n.read)
// //                 .map((n) =>
// //                   renderCard({
// //                     key: n._id,
// //                     message: n.message,
// //                     title: n.promptId?.title,
// //                     attachmentPath: n.promptId?.attachment?.path,
// //                     senderName: n.senderName || n.senderId?.name || "Organization",
// //                     senderEmail: n.senderEmail || n.senderId?.email || "",
// //                     promptId: n.promptId?._id,
// //                   })
// //                 )}
// //               {!notifications.filter((n) => !n.read).length && (
// //                 <div className="py-16 text-center text-white/60">No unread notifications.</div>
// //               )}
// //             </div>
// //           )}
// //         </div>

// //        <DetailsPrompt
// //   open={detailsOpen}
// //   onOpenChange={setDetailsOpen}
// //   prompt={detailsPrompt}
// //   owned={false}
// //   onPurchase={(p) => {
// //     console.log("Purchasing:", p);
// //     setDetailsOpen(false);
// //   }}
// // />

// //       </main>
// //       <Footer />
// //     </>
// //   );
// // }



// import { FaCaretLeft } from "react-icons/fa";

// import { useEffect, useState } from "react";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import { useAuth } from "@/contexts/AuthContext";
// import { toast } from "@/components/ui/use-toast";
// import DetailsPrompt from "@/components/DetailsPrompt";
// import { useNavigate } from "react-router-dom";
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
// //     description?: string;
// //     attachment?: { path?: string; type?: string };
// //   } | null;
// //   senderName?: string;
// //   senderEmail?: string;
// //   senderId?: { name?: string; email?: string };
// // };

// type Notif = {
//   _id: string;
//   type:
//     | "ORG_SUGGEST"
//     | "ORG_SHARE"
//     | "ORG_SHARE_PURCHASED"
//     | "TM_REQUEST"
//     | "COLLAB_INVITE"
//     | string;

//   message?: string;
//   read?: boolean;
//   createdAt?: string;

//   // ✅ for collab invite
//   sessionId?: string;

//   promptId?: {
//     _id: string;
//     title?: string;
//     price?: number;
//     description?: string;
//     attachment?: { path?: string; type?: string };
//     promptText?: string;
//     categories?: any[];
//     category?: string;
//   } | null;

//   senderName?: string;
//   senderEmail?: string;
//   senderId?: { name?: string; email?: string };
// };


// type SharedPrompt = {
//   id: string;
//   sharedAt?: string;
//   message?: string | null;
//   senderName?: string;
//   senderEmail?: string;
//   prompt?: {
//     id: string;
//     title: string;
//     price?: number;
//     description?: string;
//     attachment?: { path?: string; type?: string };
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
//   const navigate = useNavigate();

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

//   // ✅ Normalize data and open popup instantly
//   const openPromptDetails = (prompt: any) => {
//     if (!prompt?._id && !prompt?.id) {
//       toast({
//         title: "Prompt not found",
//         description: "Could not open this prompt. Try refreshing.",
//         //       });
//       return;
//     }
   
//     const normalizedPrompt = {
//       id: prompt._id || prompt.id,
//       title: prompt.title || "Untitled Prompt",
//       description: prompt.description || "",
//       price: prompt.price || 0,
//       rating: prompt.averageRating || 0,
//       downloads: prompt.downloads || 0,
//       category:
//         (Array.isArray(prompt.categories) && prompt.categories[0]?.name) ||
//         prompt.category ||
//         "General",
//       imageUrl: prompt.attachment?.type === "image" ? `${API_BASE}${prompt.attachment?.path}` : undefined,
//       videoUrl: prompt.attachment?.type === "video" ? `${API_BASE}${prompt.attachment?.path}` : undefined,
//       fullPrompt: prompt.promptText || "",
//     };

//     setDetailsPrompt(normalizedPrompt);
//     setDetailsOpen(true);
//   };



//   // ⭐ Accept collaboration invite → redirect to optimizer with sessionId
// // ⭐ Accept collaboration invite → redirect to optimizer with sessionId
// const acceptInvite = (sessionId: string) => {
//   if (!sessionId) {
//     toast({
//       title: "Invalid session",
//       description: "Could not join collaboration session.",
//       //     });
//     return;
//   }

//   // 👇 must match your Route path exactly
//   navigate(`/prompt-optimization?sessionId=${sessionId}`);
// };





//   const renderPromptImage = (path?: string) => {
//     return path ? (
//       <img src={`${API_BASE}${path}`} alt="Prompt" className="w-full h-full object-cover" />
//     ) : (
//       <img src="/icons/pm2.png" alt="Prompt" className="w-full h-full object-cover" />
//     );
//   };

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

//   const renderCard = (opts: {
//     key: string | number;
//     message?: string;
//     title?: string;
//     attachmentPath?: string;
//     senderName?: string;
//     senderEmail?: string;
//     prompt?: any;
//     actionButton?: React.ReactNode; // ✅ NEW
//   }) => (
//     <div key={opts.key} className="flex items-start gap-4 py-5">
//       <div className="shrink-0 rounded-lg overflow-hidden" style={{ width: 64, height: 64 }}>
//         {renderPromptImage(opts.attachmentPath)}
//       </div>

//       <div className="flex-1 min-w-0">
//         {opts.message && (
//           <div className="text-sm text-white/90 font-semibold mb-1">
//             {opts.message}
//           </div>
//         )}

//         {opts.title && (
//           <div className="text-[15px] mt-1 font-medium">
//             {opts.title}
//           </div>
//         )}

//         <SenderBlock name={opts.senderName} email={opts.senderEmail} />

//         {/* ✅ Buttons row */}
//         <div className="mt-3 flex items-center gap-2">
//           {/* Default View button (only if prompt exists) */}
//           {opts.prompt && (
//             <button
//               onClick={() => openPromptDetails(opts.prompt)}
//               className="px-4 py-2 rounded-md text-white text-sm bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
//             >
//               View
//             </button>
//           )}

//           {/* Custom action button (Accept/Join etc.) */}
//           {opts.actionButton}
//         </div>
//       </div>
//     </div>
//   );


//   return (
//     <>
//       <Header />
//       <main className="text-white pt-24 md:pt-28">
//         <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
       
//  <div className="flex items-center justify-between mb-6">
//   <div className="flex items-center gap-3">
//     <button
//       onClick={() => navigate("/smartgen")}
//       className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-white/80 hover:text-white hover:bg-white/10 transition"
//       aria-label="Back to SmartGen"
//       title="Back to SmartGen"
//     >
//       <FaCaretLeft className="text-white text-lg -ml-1" />
//       <span className="text-sm font-medium">Back</span>
//     </button>

//     <h1 className="text-2xl font-semibold">Notifications</h1>
//   </div>

//   {notifications.some((n) => !n.read) && (
//     <button onClick={markAllRead} className="text-sm text-white/70 hover:text-white">
//       ✓ Mark all as Read
//     </button>
//   )}
// </div>

//           <div className="flex items-center gap-6 mb-6">
//             {tabBtn("all", "All")}
//             {tabBtn("shared", "Shared with me")}
//             {tabBtn("unread", "Unread")}
//           </div>

//           {loading && <div className="text-white/60 mb-3 text-sm">Loading…</div>}

//   {tab === "all" && (
//   <div className="divide-y divide-white/10">
//     {notifications.map((n) => {

//       // ✅ Collaboration Invite UI
//       if (n.type === "COLLAB_INVITE") {
//         return renderCard({
//           key: n._id,
//           message: n.message || "You have a collaboration invite",
//           title: "Prompt Optimizer Collaboration",
//           attachmentPath: "/icons/collab.png",
//           senderName: n.senderName || n.senderId?.name || "Collaborator",
//           senderEmail: n.senderEmail || n.senderId?.email || "",
//           prompt: null,
//           actionButton: (
//             <button
//               onClick={() => acceptInvite(n.sessionId || "")}
//               className="px-4 py-2 rounded-md text-white text-sm bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
//             >
//               Accept & Join
//             </button>
//           ),
//         });
//       }

//       // ✅ Default
//       return renderCard({
//         key: n._id,
//         message: n.message,
//         title: n.promptId?.title,
//         attachmentPath: n.promptId?.attachment?.path,
//         senderName: n.senderName || n.senderId?.name || "Organization",
//         senderEmail: n.senderEmail || n.senderId?.email || "",
//         prompt: n.promptId,
//       });
//     })}

//     {!notifications.length && !loading && (
//       <div className="py-16 text-center text-white/60">No notifications here.</div>
//     )}
//   </div>
// )}


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
//                   prompt,
//                 });
//               })}
//               {!sharedPrompts.length && (
//                 <div className="py-16 text-center text-white/60">No shared prompts yet.</div>
//               )}
//             </div>
//           )}

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
//                     prompt: n.promptId,
//                   })
//                 )}
//               {!notifications.filter((n) => !n.read).length && (
//                 <div className="py-16 text-center text-white/60">No unread notifications.</div>
//               )}
//             </div>
//           )}
//         </div>

//         <DetailsPrompt
//           open={detailsOpen}
//           onOpenChange={setDetailsOpen}
//           prompt={detailsPrompt}
//           owned={false}
//           onPurchase={(p) => {
//             console.log("Purchasing:", p);
//             setDetailsOpen(false);
//           }}
//         />
//       </main>
//       <Footer />
//     </>
//   );
// }


import { FaCaretLeft } from "react-icons/fa";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import DetailsPrompt from "@/components/DetailsPrompt";
import HirePaymentPopup from "@/components/HirePaymentPopup";
import { useNavigate } from "react-router-dom";
import {
  Bell, Users, CreditCard, CheckCircle2, Share2, Zap,
  RotateCcw, UserPlus, Briefcase, PartyPopper, BadgeDollarSign,
  BellOff, ArrowLeft,
} from "lucide-react";

type Notif = {
  _id: string;
  type:
    | "ORG_SUGGEST"
    | "ORG_SHARE"
    | "ORG_SHARE_PURCHASED"
    | "TM_REQUEST"
    | "COLLAB_INVITE"
    | "HIRE_PAYMENT_REQUIRED"
    | "HIRE_PROPOSAL_ACCEPTED"
    | "HIRE_PAYMENT_DONE"
    | "HIRE_WORK_STARTED"
    | "HIRE_WORK_COMPLETED"
    | "HIRE_PAYMENT_RELEASED"
    | "HIRE_COUNTER_OFFER"
    | "HIRE_NDA_SIGNED"
    | string;

  message?: string;
  read?: boolean;
  createdAt?: string;

  sessionId?: string;

  hireDealId?: string | { _id: string };
  chatId?: string;
  messageId?: string;
  amount?: number;

  meta?: {
    title?: string;
    freelancerName?: string;
    freelancerEmail?: string;
    clientName?: string;
    amount?: number;
    deliveryDate?: string;
    paymentRequired?: boolean;
    fundsStatus?: string;
    // Team invitations — the id is what the Accept/Decline buttons act on.
    invitationId?: string;
    orgName?: string;
    role?: string;
    assignedCap?: number;
    /* A route this notification should offer to open, set by the server.
       Suspension notifications use it to point at the admin chat: the whole
       reason a suspended account keeps its session is so it can appeal, and
       telling someone to "message the admin team" without a way through is
       the same as telling them nothing. */
    actionUrl?: string;
    actionLabel?: string;
    reason?: string;
  };

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

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [sharedPrompts, setSharedPrompts] = useState<(Notif | SharedPrompt)[]>([]);
  const [orgPurchasedPrompts, setOrgPurchasedPrompts] = useState<SharedPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"all" | "shared" | "purchased" | "unread">("all");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsPrompt, setDetailsPrompt] = useState<any>(null);
  const [detailsOwned, setDetailsOwned] = useState(false);

  const [hirePopupOpen, setHirePopupOpen] = useState(false);
  const [selectedHireNotif, setSelectedHireNotif] = useState<Notif | null>(null);
  const [purchasedPromptIds, setPurchasedPromptIds] = useState<Set<string>>(new Set());

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

      if (data?.success) {
        setNotifications(data.notifications || []);
      }
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

      if (data?.success) {
        setOrgPurchasedPrompts(data.sharedPrompts || []);
      }
    } catch (err) {
      console.error("Failed to load org purchased products:", err);
    }
  };

  const loadSharedPrompts = async () => {
    if (!token) return;

    const suggested = (notifications || []).filter(
      (n) =>
        (n.type === "ORG_SUGGEST" ||
          n.type === "ORG_SHARE" ||
          n.type === "ORG_SHARE_PURCHASED") &&
        n.promptId
    );

    try {
      const purchased = await fetch(`${API_BASE}/api/prompt-collab/shared/team`, {
        headers: { ...(authHeader as any) },
        credentials: "include",
      }).then((res) => res.json().catch(() => ({ sharedPrompts: [] })));

      const allShared = [...suggested, ...(purchased?.sharedPrompts || [])];

      const uniqueShared = Array.from(
        new Map(
          allShared.map((item: any) => [
            item?.promptId?._id || item?.prompt?.id || item?._id,
            item,
          ])
        ).values()
      );

      setSharedPrompts(uniqueShared);
    } catch (err) {
      console.error("loadSharedPrompts failed:", err);
    }
  };

  const fetchPurchasedPromptIds = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/purchase/history`, {
        headers: { ...(authHeader as any) },
        credentials: "include",
      });
      const data = await res.json();
      if (data?.success) {
        const ids = (data.purchases || []).map((p: any) => String(p.prompt?._id || p.prompt));
        setPurchasedPromptIds(new Set(ids));
      }
    } catch (err) {
      console.error("Failed to load purchased product ids:", err);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchNotifications();
    fetchPurchasedPromptIds();

    if (user?.userType === "TM") {
      fetchOrgPurchasedPrompts();
    }
  }, [token]);

  useEffect(() => {
    if (notifications.length > 0) {
      loadSharedPrompts();
    }
  }, [notifications]);

  const markNotificationRead = async (id: string) => {
    if (!token || !id) return;

    try {
      await fetch(`${API_BASE}/api/prompt-collab/notifications/read/${encodeURIComponent(id)}`, {
        method: "POST",
        headers: { ...(authHeader as any) },
      });

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("markNotificationRead failed:", err);
    }
  };

  /* Answering a team invitation.
     Tracked per invitation id rather than as one page-wide flag, because
     someone can have invitations from more than one org sitting in the list
     and only the one being answered should show as busy. */
  const [orgInviteBusy, setOrgInviteBusy] = useState<string | null>(null);
  const [orgInviteAnswered, setOrgInviteAnswered] = useState<
    Record<string, "accepted" | "declined">
  >({});

  const respondToOrgInvite = async (
    invitationId: string,
    action: "accept" | "decline",
    notificationId: string
  ) => {
    if (!token || !invitationId) return;

    try {
      setOrgInviteBusy(invitationId);
      const res = await fetch(
        `${API_BASE}/api/org/members/invitations/${invitationId}/${action}`,
        { method: "POST", headers: { ...(authHeader as any) } }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || "Couldn't complete that.");
      }

      setOrgInviteAnswered((prev) => ({
        ...prev,
        [invitationId]: action === "accept" ? "accepted" : "declined",
      }));
      await markNotificationRead(notificationId);

      if (action === "accept") {
        // Accepting rewrites this account — userType, role, org and token
        // allowance all change — so the cached auth state is now stale. A
        // reload is the honest way to pick all of that up.
        window.alert(data.message || "You've joined the team.");
        window.location.reload();
      }
    } catch (err: any) {
      window.alert(err?.message || "Couldn't complete that. Please try again.");
    } finally {
      setOrgInviteBusy(null);
    }
  };

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

  const openPromptDetails = (prompt: any) => {
    if (!prompt?._id && !prompt?.id) {
      toast({
        title: "Product not found",
        description: "Could not open this product. Try refreshing.",
      });
      return;
    }

    const promptId = String(prompt._id || prompt.id);
    const uploaderId = String(prompt.userId?._id || prompt.userId || "");

    const normalizedPrompt = {
      id: promptId,
      title: prompt.title || "Untitled Prompt",
      description: prompt.description || "",
      price: prompt.price || 0,
      rating: prompt.averageRating || 0,
      downloads: prompt.downloads || 0,
      category:
        (Array.isArray(prompt.categories) && prompt.categories[0]?.name) ||
        prompt.category ||
        "General",
      imageUrl:
        prompt.attachment?.type === "image"
          ? `${API_BASE}${prompt.attachment?.path}`
          : undefined,
      videoUrl:
        prompt.attachment?.type === "video"
          ? `${API_BASE}${prompt.attachment?.path}`
          : undefined,
      fullPrompt: prompt.promptText || "",
      uploaderId,
      exclusive: !!prompt.exclusive,
      sold: !!prompt.sold,
    };

    const currentUserId = String((user as any)?._id || (user as any)?.id || "");
    setDetailsOwned(
      (!!currentUserId && !!uploaderId && uploaderId === currentUserId) ||
        purchasedPromptIds.has(promptId)
    );
    setDetailsPrompt(normalizedPrompt);
    setDetailsOpen(true);
  };

  const acceptInvite = (sessionId: string) => {
    if (!sessionId) {
      toast({
        title: "Invalid session",
        description: "Could not join collaboration session.",
      });
      return;
    }

    navigate(`/prompt-optimization?sessionId=${sessionId}`);
  };

  const openHirePaymentPopup = async (notification: Notif) => {
    setSelectedHireNotif(notification);
    setHirePopupOpen(true);

    if (!notification.read) {
      await markNotificationRead(notification._id);
    }
  };

  /* ─── helpers ─── */

  const timeAgo = (dateStr?: string) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const typeConfig: Record<string, { icon: ReactNode; accent: string; label: string }> = {
    COLLAB_INVITE:          { icon: <Users size={18} />,          accent: "#a855f7", label: "Collaboration" },
    HIRE_PAYMENT_REQUIRED:  { icon: <CreditCard size={18} />,     accent: "#f59e0b", label: "Payment Required" },
    HIRE_PAYMENT_DONE:      { icon: <CheckCircle2 size={18} />,   accent: "#10b981", label: "Payment Done" },
    HIRE_PROPOSAL_ACCEPTED: { icon: <Briefcase size={18} />,      accent: "#3b82f6", label: "Proposal Accepted" },
    HIRE_WORK_STARTED:      { icon: <Zap size={18} />,            accent: "#6366f1", label: "Work Started" },
    HIRE_WORK_COMPLETED:    { icon: <PartyPopper size={18} />,    accent: "#10b981", label: "Work Completed" },
    HIRE_PAYMENT_RELEASED:  { icon: <BadgeDollarSign size={18} />,accent: "#10b981", label: "Payment Released" },
    HIRE_COUNTER_OFFER:     { icon: <RotateCcw size={18} />,      accent: "#f59e0b", label: "Counter Offer" },
    HIRE_NDA_SIGNED:        { icon: <CheckCircle2 size={18} />,   accent: "#8b5cf6", label: "NDA Signed" },
    TM_REQUEST:             { icon: <UserPlus size={18} />,       accent: "#38bdf8", label: "Team Request" },
    ORG_SUGGEST:            { icon: <Share2 size={18} />,         accent: "#1A73E8", label: "Suggested" },
    ORG_SHARE:              { icon: <Share2 size={18} />,         accent: "#1A73E8", label: "Shared" },
    ORG_SHARE_PURCHASED:    { icon: <Share2 size={18} />,         accent: "#1A73E8", label: "Org Purchase" },
    DEFAULT:                { icon: <Bell size={18} />,           accent: "#6b7280", label: "Notification" },
  };

  const getTypeConfig = (type: string) => typeConfig[type] ?? typeConfig.DEFAULT;

  const renderPromptImage = (path?: string) => {
    if (path) {
      const src = path.startsWith("http") ? path : `${API_BASE}${path}`;
      return <img src={src} alt="Product" className="w-full h-full object-cover" />;
    }
    return <img src="/icons/pm2.png" alt="Product" className="w-full h-full object-cover" />;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const TabPill = ({ id, label, count }: { id: typeof tab; label: string; count?: number }) => (
    <button
      onClick={() => setTab(id)}
      style={
        tab === id
          ? { background: "linear-gradient(135deg,#7c3aed,#2563eb)", border: "1px solid transparent" }
          : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }
      }
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white transition-all duration-200 hover:scale-[1.03]"
    >
      {label}
      {count != null && count > 0 && (
        <span
          className="flex items-center justify-center rounded-full text-[10px] font-bold min-w-[18px] h-[18px] px-1"
          style={{ background: tab === id ? "rgba(255,255,255,0.25)" : "rgba(239,68,68,0.85)" }}
        >
          {count}
        </span>
      )}
    </button>
  );

  const NotifCard = (opts: {
    id: string | number;
    type?: string;
    message?: string;
    title?: string;
    attachmentPath?: string;
    senderName?: string;
    senderEmail?: string;
    createdAt?: string;
    prompt?: any;
    actionButton?: ReactNode;
    unread?: boolean;
  }) => {
    const cfg = getTypeConfig(opts.type ?? "DEFAULT");
    return (
      <div
        key={opts.id}
        style={{
          background: opts.unread ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.025)",
          border: `1px solid ${opts.unread ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)"}`,
          borderLeft: `3px solid ${cfg.accent}`,
          borderRadius: 16,
          marginBottom: 10,
          padding: "18px 20px",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          transition: "background 0.2s",
        }}
      >
        <div className="flex items-start gap-4">
          {/* Type icon badge */}
          <div
            className="shrink-0 flex items-center justify-center rounded-xl"
            style={{
              width: 44, height: 44,
              background: `${cfg.accent}22`,
              border: `1px solid ${cfg.accent}44`,
              color: cfg.accent,
            }}
          >
            {cfg.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: `${cfg.accent}20`, color: cfg.accent }}
                >
                  {cfg.label}
                </span>
                {opts.unread && (
                  <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                )}
              </div>
              <span className="text-xs text-white/40 shrink-0">{timeAgo(opts.createdAt)}</span>
            </div>

            {opts.message && (
              <p className="text-sm text-white/90 font-semibold leading-snug mb-1">{opts.message}</p>
            )}
            {opts.title && (
              <p className="text-[13px] text-white/60 mt-0.5">{opts.title}</p>
            )}

            {/* Sender */}
            {(opts.senderName || opts.senderEmail) && (
              <div className="flex items-center gap-2 mt-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ background: cfg.accent }}
                >
                  {(opts.senderName?.[0] ?? "?").toUpperCase()}
                </div>
                <div>
                  <span className="text-xs font-semibold text-white/80">{opts.senderName || "Unknown"}</span>
                  {opts.senderEmail && (
                    <span className="text-xs text-white/40 ml-2">{opts.senderEmail}</span>
                  )}
                </div>
              </div>
            )}

            {/* Prompt thumbnail + actions */}
            {(opts.prompt || opts.actionButton) && (
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                {opts.attachmentPath && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/10 border border-white/10">
                    {renderPromptImage(opts.attachmentPath)}
                  </div>
                )}
                {opts.prompt && (
                  <button
                    onClick={() => openPromptDetails(opts.prompt)}
                    className="px-4 py-1.5 rounded-lg text-white text-xs font-semibold transition-opacity hover:opacity-80"
                    style={{ background: "linear-gradient(135deg,#FF14EF,#1A73E8)" }}
                  >
                    View Prompt
                  </button>
                )}
                {opts.actionButton}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const actionBtn = (label: string, onClick: () => void, variant: "primary" | "ghost" = "primary") => (
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded-lg text-white text-xs font-semibold transition-opacity hover:opacity-80"
      style={
        variant === "primary"
          ? { background: "linear-gradient(135deg,#FF14EF,#1A73E8)" }
          : { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }
      }
    >
      {label}
    </button>
  );

  const renderNotificationItem = (n: Notif) => {
    const base = {
      id: n._id,
      type: n.type,
      createdAt: n.createdAt,
      unread: !n.read,
      senderName: n.senderName || n.senderId?.name,
      senderEmail: n.senderEmail || n.senderId?.email,
    };

    /* Being added to a team is now an invitation, not a fait accompli — the
       owner's click sends this, and nothing about the person's account changes
       until they press Accept here. */
    if (n.type === "ORG_INVITATION") {
      const invitationId = n.meta?.invitationId;
      const answered = invitationId ? orgInviteAnswered[invitationId] : undefined;

      return NotifCard({
        ...base,
        message: n.message || "You've been invited to join a team.",
        title: n.meta?.orgName ? `${n.meta.orgName} — team invitation` : "Team invitation",
        attachmentPath: undefined,
        prompt: null,
        actionButton: !invitationId ? undefined : answered ? (
          <span className="text-xs text-white/45">
            {answered === "accepted" ? "Joined" : "Declined"}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={orgInviteBusy === invitationId}
              onClick={() => respondToOrgInvite(invitationId, "decline", n._id)}
              className="h-8 px-3 rounded-full text-xs font-medium text-white/60 border border-white/15 hover:bg-white/[0.06] disabled:opacity-50"
            >
              Decline
            </button>
            <button
              type="button"
              disabled={orgInviteBusy === invitationId}
              onClick={() => respondToOrgInvite(invitationId, "accept", n._id)}
              className="h-8 px-4 rounded-full text-xs font-semibold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
            >
              {orgInviteBusy === invitationId ? "Joining…" : "Accept"}
            </button>
          </div>
        ),
      });
    }

    if (n.type === "COLLAB_INVITE") {
      return NotifCard({
        ...base,
        message: n.message || "You have a collaboration invite",
        title: "Product Optimizer Collaboration",
        attachmentPath: undefined,
        prompt: null,
        actionButton: actionBtn("Accept & Join", () => acceptInvite(n.sessionId || "")),
      });
    }

    if (n.type === "HIRE_PAYMENT_REQUIRED") {
      return NotifCard({
        ...base,
        message: n.message || "Hire proposal accepted. Payment required to start work.",
        title: n.meta?.title,
        senderName: base.senderName || n.meta?.freelancerName || "Freelancer",
        senderEmail: base.senderEmail || n.meta?.freelancerEmail,
        prompt: null,
        actionButton: actionBtn("View & Pay", () => openHirePaymentPopup(n)),
      });
    }

    if (n.type === "HIRE_PAYMENT_DONE") {
      return NotifCard({
        ...base,
        message: n.message || "Payment made. Amount is safely held by Tokun.",
        title: n.meta?.title,
        senderName: base.senderName || "Client",
        prompt: null,
        actionButton: actionBtn("Mark Read", () => markNotificationRead(n._id), "ghost"),
      });
    }

    if (n.type === "HIRE_NDA_SIGNED") {
      return NotifCard({
        ...base,
        message: n.message || "The NDA status has been updated.",
        title: n.meta?.title || "NDA Update",
        prompt: null,
        actionButton: actionBtn("Mark Read", () => markNotificationRead(n._id), "ghost"),
      });
    }

    /* Any notification the server attached an actionUrl to gets that button.
       Generic on purpose — the next one that needs a call to action shouldn't
       need another branch here. */
    if (n.meta?.actionUrl) {
      return NotifCard({
        ...base,
        message: n.message,
        title: n.promptId?.title,
        prompt: null,
        actionButton: actionBtn(n.meta.actionLabel || "Open", () => {
          markNotificationRead(n._id);
          navigate(n.meta!.actionUrl!);
        }),
      });
    }

    return NotifCard({
      ...base,
      message: n.message,
      title: n.promptId?.title,
      attachmentPath: n.promptId?.attachment?.path,
      senderName: base.senderName || "Organization",
      senderEmail: base.senderEmail,
      prompt: n.promptId,
    });
  };

  const EmptyState = ({ text }: { text: string }) => (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <BellOff size={28} className="text-white/30" />
      </div>
      <p className="text-white/40 text-sm">{text}</p>
    </div>
  );

  return (
    <>
      <Header />

      <main
        className="text-white pt-16 md:pt-20 min-h-screen"
        style={{ background: "linear-gradient(180deg,rgba(10,5,30,0) 0%,transparent 100%)" }}
      >
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">

          {/* ── Page header ── */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                aria-label="Back"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(239,68,68,0.85)" }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </h1>
                <p className="text-xs text-white/40 mt-0.5">Stay updated on your activity</p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition px-3 py-1.5 rounded-lg"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <CheckCircle2 size={13} />
                Mark all read
              </button>
            )}
          </div>

          {/* ── Pill tabs ── */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <TabPill id="all" label="All" count={notifications.length} />
            <TabPill id="shared" label="Shared" count={sharedPrompts.length} />
            <TabPill id="unread" label="Unread" count={unreadCount} />
          </div>

          {/* ── Loading skeleton ── */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl animate-pulse"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                />
              ))}
            </div>
          )}

          {/* ── All ── */}
          {!loading && tab === "all" && (
            <div>
              {notifications.map((n) => renderNotificationItem(n))}
              {!notifications.length && <EmptyState text="No notifications yet." />}
            </div>
          )}

          {/* ── Shared with me ── */}
          {!loading && tab === "shared" && (
            <div>
              {sharedPrompts.map((item: any, idx) => {
                const prompt = item?.promptId || item?.prompt || {};
                return NotifCard({
                  id: idx,
                  type: "ORG_SHARE",
                  message: item?.message,
                  title: prompt?.title,
                  attachmentPath: prompt?.attachment?.path,
                  senderName: item?.senderName || item?.senderId?.name || item?.sharedBy || "Organization",
                  senderEmail: item?.senderEmail || item?.senderId?.email,
                  createdAt: item?.createdAt || item?.sharedAt,
                  prompt,
                });
              })}
              {!sharedPrompts.length && <EmptyState text="No shared products yet." />}
            </div>
          )}

          {/* ── Unread ── */}
          {!loading && tab === "unread" && (
            <div>
              {notifications.filter((n) => !n.read).map((n) => renderNotificationItem(n))}
              {!unreadCount && <EmptyState text="You're all caught up!" />}
            </div>
          )}
        </div>

        <DetailsPrompt
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          prompt={detailsPrompt}
          owned={detailsOwned}
          onPurchase={(p) => {
            console.log("Purchasing:", p);
            setDetailsOpen(false);
          }}
        />

        <HirePaymentPopup
          open={hirePopupOpen}
          onClose={() => setHirePopupOpen(false)}
          notification={selectedHireNotif}
          token={token || ""}
          onPaid={fetchNotifications}
        />
      </main>

      <Footer />
    </>
  );
}