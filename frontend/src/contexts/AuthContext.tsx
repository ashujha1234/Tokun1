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
  /* The schema field, and what every screen should read. `avatar` is kept only
     because the upload route still answers with that key. */
  avatarUrl?: string | null;
  avatar?: string;
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
  persistAuth: (payload: { user?: Partial<User>; token?: string; refreshToken?: string }) => void;
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
      const storedRefresh = localStorage.getItem("refreshToken");

      /* An expired token is cleared on boot instead of being restored. Restoring
         it produced the worst possible state: a UI that looked signed in while
         every request behind it 401'd, leaving the user to work out on their own
         that they had to log out and back in.

         `&& !storedRefresh` is what changed when the access token dropped from
         thirty days to one hour. Expired now means "an hour has passed", which
         is the normal state of any tab reopened the next morning — not the end
         of a session. With a refresh token in hand that is recoverable, and the
         effect below picks it up on the very first pass. Without this clause,
         shortening the access token would have signed everyone out hourly. */
      if (storedToken && isExpired(storedToken) && !storedRefresh) {
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
    /* The access token is now an hour long, so this is what actually keeps
       somebody signed in between visits. Written under its own key rather than
       inside the user blob because the refresh flow reads it before any of that
       is parsed. See REFRESH below. */
    if (payload?.refreshToken) {
      localStorage.setItem("refreshToken", payload.refreshToken);
    }
  };

  /** Logout + broadcast logout event to all contexts/tabs */
  const logout = () => {
    /* Read before the local clear, and told to the server without waiting.
     *
     * Dropping a refresh token from localStorage does not revoke it — it stays
     * valid on the server for its full thirty days, so anything that captured a
     * copy could keep minting access tokens long after the user believed they
     * had signed out. This is what actually ends it.
     *
     * Not awaited, and failure is ignored: the local logout must happen at once
     * whatever the network is doing. keepalive lets the request outlive the page
     * if this logout is the last thing before a navigation. */
    const storedRefresh = localStorage.getItem("refreshToken");
    if (storedRefresh) {
      fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedRefresh }),
        keepalive: true,
      }).catch(() => {});
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem("tokun_user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
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

  /* ── REFRESH ───────────────────────────────────────────────────────────────
   *
   * The access token lasts an hour. The refresh token lasts thirty days and is
   * what keeps somebody signed in across that hour, and across the next
   * twenty-nine days of them closing the tab.
   *
   * This has to happen PROACTIVELY — before the access token expires, not in
   * response to a 401. About forty files in this app build their own fetch
   * call, so there is no single place a 401 could be caught and the request
   * retried. Instead the token in localStorage is kept fresh, and those forty
   * call sites never see an expired one. Building a central API client is what
   * would let this become reactive, and it is the reason the access token is an
   * hour rather than the fifteen minutes this pattern normally uses.
   *
   * Only one refresh may be in flight at a time. Refresh tokens are single-use
   * and rotate: two concurrent calls would send the same token twice, the
   * server would read the second as a replay of a stolen token, and it would
   * revoke the entire family — logging the user out as a direct result of
   * having two tabs. `refreshInFlight` is what stops that, and it matters more
   * than it looks.
   */
  const refreshInFlight = React.useRef<Promise<boolean> | null>(null);

  const refreshSession = async (): Promise<boolean> => {
    if (refreshInFlight.current) return refreshInFlight.current;

    const storedRefresh =
      typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
    if (!storedRefresh) return false;

    const run = (async (): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: storedRefresh }),
        });

        /* 401 is the server saying this refresh token is no good — unknown,
           expired, revoked, or already spent. None of those is recoverable, and
           continuing to look signed in would produce exactly the broken state
           the boot path above was written to avoid. */
        if (res.status === 401) {
          logout();
          return false;
        }

        // 5xx, rate limiting, anything else: transient. Keep the session and
        // let the next tick try again — the access token is still valid.
        if (!res.ok) return false;

        const data = await res.json().catch(() => ({}));
        if (!data?.token || !data?.refreshToken) return false;

        setToken(data.token);
        localStorage.setItem("token", data.token);
        // The new refresh token MUST be stored: the one just used is now dead,
        // and losing its replacement means the session cannot be renewed again.
        localStorage.setItem("refreshToken", data.refreshToken);
        return true;
      } catch {
        // Offline or unreachable. Deliberately NOT a logout — someone on a
        // flaky connection must not lose their session over it.
        return false;
      } finally {
        refreshInFlight.current = null;
      }
    })();

    refreshInFlight.current = run;
    return run;
  };

  /**
   * Refresh the access token if it is gone, dead, or close enough to it.
   *
   * The 50% threshold means a live tab refreshes about every thirty minutes
   * rather than on every focus event, and leaves half an hour of margin for a
   * laptop that was asleep, a slow network, or a clock that is out.
   */
  const checkSession = async (): Promise<void> => {
    const currentToken =
      token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    const storedRefresh =
      typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

    // Not signed in at all.
    if (!currentToken && !storedRefresh) return;

    /* Expired, or missing while a refresh token survives — the ordinary state
       of a tab reopened tomorrow. Recoverable, and the only correct response is
       to try. */
    if (!currentToken || isExpired(currentToken)) {
      if (storedRefresh) await refreshSession();
      else logout();
      return;
    }

    const left = secondsUntilExpiry(currentToken);
    const past = left !== null && left <= (60 * 60) / 2;
    if (past && storedRefresh) await refreshSession();
  };

  /* Checked on mount, whenever the tab regains focus, and every five minutes
   * for a tab left open.
   *
   * The interval was one HOUR, which was fine against a thirty-day token and is
   * not fine against a one-hour one: a tab left open would reach expiry and the
   * next check would arrive up to an hour later, so every request in between
   * would 401 against a token the client had not noticed was dead. Five minutes
   * is comfortably inside the thirty-minute refresh threshold, so the token is
   * always replaced well before it expires.
   *
   * The check itself is nearly free — it reads an expiry out of localStorage and
   * usually returns — so the cost of the shorter interval is not a request every
   * five minutes, it is a comparison every five minutes. A real refresh still
   * happens about twice an hour.
   *
   * Focus remains the important one: it is what catches the tab that was open
   * while the laptop was shut for a week.
   */
  useEffect(() => {
    if (!isReady) return;

    checkSession();

    const onFocus = () => checkSession();
    window.addEventListener("focus", onFocus);
    const interval = setInterval(checkSession, 5 * 60 * 1000);

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

  /* The handshake carries the TOKEN now, not the user id.
   *
   * It used to send `{ userId }` — a claim the server took at face value,
   * because there was no verification on the socket side at all. The server now
   * verifies this token in io.use() and derives the user from it, so what is
   * sent here has to be something only the real user has.
   *
   * Depends on `token`, not `user._id`: on logout-then-login as someone else the
   * id changes and this would reconnect anyway, but on a token REFRESH the id
   * stays the same while the old token stops verifying — and the socket would
   * have gone on using a handshake the server no longer accepts until the next
   * full reload.
   */
  useEffect(() => {
    if (!token || !user?._id) return;

    socket.auth = { token };
    socket.connect();

    /* An expired or malformed token makes io.use() reject, and socket.io
     * reports that here rather than throwing. Worth logging: without it a
     * refused handshake looks exactly like the server being down. */
    const onConnectError = (err: Error) => {
      console.error("socket connect failed:", err.message);
    };
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [token, user?._id]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
