



// src/pages/Subscription.tsx
import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
type PlanKey = "Free" | "Pro" | "Enterprise";
type ServerPlanKey = "free" | "pro";     // server supports only these now
type BillingCycle = "monthly" | "yearly";

const API_BASE =
  ((import.meta as any).env?.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "";

const CREATE_USER_ORDER_URL = API_BASE
  ? `${API_BASE}/api/plans/subscribe/order/create/user`
  : `/api/plans/subscribe/order/create/user`;

const VERIFY_USER_PAYMENT_URL = API_BASE
  ? `${API_BASE}/api/plans/subscribe/verify/verifypayment`
  : `/api/plans/subscribe/verify/verifypayment`;


const VERIFY_ORG_PAYMENT_URL = VERIFY_USER_PAYMENT_URL; // same endpoint
const CREATE_ORG_ORDER_URL = API_BASE
  ? `${API_BASE}/api/plans/subscribe/order/create/org`
  : `/api/plans/subscribe/order/create/org`;




// map UI → server params
const toServerPlanKey = (ui: PlanKey): ServerPlanKey | null =>
  ui === "Free" ? "free" : ui === "Pro" ? "pro" : null;
const toBillingCycle = (annual: boolean): BillingCycle => (annual ? "yearly" : "monthly");

const getAuthToken = () =>
  localStorage.getItem("auth_token") ||
  sessionStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("token") ||
  "";







// theme/visual constants
const GRAD = "linear-gradient(270deg, #FF14EF 0%, #1A73E8 100%)";
const SELECTED_CARD_BG =
  "linear-gradient(180deg, rgba(255, 20, 239, 0.5) 0%, rgba(26, 115, 232, 0.5) 100%)";

const INR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function Subscription() {
   const { user, isReady } = useAuth();
  const [annual, setAnnual] = useState(false);
  const [selected, setSelected] = useState<PlanKey>("Pro");
  const [creating, setCreating] = useState(false);

  const prices = { Free: 0, Pro: 799, Enterprise: 7999 } as const;
  const tokens = { Free: "5,000", Pro: "100,000", Enterprise: "1,000,000" } as const;



const orgId = user?.orgId || null; // ✅ use context

const note = annual ? "Billed yearly (Save up to 20%)" : undefined;


  if (!isReady) {
    return <div className="min-h-screen bg-[#07080A] text-white">Loading…</div>;
  }


  const priceFor = (p: PlanKey) => {
    const m = prices[p];
    const v = annual ? Math.round(m * 0.8) : m;
    return `${INR(v)}/month`;
  };





  // const note = useMemo(() => (annual ? "Billed yearly (Save up to 20%)" : undefined), [annual]);

  // ---------------- Razorpay helpers ----------------
  const ensureRazorpay = () =>
    new Promise<void>((resolve, reject) => {
      if ((window as any).Razorpay) return resolve();
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("razorpay_script_load_failed"));
      document.body.appendChild(s);
    });


  function openCheckout({ key, order }: { key: string; order: any }) {
    return new Promise<{
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }>((resolve, reject) => {
      const rzp = new (window as any).Razorpay({
        key,
        order_id: order.id,
        name: "Tokun.ai",
        description: "Subscription Payment",
        prefill: { name: "Static User", email: "user@example.com", contact: "9999999999" },
        notes: order.notes || {},
        handler: (response: any) => {
          console.log("[Subscribe] ✔ Checkout success handler:", response);
          resolve(response);
        },
        modal: { ondismiss: () => reject(new Error("checkout_dismissed")) },
      });
      rzp.open();
    });
  }

  async function verifyUserPayment(payload: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) {
    console.groupCollapsed(
      "%c[Subscribe] POST → /api/plans/subscribe/verify/verifypayment",
      "color:#60a5fa;font-weight:700;"
    );
    console.log("[Subscribe] URL:", VERIFY_USER_PAYMENT_URL);
    console.log("[Subscribe] Payload:", payload);

    const res = await fetch(VERIFY_USER_PAYMENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentId: payload.razorpay_payment_id,
        orderId: payload.razorpay_order_id,
        signature: payload.razorpay_signature,
      }),
      credentials: "include",
    });

    console.log("[Subscribe] HTTP:", res.status, res.statusText);
    const raw = await res.text();
    console.log("[Subscribe] Raw body:", raw);

    let data: any = {};
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.warn("[Subscribe] JSON parse failed:", e);
    }

    if (!res.ok || !data.success) {
      const code = data?.error || `http_${res.status}`;
      console.error("[Subscribe] ❌ VERIFY FAILED:", code);
      console.groupEnd();
      throw new Error(code);
    }

    console.log("%c[Subscribe] ✅ VERIFY SUCCESS", "color:#22c55e;font-weight:700;");
    console.log(
      "[Subscribe] Plan:",
      data.plan,
      "Cycle:",
      data.billingCycle,
      "currentPeriodEnd:",
      data.currentPeriodEnd
    );
    if (data.subscriptionPeriod) console.log("[Subscribe] Period:", data.subscriptionPeriod);
    console.groupEnd();

    return data;
  }

  // ---------------- Create → Checkout → Verify (IND only) ----------------
  const startPurchase = async () => {
    const planKey = toServerPlanKey(selected);
    if (!planKey) {
      console.warn("[Subscribe] Enterprise not supported here. Handle separately.");
      return;
    }

    setCreating(true);
    try {
      // 1) Create order
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = getAuthToken();
      if (token) headers.Authorization = `Bearer ${token}`;

      console.groupCollapsed(
        "%c[Subscribe] POST → /api/plans/subscribe/order/create/user",
        "color:#60a5fa;font-weight:700;"
      );
      console.log("[Subscribe] URL:", CREATE_USER_ORDER_URL);
      console.log("[Subscribe] Headers:", { ...headers, Authorization: headers.Authorization ? "Bearer <present>" : "—" });
      console.log("[Subscribe] Payload:", { planKey, billingCycle: toBillingCycle(annual) });

      const res = await fetch(CREATE_USER_ORDER_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ planKey, billingCycle: toBillingCycle(annual) }),
        credentials: "include",
      });

      console.log("[Subscribe] HTTP:", res.status, res.statusText);
      const raw = await res.text();
      console.log("[Subscribe] Raw body:", raw);
      let data: any = {};
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.warn("[Subscribe] JSON parse failed:", e);
      }
      console.groupEnd();

      if (!res.ok || !data.success) {
        const code = data?.error || `http_${res.status}`;
        console.error("[Subscribe] ❌ CREATE FAILED:", code);
        return;
      }

      // 2) Free plan = short-circuit (no payment)
      if (data?.free === true || data?.message === "no_payment_required") {
        console.log(
          "%c[Subscribe] ✅ FREE plan activated / renewal - no payment required",
          "color:#22c55e;font-weight:700;"
        );
        return;
      }

      // 3) Paid plan: open Razorpay
      await ensureRazorpay();
      const checkoutRes = await openCheckout({ key: data.key, order: data.order });

      // 4) Verify payment
      await verifyUserPayment(checkoutRes);

      console.log("%c[Subscribe] 🎉 IND purchase complete", "color:#22c55e;font-weight:700;");
    } catch (e: any) {
      console.error("[Subscribe] ❌ FLOW FAILED:", e?.message || e);
    } finally {
      setCreating(false);
    }
  };



