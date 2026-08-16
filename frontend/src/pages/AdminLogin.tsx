// import { useMemo, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Input } from "@/components/ui/input";

// const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");


// const AdminLogin = () => {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("admin@tokun.world");
//   const [password, setPassword] = useState("");
//   const [showPw, setShowPw] = useState(false);
//   const [remember, setRemember] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   const isValid = useMemo(() => {
//     const e = email.trim();
//     return e.length > 3 && e.includes("@") && password.trim().length >= 1;
//   }, [email, password]);

//     //  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// const onSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   if (!isValid || submitting) return;

//   setSubmitting(true);
//   try {
//     const url = `${API_BASE}/api/admin/auth/login`;

//     console.log("[ADMIN LOGIN] → POST", url, { email, remember });

//     const res = await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email: email.trim().toLowerCase(), password, remember }),
//     });

//     const data = await res.json();
//     console.log("[ADMIN LOGIN] ← status:", res.status);
//     console.log("[ADMIN LOGIN] ← json:", data);

//     if (!res.ok || !data?.success) {
//       console.error("[ADMIN LOGIN] failed:", data?.error || "Login failed");
//       return;
//     }

//     // TEMP auth flag (until JWT)
//     localStorage.setItem("tokun_admin_auth", "true");
//     localStorage.setItem("tokun_admin_email", data?.admin?.email || "");

//     console.log("✅ ADMIN LOGGED IN:", data?.admin);
//       const emailNorm = email.trim().toLowerCase();
// localStorage.setItem("tokun_admin_email", emailNorm);
//     navigate("/admin/dashboard");
//   } catch (err) {
//     console.error("[ADMIN LOGIN] error:", err);
//   } finally {
//     setSubmitting(false);
//   }
// };

// return (
//   <div className="min-h-screen w-full bg-[#030406] text-white font-inter">
//     <div className="min-h-screen w-full flex">

//       {/* LEFT - Artwork (desktop only) */}
//       <aside className="hidden lg:block basis-[58%] relative overflow-hidden">
//         <img src="/icons/signup.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
//         <div className="absolute inset-0 bg-black/35" />
//       </aside>

//       {/* RIGHT */}
//       <main className="flex-1 lg:basis-[42%] min-h-screen relative overflow-hidden">

//         {/* ====== MOBILE LAYOUT ====== */}
//         <div className="lg:hidden relative z-10 min-h-screen px-6 pt-4 pb-8 flex flex-col bg-black">

//           <style>{`
//             @keyframes spin-ring { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
//             @keyframes spin-img  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
//           `}</style>

//           {/* Revolving image */}
//           <div className="flex justify-center mb-5 mt-10">
//             <div className="relative w-28 h-28">
//               <div style={{ position:"absolute", inset:0, borderRadius:"9999px", background:"conic-gradient(from 0deg, #FF14EF, #A855F7, #1A73E8, #FF14EF)", animation:"spin-ring 4s linear infinite", padding:3 }}>
//                 <div style={{ width:"100%", height:"100%", borderRadius:"9999px", background:"#000" }} />
//               </div>
//               <div style={{ position:"absolute", inset:4, borderRadius:"9999px", overflow:"hidden", animation:"spin-img 8s linear infinite" }}>
//                 <img src="/icons/signup.png" alt="Tokun AI" className="w-full h-full object-cover pointer-events-none select-none" />
//               </div>
//               <div style={{ position:"absolute", inset:0, borderRadius:"9999px", pointerEvents:"none", boxShadow:"0 0 32px rgba(255,20,239,0.45), 0 0 60px rgba(26,115,232,0.3)" }} />
//             </div>
//           </div>

//           {/* Heading */}
//           <div className="text-center px-2 mb-5">
//             <h1 className="text-[15px] font-semibold text-white mb-1">Welcome Back 👋</h1>
//             <p className="text-[12px] text-white/50 leading-snug">Enter your admin credentials to continue</p>
//           </div>

//           {/* Form */}
//           <form onSubmit={onSubmit} className="space-y-3">

//             {/* Email */}
//             <div className="space-y-1.5">
//               <label className="text-[13px] text-white/70">Email address</label>
//               <Input
//                 type="email" autoComplete="email" required
//                 value={email} onChange={(e) => setEmail(e.target.value)}
//                 placeholder="admin@tokun.world"
//                 className="h-[44px] w-full rounded-[12px] bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)] border border-white/20 text-white text-[14px] placeholder:text-white/30 px-4 focus-visible:ring-0 focus:border-white/50"
//               />
//             </div>

