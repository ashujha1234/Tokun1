/**
 * Shown while a lazily-loaded route chunk is still downloading.
 *
 * Deliberately minimal: routes are code-split now, so this paints for a few
 * hundred milliseconds at most on a cold navigation and never again (the chunk
 * is cached). Anything heavier here would itself become a thing to download.
 */
const RouteFallback = () => (
  <div
    role="status"
    aria-label="Loading"
    className="flex min-h-screen w-full items-center justify-center bg-[#07060d]"
  >
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-[#A855F7]" />
  </div>
);

export default RouteFallback;
