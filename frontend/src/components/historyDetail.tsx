// src/pages/historyDetail.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Image as ImageIcon,
  ImageOff,
  Video,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import { RiShareForwardLine } from "react-icons/ri";
import { AiOutlineStar, AiFillStar } from "react-icons/ai";
import RequestToBuyModal from "@/components/RequestToBuyModel";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

/* ================== Types ================== */
export interface MarketplacePrompt {
  id: number | string;
  title: string;
   purchaseId: string; 
  description: string;
  price: number; // still used by modal props, not displayed here
  rating?: number;
  downloads: number;
  category: string; // e.g., "marketing" or similar domain label for the left badge
  videoUrl?: string;
  imageUrl?: string;
  fullPrompt?: string;
  ownerEmail?: string; // used for TM to show owner email in modal
  isUploadedByMe?: boolean; // true when the viewer is the prompt's own uploader
  mediaValidation?: { status?: string };
}

interface DetailsPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: MarketplacePrompt | null;
  owned?: boolean;
  onPurchase?: (prompt: MarketplacePrompt) => void; // kept for compat if needed later
  showImages?: boolean;
}

/* ================== Config ================== */

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");


/* =========================================================================
   MAIN: History Detail — final polished version per your spec
   ========================================================================= */
function getModerationBadge(status?: string): { label: string; bg: string; color: string } | null {
  switch (status) {
    case "pending":
    case "pending_review":
      return { label: "Pending Review", bg: "rgba(234,179,8,0.2)", color: "#facc15" };
    case "approved":
    case "admin_approved":
      return { label: "Approved", bg: "rgba(34,197,94,0.2)", color: "#4ade80" };
    case "admin_rejected":
      return { label: "Rejected", bg: "rgba(239,68,68,0.2)", color: "#f87171" };
    case "flagged":
      return { label: "Flagged", bg: "rgba(239,68,68,0.2)", color: "#f87171" };
    case "edit_requested":
      return { label: "Changes Requested", bg: "rgba(167,139,250,0.2)", color: "#c4b5fd" };
    default:
      return null;
  }
}

export default function DetailsPrompt({
  open,
  onOpenChange,
  prompt,
  owned = false,
  onPurchase,
  showImages = false,
}: DetailsPromptProps) {
  const { user, token } = useAuth();

  const isTM = user?.userType === "TM";
  const isOrgOwnerAdmin =
    user?.userType === "ORG" && (user?.role === "Owner" || user?.role === "Admin");
  const isIND = user?.userType === "IND" || (!user?.userType && !isTM);
  // const canDownloadInvoice = isIND || isOrgOwnerAdmin; // disabled only for TM
    const canDownloadInvoice = true;

  // Your OWN uploaded prompt: no invoice (you didn't buy it) and no "report
  // your own resource" — hide both for it. isUploadedByMe is the reliable
  // signal; ownerEmail === your email is a fallback.
  const isOwnPrompt =
    !!prompt?.isUploadedByMe ||
    (!!user?.email && !!prompt?.ownerEmail &&
      user.email.trim().toLowerCase() === prompt.ownerEmail.trim().toLowerCase());
  // Share modal state
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Feedback stars (interactive)
  const [feedback, setFeedback] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);

  // Media handling
  // const media = useMemo(() => {
  //   if (!prompt) return null;
  //   const hasVideo = !!prompt.videoUrl?.trim();
  //   const hasImage = !!prompt.imageUrl?.trim();

  //   if (showImages || !hasVideo) {
  //     return {
  //       type: "image" as const,
  //       url: hasImage ? prompt.imageUrl! : "/icons/fallback.png",
  //     };
  //   } else {
  //     return { type: "video" as const, url: prompt.videoUrl! };
  //   }
  // }, [prompt, showImages]);




//   const media = useMemo(() => {
//   if (!prompt) return null;
//   const hasVideo = !!prompt.videoUrl?.trim();
//   const hasImage = !!prompt.imageUrl?.trim();

//   // ✅ Video ko priority do — showImages sirf fallback ke liye
//   if (hasVideo && !showImages) {
//     return { type: "video" as const, url: prompt.videoUrl! };
//   }

