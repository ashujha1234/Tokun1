// // // import React, { useMemo } from "react";
// // // import { Dialog, DialogContent } from "@/components/ui/dialog";
// // // import { Download, Image as ImageIcon, Video, Check } from "lucide-react";

// // // export interface MarketplacePrompt {
// // //   id: number;
// // //   title: string;
// // //   description: string;
// // //   price: number;
// // //   rating: number;
// // //   downloads: number;
// // //   category: string;
// // //   videoUrl?: string;
// // //   imageUrl?: string;
// // //   fullPrompt?: string;
// // // }

// // // interface DetailsPromptProps {
// // //   open: boolean;
// // //   onOpenChange: (open: boolean) => void;
// // //   prompt: MarketplacePrompt | null;
// // //   owned?: boolean;
// // //   onPurchase?: (prompt: MarketplacePrompt) => void;
// // //   showImages?: boolean;
// // // }

// // // export default function DetailsPrompt({
// // //   open,
// // //   onOpenChange,
// // //   prompt,
// // //   owned = false,
// // //   onPurchase,
// // //   showImages = false,
// // // }: DetailsPromptProps) {
// // //   const media = useMemo(() => {
// // //     if (!prompt) return null;
// // //     return showImages
// // //       ? { type: "image" as const, url: prompt.imageUrl || "" }
// // //       : { type: "video" as const, url: prompt.videoUrl || "" };
// // //   }, [prompt, showImages]);

// // //   if (!prompt) return null;

// // //   return (
// // //     <Dialog open={open} onOpenChange={onOpenChange}>
// // //       <DialogContent
// // //         className="
// // //           bg-[#17171A] text-white p-0 border-none
// // //           w-[min(96vw,1400px)]      /* wider dialog */
// // //           max-h-[95vh]              /* taller dialog */
// // //           rounded-3xl md:rounded-[40px]
// // //           overflow-hidden flex flex-col
// // //           [&>button.absolute.right-4.top-4]:hidden
// // //           [&>button:has(svg[class*='lucide-x'])]:hidden
// // //         "
// // //       >
// // //         {/* MEDIA */}
// // //         <div
// // //           className="
// // //             relative mx-auto
// // //             w-[calc(100%-3rem)] max-w-[1100px]  /* larger media width */
// // //             aspect-[3/2]
// // //             bg-[#333335]
// // //             overflow-hidden
// // //             rounded-[18px] md:rounded-[22px]
// // //             mt-5
// // //             shrink-0
// // //           "
// // //         >
// // //           <div className="absolute top-4 left-4 z-10">
// // //             <span className="px-3 py-1 text-[12px] font-semibold rounded-full text-black bg-white">
// // //               {prompt.category.toUpperCase()}
// // //             </span>
// // //           </div>

// // //           {!owned && (
// // //             <div className="absolute top-4 right-4 z-10">
// // //               <span className="px-3 py-1 text-[12px] font-semibold rounded-full text-black bg-white">
// // //                 PURCHASE TO UNLOCK
// // //               </span>
// // //             </div>
// // //           )}

// // //           <div className="absolute inset-0">
// // //             {media?.type === "image" ? (
// // //               <img
// // //                 src={media.url}
// // //                 alt={prompt.title}
// // //                 className="w-full h-full object-cover"
// // //               />
// // //             ) : (
// // //               <video
// // //                 src={media?.url}
// // //                 className="w-full h-full object-cover"
// // //                 loop
// // //                 muted
// // //                 autoPlay
// // //                 playsInline
// // //               />
// // //             )}
// // //           </div>

// // //           {/* Type hint */}
// // //           <div className="absolute bottom-3 left-4 flex items-center gap-2 text-sm text-white/80">
// // //             {media?.type === "image" ? (
// // //               <ImageIcon className="h-5 w-5" />
// // //             ) : (
// // //               <Video className="h-5 w-5" />
// // //             )}
// // //             <span className="uppercase tracking-wide">{media?.type}</span>
// // //           </div>
// // //         </div>

// // //         {/* DETAILS */}
// // //         <div
// // //           className="
// // //             px-8 md:px-10
// // //             pt-5 md:pt-6
// // //             pb-7 md:pb-9
// // //             min-h-0 flex-1 overflow-y-auto no-scrollbar
// // //           "
// // //         >
// // //           {/* Title row (COP icon fixed at right) */}
// // //           <div className="grid grid-cols-[1fr_auto] items-start gap-4 mt-2">
// // //             <h2 className="font-semibold text-[24px] leading-snug tracking-tight [font-family:Inter,ui-sans-serif,system-ui]">
// // //               {prompt.title}
// // //             </h2>
// // //             <span
// // //               className="flex items-center justify-center rounded-full justify-self-end"
// // //               style={{ backgroundColor: "#333335", width: 40, height: 40 }}
// // //               aria-hidden
// // //             >
// // //               <img src="/icons/cop1.png" alt="" className="w-5 h-5 object-contain" />
// // //             </span>
// // //           </div>

// // //           {/* BANNER PILL */}
// // //           <div
// // //             className="
// // //               mt-4
// // //               bg-[#33333]
// // //               border border-white/10
// // //               rounded-[12px]
// // //               px-4 md:px-5 py-3
// // //               flex items-center justify-between gap-4
// // //             "
// // //           >
// // //             {/* Left: logo & copy */}
// // //             <div className="flex items-center gap-4 min-w-0">
// // //               <img
// // //                 src="/icons/dtlogo.svg"
// // //                 onError={(e) => {
// // //                   const img = e.currentTarget as HTMLImageElement;
// // //                   if (!(img as any).dataset.fallback) {
// // //                     (img as any).dataset.fallback = "1";
// // //                     img.src = "/icons/dtlogo.png";
// // //                   }
// // //                 }}
// // //                 alt="DT Logo"
// // //                 className="shrink-0 object-contain"
// // //                 style={{ height: 32, width: "auto" }}
// // //               />
// // //               <div className="min-w-0">
// // //                 <div className="truncate text-[18px] leading-snug [font-family:Inter,ui-sans-serif,system-ui]">
// // //                   Power Your Storefronts with Auto-Generated Descriptions
// // //                 </div>
// // //                 <div className="text-white/70 truncate text-[13px] mt-2 leading-snug [font-family:Inter,ui-sans-serif,system-ui]">
// // //                   Generate compelling product descriptions that convert visitors into customers
// // //                 </div>
// // //               </div>
// // //             </div>

// // //             {/* Right: rating number ABOVE stars */}
// // //             <div className="flex flex-col items-center gap-1 shrink-0">
// // //               <span className="text-[13px] font-semibold leading-none">
// // //                 {prompt.rating.toFixed(2)}
// // //               </span>
// // //               <div className="flex items-center gap-[4px] leading-none">
// // //                 {[...Array(5)].map((_, i) => (
// // //                   <svg key={i} width="16" height="16" viewBox="0 0 24 24" aria-hidden>
// // //                     <path
// // //                       d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
// // //                       fill="#FFFFFF"
// // //                     />
// // //                   </svg>
// // //                 ))}
// // //               </div>
// // //             </div>
// // //           </div>

// // //           {/* Description */}
// // //           <p className="mt-4 text-white/80 text-[16px] leading-relaxed [font-family:Inter,ui-sans-serif,system-ui]">
// // //             {prompt.description}
// // //           </p>

// // //           {/* Separator */}
// // //           <div className="border-t border-white/10 mt-6 mb-5" />

