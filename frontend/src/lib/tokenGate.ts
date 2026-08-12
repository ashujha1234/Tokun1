// Shared token-limit gate for the Optimiser and SmartGen.
// Returns true when the user has hit their token limit (used >= limit) and
// should be blocked from consuming more, prompting them to subscribe/upgrade.
//
// Mirrors the server spend logic (server/service/spend.js):
//  - IND: blocked when monthlyTokensUsed >= monthlyTokensCap and no top-up left
//  - ORG owner: blocked when orgPoolUsed >= orgPoolCap (+ extra)
//  - TM: blocked when orgTokensRemaining <= 0
//
// A non-positive limit is treated as "not determinable" (e.g. quota not loaded
// yet) and does NOT block — the server stays the source of truth in that case.
export function isOutOfTokens(user: any): boolean {
  if (!user) return false;
  const n = (v: any) => Number(v ?? 0);
  const type = user.userType;

  if (type === "TM") {
    const cap = n(user.orgAssignedCap);
    if (cap <= 0) return false;
    return n(user.orgTokensRemaining) <= 0;
  }

  if (type === "ORG") {
    const cap = n(user.orgPoolCap);
    if (cap <= 0) return false;
    return n(user.orgPoolUsed) >= cap + n(user.orgExtraTokensRemaining);
  }

  // IND (default)
  const cap = n(user.monthlyTokensCap);
  if (cap <= 0) return false;
  return n(user.monthlyTokensUsed) >= cap && n(user.extraTokensRemaining) <= 0;
}

// Standard toast payload for the blocked state.
export const TOKEN_LIMIT_TOAST = {
  title: "Token limit reached",
  description:
    "You've used all your tokens. Please upgrade your subscription to keep using the optimiser and SmartGen.",
};
