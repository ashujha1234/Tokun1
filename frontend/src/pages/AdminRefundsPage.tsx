import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, CheckCircle2, XCircle, Clock, ImageOff, X } from "lucide-react";
// window.alert blocks the tab and looks nothing like the rest of the admin UI.
import { toast } from "@/hooks/use-toast";
import RatingPenaltyControl from "@/components/admin/RatingPenaltyControl";
// Attachments are stored as absolute Blob URLs; mediaUrl passes those through
// untouched and still resolves any older API-relative path.
import { mediaUrl } from "@/lib/mediaUrl";
// Separates what the buyer ticked from what they typed, including on older
// requests where both were stored in one field.
import { splitRefundReason } from "@/lib/refundReasons";

const API_BASE = `${(import.meta.env.VITE_API_URL || "http://localhost:5002").replace(
  /\/$/,
  ""
)}/api/admin/refunds`;

function getAuthHeaders() {
  const token = localStorage.getItem("tokun_admin_token") || localStorage.getItem("adminToken") || "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}` } : {}),
  };
}

/* A buyer or seller name on a refund row, linked to their ADMIN profile.
 *
 * These used to point at /profile/:id — the public page, which shows a
 * shopfront. That is the wrong view for judging a refund: an admin needs the
 * dashboard's own profile, with the person's purchases, uploads, plan and the
 * suspend control on it.
 *
 * Those profiles are dashboard state rather than routes, so the link carries
 * the target in the query string and Dashboard opens it on mount. `view`
 * differs by side: a buyer opens the user profile, a seller the seller profile
 * (both are User documents — GET /api/seller/:id looks up a User too).
 *
 * New tab on purpose: an admin is working a queue, and navigating away
 * mid-decision would drop the list and their place in it.
 */
function PartyLink({
  party,
  view,
}: {
  party?: { _id: string; name?: string; email?: string };
  view: "user" | "seller";
}) {
  const label = party?.name || party?.email || "Unknown";
  if (!party?._id) return <span>{label}</span>;

  return (
    <a
      href={`/admin/dashboard?view=${view}&id=${party._id}`}
      target="_blank"
      rel="noreferrer"
      title={party.email || undefined}
      className="text-white/70 underline underline-offset-2 hover:text-white transition-colors"
    >
      {label}
    </a>
  );
}

type RefundRequest = {
  _id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  /* What the buyer TICKED, one reason per line. */
  reason: string;
  /* What the buyer typed in their own words. Optional: absent on requests filed
     before this was split out of `reason`, and on tick-only requests. */
  description?: string;
  /* Screenshots the buyer attached when filing. Absolute Blob URLs. Optional —
     requests filed before attachments existed have no such field. */
  attachments?: string[];
  refundAmount: number;
  adminNote?: string;
  createdAt: string;
  resolvedAt?: string;
  buyer?: { _id: string; name?: string; email?: string };
  seller?: { _id: string; name?: string; email?: string };
  /* The product. Null when the prompt has since been deleted — the purchase's
     promptSnapshot below is the fallback for exactly that case. */
  prompt?: {
    _id: string;
    title?: string;
    description?: string;
    attachment?: { path?: string; type?: string };
    price?: number;
    free?: boolean;
  };
  purchase?: {
    _id: string;
    pricePaid?: number;
    /* Non-refundable: these paid for running the transaction. Sent so the
       confirm step can show the refund as arithmetic instead of a bare number
       that looks short of what the buyer paid. */
    platformFee?: number;
    platformFeeGst?: number;
    razorpayPaymentId?: string;
    routeTransferId?: string | null;
    purchasedAt?: string;
    /* What the buyer did with the code, if the product had any — see
       Purchase.codeAccess. Reading is inspection and carries no implication;
       a copy or a download is possession, and the gap between that and the
       refund request is the thing worth looking at. */
    codeAccess?: {
      firstViewedAt?: string | null;
      lastViewedAt?: string | null;
      viewCount?: number;
      firstTakenAt?: string | null;
      lastTakenAt?: string | null;
      takeCount?: number;
    };
    promptSnapshot?: {
      title?: string;
      description?: string;
      attachment?: { path?: string; type?: string };
    };
  };
};

