// import { useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import { Input } from "@/components/ui/input";

// const AdminForgotPassword = () => {
//   const [email, setEmail] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [sent, setSent] = useState(false);

//   const isValid = useMemo(() => {
//     const e = email.trim();
//     return e.length > 3 && e.includes("@");
//   }, [email]);

//   const onSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!isValid || submitting) return;

//     setSubmitting(true);
//     try {
//       // TODO: integrate API later
//       // await requestResetLink(email)
//       setSent(true);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-[#030406] text-white font-inter">
//       <div className="min-h-screen w-full flex">
//         {/* LEFT - Artwork */}
//         <aside className="hidden lg:block basis-[58%] relative overflow-hidden">
//           <img
//             src="/icons/signup.jpg"
//             alt=""
//             className="absolute inset-0 w-full h-full object-cover"
//           />
//           <div className="absolute inset-0 bg-black/35" />
//         </aside>

//         {/* RIGHT - Form */}
//         <main className="flex-1 lg:basis-[42%] min-h-screen flex items-center justify-center px-5 sm:px-8 md:px-10">
//           <div className="w-full max-w-[520px]">
//             {/* Top Back */}
//             <div className="mb-6">
//               <Link
//                 to="/admin-login"
//                 className="inline-flex items-center gap-2 text-white/70 hover:text-white"
//               >
//                 ← Back to Sign in
//               </Link>
//             </div>

//             {/* Title */}
//             <h1 className="text-[44px] leading-[1.1] font-semibold tracking-[-0.02em]">
//               Forgot Password
//             </h1>
//             <p className="mt-2 text-[16px] text-white/70 max-w-[420px]">
//               Enter your admin email address and we’ll send a password reset link.
//             </p>

//             {/* Form */}
//             <form onSubmit={onSubmit} className="mt-10 space-y-6">
//               {/* Email */}
//               <div className="space-y-2">
//                 <label htmlFor="email" className="text-[13px] text-white/80">
//                   Email address
//                 </label>

//                 <Input
//                   id="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="
//                     h-[54px] w-full
//                     rounded-[10px]
//                     bg-[#0F1520]
//                     border border-[#243045]
//                     text-white
//                     placeholder:text-white/35
//                     focus-visible:ring-0
//                     focus:border-[#3A6BFF]/60
//                   "
//                   placeholder="admin@tokun.world"
//                 />
//               </div>

//               {/* Success message */}
//               {sent && (
//                 <div className="rounded-[10px] border border-white/10 bg-white/5 px-4 py-3">
//                   <p className="text-[14px] text-white/85">
//                     If an account exists for <span className="text-white font-medium">{email}</span>,
//                     you’ll receive a reset link shortly.
//                   </p>
//                 </div>
//               )}

//               {/* CTA */}
//               <button
//                 type="submit"
//                 disabled={!isValid || submitting}
//                 className="
//                   w-full h-[54px] rounded-[10px]
//                   text-[16px] font-medium text-white
//                   bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8]
//                   hover:opacity-90
//                   disabled:opacity-50 disabled:hover:opacity-50
//                   transition
//                 "
//               >
//                 {submitting ? "Sending..." : "Send reset link"}
//               </button>

//               {/* Small help */}
//               <p className="text-[13px] text-white/60">
//                 Didn’t receive it? Check your spam folder or{" "}
//                 <a
//                   href="mailto:support@tokun.world"
//                   className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] underline underline-offset-4"
//                 >
//                   contact support
//                 </a>
//                 .
//               </p>

//               {/* Footer links */}
//               <div className="pt-6 flex items-center justify-center gap-10 text-[13px] text-white/70">
//                 <Link to="/help" className="hover:text-white">
//                   Help &amp; Support
//                 </Link>
//                 <Link to="/privacy" className="hover:text-white">
//                   Privacy Policy
//                 </Link>
//                 <Link to="/terms" className="hover:text-white">
//                   Terms of Service
//                 </Link>
//               </div>
//             </form>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AdminForgotPassword;
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { isValidEmail } from "@/lib/validators";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

/* Kept in step with ADMIN_OTP_LENGTH and the 8-character floor in
   routes/adminRoutes.js. Both are also enforced server-side — these only stop
   a request that is certain to be rejected. */
const CODE_LENGTH = 6;
const MIN_PASSWORD = 8;

const AdminForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  /* Two steps on one screen. "email" asks for the address and sends a code;
     "code" takes that code and the new password.

     Previously this form had a `// TODO: integrate API later` where the request
     should have been — it set `sent` and called nothing — so the page has
     always claimed a reset link was on its way and never sent one. */
  const [step, setStep] = useState<"email" | "code">("email");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  /* Same shared rule as every other form that takes an email — this used to be
     `length > 3 && includes("@")`, which accepts "abc@". */
  const isValid = useMemo(() => isValidEmail(email), [email]);

  /* Under the field, not in a toast: a malformed address left the button dead
     with nothing on screen explaining why. Only once something is typed — an
     empty form is untouched, not wrong. */
  const emailError =
    email.trim() && !isValidEmail(email)
      ? "Enter a complete email address, like you@company.com"
      : null;

  const codeReady = code.trim().length === CODE_LENGTH && newPassword.length >= MIN_PASSWORD;
  const canSubmit = step === "email" ? isValid : codeReady;

  /* The server answers forgot-password identically whether or not the address
     belongs to an admin, so this moves to step 2 either way. That is the point:
     a screen that only advanced for real admin addresses would tell a stranger
     which addresses those are. */
  const requestCode = async () => {
    const res = await fetch(`${API_BASE}/api/admin/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    if (!res.ok && res.status !== 429) throw new Error("Couldn't send the code. Try again.");
    setSent(true);
    setStep("code");
  };

  const submitNewPassword = async () => {
    const res = await fetch(`${API_BASE}/api/admin/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim(), newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success) {
      /* Named errors, in the words of the person reading them. Unlike step 1,
         being here means the caller already holds a code, so saying what was
         wrong with it gives nothing away. */
      const map: Record<string, string> = {
        invalid_code:
          typeof data?.attemptsLeft === "number"
            ? `That code isn't right. ${data.attemptsLeft} attempt${data.attemptsLeft === 1 ? "" : "s"} left.`
            : "That code isn't right.",
        code_expired: "That code has expired. Ask for a new one.",
        too_many_attempts: "Too many wrong codes. Start again.",
        no_reset_in_progress: "That code is no longer valid. Ask for a new one.",
        password_too_short: `Use at least ${MIN_PASSWORD} characters.`,
      };
      throw new Error(map[data?.error] || data?.message || "Couldn't reset the password.");
    }
    setDone(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      if (step === "email") await requestCode();
      else await submitNewPassword();
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* The step-2 fields, rendered inside both the mobile and the desktop form.
     This file already carries the email field twice for the same reason — the
     two layouts are separate trees, not one responsive one. */
  const codeFields = (inputClass: string) =>
    step !== "code" || done ? null : (
      <>
        <div className="space-y-1.5">
          <label className="text-[13px] text-white/70">6-digit code</label>
          <Input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="••••••"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] text-white/70">New password</label>
          <Input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={`At least ${MIN_PASSWORD} characters`}
            className={inputClass}
          />
          {newPassword.length > 0 && newPassword.length < MIN_PASSWORD && (
            <p className="text-[12.5px] text-red-400">Use at least {MIN_PASSWORD} characters.</p>
          )}
        </div>
      </>
    );

  const notice = (textClass: string) =>
    done ? (
      <div className="rounded-[12px] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
        <p className={textClass}>
          Password updated.{" "}
          <Link to="/admin-login" className="underline underline-offset-4 text-white">
            Sign in
          </Link>
          .
        </p>
      </div>
    ) : error ? (
      <div className="rounded-[12px] border border-red-500/30 bg-red-500/10 px-4 py-3">
        <p className={textClass}>{error}</p>
      </div>
    ) : sent ? (
      <div className="rounded-[12px] border border-white/10 bg-white/5 px-4 py-3">
        <p className={textClass}>
          If an admin account exists for <span className="text-white font-medium">{email}</span>, a
          6-digit code is on its way. It expires in 5 minutes.
        </p>
      </div>
    ) : null;

  const buttonLabel = step === "email" ? "Send reset code" : "Set new password";

  return (
    <div className="min-h-screen w-full bg-[#030406] text-white font-inter">
      <div className="min-h-screen w-full flex">

        {/* LEFT - Artwork (desktop only) */}
        <aside className="hidden lg:block basis-[58%] relative overflow-hidden">
          <img loading="lazy" decoding="async" src="/icons/signup.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
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
                  <img loading="lazy" decoding="async" src="/icons/signup.jpg" alt="Tokun AI" className="w-full h-full object-cover pointer-events-none select-none" />
                </div>
                <div style={{ position:"absolute", inset:0, borderRadius:"9999px", pointerEvents:"none", boxShadow:"0 0 32px rgba(255,20,239,0.45), 0 0 60px rgba(26,115,232,0.3)" }} />
              </div>
            </div>

            {/* Back */}
            <Link to="/admin-login" className="inline-flex items-center gap-2 text-white/90 text-[16px] mb-4">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Sign in</span>
            </Link>

            {/* Heading */}
            <div className="text-center px-2 mb-5">
              <h1 className="text-[15px] font-semibold text-white mb-1">Forgot Password?</h1>
              <p className="text-[12px] text-white/50 leading-snug">
                Enter your admin email and we'll send a 6-digit reset code
              </p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[13px] text-white/70">Email address</label>
                <Input
                  type="email" autoComplete="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tokun.world"
                  className="h-[44px] w-full rounded-[12px] bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)] border border-white/20 text-white text-[14px] placeholder:text-white/30 px-4 focus-visible:ring-0 focus:border-white/50"
                />
                {emailError && <p className="text-[12.5px] text-red-400">{emailError}</p>}
              </div>

              {codeFields("h-[44px] w-full rounded-[12px] bg-[linear-gradient(90deg,rgba(18,26,46,0.95)_0%,rgba(11,18,36,0.95)_100%)] border border-white/20 text-white text-[14px] placeholder:text-white/30 px-4 focus-visible:ring-0 focus:border-white/50")}

              {notice("text-[13px] text-white/85")}

              {/* Submit */}
              <button
                type="submit" disabled={!canSubmit || submitting || done}
                className="w-full h-[44px] rounded-[12px] text-[14px] font-semibold text-white disabled:opacity-40 transition-opacity"
                style={{ background: "linear-gradient(90deg, #FF14EF 0%, #A855F7 50%, #1A73E8 100%)" }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Sending...
                  </span>
                ) : buttonLabel}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-9 text-center space-y-2">
              <p className="text-[13px] text-white/60">
                Didn't receive it? Check spam or{" "}
                <a href="mailto:support@tokun.world" className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF14EF] to-[#A855F7]">
                  contact support
                </a>
              </p>
            </div>
          </div>

          {/* ====== DESKTOP LAYOUT (unchanged) ====== */}
          <div className="hidden lg:flex min-h-screen items-center justify-center px-5 sm:px-8 md:px-10">
            <div className="w-full max-w-[520px]">
              <div className="mb-6">
                <Link to="/admin-login" className="inline-flex items-center gap-2 text-white/70 hover:text-white">
                  ← Back to Sign in
                </Link>
              </div>

              <h1 className="text-[44px] leading-[1.1] font-semibold tracking-[-0.02em]">Forgot Password</h1>
              <p className="mt-2 text-[16px] text-white/70 max-w-[420px]">
                Enter your admin email address and we'll send a 6-digit password reset code.
              </p>

              <form onSubmit={onSubmit} className="mt-10 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[13px] text-white/80">Email address</label>
                  <Input
                    id="email" type="email" autoComplete="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="h-[54px] w-full rounded-[10px] bg-[#0F1520] border border-[#243045] text-white placeholder:text-white/35 focus-visible:ring-0 focus:border-[#3A6BFF]/60"
                    placeholder="admin@tokun.world"
                  />
                  {emailError && <p className="text-[12.5px] text-red-400">{emailError}</p>}
                </div>

                {codeFields("h-[54px] w-full rounded-[10px] bg-[#0F1520] border border-[#243045] text-white placeholder:text-white/35 focus-visible:ring-0 focus:border-[#3A6BFF]/60")}

                {notice("text-[14px] text-white/85")}

                <button
                  type="submit" disabled={!canSubmit || submitting || done}
                  className="w-full h-[54px] rounded-[10px] text-[16px] font-medium text-white bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90 disabled:opacity-50 transition"
                >
                  {submitting ? "Sending..." : buttonLabel}
                </button>

                <p className="text-[13px] text-white/60">
                  Didn't receive it? Check your spam folder or{" "}
                  <a href="mailto:support@tokun.world" className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] underline underline-offset-4">
                    contact support
                  </a>.
                </p>

                <div className="pt-6 flex items-center justify-center gap-10 text-[13px] text-white/70">
                  <Link to="/help" className="hover:text-white">Help &amp; Support</Link>
                  <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
                  <Link to="/terms" className="hover:text-white">Terms of Service</Link>
                </div>
              </form>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminForgotPassword;