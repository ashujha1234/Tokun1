// // import React, { useMemo } from "react";
// // import { Dialog, DialogContent } from "@/components/ui/dialog";
// // import { Download, Image as ImageIcon, Video, Check } from "lucide-react";

// // export interface MarketplacePrompt {
// //   id: number;
// //   title: string;
// //   description: string;
// //   price: number;
// //   rating: number;
// //   downloads: number;
// //   category: string;
// //   videoUrl?: string;
// //   imageUrl?: string;
// //   fullPrompt?: string;
// // }

// // interface DetailsPromptProps {
// //   open: boolean;
// //   onOpenChange: (open: boolean) => void;
// //   prompt: MarketplacePrompt | null;
// //   owned?: boolean;
// //   onPurchase?: (prompt: MarketplacePrompt) => void;
// //   showImages?: boolean;
// // }

// // export default function DetailsPrompt({
// //   open,
// //   onOpenChange,
// //   prompt,
// //   owned = false,
// //   onPurchase,
// //   showImages = false,
// // }: DetailsPromptProps) {
// //   const media = useMemo(() => {
// //     if (!prompt) return null;
// //     return showImages
// //       ? { type: "image" as const, url: prompt.imageUrl || "" }
// //       : { type: "video" as const, url: prompt.videoUrl || "" };
// //   }, [prompt, showImages]);

// //   if (!prompt) return null;

// //   return (
// //     <Dialog open={open} onOpenChange={onOpenChange}>
// //       <DialogContent
// //         className="
// //           bg-[#17171A] text-white p-0 border-none
// //           w-[min(96vw,1400px)]      /* wider dialog */
// //           max-h-[95vh]              /* taller dialog */
// //           rounded-3xl md:rounded-[40px]
// //           overflow-hidden flex flex-col
// //           [&>button.absolute.right-4.top-4]:hidden
// //           [&>button:has(svg[class*='lucide-x'])]:hidden
// //         "
// //       >
// //         {/* MEDIA */}
// //         <div
// //           className="
// //             relative mx-auto
// //             w-[calc(100%-3rem)] max-w-[1100px]  /* larger media width */
// //             aspect-[3/2]
// //             bg-[#333335]
// //             overflow-hidden
// //             rounded-[18px] md:rounded-[22px]
// //             mt-5
// //             shrink-0
// //           "
// //         >
// //           <div className="absolute top-4 left-4 z-10">
// //             <span className="px-3 py-1 text-[12px] font-semibold rounded-full text-black bg-white">
// //               {prompt.category.toUpperCase()}
// //             </span>
// //           </div>

// //           {!owned && (
// //             <div className="absolute top-4 right-4 z-10">
// //               <span className="px-3 py-1 text-[12px] font-semibold rounded-full text-black bg-white">
// //                 PURCHASE TO UNLOCK
// //               </span>
// //             </div>
// //           )}

// //           <div className="absolute inset-0">
// //             {media?.type === "image" ? (
// //               <img
// //                 src={media.url}
// //                 alt={prompt.title}
// //                 className="w-full h-full object-cover"
// //               />
// //             ) : (
// //               <video
// //                 src={media?.url}
// //                 className="w-full h-full object-cover"
// //                 loop
// //                 muted
// //                 autoPlay
// //                 playsInline
// //               />
// //             )}
// //           </div>

// //           {/* Type hint */}
// //           <div className="absolute bottom-3 left-4 flex items-center gap-2 text-sm text-white/80">
// //             {media?.type === "image" ? (
// //               <ImageIcon className="h-5 w-5" />
// //             ) : (
// //               <Video className="h-5 w-5" />
// //             )}
// //             <span className="uppercase tracking-wide">{media?.type}</span>
// //           </div>
// //         </div>

// //         {/* DETAILS */}
// //         <div
// //           className="
// //             px-8 md:px-10
// //             pt-5 md:pt-6
// //             pb-7 md:pb-9
// //             min-h-0 flex-1 overflow-y-auto no-scrollbar
// //           "
// //         >
// //           {/* Title row (COP icon fixed at right) */}
// //           <div className="grid grid-cols-[1fr_auto] items-start gap-4 mt-2">
// //             <h2 className="font-semibold text-[24px] leading-snug tracking-tight [font-family:Inter,ui-sans-serif,system-ui]">
// //               {prompt.title}
// //             </h2>
// //             <span
// //               className="flex items-center justify-center rounded-full justify-self-end"
// //               style={{ backgroundColor: "#333335", width: 40, height: 40 }}
// //               aria-hidden
// //             >
// //               <img src="/icons/cop1.png" alt="" className="w-5 h-5 object-contain" />
// //             </span>
// //           </div>

