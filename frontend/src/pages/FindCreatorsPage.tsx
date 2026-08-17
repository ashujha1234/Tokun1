import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { avatarFor, onAvatarError } from "@/lib/avatar";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Briefcase,
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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { getSpecializations, type SpecializationGroup } from "@/lib/freelancerApi";
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

const TOP_CREATOR_THRESHOLD = 5; // totalSoldPrompts

/* Glass, done once so every surface on the page agrees.
   The three ingredients that make it read as glass rather than as a grey box:
   a translucent fill (so the ambient glow behind it shows through), a real
   backdrop blur, and a top-edge highlight — the inset white shadow — which is
   what suggests a lit edge. Without that last one it just looks foggy. */
const GLASS_CARD =
  "rounded-2xl border border-white/[0.08] bg-white/[0.035] backdrop-blur-xl " +
  "shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "transition-all duration-300 hover:-translate-y-1 hover:border-white/20 " +
  "hover:bg-white/[0.06] hover:shadow-[0_16px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.10)]";

const GLASS_PANEL =
  "rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

// How many people per page. The merge happens client-side (see discoverApi),
// so this paginates the merged list rather than the two source queries.
const PAGE_SIZE = 12;

const AVAILABILITY_LABEL: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  occasional: "Occasional",
};

const initials = (name?: string) => (name || "U").trim().slice(0, 2).toUpperCase();


// Service covers are uploaded to Azure (absolute) but older ones may be
// API-relative paths.
const mediaUrl = (url?: string | null) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
};

type Tab = "people" | "services";

/* ══════════════════════ person card ══════════════════════ */