// // //           {/* PURCHASE + STATS (right-aligned cluster) */}
// // //           <div className="flex items-center justify-end gap-4">
// // //             {/* Purchase Button */}
          

// // //             {/* Stats (compact chips). NOTE: rating chip removed as requested */}
// // //            <div className="flex items-center gap-3">
// // //   <div className="flex items-center gap-2 bg-[#333335] rounded-full px-4 py-2">
// // //     <Download className="h-5 w-5" />
// // //     <span className="text-base leading-none">{prompt.downloads}</span>
// // //   </div>
// // //   <div className="flex items-center gap-2 bg-[#333335] rounded-full px-4 py-2">
// // //     <span className="text-base leading-none">${prompt.price.toFixed(2)}</span>
// // //   </div>
// // // </div>


// // //              {owned ? (
// // //   <button className="px-8 h-12 rounded-full bg-white/10 border border-white/15 text-white text-base font-medium leading-none">
// // //     <Check className="inline-block h-5 w-5 mr-2 -mt-[2px]" />
// // //     Owned — Use Now
// // //   </button>
// // // ) : (
// // //   <button
// // //     className="
// // //       px-8 h-12 rounded-full text-white text-base font-medium leading-none
// // //       bg-gradient-to-r from-[#5A3FFF] to-[#FF14EF]
// // //       transition-all
// // //     "
// // //     onClick={() => onPurchase?.(prompt)}
// // //   >
// // //     Purchase
// // //   </button>
// // // )}

// // //           </div>
// // //         </div>
// // //       </DialogContent>
// // //     </Dialog>
// // //   );
// // // }


// // import React, { useMemo , useState} from "react";
// // import { Dialog, DialogContent } from "@/components/ui/dialog";
// // import {
// //   Image as ImageIcon,
// //   Video,
// //   Check,
// //   ShoppingCart,
// //   CheckCircle2,
// // } from "lucide-react";
// // import { RiShareForwardLine } from "react-icons/ri";
// // import { useAuth } from "@/contexts/AuthContext";
// // import RequestToBuyModal from "@/components/RequestToBuyModel";

// // export interface MarketplacePrompt {
// //   id: number | string;
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
// //   const { user } = useAuth();

// //   const isOrg = user?.userType === "ORG";
// //   const isOwner = user?.role === "Owner" || user?.role === "Admin";
// //   const isTeamMember = isOrg && !isOwner;
// //    // ✅ Move hook here
// //   const [showRequestModal, setShowRequestModal] = useState(false);
// //   const media = useMemo(() => {
// //     if (!prompt) return null;
// //     const hasVideo = !!prompt.videoUrl?.trim();
// //     const hasImage = !!prompt.imageUrl?.trim();

// //     if (showImages || !hasVideo) {
// //       return { type: "image" as const, url: hasImage ? prompt.imageUrl! : "/icons/fallback.png" };
// //     } else {
// //       return { type: "video" as const, url: prompt.videoUrl! };
// //     }
// //   }, [prompt, showImages]);

// //   if (!prompt) return null;


// //   return (
// //     <Dialog open={open} onOpenChange={onOpenChange}>
// //       <DialogContent
// //         className="
// //           bg-[#17171A] text-white p-0 border-none
// //           w-[min(96vw,1600px)]
// //           max-h-[96vh]
// //           rounded-3xl md:rounded-[40px]
// //           overflow-hidden flex flex-col
// //         "
// //       >
// //         {/* MEDIA */}
// //         <div
// //           className="
// //             relative mx-auto
// //             w-[calc(100%-3rem)] max-w-[1300px]
// //             aspect-[3/2]
// //             bg-[#333335]
// //             overflow-hidden
// //             rounded-[18px] md:rounded-[22px]
// //             mt-8
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
// //                 onError={(e) => {
// //                   (e.currentTarget as HTMLImageElement).src = "/icons/fallback.png";
// //                 }}
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

// //           <div className="absolute bottom-3 left-4 flex items-center gap-2 text-sm text-white/80">
// //             {media?.type === "image" ? <ImageIcon className="h-5 w-5" /> : <Video className="h-5 w-5" />}
// //             <span className="uppercase tracking-wide">{media?.type}</span>
// //           </div>
// //         </div>

// //         {/* DETAILS */}
// //         <div
// //           className="
// //             px-12 md:px-14
// //             pt-8 md:pt-10
// //             pb-10 md:pb-12
// //             min-h-0 flex-1 overflow-y-auto no-scrollbar
// //           "
// //         >
// //           {/* Title */}
// //           <div className="grid grid-cols-[1fr_auto] items-start gap-4 mt-2">
// //             <h2 className="font-semibold text-[24px] leading-snug tracking-tight">
// //               {prompt.title}
// //             </h2>
// //             <span
// //               className="flex items-center justify-center rounded-full justify-self-end"
// //               style={{ backgroundColor: "#333335", width: 42, height: 42 }}
// //               aria-hidden
// //             >
// //               <img src="/icons/cop1.png" alt="" className="w-5 h-5 object-contain" />
// //             </span>
// //           </div>

// //           {/* Banner */}
// //           <div
// //             className="
// //               mt-5
// //               bg-[#333335]
// //               border border-white/10
// //               rounded-[12px]
// //               px-5 md:px-6 py-4
// //               flex items-center justify-between gap-4
// //             "
// //           >
// //             <div className="flex items-center gap-4 min-w-0">
// //               <img
// //                 src="/icons/dtlogo.svg"
// //                 onError={(e) => {
// //                   const img = e.currentTarget as HTMLImageElement;
// //                   img.src = "/icons/dtlogo.png";
// //                 }}
// //                 alt="DT Logo"
// //                 className="shrink-0 object-contain h-8"
// //               />
// //               <div className="min-w-0">
// //                 <div className="truncate text-[17px] leading-snug font-medium">
// //                   Power Your Storefronts with Auto-Generated Descriptions
// //                 </div>
// //                 <div className="text-white/70 truncate text-[13px] mt-1 leading-snug">
// //                   Generate compelling product descriptions that convert visitors into customers
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="flex flex-col items-center gap-1 shrink-0">
// //               <span className="text-[13px] font-semibold leading-none">
// //                 {prompt.rating.toFixed(1)}
// //               </span>
// //               <div className="flex items-center gap-[3px] leading-none">
// //                 {[...Array(5)].map((_, i) => (
// //                   <svg key={i} width="15" height="15" viewBox="0 0 24 24">
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
// //           <p className="mt-5 text-white/80 text-[15px] leading-relaxed">
// //             {prompt.description}
// //           </p>

// //           {/* Green tick features */}
// //           <div className="mt-8 space-y-3">
// //             {["Lifetime access", "Instant download", "Pay once, use forever"].map((f) => (
// //               <div key={f} className="flex items-center gap-3 text-[14px]">
// //                 <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
// //                   <CheckCircle2 className="w-4 h-4 text-white" />
// //                 </div>
// //                 <span>{f}</span>
// //               </div>
// //             ))}
// //           </div>

// //           {/* Horizontal line */}
// //           <div className="border-t border-white/10 mt-6 mb-6"></div>

// //           {/* Price + Buttons Row */}
// //           <div className="flex items-center justify-between flex-wrap gap-4">
// //             <div className="text-[20px] font-semibold text-white">
// //               ₹{prompt.price.toLocaleString()}
// //             </div>

// //             <div className="flex items-center gap-4">
// //               {/* Share */}
// //           <button
// //   className="flex items-center justify-center gap-2 text-white text-[14px] hover:text-[#FF14EF] transition-all"
// //   onClick={() => setShowRequestModal(true)}
// // >
// //   <RiShareForwardLine className="w-5 h-5" />
// //   Share
// // </button>


