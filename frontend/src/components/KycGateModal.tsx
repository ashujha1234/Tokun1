// // import React, { useEffect, useMemo, useState } from "react";
// // import { ShieldCheck, Lock, UploadCloud, Camera, Info } from "lucide-react";

// // type KycStatus = "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED" | "FLAGGED";
// // type DocType = "AADHAAR" | "PASSPORT";

// // const GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

// // function cn(...x: Array<string | false | null | undefined>) {
// //   return x.filter(Boolean).join(" ");
// // }

// // function filePreview(file: File | null) {
// //   if (!file) return null;
// //   return URL.createObjectURL(file);
// // }

// // export default function KycGateModal({
// //   open,
// //   onClose,
// //   token,
// //   apiBase,
// //   defaultCountry = "IN",
// //   onVerified,
// //   requiredForLabel = "premium marketplace features",
// // }: {
// //   open: boolean;
// //   onClose: () => void;
// //   token: string;
// //   apiBase: string;
// //   defaultCountry?: string; // "IN" => Aadhaar default else Passport
// //   onVerified?: () => void;
// //   requiredForLabel?: string; // text under heading
// // }) {
// //   const [step, setStep] = useState<1 | 2 | 3>(1);
// //   const [status, setStatus] = useState<KycStatus>("NOT_SUBMITTED");
// //    const [extractedName, setExtractedName] = useState<string | null>(null);
// // const [matchScore, setMatchScore] = useState<number | null>(null);


// //   const [stage, setStage] = useState<string | null>(null);
// // const [cooldownUntil, setCooldownUntil] = useState<string | null>(null);
// // const [reasonText, setReasonText] = useState<string | null>(null);

// // // ✅ used to re-trigger polling after submit
// // const [pollTick, setPollTick] = useState(0);
// //   const initialDocType: DocType = useMemo(
// //     () => (String(defaultCountry).toUpperCase() === "IN" ? "AADHAAR" : "PASSPORT"),
// //     [defaultCountry]
// //   );

// //   const [docType, setDocType] = useState<DocType>(initialDocType);

// //   const [front, setFront] = useState<File | null>(null);
// //   const [back, setBack] = useState<File | null>(null);


// //   const [loadingStatus, setLoadingStatus] = useState(false);
// //   const [submitting, setSubmitting] = useState(false);
// //   const [errMsg, setErrMsg] = useState<string | null>(null);

// //   const resetLocal = () => {
// //     setErrMsg(null);
// //     setFront(null);
// //     setBack(null);
   
// //     setDocType(initialDocType);
// //     setStep(1);
// //     setStatus("NOT_SUBMITTED");
// //   };

// // useEffect(() => {
// //   if (!open) return;

// //   let t: any = null;
// //   let first = true;

// //   const poll = async () => {
// //     try {
// //       if (first) {
// //         setLoadingStatus(true);
// //         first = false;
// //       }

// //   const res = await fetch(`${apiBase}/api/kyc/status`, {
// //   headers: { Authorization: `Bearer ${token}` },
// //   credentials: "omit", // ✅ change this
// // });


// //       const data = await res.json().catch(() => ({}));
// //       const s = (data?.kycStatus || data?.status || "NOT_SUBMITTED") as KycStatus;

// //       setStatus(s);
// //       setStage(data?.kycStage || null);
// //       setCooldownUntil(data?.cooldownUntil || null);
// //       setReasonText(data?.kycReasonText || null);
// //        setExtractedName(data?.extractedName ?? null);
// // setMatchScore(typeof data?.matchScore === "number" ? data.matchScore : null);

// //       // docType update if backend sends country
// //       const c = String(data?.country || defaultCountry).toUpperCase();
// //       setDocType(c === "IN" ? "AADHAAR" : "PASSPORT");

// //       if (s === "VERIFIED") {
// //         onClose();
// //         onVerified?.();
// //         return;
// //       }

// //       if (s === "PENDING") {
// //         setStep(3);
// //         t = setTimeout(poll, 4000);
// //         return;
// //       }

// //       if (s === "REJECTED" || s === "FLAGGED") {
// //         setStep(3);
// //         return;
// //       }

// //       // NOT_SUBMITTED
// //       setStep(1);
// //     } catch (e: any) {
// //       setErrMsg("Could not load verification status.");
// //     } finally {
// //       setLoadingStatus(false);
// //     }
// //   };

// //   poll();
// //   return () => t && clearTimeout(t);
// // }, [open, token, apiBase, defaultCountry, pollTick]);


// //   // cleanup object URLs
// //   useEffect(() => {
// //     const u1 = filePreview(front);
// //     const u2 = filePreview(back);
   
// //     return () => {
// //       if (u1) URL.revokeObjectURL(u1);
// //       if (u2) URL.revokeObjectURL(u2);
      
// //     };
// //   }, [front, back]);

// //   if (!open) return null;

// // const submitDisabled = !front || !back || submitting;

// //   const submit = async () => {
// //     try {
// //       setSubmitting(true);
// //       setErrMsg(null);

// //       const fd = new FormData();
// //       fd.append("docType", docType);
// //       fd.append("front", front as File);
// //       fd.append("back", back as File);
   

// //       const res = await fetch(`${apiBase}/api/kyc/submit`, {
// //   method: "POST",
// //   headers: { Authorization: `Bearer ${token}` },
// //   credentials: "omit", // ✅ change this
// //   body: fd,
// // });


// //      const data = await res.json().catch(() => ({}));

// // if (res.status === 429 && data?.error === "COOLDOWN_ACTIVE") {
// //   setCooldownUntil(data?.cooldownUntil || null);
// //   throw new Error("Cooldown active. Try again after the shown time.");
// // }

// // if (!res.ok || !data?.success) {
// //   throw new Error(data?.error || "kyc_submit_failed");
// // }


// //       if (!res.ok || !data?.success) {
// //         throw new Error(data?.error || "kyc_submit_failed");
// //       }

// //     setStatus("VERIFIED");
// // setStep(3);
// // setPollTick((x) => x + 1); // optional

// //     } catch (e: any) {
// //       setErrMsg(e?.message || "Upload failed. Please try again.");
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //     const cooldownActive =
// //   !!cooldownUntil && new Date(cooldownUntil).getTime() > Date.now();



// //   return (
// //     // ✅ overlay can scroll on very small devices
// //     <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm overflow-y-auto">
// //       {/* ✅ centered wrapper with responsive padding */}
// //       <div className="min-h-full w-full flex items-start sm:items-center justify-center p-3 sm:p-6">
// //         <div
// //           // ✅ responsive width + reduced height + internal layout
// //           className="relative w-full max-w-[520px] rounded-[28px] overflow-hidden border border-white/10 shadow-2xl flex flex-col"
// //           style={{
// //             background:
// //               "radial-gradient(900px circle at 50% 0%, rgba(26,115,232,0.25), transparent 60%), linear-gradient(180deg,#070A12 0%, #07080A 100%)",
// //             maxHeight: "85vh", // ✅ reduced height
// //           }}
// //         >
// //           {/* Close */}
// //           <button
// //             onClick={() => {
// //               onClose();
// //               resetLocal();
// //             }}
// //             className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/70 hover:text-white"
// //             aria-label="Close"
// //           >
// //             ✕
// //           </button>

