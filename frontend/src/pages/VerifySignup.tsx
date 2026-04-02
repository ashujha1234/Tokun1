// import { useEffect, useState } from "react";
// import { Link, useNavigate, useSearchParams } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { toast } from "@/components/ui/use-toast";
// import { ChevronLeft } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// export default function VerifySignup() {
//   const [params] = useSearchParams();
//   const navigate = useNavigate();
//    const { persistAuth } = useAuth();
//   const email = (params.get("email") || "").trim();
//   const [otp, setOtp] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [secondsLeft, setSecondsLeft] = useState(50);

//   useEffect(() => {
//     if (!email) {
//       toast({ title: "Missing email", description: "Please go back and signup again.", variant: "destructive" });
//       navigate("/signup", { replace: true });
//     }
//   }, [email, navigate]);

//   useEffect(() => {
//     if (secondsLeft <= 0) return;
//     const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
//     return () => clearInterval(t);
//   }, [secondsLeft]);

//   const formatMMSS = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

 

//   // const handleSignupVerify = async (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   if (otp.length !== 4) return;

//   //   setIsLoading(true);
//   //   try {
//   //     const resp = await fetch(`${API_BASE}/api/auth/signup/verify`, {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify({ email, otp }),
//   //     });
//   //     const json = await resp.json();
//   //     if (!resp.ok || !json?.success) throw new Error(json?.error || "Verification failed");

//   //   persistAuth(json);  // ✅ updates state + localStorage
//   //     toast({ title: "Success", description: "Signup complete. Redirecting..." });
//   //     navigate("/smartgen", { replace: true });
//   //   } catch (err: any) {
//   //     toast({ title: "Verification failed", description: err?.message, variant: "destructive" });
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   // const handleResend = async () => {
//   //   try {
//   //     const resp = await fetch(`${API_BASE}/api/auth/signup/initiate`, {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify({ email }),
//   //     });
//   //     const json = await resp.json();
//   //     if (!resp.ok || !json?.success) throw new Error(json?.error || "Failed to resend");
//   //     toast({ title: "Code resent", description: "Check your inbox." });
//   //     setSecondsLeft(50);
//   //   } catch (err: any) {
//   //     toast({ title: "Could not resend", description: err?.message, variant: "destructive" });
//   //   }
//   // };


// // inside VerifySignup component

// const handleSignupVerify = async (e: React.FormEvent) => {
//   e.preventDefault();
//   if (otp.length !== 4) return;

//   setIsLoading(true);
//   try {
//     const body = { email, otp };
//     console.log("[VERIFY] POST body →", body);

//     const resp = await fetch(`${API_BASE}/api/auth/signup/verify`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     });

//     const json = await resp.json();
//     console.log("[VERIFY] Response status:", resp.status);
//     console.log("[VERIFY] Response json:", json);

//     if (!resp.ok || !json?.success) throw new Error(json?.error || "Verification failed");

//     // Persist auth (token + user + org etc.)
//     persistAuth(json);

//     // ✅ Mark first-time admin for SmartGen
// if (json?.user?.role === "Admin" || json?.user?.userType === "Admin") {
//   localStorage.setItem("showAddMemberPopup", "true");
// }
//     toast({ title: "Success", description: "Signup complete. Redirecting..." });
//     navigate("/smartgen", { replace: true });
//   } catch (err: any) {
//     console.error("[VERIFY] Error:", err);
//     toast({ title: "Verification failed", description: err?.message, variant: "destructive" });
//   } finally {
//     setIsLoading(false);
//   }
// };

// const handleResend = async () => {
//   try {
//     const body = { email };
//     console.log("[RESEND] POST body →", body);

//     const resp = await fetch(`${API_BASE}/api/auth/signup/initiate`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     });

//     const json = await resp.json();
//     console.log("[RESEND] Response status:", resp.status);
//     console.log("[RESEND] Response json:", json);

