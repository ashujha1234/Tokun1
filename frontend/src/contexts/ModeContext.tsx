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
  SIGNED_OUT_DEFAULT_MODE,
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

/**
 * The stored choice, or `null` for "has never chosen".
 *
 * That distinction is the whole reason this returns null rather than
 * DEFAULT_MODE: the default now depends on whether there is a session (see
 * SIGNED_OUT_DEFAULT_MODE), and this function runs on the first render, before
 * auth has resolved. Answering "buyer" here would bake in the wrong default for
 * a visitor and there would be no way to tell it apart from a real preference.
 */
function readStoredMode(): AppMode | null {
  try {
    const raw = localStorage.getItem(MODE_STORAGE_KEY);
    return isAppMode(raw) ? raw : null;
  } catch {
    // Private browsing, storage disabled — no stored choice is a fine answer.
    return null;
  }
}

export function ModeProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isReady } = useAuth() as any;
  const location = useLocation();

  /* The explicit choice, or null for "never chosen". Read on the FIRST render,
     not in an effect: correcting a frame later would flash the wrong header on
     every single page load. */
  const [storedMode, setStoredMode] = useState<AppMode | null>(readStoredMode);

  /* ONLY A TEAM MEMBER IS BARRED.
   *
   * This used to require a session (`isAuthenticated && user && !isTeamMember`),
   * which made "signed out" and "team member" the same case — and they are not.
   * A team member can never sell: their org lists and gets paid on its own
   * account (blockOrgTeamMemberPurchase, TEAM_MEMBER_SELL_TOAST wherever they
   * try), so Creator mode for them is a room with nothing in it and no way to
   * put anything there.
   *
   * A signed-out visitor is simply someone without an account yet. Barring them
   * meant `shows()` resolved against "buyer" no matter what the toggle said — so
   * the toggle could read Creator while the bar rendered the buyer half.
   *
   * Mode remains a VIEW preference and never a permission (see lib/mode.ts):
   * every creator action keeps its own gate, and Upload Product still sends
   * someone with no session to login. */
  const isBarredTeamMember = Boolean(isAuthenticated && user && isTeamMember(user));
  const canUseCreatorMode = !isBarredTeamMember;

  /* Still true, and still worth knowing — a visitor in Creator mode can look at
     the creator half but cannot list anything until they have an account. It no
     longer BLOCKS the toggle; the action behind the button does that. */
  const needsAccountForCreator = !isAuthenticated;

  const canShowToggle = Boolean(MODE_UI_ENABLED && canUseCreatorMode);

  /* The default when nothing was ever chosen, which depends on whether there is
     a session — see SIGNED_OUT_DEFAULT_MODE.
     Gated on `isReady`: mid-restore we do not yet know, and asserting the
     signed-out default then would flash Creator at a returning buyer. */
  const defaultMode: AppMode =
    isReady && !isAuthenticated ? SIGNED_OUT_DEFAULT_MODE : DEFAULT_MODE;

  const mode = storedMode ?? defaultMode;

  /* CARRY A VISITOR'S SIDE ACROSS SIGNUP.
   *
   * A signed-out visitor now sits in Creator mode by default. Without this they
   * would sign up from the creator half of the landing page and arrive signed in
   * as a buyer — because nothing was ever stored, and the signed-in default is
   * buyer. The half of the product they came for would vanish at the exact
   * moment they committed to it.
   *
   * sessionStorage, so it belongs to this one journey and never leaks into a
   * later visit or a second tab. Written whenever a session-less visitor is on
   * the creator side (chosen or defaulted) and cleared the moment they choose
   * the buyer side, so it always reflects the last thing they actually saw. */
  useEffect(() => {
    if (!isReady || isAuthenticated) return;
    try {
      if (mode === "creator") sessionStorage.setItem(PENDING_CREATOR_KEY, "1");
      else sessionStorage.removeItem(PENDING_CREATOR_KEY);
    } catch {
      // Storage unavailable — they land in the signed-in default, which is a
      // smaller loss than a crash on the first screen.
    }
  }, [isReady, isAuthenticated, mode]);

  /* And honour it once they have an account, then forget it — otherwise every
     later sign-in on this tab would drag them back into Creator mode. */
  useEffect(() => {
    if (!isAuthenticated || !canUseCreatorMode) return;
    try {
      if (sessionStorage.getItem(PENDING_CREATOR_KEY)) {
        sessionStorage.removeItem(PENDING_CREATOR_KEY);
        setStoredMode("creator");
        localStorage.setItem(MODE_STORAGE_KEY, "creator");
      }
    } catch {
      // Storage unavailable — they land in whatever mode they were in, which is
      // a smaller loss than a crash on the first screen after signup.
    }
  }, [isAuthenticated, canUseCreatorMode]);

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
      setStoredMode(next);
      try {
        localStorage.setItem(MODE_STORAGE_KEY, next);
      } catch {
        // Not persisting is survivable; refusing to switch is not.
      }
    },
    [canUseCreatorMode]
  );

  /* A team member must not be left in Creator mode — added to an org while
     sitting in it, for instance. Corrected rather than hidden, so the header and
     the stored value agree.
     `setStoredMode` directly, because `setMode` is a no-op for a mode you are
     not entitled to and this is precisely that case. */
  useEffect(() => {
    if (mode === "creator" && !canUseCreatorMode) {
      setStoredMode("buyer");
      try {
        localStorage.setItem(MODE_STORAGE_KEY, "buyer");
      } catch {
        // Not persisting is survivable — the correction still applies this session.
      }
    }
  }, [mode, canUseCreatorMode]);

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
