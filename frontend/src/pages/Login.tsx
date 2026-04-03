




// // import { useState } from "react";
// // import { Link, useNavigate } from "react-router-dom";
// // import { Input } from "@/components/ui/input";
// // import { toast } from "@/components/ui/use-toast";

// // const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
// // console.log("[ENV] API_BASE =", API_BASE);

// // const Login = () => {
// //   const [email, setEmail] = useState("");
// //   const [isLoading, setIsLoading] = useState(false);
// //   const navigate = useNavigate();

// //   // const handleRequestOtp = async (e: React.FormEvent) => {
// //   //   e.preventDefault();
// //   //   if (!email || isLoading) return;

// //   //   const emailNorm = email.trim().toLowerCase();

// //   //   setIsLoading(true);
// //   //   try {
// //   //     const url = `${API_BASE}/api/auth/login/initiate`;
// //   //     console.log("[LOGIN] POST", url, { email: emailNorm });

// //   //     const res = await fetch(url, {
// //   //       method: "POST",
// //   //       headers: { "Content-Type": "application/json" },
// //   //       body: JSON.stringify({ email: emailNorm }),
// //   //     });

// //   //     const data = await res.json();
// //   //     console.log("[LOGIN] Response", res.status, data);

// //   //     if (!res.ok || !data?.success) {
// //   //       throw new Error(data?.error || "Could not send OTP. Please try again.");
// //   //     }

// //   //     toast({ title: "OTP sent", description: "Check your inbox for the 4-digit code." });

// //   //     const navTo = `/verify-login?email=${encodeURIComponent(emailNorm)}`;
// //   //     console.log("[LOGIN] Navigate →", navTo);
// //   //     navigate(navTo);
// //   //   } catch (err: any) {
// //   //     console.error("[LOGIN] Error", err);
// //   //     toast({
// //   //       title: "Login failed",
// //   //       description: err?.message || "Unexpected error. Please try again.",
// //   //       variant: "destructive",
// //   //     });
// //   //   } finally {
// //   //     setIsLoading(false);
// //   //   }
// //   // };


// //   const handleRequestOtp = async (e: React.FormEvent) => {
// //   e.preventDefault();
// //   if (!email || isLoading) return;

// //   const emailNorm = email.trim().toLowerCase();

// //   setIsLoading(true);
// //   const t0 = performance.now();
// //   try {
// //     const url = `${API_BASE}/api/auth/login/initiate`;
// //     const body = { email: emailNorm };

// //     console.log("[LOGIN] → POST", url);
// //     console.log("[LOGIN] → body", body);

// //     const res = await fetch(url, {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify(body),
// //     });

// //     const data = await res.json();

// //     console.log("[LOGIN] ← status:", res.status);
// //     console.log("[LOGIN] ← json:", data);

// //     if (!res.ok || !data?.success) {
// //       throw new Error(data?.error || "Could not send OTP. Please try again.");
// //     }

// //     toast({ title: "OTP sent", description: "Check your inbox for the 4-digit code." });

// //     const navTo = `/verify-login?email=${encodeURIComponent(emailNorm)}`;
// //     console.log("[LOGIN] navigate →", navTo);
// //     navigate(navTo);
// //   } catch (err: any) {
// //     console.error("[LOGIN] error:", err);
// //     toast({
// //       title: "Login failed",
// //       description: err?.message || "Unexpected error. Please try again.",
// //       variant: "destructive",
// //     });
// //   } finally {
// //     const t1 = performance.now();
// //     console.log(`[LOGIN] completed in ${(t1 - t0).toFixed(1)}ms`);
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
// //           <div className="mb-6">
// //             <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white">Back</Link>
// //           </div>

// //           <h1 className="text-[36px] leading-[1] font-normal text-white">Sign In</h1>
// //           <p className="mt-2 text-[20px] font-normal text-white">
// //             Don’t have an account?{" "}
// //             <Link to="/signup" className="text-[#1EAEDB] hover:underline">Create one</Link>
// //           </p>

// //           <div className="my-6 flex items-center gap-4">
// //             <div className="h-px flex-1 bg-[#282C42]" />
// //             <div className="h-[30px] w-[30px] rounded-full border border-[#282C42] text-[#FFFFFF] text-[12px] flex items-center justify-center">
// //               OR
// //             </div>
// //             <div className="h-px flex-1 bg-[#282C42]" />
// //           </div>

