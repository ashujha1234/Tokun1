// Refer & Earn.
//
// The deal in one line: your invite makes their first prompt sale, and you both
// get one sale each with no Tokun commission — the full list price, paid the
// same way every other sale is.
//
// The page is built around that sentence rather than around a rewards table,
// because the single question every visitor arrives with is "what do I get, and
// when?" — and the honest answer has a condition in it. Burying the condition
// makes the payout feel arbitrary later.

import { useEffect, useState } from "react";
import { Copy, Check, Share2, Gift, TrendingUp, Users } from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

type Invite = {
  id: string;
  name: string;
  joinedAt: string;
  qualifiedAt?: string | null;
  label: string;
  tone: "good" | "pending" | "muted";
};

type Terms = {
  rebatePercent: number;
  maxAmount: number;
  minSaleAmount: number;
  expiryDays: number;
  boostDays: number;
  attributionDays: number;
  monthlyCap: number;
  buyerDiscountPercent: number;
  buyerDiscountMax: number;
};

type WelcomeDiscount = {
  percent: number;
  maxAmount: number;
  status: "ACTIVE" | "RESERVED" | "USED" | "EXPIRED" | "REVOKED";
  expiresAt: string;
  savedAmount: number;
};

type Data = {
  code: string;
  link: string;
  terms: Terms;
  /** Only set for people who were themselves invited by someone. */
  welcomeDiscount: WelcomeDiscount | null;
  stats: {
    invited: number;
    qualified: number;
    pending: number;
    creditsAvailable: number;
    totalEarned: number;
  };
  invites: Invite[];
};

const rupees = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const when = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const toneClass = (tone: Invite["tone"]) =>
  tone === "good"
    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
    : tone === "pending"
      ? "bg-amber-500/12 text-amber-200 border-amber-500/25"
      : "bg-white/5 text-white/45 border-white/10";

