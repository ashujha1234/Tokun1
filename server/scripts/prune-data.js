#!/usr/bin/env node
/**
 * prune-data.js — reduce the payment/order collections to their newest document.
 *
 * ⚠️  THIS DELETES FINANCIAL RECORDS AND CANNOT BE UNDONE.
 *     Take a mongodump first. See the banner it prints.
 *
 * Scope is payments and orders ONLY. Users, prompts, freelancer profiles,
 * organizations, chats, categories and everything else are never touched — the
 * TARGETS list below is the whole of what this can reach, and it is a fixed
 * allow-list rather than "every collection except…", so a model added later
 * cannot be swept up by accident.
 *
 * Per collection it keeps the single newest document by `createdAt` and deletes
 * the rest.
 *
 * Usage
 *   node scripts/prune-data.js                  # dry run — prints counts, deletes nothing
 *   node scripts/prune-data.js --confirm        # actually delete
 *   node scripts/prune-data.js --recompute-wallet   # also rebuild PlatformWallet totals
 *
 * Dry run is the default deliberately: a destructive script whose no-argument
 * behaviour is destructive is one fat-finger away from an incident.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

const CONFIRM = process.argv.includes("--confirm");
const RECOMPUTE_WALLET = process.argv.includes("--recompute-wallet");
/* Skips the JSON snapshot. There is no reason to pass this unless you already
   have a mongodump — without it, --confirm has no undo whatsoever. */
const SKIP_BACKUP = process.argv.includes("--no-backup");

/* The allow-list. Nothing outside this is opened, let alone written to. */
const TARGETS = [
  { model: "Payment", label: "Razorpay payment records" },
  { model: "Purchase", label: "Prompt purchases" },
  { model: "HireDeal", label: "Hire deals" },
  { model: "ServiceOrder", label: "Service bookings" },
  { model: "RefundRequest", label: "Refund requests" },
  { model: "EscrowDispute", label: "Cancellations & disputes" },
  { model: "WalletTopup", label: "Wallet top-ups" },
  { model: "WalletWithdrawal", label: "Seller withdrawal requests" },
  { model: "LedgerEntry", label: "Internal ledger rows" },
  { model: "WebhookEvent", label: "Razorpay webhook log" },
  { model: "SubscriptionPeriod", label: "Subscription billing periods" },
];

const NOT_TOUCHED = [
  "User", "Prompt", "FreelancerProfile", "Organization", "Category",
  "Conversation", "Message", "Notification", "Review", "Service",
  "BankAccount", "KycSubmission", "AdminUser", "Cart", "Wallet",
];

const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