// //           {/* ✅ Header row (fixed, not scrolling) */}
// //           <div className="px-5 sm:px-8 pt-5 sm:pt-8 pb-4 shrink-0">
// //             <div className="flex items-center justify-between">
// //               <div className="text-white/60 tracking-[0.22em] text-xs font-semibold">
// //                 IDENTITY
// //               </div>

// //               {step !== 1 && (
// //                 <div className="text-white/60 text-xs">
// //                   STEP {step} OF 3
// //                 </div>
// //               )}
// //             </div>

// //             {/* Progress bar for steps 2/3 */}
// //             {step !== 1 && (
// //               <div className="mt-3">
// //                 <div className="h-[8px] rounded-full bg-white/10 overflow-hidden">
// //                   <div
// //                     className="h-full rounded-full"
// //                     style={{
// //                       width: step === 2 ? "66%" : "100%",
// //                       background: GRADIENT,
// //                     }}
// //                   />
// //                 </div>
// //                 <div className="mt-2 flex justify-between text-[12px] text-white/60">
// //                   <span>{step === 2 ? "66% Complete" : "100% Complete"}</span>
// //                   <span className="opacity-0">.</span>
// //                 </div>
// //               </div>
// //             )}
// //           </div>

// //           {/* ✅ Body scrolls inside modal */}
// //           <div className="flex-1 overflow-y-auto">
// //             {loadingStatus ? (
// //               <div className="px-5 sm:px-8 pb-6 sm:pb-8 text-white/70">Loading…</div>
// //             ) : (
// //               <>
// //                 {/* STEP 1 */}
// //                 {step === 1 && (
// //                   <div className="px-5 sm:px-8 pb-6 sm:pb-8">
// //                     {/* Icon tile (responsive + slightly smaller on mobile) */}
// //                     <div className="mt-1 mb-5 sm:mb-6 flex justify-center">
// //                       <div className="relative">
// //                         <div
// //                           className="w-[124px] h-[124px] sm:w-[148px] sm:h-[148px] rounded-[26px] grid place-items-center"
// //                           style={{
// //                             background:
// //                               "linear-gradient(180deg, rgba(46,108,246,1) 0%, rgba(18,74,170,1) 100%)",
// //                             boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
// //                           }}
// //                         >
// //                           <ShieldCheck className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
// //                         </div>
// //                         <div className="absolute -right-3 -bottom-3 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0B1512] grid place-items-center border-[5px] border-[#070A12]">
// //                           <div className="w-8 h-8 rounded-full bg-emerald-500 grid place-items-center">
// //                             <Lock className="w-4 h-4 text-white" />
// //                           </div>
// //                         </div>
// //                       </div>
// //                     </div>

// //                     <h2 className="text-white text-[30px] sm:text-[40px] leading-[1.05] font-extrabold text-center">
// //                       Verification Required
// //                     </h2>
// //                     <p className="mt-3 text-white/65 text-center leading-relaxed text-sm sm:text-base">
// //                       To access {requiredForLabel}, we need to confirm your identity.
// //                       This process is secure and encrypted.
// //                     </p>

// //                     {/* Locked feature cards */}
// //                     <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
// //                       <FeatureRow title="Buy & Bid" subtitle="Unlock high-value transactions" />
// //                       <FeatureRow title="Selling & Payouts" subtitle="List items and receive funds" />
// //                       <FeatureRow title="Premium Content" subtitle="Upload exclusive digital assets" />
// //                     </div>

// //                     <div className="mt-5 sm:mt-6 flex items-center justify-center gap-2 text-white/60 text-sm">
// //                       <Info className="w-4 h-4" />
// //                       <span>Takes less than 2 minutes</span>
// //                     </div>

// //                     <button
// //                       onClick={() => setStep(2)}
// //                       className="mt-5 sm:mt-6 w-full h-[50px] sm:h-[54px] rounded-[14px] text-white font-semibold"
// //                       style={{ background: GRADIENT }} // ✅ marketplace gradient
// //                     >
// //                       Start Verification
// //                     </button>

// //                     <button
// //                       onClick={() => {
// //                         onClose();
// //                         resetLocal();
// //                       }}
// //                       className="mt-3 sm:mt-4 w-full text-white/60 hover:text-white text-sm"
// //                     >
// //                       Maybe Later
// //                     </button>

// //                     {errMsg && (
// //                       <div className="mt-4 text-sm text-red-300 text-center">{errMsg}</div>
// //                     )}
// //                   </div>
// //                 )}

// //                 {/* STEP 2 */}
// //                 {step === 2 && (
// //                   <div className="px-5 sm:px-8 pb-6 sm:pb-8">
// //                     <h3 className="text-white text-[22px] sm:text-[28px] font-bold">
// //                       Upload Identity Documents
// //                     </h3>
// //                     <p className="mt-2 text-white/65 leading-relaxed text-sm sm:text-base">
// //                       We require a valid government-issued ID to verify your profile.
// //                     </p>

// //                     {/* Doc type tabs */}
// //                     <div className="mt-5 flex gap-3 bg-white/5 border border-white/10 rounded-[12px] p-1">
// //                       <TabBtn
// //                         active={docType === "AADHAAR"}
// //                         onClick={() => setDocType("AADHAAR")}
// //                         label="Aadhaar Card"
// //                       />
// //                       <TabBtn
// //                         active={docType === "PASSPORT"}
// //                         onClick={() => setDocType("PASSPORT")}
// //                         label="Passport"
// //                       />
// //                     </div>

// //                     {/* Upload blocks */}
// //                     <div className="mt-6 space-y-5">
// //                       <UploadBlock
// //                         label="Front of ID Card"
// //                         hint="Tap to upload or take photo"
// //                         icon={<UploadCloud className="w-5 h-5" />}
// //                         file={front}
// //                         onPick={(f) => setFront(f)}
// //                       />
// //                       <UploadBlock
// //                         label="Back of ID Card"
// //                         hint="Ensure address details are clear"
// //                         icon={<UploadCloud className="w-5 h-5" />}
// //                         file={back}
// //                         onPick={(f) => setBack(f)}
// //                       />
                      
// //                     </div>

// //                     {/* Guidelines */}
// //                     <div className="mt-6 rounded-[16px] border border-white/10 bg-white/5 p-4">
// //                       <div className="flex items-center gap-2 text-white font-semibold">
// //                         <Info className="w-4 h-4 text-sky-300" />
// //                         Quality Guidelines
// //                       </div>
// //                       <ul className="mt-3 space-y-2 text-white/65 text-sm list-disc pl-5">
// //                         <li>Original physical document only (no copies)</li>
// //                         <li>Avoid glare and bright reflections</li>
// //                         <li>All 4 corners must be visible in the frame</li>
// //                         <li>Text must be sharp and perfectly readable</li>
// //                       </ul>
// //                     </div>

// //                     <button
// //                       onClick={submit}
// //                       disabled={submitDisabled}
// //                       className={cn(
// //                         "mt-6 w-full h-[50px] sm:h-[54px] rounded-[14px] text-white font-semibold flex items-center justify-center gap-2",
// //                         submitDisabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-95"
// //                       )}
// //                       style={{ background: GRADIENT }} // ✅ marketplace gradient
// //                     >
// //                       {submitting ? "Submitting..." : "Submit for Review"}
// //                       <ShieldCheck className="w-4 h-4" />
// //                     </button>

