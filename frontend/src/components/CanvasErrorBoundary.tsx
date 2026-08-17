/**
 * A boundary around anything that renders through the GPU.
 *
 * The landing page's 3D globe sat inside a `<Suspense>` and nothing else, and
 * Suspense catches SUSPENSION — not errors. So the day WebGL failed to hand out
 * a context, the throw travelled all the way up, React found no boundary, and it
 * unmounted the WHOLE app: past the globe, past the FAQ, the CTA, the
 * testimonials and the footer. The page went black from that scroll position
 * down, and there was no way back except a reload.
 *
 * WebGL failing is not exotic. Chrome caps how many live contexts one process
 * may hold — somewhere around sixteen — and hands out no more once a person has
 * enough tabs open. A GPU process crash or reset kills existing contexts. Some
 * machines have hardware acceleration off, or the GPU blocklisted by a driver
 * bug. None of that is worth losing the page over: the globe is decoration, and
 * everything under it is not.
 *
 * A class component because that is the only thing React gives us for this;
 * there is no hook equivalent of componentDidCatch.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";

export default class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; label?: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Logged, not swallowed silently — a globe that quietly never appears is
    // its own kind of bug, and this is the only trace of why.
    console.error(
      `[${this.props.label || "CanvasErrorBoundary"}] falling back:`,
      error?.message || error,
      info?.componentStack?.split("\n")[1]?.trim() || ""
    );
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