function PersonCard({
  person,
  onMessage,
  messaging,
}: {
  person: DirectoryPerson;
  onMessage: (person: DirectoryPerson) => void;
  messaging: boolean;
}) {
  const navigate = useNavigate();
  const isTopCreator = person.totalSoldPrompts >= TOP_CREATOR_THRESHOLD;
  const openProfile = () => navigate(`/profile/${person.userId}`);

  /* Two independent things have to be true before a hire can happen, and the
     card states both rather than only discovering them at the proposal:

       payoutReady  — Razorpay has ACTIVATED their account. Money for a hire is
                      routed there and held, so a proposal to an unverified
                      account is a dead end.
       superCreator — their intro video is approved (or they're allowlisted).
                      POST /api/hire/create-proposal refuses otherwise.

     Message stays available in both cases: a client should still be able to
     talk to someone who's mid-setup. */
  const videoPending = person.isFreelancer && !person.superCreator;
  const payoutPending = person.isFreelancer && !person.payoutReady;
  const canHire = person.isFreelancer && person.payoutReady && person.superCreator;
  const hireBlocked = videoPending || payoutPending;

  return (
    <div className={`${GLASS_CARD} group relative flex flex-col`}>
      {/* Gradient wash that only shows on hover — gives the glass something to
          refract instead of sitting flat. */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(255,20,239,0.10) 0%, rgba(26,115,232,0.06) 45%, transparent 75%)",
        }}
      />

      <div className="relative p-5 flex flex-col gap-4 flex-1">
        {/* Identity — the whole block is the link to the profile, which is where
            hiring, messaging and their services all live. */}
        <div className="flex items-start gap-3 cursor-pointer" onClick={openProfile}>
          <div className="relative shrink-0">
            <img
              src={avatarFor(person)}
              onError={onAvatarError(person)}
              alt={person.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
            {person.verified && (
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full grid place-items-center"
                style={{ background: "#0B0B0B" }}
                title="Identity verified"
              >
                <ShieldCheck className="w-3 h-3" style={{ color: "#22D3EE" }} />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-semibold text-[15px] truncate">{person.name}</span>
              {/* Wrapped rather than putting `title` on the icon — lucide
                  components don't forward it. */}
              {person.hasIntroVideo && (
                <span className="shrink-0" title="Has an intro video">
                  <Video className="w-3.5 h-3.5 text-white/30" />
                </span>
              )}
            </div>

            {/* Falls back to the tier name — a prompt seller has no
                professional title, and inventing one would be a lie. It was
                "Product creator", a third name for a group the badges already
                call Creators. Not repeated for a Super Creator: the badge
                directly below says that, and saying it twice on one card reads
                as a rendering bug. */}
            <p className="text-white/45 text-[12px] truncate">
              {person.professionalTitle || (person.isSeller && !person.isFreelancer ? "Creator" : "")}
            </p>

            {person.location && (
              <p className="text-white/30 text-[11px] truncate inline-flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 shrink-0" />
                {person.location}
              </p>
            )}
          </div>
        </div>

        {/* What kind of account this is. Both badges appear when both are true. */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* The gradient badge is the claim "this person can be hired right
              now", so it is spent only on someone the server agrees with. A
              live profile whose video isn't approved yet is still a real
              creator — it just reads flat until they're cleared, and the
              pending state below says why. */}
          {/* Said only where it's true. Wearing it on a profile that can't be
              hired is what made the directory claim five Super Creators when
              one person could actually take work — the badge, the filter count
              and the Hire button now all read the same flag. Someone still
              waiting gets the amber chip below instead, which names the tier
              and the fact that they haven't reached it yet. */}
          {person.isFreelancer && person.superCreator && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-white"
              style={{ background: GRADIENT }}
            >
              <Briefcase className="w-3 h-3" />
              SUPER CREATOR
            </span>
          )}
          {person.isSeller && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}
            >
              <Sparkles className="w-3 h-3" />
              {/* `isSeller` is the data flag; PRODUCTS is what we call it. */}
              PRODUCTS
            </span>
          )}
          {isTopCreator && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
              style={{ background: "rgba(255,211,77,0.12)", color: "#FFD34D" }}
            >
              <Award className="w-3 h-3" />
              TOP
            </span>
          )}
          {/* Stated on the card rather than only on a disabled button, so a
              client understands the gap before clicking anything.

              Deliberately vague about which state the video is in: NONE,
              PENDING and REJECTED are all "not cleared" to a client, and
              spelling out a rejection would leak a moderation decision about
              someone else. Same wording the proposal endpoint uses. */}
          {videoPending && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: "rgba(250,188,78,0.10)", color: "#FABC4E" }}
              title="This creator isn't approved to take on work yet"
            >
              <Clock className="w-3 h-3" />
              SUPER CREATOR PENDING
            </span>
          )}
          {payoutPending && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: "rgba(250,188,78,0.10)", color: "#FABC4E" }}
              title="Their payout account is still being verified, so they can't take paid work yet"
            >
              <Clock className="w-3 h-3" />
              SETTING UP PAYOUTS
            </span>
          )}
        </div>

        {/* Specializations, then skills. Both are cut short — a card is a
            summary, and the profile has the full list. */}
        {person.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {person.specializations.slice(0, 2).map((spec) => (
              <span
                key={spec._id}
                className="px-2 py-1 rounded-md text-[11px] text-white/80"
                style={{
                  background: "rgba(26,115,232,0.12)",
                  border: "1px solid rgba(26,115,232,0.25)",
                }}
              >
                {spec.name}
              </span>
            ))}
            {person.specializations.length > 2 && (
              <span className="px-2 py-1 rounded-md text-[11px] text-white/40">
                +{person.specializations.length - 2}
              </span>
            )}
          </div>
        )}

        {person.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {person.skills.slice(0, 4).map((skill) => (
              <span
                key={skill.slug}
                className="px-2 py-1 rounded-md text-[11px] text-white/55 bg-white/[0.04] border border-white/[0.07]"
              >
                {skill.name}
              </span>
            ))}
            {person.skillCount > 4 && (
              <span className="px-2 py-1 rounded-md text-[11px] text-white/35">
                +{person.skillCount - 4}
              </span>
            )}
          </div>
        )}

        {/* Facts, and only the ones that exist. An empty row is worse than none. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-auto text-[11px]">
          {person.hourlyRate != null && (
            <span className="text-white/70">
              from <span className="text-white font-semibold">₹{person.hourlyRate}</span>/hr
            </span>
          )}
          {person.availability && (
            <span className="text-white/40 inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {AVAILABILITY_LABEL[person.availability]}
            </span>
          )}
          {person.rating > 0 && (
            <span className="text-white/40 inline-flex items-center gap-1">
              <Star className="w-3 h-3" style={{ color: "#FFD34D" }} />
              {person.rating.toFixed(1)}
              {person.reviewsCount > 0 && ` (${person.reviewsCount})`}
            </span>
          )}
          {person.totalUploadedPrompts > 0 && (
            <span className="text-white/40">
              {/* "product", not "prompt" — the API field name stays
                  totalUploadedPrompts; only the wording changes. */}
              {person.totalUploadedPrompts} product{person.totalUploadedPrompts === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>

      <div className="relative flex items-center gap-2 px-5 pb-5">
        <button
          onClick={() => onMessage(person)}
          disabled={messaging}
          className="flex-1 h-9 rounded-full flex items-center justify-center gap-1.5 text-[12px] font-medium text-white transition-colors disabled:opacity-50 bg-white/[0.06] border border-white/10 hover:bg-white/[0.12] backdrop-blur-sm"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Message
        </button>

        {/* Disabled, not hidden. Hiding it would leave a client wondering
            whether this person takes custom work at all; a disabled button with
            a reason answers that. */}
        {hireBlocked ? (
          <button
            type="button"
            disabled
            title={
              videoPending
                ? "This creator isn't approved to take on work yet. You can still message them."
                : "This creator is still setting up payouts, so they can't take paid work yet. You can still message them."
            }
            className="flex-1 h-9 rounded-full flex items-center justify-center gap-1.5 text-[12px] font-semibold text-white/35 bg-white/[0.04] border border-white/[0.07] cursor-not-allowed"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Can't hire yet
          </button>
        ) : (
          <button
            onClick={openProfile}
            className="flex-1 h-9 rounded-full flex items-center justify-center gap-1.5 text-[12px] font-semibold text-white"
            style={{ background: GRADIENT }}
          >
            <Briefcase className="w-3.5 h-3.5" />
            {canHire ? "Hire" : "View profile"}
          </button>
        )}
      </div>
    </div>
  );
}

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
          <img
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
      </div>
    </div>
  );
}

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

  // Flattened for the chip row — the grouping is useful in a picker, not here.
  const allSpecializations = useMemo(
    () => specGroups.flatMap((g) => g.items),
    [specGroups]
  );

  const activeFilter = tab === "people" ? activeSpec : activeCategory;
  const clearFilter = () => (tab === "people" ? setActiveSpec("") : setActiveCategory(""));

  const chips =
    tab === "people"
      ? allSpecializations.map((s) => ({ key: s.slug, label: s.name }))
      : categories.map((c) => ({ key: c._id, label: c.name }));

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

        {/* Filter chips */}
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
              <PersonCard
                key={person.userId}
                person={person}
                onMessage={handleMessage}
                messaging={messagingId === person.userId}
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