// //           {/* BANNER PILL */}
// //           <div
// //             className="
// //               mt-4
// //               bg-[#33333]
// //               border border-white/10
// //               rounded-[12px]
// //               px-4 md:px-5 py-3
// //               flex items-center justify-between gap-4
// //             "
// //           >
// //             {/* Left: logo & copy */}
// //             <div className="flex items-center gap-4 min-w-0">
// //               <img
// //                 src="/icons/dtlogo.svg"
// //                 onError={(e) => {
// //                   const img = e.currentTarget as HTMLImageElement;
// //                   if (!(img as any).dataset.fallback) {
// //                     (img as any).dataset.fallback = "1";
// //                     img.src = "/icons/dtlogo.png";
// //                   }
// //                 }}
// //                 alt="DT Logo"
// //                 className="shrink-0 object-contain"
// //                 style={{ height: 32, width: "auto" }}
// //               />
// //               <div className="min-w-0">
// //                 <div className="truncate text-[18px] leading-snug [font-family:Inter,ui-sans-serif,system-ui]">
// //                   Power Your Storefronts with Auto-Generated Descriptions
// //                 </div>
// //                 <div className="text-white/70 truncate text-[13px] mt-2 leading-snug [font-family:Inter,ui-sans-serif,system-ui]">
// //                   Generate compelling product descriptions that convert visitors into customers
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Right: rating number ABOVE stars */}
// //             <div className="flex flex-col items-center gap-1 shrink-0">
// //               <span className="text-[13px] font-semibold leading-none">
// //                 {prompt.rating.toFixed(2)}
// //               </span>
// //               <div className="flex items-center gap-[4px] leading-none">
// //                 {[...Array(5)].map((_, i) => (
// //                   <svg key={i} width="16" height="16" viewBox="0 0 24 24" aria-hidden>
// //                     <path
// //                       d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
// //                       fill="#FFFFFF"
// //                     />
// //                   </svg>
// //                 ))}
// //               </div>
// //             </div>
// //           </div>

// //           {/* Description */}
// //           <p className="mt-4 text-white/80 text-[16px] leading-relaxed [font-family:Inter,ui-sans-serif,system-ui]">
// //             {prompt.description}
// //           </p>

// //           {/* Separator */}
// //           <div className="border-t border-white/10 mt-6 mb-5" />

// //           {/* PURCHASE + STATS (right-aligned cluster) */}
// //           <div className="flex items-center justify-end gap-4">
// //             {/* Purchase Button */}
          

// //             {/* Stats (compact chips). NOTE: rating chip removed as requested */}
// //            <div className="flex items-center gap-3">
// //   <div className="flex items-center gap-2 bg-[#333335] rounded-full px-4 py-2">
// //     <Download className="h-5 w-5" />
// //     <span className="text-base leading-none">{prompt.downloads}</span>
// //   </div>
// //   <div className="flex items-center gap-2 bg-[#333335] rounded-full px-4 py-2">
// //     <span className="text-base leading-none">${prompt.price.toFixed(2)}</span>
// //   </div>
// // </div>


// //              {owned ? (
// //   <button className="px-8 h-12 rounded-full bg-white/10 border border-white/15 text-white text-base font-medium leading-none">
// //     <Check className="inline-block h-5 w-5 mr-2 -mt-[2px]" />
// //     Owned — Use Now
// //   </button>
// // ) : (
// //   <button
// //     className="
// //       px-8 h-12 rounded-full text-white text-base font-medium leading-none
// //       bg-gradient-to-r from-[#5A3FFF] to-[#FF14EF]
// //       transition-all
// //     "
// //     onClick={() => onPurchase?.(prompt)}
// //   >
// //     Purchase
// //   </button>
// // )}

// //           </div>
// //         </div>
// //       </DialogContent>
// //     </Dialog>
// //   );
// // }


// import React, { useMemo , useState} from "react";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import {
//   Image as ImageIcon,
//   Video,
//   Check,
//   ShoppingCart,
//   CheckCircle2,
// } from "lucide-react";
// import { RiShareForwardLine } from "react-icons/ri";
// import { useAuth } from "@/contexts/AuthContext";
// import RequestToBuyModal from "@/components/RequestToBuyModel";

