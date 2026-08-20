/**
 * A product in MY PRODUCTS — your own uploads, and the ones you've bought.
 *
 * Same card as everywhere else. It used to be its own design: a 260×460 tile
 * with round pills, icon-only buttons and a bespoke video variant, so a product
 * you had uploaded looked nothing like the same product in the marketplace, on a
 * profile or in your saved list. The frame, the badge ladder, the title/desc
 * clamps and the pill row now come from PromptMarketplace.css (.mp-card /
 * .reel-card) — the same stylesheet the marketplace uses — and only the ACTIONS
 * differ, because they have to: there is nothing to buy on a product you already
 * own, and everything to delete, edit, share or refund.
 *
 * One component rather than one per screen: this grid exists twice (the seller
 * dashboard and components/PromptHistory.tsx) and the two copies had already
 * drifted — one grew Edit and Share, the other never did. Same reasoning as
 * RefundReasonPicker and ConfirmModal.
 */

import { useRef } from "react";
import { Trash, Pencil, Users, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { StarRating } from "@/components/StarRating";
import "@/pages/PromptMarketplace.css";

/** The AI/admin review state of an upload, as a badge. Sellers only. */
function moderationBadge(
  status?: string,
): { label: string; bg: string; color: string } | null {
  switch (status) {
    case "pending":
    case "pending_review":
      return { label: "Pending Review", bg: "rgba(234,179,8,0.2)", color: "#facc15" };
    case "approved":
    case "admin_approved":
      return { label: "Approved", bg: "rgba(34,197,94,0.2)", color: "#4ade80" };
    case "admin_rejected":
      return { label: "Rejected", bg: "rgba(239,68,68,0.2)", color: "#f87171" };
    case "flagged":
      return { label: "Flagged", bg: "rgba(239,68,68,0.2)", color: "#f87171" };
    case "edit_requested":
      return { label: "Changes Requested", bg: "rgba(167,139,250,0.2)", color: "#c4b5fd" };
    default:
      return null;
  }
}

export default function ProductGridCard({
  prompt,
  isUploaded = false,
  onPreview,
  onDelete,
  onEdit,
  onShare,
  onRequestRefund,
}: {
  prompt: any;
  /** True on your own upload, false on something you bought. */
  isUploaded?: boolean;
  onPreview: (p: any) => void;
  onDelete?: (p: any) => void;
  onEdit?: (p: any) => void;
  onShare?: (p: any) => void;
  onRequestRefund?: (p: any) => void;
}) {
  const { user } = useAuth() as any;
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  const isVideo = !!prompt.videoUrl;
  const priceLabel = prompt.isFree ? "FREE" : `₹${Number(prompt.price ?? 0).toFixed(2)}`;
  const badge = isUploaded ? moderationBadge(prompt.mediaValidation?.status) : null;
  const needsEdit = isUploaded && prompt.mediaValidation?.status === "edit_requested";

  const canShareWithTeam =
    !isUploaded && !!onShare && user?.userType === "ORG" && user?.role === "Owner";

  /* Free products were never charged, so there is nothing to refund — and the
     24-hour window has to close on screen as well as on the server. The deadline
     comes from the API (refundEligibleUntil) rather than being recomputed here,
     so what's offered is exactly what will be accepted. Older responses carried
     neither field; there, showing the button and letting the server refuse is
     friendlier than hiding a refund someone is still entitled to. */
  const refundWindowOpen =
    prompt.refundEligible ??
    (prompt.refundEligibleUntil
      ? Date.now() < new Date(prompt.refundEligibleUntil).getTime()
      : true);

  const canRefund =
    !isUploaded &&
    !!onRequestRefund &&
    !prompt.isFree &&
    !!prompt.purchaseId &&
    refundWindowOpen;

  const refundPending = !!prompt.refundStatus && prompt.refundStatus !== "NONE";
  const refundState = refundPending
    ? {
        label:
          prompt.refundStatus === "REQUESTED"
            ? "Refund requested"
            : prompt.refundStatus === "APPROVED"
              ? "Refund approved"
              : prompt.refundStatus === "REJECTED"
                ? "Refund rejected"
                : "Refunded",
        bg:
          prompt.refundStatus === "REJECTED"
            ? "rgba(239,68,68,0.15)"
            : "rgba(34,197,94,0.15)",
        color: prompt.refundStatus === "REJECTED" ? "#f87171" : "#4ade80",
      }
    : null;

  /* The action row. Quiet pills, not the gradient one: the gradient is the
     marketplace's buy button, and nothing here is a purchase. */
  const actions = (
    <>
      {isUploaded ? (
        <>
          {needsEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(prompt);
              }}
              className="mp-card__pill mp-card__pill--cart"
              title="Admin requested changes — edit & resubmit"
            >
              <Pencil />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(prompt);
              }}
              className="mp-card__pill mp-card__pill--cart"
              title="Delete this product"
            >
              <Trash />
              Delete
            </button>
          )}
        </>
      ) : (
        <>
          {canShareWithTeam && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare?.(prompt);
              }}
              className="mp-card__pill mp-card__pill--cart"
              title="Share with team"
            >
              <Users />
              Share
            </button>
          )}
          {refundState ? (
            <span
              className="mp-card__pill"
              style={{ background: refundState.bg, color: refundState.color, cursor: "default" }}
            >
              {refundState.label}
            </span>
          ) : (
            canRefund && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestRefund?.(prompt);
                }}
                className="mp-card__pill mp-card__pill--cart"
                title="Request a refund"
              >
                <RotateCcw />
                Refund
              </button>
            )
          )}
        </>
      )}
    </>
  );

  /* ONE FRAME FOR BOTH, the 9:16 reel — the same card the marketplace rails, the
     profile and the saved list render. An image used to sit in the wide .mp-card
     here, so a grid holding both kinds showed two different objects in one row;
     only the media inside the frame changes now. A product shouldn't change
     shape depending on which page it is listed on. */
  return (
    <div
      className="reel-card"
      onClick={() => onPreview(prompt)}
      /* HOVER PLAYS IT, rather than a play/pause circle in the middle of the
         artwork: the card's own job is to open the product, so the one obvious
         control in the middle of it was doing something else. On a touch screen
         there is no hover, and tapping opens the product — which is the useful
         action anyway. No-op on an image card. */
      onMouseEnter={() => {
        videoElRef.current?.play().catch(() => {});
      }}
      onMouseLeave={() => {
        const el = videoElRef.current;
        if (!el) return;
        el.pause();
        // Back to the first frame, so the card looks the same next time round.
        el.currentTime = 0;
      }}
    >
      {isVideo ? (
        <video
          ref={videoElRef}
          className="reel-card__video"
          src={prompt.videoUrl}
          poster={prompt.posterUrl || undefined}
          loop
          muted
          playsInline
          preload="metadata"
        />
      ) : (
        <img
          className="reel-card__video"
          src={prompt.imageUrl || prompt.posterUrl}
          alt={prompt.title || "Product preview"}
          loading="lazy"
          draggable={false}
        />
      )}

      <div className="reel-card__top">
        <span className="reel-card__cat">{prompt.category?.toUpperCase()}</span>
        {badge ? (
          <span className="reel-card__badge" style={{ background: badge.bg, color: badge.color }}>
            {badge.label}
          </span>
        ) : (
          !isUploaded && (
            <span className="reel-card__badge reel-card__badge--owned">PURCHASED</span>
          )
        )}
      </div>

      <div className="reel-card__bottom">
        <div className="reel-card__bottom-top">
          <div className="reel-card__author">
            <span className="reel-card__avatar">
              {(prompt.uploaderName || user?.name || "U").slice(0, 2).toUpperCase()}
            </span>
            <span className="reel-card__author-name">
              {isUploaded ? "Your upload" : prompt.uploaderName || "Creator"}
            </span>
          </div>
          {/* Only once there is a score to show — an empty "no reviews yet" eats
              the little horizontal room a 9:16 card has for its author row.
              Same rule as VideoReelCard. */}
          {Number(prompt.reviewCount || 0) > 0 && (
            <StarRating
              value={prompt.rating}
              count={prompt.reviewCount}
              size={11}
              compact
              className="mr-1"
            />
          )}
          <button
            type="button"
            className="reel-card__details-btn"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(prompt);
            }}
          >
            Details ›
          </button>
        </div>

        <div className="mp-card__footer">
          <div className="mp-card__pill mp-card__pill--muted">{priceLabel}</div>
          {actions}
        </div>
      </div>
    </div>
  );
}
