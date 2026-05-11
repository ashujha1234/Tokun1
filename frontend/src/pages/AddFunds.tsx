// import { useState, type CSSProperties } from "react";
// import { useNavigate } from "react-router-dom";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import { Info } from "lucide-react";

// type PaymentMethod = "upi" | "netbanking" | "card";

// const AddFunds = () => {
//   const navigate = useNavigate();

//   const fontBase = "Inter, system-ui, Arial, sans-serif";

//   const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
//   const [amount, setAmount] = useState("");
//   const [upiId, setUpiId] = useState("");

//   const currentBalance = 42850;
//   const totalEarning = 198200;
//   const monthlyEarning = 24650;

//   const addAmount = Number(amount || 0);
//   const serviceFee = addAmount > 0 ? addAmount * 0.02 : 0;
//   const debitAmount = addAmount > 0 ? addAmount + serviceFee : 0;

//   const confirmButtonTextStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 700,
//     fontStyle: "normal",
//     fontSize: 16,
//     lineHeight: "100%",
//     letterSpacing: "0%",
//     textAlign: "center",
//   };

//   const summaryLabelStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 400,
//     fontStyle: "normal",
//     fontSize: 14,
//     lineHeight: "100%",
//     letterSpacing: 0,
//     color: "#71717A",
//     whiteSpace: "nowrap",
//   };

//   const summaryValueStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 500,
//     fontStyle: "normal",
//     fontSize: 14,
//     lineHeight: "100%",
//     letterSpacing: 0,
//     color: "#FFFFFF",
//     whiteSpace: "nowrap",
//   };

//   const quickAmountTextStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 500,
//     fontStyle: "normal",
//     fontSize: 18,
//     lineHeight: "100%",
//     letterSpacing: 0,
//     textAlign: "center",
//     color: "#FFFFFF",
//   };

//   const paymentMethods = [
//     {
//       id: "upi" as PaymentMethod,
//       title: "UPI",
//       subtitle: "Instant",
//       icon: "/icons/upi.svg",
//     },
//     {
//       id: "netbanking" as PaymentMethod,
//       title: "Net Banking",
//       subtitle: "2-3 mins",
//       icon: "/icons/netbanking.svg",
//     },
//     {
//       id: "card" as PaymentMethod,
//       title: "Card",
//       subtitle: "Visa / MasterCard",
//       icon: "/icons/addcard.svg",
//     },
//   ];

//   const quickAmounts = [100, 200, 500, 2000];

//   const iconStyle: CSSProperties = {
//     width: 40,
//     height: 40,
//     opacity: 1,
//     objectFit: "contain",
//     display: "block",
//   };

//   return (
//     <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
//       <div
//         aria-hidden
//         className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
//       >
//         <img
//           src="/icons/mpbg.png"
//           alt="background"
//           className="absolute inset-0 w-full h-screen object-contain object-top select-none"
//         />
//       </div>

//       <div className="relative z-20 w-full bg-transparent px-4">
//         <Header />
//       </div>

//       <main className="relative z-10 px-4 pt-[95px] pb-20">
//         <section
//           className="mx-auto overflow-hidden"
//           style={{
//             width: "min(1024px, 100%)",
//             minHeight: 1269,
//             borderRadius: 30,
//             background: "#21212180",
//             backdropFilter: "blur(20px)",
//             WebkitBackdropFilter: "blur(20px)",
//             fontFamily: fontBase,
//           }}
//         >
//           <div className="p-8 sm:p-[50px]">
//             <button
//               type="button"
//               onClick={() => navigate("/wallet")}
//               className="inline-flex items-center gap-2"
//               style={{
//                 fontFamily: fontBase,
//                 fontWeight: 700,
//                 fontSize: 13,
//                 lineHeight: "100%",
//                 color: "#C084FC",
//               }}
//             >
//               ← Back to Wallet
//             </button>

//             <div className="mt-4">
//               <h1
//                 style={{
//                   fontFamily: fontBase,
//                   fontWeight: 700,
//                   fontStyle: "normal",
//                   fontSize: 36,
//                   lineHeight: "100%",
//                   letterSpacing: 0,
//                   color: "#FFFFFF",
//                 }}
//               >
//                 Add Funds
//               </h1>

