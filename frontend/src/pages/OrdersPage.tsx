/**
 * Orders — service bookings and hire projects, both sides of them, in one list.
 *
 * Both used to be unreachable: a service booking took four clicks inside Service
 * Bookings, and a hire deal existed only inside the chat thread it was created
 * in. A client who had just paid had no page listing it, and a freelancer had no
 * page showing what they'd been hired for.
 *
 * Product purchases are NOT here — they live in My Products
 * (/self-dash?tab=prompts) with their bill and refund flow. A product is
 * delivered the moment it is paid for, so it has no state anyone waits on, and it
 * only ever sat in this queue as history. What belongs here is work with a
 * lifecycle: paid → in progress → delivered → approved.
 *
 * Rows the viewer can act on sort to the top (the server decides that, since it
 * knows which side of each order they're on).
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { deadlineLabel } from "@/lib/escrowApi";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const GRADIENT = "linear-gradient(270deg,#FF14EF 0%, #1A73E8 100%)";

type Side = "all" | "buying" | "selling";

type OrderRow = {
  id: string;
  kind: "service" | "hire";
  side: "buying" | "selling";
  title: string;
  counterpartyName: string;
  counterpartyAvatar: string;
  amount: number;
  status: string;
  label: string;
  tone: "good" | "warn" | "info" | "action" | "neutral";
  createdAt: string;
  // Service bookings only — null on hire deals.
  deliveryDueAt?: string | null;
  link: string;
  needsAction: boolean;
  settlement?: { sellerPercent: number; sellerPayout: number; refundAmount: number } | null;
};

const TONE_STYLES: Record<OrderRow["tone"], { color: string; bg: string; border: string }> = {
  good: { color: "#19E66C", bg: "rgba(25,230,108,0.10)", border: "rgba(25,230,108,0.22)" },
  action: { color: "#C084FC", bg: "rgba(192,132,252,0.10)", border: "rgba(192,132,252,0.22)" },
  warn: { color: "#FABC4E", bg: "rgba(250,188,78,0.10)", border: "rgba(250,188,78,0.22)" },
  info: { color: "#63A6F2", bg: "rgba(26,115,232,0.10)", border: "rgba(26,115,232,0.22)" },
  neutral: { color: "#8F8996", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.10)" },
};

const KIND_META: Record<OrderRow["kind"], { icon: string; label: string }> = {
  service: { icon: "🧩", label: "Service" },
  hire: { icon: "💼", label: "Project" },
};

const formatDate = (value: string) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";

export default function OrdersPage() {
  const { token } = useAuth() as any;
  const navigate = useNavigate();

  const [side, setSide] = useState<Side>("all");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [counts, setCounts] = useState({ total: 0, buying: 0, selling: 0, needsAction: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(`${API_BASE}/api/my-orders?side=${side}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (!d?.success) throw new Error(d?.message || "Couldn't load your orders.");
        setOrders(d.orders || []);
        setCounts(d.counts || { total: 0, buying: 0, selling: 0, needsAction: 0 });
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Couldn't load your orders.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, side]);

  /* Named for the ROLE, not for a transaction.
     These were "Bought" and "Sold", which is the vocabulary of the product
     marketplace — and products are the one thing this page deliberately does not
     list (see the note at the top). What's here is service bookings and hire
     projects: work someone commissioned and work someone is delivering, both of
     which have a life after the payment. "Sold" on a project still being worked
     on says the opposite of what's true.

     The keys stay `buying`/`selling` — that's the server's own vocabulary in
     /api/my-orders, and renaming labels is not a reason to churn an API. */
  const tabs: { key: Side; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.total },
    { key: "buying", label: "As client", count: counts.buying },
    { key: "selling", label: "As creator", count: counts.selling },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white">
      <Header />

      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold">Orders</h1>
        {/* Was "Everything you've bought and sold — products, services and
            projects", which named the one thing this page doesn't show. */}
        <p className="mt-1.5 text-sm text-white/45">
          Service bookings and hire projects — work you've commissioned, and work
          you're delivering.
        </p>

        {counts.needsAction > 0 && (
          <div className="mt-5 rounded-xl border border-[#C084FC]/25 bg-[#C084FC]/[0.08] px-4 py-3 text-sm text-[#DDB8FF]">
            {counts.needsAction} order{counts.needsAction === 1 ? "" : "s"} need
            {counts.needsAction === 1 ? "s" : ""} your attention — they're at the top.
          </div>
        )}

        <div className="mt-6 flex items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setSide(t.key)}
              className={`px-4 h-9 rounded-full text-sm font-medium transition ${
                side === t.key
                  ? "bg-white/[0.10] text-white"
                  : "text-white/55 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {t.label}
              {/* Counts come from the current response, so they'd be wrong on a
                  filtered tab — only shown on All. */}
              {side === "all" && t.key !== "all" ? ` (${t.count})` : ""}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {loading ? (
            <p className="text-white/45 text-sm py-4">Loading your orders…</p>
          ) : error ? (
            <p className="text-[#FABC4E] text-sm py-4">{error}</p>
          ) : !orders.length ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <p className="text-white/70 font-medium">Nothing here yet</p>
              {/* Both halves used to talk about products and send buyers to the
                  product marketplace — nothing that lands on this page any more.
                  A buyer with no orders needs a creator to hire; a seller needs
                  their freelancer profile, which is what gets them booked. */}
              <p className="mt-1.5 text-sm text-white/40">
                {side === "selling"
                  ? "Once someone books a service or hires you for a project, it'll show up here."
                  : "Services you book and creators you hire will show up here."}
              </p>
              <button
                type="button"
                onClick={() => navigate(side === "selling" ? "/self-dash" : "/find-creators")}
                className="mt-5 inline-flex items-center h-10 px-5 rounded-full text-sm font-semibold text-white"
                style={{ background: GRADIENT }}
              >
                {side === "selling" ? "Go to your profile" : "Find creators"}
              </button>
            </div>
          ) : (
            orders.map((o) => {
              const tone = TONE_STYLES[o.tone] || TONE_STYLES.neutral;
              const kind = KIND_META[o.kind];
              return (
                <button
                  key={`${o.kind}-${o.id}`}
                  type="button"
                  onClick={() =>
                    /* Every row here is an escrow order, so every row has a
                       detail page — the only place either side can cancel,
                       negotiate a split, or ask for a progress update. */
                    navigate(`/orders/${o.kind}/${o.id}`)
                  }
                  className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/25 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-lg leading-none mt-0.5">{kind.icon}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{o.title}</p>
                        <p className="mt-1 text-xs text-white/40">
                          {kind.label}
                          {" · "}
                          {/* Says which side of the deal this is, because the
                              same order type appears in both directions. In the
                              same words as the tabs above — "You bought" / "You
                              sold" described a finished transaction, while these
                              rows are mostly work still in progress. */}
                          {o.side === "buying" ? "You hired" : "You were hired"}
                          {o.counterpartyName ? ` · ${o.counterpartyName}` : ""}
                          {" · "}
                          {formatDate(o.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-semibold text-sm">
                        ₹{Number(o.amount).toLocaleString("en-IN")}
                      </p>
                      <span
                        className="mt-1.5 inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ color: tone.color, background: tone.bg, border: `1px solid ${tone.border}` }}
                      >
                        {o.label}
                      </span>
                    </div>
                  </div>

                  {/* The delivery clock, while the work is still owed. Both
                      sides see the same number — the buyer's "when do I get
                      this" and the seller's "how long have I got" are the
                      same date. */}
                  {(() => {
                    if (!["FUNDED", "IN_PROGRESS", "REVISION_REQUESTED"].includes(o.status)) {
                      return null;
                    }
                    const dl = deadlineLabel(o.deliveryDueAt);
                    if (!dl) return null;
                    return (
                      <p
                        className="mt-2 text-[11px] font-semibold"
                        style={{
                          color:
                            dl.tone === "late"
                              ? "#FF8F8F"
                              : dl.tone === "soon"
                                ? "#FABC4E"
                                : "rgba(255,255,255,0.40)",
                        }}
                      >
                        ⏱ Delivery {dl.text}
                      </p>
                    );
                  })()}

                  {/* A cancelled order that just says "Cancelled" leaves the
                      obvious question unanswered, so where the money went is
                      spelled out. No percentage — a settlement pays one party,
                      so there is no split to report. */}
                  {o.settlement && (
                    <p className="mt-3 pt-3 border-t border-white/[0.07] text-xs text-white/45">
                      {o.settlement.sellerPercent === 100
                        ? `Settled in the creator's favour — ₹${Number(
                            o.settlement.sellerPayout
                          ).toLocaleString("en-IN")} paid to them.`
                        : `Settled in the client's favour — ₹${Number(
                            o.settlement.refundAmount
                          ).toLocaleString("en-IN")} refunded to them.`}{" "}
                      The platform fee is not refundable.
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
