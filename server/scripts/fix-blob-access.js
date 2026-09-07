/**
 * Reports, and optionally repairs, the public-access level of every blob
 * container.
 *
 * Why: utils/uploadToAzure.js created every container it touched with
 * `access: "container"` — the level that allows anonymous read AND anonymous
 * LISTING of the whole container. That has been fixed to "blob", but Azure only
 * applies an access level when a container is FIRST created, so no code change
 * can retighten the containers that already exist. This script is that change,
 * done through the management API instead of by hand in the portal.
 *
 * It also exists because the opposite mistake is easy: `avatars`,
 * `prompt-attachments`, `prompt-code` and `services` are rendered by <img> and
 * <video> straight from their blob URLs, so they NEED anonymous blob read. Set
 * one of them to Private and every profile picture on the site 404s while the
 * blobs themselves sit there perfectly intact.
 *
 * ── The policy, as an allowlist ─────────────────────────────────────────────
 *
 * PUBLIC below is exhaustive and deliberate. Anything not named in it is left
 * alone by --apply, so this script can never widen access to a container
 * somebody adds later, and it will never touch refund-attachments,
 * chat-attachments, admin-message-attachments, feedback-screenshots,
 * report-screenshots or kyc-documents. Those are evidence, private
 * conversations and identity documents; the first five want Private + a SAS
 * (see utils/blobStorage.js getBlobSasUrl), and kyc-documents wants deleting
 * outright now that no code reads or writes it.
 *
 * "container" is never set by this script, for either group. Nothing in the app
 * has ever needed anonymous listing.
 *
 * DRY RUN BY DEFAULT — prints the current level of every container and what it
 * would change. Pass --apply to write. Same shape as the rest of scripts/.
 *
 *   node scripts/fix-blob-access.js            # report only
 *   node scripts/fix-blob-access.js --apply    # set the public four to "blob"
 *   node scripts/fix-blob-access.js --apply --tighten-listable
 *                                              # ALSO drop any container still
 *                                              # on "container" to "blob"
 */
require("dotenv").config({ quiet: true });
const { BlobServiceClient } = require("@azure/storage-blob");

const APPLY = process.argv.includes("--apply");
const TIGHTEN = process.argv.includes("--tighten-listable");

/* Read from a blob URL by <img>/<video>, so anonymous blob read is required.
   Exhaustive: --apply sets exactly these and nothing else. */
const PUBLIC = new Set(["avatars", "prompt-attachments", "prompt-code", "services"]);

/* Named only so the report can say WHY a container is being left alone —
   this script never writes to them. */
const MUST_STAY_PRIVATE = new Set([
  "refund-attachments",
  "chat-attachments",
  "admin-message-attachments",
  "feedback-screenshots",
  "report-screenshots",
]);
const SHOULD_BE_DELETED = new Set(["kyc-documents"]);

/* Azure reports the level as undefined | "blob" | "container"; undefined means
   private. Spelled out because "undefined" in a report reads like a bug. */
const label = (access) => access || "private";

(async () => {
  const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!conn) {
    console.error("AZURE_STORAGE_CONNECTION_STRING missing — check server/.env");
    process.exit(1);
  }

  const service = BlobServiceClient.fromConnectionString(conn);

  /* The account-level switch first, because it overrides every container.
     If "allow blob public access" is off, a container set to "blob" still
     answers 403 to anonymous reads — which is the one cause that would break
     EVERY public container at once rather than one of them. Worth reporting
     before the per-container table, so a global outage isn't misread as six
     separate misconfigurations. */
  try {
    const props = await service.getProperties();
    // Not surfaced by getProperties on all API versions; only report if present.
    if (props && "allowBlobPublicAccess" in props) {
      console.log(`account allowBlobPublicAccess: ${props.allowBlobPublicAccess}`);
      if (props.allowBlobPublicAccess === false) {
        console.log(
          "  ⚠️  OFF at the account level — every container below will refuse anonymous\n" +
            "      reads no matter what its own level says. This is an ARM/portal setting\n" +
            "      (Storage account → Configuration → Allow blob anonymous access), not\n" +
            "      something the data-plane SDK used here can change."
        );
      }
      console.log("");
    }
  } catch {
    // Non-fatal: the per-container report below is the point of the script.
  }

  const rows = [];
  for await (const c of service.listContainers()) {
    rows.push({ name: c.name, access: c.properties?.publicAccess });
  }
  rows.sort((a, b) => a.name.localeCompare(b.name));

  if (!rows.length) {
    console.log("no containers found on this storage account");
    process.exit(0);
  }

  console.log(`${rows.length} containers on this account:\n`);

  const toFix = [];
  for (const r of rows) {
    let verdict;

    if (PUBLIC.has(r.name)) {
      if (r.access === "blob") verdict = "ok — public read, not listable";
      else {
        verdict = `NEEDS FIX → blob   (currently ${label(r.access)}${
          r.access === undefined ? "; anonymous reads are 404ing right now" : ""
        })`;
        toFix.push({ ...r, target: "blob" });
      }
    } else if (SHOULD_BE_DELETED.has(r.name)) {
      verdict = `leave — DELETE this container in the portal (identity documents, ${label(
        r.access
      )}, no code reads it)`;
    } else if (r.access === "container") {
      verdict = "leave — world-LISTABLE; pass --tighten-listable to drop it to blob";
      if (TIGHTEN) {
        toFix.push({ ...r, target: "blob" });
        verdict = "NEEDS FIX → blob   (currently world-listable)";
      }
    } else if (MUST_STAY_PRIVATE.has(r.name)) {
      verdict = `leave — should stay ${label(r.access)}`;
    } else {
      verdict = `leave — not in this script's policy (${label(r.access)})`;
    }

    console.log(`  ${r.name.padEnd(30)} ${label(r.access).padEnd(10)} ${verdict}`);
  }

  if (!toFix.length) {
    console.log("\nnothing to change.");
    process.exit(0);
  }

  console.log(`\n${toFix.length} container(s) to change:`);
  toFix.forEach((f) => console.log(`  ${f.name}: ${label(f.access)} → ${f.target}`));

  if (!APPLY) {
    console.log("\nDRY RUN — nothing written. Re-run with --apply to make these changes.");
    process.exit(0);
  }

  console.log("");
  let failed = 0;
  for (const f of toFix) {
    try {
      // Second arg is the stored access policies (signed identifiers); passing
      // an empty array would DELETE any that exist. Omitted so only the public
      // access level changes.
      await service.getContainerClient(f.name).setAccessPolicy(f.target);
      console.log(`  ✅ ${f.name} → ${f.target}`);
    } catch (e) {
      failed++;
      console.error(`  ❌ ${f.name}: ${e?.message || e}`);
      if (String(e?.code) === "PublicAccessNotPermitted" || /public access is not permitted/i.test(String(e?.message))) {
        console.error(
          "     The account-level switch is off. Turn on Storage account →\n" +
            "     Configuration → Allow blob anonymous access, then run this again."
        );
      }
    }
  }

  console.log(failed ? `\n${failed} failed.` : "\ndone.");
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error("fix-blob-access failed:", e?.message || e);
  process.exit(1);
});
