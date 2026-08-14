import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

/**
 * One row on this page, from either source.
 *
 * Prompt refunds and hire refunds are genuinely different things, not two
 * flavours of one thing, so `kind` is kept rather than flattened away:
 *
 *   prompt — you request it, an admin decides; can be PENDING or REJECTED
 *   hire   — you can't request it at all. An admin issues it from the escrow
 *            dashboard, so it only ever exists as APPROVED (already paid back).
 *
 * Showing a hire refund with a "declined" or "under review" state would invent
 * a step that doesn't exist in that flow.
 */
type RefundRow = {
  id: string;
  kind: "prompt" | "hire";
  title: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  refundAmount: number;
  adminNote?: string;
  razorpayRefundId?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  counterpartyName?: string | null;
};

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string; border: string }> = {
  PENDING: {
    label: "Under review",
    bg: "rgba(250,204,21,0.12)",
    color: "#facc15",
    border: "rgba(250,204,21,0.35)",
  },
  APPROVED: {
    label: "Approved",
    bg: "rgba(34,197,94,0.12)",
    color: "#4ade80",
    border: "rgba(34,197,94,0.35)",
  },
  REJECTED: {
    label: "Declined",
    bg: "rgba(239,68,68,0.12)",
    color: "#f87171",
    border: "rgba(239,68,68,0.35)",
  },
};

const fmtDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

/**
 * The buyer's own refund requests.
 *
 * GET /api/purchase/refund-requests/mine already existed and returned all of
 * this — reason, amount, admin note, resolution date, Razorpay refund id — but
 * nothing in the app called it. Purchase History showed only a bare status
 * badge, so a buyer whose request was declined had no way to find out WHY, and
 * an approved one never saw how much came back or the reference their bank
 * would ask for.
 */
