/**
 * Guards the newsletter sign-up against the two ways it has already gone wrong.
 *
 *   node scripts/checkNewsletterForm.mjs
 *
 *   1. There were TWO of these forms and only one worked — the blog page's had
 *      no state, no onChange and no onClick, so Subscribe did nothing at all
 *      and said nothing either. This asserts there is exactly one implementation
 *      and that both places use it.
 *   2. The one that did work confirmed with a line of small text while the form
 *      sat there still offering to subscribe you, which reads as "nothing
 *      happened". This asserts success replaces the form.
 *
 * Source-level checks on purpose: the failure mode is a form that renders
 * perfectly and is wired to nothing, which no amount of unit-testing the logic
 * would have caught.
 */

import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

let failures = 0;
const check = (label, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok && detail) console.log(`        ${detail}`);
};

const component = read("src/components/NewsletterSubscribe.tsx");
const footer = read("src/components/Footer.tsx");
const blog = read("src/pages/BlogPage.tsx");

/** Strips comments, so a rule can't be satisfied by a line that only describes it. */
const live = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((l) => !l.trim().startsWith("//"))
    .join("\n");

console.log("one implementation, used everywhere:");
check(
  "the shared component posts to the newsletter endpoint",
  live(component).includes("/api/newsletter/subscribe"),
);
for (const [name, src] of [["Footer", footer], ["BlogPage", blog]]) {
  check(`${name} renders <NewsletterSubscribe>`, /<NewsletterSubscribe\b/.test(live(src)));
  check(
    `${name} has no second hand-rolled subscribe form`,
    !/type="email"/.test(live(src)),
    "found a bare email input — that's how the dead blog form happened",
  );
}

console.log("\nthe form actually does something:");
const liveComponent = live(component);
check("the input is controlled", /value=\{email\}/.test(liveComponent));
check("the input has an onChange", /onChange=/.test(liveComponent));
check("submitting is handled", /onSubmit=\{submit\}/.test(liveComponent));
check(
  "Subscribe is a real submit button, so Enter works too",
  /type="submit"/.test(liveComponent),
);

console.log("\nsuccess is unmistakable:");
check(
  "success replaces the form rather than sitting under it",
  /if \(state === "done"\)[\s\S]{0,200}return \(/.test(liveComponent),
  "expected an early return rendering the confirmation instead of the form",
);
check("the confirmation names the address it went to", /Confirmation sent to/.test(liveComponent));
check(
  "the confirmation is announced to screen readers",
  /role="status"/.test(liveComponent),
);
check(
  "Subscribe is disabled until the address could be real",
  /disabled=\{!canSubmit\}/.test(liveComponent) && /isValidEmail/.test(liveComponent),
);

console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll checks passed.");
process.exit(failures ? 1 : 0);
