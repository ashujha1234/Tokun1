// Shared org-role checks for the marketplace purchase surfaces.
//
// A Team Member never buys directly: their org's Owner purchases out of the
// shared pool and shares access, and a TM who wants something asks the Owner
// via /api/prompt-collab/team/request. The server enforces this in
// blockOrgTeamMemberPurchase (server/utils/auth.js), which rejects
// create-order, purchase-verify and cart-checkout with 403
// "team_members_cannot_purchase".
//
// This file exists because that rule was previously re-derived inline and got
// it wrong: `userType === "ORG" && role !== "Owner"` never matches a real team
// member, because a TM's userType is "TM" — "ORG" is the Owner's own type. The
// check silently passed everyone, so Buy Now stayed enabled for team members.
export function isTeamMember(user: any): boolean {
  return user?.userType === "TM";
}

// The Owner/Admin of an organization — the only org role that may purchase.
export function isOrgOwner(user: any): boolean {
  return user?.userType === "ORG" && (user?.role === "Owner" || user?.role === "Admin");
}

// May reach the team-management page (/admin): the org Owner, or a team member
// the Owner explicitly promoted to the Admin role. Kept here because the same
// condition is enforced in three places — the Header's Team button, Admin.tsx's
// own redirect guard, and the server's GET /api/org/members/dashboard — and they
// have to agree or someone sees a button that bounces them straight back out.
export function canManageTeam(user: any): boolean {
  return (
    (user?.userType === "ORG" && user?.role === "Owner") ||
    (user?.userType === "TM" && user?.role === "Admin")
  );
}

// Shown when a team member reaches a purchase action anyway (keyboard, stale
// render, direct call). Mirrors the server's own 403 message.
export const TEAM_MEMBER_PURCHASE_TOAST = {
  title: "Your organization buys for you",
  description:
    "Team members can't purchase directly. Send a request and your org owner can buy and share it with you.",
};

// Selling is the same story from the other direction: listings and payouts sit
// on the organization's own Route account, so a team member has no payout
// account to onboard. GET /api/bankaccount/payout-status reports canSell:false
// for them, and this is what the UI says instead of opening that form.
export const TEAM_MEMBER_SELL_TOAST = {
  title: "Your organization sells for you",
  description:
    "Team members can't list products or set up a payout account. Ask your org owner to publish it from the organization account.",
};