//     if (!resp.ok || !json?.success) throw new Error(json?.error || "Failed to resend");
//     toast({ title: "Code resent", description: "Check your inbox." });
//     setSecondsLeft(50);
//   } catch (err: any) {
//     console.error("[RESEND] Error:", err);
//     toast({ title: "Could not resend", description: err?.message, variant: "destructive" });
//   }
// };


















//   return (
//     <div className="min-h-screen w-full bg-[#030406] text-white flex font-inter">
//       <aside className="hidden lg:block basis-[60%] relative" aria-hidden>
//         <img src="/icons/signup.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
//       </aside>

//       <main className="flex-1 lg:basis-[40%] min-h-screen flex items-center justify-center px-5 sm:px-8 md:px-10">
//         <div className="w-full max-w-[520px]">
//           <div className="mb-6">
//             <Link to="/signup" className="inline-flex items-center gap-2 text-white/70 hover:text-white">
//               <ChevronLeft className="h-4 w-4" /> Back
//             </Link>
//           </div>

//           <p className="text-[16px] font-normal text-white">
//             Please enter the OTP sent to {email || "your email"}{" "}
//             <button onClick={() => navigate("/signup")} className="text-[#1EAEDB] underline underline-offset-4">
//               Change
//             </button>
//           </p>

//           <div className="mt-4" />
//           <label htmlFor="otp" className="block text-[16px] text-white/80 mb-2">OTP</label>

//           <form onSubmit={handleSignupVerify} className="space-y-6">
//             <Input
//               id="otp"
//               type="text"
//               inputMode="numeric"
//               maxLength={4}
//               value={otp}
//               onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
//               required
//               className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white text-center tracking-[8px]"
//             />
//             <Button
//               type="submit"
//               disabled={isLoading || otp.length !== 4}
//               className="w-full md:w-[350px] h-[50px] rounded-[6px] text-[16px] text-white bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3]"
//             >
//               {isLoading ? "Verifying..." : "Verify"}
//             </Button>
//           </form>

//           <div className="mt-4">
//             {secondsLeft > 0 ? (
//               <span>Not received your code? <span className="text-[#1EAEDB]">{formatMMSS(secondsLeft)}</span></span>
//             ) : (
//               <button onClick={handleResend} className="text-[#1EAEDB] underline">Resend code</button>
//             )}
//           </div>

//           <p className="mt-6 text-[16px]">
//             Having trouble logging in? Contact us at{" "}
//             <a href="mailto:support@tokun.ai" className="text-transparent bg-clip-text bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3] underline">
//               support@tokun.ai
//             </a>
//           </p>
//         </div>
//       </main>
//     </div>
//   );
// }



// import { useEffect, useState } from "react";
// import { Link, useNavigate, useSearchParams } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { toast } from "@/components/ui/use-toast";
// import { ArrowLeft, ChevronLeft } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// export default function VerifySignup() {
//   const [params] = useSearchParams();
//   const navigate = useNavigate();
//   const { persistAuth } = useAuth();

//   const email = (params.get("email") || "").trim();
//   const [otp, setOtp] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [secondsLeft, setSecondsLeft] = useState(50);

//   useEffect(() => {
//     if (!email) {
//       toast({
//         title: "Missing email",
//         description: "Please go back and signup again.",
//         variant: "destructive",
//       });
//       navigate("/signup", { replace: true });
//     }
//   }, [email, navigate]);

//   useEffect(() => {
//     if (secondsLeft <= 0) return;
//     const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
//     return () => clearInterval(t);
//   }, [secondsLeft]);

//   const formatMMSS = (s: number) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

//   const handleSignupVerify = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (otp.length !== 4) return;

//     setIsLoading(true);
//     try {
//       const body = { email, otp };
//       console.log("[VERIFY] POST body →", body);

//       const resp = await fetch(`${API_BASE}/api/auth/signup/verify`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });

//       const json = await resp.json();
//       console.log("[VERIFY] Response status:", resp.status);
//       console.log("[VERIFY] Response json:", json);

