import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, BadgeCheck, Briefcase } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import BecomeFreelancerWizard from "@/components/BecomeFreelancerWizard";
import SellerLinkedAccountForm from "@/components/SellerLinkedAccountForm";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMyFreelancerProfile,
  prefetchSpecializations,
  type FreelancerProfile,
  type FreelancerStatus,
} from "@/lib/freelancerApi";

/**
 * The "Become a Freelancer" account-menu entry, as a hook.
 *
 * This exists as a hook rather than a component because the app has TWO copies
 * of the account dropdown — Header.tsx (on every page) and HeroAccountMenu in
 * Landing.tsx — and Header's own source already notes that anything added to one
 * has to be added to the other or the pages quietly diverge. A hook means the
 * label logic, the status fetch and the two dialogs are written once and each
 * dropdown adds one item to its array plus one line of JSX.
 *
 * The dialogs come back as `modals` instead of being rendered by the caller's
 * menu, and that placement matters: a dropdown unmounts its contents when it
 * closes, so a wizard rendered inside the menu would vanish the moment the menu
 * did. `modals` must be rendered at the component root, outside the dropdown.
 *
 * Usage:
 *   const freelancer = useFreelancerMenu();
 *   // …inside the dropdown:
 *   { label: freelancer.label, icon: Briefcase, onClick: freelancer.open }
 *   // …at the component root, outside the dropdown:
 *   {freelancer.modals}
 */

// Cached at module scope, not in component state. Header remounts on every route
// change, so per-mount state would refetch on every navigation just to label one
// menu row. Same shape as lib/sellerPrefetch.ts, and keyed by token so a second
// user in the same tab can never read the first one's answer.
let cachedToken = "";
let cachedStatus: FreelancerStatus | null = null;
let cachedEligible = true;
// The whole profile, not just its status. This request already runs on mount to
// label the menu row; keeping only the status meant the wizard re-fetched the
// identical document on open and sat on a spinner while it arrived. Handing the
// cached copy over lets the wizard render its first step immediately.
//
// Three states, and the difference matters:
//   undefined — not looked yet; the wizard must fetch and show a spinner
//   null      — looked, this user has no profile; the wizard opens on step one
//   object    — looked, here it is
// Collapsing the first two would make a stale cache look like a brand-new user
// and drop someone with a live profile back onto an empty form.
let cachedProfile: FreelancerProfile | null | undefined = undefined;
let inflight: Promise<void> | null = null;

function readToken(): string {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("auth_token") ||
    ""
  );
}

export interface FreelancerMenuState {
  /** Label for the menu row — reflects where this user is in the flow. */
  label: string;
  /** Secondary line, e.g. "Live" or "Draft saved". */
  hint: string;
  icon: React.ReactNode;
  /** Accent colour for the icon, matching the state. */
  tint: string;
  status: FreelancerStatus | null;
  /** false for org team members, who can't freelance in their own right. */
  eligible: boolean;
  loading: boolean;
  /** Opens the wizard, or navigates to the edit page if the profile is live. */
  open: () => void;
  /** Opens payout setup directly. Only meaningful once the profile is live. */
  openPayouts: () => void;
  /** Render at the component root, OUTSIDE the dropdown. See note above. */
  modals: React.ReactNode;
  /** Re-reads status, e.g. after payout setup completes. */
  refresh: () => void;
}

