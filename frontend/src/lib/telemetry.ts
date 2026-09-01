/**
 * Frontend error detection.
 *
 * ── What was invisible ──────────────────────────────────────────────────────
 *
 * AppErrorBoundary already caught render errors, showed the user a short
 * reference, and called console.error with it. In production that console.error
 * does not exist: vite.config.ts sets `drop: ["console", "debugger"]`, so esbuild
 * removes it from the bundle. Verified — the string "AppErrorBoundary" is absent
 * from dist entirely.
 *
 * The result was that a white screen left no trace anywhere. The reference shown
 * to the user was real, but it was never recorded against anything, so quoting it
 * led nowhere. AppErrorBoundary's own comment named the fix:
 *
 *     "This is where that tracker gets wired in:
 *      report(error, { ref: this.state.ref, scope })"
 *
 * That is `reportError` below.
 *
 * ── Two things this covers that a boundary cannot ───────────────────────────
 *
 * React error boundaries only catch errors thrown during render, in lifecycle
 * methods, and in constructors. They do not catch errors inside event handlers,
 * setTimeout callbacks, or rejected promises — which is where most real failures
 * in this app live, because almost every fetch here is in an event handler with
 * a `catch {}` that shows a toast. `installGlobalHandlers` covers those.
 *
 * ── The connection string is not a secret ───────────────────────────────────
 *
 * VITE_ variables are compiled into the bundle and readable by anyone. That is
 * expected for this one: an App Insights connection string is an ingestion
 * endpoint plus a write-only key. Someone holding it can send junk telemetry to
 * the account; they cannot read any of it. Every browser-based analytics or error
 * tracker works this way. Nothing else may be added to VITE_ on that basis —
 * this is a property of ingestion keys, not a general licence.
 *
 * ── Never breaks the app ────────────────────────────────────────────────────
 *
 * Unset connection string means every function here is a no-op, so local dev and
 * any build without the variable behave exactly as before. Init failures are
 * swallowed: a telemetry SDK that throws during startup would take down the app
 * it exists to observe.
 */

import type { ApplicationInsights } from "@microsoft/applicationinsights-web";

let ai: ApplicationInsights | null = null;
let ready = false;

const CONNECTION_STRING = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING || "";

/**
 * Start the SDK.
 *
 * Loaded dynamically so the ~70 kB SDK is not in the initial bundle — it is
 * diagnostic weight, and making every first paint carry it to catch errors that
 * usually do not happen is the wrong trade. Called from main.tsx without await;
 * anything reported before it resolves is dropped, which is acceptable for a
 * window measured in a few hundred milliseconds.
 */
export async function initTelemetry(): Promise<void> {
  if (ready || !CONNECTION_STRING) return;

  try {
    const { ApplicationInsights } = await import(
      "@microsoft/applicationinsights-web"
    );

    ai = new ApplicationInsights({
      config: {
        connectionString: CONNECTION_STRING,
        /* Correlates a browser error with the API request that caused it, which
           is the entire reason for putting both ends on the same tool. */
        enableCorsCorrelation: true,
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
        /* The SDK's own unhandled-error hook. Kept on, and
           installGlobalHandlers below adds unhandledrejection, which this does
           not cover. */
        enableUnhandledPromiseRejectionTracking: false,
        enableAutoRouteTracking: true,
        disableCookiesUsage: true,
        loggingLevelConsole: 0,
      },
    });

    ai.loadAppInsights();
    ready = true;
  } catch {
    /* Blocked by an ad blocker, offline, chunk failed to load — all fine. The
       app does not depend on this. */
    ai = null;
    ready = false;
  }
}

/**
 * Report an error.
 *
 * `ref` is the short code AppErrorBoundary shows the user, and it is the whole
 * point: when someone says "it said RJ4K2P", this is what makes that searchable.
 *
 *     exceptions | where customDimensions.ref == "RJ4K2P"
 */
export function reportError(
  error: unknown,
  properties: Record<string, string | number | boolean | undefined> = {}
): void {
  if (!ready || !ai) return;

  try {
    const err = error instanceof Error ? error : new Error(String(error));
    const flat: Record<string, string> = {};
    for (const [k, v] of Object.entries(properties)) {
      if (v === undefined || v === null) continue;
      flat[k] = String(v);
    }
    /* route, not the full href: query strings here carry ids and email
       addresses, and this is the one place a URL gets stored verbatim. */
    flat.route = window.location.pathname;
    ai.trackException({ exception: err, properties: flat });
  } catch {
    /* Reporting an error must never raise one. */
  }
}

/** A named thing that happened and is worth finding later. */
export function reportEvent(
  name: string,
  properties: Record<string, string | number | boolean | undefined> = {}
): void {
  if (!ready || !ai) return;
  try {
    const flat: Record<string, string> = {};
    for (const [k, v] of Object.entries(properties)) {
      if (v === undefined || v === null) continue;
      flat[k] = String(v);
    }
    ai.trackEvent({ name }, flat);
  } catch {
    /* as above */
  }
}

/**
 * Catch what error boundaries structurally cannot: throws from event handlers
 * and callbacks, and rejected promises nobody handled.
 *
 * `capture: true` so these fire before a handler further down can stop
 * propagation, and both are passive — neither calls preventDefault, so the
 * browser still logs to the console in development exactly as it does now.
 */
export function installGlobalHandlers(): void {
  window.addEventListener(
    "error",
    (event) => {
      /* Failed <img>/<script> loads arrive here as ErrorEvents with no `error`.
         They are noise at this level and would drown the real reports. */
      if (!event.error) return;
      reportError(event.error, { kind: "window.onerror" });
    },
    { capture: true }
  );

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      reportError(event.reason, { kind: "unhandledrejection" });
    },
    { capture: true }
  );
}
