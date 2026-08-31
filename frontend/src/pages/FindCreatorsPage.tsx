import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { avatarFor, onAvatarError } from "@/lib/avatar";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Briefcase,
  ChevronDown,
  Clock,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Video,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CreatorCard from "@/components/CreatorCard";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { fetchSavedCreatorIds, saveCreator, unsaveCreator } from "@/lib/savedCreators";
import { getSpecializations, type SpecializationGroup } from "@/lib/freelancerApi";
import { GLASS_CARD, GLASS_PANEL } from "@/lib/glass";
import {
  browseFreelancers,
  browseSellers,
  browseServices,
  mergePeople,
  rankPeople,
  filterPeopleByRole,
  type BrowseService,
  type DirectoryPerson,
  type PeopleRole,
} from "@/lib/discoverApi";

/*
 * /find-creators — the directory.
 *
 * Two tabs over two different questions:
 *   People   — who can I hire? Freelancers and prompt sellers merged into one
 *              list, badged so the difference is visible. Clicking anyone opens
 *              their profile, which is where hiring, messaging and their
 *              services all live.
 *   Services — what can I buy right now? The fixed-scope offerings freelancers
 *              create themselves, each linking back to its author's profile.
 *
 * The two populations overlap heavily (most freelancers also sell prompts), so
 * they are merged by userId rather than listed separately — see mergePeople.
 */

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";
const GRADIENT_90 = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

/* TOP_CREATOR_THRESHOLD and the glass class strings moved out with the creator
   card — the threshold to CreatorCard (the only thing that renders that badge),
   the surfaces to lib/glass.ts so the card and this page can't drift apart on
   what a glass panel looks like. */

// How many people per page. The merge happens client-side (see discoverApi),
// so this paginates the merged list rather than the two source queries.
const PAGE_SIZE = 12;

// AVAILABILITY_LABEL went to CreatorCard with the card that prints it.

const initials = (name?: string) => (name || "U").trim().slice(0, 2).toUpperCase();


// Service covers are uploaded to Azure (absolute) but older ones may be
// API-relative paths.
const mediaUrl = (url?: string | null) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
};

type Tab = "people" | "services";

/* The person card moved to components/CreatorCard.tsx — the Saved page renders
   the same creators and was drawing its own, thinner version of this. */

/* ══════════════════════ service card ══════════════════════ */

