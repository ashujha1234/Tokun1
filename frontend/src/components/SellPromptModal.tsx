// // src/components/SellPromptModal.tsx
// import { useEffect, useMemo, useRef, useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { Switch } from "@/components/ui/switch";
// import { Plus, X, Upload, Image, Video, FileX, Check } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";

// interface SellPromptModalProps {
//   onPromptSubmitted?: (prompt?: any) => void;
//   open?: boolean;
//   onOpenChange?: (open: boolean) => void;
// }

// const GRAD = "linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)";

// export default function SellPromptModal({
//   onPromptSubmitted,
//   open: controlledOpen,
//   onOpenChange,
// }: SellPromptModalProps) {
//   // controlled/uncontrolled
//   const [internalOpen, setInternalOpen] = useState(false);
//   const open = controlledOpen ?? internalOpen;
//   const setOpen = onOpenChange ?? setInternalOpen;

//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [promptText, setPromptText] = useState("");
//   const [category, setCategory] = useState("");
//   const [price, setPrice] = useState("");
//   const [isFree, setIsFree] = useState(true); // default like PromptMarketplace
//   const [tags, setTags] = useState<string[]>([]);
//   const [newTag, setNewTag] = useState("");
//   const [attachments, setAttachments] = useState<File[]>([]);

//   // Upload New Code (simulated)
//   const [codeFile, setCodeFile] = useState<File | null>(null);
//   const [progress, setProgress] = useState(0);
//   const [success, setSuccess] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const uploadTimerRef = useRef<number | null>(null);

//   const { toast } = useToast();

//   const categories = [
//     "Productivity",
//     "Code",
//     "Writing",
//     "Marketing",
//     "Design",
//     "Education",
//     "Business",
//     "UI/UX",
//   ];

//   const fieldBase =
//     "w-full h-[44px] rounded-lg bg-[#131419] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/10";
//   const textareaBase =
//     "w-full rounded-lg bg-[#131419] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/10";

//   const contentStyle: React.CSSProperties = {
//     width: "min(720px, 92vw)",
//     maxHeight: "min(80vh, 900px)",
//     borderRadius: 16,
//     background: "#0E0F12",
//     border: "1px solid rgba(255,255,255,0.1)",
//     color: "#fff",
//     boxShadow: "0 12px 80px rgba(0,0,0,0.65)",
//   };

//   const canAddTag = useMemo(() => tags.length < 5, [tags]);

//   useEffect(() => {
//     return () => {
//       if (uploadTimerRef.current) {
//         window.clearInterval(uploadTimerRef.current);
//         uploadTimerRef.current = null;
//       }
//     };
//   }, []);