// //           <form onSubmit={handleRequestOtp} className="space-y-6">
// //             <div className="space-y-2">
// //               <label htmlFor="email" className="text-sm text-white/80">Email</label>
// //               <Input
// //                 id="email"
// //                 type="email"
// //                 autoComplete="email"
// //                 value={email}
// //                 onChange={(e) => setEmail(e.target.value)}
// //                 required
// //                 className="
// //                   h-[50px] w-full md:w-[350px]
// //                   rounded-[6px] bg-[#0F1520]
// //                   border border-[#282C42] text-white
// //                   focus-visible:ring-0 focus:border-[#7D4DFF]/60
// //                 "
// //               />
// //             </div>

// //             <button
// //               type="submit"
// //               disabled={isLoading || !email}
// //               className="
// //                 w-full md:w-[350px] h-[50px] rounded-[6px]
// //                 text-[16px] font-normal text-white
// //                 bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3] hover:opacity-90
// //                 disabled:opacity-50
// //               "
// //             >
// //               {isLoading ? "Sending..." : "Request OTP"}
// //             </button>
// //           </form>

// //           <p className="mt-6 text-[16px] font-normal text-white">
// //             Having trouble logging in? Contact us at{" "}
// //             <a
// //               href="mailto:support@tokun.ai"
// //               className="text-transparent bg-clip-text bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3] underline underline-offset-4"
// //             >
// //               support@tokun.ai
// //             </a>
// //           </p>
// //         </div>
// //       </main>
// //     </div>
// //   );
// // };

// // export default Login;




// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { ArrowLeft } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { toast } from "@/components/ui/use-toast";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
// console.log("[ENV] API_BASE =", API_BASE);

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleRequestOtp = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!email || isLoading) return;

//     const emailNorm = email.trim().toLowerCase();

//     setIsLoading(true);
//     const t0 = performance.now();
//     try {
//       const url = `${API_BASE}/api/auth/login/initiate`;
//       const body = { email: emailNorm };

//       console.log("[LOGIN] → POST", url);
//       console.log("[LOGIN] → body", body);

//       const res = await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });

//       const data = await res.json();

//       console.log("[LOGIN] ← status:", res.status);
//       console.log("[LOGIN] ← json:", data);

//       if (!res.ok || !data?.success) {
//         throw new Error(data?.error || "Could not send OTP. Please try again.");
//       }

//       toast({
//         title: "OTP sent",
//         description: "Check your inbox for the 4-digit code.",
//       });

//       const navTo = `/verify-login?email=${encodeURIComponent(emailNorm)}`;
//       console.log("[LOGIN] navigate →", navTo);
//       navigate(navTo);
//     } catch (err: any) {
//       console.error("[LOGIN] error:", err);
//       toast({
//         title: "Login failed",
//         description: err?.message || "Unexpected error. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       const t1 = performance.now();
//       console.log(`[LOGIN] completed in ${(t1 - t0).toFixed(1)}ms`);
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-black text-white flex font-inter">
//       {/* DESKTOP LEFT IMAGE */}
//       <aside className="hidden lg:block basis-[60%] relative" aria-hidden>
//         <img
//           src="/icons/signup.png"
//           alt=""
//           className="absolute inset-0 w-full h-full object-cover"
//         />
//       </aside>

//       {/* RIGHT / MOBILE MAIN */}
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

//         {/* MOBILE LAYOUT */}
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
//             className="inline-flex items-center gap-2 text-white/90 text-[18px] mb-12"
//           >
//             <ArrowLeft className="w-7 h-7" />
//             <span>Back</span>
//           </Link>

//           {/* Text */}
//           <div className="text-center px-2 mb-10">
//             <h1 className="text-[22px] leading-[1.35] font-normal text-white">
//               Please enter your email to receive OTP
//             </h1>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleRequestOtp} className="space-y-6">
//             <div className="space-y-3">
//               <label htmlFor="email-mobile" className="text-[18px] text-white">
//                 Email
//               </label>

//               <Input
//                 id="email-mobile"
//                 type="email"
//                 autoComplete="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 placeholder="Enter email"
//                 className="
//                   h-[78px] w-full rounded-[18px]
//                   bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)]
//                   border border-white/80
//                   text-white text-[18px]
//                   placeholder:text-white/45
//                   px-7
//                   focus-visible:ring-0 focus:border-white
//                 "
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading || !email}
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
//               {isLoading ? "Sending..." : "Request OTP"}
//             </button>
//           </form>

//           {/* Footer text */}
//           <div className="mt-14 text-center space-y-4">
//             <p className="text-[18px] text-white/90 leading-relaxed">
//               Already have an account?{" "}
//               <Link to="/signup" className="text-[#2F80FF] font-medium">
//                 Create one
//               </Link>
//             </p>

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

