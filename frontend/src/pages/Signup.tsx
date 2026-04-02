// // import { useState } from "react";
// // import { Link, useNavigate } from "react-router-dom";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { useAuth } from "@/contexts/AuthContext";
// // import { toast } from "@/components/ui/use-toast";
// // import { ChevronLeft, User, Briefcase } from "lucide-react"; // Added icons

// // const Signup = () => {
// //   const [name, setName] = useState("");
// //   const [email, setEmail] = useState("");
// //   const [companyName, setCompanyName] = useState(""); // For Organization
// //   const [businessEmail, setBusinessEmail] = useState(""); // For Organization
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [isIndividual, setIsIndividual] = useState(true); // Toggle state for Individual / Organization
// //   const { signup } = useAuth(); 
// //   const navigate = useNavigate();

// //   const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";




// //   //signup integration 
// // const handleSubmit = async (e: React.FormEvent) => {
// //   e.preventDefault();

// //   if (isIndividual && (!name || !email)) {
// //     toast({
// //       title: "Missing details",
// //       description: "Please enter your full name and email.",
// //       variant: "destructive",
// //     });
// //     return;
// //   }

// //   if (!isIndividual && (!companyName || !businessEmail)) {
// //     toast({
// //       title: "Missing details",
// //       description: "Please enter your company name and business email.",
// //       variant: "destructive",
// //     });
// //     return;
// //   }

// //   setIsLoading(true);
// //   try {
// //     // Build request body according to backend spec
// //     const body = isIndividual
// //       ? {
// //           name,               // full name of individual
// //           email,              // individual email
// //           userType: "IND",    // userType must be IND
// //           orgName: null,      // no orgName for IND
// //         }
// //       : {
// //           name: companyName,        // backend expects "name" → use companyName
// //           email: businessEmail,     // business email
// //           userType: "ORG",          // org flow
// //           orgName: companyName,     // backend expects orgName too
// //         };

// //     const res = await fetch(`${API_BASE}/api/auth/signup/initiate`, {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify(body),
// //     });

// //     const data = await res.json();
// //      console.log("data is " , data)
// //     if (!res.ok || !data?.success) {
// //       throw new Error(data?.error || "Could not send OTP. Please try again.");
// //     }



// //     toast({
// //       title: "OTP sent",
// //       description: "We emailed you a 4-digit code. Enter it to finish signup.",
// //     });

// //     // Navigate to verify page with proper query params
// //   navigate(`/verify-signup?email=${encodeURIComponent(body.email)}&name=${encodeURIComponent(body.name)}`);

// //   } catch (err: any) {
// //     toast({
// //       title: "Signup failed",
// //       description: err?.message || "Unexpected error. Please try again.",
// //       variant: "destructive",
// //     });
// //   } finally {
// //     setIsLoading(false);
// //   }
// // };


// //   return (
// //     <div className="min-h-screen w-full bg-[#030406] text-white flex font-inter">
// //       <aside className="hidden lg:block basis-[60%] relative" aria-hidden>
// //         <img src="/icons/signup.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
// //       </aside>

// //       <main className="flex-1 lg:basis-[40%] min-h-screen flex items-center justify-center px-5 sm:px-8 md:px-10">
// //         <div className="w-full max-w-[520px]">
// //           {/* Back Button */}
// //           <div className="mb-6">
// //             <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white">
// //               <ChevronLeft className="h-4 w-4" />
// //               Back
// //             </Link>
// //           </div>

// //           {/* Header Section */}
// //           <h1 className="text-[36px] leading-[1] font-normal text-[#FFFFFF]">
// //             Create Account
// //           </h1>
// //           <p className="mt-2 text-[20px] leading-[1] tracking-[0] font-normal text-white">
// //             Already have an account?{" "}
// //             <Link to="/login" className="font-medium text-[20px] leading-[1] tracking-[0] text-[#1EAEDB] hover:underline">
// //               Sign In
// //             </Link>
// //           </p>

// //           {/* Pill Toggle for Individual / Organization */}
          

// //           {/* Social Row */}
// //           <div className="mt-6 flex items-center gap-10">
// //             {[ 
// //               { src: "/icons/go.png", alt: "Google" },
// //               { src: "/icons/microsoft.png", alt: "Microsoft" },
// //               { src: "/icons/facebook.png", alt: "Facebook" },
// //               { src: "/icons/apple.png", alt: "Apple" }
// //             ].map((p) => (
// //               <button
// //                 key={p.alt}
// //                 type="button"
// //                 className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm hover:opacity-90 transition"
// //                 aria-label={`Continue with ${p.alt}`}
// //               >
// //                 <img src={p.src} alt="" className="h-6 w-6" />
// //               </button>
// //             ))}
// //           </div>
// // <div className="my-6 flex items-center gap-4"> <div className="h-px flex-1 bg-[#282C42]" /> <div className="h-[30px] w-[30px] rounded-full border border-[#282C42] text-[#FFFFFF] text-[12px] flex items-center justify-center"> OR </div> <div className="h-px flex-1 bg-[#282C42]" /> </div>
            
// // {/* pill */}



// //           {/* Form */}
// //           <form onSubmit={handleSubmit} className="space-y-6">
// //             <div className="mt-6 flex gap-4">
// //             <button
// //               onClick={() => setIsIndividual(true)}
// //               className={`${
// //                 isIndividual ? "bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3]" : "bg-[#17171A]"
// //               } w-[169px] h-[40px] rounded-full text-white flex items-center justify-center gap-5 transition`}
// //               style={{
// //                 paddingTop: "10.5px",
// //                 paddingRight: "14px",
// //                 paddingBottom: "10.5px",
// //                 paddingLeft: "14px",
// //                 opacity: 1,
// //               }}
// //             >
// //               <User className="h-5 w-5" />
// //               Individual
// //             </button>
// //             <button
// //               onClick={() => setIsIndividual(false)}
// //               className={`${
// //                 !isIndividual ? "bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3]" : "bg-[#17171A]"
// //               } w-[169px] h-[40px] rounded-full text-white flex items-center justify-center gap-5 transition`}
// //               style={{
// //                 paddingTop: "10.5px",
// //                 paddingRight: "14px",
// //                 paddingBottom: "10.5px",
// //                 paddingLeft: "14px",
// //                 opacity: 1,
// //               }}
// //             >
// //               <Briefcase className="h-5 w-5" />
// //               Organization
// //             </button>
// //           </div>




