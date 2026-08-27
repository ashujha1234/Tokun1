/**
 * Buyer mode / Creator mode — which half of the product you're looking at.
 *
 * The header carried both jobs at once: a cart and an Upload Product button, a
 * list of what you'd bought next to a list of what you'd listed. Most people
 * only ever do one of the two, and everyone had to read past the other one.
 *
 * ── THIS IS A VIEW PREFERENCE, NOT A PERMISSION ──
 *
 * Mode decides what is SHOWN. It never decides what is ALLOWED. Every creator
 * action keeps the gate it already had — resolveUploadGate() for listing,
 * blockOrgTeamMemberPurchase on the server, the payout and Super Creator
 * checks. Switching to Creator mode is worth exactly as much as scrolling: a
 * localStorage edit gets you a different header and nothing else.
 *
 * ── HOW TO TURN THIS OFF ──
 *
 * Set MODE_UI_ENABLED to false. The toggle disappears, every surface below
 * reports visible, and the header renders exactly as it did before this
 * existed — Saved icon in the action row and all. One line, no other edits,
 * nothing to unpick.
 */

export const MODE_UI_ENABLED = true;

export type AppMode = "buyer" | "creator";

/**
 * Where someone starts, when they have never touched the toggle.
 *
 * TWO DEFAULTS, because the two audiences are asking different questions.
 *
 * A signed-in account is overwhelmingly a buyer — most people never list
 * anything — so an Upload button and no cart is the wrong first screen for them.
 *
 * A signed-out VISITOR is not a buyer yet; they are deciding what this product
 * is. Selling is half of the answer and the landing page is the only place they
 * will be told, so they start on the Creator side with Upload Product on the
 * bar. It is not a promise they can act on without an account — pressing it goes
 * to login through the same gate as everywhere else (see UploadProductButton) —
 * but it is the half of the story that was previously invisible.
 */
export const DEFAULT_MODE: AppMode = "buyer";
export const SIGNED_OUT_DEFAULT_MODE: AppMode = "creator";

/* Read and written through userScopedStorage's owner check, and listed in its
   USER_SCOPED_KEYS — on a shared browser the next person to sign in must not
   inherit the last one's mode. */
export const MODE_STORAGE_KEY = "tokun_app_mode";

export function isAppMode(value: unknown): value is AppMode {
  return value === "buyer" || value === "creator";
}

/**
 * Everything the header can show, and which mode owns it.
 *
 * A table rather than conditions scattered through the JSX, because the whole
 * point of this feature is that the two halves are stated somewhere you can
 * read them side by side. Adding a header item means adding a line here.
 *
 * "both" is not a cop-out — it is the honest answer for the things that belong
 * to neither half:
 *
 *   orders     NOT product purchases. Service bookings and hire projects, and
 *              both SIDES of them (see the note on the Orders button in
 *              Header.tsx) — it is already dual-sided, so splitting it by mode
 *              would hide half of a page from the person who needs it.
 *   team       org member management. A third hat, unrelated to buying or
 *              selling — an org owner wears it in either mode.
 *   saved      products AND creators, both worth keeping in either mode.
 */
export type ModeSurface =
  | "upload"
  | "cart"
  | "purchases"
  | "listings"
  | "sellerDashboard"
  | "payouts"
  | "freelancer"
  | "refunds"
  | "feedback"
  | "orders"
  | "team"
  | "saved";

/* The rule this table follows, arrived at the hard way:
 *
 *   a mode hides what is MEANINGLESS in it — not what merely leans the other way.
 *
 * Only the creator half has things that qualify. Listings, payouts, the seller
 * dashboard and the upload button do not exist for someone who has never sold;
 * showing them is showing an empty room.
 *
 * Nothing on the buyer side is like that. Purchases, refunds and feedback are
 * YOUR OWN records, and they do not stop existing because you switched to the
 * half of the app where you sell — creators buy references and tools like
 * everybody else. They were "buyer" here, which left a creator with no route to
 * their own purchases at all: no menu entry, the dashboard's sub-tab pill gone,
 * /purchases not linked from anywhere. The only way to see what you had bought
 * was to leave Creator mode.
 *
 * `cart` is the one buyer-side exception, and only because it is a control
 * rather than a record — and even it stays visible while it has anything in it
 * (see Header.tsx).
 */
const SURFACE_MODE: Record<ModeSurface, AppMode | "both"> = {
  upload: "creator",
  listings: "creator",
  sellerDashboard: "creator",
  payouts: "creator",
  freelancer: "creator",

  cart: "buyer",

  purchases: "both",
  refunds: "both",
  feedback: "both",
  orders: "both",
  team: "both",
  saved: "both",
};

/** Should this surface be visible in this mode? */
export function showsIn(surface: ModeSurface, mode: AppMode): boolean {
  // Flag off → the header it had before any of this, which is the whole revert.
  if (!MODE_UI_ENABLED) return true;
  const owner = SURFACE_MODE[surface];
  return owner === "both" || owner === mode;
}

/**
 * Paths that only make sense in Creator mode.
 *
 * Used to follow a deep link rather than block it: someone sent a seller
 * dashboard link, or a validation email points at a listing, and the recipient
 * happens to be in Buyer mode. Switching the mode to match the destination
 * costs nothing; refusing the page and asking them to flip a toggle first turns
 * every shared creator link into a dead end.
 */
/* Routes that mean nothing to a buyer. Kept deliberately short.
 *
 * `/self-dash` was in this list and had to come out — it is the dashboard BOTH
 * halves use, so matching it turned every visit into a mode switch. Pressing
 * "My Purchases" in Buyer mode went to /self-dash?p=purchased, this flipped the
 * viewer to Creator, and they arrived at the buyer's own list wearing a creator
 * header with an Uploaded tab on it. A rule meant to follow the reader's
 * intention was overriding it.
 *
 * The test for a shared route is what it POINTS AT, not where it lives — see
 * the `p=uploaded` check below.
 */
const CREATOR_PATH_PATTERNS: RegExp[] = [
  // Withdrawing is money leaving a seller account; there is no buyer reading of
  // it. /wallet is not here: a balance belongs to whoever is looking at it.
  /^\/withdraw/,
];

/** Does landing here imply Creator mode? */
export function pathImpliesCreator(pathname: string, search = ""): boolean {
  if (!MODE_UI_ENABLED) return false;
  if (CREATOR_PATH_PATTERNS.some((rx) => rx.test(pathname))) return true;
  // The uploaded half of the dashboard's product list is the creator's; the
  // purchased half is the buyer's. Same route, and `p` is the only thing that
  // says which one was asked for.
  return /^\/self-dash/.test(pathname) && /[?&]p=uploaded\b/.test(search);
}

/**
 * Someone pressed Creator while signed out.
 *
 * Held across the trip to signup so the press means something when they come
 * back: without it they sign up, land in Buyer mode, and the button they
 * pressed to become a creator has quietly done nothing.
 *
 * sessionStorage, not local: it belongs to this one journey through signup, and
 * it must not survive into a later visit or a second tab.
 */
export const PENDING_CREATOR_KEY = "tokun_pending_creator";
