/**
 * Error detection — the missing half of the errorId design.
 *
 * ── What was wrong ──────────────────────────────────────────────────────────
 *
 * The global error handler already minted an errorId per 500, returned it to the
 * client, and wrote the stack to the log under that same id. The intent was that
 * a user's screenshot could be matched to a stack trace. Half of that never
 * existed: there was no searchable log to match it against.
 *
 * Nothing wrote to a file, and nothing was structured — 876 bare console.* calls
 * going to stdout. On App Service stdout reaches the Log Stream, which is a live
 * tail, not a history; filesystem logging is off by default and Azure
 * auto-disables it after 12 hours even when switched on. So an errorId reported
 * a day later had nowhere to be looked up.
 *
 * This module is that other half. console.error stays exactly where it is —
 * it is useful locally and costs nothing — and every error additionally goes
 * somewhere it can still be found next week, under the same errorId.
 *
 * ── Fails open, always ──────────────────────────────────────────────────────
 *
 * Telemetry must never be able to take the app down; an observability tool that
 * causes outages is worse than none. So:
 *
 *   - No connection string  -> every function here is a no-op. Local dev and CI
 *                              need no configuration and behave identically.
 *   - SDK throws on init    -> caught, logged once, and the module degrades to
 *                              no-op rather than crashing boot.
 *   - trackError throws     -> swallowed. It is called from inside the error
 *                              handler and from process-level handlers, which are
 *                              the two worst places in the codebase to introduce
 *                              a new throw.
 *
 * ── Swapping providers ──────────────────────────────────────────────────────
 *
 * App Insights was chosen because the app is already on Azure, so it needs a
 * portal toggle rather than a new vendor. Nothing outside this file imports the
 * SDK — callers only see init/trackError/trackEvent/flush. Moving to Sentry means
 * rewriting this file and nothing else.
 */

let client = null;
let enabled = false;

/* APPLICATIONINSIGHTS_CONNECTION_STRING is the name the Azure SDK and the
   portal's own "connect Application Insights" flow both use, so setting it in
   App Service -> Environment variables is all that is required. */
const CONNECTION_STRING =
  process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || "";

function init() {
  if (enabled) return true;

  if (!CONNECTION_STRING) {
    console.log(
      "telemetry: APPLICATIONINSIGHTS_CONNECTION_STRING not set — error tracking disabled."
    );
    return false;
  }

  try {
    const appInsights = require("applicationinsights");

    appInsights
      .setup(CONNECTION_STRING)
      /* Auto-collection carries most of the value for the least code: every
         request with its status and duration, and every outbound dependency
         call (Mongo queries, OpenAI, Razorpay, Blob) with its latency. That
         second one matters here specifically — there is no retry or timeout
         policy on any outbound call, so a slow upstream currently looks like
         "the site is slow" with nothing to point at. */
      .setAutoCollectRequests(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectPerformance(true, false)
      .setAutoCollectExceptions(true)
      .setAutoCollectConsole(false)
      /* Live Metrics opens a persistent outbound channel and bills separately.
         Off: this is for after-the-fact diagnosis, not a live dashboard. */
      .setSendLiveMetrics(false)
      .setUseDiskRetryCaching(true)
      .start();

    client = appInsights.defaultClient;
    if (!client) throw new Error("defaultClient missing after start()");

    /* Tags every record with the running revision, so "did this start after the
       last deploy?" is answerable — normally the first question asked. */
    const role = process.env.WEBSITE_SITE_NAME || "tokun-api";
    client.context.tags[client.context.keys.cloudRole] = role;
    if (process.env.WEBSITE_INSTANCE_ID) {
      client.context.tags[client.context.keys.cloudRoleInstance] =
        String(process.env.WEBSITE_INSTANCE_ID).slice(0, 12);
    }

    enabled = true;
    console.log(`telemetry: Application Insights active (role=${role}).`);
    return true;
  } catch (err) {
    console.error(
      "telemetry: init failed, continuing without error tracking:",
      err && err.message ? err.message : err
    );
    client = null;
    enabled = false;
    return false;
  }
}

/**
 * Report an error.
 *
 * `properties` values are flattened to strings because App Insights drops
 * non-string custom dimensions silently — a nested object would simply not be
 * there when it was needed.
 */
function trackError(err, properties = {}) {
  if (!enabled || !client) return;
  try {
    const flat = {};
    for (const [k, v] of Object.entries(properties)) {
      if (v === undefined || v === null) continue;
      flat[k] = typeof v === "string" ? v : String(v);
    }
    client.trackException({
      exception: err instanceof Error ? err : new Error(String(err)),
      properties: flat,
    });
  } catch {
    /* Never let reporting an error become an error. */
  }
}

/**
 * Report something that is not an exception but still needs to be findable —
 * a cron job that ran, a job that found nothing to do, a payout that settled.
 *
 * This is what makes silent failure detectable. The escrow release jobs move
 * money and currently log to a stream nobody reads; a job that stops running
 * looks exactly like a job with nothing to do. An event per run turns that into
 * "no ReleaseEscrow events for 6 hours", which is alertable.
 */
function trackEvent(name, properties = {}, measurements = {}) {
  if (!enabled || !client) return;
  try {
    const flat = {};
    for (const [k, v] of Object.entries(properties)) {
      if (v === undefined || v === null) continue;
      flat[k] = typeof v === "string" ? v : String(v);
    }
    client.trackEvent({ name, properties: flat, measurements });
  } catch {
    /* as above */
  }
}

/**
 * Push anything buffered.
 *
 * Called from the SIGTERM path and from the fatal handlers. Without this the
 * telemetry that explains a crash dies in the buffer with the process — which is
 * precisely the report worth having.
 */
function flush() {
  if (!enabled || !client) return Promise.resolve();
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    try {
      client.flush({ callback: done });
    } catch {
      done();
    }
    /* The callback is not guaranteed to fire if the network is already gone, and
       the shutdown path has a 15s budget it must not exceed. */
    setTimeout(done, 2000);
  });
}

const isEnabled = () => enabled;

module.exports = { init, trackError, trackEvent, flush, isEnabled };
