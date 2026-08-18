/**
 * Server error codes → something a person can act on.
 *
 * Every auth screen used to do this:
 *
 *     throw new Error(data?.error || "Could not send OTP. Please try again.");
 *     …
 *     toast({ title: "Login failed", description: err?.message });
 *
 * `data.error` is a machine code, so what actually reached the toast was
 * "no_account_or_not_verified", "temporarily_locked", "too_many_requests",
 * "name_and_email_required". Four screens, all doing it, all showing the
 * database's vocabulary to whoever was trying to sign in.
 *
 * Two rules for the copy here:
 *
 *   The title says what happened, in the reader's terms. Not "Login failed" for
 *   every case — that is the one thing they already know.
 *
 *   The description says what to do next. If there is nothing to do, it says
 *   what will happen instead. No apologies, and no "something went wrong",
 *   which is the same as saying nothing.
 */

export type AuthErrorText = { title: string; description: string };

/* Keyed by the exact code strings in server/routes/authRoutes.js. Anything not
   listed falls through to the generic entry at the bottom, so a new server code
   degrades to a usable message instead of leaking its own name. */
const MESSAGES: Record<string, AuthErrorText> = {
  /* ── the address itself ── */
  invalid_email_format: {
    title: "Check the email address",
    description: "That doesn't look like a complete address — it needs an @ and a domain, like you@example.com.",
  },
  domain_has_no_mail_server: {
    title: "That domain can't receive email",
    description: "We looked it up and it has no mail server, so the code would never arrive. Check the part after the @.",
  },
  email_required: {
    title: "Enter your email address",
    description: "We send the sign-in code there.",
  },
  name_and_email_required: {
    title: "Enter your name and email",
    description: "Both are needed to create your account.",
  },
  email_and_otp_required: {
    title: "Enter the code",
    description: "Type the 4-digit code from your email to continue.",
  },

  /* ── the account ── */
  no_account_or_not_verified: {
    title: "No verified account with that email",
    description: "Sign up first, or check the address — an account that never confirmed its code can't sign in yet.",
  },
  account_deleted: {
    title: "This account has been closed",
    description: "Contact support if you think that's a mistake, or sign up again with this address.",
  },

  /* ── the code ── */
  invalid_otp: {
    title: "That code isn't right",
    description: "Check the 4 digits in your email and try again. Codes expire after 5 minutes.",
  },
  otp_expired: {
    title: "That code has expired",
    description: "Codes last 5 minutes. Tap Resend to get a fresh one.",
  },
  invalid_or_expired_otp: {
    title: "That code isn't right, or it's expired",
    description: "Codes last 5 minutes. Check the digits, or tap Resend to get a new one.",
  },
  temporarily_locked: {
    title: "Too many wrong codes",
    description: "Sign-in is paused on this account for a few minutes. Try again shortly.",
  },

  /* ── rate limiting ── */
  too_many_requests: {
    title: "Too many code requests",
    description: "We allow 5 in 10 minutes per address, to stop inboxes being spammed. Try again in 10 minutes.",
  },

  /* ── the fallback ── */
  server_error: {
    title: "That didn't go through",
    description: "Something failed on our side, not yours. Try again in a moment.",
  },
};

const GENERIC: AuthErrorText = {
  title: "That didn't go through",
  description: "Try again in a moment. If it keeps happening, contact support.",
};

/**
 * @param code       the server's `error` field, or an already-human message
 * @param suggestion `likely_typo_domain` sends the domain it thinks was meant
 */
export function authError(code?: string | null, suggestion?: string | null): AuthErrorText {
  const key = String(code || "").trim();

  /* Handled here rather than in the table because the useful half of it is the
     suggestion the server worked out — "did you mean gmail.com" is the whole
     message, and without it there is nothing to say. */
  if (key === "likely_typo_domain") {
    return {
      title: "Check the domain",
      description: suggestion
        ? `Did you mean @${suggestion}? Fix it and we'll send the code.`
        : "That domain looks like a typo of a common one. Check the part after the @.",
    };
  }

  if (MESSAGES[key]) return MESSAGES[key];

  /* Not a known code. A sentence — something already written for a human, like
     the network-failure text a screen passes in — is shown as-is; a bare
     snake_case token never is, because that is the leak this module exists to
     stop. */
  const looksHuman = /\s/.test(key) && !/^[a-z0-9_]+$/.test(key);
  return looksHuman ? { title: GENERIC.title, description: key } : GENERIC;
}
