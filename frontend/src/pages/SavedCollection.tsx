// // // // src/pages/SavedCollection.tsx
// // // import { useEffect, useMemo, useRef, useState } from "react";
// // // import Header from "@/components/Header";
// // // import Footer from "@/components/Footer";
// // // import { Card, CardContent } from "@/components/ui/card";
// // // import { Button } from "@/components/ui/button";
// // // import { toast } from "@/components/ui/use-toast";
// // // import { Switch } from "@/components/ui/switch";
// // // import { Label } from "@/components/ui/label";
// // // import { History as HistoryIcon } from "lucide-react"; // icon for Prompt History

// // // import {
// // //   Download,
// // //   MoreHorizontal,
// // //   Pencil,
// // //   Trash,
// // //   ArrowLeft,
// // //   Folder as FolderIcon,
// // //   Loader2,
// // //   Copy,
// // //   Search,
// // //   X,
// // //   Star,
// // // } from "lucide-react";
// // // import { useAuth } from "@/contexts/AuthContext";
// // // import { Textarea } from "@/components/ui/textarea";
// // // import { loadSaved, type SavedItem } from "@/lib/savedCollections";

// // // /* ============================================================================
// // //    CONSTANTS
// // //    ==========================================================================*/
// // // const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
// // // const base = API_BASE.replace(/\/+$/, "");
// // // const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

// // // const TABS = [
// // //   { id: "smartgen", label: "Smartgen", icon: "/icons/smartgen.svg" },
// // //   { id: "prompt-optimization", label: "Prompt Optimiser", icon: "/icons/prompt-optimization.svg" },
// // //   { id: "prompt-marketplace", label: "Prompt Marketplace", icon: "/icons/prompt-marketplace.png" },
// // //   { id: "prompt-library", label: "Prompt Library", icon: "/icons/prompt-library.png" },
// // // ] as const;

// // // type TabId = (typeof TABS)[number]["id"];
// // // type SectionKey = "smartgen" | "prompt" | "promptOptimizer";
// // // const SECTION_BY_TAB: Record<TabId, SectionKey> = {
// // //   smartgen: "smartgen",
// // //   "prompt-optimization": "promptOptimizer",
// // //   "prompt-marketplace": "prompt",
// // //   "prompt-library": "prompt",
// // // };

// // // const mockImages = ["/icons/pl1.png", "/icons/pl2.png", "/icons/pl3.png", "/icons/pl4.png"];

// // // /* ============================================================================
// // //    SERVER TYPES & HELPERS
// // //    ==========================================================================*/
// // // type SectionItem = { ref?: any; name?: string; on?: string };
// // // type SectionBlock = { directItems: SectionItem[]; collections: { title: string; items: SectionItem[] }[] };
// // // type ServerSections = Partial<Record<SectionKey, SectionBlock>>;

// // // async function apiGetAll(token?: string) {
// // //   const res = await fetch(`${base}/api/saved-collections`, {
// // //     method: "GET",
// // //     credentials: "include",
// // //     headers: token ? { Authorization: `Bearer ${token}` } : undefined,
// // //   });
// // //   return res.json();
// // // }

// // // async function apiDeleteItem(section: SectionKey, refId: string, token?: string) {
// // //   const res = await fetch(`${base}/api/saved-collections/${section}/${refId}`, {
// // //     method: "DELETE",
// // //     credentials: "include",
// // //     headers: token
// // //       ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
// // //       : { "Content-Type": "application/json" },
// // //   });
// // //   return res.json();
// // // }

// // // async function apiPostSave(
// // //   section: SectionKey,
// // //   refId: string,
// // //   token: string | undefined,
// // //   opts: { collectionTitle?: string; name?: string }
// // // ) {
// // //   const res = await fetch(`${base}/api/saved-collections`, {
// // //     method: "POST",
// // //     credentials: "include",
// // //     headers: {
// // //       ...(token ? { Authorization: `Bearer ${token}` } : {}),
// // //       "Content-Type": "application/json",
// // //     },
// // //     body: JSON.stringify({
// // //       section,
// // //       refId,
// // //       collectionTitle: opts.collectionTitle?.trim() || undefined,
// // //       name: opts.name?.trim() || undefined,
// // //     }),
// // //   });
// // //   return res.json();
// // // }

// // // async function apiDeleteCollection(section: SectionKey, title: string, token?: string) {
// // //   const res = await fetch(`${base}/api/saved-collections/collection`, {
// // //     method: "DELETE",
// // //     credentials: "include",
// // //     headers: token
// // //       ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
// // //       : { "Content-Type": "application/json" },
// // //     body: JSON.stringify({ section, title }),
// // //   });
// // //   return res.json();
// // // }

// // // async function apiRenameCollection(section: SectionKey, oldTitle: string, newTitle: string, token?: string) {
// // //   const res = await fetch(`${base}/api/saved-collections/collection`, {
// // //     method: "PUT",
// // //     credentials: "include",
// // //     headers: token
// // //       ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
// // //       : { "Content-Type": "application/json" },
// // //     body: JSON.stringify({ section, oldTitle, newTitle }),
// // //   });
// // //   return res.json();
// // // }

// // // /* ============================================================================
// // //    SMALL UTILS
// // //    ==========================================================================*/
// // // const getDocId = (ref: any) => (typeof ref === "string" ? ref : ref?._id || ref?.id || "");
// // // const getItemTitle = (i: any) => (i?.name || i?.ref?.title || i?.ref?.name || "Untitled").toString();
// // // const itemImage = (i: any, idx: number) => i?.ref?.imageUrl || i?.imageUrl || mockImages[idx % mockImages.length];
// // // const folderCover = (collection: any, idx: number) => itemImage((collection?.items || [])[0], idx);

// // // const pickTextFromRef = (section: SectionKey, refDoc: any): string => {
// // //   if (!refDoc) return "";
// // //   if (section === "smartgen") {
// // //     return refDoc.detailedPrompt || refDoc.output || refDoc.result || refDoc.inputPrompt || refDoc.prompt || "";
// // //   }
// // //   if (section === "promptOptimizer") {
// // //     return refDoc.optimizedText || refDoc.result || refDoc.output || refDoc.text || refDoc.prompt || "";
// // //   }
// // //   return refDoc.content || refDoc.text || refDoc.prompt || refDoc.title || "";
// // // };

// // // /* ============================================================================
// // //    COMPONENT
// // //    ==========================================================================*/
// // // type ViewMode = "saved" | "history";
// // // type HistoryTab = "smartgen" | "prompt-optimization";

// // // export default function SavedCollection() {
// // //   const [tab, setTab] = useState<TabId>("smartgen");
// // //   const section = SECTION_BY_TAB[tab];
// // //   const { token } = useAuth() as any;

// // //   const [sections, setSections] = useState<ServerSections>({});
// // //   const [loading, setLoading] = useState(true);

// // //   // folder + menu state
// // //   const [menuForFolder, setMenuForFolder] = useState<string | null>(null);
// // //   const [menuForDirect, setMenuForDirect] = useState<string | null>(null);

// // //   const [viewingFolder, setViewingFolder] = useState<string | null>(null); // drives /folder-save
// // //   const [editingFolder, setEditingFolder] = useState<string | null>(null);
// // //   const [editFolderValue, setEditFolderValue] = useState("");

// // //   // move-to-folder (All Saved edit)
// // //   const [moveRefId, setMoveRefId] = useState<string | null>(null);
// // //   const [moveFolderName, setMoveFolderName] = useState("");
// // // const [moveItemName, setMoveItemName] = useState("");

// // //   // NEW: right-side pill + two history tabs
// // //   const [viewMode, setViewMode] = useState<ViewMode>("saved"); // default to Saved Item
// // //   const [historyTab, setHistoryTab] = useState<HistoryTab>("smartgen");

// // //   const menuScopeRef = useRef<HTMLDivElement>(null);

// // //   // Load server (or local fallback)
// // //   const fetchAll = async () => {
// // //     setLoading(true);
// // //     try {
// // //       if (!token) {
// // //         const local = loadSaved();
// // //         setSections({
// // //           [section]: { directItems: local.map((x) => ({ ref: { prompt: x.prompt, title: x.title } })), collections: [] },
// // //         });
// // //       } else {
// // //         const data = await apiGetAll(token);
// // //         if (data?.success) setSections(data.sections || {});
// // //         else toast({ title: "Load failed", description: "Could not fetch saved items." });
// // //       }
// // //     } catch (e: any) {
// // //       toast({ title: "Error", description: e?.message || "Failed to fetch" });
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     fetchAll();
// // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // //   }, []);

// // //   // open if URL is already /folder-save
// // //   useEffect(() => {
// // //     const params = new URLSearchParams(location.search);
// // //     const folder = params.get("folder");
// // //     const tabFromUrl = params.get("tab") as TabId | null;
// // //     const onFolderPage = location.pathname.endsWith("/folder-save");
// // //     if (onFolderPage && folder) {
// // //       if (tabFromUrl && TABS.find((t) => t.id === tabFromUrl)) setTab(tabFromUrl);
// // //       setViewingFolder(folder);
// // //     }
// // //     const onPop = () => {
// // //       const nowFolder = new URLSearchParams(location.search).get("folder");
// // //       if (location.pathname.endsWith("/folder-save") && nowFolder) {
// // //         setViewingFolder(nowFolder);
// // //       } else {
// // //         setViewingFolder(null);
// // //       }
// // //     };
// // //     window.addEventListener("popstate", onPop);
// // //     return () => window.removeEventListener("popstate", onPop);
// // //   }, []);

// // //   // close menus on outside click
// // //   useEffect(() => {
// // //     const onDown = (e: MouseEvent) => {
// // //       if (menuScopeRef.current && !menuScopeRef.current.contains(e.target as Node)) {
// // //         setMenuForFolder(null);
// // //         setMenuForDirect(null);
// // //       }
// // //     };
// // //     document.addEventListener("mousedown", onDown);
// // //     return () => document.removeEventListener("mousedown", onDown);
// // //   }, []);

// // //   const activeSection = useMemo<SectionBlock>(() => {
// // //     const s = (sections || {}) as any;
// // //     return s[section] || { directItems: [], collections: [] };
// // //   }, [sections, section]);

// // //   const copyToClipboard = (text: string, label: string) => {
// // //     navigator.clipboard.writeText(text || "");
// // //     toast({ title: "Copied", description: `"${label}" has been copied.` });
// // //   };

// // //   /* ───────── Folder actions ───────── */
// // //   const openFolder = (title: string) => {
// // //     setViewingFolder(title);
// // //     const qs = new URLSearchParams({ tab, folder: title });
// // //     history.pushState({ folder: title, tab }, "", `/folder-save?${qs.toString()}`);
// // //   };

// // //   const leaveFolder = () => {
// // //     setViewingFolder(null);
// // //     history.pushState({}, "", `/saved-collection`);
// // //   };

// // //   const startRenameFolder = (title: string) => {
// // //     setEditingFolder(title);
// // //     setEditFolderValue(title);
// // //     setMenuForFolder(null);
// // //   };

// // //   const confirmRenameFolder = async () => {
// // //     const oldTitle = editingFolder!;
// // //     const newTitle = editFolderValue.trim();
// // //     if (!newTitle || newTitle === oldTitle) {
// // //       setEditingFolder(null);
// // //       return;
// // //     }
// // //     try {
// // //       const resp = await apiRenameCollection(section, oldTitle, newTitle, token);
// // //       if (resp?.success) {
// // //         toast({ title: "Renamed", description: `Folder is now “${newTitle}”.` });
// // //         if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
// // //         else await fetchAll();
// // //         setViewingFolder(newTitle);
// // //       } else toast({ title: "Rename failed", description: resp?.error || "Unable to rename" });
// // //     } catch (e: any) {
// // //       toast({ title: "Error", description: e?.message || "Unable to rename" });
// // //     } finally {
// // //       setEditingFolder(null);
// // //     }
// // //   };

// // //   const deleteFolder = async (title: string) => {
// // //     try {
// // //       const resp = await apiDeleteCollection(section, title, token);
// // //       if (resp?.success) {
// // //         toast({ title: "Deleted", description: `Folder “${title}” removed.` });
// // //         if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
// // //         else await fetchAll();
// // //         setViewingFolder(null);
// // //         history.pushState({}, "", `/saved-collection`);
// // //       } else toast({ title: "Delete failed", description: resp?.error || "Unable to delete folder" });
// // //     } catch (e: any) {
// // //       toast({ title: "Error", description: e?.message || "Unable to delete folder" });
// // //     }
// // //   };

// // //   /* ───────── All Saved actions ───────── */
// // //   const openMoveForm = (refId: string, currentName: string) => {
// // //     setMenuForDirect(refId);
// // //     setMoveRefId(refId);
// // //     setMoveFolderName("");
// // //     setMoveItemName(currentName || "");
// // //   };

// // //   const performMoveToFolder = async () => {
// // //     if (!moveRefId || !moveFolderName.trim()) return;
// // //     try {
// // //       await apiDeleteItem(section, moveRefId, token);
// // //       const resp = await apiPostSave(section, moveRefId, token, {
// // //         collectionTitle: moveFolderName.trim(),
// // //         name: moveItemName.trim() || undefined,
// // //       });
// // //       if (resp?.success) {
// // //         toast({ title: "Moved", description: `Item moved to “${moveFolderName.trim()}”.` });
// // //         if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
// // //         else await fetchAll();
// // //       } else toast({ title: "Move failed", description: resp?.error || "Could not move item" });
// // //     } catch (e: any) {
// // //       toast({ title: "Error", description: e?.message || "Could not move item" });
// // //     } finally {
// // //       setMenuForDirect(null);
// // //       setMoveRefId(null);
// // //     }
// // //   };

// // //   const deleteSingleItem = async (refId: string) => {
// // //     try {
// // //       const resp = await apiDeleteItem(section, refId, token);
// // //       if (resp?.success) {
// // //         toast({ title: "Removed", description: "Item deleted from saved." });
// // //         if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
// // //         else await fetchAll();
// // //       } else toast({ title: "Delete failed", description: resp?.error || "Unable to delete item" });
// // //     } catch (e: any) {
// // //       toast({ title: "Error", description: e?.message || "Unable to delete item" });
// // //     }
// // //   };

// // //   /* ───────── Render helpers (Saved view) ───────── */
// // //   const folders = activeSection.collections || [];
// // //   const directItems = activeSection.directItems || [];

// // //   const renderCardFooter = (text: string, title: string) => (
// // //     <div className="flex items-center justify-start gap-2">
// // //       <div className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "#333335" }}>
// // //         <img src="/icons/cop1.png" className="w-4 h-4 object-contain" />
// // //       </div>
// // //       <button
// // //         onClick={() => copyToClipboard(text, title)}
// // //         className="h-9 px-3.5 rounded-full text-white text-[13px] font-medium inline-flex items-center justify-center gap-2 bg-[#333335] hover:bg-[linear-gradient(270deg,#1A73E8_0%,#FF14EF_100%)] transition-colors"
// // //         title="Copy"
// // //       >
// // //         <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
// // //           <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
// // //           <rect x="4" y="4" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
// // //         </svg>
// // //         Copy
// // //       </button>
// // //     </div>
// // //   );

// // //   const renderTags = (prompt: SavedItem) => {
// // //     const tags = Array.isArray((prompt as any).tags) ? (prompt as any).tags.filter(Boolean) : [];
// // //     if (!tags.length) return null;
// // //     return (
// // //       <div className="mt-4 mb-4 flex flex-wrap gap-1.5">
// // //         {tags.map((tag: string) => (
// // //           <span key={tag} className="px-3 py-1 text-[12px] rounded-full border border-white/15 text-white/85 bg-white/[0.06]">
// // //             {tag}
// // //           </span>
// // //         ))}
// // //       </div>
// // //     );
// // //   };

// // //   /* ───────── Folder page (same page, different URL: /folder-save) ───────── */
// // //   const renderFolderPage = () => {
// // //     if (!viewingFolder) return null;
// // //     const folder = folders.find((f) => f.title === viewingFolder);
// // //     if (!folder) {
// // //       setViewingFolder(null);
// // //       history.replaceState({}, "", "/saved-collection");
// // //       return null;
// // //     }

// // //     return (
// // //       <div className="container mx-auto px-6">
// // //         {/* Top bar */}
// // //         <div className="flex items-center justify-between mb-6">
// // //           <button className="inline-flex items-center gap-2 text-white/90 hover:text-white" onClick={leaveFolder}>
// // //             <ArrowLeft className="w-5 h-5" />
// // //             Back
// // //           </button>

// // //           {/* Rename inline when editing */}
// // //           {editingFolder === viewingFolder ? (
// // //             <div className="flex items-center gap-2">
// // //               <input
// // //                 value={editFolderValue}
// // //                 onChange={(e) => setEditFolderValue(e.target.value)}
// // //                 onKeyDown={(e) => {
// // //                   if (e.key === "Enter") confirmRenameFolder();
// // //                   if (e.key === "Escape") setEditingFolder(null);
// // //                 }}
// // //                 className="h-10 rounded-xl bg-[#252526] px-3 text-white outline-none"
// // //                 placeholder="Collection name"
// // //                 autoFocus
// // //               />
// // //               <Button className="h-10 rounded-full text-white" style={{ background: GRADIENT }} disabled={!editFolderValue.trim()} onClick={confirmRenameFolder}>
// // //                 Save
// // //               </Button>
// // //               <Button className="h-10 rounded-full text-white" style={{ background: "#333335" }} variant="outline" onClick={() => setEditingFolder(null)}>
// // //                 Cancel
// // //               </Button>
// // //             </div>
// // //           ) : (
// // //             <div className="relative">
// // //               <button className="p-2 rounded-full hover:bg-white/10" onClick={() => setMenuForFolder(menuForFolder === viewingFolder ? null : viewingFolder)} aria-label="Folder menu">
// // //                 <MoreHorizontal className="w-5 h-5 text-white/85" />
// // //               </button>
// // //               {menuForFolder === viewingFolder && (
// // //                 <div className="absolute right-0 mt-2 rounded-[16px] p-2 shadow-lg border border-white/10 bg-[#333335]" ref={menuScopeRef}>
// // //                   <button onClick={() => startRenameFolder(viewingFolder)} className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm">
// // //                     <Pencil className="h-4 w-4" />
// // //                     Rename folder
// // //                   </button>
// // //                   <button onClick={() => deleteFolder(viewingFolder)} className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm">
// // //                     <Trash className="h-4 w-4" />
// // //                     Delete folder
// // //                   </button>
// // //                 </div>
// // //               )}
// // //             </div>
// // //           )}
// // //         </div>

// // //         {/* Folder header */}
// // //         <div className="rounded-2xl border border-white/10 bg-[#121213] overflow-hidden">
// // //           <div className="relative h-56 w-full">
// // //             <img src={folderCover(folder, 0)} alt={viewingFolder || ""} className="w-full h-full object-cover" />
// // //             <div className="absolute top-4 left-4 px-3 py-1 text-[11px] font-semibold text-white rounded-full" style={{ background: GRADIENT }}>
// // //               {folder.items?.length || 0} {folder.items?.length === 1 ? "ITEM" : "ITEMS"}
// // //             </div>
// // //           </div>
// // //           <div className="px-5 py-4 flex items-center gap-2">
// // //             <FolderIcon className="w-5 h-5 text-white/70" />
// // //             <h2 className="text-white text-xl font-semibold">{viewingFolder}</h2>
// // //           </div>
// // //         </div>

// // //         {/* Items grid — SAME CARD DESIGN */}
// // //         <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
// // //           {(folder.items || []).map((it, idx) => {
// // //             const refId = getDocId(it.ref);
// // //             const title = getItemTitle(it);
// // //             const text = pickTextFromRef(section, it.ref);
// // //             const imageUrl = itemImage(it, idx);
// // //             return (
// // //               <Card
// // //                 key={refId || `${title}_${idx}`}
// // //                 className="overflow-hidden"
// // //                 style={{
// // //                   width: 306,
// // //                   height: 500,
// // //                   borderRadius: 30,
// // //                   borderBottomWidth: 1,
// // //                   borderLeftWidth: 1,
// // //                   borderColor: "rgba(255,255,255,0.1)",
// // //                   background: "#1C1C1C",
// // //                   fontFamily: "Inter, sans-serif",
// // //                 }}
// // //               >
// // //                 <CardContent className="relative p-4 h-full flex flex-col">
// // //                   <div className="relative w-full overflow-hidden" style={{ width: 270, height: 220, borderRadius: 16, backgroundColor: "#0B0B0B", margin: "0 auto" }}>
// // //                     <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-[16px]" />
// // //                     <div className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full" style={{ background: GRADIENT }}>
// // //                       {viewingFolder}
// // //                     </div>
// // //                     <div className="absolute top-3 right-3">
// // //                       <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-white bg-black/50 border border-white/30 backdrop-blur-sm">
// // //                         <Download className="h-3.5 w-3.5" />
// // //                         {(it as any).uses ? (it as any).uses : 0} USES
// // //                       </div>
// // //                     </div>
// // //                   </div>

// // //                   <div className="mt-4">
// // //                     <div className="flex items-center justify-between">
// // //                       <h3 className="text-[18px] leading-snug font-semibold text-white">{title}</h3>
// // //                     </div>
// // //                     <p className="mt-2 text-[13px] leading-relaxed text-white/70">
// // //                       {text.length > 140 ? `${text.slice(0, 140)}…` : text}
// // //                     </p>
// // //                   </div>

// // //                   <div className="mt-auto">{renderCardFooter(text, title)}</div>
// // //                 </CardContent>
// // //               </Card>
// // //             );
// // //           })}
// // //           {!folder.items?.length && <div className="text-center text-white/70 col-span-full py-12">No items inside this folder yet.</div>}
// // //         </div>
// // //       </div>
// // //     );
// // //   };

// // //   /* ───────── All Saved (direct items) with Edit/Delete ───────── */
// // //   const renderAllSaved = () => {
// // //     if (!directItems.length) return null;
// // //     return (
// // //       <div className="container mx-auto px-0 sm:px-0 mt-16">
// // //         <h2 className="text-white mb-6 px-1" style={{ fontFamily: "Inter", fontWeight: 600, fontSize: "22px", lineHeight: "100%" }}>
// // //           All Saved
// // //         </h2>