// //               {/* Cart */}
// //               <button
// //                 disabled={isTeamMember}
// //                 className={`flex items-center justify-center gap-2 px-6 h-11 rounded-[8px] border border-white/10 text-white text-[14px] transition-all ${
// //                   isTeamMember
// //                     ? "opacity-50 cursor-not-allowed bg-[#1C1C1E]"
// //                     : "bg-[#1C1C1E] hover:bg-gradient-to-r hover:from-[#5A3FFF] hover:to-[#FF14EF]"
// //                 }`}
// //               >
// //                 <ShoppingCart className="w-5 h-5" />
// //                 Cart
// //               </button>

// //               {/* Buy Now */}
// //               <button
// //                 disabled={isTeamMember}
// //                 onClick={() => !isTeamMember && onPurchase?.(prompt)}
// //                 className={`flex items-center justify-center px-8 h-11 rounded-[8px] font-medium text-white text-[14px] transition-all ${
// //                   isTeamMember
// //                     ? "opacity-50 cursor-not-allowed bg-gradient-to-r from-gray-600 to-gray-500"
// //                     : "bg-[#1C1C1E] border border-white/10 hover:bg-gradient-to-r hover:from-[#FF14EF] hover:to-[#1A73E8]"
// //                 }`}
// //               >
// //                 Buy Now
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //      <RequestToBuyModal
// //   open={open}
// //   onOpenChange={setOpen}
// //   promptId={prompt._id}
// //   promptTitle={prompt.title}
// //   price={prompt.price}
// //   thumbnail={prompt.thumbnail}
// //   userType={user.userType} // "TM" or "ORG"
// //   ownerEmail={user.email}  // automatically passed for TM
// // />


// //       </DialogContent>
// //     </Dialog>
// //   );
// // }






// import React, { useMemo, useState } from "react";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import {
//   Image as ImageIcon,
//   Video,
//   CheckCircle2,
//   ShoppingCart,
// } from "lucide-react";
// import { RiShareForwardLine } from "react-icons/ri";
// import { useAuth } from "@/contexts/AuthContext";
// import RequestToBuyModal from "@/components/RequestToBuyModel";
// import { toast } from "@/components/ui/use-toast";
// import { useCart } from "@/contexts/CartContext";
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

//   uploaderId?: string;
//   ownerEmail?: string;
//   exclusive?: boolean;
//   sold?: boolean;
// }
// interface DetailsPromptProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   prompt: MarketplacePrompt | null;
//   owned?: boolean;
//   onPurchase?: (prompt: MarketplacePrompt) => void;
//   showImages?: boolean;
// }



// interface RequestToBuyModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   promptId: string;
//   promptTitle: string;
//   price: number;
//   ownerEmail?: string;
//   thumbnail?: string;
//   userType: "ORG" | "TM";
//   role?: "Owner" | "Admin" | "TM";
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
//   const { addToCart } = useCart();

//   const isOrg = user?.userType === "ORG";
//   const isOwner = user?.role === "Owner" || user?.role === "Admin";
//   const isTeamMember = isOrg && !isOwner;

//    const currentUserId = user?._id || user?.id || null;

// const isOwnPrompt =
//   !!currentUserId &&
//   !!prompt?.uploaderId &&
//   String(prompt.uploaderId) === String(currentUserId);




//   // ✅ State for Request Modal
//   const [showRequestModal, setShowRequestModal] = useState(false);

//   // ✅ Media handling (video or image)
//   const media = useMemo(() => {
//     if (!prompt) return null;
//     const hasVideo = !!prompt.videoUrl?.trim();
//     const hasImage = !!prompt.imageUrl?.trim();

//     if (showImages || !hasVideo) {
//       return {
//         type: "image" as const,
//         url: hasImage ? prompt.imageUrl! : "/icons/fallback.png",
//       };
//     } else {
//       return { type: "video" as const, url: prompt.videoUrl! };
//     }
//   }, [prompt, showImages]);

//   if (!prompt) return null;





//   const handleCopy = async () => {
//   try {
//     await navigator.clipboard.writeText(prompt?.fullPrompt || "");
//     toast({
//       title: "Copied",
//       description: "Prompt copied to clipboard.",
//     });
//   } catch {
//     toast({
//       title: "Copy failed",
//       description: "Unable to copy prompt.",
//       //     });
//   }
// };

//   return (
//     <>
//       <Dialog open={open} onOpenChange={onOpenChange}>
//         <DialogContent
//           className="
//             bg-[#17171A] text-white p-0 border-none
//             w-[min(96vw,1600px)]
//             max-h-[96vh]
//             rounded-3xl md:rounded-[40px]
//             overflow-hidden flex flex-col
//           "
//         >
//           {/* MEDIA */}
//           <div
//             className="
//               relative mx-auto
//               w-[calc(100%-3rem)] max-w-[1300px]
//               aspect-[3/2]
//               bg-[#333335]
//               overflow-hidden
//               rounded-[18px] md:rounded-[22px]
//               mt-8
//               shrink-0
//             "
//           >
//             <div className="absolute top-4 left-4 z-10">
//               <span className="px-3 py-1 text-[12px] font-semibold rounded-full text-black bg-white">
//                 {prompt.category.toUpperCase()}
//               </span>
//             </div>

//          <div className="absolute top-4 right-4 z-10">
//   <span
//     className="px-3 py-1 text-[12px] font-semibold rounded-full"
//     style={{
//       background: owned ? "#14532D" : "#FFFFFF",
//       color: owned ? "#BBF7D0" : "#000000",
//     }}
//   >
//     {owned ? "PURCHASED" : "PURCHASE TO UNLOCK"}
//   </span>
// </div>

//             <div className="absolute inset-0">
//               {media?.type === "image" ? (
//                 <img
//                   src={media.url}
//                   alt={prompt.title}
//                   className="w-full h-full object-cover"
//                   onError={(e) => {
//                     (e.currentTarget as HTMLImageElement).src = "/icons/fallback.png";
//                   }}
//                 />
//               ) : (
//                 <video
//                   src={media?.url}
//                   className="w-full h-full object-cover"
//                   loop
//                   muted
//                   autoPlay
//                   playsInline
//                 />
//               )}

//               {/* Watermark overlay — visible only when not purchased */}
//               {!owned && (
//                 <div
//                   style={{
//                     position: "absolute",
//                     inset: 0,
//                     pointerEvents: "none",
//                     overflow: "hidden",
//                     zIndex: 20,
//                     isolation: "isolate",
//                   }}
//                 >
//                   {Array.from({ length: 20 }).map((_, i) => (
//                     <span
//                       key={i}
//                       style={{
//                         position: "absolute",
//                         left: `${(i % 4) * 28 - 5}%`,
//                         top: `${Math.floor(i / 4) * 22 + 5}%`,
//                         transform: "rotate(-30deg)",
//                         fontSize: 13,
//                         fontWeight: 700,
//                         letterSpacing: "0.06em",
//                         color: "rgba(255,255,255,0.22)",
//                         whiteSpace: "nowrap",
//                         userSelect: "none",
//                         fontFamily: "Arial, sans-serif",
//                       }}
//                     >
//                       Tokun.world
//                     </span>
//                   ))}
//                   <span
//                     style={{
//                       position: "absolute",
//                       bottom: 10,
//                       right: 14,
//                       fontSize: 11,
//                       fontWeight: 800,
//                       letterSpacing: "0.08em",
//                       color: "rgba(255,255,255,0.65)",
//                       background: "rgba(0,0,0,0.4)",
//                       padding: "3px 8px",
//                       borderRadius: 6,
//                       userSelect: "none",
//                       fontFamily: "Arial, sans-serif",
//                       backdropFilter: "blur(4px)",
//                     }}
//                   >
//                     © Tokun.world
//                   </span>
//                 </div>
//               )}
//             </div>

