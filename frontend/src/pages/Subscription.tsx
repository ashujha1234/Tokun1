



// // src/pages/Subscription.tsx
// import { useMemo, useState } from "react";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Switch } from "@/components/ui/switch";
// import { Check, X } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// type PlanKey = "Free" | "Pro" | "Enterprise";
// type ServerPlanKey = "free" | "pro";     // server supports only these now
// type BillingCycle = "monthly" | "yearly";

// const API_BASE =
//   ((import.meta as any).env?.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "";

// const CREATE_USER_ORDER_URL = API_BASE
//   ? `${API_BASE}/api/plans/subscribe/order/create/user`
//   : `/api/plans/subscribe/order/create/user`;

// const VERIFY_USER_PAYMENT_URL = API_BASE
//   ? `${API_BASE}/api/plans/subscribe/verify/verifypayment`
//   : `/api/plans/subscribe/verify/verifypayment`;


// const VERIFY_ORG_PAYMENT_URL = VERIFY_USER_PAYMENT_URL; // same endpoint
// const CREATE_ORG_ORDER_URL = API_BASE
//   ? `${API_BASE}/api/plans/subscribe/order/create/org`
//   : `/api/plans/subscribe/order/create/org`;




// // map UI → server params
// const toServerPlanKey = (ui: PlanKey): ServerPlanKey | null =>
//   ui === "Free" ? "free" : ui === "Pro" ? "pro" : null;
// const toBillingCycle = (annual: boolean): BillingCycle => (annual ? "yearly" : "monthly");

// const getAuthToken = () =>
//   localStorage.getItem("auth_token") ||
//   sessionStorage.getItem("auth_token") ||
//   localStorage.getItem("token") ||
//   sessionStorage.getItem("token") ||
//   "";







// // theme/visual constants
// const GRAD = "linear-gradient(270deg, #FF14EF 0%, #1A73E8 100%)";
// const SELECTED_CARD_BG =
//   "linear-gradient(180deg, rgba(255, 20, 239, 0.5) 0%, rgba(26, 115, 232, 0.5) 100%)";

// const INR = (n: number) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(n);

// export default function Subscription() {
//   const { user, isReady } = useAuth();
//   const [annual, setAnnual] = useState(false);
//   const [selected, setSelected] = useState<PlanKey>("Pro");
//   const [creating, setCreating] = useState(false);

//   const prices = { Free: 0, Pro: 799, Enterprise: 7999 } as const;
//   const tokens = { Free: "5,000", Pro: "100,000", Enterprise: "1,000,000" } as const;



// const orgId = user?.orgId || null; // ✅ use context

// const note = annual ? "Billed yearly (Save up to 20%)" : undefined;


//   if (!isReady) {
//     return <div className="min-h-screen bg-[#07080A] text-white">Loading…</div>;
//   }


//   const priceFor = (p: PlanKey) => {
//     const m = prices[p];
//     const v = annual ? Math.round(m * 0.8) : m;
//     return `${INR(v)}/month`;
//   };





//   // const note = useMemo(() => (annual ? "Billed yearly (Save up to 20%)" : undefined), [annual]);

//   // ---------------- Razorpay helpers ----------------
//   const ensureRazorpay = () =>
//     new Promise<void>((resolve, reject) => {
//       if ((window as any).Razorpay) return resolve();
//       const s = document.createElement("script");
//       s.src = "https://checkout.razorpay.com/v1/checkout.js";
//       s.onload = () => resolve();
//       s.onerror = () => reject(new Error("razorpay_script_load_failed"));
//       document.body.appendChild(s);
//     });


//   function openCheckout({ key, order }: { key: string; order: any }) {
//     return new Promise<{
//       razorpay_payment_id: string;
//       razorpay_order_id: string;
//       razorpay_signature: string;
//     }>((resolve, reject) => {
//       const rzp = new (window as any).Razorpay({
//         key,
//         order_id: order.id,
//         name: "Tokun.world",
//         description: "Subscription Payment",
//         prefill: { name: "Static User", email: "user@example.com", contact: "9999999999" },
//         notes: order.notes || {},
//         handler: (response: any) => {
//           console.log("[Subscribe] ✔ Checkout success handler:", response);
//           resolve(response);
//         },
//         modal: { ondismiss: () => reject(new Error("checkout_dismissed")) },
//       });
//       rzp.open();
//     });
//   }

//   async function verifyUserPayment(payload: {
//     razorpay_payment_id: string;
//     razorpay_order_id: string;
//     razorpay_signature: string;
//   }) {
//     console.groupCollapsed(
//       "%c[Subscribe] POST → /api/plans/subscribe/verify/verifypayment",
//       "color:#60a5fa;font-weight:700;"
//     );
//     console.log("[Subscribe] URL:", VERIFY_USER_PAYMENT_URL);
//     console.log("[Subscribe] Payload:", payload);

//     const res = await fetch(VERIFY_USER_PAYMENT_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         paymentId: payload.razorpay_payment_id,
//         orderId: payload.razorpay_order_id,
//         signature: payload.razorpay_signature,
//       }),
//       credentials: "include",
//     });

//     console.log("[Subscribe] HTTP:", res.status, res.statusText);
//     const raw = await res.text();
//     console.log("[Subscribe] Raw body:", raw);

//     let data: any = {};
//     try {
//       data = JSON.parse(raw);
//     } catch (e) {
//       console.warn("[Subscribe] JSON parse failed:", e);
//     }

//     if (!res.ok || !data.success) {
//       const code = data?.error || `http_${res.status}`;
//       console.error("[Subscribe] ❌ VERIFY FAILED:", code);
//       console.groupEnd();
//       throw new Error(code);
//     }

