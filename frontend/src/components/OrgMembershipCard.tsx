import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageCircle, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isTeamMember } from "@/lib/orgRoles";
import { startConversation } from "@/lib/startConversation";
import { toast } from "@/components/ui/use-toast";

/**
 * A team member's own view of the org they belong to.
 *
 * Nothing in the UI told a team member which organization they were in, what
 * role they held, or how much of their allowance was left — the only signal was
 * a token ring with no context. It also states plainly that the org buys and
 * sells on their behalf, which is the rule the rest of the app enforces
 * (blockOrgTeamMemberPurchase on the money routes, canSell:false on
 * payout-status) but never explained anywhere the member could read it.
 *
 * Renders nothing for anyone who isn't a team member.
 */
export default function OrgMembershipCard({ className = "" }: { className?: string }) {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [opening, setOpening] = useState(false);

  if (!isTeamMember(user)) return null;

  const owner = (user as any)?.orgOwner || null;

  const messageOwner = async () => {
    if (!owner?._id) return;
    setOpening(true);
    const conversationId = await startConversation(token, String(owner._id));
    setOpening(false);
    if (!conversationId) {
      toast({ title: "Couldn't open the chat", description: "Please try again.", variant: "destructive" });
      return;
    }
    navigate("/chat", { state: { conversationId } });
  };

  const orgName = (user as any)?.orgName || "your organization";
  const role = user?.role === "Admin" ? "Admin" : "Member";
  const cap = Number((user as any)?.orgAssignedCap ?? 0);
  const left = Number((user as any)?.orgTokensRemaining ?? 0);
  const used = Math.max(0, cap - left);
  const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(120% 100% at 0% 0%, rgba(26,115,232,0.10), rgba(0,0,0,0))",
      }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-white/45">
            Your organization
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white truncate">{orgName}</h3>
        </div>

        <span className="shrink-0 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-white/80">
          {role}
        </span>
      </div>

      {/* Allowance. Shown only when the owner has actually assigned some — a
          bar reading 0 of 0 tells the member nothing useful. */}
      {cap > 0 && (
        <div className="mt-5">
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <span className="text-xs text-white/55">Your token allowance</span>
            <span className="text-sm font-semibold text-white">
              {left.toLocaleString("en-IN")}{" "}
              <span className="text-white/45 font-normal">
                / {cap.toLocaleString("en-IN")} left
              </span>
            </span>
          </div>

          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #1A73E8 0%, #FF14EF 100%)",
              }}
            />
          </div>

          <p className="mt-2 text-[11px] text-white/40">
            {used.toLocaleString("en-IN")} used across SmartGen and the Optimizer.
            Your owner can increase this.
          </p>
        </div>
      )}

      {/* Reaching the owner. A member's only route to a paid prompt is asking
          them, so having no way to actually contact them was a gap. */}
      {owner?._id && (
        <div className="mt-5 pt-4 border-t border-white/10">
          <p className="text-[11px] uppercase tracking-wide text-white/45 mb-2.5">
            Organization owner
          </p>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {owner.name || owner.email || "Owner"}
              </p>
              {owner.name && owner.email && (
                <p className="text-[11px] text-white/40 truncate">{owner.email}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={messageOwner}
                disabled={opening}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 disabled:opacity-50"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {opening ? "Opening…" : "Message"}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/profile/${owner._id}`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Profile
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-white/10">
        <p className="text-xs leading-relaxed text-white/55">
          {orgName} buys and sells prompts on your behalf, so you don't need a
          payout account of your own. Found something you need?{" "}
          <Link to="/prompt-marketplace" className="underline hover:text-white">
            Request it from the marketplace
          </Link>{" "}
          and your owner can purchase and share it with you.
        </p>
      </div>
    </div>
  );
}