//       if (!resp.ok || !json?.success) {
//         throw new Error(json?.error || "Verification failed");
//       }

//       persistAuth(json);

//       if (json?.user?.role === "Admin" || json?.user?.userType === "Admin") {
//         localStorage.setItem("showAddMemberPopup", "true");
//       }

//       toast({ title: "Success", description: "Signup complete. Redirecting..." });
//       navigate("/smartgen", { replace: true });
//     } catch (err: any) {
//       console.error("[VERIFY] Error:", err);
//       toast({
//         title: "Verification failed",
//         description: err?.message,
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     try {
//       const body = { email };
//       console.log("[RESEND] POST body →", body);

//       const resp = await fetch(`${API_BASE}/api/auth/signup/initiate`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });

//       const json = await resp.json();
//       console.log("[RESEND] Response status:", resp.status);
//       console.log("[RESEND] Response json:", json);

//       if (!resp.ok || !json?.success) {
//         throw new Error(json?.error || "Failed to resend");
//       }

//       toast({ title: "Code resent", description: "Check your inbox." });
//       setSecondsLeft(50);
//     } catch (err: any) {
//       console.error("[RESEND] Error:", err);
//       toast({
//         title: "Could not resend",
//         description: err?.message,
//         variant: "destructive",
//       });
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
//         {/* Mobile background */}
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
//             to="/signup"
//             className="inline-flex items-center gap-2 text-white/90 text-[18px] mb-12"
//           >
//             <ArrowLeft className="w-7 h-7" />
//             <span>Back</span>
//           </Link>

//           {/* Text */}
//           <div className="text-center px-2 mb-10">
//             <h1 className="text-[22px] leading-[1.35] font-normal text-white">
//               Please enter the OTP sent to
//               <br />
//               {email || "your@email.com"}{" "}
//               <button
//                 onClick={() => navigate("/signup")}
//                 className="text-[#2F80FF] font-medium"
//               >
//                 Change
//               </button>
//             </h1>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSignupVerify} className="space-y-6">
//             <div className="space-y-3">
//               <label htmlFor="otp-mobile" className="text-[18px] text-white">
//                 OTP
//               </label>

//               <Input
//                 id="otp-mobile"
//                 type="text"
//                 inputMode="numeric"
//                 maxLength={4}
//                 value={otp}
//                 onChange={(e) =>
//                   setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
//                 }
//                 required
//                 placeholder="Enter OTP"
//                 className="
//                   h-[78px] w-full rounded-[18px]
//                   bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)]
//                   border border-white/80
//                   text-white text-[24px] tracking-[10px] text-center
//                   placeholder:text-white/45 placeholder:tracking-normal placeholder:text-left
//                   px-7
//                   focus-visible:ring-0 focus:border-white
//                 "
//               />
//             </div>

//             <Button
//               type="submit"
//               disabled={isLoading || otp.length !== 4}
//               className="
//                 w-full h-[80px] rounded-[18px]
//                 text-[24px] font-semibold text-white
//                 disabled:opacity-50
//               "
//               style={{
//                 background:
//                   "linear-gradient(90deg, #FF14EF 0%, #A855F7 50%, #1A73E8 100%)",
//                 boxShadow:
//                   "0 0 22px rgba(255,20,239,0.28), 0 0 30px rgba(26,115,232,0.22)",
//               }}
//             >
//               {isLoading ? "Verifying..." : "Verify"}
//             </Button>
//           </form>

//           {/* Resend / support */}
//           <div className="mt-14 text-center space-y-4">
//             <p className="text-[18px] text-white/90 leading-relaxed">
//               Not received your code?{" "}
//               {secondsLeft > 0 ? (
//                 <span className="text-[#2F80FF] font-medium">
//                   {formatMMSS(secondsLeft)}
//                 </span>
//               ) : (
//                 <button
//                   onClick={handleResend}
//                   className="text-[#2F80FF] font-medium"
//                 >
//                   Resend code
//                 </button>
//               )}
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

//         {/* Desktop layout */}
//         <div className="hidden lg:flex min-h-screen items-center justify-center px-5 sm:px-8 md:px-10">
//           <div className="w-full max-w-[520px]">
//             <div className="mb-6">
//               <Link
//                 to="/signup"
//                 className="inline-flex items-center gap-2 text-white/70 hover:text-white"
//               >
//                 <ChevronLeft className="h-4 w-4" /> Back
//               </Link>
//             </div>

//             <p className="text-[16px] font-normal text-white">
//               Please enter the OTP sent to {email || "your email"}{" "}
//               <button
//                 onClick={() => navigate("/signup")}
//                 className="text-[#1EAEDB] underline underline-offset-4"
//               >
//                 Change
//               </button>
//             </p>

//             <div className="mt-4" />
//             <label htmlFor="otp" className="block text-[16px] text-white/80 mb-2">
//               OTP
//             </label>

//             <form onSubmit={handleSignupVerify} className="space-y-6">
//               <Input
//                 id="otp"
//                 type="text"
//                 inputMode="numeric"
//                 maxLength={4}
//                 value={otp}
//                 onChange={(e) =>
//                   setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
//                 }
//                 required
//                 className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white text-center tracking-[8px]"
//               />
//               <Button
//                 type="submit"
//                 disabled={isLoading || otp.length !== 4}
//                 className="w-full md:w-[350px] h-[50px] rounded-[6px] text-[16px] text-white bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3]"
//               >
//                 {isLoading ? "Verifying..." : "Verify"}
//               </Button>
//             </form>

//             <div className="mt-4">
//               {secondsLeft > 0 ? (
//                 <span>
//                   Not received your code?{" "}
//                   <span className="text-[#1EAEDB]">{formatMMSS(secondsLeft)}</span>
//                 </span>
//               ) : (
//                 <button onClick={handleResend} className="text-[#1EAEDB] underline">
//                   Resend code
//                 </button>
//               )}
//             </div>

//             <p className="mt-6 text-[16px]">
//               Having trouble logging in? Contact us at{" "}
//               <a
//                 href="mailto:support@tokun.ai"
//                 className="text-transparent bg-clip-text bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3] underline"
//               >
//                 support@tokun.ai
//               </a>
//             </p>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }





import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function VerifySignup() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { persistAuth } = useAuth();

  const email = (params.get("email") || "").trim();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(50);


  const [devOtp, setDevOtp] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      toast({
        title: "Missing email",
        description: "Please go back and signup again.",
        variant: "destructive",
      });
      navigate("/signup", { replace: true });
    }
  }, [email, navigate]);


