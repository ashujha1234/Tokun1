/**
 * One answer to "what goes in this person's <img src>?", used everywhere.
 *
 * There were three separate answers before this, and they disagreed:
 *
 *   FindCreatorsPage   `person.avatar || pravatar.cc/200?u=<userId>`
 *   ServiceDetailPage  `seller.avatar || pravatar.cc/200?u=<userId>`
 *   ChatPage           `getAvatarUrl(user.avatar) || pravatar.cc/150?u=<_id||id||email||name>`
 *
 * Two things went wrong with that.
 *
 * The placeholder differed per screen. Each copy seeded i.pravatar.cc from a
 * different chain of fields, so the same person got one stranger's face in Find
 * Creators and a different one in chat — whichever field that screen's API
 * happened to send. It also made every avatar on the page a request to a
 * third-party host, for a photo of somebody who isn't the user.
 *
 * And the uploaded photo resolved differently. Chat prefixed API-relative paths
 * with the API host; Find Creators used the raw value, so an avatar stored as
 * `/uploads/…` simply didn't load there — the photo somebody had uploaded looked
 * like it had vanished on that screen.
 *
 * So: one field chain, one seed chain, and a placeholder generated locally as an
 * SVG data URI — the person's initials on a colour derived from their id. No
 * network, nothing to fail, and identical on every screen forever. An initial is
 * also honest about being a placeholder, which a photograph of a stranger never
 * was.
 */

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

/* The palette placeholders are drawn from. Muted enough to sit under white
   initials at any size, and picked by hash so a given person keeps their colour
   across every screen and every reload. */
const COLORS = [
  "#7C3AED", "#1A73E8", "#DB2777", "#0891B2", "#7E22CE",
  "#C026D3", "#2563EB", "#0D9488", "#9333EA", "#E11D48",
];

/** Any shape the various endpoints hand us for a person. */
type Personish = {
  avatarUrl?: string | null;
  avatar?: string | null;
  _id?: string | null;
  id?: string | null;
  userId?: string | null;
  email?: string | null;
  name?: string | null;
} | null | undefined;

/* Stable across screens BECAUSE the order is fixed here rather than written out
   per call site — that ordering was the bug. */
function seedOf(person: Personish): string {
  return String(
    person?._id || person?.id || person?.userId || person?.email || person?.name || "tokun-user"
  );
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initialsOf(person: Personish): string {
  const name = String(person?.name || "").trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase().slice(0, 2);
  }
  const email = String(person?.email || "").trim();
  if (email) return email[0].toUpperCase();
  return "?";
}

/**
 * The photo this person actually uploaded, or "" if they haven't.
 *
 * Absolute URLs (Azure blob) pass through; API-relative paths get the API host
 * put back on the front, which is the half Find Creators was missing.
 */
export function uploadedAvatar(person: Personish): string {
  const raw = person?.avatarUrl || person?.avatar;
  if (!raw) return "";
  const url = String(raw).trim();
  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * The placeholder for somebody who has never uploaded one — an SVG data URI, so
 * it renders instantly, offline, and identically wherever it is used.
 */
export function avatarFallback(person: Personish): string {
  const seed = seedOf(person);
  const bg = COLORS[hash(seed) % COLORS.length];
  const text = initialsOf(person);
  // viewBox units, not pixels: the <img> is sized by CSS and this scales to it.
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<rect width="100" height="100" fill="${bg}"/>` +
    `<text x="50" y="50" fill="#fff" font-family="Inter, system-ui, sans-serif"` +
    ` font-size="${text.length > 1 ? 38 : 46}" font-weight="600"` +
    ` text-anchor="middle" dominant-baseline="central">${text}</text>` +
    `</svg>`;
  // encodeURIComponent rather than base64: no btoa Unicode problem, and the
  // result stays readable in devtools.
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * What to put in the `src`. The uploaded photo wins and keeps winning — it only
 * changes when the person uploads another one.
 */
export function avatarFor(person: Personish): string {
  return uploadedAvatar(person) || avatarFallback(person);
}

/**
 * For an `onError` handler: if an uploaded photo 404s (deleted from storage, bad
 * path), fall back to the placeholder instead of the browser's broken-image
 * glyph. Guarded so a failing placeholder can't loop.
 */
export function onAvatarError(person: Personish) {
  return (event: { currentTarget: HTMLImageElement }) => {
    const img = event.currentTarget;
    const fallback = avatarFallback(person);
    if (img.src !== fallback) img.src = fallback;
  };
}