//     console.log("%c[Subscribe] ✅ VERIFY SUCCESS", "color:#22c55e;font-weight:700;");
//     console.log(
//       "[Subscribe] Plan:",
//       data.plan,
//       "Cycle:",
//       data.billingCycle,
//       "currentPeriodEnd:",
//       data.currentPeriodEnd
//     );
//     if (data.subscriptionPeriod) console.log("[Subscribe] Period:", data.subscriptionPeriod);
//     console.groupEnd();

//     return data;
//   }

//   // ---------------- Create → Checkout → Verify (IND only) ----------------
//   const startPurchase = async () => {
//     const planKey = toServerPlanKey(selected);
//     if (!planKey) {
//       console.warn("[Subscribe] Enterprise not supported here. Handle separately.");
//       return;
//     }

//     setCreating(true);
//     try {
//       // 1) Create order
//       const headers: Record<string, string> = { "Content-Type": "application/json" };
//       const token = getAuthToken();
//       if (token) headers.Authorization = `Bearer ${token}`;

//       console.groupCollapsed(
//         "%c[Subscribe] POST → /api/plans/subscribe/order/create/user",
//         "color:#60a5fa;font-weight:700;"
//       );
//       console.log("[Subscribe] URL:", CREATE_USER_ORDER_URL);
//       console.log("[Subscribe] Headers:", { ...headers, Authorization: headers.Authorization ? "Bearer <present>" : "—" });
//       console.log("[Subscribe] Payload:", { planKey, billingCycle: toBillingCycle(annual) });

//       const res = await fetch(CREATE_USER_ORDER_URL, {
//         method: "POST",
//         headers,
//         body: JSON.stringify({ planKey, billingCycle: toBillingCycle(annual) }),
//         credentials: "include",
//       });

//       console.log("[Subscribe] HTTP:", res.status, res.statusText);
//       const raw = await res.text();
//       console.log("[Subscribe] Raw body:", raw);
//       let data: any = {};
//       try {
//         data = JSON.parse(raw);
//       } catch (e) {
//         console.warn("[Subscribe] JSON parse failed:", e);
//       }
//       console.groupEnd();

//       if (!res.ok || !data.success) {
//         const code = data?.error || `http_${res.status}`;
//         console.error("[Subscribe] ❌ CREATE FAILED:", code);
//         return;
//       }

//       // 2) Free plan = short-circuit (no payment)
//       if (data?.free === true || data?.message === "no_payment_required") {
//         console.log(
//           "%c[Subscribe] ✅ FREE plan activated / renewal - no payment required",
//           "color:#22c55e;font-weight:700;"
//         );
//         return;
//       }

//       // 3) Paid plan: open Razorpay
//       await ensureRazorpay();
//       const checkoutRes = await openCheckout({ key: data.key, order: data.order });

//       // 4) Verify payment
//       await verifyUserPayment(checkoutRes);

//       console.log("%c[Subscribe] 🎉 IND purchase complete", "color:#22c55e;font-weight:700;");
//     } catch (e: any) {
//       console.error("[Subscribe] ❌ FLOW FAILED:", e?.message || e);
//     } finally {
//       setCreating(false);
//     }
//   };



// // const ENTERPRISE_PLAN_KEY = "enterprise" as const;
// const ENTERPRISE_PLAN_KEY = "enterprise" as const;
// const startEnterprisePurchase = async () => {
//   const token = getAuthToken();
//   if (!token) {
//     console.warn("[Subscribe/ORG] No auth token found.");
//     return;
//   }
//   const orgId = user?.orgId || null;
//   if (!orgId) {
//     alert("We couldn’t find your Organization ID. Please log in as the org owner.");
//     return;
//   }

//   setCreating(true);
//   try {
//     // 1) create order
//     const res = await fetch(CREATE_ORG_ORDER_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//       body: JSON.stringify({ orgId, billingCycle: toBillingCycle(annual), planKey: "enterprise" }),
//       credentials: "include",
//     });
//     const data = await res.json();
//     if (!res.ok || !data?.success) {
//       alert(`Unable to start enterprise checkout: ${data?.error || res.status}`);
//       return;
//     }

//     // 2) checkout
//     await ensureRazorpay();
//     const checkoutRes = await openCheckout({ key: data.key, order: data.order });

//     // 3) verify (activates org plan)
//     const vRes = await fetch(VERIFY_ORG_PAYMENT_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//       body: JSON.stringify({
//         paymentId: checkoutRes.razorpay_payment_id,
//         orderId: checkoutRes.razorpay_order_id,
//         signature: checkoutRes.razorpay_signature,
//       }),
//       credentials: "include",
//     });
//     const vJson = await vRes.json();
//     if (!vRes.ok || !vJson?.success) {
//       alert(`Verification failed: ${vJson?.error || vRes.status}`);
//       return;
//     }

//     console.log("[Subscribe/ORG] ✅ verify success:", vJson);

//     // (optional) refetch /me and/or /org/:id to update UI with plan & tokens
//   } catch (e: any) {
//     console.error("[Subscribe/ORG] ❌ FLOW FAILED:", e?.message || e);
//     alert(`Enterprise purchase failed: ${e?.message || "unexpected_error"}`);
//   } finally {
//     setCreating(false);
//   }
// };










//  return (
//   <div className="min-h-screen bg-[#07080A] text-white">
//     <Header />

//     <main className="container mx-auto max-w-[1100px] px-4 pt-28 pb-14">
      
//       {/* Title */}
//       <div className="text-center max-w-[780px] mx-auto space-y-3">
//         <h1 className='font-["Inter"] font-semibold text-[22px] sm:text-[26px] leading-tight'>
//           Flexible Subscription Plans for Every Need
//         </h1>