//   useEffect(() => {
//   const stored = sessionStorage.getItem("dev_otp");
//   if (stored) {
//     setDevOtp(stored);
//     sessionStorage.removeItem("dev_otp");
//   }
// }, [])

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const formatMMSS = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleSignupVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 4) return;

    setIsLoading(true);
    try {
      const body = { email, otp };
      console.log("[VERIFY] POST body →", body);

      const resp = await fetch(`${API_BASE}/api/auth/signup/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await resp.json();
      console.log("[VERIFY] Response status:", resp.status);
      console.log("[VERIFY] Response json:", json);

      if (!resp.ok || !json?.success) {
        throw new Error(json?.error || "Verification failed");
      }

      persistAuth(json);

      if (json?.user?.role === "Admin" || json?.user?.userType === "Admin") {
        localStorage.setItem("showAddMemberPopup", "true");
      }

      toast({ title: "Success", description: "Signup complete. Redirecting..." });
      navigate("/smartgen", { replace: true });
    } catch (err: any) {
      console.error("[VERIFY] Error:", err);
      toast({
        title: "Verification failed",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const body = { email };
      console.log("[RESEND] POST body →", body);

      const resp = await fetch(`${API_BASE}/api/auth/signup/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await resp.json();
      console.log("[RESEND] Response status:", resp.status);
      console.log("[RESEND] Response json:", json);

      if (!resp.ok || !json?.success) {
        throw new Error(json?.error || "Failed to resend");
      }

      toast({ title: "Code resent", description: "Check your inbox." });
      setSecondsLeft(50);
    } catch (err: any) {
      console.error("[RESEND] Error:", err);
      toast({
        title: "Could not resend",
        description: err?.message,
        variant: "destructive",
      });
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
          to="/signup"
          className="inline-flex items-center gap-2 text-white/90 text-[16px] mb-7"
          style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>

        {/* Text */}
        <div className="text-center px-2 mb-6">
          <h1
            className="text-[16px] sm:text-[18px] leading-[1.3] font-normal text-white"
            style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
          >
            Please enter the OTP sent to
            <br />
            <span className="break-all">{email || "your@email.com"}</span>{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-[#2F80FF] font-medium"
            >
              Change
            </button>
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSignupVerify} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="otp-mobile"
              className="text-[14px] sm:text-[15px] text-white"
              style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
            >
              OTP
            </label>

            <Input
              id="otp-mobile"
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              required
              placeholder="Enter OTP"
              className="
                h-[56px] sm:h-[60px] w-full rounded-[16px]
                bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)]
                border border-white/80
                text-white text-[18px] sm:text-[20px] tracking-[8px] text-center
                placeholder:text-white/45 placeholder:tracking-normal placeholder:text-left placeholder:text-[14px]
                px-5
                focus-visible:ring-0 focus:border-white
              "
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || otp.length !== 4}
            className="
              w-full h-[56px] sm:h-[60px] rounded-[16px]
              text-[17px] sm:text-[18px] font-semibold text-white
              disabled:opacity-50
            "
            style={{
              background:
                "linear-gradient(90deg, #FF14EF 0%, #A855F7 50%, #1A73E8 100%)",
              boxShadow:
                "0 0 22px rgba(255,20,239,0.28), 0 0 30px rgba(26,115,232,0.22)",
            }}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </form>

        {/* Resend / support */}
        <div className="mt-7 text-center space-y-3">
          <p
            className="text-[14px] sm:text-[15px] text-white/90 leading-relaxed"
            style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
          >
            Not received your code?{" "}
            {secondsLeft > 0 ? (
              <span className="text-[#2F80FF] font-medium">
                {formatMMSS(secondsLeft)}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-[#2F80FF] font-medium"
              >
                Resend code
              </button>
            )}
          </p>

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
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
          </div>

          <p className="text-[16px] font-normal text-white">
            Please enter the OTP sent to {email || "your email"}{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-[#1EAEDB] underline underline-offset-4"
            >
              Change
            </button>
          </p>

          <div className="mt-4" />
          <label htmlFor="otp" className="block text-[16px] text-white/80 mb-2">
            OTP
          </label>

          <form onSubmit={handleSignupVerify} className="space-y-6">
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              required
              className="h-[50px] w-full md:w-[350px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white text-center tracking-[8px]"
            />

            <Button
              type="submit"
              disabled={isLoading || otp.length !== 4}
              className="w-full md:w-[350px] h-[50px] rounded-[6px] text-[16px] text-white bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3]"
            >
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </form>

          <div className="mt-4">
            {secondsLeft > 0 ? (
              <span>
                Not received your code?{" "}
                <span className="text-[#1EAEDB]">{formatMMSS(secondsLeft)}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-[#1EAEDB] underline"
              >
                Resend code
              </button>
            )}
          </div>

          <p className="mt-6 text-[16px]">
            Having trouble logging in? Contact us at{" "}
            <a
              href="mailto:support@tokun.ai"
              className="text-transparent bg-clip-text bg-gradient-to-r from-[#7D4DFF] via-[#A24BFF] to-[#FF2CC3] underline"
            >
              support@tokun.ai
            </a>
          </p>
        </div>
      </div>
    </main>
  </div>
);
}