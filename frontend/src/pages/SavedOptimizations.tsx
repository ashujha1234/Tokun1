// // src/pages/SavedOptimizations.tsx
// import { useEffect, useState, useMemo } from "react";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";
// import { Loader2, X, Copy, ArrowRight, Search } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// type LlmProviderPop = { name?: string };
// type CreatedByPop = { name?: string; email?: string };

// interface OptimizedPromptDoc {
//   _id: string;
//   inputPrompt: string;
//   outputPrompt: string;
//   tokensUsed: number; // kept in type but not displayed
//   llmProvider?: string | LlmProviderPop;
//   createdBy?: string | CreatedByPop;
//   createdAt?: string;
// }

// const PANEL_CLS =
//   "rounded-2xl bg-[#121213] p-4 sm:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] text-white";
// const BOX_CLS =
//   "rounded-xl border border-white/20 bg-[#151516] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] text-white";
// const BOX_PAD = "p-3 sm:p-4";
// const GRADIENT_BG = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";
// const SUBTLE_TEXT = "text-xs text-white";

// const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
// const PROMPT_OPTIMIZER_URL = API_BASE
//   ? `${API_BASE}/api/promptoptimizer`
//   : `/api/promptoptimizer`;

// const getAuthToken = () =>
//   localStorage.getItem("auth_token") ||
//   sessionStorage.getItem("auth_token") ||
//   localStorage.getItem("token") ||
//   sessionStorage.getItem("token") ||
//   "";

// const SavedOptimizations = () => {
//   const { toast } = useToast();
//   const navigate = useNavigate();

//   const [items, setItems] = useState<OptimizedPromptDoc[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [deletingId, setDeletingId] = useState<string | null>(null);

//   const [q, setQ] = useState("");

//   const filtered = useMemo(() => {
//     if (!q.trim()) return items;
//     const needle = q.toLowerCase();
//     return items.filter((it) =>
//       (it.outputPrompt || it.inputPrompt || "").toLowerCase().includes(needle)
//     );
//   }, [q, items]);

//   const authHeaders = () => {
//     const token = getAuthToken();
//     const h: Record<string, string> = { "Content-Type": "application/json" };
//     if (token) h.Authorization = `Bearer ${token}`;
//     return h;
//   };

//   const formatWhen = (iso?: string) => {
//     if (!iso) return "";
//     const d = new Date(iso);
//     return d.toLocaleString();
//   };

//   const renderProvider = (p?: string | LlmProviderPop) =>
//     typeof p === "string" ? p : p?.name ?? "—";

//   const copy = (text: string) =>
//     navigator.clipboard.writeText(text).then(() =>
//       toast({ title: "Copied", description: "Prompt copied to clipboard." })
//     );

