// Storage for what a seller delivers on a service booking.
//
// Two problems with how this used to work:
//
//   1. Work files were written to ../uploads/service-work on local disk while
//      every other upload in the app goes to Azure. On any host with an
//      ephemeral filesystem a redeploy deletes them — i.e. the buyer's paid-for
//      deliverable disappears.
//   2. /uploads is served by express.static with no auth, and the filenames
//      were `${Date.now()}-${originalname}`. The whole point of escrow is that
//      the work stays locked until the buyer approves; a guessable public URL
//      undoes that.
//
// So: a PRIVATE container, and reads only ever happen through a short-lived
// SAS minted by the gated download route. Files land on disk first and are
// streamed up, because holding a multi-gigabyte buffer in memory per
// concurrent upload is how you OOM the process.

const path = require("path");
const fs = require("fs");
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} = require("@azure/storage-blob");

const CONTAINER = "service-work";

/* The per-file ceiling for a delivery.

   Was 500 MB, which a real delivery clears more often than not: a video edit's
   project folder, a set of layered PSDs, a 3D scene with textures, or a build
   with node_modules in it are all routinely over half a gigabyte, and the
   seller's only option was to break the work up or push the client to a Drive
   link — outside escrow, where nothing we do protects either side.

   Nothing buffers a file of this size: multer writes it to a temp path on disk
   and uploadWorkFileToAzure() streams that path into the container (see the
   note at the top of this file). Raising it costs temp disk during the upload,
   not memory. Above this, a repo/Drive link is still the honest answer. */
const WORK_FILE_MAX_BYTES = 2 * 1024 * 1024 * 1024;

/** For copy: "2 GB" rather than "2048 MB". */
const WORK_FILE_MAX_LABEL = "2 GB";

// A read URL is handed to a browser that immediately follows it; an hour is
// generous for a large download and short enough that a leaked URL is not a
// permanent hole.
const SAS_TTL_MINUTES = 60;

/* ─────────────────────────── file type policy ─────────────────────────── */

// An allowlist rather than a denylist: work files are downloaded by the buyer,
// and the previous route accepted anything at all — including a .exe or .sh.
const ALLOWED_WORK_EXTENSIONS = [
  // archives — the recommended way to send a folder of any kind
  ".zip", ".rar", ".7z", ".tar", ".gz", ".tgz",
  // documents
  ".pdf", ".doc", ".docx", ".txt", ".md", ".rtf", ".odt",
  ".xls", ".xlsx", ".csv", ".ppt", ".pptx",
  // images
  ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".tiff", ".bmp", ".heic",
  // design source files
  ".psd", ".ai", ".eps", ".indd", ".fig", ".sketch", ".xd", ".afdesign", ".afphoto",
  // audio / video
  ".mp4", ".mov", ".webm", ".mkv", ".avi", ".mp3", ".wav", ".aac", ".m4a",
  // 3D
  ".obj", ".fbx", ".blend", ".glb", ".gltf", ".stl",
  // fonts / ebooks
  ".ttf", ".otf", ".woff", ".woff2", ".epub",
];

function isAllowedWorkFile(originalName) {
  const ext = path.extname(String(originalName || "")).toLowerCase();
  return ALLOWED_WORK_EXTENSIONS.includes(ext);
}

/* ───────────────────────────── link policy ────────────────────────────── */

// Recognised so the UI can render "GitHub repository" instead of a raw URL,
// and so a seller pasting a repo gets the same first-class treatment as an
// upload. Order matters only for readability; matching is by hostname suffix.
const LINK_PROVIDERS = [
  { provider: "github", hosts: ["github.com"], label: "GitHub repository" },
  { provider: "gitlab", hosts: ["gitlab.com"], label: "GitLab repository" },
  { provider: "bitbucket", hosts: ["bitbucket.org"], label: "Bitbucket repository" },
  { provider: "drive", hosts: ["drive.google.com", "docs.google.com"], label: "Google Drive" },
  { provider: "dropbox", hosts: ["dropbox.com"], label: "Dropbox" },
  { provider: "onedrive", hosts: ["onedrive.live.com", "1drv.ms"], label: "OneDrive" },
  { provider: "wetransfer", hosts: ["wetransfer.com", "we.tl"], label: "WeTransfer" },
  { provider: "figma", hosts: ["figma.com"], label: "Figma file" },
  { provider: "notion", hosts: ["notion.so", "notion.site"], label: "Notion page" },
  { provider: "vercel", hosts: ["vercel.app"], label: "Live deployment" },
  { provider: "netlify", hosts: ["netlify.app"], label: "Live deployment" },
];

/**
 * Validates a pasted deliverable link and labels its source.
 *
 * Only http/https is accepted — a `javascript:` or `data:` URL would be
 * rendered as a clickable anchor in the buyer's chat, which is an XSS vector,
 * not a delivery.
 *
 * @returns {{ok: true, url: string, provider: string, label: string} | {ok: false, message: string}}
 */
function normalizeDeliverableLink(rawUrl, rawName) {
  const input = String(rawUrl || "").trim();
  if (!input) return { ok: false, message: "Link cannot be empty." };
  if (input.length > 2000) return { ok: false, message: "That link is too long." };

  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    return { ok: false, message: `"${input}" is not a valid URL.` };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, message: "Links must start with http:// or https://" };
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  const match = LINK_PROVIDERS.find((p) =>
    p.hosts.some((h) => host === h || host.endsWith(`.${h}`))
  );

  const name =
    String(rawName || "").trim() ||
    (match ? match.label : host) ;

  return {
    ok: true,
    url: parsed.toString(),
    provider: match ? match.provider : "other",
    label: name.slice(0, 200),
  };
}