// const ENTERPRISE_PLAN_KEY = "enterprise" as const;
const ENTERPRISE_PLAN_KEY = "enterprise" as const;
const startEnterprisePurchase = async () => {
  const token = getAuthToken();
  if (!token) {
    console.warn("[Subscribe/ORG] No auth token found.");
    return;
  }
  const orgId = user?.orgId || null;
  if (!orgId) {
    alert("We couldn’t find your Organization ID. Please log in as the org owner.");
    return;
  }

  setCreating(true);
  try {
    // 1) create order
    const res = await fetch(CREATE_ORG_ORDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orgId, billingCycle: toBillingCycle(annual), planKey: "enterprise" }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok || !data?.success) {
      alert(`Unable to start enterprise checkout: ${data?.error || res.status}`);
      return;
    }

    // 2) checkout
    await ensureRazorpay();
    const checkoutRes = await openCheckout({ key: data.key, order: data.order });

    // 3) verify (activates org plan)
    const vRes = await fetch(VERIFY_ORG_PAYMENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        paymentId: checkoutRes.razorpay_payment_id,
        orderId: checkoutRes.razorpay_order_id,
        signature: checkoutRes.razorpay_signature,
      }),
      credentials: "include",
    });
    const vJson = await vRes.json();
    if (!vRes.ok || !vJson?.success) {
      alert(`Verification failed: ${vJson?.error || vRes.status}`);
      return;
    }

    console.log("[Subscribe/ORG] ✅ verify success:", vJson);

    // (optional) refetch /me and/or /org/:id to update UI with plan & tokens
  } catch (e: any) {
    console.error("[Subscribe/ORG] ❌ FLOW FAILED:", e?.message || e);
    alert(`Enterprise purchase failed: ${e?.message || "unexpected_error"}`);
  } finally {
    setCreating(false);
  }
};










 return (
  <div className="min-h-screen bg-[#07080A] text-white">
    <Header />

    <main className="container mx-auto max-w-[1100px] px-4 pt-28 pb-14">
      
      {/* Title */}
      <div className="text-center max-w-[780px] mx-auto space-y-3">
        <h1 className='font-["Inter"] font-semibold text-[22px] sm:text-[26px] leading-tight'>
          Flexible Subscription Plans for Every Need
        </h1>

        <p className='font-["Inter"] text-[13px] text-white/80'>
          Select the plan that perfectly fits your tokun optimization goals.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="mt-8 mb-10 flex items-center justify-center gap-4 sm:gap-6 text-[12px]">
        <span className="leading-none">Billed monthly</span>

        <Switch
          id="billing"
          checked={annual}
          onCheckedChange={setAnnual}
          className={[
            "relative inline-flex h-5 w-9 rounded-full border border-white/20 transition-colors",
            "data-[state=checked]:border-transparent",
            "[&>span]:pointer-events-none [&>span]:block [&>span]:h-4 [&>span]:w-4 [&>span]:rounded-full [&>span]:bg-white [&>span]:transition-transform",
            "[&>span]:translate-x-0.5 data-[state=checked]:[&>span]:translate-x-[18px]",
          ].join(" ")}
          style={annual ? { background: GRAD } : { background: "#17171A" }}
        />

        <span className="leading-none">
          Billed yearly <span>(Save up to 20%)</span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">

        <PlanCard
          selected={selected === "Free"}
          onSelect={() => setSelected("Free")}
          onChoose={() => {
            if (!creating) setSelected("Free");
            startPurchase();
          }}
          title="Free"
          subtitle="(Individuals)"
          price={priceFor("Free")}
          tokens={tokens.Free}
          extras={[{ label: "Extra Tokens Feature", value: "No" }]}
        />

        <PlanCard
          selected={selected === "Pro"}
          onSelect={() => setSelected("Pro")}
          onChoose={() => {
            if (!creating) setSelected("Pro");
            startPurchase();
          }}
          title="Pro"
          subtitle="(Individuals)"
          price={priceFor("Pro")}
          tokens={tokens.Pro}
          highlight="Most Popular"
          extras={[
            { label: "Extra Tokens Feature", value: "Yes" },
            { label: "No. of Extra Tokens", value: "50,000" },
            { label: "Extra Token Price", value: "₹200" },
          ]}
        />

        <PlanCard
          selected={selected === "Enterprise"}
          onSelect={() => setSelected("Enterprise")}
          onChoose={() => {
            if (!creating) setSelected("Enterprise");
            startEnterprisePurchase();
          }}
          title="Enterprise"
          subtitle="(Organization)"
          price={priceFor("Enterprise")}
          tokens={tokens.Enterprise}
          extras={[
            { label: "Extra Tokens Feature", value: "Yes" },
            { label: "No. of Extra Tokens", value: "100,000" },
            { label: "Extra Token Price", value: "₹199" },
          ]}
        />

      </div>

      {/* Comparison Table */}
      <ComparisonTable />

      <p className='text-center text-[11px] mt-8 font-["Inter"] leading-[1] text-white/70'>
        {note ?? " "}
      </p>

    </main>

    <Footer />
  </div>
);