// export interface MarketplacePrompt {
//   id: number | string;
//   title: string;
//   description: string;
//   price: number;
//   rating: number;
//   downloads: number;
//   category: string;
//   videoUrl?: string;
//   imageUrl?: string;
//   fullPrompt?: string;
// }

// interface DetailsPromptProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   prompt: MarketplacePrompt | null;
//   owned?: boolean;
//   onPurchase?: (prompt: MarketplacePrompt) => void;
//   showImages?: boolean;
// }

// export default function DetailsPrompt({
//   open,
//   onOpenChange,
//   prompt,
//   owned = false,
//   onPurchase,
//   showImages = false,
// }: DetailsPromptProps) {
//   const { user } = useAuth();

//   const isOrg = user?.userType === "ORG";
//   const isOwner = user?.role === "Owner" || user?.role === "Admin";
//   const isTeamMember = isOrg && !isOwner;
//    // ✅ Move hook here
//   const [showRequestModal, setShowRequestModal] = useState(false);
//   const media = useMemo(() => {
//     if (!prompt) return null;
//     const hasVideo = !!prompt.videoUrl?.trim();
//     const hasImage = !!prompt.imageUrl?.trim();

//     if (showImages || !hasVideo) {
//       return { type: "image" as const, url: hasImage ? prompt.imageUrl! : "/icons/fallback.png" };
//     } else {
//       return { type: "video" as const, url: prompt.videoUrl! };
//     }
//   }, [prompt, showImages]);

//   if (!prompt) return null;


//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent
//         className="
//           bg-[#17171A] text-white p-0 border-none
//           w-[min(96vw,1600px)]
//           max-h-[96vh]
//           rounded-3xl md:rounded-[40px]
//           overflow-hidden flex flex-col
//         "
//       >
//         {/* MEDIA */}
//         <div
//           className="
//             relative mx-auto
//             w-[calc(100%-3rem)] max-w-[1300px]
//             aspect-[3/2]
//             bg-[#333335]
//             overflow-hidden
//             rounded-[18px] md:rounded-[22px]
//             mt-8
//             shrink-0
//           "
//         >
//           <div className="absolute top-4 left-4 z-10">
//             <span className="px-3 py-1 text-[12px] font-semibold rounded-full text-black bg-white">
//               {prompt.category.toUpperCase()}
//             </span>
//           </div>

//           {!owned && (
//             <div className="absolute top-4 right-4 z-10">
//               <span className="px-3 py-1 text-[12px] font-semibold rounded-full text-black bg-white">
//                 PURCHASE TO UNLOCK
//               </span>
//             </div>
//           )}

//           <div className="absolute inset-0">
//             {media?.type === "image" ? (
//               <img
//                 src={media.url}
//                 alt={prompt.title}
//                 className="w-full h-full object-cover"
//                 onError={(e) => {
//                   (e.currentTarget as HTMLImageElement).src = "/icons/fallback.png";
//                 }}
//               />
//             ) : (
//               <video
//                 src={media?.url}
//                 className="w-full h-full object-cover"
//                 loop
//                 muted
//                 autoPlay
//                 playsInline
//               />
//             )}
//           </div>

//           <div className="absolute bottom-3 left-4 flex items-center gap-2 text-sm text-white/80">
//             {media?.type === "image" ? <ImageIcon className="h-5 w-5" /> : <Video className="h-5 w-5" />}
//             <span className="uppercase tracking-wide">{media?.type}</span>
//           </div>
//         </div>

//         {/* DETAILS */}
//         <div
//           className="
//             px-12 md:px-14
//             pt-8 md:pt-10
//             pb-10 md:pb-12
//             min-h-0 flex-1 overflow-y-auto no-scrollbar
//           "
//         >
//           {/* Title */}
//           <div className="grid grid-cols-[1fr_auto] items-start gap-4 mt-2">
//             <h2 className="font-semibold text-[24px] leading-snug tracking-tight">
//               {prompt.title}
//             </h2>
//             <span
//               className="flex items-center justify-center rounded-full justify-self-end"
//               style={{ backgroundColor: "#333335", width: 42, height: 42 }}
//               aria-hidden
//             >
//               <img src="/icons/cop1.png" alt="" className="w-5 h-5 object-contain" />
//             </span>
//           </div>

