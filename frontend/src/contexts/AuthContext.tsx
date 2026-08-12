// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { socket } from "@/lib/socket";
import {
  claimUserScopedStorage,
  clearUserScopedStorage,
} from "@/lib/userScopedStorage";

interface User {
  _id: string;           // 🔥 use _id consistently
  email: string;
  name?: string;
  avatar?: string;       // ✅ ADD THIS
  userType?: string;
  role?: string;
  orgId?: string | null;
  plan?: string;
  billingCycle?: "monthly" | "yearly";
  currentPeriodEnd?: string | null;
  monthlyTokensCap?: number;
  monthlyTokensUsed?: number;
  orgPoolCap?: number;
  orgPoolUsed?: number;
  orgExtraTokensRemaining?: number;
  /** Sum of every member's assigned allowance. */
  totalAssignedCap?: number;
  /**
   * The org pool as the OWNER experiences it, computed server-side by
   * /api/quota (summarizeOrgTokens). `orgCommitted` is capacity that is no
   * longer the owner's — assigned to a member or already spent — and
   * `orgAvailable` is what's left to use or hand out.
   *
   * Kept separate from orgPoolUsed, which counts only actual generation and so
   * showed "0 used / 1,000,000 remaining" right after 10,000 had been handed to
   * a member. Computed on the server because backing the owner's own spend out
   * of orgPoolUsed requires every member's live balance.
   */
  orgCommitted?: number;
  orgAvailable?: number;
  orgMemberSpend?: number;
  orgOwnerSpend?: number;
  /** Name of the organization this user belongs to — a team member had no way
   *  to see which org they were in anywhere in the UI. */
  orgName?: string;
  orgAssignedCap?: number;
  orgTokensRemaining?: number;
  /** The org's owner, so a team member can message them or open their profile. */
  orgOwner?: { _id: string; name?: string; email?: string; avatar?: string } | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  logout: () => void;
  persistAuth: (payload: { user?: Partial<User>; token?: string }) => void;
  refreshQuota: () => Promise<void>;
  /** Validate the session now, renewing the token if it's past half its life. */
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

/**
 * Seconds until this JWT expires, or null if it can't be read.
 *
 * Decoded locally — no library — purely to answer "is this already dead?".
 * Nothing here is a security check: the server verifies the signature on every
 * request. This exists so the app stops *pretending* to be logged in with a
 * token it knows is expired, which is what used to happen: isAuthenticated was
 * `!!token`, so an expired token still rendered a full signed-in UI while every
 * API call behind it returned 401.
 */
function secondsUntilExpiry(token: string | null): number | null {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof json?.exp !== "number") return null;
    return json.exp - Math.floor(Date.now() / 1000);
  } catch {
    return null;
  }
}

