/**
 * Detection for the cron jobs.
 *
 * ── Why these needed it most ────────────────────────────────────────────────
 *
 * Three of the seven scheduled jobs move money: autoReleaseEscrow,
 * autoReleaseServiceEscrow and referralSettlement. All seven already had
 * try/catch with console.error, which is correct handling — the job dies quietly
 * instead of taking the process with it — and completely undetectable, because
 * that console.error goes to a stream nobody reads.
 *
 * The failure that matters is not the loud one. It is a job that stops running
 * at all: node-cron silently drops a task whose scheduler was never reached,
 * a deploy can restart the process mid-tick, and a job with nothing to do looks
 * exactly like a job that is no longer firing. Escrow money simply stays held,
 * for as long as nobody notices, and no error is ever raised.
 *
 * So each run emits a start and a finish. That turns silence into a queryable
 * fact — "no cron:AutoReleaseEscrow start events in the last 3 hours" — which is
 * something an alert can fire on, unlike the absence of a log line.
 *
 * ── Usage ──────────────────────────────────────────────────────────────────
 *
 *     cron.schedule("0 * * * *", async () => {
 *       const job = watchJob("AutoReleaseEscrow");
 *       try {
 *         ... existing body, unchanged ...
 *         job.ok({ released: n });
 *       } catch (err) {
 *         console.error("[AutoRelease] Cron job error:", err);
 *         job.failed(err);
 *       }
 *     });
 *
 * Deliberately not a function wrapper around the body: every one of these
 * callbacks already has a working try/catch with job-specific logging inside it,
 * and restructuring seven of those to gain a wrapper risks changing behaviour in
 * jobs that release funds. Three added lines cannot.
 *
 * Every call is a no-op when telemetry is unconfigured, so local runs are
 * unaffected.
 */

const telemetry = require("./telemetry");

/* Suggested alert once this is live, per money-moving job:
     customEvents
     | where name == "cron:AutoReleaseEscrow" and customDimensions.phase == "start"
     | summarize count() by bin(timestamp, 1h)
   The hourly jobs should never produce an empty bin. */
function watchJob(name) {
  const eventName = `cron:${name}`;
  const startedAt = Date.now();

  telemetry.trackEvent(eventName, { phase: "start" });

  return {
    /** Ran to completion. `counts` become measurements so they can be charted. */
    ok(counts = {}) {
      const measurements = { durationMs: Date.now() - startedAt };
      for (const [k, v] of Object.entries(counts)) {
        if (typeof v === "number" && Number.isFinite(v)) measurements[k] = v;
      }
      telemetry.trackEvent(eventName, { phase: "done" }, measurements);
    },

    /** Threw. Reported as an exception so it surfaces with the other failures. */
    failed(err) {
      telemetry.trackError(err, { job: name, kind: "cronFailure" });
      telemetry.trackEvent(
        eventName,
        { phase: "failed" },
        { durationMs: Date.now() - startedAt }
      );
    },
  };
}

module.exports = { watchJob };
