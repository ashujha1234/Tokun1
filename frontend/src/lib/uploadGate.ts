import { isTeamMember } from "@/lib/orgRoles";
import { peekPayoutStatus, getPayoutStatus } from "@/lib/sellerPrefetch";

/**
 * What happens when someone presses "Upload Product".
 *
 * The app header owned this decision inline, which was fine while it was the
 * only button. It isn't any more — the landing bar carries the same button now,
 * because a visitor who hasn't signed in is exactly the person who needs to see
 * that selling is a thing here, and the old bar showed them Login / Get Started
 * and nothing else.
 *
 * Two copies of a four-way gate is how the two of them would end up disagreeing
 * about who is allowed to sell, so the decision lives here and both read it.
 * Only the decision: what to DO about each answer (which modal, which toast) is
 * the caller's, since the two bars render different things.
 *
 *   "login"        no session — send them to sign in
 *   "team-blocked" a team member; their org lists and gets paid, not them
 *   "sell"         cleared, payout account set up — open the listing form
 *   "payout-setup" cleared, but payout details first
 */
export type UploadGate = "login" | "team-blocked" | "sell" | "payout-setup";

/**
 * Answers synchronously, on purpose.
 *
 * `peekPayoutStatus` reads the prefetched snapshot rather than awaiting a
 * request, so the modal opens in the same frame as the click. Even an
 * already-resolved promise costs a tick, and that tick is the gap that made the
 * button feel broken.
 *
 * The one side effect is deliberate: when the snapshot says "cleared", it is
 * revalidated behind the modal that is about to open. The snapshot can be
 * minutes old and the account suspended since — this costs the user nothing and
 * means the next press is right even if this one raced. It lives with the
 * decision rather than at a call site so it can't be forgotten by the next
 * caller.
 */
export function resolveUploadGate(
  token: string | null | undefined,
  user: unknown,
  apiBase: string
): UploadGate {
  if (!token) return "login";
  if (isTeamMember(user)) return "team-blocked";

  const status = peekPayoutStatus(token);
  if (status?.ok && status.canSell !== false && status.hasPayoutSetup) {
    void getPayoutStatus(apiBase, token, { force: true });
    return "sell";
  }

  // No identity-KYC gate here any more — sellers go through Route payout setup,
  // and SellerLinkedAccountForm skips straight to the listing form for anyone
  // who has already done it.
  return "payout-setup";
}
