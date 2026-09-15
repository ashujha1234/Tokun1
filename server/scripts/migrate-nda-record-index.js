/**
 * Backfills NdaRecord.orderRef and drops the two broken unique indexes.
 *
 * ── What was broken ─────────────────────────────────────────────────────────
 *
 * models/NdaRecord.js carried:
 *
 *   hireDealId:     { ..., default: null }
 *   serviceOrderId: { ..., default: null }
 *   index({ hireDealId: 1 },     { unique: true, sparse: true })
 *   index({ serviceOrderId: 1 }, { unique: true, sparse: true })
 *
 * `sparse` skips a document whose field is ABSENT. Defaulting both to null made
 * the field present-and-null on every record, so the index had a value to
 * collide on:
 *
 *   hire record #1  { hireDealId: A, serviceOrderId: null }   indexed
 *   hire record #2  { hireDealId: B, serviceOrderId: null }   duplicate key
 *
 * So the SECOND hire signing ever, and the second service signing ever, failed
 * — and every one after them. routes/*.js wrap this write in a try/catch on
 * purpose (a signature must not fail because an audit row didn't insert), so it
 * failed silently, leaving:
 *
 *     NDA record write failed for hire deal <id> (signature itself saved):
 *     Duplicate key violation on the requested collection
 *
 * The archive has been missing records for as long as that has been true.
 *
 * ── What this does ──────────────────────────────────────────────────────────
 *
 *   1. Writes orderRef ("hire:<id>" / "service:<id>") on every existing record.
 *      The new code keys its upsert on this, and the field is `required`, so
 *      nothing works until every row has one.
 *   2. Drops hireDealId_1 and serviceOrderId_1 — the unique ones. Mongoose
 *      creates indexes but never drops them, so they survive a deploy and keep
 *      rejecting writes no matter what the schema now says.
 *   3. Reports any engagement that already has more than one record, which the
 *      broken index could not prevent. Those need a human: this script will not
 *      guess which of two half-signed records is the real agreement.
 *
 * DRY RUN BY DEFAULT. Pass --apply to write.
 *
 *   node scripts/migrate-nda-record-index.js
 *   node scripts/migrate-nda-record-index.js --apply
 */
require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");

const APPLY = process.argv.includes("--apply");
const DEAD_INDEXES = ["hireDealId_1", "serviceOrderId_1"];

(async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set — run this from server/ with the .env in place.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  const col = mongoose.connection.db.collection("ndarecords");

  // ── 1. Backfill ───────────────────────────────────────────────────────────
  const missing = await col
    .find({ $or: [{ orderRef: { $exists: false } }, { orderRef: null }, { orderRef: "" }] })
    .project({ orderKind: 1, hireDealId: 1, serviceOrderId: 1 })
    .toArray();

  console.log(`\nrecords needing orderRef: ${missing.length}`);

  const updates = [];
  const unfixable = [];
  for (const r of missing) {
    /* orderKind is the authority where it is set; otherwise whichever id field
       actually holds an ObjectId decides. A record with neither cannot be
       pointed at an engagement and is reported rather than guessed at. */
    const kind = r.orderKind || (r.hireDealId ? "hire" : r.serviceOrderId ? "service" : null);
    const id = kind === "hire" ? r.hireDealId : kind === "service" ? r.serviceOrderId : null;
    if (!kind || !id) {
      unfixable.push(r._id);
      continue;
    }
    updates.push({ _id: r._id, orderRef: `${kind}:${id}` });
  }

  if (unfixable.length) {
    console.log(`  ${unfixable.length} record(s) have no usable order id — left alone:`);
    unfixable.slice(0, 10).forEach((id) => console.log("    " + id));
  }

  // ── 2. Duplicates the broken index let through ────────────────────────────
  const dupes = await col
    .aggregate([
      { $match: { orderKind: { $exists: true } } },
      {
        $group: {
          _id: {
            $concat: [
              { $ifNull: ["$orderKind", "?"] },
              ":",
              { $toString: { $ifNull: ["$hireDealId", { $ifNull: ["$serviceOrderId", "?"] }] } },
            ],
          },
          n: { $sum: 1 },
          ids: { $push: "$_id" },
        },
      },
      { $match: { n: { $gt: 1 } } },
    ])
    .toArray();

  if (dupes.length) {
    console.log(`\n⚠ ${dupes.length} engagement(s) already have more than one record.`);
    console.log("  The unique index on orderRef cannot be created until these are resolved.");
    dupes.slice(0, 10).forEach((d) => console.log(`    ${d._id} -> ${d.ids.join(", ")}`));
  } else {
    console.log("\nno duplicate records — the unique index will build cleanly.");
  }

  // ── 3. The dead indexes ───────────────────────────────────────────────────
  const existing = (await col.indexes()).map((i) => i.name);
  const toDrop = DEAD_INDEXES.filter((n) => existing.includes(n));
  console.log(`\nindexes present: ${existing.join(", ")}`);
  console.log(`to drop:         ${toDrop.length ? toDrop.join(", ") : "(none)"}`);

  if (!APPLY) {
    console.log(`\nDRY RUN — would write orderRef on ${updates.length} record(s) and drop ${toDrop.length} index(es).`);
    console.log("Re-run with --apply to commit.");
    return mongoose.disconnect();
  }

  if (dupes.length) {
    console.error("\nRefusing to apply while duplicate records exist — resolve them first.");
    process.exitCode = 1;
    return mongoose.disconnect();
  }

  for (const u of updates) {
    await col.updateOne({ _id: u._id }, { $set: { orderRef: u.orderRef } });
  }
  console.log(`\norderRef written on ${updates.length} record(s).`);

  for (const name of toDrop) {
    await col.dropIndex(name);
    console.log(`dropped index ${name}`);
  }

  /* Created here rather than left to Mongoose's autoIndex: this has to exist
     before the next signature, and autoIndex is off in some deployments. */
  await col.createIndex({ orderRef: 1 }, { unique: true, name: "orderRef_1" });
  console.log("created unique index orderRef_1");

  await mongoose.disconnect();
})().catch((err) => {
  console.error("migration failed:", err.message);
  process.exit(1);
});
