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
  if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
  else if (ext === ".png") contentType = "image/png";
  else if (ext === ".mp4") contentType = "video/mp4";
  else if (ext === ".pdf") contentType = "application/pdf";

  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: {
      blobContentType: contentType,
    },
  });

  return blockBlobClient.url;
}

module.exports = uploadToAzure;
