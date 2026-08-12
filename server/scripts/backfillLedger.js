#!/usr/bin/env node
/**
 * Reconstruct the money ledger from Razorpay's history.
 *
 * The ledger only starts filling from the moment its code shipped, so
 * everything before that exists solely in Razorpay's API. This walks that
 * history and writes the rows we would have written at the time.
 *
 * Safety properties, in the order they matter:
 *
 *   1. INSERT-ONLY. Nothing is updated or deleted, here or in any other
 *      collection. No Purchase, HireDeal or ServiceOrder is touched.
 *   2. IDEMPOTENT. Rows carry the same natural key the live path uses, so a
 *      second run — or a run overlapping live traffic — inserts nothing new.
 *      Re-running it is safe and expected.
 *   3. READ-ONLY against Razorpay. Only GET requests.
 *   4. Rows are marked `source: "backfill"`, so when a backfilled figure and a
 *      webhook figure disagree you can tell which to trust.
 *
 * Usage:
 *   node server/scripts/backfillLedger.js --days=180
 *   node server/scripts/backfillLedger.js --days=30 --dry-run
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ledger = require("../utils/ledger");
const LedgerEntry = require("../models/LedgerEntry");

const RZP_KEY = process.env.RAZORPAY_KEY_ID;
const RZP_SECRET = process.env.RAZORPAY_KEY_SECRET;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : fallback;
};
const DAYS = Number(arg("days", 90));
const DRY_RUN = args.includes("--dry-run");

const authHeader = () =>
  "Basic " + Buffer.from(`${RZP_KEY}:${RZP_SECRET}`).toString("base64");

/**
 * Walk a Razorpay collection endpoint.
 *
 * No page cap here, unlike the admin screen's version — a one-off script run
 * by hand is exactly the place where completeness beats bounded latency.
 */
async function fetchAll(path, from, to) {
  const out = [];
  let skip = 0;

  for (;;) {
    const url = `https://api.razorpay.com/v1/${path}?count=100&skip=${skip}&from=${from}&to=${to}`;
    const res = await fetch(url, { headers: { Authorization: authHeader() } });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.error?.description || `Razorpay ${res.status} on ${path}`);
    }

    const items = data?.items || [];
    out.push(...items);
    process.stdout.write(`\r  ${path}: ${out.length} fetched`);

    if (items.length < 100) break;
    skip += 100;
  }

  process.stdout.write("\n");
  return out;
}

async function main() {
  if (!RZP_KEY || !RZP_SECRET) {
    console.error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing from env.");
    process.exit(1);
  }
  if (!MONGO_URI) {
    console.error("MONGO_URI missing from env.");
    process.exit(1);
  }

  const to = Math.floor(Date.now() / 1000);
  const from = to - DAYS * 86400;

  console.log(`Backfilling ledger for the last ${DAYS} days${DRY_RUN ? " (DRY RUN)" : ""}`);
  console.log(`Window: ${new Date(from * 1000).toISOString()} → ${new Date(to * 1000).toISOString()}\n`);

  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB\n");

  const before = await LedgerEntry.countDocuments();

  const payments = await fetchAll("payments", from, to);
  const settlements = await fetchAll("settlements", from, to).catch((err) => {
    // Settlements need a permission the key may not carry. Not fatal — the
    // payments and refunds are the valuable part.
    console.warn(`  settlements skipped: ${err.message}`);
    return [];
  });

  console.log(`\nFetched ${payments.length} payments, ${settlements.length} settlements`);

  let written = 0;
  let skipped = 0;

  for (const payment of payments) {
    // `captured` is the only state where money actually arrived. `authorized`
    // is a hold that may never be taken; `failed` never moved anything.
    if (payment.status !== "captured") {
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      written++;
    } else {
      const row = await ledger.recordPayment(payment, { source: "backfill" });
      row ? written++ : skipped++;
    }

    // A captured payment carries its refunds inline, so this needs no second
    // pass over /refunds.
    if (Number(payment.amount_refunded || 0) > 0) {
      const refunds = await fetchAll(`payments/${payment.id}/refunds`, from, to).catch(() => []);
      for (const refund of refunds) {
        if (DRY_RUN) {
          written++;
          continue;
        }
        const row = await ledger.recordRefund(refund, {
          source: "backfill",
          initiatedBy: "unknown",
        });
        row ? written++ : skipped++;
      }
    }
  }

  for (const settlement of settlements) {
    if (DRY_RUN) {
      written++;
      continue;
    }
    const row = await ledger.recordSettlement(settlement, { source: "backfill" });
    row ? written++ : skipped++;
  }

  const after = DRY_RUN ? before : await LedgerEntry.countDocuments();

  console.log("\n─────────────────────────────────────");
  console.log(`Rows written : ${written}`);
  console.log(`Skipped      : ${skipped}  (already present, or not captured)`);
  console.log(`Ledger total : ${before} → ${after}`);
  if (DRY_RUN) console.log("\nDRY RUN — nothing was written.");
  console.log("─────────────────────────────────────");

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("\nBackfill failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
