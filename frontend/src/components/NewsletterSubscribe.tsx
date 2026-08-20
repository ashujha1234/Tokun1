import { useId, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { isValidEmail } from "@/lib/validators";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

/**
 * The newsletter sign-up, once, wherever it appears.
 *
 * There were two of these and only one of them worked. The footer's had state, a
 * real POST and a status line; the blog page's was a styled input beside a
 * styled button with **no value, no onChange and no onClick at all** — pressing
 * Subscribe there did nothing whatsoever, and nothing on screen said so. Anyone
 * who used it walked away believing they had signed up.
 *
 * SUCCESS IS A STATE, NOT A SENTENCE. Even where it did work, confirmation was a
 * line of small text under the field while the form sat there still offering to
 * subscribe you — which reads as "nothing happened, try again", and pressing it
 * again is how people end up unsure whether it worked at all. Here the form is
 * REPLACED by a confirmation naming the address it went to, so the thing that
 * changed on screen is the thing you were asking about.
 */


type State = "idle" | "sending" | "done" | "error";

export default function NewsletterSubscribe({
  source,
  layout = "inline",
  label,
  className = "",
}: {
  /** Which form this was, recorded with the subscription. */
  source: string;
  /** "inline" — the footer's compact row. "hero" — the blog's centred CTA. */
  layout?: "inline" | "hero";
  /** Visible label above the field. Omitted on the hero layout, which has a heading. */
  label?: string;
  className?: string;
}) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");
  const [confirmedFor, setConfirmedFor] = useState("");

  const hero = layout === "hero";
  const canSubmit = state !== "sending" && isValidEmail(email);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const value = email.trim();
    setState("sending");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        setState("error");
        setMessage(data?.message || "Couldn't subscribe you. Please try again.");
        return;
      }

      setState("done");
      setMessage(data.message || "You're subscribed. We'll keep you posted.");
      // Kept so the confirmation can name it — `email` itself is cleared, and an
      // address the person can read back is what makes this feel finished.
      setConfirmedFor(value);
      setEmail("");
    } catch {
      setState("error");
      setMessage("Network error — please try again.");
    }
  };

  /* Done: the form is gone and this is in its place. */
  if (state === "done") {
    return (
      <div
        role="status"
        className={`flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] px-4 py-3 ${
          hero ? "justify-center max-w-xl mx-auto" : ""
        } ${className}`}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-400/15">
          <Check className="h-4 w-4 text-emerald-300" />
        </span>
        <div className={hero ? "text-center sm:text-left" : ""}>
          <p className="text-sm font-medium text-emerald-200">{message}</p>
          {confirmedFor && (
            <p className="text-[12px] text-emerald-200/70 mt-0.5 break-all">
              Confirmation sent to {confirmedFor}
            </p>
          )}
        </div>
      </div>
    );
  }

  const fieldClass = hero
    ? "w-full sm:flex-1 h-12 px-5 rounded-full bg-transparent border border-white/20 text-white placeholder:text-white/45 outline-none transition-colors focus:border-white/40"
    : "w-full sm:flex-1 h-11 px-4 rounded-full bg-white/[0.04] border border-white/15 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#FF14EF]/60 focus:bg-white/[0.06]";

  return (
    <form
      onSubmit={submit}
      className={`${hero ? "max-w-xl mx-auto" : ""} ${className}`}
      noValidate
    >
      {label && (
        <label htmlFor={id} className="block text-[11px] uppercase tracking-wide text-white/45 mb-2">
          {label}
        </label>
      )}

      <div className={`flex flex-col sm:flex-row gap-3 ${hero ? "items-center justify-center" : "gap-2.5"}`}>
        <input
          id={id}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state !== "idle") setState("idle");
          }}
          placeholder="you@example.com"
          aria-invalid={state === "error"}
          aria-describedby={message ? `${id}-msg` : undefined}
          className={fieldClass}
        />

        <button
          type="submit"
          /* Off until the address could actually be one. It used to enable on
             any non-empty value, so "abc" was submittable and the only way to
             learn otherwise was a round-trip that came back refusing it. */
          disabled={!canSubmit}
          className={
            hero
              ? "w-full sm:w-auto h-12 px-6 rounded-full text-white font-medium inline-flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed"
              : "w-full sm:w-auto h-11 px-6 rounded-full bg-white text-black font-medium inline-flex items-center justify-center gap-2 hover:bg-white/90 disabled:opacity-45 disabled:cursor-not-allowed"
          }
          style={hero ? { background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" } : undefined}
        >
          {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
          {state === "sending" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>

      {/* Only errors reach this now — success has taken the form's place above. */}
      {message && state === "error" && (
        <p
          id={`${id}-msg`}
          role="status"
          className={`mt-2.5 text-xs text-red-400 ${hero ? "text-center" : ""}`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