/* ──────────────────────────── azure plumbing ──────────────────────────── */

function getConnectionString() {
  const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!conn) throw new Error("AZURE_STORAGE_CONNECTION_STRING missing");
  return conn;
}

function getContainerClient() {
  return BlobServiceClient.fromConnectionString(getConnectionString()).getContainerClient(
    CONTAINER
  );
}

// SAS signing needs the account name + key, which only exist inside the
// connection string. Parsed here rather than adding two more env vars that can
// drift out of sync with the one already deployed.
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

  const accountName = parts.AccountName;
  const accountKey = parts.AccountKey;
  if (!accountName || !accountKey) {
    throw new Error("Connection string has no AccountName/AccountKey — cannot sign a SAS");
  }

  return new StorageSharedKeyCredential(accountName, accountKey);
}

/**
 * Streams a file already on disk (multer's temp copy) into the private
 * container, then removes the temp copy.
 *
 * @param {string} tempPath
 * @param {string} originalName
 * @param {string} orderId  used only to namespace the blob per order
 */
async function uploadWorkFileToAzure(tempPath, originalName, orderId) {
  const containerClient = getContainerClient();

  // access: undefined => private. Explicitly NOT "container" like
  // uploadToAzure uses for service media, which is public by design.
  await containerClient.createIfNotExists();

  const ext = path.extname(originalName || "");
  const base = path
    .basename(originalName || "work-file", ext)
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .slice(0, 80);

  const blobName = `${orderId}/${Date.now()}-${base || "work-file"}${ext}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // HTTP headers are latin-1; a filename with Devanagari or an emoji in it
  // makes Azure reject the whole PUT. The ASCII fallback keeps the header
  // valid, and filename* carries the real name for browsers that read it.
  const safeName = (originalName || "work-file").replace(/"/g, "");
  const asciiName = safeName.replace(/[^\x20-\x7E]/g, "_");

  try {
    await blockBlobClient.uploadFile(tempPath, {
      blobHTTPHeaders: {
        // Forces a download rather than letting the browser try to render it,
        // and restores the seller's original filename on the buyer's disk.
        blobContentDisposition: `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(
          safeName
        )}`,
      },
    });
  } finally {
    // The temp copy is dead weight either way — on success it's in Azure, on
    // failure the client will retry from the browser.
    fs.promises.unlink(tempPath).catch(() => {});
  }

  return { blobName, url: blockBlobClient.url };
}

/**
 * Pulls one blob down to a local path, for work this server has to do on the
 * bytes themselves — burning a watermark into a video, in practice.
 *
 * Uses the account credential directly rather than fetching its own SAS URL:
 * this is a server-side read of our own container, and minting a public-ish URL
 * to hand back to ourselves would be one more thing that could leak.
 */
async function downloadWorkFileToPath(blobName, destPath) {
  const blockBlobClient = getContainerClient().getBlockBlobClient(blobName);
  await blockBlobClient.downloadToFile(destPath);
  return destPath;
}

/** Does this blob exist? Used to check a cached preview is still really there. */
async function workBlobExists(blobName) {
  if (!blobName) return false;
  try {
    return await getContainerClient().getBlockBlobClient(blobName).exists();
  } catch {
    return false;
  }
}

/**
 * Uploads a DERIVED file (a watermarked video preview) beside the original.
 *
 * Two differences from uploadWorkFileToAzure, both deliberate:
 *   • the caller names the blob, because a derived file has to be findable
 *     again from the source blob's name rather than a fresh timestamp;
 *   • the disposition is `inline`, because this one is meant to be played in a
 *     <video> in the browser, not saved. The original keeps `attachment`.
 */
async function uploadDerivedFileToAzure(tempPath, blobName, contentType) {
  const containerClient = getContainerClient();
  await containerClient.createIfNotExists();

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadFile(tempPath, {
    blobHTTPHeaders: {
      blobContentType: contentType || "application/octet-stream",
      blobContentDisposition: `inline; filename="tokun-preview${path.extname(blobName) || ""}"`,
    },
  });

  return { blobName, url: blockBlobClient.url };
}

/**
 * Short-lived read URL for one blob. Called by the gated download route only
 * after it has checked the caller is a party to the order.
 */
function getWorkFileDownloadUrl(blobName) {
  const credential = getSharedKeyCredential();

  const expiresOn = new Date(Date.now() + SAS_TTL_MINUTES * 60 * 1000);
  // Backdated a little so a few minutes of clock skew between this host and
  // Azure can't make a freshly minted SAS look not-yet-valid.
  const startsOn = new Date(Date.now() - 5 * 60 * 1000);

  const sas = generateBlobSASQueryParameters(
    {
      containerName: CONTAINER,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn,
      expiresOn,
    },
    credential
  ).toString();

  const blobUrl = getContainerClient().getBlockBlobClient(blobName).url;
  return `${blobUrl}?${sas}`;
}

module.exports = {
  uploadWorkFileToAzure,
  uploadDerivedFileToAzure,
  downloadWorkFileToPath,
  workBlobExists,
  getWorkFileDownloadUrl,
  isAllowedWorkFile,
  normalizeDeliverableLink,
  ALLOWED_WORK_EXTENSIONS,
  WORK_FILE_MAX_BYTES,
  WORK_FILE_MAX_LABEL,
  CONTAINER,
};
