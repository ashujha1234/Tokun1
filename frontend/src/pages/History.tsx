import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash, Star, Copy } from "lucide-react";
import { useLocation,useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";

/* ----------------------- Shared helpers ----------------------- */
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const base = API_BASE || ""; // keep relative in dev if proxied

const getAuthTokenFromStorage = () =>
  localStorage.getItem("auth_token") ||
  sessionStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("token") ||
  "";

const GRADIENT =
  "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

/* ==============================================================
   Optimiser history (PROMPT OPTIMISER)
================================================================= */

type OptimizedPromptDoc = {
  _id: string;
  inputPrompt: string;
  outputPrompt: string;
  tokensUsed: number; // not displayed
  createdAt?: string;
};

function OptimizerHistoryList() {
  const { toast } = useToast();

  const [items, setItems] = useState<OptimizedPromptDoc[]>([]);
  const [loading, setLoading] = useState(false);

  // favorites + bulk delete + selection + sort
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "favorites">("newest");

  const PROMPT_OPTIMIZER_URL = `${base}/api/promptoptimizer`;
    type TabKey = "smartgen" | "optimizer";

const [tab, setTab] = useState<TabKey>("smartgen");
const location = useLocation();
const navigate = useNavigate();

useEffect(() => {
  const q = new URLSearchParams(location.search).get("tab");
  if (q === "optimizer" || q === "smartgen") setTab(q as TabKey);
}, [location.search]);

const setTabAndUrl = (next: TabKey) => {
  setTab(next);
  navigate(`/history?tab=${next}`, { replace: true });
};
  const authHeaders = () => {
    const token = getAuthTokenFromStorage();
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
    <div>
      {/* Toolbar */}
      <style>{`.history-dd option { background-color: #464646; color: #fff; }`}</style>
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

                  {/* Content: INPUT first, then OUTPUT */}
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
    </div>
  );
}

/* ==============================================================
   Smartgen history (SMARTGEN)
================================================================= */

type HistoryItem = { _id: string; text: string; createdAt?: string };

const apiGetAll = async (token?: string) => {
  const res = await fetch(`${base}/api/saved-collections`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `http_${res.status}`);
  return data;
};

const pickTextFromRef = (_section: string, ref: any) => {
  if (!ref) return "";
  const node = typeof ref === "string" ? null : ref;
  return (
    node?.detailedPrompt ||
    node?.output ||
    node?.result ||
    node?.inputPrompt ||
    node?.prompt ||
    ""
  );
};

function SmartgenHistoryList() {
  const { token: ctxToken } = useAuth() as any;
  const { toast } = useToast();

  const token = ctxToken || getAuthTokenFromStorage();

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // favorites + bulk delete + sort + selection
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "favorites">("newest");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState<boolean>(false);

  const SMARTGEN_URLS = [`${base}/api/smartgen`, `${base}/api/smartgen/history`];
  const SMARTGEN_API = `${base}/api/smartgen`;
  const SMARTGEN_DELETE_ALL = `${base}/api/smartgen/user/all`;

     type TabKey = "smartgen" | "optimizer";
const [tab, setTab] = useState<TabKey>("smartgen");
const location = useLocation();

useEffect(() => {
  const q = new URLSearchParams(location.search).get("tab");
  if (q === "optimizer" || q === "smartgen") setTab(q as TabKey);
}, [location.search]);






  const viewList = useMemo(() => {
    let arr = [...items];
    if (sortBy === "favorites") arr = arr.filter((it) => favorites.has(it._id));
    const t = (x: any) => (x?.createdAt ? new Date(x.createdAt).getTime() : 0);
    arr.sort((a, b) => (sortBy === "oldest" ? t(a) - t(b) : t(b) - t(a)));
    return arr;
  }, [items, sortBy, favorites]);

  const allOnPageSelected =
    viewList.length > 0 && viewList.every((it) => selected.has(it._id));

  /* Load history */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let ok = false;
        for (const url of SMARTGEN_URLS) {
          try {
            const res = await fetch(url, {
              method: "GET",
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              credentials: "include",
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
              const arr =
                Array.isArray(data)
                  ? data
                  : Array.isArray((data as any)?.smartgen)
                  ? (data as any).smartgen
                  : Array.isArray((data as any)?.prompts)
                  ? (data as any).prompts
                  : Array.isArray((data as any)?.items)
                  ? (data as any).items
                  : [];
              if (arr.length) {
                const mapped: HistoryItem[] = arr
                  .map((d: any, idx: number) => ({
                    _id: d?._id || d?.id || String(idx),
                    text:
                      d?.detailedPrompt ||
                      d?.output ||
                      d?.result ||
                      d?.inputPrompt ||
                      d?.prompt ||
                      "",
                    createdAt: d?.createdAt,
                  }))
                  .filter((x) => x.text);
                if (mapped.length) {
                  setItems(mapped);
                  ok = true;
                  break;
                }
              }
            }
          } catch {}
        }

        if (!ok) {
          // fallback from Saved Collections
          const data = await apiGetAll(token).catch(() => ({} as any));
          const block =
            (data?.sections?.smartgen ||
              (data?.sections ? data.sections["smartgen"] : undefined)) ?? {};

          const direct = Array.isArray(block?.directItems) ? block.directItems : [];
          const fromDirect = direct
            .map((it: any, i: number) => ({
              _id:
                (typeof it.ref === "string" ? it.ref : it?.ref?._id) || `direct_${i}`,
              text: pickTextFromRef("smartgen", it.ref),
              createdAt: it?.ref?.createdAt,
            }))
            .filter((x: any) => x.text);

          const fromFolders = (Array.isArray(block?.collections) ? block.collections : [])
            .flatMap((c: any) => (Array.isArray(c.items) ? c.items : []))
            .map((it: any, i: number) => ({
              _id:
                (typeof it.ref === "string" ? it.ref : it?.ref?._id) || `col_${i}`,
              text: pickTextFromRef("smartgen", it.ref),
              createdAt: it?.ref?.createdAt,
            }))
            .filter((x: any) => x.text);

          setItems([...fromDirect, ...fromFolders]);
        }
      } catch (e: any) {
        toast({
          title: "Couldn’t load smartgen history",
          description: e?.message || "Try again",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [token, toast]);

  /* Favorites persistence */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("smartgen_favs");
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("smartgen_favs", JSON.stringify(Array.from(favorites)));
    } catch {}
  }, [favorites]);

  /* Select all */
  const selectAllToggle = () => {
    setSelected((prev) => {
      const n = new Set(prev);
      const allSelected = viewList.length > 0 && viewList.every((it) => n.has(it._id));
      if (allSelected) viewList.forEach((it) => n.delete(it._id));
      else viewList.forEach((it) => n.add(it._id));
      return n;
    });
  };

  /* Per-item delete */
  const delSmartgen = async (id: string) => {
    try {
      setDeletingId(id);

      try {
        await fetch(`${SMARTGEN_API}/${id}`, {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          credentials: "include",
        });
      } catch {}

      const res = await fetch(`${SMARTGEN_API}/${id}`, {
        method: "DELETE",
        headers: token
          ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.success === false) {
        toast({
          title: "Delete failed",
          description: data?.error || `http_${res.status}`,
          variant: "destructive",
        });
        return;
      }

      setItems((prev) => prev.filter((x) => x._id !== id));
      setSelected((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      toast({ title: "Deleted", description: "History removed." });
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err?.message || "Try again",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  /* Bulk delete all for user */
  const deleteAllForUser = async () => {
    try {
      setBulkDeleting(true);
      const res = await fetch(SMARTGEN_DELETE_ALL, {
        method: "DELETE",
        headers: token
          ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.success === false) {
        toast({
          title: "Delete all failed",
          description: data?.error || `http_${res.status}`,
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Deleted all", description: data?.message || "All Smartgen history removed." });
      setItems([]);
      setSelected(new Set());
    } catch (err: any) {
      toast({
        title: "Delete all failed",
        description: err?.message || "Try again",
        variant: "destructive",
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  /* Delete selected (auto “all” path) */
  const deleteSelected = async () => {
    const allIds = items.map((x) => x._id);
    const selectedIds = allIds.filter((id) => selected.has(id));
    const selectedIsAll = selectedIds.length === allIds.length && allIds.every((id) => selected.has(id));

    if (selectedIsAll) {
      await deleteAllForUser();
      return;
    }

    const idsToDelete = viewList.map((x) => x._id).filter((id) => selected.has(id));
    for (const id of idsToDelete) {
      // eslint-disable-next-line no-await-in-loop
      await delSmartgen(id);
    }
  };

  const toggleFavorite = (id: string) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const splitTitleBody = (txt: string) => {
    const cleaned = (txt || "").trim();
    if (!cleaned) return { title: "", body: "" };
    const firstBreak = cleaned.indexOf("\n");
    if (firstBreak > -1) return { title: cleaned.slice(0, firstBreak), body: cleaned.slice(firstBreak + 1) };
    const dot = cleaned.indexOf(". ");
    if (dot > 30 && dot < 100) return { title: cleaned.slice(0, dot), body: cleaned.slice(dot + 2) };
    return { title: cleaned.slice(0, 80), body: cleaned.slice(80) };
  };

  return (
    <div>
      {/* Toolbar */}
      <style>{`.history-dd option { background-color: #464646; color: #fff; }`}</style>

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
            disabled={selected.size === 0 || bulkDeleting}
            className="h-9 rounded-[10px] bg-[#3A3A3A] hover:opacity-90 px-4 inline-flex items-center gap-2 disabled:opacity-60"
          >
            {bulkDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash className="h-4 w-4" />}
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

        <div className="text-white/70 text-sm">{viewList.length} results</div>
      </div>

      {/* List */}
      {loading && items.length === 0 ? (
        <div className="text-white flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : viewList.length === 0 ? (
        <div className="text-center py-16">
          <img src="/icons/void.png" alt="" className="mx-auto mb-6 h-40 w-auto opacity-90" />
          <p className="text-white text-xl">No smartgen history</p>
          <p className="text-white/70 mt-2">When you generate prompts, they’ll show up here.</p>
        </div>
      ) : (
        <ul className="flex flex-col items-center gap-4">
          {viewList.map((it) => {
            const created = it.createdAt ? new Date(it.createdAt) : null;
            const isFav = favorites.has(it._id);
            const { title, body } = splitTitleBody(it.text);

            const toggleSelectedOne = () =>
              setSelected((s) => {
                const n = new Set(s);
                n.has(it._id) ? n.delete(it._id) : n.add(it._id);
                return n;
              });

            return (
              <li key={it._id} className="w-full flex justify-center">
                <div className="relative w-full max-w-[1000px] rounded-[20px] border-[4px] border-[#111419] p-5 pb-20 min-h-[220px]">
                  {/* star */}
                  <button
                    onClick={() => toggleFavorite(it._id)}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10"
                    title={isFav ? "Unfavorite" : "Favorite"}
                  >
                    <Star className={`h-5 w-5 ${isFav ? "text-[#8B5CF6] fill-[#8B5CF6]" : "text-white/70"}`} />
                  </button>

                  {/* checkbox */}
                  <label className="absolute top-3 left-3 inline-flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/40 bg-transparent"
                      checked={selected.has(it._id)}
                      onChange={toggleSelectedOne}
                    />
                  </label>

                  {/* content */}
                  <div className="pl-8 pr-16">
                    {title && <div className="text-[16px] font-semibold text-white mb-1">{title}</div>}
                    <div className="text-[14px] text-white/80 whitespace-pre-wrap break-words">
                      {body || it.text}
                    </div>
                  </div>

                  {/* time */}
                  {created && (
                    <div className="absolute left-4 bottom-3 text-xs text-white/60">
                      {created.toLocaleString()}
                    </div>
                  )}

                  {/* actions */}
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <button
                      title="Delete"
                      className="h-9 w-9 rounded-full bg-[#3A3A3A] hover:bg-[#4A4A4A] flex items-center justify-center disabled:opacity-60"
                      disabled={deletingId === it._id || bulkDeleting}
                      onClick={() => delSmartgen(it._id)}
                    >
                      {deletingId === it._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      title="Copy"
                      className="h-9 px-3 rounded-[10px] bg-[#3A3A3A] hover:bg-[#4A4A4A] inline-flex items-center gap-2"
                      onClick={() =>
                        navigator.clipboard
                          .writeText(it.text)
                          .then(() =>
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
    </div>
  );
}

/* ==============================================================
   PAGE: Unified with gradient toggle
================================================================= */
/* ==============================================================
   PAGE: Unified with gradient toggle  (FIXED to read ?tab=)
================================================================= */

type TabKey = "smartgen" | "optimizer";

export default function History() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<TabKey>("smartgen");

  // read ?tab= on mount / url change
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("tab");
    if (q === "optimizer" || q === "smartgen") {
      setTab(q as TabKey);
    } else {
      // ensure URL has a tab param (optional, but nice for copy/paste links)
      navigate(`/history?tab=smartgen`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const setTabAndUrl = (next: TabKey) => {
    setTab(next);
    // keep URL in sync (no full page reload)
    navigate(`/history?tab=${next}`, { replace: true });
  };

  return (
    <div className="dark min-h-screen text-foreground" style={{ backgroundColor: "#030406" }}>
      <Header />

        <div className="container mx-auto px-4 pt-28 pb-6 md:pt-32">
        {/* Toggle (Smartgen | Prompt Optimiser) */}
        {/* <div className="flex justify-center mb-8">
          <div className="flex items-center p-1 rounded-full bg-[#0D0F12] border border-white/10 shadow-inner">
            <button
              onClick={() => setTabAndUrl("smartgen")}
              className={`px-4 sm:px-6 h-10 rounded-full text-sm sm:text-base transition-all ${
                tab === "smartgen" ? "text-white" : "text-white/80 hover:text-white"
              }`}
              style={tab === "smartgen" ? { backgroundImage: GRADIENT } : undefined}
            >
              <span className="inline-flex items-center gap-2">
                <span>🧠</span> Smartgen
              </span>
            </button>

            <button
              onClick={() => setTabAndUrl("optimizer")}
              className={`px-4 sm:px-6 h-10 rounded-full text-sm sm:text-base transition-all ${
                tab === "optimizer" ? "text-white" : "text-white/80 hover:text-white"
              }`}
              style={tab === "optimizer" ? { backgroundImage: GRADIENT } : undefined}
            >
              <span className="inline-flex items-center gap-2">
                <span>⚡</span> Prompt Optimiser
              </span>
            </button>
          </div>
        </div> */}

        {/* Headline */}
     {/* Headline ABOVE toggle */}
<div className="mt-2 mb-4 text-center">
  <h2 className="text-white text-2xl font-semibold">
    {tab === "smartgen" ? "Smartgen History" : "Prompt Optimiser History"}
  </h2>
  <p className="text-white/70 mt-1">
    {tab === "smartgen"
      ? "All detailed prompts you’ve generated"
      : "All optimiser inputs & outputs you’ve saved"}
  </p>
</div>

{/* Toggle (Smartgen | Prompt Optimiser) */}
<div className="flex justify-center mb-8">
  <div className="flex items-center p-1 rounded-full bg-[#0D0F12] border border-white/10 shadow-inner">
    <button
      onClick={() => setTabAndUrl("smartgen")}
      className={`px-4 sm:px-6 h-10 rounded-full text-sm sm:text-base transition-all ${
        tab === "smartgen" ? "text-white" : "text-white/80 hover:text-white"
      }`}
      style={tab === "smartgen" ? { backgroundImage: GRADIENT } : undefined}
    >
      <span className="inline-flex items-center gap-2">
        <span>🧠</span> Smartgen
      </span>
    </button>

    <button
      onClick={() => setTabAndUrl("optimizer")}
      className={`px-4 sm:px-6 h-10 rounded-full text-sm sm:text-base transition-all ${
        tab === "optimizer" ? "text-white" : "text-white/80 hover:text-white"
      }`}
      style={tab === "optimizer" ? { backgroundImage: GRADIENT } : undefined}
    >
      <span className="inline-flex items-center gap-2">
        <span>⚡</span> Prompt Optimiser
      </span>
    </button>
  </div>
</div>


        {/* Body */}
        {tab === "smartgen" ? <SmartgenHistoryList /> : <OptimizerHistoryList />}

        <footer className="py-8 mt-10 text-center text-sm text-muted-foreground">
          <p>© 2025 TOKUN. All rights reserved.</p>
        </footer>
      </div>

      <Footer />
    </div>
  );
}

