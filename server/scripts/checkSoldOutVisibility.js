/**
 * Where a sold-out one-time product may and may not appear.
 *
 *   node scripts/checkSoldOutVisibility.js
 *
 * Two different kinds of hiding live in utils/promptVisibility and it matters
 * that they stay separate:
 *
 *   applyPublicPromptFilter — this listing is not ALLOWED to be seen
 *                             (deleted, flagged, failed the media check)
 *   excludeSoldOut          — this listing is fine, it just cannot be bought
 *                             again by anyone, ever
 *
 * Only the second one is wanted on the marketplace feed and the shared link. A
 * creator's profile keeps showing sold work, because there it is portfolio.
 * Getting that backwards either fills the shop with things nobody can buy, or
 * quietly erases a creator's best sales from their own page.
 *
 * No database, no network — it reasons about the filters and the route source.
 */

const { readFileSync } = require("fs");
const path = require("path");
const { applyPublicPromptFilter, excludeSoldOut } = require("../utils/promptVisibility");

let failures = 0;
const check = (label, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok && detail) console.log(`        ${detail}`);
};

/** What Mongo's `$nor: [{exclusive:true, sold:true}]` does to one document. */
const survivesSoldOutFilter = (p) => !(p.exclusive === true && p.sold === true);

console.log("the rule only catches one-time AND sold:");
check("a one-time product that sold is hidden", survivesSoldOutFilter({ exclusive: true, sold: true }) === false);
check("a one-time product still for sale is shown", survivesSoldOutFilter({ exclusive: true, sold: false }) === true);
check(
  "an ordinary product that has sold many times is shown",
  survivesSoldOutFilter({ exclusive: false, sold: true }) === true,
  "ordinary listings sell repeatedly — `sold` alone must not hide anything",
);
check("an ordinary unsold product is shown", survivesSoldOutFilter({ exclusive: false, sold: false }) === true);

console.log("\nthe two filters stay separate:");
const visibilityOnly = applyPublicPromptFilter({});
check(
  "applyPublicPromptFilter does NOT hide sold-out products on its own",
  !JSON.stringify(visibilityOnly).includes("$nor"),
  "if it did, a creator's profile would lose their sold work too",
);
check(
  "excludeSoldOut adds exactly one condition",
  JSON.stringify(excludeSoldOut({}).$and) === JSON.stringify([{ $nor: [{ exclusive: true, sold: true }] }]),
);
check(
  "the two compose without either dropping the other",
  (() => {
    const both = excludeSoldOut(applyPublicPromptFilter({ userId: "u" }));
    const s = JSON.stringify(both);
    return s.includes("mediaValidation") && s.includes("$nor") && both.deleted && both.flagged;
  })(),
);

console.log("\napplied to the right routes:");
const routes = readFileSync(path.join(__dirname, "../routes/promptRoutes.js"), "utf8");

/**
 * The body of ONE live route handler.
 *
 * By line, and only lines that start at column 0: this file carries several
 * commented-out copies of the same routes, and an indexOf on the signature lands
 * in one of them — which is how this check first came back red against code that
 * was actually correct.
 */
const routeBody = (signature) => {
  const lines = routes.split("\n");
  const start = lines.findIndex((l) => l.startsWith(signature));
  if (start === -1) return "";
  const end = lines.findIndex((l, i) => i > start && /^router\.(get|post|put|patch|delete)\(/.test(l));
  return lines.slice(start, end === -1 ? lines.length : end).join("\n");
};

const feed = routeBody('router.get("/others"');
const shared = routeBody('router.get("/public/:id"');
const profile = routeBody('router.get("/user/:userId"');
const bySeller = routeBody('router.get("/by-seller/:sellerId"');

check("the marketplace feed excludes them", feed.includes("excludeSoldOut"));
check("the shared link excludes them", shared.includes("excludeSoldOut"));
check(
  "the creator profile does NOT — sold work is portfolio there",
  !profile.includes("excludeSoldOut"),
);
check("neither does the by-seller listing", !bySeller.includes("excludeSoldOut"));

console.log("\nand they all still apply the base visibility rules:");
for (const [name, body] of [
  ["/others", feed],
  ["/public/:id", shared],
  ["/user/:userId", profile],
  ["/by-seller/:sellerId", bySeller],
]) {
  check(`${name} applies applyPublicPromptFilter`, body.includes("applyPublicPromptFilter"));
}

console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll checks passed.");
process.exit(failures ? 1 : 0);