//   const load = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(PROMPT_OPTIMIZER_URL, {
//         method: "GET",
//         headers: authHeaders(),
//         credentials: "include",
//       });
//       const raw = await res.text();
//       let data: any = {};
//       try {
//         data = JSON.parse(raw);
//       } catch {}
//       if (!res.ok) throw new Error(data?.error || `http_${res.status}`);
//       setItems(data?.promptsoptimizer ?? []);
//     } catch (err: any) {
//       console.error("Load saved optimizations error:", err);
//       toast({
//         title: "Couldn’t load",
//         description: err?.message || "Try again",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const del = async (id: string) => {
//     setDeletingId(id);
//     try {
//       const res = await fetch(`${PROMPT_OPTIMIZER_URL}/${id}`, {
//         method: "DELETE",
//         headers: authHeaders(),
//         credentials: "include",
//       });
//       const raw = await res.text();
//       let data: any = {};
//       try {
//         data = JSON.parse(raw);
//       } catch {}
//       if (!res.ok) throw new Error(data?.error || `http_${res.status}`);
//       setItems((prev) => prev.filter((x) => x._id !== id));
//       toast({ title: "Deleted", description: "Optimization removed." });
//     } catch (err: any) {
//       console.error("Delete optimization error:", err);
//       toast({
//         title: "Delete failed",
//         description: err?.message || "Try again",
//         variant: "destructive",
//       });
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const useInEditor = (text: string) => {
//     navigate("/optimize", { state: { initialText: text } });
//   };

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 text-white">
//       <div className="flex items-center justify-between mb-4">
//         <h1 className="text-xl sm:text-2xl font-semibold">Saved Optimizations</h1>
//         <div className="flex items-center gap-2">
//           <Button
//             variant="outline"
//             className="h-9 px-3 rounded-full bg-black/40 border-white/20 text-white"
//             onClick={load}
//             disabled={loading}
//           >
//             {loading ? (
//               <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//             ) : null}
//             Refresh
//           </Button>
//           <Button
//             className="h-9 px-3 rounded-full text-white"
//             style={{ backgroundImage: GRADIENT_BG }}
//             onClick={() => navigate("/optimize")}
//           >
//             Go to Optimizer <ArrowRight className="ml-2 h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       <div className={PANEL_CLS}>
//         {/* search box */}
//         <div className={`${BOX_CLS} ${BOX_PAD} mb-4 flex items-center gap-2`}>
//           <Search className="h-4 w-4" />
//           <input
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//             placeholder="Search in saved output/input…"
//             className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/70 caret-white"
//           />
//           {q && (
//             <Button
//               variant="outline"
//               size="icon"
//               className="h-8 w-8 rounded-full bg-black/40 border-white/20 text-white"
//               onClick={() => setQ("")}
//               title="Clear"
//             >
//               <X className="h-4 w-4" />
//             </Button>
//           )}
//         </div>

//         <div className={`${BOX_CLS} ${BOX_PAD}`}>
//           {loading && items.length === 0 ? (
//             <p className="text-white">Loading…</p>
//           ) : filtered.length === 0 ? (
//             <p className="text-white">
//               No saved optimizations{q ? " matching your search" : ""}.
//             </p>
//           ) : (
//             <ul className="space-y-4">
//               {filtered.map((item) => {
//                 const preview = item.outputPrompt || item.inputPrompt || "";
//                 return (
//                   <li
//                     key={item._id}
//                     className="border border-white/10 rounded-xl p-3 bg-black/30 text-white"
//                   >
//                     <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
//                       <div className="flex-1 min-w-0">
//                         <div className="flex flex-wrap items-center gap-2 text-xs">
//                           <span className="px-2 py-0.5 rounded-full border border-white/20">
//                             {renderProvider(item.llmProvider)}
//                           </span>
//                           {/* tokens hidden */}
//                           <span className="px-2 py-0.5 rounded-full border border-white/20">
//                             {formatWhen(item.createdAt)}
//                           </span>
//                           {typeof item.createdBy !== "string" && item.createdBy?.email ? (
//                             <span className="px-2 py-0.5 rounded-full border border-white/20">
//                               {item.createdBy.name ?? "User"} • {item.createdBy.email}
//                             </span>
//                           ) : null}
//                         </div>

//                         <div className="mt-2">
//                           <Textarea
//                             readOnly
//                             value={preview}
//                             className="min-h-[100px] bg-transparent resize-y border border-white/20 text-white placeholder:text-white/60 caret-white"
//                           />
//                           <div className="mt-2">
//                             <span className={SUBTLE_TEXT}>
//                               Input words:{" "}
//                               {(item.inputPrompt || "")
//                                 .split(/\s+/)
//                                 .filter(Boolean).length}
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="flex sm:flex-col gap-2 sm:shrink-0">
//                         <Button
//                           size="sm"
//                           className="h-8 rounded-full text-white"
//                           onClick={() => useInEditor(preview)}
//                           title="Load into optimizer"
//                         >
//                           Use in Optimizer
//                         </Button>

//                         <Button
//                           size="sm"
//                           variant="outline"
//                           className="h-8 rounded-full text-white border-white/20"
//                           onClick={() => copy(preview)}
//                           title="Copy to clipboard"
//                         >
//                           <Copy className="h-3.5 w-3.5 mr-2" />
//                           Copy
//                         </Button>

//                         <Button
//                           size="sm"
//                           variant="destructive"
//                           className="h-8 rounded-full text-white"
//                           disabled={deletingId === item._id}
//                           onClick={() => del(item._id)}
//                           title="Delete"
//                         >
//                           {deletingId === item._id ? (
//                             <>
//                               <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
//                               Deleting…
//                             </>
//                           ) : (
//                             <>
//                               <X className="h-3.5 w-3.5 mr-2" />
//                               Delete
//                             </>
//                           )}
//                         </Button>
//                       </div>
//                     </div>
//                   </li>
//                 );
//               })}
//             </ul>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SavedOptimizations;



// src/pages/SavedOptimizations.tsx
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash, Star, Copy } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface OptimizedPromptDoc {
  _id: string;
  inputPrompt: string;
  outputPrompt: string;
  tokensUsed: number; // not displayed
  createdAt?: string;
}

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const PROMPT_OPTIMIZER_URL = API_BASE ? `${API_BASE}/api/promptoptimizer` : `/api/promptoptimizer`;