//         <p className='font-["Inter"] text-[13px] text-white/80'>
//           Select the plan that perfectly fits your tokun optimization goals.
//         </p>
//       </div>

//       {/* Billing toggle */}
//       <div className="mt-8 mb-10 flex items-center justify-center gap-4 sm:gap-6 text-[12px]">
//         <span className="leading-none">Billed monthly</span>

//         <Switch
//           id="billing"
//           checked={annual}
//           onCheckedChange={setAnnual}
//           className={[
//             "relative inline-flex h-5 w-9 rounded-full border border-white/20 transition-colors",
//             "data-[state=checked]:border-transparent",
//             "[&>span]:pointer-events-none [&>span]:block [&>span]:h-4 [&>span]:w-4 [&>span]:rounded-full [&>span]:bg-white [&>span]:transition-transform",
//             "[&>span]:translate-x-0.5 data-[state=checked]:[&>span]:translate-x-[18px]",
//           ].join(" ")}
//           style={annual ? { background: GRAD } : { background: "#17171A" }}
//         />

//         <span className="leading-none">
//           Billed yearly <span>(Save up to 20%)</span>
//         </span>
//       </div>

//       {/* Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-x-2 lg:gap-y-4 justify-items-center">

//         <PlanCard
//           selected={selected === "Free"}
//           onSelect={() => setSelected("Free")}
//           onChoose={() => {
//             if (!creating) setSelected("Free");
//             startPurchase();
//           }}
//           title="Free"
//           subtitle="(Individuals)"
//           price={priceFor("Free")}
//           tokens={tokens.Free}
//           extras={[{ label: "Extra Tokens Feature", value: "No" }]}
//         />

//         <PlanCard
//           selected={selected === "Pro"}
//           onSelect={() => setSelected("Pro")}
//           onChoose={() => {
//             if (!creating) setSelected("Pro");
//             startPurchase();
//           }}
//           title="Pro"
//           subtitle="(Individuals)"
//           price={priceFor("Pro")}
//           tokens={tokens.Pro}
//           highlight="Most Popular"
//           extras={[
//             { label: "Extra Tokens Feature", value: "Yes" },
//             { label: "No. of Extra Tokens", value: "50,000" },
//             { label: "Extra Token Price", value: "₹200" },
//           ]}
//         />

//         <PlanCard
//           selected={selected === "Enterprise"}
//           onSelect={() => setSelected("Enterprise")}
//           onChoose={() => {
//             if (!creating) setSelected("Enterprise");
//             startEnterprisePurchase();
//           }}
//           title="Enterprise"
//           subtitle="(Organization)"
//           price={priceFor("Enterprise")}
//           tokens={tokens.Enterprise}
//           extras={[
//             { label: "Extra Tokens Feature", value: "Yes" },
//             { label: "No. of Extra Tokens", value: "100,000" },
//             { label: "Extra Token Price", value: "₹199" },
//           ]}
//         />

//       </div>

//       {/* Comparison Table */}
//       <ComparisonTable />

//       <p className='text-center text-[11px] mt-8 font-["Inter"] leading-[1] text-white/70'>
//         {note ?? " "}
//       </p>

//     </main>

//     <Footer />
//   </div>
// );


// /* -------------------- Plan Card -------------------- */

// function PlanCard({
//   selected,
//   onSelect,
//   onChoose,
//   title,
//   subtitle,
//   price,
//   tokens,
//   extras,
//   highlight,
// }) {
//   const [amount, per] = price.split("/");

//   return (
//     <Card
//       onClick={onSelect}
//       className="relative cursor-pointer flex flex-col w-[250px] h-[400px]"
//       style={{
//         borderRadius: 16,
//         border: "1px solid #35343C",
//         background: selected ? SELECTED_CARD_BG : "#0D0D0E",
//         color: "#FFFFFF",
//       }}
//     >
//       {highlight && (
//         <div
//           className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full text-[10px] font-medium border border-white/25"
//           style={{ background: GRAD, color: "#fff" }}
//         >
//           {highlight}
//         </div>
//       )}

//       <CardHeader className="pt-5 pb-2">
//         <div className="space-y-3">
//           <CardTitle className='text-center font-["Inter"] font-semibold text-[32px] leading-[1]'>
//             {title}
//           </CardTitle>

//           <div className='text-center font-["Inter"] text-[12px] leading-[1]'>
//             {subtitle}
//           </div>

//           <div className="text-center mt-6">
//             <span className='font-["Inter"] font-semibold text-[28px] leading-[1]'>
//               {amount}
//             </span>

//             <span className='ml-1 align-middle font-["Inter"] font-normal text-[16px] leading-[1]'>
//               /{per}
//             </span>
//           </div>
//         </div>
//       </CardHeader>

//       <CardContent className="flex-1 flex items-center justify-center">
//         <div className="w-[220px] mx-auto">
          
//           <div className='text-center font-["Inter"] text-[16px] leading-[1] whitespace-nowrap'>
//             Monthly Tokens: {tokens}
//           </div>

//           <ul className="mt-4 space-y-2 mx-auto">
//             {extras.map((e) => {
//               const negative = e.value === "No" || e.value === "—";

//               return (
//                 <li
//                   key={e.label}
//                   className="grid grid-cols-[16px_max-content_8px_1fr] gap-x-2 items-center"
//                 >
//                   {negative ? (
//                     <X className="h-[14px] w-[14px]" />
//                   ) : (
//                     <Check className="h-[14px] w-[14px]" />
//                   )}