// //             {isIndividual ? (
// //               <>
// //                 <div className="space-y-2">
// //                   <label htmlFor="name" className="text-sm text-white/80">Full Name</label>
// //                   <Input
// //                     id="name"
// //                     type="text"
// //                     value={name}
// //                     onChange={(e) => setName(e.target.value)}
// //                     required
// //                     className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white focus-visible:ring-0 focus-visible:outline-none focus:border-[#7D4DFF]/60"
// //                   />
// //                 </div>

// //                 <div className="space-y-2">
// //                   <label htmlFor="email" className="text-sm text-white/80">Email</label>
// //                   <Input
// //                     id="email"
// //                     type="email"
// //                     value={email}
// //                     onChange={(e) => setEmail(e.target.value)}
// //                     required
// //                     className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white focus-visible:ring-0 focus-visible:outline-none focus:border-[#7D4DFF]/60"
// //                   />
// //                 </div>
// //               </>
// //             ) : (
// //               <>
// //                 <div className="space-y-2">
// //                   <label htmlFor="companyName" className="text-sm text-white/80">Company Name</label>
// //                   <Input
// //                     id="companyName"
// //                     type="text"
// //                     value={companyName}
// //                     onChange={(e) => setCompanyName(e.target.value)}
// //                     required
// //                     className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white focus-visible:ring-0 focus-visible:outline-none focus:border-[#7D4DFF]/60"
// //                   />
// //                 </div>

// //                 <div className="space-y-2">
// //                   <label htmlFor="businessEmail" className="text-sm text-white/80">Business Email</label>
// //                   <Input
// //                     id="businessEmail"
// //                     type="email"
// //                     value={businessEmail}
// //                     onChange={(e) => setBusinessEmail(e.target.value)}
// //                     required
// //                     className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white focus-visible:ring-0 focus-visible:outline-none focus:border-[#7D4DFF]/60"
// //                   />
// //                 </div>
// //               </>
// //             )}

// //             <Button
// //               type="submit"
// //               className="w-full md:w-[350px] h-[50px] rounded-[6px] text-[16px] font-normal text-[#FFFFFF] text-center bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3] hover:opacity-90"
// //             >
// //               {isLoading ? "Creating..." : "Continue"}
// //             </Button>
// //           </form>

// //           <p className="mt-6 text-[16px] font-normal text-[#FFFFFF]">
// //             Having trouble logging in? Contact us at{" "}
// //             <a href="mailto:support@tokun.ai" className="text-transparent bg-clip-text bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3] underline underline-offset-4">
// //               support@tokun.ai
// //             </a>
// //           </p>
// //         </div>
// //       </main>
// //     </div>
// //   );
// // };

// // export default Signup;




// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useAuth } from "@/contexts/AuthContext";
// import { toast } from "@/components/ui/use-toast";
// import { ChevronLeft, User, Briefcase } from "lucide-react";

// const Signup = () => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [companyName, setCompanyName] = useState("");
//   const [businessEmail, setBusinessEmail] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isIndividual, setIsIndividual] = useState(true);
//   const { signup } = useAuth(); // keep if you use elsewhere
//   const navigate = useNavigate();

//   const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
//   console.log("[ENV] API_BASE =", API_BASE);

//   // signup integration
//   // const handleSubmit = async (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   if (isLoading) return;

//   //   // normalize inputs
//   //   const nameTrim = name.trim();
//   //   const emailNorm = email.trim().toLowerCase();
//   //   const companyTrim = companyName.trim();
//   //   const businessNorm = businessEmail.trim().toLowerCase();

//   //   if (isIndividual && (!nameTrim || !emailNorm)) {
//   //     toast({
//   //       title: "Missing details",
//   //       description: "Please enter your full name and email.",
//   //       variant: "destructive",
//   //     });
//   //     return;
//   //   }

//   //   if (!isIndividual && (!companyTrim || !businessNorm)) {
//   //     toast({
//   //       title: "Missing details",
//   //       description: "Please enter your company name and business email.",
//   //       variant: "destructive",
//   //     });
//   //     return;
//   //   }

//   //   setIsLoading(true);
//   //   try {
//   //     const body = isIndividual
//   //       ? {
//   //           name: nameTrim,
//   //           email: emailNorm,
//   //           userType: "IND",
//   //           orgName: null,
//   //         }
//   //       : {
//   //           name: companyTrim,      // backend expects "name" → company name for ORG
//   //           email: businessNorm,    // business email
//   //           userType: "ORG",
//   //           orgName: companyTrim,   // backend expects orgName too
//   //         };

//   //     const url = `${API_BASE}/api/auth/signup/initiate`;
//   //     console.log("[SIGNUP] Flow =", isIndividual ? "IND" : "ORG");
//   //     console.log("[SIGNUP] POST", url);
//   //     console.log("[SIGNUP] Body →", body);

//   //     const res = await fetch(url, {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify(body),
//   //     });

//   //     const data = await res.json();
//   //     console.log("[SIGNUP] Response", res.status, data);

//   //     if (!res.ok || !data?.success) {
//   //       throw new Error(data?.error || "Could not send OTP. Please try again.");
//   //     }

//   //     toast({
//   //       title: "OTP sent",
//   //       description: "We emailed you a 4-digit code. Enter it to finish signup.",
//   //     });

//   //     const navEmail = isIndividual ? emailNorm : businessNorm;
//   //     const navName = isIndividual ? nameTrim : companyTrim;
//   //     const navTo = `/verify-signup?email=${encodeURIComponent(navEmail)}&name=${encodeURIComponent(navName)}`;
//   //     console.log("[SIGNUP] Navigate →", navTo);
//   //     navigate(navTo);
//   //   } catch (err: any) {
//   //     console.error("[SIGNUP] Error", err);
//   //     toast({
//   //       title: "Signup failed",
//   //       description: err?.message || "Unexpected error. Please try again.",
//   //       variant: "destructive",
//   //     });
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };



// //   const handleSubmit = async (e: React.FormEvent) => {
// //   e.preventDefault();
// //   if (isLoading) return;

// //   // normalize inputs
// //   const nameTrim = name.trim();
// //   const emailNorm = email.trim().toLowerCase();
// //   const companyTrim = companyName.trim();
// //   const businessNorm = businessEmail.trim().toLowerCase();

// //   if (isIndividual && (!nameTrim || !emailNorm)) {
// //     toast({
// //       title: "Missing details",
// //       description: "Please enter your full name and email.",
// //       variant: "destructive",
// //     });
// //     return;
// //   }