// // //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
// // //           {directItems.map((it, idx) => {
// // //             const refId = getDocId(it.ref);
// // //             const title = getItemTitle(it);
// // //             const text = pickTextFromRef(section, it.ref);
// // //             const imageUrl = itemImage(it, idx);
// // //             const isMenu = menuForDirect === refId;

// // //             return (
// // //               <Card
// // //                 key={refId || `${title}_${idx}`}
// // //                 className="overflow-hidden"
// // //                 style={{
// // //                   width: 306,
// // //                   height: 500,
// // //                   borderRadius: 30,
// // //                   borderBottomWidth: 1,
// // //                   borderLeftWidth: 1,
// // //                   borderColor: "rgba(255,255,255,0.1)",
// // //                   background: "#1C1C1C",
// // //                   fontFamily: "Inter, sans-serif",
// // //                 }}
// // //               >
// // //                 <CardContent className="p-4 h-full flex flex-col" ref={isMenu ? menuScopeRef : undefined}>
// // //                   <div className="relative w-full overflow-hidden" style={{ width: 270, height: 220, borderRadius: 16, backgroundColor: "#0B0B0B", margin: "0 auto" }}>
// // //                     <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-[16px]" />
// // //                     <div className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full" style={{ background: GRADIENT }}>
// // //                       ALL SAVED
// // //                     </div>
// // //                   </div>

// // //                   <div className="mt-3 flex items-center justify-between">
// // //                     <h3 className="text-[16px] font-semibold text-white">{title}</h3>
// // //                     <button
// // //                       type="button"
// // //                       onClick={() => (isMenu ? setMenuForDirect(null) : openMoveForm(refId, title))}
// // //                       className="p-1 rounded-full hover:bg-white/10"
// // //                       aria-label="More actions"
// // //                     >
// // //                       <MoreHorizontal className="h-5 w-5 text-white/85" />
// // //                     </button>
// // //                   </div>

// // //                   <p className="mt-2 text-[13px] text-white/70">{text.length > 140 ? `${text.slice(0, 140)}…` : text}</p>

// // //                   <div className="mt-auto">{renderCardFooter(text, title)}</div>

// // //                   {/* 3-dot Edit/Delete */}
// // //                   {isMenu && (
// // //                     <div className="mt-3 rounded-[16px] p-3 shadow-lg border border-white/10 bg-[#333335]">
// // //                       {/* Move to folder */}
// // //                       <div className="space-y-2">
// // //                         <div className="text-white/80 text-sm font-medium">Move to folder</div>
// // //                         <input
// // //                           value={moveFolderName}
// // //                           onChange={(e) => setMoveFolderName(e.target.value)}
// // //                           placeholder="Folder name (collection)"
// // //                           className="h-9 w-full rounded-xl bg-[#252526] px-3 text-white outline-none"
// // //                         />
// // //                         <input
// // //                           value={moveItemName}
// // //                           onChange={(e) => setMoveItemName(e.target.value)}
// // //                           placeholder="Item title (optional)"
// // //                           className="h-9 w-full rounded-xl bg-[#252526] px-3 text-white outline-none"
// // //                         />
// // //                         <div className="flex gap-2 pt-1">
// // //                           <Button className="h-9 rounded-full text-white" style={{ background: GRADIENT }} disabled={!moveFolderName.trim()} onClick={performMoveToFolder}>
// // //                             Move
// // //                           </Button>
// // //                           <Button
// // //                             className="h-9 rounded-full text-white"
// // //                             style={{ background: "#333335" }}
// // //                             variant="outline"
// // //                             onClick={() => {
// // //                               setMenuForDirect(null);
// // //                               setMoveRefId(null);
// // //                             }}
// // //                           >
// // //                             Cancel
// // //                           </Button>
// // //                         </div>
// // //                       </div>

// // //                       <div className="h-px bg-white/10 my-3" />

// // //                       <button onClick={() => deleteSingleItem(refId)} className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm">
// // //                         <Trash className="h-4 w-4" />
// // //                         Delete item
// // //                       </button>
// // //                     </div>
// // //                   )}
// // //                 </CardContent>
// // //               </Card>
// // //             );
// // //           })}
// // //         </div>
// // //       </div>
// // //     );
// // //   };

// // //   /* ───────── Collections grid (folder preview cards) ───────── */
// // //   const renderFolderGrid = () => {
// // //     if (loading) return <div className="text-center text-white/80 py-10">Loading your saved items…</div>;
// // //     if (!folders.length)
// // //       return (
// // //         <div className="text-center py-16">
// // //           <img src="/icons/void.png" alt="" className="mx-auto mb-6 h-40 w-auto opacity-90" />
// // //           <p className="text-white text-xl">No folders yet</p>
// // //           <p className="text-white/70 mt-2">Save with a Name/Title to create a folder here.</p>
// // //         </div>
// // //       );

// // //     return (
// // //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
// // //         {folders.map((c, idx) => {
// // //           const isMenu = menuForFolder === c.title;
// // //           const cover = folderCover(c, idx);
// // //           const count = (c.items || []).length;

// // //           return (
// // //             <Card
// // //               key={c.title}
// // //               className="overflow-hidden"
// // //               style={{
// // //                 width: 306,
// // //                 borderRadius: 30,
// // //                 borderBottomWidth: 1,
// // //                 borderLeftWidth: 1,
// // //                 borderColor: "rgba(255,255,255,0.1)",
// // //                 background: "#1C1C1C",
// // //               }}
// // //             >
// // //               <CardContent className="relative p-4" ref={isMenu ? menuScopeRef : undefined}>
// // //                 <div
// // //                   className="relative w-full overflow-hidden group cursor-pointer"
// // //                   style={{ width: 270, height: 220, borderRadius: 16, backgroundColor: "#0B0B0B", margin: "0 auto" }}
// // //                   onClick={() => openFolder(c.title)}
// // //                   title={c.title}
// // //                   aria-label={c.title}
// // //                 >
// // //                   <img src={cover} alt={c.title} className="w-full h-full object-cover rounded-[16px]" />
// // //                   <div className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full" style={{ background: GRADIENT }}>
// // //                     {count} {count === 1 ? "ITEM" : "ITEMS"}
// // //                   </div>
// // //                 </div>

// // //                 <div className="mt-3 flex items-center justify-between">
// // //                   <h3 className="text-[16px] font-semibold text-white">{c.title}</h3>
// // //                   <button type="button" onClick={() => setMenuForFolder(isMenu ? null : c.title)} className="p-1 rounded-full hover:bg-white/10" aria-label="Folder menu">
// // //                     <MoreHorizontal className="h-5 w-5 text-white/85" />
// // //                   </button>
// // //                 </div>

// // //                 {isMenu && (
// // //                   <div className="mt-3 rounded-[16px] p-2 shadow-lg border border-white/10 bg-[#333335]">
// // //                     <button
// // //                       onClick={() => {
// // //                         setMenuForFolder(null);
// // //                         startRenameFolder(c.title);
// // //                       }}
// // //                       className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm"
// // //                     >
// // //                       <Pencil className="h-4 w-4" />
// // //                       Rename folder
// // //                     </button>
// // //                     <button onClick={() => deleteFolder(c.title)} className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm">
// // //                       <Trash className="h-4 w-4" />
// // //                       Delete folder
// // //                     </button>
// // //                   </div>
// // //                 )}
// // //               </CardContent>
// // //             </Card>
// // //           );
// // //         })}
// // //       </div>
// // //     );
// // //   };

// // //   return (
// // //     <div className="dark min-h-screen bg-background text-foreground">
// // //       <div className="container mx-auto px-6 py-8">
// // //         <Header />
// // //       </div>

// // //       <div className="container mx-auto px-6 -mt-8">
// // //         <div className="flex flex-col items-center text-center mb-8">
// // //           <h1 style={{ fontFamily: "Inter", fontWeight: 400, fontSize: "32px", lineHeight: "100%" }} className="text-white">
// // //             Saved Items
// // //           </h1>
// // //         </div>
// // //       </div>

// // //       <div className="container mx-auto px-6 pb-16">
// // //         {/* Top row: center tabs + right pill */}
// // //       {/* Top row: center tabs + smaller right pill */}
// // // <div className="mx-auto mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 max-w-6xl">
// // //   {/* CENTER: main tabs (4) OR history tabs (2) */}
// // //   <div className="col-start-2 col-end-3 justify-self-center">
// // //     {viewMode === "saved" ? (
// // //       <div className="flex w-fit items-center gap-2 rounded-full bg-white/5 px-2 py-2">
// // //         {TABS.map((t) => {
// // //           const active = t.id === tab;
// // //           return (
// // //             <button
// // //               key={t.id}
// // //               onClick={() => {
// // //                 setTab(t.id);
// // //                 setMenuForFolder(null);
// // //                 setMenuForDirect(null);
// // //                 if (viewingFolder) {
// // //                   const qs = new URLSearchParams({ tab: t.id, folder: viewingFolder });
// // //                   history.replaceState(
// // //                     { folder: viewingFolder, tab: t.id },
// // //                     "",
// // //                     `/folder-save?${qs.toString()}`
// // //                   );
// // //                 }
// // //               }}
// // //               className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
// // //                 active
// // //                   ? "bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
// // //                   : "bg-transparent hover:bg-white/10"
// // //               }`}
// // //             >
// // //               <img src={t.icon} alt="" className="h-4 w-4" />
// // //               {t.label}
// // //             </button>
// // //           );
// // //         })}
// // //       </div>
// // //     ) : (
// // //       <div className="flex w-fit items-center gap-2 rounded-full bg-white/5 px-2 py-2">
// // //         {(["smartgen", "prompt-optimization"] as HistoryTab[]).map((h) => {
// // //           const active = historyTab === h;
// // //           return (
// // //             <button
// // //               key={h}
// // //               onClick={() => setHistoryTab(h)}
// // //               className={`rounded-full px-4 py-2 text-sm transition ${
// // //                 active
// // //                   ? "bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] text-white"
// // //                   : "hover:bg-white/10 text-white"
// // //               }`}
// // //             >
// // //               {h === "smartgen" ? "Smartgen" : "Prompt Optimiser"}
// // //             </button>
// // //           );
// // //         })}
// // //       </div>
// // //     )}
// // //   </div>

// // //   {/* RIGHT: smaller Saved ⇄ Prompt History pill */}
// // //   <div className="col-start-3 col-end-4 justify-self-end">
// // //     <div
// // //       className="flex items-center gap-2 h-[44px] rounded-[200px] px-4 min-w-[280px] whitespace-nowrap"
// // //       style={{ backgroundColor: "#121213", border: "1px solid #282829" }}
// // //     >
// // //       <FolderIcon className="h-4 w-4 text-white/80" />
// // //       <span className="text-white/80 text-[13px]">Saved</span>

// // //       <Switch
// // //         id="view-toggle"
// // //         checked={viewMode === "history"}
// // //         onCheckedChange={(v) => setViewMode(v ? "history" : "saved")}
// // //         className={[
// // //           "w-[48px] h-[24px] rounded-full relative",
// // //           "bg-[linear-gradient(270.1deg,#E31FEF_0.08%,#2D6AE8_99.92%)]",
// // //           "border border-[#282829]",
// // //           "[&>span]:h-[18px] [&>span]:w-[18px] [&>span]:rounded-full [&>span]:bg-black/80",
// // //           "[&>span]:translate-x-[4px] data-[state=checked]:[&>span]:translate-x-[26px]",
// // //         ].join(" ")}
// // //       />

// // //       <label
// // //         htmlFor="view-toggle"
// // //         className="flex items-center gap-2 cursor-pointer text-white/80 text-[13px] leading-none"
// // //       >
// // //         <HistoryIcon className="h-4 w-4 text-white/80" />
// // //         Prompt History
// // //       </label>
// // //     </div>
// // //   </div>
// // // </div>


// // //         {/* CONTENT */}
// // //         {viewMode === "saved" ? (
// // //           <>
// // //             {!viewingFolder ? renderFolderGrid() : renderFolderPage()}
// // //             {!viewingFolder && renderAllSaved()}
// // //           </>
// // //         ) : (
// // //           <PromptHistory which={historyTab} />
// // //         )}
// // //       </div>

// // //       <div className="mt-20">
// // //         <Footer />
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // /* ---------------- Prompt History wrapper ---------------- */
// // // function PromptHistory({ which }: { which: "smartgen" | "prompt-optimization" }) {
// // //   return (
// // //     <div className="container mx-auto px-0 sm:px-0 mt-6">
// // //       {which === "prompt-optimization" ? <HistoryOptimizerList /> : <HistorySmartgenList />}
// // //     </div>
// // //   );
// // // }


// // // function HistoryOptimizerList() {
// // //   const { token } = useAuth() as any;
// // //   const [items, setItems] = useState<any[]>([]);
// // //   const [loading, setLoading] = useState(false);

// // //   // favorites + bulk delete + sort + selection
// // //   const [favorites, setFavorites] = useState<Set<string>>(new Set());
// // //   const [selected, setSelected] = useState<Set<string>>(new Set());
// // //   const [sortBy, setSortBy] = useState<"newest" | "oldest" | "favorites">("newest");

// // //   const PROMPT_OPTIMIZER_URL = `${base}/api/promptoptimizer`;

// // //   const headers = useMemo(() => {
// // //     const h: Record<string, string> = {};
// // //     if (token) h.Authorization = `Bearer ${token}`;
// // //     return h;
// // //   }, [token]);

// // //   const viewList = useMemo(() => {
// // //     let arr = [...items];
// // //     if (sortBy === "favorites") arr = arr.filter((it) => favorites.has(it._id));
// // //     const t = (x: any) => (x?.createdAt ? new Date(x.createdAt).getTime() : 0);
// // //     arr.sort((a, b) => (sortBy === "oldest" ? t(a) - t(b) : t(b) - t(a)));
// // //     return arr;
// // //   }, [items, sortBy, favorites]);

// // //   const allOnPageSelected = viewList.length > 0 && viewList.every((it) => selected.has(it._id));

// // //   const load = async () => {
// // //     setLoading(true);
// // //     try {
// // //       const res = await fetch(PROMPT_OPTIMIZER_URL, { method: "GET", headers, credentials: "include" });
// // //       const data = await res.json().catch(() => ({}));
// // //       if (!res.ok) throw new Error(data?.error || `http_${res.status}`);
// // //       setItems(Array.isArray(data?.promptsoptimizer) ? data.promptsoptimizer : []);
// // //     } catch (e: any) {
// // //       toast({ title: "Couldn’t load optimiser history", description: e?.message || "Try again", variant: "destructive" });
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const del = async (id: string) => {
// // //     try {
// // //       const res = await fetch(`${PROMPT_OPTIMIZER_URL}/${id}`, {
// // //         method: "DELETE",
// // //         headers: { ...headers, "Content-Type": "application/json" },
// // //         credentials: "include",
// // //       });
// // //       const data = await res.json().catch(() => ({}));
// // //       if (!res.ok) throw new Error(data?.error || `http_${res.status}`);
// // //       setItems((prev) => prev.filter((x) => x._id !== id));
// // //       setSelected((s) => {
// // //         const n = new Set(s);
// // //         n.delete(id);
// // //         return n;
// // //       });
// // //       toast({ title: "Deleted", description: "Optimization removed." });
// // //     } catch (err: any) {
// // //       toast({ title: "Delete failed", description: err?.message || "Try again", variant: "destructive" });
// // //     }
// // //   };

// // //   const deleteSelected = async () => {
// // //     const ids = viewList.map((x) => x._id).filter((id) => selected.has(id));
// // //     for (const id of ids) await del(id);
// // //   };

// // //   const toggleFavorite = (id: string) =>
// // //     setFavorites((prev) => {
// // //       const next = new Set(prev);
// // //       next.has(id) ? next.delete(id) : next.add(id);
// // //       return next;
// // //     });

// // //   useEffect(() => {
// // //     load();
// // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // //   }, [token]);

// // //   // persist favorites
// // //   useEffect(() => {
// // //     try {
// // //       const raw = localStorage.getItem("optimizer_favs");
// // //       if (raw) setFavorites(new Set(JSON.parse(raw)));
// // //     } catch {}
// // //   }, []);
// // //   useEffect(() => {
// // //     try {
// // //       localStorage.setItem("optimizer_favs", JSON.stringify(Array.from(favorites)));
// // //     } catch {}
// // //   }, [favorites]);

// // //   const selectAllToggle = () => {
// // //     if (allOnPageSelected) {
// // //       const n = new Set(selected);
// // //       viewList.forEach((it) => n.delete(it._id));
// // //       setSelected(n);
// // //     } else {
// // //       const n = new Set(selected);
// // //       viewList.forEach((it) => n.add(it._id));
// // //       setSelected(n);
// // //     }
// // //   };

// // //   // split first line as “title” and the rest as “subtitle”
// // //   const splitTitleBody = (txt: string) => {
// // //     const cleaned = (txt || "").trim();
// // //     if (!cleaned) return { title: "", body: "" };
// // //     const firstBreak = cleaned.indexOf("\n");
// // //     if (firstBreak > -1) return { title: cleaned.slice(0, firstBreak), body: cleaned.slice(firstBreak + 1) };
// // //     const dot = cleaned.indexOf(". ");
// // //     if (dot > 30 && dot < 100) return { title: cleaned.slice(0, dot), body: cleaned.slice(dot + 2) };
// // //     return { title: cleaned.slice(0, 80), body: cleaned.slice(80) };
// // //   };

// // //   return (
// // //     <div className="text-white">
// // //       {/* toolbar (kept), compact and flat */}
// // //    {/* Local style just for this toolbar */}
// // // <style>{`
// // //   /* Style the <option> rows inside this specific select only */
// // //   .history-dd option {
// // //     background-color: #464646;
// // //     color: #fff;
// // //   }
// // // `}</style>

// // // {/* Top actions — aligned to history boxes (max 1000px) */}
// // // <div className="mx-auto w-full max-w-[1000px] mb-3 flex items-center justify-between gap-3">
// // //   <div className="flex items-center gap-3">
// // //     <label className="inline-flex items-center gap-2 cursor-pointer select-none">
// // //       <input
// // //         type="checkbox"
// // //         className="h-4 w-4 rounded border-white/30 bg-transparent"
// // //         checked={allOnPageSelected}
// // //         onChange={selectAllToggle}
// // //       />
// // //       <span className="text-white/90 text-sm">Select all</span>
// // //     </label>

// // //     <Button
// // //       onClick={deleteSelected}
// // //       disabled={selected.size === 0}
// // //       className="h-9 rounded-[10px] bg-[#3A3A3A] hover:opacity-90 px-4 inline-flex items-center gap-2"
// // //     >
// // //       <Trash className="h-4 w-4" />
// // //       <span className="text-sm">Delete</span>
// // //     </Button>

// // //     <div className="relative">
// // //       <select
// // //         value={sortBy}
// // //         onChange={(e) => setSortBy(e.target.value as any)}
// // //         /* transparent button with white border */
// // //         className="history-dd appearance-none h-9 rounded-[10px] px-3 pr-8 text-sm text-white bg-transparent border border-white"
// // //       >
// // //         {/* dropdown rows have bg #464646 via CSS above */}
// // //         <option value="newest">Newest</option>
// // //         <option value="oldest">Oldest</option>
// // //         <option value="favorites">Favorites</option>
// // //       </select>
// // //       <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/80">
// // //         ▾
// // //       </span>
// // //     </div>
// // //   </div>

// // //   <div className="text-white/70 text-sm">{viewList.length} results</div>
// // // </div>


// // //       {/* list — centered, one box per item */}
// // //       {loading && items.length === 0 ? (
// // //         <div className="text-white flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
// // //    ) : viewList.length === 0 ? (
// // //   <div className="text-center py-16">
// // //     <img
// // //       src="/icons/void.png"
// // //       alt=""
// // //       className="mx-auto mb-6 h-40 w-auto opacity-90"
// // //     />
// // //     <p className="text-white text-xl">No Prompt optimiser history</p>
// // //     <p className="text-white/70 mt-2">When you generate prompts, they’ll show up here.</p>
// // //   </div>
// // // ) : (

// // //         <ul className="flex flex-col items-center gap-4">
// // //           {viewList.map((it) => {
// // //             const preview = it.outputPrompt || it.inputPrompt || "";
// // //             const created = it.createdAt ? new Date(it.createdAt) : null;
// // //             const isFav = favorites.has(it._id);
// // //             const { title, body } = splitTitleBody(preview);

// // //             const toggleSelected = () =>
// // //               setSelected((s) => {
// // //                 const n = new Set(s);
// // //                 n.has(it._id) ? n.delete(it._id) : n.add(it._id);
// // //                 return n;
// // //               });

// // //             return (
// // //               <li key={it._id} className="w-full flex justify-center">
// // //                 {/* SINGLE BOX (matches your image) */}
// // // <div className="relative w-full max-w-[1000px] rounded-[20px] border-[4px] border-[#111419] p-5 pb-20 min-h-[220px]">
// // //                   {/* star top-right */}
// // //                   <button
// // //                     onClick={() => toggleFavorite(it._id)}
// // //                     className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10"
// // //                     title={isFav ? "Unfavorite" : "Favorite"}
// // //                   >
// // //                     <Star className={`h-5 w-5 ${isFav ? "text-[#8B5CF6] fill-[#8B5CF6]" : "text-white/70"}`} />
// // //                   </button>

// // //                   {/* checkbox top-left */}
// // //                   <label className="absolute top-3 left-3 inline-flex items-center">
// // //                     <input
// // //                       type="checkbox"
// // //                       className="h-4 w-4 rounded border-white/40 bg-transparent"
// // //                       checked={selected.has(it._id)}
// // //                       onChange={toggleSelected}
// // //                     />
// // //                   </label>

// // //                   {/* text content (no scrollbars) */}
// // //                   <div className="pl-8 pr-16">
// // //                     {title && <div className="text-[16px] font-semibold text-white mb-1">{title}</div>}
// // //                     {body ? (
// // //                       <div className="text-[14px] text-white/80 whitespace-pre-wrap break-words">{body}</div>
// // //                     ) : (
// // //                       <div className="text-[14px] text-white/80 whitespace-pre-wrap break-words">{preview}</div>
// // //                     )}
// // //                   </div>

// // //                   {/* bottom-left time */}
// // //                   {created && (
// // //                     <div className="absolute left-4 bottom-3 text-xs text-white/60">{created.toLocaleString()}</div>
// // //                   )}

// // //                   {/* bottom-right actions: round Delete + Copy pill */}
// // //                   <div className="absolute right-3 bottom-3 flex items-center gap-2">
// // //                     <button
// // //                       title="Delete"
// // //                       className="h-9 w-9 rounded-full bg-[#3A3A3A] hover:bg-[#4A4A4A] flex items-center justify-center"
// // //                       onClick={() => del(it._id)}
// // //                     >
// // //                       <Trash className="h-4 w-4" />
// // //                     </button>
// // //                     <button
// // //                       title="Copy"
// // //                       className="h-9 px-3 rounded-[10px] bg-[#3A3A3A] hover:bg-[#4A4A4A] inline-flex items-center gap-2"
// // //                       onClick={() =>
// // //                         navigator.clipboard.writeText(preview).then(() =>
// // //                           toast({ title: "Copied", description: "Prompt copied to clipboard." })
// // //                         )
// // //                       }
// // //                     >
// // //                       <Copy className="h-4 w-4" />
// // //                       <span className="text-sm">Copy</span>
// // //                     </button>
// // //                   </div>
// // //                 </div>
// // //               </li>
// // //             );
// // //           })}
// // //         </ul>
// // //       )}
// // //     </div>
// // //   );
// // // }



// // // function HistorySmartgenList() {
// // //   const { token } = useAuth() as any;

// // //   const [items, setItems] = useState<Array<{ _id: string; text: string; createdAt?: string }>>([]);
// // //   const [loading, setLoading] = useState(false);

// // //   // favorites + bulk delete + sort + selection
// // //   const [favorites, setFavorites] = useState<Set<string>>(new Set());
// // //   const [selected, setSelected] = useState<Set<string>>(new Set());
// // //   const [sortBy, setSortBy] = useState<"newest" | "oldest" | "favorites">("newest");
// // //   const [deletingId, setDeletingId] = useState<string | null>(null);
// // //   const [bulkDeleting, setBulkDeleting] = useState<boolean>(false);

// // //   const SMARTGEN_URLS = [`${base}/api/smartgen`, `${base}/api/smartgen/history`];
// // //   const SMARTGEN_API = `${base}/api/smartgen`;
// // //   const SMARTGEN_DELETE_ALL = `${base}/api/smartgen/user/all`;

// // //   const viewList = useMemo(() => {
// // //     let arr = [...items];
// // //     if (sortBy === "favorites") arr = arr.filter((it) => favorites.has(it._id));
// // //     const t = (x: any) => (x?.createdAt ? new Date(x.createdAt).getTime() : 0);
// // //     arr.sort((a, b) => (sortBy === "oldest" ? t(a) - t(b) : t(b) - t(a)));
// // //     return arr;
// // //   }, [items, sortBy, favorites]);

// // //   const allOnPageSelected =
// // //     viewList.length > 0 && viewList.every((it) => selected.has(it._id));

// // //   /* ---------------- Load history ---------------- */
// // //   useEffect(() => {
// // //     (async () => {
// // //       setLoading(true);
// // //       try {
// // //         let ok = false;
// // //         for (const url of SMARTGEN_URLS) {
// // //           try {
// // //             const res = await fetch(url, {
// // //               method: "GET",
// // //               headers: token ? { Authorization: `Bearer ${token}` } : undefined,
// // //               credentials: "include",
// // //             });
// // //             const data = await res.json().catch(() => ({}));
// // //             if (res.ok) {
// // //               const arr =
// // //                 Array.isArray(data)
// // //                   ? data
// // //                   : Array.isArray((data as any)?.smartgen)
// // //                   ? (data as any).smartgen
// // //                   : Array.isArray((data as any)?.prompts)
// // //                   ? (data as any).prompts
// // //                   : Array.isArray((data as any)?.items)
// // //                   ? (data as any).items
// // //                   : [];
// // //               if (arr.length) {
// // //                 const mapped = arr
// // //                   .map((d: any, idx: number) => ({
// // //                     _id: d?._id || d?.id || String(idx),
// // //                     text:
// // //                       d?.detailedPrompt ||
// // //                       d?.output ||
// // //                       d?.result ||
// // //                       d?.inputPrompt ||
// // //                       d?.prompt ||
// // //                       "",
// // //                     createdAt: d?.createdAt,
// // //                   }))
// // //                   .filter((x: any) => x.text);
// // //                 if (mapped.length) {
// // //                   setItems(mapped);
// // //                   ok = true;
// // //                   break;
// // //                 }
// // //               }
// // //             }
// // //           } catch {}
// // //         }

// // //         if (!ok) {
// // //           // fallback: saved-collections smartgen
// // //           const data = await apiGetAll(token).catch(() => ({} as any));
// // //           const block = (data?.sections?.smartgen ||
// // //             (data?.sections ? data.sections["smartgen"] : undefined)) as any;

// // //           const direct = Array.isArray(block?.directItems) ? block.directItems : [];
// // //           const fromDirect = direct
// // //             .map((it: any, i: number) => ({
// // //               _id:
// // //                 (typeof it.ref === "string" ? it.ref : it?.ref?._id) || `direct_${i}`,
// // //               text: pickTextFromRef("smartgen", it.ref),
// // //               createdAt: it?.ref?.createdAt,
// // //             }))
// // //             .filter((x: any) => x.text);

// // //           const fromFolders = (Array.isArray(block?.collections) ? block.collections : [])
// // //             .flatMap((c: any) => (Array.isArray(c.items) ? c.items : []))
// // //             .map((it: any, i: number) => ({
// // //               _id:
// // //                 (typeof it.ref === "string" ? it.ref : it?.ref?._id) || `col_${i}`,
// // //               text: pickTextFromRef("smartgen", it.ref),
// // //               createdAt: it?.ref?.createdAt,
// // //             }))
// // //             .filter((x: any) => x.text);

// // //           setItems([...fromDirect, ...fromFolders]);
// // //         }
// // //       } catch (e: any) {
// // //         toast({
// // //           title: "Couldn’t load smartgen history",
// // //           description: e?.message || "Try again",
// // //           variant: "destructive",
// // //         });
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     })();
// // //   }, [token]);

