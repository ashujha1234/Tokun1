#!/usr/bin/env node
/**
 * fix-admin-conversation-index.js — retire the old `sellerUserId` index and the
 * rows that were written against it, then sync AdminConversation to the schema.
 *
 * This ran on every server boot, inline in index.js between mongoose.connect()
 * and server.listen(). It was moved here because three separate things were
 * wrong with it living there, and only the first is obvious:
 *
 *   1. It DELETES DOCUMENTS. Azure App Service restarts the process constantly
 *      — every deploy, every scale event, every wake from idle, every crash. A
 *      deleteMany on the boot path is a deleteMany that runs on a schedule
 *      nobody chose, against production, with no dry run and no record of what
 *      it removed.
 *
 *   2. It races itself. Scale out to two instances and both reach dropIndex on
 *      the same index at the same time; one wins and the other throws. The
 *      inline version swallowed that in a try/catch and logged a "warning", so
 *      a genuine failure and normal operation looked identical in the log.
 *
 *   3. syncIndexes() blocks. On a collection large enough to matter it can take
 *      long enough that Azure's health probe gives up on a boot that was
 *      actually fine, and restarts it — back to step 1.
 *
 * A migration is a thing you run once, watch, and confirm. Startup is for
 * connecting and listening.
 *
 * ⚠️  DELETES documents that have `sellerUserId` but no `sellerId` — the rows
 *     written under the old field name. Dry run by default; nothing is written
 *     without --apply.
 *
 * Usage
 *   node scripts/fix-admin-conversation-index.js            # dry run — prints the plan
 *   node scripts/fix-admin-conversation-index.js --apply    # do it
 */

require("dotenv").config();
const mongoose = require("mongoose");

const APPLY = process.argv.includes("--apply");

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGO_URI / MONGODB_URI. Aborting.");
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 60000 });

  const AdminConversation = require("../models/AdminConversation");
  const coll = AdminConversation.collection;

  console.log(APPLY ? "APPLY — writing changes\n" : "DRY RUN — nothing will be written\n");

  /* ---- 1. indexes keyed on the retired field ---- */
  const indexes = await coll.indexes();
  const stale = indexes.filter(
    (i) => i.key && Object.prototype.hasOwnProperty.call(i.key, "sellerUserId")
  );

  if (!stale.length) {
    console.log("Indexes: none keyed on sellerUserId — nothing to drop.");
  } else {
    for (const idx of stale) {
      console.log(`Indexes: drop ${idx.name}  ${JSON.stringify(idx.key)}`);
      if (APPLY) await coll.dropIndex(idx.name);
    }
  }

  /* ---- 2. rows written under the old field name ----
     Counted and shown before anything is removed. The inline version deleted
     these silently, so there is no record of how many went in earlier boots. */
  const orphanFilter = {
    sellerUserId: { $exists: true },
    sellerId: { $exists: false },
  };
  const orphanCount = await coll.countDocuments(orphanFilter);

  if (!orphanCount) {
    console.log("Documents: none with sellerUserId and no sellerId.");
  } else {
    console.log(`Documents: ${orphanCount} to delete (sellerUserId set, sellerId missing)`);
    const sample = await coll.find(orphanFilter).limit(5).toArray();
    for (const d of sample) {
      console.log(`  _id=${d._id}  adminId=${d.adminId}  sellerUserId=${d.sellerUserId}`);
    }
    if (orphanCount > sample.length) {
      console.log(`  … and ${orphanCount - sample.length} more`);
    }
    if (APPLY) {
      const res = await coll.deleteMany(orphanFilter);
      console.log(`  deleted ${res.deletedCount}`);
    }
  }

  /* ---- 3. bring indexes in line with the schema ---- */
  if (APPLY) {
    console.log("Indexes: syncIndexes() …");
    await AdminConversation.syncIndexes();
    console.log("Indexes: synced.");
  } else {
    console.log("Indexes: would run syncIndexes()");
  }

  await mongoose.disconnect();
  console.log(APPLY ? "\nDone." : "\nDry run complete — re-run with --apply to write.");
}

main().catch(async (err) => {
  console.error("Failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
