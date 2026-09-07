/**
 * Agora RTC, loaded only when a call actually starts.
 *
 * This module used to be three lines: a static `import AgoraRTC from
 * "agora-rtc-sdk-ng"` and a `createClient()` at module scope. Both were the
 * problem. The static import put ~1.3 MB of SDK into whatever chunk reached
 * this file — ChatPage, which is lazy-routed but is also the busiest page in
 * the app, so every visitor who opened a conversation downloaded a video
 * calling stack to read text messages. The module-scope `createClient()` meant
 * the SDK was not just downloaded but initialised on import.
 *
 * `getAgora()` defers both to the first call. The dynamic import is what makes
 * Vite emit the SDK as its own chunk instead of folding it into ChatPage.
 *
 * ⚠️ APP_ID is a hardcoded Agora App ID and it ships in the client bundle,
 * which is unavoidable — the browser needs it to connect. What is NOT fine is
 * that the join below passes `null` where the channel token goes (see
 * useAgoraCall.ts): that only works while the Agora project is in
 * "App ID without certificate" mode, and in that mode this ID alone is enough
 * for anyone to join any channel they can name. Fixing it means enabling the
 * primary certificate on the Agora project and minting short-lived channel
 * tokens server-side. Flagged here rather than silently left as-is.
 */
import type { IAgoraRTCClient, IAgoraRTC } from "agora-rtc-sdk-ng";

export const APP_ID = "dfe3def62d2e4694a95d12a7d46c2b78";

type Agora = { AgoraRTC: IAgoraRTC; client: IAgoraRTCClient };

/* Memoised on the promise, not on the result: two components mounting at once
   must share one import and one client, and awaiting the same promise is what
   guarantees that. A second client on the same channel is its own bug — two
   subscriptions, two published tracks. */
let agoraPromise: Promise<Agora> | null = null;

export function getAgora(): Promise<Agora> {
  if (!agoraPromise) {
    agoraPromise = import("agora-rtc-sdk-ng").then((mod) => {
      const AgoraRTC = (mod.default ?? mod) as IAgoraRTC;
      return {
        AgoraRTC,
        client: AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }),
      };
    });

    /* A failed chunk load must not be cached — the user is usually offline for
       a moment, and without this the retry resolves against the same rejection
       forever. */
    agoraPromise.catch(() => {
      agoraPromise = null;
    });
  }

  return agoraPromise;
}
