import { useState } from "react";
import { ImageIcon } from "lucide-react";

/**
 * Prompt thumbnail that degrades to a drawn placeholder instead of a broken
 * image.
 *
 * The share/request modals rendered `src={thumbnail || "/icons/fallback.png"}`,
 * and that file does not exist in public/ — so any prompt without an image (a
 * video-only listing, or one with no attachment) pointed <img> at a 404 and the
 * browser drew its own "?" broken-image glyph. A missing thumbnail is normal,
 * not an error, so it gets a real empty state.
 *
 * onError covers the other case: a thumbnail URL that exists but fails to load.
 */
export default function PromptThumb({
  src,
  alt = "",
  className = "w-14 h-14",
}: {
  src?: string | null;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const usable = Boolean(src && src.trim()) && !failed;

  if (!usable) {
    return (
      <div
        role="img"
        aria-label={alt || "No preview available"}
        className={`${className} shrink-0 grid place-items-center rounded-lg border border-white/10 bg-white/[0.04]`}
      >
        <ImageIcon className="w-5 h-5 text-white/25" />
      </div>
    );
  }

  return (
    <img
      src={src as string}
      alt={alt}
      onError={() => setFailed(true)}
      className={`${className} shrink-0 rounded-lg object-cover`}
    />
  );
}
