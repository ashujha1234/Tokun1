import { useEffect } from "react";

/**
 * Stops the page behind an overlay from scrolling while it's open.
 *
 * A `fixed inset-0` overlay covers the page but does nothing to it: the wheel
 * and the touch drag still reach the document underneath, so scrolling inside
 * the chat popup and then past its end quietly scrolls the page behind it. You
 * close the overlay and find yourself somewhere else entirely.
 *
 * Three screens already did this by hand (the onboarding wizard, the payout
 * form, the profile section editor) with three slightly different copies, and
 * every overlay added since forgot to. One hook, so "open" is all a caller has
 * to say.
 *
 * WHY THE SCROLLBAR WIDTH MATTERS: hiding the overflow removes the scrollbar,
 * and on a desktop that widens the viewport by ~15px — everything underneath
 * jumps sideways as the overlay opens and back as it closes. Padding the body by
 * exactly the width that disappeared keeps it still. Overlay scrollbars (most
 * phones, and macOS by default) measure 0, so nothing is added there.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      // Added to whatever padding the body already had, rather than replacing it.
      const current = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${current + scrollbarWidth}px`;
    }

    return () => {
      /* Restored to what it WAS, not to "" — the body may have had its own
         overflow or padding set by something else, and blanking it would take
         that away too. Two overlays open at once unwind in reverse order, so
         each puts back what it found. */
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [locked]);
}

export default useBodyScrollLock;
