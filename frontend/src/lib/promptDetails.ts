import type { MarketplacePrompt } from "@/components/DetailsPrompt";

/**
 * Loads one listing in the shape DetailsPrompt wants.
 *
 * Places that hold a *partial* record of a product — the cart, a saved
 * reference — can't fill that panel from what they have: the cart row carries a
 * title, a price and a thumbnail, and nothing about rating, seller or the
 * one-time/sold state the panel decides its whole footer from. So the id is
 * traded for the full document rather than the panel being fed zeroes, which
 * would render as a real "0 stars" next to a real title.
 *
 * `/public/:id` is deliberate: it is unauthenticated and strips `promptText`,
 * so opening the panel can never leak the prompt body for something unowned.
 */
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const abs = (u?: string | null) =>
  u ? (String(u).startsWith("http") ? String(u) : `${API_BASE}${u}`) : undefined;

/** Maps the server's Prompt document onto the panel's own narrower interface. */
export const toMarketplacePrompt = (doc: any): MarketplacePrompt | null => {
  if (!doc || typeof doc !== "object") return null;

  const att = doc.attachment || null;
  const mediaPath = abs(att?.path);

  return {
    id: String(doc._id || doc.id || ""),
    title: doc.title || "Untitled",
    description: doc.description || "",
    // The seller's list price, with tokun_price kept separate — the panel
    // itemises the platform fee between them.
    price: typeof doc.price === "number" ? doc.price : 0,
    tokunPrice:
      typeof doc.tokun_price === "number" && doc.tokun_price > 0 ? doc.tokun_price : undefined,
    /* Buyer reviews. `averageRating` is the legacy embedded field kept only so
       an old row carrying a value doesn't lose it. */
    rating:
      typeof doc.reviewAverage === "number" && doc.reviewAverage > 0
        ? doc.reviewAverage
        : typeof doc.averageRating === "number"
          ? doc.averageRating
          : 0,
    downloads: typeof doc.salesCount === "number" ? doc.salesCount : 0,
    category: doc.categories?.[0]?.name || "General",
    imageUrl: att?.type === "image" ? mediaPath : undefined,
    // The 8s/720p cut when one exists — the original can be a 56MB 4K file, and
    // this panel is a preview, not the download.
    videoUrl: att?.type === "video" ? abs(att?.previewUrl) || mediaPath : undefined,
    // Never present from /public/:id, which strips it. Listed so the field is
    // explicit rather than accidentally absent.
    fullPrompt: doc.promptText || undefined,
    uploaderId: doc.userId?._id ? String(doc.userId._id) : undefined,
    exclusive: !!doc.exclusive,
    sold: !!doc.sold,
    sellerVerificationPending: !!doc.sellerVerificationPending,
  };
};

export const fetchPromptDetails = async (id: string): Promise<MarketplacePrompt | null> => {
  try {
    const res = await fetch(`${API_BASE}/api/prompt/public/${encodeURIComponent(id)}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success || !data.prompt) return null;
    return toMarketplacePrompt(data.prompt);
  } catch {
    return null;
  }
};