/* One place that decides what a refund row knows about the product, so the row
   and the popup can't disagree about which title or preview is the right one. */
function productOf(request: RefundRequest) {
  const snapshot = request.purchase?.promptSnapshot;
  const attachment = request.prompt?.attachment || snapshot?.attachment;
  return {
    title: request.prompt?.title || snapshot?.title || "",
    description: request.prompt?.description || snapshot?.description || "",
    attachment,
    preview: mediaUrl(attachment?.path),
    isVideo: attachment?.type === "video",
    promptId: request.prompt?._id,
    listedPrice: request.prompt?.free
      ? "Free listing"
      : typeof request.prompt?.price === "number"
      ? `Listed ₹${request.prompt.price}`
      : null,
  };
}

/**
 * What the buyer did with the code, as a timeline relative to the purchase.
 *
 * Renders nothing at all when there is no code access on record — most products
 * are prompt-only, and an empty "Code access" heading on every row would be
 * noise that trains the admin to stop reading this area.
 *
 * IT DOES NOT RECOMMEND A DECISION, on purpose. There is no colour coding by
 * verdict and no "likely abuse" label, because the same numbers describe both a
 * scam and the most legitimate complaint there is: a buyer downloads the code,
 * finds it broken, and asks for their money back. What decides the refund is the
 * reason, which is in the two blocks above this one. This is what makes that
 * reason checkable.
 *
 * The two facts worth reading off it are the ORDER and the GAP. Taken → refund
 * four minutes later is one story; taken → six hours → "a dependency is missing"
 * is a different one. Both are shown as offsets from the purchase rather than
 * wall-clock times, because the offsets are the part that means anything.
 */
function CodeAccessTimeline({ request }: { request: RefundRequest }) {
  const access = request.purchase?.codeAccess;
  if (!access) return null;

  const viewed = Number(access.viewCount || 0);
  const taken = Number(access.takeCount || 0);
  if (!viewed && !taken) return null;

  const purchasedAt = request.purchase?.purchasedAt
    ? new Date(request.purchase.purchasedAt).getTime()
    : null;

  /* "12 min after purchase" rather than a timestamp. An admin comparing three
     absolute times in their head is doing arithmetic the page can do for them,
     and the arithmetic is the entire point of the row. */
  const since = (iso?: string | null) => {
    if (!iso || !purchasedAt) return null;
    const mins = Math.round((new Date(iso).getTime() - purchasedAt) / 60000);
    if (mins < 1) return "within a minute of purchase";
    if (mins < 60) return `${mins} min after purchase`;
    const hours = mins / 60;
    if (hours < 48) return `${hours < 10 ? hours.toFixed(1) : Math.round(hours)} h after purchase`;
    return `${Math.round(hours / 24)} days after purchase`;
  };

  const rows = [
    viewed && {
      label: "Read the code",
      detail: since(access.firstViewedAt),
      count: viewed > 1 ? `${viewed}×` : null,
      // Reading is inspection. Stated plainly so nobody reads this line as an
      // accusation — a buyer who never opened the file has a WEAKER complaint,
      // not a stronger one.
      note: "Inspection — expected before any judgement about quality",
    },
    taken && {
      label: "Took a copy",
      detail: since(access.firstTakenAt),
      count: taken > 1 ? `${taken}×` : null,
      note: "Copied or downloaded — the buyer has the files",
    },
  ].filter(Boolean) as {
    label: string;
    detail: string | null;
    count: string | null;
    note: string;
  }[];

  const requestedAt = since(request.createdAt);

  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5">
        Code access
      </p>
      <div className="space-y-2 rounded-lg bg-black/25 p-3">
        {rows.map((r) => (
          <div key={r.label} className="text-sm">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-white/85">{r.label}</span>
              {r.detail && <span className="text-white/50">— {r.detail}</span>}
              {r.count && <span className="text-white/35 text-[12px]">({r.count})</span>}
            </div>
            <p className="text-[11px] text-white/35">{r.note}</p>
          </div>
        ))}

        {requestedAt && (
          <div className="border-t border-white/10 pt-2 text-sm text-white/70">
            Refund requested — {requestedAt}
          </div>
        )}
      </div>
    </div>
  );
}