//                   <span className='font-["Inter"] text-[12px] leading-[1]'>
//                     {e.label}
//                   </span>

//                   <span className='font-["Inter"] text-[12px] leading-[1]'>
//                     :
//                   </span>

//                   <span className='font-["Inter"] text-[12px] leading-[1] font-medium'>
//                     {e.value}
//                   </span>
//                 </li>
//               );
//             })}
//           </ul>
//         </div>
//       </CardContent>

//       <CardFooter className="pt-3 pb-5 flex justify-center">
//         <Button
//           onClick={(e) => {
//             e.stopPropagation();
//             onChoose();
//           }}
//           className='font-["Inter"] text-[16px] w-[200px] h-[50px] rounded-[6px]'
//           style={
//             selected
//               ? { background: GRAD, border: "1px solid #FFFFFF", color: "#fff" }
//               : { background: "transparent", border: "1px solid #FFFFFF", color: "#fff" }
//           }
//           variant="ghost"
//         >
//           Choose Plan
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// }


// /* -------------------- Comparison table -------------------- */

// function ComparisonTable() {

//   type Cell = boolean | string | JSX.Element;

//   const cell = (v: Cell) => {
//     if (typeof v === "boolean") {
//       return v
//         ? <Check className="inline-block h-4 w-4" />
//         : <X className="inline-block h-4 w-4" />;
//     }
//     return v;
//   };

//   const checkText = (text: string) => (
//     <span className='inline-flex items-center justify-center gap-1 text-[11px] font-["Inter"]'>
//       <Check className="h-4 w-4" />
//       <span>{text}</span>
//     </span>
//   );

//   const row = (label: string, free: Cell, pro: Cell, ent: Cell) => (
//     <tr className="border-t border-white/10">
//       <td className='py-3 pr-4 text-left text-[12px] font-["Inter"] whitespace-nowrap'>
//         {label}
//       </td>

//       <td className="py-3 text-center">{cell(free)}</td>
//       <td className="py-3 text-center">{cell(pro)}</td>
//       <td className="py-3 text-center">{cell(ent)}</td>
//     </tr>
//   );

//   return (
//     <div className="mt-10 overflow-x-auto">
//       <table className="w-full min-w-[650px] text-center text-sm text-white">

//         <thead>
//           <tr className='text-[14px] font-["Inter"]'>
//             <th className="text-left font-normal"></th>
//             <th className="font-normal">Free</th>
//             <th className="font-normal">Pro</th>
//             <th className="font-normal">Enterprise</th>
//           </tr>
//         </thead>

//         <tbody>

//           {row("Basic Access to AI Tools (SmartGen, Prompt Optimizer)", true, true, true)}
//           {row("Chat Support", false, true, true)}
//           {row("Email Support", true, true, true)}
//           {row("Team Features", false, false, true)}

//           {row(
//             "No. of Team Members",
//             <X className="inline-block h-4 w-4" />,
//             <X className="inline-block h-4 w-4" />,
//             <Check className="inline-block h-4 w-4" />
//           )}

//           {row(
//             "History",
//             <span className='text-[11px]'>(up to 5 entries)</span>,
//             <span className='text-[11px]'>(unlimited entries)</span>,
//             <span className='text-[11px]'>(unlimited entries)</span>
//           )}

//           {row(
//             "Token Usage (Counted monthly only)",
//             <span className='text-[11px]'>(section-wise)</span>,
//             <span className='text-[11px]'>(section-wise)</span>,
//             <span className='text-[11px]'>(section-wise)</span>
//           )}

//           {row(
//             "Extra Tokens Feature",
//             false,
//             checkText("Extra Tokens: 50,000  Price: ₹200"),
//             checkText("Extra Tokens: 100,000  Price: ₹199")
//           )}

//           {row(
//             "Phone Support",
//             <span className='text-[11px]'>9:00–18:00, MON–SUN</span>,
//             <span className='text-[11px]'>9:00–18:00, MON–SUN</span>,
//             <span className='text-[11px]'>24/7 Dedicated Support</span>
//           )}

//         </tbody>
//       </table>
//     </div>
//   );
// }
// }




// src/pages/Subscription.tsx
import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { withTokunBranding } from "@/lib/razorpayTheme";
/* Every failure on this page used to be a window.alert — a white OS box on a
   dark page, blocking the tab, and looking like it came from the browser rather
   than from Tokun. The rest of the app reports outcomes with this toast; the
   pricing page was the one place that didn't. */
import { toast } from "@/components/ui/use-toast";

type PlanKey = "Free" | "Pro" | "Enterprise";
type ServerPlanKey = "free" | "pro";
type BillingCycle = "monthly" | "yearly";