async function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => rl.question(question, resolve));
  rl.close();
  return answer.trim();
}

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DB_URL;
  if (!uri) {
    console.error("No MONGO_URI in the environment. Aborting.");
    process.exit(1);
  }

  // Host only — the credentials in the URI never reach the terminal or a log.
  const host = uri.replace(/^mongodb(\+srv)?:\/\/[^@]*@/, "").split("/")[0].split("?")[0];

  console.log("");
  console.log("════════════════════════════════════════════════════════════════");
  console.log(CONFIRM ? "  DELETING DATA" : "  DRY RUN — nothing will be deleted");
  console.log("════════════════════════════════════════════════════════════════");
  console.log(`  Cluster : ${host}`);
  console.log(`  Scope   : payments & orders only (${TARGETS.length} collections)`);
  console.log(`  Keeping : the newest 1 document in each`);
  console.log("════════════════════════════════════════════════════════════════");
  console.log("");

  await mongoose.connect(uri);

  const plan = [];
  let grandTotal = 0;
  let grandDelete = 0;

  for (const target of TARGETS) {
    let Model;
    try {
      Model = require(`../models/${target.model}`);
    } catch {
      plan.push({ ...target, error: "model not found — skipped" });
      continue;
    }

    const total = await Model.countDocuments({});
    // The one that survives, so the dry run can name it rather than saying
    // "keeps 1" and leaving you to guess which.
    const newest = total > 0
      ? await Model.findOne({}).sort({ createdAt: -1 }).select("_id createdAt").lean()
      : null;
    const toDelete = Math.max(0, total - (newest ? 1 : 0));

    grandTotal += total;
    grandDelete += toDelete;

    plan.push({
      ...target,
      collection: Model.collection.name,
      total,
      toDelete,
      keepId: newest?._id ? String(newest._id) : null,
      keepDate: newest?.createdAt || null,
      Model,
      keepObjectId: newest?._id || null,
    });
  }

  const width = Math.max(...plan.map((p) => p.label.length));
  for (const p of plan) {
    if (p.error) {
      console.log(`  ${p.label.padEnd(width)}  ${p.error}`);
      continue;
    }
    const keep = p.keepDate ? new Date(p.keepDate).toISOString().slice(0, 10) : "—";
    console.log(
      `  ${p.label.padEnd(width)}  ${String(p.total).padStart(6)} total  ` +
      `→ delete ${String(p.toDelete).padStart(6)}  (keeping ${keep})`
    );
  }

  console.log("");
  console.log(`  TOTAL: ${grandDelete} of ${grandTotal} documents would be deleted.`);
  console.log("");

  /* PlatformWallet is a singleton whose transactions live in an array, so it is
     trimmed rather than deleted — dropping the document would lose the running
     totals as well as the rows. */
  const PlatformWallet = require("../models/PlatformWallet");
  const wallet = await PlatformWallet.findOne({ key: "platform" }).lean();
  if (wallet) {
    const txCount = (wallet.transactions || []).length;
    console.log(`  PlatformWallet ledger: ${txCount} transactions → keeping newest 1`);
    console.log(`    totalRevenue  ${money(wallet.totalRevenue)}`);
    console.log(`    gstCollected  ${money(wallet.gstCollected)}`);
    if (RECOMPUTE_WALLET) {
      console.log("    --recompute-wallet: totals WILL be rebuilt from the surviving row.");
    } else {
      console.log("    Totals left as they are. They will no longer match the");
      console.log("    transaction list — pass --recompute-wallet to rebuild them.");
    }
    console.log("");
  }

  console.log("  NOT touched: " + NOT_TOUCHED.join(", ") + ", and every other collection.");
  console.log("");

  if (!CONFIRM) {
    console.log("  Dry run complete. Nothing was changed.");
    console.log("");
    console.log("  Before running for real:");
    console.log('    mongodump --uri="$MONGO_URI" --out=./backup-$(date +%F)');
    console.log("");
    console.log("  Then:");
    console.log("    node scripts/prune-data.js --confirm");
    console.log("");
    await mongoose.disconnect();
    return;
  }

  /* Typed confirmation, not a y/n. A prompt you can clear by leaning on Enter
     is not a safeguard on something this size. */
  console.log(`  About to permanently delete ${grandDelete} documents from ${host}.`);
  const typed = await ask('  Type DELETE to proceed (anything else aborts): ');
  if (typed !== "DELETE") {
    console.log("\n  Aborted. Nothing was changed.\n");
    await mongoose.disconnect();
    return;
  }

  /* Snapshot every document about to be destroyed, BEFORE destroying it.

     mongodump is the better tool but it is not always installed, and a
     destructive script whose undo depends on a binary that may be absent has no
     undo. Written first and fsync'd, so a crash midway through the deletes
     still leaves the rows on disk. */
  let backupDir = null;
  if (!SKIP_BACKUP) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    backupDir = path.join(__dirname, "..", `backup-prune-${stamp}`);
    fs.mkdirSync(backupDir, { recursive: true });

    console.log(`  Writing backup to ${backupDir}`);
    for (const p of plan) {
      if (p.error || !p.Model) continue;
      const filter = p.keepObjectId ? { _id: { $ne: p.keepObjectId } } : {};
      const docs = await p.Model.find(filter).lean();
      const file = path.join(backupDir, `${p.collection}.json`);
      fs.writeFileSync(file, JSON.stringify(docs, null, 2));
      console.log(`    ${p.collection}.json — ${docs.length} document(s)`);
    }
    // The wallet's transaction array is data too, and it is about to be trimmed.
    if (wallet) {
      fs.writeFileSync(
        path.join(backupDir, "platformwallet.json"),
        JSON.stringify(wallet, null, 2)
      );
      console.log(`    platformwallet.json — full document incl. totals`);
    }
    console.log("");
  } else {
    console.log("  --no-backup: no snapshot written. This is not undoable.\n");
  }

  for (const p of plan) {
    if (p.error || !p.Model) continue;
    if (p.toDelete === 0) {
      console.log(`  ${p.label}: nothing to delete.`);
      continue;
    }
    const filter = p.keepObjectId ? { _id: { $ne: p.keepObjectId } } : {};
    const res = await p.Model.deleteMany(filter);
    console.log(`  ${p.label}: deleted ${res.deletedCount}.`);
  }

  if (wallet) {
    const newest = [...(wallet.transactions || [])].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )[0];
    const kept = newest ? [newest] : [];

    const update = { transactions: kept };
    if (RECOMPUTE_WALLET) {
      // Rebuilt from what actually survives, so the ledger and the totals agree.
      const commission = kept
        .filter((t) => t.type === "commission")
        .reduce((s, t) => s + Number(t.amount || 0), 0);
      const gst = kept
        .filter((t) => t.type === "gst")
        .reduce((s, t) => s + Number(t.amount || 0), 0);
      update.totalRevenue = +commission.toFixed(2);
      update.availableBalance = +commission.toFixed(2);
      update.gstCollected = +gst.toFixed(2);
      update.totalWithdrawn = 0;
    }

    await PlatformWallet.updateOne({ key: "platform" }, { $set: update });
    console.log(
      `  PlatformWallet: trimmed to ${kept.length} transaction(s)` +
      (RECOMPUTE_WALLET ? ", totals rebuilt." : ", totals left unchanged.")
    );
  }

  console.log("");
  console.log("  Done.");
  console.log("");
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("\n  FAILED:", err?.message || err);
  console.error("  Nothing further was attempted.\n");
  try {
    await mongoose.disconnect();
  } catch {
    /* already down */
  }
  process.exit(1);
});
