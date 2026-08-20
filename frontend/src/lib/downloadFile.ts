/**
 * Save a file the browser can already see.
 *
 * `<a download>` is ignored cross-origin, and chat attachments live on an Azure
 * blob host — so a plain anchor opens the file in a tab instead of saving it.
 * Reading the bytes first and handing over an object URL is what actually
 * downloads. If the read is refused (no CORS headers on that host) it falls back
 * to opening the file: worse than saving, much better than a dead button.
 *
 * `credentials: "same-origin"` and not "include": a credentialed cross-origin
 * request needs Access-Control-Allow-Credentials on the response, which a public
 * blob container doesn't send — so "include" would fail every download that
 * otherwise works. Cookies still go out for our own host.
 *
 * One copy, because two surfaces download the same attachment (the media in a
 * chat bubble and the full-size viewer) and a second implementation is how one
 * of them quietly stops working.
 */
export async function downloadFile(url: string, name?: string): Promise<void> {
  if (!url) return;

  const filename = (name || "download").replace(/[/\\?%*:|"<>]/g, "_");

  try {
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error(`http_${res.status}`);

    const blobUrl = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Long enough for the download to have started.
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

/** Is this attachment something a <video> can play? */
export const isVideoAttachment = (name?: string, type?: string): boolean =>
  type === "video" || /\.(mp4|webm|mov|m4v|ogv)$/i.test(String(name || ""));

/** Is this attachment something an <img> can show? */
export const isImageAttachment = (name?: string, type?: string): boolean =>
  type === "image" || /\.(jpe?g|png|gif|webp|avif|bmp|svg)$/i.test(String(name || ""));
