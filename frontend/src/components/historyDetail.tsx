




// src/pages/historyDetail.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Image as ImageIcon,
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
  // Share modal state
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Feedback stars (interactive)
  const [feedback, setFeedback] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);

  // Media handling
  const media = useMemo(() => {
    if (!prompt) return null;
    const hasVideo = !!prompt.videoUrl?.trim();
    const hasImage = !!prompt.imageUrl?.trim();

    if (showImages || !hasVideo) {
      return {
        type: "image" as const,
        url: hasImage ? prompt.imageUrl! : "/icons/fallback.png",
      };
    } else {
      return { type: "video" as const, url: prompt.videoUrl! };
    }
  }, [prompt, showImages]);

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
            bg-[#17171A] text-white p-0 border-none
          w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[1200px]
rounded-2xl md:rounded-[32px]
max-h-[95vh]
          "
        >
          {/* =================== MEDIA BANNER =================== */}
          <div
            className="
              relative mx-auto
             w-[92%] sm:w-[95%]
aspect-[4/3] sm:aspect-[3/2]
mt-4 sm:mt-6
              shrink-0
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
              {media?.type === "image" ? (
                <img
                  src={media.url}
                  alt={prompt.title}
                  className="w-full h-full object-cover"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/icons/fallback.png")}
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

          {/* =================== DETAILS =================== */}
          <div
            className="
             px-4 sm:px-6 md:px-12
pt-6 sm:pt-8
pb-8 sm:pb-10
              min-h-0 flex-1 overflow-y-auto no-scrollbar
            "
          >
            {/* Title row */}
            <div className="grid grid-cols-[1fr_auto] items-start gap-4 mt-2">
              <h2 className="font-semibold ext-[18px] sm:text-[22px] md:text-[26px] leading-snug tracking-tight">
                {prompt.title}
              </h2>
              <span
                className="flex items-center justify-center rounded-full justify-self-end"
                style={{ backgroundColor: "#333335", width: 42, height: 42 }}
                aria-hidden
              >
                <img src="/icons/cop1.png" alt="" className="w-5 h-5 object-contain" />
              </span>
            </div>

            {/* Developer Favourite block — prominent like before */}
          {/* Developer Favourite block — full width, 150px tall, minimal text */}
{/* Developer Favourite Banner — matches DetailsPrompt look */}
<div
  className="
    mt-8
    bg-[#333335]
    border border-white/10
    rounded-[12px]
    px-6 py-4
    flex items-center justify-between gap-4
    w-full
  "
  style={{ height: "100px" }}
>
  {/* Left: Logo + Text */}
  <div className="flex items-center gap-4 min-w-0">
    <img
      src="/icons/dtlogo.svg"
      onError={(e) => {
        const img = e.currentTarget as HTMLImageElement;
        img.src = "/icons/dtlogo.png";
      }}
      alt="DT Logo"
      className="shrink-0 object-contain h-10 w-10"
    />

    <div className="min-w-0">
      <div className="truncate text-[18px] leading-snug font-medium text-white">
        Power Your Storefronts with Auto-Generated Descriptions
      </div>
      <div className="text-white/70 truncate text-[13px] mt-1 leading-snug">
        Generate compelling product descriptions that convert visitors into customers
      </div>
    </div>
  </div>

  {/* Right: Static Rating */}
  <div className="flex flex-col items-center gap-1 shrink-0">
    <span className="text-[13px] font-semibold leading-none">4.9</span>
    <div className="flex items-center gap-[3px] leading-none">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24">
          <path
            d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill="#FFFFFF"
          />
        </svg>
      ))}
    </div>
  </div>
</div>



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
              {/* Left: Report */}
              <ReportResourceTrigger promptId={String(prompt.id)} promptTitle={prompt.title} />

              {/* Right: Actions */}
               <div className="flex items-center gap-2 sm:gap-4 flex-nowrap overflow-x-auto">
                {/* Share */}
                <button
                  className="flex items-center justify-center gap-2 text-white text-[14px] hover:text-[#FF14EF] transition-all"
                  onClick={() => setShowRequestModal(true)}
                >
                  <RiShareForwardLine className="w-5 h-5" />
                  Share
                </button>

                {/* Download Invoice */}
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