// //   if (!isIndividual && (!companyTrim || !businessNorm)) {
// //     toast({
// //       title: "Missing details",
// //       description: "Please enter your company name and business email.",
// //       variant: "destructive",
// //     });
// //     return;
// //   }

// //   setIsLoading(true);
// //   const body = isIndividual
// //     ? { name: nameTrim, email: emailNorm, userType: "IND", orgName: null }
// //     : { name: companyTrim, email: businessNorm, userType: "ORG", orgName: companyTrim };

// //   const url = `${API_BASE}/api/auth/signup/initiate`;

// //   console.groupCollapsed("%c[SIGNUP] → initiate", "color:#8ab4f8");
// //   console.log("POST", url);
// //   console.log("Request body:", body);

// //   try {
// //     const res = await fetch(url, {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify(body),
// //     });

// //     const data = await res.json();
// //     console.log("Status:", res.status);
// //     console.log("Response JSON:", data);

// //     if (!res.ok || !data?.success) {
// //       throw new Error(data?.error || "Could not send OTP. Please try again.");
// //     }

// //     // Show OTP in dev to verify end-to-end
// //     if (data.otp) {
// //       console.log("%c[DEV ONLY] OTP:", "color:#34d399;font-weight:bold", data.otp);
// //     }

// //     toast({
// //       title: "OTP sent",
// //       description: "We emailed you a 4-digit code. Enter it to finish signup.",
// //     });

// //     const navEmail = isIndividual ? emailNorm : businessNorm;
// //     const navName = isIndividual ? nameTrim : companyTrim;
// //     const navTo = `/verify-signup?email=${encodeURIComponent(navEmail)}&name=${encodeURIComponent(navName)}`;
// //     console.log("Navigate →", navTo);
// //     console.groupEnd();

// //     navigate(navTo);
// //   } catch (err: any) {
// //     console.error("[SIGNUP] Error:", err);
// //     toast({
// //       title: "Signup failed",
// //       description: err?.message || "Unexpected error. Please try again.",
// //       variant: "destructive",
// //     });
// //     console.groupEnd();
// //   } finally {
// //     setIsLoading(false);
// //   }
// // };

// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   if (isLoading) return;

//   const nameTrim = name.trim();
//   const emailNorm = email.trim().toLowerCase();
//   const companyTrim = companyName.trim();
//   const businessNorm = businessEmail.trim().toLowerCase();

//   if (isIndividual && (!nameTrim || !emailNorm)) {
//     toast({ title: "Missing details", description: "Please enter your full name and email.", variant: "destructive" });
//     return;
//   }
//   if (!isIndividual && (!companyTrim || !businessNorm)) {
//     toast({ title: "Missing details", description: "Please enter your company name and business email.", variant: "destructive" });
//     return;
//   }

//   setIsLoading(true);

//   const body = isIndividual
//     ? { name: nameTrim, email: emailNorm, userType: "IND", orgName: null }
//     : { name: companyTrim, email: businessNorm, userType: "ORG", orgName: companyTrim };

//   const url = `${API_BASE}/api/auth/signup/initiate`;
//   const debug = localStorage.getItem("DEBUG_HTTP") === "1";
//   const t0 = performance.now();

//   console.groupCollapsed("%c[SIGNUP] → initiate", "color:#8ab4f8");
//   console.log("POST", url);
//   console.log("Request body:", body);

//   try {
//     const res = await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//       credentials: "include",
//     });

//     const raw = await res.text(); // read raw first (useful if server returns HTML on errors)
//     let data: any = {};
//     try { data = JSON.parse(raw); } catch { /* non-JSON response */ }

//     const t1 = performance.now();

//     console.log("Status:", res.status, res.ok ? "(OK)" : "(ERR)");
//     if (debug) {
//       console.log("Raw response:", raw);
//       console.log("Parsed JSON:", data);
//       console.log(`Network time: ${(t1 - t0).toFixed(1)} ms`);
//       console.log("x-request-id:", res.headers.get("x-request-id"));
//     } else {
//       console.log("Parsed JSON:", data);
//     }

//     if (!res.ok || !data?.success) {
//       throw new Error(data?.error || "Could not send OTP. Please try again.");
//     }

//     // Dev helper: show OTP in console & toast if present
//     if (data.otp) {
//       console.log("%c[DEV ONLY] OTP:", "color:#34d399;font-weight:bold", data.otp);
//       toast({ title: "Dev OTP", description: `Code: ${data.otp}` });
//     }

//     toast({
//       title: "OTP sent",
//       description: isIndividual
//         ? "We emailed you a 4-digit code. Enter it to finish signup."
//         : "We emailed your business email a 4-digit code. Enter it to create your organization.",
//     });

//     // Build navigation params
//     const navEmail = isIndividual ? emailNorm : businessNorm;
//     const navName  = isIndividual ? nameTrim : companyTrim;
//     const navType  = isIndividual ? "IND" : "ORG";
//     const q = new URLSearchParams({
//       email: navEmail,
//       name: navName,
//       userType: navType,
//       ...(navType === "ORG" ? { orgName: companyTrim } : {}),
//     }).toString();

//     // If backend told us the next step, carry it forward too
//     if (data.next) {
//       console.log("Next step:", data.next);
//     }

//     const navTo = `/verify-signup?${q}`;
//     console.log("Navigate →", navTo);
//     console.groupEnd();
//       // If ORG → mark that subscription popup must show later
// if (!isIndividual) {
//   localStorage.setItem("SHOW_SUB_POPUP", "1");
// }

//     navigate(navTo);
//   } catch (err: any) {
//     console.error("[SIGNUP] Error:", err);
//     toast({
//       title: "Signup failed",
//       description: err?.message || "Unexpected error. Please try again.",
//       variant: "destructive",
//     });
//     console.groupEnd();
//   } finally {
//     setIsLoading(false);
//   }
// };

//   return (
//     <div className="min-h-screen w-full bg-[#030406] text-white flex font-inter">
//       <aside className="hidden lg:block basis-[60%] relative" aria-hidden>
//         <img src="/icons/signup.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
//       </aside>

//       <main className="flex-1 lg:basis-[40%] min-h-screen flex items-center justify-center px-5 sm:px-8 md:px-10">
//         <div className="w-full max-w-[520px]">
//           {/* Back Button */}
//           <div className="mb-6">
//             <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white">
//               <ChevronLeft className="h-4 w-4" />
//               Back
//             </Link>
//           </div>

