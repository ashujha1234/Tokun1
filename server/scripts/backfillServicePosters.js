/**
 * Generates the missing poster frames for service listings whose cover is a
 * video and which were created before posters existed.
 *
 * New uploads get a poster at create time (routes/serviceRoutes.js). This is
 * only for the back catalogue — without it those listings keep downloading the
 * whole video to render a 160px card.
 *
 * Safe to re-run: a listing whose posters are already filled in is skipped, and
 * nothing is ever deleted. Existing videos and images are untouched — the only
 * writes are new poster blobs and the `mediaPosters` array.
 *
 *   node scripts/backfillServicePosters.js           # do it
 *   node scripts/backfillServicePosters.js --dry-run # just report
 */
require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");
const Service = require("../models/Service");
const uploadToAzure = require("../utils/uploadToAzure");
const { isVideoUpload, generateVideoPoster } = require("../utils/videoPoster");

const DRY_RUN = process.argv.includes("--dry-run");

(async () => {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log(DRY_RUN ? "DRY RUN — nothing will be written\n" : "Backfilling service posters\n");

  const services = await Service.find({ "media.0": { $exists: true } }).select("title media mediaPosters");

  let scanned = 0;
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const svc of services) {
    const media = svc.media || [];
    // Index-aligned with media; pad so posters[i] always lines up with media[i].
    const posters = [...(svc.mediaPosters || [])];
    while (posters.length < media.length) posters.push("");

    let touched = false;

    for (let i = 0; i < media.length; i++) {
      const url = media[i];
      if (!url || !isVideoUpload(url)) continue;
      scanned++;

      if (posters[i]) {
        skipped++;
        continue;
      }

      // Only absolute URLs can be fetched here. Legacy /uploads/... paths live
      // on the app server's own disk and are reported rather than guessed at.
      if (!/^https?:\/\//i.test(url)) {
        console.log(`  SKIP (local path, not in blob storage): ${url}`);
        skipped++;
        continue;
      }

      const name = url.split("/").pop().split("?")[0];
      process.stdout.write(`  ${name.slice(0, 54)} … `);

      if (DRY_RUN) {
        console.log("would generate a poster");
        generated++;
        continue;
      }

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`fetch ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());

        const frame = await generateVideoPoster(buf, path.extname(name) || ".mp4");
        if (!frame) throw new Error("ffmpeg produced no frame");

        const posterUrl = await uploadToAzure(
          frame,
          `${path.parse(name).name}-poster.jpg`,
          "services"
        );
        posters[i] = posterUrl;
        touched = true;
        generated++;
        console.log(`ok (${(frame.length / 1024).toFixed(0)} KB, was ${(buf.length / 1048576).toFixed(1)} MB)`);
      } catch (err) {
        failed++;
        console.log(`FAILED — ${err.message}`);
      }
    }

    if (touched && !DRY_RUN) {
      svc.mediaPosters = posters;
      await svc.save();
      console.log(`    saved → "${(svc.title || "").slice(0, 46)}"`);
    }
  }

  console.log(
    `\nvideo covers found: ${scanned} | posters generated: ${generated} | already had one / skipped: ${skipped} | failed: ${failed}`
  );
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