export default function MyRefundsPage() {
  const { token, isAuthenticated, isReady } = useAuth() as any;
  const navigate = useNavigate();

  const [rows, setRows] = useState<RefundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    let cancelled = false;
    const auth = { Authorization: `Bearer ${token}` };

    (async () => {
      // Two independent sources, fetched together. Settled rather than awaited
      // as a pair so one failing doesn't blank out the other — a buyer with
      // prompt refunds shouldn't see an empty page because the hire endpoint
      // had a bad moment.
      const [promptRes, hireRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/purchase/refund-requests/mine`, { headers: auth, credentials: "include" }),
        fetch(`${API_BASE}/api/hire/my/refunds`, { headers: auth, credentials: "include" }),
      ]);
      if (cancelled) return;

      const merged: RefundRow[] = [];
      let anyFailed = false;

      if (promptRes.status === "fulfilled" && promptRes.value.ok) {
        const d = await promptRes.value.json().catch(() => ({}));
        for (const r of d?.refundRequests || []) {
          merged.push({
            id: String(r._id),
            kind: "prompt",
            title: r.prompt?.title || "Prompt",
            reason: r.reason || "",
            status: r.status,
            refundAmount: Number(r.refundAmount || 0),
            adminNote: r.adminNote,
            razorpayRefundId: r.razorpayRefundId,
            resolvedAt: r.resolvedAt,
            createdAt: r.createdAt,
          });
        }
      } else anyFailed = true;

      if (hireRes.status === "fulfilled" && hireRes.value.ok) {
        const d = await hireRes.value.json().catch(() => ({}));
        for (const h of d?.refunds || []) {
          merged.push({
            id: String(h.id),
            kind: "hire",
            title: h.title,
            // The admin's stated reason is the only note a hire refund carries.
            reason: h.reason || "",
            status: "APPROVED", // hire refunds only exist once already paid back
            refundAmount: Number(h.refundAmount || 0),
            razorpayRefundId: h.razorpayRefundId,
            resolvedAt: h.refundedAt,
            createdAt: h.createdAt,
            counterpartyName: h.counterpartyName,
          });
        }
      } else anyFailed = true;

      if (cancelled) return;

      // Newest first, by when it was resolved if it has been, else when it
      // started — so a fresh pending request still sorts to the top.
      merged.sort(
        (a, b) =>
          new Date(b.resolvedAt || b.createdAt).getTime() -
          new Date(a.resolvedAt || a.createdAt).getTime()
      );

      setRows(merged);
      if (anyFailed && merged.length === 0) {
        setError("Couldn't load your refunds. Please try again.");
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isReady, isAuthenticated, token, navigate]);

  return (
    <div className="relative min-h-screen bg-[#030406] text-white overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-[999]">
        <Header />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_12%,rgba(26,115,232,0.16),rgba(0,0,0,0))]"
      />

      <main className="relative z-10 container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-24 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold">My Refunds</h1>
        <p className="mt-3 text-white/60 text-sm leading-relaxed">
          Product refunds you've requested and hire deals that were refunded to
          you, in one place. Refunds always go back to the payment method you
          originally used.
        </p>

        {loading && <p className="mt-10 text-sm text-white/50">Loading your refunds…</p>}

        {!loading && error && (
          <div className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-white/70 text-sm">No refunds yet.</p>
            <p className="mt-2 text-white/40 text-xs leading-relaxed">
              You can request a refund on a purchased product from your history,
              within 24 hours of buying it. Refunds on hire deals are issued by
              our support team — contact them if you need one.
            </p>
            <button
              onClick={() => navigate("/self-dash?tab=prompts&p=purchased")}
              className="mt-5 rounded-lg bg-[#1A73E8] px-5 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Go to purchase history
            </button>
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="mt-8 space-y-4">
            {rows.map((r) => {
              const s = STATUS_STYLE[r.status] || STATUS_STYLE.PENDING;
              return (
                <div
                  key={`${r.kind}-${r.id}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-[15px] font-semibold text-white truncate">
                          {r.title}
                        </h2>
                        {/* Which flow this came from — the two behave
                            differently, so the row says which it is. */}
                        <span className="shrink-0 rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/55">
                          {r.kind === "hire" ? "Hire" : "Prompt"}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-white/40">
                        {r.kind === "hire"
                          ? `Refunded ${fmtDate(r.resolvedAt)}`
                          : `Requested ${fmtDate(r.createdAt)}${
                              r.resolvedAt ? ` · Resolved ${fmtDate(r.resolvedAt)}` : ""
                            }`}
                        {r.counterpartyName ? ` · with ${r.counterpartyName}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[15px] font-semibold text-white">
                        ₹{Number(r.refundAmount || 0).toLocaleString("en-IN")}
                      </span>
                      <span
                        className="rounded-full px-3 py-1 text-[11px] font-medium border"
                        style={{ background: s.bg, color: s.color, borderColor: s.border }}
                      >
                        {s.label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    {/* A prompt refund's reason is what YOU wrote when asking.
                        A hire refund's is the admin's, since you never filed
                        one — labelling both "Your reason" would be wrong. */}
                    {r.reason?.trim() && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-white/40 mb-1">
                          {r.kind === "hire" ? "Reason given" : "Your reason"}
                        </p>
                        <p className="text-[13px] text-white/70 leading-relaxed">{r.reason}</p>
                      </div>
                    )}

                    {/* The whole point of this page. A declined request without
                        its reason leaves the buyer with nothing to act on. */}
                    {r.status === "REJECTED" && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-white/40 mb-1">
                          Why it was declined
                        </p>
                        <p className="text-[13px] text-red-300/90 leading-relaxed">
                          {r.adminNote?.trim() ||
                            "No reason was given. Contact Support if you'd like this looked at again."}
                        </p>
                      </div>
                    )}

                    {r.status === "APPROVED" && (
                      <div>
                        <p className="text-[13px] text-emerald-300/90 leading-relaxed">
                          Refunded to your original payment method. It usually appears
                          on your statement within 5–7 business days.
                        </p>
                        {r.adminNote?.trim() && (
                          <p className="mt-1.5 text-[12px] text-white/50">{r.adminNote}</p>
                        )}
                        {r.razorpayRefundId && (
                          // Banks ask for this when a customer queries a refund.
                          <p className="mt-2 text-[11px] text-white/35">
                            Reference:{" "}
                            <span className="font-mono text-white/55">{r.razorpayRefundId}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {r.status === "PENDING" && (
                      <p className="text-[12px] text-white/45 leading-relaxed">
                        Our team is reviewing this. Requests are usually decided within
                        2–3 business days, and you'll get a notification either way.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-white/60 text-xs leading-relaxed">
            How refunds work — window, amount and timing — is set out in the{" "}
            <a href="/refund-policy" className="underline hover:text-white">
              Refund Policy
            </a>
            . Something not right?{" "}
            <a href="/support" className="underline hover:text-white">
              Contact Support
            </a>
            .
          </p>
          {/* Requests are filed from the purchased prompts list, so the page
              always offers a way back to it — not just when it's empty. */}
          <p className="mt-3 text-white/60 text-xs leading-relaxed">
            Want to request a new refund? Open{" "}
            <a
              href="/self-dash?tab=prompts&p=purchased"
              className="underline hover:text-white"
            >
              your purchased prompts
            </a>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
