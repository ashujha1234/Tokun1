import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Every navigation starts at the top of the page.
 *
 * This already scrolled to 0 on a pathname change, and it still lost — because
 * the browser's own scroll restoration was left on. On a BACK navigation the
 * browser remembers where you were and puts you back there, and it does that
 * *asynchronously*, after layout: our scroll-to-top ran on mount, the page then
 * grew as its data arrived, and the browser's restore landed afterwards and
 * dragged the view back down. Hence coming back to the marketplace and finding
 * yourself somewhere in the middle of it instead of on the banner.
 *
 * So restoration is turned off and this component owns the scroll position.
 * Two passes, because a page that mounts its content asynchronously (the
 * marketplace's feed, the landing page's below-fold sections) can shift layout
 * a frame or two after we arrive.
 *
 * A hash is honoured rather than overridden: `/#what-we-offer` is a request for
 * a specific place on the page, not the top of it.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  // Once, as early as possible. `manual` is remembered per document, so this
  // survives every client-side navigation that follows.
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (hash) {
      // Let the target render first — on a fresh page load the element the
      // hash names usually doesn't exist yet at this point.
      const id = hash.slice(1);
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
      });
      return;
    }

    const toTop = () =>
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });

    toTop();
    // Second pass after the first paint, for pages whose content arrives late
    // and changes the document height under us.
    const raf = requestAnimationFrame(toTop);
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
}
