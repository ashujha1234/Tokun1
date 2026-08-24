/**
 * A profile photo you can actually look at.
 *
 * The avatar in the profile hero was two dead ends. On somebody else's profile
 * it was a 96px square and nothing more — no click target, so the only way to
 * see a creator's photo at a size where you could recognise a face was to open
 * devtools and read the `src`. On your own profile the single click went
 * straight to the file picker, which meant the one thing you could not do with
 * your own photo was look at it: every click was an invitation to replace it,
 * and mis-clicking the avatar opened a file dialog you hadn't asked for.
 *
 * So the click now depends on what the click can sensibly mean:
 *
 *   viewer, photo exists   → open the photo
 *   viewer, no photo       → nothing (there is nothing to open, so no cursor,
 *                            no hover state, no lie about being clickable)
 *   owner, photo exists    → a two-item menu: view it, or upload a new one
 *   owner, no photo        → the file picker directly, because "view" would
 *                            open a placeholder
 *
 * The hidden <input type="file"> lives here but its ref is owned by the caller:
 * the Profile Strength checklist has an "Upload a profile photo" row that rings
 * this control and opens the picker, and it needs to keep reaching the input
 * without going through the menu.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, Eye, Upload, User, X } from "lucide-react";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";

const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

/* ────────────────────────── the photo, full size ────────────────────────── */

