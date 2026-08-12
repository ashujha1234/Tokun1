// Instagram Reels-style card for video prompts.
//
// Lived inside PromptMarketplacePage until the profile page needed the same
// thing: a video listing has to look and behave identically wherever it's
// shown, and a second copy would have drifted the moment either page changed.
// The styles come from pages/PromptMarketplace.css (.reel-card*), which both
// pages already import.
import React, { useEffect, useRef } from "react";
import { ShoppingCart, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isTeamMember } from "@/lib/orgRoles";

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
  isPlaying: boolean;
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

  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.play().catch(() => {});
    else videoRef.current.pause();
  }, [isPlaying]);

  // Listed but not purchasable — the seller is still going through Route payout
  // onboarding. Same rule the image cards use.
  const comingSoon = !!prompt.sellerVerificationPending || hasPayoutSetup === false;

  // Whether this viewer can act on this listing at all. Free prompts and
  // anything already owned or self-uploaded get no buy/cart row, matching the
  // image cards.
  const showActions = !isPurchased && !isOwn && !prompt.isFree;

  return (
    <div className="reel-card" onClick={() => onVideoPlay(prompt.id)}>
      {/* Video */}
      <video
        ref={videoRef}
        src={prompt.videoUrl}
        className="reel-card__video"
        loop
        muted
        playsInline
      />

      {/* Watermark */}
      {!isPurchased && (
        <span className="reel-card__wm-center" aria-hidden="true">Tokun.world</span>
      )}

      {/* Play / Pause hint */}
      {!isPlaying && (
        <div className="reel-card__play-hint">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
        </div>
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
                <button
                  type="button"
                  className="mp-card__pill mp-card__pill--cart"
                  onClick={(e) => { e.stopPropagation(); onAddToCart(prompt.id); }}
                >
                  <ShoppingCart />
                  Cart
                </button>
              )}

              {showActions && (
                comingSoon ? (
                  <button
                    type="button"
                    disabled
                    title="This seller's payout account is still being verified."
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
