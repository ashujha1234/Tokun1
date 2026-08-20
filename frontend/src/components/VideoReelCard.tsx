// Instagram Reels-style card for a product — video or image.
//
// Lived inside PromptMarketplacePage until the profile page needed the same
// thing: a listing has to look and behave identically wherever it's shown, and
// a second copy would have drifted the moment either page changed.
import React, { useEffect, useRef, useState } from "react";
/* Its own styles, rather than relying on the page to have imported them.
   .reel-card and .mp-card__pill live in the marketplace stylesheet, and every
   page that rendered this card had to remember to pull that in — the brand page
   didn't, so the card came out completely unstyled there. Vite dedupes the
   import, so pages that already have it are unaffected. */
import "@/pages/PromptMarketplace.css";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Lock, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isTeamMember } from "@/lib/orgRoles";
import { StarRating } from "@/components/StarRating";

/* ---------- author initials (UI only) ---------- */
export const authorInitials = (name?: string) =>
  (name || "U").trim().slice(0, 2).toUpperCase();

/* The price shown on a listing: what the SELLER set, with no fee added.

   This used to return tokun_price — list price plus Tokun's platform fee — so a
   prompt the seller listed at ₹300 advertised itself as ₹309. Browsing prices
   should be the seller's own number; the platform fee belongs at checkout,
   where the cart already itemises it (Subtotal / Platform fee / Total) and the
   details panel spells it out as "₹300 + ₹9 platform fee".

   Nothing about what gets CHARGED changes: the amount is computed server-side
   by splitPromptSale() from the live fee rate, never from this. */
export const cardPrice = (p: any): number => {
  const listed = Number(p?.price ?? 0);
  if (listed > 0) return listed;
  /* Legacy rows that only ever stored the marked-up figure. Rare, and better
     than rendering a paid prompt as free. */
  return Number(p?.listPrice ?? p?.tokunPrice ?? p?.tokun_price ?? 0);
};