export function useFreelancerMenu(): FreelancerMenuState {
  const navigate = useNavigate();
  const { user } = useAuth() as any;
  const token = readToken();

  // Everything freelancer-related lives on the one profile page. `/profile`
  // without an id has no route, so a missing user id falls back to the account
  // dropdown's own destination rather than a 404.
  const ownProfilePath = user?._id ? `/profile/${user._id}` : "/self-dash";

  const [status, setStatus] = useState<FreelancerStatus | null>(
    token && token === cachedToken ? cachedStatus : null
  );
  const [eligible, setEligible] = useState<boolean>(
    token && token === cachedToken ? cachedEligible : true
  );
  const [loading, setLoading] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [payoutOpen, setPayoutOpen] = useState(false);

  const load = useCallback(
    async (force = false) => {
      if (!token) return;

      if (!force && token === cachedToken) {
        setStatus(cachedStatus);
        setEligible(cachedEligible);
        return;
      }
      // A concurrent caller (both dropdowns can be mounted at once on the
      // landing page) waits on the same request rather than firing a second.
      if (!force && inflight) {
        await inflight;
        setStatus(cachedStatus);
        setEligible(cachedEligible);
        return;
      }

      setLoading(true);
      inflight = (async () => {
        const res = await getMyFreelancerProfile(token);
        if (res.ok) {
          cachedToken = token;
          cachedStatus = res.data.profile?.status ?? null;
          cachedEligible = res.data.eligible !== false;
          cachedProfile = res.data.profile;
        } else {
          // Left uncached so the next mount retries. Falling back to "not a
          // freelancer yet" shows the plain "Become a Freelancer" row, and the
          // wizard re-reads on open and will show the real state anyway.
          cachedToken = "";
          cachedStatus = null;
          cachedEligible = true;
          cachedProfile = undefined;
        }
      })();

      await inflight;
      inflight = null;

      setStatus(cachedStatus);
      setEligible(cachedEligible);
      setLoading(false);
    },
    [token]
  );

  useEffect(() => {
    load();
  }, [load]);

  const meta = useMemo(() => {
    if (!eligible) {
      return {
        label: "Super Creator work via your org",
        hint: "Your organization handles client work",
        icon: <AlertCircle size={16} />,
        tint: "rgba(255,255,255,0.45)",
      };
    }
    /* "Super Creator", the tier this profile actually unlocks.
       This menu is the entry point to the Super Creator flow — services, hire
       and escrow deals. It said "Creator", which now means something else:
       anyone with an activated payout account and a published product is a
       Creator, and that needs no profile, no skills and no intro video.
       Leaving both called "Creator" made the menu look like it was offering a
       tier the user already had.

       All states are renamed together — a menu that offers "Become a Super
       Creator" and then reports "Finish creator profile" reads as two different
       features. Only the wording changes here; the state machine, the API and
       the field names underneath are untouched. */
    switch (status) {
      case "ACTIVE":
        return {
          label: "My Super Creator profile",
          hint: "Live",
          icon: <BadgeCheck size={16} />,
          tint: "#19E66C",
        };
      case "DRAFT":
        return {
          label: "Finish Super Creator profile",
          hint: "Draft saved",
          icon: <Briefcase size={16} />,
          tint: "#FF14EF",
        };
      default:
        return {
          label: "Become a Super Creator",
          hint: "Offer services and get hired",
          icon: <Briefcase size={16} />,
          tint: "#FF14EF",
        };
    }
  }, [status, eligible]);

  const open = useCallback(() => {
    // Warmed on the click, not on mount: the catalog is only needed by the
    // wizard's third step, so requesting it on every page load would cost every
    // visitor a request to save one person a wait. Starting it here gives it the
    // whole of steps one and two to land.
    prefetchSpecializations(token);

    if (!token) {
      navigate("/login");
      return;
    }
    if (!eligible) {
      toast({
        title: "Freelancing is handled by your organization",
        description: "Ask your org owner to set up the freelancer profile.",
      });
      return;
    }
    // A live profile is managed on the user's own profile page — there is one
    // profile page, and it's the same URL buyers see, so the owner is always
    // editing the thing being looked at.
    if (status === "ACTIVE") {
      navigate(ownProfilePath);
      return;
    }
    setWizardOpen(true);
  }, [token, eligible, status, navigate, ownProfilePath]);

  const openPayouts = useCallback(() => setPayoutOpen(true), []);

  const API_BASE = (
    (import.meta as any).env?.VITE_API_URL || "http://localhost:5000"
  ).replace(/\/$/, "");

  const modals = (
    <>
      <BecomeFreelancerWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        token={token}
        initialProfile={cachedProfile}
        onStatusChange={(next) => {
          cachedToken = token;
          cachedStatus = next;
          // The cached profile is now stale in at least its status. Reset to
          // "unknown" rather than "none", so the next open re-fetches the truth
          // instead of showing a freelancer an empty first step.
          cachedProfile = undefined;
          setStatus(next);
        }}
        // Onboarding ends with the profile live, so they go straight to their
        // profile — the same page buyers see, where the Profile Strength list
        // covers whatever is still missing.
        onActivated={() => navigate(ownProfilePath)}
      />

      {/* The same form prompt-sellers use. There is one linked account per
          seller, shared by freelancing and prompt selling — this form skips
          itself when one already exists, so nobody fills it in twice. */}
      {payoutOpen && (
        <SellerLinkedAccountForm
          open={payoutOpen}
          onClose={() => setPayoutOpen(false)}
          token={token}
          apiBase={API_BASE}
          onSubmitted={() => {
            setPayoutOpen(false);
            load(true);
            toast({
              title: "Payout details saved",
              description: "You're set up to get paid for freelance work.",
            });
          }}
        />
      )}
    </>
  );

  return {
    ...meta,
    status,
    eligible,
    loading,
    open,
    openPayouts,
    modals,
    refresh: () => load(true),
  };
}
