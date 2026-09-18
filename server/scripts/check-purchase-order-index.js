/**
 * The unique index that stops one payment buying the same product twice.
 *
 *   node scripts/check-purchase-order-index.js            # report only
 *   node scripts/check-purchase-order-index.js --apply    # build it
 *
 * ── Why this is a script and not left to Mongoose ───────────────────────────
 *
 * models/Purchase.js declares the index, and Mongoose builds declared indexes
 * at startup. On an empty collection that is fine. On a live one, a unique
 * index whose key is ALREADY duplicated cannot be built — and Mongoose logs
 * that failure rather than throwing, so the app boots, nothing looks wrong, and
 * the guard everyone believes is protecting the money does not exist.
 *
 * So the build happens here, deliberately, where the failure is the output.
 *
 * ── What the index is ───────────────────────────────────────────────────────
 *
 *   { razorpayOrderId: 1, prompt: 1 }, unique,
 *   restricted to rows where razorpayOrderId is a string
 *
 * Compound because a cart writes one Purchase per prompt against ONE order id —
 * keyed on the order alone it would reject every multi-item cart. Restricted
 * because a free product is a Purchase with no order id, and those must not
 * collide with each other.
 *
 * A duplicate found here is not necessarily a bug to undo: it is one payment
 * that recorded the same product twice, so one row is a real sale and the other
 * is the artefact. Decide which per pair — this script never deletes anything.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Purchase = require("../models/Purchase");

const APPLY = process.argv.includes("--apply");
const INDEX_NAME = "uniq_order_prompt";

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { ssl: true, serverSelectionTimeoutMS: 10000 });
  const col = Purchase.collection;

  const existing = await col.indexes();
  const already = existing.find((i) => i.name === INDEX_NAME);
  console.log(already ? `Index "${INDEX_NAME}" already exists.` : `Index "${INDEX_NAME}" not present.`);

  const dupes = await col
    .aggregate([
      { $match: { razorpayOrderId: { $type: "string" } } },
      { $group: { _id: { order: "$razorpayOrderId", prompt: "$prompt" }, n: { $sum: 1 }, ids: { $push: "$_id" } } },
      { $match: { n: { $gt: 1 } } },
      { $sort: { n: -1 } },
      { $limit: 50 },
    ])
    .toArray();

  const total = await col.countDocuments({ razorpayOrderId: { $type: "string" } });
  console.log(`Purchases carrying an order id: ${total}`);
  console.log(`Duplicate (order, product) pairs: ${dupes.length}${dupes.length === 50 ? "+ (capped)" : ""}`);

  for (const d of dupes) {
    console.log(`  order ${d._id.order} / product ${d._id.prompt} -> ${d.n} rows: ${d.ids.join(", ")}`);
  }

  if (dupes.length) {
    console.log("\nThe index cannot be built while these exist. Decide which row of each");
    console.log("pair is the real sale, remove the other, then run this again.");
  } else if (already) {
    console.log("\nNothing to do.");
  } else if (!APPLY) {
    console.log("\nNo duplicates. Re-run with --apply to build the index.");
  } else {
    process.stdout.write("\nBuilding... ");
    await col.createIndex(
      { razorpayOrderId: 1, prompt: 1 },
      { unique: true, partialFilterExpression: { razorpayOrderId: { $type: "string" } }, name: INDEX_NAME }
    );
    console.log("done.");
  }

  await mongoose.disconnect();
})().catch((err) => {
  console.error("failed:", err.message);
  process.exit(1);
});