export default function VideoReelCard({
  prompt,
  isPurchased,
  isOwn,
  isPlaying,
  hasPayoutSetup,
  onVideoPlay,
  onAddToCart,
  onBuyNow,
  onOpenDetails,
  onNavigateToProfile,
}: {
  prompt: any;
  isPurchased: boolean;
  isOwn: boolean;
  /** Legacy one-video-at-a-time flag. Every reel now autoplays on its own (see
      below), so this no longer drives playback — kept optional so the existing
      call sites don't have to change. */
  isPlaying?: boolean;
  /** false = this prompt's seller has no Route payout account yet. */
  hasPayoutSetup?: boolean;
  onVideoPlay: (id: string | number) => void;
  onAddToCart: (id: string | number) => void;
  onBuyNow: (p: any) => void;
  onOpenDetails: (p: any) => void;
  onNavigateToProfile: (id: string | null | undefined) => void;
}) {
  // Read from context rather than a prop: these cards are rendered from several
  // call sites and the rule is the same everywhere, so threading a flag through
  // each one only adds places to forget it.
  const { user: viewer } = useAuth?.() || ({} as any);
  const teamMember = isTeamMember(viewer);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* An image listing renders in this same card.
     The marketplace rails put both kinds side by side, and until now a video was
     a full-bleed 9:16 tile while an image was a 4:3 thumbnail with a block of
     text under it — the same width and the same height, but visibly two
     different cards in one row. The media is what differed, so that is what is
     shared: the frame, the badges, the watermark and the price/cart/buy row are
     the card's, and only the element inside the frame changes. */
  const isVideo = !!prompt.videoUrl;

  /* Every reel plays by itself now, the way a feed does — a grid of frozen
     first frames each waiting for a click told a browser nothing about what
     the prompt actually produces. Two things keep that from being expensive:
     only the cards on screen are playing (the observer below), and a card the
     viewer has deliberately paused stays paused even as it scrolls in and out. */
  const [inView, setInView] = useState(false);
  /* No pause state. Reels autoplay whenever they're on screen and stop when
     they scroll off — there is no longer any way to pause one, because the tap
     that used to do it now opens the product. */

  useEffect(() => {
    // Nothing to observe on an image card — there is no playback to gate.
    if (!isVideo) return;

    const el = videoRef.current;
    if (!el) return;

    // No IntersectionObserver (old Safari, jsdom in tests): fall back to
    // "always in view", which is the pre-observer behaviour of an autoplaying
    // video rather than a card that never plays.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      // A quarter of the card is enough to be worth playing; the margin starts
      // it just before it scrolls into view so it isn't a black rectangle.
      { threshold: 0.25, rootMargin: "100px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isVideo]);

  useEffect(() => {
    if (!isVideo) return;
    const el = videoRef.current;
    if (!el) return;
    if (inView) el.play().catch(() => {});
    else el.pause();
  }, [inView, isVideo]);


  // Listed but not purchasable — the seller is still going through Route payout
  // onboarding. Same rule the image cards use.
  const comingSoon = !!prompt.sellerVerificationPending || hasPayoutSetup === false;

  // Whether this viewer can act on this listing at all. Free prompts and
  // anything already owned or self-uploaded get no buy/cart row, matching the
  // image cards.
  const showActions = !isPurchased && !isOwn && !prompt.isFree;

  // Same question, same answer as the image cards — see isInCart in CartContext.
  const { isInCart } = useCart();
  const inCart = isInCart(prompt.id);

  return (
    <div
      className="reel-card"
      onClick={() => {
        /* Opens the details panel. It used to toggle pause on the card, which
           made the whole tile a play/pause button — so the one thing a tap on a
           product is expected to do (open it) was only available on the small
           "Details ›" link, and tapping the video itself just froze it.
           The parent is still told which reel was touched; pages keep that. */
        onVideoPlay(prompt.id);
        onOpenDetails(prompt);
      }}
    >
      {/* Media — the one thing that differs between a video and an image
          listing. Same class either way, so both fill the frame identically
          (position:absolute, inset:0, object-fit:cover). */}
      {isVideo ? (
        <video
          ref={videoRef}
          src={prompt.videoUrl}
          /* The poster paints before a single byte of video arrives. Without it a
             card is a black rectangle for as long as the file takes — and these
             are the seller's originals unless a preview was generated. */
          poster={prompt.posterUrl || undefined}
          className="reel-card__video"
          loop
          muted
          // Muted + inline is what lets a browser autoplay this at all; without
          // both, the play() above is rejected and every card sits frozen.
          autoPlay
          playsInline
          preload="metadata"
        />
      ) : (
        <img
          src={prompt.imageUrl || prompt.posterUrl}
          alt={prompt.title || "Product preview"}
          className="reel-card__video"
          loading="lazy"
          draggable={false}
        />
      )}

      {/* Watermark */}
      {!isPurchased && (
        <span className="reel-card__wm-center" aria-hidden="true">Tokun.world</span>
      )}

      {/* Top badges */}
      <div className="reel-card__top">
        <span className="reel-card__cat">{prompt.category?.toUpperCase()}</span>
        {isPurchased ? (
          <span className="reel-card__badge reel-card__badge--owned">PURCHASED</span>
        ) : comingSoon ? (
          // Replaces the unlock badge rather than joining it — telling someone
          // to "purchase to unlock" something they can't buy yet is nonsense.
          <span className="reel-card__badge reel-card__badge--soon">COMING SOON</span>
        ) : (
          <span className="reel-card__badge reel-card__badge--lock">
            {prompt.exclusive ? "ONE-TIME" : "PURCHASE TO UNLOCK"}
          </span>
        )}
      </div>

      {/* Bottom overlay.
          No title here — it's the first thing the details modal shows, and on
          a 9:16 reel it was two lines of text competing with the video for the
          only space the buttons could sit in. Tap Details (or the card) to
          read it. */}
      <div className="reel-card__bottom">
        <div className="reel-card__bottom-top">
          <div className="reel-card__author" onClick={(e) => { e.stopPropagation(); onNavigateToProfile(prompt.uploaderId); }}>
            <span className="reel-card__avatar">{authorInitials(prompt.uploaderName)}</span>
            <span className="reel-card__author-name">{prompt.uploaderName || "Unknown"}</span>
          </div>
          {/* Rating, only once there is one: an empty "No reviews yet" would eat
              the little horizontal room a 9:16 reel has for its author row. */}
          {Number(prompt.reviewCount || 0) > 0 && (
            <StarRating value={prompt.rating} count={prompt.reviewCount} size={11} compact className="mr-1" />
          )}
          <button
            className="reel-card__details-btn"
            onClick={(e) => { e.stopPropagation(); onOpenDetails(prompt); }}
          >
            Details ›
          </button>
        </div>

        {/* Deliberately the image card's own .mp-card__pill classes, not a
            lookalike. Both cards sit in the same rail, so the price/cart/buy
            row has to be pixel-identical — a second set of styles would drift
            the first time either was touched. */}
        <div className="mp-card__footer">
          {prompt.isFree ? (
            <div className="mp-card__pill mp-card__pill--free">FREE</div>
          ) : isPurchased ? (
            <div className="mp-card__pill mp-card__pill--owned">PURCHASED</div>
          ) : (
            <>
              <div className="mp-card__pill mp-card__pill--muted">
                ₹{cardPrice(prompt).toFixed(2)}
              </div>

              {showActions && !teamMember && !comingSoon && (
                inCart ? (
                  <span className="mp-card__pill mp-card__pill--in-cart">
                    <Check />
                    In cart
                  </span>
                ) : (
                  <button
                    type="button"
                    className="mp-card__pill mp-card__pill--cart"
                    onClick={(e) => { e.stopPropagation(); onAddToCart(prompt.id); }}
                  >
                    <ShoppingCart />
                    Cart
                  </button>
                )
              )}

              {showActions && (
                comingSoon ? (
                  <button
                    type="button"
                    disabled
                    title="This Creator's payout account is still being verified."
                    className="mp-card__pill mp-card__pill--buy opacity-50 cursor-not-allowed"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Lock />
                    Buy Now
                  </button>
                ) : (
                  // A TM's only route to a paid prompt is asking their Owner —
                  // onBuyNow opens the request modal for them.
                  <button
                    type="button"
                    className="mp-card__pill mp-card__pill--buy"
                    onClick={(e) => { e.stopPropagation(); onBuyNow(prompt); }}
                  >
                    {teamMember ? "Request" : "Buy Now"}
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* The slide-up details panel that used to sit here is gone. Nothing
          ever called setShowPanel(true), so it could never render — and it
          held a second copy of the Buy Now / Add to Cart buttons, which are
          now on the card itself above. */}
    </div>
  );
}
