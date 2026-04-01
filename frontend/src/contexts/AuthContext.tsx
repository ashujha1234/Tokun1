// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { socket } from "@/lib/socket";

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
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  logout: () => void;
  persistAuth: (payload: { user?: Partial<User>; token?: string }) => void;
  refreshQuota: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedToken) setToken(storedToken);
    } catch {}
    setIsReady(true);
  }, []);

  const persistAuth: AuthContextType["persistAuth"] = (payload) => {
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

      if (apiUser || org) {
        const merged: Partial<User> = {
          ...(user || {}),
          ...(apiUser || {}),
          ...(org
            ? {
                plan: org.plan,
                billingCycle: org.billingCycle,
                currentPeriodEnd: org.currentPeriodEnd,
                orgPoolCap: org.orgPoolCap,
                orgPoolUsed: org.orgPoolUsed,
                orgExtraTokensRemaining: org.orgExtraTokensRemaining ?? 0,
                orgId: org._id,
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
      isAuthenticated: !!user && !!token,
      isReady,
      logout,
      persistAuth,
      refreshQuota,
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
