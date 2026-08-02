import { useEffect, useState } from "react";

const CONSENT_KEY = "tokun_cookie_consent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem(CONSENT_KEY);
    if (!existing) setVisible(true);
  }, []);

  const choose = (value: "accepted" | "rejected") => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-6 sm:bottom-6 z-[9999] w-auto sm:w-[380px] rounded-2xl border border-white/10 bg-[#0d0d10] p-5 shadow-2xl backdrop-blur-md"
    >
      <h3 className="text-white font-semibold text-[15px]">We use cookies</h3>
      <p className="mt-2 text-white/60 text-[13px] leading-relaxed">
        Cookies are small text files that websites store on a user&apos;s browser to
        remember information about them. We use them to keep you logged in,
        remember your preferences, and improve your experience. See our{" "}
        <a href="/privacy-policy" className="underline hover:text-white">
          Privacy Policy
        </a>{" "}
        for details.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => choose("accepted")}
          className="flex-1 h-10 rounded-full border border-white/25 text-white text-[13px] font-medium hover:bg-white/10 transition-colors"
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={() => choose("rejected")}
          className="flex-1 h-10 rounded-full border border-white/25 text-white text-[13px] font-medium hover:bg-white/10 transition-colors"
        >
          Reject all
        </button>
      </div>
    </div>
  );
}