// //                     {errMsg && (
// //                       <div className="mt-4 text-sm text-red-300 text-center">{errMsg}</div>
// //                     )}
// //                   </div>
// //                 )}

// //                 {/* STEP 3 */}
// //                 {step === 3 && (
// //                   <div className="px-5 sm:px-8 pb-7 sm:pb-10">
// //                     <div className="flex justify-center mt-2">
// //                       <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 grid place-items-center">
// //                         <div className="w-10 h-10 rounded-full bg-blue-500/20 grid place-items-center">
// //                           <ShieldCheck className="w-5 h-5 text-sky-300" />
// //                         </div>
// //                       </div>
// //                     </div>

// //                     <h3 className="mt-6 text-white text-[22px] sm:text-[28px] font-bold text-center">
// //                       Submitted for Review
// //                     </h3>

// //                     <p className="mt-2 text-white/65 text-center leading-relaxed text-sm sm:text-base">
// //                       Your verification is <b className="text-white">Pending</b>. We’ll notify you once it’s approved.
// //                     </p>
// // <div className="mt-6 rounded-[16px] border border-white/10 bg-white/5 p-4 text-white/70 text-sm">
// //   Status: <b className="text-white">{status}</b>
// //   {reasonText ? (
// //     <div className="mt-2 text-white/60">
// //       Reason: <b className="text-white">{reasonText}</b>
// //     </div>
// //   ) : null}



// //    {/* ✅ ADD HERE */}
// //   {extractedName ? (
// //     <div className="mt-2 text-white/60">
// //       Extracted: <b className="text-white">{extractedName}</b>
// //     </div>
// //   ) : null}

// //   {typeof matchScore === "number" ? (
// //     <div className="mt-2 text-white/60">
// //       Score: <b className="text-white">{matchScore}</b>
// //     </div>
// //   ) : null}
// //   {/* ✅ END */}
// //   {cooldownUntil ? (
// //     <div className="mt-2 text-white/60">
// //       Try again after: <b className="text-white">{new Date(cooldownUntil).toLocaleString()}</b>
// //     </div>
// //   ) : null}
// // </div>



// // {(status === "REJECTED" || status === "FLAGGED") && (
// //   <button
// //     disabled={cooldownActive}
// //     onClick={() => {
// //       setErrMsg(null);
// //       setFront(null);
// //       setBack(null);
// //       setStep(2); // ✅ go back to upload
// //     }}
// //     className={cn(
// //       "mt-4 w-full h-[50px] sm:h-[54px] rounded-[14px] text-white font-semibold",
// //       cooldownActive ? "opacity-50 cursor-not-allowed" : "hover:opacity-95"
// //     )}
// //     style={{ background: GRADIENT }}
// //   >
// //     Re-upload Documents
// //   </button>
// // )}


// //                     <button
// //                       onClick={() => {
// //                         onClose();
// //                         // keep step/status as-is; next open will load status again
// //                       }}
// //                       className="mt-6 w-full h-[50px] sm:h-[54px] rounded-[14px] text-white font-semibold"
// //                       style={{ background: GRADIENT }} // ✅ marketplace gradient
// //                     >
// //                       Done
// //                     </button>

// //                     {errMsg && (
// //                       <div className="mt-4 text-sm text-red-300 text-center">{errMsg}</div>
// //                     )}
// //                   </div>
// //                 )}
// //               </>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // function FeatureRow({ title, subtitle }: { title: string; subtitle: string }) {
// //   return (
// //     <div className="flex items-center gap-4 px-4 sm:px-5 py-3 sm:py-4 rounded-[18px] bg-white/5 border border-white/10">
// //       <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] bg-white/5 border border-white/10 grid place-items-center">
// //         <Lock className="w-5 h-5 text-white/70" />
// //       </div>
// //       <div className="flex-1">
// //         <div className="text-white font-semibold">{title}</div>
// //         <div className="text-white/60 text-sm">{subtitle}</div>
// //       </div>
// //       <Lock className="w-4 h-4 text-white/35" />
// //     </div>
// //   );
// // }

// // function TabBtn({
// //   active,
// //   onClick,
// //   label,
// // }: {
// //   active: boolean;
// //   onClick: () => void;
// //   label: string;
// // }) {
// //   return (
// //     <button
// //       onClick={onClick}
// //       className={cn(
// //         "flex-1 h-[40px] sm:h-[42px] rounded-[10px] text-sm font-semibold transition",
// //         active ? "text-white bg-white/10 border border-white/15" : "text-white/60 hover:text-white"
// //       )}
// //       type="button"
// //     >
// //       {label}
// //     </button>
// //   );
// // }

// // function UploadBlock({
// //   label,
// //   hint,
// //   icon,
// //   file,
// //   onPick,
// //   tall,
// // }: {
// //   label: string;
// //   hint: string;
// //   icon: React.ReactNode;
// //   file: File | null;
// //   onPick: (f: File | null) => void;
// //   tall?: boolean;
// // }) {
// //   const preview = file ? URL.createObjectURL(file) : null;

// //   useEffect(() => {
// //     return () => {
// //       if (preview) URL.revokeObjectURL(preview);
// //     };
// //   }, [preview]);

// //   return (
// //     <div>
// //       <div className="text-white/85 font-semibold mb-2">{label}</div>

// //       <label
// //         className={cn(
// //           "block w-full rounded-[18px] border border-white/10 bg-white/5 overflow-hidden cursor-pointer",
// //           // ✅ reduced heights + responsive
// //           tall ? "h-[140px] sm:h-[160px]" : "h-[96px] sm:h-[120px]"
// //         )}
// //       >
// //         <input
// //           type="file"
// //           accept="image/*"
// //           className="hidden"
// //           onChange={(e) => onPick(e.target.files?.[0] || null)}
// //         />

// //         {!file ? (
// //           <div className="h-full w-full grid place-items-center text-center px-4">
// //             <div className="w-12 h-12 rounded-full bg-blue-500/20 grid place-items-center text-sky-300">
// //               {icon}
// //             </div>
// //             <div className="mt-3 text-white/55 text-sm">{hint}</div>
// //           </div>
// //         ) : (
// //           <div className="relative h-full">
// //             <img src={preview || ""} className="w-full h-full object-cover" alt="preview" />
// //             <div className="absolute inset-0 bg-black/25" />
// //             <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
// //               <div className="text-white text-sm font-semibold truncate">{file.name}</div>
// //               <button
// //                 type="button"
// //                 onClick={(e) => {
// //                   e.preventDefault();
// //                   e.stopPropagation();
// //                   onPick(null);
// //                 }}
// //                 className="text-white/80 hover:text-white text-sm px-3 py-1 rounded-full bg-black/50"
// //               >
// //                 Remove
// //               </button>
// //             </div>
// //           </div>
// //         )}
// //       </label>
// //     </div>
// //   );
// // }


// import React, { useEffect, useMemo, useState } from "react";
// import { ShieldCheck, Lock, UploadCloud, Info } from "lucide-react";

