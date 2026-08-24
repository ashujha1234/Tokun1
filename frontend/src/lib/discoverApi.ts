/**
 * Data layer for /find-creators — the directory of people and what they sell.
 *
 * "People" is a merge of two populations that overlap:
 *   - freelancers (an ACTIVE FreelancerProfile), who take custom work
 *   - prompt sellers (anyone who has uploaded a prompt), who sell prompts
 * Plenty of accounts are both, and the same person must never appear twice, so
 * the two lists are merged by userId here rather than concatenated.
 *
 * The merge is client-side on purpose. The two populations live in different
 * collections with different ranking signals, and a server-side union would
 * either need a denormalised directory table or a slow $lookup on every page
 * load. At this scale one extra request is cheaper than either.
 */

const API_BASE = (
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

export interface DirectorySkill {
  name: string;
  slug: string;
}

export interface DirectorySpecialization {
  _id: string;
  name: string;
  slug: string;
}

/** A freelancer as returned by GET /api/freelancer/browse. */
export interface BrowseFreelancer {
  userId: string;
  name: string;
  avatar: string | null;
  verified: boolean;
  professionalTitle: string;
  country: string;
  city: string;
  skills: DirectorySkill[];
  skillCount: number;
  specializations: DirectorySpecialization[];
  hourlyRate: number | null;
  availability: "full_time" | "part_time" | "occasional" | null;
  hasIntroVideo: boolean;
  /**
   * Cleared to sell services and take hire work — an admin-approved intro
   * video, or an allowlisted account. The server refuses both actions without
   * it, so the card must not present them as available.
   */
  superCreator: boolean;
  activatedAt: string | null;
  /** Razorpay has ACTIVATED their payout account, so a hire can actually pay out. */
  payoutReady: boolean;
}

/** A prompt seller as returned by GET /api/seller. */
export interface BrowseSeller {
  _id: string;
  name: string;
  avatar: string | null;
  verified: boolean;
  rating: number;
  reviewsCount: number;
  totalUploadedPrompts: number;
  totalSoldPrompts: number;
  location: string | null;
}

/** The merged row a directory card renders. */
export interface DirectoryPerson {
  userId: string;
  name: string;
  avatar: string | null;
  verified: boolean;
  /** Both can be true — most established accounts are. */
  isFreelancer: boolean;
  isSeller: boolean;
  professionalTitle: string;
  location: string;
  skills: DirectorySkill[];
  skillCount: number;
  specializations: DirectorySpecialization[];
  hourlyRate: number | null;
  availability: BrowseFreelancer["availability"];
  hasIntroVideo: boolean;
  /**
   * Cleared to sell services and take hire work. False while their intro video
   * is unapproved (and they aren't allowlisted) — the service and proposal
   * endpoints both refuse in that state, so the card badges and Hire button
   * follow it rather than assuming every live profile can trade.
   *
   * Meaningless for prompt-only sellers, who sell nothing gated by it.
   */
  superCreator: boolean;
  rating: number;
  reviewsCount: number;
  totalUploadedPrompts: number;
  totalSoldPrompts: number;
  /**
   * Can a hire proposal to this person actually be paid?
   *
   * False while their Razorpay linked account is unverified — money for a hire
   * is routed there and held, so a proposal they can't accept is a dead end.
   * The card disables Hire on this (but never Message: a client should still be
   * able to talk to someone who's mid-verification).
   *
   * Meaningless for prompt-only sellers, who are never hired.
   */
  payoutReady: boolean;
}

export interface BrowseService {
  _id: string;
  title: string;
  description: string;
  price: number;
  delivery: string;
  revisions: string;
  cover: string | null;
  /** Still frame, set when `cover` is a video. Lets a card skip the video file. */
  coverPoster?: string | null;
  category: { _id: string; name: string } | null;
  subCategory: { _id: string; name: string } | null;
  seller: { userId: string; name: string; avatar: string | null; verified: boolean };
  createdAt: string;
}

export interface DiscoverResult<T> {
  ok: boolean;
  data: T;
  message?: string;
}

async function get<T>(path: string, token?: string | null): Promise<DiscoverResult<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json().catch(() => ({} as any));

    if (!res.ok || data?.success === false) {
      return {
        ok: false,
        data: undefined as unknown as T,
        message: data?.message || "Couldn't load right now.",
      };
    }
    return { ok: true, data: data as T };
  } catch {
    return {
      ok: false,
      data: undefined as unknown as T,
      message: "Couldn't reach the server. Check your connection.",
    };
  }
}