//           {/* Header Section */}
//           <h1 className="text-[36px] leading-[1] font-normal text-[#FFFFFF]">Create Account</h1>
//           <p className="mt-2 text-[20px] leading-[1] tracking-[0] font-normal text-white">
//             Already have an account?{" "}
//             <Link to="/login" className="font-medium text-[20px] leading-[1] tracking-[0] text-[#1EAEDB] hover:underline">
//               Sign In
//             </Link>
//           </p>

//           {/* Social Row */}
      

//           <div className="my-6 flex items-center gap-4">
//             <div className="h-px flex-1 bg-[#282C42]" />
//             <div className="h-[30px] w-[30px] rounded-full border border-[#282C42] text-[#FFFFFF] text-[12px] flex items-center justify-center">
//               OR
//             </div>
//             <div className="h-px flex-1 bg-[#282C42]" />
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Pill Toggle (now non-submitting) */}
//             <div className="mt-6 flex gap-4">
//               <button
//                 type="button" /* important: avoid accidental submit */
//                 onClick={() => setIsIndividual(true)}
//                 aria-pressed={isIndividual}
//                 className={`${isIndividual ? "bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3]" : "bg-[#17171A]"} w-[169px] h-[40px] rounded-full text-white flex items-center justify-center gap-5 transition`}
//                 style={{ paddingTop: "10.5px", paddingRight: "14px", paddingBottom: "10.5px", paddingLeft: "14px", opacity: 1 }}
//               >
//                 <User className="h-5 w-5" />
//                 Individual
//               </button>
//               <button
//                 type="button" /* important: avoid accidental submit */
//                 onClick={() => setIsIndividual(false)}
//                 aria-pressed={!isIndividual}
//                 className={`${!isIndividual ? "bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3]" : "bg-[#17171A]"} w-[169px] h-[40px] rounded-full text-white flex items-center justify-center gap-5 transition`}
//                 style={{ paddingTop: "10.5px", paddingRight: "14px", paddingBottom: "10.5px", paddingLeft: "14px", opacity: 1 }}
//               >
//                 <Briefcase className="h-5 w-5" />
//                 Organization
//               </button>
//             </div>

//             {isIndividual ? (
//               <>
//                 <div className="space-y-2">
//                   <label htmlFor="name" className="text-sm text-white/80">Full Name</label>
//                   <Input
//                     id="name"
//                     type="text"
//                     autoComplete="name"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     required
//                     className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white focus-visible:ring-0 focus-visible:outline-none focus:border-[#7D4DFF]/60"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label htmlFor="email" className="text-sm text-white/80">Email</label>
//                   <Input
//                     id="email"
//                     type="email"
//                     autoComplete="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white focus-visible:ring-0 focus-visible:outline-none focus:border-[#7D4DFF]/60"
//                   />
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div className="space-y-2">
//                   <label htmlFor="companyName" className="text-sm text-white/80">Company Name</label>
//                   <Input
//                     id="companyName"
//                     type="text"
//                     value={companyName}
//                     onChange={(e) => setCompanyName(e.target.value)}
//                     required
//                     className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white focus-visible:ring-0 focus-visible:outline-none focus:border-[#7D4DFF]/60"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label htmlFor="businessEmail" className="text-sm text-white/80">Business Email</label>
//                   <Input
//                     id="businessEmail"
//                     type="email"
//                     autoComplete="email"
//                     value={businessEmail}
//                     onChange={(e) => setBusinessEmail(e.target.value)}
//                     required
//                     className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white focus-visible:ring-0 focus-visible:outline-none focus:border-[#7D4DFF]/60"
//                   />
//                 </div>
//               </>
//             )}

//             <Button
//               type="submit"
//               disabled={isLoading}
//               className="w-full md:w-[350px] h-[50px] rounded-[6px] text-[16px] font-normal text-[#FFFFFF] text-center bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3] hover:opacity-90 disabled:opacity-50"
//             >
//               {isLoading ? "Creating..." : "Continue"}
//             </Button>
//           </form>

//           <p className="mt-6 text-[16px] font-normal text-[#FFFFFF]">
//             Having trouble logging in? Contact us at{" "}
//             <a href="mailto:support@tokun.ai" className="text-transparent bg-clip-text bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3] underline underline-offset-4">
//               support@tokun.ai
//             </a>
//           </p>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Signup;





// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useAuth } from "@/contexts/AuthContext";
// import { toast } from "@/components/ui/use-toast";
// import { ArrowLeft, User, Briefcase } from "lucide-react";

// const Signup = () => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [companyName, setCompanyName] = useState("");
//   const [businessEmail, setBusinessEmail] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isIndividual, setIsIndividual] = useState(true);
//   const { signup } = useAuth();
//   const navigate = useNavigate();

//   const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
//   console.log("[ENV] API_BASE =", API_BASE);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (isLoading) return;

//     const nameTrim = name.trim();
//     const emailNorm = email.trim().toLowerCase();
//     const companyTrim = companyName.trim();
//     const businessNorm = businessEmail.trim().toLowerCase();

//     if (isIndividual && (!nameTrim || !emailNorm)) {
//       toast({
//         title: "Missing details",
//         description: "Please enter your full name and email.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (!isIndividual && (!companyTrim || !businessNorm)) {
//       toast({
//         title: "Missing details",
//         description: "Please enter your company name and business email.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsLoading(true);

//     const body = isIndividual
//       ? { name: nameTrim, email: emailNorm, userType: "IND", orgName: null }
//       : { name: companyTrim, email: businessNorm, userType: "ORG", orgName: companyTrim };

//     const url = `${API_BASE}/api/auth/signup/initiate`;
//     const debug = localStorage.getItem("DEBUG_HTTP") === "1";
//     const t0 = performance.now();

//     console.groupCollapsed("%c[SIGNUP] → initiate", "color:#8ab4f8");
//     console.log("POST", url);
//     console.log("Request body:", body);

//     try {
//       const res = await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//         credentials: "include",
//       });

//       const raw = await res.text();
//       let data: any = {};
//       try {
//         data = JSON.parse(raw);
//       } catch {}

//       const t1 = performance.now();

//       console.log("Status:", res.status, res.ok ? "(OK)" : "(ERR)");
//       if (debug) {
//         console.log("Raw response:", raw);
//         console.log("Parsed JSON:", data);
//         console.log(`Network time: ${(t1 - t0).toFixed(1)} ms`);
//         console.log("x-request-id:", res.headers.get("x-request-id"));
//       } else {
//         console.log("Parsed JSON:", data);
//       }

//       if (!res.ok || !data?.success) {
//         throw new Error(data?.error || "Could not send OTP. Please try again.");
//       }