//             <div className="absolute bottom-3 left-4 flex items-center gap-2 text-sm text-white/80">
//               {media?.type === "image" ? (
//                 <ImageIcon className="h-5 w-5" />
//               ) : (
//                 <Video className="h-5 w-5" />
//               )}
//               <span className="uppercase tracking-wide">{media?.type}</span>
//             </div>
//           </div>

//           {/* DETAILS */}
//           <div
//             className="
//               px-12 md:px-14
//               pt-8 md:pt-10
//               pb-10 md:pb-12
//               min-h-0 flex-1 overflow-y-auto no-scrollbar
//             "
//           >
//             {/* Title */}
//             <div className="grid grid-cols-[1fr_auto] items-start gap-4 mt-2">
//               <h2 className="font-semibold text-[24px] leading-snug tracking-tight">
//                 {prompt.title}
//               </h2>
//               <span
//                 className="flex items-center justify-center rounded-full justify-self-end"
//                 style={{ backgroundColor: "#333335", width: 42, height: 42 }}
//                 aria-hidden
//               >
//                 <img
//                   src="/icons/cop1.png"
//                   alt=""
//                   className="w-5 h-5 object-contain"
//                 />
//               </span>
//             </div>

//             {/* Banner */}
//             <div
//               className="
//                 mt-5
//                 bg-[#333335]
//                 border border-white/10
//                 rounded-[12px]
//                 px-5 md:px-6 py-4
//                 flex items-center justify-between gap-4
//               "
//             >
//               <div className="flex items-center gap-4 min-w-0">
//                 <img
//                   src="/icons/dtlogo.svg"
//                   onError={(e) => {
//                     const img = e.currentTarget as HTMLImageElement;
//                     img.src = "/icons/dtlogo.png";
//                   }}
//                   alt="DT Logo"
//                   className="shrink-0 object-contain h-8"
//                 />
//                 <div className="min-w-0">
//                   <div className="truncate text-[17px] leading-snug font-medium">
//                     Power Your Storefronts with Auto-Generated Descriptions
//                   </div>
//                   <div className="text-white/70 truncate text-[13px] mt-1 leading-snug">
//                     Generate compelling product descriptions that convert
//                     visitors into customers
//                   </div>
//                 </div>
//               </div>

//               <div className="flex flex-col items-center gap-1 shrink-0">
//                 <span className="text-[13px] font-semibold leading-none">
//                   {prompt.rating.toFixed(1)}
//                 </span>
//                 <div className="flex items-center gap-[3px] leading-none">
//                   {[...Array(5)].map((_, i) => (
//                     <svg key={i} width="15" height="15" viewBox="0 0 24 24">
//                       <path
//                         d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
//                         fill="#FFFFFF"
//                       />
//                     </svg>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Description */}
//             <p className="mt-5 text-white/80 text-[15px] leading-relaxed">
//               {prompt.description}
//             </p>

//             {/* Green tick features */}
//             <div className="mt-8 space-y-3">
//               {[
//                 "Lifetime access",
//                 "Instant download",
//                 "Pay once, use forever",
//               ].map((f) => (
//                 <div key={f} className="flex items-center gap-3 text-[14px]">
//                   <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
//                     <CheckCircle2 className="w-4 h-4 text-white" />
//                   </div>
//                   <span>{f}</span>
//                 </div>
//               ))}
//             </div>

//             {/* Horizontal line */}
//             <div className="border-t border-white/10 mt-6 mb-6"></div>

//             {/* Price + Buttons */}
//               {/* Price + Buttons */}
            
//           <div
//   className="
//     mt-8
//     flex flex-col md:flex-row
//     md:items-center md:justify-between
//     gap-4 md:gap-3
//   "
// >
//   <div className="text-[22px] font-semibold text-white shrink-0">
//     ₹{prompt.price.toLocaleString()}
//   </div>

//   <div
//     className="
//       w-full md:w-auto
//       flex flex-col sm:flex-row
//       md:flex-nowrap
//       md:items-center
//       gap-2
//       md:shrink-0
//     "
//   >
//     {/* Share */}
//     <button
//       className="
//         w-full sm:w-auto
//         h-9
//         px-3 md:px-4
//         rounded-[8px]
//         border border-white/10
//         bg-[#1C1C1E]
//         flex items-center justify-center gap-1.5
//         text-white text-[12px] md:text-[13px]
//         hover:bg-[#2A2A2D]
//         transition-all
//         whitespace-nowrap
//         shrink-0
//       "
//       onClick={() => setShowRequestModal(true)}
//     >
//       <RiShareForwardLine className="w-4 h-4" />
//       Share
//     </button>

//     {/* Cart */}
//     {!isOwnPrompt && !owned && Number(prompt.price || 0) > 0 && (
//       <button
//         disabled={isTeamMember}
//         onClick={(e) => {
//           e.stopPropagation();
//           if (isTeamMember) return;

//           addToCart(prompt.id);
//           toast({
//             title: "Added to Cart",
//             description: `"${prompt.title}" was added.`,
//           });
//           onOpenChange(false);
//         }}
//         className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 md:px-4 h-9 rounded-[8px] border border-white/10 text-white text-[12px] md:text-[13px] transition-all whitespace-nowrap shrink-0 ${
//           isTeamMember
//             ? "opacity-50 cursor-not-allowed bg-[#1C1C1E]"
//             : "bg-[#1C1C1E] hover:bg-gradient-to-r hover:from-[#5A3FFF] hover:to-[#FF14EF]"
//         }`}
//       >
//         <ShoppingCart className="w-4 h-4" />
//         Cart
//       </button>
//     )}

//     {/* Buy Now */}
//    {/* Action Button */}
// {!isOwnPrompt && (
//   owned ? (
//     <div className="w-full sm:w-auto px-4 md:px-5 h-9 rounded-[8px] bg-[#14532D] text-[#BBF7D0] text-[12px] md:text-[13px] font-medium flex items-center justify-center whitespace-nowrap shrink-0">
//       Purchased
//     </div>
//   ) : Number(prompt.price || 0) <= 0 ? (
//     <button
//       onClick={handleCopy}
//       className="w-full sm:w-auto flex items-center justify-center px-4 md:px-5 h-9 rounded-[8px] font-medium text-white text-[12px] md:text-[13px] transition-all whitespace-nowrap shrink-0 bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] hover:opacity-90"
//     >
//       Copy
//     </button>
//   ) : !(prompt.exclusive && prompt.sold) ? (
//     <button
//       disabled={isTeamMember}
//       onClick={() => !isTeamMember && onPurchase?.(prompt)}
//       className={`w-full sm:w-auto flex items-center justify-center px-4 md:px-5 h-9 rounded-[8px] font-medium text-white text-[12px] md:text-[13px] transition-all whitespace-nowrap shrink-0 ${
//         isTeamMember
//           ? "opacity-50 cursor-not-allowed bg-gradient-to-r from-gray-600 to-gray-500"
//           : "bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] hover:opacity-90"
//       }`}
//     >
//       Buy Now
//     </button>
//   ) : null
// )}

