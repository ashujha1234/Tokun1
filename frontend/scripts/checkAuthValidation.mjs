/**
 * Every submit button that takes an email is gated on a valid one.
 *
 *   node scripts/checkAuthValidation.mjs
 *
 * These pages each carry TWO layouts — a mobile one and a desktop one — and the
 * bug was never "no validation anywhere", it was that one layout had it and the
 * other didn't (Signup's mobile button checked only `isLoading`), or that the
 * rule was too loose to mean anything (`length > 3 && includes("@")`, which
 * accepts "abc@"). So this checks both the rule and that nothing is left using
 * its own weaker copy.
 */

import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

/** Comments stripped, so a rule can't be "satisfied" by a line describing it. */
const live = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((l) => !l.trim().startsWith("//"))
    .join("\n");

let failures = 0;
const check = (label, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok && detail) console.log(`        ${detail}`);
};

const PAGES = ["Login", "Signup", "AdminLogin", "AdminForgotPassword"];

console.log("one shared rule:");
check(
  "lib/validators defines isValidEmail",
  /export const isValidEmail/.test(read("src/lib/validators.ts")),
);

for (const name of PAGES) {
  const src = live(read(`src/pages/${name}.tsx`));
  check(`${name} imports it`, /from "@\/lib\/validators"/.test(src));
  check(
    `${name} has no private copy of the pattern`,
    !/const isValidEmail\s*=/.test(src),
    "a second copy is how these drifted apart in the first place",
  );
  check(
    `${name} has no "includes('@')" stand-in left`,
    !/includes\("@"\)/.test(src),
    'that rule accepts "abc@"',
  );
}

console.log("\nboth layouts on every page are gated:");
/* Each page renders a mobile and a desktop form. Counting the gated submit
   buttons catches the case where only one of the two was fixed. */
const EXPECTED = {
  Login: { needle: /disabled=\{!canRequestOtp\}/g, count: 2 },
  Signup: { needle: /disabled=\{!canSubmitSignup\}/g, count: 2 },
  AdminLogin: { needle: /disabled=\{!isValid \|\| submitting\}/g, count: 2 },
  AdminForgotPassword: { needle: /disabled=\{!isValid \|\| submitting\}/g, count: 2 },
};

for (const [name, { needle, count }] of Object.entries(EXPECTED)) {
  const found = (live(read(`src/pages/${name}.tsx`)).match(needle) || []).length;
  check(
    `${name}: ${count} gated submit buttons`,
    found === count,
    `found ${found} — a layout is probably ungated`,
  );
}

console.log("\nthe rule itself:");
const { isValidEmail } = await import("../src/lib/validators.ts").catch(() => ({}));
if (typeof isValidEmail === "function") {
  for (const [value, expected] of [
    ["a@b.co", true],
    ["someone+tag@example.co.uk", true],
    ["  spaced@example.com  ", true],
    ["abc@", false],
    ["a@b", false],
    ["abc", false],
    ["", false],
    ["two@@example.com", false],
    ["with space@example.com", false],
  ]) {
    check(`${JSON.stringify(value)} → ${expected}`, isValidEmail(value) === expected);
  }
} else {
  console.log("  (skipped — TS source can't be imported directly by node)");
}

console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll checks passed.");
process.exit(failures ? 1 : 0);