// type KycStatus = "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED" | "FLAGGED";
// type DocType = "AADHAAR" | "PASSPORT";

// const GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

// function cn(...x: Array<string | false | null | undefined>) {
//   return x.filter(Boolean).join(" ");
// }

// type KycStatusResponse = {
//   success?: boolean;
//   status?: KycStatus;
//   kycStatus?: KycStatus;
//   kycStage?: string | null;
//   cooldownUntil?: string | null;
//   kycReasonText?: string | null;
//   extractedName?: string | null;
//   matchScore?: number | null;
//   country?: string | null;
// };

// export default function KycGateModal({
//   open,
//   onClose,
//   token,
//   apiBase,
//   defaultCountry = "IN",
//   onVerified,
//   requiredForLabel = "premium marketplace features",
// }: {
//   open: boolean;
//   onClose: () => void;
//   token: string;
//   apiBase: string;
//   defaultCountry?: string;
//   onVerified?: () => void;
//   requiredForLabel?: string;
// }) {
//   const initialDocType: DocType = useMemo(
//     () => (String(defaultCountry).toUpperCase() === "IN" ? "AADHAAR" : "PASSPORT"),
//     [defaultCountry]
//   );

//   const [step, setStep] = useState<1 | 2 | 3>(1);
//   const [status, setStatus] = useState<KycStatus>("NOT_SUBMITTED");

//   const [docType, setDocType] = useState<DocType>(initialDocType);
//   const [front, setFront] = useState<File | null>(null);
//   const [back, setBack] = useState<File | null>(null);

//   const [frontPreview, setFrontPreview] = useState<string | null>(null);
//   const [backPreview, setBackPreview] = useState<string | null>(null);

//   const [loadingStatus, setLoadingStatus] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [errMsg, setErrMsg] = useState<string | null>(null);

//   const [stage, setStage] = useState<string | null>(null);
//   const [cooldownUntil, setCooldownUntil] = useState<string | null>(null);
//   const [reasonText, setReasonText] = useState<string | null>(null);
//   const [extractedName, setExtractedName] = useState<string | null>(null);
//   const [matchScore, setMatchScore] = useState<number | null>(null);

//   const [pollTick, setPollTick] = useState(0);

//   const normalizedApiBase = useMemo(() => apiBase.replace(/\/$/, ""), [apiBase]);

//   const resetLocal = () => {
//     setErrMsg(null);
//     setFront(null);
//     setBack(null);
//     setDocType(initialDocType);
//     setStep(1);
//     setStatus("NOT_SUBMITTED");
//     setStage(null);
//     setCooldownUntil(null);
//     setReasonText(null);
//     setExtractedName(null);
//     setMatchScore(null);
//   };

//   useEffect(() => {
//     if (!front) {
//       setFrontPreview(null);
//       return;
//     }
//     const url = URL.createObjectURL(front);
//     setFrontPreview(url);
//     return () => URL.revokeObjectURL(url);
//   }, [front]);

//   useEffect(() => {
//     if (!back) {
//       setBackPreview(null);
//       return;
//     }
//     const url = URL.createObjectURL(back);
//     setBackPreview(url);
//     return () => URL.revokeObjectURL(url);
//   }, [back]);

//   useEffect(() => {
//     if (!open) return;

//     let cancelled = false;
//     let timeoutId: number | undefined;

//     const fetchStatus = async (isFirstLoad = false) => {
//       try {
//         if (isFirstLoad) setLoadingStatus(true);

//         const res = await fetch(`${normalizedApiBase}/api/kyc/status`, {
//           headers: { Authorization: `Bearer ${token}` },
//           credentials: "omit",
//         });

//         const data: KycStatusResponse = await res.json().catch(() => ({}));
//         if (cancelled) return;

//         const nextStatus = (data.kycStatus || data.status || "NOT_SUBMITTED") as KycStatus;

//         setStatus(nextStatus);
//         setStage(data.kycStage || null);
//         setCooldownUntil(data.cooldownUntil || null);
//         setReasonText(data.kycReasonText || null);
//         setExtractedName(data.extractedName ?? null);
//         setMatchScore(typeof data.matchScore === "number" ? data.matchScore : null);

//         const country = String(data.country || defaultCountry).toUpperCase();
//         setDocType(country === "IN" ? "AADHAAR" : "PASSPORT");

//         if (nextStatus === "VERIFIED") {
//           onClose();
//           onVerified?.();
//           return;
//         }

//         if (nextStatus === "PENDING") {
//           setStep(3);
//           timeoutId = window.setTimeout(() => fetchStatus(false), 4000);
//           return;
//         }

//         if (nextStatus === "REJECTED" || nextStatus === "FLAGGED") {
//           setStep(3);
//           return;
//         }

//         setStep(1);
//       } catch {
//         if (!cancelled) {
//           setErrMsg("Could not load verification status.");
//         }
//       } finally {
//         if (!cancelled) {
//           setLoadingStatus(false);
//         }
//       }
//     };

//     fetchStatus(true);

//     return () => {
//       cancelled = true;
//       if (timeoutId) window.clearTimeout(timeoutId);
//     };
//   }, [open, token, normalizedApiBase, defaultCountry, onClose, onVerified, pollTick]);

//   if (!open) return null;

//   const cooldownActive =
//     !!cooldownUntil && new Date(cooldownUntil).getTime() > Date.now();

//   const submitDisabled = !front || !back || submitting;

//   const submit = async () => {
//     if (!front || !back) return;

//     try {
//       setSubmitting(true);
//       setErrMsg(null);

//       const fd = new FormData();
//       fd.append("docType", docType);
//       fd.append("front", front);
//       fd.append("back", back);

//       const res = await fetch(`${normalizedApiBase}/api/kyc/submit`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         credentials: "omit",
//         body: fd,
//       });

//       const data = await res.json().catch(() => ({}));

//       if (res.status === 429 && data?.error === "COOLDOWN_ACTIVE") {
//         setCooldownUntil(data?.cooldownUntil || null);
//         throw new Error("Cooldown active. Try again after the shown time.");
//       }

//       if (!res.ok || !data?.success) {
//         throw new Error(data?.error || "kyc_submit_failed");
//       }

//       // Submit ke baad immediate verified mat maan lo
//       setStatus("PENDING");
//       setStep(3);
//       setPollTick((x) => x + 1);
//     } catch (e: any) {
//       setErrMsg(e?.message || "Upload failed. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleClose = () => {
//     onClose();
//     resetLocal();
//   };

//   return (
//     <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm overflow-y-auto">
//       <div className="min-h-full w-full flex items-start sm:items-center justify-center p-3 sm:p-6">
//         <div
//           className="relative w-full max-w-[520px] rounded-[28px] overflow-hidden border border-white/10 shadow-2xl flex flex-col"
//           style={{
//             background:
//               "radial-gradient(900px circle at 50% 0%, rgba(26,115,232,0.25), transparent 60%), linear-gradient(180deg,#070A12 0%, #07080A 100%)",
//             maxHeight: "85vh",
//           }}
//         >
//           <button
//             onClick={handleClose}
//             className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/70 hover:text-white"
//             aria-label="Close"
//           >
//             ✕
//           </button>

