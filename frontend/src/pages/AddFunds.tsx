// // // // // // // // import { useState, type CSSProperties } from "react";
// // // // // // // // import { useNavigate } from "react-router-dom";
// // // // // // // // import Header from "@/components/Header";
// // // // // // // // import Footer from "@/components/Footer";
// // // // // // // // import { Info } from "lucide-react";

// // // // // // // // type PaymentMethod = "upi" | "netbanking" | "card";

// // // // // // // // const AddFunds = () => {
// // // // // // // //   const navigate = useNavigate();

// // // // // // // //   const fontBase = "Inter, system-ui, Arial, sans-serif";

// // // // // // // //   const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
// // // // // // // //   const [amount, setAmount] = useState("");
// // // // // // // //   const [upiId, setUpiId] = useState("");

// // // // // // // //   const currentBalance = 42850;
// // // // // // // //   const totalEarning = 198200;
// // // // // // // //   const monthlyEarning = 24650;

// // // // // // // //   const addAmount = Number(amount || 0);
// // // // // // // //   const serviceFee = addAmount > 0 ? addAmount * 0.02 : 0;
// // // // // // // //   const debitAmount = addAmount > 0 ? addAmount + serviceFee : 0;

// // // // // // // //   const confirmButtonTextStyle: CSSProperties = {
// // // // // // // //     fontFamily: fontBase,
// // // // // // // //     fontWeight: 700,
// // // // // // // //     fontStyle: "normal",
// // // // // // // //     fontSize: 16,
// // // // // // // //     lineHeight: "100%",
// // // // // // // //     letterSpacing: "0%",
// // // // // // // //     textAlign: "center",
// // // // // // // //   };

// // // // // // // //   const summaryLabelStyle: CSSProperties = {
// // // // // // // //     fontFamily: fontBase,
// // // // // // // //     fontWeight: 400,
// // // // // // // //     fontStyle: "normal",
// // // // // // // //     fontSize: 14,
// // // // // // // //     lineHeight: "100%",
// // // // // // // //     letterSpacing: 0,
// // // // // // // //     color: "#71717A",
// // // // // // // //     whiteSpace: "nowrap",
// // // // // // // //   };

// // // // // // // //   const summaryValueStyle: CSSProperties = {
// // // // // // // //     fontFamily: fontBase,
// // // // // // // //     fontWeight: 500,
// // // // // // // //     fontStyle: "normal",
// // // // // // // //     fontSize: 14,
// // // // // // // //     lineHeight: "100%",
// // // // // // // //     letterSpacing: 0,
// // // // // // // //     color: "#FFFFFF",
// // // // // // // //     whiteSpace: "nowrap",
// // // // // // // //   };

// // // // // // // //   const quickAmountTextStyle: CSSProperties = {
// // // // // // // //     fontFamily: fontBase,
// // // // // // // //     fontWeight: 500,
// // // // // // // //     fontStyle: "normal",
// // // // // // // //     fontSize: 18,
// // // // // // // //     lineHeight: "100%",
// // // // // // // //     letterSpacing: 0,
// // // // // // // //     textAlign: "center",
// // // // // // // //     color: "#FFFFFF",
// // // // // // // //   };

// // // // // // // //   const paymentMethods = [
// // // // // // // //     {
// // // // // // // //       id: "upi" as PaymentMethod,
// // // // // // // //       title: "UPI",
// // // // // // // //       subtitle: "Instant",
// // // // // // // //       icon: "/icons/upi.svg",
// // // // // // // //     },
// // // // // // // //     {
// // // // // // // //       id: "netbanking" as PaymentMethod,
// // // // // // // //       title: "Net Banking",
// // // // // // // //       subtitle: "2-3 mins",
// // // // // // // //       icon: "/icons/netbanking.svg",
// // // // // // // //     },
// // // // // // // //     {
// // // // // // // //       id: "card" as PaymentMethod,
// // // // // // // //       title: "Card",
// // // // // // // //       subtitle: "Visa / MasterCard",
// // // // // // // //       icon: "/icons/addcard.svg",
// // // // // // // //     },
// // // // // // // //   ];

// // // // // // // //   const quickAmounts = [100, 200, 500, 2000];

// // // // // // // //   const iconStyle: CSSProperties = {
// // // // // // // //     width: 40,
// // // // // // // //     height: 40,
// // // // // // // //     opacity: 1,
// // // // // // // //     objectFit: "contain",
// // // // // // // //     display: "block",
// // // // // // // //   };

// // // // // // // //   return (
// // // // // // // //     <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
// // // // // // // //       <div
// // // // // // // //         aria-hidden
// // // // // // // //         className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
// // // // // // // //       >
// // // // // // // //         <img
// // // // // // // //           src="/icons/mpbg.png"
// // // // // // // //           alt="background"
// // // // // // // //           className="absolute inset-0 w-full h-screen object-contain object-top select-none"
// // // // // // // //         />
// // // // // // // //       </div>

// // // // // // // //       <div className="relative z-20 w-full bg-transparent px-4">
// // // // // // // //         <Header />
// // // // // // // //       </div>

// // // // // // // //       <main className="relative z-10 px-4 pt-[95px] pb-20">
// // // // // // // //         <section
// // // // // // // //           className="mx-auto overflow-hidden"
// // // // // // // //           style={{
// // // // // // // //             width: "min(1024px, 100%)",
// // // // // // // //             minHeight: 1269,
// // // // // // // //             borderRadius: 30,
// // // // // // // //             background: "#21212180",
// // // // // // // //             backdropFilter: "blur(20px)",
// // // // // // // //             WebkitBackdropFilter: "blur(20px)",
// // // // // // // //             fontFamily: fontBase,
// // // // // // // //           }}
// // // // // // // //         >
// // // // // // // //           <div className="p-8 sm:p-[50px]">
// // // // // // // //             <button
// // // // // // // //               type="button"
// // // // // // // //               onClick={() => navigate("/wallet")}
// // // // // // // //               className="inline-flex items-center gap-2"
// // // // // // // //               style={{
// // // // // // // //                 fontFamily: fontBase,
// // // // // // // //                 fontWeight: 700,
// // // // // // // //                 fontSize: 13,
// // // // // // // //                 lineHeight: "100%",
// // // // // // // //                 color: "#C084FC",
// // // // // // // //               }}
// // // // // // // //             >
// // // // // // // //               ← Back to Wallet
// // // // // // // //             </button>

// // // // // // // //             <div className="mt-4">
// // // // // // // //               <h1
// // // // // // // //                 style={{
// // // // // // // //                   fontFamily: fontBase,
// // // // // // // //                   fontWeight: 700,
// // // // // // // //                   fontStyle: "normal",
// // // // // // // //                   fontSize: 36,
// // // // // // // //                   lineHeight: "100%",
// // // // // // // //                   letterSpacing: 0,
// // // // // // // //                   color: "#FFFFFF",
// // // // // // // //                 }}
// // // // // // // //               >
// // // // // // // //                 Add Funds
// // // // // // // //               </h1>

// // // // // // // //               <p
// // // // // // // //                 className="mt-4 max-w-[590px]"
// // // // // // // //                 style={{
// // // // // // // //                   fontFamily: fontBase,
// // // // // // // //                   fontWeight: 400,
// // // // // // // //                   fontStyle: "normal",
// // // // // // // //                   fontSize: 16,
// // // // // // // //                   lineHeight: "24px",
// // // // // // // //                   letterSpacing: 0,
// // // // // // // //                   color: "#A1A1AA",
// // // // // // // //                 }}
// // // // // // // //               >
// // // // // // // //                 Add money to your wallet using UPI, Net Banking or Card.
// // // // // // // //                 <br />
// // // // // // // //                 Funds appear instantly after payment confirmation.
// // // // // // // //               </p>
// // // // // // // //             </div>

// // // // // // // //             <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_294px] gap-5 items-start">
// // // // // // // //               <div className="space-y-5 min-w-0">
// // // // // // // //                 <div
// // // // // // // //                   className="relative overflow-hidden border border-white/10"
// // // // // // // //                   style={{
// // // // // // // //                     minHeight: 284,
// // // // // // // //                     borderRadius: 28,
// // // // // // // //                     background: "rgba(23,23,26,0.56)",
// // // // // // // //                   }}
// // // // // // // //                 >
// // // // // // // //                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />

// // // // // // // //                   <div className="relative z-10 p-8">
// // // // // // // //                     <p
// // // // // // // //                       style={{
// // // // // // // //                         fontFamily: fontBase,
// // // // // // // //                         fontWeight: 600,
// // // // // // // //                         fontStyle: "normal",
// // // // // // // //                         fontSize: 12,
// // // // // // // //                         lineHeight: "12px",
// // // // // // // //                         letterSpacing: "1.2px",
// // // // // // // //                         color: "#C084FC",
// // // // // // // //                         textTransform: "uppercase",
// // // // // // // //                       }}
// // // // // // // //                     >
// // // // // // // //                       Current Balance
// // // // // // // //                     </p>

// // // // // // // //                     <h2
// // // // // // // //                       className="mt-5 text-white"
// // // // // // // //                       style={{
// // // // // // // //                         fontFamily: fontBase,
// // // // // // // //                         fontWeight: 900,
// // // // // // // //                         fontStyle: "normal",
// // // // // // // //                         fontSize: 60,
// // // // // // // //                         lineHeight: "60px",
// // // // // // // //                         letterSpacing: 0,
// // // // // // // //                       }}
// // // // // // // //                     >
// // // // // // // //                       ₹ {currentBalance.toLocaleString("en-IN")}
// // // // // // // //                     </h2>

// // // // // // // //                     <div className="mt-12 h-px w-full bg-white/10" />

// // // // // // // //                     <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
// // // // // // // //                       <div>
// // // // // // // //                         <p
// // // // // // // //                           style={{
// // // // // // // //                             fontFamily: fontBase,
// // // // // // // //                             fontWeight: 400,
// // // // // // // //                             fontStyle: "normal",
// // // // // // // //                             fontSize: 14,
// // // // // // // //                             lineHeight: "100%",
// // // // // // // //                             color: "rgba(255,255,255,0.35)",
// // // // // // // //                           }}
// // // // // // // //                         >
// // // // // // // //                           Total Earning
// // // // // // // //                         </p>

// // // // // // // //                         <p
// // // // // // // //                           className="mt-3"
// // // // // // // //                           style={{
// // // // // // // //                             fontFamily: fontBase,
// // // // // // // //                             fontWeight: 700,
// // // // // // // //                             fontStyle: "normal",
// // // // // // // //                             fontSize: 24,
// // // // // // // //                             lineHeight: "100%",
// // // // // // // //                             letterSpacing: 0,
// // // // // // // //                             color: "#FFFFFF",
// // // // // // // //                           }}
// // // // // // // //                         >
// // // // // // // //                           ₹{totalEarning.toLocaleString("en-IN")}
// // // // // // // //                         </p>
// // // // // // // //                       </div>

// // // // // // // //                       <div>
// // // // // // // //                         <p
// // // // // // // //                           style={{
// // // // // // // //                             fontFamily: fontBase,
// // // // // // // //                             fontWeight: 400,
// // // // // // // //                             fontStyle: "normal",
// // // // // // // //                             fontSize: 14,
// // // // // // // //                             lineHeight: "100%",
// // // // // // // //                             color: "rgba(255,255,255,0.35)",
// // // // // // // //                           }}
// // // // // // // //                         >
// // // // // // // //                           Monthly Earnings
// // // // // // // //                         </p>

// // // // // // // //                         <p
// // // // // // // //                           className="mt-3"
// // // // // // // //                           style={{
// // // // // // // //                             fontFamily: fontBase,
// // // // // // // //                             fontWeight: 700,
// // // // // // // //                             fontStyle: "normal",
// // // // // // // //                             fontSize: 24,
// // // // // // // //                             lineHeight: "100%",
// // // // // // // //                             letterSpacing: 0,
// // // // // // // //                             color: "#ADC6FF",
// // // // // // // //                           }}
// // // // // // // //                         >
// // // // // // // //                           ₹{monthlyEarning.toLocaleString("en-IN")}
// // // // // // // //                         </p>
// // // // // // // //                       </div>
// // // // // // // //                     </div>
// // // // // // // //                   </div>
// // // // // // // //                 </div>

// // // // // // // //                 <div
// // // // // // // //                   className="relative self-start overflow-hidden border border-white/10"
// // // // // // // //                   style={{
// // // // // // // //                     height: "fit-content",
// // // // // // // //                     borderRadius: 28,
// // // // // // // //                     background: "rgba(23,23,26,0.56)",
// // // // // // // //                   }}
// // // // // // // //                 >
// // // // // // // //                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_55%,rgba(255,20,239,0.28),transparent_50%)]" />

// // // // // // // //                   <div className="relative z-10 p-8">
// // // // // // // //                     <p
// // // // // // // //                       style={{
// // // // // // // //                         fontFamily: fontBase,
// // // // // // // //                         fontWeight: 700,
// // // // // // // //                         fontSize: 13,
// // // // // // // //                         lineHeight: "100%",
// // // // // // // //                         color: "#A1A1AA",
// // // // // // // //                       }}
// // // // // // // //                     >
// // // // // // // //                       Select Payment Method
// // // // // // // //                     </p>

// // // // // // // //                     <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-7">
// // // // // // // //                       {paymentMethods.map((method) => {
// // // // // // // //                         const active = selectedMethod === method.id;

// // // // // // // //                         return (
// // // // // // // //                           <button
// // // // // // // //                             key={method.id}
// // // // // // // //                             type="button"
// // // // // // // //                             onClick={() => setSelectedMethod(method.id)}
// // // // // // // //                             className="flex h-[125px] flex-col items-center justify-center rounded-[10px] border text-center"
// // // // // // // //                             style={{
// // // // // // // //                               background: active
// // // // // // // //                                 ? "rgba(23,23,26,0.72)"
// // // // // // // //                                 : "rgba(255,255,255,0.06)",
// // // // // // // //                               borderColor: active
// // // // // // // //                                 ? "#FF14EF"
// // // // // // // //                                 : "rgba(255,255,255,0.08)",
// // // // // // // //                               boxShadow: active
// // // // // // // //                                 ? "inset -1px 0 0 #1A73E8"
// // // // // // // //                                 : "none",
// // // // // // // //                             }}
// // // // // // // //                           >
// // // // // // // //                             <img
// // // // // // // //                               src={method.icon}
// // // // // // // //                               alt=""
// // // // // // // //                               style={iconStyle}
// // // // // // // //                               onError={(e) => {
// // // // // // // //                                 e.currentTarget.style.display = "none";
// // // // // // // //                               }}
// // // // // // // //                             />

// // // // // // // //                             <p
// // // // // // // //                               className="mt-5"
// // // // // // // //                               style={{
// // // // // // // //                                 fontFamily: fontBase,
// // // // // // // //                                 fontWeight: 700,
// // // // // // // //                                 fontSize: 14,
// // // // // // // //                                 lineHeight: "100%",
// // // // // // // //                                 color: "#FFFFFF",
// // // // // // // //                               }}
// // // // // // // //                             >
// // // // // // // //                               {method.title}
// // // // // // // //                             </p>

// // // // // // // //                             <p
// // // // // // // //                               className="mt-3"
// // // // // // // //                               style={{
// // // // // // // //                                 fontFamily: fontBase,
// // // // // // // //                                 fontWeight: 400,
// // // // // // // //                                 fontSize: 10,
// // // // // // // //                                 lineHeight: "100%",
// // // // // // // //                                 color: "rgba(255,255,255,0.35)",
// // // // // // // //                               }}
// // // // // // // //                             >
// // // // // // // //                               {method.subtitle}
// // // // // // // //                             </p>
// // // // // // // //                           </button>
// // // // // // // //                         );
// // // // // // // //                       })}
// // // // // // // //                     </div>

// // // // // // // //                     <div className="mt-9">
// // // // // // // //                       <label
// // // // // // // //                         style={{
// // // // // // // //                           fontFamily: fontBase,
// // // // // // // //                           fontWeight: 700,
// // // // // // // //                           fontSize: 13,
// // // // // // // //                           lineHeight: "100%",
// // // // // // // //                           color: "#A1A1AA",
// // // // // // // //                         }}
// // // // // // // //                       >
// // // // // // // //                         Enter amount
// // // // // // // //                       </label>

// // // // // // // //                       <div
// // // // // // // //                         className="mt-5 flex items-center px-8"
// // // // // // // //                         style={{
// // // // // // // //                           width: "min(546px, 100%)",
// // // // // // // //                           height: 60,
// // // // // // // //                           borderRadius: 16,
// // // // // // // //                           background: "#18181B80",
// // // // // // // //                           border: "1px solid #FFFFFF1A",
// // // // // // // //                           opacity: 1,
// // // // // // // //                         }}
// // // // // // // //                       >
// // // // // // // //                         <div className="flex min-w-0 flex-1 items-center gap-4">
// // // // // // // //                           <span
// // // // // // // //                             style={{
// // // // // // // //                               fontFamily: fontBase,
// // // // // // // //                               fontWeight: 900,
// // // // // // // //                               fontSize: 34,
// // // // // // // //                               lineHeight: "100%",
// // // // // // // //                               color: "#C084FC",
// // // // // // // //                             }}
// // // // // // // //                           >
// // // // // // // //                             ₹
// // // // // // // //                           </span>

// // // // // // // //                           <input
// // // // // // // //                             value={amount}
// // // // // // // //                             onChange={(e) =>
// // // // // // // //                               setAmount(e.target.value.replace(/[^\d]/g, ""))
// // // // // // // //                             }
// // // // // // // //                             placeholder="0.00"
// // // // // // // //                             inputMode="numeric"
// // // // // // // //                             className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/10"
// // // // // // // //                             style={{
// // // // // // // //                               fontFamily: fontBase,
// // // // // // // //                               fontWeight: 900,
// // // // // // // //                               fontSize: 34,
// // // // // // // //                               lineHeight: "100%",
// // // // // // // //                               color: "#FFFFFF",
// // // // // // // //                             }}
// // // // // // // //                           />
// // // // // // // //                         </div>
// // // // // // // //                       </div>

// // // // // // // //                       <div className="mt-5 flex items-center gap-2">
// // // // // // // //                         <Info className="h-4 w-4 text-[#71717A]" />

// // // // // // // //                         <span
// // // // // // // //                           style={{
// // // // // // // //                             fontFamily: fontBase,
// // // // // // // //                             fontWeight: 400,
// // // // // // // //                             fontStyle: "normal",
// // // // // // // //                             fontSize: 12,
// // // // // // // //                             lineHeight: "100%",
// // // // // // // //                             letterSpacing: 0,
// // // // // // // //                             color: "#71717A",
// // // // // // // //                           }}
// // // // // // // //                         >
// // // // // // // //                           Minimum add: ₹100. Maximum: ₹1,00,000 per transaction.
// // // // // // // //                         </span>
// // // // // // // //                       </div>

// // // // // // // //                       <div className="mt-5 flex flex-nowrap gap-4 overflow-x-auto pb-1">
// // // // // // // //                         {quickAmounts.map((value) => (
// // // // // // // //                           <button
// // // // // // // //                             key={value}
// // // // // // // //                             type="button"
// // // // // // // //                             onClick={() => setAmount(String(value))}
// // // // // // // //                             className="h-[40px] shrink-0 rounded-[8px] border border-white/10 px-7"
// // // // // // // //                             style={{
// // // // // // // //                               background: "#18181B80",
// // // // // // // //                               ...quickAmountTextStyle,
// // // // // // // //                             }}
// // // // // // // //                           >
// // // // // // // //                             ₹{value}
// // // // // // // //                           </button>
// // // // // // // //                         ))}
// // // // // // // //                       </div>
// // // // // // // //                     </div>

// // // // // // // //                     {selectedMethod === "upi" && (
// // // // // // // //                       <div className="mt-7">
// // // // // // // //                         <label
// // // // // // // //                           style={{
// // // // // // // //                             fontFamily: fontBase,
// // // // // // // //                             fontWeight: 700,
// // // // // // // //                             fontSize: 13,
// // // // // // // //                             lineHeight: "100%",
// // // // // // // //                             color: "#A1A1AA",
// // // // // // // //                           }}
// // // // // // // //                         >
// // // // // // // //                           UPI ID
// // // // // // // //                         </label>

// // // // // // // //                         <input
// // // // // // // //                           value={upiId}
// // // // // // // //                           onChange={(e) => setUpiId(e.target.value)}
// // // // // // // //                           placeholder="yourname@upi"
// // // // // // // //                           className="mt-5 w-full px-8 outline-none placeholder:text-white/35"
// // // // // // // //                           style={{
// // // // // // // //                             width: "min(546px, 100%)",
// // // // // // // //                             height: 50,
// // // // // // // //                             borderRadius: 16,
// // // // // // // //                             background: "#30302E",
// // // // // // // //                             border: "1px solid #FFFFFF1A",
// // // // // // // //                             opacity: 1,
// // // // // // // //                             fontFamily: fontBase,
// // // // // // // //                             fontWeight: 400,
// // // // // // // //                             fontSize: 20,
// // // // // // // //                             lineHeight: "100%",
// // // // // // // //                             color: "#FFFFFF",
// // // // // // // //                           }}
// // // // // // // //                         />

// // // // // // // //                         <div
// // // // // // // //                           className="mt-6 text-center"
// // // // // // // //                           style={{
// // // // // // // //                             fontFamily: fontBase,
// // // // // // // //                             fontWeight: 400,
// // // // // // // //                             fontSize: 12,
// // // // // // // //                             lineHeight: "100%",
// // // // // // // //                             color: "#FFFFFF",
// // // // // // // //                           }}
// // // // // // // //                         >
// // // // // // // //                           - Or Scan QR -
// // // // // // // //                         </div>

// // // // // // // //                         <div className="mt-5 flex justify-center">
// // // // // // // //                           <div
// // // // // // // //                             className="grid h-[120px] w-[120px] place-items-center bg-white p-3"
// // // // // // // //                             aria-label="QR code"
// // // // // // // //                           >
// // // // // // // //                             <div
// // // // // // // //                               className="h-full w-full"
// // // // // // // //                               style={{
// // // // // // // //                                 background:
// // // // // // // //                                   "repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 16px 16px",
// // // // // // // //                                 imageRendering: "pixelated",
// // // // // // // //                               }}
// // // // // // // //                             />
// // // // // // // //                           </div>
// // // // // // // //                         </div>
// // // // // // // //                       </div>
// // // // // // // //                     )}

// // // // // // // //                     {selectedMethod === "netbanking" && (
// // // // // // // //                       <div
// // // // // // // //                         className="mt-7 rounded-[14px] border border-white/10 p-5"
// // // // // // // //                         style={{ background: "rgba(255,255,255,0.05)" }}
// // // // // // // //                       >
// // // // // // // //                         <p
// // // // // // // //                           style={{
// // // // // // // //                             fontFamily: fontBase,
// // // // // // // //                             fontWeight: 700,
// // // // // // // //                             fontSize: 14,
// // // // // // // //                             lineHeight: "100%",
// // // // // // // //                             color: "#FFFFFF",
// // // // // // // //                           }}
// // // // // // // //                         >
// // // // // // // //                           Net Banking
// // // // // // // //                         </p>

// // // // // // // //                         <p
// // // // // // // //                           className="mt-3"
// // // // // // // //                           style={{
// // // // // // // //                             fontFamily: fontBase,
// // // // // // // //                             fontWeight: 400,
// // // // // // // //                             fontSize: 12,
// // // // // // // //                             lineHeight: "18px",
// // // // // // // //                             color: "#71717A",
// // // // // // // //                           }}
// // // // // // // //                         >
// // // // // // // //                           You will be redirected to your bank after confirming
// // // // // // // //                           the payment.
// // // // // // // //                         </p>
// // // // // // // //                       </div>
// // // // // // // //                     )}

// // // // // // // //                     {selectedMethod === "card" && (
// // // // // // // //                       <div
// // // // // // // //                         className="mt-7 rounded-[14px] border border-white/10 p-5"
// // // // // // // //                         style={{ background: "rgba(255,255,255,0.05)" }}
// // // // // // // //                       >
// // // // // // // //                         <p
// // // // // // // //                           style={{
// // // // // // // //                             fontFamily: fontBase,
// // // // // // // //                             fontWeight: 700,
// // // // // // // //                             fontSize: 14,
// // // // // // // //                             lineHeight: "100%",
// // // // // // // //                             color: "#FFFFFF",
// // // // // // // //                           }}
// // // // // // // //                         >
// // // // // // // //                           Card Payment
// // // // // // // //                         </p>

// // // // // // // //                         <p
// // // // // // // //                           className="mt-3"
// // // // // // // //                           style={{
// // // // // // // //                             fontFamily: fontBase,
// // // // // // // //                             fontWeight: 400,
// // // // // // // //                             fontSize: 12,
// // // // // // // //                             lineHeight: "18px",
// // // // // // // //                             color: "#71717A",
// // // // // // // //                           }}
// // // // // // // //                         >
// // // // // // // //                           Visa and MasterCard payments are supported.
// // // // // // // //                         </p>
// // // // // // // //                       </div>
// // // // // // // //                     )}
// // // // // // // //                   </div>
// // // // // // // //                 </div>
// // // // // // // //               </div>

// // // // // // // //               <aside
// // // // // // // //                 className="relative min-w-0 self-start overflow-hidden border border-white/10"
// // // // // // // //                 style={{
// // // // // // // //                   width: "100%",
// // // // // // // //                   minHeight: 471,
// // // // // // // //                   height: "fit-content",
// // // // // // // //                   alignSelf: "start",
// // // // // // // //                   borderRadius: 28,
// // // // // // // //                   background: "rgba(23,23,26,0.56)",
// // // // // // // //                 }}
// // // // // // // //               >
// // // // // // // //                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_90%,rgba(255,20,239,0.17),transparent_55%)]" />

// // // // // // // //                 <div className="relative z-10 p-8">
// // // // // // // //                   <h3
// // // // // // // //                     style={{
// // // // // // // //                       fontFamily: fontBase,
// // // // // // // //                       fontWeight: 700,
// // // // // // // //                       fontStyle: "normal",
// // // // // // // //                       fontSize: 18,
// // // // // // // //                       lineHeight: "100%",
// // // // // // // //                       letterSpacing: 0,
// // // // // // // //                       color: "#FFFFFF",
// // // // // // // //                     }}
// // // // // // // //                   >
// // // // // // // //                     Transaction Summary
// // // // // // // //                   </h3>

// // // // // // // //                   <div className="mt-8 space-y-7">
// // // // // // // //                     <div className="flex items-center justify-between gap-4">
// // // // // // // //                       <span style={summaryLabelStyle}>Subtotal</span>
// // // // // // // //                       <span style={summaryValueStyle}>
// // // // // // // //                         ₹{addAmount.toFixed(2)}
// // // // // // // //                       </span>
// // // // // // // //                     </div>

// // // // // // // //                     <div className="flex items-center justify-between gap-4">
// // // // // // // //                       <span style={summaryLabelStyle}>Service Fee (2%)</span>
// // // // // // // //                       <span style={summaryValueStyle}>
// // // // // // // //                         ₹{serviceFee.toFixed(2)}
// // // // // // // //                       </span>
// // // // // // // //                     </div>

// // // // // // // //                     <div className="h-px w-full bg-white/10" />

// // // // // // // //                     <div className="flex items-center justify-between gap-3 min-w-0">
// // // // // // // //                       <span
// // // // // // // //                         style={{
// // // // // // // //                           fontFamily: fontBase,
// // // // // // // //                           fontWeight: 700,
// // // // // // // //                           fontSize: 20,
// // // // // // // //                           lineHeight: "100%",
// // // // // // // //                           color: "#FFFFFF",
// // // // // // // //                           whiteSpace: "nowrap",
// // // // // // // //                           flexShrink: 0,
// // // // // // // //                         }}
// // // // // // // //                       >
// // // // // // // //                         Debit Amount
// // // // // // // //                       </span>

// // // // // // // //                       <span
// // // // // // // //                         style={{
// // // // // // // //                           fontFamily: fontBase,
// // // // // // // //                           fontWeight: 900,
// // // // // // // //                           fontSize: 16,
// // // // // // // //                           lineHeight: "100%",
// // // // // // // //                           color: "#C084FC",
// // // // // // // //                           whiteSpace: "nowrap",
// // // // // // // //                           flexShrink: 1,
// // // // // // // //                           minWidth: 0,
// // // // // // // //                           maxWidth: 110,
// // // // // // // //                           overflow: "hidden",
// // // // // // // //                           textOverflow: "ellipsis",
// // // // // // // //                           textAlign: "right",
// // // // // // // //                         }}
// // // // // // // //                       >
// // // // // // // //                         ₹{Math.max(debitAmount, 0).toFixed(2)}
// // // // // // // //                       </span>
// // // // // // // //                     </div>
// // // // // // // //                   </div>

// // // // // // // //                   <div
// // // // // // // //                     className="mt-8 flex gap-3 rounded-[14px] p-4"
// // // // // // // //                     style={{ background: "rgba(3,4,5,0.35)" }}
// // // // // // // //                   >
// // // // // // // //                     <img
// // // // // // // //                       src="/icons/locky.svg"
// // // // // // // //                       alt=""
// // // // // // // //                       className="mt-1 h-5 w-5 shrink-0"
// // // // // // // //                       onError={(e) => {
// // // // // // // //                         e.currentTarget.style.display = "none";
// // // // // // // //                       }}
// // // // // // // //                     />

// // // // // // // //                     <p
// // // // // // // //                       style={{
// // // // // // // //                         fontFamily: fontBase,
// // // // // // // //                         fontWeight: 400,
// // // // // // // //                         fontStyle: "normal",
// // // // // // // //                         fontSize: 12,
// // // // // // // //                         lineHeight: "100%",
// // // // // // // //                         letterSpacing: 0,
// // // // // // // //                         color: "#71717A",
// // // // // // // //                       }}
// // // // // // // //                     >
// // // // // // // //                       Your withdrawal is secured with end-to-end encryption.
// // // // // // // //                       Funds are usually available in your account within 1-3
// // // // // // // //                       business days depending on your bank.
// // // // // // // //                     </p>
// // // // // // // //                   </div>

// // // // // // // //                   <button
// // // // // // // //                     type="button"
// // // // // // // //                     disabled={!addAmount}
// // // // // // // //                     className="mt-8 h-[49px] w-full rounded-[8px] text-white disabled:opacity-50"
// // // // // // // //                     style={{
// // // // // // // //                       ...confirmButtonTextStyle,
// // // // // // // //                       background:
// // // // // // // //                         "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)",
// // // // // // // //                     }}
// // // // // // // //                   >
// // // // // // // //                     Confirm & Add Funds
// // // // // // // //                   </button>
// // // // // // // //                 </div>
// // // // // // // //               </aside>
// // // // // // // //             </div>
// // // // // // // //           </div>
// // // // // // // //         </section>
// // // // // // // //       </main>

// // // // // // // //       <div className="relative z-10 mt-20">
// // // // // // // //         <Footer />
// // // // // // // //       </div>
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // export default AddFunds;


// // // // // // // // src/pages/AddFunds.tsx
// // // // // // // // Only the balance section is changed — rest is identical to your original.
// // // // // // // // Changes: fetch real wallet balance from GET /api/wallet/balance

// // // // // // // import { useEffect, useState, type CSSProperties } from "react";
// // // // // // // import { useNavigate } from "react-router-dom";
// // // // // // // import Header from "@/components/Header";
// // // // // // // import Footer from "@/components/Footer";
// // // // // // // import { Info } from "lucide-react";
// // // // // // // import { useAuth } from "@/contexts/AuthContext";

// // // // // // // type PaymentMethod = "upi" | "netbanking" | "card";

// // // // // // // const AddFunds = () => {
// // // // // // //   const navigate = useNavigate();
// // // // // // //   const { token } = useAuth() as any;

// // // // // // //   const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";
// // // // // // //   const fontBase = "Inter, system-ui, Arial, sans-serif";

// // // // // // //   const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
// // // // // // //   const [amount, setAmount] = useState("");
// // // // // // //   const [upiId, setUpiId] = useState("");

// // // // // // //   // ── Real wallet data ──
// // // // // // //   const [availableBalance, setAvailableBalance] = useState(0);
// // // // // // //   const [totalEarning, setTotalEarning] = useState(0);
// // // // // // //   const [monthlyEarning, setMonthlyEarning] = useState(0);
// // // // // // //   const [walletLoading, setWalletLoading] = useState(false);

// // // // // // //   useEffect(() => {
// // // // // // //     if (!token) return;
// // // // // // //     const fetchWallet = async () => {
// // // // // // //       try {
// // // // // // //         setWalletLoading(true);
// // // // // // //         const res = await fetch(`${API_BASE}/api/wallet/balance`, {
// // // // // // //           headers: { Authorization: `Bearer ${token}` },
// // // // // // //           credentials: "include",
// // // // // // //         });
// // // // // // //         const data = await res.json();
// // // // // // //         if (res.ok && data.success) {
// // // // // // //           setAvailableBalance(data.availableBalance ?? 0);
// // // // // // //           setTotalEarning(data.totalRevenue ?? 0);
// // // // // // //           setMonthlyEarning(data.monthlyEarning ?? 0);
// // // // // // //         }
// // // // // // //       } catch (err) {
// // // // // // //         console.error("AddFunds wallet fetch error:", err);
// // // // // // //       } finally {
// // // // // // //         setWalletLoading(false);
// // // // // // //       }
// // // // // // //     };
// // // // // // //     fetchWallet();
// // // // // // //   }, [token, API_BASE]);

// // // // // // //   const addAmount = Number(amount || 0);
// // // // // // //   const serviceFee = addAmount > 0 ? addAmount * 0.02 : 0;
// // // // // // //   const debitAmount = addAmount > 0 ? addAmount + serviceFee : 0;

// // // // // // //   const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);

// // // // // // //   const confirmButtonTextStyle: CSSProperties = { fontFamily: fontBase, fontWeight: 700, fontSize: 16, lineHeight: "100%", textAlign: "center" };
// // // // // // //   const summaryLabelStyle: CSSProperties = { fontFamily: fontBase, fontWeight: 400, fontSize: 14, lineHeight: "100%", color: "#71717A", whiteSpace: "nowrap" };
// // // // // // //   const summaryValueStyle: CSSProperties = { fontFamily: fontBase, fontWeight: 500, fontSize: 14, lineHeight: "100%", color: "#FFFFFF", whiteSpace: "nowrap" };
// // // // // // //   const quickAmountTextStyle: CSSProperties = { fontFamily: fontBase, fontWeight: 500, fontSize: 18, lineHeight: "100%", textAlign: "center", color: "#FFFFFF" };
// // // // // // //   const iconStyle: CSSProperties = { width: 40, height: 40, opacity: 1, objectFit: "contain", display: "block" };

// // // // // // //   const paymentMethods = [
// // // // // // //     { id: "upi" as PaymentMethod, title: "UPI", subtitle: "Instant", icon: "/icons/upi.svg" },
// // // // // // //     { id: "netbanking" as PaymentMethod, title: "Net Banking", subtitle: "2-3 mins", icon: "/icons/netbanking.svg" },
// // // // // // //     { id: "card" as PaymentMethod, title: "Card", subtitle: "Visa / MasterCard", icon: "/icons/addcard.svg" },
// // // // // // //   ];

// // // // // // //   const quickAmounts = [100, 200, 500, 2000];

// // // // // // //   return (
// // // // // // //     <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
// // // // // // //       <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
// // // // // // //         <img src="/icons/mpbg.png" alt="background" className="absolute inset-0 w-full h-screen object-contain object-top select-none" />
// // // // // // //       </div>

// // // // // // //       <div className="relative z-20 w-full bg-transparent px-4">
// // // // // // //         <Header />
// // // // // // //       </div>

// // // // // // //       <main className="relative z-10 px-4 pt-[95px] pb-20">
// // // // // // //         <section className="mx-auto overflow-hidden" style={{ width: "min(1024px, 100%)", minHeight: 1269, borderRadius: 30, background: "#21212180", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", fontFamily: fontBase }}>
// // // // // // //           <div className="p-8 sm:p-[50px]">
// // // // // // //             <button type="button" onClick={() => navigate("/wallet")} className="inline-flex items-center gap-2" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, lineHeight: "100%", color: "#C084FC" }}>
// // // // // // //               ← Back to Wallet
// // // // // // //             </button>

// // // // // // //             <div className="mt-4">
// // // // // // //               <h1 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 36, lineHeight: "100%", color: "#FFFFFF" }}>Add Funds</h1>
// // // // // // //               <p className="mt-4 max-w-[590px]" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 16, lineHeight: "24px", color: "#A1A1AA" }}>
// // // // // // //                 Add money to your wallet using UPI, Net Banking or Card.<br />Funds appear instantly after payment confirmation.
// // // // // // //               </p>
// // // // // // //             </div>

// // // // // // //             <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_294px] gap-5 items-start">
// // // // // // //               <div className="space-y-5 min-w-0">
// // // // // // //                 {/* Balance card */}
// // // // // // //                 <div className="relative overflow-hidden border border-white/10" style={{ minHeight: 284, borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// // // // // // //                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />
// // // // // // //                   <div className="relative z-10 p-8">
// // // // // // //                     <p style={{ fontFamily: fontBase, fontWeight: 600, fontSize: 12, lineHeight: "12px", letterSpacing: "1.2px", color: "#C084FC", textTransform: "uppercase" }}>
// // // // // // //                       Current Balance
// // // // // // //                     </p>
// // // // // // //                     <h2 className="mt-5 text-white" style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 60, lineHeight: "60px" }}>
// // // // // // //                       {walletLoading ? "Loading..." : `₹ ${fmt(availableBalance)}`}
// // // // // // //                     </h2>
// // // // // // //                     <div className="mt-12 h-px w-full bg-white/10" />
// // // // // // //                     <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
// // // // // // //                       <div>
// // // // // // //                         <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, lineHeight: "100%", color: "rgba(255,255,255,0.35)" }}>Total Earning</p>
// // // // // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, lineHeight: "100%", color: "#FFFFFF" }}>
// // // // // // //                           {walletLoading ? "—" : `₹${fmt(totalEarning)}`}
// // // // // // //                         </p>
// // // // // // //                       </div>
// // // // // // //                       <div>
// // // // // // //                         <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, lineHeight: "100%", color: "rgba(255,255,255,0.35)" }}>Monthly Earnings</p>
// // // // // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, lineHeight: "100%", color: "#ADC6FF" }}>
// // // // // // //                           {walletLoading ? "—" : `₹${fmt(monthlyEarning)}`}
// // // // // // //                         </p>
// // // // // // //                       </div>
// // // // // // //                     </div>
// // // // // // //                   </div>
// // // // // // //                 </div>

// // // // // // //                 {/* Payment method + amount box */}
// // // // // // //                 <div className="relative self-start overflow-hidden border border-white/10" style={{ height: "fit-content", borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// // // // // // //                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_55%,rgba(255,20,239,0.28),transparent_50%)]" />
// // // // // // //                   <div className="relative z-10 p-8">
// // // // // // //                     <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, lineHeight: "100%", color: "#A1A1AA" }}>Select Payment Method</p>
// // // // // // //                     <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-7">
// // // // // // //                       {paymentMethods.map((method) => {
// // // // // // //                         const active = selectedMethod === method.id;
// // // // // // //                         return (
// // // // // // //                           <button key={method.id} type="button" onClick={() => setSelectedMethod(method.id)}
// // // // // // //                             className="flex h-[125px] flex-col items-center justify-center rounded-[10px] border text-center"
// // // // // // //                             style={{ background: active ? "rgba(23,23,26,0.72)" : "rgba(255,255,255,0.06)", borderColor: active ? "#FF14EF" : "rgba(255,255,255,0.08)", boxShadow: active ? "inset -1px 0 0 #1A73E8" : "none" }}
// // // // // // //                           >
// // // // // // //                             <img src={method.icon} alt="" style={iconStyle} onError={(e) => { e.currentTarget.style.display = "none"; }} />
// // // // // // //                             <p className="mt-5" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, lineHeight: "100%", color: "#FFFFFF" }}>{method.title}</p>
// // // // // // //                             <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 10, lineHeight: "100%", color: "rgba(255,255,255,0.35)" }}>{method.subtitle}</p>
// // // // // // //                           </button>
// // // // // // //                         );
// // // // // // //                       })}
// // // // // // //                     </div>

// // // // // // //                     <div className="mt-9">
// // // // // // //                       <label style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, lineHeight: "100%", color: "#A1A1AA" }}>Enter amount</label>
// // // // // // //                       <div className="mt-5 flex items-center px-8" style={{ width: "min(546px, 100%)", height: 60, borderRadius: 16, background: "#18181B80", border: "1px solid #FFFFFF1A" }}>
// // // // // // //                         <div className="flex min-w-0 flex-1 items-center gap-4">
// // // // // // //                           <span style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 34, lineHeight: "100%", color: "#C084FC" }}>₹</span>
// // // // // // //                           <input
// // // // // // //                             value={amount}
// // // // // // //                             onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
// // // // // // //                             placeholder="0.00"
// // // // // // //                             inputMode="numeric"
// // // // // // //                             className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/10"
// // // // // // //                             style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 34, lineHeight: "100%", color: "#FFFFFF" }}
// // // // // // //                           />
// // // // // // //                         </div>
// // // // // // //                       </div>
// // // // // // //                       <div className="mt-5 flex items-center gap-2">
// // // // // // //                         <Info className="h-4 w-4 text-[#71717A]" />
// // // // // // //                         <span style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, lineHeight: "100%", color: "#71717A" }}>
// // // // // // //                           Minimum add: ₹100. Maximum: ₹1,00,000 per transaction.
// // // // // // //                         </span>
// // // // // // //                       </div>
// // // // // // //                       <div className="mt-5 flex flex-nowrap gap-4 overflow-x-auto pb-1">
// // // // // // //                         {quickAmounts.map((value) => (
// // // // // // //                           <button key={value} type="button" onClick={() => setAmount(String(value))}
// // // // // // //                             className="h-[40px] shrink-0 rounded-[8px] border border-white/10 px-7"
// // // // // // //                             style={{ background: "#18181B80", ...quickAmountTextStyle }}
// // // // // // //                           >
// // // // // // //                             ₹{value}
// // // // // // //                           </button>
// // // // // // //                         ))}
// // // // // // //                       </div>
// // // // // // //                     </div>

// // // // // // //                     {selectedMethod === "upi" && (
// // // // // // //                       <div className="mt-7">
// // // // // // //                         <label style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, lineHeight: "100%", color: "#A1A1AA" }}>UPI ID</label>
// // // // // // //                         <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi"
// // // // // // //                           className="mt-5 w-full px-8 outline-none placeholder:text-white/35"
// // // // // // //                           style={{ width: "min(546px, 100%)", height: 50, borderRadius: 16, background: "#30302E", border: "1px solid #FFFFFF1A", fontFamily: fontBase, fontWeight: 400, fontSize: 20, color: "#FFFFFF" }}
// // // // // // //                         />
// // // // // // //                         <div className="mt-6 text-center" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "#FFFFFF" }}>- Or Scan QR -</div>
// // // // // // //                         <div className="mt-5 flex justify-center">
// // // // // // //                           <div className="grid h-[120px] w-[120px] place-items-center bg-white p-3" aria-label="QR code">
// // // // // // //                             <div className="h-full w-full" style={{ background: "repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 16px 16px", imageRendering: "pixelated" }} />
// // // // // // //                           </div>
// // // // // // //                         </div>
// // // // // // //                       </div>
// // // // // // //                     )}
// // // // // // //                     {selectedMethod === "netbanking" && (
// // // // // // //                       <div className="mt-7 rounded-[14px] border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.05)" }}>
// // // // // // //                         <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>Net Banking</p>
// // // // // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, lineHeight: "18px", color: "#71717A" }}>You will be redirected to your bank after confirming the payment.</p>
// // // // // // //                       </div>
// // // // // // //                     )}
// // // // // // //                     {selectedMethod === "card" && (
// // // // // // //                       <div className="mt-7 rounded-[14px] border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.05)" }}>
// // // // // // //                         <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>Card Payment</p>
// // // // // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, lineHeight: "18px", color: "#71717A" }}>Visa and MasterCard payments are supported.</p>
// // // // // // //                       </div>
// // // // // // //                     )}
// // // // // // //                   </div>
// // // // // // //                 </div>
// // // // // // //               </div>

// // // // // // //               {/* Summary sidebar */}
// // // // // // //               <aside className="relative min-w-0 self-start overflow-hidden border border-white/10" style={{ width: "100%", minHeight: 471, height: "fit-content", borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// // // // // // //                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_90%,rgba(255,20,239,0.17),transparent_55%)]" />
// // // // // // //                 <div className="relative z-10 p-8">
// // // // // // //                   <h3 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 18, lineHeight: "100%", color: "#FFFFFF" }}>Transaction Summary</h3>
// // // // // // //                   <div className="mt-8 space-y-7">
// // // // // // //                     <div className="flex items-center justify-between gap-4">
// // // // // // //                       <span style={summaryLabelStyle}>Subtotal</span>
// // // // // // //                       <span style={summaryValueStyle}>₹{addAmount.toFixed(2)}</span>
// // // // // // //                     </div>
// // // // // // //                     <div className="flex items-center justify-between gap-4">
// // // // // // //                       <span style={summaryLabelStyle}>Service Fee (2%)</span>
// // // // // // //                       <span style={summaryValueStyle}>₹{serviceFee.toFixed(2)}</span>
// // // // // // //                     </div>
// // // // // // //                     <div className="h-px w-full bg-white/10" />
// // // // // // //                     <div className="flex items-center justify-between gap-3 min-w-0">
// // // // // // //                       <span style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 20, lineHeight: "100%", color: "#FFFFFF", whiteSpace: "nowrap", flexShrink: 0 }}>Debit Amount</span>
// // // // // // //                       <span style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 16, lineHeight: "100%", color: "#C084FC", whiteSpace: "nowrap", textAlign: "right" }}>
// // // // // // //                         ₹{Math.max(debitAmount, 0).toFixed(2)}
// // // // // // //                       </span>
// // // // // // //                     </div>
// // // // // // //                   </div>
// // // // // // //                   <div className="mt-8 flex gap-3 rounded-[14px] p-4" style={{ background: "rgba(3,4,5,0.35)" }}>
// // // // // // //                     <img src="/icons/locky.svg" alt="" className="mt-1 h-5 w-5 shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
// // // // // // //                     <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, lineHeight: "100%", color: "#71717A" }}>
// // // // // // //                       Your payment is secured with end-to-end encryption. Funds appear instantly after confirmation.
// // // // // // //                     </p>
// // // // // // //                   </div>
// // // // // // //                   <button type="button" disabled={!addAmount} className="mt-8 h-[49px] w-full rounded-[8px] text-white disabled:opacity-50"
// // // // // // //                     style={{ ...confirmButtonTextStyle, background: "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)" }}>
// // // // // // //                     Confirm & Add Funds
// // // // // // //                   </button>
// // // // // // //                 </div>
// // // // // // //               </aside>
// // // // // // //             </div>
// // // // // // //           </div>
// // // // // // //         </section>
// // // // // // //       </main>

// // // // // // //       <div className="relative z-10 mt-20">
// // // // // // //         <Footer />
// // // // // // //       </div>
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default AddFunds;


// // // // // // // import { useEffect, useState, type CSSProperties } from "react";
// // // // // // // import { useNavigate } from "react-router-dom";
// // // // // // // import Header from "@/components/Header";
// // // // // // // import Footer from "@/components/Footer";
// // // // // // // import { Info } from "lucide-react";
// // // // // // // import { useAuth } from "@/contexts/AuthContext";

// // // // // // // declare global {
// // // // // // //   interface Window {
// // // // // // //     Razorpay: any;
// // // // // // //   }
// // // // // // // }

// // // // // // // type PaymentMethod = "upi" | "netbanking" | "card";

// // // // // // // const AddFunds = () => {
// // // // // // //   const navigate = useNavigate();
// // // // // // //   const { token, user } = useAuth() as any;

// // // // // // //   const API_BASE =
// // // // // // //     (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";

// // // // // // //   const fontBase = "Inter, system-ui, Arial, sans-serif";

// // // // // // //   const CREATE_ORDER_URL = `${API_BASE}/api/wallet/add-fund/create-order`;
// // // // // // //   const VERIFY_PAYMENT_URL = `${API_BASE}/api/wallet/add-fund/verify`;
// // // // // // //   const WALLET_BALANCE_URL = `${API_BASE}/api/wallet/balance`;

// // // // // // //   const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
// // // // // // //   const [amount, setAmount] = useState("");
// // // // // // //   const [upiId, setUpiId] = useState("");

// // // // // // //   const [availableBalance, setAvailableBalance] = useState(0);
// // // // // // //   const [totalEarning, setTotalEarning] = useState(0);
// // // // // // //   const [monthlyEarning, setMonthlyEarning] = useState(0);
// // // // // // //   const [walletLoading, setWalletLoading] = useState(false);

// // // // // // //   const [payLoading, setPayLoading] = useState(false);
// // // // // // //   const [paymentError, setPaymentError] = useState("");
// // // // // // //   const [paymentSuccess, setPaymentSuccess] = useState("");

// // // // // // //   const getAuthToken = () =>
// // // // // // //     token ||
// // // // // // //     localStorage.getItem("auth_token") ||
// // // // // // //     sessionStorage.getItem("auth_token") ||
// // // // // // //     localStorage.getItem("token") ||
// // // // // // //     sessionStorage.getItem("token") ||
// // // // // // //     "";

// // // // // // //   const fetchWallet = async () => {
// // // // // // //     const authToken = getAuthToken();
// // // // // // //     if (!authToken) return;

// // // // // // //     try {
// // // // // // //       setWalletLoading(true);

// // // // // // //       const res = await fetch(WALLET_BALANCE_URL, {
// // // // // // //         headers: {
// // // // // // //           Authorization: `Bearer ${authToken}`,
// // // // // // //         },
// // // // // // //         credentials: "include",
// // // // // // //       });

// // // // // // //       const data = await res.json().catch(() => ({}));

// // // // // // //       if (res.ok && data.success) {
// // // // // // //         setAvailableBalance(Number(data.availableBalance || 0));
// // // // // // //         setTotalEarning(Number(data.totalRevenue || 0));
// // // // // // //         setMonthlyEarning(Number(data.monthlyEarning || 0));
// // // // // // //       }
// // // // // // //     } catch (err) {
// // // // // // //       console.error("AddFunds wallet fetch error:", err);
// // // // // // //     } finally {
// // // // // // //       setWalletLoading(false);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   useEffect(() => {
// // // // // // //     fetchWallet();
// // // // // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // // // // //   }, [token, API_BASE]);

// // // // // // //   const addAmount = Number(amount || 0);
// // // // // // //   const serviceFee = addAmount > 0 ? addAmount * 0.02 : 0;
// // // // // // //   const debitAmount = addAmount > 0 ? addAmount + serviceFee : 0;

// // // // // // //   const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);

// // // // // // //   const confirmButtonTextStyle: CSSProperties = {
// // // // // // //     fontFamily: fontBase,
// // // // // // //     fontWeight: 700,
// // // // // // //     fontSize: 16,
// // // // // // //     lineHeight: "100%",
// // // // // // //     textAlign: "center",
// // // // // // //   };

// // // // // // //   const summaryLabelStyle: CSSProperties = {
// // // // // // //     fontFamily: fontBase,
// // // // // // //     fontWeight: 400,
// // // // // // //     fontSize: 14,
// // // // // // //     lineHeight: "100%",
// // // // // // //     color: "#71717A",
// // // // // // //     whiteSpace: "nowrap",
// // // // // // //   };

// // // // // // //   const summaryValueStyle: CSSProperties = {
// // // // // // //     fontFamily: fontBase,
// // // // // // //     fontWeight: 500,
// // // // // // //     fontSize: 14,
// // // // // // //     lineHeight: "100%",
// // // // // // //     color: "#FFFFFF",
// // // // // // //     whiteSpace: "nowrap",
// // // // // // //   };

// // // // // // //   const quickAmountTextStyle: CSSProperties = {
// // // // // // //     fontFamily: fontBase,
// // // // // // //     fontWeight: 500,
// // // // // // //     fontSize: 18,
// // // // // // //     lineHeight: "100%",
// // // // // // //     textAlign: "center",
// // // // // // //     color: "#FFFFFF",
// // // // // // //   };

// // // // // // //   const iconStyle: CSSProperties = {
// // // // // // //     width: 40,
// // // // // // //     height: 40,
// // // // // // //     opacity: 1,
// // // // // // //     objectFit: "contain",
// // // // // // //     display: "block",
// // // // // // //   };

// // // // // // //   const paymentMethods = [
// // // // // // //     {
// // // // // // //       id: "upi" as PaymentMethod,
// // // // // // //       title: "UPI",
// // // // // // //       subtitle: "Instant",
// // // // // // //       icon: "/icons/upi.svg",
// // // // // // //     },
// // // // // // //     {
// // // // // // //       id: "netbanking" as PaymentMethod,
// // // // // // //       title: "Net Banking",
// // // // // // //       subtitle: "2-3 mins",
// // // // // // //       icon: "/icons/netbanking.svg",
// // // // // // //     },
// // // // // // //     {
// // // // // // //       id: "card" as PaymentMethod,
// // // // // // //       title: "Card",
// // // // // // //       subtitle: "Visa / MasterCard",
// // // // // // //       icon: "/icons/addcard.svg",
// // // // // // //     },
// // // // // // //   ];

// // // // // // //   const quickAmounts = [100, 200, 500, 2000];

// // // // // // //   const validateUpiIfNeeded = async () => {
// // // // // // //     if (selectedMethod !== "upi") return true;

// // // // // // //     const cleanUpi = upiId.trim().toLowerCase();

// // // // // // //     // UPI ID optional hai.
// // // // // // //     // Blank rahe to Razorpay Checkout me user QR/app/UPI option choose karega.
// // // // // // //     if (!cleanUpi) return true;

// // // // // // //     const basicVpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

// // // // // // //     if (!basicVpaRegex.test(cleanUpi)) {
// // // // // // //       setPaymentError("Invalid UPI ID format. Example: yourname@upi");
// // // // // // //       return false;
// // // // // // //     }

// // // // // // //     // Backend /upi/validate call skip kar rahe hain.
// // // // // // //     // Razorpay Checkout actual UPI payment handle karega.
// // // // // // //     return true;
// // // // // // //   };

// // // // // // //   const createAddFundOrder = async () => {
// // // // // // //     const authToken = getAuthToken();

// // // // // // //     const res = await fetch(CREATE_ORDER_URL, {
// // // // // // //       method: "POST",
// // // // // // //       headers: {
// // // // // // //         "Content-Type": "application/json",
// // // // // // //         Authorization: `Bearer ${authToken}`,
// // // // // // //       },
// // // // // // //       credentials: "include",
// // // // // // //       body: JSON.stringify({
// // // // // // //         amount: addAmount,
// // // // // // //         selectedMethod,
// // // // // // //         upiId: upiId.trim().toLowerCase() || undefined,
// // // // // // //         serviceFee,
// // // // // // //         debitAmount,
// // // // // // //       }),
// // // // // // //     });

// // // // // // //     const data = await res.json().catch(() => ({}));

// // // // // // //     if (!res.ok || !data.success) {
// // // // // // //       throw new Error(data.message || "Could not create payment order.");
// // // // // // //     }

// // // // // // //     return data;
// // // // // // //   };

// // // // // // //   const verifyAddFundPayment = async (razorpayResponse: any) => {
// // // // // // //     const authToken = getAuthToken();

// // // // // // //     const res = await fetch(VERIFY_PAYMENT_URL, {
// // // // // // //       method: "POST",
// // // // // // //       headers: {
// // // // // // //         "Content-Type": "application/json",
// // // // // // //         Authorization: `Bearer ${authToken}`,
// // // // // // //       },
// // // // // // //       credentials: "include",
// // // // // // //       body: JSON.stringify(razorpayResponse),
// // // // // // //     });

// // // // // // //     const data = await res.json().catch(() => ({}));

// // // // // // //     if (!res.ok || !data.success) {
// // // // // // //       throw new Error(data.message || "Payment verification failed.");
// // // // // // //     }

// // // // // // //     return data;
// // // // // // //   };

// // // // // // //   const getRazorpayMethodConfig = () => {
// // // // // // //     if (selectedMethod === "upi") {
// // // // // // //       return {
// // // // // // //         upi: true,
// // // // // // //         card: false,
// // // // // // //         netbanking: false,
// // // // // // //         wallet: false,
// // // // // // //       };
// // // // // // //     }

// // // // // // //     if (selectedMethod === "card") {
// // // // // // //       return {
// // // // // // //         upi: false,
// // // // // // //         card: true,
// // // // // // //         netbanking: false,
// // // // // // //         wallet: false,
// // // // // // //       };
// // // // // // //     }

// // // // // // //     return {
// // // // // // //       upi: false,
// // // // // // //       card: false,
// // // // // // //       netbanking: true,
// // // // // // //       wallet: false,
// // // // // // //     };
// // // // // // //   };

// // // // // // //   const handleConfirmAddFunds = async () => {
// // // // // // //     setPaymentError("");
// // // // // // //     setPaymentSuccess("");

// // // // // // //     const authToken = getAuthToken();

// // // // // // //     if (!authToken) {
// // // // // // //       setPaymentError("Please login first.");
// // // // // // //       return;
// // // // // // //     }

// // // // // // //     if (!window.Razorpay) {
// // // // // // //       setPaymentError("Razorpay script not loaded. Add checkout script in index.html.");
// // // // // // //       return;
// // // // // // //     }

// // // // // // //     if (!addAmount || Number.isNaN(addAmount)) {
// // // // // // //       setPaymentError("Please enter amount.");
// // // // // // //       return;
// // // // // // //     }

// // // // // // //     if (addAmount < 100) {
// // // // // // //       setPaymentError("Minimum add amount is ₹100.");
// // // // // // //       return;
// // // // // // //     }

// // // // // // //     if (addAmount > 100000) {
// // // // // // //       setPaymentError("Maximum amount is ₹1,00,000 per transaction.");
// // // // // // //       return;
// // // // // // //     }

// // // // // // //     try {
// // // // // // //       setPayLoading(true);

// // // // // // //       const upiOk = await validateUpiIfNeeded();

// // // // // // //       if (!upiOk) {
// // // // // // //         setPayLoading(false);
// // // // // // //         return;
// // // // // // //       }

// // // // // // //       const orderData = await createAddFundOrder();

// // // // // // // const options = {
// // // // // // //   key: orderData.key,
// // // // // // //   amount: orderData.order.amount,
// // // // // // //   currency: orderData.order.currency || "INR",
// // // // // // //   name: "Tokun",
// // // // // // //   description: "Add funds to wallet",
// // // // // // //   order_id: orderData.order.id,

// // // // // // //   prefill: {
// // // // // // //     name: user?.name || "",
// // // // // // //     email: user?.email || "",
// // // // // // //     contact: user?.phone || user?.mobile || "",
// // // // // // //   },

// // // // // // //   notes: {
// // // // // // //     purpose: "wallet_topup",
// // // // // // //     selectedMethod,
// // // // // // //     walletAmount: String(addAmount),
// // // // // // //     serviceFee: String(serviceFee),
// // // // // // //     debitAmount: String(debitAmount),
// // // // // // //     upiId: upiId.trim().toLowerCase() || "",
// // // // // // //   },

// // // // // // //   theme: {
// // // // // // //     color: "#1A73E8",
// // // // // // //   },

// // // // // // //   handler: async function (response: any) {
// // // // // // //     try {
// // // // // // //       setPayLoading(true);

// // // // // // //       await verifyAddFundPayment(response);

// // // // // // //       setPaymentSuccess("Payment successful. Wallet updated.");
// // // // // // //       await fetchWallet();

// // // // // // //       setTimeout(() => {
// // // // // // //         navigate("/wallet");
// // // // // // //       }, 1200);
// // // // // // //     } catch (err: any) {
// // // // // // //       setPaymentError(err?.message || "Payment verification failed.");
// // // // // // //     } finally {
// // // // // // //       setPayLoading(false);
// // // // // // //     }
// // // // // // //   },

// // // // // // //   modal: {
// // // // // // //     ondismiss: function () {
// // // // // // //       setPayLoading(false);
// // // // // // //     },
// // // // // // //   },
// // // // // // // };
// // // // // // //       const razorpay = new window.Razorpay(options);

// // // // // // //       razorpay.on("payment.failed", function (response: any) {
// // // // // // //         setPaymentError(
// // // // // // //           response?.error?.description ||
// // // // // // //             response?.error?.reason ||
// // // // // // //             "Payment failed."
// // // // // // //         );
// // // // // // //         setPayLoading(false);
// // // // // // //       });

// // // // // // //       razorpay.open();
// // // // // // //     } catch (err: any) {
// // // // // // //       setPaymentError(err?.message || "Could not start payment.");
// // // // // // //       setPayLoading(false);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   return (
// // // // // // //     <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
// // // // // // //       <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
// // // // // // //         <img
// // // // // // //           src="/icons/mpbg.png"
// // // // // // //           alt="background"
// // // // // // //           className="absolute inset-0 w-full h-screen object-contain object-top select-none"
// // // // // // //         />
// // // // // // //       </div>

// // // // // // //       <div className="relative z-20 w-full bg-transparent px-4">
// // // // // // //         <Header />
// // // // // // //       </div>

// // // // // // //       <main className="relative z-10 px-4 pt-[95px] pb-20">
// // // // // // //         <section
// // // // // // //           className="mx-auto overflow-hidden"
// // // // // // //           style={{
// // // // // // //             width: "min(1024px, 100%)",
// // // // // // //             minHeight: 1269,
// // // // // // //             borderRadius: 30,
// // // // // // //             background: "#21212180",
// // // // // // //             backdropFilter: "blur(20px)",
// // // // // // //             WebkitBackdropFilter: "blur(20px)",
// // // // // // //             fontFamily: fontBase,
// // // // // // //           }}
// // // // // // //         >
// // // // // // //           <div className="p-8 sm:p-[50px]">
// // // // // // //             <button
// // // // // // //               type="button"
// // // // // // //               onClick={() => navigate("/wallet")}
// // // // // // //               className="inline-flex items-center gap-2"
// // // // // // //               style={{
// // // // // // //                 fontFamily: fontBase,
// // // // // // //                 fontWeight: 700,
// // // // // // //                 fontSize: 13,
// // // // // // //                 lineHeight: "100%",
// // // // // // //                 color: "#C084FC",
// // // // // // //               }}
// // // // // // //             >
// // // // // // //               ← Back to Wallet
// // // // // // //             </button>

// // // // // // //             <div className="mt-4">
// // // // // // //               <h1
// // // // // // //                 style={{
// // // // // // //                   fontFamily: fontBase,
// // // // // // //                   fontWeight: 700,
// // // // // // //                   fontSize: 36,
// // // // // // //                   lineHeight: "100%",
// // // // // // //                   color: "#FFFFFF",
// // // // // // //                 }}
// // // // // // //               >
// // // // // // //                 Add Funds
// // // // // // //               </h1>

// // // // // // //               <p
// // // // // // //                 className="mt-4 max-w-[590px]"
// // // // // // //                 style={{
// // // // // // //                   fontFamily: fontBase,
// // // // // // //                   fontWeight: 400,
// // // // // // //                   fontSize: 16,
// // // // // // //                   lineHeight: "24px",
// // // // // // //                   color: "#A1A1AA",
// // // // // // //                 }}
// // // // // // //               >
// // // // // // //                 Add money to your wallet using UPI, Net Banking or Card.
// // // // // // //                 <br />
// // // // // // //                 Funds appear instantly after payment confirmation.
// // // // // // //               </p>
// // // // // // //             </div>

// // // // // // //             <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_294px] gap-5 items-start">
// // // // // // //               <div className="space-y-5 min-w-0">
// // // // // // //                 <div
// // // // // // //                   className="relative overflow-hidden border border-white/10"
// // // // // // //                   style={{
// // // // // // //                     minHeight: 284,
// // // // // // //                     borderRadius: 28,
// // // // // // //                     background: "rgba(23,23,26,0.56)",
// // // // // // //                   }}
// // // // // // //                 >
// // // // // // //                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />

// // // // // // //                   <div className="relative z-10 p-8">
// // // // // // //                     <p
// // // // // // //                       style={{
// // // // // // //                         fontFamily: fontBase,
// // // // // // //                         fontWeight: 600,
// // // // // // //                         fontSize: 12,
// // // // // // //                         lineHeight: "12px",
// // // // // // //                         letterSpacing: "1.2px",
// // // // // // //                         color: "#C084FC",
// // // // // // //                         textTransform: "uppercase",
// // // // // // //                       }}
// // // // // // //                     >
// // // // // // //                       Current Balance
// // // // // // //                     </p>

// // // // // // //                     <h2
// // // // // // //                       className="mt-5 text-white"
// // // // // // //                       style={{
// // // // // // //                         fontFamily: fontBase,
// // // // // // //                         fontWeight: 900,
// // // // // // //                         fontSize: 60,
// // // // // // //                         lineHeight: "60px",
// // // // // // //                       }}
// // // // // // //                     >
// // // // // // //                       {walletLoading ? "Loading..." : `₹ ${fmt(availableBalance)}`}
// // // // // // //                     </h2>

// // // // // // //                     <div className="mt-12 h-px w-full bg-white/10" />

// // // // // // //                     <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
// // // // // // //                       <div>
// // // // // // //                         <p
// // // // // // //                           style={{
// // // // // // //                             fontFamily: fontBase,
// // // // // // //                             fontWeight: 400,
// // // // // // //                             fontSize: 14,
// // // // // // //                             lineHeight: "100%",
// // // // // // //                             color: "rgba(255,255,255,0.35)",
// // // // // // //                           }}
// // // // // // //                         >
// // // // // // //                           Total Earning
// // // // // // //                         </p>

// // // // // // //                         <p
// // // // // // //                           className="mt-3"
// // // // // // //                           style={{
// // // // // // //                             fontFamily: fontBase,
// // // // // // //                             fontWeight: 700,
// // // // // // //                             fontSize: 24,
// // // // // // //                             lineHeight: "100%",
// // // // // // //                             color: "#FFFFFF",
// // // // // // //                           }}
// // // // // // //                         >
// // // // // // //                           {walletLoading ? "—" : `₹${fmt(totalEarning)}`}
// // // // // // //                         </p>
// // // // // // //                       </div>

// // // // // // //                       <div>
// // // // // // //                         <p
// // // // // // //                           style={{
// // // // // // //                             fontFamily: fontBase,
// // // // // // //                             fontWeight: 400,
// // // // // // //                             fontSize: 14,
// // // // // // //                             lineHeight: "100%",
// // // // // // //                             color: "rgba(255,255,255,0.35)",
// // // // // // //                           }}
// // // // // // //                         >
// // // // // // //                           Monthly Earnings
// // // // // // //                         </p>

// // // // // // //                         <p
// // // // // // //                           className="mt-3"
// // // // // // //                           style={{
// // // // // // //                             fontFamily: fontBase,
// // // // // // //                             fontWeight: 700,
// // // // // // //                             fontSize: 24,
// // // // // // //                             lineHeight: "100%",
// // // // // // //                             color: "#ADC6FF",
// // // // // // //                           }}
// // // // // // //                         >
// // // // // // //                           {walletLoading ? "—" : `₹${fmt(monthlyEarning)}`}
// // // // // // //                         </p>
// // // // // // //                       </div>
// // // // // // //                     </div>
// // // // // // //                   </div>
// // // // // // //                 </div>

// // // // // // //                 <div
// // // // // // //                   className="relative self-start overflow-hidden border border-white/10"
// // // // // // //                   style={{
// // // // // // //                     height: "fit-content",
// // // // // // //                     borderRadius: 28,
// // // // // // //                     background: "rgba(23,23,26,0.56)",
// // // // // // //                   }}
// // // // // // //                 >
// // // // // // //                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_55%,rgba(255,20,239,0.28),transparent_50%)]" />

// // // // // // //                   <div className="relative z-10 p-8">
// // // // // // //                     <p
// // // // // // //                       style={{
// // // // // // //                         fontFamily: fontBase,
// // // // // // //                         fontWeight: 700,
// // // // // // //                         fontSize: 13,
// // // // // // //                         lineHeight: "100%",
// // // // // // //                         color: "#A1A1AA",
// // // // // // //                       }}
// // // // // // //                     >
// // // // // // //                       Select Payment Method
// // // // // // //                     </p>

// // // // // // //                     <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-7">
// // // // // // //                       {paymentMethods.map((method) => {
// // // // // // //                         const active = selectedMethod === method.id;

// // // // // // //                         return (
// // // // // // //                           <button
// // // // // // //                             key={method.id}
// // // // // // //                             type="button"
// // // // // // //                             onClick={() => {
// // // // // // //                               setSelectedMethod(method.id);
// // // // // // //                               setPaymentError("");
// // // // // // //                               setPaymentSuccess("");
// // // // // // //                             }}
// // // // // // //                             className="flex h-[125px] flex-col items-center justify-center rounded-[10px] border text-center"
// // // // // // //                             style={{
// // // // // // //                               background: active
// // // // // // //                                 ? "rgba(23,23,26,0.72)"
// // // // // // //                                 : "rgba(255,255,255,0.06)",
// // // // // // //                               borderColor: active
// // // // // // //                                 ? "#FF14EF"
// // // // // // //                                 : "rgba(255,255,255,0.08)",
// // // // // // //                               boxShadow: active ? "inset -1px 0 0 #1A73E8" : "none",
// // // // // // //                             }}
// // // // // // //                           >
// // // // // // //                             <img
// // // // // // //                               src={method.icon}
// // // // // // //                               alt=""
// // // // // // //                               style={iconStyle}
// // // // // // //                               onError={(e) => {
// // // // // // //                                 e.currentTarget.style.display = "none";
// // // // // // //                               }}
// // // // // // //                             />

// // // // // // //                             <p
// // // // // // //                               className="mt-5"
// // // // // // //                               style={{
// // // // // // //                                 fontFamily: fontBase,
// // // // // // //                                 fontWeight: 700,
// // // // // // //                                 fontSize: 14,
// // // // // // //                                 lineHeight: "100%",
// // // // // // //                                 color: "#FFFFFF",
// // // // // // //                               }}
// // // // // // //                             >
// // // // // // //                               {method.title}
// // // // // // //                             </p>

// // // // // // //                             <p
// // // // // // //                               className="mt-3"
// // // // // // //                               style={{
// // // // // // //                                 fontFamily: fontBase,
// // // // // // //                                 fontWeight: 400,
// // // // // // //                                 fontSize: 10,
// // // // // // //                                 lineHeight: "100%",
// // // // // // //                                 color: "rgba(255,255,255,0.35)",
// // // // // // //                               }}
// // // // // // //                             >
// // // // // // //                               {method.subtitle}
// // // // // // //                             </p>
// // // // // // //                           </button>
// // // // // // //                         );
// // // // // // //                       })}
// // // // // // //                     </div>

// // // // // // //                     <div className="mt-9">
// // // // // // //                       <label
// // // // // // //                         style={{
// // // // // // //                           fontFamily: fontBase,
// // // // // // //                           fontWeight: 700,
// // // // // // //                           fontSize: 13,
// // // // // // //                           lineHeight: "100%",
// // // // // // //                           color: "#A1A1AA",
// // // // // // //                         }}
// // // // // // //                       >
// // // // // // //                         Enter amount
// // // // // // //                       </label>

// // // // // // //                       <div
// // // // // // //                         className="mt-5 flex items-center px-8"
// // // // // // //                         style={{
// // // // // // //                           width: "min(546px, 100%)",
// // // // // // //                           height: 60,
// // // // // // //                           borderRadius: 16,
// // // // // // //                           background: "#18181B80",
// // // // // // //                           border: "1px solid #FFFFFF1A",
// // // // // // //                         }}
// // // // // // //                       >
// // // // // // //                         <div className="flex min-w-0 flex-1 items-center gap-4">
// // // // // // //                           <span
// // // // // // //                             style={{
// // // // // // //                               fontFamily: fontBase,
// // // // // // //                               fontWeight: 900,
// // // // // // //                               fontSize: 34,
// // // // // // //                               lineHeight: "100%",
// // // // // // //                               color: "#C084FC",
// // // // // // //                             }}
// // // // // // //                           >
// // // // // // //                             ₹
// // // // // // //                           </span>

// // // // // // //                           <input
// // // // // // //                             value={amount}
// // // // // // //                             onChange={(e) => {
// // // // // // //                               setAmount(e.target.value.replace(/[^\d]/g, ""));
// // // // // // //                               setPaymentError("");
// // // // // // //                               setPaymentSuccess("");
// // // // // // //                             }}
// // // // // // //                             placeholder="0.00"
// // // // // // //                             inputMode="numeric"
// // // // // // //                             className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/10"
// // // // // // //                             style={{
// // // // // // //                               fontFamily: fontBase,
// // // // // // //                               fontWeight: 900,
// // // // // // //                               fontSize: 34,
// // // // // // //                               lineHeight: "100%",
// // // // // // //                               color: "#FFFFFF",
// // // // // // //                             }}
// // // // // // //                           />
// // // // // // //                         </div>
// // // // // // //                       </div>

// // // // // // //                       <div className="mt-5 flex items-center gap-2">
// // // // // // //                         <Info className="h-4 w-4 text-[#71717A]" />

// // // // // // //                         <span
// // // // // // //                           style={{
// // // // // // //                             fontFamily: fontBase,
// // // // // // //                             fontWeight: 400,
// // // // // // //                             fontSize: 12,
// // // // // // //                             lineHeight: "100%",
// // // // // // //                             color: "#71717A",
// // // // // // //                           }}
// // // // // // //                         >
// // // // // // //                           Minimum add: ₹100. Maximum: ₹1,00,000 per transaction.
// // // // // // //                         </span>
// // // // // // //                       </div>

// // // // // // //                       <div className="mt-5 flex flex-nowrap gap-4 overflow-x-auto pb-1">
// // // // // // //                         {quickAmounts.map((value) => (
// // // // // // //                           <button
// // // // // // //                             key={value}
// // // // // // //                             type="button"
// // // // // // //                             onClick={() => {
// // // // // // //                               setAmount(String(value));
// // // // // // //                               setPaymentError("");
// // // // // // //                               setPaymentSuccess("");
// // // // // // //                             }}
// // // // // // //                             className="h-[40px] shrink-0 rounded-[8px] border border-white/10 px-7"
// // // // // // //                             style={{
// // // // // // //                               background: "#18181B80",
// // // // // // //                               ...quickAmountTextStyle,
// // // // // // //                             }}
// // // // // // //                           >
// // // // // // //                             ₹{value}
// // // // // // //                           </button>
// // // // // // //                         ))}
// // // // // // //                       </div>
// // // // // // //                     </div>

// // // // // // //                     {selectedMethod === "upi" && (
// // // // // // //                       <div className="mt-7">
// // // // // // //                         <label
// // // // // // //                           style={{
// // // // // // //                             fontFamily: fontBase,
// // // // // // //                             fontWeight: 700,
// // // // // // //                             fontSize: 13,
// // // // // // //                             lineHeight: "100%",
// // // // // // //                             color: "#A1A1AA",
// // // // // // //                           }}
// // // // // // //                         >
// // // // // // //                           UPI ID
// // // // // // //                         </label>

// // // // // // //                         <input
// // // // // // //                           value={upiId}
// // // // // // //                           onChange={(e) => {
// // // // // // //                             setUpiId(e.target.value);
// // // // // // //                             setPaymentError("");
// // // // // // //                             setPaymentSuccess("");
// // // // // // //                           }}
// // // // // // //                           placeholder="yourname@upi"
// // // // // // //                           className="mt-5 w-full px-8 outline-none placeholder:text-white/35"
// // // // // // //                           style={{
// // // // // // //                             width: "min(546px, 100%)",
// // // // // // //                             height: 50,
// // // // // // //                             borderRadius: 16,
// // // // // // //                             background: "#30302E",
// // // // // // //                             border: "1px solid #FFFFFF1A",
// // // // // // //                             fontFamily: fontBase,
// // // // // // //                             fontWeight: 400,
// // // // // // //                             fontSize: 20,
// // // // // // //                             color: "#FFFFFF",
// // // // // // //                           }}
// // // // // // //                         />

// // // // // // //                         <div
// // // // // // //                           className="mt-6 text-center"
// // // // // // //                           style={{
// // // // // // //                             fontFamily: fontBase,
// // // // // // //                             fontWeight: 400,
// // // // // // //                             fontSize: 12,
// // // // // // //                             color: "#FFFFFF",
// // // // // // //                           }}
// // // // // // //                         >
// // // // // // //                           - Or Scan QR -
// // // // // // //                         </div>

// // // // // // //                         <div className="mt-5 flex justify-center">
// // // // // // //                           <div
// // // // // // //                             className="grid h-[120px] w-[120px] place-items-center bg-white p-3"
// // // // // // //                             aria-label="QR code"
// // // // // // //                           >
// // // // // // //                             <div
// // // // // // //                               className="h-full w-full"
// // // // // // //                               style={{
// // // // // // //                                 background:
// // // // // // //                                   "repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 16px 16px",
// // // // // // //                                 imageRendering: "pixelated",
// // // // // // //                               }}
// // // // // // //                             />
// // // // // // //                           </div>
// // // // // // //                         </div>
// // // // // // //                       </div>
// // // // // // //                     )}

// // // // // // //                     {selectedMethod === "netbanking" && (
// // // // // // //                       <div
// // // // // // //                         className="mt-7 rounded-[14px] border border-white/10 p-5"
// // // // // // //                         style={{ background: "rgba(255,255,255,0.05)" }}
// // // // // // //                       >
// // // // // // //                         <p
// // // // // // //                           style={{
// // // // // // //                             fontFamily: fontBase,
// // // // // // //                             fontWeight: 700,
// // // // // // //                             fontSize: 14,
// // // // // // //                             color: "#FFFFFF",
// // // // // // //                           }}
// // // // // // //                         >
// // // // // // //                           Net Banking
// // // // // // //                         </p>

// // // // // // //                         <p
// // // // // // //                           className="mt-3"
// // // // // // //                           style={{
// // // // // // //                             fontFamily: fontBase,
// // // // // // //                             fontWeight: 400,
// // // // // // //                             fontSize: 12,
// // // // // // //                             lineHeight: "18px",
// // // // // // //                             color: "#71717A",
// // // // // // //                           }}
// // // // // // //                         >
// // // // // // //                           You will be redirected to your bank after confirming the
// // // // // // //                           payment.
// // // // // // //                         </p>
// // // // // // //                       </div>
// // // // // // //                     )}

// // // // // // //                     {selectedMethod === "card" && (
// // // // // // //                       <div
// // // // // // //                         className="mt-7 rounded-[14px] border border-white/10 p-5"
// // // // // // //                         style={{ background: "rgba(255,255,255,0.05)" }}
// // // // // // //                       >
// // // // // // //                         <p
// // // // // // //                           style={{
// // // // // // //                             fontFamily: fontBase,
// // // // // // //                             fontWeight: 700,
// // // // // // //                             fontSize: 14,
// // // // // // //                             color: "#FFFFFF",
// // // // // // //                           }}
// // // // // // //                         >
// // // // // // //                           Card Payment
// // // // // // //                         </p>

// // // // // // //                         <p
// // // // // // //                           className="mt-3"
// // // // // // //                           style={{
// // // // // // //                             fontFamily: fontBase,
// // // // // // //                             fontWeight: 400,
// // // // // // //                             fontSize: 12,
// // // // // // //                             lineHeight: "18px",
// // // // // // //                             color: "#71717A",
// // // // // // //                           }}
// // // // // // //                         >
// // // // // // //                           Visa and MasterCard payments are supported.
// // // // // // //                         </p>
// // // // // // //                       </div>
// // // // // // //                     )}
// // // // // // //                   </div>
// // // // // // //                 </div>
// // // // // // //               </div>

// // // // // // //               <aside
// // // // // // //                 className="relative min-w-0 self-start overflow-hidden border border-white/10"
// // // // // // //                 style={{
// // // // // // //                   width: "100%",
// // // // // // //                   minHeight: 471,
// // // // // // //                   height: "fit-content",
// // // // // // //                   borderRadius: 28,
// // // // // // //                   background: "rgba(23,23,26,0.56)",
// // // // // // //                 }}
// // // // // // //               >
// // // // // // //                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_90%,rgba(255,20,239,0.17),transparent_55%)]" />

// // // // // // //                 <div className="relative z-10 p-8">
// // // // // // //                   <h3
// // // // // // //                     style={{
// // // // // // //                       fontFamily: fontBase,
// // // // // // //                       fontWeight: 700,
// // // // // // //                       fontSize: 18,
// // // // // // //                       lineHeight: "100%",
// // // // // // //                       color: "#FFFFFF",
// // // // // // //                     }}
// // // // // // //                   >
// // // // // // //                     Transaction Summary
// // // // // // //                   </h3>

// // // // // // //                   <div className="mt-8 space-y-7">
// // // // // // //                     <div className="flex items-center justify-between gap-4">
// // // // // // //                       <span style={summaryLabelStyle}>Subtotal</span>
// // // // // // //                       <span style={summaryValueStyle}>
// // // // // // //                         ₹{addAmount.toFixed(2)}
// // // // // // //                       </span>
// // // // // // //                     </div>

// // // // // // //                     <div className="flex items-center justify-between gap-4">
// // // // // // //                       <span style={summaryLabelStyle}>Service Fee (2%)</span>
// // // // // // //                       <span style={summaryValueStyle}>
// // // // // // //                         ₹{serviceFee.toFixed(2)}
// // // // // // //                       </span>
// // // // // // //                     </div>

// // // // // // //                     <div className="h-px w-full bg-white/10" />

// // // // // // //                     <div className="flex items-center justify-between gap-3 min-w-0">
// // // // // // //                       <span
// // // // // // //                         style={{
// // // // // // //                           fontFamily: fontBase,
// // // // // // //                           fontWeight: 700,
// // // // // // //                           fontSize: 20,
// // // // // // //                           lineHeight: "100%",
// // // // // // //                           color: "#FFFFFF",
// // // // // // //                           whiteSpace: "nowrap",
// // // // // // //                           flexShrink: 0,
// // // // // // //                         }}
// // // // // // //                       >
// // // // // // //                         Debit Amount
// // // // // // //                       </span>

// // // // // // //                       <span
// // // // // // //                         style={{
// // // // // // //                           fontFamily: fontBase,
// // // // // // //                           fontWeight: 900,
// // // // // // //                           fontSize: 16,
// // // // // // //                           lineHeight: "100%",
// // // // // // //                           color: "#C084FC",
// // // // // // //                           whiteSpace: "nowrap",
// // // // // // //                           textAlign: "right",
// // // // // // //                         }}
// // // // // // //                       >
// // // // // // //                         ₹{Math.max(debitAmount, 0).toFixed(2)}
// // // // // // //                       </span>
// // // // // // //                     </div>
// // // // // // //                   </div>

// // // // // // //                   <div
// // // // // // //                     className="mt-8 flex gap-3 rounded-[14px] p-4"
// // // // // // //                     style={{ background: "rgba(3,4,5,0.35)" }}
// // // // // // //                   >
// // // // // // //                     <img
// // // // // // //                       src="/icons/locky.svg"
// // // // // // //                       alt=""
// // // // // // //                       className="mt-1 h-5 w-5 shrink-0"
// // // // // // //                       onError={(e) => {
// // // // // // //                         e.currentTarget.style.display = "none";
// // // // // // //                       }}
// // // // // // //                     />

// // // // // // //                     <p
// // // // // // //                       style={{
// // // // // // //                         fontFamily: fontBase,
// // // // // // //                         fontWeight: 400,
// // // // // // //                         fontSize: 12,
// // // // // // //                         lineHeight: "100%",
// // // // // // //                         color: "#71717A",
// // // // // // //                       }}
// // // // // // //                     >
// // // // // // //                       Your payment is secured with end-to-end encryption. Funds
// // // // // // //                       appear instantly after confirmation.
// // // // // // //                     </p>
// // // // // // //                   </div>

// // // // // // //                   {paymentError && (
// // // // // // //                     <div
// // // // // // //                       className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white"
// // // // // // //                       style={{
// // // // // // //                         background: "#2A1717",
// // // // // // //                         borderColor: "rgba(239,68,68,0.35)",
// // // // // // //                       }}
// // // // // // //                     >
// // // // // // //                       {paymentError}
// // // // // // //                     </div>
// // // // // // //                   )}

// // // // // // //                   {paymentSuccess && (
// // // // // // //                     <div
// // // // // // //                       className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white"
// // // // // // //                       style={{
// // // // // // //                         background: "#052A1D",
// // // // // // //                         borderColor: "rgba(74,222,128,0.35)",
// // // // // // //                       }}
// // // // // // //                     >
// // // // // // //                       {paymentSuccess}
// // // // // // //                     </div>
// // // // // // //                   )}

// // // // // // //                   <button
// // // // // // //                     type="button"
// // // // // // //                     disabled={!addAmount || payLoading}
// // // // // // //                     onClick={handleConfirmAddFunds}
// // // // // // //                     className="mt-8 h-[49px] w-full rounded-[8px] text-white disabled:opacity-50"
// // // // // // //                     style={{
// // // // // // //                       ...confirmButtonTextStyle,
// // // // // // //                       background:
// // // // // // //                         "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)",
// // // // // // //                     }}
// // // // // // //                   >
// // // // // // //                     {payLoading ? "Processing..." : "Confirm & Add Funds"}
// // // // // // //                   </button>
// // // // // // //                 </div>
// // // // // // //               </aside>
// // // // // // //             </div>
// // // // // // //           </div>
// // // // // // //         </section>
// // // // // // //       </main>

// // // // // // //       <div className="relative z-10 mt-20">
// // // // // // //         <Footer />
// // // // // // //       </div>
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default AddFunds;

// // // // // // // src/pages/AddFunds.tsx
// // // // // // import { useEffect, useMemo, useState, type CSSProperties } from "react";
// // // // // // import { useNavigate } from "react-router-dom";
// // // // // // import Header from "@/components/Header";
// // // // // // import Footer from "@/components/Footer";
// // // // // // import { Info, Landmark } from "lucide-react";
// // // // // // import { useAuth } from "@/contexts/AuthContext";

// // // // // // declare global {
// // // // // //   interface Window { Razorpay: any; }
// // // // // // }

// // // // // // type PaymentMethod = "upi" | "netbanking" | "card";
// // // // // // type WalletAccount = { id: string; name: string; last4: string; ifsc?: string; };

// // // // // // const AddFunds = () => {
// // // // // //   const navigate = useNavigate();
// // // // // //   const { token, user } = useAuth() as any;

// // // // // //   const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";
// // // // // //   const fontBase = "Inter, system-ui, Arial, sans-serif";

// // // // // //   const CREATE_ORDER_URL = `${API_BASE}/api/wallet/add-fund/create-order`;
// // // // // //   const VERIFY_PAYMENT_URL = `${API_BASE}/api/wallet/add-fund/verify`;
// // // // // //   const WALLET_BALANCE_URL = `${API_BASE}/api/wallet/balance`;
// // // // // //   const BANK_LIST_URL = `${API_BASE}/api/bankaccount`;

// // // // // //   const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
// // // // // //   const [amount, setAmount] = useState("");
// // // // // //   const [upiId, setUpiId] = useState("");

// // // // // //   const [availableBalance, setAvailableBalance] = useState(0);
// // // // // //   const [totalEarning, setTotalEarning] = useState(0);
// // // // // //   const [monthlyEarning, setMonthlyEarning] = useState(0);
// // // // // //   const [walletLoading, setWalletLoading] = useState(false);

// // // // // //   const [accounts, setAccounts] = useState<WalletAccount[]>([]);
// // // // // //   const [selectedAccountId, setSelectedAccountId] = useState<string>("");

// // // // // //   const [payLoading, setPayLoading] = useState(false);
// // // // // //   const [paymentError, setPaymentError] = useState("");
// // // // // //   const [paymentSuccess, setPaymentSuccess] = useState("");

// // // // // //   const userStorageId = user?._id || user?.id || user?.email || "guest";
// // // // // //   const WALLET_ACCOUNTS_KEY = useMemo(() => `tokun_wallet_accounts_${userStorageId}`, [userStorageId]);

// // // // // //   const getAuthToken = () =>
// // // // // //     token || localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token") ||
// // // // // //     localStorage.getItem("token") || sessionStorage.getItem("token") || "";

// // // // // //   const fetchWallet = async () => {
// // // // // //     const authToken = getAuthToken();
// // // // // //     if (!authToken) return;
// // // // // //     try {
// // // // // //       setWalletLoading(true);
// // // // // //       const res = await fetch(WALLET_BALANCE_URL, { headers: { Authorization: `Bearer ${authToken}` }, credentials: "include" });
// // // // // //       const data = await res.json().catch(() => ({}));
// // // // // //       if (res.ok && data.success) {
// // // // // //         setAvailableBalance(Number(data.availableBalance || 0));
// // // // // //         setTotalEarning(Number(data.totalRevenue || 0));
// // // // // //         setMonthlyEarning(Number(data.monthlyEarning || 0));
// // // // // //       }
// // // // // //     } catch (err) { console.error("wallet fetch error:", err); }
// // // // // //     finally { setWalletLoading(false); }
// // // // // //   };

// // // // // //   const fetchBankAccounts = async () => {
// // // // // //     const authToken = getAuthToken();
// // // // // //     // localStorage se pehle load karo
// // // // // //     try {
// // // // // //       const raw = localStorage.getItem(WALLET_ACCOUNTS_KEY);
// // // // // //       if (raw) {
// // // // // //         const parsed = JSON.parse(raw);
// // // // // //         if (Array.isArray(parsed) && parsed.length) {
// // // // // //           setAccounts(parsed);
// // // // // //           setSelectedAccountId(parsed[0].id);
// // // // // //         }
// // // // // //       }
// // // // // //     } catch {}
// // // // // //     if (!authToken) return;
// // // // // //     try {
// // // // // //       const res = await fetch(BANK_LIST_URL, { method: "GET", headers: { Authorization: `Bearer ${authToken}` }, credentials: "include" });
// // // // // //       const data = await res.json().catch(() => ({}));
// // // // // //       if (!res.ok || !Array.isArray(data?.accounts)) return;
// // // // // //       const mapped: WalletAccount[] = data.accounts.map((ba: any) => ({
// // // // // //         id: String(ba?._id || ""),
// // // // // //         name: String(ba?.bankName || "Bank Account"),
// // // // // //         last4: String(ba?.accountNumber || "").slice(-4) || "0000",
// // // // // //         ifsc: String(ba?.ifscCode || "").toUpperCase(),
// // // // // //       }));
// // // // // //       setAccounts(mapped);
// // // // // //       if (mapped.length) setSelectedAccountId((prev) => prev || mapped[0].id);
// // // // // //       localStorage.setItem(WALLET_ACCOUNTS_KEY, JSON.stringify(mapped));
// // // // // //     } catch {}
// // // // // //   };

// // // // // //   useEffect(() => {
// // // // // //     fetchWallet();
// // // // // //     fetchBankAccounts();
// // // // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // // // //   }, [token]);

// // // // // //   const addAmount = Number(amount || 0);
// // // // // //   const serviceFee = addAmount > 0 ? +(addAmount * 0.02).toFixed(2) : 0;
// // // // // //   const debitAmount = addAmount > 0 ? +(addAmount + serviceFee).toFixed(2) : 0;
// // // // // //   const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);

// // // // // //   const confirmButtonTextStyle: CSSProperties = { fontFamily: fontBase, fontWeight: 700, fontSize: 16, lineHeight: "100%", textAlign: "center" };
// // // // // //   const summaryLabelStyle: CSSProperties = { fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "#71717A", whiteSpace: "nowrap" };
// // // // // //   const summaryValueStyle: CSSProperties = { fontFamily: fontBase, fontWeight: 500, fontSize: 14, color: "#FFFFFF", whiteSpace: "nowrap" };
// // // // // //   const quickAmountTextStyle: CSSProperties = { fontFamily: fontBase, fontWeight: 500, fontSize: 18, textAlign: "center", color: "#FFFFFF" };
// // // // // //   const iconStyle: CSSProperties = { width: 40, height: 40, opacity: 1, objectFit: "contain", display: "block" };

// // // // // //   const paymentMethods = [
// // // // // //     { id: "upi" as PaymentMethod, title: "UPI", subtitle: "Instant", icon: "/icons/upi.svg" },
// // // // // //     { id: "netbanking" as PaymentMethod, title: "Net Banking", subtitle: "2-3 mins", icon: "/icons/netbanking.svg" },
// // // // // //     { id: "card" as PaymentMethod, title: "Card", subtitle: "Saved Accounts", icon: "/icons/addcard.svg" },
// // // // // //   ];
// // // // // //   const quickAmounts = [100, 200, 500, 2000];

// // // // // //   const createAddFundOrder = async () => {
// // // // // //     const authToken = getAuthToken();
// // // // // //     const res = await fetch(CREATE_ORDER_URL, {
// // // // // //       method: "POST",
// // // // // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // // // // //       credentials: "include",
// // // // // //       body: JSON.stringify({ amount: addAmount, selectedMethod }),
// // // // // //     });
// // // // // //     const data = await res.json().catch(() => ({}));
// // // // // //     if (!res.ok || !data.success) throw new Error(data.message || "Could not create payment order.");
// // // // // //     return data;
// // // // // //   };

// // // // // //   const verifyAddFundPayment = async (razorpayResponse: any) => {
// // // // // //     const authToken = getAuthToken();
// // // // // //     const res = await fetch(VERIFY_PAYMENT_URL, {
// // // // // //       method: "POST",
// // // // // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // // // // //       credentials: "include",
// // // // // //       body: JSON.stringify(razorpayResponse),
// // // // // //     });
// // // // // //     const data = await res.json().catch(() => ({}));
// // // // // //     if (!res.ok || !data.success) throw new Error(data.message || "Payment verification failed.");
// // // // // //     return data;
// // // // // //   };

// // // // // //   const handleConfirmAddFunds = async () => {
// // // // // //     setPaymentError(""); setPaymentSuccess("");
// // // // // //     const authToken = getAuthToken();
// // // // // //     if (!authToken) { setPaymentError("Please login first."); return; }
// // // // // //     if (!window.Razorpay) { setPaymentError("Razorpay script not loaded."); return; }
// // // // // //     if (!addAmount || Number.isNaN(addAmount)) { setPaymentError("Please enter amount."); return; }
// // // // // //     if (addAmount < 100) { setPaymentError("Minimum add amount is ₹100."); return; }
// // // // // //     if (addAmount > 100000) { setPaymentError("Maximum amount is ₹1,00,000 per transaction."); return; }
// // // // // //     if (selectedMethod === "upi" && upiId.trim()) {
// // // // // //       const basicVpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
// // // // // //       if (!basicVpaRegex.test(upiId.trim().toLowerCase())) {
// // // // // //         setPaymentError("Invalid UPI ID format. Example: yourname@upi"); return;
// // // // // //       }
// // // // // //     }
// // // // // //     try {
// // // // // //       setPayLoading(true);
// // // // // //       const orderData = await createAddFundOrder();
// // // // // //       console.log("[AddFunds] orderData:", orderData);
// // // // // //       const options: any = {
// // // // // //         key: orderData.key,
// // // // // //         amount: orderData.order.amount,
// // // // // //         currency: orderData.order.currency || "INR",
// // // // // //         name: "Tokun",
// // // // // //         description: selectedMethod === "upi" ? "Add funds via UPI" : selectedMethod === "card" ? "Add funds via Card" : "Add funds via Net Banking",
// // // // // //         order_id: orderData.order.id,
// // // // // //         prefill: { name: user?.name || "", email: user?.email || "", contact: user?.phone || user?.mobile || "" },
// // // // // //         notes: { purpose: "wallet_topup", selectedMethod, walletAmount: String(addAmount), serviceFee: String(serviceFee), debitAmount: String(debitAmount), upiId: upiId.trim().toLowerCase() || "" },
// // // // // //         theme: { color: "#1A73E8" },
// // // // // //         handler: async (response: any) => {
// // // // // //           try {
// // // // // //             setPayLoading(true);
// // // // // //             await verifyAddFundPayment(response);
// // // // // //             setPaymentSuccess("Payment successful. Wallet updated.");
// // // // // //             await fetchWallet();
// // // // // //             setTimeout(() => navigate("/wallet"), 1200);
// // // // // //           } catch (err: any) {
// // // // // //             setPaymentError(err?.message || "Payment verification failed.");
// // // // // //           } finally { setPayLoading(false); }
// // // // // //         },
// // // // // //         modal: { ondismiss: () => setPayLoading(false) },
// // // // // //       };
// // // // // //       const razorpay = new window.Razorpay(options);
// // // // // //       razorpay.on("payment.failed", (response: any) => {
// // // // // //         setPaymentError(response?.error?.description || response?.error?.reason || "Payment failed.");
// // // // // //         setPayLoading(false);
// // // // // //       });
// // // // // //       razorpay.open();
// // // // // //     } catch (err: any) {
// // // // // //       setPaymentError(err?.message || "Could not start payment.");
// // // // // //       setPayLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   return (
// // // // // //     <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
// // // // // //       <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
// // // // // //         <img src="/icons/mpbg.png" alt="background" className="absolute inset-0 w-full h-screen object-contain object-top select-none" />
// // // // // //       </div>
// // // // // //       <div className="relative z-20 w-full bg-transparent px-4"><Header /></div>

// // // // // //       <main className="relative z-10 px-4 pt-[95px] pb-20">
// // // // // //         <section className="mx-auto overflow-hidden" style={{ width: "min(1024px, 100%)", minHeight: 1269, borderRadius: 30, background: "#21212180", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", fontFamily: fontBase }}>
// // // // // //           <div className="p-8 sm:p-[50px]">
// // // // // //             <button type="button" onClick={() => navigate("/wallet")} className="inline-flex items-center gap-2" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#C084FC" }}>
// // // // // //               ← Back to Wallet
// // // // // //             </button>
// // // // // //             <div className="mt-4">
// // // // // //               <h1 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 36, lineHeight: "100%", color: "#FFFFFF" }}>Add Funds</h1>
// // // // // //               <p className="mt-4 max-w-[590px]" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 16, lineHeight: "24px", color: "#A1A1AA" }}>
// // // // // //                 Add money to your wallet using UPI, Net Banking or Card.<br />Funds appear instantly after payment confirmation.
// // // // // //               </p>
// // // // // //             </div>

// // // // // //             <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_294px] gap-5 items-start">
// // // // // //               <div className="space-y-5 min-w-0">

// // // // // //                 {/* Balance card */}
// // // // // //                 <div className="relative overflow-hidden border border-white/10" style={{ minHeight: 284, borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// // // // // //                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />
// // // // // //                   <div className="relative z-10 p-8">
// // // // // //                     <p style={{ fontFamily: fontBase, fontWeight: 600, fontSize: 12, letterSpacing: "1.2px", color: "#C084FC", textTransform: "uppercase" }}>Current Balance</p>
// // // // // //                     <h2 className="mt-5 text-white" style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 60, lineHeight: "60px" }}>
// // // // // //                       {walletLoading ? "Loading..." : `₹ ${fmt(availableBalance)}`}
// // // // // //                     </h2>
// // // // // //                     <div className="mt-12 h-px w-full bg-white/10" />
// // // // // //                     <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
// // // // // //                       <div>
// // // // // //                         <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Total Earning</p>
// // // // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, color: "#FFFFFF" }}>{walletLoading ? "—" : `₹${fmt(totalEarning)}`}</p>
// // // // // //                       </div>
// // // // // //                       <div>
// // // // // //                         <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Monthly Earnings</p>
// // // // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, color: "#ADC6FF" }}>{walletLoading ? "—" : `₹${fmt(monthlyEarning)}`}</p>
// // // // // //                       </div>
// // // // // //                     </div>
// // // // // //                   </div>
// // // // // //                 </div>

// // // // // //                 {/* Payment method */}
// // // // // //                 <div className="relative self-start overflow-hidden border border-white/10" style={{ height: "fit-content", borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// // // // // //                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_55%,rgba(255,20,239,0.28),transparent_50%)]" />
// // // // // //                   <div className="relative z-10 p-8">
// // // // // //                     <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>Select Payment Method</p>

// // // // // //                     {/* Tabs */}
// // // // // //                     <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-7">
// // // // // //                       {paymentMethods.map((method) => {
// // // // // //                         const active = selectedMethod === method.id;
// // // // // //                         return (
// // // // // //                           <button key={method.id} type="button"
// // // // // //                             onClick={() => { setSelectedMethod(method.id); setPaymentError(""); setPaymentSuccess(""); }}
// // // // // //                             className="flex h-[125px] flex-col items-center justify-center rounded-[10px] border text-center"
// // // // // //                             style={{ background: active ? "rgba(23,23,26,0.72)" : "rgba(255,255,255,0.06)", borderColor: active ? "#FF14EF" : "rgba(255,255,255,0.08)", boxShadow: active ? "inset -1px 0 0 #1A73E8" : "none" }}
// // // // // //                           >
// // // // // //                             <img src={method.icon} alt="" style={iconStyle} onError={(e) => { e.currentTarget.style.display = "none"; }} />
// // // // // //                             <p className="mt-5" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>{method.title}</p>
// // // // // //                             <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{method.subtitle}</p>
// // // // // //                           </button>
// // // // // //                         );
// // // // // //                       })}
// // // // // //                     </div>

// // // // // //                     {/* Amount */}
// // // // // //                     <div className="mt-9">
// // // // // //                       <label style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>Enter amount</label>
// // // // // //                       <div className="mt-5 flex items-center px-8" style={{ width: "min(546px, 100%)", height: 60, borderRadius: 16, background: "#18181B80", border: "1px solid #FFFFFF1A" }}>
// // // // // //                         <div className="flex min-w-0 flex-1 items-center gap-4">
// // // // // //                           <span style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 34, color: "#C084FC" }}>₹</span>
// // // // // //                           <input value={amount} onChange={(e) => { setAmount(e.target.value.replace(/[^\d]/g, "")); setPaymentError(""); setPaymentSuccess(""); }}
// // // // // //                             placeholder="0.00" inputMode="numeric"
// // // // // //                             className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/10"
// // // // // //                             style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 34, color: "#FFFFFF" }} />
// // // // // //                         </div>
// // // // // //                       </div>
// // // // // //                       <div className="mt-5 flex items-center gap-2">
// // // // // //                         <Info className="h-4 w-4 text-[#71717A]" />
// // // // // //                         <span style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "#71717A" }}>Minimum add: ₹100. Maximum: ₹1,00,000 per transaction.</span>
// // // // // //                       </div>
// // // // // //                       <div className="mt-5 flex flex-nowrap gap-4 overflow-x-auto pb-1">
// // // // // //                         {quickAmounts.map((value) => (
// // // // // //                           <button key={value} type="button" onClick={() => { setAmount(String(value)); setPaymentError(""); setPaymentSuccess(""); }}
// // // // // //                             className="h-[40px] shrink-0 rounded-[8px] border border-white/10 px-7"
// // // // // //                             style={{ background: "#18181B80", ...quickAmountTextStyle }}>
// // // // // //                             ₹{value}
// // // // // //                           </button>
// // // // // //                         ))}
// // // // // //                       </div>
// // // // // //                     </div>

// // // // // //                     {/* UPI */}
// // // // // //                     {selectedMethod === "upi" && (
// // // // // //                       <div className="mt-7">
// // // // // //                         <label style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>UPI ID</label>
// // // // // //                         <input value={upiId} onChange={(e) => { setUpiId(e.target.value); setPaymentError(""); }} placeholder="yourname@upi"
// // // // // //                           className="mt-5 w-full px-8 outline-none placeholder:text-white/35"
// // // // // //                           style={{ width: "min(546px, 100%)", height: 50, borderRadius: 16, background: "#30302E", border: "1px solid #FFFFFF1A", fontFamily: fontBase, fontWeight: 400, fontSize: 20, color: "#FFFFFF" }} />
// // // // // //                         <div className="mt-6 text-center" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "#FFFFFF" }}>- Or Scan QR -</div>
// // // // // //                         <div className="mt-5 flex justify-center">
// // // // // //                           <div className="grid h-[120px] w-[120px] place-items-center bg-white p-3">
// // // // // //                             <div className="h-full w-full" style={{ background: "repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 16px 16px", imageRendering: "pixelated" }} />
// // // // // //                           </div>
// // // // // //                         </div>
// // // // // //                       </div>
// // // // // //                     )}

// // // // // //                     {/* Net Banking */}
// // // // // //                     {selectedMethod === "netbanking" && (
// // // // // //                       <div className="mt-7 rounded-[14px] border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.05)" }}>
// // // // // //                         <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>Net Banking</p>
// // // // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, lineHeight: "18px", color: "#71717A" }}>You will be redirected to your bank after confirming the payment.</p>
// // // // // //                       </div>
// // // // // //                     )}

// // // // // //                     {/* ── CARD — Saved bank accounts ── */}
// // // // // //                     {selectedMethod === "card" && (
// // // // // //                       <div className="mt-7">
// // // // // //                         <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>Select Saved Account</p>

// // // // // //                         {accounts.length === 0 ? (
// // // // // //                           <div className="mt-4 rounded-[14px] border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.05)" }}>
// // // // // //                             <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
// // // // // //                               No saved accounts.{" "}
// // // // // //                               <button type="button" onClick={() => navigate("/wallet")} style={{ color: "#C084FC", textDecoration: "underline" }}>
// // // // // //                                 Add from Wallet
// // // // // //                               </button>
// // // // // //                             </p>
// // // // // //                           </div>
// // // // // //                         ) : (
// // // // // //                           <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
// // // // // //                             {accounts.map((account) => {
// // // // // //                               const active = selectedAccountId === account.id;
// // // // // //                               return (
// // // // // //                                 <button key={account.id} type="button" onClick={() => setSelectedAccountId(account.id)}
// // // // // //                                   className="flex h-[80px] items-center gap-4 rounded-[12px] border px-4 text-left transition-all"
// // // // // //                                   style={{ background: active ? "rgba(23,23,26,0.72)" : "rgba(255,255,255,0.05)", borderColor: active ? "#FF14EF" : "rgba(255,255,255,0.10)", boxShadow: active ? "inset -1px 0 0 #1A73E8" : "none" }}
// // // // // //                                 >
// // // // // //                                   <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1A73E8]/20">
// // // // // //                                     <Landmark className="h-5 w-5 text-[#1A73E8]" />
// // // // // //                                   </div>
// // // // // //                                   <div className="min-w-0 flex-1">
// // // // // //                                     <p className="truncate text-white" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14 }}>{account.name}</p>
// // // // // //                                     <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>•••• {account.last4}</p>
// // // // // //                                   </div>
// // // // // //                                   {active && <div className="h-4 w-4 shrink-0 rounded-full border-2 border-[#FF14EF] bg-[#FF14EF]" />}
// // // // // //                                 </button>
// // // // // //                               );
// // // // // //                             })}
// // // // // //                           </div>
// // // // // //                         )}

// // // // // //                         <button type="button" onClick={() => navigate("/wallet")}
// // // // // //                           className="mt-4 flex h-[44px] items-center gap-2 rounded-[10px] border border-dashed border-white/20 px-4"
// // // // // //                           style={{ background: "rgba(255,255,255,0.04)" }}>
// // // // // //                           <span style={{ width: 14, height: 14, display: "inline-block", backgroundColor: "#A1A1AA", WebkitMask: "url('/icons/pluss.svg') center / contain no-repeat", mask: "url('/icons/pluss.svg') center / contain no-repeat" }} />
// // // // // //                           <span style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>Add New Account</span>
// // // // // //                         </button>
// // // // // //                       </div>
// // // // // //                     )}
// // // // // //                   </div>
// // // // // //                 </div>
// // // // // //               </div>

// // // // // //               {/* Summary sidebar */}
// // // // // //               <aside className="relative min-w-0 self-start overflow-hidden border border-white/10" style={{ width: "100%", minHeight: 471, height: "fit-content", borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// // // // // //                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_90%,rgba(255,20,239,0.17),transparent_55%)]" />
// // // // // //                 <div className="relative z-10 p-8">
// // // // // //                   <h3 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 18, color: "#FFFFFF" }}>Transaction Summary</h3>
// // // // // //                   <div className="mt-8 space-y-7">
// // // // // //                     <div className="flex items-center justify-between gap-4">
// // // // // //                       <span style={summaryLabelStyle}>Subtotal</span>
// // // // // //                       <span style={summaryValueStyle}>₹{addAmount.toFixed(2)}</span>
// // // // // //                     </div>
// // // // // //                     <div className="flex items-center justify-between gap-4">
// // // // // //                       <span style={summaryLabelStyle}>Service Fee (2%)</span>
// // // // // //                       <span style={summaryValueStyle}>₹{serviceFee.toFixed(2)}</span>
// // // // // //                     </div>
// // // // // //                     <div className="h-px w-full bg-white/10" />
// // // // // //                     <div className="flex items-center justify-between gap-3 min-w-0">
// // // // // //                       <span style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 20, color: "#FFFFFF", whiteSpace: "nowrap", flexShrink: 0 }}>Debit Amount</span>
// // // // // //                       <span style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 16, color: "#C084FC", whiteSpace: "nowrap", textAlign: "right" }}>₹{Math.max(debitAmount, 0).toFixed(2)}</span>
// // // // // //                     </div>
// // // // // //                   </div>
// // // // // //                   <div className="mt-8 flex gap-3 rounded-[14px] p-4" style={{ background: "rgba(3,4,5,0.35)" }}>
// // // // // //                     <img src="/icons/locky.svg" alt="" className="mt-1 h-5 w-5 shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
// // // // // //                     <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "#71717A" }}>Your payment is secured with end-to-end encryption. Funds appear instantly after confirmation.</p>
// // // // // //                   </div>
// // // // // //                   {paymentError && (
// // // // // //                     <div className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white" style={{ background: "#2A1717", borderColor: "rgba(239,68,68,0.35)" }}>{paymentError}</div>
// // // // // //                   )}
// // // // // //                   {paymentSuccess && (
// // // // // //                     <div className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white" style={{ background: "#052A1D", borderColor: "rgba(74,222,128,0.35)" }}>{paymentSuccess}</div>
// // // // // //                   )}
// // // // // //                   <button type="button" disabled={!addAmount || payLoading} onClick={handleConfirmAddFunds}
// // // // // //                     className="mt-8 h-[49px] w-full rounded-[8px] text-white disabled:opacity-50"
// // // // // //                     style={{ ...confirmButtonTextStyle, background: "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)" }}>
// // // // // //                     {payLoading ? "Processing..." : "Confirm & Add Funds"}
// // // // // //                   </button>
// // // // // //                 </div>
// // // // // //               </aside>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         </section>
// // // // // //       </main>
// // // // // //       <div className="relative z-10 mt-20"><Footer /></div>
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // export default AddFunds;



// // // // // // /// src/pages/AddFunds.tsx
// // // // // // import { useEffect, useMemo, useState, type CSSProperties } from "react";
// // // // // // import { useNavigate } from "react-router-dom";
// // // // // // import Header from "@/components/Header";
// // // // // // import Footer from "@/components/Footer";
// // // // // // import { Info, Landmark, CheckCircle2, XCircle, Loader2 } from "lucide-react";
// // // // // // import { useAuth } from "@/contexts/AuthContext";

// // // // // // declare global {
// // // // // //   interface Window { Razorpay: any; }
// // // // // // }

// // // // // // type PaymentMethod = "upi" | "netbanking" | "card";
// // // // // // type WalletAccount = { id: string; name: string; last4: string; ifsc?: string; };
// // // // // // type UpiStatus = "idle" | "verifying" | "valid" | "invalid";

// // // // // // const AddFunds = () => {
// // // // // //   const navigate = useNavigate();
// // // // // //   const { token, user } = useAuth() as any;

// // // // // //   const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";
// // // // // //   const fontBase = "Inter, system-ui, Arial, sans-serif";

// // // // // //   const CREATE_ORDER_URL   = `${API_BASE}/api/wallet/add-fund/create-order`;
// // // // // //   const VERIFY_PAYMENT_URL = `${API_BASE}/api/wallet/add-fund/verify`;
// // // // // //   const WALLET_BALANCE_URL = `${API_BASE}/api/wallet/balance`;
// // // // // //   const BANK_LIST_URL      = `${API_BASE}/api/bankaccount`;
// // // // // //   const BANK_TRANSFER_URL  = `${API_BASE}/api/wallet/add-fund/bank-transfer`;
// // // // // //   const UPI_VALIDATE_URL   = `${API_BASE}/api/wallet/upi/validate`;

// // // // // //   const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
// // // // // //   const [amount, setAmount]   = useState("");
// // // // // //   const [upiId, setUpiId]     = useState("");

// // // // // //   // UPI verification state
// // // // // //   const [upiStatus, setUpiStatus]   = useState<UpiStatus>("idle");
// // // // // //   const [upiError, setUpiError]     = useState("");
// // // // // //   const [upiName, setUpiName]       = useState("");

// // // // // //   const [availableBalance, setAvailableBalance] = useState(0);
// // // // // //   const [totalEarning, setTotalEarning]         = useState(0);
// // // // // //   const [monthlyEarning, setMonthlyEarning]     = useState(0);
// // // // // //   const [walletLoading, setWalletLoading]       = useState(false);

// // // // // //   const [accounts, setAccounts]               = useState<WalletAccount[]>([]);
// // // // // //   const [selectedAccountId, setSelectedAccountId] = useState<string>("");

// // // // // //   const [payLoading, setPayLoading]         = useState(false);
// // // // // //   const [paymentError, setPaymentError]     = useState("");
// // // // // //   const [paymentSuccess, setPaymentSuccess] = useState("");

// // // // // //   const userStorageId = user?._id || user?.id || user?.email || "guest";
// // // // // //   const WALLET_ACCOUNTS_KEY = useMemo(() => `tokun_wallet_accounts_${userStorageId}`, [userStorageId]);

// // // // // //   const getAuthToken = () =>
// // // // // //     token ||
// // // // // //     localStorage.getItem("auth_token") ||
// // // // // //     sessionStorage.getItem("auth_token") ||
// // // // // //     localStorage.getItem("token") ||
// // // // // //     sessionStorage.getItem("token") ||
// // // // // //     "";

// // // // // //   // ── Wallet balance fetch ──
// // // // // //   const fetchWallet = async () => {
// // // // // //     const authToken = getAuthToken();
// // // // // //     if (!authToken) return;
// // // // // //     try {
// // // // // //       setWalletLoading(true);
// // // // // //       const res  = await fetch(WALLET_BALANCE_URL, { headers: { Authorization: `Bearer ${authToken}` }, credentials: "include" });
// // // // // //       const data = await res.json().catch(() => ({}));
// // // // // //       if (res.ok && data.success) {
// // // // // //         setAvailableBalance(Number(data.availableBalance || 0));
// // // // // //         setTotalEarning(Number(data.totalRevenue || 0));
// // // // // //         setMonthlyEarning(Number(data.monthlyEarning || 0));
// // // // // //       }
// // // // // //     } catch (err) {
// // // // // //       console.error("wallet fetch error:", err);
// // // // // //     } finally {
// // // // // //       setWalletLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   // ── Saved bank accounts fetch ──
// // // // // //   const fetchBankAccounts = async () => {
// // // // // //     const authToken = getAuthToken();
// // // // // //     try {
// // // // // //       const raw = localStorage.getItem(WALLET_ACCOUNTS_KEY);
// // // // // //       if (raw) {
// // // // // //         const parsed = JSON.parse(raw);
// // // // // //         if (Array.isArray(parsed) && parsed.length) {
// // // // // //           setAccounts(parsed);
// // // // // //           setSelectedAccountId((prev) => prev || parsed[0].id);
// // // // // //         }
// // // // // //       }
// // // // // //     } catch {}

// // // // // //     if (!authToken) return;
// // // // // //     try {
// // // // // //       const res  = await fetch(BANK_LIST_URL, { method: "GET", headers: { Authorization: `Bearer ${authToken}` }, credentials: "include" });
// // // // // //       const data = await res.json().catch(() => ({}));
// // // // // //       if (!res.ok || !Array.isArray(data?.accounts)) return;

// // // // // //       const mapped: WalletAccount[] = data.accounts.map((ba: any) => ({
// // // // // //         id:   String(ba?._id || ""),
// // // // // //         name: String(ba?.bankName || "Bank Account"),
// // // // // //         last4: String(ba?.accountNumber || "").slice(-4) || "0000",
// // // // // //         ifsc: String(ba?.ifscCode || "").toUpperCase(),
// // // // // //       }));

// // // // // //       setAccounts(mapped);
// // // // // //       if (mapped.length) setSelectedAccountId((prev) => prev || mapped[0].id);
// // // // // //       localStorage.setItem(WALLET_ACCOUNTS_KEY, JSON.stringify(mapped));
// // // // // //     } catch {}
// // // // // //   };

// // // // // //   useEffect(() => {
// // // // // //     fetchWallet();
// // // // // //     fetchBankAccounts();
// // // // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // // // //   }, [token]);

// // // // // //   // Reset UPI status when UPI ID changes
// // // // // //   useEffect(() => {
// // // // // //     if (upiStatus !== "idle") {
// // // // // //       setUpiStatus("idle");
// // // // // //       setUpiError("");
// // // // // //       setUpiName("");
// // // // // //     }
// // // // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // // // //   }, [upiId]);

// // // // // //   const addAmount   = Number(amount || 0);
// // // // // //   const serviceFee  = addAmount > 0 ? +(addAmount * 0.02).toFixed(2) : 0;
// // // // // //   const debitAmount = addAmount > 0 ? +(addAmount + serviceFee).toFixed(2) : 0;

// // // // // //   const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);

// // // // // //   // ── Styles ──
// // // // // //   const confirmButtonTextStyle: CSSProperties = {
// // // // // //     fontFamily: fontBase, fontWeight: 700, fontSize: 16, lineHeight: "100%", textAlign: "center",
// // // // // //   };
// // // // // //   const summaryLabelStyle: CSSProperties = {
// // // // // //     fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "#71717A", whiteSpace: "nowrap",
// // // // // //   };
// // // // // //   const summaryValueStyle: CSSProperties = {
// // // // // //     fontFamily: fontBase, fontWeight: 500, fontSize: 14, color: "#FFFFFF", whiteSpace: "nowrap",
// // // // // //   };
// // // // // //   const quickAmountTextStyle: CSSProperties = {
// // // // // //     fontFamily: fontBase, fontWeight: 500, fontSize: 18, textAlign: "center", color: "#FFFFFF",
// // // // // //   };
// // // // // //   const iconStyle: CSSProperties = {
// // // // // //     width: 40, height: 40, opacity: 1, objectFit: "contain", display: "block",
// // // // // //   };

// // // // // //   const paymentMethods = [
// // // // // //     { id: "upi"        as PaymentMethod, title: "UPI",         subtitle: "Instant",         icon: "/icons/upi.svg" },
// // // // // //     { id: "netbanking" as PaymentMethod, title: "Net Banking",  subtitle: "2-3 mins",        icon: "/icons/netbanking.svg" },
// // // // // //     { id: "card"       as PaymentMethod, title: "Card",         subtitle: "Saved Accounts",  icon: "/icons/addcard.svg" },
// // // // // //   ];
// // // // // //   const quickAmounts = [100, 200, 500, 2000];

// // // // // //   // ── UPI Verify Handler ──
// // // // // //   const handleVerifyUpi = async () => {
// // // // // //     if (!upiId.trim()) {
// // // // // //       setUpiError("Please enter a UPI ID first.");
// // // // // //       return;
// // // // // //     }

// // // // // //     const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
// // // // // //     if (!vpaRegex.test(upiId.trim().toLowerCase())) {
// // // // // //       setUpiStatus("invalid");
// // // // // //       setUpiError("Invalid UPI ID format. Example: name@upi");
// // // // // //       setUpiName("");
// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       setUpiStatus("verifying");
// // // // // //       setUpiError("");
// // // // // //       setUpiName("");

// // // // // //       const authToken = getAuthToken();
// // // // // //       const res  = await fetch(UPI_VALIDATE_URL, {
// // // // // //         method: "POST",
// // // // // //         headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // // // // //         credentials: "include",
// // // // // //         body: JSON.stringify({ vpa: upiId.trim() }),
// // // // // //       });
// // // // // //       const data = await res.json().catch(() => ({}));

// // // // // //       if (!res.ok || !data.success || data.error === "invalid_vpa") {
// // // // // //         setUpiStatus("invalid");
// // // // // //         setUpiError(data.message || "UPI ID is invalid or does not exist.");
// // // // // //         return;
// // // // // //       }

// // // // // //       setUpiStatus("valid");
// // // // // //       if (data.name) setUpiName(data.name);
// // // // // //     } catch (err: any) {
// // // // // //       setUpiStatus("invalid");
// // // // // //       setUpiError("Could not verify UPI ID. Please try again.");
// // // // // //     }
// // // // // //   };

// // // // // //   // ── Create Razorpay order ──
// // // // // //   const createAddFundOrder = async () => {
// // // // // //     const authToken = getAuthToken();
// // // // // //     const res  = await fetch(CREATE_ORDER_URL, {
// // // // // //       method: "POST",
// // // // // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // // // // //       credentials: "include",
// // // // // //       body: JSON.stringify({ amount: addAmount, selectedMethod }),
// // // // // //     });
// // // // // //     const data = await res.json().catch(() => ({}));
// // // // // //     if (!res.ok || !data.success) throw new Error(data.message || "Could not create payment order.");
// // // // // //     return data;
// // // // // //   };

// // // // // //   // ── Verify Razorpay payment ──
// // // // // //   const verifyAddFundPayment = async (razorpayResponse: any) => {
// // // // // //     const authToken = getAuthToken();
// // // // // //     const res  = await fetch(VERIFY_PAYMENT_URL, {
// // // // // //       method: "POST",
// // // // // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // // // // //       credentials: "include",
// // // // // //       body: JSON.stringify(razorpayResponse),
// // // // // //     });
// // // // // //     const data = await res.json().catch(() => ({}));
// // // // // //     if (!res.ok || !data.success) throw new Error(data.message || "Payment verification failed.");
// // // // // //     return data;
// // // // // //   };

// // // // // //   // ── Build Razorpay config to restrict payment methods ──
// // // // // //   // NOTE: show_default_blocks:false causes "No appropriate payment method found" in test mode.
// // // // // //   // Instead we keep default blocks ON but hide paylater & emi via hidden_blocks,
// // // // // //   // and push the desired method to the top via sequence.
// // // // // //   const buildRazorpayConfig = (method: PaymentMethod) => {
// // // // // //     if (method === "upi") {
// // // // // //       return {
// // // // // //         display: {
// // // // // //           // Define a custom UPI-only block shown at the top
// // // // // //           blocks: {
// // // // // //             upi_block: {
// // // // // //               name: "Pay via UPI",
// // // // // //               instruments: [
// // // // // //                 { method: "upi" },
// // // // // //               ],
// // // // // //             },
// // // // // //             // Keep other blocks but hide paylater & emi below
// // // // // //             other: {
// // // // // //               name: "Other Methods",
// // // // // //               instruments: [
// // // // // //                 { method: "card" },
// // // // // //                 { method: "netbanking" },
// // // // // //                 { method: "wallet" },
// // // // // //               ],
// // // // // //             },
// // // // // //           },
// // // // // //           // UPI block first, then others; paylater & emi completely hidden
// // // // // //           sequence: ["block.upi_block", "block.other"],
// // // // // //           preferences: {
// // // // // //             show_default_blocks: false,
// // // // // //           },
// // // // // //         },
// // // // // //         // Explicitly disable paylater & emi at the checkout level
// // // // // //         hidden: [
// // // // // //           { method: "paylater" },
// // // // // //           { method: "emi" },
// // // // // //         ],
// // // // // //       };
// // // // // //     }

// // // // // //     if (method === "netbanking") {
// // // // // //       return {
// // // // // //         display: {
// // // // // //           blocks: {
// // // // // //             nb_block: {
// // // // // //               name: "Pay via Net Banking",
// // // // // //               instruments: [
// // // // // //                 { method: "netbanking" },
// // // // // //               ],
// // // // // //             },
// // // // // //             other: {
// // // // // //               name: "Other Methods",
// // // // // //               instruments: [
// // // // // //                 { method: "upi" },
// // // // // //                 { method: "card" },
// // // // // //                 { method: "wallet" },
// // // // // //               ],
// // // // // //             },
// // // // // //           },
// // // // // //           sequence: ["block.nb_block", "block.other"],
// // // // // //           preferences: {
// // // // // //             show_default_blocks: false,
// // // // // //           },
// // // // // //         },
// // // // // //         hidden: [
// // // // // //           { method: "paylater" },
// // // // // //           { method: "emi" },
// // // // // //         ],
// // // // // //       };
// // // // // //     }

// // // // // //     // fallback — should not be reached for card (handled separately)
// // // // // //     return {};
// // // // // //   };

// // // // // //   // ── Main payment handler ──
// // // // // //   const handleConfirmAddFunds = async () => {
// // // // // //     setPaymentError("");
// // // // // //     setPaymentSuccess("");

// // // // // //     const authToken = getAuthToken();
// // // // // //     if (!authToken)              { setPaymentError("Please login first."); return; }
// // // // // //     if (!addAmount || Number.isNaN(addAmount)) { setPaymentError("Please enter amount."); return; }
// // // // // //     if (addAmount < 100)         { setPaymentError("Minimum add amount is ₹100."); return; }
// // // // // //     if (addAmount > 100000)      { setPaymentError("Maximum amount is ₹1,00,000 per transaction."); return; }

// // // // // //     // ── CARD flow: saved bank account ──
// // // // // //     if (selectedMethod === "card") {
// // // // // //       if (!selectedAccountId) {
// // // // // //         setPaymentError("Please select a saved bank account.");
// // // // // //         return;
// // // // // //       }
// // // // // //       try {
// // // // // //         setPayLoading(true);
// // // // // //         const res  = await fetch(BANK_TRANSFER_URL, {
// // // // // //           method: "POST",
// // // // // //           headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // // // // //           credentials: "include",
// // // // // //           body: JSON.stringify({ amount: addAmount, bankAccountId: selectedAccountId }),
// // // // // //         });
// // // // // //         const data = await res.json().catch(() => ({}));
// // // // // //         if (!res.ok || !data.success) throw new Error(data.message || "Could not process request.");

// // // // // //         setPaymentSuccess("Bank transfer request submitted! Funds will be credited after verification (1-2 business days).");
// // // // // //         setAmount("");
// // // // // //         await fetchWallet();
// // // // // //         setTimeout(() => navigate("/wallet"), 2500);
// // // // // //       } catch (err: any) {
// // // // // //         setPaymentError(err?.message || "Could not process bank transfer.");
// // // // // //       } finally {
// // // // // //         setPayLoading(false);
// // // // // //       }
// // // // // //       return;
// // // // // //     }

// // // // // //     // ── UPI / NetBanking flow: Razorpay ──
// // // // // //     if (!window.Razorpay) {
// // // // // //       setPaymentError("Razorpay not loaded. Please check your internet connection.");
// // // // // //       return;
// // // // // //     }

// // // // // //     // UPI: agar UPI ID enter kiya hai to verified hona chahiye
// // // // // //     if (selectedMethod === "upi" && upiId.trim()) {
// // // // // //       if (upiStatus === "idle") {
// // // // // //         setPaymentError("Please verify your UPI ID before proceeding.");
// // // // // //         return;
// // // // // //       }
// // // // // //       if (upiStatus === "invalid") {
// // // // // //         setPaymentError("Invalid UPI ID. Please enter a valid UPI ID.");
// // // // // //         return;
// // // // // //       }
// // // // // //       if (upiStatus === "verifying") {
// // // // // //         setPaymentError("UPI verification in progress. Please wait.");
// // // // // //         return;
// // // // // //       }
// // // // // //     }

// // // // // //     try {
// // // // // //       setPayLoading(true);
// // // // // //       const orderData = await createAddFundOrder();

// // // // // //       const order = orderData?.order || {};
// // // // // //       const orderId = String(order?.id || "");
// // // // // //       const razorpayKey = String(orderData?.key || "");

// // // // // //       if (!razorpayKey.startsWith("rzp_")) {
// // // // // //         throw new Error("Invalid Razorpay key received from server.");
// // // // // //       }
// // // // // //       if (!orderId.startsWith("order_")) {
// // // // // //         throw new Error("Invalid Razorpay order received from server.");
// // // // // //       }

// // // // // //       const cleanEmail   = String(user?.email || "").trim();
// // // // // //       const cleanContact = String(user?.phone || user?.mobile || "").replace(/\D/g, "").slice(-10);
// // // // // //       const cleanName    = String(user?.name || "").trim();

// // // // // //       const prefill: Record<string, string> = {};
// // // // // //       if (cleanName) prefill.name = cleanName;
// // // // // //       if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) prefill.email = cleanEmail;
// // // // // //       if (/^[6-9]\d{9}$/.test(cleanContact)) prefill.contact = cleanContact;

// // // // // //       // ── FIX: Pre-fill verified UPI ID so Razorpay opens directly on UPI collect screen ──
// // // // // //       if (selectedMethod === "upi" && upiId.trim() && upiStatus === "valid") {
// // // // // //         prefill.vpa = upiId.trim();
// // // // // //       }

// // // // // //       const options: any = {
// // // // // //         key: razorpayKey,
// // // // // //         order_id: orderId,
// // // // // //         name: "Tokun",
// // // // // //         description: selectedMethod === "upi" ? "Add funds via UPI" : "Add funds via Net Banking",
// // // // // //         image: "/favicon.ico",
// // // // // //         prefill,
// // // // // //         notes: {
// // // // // //           purpose: "wallet_topup",
// // // // // //           selectedMethod: String(selectedMethod),
// // // // // //           walletAmount: String(addAmount),
// // // // // //         },
// // // // // //         theme: { color: "#1A73E8" },

// // // // // //         // ── FIX: Restrict Razorpay checkout to only UPI or NetBanking.
// // // // // //         //    show_default_blocks: false removes Pay Later, EMI, Cards, Wallets. ──
// // // // // //         config: buildRazorpayConfig(selectedMethod),

// // // // // //         handler: async (response: any) => {
// // // // // //           try {
// // // // // //             setPayLoading(true);
// // // // // //             await verifyAddFundPayment(response);
// // // // // //             setPaymentSuccess("Payment successful! Wallet updated.");
// // // // // //             await fetchWallet();
// // // // // //             setTimeout(() => navigate("/wallet"), 1200);
// // // // // //           } catch (err: any) {
// // // // // //             setPaymentError(err?.message || "Payment verification failed.");
// // // // // //           } finally {
// // // // // //             setPayLoading(false);
// // // // // //           }
// // // // // //         },
// // // // // //         modal: { ondismiss: () => setPayLoading(false) },
// // // // // //       };

// // // // // //       console.log("[Razorpay Checkout Options]", {
// // // // // //         key: razorpayKey,
// // // // // //         order_id: orderId,
// // // // // //         amount: order.amount,
// // // // // //         currency: order.currency,
// // // // // //         hasPrefill: Object.keys(prefill).length > 0,
// // // // // //         config: options.config,
// // // // // //       });

// // // // // //       const razorpay = new window.Razorpay(options);
// // // // // //       razorpay.on("payment.failed", (response: any) => {
// // // // // //         setPaymentError(
// // // // // //           response?.error?.description || response?.error?.reason || "Payment failed. Please try again."
// // // // // //         );
// // // // // //         setPayLoading(false);
// // // // // //       });
// // // // // //       razorpay.open();

// // // // // //     } catch (err: any) {
// // // // // //       console.error("[AddFunds] error:", err);
// // // // // //       setPaymentError(err?.message || "Could not start payment.");
// // // // // //       setPayLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   return (
// // // // // //     <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
// // // // // //       <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
// // // // // //         <img src="/icons/mpbg.png" alt="background" className="absolute inset-0 w-full h-screen object-contain object-top select-none" />
// // // // // //       </div>
// // // // // //       <div className="relative z-20 w-full bg-transparent px-4"><Header /></div>

// // // // // //       <main className="relative z-10 px-4 pt-[95px] pb-20">
// // // // // //         <section className="mx-auto overflow-hidden"
// // // // // //           style={{ width: "min(1024px, 100%)", minHeight: 1269, borderRadius: 30, background: "#21212180", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", fontFamily: fontBase }}>
// // // // // //           <div className="p-8 sm:p-[50px]">

// // // // // //             <button type="button" onClick={() => navigate("/wallet")} className="inline-flex items-center gap-2"
// // // // // //               style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#C084FC" }}>
// // // // // //               ← Back to Wallet
// // // // // //             </button>

// // // // // //             <div className="mt-4">
// // // // // //               <h1 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 36, lineHeight: "100%", color: "#FFFFFF" }}>Add Funds</h1>
// // // // // //               <p className="mt-4 max-w-[590px]" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 16, lineHeight: "24px", color: "#A1A1AA" }}>
// // // // // //                 Add money to your wallet using UPI, Net Banking or saved bank accounts.<br />
// // // // // //                 Funds appear instantly after payment confirmation.
// // // // // //               </p>
// // // // // //             </div>

// // // // // //             <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_294px] gap-5 items-start">
// // // // // //               <div className="space-y-5 min-w-0">

// // // // // //                 {/* ── Balance card ── */}
// // // // // //                 <div className="relative overflow-hidden border border-white/10"
// // // // // //                   style={{ minHeight: 284, borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// // // // // //                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />
// // // // // //                   <div className="relative z-10 p-8">
// // // // // //                     <p style={{ fontFamily: fontBase, fontWeight: 600, fontSize: 12, letterSpacing: "1.2px", color: "#C084FC", textTransform: "uppercase" }}>
// // // // // //                       Current Balance
// // // // // //                     </p>
// // // // // //                     <h2 className="mt-5 text-white" style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 60, lineHeight: "60px" }}>
// // // // // //                       {walletLoading ? "Loading..." : `₹ ${fmt(availableBalance)}`}
// // // // // //                     </h2>
// // // // // //                     <div className="mt-12 h-px w-full bg-white/10" />
// // // // // //                     <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
// // // // // //                       <div>
// // // // // //                         <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Total Earning</p>
// // // // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, color: "#FFFFFF" }}>
// // // // // //                           {walletLoading ? "—" : `₹${fmt(totalEarning)}`}
// // // // // //                         </p>
// // // // // //                       </div>
// // // // // //                       <div>
// // // // // //                         <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Monthly Earnings</p>
// // // // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, color: "#ADC6FF" }}>
// // // // // //                           {walletLoading ? "—" : `₹${fmt(monthlyEarning)}`}
// // // // // //                         </p>
// // // // // //                       </div>
// // // // // //                     </div>
// // // // // //                   </div>
// // // // // //                 </div>

// // // // // //                 {/* ── Payment method + inputs ── */}
// // // // // //                 <div className="relative self-start overflow-hidden border border-white/10"
// // // // // //                   style={{ height: "fit-content", borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// // // // // //                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_55%,rgba(255,20,239,0.28),transparent_50%)]" />
// // // // // //                   <div className="relative z-10 p-8">

// // // // // //                     <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>
// // // // // //                       Select Payment Method
// // // // // //                     </p>

// // // // // //                     {/* ── Method tabs ── */}
// // // // // //                     <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-7">
// // // // // //                       {paymentMethods.map((method) => {
// // // // // //                         const active = selectedMethod === method.id;
// // // // // //                         return (
// // // // // //                           <button key={method.id} type="button"
// // // // // //                             onClick={() => { setSelectedMethod(method.id); setPaymentError(""); setPaymentSuccess(""); }}
// // // // // //                             className="flex h-[125px] flex-col items-center justify-center rounded-[10px] border text-center"
// // // // // //                             style={{
// // // // // //                               background:   active ? "rgba(23,23,26,0.72)" : "rgba(255,255,255,0.06)",
// // // // // //                               borderColor:  active ? "#FF14EF" : "rgba(255,255,255,0.08)",
// // // // // //                               boxShadow:    active ? "inset -1px 0 0 #1A73E8" : "none",
// // // // // //                             }}>
// // // // // //                             <img src={method.icon} alt="" style={iconStyle} onError={(e) => { e.currentTarget.style.display = "none"; }} />
// // // // // //                             <p className="mt-5" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>{method.title}</p>
// // // // // //                             <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{method.subtitle}</p>
// // // // // //                           </button>
// // // // // //                         );
// // // // // //                       })}
// // // // // //                     </div>

// // // // // //                     {/* ── Amount input ── */}
// // // // // //                     <div className="mt-9">
// // // // // //                       <label style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>Enter amount</label>
// // // // // //                       <div className="mt-5 flex items-center px-8"
// // // // // //                         style={{ width: "min(546px, 100%)", height: 60, borderRadius: 16, background: "#18181B80", border: "1px solid #FFFFFF1A" }}>
// // // // // //                         <div className="flex min-w-0 flex-1 items-center gap-4">
// // // // // //                           <span style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 34, color: "#C084FC" }}>₹</span>
// // // // // //                           <input
// // // // // //                             value={amount}
// // // // // //                             onChange={(e) => { setAmount(e.target.value.replace(/[^\d]/g, "")); setPaymentError(""); setPaymentSuccess(""); }}
// // // // // //                             placeholder="0.00" inputMode="numeric"
// // // // // //                             className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/10"
// // // // // //                             style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 34, color: "#FFFFFF" }}
// // // // // //                           />
// // // // // //                         </div>
// // // // // //                       </div>
// // // // // //                       <div className="mt-5 flex items-center gap-2">
// // // // // //                         <Info className="h-4 w-4 text-[#71717A]" />
// // // // // //                         <span style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "#71717A" }}>
// // // // // //                           Minimum add: ₹100. Maximum: ₹1,00,000 per transaction.
// // // // // //                         </span>
// // // // // //                       </div>
// // // // // //                       <div className="mt-5 flex flex-nowrap gap-4 overflow-x-auto pb-1">
// // // // // //                         {quickAmounts.map((value) => (
// // // // // //                           <button key={value} type="button"
// // // // // //                             onClick={() => { setAmount(String(value)); setPaymentError(""); setPaymentSuccess(""); }}
// // // // // //                             className="h-[40px] shrink-0 rounded-[8px] border border-white/10 px-7"
// // // // // //                             style={{ background: "#18181B80", ...quickAmountTextStyle }}>
// // // // // //                             ₹{value}
// // // // // //                           </button>
// // // // // //                         ))}
// // // // // //                       </div>
// // // // // //                     </div>

// // // // // //                     {/* ── UPI Section ── */}
// // // // // //                     {selectedMethod === "upi" && (
// // // // // //                       <div className="mt-7">
// // // // // //                         <label style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>
// // // // // //                           UPI ID{" "}
// // // // // //                           <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>(optional — enter to prefill)</span>
// // // // // //                         </label>

// // // // // //                         {/* UPI input + verify button */}
// // // // // //                         <div className="mt-5 flex items-center gap-3" style={{ width: "min(546px, 100%)" }}>
// // // // // //                           <div className="relative flex-1">
// // // // // //                             <input
// // // // // //                               value={upiId}
// // // // // //                               onChange={(e) => { setUpiId(e.target.value); setPaymentError(""); }}
// // // // // //                               placeholder="yourname@upi"
// // // // // //                               className="w-full px-5 outline-none placeholder:text-white/35"
// // // // // //                               style={{
// // // // // //                                 height: 50, borderRadius: 16,
// // // // // //                                 background: "#30302E",
// // // // // //                                 border: `1px solid ${upiStatus === "valid" ? "rgba(74,222,128,0.5)" : upiStatus === "invalid" ? "rgba(248,113,113,0.5)" : "#FFFFFF1A"}`,
// // // // // //                                 fontFamily: fontBase, fontWeight: 400, fontSize: 18, color: "#FFFFFF",
// // // // // //                                 paddingRight: upiStatus !== "idle" ? "40px" : "16px",
// // // // // //                               }}
// // // // // //                             />
// // // // // //                             {/* Status icon inside input */}
// // // // // //                             {upiStatus === "valid" && (
// // // // // //                               <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "#4ade80" }} />
// // // // // //                             )}
// // // // // //                             {upiStatus === "invalid" && (
// // // // // //                               <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "#f87171" }} />
// // // // // //                             )}
// // // // // //                             {upiStatus === "verifying" && (
// // // // // //                               <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" style={{ color: "#71717A" }} />
// // // // // //                             )}
// // // // // //                           </div>

// // // // // //                           {/* Verify Button */}
// // // // // //                           <button
// // // // // //                             type="button"
// // // // // //                             onClick={handleVerifyUpi}
// // // // // //                             disabled={!upiId.trim() || upiStatus === "verifying"}
// // // // // //                             className="h-[50px] shrink-0 rounded-[12px] px-5 text-white disabled:opacity-40 transition-opacity"
// // // // // //                             style={{
// // // // // //                               background: upiStatus === "valid"
// // // // // //                                 ? "linear-gradient(270deg,#4ade80 0%,#22c55e 100%)"
// // // // // //                                 : "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
// // // // // //                               fontFamily: fontBase, fontWeight: 700, fontSize: 13,
// // // // // //                             }}
// // // // // //                           >
// // // // // //                             {upiStatus === "verifying" ? "Verifying..." : upiStatus === "valid" ? "✓ Verified" : "Verify UPI"}
// // // // // //                           </button>
// // // // // //                         </div>

// // // // // //                         {/* UPI status messages */}
// // // // // //                         {upiStatus === "valid" && (
// // // // // //                           <div className="mt-3 flex items-center gap-2">
// // // // // //                             <CheckCircle2 className="h-4 w-4" style={{ color: "#4ade80" }} />
// // // // // //                             <span style={{ fontFamily: fontBase, fontWeight: 500, fontSize: 13, color: "#4ade80" }}>
// // // // // //                               UPI ID verified{upiName ? ` — ${upiName}` : ""}
// // // // // //                             </span>
// // // // // //                           </div>
// // // // // //                         )}
// // // // // //                         {upiStatus === "invalid" && upiError && (
// // // // // //                           <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 13, color: "#f87171" }}>
// // // // // //                             {upiError}
// // // // // //                           </p>
// // // // // //                         )}

// // // // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
// // // // // //                           UPI ID optional hai — Razorpay checkout mein Google Pay, PhonePe, BHIM sab options milenge.
// // // // // //                         </p>
// // // // // //                       </div>
// // // // // //                     )}

// // // // // //                     {/* ── Net Banking ── */}
// // // // // //                     {selectedMethod === "netbanking" && (
// // // // // //                       <div className="mt-7 rounded-[14px] border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.05)" }}>
// // // // // //                         <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>Net Banking</p>
// // // // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, lineHeight: "18px", color: "#71717A" }}>
// // // // // //                           Razorpay checkout mein apna bank choose karo. Redirect hoke payment complete karo.
// // // // // //                         </p>
// // // // // //                       </div>
// // // // // //                     )}

// // // // // //                     {/* ── Card: Saved bank accounts ── */}
// // // // // //                     {selectedMethod === "card" && (
// // // // // //                       <div className="mt-7">
// // // // // //                         <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>
// // // // // //                           Select Saved Bank Account
// // // // // //                         </p>
// // // // // //                         <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
// // // // // //                           Bank transfer request bheja jayega — 1-2 business days mein credit hoga.
// // // // // //                         </p>

// // // // // //                         {accounts.length === 0 ? (
// // // // // //                           <div className="mt-4 rounded-[14px] border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.05)" }}>
// // // // // //                             <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
// // // // // //                               Koi saved account nahi hai.{" "}
// // // // // //                               <button type="button" onClick={() => navigate("/wallet")}
// // // // // //                                 style={{ color: "#C084FC", textDecoration: "underline" }}>
// // // // // //                                 Wallet se add karo
// // // // // //                               </button>
// // // // // //                             </p>
// // // // // //                           </div>
// // // // // //                         ) : (
// // // // // //                           <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
// // // // // //                             {accounts.map((account) => {
// // // // // //                               const active = selectedAccountId === account.id;
// // // // // //                               return (
// // // // // //                                 <button key={account.id} type="button"
// // // // // //                                   onClick={() => { setSelectedAccountId(account.id); setPaymentError(""); }}
// // // // // //                                   className="flex h-[80px] items-center gap-4 rounded-[12px] border px-4 text-left transition-all"
// // // // // //                                   style={{
// // // // // //                                     background:  active ? "rgba(23,23,26,0.72)" : "rgba(255,255,255,0.05)",
// // // // // //                                     borderColor: active ? "#FF14EF" : "rgba(255,255,255,0.10)",
// // // // // //                                     boxShadow:   active ? "inset -1px 0 0 #1A73E8" : "none",
// // // // // //                                   }}>
// // // // // //                                   <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1A73E8]/20">
// // // // // //                                     <Landmark className="h-5 w-5 text-[#1A73E8]" />
// // // // // //                                   </div>
// // // // // //                                   <div className="min-w-0 flex-1">
// // // // // //                                     <p className="truncate text-white" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14 }}>
// // // // // //                                       {account.name}
// // // // // //                                     </p>
// // // // // //                                     <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
// // // // // //                                       •••• {account.last4}
// // // // // //                                     </p>
// // // // // //                                   </div>
// // // // // //                                   {active && (
// // // // // //                                     <div className="h-4 w-4 shrink-0 rounded-full border-2 border-[#FF14EF] bg-[#FF14EF]" />
// // // // // //                                   )}
// // // // // //                                 </button>
// // // // // //                               );
// // // // // //                             })}
// // // // // //                           </div>
// // // // // //                         )}

// // // // // //                         <button type="button" onClick={() => navigate("/wallet")}
// // // // // //                           className="mt-4 flex h-[44px] items-center gap-2 rounded-[10px] border border-dashed border-white/20 px-4"
// // // // // //                           style={{ background: "rgba(255,255,255,0.04)" }}>
// // // // // //                           <span style={{ width: 14, height: 14, display: "inline-block", backgroundColor: "#A1A1AA", WebkitMask: "url('/icons/pluss.svg') center / contain no-repeat", mask: "url('/icons/pluss.svg') center / contain no-repeat" }} />
// // // // // //                           <span style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>
// // // // // //                             Add New Account
// // // // // //                           </span>
// // // // // //                         </button>
// // // // // //                       </div>
// // // // // //                     )}

// // // // // //                   </div>
// // // // // //                 </div>
// // // // // //               </div>

// // // // // //               {/* ── Transaction Summary sidebar ── */}
// // // // // //               <aside className="relative min-w-0 self-start overflow-hidden border border-white/10"
// // // // // //                 style={{ width: "100%", minHeight: 471, height: "fit-content", borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// // // // // //                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_90%,rgba(255,20,239,0.17),transparent_55%)]" />
// // // // // //                 <div className="relative z-10 p-8">
// // // // // //                   <h3 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 18, color: "#FFFFFF" }}>Transaction Summary</h3>
// // // // // //                   <div className="mt-8 space-y-7">
// // // // // //                     <div className="flex items-center justify-between gap-4">
// // // // // //                       <span style={summaryLabelStyle}>Subtotal</span>
// // // // // //                       <span style={summaryValueStyle}>₹{addAmount.toFixed(2)}</span>
// // // // // //                     </div>
// // // // // //                     <div className="flex items-center justify-between gap-4">
// // // // // //                       <span style={summaryLabelStyle}>
// // // // // //                         {selectedMethod === "card" ? "Service Fee" : "Service Fee (2%)"}
// // // // // //                       </span>
// // // // // //                       <span style={summaryValueStyle}>
// // // // // //                         {selectedMethod === "card" ? "₹0.00" : `₹${serviceFee.toFixed(2)}`}
// // // // // //                       </span>
// // // // // //                     </div>
// // // // // //                     <div className="h-px w-full bg-white/10" />
// // // // // //                     <div className="flex items-center justify-between gap-3 min-w-0">
// // // // // //                       <span style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 20, color: "#FFFFFF", whiteSpace: "nowrap", flexShrink: 0 }}>
// // // // // //                         {selectedMethod === "card" ? "Transfer Amount" : "Debit Amount"}
// // // // // //                       </span>
// // // // // //                       <span style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 16, color: "#C084FC", whiteSpace: "nowrap", textAlign: "right" }}>
// // // // // //                         ₹{selectedMethod === "card" ? addAmount.toFixed(2) : Math.max(debitAmount, 0).toFixed(2)}
// // // // // //                       </span>
// // // // // //                     </div>
// // // // // //                   </div>

// // // // // //                   <div className="mt-8 flex gap-3 rounded-[14px] p-4" style={{ background: "rgba(3,4,5,0.35)" }}>
// // // // // //                     <img src="/icons/locky.svg" alt="" className="mt-1 h-5 w-5 shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
// // // // // //                     <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "#71717A" }}>
// // // // // //                       {selectedMethod === "card"
// // // // // //                         ? "Bank transfer request bheja jayega. Verification ke baad 1-2 business days mein credit hoga."
// // // // // //                         : "Payment secured with end-to-end encryption. Funds appear instantly after confirmation."}
// // // // // //                     </p>
// // // // // //                   </div>

// // // // // //                   {paymentError && (
// // // // // //                     <div className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white"
// // // // // //                       style={{ background: "#2A1717", borderColor: "rgba(239,68,68,0.35)" }}>
// // // // // //                       {paymentError}
// // // // // //                     </div>
// // // // // //                   )}
// // // // // //                   {paymentSuccess && (
// // // // // //                     <div className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white"
// // // // // //                       style={{ background: "#052A1D", borderColor: "rgba(74,222,128,0.35)" }}>
// // // // // //                       {paymentSuccess}
// // // // // //                     </div>
// // // // // //                   )}

// // // // // //                   <button
// // // // // //                     type="button"
// // // // // //                     disabled={
// // // // // //                       !addAmount ||
// // // // // //                       payLoading ||
// // // // // //                       (selectedMethod === "card" && !selectedAccountId) ||
// // // // // //                       (selectedMethod === "upi" && upiId.trim() !== "" && (upiStatus === "invalid" || upiStatus === "verifying"))
// // // // // //                     }
// // // // // //                     onClick={handleConfirmAddFunds}
// // // // // //                     className="mt-8 h-[49px] w-full rounded-[8px] text-white disabled:opacity-50"
// // // // // //                     style={{ ...confirmButtonTextStyle, background: "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)" }}>
// // // // // //                     {payLoading
// // // // // //                       ? "Processing..."
// // // // // //                       : selectedMethod === "card"
// // // // // //                       ? "Submit Transfer Request"
// // // // // //                       : "Confirm & Add Funds"}
// // // // // //                   </button>
// // // // // //                 </div>
// // // // // //               </aside>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         </section>
// // // // // //       </main>

// // // // // //       <div className="relative z-10 mt-20"><Footer /></div>
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // export default AddFunds;



// // // // // // src/pages/AddFunds.tsx
// // // // // import { useEffect, useMemo, useState, useRef, type CSSProperties } from "react";
// // // // // import { useNavigate } from "react-router-dom";
// // // // // import Header from "@/components/Header";
// // // // // import Footer from "@/components/Footer";
// // // // // import { Info, Landmark, CheckCircle2, XCircle, Loader2, QrCode, RefreshCw } from "lucide-react";
// // // // // import { useAuth } from "@/contexts/AuthContext";

// // // // // declare global {
// // // // //   interface Window { Razorpay: any; }
// // // // // }

// // // // // type PaymentMethod = "upi" | "netbanking" | "qr" | "card";
// // // // // type WalletAccount = { id: string; name: string; last4: string; ifsc?: string; };
// // // // // type UpiStatus = "idle" | "verifying" | "valid" | "invalid";

// // // // // // ─────────────────────────────────────────────────────────────
// // // // // // FIX 1: Razorpay config — show_default_blocks:false test mode
// // // // // // mein "No appropriate payment method" error deta hai.
// // // // // // Sahi approach: DEFAULT blocks ON rakho, par method restrict
// // // // // // karo `method` field se + hidden array se baaki hide karo.
// // // // // // ─────────────────────────────────────────────────────────────
// // // // // const buildRazorpayConfig = (method: "upi" | "netbanking") => {
// // // // //   if (method === "upi") {
// // // // //     return {
// // // // //       display: {
// // // // //         blocks: {
// // // // //           utib0: {
// // // // //             // Custom block — UPI first
// // // // //             name: "Pay via UPI",
// // // // //             instruments: [
// // // // //               { method: "upi", flows: ["collect", "intent", "qr"] },
// // // // //             ],
// // // // //           },
// // // // //         },
// // // // //         // ─── KEY FIX: show_default_blocks:true rakho taaki
// // // // //         //     test mode mein bhi UPI options visible rahen ───
// // // // //         sequence: ["block.utib0"],
// // // // //         preferences: { show_default_blocks: true },
// // // // //       },
// // // // //       // Hide everything except UPI
// // // // //       hidden: [
// // // // //         { method: "card" },
// // // // //         { method: "netbanking" },
// // // // //         { method: "wallet" },
// // // // //         { method: "paylater" },
// // // // //         { method: "emi" },
// // // // //       ],
// // // // //     };
// // // // //   }

// // // // //   // netbanking
// // // // //   return {
// // // // //     display: {
// // // // //       blocks: {
// // // // //         nb0: {
// // // // //           name: "Pay via Net Banking",
// // // // //           instruments: [{ method: "netbanking" }],
// // // // //         },
// // // // //       },
// // // // //       sequence: ["block.nb0"],
// // // // //       preferences: { show_default_blocks: true },
// // // // //     },
// // // // //     hidden: [
// // // // //       { method: "card" },
// // // // //       { method: "upi" },
// // // // //       { method: "wallet" },
// // // // //       { method: "paylater" },
// // // // //       { method: "emi" },
// // // // //     ],
// // // // //   };
// // // // // };

// // // // // const AddFunds = () => {
// // // // //   const navigate = useNavigate();
// // // // //   const { token, user } = useAuth() as any;

// // // // //   const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";
// // // // //   const fontBase = "Inter, system-ui, Arial, sans-serif";

// // // // //   const CREATE_ORDER_URL   = `${API_BASE}/api/wallet/add-fund/create-order`;
// // // // //   const VERIFY_PAYMENT_URL = `${API_BASE}/api/wallet/add-fund/verify`;
// // // // //   const WALLET_BALANCE_URL = `${API_BASE}/api/wallet/balance`;
// // // // //   const BANK_LIST_URL      = `${API_BASE}/api/bankaccount`;
// // // // //   const BANK_TRANSFER_URL  = `${API_BASE}/api/wallet/add-fund/bank-transfer`;
// // // // //   const UPI_VALIDATE_URL   = `${API_BASE}/api/wallet/upi/validate`;

// // // // //   const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
// // // // //   const [amount, setAmount]   = useState("");
// // // // //   const [upiId, setUpiId]     = useState("");

// // // // //   // UPI verification state
// // // // //   const [upiStatus, setUpiStatus]   = useState<UpiStatus>("idle");
// // // // //   const [upiError, setUpiError]     = useState("");
// // // // //   const [upiName, setUpiName]       = useState("");

// // // // //   const [availableBalance, setAvailableBalance] = useState(0);
// // // // //   const [totalEarning, setTotalEarning]         = useState(0);
// // // // //   const [monthlyEarning, setMonthlyEarning]     = useState(0);
// // // // //   const [walletLoading, setWalletLoading]       = useState(false);

// // // // //   const [accounts, setAccounts]                   = useState<WalletAccount[]>([]);
// // // // //   const [selectedAccountId, setSelectedAccountId] = useState<string>("");

// // // // //   const [payLoading, setPayLoading]         = useState(false);
// // // // //   const [paymentError, setPaymentError]     = useState("");
// // // // //   const [paymentSuccess, setPaymentSuccess] = useState("");

// // // // //   // ─── QR flow state ───
// // // // //   const [qrLoading, setQrLoading]   = useState(false);
// // // // //   const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
// // // // //   const [qrOrderId, setQrOrderId]   = useState<string>("");
// // // // //   const [qrTopupId, setQrTopupId]   = useState<string>("");
// // // // //   const qrPollingRef                = useRef<ReturnType<typeof setInterval> | null>(null);

// // // // //   const userStorageId = user?._id || user?.id || user?.email || "guest";
// // // // //   const WALLET_ACCOUNTS_KEY = useMemo(() => `tokun_wallet_accounts_${userStorageId}`, [userStorageId]);

// // // // //   const getAuthToken = () =>
// // // // //     token ||
// // // // //     localStorage.getItem("auth_token") ||
// // // // //     sessionStorage.getItem("auth_token") ||
// // // // //     localStorage.getItem("token") ||
// // // // //     sessionStorage.getItem("token") ||
// // // // //     "";

// // // // //   // ── Wallet balance fetch ──
// // // // //   const fetchWallet = async () => {
// // // // //     const authToken = getAuthToken();
// // // // //     if (!authToken) return;
// // // // //     try {
// // // // //       setWalletLoading(true);
// // // // //       const res  = await fetch(WALLET_BALANCE_URL, {
// // // // //         headers: { Authorization: `Bearer ${authToken}` },
// // // // //         credentials: "include",
// // // // //       });
// // // // //       const data = await res.json().catch(() => ({}));
// // // // //       if (res.ok && data.success) {
// // // // //         setAvailableBalance(Number(data.availableBalance || 0));
// // // // //         setTotalEarning(Number(data.totalRevenue || 0));
// // // // //         setMonthlyEarning(Number(data.monthlyEarning || 0));
// // // // //       }
// // // // //     } catch (err) {
// // // // //       console.error("wallet fetch error:", err);
// // // // //     } finally {
// // // // //       setWalletLoading(false);
// // // // //     }
// // // // //   };

// // // // //   // ── Saved bank accounts fetch ──
// // // // //   const fetchBankAccounts = async () => {
// // // // //     const authToken = getAuthToken();
// // // // //     try {
// // // // //       const raw = localStorage.getItem(WALLET_ACCOUNTS_KEY);
// // // // //       if (raw) {
// // // // //         const parsed = JSON.parse(raw);
// // // // //         if (Array.isArray(parsed) && parsed.length) {
// // // // //           setAccounts(parsed);
// // // // //           setSelectedAccountId((prev) => prev || parsed[0].id);
// // // // //         }
// // // // //       }
// // // // //     } catch {}

// // // // //     if (!authToken) return;
// // // // //     try {
// // // // //       const res  = await fetch(BANK_LIST_URL, {
// // // // //         method: "GET",
// // // // //         headers: { Authorization: `Bearer ${authToken}` },
// // // // //         credentials: "include",
// // // // //       });
// // // // //       const data = await res.json().catch(() => ({}));
// // // // //       if (!res.ok || !Array.isArray(data?.accounts)) return;

// // // // //       const mapped: WalletAccount[] = data.accounts.map((ba: any) => ({
// // // // //         id:    String(ba?._id || ""),
// // // // //         name:  String(ba?.bankName || "Bank Account"),
// // // // //         last4: String(ba?.accountNumber || "").slice(-4) || "0000",
// // // // //         ifsc:  String(ba?.ifscCode || "").toUpperCase(),
// // // // //       }));

// // // // //       setAccounts(mapped);
// // // // //       if (mapped.length) setSelectedAccountId((prev) => prev || mapped[0].id);
// // // // //       localStorage.setItem(WALLET_ACCOUNTS_KEY, JSON.stringify(mapped));
// // // // //     } catch {}
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     fetchWallet();
// // // // //     fetchBankAccounts();
// // // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // // //   }, [token]);

// // // // //   // QR tab pe aane par clear karein old QR
// // // // //   useEffect(() => {
// // // // //     if (selectedMethod !== "qr") {
// // // // //       stopQrPolling();
// // // // //       setQrImageUrl(null);
// // // // //       setQrOrderId("");
// // // // //       setQrTopupId("");
// // // // //     }
// // // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // // //   }, [selectedMethod]);

// // // // //   // Cleanup on unmount
// // // // //   useEffect(() => {
// // // // //     return () => stopQrPolling();
// // // // //   }, []);

// // // // //   // Reset UPI status when UPI ID changes
// // // // //   useEffect(() => {
// // // // //     if (upiStatus !== "idle") {
// // // // //       setUpiStatus("idle");
// // // // //       setUpiError("");
// // // // //       setUpiName("");
// // // // //     }
// // // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // // //   }, [upiId]);

// // // // //   const addAmount   = Number(amount || 0);
// // // // //   const serviceFee  = addAmount > 0 && selectedMethod !== "card" ? +(addAmount * 0.02).toFixed(2) : 0;
// // // // //   const debitAmount = addAmount > 0 ? +(addAmount + serviceFee).toFixed(2) : 0;

// // // // //   const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);

// // // // //   // ─────────────────────────────────────────────────────────────
// // // // //   // QR FLOW
// // // // //   // ─────────────────────────────────────────────────────────────

// // // // //   const stopQrPolling = () => {
// // // // //     if (qrPollingRef.current) {
// // // // //       clearInterval(qrPollingRef.current);
// // // // //       qrPollingRef.current = null;
// // // // //     }
// // // // //   };

// // // // //   /**
// // // // //    * FIX 2 (QR flow):
// // // // //    * Razorpay mein UPI QR generate karne ke liye:
// // // // //    * 1. Normal order create karo (selectedMethod: "qr")
// // // // //    * 2. Razorpay checkout open karo with method: "upi" aur
// // // // //    *    upi: { flow: "qr" } — ye directly QR screen dikhata hai
// // // // //    * 3. Ya phir Razorpay Payment Links API se QR image generate karo
// // // // //    *    aur polling se verify karo
// // // // //    *
// // // // //    * Hum yahan Razorpay checkout ka "qr" flow use karenge —
// // // // //    * ye sabse reliable hai aur extra API nahi chahiye.
// // // // //    */
// // // // //   const handleGenerateQr = async () => {
// // // // //     setPaymentError("");
// // // // //     const authToken = getAuthToken();

// // // // //     if (!authToken)                    { setPaymentError("Please login first."); return; }
// // // // //     if (!addAmount || addAmount < 100) { setPaymentError("Minimum amount is ₹100 for QR payment."); return; }
// // // // //     if (addAmount > 100000)            { setPaymentError("Maximum ₹1,00,000 per transaction."); return; }
// // // // //     if (!window.Razorpay)              { setPaymentError("Razorpay not loaded. Check internet."); return; }

// // // // //     try {
// // // // //       setQrLoading(true);
// // // // //       setQrImageUrl(null);

// // // // //       // Create order with qr method
// // // // //       const res  = await fetch(CREATE_ORDER_URL, {
// // // // //         method: "POST",
// // // // //         headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // // // //         credentials: "include",
// // // // //         body: JSON.stringify({ amount: addAmount, selectedMethod: "qr" }),
// // // // //       });
// // // // //       const orderData = await res.json().catch(() => ({}));
// // // // //       if (!res.ok || !orderData.success) throw new Error(orderData.message || "Could not create QR order.");

// // // // //       const order = orderData?.order || {};
// // // // //       const orderId = String(order?.id || "");
// // // // //       const razorpayKey = String(orderData?.key || "");

// // // // //       setQrOrderId(orderId);
// // // // //       setQrTopupId(String(orderData?.topupId || ""));

// // // // //       // ─── Razorpay checkout with UPI QR flow ───
// // // // //       const cleanEmail   = String(user?.email || "").trim();
// // // // //       const cleanContact = String(user?.phone || user?.mobile || "").replace(/\D/g, "").slice(-10);
// // // // //       const cleanName    = String(user?.name || "").trim();

// // // // //       const prefill: Record<string, string> = {};
// // // // //       if (cleanName) prefill.name = cleanName;
// // // // //       if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) prefill.email = cleanEmail;
// // // // //       if (/^[6-9]\d{9}$/.test(cleanContact)) prefill.contact = cleanContact;

// // // // //       const options: any = {
// // // // //         key: razorpayKey,
// // // // //         order_id: orderId,
// // // // //         name: "Tokun",
// // // // //         description: "Add funds via QR",
// // // // //         image: "/favicon.ico",
// // // // //         prefill,
// // // // //         method: {
// // // // //           upi: true,
// // // // //           card: false,
// // // // //           netbanking: false,
// // // // //           wallet: false,
// // // // //           paylater: false,
// // // // //           emi: false,
// // // // //         },
// // // // //         config: {
// // // // //           display: {
// // // // //             blocks: {
// // // // //               qr_block: {
// // // // //                 name: "Scan QR Code",
// // // // //                 instruments: [
// // // // //                   { method: "upi", flows: ["qr"] },
// // // // //                 ],
// // // // //               },
// // // // //             },
// // // // //             sequence: ["block.qr_block"],
// // // // //             preferences: { show_default_blocks: false },
// // // // //           },
// // // // //         },
// // // // //         theme: { color: "#1A73E8" },
// // // // //         handler: async (response: any) => {
// // // // //           try {
// // // // //             setPayLoading(true);
// // // // //             const verifyRes = await fetch(VERIFY_PAYMENT_URL, {
// // // // //               method: "POST",
// // // // //               headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // // // //               credentials: "include",
// // // // //               body: JSON.stringify(response),
// // // // //             });
// // // // //             const verifyData = await verifyRes.json().catch(() => ({}));
// // // // //             if (!verifyRes.ok || !verifyData.success) throw new Error(verifyData.message || "Verification failed.");

// // // // //             setPaymentSuccess("QR payment successful! Wallet updated.");
// // // // //             stopQrPolling();
// // // // //             setQrImageUrl(null);
// // // // //             await fetchWallet();
// // // // //             setTimeout(() => navigate("/wallet"), 1500);
// // // // //           } catch (err: any) {
// // // // //             setPaymentError(err?.message || "Payment verification failed.");
// // // // //           } finally {
// // // // //             setPayLoading(false);
// // // // //           }
// // // // //         },
// // // // //         modal: { ondismiss: () => { setQrLoading(false); stopQrPolling(); } },
// // // // //       };

// // // // //       const razorpay = new window.Razorpay(options);
// // // // //       razorpay.on("payment.failed", (response: any) => {
// // // // //         setPaymentError(response?.error?.description || "QR payment failed.");
// // // // //         setQrLoading(false);
// // // // //         stopQrPolling();
// // // // //       });
// // // // //       razorpay.open();

// // // // //     } catch (err: any) {
// // // // //       console.error("[QR] error:", err);
// // // // //       setPaymentError(err?.message || "Could not generate QR.");
// // // // //     } finally {
// // // // //       setQrLoading(false);
// // // // //     }
// // // // //   };

// // // // //   // ─────────────────────────────────────────────────────────────
// // // // //   // UPI Verify Handler
// // // // //   // ─────────────────────────────────────────────────────────────
// // // // //   const handleVerifyUpi = async () => {
// // // // //     if (!upiId.trim()) {
// // // // //       setUpiError("Please enter a UPI ID first.");
// // // // //       return;
// // // // //     }

// // // // //     const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
// // // // //     if (!vpaRegex.test(upiId.trim().toLowerCase())) {
// // // // //       setUpiStatus("invalid");
// // // // //       setUpiError("Invalid UPI ID format. Example: name@upi");
// // // // //       setUpiName("");
// // // // //       return;
// // // // //     }

// // // // //     try {
// // // // //       setUpiStatus("verifying");
// // // // //       setUpiError("");
// // // // //       setUpiName("");

// // // // //       const authToken = getAuthToken();
// // // // //       const res  = await fetch(UPI_VALIDATE_URL, {
// // // // //         method: "POST",
// // // // //         headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // // // //         credentials: "include",
// // // // //         body: JSON.stringify({ vpa: upiId.trim() }),
// // // // //       });
// // // // //       const data = await res.json().catch(() => ({}));

// // // // //       if (!res.ok || !data.success || data.error === "invalid_vpa") {
// // // // //         setUpiStatus("invalid");
// // // // //         setUpiError(data.message || "UPI ID is invalid or does not exist.");
// // // // //         return;
// // // // //       }

// // // // //       setUpiStatus("valid");
// // // // //       // ─── FIX 3: Backend se aane wala name set karo ───
// // // // //       if (data.name) {
// // // // //         setUpiName(data.name);
// // // // //       } else if (data.note === "format_only_verified") {
// // // // //         // Test mode mein name nahi aata — user ko batao
// // // // //         setUpiName("(Name unavailable in test mode)");
// // // // //       }
// // // // //     } catch (err: any) {
// // // // //       setUpiStatus("invalid");
// // // // //       setUpiError("Could not verify UPI ID. Please try again.");
// // // // //     }
// // // // //   };

// // // // //   // ─────────────────────────────────────────────────────────────
// // // // //   // Razorpay order create
// // // // //   // ─────────────────────────────────────────────────────────────
// // // // //   const createAddFundOrder = async () => {
// // // // //     const authToken = getAuthToken();
// // // // //     const res  = await fetch(CREATE_ORDER_URL, {
// // // // //       method: "POST",
// // // // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // // // //       credentials: "include",
// // // // //       body: JSON.stringify({ amount: addAmount, selectedMethod }),
// // // // //     });
// // // // //     const data = await res.json().catch(() => ({}));
// // // // //     if (!res.ok || !data.success) throw new Error(data.message || "Could not create payment order.");
// // // // //     return data;
// // // // //   };

// // // // //   const verifyAddFundPayment = async (razorpayResponse: any) => {
// // // // //     const authToken = getAuthToken();
// // // // //     const res  = await fetch(VERIFY_PAYMENT_URL, {
// // // // //       method: "POST",
// // // // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // // // //       credentials: "include",
// // // // //       body: JSON.stringify(razorpayResponse),
// // // // //     });
// // // // //     const data = await res.json().catch(() => ({}));
// // // // //     if (!res.ok || !data.success) throw new Error(data.message || "Payment verification failed.");
// // // // //     return data;
// // // // //   };

// // // // //   // ─────────────────────────────────────────────────────────────
// // // // //   // Main payment handler (UPI / NetBanking)
// // // // //   // ─────────────────────────────────────────────────────────────
// // // // //   const handleConfirmAddFunds = async () => {
// // // // //     setPaymentError("");
// // // // //     setPaymentSuccess("");

// // // // //     const authToken = getAuthToken();
// // // // //     if (!authToken)              { setPaymentError("Please login first."); return; }
// // // // //     if (!addAmount || Number.isNaN(addAmount)) { setPaymentError("Please enter amount."); return; }
// // // // //     if (addAmount < 100)         { setPaymentError("Minimum add amount is ₹100."); return; }
// // // // //     if (addAmount > 100000)      { setPaymentError("Maximum amount is ₹1,00,000 per transaction."); return; }

// // // // //     // ── QR flow — handled by handleGenerateQr separately ──
// // // // //     if (selectedMethod === "qr") {
// // // // //       return handleGenerateQr();
// // // // //     }

// // // // //     // ── CARD flow: saved bank account ──
// // // // //     if (selectedMethod === "card") {
// // // // //       if (!selectedAccountId) {
// // // // //         setPaymentError("Please select a saved bank account.");
// // // // //         return;
// // // // //       }
// // // // //       try {
// // // // //         setPayLoading(true);
// // // // //         const res  = await fetch(BANK_TRANSFER_URL, {
// // // // //           method: "POST",
// // // // //           headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // // // //           credentials: "include",
// // // // //           body: JSON.stringify({ amount: addAmount, bankAccountId: selectedAccountId }),
// // // // //         });
// // // // //         const data = await res.json().catch(() => ({}));
// // // // //         if (!res.ok || !data.success) throw new Error(data.message || "Could not process request.");

// // // // //         setPaymentSuccess("Bank transfer request submitted! Funds will be credited after verification (1-2 business days).");
// // // // //         setAmount("");
// // // // //         await fetchWallet();
// // // // //         setTimeout(() => navigate("/wallet"), 2500);
// // // // //       } catch (err: any) {
// // // // //         setPaymentError(err?.message || "Could not process bank transfer.");
// // // // //       } finally {
// // // // //         setPayLoading(false);
// // // // //       }
// // // // //       return;
// // // // //     }

// // // // //     // ── UPI / NetBanking flow: Razorpay ──
// // // // //     if (!window.Razorpay) {
// // // // //       setPaymentError("Razorpay not loaded. Please check your internet connection.");
// // // // //       return;
// // // // //     }

// // // // //     if (selectedMethod === "upi" && upiId.trim()) {
// // // // //       if (upiStatus === "idle") {
// // // // //         setPaymentError("Please verify your UPI ID before proceeding.");
// // // // //         return;
// // // // //       }
// // // // //       if (upiStatus === "invalid") {
// // // // //         setPaymentError("Invalid UPI ID. Please enter a valid UPI ID.");
// // // // //         return;
// // // // //       }
// // // // //       if (upiStatus === "verifying") {
// // // // //         setPaymentError("UPI verification in progress. Please wait.");
// // // // //         return;
// // // // //       }
// // // // //     }

// // // // //     try {
// // // // //       setPayLoading(true);
// // // // //       const orderData = await createAddFundOrder();

// // // // //       const order = orderData?.order || {};
// // // // //       const orderId = String(order?.id || "");
// // // // //       const razorpayKey = String(orderData?.key || "");

// // // // //       if (!razorpayKey.startsWith("rzp_")) throw new Error("Invalid Razorpay key received from server.");
// // // // //       if (!orderId.startsWith("order_"))   throw new Error("Invalid Razorpay order received from server.");

// // // // //       const cleanEmail   = String(user?.email || "").trim();
// // // // //       const cleanContact = String(user?.phone || user?.mobile || "").replace(/\D/g, "").slice(-10);
// // // // //       const cleanName    = String(user?.name || "").trim();

// // // // //       const prefill: Record<string, string> = {};
// // // // //       if (cleanName) prefill.name = cleanName;
// // // // //       if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) prefill.email = cleanEmail;
// // // // //       if (/^[6-9]\d{9}$/.test(cleanContact)) prefill.contact = cleanContact;

// // // // //       if (selectedMethod === "upi" && upiId.trim() && upiStatus === "valid") {
// // // // //         prefill.vpa = upiId.trim();
// // // // //       }

// // // // //       const options: any = {
// // // // //         key: razorpayKey,
// // // // //         order_id: orderId,
// // // // //         name: "Tokun",
// // // // //         description: selectedMethod === "upi" ? "Add funds via UPI" : "Add funds via Net Banking",
// // // // //         image: "/favicon.ico",
// // // // //         prefill,
// // // // //         notes: {
// // // // //           purpose: "wallet_topup",
// // // // //           selectedMethod: String(selectedMethod),
// // // // //           walletAmount: String(addAmount),
// // // // //         },
// // // // //         theme: { color: "#1A73E8" },
// // // // //         // ─── FIX 1 applied here ───
// // // // //         config: buildRazorpayConfig(selectedMethod as "upi" | "netbanking"),
// // // // //         handler: async (response: any) => {
// // // // //           try {
// // // // //             setPayLoading(true);
// // // // //             await verifyAddFundPayment(response);
// // // // //             setPaymentSuccess("Payment successful! Wallet updated.");
// // // // //             await fetchWallet();
// // // // //             setTimeout(() => navigate("/wallet"), 1200);
// // // // //           } catch (err: any) {
// // // // //             setPaymentError(err?.message || "Payment verification failed.");
// // // // //           } finally {
// // // // //             setPayLoading(false);
// // // // //           }
// // // // //         },
// // // // //         modal: { ondismiss: () => setPayLoading(false) },
// // // // //       };

// // // // //       const razorpay = new window.Razorpay(options);
// // // // //       razorpay.on("payment.failed", (response: any) => {
// // // // //         setPaymentError(
// // // // //           response?.error?.description || response?.error?.reason || "Payment failed. Please try again."
// // // // //         );
// // // // //         setPayLoading(false);
// // // // //       });
// // // // //       razorpay.open();

// // // // //     } catch (err: any) {
// // // // //       console.error("[AddFunds] error:", err);
// // // // //       setPaymentError(err?.message || "Could not start payment.");
// // // // //       setPayLoading(false);
// // // // //     }
// // // // //   };

// // // // //   // ── Styles ──
// // // // //   const confirmButtonTextStyle: CSSProperties = {
// // // // //     fontFamily: fontBase, fontWeight: 700, fontSize: 16, lineHeight: "100%", textAlign: "center",
// // // // //   };
// // // // //   const summaryLabelStyle: CSSProperties = {
// // // // //     fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "#71717A", whiteSpace: "nowrap",
// // // // //   };
// // // // //   const summaryValueStyle: CSSProperties = {
// // // // //     fontFamily: fontBase, fontWeight: 500, fontSize: 14, color: "#FFFFFF", whiteSpace: "nowrap",
// // // // //   };
// // // // //   const quickAmountTextStyle: CSSProperties = {
// // // // //     fontFamily: fontBase, fontWeight: 500, fontSize: 18, textAlign: "center", color: "#FFFFFF",
// // // // //   };
// // // // //   const iconStyle: CSSProperties = {
// // // // //     width: 40, height: 40, opacity: 1, objectFit: "contain", display: "block",
// // // // //   };

// // // // //   const paymentMethods = [
// // // // //     { id: "upi"        as PaymentMethod, title: "UPI",         subtitle: "Instant",         icon: "/icons/upi.svg" },
// // // // //     { id: "netbanking" as PaymentMethod, title: "Net Banking",  subtitle: "2-3 mins",        icon: "/icons/netbanking.svg" },
// // // // //     { id: "qr"         as PaymentMethod, title: "Scan QR",      subtitle: "Any UPI App",     icon: "/icons/upi.svg" },
// // // // //     { id: "card"       as PaymentMethod, title: "Bank Account", subtitle: "Saved Accounts",  icon: "/icons/addcard.svg" },
// // // // //   ];
// // // // //   const quickAmounts = [100, 200, 500, 2000];

// // // // //   const isConfirmDisabled =
// // // // //     !addAmount ||
// // // // //     payLoading ||
// // // // //     (selectedMethod === "card" && !selectedAccountId) ||
// // // // //     (selectedMethod === "upi" && upiId.trim() !== "" && (upiStatus === "invalid" || upiStatus === "verifying"));

// // // // //   return (
// // // // //     <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
// // // // //       <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
// // // // //         <img src="/icons/mpbg.png" alt="background" className="absolute inset-0 w-full h-screen object-contain object-top select-none" />
// // // // //       </div>
// // // // //       <div className="relative z-20 w-full bg-transparent px-4"><Header /></div>

// // // // //       <main className="relative z-10 px-4 pt-[95px] pb-20">
// // // // //         <section className="mx-auto overflow-hidden"
// // // // //           style={{ width: "min(1024px, 100%)", minHeight: 1269, borderRadius: 30, background: "#21212180", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", fontFamily: fontBase }}>
// // // // //           <div className="p-8 sm:p-[50px]">

// // // // //             <button type="button" onClick={() => navigate("/wallet")} className="inline-flex items-center gap-2"
// // // // //               style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#C084FC" }}>
// // // // //               ← Back to Wallet
// // // // //             </button>

// // // // //             <div className="mt-4">
// // // // //               <h1 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 36, lineHeight: "100%", color: "#FFFFFF" }}>Add Funds</h1>
// // // // //               <p className="mt-4 max-w-[590px]" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 16, lineHeight: "24px", color: "#A1A1AA" }}>
// // // // //                 Add money to your wallet using UPI, Net Banking, QR code or saved bank accounts.<br />
// // // // //                 Funds appear instantly after payment confirmation.
// // // // //               </p>
// // // // //             </div>

// // // // //             <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_294px] gap-5 items-start">
// // // // //               <div className="space-y-5 min-w-0">

// // // // //                 {/* ── Balance card ── */}
// // // // //                 <div className="relative overflow-hidden border border-white/10"
// // // // //                   style={{ minHeight: 284, borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// // // // //                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />
// // // // //                   <div className="relative z-10 p-8">
// // // // //                     <p style={{ fontFamily: fontBase, fontWeight: 600, fontSize: 12, letterSpacing: "1.2px", color: "#C084FC", textTransform: "uppercase" }}>
// // // // //                       Current Balance
// // // // //                     </p>
// // // // //                     <h2 className="mt-5 text-white" style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 60, lineHeight: "60px" }}>
// // // // //                       {walletLoading ? "Loading..." : `₹ ${fmt(availableBalance)}`}
// // // // //                     </h2>
// // // // //                     <div className="mt-12 h-px w-full bg-white/10" />
// // // // //                     <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
// // // // //                       <div>
// // // // //                         <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Total Earning</p>
// // // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, color: "#FFFFFF" }}>
// // // // //                           {walletLoading ? "—" : `₹${fmt(totalEarning)}`}
// // // // //                         </p>
// // // // //                       </div>
// // // // //                       <div>
// // // // //                         <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Monthly Earnings</p>
// // // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, color: "#ADC6FF" }}>
// // // // //                           {walletLoading ? "—" : `₹${fmt(monthlyEarning)}`}
// // // // //                         </p>
// // // // //                       </div>
// // // // //                     </div>
// // // // //                   </div>
// // // // //                 </div>

// // // // //                 {/* ── Payment method + inputs ── */}
// // // // //                 <div className="relative self-start overflow-hidden border border-white/10"
// // // // //                   style={{ height: "fit-content", borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// // // // //                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_55%,rgba(255,20,239,0.28),transparent_50%)]" />
// // // // //                   <div className="relative z-10 p-8">

// // // // //                     <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>
// // // // //                       Select Payment Method
// // // // //                     </p>

// // // // //                     {/* ── Method tabs (now 4 methods) ── */}
// // // // //                     <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
// // // // //                       {paymentMethods.map((method) => {
// // // // //                         const active = selectedMethod === method.id;
// // // // //                         return (
// // // // //                           <button key={method.id} type="button"
// // // // //                             onClick={() => { setSelectedMethod(method.id); setPaymentError(""); setPaymentSuccess(""); }}
// // // // //                             className="flex h-[125px] flex-col items-center justify-center rounded-[10px] border text-center"
// // // // //                             style={{
// // // // //                               background:  active ? "rgba(23,23,26,0.72)" : "rgba(255,255,255,0.06)",
// // // // //                               borderColor: active ? "#FF14EF" : "rgba(255,255,255,0.08)",
// // // // //                               boxShadow:   active ? "inset -1px 0 0 #1A73E8" : "none",
// // // // //                             }}>
// // // // //                             {method.id === "qr"
// // // // //                               ? <QrCode size={36} style={{ color: active ? "#FF14EF" : "rgba(255,255,255,0.5)" }} />
// // // // //                               : <img src={method.icon} alt="" style={iconStyle} onError={(e) => { e.currentTarget.style.display = "none"; }} />
// // // // //                             }
// // // // //                             <p className="mt-4" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#FFFFFF" }}>{method.title}</p>
// // // // //                             <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{method.subtitle}</p>
// // // // //                           </button>
// // // // //                         );
// // // // //                       })}
// // // // //                     </div>

// // // // //                     {/* ── Amount input ── */}
// // // // //                     <div className="mt-9">
// // // // //                       <label style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>Enter amount</label>
// // // // //                       <div className="mt-5 flex items-center px-8"
// // // // //                         style={{ width: "min(546px, 100%)", height: 60, borderRadius: 16, background: "#18181B80", border: "1px solid #FFFFFF1A" }}>
// // // // //                         <div className="flex min-w-0 flex-1 items-center gap-4">
// // // // //                           <span style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 34, color: "#C084FC" }}>₹</span>
// // // // //                           <input
// // // // //                             value={amount}
// // // // //                             onChange={(e) => { setAmount(e.target.value.replace(/[^\d]/g, "")); setPaymentError(""); setPaymentSuccess(""); }}
// // // // //                             placeholder="0.00" inputMode="numeric"
// // // // //                             className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/10"
// // // // //                             style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 34, color: "#FFFFFF" }}
// // // // //                           />
// // // // //                         </div>
// // // // //                       </div>
// // // // //                       <div className="mt-5 flex items-center gap-2">
// // // // //                         <Info className="h-4 w-4 text-[#71717A]" />
// // // // //                         <span style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "#71717A" }}>
// // // // //                           Minimum add: ₹100. Maximum: ₹1,00,000 per transaction.
// // // // //                         </span>
// // // // //                       </div>
// // // // //                       <div className="mt-5 flex flex-nowrap gap-4 overflow-x-auto pb-1">
// // // // //                         {quickAmounts.map((value) => (
// // // // //                           <button key={value} type="button"
// // // // //                             onClick={() => { setAmount(String(value)); setPaymentError(""); setPaymentSuccess(""); }}
// // // // //                             className="h-[40px] shrink-0 rounded-[8px] border border-white/10 px-7"
// // // // //                             style={{ background: "#18181B80", ...quickAmountTextStyle }}>
// // // // //                             ₹{value}
// // // // //                           </button>
// // // // //                         ))}
// // // // //                       </div>
// // // // //                     </div>

// // // // //                     {/* ── UPI Section ── */}
// // // // //                     {selectedMethod === "upi" && (
// // // // //                       <div className="mt-7">
// // // // //                         <label style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>
// // // // //                           UPI ID{" "}
// // // // //                           <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>(optional — enter to prefill)</span>
// // // // //                         </label>

// // // // //                         <div className="mt-5 flex items-center gap-3" style={{ width: "min(546px, 100%)" }}>
// // // // //                           <div className="relative flex-1">
// // // // //                             <input
// // // // //                               value={upiId}
// // // // //                               onChange={(e) => { setUpiId(e.target.value); setPaymentError(""); }}
// // // // //                               placeholder="yourname@upi"
// // // // //                               className="w-full px-5 outline-none placeholder:text-white/35"
// // // // //                               style={{
// // // // //                                 height: 50, borderRadius: 16,
// // // // //                                 background: "#30302E",
// // // // //                                 border: `1px solid ${upiStatus === "valid" ? "rgba(74,222,128,0.5)" : upiStatus === "invalid" ? "rgba(248,113,113,0.5)" : "#FFFFFF1A"}`,
// // // // //                                 fontFamily: fontBase, fontWeight: 400, fontSize: 18, color: "#FFFFFF",
// // // // //                                 paddingRight: upiStatus !== "idle" ? "40px" : "16px",
// // // // //                               }}
// // // // //                             />
// // // // //                             {upiStatus === "valid"     && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "#4ade80" }} />}
// // // // //                             {upiStatus === "invalid"   && <XCircle      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "#f87171" }} />}
// // // // //                             {upiStatus === "verifying" && <Loader2      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" style={{ color: "#71717A" }} />}
// // // // //                           </div>

// // // // //                           <button
// // // // //                             type="button"
// // // // //                             onClick={handleVerifyUpi}
// // // // //                             disabled={!upiId.trim() || upiStatus === "verifying"}
// // // // //                             className="h-[50px] shrink-0 rounded-[12px] px-5 text-white disabled:opacity-40 transition-opacity"
// // // // //                             style={{
// // // // //                               background: upiStatus === "valid"
// // // // //                                 ? "linear-gradient(270deg,#4ade80 0%,#22c55e 100%)"
// // // // //                                 : "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
// // // // //                               fontFamily: fontBase, fontWeight: 700, fontSize: 13,
// // // // //                             }}>
// // // // //                             {upiStatus === "verifying" ? "Verifying..." : upiStatus === "valid" ? "✓ Verified" : "Verify UPI"}
// // // // //                           </button>
// // // // //                         </div>

// // // // //                         {/* ─── FIX 3: Name display ─── */}
// // // // //                         {upiStatus === "valid" && (
// // // // //                           <div className="mt-3 flex items-center gap-2">
// // // // //                             <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#4ade80" }} />
// // // // //                             <span style={{ fontFamily: fontBase, fontWeight: 500, fontSize: 13, color: "#4ade80" }}>
// // // // //                               UPI ID verified
// // // // //                               {upiName && upiName !== "(Name unavailable in test mode)" && ` — ${upiName}`}
// // // // //                             </span>
// // // // //                           </div>
// // // // //                         )}
// // // // //                         {upiStatus === "valid" && upiName === "(Name unavailable in test mode)" && (
// // // // //                           <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
// // // // //                             Name: Live mode mein account holder ka naam show hoga.
// // // // //                           </p>
// // // // //                         )}
// // // // //                         {upiStatus === "invalid" && upiError && (
// // // // //                           <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 13, color: "#f87171" }}>
// // // // //                             {upiError}
// // // // //                           </p>
// // // // //                         )}

// // // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
// // // // //                           UPI ID optional hai — checkout mein Google Pay, PhonePe, BHIM sab options milenge.
// // // // //                         </p>
// // // // //                       </div>
// // // // //                     )}

// // // // //                     {/* ── Net Banking ── */}
// // // // //                     {selectedMethod === "netbanking" && (
// // // // //                       <div className="mt-7 rounded-[14px] border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.05)" }}>
// // // // //                         <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>Net Banking</p>
// // // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, lineHeight: "18px", color: "#71717A" }}>
// // // // //                           Razorpay checkout mein apna bank choose karo. Redirect hoke payment complete karo.
// // // // //                         </p>
// // // // //                       </div>
// // // // //                     )}

// // // // //                     {/* ─────────────────────────────────────────────────────
// // // // //                         FIX 2: QR Section — "Scan & Pay" tab
// // // // //                         ───────────────────────────────────────────────────── */}
// // // // //                     {selectedMethod === "qr" && (
// // // // //                       <div className="mt-7">
// // // // //                         <div className="rounded-[14px] border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.04)" }}>
// // // // //                           <div className="flex items-center gap-3 mb-4">
// // // // //                             <QrCode size={20} style={{ color: "#C084FC" }} />
// // // // //                             <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>
// // // // //                               Scan & Pay via UPI
// // // // //                             </p>
// // // // //                           </div>

// // // // //                           {!addAmount || addAmount < 100 ? (
// // // // //                             <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
// // // // //                               Pehle amount enter karein, phir "Confirm & Add Funds" click karein — Razorpay QR screen open hogi.
// // // // //                             </p>
// // // // //                           ) : (
// // // // //                             <div className="space-y-3">
// // // // //                               <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
// // // // //                                 ₹{fmt(addAmount)} ka QR generate hoga. Kisi bhi UPI app se scan karke pay karein.
// // // // //                               </p>
// // // // //                               <div className="flex flex-wrap gap-3 mt-2">
// // // // //                                 {["Google Pay", "PhonePe", "BHIM", "Paytm"].map((app) => (
// // // // //                                   <span key={app} className="rounded-[6px] px-3 py-1 text-xs"
// // // // //                                     style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontFamily: fontBase }}>
// // // // //                                     {app}
// // // // //                                   </span>
// // // // //                                 ))}
// // // // //                               </div>
// // // // //                               <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
// // // // //                                 QR 15 minutes ke liye valid rahega. Expire hone par new QR generate karo.
// // // // //                               </p>
// // // // //                             </div>
// // // // //                           )}
// // // // //                         </div>
// // // // //                       </div>
// // // // //                     )}

// // // // //                     {/* ── Card: Saved bank accounts ── */}
// // // // //                     {selectedMethod === "card" && (
// // // // //                       <div className="mt-7">
// // // // //                         <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>
// // // // //                           Select Saved Bank Account
// // // // //                         </p>
// // // // //                         <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
// // // // //                           Bank transfer request bheja jayega — 1-2 business days mein credit hoga.
// // // // //                         </p>

// // // // //                         {accounts.length === 0 ? (
// // // // //                           <div className="mt-4 rounded-[14px] border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.05)" }}>
// // // // //                             <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
// // // // //                               Koi saved account nahi hai.{" "}
// // // // //                               <button type="button" onClick={() => navigate("/wallet")}
// // // // //                                 style={{ color: "#C084FC", textDecoration: "underline" }}>
// // // // //                                 Wallet se add karo
// // // // //                               </button>
// // // // //                             </p>
// // // // //                           </div>
// // // // //                         ) : (
// // // // //                           <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
// // // // //                             {accounts.map((account) => {
// // // // //                               const active = selectedAccountId === account.id;
// // // // //                               return (
// // // // //                                 <button key={account.id} type="button"
// // // // //                                   onClick={() => { setSelectedAccountId(account.id); setPaymentError(""); }}
// // // // //                                   className="flex h-[80px] items-center gap-4 rounded-[12px] border px-4 text-left transition-all"
// // // // //                                   style={{
// // // // //                                     background:  active ? "rgba(23,23,26,0.72)" : "rgba(255,255,255,0.05)",
// // // // //                                     borderColor: active ? "#FF14EF" : "rgba(255,255,255,0.10)",
// // // // //                                     boxShadow:   active ? "inset -1px 0 0 #1A73E8" : "none",
// // // // //                                   }}>
// // // // //                                   <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1A73E8]/20">
// // // // //                                     <Landmark className="h-5 w-5 text-[#1A73E8]" />
// // // // //                                   </div>
// // // // //                                   <div className="min-w-0 flex-1">
// // // // //                                     <p className="truncate text-white" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14 }}>
// // // // //                                       {account.name}
// // // // //                                     </p>
// // // // //                                     <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
// // // // //                                       •••• {account.last4}
// // // // //                                     </p>
// // // // //                                   </div>
// // // // //                                   {active && <div className="h-4 w-4 shrink-0 rounded-full border-2 border-[#FF14EF] bg-[#FF14EF]" />}
// // // // //                                 </button>
// // // // //                               );
// // // // //                             })}
// // // // //                           </div>
// // // // //                         )}

// // // // //                         <button type="button" onClick={() => navigate("/wallet")}
// // // // //                           className="mt-4 flex h-[44px] items-center gap-2 rounded-[10px] border border-dashed border-white/20 px-4"
// // // // //                           style={{ background: "rgba(255,255,255,0.04)" }}>
// // // // //                           <span style={{ width: 14, height: 14, display: "inline-block", backgroundColor: "#A1A1AA", WebkitMask: "url('/icons/pluss.svg') center / contain no-repeat", mask: "url('/icons/pluss.svg') center / contain no-repeat" }} />
// // // // //                           <span style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>
// // // // //                             Add New Account
// // // // //                           </span>
// // // // //                         </button>
// // // // //                       </div>
// // // // //                     )}

// // // // //                   </div>
// // // // //                 </div>
// // // // //               </div>

// // // // //               {/* ── Transaction Summary sidebar ── */}
// // // // //               <aside className="relative min-w-0 self-start overflow-hidden border border-white/10"
// // // // //                 style={{ width: "100%", minHeight: 471, height: "fit-content", borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// // // // //                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_90%,rgba(255,20,239,0.17),transparent_55%)]" />
// // // // //                 <div className="relative z-10 p-8">
// // // // //                   <h3 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 18, color: "#FFFFFF" }}>Transaction Summary</h3>
// // // // //                   <div className="mt-8 space-y-7">
// // // // //                     <div className="flex items-center justify-between gap-4">
// // // // //                       <span style={summaryLabelStyle}>Subtotal</span>
// // // // //                       <span style={summaryValueStyle}>₹{addAmount.toFixed(2)}</span>
// // // // //                     </div>
// // // // //                     <div className="flex items-center justify-between gap-4">
// // // // //                       <span style={summaryLabelStyle}>
// // // // //                         {selectedMethod === "card" || selectedMethod === "qr" ? "Service Fee" : "Service Fee (2%)"}
// // // // //                       </span>
// // // // //                       <span style={summaryValueStyle}>
// // // // //                         {selectedMethod === "card" ? "₹0.00" : `₹${serviceFee.toFixed(2)}`}
// // // // //                       </span>
// // // // //                     </div>
// // // // //                     <div className="h-px w-full bg-white/10" />
// // // // //                     <div className="flex items-center justify-between gap-3 min-w-0">
// // // // //                       <span style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 20, color: "#FFFFFF", whiteSpace: "nowrap", flexShrink: 0 }}>
// // // // //                         {selectedMethod === "card" ? "Transfer Amount" : "Debit Amount"}
// // // // //                       </span>
// // // // //                       <span style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 16, color: "#C084FC", whiteSpace: "nowrap", textAlign: "right" }}>
// // // // //                         ₹{selectedMethod === "card" ? addAmount.toFixed(2) : Math.max(debitAmount, 0).toFixed(2)}
// // // // //                       </span>
// // // // //                     </div>
// // // // //                   </div>

// // // // //                   <div className="mt-8 flex gap-3 rounded-[14px] p-4" style={{ background: "rgba(3,4,5,0.35)" }}>
// // // // //                     <img src="/icons/locky.svg" alt="" className="mt-1 h-5 w-5 shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
// // // // //                     <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "#71717A" }}>
// // // // //                       {selectedMethod === "card"
// // // // //                         ? "Bank transfer request bheja jayega. Verification ke baad 1-2 business days mein credit hoga."
// // // // //                         : selectedMethod === "qr"
// // // // //                         ? "QR scan karke kisi bhi UPI app se pay karein. Payment instantly credit hogi."
// // // // //                         : "Payment secured with end-to-end encryption. Funds appear instantly after confirmation."}
// // // // //                     </p>
// // // // //                   </div>

// // // // //                   {paymentError && (
// // // // //                     <div className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white"
// // // // //                       style={{ background: "#2A1717", borderColor: "rgba(239,68,68,0.35)" }}>
// // // // //                       {paymentError}
// // // // //                     </div>
// // // // //                   )}
// // // // //                   {paymentSuccess && (
// // // // //                     <div className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white"
// // // // //       style={{ background: "#052A1D", borderColor: "rgba(74,222,128,0.35)" }}>
// // // // //                       {paymentSuccess}
// // // // //                     </div>
// // // // //                   )}

// // // // //                   <button
// // // // //                     type="button"
// // // // //                     disabled={isConfirmDisabled}
// // // // //                     onClick={handleConfirmAddFunds}
// // // // //                     className="mt-8 h-[49px] w-full rounded-[8px] text-white disabled:opacity-50"
// // // // //                     style={{ ...confirmButtonTextStyle, background: "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)" }}>
// // // // //                     {payLoading || qrLoading
// // // // //                       ? "Processing..."
// // // // //                       : selectedMethod === "card"
// // // // //                       ? "Submit Transfer Request"
// // // // //                       : selectedMethod === "qr"
// // // // //                       ? "Generate QR & Pay"
// // // // //                       : "Confirm & Add Funds"}
// // // // //                   </button>
// // // // //                 </div>
// // // // //               </aside>
// // // // //             </div>
// // // // //           </div>
// // // // //         </section>
// // // // //       </main>

// // // // //       <div className="relative z-10 mt-20"><Footer /></div>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default AddFunds;




// // // // // src/pages/AddFunds.tsx
// // // // import { useEffect, useMemo, useState, useRef, type CSSProperties } from "react";
// // // // import { useNavigate } from "react-router-dom";
// // // // import Header from "@/components/Header";
// // // // import Footer from "@/components/Footer";
// // // // import { Info, Landmark, CheckCircle2, XCircle, Loader2, QrCode, RefreshCw } from "lucide-react";
// // // // import { useAuth } from "@/contexts/AuthContext";

// // // // declare global {
// // // //   interface Window { Razorpay: any; }
// // // // }

// // // // type PaymentMethod = "upi" | "netbanking" | "qr" | "card";
// // // // type WalletAccount = { id: string; name: string; last4: string; ifsc?: string; };
// // // // type UpiStatus = "idle" | "verifying" | "valid" | "invalid";

// // // // // ─────────────────────────────────────────────────────────────
// // // // // FIX 1: Razorpay config — show_default_blocks:false test mode
// // // // // mein "No appropriate payment method" error deta hai.
// // // // // Sahi approach: DEFAULT blocks ON rakho, par method restrict
// // // // // karo `method` field se + hidden array se baaki hide karo.
// // // // // ─────────────────────────────────────────────────────────────
// // // // const buildRazorpayConfig = (method: "upi" | "netbanking") => {
// // // //   if (method === "upi") {
// // // //     return {
// // // //       display: {
// // // //         blocks: {
// // // //           utib0: {
// // // //             // Custom block — UPI first
// // // //             name: "Pay via UPI",
// // // //             instruments: [
// // // //               { method: "upi", flows: ["collect", "intent", "qr"] },
// // // //             ],
// // // //           },
// // // //         },
// // // //         // ─── KEY FIX: show_default_blocks:true rakho taaki
// // // //         //     test mode mein bhi UPI options visible rahen ───
// // // //         sequence: ["block.utib0"],
// // // //         preferences: { show_default_blocks: true },
// // // //       },
// // // //       // Hide everything except UPI
// // // //       hidden: [
// // // //         { method: "card" },
// // // //         { method: "netbanking" },
// // // //         { method: "wallet" },
// // // //         { method: "paylater" },
// // // //         { method: "emi" },
// // // //       ],
// // // //     };
// // // //   }

// // // //   // netbanking
// // // //   return {
// // // //     display: {
// // // //       blocks: {
// // // //         nb0: {
// // // //           name: "Pay via Net Banking",
// // // //           instruments: [{ method: "netbanking" }],
// // // //         },
// // // //       },
// // // //       sequence: ["block.nb0"],
// // // //       preferences: { show_default_blocks: true },
// // // //     },
// // // //     hidden: [
// // // //       { method: "card" },
// // // //       { method: "upi" },
// // // //       { method: "wallet" },
// // // //       { method: "paylater" },
// // // //       { method: "emi" },
// // // //     ],
// // // //   };
// // // // };

// // // // const AddFunds = () => {
// // // //   const navigate = useNavigate();
// // // //   const { token, user } = useAuth() as any;

// // // //   const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";
// // // //   const fontBase = "Inter, system-ui, Arial, sans-serif";

// // // //   const CREATE_ORDER_URL   = `${API_BASE}/api/wallet/add-fund/create-order`;
// // // //   const VERIFY_PAYMENT_URL = `${API_BASE}/api/wallet/add-fund/verify`;
// // // //   const WALLET_BALANCE_URL = `${API_BASE}/api/wallet/balance`;
// // // //   const BANK_LIST_URL      = `${API_BASE}/api/bankaccount`;
// // // //   const BANK_TRANSFER_URL  = `${API_BASE}/api/wallet/add-fund/bank-transfer`;
// // // //   const UPI_VALIDATE_URL   = `${API_BASE}/api/wallet/upi/validate`;

// // // //   const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
// // // //   const [amount, setAmount]   = useState("");
// // // //   const [upiId, setUpiId]     = useState("");

// // // //   // UPI verification state
// // // //   const [upiStatus, setUpiStatus]   = useState<UpiStatus>("idle");
// // // //   const [upiError, setUpiError]     = useState("");
// // // //   const [upiName, setUpiName]       = useState("");

// // // //   const [availableBalance, setAvailableBalance] = useState(0);
// // // //   const [totalEarning, setTotalEarning]         = useState(0);
// // // //   const [monthlyEarning, setMonthlyEarning]     = useState(0);
// // // //   const [walletLoading, setWalletLoading]       = useState(false);

// // // //   const [accounts, setAccounts]                   = useState<WalletAccount[]>([]);
// // // //   const [selectedAccountId, setSelectedAccountId] = useState<string>("");

// // // //   const [payLoading, setPayLoading]         = useState(false);
// // // //   const [paymentError, setPaymentError]     = useState("");
// // // //   const [paymentSuccess, setPaymentSuccess] = useState("");

// // // //   // ─── QR flow state ───
// // // //   const [qrLoading, setQrLoading]   = useState(false);
// // // //   const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
// // // //   const [qrOrderId, setQrOrderId]   = useState<string>("");
// // // //   const [qrTopupId, setQrTopupId]   = useState<string>("");
// // // //   const qrPollingRef                = useRef<ReturnType<typeof setInterval> | null>(null);

// // // //   const userStorageId = user?._id || user?.id || user?.email || "guest";
// // // //   const WALLET_ACCOUNTS_KEY = useMemo(() => `tokun_wallet_accounts_${userStorageId}`, [userStorageId]);

// // // //   const getAuthToken = () =>
// // // //     token ||
// // // //     localStorage.getItem("auth_token") ||
// // // //     sessionStorage.getItem("auth_token") ||
// // // //     localStorage.getItem("token") ||
// // // //     sessionStorage.getItem("token") ||
// // // //     "";

// // // //   // ── Wallet balance fetch ──
// // // //   const fetchWallet = async () => {
// // // //     const authToken = getAuthToken();
// // // //     if (!authToken) return;
// // // //     try {
// // // //       setWalletLoading(true);
// // // //       const res  = await fetch(WALLET_BALANCE_URL, {
// // // //         headers: { Authorization: `Bearer ${authToken}` },
// // // //         credentials: "include",
// // // //       });
// // // //       const data = await res.json().catch(() => ({}));
// // // //       if (res.ok && data.success) {
// // // //         setAvailableBalance(Number(data.availableBalance || 0));
// // // //         setTotalEarning(Number(data.totalRevenue || 0));
// // // //         setMonthlyEarning(Number(data.monthlyEarning || 0));
// // // //       }
// // // //     } catch (err) {
// // // //       console.error("wallet fetch error:", err);
// // // //     } finally {
// // // //       setWalletLoading(false);
// // // //     }
// // // //   };

// // // //   // ── Saved bank accounts fetch ──
// // // //   const fetchBankAccounts = async () => {
// // // //     const authToken = getAuthToken();
// // // //     try {
// // // //       const raw = localStorage.getItem(WALLET_ACCOUNTS_KEY);
// // // //       if (raw) {
// // // //         const parsed = JSON.parse(raw);
// // // //         if (Array.isArray(parsed) && parsed.length) {
// // // //           setAccounts(parsed);
// // // //           setSelectedAccountId((prev) => prev || parsed[0].id);
// // // //         }
// // // //       }
// // // //     } catch {}

// // // //     if (!authToken) return;
// // // //     try {
// // // //       const res  = await fetch(BANK_LIST_URL, {
// // // //         method: "GET",
// // // //         headers: { Authorization: `Bearer ${authToken}` },
// // // //         credentials: "include",
// // // //       });
// // // //       const data = await res.json().catch(() => ({}));
// // // //       if (!res.ok || !Array.isArray(data?.accounts)) return;

// // // //       const mapped: WalletAccount[] = data.accounts.map((ba: any) => ({
// // // //         id:    String(ba?._id || ""),
// // // //         name:  String(ba?.bankName || "Bank Account"),
// // // //         last4: String(ba?.accountNumber || "").slice(-4) || "0000",
// // // //         ifsc:  String(ba?.ifscCode || "").toUpperCase(),
// // // //       }));

// // // //       setAccounts(mapped);
// // // //       if (mapped.length) setSelectedAccountId((prev) => prev || mapped[0].id);
// // // //       localStorage.setItem(WALLET_ACCOUNTS_KEY, JSON.stringify(mapped));
// // // //     } catch {}
// // // //   };

// // // //   useEffect(() => {
// // // //     fetchWallet();
// // // //     fetchBankAccounts();
// // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // //   }, [token]);

// // // //   // QR tab pe aane par clear karein old QR
// // // //   useEffect(() => {
// // // //     if (selectedMethod !== "qr") {
// // // //       stopQrPolling();
// // // //       setQrImageUrl(null);
// // // //       setQrOrderId("");
// // // //       setQrTopupId("");
// // // //     }
// // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // //   }, [selectedMethod]);

// // // //   // Cleanup on unmount
// // // //   useEffect(() => {
// // // //     return () => stopQrPolling();
// // // //   }, []);

// // // //   // Reset UPI status when UPI ID changes
// // // //   useEffect(() => {
// // // //     if (upiStatus !== "idle") {
// // // //       setUpiStatus("idle");
// // // //       setUpiError("");
// // // //       setUpiName("");
// // // //     }
// // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // //   }, [upiId]);

// // // //   const addAmount   = Number(amount || 0);
// // // //   const serviceFee  = addAmount > 0 && selectedMethod !== "card" ? +(addAmount * 0.02).toFixed(2) : 0;
// // // //   const debitAmount = addAmount > 0 ? +(addAmount + serviceFee).toFixed(2) : 0;

// // // //   const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);

// // // //   // ─────────────────────────────────────────────────────────────
// // // //   // QR FLOW
// // // //   // ─────────────────────────────────────────────────────────────

// // // //   const stopQrPolling = () => {
// // // //     if (qrPollingRef.current) {
// // // //       clearInterval(qrPollingRef.current);
// // // //       qrPollingRef.current = null;
// // // //     }
// // // //   };

// // // //   /**
// // // //    * FIX 2 (QR flow):
// // // //    * Razorpay mein UPI QR generate karne ke liye:
// // // //    * 1. Normal order create karo (selectedMethod: "qr")
// // // //    * 2. Razorpay checkout open karo with method: "upi" aur
// // // //    *    upi: { flow: "qr" } — ye directly QR screen dikhata hai
// // // //    * 3. Ya phir Razorpay Payment Links API se QR image generate karo
// // // //    *    aur polling se verify karo
// // // //    *
// // // //    * Hum yahan Razorpay checkout ka "qr" flow use karenge —
// // // //    * ye sabse reliable hai aur extra API nahi chahiye.
// // // //    */
// // // //   const handleGenerateQr = async () => {
// // // //     setPaymentError("");
// // // //     const authToken = getAuthToken();

// // // //     if (!authToken)                    { setPaymentError("Please login first."); return; }
// // // //     if (!addAmount || addAmount < 100) { setPaymentError("Minimum amount is ₹100 for QR payment."); return; }
// // // //     if (addAmount > 100000)            { setPaymentError("Maximum ₹1,00,000 per transaction."); return; }
// // // //     if (!window.Razorpay)              { setPaymentError("Razorpay not loaded. Check internet."); return; }

// // // //     try {
// // // //       setQrLoading(true);
// // // //       setQrImageUrl(null);

// // // //       // Create order with qr method
// // // //       const res  = await fetch(CREATE_ORDER_URL, {
// // // //         method: "POST",
// // // //         headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // // //         credentials: "include",
// // // //         body: JSON.stringify({ amount: addAmount, selectedMethod: "qr" }),
// // // //       });
// // // //       const orderData = await res.json().catch(() => ({}));
// // // //       if (!res.ok || !orderData.success) throw new Error(orderData.message || "Could not create QR order.");

// // // //       const order = orderData?.order || {};
// // // //       const orderId = String(order?.id || "");
// // // //       const razorpayKey = String(orderData?.key || "");

// // // //       setQrOrderId(orderId);
// // // //       setQrTopupId(String(orderData?.topupId || ""));

// // // //       // ─── Razorpay checkout with UPI QR flow ───
// // // //       const cleanEmail   = String(user?.email || "").trim();
// // // //       const cleanContact = String(user?.phone || user?.mobile || "").replace(/\D/g, "").slice(-10);
// // // //       const cleanName    = String(user?.name || "").trim();

// // // //       const prefill: Record<string, string> = {};
// // // //       if (cleanName) prefill.name = cleanName;
// // // //       if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) prefill.email = cleanEmail;
// // // //       if (/^[6-9]\d{9}$/.test(cleanContact)) prefill.contact = cleanContact;

// // // //       const options: any = {
// // // //         key: razorpayKey,
// // // //         order_id: orderId,
// // // //         name: "Tokun",
// // // //         description: "Add funds via UPI QR",
// // // //         image: "/favicon.ico",
// // // //         prefill,
// // // //         // ─── FIX: test + live dono mein kaam karta hai ───
// // // //         // Custom blocks mat use karo QR ke liye — sirf method
// // // //         // restrict karo. Razorpay khud UPI screen dikhayega
// // // //         // jisme QR option hoga.
// // // //         method: {
// // // //           upi: true,
// // // //           card: false,
// // // //           netbanking: false,
// // // //           wallet: false,
// // // //           paylater: false,
// // // //           emi: false,
// // // //         },
// // // //         config: {
// // // //           display: {
// // // //             preferences: { show_default_blocks: true },
// // // //           },
// // // //         },
// // // //         theme: { color: "#1A73E8" },
// // // //         handler: async (response: any) => {
// // // //           try {
// // // //             setPayLoading(true);
// // // //             const verifyRes = await fetch(VERIFY_PAYMENT_URL, {
// // // //               method: "POST",
// // // //               headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // // //               credentials: "include",
// // // //               body: JSON.stringify(response),
// // // //             });
// // // //             const verifyData = await verifyRes.json().catch(() => ({}));
// // // //             if (!verifyRes.ok || !verifyData.success) throw new Error(verifyData.message || "Verification failed.");

// // // //             setPaymentSuccess("QR payment successful! Wallet updated.");
// // // //             stopQrPolling();
// // // //             setQrImageUrl(null);
// // // //             await fetchWallet();
// // // //             setTimeout(() => navigate("/wallet"), 1500);
// // // //           } catch (err: any) {
// // // //             setPaymentError(err?.message || "Payment verification failed.");
// // // //           } finally {
// // // //             setPayLoading(false);
// // // //           }
// // // //         },
// // // //         modal: { ondismiss: () => { setQrLoading(false); stopQrPolling(); } },
// // // //       };

// // // //       const razorpay = new window.Razorpay(options);
// // // //       razorpay.on("payment.failed", (response: any) => {
// // // //         setPaymentError(response?.error?.description || "QR payment failed.");
// // // //         setQrLoading(false);
// // // //         stopQrPolling();
// // // //       });
// // // //       razorpay.open();

// // // //     } catch (err: any) {
// // // //       console.error("[QR] error:", err);
// // // //       setPaymentError(err?.message || "Could not generate QR.");
// // // //     } finally {
// // // //       setQrLoading(false);
// // // //     }
// // // //   };

// // // //   // ─────────────────────────────────────────────────────────────
// // // //   // UPI Verify Handler
// // // //   // ─────────────────────────────────────────────────────────────
// // // //   const handleVerifyUpi = async () => {
// // // //     if (!upiId.trim()) {
// // // //       setUpiError("Please enter a UPI ID first.");
// // // //       return;
// // // //     }

// // // //     const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
// // // //     if (!vpaRegex.test(upiId.trim().toLowerCase())) {
// // // //       setUpiStatus("invalid");
// // // //       setUpiError("Invalid UPI ID format. Example: name@upi");
// // // //       setUpiName("");
// // // //       return;
// // // //     }

// // // //     try {
// // // //       setUpiStatus("verifying");
// // // //       setUpiError("");
// // // //       setUpiName("");

// // // //       const authToken = getAuthToken();
// // // //       const res  = await fetch(UPI_VALIDATE_URL, {
// // // //         method: "POST",
// // // //         headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // // //         credentials: "include",
// // // //         body: JSON.stringify({ vpa: upiId.trim() }),
// // // //       });
// // // //       const data = await res.json().catch(() => ({}));

// // // //       if (!res.ok || !data.success || data.error === "invalid_vpa") {
// // // //         setUpiStatus("invalid");
// // // //         setUpiError(data.message || "UPI ID is invalid or does not exist.");
// // // //         return;
// // // //       }

// // // //       setUpiStatus("valid");
// // // //       // ─── FIX 3: Backend se aane wala name set karo ───
// // // //       if (data.name) {
// // // //         setUpiName(data.name);
// // // //       } else if (data.note === "format_only_verified") {
// // // //         // Test mode mein name nahi aata — user ko batao
// // // //         setUpiName("(Name unavailable in test mode)");
// // // //       }
// // // //     } catch (err: any) {
// // // //       setUpiStatus("invalid");
// // // //       setUpiError("Could not verify UPI ID. Please try again.");
// // // //     }
// // // //   };

// // // //   // ─────────────────────────────────────────────────────────────
// // // //   // Razorpay order create
// // // //   // ─────────────────────────────────────────────────────────────
// // // //   const createAddFundOrder = async () => {
// // // //     const authToken = getAuthToken();
// // // //     const res  = await fetch(CREATE_ORDER_URL, {
// // // //       method: "POST",
// // // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // // //       credentials: "include",
// // // //       body: JSON.stringify({ amount: addAmount, selectedMethod }),
// // // //     });
// // // //     const data = await res.json().catch(() => ({}));
// // // //     if (!res.ok || !data.success) throw new Error(data.message || "Could not create payment order.");
// // // //     return data;
// // // //   };

// // // //   const verifyAddFundPayment = async (razorpayResponse: any) => {
// // // //     const authToken = getAuthToken();
// // // //     const res  = await fetch(VERIFY_PAYMENT_URL, {
// // // //       method: "POST",
// // // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // // //       credentials: "include",
// // // //       body: JSON.stringify(razorpayResponse),
// // // //     });
// // // //     const data = await res.json().catch(() => ({}));
// // // //     if (!res.ok || !data.success) throw new Error(data.message || "Payment verification failed.");
// // // //     return data;
// // // //   };

// // // //   // ─────────────────────────────────────────────────────────────
// // // //   // Main payment handler (UPI / NetBanking)
// // // //   // ─────────────────────────────────────────────────────────────
// // // //   const handleConfirmAddFunds = async () => {
// // // //     setPaymentError("");
// // // //     setPaymentSuccess("");

// // // //     const authToken = getAuthToken();
// // // //     if (!authToken)              { setPaymentError("Please login first."); return; }
// // // //     if (!addAmount || Number.isNaN(addAmount)) { setPaymentError("Please enter amount."); return; }
// // // //     if (addAmount < 100)         { setPaymentError("Minimum add amount is ₹100."); return; }
// // // //     if (addAmount > 100000)      { setPaymentError("Maximum amount is ₹1,00,000 per transaction."); return; }

// // // //     // ── QR flow — handled by handleGenerateQr separately ──
// // // //     if (selectedMethod === "qr") {
// // // //       return handleGenerateQr();
// // // //     }

// // // //     // ── CARD flow: saved bank account ──
// // // //     if (selectedMethod === "card") {
// // // //       if (!selectedAccountId) {
// // // //         setPaymentError("Please select a saved bank account.");
// // // //         return;
// // // //       }
// // // //       try {
// // // //         setPayLoading(true);
// // // //         const res  = await fetch(BANK_TRANSFER_URL, {
// // // //           method: "POST",
// // // //           headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // // //           credentials: "include",
// // // //           body: JSON.stringify({ amount: addAmount, bankAccountId: selectedAccountId }),
// // // //         });
// // // //         const data = await res.json().catch(() => ({}));
// // // //         if (!res.ok || !data.success) throw new Error(data.message || "Could not process request.");

// // // //         setPaymentSuccess("Bank transfer request submitted! Funds will be credited after verification (1-2 business days).");
// // // //         setAmount("");
// // // //         await fetchWallet();
// // // //         setTimeout(() => navigate("/wallet"), 2500);
// // // //       } catch (err: any) {
// // // //         setPaymentError(err?.message || "Could not process bank transfer.");
// // // //       } finally {
// // // //         setPayLoading(false);
// // // //       }
// // // //       return;
// // // //     }

// // // //     // ── UPI / NetBanking flow: Razorpay ──
// // // //     if (!window.Razorpay) {
// // // //       setPaymentError("Razorpay not loaded. Please check your internet connection.");
// // // //       return;
// // // //     }

// // // //     if (selectedMethod === "upi" && upiId.trim()) {
// // // //       if (upiStatus === "idle") {
// // // //         setPaymentError("Please verify your UPI ID before proceeding.");
// // // //         return;
// // // //       }
// // // //       if (upiStatus === "invalid") {
// // // //         setPaymentError("Invalid UPI ID. Please enter a valid UPI ID.");
// // // //         return;
// // // //       }
// // // //       if (upiStatus === "verifying") {
// // // //         setPaymentError("UPI verification in progress. Please wait.");
// // // //         return;
// // // //       }
// // // //     }

// // // //     try {
// // // //       setPayLoading(true);
// // // //       const orderData = await createAddFundOrder();

// // // //       const order = orderData?.order || {};
// // // //       const orderId = String(order?.id || "");
// // // //       const razorpayKey = String(orderData?.key || "");

// // // //       if (!razorpayKey.startsWith("rzp_")) throw new Error("Invalid Razorpay key received from server.");
// // // //       if (!orderId.startsWith("order_"))   throw new Error("Invalid Razorpay order received from server.");

// // // //       const cleanEmail   = String(user?.email || "").trim();
// // // //       const cleanContact = String(user?.phone || user?.mobile || "").replace(/\D/g, "").slice(-10);
// // // //       const cleanName    = String(user?.name || "").trim();

// // // //       const prefill: Record<string, string> = {};
// // // //       if (cleanName) prefill.name = cleanName;
// // // //       if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) prefill.email = cleanEmail;
// // // //       if (/^[6-9]\d{9}$/.test(cleanContact)) prefill.contact = cleanContact;

// // // //       if (selectedMethod === "upi" && upiId.trim() && upiStatus === "valid") {
// // // //         prefill.vpa = upiId.trim();
// // // //       }

// // // //       const options: any = {
// // // //         key: razorpayKey,
// // // //         order_id: orderId,
// // // //         name: "Tokun",
// // // //         description: selectedMethod === "upi" ? "Add funds via UPI" : "Add funds via Net Banking",
// // // //         image: "/favicon.ico",
// // // //         prefill,
// // // //         notes: {
// // // //           purpose: "wallet_topup",
// // // //           selectedMethod: String(selectedMethod),
// // // //           walletAmount: String(addAmount),
// // // //         },
// // // //         theme: { color: "#1A73E8" },
// // // //         // ─── FIX 1 applied here ───
// // // //         config: buildRazorpayConfig(selectedMethod as "upi" | "netbanking"),
// // // //         handler: async (response: any) => {
// // // //           try {
// // // //             setPayLoading(true);
// // // //             await verifyAddFundPayment(response);
// // // //             setPaymentSuccess("Payment successful! Wallet updated.");
// // // //             await fetchWallet();
// // // //             setTimeout(() => navigate("/wallet"), 1200);
// // // //           } catch (err: any) {
// // // //             setPaymentError(err?.message || "Payment verification failed.");
// // // //           } finally {
// // // //             setPayLoading(false);
// // // //           }
// // // //         },
// // // //         modal: { ondismiss: () => setPayLoading(false) },
// // // //       };

// // // //       const razorpay = new window.Razorpay(options);
// // // //       razorpay.on("payment.failed", (response: any) => {
// // // //         setPaymentError(
// // // //           response?.error?.description || response?.error?.reason || "Payment failed. Please try again."
// // // //         );
// // // //         setPayLoading(false);
// // // //       });
// // // //       razorpay.open();

// // // //     } catch (err: any) {
// // // //       console.error("[AddFunds] error:", err);
// // // //       setPaymentError(err?.message || "Could not start payment.");
// // // //       setPayLoading(false);
// // // //     }
// // // //   };

// // // //   // ── Styles ──
// // // //   const confirmButtonTextStyle: CSSProperties = {
// // // //     fontFamily: fontBase, fontWeight: 700, fontSize: 16, lineHeight: "100%", textAlign: "center",
// // // //   };
// // // //   const summaryLabelStyle: CSSProperties = {
// // // //     fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "#71717A", whiteSpace: "nowrap",
// // // //   };
// // // //   const summaryValueStyle: CSSProperties = {
// // // //     fontFamily: fontBase, fontWeight: 500, fontSize: 14, color: "#FFFFFF", whiteSpace: "nowrap",
// // // //   };
// // // //   const quickAmountTextStyle: CSSProperties = {
// // // //     fontFamily: fontBase, fontWeight: 500, fontSize: 18, textAlign: "center", color: "#FFFFFF",
// // // //   };
// // // //   const iconStyle: CSSProperties = {
// // // //     width: 40, height: 40, opacity: 1, objectFit: "contain", display: "block",
// // // //   };

// // // //   const paymentMethods = [
// // // //     { id: "upi"        as PaymentMethod, title: "UPI",         subtitle: "Instant",         icon: "/icons/upi.svg" },
// // // //     { id: "netbanking" as PaymentMethod, title: "Net Banking",  subtitle: "2-3 mins",        icon: "/icons/netbanking.svg" },
// // // //     { id: "qr"         as PaymentMethod, title: "Scan QR",      subtitle: "Any UPI App",     icon: "/icons/upi.svg" },
// // // //     { id: "card"       as PaymentMethod, title: "Bank Account", subtitle: "Saved Accounts",  icon: "/icons/addcard.svg" },
// // // //   ];
// // // //   const quickAmounts = [100, 200, 500, 2000];

// // // //   const isConfirmDisabled =
// // // //     !addAmount ||
// // // //     payLoading ||
// // // //     (selectedMethod === "card" && !selectedAccountId) ||
// // // //     (selectedMethod === "upi" && upiId.trim() !== "" && (upiStatus === "invalid" || upiStatus === "verifying"));

// // // //   return (
// // // //     <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
// // // //       <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
// // // //         <img src="/icons/mpbg.png" alt="background" className="absolute inset-0 w-full h-screen object-contain object-top select-none" />
// // // //       </div>
// // // //       <div className="relative z-20 w-full bg-transparent px-4"><Header /></div>

// // // //       <main className="relative z-10 px-4 pt-[95px] pb-20">
// // // //         <section className="mx-auto overflow-hidden"
// // // //           style={{ width: "min(1024px, 100%)", minHeight: 1269, borderRadius: 30, background: "#21212180", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", fontFamily: fontBase }}>
// // // //           <div className="p-8 sm:p-[50px]">

// // // //             <button type="button" onClick={() => navigate("/wallet")} className="inline-flex items-center gap-2"
// // // //               style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#C084FC" }}>
// // // //               ← Back to Wallet
// // // //             </button>

// // // //             <div className="mt-4">
// // // //               <h1 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 36, lineHeight: "100%", color: "#FFFFFF" }}>Add Funds</h1>
// // // //               <p className="mt-4 max-w-[590px]" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 16, lineHeight: "24px", color: "#A1A1AA" }}>
// // // //                 Add money to your wallet using UPI, Net Banking, QR code or saved bank accounts.<br />
// // // //                 Funds appear instantly after payment confirmation.
// // // //               </p>
// // // //             </div>

// // // //             <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_294px] gap-5 items-start">
// // // //               <div className="space-y-5 min-w-0">

// // // //                 {/* ── Balance card ── */}
// // // //                 <div className="relative overflow-hidden border border-white/10"
// // // //                   style={{ minHeight: 284, borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// // // //                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />
// // // //                   <div className="relative z-10 p-8">
// // // //                     <p style={{ fontFamily: fontBase, fontWeight: 600, fontSize: 12, letterSpacing: "1.2px", color: "#C084FC", textTransform: "uppercase" }}>
// // // //                       Current Balance
// // // //                     </p>
// // // //                     <h2 className="mt-5 text-white" style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 60, lineHeight: "60px" }}>
// // // //                       {walletLoading ? "Loading..." : `₹ ${fmt(availableBalance)}`}
// // // //                     </h2>
// // // //                     <div className="mt-12 h-px w-full bg-white/10" />
// // // //                     <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
// // // //                       <div>
// // // //                         <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Total Earning</p>
// // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, color: "#FFFFFF" }}>
// // // //                           {walletLoading ? "—" : `₹${fmt(totalEarning)}`}
// // // //                         </p>
// // // //                       </div>
// // // //                       <div>
// // // //                         <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Monthly Earnings</p>
// // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, color: "#ADC6FF" }}>
// // // //                           {walletLoading ? "—" : `₹${fmt(monthlyEarning)}`}
// // // //                         </p>
// // // //                       </div>
// // // //                     </div>
// // // //                   </div>
// // // //                 </div>

// // // //                 {/* ── Payment method + inputs ── */}
// // // //                 <div className="relative self-start overflow-hidden border border-white/10"
// // // //                   style={{ height: "fit-content", borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// // // //                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_55%,rgba(255,20,239,0.28),transparent_50%)]" />
// // // //                   <div className="relative z-10 p-8">

// // // //                     <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>
// // // //                       Select Payment Method
// // // //                     </p>

// // // //                     {/* ── Method tabs (now 4 methods) ── */}
// // // //                     <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
// // // //                       {paymentMethods.map((method) => {
// // // //                         const active = selectedMethod === method.id;
// // // //                         return (
// // // //                           <button key={method.id} type="button"
// // // //                             onClick={() => { setSelectedMethod(method.id); setPaymentError(""); setPaymentSuccess(""); }}
// // // //                             className="flex h-[125px] flex-col items-center justify-center rounded-[10px] border text-center"
// // // //                             style={{
// // // //                               background:  active ? "rgba(23,23,26,0.72)" : "rgba(255,255,255,0.06)",
// // // //                               borderColor: active ? "#FF14EF" : "rgba(255,255,255,0.08)",
// // // //                               boxShadow:   active ? "inset -1px 0 0 #1A73E8" : "none",
// // // //                             }}>
// // // //                             {method.id === "qr"
// // // //                               ? <QrCode size={36} style={{ color: active ? "#FF14EF" : "rgba(255,255,255,0.5)" }} />
// // // //                               : <img src={method.icon} alt="" style={iconStyle} onError={(e) => { e.currentTarget.style.display = "none"; }} />
// // // //                             }
// // // //                             <p className="mt-4" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#FFFFFF" }}>{method.title}</p>
// // // //                             <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{method.subtitle}</p>
// // // //                           </button>
// // // //                         );
// // // //                       })}
// // // //                     </div>

// // // //                     {/* ── Amount input ── */}
// // // //                     <div className="mt-9">
// // // //                       <label style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>Enter amount</label>
// // // //                       <div className="mt-5 flex items-center px-8"
// // // //                         style={{ width: "min(546px, 100%)", height: 60, borderRadius: 16, background: "#18181B80", border: "1px solid #FFFFFF1A" }}>
// // // //                         <div className="flex min-w-0 flex-1 items-center gap-4">
// // // //                           <span style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 34, color: "#C084FC" }}>₹</span>
// // // //                           <input
// // // //                             value={amount}
// // // //                             onChange={(e) => { setAmount(e.target.value.replace(/[^\d]/g, "")); setPaymentError(""); setPaymentSuccess(""); }}
// // // //                             placeholder="0.00" inputMode="numeric"
// // // //                             className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/10"
// // // //                             style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 34, color: "#FFFFFF" }}
// // // //                           />
// // // //                         </div>
// // // //                       </div>
// // // //                       <div className="mt-5 flex items-center gap-2">
// // // //                         <Info className="h-4 w-4 text-[#71717A]" />
// // // //                         <span style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "#71717A" }}>
// // // //                           Minimum add: ₹100. Maximum: ₹1,00,000 per transaction.
// // // //                         </span>
// // // //                       </div>
// // // //                       <div className="mt-5 flex flex-nowrap gap-4 overflow-x-auto pb-1">
// // // //                         {quickAmounts.map((value) => (
// // // //                           <button key={value} type="button"
// // // //                             onClick={() => { setAmount(String(value)); setPaymentError(""); setPaymentSuccess(""); }}
// // // //                             className="h-[40px] shrink-0 rounded-[8px] border border-white/10 px-7"
// // // //                             style={{ background: "#18181B80", ...quickAmountTextStyle }}>
// // // //                             ₹{value}
// // // //                           </button>
// // // //                         ))}
// // // //                       </div>
// // // //                     </div>

// // // //                     {/* ── UPI Section ── */}
// // // //                     {selectedMethod === "upi" && (
// // // //                       <div className="mt-7">
// // // //                         <label style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>
// // // //                           UPI ID{" "}
// // // //                           <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>(optional — enter to prefill)</span>
// // // //                         </label>

// // // //                         <div className="mt-5 flex items-center gap-3" style={{ width: "min(546px, 100%)" }}>
// // // //                           <div className="relative flex-1">
// // // //                             <input
// // // //                               value={upiId}
// // // //                               onChange={(e) => { setUpiId(e.target.value); setPaymentError(""); }}
// // // //                               placeholder="yourname@upi"
// // // //                               className="w-full px-5 outline-none placeholder:text-white/35"
// // // //                               style={{
// // // //                                 height: 50, borderRadius: 16,
// // // //                                 background: "#30302E",
// // // //                                 border: `1px solid ${upiStatus === "valid" ? "rgba(74,222,128,0.5)" : upiStatus === "invalid" ? "rgba(248,113,113,0.5)" : "#FFFFFF1A"}`,
// // // //                                 fontFamily: fontBase, fontWeight: 400, fontSize: 18, color: "#FFFFFF",
// // // //                                 paddingRight: upiStatus !== "idle" ? "40px" : "16px",
// // // //                               }}
// // // //                             />
// // // //                             {upiStatus === "valid"     && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "#4ade80" }} />}
// // // //                             {upiStatus === "invalid"   && <XCircle      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "#f87171" }} />}
// // // //                             {upiStatus === "verifying" && <Loader2      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" style={{ color: "#71717A" }} />}
// // // //                           </div>

// // // //                           <button
// // // //                             type="button"
// // // //                             onClick={handleVerifyUpi}
// // // //                             disabled={!upiId.trim() || upiStatus === "verifying"}
// // // //                             className="h-[50px] shrink-0 rounded-[12px] px-5 text-white disabled:opacity-40 transition-opacity"
// // // //                             style={{
// // // //                               background: upiStatus === "valid"
// // // //                                 ? "linear-gradient(270deg,#4ade80 0%,#22c55e 100%)"
// // // //                                 : "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
// // // //                               fontFamily: fontBase, fontWeight: 700, fontSize: 13,
// // // //                             }}>
// // // //                             {upiStatus === "verifying" ? "Verifying..." : upiStatus === "valid" ? "✓ Verified" : "Verify UPI"}
// // // //                           </button>
// // // //                         </div>

// // // //                         {/* ─── FIX 3: Name display ─── */}
// // // //                         {upiStatus === "valid" && (
// // // //                           <div className="mt-3 flex items-center gap-2">
// // // //                             <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#4ade80" }} />
// // // //                             <span style={{ fontFamily: fontBase, fontWeight: 500, fontSize: 13, color: "#4ade80" }}>
// // // //                               UPI ID verified
// // // //                               {upiName && upiName !== "(Name unavailable in test mode)" && ` — ${upiName}`}
// // // //                             </span>
// // // //                           </div>
// // // //                         )}
// // // //                         {upiStatus === "valid" && upiName === "(Name unavailable in test mode)" && (
// // // //                           <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
// // // //                             Name: Live mode mein account holder ka naam show hoga.
// // // //                           </p>
// // // //                         )}
// // // //                         {upiStatus === "invalid" && upiError && (
// // // //                           <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 13, color: "#f87171" }}>
// // // //                             {upiError}
// // // //                           </p>
// // // //                         )}

// // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
// // // //                           UPI ID optional hai — checkout mein Google Pay, PhonePe, BHIM sab options milenge.
// // // //                         </p>
// // // //                       </div>
// // // //                     )}

// // // //                     {/* ── Net Banking ── */}
// // // //                     {selectedMethod === "netbanking" && (
// // // //                       <div className="mt-7 rounded-[14px] border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.05)" }}>
// // // //                         <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>Net Banking</p>
// // // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, lineHeight: "18px", color: "#71717A" }}>
// // // //                           Razorpay checkout mein apna bank choose karo. Redirect hoke payment complete karo.
// // // //                         </p>
// // // //                       </div>
// // // //                     )}

// // // //                     {/* ─────────────────────────────────────────────────────
// // // //                         FIX 2: QR Section — "Scan & Pay" tab
// // // //                         ───────────────────────────────────────────────────── */}
// // // //                     {selectedMethod === "qr" && (
// // // //                       <div className="mt-7">
// // // //                         <div className="rounded-[14px] border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.04)" }}>
// // // //                           <div className="flex items-center gap-3 mb-4">
// // // //                             <QrCode size={20} style={{ color: "#C084FC" }} />
// // // //                             <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>
// // // //                               Scan & Pay via UPI
// // // //                             </p>
// // // //                           </div>

// // // //                           {!addAmount || addAmount < 100 ? (
// // // //                             <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
// // // //                               Pehle amount enter karein, phir "Confirm & Add Funds" click karein — Razorpay QR screen open hogi.
// // // //                             </p>
// // // //                           ) : (
// // // //                             <div className="space-y-3">
// // // //                               <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
// // // //                                 ₹{fmt(addAmount)} ka QR generate hoga. Kisi bhi UPI app se scan karke pay karein.
// // // //                               </p>
// // // //                               <div className="flex flex-wrap gap-3 mt-2">
// // // //                                 {["Google Pay", "PhonePe", "BHIM", "Paytm"].map((app) => (
// // // //                                   <span key={app} className="rounded-[6px] px-3 py-1 text-xs"
// // // //                                     style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontFamily: fontBase }}>
// // // //                                     {app}
// // // //                                   </span>
// // // //                                 ))}
// // // //                               </div>
// // // //                               <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
// // // //                                 QR 15 minutes ke liye valid rahega. Expire hone par new QR generate karo.
// // // //                               </p>
// // // //                             </div>
// // // //                           )}
// // // //                         </div>
// // // //                       </div>
// // // //                     )}

// // // //                     {/* ── Card: Saved bank accounts ── */}
// // // //                     {selectedMethod === "card" && (
// // // //                       <div className="mt-7">
// // // //                         <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>
// // // //                           Select Saved Bank Account
// // // //                         </p>
// // // //                         <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
// // // //                           Bank transfer request bheja jayega — 1-2 business days mein credit hoga.
// // // //                         </p>

// // // //                         {accounts.length === 0 ? (
// // // //                           <div className="mt-4 rounded-[14px] border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.05)" }}>
// // // //                             <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
// // // //                               Koi saved account nahi hai.{" "}
// // // //                               <button type="button" onClick={() => navigate("/wallet")}
// // // //                                 style={{ color: "#C084FC", textDecoration: "underline" }}>
// // // //                                 Wallet se add karo
// // // //                               </button>
// // // //                             </p>
// // // //                           </div>
// // // //                         ) : (
// // // //                           <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
// // // //                             {accounts.map((account) => {
// // // //                               const active = selectedAccountId === account.id;
// // // //                               return (
// // // //                                 <button key={account.id} type="button"
// // // //                                   onClick={() => { setSelectedAccountId(account.id); setPaymentError(""); }}
// // // //                                   className="flex h-[80px] items-center gap-4 rounded-[12px] border px-4 text-left transition-all"
// // // //                                   style={{
// // // //                                     background:  active ? "rgba(23,23,26,0.72)" : "rgba(255,255,255,0.05)",
// // // //                                     borderColor: active ? "#FF14EF" : "rgba(255,255,255,0.10)",
// // // //                                     boxShadow:   active ? "inset -1px 0 0 #1A73E8" : "none",
// // // //                                   }}>
// // // //                                   <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1A73E8]/20">
// // // //                                     <Landmark className="h-5 w-5 text-[#1A73E8]" />
// // // //                                   </div>
// // // //                                   <div className="min-w-0 flex-1">
// // // //                                     <p className="truncate text-white" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14 }}>
// // // //                                       {account.name}
// // // //                                     </p>
// // // //                                     <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
// // // //                                       •••• {account.last4}
// // // //                                     </p>
// // // //                                   </div>
// // // //                                   {active && <div className="h-4 w-4 shrink-0 rounded-full border-2 border-[#FF14EF] bg-[#FF14EF]" />}
// // // //                                 </button>
// // // //                               );
// // // //                             })}
// // // //                           </div>
// // // //                         )}

// // // //                         <button type="button" onClick={() => navigate("/wallet")}
// // // //                           className="mt-4 flex h-[44px] items-center gap-2 rounded-[10px] border border-dashed border-white/20 px-4"
// // // //                           style={{ background: "rgba(255,255,255,0.04)" }}>
// // // //                           <span style={{ width: 14, height: 14, display: "inline-block", backgroundColor: "#A1A1AA", WebkitMask: "url('/icons/pluss.svg') center / contain no-repeat", mask: "url('/icons/pluss.svg') center / contain no-repeat" }} />
// // // //                           <span style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>
// // // //                             Add New Account
// // // //                           </span>
// // // //                         </button>
// // // //                       </div>
// // // //                     )}

// // // //                   </div>
// // // //                 </div>
// // // //               </div>

// // // //               {/* ── Transaction Summary sidebar ── */}
// // // //               <aside className="relative min-w-0 self-start overflow-hidden border border-white/10"
// // // //                 style={{ width: "100%", minHeight: 471, height: "fit-content", borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// // // //                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_90%,rgba(255,20,239,0.17),transparent_55%)]" />
// // // //                 <div className="relative z-10 p-8">
// // // //                   <h3 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 18, color: "#FFFFFF" }}>Transaction Summary</h3>
// // // //                   <div className="mt-8 space-y-7">
// // // //                     <div className="flex items-center justify-between gap-4">
// // // //                       <span style={summaryLabelStyle}>Subtotal</span>
// // // //                       <span style={summaryValueStyle}>₹{addAmount.toFixed(2)}</span>
// // // //                     </div>
// // // //                     <div className="flex items-center justify-between gap-4">
// // // //                       <span style={summaryLabelStyle}>
// // // //                         {selectedMethod === "card" || selectedMethod === "qr" ? "Service Fee" : "Service Fee (2%)"}
// // // //                       </span>
// // // //                       <span style={summaryValueStyle}>
// // // //                         {selectedMethod === "card" ? "₹0.00" : `₹${serviceFee.toFixed(2)}`}
// // // //                       </span>
// // // //                     </div>
// // // //                     <div className="h-px w-full bg-white/10" />
// // // //                     <div className="flex items-center justify-between gap-3 min-w-0">
// // // //                       <span style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 20, color: "#FFFFFF", whiteSpace: "nowrap", flexShrink: 0 }}>
// // // //                         {selectedMethod === "card" ? "Transfer Amount" : "Debit Amount"}
// // // //                       </span>
// // // //                       <span style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 16, color: "#C084FC", whiteSpace: "nowrap", textAlign: "right" }}>
// // // //                         ₹{selectedMethod === "card" ? addAmount.toFixed(2) : Math.max(debitAmount, 0).toFixed(2)}
// // // //                       </span>
// // // //                     </div>
// // // //                   </div>

// // // //                   <div className="mt-8 flex gap-3 rounded-[14px] p-4" style={{ background: "rgba(3,4,5,0.35)" }}>
// // // //                     <img src="/icons/locky.svg" alt="" className="mt-1 h-5 w-5 shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
// // // //                     <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "#71717A" }}>
// // // //                       {selectedMethod === "card"
// // // //                         ? "Bank transfer request bheja jayega. Verification ke baad 1-2 business days mein credit hoga."
// // // //                         : selectedMethod === "qr"
// // // //                         ? "QR scan karke kisi bhi UPI app se pay karein. Payment instantly credit hogi."
// // // //                         : "Payment secured with end-to-end encryption. Funds appear instantly after confirmation."}
// // // //                     </p>
// // // //                   </div>

// // // //                   {paymentError && (
// // // //                     <div className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white"
// // // //                       style={{ background: "#2A1717", borderColor: "rgba(239,68,68,0.35)" }}>
// // // //                       {paymentError}
// // // //                     </div>
// // // //                   )}
// // // //                   {paymentSuccess && (
// // // //                     <div className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white"
// // // //       style={{ background: "#052A1D", borderColor: "rgba(74,222,128,0.35)" }}>
// // // //                       {paymentSuccess}
// // // //                     </div>
// // // //                   )}

// // // //                   <button
// // // //                     type="button"
// // // //                     disabled={isConfirmDisabled}
// // // //                     onClick={handleConfirmAddFunds}
// // // //                     className="mt-8 h-[49px] w-full rounded-[8px] text-white disabled:opacity-50"
// // // //                     style={{ ...confirmButtonTextStyle, background: "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)" }}>
// // // //                     {payLoading || qrLoading
// // // //                       ? "Processing..."
// // // //                       : selectedMethod === "card"
// // // //                       ? "Submit Transfer Request"
// // // //                       : selectedMethod === "qr"
// // // //                       ? "Generate QR & Pay"
// // // //                       : "Confirm & Add Funds"}
// // // //                   </button>
// // // //                 </div>
// // // //               </aside>
// // // //             </div>
// // // //           </div>
// // // //         </section>
// // // //       </main>

// // // //       <div className="relative z-10 mt-20"><Footer /></div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default AddFunds;




// // // // src/pages/AddFunds.tsx
// // // import { useEffect, useState, useRef, type CSSProperties } from "react";
// // // import { useNavigate } from "react-router-dom";
// // // import Header from "@/components/Header";
// // // import Footer from "@/components/Footer";
// // // import { Info, CreditCard, CheckCircle2, XCircle, Loader2, QrCode } from "lucide-react";
// // // import { useAuth } from "@/contexts/AuthContext";

// // // declare global {
// // //   interface Window { Razorpay: any; }
// // // }

// // // type PaymentMethod = "upi" | "netbanking" | "qr" | "card";
// // // type UpiStatus = "idle" | "verifying" | "valid" | "invalid";

// // // // ─────────────────────────────────────────────────────────────
// // // // FIX 1: Razorpay config — show_default_blocks:false test mode
// // // // mein "No appropriate payment method" error deta hai.
// // // // Sahi approach: DEFAULT blocks ON rakho, par method restrict
// // // // karo `method` field se + hidden array se baaki hide karo.
// // // // ─────────────────────────────────────────────────────────────
// // // const buildRazorpayConfig = (method: "upi" | "netbanking" | "card") => {
// // //   if (method === "card") {
// // //     return {
// // //       display: {
// // //         blocks: {
// // //           card0: {
// // //             name: "Pay via Card",
// // //             instruments: [{ method: "card" }],
// // //           },
// // //         },
// // //         sequence: ["block.card0"],
// // //         preferences: { show_default_blocks: true },
// // //       },
// // //       hidden: [
// // //         { method: "upi" },
// // //         { method: "netbanking" },
// // //         { method: "wallet" },
// // //         { method: "paylater" },
// // //         { method: "emi" },
// // //       ],
// // //     };
// // //   }

// // //   if (method === "upi") {
// // //     return {
// // //       display: {
// // //         blocks: {
// // //           utib0: {
// // //             name: "Pay via UPI",
// // //             instruments: [
// // //               { method: "upi", flows: ["collect", "intent", "qr"] },
// // //             ],
// // //           },
// // //         },
// // //         sequence: ["block.utib0"],
// // //         preferences: { show_default_blocks: true },
// // //       },
// // //       hidden: [
// // //         { method: "card" },
// // //         { method: "netbanking" },
// // //         { method: "wallet" },
// // //         { method: "paylater" },
// // //         { method: "emi" },
// // //       ],
// // //     };
// // //   }

// // //   return {
// // //     display: {
// // //       blocks: {
// // //         nb0: {
// // //           name: "Pay via Net Banking",
// // //           instruments: [{ method: "netbanking" }],
// // //         },
// // //       },
// // //       sequence: ["block.nb0"],
// // //       preferences: { show_default_blocks: true },
// // //     },
// // //     hidden: [
// // //       { method: "card" },
// // //       { method: "upi" },
// // //       { method: "wallet" },
// // //       { method: "paylater" },
// // //       { method: "emi" },
// // //     ],
// // //   };
// // // };

// // // const AddFunds = () => {
// // //   const navigate = useNavigate();
// // //   const { token, user } = useAuth() as any;

// // //   const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";
// // //   const fontBase = "Inter, system-ui, Arial, sans-serif";

// // //   const CREATE_ORDER_URL   = `${API_BASE}/api/wallet/add-fund/create-order`;
// // //   const VERIFY_PAYMENT_URL = `${API_BASE}/api/wallet/add-fund/verify`;
// // //   const WALLET_BALANCE_URL = `${API_BASE}/api/wallet/balance`;
// // //   const UPI_VALIDATE_URL   = `${API_BASE}/api/wallet/upi/validate`;

// // //   const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
// // //   const [amount, setAmount]   = useState("");
// // //   const [upiId, setUpiId]     = useState("");

// // //   // UPI verification state
// // //   const [upiStatus, setUpiStatus]   = useState<UpiStatus>("idle");
// // //   const [upiError, setUpiError]     = useState("");
// // //   const [upiName, setUpiName]       = useState("");

// // //   const [availableBalance, setAvailableBalance] = useState(0);
// // //   const [totalEarning, setTotalEarning]         = useState(0);
// // //   const [monthlyEarning, setMonthlyEarning]     = useState(0);
// // //   const [walletLoading, setWalletLoading]       = useState(false);

// // //   const [payLoading, setPayLoading]         = useState(false);
// // //   const [paymentError, setPaymentError]     = useState("");
// // //   const [paymentSuccess, setPaymentSuccess] = useState("");

// // //   // ─── QR flow state ───
// // //   const [qrLoading, setQrLoading]   = useState(false);
// // //   const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
// // //   const [qrOrderId, setQrOrderId]   = useState<string>("");
// // //   const [qrTopupId, setQrTopupId]   = useState<string>("");
// // //   const qrPollingRef                = useRef<ReturnType<typeof setInterval> | null>(null);

// // //   const getAuthToken = () =>
// // //     token ||
// // //     localStorage.getItem("auth_token") ||
// // //     sessionStorage.getItem("auth_token") ||
// // //     localStorage.getItem("token") ||
// // //     sessionStorage.getItem("token") ||
// // //     "";

// // //   // ── Wallet balance fetch ──
// // //   const fetchWallet = async () => {
// // //     const authToken = getAuthToken();
// // //     if (!authToken) return;
// // //     try {
// // //       setWalletLoading(true);
// // //       const res  = await fetch(WALLET_BALANCE_URL, {
// // //         headers: { Authorization: `Bearer ${authToken}` },
// // //         credentials: "include",
// // //       });
// // //       const data = await res.json().catch(() => ({}));
// // //       if (res.ok && data.success) {
// // //         setAvailableBalance(Number(data.availableBalance || 0));
// // //         setTotalEarning(Number(data.totalRevenue || 0));
// // //         setMonthlyEarning(Number(data.monthlyEarning || 0));
// // //       }
// // //     } catch (err) {
// // //       console.error("wallet fetch error:", err);
// // //     } finally {
// // //       setWalletLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     fetchWallet();
// // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // //   }, [token]);

// // //   // QR tab pe aane par clear karein old QR
// // //   useEffect(() => {
// // //     if (selectedMethod !== "qr") {
// // //       stopQrPolling();
// // //       setQrImageUrl(null);
// // //       setQrOrderId("");
// // //       setQrTopupId("");
// // //     }
// // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // //   }, [selectedMethod]);

// // //   // Cleanup on unmount
// // //   useEffect(() => {
// // //     return () => stopQrPolling();
// // //   }, []);

// // //   // Reset UPI status when UPI ID changes
// // //   useEffect(() => {
// // //     if (upiStatus !== "idle") {
// // //       setUpiStatus("idle");
// // //       setUpiError("");
// // //       setUpiName("");
// // //     }
// // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // //   }, [upiId]);

// // //   const addAmount   = Number(amount || 0);
// // //   const serviceFee  = addAmount > 0 && !["card", "qr"].includes(selectedMethod) ? +(addAmount * 0.02).toFixed(2) : 0;
// // //   const debitAmount = addAmount > 0 ? +(addAmount + serviceFee).toFixed(2) : 0;

// // //   const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);

// // //   // ─────────────────────────────────────────────────────────────
// // //   // QR FLOW
// // //   // ─────────────────────────────────────────────────────────────

// // //   const stopQrPolling = () => {
// // //     if (qrPollingRef.current) {
// // //       clearInterval(qrPollingRef.current);
// // //       qrPollingRef.current = null;
// // //     }
// // //   };

// // //   /**
// // //    * FIX 2 (QR flow):
// // //    * Razorpay mein UPI QR generate karne ke liye:
// // //    * 1. Normal order create karo (selectedMethod: "qr")
// // //    * 2. Razorpay checkout open karo with method: "upi" aur
// // //    *    upi: { flow: "qr" } — ye directly QR screen dikhata hai
// // //    * 3. Ya phir Razorpay Payment Links API se QR image generate karo
// // //    *    aur polling se verify karo
// // //    *
// // //    * Hum yahan Razorpay checkout ka "qr" flow use karenge —
// // //    * ye sabse reliable hai aur extra API nahi chahiye.
// // //    */
// // //   const handleGenerateQr = async () => {
// // //     setPaymentError("");
// // //     const authToken = getAuthToken();

// // //     if (!authToken)                    { setPaymentError("Please login first."); return; }
// // //     if (!addAmount || addAmount < 100) { setPaymentError("Minimum amount is ₹100 for QR payment."); return; }
// // //     if (addAmount > 100000)            { setPaymentError("Maximum ₹1,00,000 per transaction."); return; }
// // //     if (!window.Razorpay)              { setPaymentError("Razorpay not loaded. Check internet."); return; }

// // //     try {
// // //       setQrLoading(true);
// // //       setQrImageUrl(null);

// // //       // Create order with qr method
// // //       const res  = await fetch(CREATE_ORDER_URL, {
// // //         method: "POST",
// // //         headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // //         credentials: "include",
// // //         body: JSON.stringify({ amount: addAmount, selectedMethod: "qr" }),
// // //       });
// // //       const orderData = await res.json().catch(() => ({}));
// // //       if (!res.ok || !orderData.success) throw new Error(orderData.message || "Could not create QR order.");

// // //       const order = orderData?.order || {};
// // //       const orderId = String(order?.id || "");
// // //       const razorpayKey = String(orderData?.key || "");

// // //       setQrOrderId(orderId);
// // //       setQrTopupId(String(orderData?.topupId || ""));

// // //       // ─── Razorpay checkout with UPI QR flow ───
// // //       const cleanEmail   = String(user?.email || "").trim();
// // //       const cleanContact = String(user?.phone || user?.mobile || "").replace(/\D/g, "").slice(-10);
// // //       const cleanName    = String(user?.name || "").trim();

// // //       const prefill: Record<string, string> = {};
// // //       if (cleanName) prefill.name = cleanName;
// // //       if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) prefill.email = cleanEmail;
// // //       if (/^[6-9]\d{9}$/.test(cleanContact)) prefill.contact = cleanContact;

// // //       const options: any = {
// // //         key: razorpayKey,
// // //         order_id: orderId,
// // //         name: "Tokun",
// // //         description: "Add funds via UPI QR",
// // //         image: "/favicon.ico",
// // //         prefill,
// // //         // ─── FIX: test + live dono mein kaam karta hai ───
// // //         // Custom blocks mat use karo QR ke liye — sirf method
// // //         // restrict karo. Razorpay khud UPI screen dikhayega
// // //         // jisme QR option hoga.
// // //         method: {
// // //           upi: true,
// // //           card: false,
// // //           netbanking: false,
// // //           wallet: false,
// // //           paylater: false,
// // //           emi: false,
// // //         },
// // //         config: {
// // //           display: {
// // //             preferences: { show_default_blocks: true },
// // //           },
// // //         },
// // //         theme: { color: "#1A73E8" },
// // //         handler: async (response: any) => {
// // //           try {
// // //             setPayLoading(true);
// // //             const verifyRes = await fetch(VERIFY_PAYMENT_URL, {
// // //               method: "POST",
// // //               headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // //               credentials: "include",
// // //               body: JSON.stringify(response),
// // //             });
// // //             const verifyData = await verifyRes.json().catch(() => ({}));
// // //             if (!verifyRes.ok || !verifyData.success) throw new Error(verifyData.message || "Verification failed.");

// // //             setPaymentSuccess("QR payment successful! Wallet updated.");
// // //             stopQrPolling();
// // //             setQrImageUrl(null);
// // //             await fetchWallet();
// // //             setTimeout(() => navigate("/wallet"), 1500);
// // //           } catch (err: any) {
// // //             setPaymentError(err?.message || "Payment verification failed.");
// // //           } finally {
// // //             setPayLoading(false);
// // //           }
// // //         },
// // //         modal: { ondismiss: () => { setQrLoading(false); stopQrPolling(); } },
// // //       };

// // //       const razorpay = new window.Razorpay(options);
// // //       razorpay.on("payment.failed", (response: any) => {
// // //         setPaymentError(response?.error?.description || "QR payment failed.");
// // //         setQrLoading(false);
// // //         stopQrPolling();
// // //       });
// // //       razorpay.open();

// // //     } catch (err: any) {
// // //       console.error("[QR] error:", err);
// // //       setPaymentError(err?.message || "Could not generate QR.");
// // //     } finally {
// // //       setQrLoading(false);
// // //     }
// // //   };

// // //   // ─────────────────────────────────────────────────────────────
// // //   // UPI Verify Handler
// // //   // ─────────────────────────────────────────────────────────────
// // //   const handleVerifyUpi = async () => {
// // //     if (!upiId.trim()) {
// // //       setUpiError("Please enter a UPI ID first.");
// // //       return;
// // //     }

// // //     const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
// // //     if (!vpaRegex.test(upiId.trim().toLowerCase())) {
// // //       setUpiStatus("invalid");
// // //       setUpiError("Invalid UPI ID format. Example: name@upi");
// // //       setUpiName("");
// // //       return;
// // //     }

// // //     try {
// // //       setUpiStatus("verifying");
// // //       setUpiError("");
// // //       setUpiName("");

// // //       const authToken = getAuthToken();
// // //       const res  = await fetch(UPI_VALIDATE_URL, {
// // //         method: "POST",
// // //         headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // //         credentials: "include",
// // //         body: JSON.stringify({ vpa: upiId.trim() }),
// // //       });
// // //       const data = await res.json().catch(() => ({}));

// // //       if (!res.ok || !data.success || data.error === "invalid_vpa") {
// // //         setUpiStatus("invalid");
// // //         setUpiError(data.message || "UPI ID is invalid or does not exist.");
// // //         return;
// // //       }

// // //       setUpiStatus("valid");
// // //       // ─── FIX 3: Backend se aane wala name set karo ───
// // //       if (data.name) {
// // //         setUpiName(data.name);
// // //       } else if (data.note === "format_only_verified") {
// // //         // Test mode mein name nahi aata — user ko batao
// // //         setUpiName("(Name unavailable in test mode)");
// // //       }
// // //     } catch (err: any) {
// // //       setUpiStatus("invalid");
// // //       setUpiError("Could not verify UPI ID. Please try again.");
// // //     }
// // //   };

// // //   // ─────────────────────────────────────────────────────────────
// // //   // Razorpay order create
// // //   // ─────────────────────────────────────────────────────────────
// // //   const createAddFundOrder = async () => {
// // //     const authToken = getAuthToken();
// // //     const res  = await fetch(CREATE_ORDER_URL, {
// // //       method: "POST",
// // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // //       credentials: "include",
// // //       body: JSON.stringify({ amount: addAmount, selectedMethod }),
// // //     });
// // //     const data = await res.json().catch(() => ({}));
// // //     if (!res.ok || !data.success) throw new Error(data.message || "Could not create payment order.");
// // //     return data;
// // //   };

// // //   const verifyAddFundPayment = async (razorpayResponse: any) => {
// // //     const authToken = getAuthToken();
// // //     const res  = await fetch(VERIFY_PAYMENT_URL, {
// // //       method: "POST",
// // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// // //       credentials: "include",
// // //       body: JSON.stringify(razorpayResponse),
// // //     });
// // //     const data = await res.json().catch(() => ({}));
// // //     if (!res.ok || !data.success) throw new Error(data.message || "Payment verification failed.");
// // //     return data;
// // //   };

// // //   // ─────────────────────────────────────────────────────────────
// // //   // Main payment handler (UPI / NetBanking)
// // //   // ─────────────────────────────────────────────────────────────
// // //   const handleConfirmAddFunds = async () => {
// // //     setPaymentError("");
// // //     setPaymentSuccess("");

// // //     const authToken = getAuthToken();
// // //     if (!authToken)              { setPaymentError("Please login first."); return; }
// // //     if (!addAmount || Number.isNaN(addAmount)) { setPaymentError("Please enter amount."); return; }
// // //     if (addAmount < 100)         { setPaymentError("Minimum add amount is ₹100."); return; }
// // //     if (addAmount > 100000)      { setPaymentError("Maximum amount is ₹1,00,000 per transaction."); return; }

// // //     // ── QR flow — handled by handleGenerateQr separately ──
// // //     if (selectedMethod === "qr") {
// // //       return handleGenerateQr();
// // //     }

// // //     // ── UPI / NetBanking / Card flow: Razorpay ──
// // //     if (!window.Razorpay) {
// // //       setPaymentError("Razorpay not loaded. Please check your internet connection.");
// // //       return;
// // //     }

// // //     if (selectedMethod === "upi" && upiId.trim()) {
// // //       if (upiStatus === "idle") {
// // //         setPaymentError("Please verify your UPI ID before proceeding.");
// // //         return;
// // //       }
// // //       if (upiStatus === "invalid") {
// // //         setPaymentError("Invalid UPI ID. Please enter a valid UPI ID.");
// // //         return;
// // //       }
// // //       if (upiStatus === "verifying") {
// // //         setPaymentError("UPI verification in progress. Please wait.");
// // //         return;
// // //       }
// // //     }

// // //     try {
// // //       setPayLoading(true);
// // //       const orderData = await createAddFundOrder();

// // //       const order = orderData?.order || {};
// // //       const orderId = String(order?.id || "");
// // //       const razorpayKey = String(orderData?.key || "");

// // //       if (!razorpayKey.startsWith("rzp_")) throw new Error("Invalid Razorpay key received from server.");
// // //       if (!orderId.startsWith("order_"))   throw new Error("Invalid Razorpay order received from server.");

// // //       const cleanEmail   = String(user?.email || "").trim();
// // //       const cleanContact = String(user?.phone || user?.mobile || "").replace(/\D/g, "").slice(-10);
// // //       const cleanName    = String(user?.name || "").trim();

// // //       const prefill: Record<string, string> = {};
// // //       if (cleanName) prefill.name = cleanName;
// // //       if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) prefill.email = cleanEmail;
// // //       if (/^[6-9]\d{9}$/.test(cleanContact)) prefill.contact = cleanContact;

// // //       if (selectedMethod === "upi" && upiId.trim() && upiStatus === "valid") {
// // //         prefill.vpa = upiId.trim();
// // //       }

// // //       const options: any = {
// // //         key: razorpayKey,
// // //         order_id: orderId,
// // //         name: "Tokun",
// // //         description: selectedMethod === "upi" ? "Add funds via UPI" : selectedMethod === "netbanking" ? "Add funds via Net Banking" : "Add funds via Card",
// // //         image: "/favicon.ico",
// // //         prefill,
// // //         notes: {
// // //           purpose: "wallet_topup",
// // //           selectedMethod: String(selectedMethod),
// // //           walletAmount: String(addAmount),
// // //         },
// // //         theme: { color: "#1A73E8" },
// // //         // ─── FIX 1 applied here ───
// // //         config: buildRazorpayConfig(selectedMethod as "upi" | "netbanking" | "card"),
// // //         handler: async (response: any) => {
// // //           try {
// // //             setPayLoading(true);
// // //             await verifyAddFundPayment(response);
// // //             setPaymentSuccess("Payment successful! Wallet updated.");
// // //             await fetchWallet();
// // //             setTimeout(() => navigate("/wallet"), 1200);
// // //           } catch (err: any) {
// // //             setPaymentError(err?.message || "Payment verification failed.");
// // //           } finally {
// // //             setPayLoading(false);
// // //           }
// // //         },
// // //         modal: { ondismiss: () => setPayLoading(false) },
// // //       };

// // //       const razorpay = new window.Razorpay(options);
// // //       razorpay.on("payment.failed", (response: any) => {
// // //         setPaymentError(
// // //           response?.error?.description || response?.error?.reason || "Payment failed. Please try again."
// // //         );
// // //         setPayLoading(false);
// // //       });
// // //       razorpay.open();

// // //     } catch (err: any) {
// // //       console.error("[AddFunds] error:", err);
// // //       setPaymentError(err?.message || "Could not start payment.");
// // //       setPayLoading(false);
// // //     }
// // //   };

// // //   // ── Styles ──
// // //   const confirmButtonTextStyle: CSSProperties = {
// // //     fontFamily: fontBase, fontWeight: 700, fontSize: 16, lineHeight: "100%", textAlign: "center",
// // //   };
// // //   const summaryLabelStyle: CSSProperties = {
// // //     fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "#71717A", whiteSpace: "nowrap",
// // //   };
// // //   const summaryValueStyle: CSSProperties = {
// // //     fontFamily: fontBase, fontWeight: 500, fontSize: 14, color: "#FFFFFF", whiteSpace: "nowrap",
// // //   };
// // //   const quickAmountTextStyle: CSSProperties = {
// // //     fontFamily: fontBase, fontWeight: 500, fontSize: 18, textAlign: "center", color: "#FFFFFF",
// // //   };
// // //   const iconStyle: CSSProperties = {
// // //     width: 40, height: 40, opacity: 1, objectFit: "contain", display: "block",
// // //   };

// // //   const paymentMethods = [
// // //     { id: "upi"        as PaymentMethod, title: "UPI",         subtitle: "Instant",         icon: "/icons/upi.svg" },
// // //     { id: "netbanking" as PaymentMethod, title: "Net Banking",  subtitle: "2-3 mins",        icon: "/icons/netbanking.svg" },
// // //     { id: "qr"         as PaymentMethod, title: "Scan QR",      subtitle: "Any UPI App",     icon: "/icons/upi.svg" },
// // //     { id: "card"       as PaymentMethod, title: "Card",        subtitle: "Debit / Credit",  icon: "/icons/addcard.svg" },
// // //   ];
// // //   const quickAmounts = [100, 200, 500, 2000];

// // //   const isConfirmDisabled =
// // //     !addAmount ||
// // //     payLoading ||
// // //     (selectedMethod === "upi" && upiId.trim() !== "" && (upiStatus === "invalid" || upiStatus === "verifying"));

// // //   return (
// // //     <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
// // //       <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
// // //         <img src="/icons/mpbg.png" alt="background" className="absolute inset-0 w-full h-screen object-contain object-top select-none" />
// // //       </div>
// // //       <div className="relative z-20 w-full bg-transparent px-4"><Header /></div>

// // //       <main className="relative z-10 px-4 pt-[95px] pb-20">
// // //         <section className="mx-auto overflow-hidden"
// // //           style={{ width: "min(1024px, 100%)", minHeight: 1269, borderRadius: 30, background: "#21212180", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", fontFamily: fontBase }}>
// // //           <div className="p-8 sm:p-[50px]">

// // //             <button type="button" onClick={() => navigate("/wallet")} className="inline-flex items-center gap-2"
// // //               style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#C084FC" }}>
// // //               ← Back to Wallet
// // //             </button>

// // //             <div className="mt-4">
// // //               <h1 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 36, lineHeight: "100%", color: "#FFFFFF" }}>Add Funds</h1>
// // //               <p className="mt-4 max-w-[590px]" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 16, lineHeight: "24px", color: "#A1A1AA" }}>
// // //                 Add money to your wallet using UPI, Net Banking, QR code or debit/credit card.<br />
// // //                 Funds appear instantly after payment confirmation.
// // //               </p>
// // //             </div>

// // //             <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_294px] gap-5 items-start">
// // //               <div className="space-y-5 min-w-0">

// // //                 {/* ── Balance card ── */}
// // //                 <div className="relative overflow-hidden border border-white/10"
// // //                   style={{ minHeight: 284, borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// // //                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />
// // //                   <div className="relative z-10 p-8">
// // //                     <p style={{ fontFamily: fontBase, fontWeight: 600, fontSize: 12, letterSpacing: "1.2px", color: "#C084FC", textTransform: "uppercase" }}>
// // //                       Current Balance
// // //                     </p>
// // //                     <h2 className="mt-5 text-white" style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 60, lineHeight: "60px" }}>
// // //                       {walletLoading ? "Loading..." : `₹ ${fmt(availableBalance)}`}
// // //                     </h2>
// // //                     <div className="mt-12 h-px w-full bg-white/10" />
// // //                     <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
// // //                       <div>
// // //                         <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Total Earning</p>
// // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, color: "#FFFFFF" }}>
// // //                           {walletLoading ? "—" : `₹${fmt(totalEarning)}`}
// // //                         </p>
// // //                       </div>
// // //                       <div>
// // //                         <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Monthly Earnings</p>
// // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, color: "#ADC6FF" }}>
// // //                           {walletLoading ? "—" : `₹${fmt(monthlyEarning)}`}
// // //                         </p>
// // //                       </div>
// // //                     </div>
// // //                   </div>
// // //                 </div>

// // //                 {/* ── Payment method + inputs ── */}
// // //                 <div className="relative self-start overflow-hidden border border-white/10"
// // //                   style={{ height: "fit-content", borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// // //                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_55%,rgba(255,20,239,0.28),transparent_50%)]" />
// // //                   <div className="relative z-10 p-8">

// // //                     <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>
// // //                       Select Payment Method
// // //                     </p>

// // //                     {/* ── Method tabs (now 4 methods) ── */}
// // //                     <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
// // //                       {paymentMethods.map((method) => {
// // //                         const active = selectedMethod === method.id;
// // //                         return (
// // //                           <button key={method.id} type="button"
// // //                             onClick={() => { setSelectedMethod(method.id); setPaymentError(""); setPaymentSuccess(""); }}
// // //                             className="flex h-[125px] flex-col items-center justify-center rounded-[10px] border text-center"
// // //                             style={{
// // //                               background:  active ? "rgba(23,23,26,0.72)" : "rgba(255,255,255,0.06)",
// // //                               borderColor: active ? "#FF14EF" : "rgba(255,255,255,0.08)",
// // //                               boxShadow:   active ? "inset -1px 0 0 #1A73E8" : "none",
// // //                             }}>
// // //                             {method.id === "qr"
// // //                               ? <QrCode size={36} style={{ color: active ? "#FF14EF" : "rgba(255,255,255,0.5)" }} />
// // //                               : <img src={method.icon} alt="" style={iconStyle} onError={(e) => { e.currentTarget.style.display = "none"; }} />
// // //                             }
// // //                             <p className="mt-4" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#FFFFFF" }}>{method.title}</p>
// // //                             <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{method.subtitle}</p>
// // //                           </button>
// // //                         );
// // //                       })}
// // //                     </div>

// // //                     {/* ── Amount input ── */}
// // //                     <div className="mt-9">
// // //                       <label style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>Enter amount</label>
// // //                       <div className="mt-5 flex items-center px-8"
// // //                         style={{ width: "min(546px, 100%)", height: 60, borderRadius: 16, background: "#18181B80", border: "1px solid #FFFFFF1A" }}>
// // //                         <div className="flex min-w-0 flex-1 items-center gap-4">
// // //                           <span style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 34, color: "#C084FC" }}>₹</span>
// // //                           <input
// // //                             value={amount}
// // //                             onChange={(e) => { setAmount(e.target.value.replace(/[^\d]/g, "")); setPaymentError(""); setPaymentSuccess(""); }}
// // //                             placeholder="0.00" inputMode="numeric"
// // //                             className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/10"
// // //                             style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 34, color: "#FFFFFF" }}
// // //                           />
// // //                         </div>
// // //                       </div>
// // //                       <div className="mt-5 flex items-center gap-2">
// // //                         <Info className="h-4 w-4 text-[#71717A]" />
// // //                         <span style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "#71717A" }}>
// // //                           Minimum add: ₹100. Maximum: ₹1,00,000 per transaction.
// // //                         </span>
// // //                       </div>
// // //                       <div className="mt-5 flex flex-nowrap gap-4 overflow-x-auto pb-1">
// // //                         {quickAmounts.map((value) => (
// // //                           <button key={value} type="button"
// // //                             onClick={() => { setAmount(String(value)); setPaymentError(""); setPaymentSuccess(""); }}
// // //                             className="h-[40px] shrink-0 rounded-[8px] border border-white/10 px-7"
// // //                             style={{ background: "#18181B80", ...quickAmountTextStyle }}>
// // //                             ₹{value}
// // //                           </button>
// // //                         ))}
// // //                       </div>
// // //                     </div>

// // //                     {/* ── UPI Section ── */}
// // //                     {selectedMethod === "upi" && (
// // //                       <div className="mt-7">
// // //                         <label style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>
// // //                           UPI ID{" "}
// // //                           <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>(optional — enter to prefill)</span>
// // //                         </label>

// // //                         <div className="mt-5 flex items-center gap-3" style={{ width: "min(546px, 100%)" }}>
// // //                           <div className="relative flex-1">
// // //                             <input
// // //                               value={upiId}
// // //                               onChange={(e) => { setUpiId(e.target.value); setPaymentError(""); }}
// // //                               placeholder="yourname@upi"
// // //                               className="w-full px-5 outline-none placeholder:text-white/35"
// // //                               style={{
// // //                                 height: 50, borderRadius: 16,
// // //                                 background: "#30302E",
// // //                                 border: `1px solid ${upiStatus === "valid" ? "rgba(74,222,128,0.5)" : upiStatus === "invalid" ? "rgba(248,113,113,0.5)" : "#FFFFFF1A"}`,
// // //                                 fontFamily: fontBase, fontWeight: 400, fontSize: 18, color: "#FFFFFF",
// // //                                 paddingRight: upiStatus !== "idle" ? "40px" : "16px",
// // //                               }}
// // //                             />
// // //                             {upiStatus === "valid"     && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "#4ade80" }} />}
// // //                             {upiStatus === "invalid"   && <XCircle      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "#f87171" }} />}
// // //                             {upiStatus === "verifying" && <Loader2      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" style={{ color: "#71717A" }} />}
// // //                           </div>

// // //                           <button
// // //                             type="button"
// // //                             onClick={handleVerifyUpi}
// // //                             disabled={!upiId.trim() || upiStatus === "verifying"}
// // //                             className="h-[50px] shrink-0 rounded-[12px] px-5 text-white disabled:opacity-40 transition-opacity"
// // //                             style={{
// // //                               background: upiStatus === "valid"
// // //                                 ? "linear-gradient(270deg,#4ade80 0%,#22c55e 100%)"
// // //                                 : "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
// // //                               fontFamily: fontBase, fontWeight: 700, fontSize: 13,
// // //                             }}>
// // //                             {upiStatus === "verifying" ? "Verifying..." : upiStatus === "valid" ? "✓ Verified" : "Verify UPI"}
// // //                           </button>
// // //                         </div>

// // //                         {/* ─── FIX 3: Name display ─── */}
// // //                         {upiStatus === "valid" && (
// // //                           <div className="mt-3 flex items-center gap-2">
// // //                             <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#4ade80" }} />
// // //                             <span style={{ fontFamily: fontBase, fontWeight: 500, fontSize: 13, color: "#4ade80" }}>
// // //                               UPI ID verified
// // //                               {upiName && upiName !== "(Name unavailable in test mode)" && ` — ${upiName}`}
// // //                             </span>
// // //                           </div>
// // //                         )}
// // //                         {upiStatus === "valid" && upiName === "(Name unavailable in test mode)" && (
// // //                           <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
// // //                             Name: Live mode mein account holder ka naam show hoga.
// // //                           </p>
// // //                         )}
// // //                         {upiStatus === "invalid" && upiError && (
// // //                           <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 13, color: "#f87171" }}>
// // //                             {upiError}
// // //                           </p>
// // //                         )}

                        
// // //                       </div>
// // //                     )}

// // //                     {/* ── Net Banking ── */}
// // //                     {selectedMethod === "netbanking" && (
// // //                       <div className="mt-7 rounded-[14px] border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.05)" }}>
// // //                         <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>Net Banking</p>
// // //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, lineHeight: "18px", color: "#71717A" }}>
// // //                           Razorpay checkout mein apna bank choose karo. Redirect hoke payment complete karo.
// // //                         </p>
// // //                       </div>
// // //                     )}

// // //                     {/* ─────────────────────────────────────────────────────
// // //                         FIX 2: QR Section — "Scan & Pay" tab
// // //                         ───────────────────────────────────────────────────── */}
// // //                     {selectedMethod === "qr" && (
// // //                       <div className="mt-7">
// // //                         <div className="rounded-[14px] border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.04)" }}>
// // //                           <div className="flex items-center gap-3 mb-4">
// // //                             <QrCode size={20} style={{ color: "#C084FC" }} />
// // //                             <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>
// // //                               Scan & Pay via UPI
// // //                             </p>
// // //                           </div>

// // //                           {!addAmount || addAmount < 100 ? (
// // //                             <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
// // //                               Pehle amount enter karein, phir "Confirm & Add Funds" click karein — Razorpay QR screen open hogi.
// // //                             </p>
// // //                           ) : (
// // //                             <div className="space-y-3">
// // //                               <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
// // //                                 ₹{fmt(addAmount)} ka QR generate hoga. Kisi bhi UPI app se scan karke pay karein.
// // //                               </p>
// // //                               <div className="flex flex-wrap gap-3 mt-2">
// // //                                 {["Google Pay", "PhonePe", "BHIM", "Paytm"].map((app) => (
// // //                                   <span key={app} className="rounded-[6px] px-3 py-1 text-xs"
// // //                                     style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontFamily: fontBase }}>
// // //                                     {app}
// // //                                   </span>
// // //                                 ))}
// // //                               </div>
// // //                               <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
// // //                                 QR 15 minutes ke liye valid rahega. Expire hone par new QR generate karo.
// // //                               </p>
// // //                             </div>
// // //                           )}
// // //                         </div>
// // //                       </div>
// // //                     )}

// // //                     {/* ── Card Section ── */}
// // //                     {selectedMethod === "card" && (
// // //                       <div className="mt-7">
// // //                         <div className="rounded-[14px] border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.04)" }}>
// // //                           <div className="flex items-start gap-4">
// // //                             <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1A73E8]/20">
// // //                               <CreditCard className="h-5 w-5 text-[#1A73E8]" />
// // //                             </div>
// // //                             <div>
// // //                               <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>
// // //                                 Pay via Debit / Credit Card
// // //                               </p>
// // //                               <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, lineHeight: "18px", color: "#71717A" }}>
// // //                                 Razorpay checkout open hoga. Card details Razorpay ke secure page par enter karke payment complete karein.
// // //                                 Payment success hote hi wallet automatically credit ho jayega.
// // //                               </p>
// // //                               <div className="mt-4 flex flex-wrap gap-3">
// // //                                 {["Debit Card", "Credit Card", "Rupay", "Visa", "Mastercard"].map((item) => (
// // //                                   <span key={item} className="rounded-[6px] px-3 py-1 text-xs"
// // //                                     style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontFamily: fontBase }}>
// // //                                     {item}
// // //                                   </span>
// // //                                 ))}
// // //                               </div>
// // //                             </div>
// // //                           </div>
// // //                         </div>
// // //                       </div>
// // //                     )}

// // //                   </div>
// // //                 </div>
// // //               </div>

// // //               {/* ── Transaction Summary sidebar ── */}
// // //               <aside className="relative min-w-0 self-start overflow-hidden border border-white/10"
// // //                 style={{ width: "100%", minHeight: 471, height: "fit-content", borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// // //                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_90%,rgba(255,20,239,0.17),transparent_55%)]" />
// // //                 <div className="relative z-10 p-8">
// // //                   <h3 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 18, color: "#FFFFFF" }}>Transaction Summary</h3>
// // //                   <div className="mt-8 space-y-7">
// // //                     <div className="flex items-center justify-between gap-4">
// // //                       <span style={summaryLabelStyle}>Subtotal</span>
// // //                       <span style={summaryValueStyle}>₹{addAmount.toFixed(2)}</span>
// // //                     </div>
// // //                     <div className="flex items-center justify-between gap-4">
// // //                       <span style={summaryLabelStyle}>
// // //                         {["card", "qr"].includes(selectedMethod) ? "Service Fee" : "Service Fee (2%)"}
// // //                       </span>
// // //                       <span style={summaryValueStyle}>
// // //                         {`₹${serviceFee.toFixed(2)}`}
// // //                       </span>
// // //                     </div>
// // //                     <div className="h-px w-full bg-white/10" />
// // //                     <div className="flex items-center justify-between gap-3 min-w-0">
// // //                       <span style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 20, color: "#FFFFFF", whiteSpace: "nowrap", flexShrink: 0 }}>
// // //                         Debit Amount
// // //                       </span>
// // //                       <span style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 16, color: "#C084FC", whiteSpace: "nowrap", textAlign: "right" }}>
// // //                         ₹{Math.max(debitAmount, 0).toFixed(2)}
// // //                       </span>
// // //                     </div>
// // //                   </div>

// // //                   <div className="mt-8 flex gap-3 rounded-[14px] p-4" style={{ background: "rgba(3,4,5,0.35)" }}>
// // //                     <img src="/icons/locky.svg" alt="" className="mt-1 h-5 w-5 shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
// // //                     <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "#71717A" }}>
// // //                       {selectedMethod === "card"
// // //                         ? "Card payment Razorpay ke secure checkout se hoga. Payment success hote hi wallet instantly credit hoga."
// // //                         : selectedMethod === "qr"
// // //                         ? "QR scan karke kisi bhi UPI app se pay karein. Payment instantly credit hogi."
// // //                         : "Payment secured with end-to-end encryption. Funds appear instantly after confirmation."}
// // //                     </p>
// // //                   </div>

// // //                   {paymentError && (
// // //                     <div className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white"
// // //                       style={{ background: "#2A1717", borderColor: "rgba(239,68,68,0.35)" }}>
// // //                       {paymentError}
// // //                     </div>
// // //                   )}
// // //                   {paymentSuccess && (
// // //                     <div className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white"
// // //       style={{ background: "#052A1D", borderColor: "rgba(74,222,128,0.35)" }}>
// // //                       {paymentSuccess}
// // //                     </div>
// // //                   )}

// // //                   <button
// // //                     type="button"
// // //                     disabled={isConfirmDisabled}
// // //                     onClick={handleConfirmAddFunds}
// // //                     className="mt-8 h-[49px] w-full rounded-[8px] text-white disabled:opacity-50"
// // //                     style={{ ...confirmButtonTextStyle, background: "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)" }}>
// // //                     {payLoading || qrLoading
// // //                       ? "Processing..."
// // //                       : selectedMethod === "card"
// // //                       ? "Pay with Card"
// // //                       : selectedMethod === "qr"
// // //                       ? "Generate QR & Pay"
// // //                       : "Confirm & Add Funds"}
// // //                   </button>
// // //                 </div>
// // //               </aside>
// // //             </div>
// // //           </div>
// // //         </section>
// // //       </main>

// // //       <div className="relative z-10 mt-20"><Footer /></div>
// // //     </div>
// // //   );
// // // };

// // // export default AddFunds;






// // // src/pages/AddFunds.tsx
// // import { useEffect, useState, useRef, type CSSProperties } from "react";
// // import { useNavigate } from "react-router-dom";
// // import Header from "@/components/Header";
// // import Footer from "@/components/Footer";
// // import { Info, CreditCard, CheckCircle2, XCircle, Loader2, QrCode } from "lucide-react";
// // import { useAuth } from "@/contexts/AuthContext";

// // declare global {
// //   interface Window { Razorpay: any; }
// // }

// // type PaymentMethod = "upi" | "netbanking" | "qr" | "card";
// // type UpiStatus = "idle" | "verifying" | "valid" | "invalid";

// // // ─────────────────────────────────────────────────────────────
// // // FIX: buildRazorpayConfig HATA DIYA — "hidden" array test mode
// // // mein UPI ko completely block kar deta tha.
// // //
// // // Naya approach: sirf `method` object use karo —
// // // jo dikhana hai wo true, baaki false.
// // // Ye test + live dono mein sahi kaam karta hai.
// // // ─────────────────────────────────────────────────────────────
// // const getMethodConfig = (method: "upi" | "netbanking" | "card" | "qr") => {
// //   if (method === "upi" || method === "qr") {
// //     return {
// //       upi: true,
// //       card: false,
// //       netbanking: false,
// //       wallet: false,
// //       paylater: false,
// //       emi: false,
// //     };
// //   }
// //   if (method === "netbanking") {
// //     return {
// //       upi: false,
// //       card: false,
// //       netbanking: true,
// //       wallet: false,
// //       paylater: false,
// //       emi: false,
// //     };
// //   }
// //   // card
// //   return {
// //     upi: false,
// //     card: true,
// //     netbanking: false,
// //     wallet: false,
// //     paylater: false,
// //     emi: false,
// //   };
// // };

// // const AddFunds = () => {
// //   const navigate = useNavigate();
// //   const { token, user } = useAuth() as any;

// //   const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";
// //   const fontBase = "Inter, system-ui, Arial, sans-serif";

// //   const CREATE_ORDER_URL   = `${API_BASE}/api/wallet/add-fund/create-order`;
// //   const VERIFY_PAYMENT_URL = `${API_BASE}/api/wallet/add-fund/verify`;
// //   const WALLET_BALANCE_URL = `${API_BASE}/api/wallet/balance`;
// //   const UPI_VALIDATE_URL   = `${API_BASE}/api/wallet/upi/validate`;

// //   const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
// //   const [amount, setAmount]   = useState("");
// //   const [upiId, setUpiId]     = useState("");

// //   const [upiStatus, setUpiStatus]   = useState<UpiStatus>("idle");
// //   const [upiError, setUpiError]     = useState("");
// //   const [upiName, setUpiName]       = useState("");

// //   const [availableBalance, setAvailableBalance] = useState(0);
// //   const [totalEarning, setTotalEarning]         = useState(0);
// //   const [monthlyEarning, setMonthlyEarning]     = useState(0);
// //   const [walletLoading, setWalletLoading]       = useState(false);

// //   const [payLoading, setPayLoading]         = useState(false);
// //   const [paymentError, setPaymentError]     = useState("");
// //   const [paymentSuccess, setPaymentSuccess] = useState("");

// //   const [qrLoading, setQrLoading] = useState(false);
// //   const qrPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

// //   const getAuthToken = () =>
// //     token ||
// //     localStorage.getItem("auth_token") ||
// //     sessionStorage.getItem("auth_token") ||
// //     localStorage.getItem("token") ||
// //     sessionStorage.getItem("token") ||
// //     "";

// //   const fetchWallet = async () => {
// //     const authToken = getAuthToken();
// //     if (!authToken) return;
// //     try {
// //       setWalletLoading(true);
// //       const res  = await fetch(WALLET_BALANCE_URL, {
// //         headers: { Authorization: `Bearer ${authToken}` },
// //         credentials: "include",
// //       });
// //       const data = await res.json().catch(() => ({}));
// //       if (res.ok && data.success) {
// //         setAvailableBalance(Number(data.availableBalance || 0));
// //         setTotalEarning(Number(data.totalRevenue || 0));
// //         setMonthlyEarning(Number(data.monthlyEarning || 0));
// //       }
// //     } catch (err) {
// //       console.error("wallet fetch error:", err);
// //     } finally {
// //       setWalletLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchWallet();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [token]);

// //   useEffect(() => {
// //     if (selectedMethod !== "qr") {
// //       stopQrPolling();
// //     }
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [selectedMethod]);

// //   useEffect(() => {
// //     return () => stopQrPolling();
// //   }, []);

// //   useEffect(() => {
// //     if (upiStatus !== "idle") {
// //       setUpiStatus("idle");
// //       setUpiError("");
// //       setUpiName("");
// //     }
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [upiId]);

// //   const addAmount   = Number(amount || 0);
// //   // QR aur card pe service fee nahi
// //   const serviceFee  = addAmount > 0 && !["card", "qr"].includes(selectedMethod)
// //     ? +(addAmount * 0.02).toFixed(2)
// //     : 0;
// //   const debitAmount = addAmount > 0 ? +(addAmount + serviceFee).toFixed(2) : 0;

// //   const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);

// //   const confirmButtonTextStyle: CSSProperties = {
// //     fontFamily: fontBase, fontWeight: 700, fontSize: 16, lineHeight: "100%", textAlign: "center",
// //   };
// //   const summaryLabelStyle: CSSProperties = {
// //     fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "#71717A", whiteSpace: "nowrap",
// //   };
// //   const summaryValueStyle: CSSProperties = {
// //     fontFamily: fontBase, fontWeight: 500, fontSize: 14, color: "#FFFFFF", whiteSpace: "nowrap",
// //   };
// //   const quickAmountTextStyle: CSSProperties = {
// //     fontFamily: fontBase, fontWeight: 500, fontSize: 18, textAlign: "center", color: "#FFFFFF",
// //   };
// //   const iconStyle: CSSProperties = {
// //     width: 40, height: 40, opacity: 1, objectFit: "contain", display: "block",
// //   };

// //   const stopQrPolling = () => {
// //     if (qrPollingRef.current) {
// //       clearInterval(qrPollingRef.current);
// //       qrPollingRef.current = null;
// //     }
// //   };

// //   const handleVerifyUpi = async () => {
// //     if (!upiId.trim()) {
// //       setUpiError("Please enter a UPI ID first.");
// //       return;
// //     }

// //     const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
// //     if (!vpaRegex.test(upiId.trim().toLowerCase())) {
// //       setUpiStatus("invalid");
// //       setUpiError("Invalid UPI ID format. Example: name@upi");
// //       setUpiName("");
// //       return;
// //     }

// //     try {
// //       setUpiStatus("verifying");
// //       setUpiError("");
// //       setUpiName("");

// //       const authToken = getAuthToken();
// //       const res  = await fetch(UPI_VALIDATE_URL, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// //         credentials: "include",
// //         body: JSON.stringify({ vpa: upiId.trim() }),
// //       });
// //       const data = await res.json().catch(() => ({}));

// //       if (!res.ok || !data.success || data.error === "invalid_vpa") {
// //         setUpiStatus("invalid");
// //         setUpiError(data.message || "UPI ID is invalid or does not exist.");
// //         return;
// //       }

// //       setUpiStatus("valid");
// //       if (data.name) {
// //         setUpiName(data.name);
// //       } else if (data.note === "format_only_verified") {
// //         setUpiName("(Name unavailable in test mode)");
// //       }
// //     } catch (err: any) {
// //       setUpiStatus("invalid");
// //       setUpiError("Could not verify UPI ID. Please try again.");
// //     }
// //   };

// //   const createAddFundOrder = async () => {
// //     const authToken = getAuthToken();
// //     const res  = await fetch(CREATE_ORDER_URL, {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// //       credentials: "include",
// //       body: JSON.stringify({ amount: addAmount, selectedMethod }),
// //     });
// //     const data = await res.json().catch(() => ({}));
// //     if (!res.ok || !data.success) throw new Error(data.message || "Could not create payment order.");
// //     return data;
// //   };

// //   const verifyAddFundPayment = async (razorpayResponse: any) => {
// //     const authToken = getAuthToken();
// //     const res  = await fetch(VERIFY_PAYMENT_URL, {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
// //       credentials: "include",
// //       body: JSON.stringify(razorpayResponse),
// //     });
// //     const data = await res.json().catch(() => ({}));
// //     if (!res.ok || !data.success) throw new Error(data.message || "Payment verification failed.");
// //     return data;
// //   };

// //   // ─────────────────────────────────────────────────────────────
// //   // MAIN PAYMENT HANDLER
// //   // FIX: config.display.blocks aur hidden array HATA DIYA
// //   // Sirf method: { upi: true/false, ... } use hoga
// //   // Ye test mode mein bhi UPI dikhata hai
// //   // ─────────────────────────────────────────────────────────────
// //   const handleConfirmAddFunds = async () => {
// //     setPaymentError("");
// //     setPaymentSuccess("");

// //     const authToken = getAuthToken();
// //     if (!authToken)              { setPaymentError("Please login first."); return; }
// //     if (!addAmount || Number.isNaN(addAmount)) { setPaymentError("Please enter amount."); return; }
// //     if (addAmount < 100)         { setPaymentError("Minimum add amount is ₹100."); return; }
// //     if (addAmount > 100000)      { setPaymentError("Maximum amount is ₹1,00,000 per transaction."); return; }

// //     if (!window.Razorpay) {
// //       setPaymentError("Razorpay not loaded. Please check your internet connection.");
// //       return;
// //     }

// //     // UPI ID entered hai to verify check
// //     if (selectedMethod === "upi" && upiId.trim()) {
// //       if (upiStatus === "idle") {
// //         setPaymentError("Please verify your UPI ID before proceeding.");
// //         return;
// //       }
// //       if (upiStatus === "invalid") {
// //         setPaymentError("Invalid UPI ID. Please enter a valid UPI ID.");
// //         return;
// //       }
// //       if (upiStatus === "verifying") {
// //         setPaymentError("UPI verification in progress. Please wait.");
// //         return;
// //       }
// //     }

// //     try {
// //       setPayLoading(true);
// //       if (selectedMethod === "qr") setQrLoading(true);

// //       const orderData = await createAddFundOrder();

// //       const order = orderData?.order || {};
// //       const orderId = String(order?.id || "");
// //       const razorpayKey = String(orderData?.key || "");

// //       if (!razorpayKey.startsWith("rzp_")) throw new Error("Invalid Razorpay key received from server.");
// //       if (!orderId.startsWith("order_"))   throw new Error("Invalid Razorpay order received from server.");

// //       const cleanEmail   = String(user?.email || "").trim();
// //       const cleanContact = String(user?.phone || user?.mobile || "").replace(/\D/g, "").slice(-10);
// //       const cleanName    = String(user?.name || "").trim();

// //       const prefill: Record<string, string> = {};
// //       if (cleanName) prefill.name = cleanName;
// //       if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) prefill.email = cleanEmail;
// //       if (/^[6-9]\d{9}$/.test(cleanContact)) prefill.contact = cleanContact;

// //       if (selectedMethod === "upi" && upiId.trim() && upiStatus === "valid") {
// //         prefill.vpa = upiId.trim();
// //       }

// //       // ─── FIX: sirf method object use karo ───
// //       // hidden array aur display.blocks BILKUL MAT LAGAO
// //       // Razorpay khud method ke basis pe sahi tab dikhata hai
// //       const methodConfig = getMethodConfig(selectedMethod);

// //       const options: any = {
// //         key: razorpayKey,
// //         order_id: orderId,
// //         name: "Tokun",
// //         description:
// //           selectedMethod === "upi" ? "Add funds via UPI" :
// //           selectedMethod === "qr"  ? "Add funds via UPI QR" :
// //           selectedMethod === "netbanking" ? "Add funds via Net Banking" :
// //           "Add funds via Card",
// //         image: "/favicon.ico",
// //         prefill,
// //         notes: {
// //           purpose: "wallet_topup",
// //           selectedMethod: String(selectedMethod),
// //           walletAmount: String(addAmount),
// //         },
// //         // ─── SIRF YE DO CHEEZEIN LAGAO ───
// //         method: methodConfig,
// //         theme: { color: "#1A73E8" },
// //         // ─── handler ───
// //         handler: async (response: any) => {
// //           try {
// //             setPayLoading(true);
// //             await verifyAddFundPayment(response);
// //             setPaymentSuccess("Payment successful! Wallet updated.");
// //             await fetchWallet();
// //             setTimeout(() => navigate("/wallet"), 1200);
// //           } catch (err: any) {
// //             setPaymentError(err?.message || "Payment verification failed.");
// //           } finally {
// //             setPayLoading(false);
// //             setQrLoading(false);
// //           }
// //         },
// //         modal: {
// //           ondismiss: () => {
// //             setPayLoading(false);
// //             setQrLoading(false);
// //             stopQrPolling();
// //           },
// //         },
// //       };

// //       const razorpay = new window.Razorpay(options);
// //       razorpay.on("payment.failed", (response: any) => {
// //         setPaymentError(
// //           response?.error?.description || response?.error?.reason || "Payment failed. Please try again."
// //         );
// //         setPayLoading(false);
// //         setQrLoading(false);
// //         stopQrPolling();
// //       });
// //       razorpay.open();

// //     } catch (err: any) {
// //       console.error("[AddFunds] error:", err);
// //       setPaymentError(err?.message || "Could not start payment.");
// //       setPayLoading(false);
// //       setQrLoading(false);
// //     }
// //   };

// //   const paymentMethods = [
// //     { id: "upi"        as PaymentMethod, title: "UPI",         subtitle: "Instant",         icon: "/icons/upi.svg" },
// //     { id: "netbanking" as PaymentMethod, title: "Net Banking",  subtitle: "2-3 mins",        icon: "/icons/netbanking.svg" },
// //     { id: "qr"         as PaymentMethod, title: "Scan QR",      subtitle: "Any UPI App",     icon: "/icons/upi.svg" },
// //     { id: "card"       as PaymentMethod, title: "Card",        subtitle: "Debit / Credit",  icon: "/icons/addcard.svg" },
// //   ];
// //   const quickAmounts = [100, 200, 500, 2000];

// //   const isConfirmDisabled =
// //     !addAmount ||
// //     payLoading ||
// //     qrLoading ||
// //     (selectedMethod === "upi" && upiId.trim() !== "" && (upiStatus === "invalid" || upiStatus === "verifying"));

// //   return (
// //     <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
// //       <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
// //         <img src="/icons/mpbg.png" alt="background" className="absolute inset-0 w-full h-screen object-contain object-top select-none" />
// //       </div>
// //       <div className="relative z-20 w-full bg-transparent px-4"><Header /></div>

// //       <main className="relative z-10 px-4 pt-[95px] pb-20">
// //         <section className="mx-auto overflow-hidden"
// //           style={{ width: "min(1024px, 100%)", minHeight: 1269, borderRadius: 30, background: "#21212180", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", fontFamily: fontBase }}>
// //           <div className="p-8 sm:p-[50px]">

// //             <button type="button" onClick={() => navigate("/wallet")} className="inline-flex items-center gap-2"
// //               style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#C084FC" }}>
// //               ← Back to Wallet
// //             </button>

// //             <div className="mt-4">
// //               <h1 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 36, lineHeight: "100%", color: "#FFFFFF" }}>Add Funds</h1>
// //               <p className="mt-4 max-w-[590px]" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 16, lineHeight: "24px", color: "#A1A1AA" }}>
// //                 Add money to your wallet using UPI, Net Banking, QR code or debit/credit card.<br />
// //                 Funds appear instantly after payment confirmation.
// //               </p>
// //             </div>

// //             <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_294px] gap-5 items-start">
// //               <div className="space-y-5 min-w-0">

// //                 {/* ── Balance card ── */}
// //                 <div className="relative overflow-hidden border border-white/10"
// //                   style={{ minHeight: 284, borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// //                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />
// //                   <div className="relative z-10 p-8">
// //                     <p style={{ fontFamily: fontBase, fontWeight: 600, fontSize: 12, letterSpacing: "1.2px", color: "#C084FC", textTransform: "uppercase" }}>
// //                       Current Balance
// //                     </p>
// //                     <h2 className="mt-5 text-white" style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 60, lineHeight: "60px" }}>
// //                       {walletLoading ? "Loading..." : `₹ ${fmt(availableBalance)}`}
// //                     </h2>
// //                     <div className="mt-12 h-px w-full bg-white/10" />
// //                     <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
// //                       <div>
// //                         <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Total Earning</p>
// //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, color: "#FFFFFF" }}>
// //                           {walletLoading ? "—" : `₹${fmt(totalEarning)}`}
// //                         </p>
// //                       </div>
// //                       <div>
// //                         <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Monthly Earnings</p>
// //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, color: "#ADC6FF" }}>
// //                           {walletLoading ? "—" : `₹${fmt(monthlyEarning)}`}
// //                         </p>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {/* ── Payment method + inputs ── */}
// //                 <div className="relative self-start overflow-hidden border border-white/10"
// //                   style={{ height: "fit-content", borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// //                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_55%,rgba(255,20,239,0.28),transparent_50%)]" />
// //                   <div className="relative z-10 p-8">

// //                     <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>
// //                       Select Payment Method
// //                     </p>

// //                     <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
// //                       {paymentMethods.map((method) => {
// //                         const active = selectedMethod === method.id;
// //                         return (
// //                           <button key={method.id} type="button"
// //                             onClick={() => { setSelectedMethod(method.id); setPaymentError(""); setPaymentSuccess(""); }}
// //                             className="flex h-[125px] flex-col items-center justify-center rounded-[10px] border text-center"
// //                             style={{
// //                               background:  active ? "rgba(23,23,26,0.72)" : "rgba(255,255,255,0.06)",
// //                               borderColor: active ? "#FF14EF" : "rgba(255,255,255,0.08)",
// //                               boxShadow:   active ? "inset -1px 0 0 #1A73E8" : "none",
// //                             }}>
// //                             {method.id === "qr"
// //                               ? <QrCode size={36} style={{ color: active ? "#FF14EF" : "rgba(255,255,255,0.5)" }} />
// //                               : <img src={method.icon} alt="" style={iconStyle} onError={(e) => { e.currentTarget.style.display = "none"; }} />
// //                             }
// //                             <p className="mt-4" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#FFFFFF" }}>{method.title}</p>
// //                             <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{method.subtitle}</p>
// //                           </button>
// //                         );
// //                       })}
// //                     </div>

// //                     {/* ── Amount input ── */}
// //                     <div className="mt-9">
// //                       <label style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>Enter amount</label>
// //                       <div className="mt-5 flex items-center px-8"
// //                         style={{ width: "min(546px, 100%)", height: 60, borderRadius: 16, background: "#18181B80", border: "1px solid #FFFFFF1A" }}>
// //                         <div className="flex min-w-0 flex-1 items-center gap-4">
// //                           <span style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 34, color: "#C084FC" }}>₹</span>
// //                           <input
// //                             value={amount}
// //                             onChange={(e) => { setAmount(e.target.value.replace(/[^\d]/g, "")); setPaymentError(""); setPaymentSuccess(""); }}
// //                             placeholder="0.00" inputMode="numeric"
// //                             className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/10"
// //                             style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 34, color: "#FFFFFF" }}
// //                           />
// //                         </div>
// //                       </div>
// //                       <div className="mt-5 flex items-center gap-2">
// //                         <Info className="h-4 w-4 text-[#71717A]" />
// //                         <span style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "#71717A" }}>
// //                           Minimum add: ₹100. Maximum: ₹1,00,000 per transaction.
// //                         </span>
// //                       </div>
// //                       <div className="mt-5 flex flex-nowrap gap-4 overflow-x-auto pb-1">
// //                         {quickAmounts.map((value) => (
// //                           <button key={value} type="button"
// //                             onClick={() => { setAmount(String(value)); setPaymentError(""); setPaymentSuccess(""); }}
// //                             className="h-[40px] shrink-0 rounded-[8px] border border-white/10 px-7"
// //                             style={{ background: "#18181B80", ...quickAmountTextStyle }}>
// //                             ₹{value}
// //                           </button>
// //                         ))}
// //                       </div>
// //                     </div>

// //                     {/* ── UPI Section ── */}
// //                     {selectedMethod === "upi" && (
// //                       <div className="mt-7">
// //                         <label style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>
// //                           UPI ID{" "}
// //                           <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>(optional — enter to prefill)</span>
// //                         </label>

// //                         {/* Test mode helper */}
// //                         <div className="mt-3 rounded-[10px] border border-white/10 px-4 py-3"
// //                           style={{ background: "rgba(255,255,255,0.04)" }}>
// //                           <p style={{ fontFamily: fontBase, fontWeight: 600, fontSize: 12, color: "#C084FC" }}>
// //                             Test Mode UPI IDs:
// //                           </p>
// //                           <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
// //                             ✅ Success: <code className="text-white">success@razorpay</code>
// //                             &nbsp;&nbsp;❌ Failure: <code className="text-white">failure@razorpay</code>
// //                           </p>
// //                         </div>

// //                         <div className="mt-5 flex items-center gap-3" style={{ width: "min(546px, 100%)" }}>
// //                           <div className="relative flex-1">
// //                             <input
// //                               value={upiId}
// //                               onChange={(e) => { setUpiId(e.target.value); setPaymentError(""); }}
// //                               placeholder="yourname@upi"
// //                               className="w-full px-5 outline-none placeholder:text-white/35"
// //                               style={{
// //                                 height: 50, borderRadius: 16,
// //                                 background: "#30302E",
// //                                 border: `1px solid ${upiStatus === "valid" ? "rgba(74,222,128,0.5)" : upiStatus === "invalid" ? "rgba(248,113,113,0.5)" : "#FFFFFF1A"}`,
// //                                 fontFamily: fontBase, fontWeight: 400, fontSize: 18, color: "#FFFFFF",
// //                                 paddingRight: upiStatus !== "idle" ? "40px" : "16px",
// //                               }}
// //                             />
// //                             {upiStatus === "valid"     && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "#4ade80" }} />}
// //                             {upiStatus === "invalid"   && <XCircle      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "#f87171" }} />}
// //                             {upiStatus === "verifying" && <Loader2      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" style={{ color: "#71717A" }} />}
// //                           </div>

// //                           <button
// //                             type="button"
// //                             onClick={handleVerifyUpi}
// //                             disabled={!upiId.trim() || upiStatus === "verifying"}
// //                             className="h-[50px] shrink-0 rounded-[12px] px-5 text-white disabled:opacity-40 transition-opacity"
// //                             style={{
// //                               background: upiStatus === "valid"
// //                                 ? "linear-gradient(270deg,#4ade80 0%,#22c55e 100%)"
// //                                 : "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
// //                               fontFamily: fontBase, fontWeight: 700, fontSize: 13,
// //                             }}>
// //                             {upiStatus === "verifying" ? "Verifying..." : upiStatus === "valid" ? "✓ Verified" : "Verify UPI"}
// //                           </button>
// //                         </div>

// //                         {upiStatus === "valid" && (
// //                           <div className="mt-3 flex items-center gap-2">
// //                             <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#4ade80" }} />
// //                             <span style={{ fontFamily: fontBase, fontWeight: 500, fontSize: 13, color: "#4ade80" }}>
// //                               UPI ID verified
// //                               {upiName && upiName !== "(Name unavailable in test mode)" && ` — ${upiName}`}
// //                             </span>
// //                           </div>
// //                         )}
// //                         {upiStatus === "valid" && upiName === "(Name unavailable in test mode)" && (
// //                           <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
// //                             Live mode mein account holder ka naam show hoga.
// //                           </p>
// //                         )}
// //                         {upiStatus === "invalid" && upiError && (
// //                           <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 13, color: "#f87171" }}>
// //                             {upiError}
// //                           </p>
// //                         )}
// //                       </div>
// //                     )}

// //                     {/* ── Net Banking ── */}
// //                     {selectedMethod === "netbanking" && (
// //                       <div className="mt-7 rounded-[14px] border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.05)" }}>
// //                         <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>Net Banking</p>
// //                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, lineHeight: "18px", color: "#71717A" }}>
// //                           Razorpay checkout mein apna bank choose karo. Redirect hoke payment complete karo.
// //                         </p>
// //                       </div>
// //                     )}

// //                     {/* ── QR Section ── */}
// //                     {selectedMethod === "qr" && (
// //                       <div className="mt-7">
// //                         <div className="rounded-[14px] border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.04)" }}>
// //                           <div className="flex items-center gap-3 mb-4">
// //                             <QrCode size={20} style={{ color: "#C084FC" }} />
// //                             <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>
// //                               Scan & Pay via UPI
// //                             </p>
// //                           </div>
// //                           {!addAmount || addAmount < 100 ? (
// //                             <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
// //                               Pehle amount enter karein, phir "Generate QR & Pay" click karein — Razorpay UPI QR screen open hogi.
// //                             </p>
// //                           ) : (
// //                             <div className="space-y-3">
// //                               <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
// //                                 ₹{fmt(addAmount)} ka QR generate hoga. Kisi bhi UPI app se scan karke pay karein.
// //                               </p>
// //                               <div className="flex flex-wrap gap-3 mt-2">
// //                                 {["Google Pay", "PhonePe", "BHIM", "Paytm"].map((app) => (
// //                                   <span key={app} className="rounded-[6px] px-3 py-1 text-xs"
// //                                     style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontFamily: fontBase }}>
// //                                     {app}
// //                                   </span>
// //                                 ))}
// //                               </div>
// //                               {/* Test mode note */}
// //                               <div className="mt-3 rounded-[10px] border border-yellow-500/20 px-4 py-3"
// //                                 style={{ background: "rgba(234,179,8,0.05)" }}>
// //                                 <p style={{ fontFamily: fontBase, fontWeight: 500, fontSize: 12, color: "rgba(234,179,8,0.8)" }}>
// //                                   ⚠️ QR / UPI Intent sirf Live Mode mein kaam karta hai. Test mode mein card ya netbanking use karo.
// //                                 </p>
// //                               </div>
// //                             </div>
// //                           )}
// //                         </div>
// //                       </div>
// //                     )}

// //                     {/* ── Card Section ── */}
// //                     {selectedMethod === "card" && (
// //                       <div className="mt-7">
// //                         <div className="rounded-[14px] border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.04)" }}>
// //                           <div className="flex items-start gap-4">
// //                             <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1A73E8]/20">
// //                               <CreditCard className="h-5 w-5 text-[#1A73E8]" />
// //                             </div>
// //                             <div>
// //                               <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>
// //                                 Pay via Debit / Credit Card
// //                               </p>
// //                               <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, lineHeight: "18px", color: "#71717A" }}>
// //                                 Razorpay checkout open hoga. Card details secure page par enter karke payment complete karein.
// //                               </p>
// //                               <div className="mt-4 flex flex-wrap gap-3">
// //                                 {["Debit Card", "Credit Card", "Rupay", "Visa", "Mastercard"].map((item) => (
// //                                   <span key={item} className="rounded-[6px] px-3 py-1 text-xs"
// //                                     style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontFamily: fontBase }}>
// //                                     {item}
// //                                   </span>
// //                                 ))}
// //                               </div>
// //                               {/* Test card hint */}
// //                               <div className="mt-4 rounded-[10px] border border-white/10 px-4 py-3"
// //                                 style={{ background: "rgba(255,255,255,0.04)" }}>
// //                                 <p style={{ fontFamily: fontBase, fontWeight: 600, fontSize: 12, color: "#C084FC" }}>Test Card:</p>
// //                                 <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
// //                                   No: <code className="text-white">4111 1111 1111 1111</code> &nbsp; Expiry: any future date &nbsp; CVV: any 3 digits
// //                                 </p>
// //                               </div>
// //                             </div>
// //                           </div>
// //                         </div>
// //                       </div>
// //                     )}

// //                   </div>
// //                 </div>
// //               </div>

// //               {/* ── Transaction Summary sidebar ── */}
// //               <aside className="relative min-w-0 self-start overflow-hidden border border-white/10"
// //                 style={{ width: "100%", minHeight: 471, height: "fit-content", borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// //                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_90%,rgba(255,20,239,0.17),transparent_55%)]" />
// //                 <div className="relative z-10 p-8">
// //                   <h3 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 18, color: "#FFFFFF" }}>Transaction Summary</h3>
// //                   <div className="mt-8 space-y-7">
// //                     <div className="flex items-center justify-between gap-4">
// //                       <span style={summaryLabelStyle}>Subtotal</span>
// //                       <span style={summaryValueStyle}>₹{addAmount.toFixed(2)}</span>
// //                     </div>
// //                     <div className="flex items-center justify-between gap-4">
// //                       <span style={summaryLabelStyle}>
// //                         {["card", "qr"].includes(selectedMethod) ? "Service Fee" : "Service Fee (2%)"}
// //                       </span>
// //                       <span style={summaryValueStyle}>₹{serviceFee.toFixed(2)}</span>
// //                     </div>
// //                     <div className="h-px w-full bg-white/10" />
// //                     <div className="flex items-center justify-between gap-3 min-w-0">
// //                       <span style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 20, color: "#FFFFFF", whiteSpace: "nowrap", flexShrink: 0 }}>
// //                         Debit Amount
// //                       </span>
// //                       <span style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 16, color: "#C084FC", whiteSpace: "nowrap", textAlign: "right" }}>
// //                         ₹{Math.max(debitAmount, 0).toFixed(2)}
// //                       </span>
// //                     </div>
// //                   </div>

// //                   <div className="mt-8 flex gap-3 rounded-[14px] p-4" style={{ background: "rgba(3,4,5,0.35)" }}>
// //                     <img src="/icons/locky.svg" alt="" className="mt-1 h-5 w-5 shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
// //                     <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "#71717A" }}>
// //                       {selectedMethod === "card"
// //                         ? "Card payment Razorpay ke secure checkout se hoga. Payment success hote hi wallet instantly credit hoga."
// //                         : selectedMethod === "qr"
// //                         ? "QR scan karke kisi bhi UPI app se pay karein. Live mode mein payment instantly credit hogi."
// //                         : "Payment secured with end-to-end encryption. Funds appear instantly after confirmation."}
// //                     </p>
// //                   </div>

// //                   {paymentError && (
// //                     <div className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white"
// //                       style={{ background: "#2A1717", borderColor: "rgba(239,68,68,0.35)" }}>
// //                       {paymentError}
// //                     </div>
// //                   )}
// //                   {paymentSuccess && (
// //                     <div className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white"
// //                       style={{ background: "#052A1D", borderColor: "rgba(74,222,128,0.35)" }}>
// //                       {paymentSuccess}
// //                     </div>
// //                   )}

// //                   <button
// //                     type="button"
// //                     disabled={isConfirmDisabled}
// //                     onClick={handleConfirmAddFunds}
// //                     className="mt-8 h-[49px] w-full rounded-[8px] text-white disabled:opacity-50"
// //                     style={{ ...confirmButtonTextStyle, background: "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)" }}>
// //                     {payLoading || qrLoading
// //                       ? "Processing..."
// //                       : selectedMethod === "card"
// //                       ? "Pay with Card"
// //                       : selectedMethod === "qr"
// //                       ? "Generate QR & Pay"
// //                       : "Confirm & Add Funds"}
// //                   </button>
// //                 </div>
// //               </aside>
// //             </div>
// //           </div>
// //         </section>
// //       </main>

// //       <div className="relative z-10 mt-20"><Footer /></div>
// //     </div>
// //   );
// // };

// // export default AddFunds;
// // src/pages/AddFunds.tsx
// import { useEffect, useState, type CSSProperties } from "react";
// import { useNavigate } from "react-router-dom";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import { Info, CreditCard, CheckCircle2, XCircle, Loader2 } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";

// declare global {
//   interface Window { Razorpay: any; }
// }

// type PaymentMethod = "upi" | "netbanking" | "card";
// type UpiStatus = "idle" | "verifying" | "valid" | "invalid";

// type WalletTransaction = {
//   id: string;
//   date: string;
//   description: string;
//   status: "Pending" | "Completed" | "Failed" | "Rejected" | string;
//   displayStatus?: string;
//   amount: string;
//   rawAmount?: number;
//   type: "credit" | "debit" | string;
//   source?: string;
//   utrNumber?: string;
//   withdrawalId?: string;
//   netAmount?: number | null;
//   serviceFee?: number | null;
//   processedAt?: string | null;
// };

// const [recentTransactions, setRecentTransactions] = useState<WalletTransaction[]>([]);





// const AddFunds = () => {
//   const navigate  = useNavigate();
//   const { token, user } = useAuth() as any;

//   const API_BASE   = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";
//   const fontBase   = "Inter, system-ui, Arial, sans-serif";

//   const CREATE_ORDER_URL   = `${API_BASE}/api/wallet/add-fund/create-order`;
//   const VERIFY_PAYMENT_URL = `${API_BASE}/api/wallet/add-fund/verify`;
//   const WALLET_BALANCE_URL = `${API_BASE}/api/wallet/balance`;
//   const UPI_VALIDATE_URL   = `${API_BASE}/api/wallet/upi/validate`;

//   // ── State ──
//   const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
//   const [amount, setAmount]   = useState("");
//   const [upiId, setUpiId]     = useState("");
//   const [upiStatus, setUpiStatus] = useState<UpiStatus>("idle");
//   const [upiError, setUpiError]   = useState("");
//   const [upiName, setUpiName]     = useState("");

//   const [availableBalance, setAvailableBalance] = useState(0);
//   const [totalEarning, setTotalEarning]         = useState(0);
//   const [monthlyEarning, setMonthlyEarning]     = useState(0);
//   const [walletLoading, setWalletLoading]       = useState(false);

//   const [payLoading, setPayLoading]         = useState(false);
//   const [paymentError, setPaymentError]     = useState("");
//   const [paymentSuccess, setPaymentSuccess] = useState("");

//   const getAuthToken = () =>
//     token ||
//     localStorage.getItem("auth_token") ||
//     sessionStorage.getItem("auth_token") ||
//     localStorage.getItem("token") ||
//     sessionStorage.getItem("token") ||
//     "";

//   // ── Wallet fetch ──
//   const fetchWallet = async () => {
//   const authToken = getAuthToken();
//   if (!authToken) return;

//   try {
//     setWalletLoading(true);

//     const res = await fetch(WALLET_BALANCE_URL, {
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//       },
//       credentials: "include",
//     });

//     const data = await res.json().catch(() => ({}));

//     if (res.ok && data.success) {
//       setAvailableBalance(Number(data.availableBalance || 0));
//       setTotalEarning(Number(data.totalRevenue || 0));
//       setMonthlyEarning(Number(data.monthlyEarning || 0));
//       setRecentTransactions(data.recentTransactions || []);
//     }
//   } catch (err) {
//     console.error("wallet fetch error:", err);
//   } finally {
//     setWalletLoading(false);
//   }
// };

//   useEffect(() => { fetchWallet(); }, [token]); // eslint-disable-line

//   // Tab change: reset errors
//   useEffect(() => {
//     setPaymentError("");
//     setPaymentSuccess("");
//   }, [selectedMethod]);

//   // UPI ID change: status reset
//   useEffect(() => {
//     if (upiStatus !== "idle") {
//       setUpiStatus("idle");
//       setUpiError("");
//       setUpiName("");
//     }
//   }, [upiId]); // eslint-disable-line

//   const addAmount   = Number(amount || 0);

//   // ── Service fee logic ──
//   // Card pe koi fee nahi
//   // UPI pe bhi koi fee nahi (Razorpay checkout khud handle karta hai)
//   // NetBanking pe 2%
//   const serviceFee  = addAmount > 0 && selectedMethod === "netbanking"
//     ? +(addAmount * 0.02).toFixed(2)
//     : 0;
//   const debitAmount = addAmount > 0 ? +(addAmount + serviceFee).toFixed(2) : 0;

//   const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);

//   // ─────────────────────────────────────────────────────────────
//   // UPI Verify
//   // ─────────────────────────────────────────────────────────────
//   const handleVerifyUpi = async () => {
//     if (!upiId.trim()) { setUpiError("Please enter a UPI ID first."); return; }

//     const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
//     if (!vpaRegex.test(upiId.trim().toLowerCase())) {
//       setUpiStatus("invalid");
//       setUpiError("Invalid UPI ID format. Example: name@upi");
//       return;
//     }

//     try {
//       setUpiStatus("verifying");
//       setUpiError("");
//       setUpiName("");

//       const authToken = getAuthToken();
//       const res  = await fetch(UPI_VALIDATE_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
//         credentials: "include",
//         body: JSON.stringify({ vpa: upiId.trim() }),
//       });
//       const data = await res.json().catch(() => ({}));

//       if (!res.ok || !data.success) {
//         setUpiStatus("invalid");
//         setUpiError(data.message || "UPI ID is invalid or does not exist.");
//         return;
//       }

//       setUpiStatus("valid");
//       if (data.name && !["(Name unavailable in test mode)"].includes(data.name)) {
//         setUpiName(data.name);
//       }
//     } catch (err: any) {
//       setUpiStatus("invalid");
//       setUpiError("Could not verify UPI ID. Please try again.");
//     }
//   };

//   // ─────────────────────────────────────────────────────────────
//   // Main Payment Handler — UPI / NetBanking / Card
//   //
//   // CRITICAL: UPI ke liye koi method restriction NAHI
//   //   - Razorpay checkout khud UPI screen dikhata hai
//   //   - Usme QR code option built-in hota hai (GPay/PhonePe/Paytm style)
//   //   - method restrict karne se test mode mein "No appropriate payment method" aata hai
//   //
//   // NetBanking aur Card ke liye restrict karo — ye sahi hai
//   // ─────────────────────────────────────────────────────────────
//   const handleConfirmAddFunds = async () => {
//     setPaymentError("");
//     setPaymentSuccess("");

//     const authToken = getAuthToken();
//     if (!authToken)         { setPaymentError("Please login first."); return; }
//     if (!addAmount || Number.isNaN(addAmount)) { setPaymentError("Please enter amount."); return; }
//     if (addAmount < 100)    { setPaymentError("Minimum add amount is ₹100."); return; }
//     if (addAmount > 100000) { setPaymentError("Maximum amount is ₹1,00,000 per transaction."); return; }

//     if (!window.Razorpay) {
//       setPaymentError("Razorpay not loaded. Please check your internet connection.");
//       return;
//     }

//     // UPI ID entered hai to verify karna zaroori hai
//     if (selectedMethod === "upi" && upiId.trim()) {
//       if (upiStatus === "idle")      { setPaymentError("Please verify your UPI ID before proceeding."); return; }
//       if (upiStatus === "invalid")   { setPaymentError("Invalid UPI ID. Please enter a valid one."); return; }
//       if (upiStatus === "verifying") { setPaymentError("UPI verification in progress. Please wait."); return; }
//     }

//     try {
//       setPayLoading(true);

//       const res  = await fetch(CREATE_ORDER_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
//         credentials: "include",
//         body: JSON.stringify({ amount: addAmount, selectedMethod }),
//       });
//       const orderData = await res.json().catch(() => ({}));
//       if (!res.ok || !orderData.success) throw new Error(orderData.message || "Could not create payment order.");

//       const orderId     = String(orderData?.order?.id || "");
//       const razorpayKey = String(orderData?.key || "");

//       if (!razorpayKey.startsWith("rzp_")) throw new Error("Invalid Razorpay key received from server.");
//       if (!orderId.startsWith("order_"))   throw new Error("Invalid Razorpay order received from server.");

//       const cleanEmail   = String(user?.email || "").trim();
//       const cleanContact = String(user?.phone || user?.mobile || "").replace(/\D/g, "").slice(-10);
//       const cleanName    = String(user?.name || "").trim();

//       const prefill: Record<string, string> = {};
//       if (cleanName) prefill.name = cleanName;
//       if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) prefill.email = cleanEmail;
//       if (/^[6-9]\d{9}$/.test(cleanContact)) prefill.contact = cleanContact;
//       if (selectedMethod === "upi" && upiId.trim() && upiStatus === "valid") prefill.vpa = upiId.trim();

//       // ── CRITICAL: UPI ke liye method restrict BILKUL MAT KARO ──
//       // Razorpay checkout khud UPI screen show karta hai — usme built-in QR hota hai
//       // GPay / PhonePe / Paytm / BHIM sab UPI ke andar aate hain
//       //
//       // NetBanking aur Card ke liye restrict karo — ye safe hai
//       const methodRestriction =
//         selectedMethod === "netbanking"
//           ? { upi: false, card: false, netbanking: true, wallet: false, paylater: false, emi: false }
//           : selectedMethod === "card"
//           ? { upi: false, card: true, netbanking: false, wallet: false, paylater: false, emi: false }
//           : undefined; // UPI: koi restriction nahi — checkout khud QR + UPI apps dikhayega

//       const options: any = {
//         key: razorpayKey,
//         order_id: orderId,
//         name: "Tokun",
//         description:
//           selectedMethod === "upi"        ? "Add funds via UPI" :
//           selectedMethod === "netbanking" ? "Add funds via Net Banking" :
//           "Add funds via Card",
//         image: "/favicon.ico",
//         prefill,
//         notes: { purpose: "wallet_topup", selectedMethod, walletAmount: String(addAmount) },
//         theme: { color: "#1A73E8" },
//         ...(methodRestriction !== undefined && { method: methodRestriction }),
//         handler: async (response: any) => {
//           try {
//             setPayLoading(true);
//             const verifyRes = await fetch(VERIFY_PAYMENT_URL, {
//               method: "POST",
//               headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
//               credentials: "include",
//               body: JSON.stringify(response),
//             });
//             const verifyData = await verifyRes.json().catch(() => ({}));
//             if (!verifyRes.ok || !verifyData.success) throw new Error(verifyData.message || "Verification failed.");
//             setPaymentSuccess("Payment successful! Wallet updated.");
//             await fetchWallet();
//             setTimeout(() => navigate("/wallet"), 1200);
//           } catch (err: any) {
//             setPaymentError(err?.message || "Payment verification failed.");
//           } finally {
//             setPayLoading(false);
//           }
//         },
//         modal: { ondismiss: () => setPayLoading(false) },
//       };

//       const razorpay = new window.Razorpay(options);
//       razorpay.on("payment.failed", (response: any) => {
//         setPaymentError(response?.error?.description || response?.error?.reason || "Payment failed. Please try again.");
//         setPayLoading(false);
//       });
//       razorpay.open();

//     } catch (err: any) {
//       console.error("[AddFunds] error:", err);
//       setPaymentError(err?.message || "Could not start payment.");
//       setPayLoading(false);
//     }
//   };

//   // ── Payment Methods (QR tab hata diya) ──
//   const paymentMethods: { id: PaymentMethod; title: string; subtitle: string; icon: string }[] = [
//     { id: "upi",        title: "UPI",        subtitle: "Instant + QR",   icon: "/icons/upi.svg" },
//     { id: "netbanking", title: "Net Banking", subtitle: "2-3 mins",       icon: "/icons/netbanking.svg" },
//     { id: "card",       title: "Card",       subtitle: "Debit / Credit", icon: "/icons/addcard.svg" },
//   ];

//   const isConfirmDisabled =
//     !addAmount ||
//     payLoading ||
//     (selectedMethod === "upi" && upiId.trim() !== "" && ["invalid", "verifying"].includes(upiStatus));

//   const confirmBtnLabel =
//     payLoading ? "Processing..." :
//     selectedMethod === "card" ? "Pay with Card" :
//     "Confirm & Add Funds";

//   // ── Styles ──
//   const confirmBtnStyle: CSSProperties = { fontFamily: fontBase, fontWeight: 700, fontSize: 16, lineHeight: "100%", textAlign: "center" };
//   const summaryLabelStyle: CSSProperties = { fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "#71717A", whiteSpace: "nowrap" };
//   const summaryValueStyle: CSSProperties = { fontFamily: fontBase, fontWeight: 500, fontSize: 14, color: "#FFFFFF", whiteSpace: "nowrap" };
//   const iconStyle: CSSProperties = { width: 40, height: 40, opacity: 1, objectFit: "contain", display: "block" };

//   return (
//     <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
//       <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
//         <img src="/icons/mpbg.png" alt="background" className="absolute inset-0 w-full h-screen object-contain object-top select-none" />
//       </div>
//       <div className="relative z-20 w-full bg-transparent px-4"><Header /></div>

//       <main className="relative z-10 px-4 pt-[95px] pb-20">
//         <section className="mx-auto overflow-hidden"
//           style={{ width: "min(1024px, 100%)", minHeight: 1100, borderRadius: 30, background: "#21212180", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", fontFamily: fontBase }}>
//           <div className="p-8 sm:p-[50px]">

//             <button type="button" onClick={() => navigate("/wallet")} className="inline-flex items-center gap-2"
//               style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#C084FC" }}>
//               ← Back to Wallet
//             </button>

//             <div className="mt-4">
//               <h1 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 36, lineHeight: "100%", color: "#FFFFFF" }}>Add Funds</h1>
//               <p className="mt-4 max-w-[590px]" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 16, lineHeight: "24px", color: "#A1A1AA" }}>
//                 Add money to your wallet using UPI (with QR scan), Net Banking, or debit/credit card.<br />
//                 Funds appear instantly after payment confirmation.
//               </p>
//             </div>

//             <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_294px] gap-5 items-start">
//               <div className="space-y-5 min-w-0">

//                 {/* ── Balance Card ── */}
//                 <div className="relative overflow-hidden border border-white/10"
//                   style={{ minHeight: 284, borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
//                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />
//                   <div className="relative z-10 p-8">
//                     <p style={{ fontFamily: fontBase, fontWeight: 600, fontSize: 12, letterSpacing: "1.2px", color: "#C084FC", textTransform: "uppercase" }}>
//                       Current Balance
//                     </p>
//                     <h2 className="mt-5 text-white" style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 60, lineHeight: "60px" }}>
//                       {walletLoading ? "Loading..." : `₹ ${fmt(availableBalance)}`}
//                     </h2>
//                     <div className="mt-12 h-px w-full bg-white/10" />
//                     <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
//                       <div>
//                         <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Total Earning</p>
//                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, color: "#FFFFFF" }}>
//                           {walletLoading ? "—" : `₹${fmt(totalEarning)}`}
//                         </p>
//                       </div>
//                       <div>
//                         <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Monthly Earnings</p>
//                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, color: "#ADC6FF" }}>
//                           {walletLoading ? "—" : `₹${fmt(monthlyEarning)}`}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* ── Payment Method + Inputs ── */}
//                 <div className="relative self-start overflow-hidden border border-white/10"
//                   style={{ height: "fit-content", borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
//                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_55%,rgba(255,20,239,0.28),transparent_50%)]" />
//                   <div className="relative z-10 p-8">

//                     <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>Select Payment Method</p>

//                     {/* Method tabs — 3 tabs only (QR hata diya) */}
//                     <div className="mt-6 grid grid-cols-3 gap-4" style={{ maxWidth: "min(546px, 100%)" }}>
//                       {paymentMethods.map((method) => {
//                         const active = selectedMethod === method.id;
//                         return (
//                           <button key={method.id} type="button"
//                             onClick={() => setSelectedMethod(method.id)}
//                             className="flex h-[125px] flex-col items-center justify-center rounded-[10px] border text-center"
//                             style={{
//                               background:  active ? "rgba(23,23,26,0.72)" : "rgba(255,255,255,0.06)",
//                               borderColor: active ? "#FF14EF" : "rgba(255,255,255,0.08)",
//                               boxShadow:   active ? "inset -1px 0 0 #1A73E8" : "none",
//                             }}>
//                             <img src={method.icon} alt="" style={iconStyle} onError={(e) => { e.currentTarget.style.display = "none"; }} />
//                             <p className="mt-4" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#FFFFFF" }}>{method.title}</p>
//                             <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{method.subtitle}</p>
//                           </button>
//                         );
//                       })}
//                     </div>

//                     {/* Amount input */}
//                     <div className="mt-9">
//                       <label style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>Enter amount</label>
//                       <div className="mt-5 flex items-center px-8"
//                         style={{ width: "min(546px, 100%)", height: 60, borderRadius: 16, background: "#18181B80", border: "1px solid #FFFFFF1A" }}>
//                         <div className="flex min-w-0 flex-1 items-center gap-4">
//                           <span style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 34, color: "#C084FC" }}>₹</span>
//                           <input
//                             value={amount}
//                             onChange={(e) => { setAmount(e.target.value.replace(/[^\d]/g, "")); setPaymentError(""); setPaymentSuccess(""); }}
//                             placeholder="0.00"
//                             inputMode="numeric"
//                             className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/10"
//                             style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 34, color: "#FFFFFF" }}
//                           />
//                         </div>
//                       </div>
//                       <div className="mt-5 flex items-center gap-2">
//                         <Info className="h-4 w-4 text-[#71717A]" />
//                         <span style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "#71717A" }}>
//                           Minimum add: ₹100. Maximum: ₹1,00,000 per transaction.
//                         </span>
//                       </div>
//                       <div className="mt-5 flex flex-nowrap gap-4 overflow-x-auto pb-1">
//                         {[100, 200, 500, 2000].map((v) => (
//                           <button key={v} type="button"
//                             onClick={() => { setAmount(String(v)); setPaymentError(""); setPaymentSuccess(""); }}
//                             className="h-[40px] shrink-0 rounded-[8px] border border-white/10 px-7"
//                             style={{ background: "#18181B80", fontFamily: fontBase, fontWeight: 500, fontSize: 18, color: "#FFFFFF" }}>
//                             ₹{v}
//                           </button>
//                         ))}
//                       </div>
//                     </div>

//                     {/* ──────────────────────────────────────────────────────
//                         UPI Section
//                         Razorpay checkout khud UPI screen dikhata hai jisme:
//                           - UPI ID enter karne ka option
//                           - QR code scan karne ka option (GPay/PhonePe/Paytm style)
//                           - Saved UPI apps list
//                         Test mode: success@razorpay / failure@razorpay
//                     ────────────────────────────────────────────────────── */}
//                     {selectedMethod === "upi" && (
//                       <div className="mt-7">
//                         {/* UPI info box */}
//                         <div className="rounded-[14px] border border-white/10 p-5 mb-6"
//                           style={{ background: "rgba(255,255,255,0.04)" }}>
//                           <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>
//                             UPI — including QR Scan
//                           </p>
//                           <p className="mt-2" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: "20px" }}>
//                             Razorpay checkout mein UPI ID enter karo ya built-in QR scan karo. Google Pay, PhonePe, Paytm, BHIM sab supported hain.
//                           </p>
//                           <div className="mt-4 flex flex-wrap gap-2">
//                             {["Google Pay", "PhonePe", "BHIM", "Paytm", "UPI QR"].map((app) => (
//                               <span key={app} className="rounded-[6px] px-3 py-1 text-xs"
//                                 style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontFamily: fontBase }}>
//                                 {app}
//                               </span>
//                             ))}
//                           </div>
//                         </div>

//                         <label style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 13, color: "#A1A1AA" }}>
//                           UPI ID{" "}
//                           <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>
//                             (optional — enter to prefill)
//                           </span>
//                         </label>

//                         {/* Test mode hint — sirf development mein */}
//                         {import.meta.env?.MODE !== "production" && (
//                           <div className="mt-3 rounded-[10px] border border-white/10 px-4 py-3"
//                             style={{ background: "rgba(255,255,255,0.04)" }}>
//                             <p style={{ fontFamily: fontBase, fontWeight: 600, fontSize: 12, color: "#C084FC" }}>
//                               Test Mode UPI IDs:
//                             </p>
//                             <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
//                               ✅ Success: <code className="text-white">success@razorpay</code>
//                               &nbsp;&nbsp;&nbsp;❌ Failure: <code className="text-white">failure@razorpay</code>
//                             </p>
//                           </div>
//                         )}

//                         <div className="mt-5 flex items-center gap-3" style={{ width: "min(546px, 100%)" }}>
//                           <div className="relative flex-1">
//                             <input
//                               value={upiId}
//                               onChange={(e) => { setUpiId(e.target.value); setPaymentError(""); }}
//                               placeholder="yourname@upi"
//                               className="w-full px-5 outline-none placeholder:text-white/35"
//                               style={{
//                                 height: 50,
//                                 borderRadius: 16,
//                                 background: "#30302E",
//                                 border: `1px solid ${
//                                   upiStatus === "valid"   ? "rgba(74,222,128,0.5)" :
//                                   upiStatus === "invalid" ? "rgba(248,113,113,0.5)" :
//                                   "#FFFFFF1A"
//                                 }`,
//                                 fontFamily: fontBase,
//                                 fontWeight: 400,
//                                 fontSize: 18,
//                                 color: "#FFFFFF",
//                                 paddingRight: upiStatus !== "idle" ? "40px" : "16px",
//                               }}
//                             />
//                             {upiStatus === "valid"     && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "#4ade80" }} />}
//                             {upiStatus === "invalid"   && <XCircle      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "#f87171" }} />}
//                             {upiStatus === "verifying" && <Loader2      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" style={{ color: "#71717A" }} />}
//                           </div>

//                           <button type="button"
//                             onClick={handleVerifyUpi}
//                             disabled={!upiId.trim() || upiStatus === "verifying"}
//                             className="h-[50px] shrink-0 rounded-[12px] px-5 text-white disabled:opacity-40 transition-opacity"
//                             style={{
//                               background: upiStatus === "valid"
//                                 ? "linear-gradient(270deg,#4ade80 0%,#22c55e 100%)"
//                                 : "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
//                               fontFamily: fontBase,
//                               fontWeight: 700,
//                               fontSize: 13,
//                             }}>
//                             {upiStatus === "verifying" ? "Verifying..." :
//                              upiStatus === "valid"     ? "✓ Verified"   : "Verify UPI"}
//                           </button>
//                         </div>

//                         {upiStatus === "valid" && (
//                           <div className="mt-3 flex items-center gap-2">
//                             <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#4ade80" }} />
//                             <span style={{ fontFamily: fontBase, fontWeight: 500, fontSize: 13, color: "#4ade80" }}>
//                               UPI ID verified{upiName ? ` — ${upiName}` : ""}
//                             </span>
//                           </div>
//                         )}
//                         {upiStatus === "invalid" && upiError && (
//                           <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 13, color: "#f87171" }}>
//                             {upiError}
//                           </p>
//                         )}
//                       </div>
//                     )}

//                     {/* ──────────────────────────────────────────────────────
//                         Net Banking Section
//                     ────────────────────────────────────────────────────── */}
//                     {selectedMethod === "netbanking" && (
//                       <div className="mt-7 rounded-[14px] border border-white/10 p-5"
//                         style={{ background: "rgba(255,255,255,0.05)" }}>
//                         <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>Net Banking</p>
//                         <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, lineHeight: "18px", color: "#71717A" }}>
//                           Razorpay checkout mein apna bank choose karo. Redirect hoke payment complete karo.
//                         </p>
//                       </div>
//                     )}

//                     {/* ──────────────────────────────────────────────────────
//                         Card Section
//                         Test card: 4111 1111 1111 1111
//                     ────────────────────────────────────────────────────── */}
//                     {selectedMethod === "card" && (
//                       <div className="mt-7">
//                         <div className="rounded-[14px] border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.04)" }}>
//                           <div className="flex items-start gap-4">
//                             <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1A73E8]/20">
//                               <CreditCard className="h-5 w-5 text-[#1A73E8]" />
//                             </div>
//                             <div className="flex-1">
//                               <p style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>
//                                 Pay via Debit / Credit Card
//                               </p>
//                               <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, lineHeight: "18px", color: "#71717A" }}>
//                                 Razorpay secure checkout open hoga. Card details enter karke payment complete karo. Success hote hi wallet automatically credit hoga.
//                               </p>
//                               <div className="mt-4 flex flex-wrap gap-3">
//                                 {["Debit Card", "Credit Card", "Rupay", "Visa", "Mastercard"].map((item) => (
//                                   <span key={item} className="rounded-[6px] px-3 py-1 text-xs"
//                                     style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontFamily: fontBase }}>
//                                     {item}
//                                   </span>
//                                 ))}
//                               </div>

//                               {/* Test card — sirf dev mein */}
//                               {import.meta.env?.MODE !== "production" && (
//                                 <div className="mt-4 rounded-[10px] border border-white/10 px-4 py-3"
//                                   style={{ background: "rgba(255,255,255,0.04)" }}>
//                                   <p style={{ fontFamily: fontBase, fontWeight: 600, fontSize: 12, color: "#C084FC" }}>Test Card:</p>
//                                   <p className="mt-1" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
//                                     No: <code className="text-white">4111 1111 1111 1111</code>
//                                     &nbsp; Expiry: any future date &nbsp; CVV: any 3 digits
//                                   </p>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                   </div>
//                 </div>
//               </div>

//               {/* ── Summary Sidebar ── */}
//               <aside className="relative min-w-0 self-start overflow-hidden border border-white/10"
//                 style={{ width: "100%", minHeight: 471, height: "fit-content", borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
//                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_90%,rgba(255,20,239,0.17),transparent_55%)]" />
//                 <div className="relative z-10 p-8">
//                   <h3 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 18, color: "#FFFFFF" }}>Transaction Summary</h3>

//                   <div className="mt-8 space-y-7">
//                     <div className="flex items-center justify-between gap-4">
//                       <span style={summaryLabelStyle}>Subtotal</span>
//                       <span style={summaryValueStyle}>₹{addAmount.toFixed(2)}</span>
//                     </div>
//                     <div className="flex items-center justify-between gap-4">
//                       <span style={summaryLabelStyle}>
//                         {selectedMethod === "netbanking" ? "Service Fee (2%)" : "Service Fee"}
//                       </span>
//                       <span style={summaryValueStyle}>₹{serviceFee.toFixed(2)}</span>
//                     </div>
//                     <div className="h-px w-full bg-white/10" />
//                     <div className="flex items-center justify-between gap-3 min-w-0">
//                       <span style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 20, color: "#FFFFFF", whiteSpace: "nowrap", flexShrink: 0 }}>
//                         Debit Amount
//                       </span>
//                       <span style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 16, color: "#C084FC", whiteSpace: "nowrap", textAlign: "right" }}>
//                         ₹{Math.max(debitAmount, 0).toFixed(2)}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="mt-8 flex gap-3 rounded-[14px] p-4" style={{ background: "rgba(3,4,5,0.35)" }}>
//                     <img src="/icons/locky.svg" alt="" className="mt-1 h-5 w-5 shrink-0"
//                       onError={(e) => { e.currentTarget.style.display = "none"; }} />
//                     <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 12, color: "#71717A" }}>
//                       {selectedMethod === "card"
//                         ? "Card payment Razorpay ke secure checkout se hogi. Wallet instantly credit hoga."
//                         : selectedMethod === "upi"
//                         ? "UPI checkout mein QR scan ya UPI ID se pay karo. Funds instantly credit honge."
//                         : "Payment secured with end-to-end encryption. Funds appear instantly after confirmation."}
//                     </p>
//                   </div>

//                   {paymentError && (
//                     <div className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white"
//                       style={{ background: "#2A1717", borderColor: "rgba(239,68,68,0.35)" }}>
//                       {paymentError}
//                     </div>
//                   )}
//                   {paymentSuccess && (
//                     <div className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white"
//                       style={{ background: "#052A1D", borderColor: "rgba(74,222,128,0.35)" }}>
//                       {paymentSuccess}
//                     </div>
//                   )}

//                   <button
//                     type="button"
//                     disabled={isConfirmDisabled}
//                     onClick={handleConfirmAddFunds}
//                     className="mt-8 h-[49px] w-full rounded-[8px] text-white disabled:opacity-50"
//                     style={{ ...confirmBtnStyle, background: "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)" }}>
//                     {confirmBtnLabel}
//                   </button>
//                 </div>
//               </aside>
//             </div>
//           </div>
//         </section>
//       </main>

//       <div className="relative z-10 mt-20"><Footer /></div>
//     </div>
//   );
// };

// export default AddFunds;



// // src/pages/AddFunds.tsx
// import { useEffect, useState, type CSSProperties } from "react";
// import { useNavigate } from "react-router-dom";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import {
//   Info,
//   CreditCard,
//   CheckCircle2,
//   XCircle,
//   Loader2,
//   RefreshCcw,
// } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";

// declare global {
//   interface Window {
//     Razorpay: any;
//   }
// }

// type PaymentMethod = "upi" | "netbanking" | "card";
// type UpiStatus = "idle" | "verifying" | "valid" | "invalid";

// type WalletTransaction = {
//   id: string;
//   date: string;
//   description: string;
//   status: "Pending" | "Completed" | "Failed" | "Rejected" | string;
//   displayStatus?: string;
//   amount: string;
//   rawAmount?: number;
//   type: "credit" | "debit" | string;
//   source?: string;
//   utrNumber?: string;
//   withdrawalId?: string;
//   netAmount?: number | null;
//   serviceFee?: number | null;
//   processedAt?: string | null;
// };

// const AddFunds = () => {
//   const navigate = useNavigate();
//   const { token, user } = useAuth() as any;

//   const API_BASE =
//     (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") ||
//     "http://localhost:5002";

//   const fontBase = "Inter, system-ui, Arial, sans-serif";

//   const CREATE_ORDER_URL = `${API_BASE}/api/wallet/add-fund/create-order`;
//   const VERIFY_PAYMENT_URL = `${API_BASE}/api/wallet/add-fund/verify`;
//   const WALLET_BALANCE_URL = `${API_BASE}/api/wallet/balance`;
//   const UPI_VALIDATE_URL = `${API_BASE}/api/wallet/upi/validate`;

//   const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
//   const [amount, setAmount] = useState("");
//   const [upiId, setUpiId] = useState("");
//   const [upiStatus, setUpiStatus] = useState<UpiStatus>("idle");
//   const [upiError, setUpiError] = useState("");
//   const [upiName, setUpiName] = useState("");

//   const [availableBalance, setAvailableBalance] = useState(0);
//   const [totalEarning, setTotalEarning] = useState(0);
//   const [monthlyEarning, setMonthlyEarning] = useState(0);
//   const [walletLoading, setWalletLoading] = useState(false);
//   const [recentTransactions, setRecentTransactions] = useState<
//     WalletTransaction[]
//   >([]);

//   const [payLoading, setPayLoading] = useState(false);
//   const [paymentError, setPaymentError] = useState("");
//   const [paymentSuccess, setPaymentSuccess] = useState("");

//   const getAuthToken = () => {
//     return (
//       token ||
//       localStorage.getItem("auth_token") ||
//       sessionStorage.getItem("auth_token") ||
//       localStorage.getItem("token") ||
//       sessionStorage.getItem("token") ||
//       localStorage.getItem("tokun_token") ||
//       sessionStorage.getItem("tokun_token") ||
//       ""
//     );
//   };

//   const fetchWallet = async () => {
//     const authToken = getAuthToken();
//     if (!authToken) return;

//     try {
//       setWalletLoading(true);

//       const res = await fetch(WALLET_BALANCE_URL, {
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//         credentials: "include",
//       });

//       const data = await res.json().catch(() => ({}));

//       if (res.ok && data.success) {
//         setAvailableBalance(Number(data.availableBalance || 0));
//         setTotalEarning(Number(data.totalRevenue || 0));
//         setMonthlyEarning(Number(data.monthlyEarning || 0));
//         setRecentTransactions(data.recentTransactions || []);
//       }
//     } catch (err) {
//       console.error("wallet fetch error:", err);
//     } finally {
//       setWalletLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchWallet();

//     const interval = window.setInterval(() => {
//       fetchWallet();
//     }, 5000);

//     return () => window.clearInterval(interval);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);

//   useEffect(() => {
//     const onFocus = () => {
//       fetchWallet();
//     };

//     window.addEventListener("focus", onFocus);

//     return () => {
//       window.removeEventListener("focus", onFocus);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);

//   useEffect(() => {
//     setPaymentError("");
//     setPaymentSuccess("");
//   }, [selectedMethod]);

//   useEffect(() => {
//     if (upiStatus !== "idle") {
//       setUpiStatus("idle");
//       setUpiError("");
//       setUpiName("");
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [upiId]);

//   const addAmount = Number(amount || 0);

//   const serviceFee =
//     addAmount > 0 && selectedMethod === "netbanking"
//       ? +(addAmount * 0.02).toFixed(2)
//       : 0;

//   const debitAmount = addAmount > 0 ? +(addAmount + serviceFee).toFixed(2) : 0;

//   const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n || 0);

//   const formatDate = (date?: string) => {
//     if (!date) return "—";

//     const d = new Date(date);
//     if (Number.isNaN(d.getTime())) return "—";

//     return d.toLocaleString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const getTxnStatusLabel = (txn: WalletTransaction) => {
//     if (txn.displayStatus) return txn.displayStatus;

//     if (txn.status === "Completed") return "Successful";
//     if (txn.status === "Pending") return "Pending";

//     if (txn.status === "Failed") {
//       if (txn.source === "withdrawal" || txn.source === "withdrawal_refund") {
//         return "Rejected";
//       }

//       return "Failed";
//     }

//     if (txn.status === "Rejected") return "Rejected";

//     return txn.status || "Pending";
//   };

//   const getTxnStatusClass = (txn: WalletTransaction) => {
//     const label = getTxnStatusLabel(txn);

//     if (txn.status === "Completed" || label === "Successful") {
//       return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25";
//     }

//     if (txn.status === "Pending" || label === "Pending") {
//       return "bg-amber-500/15 text-amber-300 border border-amber-500/25";
//     }

//     if (
//       txn.status === "Failed" ||
//       txn.status === "Rejected" ||
//       label === "Rejected" ||
//       label === "Failed"
//     ) {
//       return "bg-red-500/15 text-red-300 border border-red-500/25";
//     }

//     return "bg-white/10 text-white/70 border border-white/10";
//   };

//   const getTxnTitle = (txn: WalletTransaction) => {
//     if (txn.source === "withdrawal") {
//       return txn.status === "Completed"
//         ? "Withdrawal paid successfully"
//         : "Withdrawal request";
//     }

//     if (txn.source === "withdrawal_refund") {
//       return "Withdrawal refunded";
//     }

//     if (txn.source === "add_fund") {
//       return "Wallet top-up";
//     }

//     if (txn.source === "bank_transfer") {
//       return "Bank transfer";
//     }

//     return txn.description || "Wallet transaction";
//   };

//   const handleVerifyUpi = async () => {
//     if (!upiId.trim()) {
//       setUpiError("Please enter a UPI ID first.");
//       return;
//     }

//     const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

//     if (!vpaRegex.test(upiId.trim().toLowerCase())) {
//       setUpiStatus("invalid");
//       setUpiError("Invalid UPI ID format. Example: name@upi");
//       return;
//     }

//     try {
//       setUpiStatus("verifying");
//       setUpiError("");
//       setUpiName("");

//       const authToken = getAuthToken();

//       const res = await fetch(UPI_VALIDATE_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${authToken}`,
//         },
//         credentials: "include",
//         body: JSON.stringify({
//           vpa: upiId.trim(),
//         }),
//       });

//       const data = await res.json().catch(() => ({}));

//       if (!res.ok || !data.success) {
//         setUpiStatus("invalid");
//         setUpiError(data.message || "UPI ID is invalid or does not exist.");
//         return;
//       }

//       setUpiStatus("valid");

//       if (data.name && !["(Name unavailable in test mode)"].includes(data.name)) {
//         setUpiName(data.name);
//       }
//     } catch (err) {
//       setUpiStatus("invalid");
//       setUpiError("Could not verify UPI ID. Please try again.");
//     }
//   };

//   const handleConfirmAddFunds = async () => {
//     setPaymentError("");
//     setPaymentSuccess("");

//     const authToken = getAuthToken();

//     if (!authToken) {
//       setPaymentError("Please login first.");
//       return;
//     }

//     if (!addAmount || Number.isNaN(addAmount)) {
//       setPaymentError("Please enter amount.");
//       return;
//     }

//     if (addAmount < 100) {
//       setPaymentError("Minimum add amount is ₹100.");
//       return;
//     }

//     if (addAmount > 100000) {
//       setPaymentError("Maximum amount is ₹1,00,000 per transaction.");
//       return;
//     }

//     if (!window.Razorpay) {
//       setPaymentError(
//         "Razorpay not loaded. Please check your internet connection."
//       );
//       return;
//     }

//     if (selectedMethod === "upi" && upiId.trim()) {
//       if (upiStatus === "idle") {
//         setPaymentError("Please verify your UPI ID before proceeding.");
//         return;
//       }

//       if (upiStatus === "invalid") {
//         setPaymentError("Invalid UPI ID. Please enter a valid one.");
//         return;
//       }

//       if (upiStatus === "verifying") {
//         setPaymentError("UPI verification in progress. Please wait.");
//         return;
//       }
//     }

//     try {
//       setPayLoading(true);

//       const res = await fetch(CREATE_ORDER_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${authToken}`,
//         },
//         credentials: "include",
//         body: JSON.stringify({
//           amount: addAmount,
//           selectedMethod,
//         }),
//       });

//       const orderData = await res.json().catch(() => ({}));

//       if (!res.ok || !orderData.success) {
//         throw new Error(
//           orderData.message || "Could not create payment order."
//         );
//       }

//       const orderId = String(orderData?.order?.id || "");
//       const razorpayKey = String(orderData?.key || "");

//       if (!razorpayKey.startsWith("rzp_")) {
//         throw new Error("Invalid Razorpay key received from server.");
//       }

//       if (!orderId.startsWith("order_")) {
//         throw new Error("Invalid Razorpay order received from server.");
//       }

//       const cleanEmail = String(user?.email || "").trim();
//       const cleanContact = String(user?.phone || user?.mobile || "")
//         .replace(/\D/g, "")
//         .slice(-10);
//       const cleanName = String(user?.name || "").trim();

//       const prefill: Record<string, string> = {};

//       if (cleanName) prefill.name = cleanName;

//       if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
//         prefill.email = cleanEmail;
//       }

//       if (/^[6-9]\d{9}$/.test(cleanContact)) {
//         prefill.contact = cleanContact;
//       }

//       if (selectedMethod === "upi" && upiId.trim() && upiStatus === "valid") {
//         prefill.vpa = upiId.trim();
//       }

//       const methodRestriction =
//         selectedMethod === "netbanking"
//           ? {
//               upi: false,
//               card: false,
//               netbanking: true,
//               wallet: false,
//               paylater: false,
//               emi: false,
//             }
//           : selectedMethod === "card"
//           ? {
//               upi: false,
//               card: true,
//               netbanking: false,
//               wallet: false,
//               paylater: false,
//               emi: false,
//             }
//           : undefined;

//       const options: any = {
//         key: razorpayKey,
//         order_id: orderId,
//         name: "Tokun",
//         description:
//           selectedMethod === "upi"
//             ? "Add funds via UPI"
//             : selectedMethod === "netbanking"
//             ? "Add funds via Net Banking"
//             : "Add funds via Card",
//         image: "/favicon.ico",
//         prefill,
//         notes: {
//           purpose: "wallet_topup",
//           selectedMethod,
//           walletAmount: String(addAmount),
//         },
//         theme: {
//           color: "#1A73E8",
//         },
//         ...(methodRestriction !== undefined && {
//           method: methodRestriction,
//         }),
//         handler: async (response: any) => {
//           try {
//             setPayLoading(true);

//             const verifyRes = await fetch(VERIFY_PAYMENT_URL, {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${authToken}`,
//               },
//               credentials: "include",
//               body: JSON.stringify(response),
//             });

//             const verifyData = await verifyRes.json().catch(() => ({}));

//             if (!verifyRes.ok || !verifyData.success) {
//               throw new Error(verifyData.message || "Verification failed.");
//             }

//             setPaymentSuccess("Payment successful! Wallet updated.");
//             await fetchWallet();

//             setTimeout(() => {
//               navigate("/wallet");
//             }, 1200);
//           } catch (err: any) {
//             setPaymentError(err?.message || "Payment verification failed.");
//           } finally {
//             setPayLoading(false);
//           }
//         },
//         modal: {
//           ondismiss: () => setPayLoading(false),
//         },
//       };

//       const razorpay = new window.Razorpay(options);

//       razorpay.on("payment.failed", (response: any) => {
//         setPaymentError(
//           response?.error?.description ||
//             response?.error?.reason ||
//             "Payment failed. Please try again."
//         );
//         setPayLoading(false);
//       });

//       razorpay.open();
//     } catch (err: any) {
//       console.error("[AddFunds] error:", err);
//       setPaymentError(err?.message || "Could not start payment.");
//       setPayLoading(false);
//     }
//   };

//   const paymentMethods: {
//     id: PaymentMethod;
//     title: string;
//     subtitle: string;
//     icon: string;
//   }[] = [
//     {
//       id: "upi",
//       title: "UPI",
//       subtitle: "Instant + QR",
//       icon: "/icons/upi.svg",
//     },
//     {
//       id: "netbanking",
//       title: "Net Banking",
//       subtitle: "2-3 mins",
//       icon: "/icons/netbanking.svg",
//     },
//     {
//       id: "card",
//       title: "Card",
//       subtitle: "Debit / Credit",
//       icon: "/icons/addcard.svg",
//     },
//   ];

//   const isConfirmDisabled =
//     !addAmount ||
//     payLoading ||
//     (selectedMethod === "upi" &&
//       upiId.trim() !== "" &&
//       ["invalid", "verifying"].includes(upiStatus));

//   const confirmBtnLabel =
//     payLoading
//       ? "Processing..."
//       : selectedMethod === "card"
//       ? "Pay with Card"
//       : "Confirm & Add Funds";

//   const confirmBtnStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 700,
//     fontSize: 16,
//     lineHeight: "100%",
//     textAlign: "center",
//   };

//   const summaryLabelStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 400,
//     fontSize: 14,
//     color: "#71717A",
//     whiteSpace: "nowrap",
//   };

//   const summaryValueStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 500,
//     fontSize: 14,
//     color: "#FFFFFF",
//     whiteSpace: "nowrap",
//   };

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
//             minHeight: 1100,
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
//                   fontSize: 36,
//                   lineHeight: "100%",
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
//                   fontSize: 16,
//                   lineHeight: "24px",
//                   color: "#A1A1AA",
//                 }}
//               >
//                 Add money to your wallet using UPI, Net Banking, or debit/credit
//                 card.
//                 <br />
//                 Wallet transactions below update automatically.
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
//                     <div className="flex items-center justify-between gap-4">
//                       <p
//                         style={{
//                           fontFamily: fontBase,
//                           fontWeight: 600,
//                           fontSize: 12,
//                           letterSpacing: "1.2px",
//                           color: "#C084FC",
//                           textTransform: "uppercase",
//                         }}
//                       >
//                         Current Balance
//                       </p>

//                       <button
//                         type="button"
//                         onClick={fetchWallet}
//                         disabled={walletLoading}
//                         className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70 hover:bg-white/[0.07] disabled:opacity-50"
//                       >
//                         <RefreshCcw
//                           className={`h-3.5 w-3.5 ${
//                             walletLoading ? "animate-spin" : ""
//                           }`}
//                         />
//                         Refresh
//                       </button>
//                     </div>

//                     <h2
//                       className="mt-5 text-white"
//                       style={{
//                         fontFamily: fontBase,
//                         fontWeight: 900,
//                         fontSize: 60,
//                         lineHeight: "60px",
//                       }}
//                     >
//                       {walletLoading ? "Loading..." : `₹ ${fmt(availableBalance)}`}
//                     </h2>

//                     <div className="mt-12 h-px w-full bg-white/10" />

//                     <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
//                       <div>
//                         <p
//                           style={{
//                             fontFamily: fontBase,
//                             fontWeight: 400,
//                             fontSize: 14,
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
//                             fontSize: 24,
//                             color: "#FFFFFF",
//                           }}
//                         >
//                           {walletLoading ? "—" : `₹${fmt(totalEarning)}`}
//                         </p>
//                       </div>

//                       <div>
//                         <p
//                           style={{
//                             fontFamily: fontBase,
//                             fontWeight: 400,
//                             fontSize: 14,
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
//                             fontSize: 24,
//                             color: "#ADC6FF",
//                           }}
//                         >
//                           {walletLoading ? "—" : `₹${fmt(monthlyEarning)}`}
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
//                         color: "#A1A1AA",
//                       }}
//                     >
//                       Select Payment Method
//                     </p>

//                     <div
//                       className="mt-6 grid grid-cols-3 gap-4"
//                       style={{ maxWidth: "min(546px, 100%)" }}
//                     >
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
//                               className="mt-4"
//                               style={{
//                                 fontFamily: fontBase,
//                                 fontWeight: 700,
//                                 fontSize: 13,
//                                 color: "#FFFFFF",
//                               }}
//                             >
//                               {method.title}
//                             </p>

//                             <p
//                               className="mt-1"
//                               style={{
//                                 fontFamily: fontBase,
//                                 fontWeight: 400,
//                                 fontSize: 10,
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
//                         }}
//                       >
//                         <div className="flex min-w-0 flex-1 items-center gap-4">
//                           <span
//                             style={{
//                               fontFamily: fontBase,
//                               fontWeight: 900,
//                               fontSize: 34,
//                               color: "#C084FC",
//                             }}
//                           >
//                             ₹
//                           </span>

//                           <input
//                             value={amount}
//                             onChange={(e) => {
//                               setAmount(e.target.value.replace(/[^\d]/g, ""));
//                               setPaymentError("");
//                               setPaymentSuccess("");
//                             }}
//                             placeholder="0.00"
//                             inputMode="numeric"
//                             className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/10"
//                             style={{
//                               fontFamily: fontBase,
//                               fontWeight: 900,
//                               fontSize: 34,
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
//                             fontSize: 12,
//                             color: "#71717A",
//                           }}
//                         >
//                           Minimum add: ₹100. Maximum: ₹1,00,000 per transaction.
//                         </span>
//                       </div>

//                       <div className="mt-5 flex flex-nowrap gap-4 overflow-x-auto pb-1">
//                         {[100, 200, 500, 2000].map((v) => (
//                           <button
//                             key={v}
//                             type="button"
//                             onClick={() => {
//                               setAmount(String(v));
//                               setPaymentError("");
//                               setPaymentSuccess("");
//                             }}
//                             className="h-[40px] shrink-0 rounded-[8px] border border-white/10 px-7"
//                             style={{
//                               background: "#18181B80",
//                               fontFamily: fontBase,
//                               fontWeight: 500,
//                               fontSize: 18,
//                               color: "#FFFFFF",
//                             }}
//                           >
//                             ₹{v}
//                           </button>
//                         ))}
//                       </div>
//                     </div>

//                     {selectedMethod === "upi" && (
//                       <div className="mt-7">
//                         <div
//                           className="rounded-[14px] border border-white/10 p-5 mb-6"
//                           style={{
//                             background: "rgba(255,255,255,0.04)",
//                           }}
//                         >
//                           <p
//                             style={{
//                               fontFamily: fontBase,
//                               fontWeight: 700,
//                               fontSize: 14,
//                               color: "#FFFFFF",
//                             }}
//                           >
//                             UPI — including QR Scan
//                           </p>

//                           <p
//                             className="mt-2"
//                             style={{
//                               fontFamily: fontBase,
//                               fontWeight: 400,
//                               fontSize: 13,
//                               color: "rgba(255,255,255,0.5)",
//                               lineHeight: "20px",
//                             }}
//                           >
//                             Razorpay checkout mein UPI ID enter karo ya built-in
//                             QR scan karo.
//                           </p>

//                           <div className="mt-4 flex flex-wrap gap-2">
//                             {[
//                               "Google Pay",
//                               "PhonePe",
//                               "BHIM",
//                               "Paytm",
//                               "UPI QR",
//                             ].map((app) => (
//                               <span
//                                 key={app}
//                                 className="rounded-[6px] px-3 py-1 text-xs"
//                                 style={{
//                                   background: "rgba(255,255,255,0.08)",
//                                   color: "rgba(255,255,255,0.6)",
//                                   fontFamily: fontBase,
//                                 }}
//                               >
//                                 {app}
//                               </span>
//                             ))}
//                           </div>
//                         </div>

//                         <label
//                           style={{
//                             fontFamily: fontBase,
//                             fontWeight: 700,
//                             fontSize: 13,
//                             color: "#A1A1AA",
//                           }}
//                         >
//                           UPI ID{" "}
//                           <span
//                             style={{
//                               color: "rgba(255,255,255,0.35)",
//                               fontWeight: 400,
//                             }}
//                           >
//                             optional
//                           </span>
//                         </label>

//                         {import.meta.env?.MODE !== "production" && (
//                           <div
//                             className="mt-3 rounded-[10px] border border-white/10 px-4 py-3"
//                             style={{
//                               background: "rgba(255,255,255,0.04)",
//                             }}
//                           >
//                             <p
//                               style={{
//                                 fontFamily: fontBase,
//                                 fontWeight: 600,
//                                 fontSize: 12,
//                                 color: "#C084FC",
//                               }}
//                             >
//                               Test Mode UPI IDs:
//                             </p>

//                             <p
//                               className="mt-1"
//                               style={{
//                                 fontFamily: fontBase,
//                                 fontWeight: 400,
//                                 fontSize: 12,
//                                 color: "rgba(255,255,255,0.5)",
//                               }}
//                             >
//                               ✅ Success:{" "}
//                               <code className="text-white">
//                                 success@razorpay
//                               </code>{" "}
//                               ❌ Failure:{" "}
//                               <code className="text-white">
//                                 failure@razorpay
//                               </code>
//                             </p>
//                           </div>
//                         )}

//                         <div
//                           className="mt-5 flex items-center gap-3"
//                           style={{ width: "min(546px, 100%)" }}
//                         >
//                           <div className="relative flex-1">
//                             <input
//                               value={upiId}
//                               onChange={(e) => {
//                                 setUpiId(e.target.value);
//                                 setPaymentError("");
//                               }}
//                               placeholder="yourname@upi"
//                               className="w-full px-5 outline-none placeholder:text-white/35"
//                               style={{
//                                 height: 50,
//                                 borderRadius: 16,
//                                 background: "#30302E",
//                                 border: `1px solid ${
//                                   upiStatus === "valid"
//                                     ? "rgba(74,222,128,0.5)"
//                                     : upiStatus === "invalid"
//                                     ? "rgba(248,113,113,0.5)"
//                                     : "#FFFFFF1A"
//                                 }`,
//                                 fontFamily: fontBase,
//                                 fontWeight: 400,
//                                 fontSize: 18,
//                                 color: "#FFFFFF",
//                                 paddingRight:
//                                   upiStatus !== "idle" ? "40px" : "16px",
//                               }}
//                             />

//                             {upiStatus === "valid" && (
//                               <CheckCircle2
//                                 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5"
//                                 style={{ color: "#4ade80" }}
//                               />
//                             )}

//                             {upiStatus === "invalid" && (
//                               <XCircle
//                                 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5"
//                                 style={{ color: "#f87171" }}
//                               />
//                             )}

//                             {upiStatus === "verifying" && (
//                               <Loader2
//                                 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin"
//                                 style={{ color: "#71717A" }}
//                               />
//                             )}
//                           </div>

//                           <button
//                             type="button"
//                             onClick={handleVerifyUpi}
//                             disabled={
//                               !upiId.trim() || upiStatus === "verifying"
//                             }
//                             className="h-[50px] shrink-0 rounded-[12px] px-5 text-white disabled:opacity-40 transition-opacity"
//                             style={{
//                               background:
//                                 upiStatus === "valid"
//                                   ? "linear-gradient(270deg,#4ade80 0%,#22c55e 100%)"
//                                   : "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
//                               fontFamily: fontBase,
//                               fontWeight: 700,
//                               fontSize: 13,
//                             }}
//                           >
//                             {upiStatus === "verifying"
//                               ? "Verifying..."
//                               : upiStatus === "valid"
//                               ? "✓ Verified"
//                               : "Verify UPI"}
//                           </button>
//                         </div>

//                         {upiStatus === "valid" && (
//                           <div className="mt-3 flex items-center gap-2">
//                             <CheckCircle2
//                               className="h-4 w-4 shrink-0"
//                               style={{ color: "#4ade80" }}
//                             />

//                             <span
//                               style={{
//                                 fontFamily: fontBase,
//                                 fontWeight: 500,
//                                 fontSize: 13,
//                                 color: "#4ade80",
//                               }}
//                             >
//                               UPI ID verified{upiName ? ` — ${upiName}` : ""}
//                             </span>
//                           </div>
//                         )}

//                         {upiStatus === "invalid" && upiError && (
//                           <p
//                             className="mt-3"
//                             style={{
//                               fontFamily: fontBase,
//                               fontWeight: 400,
//                               fontSize: 13,
//                               color: "#f87171",
//                             }}
//                           >
//                             {upiError}
//                           </p>
//                         )}
//                       </div>
//                     )}

//                     {selectedMethod === "netbanking" && (
//                       <div
//                         className="mt-7 rounded-[14px] border border-white/10 p-5"
//                         style={{
//                           background: "rgba(255,255,255,0.05)",
//                         }}
//                       >
//                         <p
//                           style={{
//                             fontFamily: fontBase,
//                             fontWeight: 700,
//                             fontSize: 14,
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
//                           Razorpay checkout mein apna bank choose karo.
//                         </p>
//                       </div>
//                     )}

//                     {selectedMethod === "card" && (
//                       <div className="mt-7">
//                         <div
//                           className="rounded-[14px] border border-white/10 p-6"
//                           style={{
//                             background: "rgba(255,255,255,0.04)",
//                           }}
//                         >
//                           <div className="flex items-start gap-4">
//                             <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1A73E8]/20">
//                               <CreditCard className="h-5 w-5 text-[#1A73E8]" />
//                             </div>

//                             <div className="flex-1">
//                               <p
//                                 style={{
//                                   fontFamily: fontBase,
//                                   fontWeight: 700,
//                                   fontSize: 14,
//                                   color: "#FFFFFF",
//                                 }}
//                               >
//                                 Pay via Debit / Credit Card
//                               </p>

//                               <p
//                                 className="mt-3"
//                                 style={{
//                                   fontFamily: fontBase,
//                                   fontWeight: 400,
//                                   fontSize: 12,
//                                   lineHeight: "18px",
//                                   color: "#71717A",
//                                 }}
//                               >
//                                 Razorpay secure checkout open hoga. Success hote
//                                 hi wallet automatically credit hoga.
//                               </p>

//                               <div className="mt-4 flex flex-wrap gap-3">
//                                 {[
//                                   "Debit Card",
//                                   "Credit Card",
//                                   "Rupay",
//                                   "Visa",
//                                   "Mastercard",
//                                 ].map((item) => (
//                                   <span
//                                     key={item}
//                                     className="rounded-[6px] px-3 py-1 text-xs"
//                                     style={{
//                                       background: "rgba(255,255,255,0.08)",
//                                       color: "rgba(255,255,255,0.6)",
//                                       fontFamily: fontBase,
//                                     }}
//                                   >
//                                     {item}
//                                   </span>
//                                 ))}
//                               </div>

//                               {import.meta.env?.MODE !== "production" && (
//                                 <div
//                                   className="mt-4 rounded-[10px] border border-white/10 px-4 py-3"
//                                   style={{
//                                     background: "rgba(255,255,255,0.04)",
//                                   }}
//                                 >
//                                   <p
//                                     style={{
//                                       fontFamily: fontBase,
//                                       fontWeight: 600,
//                                       fontSize: 12,
//                                       color: "#C084FC",
//                                     }}
//                                   >
//                                     Test Card:
//                                   </p>

//                                   <p
//                                     className="mt-1"
//                                     style={{
//                                       fontFamily: fontBase,
//                                       fontWeight: 400,
//                                       fontSize: 12,
//                                       color: "rgba(255,255,255,0.5)",
//                                     }}
//                                   >
//                                     No:{" "}
//                                     <code className="text-white">
//                                       4111 1111 1111 1111
//                                     </code>{" "}
//                                     Expiry: any future date CVV: any 3 digits
//                                   </p>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div
//                   className="relative overflow-hidden border border-white/10"
//                   style={{
//                     borderRadius: 28,
//                     background: "rgba(23,23,26,0.56)",
//                   }}
//                 >
//                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(26,115,232,0.18),transparent_50%)]" />

//                   <div className="relative z-10 p-8">
//                     <div className="flex items-center justify-between gap-4">
//                       <div>
//                         <h3
//                           style={{
//                             fontFamily: fontBase,
//                             fontWeight: 700,
//                             fontSize: 18,
//                             color: "#FFFFFF",
//                           }}
//                         >
//                           Recent Wallet Transactions
//                         </h3>

//                         <p className="mt-1 text-xs text-white/45">
//                           Admin approval ke baad pending withdrawal yahin
//                           Successful dikhna chahiye.
//                         </p>
//                       </div>

//                       <button
//                         type="button"
//                         onClick={fetchWallet}
//                         disabled={walletLoading}
//                         className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70 hover:bg-white/[0.07] disabled:opacity-50"
//                       >
//                         <RefreshCcw
//                           className={`h-3.5 w-3.5 ${
//                             walletLoading ? "animate-spin" : ""
//                           }`}
//                         />
//                         Refresh
//                       </button>
//                     </div>

//                     <div className="mt-5 space-y-3">
//                       {walletLoading && recentTransactions.length === 0 && (
//                         <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
//                           Loading transactions...
//                         </div>
//                       )}

//                       {!walletLoading && recentTransactions.length === 0 && (
//                         <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
//                           No wallet transactions found.
//                         </div>
//                       )}

//                       {recentTransactions.map((txn) => (
//                         <div
//                           key={txn.id}
//                           className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
//                         >
//                           <div className="min-w-0">
//                             <div className="text-sm font-semibold text-white/90">
//                               {getTxnTitle(txn)}
//                             </div>

//                             <div className="mt-1 text-xs text-white/45">
//                               {txn.description || "Wallet transaction"}
//                             </div>

//                             <div className="mt-1 text-xs text-white/35">
//                               {formatDate(txn.date)}
//                             </div>

//                             {txn.utrNumber && (
//                               <div className="mt-1 text-xs text-emerald-300">
//                                 UTR: {txn.utrNumber}
//                               </div>
//                             )}

//                             {txn.source === "withdrawal" &&
//                               txn.netAmount !== null &&
//                               txn.netAmount !== undefined && (
//                                 <div className="mt-1 text-xs text-white/35">
//                                   Net payout: ₹
//                                   {Number(txn.netAmount || 0).toFixed(2)}
//                                   {txn.serviceFee !== null &&
//                                     txn.serviceFee !== undefined &&
//                                     ` • Fee: ₹${Number(
//                                       txn.serviceFee || 0
//                                     ).toFixed(2)}`}
//                                 </div>
//                               )}
//                           </div>

//                           <div className="shrink-0 text-right">
//                             <div
//                               className={
//                                 txn.type === "credit"
//                                   ? "text-sm font-bold text-emerald-300"
//                                   : "text-sm font-bold text-red-300"
//                               }
//                             >
//                               {txn.amount}
//                             </div>

//                             <span
//                               className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getTxnStatusClass(
//                                 txn
//                               )}`}
//                             >
//                               {getTxnStatusLabel(txn)}
//                             </span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <aside
//                 className="relative min-w-0 self-start overflow-hidden border border-white/10"
//                 style={{
//                   width: "100%",
//                   minHeight: 471,
//                   height: "fit-content",
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
//                       fontSize: 18,
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
//                       <span style={summaryLabelStyle}>
//                         {selectedMethod === "netbanking"
//                           ? "Service Fee (2%)"
//                           : "Service Fee"}
//                       </span>

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
//                           color: "#C084FC",
//                           whiteSpace: "nowrap",
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
//                         fontSize: 12,
//                         color: "#71717A",
//                       }}
//                     >
//                       {selectedMethod === "card"
//                         ? "Card payment Razorpay ke secure checkout se hogi. Wallet instantly credit hoga."
//                         : selectedMethod === "upi"
//                         ? "UPI checkout mein QR scan ya UPI ID se pay karo. Funds instantly credit honge."
//                         : "Payment secured with end-to-end encryption. Funds appear instantly after confirmation."}
//                     </p>
//                   </div>

//                   {paymentError && (
//                     <div
//                       className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white"
//                       style={{
//                         background: "#2A1717",
//                         borderColor: "rgba(239,68,68,0.35)",
//                       }}
//                     >
//                       {paymentError}
//                     </div>
//                   )}

//                   {paymentSuccess && (
//                     <div
//                       className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white"
//                       style={{
//                         background: "#052A1D",
//                         borderColor: "rgba(74,222,128,0.35)",
//                       }}
//                     >
//                       {paymentSuccess}
//                     </div>
//                   )}

//                   <button
//                     type="button"
//                     disabled={isConfirmDisabled}
//                     onClick={handleConfirmAddFunds}
//                     className="mt-8 h-[49px] w-full rounded-[8px] text-white disabled:opacity-50"
//                     style={{
//                       ...confirmBtnStyle,
//                       background: "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)",
//                     }}
//                   >
//                     {confirmBtnLabel}
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
import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Info,
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PaymentMethod = "upi" | "netbanking" | "card";
type UpiStatus = "idle" | "verifying" | "valid" | "invalid";

type WalletTransaction = {
  id: string;
  date: string;
  description: string;
  status: "Pending" | "Completed" | "Failed" | "Rejected" | string;
  displayStatus?: string;
  amount: string;
  rawAmount?: number;
  type: "credit" | "debit" | string;
  source?: string;
  utrNumber?: string;
  withdrawalId?: string;
  netAmount?: number | null;
  serviceFee?: number | null;
  processedAt?: string | null;
};

const AddFunds = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth() as any;

  const API_BASE =
    (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") ||
    "http://localhost:5002";

  const fontBase = "Inter, system-ui, Arial, sans-serif";

  const CREATE_ORDER_URL = `${API_BASE}/api/wallet/add-fund/create-order`;
  const VERIFY_PAYMENT_URL = `${API_BASE}/api/wallet/add-fund/verify`;
  const WALLET_BALANCE_URL = `${API_BASE}/api/wallet/balance`;
  const UPI_VALIDATE_URL = `${API_BASE}/api/wallet/upi/validate`;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [upiStatus, setUpiStatus] = useState<UpiStatus>("idle");
  const [upiError, setUpiError] = useState("");
  const [upiName, setUpiName] = useState("");

  const [availableBalance, setAvailableBalance] = useState(0);
  const [totalEarning, setTotalEarning] = useState(0);
  const [monthlyEarning, setMonthlyEarning] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<
    WalletTransaction[]
  >([]);

  const [payLoading, setPayLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");

  const getAuthToken = () => {
    return (
      token ||
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("tokun_token") ||
      sessionStorage.getItem("tokun_token") ||
      ""
    );
  };

  const fetchWallet = async () => {
    const authToken = getAuthToken();
    if (!authToken) return;

    try {
      setWalletLoading(true);

      const res = await fetch(WALLET_BALANCE_URL, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setAvailableBalance(Number(data.availableBalance || 0));
        setTotalEarning(Number(data.totalRevenue || 0));
        setMonthlyEarning(Number(data.monthlyEarning || 0));
        setRecentTransactions(data.recentTransactions || []);
      }
    } catch (err) {
      console.error("wallet fetch error:", err);
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();

    const interval = window.setInterval(() => {
      fetchWallet();
    }, 5000);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const onFocus = () => {
      fetchWallet();
    };

    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    setPaymentError("");
    setPaymentSuccess("");
  }, [selectedMethod]);

  useEffect(() => {
    if (upiStatus !== "idle") {
      setUpiStatus("idle");
      setUpiError("");
      setUpiName("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upiId]);

  const addAmount = Number(amount || 0);

  const serviceFee =
    addAmount > 0 && selectedMethod === "netbanking"
      ? +(addAmount * 0.02).toFixed(2)
      : 0;

  const debitAmount = addAmount > 0 ? +(addAmount + serviceFee).toFixed(2) : 0;

  const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n || 0);

  const formatDate = (date?: string) => {
    if (!date) return "—";

    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "—";

    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTxnStatusLabel = (txn: WalletTransaction) => {
    if (txn.displayStatus) return txn.displayStatus;

    if (txn.status === "Completed") return "Successful";
    if (txn.status === "Pending") return "Pending";

    if (txn.status === "Failed") {
      if (txn.source === "withdrawal" || txn.source === "withdrawal_refund") {
        return "Rejected";
      }

      return "Failed";
    }

    if (txn.status === "Rejected") return "Rejected";

    return txn.status || "Pending";
  };

  const getTxnStatusClass = (txn: WalletTransaction) => {
    const label = getTxnStatusLabel(txn);

    if (txn.status === "Completed" || label === "Successful") {
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25";
    }

    if (txn.status === "Pending" || label === "Pending") {
      return "bg-amber-500/15 text-amber-300 border border-amber-500/25";
    }

    if (
      txn.status === "Failed" ||
      txn.status === "Rejected" ||
      label === "Rejected" ||
      label === "Failed"
    ) {
      return "bg-red-500/15 text-red-300 border border-red-500/25";
    }

    return "bg-white/10 text-white/70 border border-white/10";
  };

  const getTxnTitle = (txn: WalletTransaction) => {
    if (txn.source === "withdrawal") {
      return txn.status === "Completed"
        ? "Withdrawal paid successfully"
        : "Withdrawal request";
    }

    if (txn.source === "withdrawal_refund") {
      return "Withdrawal refunded";
    }

    if (txn.source === "add_fund") {
      return "Wallet top-up";
    }

    if (txn.source === "bank_transfer") {
      return "Bank transfer";
    }

    return txn.description || "Wallet transaction";
  };

  const handleVerifyUpi = async () => {
    if (!upiId.trim()) {
      setUpiError("Please enter a UPI ID first.");
      return;
    }

    const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

    if (!vpaRegex.test(upiId.trim().toLowerCase())) {
      setUpiStatus("invalid");
      setUpiError("Invalid UPI ID format. Example: name@upi");
      return;
    }

    try {
      setUpiStatus("verifying");
      setUpiError("");
      setUpiName("");

      const authToken = getAuthToken();

      const res = await fetch(UPI_VALIDATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          vpa: upiId.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setUpiStatus("invalid");
        setUpiError(data.message || "UPI ID is invalid or does not exist.");
        return;
      }

      setUpiStatus("valid");

      if (data.name && !["(Name unavailable in test mode)"].includes(data.name)) {
        setUpiName(data.name);
      }
    } catch (err) {
      setUpiStatus("invalid");
      setUpiError("Could not verify UPI ID. Please try again.");
    }
  };

  const handleConfirmAddFunds = async () => {
    setPaymentError("");
    setPaymentSuccess("");

    const authToken = getAuthToken();

    if (!authToken) {
      setPaymentError("Please login first.");
      return;
    }

    if (!addAmount || Number.isNaN(addAmount)) {
      setPaymentError("Please enter amount.");
      return;
    }

    if (addAmount < 100) {
      setPaymentError("Minimum add amount is ₹100.");
      return;
    }

    if (addAmount > 100000) {
      setPaymentError("Maximum amount is ₹1,00,000 per transaction.");
      return;
    }

    if (!window.Razorpay) {
      setPaymentError(
        "Razorpay not loaded. Please check your internet connection."
      );
      return;
    }

    if (selectedMethod === "upi" && upiId.trim()) {
      if (upiStatus === "idle") {
        setPaymentError("Please verify your UPI ID before proceeding.");
        return;
      }

      if (upiStatus === "invalid") {
        setPaymentError("Invalid UPI ID. Please enter a valid one.");
        return;
      }

      if (upiStatus === "verifying") {
        setPaymentError("UPI verification in progress. Please wait.");
        return;
      }
    }

    try {
      setPayLoading(true);

      const res = await fetch(CREATE_ORDER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          amount: addAmount,
          selectedMethod,
        }),
      });

      const orderData = await res.json().catch(() => ({}));

      if (!res.ok || !orderData.success) {
        throw new Error(
          orderData.message || "Could not create payment order."
        );
      }

      const orderId = String(orderData?.order?.id || "");
      const razorpayKey = String(orderData?.key || "");

      if (!razorpayKey.startsWith("rzp_")) {
        throw new Error("Invalid Razorpay key received from server.");
      }

      if (!orderId.startsWith("order_")) {
        throw new Error("Invalid Razorpay order received from server.");
      }

      const cleanEmail = String(user?.email || "").trim();
      const cleanContact = String(user?.phone || user?.mobile || "")
        .replace(/\D/g, "")
        .slice(-10);
      const cleanName = String(user?.name || "").trim();

      const prefill: Record<string, string> = {};

      if (cleanName) prefill.name = cleanName;

      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        prefill.email = cleanEmail;
      }

      if (/^[6-9]\d{9}$/.test(cleanContact)) {
        prefill.contact = cleanContact;
      }

      if (selectedMethod === "upi" && upiId.trim() && upiStatus === "valid") {
        prefill.vpa = upiId.trim();
      }

      const methodRestriction =
        selectedMethod === "netbanking"
          ? {
              upi: false,
              card: false,
              netbanking: true,
              wallet: false,
              paylater: false,
              emi: false,
            }
          : selectedMethod === "card"
          ? {
              upi: false,
              card: true,
              netbanking: false,
              wallet: false,
              paylater: false,
              emi: false,
            }
          : undefined;

      const options: any = {
        key: razorpayKey,
        order_id: orderId,
        name: "Tokun",
        description:
          selectedMethod === "upi"
            ? "Add funds via UPI"
            : selectedMethod === "netbanking"
            ? "Add funds via Net Banking"
            : "Add funds via Card",
        image: "/favicon.ico",
        prefill,
        notes: {
          purpose: "wallet_topup",
          selectedMethod,
          walletAmount: String(addAmount),
        },
        theme: {
          color: "#1A73E8",
        },
        ...(methodRestriction !== undefined && {
          method: methodRestriction,
        }),
        handler: async (response: any) => {
          try {
            setPayLoading(true);

            const verifyRes = await fetch(VERIFY_PAYMENT_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
              credentials: "include",
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json().catch(() => ({}));

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.message || "Verification failed.");
            }

            setPaymentSuccess("Payment successful! Wallet updated.");
            await fetchWallet();

            setTimeout(() => {
              navigate("/wallet");
            }, 1200);
          } catch (err: any) {
            setPaymentError(err?.message || "Payment verification failed.");
          } finally {
            setPayLoading(false);
          }
        },
        modal: {
          ondismiss: () => setPayLoading(false),
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response: any) => {
        setPaymentError(
          response?.error?.description ||
            response?.error?.reason ||
            "Payment failed. Please try again."
        );
        setPayLoading(false);
      });

      razorpay.open();
    } catch (err: any) {
      console.error("[AddFunds] error:", err);
      setPaymentError(err?.message || "Could not start payment.");
      setPayLoading(false);
    }
  };

  const paymentMethods: {
    id: PaymentMethod;
    title: string;
    subtitle: string;
    icon: string;
  }[] = [
    {
      id: "upi",
      title: "UPI",
      subtitle: "Instant + QR",
      icon: "/icons/upi.svg",
    },
    {
      id: "netbanking",
      title: "Net Banking",
      subtitle: "2-3 mins",
      icon: "/icons/netbanking.svg",
    },
    {
      id: "card",
      title: "Card",
      subtitle: "Debit / Credit",
      icon: "/icons/addcard.svg",
    },
  ];

  const isConfirmDisabled =
    !addAmount ||
    payLoading ||
    (selectedMethod === "upi" &&
      upiId.trim() !== "" &&
      ["invalid", "verifying"].includes(upiStatus));

  const confirmBtnLabel =
    payLoading
      ? "Processing..."
      : selectedMethod === "card"
      ? "Pay with Card"
      : "Confirm & Add Funds";

  const confirmBtnStyle: CSSProperties = {
    fontFamily: fontBase,
    fontWeight: 700,
    fontSize: 16,
    lineHeight: "100%",
    textAlign: "center",
  };

  const summaryLabelStyle: CSSProperties = {
    fontFamily: fontBase,
    fontWeight: 400,
    fontSize: 14,
    color: "#71717A",
    whiteSpace: "nowrap",
  };

  const summaryValueStyle: CSSProperties = {
    fontFamily: fontBase,
    fontWeight: 500,
    fontSize: 14,
    color: "#FFFFFF",
    whiteSpace: "nowrap",
  };

  const iconStyle: CSSProperties = {
    width: 40,
    height: 40,
    opacity: 1,
    objectFit: "contain",
    display: "block",
  };

  return (
    <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <img
          src="/icons/mpbg.png"
          alt="background"
          className="absolute inset-0 w-full h-screen object-contain object-top select-none"
        />
      </div>

      <div className="relative z-20 w-full bg-transparent px-4">
        <Header />
      </div>

      <main className="relative z-10 px-4 pt-[95px] pb-20">
        <section
          className="mx-auto overflow-hidden"
          style={{
            width: "min(1024px, 100%)",
            minHeight: 1100,
            borderRadius: 30,
            background: "#21212180",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            fontFamily: fontBase,
          }}
        >
          <div className="p-8 sm:p-[50px]">
            <button
              type="button"
              onClick={() => navigate("/wallet")}
              className="inline-flex items-center gap-2"
              style={{
                fontFamily: fontBase,
                fontWeight: 700,
                fontSize: 13,
                color: "#C084FC",
              }}
            >
              ← Back to Wallet
            </button>

            <div className="mt-4">
              <h1
                style={{
                  fontFamily: fontBase,
                  fontWeight: 700,
                  fontSize: 36,
                  lineHeight: "100%",
                  color: "#FFFFFF",
                }}
              >
                Add Funds
              </h1>

              <p
                className="mt-4 max-w-[590px]"
                style={{
                  fontFamily: fontBase,
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: "24px",
                  color: "#A1A1AA",
                }}
              >
                Add money to your wallet using UPI, Net Banking, or debit/credit
                card.
                <br />
                Wallet transactions below update automatically.
              </p>
            </div>

            <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_294px] gap-5 items-start">
              <div className="space-y-5 min-w-0">
                <div
                  className="relative overflow-hidden border border-white/10"
                  style={{
                    minHeight: 284,
                    borderRadius: 28,
                    background: "rgba(23,23,26,0.56)",
                  }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />

                  <div className="relative z-10 p-8">
                    <div className="flex items-center justify-between gap-4">
                      <p
                        style={{
                          fontFamily: fontBase,
                          fontWeight: 600,
                          fontSize: 12,
                          letterSpacing: "1.2px",
                          color: "#C084FC",
                          textTransform: "uppercase",
                        }}
                      >
                        Current Balance
                      </p>

                      <button
                        type="button"
                        onClick={fetchWallet}
                        disabled={walletLoading}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70 hover:bg-white/[0.07] disabled:opacity-50"
                      >
                        <RefreshCcw
                          className={`h-3.5 w-3.5 ${
                            walletLoading ? "animate-spin" : ""
                          }`}
                        />
                        Refresh
                      </button>
                    </div>

                    <h2
                      className="mt-5 text-white"
                      style={{
                        fontFamily: fontBase,
                        fontWeight: 900,
                        fontSize: 60,
                        lineHeight: "60px",
                      }}
                    >
                      {walletLoading ? "Loading..." : `₹ ${fmt(availableBalance)}`}
                    </h2>

                    <div className="mt-12 h-px w-full bg-white/10" />

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <p
                          style={{
                            fontFamily: fontBase,
                            fontWeight: 400,
                            fontSize: 14,
                            color: "rgba(255,255,255,0.35)",
                          }}
                        >
                          Total Earning
                        </p>

                        <p
                          className="mt-3"
                          style={{
                            fontFamily: fontBase,
                            fontWeight: 700,
                            fontSize: 24,
                            color: "#FFFFFF",
                          }}
                        >
                          {walletLoading ? "—" : `₹${fmt(totalEarning)}`}
                        </p>
                      </div>

                      <div>
                        <p
                          style={{
                            fontFamily: fontBase,
                            fontWeight: 400,
                            fontSize: 14,
                            color: "rgba(255,255,255,0.35)",
                          }}
                        >
                          Monthly Earnings
                        </p>

                        <p
                          className="mt-3"
                          style={{
                            fontFamily: fontBase,
                            fontWeight: 700,
                            fontSize: 24,
                            color: "#ADC6FF",
                          }}
                        >
                          {walletLoading ? "—" : `₹${fmt(monthlyEarning)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="relative self-start overflow-hidden border border-white/10"
                  style={{
                    height: "fit-content",
                    borderRadius: 28,
                    background: "rgba(23,23,26,0.56)",
                  }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_55%,rgba(255,20,239,0.28),transparent_50%)]" />

                  <div className="relative z-10 p-8">
                    <p
                      style={{
                        fontFamily: fontBase,
                        fontWeight: 700,
                        fontSize: 13,
                        color: "#A1A1AA",
                      }}
                    >
                      Select Payment Method
                    </p>

                    <div
                      className="mt-6 grid grid-cols-3 gap-4"
                      style={{ maxWidth: "min(546px, 100%)" }}
                    >
                      {paymentMethods.map((method) => {
                        const active = selectedMethod === method.id;

                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setSelectedMethod(method.id)}
                            className="flex h-[125px] flex-col items-center justify-center rounded-[10px] border text-center"
                            style={{
                              background: active
                                ? "rgba(23,23,26,0.72)"
                                : "rgba(255,255,255,0.06)",
                              borderColor: active
                                ? "#FF14EF"
                                : "rgba(255,255,255,0.08)",
                              boxShadow: active
                                ? "inset -1px 0 0 #1A73E8"
                                : "none",
                            }}
                          >
                            <img
                              src={method.icon}
                              alt=""
                              style={iconStyle}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />

                            <p
                              className="mt-4"
                              style={{
                                fontFamily: fontBase,
                                fontWeight: 700,
                                fontSize: 13,
                                color: "#FFFFFF",
                              }}
                            >
                              {method.title}
                            </p>

                            <p
                              className="mt-1"
                              style={{
                                fontFamily: fontBase,
                                fontWeight: 400,
                                fontSize: 10,
                                color: "rgba(255,255,255,0.35)",
                              }}
                            >
                              {method.subtitle}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-9">
                      <label
                        style={{
                          fontFamily: fontBase,
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#A1A1AA",
                        }}
                      >
                        Enter amount
                      </label>

                      <div
                        className="mt-5 flex items-center px-8"
                        style={{
                          width: "min(546px, 100%)",
                          height: 60,
                          borderRadius: 16,
                          background: "#18181B80",
                          border: "1px solid #FFFFFF1A",
                        }}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <span
                            style={{
                              fontFamily: fontBase,
                              fontWeight: 900,
                              fontSize: 34,
                              color: "#C084FC",
                            }}
                          >
                            ₹
                          </span>

                          <input
                            value={amount}
                            onChange={(e) => {
                              setAmount(e.target.value.replace(/[^\d]/g, ""));
                              setPaymentError("");
                              setPaymentSuccess("");
                            }}
                            placeholder="0.00"
                            inputMode="numeric"
                            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/10"
                            style={{
                              fontFamily: fontBase,
                              fontWeight: 900,
                              fontSize: 34,
                              color: "#FFFFFF",
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-2">
                        <Info className="h-4 w-4 text-[#71717A]" />

                        <span
                          style={{
                            fontFamily: fontBase,
                            fontWeight: 400,
                            fontSize: 12,
                            color: "#71717A",
                          }}
                        >
                          Minimum add: ₹100. Maximum: ₹1,00,000 per transaction.
                        </span>
                      </div>

                      <div className="mt-5 flex flex-nowrap gap-4 overflow-x-auto pb-1">
                        {[100, 200, 500, 2000].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => {
                              setAmount(String(v));
                              setPaymentError("");
                              setPaymentSuccess("");
                            }}
                            className="h-[40px] shrink-0 rounded-[8px] border border-white/10 px-7"
                            style={{
                              background: "#18181B80",
                              fontFamily: fontBase,
                              fontWeight: 500,
                              fontSize: 18,
                              color: "#FFFFFF",
                            }}
                          >
                            ₹{v}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedMethod === "upi" && (
                      <div className="mt-7">
                        <div
                          className="rounded-[14px] border border-white/10 p-5 mb-6"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                          }}
                        >
                          <p
                            style={{
                              fontFamily: fontBase,
                              fontWeight: 700,
                              fontSize: 14,
                              color: "#FFFFFF",
                            }}
                          >
                            UPI — including QR Scan
                          </p>

                          <p
                            className="mt-2"
                            style={{
                              fontFamily: fontBase,
                              fontWeight: 400,
                              fontSize: 13,
                              color: "rgba(255,255,255,0.5)",
                              lineHeight: "20px",
                            }}
                          >
                            Razorpay checkout mein UPI ID enter karo ya built-in
                            QR scan karo.
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {[
                              "Google Pay",
                              "PhonePe",
                              "BHIM",
                              "Paytm",
                              "UPI QR",
                            ].map((app) => (
                              <span
                                key={app}
                                className="rounded-[6px] px-3 py-1 text-xs"
                                style={{
                                  background: "rgba(255,255,255,0.08)",
                                  color: "rgba(255,255,255,0.6)",
                                  fontFamily: fontBase,
                                }}
                              >
                                {app}
                              </span>
                            ))}
                          </div>
                        </div>

                        <label
                          style={{
                            fontFamily: fontBase,
                            fontWeight: 700,
                            fontSize: 13,
                            color: "#A1A1AA",
                          }}
                        >
                          UPI ID{" "}
                          <span
                            style={{
                              color: "rgba(255,255,255,0.35)",
                              fontWeight: 400,
                            }}
                          >
                            optional
                          </span>
                        </label>

                        {import.meta.env?.MODE !== "production" && (
                          <div
                            className="mt-3 rounded-[10px] border border-white/10 px-4 py-3"
                            style={{
                              background: "rgba(255,255,255,0.04)",
                            }}
                          >
                            <p
                              style={{
                                fontFamily: fontBase,
                                fontWeight: 600,
                                fontSize: 12,
                                color: "#C084FC",
                              }}
                            >
                              Test Mode UPI IDs:
                            </p>

                            <p
                              className="mt-1"
                              style={{
                                fontFamily: fontBase,
                                fontWeight: 400,
                                fontSize: 12,
                                color: "rgba(255,255,255,0.5)",
                              }}
                            >
                              ✅ Success:{" "}
                              <code className="text-white">
                                success@razorpay
                              </code>{" "}
                              ❌ Failure:{" "}
                              <code className="text-white">
                                failure@razorpay
                              </code>
                            </p>
                          </div>
                        )}

                        <div
                          className="mt-5 flex items-center gap-3"
                          style={{ width: "min(546px, 100%)" }}
                        >
                          <div className="relative flex-1">
                            <input
                              value={upiId}
                              onChange={(e) => {
                                setUpiId(e.target.value);
                                setPaymentError("");
                              }}
                              placeholder="yourname@upi"
                              className="w-full px-5 outline-none placeholder:text-white/35"
                              style={{
                                height: 50,
                                borderRadius: 16,
                                background: "#30302E",
                                border: `1px solid ${
                                  upiStatus === "valid"
                                    ? "rgba(74,222,128,0.5)"
                                    : upiStatus === "invalid"
                                    ? "rgba(248,113,113,0.5)"
                                    : "#FFFFFF1A"
                                }`,
                                fontFamily: fontBase,
                                fontWeight: 400,
                                fontSize: 18,
                                color: "#FFFFFF",
                                paddingRight:
                                  upiStatus !== "idle" ? "40px" : "16px",
                              }}
                            />

                            {upiStatus === "valid" && (
                              <CheckCircle2
                                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5"
                                style={{ color: "#4ade80" }}
                              />
                            )}

                            {upiStatus === "invalid" && (
                              <XCircle
                                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5"
                                style={{ color: "#f87171" }}
                              />
                            )}

                            {upiStatus === "verifying" && (
                              <Loader2
                                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin"
                                style={{ color: "#71717A" }}
                              />
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={handleVerifyUpi}
                            disabled={
                              !upiId.trim() || upiStatus === "verifying"
                            }
                            className="h-[50px] shrink-0 rounded-[12px] px-5 text-white disabled:opacity-40 transition-opacity"
                            style={{
                              background:
                                upiStatus === "valid"
                                  ? "linear-gradient(270deg,#4ade80 0%,#22c55e 100%)"
                                  : "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
                              fontFamily: fontBase,
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            {upiStatus === "verifying"
                              ? "Verifying..."
                              : upiStatus === "valid"
                              ? "✓ Verified"
                              : "Verify UPI"}
                          </button>
                        </div>

                        {upiStatus === "valid" && (
                          <div className="mt-3 flex items-center gap-2">
                            <CheckCircle2
                              className="h-4 w-4 shrink-0"
                              style={{ color: "#4ade80" }}
                            />

                            <span
                              style={{
                                fontFamily: fontBase,
                                fontWeight: 500,
                                fontSize: 13,
                                color: "#4ade80",
                              }}
                            >
                              UPI ID verified{upiName ? ` — ${upiName}` : ""}
                            </span>
                          </div>
                        )}

                        {upiStatus === "invalid" && upiError && (
                          <p
                            className="mt-3"
                            style={{
                              fontFamily: fontBase,
                              fontWeight: 400,
                              fontSize: 13,
                              color: "#f87171",
                            }}
                          >
                            {upiError}
                          </p>
                        )}
                      </div>
                    )}

                    {selectedMethod === "netbanking" && (
                      <div
                        className="mt-7 rounded-[14px] border border-white/10 p-5"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: fontBase,
                            fontWeight: 700,
                            fontSize: 14,
                            color: "#FFFFFF",
                          }}
                        >
                          Net Banking
                        </p>

                        <p
                          className="mt-3"
                          style={{
                            fontFamily: fontBase,
                            fontWeight: 400,
                            fontSize: 12,
                            lineHeight: "18px",
                            color: "#71717A",
                          }}
                        >
                          Razorpay checkout mein apna bank choose karo.
                        </p>
                      </div>
                    )}

                    {selectedMethod === "card" && (
                      <div className="mt-7">
                        <div
                          className="rounded-[14px] border border-white/10 p-6"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1A73E8]/20">
                              <CreditCard className="h-5 w-5 text-[#1A73E8]" />
                            </div>

                            <div className="flex-1">
                              <p
                                style={{
                                  fontFamily: fontBase,
                                  fontWeight: 700,
                                  fontSize: 14,
                                  color: "#FFFFFF",
                                }}
                              >
                                Pay via Debit / Credit Card
                              </p>

                              <p
                                className="mt-3"
                                style={{
                                  fontFamily: fontBase,
                                  fontWeight: 400,
                                  fontSize: 12,
                                  lineHeight: "18px",
                                  color: "#71717A",
                                }}
                              >
                                Razorpay secure checkout open hoga. Success hote
                                hi wallet automatically credit hoga.
                              </p>

                              <div className="mt-4 flex flex-wrap gap-3">
                                {[
                                  "Debit Card",
                                  "Credit Card",
                                  "Rupay",
                                  "Visa",
                                  "Mastercard",
                                ].map((item) => (
                                  <span
                                    key={item}
                                    className="rounded-[6px] px-3 py-1 text-xs"
                                    style={{
                                      background: "rgba(255,255,255,0.08)",
                                      color: "rgba(255,255,255,0.6)",
                                      fontFamily: fontBase,
                                    }}
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>

                              {import.meta.env?.MODE !== "production" && (
                                <div
                                  className="mt-4 rounded-[10px] border border-white/10 px-4 py-3"
                                  style={{
                                    background: "rgba(255,255,255,0.04)",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontFamily: fontBase,
                                      fontWeight: 600,
                                      fontSize: 12,
                                      color: "#C084FC",
                                    }}
                                  >
                                    Test Card:
                                  </p>

                                  <p
                                    className="mt-1"
                                    style={{
                                      fontFamily: fontBase,
                                      fontWeight: 400,
                                      fontSize: 12,
                                      color: "rgba(255,255,255,0.5)",
                                    }}
                                  >
                                    No:{" "}
                                    <code className="text-white">
                                      4111 1111 1111 1111
                                    </code>{" "}
                                    Expiry: any future date CVV: any 3 digits
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="relative overflow-hidden border border-white/10"
                  style={{
                    borderRadius: 28,
                    background: "rgba(23,23,26,0.56)",
                  }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(26,115,232,0.18),transparent_50%)]" />

                  <div className="relative z-10 p-8">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3
                          style={{
                            fontFamily: fontBase,
                            fontWeight: 700,
                            fontSize: 18,
                            color: "#FFFFFF",
                          }}
                        >
                          Recent Wallet Transactions
                        </h3>

                        <p className="mt-1 text-xs text-white/45">
                          Admin approval ke baad pending withdrawal yahin
                          Successful dikhna chahiye.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={fetchWallet}
                        disabled={walletLoading}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70 hover:bg-white/[0.07] disabled:opacity-50"
                      >
                        <RefreshCcw
                          className={`h-3.5 w-3.5 ${
                            walletLoading ? "animate-spin" : ""
                          }`}
                        />
                        Refresh
                      </button>
                    </div>

                    <div className="mt-5 space-y-3">
                      {walletLoading && recentTransactions.length === 0 && (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
                          Loading transactions...
                        </div>
                      )}

                      {!walletLoading && recentTransactions.length === 0 && (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
                          No wallet transactions found.
                        </div>
                      )}

                      {recentTransactions.map((txn) => (
                        <div
                          key={txn.id}
                          className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white/90">
                              {getTxnTitle(txn)}
                            </div>

                            <div className="mt-1 text-xs text-white/45">
                              {txn.description || "Wallet transaction"}
                            </div>

                            <div className="mt-1 text-xs text-white/35">
                              {formatDate(txn.date)}
                            </div>

                            {txn.utrNumber && (
                              <div className="mt-1 text-xs text-emerald-300">
                                UTR: {txn.utrNumber}
                              </div>
                            )}

                            {txn.source === "withdrawal" &&
                              txn.netAmount !== null &&
                              txn.netAmount !== undefined && (
                                <div className="mt-1 text-xs text-white/35">
                                  Net payout: ₹
                                  {Number(txn.netAmount || 0).toFixed(2)}
                                  {txn.serviceFee !== null &&
                                    txn.serviceFee !== undefined &&
                                    ` • Fee: ₹${Number(
                                      txn.serviceFee || 0
                                    ).toFixed(2)}`}
                                </div>
                              )}
                          </div>

                          <div className="shrink-0 text-right">
                            <div
                              className={
                                txn.type === "credit"
                                  ? "text-sm font-bold text-emerald-300"
                                  : "text-sm font-bold text-red-300"
                              }
                            >
                              {txn.amount}
                            </div>

                            <span
                              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getTxnStatusClass(
                                txn
                              )}`}
                            >
                              {getTxnStatusLabel(txn)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <aside
                className="relative min-w-0 self-start overflow-hidden border border-white/10"
                style={{
                  width: "100%",
                  minHeight: 471,
                  height: "fit-content",
                  borderRadius: 28,
                  background: "rgba(23,23,26,0.56)",
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_90%,rgba(255,20,239,0.17),transparent_55%)]" />

                <div className="relative z-10 p-8">
                  <h3
                    style={{
                      fontFamily: fontBase,
                      fontWeight: 700,
                      fontSize: 18,
                      color: "#FFFFFF",
                    }}
                  >
                    Transaction Summary
                  </h3>

                  <div className="mt-8 space-y-7">
                    <div className="flex items-center justify-between gap-4">
                      <span style={summaryLabelStyle}>Subtotal</span>
                      <span style={summaryValueStyle}>
                        ₹{addAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span style={summaryLabelStyle}>
                        {selectedMethod === "netbanking"
                          ? "Service Fee (2%)"
                          : "Service Fee"}
                      </span>

                      <span style={summaryValueStyle}>
                        ₹{serviceFee.toFixed(2)}
                      </span>
                    </div>

                    <div className="h-px w-full bg-white/10" />

                    <div className="flex items-center justify-between gap-3 min-w-0">
                      <span
                        style={{
                          fontFamily: fontBase,
                          fontWeight: 700,
                          fontSize: 20,
                          color: "#FFFFFF",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        Debit Amount
                      </span>

                      <span
                        style={{
                          fontFamily: fontBase,
                          fontWeight: 900,
                          fontSize: 16,
                          color: "#C084FC",
                          whiteSpace: "nowrap",
                          textAlign: "right",
                        }}
                      >
                        ₹{Math.max(debitAmount, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div
                    className="mt-8 flex gap-3 rounded-[14px] p-4"
                    style={{ background: "rgba(3,4,5,0.35)" }}
                  >
                    <img
                      src="/icons/locky.svg"
                      alt=""
                      className="mt-1 h-5 w-5 shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />

                    <p
                      style={{
                        fontFamily: fontBase,
                        fontWeight: 400,
                        fontSize: 12,
                        color: "#71717A",
                      }}
                    >
                      {selectedMethod === "card"
                        ? "Card payment Razorpay ke secure checkout se hogi. Wallet instantly credit hoga."
                        : selectedMethod === "upi"
                        ? "UPI checkout mein QR scan ya UPI ID se pay karo. Funds instantly credit honge."
                        : "Payment secured with end-to-end encryption. Funds appear instantly after confirmation."}
                    </p>
                  </div>

                  {paymentError && (
                    <div
                      className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white"
                      style={{
                        background: "#2A1717",
                        borderColor: "rgba(239,68,68,0.35)",
                      }}
                    >
                      {paymentError}
                    </div>
                  )}

                  {paymentSuccess && (
                    <div
                      className="mt-5 rounded-[10px] border px-3 py-3 text-sm text-white"
                      style={{
                        background: "#052A1D",
                        borderColor: "rgba(74,222,128,0.35)",
                      }}
                    >
                      {paymentSuccess}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isConfirmDisabled}
                    onClick={handleConfirmAddFunds}
                    className="mt-8 h-[49px] w-full rounded-[8px] text-white disabled:opacity-50"
                    style={{
                      ...confirmBtnStyle,
                      background: "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)",
                    }}
                  >
                    {confirmBtnLabel}
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