const API_BASE =
  ((import.meta as any).env?.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "";

const CREATE_USER_ORDER_URL = API_BASE
  ? `${API_BASE}/api/plans/subscribe/order/create/user`
  : `/api/plans/subscribe/order/create/user`;

const VERIFY_USER_PAYMENT_URL = API_BASE
  ? `${API_BASE}/api/plans/subscribe/verify/verifypayment`
  : `/api/plans/subscribe/verify/verifypayment`;

const VERIFY_ORG_PAYMENT_URL = VERIFY_USER_PAYMENT_URL;

const CREATE_ORG_ORDER_URL = API_BASE
  ? `${API_BASE}/api/plans/subscribe/order/create/org`
  : `/api/plans/subscribe/order/create/org`;

const toServerPlanKey = (ui: PlanKey): ServerPlanKey | null =>
  ui === "Free" ? "free" : ui === "Pro" ? "pro" : null;

const toBillingCycle = (annual: boolean): BillingCycle => (annual ? "yearly" : "monthly");

const getAuthToken = () =>
  localStorage.getItem("auth_token") ||
  sessionStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("token") ||
  "";

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
  const { user, isReady, persistAuth, refreshQuota } = useAuth();

  /* The plan this account is actually on — as a key, so the cards can compare
     against it rather than just print it. Without this, the plan you had just
     paid for still showed an inviting "Choose Plan" that reopened checkout. */
  const currentPlanKey: PlanKey = (() => {
    const raw = String((user as any)?.plan || "free").toLowerCase();
    if (raw.startsWith("pro")) return "Pro";
    if (raw.startsWith("enter")) return "Enterprise";
    return "Free";
  })();

  /* What a card's button says and whether it does anything.

       the plan you're on  → says so, does nothing
       Free, from a paid plan
                           → not a purchase at all. Downgrading happens by
                             letting the paid plan lapse, so "Choose Plan" here
                             was an offer we can't honour — and pressing it
                             started a ₹0 checkout that announced a free plan
                             had been "activated" when nothing had changed.
       anything else       → a real upgrade */
  const ctaFor = (plan: PlanKey) => {
    if (plan === currentPlanKey) return { ctaLabel: "Current plan", disabled: true, isCurrent: true };
    if (plan === "Free") return { ctaLabel: "Included with every account", disabled: true, isCurrent: false };
    /* Enterprise is billed to an organization: the checkout route is
       /order/create/org and it needs an orgId. A signed-in individual — Pro or
       Free — has none, so this button could only ever get as far as telling them
       so after they pressed it. Said up front instead.

       Only when we KNOW the account can't buy it. A visitor who isn't signed in
       yet is left with a live button, because "no org" isn't established for
       them, and the org path still handles the rest. */
    if (plan === "Enterprise" && user && !(user as any)?.orgId) {
      return { ctaLabel: "Organization plan", disabled: true, isCurrent: false };
    }
    /* The mirror of that rule: an ORGANIZATION account can't buy the individual
       plans. Free and Pro are provisioned per person and billed to a user
       (/order/create/user rejects anything that isn't userType "IND"), so on an
       org account these were two buttons whose only possible outcome was
       "not_individual_account". Enterprise is the org's plan. */
    if (plan !== "Enterprise" && (user as any)?.userType === "ORG") {
      return { ctaLabel: "Individual plan", disabled: true, isCurrent: false };
    }
    return { ctaLabel: "Choose Plan", disabled: false, isCurrent: false };
  };
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);
  const [selected, setSelected] = useState<PlanKey>("Pro");
  const [creating, setCreating] = useState(false);

  const prices = { Free: 0, Pro: 799, Enterprise: 7999 } as const;
  const tokens = { Free: "5,000", Pro: "100,000", Enterprise: "1,000,000" } as const;

  const orgId = user?.orgId || null;

  const note = annual ? "Billed yearly (Save up to 20%)" : undefined;

  if (!isReady) {
    return <div className="min-h-screen bg-[#07080A] text-white">Loading…</div>;
  }

  const priceFor = (p: PlanKey) => {
    const m = prices[p];
    const v = annual ? Math.round(m * 0.8) : m;
    return `${INR(v)}/month`;
  };

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
      const rzp = new (window as any).Razorpay(withTokunBranding({
        key,
        order_id: order.id,
        description: "Subscription Payment",
        /* No contact here, deliberately. This block used to be three hardcoded
           placeholders — "Static User" / user@example.com / 9999999999 — which
           went out on every real subscription payment and landed on the
           Razorpay payment record. Name and email come from the signed-in
           account; the phone number is left for the payer to type, because we
           don't hold one (there is no phone field on User) and inventing one is
           worse than asking. */
        prefill: {
          ...(user?.name ? { name: user.name } : {}),
          ...(user?.email ? { email: user.email } : {}),
        },
        notes: order.notes || {},
        handler: (response: any) => {
          console.log("[Subscribe] ✔ Checkout success handler:", response);
          resolve(response);
        },
        modal: { ondismiss: () => reject(new Error("checkout_dismissed")) },
      }));

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

  /* What happens the moment a plan is paid for.

     Neither of these used to happen at all: the page logged "purchase
     complete" and left the buyer sitting on the pricing grid, with the auth
     context still holding the plan it had cached at login. So the new plan
     appeared only whenever something else happened to refresh the account —
     the lag you'd see on the subscription page after paying for Pro.

     The verify response is authoritative for plan/cycle/period, so it goes
     into the context first; refreshQuota() then follows with the new token
     allowance, and My Subscription is where the buyer actually wanted to end
     up. */
  const finishPurchase = (verified: any) => {
    const patch: Record<string, any> = {};
    if (verified?.plan) patch.plan = verified.plan;
    if (verified?.billingCycle) patch.billingCycle = verified.billingCycle;
    if (verified?.currentPeriodEnd) patch.currentPeriodEnd = verified.currentPeriodEnd;

    if (Object.keys(patch).length) persistAuth?.({ user: patch as any });

    // Fire and forget — the navigation below doesn't wait on token counts.
    refreshQuota?.()?.catch?.(() => {});

    navigate("/self-dash?tab=subscription");
  };

  const startPurchase = async (plan: PlanKey = selected) => {
    /* The plan comes in as an argument now.

       It used to read `selected`, and every card called
       `setSelected("Pro"); startPurchase();` in the same handler — but
       setSelected is asynchronous, so startPurchase ran against the PREVIOUS
       selection. Press Pro while Free was highlighted and you bought Free. */
    const planKey = toServerPlanKey(plan);

    if (!planKey) {
      console.warn("[Subscribe] Enterprise not supported here. Handle separately.");
      return;
    }

    setCreating(true);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = getAuthToken();

      if (token) headers.Authorization = `Bearer ${token}`;

      console.groupCollapsed(
        "%c[Subscribe] POST → /api/plans/subscribe/order/create/user",
        "color:#60a5fa;font-weight:700;"
      );

      console.log("[Subscribe] URL:", CREATE_USER_ORDER_URL);
      console.log("[Subscribe] Headers:", {
        ...headers,
        Authorization: headers.Authorization ? "Bearer <present>" : "—",
      });
      console.log("[Subscribe] Payload:", {
        planKey,
        billingCycle: toBillingCycle(annual),
      });

      const res = await fetch(CREATE_USER_ORDER_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          planKey,
          billingCycle: toBillingCycle(annual),
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

      console.groupEnd();

      if (!res.ok || !data.success) {
        const code = data?.error || `http_${res.status}`;
        console.error("[Subscribe] ❌ CREATE FAILED:", code);
        return;
      }

      if (data?.free === true || data?.message === "no_payment_required") {
        console.log(
          "%c[Subscribe] ✅ FREE plan activated / renewal - no payment required",
          "color:#22c55e;font-weight:700;"
        );
        return;
      }

      await ensureRazorpay();

      const checkoutRes = await openCheckout({
        key: data.key,
        order: data.order,
      });

      const verified = await verifyUserPayment(checkoutRes);

      console.log("%c[Subscribe] 🎉 IND purchase complete", "color:#22c55e;font-weight:700;");

      finishPurchase(verified);
    } catch (e: any) {
      console.error("[Subscribe] ❌ FLOW FAILED:", e?.message || e);
    } finally {
      setCreating(false);
    }
  };

  const ENTERPRISE_PLAN_KEY = "enterprise" as const;

  const startEnterprisePurchase = async () => {
    const token = getAuthToken();

    if (!token) {
      console.warn("[Subscribe/ORG] No auth token found.");
      return;
    }

    const orgId = user?.orgId || null;

    if (!orgId) {
      /* An individual pressing Enterprise, which is the common case rather than
         an error: the plan is billed to an organization, so there is nothing to
         charge. Says what to do about it instead of naming a missing ID. */
      toast({
        title: "Enterprise is billed to an organization",
        description:
          "This plan needs an organization account, and you're signed in as an individual. Sign in as the org owner, or pick Pro for individual use.",
      });
      return;
    }

    setCreating(true);

    try {
      const res = await fetch(CREATE_ORG_ORDER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orgId,
          billingCycle: toBillingCycle(annual),
          planKey: "enterprise",
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        toast({
          title: "Couldn't start enterprise checkout",
          description: String(data?.error || `Server responded ${res.status}.`),
        });
        return;
      }

      await ensureRazorpay();

      const checkoutRes = await openCheckout({
        key: data.key,
        order: data.order,
      });

      const vRes = await fetch(VERIFY_ORG_PAYMENT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentId: checkoutRes.razorpay_payment_id,
          orderId: checkoutRes.razorpay_order_id,
          signature: checkoutRes.razorpay_signature,
        }),
        credentials: "include",
      });

      const vJson = await vRes.json();

      if (!vRes.ok || !vJson?.success) {
        /* The money may well have been taken — Razorpay collected it and our
           verify call is what failed. Never say "payment failed" here. */
        toast({
          title: "Payment couldn't be confirmed",
          description:
            "If you were charged, the plan activates once we reconcile it. Contact support with your payment ID if it doesn't.",
        });
        return;
      }

      console.log("[Subscribe/ORG] ✅ verify success:", vJson);

      finishPurchase(vJson);
    } catch (e: any) {
      console.error("[Subscribe/ORG] ❌ FLOW FAILED:", e?.message || e);
      toast(
        e?.message === "checkout_dismissed"
          ? { title: "Checkout closed", description: "Payment was not completed." }
          : {
              title: "Enterprise purchase failed",
              description: e?.message || "Something went wrong. Please try again.",
            },
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080A] text-white">
      <Header />

      {/* No `container`.
       *
       * That class snaps the page down to the current breakpoint — so from 768px
       * to 1023px it was a flat 768px wide, and a 900px tablet got exactly the
       * same 736px of usable width as a 768px one. `max-w-[1100px]` was already
       * the binding limit above 1100, so all `container` ever did here was throw
       * away real width in the middle of the range.
       *
       * That thrown-away width is what stopped three cards fitting on a tablet:
       * they need 774px and the cap allowed 736px, at every width from 768 to
       * 1023. Without it a 820px iPad has 788px and they fit. */}
      <main className="mx-auto max-w-[1100px] px-4 pt-16 sm:pt-18 pb-10">
        {/* Title */}
        <div className="text-center max-w-[780px] mx-auto space-y-2">
          <h1 className='font-["Inter"] font-semibold text-[22px] sm:text-[26px] leading-tight'>
            Flexible Subscription Plans for Every Need
          </h1>

          <p className='font-["Inter"] text-[13px] text-white/80'>
            Select the plan that perfectly fits your tokun optimization goals.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mt-5 mb-6 flex items-center justify-center gap-4 sm:gap-6 text-[12px]">
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

        {/* Cards.

            Each card and its phone-only feature panel share ONE grid cell (the
            wrapping div), rather than the panel being a grid item of its own.
            As a sibling it would take the next cell, and at `sm` — two columns,
            where the panels are still visible — the grid would fill as
            card/panel/card/panel across the rows and the three plans would stop
            lining up. Inside a cell it always sits under its own card, at every
            width. */}
        {/* 1 column, then 3. Never 2.
         *
         * `sm:grid-cols-2` used to put two plans on a row and the third alone
         * underneath, from 640px all the way to 1024 — a comparison of three
         * things laid out as two things and an afterthought. With exactly three
         * cards there is no width at which two columns is the right answer.
         *
         * `min-[806px]`, not `md` or `lg`. The card is a fixed 250px and cannot
         * shrink — its own token line and CTA are 200px inside 48px of padding,
         * so 248px is the floor (see PlanCard). Three of them plus two 12px gaps
         * need 774px of content, which with `px-4` is a 806px viewport.
         *
         * A named breakpoint would be wrong in both directions: `md` (768px) is
         * 38px short and would overflow, and `lg` (1024px) leaves every tablet
         * between 806 and 1023 stacked for no reason. The number is not a
         * preference, it is the width at which three cards physically fit, so it
         * is written as that width. */}
        <div className="grid grid-cols-1 min-[806px]:grid-cols-3 gap-3 lg:gap-x-2 lg:gap-y-4 justify-items-center">
          <div className="flex w-full flex-col items-center">
            <PlanCard
              selected={selected === "Free"}
              onSelect={() => setSelected("Free")}
              onChoose={() => {
                if (!creating) setSelected("Free");
                startPurchase("Free");
              }}
              {...ctaFor("Free")}
              title="Free"
              subtitle="(Individuals)"
              price={priceFor("Free")}
              tokens={tokens.Free}
              extras={[{ label: "Extra Tokens Feature", value: "No" }]}
            />
            {/* md:hidden — from md up the comparison table renders below, and
                showing both would print the same nine facts twice. */}
            <div className="md:hidden">
              <PlanFeatureList plan="free" title="Free" />
            </div>
            <PlanGroupDivider />
          </div>

          <div className="flex w-full flex-col items-center">
            <PlanCard
              selected={selected === "Pro"}
              onSelect={() => setSelected("Pro")}
              onChoose={() => {
                if (!creating) setSelected("Pro");
                startPurchase("Pro");
              }}
              {...ctaFor("Pro")}
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
            <div className="md:hidden">
              <PlanFeatureList plan="pro" title="Pro" />
            </div>
            <PlanGroupDivider />
          </div>

          <div className="flex w-full flex-col items-center">
            <PlanCard
              selected={selected === "Enterprise"}
              onSelect={() => setSelected("Enterprise")}
              onChoose={() => {
                if (!creating) setSelected("Enterprise");
                startEnterprisePurchase();
              }}
              {...ctaFor("Enterprise")}
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
            <div className="md:hidden">
              <PlanFeatureList plan="ent" title="Enterprise" />
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <ComparisonTable />

        <p className='text-center text-[11px] mt-5 font-["Inter"] leading-[1] text-white/70'>
          {note ?? " "}
        </p>
      </main>

      <Footer />
    </div>
  );
}

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
  highlight = "",
  /* Same three the dashboard's card takes, so a plan reads the same in both
     places — see SubscriptionsSection in components/PromptHistory.tsx. */
  isCurrent = false,
  ctaLabel = "Choose Plan",
  disabled = false,
}) {
  const [amount, per] = price.split("/");

  return (
    <Card
      onClick={onSelect}
      /* ONE SIZE, EVERY SCREEN: 250 × 400.
       *
       * This was briefly `w-full lg:w-[250px]` so the card would run to the page
       * margins on a phone and fit a 237px tablet cell. Both worked, and both
       * changed what the card IS — 250×400 became 358×400 on a phone, which is
       * the same content in a squat frame with different padding, a wrapped
       * token line and a button that no longer filled its row. A card people
       * recognise is worth more than a card that fills the width.
       *
       * So the width is fixed and the GRID does the responding: one column until
       * there is room for three, never two (see the note on the grid). Everything
       * inside — the content column, the token line, the CTA — is back to a
       * single fixed value for the same reason. */
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
            if (disabled) return;
            onChoose();
          }}
          disabled={disabled}
          className='font-["Inter"] text-[16px] w-[200px] h-[50px] rounded-[6px] disabled:opacity-100 disabled:cursor-default'
          style={
            /* The plan you're already on is a state, not an offer. */
            isCurrent
              ? { background: "#14532D", border: "1px solid rgba(187,247,208,0.35)", color: "#BBF7D0" }
              : disabled
                ? { background: "transparent", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.45)" }
                : selected
                  ? { background: GRAD, border: "1px solid #FFFFFF", color: "#fff" }
                  : { background: "transparent", border: "1px solid #FFFFFF", color: "#fff" }
          }
          variant="ghost"
        >
          {ctaLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}