/* -------------------- Plan Card -------------------- */

function PlanCard({
  selected,
  onSelect,
  onChoose,
  title,
  subtitle,
  price,
  tokens,
  extras,
  highlight,
}) {
  const [amount, per] = price.split("/");

  return (
    <Card
      onClick={onSelect}
      className="relative cursor-pointer flex flex-col w-[250px] h-[400px]"
      style={{
        borderRadius: 16,
        border: "1px solid #35343C",
        background: selected ? SELECTED_CARD_BG : "#0D0D0E",
        color: "#FFFFFF",
      }}
    >
      {highlight && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full text-[10px] font-medium border border-white/25"
          style={{ background: GRAD, color: "#fff" }}
        >
          {highlight}
        </div>
      )}

      <CardHeader className="pt-5 pb-2">
        <div className="space-y-3">
          <CardTitle className='text-center font-["Inter"] font-semibold text-[32px] leading-[1]'>
            {title}
          </CardTitle>

          <div className='text-center font-["Inter"] text-[12px] leading-[1]'>
            {subtitle}
          </div>

          <div className="text-center mt-6">
            <span className='font-["Inter"] font-semibold text-[28px] leading-[1]'>
              {amount}
            </span>

            <span className='ml-1 align-middle font-["Inter"] font-normal text-[16px] leading-[1]'>
              /{per}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex items-center justify-center">
        <div className="w-[220px] mx-auto">
          
          <div className='text-center font-["Inter"] text-[16px] leading-[1] whitespace-nowrap'>
            Monthly Tokens: {tokens}
          </div>

          <ul className="mt-4 space-y-2 mx-auto">
            {extras.map((e) => {
              const negative = e.value === "No" || e.value === "—";

              return (
                <li
                  key={e.label}
                  className="grid grid-cols-[16px_max-content_8px_1fr] gap-x-2 items-center"
                >
                  {negative ? (
                    <X className="h-[14px] w-[14px]" />
                  ) : (
                    <Check className="h-[14px] w-[14px]" />
                  )}

                  <span className='font-["Inter"] text-[12px] leading-[1]'>
                    {e.label}
                  </span>

                  <span className='font-["Inter"] text-[12px] leading-[1]'>
                    :
                  </span>

                  <span className='font-["Inter"] text-[12px] leading-[1] font-medium'>
                    {e.value}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>

      <CardFooter className="pt-3 pb-5 flex justify-center">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onChoose();
          }}
          className='font-["Inter"] text-[16px] w-[200px] h-[50px] rounded-[6px]'
          style={
            selected
              ? { background: GRAD, border: "1px solid #FFFFFF", color: "#fff" }
              : { background: "transparent", border: "1px solid #FFFFFF", color: "#fff" }
          }
          variant="ghost"
        >
          Choose Plan
        </Button>
      </CardFooter>
    </Card>
  );
}


/* -------------------- Comparison table -------------------- */

function ComparisonTable() {

  type Cell = boolean | string | JSX.Element;

  const cell = (v: Cell) => {
    if (typeof v === "boolean") {
      return v
        ? <Check className="inline-block h-4 w-4" />
        : <X className="inline-block h-4 w-4" />;
    }
    return v;
  };

  const checkText = (text: string) => (
    <span className='inline-flex items-center justify-center gap-1 text-[11px] font-["Inter"]'>
      <Check className="h-4 w-4" />
      <span>{text}</span>
    </span>
  );

  const row = (label: string, free: Cell, pro: Cell, ent: Cell) => (
    <tr className="border-t border-white/10">
      <td className='py-3 pr-4 text-left text-[12px] font-["Inter"] whitespace-nowrap'>
        {label}
      </td>

      <td className="py-3 text-center">{cell(free)}</td>
      <td className="py-3 text-center">{cell(pro)}</td>
      <td className="py-3 text-center">{cell(ent)}</td>
    </tr>
  );

  return (
    <div className="mt-10 overflow-x-auto">
      <table className="w-full min-w-[650px] text-center text-sm text-white">

        <thead>
          <tr className='text-[14px] font-["Inter"]'>
            <th className="text-left font-normal"></th>
            <th className="font-normal">Free</th>
            <th className="font-normal">Pro</th>
            <th className="font-normal">Enterprise</th>
          </tr>
        </thead>

        <tbody>

          {row("Basic Access to AI Tools (SmartGen, Prompt Optimizer)", true, true, true)}
          {row("Chat Support", false, true, true)}
          {row("Email Support", true, true, true)}
          {row("Team Features", false, false, true)}

          {row(
            "No. of Team Members",
            <X className="inline-block h-4 w-4" />,
            <X className="inline-block h-4 w-4" />,
            <Check className="inline-block h-4 w-4" />
          )}

          {row(
            "History",
            <span className='text-[11px]'>(up to 5 entries)</span>,
            <span className='text-[11px]'>(unlimited entries)</span>,
            <span className='text-[11px]'>(unlimited entries)</span>
          )}

          {row(
            "Token Usage (Counted monthly only)",
            <span className='text-[11px]'>(section-wise)</span>,
            <span className='text-[11px]'>(section-wise)</span>,
            <span className='text-[11px]'>(section-wise)</span>
          )}

          {row(
            "Extra Tokens Feature",
            false,
            checkText("Extra Tokens: 50,000  Price: ₹200"),
            checkText("Extra Tokens: 100,000  Price: ₹199")
          )}

          {row(
            "Phone Support",
            <span className='text-[11px]'>9:00–18:00, MON–SUN</span>,
            <span className='text-[11px]'>9:00–18:00, MON–SUN</span>,
            <span className='text-[11px]'>24/7 Dedicated Support</span>
          )}

        </tbody>
      </table>
    </div>
  );
}
}
