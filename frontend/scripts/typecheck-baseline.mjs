/**
 * Typecheck as a RATCHET rather than a pass/fail gate.
 *
 * ── The problem this solves ─────────────────────────────────────────────────
 *
 * `tsc --noEmit -p tsconfig.app.json` reports 55 errors today. They are real,
 * they predate this script, and they have never run in CI — which is exactly
 * how there came to be 55 of them.
 *
 * That leaves two bad options and one good one:
 *
 *   Gate on zero      Every deploy is blocked until all 55 are fixed. Those
 *                     fixes touch component props and context shapes across the
 *                     app, so it is a large change with real regression risk,
 *                     made under pressure because nothing can ship meanwhile.
 *
 *   Informational     Run it, print it, let it fail. Nothing stops the count
 *                     going from 55 to 56, and a number nobody is accountable
 *                     for is a number that only grows.
 *
 *   Ratchet           Fail if the count goes UP. New code cannot add type
 *                     errors; existing ones get fixed on their own schedule.
 *                     This is that.
 *
 * ── Using it ────────────────────────────────────────────────────────────────
 *
 * When errors are fixed and the count drops, this fails too — with the new
 * number, and asking you to lower BASELINE to match. That is deliberate: it is
 * how the ratchet tightens. Without it, someone fixes 10 errors and the budget
 * silently stays at 55, leaving room for 10 new ones.
 *
 * The goal is BASELINE: 0, at which point this script can be deleted and
 * replaced with a plain `tsc --noEmit`.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

/* Measured on main at the time this script was added. Lower it whenever the
   real count drops — never raise it. */
const BASELINE = 55;

const PROJECT = "tsconfig.app.json";

/* tsconfig.json is `files: []` plus project references, so `tsc -p
   tsconfig.json` compiles nothing and reports success on anything at all. The
   app's real config is tsconfig.app.json, and pointing at the wrong one is a
   gate that passes because it checked no files. */
const { stdout } = await run("npx", ["tsc", "--noEmit", "-p", PROJECT], {
  cwd: process.cwd(),
  maxBuffer: 32 * 1024 * 1024,
  // tsc exits non-zero when there are errors, which is the normal case here.
  // The count is what matters, so failure is read from stdout, not the code.
}).catch((err) => ({ stdout: err.stdout ?? "", stderr: err.stderr ?? "" }));

const lines = stdout.split("\n").filter((l) => /error TS\d+/.test(l));
const count = lines.length;

if (count > BASELINE) {
  console.error(
    `\n✗ Typecheck: ${count} errors, baseline is ${BASELINE}.\n` +
      `  ${count - BASELINE} new type error(s) were introduced.\n`
  );
  // Only the new ones are worth reading here; the pre-existing 55 are known.
  for (const l of lines.slice(0, 40)) console.error("   " + l);
  process.exit(1);
}

if (count < BASELINE) {
  console.error(
    `\n✗ Typecheck: ${count} errors — down from a baseline of ${BASELINE}. Nice.\n` +
      `  Lower BASELINE in scripts/typecheck-baseline.mjs to ${count} to lock the gain in,\n` +
      `  otherwise the budget stays at ${BASELINE} and ${BASELINE - count} new errors could slip back in.\n`
  );
  process.exit(1);
}

console.log(`✓ Typecheck: ${count} errors, unchanged from baseline (${BASELINE}).`);
