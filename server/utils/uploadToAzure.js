const { BlobServiceClient } = require("@azure/storage-blob");
const path = require("path");

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

async function uploadToAzure(fileBuffer, originalName, containerName) {
  if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING missing");
  }

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

  const containerClient =
    blobServiceClient.getContainerClient(containerName);

  /* "blob", never "container". Azure's three levels are:
       (none)      private — a read needs a credential or a SAS
       "blob"      anyone with the full blob URL can read THAT blob
       "container" anyone can read AND **list every blob in the container**

     This helper asked for "container", so every container it has ever created
     is world-listable: an <img src> only ever needed "blob", and the extra
     level hands out the index. Guessing one timestamped blob URL is hard;
     asking Azure for all of them is a single unauthenticated request. Ten
     containers were created this way — avatars, prompt-attachments,
     prompt-code, refund-attachments, chat-attachments, feedback-screenshots,
     report-screenshots, admin-message-attachments, services, and
     kyc-documents, which held Aadhaar and passport scans.

     ⚠️ This line only takes effect when a container is FIRST created. The ten
     that already exist keep the access level they were made with, so this
     fixes new containers only — the existing ones have to be changed in the
     Azure portal (Storage account → Containers → each one → Change access
     level → Private or Blob). See utils/blobStorage.js, which has always done
     this correctly and also supports fully-private containers read through a
     short-lived SAS. */
  await containerClient.createIfNotExists({
    access: "blob",
  });

  const timestamp = Date.now();
  const ext = path.extname(originalName).toLowerCase();
  const nameWithoutExt = path
    .basename(originalName, ext)
    .replace(/\s+/g, "-");

  const fileName = `${timestamp}-${nameWithoutExt}${ext}`;

  const blockBlobClient =
    containerClient.getBlockBlobClient(fileName);

  let contentType = "application/octet-stream";
  /* This map has to cover everything the uploaders accept. A type that falls
     through keeps the application/octet-stream default, and a blob served with
     that is DOWNLOADED by the browser rather than rendered — so an <img> or
     <video> pointing at it silently shows nothing.
     webp/gif/webm were added when the service upload filter was widened to
     match what its file picker had always offered. */
  const CONTENT_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".pdf": "application/pdf",
  };
  if (CONTENT_TYPES[ext]) contentType = CONTENT_TYPES[ext];

  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  });

  return blockBlobClient.url;
}

module.exports = uploadToAzure;