//   const handleAddTag = () => {
//     const t = newTag.trim();
//     if (!t || !canAddTag || tags.includes(t)) return;
//     setTags((p) => [...p, t]);
//     setNewTag("");
//   };
//   const handleRemoveTag = (tag: string) => setTags((p) => p.filter((t) => t !== tag));

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return "0 Bytes";
//     const k = 1024,
//       sizes = ["Bytes", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
//   };

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     const valid = files.filter((file) => {
//       const okType = file.type.startsWith("image/") || file.type.startsWith("video/");
//       const okSize = file.size <= 50 * 1024 * 1024;
//       if (!okType) {
//         toast({
//           title: "Invalid file type",
//           description: "Only image and video files are allowed",
//           variant: "destructive",
//         });
//         return false;
//       }
//       if (!okSize) {
//         toast({
//           title: "File too large",
//           description: "Files must be under 50MB",
//           variant: "destructive",
//         });
//         return false;
//       }
//       return true;
//     });
//     if (attachments.length + valid.length > 5) {
//       toast({
//         title: "Too many files",
//         description: "Maximum 5 attachments allowed",
//         variant: "destructive",
//       });
//       return;
//     }
//     setAttachments((p) => [...p, ...valid]);
//   };

//   const removeAttachment = (i: number) =>
//     setAttachments((p) => p.filter((_, idx) => idx !== i));

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!title || !description || !promptText || !category || (!isFree && !price)) {
//       toast({
//         title: "Missing Information",
//         description: "Please fill in all required fields",
//         variant: "destructive",
//       });
//       return;
//     }

//     // Simulated success + return payload upward
//     const payload = {
//       title,
//       description,
//       promptText,
//       category,
//       isFree,
//       price: isFree ? 0 : Number(price),
//       tags,
//       attachments: attachments.map((f) => f.name),
//     };

//     toast({
//       title: "Prompt ready!",
//       description: isFree
//         ? "Your prompt is prepared as a free listing (no upload yet)."
//         : "Your prompt is prepared for sale (no upload yet).",
//     });

//     onPromptSubmitted?.(payload);

//     // reset + close
//     setTitle("");
//     setDescription("");
//     setPromptText("");
//     setCategory("");
//     setPrice("");
//     setIsFree(true);
//     setTags([]);
//     setAttachments([]);
//     setOpen(false);
//   };

//   // hidden inputs for uploads
//   const attachRef = useRef<HTMLInputElement>(null);
//   const codeRef = useRef<HTMLInputElement>(null);

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       {controlledOpen === undefined && (
//         <DialogTrigger asChild>
//           <Button
//             className="rounded-lg px-4 py-2 text-white"
//             style={{ backgroundImage: GRAD }}
//           >
//             Upload Your Prompt
//           </Button>
//         </DialogTrigger>
//       )}

//       <DialogContent
//         className="
//           bg-[#17171A] text-white border border-white/10
//           w-[min(96vw,720px)]
//           h-[100vh] md:h-[95vh]
//           rounded-none md:rounded-2xl
//           p-0 overflow-hidden
//           flex flex-col
//         "
//         style={contentStyle}
//       >
//         {/* Header */}
//         <DialogHeader className="px-6 pt-5">
//           <DialogTitle className="text-lg md:text-xl font-semibold">
//             Upload Your Prompt to Marketplace
//           </DialogTitle>
//         </DialogHeader>

//         {/* Body */}
//         <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-6 space-y-6">
//           {/* Title */}
//           <div className="space-y-2">
//             <Label className="text-sm text-white/80">Title</Label>
//             <Input
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="e.g., Advanced Code Review Prompt"
//               className={fieldBase}
//               required
//             />
//           </div>

//           {/* Description */}
//           <div className="space-y-2">
//             <Label className="text-sm text-white/80">Description</Label>
//             <Textarea
//               rows={4}
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder="Describe what your prompt does and what makes it valuable..."
//               className={`${textareaBase} min-h-[120px]`}
//               required
//             />
//           </div>

//           {/* Category (dropdown) */}
//           <div className="space-y-2">
//             <Label className="text-sm text-white/80">
//               Category <span className="text-pink-400">*</span>
//             </Label>
//             <Select value={category} onValueChange={setCategory} required>
//               <SelectTrigger className={fieldBase}>
//                 <SelectValue placeholder="Select a category" />
//               </SelectTrigger>
//               <SelectContent className="max-h-[240px]">
//                 {categories.map((cat) => (
//                   <SelectItem key={cat} value={cat.toLowerCase()}>
//                     {cat}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Prompt Text */}
//           <div className="space-y-2">
//             <Label className="text-sm text-white/80">
//               Prompt Text <span className="text-pink-400">*</span>
//             </Label>
//             <Textarea
//               rows={5}
//               value={promptText}
//               onChange={(e) => setPromptText(e.target.value)}
//               placeholder="Enter your complete prompt here..."
//               className={`${textareaBase} min-h-[160px]`}
//               required
//             />
//             <p className="text-xs text-white/50">
//               This will be the full prompt that buyers receive
//             </p>
//           </div>

//           {/* Free toggle + Price */}
//           <div className="space-y-4">
//             <div className="flex flex-wrap items-center gap-3 text-sm">
//               <Switch
//                 id="free-toggle"
//                 checked={isFree}
//                 onCheckedChange={setIsFree}
//                 className="[&>span]:bg-[#0D0D0E]"
//                 style={{
//                   backgroundImage: isFree ? GRAD : undefined,
//                   backgroundColor: isFree ? undefined : "#17171A",
//                 }}
//               />
//               <Label htmlFor="free-toggle" className="text-white">
//                 Make this prompt free
//               </Label>
//             </div>

//             {!isFree && (
//               <div className="space-y-2">
//                 <Label className="text-sm text-white/80">Price (USD) *</Label>
//                 <Input
//                   type="number"
//                   step="0.01"
//                   min="0.99"
//                   value={price}
//                   onChange={(e) => setPrice(e.target.value)}
//                   placeholder="$9.99"
//                   className={fieldBase}
//                   required
//                 />
//               </div>
//             )}
//           </div>

//           {/* Tags */}
//           <div className="space-y-2">
//             <Label className="text-sm text-white/80">Tags (max 5)</Label>
//             <div className="flex flex-wrap items-center gap-2">
//               {tags.map((tag) => (
//                 <Badge
//                   key={tag}
//                   variant="secondary"
//                   className="flex items-center gap-1 bg-white/5 text-white"
//                 >
//                   {tag}
//                   <X
//                     className="h-3.5 w-3.5 cursor-pointer"
//                     onClick={() => handleRemoveTag(tag)}
//                   />
//                 </Badge>
//               ))}
//             </div>
//             <div className="flex gap-2">
//               <Input
//                 value={newTag}
//                 onChange={(e) => setNewTag(e.target.value)}
//                 placeholder="Add a tag..."
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") {
//                     e.preventDefault();
//                     handleAddTag();
//                   }
//                 }}
//                 disabled={!canAddTag}
//                 className={fieldBase}
//               />
//               <Button
//                 type="button"
//                 onClick={handleAddTag}
//                 disabled={!canAddTag || !newTag.trim()}
//                 className="rounded-lg px-3"
//               >
//                 <Plus className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>

//           {/* Attachments */}
//           <div className="space-y-2">
//             <Label className="text-sm text-white/80">Attachments (Optional)</Label>
//             <div
//               onClick={() => attachRef.current?.click()}
//               className="cursor-pointer rounded-lg border border-dashed border-white/15 bg-transparent p-8 text-center hover:bg-white/[0.03] transition"
//             >
//               <Upload className="mx-auto mb-3 h-5 w-5 text-white/60" />
//               <p className="text-sm text-white/70">Click to upload</p>
//               <input
//                 ref={attachRef}
//                 type="file"
//                 multiple
//                 accept="image/*,video/*"
//                 onChange={handleFileUpload}
//                 className="hidden"
//               />
//             </div>
//             <p className="text-xs text-white/50">
//               You can upload image/video files (max 5, 50MB each).
//             </p>

//             {attachments.length > 0 && (
//               <div className="space-y-2">
//                 {attachments.map((file, index) => (
//                   <div
//                     key={`${file.name}-${index}`}
//                     className="flex items-center justify-between rounded-lg border border-white/10 bg-[#131419] p-3"
//                   >
//                     <div className="flex items-center gap-3">
//                       {file.type.startsWith("image/") ? (
//                         <Image className="h-5 w-5 text-blue-400" />
//                       ) : (
//                         <Video className="h-5 w-5 text-fuchsia-400" />
//                       )}
//                       <div>
//                         <p className="max-w-48 truncate text-sm font-medium">
//                           {file.name}
//                         </p>
//                         <p className="text-xs text-white/60">
//                           {formatFileSize(file.size)}
//                         </p>
//                       </div>
//                     </div>
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => removeAttachment(index)}
//                       className="text-red-500 hover:text-red-600"
//                     >
//                       <FileX className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Upload New Code (simulated) */}
//           <div className="space-y-3">
//             <h3 className="text-base font-semibold">Upload New Code</h3>
//             <p className="text-sm text-white/70">
//               Add a new version of your code to the portal.
//             </p>

//             <div
//               onClick={() => codeRef.current?.click()}
//               className="cursor-pointer rounded-lg border border-dashed border-white/15 bg-transparent p-8 text-center hover:bg-white/[0.03] transition"
//             >
//               <Upload className="mx-auto mb-3 h-5 w-5 text-white/60" />
//               <p className="text-sm text-white/70">
//                 Drag &amp; drop or click to select file
//               </p>
//               <input
//                 ref={codeRef}
//                 type="file"
//                 className="hidden"
//                 onChange={(e) => {
//                   const file = e.target.files?.[0] || null;
//                   setCodeFile(file);
//                   // reset indicators for a fresh upload attempt
//                   setProgress(0);
//                   setSuccess(false);
//                   setUploading(false);
//                   if (uploadTimerRef.current) {
//                     window.clearInterval(uploadTimerRef.current);
//                     uploadTimerRef.current = null;
//                   }
//                 }}
//               />
//             </div>

//             {codeFile && (
//               <p className="text-xs text-white/70">{codeFile.name}</p>
//             )}

//             <div className="flex flex-col gap-3">
//               <Button
//                 className="w-full rounded-xl px-4 py-3 text-sm font-medium text-white shadow-md"
//                 style={{ backgroundImage: GRAD }}
//                 type="button"
//                 disabled={!codeFile || uploading}
//                 onClick={() => {
//                   if (!codeFile || uploading) return;

//                   // reset for a new run
//                   setSuccess(false);
//                   setProgress(0);
//                   setUploading(true);

//                   if (uploadTimerRef.current) {
//                     window.clearInterval(uploadTimerRef.current);
//                     uploadTimerRef.current = null;
//                   }

//                   uploadTimerRef.current = window.setInterval(() => {
//                     setProgress((p) => {
//                       const next = Math.min(p + 10, 100);
//                       if (next === 100) {
//                         if (uploadTimerRef.current) {
//                           window.clearInterval(uploadTimerRef.current);
//                           uploadTimerRef.current = null;
//                         }
//                         setUploading(false);
//                         setSuccess(true); // ONLY when progress === 100
//                       }
//                       return next;
//                     });
//                   }, 200);
//                 }}
//               >
//                 {uploading ? "Uploading…" : "Upload Code"}
//               </Button>

//               {/* progress */}
//               <div className="w-full">
//                 <div className="h-1.5 w-full rounded-full bg-white/10">
//                   <div
//                     className="h-1.5 rounded-full"
//                     style={{ width: `${progress}%`, backgroundImage: GRAD }}
//                   />
//                 </div>
//                 <div className="mt-1 text-right text-xs text-white/70">
//                   {progress}%
//                 </div>
//               </div>

//               {/* success banner — ONLY when 100% */}
//               {success && progress === 100 && (
//                 <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-emerald-300">
//                   <Check className="h-4 w-4" />
//                   <span className="text-sm">Upload successful!</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center justify-end gap-3 pt-2">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => setOpen(false)}
//               className="rounded-xl border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white/90 hover:bg-white/5"
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               onClick={handleSubmit}
//               className="rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-md"
//               style={{ backgroundImage: GRAD }}
//             >
//               {isFree ? "Upload Free Prompt" : "List Prompt for Sale"}
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }


// src/components/SellPromptModal.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Upload, Image, Video, FileX, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// If you already have an auth context, import it and get the token:
import { useAuth } from "@/contexts/AuthContext";

interface SellPromptModalProps {
  onPromptSubmitted?: (prompt?: any) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type Category = { _id: string; name: string; description?: string };

const GRAD = "linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)";
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export default function SellPromptModal({
  onPromptSubmitted,
  open: controlledOpen,
  onOpenChange,
}: SellPromptModalProps) {
  // controlled/uncontrolled
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
// One-time sale toggle state
const [oneTimeSale, setOneTimeSale] = useState<boolean>(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [promptText, setPromptText] = useState("");
  const [category, setCategory] = useState(""); // store category name (case-insensitive match on server)
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]); // main attachment (1 file)
    const [oneTime, setOneTime] = useState(false);

  // Upload New Code (simulated progress; file sent during submit)
  const [codeFile, setCodeFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const uploadTimerRef = useRef<number | null>(null);

  const { toast } = useToast();
  const { token } = useAuth?.() || ({} as any); // adjust if your context differs

  // Categories from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(false);
  const [catsError, setCatsError] = useState<string | null>(null);

  const fieldBase =
    "w-full h-[44px] rounded-lg bg-[#131419] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/10";
  const textareaBase =
    "w-full rounded-lg bg-[#131419] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/10";

  const contentStyle: React.CSSProperties = {
    width: "min(720px, 92vw)",
    maxHeight: "min(95vh, 1100px)",
    borderRadius: 16,
    background: "#0E0F12",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    boxShadow: "0 12px 80px rgba(0,0,0,0.65)",
  };

  const canAddTag = useMemo(() => tags.length < 5, [tags]);


   const isCodingCategory = useMemo(() => {
  const c = (category || "").trim().toLowerCase();
  // Treat “Coding” as the canonical name; you can expand this if needed
  return c === "coding";
}, [category]);



useEffect(() => {
  if (!isCodingCategory) {
    setCodeFile(null);
    setProgress(0);
    setSuccess(false);
    setUploading(false);
    if (uploadTimerRef.current) {
      window.clearInterval(uploadTimerRef.current);
      uploadTimerRef.current = null;
    }
  }
}, [isCodingCategory]);












  // Cleanup timer
  useEffect(() => {
    return () => {
      if (uploadTimerRef.current) {
        window.clearInterval(uploadTimerRef.current);
        uploadTimerRef.current = null;
      }
    };
  }, []);

  // Load categories when modal opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setCatsLoading(true);
        setCatsError(null);
        const res = await fetch(`${API_BASE}/api/category`);
        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || "failed_to_load_categories");
        }
        setCategories(data.categories || []);
      } catch (err: any) {
        setCatsError(err?.message || "Failed to load categories");
        toast({
          title: "Couldn’t load categories",
          description: "You can still type your prompt, but choose a category later.",
          variant: "destructive",
        });
      } finally {
        setCatsLoading(false);
      }
    })();
  }, [open, toast]);

  const handleAddTag = () => {
    const t = newTag.trim();
    if (!t || !canAddTag || tags.includes(t)) return;
    setTags((p) => [...p, t]);
    setNewTag("");
  };
  const handleRemoveTag = (tag: string) => setTags((p) => p.filter((t) => t !== tag));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024,
      sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Limit to 1 main attachment to match backend (attachment single)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((file) => {
      const okType = file.type.startsWith("image/") || file.type.startsWith("video/");
      const okSize = file.size <= 50 * 1024 * 1024;
      if (!okType) {
        toast({
          title: "Invalid file type",
          description: "Only image and video files are allowed",
          variant: "destructive",
        });
        return false;
      }
      if (!okSize) {
        toast({
          title: "File too large",
          description: "Files must be under 50MB",
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if ((attachments.length ? 1 : 0) + valid.length > 1) {
      toast({
        title: "Only one attachment allowed",
        description: "Your API expects a single ‘attachment’. Pick just one image or video.",
        variant: "destructive",
      });
      return;
    }
    if (valid.length) {
      setAttachments((p) => [...p, valid[0]]);
    }
  };

  const removeAttachment = (i: number) =>
    setAttachments((p) => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !promptText || !category || (!isFree && !price)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (attachments.length === 0) {
      toast({
        title: "Attachment required",
        description: "Please upload one image or video.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("description", description.trim());
      fd.append("promptText", promptText);
      fd.append("free", String(isFree));
      if (!isFree) fd.append("price", String(Number(price)));
      if (tags.length) fd.append("tags", tags.join(","));
      // Backend matches categories by name (case-insensitive)
      if (category) fd.append("categories", category.trim());
         

      
// NEW: if one-time sale toggle is ON
if (oneTimeSale) fd.append("exclusive", "true");
      // Files
      fd.append("attachment", attachments[0]); // main required
      if (codeFile) {
        // Your route supports multiple under "uploadCode" – we send one.
        fd.append("uploadCode", codeFile);
      }

      const res = await fetch(`${API_BASE}/api/prompt`, {
        method: "POST",
        headers: {
          // IMPORTANT: don't set Content-Type; the browser will set multipart/form-data with boundary
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: fd,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        const code = data?.error || "server_error";
        let msg = "Something went wrong.";
        if (code === "title_and_promptText_required") msg = "Title and Prompt Text are required.";
        if (code === "price_required_for_paid_prompt") msg = "Price is required for paid prompts.";
        if (code === "attachment_required") msg = "Please attach an image or video.";
        if (code === "only_image_or_video_allowed") msg = "Attachment must be image or video.";
        if (code === "invalid_categories") msg = `Invalid categories: ${data?.invalid?.join(", ")}`;
        toast({ title: "Upload failed", description: msg, variant: "destructive" });
        return;
      }

      toast({
        title: "Prompt uploaded!",
        description: data.prompt?.free
          ? "Your prompt is listed as FREE."
          : `Your prompt is listed for $${data.prompt?.price} (Tokun price: $${data.prompt?.tokun_price}).`,
      });

      onPromptSubmitted?.(data.prompt);

      // reset + close
      setTitle("");
      setDescription("");
      setPromptText("");
      setCategory("");
      setPrice("");
      setIsFree(true);
      setTags([]);
      setAttachments([]);
      setCodeFile(null);
      setProgress(0);
      setSuccess(false);
      setUploading(false);
      if (uploadTimerRef.current) {
        window.clearInterval(uploadTimerRef.current);
        uploadTimerRef.current = null;
      }
      setOpen(false);
    } catch (err: any) {
      toast({
        title: "Network error",
        description: err?.message || "Could not reach the server.",
        variant: "destructive",
      });
    }
  };

  // hidden inputs for uploads
  const attachRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
   const isPaid = !isFree;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button
            className="rounded-lg px-4 py-2 text-white"
            style={{ backgroundImage: GRAD }}
          >
            Upload Your Prompt
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        className="
          bg-[#17171A] text-white border border-white/10
          w-[min(96vw,720px)]
          h-[100vh] md:h-[95vh]
          rounded-none md:rounded-2xl
          p-0 overflow-hidden
          flex flex-col
        "
        style={contentStyle}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-5">
          <DialogTitle className="text-lg md:text-xl font-semibold">
            Upload Your Prompt to Marketplace
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <form onSubmit={handleSubmit} className="no-scrollbar flex-1 overflow-y-auto px-6 pb-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-sm text-white/80">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Advanced Code Review Prompt"
              className={fieldBase}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm text-white/80">Description</Label>
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your prompt does and what makes it valuable..."
              className={`${textareaBase} min-h-[120px]`}
              required
            />
          </div>

          {/* Category (dropdown populated from API) */}
          <div className="space-y-2">
            <Label className="text-sm text-white/80">
              Category <span className="text-pink-400">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={setCategory}
              required
              disabled={catsLoading || !!catsError}
            >
              <SelectTrigger className={fieldBase}>
                <SelectValue placeholder={catsLoading ? "Loading categories..." : "Select a category"} />
              </SelectTrigger>
              <SelectContent className="max-h-[240px]">
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {catsError && (
              <p className="text-xs text-red-400">
                Couldn’t load categories. Try reopening this modal to retry.
              </p>
            )}
          </div>

          {/* Prompt Text */}
          <div className="space-y-2">
            <Label className="text-sm text-white/80">
              Prompt Text <span className="text-pink-400">*</span>
            </Label>
            <Textarea
              rows={5}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Enter your complete prompt here..."
              className={`${textareaBase} min-h-[160px]`}
              required
            />
            <p className="text-xs text-white/50">
              This will be the full prompt that buyers receive
            </p>
          </div>

          {/* Free toggle + Price */}
      {/* Pricing toggles + Price */}

      {/* Free toggle + Price */}
{/* Paid/Free toggle + dependent fields (UI shows paid when ON; logic still uses isFree) */}
<div className="space-y-4">
  {/* One line: label left, toggle right */}
  <div className="flex items-center justify-between text-sm">
    <Label htmlFor="free-toggle" className="text-white">
     Set this prompt as paid
    </Label>
    <Switch
      id="free-toggle"
      checked={isPaid}                       // UI ON = paid
      onCheckedChange={(on) => {            // on=true => paid, so set isFree to false
        setIsFree(!on);
        if (!on) {                          // switched back to FREE
          setPrice("");
          setOneTimeSale(false);
        }
      }}
      className="[&>span]:bg-[#0D0D0E]"
      style={{
        backgroundImage: isPaid ? GRAD : undefined,
        backgroundColor: isPaid ? undefined : "#17171A",
      }}
    />
  </div>

  {/* One-time sale: visible only when toggle is ON (paid) */}
  {isPaid && (
    <div className="flex items-center justify-between text-sm">
      <Label htmlFor="one-time-sale" className="text-white">
        One-time sale
      </Label>
      <Switch
        id="one-time-sale"
        checked={oneTimeSale}
        onCheckedChange={setOneTimeSale}
        className="[&>span]:bg-[#0D0D0E]"
        style={{
          backgroundImage: oneTimeSale ? GRAD : undefined,
          backgroundColor: oneTimeSale ? undefined : "#17171A",
        }}
      />
    </div>
  )}

  {/* Price field: visible only when toggle is ON (paid) */}
  {isPaid && (
    <div className="space-y-2">
      <Label className="text-sm text-white/80">Price (USD) *</Label>
      <Input
        type="number"
        step="0.01"
        min="0.99"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="$9.99"
        className={fieldBase}
        required
      />
    </div>
  )}
</div>



          {/* Tags */}
               {/* Tags */}
<div className="space-y-2">
  <Label className="text-sm text-white/80">Tags (max 5)</Label>

  {/* existing chips list */}
  <div className="flex flex-wrap items-center gap-2">
    {tags.map((tag) => (
      <Badge
        key={tag}
        variant="secondary"
        className="flex items-center gap-1 bg-white/5 text-white"
      >
        {tag}
        <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
      </Badge>
    ))}
  </div>

  {/* existing input + Add button */}
  <div className="flex gap-2">
    <Input
      value={newTag}
      onChange={(e) => setNewTag(e.target.value)}
      placeholder="Add a tag..."
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleAddTag();
        }
      }}
      disabled={!canAddTag}
      className={fieldBase}
    />
    <Button
      type="button"
      onClick={handleAddTag}
      disabled={!canAddTag || !newTag.trim()}
      className="rounded-lg px-3"
    >
      <Plus className="h-4 w-4" />
    </Button>
  </div>

  {/* Suggested Tags (click to add) — INSERT THIS HERE */}
  <div className="mt-2">
    <div className="text-sm text-white/70 mb-2">Suggested Tags</div>
    <div className="flex flex-wrap gap-2">
      {["Design","UI/UX","Graphic","UI Design","UX"].map((t) => {
        const disabled = !canAddTag || tags.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => {
              if (!disabled) setTags((p) => [...p, t]);
            }}
            className="rounded-full px-3 py-1 text-sm border border-white/15 text-white hover:bg-white/5 disabled:opacity-50"
            disabled={disabled}
          >
            {t}
          </button>
        );
      })}
    </div>
  </div>
</div>

     
          {/* Attachments (MAIN: 1 image/video) */}
          <div className="space-y-2">
            <Label className="text-sm text-white/80">Attachment (Required)</Label>
            <div
              onClick={() => attachRef.current?.click()}
              className="cursor-pointer rounded-lg border border-dashed border-white/15 bg-transparent p-8 text-center hover:bg-white/[0.03] transition"
            >
              <Upload className="mx-auto mb-3 h-5 w-5 text-white/60" />
              <p className="text-sm text-white/70">Click to upload</p>
              <input
                ref={attachRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-white/50">
              Upload exactly one image or video (max 50MB).
            </p>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-[#131419] p-3"
                  >
                    <div className="flex items-center gap-3">
                      {file.type.startsWith("image/") ? (
                        <Image className="h-5 w-5 text-blue-400" />
                      ) : (
                        <Video className="h-5 w-5 text-fuchsia-400" />
                      )}
                      <div>
                        <p className="max-w-48 truncate text-sm font-medium">
                          {file.name}
                        </p>
                        <p className="text-xs text-white/60">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FileX className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload New Code (simulated progress; included in POST if selected) */}
           {/* Upload New Code (only for Coding category) */}
{isCodingCategory && (
  <div className="space-y-3">
    <h3 className="text-base font-semibold">Upload Code</h3>
    <p className="text-sm text-white/70">
      Add a new version of your code to the portal. (Optional)
    </p>

    <div
      onClick={() => codeRef.current?.click()}
      className="cursor-pointer rounded-lg border border-dashed border-white/15 bg-transparent p-8 text-center hover:bg-white/[0.03] transition"
    >
      <Upload className="mx-auto mb-3 h-5 w-5 text-white/60" />
      <p className="text-sm text-white/70">
        Drag &amp; drop or click to select file
      </p>
      <input
        ref={codeRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          setCodeFile(file);
          setProgress(0);
          setSuccess(false);
          setUploading(false);
          if (uploadTimerRef.current) {
            window.clearInterval(uploadTimerRef.current);
            uploadTimerRef.current = null;
          }
        }}
      />
    </div>

    {codeFile && <p className="text-xs text-white/70">{codeFile.name}</p>}

    <div className="flex flex-col gap-3">
      <Button
        className="w-full rounded-xl px-4 py-3 text-sm font-medium text-white shadow-md"
        style={{ backgroundImage: GRAD }}
        type="button"
        disabled={!codeFile || uploading}
        onClick={() => {
          if (!codeFile || uploading) return;
          setSuccess(false);
          setProgress(0);
          setUploading(true);
          if (uploadTimerRef.current) {
            window.clearInterval(uploadTimerRef.current);
            uploadTimerRef.current = null;
          }
          uploadTimerRef.current = window.setInterval(() => {
            setProgress((p) => {
              const next = Math.min(p + 10, 100);
              if (next === 100) {
                if (uploadTimerRef.current) {
                  window.clearInterval(uploadTimerRef.current);
                  uploadTimerRef.current = null;
                }
                setUploading(false);
                setSuccess(true);
              }
              return next;
            });
          }, 200);
        }}
      >
        {uploading ? "Uploading…" : "Upload Code"}
      </Button>

      {/* progress */}
      <div className="w-full">
        <div className="h-1.5 w-full rounded-full bg-white/10">
          <div
            className="h-1.5 rounded-full"
            style={{ width: `${progress}%`, backgroundImage: GRAD }}
          />
        </div>
        <div className="mt-1 text-right text-xs text-white/70">
          {progress}%
        </div>
      </div>

      {/* success banner — ONLY when 100% */}
      {success && progress === 100 && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-emerald-300">
          <Check className="h-4 w-4" />
          <span className="text-sm">Upload successful!</span>
        </div>
      )}
    </div>
  </div>
)}


          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white/90 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-md"
              style={{ backgroundImage: GRAD }}
            >
              {isFree ? "Upload Free Prompt" : "List Prompt for Sale"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