/* The product, full size, without leaving the queue.
 *
 * The title used to link to /prompt-marketplace?prompt=<id> in a new tab: to
 * look at a 14px thumbnail an admin loaded the entire public marketplace,
 * waited for its feed, and then read the listing through a shopfront built for
 * buyers. Everything needed to judge the refund is already in this response. */
function ProductModal({
  request,
  onClose,
}: {
  request: RefundRequest;
  onClose: () => void;
}) {
  const product = productOf(request);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[1200] grid place-items-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.title || "Prompt"}
    >
      <div
        className="w-full max-w-[720px] max-h-[88vh] overflow-y-auto rounded-2xl border border-white/10"
        style={{ background: "#131316" }}
        // The backdrop closes on click; the sheet itself must not.
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-5 pb-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-white/40">
              Product being refunded
            </p>
            <h2 className="text-lg font-semibold text-white mt-1 break-words">
              {product.title || "Untitled prompt"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5">
          <div className="rounded-xl overflow-hidden bg-black/40 border border-white/10 grid place-items-center min-h-[220px]">
            {product.preview && product.isVideo ? (
              // Controls on purpose: judging "the video isn't what was
              // advertised" means watching it, not looking at a poster frame.
              <video
                src={product.preview}
                controls
                playsInline
                className="w-full max-h-[46vh] object-contain"
              />
            ) : product.preview ? (
              <img loading="lazy" decoding="async"
                src={product.preview}
                alt={product.title}
                className="w-full max-h-[46vh] object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/30 py-16">
                <ImageOff size={22} />
                <span className="text-xs">No preview on this listing</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {product.description && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5">
                Listing description
              </p>
              <p className="text-sm text-white/75 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div>
              <p className="text-white/40">Sold as</p>
              <p className="text-white/85 mt-0.5">{product.listedPrice || "—"}</p>
            </div>
            <div>
              <p className="text-white/40">Buyer paid</p>
              <p className="text-white/85 mt-0.5">
                {typeof request.purchase?.pricePaid === "number"
                  ? `₹${request.purchase.pricePaid}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-white/40">Purchased</p>
              <p className="text-white/85 mt-0.5">
                {request.purchase?.purchasedAt
                  ? new Date(request.purchase.purchasedAt).toLocaleString("en-IN")
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-white/40">Creator</p>
              <p className="text-white/85 mt-0.5 truncate">
                {request.seller?.name || request.seller?.email || "Unknown"}
              </p>
            </div>
          </div>

          {/* The buyer's own words and evidence, beside the thing they bought —
              the comparison the decision actually turns on. */}
          {/* Two blocks, because they are two different kinds of evidence: the
              reason is one of a fixed set the buyer picked from, the description
              is whatever they typed. splitRefundReason also rescues the older
              requests, where both were packed into `reason` with the note on an
              "Other: …" line — those used to render that label verbatim inside
              the reason box. Each block is skipped when empty, so a note-only
              request doesn't show an empty "Reason selected". */}
          {(() => {
            const parts = splitRefundReason(request.reason, request.description);
            return (
              <>
                {!!parts.reason && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5">
                      Reason selected
                    </p>
                    <p className="text-sm text-white/75 bg-black/25 rounded-lg p-3 whitespace-pre-line">
                      {parts.reason}
                    </p>
                  </div>
                )}

                {!!parts.description && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5">
                      Buyer's description
                    </p>
                    <p className="text-sm text-white/75 bg-black/25 rounded-lg p-3 whitespace-pre-line">
                      {parts.description}
                    </p>
                  </div>
                )}
              </>
            );
          })()}

          <CodeAccessTimeline request={request} />

          {!!request.attachments?.length && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">
                Buyer's screenshots ({request.attachments.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {request.attachments.map((url, i) => (
                  <a key={`${url}-${i}`} href={mediaUrl(url)} target="_blank" rel="noreferrer">
                    <img loading="lazy" decoding="async"
                      src={mediaUrl(url)}
                      alt={`Refund evidence ${i + 1}`}
                      className="h-24 w-24 object-cover rounded-lg border border-white/15 hover:border-white/40 transition-colors"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] text-white/30">
            Prompt ID: {product.promptId || "— (prompt deleted)"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* The prompt being refunded, shown as the thing it is rather than a line of
   text. A refund row used to lead with the buyer's reason and name the product
   in one small heading that read "Untitled prompt" whenever the populate came
   back empty — so "the video wasn't what was advertised" arrived with no way to
   see the advert. This puts the listing's own preview and title on the row, and
   links the title to the public listing so an admin can open what the buyer
   bought before deciding.
   Falls back to the purchase snapshot, which survives the prompt's deletion. */
function RefundProduct({
  request,
  onOpen,
}: {
  request: RefundRequest;
  onOpen: () => void;
}) {
  const { title, preview, isVideo, promptId, listedPrice } = productOf(request);

  return (
    /* The whole block opens the popup — thumbnail included, since that is what
       an admin reaches for when they want a better look at it. */
    <button
      type="button"
      onClick={onOpen}
      className="flex items-start gap-3 min-w-0 text-left group"
    >
      <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-white/[0.06] border border-white/10 group-hover:border-white/30 transition-colors grid place-items-center">
        {preview && isVideo ? (
          // muted+playsInline so the poster frame renders inline on mobile
          // Safari, which otherwise shows an empty box until you tap.
          <video src={preview} className="h-full w-full object-cover" muted playsInline preload="metadata" />
        ) : preview ? (
          <img loading="lazy" decoding="async" src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageOff className="text-white/30" size={16} />
        )}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold underline underline-offset-2 decoration-white/25 group-hover:decoration-white transition-colors">
          {title || "Untitled prompt"}
          {!promptId && (
            /* Says why the listing itself can't be reached any more — the
               preview and copy below still come from the purchase snapshot. */
            <span className="ml-2 text-[11px] font-normal text-white/40">(prompt deleted)</span>
          )}
        </p>
        <p className="text-[11px] text-white/35 mt-0.5">
          {listedPrice && <>{listedPrice} · </>}
          View product
        </p>
      </div>
    </button>
  );
}

const TABS: Array<{ id: "PENDING" | "APPROVED" | "REJECTED"; label: string }> = [
  { id: "PENDING", label: "Pending" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Rejected" },
];

export default function AdminRefundsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const fetchRequests = async (status: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/?status=${status}`, { headers: getAuthHeaders() });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) setRequests(data.refundRequests || []);
    } catch (err) {
      console.error("Fetch refund requests failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(tab);
  }, [tab]);

  /* Approving moves real money, so it keeps a confirm step — but as an in-page
     panel rather than window.confirm. `confirmingId` is the row awaiting it. */
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // The row whose product popup is open. Holds the request itself rather than
  // an id so the popup can't outlive a refresh that dropped that row.
  const [productRequest, setProductRequest] = useState<RefundRequest | null>(null);

  const approve = async (id: string) => {
    try {
      setActioningId(id);
      const res = await fetch(`${API_BASE}/${id}/approve`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ adminNote: noteDraft[id] || "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || "Failed to approve refund");
      }
      setRequests((prev) => prev.filter((r) => r._id !== id));
      setConfirmingId(null);
      toast({
        title: "Refund approved",
        description: "The buyer is being refunded via Razorpay and has been notified.",
      });
    } catch (err: any) {
      toast({
        title: "Refund not approved",
        description: err?.message || "The refund didn't go through. Try again.",
      });
    } finally {
      setActioningId(null);
    }
  };

  const reject = async (id: string) => {
    const adminNote = noteDraft[id] || "";
    if (!adminNote.trim()) {
      toast({
        title: "A note is required",
        description:
          "Add a short note explaining why this refund is being rejected — the buyer sees it.",
      });
      return;
    }
    try {
      setActioningId(id);
      const res = await fetch(`${API_BASE}/${id}/reject`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ adminNote }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to reject refund");
      }
      setRequests((prev) => prev.filter((r) => r._id !== id));
      toast({
        title: "Refund rejected",
        description: "The buyer has been notified with your note.",
      });
    } catch (err: any) {
      toast({
        title: "Refund not rejected",
        description: err?.message || "The action didn't go through. Try again.",
      });
    } finally {
      setActioningId(null);
    }
  };

  const tabCounts = useMemo(() => ({ [tab]: requests.length }), [tab, requests.length]);

  return (
    <div className="min-h-screen text-white" style={{ background: "#07080B" }}>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Refund Requests</h1>
            <p className="text-xs text-white/40 mt-0.5">Review buyer refund requests for product purchases</p>
          </div>
          <button
            onClick={() => fetchRequests(tab)}
            className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
            aria-label="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={
                tab === t.id
                  ? { background: "linear-gradient(135deg,#FF14EF,#8A4BFF,#1A73E8)", border: "1px solid transparent" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }
              }
              className="px-4 py-2 rounded-full text-sm font-medium text-white transition-all"
            >
              {t.label}
              {tab === t.id && tabCounts[t.id] > 0 ? ` (${tabCounts[t.id]})` : ""}
            </button>
          ))}
        </div>

        {loading && <p className="text-white/50 text-sm py-10 text-center">Loading…</p>}

        {!loading && !requests.length && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Clock className="text-white/30" size={28} />
            <p className="text-white/40 text-sm">No {tab.toLowerCase()} refund requests.</p>
          </div>
        )}

        {!loading &&
          requests.map((r) => (
            <div
              key={r._id}
              className="mb-4 p-5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <RefundProduct request={r} onOpen={() => setProductRequest(r)} />
                  {/* Both parties link to their profile. Judging a refund
                      usually means knowing who is asking — whether this buyer
                      refunds everything they touch, whether this seller is
                      collecting complaints — and the names were flat text, so
                      that check meant leaving the queue and searching by hand.
                      Only linked when we actually have an id; a populate that
                      returned nothing would otherwise render /profile/undefined. */}
                  <p className="text-xs text-white/40 mt-2">
                    Buyer:{" "}
                    <PartyLink party={r.buyer} view="user" />
                    {/* "Creator", not "Seller" — same wording as the rest of
                        the product. `view="seller"` stays: that is the
                        dashboard's internal view name, not a label. */}
                    {" · "}Creator:{" "}
                    <PartyLink party={r.seller} view="seller" />
                  </p>
                </div>
                <span className="text-sm font-bold text-white/90 shrink-0">₹{r.refundAmount}</span>
              </div>

              {/* Same split as the popup, so the row and the popup can never
                  describe the same request differently. Both blocks carry their
                  label here as well: with only the description labelled, the
                  unlabelled block above it read as the buyer's own words rather
                  than as the reason they picked from a list.

                  whitespace-pre-line because a multi-tick reason is several
                  lines, and without it they collapse onto one unreadable row. */}
              {(() => {
                const parts = splitRefundReason(r.reason, r.description);
                return (
                  <>
                    {!!parts.reason && (
                      <p className="text-sm text-white/70 bg-black/20 rounded-lg p-3 mb-3 whitespace-pre-line">
                        <span className="uppercase tracking-wider text-white/35 text-[10px] block mb-1">
                          Reason selected
                        </span>
                        {parts.reason}
                      </p>
                    )}
                    {!!parts.description && (
                      <p className="text-xs text-white/50 bg-black/10 border border-white/5 rounded-lg p-3 mb-3 whitespace-pre-line">
                        <span className="uppercase tracking-wider text-white/35 text-[10px] block mb-1">
                          Description
                        </span>
                        {parts.description}
                      </p>
                    )}
                  </>
                );
              })()}

              {/* What the buyer attached. This is the difference between taking
                  "the output was unusable" on trust and being able to see it. */}
              {!!r.attachments?.length && (
                <div className="mb-3">
                  <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">
                    Buyer's screenshots ({r.attachments.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {r.attachments.map((url, i) => (
                      <a
                        key={`${url}-${i}`}
                        href={mediaUrl(url)}
                        target="_blank"
                        rel="noreferrer"
                        title="Open full size"
                        className="block"
                      >
                        <img loading="lazy" decoding="async"
                          src={mediaUrl(url)}
                          alt={`Refund evidence ${i + 1}`}
                          className="h-20 w-20 object-cover rounded-lg border border-white/15 hover:border-white/40 transition-colors"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-[11px] text-white/40 mb-3 flex-wrap">
                <span>Requested {new Date(r.createdAt).toLocaleString("en-IN")}</span>
                <span>
                  Payout method: {r.purchase?.routeTransferId ? "Route transfer" : "Wallet ledger"}
                </span>
                {!r.purchase?.razorpayPaymentId && (
                  <span className="text-red-400">No Razorpay payment ID on record</span>
                )}
              </div>

              {r.status === "PENDING" ? (
                <>
                  <textarea
                    value={noteDraft[r._id] || ""}
                    onChange={(e) => setNoteDraft((prev) => ({ ...prev, [r._id]: e.target.value }))}
                    placeholder="Admin note (required to reject, optional to approve)"
                    className="w-full text-sm rounded-lg p-2.5 mb-3 bg-black/30 border border-white/10 text-white placeholder:text-white/30"
                    rows={2}
                  />
                  {confirmingId === r._id ? (
                    <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3">
                      {(() => {
                        /* The fee is shown, not hidden, because the number here
                           is deliberately LESS than the buyer paid and an admin
                           about to move money should be able to see why. The
                           refund itself is still whatever the server decides —
                           this is the same figure, spelled out. */
                        const paid = Number(r.purchase?.pricePaid || 0);
                        const fee = +(
                          Number(r.purchase?.platformFee || 0) +
                          Number(r.purchase?.platformFeeGst || 0)
                        ).toFixed(2);
                        const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
                        return (
                          <>
                            <p className="text-xs text-white/80">
                              Refund {inr(Number(r.refundAmount || 0))} to{" "}
                              {r.buyer?.name || "the buyer"} via Razorpay now? This can't be undone.
                            </p>
                            {fee > 0 && (
                              <p className="mt-1 text-[11px] text-white/45">
                                {inr(paid)} paid − {inr(fee)} platform fee (non-refundable) ={" "}
                                {inr(Number(r.refundAmount || 0))}
                              </p>
                            )}
                          </>
                        );
                      })()}
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => approve(r._id)}
                          disabled={actioningId === r._id}
                          className="px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                          style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}
                        >
                          {actioningId === r._id ? "Refunding…" : "Yes, refund now"}
                        </button>
                        <button
                          onClick={() => setConfirmingId(null)}
                          disabled={actioningId === r._id}
                          className="px-4 py-2 rounded-lg text-xs font-semibold text-white/80 disabled:opacity-50"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfirmingId(r._id)}
                        disabled={actioningId === r._id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}
                      >
                        <CheckCircle2 size={14} />
                        Approve &amp; Refund
                      </button>
                      <button
                        onClick={() => reject(r._id)}
                        disabled={actioningId === r._id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                        style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}
                      >
                        <XCircle size={14} />
                        {actioningId === r._id ? "Rejecting…" : "Reject"}
                      </button>
                    </div>
                  )}

                  {/* Separate decision from the refund itself: refunding the
                      buyer is about the buyer, this is about whether the
                      creator did something wrong. Often the answer is no. */}
                  <RatingPenaltyControl
                    creatorId={r.seller?._id}
                    creatorName={r.seller?.name || r.seller?.email}
                    getAuthHeaders={getAuthHeaders}
                    context={{
                      kind: "refund",
                      refundRequestId: r._id,
                      promptId: r.prompt?._id,
                      title: r.prompt?.title || "",
                    }}
                  />
                </>
              ) : (
                <p className="text-xs text-white/50">
                  {r.status === "APPROVED" ? "Refunded" : "Rejected"} on{" "}
                  {r.resolvedAt ? new Date(r.resolvedAt).toLocaleString("en-IN") : "—"}
                  {r.adminNote ? ` — "${r.adminNote}"` : ""}
                </p>
              )}

              {/* Also available after the fact. Whether a creator was at fault
                  is often only clear once the refund has been processed and
                  they've had a chance to respond. */}
              {r.status === "APPROVED" && (
                <RatingPenaltyControl
                  creatorId={r.seller?._id}
                  creatorName={r.seller?.name || r.seller?.email}
                  getAuthHeaders={getAuthHeaders}
                  context={{
                    kind: "refund",
                    refundRequestId: r._id,
                    promptId: r.prompt?._id,
                    title: r.prompt?.title || "",
                  }}
                />
              )}
            </div>
          ))}
      </div>

      {productRequest && (
        <ProductModal request={productRequest} onClose={() => setProductRequest(null)} />
      )}
    </div>
  );
}