// // //   /* ---------------- Favorites persistence ---------------- */
// // //   useEffect(() => {
// // //     try {
// // //       const raw = localStorage.getItem("smartgen_favs");
// // //       if (raw) setFavorites(new Set(JSON.parse(raw)));
// // //     } catch {}
// // //   }, []);
// // //   useEffect(() => {
// // //     try {
// // //       localStorage.setItem("smartgen_favs", JSON.stringify(Array.from(favorites)));
// // //     } catch {}
// // //   }, [favorites]);

// // //   /* ---------------- Select all toggle (fix for your error) ---------------- */
// // //   const selectAllToggle = () => {
// // //     setSelected((prev) => {
// // //       const n = new Set(prev);
// // //       const allSelected = viewList.length > 0 && viewList.every((it) => n.has(it._id));
// // //       if (allSelected) {
// // //         viewList.forEach((it) => n.delete(it._id));
// // //         console.log("🟣 [Smartgen] Unselect all on page");
// // //       } else {
// // //         viewList.forEach((it) => n.add(it._id));
// // //         console.log("🟢 [Smartgen] Select all on page:", viewList.map((x) => x._id));
// // //       }
// // //       return n;
// // //     });
// // //   };

// // //   /* ---------------- Per-item delete (GET for log, then DELETE) ---------------- */
// // //   const delSmartgen = async (id: string) => {
// // //     try {
// // //       console.log("🟡 [Smartgen] Delete requested for id:", id);
// // //       setDeletingId(id);

// // //       // Optional GET for log
// // //       try {
// // //         const r = await fetch(`${SMARTGEN_API}/${id}`, {
// // //           method: "GET",
// // //           headers: token ? { Authorization: `Bearer ${token}` } : undefined,
// // //           credentials: "include",
// // //         });
// // //         const j = await r.json().catch(() => ({}));
// // //         if (!r.ok) {
// // //           console.warn("⚠️ [Smartgen] GET before delete failed:", r.status, j);
// // //         } else {
// // //           console.log("📄 [Smartgen] GET item before delete:", j?.item || j);
// // //         }
// // //       } catch (gErr) {
// // //         console.warn("⚠️ [Smartgen] GET pre-check error:", gErr);
// // //       }

// // //       // Delete
// // //       const res = await fetch(`${SMARTGEN_API}/${id}`, {
// // //         method: "DELETE",
// // //         headers: token
// // //           ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
// // //           : { "Content-Type": "application/json" },
// // //         credentials: "include",
// // //       });
// // //       const data = await res.json().catch(() => ({}));

// // //       if (!res.ok || data?.success === false) {
// // //         console.error("❌ [Smartgen] Delete failed:", res.status, data);
// // //         toast({
// // //           title: "Delete failed",
// // //           description: data?.error || `http_${res.status}`,
// // //           variant: "destructive",
// // //         });
// // //         return;
// // //       }

// // //       console.log("✅ [Smartgen] Delete success for id:", id);
// // //       setItems((prev) => prev.filter((x) => x._id !== id));
// // //       setSelected((s) => {
// // //         const n = new Set(s);
// // //         n.delete(id);
// // //         return n;
// // //       });
// // //       toast({ title: "Deleted", description: "History removed." });
// // //     } catch (err) {
// // //       console.error("❌ [Smartgen] Delete error:", err);
// // //       toast({
// // //         title: "Delete failed",
// // //         description: (err as any)?.message || "Try again",
// // //         variant: "destructive",
// // //       });
// // //     } finally {
// // //       setDeletingId(null);
// // //     }
// // //   };

// // //   /* ---------------- Server bulk: delete ALL for user ---------------- */
// // //   const deleteAllForUser = async () => {
// // //     try {
// // //       setBulkDeleting(true);
// // //       console.log("🛑 [Smartgen] BULK DELETE via /user/all");

// // //       const res = await fetch(SMARTGEN_DELETE_ALL, {
// // //         method: "DELETE",
// // //         headers: token
// // //           ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
// // //           : { "Content-Type": "application/json" },
// // //         credentials: "include",
// // //       });
// // //       const data = await res.json().catch(() => ({}));

// // //       if (!res.ok || data?.success === false) {
// // //         console.error("❌ [Smartgen] BULK DELETE failed:", res.status, data);
// // //         toast({
// // //           title: "Delete all failed",
// // //           description: data?.error || `http_${res.status}`,
// // //           variant: "destructive",
// // //         });
// // //         return;
// // //       }

// // //       console.log("✅ [Smartgen] BULK DELETE success:", data?.message || data);
// // //       toast({ title: "Deleted all", description: data?.message || "All Smartgen history removed." });

// // //       // wipe local state
// // //       setItems([]);
// // //       setSelected(new Set());
// // //     } catch (err) {
// // //       console.error("❌ [Smartgen] BULK DELETE error:", err);
// // //       toast({
// // //         title: "Delete all failed",
// // //         description: (err as any)?.message || "Try again",
// // //         variant: "destructive",
// // //       });
// // //     } finally {
// // //       setBulkDeleting(false);
// // //     }
// // //   };

// // //   /* ---------------- Delete selected (reuses existing Delete button) ---------------- */
// // //   const deleteSelected = async () => {
// // //     const allIds = items.map((x) => x._id);
// // //     const selectedIds = allIds.filter((id) => selected.has(id));
// // //     const selectedIsAll = selectedIds.length === allIds.length && allIds.every((id) => selected.has(id));

// // //     if (selectedIsAll) {
// // //       console.log("🟠 [Smartgen] All items selected → using /user/all");
// // //       await deleteAllForUser();
// // //       return;
// // //     }

// // //     const idsToDelete = viewList.map((x) => x._id).filter((id) => selected.has(id));
// // //     console.log("🟠 [Smartgen] Delete selected ids:", idsToDelete);

// // //     for (const id of idsToDelete) {
// // //       /* eslint-disable no-await-in-loop */
// // //       await delSmartgen(id);
// // //       /* eslint-enable no-await-in-loop */
// // //     }
// // //   };

// // //   const toggleFavorite = (id: string) =>
// // //     setFavorites((prev) => {
// // //       const next = new Set(prev);
// // //       next.has(id) ? next.delete(id) : next.add(id);
// // //       return next;
// // //     });

// // //   const splitTitleBody = (txt: string) => {
// // //     const cleaned = (txt || "").trim();
// // //     if (!cleaned) return { title: "", body: "" };
// // //     const firstBreak = cleaned.indexOf("\n");
// // //     if (firstBreak > -1) return { title: cleaned.slice(0, firstBreak), body: cleaned.slice(firstBreak + 1) };
// // //     const dot = cleaned.indexOf(". ");
// // //     if (dot > 30 && dot < 100) return { title: cleaned.slice(0, dot), body: cleaned.slice(dot + 2) };
// // //     return { title: cleaned.slice(0, 80), body: cleaned.slice(80) };
// // //   };

// // //   return (
// // //     <div className="text-white">
// // //       <style>{`.history-dd option { background-color: #464646; color: #fff; }`}</style>

// // //       {/* Toolbar — unchanged (no extra buttons added) */}
// // //       <div className="mx-auto w-full max-w-[1000px] mb-3 flex items-center justify-between gap-3">
// // //         <div className="flex items-center gap-3">
// // //           <label className="inline-flex items-center gap-2 cursor-pointer select-none">
// // //             <input
// // //               type="checkbox"
// // //               className="h-4 w-4 rounded border-white/30 bg-transparent"
// // //               checked={allOnPageSelected}
// // //               onChange={selectAllToggle}
// // //             />
// // //             <span className="text-white/90 text-sm">Select all</span>
// // //           </label>

// // //           {/* Your existing Delete button now does per-item OR /user/all automatically */}
// // //           <Button
// // //             onClick={deleteSelected}
// // //             disabled={selected.size === 0 || bulkDeleting}
// // //             className="h-9 rounded-[10px] bg-[#3A3A3A] hover:opacity-90 px-4 inline-flex items-center gap-2 disabled:opacity-60"
// // //           >
// // //             {bulkDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash className="h-4 w-4" />}
// // //             <span className="text-sm">Delete</span>
// // //           </Button>

// // //           <div className="relative">
// // //             <select
// // //               value={sortBy}
// // //               onChange={(e) => setSortBy(e.target.value as any)}
// // //               className="history-dd appearance-none h-9 rounded-[10px] px-3 pr-8 text-sm text-white bg-transparent border border-white"
// // //             >
// // //               <option value="newest">Newest</option>
// // //               <option value="oldest">Oldest</option>
// // //               <option value="favorites">Favorites</option>
// // //             </select>
// // //             <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/80">▾</span>
// // //           </div>
// // //         </div>

// // //         <div className="text-white/70 text-sm">{viewList.length} results</div>
// // //       </div>

// // //       {/* List */}
// // //       {loading && items.length === 0 ? (
// // //         <div className="text-white flex items-center gap-2">
// // //           <Loader2 className="h-4 w-4 animate-spin" /> Loading…
// // //         </div>
// // //       ) : viewList.length === 0 ? (
// // //         <div className="text-center py-16">
// // //           <img src="/icons/void.png" alt="" className="mx-auto mb-6 h-40 w-auto opacity-90" />
// // //           <p className="text-white text-xl">No smartgen history</p>
// // //           <p className="text-white/70 mt-2">When you generate prompts, they’ll show up here.</p>
// // //         </div>
// // //       ) : (
// // //         <ul className="flex flex-col items-center gap-4">
// // //           {viewList.map((it) => {
// // //             const created = it.createdAt ? new Date(it.createdAt) : null;
// // //             const isFav = favorites.has(it._id);
// // //             const { title, body } = splitTitleBody(it.text);

// // //             const toggleSelectedOne = () =>
// // //               setSelected((s) => {
// // //                 const n = new Set(s);
// // //                 n.has(it._id) ? n.delete(it._id) : n.add(it._id);
// // //                 return n;
// // //               });

// // //             return (
// // //               <li key={it._id} className="w-full flex justify-center">
// // //                 <div className="relative w-full max-w-[1000px] rounded-[20px] border-[4px] border-[#111419] p-5 pb-20 min-h-[220px]">
// // //                   {/* star */}
// // //                   <button
// // //                     onClick={() => toggleFavorite(it._id)}
// // //                     className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10"
// // //                     title={isFav ? "Unfavorite" : "Favorite"}
// // //                   >
// // //                     <Star className={`h-5 w-5 ${isFav ? "text-[#8B5CF6] fill-[#8B5CF6]" : "text-white/70"}`} />
// // //                   </button>

// // //                   {/* checkbox */}
// // //                   <label className="absolute top-3 left-3 inline-flex items-center">
// // //                     <input
// // //                       type="checkbox"
// // //                       className="h-4 w-4 rounded border-white/40 bg-transparent"
// // //                       checked={selected.has(it._id)}
// // //                       onChange={toggleSelectedOne}
// // //                     />
// // //                   </label>

// // //                   {/* content */}
// // //                   <div className="pl-8 pr-16">
// // //                     {title && <div className="text-[16px] font-semibold text-white mb-1">{title}</div>}
// // //                     <div className="text-[14px] text-white/80 whitespace-pre-wrap break-words">
// // //                       {body || it.text}
// // //                     </div>
// // //                   </div>

// // //                   {/* time */}
// // //                   {created && (
// // //                     <div className="absolute left-4 bottom-3 text-xs text-white/60">
// // //                       {created.toLocaleString()}
// // //                     </div>
// // //                   )}

// // //                   {/* actions */}
// // //                   <div className="absolute right-3 bottom-3 flex items-center gap-2">
// // //                     <button
// // //                       title="Delete"
// // //                       className="h-9 w-9 rounded-full bg-[#3A3A3A] hover:bg-[#4A4A4A] flex items-center justify-center disabled:opacity-60"
// // //                       disabled={deletingId === it._id || bulkDeleting}
// // //                       onClick={() => delSmartgen(it._id)}
// // //                     >
// // //                       {deletingId === it._id ? (
// // //                         <Loader2 className="h-4 w-4 animate-spin" />
// // //                       ) : (
// // //                         <Trash className="h-4 w-4" />
// // //                       )}
// // //                     </button>
// // //                     <button
// // //                       title="Copy"
// // //                       className="h-9 px-3 rounded-[10px] bg-[#3A3A3A] hover:bg-[#4A4A4A] inline-flex items-center gap-2"
// // //                       onClick={() =>
// // //                         navigator.clipboard
// // //                           .writeText(it.text)
// // //                           .then(() => toast({ title: "Copied", description: "Prompt copied to clipboard." }))
// // //                       }
// // //                     >
// // //                       <Copy className="h-4 w-4" />
// // //                       <span className="text-sm">Copy</span>
// // //                     </button>
// // //                   </div>
// // //                 </div>
// // //               </li>
// // //             );
// // //           })}
// // //         </ul>
// // //       )}
// // //     </div>
// // //   );
// // // }



// // // src/pages/SavedCollection.tsx
// // import { useEffect, useMemo, useRef, useState } from "react";
// // import Header from "@/components/Header";
// // import Footer from "@/components/Footer";
// // import { Card, CardContent } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { toast } from "@/components/ui/use-toast";

// // import {
// //   Download,
// //   MoreHorizontal,
// //   Pencil,
// //   Trash,
// //   ArrowLeft,
// //   Folder as FolderIcon,
// // } from "lucide-react";
// // import { useAuth } from "@/contexts/AuthContext";
// // import { loadSaved, type SavedItem } from "@/lib/savedCollections";

// // /* ============================================================================
// //    CONSTANTS
// //    ==========================================================================*/
// // const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
// // const base = API_BASE.replace(/\/+$/, "");
// // const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

// // const TABS = [
// //   { id: "smartgen", label: "Smartgen", icon: "/icons/smartgen.svg" },
// //   { id: "prompt-optimization", label: "Prompt Optimiser", icon: "/icons/prompt-optimization.svg" },
// //   { id: "prompt-marketplace", label: "Prompt Marketplace", icon: "/icons/prompt-marketplace.png" },
// //   { id: "prompt-library", label: "Prompt Library", icon: "/icons/prompt-library.png" },
// // ] as const;

// // type TabId = (typeof TABS)[number]["id"];
// // type SectionKey = "smartgen" | "prompt" | "promptOptimizer";
// // const SECTION_BY_TAB: Record<TabId, SectionKey> = {
// //   smartgen: "smartgen",
// //   "prompt-optimization": "promptOptimizer",
// //   "prompt-marketplace": "prompt",
// //   "prompt-library": "prompt",
// // };

// // const mockImages = ["/icons/pl1.png", "/icons/pl2.png", "/icons/pl3.png", "/icons/pl4.png"];

// // /* ============================================================================
// //    SERVER TYPES & HELPERS
// //    ==========================================================================*/
// // type SectionItem = { ref?: any; name?: string; on?: string };
// // type SectionBlock = { directItems: SectionItem[]; collections: { title: string; items: SectionItem[] }[] };
// // type ServerSections = Partial<Record<SectionKey, SectionBlock>>;

// // async function apiGetAll(token?: string) {
// //   const res = await fetch(`${base}/api/saved-collections`, {
// //     method: "GET",
// //     credentials: "include",
// //     headers: token ? { Authorization: `Bearer ${token}` } : undefined,
// //   });
// //   return res.json();
// // }

// // async function apiDeleteItem(section: SectionKey, refId: string, token?: string) {
// //   const res = await fetch(`${base}/api/saved-collections/${section}/${refId}`, {
// //     method: "DELETE",
// //     credentials: "include",
// //     headers: token
// //       ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
// //       : { "Content-Type": "application/json" },
// //   });
// //   return res.json();
// // }