export default function ReferEarn() {
  const { token } = useAuth() as any;
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/referrals/me`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const json = await res.json().catch(() => ({}));
        if (!cancelled && res.ok && json?.success) setData(json);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const copy = async (value: string, which: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      toast({ title: "Couldn't copy", description: "Select it and copy manually." });
    }
  };

  const share = () => {
    if (!data) return;
    const text = `I'm selling prompts on Tokun. Join with my link — we both get a sale with zero commission: ${data.link}`;

    // The native sheet where it exists (every phone), WhatsApp where it doesn't
    // — which is where these links actually get sent.
    if (navigator.share) {
      navigator.share({ title: "Join me on Tokun", text, url: data.link }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    }
  };

  const t = data?.terms;

  return (
    <div className="dark min-h-screen bg-[#08080A] text-white">
      <Header />

      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 pt-28 sm:pt-32 pb-20">
        {/* The deal, said once, at the top. */}
        <section className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/50">
            <Gift className="h-3 w-3" /> Refer &amp; Earn
          </span>

          <h1 className="mt-4 text-[28px] sm:text-[38px] font-semibold leading-tight tracking-tight">
            Invite a creator.
            <br className="hidden sm:block" /> Sell your next prompt commission-free.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/55">
            When someone you invite makes their first sale on Tokun, your next prompt sale carries
            no Tokun commission at all — you keep the full list price, paid straight to your bank
            like any other sale. They get {t?.buyerDiscountPercent ?? 5}% off the moment they join,
            and {t?.boostDays ?? 7} days at the top of the marketplace once they go live.
          </p>
        </section>

        {/* The invited person's own reward, first — before their invite link.

            Someone who arrived through a link opens this page asking "what did
            I get?", not "how do I invite people". Answering the second question
            first reads as though the first has no answer. */}
        {data?.welcomeDiscount && (
          <section
            className={`mt-8 rounded-2xl border p-4 sm:p-5 ${
              data.welcomeDiscount.status === "USED"
                ? "border-white/10 bg-white/[0.03]"
                : "border-emerald-500/25 bg-emerald-500/[0.07]"
            }`}
          >
            {data.welcomeDiscount.status === "USED" ? (
              <p className="text-[14px] text-white/60">
                Your welcome discount saved you{" "}
                <span className="font-semibold text-white">
                  {rupees(data.welcomeDiscount.savedAmount)}
                </span>{" "}
                — already used. Invite someone below to earn a commission-free sale.
              </p>
            ) : data.welcomeDiscount.status === "EXPIRED" ? (
              <p className="text-[14px] text-white/45">
                Your welcome discount has expired.
              </p>
            ) : data.welcomeDiscount.status === "REVOKED" ? (
              /* An invite pays out once. This one's holder sold before they
                 bought, so the reward went to the sale instead — said plainly,
                 because a discount that silently stops working reads as a bug. */
              <p className="text-[14px] text-white/60">
                You made your first sale before spending this, so your reward went there
                instead — your next prompt sale is commission-free.
              </p>
            ) : (
              <>
                <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-300/70">
                  You were invited
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-white">
                  <span className="font-semibold">
                    {data.welcomeDiscount.percent}% off your next purchase
                  </span>{" "}
                  — applied automatically at checkout, up to{" "}
                  {rupees(data.welcomeDiscount.maxAmount)}. Nothing to enter.
                </p>
                <p className="mt-1 text-[12px] text-white/40">
                  Expires {when(data.welcomeDiscount.expiresAt)}.
                </p>
              </>
            )}
          </section>
        )}

        {/* Code + link */}
        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          {loading ? (
            <p className="text-center text-sm text-white/40">Loading your link…</p>
          ) : !data ? (
            <p className="text-center text-sm text-white/40">
              Sign in to get your invite link.
            </p>
          ) : (
            <>
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Your code</p>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="font-mono text-[26px] sm:text-[32px] font-bold tracking-[0.18em]">
                  {data.code}
                </span>
                <button
                  type="button"
                  onClick={() => copy(data.code, "code")}
                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white hover:bg-white/10 transition"
                  aria-label="Copy code"
                >
                  {copied === "code" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
                  <span className="truncate text-[13px] text-white/60">{data.link}</span>
                </div>

                <button
                  type="button"
                  onClick={() => copy(data.link, "link")}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[13px] font-medium hover:bg-white/10 transition"
                >
                  {copied === "link" ? "Copied" : "Copy link"}
                </button>

                <button
                  type="button"
                  onClick={share}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90"
                  style={{ background: "linear-gradient(90deg,#FF14EF 0%,#1A73E8 100%)" }}
                >
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>
            </>
          )}
        </section>

        {/* Stats */}
        {data && (
          <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Invited", value: data.stats.invited, icon: Users },
              { label: "Rewarded", value: data.stats.qualified, icon: Gift },
              { label: "Credits ready", value: data.stats.creditsAvailable, icon: TrendingUp },
              { label: "Extra earned", value: rupees(data.stats.totalEarned), icon: null },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-white/40">{s.label}</p>
                <p className="mt-1.5 text-[22px] font-semibold tabular-nums">{s.value}</p>
              </div>
            ))}
          </section>
        )}

        {/* How it works — the condition stated plainly, not in fine print. */}
        <section className="mt-10">
          <h2 className="text-[15px] font-semibold">How it works</h2>

          <ol className="mt-4 flex flex-col gap-3">
            {[
              {
                head: "Share your link",
                body: `Anyone who signs up through it is linked to you for ${t?.attributionDays ?? 30} days.`,
              },
              {
                /* Their side comes first and it is not conditional — this is the
                   only part of the deal that pays out on the day they join, and
                   it's what the person clicking your link actually gets. */
                head: "They get a discount straight away",
                body: t
                  ? `${t.buyerDiscountPercent}% off their first purchase, up to ${rupees(t.buyerDiscountMax)}, applied automatically at checkout. Nothing for them to enter, and nothing taken off what any seller earns.`
                  : "They get a discount on their first purchase, applied automatically at checkout.",
              },
              {
                /* Said plainly, because it is the one condition people miss: an
                   invite that only ever buys earns the referrer nothing. */
                head: "They make their first sale",
                body: "Your side is earned by a sale, not a purchase. They set up their payout account, list a product, and sell it.",
              },
              {
                head: "The sale settles",
                body: `24 hours later, once the refund window has passed, your credit lands. Nothing pays out before that — a sale isn't final until it can't be refunded.`,
              },
              {
                head: "Your next sale is commission-free",
                body: t
                  ? `On your next prompt sale over ${rupees(t.minSaleAmount)} we take no commission — you're paid the full list price, in the same payout as always. Worth up to ${rupees(t.maxAmount)}, and the credit lasts ${t.expiryDays} days.`
                  : "We take no commission on your next sale — you keep the full list price.",
              },
            ].map((step, i) => (
              <li key={step.head} className="flex gap-3.5 rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-[12px] font-semibold">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[14px] font-medium">{step.head}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/50">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* The invitee's side, stated once and completely — including the part
              that is easy to leave out: their two rewards are alternatives, not
              a pair, and which one they get is decided by what they do first. */}
          <p className="mt-3 text-[12px] leading-relaxed text-white/35">
            Whoever you invite gets one reward, not two — {t?.buyerDiscountPercent ?? 5}% off if they
            buy first, or a commission-free sale of their own if they sell first. Either way their
            products are featured for {t?.boostDays ?? 7} days once their first sale lands. Prompt
            sales only — services and hire projects don't count yet. Up to {t?.monthlyCap ?? 10}{" "}
            rewards a month. Self-referrals and accounts sharing a payout identity don't qualify.
          </p>
        </section>

        {/* Invites */}
        {data && data.invites.length > 0 && (
          <section className="mt-10">
            <h2 className="text-[15px] font-semibold">Your invites</h2>

            <div className="mt-4 flex flex-col gap-2">
              {data.invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-[11px] font-semibold">
                    {invite.name.slice(0, 2).toUpperCase()}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium">{invite.name}</p>
                    <p className="text-[11px] text-white/35">Joined {when(invite.joinedAt)}</p>
                  </div>

                  <span
                    className={`ml-auto shrink-0 rounded-full border px-2.5 py-1 text-[11px] ${toneClass(invite.tone)}`}
                  >
                    {invite.label}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {data && data.invites.length === 0 && !loading && (
          <p className="mt-10 text-center text-[13px] text-white/35">
            No invites yet. Your link is above.
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
}