//           {/* Banner */}
//           <div
//             className="
//               mt-5
//               bg-[#333335]
//               border border-white/10
//               rounded-[12px]
//               px-5 md:px-6 py-4
//               flex items-center justify-between gap-4
//             "
//           >
//             <div className="flex items-center gap-4 min-w-0">
//               <img
//                 src="/icons/dtlogo.svg"
//                 onError={(e) => {
//                   const img = e.currentTarget as HTMLImageElement;
//                   img.src = "/icons/dtlogo.png";
//                 }}
//                 alt="DT Logo"
//                 className="shrink-0 object-contain h-8"
//               />
//               <div className="min-w-0">
//                 <div className="truncate text-[17px] leading-snug font-medium">
//                   Power Your Storefronts with Auto-Generated Descriptions
//                 </div>
//                 <div className="text-white/70 truncate text-[13px] mt-1 leading-snug">
//                   Generate compelling product descriptions that convert visitors into customers
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-col items-center gap-1 shrink-0">
//               <span className="text-[13px] font-semibold leading-none">
//                 {prompt.rating.toFixed(1)}
//               </span>
//               <div className="flex items-center gap-[3px] leading-none">
//                 {[...Array(5)].map((_, i) => (
//                   <svg key={i} width="15" height="15" viewBox="0 0 24 24">
//                     <path
//                       d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
//                       fill="#FFFFFF"
//                     />
//                   </svg>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Description */}
//           <p className="mt-5 text-white/80 text-[15px] leading-relaxed">
//             {prompt.description}
//           </p>

//           {/* Green tick features */}
//           <div className="mt-8 space-y-3">
//             {["Lifetime access", "Instant download", "Pay once, use forever"].map((f) => (
//               <div key={f} className="flex items-center gap-3 text-[14px]">
//                 <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
//                   <CheckCircle2 className="w-4 h-4 text-white" />
//                 </div>
//                 <span>{f}</span>
//               </div>
//             ))}
//           </div>

//           {/* Horizontal line */}
//           <div className="border-t border-white/10 mt-6 mb-6"></div>

//           {/* Price + Buttons Row */}
//           <div className="flex items-center justify-between flex-wrap gap-4">
//             <div className="text-[20px] font-semibold text-white">
//               ₹{prompt.price.toLocaleString()}
//             </div>

//             <div className="flex items-center gap-4">
//               {/* Share */}
//           <button
//   className="flex items-center justify-center gap-2 text-white text-[14px] hover:text-[#FF14EF] transition-all"
//   onClick={() => setShowRequestModal(true)}
// >
//   <RiShareForwardLine className="w-5 h-5" />
//   Share
// </button>


//               {/* Cart */}
//               <button
//                 disabled={isTeamMember}
//                 className={`flex items-center justify-center gap-2 px-6 h-11 rounded-[8px] border border-white/10 text-white text-[14px] transition-all ${
//                   isTeamMember
//                     ? "opacity-50 cursor-not-allowed bg-[#1C1C1E]"
//                     : "bg-[#1C1C1E] hover:bg-gradient-to-r hover:from-[#5A3FFF] hover:to-[#FF14EF]"
//                 }`}
//               >
//                 <ShoppingCart className="w-5 h-5" />
//                 Cart
//               </button>

//               {/* Buy Now */}
//               <button
//                 disabled={isTeamMember}
//                 onClick={() => !isTeamMember && onPurchase?.(prompt)}
//                 className={`flex items-center justify-center px-8 h-11 rounded-[8px] font-medium text-white text-[14px] transition-all ${
//                   isTeamMember
//                     ? "opacity-50 cursor-not-allowed bg-gradient-to-r from-gray-600 to-gray-500"
//                     : "bg-[#1C1C1E] border border-white/10 hover:bg-gradient-to-r hover:from-[#FF14EF] hover:to-[#1A73E8]"
//                 }`}
//               >
//                 Buy Now
//               </button>
//             </div>
//           </div>
//         </div>
//      <RequestToBuyModal
//   open={open}
//   onOpenChange={setOpen}
//   promptId={prompt._id}
//   promptTitle={prompt.title}
//   price={prompt.price}
//   thumbnail={prompt.thumbnail}
//   userType={user.userType} // "TM" or "ORG"
//   ownerEmail={user.email}  // automatically passed for TM
// />


//       </DialogContent>
//     </Dialog>
//   );
// }