// // async function apiPostSave(
// //   section: SectionKey,
// //   refId: string,
// //   token: string | undefined,
// //   opts: { collectionTitle?: string; name?: string }
// // ) {
// //   const res = await fetch(`${base}/api/saved-collections`, {
// //     method: "POST",
// //     credentials: "include",
// //     headers: {
// //       ...(token ? { Authorization: `Bearer ${token}` } : {}),
// //       "Content-Type": "application/json",
// //     },
// //     body: JSON.stringify({
// //       section,
// //       refId,
// //       collectionTitle: opts.collectionTitle?.trim() || undefined,
// //       name: opts.name?.trim() || undefined,
// //     }),
// //   });
// //   return res.json();
// // }

// // async function apiDeleteCollection(section: SectionKey, title: string, token?: string) {
// //   const res = await fetch(`${base}/api/saved-collections/collection`, {
// //     method: "DELETE",
// //     credentials: "include",
// //     headers: token
// //       ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
// //       : { "Content-Type": "application/json" },
// //     body: JSON.stringify({ section, title }),
// //   });
// //   return res.json();
// // }

// // async function apiRenameCollection(section: SectionKey, oldTitle: string, newTitle: string, token?: string) {
// //   const res = await fetch(`${base}/api/saved-collections/collection`, {
// //     method: "PUT",
// //     credentials: "include",
// //     headers: token
// //       ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
// //       : { "Content-Type": "application/json" },
// //     body: JSON.stringify({ section, oldTitle, newTitle }),
// //   });
// //   return res.json();
// // }

// // /* ============================================================================
// //    SMALL UTILS
// //    ==========================================================================*/
// // const getDocId = (ref: any) => (typeof ref === "string" ? ref : ref?._id || ref?.id || "");
// // const getItemTitle = (i: any) => (i?.name || i?.ref?.title || i?.ref?.name || "Untitled").toString();
// // const itemImage = (i: any, idx: number) => i?.ref?.imageUrl || i?.imageUrl || mockImages[idx % mockImages.length];
// // const folderCover = (collection: any, idx: number) => itemImage((collection?.items || [])[0], idx);

// // const pickTextFromRef = (section: SectionKey, refDoc: any): string => {
// //   if (!refDoc) return "";
// //   if (section === "smartgen") {
// //     return refDoc.detailedPrompt || refDoc.output || refDoc.result || refDoc.inputPrompt || refDoc.prompt || "";
// //   }
// //   if (section === "promptOptimizer") {
// //     return refDoc.optimizedText || refDoc.result || refDoc.output || refDoc.text || refDoc.prompt || "";
// //   }
// //   return refDoc.content || refDoc.text || refDoc.prompt || refDoc.title || "";
// // };

// // /* ============================================================================
// //    COMPONENT
// //    ==========================================================================*/
// // export default function SavedCollection() {
// //   const [tab, setTab] = useState<TabId>("smartgen");
// //   const section = SECTION_BY_TAB[tab];
// //   const { token } = useAuth() as any;

// //   const [sections, setSections] = useState<ServerSections>({});
// //   const [loading, setLoading] = useState(true);

// //   // folder + menu state
// //   const [menuForFolder, setMenuForFolder] = useState<string | null>(null);
// //   const [menuForDirect, setMenuForDirect] = useState<string | null>(null);

// //   const [viewingFolder, setViewingFolder] = useState<string | null>(null); // drives /folder-save
// //   const [editingFolder, setEditingFolder] = useState<string | null>(null);
// //   const [editFolderValue, setEditFolderValue] = useState("");

// //   // move-to-folder (All Saved edit)
// //   const [moveRefId, setMoveRefId] = useState<string | null>(null);
// //   const [moveFolderName, setMoveFolderName] = useState("");
// //   const [moveItemName, setMoveItemName] = useState("");

// //   const menuScopeRef = useRef<HTMLDivElement>(null);

// //   // Load server (or local fallback)
// //   const fetchAll = async () => {
// //     setLoading(true);
// //     try {
// //       if (!token) {
// //         const local = loadSaved();
// //         setSections({
// //           [section]: { directItems: local.map((x) => ({ ref: { prompt: x.prompt, title: x.title } })), collections: [] },
// //         });
// //       } else {
// //         const data = await apiGetAll(token);
// //         if (data?.success) setSections(data.sections || {});
// //         else toast({ title: "Load failed", description: "Could not fetch saved items." });
// //       }
// //     } catch (e: any) {
// //       toast({ title: "Error", description: e?.message || "Failed to fetch" });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchAll();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   // open if URL is already /folder-save
// //   useEffect(() => {
// //     const params = new URLSearchParams(location.search);
// //     const folder = params.get("folder");
// //     const tabFromUrl = params.get("tab") as TabId | null;
// //     const onFolderPage = location.pathname.endsWith("/folder-save");
// //     if (onFolderPage && folder) {
// //       if (tabFromUrl && TABS.find((t) => t.id === tabFromUrl)) setTab(tabFromUrl);
// //       setViewingFolder(folder);
// //     }
// //     const onPop = () => {
// //       const nowFolder = new URLSearchParams(location.search).get("folder");
// //       if (location.pathname.endsWith("/folder-save") && nowFolder) {
// //         setViewingFolder(nowFolder);
// //       } else {
// //         setViewingFolder(null);
// //       }
// //     };
// //     window.addEventListener("popstate", onPop);
// //     return () => window.removeEventListener("popstate", onPop);
// //   }, []);

// //   // close menus on outside click
// //   useEffect(() => {
// //     const onDown = (e: MouseEvent) => {
// //       if (menuScopeRef.current && !menuScopeRef.current.contains(e.target as Node)) {
// //         setMenuForFolder(null);
// //         setMenuForDirect(null);
// //       }
// //     };
// //     document.addEventListener("mousedown", onDown);
// //     return () => document.removeEventListener("mousedown", onDown);
// //   }, []);

// //   const activeSection = useMemo<SectionBlock>(() => {
// //     const s = (sections || {}) as any;
// //     return s[section] || { directItems: [], collections: [] };
// //   }, [sections, section]);

// //   const copyToClipboard = (text: string, label: string) => {
// //     navigator.clipboard.writeText(text || "");
// //     toast({ title: "Copied", description: `"${label}" has been copied.` });
// //   };

// //   /* ───────── Folder actions ───────── */
// //   const openFolder = (title: string) => {
// //     setViewingFolder(title);
// //     const qs = new URLSearchParams({ tab, folder: title });
// //     history.pushState({ folder: title, tab }, "", `/folder-save?${qs.toString()}`);
// //   };

// //   const leaveFolder = () => {
// //     setViewingFolder(null);
// //     history.pushState({}, "", `/saved-collection`);
// //   };

// //   const startRenameFolder = (title: string) => {
// //     setEditingFolder(title);
// //     setEditFolderValue(title);
// //     setMenuForFolder(null);
// //   };

// //   const confirmRenameFolder = async () => {
// //     const oldTitle = editingFolder!;
// //     const newTitle = editFolderValue.trim();
// //     if (!newTitle || newTitle === oldTitle) {
// //       setEditingFolder(null);
// //       return;
// //     }
// //     try {
// //       const resp = await apiRenameCollection(section, oldTitle, newTitle, token);
// //       if (resp?.success) {
// //         toast({ title: "Renamed", description: `Folder is now “${newTitle}”.` });
// //         if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
// //         else await fetchAll();
// //         setViewingFolder(newTitle);
// //       } else toast({ title: "Rename failed", description: resp?.error || "Unable to rename" });
// //     } catch (e: any) {
// //       toast({ title: "Error", description: e?.message || "Unable to rename" });
// //     } finally {
// //       setEditingFolder(null);
// //     }
// //   };

// //   const deleteFolder = async (title: string) => {
// //     try {
// //       const resp = await apiDeleteCollection(section, title, token);
// //       if (resp?.success) {
// //         toast({ title: "Deleted", description: `Folder “${title}” removed.` });
// //         if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
// //         else await fetchAll();
// //         setViewingFolder(null);
// //         history.pushState({}, "", `/saved-collection`);
// //       } else toast({ title: "Delete failed", description: resp?.error || "Unable to delete folder" });
// //     } catch (e: any) {
// //       toast({ title: "Error", description: e?.message || "Unable to delete folder" });
// //     }
// //   };

// //   /* ───────── All Saved actions ───────── */
// //   const openMoveForm = (refId: string, currentName: string) => {
// //     setMenuForDirect(refId);
// //     setMoveRefId(refId);
// //     setMoveFolderName("");
// //     setMoveItemName(currentName || "");
// //   };

// //   const performMoveToFolder = async () => {
// //     if (!moveRefId || !moveFolderName.trim()) return;
// //     try {
// //       await apiDeleteItem(section, moveRefId, token);
// //       const resp = await apiPostSave(section, moveRefId, token, {
// //         collectionTitle: moveFolderName.trim(),
// //         name: moveItemName.trim() || undefined,
// //       });
// //       if (resp?.success) {
// //         toast({ title: "Moved", description: `Item moved to “${moveFolderName.trim()}”.` });
// //         if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
// //         else await fetchAll();
// //       } else toast({ title: "Move failed", description: resp?.error || "Could not move item" });
// //     } catch (e: any) {
// //       toast({ title: "Error", description: e?.message || "Could not move item" });
// //     } finally {
// //       setMenuForDirect(null);
// //       setMoveRefId(null);
// //     }
// //   };

// //   const deleteSingleItem = async (refId: string) => {
// //     try {
// //       const resp = await apiDeleteItem(section, refId, token);
// //       if (resp?.success) {
// //         toast({ title: "Removed", description: "Item deleted from saved." });
// //         if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
// //         else await fetchAll();
// //       } else toast({ title: "Delete failed", description: resp?.error || "Unable to delete item" });
// //     } catch (e: any) {
// //       toast({ title: "Error", description: e?.message || "Unable to delete item" });
// //     }
// //   };

// //   /* ───────── Render helpers (Saved view) ───────── */
// //   const folders = activeSection.collections || [];
// //   const directItems = activeSection.directItems || [];

// //   const renderCardFooter = (text: string, title: string) => (
// //     <div className="flex items-center justify-start gap-2">
// //       <div className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "#333335" }}>
// //         <img src="/icons/cop1.png" className="w-4 h-4 object-contain" />
// //       </div>
// //       <button
// //         onClick={() => copyToClipboard(text, title)}
// //         className="h-9 px-3.5 rounded-full text-white text-[13px] font-medium inline-flex items-center justify-center gap-2 bg-[#333335] hover:bg-[linear-gradient(270deg,#1A73E8_0%,#FF14EF_100%)] transition-colors"
// //         title="Copy"
// //       >
// //         <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
// //           <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
// //           <rect x="4" y="4" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
// //         </svg>
// //         Copy
// //       </button>
// //     </div>
// //   );

// //   const renderTags = (prompt: SavedItem) => {
// //     const tags = Array.isArray((prompt as any).tags) ? (prompt as any).tags.filter(Boolean) : [];
// //     if (!tags.length) return null;
// //     return (
// //       <div className="mt-4 mb-4 flex flex-wrap gap-1.5">
// //         {tags.map((tag: string) => (
// //           <span key={tag} className="px-3 py-1 text-[12px] rounded-full border border-white/15 text-white/85 bg-white/[0.06]">
// //             {tag}
// //           </span>
// //         ))}
// //       </div>
// //     );
// //   };

// //   /* ───────── Folder page (kept as-is) ───────── */
// //   const renderFolderPage = () => {
// //     if (!viewingFolder) return null;
// //     const folder = folders.find((f) => f.title === viewingFolder);
// //     if (!folder) {
// //       setViewingFolder(null);
// //       history.replaceState({}, "", "/saved-collection");
// //       return null;
// //     }

// //     return (
// //       <div className="container mx-auto px-6">
// //         {/* Top bar */}
// //         <div className="flex items-center justify-between mb-6">
// //           <button className="inline-flex items-center gap-2 text-white/90 hover:text-white" onClick={leaveFolder}>
// //             <ArrowLeft className="w-5 h-5" />
// //             Back
// //           </button>

// //           {/* Rename inline when editing */}
// //           {editingFolder === viewingFolder ? (
// //             <div className="flex items-center gap-2">
// //               <input
// //                 value={editFolderValue}
// //                 onChange={(e) => setEditFolderValue(e.target.value)}
// //                 onKeyDown={(e) => {
// //                   if (e.key === "Enter") confirmRenameFolder();
// //                   if (e.key === "Escape") setEditingFolder(null);
// //                 }}
// //                 className="h-10 rounded-xl bg-[#252526] px-3 text-white outline-none"
// //                 placeholder="Collection name"
// //                 autoFocus
// //               />
// //               <Button className="h-10 rounded-full text-white" style={{ background: GRADIENT }} disabled={!editFolderValue.trim()} onClick={confirmRenameFolder}>
// //                 Save
// //               </Button>
// //               <Button className="h-10 rounded-full text-white" style={{ background: "#333335" }} variant="outline" onClick={() => setEditingFolder(null)}>
// //                 Cancel
// //               </Button>
// //             </div>
// //           ) : (
// //             <div className="relative">
// //               <button className="p-2 rounded-full hover:bg-white/10" onClick={() => setMenuForFolder(menuForFolder === viewingFolder ? null : viewingFolder)} aria-label="Folder menu">
// //                 <MoreHorizontal className="w-5 h-5 text-white/85" />
// //               </button>
// //               {menuForFolder === viewingFolder && (
// //                 <div className="absolute right-0 mt-2 rounded-[16px] p-2 shadow-lg border border-white/10 bg-[#333335]" ref={menuScopeRef}>
// //                   <button onClick={() => startRenameFolder(viewingFolder)} className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm">
// //                     <Pencil className="h-4 w-4" />
// //                     Rename folder
// //                   </button>
// //                   <button onClick={() => deleteFolder(viewingFolder)} className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm">
// //                     <Trash className="h-4 w-4" />
// //                     Delete folder
// //                   </button>
// //                 </div>
// //               )}
// //             </div>
// //           )}
// //         </div>

// //         {/* Folder header (banner) */}
// //         <div className="rounded-2xl border border-white/10 bg-[#121213] overflow-hidden">
// //           <div className="relative h-56 w-full">
// //             <img src={folderCover(folder, 0)} alt={viewingFolder || ""} className="w-full h-full object-cover" />
// //             <div className="absolute top-4 left-4 px-3 py-1 text-[11px] font-semibold text-white rounded-full" style={{ background: GRADIENT }}>
// //               {folder.items?.length || 0} {folder.items?.length === 1 ? "ITEM" : "ITEMS"}
// //             </div>
// //           </div>
// //           <div className="px-5 py-4 flex items-center gap-2">
// //             <FolderIcon className="w-5 h-5 text-white/70" />
// //             <h2 className="text-white text-xl font-semibold">{viewingFolder}</h2>
// //           </div>
// //         </div>

// //         {/* Items grid */}
// //         <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
// //           {(folder.items || []).map((it, idx) => {
// //             const refId = getDocId(it.ref);
// //             const title = getItemTitle(it);
// //             const text = pickTextFromRef(section, it.ref);
// //             const imageUrl = itemImage(it, idx);
// //             return (
// //               <Card
// //                 key={refId || `${title}_${idx}`}
// //                 className="overflow-hidden"
// //                 style={{
// //                   width: 306,
// //                   height: 500,
// //                   borderRadius: 30,
// //                   borderBottomWidth: 1,
// //                   borderLeftWidth: 1,
// //                   borderColor: "rgba(255,255,255,0.1)",
// //                   background: "#1C1C1C",
// //                   fontFamily: "Inter, sans-serif",
// //                 }}
// //               >
// //                 <CardContent className="relative p-4 h-full flex flex-col">
// //                   <div className="relative w-full overflow-hidden" style={{ width: 270, height: 220, borderRadius: 16, backgroundColor: "#0B0B0B", margin: "0 auto" }}>
// //                     <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-[16px]" />
// //                     <div className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full" style={{ background: GRADIENT }}>
// //                       {viewingFolder}
// //                     </div>
// //                     <div className="absolute top-3 right-3">
// //                       <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-white bg-black/50 border border-white/30 backdrop-blur-sm">
// //                         <Download className="h-3.5 w-3.5" />
// //                         {(it as any).uses ? (it as any).uses : 0} USES
// //                       </div>
// //                     </div>
// //                   </div>

// //                   <div className="mt-4">
// //                     <div className="flex items-center justify-between">
// //                       <h3 className="text-[18px] leading-snug font-semibold text-white">{title}</h3>
// //                     </div>
// //                     <p className="mt-2 text-[13px] leading-relaxed text-white/70">
// //                       {text.length > 140 ? `${text.slice(0, 140)}…` : text}
// //                     </p>
// //                   </div>

// //                   <div className="mt-auto">{renderCardFooter(text, title)}</div>
// //                 </CardContent>
// //               </Card>
// //             );
// //           })}
// //           {!folder.items?.length && <div className="text-center text-white/70 col-span-full py-12">No items inside this folder yet.</div>}
// //         </div>
// //       </div>
// //     );
// //   };

// //   /* ───────── All Saved (direct items) with Edit/Delete ───────── */
// //   const renderAllSaved = () => {
// //     if (!directItems.length) return null;
// //     return (
// //       <div className="container mx-auto px-0 sm:px-0 mt-16">
// //         <h2 className="text-white mb-6 px-1" style={{ fontFamily: "Inter", fontWeight: 600, fontSize: "22px", lineHeight: "100%" }}>
// //           All Saved
// //         </h2>

// //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
// //           {directItems.map((it, idx) => {
// //             const refId = getDocId(it.ref);
// //             const title = getItemTitle(it);
// //             const text = pickTextFromRef(section, it.ref);
// //             const imageUrl = itemImage(it, idx);
// //             const isMenu = menuForDirect === refId;

// //             return (
// //               <Card
// //                 key={refId || `${title}_${idx}`}
// //                 className="overflow-hidden"
// //                 style={{
// //                   width: 306,
// //                   height: 500,
// //                   borderRadius: 30,
// //                   borderBottomWidth: 1,
// //                   borderLeftWidth: 1,
// //                   borderColor: "rgba(255,255,255,0.1)",
// //                   background: "#1C1C1C",
// //                   fontFamily: "Inter, sans-serif",
// //                 }}
// //               >
// //                 <CardContent className="p-4 h-full flex flex-col" ref={isMenu ? menuScopeRef : undefined}>
// //                   <div className="relative w-full overflow-hidden" style={{ width: 270, height: 220, borderRadius: 16, backgroundColor: "#0B0B0B", margin: "0 auto" }}>
// //                     <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-[16px]" />
// //                     <div className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full" style={{ background: GRADIENT }}>
// //                       ALL SAVED
// //                     </div>
// //                   </div>

// //                   <div className="mt-3 flex items-center justify-between">
// //                     <h3 className="text-[16px] font-semibold text-white">{title}</h3>
// //                     <button
// //                       type="button"
// //                       onClick={() => (isMenu ? setMenuForDirect(null) : openMoveForm(refId, title))}
// //                       className="p-1 rounded-full hover:bg-white/10"
// //                       aria-label="More actions"
// //                     >
// //                       <MoreHorizontal className="h-5 w-5 text-white/85" />
// //                     </button>
// //                   </div>

// //                   <p className="mt-2 text-[13px] text-white/70">{text.length > 140 ? `${text.slice(0, 140)}…` : text}</p>

// //                   <div className="mt-auto">{renderCardFooter(text, title)}</div>

// //                   {/* 3-dot Move/Delete */}
// //                   {isMenu && (
// //                     <div className="mt-3 rounded-[16px] p-3 shadow-lg border border-white/10 bg-[#333335]">
// //                       {/* Move to folder */}
// //                       <div className="space-y-2">
// //                         <div className="text-white/80 text-sm font-medium">Move to folder</div>
// //                         <input
// //                           value={moveFolderName}
// //                           onChange={(e) => setMoveFolderName(e.target.value)}
// //                           placeholder="Folder name (collection)"
// //                           className="h-9 w-full rounded-xl bg-[#252526] px-3 text-white outline-none"
// //                         />
// //                         <input
// //                           value={moveItemName}
// //                           onChange={(e) => setMoveItemName(e.target.value)}
// //                           placeholder="Item title (optional)"
// //                           className="h-9 w-full rounded-xl bg-[#252526] px-3 text-white outline-none"
// //                         />
// //                         <div className="flex gap-2 pt-1">
// //                           <Button className="h-9 rounded-full text-white" style={{ background: GRADIENT }} disabled={!moveFolderName.trim()} onClick={performMoveToFolder}>
// //                             Move
// //                           </Button>
// //                           <Button
// //                             className="h-9 rounded-full text-white"
// //                             style={{ background: "#333335" }}
// //                             variant="outline"
// //                             onClick={() => {
// //                               setMenuForDirect(null);
// //                               setMoveRefId(null);
// //                             }}
// //                           >
// //                             Cancel
// //                           </Button>
// //                         </div>
// //                       </div>

// //                       <div className="h-px bg-white/10 my-3" />

// //                       <button onClick={() => deleteSingleItem(refId)} className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm">
// //                         <Trash className="h-4 w-4" />
// //                         Delete item
// //                       </button>
// //                     </div>
// //                   )}
// //                 </CardContent>
// //               </Card>
// //             );
// //           })}
// //         </div>
// //       </div>
// //     );
// //   };

// //   /* ───────── Collections grid (folder preview cards) ───────── */
// //   const renderFolderGrid = () => {
// //     if (loading) return <div className="text-center text-white/80 py-10">Loading your saved items…</div>;
// //     if (!folders.length)
// //       return (
// //         <div className="text-center py-16">
// //           <img src="/icons/void.png" alt="" className="mx-auto mb-6 h-40 w-auto opacity-90" />
// //           <p className="text-white text-xl">No folders yet</p>
// //           <p className="text-white/70 mt-2">Save with a Name/Title to create a folder here.</p>
// //         </div>
// //       );