//               <p
//                 className="mt-4 max-w-[590px]"
//                 style={{
//                   fontFamily: fontBase,
//                   fontWeight: 400,
//                   fontStyle: "normal",
//                   fontSize: 16,
//                   lineHeight: "24px",
//                   letterSpacing: 0,
//                   color: "#A1A1AA",
//                 }}
//               >
//                 Add money to your wallet using UPI, Net Banking or Card.
//                 <br />
//                 Funds appear instantly after payment confirmation.
//               </p>
//             </div>

//             <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_294px] gap-5 items-start">
//               <div className="space-y-5 min-w-0">
//                 <div
//                   className="relative overflow-hidden border border-white/10"
//                   style={{
//                     minHeight: 284,
//                     borderRadius: 28,
//                     background: "rgba(23,23,26,0.56)",
//                   }}
//                 >
//                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />

//                   <div className="relative z-10 p-8">
//                     <p
//                       style={{
//                         fontFamily: fontBase,
//                         fontWeight: 600,
//                         fontStyle: "normal",
//                         fontSize: 12,
//                         lineHeight: "12px",
//                         letterSpacing: "1.2px",
//                         color: "#C084FC",
//                         textTransform: "uppercase",
//                       }}
//                     >
//                       Current Balance
//                     </p>

//                     <h2
//                       className="mt-5 text-white"
//                       style={{
//                         fontFamily: fontBase,
//                         fontWeight: 900,
//                         fontStyle: "normal",
//                         fontSize: 60,
//                         lineHeight: "60px",
//                         letterSpacing: 0,
//                       }}
//                     >
//                       ₹ {currentBalance.toLocaleString("en-IN")}
//                     </h2>

//                     <div className="mt-12 h-px w-full bg-white/10" />

//                     <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
//                       <div>
//                         <p
//                           style={{
//                             fontFamily: fontBase,
//                             fontWeight: 400,
//                             fontStyle: "normal",
//                             fontSize: 14,
//                             lineHeight: "100%",
//                             color: "rgba(255,255,255,0.35)",
//                           }}
//                         >
//                           Total Earning
//                         </p>

//                         <p
//                           className="mt-3"
//                           style={{
//                             fontFamily: fontBase,
//                             fontWeight: 700,
//                             fontStyle: "normal",
//                             fontSize: 24,
//                             lineHeight: "100%",
//                             letterSpacing: 0,
//                             color: "#FFFFFF",
//                           }}
//                         >
//                           ₹{totalEarning.toLocaleString("en-IN")}
//                         </p>
//                       </div>

//                       <div>
//                         <p
//                           style={{
//                             fontFamily: fontBase,
//                             fontWeight: 400,
//                             fontStyle: "normal",
//                             fontSize: 14,
//                             lineHeight: "100%",
//                             color: "rgba(255,255,255,0.35)",
//                           }}
//                         >
//                           Monthly Earnings
//                         </p>

//                         <p
//                           className="mt-3"
//                           style={{
//                             fontFamily: fontBase,
//                             fontWeight: 700,
//                             fontStyle: "normal",
//                             fontSize: 24,
//                             lineHeight: "100%",
//                             letterSpacing: 0,
//                             color: "#ADC6FF",
//                           }}
//                         >
//                           ₹{monthlyEarning.toLocaleString("en-IN")}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div
//                   className="relative self-start overflow-hidden border border-white/10"
//                   style={{
//                     height: "fit-content",
//                     borderRadius: 28,
//                     background: "rgba(23,23,26,0.56)",
//                   }}
//                 >
//                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_55%,rgba(255,20,239,0.28),transparent_50%)]" />

//                   <div className="relative z-10 p-8">
//                     <p
//                       style={{
//                         fontFamily: fontBase,
//                         fontWeight: 700,
//                         fontSize: 13,
//                         lineHeight: "100%",
//                         color: "#A1A1AA",
//                       }}
//                     >
//                       Select Payment Method
//                     </p>

//                     <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-7">
//                       {paymentMethods.map((method) => {
//                         const active = selectedMethod === method.id;

//                         return (
//                           <button
//                             key={method.id}
//                             type="button"
//                             onClick={() => setSelectedMethod(method.id)}
//                             className="flex h-[125px] flex-col items-center justify-center rounded-[10px] border text-center"
//                             style={{
//                               background: active
//                                 ? "rgba(23,23,26,0.72)"
//                                 : "rgba(255,255,255,0.06)",
//                               borderColor: active
//                                 ? "#FF14EF"
//                                 : "rgba(255,255,255,0.08)",
//                               boxShadow: active
//                                 ? "inset -1px 0 0 #1A73E8"
//                                 : "none",
//                             }}
//                           >
//                             <img
//                               src={method.icon}
//                               alt=""
//                               style={iconStyle}
//                               onError={(e) => {
//                                 e.currentTarget.style.display = "none";
//                               }}
//                             />

