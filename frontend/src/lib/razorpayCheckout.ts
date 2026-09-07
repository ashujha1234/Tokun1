/**
 * Loads Razorpay Checkout, once, when something actually needs it.
 *
 * ── Why this replaced the <script> tag ──────────────────────────────────────
 *
 * index.html carried `<script defer src=".../checkout.js">`, so every visitor
 * to every page downloaded and executed Razorpay's checkout bundle — the
 * landing page, the marketplace, a shared profile link. Nothing on first paint
 * needs it; it is needed the moment someone opens checkout, which is never
 * within the first second and for most visits never at all. `defer` had already
 * taken it out of the render path, but the bytes were still on the wire.
 *
 * The tag could not be removed while call sites read `window.Razorpay`
 * directly, and it was left in place deliberately for that reason — payments
 * are not the place to be clever in a hurry. This module is the missing half:
 * every call site now awaits `ensureRazorpay()` first, so the tag is gone.
 *
 * ── Why one module rather than the copy each page had ───────────────────────
 *
 * Six files had grown their own loader (`ensureRazorpay`, `loadRazorpayScript`,
 * an inline `if (!window.Razorpay)`), and they disagreed in ways that matter:
 * some rejected on failure, some resolved `false`, and every one of them had
 * the same race — the guard is `window.Razorpay`, which is only set once the
 * script has RUN, so two calls before the first load completed each appended
 * their own <script>. Two tags, two evaluations, and a `resolve()` from the
 * loser that could fire before the winner had defined the global.
 *
 * Here the in-flight promise itself is the lock, so concurrent callers share
 * one request and one tag. A failed load clears it, so a retry after a dropped
 * connection can actually try again rather than resolving against a script
 * element that will never fire.
 */

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/** The single in-flight (or settled-successful) load. Cleared on failure. */
let loading: Promise<void> | null = null;

/** Has the global landed? Cheap enough to expose for a render-time guard. */
export function isRazorpayReady(): boolean {
  return typeof (window as any).Razorpay === "function";
}

export function ensureRazorpay(): Promise<void> {
  if (isRazorpayReady()) return Promise.resolve();
  if (loading) return loading;

  loading = new Promise<void>((resolve, reject) => {
    /* A tag may already be in the document from an earlier attempt that has
       not finished — including one this module did not create. Reusing it
       avoids a second download; the listeners below still settle from it. */
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CHECKOUT_SRC}"]`
    );

    const el = existing ?? document.createElement("script");

    const onLoad = () => {
      cleanup();
      /* Loaded but no global: an ad blocker or a corporate proxy served a
         200 with something that is not Razorpay. Treated as a failure,
         because the caller's very next line would be `new window.Razorpay`. */
      if (!isRazorpayReady()) {
        loading = null;
        reject(new Error("razorpay_script_loaded_without_global"));
        return;
      }
      resolve();
    };

    const onError = () => {
      cleanup();
      // Cleared so a later attempt re-requests instead of reusing a dead tag.
      loading = null;
      el.remove();
      reject(new Error("razorpay_script_load_failed"));
    };

    function cleanup() {
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onError);
    }

    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);

    if (!existing) {
      el.src = CHECKOUT_SRC;
      el.async = true;
      document.body.appendChild(el);
    }
  });

  return loading;
}

/**
 * `ensureRazorpay()` with the toast already written, for the common call site.
 *
 * Returns false instead of throwing so a click handler can `if (!(await
 * ensureRazorpayOrToast())) return;` without a try/catch around the whole
 * payment flow. The message names the two things that actually cause this —
 * an ad blocker and a dropped connection — because "something went wrong"
 * sends the user to support for a problem they can fix themselves.
 */
export async function ensureRazorpayOrToast(
  toast: (opts: { title: string; description?: string }) => unknown
): Promise<boolean> {
  try {
    await ensureRazorpay();
    return true;
  } catch {
    toast({
      title: "Could not open checkout",
      description:
        "Razorpay's payment script failed to load. Check your connection or any ad blocker, then try again.",
    });
    return false;
  }
}