// //     return (
// //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
// //         {folders.map((c, idx) => {
// //           const isMenu = menuForFolder === c.title;
// //           const cover = folderCover(c, idx);
// //           const count = (c.items || []).length;

// //           return (
// //             <Card
// //               key={c.title}
// //               className="overflow-hidden"
// //               style={{
// //                 width: 306,
// //                 borderRadius: 30,
// //                 borderBottomWidth: 1,
// //                 borderLeftWidth: 1,
// //                 borderColor: "rgba(255,255,255,0.1)",
// //                 background: "#1C1C1C",
// //               }}
// //             >
// //               <CardContent className="relative p-4" ref={isMenu ? menuScopeRef : undefined}>
// //                 <div
// //                   className="relative w-full overflow-hidden group cursor-pointer"
// //                   style={{ width: 270, height: 220, borderRadius: 16, backgroundColor: "#0B0B0B", margin: "0 auto" }}
// //                   onClick={() => openFolder(c.title)}
// //                   title={c.title}
// //                   aria-label={c.title}
// //                 >
// //                   <img src={cover} alt={c.title} className="w-full h-full object-cover rounded-[16px]" />
// //                   <div className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full" style={{ background: GRADIENT }}>
// //                     {count} {count === 1 ? "ITEM" : "ITEMS"}
// //                   </div>
// //                 </div>

// //                 <div className="mt-3 flex items-center justify-between">
// //                   <h3 className="text-[16px] font-semibold text-white">{c.title}</h3>
// //                   <button type="button" onClick={() => setMenuForFolder(isMenu ? null : c.title)} className="p-1 rounded-full hover:bg-white/10" aria-label="Folder menu">
// //                     <MoreHorizontal className="h-5 w-5 text-white/85" />
// //                   </button>
// //                 </div>

// //                 {isMenu && (
// //                   <div className="mt-3 rounded-[16px] p-2 shadow-lg border border-white/10 bg-[#333335]">
// //                     <button
// //                       onClick={() => {
// //                         setMenuForFolder(null);
// //                         startRenameFolder(c.title);
// //                       }}
// //                       className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm"
// //                     >
// //                       <Pencil className="h-4 w-4" />
// //                       Rename folder
// //                     </button>
// //                     <button onClick={() => deleteFolder(c.title)} className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm">
// //                       <Trash className="h-4 w-4" />
// //                       Delete folder
// //                     </button>
// //                   </div>
// //                 )}
// //               </CardContent>
// //             </Card>
// //           );
// //         })}
// //       </div>
// //     );
// //   };

// //   return (
// //     <div className="dark min-h-screen bg-background text-foreground">
// //       <div className="container mx-auto px-6 py-8">
// //         <Header />
// //       </div>

// //       <div className="container mx-auto px-6 -mt-8">
// //         <div className="flex flex-col items-center text-center mb-8">
// //           <h1 style={{ fontFamily: "Inter", fontWeight: 400, fontSize: "32px", lineHeight: "100%" }} className="text-white">
// //             Saved Items
// //           </h1>
// //         </div>
// //       </div>

// //       <div className="container mx-auto px-6 pb-16">
// //         {/* Top row: ONLY center tabs (history toggle removed) */}
// //         <div className="mx-auto mb-3 grid grid-cols-[1fr_auto_1fr] items-center max-w-6xl">
// //           <div className="col-start-2 col-end-3 justify-self-center">
// //             <div className="flex w-fit items-center gap-2 rounded-full bg-white/5 px-2 py-2">
// //               {TABS.map((t) => {
// //                 const active = t.id === tab;
// //                 return (
// //                   <button
// //                     key={t.id}
// //                     onClick={() => {
// //                       setTab(t.id);
// //                       setMenuForFolder(null);
// //                       setMenuForDirect(null);
// //                       if (viewingFolder) {
// //                         const qs = new URLSearchParams({ tab: t.id, folder: viewingFolder });
// //                         history.replaceState(
// //                           { folder: viewingFolder, tab: t.id },
// //                           "",
// //                           `/folder-save?${qs.toString()}`
// //                         );
// //                       }
// //                     }}
// //                     className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
// //                       active
// //                         ? "bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
// //                         : "bg-transparent hover:bg-white/10"
// //                     }`}
// //                   >
// //                     <img src={t.icon} alt="" className="h-4 w-4" />
// //                     {t.label}
// //                   </button>
// //                 );
// //               })}
// //             </div>
// //           </div>
// //         </div>

// //         {/* CONTENT: saved view only */}
// //         <>
// //           {!viewingFolder ? renderFolderGrid() : renderFolderPage()}
// //           {!viewingFolder && renderAllSaved()}
// //         </>
// //       </div>

// //       <div className="mt-20">
// //         <Footer />
// //       </div>
// //     </div>
// //   );
// // }



// // // src/pages/SavedCollection.tsx
// // import { useEffect, useMemo, useRef, useState } from "react";
// // import Header from "@/components/Header";
// // import Footer from "@/components/Footer";
// // import { Card, CardContent } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { toast } from "@/components/ui/use-toast";

// // import {
// //   Download,
// //   MoreHorizontal,
// //   Pencil,
// //   Trash,
// //   ArrowLeft,
// //   Folder as FolderIcon,
// // } from "lucide-react";
// // import { useAuth } from "@/contexts/AuthContext";
// // import { loadSaved, type SavedItem } from "@/lib/savedCollections";

// // /* ============================================================================
// //    CONSTANTS
// //    ==========================================================================*/
// // const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
// // const base = API_BASE.replace(/\/+$/, "");
// // const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

// // const TABS = [
// //   { id: "smartgen", label: "Smartgen", icon: "/icons/smartgen.svg" },
// //   { id: "prompt-optimization", label: "Prompt Optimiser", icon: "/icons/prompt-optimization.svg" },
// //   { id: "prompt-marketplace", label: "Prompt Marketplace", icon: "/icons/prompt-marketplace.png" },
// //   { id: "prompt-library", label: "Prompt Library", icon: "/icons/prompt-library.png" },
// // ] as const;

// // type TabId = (typeof TABS)[number]["id"];
// // type SectionKey = "smartgen" | "prompt" | "promptOptimizer";
// // const SECTION_BY_TAB: Record<TabId, SectionKey> = {
// //   smartgen: "smartgen",
// //   "prompt-optimization": "promptOptimizer",
// //   "prompt-marketplace": "prompt",
// //   "prompt-library": "prompt",
// // };

// // const mockImages = ["/icons/pl1.png", "/icons/pl2.png", "/icons/pl3.png", "/icons/pl4.png"];

// // /* ============================================================================
// //    SERVER TYPES & HELPERS
// //    ==========================================================================*/
// // type SectionItem = { ref?: any; name?: string; on?: string };
// // type SectionBlock = { directItems: SectionItem[]; collections: { title: string; items: SectionItem[] }[] };
// // type ServerSections = Partial<Record<SectionKey, SectionBlock>>;

// // async function apiGetAll(token?: string) {
// //   const res = await fetch(`${base}/api/saved-collections`, {
// //     method: "GET",
// //     credentials: "include",
// //     headers: token ? { Authorization: `Bearer ${token}` } : undefined,
// //   });
// //   return res.json();
// // }

// // async function apiDeleteItem(section: SectionKey, refId: string, token?: string) {
// //   const res = await fetch(`${base}/api/saved-collections/${section}/${refId}`, {
// //     method: "DELETE",
// //     credentials: "include",
// //     headers: token
// //       ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
// //       : { "Content-Type": "application/json" },
// //   });
// //   return res.json();
// // }

// // async function apiPostSave(
// //   section: SectionKey,
// //   refId: string,
// //   token: string | undefined,
// //   opts: { collectionTitle?: string; name?: string }
// // ) {
// //   const res = await fetch(`${base}/api/saved-collections`, {
// //     method: "POST",
// //     credentials: "include",
// //     headers: {
// //       ...(token ? { Authorization: `Bearer ${token}` } : {}),
// //       "Content-Type": "application/json",
// //     },
// //     body: JSON.stringify({
// //       section,
// //       refId,
// //       collectionTitle: opts.collectionTitle?.trim() || undefined,
// //       name: opts.name?.trim() || undefined,
// //     }),
// //   });
// //   return res.json();
// // }

// // async function apiDeleteCollection(section: SectionKey, title: string, token?: string) {
// //   const res = await fetch(`${base}/api/saved-collections/collection`, {
// //     method: "DELETE",
// //     credentials: "include",
// //     headers: token
// //       ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
// //       : { "Content-Type": "application/json" },
// //     body: JSON.stringify({ section, title }),
// //   });
// //   return res.json();
// // }

// // async function apiRenameCollection(section: SectionKey, oldTitle: string, newTitle: string, token?: string) {
// //   const res = await fetch(`${base}/api/saved-collections/collection`, {
// //     method: "PUT",
// //     credentials: "include",
// //     headers: token
// //       ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
// //       : { "Content-Type": "application/json" },
// //     body: JSON.stringify({ section, oldTitle, newTitle }),
// //   });
// //   return res.json();
// // }

// // /* ============================================================================
// //    SMALL UTILS
// //    ==========================================================================*/
// // const getDocId = (ref: any) => (typeof ref === "string" ? ref : ref?._id || ref?.id || "");
// // const getItemTitle = (i: any) => (i?.name || i?.ref?.title || i?.ref?.name || "Untitled").toString();
// // const itemImage = (i: any, idx: number) => i?.ref?.imageUrl || i?.imageUrl || mockImages[idx % mockImages.length];

// // const pickTextFromRef = (section: SectionKey, refDoc: any): string => {
// //   if (!refDoc) return "";
// //   if (section === "smartgen") {
// //     return refDoc.detailedPrompt || refDoc.output || refDoc.result || refDoc.inputPrompt || refDoc.prompt || "";
// //   }
// //   if (section === "promptOptimizer") {
// //     return refDoc.optimizedText || refDoc.result || refDoc.output || refDoc.text || refDoc.prompt || "";
// //   }
// //   return refDoc.content || refDoc.text || refDoc.prompt || refDoc.title || "";
// // };

// // /* ============================================================================
// //    COMPONENT
// //    ==========================================================================*/
// // export default function SavedCollection() {
// //   const [tab, setTab] = useState<TabId>("smartgen");
// //   const section = SECTION_BY_TAB[tab];
// //   const { token } = useAuth() as any;

// //   const [sections, setSections] = useState<ServerSections>({});
// //   const [loading, setLoading] = useState(true);

// //   // Folder + menu state
// //   const [menuForFolder, setMenuForFolder] = useState<string | null>(null);
// //   const [menuForDirect, setMenuForDirect] = useState<string | null>(null);

// //   const [viewingFolder, setViewingFolder] = useState<string | null>(null);
// //   const [editingFolder, setEditingFolder] = useState<string | null>(null);
// //   const [editFolderValue, setEditFolderValue] = useState("");

// //   // Move-to-folder (All Saved edit)
// //   const [moveRefId, setMoveRefId] = useState<string | null>(null);
// //   const [moveFolderName, setMoveFolderName] = useState("");
// //   const [moveItemName, setMoveItemName] = useState("");

// //   // NEW: per-card menu + inline rename in folder grid
// //   const [menuForFolderItem, setMenuForFolderItem] = useState<string | null>(null);
// //   const [editItemTitle, setEditItemTitle] = useState("");

// //   const menuScopeRef = useRef<HTMLDivElement>(null);

// //   // Load server (or local fallback)
// //   const fetchAll = async () => {
// //     setLoading(true);
// //     try {
// //       if (!token) {
// //         const local = loadSaved();
// //         setSections({
// //           [section]: { directItems: local.map((x) => ({ ref: { prompt: x.prompt, title: x.title } })), collections: [] },
// //         });
// //       } else {
// //         const data = await apiGetAll(token);
// //         if (data?.success) setSections(data.sections || {});
// //         else toast({ title: "Load failed", description: "Could not fetch saved items." });
// //       }
// //     } catch (e: any) {
// //       toast({ title: "Error", description: e?.message || "Failed to fetch" });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchAll();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   // Open if URL is already /folder-save
// //   useEffect(() => {
// //     const params = new URLSearchParams(location.search);
// //     const folder = params.get("folder");
// //     const tabFromUrl = params.get("tab") as TabId | null;
// //     const onFolderPage = location.pathname.endsWith("/folder-save");
// //     if (onFolderPage && folder) {
// //       if (tabFromUrl && TABS.find((t) => t.id === tabFromUrl)) setTab(tabFromUrl);
// //       setViewingFolder(folder);
// //     }
// //     const onPop = () => {
// //       const nowFolder = new URLSearchParams(location.search).get("folder");
// //       if (location.pathname.endsWith("/folder-save") && nowFolder) {
// //         setViewingFolder(nowFolder);
// //       } else {
// //         setViewingFolder(null);
// //       }
// //     };
// //     window.addEventListener("popstate", onPop);
// //     return () => window.removeEventListener("popstate", onPop);
// //   }, []);

// //   // Close menus on outside click
// //   useEffect(() => {
// //     const onDown = (e: MouseEvent) => {
// //       if (menuScopeRef.current && !menuScopeRef.current.contains(e.target as Node)) {
// //         setMenuForFolder(null);
// //         setMenuForDirect(null);
// //         setMenuForFolderItem(null);
// //       }
// //     };
// //     document.addEventListener("mousedown", onDown);
// //     return () => document.removeEventListener("mousedown", onDown);
// //   }, []);

// //   const activeSection = useMemo<SectionBlock>(() => {
// //     const s = (sections || {}) as any;
// //     return s[section] || { directItems: [], collections: [] };
// //   }, [sections, section]);

// //   const copyToClipboard = (text: string, label: string) => {
// //     navigator.clipboard.writeText(text || "");
// //     toast({ title: "Copied", description: `"${label}" has been copied.` });
// //   };

// //   /* ───────── Folder actions ───────── */
// //   const openFolder = (title: string) => {
// //     setViewingFolder(title);
// //     const qs = new URLSearchParams({ tab, folder: title });
// //     history.pushState({ folder: title, tab }, "", `/folder-save?${qs.toString()}`);
// //   };

// //   const leaveFolder = () => {
// //     setViewingFolder(null);
// //     history.pushState({}, "", `/saved-collection`);
// //   };

// //   const startRenameFolder = (title: string) => {
// //     setEditingFolder(title);
// //     setEditFolderValue(title);
// //     setMenuForFolder(null);
// //   };

// //   const confirmRenameFolder = async () => {
// //     const oldTitle = editingFolder!;
// //     const newTitle = editFolderValue.trim();
// //     if (!newTitle || newTitle === oldTitle) {
// //       setEditingFolder(null);
// //       return;
// //     }
// //     try {
// //       const resp = await apiRenameCollection(section, oldTitle, newTitle, token);
// //       if (resp?.success) {
// //         toast({ title: "Renamed", description: `Folder is now “${newTitle}”.` });
// //         if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
// //         else await fetchAll();
// //         setViewingFolder(newTitle);
// //       } else toast({ title: "Rename failed", description: resp?.error || "Unable to rename" });
// //     } catch (e: any) {
// //       toast({ title: "Error", description: e?.message || "Unable to rename" });
// //     } finally {
// //       setEditingFolder(null);
// //     }
// //   };

// //   const deleteFolder = async (title: string) => {
// //     try {
// //       const resp = await apiDeleteCollection(section, title, token);
// //       if (resp?.success) {
// //         toast({ title: "Deleted", description: `Folder “${title}” removed.` });
// //         if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
// //         else await fetchAll();
// //         setViewingFolder(null);
// //         history.pushState({}, "", `/saved-collection`);
// //       } else toast({ title: "Delete failed", description: resp?.error || "Unable to delete folder" });
// //     } catch (e: any) {
// //       toast({ title: "Error", description: e?.message || "Unable to delete folder" });
// //     }
// //   };

// //   // NEW: rename an item inside a folder (delete + recreate with same folder & new name)
// //   const renameItemInFolder = async (folderTitle: string, refId: string, newTitle: string) => {
// //     if (!newTitle.trim()) return;
// //     try {
// //       await apiDeleteItem(section, refId, token);
// //       const resp = await apiPostSave(section, refId, token, {
// //         collectionTitle: folderTitle,
// //         name: newTitle.trim(),
// //       });
// //       if (resp?.success) {
// //         toast({ title: "Renamed", description: `Item renamed to “${newTitle.trim()}”.` });
// //         if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
// //         else await fetchAll();
// //       } else {
// //         toast({ title: "Rename failed", description: resp?.error || "Could not rename item" });
// //       }
// //     } catch (e: any) {
// //       toast({ title: "Error", description: e?.message || "Could not rename item" });
// //     } finally {
// //       setMenuForFolderItem(null);
// //     }
// //   };

// //   /* ───────── All Saved actions ───────── */
// //   const openMoveForm = (refId: string, currentName: string) => {
// //     setMenuForDirect(refId);
// //     setMoveRefId(refId);
// //     setMoveFolderName("");
// //     setMoveItemName(currentName || "");
// //   };

// //   const performMoveToFolder = async () => {
// //     if (!moveRefId || !moveFolderName.trim()) return;
// //     try {
// //       await apiDeleteItem(section, moveRefId, token);
// //       const resp = await apiPostSave(section, moveRefId, token, {
// //         collectionTitle: moveFolderName.trim(),
// //         name: moveItemName.trim() || undefined,
// //       });
// //       if (resp?.success) {
// //         toast({ title: "Moved", description: `Item moved to “${moveFolderName.trim()}”.` });
// //         if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
// //         else await fetchAll();
// //       } else toast({ title: "Move failed", description: resp?.error || "Could not move item" });
// //     } catch (e: any) {
// //       toast({ title: "Error", description: e?.message || "Could not move item" });
// //     } finally {
// //       setMenuForDirect(null);
// //       setMoveRefId(null);
// //     }
// //   };

// //   const deleteSingleItem = async (refId: string) => {
// //     try {
// //       const resp = await apiDeleteItem(section, refId, token);
// //       if (resp?.success) {
// //         toast({ title: "Removed", description: "Item deleted from saved." });
// //         if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
// //         else await fetchAll();
// //       } else toast({ title: "Delete failed", description: resp?.error || "Unable to delete item" });
// //     } catch (e: any) {
// //       toast({ title: "Error", description: e?.message || "Unable to delete item" });
// //     }
// //   };

// //   /* ───────── Render helpers ───────── */
// //   const folders = activeSection.collections || [];
// //   const directItems = activeSection.directItems || [];

// //   const renderCardFooter = (text: string, title: string) => (
// //     <div className="flex items-center justify-start gap-2">
// //       <div className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "#333335" }}>
// //         <img src="/icons/cop1.png" className="w-4 h-4 object-contain" />
// //       </div>
// //       <button
// //         onClick={() => copyToClipboard(text, title)}
// //         className="h-9 px-3.5 rounded-full text-white text-[13px] font-medium inline-flex items-center justify-center gap-2 bg-[#333335] hover:bg-[linear-gradient(270deg,#1A73E8_0%,#FF14EF_100%)] transition-colors"
// //         title="Copy"
// //       >
// //         <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
// //           <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
// //           <rect x="4" y="4" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
// //         </svg>
// //         Copy
// //       </button>
// //     </div>
// //   );

// //   const renderTags = (prompt: SavedItem) => {
// //     const tags = Array.isArray((prompt as any).tags) ? (prompt as any).tags.filter(Boolean) : [];
// //     if (!tags.length) return null;
// //     return (
// //       <div className="mt-4 mb-4 flex flex-wrap gap-1.5">
// //         {tags.map((tag: string) => (
// //           <span key={tag} className="px-3 py-1 text-[12px] rounded-full border border-white/15 text-white/85 bg-white/[0.06]">
// //             {tag}
// //           </span>
// //         ))}
// //       </div>
// //     );
// //   };

// //   /* ───────── Folder page (NO banner, card menus for edit/delete) ───────── */
// //   const renderFolderPage = () => {
// //     if (!viewingFolder) return null;
// //     const folder = folders.find((f) => f.title === viewingFolder);
// //     if (!folder) {
// //       setViewingFolder(null);
// //       history.replaceState({}, "", "/saved-collection");
// //       return null;
// //     }

// //     return (
// //       <div className="container mx-auto px-6">
// //         {/* Top bar */}
// //         <div className="flex items-center justify-between mb-6">
// //           <button className="inline-flex items-center gap-2 text-white/90 hover:text-white" onClick={leaveFolder}>
// //             <ArrowLeft className="w-5 h-5" />
// //             Back
// //           </button>

// //           {/* Rename inline when editing */}
// //           {editingFolder === viewingFolder ? (
// //             <div className="flex items-center gap-2">
// //               <input
// //                 value={editFolderValue}
// //                 onChange={(e) => setEditFolderValue(e.target.value)}
// //                 onKeyDown={(e) => {
// //                   if (e.key === "Enter") confirmRenameFolder();
// //                   if (e.key === "Escape") setEditingFolder(null);
// //                 }}
// //                 className="h-10 rounded-xl bg-[#252526] px-3 text-white outline-none"
// //                 placeholder="Collection name"
// //                 autoFocus
// //               />
// //               <Button
// //                 className="h-10 rounded-full text-white"
// //                 style={{ background: GRADIENT }}
// //                 disabled={!editFolderValue.trim()}
// //                 onClick={confirmRenameFolder}
// //               >
// //                 Save
// //               </Button>
// //               <Button
// //                 className="h-10 rounded-full text-white"
// //                 style={{ background: "#333335" }}
// //                 variant="outline"
// //                 onClick={() => setEditingFolder(null)}
// //               >
// //                 Cancel
// //               </Button>
// //             </div>
// //           ) : (
// //             <div className="relative">
// //               <button
// //                 className="p-2 rounded-full hover:bg-white/10"
// //                 onClick={() => setMenuForFolder(menuForFolder === viewingFolder ? null : viewingFolder)}
// //                 aria-label="Folder menu"
// //               >
// //                 <MoreHorizontal className="w-5 h-5 text-white/85" />
// //               </button>
// //               {menuForFolder === viewingFolder && (
// //                 <div className="absolute right-0 mt-2 rounded-[16px] p-2 shadow-lg border border-white/10 bg-[#333335]" ref={menuScopeRef}>
// //                   <button
// //                     onClick={() => {
// //                       setMenuForFolder(null);
// //                       startRenameFolder(viewingFolder);
// //                     }}
// //                     className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm"
// //                   >
// //                     <Pencil className="h-4 w-4" />
// //                     Rename folder
// //                   </button>
// //                   <button
// //                     onClick={() => deleteFolder(viewingFolder)}
// //                     className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm"
// //                   >
// //                     <Trash className="h-4 w-4" />
// //                     Delete folder
// //                   </button>
// //                 </div>
// //               )}
// //             </div>
// //           )}
// //         </div>

