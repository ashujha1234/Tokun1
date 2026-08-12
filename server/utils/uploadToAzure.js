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

  // ⚠️ Only affects first creation
  await containerClient.createIfNotExists({
    access: "container",
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