//           <div className="px-5 sm:px-8 pt-5 sm:pt-8 pb-4 shrink-0">
//             <div className="flex items-center justify-between">
//               <div className="text-white/60 tracking-[0.22em] text-xs font-semibold">
//                 IDENTITY
//               </div>

//               {step !== 1 && (
//                 <div className="text-white/60 text-xs">
//                   STEP {step} OF 3
//                 </div>
//               )}
//             </div>

//             {step !== 1 && (
//               <div className="mt-3">
//                 <div className="h-[8px] rounded-full bg-white/10 overflow-hidden">
//                   <div
//                     className="h-full rounded-full"
//                     style={{
//                       width: step === 2 ? "66%" : "100%",
//                       background: GRADIENT,
//                     }}
//                   />
//                 </div>
//                 <div className="mt-2 flex justify-between text-[12px] text-white/60">
//                   <span>{step === 2 ? "66% Complete" : "100% Complete"}</span>
//                   <span className="opacity-0">.</span>
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="flex-1 overflow-y-auto">
//             {loadingStatus ? (
//               <div className="px-5 sm:px-8 pb-6 sm:pb-8 text-white/70">Loading…</div>
//             ) : (
//               <>
//                 {step === 1 && (
//                   <div className="px-5 sm:px-8 pb-6 sm:pb-8">
//                     <div className="mt-1 mb-5 sm:mb-6 flex justify-center">
//                       <div className="relative">
//                         <div
//                           className="w-[124px] h-[124px] sm:w-[148px] sm:h-[148px] rounded-[26px] grid place-items-center"
//                           style={{
//                             background:
//                               "linear-gradient(180deg, rgba(46,108,246,1) 0%, rgba(18,74,170,1) 100%)",
//                             boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
//                           }}
//                         >
//                           <ShieldCheck className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
//                         </div>
//                         <div className="absolute -right-3 -bottom-3 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0B1512] grid place-items-center border-[5px] border-[#070A12]">
//                           <div className="w-8 h-8 rounded-full bg-emerald-500 grid place-items-center">
//                             <Lock className="w-4 h-4 text-white" />
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <h2 className="text-white text-[30px] sm:text-[40px] leading-[1.05] font-extrabold text-center">
//                       Verification Required
//                     </h2>

//                     <p className="mt-3 text-white/65 text-center leading-relaxed text-sm sm:text-base">
//                       To access {requiredForLabel}, we need to confirm your identity.
//                       This process is secure and encrypted.
//                     </p>

//                     <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
//                       <FeatureRow title="Buy & Bid" subtitle="Unlock high-value transactions" />
//                       <FeatureRow title="Selling & Payouts" subtitle="List items and receive funds" />
//                       <FeatureRow title="Premium Content" subtitle="Upload exclusive digital assets" />
//                     </div>

//                     <div className="mt-5 sm:mt-6 flex items-center justify-center gap-2 text-white/60 text-sm">
//                       <Info className="w-4 h-4" />
//                       <span>Takes less than 2 minutes</span>
//                     </div>

//                     <button
//                       onClick={() => setStep(2)}
//                       className="mt-5 sm:mt-6 w-full h-[50px] sm:h-[54px] rounded-[14px] text-white font-semibold"
//                       style={{ background: GRADIENT }}
//                     >
//                       Start Verification
//                     </button>

//                     <button
//                       onClick={handleClose}
//                       className="mt-3 sm:mt-4 w-full text-white/60 hover:text-white text-sm"
//                     >
//                       Maybe Later
//                     </button>

//                     {errMsg && (
//                       <div className="mt-4 text-sm text-red-300 text-center">{errMsg}</div>
//                     )}
//                   </div>
//                 )}

//                 {step === 2 && (
//                   <div className="px-5 sm:px-8 pb-6 sm:pb-8">
//                     <h3 className="text-white text-[22px] sm:text-[28px] font-bold">
//                       Upload Identity Documents
//                     </h3>

//                     <p className="mt-2 text-white/65 leading-relaxed text-sm sm:text-base">
//                       We require a valid government-issued ID to verify your profile.
//                     </p>

//                     <div className="mt-5 flex gap-3 bg-white/5 border border-white/10 rounded-[12px] p-1">
//                       <TabBtn
//                         active={docType === "AADHAAR"}
//                         onClick={() => setDocType("AADHAAR")}
//                         label="Aadhaar Card"
//                       />
//                       <TabBtn
//                         active={docType === "PASSPORT"}
//                         onClick={() => setDocType("PASSPORT")}
//                         label="Passport"
//                       />
//                     </div>

//                     <div className="mt-6 space-y-5">
//                       <UploadBlock
//                         label="Front of ID Card"
//                         hint="Tap to upload or take photo"
//                         file={front}
//                         preview={frontPreview}
//                         onPick={setFront}
//                       />

//                       <UploadBlock
//                         label="Back of ID Card"
//                         hint="Ensure address details are clear"
//                         file={back}
//                         preview={backPreview}
//                         onPick={setBack}
//                       />
//                     </div>

//                     <div className="mt-6 rounded-[16px] border border-white/10 bg-white/5 p-4">
//                       <div className="flex items-center gap-2 text-white font-semibold">
//                         <Info className="w-4 h-4 text-sky-300" />
//                         Quality Guidelines
//                       </div>
//                       <ul className="mt-3 space-y-2 text-white/65 text-sm list-disc pl-5">
//                         <li>Original physical document only (no copies)</li>
//                         <li>Avoid glare and bright reflections</li>
//                         <li>All 4 corners must be visible in the frame</li>
//                         <li>Text must be sharp and perfectly readable</li>
//                       </ul>
//                     </div>

//                     <button
//                       onClick={submit}
//                       disabled={submitDisabled}
//                       className={cn(
//                         "mt-6 w-full h-[50px] sm:h-[54px] rounded-[14px] text-white font-semibold flex items-center justify-center gap-2",
//                         submitDisabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-95"
//                       )}
//                       style={{ background: GRADIENT }}
//                     >
//                       {submitting ? "Submitting..." : "Submit for Review"}
//                       <ShieldCheck className="w-4 h-4" />
//                     </button>

//                     {errMsg && (
//                       <div className="mt-4 text-sm text-red-300 text-center">{errMsg}</div>
//                     )}
//                   </div>
//                 )}

//                 {step === 3 && (
//                   <div className="px-5 sm:px-8 pb-7 sm:pb-10">
//                     <div className="flex justify-center mt-2">
//                       <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 grid place-items-center">
//                         <div className="w-10 h-10 rounded-full bg-blue-500/20 grid place-items-center">
//                           <ShieldCheck className="w-5 h-5 text-sky-300" />
//                         </div>
//                       </div>
//                     </div>

//                     <h3 className="mt-6 text-white text-[22px] sm:text-[28px] font-bold text-center">
//                       {status === "VERIFIED"
//                         ? "Verification Complete"
//                         : status === "REJECTED" || status === "FLAGGED"
//                         ? "Verification Needs Attention"
//                         : "Submitted for Review"}
//                     </h3>