//       if (data.otp) {
//         console.log("%c[DEV ONLY] OTP:", "color:#34d399;font-weight:bold", data.otp);
//         toast({ title: "Dev OTP", description: `Code: ${data.otp}` });
//       }

//       toast({
//         title: "OTP sent",
//         description: isIndividual
//           ? "We emailed you a 4-digit code. Enter it to finish signup."
//           : "We emailed your business email a 4-digit code. Enter it to create your organization.",
//       });

//       const navEmail = isIndividual ? emailNorm : businessNorm;
//       const navName = isIndividual ? nameTrim : companyTrim;
//       const navType = isIndividual ? "IND" : "ORG";

//       const q = new URLSearchParams({
//         email: navEmail,
//         name: navName,
//         userType: navType,
//         ...(navType === "ORG" ? { orgName: companyTrim } : {}),
//       }).toString();

//       if (data.next) {
//         console.log("Next step:", data.next);
//       }

//       const navTo = `/verify-signup?${q}`;
//       console.log("Navigate →", navTo);
//       console.groupEnd();

//       if (!isIndividual) {
//         localStorage.setItem("SHOW_SUB_POPUP", "1");
//       }

//       navigate(navTo);
//     } catch (err: any) {
//       console.error("[SIGNUP] Error:", err);
//       toast({
//         title: "Signup failed",
//         description: err?.message || "Unexpected error. Please try again.",
//         variant: "destructive",
//       });
//       console.groupEnd();
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-black text-white flex font-inter">
//       {/* Desktop left image */}
//       <aside className="hidden lg:block basis-[60%] relative" aria-hidden>
//         <img
//           src="/icons/signup.png"
//           alt=""
//           className="absolute inset-0 w-full h-full object-cover"
//         />
//       </aside>

//       {/* Main */}
//       <main className="flex-1 lg:basis-[40%] min-h-screen relative overflow-hidden">
//         {/* Mobile background glow */}
//         <div className="lg:hidden absolute inset-0 bg-black" />
//         <div
//           className="lg:hidden absolute top-[-120px] left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full blur-3xl opacity-30"
//           style={{
//             background:
//               "radial-gradient(circle, rgba(255,20,239,0.28) 0%, rgba(26,115,232,0.22) 45%, rgba(0,0,0,0) 75%)",
//           }}
//         />

//         {/* Mobile layout */}
//         <div className="lg:hidden relative z-10 min-h-screen px-6 pt-10 pb-10 flex flex-col">
//           {/* Logo ring */}
//           <div className="flex justify-center mt-4 mb-10">
//             <div className="relative w-[260px] h-[260px]">
//               <div
//                 className="absolute inset-0 rounded-full blur-2xl opacity-80"
//                 style={{
//                   background:
//                     "radial-gradient(circle, rgba(255,20,239,0.35) 0%, rgba(26,115,232,0.25) 55%, rgba(0,0,0,0) 75%)",
//                 }}
//               />
//               <div
//                 className="absolute inset-0 rounded-full"
//                 style={{
//                   background:
//                     "conic-gradient(from 210deg, #ff14ef, #a855f7, #3b82f6, #ff14ef)",
//                   padding: "16px",
//                   filter: "blur(0.2px)",
//                   boxShadow:
//                     "0 0 40px rgba(255,20,239,0.45), 0 0 50px rgba(26,115,232,0.30)",
//                 }}
//               >
//                 <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
//                   <span className="text-[28px] font-bold tracking-wide text-white">
//                     TOKUN.AI
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Back */}
//           <Link
//             to="/"
//             className="inline-flex items-center gap-2 text-white/90 text-[18px] mb-10"
//           >
//             <ArrowLeft className="w-7 h-7" />
//             <span>Back</span>
//           </Link>

//           {/* Heading */}
//           <div className="text-center px-2 mb-8">
//             <h1 className="text-[24px] leading-[1.3] font-normal text-white">
//               Create your Tokun account
//             </h1>
//             <p className="mt-3 text-[18px] text-white/90">
//               Already have an account?{" "}
//               <Link to="/login" className="text-[#2F80FF] font-medium">
//                 Sign In
//               </Link>
//             </p>
//           </div>

//           {/* Toggle */}
//           <div className="grid grid-cols-2 gap-3 mb-8">
//             <button
//               type="button"
//               onClick={() => setIsIndividual(true)}
//               aria-pressed={isIndividual}
//               className="h-[58px] rounded-[16px] text-white flex items-center justify-center gap-3 transition"
//               style={{
//                 background: isIndividual
//                   ? "linear-gradient(90deg, #FF14EF 0%, #A855F7 50%, #1A73E8 100%)"
//                   : "rgba(255,255,255,0.06)",
//                 border: isIndividual ? "none" : "1px solid rgba(255,255,255,0.12)",
//               }}
//             >
//               <User className="h-5 w-5" />
//               <span className="text-[16px] font-medium">Individual</span>
//             </button>

//             <button
//               type="button"
//               onClick={() => setIsIndividual(false)}
//               aria-pressed={!isIndividual}
//               className="h-[58px] rounded-[16px] text-white flex items-center justify-center gap-3 transition"
//               style={{
//                 background: !isIndividual
//                   ? "linear-gradient(90deg, #FF14EF 0%, #A855F7 50%, #1A73E8 100%)"
//                   : "rgba(255,255,255,0.06)",
//                 border: !isIndividual ? "none" : "1px solid rgba(255,255,255,0.12)",
//               }}
//             >
//               <Briefcase className="h-5 w-5" />
//               <span className="text-[16px] font-medium">Organization</span>
//             </button>
//           </div>