import React, { useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Image as ImageIcon,
  Video,
  CheckCircle2,
  ShoppingCart,
} from "lucide-react";
import { RiShareForwardLine } from "react-icons/ri";
import { useAuth } from "@/contexts/AuthContext";
import RequestToBuyModal from "@/components/RequestToBuyModel";

export interface MarketplacePrompt {
  id: number | string;
  title: string;
  description: string;
  price: number;
  rating: number;
  downloads: number;
  category: string;
  videoUrl?: string;
  imageUrl?: string;
  fullPrompt?: string;

  uploaderId?: string;
  ownerEmail?: string;
  exclusive?: boolean;
  sold?: boolean;
}
interface DetailsPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: MarketplacePrompt | null;
  owned?: boolean;
  onPurchase?: (prompt: MarketplacePrompt) => void;
  showImages?: boolean;
}



interface RequestToBuyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptId: string;
  promptTitle: string;
  price: number;
  ownerEmail?: string;
  thumbnail?: string;
  userType: "ORG" | "TM";
  role?: "Owner" | "Admin" | "TM";
}


export default function DetailsPrompt({
  open,
  onOpenChange,
  prompt,
  owned = false,
  onPurchase,
  showImages = false,
}: DetailsPromptProps) {
  const { user } = useAuth();

  const isOrg = user?.userType === "ORG";
  const isOwner = user?.role === "Owner" || user?.role === "Admin";
  const isTeamMember = isOrg && !isOwner;

   const currentUserId = user?._id || user?.id || null;

const isOwnPrompt =
  !!currentUserId &&
  !!prompt?.uploaderId &&
  String(prompt.uploaderId) === String(currentUserId);




  // ✅ State for Request Modal
  const [showRequestModal, setShowRequestModal] = useState(false);

  // ✅ Media handling (video or image)
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="
            bg-[#17171A] text-white p-0 border-none
            w-[min(96vw,1600px)]
            max-h-[96vh]
            rounded-3xl md:rounded-[40px]
            overflow-hidden flex flex-col
          "
        >
          {/* MEDIA */}
          <div
            className="
              relative mx-auto
              w-[calc(100%-3rem)] max-w-[1300px]
              aspect-[3/2]
              bg-[#333335]
              overflow-hidden
              rounded-[18px] md:rounded-[22px]
              mt-8
              shrink-0
            "
          >
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1 text-[12px] font-semibold rounded-full text-black bg-white">
                {prompt.category.toUpperCase()}
              </span>
            </div>

            {!owned && (
              <div className="absolute top-4 right-4 z-10">
                <span className="px-3 py-1 text-[12px] font-semibold rounded-full text-black bg-white">
                  PURCHASE TO UNLOCK
                </span>
              </div>
            )}

            <div className="absolute inset-0">
              {media?.type === "image" ? (
                <img
                  src={media.url}
                  alt={prompt.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/icons/fallback.png";
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

            <div className="absolute bottom-3 left-4 flex items-center gap-2 text-sm text-white/80">
              {media?.type === "image" ? (
                <ImageIcon className="h-5 w-5" />
              ) : (
                <Video className="h-5 w-5" />
              )}
              <span className="uppercase tracking-wide">{media?.type}</span>
            </div>
          </div>

          {/* DETAILS */}
          <div
            className="
              px-12 md:px-14
              pt-8 md:pt-10
              pb-10 md:pb-12
              min-h-0 flex-1 overflow-y-auto no-scrollbar
            "
          >
            {/* Title */}
            <div className="grid grid-cols-[1fr_auto] items-start gap-4 mt-2">
              <h2 className="font-semibold text-[24px] leading-snug tracking-tight">
                {prompt.title}
              </h2>
              <span
                className="flex items-center justify-center rounded-full justify-self-end"
                style={{ backgroundColor: "#333335", width: 42, height: 42 }}
                aria-hidden
              >
                <img
                  src="/icons/cop1.png"
                  alt=""
                  className="w-5 h-5 object-contain"
                />
              </span>
            </div>

            {/* Banner */}
            <div
              className="
                mt-5
                bg-[#333335]
                border border-white/10
                rounded-[12px]
                px-5 md:px-6 py-4
                flex items-center justify-between gap-4
              "
            >
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src="/icons/dtlogo.svg"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.src = "/icons/dtlogo.png";
                  }}
                  alt="DT Logo"
                  className="shrink-0 object-contain h-8"
                />
                <div className="min-w-0">
                  <div className="truncate text-[17px] leading-snug font-medium">
                    Power Your Storefronts with Auto-Generated Descriptions
                  </div>
                  <div className="text-white/70 truncate text-[13px] mt-1 leading-snug">
                    Generate compelling product descriptions that convert
                    visitors into customers
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 shrink-0">
                <span className="text-[13px] font-semibold leading-none">
                  {prompt.rating.toFixed(1)}
                </span>
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

            {/* Description */}
            <p className="mt-5 text-white/80 text-[15px] leading-relaxed">
              {prompt.description}
            </p>

            {/* Green tick features */}
            <div className="mt-8 space-y-3">
              {[
                "Lifetime access",
                "Instant download",
                "Pay once, use forever",
              ].map((f) => (
                <div key={f} className="flex items-center gap-3 text-[14px]">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span>{f}</span>
                </div>
              ))}
            </div>

            {/* Horizontal line */}
            <div className="border-t border-white/10 mt-6 mb-6"></div>

            {/* Price + Buttons */}
              {/* Price + Buttons */}
            
<div
  className="
    mt-8
    flex flex-col md:flex-row
    md:items-center md:justify-between
    gap-4 md:gap-6
  "
>
  <div className="text-[22px] font-semibold text-white shrink-0">
    ₹{prompt.price.toLocaleString()}
  </div>

  <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch md:items-center gap-3">
    {/* Share */}
    <button
      className="
        w-full sm:w-auto
        h-10 sm:h-11
        px-5 sm:px-6
        rounded-[8px]
        border border-white/10
        bg-[#1C1C1E]
        flex items-center justify-center gap-2
        text-white text-[13px] sm:text-[14px]
        hover:bg-[#2A2A2D]
        transition-all whitespace-nowrap shrink-0
      "
      onClick={() => setShowRequestModal(true)}
    >
      <RiShareForwardLine className="w-5 h-5" />
      Share
    </button>

    {/* Cart */}
    {!isOwnPrompt && (
      <button
        disabled={isTeamMember}
        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-8 h-10 sm:h-11 rounded-[8px] border border-white/10 text-white text-[13px] sm:text-[14px] transition-all whitespace-nowrap shrink-0 ${
          isTeamMember
            ? "opacity-50 cursor-not-allowed bg-[#1C1C1E]"
            : "bg-[#1C1C1E] hover:bg-gradient-to-r hover:from-[#5A3FFF] hover:to-[#FF14EF]"
        }`}
      >
        <ShoppingCart className="w-5 h-5" />
        Cart
      </button>
    )}

    {/* Buy Now */}
    {!isOwnPrompt && !(prompt.exclusive && prompt.sold) && (
      <button
        disabled={isTeamMember}
        onClick={() => !isTeamMember && onPurchase?.(prompt)}
        className={`w-full sm:w-auto flex items-center justify-center px-6 sm:px-10 h-10 sm:h-11 rounded-[8px] font-medium text-white text-[13px] sm:text-[14px] transition-all whitespace-nowrap shrink-0 ${
          isTeamMember
            ? "opacity-50 cursor-not-allowed bg-gradient-to-r from-gray-600 to-gray-500"
            : "bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] hover:opacity-90"
        }`}
      >
        Buy Now
      </button>
    )}

    {/* Own prompt */}
    {isOwnPrompt && (
      <div className="w-full sm:w-auto px-5 h-10 sm:h-11 rounded-[8px] bg-[#2A2A2A] text-white/80 text-[13px] sm:text-[14px] flex items-center justify-center whitespace-nowrap">
        Your Prompt
      </div>
    )}
  </div>
</div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Request Modal Integration */}
      {/* ✅ Request Modal Integration */}
{prompt && (
  <RequestToBuyModal
    open={showRequestModal}
    onOpenChange={setShowRequestModal}
    promptId={prompt?.id?.toString() || ""}
    promptTitle={prompt?.title || ""}
    price={prompt?.price || 0}
    thumbnail={prompt?.imageUrl || ""}
    userType={user?.userType === "TM" ? "TM" : "ORG"} // "TM" for team members, "ORG" for org users
    role={user?.role || ""} // 👈 IMPORTANT: pass this
    ownerEmail={
      user?.userType === "TM"
        ? prompt?.ownerEmail || "" // for team member show org owner's email
        : "" // owner doesn't need this field
    }
  />
)}

    </>
  );
}
