/**
 * File picker for the reference material that goes WITH a request — a style
 * deck, a spec, screenshots of what's broken.
 *
 * Used while composing a booking or a hire proposal, i.e. before the order
 * exists. Each file is uploaded as it's picked and the resulting descriptors
 * are handed up via onChange, so the parent submits them alongside the brief.
 *
 * Also reused for proof-of-work on a dispute claim and for progress-update
 * media — same interaction, different upload endpoint, which is why the
 * uploader is injected rather than hardcoded.
 */

import { useRef, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { uploadBriefFile, type BriefAttachment } from "@/lib/escrowApi";
import { formatBytes } from "@/lib/serviceDeliverables";

export default function BriefAttachmentPicker({
  value,
  onChange,
  token,
  max = 5,
  maxBytes = 25 * 1024 * 1024,
  uploader = uploadBriefFile,
  label = "Attach reference files",
  hint = "Style references, specs, screenshots — images, PDFs, docs or a zip.",
  disabled = false,
}: {
  value: BriefAttachment[];
  onChange: (files: BriefAttachment[]) => void;
  token?: string;
  max?: number;
  maxBytes?: number;
  uploader?: (file: File, token?: string) => Promise<BriefAttachment>;
  label?: string;
  hint?: string;
  disabled?: boolean;
}) {
  const [uploading, setUploading] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: File[]) => {
    const room = max - value.length;
    if (room <= 0) {
      toast({ title: "That's the limit", description: `You can attach up to ${max} files.` });
      return;
    }

    // Uploaded one at a time rather than in parallel: the progress label names
    // the current file, and a failure part-way through leaves everything before
    // it already attached instead of losing the whole batch.
    const accepted: BriefAttachment[] = [];
    for (const file of files.slice(0, room)) {
      if (file.size > maxBytes) {
        toast({
          title: "File too large",
          description: `${file.name} is over ${Math.round(maxBytes / (1024 * 1024))} MB. Paste a Drive or Dropbox link in the brief instead.`,
        });
        continue;
      }
      try {
        setUploading(file.name);
        accepted.push(await uploader(file, token));
      } catch (err: any) {
        toast({ title: "Upload failed", description: err?.message || `Couldn't upload ${file.name}.` });
      }
    }
    setUploading(null);

    if (accepted.length) onChange([...value, ...accepted]);
  };

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));
  const isBusy = disabled || Boolean(uploading);

  return (
    <div>
      <p className="text-sm font-medium mb-2">{label}</p>

      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(Array.from(e.target.files || []));
          // Reset so picking the same file twice still fires onChange.
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isBusy || value.length >= max}
        className="w-full h-11 rounded-lg border border-dashed border-white/20 text-sm text-white/60 hover:border-white/40 disabled:opacity-50"
      >
        {uploading
          ? `Uploading ${uploading}…`
          : value.length >= max
          ? `Maximum ${max} files attached`
          : `+ ${label} (max ${Math.round(maxBytes / (1024 * 1024))} MB each)`}
      </button>

      {value.length > 0 && (
        <div className="mt-2 space-y-2">
          {value.map((f, i) => (
            <div
              key={`${f.blobName}-${i}`}
              className="flex items-center justify-between gap-3 rounded-lg bg-black/25 border border-white/[0.07] px-3 py-2"
            >
              <span className="text-sm truncate">📎 {f.name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-white/35">{formatBytes(f.size)}</span>
                {!isBusy && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-white/35 hover:text-white/70 text-sm"
                    aria-label={`Remove ${f.name}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {hint && <p className="mt-2 text-[11px] text-white/35 leading-relaxed">{hint}</p>}
    </div>
  );
}