//   return {
//     type: "image" as const,
//     url: hasImage ? prompt.imageUrl! : "/icons/fallback.png",
//   };
// }, [prompt, showImages]);



const media = useMemo(() => {
  if (!prompt) return null;
  const hasVideo = !!prompt.videoUrl?.trim();
  const hasImage = !!prompt.imageUrl?.trim();

  // ✅ Video ko hamesha priority do
  if (hasVideo) {
    return { type: "video" as const, url: prompt.videoUrl! };
  }

  // null, not "/icons/fallback.png" — that file doesn't exist in public/, so
  // pointing <img> at it drew the browser's broken-image "?" on every prompt
  // without a picture. A missing preview is normal; it gets a real empty state
  // in the render below.
  return {
    type: "image" as const,
    url: hasImage ? prompt.imageUrl! : null,
  };
}, [prompt]); // showImages dependency hatao


  if (!prompt) return null;

  /* =================== PDF (styled invoice) =================== */



   async function loadImageAsBase64(src: string): Promise<string> {
  const res = await fetch(src);
  const blob = await res.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}


async function handleDownloadInvoice() {
  if (!prompt?.id) {
    toast({
      title: "Invoice error",
      description: "Prompt ID missing",
    });
    return;
  }

  try {
   

    const res = await fetch(
      `${API_BASE}/api/invoice/by-prompt/${prompt.id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.message || "Invoice failed");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_${prompt.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    console.error(err);
    toast({
      title: "Invoice failed",
      description: err.message || "Could not download invoice",
    });
  }
}



  /* =================== Feedback Submit (placeholder) =================== */
  function handleSubmit() {
    toast({
      title: "Feedback submitted",
      description: feedback
        ? `Thanks for rating ${feedback} star${feedback > 1 ? "s" : ""}!`
        : "Thanks for your feedback!",
    });
  }

  // Helper: show a single category badge (top-left). Use prompt.category if present; fallback to "MARKETING"
  const topLeftBadge = (prompt.category || "MARKETING").toUpperCase();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
  className="
    !z-[999999]
    bg-[#17171A] text-white p-0 border-none
    w-[min(92vw,1040px)] max-w-[1040px]
    top-[50%] translate-y-[-50%]
    md:h-[620px] max-h-[85vh]
    rounded-3xl md:rounded-[32px]
    overflow-hidden flex flex-col md:flex-row
  "
>
          {/* =================== MEDIA BANNER — left "page" of the book on desktop =================== */}

<div
  className="
    relative w-full md:w-[45%] md:h-full shrink-0
    aspect-[4/3] md:aspect-auto
    bg-[#333335]
    overflow-hidden
  "
>
            {/* Top-left single badge (category only) */}
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1 text-[12px] font-semibold rounded-full text-black bg-white">
                {topLeftBadge}
              </span>
            </div>

            {/* (Removed) Top-right secondary badge per your request */}

            {/* Media */}
            <div className="absolute inset-0">
              {media?.type === "image" && !media.url ? (
                // No preview on this prompt. Previously this branch rendered an
                // <img> pointed at a missing file, so the member opening a
                // shared prompt saw a broken-image "?" filling the whole panel.
                <div className="w-full h-full grid place-items-center bg-white/[0.04]">
                  <div className="flex flex-col items-center gap-2 text-white/30">
                    <ImageOff className="w-8 h-8" />
                    <span className="text-xs">No preview</span>
                  </div>
                </div>
              ) : media?.type === "image" ? (
                <img
                  src={media.url}
                  alt={prompt.title}
                  className="w-full h-full object-cover"
                  // Swapping src to a fallback file that doesn't exist just
                  // re-broke the image (and could loop). Hide it instead and let
                  // the panel background show through.
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <video
                  src={media?.url}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  autoPlay
                  playsInline
                />
              )}
            </div>

            {/* Type hint */}
            <div className="absolute bottom-3 left-4 flex items-center gap-2 text-sm text-white/80">
              {media?.type === "image" ? <ImageIcon className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              <span className="uppercase tracking-wide">{media?.type}</span>
            </div>
          </div>

          {/* =================== DETAILS — right "page" of the book on desktop =================== */}
          <div
            className="
             px-6 sm:px-8 md:px-10
pt-6 sm:pt-8
pb-8 sm:pb-10
              min-h-0 md:h-full flex-1 overflow-y-auto no-scrollbar
            "
          >
            {/* Title row */}
            <div className="mt-2">
              <h2 className="font-semibold ext-[18px] sm:text-[22px] md:text-[26px] leading-snug tracking-tight">
                {prompt.title}
              </h2>
            </div>

            {getModerationBadge(prompt.mediaValidation?.status) && (
              <span
                className="inline-block mt-2 px-2.5 py-1 text-[11px] font-semibold rounded-full"
                style={{
                  background: getModerationBadge(prompt.mediaValidation?.status)!.bg,
                  color: getModerationBadge(prompt.mediaValidation?.status)!.color,
                }}
              >
                {getModerationBadge(prompt.mediaValidation?.status)!.label}
              </span>
            )}

{/* Full Prompt Text */}
{owned && prompt.fullPrompt && (
  <div className="mt-8">
    <div className="text-white/85 text-[14px] mb-2 font-medium">Full Prompt</div>
    <div
      className="w-full rounded-[12px] p-4 text-white/90 text-[14px] leading-relaxed whitespace-pre-wrap select-all"
      style={{ background: "#1C1C1C", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      {prompt.fullPrompt}
    </div>
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(prompt.fullPrompt!);
        toast({ title: "Copied!", description: "Prompt copied to clipboard." });
      }}
      className="mt-2 px-4 h-9 rounded-lg text-sm text-white"
      style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
    >
      Copy Prompt
    </button>
  </div>
)}

{/* Locked state — not purchased */}
{!owned && (
  <div
    className="mt-8 w-full rounded-[12px] p-6 text-center"
    style={{ background: "#1C1C1C", border: "1px solid rgba(255,255,255,0.1)" }}
  >
    <p className="text-white/60 text-[14px]">Purchase this prompt to unlock the full content.</p>
  </div>
)}

            {/* Feature list — green circular tick items */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {["Lifetime access", "Instant download", "Pay once, use forever"].map((feature) => (
      <div key={feature} className="flex items-center gap-3 text-[15px] text-white/90">
        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
        <span>{feature}</span>
      </div>
    ))}
  </div>

            {/* Divider */}
            <div className="border-t border-white/10 mt-8" />

            {/* Share your feedback — interactive stars */}
            {/* <div className="mt-6">
              <div className="text-white/85 text-[14px] mb-2">Share your feedback</div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((i) => {
                  const active = (hover || feedback) >= i;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setFeedback(i)}
                      className="p-1"
                    >
                      {active ? (
                        <AiFillStar size={24} className="text-[#FF14EF]" />
                      ) : (
                        <AiOutlineStar size={24} className="text-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div> */}

            {/* Bottom action bar: left = Report Resource, right = Share / Download Invoice / Submit */}
              <div className="mt-8 flex items-center justify-between gap-3 flex-nowrap">
              {/* Left: Report — not for your own uploaded prompt */}
              {isOwnPrompt ? (
                <span />
              ) : (
                <ReportResourceTrigger promptId={String(prompt.id)} promptTitle={prompt.title} />
              )}

              {/* Right: Actions */}
               <div className="flex items-center gap-2 sm:gap-4 flex-nowrap overflow-x-auto">
                {/* Share — only for ORG accounts (org shares purchased prompts
                    with its team); hidden for TM and individual users. */}
                {user?.userType === "ORG" && (
                <button
                  className="flex items-center justify-center gap-2 text-white text-[14px] hover:text-[#FF14EF] transition-all"
                  onClick={() => setShowRequestModal(true)}
                >
                  <RiShareForwardLine className="w-5 h-5" />
                  Share
                </button>
                )}

                {/* Download Invoice — not for your own uploaded prompt (no purchase) */}
               {!isOwnPrompt && (
               <button
  onClick={handleDownloadInvoice}
  disabled={!canDownloadInvoice}
  className={`
    px-5 h-11 rounded-[8px] border border-white/10 text-[14px]
    transition-all whitespace-nowrap justify-center sm:justify-start  /* 👈 ADD THIS */
    ${canDownloadInvoice
      ? "bg-[#1C1C1E] text-white hover:bg-gradient-to-r hover:from-[#5A3FFF] hover:to-[#FF14EF]"
      : "bg-[#1C1C1E] text-white/50 cursor-not-allowed opacity-60"}
  `}
>
  Download Invoice
</button>
               )}

                {/* Submit */}
                {/* <button
                  onClick={handleSubmit}
                  className="
                    px-6 h-11 rounded-[8px] text-white text-[14px] font-medium
                    bg-white/10 border border-white/15 hover:bg-white/15 transition-colors
                  "
                >
                  Submit
                </button> */}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request To Buy Modal */}
      {prompt && (
        <RequestToBuyModal
          open={showRequestModal}
          onOpenChange={setShowRequestModal}
          promptId={prompt?.id?.toString() || ""}
          promptTitle={prompt?.title || ""}
          price={prompt?.price || 0} // not shown in this page, required by modal props
          thumbnail={prompt?.imageUrl || ""}
          userType={user?.userType === "TM" ? "TM" : "ORG"}
          role={user?.role || ""}
          ownerEmail={user?.userType === "TM" ? prompt?.ownerEmail || "" : ""}
        />
      )}
    </>
  );
}

/* =========================================================================
   Report Resource Trigger + Dialog (Create-only, API integrated)
   ========================================================================= */
function ReportResourceTrigger({ promptId, promptTitle }: { promptId: string; promptTitle: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="text-white text-base hover:opacity-90"
        onClick={() => setOpen(true)}
      >
        Report Resource
      </button>
      <ReportResourceDialog open={open} onOpenChange={setOpen} promptId={promptId} promptTitle={promptTitle} />
    </>
  );
}

type ReportDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  promptId: string;
  promptTitle?: string; // for context only
};

export function ReportResourceDialog({
  open,
  onOpenChange,
  promptId,
}: ReportDialogProps) {
  const { token } = useAuth();

  // form state
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [reason, setReason] = useState("");
  const [desc, setDesc] = useState("");
  const [steps, setSteps] = useState("");
  const [agree, setAgree] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [touchedUrl, setTouchedUrl] = useState(false);

  // categories
  const [categories, setCategories] = useState<{ name: string; _id: string }[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);

  // submitting
  const [submitting, setSubmitting] = useState(false);

  const isValidUrl = (() => {
    try {
      if (!url) return false;
      const u = new URL(url);
      return !!u.protocol && !!u.host;
    } catch {
      return false;
    }
  })();

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files ? Array.from(e.target.files).slice(0, 5) : [];
    setFiles(list);
  }

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoadingCats(true);
        const r = await fetch(`${API_BASE}/api/category`, {
          method: "GET",
          credentials: "include",
        });
        const data = await r.json();
        if (data?.success) setCategories(data.categories || []);
      } catch (e) {
        console.error(e);
        toast({ title: "Failed to load categories", description: "Please try again." });
      } finally {
        setLoadingCats(false);
      }
    })();
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      toast({ title: "Please log in", description: "You must be logged in to report a resource." });
      return;
    }
    if (!promptId) {
      toast({ title: "Missing prompt", description: "Prompt ID is required." });
      return;
    }
    if (!reason || !category) {
      toast({ title: "Missing fields", description: "Select a category and reason." });
      return;
    }
    if (!isValidUrl || !agree) return;

    try {
      setSubmitting(true);

      const form = new FormData();
      form.append("prompt", promptId);
      if (title) form.append("resourceTitle", title);
      form.append("resourceURL", url);
      form.append("category", category);

      const tagsArr = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      form.append("tags", JSON.stringify(tagsArr));

      form.append("reason", reason);
      if (desc) form.append("description", desc);
      if (steps) form.append("stepsToReproduce", steps);

      files.forEach((f) => form.append("screenshots", f));

      const r = await fetch(`${API_BASE}/api/promptreport`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
        credentials: "include",
      });

      const data = await r.json();
      if (!r.ok || !data?.success) {
        throw new Error(data?.error || "submit_failed");
      }

      toast({ title: "Report submitted", description: "Thanks for your feedback!" });

      setTitle("");
      setUrl("");
      setCategory("");
      setTags("");
      setReason("");
      setDesc("");
      setSteps("");
      setFiles([]);
      setAgree(false);
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Could not submit report",
        description: err?.message || "Something went wrong.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          bg-[#17171A] text-white border border-white/10
          w-[min(96vw,640px)]
          max-h-[95vh]
          rounded-2xl p-0 overflow-hidden
        "
      >
        <form className="p-5 sm:p-6 overflow-y-auto no-scrollbar max-h-[95vh]" onSubmit={submit}>
          <h3 className="text-lg font-semibold mb-1">Report a Resource</h3>
          <p className="text-white/70 text-sm mb-5">
            Flag broken, outdated, inappropriate, or otherwise problematic resources.
          </p>

          <label className="block text-sm mb-1">Resource Title</label>
          <input
            type="text"
            className="w-full h-11 rounded-xl bg-transparent border border-white/15 px-3 mb-4 outline-none"
            placeholder="e.g., Intro to UX Research"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="block text-sm mb-1">Resource URL</label>
          <div className="relative">
            <input
              type="url"
              className={`w-full h-11 rounded-xl bg-transparent border px-3 outline-none ${
                touchedUrl && !isValidUrl ? "border-red-500/70 pr-10" : "border-white/15"
              }`}
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => setTouchedUrl(true)}
            />
            {touchedUrl && !isValidUrl && (
              <>
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 h-5 w-5" />
                <div className="text-red-400 text-xs mt-1">Please enter valid url</div>
              </>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm mb-1">Category</label>
            <div className="h-11 rounded-xl px-3 flex items-center border border-white/15 bg-[#17171A]">
              <select
                className="bg-[#17171A] text-white/90 w-full outline-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loadingCats}
              >
                <option value="">{loadingCats ? "Loading categories..." : "Select a category"}</option>
                {categories.map((c) => (
                 <option key={c._id} value={c._id}>
  {c.name}
</option>

                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm mb-1">
              Tags <span className="text-white/50 text-xs">(comma separated)</span>
            </label>
            <input
              type="text"
              className="w-full h-11 rounded-xl bg-transparent border border-white/15 px-3 outline-none"
              placeholder="ui/ux, research, prototyping"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm mb-1">Reason for Report</label>
            <div className="h-11 rounded-xl px-3 flex items-center border border-white/15 bg-[#17171A]">
              <select
                className="bg-[#17171A] text-white/90 w-full outline-none"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">Choose reason</option>
                <option value="broken">Broken link / media</option>
                <option value="outdated">Outdated</option>
                <option value="inappropriate">Inappropriate</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm mb-1">Describe the issue</label>
            <textarea
              rows={4}
              className="w-full rounded-xl bg-transparent border border-white/15 px-3 py-2 outline-none"
              placeholder="What is wrong with this resource? Include key details."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm mb-1">
              Attach screenshots <span className="text-white/50 text-xs">(optional)</span>
            </label>
            <label
              className="
                w-full h-28 rounded-xl border border-dashed border-white/20
                grid place-items-center text-white/60 cursor-pointer
              "
            >
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,application/pdf"
                className="hidden"
                onChange={onFileChange}
              />
              {files.length === 0 ? "Add up to 5 files" : `${files.length} file(s) selected`}
            </label>
            <div className="text-xs text-white/50 mt-2">Up to 5 files. PNG/JPG/PDF.</div>
          </div>

          <label className="flex items-start gap-3 mt-4 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <span className="text-white/80">
              I agree that this report complies with the Community Guidelines and Privacy Policy.
            </span>
          </label>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="h-10 px-4 rounded-xl bg-white/10 border border-white/15"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="
                h-10 px-5 rounded-xl text-white
                bg-gradient-to-r from-[#5A3FFF] to-[#FF14EF]
                disabled:opacity-60 flex items-center gap-2
              "
              disabled={!isValidUrl || !agree || !reason || !category || submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}