//                     <p className="mt-2 text-white/65 text-center leading-relaxed text-sm sm:text-base">
//                       {status === "VERIFIED" && (
//                         <>Your identity has been verified successfully.</>
//                       )}
//                       {status === "PENDING" && (
//                         <>
//                           Your verification is <b className="text-white">Pending</b>. We’ll notify you once it’s approved.
//                         </>
//                       )}
//                       {(status === "REJECTED" || status === "FLAGGED") && (
//                         <>
//                           Your submission needs another review. Please check the reason below and re-upload your documents.
//                         </>
//                       )}
//                     </p>

//                     <div className="mt-6 rounded-[16px] border border-white/10 bg-white/5 p-4 text-white/70 text-sm">
//                       <div>
//                         Status: <b className="text-white">{status}</b>
//                       </div>

//                       {stage ? (
//                         <div className="mt-2">
//                           Stage: <b className="text-white">{stage}</b>
//                         </div>
//                       ) : null}

//                       {reasonText ? (
//                         <div className="mt-2">
//                           Reason: <b className="text-white">{reasonText}</b>
//                         </div>
//                       ) : null}

//                       {extractedName ? (
//                         <div className="mt-2">
//                           Extracted: <b className="text-white">{extractedName}</b>
//                         </div>
//                       ) : null}

//                       {typeof matchScore === "number" ? (
//                         <div className="mt-2">
//                           Score: <b className="text-white">{matchScore}</b>
//                         </div>
//                       ) : null}

//                       {cooldownUntil ? (
//                         <div className="mt-2">
//                           Try again after:{" "}
//                           <b className="text-white">
//                             {new Date(cooldownUntil).toLocaleString()}
//                           </b>
//                         </div>
//                       ) : null}
//                     </div>

//                     {(status === "REJECTED" || status === "FLAGGED") && (
//                       <button
//                         disabled={cooldownActive}
//                         onClick={() => {
//                           setErrMsg(null);
//                           setFront(null);
//                           setBack(null);
//                           setStep(2);
//                         }}
//                         className={cn(
//                           "mt-4 w-full h-[50px] sm:h-[54px] rounded-[14px] text-white font-semibold",
//                           cooldownActive ? "opacity-50 cursor-not-allowed" : "hover:opacity-95"
//                         )}
//                         style={{ background: GRADIENT }}
//                       >
//                         Re-upload Documents
//                       </button>
//                     )}

//                     <button
//                       onClick={handleClose}
//                       className="mt-6 w-full h-[50px] sm:h-[54px] rounded-[14px] text-white font-semibold"
//                       style={{ background: GRADIENT }}
//                     >
//                       Done
//                     </button>