function ServiceCard({ service }: { service: BrowseService }) {
  const navigate = useNavigate();
  const cover = mediaUrl(service.cover);
  const posterUrl = service.coverPoster ? mediaUrl(service.coverPoster) : null;

  const open = () => navigate(`/service/${service._id}`);

  return (
    <div onClick={open} className={`${GLASS_CARD} group cursor-pointer overflow-hidden`}>
      <div className="relative h-[160px] bg-black/40 overflow-hidden">
        {cover ? (
          cover.match(/\.(mp4|webm|ogg)$/i) ? (
            /* A card is a thumbnail, so it renders one.
               This used to be a bare <video preload="metadata">, and Chrome
               answers that with `Range: bytes=0-` — the whole file. Three video
               listings meant 45 MB downloaded before the tab showed anything,
               one of them a 27 MB 2160×3840 clip painted into a 160px box.

               With a poster the video file is never touched here; it loads on
               the listing page, where someone actually wants to watch it.
               Listings uploaded before posters existed still fall back to the
               video, but with preload="none" so it costs a connection, not a
               download. */
            posterUrl ? (
              <img
                src={posterUrl}
                alt={service.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={cover}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="none"
              />
            )
          ) : (
            <img
              src={cover}
              alt={service.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="w-full h-full grid place-items-center bg-white/[0.03]">
            <Briefcase className="w-7 h-7 text-white/15" />
          </div>
        )}

        <span
          className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          From ₹{service.price}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-white text-sm font-medium line-clamp-2 leading-snug">
          {service.title}
        </h3>

        <div className="flex items-center gap-2">
          <img loading="lazy" decoding="async"
            src={avatarFor(service.seller)}
            onError={onAvatarError(service.seller)}
            alt={service.seller.name}
            className="w-5 h-5 rounded-full object-cover shrink-0"
          />
          <span className="text-white/55 text-[12px] truncate">{service.seller.name}</span>
          {service.seller.verified && (
            <ShieldCheck className="w-3 h-3 shrink-0" style={{ color: "#22D3EE" }} />
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/35 pt-1 border-t border-white/[0.06]">
          <span className="truncate">
            {service.subCategory?.name || service.category?.name || "Service"}
          </span>
          {service.delivery && (
            <span className="inline-flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" />
              {service.delivery}
            </span>
          )}
        </div>

        {/* Straight to the brief.
            The card had no button at all — the only way in was clicking it,
            which read as "see more" and gave no hint that this was something
            you could actually order from here.

            Deliberately NOT labelled "Buy now". A service is not bought on the
            spot: you send a brief, the seller accepts, and payment happens on
            the card that lands in the chat (see requestToOrder in
            ServiceDetailPage). A Buy button would promise a checkout that does
            not exist, and it would be a THIRD name for one action — the detail
            page calls it "Request to order", a profile calls it "Book Now".
            This says what the press does.

            `?order=1` opens the brief on arrival, so the button saves the step
            it looks like it saves rather than landing you where a plain click
            already would. */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/service/${service._id}?order=1`);
          }}
          className="mt-1 h-9 w-full rounded-full text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: GRADIENT }}
        >
          Request to order
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════ specialization buckets ══════════════════════ */

/**
 * Five headings over the specialization catalogue.
 *
 * The filter was one flat wrap of all 41 specializations, centred. On a desktop
 * that is four dense rows you skim past; on a phone it is eight or nine, roughly
 * 350px of chips standing between the search box and the first creator — so the
 * page opened on a wall of filters and you had to scroll to discover there were
 * any people on it at all.
 *
 * The catalogue is already grouped — `models/Specialization.js` carries a
 * `group` per row and GET /api/freelancer/specializations returns them bucketed —
 * and this page was deliberately throwing that away ("the grouping is useful in
 * a picker, not here"). It turns out to be useful here too, once there are 41 of
 * them.
 *
 * WHY FIVE AND NOT THE SERVER'S EIGHT. Eight headings is still most of a phone
 * screen before anything is expanded, and three of the eight are small enough to
 * read as an afterthought next to Development's nine. These pairings are the ones
 * a person searching for a creator would not think to separate: Engineering Ops
 * is who you hire when you needed a developer, and Video & Audio sits with Design
 * because both are "someone who makes the thing look and sound right".
 *
 * AI stays on its own despite having five items. It is the reason most people are
 * on this platform, and folding it under Development would bury the one heading
 * they came to press.
 *
 * The `groups` strings must match `group` in server/constants/freelancerCatalog.js.
 * A group added there and not named here still appears — see the orphan handling
 * in `specBuckets` — so the failure mode is an extra heading, never a
 * specialization nobody can filter by.
 */
const SPEC_SUPERGROUPS: { label: string; groups: string[] }[] = [
  { label: "AI", groups: ["AI"] },
  { label: "Development", groups: ["Development", "Engineering Ops"] },
  { label: "Design & Media", groups: ["Design", "Video & Audio"] },
  { label: "Marketing & Writing", groups: ["Marketing", "Content"] },
  { label: "Business", groups: ["Business"] },
];

/* ══════════════════════ page ══════════════════════ */

const FindCreatorsPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth() as any;

  const [tab, setTab] = useState<Tab>("people");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [people, setPeople] = useState<DirectoryPerson[]>([]);
  const [services, setServices] = useState<BrowseService[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [messagingId, setMessagingId] = useState<string | null>(null);

  /* Which creators this viewer has already saved, so a card opens showing the
     truth rather than offering a save that has already happened — the same
     mistake that produced duplicate saves on the marketplace cards before the
     server grew its guard. One request for the whole page, not one per card. */
  const [savedCreatorIds, setSavedCreatorIds] = useState<Set<string>>(new Set());
  // Only the row being written shows a spinner, not every card at once.
  const [savingCreatorId, setSavingCreatorId] = useState<string | null>(null);

  // Specialization filter, for the People tab. Slug-keyed so it could be put in
  // the URL later without a lookup.
  const [specGroups, setSpecGroups] = useState<SpecializationGroup[]>([]);
  const [activeSpec, setActiveSpec] = useState<string>("");

  // Category filter, for the Services tab.
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");

  // Which population to show. Freelancers outrank prompt sellers in the default
  // ordering, so on a directory with more freelancers than fit one page a
  // prompt-only seller was effectively invisible. This makes them findable.
  const [role, setRole] = useState<PeopleRole>("all");

  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  // Filter catalogs. Both are small, static and public, so they load once and
  // are not refetched per tab switch.
  useEffect(() => {
    getSpecializations(token).then((res) => {
      if (res.ok) setSpecGroups(res.data.grouped || []);
    });

    // kind=service — the Services tab filters by what freelancers sell, not by
    // what a prompt is about. Without the parameter this returns the prompt
    // tree, and the chips would read "Coding / Content / HR / Travel".
    fetch(`${API_BASE}/api/category?kind=service`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.categories) setCategories(d.categories);
      })
      .catch(() => {
        /* the chips just don't render — the list still works unfiltered */
      });
  }, [token]);

  /* Sequence guard: a slow response from an earlier query must not overwrite a
     newer one's results. Typing "web" fires three debounced loads, and without
     this the first to return last wins. */
  const loadSeq = useRef(0);

  const load = useCallback(async () => {
    const seq = ++loadSeq.current;
    setLoading(true);
    setLoadError(null);

    if (tab === "people") {
      /* Freelancers first, and painted on their own.
         The seller list is the expensive half — GET /api/seller has no
         pagination and aggregates over the whole Prompt and Purchase
         collections. Awaiting both together (which is what this did) meant the
         page showed nothing until the slow one finished. Now the freelancers
         render as soon as they arrive and the sellers fold in behind them. */
      // Fetched in one go rather than page by page, because the two
      // populations are merged client-side (see discoverApi) and a merged list
      // can't be paginated from two independently-paged sources. Pagination
      // then happens over the merged result below. Fine at this scale; if the
      // directory ever outgrows a few hundred people this needs a real
      // server-side union.
      const freelancerRes = await browseFreelancers(
        { q: debouncedSearch, specialization: activeSpec, limit: 200 },
        token
      );
      if (seq !== loadSeq.current) return;

      const freelancers = freelancerRes.ok ? freelancerRes.data.freelancers : [];
      setPeople(rankPeople(mergePeople(freelancers, [])));
      setLoading(false);

      // A specialization is a freelancer concept — a prompt-only seller has
      // none, so that filter excludes them and there is nothing to fold in.
      if (activeSpec) {
        if (!freelancerRes.ok) setLoadError(freelancerRes.message || "Couldn't load creators.");
        return;
      }

      const sellerRes = await browseSellers(token);
      if (seq !== loadSeq.current) return;

      if (!freelancerRes.ok && !sellerRes.ok) {
        setLoadError(freelancerRes.message || "Couldn't load creators right now.");
        setPeople([]);
        return;
      }

      let sellers = sellerRes.ok ? sellerRes.data.sellers : [];

      // The seller endpoint has no search of its own, so the query is applied
      // here — otherwise typing would filter freelancers while sellers ignored it.
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        sellers = sellers.filter(
          (s) => s.name?.toLowerCase().includes(q) || s.location?.toLowerCase().includes(q)
        );
      }

      setPeople(rankPeople(mergePeople(freelancers, sellers)));
      return;
    }

    const res = await browseServices({ q: debouncedSearch, category: activeCategory }, token);
    if (seq !== loadSeq.current) return;

    if (!res.ok) {
      setLoadError(res.message || "Couldn't load services right now.");
      setServices([]);
    } else {
      setServices(res.data.services);
    }
    setLoading(false);
  }, [tab, debouncedSearch, activeSpec, activeCategory, token]);

  useEffect(() => {
    load();
  }, [load]);

  // Started on mount so the expensive seller query overlaps the first paint
  // instead of beginning after it. browseSellers caches, so this is the only
  // time it actually hits the network.
  useEffect(() => {
    void browseSellers(token);
  }, [token]);

  const handleMessage = async (person: DirectoryPerson) => {
    if (!token) {
      toast({ title: "Please log in to message creators" });
      navigate("/login");
      return;
    }
    try {
      setMessagingId(person.userId);
      const res = await fetch(`${API_BASE}/api/chat/conversation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: person.userId }),
      });
      const data = await res.json();
      if (data?.success && data.conversation) {
        navigate("/chat", { state: { conversationId: data.conversation._id } });
      } else {
        toast({ title: "Could not start conversation" });
      }
    } catch {
      toast({ title: "Could not start conversation" });
    } finally {
      setMessagingId(null);
    }
  };

  /* The five headings, filled from the server's eight groups — see
     SPEC_SUPERGROUPS. Empty buckets are dropped rather than rendered as a
     heading that opens onto nothing. */
  const specBuckets = useMemo(() => {
    const byGroup = new Map(specGroups.map((g) => [g.group, g.items]));

    const named = SPEC_SUPERGROUPS.map((sg) => ({
      label: sg.label,
      items: sg.groups.flatMap((g) => byGroup.get(g) || []),
    })).filter((b) => b.items.length > 0);

    /* Any group the map doesn't claim gets its own heading.
       Without this, adding a group to the server catalogue would silently drop
       every specialization in it from this filter — the kind of bug that is
       invisible until a creator asks why nobody can find them. An unexpected
       extra heading is a much better failure than a missing one. */
    const claimed = new Set(SPEC_SUPERGROUPS.flatMap((sg) => sg.groups));
    const orphans = specGroups
      .filter((g) => !claimed.has(g.group) && g.items.length > 0)
      .map((g) => ({ label: g.group, items: g.items }));

    return [...named, ...orphans];
  }, [specGroups]);

  /* Which heading is expanded. One at a time, and null on arrival — collapsed is
     the state that gives the page back to the creators it is meant to be
     listing. */
  const [openBucket, setOpenBucket] = useState<string | null>(null);

  /* ONCE SOMETHING IS PICKED, THE FILTER SHRINKS TO IT.
   *
   * The filter takes one value, so the moment "Frontend Development" is chosen
   * the other twelve specializations under Development are twelve chips you are
   * not looking at, and the four other headings are four more. Together that was
   * most of a phone screen still standing between the search box and the
   * creators — after the choice that was supposed to narrow things down.
   *
   * So a selection collapses the whole control to the heading it lives under and
   * the one chip, with Clear beside it. Same rule the Services tab follows.
   *
   * `activeSpec` is the only input, and Clear is the only way back — which keeps
   * this honest: there is exactly one thing on screen and it is exactly what is
   * being applied to the list below. */
  const visibleBuckets = useMemo(
    () =>
      activeSpec
        ? specBuckets.filter((b) => b.items.some((s) => s.slug === activeSpec))
        : specBuckets,
    [specBuckets, activeSpec]
  );

  /* The heading whose chips are on screen. A selection pins this to whichever
     bucket owns it — a picked filter must never be hidden inside a collapsed
     heading purely because `openBucket` says something else. */
  const expandedBucket = useMemo(
    () =>
      activeSpec
        ? visibleBuckets[0] || null
        : specBuckets.find((b) => b.label === openBucket) || null,
    [activeSpec, visibleBuckets, specBuckets, openBucket]
  );

  const expandedItems = useMemo(() => {
    if (!expandedBucket) return [];
    return activeSpec
      ? expandedBucket.items.filter((s) => s.slug === activeSpec)
      : expandedBucket.items;
  }, [expandedBucket, activeSpec]);

  const activeFilter = tab === "people" ? activeSpec : activeCategory;
  const clearFilter = () => (tab === "people" ? setActiveSpec("") : setActiveCategory(""));

  /* The Services tab keeps the flat row: nine top-level categories fit in two
     lines even on a phone, and bucketing nine things under five headings is
     ceremony rather than help. Only the People tab had 41.
   *
   * ONE CHIP ONCE ONE IS PICKED. These categories are mutually exclusive — the
   * filter takes a single value — so once you have chosen "Programming & Tech"
   * the other eight are eight rows of things you are not looking at, sitting
   * between the filter and the results. Collapsing to the chosen one (with its
   * Clear beside it) says what is applied in one line and gives the rest of the
   * screen back to the services.
   *
   * Pressing the chip still clears it — see `setChip`, which toggles — so the
   * way back to the full list is the same control that narrowed it. */
  const chips =
    tab === "people"
      ? []
      : categories
          .filter((c) => !activeCategory || c._id === activeCategory)
          .map((c) => ({ key: c._id, label: c.name }));

  /* The name of whatever is filtered, for the pill that stands in for it while
     its heading is collapsed. Nothing about the filter may become invisible just
     because the list it came from is closed. */
  const activeSpecName = useMemo(() => {
    if (tab !== "people" || !activeSpec) return "";
    for (const b of specBuckets) {
      const hit = b.items.find((s) => s.slug === activeSpec);
      if (hit) return hit.name;
    }
    return "";
  }, [tab, activeSpec, specBuckets]);

  const setChip = (key: string) => {
    if (tab === "people") setActiveSpec(activeSpec === key ? "" : key);
    else setActiveCategory(activeCategory === key ? "" : key);
  };

  /* Role filter and pagination both apply to the already-merged, already-ranked
     list, so they're derived rather than stored — no chance of the visible page
     drifting out of sync with the data behind it. */
  const rolePeople = useMemo(() => filterPeopleByRole(people, role), [people, role]);

  const count = tab === "people" ? rolePeople.length : services.length;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  // Clamped rather than reset in an effect: a filter that shrinks the list past
  // the current page would otherwise show an empty grid for one render.
  const safePage = Math.min(page, totalPages);
  const pagePeople = rolePeople.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageServices = services.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Any change to what's being listed sends the reader back to the start.
  useEffect(() => {
    setPage(1);
  }, [tab, role, debouncedSearch, activeSpec, activeCategory]);

  const goToPage = (next: number) => {
    setPage(Math.max(1, Math.min(next, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Loaded once per session, not per page of results: the set is small and the
  // ids it holds are the same whichever page of the directory you're looking at.
  useEffect(() => {
    if (!token) {
      setSavedCreatorIds(new Set());
      return;
    }
    let cancelled = false;
    fetchSavedCreatorIds(token).then((ids) => {
      if (!cancelled) setSavedCreatorIds(new Set(ids));
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  /* Save / unsave, applied to the local set immediately and rolled back if the
     server disagrees. The alternative — waiting for the round-trip — leaves the
     bookmark unfilled for long enough that the press reads as ignored, and the
     second press then undoes the first. */
  const toggleSaveCreator = useCallback(
    async (person: DirectoryPerson) => {
      const id = String(person.userId);
      if (!id || savingCreatorId === id) return;

      if (!token) {
        toast({
          title: "Sign in to save",
          description: "Saved creators are kept on your account.",
        });
        return;
      }

      const wasSaved = savedCreatorIds.has(id);
      setSavingCreatorId(id);
      setSavedCreatorIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(id);
        else next.add(id);
        return next;
      });

      const ok = wasSaved
        ? await unsaveCreator(id, token)
        : (await saveCreator(id, token, person.name)).ok;

      setSavingCreatorId(null);

      if (!ok) {
        setSavedCreatorIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(id);
          else next.delete(id);
          return next;
        });
        toast({
          title: wasSaved ? "Couldn't remove" : "Couldn't save",
          description: "Please try again.",
        });
        return;
      }

      toast({
        title: wasSaved ? "Removed from saved" : "Creator saved",
        description: wasSaved
          ? `${person.name} is no longer in your saved creators.`
          : "Find them under Creators Profile on your Saved page.",
      });
    },
    [token, savedCreatorIds, savingCreatorId]
  );

  /* Counted the same way the filter filters — see filterPeopleByRole. A
     Super Creator is someone who can actually be hired today, so a profile
     still waiting on its intro video is not one and isn't counted as one. */
  const roleCounts = useMemo(
    () => ({
      all: people.length,
      freelancers: people.filter((p) => p.isFreelancer && p.superCreator).length,
      sellers: people.filter((p) => p.isSeller).length,
    }),
    [people]
  );

  // No `overflow-x-hidden` on the root below. Setting overflow on either axis
  // makes an element a scroll container, and a `position: sticky` descendant
  // then sticks against IT rather than the viewport — which is why the header
  // wasn't sticking on this page at all. The blobs that needed clipping are
  // clipped at their own layer instead.
  return (
    <div className="dark relative min-h-screen bg-[#08080A] text-foreground">
      {/* Ambient light behind everything. Glass needs something to refract —
          on a flat background a blurred panel is indistinguishable from a grey
          one. Fixed and pointer-events-none so it never intercepts a click. */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-32 w-[560px] h-[560px] rounded-full opacity-[0.18] blur-[130px]"
          style={{ background: "#1A73E8" }}
        />
        <div
          className="absolute top-1/4 -right-40 w-[520px] h-[520px] rounded-full opacity-[0.14] blur-[130px]"
          style={{ background: "#FF14EF" }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[480px] h-[480px] rounded-full opacity-[0.10] blur-[130px]"
          style={{ background: "#22D3EE" }}
        />
      </div>

      {/* Header is `sticky top-0` on its own — see promptOptimisation.tsx. */}
      <Header />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 pb-16">
        <div className="pt-12 pb-8 text-center max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            <div
              className="flex items-center gap-2 text-[12px] font-semibold tracking-wide px-3 py-1.5 rounded-full"
              style={{
                color: "#22D3EE",
                background: "rgba(34,211,238,0.08)",
                border: "1px solid rgba(34,211,238,0.2)",
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>DISCOVER TALENT</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Find{" "}
            <span
              style={{
                background: GRADIENT_90,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Creators
            </span>
          </h1>
          <p className="text-white/50 text-sm sm:text-base">
            Creators on Tokun. Open a profile to hire, message or book them.
          </p>

          {/* The Services tab used to sit here, next to a "Freelancers" tab.
              Both are gone:

              - Services duplicated what a creator's own profile already lists,
                so the same offering was browsable in two places and only one of
                them could show it in the context of who is selling it.
              - With Services removed, a tab strip holding a single "Freelancers"
                tab is just a label that cannot be switched, so the strip goes
                too. The word itself is "Creators" everywhere now.

              The `tab` state and the services fetch/render below are left in
              place rather than deleted — `tab` stays pinned to "people", so
              those branches simply never run, and putting this strip back is all
              it takes to restore the old behaviour. */}

          <div className="relative mt-6 max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                tab === "people"
                  ? "Search by name, title or skill…"
                  : "Search services…"
              }
              className="w-full h-12 pl-11 pr-4 rounded-full text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25 bg-white/[0.05] backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors"
            />
          </div>

          {/* Which population. Prompt-only sellers rank below every freelancer
              by default, so without this they read as "not on the platform". */}
          {tab === "people" && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {(
                [
                  { id: "all", label: "Everyone" },
                  /* Labels only — the `id`s stay as they are, PeopleRole and
                     the ranking logic key off them.

                     The two tiers, named the same way the badges on the cards
                     below name them. "Creators / Product Creators" invented a
                     third and fourth term for the same two groups, and made the
                     freelancer filter look like the broader of the two when it
                     is the narrower one. */
                  { id: "freelancers", label: "Super Creators" },
                  { id: "sellers", label: "Creators" },
                ] as { id: PeopleRole; label: string }[]
              ).map((r) => {
                const active = role === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className="px-4 h-8 rounded-full text-xs font-medium transition-all backdrop-blur-xl"
                    style={
                      active
                        ? {
                            background: "rgba(255,255,255,0.12)",
                            border: "1px solid rgba(255,255,255,0.22)",
                            color: "#fff",
                          }
                        : {
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.55)",
                          }
                    }
                  >
                    {r.label}
                    {roleCounts[r.id] > 0 && (
                      <span className="ml-1.5 text-white/35">{roleCounts[r.id]}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── SPECIALIZATION FILTER (People tab) ────────────────────────────
            Three states, each showing only what it needs to:

              nothing picked, nothing open   five headings          (≤3 rows)
              a heading open                 five headings + chips
              a specialization picked        one heading + one chip  (1–2 rows)

            The last one is the point. This started as one flat wrap of all 41
            specializations — eight or nine rows of chips on a phone, standing
            between the search box and the first creator — and grouping them under
            five headings only fixed the "nothing picked" case. Picking one still
            left twelve siblings and four other headings on screen, after the
            action that was supposed to narrow things down. See visibleBuckets.

            ONE LAYOUT FOR BOTH desktop and phone. Two implementations of the same
            control is how they drift, and there is nothing here a phone needs
            that a desktop doesn't — what made the old version unusable on a
            phone was the count of things on screen, not their arrangement, so the
            same fix serves every width. */}
        {tab === "people" && specBuckets.length > 0 && (
          <div className="mb-8 space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {visibleBuckets.map((bucket) => {
                const open = expandedBucket?.label === bucket.label;
                // Holds the current filter. Distinct from `open`, and it has to
                // be: a heading you collapsed while its filter is still applied
                // must not look like every other unpressed heading.
                const holdsActive =
                  !!activeSpec && bucket.items.some((s) => s.slug === activeSpec);

                return (
                  <button
                    key={bucket.label}
                    /* While a specialization is picked this heading is the only
                       one on screen and its chips are pinned open, so there is
                       nothing for a collapse to do — pressing it releases the
                       filter and brings the other four headings back. That makes
                       it the same gesture as pressing the chip itself, which is
                       what someone reaches for to undo a choice. */
                    onClick={() => {
                      if (holdsActive) {
                        clearFilter();
                        setOpenBucket(bucket.label);
                        return;
                      }
                      setOpenBucket(open ? null : bucket.label);
                    }}
                    aria-expanded={open}
                    className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: holdsActive
                        ? "rgba(26,115,232,0.18)"
                        : open
                          ? "rgba(255,255,255,0.10)"
                          : "rgba(255,255,255,0.04)",
                      border: `1px solid ${
                        holdsActive
                          ? "#1A73E8"
                          : open
                            ? "rgba(255,255,255,0.22)"
                            : "rgba(255,255,255,0.08)"
                      }`,
                      color: holdsActive || open ? "#fff" : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {bucket.label}
                    {/* The count is a reason to open a heading. Once one of its
                        specializations is applied it is answering a question
                        nobody is asking any more. */}
                    {!holdsActive && (
                      <span className="text-white/35">{bucket.items.length}</span>
                    )}
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                );
              })}
            </div>

            {/* The applied filter, while its heading is closed. The whole point
                of collapsing is that you stop looking at the list — so the one
                thing that must survive being closed is what it is currently
                doing to the results. */}
            {activeSpecName && !expandedBucket && (
              <div className="flex justify-center">
                <button
                  onClick={clearFilter}
                  className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs text-white"
                  style={{ background: "rgba(26,115,232,0.18)", border: "1px solid #1A73E8" }}
                >
                  {activeSpecName}
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {expandedItems.length > 0 && (
              <div
                className="flex flex-wrap items-center justify-center gap-2 rounded-2xl p-3"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {activeSpec && (
                  <button
                    onClick={clearFilter}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white"
                    style={{ background: "rgba(255,255,255,0.10)" }}
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                )}
                {expandedItems.map((s) => {
                  const active = activeSpec === s.slug;
                  return (
                    <button
                      key={s.slug}
                      onClick={() => setActiveSpec(active ? "" : s.slug)}
                      title={s.description || undefined}
                      className="px-3 py-1.5 rounded-full text-xs transition-all"
                      style={{
                        background: active ? "rgba(26,115,232,0.18)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${active ? "#1A73E8" : "rgba(255,255,255,0.08)"}`,
                        color: active ? "#fff" : "rgba(255,255,255,0.6)",
                      }}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Services tab — still the flat row. Nine categories, two lines. */}
        {chips.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
            {activeFilter && (
              <button
                onClick={clearFilter}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white"
                style={{ background: "rgba(255,255,255,0.10)" }}
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
            {chips.map((chip) => {
              const active = activeFilter === chip.key;
              return (
                <button
                  key={chip.key}
                  onClick={() => setChip(chip.key)}
                  className="px-3 py-1.5 rounded-full text-xs transition-all"
                  style={{
                    background: active ? "rgba(26,115,232,0.18)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? "#1A73E8" : "rgba(255,255,255,0.08)"}`,
                    color: active ? "#fff" : "rgba(255,255,255,0.6)",
                  }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        )}

        {!loading && !loadError && count > 0 && (
          <p className="text-center text-white/35 text-xs mb-6">
            {count} {tab === "people" ? "creator" : "service"}
            {count === 1 ? "" : "s"}
            {activeFilter || debouncedSearch ? " matching" : " available"}
            {totalPages > 1 && ` · page ${safePage} of ${totalPages}`}
          </p>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[280px] rounded-2xl animate-pulse"
                style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.06)" }}
              />
            ))}
          </div>
        )}

        {!loading && loadError && (
          <div className="text-center py-16">
            <p className="text-white/50 text-sm mb-4">{loadError}</p>
            <button
              onClick={load}
              className="px-5 py-2.5 rounded-full text-sm font-medium text-white"
              style={{ background: GRADIENT }}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !loadError && count === 0 && (
          <div className="text-center py-16">
            <p className="text-white/50 text-sm">
              {debouncedSearch || activeFilter
                ? "Nothing matched. Try a different search or clear the filter."
                : tab === "people"
                ? "No creators yet."
                : "No services listed yet."}
            </p>
            {(debouncedSearch || activeFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  clearFilter();
                }}
                className="mt-4 px-5 py-2.5 rounded-full text-sm text-white/80 border border-white/15 hover:border-white/30 transition-colors"
              >
                Clear search and filters
              </button>
            )}
          </div>
        )}

        {!loading && !loadError && tab === "people" && pagePeople.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {pagePeople.map((person) => (
              <CreatorCard
                key={person.userId}
                person={person}
                onMessage={handleMessage}
                messaging={messagingId === person.userId}
                saved={savedCreatorIds.has(String(person.userId))}
                savingSave={savingCreatorId === String(person.userId)}
                onToggleSave={toggleSaveCreator}
              />
            ))}
          </div>
        )}

        {!loading && !loadError && tab === "services" && pageServices.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {pageServices.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}

        {!loading && !loadError && totalPages > 1 && (
          <div className={`${GLASS_PANEL} mt-10 mx-auto w-fit flex items-center gap-1 p-1.5`}>
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="h-9 px-3 rounded-full text-xs font-medium text-white/70 hover:bg-white/[0.08] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              ← Prev
            </button>

            {/* A window around the current page rather than every page number —
                on a long list the full run wraps and stops being scannable. */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (n) => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1
              )
              .map((n, idx, shown) => (
                <span key={n} className="flex items-center">
                  {/* A gap in the sequence means pages were skipped. */}
                  {idx > 0 && n - shown[idx - 1] > 1 && (
                    <span className="px-1.5 text-white/25 text-xs">…</span>
                  )}
                  <button
                    onClick={() => goToPage(n)}
                    className="min-w-9 h-9 px-2.5 rounded-full text-xs font-semibold transition-all"
                    style={
                      n === safePage
                        ? { background: GRADIENT, color: "#fff" }
                        : { color: "rgba(255,255,255,0.55)" }
                    }
                  >
                    {n}
                  </button>
                </span>
              ))}

            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="h-9 px-3 rounded-full text-xs font-medium text-white/70 hover:bg-white/[0.08] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <div className="relative z-10 mt-4">
        <Footer />
      </div>
    </div>
  );
};

export default FindCreatorsPage;