/* -------------------- Plan comparison -------------------- */

/**
 * What the three plans differ on, as data.
 *
 * It used to be nine `row(...)` calls with JSX baked into each cell, which meant
 * the only way to show this information was as that one table — and that table is
 * `min-w-[650px]`, so on a phone the whole comparison sat behind a sideways drag
 * most people never discovered. Nine features and three plans, and the answer to
 * "what do I get for ₹200" was off-screen.
 *
 * Plain values, so the same nine facts can be drawn two ways: the table on a wide
 * screen, and one list per plan inside that plan's own card on a narrow one. A
 * cell holds `true`/`false` (a tick or a cross) or a string (shown as text) —
 * never markup, because markup is what tied this to a single layout before.
 *
 * The parentheses are gone from the strings: "(up to 5 entries)" was written that
 * way to stop a bare fragment reading oddly under a column header, and both
 * renderers now put the feature name right beside the value, so "History — up to
 * 5 entries" needs no bracket to make sense.
 */
/* `PlanColumn`, not `PlanKey` — that name is already taken further up by the
   plan's display name ("Free" | "Pro" | "Enterprise"), and two types one
   capital letter apart is a trap. This one names a COLUMN of the comparison
   data below, which each card passes explicitly. */
type PlanColumn = "free" | "pro" | "ent";
type Cell = boolean | string;