//             {/* Password */}
//             <div className="space-y-1.5">
//               <div className="flex items-center justify-between">
//                 <label className="text-[13px] text-white/70">Password</label>
//                 <Link to="/admin-forgot-password" className="text-[13px] text-[#3A7CFF] hover:underline">Forgot Password?</Link>
//               </div>
//               <div className="relative">
//                 <Input
//                   type={showPw ? "text" : "password"} autoComplete="current-password" required
//                   value={password} onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Enter password"
//                   className="h-[44px] w-full pr-12 rounded-[12px] bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)] border border-white/20 text-white text-[14px] placeholder:text-white/30 px-4 focus-visible:ring-0 focus:border-white/50"
//                 />
//                 <button type="button" onClick={() => setShowPw(v => !v)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5">
//                   {showPw ? (
//                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                       <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
//                       <path d="M10.6 10.7a3 3 0 004.2 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
//                       <path d="M9.9 5.1A11.6 11.6 0 0112 5c6.2 0 10 7 10 7a20.4 20.4 0 01-4.4 5.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
//                       <path d="M6.3 6.3A20.7 20.7 0 002 12s3.8 7 10 7c1 0 1.9-.2 2.8-.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
//                     </svg>
//                   ) : (
//                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                       <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="2"/>
//                       <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2"/>
//                     </svg>
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Remember */}
//             <label className="flex items-center gap-3 select-none">
//               <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
//                 className="h-[16px] w-[16px] rounded-[4px] border border-[#3A465F] bg-transparent accent-[#3A6BFF]" />
//               <span className="text-[13px] text-white/85">Remember this device for 30 days</span>
//             </label>

//             {/* Submit */}
//             <button type="submit" disabled={!isValid || submitting}
//               className="w-full h-[44px] rounded-[12px] text-[14px] font-semibold text-white disabled:opacity-40 transition-opacity"
//               style={{ background: "linear-gradient(90deg, #FF14EF 0%, #A855F7 50%, #1A73E8 100%)" }}>
//               {submitting ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
//                   </svg>
//                   Signing in...
//                 </span>
//               ) : "Sign in"}
//             </button>
//           </form>

//           {/* Footer */}
//           <div className="mt-9 text-center">
//             <p className="text-[14px] text-white/90">
//               Having trouble? {" "}
//               <a href="mailto:support@tokun.world" className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF14EF] to-[#A855F7]">
//                 support@tokun.world
//               </a>
//             </p>
//           </div>
//         </div>

//         {/* ====== DESKTOP LAYOUT (unchanged) ====== */}
//         <div className="hidden lg:flex min-h-screen items-center justify-center px-5 sm:px-8 md:px-10">
//           <div className="w-full max-w-[520px]">
//             <h1 className="text-[44px] leading-[1.1] font-semibold tracking-[-0.02em]">Welcome Back</h1>
//             <p className="mt-2 text-[16px] text-white/70 max-w-[420px]">
//               Enter your credentials to manage sellers <br className="hidden sm:block" /> and products.
//             </p>

//             <form onSubmit={onSubmit} className="mt-10 space-y-6">
//               <div className="space-y-2">
//                 <label className="text-[13px] text-white/80">Email address</label>
//                 <Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
//                   className="h-[54px] w-full rounded-[10px] bg-[#0F1520] border border-[#243045] text-white placeholder:text-white/35 focus-visible:ring-0 focus:border-[#3A6BFF]/60"
//                   placeholder="admin@tokun.world" />
//               </div>

//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <label className="text-[13px] text-white/80">Password</label>
//                   <Link to="/admin-forgot-password" className="text-[13px] text-[#3A7CFF] hover:underline">Forgot Password?</Link>
//                 </div>
//                 <div className="relative">
//                   <Input type={showPw ? "text" : "password"} autoComplete="current-password" required
//                     value={password} onChange={(e) => setPassword(e.target.value)}
//                     className="h-[54px] w-full pr-12 rounded-[10px] bg-[#0F1520] border border-[#243045] text-white placeholder:text-white/35 focus-visible:ring-0 focus:border-[#3A6BFF]/60"
//                     placeholder="Enter password" />
//                   <button type="button" onClick={() => setShowPw(v => !v)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5">
//                     {showPw ? (
//                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                         <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
//                         <path d="M10.6 10.7a3 3 0 004.2 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
//                         <path d="M9.9 5.1A11.6 11.6 0 0112 5c6.2 0 10 7 10 7a20.4 20.4 0 01-4.4 5.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
//                         <path d="M6.3 6.3A20.7 20.7 0 002 12s3.8 7 10 7c1 0 1.9-.2 2.8-.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
//                       </svg>
//                     ) : (
//                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                         <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="2"/>
//                         <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2"/>
//                       </svg>
//                     )}
//                   </button>
//                 </div>
//               </div>

