/**
 * Build NdaRecord rows for agreements signed before the archive existed.
 *
 *   node scripts/backfillNdaRecords.js --dry     # report only, writes nothing
 *   node scripts/backfillNdaRecords.js           # write
 *
 * Why this is needed at all: signatures were stored only as fields on HireDeal
 * and ServiceOrder. models/NdaRecord.js now holds them as a first-class,
 * queryable, append-only record, and the admin screen reads that collection
 * exclusively. Without this pass, /admin/nda opens empty on a platform with
 * months of signed agreements on it, which reads as "nobody has signed anything"
 * rather than "the archive starts today".
 *
 * ── What a backfilled record can and cannot say ─────────────────────────────
 *
 * It records exactly what the order actually holds, and nothing more:
 *
 *   ✓ who signed, from the order's party fields
 *   ✓ when, from ndaClientSignedAt / ndaBuyerSignedAt etc.
 *   ✓ the drawn signature, where one was stored
 *   ✓ the blob, where the document survived
 *
 *   ✗ sha256 — the bytes were never hashed, and hashing them now would prove
 *     only that the file matches itself today. Left empty, which the model
 *     documents as "not provable" rather than faking a guarantee.
 *   ✗ ip / userAgent — never captured. Left empty.
 *   ✗ agreementVersion — recorded as "1.0", which is honest: 1.0 is the only
 *     text that ever shipped without a version stamp.
 *
 * The frozen terms snapshot is taken from the order AS IT IS NOW, and that is a
 * real limitation rather than a bug to fix: the terms at signing were not
 * recorded anywhere, so this is the best available approximation and the only
 * one. `backfilled: true` is set on every row this creates so no one later
 * mistakes an approximation for a contemporaneous record.
 *
 * Idempotent. Records are keyed on the order by a unique index, and this skips
 * any order that already has one — so a re-run after a partial failure is safe,
 * and a re-run after real signatures have arrived will not touch them.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const HireDeal = require("../models/HireDeal");
const ServiceOrder = require("../models/ServiceOrder");
const NdaRecord = require("../models/NdaRecord");

const DRY = process.argv.includes("--dry");

/* Per-kind mapping from the order's own NDA field names onto the record's
   normalised client/creator shape. The two collections disagree on every field
   name, which is most of why the archive exists. */
const KINDS = [
  {
    kind: "hire",
    model: HireDeal,
    idField: "hireDealId",
    titleField: "title",
    sides: [
      {
        role: "client",
        orderRole: "client",
        partyField: "clientId",
        urlField: "ndaClientUrl",
        blobField: "ndaClientBlob",
        sigField: "ndaClientSignature",
        atField: "ndaClientSignedAt",
      },
      {
        role: "creator",
        orderRole: "freelancer",
        partyField: "freelancerId",
        urlField: "ndaFreelancerUrl",
        blobField: "ndaFreelancerBlob",
        sigField: "ndaFreelancerSignature",
        atField: "ndaFreelancerSignedAt",
      },
    ],
    container: "nda",
  },
  {
    kind: "service",
    model: ServiceOrder,
    idField: "serviceOrderId",
    titleField: "serviceTitle",
    sides: [
      {
        role: "client",
        orderRole: "buyer",
        partyField: "buyerId",
        urlField: "ndaBuyerUrl",
        blobField: "ndaBuyerBlob",
        sigField: "ndaBuyerSignature",
        atField: "ndaBuyerSignedAt",
      },
      {
        role: "creator",
        orderRole: "seller",
        partyField: "sellerId",
        urlField: "ndaSellerUrl",
        blobField: "ndaSellerBlob",
        sigField: "ndaSellerSignature",
        atField: "ndaSellerSignedAt",
      },
    ],
    container: "service-nda",
  },
];

const when = (d) => (d ? new Date(d).toISOString().slice(0, 19).replace("T", " ") : "—");

