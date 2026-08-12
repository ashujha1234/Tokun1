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
  const { addToCart } = useCart();

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

   const currentUserId = user?._id || user?.id || null;

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
      description: "Prompt copied to clipboard.",
    });
  } catch {
    toast({
      title: "Copy failed",
      description: "Unable to copy prompt.",
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
        <DialogContent
          className="
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
        background: owned ? "#14532D" : "#FFFFFF",
        color: owned ? "#BBF7D0" : "#000000",
      }}
    >
      {owned ? "PURCHASED" : "PURCHASE TO UNLOCK"}
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
                <video
                  src={media?.url}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  autoPlay
                  playsInline
                />
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

            {/* Description */}
            <p className="mt-5 text-white/80 text-[15px] leading-relaxed">
              {prompt.description}
            </p>

            {/* The prompt text itself — your own upload, so there's nothing to
                unlock. Buyers still see only the description above; this block
                renders solely for the uploader, and only when the endpoint
                actually sent the text (the public one strips it). */}
            {isOwnPrompt && prompt.fullPrompt && (
              <div className="mt-6 rounded-[12px] border border-white/10 bg-[#1C1C1E] p-4">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <span className="text-[12px] font-semibold tracking-wide text-white/50">
                    YOUR PROMPT
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
                  ₹{chargedPrice.toLocaleString()}
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
                  Seller verification pending. This listing goes on sale automatically
                  once their payout account is approved.
                </span>
              </div>
            )}

            {!isOwnPrompt && !owned && !isTeamMember && !comingSoon && Number(prompt.price || 0) > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(prompt.id);
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
                <div className="w-full h-12 rounded-[10px] bg-[#14532D] text-[#BBF7D0] text-[15px] font-semibold flex items-center justify-center">
                  Purchased
                </div>
              ) : comingSoon ? (
                // Checked before the free-prompt branch: a free listing from an
                // unverified seller still isn't claimable, and Copy would hand
                // over the prompt text.
                <button
                  type="button"
                  disabled
                  title="This seller's payout account is still being verified."
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
              ) : !(prompt.exclusive && prompt.sold) ? (
                <button
                  onClick={() => onPurchase?.(prompt)}
                  className="w-full h-12 flex items-center justify-center rounded-[10px] font-semibold text-white text-[15px] transition-all bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] hover:opacity-90"
                >
                  Buy Now
                </button>
              ) : null
            )}

            {isTeamMember && !isOwnPrompt && !owned && Number(prompt.price || 0) > 0 && (
              <p className="text-[11px] text-white/40 text-center">
                Your organization buys prompts for you — your owner can purchase this and share it.
              </p>
            )}

            {isOwnPrompt && (
              <div className="w-full h-12 rounded-[10px] bg-[#2A2A2A] text-white/80 text-[15px] font-medium flex items-center justify-center">
                Your Prompt
              </div>
            )}
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