const COMPARISON_ROWS: { label: string; free: Cell; pro: Cell; ent: Cell }[] = [
  { label: "Basic Access to AI Tools (SmartGen, Product Optimiser)", free: true, pro: true, ent: true },
  { label: "Chat Support", free: false, pro: true, ent: true },
  { label: "Email Support", free: true, pro: true, ent: true },
  { label: "Team Features", free: false, pro: false, ent: true },
  { label: "No. of Team Members", free: false, pro: false, ent: true },
  { label: "History", free: "up to 5 entries", pro: "unlimited entries", ent: "unlimited entries" },
  {
    label: "Token Usage (Counted monthly only)",
    free: "section-wise",
    pro: "section-wise",
    ent: "section-wise",
  },
  {
    label: "Extra Tokens Feature",
    free: false,
    pro: "50,000 for ₹200",
    ent: "100,000 for ₹199",
  },
  {
    label: "Phone Support",
    free: "9:00–18:00, MON–SUN",
    pro: "9:00–18:00, MON–SUN",
    ent: "24/7 Dedicated Support",
  },
];

/**
 * The line between one plan and the next, on a phone.
 *
 * BETWEEN GROUPS, not between a card and its own feature list. A plan is two
 * blocks now — the pricing card and the list under it — and the boundary that
 * needs marking is where that pair ends and the next plan begins. A rule between
 * a card and its own list would say the opposite of the truth: that the two
 * belong to different things.
 *
 * Full width, and that is the point of it: an edge-to-edge rule reads as "a
 * section ended here", which is exactly what happened.
 *
 * `md:hidden` because from md up the plans sit side by side in columns, where
 * the gap between them already says this and a horizontal rule would be
 * pointing the wrong way entirely.
 *
 * Rendered after Free and after Pro, and NOT after Enterprise — a divider below
 * the last plan separates it from nothing.
 */