//                             <p
//                               className="mt-5"
//                               style={{
//                                 fontFamily: fontBase,
//                                 fontWeight: 700,
//                                 fontSize: 14,
//                                 lineHeight: "100%",
//                                 color: "#FFFFFF",
//                               }}
//                             >
//                               {method.title}
//                             </p>

//                             <p
//                               className="mt-3"
//                               style={{
//                                 fontFamily: fontBase,
//                                 fontWeight: 400,
//                                 fontSize: 10,
//                                 lineHeight: "100%",
//                                 color: "rgba(255,255,255,0.35)",
//                               }}
//                             >
//                               {method.subtitle}
//                             </p>
//                           </button>
//                         );
//                       })}
//                     </div>

//                     <div className="mt-9">
//                       <label
//                         style={{
//                           fontFamily: fontBase,
//                           fontWeight: 700,
//                           fontSize: 13,
//                           lineHeight: "100%",
//                           color: "#A1A1AA",
//                         }}
//                       >
//                         Enter amount
//                       </label>

//                       <div
//                         className="mt-5 flex items-center px-8"
//                         style={{
//                           width: "min(546px, 100%)",
//                           height: 60,
//                           borderRadius: 16,
//                           background: "#18181B80",
//                           border: "1px solid #FFFFFF1A",
//                           opacity: 1,
//                         }}
//                       >
//                         <div className="flex min-w-0 flex-1 items-center gap-4">
//                           <span
//                             style={{
//                               fontFamily: fontBase,
//                               fontWeight: 900,
//                               fontSize: 34,
//                               lineHeight: "100%",
//                               color: "#C084FC",
//                             }}
//                           >
//                             ₹
//                           </span>

//                           <input
//                             value={amount}
//                             onChange={(e) =>
//                               setAmount(e.target.value.replace(/[^\d]/g, ""))
//                             }
//                             placeholder="0.00"
//                             inputMode="numeric"
//                             className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/10"
//                             style={{
//                               fontFamily: fontBase,
//                               fontWeight: 900,
//                               fontSize: 34,
//                               lineHeight: "100%",
//                               color: "#FFFFFF",
//                             }}
//                           />
//                         </div>
//                       </div>

//                       <div className="mt-5 flex items-center gap-2">
//                         <Info className="h-4 w-4 text-[#71717A]" />

//                         <span
//                           style={{
//                             fontFamily: fontBase,
//                             fontWeight: 400,
//                             fontStyle: "normal",
//                             fontSize: 12,
//                             lineHeight: "100%",
//                             letterSpacing: 0,
//                             color: "#71717A",
//                           }}
//                         >
//                           Minimum add: ₹100. Maximum: ₹1,00,000 per transaction.
//                         </span>
//                       </div>

//                       <div className="mt-5 flex flex-nowrap gap-4 overflow-x-auto pb-1">
//                         {quickAmounts.map((value) => (
//                           <button
//                             key={value}
//                             type="button"
//                             onClick={() => setAmount(String(value))}
//                             className="h-[40px] shrink-0 rounded-[8px] border border-white/10 px-7"
//                             style={{
//                               background: "#18181B80",
//                               ...quickAmountTextStyle,
//                             }}
//                           >
//                             ₹{value}
//                           </button>
//                         ))}
//                       </div>
//                     </div>

//                     {selectedMethod === "upi" && (
//                       <div className="mt-7">
//                         <label
//                           style={{
//                             fontFamily: fontBase,
//                             fontWeight: 700,
//                             fontSize: 13,
//                             lineHeight: "100%",
//                             color: "#A1A1AA",
//                           }}
//                         >
//                           UPI ID
//                         </label>

//                         <input
//                           value={upiId}
//                           onChange={(e) => setUpiId(e.target.value)}
//                           placeholder="yourname@upi"
//                           className="mt-5 w-full px-8 outline-none placeholder:text-white/35"
//                           style={{
//                             width: "min(546px, 100%)",
//                             height: 50,
//                             borderRadius: 16,
//                             background: "#30302E",
//                             border: "1px solid #FFFFFF1A",
//                             opacity: 1,
//                             fontFamily: fontBase,
//                             fontWeight: 400,
//                             fontSize: 20,
//                             lineHeight: "100%",
//                             color: "#FFFFFF",
//                           }}
//                         />