//                     {errMsg && (
//                       <div className="mt-4 text-sm text-red-300 text-center">{errMsg}</div>
//                     )}
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function FeatureRow({ title, subtitle }: { title: string; subtitle: string }) {
//   return (
//     <div className="flex items-center gap-4 px-4 sm:px-5 py-3 sm:py-4 rounded-[18px] bg-white/5 border border-white/10">
//       <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] bg-white/5 border border-white/10 grid place-items-center">
//         <Lock className="w-5 h-5 text-white/70" />
//       </div>
//       <div className="flex-1">
//         <div className="text-white font-semibold">{title}</div>
//         <div className="text-white/60 text-sm">{subtitle}</div>
//       </div>
//       <Lock className="w-4 h-4 text-white/35" />
//     </div>
//   );
// }

// function TabBtn({
//   active,
//   onClick,
//   label,
// }: {
//   active: boolean;
//   onClick: () => void;
//   label: string;
// }) {
//   return (
//     <button
//       onClick={onClick}
//       className={cn(
//         "flex-1 h-[40px] sm:h-[42px] rounded-[10px] text-sm font-semibold transition",
//         active ? "text-white bg-white/10 border border-white/15" : "text-white/60 hover:text-white"
//       )}
//       type="button"
//     >
//       {label}
//     </button>
//   );
// }

// function UploadBlock({
//   label,
//   hint,
//   file,
//   preview,
//   onPick,
// }: {
//   label: string;
//   hint: string;
//   file: File | null;
//   preview: string | null;
//   onPick: (f: File | null) => void;
// }) {
//   return (
//     <div>
//       <div className="text-white/85 font-semibold mb-2">{label}</div>

//       <label className="block w-full rounded-[18px] border border-white/10 bg-white/5 overflow-hidden cursor-pointer h-[96px] sm:h-[120px]">
//         <input
//           type="file"
//           accept="image/*"
//           className="hidden"
//           onChange={(e) => onPick(e.target.files?.[0] || null)}
//         />

//         {!file ? (
//           <div className="h-full w-full grid place-items-center text-center px-4">
//             <div className="w-12 h-12 rounded-full bg-blue-500/20 grid place-items-center text-sky-300">
//               <UploadCloud className="w-5 h-5" />
//             </div>
//             <div className="mt-3 text-white/55 text-sm">{hint}</div>
//           </div>
//         ) : (
//           <div className="relative h-full">
//             <img src={preview || ""} className="w-full h-full object-cover" alt="preview" />
//             <div className="absolute inset-0 bg-black/25" />
//             <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
//               <div className="text-white text-sm font-semibold truncate">{file.name}</div>
//               <button
//                 type="button"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   e.stopPropagation();
//                   onPick(null);
//                 }}
//                 className="text-white/80 hover:text-white text-sm px-3 py-1 rounded-full bg-black/50"
//               >
//                 Remove
//               </button>
//             </div>
//           </div>
//         )}
//       </label>
//     </div>
//   );
// }




import React, { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Lock, UploadCloud, Info } from "lucide-react";

type KycStatus = "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED" | "FLAGGED";
type DocType = "AADHAAR" | "PASSPORT";

const GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

function cn(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

type KycStatusResponse = {
  success?: boolean;
  status?: KycStatus;
  kycStatus?: KycStatus;
  kycStage?: string | null;
  cooldownUntil?: string | null;
  kycReasonText?: string | null;
  extractedName?: string | null;
  matchScore?: number | null;
  country?: string | null;
};

export default function KycGateModal({
  open,
  onClose,
  token,
  apiBase,
  defaultCountry = "IN",
  onVerified,
  requiredForLabel = "premium marketplace features",
}: {
  open: boolean;
  onClose: () => void;
  token: string;
  apiBase: string;
  defaultCountry?: string;
  onVerified?: () => void;
  requiredForLabel?: string;
}) {
  const initialDocType: DocType = useMemo(
    () => (String(defaultCountry).toUpperCase() === "IN" ? "AADHAAR" : "PASSPORT"),
    [defaultCountry]
  );

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [status, setStatus] = useState<KycStatus>("NOT_SUBMITTED");

  const [docType, setDocType] = useState<DocType>(initialDocType);
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);

  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const [loadingStatus, setLoadingStatus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [stage, setStage] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState<string | null>(null);
  const [extractedName, setExtractedName] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);

  const [pollTick, setPollTick] = useState(0);

  const normalizedApiBase = useMemo(() => apiBase.replace(/\/$/, ""), [apiBase]);

  const resetLocal = () => {
    setErrMsg(null);
    setFront(null);
    setBack(null);
    setDocType(initialDocType);
    setStep(1);
    setStatus("NOT_SUBMITTED");
    setStage(null);
    setCooldownUntil(null);
    setReasonText(null);
    setExtractedName(null);
    setMatchScore(null);
  };

  useEffect(() => {
    if (!front) {
      setFrontPreview(null);
      return;
    }
    const url = URL.createObjectURL(front);
    setFrontPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [front]);

  useEffect(() => {
    if (!back) {
      setBackPreview(null);
      return;
    }
    const url = URL.createObjectURL(back);
    setBackPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [back]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let timeoutId: number | undefined;

    const fetchStatus = async (isFirstLoad = false) => {
      try {
        if (isFirstLoad) setLoadingStatus(true);

        const res = await fetch(`${normalizedApiBase}/api/kyc/status`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "omit",
        });

        const data: KycStatusResponse = await res.json().catch(() => ({}));
        if (cancelled) return;

        const nextStatus = (data.kycStatus || data.status || "NOT_SUBMITTED") as KycStatus;

        setStatus(nextStatus);
        setStage(data.kycStage || null);
        setCooldownUntil(data.cooldownUntil || null);
        setReasonText(data.kycReasonText || null);
        setExtractedName(data.extractedName ?? null);
        setMatchScore(typeof data.matchScore === "number" ? data.matchScore : null);

        const country = String(data.country || defaultCountry).toUpperCase();
        setDocType(country === "IN" ? "AADHAAR" : "PASSPORT");

        if (nextStatus === "VERIFIED") {
          onClose();
          onVerified?.();
          return;
        }

        if (nextStatus === "PENDING") {
          setStep(3);
          timeoutId = window.setTimeout(() => fetchStatus(false), 4000);
          return;
        }

        if (nextStatus === "REJECTED" || nextStatus === "FLAGGED") {
          setStep(3);
          return;
        }

        setStep(1);
      } catch {
        if (!cancelled) {
          setErrMsg("Could not load verification status.");
        }
      } finally {
        if (!cancelled) {
          setLoadingStatus(false);
        }
      }
    };

    fetchStatus(true);

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [open, token, normalizedApiBase, defaultCountry, onClose, onVerified, pollTick]);

  if (!open) return null;

  const cooldownActive =
    !!cooldownUntil && new Date(cooldownUntil).getTime() > Date.now();

  const submitDisabled = !front || !back || submitting;

  const submit = async () => {
    if (!front || !back) return;

    try {
      setSubmitting(true);
      setErrMsg(null);

      const fd = new FormData();
      fd.append("docType", docType);
      fd.append("front", front);
      fd.append("back", back);

      const res = await fetch(`${normalizedApiBase}/api/kyc/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "omit",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429 && data?.error === "COOLDOWN_ACTIVE") {
        setCooldownUntil(data?.cooldownUntil || null);
        throw new Error("Cooldown active. Try again after the shown time.");
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "kyc_submit_failed");
      }

      setStatus("PENDING");
      setStep(3);
      setPollTick((x) => x + 1);
    } catch (e: any) {
      setErrMsg(e?.message || "Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    resetLocal();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm">
      <div className="h-full w-full flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div
          className="relative w-full max-w-[520px] rounded-[22px] sm:rounded-[28px] overflow-hidden border border-white/10 shadow-2xl flex flex-col"
          style={{
            background:
              "radial-gradient(900px circle at 50% 0%, rgba(26,115,232,0.25), transparent 60%), linear-gradient(180deg,#070A12 0%, #07080A 100%)",
            maxHeight: "min(88vh, 820px)",
          }}
        >
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/70 hover:text-white z-10 text-lg"
            aria-label="Close"
          >
            ✕
          </button>

          <div className="px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 pb-3 sm:pb-4 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div className="text-white/60 tracking-[0.18em] sm:tracking-[0.22em] text-[10px] sm:text-xs font-semibold">
                IDENTITY
              </div>

              {step !== 1 && (
                <div className="text-white/60 text-[10px] sm:text-xs whitespace-nowrap">
                  STEP {step} OF 3
                </div>
              )}
            </div>

            {step !== 1 && (
              <div className="mt-3">
                <div className="h-[7px] sm:h-[8px] rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: step === 2 ? "66%" : "100%",
                      background: GRADIENT,
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[11px] sm:text-[12px] text-white/60">
                  <span>{step === 2 ? "66% Complete" : "100% Complete"}</span>
                  <span className="opacity-0">.</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pb-5 sm:pb-6 md:pb-8">
            {loadingStatus ? (
              <div className="text-white/70 py-6 text-center">Loading…</div>
            ) : (
              <>
                {step === 1 && (
                  <div className="flex flex-col items-center text-center">
                    <div className="mt-1 mb-5 sm:mb-6 flex justify-center">
                      <div className="relative">
                        <div
                          className="w-[100px] h-[100px] xs:w-[112px] xs:h-[112px] sm:w-[132px] sm:h-[132px] md:w-[148px] md:h-[148px] rounded-[22px] sm:rounded-[26px] grid place-items-center"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(46,108,246,1) 0%, rgba(18,74,170,1) 100%)",
                            boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
                          }}
                        >
                          <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" />
                        </div>

                        <div className="absolute -right-2 -bottom-2 sm:-right-3 sm:-bottom-3 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-[#0B1512] grid place-items-center border-[4px] sm:border-[5px] border-[#070A12]">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 grid place-items-center">
                            <Lock className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <h2 className="text-white text-[26px] sm:text-[32px] md:text-[40px] leading-[1.05] font-extrabold">
                      Verification Required
                    </h2>

                    <p className="mt-3 text-white/65 leading-relaxed text-sm sm:text-base max-w-[420px]">
                      To access {requiredForLabel}, we need to confirm your identity.
                      This process is secure and encrypted.
                    </p>

                    <div className="mt-6 sm:mt-8 w-full space-y-3 sm:space-y-4">
                      <FeatureRow title="Buy & Bid" subtitle="Unlock high-value transactions" />
                      <FeatureRow title="Selling & Payouts" subtitle="List items and receive funds" />
                      <FeatureRow title="Premium Content" subtitle="Upload exclusive digital assets" />
                    </div>

                    <div className="mt-5 sm:mt-6 flex items-center justify-center gap-2 text-white/60 text-sm">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>Takes less than 2 minutes</span>
                    </div>

                    <button
                      onClick={() => setStep(2)}
                      className="mt-5 sm:mt-6 w-full h-[48px] sm:h-[52px] md:h-[54px] rounded-[12px] sm:rounded-[14px] text-white font-semibold"
                      style={{ background: GRADIENT }}
                    >
                      Start Verification
                    </button>

                    <button
                      onClick={handleClose}
                      className="mt-3 sm:mt-4 w-full text-white/60 hover:text-white text-sm"
                    >
                      Maybe Later
                    </button>

                    {errMsg && (
                      <div className="mt-4 text-sm text-red-300 text-center">{errMsg}</div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h3 className="text-white text-[20px] sm:text-[24px] md:text-[28px] font-bold text-center sm:text-left">
                      Upload Identity Documents
                    </h3>

                    <p className="mt-2 text-white/65 leading-relaxed text-sm sm:text-base text-center sm:text-left">
                      We require a valid government-issued ID to verify your profile.
                    </p>

                    <div className="mt-5 flex gap-2 sm:gap-3 bg-white/5 border border-white/10 rounded-[12px] p-1">
                      <TabBtn
                        active={docType === "AADHAAR"}
                        onClick={() => setDocType("AADHAAR")}
                        label="Aadhaar Card"
                      />
                      <TabBtn
                        active={docType === "PASSPORT"}
                        onClick={() => setDocType("PASSPORT")}
                        label="Passport"
                      />
                    </div>

                    <div className="mt-6 space-y-4 sm:space-y-5">
                      <UploadBlock
                        label="Front of ID Card"
                        hint="Tap to upload or take photo"
                        file={front}
                        preview={frontPreview}
                        onPick={setFront}
                      />

                      <UploadBlock
                        label="Back of ID Card"
                        hint="Ensure address details are clear"
                        file={back}
                        preview={backPreview}
                        onPick={setBack}
                      />
                    </div>

                    <div className="mt-6 rounded-[14px] sm:rounded-[16px] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
                        <Info className="w-4 h-4 text-sky-300 shrink-0" />
                        Quality Guidelines
                      </div>
                      <ul className="mt-3 space-y-2 text-white/65 text-sm list-disc pl-5">
                        <li>Original physical document only (no copies)</li>
                        <li>Avoid glare and bright reflections</li>
                        <li>All 4 corners must be visible in the frame</li>
                        <li>Text must be sharp and perfectly readable</li>
                      </ul>
                    </div>

                    <button
                      onClick={submit}
                      disabled={submitDisabled}
                      className={cn(
                        "mt-6 w-full h-[48px] sm:h-[52px] md:h-[54px] rounded-[12px] sm:rounded-[14px] text-white font-semibold flex items-center justify-center gap-2",
                        submitDisabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-95"
                      )}
                      style={{ background: GRADIENT }}
                    >
                      {submitting ? "Submitting..." : "Submit for Review"}
                      <ShieldCheck className="w-4 h-4" />
                    </button>

                    {errMsg && (
                      <div className="mt-4 text-sm text-red-300 text-center">{errMsg}</div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="text-center">
                    <div className="flex justify-center mt-2">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-white/10 grid place-items-center">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500/20 grid place-items-center">
                          <ShieldCheck className="w-5 h-5 text-sky-300" />
                        </div>
                      </div>
                    </div>

                    <h3 className="mt-6 text-white text-[20px] sm:text-[24px] md:text-[28px] font-bold">
                      {status === "VERIFIED"
                        ? "Verification Complete"
                        : status === "REJECTED" || status === "FLAGGED"
                        ? "Verification Needs Attention"
                        : "Submitted for Review"}
                    </h3>

                    <p className="mt-2 text-white/65 leading-relaxed text-sm sm:text-base max-w-[420px] mx-auto">
                      {status === "VERIFIED" && (
                        <>Your identity has been verified successfully.</>
                      )}
                      {status === "PENDING" && (
                        <>
                          Your verification is <b className="text-white">Pending</b>. We’ll notify you once it’s approved.
                        </>
                      )}
                      {(status === "REJECTED" || status === "FLAGGED") && (
                        <>
                          Your submission needs another review. Please check the reason below and re-upload your documents.
                        </>
                      )}
                    </p>

                    <div className="mt-6 rounded-[14px] sm:rounded-[16px] border border-white/10 bg-white/5 p-4 text-white/70 text-sm text-left">
                      <div>
                        Status: <b className="text-white">{status}</b>
                      </div>

                      {stage ? (
                        <div className="mt-2">
                          Stage: <b className="text-white">{stage}</b>
                        </div>
                      ) : null}

                      {reasonText ? (
                        <div className="mt-2">
                          Reason: <b className="text-white">{reasonText}</b>
                        </div>
                      ) : null}

                      {extractedName ? (
                        <div className="mt-2">
                          Extracted: <b className="text-white">{extractedName}</b>
                        </div>
                      ) : null}

                      {typeof matchScore === "number" ? (
                        <div className="mt-2">
                          Score: <b className="text-white">{matchScore}</b>
                        </div>
                      ) : null}

                      {cooldownUntil ? (
                        <div className="mt-2">
                          Try again after:{" "}
                          <b className="text-white">
                            {new Date(cooldownUntil).toLocaleString()}
                          </b>
                        </div>
                      ) : null}
                    </div>

                    {(status === "REJECTED" || status === "FLAGGED") && (
                      <button
                        disabled={cooldownActive}
                        onClick={() => {
                          setErrMsg(null);
                          setFront(null);
                          setBack(null);
                          setStep(2);
                        }}
                        className={cn(
                          "mt-4 w-full h-[48px] sm:h-[52px] md:h-[54px] rounded-[12px] sm:rounded-[14px] text-white font-semibold",
                          cooldownActive ? "opacity-50 cursor-not-allowed" : "hover:opacity-95"
                        )}
                        style={{ background: GRADIENT }}
                      >
                        Re-upload Documents
                      </button>
                    )}

                    <button
                      onClick={handleClose}
                      className="mt-6 w-full h-[48px] sm:h-[52px] md:h-[54px] rounded-[12px] sm:rounded-[14px] text-white font-semibold"
                      style={{ background: GRADIENT }}
                    >
                      Done
                    </button>

                    {errMsg && (
                      <div className="mt-4 text-sm text-red-300 text-center">{errMsg}</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 rounded-[16px] sm:rounded-[18px] bg-white/5 border border-white/10 text-left">
      <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-[12px] sm:rounded-[14px] bg-white/5 border border-white/10 grid place-items-center shrink-0">
        <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white font-semibold text-sm sm:text-base truncate">{title}</div>
        <div className="text-white/60 text-xs sm:text-sm leading-relaxed">{subtitle}</div>
      </div>
      <Lock className="w-4 h-4 text-white/35 shrink-0" />
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 h-[38px] sm:h-[42px] rounded-[10px] text-xs sm:text-sm font-semibold transition px-2",
        active ? "text-white bg-white/10 border border-white/15" : "text-white/60 hover:text-white"
      )}
      type="button"
    >
      <span className="truncate block">{label}</span>
    </button>
  );
}

function UploadBlock({
  label,
  hint,
  file,
  preview,
  onPick,
}: {
  label: string;
  hint: string;
  file: File | null;
  preview: string | null;
  onPick: (f: File | null) => void;
}) {
  return (
    <div>
      <div className="text-white/85 font-semibold mb-2 text-sm sm:text-base">{label}</div>

      <label className="block w-full rounded-[16px] sm:rounded-[18px] border border-white/10 bg-white/5 overflow-hidden cursor-pointer h-[96px] sm:h-[110px] md:h-[120px]">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] || null)}
        />

        {!file ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500/20 grid place-items-center text-sky-300">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="mt-2 sm:mt-3 text-white/55 text-xs sm:text-sm leading-relaxed">
              {hint}
            </div>
          </div>
        ) : (
          <div className="relative h-full">
            <img src={preview || ""} className="w-full h-full object-cover" alt="preview" />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between gap-2">
              <div className="text-white text-xs sm:text-sm font-semibold truncate">{file.name}</div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPick(null);
                }}
                className="text-white/80 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full bg-black/50 shrink-0"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </label>
    </div>
  );
}