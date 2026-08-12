/**
 * Recomputes `tokun_price` on every paid prompt from the CURRENT fee rates.
 *
 * tokun_price is the buyer-facing price shown on a listing — list price plus
 * Tokun's platform fee plus GST on that fee — and it's written by a pre-save
 * hook. A hook only runs on save, so a rate change reaches nothing already in
 * the database: every prompt keeps advertising the old fee while checkout,
 * which computes live via splitPromptSale(), charges the new one. The card says
 * ₹105 and the payment sheet says ₹103.54.
 *
 * RUN THIS AFTER ANY CHANGE TO:
 *   TOKUN_PLATFORM_FEE_PERCENT
 *   TOKUN_GST_PERCENT
 *
 * Safe to re-run: it only ever rewrites tokun_price to what the current rates
 * say it should be, and skips prompts already holding that value. Free prompts
 * are set to 0, which is what the hook does.
 *
 *   node scripts/recalcPromptPrices.js           # do it
 *   node scripts/recalcPromptPrices.js --dry-run # just report
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Prompt = require("../models/Prompt");
const {
  buyerCharge,
  PLATFORM_FEE_PERCENT,
  GST_PERCENT,
} = require("../utils/fees");

const DRY_RUN = process.argv.includes("--dry-run");

(async () => {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

  console.log(
    `${DRY_RUN ? "DRY RUN — nothing will be written" : "Recalculating prompt prices"}\n` +
      `Platform fee ${PLATFORM_FEE_PERCENT}%, GST on fee ${GST_PERCENT}%\n`
  );

  const prompts = await Prompt.find({}).select("title price free tokun_price").lean();

  let changed = 0;
  let unchanged = 0;

  for (const p of prompts) {
    const expected = p.free || !Number.isFinite(p.price) ? 0 : buyerCharge(p.price).totalPayable;
    const current = Number(p.tokun_price || 0);

    if (current === expected) {
      unchanged += 1;
      continue;
    }

    changed += 1;
    console.log(
      `  ${String(p.title || "Untitled").slice(0, 48).padEnd(50)} ` +
        `₹${p.price} listed — buyer price ${current} → ${expected}`
    );

    // updateOne, NOT save(): the pre-save hook also recalculates the average
    // rating, and loading a lean doc back through it risks writing derived
    // fields this script has no business touching.
    if (!DRY_RUN) {
      await Prompt.updateOne({ _id: p._id }, { $set: { tokun_price: expected } });
    }
  }

  console.log(
    `\n${changed} prompt${changed === 1 ? "" : "s"} ${DRY_RUN ? "would be" : ""} updated, ` +
      `${unchanged} already correct.`
  );

  await mongoose.disconnect();
})().catch((err) => {
  console.error("recalcPromptPrices failed:", err);
  process.exit(1);
});
