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
        {/* LEFT - Artwork */}
        <aside className="hidden lg:block basis-[58%] relative overflow-hidden">
          <img
            src="/icons/signup.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Optional dark overlay to match screenshot contrast */}
          <div className="absolute inset-0 bg-black/35" />
        </aside>

        {/* RIGHT - Form */}
        <main className="flex-1 lg:basis-[42%] min-h-screen flex items-center justify-center px-5 sm:px-8 md:px-10">
          <div className="w-full max-w-[520px]">
            {/* Title */}
            <h1 className="text-[44px] leading-[1.1] font-semibold tracking-[-0.02em]">
              Welcome Back
            </h1>
            <p className="mt-2 text-[16px] text-white/70 max-w-[420px]">
              Enter your credentials to manage sellers <br className="hidden sm:block" />
              and products.
            </p>

            {/* Form */}
            <form onSubmit={onSubmit} className="mt-10 space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-[13px] text-white/80">
                  Email address
                </label>

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="
                    h-[54px] w-full
                    rounded-[10px]
                    bg-[#0F1520]
                    border border-[#243045]
                    text-white
                    placeholder:text-white/35
                    focus-visible:ring-0
                    focus:border-[#3A6BFF]/60
                  "
                  placeholder="admin@tokun.ai"
                />
              </div>

              {/* Password + Forgot */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[13px] text-white/80">
                    Password
                  </label>

                 <Link
  to="/admin-forgot-password"
  className="text-[13px] text-[#3A7CFF] hover:underline"
>
  Forgot Password?
</Link>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="
                      h-[54px] w-full pr-12
                      rounded-[10px]
                      bg-[#0F1520]
                      border border-[#243045]
                      text-white
                      placeholder:text-white/35
                      focus-visible:ring-0
                      focus:border-[#3A6BFF]/60
                    "
                    placeholder="Enter password"
                  />

                  {/* eye button */}
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="
                      absolute right-3 top-1/2 -translate-y-1/2
                      h-9 w-9 rounded-md
                      flex items-center justify-center
                      text-white/70 hover:text-white
                      hover:bg-white/5
                    "
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {/* simple eye icon (no dependency) */}
                    {showPw ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3 3l18 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M10.6 10.7a3 3 0 004.2 4.2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M9.9 5.1A11.6 11.6 0 0112 5c6.2 0 10 7 10 7a20.4 20.4 0 01-4.4 5.1"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M6.3 6.3A20.7 20.7 0 002 12s3.8 7 10 7c1 0 1.9-.2 2.8-.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <label className="flex items-center gap-3 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="
                    h-[16px] w-[16px]
                    rounded-[4px]
                    border border-[#3A465F]
                    bg-transparent
                    accent-[#3A6BFF]
                  "
                />
                <span className="text-[14px] text-white/85">
                  Remember this device for 30 days
                </span>
              </label>

              {/* CTA */}
              <button
                type="submit"
                disabled={!isValid || submitting}
                className="
                  w-full h-[54px] rounded-[10px]
                  text-[16px] font-medium text-white
                  bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8]
                  hover:opacity-90
                  disabled:opacity-50 disabled:hover:opacity-50
                  transition
                "
              >
                {submitting ? "Signing in..." : "Sign in"}
              </button>

              {/* Footer links */}
              <div className="pt-6 flex items-center justify-center gap-10 text-[13px] text-white/70">
                <Link to="/help" className="hover:text-white">
                  Help &amp; Support
                </Link>
                <Link to="/privacy" className="hover:text-white">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="hover:text-white">
                  Terms of Service
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLogin;
