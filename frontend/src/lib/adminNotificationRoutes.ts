/**
 * Where an admin notification leads.
 *
 * Every admin notification is about a thing that needs looking at, and until
 * now most of them were dead text: the notifications page only marked a card
 * read, and the bell on the dashboard knew four types and ignored the rest. An
 * admin read "Refund requested for …" and then went and found the refund queue
 * by hand.
 *
 * One table, used by both surfaces, so the bell and the page can't send an
 * admin to two different places for the same notification.
 *
 * Some destinations are routed pages (/admin/refunds); others are tabs on the
 * dashboard, which reads `?tab=` on mount. Both are expressed as plain URLs so
 * a caller only has to navigate.
 */

export type AdminNotificationLike = {
  type?: string;
  promptId?: { _id?: string } | string | null;
  meta?: Record<string, any> | null;
};

const promptIdOf = (n: AdminNotificationLike): string | null => {
  const raw: any = n?.promptId;
  if (!raw) return null;
  return typeof raw === "string" ? raw : raw?._id ? String(raw._id) : null;
};

/**
 * The admin destination for a notification, or null when there genuinely isn't
 * one — the caller then just marks it read, which is what every type did before.
 */
export function adminNotificationHref(n: AdminNotificationLike): string | null {
  const type = String(n?.type || "");
  const promptId = promptIdOf(n);

  switch (type) {
    /* ── Refunds ── */
    case "ADMIN_REFUND_REQUESTED":
      return "/admin/refunds";

    /* ── Reports on a listing ──
       The prompt id rides along so the reports tab can scroll to the row this
       notification is about rather than the top of a queue. */
    case "ADMIN_PROMPT_REPORTED":
      return promptId
        ? `/admin/dashboard?tab=reports&promptId=${encodeURIComponent(promptId)}`
        : "/admin/dashboard?tab=reports";

    /* ── The prompt-media validation queue ──
       FLAGGED and REVIEW are different verdicts but the same screen. */
    case "ADMIN_PROMPT_FLAGGED":
    case "ADMIN_PROMPT_REVIEW":
    case "ADMIN_REVIEW_NEEDED":
      return promptId
        ? `/admin/dashboard?tab=analytics&promptId=${encodeURIComponent(promptId)}`
        : "/admin/dashboard?tab=analytics";

    /* ── Freelancer intro videos ── */
    case "ADMIN_FREELANCER_VIDEO_REVIEW_NEEDED":
      return "/admin/dashboard?tab=freelancers";

    /* ── Escrow cancellations that became ours to rule on ── */
    case "ESCROW_DISPUTE_ADMIN_REVIEW":
    case "ESCROW_DISPUTE_ESCALATED":
      return "/admin/disputes";

    /* ── Escrow money that needs an eye: a deadline Razorpay won't hold past,
           and a revision the seller never answered. Both are worked from the
           escrow dashboard. ── */
    case "ESCROW_DEADLINE_APPROACHING":
    case "REVISION_STALLED":
    case "HIRE_AUTO_RELEASED":
      return "/admin/escrow";

    default:
      return null;
  }
}