//           {/* Mobile form */}
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {isIndividual ? (
//               <>
//                 <div className="space-y-3">
//                   <label htmlFor="name-mobile" className="text-[18px] text-white">
//                     Full Name
//                   </label>
//                   <Input
//                     id="name-mobile"
//                     type="text"
//                     autoComplete="name"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     required
//                     placeholder="Enter full name"
//                     className="
//                       h-[78px] w-full rounded-[18px]
//                       bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)]
//                       border border-white/80
//                       text-white text-[18px]
//                       placeholder:text-white/45
//                       px-7
//                       focus-visible:ring-0 focus:border-white
//                     "
//                   />
//                 </div>

//                 <div className="space-y-3">
//                   <label htmlFor="email-mobile" className="text-[18px] text-white">
//                     Email
//                   </label>
//                   <Input
//                     id="email-mobile"
//                     type="email"
//                     autoComplete="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     placeholder="Enter email"
//                     className="
//                       h-[78px] w-full rounded-[18px]
//                       bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)]
//                       border border-white/80
//                       text-white text-[18px]
//                       placeholder:text-white/45
//                       px-7
//                       focus-visible:ring-0 focus:border-white
//                     "
//                   />
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div className="space-y-3">
//                   <label htmlFor="company-mobile" className="text-[18px] text-white">
//                     Company Name
//                   </label>
//                   <Input
//                     id="company-mobile"
//                     type="text"
//                     value={companyName}
//                     onChange={(e) => setCompanyName(e.target.value)}
//                     required
//                     placeholder="Enter company name"
//                     className="
//                       h-[78px] w-full rounded-[18px]
//                       bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)]
//                       border border-white/80
//                       text-white text-[18px]
//                       placeholder:text-white/45
//                       px-7
//                       focus-visible:ring-0 focus:border-white
//                     "
//                   />
//                 </div>

//                 <div className="space-y-3">
//                   <label htmlFor="business-mobile" className="text-[18px] text-white">
//                     Business Email
//                   </label>
//                   <Input
//                     id="business-mobile"
//                     type="email"
//                     autoComplete="email"
//                     value={businessEmail}
//                     onChange={(e) => setBusinessEmail(e.target.value)}
//                     required
//                     placeholder="Enter business email"
//                     className="
//                       h-[78px] w-full rounded-[18px]
//                       bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)]
//                       border border-white/80
//                       text-white text-[18px]
//                       placeholder:text-white/45
//                       px-7
//                       focus-visible:ring-0 focus:border-white
//                     "
//                   />
//                 </div>
//               </>
//             )}

//             <Button
//               type="submit"
//               disabled={isLoading}
//               className="
//                 w-full h-[80px] rounded-[18px]
//                 text-[24px] font-semibold text-white
//                 disabled:opacity-50
//               "
//               style={{
//                 background: "linear-gradient(90deg, #FF14EF 0%, #A855F7 50%, #1A73E8 100%)",
//                 boxShadow:
//                   "0 0 22px rgba(255,20,239,0.28), 0 0 30px rgba(26,115,232,0.22)",
//               }}
//             >
//               {isLoading ? "Creating..." : "Continue"}
//             </Button>
//           </form>

//           <div className="mt-12 text-center space-y-4">
//             <p className="text-[16px] text-white/90 leading-relaxed">
//               Having trouble logging in? Contact us at
//               <br />
//               <a
//                 href="mailto:support@tokun.ai"
//                 className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF14EF] to-[#A855F7]"
//               >
//                 support@tokun.ai
//               </a>
//             </p>
//           </div>
//         </div>

//         {/* Desktop layout */}
//         <div className="hidden lg:flex min-h-screen items-center justify-center px-5 sm:px-8 md:px-10">
//           <div className="w-full max-w-[520px]">
//             <div className="mb-6">
//               <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white">
//                 <ArrowLeft className="h-4 w-4" />
//                 Back
//               </Link>
//             </div>

//             <h1 className="text-[36px] leading-[1] font-normal text-[#FFFFFF]">
//               Create Account
//             </h1>
//             <p className="mt-2 text-[20px] leading-[1] font-normal text-white">
//               Already have an account?{" "}
//               <Link
//                 to="/login"
//                 className="font-medium text-[20px] leading-[1] text-[#1EAEDB] hover:underline"
//               >
//                 Sign In
//               </Link>
//             </p>

//             <div className="my-6 flex items-center gap-4">
//               <div className="h-px flex-1 bg-[#282C42]" />
//               <div className="h-[30px] w-[30px] rounded-full border border-[#282C42] text-[#FFFFFF] text-[12px] flex items-center justify-center">
//                 OR
//               </div>
//               <div className="h-px flex-1 bg-[#282C42]" />
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="mt-6 flex gap-4">
//                 <button
//                   type="button"
//                   onClick={() => setIsIndividual(true)}
//                   aria-pressed={isIndividual}
//                   className={`${
//                     isIndividual
//                       ? "bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3]"
//                       : "bg-[#17171A]"
//                   } w-[169px] h-[40px] rounded-full text-white flex items-center justify-center gap-5 transition`}
//                   style={{
//                     paddingTop: "10.5px",
//                     paddingRight: "14px",
//                     paddingBottom: "10.5px",
//                     paddingLeft: "14px",
//                     opacity: 1,
//                   }}
//                 >
//                   <User className="h-5 w-5" />
//                   Individual
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => setIsIndividual(false)}
//                   aria-pressed={!isIndividual}
//                   className={`${
//                     !isIndividual
//                       ? "bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3]"
//                       : "bg-[#17171A]"
//                   } w-[169px] h-[40px] rounded-full text-white flex items-center justify-center gap-5 transition`}
//                   style={{
//                     paddingTop: "10.5px",
//                     paddingRight: "14px",
//                     paddingBottom: "10.5px",
//                     paddingLeft: "14px",
//                     opacity: 1,
//                   }}
//                 >
//                   <Briefcase className="h-5 w-5" />
//                   Organization
//                 </button>
//               </div>

//               {isIndividual ? (
//                 <>
//                   <div className="space-y-2">
//                     <label htmlFor="name" className="text-sm text-white/80">
//                       Full Name
//                     </label>
//                     <Input
//                       id="name"
//                       type="text"
//                       autoComplete="name"
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       required
//                       className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white focus-visible:ring-0 focus-visible:outline-none focus:border-[#7D4DFF]/60"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <label htmlFor="email" className="text-sm text-white/80">
//                       Email
//                     </label>
//                     <Input
//                       id="email"
//                       type="email"
//                       autoComplete="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       required
//                       className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white focus-visible:ring-0 focus-visible:outline-none focus:border-[#7D4DFF]/60"
//                     />
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <div className="space-y-2">
//                     <label htmlFor="companyName" className="text-sm text-white/80">
//                       Company Name
//                     </label>
//                     <Input
//                       id="companyName"
//                       type="text"
//                       value={companyName}
//                       onChange={(e) => setCompanyName(e.target.value)}
//                       required
//                       className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white focus-visible:ring-0 focus-visible:outline-none focus:border-[#7D4DFF]/60"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <label htmlFor="businessEmail" className="text-sm text-white/80">
//                       Business Email
//                     </label>
//                     <Input
//                       id="businessEmail"
//                       type="email"
//                       autoComplete="email"
//                       value={businessEmail}
//                       onChange={(e) => setBusinessEmail(e.target.value)}
//                       required
//                       className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white focus-visible:ring-0 focus-visible:outline-none focus:border-[#7D4DFF]/60"
//                     />
//                   </div>
//                 </>
//               )}

//               <Button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full md:w-[350px] h-[50px] rounded-[6px] text-[16px] font-normal text-[#FFFFFF] text-center bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3] hover:opacity-90 disabled:opacity-50"
//               >
//                 {isLoading ? "Creating..." : "Continue"}
//               </Button>
//             </form>

//             <p className="mt-6 text-[16px] font-normal text-[#FFFFFF]">
//               Having trouble logging in? Contact us at{" "}
//               <a
//                 href="mailto:support@tokun.ai"
//                 className="text-transparent bg-clip-text bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3] underline underline-offset-4"
//               >
//                 support@tokun.ai
//               </a>
//             </p>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Signup;




import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, User, Briefcase } from "lucide-react";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isIndividual, setIsIndividual] = useState(true);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  console.log("[ENV] API_BASE =", API_BASE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const nameTrim = name.trim();
    const emailNorm = email.trim().toLowerCase();
    const companyTrim = companyName.trim();
    const businessNorm = businessEmail.trim().toLowerCase();

    if (isIndividual && (!nameTrim || !emailNorm)) {
      toast({
        title: "Missing details",
        description: "Please enter your full name and email.",
        variant: "destructive",
      });
      return;
    }

    if (!isIndividual && (!companyTrim || !businessNorm)) {
      toast({
        title: "Missing details",
        description: "Please enter your company name and business email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const body = isIndividual
      ? { name: nameTrim, email: emailNorm, userType: "IND", orgName: null }
      : { name: companyTrim, email: businessNorm, userType: "ORG", orgName: companyTrim };

    const url = `${API_BASE}/api/auth/signup/initiate`;
    const debug = localStorage.getItem("DEBUG_HTTP") === "1";
    const t0 = performance.now();

    console.groupCollapsed("%c[SIGNUP] → initiate", "color:#8ab4f8");
    console.log("POST", url);
    console.log("Request body:", body);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      const raw = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(raw);
      } catch {}

      const t1 = performance.now();

      console.log("Status:", res.status, res.ok ? "(OK)" : "(ERR)");
      if (debug) {
        console.log("Raw response:", raw);
        console.log("Parsed JSON:", data);
        console.log(`Network time: ${(t1 - t0).toFixed(1)} ms`);
        console.log("x-request-id:", res.headers.get("x-request-id"));
      } else {
        console.log("Parsed JSON:", data);
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Could not send OTP. Please try again.");
      }

      if (data.otp) {
        console.log("%c[DEV ONLY] OTP:", "color:#34d399;font-weight:bold", data.otp);
  
        toast({ title: "Dev OTP", description: `Code: ${data.otp}` });
      }

      toast({
        title: "OTP sent",
        description: isIndividual
          ? "We emailed you a 4-digit code. Enter it to finish signup."
          : "We emailed your business email a 4-digit code. Enter it to create your organization.",
      });

      const navEmail = isIndividual ? emailNorm : businessNorm;
      const navName = isIndividual ? nameTrim : companyTrim;
      const navType = isIndividual ? "IND" : "ORG";

      const q = new URLSearchParams({
        email: navEmail,
        name: navName,
        userType: navType,
        ...(navType === "ORG" ? { orgName: companyTrim } : {}),
      }).toString();

      if (data.next) {
        console.log("Next step:", data.next);
      }

      const navTo = `/verify-signup?${q}`;
      console.log("Navigate →", navTo);
      console.groupEnd();

      if (!isIndividual) {
        localStorage.setItem("SHOW_SUB_POPUP", "1");
      }

      navigate(navTo);
    } catch (err: any) {
      console.error("[SIGNUP] Error:", err);
      toast({
        title: "Signup failed",
        description: err?.message || "Unexpected error. Please try again.",
        variant: "destructive",
      });
      console.groupEnd();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex font-inter">
      {/* Desktop left image */}
      <aside className="hidden lg:block basis-[60%] relative" aria-hidden>
        <img
          src="/icons/signup.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      </aside>

      {/* Main */}
          <main className="flex-1 lg:basis-[40%] min-h-screen relative overflow-hidden">
        {/* Mobile background */}
        <div className="lg:hidden absolute inset-0 bg-black" />

        {/* Mobile layout */}
        <div className="lg:hidden relative z-10 min-h-screen px-6 pt-4 pb-8 flex flex-col">
          {/* Top hero image */}
          <div className="-mx-6 -mt-2 mb-4 relative">
            <img
              src="/icons/signup.png"
              alt="Tokun AI"
              className="w-full h-auto object-cover pointer-events-none select-none"
            />

             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                className="text-white text-[22px] sm:text-[26px] font-bold tracking-wide"
                style={{
                  textShadow:
                    "0 0 18px rgba(0,0,0,0.65), 0 0 28px rgba(0,0,0,0.55)",
                }}
              >
                TOKUN.AI
              </span>
            </div>
          </div>

          {/* Back */}
             <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/90 text-[16px] mb-7"
            style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>

          {/* Heading */}
             <div className="text-center px-2 mb-5">
            <h1
              className="text-[20px] sm:text-[22px] leading-[1.2] font-normal text-white"
              style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
            >
              Create your Tokun account
            </h1>
            <p
              className="mt-2 text-[14px] sm:text-[15px] text-white/90"
              style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
            >
              Already have an account?{" "}
              <Link to="/login" className="text-[#2F80FF] font-medium">
                Sign In
              </Link>
            </p>
          </div>

          {/* Toggle */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={() => setIsIndividual(true)}
              aria-pressed={isIndividual}
              className="h-[48px] sm:h-[52px] rounded-[14px] text-white flex items-center justify-center gap-2 transition"
              style={{
                background: isIndividual
                  ? "linear-gradient(90deg, #FF14EF 0%, #A855F7 50%, #1A73E8 100%)"
                  : "rgba(255,255,255,0.06)",
                border: isIndividual ? "none" : "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-[14px] sm:text-[15px] font-medium">Individual</span>
            </button>

            <button
              type="button"
              onClick={() => setIsIndividual(false)}
              aria-pressed={!isIndividual}
              className="h-[48px] sm:h-[52px] rounded-[14px] text-white flex items-center justify-center gap-2 transition"
              style={{
                background: !isIndividual
                  ? "linear-gradient(90deg, #FF14EF 0%, #A855F7 50%, #1A73E8 100%)"
                  : "rgba(255,255,255,0.06)",
                border: !isIndividual ? "none" : "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-[14px] sm:text-[15px] font-medium">Organization</span>
            </button>
          </div>

          {/* Mobile form */}
      <form onSubmit={handleSubmit} className="space-y-4">
            {isIndividual ? (
              <>
                <div className="space-y-2">
                  <label
                    htmlFor="name-mobile"
                    className="text-[14px] sm:text-[15px] text-white"
                    style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
                  >
                    Full Name
                  </label>
                  <Input
                    id="name-mobile"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter full name"
                    className="
                      h-[56px] sm:h-[60px] w-full rounded-[16px]
                      bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)]
                      border border-white/80
                      text-white text-[15px] sm:text-[16px]
                      placeholder:text-white/45 placeholder:text-[14px]
                      px-5
                      focus-visible:ring-0 focus:border-white
                    "
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email-mobile"
                    className="text-[14px] sm:text-[15px] text-white"
                    style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
                  >
                    Email
                  </label>
                  <Input
                    id="email-mobile"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter email"
                    className="
                      h-[56px] sm:h-[60px] w-full rounded-[16px]
                      bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)]
                      border border-white/80
                      text-white text-[15px] sm:text-[16px]
                      placeholder:text-white/45 placeholder:text-[14px]
                      px-5
                      focus-visible:ring-0 focus:border-white
                    "
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label
                    htmlFor="company-mobile"
                    className="text-[14px] sm:text-[15px] text-white"
                    style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
                  >
                    Company Name
                  </label>
                  <Input
                    id="company-mobile"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    placeholder="Enter company name"
                    className="
                      h-[56px] sm:h-[60px] w-full rounded-[16px]
                      bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)]
                      border border-white/80
                      text-white text-[15px] sm:text-[16px]
                      placeholder:text-white/45 placeholder:text-[14px]
                      px-5
                      focus-visible:ring-0 focus:border-white
                    "
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="business-mobile"
                    className="text-[14px] sm:text-[15px] text-white"
                    style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
                  >
                    Business Email
                  </label>
                  <Input
                    id="business-mobile"
                    type="email"
                    autoComplete="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    required
                    placeholder="Enter business email"
                    className="
                      h-[56px] sm:h-[60px] w-full rounded-[16px]
                      bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)]
                      border border-white/80
                      text-white text-[15px] sm:text-[16px]
                      placeholder:text-white/45 placeholder:text-[14px]
                      px-5
                      focus-visible:ring-0 focus:border-white
                    "
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="
                w-full h-[56px] sm:h-[60px] rounded-[16px]
                text-[17px] sm:text-[18px] font-semibold text-white
                disabled:opacity-50
              "
              style={{
                background: "linear-gradient(90deg, #FF14EF 0%, #A855F7 50%, #1A73E8 100%)",
                boxShadow:
                  "0 0 22px rgba(255,20,239,0.28), 0 0 30px rgba(26,115,232,0.22)",
              }}
            >
              {isLoading ? "Creating..." : "Continue"}
            </Button>
          </form>
           <div className="mt-7 text-center space-y-3">
            <p
              className="text-[14px] sm:text-[15px] text-white/90 leading-relaxed"
              style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
            >
              Having trouble logging in? Contact us at
              <br />
              <a
                href="mailto:support@tokun.ai"
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF14EF] to-[#A855F7]"
              >
                support@tokun.ai
              </a>
            </p>
            </div>
         
        </div>

        {/* Desktop layout */}
         <div className="hidden lg:flex min-h-screen items-center justify-center px-5 sm:px-8 md:px-10">
          <div className="w-full max-w-[520px]">
            <div className="mb-6">
              <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </div>

             <h1 className="text-[36px] leading-[1] font-normal text-[#FFFFFF]">
              Create Account
            </h1>
            <p className="mt-2 text-[20px] leading-[1] font-normal text-white">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-[20px] leading-[1] text-[#1EAEDB] hover:underline"
              >
                Sign In
              </Link>
            </p>
            
               <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#282C42]" />
              <div className="h-[30px] w-[30px] rounded-full border border-[#282C42] text-[#FFFFFF] text-[12px] flex items-center justify-center">
                OR
              </div>
              <div className="h-px flex-1 bg-[#282C42]" />
            </div>
            

               <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsIndividual(true)}
                  aria-pressed={isIndividual}
                  className={`${
                    isIndividual
                      ? "bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3]"
                      : "bg-[#17171A]"
                  } w-[169px] h-[40px] rounded-full text-white flex items-center justify-center gap-5 transition`}
                  style={{
                    paddingTop: "10.5px",
                    paddingRight: "14px",
                    paddingBottom: "10.5px",
                    paddingLeft: "14px",
                    opacity: 1,
                  }}
                >
                  <User className="h-5 w-5" />
                  Individual
                </button>

                <button
                  type="button"
                  onClick={() => setIsIndividual(false)}
                  aria-pressed={!isIndividual}
                  className={`${
                    !isIndividual
                      ? "bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3]"
                      : "bg-[#17171A]"
                  } w-[169px] h-[40px] rounded-full text-white flex items-center justify-center gap-5 transition`}
                  style={{
                    paddingTop: "10.5px",
                    paddingRight: "14px",
                    paddingBottom: "10.5px",
                    paddingLeft: "14px",
                    opacity: 1,
                  }}
                >
                  <Briefcase className="h-5 w-5" />
                  Organization
                </button>
              </div>

              {isIndividual ? (
                <>
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm text-white/80">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white focus-visible:ring-0 focus-visible:outline-none focus:border-[#7D4DFF]/60"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm text-white/80">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white focus-visible:ring-0 focus-visible:outline-none focus:border-[#7D4DFF]/60"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label htmlFor="companyName" className="text-sm text-white/80">
                      Company Name
                    </label>
                    <Input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white focus-visible:ring-0 focus-visible:outline-none focus:border-[#7D4DFF]/60"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="businessEmail" className="text-sm text-white/80">
                      Business Email
                    </label>
                    <Input
                      id="businessEmail"
                      type="email"
                      autoComplete="email"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      required
                      className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white focus-visible:ring-0 focus-visible:outline-none focus:border-[#7D4DFF]/60"
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-[350px] h-[50px] rounded-[6px] text-[16px] font-normal text-[#FFFFFF] text-center bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3] hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? "Creating..." : "Continue"}
              </Button>
            </form>

            <p className="mt-6 text-[16px] font-normal text-[#FFFFFF]">
              Having trouble logging in? Contact us at{" "}
              <a
                href="mailto:support@tokun.ai"
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3] underline underline-offset-4"
              >
                support@tokun.ai
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Signup;