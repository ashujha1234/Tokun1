/**
 * Which mode the signed-in person is looking at the product in.
 *
 * See lib/mode.ts for what mode means and — importantly — what it does not:
 * it decides what is shown, never what is allowed.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isTeamMember } from "@/lib/orgRoles";
import {
  DEFAULT_MODE,
  MODE_STORAGE_KEY,
  MODE_UI_ENABLED,
  PENDING_CREATOR_KEY,
  isAppMode,
  pathImpliesCreator,
  showsIn,
  type AppMode,
  type ModeSurface,
} from "@/lib/mode";

type ModeContextValue = {
  mode: AppMode;
  setMode: (next: AppMode) => void;
  /** Is this account allowed to BE in Creator mode? Signed in, and not a TM. */
  canUseCreatorMode: boolean;
  /**
   * Should the toggle be on screen? A wider question than the one above —
   * a signed-out visitor sees it and pressing Creator sends them to signup, so
   * the two halves of the product are visible before anyone has an account.
   */
  canShowToggle: boolean;
  /** No session yet — the toggle asks for one instead of switching. */
  needsAccountForCreator: boolean;
  /** `showsIn(surface, mode)`, curried with the current mode. */
  shows: (surface: ModeSurface) => boolean;
};

const ModeContext = createContext<ModeContextValue | null>(null);

function readStoredMode(): AppMode {
  try {
    const raw = localStorage.getItem(MODE_STORAGE_KEY);
    return isAppMode(raw) ? raw : DEFAULT_MODE;
  } catch {
    // Private browsing, storage disabled — the default is a fine answer.
    return DEFAULT_MODE;
  }
}

export function ModeProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth() as any;
  const location = useLocation();

  // Read on the FIRST render, not in an effect: starting on "buyer" and
  // correcting a frame later would flash the buyer header at a creator on every
  // single page load.
  const [mode, setModeState] = useState<AppMode>(readStoredMode);

  /* A team member can't sell — their org lists and gets paid on its own account
     (blockOrgTeamMemberPurchase, and TEAM_MEMBER_SELL_TOAST wherever they try).
     Offering them a Creator mode would be offering a room with nothing in it
     and no way to put anything there.
     Signed-out is NOT the same case: see needsAccountForCreator below. */
  const canUseCreatorMode = Boolean(isAuthenticated && user && !isTeamMember(user));

  /* A signed-out visitor is not barred from Creator mode — they just haven't
     got an account yet, which is a different thing and has a different answer
     (signup, not a hidden button). A team member IS barred, permanently, so the
     toggle stays off for them in both states. */
  const needsAccountForCreator = !isAuthenticated;
  const canShowToggle = Boolean(
    MODE_UI_ENABLED && (needsAccountForCreator || canUseCreatorMode)
  );

  /* They pressed Creator on their way in. Honour it once they have an account,
     then forget it — otherwise every later sign-in on this tab would drag them
     back into Creator mode. */
  useEffect(() => {
    if (!canUseCreatorMode) return;
    try {
      if (sessionStorage.getItem(PENDING_CREATOR_KEY)) {
        sessionStorage.removeItem(PENDING_CREATOR_KEY);
        setModeState("creator");
        localStorage.setItem(MODE_STORAGE_KEY, "creator");
      }
    } catch {
      // Storage unavailable — they land in whatever mode they were in, which is
      // a smaller loss than a crash on the first screen after signup.
    }
  }, [canUseCreatorMode]);

  /* "Have they listed anything yet?" belonged here and has been taken out. It
     was guessing at fields (`isSeller`, `hasPayoutSetup`) the auth payload does
     not carry, and nothing consumed it — an unused wrong answer is the kind
     that gets believed the first time somebody does consume it. The
     Start-selling empty state should ask the seller endpoints when it is
     built. */

  const setMode = useCallback(
    (next: AppMode) => {
      if (!MODE_UI_ENABLED) return;
      if (next === "creator" && !canUseCreatorMode) return;
      setModeState(next);
      try {
        localStorage.setItem(MODE_STORAGE_KEY, next);
      } catch {
        // Not persisting is survivable; refusing to switch is not.
      }
    },
    [canUseCreatorMode]
  );

  /* Someone who can't be in Creator mode must not be left in it — a team member
     added to an org while sitting in Creator mode, for instance. Corrected
     rather than hidden, so the header and the stored value agree. */
  useEffect(() => {
    if (mode === "creator" && !canUseCreatorMode) setMode("buyer");
  }, [mode, canUseCreatorMode, setMode]);

  /* Follow a deep link instead of blocking it.
     A shared seller-dashboard link, or a validation email pointing at a
     listing, opened in Buyer mode: the destination wins and the mode moves to
     match it. The other direction is deliberately NOT done — landing on the
     marketplace shouldn't knock a creator out of Creator mode, because browsing
     what else is for sale is a thing sellers do all day. */
  useEffect(() => {
    if (!canUseCreatorMode || mode === "creator") return;
    if (pathImpliesCreator(location.pathname, location.search)) setMode("creator");
  }, [location.pathname, location.search, canUseCreatorMode, mode, setMode]);

  const value = useMemo<ModeContextValue>(
    () => ({
      // A mode nobody is entitled to is reported as buyer, so no consumer has
      // to repeat the entitlement check to render the right thing.
      mode: canUseCreatorMode ? mode : "buyer",
      setMode,
      canUseCreatorMode,
      canShowToggle,
      needsAccountForCreator,
      shows: (surface) => showsIn(surface, canUseCreatorMode ? mode : "buyer"),
    }),
    [mode, setMode, canUseCreatorMode, canShowToggle, needsAccountForCreator]
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

/**
 * Falls back to a buyer-mode-shaped answer outside the provider rather than
 * throwing — a component rendered in a test or a stray tree should show the
 * default header, not crash the page.
 */
export function useMode(): ModeContextValue {
  const ctx = useContext(ModeContext);
  if (ctx) return ctx;
  return {
    mode: "buyer",
    setMode: () => {},
    canUseCreatorMode: false,
    canShowToggle: false,
    needsAccountForCreator: false,
    shows: (surface) => showsIn(surface, "buyer"),
  };
}

export default ModeContext;
