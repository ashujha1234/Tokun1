import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Whether the viewer has asked the OS to reduce motion.
 *
 * CSS can honour this on its own for animations and transitions, but not for a
 * `<video autoplay>` — there is no stylesheet way to stop playback. Anything
 * that decides between "play it" and "show a still" has to read the setting in
 * JS, which is what this is for.
 *
 * Subscribes to changes: the setting can be toggled while the tab is open, and
 * a hero that keeps playing after the user just turned it off is the exact
 * failure this is meant to avoid.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    // Guarded for SSR / non-browser test environments, where matchMedia is
    // absent — defaulting to false keeps the richer rendering as the norm.
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mq = window.matchMedia(QUERY);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);

    // Re-read on mount: the value can have changed between the useState
    // initializer and this effect.
    setReduced(mq.matches);

    // addListener is the deprecated form, still the only one Safari < 14
    // implements.
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  return reduced;
}

export default usePrefersReducedMotion;