async function backfillKind(cfg) {
  /* The URL field is the signal, not the blob field.
     A URL with no blob is exactly the legacy state described in the model
     headers — signed, but the file was written to a scratch directory the host
     wiped. Those signatures are real and belong in the archive; keying off the
     blob would silently drop every one of them, which is the opposite of what
     an audit backfill is for. */
  const anySigned = {
    $or: cfg.sides.map((s) => ({ [s.urlField]: { $nin: ["", null] } })),
  };

  const orders = await cfg.model
    .find(anySigned)
    .populate(cfg.sides[0].partyField, "name email")
    .populate(cfg.sides[1].partyField, "name email")
    .lean();

  let created = 0;
  let skipped = 0;
  let noParties = 0;

  for (const order of orders) {
    const existing = await NdaRecord.findOne({ [cfg.idField]: order._id }).select("_id").lean();
    if (existing) {
      skipped += 1;
      continue;
    }

    const client = order[cfg.sides[0].partyField];
    const creator = order[cfg.sides[1].partyField];
    /* A deleted user populates to null, and clientId/creatorId are required on
       the record. Skipped and counted rather than written with a null party:
       a record that can't name both sides answers no question worth asking. */
    if (!client?._id || !creator?._id) {
      noParties += 1;
      console.warn(`  ! ${cfg.kind} ${order._id}: a party no longer exists — skipped`);
      continue;
    }

    const signatures = cfg.sides
      .filter((s) => order[s.urlField])
      .map((s) => {
        const party = order[s.partyField];
        return {
          role: s.role,
          orderRole: s.orderRole,
          userId: party?._id,
          name: party?.name || "",
          email: party?.email || "",
          /* Falls back to the order's own timestamps when the per-side one is
             missing. Some early records set the URL but not the date; using the
             order's creation date is wrong-but-bounded, and a required field
             cannot simply be left off. */
          signedAt: order[s.atField] || order.updatedAt || order.createdAt || new Date(),
          signatureImage: order[s.sigField] || "",
          blobName: order[s.blobField] || "",
          // Only claimed when there is actually a blob — see the header.
          container: order[s.blobField] ? cfg.container : "",
          sha256: "",
          byteSize: 0,
          agreementVersion: "1.0",
          ip: "",
          userAgent: "",
        };
      });

    if (DRY) {
      console.log(
        `  + ${cfg.kind} ${order._id} — ${signatures.length}/2 signed, ` +
          `"${String(order[cfg.titleField] || "").slice(0, 40)}", ` +
          `signed ${when(signatures[0]?.signedAt)}` +
          `${signatures.some((s) => !s.blobName) ? "  [document lost]" : ""}`
      );
      created += 1;
      continue;
    }

    const record = new NdaRecord({
      orderKind: cfg.kind,
      [cfg.idField]: order._id,
      clientId: client._id,
      creatorId: creator._id,
      orderTitle: String(order[cfg.titleField] || "").slice(0, 300),
      amount: Number(order.amount) || 0,
      currency: order.currency || "INR",
      totalPayable: Number(order.totalPayable) || 0,
      revisionsAllowed: order.revisionsAllowed === undefined ? null : order.revisionsAllowed,
      deliveryDays: order.deliveryDays === undefined ? null : order.deliveryDays,
      deliveryDueAt: order.deliveryDueAt || null,
      // The order's status NOW, not at signing — which was never recorded.
      // `backfilled` is what stops this being read as contemporaneous.
      orderStatusAtSigning: order.status || "",
      backfilled: true,
    });

    // markSigned() one side at a time, so status / executedAt / version are
    // derived by exactly the same code path a live signature goes through.
    signatures.forEach((sig) => record.markSigned(sig));

    try {
      await record.save();
      created += 1;
    } catch (err) {
      // A concurrent live signature can have created the record between the
      // findOne above and this save. That record is the better one — it has a
      // hash and provenance — so losing this race is the correct outcome.
      if (err?.code === 11000) {
        skipped += 1;
        continue;
      }
      console.error(`  ✗ ${cfg.kind} ${order._id}: ${err.message}`);
    }
  }

  return { scanned: orders.length, created, skipped, noParties };
}

(async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGO_URI is not set.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(DRY ? "\nDRY RUN — nothing will be written.\n" : "\nWriting NDA records.\n");

  const totals = { scanned: 0, created: 0, skipped: 0, noParties: 0 };

  for (const cfg of KINDS) {
    console.log(`${cfg.kind}:`);
    const r = await backfillKind(cfg);
    Object.keys(totals).forEach((k) => {
      totals[k] += r[k];
    });
    console.log(
      `  scanned ${r.scanned}, ${DRY ? "would create" : "created"} ${r.created}, ` +
        `already had a record ${r.skipped}, skipped for a missing party ${r.noParties}\n`
    );
  }

  console.log(
    `Total: ${DRY ? "would create" : "created"} ${totals.created} of ${totals.scanned} signed orders ` +
      `(${totals.skipped} already recorded, ${totals.noParties} unrecordable).`
  );
  if (DRY) console.log("\nRe-run without --dry to write.");

  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