// //         {/* 🚫 Banner removed — go straight to the grid */}

// //         {/* Items grid — cards have per-item 3-dots with Edit title + Delete */}
// //         <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
// //           {(folder.items || []).map((it, idx) => {
// //             const refId = getDocId(it.ref);
// //             const title = getItemTitle(it);
// //             const text = pickTextFromRef(section, it.ref);
// //             const imageUrl = itemImage(it, idx);
// //             const isMenu = menuForFolderItem === refId;

// //             return (
// //               <Card
// //                 key={refId || `${title}_${idx}`}
// //                 className="overflow-hidden"
// //                 style={{
// //                   width: 306,
// //                   height: 500,
// //                   borderRadius: 30,
// //                   borderBottomWidth: 1,
// //                   borderLeftWidth: 1,
// //                   borderColor: "rgba(255,255,255,0.1)",
// //                   background: "#1C1C1C",
// //                   fontFamily: "Inter, sans-serif",
// //                 }}
// //               >
// //                 <CardContent className="relative p-4 h-full flex flex-col" ref={isMenu ? menuScopeRef : undefined}>
// //                   <div
// //                     className="relative w-full overflow-hidden"
// //                     style={{ width: 270, height: 220, borderRadius: 16, backgroundColor: "#0B0B0B", margin: "0 auto" }}
// //                   >
// //                     <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-[16px]" />
// //                     <div className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full" style={{ background: GRADIENT }}>
// //                       {viewingFolder}
// //                     </div>
// //                     <div className="absolute top-3 right-3">
// //                       <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-white bg-black/50 border border-white/30 backdrop-blur-sm">
// //                         <Download className="h-3.5 w-3.5" />
// //                         {(it as any).uses ? (it as any).uses : 0} USES
// //                       </div>
// //                     </div>
// //                   </div>

// //                   <div className="mt-4">
// //                     <div className="flex items-center justify-between">
// //                       <h3 className="text-[18px] leading-snug font-semibold text-white">{title}</h3>

// //                       {/* 3-dots — item menu (edit title / delete) */}
// //                       <button
// //                         type="button"
// //                         onClick={() => {
// //                           if (isMenu) {
// //                             setMenuForFolderItem(null);
// //                           } else {
// //                             setMenuForFolderItem(refId);
// //                             setEditItemTitle(title);
// //                           }
// //                         }}
// //                         className="p-1 rounded-full hover:bg-white/10"
// //                         aria-label="More actions"
// //                       >
// //                         <MoreHorizontal className="h-5 w-5 text-white/85" />
// //                       </button>
// //                     </div>

// //                     <p className="mt-2 text-[13px] leading-relaxed text-white/70">
// //                       {text.length > 140 ? `${text.slice(0, 140)}…` : text}
// //                     </p>
// //                   </div>

// //                   <div className="mt-auto">{renderCardFooter(text, title)}</div>

// //                   {/* Per-item dropdown: Edit title + Delete */}
// //                   {isMenu && (
// //                     <div className="mt-3 rounded-[16px] p-3 shadow-lg border border-white/10 bg-[#333335]">
// //                       <div className="space-y-2">
// //                         <div className="text-white/80 text-sm font-medium">Edit title</div>
// //                         <input
// //                           value={editItemTitle}
// //                           onChange={(e) => setEditItemTitle(e.target.value)}
// //                           placeholder="Item title"
// //                           className="h-9 w-full rounded-xl bg-[#252526] px-3 text-white outline-none"
// //                         />
// //                         <div className="flex gap-2 pt-1">
// //                           <Button
// //                             className="h-9 rounded-full text-white"
// //                             style={{ background: GRADIENT }}
// //                             disabled={!editItemTitle.trim()}
// //                             onClick={() => renameItemInFolder(viewingFolder, refId, editItemTitle)}
// //                           >
// //                             Save
// //                           </Button>
// //                           <Button
// //                             className="h-9 rounded-full text-white"
// //                             style={{ background: "#333335" }}
// //                             variant="outline"
// //                             onClick={() => setMenuForFolderItem(null)}
// //                           >
// //                             Cancel
// //                           </Button>
// //                         </div>
// //                       </div>

// //                       <div className="h-px bg-white/10 my-3" />

// //                       <button
// //                         onClick={() => {
// //                           setMenuForFolderItem(null);
// //                           deleteSingleItem(refId);
// //                         }}
// //                         className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm"
// //                       >
// //                         <Trash className="h-4 w-4" />
// //                         Delete item
// //                       </button>
// //                     </div>
// //                   )}
// //                 </CardContent>
// //               </Card>
// //             );
// //           })}
// //           {!folder.items?.length && (
// //             <div className="text-center text-white/70 col-span-full py-12">No items inside this folder yet.</div>
// //           )}
// //         </div>
// //       </div>
// //     );
// //   };

// //   /* ───────── All Saved (direct items) with Edit/Delete/Move ───────── */
// //   const renderAllSaved = () => {
// //     if (!directItems.length) return null;
// //     return (
// //       <div className="container mx-auto px-0 sm:px-0 mt-16">
// //         <h2
// //           className="text-white mb-6 px-1"
// //           style={{ fontFamily: "Inter", fontWeight: 600, fontSize: "22px", lineHeight: "100%" }}
// //         >
// //           All Saved
// //         </h2>

// //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
// //           {directItems.map((it, idx) => {
// //             const refId = getDocId(it.ref);
// //             const title = getItemTitle(it);
// //             const text = pickTextFromRef(section, it.ref);
// //             const imageUrl = itemImage(it, idx);
// //             const isMenu = menuForDirect === refId;

// //             return (
// //               <Card
// //                 key={refId || `${title}_${idx}`}
// //                 className="overflow-hidden"
// //                 style={{
// //                   width: 306,
// //                   height: 500,
// //                   borderRadius: 30,
// //                   borderBottomWidth: 1,
// //                   borderLeftWidth: 1,
// //                   borderColor: "rgba(255,255,255,0.1)",
// //                   background: "#1C1C1C",
// //                   fontFamily: "Inter, sans-serif",
// //                 }}
// //               >
// //                 <CardContent className="p-4 h-full flex flex-col" ref={isMenu ? menuScopeRef : undefined}>
// //                   <div
// //                     className="relative w-full overflow-hidden"
// //                     style={{ width: 270, height: 220, borderRadius: 16, backgroundColor: "#0B0B0B", margin: "0 auto" }}
// //                   >
// //                     <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-[16px]" />
// //                     <div className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full" style={{ background: GRADIENT }}>
// //                       ALL SAVED
// //                     </div>
// //                   </div>

// //                   <div className="mt-3 flex items-center justify-between">
// //                     <h3 className="text-[16px] font-semibold text-white">{title}</h3>
// //                     <button
// //                       type="button"
// //                       onClick={() => (isMenu ? setMenuForDirect(null) : openMoveForm(refId, title))}
// //                       className="p-1 rounded-full hover:bg-white/10"
// //                       aria-label="More actions"
// //                     >
// //                       <MoreHorizontal className="h-5 w-5 text-white/85" />
// //                     </button>
// //                   </div>

// //                   <p className="mt-2 text-[13px] text-white/70">
// //                     {text.length > 140 ? `${text.slice(0, 140)}…` : text}
// //                   </p>

// //                   <div className="mt-auto">{renderCardFooter(text, title)}</div>

// //                   {/* 3-dot menu: Move + Delete */}
// //                   {isMenu && (
// //                     <div className="mt-3 rounded-[16px] p-3 shadow-lg border border-white/10 bg-[#333335]">
// //                       {/* Move to folder */}
// //                       <div className="space-y-2">
// //                         <div className="text-white/80 text-sm font-medium">Move to folder</div>
// //                         <input
// //                           value={moveFolderName}
// //                           onChange={(e) => setMoveFolderName(e.target.value)}
// //                           placeholder="Folder name (collection)"
// //                           className="h-9 w-full rounded-xl bg-[#252526] px-3 text-white outline-none"
// //                         />
// //                         <input
// //                           value={moveItemName}
// //                           onChange={(e) => setMoveItemName(e.target.value)}
// //                           placeholder="Item title (optional)"
// //                           className="h-9 w-full rounded-xl bg-[#252526] px-3 text-white outline-none"
// //                         />
// //                         <div className="flex gap-2 pt-1">
// //                           <Button
// //                             className="h-9 rounded-full text-white"
// //                             style={{ background: GRADIENT }}
// //                             disabled={!moveFolderName.trim()}
// //                             onClick={performMoveToFolder}
// //                           >
// //                             Move
// //                           </Button>
// //                           <Button
// //                             className="h-9 rounded-full text-white"
// //                             style={{ background: "#333335" }}
// //                             variant="outline"
// //                             onClick={() => {
// //                               setMenuForDirect(null);
// //                               setMoveRefId(null);
// //                             }}
// //                           >
// //                             Cancel
// //                           </Button>
// //                         </div>
// //                       </div>

// //                       <div className="h-px bg-white/10 my-3" />

// //                       <button
// //                         onClick={() => deleteSingleItem(refId)}
// //                         className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm"
// //                       >
// //                         <Trash className="h-4 w-4" />
// //                         Delete item
// //                       </button>
// //                     </div>
// //                   )}
// //                 </CardContent>
// //               </Card>
// //             );
// //           })}
// //         </div>
// //       </div>
// //     );
// //   };

// //   /* ───────── Collections grid (folder preview cards) ───────── */
// //   const renderFolderGrid = () => {
// //     if (loading) return <div className="text-center text-white/80 py-10">Loading your saved items…</div>;
// //     if (!folders.length)
// //       return (
// //         <div className="text-center py-16">
// //           <img src="/icons/void.png" alt="" className="mx-auto mb-6 h-40 w-auto opacity-90" />
// //           <p className="text-white text-xl">No folders yet</p>
// //           <p className="text-white/70 mt-2">Save with a Name/Title to create a folder here.</p>
// //         </div>
// //       );

// //     return (
// //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
// //         {folders.map((c, idx) => {
// //           const isMenu = menuForFolder === c.title;
// //           const cover = itemImage((c.items || [])[0], idx);
// //           const count = (c.items || []).length;

// //           return (
// //             <Card
// //               key={c.title}
// //               className="overflow-hidden"
// //               style={{
// //                 width: 306,
// //                 borderRadius: 30,
// //                 borderBottomWidth: 1,
// //                 borderLeftWidth: 1,
// //                 borderColor: "rgba(255,255,255,0.1)",
// //                 background: "#1C1C1C",
// //               }}
// //             >
// //               <CardContent className="relative p-4" ref={isMenu ? menuScopeRef : undefined}>
// //                 <div
// //                   className="relative w-full overflow-hidden group cursor-pointer"
// //                   style={{ width: 270, height: 220, borderRadius: 16, backgroundColor: "#0B0B0B", margin: "0 auto" }}
// //                   onClick={() => openFolder(c.title)}
// //                   title={c.title}
// //                   aria-label={c.title}
// //                 >
// //                   <img src={cover} alt={c.title} className="w-full h-full object-cover rounded-[16px]" />
// //                   <div className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full" style={{ background: GRADIENT }}>
// //                     {count} {count === 1 ? "ITEM" : "ITEMS"}
// //                   </div>
// //                 </div>

// //                 <div className="mt-3 flex items-center justify-between">
// //                   <h3 className="text-[16px] font-semibold text-white">{c.title}</h3>
// //                   <button
// //                     type="button"
// //                     onClick={() => setMenuForFolder(isMenu ? null : c.title)}
// //                     className="p-1 rounded-full hover:bg-white/10"
// //                     aria-label="Folder menu"
// //                   >
// //                     <MoreHorizontal className="h-5 w-5 text-white/85" />
// //                   </button>
// //                 </div>

// //                 {isMenu && (
// //                   <div className="mt-3 rounded-[16px] p-2 shadow-lg border border-white/10 bg-[#333335]">
// //                     <button
// //                       onClick={() => {
// //                         setMenuForFolder(null);
// //                         startRenameFolder(c.title);
// //                       }}
// //                       className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm"
// //                     >
// //                       <Pencil className="h-4 w-4" />
// //                       Rename folder
// //                     </button>
// //                     <button
// //                       onClick={() => deleteFolder(c.title)}
// //                       className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm"
// //                     >
// //                       <Trash className="h-4 w-4" />
// //                       Delete folder
// //                     </button>
// //                   </div>
// //                 )}
// //               </CardContent>
// //             </Card>
// //           );
// //         })}
// //       </div>
// //     );
// //   };

// //   return (
// //     <div className="dark min-h-screen bg-background text-foreground">
// //       <div className="container mx-auto px-6 py-8">
// //         <Header />
// //       </div>

// //       <div className="container mx-auto px-6 -mt-8">
// //         <div className="flex flex-col items-center text-center mb-8">
// //           <h1
// //             style={{ fontFamily: "Inter", fontWeight: 400, fontSize: "32px", lineHeight: "100%" }}
// //             className="text-white"
// //           >
// //             Saved Items
// //           </h1>
// //         </div>
// //       </div>

// //       <div className="container mx-auto px-6 pb-16">
// //         {/* Centered tabs (only Saved tabs, no history toggle) */}
// //         <div className="mx-auto mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 max-w-6xl">
// //           <div className="col-start-2 col-end-3 justify-self-center">
// //             <div className="flex w-fit items-center gap-2 rounded-full bg-white/5 px-2 py-2">
// //               {TABS.map((t) => {
// //                 const active = t.id === tab;
// //                 return (
// //                   <button
// //                     key={t.id}
// //                     onClick={() => {
// //                       setTab(t.id);
// //                       setMenuForFolder(null);
// //                       setMenuForDirect(null);
// //                       if (viewingFolder) {
// //                         const qs = new URLSearchParams({ tab: t.id, folder: viewingFolder });
// //                         history.replaceState({ folder: viewingFolder, tab: t.id }, "", `/folder-save?${qs.toString()}`);
// //                       }
// //                     }}
// //                     className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
// //                       active
// //                         ? "bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
// //                         : "bg-transparent hover:bg-white/10"
// //                     }`}
// //                   >
// //                     <img src={t.icon} alt="" className="h-4 w-4" />
// //                     {t.label}
// //                   </button>
// //                 );
// //               })}
// //             </div>
// //           </div>
// //         </div>

// //         {/* CONTENT (Saved only) */}
// //         <>
// //           {!viewingFolder ? renderFolderGrid() : renderFolderPage()}
// //           {!viewingFolder && renderAllSaved()}
// //         </>
// //       </div>

// //       <div className="mt-20">
// //         <Footer />
// //       </div>
// //     </div>
// //   );
// // }


// // src/pages/SavedCollection.tsx
// import { useEffect, useMemo, useRef, useState } from "react";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { toast } from "@/components/ui/use-toast";

// import {
//   Download,
//   MoreHorizontal,
//   Pencil,
//   Trash,
// } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import { loadSaved, type SavedItem } from "@/lib/savedCollections";

// /* ============================================================================
//    CONSTANTS
//    ==========================================================================*/
// const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
// const base = API_BASE.replace(/\/+$/, "");
// const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

// const TABS = [
//   { id: "smartgen", label: "Smartgen", icon: "/icons/smartgen.svg" },
//   { id: "prompt-optimization", label: "Prompt Optimiser", icon: "/icons/prompt-optimization.svg" },
//   { id: "prompt-marketplace", label: "Prompt Marketplace", icon: "/icons/prompt-marketplace.png" },
//   { id: "prompt-library", label: "Prompt Library", icon: "/icons/prompt-library.png" },
// ] as const;

// type TabId = (typeof TABS)[number]["id"];
// type SectionKey = "smartgen" | "prompt" | "promptOptimizer";
// const SECTION_BY_TAB: Record<TabId, SectionKey> = {
//   smartgen: "smartgen",
//   "prompt-optimization": "promptOptimizer",
//   "prompt-marketplace": "prompt",
//   "prompt-library": "prompt",
// };

// const mockImages = ["/icons/pl1.png", "/icons/pl2.png", "/icons/pl3.png", "/icons/pl4.png"];

// /* ============================================================================
//    SERVER TYPES & HELPERS
//    ==========================================================================*/
// type SectionItem = { ref?: any; name?: string; on?: string };
// type SectionBlock = { directItems: SectionItem[]; collections: { title: string; items: SectionItem[] }[] };
// type ServerSections = Partial<Record<SectionKey, SectionBlock>>;

// async function apiGetAll(token?: string) {
//   const res = await fetch(`${base}/api/saved-collections`, {
//     method: "GET",
//     credentials: "include",
//     headers: token ? { Authorization: `Bearer ${token}` } : undefined,
//   });
//   return res.json();
// }

// async function apiDeleteItem(section: SectionKey, refId: string, token?: string) {
//   const res = await fetch(`${base}/api/saved-collections/${section}/${refId}`, {
//     method: "DELETE",
//     credentials: "include",
//     headers: token
//       ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
//       : { "Content-Type": "application/json" },
//   });
//   return res.json();
// }

// async function apiPostSave(
//   section: SectionKey,
//   refId: string,
//   token: string | undefined,
//   opts: { collectionTitle?: string; name?: string }
// ) {
//   const res = await fetch(`${base}/api/saved-collections`, {
//     method: "POST",
//     credentials: "include",
//     headers: {
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       section,
//       refId,
//       collectionTitle: opts.collectionTitle?.trim() || undefined,
//       name: opts.name?.trim() || undefined,
//     }),
//   });
//   return res.json();
// }

// async function apiDeleteCollection(section: SectionKey, title: string, token?: string) {
//   const res = await fetch(`${base}/api/saved-collections/collection`, {
//     method: "DELETE",
//     credentials: "include",
//     headers: token
//       ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
//       : { "Content-Type": "application/json" },
//     body: JSON.stringify({ section, title }),
//   });
//   return res.json();
// }

// async function apiRenameCollection(section: SectionKey, oldTitle: string, newTitle: string, token?: string) {
//   const res = await fetch(`${base}/api/saved-collections/collection`, {
//     method: "PUT",
//     credentials: "include",
//     headers: token
//       ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
//       : { "Content-Type": "application/json" },
//     body: JSON.stringify({ section, oldTitle, newTitle }),
//   });
//   return res.json();
// }

// /* ============================================================================
//    SMALL UTILS
//    ==========================================================================*/
// const getDocId = (ref: any) => (typeof ref === "string" ? ref : ref?._id || ref?.id || "");
// // const getItemTitle = (i: any) => (i?.name || i?.ref?.title || i?.ref?.name || "Untitled").toString();
// const getItemTitle = (i: any) =>
//   (i?.ref?.title || i?.name || i?.ref?.name || "Untitled").toString();
// const itemImage = (i: any, idx: number) => i?.ref?.imageUrl || i?.imageUrl || mockImages[idx % mockImages.length];

// // const pickTextFromRef = (section: SectionKey, refDoc: any): string => {
// //   if (!refDoc) return "";
// //   if (section === "smartgen") {
// //     return refDoc.detailedPrompt || refDoc.output || refDoc.result || refDoc.inputPrompt || refDoc.prompt || "";
// //   }
// //   if (section === "promptOptimizer") {
// //     return refDoc.optimizedText || refDoc.result || refDoc.output || refDoc.text || refDoc.prompt || "";
// //   }
// //   return refDoc.content || refDoc.text || refDoc.prompt || refDoc.title || "";
// // };

// const pickTextFromRef = (section: SectionKey, refDoc: any): string => {
//   if (!refDoc) return "";
//   if (section === "smartgen") {
//     return refDoc.detailedPrompt || refDoc.output || refDoc.result || refDoc.inputPrompt || refDoc.prompt || "";
//   }
//   if (section === "promptOptimizer") {
//     return refDoc.optimizedText || refDoc.result || refDoc.output || refDoc.text || refDoc.prompt || "";
//   }
//   // prompt section (Prompt model):
//   return (
//     refDoc.description || refDoc.preview || refDoc.promptText || refDoc.content || refDoc.text || refDoc.prompt || ""
//   );
// };




// /* ============================================================================
//    COMPONENT
//    ==========================================================================*/
// export default function SavedCollection() {
//   const [tab, setTab] = useState<TabId>("smartgen");
//   const section = SECTION_BY_TAB[tab];
//   const { token } = useAuth() as any;

//   const [sections, setSections] = useState<ServerSections>({});
//   const [loading, setLoading] = useState(true);

//   // Menus
//   const [menuForDirect, setMenuForDirect] = useState<string | null>(null);      // prompt menu in "All Saved"
//   const [menuForFolderItem, setMenuForFolderItem] = useState<string | null>(null); // prompt menu inside folder
//   const [menuForFolder, setMenuForFolder] = useState<string | null>(null);      // folder card menu on grid

//   // Folder page state (no top controls)
//   const [viewingFolder, setViewingFolder] = useState<string | null>(null);

//   // Inline folder rename state (from grid menu)
//   const [editingFolder, setEditingFolder] = useState<string | null>(null);
//   const [editFolderValue, setEditFolderValue] = useState("");

//   // Move-to-folder (All Saved prompt)
//   const [moveRefId, setMoveRefId] = useState<string | null>(null);
//   const [moveFolderName, setMoveFolderName] = useState("");
//   const [moveItemName, setMoveItemName] = useState("");

//   // Inline rename for prompt inside folder
//   const [editItemTitle, setEditItemTitle] = useState("");