//                         <div
//                           className="mt-6 text-center"
//                           style={{
//                             fontFamily: fontBase,
//                             fontWeight: 400,
//                             fontSize: 12,
//                             lineHeight: "100%",
//                             color: "#FFFFFF",
//                           }}
//                         >
//                           - Or Scan QR -
//                         </div>

//                         <div className="mt-5 flex justify-center">
//                           <div
//                             className="grid h-[120px] w-[120px] place-items-center bg-white p-3"
//                             aria-label="QR code"
//                           >
//                             <div
//                               className="h-full w-full"
//                               style={{
//                                 background:
//                                   "repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 16px 16px",
//                                 imageRendering: "pixelated",
//                               }}
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {selectedMethod === "netbanking" && (
//                       <div
//                         className="mt-7 rounded-[14px] border border-white/10 p-5"
//                         style={{ background: "rgba(255,255,255,0.05)" }}
//                       >
//                         <p
//                           style={{
//                             fontFamily: fontBase,
//                             fontWeight: 700,
//                             fontSize: 14,
//                             lineHeight: "100%",
//                             color: "#FFFFFF",
//                           }}
//                         >
//                           Net Banking
//                         </p>

//                         <p
//                           className="mt-3"
//                           style={{
//                             fontFamily: fontBase,
//                             fontWeight: 400,
//                             fontSize: 12,
//                             lineHeight: "18px",
//                             color: "#71717A",
//                           }}
//                         >
//                           You will be redirected to your bank after confirming
//                           the payment.
//                         </p>
//                       </div>
//                     )}

//                     {selectedMethod === "card" && (
//                       <div
//                         className="mt-7 rounded-[14px] border border-white/10 p-5"
//                         style={{ background: "rgba(255,255,255,0.05)" }}
//                       >
//                         <p
//                           style={{
//                             fontFamily: fontBase,
//                             fontWeight: 700,
//                             fontSize: 14,
//                             lineHeight: "100%",
//                             color: "#FFFFFF",
//                           }}
//                         >
//                           Card Payment
//                         </p>

//                         <p
//                           className="mt-3"
//                           style={{
//                             fontFamily: fontBase,
//                             fontWeight: 400,
//                             fontSize: 12,
//                             lineHeight: "18px",
//                             color: "#71717A",
//                           }}
//                         >
//                           Visa and MasterCard payments are supported.
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <aside
//                 className="relative min-w-0 self-start overflow-hidden border border-white/10"
//                 style={{
//                   width: "100%",
//                   minHeight: 471,
//                   height: "fit-content",
//                   alignSelf: "start",
//                   borderRadius: 28,
//                   background: "rgba(23,23,26,0.56)",
//                 }}
//               >
//                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_90%,rgba(255,20,239,0.17),transparent_55%)]" />

//                 <div className="relative z-10 p-8">
//                   <h3
//                     style={{
//                       fontFamily: fontBase,
//                       fontWeight: 700,
//                       fontStyle: "normal",
//                       fontSize: 18,
//                       lineHeight: "100%",
//                       letterSpacing: 0,
//                       color: "#FFFFFF",
//                     }}
//                   >
//                     Transaction Summary
//                   </h3>

//                   <div className="mt-8 space-y-7">
//                     <div className="flex items-center justify-between gap-4">
//                       <span style={summaryLabelStyle}>Subtotal</span>
//                       <span style={summaryValueStyle}>
//                         ₹{addAmount.toFixed(2)}
//                       </span>
//                     </div>

//                     <div className="flex items-center justify-between gap-4">
//                       <span style={summaryLabelStyle}>Service Fee (2%)</span>
//                       <span style={summaryValueStyle}>
//                         ₹{serviceFee.toFixed(2)}
//                       </span>
//                     </div>

//                     <div className="h-px w-full bg-white/10" />

//                     <div className="flex items-center justify-between gap-3 min-w-0">
//                       <span
//                         style={{
//                           fontFamily: fontBase,
//                           fontWeight: 700,
//                           fontSize: 20,
//                           lineHeight: "100%",
//                           color: "#FFFFFF",
//                           whiteSpace: "nowrap",
//                           flexShrink: 0,
//                         }}
//                       >
//                         Debit Amount
//                       </span>

//                       <span
//                         style={{
//                           fontFamily: fontBase,
//                           fontWeight: 900,
//                           fontSize: 16,
//                           lineHeight: "100%",
//                           color: "#C084FC",
//                           whiteSpace: "nowrap",
//                           flexShrink: 1,
//                           minWidth: 0,
//                           maxWidth: 110,
//                           overflow: "hidden",
//                           textOverflow: "ellipsis",
//                           textAlign: "right",
//                         }}
//                       >
//                         ₹{Math.max(debitAmount, 0).toFixed(2)}
//                       </span>
//                     </div>
//                   </div>

//                   <div
//                     className="mt-8 flex gap-3 rounded-[14px] p-4"
//                     style={{ background: "rgba(3,4,5,0.35)" }}
//                   >
//                     <img
//                       src="/icons/locky.svg"
//                       alt=""
//                       className="mt-1 h-5 w-5 shrink-0"
//                       onError={(e) => {
//                         e.currentTarget.style.display = "none";
//                       }}
//                     />

//                     <p
//                       style={{
//                         fontFamily: fontBase,
//                         fontWeight: 400,
//                         fontStyle: "normal",
//                         fontSize: 12,
//                         lineHeight: "100%",
//                         letterSpacing: 0,
//                         color: "#71717A",
//                       }}
//                     >
//                       Your withdrawal is secured with end-to-end encryption.
//                       Funds are usually available in your account within 1-3
//                       business days depending on your bank.
//                     </p>
//                   </div>

//                   <button
//                     type="button"
//                     disabled={!addAmount}
//                     className="mt-8 h-[49px] w-full rounded-[8px] text-white disabled:opacity-50"
//                     style={{
//                       ...confirmButtonTextStyle,
//                       background:
//                         "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)",
//                     }}
//                   >
//                     Confirm & Add Funds
//                   </button>
//                 </div>
//               </aside>
//             </div>
//           </div>
//         </section>
//       </main>

//       <div className="relative z-10 mt-20">
//         <Footer />
//       </div>
//     </div>
//   );
// };

// export default AddFunds;


// src/pages/AddFunds.tsx
// Only the balance section is changed — rest is identical to your original.
// Changes: fetch real wallet balance from GET /api/wallet/balance

import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type PaymentMethod = "upi" | "netbanking" | "card";

const AddFunds = () => {
  const navigate = useNavigate();
  const { token } = useAuth() as any;

  const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";
  const fontBase = "Inter, system-ui, Arial, sans-serif";

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");

  // ── Real wallet data ──
  const [availableBalance, setAvailableBalance] = useState(0);
  const [totalEarning, setTotalEarning] = useState(0);
  const [monthlyEarning, setMonthlyEarning] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchWallet = async () => {
      try {
        setWalletLoading(true);
        const res = await fetch(`${API_BASE}/api/wallet/balance`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setAvailableBalance(data.availableBalance ?? 0);
          setTotalEarning(data.totalRevenue ?? 0);
          setMonthlyEarning(data.monthlyEarning ?? 0);
        }
      } catch (err) {
        console.error("AddFunds wallet fetch error:", err);
      } finally {
        setWalletLoading(false);
      }
    };
    fetchWallet();
  }, [token, API_BASE]);

  const addAmount = Number(amount || 0);
  const serviceFee = addAmount > 0 ? addAmount * 0.02 : 0;
  const debitAmount = addAmount > 0 ? addAmount + serviceFee : 0;

  const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);

  const confirmButtonTextStyle: CSSProperties = { fontFamily: fontBase, fontWeight: 700, fontSize: 16, lineHeight: "100%", textAlign: "center" };
  const summaryLabelStyle: CSSProperties = { fontFamily: fontBase, fontWeight: 400, fontSize: 14, lineHeight: "100%", color: "#71717A", whiteSpace: "nowrap" };
  const summaryValueStyle: CSSProperties = { fontFamily: fontBase, fontWeight: 500, fontSize: 14, lineHeight: "100%", color: "#FFFFFF", whiteSpace: "nowrap" };
  const quickAmountTextStyle: CSSProperties = { fontFamily: fontBase, fontWeight: 500, fontSize: 18, lineHeight: "100%", textAlign: "center", color: "#FFFFFF" };
  const iconStyle: CSSProperties = { width: 40, height: 40, opacity: 1, objectFit: "contain", display: "block" };

  const paymentMethods = [
    { id: "upi" as PaymentMethod, title: "UPI", subtitle: "Instant", icon: "/icons/upi.svg" },
    { id: "netbanking" as PaymentMethod, title: "Net Banking", subtitle: "2-3 mins", icon: "/icons/netbanking.svg" },
    { id: "card" as PaymentMethod, title: "Card", subtitle: "Visa / MasterCard", icon: "/icons/addcard.svg" },
  ];

  const quickAmounts = [100, 200, 500, 2000];

  return (
    <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <img src="/icons/mpbg.png" alt="background" className="absolute inset-0 w-full h-screen object-contain object-top select-none" />
      </div>

      <div className="relative z-20 w-full bg-transparent px-4">
        <Header />
      </div>

      <main className="relative z-10 px-4 pt-[95px] pb-20">
        <section className="mx-auto overflow-hidden" style={{ width: "min(1024px, 100%)", minHeight: 1269, borderRadius: 30, background: "#21212180", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", fontFamily: fontBase }}>
          <div className="p-8 sm:p-[50px]">
            <button type="button" onClick={() => navigate("/wallet")} className="inline-flex items-center gap-2" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, lineHeight: "100%", color: "#C084FC" }}>
              ← Back to Wallet
            </button>

            <div className="mt-4">
              <h1 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 36, lineHeight: "100%", color: "#FFFFFF" }}>Add Funds</h1>
              <p className="mt-4 max-w-[590px]" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 16, lineHeight: "24px", color: "#A1A1AA" }}>
                Add money to your wallet using UPI, Net Banking or Card.<br />Funds appear instantly after payment confirmation.
              </p>
            </div>

            <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_294px] gap-5 items-start">
              <div className="space-y-5 min-w-0">
                {/* Balance card */}
                <div className="relative overflow-hidden border border-white/10" style={{ minHeight: 284, borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />
                  <div className="relative z-10 p-8">
                    <p style={{ fontFamily: fontBase, fontWeight: 600, fontSize: 12, lineHeight: "12px", letterSpacing: "1.2px", color: "#C084FC", textTransform: "uppercase" }}>
                      Current Balance
                    </p>
                    <h2 className="mt-5 text-white" style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 60, lineHeight: "60px" }}>
                      {walletLoading ? "Loading..." : `₹ ${fmt(availableBalance)}`}
                    </h2>
                    <div className="mt-12 h-px w-full bg-white/10" />
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, lineHeight: "100%", color: "rgba(255,255,255,0.35)" }}>Total Earning</p>
                        <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, lineHeight: "100%", color: "#FFFFFF" }}>
                          {walletLoading ? "—" : `₹${fmt(totalEarning)}`}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, lineHeight: "100%", color: "rgba(255,255,255,0.35)" }}>Monthly Earnings</p>
                        <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, lineHeight: "100%", color: "#ADC6FF" }}>
                          {walletLoading ? "—" : `₹${fmt(monthlyEarning)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment method + amount box */}
                <div className="relative self-start overflow-hidden border border-white/10" style={{ height: "fit-content", borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_55%,rgba(255,20,239,0.28),transparent_50%)]" />
                  <div className="relative z-10 p-8">
                    <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, lineHeight: "100%", color: "#A1A1AA" }}>Select Payment Method</p>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-7">
                      {paymentMethods.map((method) => {
                        const active = selectedMethod === method.id;
                        return (
                          <button key={method.id} type="button" onClick={() => setSelectedMethod(method.id)}
                            className="flex h-[125px] flex-col items-center justify-center rounded-[10px] border text-center"
                            style={{ background: active ? "rgba(23,23,26,0.72)" : "rgba(255,255,255,0.06)", borderColor: active ? "#FF14EF" : "rgba(255,255,255,0.08)", boxShadow: active ? "inset -1px 0 0 #1A73E8" : "none" }}
                          >
                            <img src={method.icon} alt="" style={iconStyle} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                            <p className="mt-5" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, lineHeight: "100%", color: "#FFFFFF" }}>{method.title}</p>
                            <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 10, lineHeight: "100%", color: "rgba(255,255,255,0.35)" }}>{method.subtitle}</p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-9">
                      <label style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, lineHeight: "100%", color: "#A1A1AA" }}>Enter amount</label>
                      <div className="mt-5 flex items-center px-8" style={{ width: "min(546px, 100%)", height: 60, borderRadius: 16, background: "#18181B80", border: "1px solid #FFFFFF1A" }}>
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <span style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 34, lineHeight: "100%", color: "#C084FC" }}>₹</span>
                          <input
                            value={amount}
                            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                            placeholder="0.00"
                            inputMode="numeric"
                            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/10"
                            style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 34, lineHeight: "100%", color: "#FFFFFF" }}
                          />
                        </div>
                      </div>
                      <div className="mt-5 flex items-center gap-2">
                        <Info className="h-4 w-4 text-[#71717A]" />
                        <span style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, lineHeight: "100%", color: "#71717A" }}>
                          Minimum add: ₹100. Maximum: ₹1,00,000 per transaction.
                        </span>
                      </div>
                      <div className="mt-5 flex flex-nowrap gap-4 overflow-x-auto pb-1">
                        {quickAmounts.map((value) => (
                          <button key={value} type="button" onClick={() => setAmount(String(value))}
                            className="h-[40px] shrink-0 rounded-[8px] border border-white/10 px-7"
                            style={{ background: "#18181B80", ...quickAmountTextStyle }}
                          >
                            ₹{value}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedMethod === "upi" && (
                      <div className="mt-7">
                        <label style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, lineHeight: "100%", color: "#A1A1AA" }}>UPI ID</label>
                        <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi"
                          className="mt-5 w-full px-8 outline-none placeholder:text-white/35"
                          style={{ width: "min(546px, 100%)", height: 50, borderRadius: 16, background: "#30302E", border: "1px solid #FFFFFF1A", fontFamily: fontBase, fontWeight: 400, fontSize: 20, color: "#FFFFFF" }}
                        />
                        <div className="mt-6 text-center" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "#FFFFFF" }}>- Or Scan QR -</div>
                        <div className="mt-5 flex justify-center">
                          <div className="grid h-[120px] w-[120px] place-items-center bg-white p-3" aria-label="QR code">
                            <div className="h-full w-full" style={{ background: "repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 16px 16px", imageRendering: "pixelated" }} />
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedMethod === "netbanking" && (
                      <div className="mt-7 rounded-[14px] border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>Net Banking</p>
                        <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, lineHeight: "18px", color: "#71717A" }}>You will be redirected to your bank after confirming the payment.</p>
                      </div>
                    )}
                    {selectedMethod === "card" && (
                      <div className="mt-7 rounded-[14px] border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>Card Payment</p>
                        <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, lineHeight: "18px", color: "#71717A" }}>Visa and MasterCard payments are supported.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary sidebar */}
              <aside className="relative min-w-0 self-start overflow-hidden border border-white/10" style={{ width: "100%", minHeight: 471, height: "fit-content", borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_90%,rgba(255,20,239,0.17),transparent_55%)]" />
                <div className="relative z-10 p-8">
                  <h3 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 18, lineHeight: "100%", color: "#FFFFFF" }}>Transaction Summary</h3>
                  <div className="mt-8 space-y-7">
                    <div className="flex items-center justify-between gap-4">
                      <span style={summaryLabelStyle}>Subtotal</span>
                      <span style={summaryValueStyle}>₹{addAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span style={summaryLabelStyle}>Service Fee (2%)</span>
                      <span style={summaryValueStyle}>₹{serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="h-px w-full bg-white/10" />
                    <div className="flex items-center justify-between gap-3 min-w-0">
                      <span style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 20, lineHeight: "100%", color: "#FFFFFF", whiteSpace: "nowrap", flexShrink: 0 }}>Debit Amount</span>
                      <span style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 16, lineHeight: "100%", color: "#C084FC", whiteSpace: "nowrap", textAlign: "right" }}>
                        ₹{Math.max(debitAmount, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-8 flex gap-3 rounded-[14px] p-4" style={{ background: "rgba(3,4,5,0.35)" }}>
                    <img src="/icons/locky.svg" alt="" className="mt-1 h-5 w-5 shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, lineHeight: "100%", color: "#71717A" }}>
                      Your payment is secured with end-to-end encryption. Funds appear instantly after confirmation.
                    </p>
                  </div>
                  <button type="button" disabled={!addAmount} className="mt-8 h-[49px] w-full rounded-[8px] text-white disabled:opacity-50"
                    style={{ ...confirmButtonTextStyle, background: "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)" }}>
                    Confirm & Add Funds
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <div className="relative z-10 mt-20">
        <Footer />
      </div>
    </div>
  );
};

export default AddFunds;