function PhotoDialog({
  url,
  name,
  canReplace,
  onReplace,
  onClose,
}: {
  url: string;
  name?: string;
  /** The owner is looking at their own photo, so offer the swap from in here too. */
  canReplace?: boolean;
  onReplace?: () => void;
  onClose: () => void;
}) {
  useBodyScrollLock(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* PORTALLED TO <body>, and that is not a detail.

     `position: fixed` resolves against the nearest ancestor with a filter,
     transform or backdrop-filter — not the viewport. The profile hero is
     `backdrop-blur-xl`, so this overlay took its size from that card: a
     "fullscreen" dialog laid out inside a 96px-tall avatar's parent, clipped at
     the panel's edges with the photo cut off. Nothing about the CSS here could
     have fixed that from the inside; it had to leave the subtree. */
  return createPortal(
    <div
      // Above the site header (z-999) and the hire/message popups (z-9999), for
      // the same reason the chat lightbox is: it is the topmost thing on screen.
      className="fixed inset-0 z-[9999999] grid place-items-center overflow-y-auto bg-black/85 backdrop-blur-sm p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={name ? `${name}'s profile photo` : "Profile photo"}
      onClick={onClose}
    >
      <div
        // Click-away closes; clicks on the card itself must not.
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[min(460px,92vw)] overflow-hidden rounded-3xl border border-white/10 bg-[#101012] shadow-[0_24px_90px_rgba(0,0,0,0.7)]"
      >
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-white">{name || "Profile photo"}</p>
            <p className="text-[11px] uppercase tracking-wide text-white/35">Profile photo</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* object-contain, not cover: this is the view that exists so the whole
            photo can be seen, and the 96px square upstairs already crops it.
            The height budget leaves room for the header and, when the owner is
            looking, the footer — so a tall photo shrinks to fit instead of
            pushing either off the screen. */}
        <div className="grid place-items-center bg-black/40 p-4">
          <img
            src={url}
            alt={name ? `${name}'s profile photo` : "Profile photo"}
            className={`w-auto max-w-full rounded-2xl object-contain ${
              canReplace ? "max-h-[calc(100vh-260px)]" : "max-h-[calc(100vh-200px)]"
            }`}
          />
        </div>

        {/* Nothing here for a visitor. Download and Open were on this bar and
            are gone: looking at whose profile you're on is the whole job, and
            offering to save a stranger's face to your disk is not part of it.
            The owner keeps the one control that does something for them. */}
        {canReplace && (
          <div className="flex items-center justify-end border-t border-white/[0.08] px-5 py-3.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onReplace?.();
              }}
              className="inline-flex h-9 items-center gap-2 rounded-full px-4 text-[13px] font-medium text-white"
              style={{ background: GRADIENT }}
            >
              <Upload className="h-4 w-4" />
              Change photo
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ─────────────────────────── the avatar itself ─────────────────────────── */

export default function ProfileAvatar({
  photoUrl,
  name,
  isOwner,
  highlight,
  fileInputRef,
  onSelectFile,
  className = "w-24 h-24 rounded-2xl",
}: {
  /** The uploaded photo, already resolved to a loadable URL. Null when there isn't one. */
  photoUrl: string | null;
  name?: string;
  isOwner: boolean;
  /** The checklist row is pointing at this control — ring it. */
  highlight?: boolean;
  /** Owned by the caller so the checklist row can open the picker directly. */
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
  onSelectFile?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewing, setViewing] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const ownRef = useRef<HTMLInputElement | null>(null);
  const inputRef = fileInputRef ?? ownRef;

  // Dismiss the menu the way every other menu on the page does — a click
  // anywhere else, or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const openPicker = () => inputRef.current?.click();

  // Nothing to open and nothing to upload → not a button. Guests and viewers
  // looking at a photoless profile get a plain square, which is the truth.
  const interactive = isOwner || !!photoUrl;

  const onAvatarClick = () => {
    if (!isOwner) {
      if (photoUrl) setViewing(true);
      return;
    }
    // Owner with a photo gets the choice; owner without one has only one
    // sensible outcome, so don't make them pick from a menu of one.
    if (photoUrl) setMenuOpen((v) => !v);
    else openPicker();
  };

  const hoverLabel = isOwner ? (photoUrl ? "Photo options" : "Add photo") : "View photo";

  return (
    <div className="relative" ref={wrapRef}>
      <div
        onClick={interactive ? onAvatarClick : undefined}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-haspopup={isOwner && photoUrl ? "menu" : undefined}
        aria-expanded={isOwner && photoUrl ? menuOpen : undefined}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onAvatarClick();
                }
              }
            : undefined
        }
        className={`relative overflow-hidden transition-all ${className} ${
          interactive ? "group cursor-pointer" : ""
        }`}
        style={highlight ? { boxShadow: "0 0 0 3px rgba(255,20,239,0.65)" } : undefined}
      >
        {photoUrl ? (
          <img src={photoUrl} alt={name || "Profile photo"} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-white/[0.06]">
            <User className="h-9 w-9 text-white/30" />
          </div>
        )}

        {interactive && (
          <div className="absolute inset-0 grid place-items-center bg-black/50 px-1 text-center text-[11px] leading-tight text-white opacity-0 transition-opacity group-hover:opacity-100">
            {hoverLabel}
          </div>
        )}

        {/* The camera badge is the owner's affordance. It used to be the only
            hint that the avatar did anything at all; now it stays as the
            "this is yours to change" marker. */}
        {isOwner && (
          <div
            className="absolute bottom-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full border-2 border-[#101012]"
            style={{ background: GRADIENT }}
          >
            <Camera className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {isOwner && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            setMenuOpen(false);
            onSelectFile?.(e);
          }}
        />
      )}

      {menuOpen && (
        <div
          role="menu"
          className="absolute left-0 top-full z-[60] mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#17171A] p-1 shadow-[0_18px_50px_rgba(0,0,0,0.6)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              setViewing(true);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-white/85 transition-colors hover:bg-white/[0.07] hover:text-white"
          >
            <Eye className="h-4 w-4 text-white/50" />
            View photo
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              openPicker();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-white/85 transition-colors hover:bg-white/[0.07] hover:text-white"
          >
            <Upload className="h-4 w-4 text-white/50" />
            Upload new photo
          </button>
        </div>
      )}

      {viewing && photoUrl && (
        <PhotoDialog
          url={photoUrl}
          name={name}
          canReplace={isOwner}
          onReplace={openPicker}
          onClose={() => setViewing(false)}
        />
      )}
    </div>
  );
}