const getAuthToken = () =>
  localStorage.getItem("auth_token") ||
  sessionStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("token") ||
  "";

const SavedOptimizations = () => {
  const { toast } = useToast();

  const [items, setItems] = useState<OptimizedPromptDoc[]>([]);
  const [loading, setLoading] = useState(false);

  // favorites + bulk delete + selection + sort
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "favorites">("newest");

  const authHeaders = () => {
    const token = getAuthToken();
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  };

  const viewList = useMemo(() => {
    let arr = [...items];
    if (sortBy === "favorites") arr = arr.filter((it) => favorites.has(it._id));
    const t = (x: OptimizedPromptDoc) => (x?.createdAt ? new Date(x.createdAt).getTime() : 0);
    arr.sort((a, b) => (sortBy === "oldest" ? t(a) - t(b) : t(b) - t(a)));
    return arr;
  }, [items, sortBy, favorites]);

  const allOnPageSelected = viewList.length > 0 && viewList.every((it) => selected.has(it._id));

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(PROMPT_OPTIMIZER_URL, {
        method: "GET",
        headers: authHeaders(),
        credentials: "include",
      });
      const raw = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(raw);
      } catch {}
      if (!res.ok) throw new Error(data?.error || `http_${res.status}`);
      setItems(Array.isArray(data?.promptsoptimizer) ? data.promptsoptimizer : []);
    } catch (err: any) {
      console.error("Load saved optimizations error:", err);
      toast({
        title: "Couldn’t load optimiser history",
        description: err?.message || "Try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const del = async (id: string) => {
    try {
      const res = await fetch(`${PROMPT_OPTIMIZER_URL}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
        credentials: "include",
      });
      const raw = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(raw);
      } catch {}
      if (!res.ok) throw new Error(data?.error || `http_${res.status}`);
      setItems((prev) => prev.filter((x) => x._id !== id));
      setSelected((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      toast({ title: "Deleted", description: "Optimization removed." });
    } catch (err: any) {
      console.error("Delete optimization error:", err);
      toast({
        title: "Delete failed",
        description: err?.message || "Try again",
        variant: "destructive",
      });
    }
  };

  const deleteSelected = async () => {
    const ids = viewList.map((x) => x._id).filter((id) => selected.has(id));
    for (const id of ids) {
      // eslint-disable-next-line no-await-in-loop
      await del(id);
    }
  };

  const toggleFavorite = (id: string) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAllToggle = () => {
    if (allOnPageSelected) {
      const n = new Set(selected);
      viewList.forEach((it) => n.delete(it._id));
      setSelected(n);
    } else {
      const n = new Set(selected);
      viewList.forEach((it) => n.add(it._id));
      setSelected(n);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // restore / persist favorites
  useEffect(() => {
    try {
      const raw = localStorage.getItem("optimizer_favs");
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("optimizer_favs", JSON.stringify(Array.from(favorites)));
    } catch {}
  }, [favorites]);

  return (
    <div className="min-h-screen bg-[#0c0c0d] text-white">
      <Header />

      <main className="px-4 sm:px-6 py-6 sm:py-8">
        {/* local style for select options */}
        <style>{`.history-dd option { background-color: #464646; color: #fff; }`}</style>

        {/* Toolbar */}
        <div className="mx-auto w-full max-w-[1000px] mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/30 bg-transparent"
                checked={allOnPageSelected}
                onChange={selectAllToggle}
              />
              <span className="text-white/90 text-sm">Select all</span>
            </label>

            <Button
              onClick={deleteSelected}
              disabled={selected.size === 0}
              className="h-9 rounded-[10px] bg-[#3A3A3A] hover:opacity-90 px-4 inline-flex items-center gap-2"
            >
              <Trash className="h-4 w-4" />
              <span className="text-sm">Delete</span>
            </Button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="history-dd appearance-none h-9 rounded-[10px] px-3 pr-8 text-sm text-white bg-transparent border border-white"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="favorites">Favorites</option>
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/80">▾</span>
            </div>
          </div>

          <div className="text-white/70 text-sm">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </span>
            ) : (
              `${viewList.length} results`
            )}
          </div>
        </div>

        {/* List */}
        {loading && items.length === 0 ? (
          <div className="mx-auto max-w-[1000px] text-white flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : viewList.length === 0 ? (
          <div className="text-center py-16">
            <img src="/icons/void.png" alt="" className="mx-auto mb-6 h-40 w-auto opacity-90" />
            <p className="text-white text-xl">No Prompt optimiser history</p>
            <p className="text-white/70 mt-2">When you generate prompts, they’ll show up here.</p>
          </div>
        ) : (
          <ul className="flex flex-col items-center gap-4">
            {viewList.map((it) => {
              const input = it.inputPrompt || "";
              const output = it.outputPrompt || "";
              const preview = output || input; // Copy uses output if available, else input
              const created = it.createdAt ? new Date(it.createdAt) : null;
              const isFav = favorites.has(it._id);

              const toggleSelected = () =>
                setSelected((s) => {
                  const n = new Set(s);
                  n.has(it._id) ? n.delete(it._id) : n.add(it._id);
                  return n;
                });

              return (
                <li key={it._id} className="w-full flex justify-center">
                  <div className="relative w-full max-w-[1000px] rounded-[20px] border-[4px] border-[#111419] p-5 pb-20 min-h-[220px]">
                    {/* Favorite star (top-right) */}
                    <button
                      onClick={() => toggleFavorite(it._id)}
                      className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10"
                      title={isFav ? "Unfavorite" : "Favorite"}
                    >
                      <Star className={`h-5 w-5 ${isFav ? "text-[#8B5CF6] fill-[#8B5CF6]" : "text-white/70"}`} />
                    </button>

                    {/* Checkbox (top-left) */}
                    <label className="absolute top-3 left-3 inline-flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/40 bg-transparent"
                        checked={selected.has(it._id)}
                        onChange={toggleSelected}
                      />
                    </label>

                    {/* Content: INPUT first, then OUTPUT (no provider/creator pills) */}
                    <div className="pl-8 pr-16 space-y-6">
                      <div>
                        <div className="text-[12px] uppercase tracking-wide text-white/60 mb-1">Input</div>
                        <div className="text-[14px] text-white/90 whitespace-pre-wrap break-words">
                          {input || "—"}
                        </div>
                      </div>

                      <div>
                        <div className="text-[12px] uppercase tracking-wide text-white/60 mb-1">Output</div>
                        <div className="text-[14px] text-white/90 whitespace-pre-wrap break-words">
                          {output || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Bottom-left: time pill ONLY */}
                    {created && (
                      <div className="absolute left-4 bottom-3 text-xs text-white/60">
                        {created.toLocaleString()}
                      </div>
                    )}

                    {/* Bottom-right actions */}
                    <div className="absolute right-3 bottom-3 flex items-center gap-2">
                      <button
                        title="Delete"
                        className="h-9 w-9 rounded-full bg-[#3A3A3A] hover:bg-[#4A4A4A] flex items-center justify-center"
                        onClick={() => del(it._id)}
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                      <button
                        title="Copy"
                        className="h-9 px-3 rounded-[10px] bg-[#3A3A3A] hover:bg-[#4A4A4A] inline-flex items-center gap-2"
                        onClick={() =>
                          navigator.clipboard.writeText(preview).then(() =>
                            toast({ title: "Copied", description: "Prompt copied to clipboard." })
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                        <span className="text-sm">Copy</span>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SavedOptimizations;