//     {/* Own prompt */}
//     {isOwnPrompt && (
//       <div className="w-full sm:w-auto px-4 h-9 rounded-[8px] bg-[#2A2A2A] text-white/80 text-[12px] md:text-[13px] flex items-center justify-center whitespace-nowrap shrink-0">
//         Your Prompt
//       </div>
//     )}
//   </div>
// </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* ✅ Request Modal Integration */}
//       {/* ✅ Request Modal Integration */}
// {prompt && (
//   <RequestToBuyModal
//     open={showRequestModal}
//     onOpenChange={setShowRequestModal}
//     promptId={prompt?.id?.toString() || ""}
//     promptTitle={prompt?.title || ""}
//     price={prompt?.price || 0}
//     thumbnail={prompt?.imageUrl || ""}
//     userType={user?.userType === "TM" ? "TM" : "ORG"} // "TM" for team members, "ORG" for org users
//     role={(user?.role || "") as "TM" | "Owner" | "Admin"}
//     ownerEmail={
//       user?.userType === "TM"
//         ? prompt?.ownerEmail || "" // for team member show org owner's email
//         : "" // owner doesn't need this field
//     }
//   />
// )}

//     </>
//   );
// }


import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Image as ImageIcon,
  ImageOff,
  Video,
  CheckCircle2,
  ShoppingCart,
  Link as LinkIcon,
  Info,
  Lock,
  Clock,
} from "lucide-react";
import { RiShareForwardLine } from "react-icons/ri";
import { useAuth } from "@/contexts/AuthContext";
import RequestToBuyModal from "@/components/RequestToBuyModel";
import SharePromptMenu from "@/components/SharePromptMenu";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/CartContext";
import { isTeamMember as isTeamMemberUser, isOrgOwner } from "@/lib/orgRoles";
import ProductReviews from "@/components/ProductReviews";
import { StarRating } from "@/components/StarRating";
import SaveButton from "@/components/SaveButton";
import PromptCodePanel, { type PromptCodeMeta } from "@/components/PromptCodePanel";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const PURCHASE_BASE = `${API_BASE}/api/purchase`;

export interface MarketplacePrompt {
  id: number | string;
  title: string;
  description: string;
  /** The seller's list price — what they earn from, NOT what the buyer pays. */
  price: number;
  /** List price plus Tokun's platform fee — the amount actually charged. */
  tokunPrice?: number;
  rating: number;
  downloads: number;
  category: string;
  videoUrl?: string;
  imageUrl?: string;
  fullPrompt?: string;
  /**
   * The public summary of the listing's attached code (Prompt.codeMeta) — file
   * names, languages and a teaser the server already truncated. Absent on the
   * many listings that are prompt-only, and never the source itself: that lives
   * behind GET /api/prompt/:id/code and is fetched by PromptCodePanel.
   */
  code?: PromptCodeMeta;