//         {/* DESKTOP LAYOUT */}
//         <div className="hidden lg:flex min-h-screen items-center justify-center px-5 sm:px-8 md:px-10">
//           <div className="w-full max-w-[520px]">
//             <div className="mb-6">
//               <Link
//                 to="/"
//                 className="inline-flex items-center gap-2 text-white/70 hover:text-white"
//               >
//                 Back
//               </Link>
//             </div>

//             <h1 className="text-[36px] leading-[1] font-normal text-white">
//               Sign In
//             </h1>
//             <p className="mt-2 text-[20px] font-normal text-white">
//               Don’t have an account?{" "}
//               <Link to="/signup" className="text-[#1EAEDB] hover:underline">
//                 Create one
//               </Link>
//             </p>

//             <div className="my-6 flex items-center gap-4">
//               <div className="h-px flex-1 bg-[#282C42]" />
//               <div className="h-[30px] w-[30px] rounded-full border border-[#282C42] text-[#FFFFFF] text-[12px] flex items-center justify-center">
//                 OR
//               </div>
//               <div className="h-px flex-1 bg-[#282C42]" />
//             </div>

//             <form onSubmit={handleRequestOtp} className="space-y-6">
//               <div className="space-y-2">
//                 <label htmlFor="email" className="text-sm text-white/80">
//                   Email
//                 </label>
//                 <Input
//                   id="email"
//                   type="email"
//                   autoComplete="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                   className="
//                     h-[50px] w-full md:w-[350px]
//                     rounded-[6px] bg-[#0F1520]
//                     border border-[#282C42] text-white
//                     focus-visible:ring-0 focus:border-[#7D4DFF]/60
//                   "
//                 />
//               </div>

//               <button
//                 type="submit"
//                 disabled={isLoading || !email}
//                 className="
//                   w-full md:w-[350px] h-[50px] rounded-[6px]
//                   text-[16px] font-normal text-white
//                   bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3] hover:opacity-90
//                   disabled:opacity-50
//                 "
//               >
//                 {isLoading ? "Sending..." : "Request OTP"}
//               </button>
//             </form>

//             <p className="mt-6 text-[16px] font-normal text-white">
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

// export default Login;



import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
console.log("[ENV] API_BASE =", API_BASE);

