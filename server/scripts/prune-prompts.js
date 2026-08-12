#!/usr/bin/env node
/**
 * prune-prompts.js — keep ONE prompt, delete the rest and everything hanging
 * off them.
 *
 * ⚠️  DELETES DATA. Writes a JSON snapshot of everything it removes first, into
 *     server/backup-prompts-<timestamp>/, so this is undoable.
 *
 * Deleting prompts on their own leaves dangling references: a cart row pointing
 * at a listing that no longer exists, a report about nothing, a share to a
 * prompt that 404s. So the prompt's dependents go with it — but only the ones
 * whose whole reason for existing is that prompt.
 *
 * NOT touched, deliberately:
 *   Purchase / LedgerEntry / RefundRequest — financial history. A purchase is a
 *   record that money changed hands; it stays true whether or not the listing
 *   still exists, and the buyer keeps their access through it.
 *   Notification — a prompt-linked notification degrades to a plain message,
 *   which is harmless, and wiping them would take unrelated ones with it.
 *
 * Usage
 *   node scripts/prune-prompts.js                      # dry run
 *   node scripts/prune-prompts.js --confirm            # delete
 *   node scripts/prune-prompts.js --keep <promptId>    # override which survives
 */

require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const CONFIRM = process.argv.includes("--confirm");
const keepFlag = process.argv.indexOf("--keep");
const KEEP_ID = keepFlag !== -1 ? process.argv[keepFlag + 1] : "6a79af0a85ffc54faf920c41";

async function ask(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const a = await new Promise((r) => rl.question(q, r));
  rl.close();
  return a.trim();
}

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("No MONGO_URI. Aborting.");
    process.exit(1);
  }
  const host = uri.replace(/^mongodb(\+srv)?:\/\/[^@]*@/, "").split("/")[0].split("?")[0];

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 60000 });

  const Prompt = require("../models/Prompt");
  const Cart = require("../models/Cart");
  const PromptReport = require("../models/PromptReport");
  const SharedPrompt = require("../models/SharedPrompt");
  const SavedCollection = require("../models/SavedCollection");

  const keep = await Prompt.findById(KEEP_ID).select("title price tokun_price").lean();
  if (!keep) {
    console.error(`\n  Prompt ${KEEP_ID} not found — refusing to delete everything.\n`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const total = await Prompt.countDocuments({});
  const doomed = await Prompt.find({ _id: { $ne: keep._id } }).select("_id").lean();
  const doomedIds = doomed.map((d) => d._id);

  console.log("");
  console.log("════════════════════════════════════════════════════════════════");
  console.log(CONFIRM ? "  DELETING PROMPTS" : "  DRY RUN — nothing will be deleted");
  console.log("════════════════════════════════════════════════════════════════");
  console.log(`  Cluster : ${host}`);
  console.log(`  Keeping : ${keep._id}  "${keep.title}"`);
  console.log(`            seller price ₹${keep.price} (was shown as ₹${keep.tokun_price})`);
  console.log("════════════════════════════════════════════════════════════════");
  console.log("");
  console.log(`  Prompts                     ${String(total).padStart(5)} → delete ${doomedIds.length}`);

  const reports = await PromptReport.countDocuments({ prompt: { $in: doomedIds } });
  const shares = await SharedPrompt.countDocuments({ prompt: { $in: doomedIds } });
  const cartsWith = await Cart.countDocuments({ "items.prompt": { $in: doomedIds } });
  const savedWith = await SavedCollection.countDocuments({ "items.prompt": { $in: doomedIds } });

  console.log(`  Reports about them          ${String(reports).padStart(5)} → delete ${reports}`);
  console.log(`  Shares of them              ${String(shares).padStart(5)} → delete ${shares}`);
  console.log(`  Carts holding them          ${String(cartsWith).padStart(5)} → prune those rows`);
  console.log(`  Saved collections           ${String(savedWith).padStart(5)} → prune those rows`);
  console.log("");
  console.log("  Untouched: Purchase, LedgerEntry, RefundRequest (financial history),");
  console.log("             Notification, User, everything else.");
  console.log("");

  if (!CONFIRM) {
    console.log("  Dry run complete. Nothing was changed.");
    console.log("  Run again with --confirm to delete.\n");
    await mongoose.disconnect();
    return;
  }

  const typed = await ask(`  Type DELETE to remove ${doomedIds.length} prompts from ${host}: `);
  if (typed !== "DELETE") {
    console.log("\n  Aborted. Nothing was changed.\n");
    await mongoose.disconnect();
    return;
  }

  // Snapshot first — same contract as prune-data.js.
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(__dirname, "..", `backup-prompts-${stamp}`);
  fs.mkdirSync(dir, { recursive: true });
  console.log(`\n  Writing backup to ${dir}`);

  const dump = async (name, docs) => {
    fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(docs, null, 2));
    console.log(`    ${name}.json — ${docs.length} document(s)`);
  };

  await dump("prompts", await Prompt.find({ _id: { $ne: keep._id } }).lean());
  await dump("promptreports", await PromptReport.find({ prompt: { $in: doomedIds } }).lean());
  await dump("sharedprompts", await SharedPrompt.find({ prompt: { $in: doomedIds } }).lean());
  await dump("carts", await Cart.find({ "items.prompt": { $in: doomedIds } }).lean());
  await dump("savedcollections", await SavedCollection.find({ "items.prompt": { $in: doomedIds } }).lean());

  console.log("");
  const p = await Prompt.deleteMany({ _id: { $ne: keep._id } });
  console.log(`  Prompts deleted            : ${p.deletedCount}`);

  const r = await PromptReport.deleteMany({ prompt: { $in: doomedIds } });
  console.log(`  Reports deleted            : ${r.deletedCount}`);

  const sh = await SharedPrompt.deleteMany({ prompt: { $in: doomedIds } });
  console.log(`  Shares deleted             : ${sh.deletedCount}`);

  /* $pull rather than deleting the cart: a cart may also hold the prompt that
     survives, and dropping the document would take that with it. */
  const c = await Cart.updateMany(
    { "items.prompt": { $in: doomedIds } },
    { $pull: { items: { prompt: { $in: doomedIds } } } }
  );
  console.log(`  Carts pruned               : ${c.modifiedCount}`);

  const sc = await SavedCollection.updateMany(
    { "items.prompt": { $in: doomedIds } },
    { $pull: { items: { prompt: { $in: doomedIds } } } }
  );
  console.log(`  Saved collections pruned   : ${sc.modifiedCount}`);

  const left = await Prompt.countDocuments({});
  console.log(`\n  Prompts remaining          : ${left}`);
  console.log("\n  Done.\n");
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error("\n  FAILED:", e?.message || e, "\n");
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
