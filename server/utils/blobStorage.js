/**
 * General Azure Blob storage — streaming uploads, public or private.
 *
 * ── Why this exists alongside the two modules already here ──────────────────
 *
 * utils/uploadToAzure.js takes a BUFFER. Whatever it uploads is held in the
 * process's heap in full, so it cannot be used for anything large: a 5 GB
 * intro video is 5 GB of RAM per concurrent upload, which is how the process
 * dies. That is the stated reason intro videos were never moved to Azure and
 * stayed on local disk — a reason that is only true of that helper, not of
 * Azure.
 *
 * utils/serviceWorkStorage.js does stream, and correctly, but it is hardcoded
 * to the one "service-work" container and carries the escrow-specific policy
 * (work-file extensions, deliverable links, watermark helpers) around with it.
 * It is deliberately left alone: it is on the money path, it works, and
 * generalising it would mean editing escrow delivery to fix an upload bug
 * somewhere else.
 *
 * So this module is the third thing: stream any file, to any container, public
 * or private, with none of the escrow policy attached.
 *
 * ── access: "blob", never "container" ───────────────────────────────────────
 *
 * Azure has three container access levels and the middle one is a trap:
 *
 *   (none)      private — reads need a credential or a SAS
 *   "blob"      anyone with the full blob URL can read THAT blob
 *   "container" anyone can read AND **list every blob in the container**
 *
 * uploadToAzure.js creates every container it touches with "container", which
 * is how eleven of them — including kyc-documents — ended up world-listable.
 * Guessing a URL is hard; asking Azure for the whole index is one request.
 *
 * Nothing here ever asks for "container". A public container gets "blob",
 * which is all an <img src> or a <video src> has ever needed, and a private one
 * gets no access level at all and is read through a short-lived SAS.
 *
 * Note the same caveat that applies to every createIfNotExists call in this
 * codebase: the access level is only applied when the container is FIRST
 * created. An existing container keeps whatever it has, so this code cannot
 * tighten the eleven that already exist — that is a change to make in the
 * Azure portal.
 */

const fs = require("fs");
const path = require("path");
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} = require("@azure/storage-blob");

/* Has to cover everything the uploaders accept. A type that falls through keeps
   the application/octet-stream default, and a blob served with that is
   DOWNLOADED by the browser rather than rendered — so an <img> or <video>
   pointing at it silently shows nothing. Same map as uploadToAzure.js, widened
   for the video containers the intro-video route accepts. */
const CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
  ".mkv": "video/x-matroska",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".json": "application/json",
  ".zip": "application/zip",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function contentTypeFor(name) {
  return CONTENT_TYPES[path.extname(String(name || "")).toLowerCase()] || "application/octet-stream";
}

/**
 * A blob-name-safe version of a user's filename.
 *
 * Everything outside [A-Za-z0-9-_] goes, which also removes the path separators
 * — a filename of "../../etc/passwd" would otherwise become a blob path that
 * escapes its intended prefix. Length-capped because Azure's limit is on the
 * full blob path and a caller's prefix has to fit alongside it.
 */
function safeBaseName(originalName, fallback = "file") {
  const ext = path.extname(String(originalName || ""));
  const base = path
    .basename(String(originalName || ""), ext)
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .slice(0, 80);
  return { base: base || fallback, ext };
}

function getConnectionString() {
  const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!conn) throw new Error("AZURE_STORAGE_CONNECTION_STRING missing");
  return conn;
}

function getContainerClient(container) {
  return BlobServiceClient.fromConnectionString(getConnectionString()).getContainerClient(container);
}

/* SAS signing needs the account name + key, which only exist inside the
   connection string. Parsed out rather than adding two more env vars that can
   drift out of sync with the one already deployed. (Same approach as
   serviceWorkStorage.js — deliberately, so there is one thing to configure.) */
function getSharedKeyCredential() {
  const parts = Object.fromEntries(
    getConnectionString()
      .split(";")
      .filter(Boolean)
      .map((kv) => {
        const i = kv.indexOf("=");
        return [kv.slice(0, i), kv.slice(i + 1)];
      })
  );

  if (!parts.AccountName || !parts.AccountKey) {
    throw new Error("Connection string has no AccountName/AccountKey — cannot sign a SAS");
  }
  return new StorageSharedKeyCredential(parts.AccountName, parts.AccountKey);
}

