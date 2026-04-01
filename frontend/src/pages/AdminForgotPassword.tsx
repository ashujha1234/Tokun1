import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";

const AdminForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const isValid = useMemo(() => {
    const e = email.trim();
    return e.length > 3 && e.includes("@");
  }, [email]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    try {
      // TODO: integrate API later
      // await requestResetLink(email)
      setSent(true);
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
          <div className="absolute inset-0 bg-black/35" />
        </aside>

        {/* RIGHT - Form */}
        <main className="flex-1 lg:basis-[42%] min-h-screen flex items-center justify-center px-5 sm:px-8 md:px-10">
          <div className="w-full max-w-[520px]">
            {/* Top Back */}
            <div className="mb-6">
              <Link
                to="/admin-login"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white"
              >
                ← Back to Sign in
              </Link>
            </div>

            {/* Title */}
            <h1 className="text-[44px] leading-[1.1] font-semibold tracking-[-0.02em]">
              Forgot Password
            </h1>
            <p className="mt-2 text-[16px] text-white/70 max-w-[420px]">
              Enter your admin email address and we’ll send a password reset link.
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

              {/* Success message */}
              {sent && (
                <div className="rounded-[10px] border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[14px] text-white/85">
                    If an account exists for <span className="text-white font-medium">{email}</span>,
                    you’ll receive a reset link shortly.
                  </p>
                </div>
              )}

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
                {submitting ? "Sending..." : "Send reset link"}
              </button>

              {/* Small help */}
              <p className="text-[13px] text-white/60">
                Didn’t receive it? Check your spam folder or{" "}
                <a
                  href="mailto:support@tokun.ai"
                  className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] underline underline-offset-4"
                >
                  contact support
                </a>
                .
              </p>

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

export default AdminForgotPassword;