//               <label className="flex items-center gap-3 select-none">
//                 <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
//                   className="h-[16px] w-[16px] rounded-[4px] border border-[#3A465F] bg-transparent accent-[#3A6BFF]" />
//                 <span className="text-[14px] text-white/85">Remember this device for 30 days</span>
//               </label>

//               <button type="submit" disabled={!isValid || submitting}
//                 className="w-full h-[54px] rounded-[10px] text-[16px] font-medium text-white bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90 disabled:opacity-50 transition">
//                 {submitting ? "Signing in..." : "Sign in"}
//               </button>

//               <div className="pt-6 flex items-center justify-center gap-10 text-[13px] text-white/70">
//                 <Link to="/help" className="hover:text-white">Help &amp; Support</Link>
//                 <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
//                 <Link to="/terms" className="hover:text-white">Terms of Service</Link>
//               </div>
//             </form>
//           </div>
//         </div>

//       </main>
//     </div>
//   </div>
// );
// };

// export default AdminLogin;


import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@tokun.world");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* Sign-in is two steps now: the password gets a code emailed, the code gets
     the session. `challengeToken` is what proves step 1 happened — without it
     the verify endpoint refuses, so nobody can grind codes against an address
     whose password they don't have. Its presence is also what switches this
     screen from the password form to the code form. */
  const [challengeToken, setChallengeToken] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  /* Errors used to go to console.error only, so a wrong password looked like a
     button that did nothing. Every failure below is now on screen. */
  const [error, setError] = useState<string | null>(null);

  // Resend cooldown, matching the server's own 60s per-account limit.
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  const isValid = useMemo(() => {
    const e = email.trim();
    return e.length > 3 && e.includes("@") && password.trim().length >= 1;
  }, [email, password]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const url = `${API_BASE}/api/admin/auth/login`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, remember }),
      });

      /* These three lines used to log the URL, the admin's email, the HTTP
         status and the ENTIRE response body — which, before the OTP step
         existed, included the admin session token itself. Removed from the
         source rather than left to the console silencer: anyone who turns
         debugging back on should not get an admin token printed for them. */
      const data = await res.json();

      if (!res.ok || !data?.success) {
        setError(data?.message || data?.error || "Login failed");
        return;
      }

      /* BUG 2 guard — an older server still answers this call with a token and
         no challenge. The frontend then waited for a challenge that was never
         coming and the screen sat there doing nothing, which looks exactly like
         a dead button. Signing them in on that response instead would silently
         skip the second factor, so it says what's actually wrong. */
      if (!data.challengeToken) {
        setError(
          data?.token
            ? "The server is running an older build that skips the login code. Restart the API and try again."
            : "The server didn't send a login code. Try again in a moment."
        );
        return;
      }

      /* No token at this step, by design. What comes back is a challenge and a
         code in the admin's inbox. */
      setChallengeToken(data.challengeToken);
      setSentTo(data.sentTo || "");
      setResendIn(60);
      setPassword("");
    } catch (err) {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /** Step 2 — the code. This is what returns the admin session. */
  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifying || otp.trim().length < 6) return;

    setVerifying(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken, otp: otp.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        setError(data?.message || data?.error || "That code didn't work.");
        // An expired or burned challenge means starting over, so send them back
        // to the password rather than leaving them typing into a dead form.
        if (data?.error === "challenge_expired" || data?.error === "otp_attempts_exceeded") {
          setChallengeToken("");
          setOtp("");
        }
        return;
      }

      if (data?.token) localStorage.setItem("tokun_admin_token", data.token);
      localStorage.setItem("tokun_admin_id", String(data?.admin?.id || ""));
      localStorage.setItem("tokun_admin_email", data?.admin?.email || email.trim().toLowerCase());
      localStorage.setItem("tokun_admin_auth", "true");

      navigate("/admin/dashboard");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setVerifying(false);
    }
  };

  const resendOtp = async () => {
    if (resendIn > 0) return;
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setError(data?.message || "Couldn't send another code.");
        return;
      }
      setResendIn(60);
    } catch {
      setError("Couldn't send another code.");
    }
  };

  /* The code form. Rendered in place of the password form in both the mobile
     and desktop layouts below, so the two can't drift apart. */
  const OtpStep = () => (
    <form onSubmit={verifyOtp} className="space-y-4">
      <div>
        <label className="text-[13px] text-white/70">Enter the 6-digit code</label>
        <p className="mt-1 text-[12px] text-white/40">
          Sent to {sentTo || "your admin email"}. It expires in 5 minutes.
        </p>
      </div>

      <Input
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        placeholder="000000"
        className="h-[52px] w-full rounded-[12px] bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)] border border-white/20 text-white text-center text-[22px] tracking-[0.5em] placeholder:text-white/20 focus-visible:ring-0 focus:border-white/50"
      />

      {error && <p className="text-[12.5px] text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={otp.length < 6 || verifying}
        className="w-full h-[44px] rounded-[12px] text-[14px] font-semibold text-white disabled:opacity-40 transition-opacity"
        style={{ background: "linear-gradient(90deg, #FF14EF 0%, #A855F7 50%, #1A73E8 100%)" }}
      >
        {verifying ? "Verifying…" : "Verify and sign in"}
      </button>

      <div className="flex items-center justify-between text-[12.5px]">
        <button
          type="button"
          onClick={() => {
            setChallengeToken("");
            setOtp("");
            setError(null);
          }}
          className="text-white/50 hover:text-white/80"
        >
          ← Use a different account
        </button>
        <button
          type="button"
          onClick={resendOtp}
          disabled={resendIn > 0}
          className="text-[#3A7CFF] hover:underline disabled:text-white/25 disabled:no-underline"
        >
          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen w-full bg-[#030406] text-white font-inter">
      <div className="min-h-screen w-full flex">

        {/* LEFT - Artwork (desktop only) */}
        <aside className="hidden lg:block basis-[58%] relative overflow-hidden">
          <img src="/icons/signup.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/35" />
        </aside>

        {/* RIGHT */}
        <main className="flex-1 lg:basis-[42%] min-h-screen relative overflow-hidden">

          {/* ====== MOBILE LAYOUT ====== */}
          <div className="lg:hidden relative z-10 min-h-screen px-6 pt-4 pb-8 flex flex-col bg-black">

            <style>{`
              @keyframes spin-ring { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              @keyframes spin-img  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            {/* Revolving image */}
            <div className="flex justify-center mb-5 mt-10">
              <div className="relative w-28 h-28">
                <div style={{ position:"absolute", inset:0, borderRadius:"9999px", background:"conic-gradient(from 0deg, #FF14EF, #A855F7, #1A73E8, #FF14EF)", animation:"spin-ring 4s linear infinite", padding:3 }}>
                  <div style={{ width:"100%", height:"100%", borderRadius:"9999px", background:"#000" }} />
                </div>
                <div style={{ position:"absolute", inset:4, borderRadius:"9999px", overflow:"hidden", animation:"spin-img 8s linear infinite" }}>
                  <img src="/icons/signup.png" alt="Tokun AI" className="w-full h-full object-cover pointer-events-none select-none" />
                </div>
                <div style={{ position:"absolute", inset:0, borderRadius:"9999px", pointerEvents:"none", boxShadow:"0 0 32px rgba(255,20,239,0.45), 0 0 60px rgba(26,115,232,0.3)" }} />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center px-2 mb-5">
              <h1 className="text-[15px] font-semibold text-white mb-1">Welcome Back 👋</h1>
              <p className="text-[12px] text-white/50 leading-snug">Enter your admin credentials to continue</p>
            </div>

            {/* Form — password first, then the code. */}
            {challengeToken ? <OtpStep /> : (
            <form onSubmit={onSubmit} className="space-y-3">

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[13px] text-white/70">Email address</label>
                <Input
                  type="email" autoComplete="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tokun.world"
                  className="h-[44px] w-full rounded-[12px] bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)] border border-white/20 text-white text-[14px] placeholder:text-white/30 px-4 focus-visible:ring-0 focus:border-white/50"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] text-white/70">Password</label>
                  <Link to="/admin-forgot-password" className="text-[13px] text-[#3A7CFF] hover:underline">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"} autoComplete="current-password" required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="h-[44px] w-full pr-12 rounded-[12px] bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)] border border-white/20 text-white text-[14px] placeholder:text-white/30 px-4 focus-visible:ring-0 focus:border-white/50"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5">
                    {showPw ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M10.6 10.7a3 3 0 004.2 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M9.9 5.1A11.6 11.6 0 0112 5c6.2 0 10 7 10 7a20.4 20.4 0 01-4.4 5.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M6.3 6.3A20.7 20.7 0 002 12s3.8 7 10 7c1 0 1.9-.2 2.8-.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <label className="flex items-center gap-3 select-none">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                  className="h-[16px] w-[16px] rounded-[4px] border border-[#3A465F] bg-transparent accent-[#3A6BFF]" />
                <span className="text-[13px] text-white/85">Remember this device for 30 days</span>
              </label>

              {/* Whatever went wrong on this step — wrong password, locked account,
                  rate limited, code couldn't be sent. Until now setError() was
                  called and nothing rendered it, so a failed sign-in looked
                  like a button that did nothing at all. */}
              {error && (
                <p className="text-[12.5px] text-red-400" role="alert">{error}</p>
              )}
              {/* Submit */}
              <button type="submit" disabled={!isValid || submitting}
                className="w-full h-[44px] rounded-[12px] text-[14px] font-semibold text-white disabled:opacity-40 transition-opacity"
                style={{ background: "linear-gradient(90deg, #FF14EF 0%, #A855F7 50%, #1A73E8 100%)" }}>
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign in"}
              </button>
            </form>
            )}

            {/* Footer */}
            <div className="mt-9 text-center">
              <p className="text-[14px] text-white/90">
                Having trouble? {" "}
                <a href="mailto:support@tokun.world" className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF14EF] to-[#A855F7]">
                  support@tokun.world
                </a>
              </p>
            </div>
          </div>

          {/* ====== DESKTOP LAYOUT (unchanged) ====== */}
          <div className="hidden lg:flex min-h-screen items-center justify-center px-5 sm:px-8 md:px-10">
            <div className="w-full max-w-[520px]">
              <h1 className="text-[44px] leading-[1.1] font-semibold tracking-[-0.02em]">Welcome Back</h1>
              <p className="mt-2 text-[16px] text-white/70 max-w-[420px]">
                Enter your credentials to manage sellers <br className="hidden sm:block" /> and products.
              </p>

              {challengeToken ? <div className="mt-10"><OtpStep /></div> : (
              <form onSubmit={onSubmit} className="mt-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] text-white/80">Email address</label>
                  <Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="h-[54px] w-full rounded-[10px] bg-[#0F1520] border border-[#243045] text-white placeholder:text-white/35 focus-visible:ring-0 focus:border-[#3A6BFF]/60"
                    placeholder="admin@tokun.world" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] text-white/80">Password</label>
                    <Link to="/admin-forgot-password" className="text-[13px] text-[#3A7CFF] hover:underline">Forgot Password?</Link>
                  </div>
                  <div className="relative">
                    <Input type={showPw ? "text" : "password"} autoComplete="current-password" required
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      className="h-[54px] w-full pr-12 rounded-[10px] bg-[#0F1520] border border-[#243045] text-white placeholder:text-white/35 focus-visible:ring-0 focus:border-[#3A6BFF]/60"
                      placeholder="Enter password" />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5">
                      {showPw ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M10.6 10.7a3 3 0 004.2 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M9.9 5.1A11.6 11.6 0 0112 5c6.2 0 10 7 10 7a20.4 20.4 0 01-4.4 5.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M6.3 6.3A20.7 20.7 0 002 12s3.8 7 10 7c1 0 1.9-.2 2.8-.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-3 select-none">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                    className="h-[16px] w-[16px] rounded-[4px] border border-[#3A465F] bg-transparent accent-[#3A6BFF]" />
                  <span className="text-[14px] text-white/85">Remember this device for 30 days</span>
                </label>

                {/* Same reason as the mobile form: a failure here had nowhere
                    to show itself. */}
                {error && (
                  <p className="text-[13px] text-red-400" role="alert">{error}</p>
                )}

                <button type="submit" disabled={!isValid || submitting}
                  className="w-full h-[54px] rounded-[10px] text-[16px] font-medium text-white bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90 disabled:opacity-50 transition">
                  {submitting ? "Sending code..." : "Sign in"}
                </button>

                <div className="pt-6 flex items-center justify-center gap-10 text-[13px] text-white/70">
                  <Link to="/help" className="hover:text-white">Help &amp; Support</Link>
                  <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
                  <Link to="/terms" className="hover:text-white">Terms of Service</Link>
                </div>
              </form>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminLogin;