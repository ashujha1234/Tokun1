/**
 * Handing the work over — files, links, or both.
 *
 * Works for hire deals and service bookings from one component; only the two
 * endpoint paths differ. A second copy of this had already started to drift
 * (the service one accepted links, the hire one didn't), which is exactly the
 * failure a shared component prevents.
 *
 * Links are first-class, not a fallback. For built software the DEPLOYED URL
 * is the delivery — "here's the site" is the honest hand-off, and zipping a
 * build folder instead would be theatre. Same for a repo the client needs
 * commit history from, or a render too large to upload.
 */

import { useRef, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { formatBytes } from "@/lib/serviceDeliverables";
import type { OrderKind } from "@/lib/escrowApi";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const GRAD = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

/* Must match WORK_FILE_MAX_BYTES in server/utils/serviceWorkStorage.js — this
   check only saves the seller a wasted upload; the multer limit is what
   actually enforces it. */
const MAX_BYTES = 2 * 1024 * 1024 * 1024;
const MAX_LABEL = "2 GB";

/** Where the two order kinds live. The only thing that actually differs. */
const ENDPOINTS = {
  service: (id: string) => ({
    upload: `${API_BASE}/api/services/orders/${id}/upload-work-file`,
    submit: `${API_BASE}/api/services/orders/${id}/submit-work`,
  }),
  hire: (id: string) => ({
    upload: `${API_BASE}/api/hire/${id}/upload-work-file`,
    submit: `${API_BASE}/api/hire/${id}/submit-work`,
  }),
};

/* A pasted URL, labelled by what it evidently is. The label is only a display
   nicety — the server re-derives the provider and rejects anything that isn't
   http/https, because these end up as clickable anchors in the client's chat. */
function describeLink(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (/github|gitlab|bitbucket/.test(host)) {
      return parsed.pathname.replace(/^\//, "").replace(/\.git$/, "") || host;
    }
    return host;
  } catch {
    return url;
  }
}

export default function SubmitWorkModal({
  orderKind,
  orderId,
  title,
  isResubmit,
  token,
  onClose,
  onSubmitted,
}: {
  orderKind: OrderKind;
  orderId: string;
  title?: string;
  isResubmit?: boolean;
  token?: string;
  onClose: () => void;
  onSubmitted: () => void | Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // Per-file progress. A plain fetch() reports nothing, so a 300 MB zip left
  // the modal saying "Submitting…" for ten minutes and sellers assumed it had
  // hung.
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [currentFile, setCurrentFile] = useState<number | null>(null);
  const [links, setLinks] = useState<{ url: string; name: string }[]>([]);
  const [linkDraft, setLinkDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Kept so closing the modal actually cancels an in-flight upload rather than
  // leaving it burning the seller's bandwidth.
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const endpoints = ENDPOINTS[orderKind](orderId);

  const addFiles = (files: File[]) => {
    const tooBig = files.filter((f) => f.size > MAX_BYTES);
    if (tooBig.length) {
      toast({
        title: "File too large",
        description: `${tooBig[0].name} is over ${MAX_LABEL}. Share it as a repo or Drive link instead.`,
      });
    }
    setSelectedFiles((prev) => [...prev, ...files.filter((f) => f.size <= MAX_BYTES)]);
  };

  const addLink = () => {
    const url = linkDraft.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      toast({ title: "Invalid link", description: "Links must start with http:// or https://" });
      return;
    }
    setLinks((prev) => [...prev, { url, name: describeLink(url) }]);
    setLinkDraft("");
  };

  /* XHR rather than fetch purely for upload.onprogress — browsers still expose
     no equivalent on fetch's request body. */
  const uploadOne = (file: File, index: number) =>
    new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.open("POST", endpoints.upload);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        setProgress((p) => ({ ...p, [index]: Math.round((e.loaded / e.total) * 100) }));
      };

      xhr.onload = () => {
        let data: any = {};
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          /* non-JSON body — handled by the !success branch */
        }
        if (xhr.status >= 200 && xhr.status < 300 && data?.success) {
          setProgress((p) => ({ ...p, [index]: 100 }));
          resolve(data.file);
        } else {
          reject(new Error(data?.message || data?.error || `Failed to upload ${file.name}`));
        }
      };
      xhr.onerror = () => reject(new Error(`Network error while uploading ${file.name}`));
      xhr.onabort = () => reject(new Error("upload_cancelled"));

      const formData = new FormData();
      formData.append("file", file);
      xhr.send(formData);
    });

  const handleClose = () => {
    if (submitting) xhrRef.current?.abort();
    onClose();
  };

  const handleSubmit = async () => {
    if (!token) {
      toast({ title: "Login required", description: "Please log in again." });
      return;
    }
    if (!selectedFiles.length && !links.length && !note.trim()) {
      toast({
        title: "Nothing to submit",
        description: "Attach a file, add a link, or write a note.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const deliverables: any[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        setCurrentFile(i);
        const uploaded = await uploadOne(selectedFiles[i], i);
        deliverables.push({
          kind: "file",
          url: uploaded.url,
          blobName: uploaded.blobName,
          name: uploaded.name,
          description: uploaded.name,
          size: uploaded.size,
          mimeType: uploaded.mimeType,
        });
      }
      setCurrentFile(null);

      for (const link of links) {
        deliverables.push({ kind: "link", url: link.url, name: link.name });
      }

      const res = await fetch(endpoints.submit, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ note, deliverables }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || "Failed to submit work.");
      }

      toast({ title: "Work submitted", description: "Sent to the client for review." });
      await onSubmitted();
      onClose();
    } catch (err: any) {
      if (err?.message !== "upload_cancelled") {
        toast({ title: "Submit failed", description: err?.message || "Could not submit work." });
      }
    } finally {
      xhrRef.current = null;
      setSubmitting(false);
      setCurrentFile(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-8">
      <div className="w-[520px] max-w-full max-h-full flex flex-col rounded-2xl bg-[#0E0F12] text-white border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <div className="min-w-0">
            <p className="font-semibold">{isResubmit ? "Resubmit work" : "Submit work"}</p>
            <p className="text-xs text-white/50 truncate">{title}</p>
          </div>
          <button onClick={handleClose} className="text-white/60 hover:text-white">✕</button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="rounded-lg bg-[#1A73E8]/[0.08] border border-[#1A73E8]/20 p-3 text-xs text-white/60 leading-relaxed">
            <strong className="text-white/80">Delivering a built site or app?</strong> Paste the
            deployed URL below — that's the delivery, not a zip of the build folder. For source,
            add the repo link too. Files are for assets, documents and archives.
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Files</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={(e) => {
                addFiles(Array.from(e.target.files || []));
                // Reset so picking the same file twice still fires onChange.
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={submitting}
              className="w-full h-11 rounded-lg border border-dashed border-white/20 text-sm text-white/60 hover:border-white/40 disabled:opacity-50"
            >
              + Attach files (.zip for folders, max {MAX_LABEL} each)
            </button>

            {selectedFiles.length > 0 && (
              <div className="mt-2 space-y-2">
                {selectedFiles.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="rounded-lg bg-black/25 border border-white/[0.07] px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm truncate">📎 {f.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-white/35">{formatBytes(f.size)}</span>
                        {!submitting && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i));
                              setProgress((p) => {
                                const next = { ...p };
                                delete next[i];
                                return next;
                              });
                            }}
                            className="text-white/35 hover:text-white/70 text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    {submitting && (progress[i] !== undefined || currentFile === i) && (
                      <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-[width] duration-200"
                          style={{ width: `${progress[i] || 0}%`, background: GRAD }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Deployment / repo links</p>
            <div className="flex gap-2">
              <input
                value={linkDraft}
                onChange={(e) => setLinkDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLink();
                  }
                }}
                disabled={submitting}
                placeholder="https://your-project.vercel.app"
                className="flex-1 h-10 rounded-lg bg-[#1A1A1A] border border-white/10 px-3 text-sm outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={addLink}
                disabled={submitting}
                className="h-10 px-4 rounded-lg border border-white/15 text-sm text-white/70 hover:bg-white/[0.06] disabled:opacity-50"
              >
                Add
              </button>
            </div>

            {links.length > 0 && (
              <div className="mt-2 space-y-2">
                {links.map((l, i) => (
                  <div
                    key={`${l.url}-${i}`}
                    className="flex items-center justify-between gap-3 rounded-lg bg-black/25 border border-white/[0.07] px-3 py-2"
                  >
                    <span className="text-sm truncate">🔗 {l.name}</span>
                    {!submitting && (
                      <button
                        type="button"
                        onClick={() => setLinks((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-white/35 hover:text-white/70 text-sm shrink-0"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 text-[11px] text-white/35 leading-relaxed">
              A live deployment, GitHub/GitLab repo, Drive folder, Figma file or WeTransfer link.
              Make sure the client actually has access before submitting.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Note {isResubmit ? "" : "(optional)"}</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                isResubmit
                  ? "What you changed in this revision…"
                  : "How to run it, what's included, anything the client should know…"
              }
              className="w-full h-24 rounded-lg bg-[#1A1A1A] border border-white/10 p-3 text-sm outline-none resize-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-11 rounded-full text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: GRAD }}
          >
            {submitting
              ? currentFile !== null
                ? `Uploading ${currentFile + 1} of ${selectedFiles.length}…`
                : "Submitting…"
              : "Submit to client"}
          </button>
          {submitting && (
            <p className="mt-2 text-center text-[11px] text-white/35">
              Keep this tab open. Closing it cancels the upload.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