/**
 * Stream a file that is already on disk into a container.
 *
 * `uploadFile` reads the path in blocks rather than loading it — the whole
 * point of this module. Nothing here is ever proportional to file size in
 * memory, so the ceiling is temp disk during the upload, not RAM.
 *
 * @param {string} tempPath      multer's temp copy
 * @param {object} opts
 * @param {string} opts.container      container name
 * @param {string} opts.blobName       full blob path, caller-chosen (use blobNameFor)
 * @param {string} [opts.originalName] used for content type and the download filename
 * @param {boolean} [opts.public]      false (default) => private container + SAS reads
 * @param {"inline"|"attachment"} [opts.disposition] default "inline"
 * @param {boolean} [opts.keepTemp]    default false — the temp copy is unlinked
 * @returns {Promise<{blobName: string, url: string, container: string}>}
 */
async function uploadFileToBlob(tempPath, opts) {
  const {
    container,
    blobName,
    originalName,
    public: isPublic = false,
    disposition = "inline",
    keepTemp = false,
  } = opts || {};

  if (!container || !blobName) throw new Error("uploadFileToBlob needs container and blobName");

  const containerClient = getContainerClient(container);

  // See the header: "blob" for public (readable by URL, NOT listable), and no
  // access level at all for private.
  await containerClient.createIfNotExists(isPublic ? { access: "blob" } : {});

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  /* HTTP headers are latin-1. A filename with Devanagari or an emoji in it makes
     Azure reject the whole PUT, so the ASCII fallback keeps the header valid and
     filename* carries the real name for browsers that read it. */
  const safeName = String(originalName || path.basename(blobName)).replace(/"/g, "");
  const asciiName = safeName.replace(/[^\x20-\x7E]/g, "_");

  try {
    await blockBlobClient.uploadFile(tempPath, {
      blobHTTPHeaders: {
        blobContentType: contentTypeFor(originalName || blobName),
        blobContentDisposition:
          `${disposition}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`,
      },
    });
  } finally {
    /* The temp copy is dead weight either way — on success it is in Azure, on
       failure the client retries from the browser. Unlinked in `finally` so a
       failed upload cannot leave the scratch directory filling up. */
    if (!keepTemp) fs.promises.unlink(tempPath).catch(() => {});
  }

  return { blobName, url: blockBlobClient.url, container };
}

/**
 * Build a blob path.
 *
 * The prefix is what makes a container navigable later: blobs named
 * `<dealId>/<timestamp>-<name>` group by deal in the portal and can be deleted
 * as a set, where a flat timestamped list cannot be reasoned about at all.
 */
function blobNameFor(originalName, { prefix = "", fallback = "file" } = {}) {
  const { base, ext } = safeBaseName(originalName, fallback);
  const stem = `${Date.now()}-${base}${ext}`;
  return prefix ? `${String(prefix).replace(/^\/+|\/+$/g, "")}/${stem}` : stem;
}

/**
 * Short-lived read URL for a private blob.
 *
 * Only ever call this AFTER checking the caller is entitled to the file — a SAS
 * is a bearer credential and does not know who asked for it.
 */
function getBlobSasUrl(container, blobName, ttlMinutes = 60) {
  const credential = getSharedKeyCredential();

  const expiresOn = new Date(Date.now() + ttlMinutes * 60 * 1000);
  // Backdated slightly so clock skew between this host and Azure cannot make a
  // freshly minted SAS look not-yet-valid.
  const startsOn = new Date(Date.now() - 5 * 60 * 1000);

  const sas = generateBlobSASQueryParameters(
    { containerName: container, blobName, permissions: BlobSASPermissions.parse("r"), startsOn, expiresOn },
    credential
  ).toString();

  return `${getContainerClient(container).getBlockBlobClient(blobName).url}?${sas}`;
}

/** Best-effort delete. A blob that outlives its record is clutter, not a fault. */
async function deleteBlob(container, blobName) {
  if (!container || !blobName) return false;
  try {
    await getContainerClient(container).getBlockBlobClient(blobName).deleteIfExists();
    return true;
  } catch {
    return false;
  }
}

async function blobExists(container, blobName) {
  if (!container || !blobName) return false;
  try {
    return await getContainerClient(container).getBlockBlobClient(blobName).exists();
  } catch {
    return false;
  }
}

/** Is Azure configured at all? Lets a route fall back rather than 500. */
function isBlobConfigured() {
  return Boolean(process.env.AZURE_STORAGE_CONNECTION_STRING);
}

module.exports = {
  uploadFileToBlob,
  blobNameFor,
  getBlobSasUrl,
  deleteBlob,
  blobExists,
  isBlobConfigured,
  contentTypeFor,
  safeBaseName,
};
