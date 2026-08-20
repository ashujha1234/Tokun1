/**
 * Gives every existing image listing the perceptual hash new uploads get.
 *
 *   node scripts/backfillPerceptualHashes.js            # dry run, changes nothing
 *   node scripts/backfillPerceptualHashes.js --write    # actually saves
 *
 * WHY THIS EXISTS
 * The duplicate check added in utils/imageProvenance compares an upload against
 * the hashes we have STORED. Only uploads made after it shipped have one — so
 * everything listed before that is invisible to it, and re-uploading one of
 * those images sails through exactly as it did before the check existed. That is
 * not a hole in the check; it is a hole in the data, and this fills it.
 *
 * The stored file is the watermarked one (we composite the mark before uploading
 * to Azure) while a new upload is hashed from the seller's original. That is
 * fine: a pHash reads the low-frequency structure of a picture, and a small mark
 * in one corner barely moves it — see scripts/checkPerceptualHash.js, where a
 * watermarked, rescaled, re-encoded copy sits 0-4 bits from its original against
 * a threshold of 10.
 *
 * Safe to run more than once: it only touches rows that have no hash yet.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Prompt = require("../models/Prompt");
// Registered so the populate below can resolve it — requiring the model is what
// registers it with mongoose, and Prompt only holds a ref.
require("../models/User");
const { perceptualHash, hammingDistance, DUPLICATE_DISTANCE } = require("../utils/imageProvenance");

const WRITE = process.argv.includes("--write");
/** Kept low on purpose: this downloads full-size originals from Azure. */
const CONCURRENCY = 4;

const fetchBuffer = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`http_${res.status}`);
  return Buffer.from(await res.arrayBuffer());
};

(async () => {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

  const targets = await Prompt.find({
    "attachment.type": "image",
    $or: [{ attachmentPhash: { $in: ["", null] } }, { attachmentPhash: { $exists: false } }],
  })
    .select("_id title attachment userId")
    .lean();

  console.log(`${targets.length} image listing(s) without a perceptual hash.`);
  console.log(WRITE ? "Mode: WRITE\n" : "Mode: dry run — pass --write to save\n");

  const results = [];
  let done = 0;

  /* A small worker pool rather than Promise.all over everything: the whole
     catalogue at once means the whole catalogue downloading at once. */
  const queue = [...targets];
  const worker = async () => {
    for (;;) {
      const p = queue.shift();
      if (!p) return;

      const label = `${p.title || "Untitled"} (${String(p._id).slice(-6)})`;
      try {
        const buf = await fetchBuffer(p.attachment.path);
        const hash = await perceptualHash(buf);
        if (!hash) throw new Error("not a readable image");

        if (WRITE) await Prompt.updateOne({ _id: p._id }, { $set: { attachmentPhash: hash } });
        results.push({ id: String(p._id), title: p.title, hash });
        console.log(`  ${(++done).toString().padStart(3)}  ${hash}  ${label}`);
      } catch (err) {
        console.log(`  ${(++done).toString().padStart(3)}  ——  ${label}  · SKIPPED: ${err.message}`);
      }
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  /* What the check would have caught if these hashes had existed. This is the
     point of the exercise, so it is worth printing rather than leaving to be
     discovered on the next upload. */
  const stored = await Prompt.find({ attachmentPhash: { $nin: ["", null] } })
    .select("_id title attachmentPhash userId")
    .populate("userId", "email")
    .lean();

  const all = [...stored];
  for (const r of results) {
    if (!all.some((s) => String(s._id) === r.id)) {
      all.push({ _id: r.id, title: r.title, attachmentPhash: r.hash });
    }
  }

  const pairs = [];
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const d = hammingDistance(all[i].attachmentPhash, all[j].attachmentPhash);
      if (d <= DUPLICATE_DISTANCE) pairs.push({ a: all[i], b: all[j], d });
    }
  }

  console.log(`\nLOOK-ALIKE PAIRS ALREADY IN THE CATALOGUE: ${pairs.length}`);
  for (const { a, b, d } of pairs) {
    console.log(`  ${d} bits apart`);
    console.log(`    "${a.title}"  ${a.userId?.email || ""}  (${String(a._id).slice(-6)})`);
    console.log(`    "${b.title}"  ${b.userId?.email || ""}  (${String(b._id).slice(-6)})`);
  }

  if (!WRITE) console.log("\nNothing was saved. Re-run with --write.");
})()
  .catch((err) => {
    console.error("ERROR:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