// A token with no readable exp is left alone rather than assumed dead — better
// to let the server reject it than to log someone out over a parse failure.
function isExpired(token: string | null): boolean {
  const left = secondsUntilExpiry(token);
  return left !== null && left <= 0;
}

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("tokun_user");
      const storedToken = localStorage.getItem("token");

      // An expired token is cleared on boot instead of being restored. Restoring
      // it produced the worst possible state: a UI that looked signed in while
      // every request behind it 401'd, leaving the user to work out on their own
      // that they had to log out and back in.
      if (storedToken && isExpired(storedToken)) {
        localStorage.removeItem("token");
        localStorage.removeItem("tokun_user");
        // An expired session is a logout in everything but name, so its
        // leftovers go too.
        clearUserScopedStorage();
      } else {
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          // Also on restore: the stored session may belong to someone other
          // than whoever the cached data was written for.
          claimUserScopedStorage(parsed?._id || parsed?.id);
          setUser(parsed);
        }
        if (storedToken) setToken(storedToken);
      }
    } catch {}
    setIsReady(true);
  }, []);

  const persistAuth: AuthContextType["persistAuth"] = (payload) => {
    /* Before anything of this session is written. A different user signing in
       on this browser must not inherit the previous one's cached SmartGen
       output, favourites, unread count or saved bank accounts — closing the
       tab without logging out used to leave all of it for whoever came next. */
    const incomingId = (payload?.user as any)?._id || (payload?.user as any)?.id;
    if (incomingId) claimUserScopedStorage(String(incomingId));

    if (payload?.user) {
      setUser((prev) => {
        const merged: User = { ...(prev || {} as User), ...(payload.user as Partial<User>) };
        localStorage.setItem("tokun_user", JSON.stringify(merged));
        return merged;
      });
    }
    if (payload?.token) {
      setToken(payload.token);
      localStorage.setItem("token", payload.token);
    }
  };

  /** Logout + broadcast logout event to all contexts/tabs */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("tokun_user");
    localStorage.removeItem("token");
    // Everything this user cached locally goes with them. Removing only the
    // token left their content sitting in the browser for the next sign-in.
    clearUserScopedStorage();

    // Notify all contexts (PromptContext, other tabs)
    try {
      const event = new StorageEvent("storage", {
        key: "token",
        oldValue: null,
        newValue: null,
        storageArea: localStorage,
        url: window.location.href,
      });
      window.dispatchEvent(event);
    } catch {
      // fallback custom event
      window.dispatchEvent(new CustomEvent("tokun_logout"));
    }
  };

  /**
   * Keeps a long session alive while it's being used, and ends it cleanly when
   * it isn't.
   *
   * GET /api/auth/session returns a fresh token once the current one is past
   * half its life — so an active user's 30-day window keeps sliding forward and
   * they never hit the emailed-OTP login again. A 401 means the session is
   * genuinely over, which is the one case that logs out.
   */
  const checkSession = async (): Promise<void> => {
    const currentToken =
      token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    if (!currentToken) return;

    // Already dead — no point asking the server, just end it here.
    if (isExpired(currentToken)) {
      logout();
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/session`, {
        headers: { Authorization: `Bearer ${currentToken}` },
        credentials: "include",
      });

      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) return; // transient server/network issue — keep the session

      const data = await res.json().catch(() => ({}));
      if (data?.renewed && data?.token) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
      }
    } catch {
      // Offline or the API is unreachable. Deliberately NOT a logout — someone
      // on a flaky connection must not lose their session over it.
    }
  };

  // Checked on mount, whenever the tab regains focus, and hourly for a tab left
  // open. Focus is the important one: it's what catches a session that expired
  // while the laptop was closed.
  useEffect(() => {
    if (!isReady) return;

    checkSession();

    const onFocus = () => checkSession();
    window.addEventListener("focus", onFocus);
    const interval = setInterval(checkSession, 60 * 60 * 1000);

    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  const refreshQuota = async (): Promise<void> => {
    const currentToken =
      token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    if (!currentToken) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/quota?t=${Date.now()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
          credentials: "include",
        }
      );

      if (!res.ok) return;

      const data = await res.json();
      const apiUser = data?.user || null;
      const org = data?.organization || data?.org || null;
      const orgTokens = data?.orgTokens || null;
      const orgOwner = data?.orgOwner || null;

      if (apiUser || org) {
        const merged: Partial<User> = {
          ...(user || {}),
          ...(apiUser || {}),
          ...(orgTokens
            ? {
                orgCommitted: orgTokens.committed,
                orgAvailable: orgTokens.available,
                orgMemberSpend: orgTokens.memberSpend,
                orgOwnerSpend: orgTokens.ownerSpend,
              }
            : {}),
          ...(org
            ? {
                plan: org.plan,
                billingCycle: org.billingCycle,
                currentPeriodEnd: org.currentPeriodEnd,
                orgPoolCap: org.orgPoolCap,
                orgPoolUsed: org.orgPoolUsed,
                orgExtraTokensRemaining: org.orgExtraTokensRemaining ?? 0,
                totalAssignedCap: org.totalAssignedCap ?? 0,
                // Carried so a team member can actually be told which org they
                // belong to — nothing in the UI had the org's name before.
                orgName: org.name,
                orgId: org._id,
                // null for the owner themselves — the server only sends this to
                // other members, so nobody is offered a chat with themselves.
                orgOwner,
              }
            : {}),
        };
        setUser((prev) => {
          const updatedUser = { ...(prev || {} as User), ...merged };
          localStorage.setItem("tokun_user", JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
    } catch (err) {
      console.error("refreshQuota failed:", err);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      // isAuthenticated: !!user && !!token,
      // A token that has already expired is not authentication. This was `!!token`
      // alone, so route guards happily let an expired session through and the app
      // rendered signed-in while every request behind it failed with 401.
      isAuthenticated: !!token && !isExpired(token),
      isReady,
      logout,
      persistAuth,
      refreshQuota,
      checkSession,
    }),
    [user, token, isReady]
  );

  useEffect(() => {
  if (user?._id) {
    socket.auth = {
      userId: user._id, // ✅ NOW guaranteed
    };
    socket.connect();
  }

  return () => {
    socket.disconnect();
  };
}, [user?._id]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
