/**
 * "Upload Product", for the landing bar.
 *
 * The app header has had this button for a long time; the landing bar had
 * Login / Get Started and nothing else. So the one page a first-time visitor
 * actually sees was the one page that never mentioned they could sell here —
 * they had to sign up, land on the app, and discover it afterwards.
 *
 * It shows for everyone, signed in or not, and that's the point: an unavailable
 * button that explains itself teaches more than a hidden one. Pressed without a
 * session it says so and goes to login; the flow behind it is the same four-way
 * gate the app header uses (lib/uploadGate.ts), so neither bar can end up with
 * its own idea of who may list a product.
 *
 * Self-contained deliberately — it owns the two modals it can open, so a bar
 * only has to render the button. The app header still renders its own copy of
 * these modals, because its screen-recording permission step drives the same
 * `sellOpen` state and pulling that apart is a different job than this one.
 */

import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { TEAM_MEMBER_SELL_TOAST, isTeamMember } from "@/lib/orgRoles";
import { primeSellerData } from "@/lib/sellerPrefetch";
import { resolveUploadGate } from "@/lib/uploadGate";
import SellPromptModal from "@/components/SellPromptModal";
import SellerLinkedAccountForm from "@/components/SellerLinkedAccountForm";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export default function UploadProductButton({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const { token, user } = useAuth() as any;

  const [sellOpen, setSellOpen] = useState(false);
  const [payoutFormOpen, setPayoutFormOpen] = useState(false);

  /* Everything the flow needs is fetched before the click, not after it —
     pointing at the button is already a strong enough signal. Without this the
     press sat through one or two round-trips with nothing on screen. */
  const warm = () => {
    if (!token || isTeamMember(user)) return;
    primeSellerData(API_BASE, token);
  };

  const press = () => {
    switch (resolveUploadGate(token, user, API_BASE)) {
      case "login":
        toast({
          title: "Please log in",
          description: "You must be logged in to upload products.",
        });
        navigate("/login");
        return;
      case "team-blocked":
        toast(TEAM_MEMBER_SELL_TOAST);
        return;
      case "sell":
        setSellOpen(true);
        return;
      default:
        setPayoutFormOpen(true);
    }
  };

  return (
    <>
      {/* Same object as the app header's button — the pale pill with the black
          plus — rather than something that resembles it, so moving between the
          landing page and the app doesn't look like two different products.
          The label is hidden below `sm`, where the bar has no room for it; the
          plus alone is the affordance there, as it is in the app header. */}
      <button
        type="button"
        onClick={press}
        onMouseEnter={warm}
        onFocus={warm}
        onTouchStart={warm}
        className={`inline-flex items-center gap-2 h-9 rounded-full px-2.5 sm:px-3 text-black font-medium whitespace-nowrap transition-transform hover:-translate-y-px ${className}`}
        style={{ background: "#D9D9D9" }}
      >
        <span className="grid place-items-center w-5 h-5 rounded-full bg-black">
          <Plus className="w-3 h-3 text-white" strokeWidth={2.5} />
        </span>
        <span className="hidden sm:inline text-sm">Upload Product</span>
      </button>

      <SellPromptModal open={sellOpen} onOpenChange={setSellOpen} onPromptSubmitted={() => {}} />

      {/* Payout details first, then straight on to the listing form — the same
          hand-off the app header does, so nobody has to press Upload twice. */}
      {token && (
        <SellerLinkedAccountForm
          open={payoutFormOpen}
          onClose={() => setPayoutFormOpen(false)}
          token={token}
          apiBase={API_BASE}
          onSubmitted={() => {
            setPayoutFormOpen(false);
            setSellOpen(true);
          }}
        />
      )}
    </>
  );
}
