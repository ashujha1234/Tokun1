/**
 * Shuts the browser console up.
 *
 * The app prints roughly 780 console calls across its source — checkout bodies,
 * raw API responses, admin payloads, whole grouped traces of the payment flow.
 * Production builds already strip them (`esbuild.drop` in vite.config.ts, which
 * runs at minify time), but development does not: the SWC plugin does the
 * TS/JSX transform there, so esbuild's drop never sees the code. That is why
 * the console is full on localhost and empty on the deployed site.
 *
 * Two things this handles that deleting 780 log statements would not:
 *
 *   • third-party scripts. Razorpay Checkout and the Agora SDK log on their
 *     own, in production too, and no build flag of ours touches them.
 *   • new logs. A console.log added tomorrow is silenced without anyone
 *     remembering a rule.
 *
 * Escape hatch, because a console that can't be turned back on is a debugging
 * problem of its own — in devtools:
 *
 *     localStorage.tokun_debug = "1"   // then reload; everything prints again
 *     delete localStorage.tokun_debug  // back to quiet
 */

const SILENCED = [
  "log",
  "info",
  "debug",
  "warn",
  "error",
  "trace",
  "dir",
  "dirxml",
  "table",
  "group",
  "groupCollapsed",
  "groupEnd",
  "count",
  "countReset",
  "time",
  "timeEnd",
  "timeLog",
  "assert",
] as const;

export function silenceConsole() {
  if (typeof window === "undefined" || !window.console) return;

  try {
    if (localStorage.getItem("tokun_debug") === "1") return;
  } catch {
    // Storage blocked (private mode, embedded webview). Staying quiet is the
    // right default; the hatch just isn't available there.
  }

  const noop = () => {};
  for (const method of SILENCED) {
    // Assigned rather than deleted: plenty of code calls console.group and
    // console.groupEnd in pairs, and removing the property would throw
    // "is not a function" instead of doing nothing.
    (window.console as unknown as Record<string, unknown>)[method] = noop;
  }
}
