#!/usr/bin/env node
/**
 * reparent-stray-categories.js — tidy the PROMPT category tree.
 *
 * Two jobs, both of which seeding cannot do on its own:
 *
 *   1. MOVE the stray top-level "interior" family under Design.
 *      The live tree has `interior`, `Interior` AND `Interior Design` sitting
 *      as three separate top-level categories beside each other — each typed
 *      with different capitalisation back when POST /api/category's duplicate
 *      check was case-SENSITIVE and let all three through. They describe one
 *      thing, and that thing is a kind of design, so products filed under them
 *      split three ways and no filter could reunite them. The marketplace's own
 *      search-facet code carries a note about this (PromptMarketplacePage.tsx:
 *      "Interior Design (a top-level category of its own, not a child of
 *      Design)").
 *
 *   2. MERGE case-variant duplicates anywhere else in the prompt tree — two
 *      rows with the same parent whose names differ only in case. Same cause,
 *      same effect, and there is no reason to fix only the one we noticed.
 *
 * Seeding can't do either. POST /api/category/seed-defaults is upsert-only by
 * design — it never renames, reparents or deletes — so adding "Interior Design"
 * as a child of Design (which it now does) creates a SECOND row of that name
 * and leaves the top-level one exactly where it was. This script is what
 * retires the old rows and carries the products across.
 *
 * Products are moved, not orphaned. A prompt filed under a stray keeps its
 * classification: the parent (Design) lands in `categories` and the specific
 * child ("Interior Design") in `subCategories`, which is how Prompt.js says the
 * two fields are meant to be used.
 *
 * ⚠️  DELETES the emptied duplicate rows — after everything pointing at them has
 *     been repointed. Dry run by default; nothing is written without --apply.
 *
 * Usage
 *   node scripts/reparent-stray-categories.js            # dry run — prints the plan
 *   node scripts/reparent-stray-categories.js --apply    # do it
 */

require("dotenv").config();
const mongoose = require("mongoose");

const APPLY = process.argv.includes("--apply");

// The top-level rows to pull under Design. Matched case-insensitively against
// the whole name, so "interior", "Interior", "Interior Design" and
// "Interior & Architecture" are all caught, while "Interior Design Tips" — a
// name someone chose deliberately — is not.
const INTERIOR_ALIASES = [
  "interior",
  "interiors",
  "interior design",
  "interior designing",
  "interior & architecture",
  "interior and architecture",
  "interior architecture",
];

const DESIGN_PARENT = "Design";
const INTERIOR_CHILD = "Interior Design";