const Login = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    const emailNorm = email.trim().toLowerCase();

    setIsLoading(true);
    const t0 = performance.now();

    try {
      const url = `${API_BASE}/api/auth/login/initiate`;
      const body = { email: emailNorm };

      console.log("[LOGIN] → POST", url);
      console.log("[LOGIN] → body", body);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      console.log("[LOGIN] ← status:", res.status);
      console.log("[LOGIN] ← json:", data);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Could not send OTP. Please try again.");
      }

      toast({
        title: "OTP sent",
        description: "Check your inbox for the 4-digit code.",
      });

      const navTo = `/verify-login?email=${encodeURIComponent(emailNorm)}`;
      console.log("[LOGIN] navigate →", navTo);
      // ✅ handleRequestOtp mein — navigate se PEHLE add karo:

      navigate(navTo);
    } catch (err: any) {
      console.error("[LOGIN] error:", err);
      toast({
        title: "Login failed",
        description: err?.message || "Unexpected error. Please try again.",
        variant: "destructive",
      });
    } finally {
      const t1 = performance.now();
      console.log(`[LOGIN] completed in ${(t1 - t0).toFixed(1)}ms`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex font-inter">
      {/* DESKTOP LEFT IMAGE */}
      <aside className="hidden lg:block basis-[60%] relative" aria-hidden>
        <img
          src="/icons/signup.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      </aside>

      {/* RIGHT / MOBILE MAIN */}
      <main className="flex-1 lg:basis-[40%] min-h-screen relative overflow-hidden">
        {/* MOBILE BACKGROUND */}
        <div className="lg:hidden absolute inset-0 bg-black" />

{/* MOBILE LAYOUT */}
<div className="lg:hidden relative z-10 min-h-screen px-6 pt-4 pb-8 flex flex-col">

  <style>{`
    @keyframes spin-ring {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes spin-img {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `}</style>

  {/* Revolving image */}
  <div className="flex justify-center mb-5 mt-10">
    <div className="relative w-28 h-28">
      {/* Outer conic ring */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "9999px",
          background: "conic-gradient(from 0deg, #FF14EF, #A855F7, #1A73E8, #FF14EF)",
          animation: "spin-ring 4s linear infinite",
          padding: 3,
        }}
      >
        <div style={{ width: "100%", height: "100%", borderRadius: "9999px", background: "#000" }} />
      </div>
      {/* Image */}
      <div
        style={{
          position: "absolute",
          inset: 4,
          borderRadius: "9999px",
          overflow: "hidden",
          animation: "spin-img 8s linear infinite",
        }}
      >
        <img
          src="/icons/signup.png"
          alt="Tokun AI"
          className="w-full h-full object-cover pointer-events-none select-none"
        />
      </div>
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "9999px",
          pointerEvents: "none",
          boxShadow: "0 0 32px rgba(255,20,239,0.45), 0 0 60px rgba(26,115,232,0.3)",
        }}
      />
    </div>
  </div>

  {/* Back */}
  <Link
    to="/"
    className="inline-flex items-center gap-2 text-white/90 text-[16px] mb-4"
  >
    <ArrowLeft className="w-5 h-5" />
    <span>Back</span>
  </Link>

  {/* Text */}
  <div className="text-center px-2 mb-5">
    <h1
      className="text-[15px] font-semibold text-white mb-1"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
    >
      Welcome back 👋
    </h1>
    <p className="text-[12px] text-white/50 leading-snug">
      Enter your email and we'll send a one-time password
    </p>
  </div>

  {/* Form */}
  <form onSubmit={handleRequestOtp} className="space-y-3">
    <div className="space-y-1.5">
      <label
        htmlFor="email-mobile"
        className="text-[13px] text-white/70"
        style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
      >
        Email address
      </label>
      <Input
        id="email-mobile"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="you@example.com"
        className="h-[44px] w-full rounded-[12px] bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)] border border-white/20 text-white text-[14px] placeholder:text-white/30 placeholder:text-[13px] px-4 focus-visible:ring-0 focus:border-white/50"
      />
      {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
        <p className="text-[11px] text-red-400 pl-1">
          Please enter a valid email address
        </p>
      )}
    </div>

    <button
      type="submit"
      disabled={isLoading || !email}
      className="w-full h-[44px] rounded-[12px] text-[14px] font-semibold text-white disabled:opacity-40 transition-opacity"
      style={{
        background: "linear-gradient(90deg, #FF14EF 0%, #A855F7 50%, #1A73E8 100%)",
      }}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Sending...
        </span>
      ) : (
        "Request OTP"
      )}
    </button>
  </form>

  {/* Footer */}
  <div className="mt-9 text-center space-y-3">
    <p className="text-[14px] text-white/90 leading-relaxed">
      Don't have an account?{" "}
      <Link to="/signup" className="text-[#2F80FF] font-medium">
        Create one
      </Link>
    </p>
    <p className="text-[14px] text-white/90 leading-relaxed">
      Having trouble logging in? Contact us at
      <br />
      
       <a href="mailto:support@tokun.ai"
        className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF14EF] to-[#A855F7]"
      >
        support@tokun.ai
      </a>
    </p>
  </div>

</div>
        {/* DESKTOP LAYOUT */}
        <div className="hidden lg:flex min-h-screen items-center justify-center px-5 sm:px-8 md:px-10">
          <div className="w-full max-w-[520px]">
            <div className="mb-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white"
              >
                Back
              </Link>
            </div>

            <h1 className="text-[36px] leading-[1] font-normal text-white">
              Sign In
            </h1>
            <p className="mt-2 text-[20px] font-normal text-white">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-[#1EAEDB] hover:underline">
                Create one
              </Link>
            </p>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#282C42]" />
              <div className="h-[30px] w-[30px] rounded-full border border-[#282C42] text-[#FFFFFF] text-[12px] flex items-center justify-center">
                OR
              </div>
              <div className="h-px flex-1 bg-[#282C42]" />
            </div>

            <form onSubmit={handleRequestOtp} className="space-y-6">
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
                  className="
                    h-[50px] w-full md:w-[350px]
                    rounded-[6px] bg-[#0F1520]
                    border border-[#282C42] text-white
                    focus-visible:ring-0 focus:border-[#7D4DFF]/60
                  "
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="
                  w-full md:w-[350px] h-[50px] rounded-[6px]
                  text-[16px] font-normal text-white
                  bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3] hover:opacity-90
                  disabled:opacity-50
                "
              >
                {isLoading ? "Sending..." : "Request OTP"}
              </button>
            </form>

            <p className="mt-6 text-[16px] font-normal text-white">
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

export default Login;