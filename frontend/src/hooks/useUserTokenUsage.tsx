// // src/hooks/useUserTokenUsage.ts
// import { useEffect, useState, useCallback } from "react";
// import { llmService } from "@/services/llmService";
// import { useAuth } from "@/contexts/AuthContext";

// export function useUserTokenUsage() {
//   const { user } = useAuth();
//   const userId = user?.id ?? "default-user";
//   const [totalTokensUsed, setTotal] = useState(0);
//   const [tokenLimit, setLimit] = useState(100000);

//   const refresh = useCallback(async () => {
//     const usage = await llmService.getUserTokenUsage(userId);
//     setTotal(usage.totalTokensUsed);
//     setLimit(usage.tokenLimit);
//   }, [userId]);

//   useEffect(() => {
//     refresh();
//     const off = llmService.onUsageChanged?.(() => refresh()) ?? (() => {});
//     const onStorage = (e: StorageEvent) => {
//       if (!e.key) return;
//       if (e.key.includes(userId) && (e.key.includes("usage_total_tokens") || e.key.includes("usage_token_limit"))) {
//         refresh();
//       }
//     };
//     window.addEventListener("storage", onStorage);
//     return () => {
//       off();
//       window.removeEventListener("storage", onStorage);
//     };
//   }, [refresh, userId]);

//   return { totalTokensUsed, tokenLimit };
// }


// src/hooks/useUserTokenUsage.ts
import { useEffect, useState, useCallback, useMemo } from "react";
import { llmService } from "@/services/llmService";
import { useAuth } from "@/contexts/AuthContext";

type Usage = { totalTokensUsed?: number; tokenLimit?: number };

export function useUserTokenUsage() {
  const { user } = useAuth();

  // Normalize a stable user key
  const userKey = useMemo(
    () => (user as any)?._id || (user as any)?.id || (user as any)?.uid || "anon",
    [user]
  );

  // Seed UI from user immediately (no flicker)
  const seededLimit = useMemo(() => {
    const cap = Number((user as any)?.monthlyTokensCap);
    return Number.isFinite(cap) && cap > 0 ? cap : 0;
  }, [user]);

  const [totalTokensUsed, setTotal] = useState<number>(
    Number((user as any)?.monthlyTokensUsed) || 0
  );
  const [tokenLimit, setLimit] = useState<number>(seededLimit || 0);

  const refresh = useCallback(async () => {
    try {
      const usage: Usage = await llmService.getUserTokenUsage(userKey);
      const used = Number(usage?.totalTokensUsed);
      const limit = Number(usage?.tokenLimit);

      // Prefer service values if valid; else keep seeded user values
      setTotal(Number.isFinite(used) ? used : (Number((user as any)?.monthlyTokensUsed) || 0));

      if (Number.isFinite(limit) && limit > 0) {
        setLimit(limit);
      } else if (seededLimit > 0) {
        setLimit(seededLimit);
      } else {
        // final fallback
        setLimit(0);
      }
    } catch {
      // On error, keep whatever we had (seeded values)
    }
  }, [userKey, seededLimit, user]);

  useEffect(() => {
    refresh();

    // Live updates (if your service emits)
    const off = llmService.onUsageChanged?.((changedKey: string) => {
      if (changedKey === userKey) refresh();
    }) ?? (() => {});

    // Storage sync (browser only)
    const onStorage = (e: StorageEvent) => {
      if (!e?.key) return;
      if (!e.key.includes(userKey)) return;
      if (e.key.includes("usage_total_tokens") || e.key.includes("usage_token_limit")) {
        refresh();
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
    }

    return () => {
      off();
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
    };
  }, [refresh, userKey]);

  return { totalTokensUsed, tokenLimit };
}