const norm = (s) => String(s || "").trim().toLowerCase();

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("No MONGO_URI. Aborting.");
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 60000 });

  const Category = require("../models/Category");
  const Prompt = require("../models/Prompt");
  const PromptReport = require("../models/PromptReport");

  const plan = [];
  const say = (line) => {
    plan.push(line);
    console.log(line);
  };

  console.log(APPLY ? "\n=== APPLYING ===\n" : "\n=== DRY RUN (nothing will be written) ===\n");

  /* Everything reads and writes only the prompt tree. The service tree has its
     own "Design & Creative" heading and its own children; moving a prompt
     category into it, or merging across the two, would put a freelancer's
     service under a prompt heading. */
  const KIND = "prompt";

  /* ── 1. Design, and its Interior Design child ───────────────────────────── */
  let design = await Category.findOne({
    kind: KIND,
    parent: null,
    name: new RegExp(`^${DESIGN_PARENT}$`, "i"),
  });

  if (!design) {
    say(`Design: MISSING at top level — will create it`);
    if (APPLY) design = await Category.create({ name: DESIGN_PARENT, kind: KIND, parent: null });
  } else {
    say(`Design: found (${design._id})`);
  }

  let interiorChild = design
    ? await Category.findOne({
        kind: KIND,
        parent: design._id,
        name: new RegExp(`^${INTERIOR_CHILD}$`, "i"),
      })
    : null;

  if (!interiorChild) {
    say(`  "${INTERIOR_CHILD}" under Design: MISSING — will create it`);
    if (APPLY && design) {
      interiorChild = await Category.create({ name: INTERIOR_CHILD, kind: KIND, parent: design._id });
    }
  } else {
    say(`  "${INTERIOR_CHILD}" under Design: found (${interiorChild._id})`);
  }

  /* ── 2. The stray top-level interior rows ───────────────────────────────── */
  const topLevel = await Category.find({ kind: KIND, parent: null }).lean();
  const strays = topLevel.filter(
    (c) => INTERIOR_ALIASES.includes(norm(c.name)) && String(c._id) !== String(design?._id)
  );

  say(`\nStray top-level interior categories: ${strays.length}`);
  strays.forEach((s) => say(`  • "${s.name}" (${s._id})`));

  let promptsMoved = 0;
  let childrenMoved = 0;
  let reportsMoved = 0;

  /* On a dry run against a tree with no Design row, `design` is null and every
     lookup below would filter on `parent: undefined` — which mongoose strips,
     turning "children of Design" into "any category with this name anywhere".
     Reporting a merge that isn't the one --apply would perform is worse than
     reporting nothing, so the pass is skipped and says why. */
  const canReparent = !!design && !!interiorChild;
  if (strays.length && !canReparent) {
    say(`\n(skipped — Design/"${INTERIOR_CHILD}" don't exist yet. Run POST /api/category/seed-defaults, or re-run this with --apply, which creates them.)`);
  }

  for (const stray of canReparent ? strays : []) {
    say(`\n— "${stray.name}" —`);

    /* Its children move up to Design as siblings of Interior Design.

       They cannot follow their parent down: the tree is exactly two levels
       (POST /api/category refuses a third with max_depth_is_two), so a child of
       a category that is itself becoming a child has nowhere below to go.
       Landing them under Design keeps them selectable; the alternative — folding
       them into Interior Design — would lose the distinction the seller drew. */
    const kids = await Category.find({ kind: KIND, parent: stray._id }).lean();
    for (const kid of kids) {
      const clash = await Category.findOne({
        kind: KIND,
        parent: design?._id,
        name: new RegExp(`^${String(kid.name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      });

      if (clash) {
        // Design already has one of these. Repoint prompts at the survivor and
        // drop the copy rather than leaving two identical chips under Design.
        say(`  child "${kid.name}" → merges into existing Design child ${clash._id}`);
        if (APPLY) {
          await Prompt.updateMany({ subCategories: kid._id }, { $addToSet: { subCategories: clash._id } });
          await Prompt.updateMany({ subCategories: kid._id }, { $pull: { subCategories: kid._id } });
          await Prompt.updateMany({ categories: kid._id }, { $addToSet: { categories: clash._id } });
          await Prompt.updateMany({ categories: kid._id }, { $pull: { categories: kid._id } });
          await Category.deleteOne({ _id: kid._id });
        }
      } else {
        say(`  child "${kid.name}" → moves under Design`);
        if (APPLY) await Category.updateOne({ _id: kid._id }, { $set: { parent: design._id } });
      }
      childrenMoved += 1;
    }

    /* Prompts filed under the stray.

       `categories` holds top-level rows and `subCategories` the narrower one —
       so a prompt whose category WAS top-level "Interior Design" needs both
       rewritten, not one moved: Design goes in the first, Interior Design in the
       second. $addToSet before $pull, and in separate calls, because Mongo
       rejects both operators on the same field in one update. */
    const affected = await Prompt.countDocuments({
      $or: [{ categories: stray._id }, { subCategories: stray._id }],
    });
    say(`  prompts pointing at it: ${affected}`);
    promptsMoved += affected;

    if (APPLY && design && interiorChild) {
      await Prompt.updateMany(
        { categories: stray._id },
        { $addToSet: { categories: design._id, subCategories: interiorChild._id } }
      );
      await Prompt.updateMany({ categories: stray._id }, { $pull: { categories: stray._id } });

      await Prompt.updateMany(
        { subCategories: stray._id },
        { $addToSet: { subCategories: interiorChild._id } }
      );
      await Prompt.updateMany({ subCategories: stray._id }, { $pull: { subCategories: stray._id } });
    }

    // Reports carry a single category id — a report about nothing is a report
    // an admin can't triage.
    const reports = await PromptReport.countDocuments({ category: stray._id });
    if (reports) {
      say(`  reports pointing at it: ${reports}`);
      reportsMoved += reports;
      if (APPLY && interiorChild) {
        await PromptReport.updateMany({ category: stray._id }, { $set: { category: interiorChild._id } });
      }
    }

    say(`  → delete "${stray.name}" (${stray._id})`);
    if (APPLY) await Category.deleteOne({ _id: stray._id });
  }

  /* ── 3. Case-variant duplicates elsewhere in the prompt tree ────────────── */
  say(`\n— case-variant duplicates —`);

  const all = await Category.find({ kind: KIND }).sort({ createdAt: 1 }).lean();
  const groups = new Map();
  for (const c of all) {
    const key = `${String(c.parent || "root")}::${norm(c.name)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(c);
  }

  let dupesMerged = 0;
  for (const [, rows] of groups) {
    if (rows.length < 2) continue;

    /* The oldest row survives — it is the one the most products, saved
       collections and links have had the longest to accumulate against. */
    const [keep, ...dupes] = rows;
    say(`  "${keep.name}" — ${dupes.length} duplicate(s) merge into ${keep._id}`);

    for (const dupe of dupes) {
      const n = await Prompt.countDocuments({
        $or: [{ categories: dupe._id }, { subCategories: dupe._id }],
      });
      say(`    • "${dupe.name}" (${dupe._id}) — ${n} prompt(s)`);
      dupesMerged += 1;

      if (APPLY) {
        await Category.updateMany({ parent: dupe._id }, { $set: { parent: keep._id } });

        await Prompt.updateMany({ categories: dupe._id }, { $addToSet: { categories: keep._id } });
        await Prompt.updateMany({ categories: dupe._id }, { $pull: { categories: dupe._id } });
        await Prompt.updateMany({ subCategories: dupe._id }, { $addToSet: { subCategories: keep._id } });
        await Prompt.updateMany({ subCategories: dupe._id }, { $pull: { subCategories: dupe._id } });
        await PromptReport.updateMany({ category: dupe._id }, { $set: { category: keep._id } });

        await Category.deleteOne({ _id: dupe._id });
      }
    }
  }
  if (!dupesMerged) say("  none");

  /* ── summary ────────────────────────────────────────────────────────────── */
  const [tops, subs] = await Promise.all([
    Category.countDocuments({ kind: KIND, parent: null }),
    Category.countDocuments({ kind: KIND, parent: { $ne: null } }),
  ]);

  console.log(`\n=== ${APPLY ? "DONE" : "DRY RUN COMPLETE"} ===`);
  console.log(`strays reparented   : ${canReparent ? strays.length : 0}${
    strays.length && !canReparent ? ` (${strays.length} found but skipped)` : ""
  }`);
  console.log(`their children moved: ${childrenMoved}`);
  console.log(`prompts repointed   : ${promptsMoved}`);
  console.log(`reports repointed   : ${reportsMoved}`);
  console.log(`case dupes merged   : ${dupesMerged}`);
  console.log(`prompt tree now     : ${tops} top-level, ${subs} sub-categories`);
  if (!APPLY) console.log(`\nNothing was written. Re-run with --apply to commit.`);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
