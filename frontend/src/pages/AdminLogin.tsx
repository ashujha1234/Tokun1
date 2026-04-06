import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");


const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@tokun.ai");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isValid = useMemo(() => {
    const e = email.trim();
    return e.length > 3 && e.includes("@") && password.trim().length >= 1;
  }, [email, password]);

    //  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!isValid || submitting) return;

  setSubmitting(true);
  try {
    const url = `${API_BASE}/api/admin/auth/login`;

    console.log("[ADMIN LOGIN] → POST", url, { email, remember });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password, remember }),
    });

    const data = await res.json();
    console.log("[ADMIN LOGIN] ← status:", res.status);
    console.log("[ADMIN LOGIN] ← json:", data);

    if (!res.ok || !data?.success) {
      console.error("[ADMIN LOGIN] failed:", data?.error || "Login failed");
      return;
    }

    // TEMP auth flag (until JWT)
    localStorage.setItem("tokun_admin_auth", "true");
    localStorage.setItem("tokun_admin_email", data?.admin?.email || "");

    console.log("✅ ADMIN LOGGED IN:", data?.admin);
      const emailNorm = email.trim().toLowerCase();
localStorage.setItem("tokun_admin_email", emailNorm);
    navigate("/admin/dashboard");
  } catch (err) {
    console.error("[ADMIN LOGIN] error:", err);
  } finally {
    setSubmitting(false);
  }
};

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

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-3">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[13px] text-white/70">Email address</label>
              <Input
                type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tokun.ai"
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

          {/* Footer */}
          <div className="mt-9 text-center">
            <p className="text-[14px] text-white/90">
              Having trouble? {" "}
              <a href="mailto:support@tokun.ai" className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF14EF] to-[#A855F7]">
                support@tokun.ai
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

            <form onSubmit={onSubmit} className="mt-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] text-white/80">Email address</label>
                <Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="h-[54px] w-full rounded-[10px] bg-[#0F1520] border border-[#243045] text-white placeholder:text-white/35 focus-visible:ring-0 focus:border-[#3A6BFF]/60"
                  placeholder="admin@tokun.ai" />
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

              <button type="submit" disabled={!isValid || submitting}
                className="w-full h-[54px] rounded-[10px] text-[16px] font-medium text-white bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90 disabled:opacity-50 transition">
                {submitting ? "Signing in..." : "Sign in"}
              </button>

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

export default AdminLogin;