//   const menuScopeRef = useRef<HTMLDivElement>(null);

//   // Load server (or local fallback)
//   const fetchAll = async () => {
//     setLoading(true);
//     try {
//       if (!token) {
//         const local = loadSaved();
//         setSections({
//           [section]: { directItems: local.map((x) => ({ ref: { prompt: x.prompt, title: x.title } })), collections: [] },
//         });
//       } else {
//         const data = await apiGetAll(token);
//         if (data?.success) setSections(data.sections || {});
//         else toast({ title: "Load failed", description: "Could not fetch saved items." });
//       }
//     } catch (e: any) {
//       toast({ title: "Error", description: e?.message || "Failed to fetch" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAll();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Open via URL /folder-save?tab=...&folder=...
//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const folder = params.get("folder");
//     const tabFromUrl = params.get("tab") as TabId | null;
//     const onFolderPage = location.pathname.endsWith("/folder-save");
//     if (onFolderPage && folder) {
//       if (tabFromUrl && TABS.find((t) => t.id === tabFromUrl)) setTab(tabFromUrl);
//       setViewingFolder(folder);
//     }
//     const onPop = () => {
//       const nowFolder = new URLSearchParams(location.search).get("folder");
//       if (location.pathname.endsWith("/folder-save") && nowFolder) {
//         setViewingFolder(nowFolder);
//       } else {
//         setViewingFolder(null);
//       }
//     };
//     window.addEventListener("popstate", onPop);
//     return () => window.removeEventListener("popstate", onPop);
//   }, []);

//   // Close menus on outside click
//   useEffect(() => {
//     const onDown = (e: MouseEvent) => {
//       if (menuScopeRef.current && !menuScopeRef.current.contains(e.target as Node)) {
//         setMenuForFolder(null);
//         setMenuForDirect(null);
//         setMenuForFolderItem(null);
//       }
//     };
//     document.addEventListener("mousedown", onDown);
//     return () => document.removeEventListener("mousedown", onDown);
//   }, []);

//   const activeSection = useMemo<SectionBlock>(() => {
//     const s = (sections || {}) as any;
//     return s[section] || { directItems: [], collections: [] };
//   }, [sections, section]);

//   const copyToClipboard = (text: string, label: string) => {
//     navigator.clipboard.writeText(text || "");
//     toast({ title: "Copied", description: `"${label}" has been copied.` });
//   };

//   /* ───────── Folder & item actions ───────── */
//   const openFolder = (title: string) => {
//     setViewingFolder(title);
//     const qs = new URLSearchParams({ tab, folder: title });
//     history.pushState({ folder: title, tab }, "", `/folder-save?${qs.toString()}`);
//   };

//   const leaveFolder = () => {
//     setViewingFolder(null);
//     history.pushState({}, "", `/saved-collection`);
//   };

//   const startRenameFolder = (title: string) => {
//     setEditingFolder(title);
//     setEditFolderValue(title);
//     setMenuForFolder(null);
//   };

//   const confirmRenameFolder = async () => {
//     const oldTitle = editingFolder!;
//     const newTitle = editFolderValue.trim();
//     if (!newTitle || newTitle === oldTitle) {
//       setEditingFolder(null);
//       return;
//     }
//     try {
//       const resp = await apiRenameCollection(section, oldTitle, newTitle, token);
//       if (resp?.success) {
//         toast({ title: "Renamed", description: `Folder is now “${newTitle}”.` });
//         if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
//         else await fetchAll();
//         setViewingFolder((v) => (v === oldTitle ? newTitle : v));
//       } else toast({ title: "Rename failed", description: resp?.error || "Unable to rename" });
//     } catch (e: any) {
//       toast({ title: "Error", description: e?.message || "Unable to rename" });
//     } finally {
//       setEditingFolder(null);
//     }
//   };

//   const deleteFolder = async (title: string) => {
//     try {
//       const resp = await apiDeleteCollection(section, title, token);
//       if (resp?.success) {
//         toast({ title: "Deleted", description: `Folder “${title}” removed.` });
//         if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
//         else await fetchAll();
//         if (viewingFolder === title) {
//           setViewingFolder(null);
//           history.pushState({}, "", `/saved-collection`);
//         }
//       } else toast({ title: "Delete failed", description: resp?.error || "Unable to delete folder" });
//     } catch (e: any) {
//       toast({ title: "Error", description: e?.message || "Unable to delete folder" });
//     }
//   };

//   const renameItemInFolder = async (folderTitle: string, refId: string, newTitle: string) => {
//     if (!newTitle.trim()) return;
//     try {
//       await apiDeleteItem(section, refId, token);
//       const resp = await apiPostSave(section, refId, token, {
//         collectionTitle: folderTitle,
//         name: newTitle.trim(),
//       });
//       if (resp?.success) {
//         toast({ title: "Renamed", description: `Item renamed to “${newTitle.trim()}”.` });
//         if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
//         else await fetchAll();
//       } else {
//         toast({ title: "Rename failed", description: resp?.error || "Could not rename item" });
//       }
//     } catch (e: any) {
//       toast({ title: "Error", description: e?.message || "Could not rename item" });
//     } finally {
//       setMenuForFolderItem(null);
//     }
//   };

//   /* ───────── All Saved actions ───────── */
//   const openMoveForm = (refId: string, currentName: string) => {
//     setMenuForDirect(refId);
//     setMoveRefId(refId);
//     setMoveFolderName("");
//     setMoveItemName(currentName || "");
//   };

//   const performMoveToFolder = async () => {
//     if (!moveRefId || !moveFolderName.trim()) return;
//     try {
//       await apiDeleteItem(section, moveRefId, token);
//       const resp = await apiPostSave(section, moveRefId, token, {
//         collectionTitle: moveFolderName.trim(),
//         name: moveItemName.trim() || undefined,
//       });
//       if (resp?.success) {
//         toast({ title: "Moved", description: `Item moved to “${moveFolderName.trim()}”.` });
//         if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
//         else await fetchAll();
//       } else toast({ title: "Move failed", description: resp?.error || "Could not move item" });
//     } catch (e: any) {
//       toast({ title: "Error", description: e?.message || "Could not move item" });
//     } finally {
//       setMenuForDirect(null);
//       setMoveRefId(null);
//     }
//   };

//   const deleteSingleItem = async (refId: string) => {
//     try {
//       const resp = await apiDeleteItem(section, refId, token);
//       if (resp?.success) {
//         toast({ title: "Removed", description: "Item deleted from saved." });
//         if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
//         else await fetchAll();
//       } else toast({ title: "Delete failed", description: resp?.error || "Unable to delete item" });
//     } catch (e: any) {
//       toast({ title: "Error", description: e?.message || "Unable to delete item" });
//     }
//   };

//   /* ───────── Render helpers ───────── */
//   const folders = activeSection.collections || [];
//   const directItems = activeSection.directItems || [];

//   const renderCardFooter = (text: string, title: string) => (
//     <div className="flex items-center justify-start gap-2">
//       <div className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "#333335" }}>
//         <img src="/icons/cop1.png" className="w-4 h-4 object-contain" />
//       </div>
//       <button
//         onClick={() => copyToClipboard(text, title)}
//         className="h-9 px-3.5 rounded-full text-white text-[13px] font-medium inline-flex items-center justify-center gap-2 bg-[#333335] hover:bg-[linear-gradient(270deg,#1A73E8_0%,#FF14EF_100%)] transition-colors"
//         title="Copy"
//       >
//         <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//           <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
//           <rect x="4" y="4" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
//         </svg>
//         Copy
//       </button>
//     </div>
//   );

//   /* ───────── Folder page (NO header/back, NO folder 3-dots; ONLY prompt menus) ───────── */
//   const renderFolderPage = () => {
//     if (!viewingFolder) return null;
//     const folder = folders.find((f) => f.title === viewingFolder);
//     if (!folder) {
//       setViewingFolder(null);
//       history.replaceState({}, "", "/saved-collection");
//       return null;
//     }

//     return (
//       <div className="container mx-auto px-6">
//         {/* No top bar/back or folder menu — only the grid */}
//         <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//           {(folder.items || []).map((it, idx) => {
//             const refId = getDocId(it.ref);
//             const title = getItemTitle(it);
//             const text = pickTextFromRef(section, it.ref);
//             const imageUrl = itemImage(it, idx);
//             const isMenu = menuForFolderItem === refId;

//             return (
//               <Card
//                 key={refId || `${title}_${idx}`}
//                 className="overflow-hidden"
//                 style={{
//                   width: 306,
//                   height: 500,
//                   borderRadius: 30,
//                   borderBottomWidth: 1,
//                   borderLeftWidth: 1,
//                   borderColor: "rgba(255,255,255,0.1)",
//                   background: "#1C1C1C",
//                   fontFamily: "Inter, sans-serif",
//                 }}
//               >
//                 <CardContent className="relative p-4 h-full flex flex-col" ref={isMenu ? menuScopeRef : undefined}>
//                   <div
//                     className="relative w-full overflow-hidden"
//                     style={{ width: 270, height: 220, borderRadius: 16, backgroundColor: "#0B0B0B", margin: "0 auto" }}
//                   >
//                     <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-[16px]" />
//                     <div className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full" style={{ background: GRADIENT }}>
//                       {viewingFolder}
//                     </div>
//                     <div className="absolute top-3 right-3">
//                       <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-white bg-black/50 border border-white/30 backdrop-blur-sm">
//                         <Download className="h-3.5 w-3.5" />
//                         {(it as any).uses ? (it as any).uses : 0} USES
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-4">
//                     <div className="flex items-center justify-between">
//                       <h3 className="text-[18px] leading-snug font-semibold text-white">{title}</h3>

//                       {/* Three-dots on prompt cards */}
//                       <button
//                         type="button"
//                         onClick={() => {
//                           if (isMenu) {
//                             setMenuForFolderItem(null);
//                           } else {
//                             setMenuForFolderItem(refId);
//                             setEditItemTitle(title);
//                           }
//                         }}
//                         className="p-1 rounded-full hover:bg-white/10"
//                         aria-label="More actions"
//                       >
//                         <MoreHorizontal className="h-5 w-5 text-white/85" />
//                       </button>
//                     </div>

//                     <p className="mt-2 text-[13px] leading-relaxed text-white/70">
//                       {text.length > 140 ? `${text.slice(0, 140)}…` : text}
//                     </p>
//                   </div>

//                   <div className="mt-auto">{renderCardFooter(text, title)}</div>

//                   {/* Per-item dropdown: Edit title + Delete */}
//                   {isMenu && (
//                     <div className="mt-3 rounded-[16px] p-3 shadow-lg border border-white/10 bg-[#333335]">
//                       <div className="space-y-2">
//                         <div className="text-white/80 text-sm font-medium">Edit title</div>
//                         <input
//                           value={editItemTitle}
//                           onChange={(e) => setEditItemTitle(e.target.value)}
//                           placeholder="Item title"
//                           className="h-9 w-full rounded-xl bg-[#252526] px-3 text-white outline-none"
//                         />
//                         <div className="flex gap-2 pt-1">
//                           <Button
//                             className="h-9 rounded-full text-white"
//                             style={{ background: GRADIENT }}
//                             disabled={!editItemTitle.trim()}
//                             onClick={() => renameItemInFolder(viewingFolder, refId, editItemTitle)}
//                           >
//                             Save
//                           </Button>
//                           <Button
//                             className="h-9 rounded-full text-white"
//                             style={{ background: "#333335" }}
//                             variant="outline"
//                             onClick={() => setMenuForFolderItem(null)}
//                           >
//                             Cancel
//                           </Button>
//                         </div>
//                       </div>

//                       <div className="h-px bg-white/10 my-3" />

//                       <button
//                         onClick={() => {
//                           setMenuForFolderItem(null);
//                           deleteSingleItem(refId);
//                         }}
//                         className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm"
//                       >
//                         <Trash className="h-4 w-4" />
//                         Delete item
//                       </button>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             );
//           })}
//           {!folder.items?.length && (
//             <div className="text-center text-white/70 col-span-full py-12">No items inside this folder yet.</div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   /* ───────── All Saved (direct items) with Edit/Delete/Move ───────── */
//   const renderAllSaved = () => {
//     if (!directItems.length) return null;
//     return (
//       <div className="container mx-auto px-0 sm:px-0 mt-16">
//         <h2
//           className="text-white mb-6 px-1"
//           style={{ fontFamily: "Inter", fontWeight: 600, fontSize: "22px", lineHeight: "100%" }}
//         >
//           All Saved
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//           {directItems.map((it, idx) => {
//             const refId = getDocId(it.ref);
//             const title = getItemTitle(it);
//             const text = pickTextFromRef(section, it.ref);
//             const imageUrl = itemImage(it, idx);
//             const isMenu = menuForDirect === refId;

//             return (
//               <Card
//                 key={refId || `${title}_${idx}`}
//                 className="overflow-hidden"
//                 style={{
//                   width: 306,
//                   height: 500,
//                   borderRadius: 30,
//                   borderBottomWidth: 1,
//                   borderLeftWidth: 1,
//                   borderColor: "rgba(255,255,255,0.1)",
//                   background: "#1C1C1C",
//                   fontFamily: "Inter, sans-serif",
//                 }}
//               >
//                 <CardContent className="p-4 h-full flex flex-col" ref={isMenu ? menuScopeRef : undefined}>
//                   <div
//                     className="relative w-full overflow-hidden"
//                     style={{ width: 270, height: 220, borderRadius: 16, backgroundColor: "#0B0B0B", margin: "0 auto" }}
//                   >
//                     <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-[16px]" />
//                   </div>

//                   <div className="mt-3 flex items-center justify-between">
//                     <h3 className="text-[16px] font-semibold text-white">{title}</h3>

//                     {/* Three-dots on All Saved prompt cards */}
//                     <button
//                       type="button"
//                       onClick={() => (isMenu ? setMenuForDirect(null) : openMoveForm(refId, title))}
//                       className="p-1 rounded-full hover:bg-white/10"
//                       aria-label="More actions"
//                     >
//                       <MoreHorizontal className="h-5 w-5 text-white/85" />
//                     </button>
//                   </div>

//                   <p className="mt-2 text-[13px] text-white/70">
//                     {text.length > 140 ? `${text.slice(0, 140)}…` : text}
//                   </p>

//                   <div className="mt-auto">{renderCardFooter(text, title)}</div>

//                   {/* 3-dot menu: Move + Delete */}
//                   {isMenu && (
//                     <div className="mt-3 rounded-[16px] p-3 shadow-lg border border-white/10 bg-[#333335]">
//                       {/* Move to folder */}
//                       <div className="space-y-2">
//                         <div className="text-white/80 text-sm font-medium">Move to folder</div>
//                         <input
//                           value={moveFolderName}
//                           onChange={(e) => setMoveFolderName(e.target.value)}
//                           placeholder="Folder name (collection)"
//                           className="h-9 w-full rounded-xl bg-[#252526] px-3 text-white outline-none"
//                         />
//                         <input
//                           value={moveItemName}
//                           onChange={(e) => setMoveItemName(e.target.value)}
//                           placeholder="Item title (optional)"
//                           className="h-9 w-full rounded-xl bg-[#252526] px-3 text-white outline-none"
//                         />
//                         <div className="flex gap-2 pt-1">
//                           <Button
//                             className="h-9 rounded-full text-white"
//                             style={{ background: GRADIENT }}
//                             disabled={!moveFolderName.trim()}
//                             onClick={performMoveToFolder}
//                           >
//                             Move
//                           </Button>
//                           <Button
//                             className="h-9 rounded-full text-white"
//                             style={{ background: "#333335" }}
//                             variant="outline"
//                             onClick={() => {
//                               setMenuForDirect(null);
//                               setMoveRefId(null);
//                             }}
//                           >
//                             Cancel
//                           </Button>
//                         </div>
//                       </div>

//                       <div className="h-px bg-white/10 my-3" />

//                       <button
//                         onClick={() => deleteSingleItem(refId)}
//                         className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm"
//                       >
//                         <Trash className="h-4 w-4" />
//                         Delete item
//                       </button>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       </div>
//     );
//   };

//   /* ───────── Collections grid (folder preview cards) WITH 3-dot menu ───────── */
//   const renderFolderGrid = () => {
//     if (loading) return <div className="text-center text-white/80 py-10">Loading your saved items…</div>;
//     if (!folders.length)
//       return (
//         <div className="text-center py-16">
//           <img src="/icons/void.png" alt="" className="mx-auto mb-6 h-40 w-auto opacity-90" />
//           <p className="text-white text-xl">No folders yet</p>
//           <p className="text-white/70 mt-2">Save with a Name/Title to create a folder here.</p>
//         </div>
//       );

//     return (
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//         {folders.map((c, idx) => {
//           const isMenu = menuForFolder === c.title;
//           const cover = itemImage((c.items || [])[0], idx);
//           const count = (c.items || []).length;

//           return (
//             <Card
//               key={c.title}
//               className="overflow-hidden"
//               style={{
//                 width: 306,
//                 borderRadius: 30,
//                 borderBottomWidth: 1,
//                 borderLeftWidth: 1,
//                 borderColor: "rgba(255,255,255,0.1)",
//                 background: "#1C1C1C",
//               }}
//             >
//               <CardContent className="relative p-4" ref={isMenu ? menuScopeRef : undefined}>
//                 <div
//                   className="relative w-full overflow-hidden group cursor-pointer"
//                   style={{ width: 270, height: 220, borderRadius: 16, backgroundColor: "#0B0B0B", margin: "0 auto" }}
//                   onClick={() => openFolder(c.title)}
//                   title={c.title}
//                   aria-label={c.title}
//                 >
//                   <img src={cover} alt={c.title} className="w-full h-full object-cover rounded-[16px]" />
//                   <div className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full" style={{ background: GRADIENT }}>
//                     {count} {count === 1 ? "ITEM" : "ITEMS"}
//                   </div>
//                 </div>

//                 <div className="mt-3 flex items-center justify-between">
//                   <h3 className="text-[16px] font-semibold text-white">{c.title}</h3>

//                   {/* Keep 3-dots on folder grid */}
//                   <button
//                     type="button"
//                     onClick={() => setMenuForFolder(isMenu ? null : c.title)}
//                     className="p-1 rounded-full hover:bg-white/10"
//                     aria-label="Folder menu"
//                   >
//                     <MoreHorizontal className="h-5 w-5 text-white/85" />
//                   </button>
//                 </div>

//                 {isMenu && (
//                   <div className="mt-3 rounded-[16px] p-2 shadow-lg border border-white/10 bg-[#333335]">
//                     <button
//                       onClick={() => {
//                         setMenuForFolder(null);
//                         startRenameFolder(c.title);
//                       }}
//                       className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm"
//                     >
//                       <Pencil className="h-4 w-4" />
//                       Rename folder
//                     </button>
//                     <button
//                       onClick={() => deleteFolder(c.title)}
//                       className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm"
//                     >
//                       <Trash className="h-4 w-4" />
//                       Delete folder
//                     </button>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>
//     );
//   };

//   return (
//     <div className="dark min-h-screen bg-background text-foreground">
//       <div className="container mx-auto px-6 py-8">
//         <Header />
//       </div>

//       <div className="container mx-auto px-6 -mt-8">
//         <div className="flex flex-col items-center text-center mb-8">
//           <h1
//             style={{ fontFamily: "Inter", fontWeight: 400, fontSize: "32px", lineHeight: "100%" }}
//             className="text-white"
//           >
//             Saved Items
//           </h1>
//         </div>
//       </div>

//       <div className="container mx-auto px-6 pb-16">
//         {/* Centered tabs */}
//         <div className="mx-auto mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 max-w-6xl">
//           <div className="col-start-2 col-end-3 justify-self-center">
//             <div className="flex w-fit items-center gap-2 rounded-full bg-white/5 px-2 py-2">
//               {TABS.map((t) => {
//                 const active = t.id === tab;
//                 return (
//                   <button
//                     key={t.id}
//                     onClick={() => {
//                       setTab(t.id);
//                       setMenuForFolder(null);
//                       setMenuForDirect(null);
//                       if (viewingFolder) {
//                         const qs = new URLSearchParams({ tab: t.id, folder: viewingFolder });
//                         history.replaceState({ folder: viewingFolder, tab: t.id }, "", `/folder-save?${qs.toString()}`);
//                       }
//                     }}
//                     className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
//                       active
//                         ? "bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
//                         : "bg-transparent hover:bg-white/10"
//                     }`}
//                   >
//                     <img src={t.icon} alt="" className="h-4 w-4" />
//                     {t.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         </div>

//         {/* CONTENT */}
//         <>
//           {!viewingFolder ? renderFolderGrid() : renderFolderPage()}
//           {!viewingFolder && renderAllSaved()}
//         </>
//       </div>

//       {/* Inline folder rename bar (appears when renaming from grid menu) */}
//       {editingFolder && (
//         <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C1C] border border-white/10 rounded-2xl p-3 shadow-xl w-[min(90vw,520px)]">
//           <div className="flex items-center gap-2">
//             <input
//               value={editFolderValue}
//               onChange={(e) => setEditFolderValue(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") confirmRenameFolder();
//                 if (e.key === "Escape") setEditingFolder(null);
//               }}
//               className="h-10 flex-1 rounded-xl bg-[#252526] px-3 text-white outline-none"
//               placeholder="Collection name"
//               autoFocus
//             />
//             <Button
//               className="h-10 rounded-full text-white"
//               style={{ background: GRADIENT }}
//               disabled={!editFolderValue.trim()}
//               onClick={confirmRenameFolder}
//             >
//               Save
//             </Button>
//             <Button
//               className="h-10 rounded-full text-white"
//               style={{ background: "#333335" }}
//               variant="outline"
//               onClick={() => setEditingFolder(null)}
//             >
//               Cancel
//             </Button>
//           </div>
//         </div>
//       )}

//       <div className="mt-20">
//         <Footer />
//       </div>
//     </div>
//   );
// }




// src/pages/SavedCollection.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

import {
  Download,
  MoreHorizontal,
  Pencil,
  Trash,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { loadSaved, type SavedItem } from "@/lib/savedCollections";

/* ============================================================================
   CONSTANTS
   ==========================================================================*/
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const base = API_BASE.replace(/\/+$/, "");
const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

const TABS = [
  { id: "smartgen", label: "Smartgen", icon: "/icons/smartgen.svg" },
  { id: "prompt-optimization", label: "Prompt Optimiser", icon: "/icons/prompt-optimization.svg" },
  { id: "prompt-marketplace", label: "Prompt Marketplace", icon: "/icons/prompt-marketplace.png" },
  { id: "prompt-library", label: "Prompt Library", icon: "/icons/prompt-library.png" },
] as const;

type TabId = (typeof TABS)[number]["id"];
type SectionKey = "smartgen" | "prompt" | "promptOptimizer";
const SECTION_BY_TAB: Record<TabId, SectionKey> = {
  smartgen: "smartgen",
  "prompt-optimization": "promptOptimizer",
  "prompt-marketplace": "prompt",
  "prompt-library": "prompt",
};

const mockImages = ["/icons/pl1.png", "/icons/pl2.png", "/icons/pl3.png", "/icons/pl4.png"];

/* ============================================================================
   SERVER TYPES & HELPERS
   ==========================================================================*/
type SectionItem = { ref?: any; name?: string; on?: string };
type SectionBlock = { directItems: SectionItem[]; collections: { title: string; items: SectionItem[] }[] };
type ServerSections = Partial<Record<SectionKey, SectionBlock>>;

async function apiGetAll(token?: string) {
  const res = await fetch(`${base}/api/saved-collections`, {
    method: "GET",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.json();
}

async function apiDeleteItem(section: SectionKey, refId: string, token?: string) {
  const res = await fetch(`${base}/api/saved-collections/${section}/${refId}`, {
    method: "DELETE",
    credentials: "include",
    headers: token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" },
  });
  return res.json();
}

async function apiPostSave(
  section: SectionKey,
  refId: string,
  token: string | undefined,
  opts: { collectionTitle?: string; name?: string }
) {
  const res = await fetch(`${base}/api/saved-collections`, {
    method: "POST",
    credentials: "include",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      section,
      refId,
      collectionTitle: opts.collectionTitle?.trim() || undefined,
      name: opts.name?.trim() || undefined,
    }),
  });
  return res.json();
}

async function apiDeleteCollection(section: SectionKey, title: string, token?: string) {
  const res = await fetch(`${base}/api/saved-collections/collection`, {
    method: "DELETE",
    credentials: "include",
    headers: token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" },
    body: JSON.stringify({ section, title }),
  });
  return res.json();
}

async function apiRenameCollection(section: SectionKey, oldTitle: string, newTitle: string, token?: string) {
  const res = await fetch(`${base}/api/saved-collections/collection`, {
    method: "PUT",
    credentials: "include",
    headers: token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" },
    body: JSON.stringify({ section, oldTitle, newTitle }),
  });
  return res.json();
}

/* ============================================================================
   SMALL UTILS
   ==========================================================================*/
const getDocId = (ref: any) => (typeof ref === "string" ? ref : ref?._id || ref?.id || "");
const getItemTitle = (i: any) =>
  (i?.ref?.title || i?.name || i?.ref?.name || "Untitled").toString();

const itemImage = (i: any, idx: number) => i?.ref?.imageUrl || i?.imageUrl || mockImages[idx % mockImages.length];

const pickTextFromRef = (section: SectionKey, refDoc: any): string => {
  if (!refDoc) return "";
  if (section === "smartgen") {
    return refDoc.detailedPrompt || refDoc.output || refDoc.result || refDoc.inputPrompt || refDoc.prompt || "";
  }
  if (section === "promptOptimizer") {
    return refDoc.optimizedText || refDoc.result || refDoc.output || refDoc.text || refDoc.prompt || "";
  }
  return (
    refDoc.description || refDoc.preview || refDoc.promptText || refDoc.content || refDoc.text || refDoc.prompt || ""
  );
};

/* ============================================================================
   COMPONENT
   ==========================================================================*/
export default function SavedCollection() {
  const [tab, setTab] = useState<TabId>("smartgen");
  const section = SECTION_BY_TAB[tab];
  const { token } = useAuth() as any;

  const [sections, setSections] = useState<ServerSections>({});
  const [loading, setLoading] = useState(true);

  const [menuForDirect, setMenuForDirect] = useState<string | null>(null);
  const [menuForFolderItem, setMenuForFolderItem] = useState<string | null>(null);
  const [menuForFolder, setMenuForFolder] = useState<string | null>(null);

  const [viewingFolder, setViewingFolder] = useState<string | null>(null);

  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editFolderValue, setEditFolderValue] = useState("");

  const [moveRefId, setMoveRefId] = useState<string | null>(null);
  const [moveFolderName, setMoveFolderName] = useState("");
  const [moveItemName, setMoveItemName] = useState("");

  const [editItemTitle, setEditItemTitle] = useState("");

  const menuScopeRef = useRef<HTMLDivElement>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      if (!token) {
        const local = loadSaved();
        setSections({
          [section]: { directItems: local.map((x) => ({ ref: { prompt: x.prompt, title: x.title } })), collections: [] },
        });
      } else {
        const data = await apiGetAll(token);
        if (data?.success) setSections(data.sections || {});
        else toast({ title: "Load failed", description: "Could not fetch saved items." });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to fetch" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const folder = params.get("folder");
    const tabFromUrl = params.get("tab") as TabId | null;
    const onFolderPage = location.pathname.endsWith("/folder-save");
    if (onFolderPage && folder) {
      if (tabFromUrl && TABS.find((t) => t.id === tabFromUrl)) setTab(tabFromUrl);
      setViewingFolder(folder);
    }
    const onPop = () => {
      const nowFolder = new URLSearchParams(location.search).get("folder");
      if (location.pathname.endsWith("/folder-save") && nowFolder) {
        setViewingFolder(nowFolder);
      } else {
        setViewingFolder(null);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuScopeRef.current && !menuScopeRef.current.contains(e.target as Node)) {
        setMenuForFolder(null);
        setMenuForDirect(null);
        setMenuForFolderItem(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const activeSection = useMemo<SectionBlock>(() => {
    const s = (sections || {}) as any;
    return s[section] || { directItems: [], collections: [] };
  }, [sections, section]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text || "");
    toast({ title: "Copied", description: `"${label}" has been copied.` });
  };

  const openFolder = (title: string) => {
    setViewingFolder(title);
    const qs = new URLSearchParams({ tab, folder: title });
    history.pushState({ folder: title, tab }, "", `/folder-save?${qs.toString()}`);
  };

  const leaveFolder = () => {
    setViewingFolder(null);
    history.pushState({}, "", `/saved-collection`);
  };

  const startRenameFolder = (title: string) => {
    setEditingFolder(title);
    setEditFolderValue(title);
    setMenuForFolder(null);
  };

  const confirmRenameFolder = async () => {
    const oldTitle = editingFolder!;
    const newTitle = editFolderValue.trim();
    if (!newTitle || newTitle === oldTitle) {
      setEditingFolder(null);
      return;
    }
    try {
      const resp = await apiRenameCollection(section, oldTitle, newTitle, token);
      if (resp?.success) {
        toast({ title: "Renamed", description: `Folder is now “${newTitle}”.` });
        if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
        else await fetchAll();
        setViewingFolder((v) => (v === oldTitle ? newTitle : v));
      } else toast({ title: "Rename failed", description: resp?.error || "Unable to rename" });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Unable to rename" });
    } finally {
      setEditingFolder(null);
    }
  };

  const deleteFolder = async (title: string) => {
    try {
      const resp = await apiDeleteCollection(section, title, token);
      if (resp?.success) {
        toast({ title: "Deleted", description: `Folder “${title}” removed.` });
        if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
        else await fetchAll();
        if (viewingFolder === title) {
          setViewingFolder(null);
          history.pushState({}, "", `/saved-collection`);
        }
      } else toast({ title: "Delete failed", description: resp?.error || "Unable to delete folder" });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Unable to delete folder" });
    }
  };

  const renameItemInFolder = async (folderTitle: string, refId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      await apiDeleteItem(section, refId, token);
      const resp = await apiPostSave(section, refId, token, {
        collectionTitle: folderTitle,
        name: newTitle.trim(),
      });
      if (resp?.success) {
        toast({ title: "Renamed", description: `Item renamed to “${newTitle.trim()}”.` });
        if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
        else await fetchAll();
      } else {
        toast({ title: "Rename failed", description: resp?.error || "Could not rename item" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Could not rename item" });
    } finally {
      setMenuForFolderItem(null);
    }
  };

  const openMoveForm = (refId: string, currentName: string) => {
    setMenuForDirect(refId);
    setMoveRefId(refId);
    setMoveFolderName("");
    setMoveItemName(currentName || "");
  };

  const performMoveToFolder = async () => {
    if (!moveRefId || !moveFolderName.trim()) return;
    try {
      await apiDeleteItem(section, moveRefId, token);
      const resp = await apiPostSave(section, moveRefId, token, {
        collectionTitle: moveFolderName.trim(),
        name: moveItemName.trim() || undefined,
      });
      if (resp?.success) {
        toast({ title: "Moved", description: `Item moved to “${moveFolderName.trim()}”.` });
        if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
        else await fetchAll();
      } else toast({ title: "Move failed", description: resp?.error || "Could not move item" });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Could not move item" });
    } finally {
      setMenuForDirect(null);
      setMoveRefId(null);
    }
  };

  const deleteSingleItem = async (refId: string) => {
    try {
      const resp = await apiDeleteItem(section, refId, token);
      if (resp?.success) {
        toast({ title: "Removed", description: "Item deleted from saved." });
        if (resp.savedCollection?.sections) setSections(resp.savedCollection.sections);
        else await fetchAll();
      } else toast({ title: "Delete failed", description: resp?.error || "Unable to delete item" });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Unable to delete item" });
    }
  };

  const folders = activeSection.collections || [];
  const directItems = activeSection.directItems || [];

  const renderCardFooter = (text: string, title: string) => (
    <div className="flex items-center justify-start gap-2">
      <div className="w-9 h-9 rounded-full grid place-items-center shrink-0" style={{ background: "#333335" }}>
        <img src="/icons/cop1.png" className="w-4 h-4 object-contain" />
      </div>
      <button
        onClick={() => copyToClipboard(text, title)}
        className="h-9 px-3.5 rounded-full text-white text-[13px] font-medium inline-flex items-center justify-center gap-2 bg-[#333335] hover:opacity-90 transition-colors"
        title="Copy"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
          <rect x="4" y="4" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
        </svg>
        Copy
      </button>
    </div>
  );

  const renderFolderPage = () => {
    if (!viewingFolder) return null;
    const folder = folders.find((f) => f.title === viewingFolder);
    if (!folder) {
      setViewingFolder(null);
      history.replaceState({}, "", "/saved-collection");
      return null;
    }

    return (
      <div className="w-full">
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
          {(folder.items || []).map((it, idx) => {
            const refId = getDocId(it.ref);
            const title = getItemTitle(it);
            const text = pickTextFromRef(section, it.ref);
            const imageUrl = itemImage(it, idx);
            const isMenu = menuForFolderItem === refId;

            return (
              <Card
                key={refId || `${title}_${idx}`}
                className="overflow-hidden w-full"
                style={{
                  minHeight: 470,
                  borderRadius: 24,
                  borderBottomWidth: 1,
                  borderLeftWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  background: "#1C1C1C",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <CardContent className="relative p-4 h-full flex flex-col" ref={isMenu ? menuScopeRef : undefined}>
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ height: 220, borderRadius: 16, backgroundColor: "#0B0B0B", margin: "0 auto" }}
                  >
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-[16px]" />
                    <div className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full" style={{ background: GRADIENT }}>
                      {viewingFolder}
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-white bg-black/50 border border-white/30 backdrop-blur-sm">
                        <Download className="h-3.5 w-3.5" />
                        {(it as any).uses ? (it as any).uses : 0} USES
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[16px] sm:text-[18px] leading-snug font-semibold text-white break-words">
                        {title}
                      </h3>

                      <button
                        type="button"
                        onClick={() => {
                          if (isMenu) {
                            setMenuForFolderItem(null);
                          } else {
                            setMenuForFolderItem(refId);
                            setEditItemTitle(title);
                          }
                        }}
                        className="p-1 rounded-full hover:bg-white/10 shrink-0"
                        aria-label="More actions"
                      >
                        <MoreHorizontal className="h-5 w-5 text-white/85" />
                      </button>
                    </div>

                    <p className="mt-2 text-[13px] leading-relaxed text-white/70 break-words">
                      {text.length > 140 ? `${text.slice(0, 140)}…` : text}
                    </p>
                  </div>

                  <div className="mt-auto pt-4">{renderCardFooter(text, title)}</div>

                  {isMenu && (
                    <div className="mt-3 rounded-[16px] p-3 shadow-lg border border-white/10 bg-[#333335]">
                      <div className="space-y-2">
                        <div className="text-white/80 text-sm font-medium">Edit title</div>
                        <input
                          value={editItemTitle}
                          onChange={(e) => setEditItemTitle(e.target.value)}
                          placeholder="Item title"
                          className="h-9 w-full rounded-xl bg-[#252526] px-3 text-white outline-none"
                        />
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button
                            className="h-9 rounded-full text-white"
                            style={{ background: GRADIENT }}
                            disabled={!editItemTitle.trim()}
                            onClick={() => renameItemInFolder(viewingFolder, refId, editItemTitle)}
                          >
                            Save
                          </Button>
                          <Button
                            className="h-9 rounded-full text-white"
                            style={{ background: "#333335" }}
                            variant="outline"
                            onClick={() => setMenuForFolderItem(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>

                      <div className="h-px bg-white/10 my-3" />

                      <button
                        onClick={() => {
                          setMenuForFolderItem(null);
                          deleteSingleItem(refId);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm"
                      >
                        <Trash className="h-4 w-4" />
                        Delete item
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {!folder.items?.length && (
            <div className="text-center text-white/70 col-span-full py-12">No items inside this folder yet.</div>
          )}
        </div>
      </div>
    );
  };

  const renderAllSaved = () => {
    if (!directItems.length) return null;
    return (
      <div className="w-full mt-14 sm:mt-16">
        <h2
          className="text-white mb-6 px-1 text-[20px] sm:text-[22px]"
          style={{ fontFamily: "Inter", fontWeight: 600, lineHeight: "100%" }}
        >
          All Saved
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
          {directItems.map((it, idx) => {
            const refId = getDocId(it.ref);
            const title = getItemTitle(it);
            const text = pickTextFromRef(section, it.ref);
            const imageUrl = itemImage(it, idx);
            const isMenu = menuForDirect === refId;

            return (
              <Card
                key={refId || `${title}_${idx}`}
                className="overflow-hidden w-full"
                style={{
                  minHeight: 470,
                  borderRadius: 24,
                  borderBottomWidth: 1,
                  borderLeftWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  background: "#1C1C1C",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <CardContent className="p-4 h-full flex flex-col" ref={isMenu ? menuScopeRef : undefined}>
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ height: 220, borderRadius: 16, backgroundColor: "#0B0B0B", margin: "0 auto" }}
                  >
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-[16px]" />
                  </div>

                  <div className="mt-3 flex items-start justify-between gap-3">
                    <h3 className="text-[15px] sm:text-[16px] font-semibold text-white break-words">{title}</h3>

                    <button
                      type="button"
                      onClick={() => (isMenu ? setMenuForDirect(null) : openMoveForm(refId, title))}
                      className="p-1 rounded-full hover:bg-white/10 shrink-0"
                      aria-label="More actions"
                    >
                      <MoreHorizontal className="h-5 w-5 text-white/85" />
                    </button>
                  </div>

                  <p className="mt-2 text-[13px] text-white/70 break-words">
                    {text.length > 140 ? `${text.slice(0, 140)}…` : text}
                  </p>

                  <div className="mt-auto pt-4">{renderCardFooter(text, title)}</div>

                  {isMenu && (
                    <div className="mt-3 rounded-[16px] p-3 shadow-lg border border-white/10 bg-[#333335]">
                      <div className="space-y-2">
                        <div className="text-white/80 text-sm font-medium">Move to folder</div>
                        <input
                          value={moveFolderName}
                          onChange={(e) => setMoveFolderName(e.target.value)}
                          placeholder="Folder name (collection)"
                          className="h-9 w-full rounded-xl bg-[#252526] px-3 text-white outline-none"
                        />
                        <input
                          value={moveItemName}
                          onChange={(e) => setMoveItemName(e.target.value)}
                          placeholder="Item title (optional)"
                          className="h-9 w-full rounded-xl bg-[#252526] px-3 text-white outline-none"
                        />
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button
                            className="h-9 rounded-full text-white"
                            style={{ background: GRADIENT }}
                            disabled={!moveFolderName.trim()}
                            onClick={performMoveToFolder}
                          >
                            Move
                          </Button>
                          <Button
                            className="h-9 rounded-full text-white"
                            style={{ background: "#333335" }}
                            variant="outline"
                            onClick={() => {
                              setMenuForDirect(null);
                              setMoveRefId(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>

                      <div className="h-px bg-white/10 my-3" />

                      <button
                        onClick={() => deleteSingleItem(refId)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm"
                      >
                        <Trash className="h-4 w-4" />
                        Delete item
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFolderGrid = () => {
    if (loading) return <div className="text-center text-white/80 py-10">Loading your saved items…</div>;
    if (!folders.length)
      return (
        <div className="text-center py-16">
          <img src="/icons/void.png" alt="" className="mx-auto mb-6 h-32 sm:h-40 w-auto opacity-90" />
          <p className="text-white text-lg sm:text-xl">No folders yet</p>
          <p className="text-white/70 mt-2 text-sm sm:text-base">Save with a Name/Title to create a folder here.</p>
        </div>
      );

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
        {folders.map((c, idx) => {
          const isMenu = menuForFolder === c.title;
          const cover = itemImage((c.items || [])[0], idx);
          const count = (c.items || []).length;

          return (
            <Card
              key={c.title}
              className="overflow-hidden w-full"
              style={{
                borderRadius: 24,
                borderBottomWidth: 1,
                borderLeftWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                background: "#1C1C1C",
              }}
            >
              <CardContent className="relative p-4" ref={isMenu ? menuScopeRef : undefined}>
                <div
                  className="relative w-full overflow-hidden group cursor-pointer"
                  style={{ height: 220, borderRadius: 16, backgroundColor: "#0B0B0B", margin: "0 auto" }}
                  onClick={() => openFolder(c.title)}
                  title={c.title}
                  aria-label={c.title}
                >
                  <img src={cover} alt={c.title} className="w-full h-full object-cover rounded-[16px]" />
                  <div className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full" style={{ background: GRADIENT }}>
                    {count} {count === 1 ? "ITEM" : "ITEMS"}
                  </div>
                </div>

                <div className="mt-3 flex items-start justify-between gap-3">
                  <h3 className="text-[15px] sm:text-[16px] font-semibold text-white break-words">{c.title}</h3>

                  <button
                    type="button"
                    onClick={() => setMenuForFolder(isMenu ? null : c.title)}
                    className="p-1 rounded-full hover:bg-white/10 shrink-0"
                    aria-label="Folder menu"
                  >
                    <MoreHorizontal className="h-5 w-5 text-white/85" />
                  </button>
                </div>

                {isMenu && (
                  <div className="mt-3 rounded-[16px] p-2 shadow-lg border border-white/10 bg-[#333335]">
                    <button
                      onClick={() => {
                        setMenuForFolder(null);
                        startRenameFolder(c.title);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm"
                    >
                      <Pencil className="h-4 w-4" />
                      Rename folder
                    </button>
                    <button
                      onClick={() => deleteFolder(c.title)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-white/10 text-white text-sm"
                    >
                      <Trash className="h-4 w-4" />
                      Delete folder
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 pt-28 sm:pt-32">
        <div className="flex flex-col items-center text-center mb-8">
          <h1
            style={{ fontFamily: "Inter", fontWeight: 400, lineHeight: "100%" }}
            className="text-white text-[26px] sm:text-[32px]"
          >
            Saved Items
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 pb-16">
        <div className="mx-auto mb-5 max-w-6xl">
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex w-max min-w-full justify-start sm:justify-center items-center gap-2 rounded-full bg-white/5 px-2 py-2">
              {TABS.map((t) => {
                const active = t.id === tab;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTab(t.id);
                      setMenuForFolder(null);
                      setMenuForDirect(null);
                      if (viewingFolder) {
                        const qs = new URLSearchParams({ tab: t.id, folder: viewingFolder });
                        history.replaceState({ folder: viewingFolder, tab: t.id }, "", `/folder-save?${qs.toString()}`);
                      }
                    }}
                    className={`flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap transition ${
                      active
                        ? "bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
                        : "bg-transparent hover:bg-white/10"
                    }`}
                  >
                    <img src={t.icon} alt="" className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <>
          {!viewingFolder ? renderFolderGrid() : renderFolderPage()}
          {!viewingFolder && renderAllSaved()}
        </>
      </div>

      {editingFolder && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C1C] border border-white/10 rounded-2xl p-3 shadow-xl w-[92vw] sm:w-[min(90vw,520px)]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              value={editFolderValue}
              onChange={(e) => setEditFolderValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmRenameFolder();
                if (e.key === "Escape") setEditingFolder(null);
              }}
              className="h-10 flex-1 rounded-xl bg-[#252526] px-3 text-white outline-none"
              placeholder="Collection name"
              autoFocus
            />
            <Button
              className="h-10 rounded-full text-white"
              style={{ background: GRADIENT }}
              disabled={!editFolderValue.trim()}
              onClick={confirmRenameFolder}
            >
              Save
            </Button>
            <Button
              className="h-10 rounded-full text-white"
              style={{ background: "#333335" }}
              variant="outline"
              onClick={() => setEditingFolder(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="mt-16 sm:mt-20">
        <Footer />
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}