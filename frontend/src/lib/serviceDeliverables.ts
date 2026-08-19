// Shared between the seller's dashboard and the buyer's chat card, both of
// which have to fetch the same work files.
//
// Deliverables are no longer public URLs. They live in a private container, and
// the server hands back a short-lived signed URL only after checking the caller
// is the buyer or the seller on that order — which is the whole point of
// holding the money in escrow until the work is approved.

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// Labels for links a seller pasted instead of uploading — a repo is usually
// the honest shape of a code delivery, and anything past the upload cap has to
// be a link. Mirrors the provider list in server/utils/serviceWorkStorage.js.
export const SERVICE_LINK_LABELS: Record<string, string> = {
  github: "GitHub repository",
  gitlab: "GitLab repository",
  bitbucket: "Bitbucket repository",
  drive: "Google Drive",
  dropbox: "Dropbox",
  onedrive: "OneDrive",
  wetransfer: "WeTransfer",
  figma: "Figma file",
  notion: "Notion page",
  vercel: "Live deployment",
  netlify: "Live deployment",
  other: "External link",
};

export const formatBytes = (bytes?: number) => {
  const n = Number(bytes || 0);
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

/**
 * Resolves one deliverable to something the browser can open.
 *
 * Two response shapes, because files uploaded before the move to blob storage
 * are still on the server's own disk: JSON carrying a signed URL for anything
 * in Azure, or the file streamed directly for those older records.
 */
export async function resolveDeliverableUrl(
  orderId: string,
  index: number,
  token?: string,
  // Hire deals and service bookings gate their deliverables the same way; only
  // the path differs. Defaulted so existing service call sites are unchanged.
  orderKind: "service" | "hire" = "service"
): Promise<{
  url: string;
  name?: string;
  isObjectUrl: boolean;
  watermarked?: boolean;
  /* True while the payment is still held in escrow and the server could NOT
     stamp the bytes — a video, in practice. The player draws the watermark
     itself in that case; see DeliverablePreviewModal. */
  heldInEscrow?: boolean;
}> {
  const path =
    orderKind === "hire"
      ? `/api/hire/${orderId}/deliverables/${index}/download`
      : `/api/services/orders/${orderId}/deliverables/${index}/download`;

  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if ((res.headers.get("content-type") || "").includes("application/json")) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success || !data?.url) {
      throw new Error(data?.message || data?.error || "This file is no longer available.");
    }
    return {
      url: data.url,
      name: data.name,
      isObjectUrl: false,
      heldInEscrow: !!data.heldInEscrow,
    };
  }

  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  return {
    url: URL.createObjectURL(blob),
    isObjectUrl: true,
    // Set when the server returned a watermarked preview instead of the
    // original, i.e. an image the buyer hasn't released payment for yet.
    watermarked: res.headers.get("X-Tokun-Watermarked") === "1",
  };
}

/** Can this deliverable be shown in an <img>, rather than only downloaded? */
export function isPreviewableImage(name?: string, mimeType?: string) {
  if (String(mimeType || "").startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif|tiff|bmp|svg)$/i.test(String(name || ""));
}

/** Can this deliverable play in a <video>? */
export function isPreviewableVideo(name?: string, mimeType?: string) {
  if (String(mimeType || "").startsWith("video/")) return true;
  return /\.(mp4|webm|mov|m4v|ogv)$/i.test(String(name || ""));
}

/** Anything the browser can show in place rather than only hand to the disk. */
export const isPreviewable = (name?: string, mimeType?: string) =>
  isPreviewableImage(name, mimeType) || isPreviewableVideo(name, mimeType);

/**
 * Resolves a deliverable for on-screen preview.
 *
 * Same request as the download path — the server decides what bytes come back,
 * watermarked or not — but the result is handed to an <img> instead of the
 * browser's downloader. Before this, the watermarked preview the server takes
 * the trouble to render (Content-Disposition: inline, X-Tokun-Watermarked: 1)
 * was pushed straight to disk by the client, so "preview" meant "download".
 *
 * Caller owns the returned url: call `releasePreview` when the modal closes.
 */
export async function previewDeliverable(
  orderId: string,
  index: number,
  token?: string,
  orderKind: "service" | "hire" = "service"
) {
  return resolveDeliverableUrl(orderId, index, token, orderKind);
}

/** Frees an object URL handed out by `previewDeliverable`. Safe to call always. */
export function releasePreview(preview?: { url: string; isObjectUrl: boolean } | null) {
  if (preview?.isObjectUrl) URL.revokeObjectURL(preview.url);
}

/**
 * Click-to-download for one deliverable. Handed to the browser's own
 * downloader rather than buffered in the tab — these can be hundreds of MB.
 */
export async function downloadDeliverable(
  orderId: string,
  index: number,
  fallbackName: string,
  token?: string,
  orderKind: "service" | "hire" = "service"
) {
  const { url, name, isObjectUrl } = await resolveDeliverableUrl(
    orderId,
    index,
    token,
    orderKind
  );

  const link = document.createElement("a");
  link.href = url;
  link.download = name || fallbackName || "work-file";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Only object URLs need cleaning up; a signed Azure URL isn't ours to revoke.
  // The delay lets the download actually start first.
  if (isObjectUrl) setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