export function browseFreelancers(
  params: {
    q?: string;
    specialization?: string;
    page?: number;
    limit?: number;
    /**
     * These people specifically, unpaged — for the Saved page, which needs the
     * directory's own rows for the creators someone saved. Filtering a page of
     * this endpoint can't do it: the server caps a page at 60, so a saved
     * creator further down the list would quietly not appear.
     */
    ids?: string[];
  } = {},
  token?: string | null
) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.specialization) search.set("specialization", params.specialization);
  // Set even when empty: the server reads a present-but-empty `ids` as "nobody",
  // which is the right answer for a saved list with nothing in it.
  if (params.ids) search.set("ids", params.ids.join(","));
  search.set("page", String(params.page ?? 1));
  search.set("limit", String(params.limit ?? 48));

  return get<{ freelancers: BrowseFreelancer[]; total: number; page: number; pages: number }>(
    `/api/freelancer/browse?${search}`,
    token
  );
}

export function browseServices(
  params: { q?: string; category?: string; page?: number; limit?: number } = {},
  token?: string | null
) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  search.set("page", String(params.page ?? 1));
  search.set("limit", String(params.limit ?? 48));

  return get<{ services: BrowseService[]; total: number; page: number; pages: number }>(
    `/api/services/browse?${search}`,
    token
  );
}

/* The seller list is cached for the tab's lifetime.
   GET /api/seller?limit=0 is the heaviest call this page makes: it has no
   pagination and aggregates over the whole Prompt and Purchase collections to
   compute per-seller upload and sales counts. The directory then filters the
   result client-side anyway — so refetching it on every debounced keystroke,
   tab switch and filter change (which is what happened) meant paying for a
   full-collection pass to narrow a list already in memory.
   `force` is there for a deliberate refresh; nothing needs it yet. */
let sellersCache: BrowseSeller[] | null = null;
let sellersInflight: Promise<DiscoverResult<{ sellers: BrowseSeller[] }>> | null = null;

export function browseSellers(token?: string | null, opts: { force?: boolean } = {}) {
  if (!opts.force) {
    if (sellersCache) {
      return Promise.resolve<DiscoverResult<{ sellers: BrowseSeller[] }>>({
        ok: true,
        data: { sellers: sellersCache },
      });
    }
    // Concurrent callers share one request rather than firing several.
    if (sellersInflight) return sellersInflight;
  }

  sellersInflight = get<{ sellers: BrowseSeller[] }>(`/api/seller?limit=0`, token).then((res) => {
    sellersInflight = null;
    // Only a success is cached — caching a failure would pin an empty
    // directory for the rest of the session.
    if (res.ok && Array.isArray(res.data?.sellers)) sellersCache = res.data.sellers;
    return res;
  });

  return sellersInflight;
}

/** Drops the cached seller list, e.g. after something changes it. */
export function clearSellersCache() {
  sellersCache = null;
  sellersInflight = null;
}

/**
 * Merges the two populations into one list of people.
 *
 * Freelancers are seeded first so their richer fields (title, skills, rate) win,
 * then sellers either enrich an existing row or add a new one. A person who is
 * both appears once, badged as both.
 */
export function mergePeople(
  freelancers: BrowseFreelancer[],
  sellers: BrowseSeller[]
): DirectoryPerson[] {
  const byId = new Map<string, DirectoryPerson>();

  for (const f of freelancers) {
    byId.set(f.userId, {
      userId: f.userId,
      name: f.name,
      avatar: f.avatar,
      verified: f.verified,
      isFreelancer: true,
      isSeller: false,
      professionalTitle: f.professionalTitle,
      location: [f.city, f.country].filter(Boolean).join(", "),
      skills: f.skills,
      skillCount: f.skillCount,
      specializations: f.specializations,
      hourlyRate: f.hourlyRate,
      availability: f.availability,
      hasIntroVideo: f.hasIntroVideo,
      superCreator: Boolean(f.superCreator),
      rating: 0,
      reviewsCount: 0,
      totalUploadedPrompts: 0,
      totalSoldPrompts: 0,
      payoutReady: Boolean(f.payoutReady),
    });
  }

  for (const s of sellers) {
    // The seller endpoint lists everyone who has ever uploaded, including
    // people with nothing live. They aren't worth a card on their own, but if
    // they're also a freelancer their row still gets the prompt stats below.
    const existing = byId.get(s._id);

    if (existing) {
      existing.isSeller = true;
      existing.rating = s.rating || 0;
      existing.reviewsCount = s.reviewsCount || 0;
      existing.totalUploadedPrompts = s.totalUploadedPrompts || 0;
      existing.totalSoldPrompts = s.totalSoldPrompts || 0;
      // The freelancer profile's own location is more specific (city + country)
      // than User.location, so it is only used as a fallback.
      if (!existing.location && s.location) existing.location = s.location;
      continue;
    }

    if (!(s.totalUploadedPrompts > 0)) continue;

    byId.set(s._id, {
      userId: s._id,
      name: s.name,
      avatar: s.avatar,
      verified: s.verified,
      isFreelancer: false,
      isSeller: true,
      professionalTitle: "",
      location: s.location || "",
      skills: [],
      skillCount: 0,
      specializations: [],
      hourlyRate: null,
      availability: null,
      hasIntroVideo: false,
      // Not a freelancer, so nothing on their card is gated by the video rule.
      superCreator: false,
      rating: s.rating || 0,
      reviewsCount: s.reviewsCount || 0,
      totalUploadedPrompts: s.totalUploadedPrompts || 0,
      totalSoldPrompts: s.totalSoldPrompts || 0,
      // A prompt-only seller is never hired, so this is moot for them — false
      // rather than true so nothing renders a Hire affordance by accident.
      payoutReady: false,
    });
  }

  return [...byId.values()];
}