function PlanGroupDivider() {
  return (
    <div
      className="mt-6 mb-2 h-px w-full md:hidden"
      style={{ background: "rgba(255,255,255,0.12)" }}
    />
  );
}

/**
 * One plan's column of the comparison, as a list — the phone layout.
 *
 * A SEPARATE PANEL BELOW ITS CARD, not content inside it. The card is a fixed
 * 400px tall holding a price, a token count and three lines, and it is that size
 * on purpose; nine more rows do not go in it without either clipping them or
 * changing a card design that was already right. So the card is left exactly as
 * it is and this sits underneath it — with PlanGroupDivider marking where the
 * pair ends, rather than a rule between the two halves of one plan.
 *
 * Position is what says which plan it belongs to, and the heading confirms it —
 * the card is 400px tall, so by the time you have scrolled to the bottom of this
 * list its card may be off the top of the screen.
 *
 * Crosses are kept rather than filtered out. "No chat support" is a reason to
 * upgrade, and a list of only the good news is a worse answer to "what is the
 * difference between these" than a list with gaps in it.
 */
function PlanFeatureList({ plan, title }: { plan: PlanColumn; title: string }) {
  return (
    /* The card's width, flat 250px like the card itself — so the panel reads as
       belonging to the thing above it rather than as a new section that happens
       to follow it. */
    <div className="mt-3 w-[250px]">
      <div
        className="rounded-[16px] px-4 py-4"
        style={{ border: "1px solid #35343C", background: "#0D0D0E" }}
      >
        <div className='mb-3 font-["Inter"] text-[11px] uppercase tracking-wider text-white/40'>
          {title} includes
        </div>

        <ul className="space-y-2.5">
          {COMPARISON_ROWS.map((r) => {
            const v = r[plan];
            const yes = v !== false;

            return (
              <li key={r.label} className="flex items-start gap-2">
                {yes ? (
                  <Check className="mt-[2px] h-[13px] w-[13px] shrink-0" />
                ) : (
                  <X className="mt-[2px] h-[13px] w-[13px] shrink-0 text-white/35" />
                )}

                <span
                  className={`font-["Inter"] text-[12px] leading-snug ${
                    yes ? "text-white/80" : "text-white/35"
                  }`}
                >
                  {r.label}
                  {/* Only when the value says something the label doesn't. A
                      tick beside "Chat Support" already means yes; printing
                      "yes" after it would be noise. */}
                  {typeof v === "string" && <span className="text-white"> — {v}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function ComparisonTable() {
  const cell = (v: Cell) =>
    typeof v === "boolean" ? (
      v ? (
        <Check className="inline-block h-4 w-4" />
      ) : (
        <X className="inline-block h-4 w-4" />
      )
    ) : (
      <span className="text-[11px]">{v}</span>
    );

  return (
    /* `hidden md:block`, and no `overflow-x-auto` any more.
       Below md the same facts are inside the cards (PlanFeatureList), so keeping
       this here as well would print the entire comparison twice on a phone. The
       horizontal scroller went with it: the table only renders at widths where
       its 650px fits, so there is nothing left to scroll. */
    <div className="mt-6 hidden md:block">
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
          {COMPARISON_ROWS.map((r) => (
            <tr key={r.label} className="border-t border-white/10">
              <td className='py-3 pr-4 text-left text-[12px] font-["Inter"] whitespace-nowrap'>
                {r.label}
              </td>
              <td className="py-3 text-center">{cell(r.free)}</td>
              <td className="py-3 text-center">{cell(r.pro)}</td>
              <td className="py-3 text-center">{cell(r.ent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}