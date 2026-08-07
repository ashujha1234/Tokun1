const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

/**
 * Turn a stored file path into a URL the browser can actually fetch.
 *
 * The API stores upload paths root-relative — e.g. "/uploads/feedback/x.png".
 * Dropping one of those straight into href/src makes the browser resolve it
 * against the FRONTEND origin (localhost:5173, or the static site host in
 * production), where nothing is served from /uploads — hence a 404 on every
 * feedback screenshot. They have to be resolved against the API origin instead.
 *
 * Values that are already absolute (Azure Blob URLs, anything http/https, data:
 * URIs) are returned untouched.
 */
export function mediaUrl(path?: string | null): string {
  const p = String(path || "").trim();
  if (!p) return "";
  if (/^(https?:)?\/\//i.test(p) || p.startsWith("data:") || p.startsWith("blob:")) return p;
  return `${API_BASE}${p.startsWith("/") ? "" : "/"}${p}`;
}