/**
 * Which side of the directory a row belongs to.
 *
 * The two populations overlap heavily, and merging them means a prompt-only
 * seller lands below every freelancer in the default ranking — on a directory
 * with more freelancers than fit a page, that reads as "prompt sellers aren't
 * here at all". An explicit filter is what makes them findable.
 */
export type PeopleRole = "all" | "freelancers" | "sellers";

export function filterPeopleByRole(people: DirectoryPerson[], role: PeopleRole) {
  /* Super Creator means "can be hired for custom work right now", not "has
     filled in a profile". A profile whose intro video hasn't been approved
     can't be hired at all — the proposal endpoint refuses — so listing it here
     would answer the buyer's question wrongly. Those people are still in
     "Everyone", where the card says plainly what they're waiting on. */
  if (role === "freelancers") return people.filter((p) => p.isFreelancer && p.superCreator);
  // Anyone who sells prompts, including freelancers who also do — "show me
  // people I can buy a prompt from" is the question, and excluding freelancers
  // would answer a different one.
  if (role === "sellers") return people.filter((p) => p.isSeller);
  return people;
}

/**
 * Directory ordering.
 *
 * Freelancers first — this page's purpose is hiring, and someone who has said
 * "I take custom work" is a better answer to that than someone who happens to
 * have uploaded a prompt. Within each group, evidence of real activity wins.
 */
export function rankPeople(people: DirectoryPerson[]): DirectoryPerson[] {
  return [...people].sort((a, b) => {
    if (a.isFreelancer !== b.isFreelancer) return a.isFreelancer ? -1 : 1;

    const sold = (b.totalSoldPrompts || 0) - (a.totalSoldPrompts || 0);
    if (sold) return sold;

    const rating = (b.rating || 0) - (a.rating || 0);
    if (rating) return rating;

    // Between two equal ratings, the one more people rated is the safer bet.
    const reviews = (b.reviewsCount || 0) - (a.reviewsCount || 0);
    if (reviews) return reviews;

    const uploads = (b.totalUploadedPrompts || 0) - (a.totalUploadedPrompts || 0);
    if (uploads) return uploads;

    // Name last, purely so the order is stable across reloads.
    return (a.name || "").localeCompare(b.name || "");
  });
}


/* ─────────────────── service detail ─────────────────── */

export interface ServiceDetail {
  _id: string;
  title: string;
  description: string;
  price: number;
  delivery: string;
  revisions: string;
  /** What the buyer gets, written by the seller. Empty on older services. */
  deliverables: string[];
  screens: string;
  prototype: string;
  fileType: string;
  media: string[];
  status: "draft" | "published";
  category: { _id: string; name: string } | null;
  subCategory: { _id: string; name: string } | null;
  /** The sub-category's parent, so the breadcrumb can read parent → child. */
  parentCategory: { name: string } | null;
  createdAt: string;
}

export interface ServiceSeller {
  userId: string;
  name: string;
  avatar: string | null;
  verified: boolean;
  suspended: boolean;
  location: string | null;
  memberSince: string;
  rating: number;
  reviewsCount: number;
  /** False for a prompt-only seller — the title and rate lines are then absent. */
  isFreelancer: boolean;
  /** Cleared to sell services and be hired: approved intro video, or allowlisted. */
  superCreator: boolean;
  professionalTitle: string;
  languages: { name: string; level: string }[];
  hourlyRate: number | null;
  availability: "full_time" | "part_time" | "occasional" | null;
  freelancerLocation: string;
}

export interface ServiceDetailPayload {
  service: ServiceDetail;
  seller: ServiceSeller;
  otherServices: {
    _id: string;
    title: string;
    price: number;
    delivery: string;
    cover: string | null;
  }[];
}

export function getServiceDetail(serviceId: string, token?: string | null) {
  return get<ServiceDetailPayload>(`/api/services/${serviceId}`, token);
}

/** Resolves an API-relative upload path against the API origin. */
export function serviceMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}