  uploaderId?: string;
  ownerEmail?: string;
  exclusive?: boolean;
  sold?: boolean;
  /**
   * Listed, but the seller's payout account is still being verified — the
   * server rejects a purchase for it with `seller_not_verified`. Shown as a
   * "Coming soon" state instead of a Buy button that would fail at checkout.
   */
  sellerVerificationPending?: boolean;
}
interface DetailsPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: MarketplacePrompt | null;
  owned?: boolean;
  onPurchase?: (prompt: MarketplacePrompt) => void;
  showImages?: boolean;
  onEnlargeMedia?: (media: { url: string; type: "image" | "video"; title?: string }) => void;
  /**
   * Drop the save control entirely.
   *
   * For the screens where saving is not a question anyone has: the Saved page
   * (everything on it is already saved, by definition) and My Products (your own
   * upload — saving your own listing to your own collection means nothing). On
   * those, a save icon is an offer to do something that has either already
   * happened or makes no sense, and pressing it was how the duplicate saves got
   * made in the first place.
   */
  hideSave?: boolean;
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
  hideSave = false,
}: DetailsPromptProps) {
  const { user } = useAuth();
  /* Cleared whenever the panel opens on a different product, so a second
     video doesn't inherit the first one's "ready". */
  const [videoReady, setVideoReady] = useState(false);
  useEffect(() => { setVideoReady(false); }, [prompt?.id, open]);

  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(prompt?.id ?? "");

  // A team member's userType is "TM"; "ORG" is the Owner's own type. Deriving
  // this as `isOrg && !isOwner` (as this did) never matched a real TM, so the
  // disabled states below were dead and Buy Now stayed live for them.
  const isTeamMember = isTeamMemberUser(user);
  const isOrgOwnerUser = isOrgOwner(user);

  // What the buyer is charged: list price plus Tokun's platform fee. This panel
  // showed `price`, so the total on Razorpay's sheet was higher than the number
  // the buyer had just agreed to. Shown broken out below for the same reason.
  const listPrice = Number(prompt?.price || 0);
  const chargedPrice = Number(prompt?.tokunPrice || 0) > 0 ? Number(prompt.tokunPrice) : listPrice;
  const platformFee = +(chargedPrice - listPrice).toFixed(2);

  /* Free — as in nothing to pay, so nothing to price.
     `isFree` is the seller's own flag where the caller sends it; a charge of
     zero is the same thing said arithmetically, and this panel already treats
     it that way (Buy Now is gated on `price > 0` further down). Without this
     the panel printed a literal "₹0" and a badge telling the reader to buy. */
  const isFreeListing = !!(prompt as any)?.isFree || chargedPrice <= 0;

   const currentUserId = user?._id || user?.id || null;

  /* ── Save (the circular icon beside the title) ────────────────────────────
     That icon was a decorative <span aria-hidden> with no handler — it looked
     like a save button on every listing and did nothing when pressed. It now
     writes a reference into Saved Collections under the "prompt" section, which
     is what the Saved page reads for its Prompt Marketplace tab.

     Quick save, and pressing it again removes the save, so the filled state
     always means "this listing is in your saved list". */
  const [isSaved, setIsSaved] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);

  const promptRefId = prompt?.id ? String(prompt.id) : "";

  /* Is this one ALREADY saved?

     This used to just `setIsSaved(false)` on every listing — the panel never
     asked. So opening something you had already saved showed an empty icon
     offering to save it again, and pressing it wrote a second copy: that is
     where the duplicates in the Saved page came from, one per extra press.

     Asked of the server instead, so the icon starts in the state that is
     actually true and the button reads "Remove from saved" rather than offering
     a save that has already happened. Reset first, so the previous listing's
     answer can't show while this one's is in flight. */
  useEffect(() => {
    setIsSaved(false);
    if (!promptRefId || !currentUserId) return;

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/saved-collections/ids?section=prompt`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          credentials: "include",
        });
        const data = await res.json().catch(() => ({} as any));
        if (cancelled || !data?.success) return;
        setIsSaved((data.ids || []).map(String).includes(promptRefId));
      } catch {
        // Only decides which way the icon points; it stays on "not saved" and
        // the server's own duplicate guard covers a wrong guess.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [promptRefId, currentUserId]);

  const toggleSavePrompt = async () => {
    if (savingPrompt || !promptRefId) return;

    if (!currentUserId) {
      toast({ title: "Sign in to save", description: "Saved products are kept on your account." });
      return;
    }

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const nextSaved = !isSaved;
    setSavingPrompt(true);
    setIsSaved(nextSaved);

    try {
      const res = nextSaved
        ? await fetch(`${API_BASE}/api/saved-collections`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            credentials: "include",
            body: JSON.stringify({ section: "prompt", refId: promptRefId, name: prompt?.title }),
          })
        : await fetch(`${API_BASE}/api/saved-collections/prompt/${promptRefId}`, {
            method: "DELETE",
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            credentials: "include",
          });

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok || data?.success === false) throw new Error(data?.error || `http_${res.status}`);

      toast({ title: nextSaved ? "Saved" : "Removed from saved" });
    } catch (err) {
      setIsSaved(!nextSaved);
      toast({
        title: nextSaved ? "Couldn't save" : "Couldn't remove",
        description: (err as Error)?.message || "Please try again.",
      });
    } finally {
      setSavingPrompt(false);
    }
  };

const isOwnPrompt =
  !!currentUserId &&
  !!prompt?.uploaderId &&
  String(prompt.uploaderId) === String(currentUserId);

// Listed but not yet purchasable — the seller is still going through Route
// payout onboarding. The feed sends this down with each prompt; the purchase
// route is the real guard and rejects these with `seller_not_verified`.
//
// `sellerVerificationPending` alone isn't the whole answer: older listings
// aren't flagged by the feed, so the marketplace card also asks the purchase
// route per prompt (`hasPayoutSetup`). This panel skipped that second check,
// so a card showing COMING SOON opened a details panel with a live Buy Now —
// and checkout then failed with `seller_not_verified`. Same lookup here.
const [sellerHasPayout, setSellerHasPayout] = useState<boolean | null>(null);

useEffect(() => {
  if (!open || !prompt?.id || prompt?.sellerVerificationPending) {
    setSellerHasPayout(null);
    return;
  }

  let cancelled = false;

  (async () => {
    try {
      const res = await fetch(`${PURCHASE_BASE}/seller-payout-status/${prompt.id}`);
      const data = await res.json().catch(() => ({}));
      if (!cancelled) setSellerHasPayout(Boolean(data?.hasPayoutSetup));
    } catch {
      // Match the marketplace: a transient network/server failure shouldn't
      // block a purchase that would otherwise go through.
      if (!cancelled) setSellerHasPayout(true);
    }
  })();

  return () => {
    cancelled = true;
  };
}, [open, prompt?.id, prompt?.sellerVerificationPending]);

const comingSoon = !!prompt?.sellerVerificationPending || sellerHasPayout === false;

/* A one-time product that has been bought. Not "out of stock" — it can never be
   bought again by anyone, which is the whole point of listing it that way.
   Named once because three different places need to ask, and one of them
   (Add to Cart) was asking nothing at all. */
const soldOut = !!prompt?.exclusive && !!prompt?.sold;




  // ✅ State for Request Modal
  const [showRequestModal, setShowRequestModal] = useState(false);

  // ✅ Media handling (video or image)
  const media = useMemo(() => {
    if (!prompt) return null;
    const hasVideo = !!prompt.videoUrl?.trim();
    const hasImage = !!prompt.imageUrl?.trim();

    if (showImages || !hasVideo) {
      // null rather than "/icons/fallback.png" — that file isn't in public/, so
      // a prompt with no picture pointed <img> at a 404 and the browser filled
      // the panel with its broken-image "?".
      return {
        type: "image" as const,
        url: hasImage ? prompt.imageUrl! : null,
      };
    } else {
      return { type: "video" as const, url: prompt.videoUrl! };
    }
  }, [prompt, showImages]);

  if (!prompt) return null;





  const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(prompt?.fullPrompt || "");
    toast({
      title: "Copied",
      description: "Product copied to clipboard.",
    });
  } catch {
    toast({
      title: "Copy failed",
      description: "Unable to copy product.",
    });
  }
};

  // A link anyone can open — it lands on the marketplace with this prompt's
  // details already open. Only the listing travels, never promptText: the link
  // is an invitation to look at the prompt, not a way around paying for it.
  const shareUrl = `${window.location.origin}/prompt-marketplace?prompt=${encodeURIComponent(
    String(prompt?.id ?? "")
  )}`;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* The marketplace pins its header in a `position: fixed; z-index: 999`
            slot. At the default z-50 this modal rendered underneath it, and on
            a phone — where the sheet is 85vh tall instead of a centred 620px —
            its top edge reached up into the header and got covered. 1100 is
            the same rung SellPromptModal already uses to clear that header. */}
        <DialogContent
          overlayClassName="z-[1099]"
          className="
            z-[1100]
            bg-[#17171A] text-white p-0 border-none
            w-[min(92vw,1040px)] max-w-[1040px]
            top-[50%] translate-y-[-50%]
            md:h-[620px] max-h-[85vh]
            rounded-3xl md:rounded-[32px]
            overflow-hidden flex flex-col md:flex-row
          "
        >
          {/* MEDIA — left "page" of the book on desktop, full-width on mobile */}
          <div
            className="
              relative w-full md:w-[45%] md:h-full shrink-0
              aspect-[4/3] md:aspect-auto
              bg-[#333335]
              overflow-hidden
            "
          >
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1 text-[12px] font-semibold rounded-full text-black bg-white">
                {prompt.category.toUpperCase()}
              </span>
            </div>

         <div className="absolute top-4 right-4 z-10">
  {/* Replaces the unlock pill rather than joining it — "PURCHASE TO UNLOCK"
      alongside "COMING SOON" tells the buyer to do something they can't. */}
  {comingSoon && !owned ? (
    <span
      className="px-3 py-1 text-[12px] font-semibold rounded-full inline-flex items-center gap-1.5"
      style={{ background: "#3A2A08", color: "#FBBF24" }}
    >
      <Clock className="w-3.5 h-3.5" />
      COMING SOON
    </span>
  ) : (
    <span
      className="px-3 py-1 text-[12px] font-semibold rounded-full"
      style={{
        background: owned ? "#14532D" : isFreeListing ? "#14532D" : "#FFFFFF",
        color: owned ? "#BBF7D0" : isFreeListing ? "#BBF7D0" : "#000000",
      }}
    >
      {owned
        ? isTeamMember && !isOwnPrompt
          ? "UNLOCKED BY YOUR ORG"
          : "PURCHASED"
        : /* Nothing to purchase, so it doesn't say purchase. A free listing
             read "PURCHASE TO UNLOCK" on a white pill and then showed ₹0 for a
             price — telling the reader to buy something that isn't for sale. */
          isFreeListing
          ? "FREE"
          : "PURCHASE TO UNLOCK"}
    </span>
  )}
</div>

            <div className="absolute inset-0">
              {media?.type === "image" && !media.url ? (
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
                  // Hide rather than swap in a fallback file that doesn't exist,
                  // which just re-broke the image.
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                /* preload + poster, because these files are large.

                   The attachments are the seller's originals — the 4K one on the
                   marketplace is 56 MB — and with no poster and no preload hint
                   this panel was a black rectangle for as long as the download
                   took. Nothing was broken; there was simply nothing to show
                   yet, and no way to tell that apart from a failure.

                   poster paints the listing's image immediately where there is
                   one, preload="auto" starts fetching on open rather than
                   waiting, and onLoadedData clears the "Loading video…" line
                   below so the wait is at least legible. */
                <video
                  src={media?.url}
                  /* The generated frame first: it comes from this very video,
                     so it matches what plays. prompt.imageUrl is the fallback,
                     and only some listings have one at all. */
                  poster={(prompt as any).posterUrl || prompt.imageUrl || undefined}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  autoPlay
                  playsInline
                  preload="auto"
                  onLoadedData={() => setVideoReady(true)}
                />
              )}

              {/* Says what's happening while a large file streams in. Without
                  it the panel looked broken rather than busy. */}
              {media?.type === "video" && !videoReady && (
                <div className="absolute inset-0 grid place-items-center pointer-events-none" style={{ zIndex: 25 }}>
                  <span
                    className="rounded-full px-3 py-1.5 text-[12px] text-white/85"
                    style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
                  >
                    Loading video…
                  </span>
                </div>
              )}

              {/* Watermark overlay — visible only when not purchased */}
              {!owned && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    overflow: "hidden",
                    zIndex: 20,
                    isolation: "isolate",
                  }}
                >
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span
                      key={i}
                      style={{
                        position: "absolute",
                        left: `${(i % 4) * 28 - 5}%`,
                        top: `${Math.floor(i / 4) * 22 + 5}%`,
                        transform: "rotate(-30deg)",
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        color: "rgba(255,255,255,0.22)",
                        whiteSpace: "nowrap",
                        userSelect: "none",
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      Tokun.world
                    </span>
                  ))}
                  <span
                    style={{
                      position: "absolute",
                      bottom: 10,
                      right: 14,
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      color: "rgba(255,255,255,0.65)",
                      background: "rgba(0,0,0,0.4)",
                      padding: "3px 8px",
                      borderRadius: 6,
                      userSelect: "none",
                      fontFamily: "Arial, sans-serif",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    © Tokun.world
                  </span>
                </div>
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

          {/* DETAILS — right "page" of the book on desktop, scrolls independently of the media */}
          <div
            className="
              px-8 md:px-10
              pt-8 md:pt-10
              pb-10 md:pb-12
              min-h-0 md:h-full flex-1 overflow-y-auto no-scrollbar
            "
          >
            {/* Title. The column for the save control collapses with it when
                the caller has none to offer — see hideSave — so the heading
                takes the full width instead of leaving a 42px hole. */}
            <div
              className={`grid ${hideSave ? "grid-cols-1" : "grid-cols-[1fr_auto]"} items-start gap-4 mt-2`}
            >
              <h2 className="font-semibold text-[24px] leading-snug tracking-tight">
                {prompt.title}
              </h2>
              {/* Was a 42px circle with cop1.png in it — an icon you had to
                  hover to identify, on the one control here that changes what's
                  in your account. It says what it does now. */}
              {!hideSave && (
                <SaveButton
                  saved={isSaved}
                  busy={savingPrompt}
                  disabled={!promptRefId}
                  onClick={toggleSavePrompt}
                  className="justify-self-end"
                />
              )}
            </div>

            {/* What buyers made of it, right under the title where a price
                comparison actually happens. The old `rating` field on this
                object was never written to by anything, so every listing
                claimed the same score; it now comes from real purchase-gated
                reviews (models/ProductReview.js). */}
            <div className="mt-3">
              <StarRating value={prompt.rating} count={(prompt as any).reviewCount} size={15} />
            </div>

            {/* Description */}
            <p className="mt-5 text-white/80 text-[15px] leading-relaxed">
              {prompt.description}
            </p>

            {/* The prompt text itself.

                This used to be `isOwnPrompt &&` — the uploader, and nobody else.
                So the one thing a purchase actually buys was never rendered by
                the panel that announces "PURCHASED" at the top of it. It hit
                buyers and org team members alike, but it stranded team members
                completely: the org buys a product and shares it, the server
                sends the unlocked text down with it, and the member's panel
                showed a description and a green badge with the prompt nowhere
                on screen and no other page to find it on.

                `owned` covers both routes to it — bought it yourself, or your
                organization bought it and shared it (Notifications sets `owned`
                from the server's own `unlocked` flag). The text is only ever in
                `fullPrompt` when the server decided to send it, so this can't
                reveal anything the endpoint withheld. */}
            {(isOwnPrompt || owned) && prompt.fullPrompt && (
              <div className="mt-6 rounded-[12px] border border-white/10 bg-[#1C1C1E] p-4">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <span className="text-[12px] font-semibold tracking-wide text-white/50">
                    {isOwnPrompt
                      ? "YOUR PROMPT"
                      : isTeamMember
                        ? "SHARED BY YOUR ORGANIZATION"
                        : "YOUR PURCHASED PROMPT"}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="h-8 px-3 rounded-[8px] border border-white/10 bg-[#242427] text-[12px] text-white/80 hover:bg-[#2E2E32] hover:text-white transition-colors"
                  >
                    Copy
                  </button>
                </div>
                {/* Wraps and scrolls rather than stretching the panel — a long
                    prompt would otherwise push the price and actions off. */}
                <p className="max-h-[220px] overflow-y-auto whitespace-pre-wrap break-words text-[14px] leading-relaxed text-white/75">
                  {prompt.fullPrompt}
                </p>
              </div>
            )}

            {/* The second half of a coding product, sitting directly under the
                prompt text it goes with. Renders nothing when the listing has
                no code attached, and decides its own locked/unlocked state — see
                PromptCodePanel. `isOwnPrompt || owned` matches the block above
                so the seller previewing their own listing sees what they
                uploaded rather than the buyer's teaser. */}
            <PromptCodePanel
              promptId={String(prompt.id)}
              code={prompt.code}
              owned={isOwnPrompt || owned}
              // No money changed hands, so there is no refund for the note
              // inside to have terms about.
              isFree={isFreeListing}
            />

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

            {/* Price + Buttons — top row is price+Share (small), then one big
                full-width primary action button per row below, matching the
                reference layout (compact price/share row + one prominent
                unlock/buy button underneath). */}
          <div className="mt-8 space-y-3">
            {/* Price + Share row */}
            <div className="flex items-center justify-between gap-3">
              <div className="shrink-0">
                <div className="text-[22px] font-semibold text-white">
                  {/* "₹0" is not a price, it's the absence of one. */}
                  {isFreeListing ? "Free" : `₹${chargedPrice.toLocaleString()}`}
                </div>
                {/* Spelled out so the total isn't a surprise at the payment
                    sheet. Only when there is actually a fee to explain. */}
                {platformFee > 0 && (
                  <div className="text-[11px] text-white/40 mt-0.5">
                    ₹{listPrice.toLocaleString()} + ₹{platformFee.toLocaleString()} platform fee 
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Everyone gets this one — sharing a link to a listing needs no
                    org, no purchase, and gives away nothing paid. */}
                <SharePromptMenu url={shareUrl} title={prompt?.title} />

                {/* Only an Owner/Admin can suggest a prompt to their team — the
                    same modal serves the TM's own "request to buy" below, so this
                    button is hidden for everyone it wouldn't work for. */}
                {isOrgOwnerUser && (
                  <button
                    className="h-9 px-4 rounded-[8px] border border-white/10 bg-[#1C1C1E] flex items-center justify-center gap-1.5 text-white text-[13px] hover:bg-[#2A2A2D] transition-all whitespace-nowrap"
                    onClick={() => setShowRequestModal(true)}
                  >
                    <RiShareForwardLine className="w-4 h-4" />
                    Share with team
                  </button>
                )}
              </div>
            </div>

            {/* Cart — big, full-width. Hidden entirely for team members: cart
                checkout is blocked server-side, so an item they add can never
                be paid for. */}
            {/* Explains the locked state below. A disabled Buy button with no
                reason next to it just reads as broken. */}
            {comingSoon && !owned && !isOwnPrompt && (
              <div
                className="w-full flex items-start gap-2 rounded-[10px] px-3 py-2.5 text-[12px] leading-snug"
                style={{
                  background: "rgba(251,191,36,0.08)",
                  border: "1px solid rgba(251,191,36,0.25)",
                  color: "#FCD34D",
                }}
              >
                <Info className="h-4 w-4 shrink-0 mt-[1px]" />
                <span>
                  Creator verification pending. This listing goes on sale automatically
                  once their payout account is approved.
                </span>
              </div>
            )}

            {/* Already in the cart — the button is replaced, not dropped.

                Dropping it would leave the panel with only Buy Now and nothing
                saying why the cart option vanished, and the add could not
                succeed anyway: the route rejects a duplicate, which is what the
                "Already in your cart" toast below exists to catch. Saying so up
                front beats letting someone press it to find out. */}
            {!isOwnPrompt && !owned && !isTeamMember && !comingSoon && Number(prompt.price || 0) > 0 && inCart && (
              <div
                className="w-full h-12 flex items-center justify-center gap-2 rounded-[10px] border text-[15px] font-medium"
                style={{
                  background: "rgba(25,230,108,0.10)",
                  borderColor: "rgba(25,230,108,0.22)",
                  color: "#19E66C",
                }}
              >
                <CheckCircle2 className="w-5 h-5" />
                In your cart
              </div>
            )}

            {/* `!soldOut` was missing here, and only here.

                Buy Now already checked it further down, so a one-time product
                that had been bought showed no Buy button — and Add to Cart
                sitting right above it, fully live. Pressing it always failed:
                POST /api/cart/add refuses with `prompt_already_sold`. A button
                whose only possible outcome is an error. */}
            {!isOwnPrompt && !owned && !isTeamMember && !comingSoon && !soldOut && Number(prompt.price || 0) > 0 && !inCart && (
              <button
                /* Awaits the result before saying anything. It used to fire and
                   forget, so a refusal (already in the cart, already purchased,
                   signed out) still produced "Added to Cart" AND closed the
                   panel — the cart was untouched and nothing said so. The panel
                   now stays open when the add didn't happen. */
                onClick={async (e) => {
                  e.stopPropagation();
                  const result = await addToCart(String(prompt.id));

                  if (!result.ok) {
                    toast({
                      title:
                        result.error === "already_in_cart"
                          ? "Already in your cart"
                          : "Couldn't add to cart",
                      description: result.message,
                    });
                    return;
                  }

                  toast({
                    title: "Added to Cart",
                    description: `"${prompt.title}" was added.`,
                  });
                  onOpenChange(false);
                }}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-[10px] border border-white/10 text-white text-[15px] font-medium transition-all bg-[#1C1C1E] hover:bg-gradient-to-r hover:from-[#5A3FFF] hover:to-[#FF14EF]"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            )}

            {/* Primary action — big, full-width */}
            {!isOwnPrompt && (
              owned ? (
                /* Owned — by you, or by your org on your behalf. Either way the
                   action here is to use it, not to buy it: the panel used to
                   stop at a static "Purchased" chip, so someone who had the
                   product had no button that did anything with it. */
                <div className="space-y-2">
                  <div className="w-full h-12 rounded-[10px] bg-[#14532D] text-[#BBF7D0] text-[15px] font-semibold flex items-center justify-center">
                    {isTeamMember ? "Unlocked by your organization" : "Purchased"}
                  </div>
                  {prompt.fullPrompt && (
                    <button
                      onClick={handleCopy}
                      className="w-full h-12 flex items-center justify-center rounded-[10px] font-semibold text-white text-[15px] transition-all bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] hover:opacity-90"
                    >
                      Copy prompt
                    </button>
                  )}
                </div>
              ) : comingSoon ? (
                // Checked before the free-prompt branch: a free listing from an
                // unverified seller still isn't claimable, and Copy would hand
                // over the prompt text.
                <button
                  type="button"
                  disabled
                  title="This Creator's payout account is still being verified."
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-[10px] font-semibold text-[15px] cursor-not-allowed bg-[#2A2A2A] text-white/50"
                >
                  <Lock className="w-4 h-4" />
                  Coming soon
                </button>
              ) : Number(prompt.price || 0) <= 0 ? (
                <button
                  onClick={handleCopy}
                  className="w-full h-12 flex items-center justify-center rounded-[10px] font-semibold text-white text-[15px] transition-all bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] hover:opacity-90"
                >
                  Copy
                </button>
              ) : isTeamMember ? (
                // A team member's route to a paid prompt is asking their Owner,
                // not paying. Previously this rendered a greyed-out "Buy Now"
                // with no alternative — a dead end even once the disabled state
                // worked.
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="w-full h-12 flex items-center justify-center rounded-[10px] font-semibold text-white text-[15px] transition-all bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] hover:opacity-90"
                >
                  Request to buy
                </button>
              ) : soldOut ? (
                /* Say it. This branch used to be `null` — no button and no
                   explanation, just a gap where the buy area should be, so the
                   panel looked broken rather than sold. */
                <div className="w-full rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-3 text-center">
                  <p className="text-[15px] font-semibold text-white">Sold</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/50">
                    This was a one-time purchase — the creator sold it once and it
                    can't be bought again.
                  </p>
                </div>
              ) : (
                <>
                  {/* What you are about to be charged, itemised, before you
                      commit to it. The price shown further up is the total, so
                      the platform fee inside it was invisible until Razorpay's
                      sheet opened with a larger number than the one the buyer
                      had agreed to — the classic moment a purchase is abandoned.
                      Only rendered when there is actually a fee to break out;
                      for a fee-free listing a one-line "total" restating the
                      price above would be noise. */}
                  {chargedPrice > 0 && platformFee > 0 && (
                    <div className="rounded-[10px] border border-white/10 bg-white/[0.03] p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[12px] text-white/55">
                        <span>Product price</span>
                        <span>₹{listPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-[12px] text-white/55">
                        <span>Platform fee</span>
                        <span>₹{platformFee.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[13px] font-semibold text-white">
                        <span>You pay</span>
                        <span>₹{chargedPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => onPurchase?.(prompt)}
                    className="w-full h-12 flex items-center justify-center rounded-[10px] font-semibold text-white text-[15px] transition-all bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] hover:opacity-90"
                  >
                    Buy Now
                  </button>

                  {/* Standard purchase consent line. Both documents open in a
                      new tab so a half-finished purchase isn't thrown away to
                      go and read them. */}
                  <p className="text-[11px] text-white/40 text-center leading-relaxed">
                    By buying, you agree to our{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2 hover:text-white/70"
                    >
                      Terms &amp; Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="/refund-policy"
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2 hover:text-white/70"
                    >
                      Refund Policy
                    </a>
                    .
                  </p>
                </>
              )
            )}

            {isTeamMember && !isOwnPrompt && !owned && Number(prompt.price || 0) > 0 && (
              <p className="text-[11px] text-white/40 text-center">
                Your organization buys products for you — your owner can purchase this and share it.
              </p>
            )}

            {isOwnPrompt && (
              <div className="w-full h-12 rounded-[10px] bg-[#2A2A2A] text-white/80 text-[15px] font-medium flex items-center justify-center">
                Your Prompt
              </div>
            )}
          </div>

          {/* Reviews. Below the buy area rather than above it: someone who has
              already decided shouldn't have to scroll past other people's
              opinions to reach the button, and someone still deciding is
              scrolling anyway. Sellers see the list but never the form. */}
          {promptRefId && (
            <ProductReviews promptId={promptRefId} isOwnProduct={isOwnPrompt} />
          )}
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
    role={(user?.role || "") as "TM" | "Owner" | "Admin"}
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