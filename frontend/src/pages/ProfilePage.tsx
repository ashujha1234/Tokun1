


// import { useNavigate } from "react-router-dom";
import { uploadedAvatar, avatarFallback } from "@/lib/avatar";
// import { ShieldCheck } from "lucide-react";

// import { useEffect, useState , useRef } from "react";
// import { useParams } from "react-router-dom";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import { Card, CardContent } from "@/components/ui/card";
// import { User, Star } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import { LuBadgeCheck } from "react-icons/lu"; 
// import { CiMenuKebab } from "react-icons/ci";
// import { FiPhone, FiVideo } from "react-icons/fi";

// import { socket } from "@/lib/socket"; // or wherever you initialize socket.io
// const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";
//   const kpiCardBase =
//   "rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.03] border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";


// const toDateValue = (date: Date) => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

// const formatDisplayDate = (value: string) => {
//   const [year, month, day] = value.split("-").map(Number);
//   return new Date(year, month - 1, day).toLocaleDateString("en-US");
// };

// const getMonthLabel = (date: Date) =>
//   date.toLocaleDateString("en-US", {
//     month: "long",
//     year: "numeric",
//   });

// type Prompt = {
//   id: string;
//   title: string;
//   description: string;
//   category: string;
//   price?: number;
//   imageUrl?: string;
//   videoUrl?: string;
//   isFree?: boolean;
// };



// interface AuthUser {
//   _id: string;
//   name: string;
//   avatar?: string;
// }

// interface AuthContextType {
//   user: AuthUser | null;
//   token: string | null;
//   persistAuth: (data: Partial<AuthContextType>) => void;
// }


// interface Service {
//   _id: string;
//   title: string;
//   description: string;
//   price: number;
//   delivery?: string;
//   revisions?: string;
//   screens?: string;
//   prototype?: string;
//   fileType?: string;
//   media?: string[];
//   tags?: string[];
//   badge?: string;
//   rating?: number;
//   category?: {
//     _id: string;
//     name: string;
//   };
// }

// interface Category {
//   _id: string;
//   name: string;
// }

// interface ChatMessage {
//   _id?: string;
//   senderId: string;
//   text: string;
//   createdAt?: string;
// }

// export default function ProfilePage() {
//   // const { userId } = useParams();
//    const { userId } = useParams<{ userId: string }>();
//   // const { user, token } = useAuth() as any;
//    const { user, token, persistAuth } = useAuth() as AuthContextType;
// 
//   const [prompts, setPrompts] = useState<Prompt[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [userName, setUserName] = useState("");
//   const [openMenu,setOpenMenu] = useState("")
// const [activeTab, setActiveTab] = useState<"message" | "services">("message");

// const [showPopup, setShowPopup] = useState(false);
// const [popupTab, setPopupTab] = useState<"message" | "hire">("message");

// const [showRequestPopup, setShowRequestPopup] = useState(false);
// const [openBookPopup, setOpenBookPopup] = useState(false);

// const [openHirePopup, setOpenHirePopup] = useState(false);


// const [openMessagePopup, setOpenMessagePopup] = useState(false);
// const [popupMessage, setPopupMessage] = useState("");

// const [targetDate, setTargetDate] = useState("weeks"); // days | weeks | month | unsure
// const [customDateEnabled, setCustomDateEnabled] = useState(false);

// const [selectedDate, setSelectedDate] = useState<number | null>(6);
// const [selectedTime, setSelectedTime] = useState("11:00 AM");
// const [openServicePopup, setOpenServicePopup] = useState(false);
// // const [selectedService, setSelectedService] = useState<any>(null);
// const [openCreateServicePopup, setOpenCreateServicePopup] = useState(false);
// const isOwnProfile = userId === user?._id;
// const fileRef = useRef<HTMLInputElement | null>(null);
// const [avatar, setAvatar] = useState<string | null>(null);

// const [kycInfo, setKycInfo] = useState<{
//   kycStatus: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED" | "FLAGGED";
//   docType: "AADHAAR" | "PASSPORT" | null;
//   verifiedAt: string | null;
// } | null>(null);


// const [projectTitle, setProjectTitle] = useState("");
// const [deliveryPreference, setDeliveryPreference] = useState<
//   "required" | "complete"
// >("complete");

// const [activeHireTab, setActiveHireTab] = useState<
//   "hire" | "message" | "services"
// >("hire");

// 

// useEffect(() => {
//   if (!userId) return;
// fetch(`${API_BASE}/api/kyc/public/${userId}`)
//     .then((r) => r.json())
//     .then((data) => {
//       if (!data?.success) return;
//      setKycInfo({
//   kycStatus: data.kycStatus || "NOT_SUBMITTED",
//   docType: data.docType || null,
//   verifiedAt: data.verifiedAt || null,
// });

//     })
//     .catch(() => {});
// }, [userId]);


// useEffect(() => {
//   if (!userId) return;

//   if (userId !== user?._id || !token) {
//     setDocPreviewUrl(null);
//     return;
//   }

//   let objectUrl: string | null = null;

//   (async () => {
//     try {
//       const res = await fetch(`${API_BASE}/api/kyc/me/preview/front`, {
//   headers: { Authorization: `Bearer ${token}` },
// });

//       if (!res.ok) {
//         console.log("KYC preview failed:", res.status);
//         return;
//       }

//       const blob = await res.blob();
//       objectUrl = URL.createObjectURL(blob);
//       setDocPreviewUrl(objectUrl);
//     } catch (e) {
//       console.log("KYC preview error:", e);
//     }
//   })();

//   return () => {
//     if (objectUrl) URL.revokeObjectURL(objectUrl);
//   };
// }, [userId, user?._id, token]);


// useEffect(() => {
//   if (user?.avatar) {
//     setAvatar(API_BASE + user.avatar);
//   }
// }, [user]);
 
// const [messagePopupTab, setMessagePopupTab] = useState<
//   "message" | "hire" | "services"
// >("message");


// const [showHireCalendar, setShowHireCalendar] = useState(false);

// const [hireDate, setHireDate] = useState(() => toDateValue(new Date()));

// const [hireCalendarMonth, setHireCalendarMonth] = useState(() => {
//   const today = new Date();
//   today.setDate(1);
//   today.setHours(0, 0, 0, 0);
//   return today;
// });


// const [activeProfileTab, setActiveProfileTab] = useState<
//   "work" | "services" | "collections" | "liked"
// >("work");
// // ===== CREATE SERVICE FORM STATE =====
// const [serviceTitle, setServiceTitle] = useState("");
// // const [serviceCategory, setServiceCategory] = useState("");
// // const [serviceSubCategory, setServiceSubCategory] = useState("");
// const [serviceDescription, setServiceDescription] = useState("");
// const [servicePrice, setServicePrice] = useState("");

// const [serviceFiles, setServiceFiles] = useState<File[]>([]);
// const [servicePreview, setServicePreview] = useState<string[]>([]);

// // const [services, setServices] = useState<any[]>([]);
// const [creatingService, setCreatingService] = useState(false);
// // message
// const [messageText, setMessageText] = useState("");
// const [services, setServices] = useState<Service[]>([]);
// const [selectedService, setSelectedService] = useState<Service | null>(null);
// const [messages, setMessages] = useState<ChatMessage[]>([]);

// // hire
// const [projectDetails, setProjectDetails] = useState("");
// const [budget, setBudget] = useState(27000);
// const [customDate, setCustomDate] = useState(false);

// const menuRef = useRef<HTMLDivElement | null>(null);
// const [openChat, setOpenChat] = useState(false);
// // const [isExpanded, setIsExpanded] = useState(false);

// const [conversationId, setConversationId] = useState<string | null>(null);
// // const [messages, setMessages] = useState<any[]>([]);
// const [messageInput, setMessageInput] = useState("");

//   useEffect(() => {
//     if (!userId) return;

//     const endpoint =
//       userId === user?._id
//         ? `${API_BASE}/api/prompt/my`
//         : `${API_BASE}/api/prompt/user/${userId}`;

//     fetch(endpoint, {
//       headers: token ? { Authorization: `Bearer ${token}` } : {},
//       credentials: "include",
//     })
//       .then((r) => r.json())
//       .then((data) => {
//         if (!data?.success) return;

//           const mapped = (data.prompts || []).map((doc: any) => {
//   const att = doc?.attachment;

//   // ✅ Azure already returns FULL URL
//  const imageUrl =
//   att?.type === "image" && att?.path
//     ? att.path
//     : undefined;

// const videoUrl =
//   att?.type === "video" && att?.path
//     ? att.path
//     : undefined;

// return {
//   id: doc._id,
//   title: doc.title,
//   description: doc.description,
//   category:
//     doc.categories?.[0]?.name ||
//     (Array.isArray(doc.categories)
//       ? doc.categories.join(", ")
//       : "General"),
//   price: Number(doc.price || 0),
//   imageUrl,
//   videoUrl,
//   isFree: !!doc.free,
// };
// });

//         setPrompts(mapped);
//         setUserName(data.user?.name || user?.name || "");
//       })
//       .finally(() => setLoading(false));
//   }, [userId, user, token]);

//    useEffect(() => {
//   if (activeProfileTab !== "services" || !userId) return;

//   const endpoint =
//     userId === user?._id
//       ? `${API_BASE}/api/services/my`           // own profile
//       : `${API_BASE}/api/services/user/${userId}`; // other profile

//   fetch(endpoint, {
//     headers:
//       userId === user?._id
//         ? { Authorization: `Bearer ${token}` }
//         : undefined,
//   })
//     .then(res => res.json())
//     .then(data => {
//       if (data?.services) {
//         setServices(data.services);
//       }
//     })
//     .catch(err => console.error("Load services error", err));
// }, [activeProfileTab, userId, user, token]);

 


// useEffect(() => {
//   if (!conversationId) return;

//   fetch(`${API_BASE}/api/chat/messages/${conversationId}`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       if (data?.messages) {
//         setMessages(data.messages);
//       }
//     })
//     .catch((err) => console.error("load messages error:", err));
// }, [conversationId, token]);

// useEffect(() => {
//  socket.on("new-message", (msg: ChatMessage) => {
//     setMessages((prev) => [...prev, msg]);
//   });

//   return () => {
//     socket.off("new-message");
//   };
// }, []);

// const openConversation = async (otherUserId: string) => {

//   if (!otherUserId || otherUserId === user._id) return;
//   try {
//     const res = await fetch(`${API_BASE}/api/chat/conversation`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ userId: otherUserId }),
//     });

//     const data = await res.json();

//     if (!data?.conversation?._id) return;

//     setConversationId(data.conversation._id);
//     setMessages([]);
//     setOpenChat(true);

//     // join socket room
//     socket.emit("join-chat", {
//       conversationId: data.conversation._id,
//     });
//   } catch (err) {
//     console.error("openConversation error:", err);
//   }
// };

// const confirmHire = async () => {
//   try {
//     // 1️⃣ Ensure conversation exists
//     let convoId = conversationId;

//     if (!convoId) {
//       const res = await fetch(`${API_BASE}/api/chat/conversation`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ userId }), // elonId
//       });

//       const data = await res.json();
//       convoId = data?.conversation?._id;

//       if (!convoId) {
//         console.error("Conversation creation failed");
//         return;
//       }

//       setConversationId(convoId);
//     }

//     // 2️⃣ Build hire message
// const hireMessage = `HIRE_CARD::${JSON.stringify({
//   title: projectTitle || "Project Proposal",
//   description: projectDetails,
//   budget: budget,
//   targetDate: hireDate,
//   status: "PENDING"
// })}`;

//     // 3️⃣ Send message with VALID conversationId
//     socket.emit("send-message", {
//       conversationId: convoId,
//       senderId: user._id,
//       text: hireMessage,
//     });

//     // 4️⃣ Close popups
//     setOpenHirePopup(false);
//     setOpenMessagePopup(false);

//     // 5️⃣ Show success popup
//     setShowRequestPopup(true);
//   } catch (err) {
//     console.error("Hire confirm error:", err);
//   }
// };


// const handleBookNow = (service: any) => {
//   setSelectedService(service);
//   setOpenServicePopup(false); // ensure details popup closed
//   setOpenBookPopup(true);     // open SAME book-now popup
// };



// // const { persistAuth } = useAuth();

// const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//   if (!e.target.files?.[0]) return;

//   // 🔒 FINAL GUARD
//   if (userId !== user?._id) {
//     alert("You can only change your own profile picture");
//     return;
//   }

//   const file = e.target.files[0];
//   const formData = new FormData();
//   formData.append("avatar", file);

//   try {
//     const res = await fetch(`${API_BASE}/api/user/upload-avatar`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       body: formData,
//     });

//     const data = await res.json();

//     // 🔐 VERIFY OWNER
//     if (data.success && data.avatar && data.userId === user._id) {
//       setAvatar(API_BASE + data.avatar);

//       persistAuth({
//         user: {
//           avatar: data.avatar,
//         },
//       });
//     }
//   } catch (err) {
//     console.error("Avatar upload failed", err);
//   }
// };
















// const sendMessage = () => {
//   if (!messageInput.trim() || !conversationId) return;

//   socket.emit("send-message", {
//     conversationId,
//     senderId: user._id,
//     text: messageInput,
//   });

//   setMessageInput("");
// };







//   return (
//   <div className="relative min-h-screen text-white flex flex-col overflow-x-hidden bg-[#07080A]">

// {/* STATIC BACKGROUND IMAGE */}
// <img
//   src="/icons/mpbg.png"
//   alt="background"
//   className="fixed inset-0 w-full h-screen object-contain object-top z-0 pointer-events-none select-none"
// />
// {!openHirePopup && !openMessagePopup && !openServicePopup && !openBookPopup && !openCreateServicePopup && !openDocModal && (
//   <div className="relative z-20">
//     <Header />
//   </div>
// )}

// <main className="relative z-10 flex-1">
//         <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-24 md:pt-28 lg:pt-36 pb-20">
          
//           {/* ================= HERO SECTION (ISOLATED) ================= */}
//         <div className="relative mb-20 lg:mt-6 xl:mt-10">
//             {/* LEFT HERO */}
//            <div className="flex items-center gap-6 lg:pt-6">

      
//     {userId === user?._id && (
//   <div
//     onClick={() => fileRef.current?.click()}
//     className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer group"
//   >
//     {avatar ? (
//       <img src={avatar} className="w-full h-full object-cover" />
//     ) : (
//       <div className="w-full h-full bg-white/10 flex items-center justify-center">
//         <User className="w-8 h-8 text-white/70" />
//       </div>
//     )}

//     {/* Hover overlay */}
//     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs transition">
//       Change
//     </div>

        
//   {/* Hidden file input */}
//   <input
//     ref={fileRef}
//     type="file"
//     accept="image/*"
//     className="hidden"
//     onChange={handleAvatarUpload}
//   />
// </div>
//     )}


//     {userId !== user?._id && (
//   <div className="relative w-20 h-20 rounded-full overflow-hidden">
//     {avatar ? (
//       <img src={avatar} className="w-full h-full object-cover" />
//     ) : (
//       <div className="w-full h-full bg-white/10 flex items-center justify-center">
//         <User className="w-8 h-8 text-white/70" />
//       </div>
//     )}
//   </div>
// )}
//               <div className="flex flex-col gap-2">
//              <h1 className="flex items-center text-2xl font-semibold text-white">
//   {userName}

//   {/* LONG WHITE SEPARATOR */}
//   <span className="mx-3 h-[3px] w-10 bg-white inline-block" />

//   {/* GOLD BADGE */}
//   <span
//     className="inline-flex items-center justify-center rounded-full"
//     style={{
//       backgroundColor: "#D18800",
//       padding: "3px",
//     }}
//   >
//     <LuBadgeCheck className="text-black text-[16px]" />
//   </span>
// </h1>



//                <p className="font-gilroy font-semibold text-[24px] leading-[100%] uppercase text-white">
//   AI Website Design Expert & Fasting
// </p>


// {/* ✅ ADD THIS HERE */}
// {kycInfo?.kycStatus === "VERIFIED" && (
//   <div className="inline-flex items-center gap-2 w-fit px-3 h-8 rounded-full bg-white/10 border border-white/10 text-xs text-white mt-1">
//     <ShieldCheck className="w-4 h-4 text-emerald-400" />
//     IDENTITY VERIFIED
//   </div>
// )}

//              <div className="flex items-center gap-3 mt-2 relative">
//   {/* HIRE BUTTON */}


// {userId !== user?._id ? (
//   <>
//     <button
//       onClick={() => setOpenHirePopup(true)}
//       className="px-4 h-9 rounded-full text-sm font-medium text-white"
//       style={{ background: GRADIENT }}
//     >
//       Hire
//     </button>

//     <button
//       onClick={() => {
//         setOpenMessagePopup(true);
//         openConversation(userId!);
//       }}
//       className="px-4 h-9 rounded-full text-sm font-medium text-white bg-white/10 hover:bg-white/20"
//     >
//       Message
//     </button>
//   </>
// ) : (
//   <>
 
//   </>
// )}


//   {/* TRIPLE DOT MENU (RIGHT OF HIRE) */}
 

//   {/* RATING (STAYS ON RIGHT SIDE) */}
//   <div className="flex items-center gap-1 px-3 h-9 rounded-full bg-[#1C1C1C] border border-white/10 text-sm">
//     <Star className="w-4 h-4 text-yellow-400" />
//     4.9
//   </div>
    


//     {/* //ooking */}
//     {/* <button
//   onClick={() => setOpenBookingPopup(true)}
//   className="px-6 h-10 rounded-full text-sm font-semibold text-white"
//   style={{ background: GRADIENT }}
// >
//   Book Appointment
// </button> */}


//    <div ref={menuRef} className="relative">
//     <button
//       onClick={() => setOpenMenu((v) => !v)}
//       className="
//         w-9 h-9 rounded-full
//         flex items-center justify-center
//         bg-[#1C1C1C]
//         border border-white/10
//         hover:bg-white/10
//         transition
//       "
//     >
//       <CiMenuKebab className="text-white text-[18px]" />
//     </button>

//     {/* DROPDOWN */}
//     {openMenu && (
//       <div
//         className="
//           absolute right-0 top-[44px]
//           min-w-[180px]
//           rounded-xl
//           bg-[#121212]
//           border border-white/10
//           shadow-[0_10px_40px_rgba(0,0,0,0.6)]
//           z-50
//         "
//       >
       

//         <button
//           onClick={() => {
//             setOpenMenu(false);
//             alert(`Report ${userName}`);
//           }}
//           className="
//             w-full px-4 py-3 text-left text-sm
//             text-white-400 hover:bg-white/5
//             transition
//           "
//         >
//           Report {userName}
//         </button>
//       </div>
//     )}
//   </div>
// </div>

//               </div>
//             </div>

//             {/* RIGHT HERO (DESKTOP ONLY) */}
//             <div className="absolute bottom-5 right-0 w-[420px] h-[260px] hidden lg:block">
//               <img
//                 src="/icons/prt.png"
//                 alt="PRT"
//                 className="absolute top-[80px] left-[55px] z-[1]"
//               />
//               <img
//                 src="/icons/pro.png"
//                 alt="PRO"
//                 className="absolute top-[150px] left-[0px] z-[2]"
//               />
//             </div>
//           </div>



//           {/* ================= AFTER HERO ================= */}
//         <h2 className="mt-10 font-gilroy font-semibold text-[40px] leading-[100%] text-white">
//   My Digital Products
// </h2>

//     {kycInfo?.kycStatus === "VERIFIED" && isOwnProfile && (
//   <div className="mt-10 max-w-[520px]">

//     {/* Verification Status Header */}
//     <div className="flex items-center justify-between mb-4">
//       <h3 className="text-white font-semibold text-lg">Verification Status</h3>
//       <span className="px-3 h-7 inline-flex items-center rounded-full text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
//         ● ACTIVE
//       </span>
//     </div>

//     {/* Card */}
//     <div className="rounded-[22px] bg-[#141414] border border-white/10 p-5">
//       <div className="flex items-start gap-3">
//         <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
//           <ShieldCheck className="w-6 h-6 text-sky-300" />
//         </div>

//         <div className="flex-1">
//           <p className="text-white font-semibold">
//             Identity verified via official document matching
//           </p>
//           <p className="text-white/60 text-sm mt-1">
//             This verification process includes biometric face matching against government-issued identification.
//           </p>
//         </div>
//       </div>

//       {/* Meta rows */}
//       <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
//         <div>
//           <p className="text-white/40">VERIFICATION DATE</p>
//           <p className="text-white mt-1">
//             {kycInfo?.verifiedAt ? new Date(kycInfo.verifiedAt).toLocaleDateString() : "-"}
//           </p>
//         </div>

//         {isOwnProfile && (
//   <div>
//     <p className="text-white/40">DOCUMENT TYPE</p>
//     <p className="text-white mt-1">
//       {kycInfo?.docType === "AADHAAR" ? "Aadhaar" : "Passport"}
//     </p>
//   </div>
// )}

//         <div>
//           <p className="text-white/40">STATUS</p>
//           <p className="text-emerald-300 mt-1 font-semibold">Confirmed</p>
//         </div>
//       </div>

//       {/* Waterdrop Confidential View */}
      
//     </div>
//     {/* ✅ Clickable Confidential View (separate block) */}
// <div
//   role="button"
//   tabIndex={0}
//   onClick={() => {
//     if (!docPreviewUrl) return;
//     setOpenDocModal(true);
//   }}
//   onKeyDown={(e) => {
//     if (e.key === "Enter" && docPreviewUrl) setOpenDocModal(true);
//   }}
//   className={`${kpiCardBase} mt-6 p-4 flex items-center gap-4 cursor-pointer hover:border-white/20 transition`}
// >
//   {/* Left droplet preview */}
//   <div className="relative w-[90px] h-[90px] shrink-0">
//     <div className="waterdrop w-full h-full overflow-hidden relative">
//       <img
//         src={docPreviewUrl || "/icons/doc-placeholder.png"}
//         className="w-full h-full object-cover scale-[1.05]"
//         alt="doc"
//       />

//       {/* blur + dark overlay */}
//       <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

//       {/* label */}
//       <div className="absolute inset-0 flex items-center justify-center px-2 text-center">
//         <p className="text-[10px] font-semibold text-white/90 leading-tight">
//           CONFIDENTIAL VIEW
//         </p>
//       </div>
//     </div>
//   </div>

//   {/* Right text */}
//   <div className="flex-1">
//     <p className="text-white font-semibold">CONFIDENTIAL VIEW</p>
//     <p className="text-white/50 text-xs mt-1">
//       Tap to view full document image.
//     </p>
//   </div>

//   {/* little hint */}
//   <span className="text-white/50 text-xs">View ⤢</span>
// </div>

//   </div>
// )}

//           {/* ================= FILTER BAR ================= */}
//           <div className="mt-6 mb-14 flex items-center justify-between">
//             {/* LEFT TABS */}
//            <div className="flex items-center gap-2">
// {[
//   { key: "work", label: "Work" },
//   { key: "services", label: "Services" },
//   { key: "collections", label: "Collections" },
//   { key: "liked", label: "Liked Prompt" },
// ].map((tab) => (
//   <button
//     key={tab.key}
//     onClick={() => setActiveProfileTab(tab.key as any)}
//     className={`px-4 h-9 rounded-full text-sm font-medium transition ${
//       activeProfileTab === tab.key
//         ? "bg-white/10 text-white"
//         : "text-white/70 hover:bg-white/10 hover:text-white"
//     }`}
//   >
//     {tab.label}
//   </button>
// ))}

// </div>


//             {/* RIGHT SORT */}
//             <div className="flex items-center gap-2">
//               <button className="px-4 h-9 rounded-full text-sm font-medium bg-white/10 text-white">
//                 Latest
//               </button>
//               <button className="px-4 h-9 rounded-full text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
//                 Popular
//               </button>
//             </div>
  
            
//           </div>

//           {/* ================= PROMPTS GRID ================= */}
//   {/* ================= TAB CONTENT ================= */}

// {/* 🔹 WORK TAB → PROMPT CARDS */}
// {activeProfileTab === "work" && (
//   <>
//     {loading ? (
//       <p className="text-white/70">Loading prompts…</p>
//     ) : prompts.length === 0 ? (
//       <p className="text-white/60">No prompts uploaded yet.</p>
//     ) : (
//    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
//         {prompts.map((prompt) => (
//           <Card
//   key={prompt.id}
//   className="overflow-hidden w-full max-w-[306px]"
//   style={{
//     height: 520,
//     background: "#1C1C1C",
//     borderRadius: 30,
//   }}
// >
//             <CardContent className="p-4 h-full flex flex-col">
//              <div className="relative w-full h-[240px] rounded-[20px] overflow-hidden bg-black">
//   {prompt.videoUrl ? (
//     <video
//       src={prompt.videoUrl}
//       className="w-full h-full object-cover"
//       controls
//       muted
//       playsInline
//       preload="metadata"
//     />
//   ) : prompt.imageUrl ? (
//     <img
//       src={prompt.imageUrl}
//       alt={prompt.title}
//       className="w-full h-full object-cover"
//     />
//   ) : null}

//   <div
//     className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
//     style={{ background: GRADIENT }}
//   >
//     {prompt.category.toUpperCase()}
//   </div>
// </div>

//               <div className="mt-4">
//                 <h3 className="text-[18px] font-semibold text-white line-clamp-2">
//                   {prompt.title}
//                 </h3>
//                 <p className="text-[13px] text-white/70 mt-2 line-clamp-2">
//                   {prompt.description}
//                 </p>
//               </div>

//               <div className="mt-auto pt-4">
//                 <div className="px-4 h-10 rounded-full bg-[#333335] inline-flex items-center justify-center text-sm text-white">
//                   {prompt.isFree ? "FREE" : `₹${prompt.price?.toFixed(2)}`}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     )}
//   </>
// )}

// {/* 🔹 SERVICES TAB → CREATE SERVICE CARD ONLY */}

// {activeProfileTab === "services" && (
//   <div className="mt-10 space-y-10">

//     {/* CREATE SERVICE CARD */}
    
//     {userId === user?._id && (
//   <CreateNewServiceCard
//     onClick={() => setOpenCreateServicePopup(true)}
//   />
// )}

//     {/* SERVICES LIST */}
//     {services.length === 0 ? (
//       <p className="text-white/60">
//         No services created yet.
//       </p>
//     ) : (
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {services.map(service => (
//           <div
//             key={service._id}
//             onClick={() => {
//               setSelectedService(service);
//               setOpenServicePopup(true);
//             }}
//             className="
//               cursor-pointer
//               rounded-2xl
//               bg-[#151515]
//               border border-white/10
//               p-6
//               hover:border-white/30
//               hover:bg-[#1A1A1A]
//               transition
//             "
//           >
//             {/* IMAGE */}
//             <div className="h-[160px] rounded-xl bg-black mb-4 overflow-hidden">
//              {service.media?.length > 0 && (
//   service.media[0].match(/\.(mp4|webm|ogg)$/i) ? (
//     <video
//       src={service.media[0]}
//       className="w-full h-full object-cover"
//       controls
//       muted
//       playsInline
//       preload="metadata"
//     />
//   ) : (
//     <img
//       src={service.media[0]}
//       className="w-full h-full object-cover"
//     />
//   )
// )}
//             </div>

//             {/* TITLE */}
//             <h4 className="font-semibold text-white line-clamp-2">
//               {service.title}
//             </h4>

//             {/* META */}
//             <div className="flex justify-between items-center mt-3 text-sm">
//               <span className="text-white/60">
//                 ⏱ {service.delivery}
//               </span>
//               <span className="text-pink-400 font-semibold">
//                 ₹{service.price}
//               </span>
//             </div>

//             <div className="text-xs text-white/50 mt-2">
//               🔁 {service.revisions}
//             </div>
//           </div>
//         ))}
//       </div>
//     )}
//   </div>
// )}

//         </div>
  
// {openHirePopup && (
//   <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
//     <div className="w-[440px] max-w-[94vw] rounded-2xl bg-[#17171A] text-white overflow-hidden border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.65)]">

//       {/* HEADER */}
//       <div className="p-4 border-b border-white/10">
//         <div className="flex items-start gap-3">
//           <img
//             src={avatar || avatarFallback(user)}
//             className="w-10 h-10 rounded-full object-cover"
//             alt={userName || "User"}
//           />

//           <div className="flex-1">
//             <p className="text-[15px] font-medium text-white leading-tight">
//               Connect with {userName || "Firoz"} —
//             </p>
//             <p className="text-xs text-white/45 mt-1">
//               Responds in about 1 hour
//             </p>
//           </div>

//           <button
//             onClick={() => setOpenHirePopup(false)}
//             className="text-white/40 hover:text-white text-2xl leading-none"
//           >
//             ×
//           </button>
//         </div>

//         {/* TABS */}
//         <div className="flex items-center gap-2 mt-4">
//           {[
//             { key: "hire", label: "Hire me", icon: null },
//             { key: "message", label: "Message", icon: "/icons/message.svg" },
//             { key: "services", label: "Services", icon: "/icons/service.svg" },
//           ].map((tab) => {
//             const active = activeHireTab === tab.key;

//             return (
//               <button
//                 key={tab.key}
//                 onClick={() => setActiveHireTab(tab.key as any)}
//                 className={`h-9 px-3 rounded-full text-sm font-medium flex items-center gap-2 transition ${
//                   active
//                     ? "text-white"
//                     : "text-white/80 hover:bg-white/10"
//                 }`}
//                 style={active ? { background: GRADIENT } : {}}
//               >
//                 {tab.icon ? (
//                   <img
//                     src={tab.icon}
//                     alt={tab.label}
//                     className="w-4 h-4 object-contain block shrink-0"
//                     onError={(e) => {
//                       console.log("Icon not found:", tab.icon);
//                       e.currentTarget.style.display = "none";
//                     }}
//                   />
//                 ) : (
//                   <User className="w-4 h-4 shrink-0" />
//                 )}

//                 <span>{tab.label}</span>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* BODY */}
//       <div className="px-4 py-3.5">
//         {activeHireTab === "hire" && (
//           <div className="space-y-4">

//             {/* PROJECT TITLE */}
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Project Title
//               </label>

//               <input
//                 value={projectTitle}
//                 onChange={(e) => setProjectTitle(e.target.value)}
//                 placeholder="e.g. Nextgen Mobile App Interface"
//                 className="w-full h-10 rounded-xl bg-[#D9D9D9] text-black placeholder:text-black/45 px-3 text-sm outline-none"
//               />
//             </div>

//             {/* PROJECT DETAILS */}
//             <div>
//               <label className="block text-sm font-medium">
//                 Project Details{" "}
//                 <span className="text-white/35">
//                   (Minimum 50 characters)
//                 </span>
//               </label>

//               <p className="text-xs text-white/35 mt-1">
//                 Describe your project or let AI help you write it
//               </p>

//               <textarea
//                 value={projectDetails}
//                 onChange={(e) => setProjectDetails(e.target.value)}
//                 placeholder="Include any project details, requirements, or goals..."
//                 className={`mt-2 w-full h-[60px] resize-none rounded-xl bg-transparent p-3 text-sm outline-none border ${
//                   projectDetails.length < 50
//                     ? "border-red-500"
//                     : "border-white/10"
//                 } placeholder:text-white/30`}
//               />

//               {projectDetails.length < 50 && (
//                 <p className="text-xs text-red-500 mt-1">
//                   Please provide at least 50 characters.
//                 </p>
//               )}
//             </div>

//             {/* PROJECT BUDGET */}
//             <div>
//               <label className="block text-sm font-medium">
//                 Project Budget
//               </label>

//               <p className="text-xs text-white/35 mt-1">
//                 Connect with {userName || "Firoz"} — minimum project rate is ₹1,000 (INR)
//               </p>

//               <div className="text-center text-[20px] font-semibold mt-3 mb-2">
//                 ₹{budget.toLocaleString("en-IN")}
//               </div>

//               <input
//                 type="range"
//                 min={1000}
//                 max={50000}
//                 step={500}
//                 value={budget}
//                 onChange={(e) => setBudget(Number(e.target.value))}
//                 className="w-full accent-[#8B45FF]"
//               />

//               <div className="flex justify-between text-[11px] text-white/35 mt-2">
//                 <span>Minimum ₹1,000 (INR)</span>
//                 <span>Maximum ₹50,000 (INR)</span>
//               </div>
//             </div>

//             {/* TARGET DATE */}
//             {/* TARGET DATE */}
// {/* TARGET DATE */}
// <div>
//   <label className="block text-sm font-medium mb-2">
//     Target Date
//   </label>

//   <div className="relative">
//     <button
//       type="button"
//       onClick={() => setShowHireCalendar((prev) => !prev)}
//       className="w-full h-10 rounded-xl bg-[#D9D9D9] text-black px-3 pr-10 text-sm outline-none text-left"
//     >
//       {formatDisplayDate(hireDate)}
//     </button>

//     {/* CALENDAR ICON RIGHT SIDE */}
//     <button
//       type="button"
//       onClick={() => setShowHireCalendar((prev) => !prev)}
//       className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center"
//     >
//       <img
//         src="/icons/cale.svg"
//         alt="calendar"
//         className="w-5 h-5 object-contain block"
//         onError={(e) => {
//           console.log("Calendar icon not found: /icons/cale.svg");
//           e.currentTarget.style.display = "none";
//         }}
//       />
//     </button>

//     {/* DARK CALENDAR POPUP - OPENS ABOVE ICON */}
//     {showHireCalendar && (() => {
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);

//       const year = hireCalendarMonth.getFullYear();
//       const month = hireCalendarMonth.getMonth();

//       const firstDay = new Date(year, month, 1).getDay();
//       const totalDays = new Date(year, month + 1, 0).getDate();

//       const prevMonth = () => {
//         setHireCalendarMonth((prev) => {
//           const next = new Date(prev);
//           next.setMonth(next.getMonth() - 1);
//           return next;
//         });
//       };

//       const nextMonth = () => {
//         setHireCalendarMonth((prev) => {
//           const next = new Date(prev);
//           next.setMonth(next.getMonth() + 1);
//           return next;
//         });
//       };

//       return (
//         <div className="absolute right-0 bottom-[46px] z-[10000] w-[280px] rounded-2xl bg-[#101114] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.75)] p-4">
//           <div className="flex items-center justify-between mb-3">
//             <button
//               type="button"
//               onClick={prevMonth}
//               className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 text-white"
//             >
//               ‹
//             </button>

//             <p className="text-sm font-semibold text-white">
//               {getMonthLabel(hireCalendarMonth)}
//             </p>

//             <button
//               type="button"
//               onClick={nextMonth}
//               className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 text-white"
//             >
//               ›
//             </button>
//           </div>

//           <div className="grid grid-cols-7 gap-1 text-center mb-2">
//             {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
//               <span
//                 key={`${day}-${index}`}
//                 className="text-[11px] text-white/40"
//               >
//                 {day}
//               </span>
//             ))}
//           </div>

//           <div className="grid grid-cols-7 gap-1 text-center">
//             {[...Array(firstDay)].map((_, i) => (
//               <span key={`empty-${i}`} />
//             ))}

//             {[...Array(totalDays)].map((_, i) => {
//               const day = i + 1;
//               const currentDate = new Date(year, month, day);
//               currentDate.setHours(0, 0, 0, 0);

//               const value = toDateValue(currentDate);
//               const active = hireDate === value;
//               const disabled = currentDate < today;

//               return (
//                 <button
//                   key={day}
//                   type="button"
//                   disabled={disabled}
//                   onClick={() => {
//                     setHireDate(value);
//                     setShowHireCalendar(false);
//                   }}
//                   className={`h-8 rounded-full text-xs transition ${
//                     disabled
//                       ? "text-white/20 cursor-not-allowed"
//                       : active
//                       ? "text-white"
//                       : "text-white/70 hover:bg-white/10"
//                   }`}
//                   style={active && !disabled ? { background: GRADIENT } : {}}
//                 >
//                   {day}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       );
//     })()}
//   </div>
// </div>

//             {/* DELIVERY PREFERENCE */}
//             <div>
//               <label className="block text-sm font-medium mb-3">
//                 Delivery Preference
//               </label>

//               <div className="flex gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setDeliveryPreference("required")}
//                   className={`h-10 px-3 rounded-lg text-sm transition ${
//                     deliveryPreference === "required"
//                       ? "text-white"
//                       : "bg-[#252529] text-white"
//                   }`}
//                   style={
//                     deliveryPreference === "required"
//                       ? { background: GRADIENT }
//                       : {}
//                   }
//                 >
//                   Only Required Files
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => setDeliveryPreference("complete")}
//                   className={`h-10 px-3 rounded-lg text-sm transition ${
//                     deliveryPreference === "complete"
//                       ? "text-white"
//                       : "bg-[#252529] text-white"
//                   }`}
//                   style={
//                     deliveryPreference === "complete"
//                       ? { background: GRADIENT }
//                       : {}
//                   }
//                 >
//                   Complete Project Files
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeHireTab === "message" && (
//           <div>
//             <label className="text-sm text-white/70">Message</label>

//             <textarea
//               value={popupMessage}
//               onChange={(e) => setPopupMessage(e.target.value)}
//               placeholder="Type your message"
//               className="w-full mt-2 h-[120px] resize-none rounded-xl bg-[#121212] p-3 text-sm outline-none border border-white/10"
//             />
//           </div>
//         )}

//         {activeHireTab === "services" && (
//           <div className="max-h-[420px] overflow-y-auto pr-1 custom-popup-scroll">
//             <ServicesTab
//               services={services}
//               onSelectService={(service) => {
//                 setSelectedService(service);
//                 setOpenServicePopup(true);
//               }}
//               onBookNow={handleBookNow}
//             />
//           </div>
//         )}
//       </div>

//       {/* FOOTER */}
//       {activeHireTab === "hire" && (
//         <div className="px-5 pb-5 pt-2">
//           <button
//             disabled={!projectTitle.trim() || projectDetails.length < 50}
//             onClick={confirmHire}
//             className="w-full h-11 rounded-full text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
//             style={{ background: GRADIENT }}
//           >
//             Submit Project Proposal
//           </button>
//         </div>
//       )}

//       {activeHireTab === "message" && (
//         <div className="px-5 pb-5 pt-2">
//           <button
//             onClick={() => {
//               if (!popupMessage.trim() || !conversationId) return;

//               socket.emit("send-message", {
//                 conversationId,
//                 senderId: user._id,
//                 text: popupMessage,
//               });

//               setPopupMessage("");
//               setOpenHirePopup(false);
//               setShowRequestPopup(true);
//             }}
//             className="w-full h-11 rounded-full text-sm font-medium text-white"
//             style={{ background: GRADIENT }}
//           >
//             Send Message
//           </button>
//         </div>
//       )}
//     </div>
//   </div>
// )}


// {openMessagePopup && (
//   <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
//     <div className="w-[420px] max-w-[95%] rounded-2xl bg-[#0E0F12] border border-white/10 text-white">

//       {/* HEADER */}
//       <div className="flex items-start gap-3 p-4 border-b border-white/10">
//         <img
//           src={avatarFallback(user)}
//           className="w-10 h-10 rounded-full"
//         />
//         <div className="flex-1">
//           <p className="font-semibold">Connect with {userName} —</p>
//           <p className="text-xs text-white/60">Responds in about 1 hour</p>
//         </div>
//         <button
//           onClick={() => setOpenMessagePopup(false)}
//           className="text-white/60 hover:text-white"
//         >
//           ✕
//         </button>
//       </div>

//       {/* TABS (UI ONLY) */}
//     <div className="flex gap-2 px-4 py-3">
//   {[
//     { key: "message", label: "Message" },
//     { key: "services", label: "Services" },
//     { key: "hire", label: "Hire" },
//   ].map((tab) => {
//     const active = messagePopupTab === tab.key;

//     return (
//       <button
//         key={tab.key}
//         onClick={() => setMessagePopupTab(tab.key as any)}
//         className={`px-4 h-9 rounded-full text-sm font-medium transition ${
//           active
//             ? "text-white"
//             : "text-white/60 hover:bg-white/10"
//         }`}
//         style={active ? { background: GRADIENT } : {}}
//       >
//         {tab.label}
//       </button>
//     );
//   })}
// </div>


//       {/* MESSAGE INPUT */}
//  <div className="px-4 pb-4 max-h-[70vh] overflow-y-auto hide-scrollbar scroll-smooth">

//   {/* ================= MESSAGE TAB ================= */}
//   {messagePopupTab === "message" && (
//     <>
//       <label className="text-sm text-white/70">Message</label>
//       <textarea
//         value={popupMessage}
//         onChange={(e) => setPopupMessage(e.target.value)}
//         placeholder="Type your message"
//         className="w-full mt-2 h-[120px] resize-none rounded-xl bg-[#121212] p-3 text-sm outline-none border border-white/10"
//       />

//      <button
//   onClick={() => {
//     if (!popupMessage.trim() || !conversationId) return;

//     socket.emit("send-message", {
//       conversationId,
//       senderId: user._id,
//       text: popupMessage,
//     });

//     setPopupMessage("");
//     setOpenMessagePopup(false);

//     // ✅ SHOW REQUEST SENT POPUP
//     setShowRequestPopup(true);
//   }}
//   className="mt-4 w-full h-11 rounded-full text-sm font-medium"
//   style={{ background: GRADIENT }}
// >
//   💬 Send Message
// </button>

//     </>
//   )}

//   {/* ================= HIRE TAB ================= */}
//  {messagePopupTab === "hire" && (
//   <div className="px-4 pb-4 max-h-[70vh] overflow-y-auto hide-scrollbar">

//     <HireForm
//       userName={userName}
//       projectDetails={projectDetails}
//       setProjectDetails={setProjectDetails}
//       budget={budget}
//       setBudget={setBudget}
//       targetDate={targetDate}
//       setTargetDate={setTargetDate}
//       customDateEnabled={customDateEnabled}
//       setCustomDateEnabled={setCustomDateEnabled}
//       selectedDate={selectedDate}
//       setSelectedDate={setSelectedDate}
//       selectedTime={selectedTime}
//       setSelectedTime={setSelectedTime}
//     />
//   </div>
// )}





//   {/* ================= SERVICES TAB ================= */}
// {messagePopupTab === "services" && (
//  <ServicesTab
//   services={services}
//   onSelectService={(service) => {
//     setSelectedService(service);
//     setOpenServicePopup(true);
//   }}
//   onBookNow={handleBookNow}
// />
// )}

// </div>


//       {/* SEND BUTTON */}
    
//     </div>
//   </div>
// )}

// {openServicePopup && selectedService && (
//   <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center">

//     <div className="w-[1100px] max-w-[95%] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0E0F12] border border-white/10 relative">

//       {/* ❌ CLOSE */}
//       <button
//         onClick={() => {
//           setOpenServicePopup(false);
//           setSelectedService(null);
//         }}
//         className="absolute top-4 right-4 text-white/50 hover:text-white z-10"
//       >
//         ✕
//       </button>

//       {/* HERO IMAGE */}
//       <div className="relative h-[360px] rounded-t-2xl overflow-hidden bg-[#1A1A1A]">
//         <img
//   src={
//     selectedService.media?.length
//       ? selectedService.media[0]   // ✅ FIXED
//       : "/services/demo-placeholder.png"
//   }
//   className="w-full h-full object-cover"
// />

//         {/* BADGE */}
//         {selectedService.badge && (
//           <div className="absolute top-6 left-6 px-4 py-1 rounded-full bg-pink-500 text-sm">
//             {selectedService.badge}
//           </div>
//         )}

//         {/* RATING */}
//         <div className="absolute top-6 right-6 flex items-center gap-1 bg-black/70 px-3 py-1 rounded-full text-sm">
//           ⭐ {selectedService.rating}
//         </div>
//       </div>

//       {/* CONTENT */}
//       <div className="p-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">

//         {/* LEFT */}
//         <div>
//           <p className="text-sm text-white/50">
//             {selectedService.category?.name}
//           </p>

//           <h2 className="text-3xl font-semibold mt-2">
//             {selectedService.title}
//           </h2>

//           <h3 className="mt-8 font-semibold">About this Service</h3>
//           <p className="text-white/70 mt-2">
//         {selectedService.description}
//           </p>

//         <h3 className="mt-8 font-semibold">What's Included</h3>

// <ul className="mt-3 space-y-2 text-white/70 list-disc pl-5">
//   {selectedService.screens && <li>{selectedService.screens}</li>}
//   {selectedService.prototype && <li>Prototype: {selectedService.prototype}</li>}
//   {selectedService.fileType && <li>File Type: {selectedService.fileType}</li>}
//   {selectedService.delivery && <li>{selectedService.delivery}</li>}
//   {selectedService.revisions && <li>{selectedService.revisions}</li>}
// </ul>


//           <div className="flex flex-wrap gap-2 mt-6">
//             {selectedService.tags?.map((t: string) => (
//               <span
//                 key={t}
//                 className="px-3 py-1 rounded-full bg-white/10 text-sm"
//               >
//                 {t}
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* RIGHT */}
//         <div className="bg-[#141414] rounded-2xl p-6 h-fit sticky top-6">

//           <p className="text-white/50 text-sm">Starting at</p>
//           <p className="text-3xl font-semibold mt-1">
//             ${selectedService.price}
//           </p>

//           <div className="flex gap-4 text-sm text-white/50 mt-3">
//             <span>⏱ {selectedService.delivery}</span>
//             <span>🔁 {selectedService.revisions}</span>
//           </div>

//           <div className="flex gap-3 mt-6">
//             <button
//               onClick={() => {
//                 setOpenServicePopup(false);
//                 setOpenHirePopup(true);
//               }}
//               className="flex-1 h-11 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 text-sm font-medium"
//             >
//               Hire me
//             </button>

//          <button
//   onClick={() => {
//     setOpenServicePopup(false); // close details popup
//     setOpenBookPopup(true);     // open book-now popup
//   }}
//   className="flex-1 h-11 rounded-full bg-[#2A2A2A] text-sm font-medium"
// >
//   Book Now
// </button>

//           </div>
//         </div>

//       </div>
//     </div>
//   </div>
// )}




//       </main>
//     {/* ✅ GLOBAL REQUEST SENT POPUP */}
// {showRequestPopup && (
//   <RequestSentPopup
//     conversationId={conversationId}
//     onClose={() => setShowRequestPopup(false)}
//   />
// )}

// {openBookPopup && (
//   <BookNowPopup onClose={() => setOpenBookPopup(false)} />
// )}


// {openCreateServicePopup && (
//   <CreateServicePopup
//     onClose={() => setOpenCreateServicePopup(false)}
//     onCreated={(service: any) =>
//       setServices(prev => [service, ...prev])
//     }
//   />
// )}


// {/* ✅ FULL DOCUMENT MODAL */}
// {openDocModal && docPreviewUrl && (
//   <div
//     className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
//     onClick={() => setOpenDocModal(false)}
//   >
//     <div
//       className="relative w-full max-w-[720px] rounded-2xl overflow-hidden bg-[#0E0F12] border border-white/10"
//       onClick={(e) => e.stopPropagation()}
//     >
//       {/* header */}
//       <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
//         <p className="text-white font-semibold text-sm">
//           {kycInfo?.docType === "AADHAAR" ? "Aadhaar Preview" : "Document Preview"}
//         </p>

//         <button
//           onClick={() => setOpenDocModal(false)}
//           className="text-white/60 hover:text-white"
//         >
//           ✕
//         </button>
//       </div>

//       {/* image */}
//       <div className="p-4">
//         <img
//           src={docPreviewUrl}
//           alt="Document"
//           className="w-full max-h-[75vh] object-contain rounded-xl bg-black"
//         />
//       </div>
//     </div>
//   </div>
// )}

//     <div className="relative z-10">
//   <Footer />
// </div>
//     </div>
//   );
// }

// interface HireFormProps {
//   userName: string;
//   projectDetails: string;
//   setProjectDetails: React.Dispatch<React.SetStateAction<string>>;
//   budget: number;
//   setBudget: React.Dispatch<React.SetStateAction<number>>;
//   targetDate: string;
//   setTargetDate: React.Dispatch<React.SetStateAction<string>>;
//   customDateEnabled: boolean;
//   setCustomDateEnabled: React.Dispatch<React.SetStateAction<boolean>>;
//   selectedDate: number | null;
//   setSelectedDate: React.Dispatch<React.SetStateAction<number | null>>;
//   selectedTime: string;
//   setSelectedTime: React.Dispatch<React.SetStateAction<string>>;
// }
// function HireForm({
//   userName,
//   projectDetails,
//   setProjectDetails,
//   budget,
//   setBudget,
//   targetDate,
//   setTargetDate,
//   customDateEnabled,
//   setCustomDateEnabled,
//   selectedDate,
//   setSelectedDate,
//   selectedTime,
//   setSelectedTime,
// }: HireFormProps) 
//  {
//   const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

//   return (
//     <div className="space-y-6">

//       {/* PROJECT DETAILS */}
//       <div>
//         <p className="text-sm font-medium">
//           Project Details <span className="text-white/50">(Minimum 50 characters)</span>
//         </p>
//         <textarea
//           value={projectDetails}
//           onChange={(e) => setProjectDetails(e.target.value)}
//           placeholder="Include any project details, requirements, or goals..."
//           className={`mt-2 w-full h-[110px] rounded-xl bg-[#121212] p-3 text-sm outline-none border ${
//             projectDetails.length < 50 ? "border-red-500" : "border-white/10"
//           }`}
//         />
//         {projectDetails.length < 50 && (
//           <p className="text-xs text-red-500 mt-1">
//             Please provide at least 50 characters.
//           </p>
//         )}
//       </div>

//       {/* BUDGET */}
//       <div>
//         <p className="text-sm font-medium">Project Budget</p>
//         <p className="text-xs text-white/50 mb-2">
//           Minimum ₹1,000 — Maximum ₹50,000
//         </p>

//         <div className="text-center text-xl font-semibold mb-2">₹{budget}</div>

//         <input
//           type="range"
//           min={1000}
//           max={50000}
//           step={500}
//           value={budget}
//           onChange={(e) => setBudget(Number(e.target.value))}
//           className="w-full"
//         />

//         <div className="flex justify-between text-xs text-white/40 mt-1">
//           <span>₹1,000</span>
//           <span>₹50,000</span>
//         </div>
//       </div>

//       {/* TARGET DATE */}
//       <div>
//         <p className="text-sm font-medium mb-2">Target Date</p>
//         <div className="grid grid-cols-2 gap-2">
//           {[
//             ["days", "Within the next few days"],
//             ["weeks", "Within the next few weeks"],
//             ["month", "In a month or more"],
//             ["unsure", "Not sure"],
//           ].map(([v, l]) => (
//             <button
//               key={v}
//               onClick={() => setTargetDate(v)}
//               className={`px-3 py-2 rounded-lg text-sm ${
//                 targetDate === v
//                   ? "text-white"
//                   : "bg-white/10"
//               }`}
//               style={targetDate === v ? { background: GRADIENT } : {}}
//             >
//               {l}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* CUSTOM DATE TOGGLE */}
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium">Custom Date</p>
//           <p className="text-xs text-white/50">
//             Select project completion date
//           </p>
//         </div>

//         <button
//           onClick={() => setCustomDateEnabled(!customDateEnabled)}
//           className={`w-12 h-6 rounded-full p-1 transition ${
//             customDateEnabled ? "bg-purple-500" : "bg-white/20"
//           }`}
//         >
//           <div
//             className={`w-4 h-4 rounded-full bg-white transition ${
//               customDateEnabled ? "translate-x-6" : ""
//             }`}
//           />
//         </button>
//       </div>

//       {/* CALENDAR */}
//       {customDateEnabled && (
//         <div>
//           <p className="text-sm font-medium mb-2">January 2026</p>

//           <div className="grid grid-cols-7 gap-2 text-center text-sm">
//             {["S","M","T","W","T","F","S"].map(d => (
//               <span key={d} className="text-white/40">{d}</span>
//             ))}

//             {[...Array(31)].map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setSelectedDate(i + 1)}
//                 className={`h-9 rounded-full ${
//                   selectedDate === i + 1
//                     ? "text-white"
//                     : "hover:bg-white/10"
//                 }`}
//                 style={selectedDate === i + 1 ? { background: GRADIENT } : {}}
//               >
//                 {i + 1}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* TIME */}
//       <div>
//         <p className="text-sm font-medium mb-2">Available Time</p>
//         <div className="grid grid-cols-4 gap-2">
//           {["09:00 AM","10:00 AM","11:00 AM","12:00 PM"].map(t => (
//             <button
//               key={t}
//               onClick={() => setSelectedTime(t)}
//               className={`py-2 rounded-lg text-sm ${
//                 selectedTime === t ? "bg-white text-black" : "bg-white/10"
//               }`}
//             >
//               {t}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* CONFIRM */}
//       <button
//         disabled={projectDetails.length < 50}
//         className="w-full h-11 rounded-full text-sm font-semibold disabled:opacity-40"
//         style={{ background: GRADIENT }}
//       >
//         Confirm
//       </button>
//     </div>
//   );
// }

// function ServicesTab({
//   services,
//   onSelectService,
//   onBookNow,
// }: {
//   services: Service[];
// onSelectService: (s: Service) => void;
// onBookNow: (s: Service) => void;
// }) {
//   if (services.length === 0) {
//     return <p className="text-white/60">No services created yet.</p>;
//   }

//   const featured = services[0];
//   const rest = services.slice(1);

//   return (
//     <div className="space-y-8">

//       {/* ===== FEATURED SERVICE (TOP CARD) ===== */}
//       <div
//         onClick={() => onSelectService(featured)}
//         className="
//           cursor-pointer
//           relative
//           rounded-2xl
//           bg-gradient-to-br from-[#3A1C71] via-[#D76D77] to-[#FFAF7B]
//           p-6
//           text-white
//         "
//       >
//         {/* BEST VALUE BADGE */}
//         <span className="absolute top-4 right-4 px-3 py-1 text-xs rounded-full bg-blue-600">
//           BEST VALUE
//         </span>

//         <h3 className="text-xl font-semibold mb-1">
//           {featured.title}
//         </h3>

//         <p className="text-sm text-white/80 line-clamp-2 mb-4">
//           {featured.description}
//         </p>

//         {/* TAGS */}
//         <div className="flex gap-2 mb-4 flex-wrap">
//           {featured.screens && (
//             <span className="px-3 py-1 bg-black/30 rounded-full text-xs">
//               {featured.screens}
//             </span>
//           )}
//           {featured.prototype && (
//             <span className="px-3 py-1 bg-black/30 rounded-full text-xs">
//               Prototype
//             </span>
//           )}
//           {featured.fileType && (
//             <span className="px-3 py-1 bg-black/30 rounded-full text-xs">
//               {featured.fileType}
//             </span>
//           )}
//         </div>

//         {/* PRICE + CTA */}
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-xs text-white/70">Starting at</p>
//             <p className="text-2xl font-bold">${featured.price}</p>
//           </div>
// <button
//   onClick={(e) => {
//     e.stopPropagation();      // ⛔ prevent opening service details
//     onBookNow(featured);      // ✅ open SAME BookNowPopup
//   }}
//   className="px-6 py-2 rounded-full text-sm font-semibold"
//   style={{ background: "linear-gradient(90deg,#FF14EF,#1A73E8)" }}
// >
//   Book Now
// </button>
//         </div>
//       </div>

//       {/* ===== ALL SERVICES LIST ===== */}
//       <div className="flex items-center justify-between">
//         <h4 className="font-semibold">All Services</h4>
//         <button className="text-sm text-white/60 flex items-center gap-1">
//           Filter ⏷
//         </button>
//       </div>

//       <div className="space-y-4">
//         {rest.map((service) => (
//           <div
//             key={service._id}
//             onClick={() => onSelectService(service)}
//             className="
//               cursor-pointer
//               flex gap-4
//               rounded-2xl
//               bg-[#151515]
//               border border-white/10
//               p-4
//               hover:border-white/30
//               transition
//             "
//           >
//             {/* IMAGE */}
//             <div className="w-14 h-14 rounded-xl overflow-hidden bg-black">
//               {service.media?.length > 0 && (
//                 <img
//                   src={service.media[0]}
//                   className="w-full h-full object-cover"
//                 />
//               )}
//             </div>

//             {/* CONTENT */}
//             <div className="flex-1">
//               <div className="flex justify-between items-start">
//                 <h5 className="font-semibold line-clamp-1">
//                   {service.title}
//                 </h5>
//                 <span className="text-pink-400 font-semibold">
//                   ${service.price}
//                 </span>
//               </div>

//               <p className="text-xs text-white/60 line-clamp-1">
//                 {service.description}
//               </p>

//               <div className="flex gap-4 mt-2 text-xs text-white/50">
//                 <span>⏱ {service.delivery}</span>
//                 <span>🔁 {service.revisions}</span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//     </div>
//   );
// }

 

// function ServiceItem({ title, price, days, revisions, onClick }: any) {
//   return (
//     <div
//       onClick={onClick}
//       className="
//         cursor-pointer
//         flex gap-4 p-4 rounded-2xl
//         bg-[#151515]
//         border border-white/10
//         hover:border-white/30
//         hover:bg-[#1A1A1A]
//         transition
//       "
//     >
//       <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500" />

//       <div className="flex-1">
//         <div className="flex justify-between">
//           <h5 className="font-semibold">{title}</h5>
//           <span className="text-pink-400 font-semibold">{price}</span>
//         </div>

//         <div className="flex gap-4 mt-2 text-xs text-white/50">
//           <span>⏱ {days}</span>
//           <span>🔁 {revisions}</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// function RequestSentPopup({
//   onClose,
//   conversationId,
// }: {
//   onClose: () => void;
//   conversationId: string | null;
// }) {
//   const navigate = useNavigate();

//   return (
//     <div className="fixed inset-0 z-[99999] bg-black/70 flex items-start justify-center pt-24">
//       <div className="w-[420px] bg-[#121212] rounded-xl p-6 relative shadow-xl border border-white/10">

//         {/* CLOSE */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-white/40 hover:text-white"
//         >
//           ✕
//         </button>

//         {/* 🔥 GRADIENT BADGE */}
//         <div
//           className="w-9 h-9 rounded-full flex items-center justify-center mb-4"
//           style={{
//             background:
//               "linear-gradient(180deg, #FF14EF 0%, #1A73E8 100%)",
//           }}
//         >
//           <LuBadgeCheck className="text-white text-[18px]" />
//         </div>

//         {/* TITLE */}
//         <h3 className="text-lg font-semibold mb-2">
//           Your request was sent!
//         </h3>

//         {/* DESCRIPTION */}
//         <p className="text-sm text-white/60 mb-4">
//           Check out these other services that may be a good fit for your project.
//         </p>

//         {/* CTA */}
//         <button
//           onClick={() => {
//             onClose();
//             navigate("/chat");
//           }}
//           className="text-sm font-medium underline text-white hover:text-white/80"
//         >
//           View Message
//         </button>
//       </div>
//     </div>
//   );
// }


// function BookNowPopup({ onClose }: { onClose: () => void }) {
//   const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

//   const [targetDate, setTargetDate] = useState("weeks");
//   const [customDateEnabled, setCustomDateEnabled] = useState(true);
//   const [selectedDate, setSelectedDate] = useState(6);
//   const [selectedTime, setSelectedTime] = useState("11:00 AM");

//   return (
//     <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center">
//       <div className="w-[420px] rounded-2xl bg-[#0E0F12] text-white border border-white/10">

//         {/* HEADER */}
//         <div className="flex items-start justify-between p-4 border-b border-white/10">
//           <div>
//             <p className="font-semibold">Connect with BitePal —</p>
//             <p className="text-xs text-white/60">Responds in about 1 hour</p>
//           </div>
//           <button onClick={onClose} className="text-white/60 hover:text-white">
//             ✕
//           </button>
//         </div>

//         {/* BODY */}
//         <div className="p-4 space-y-6 max-h-[75vh] overflow-y-auto hide-scrollbar">

//           {/* TARGET DATE */}
//           <div>
//             <p className="text-sm font-medium mb-2">Target Date</p>
//             <div className="grid grid-cols-2 gap-2">
//               {[
//                 ["days", "Within the next few days"],
//                 ["weeks", "Within the next few weeks"],
//                 ["month", "In a month or more"],
//                 ["unsure", "Not sure"],
//               ].map(([v, label]) => (
//                 <button
//                   key={v}
//                   onClick={() => setTargetDate(v)}
//                   className="px-3 py-2 rounded-lg text-sm"
//                   style={targetDate === v ? { background: GRADIENT } : { background: "#1A1A1A" }}
//                 >
//                   {label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* CUSTOM DATE */}
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium">Custom Date</p>
//               <p className="text-xs text-white/50">
//                 Select project completion date
//               </p>
//             </div>

//             <button
//               onClick={() => setCustomDateEnabled(!customDateEnabled)}
//               className={`w-12 h-6 rounded-full p-1 transition ${
//                 customDateEnabled ? "bg-purple-500" : "bg-white/20"
//               }`}
//             >
//               <div
//                 className={`w-4 h-4 rounded-full bg-white transition ${
//                   customDateEnabled ? "translate-x-6" : ""
//                 }`}
//               />
//             </button>
//           </div>

//           {/* CALENDAR */}
//           {customDateEnabled && (
//             <div>
//               <p className="text-sm font-medium mb-2">January 2026</p>

//               <div className="grid grid-cols-7 gap-2 text-center text-sm">
//                 {["S","M","T","W","T","F","S"].map(d => (
//                   <span key={d} className="text-white/40">{d}</span>
//                 ))}

//                 {[...Array(31)].map((_, i) => (
//                   <button
//                     key={i}
//                     onClick={() => setSelectedDate(i + 1)}
//                     className={`h-9 rounded-full ${
//                       selectedDate === i + 1 ? "text-white" : "hover:bg-white/10"
//                     }`}
//                     style={selectedDate === i + 1 ? { background: GRADIENT } : {}}
//                   >
//                     {i + 1}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* TIME */}
//           <div>
//             <p className="text-sm font-medium mb-2">Available Time</p>
//             <div className="grid grid-cols-4 gap-2">
//               {["09:00 AM","10:00 AM","11:00 AM","12:00 PM"].map(t => (
//                 <button
//                   key={t}
//                   onClick={() => setSelectedTime(t)}
//                   className={`py-2 rounded-lg text-sm ${
//                     selectedTime === t
//                       ? "bg-white text-black"
//                       : "bg-white/10"
//                   }`}
//                 >
//                   {t}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* FOOTER */}
//         <div className="p-4 border-t border-white/10">
//           <button
//             className="w-full h-11 rounded-full text-sm font-semibold text-white"
//             style={{ background: GRADIENT }}
//             onClick={onClose}
//           >
//             Confirm
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// function CreateNewServiceCard({ onClick }: { onClick: () => void }) {
//   return (
//     <div
//       onClick={onClick}
//       className="
//         w-full max-w-[520px]
//         rounded-2xl
//         bg-[#141414]
//         border border-white/10
//         p-8
//         flex flex-col items-center
//         justify-center
//         text-center
//         cursor-pointer
//         hover:border-white/30
//         hover:bg-[#1A1A1A]
//         transition
//       "
//     >
//       {/* PLUS ICON */}
//       <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-blue-500 flex items-center justify-center mb-4">
//         <span className="text-white text-3xl leading-none">+</span>
//       </div>

//       <h3 className="text-lg font-semibold text-white mb-1">
//         Create New Service
//       </h3>

//       <p className="text-sm text-white/60 max-w-[360px]">
//         Add a service to show clients what you offer and make booking you easy.
//         <span className="underline ml-1 cursor-pointer">Learn more</span>
//       </p>
//     </div>
//   );
// }


// function CreateServicePopup({
//   onClose,
//   onCreated,
// }: {
//   onClose: () => void;
//   onCreated: (service: Service) => void;
// }) {


//   // ===== CREATE SERVICE FORM STATE =====
// const [serviceTitle, setServiceTitle] = useState("");
// const [serviceCategory, setServiceCategory] = useState("");
// const [serviceSubCategory, setServiceSubCategory] = useState("");
// const [serviceDescription, setServiceDescription] = useState("");
// const [servicePrice, setServicePrice] = useState("");

// const [serviceFiles, setServiceFiles] = useState<File[]>([]);
// const [servicePreview, setServicePreview] = useState<string[]>([]);
// const [screens, setScreens] = useState("");
// const [services, setServices] = useState<any[]>([]);
// const [creatingService, setCreatingService] = useState(false);

// // ADD THESE ✅
// const [prototype, setPrototype] = useState("");
// const [fileType, setFileType] = useState("");
// const [delivery, setDelivery] = useState("");
// const [revisions, setRevisions] = useState("");

// // ===== CATEGORY STATE =====
// const [categories, setCategories] = useState<Category[]>([]);
// const [subCategories, setSubCategories] = useState<Category[]>([]);

//  const { user, token } = useAuth() as any;


// useEffect(() => {
//   fetch(`${API_BASE}/api/category`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   })
//     .then(res => res.json())
//     .then(data => {
//       if (data?.categories) {
//         setCategories(data.categories.slice(0, 10)); // 🔥 only 10
//       }
//     })
//     .catch(err => console.error("Category load error", err));
// }, [token]);


// useEffect(() => {
//   if (!serviceCategory) return;

//   fetch(`${API_BASE}/api/category/${serviceCategory}/subcategories`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   })
//     .then(res => res.json())
//     .then(data => {
//       if (data?.subCategories) {
//         setSubCategories(data.subCategories.slice(0, 10)); // 🔥 only 10
//       }
//     })
//     .catch(err => console.error("Subcategory load error", err));
// }, [serviceCategory, token]);

//   return (
//     <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
//       <div className="w-[640px] max-w-[95%] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0E0F12] border border-white/10 p-6 relative">

//         {/* CLOSE */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-white/50 hover:text-white"
//         >
//           ✕
//         </button>

//         <h2 className="text-xl font-semibold mb-6">Service Details</h2>

//         {/* FORM */}
//         <div className="space-y-4">

//          <Input
//   label="Service Title"
//   placeholder="e.g. I will design..."
//   value={serviceTitle}
// onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//   setServiceTitle(e.target.value)
// }
// />


//         <div>
//   <label className="text-sm text-white/70">Category</label>
//   <select
//     value={serviceCategory}
//     onChange={(e) => {
//       setServiceCategory(e.target.value);
//       setServiceSubCategory(""); // reset subcategory
//     }}
//     className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10"
//   >
//     <option value="">Select Category</option>
//     {categories.map(cat => (
//       <option key={cat._id} value={cat._id}>
//         {cat.name}
//       </option>
//     ))}
//   </select>
// </div>
//           {/* <div>
//   <label className="text-sm text-white/70">Sub-Category</label>
//   <select
//     value={serviceSubCategory}
//     onChange={(e) => setServiceSubCategory(e.target.value)}
//     disabled={!serviceCategory}
//     className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10 disabled:opacity-40"
//   >
//     <option value="">
//       {serviceCategory ? "Select Sub-Category" : "Select category first"}
//     </option>

//     {subCategories.map(sub => (
//       <option key={sub._id} value={sub._id}>
//         {sub.name}
//       </option>
//     ))}
//   </select>
// </div> */}
//                  <Textarea
//   label="Service Description"
//   placeholder="Describe your service..."
//   value={serviceDescription}
//   onChange={(e: any) => setServiceDescription(e.target.value)}
// />
             

//        <div>
//   <label className="text-sm text-white/70">Screens</label>
//   <select
//     value={screens}
//     onChange={(e) => setScreens(e.target.value)}
//     className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10"
//   >
//     <option value="">Select Screens</option>
//     <option value="5 Screens">5 Screens</option>
//     <option value="10 Screens">10 Screens</option>
//     <option value="21 Screens">21 Screens</option>
//     <option value="Unlimited Screens">Unlimited Screens</option>
//   </select>
// </div>
//             <div>
//   <label className="text-sm text-white/70">Prototype</label>
//   <select
//     value={prototype}
//     onChange={(e) => setPrototype(e.target.value)}
//     className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10"
//   >
//     <option value="">Select Prototype</option>
//     <option value="Yes">Yes</option>
//     <option value="No">No</option>
//   </select>
// </div>
//           <div>
//   <label className="text-sm text-white/70">File Type</label>
//   <select
//     value={fileType}
//     onChange={(e) => setFileType(e.target.value)}
//     className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10"
//   >
//     <option value="">Select File Type</option>
//     <option value="Source File">Source File</option>
//     <option value="JPG">JPG</option>
//     <option value="PNG">PNG</option>
//     <option value="Figma">Figma</option>
//   </select>
// </div>
//         <div>
//   <label className="text-sm text-white/70">Delivery</label>
//   <select
//     value={delivery}
//     onChange={(e) => setDelivery(e.target.value)}
//     className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10"
//   >
//     <option value="">Select Delivery Time</option>
//     <option value="3 Days Delivery">3 Days Delivery</option>
//     <option value="7 Days Delivery">7 Days Delivery</option>
//     <option value="14 Days Delivery">14 Days Delivery</option>
//   </select>
// </div>
//         <div>
//   <label className="text-sm text-white/70">Revisions</label>
//   <select
//     value={revisions}
//     onChange={(e) => setRevisions(e.target.value)}
//     className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10"
//   >
//     <option value="">Select Revisions</option>
//     <option value="1 Revision">1 Revision</option>
//     <option value="2 Revisions">2 Revisions</option>
//     <option value="3 Revisions">3 Revisions</option>
//     <option value="Unlimited Revisions">Unlimited Revisions</option>
//   </select>
// </div>

//              <Input
//   label="Price *"
//   placeholder="Enter selling price"
//   value={servicePrice}
//   onChange={(e: any) => setServicePrice(e.target.value)}
// />


//           {/* GALLERY */}
//          <div className="mt-6 border border-dashed border-white/20 rounded-xl p-6 text-center">

//   <p className="text-sm text-white/70 mb-2">
//     Drag & Drop your creative works
//   </p>

//   <p className="text-xs text-white/40 mb-4">
//     Supports JPG, PNG, MP4 up to 50MB
//   </p>

//   {/* HIDDEN FILE INPUT */}
//   <input
//     type="file"
//     multiple
//     accept="image/*,video/mp4"
//     id="service-media"
//     className="hidden"
//     onChange={(e) => {
//       const selected = Array.from(e.target.files || []);
//       setServiceFiles(selected);
//       setServicePreview(selected.map(f => URL.createObjectURL(f)));
//     }}
//   />

//   <label
//     htmlFor="service-media"
//     className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 text-sm cursor-pointer"
//   >
//     Browse Files
//   </label>

//   {/* PREVIEW */}
//   {servicePreview.length > 0 && (
//     <div className="flex gap-3 mt-4 flex-wrap justify-center">
//       {servicePreview.map((src, i) => (
//         <img
//           key={i}
//           src={src}
//           className="w-20 h-20 object-cover rounded-lg border border-white/10"
//         />
//       ))}
//     </div>
//   )}
// </div>


//           {/* ACTIONS */}
//           <div className="flex justify-between mt-8">
//             <button className="px-6 py-2 rounded-full bg-white/10 text-sm">
//               Save Draft
//             </button>
//              <button
//   disabled={creatingService}
//   onClick={async () => {
//     if (!serviceTitle || !serviceDescription || !servicePrice || !serviceCategory) {
//       alert("Fill all required fields");
//       return;
//     }

//     setCreatingService(true);

//     const formData = new FormData();
//     formData.append("title", serviceTitle);
//     formData.append("description", serviceDescription);
//     formData.append("price", servicePrice);
//     formData.append("category", serviceCategory);
//     formData.append("prototype", prototype);
//     formData.append("fileType", fileType);
//     formData.append("delivery", delivery);
//     formData.append("revisions", revisions);
//     formData.append("screens", screens);
//     serviceFiles.forEach(file => {
//       formData.append("media", file);
//     });

//     try {
//       const res = await fetch(`${API_BASE}/api/services/create`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       const data = await res.json();

//       if (!data?.success) {
//         alert("Failed to create service");
//         return;
//       }

//       // 🔥 THIS IS WHAT YOU WERE MISSING
//       onCreated(data.service);

//       onClose();

//       // reset
//       setServiceTitle("");
//       setServiceDescription("");
//       setServicePrice("");
//       setServiceFiles([]);
//       setServicePreview([]);

//     } catch (err) {
//       console.error("Create service error", err);
//     } finally {
//       setCreatingService(false);
//     }
//   }}
//   className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 text-sm disabled:opacity-40"
// >
//   {creatingService ? "Publishing..." : "Publish Service"}
// </button>

          
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }



// function Input({ label, ...props }: any) {
//   return (
//     <div>
//       <label className="text-sm text-white/70">{label}</label>
//       <input
//         {...props}
//         className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm outline-none border border-white/10"
//       />
//     </div>
//   );
// }
// function Select({ label, placeholder }: any) {
//   return (
//     <div>
//       <label className="text-sm text-white/70">{label}</label>
//       <select className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10">
//         <option>{placeholder}</option>
//       </select>
//     </div>
//   );
// }

// function Textarea({ label, ...props }: any) {
//   return (
//     <div>
//       <label className="text-sm text-white/70">{label}</label>
//       <textarea
//         {...props}
//         className="mt-1 w-full h-[120px] rounded-xl bg-[#121212] p-4 text-sm outline-none border border-white/10"
//       />
//     </div>
//   );
// }







import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  Camera,
  MapPin,
  Briefcase,
  MessageCircle,
  Pencil,
  Landmark,
  Video,
} from "lucide-react";
import SellerLinkedAccountForm from "@/components/SellerLinkedAccountForm";
// The cards here are the marketplace's, so the panel that opens from them is
// the marketplace's too — same details, same Add to Cart, same purchase rules.
import DetailsPrompt from "@/components/DetailsPrompt";
// Video listings get the marketplace's 9:16 reel card, image listings the
// .mp-card — same split, and the same component, as the marketplace grid.
import VideoReelCard from "@/components/VideoReelCard";
import { useCart } from "@/contexts/CartContext";
import "./PromptMarketplace.css"; // reuse the marketplace .mp-card / .reel-card design
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { LuBadgeCheck } from "react-icons/lu"; 
import { CiMenuKebab } from "react-icons/ci";
import { FiPhone, FiVideo } from "react-icons/fi";

import { socket } from "@/lib/socket"; // or wherever you initialize socket.io
import {
  getPublicFreelancerProfile,
  getMyFreelancerProfile,
  activateFreelancerProfile,
  getSpecializations,
  type FreelancerProfile as OwnFreelancerProfile,
  type PublicFreelancerProfile,
  type SpecializationGroup,
} from "@/lib/freelancerApi";
import FreelancerProfileBody, {
  FreelancerFactsCard,
  ProfileStrengthCard,
  DraftNoticeCard,
} from "@/components/freelancer/FreelancerProfileBody";
import FreelancerSectionEditor, {
  type EditableSection,
} from "@/components/freelancer/FreelancerSectionEditor";
import BecomeFreelancerWizard from "@/components/BecomeFreelancerWizard";
import BriefAttachmentPicker from "@/components/escrow/BriefAttachmentPicker";
import ReviewSection, { WriteReviewButton } from "@/components/escrow/ReviewSection";
import type { BriefAttachment } from "@/lib/escrowApi";
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";
  const kpiCardBase =
  "rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.03] border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";


const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US");
};

const getMonthLabel = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

type Prompt = {
  id: string;
  title: string;
  description: string;
  category: string;
  price?: number;
  imageUrl?: string;
  videoUrl?: string;
  isFree?: boolean;
  // Everything below is read by the details panel rather than the card — the
  // same shape the marketplace's mapPromptDoc produces, so the panel behaves
  // identically wherever it's opened from.
  tokunPrice?: number;
  rating?: number;
  downloads?: number;
  fullPrompt?: string;
  exclusive?: boolean;
  sold?: boolean;
  sellerVerificationPending?: boolean;
  uploaderId?: string | null;
  uploaderName?: string;
};



interface AuthUser {
  _id: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  persistAuth: (data: Partial<AuthContextType>) => void;
}


interface Service {
  _id: string;
  title: string;
  description: string;
  price: number;
  delivery?: string;
  revisions?: string;
  screens?: string;
  prototype?: string;
  fileType?: string;
  media?: string[];
  tags?: string[];
  badge?: string;
  rating?: number;
  category?: {
    _id: string;
    name: string;
  };
}

interface Category {
  _id: string;
  name: string;
}

interface ChatMessage {
  _id?: string;
  senderId: string;
  text: string;
  createdAt?: string;
}

export default function ProfilePage() {
  // const { userId } = useParams();
   const { userId } = useParams<{ userId: string }>();
  // const { user, token } = useAuth() as any;
   const { user, token, persistAuth } = useAuth() as AuthContextType;
   const location = useLocation();

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [openMenu,setOpenMenu] = useState("")
const [activeTab, setActiveTab] = useState<"message" | "services">("message");

const [showPopup, setShowPopup] = useState(false);
const [popupTab, setPopupTab] = useState<"message" | "hire">("message");

const [showRequestPopup, setShowRequestPopup] = useState(false);
const [openBookPopup, setOpenBookPopup] = useState(false);

const [openHirePopup, setOpenHirePopup] = useState(false);

useEffect(() => {
  if ((location.state as any)?.openHire) {
    setOpenHirePopup(true);
  }
}, [location.state]);

const [openMessagePopup, setOpenMessagePopup] = useState(false);
const [popupMessage, setPopupMessage] = useState("");

const [targetDate, setTargetDate] = useState("weeks"); // days | weeks | month | unsure
const [customDateEnabled, setCustomDateEnabled] = useState(false);

const [selectedDate, setSelectedDate] = useState<number | null>(6);
const [selectedTime, setSelectedTime] = useState("11:00 AM");
const [openServicePopup, setOpenServicePopup] = useState(false);
// const [selectedService, setSelectedService] = useState<any>(null);
const [openCreateServicePopup, setOpenCreateServicePopup] = useState(false);
const isOwnProfile = userId === user?._id;

/* Admin preview mode (`?adminView=1`). The freelancer review dashboard links
   here to check a profile before approving its intro video, and it opened the
   full logged-in site chrome around it — the site nav, and an account menu with
   a Logout item belonging to whatever session the browser had. An admin looking
   at someone else's profile got a page that looked like it was theirs.

   In this mode the header and footer are replaced by a strip that says whose
   profile this is and where it came from. */
const isAdminView = new URLSearchParams(location.search).get("adminView") === "1";

const fileRef = useRef<HTMLInputElement | null>(null);
const [avatar, setAvatar] = useState<string | null>(null);

const [kycInfo, setKycInfo] = useState<{
  kycStatus: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED" | "FLAGGED";
  docType: "AADHAAR" | "PASSPORT" | null;
  verifiedAt: string | null;
} | null>(null);


const [projectTitle, setProjectTitle] = useState("");
const [deliveryPreference, setDeliveryPreference] = useState<
  "required" | "complete"
>("complete");

// (The Hire popup used to be tabbed — Hire / Message / Services — and carried
// an `activeHireTab` state to switch between them. It only does Hire now, so
// there is nothing left to switch.)


// Used by the kebab menu's "Report" entry, which routes to support.
const navigate = useNavigate();

/* ── Freelancer profile ──
   Two sources, because the owner and a viewer are entitled to different things:

   `freelancer`  — the public read. Null unless the profile is ACTIVE, so a
                   viewer can never see a half-finished one.
   `ownProfile`  — the full document, fetched only on your own profile. Carries
                   the Profile Strength checklist, what's still missing, the
                   intro video's review state and the video rules, none of which
                   belong in a public payload.

   On your own profile `ownProfile` is what renders, so a DRAFT is visible to you
   (with a "not visible yet" notice) while showing nothing to anyone else. */
const [freelancer, setFreelancer] = useState<PublicFreelancerProfile | null>(null);
const [ownProfile, setOwnProfile] = useState<OwnFreelancerProfile | null>(null);
// Distinguishes "haven't looked yet" from "looked, no profile" — the wizard
// needs the difference to know whether it can skip its loading spinner.
const [ownProfileLoaded, setOwnProfileLoaded] = useState(false);
const [freelancerEligible, setFreelancerEligible] = useState(true);

// Which section's editor is open. A dialog rather than scrolling the page to a
// section — see the note in FreelancerSectionEditor.
const [editorSection, setEditorSection] = useState<EditableSection | null>(null);
const [specGroups, setSpecGroups] = useState<SpecializationGroup[]>([]);
const [publishing, setPublishing] = useState(false);
const [wizardOpen, setWizardOpen] = useState(false);
// Set when the "Upload a profile photo" checklist row is clicked: the avatar
// control is in the header, so that row rings it instead of opening a dialog.
const [photoHighlight, setPhotoHighlight] = useState(false);
// Payout setup, reached from the sidebar prompt. The same form prompt-sellers
// use — it skips itself when a linked account already exists, because there is
// only one per seller and it covers both freelancing and prompt selling.
const [payoutFormOpen, setPayoutFormOpen] = useState(false);
// Guards the Message button while the conversation is being opened.
const [openingChat, setOpeningChat] = useState(false);

useEffect(() => {
  if (!userId) return;
  let cancelled = false;

  getPublicFreelancerProfile(userId).then((res) => {
    if (cancelled) return;
    setFreelancer(res.ok ? res.data.profile : null);
    // Money for a hire routes to this person's Razorpay linked account and is
    // held there, so an unverified account means a proposal they physically
    // cannot accept. Hire is disabled on this; Message deliberately isn't.
    setPayoutReady(res.ok ? Boolean(res.data.payoutReady) : false);
    // The second condition on the same button: an approved intro video (or an
    // allowlisted account). create-proposal refuses without it.
    setSuperCreator(res.ok ? Boolean(res.data.superCreator) : false);
  });

  return () => {
    cancelled = true;
  };
}, [userId]);

const loadOwnFreelancer = useCallback(async () => {
  if (!token || userId !== user?._id) return;

  const res = await getMyFreelancerProfile(token);
  if (!res.ok) return;

  setFreelancerEligible(res.data.eligible !== false);
  setOwnProfile(res.data.profile);
  setOwnProfileLoaded(true);
}, [token, userId, user?._id]);

useEffect(() => {
  loadOwnFreelancer();
}, [loadOwnFreelancer]);

// Only needed by the specializations editor, so it's fetched alongside rather
// than blocking anything.
useEffect(() => {
  if (userId !== user?._id) return;
  getSpecializations(token).then((res) => {
    if (res.ok) setSpecGroups(res.data.grouped || []);
  });
}, [userId, user?._id, token]);

const publishFreelancerProfile = async () => {
  setPublishing(true);
  const res = await activateFreelancerProfile(token);
  setPublishing(false);

  if (!res.ok) {
    toast({
      title: res.message || "Couldn't publish your profile",
      description: res.errors?.length ? res.errors.join(" ") : undefined,
    });
    return;
  }
  setOwnProfile(res.data.profile);
  // The public read now returns something, so refresh it too — otherwise the
  // page would still think this profile isn't published.
  if (userId) {
    const pub = await getPublicFreelancerProfile(userId);
    if (pub.ok) setFreelancer(pub.data.profile);
  }
  // Same correction as the wizard's success screen: live means findable, not
  // hireable — that waits on the intro video being approved.
  toast({
    title: "Your profile is live",
    description: res.data.profile?.superCreator
      ? "Buyers can now find and hire you."
      : "Buyers can find and message you. Services and hiring unlock once your intro video is approved.",
  });
};

const focusAvatar = () => {
  setPhotoHighlight(true);
  fileRef.current?.click();
  window.setTimeout(() => setPhotoHighlight(false), 2000);
};

/* Which freelancer record the page renders.
   On your own profile the full document wins, so a DRAFT is visible to you while
   the public read still returns nothing for everyone else. */
const displayedFreelancer = useMemo(
  () => (isOwnProfile ? ownProfile : freelancer),
  [isOwnProfile, ownProfile, freelancer]
);

// Set from the public profile fetch above. Both start true so the Hire button
// doesn't flash a disabled state on every profile before the answer arrives.
const [payoutReady, setPayoutReady] = useState(true);
// Their intro video is approved (or they're allowlisted), so they're cleared to
// take on work. Same rule the directory badges and the proposal endpoint use.
const [superCreator, setSuperCreator] = useState(true);

/* One answer for the whole page, from whichever read owns this profile: your
   own document when it's yours (so the badge updates the moment a video is
   approved and /me is refetched), the public read otherwise. Both carry the
   same server-computed flag, so the two paths can't disagree. */
const isSuperCreator = isOwnProfile
  ? Boolean(ownProfile?.superCreator)
  : superCreator;

// Bumped after posting a review so the list below remounts and picks it up,
// rather than the new review only appearing on a full reload.
const [reviewsVersion, setReviewsVersion] = useState(0);

const locationLine = useMemo(() => {
  const parts = [displayedFreelancer?.city, displayedFreelancer?.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "";
}, [displayedFreelancer]);


useEffect(() => {
  if (!userId) return;
fetch(`${API_BASE}/api/kyc/public/${userId}`)
    .then((r) => r.json())
    .then((data) => {
      if (!data?.success) return;
     setKycInfo({
  kycStatus: data.kycStatus || "NOT_SUBMITTED",
  docType: data.docType || null,
  verifiedAt: data.verifiedAt || null,
});

    })
    .catch(() => {});
}, [userId]);




useEffect(() => {
  // Only the logged-in user's OWN avatar should come from AuthContext —
  // otherwise viewing someone else's profile would show the viewer's own
  // photo instead of the profile owner's (see the prompts-fetch effect
  // below for how another user's avatar gets loaded instead).
  if (userId !== user?._id) return;
  /* `user.avatar` was never in the auth payload — only `avatarUrl` is — so this
     branch never ran and "My Account" showed an empty frame no matter how many
     times the picture was uploaded. uploadedAvatar() takes the whole user and
     checks both names, so it works whichever one an endpoint sends. */
  const own = uploadedAvatar(user);
  if (own) setAvatar(own);
}, [user, userId]);
 
const [messagePopupTab, setMessagePopupTab] = useState<
  "message" | "hire" | "services"
>("message");


const [showHireCalendar, setShowHireCalendar] = useState(false);

const [hireDate, setHireDate] = useState(() => toDateValue(new Date()));

const [hireCalendarMonth, setHireCalendarMonth] = useState(() => {
  const today = new Date();
  today.setDate(1);
  today.setHours(0, 0, 0, 0);
  return today;
});


// Seeded from ?tab= so a service card in the directory can land on the Services
// tab rather than dropping the visitor on Prompts and making them find it.
// Read once, at first render, so it can't fight a later click on the tabs.
const [activeProfileTab, setActiveProfileTab] = useState<"work" | "services">(() => {
  const requested = new URLSearchParams(window.location.search).get("tab");
  return requested === "services" ? "services" : "work";
});

// Both grids show one row (3 cards) by default and grow a row at a time, so a
// profile with 40 prompts doesn't bury the reviews under an endless wall.
const PAGE_STEP = 3;
const [promptsShown, setPromptsShown] = useState(PAGE_STEP);
const [servicesShown, setServicesShown] = useState(PAGE_STEP);

// Landing on a different profile starts both lists collapsed again — the route
// changes without remounting, so an expanded grid would otherwise carry over.
useEffect(() => {
  setPromptsShown(PAGE_STEP);
  setServicesShown(PAGE_STEP);
}, [userId]);

// Clicking a prompt card opens the marketplace's details panel.
const [detailsPrompt, setDetailsPrompt] = useState<Prompt | null>(null);
const [detailsOpen, setDetailsOpen] = useState(false);

// One reel plays at a time, same as the marketplace grid — tapping a second
// card stops the first rather than leaving a wall of running videos.
const [playingVideo, setPlayingVideo] = useState<string | number | null>(null);
const { addToCart } = useCart();

// Ids the viewer already owns, so the panel says "Purchased" instead of
// offering to sell them a prompt twice. Same source as the marketplace.
const [purchasedPromptIds, setPurchasedPromptIds] = useState<string[]>([]);

useEffect(() => {
  if (!token) return;
  let cancelled = false;

  (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/purchase/history`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const body = await res.json().catch(() => ({}));
      if (cancelled || !res.ok || !body?.success) return;

      const ownedIds = (body.purchases || [])
        .map((p: any) =>
          p?.prompt && typeof p.prompt === "object"
            ? String(p.prompt._id)
            : typeof p?.prompt === "string"
              ? p.prompt
              : null,
        )
        .filter(Boolean) as string[];

      setPurchasedPromptIds(ownedIds);
    } catch {
      // Not fatal — the panel just can't show the "Purchased" state, and the
      // purchase route still rejects a duplicate buy.
    }
  })();

  return () => {
    cancelled = true;
  };
}, [token]);
// ===== CREATE SERVICE FORM STATE =====
const [serviceTitle, setServiceTitle] = useState("");
// const [serviceCategory, setServiceCategory] = useState("");
// const [serviceSubCategory, setServiceSubCategory] = useState("");
const [serviceDescription, setServiceDescription] = useState("");
const [servicePrice, setServicePrice] = useState("");

const [serviceFiles, setServiceFiles] = useState<File[]>([]);
const [servicePreview, setServicePreview] = useState<string[]>([]);

// const [services, setServices] = useState<any[]>([]);
const [creatingService, setCreatingService] = useState(false);
// message
const [messageText, setMessageText] = useState("");
const [services, setServices] = useState<Service[]>([]);
// Starts true so the first paint shows a placeholder instead of a confident "0".
const [servicesLoading, setServicesLoading] = useState(true);
/* The Prompts/Services block, so the action button up in the header can bring
   the visitor to it. The services were already on this page, but only reachable
   by scrolling down and finding the right tab — which is why nobody found
   them. */
const servicesSectionRef = useRef<HTMLElement | null>(null);
const [selectedService, setSelectedService] = useState<Service | null>(null);
const [messages, setMessages] = useState<ChatMessage[]>([]);

// hire
const [projectDetails, setProjectDetails] = useState("");
// Reference files for the hire brief. Uploaded as they're picked; the
// descriptors go out with the proposal.
const [hireBriefFiles, setHireBriefFiles] = useState<BriefAttachment[]>([]);
/* Proposal submission in flight. The ref is the actual guard against a double
   click; the state only drives the button's label and disabled attribute. */
const [hiring, setHiring] = useState(false);
const hiringRef = useRef(false);
const [budget, setBudget] = useState(27000);
const [customDate, setCustomDate] = useState(false);

const menuRef = useRef<HTMLDivElement | null>(null);
const [openChat, setOpenChat] = useState(false);
// const [isExpanded, setIsExpanded] = useState(false);

const [conversationId, setConversationId] = useState<string | null>(null);
// const [messages, setMessages] = useState<any[]>([]);
const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    if (!userId) return;

    const viewingOwnUploads = userId === user?._id;

    const endpoint = viewingOwnUploads
      ? `${API_BASE}/api/prompt/my`
      : `${API_BASE}/api/prompt/user/${userId}`;

    fetch(endpoint, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.success) return;

          const mapped = (data.prompts || []).map((doc: any) => {
  const att = doc?.attachment;

  // ✅ Azure already returns FULL URL
 const imageUrl =
  att?.type === "image" && att?.path
    ? att.path
    : undefined;

const videoUrl =
  att?.type === "video" && att?.path
    ? att.path
    : undefined;

return {
  id: doc._id,
  title: doc.title,
  description: doc.description,
  category:
    doc.categories?.[0]?.name ||
    (Array.isArray(doc.categories)
      ? doc.categories.join(", ")
      : "General"),
  price: Number(doc.price || 0),
  // What the buyer is actually charged (list price + platform fee). Falls back
  // to the list price so a listing saved before the tokun_price hook existed
  // doesn't open the panel showing ₹0.
  tokunPrice:
    Number(doc.tokun_price || 0) > 0 ? Number(doc.tokun_price) : Number(doc.price || 0),
  rating: typeof doc.averageRating === "number" ? doc.averageRating : undefined,
  // Only carried for your own uploads. /api/prompt/user/:id happens to return
  // promptText for everyone's listings too, but there's no reason to hold
  // another seller's paid content in this page's state.
  fullPrompt: viewingOwnUploads ? doc.promptText || undefined : undefined,
  imageUrl,
  videoUrl,
  isFree: !!doc.free,
  exclusive: !!doc.exclusive,
  sold: !!doc.sold,
  sellerVerificationPending: !!doc.sellerVerificationPending,
  uploaderId: doc?.userId?._id || doc?.userId || null,
  uploaderName: doc?.userId?.name || undefined,
};
});

        setPrompts(mapped);
        setUserName(data.user?.name || user?.name || "");

        // Viewing someone else's profile — their avatar comes from this
        // fetch (not AuthContext, which only ever holds the viewer's own).
        if (userId !== user?._id && data.user?.avatarUrl) {
          const url = data.user.avatarUrl;
          setAvatar(url.startsWith("http") ? url : API_BASE + url);
        }
      })
      .finally(() => setLoading(false));
  }, [userId, user, token]);

   // Loaded on mount, not on tab open: the header stat and the tab label both
   // print services.length, so deferring the fetch until the Services tab was
   // clicked made an existing seller's profile read as "0 Services".
   useEffect(() => {
  if (!userId) return;

  const isOwn = userId === user?._id;
  const endpoint = isOwn
    ? `${API_BASE}/api/services/my`           // own profile
    : `${API_BASE}/api/services/user/${userId}`; // other profile

  // Guards against a slow response for a previous profile landing after the
  // route has already moved on to another one.
  let cancelled = false;
  setServicesLoading(true);

  fetch(endpoint, {
    headers: isOwn ? { Authorization: `Bearer ${token}` } : undefined,
  })
    .then(res => res.json())
    .then(data => {
      if (cancelled) return;
      setServices(data?.services || []);
    })
    .catch(err => {
      if (!cancelled) console.error("Load services error", err);
    })
    .finally(() => {
      if (!cancelled) setServicesLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, [userId, user?._id, token]);

 


useEffect(() => {
  if (!conversationId) return;

  fetch(`${API_BASE}/api/chat/messages/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data?.messages) {
        setMessages(data.messages);
      }
    })
    .catch((err) => console.error("load messages error:", err));
}, [conversationId, token]);

useEffect(() => {
 socket.on("new-message", (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  });

  return () => {
    socket.off("new-message");
  };
}, []);

const openConversation = async (otherUserId: string) => {

  if (!otherUserId || otherUserId === user._id) return;
  try {
    const res = await fetch(`${API_BASE}/api/chat/conversation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: otherUserId }),
    });

    const data = await res.json();

    if (!data?.conversation?._id) return;

    setConversationId(data.conversation._id);
    setMessages([]);
    setOpenChat(true);

    // join socket room
    socket.emit("join-chat", {
      conversationId: data.conversation._id,
    });
  } catch (err) {
    console.error("openConversation error:", err);
  }
};

const confirmHire = async () => {
  /* A ref, not just the `hiring` state below.

     This handler had no guard at all, and it makes two sequential requests with
     no feedback on the button — so it looked dead, people pressed it again, and
     the second press ran the whole thing a second time: two HireDeals on the
     server and two proposal cards in the chat for one project.

     State alone doesn't close that. `setHiring(true)` schedules a re-render;
     two clicks inside the same frame both read the old `false`. The ref flips
     synchronously, so the second click returns immediately. */
  if (hiringRef.current) return;
  hiringRef.current = true;
  setHiring(true);

  try {
    if (!token || !user?._id) {
      alert("Login required. Please login again.");
      return;
    }

    if (!userId) {
      alert("Creator not found.");
      return;
    }

    // 1️⃣ Ensure conversation exists
    let convoId = conversationId;

    if (!convoId) {
      const res = await fetch(`${API_BASE}/api/chat/conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok || !data?.conversation?._id) {
        console.error("Conversation creation failed", data);
        alert(data?.error || "Conversation creation failed");
        return;
      }

      convoId = data.conversation._id;
      setConversationId(convoId);

      socket.emit("join-chat", {
        conversationId: convoId,
      });
    }

    // 2️⃣ Create HireDeal first, so accept button has hireDealId
    const hireRes = await fetch(`${API_BASE}/api/hire/create-proposal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        freelancerId: userId,
        conversationId: convoId,
        title: projectTitle || "Project Proposal",
        description: projectDetails,
        budget,
        targetDate: hireDate,
        deliveryPreference,
        briefAttachments: hireBriefFiles,
      }),
    });

    const hireData = await hireRes.json();

    if (!hireRes.ok || !hireData?.success || !hireData?.cardPayload?.hireDealId) {
      console.error("Hire proposal creation failed", hireData);
      alert(hireData?.error || "Hire proposal creation failed");
      return;
    }

    // 3️⃣ Send hire card with hireDealId
    const hireMessage = `HIRE_CARD::${JSON.stringify(hireData.cardPayload)}`;

    socket.emit("send-message", {
      conversationId: convoId,
      senderId: user._id,
      text: hireMessage,
    });

    // 4️⃣ Close popups
    setOpenHirePopup(false);
    setOpenMessagePopup(false);
    // Cleared so reopening the modal for a second proposal doesn't silently
    // re-attach the previous brief's files.
    setHireBriefFiles([]);

    // 5️⃣ Show success popup
    setShowRequestPopup(true);
  } catch (err: any) {
    console.error("Hire confirm error:", err);
    alert(err?.message || "Hire confirm failed");
  } finally {
    // In `finally`, so every early return above — login missing, conversation
    // failed, proposal rejected — releases the button instead of leaving it
    // stuck on "Sending…" with no way to retry.
    hiringRef.current = false;
    setHiring(false);
  }
};


const handleBookNow = (service: any) => {
  setSelectedService(service);
  setOpenServicePopup(false); // ensure details popup closed
  setOpenBookPopup(true);     // open SAME book-now popup
};



// const { persistAuth } = useAuth();

const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files?.[0]) return;

  // 🔒 FINAL GUARD
  if (userId !== user?._id) {
    alert("You can only change your own profile picture");
    return;
  }

  const file = e.target.files[0];
  const formData = new FormData();
  formData.append("avatar", file);

  try {
    const res = await fetch(`${API_BASE}/api/user/upload-avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    // 🔐 VERIFY OWNER
    if (data.success && data.avatar && data.userId === user._id) {
      setAvatar(uploadedAvatar({ avatarUrl: data.avatar }));

      /* Written under `avatarUrl`, the name the rest of the app reads and the
         name the auth payload now carries — the upload route calls its response
         key `avatar` for backwards compatibility, and storing it under that name
         meant the new picture was invisible to every other screen.
         Spread over the current user so this stays a field update: persistAuth
         merges, but passing a lone key still types as a whole user. */
      persistAuth({
        user: { ...(user as any), avatarUrl: data.avatar },
      });
    }
  } catch (err) {
    console.error("Avatar upload failed", err);
  }
};
















const sendMessage = () => {
  if (!messageInput.trim() || !conversationId) return;

  socket.emit("send-message", {
    conversationId,
    senderId: user._id,
    text: messageInput,
  });

  setMessageInput("");
};







  return (
  <div className="relative min-h-screen text-white flex flex-col overflow-x-hidden bg-[#08080A]">

{/* Same ambient light as /find-creators, so arriving here from the directory
    doesn't feel like landing on a different product. It also does real work:
    the glass panels below need something behind them to refract — on a flat
    background a blurred surface is indistinguishable from a grey box.
    Fixed and pointer-events-none, so it never intercepts a click. */}
<div className="pointer-events-none fixed inset-0 z-0">
  <div
    className="absolute -top-40 -left-32 w-[560px] h-[560px] rounded-full opacity-[0.18] blur-[130px]"
    style={{ background: "#1A73E8" }}
  />
  <div
    className="absolute top-1/4 -right-40 w-[520px] h-[520px] rounded-full opacity-[0.14] blur-[130px]"
    style={{ background: "#FF14EF" }}
  />
  <div
    className="absolute bottom-0 left-1/3 w-[480px] h-[480px] rounded-full opacity-[0.10] blur-[130px]"
    style={{ background: "#22D3EE" }}
  />
</div>

{isAdminView ? (
  /* Admin preview strip — no site nav, no account menu, no Logout. */
  <div className="fixed top-0 left-0 right-0 z-[999] border-b border-white/10 bg-[#0B0D12]/95 backdrop-blur-xl">
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-[0.14em] bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-500/25">
          ADMIN PREVIEW
        </span>
        <span className="text-sm text-white/70 truncate">
          Public profile of {userName || "this creator"} — exactly what buyers see.
        </span>
      </div>
      <button
        onClick={() => window.close()}
        className="shrink-0 h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-sm text-white/80"
      >
        Close tab
      </button>
    </div>
  </div>
) : (
  !openHirePopup &&
  !openMessagePopup &&
  !openServicePopup &&
  !openBookPopup &&
  !openCreateServicePopup && (
    <div className="fixed top-0 left-0 right-0 z-[999]">
      <Header />
    </div>
  )
)}

<main className="relative z-10 flex-1">
        {/* The admin strip is 56px tall against the site header's ~96–144px, so
            the top padding shrinks to match instead of leaving a dead band. */}
        <div
          className={`mx-auto max-w-[1280px] px-4 sm:px-6 pb-20 ${
            isAdminView ? "pt-20" : "pt-24 md:pt-28 lg:pt-36"
          }`}
        >
          
          {/* ═══════════════════════ HERO ═══════════════════════ */}
          <section className="rounded-3xl border border-white/[0.08] bg-white/[0.035] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Avatar. Only the owner gets the upload affordance; the ring is
                  the "Upload a profile photo" checklist row pointing at it. */}
              <div className="shrink-0">
                {isOwnProfile ? (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="relative w-24 h-24 rounded-2xl overflow-hidden cursor-pointer group transition-all"
                    style={
                      photoHighlight
                        ? { boxShadow: "0 0 0 3px rgba(255,20,239,0.65)" }
                        : undefined
                    }
                  >
                    {avatar ? (
                      <img src={avatar} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/[0.06] grid place-items-center">
                        <User className="w-9 h-9 text-white/30" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 grid place-items-center text-[11px] text-white transition-opacity">
                      Change photo
                    </div>

                    <div
                      className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full grid place-items-center border-2 border-[#101012]"
                      style={{ background: GRADIENT }}
                    >
                      <Camera className="w-3 h-3 text-white" />
                    </div>

                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/[0.06] grid place-items-center">
                        <User className="w-9 h-9 text-white/30" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl sm:text-[28px] font-bold text-white truncate">
                        {userName || "—"}
                      </h1>

                      {/* Only shown when identity is actually verified. It used
                          to render unconditionally, which made it meaningless. */}
                      {kycInfo?.kycStatus === "VERIFIED" && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
                          style={{ background: "rgba(16,185,129,0.15)", color: "#6EE7B7" }}
                          title="Identity verified"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          VERIFIED
                        </span>
                      )}

                      {/* The tier — claimed only once it's real, exactly as on
                          the directory card for the same person. It used to
                          read CREATOR for anyone with a profile at all, which
                          is how four accounts that can't take a single job came
                          to look identical to the one that can. */}
                      {displayedFreelancer && isSuperCreator && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-white"
                          style={{ background: GRADIENT }}
                        >
                          <LuBadgeCheck className="w-3 h-3" />
                          SUPER CREATOR
                        </span>
                      )}

                      {/* The waiting state, and only to people who can act on
                          it: the owner, who has the upload banner right below.
                          A buyer doesn't need a badge for it — the disabled
                          Hire button already tells them. */}
                      {displayedFreelancer && !isSuperCreator && isOwnProfile && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
                          style={{ background: "rgba(250,188,78,0.10)", color: "#FABC4E" }}
                        >
                          <LuBadgeCheck className="w-3 h-3" />
                          SUPER CREATOR PENDING
                        </span>
                      )}
                    </div>

                    {/* Was a hardcoded string. Now the freelancer's own title,
                        and simply absent if they haven't set one. */}
                    {displayedFreelancer?.professionalTitle && (
                      <p className="text-white/70 text-base mt-1.5">
                        {displayedFreelancer.professionalTitle}
                      </p>
                    )}

                    {locationLine && (
                      <p className="text-white/40 text-sm mt-1 inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {locationLine}
                      </p>
                    )}
                  </div>

                </div>

                {/* Stats — real counts only. */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5">
                  <div>
                    <span className="text-white font-semibold text-lg">{prompts.length}</span>
                    {/* "Product", not "Prompt" — what a creator lists is a
                        product. The `prompts` state name is left alone; only
                        the user-facing wording changes. */}
                    <span className="text-white/45 text-xs ml-1.5">
                      Product{prompts.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div>
                    <span className="text-white font-semibold text-lg">
                      {servicesLoading ? "—" : services.length}
                    </span>
                    <span className="text-white/45 text-xs ml-1.5">
                      Service{!servicesLoading && services.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {!!displayedFreelancer?.skills?.length && (
                    <div>
                      <span className="text-white font-semibold text-lg">
                        {displayedFreelancer.skills.length}
                      </span>
                      <span className="text-white/45 text-xs ml-1.5">Skills</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2.5 mt-5">
                  {!isOwnProfile ? (
                    <>
                      {/* Disabled, not hidden — hiding it would leave a client
                          wondering whether this person takes custom work at
                          all. The server refuses the proposal too; this just
                          means they find out before writing a brief. */}
                      {payoutReady && superCreator ? (
                        <button
                          onClick={() => setOpenHirePopup(true)}
                          className="inline-flex items-center gap-1.5 px-5 h-10 rounded-full text-sm font-semibold text-white"
                          style={{ background: GRADIENT }}
                        >
                          <Briefcase className="w-4 h-4" />
                          Hire
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          title={
                            !superCreator
                              ? // Never says which video state they're in —
                                // NONE, PENDING and REJECTED are all the same
                                // to a client, and naming a rejection would
                                // leak a moderation decision about someone
                                // else. Same line the proposal endpoint sends.
                                "This creator isn't approved to take on work yet. You can still message them."
                              : "This creator is still setting up payouts, so they can't take paid work yet. You can still message them."
                          }
                          className="inline-flex items-center gap-1.5 px-5 h-10 rounded-full text-sm font-semibold text-white/35 bg-white/[0.04] border border-white/[0.07] cursor-not-allowed"
                        >
                          <Briefcase className="w-4 h-4" />
                          Can't hire yet
                        </button>
                      )}

                      {/* Only when there is something to see. A jump-link to an
                          empty section on someone else's profile is worse than
                          no link — it looks like the page failed to load.
                          Rendered while still loading too, so the button doesn't
                          pop in a moment after the others. */}
                      {(servicesLoading || services.length > 0) && (
                        <button
                          type="button"
                          onClick={() => {
                            // Switch the tab first, then scroll — the section
                            // is already mounted, so the browser has the right
                            // target either way, but this avoids landing on the
                            // Prompts tab and having to click again.
                            setActiveProfileTab("services");
                            servicesSectionRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }}
                          className="inline-flex items-center gap-1.5 px-5 h-10 rounded-full text-sm font-semibold text-white bg-white/[0.06] border border-white/[0.10] hover:bg-white/[0.10] transition"
                        >
                          <Briefcase className="w-4 h-4" />
                          Services
                          {!servicesLoading && (
                            <span className="text-white/45">{services.length}</span>
                          )}
                        </button>
                      )}

                      <button
                        onClick={async () => {
                          if (!token) {
                            navigate("/login");
                            return;
                          }
                          setOpeningChat(true);
                          try {
                            const res = await fetch(`${API_BASE}/api/chat/conversation`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ userId }),
                            });
                            const data = await res.json();
                            if (data?.conversation?._id) {
                              navigate("/chat", {
                                state: { conversationId: data.conversation._id },
                              });
                            } else {
                              toast({ title: "Could not start conversation" });
                            }
                          } catch {
                            toast({ title: "Could not start conversation" });
                          } finally {
                            setOpeningChat(false);
                          }
                        }}
                        disabled={openingChat}
                        className="inline-flex items-center gap-1.5 px-5 h-10 rounded-full text-sm font-medium text-white bg-white/[0.08] border border-white/10 hover:bg-white/[0.14] transition disabled:opacity-50"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {openingChat ? "Opening…" : "Message"}
                      </button>
                    </>
                  ) : ownProfile ? (
                    <button
                      onClick={() => setEditorSection("basics")}
                      className="inline-flex items-center gap-1.5 px-5 h-10 rounded-full text-sm font-medium text-white bg-white/[0.08] border border-white/10 hover:bg-white/[0.14] transition"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit details
                    </button>
                  ) : (
                    freelancerEligible && (
                      <button
                        onClick={() => setWizardOpen(true)}
                        className="inline-flex items-center gap-1.5 px-5 h-10 rounded-full text-sm font-semibold text-white"
                        style={{ background: GRADIENT }}
                      >
                        <Briefcase className="w-4 h-4" />
                        Become a Creator
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── Payout setup: the blocking one ────────────────────────────────
              This lived at the bottom of the right-hand rail, below every other
              card — a freelancer had to scroll past their whole profile to
              learn that none of it could earn them anything yet. It is the one
              thing standing between a live profile and being hireable, so it
              sits directly under the header where it can't be missed.
              The quieter copy of it further down has been removed; two prompts
              for the same action is one too many. */}
          {isOwnProfile && ownProfile?.status === "ACTIVE" && !ownProfile.payoutReady && (
            <div
              className="mb-6 rounded-2xl border p-5"
              style={{
                borderColor: "rgba(251,191,36,0.35)",
                background:
                  "linear-gradient(135deg, rgba(251,191,36,0.10), rgba(251,191,36,0.04))",
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div
                  className="w-11 h-11 rounded-xl grid place-items-center shrink-0"
                  style={{ background: "rgba(251,191,36,0.14)" }}
                >
                  <Landmark className="w-5 h-5" style={{ color: "#FBBF24" }} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-white">
                    Set up your payout account to start earning
                  </p>
                  <p className="text-[13px] text-white/65 mt-1 leading-relaxed">
                    Your profile is live, but until your payout account is verified you can't be
                    hired and your services can't be booked. Clients will see you — they just
                    won't be able to pay you. It's one form, it takes a couple of minutes, and it
                    covers selling products as well.
                  </p>
                </div>

                <button
                  onClick={() => setPayoutFormOpen(true)}
                  className="shrink-0 rounded-full px-5 h-10 text-sm font-semibold text-white whitespace-nowrap"
                  style={{ background: GRADIENT }}
                >
                  Set up payouts
                </button>
              </div>
            </div>
          )}

          {/* ── Intro video: the other blocking one ───────────────────────────
              A live profile no longer means a trading profile. Until an admin
              approves the intro video, POST /api/service and
              POST /api/hire/create-proposal both refuse — so the creator is
              told here rather than after writing a listing or waiting for a
              proposal that can never arrive.

              Sits beside the payout banner, not instead of it: they are
              independent, and someone can be blocked by both at once.
              `superCreator` is read rather than `introVideo.status` so an
              allowlisted account isn't nagged about a video it doesn't need. */}
          {isOwnProfile && ownProfile?.status === "ACTIVE" && !ownProfile.superCreator && (
            <div
              className="mb-6 rounded-2xl border p-5"
              style={{
                borderColor: "rgba(251,191,36,0.35)",
                background:
                  "linear-gradient(135deg, rgba(251,191,36,0.10), rgba(251,191,36,0.04))",
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div
                  className="w-11 h-11 rounded-xl grid place-items-center shrink-0"
                  style={{ background: "rgba(251,191,36,0.14)" }}
                >
                  <Video className="w-5 h-5" style={{ color: "#FBBF24" }} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-white">
                    {ownProfile.introVideo?.status === "PENDING"
                      ? "Your intro video is with our reviewers"
                      : ownProfile.introVideo?.status === "REJECTED"
                        ? "Your intro video wasn't approved"
                        : "Add an intro video to start selling"}
                  </p>
                  {/* The owner — unlike a buyer — gets the exact state, including
                      the rejection reason. It's their own video, and "try again"
                      is unactionable without knowing what was wrong. */}
                  <p className="text-[13px] text-white/65 mt-1 leading-relaxed">
                    {ownProfile.introVideo?.status === "PENDING"
                      ? "Until it's approved you can't publish services or be hired. Nothing else to do — we'll email you when it's done."
                      : ownProfile.introVideo?.status === "REJECTED"
                        ? `Upload a new one to publish services and be hired.${
                            ownProfile.introVideo?.rejectionReason
                              ? ` Reason: ${ownProfile.introVideo.rejectionReason}`
                              : ""
                          }`
                        : "Buyers can see your profile, but you can't publish services or be hired until an admin approves your intro video."}
                  </p>
                </div>

                {ownProfile.introVideo?.status !== "PENDING" && (
                  <button
                    onClick={() => setEditorSection("intro_video")}
                    className="shrink-0 rounded-full px-5 h-10 text-sm font-semibold text-white whitespace-nowrap"
                    style={{ background: GRADIENT }}
                  >
                    {ownProfile.introVideo?.status === "REJECTED"
                      ? "Upload a new video"
                      : "Upload intro video"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Draft notice — owner only, and only while the profile isn't live. */}
          {isOwnProfile && ownProfile?.status === "DRAFT" && (
            <div className="mb-6">
              <DraftNoticeCard
                errors={ownProfile.completenessErrors}
                onPublish={publishFreelancerProfile}
                publishing={publishing}
              />
            </div>
          )}

          {/* ═══════════════════════ BODY ═══════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr),320px] gap-6 items-start">
            {/* ── main column ── */}
            <div className="space-y-6 min-w-0">
              {displayedFreelancer ? (
                <FreelancerProfileBody
                  profile={displayedFreelancer}
                  isOwn={isOwnProfile}
                  onEdit={isOwnProfile ? setEditorSection : undefined}
                />
              ) : (
                isOwnProfile &&
                freelancerEligible && (
                  <section className="rounded-2xl border border-white/[0.08] bg-white/[0.035] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] p-6">
                    <div className="flex items-start gap-3">
                      <span
                        className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
                        style={{ background: "rgba(255,20,239,0.12)", color: "#FF87F2" }}
                      >
                        <Briefcase className="w-5 h-5" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-white font-semibold text-[15px]">
                          Get hired for custom work
                        </h2>
                        <p className="text-white/50 text-sm mt-1 max-w-[520px]">
                          Add your skills, specializations and experience to open a freelancer
                          profile. It goes live immediately — nothing waits on approval.
                        </p>
                        <button
                          onClick={() => setWizardOpen(true)}
                          className="mt-4 px-4 h-9 rounded-full text-xs font-semibold text-white"
                          style={{ background: GRADIENT }}
                        >
                          Set up freelancer profile
                        </button>
                      </div>
                    </div>
                  </section>
                )
              )}

              {/* ── Prompts / Services ── */}
              <section
                ref={servicesSectionRef}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.035] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] p-5 sm:p-6"
              >
                {/* Two tabs, both of which render something. "Collections" and
                    "Liked Prompt" used to sit here with no content behind them. */}
                <div className="flex items-center gap-2 mb-5">
                  {[
                    { key: "work", label: `Products (${prompts.length})` },
                    {
                      key: "services",
                      label: servicesLoading ? "Services" : `Services (${services.length})`,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveProfileTab(tab.key as any)}
                      className={`px-4 h-9 rounded-full text-sm font-medium transition ${
                        activeProfileTab === tab.key
                          ? "bg-white/[0.10] text-white"
                          : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeProfileTab === "work" &&
                  (loading ? (
                    <p className="text-white/50 text-sm py-6">Loading products…</p>
                  ) : prompts.length === 0 ? (
                    <p className="text-white/45 text-sm py-6">
                      {isOwnProfile
                        ? "You haven't uploaded any products yet."
                        : "No products uploaded yet."}
                    </p>
                  ) : (
                    <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {prompts.slice(0, promptsShown).map((prompt) =>
                        // A video listing is a 9:16 reel here exactly as it is in
                        // the marketplace — same component, so the play/pause,
                        // watermark and slide-up panel all come along with it.
                        prompt.videoUrl ? (
                          <VideoReelCard
                            key={prompt.id}
                            prompt={prompt}
                            isPurchased={purchasedPromptIds.includes(String(prompt.id))}
                            isOwn={isOwnProfile}
                            isPlaying={playingVideo === prompt.id}
                            onVideoPlay={(id) =>
                              setPlayingVideo((prev) => (prev === id ? null : id))
                            }
                            /* Awaited, so the confirmation reflects what the
                               server did rather than that a request was sent.
                               Same fix as the marketplace cards. */
                            onAddToCart={async (id) => {
                              const result = await addToCart(String(id));
                              toast(
                                result.ok
                                  ? {
                                      title: "Added to Cart",
                                      description: `"${prompt.title}" was added.`,
                                    }
                                  : {
                                      title:
                                        result.error === "already_in_cart"
                                          ? "Already in your cart"
                                          : "Couldn't add to cart",
                                      description: result.message,
                                    },
                              );
                            }}
                            // Checkout lives on the marketplace; it opens with
                            // this prompt's panel already up.
                            onBuyNow={(p) =>
                              navigate(
                                `/prompt-marketplace?prompt=${encodeURIComponent(String(p.id))}`,
                              )
                            }
                            onOpenDetails={(p) => {
                              setDetailsPrompt(p as Prompt);
                              setDetailsOpen(true);
                            }}
                            onNavigateToProfile={(id) => id && navigate(`/profile/${id}`)}
                          />
                        ) : (
                        // Same visual design as the marketplace cards (.mp-card),
                        // and the same details panel behind a click.
                        <div
                          key={prompt.id}
                          className="mp-card"
                          onClick={() => {
                            setDetailsPrompt(prompt);
                            setDetailsOpen(true);
                          }}
                        >
                          <div className="mp-card__media">
                            <div className="mp-card__preview">
                              {prompt.videoUrl ? (
                                <video
                                  src={prompt.videoUrl}
                                  className="mp-card__video"
                                  muted
                                  playsInline
                                  preload="metadata"
                                />
                              ) : prompt.imageUrl ? (
                                <img
                                  src={prompt.imageUrl}
                                  alt={prompt.title}
                                  className="mp-card__img"
                                />
                              ) : null}
                            </div>

                            <div className="mp-card__badges">
                              <span className="mp-card__cat">
                                {prompt.category?.toUpperCase()}
                              </span>
                            </div>

                            {!prompt.isFree && prompt.price && prompt.price > 0 ? (
                              <div className="mp-card__crown">
                                <img src="/icons/premium.png" alt="Premium" />
                              </div>
                            ) : null}
                          </div>

                          <div className="mp-card__body">
                            <div className="mp-card__meta">
                              <span className="mp-card__avatar">
                                {(userName || "U").slice(0, 2).toUpperCase()}
                              </span>
                              <span className="mp-card__author-name">{userName || "Unknown"}</span>
                            </div>

                            <h3 className="mp-card__title">{prompt.title}</h3>
                            <p className="mp-card__desc">{prompt.description}</p>

                            <div className="mp-card__footer">
                              {prompt.isFree ? (
                                <div className="mp-card__pill mp-card__pill--free">FREE</div>
                              ) : (
                                <div className="mp-card__pill mp-card__pill--muted">
                                  ₹{(prompt.price ?? 0).toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        ),
                      )}
                    </div>

                    {prompts.length > PAGE_STEP && (
                      <div className="flex items-center justify-center gap-3 mt-5">
                        {promptsShown < prompts.length && (
                          <button
                            type="button"
                            onClick={() =>
                              setPromptsShown((n) => Math.min(n + PAGE_STEP, prompts.length))
                            }
                            className="px-4 h-9 rounded-full text-xs font-medium text-white bg-white/[0.07] border border-white/[0.10] hover:bg-white/[0.12] transition"
                          >
                            Show more ({prompts.length - promptsShown} left)
                          </button>
                        )}
                        {promptsShown > PAGE_STEP && (
                          <button
                            type="button"
                            onClick={() => setPromptsShown(PAGE_STEP)}
                            className="px-4 h-9 rounded-full text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition"
                          >
                            Show less
                          </button>
                        )}
                      </div>
                    )}
                    </>
                  ))}

                {activeProfileTab === "services" && servicesLoading && (
                  <p className="text-white/45 text-sm py-2">Loading services…</p>
                )}

                {activeProfileTab === "services" && !servicesLoading && (
                  <div className="space-y-6">
                    {/* No payout account, no new services. The server rejects
                        the create with `payout_account_not_active`; saying so
                        here means the creator finds out before writing a
                        listing, not after submitting one. */}
                    {isOwnProfile && !payoutReady && (
                      <div
                        className="rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                        style={{
                          borderColor: "rgba(251,191,36,0.35)",
                          background: "rgba(251,191,36,0.06)",
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
                          style={{ background: "rgba(251,191,36,0.14)" }}
                        >
                          <Landmark className="w-5 h-5" style={{ color: "#FBBF24" }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white">
                            Set up payouts before creating a service
                          </p>
                          <p className="text-[13px] text-white/65 mt-1 leading-relaxed">
                            A service can't be booked until you can be paid, so we don't let you
                            publish one you'd have to take down. It's one form and it covers
                            selling prompts too.
                          </p>
                        </div>
                        <button
                          onClick={() => setPayoutFormOpen(true)}
                          className="shrink-0 rounded-full px-5 h-10 text-sm font-semibold text-white whitespace-nowrap"
                          style={{ background: GRADIENT }}
                        >
                          Set up payouts
                        </button>
                      </div>
                    )}

                    {/* Same reasoning as the payout card above, for the other
                        half of the rule. The banner under the header already
                        explains it and offers the upload, so this one is a
                        single line — repeating the whole explanation twice on
                        one page is noise. */}
                    {isOwnProfile && payoutReady && !ownProfile?.superCreator && (
                      <p className="text-[13px] text-white/55 leading-relaxed">
                        You can't publish a service until your intro video is approved.
                      </p>
                    )}

                    {isOwnProfile && payoutReady && ownProfile?.superCreator &&
                      (services.length === 0 ? (
                        // Nothing to show yet — the full card is the page's
                        // whole content, so it earns the space.
                        <CreateNewServiceCard onClick={() => setOpenCreateServicePopup(true)} />
                      ) : (
                        // Once there are services, the work comes first and this
                        // is just an action.
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setOpenCreateServicePopup(true)}
                            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full text-xs font-medium text-white"
                            style={{ background: GRADIENT }}
                          >
                            <span className="text-base leading-none">+</span>
                            New service
                          </button>
                        </div>
                      ))}

                    {services.length === 0 ? (
                      <p className="text-white/45 text-sm py-2">
                        {isOwnProfile
                          ? "No services yet. Create one so buyers can book you directly."
                          : "No services offered yet."}
                      </p>
                    ) : (
                      <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {services.slice(0, servicesShown).map((service) => (
                          /* h-full + flex-col so every card in a row is the
                             same height whatever its text does, and the price
                             row is pinned to the bottom by mt-auto rather than
                             floating wherever the title happens to end. */
                          <div
                            key={service._id}
                            onClick={() => navigate(`/service/${service._id}`)}
                            className="cursor-pointer h-full flex flex-col rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] p-4 hover:border-white/25 transition"
                          >
                            <div className="h-[150px] shrink-0 rounded-xl bg-black mb-3.5 overflow-hidden">
                              {service.media?.length > 0 &&
                                (service.media[0].match(/\.(mp4|webm|ogg)$/i) ? (
                                  <video
                                    src={service.media[0]}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                    preload="metadata"
                                  />
                                ) : (
                                  <img
                                    src={service.media[0]}
                                    alt={service.title}
                                    className="w-full h-full object-cover"
                                  />
                                ))}
                            </div>

                            {/* min-h reserves the second line, so a one-line
                                title doesn't sit at a different height from a
                                two-line one beside it. break-words handles the
                                unbroken strings a title field always ends up
                                collecting. */}
                            <h4 className="font-medium text-white text-sm line-clamp-2 min-h-[2.5rem] break-words">
                              {service.title}
                            </h4>

                            {service.description && (
                              <p className="mt-1 text-xs leading-relaxed text-white/45 line-clamp-2 break-words">
                                {service.description}
                              </p>
                            )}

                            {/* mt-auto: whatever the text above did, this sits
                                on the bottom edge of every card. */}
                            <div className="mt-auto pt-3">
                              <div className="flex justify-between items-end gap-2">
                                {/* min-w-0 + truncate — without them a long
                                    delivery string pushes the price off the
                                    card instead of shortening itself. */}
                                <div className="min-w-0">
                                  {service.delivery && (
                                    <span className="block text-white/50 text-xs truncate">
                                      {service.delivery}
                                    </span>
                                  )}
                                  {service.revisions && (
                                    <span className="block text-[11px] text-white/35 truncate mt-0.5">
                                      {service.revisions}
                                    </span>
                                  )}
                                </div>
                                <span className="text-white font-semibold text-sm whitespace-nowrap shrink-0">
                                  ₹{Number(service.price || 0).toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {services.length > PAGE_STEP && (
                        <div className="flex items-center justify-center gap-3">
                          {servicesShown < services.length && (
                            <button
                              type="button"
                              onClick={() =>
                                setServicesShown((n) => Math.min(n + PAGE_STEP, services.length))
                              }
                              className="px-4 h-9 rounded-full text-xs font-medium text-white bg-white/[0.07] border border-white/[0.10] hover:bg-white/[0.12] transition"
                            >
                              Show more ({services.length - servicesShown} left)
                            </button>
                          )}
                          {servicesShown > PAGE_STEP && (
                            <button
                              type="button"
                              onClick={() => setServicesShown(PAGE_STEP)}
                              className="px-4 h-9 rounded-full text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition"
                            >
                              Show less
                            </button>
                          )}
                        </div>
                      )}
                      </>
                    )}
                  </div>
                )}
              </section>

              {/* Reviews from people who actually paid this person, or were
                  paid by them. Sits under the work rather than in the sidebar
                  because it's the evidence a visitor is here to weigh. */}
              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.035] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h3 className="text-sm font-semibold text-white">Reviews</h3>
                  {/* Renders itself as the button, the "already reviewed" line,
                      or the reason you can't — whichever applies. */}
                  <WriteReviewButton
                    userId={userId!}
                    userName={userName}
                    token={token}
                    onPosted={() => setReviewsVersion((v) => v + 1)}
                  />
                </div>
                <ReviewSection
                  key={reviewsVersion}
                  userId={userId!}
                  viewerId={user?._id}
                  token={token}
                />
              </section>
            </div>

            {/* ── sidebar ── */}
            <aside className="space-y-5 lg:sticky lg:top-24">
              {/* Owner only, and only once there's a profile to strengthen. */}
              {isOwnProfile && ownProfile && (
                <ProfileStrengthCard
                  strength={ownProfile.strength}
                  onOpenSection={setEditorSection}
                  onFocusPhoto={focusAvatar}
                />
              )}

              {displayedFreelancer && (
                <FreelancerFactsCard
                  profile={displayedFreelancer}
                  isOwn={isOwnProfile}
                  onEdit={isOwnProfile ? setEditorSection : undefined}
                />
              )}

              {/* The payout prompt moved to the top of the page — see above. */}

            </aside>
          </div>

        </div>
  
{openHirePopup && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
    {/* Tightened from 440px and p-4/px-5. It is one short form now — the
        Message and Services tabs that justified the old width are gone — and
        `max-h` + scroll keeps it inside a laptop viewport instead of running
        off the bottom. */}
    <div className="w-[380px] max-w-[94vw] max-h-[88vh] overflow-y-auto rounded-2xl bg-[#17171A] text-white border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.65)]">

      {/* HEADER */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-start gap-3">
          <img
            src={avatar || avatarFallback(user)}
            className="w-9 h-9 rounded-full object-cover"
            alt={userName || "User"}
          />

          <div className="flex-1">
            {/* No "Responds in about 1 hour" here — it was a fixed string shown
                for every creator, not a measured response time. */}
            <p className="text-[15px] font-medium text-white leading-tight">
              Connect with {userName || "Firoz"} —
            </p>
          </div>

          <button
            onClick={() => setOpenHirePopup(false)}
            className="text-white/40 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* The Message and Services tabs used to sit here. Hire is a single
            thing now: someone who clicked Hire wants to send a proposal, and
            offering two other destinations in the same popup just delayed that.
            Both remain reachable from the profile itself — Services is a tab on
            the page, and Message is its own button. */}
      </div>

      {/* BODY */}
      <div className="px-5 py-4">
          <div className="space-y-4">

            {/* PROJECT TITLE */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Project Title
              </label>

              <input
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Nextgen Mobile App Interface"
                className="w-full h-10 rounded-xl bg-[#D9D9D9] text-black placeholder:text-black/45 px-3 text-sm outline-none"
              />
            </div>

            {/* PROJECT DETAILS */}
            <div>
              <label className="block text-sm font-medium">
                Project Details{" "}
                <span className="text-white/35">
                  (Minimum 50 characters)
                </span>
              </label>

              <p className="text-xs text-white/35 mt-1">
                Describe your project or let AI help you write it
              </p>

              <textarea
                value={projectDetails}
                onChange={(e) => setProjectDetails(e.target.value)}
                placeholder="Include any project details, requirements, or goals..."
                className={`mt-2 w-full h-[76px] resize-none rounded-xl bg-transparent p-3 text-sm outline-none border ${
                  projectDetails.length < 50
                    ? "border-red-500"
                    : "border-white/10"
                } placeholder:text-white/30`}
              />

              {projectDetails.length < 50 && (
                <p className="text-xs text-red-500 mt-1">
                  Please provide at least 50 characters.
                </p>
              )}

              {/* Reference material rides on the deal itself. A text-only brief
                  meant every real one started with a Drive link pasted into
                  chat that nobody could find again — and that link is exactly
                  what a cancellation later argues about. */}
              <div className="mt-4">
                <BriefAttachmentPicker
                  value={hireBriefFiles}
                  onChange={setHireBriefFiles}
                  token={token}
                  label="Attach reference files"
                  hint="Briefs, mockups, brand assets — images, PDFs, docs or a zip. The creator sees these with the proposal."
                />
              </div>
            </div>

            {/* PROJECT BUDGET */}
            <div>
              <label className="block text-sm font-medium">
                Project Budget
              </label>

              <p className="text-xs text-white/35 mt-1">
                Connect with {userName || "Firoz"} — minimum project rate is ₹1,000 (INR)
              </p>

              <div className="text-center text-[20px] font-semibold mt-3 mb-2">
                ₹{budget.toLocaleString("en-IN")}
              </div>

              <input
                type="range"
                min={1000}
                max={50000}
                step={500}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-[#8B45FF]"
              />

              <div className="flex justify-between text-[11px] text-white/35 mt-2">
                <span>Minimum ₹1,000 (INR)</span>
                <span>Maximum ₹50,000 (INR)</span>
              </div>
            </div>

            {/* TARGET DATE */}
            {/* TARGET DATE */}
{/* TARGET DATE */}
<div>
  <label className="block text-sm font-medium mb-2">
    Target Date
  </label>

  <div className="relative">
    <button
      type="button"
      onClick={() => setShowHireCalendar((prev) => !prev)}
      className="w-full h-10 rounded-xl bg-[#D9D9D9] text-black px-3 pr-10 text-sm outline-none text-left"
    >
      {formatDisplayDate(hireDate)}
    </button>

    {/* CALENDAR ICON RIGHT SIDE */}
    <button
      type="button"
      onClick={() => setShowHireCalendar((prev) => !prev)}
      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center"
    >
      <img
        src="/icons/cale.svg"
        alt="calendar"
        className="w-5 h-5 object-contain block"
        onError={(e) => {
          console.log("Calendar icon not found: /icons/cale.svg");
          e.currentTarget.style.display = "none";
        }}
      />
    </button>

    {/* DARK CALENDAR POPUP - OPENS ABOVE ICON */}
    {showHireCalendar && (() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const year = hireCalendarMonth.getFullYear();
      const month = hireCalendarMonth.getMonth();

      const firstDay = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();

      const prevMonth = () => {
        setHireCalendarMonth((prev) => {
          const next = new Date(prev);
          next.setMonth(next.getMonth() - 1);
          return next;
        });
      };

      const nextMonth = () => {
        setHireCalendarMonth((prev) => {
          const next = new Date(prev);
          next.setMonth(next.getMonth() + 1);
          return next;
        });
      };

      return (
        <div className="absolute right-0 bottom-[46px] z-[10000] w-[280px] rounded-2xl bg-[#101114] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.75)] p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 text-white"
            >
              ‹
            </button>

            <p className="text-sm font-semibold text-white">
              {getMonthLabel(hireCalendarMonth)}
            </p>

            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 text-white"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <span
                key={`${day}-${index}`}
                className="text-[11px] text-white/40"
              >
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {[...Array(firstDay)].map((_, i) => (
              <span key={`empty-${i}`} />
            ))}

            {[...Array(totalDays)].map((_, i) => {
              const day = i + 1;
              const currentDate = new Date(year, month, day);
              currentDate.setHours(0, 0, 0, 0);

              const value = toDateValue(currentDate);
              const active = hireDate === value;
              const disabled = currentDate < today;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setHireDate(value);
                    setShowHireCalendar(false);
                  }}
                  className={`h-8 rounded-full text-xs transition ${
                    disabled
                      ? "text-white/20 cursor-not-allowed"
                      : active
                      ? "text-white"
                      : "text-white/70 hover:bg-white/10"
                  }`}
                  style={active && !disabled ? { background: GRADIENT } : {}}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      );
    })()}
  </div>
</div>

            {/* DELIVERY PREFERENCE */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Delivery Preference
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryPreference("required")}
                  className={`h-10 px-3 rounded-lg text-sm transition ${
                    deliveryPreference === "required"
                      ? "text-white"
                      : "bg-[#252529] text-white"
                  }`}
                  style={
                    deliveryPreference === "required"
                      ? { background: GRADIENT }
                      : {}
                  }
                >
                  Only Required Files
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryPreference("complete")}
                  className={`h-10 px-3 rounded-lg text-sm transition ${
                    deliveryPreference === "complete"
                      ? "text-white"
                      : "bg-[#252529] text-white"
                  }`}
                  style={
                    deliveryPreference === "complete"
                      ? { background: GRADIENT }
                      : {}
                  }
                >
                  Complete Project Files
                </button>
              </div>
            </div>
          </div>
      </div>

      {/* FOOTER */}
      <div className="px-5 pb-5 pt-2">
        {/* The label changing is what makes this feel fast — the work behind it
            is two short requests, but with no feedback at all the button read as
            broken and got pressed again. */}
        <button
          disabled={hiring || !projectTitle.trim() || projectDetails.length < 50}
          onClick={confirmHire}
          className="w-full h-11 rounded-full text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: GRADIENT }}
        >
          {hiring ? "Sending…" : "Submit Project Proposal"}
        </button>
      </div>
    </div>
  </div>
)}


{openMessagePopup && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="w-[420px] max-w-[95%] rounded-2xl bg-[#0E0F12] border border-white/10 text-white">

      {/* HEADER */}
      <div className="flex items-start gap-3 p-4 border-b border-white/10">
        <img
          src={avatarFallback(user)}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          {/* Same reason it went from the hire popup: a fixed string, identical
              for every creator, that no response time was ever measured for. */}
          <p className="font-semibold">Connect with {userName} —</p>
        </div>
        <button
          onClick={() => setOpenMessagePopup(false)}
          className="text-white/60 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* TABS (UI ONLY) */}
    <div className="flex gap-2 px-4 py-3">
  {[
    { key: "message", label: "Message" },
    { key: "services", label: "Services" },
    { key: "hire", label: "Hire" },
  ].map((tab) => {
    const active = messagePopupTab === tab.key;

    return (
      <button
        key={tab.key}
        onClick={() => setMessagePopupTab(tab.key as any)}
        className={`px-4 h-9 rounded-full text-sm font-medium transition ${
          active
            ? "text-white"
            : "text-white/60 hover:bg-white/10"
        }`}
        style={active ? { background: GRADIENT } : {}}
      >
        {tab.label}
      </button>
    );
  })}
</div>


      {/* MESSAGE INPUT */}
 <div className="px-4 pb-4 max-h-[70vh] overflow-y-auto hide-scrollbar scroll-smooth">

  {/* ================= MESSAGE TAB ================= */}
  {messagePopupTab === "message" && (
    <>
      <label className="text-sm text-white/70">Message</label>
      <textarea
        value={popupMessage}
        onChange={(e) => setPopupMessage(e.target.value)}
        placeholder="Type your message"
        className="w-full mt-2 h-[120px] resize-none rounded-xl bg-[#121212] p-3 text-sm outline-none border border-white/10"
      />

     <button
  onClick={() => {
    if (!popupMessage.trim() || !conversationId) return;

    socket.emit("send-message", {
      conversationId,
      senderId: user._id,
      text: popupMessage,
    });

    setPopupMessage("");
    setOpenMessagePopup(false);

    // ✅ SHOW REQUEST SENT POPUP
    setShowRequestPopup(true);
  }}
  className="mt-4 w-full h-11 rounded-full text-sm font-medium"
  style={{ background: GRADIENT }}
>
  💬 Send Message
</button>

    </>
  )}

  {/* ================= HIRE TAB ================= */}
 {messagePopupTab === "hire" && (
  <div className="px-4 pb-4 max-h-[70vh] overflow-y-auto hide-scrollbar">

    <HireForm
      userName={userName}
      projectDetails={projectDetails}
      setProjectDetails={setProjectDetails}
      budget={budget}
      setBudget={setBudget}
      targetDate={targetDate}
      setTargetDate={setTargetDate}
      customDateEnabled={customDateEnabled}
      setCustomDateEnabled={setCustomDateEnabled}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      selectedTime={selectedTime}
      setSelectedTime={setSelectedTime}
    />
  </div>
)}





  {/* ================= SERVICES TAB ================= */}
{messagePopupTab === "services" && (
 <ServicesTab
  services={services}
  onSelectService={(service) => {
    setSelectedService(service);
    setOpenServicePopup(true);
  }}
  onBookNow={handleBookNow}
/>
)}

</div>


      {/* SEND BUTTON */}
    
    </div>
  </div>
)}

{openServicePopup && selectedService && (
  <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center">

    <div className="w-[1100px] max-w-[95%] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0E0F12] border border-white/10 relative">

      {/* ❌ CLOSE */}
      <button
        onClick={() => {
          setOpenServicePopup(false);
          setSelectedService(null);
        }}
        className="absolute top-4 right-4 text-white/50 hover:text-white z-10"
      >
        ✕
      </button>

      {/* HERO IMAGE */}
      <div className="relative h-[360px] rounded-t-2xl overflow-hidden bg-[#1A1A1A]">
        <img
  src={
    selectedService.media?.length
      ? selectedService.media[0]   // ✅ FIXED
      : "/services/demo-placeholder.png"
  }
  className="w-full h-full object-cover"
/>

        {/* BADGE */}
        {selectedService.badge && (
          <div className="absolute top-6 left-6 px-4 py-1 rounded-full bg-pink-500 text-sm">
            {selectedService.badge}
          </div>
        )}

        {/* RATING */}
        <div className="absolute top-6 right-6 flex items-center gap-1 bg-black/70 px-3 py-1 rounded-full text-sm">
          ⭐ {selectedService.rating}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">

        {/* LEFT */}
        <div>
          <p className="text-sm text-white/50">
            {selectedService.category?.name}
          </p>

          <h2 className="text-3xl font-semibold mt-2">
            {selectedService.title}
          </h2>

          <h3 className="mt-8 font-semibold">About this Service</h3>
          <p className="text-white/70 mt-2">
        {selectedService.description}
          </p>

        <h3 className="mt-8 font-semibold">What's Included</h3>

<ul className="mt-3 space-y-2 text-white/70 list-disc pl-5">
  {selectedService.screens && <li>{selectedService.screens}</li>}
  {selectedService.prototype && <li>Prototype: {selectedService.prototype}</li>}
  {selectedService.fileType && <li>File Type: {selectedService.fileType}</li>}
  {selectedService.delivery && <li>{selectedService.delivery}</li>}
  {selectedService.revisions && <li>{selectedService.revisions}</li>}
</ul>


          <div className="flex flex-wrap gap-2 mt-6">
            {selectedService.tags?.map((t: string) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full bg-white/10 text-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-[#141414] rounded-2xl p-6 h-fit sticky top-6">

          <p className="text-white/50 text-sm">Starting at</p>
          <p className="text-3xl font-semibold mt-1">
            ₹{Number(selectedService.price).toLocaleString("en-IN")}
          </p>

          <div className="flex gap-4 text-sm text-white/50 mt-3">
            <span>⏱ {selectedService.delivery}</span>
            <span>🔁 {selectedService.revisions}</span>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setOpenServicePopup(false);
                setOpenHirePopup(true);
              }}
              className="flex-1 h-11 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 text-sm font-medium"
            >
              Hire me
            </button>

         <button
  onClick={() => {
    setOpenServicePopup(false); // close details popup
    setOpenBookPopup(true);     // open book-now popup
  }}
  className="flex-1 h-11 rounded-full bg-[#2A2A2A] text-sm font-medium"
>
  Book Now
</button>

          </div>
        </div>

      </div>
    </div>
  </div>
)}




      </main>
    {/* ✅ GLOBAL REQUEST SENT POPUP */}
{showRequestPopup && (
  <RequestSentPopup
    conversationId={conversationId}
    onClose={() => setShowRequestPopup(false)}
  />
)}

{openBookPopup && (
  <BookNowPopup
    onClose={() => setOpenBookPopup(false)}
    service={selectedService}
    token={token}
    sellerId={userId}
    sellerName={userName}
    buyerId={user?._id}
  />
)}


{openCreateServicePopup && (
  <CreateServicePopup
    onClose={() => setOpenCreateServicePopup(false)}
    onCreated={(service: any) =>
      setServices(prev => [service, ...prev])
    }
    onAddSpecialization={() => {
      setOpenCreateServicePopup(false);
      setEditorSection("specializations");
    }}
  />
)}


    {/* ── Freelancer editing, owner only ──
        The section editor is a dialog, so clicking a Profile Strength row opens
        the fields on top of the page instead of scrolling it somewhere else. */}
    {isOwnProfile && ownProfile && (
      <FreelancerSectionEditor
        section={editorSection}
        profile={ownProfile}
        token={token}
        specGroups={specGroups}
        onClose={() => setEditorSection(null)}
        onSaved={(next) => {
          setOwnProfile(next);
          // Keep the public copy in step, so an edit shows immediately rather
          // than only after a reload.
          if (next.status === "ACTIVE" && userId) {
            getPublicFreelancerProfile(userId).then((res) => {
              if (res.ok) setFreelancer(res.data.profile);
            });
          }
        }}
        onVideoChange={(introVideo, strength) =>
          setOwnProfile((prev) =>
            prev ? { ...prev, introVideo, strength: strength || prev.strength } : prev
          )
        }
      />
    )}

    {isOwnProfile && (
      <BecomeFreelancerWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        token={token}
        defaultName={userName}
        // This page has already fetched the profile, so the wizard opens on its
        // first step instead of re-requesting the same document behind a spinner.
        initialProfile={ownProfileLoaded ? ownProfile : undefined}
        onActivated={() => loadOwnFreelancer()}
        onStatusChange={() => loadOwnFreelancer()}
      />
    )}

    {isOwnProfile && payoutFormOpen && (
      <SellerLinkedAccountForm
        open={payoutFormOpen}
        onClose={() => setPayoutFormOpen(false)}
        token={token}
        apiBase={API_BASE}
        onSubmitted={() => {
          setPayoutFormOpen(false);
          loadOwnFreelancer();
          toast({
            title: "Payout details saved",
            description: "You're set up to get paid for client work.",
          });
        }}
      />
    )}

    {/* Opened by the prompt cards above. Add to Cart, the team-member request
        flow and the "Your Prompt" / "Purchased" states are all handled inside
        it; only checkout needs the marketplace, so Buy Now hands off there
        with the panel already open on the same prompt. */}
    <DetailsPrompt
      open={detailsOpen}
      onOpenChange={setDetailsOpen}
      prompt={detailsPrompt as any}
      owned={detailsPrompt ? purchasedPromptIds.includes(String(detailsPrompt.id)) : false}
      onPurchase={(p) => {
        setDetailsOpen(false);
        navigate(`/prompt-marketplace?prompt=${encodeURIComponent(String(p.id))}`);
      }}
    />

    {/* Footer is site chrome too — an admin previewing a profile has no use for
        the marketing links, and it shouldn't imply they're browsing the site. */}
    {!isAdminView && (
      <div className="relative z-10">
        <Footer />
      </div>
    )}
    </div>
  );
}

interface HireFormProps {
  userName: string;
  projectDetails: string;
  setProjectDetails: React.Dispatch<React.SetStateAction<string>>;
  budget: number;
  setBudget: React.Dispatch<React.SetStateAction<number>>;
  targetDate: string;
  setTargetDate: React.Dispatch<React.SetStateAction<string>>;
  customDateEnabled: boolean;
  setCustomDateEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedDate: number | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<number | null>>;
  selectedTime: string;
  setSelectedTime: React.Dispatch<React.SetStateAction<string>>;
}
function HireForm({
  userName,
  projectDetails,
  setProjectDetails,
  budget,
  setBudget,
  targetDate,
  setTargetDate,
  customDateEnabled,
  setCustomDateEnabled,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
}: HireFormProps) 
 {
  const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

  return (
    <div className="space-y-6">

      {/* PROJECT DETAILS */}
      <div>
        <p className="text-sm font-medium">
          Project Details <span className="text-white/50">(Minimum 50 characters)</span>
        </p>
        <textarea
          value={projectDetails}
          onChange={(e) => setProjectDetails(e.target.value)}
          placeholder="Include any project details, requirements, or goals..."
          className={`mt-2 w-full h-[110px] rounded-xl bg-[#121212] p-3 text-sm outline-none border ${
            projectDetails.length < 50 ? "border-red-500" : "border-white/10"
          }`}
        />
        {projectDetails.length < 50 && (
          <p className="text-xs text-red-500 mt-1">
            Please provide at least 50 characters.
          </p>
        )}
      </div>

      {/* BUDGET */}
      <div>
        <p className="text-sm font-medium">Project Budget</p>
        <p className="text-xs text-white/50 mb-2">
          Minimum ₹1,000 — Maximum ₹50,000
        </p>

        <div className="text-center text-xl font-semibold mb-2">₹{budget}</div>

        <input
          type="range"
          min={1000}
          max={50000}
          step={500}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full"
        />

        <div className="flex justify-between text-xs text-white/40 mt-1">
          <span>₹1,000</span>
          <span>₹50,000</span>
        </div>
      </div>

      {/* TARGET DATE */}
      <div>
        <p className="text-sm font-medium mb-2">Target Date</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["days", "Within the next few days"],
            ["weeks", "Within the next few weeks"],
            ["month", "In a month or more"],
            ["unsure", "Not sure"],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setTargetDate(v)}
              className={`px-3 py-2 rounded-lg text-sm ${
                targetDate === v
                  ? "text-white"
                  : "bg-white/10"
              }`}
              style={targetDate === v ? { background: GRADIENT } : {}}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* CUSTOM DATE TOGGLE */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Custom Date</p>
          <p className="text-xs text-white/50">
            Select project completion date
          </p>
        </div>

        <button
          onClick={() => setCustomDateEnabled(!customDateEnabled)}
          className={`w-12 h-6 rounded-full p-1 transition ${
            customDateEnabled ? "bg-purple-500" : "bg-white/20"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition ${
              customDateEnabled ? "translate-x-6" : ""
            }`}
          />
        </button>
      </div>

      {/* CALENDAR */}
      {customDateEnabled && (
        <div>
          <p className="text-sm font-medium mb-2">January 2026</p>

          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {["S","M","T","W","T","F","S"].map(d => (
              <span key={d} className="text-white/40">{d}</span>
            ))}

            {[...Array(31)].map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedDate(i + 1)}
                className={`h-9 rounded-full ${
                  selectedDate === i + 1
                    ? "text-white"
                    : "hover:bg-white/10"
                }`}
                style={selectedDate === i + 1 ? { background: GRADIENT } : {}}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TIME */}
      <div>
        <p className="text-sm font-medium mb-2">Available Time</p>
        <div className="grid grid-cols-4 gap-2">
          {["09:00 AM","10:00 AM","11:00 AM","12:00 PM"].map(t => (
            <button
              key={t}
              onClick={() => setSelectedTime(t)}
              className={`py-2 rounded-lg text-sm ${
                selectedTime === t ? "bg-white text-black" : "bg-white/10"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* CONFIRM */}
      <button
        disabled={projectDetails.length < 50}
        className="w-full h-11 rounded-full text-sm font-semibold disabled:opacity-40"
        style={{ background: GRADIENT }}
      >
        Confirm
      </button>
    </div>
  );
}

function ServicesTab({
  services,
  onSelectService,
  onBookNow,
}: {
  services: Service[];
onSelectService: (s: Service) => void;
onBookNow: (s: Service) => void;
}) {
  if (services.length === 0) {
    return <p className="text-white/60">No services created yet.</p>;
  }

  const featured = services[0];
  const rest = services.slice(1);

  return (
    <div className="space-y-8">

      {/* ===== FEATURED SERVICE (TOP CARD) ===== */}
      <div
        onClick={() => onSelectService(featured)}
        className="
          cursor-pointer
          relative
          rounded-2xl
          bg-gradient-to-br from-[#3A1C71] via-[#D76D77] to-[#FFAF7B]
          p-6
          text-white
        "
      >
        {/* BEST VALUE BADGE */}
        <span className="absolute top-4 right-4 px-3 py-1 text-xs rounded-full bg-blue-600">
          BEST VALUE
        </span>

        <h3 className="text-xl font-semibold mb-1">
          {featured.title}
        </h3>

        <p className="text-sm text-white/80 line-clamp-2 mb-4">
          {featured.description}
        </p>

        {/* TAGS */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {featured.screens && (
            <span className="px-3 py-1 bg-black/30 rounded-full text-xs">
              {featured.screens}
            </span>
          )}
          {featured.prototype && (
            <span className="px-3 py-1 bg-black/30 rounded-full text-xs">
              Prototype
            </span>
          )}
          {featured.fileType && (
            <span className="px-3 py-1 bg-black/30 rounded-full text-xs">
              {featured.fileType}
            </span>
          )}
        </div>

        {/* PRICE + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70">Starting at</p>
            <p className="text-2xl font-bold">${featured.price}</p>
          </div>
<button
  onClick={(e) => {
    e.stopPropagation();      // ⛔ prevent opening service details
    onBookNow(featured);      // ✅ open SAME BookNowPopup
  }}
  className="px-6 py-2 rounded-full text-sm font-semibold"
  style={{ background: "linear-gradient(90deg,#FF14EF,#1A73E8)" }}
>
  Book Now
</button>
        </div>
      </div>

      {/* ===== ALL SERVICES LIST ===== */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">All Services</h4>
        <button className="text-sm text-white/60 flex items-center gap-1">
          Filter ⏷
        </button>
      </div>

      <div className="space-y-4">
        {rest.map((service) => (
          <div
            key={service._id}
            onClick={() => onSelectService(service)}
            className="
              cursor-pointer
              flex gap-4
              rounded-2xl
              bg-[#151515]
              border border-white/10
              p-4
              hover:border-white/30
              transition
            "
          >
            {/* IMAGE */}
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-black">
              {service.media?.length > 0 && (
                <img
                  src={service.media[0]}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* CONTENT */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h5 className="font-semibold line-clamp-1">
                  {service.title}
                </h5>
                <span className="text-pink-400 font-semibold">
                  ${service.price}
                </span>
              </div>

              <p className="text-xs text-white/60 line-clamp-1">
                {service.description}
              </p>

              <div className="flex gap-4 mt-2 text-xs text-white/50">
                <span>⏱ {service.delivery}</span>
                <span>🔁 {service.revisions}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

 

function ServiceItem({ title, price, days, revisions, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="
        cursor-pointer
        flex gap-4 p-4 rounded-2xl
        bg-[#151515]
        border border-white/10
        hover:border-white/30
        hover:bg-[#1A1A1A]
        transition
      "
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500" />

      <div className="flex-1">
        <div className="flex justify-between">
          <h5 className="font-semibold">{title}</h5>
          <span className="text-pink-400 font-semibold">{price}</span>
        </div>

        <div className="flex gap-4 mt-2 text-xs text-white/50">
          <span>⏱ {days}</span>
          <span>🔁 {revisions}</span>
        </div>
      </div>
    </div>
  );
}

function RequestSentPopup({
  onClose,
  conversationId,
}: {
  onClose: () => void;
  conversationId: string | null;
}) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[99999] bg-black/70 flex items-start justify-center pt-24">
      <div className="w-[420px] bg-[#121212] rounded-xl p-6 relative shadow-xl border border-white/10">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white"
        >
          ✕
        </button>

        {/* 🔥 GRADIENT BADGE */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center mb-4"
          style={{
            background:
              "linear-gradient(180deg, #FF14EF 0%, #1A73E8 100%)",
          }}
        >
          <LuBadgeCheck className="text-white text-[18px]" />
        </div>

        {/* TITLE */}
        <h3 className="text-lg font-semibold mb-2">
          Your request was sent!
        </h3>

        {/* DESCRIPTION */}
        <p className="text-sm text-white/60 mb-4">
          Check out these other services that may be a good fit for your project.
        </p>

        {/* CTA */}
        <button
          onClick={() => {
            onClose();
            navigate("/chat");
          }}
          className="text-sm font-medium underline text-white hover:text-white/80"
        >
          View Message
        </button>
      </div>
    </div>
  );
}


function BookNowPopup({
  onClose,
  service,
  token,
  sellerId,
  sellerName,
  buyerId,
}: {
  onClose: () => void;
  service: Service | null;
  token?: string | null;
  sellerId?: string;
  sellerName?: string;
  buyerId?: string;
}) {
  const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";
  const navigate = useNavigate();
  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const [targetDate, setTargetDate] = useState("weeks");
  const [customDateEnabled, setCustomDateEnabled] = useState(true);
  const [selectedDate, setSelectedDate] = useState(Math.min(now.getDate() + 1, daysInMonth));
  const [selectedTime, setSelectedTime] = useState("11:00 AM");
  const [sending, setSending] = useState(false);

  const targetDateLabel =
    ({
      days: "Within the next few days",
      weeks: "Within the next few weeks",
      month: "In a month or more",
      unsure: "Not sure",
    } as Record<string, string>)[targetDate] || "";

  // Mirrors confirmHire: ensure a conversation exists, record the booking,
  // then drop a SERVICE_CARD:: message into chat where the buyer actually
  // pays — same flow as the Hire proposal → chat card → Pay Now pattern.
  const handleConfirm = async () => {
    if (!service) return;
    if (!token || !buyerId || !sellerId) {
      toast({ title: "Please log in to book this service" });
      return;
    }

    try {
      setSending(true);

      const convRes = await fetch(`${API_BASE}/api/chat/conversation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: sellerId }),
      });
      const convData = await convRes.json();
      const convoId = convData?.conversation?._id;

      if (!convRes.ok || !convoId) {
        throw new Error(convData?.error || "Could not start conversation");
      }

      const preferredDate = customDateEnabled
        ? new Date(now.getFullYear(), now.getMonth(), selectedDate).toISOString()
        : undefined;

      const bookRes = await fetch(`${API_BASE}/api/services/${service._id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          note: `${targetDateLabel} · Preferred time: ${selectedTime}`,
          preferredDate,
          conversationId: convoId,
        }),
      });
      const bookData = await bookRes.json();

      // `message` first: the seller's payout-account gate answers with a
      // sentence the buyer can understand, while `error` is a slug.
      if (!bookRes.ok || !bookData.success) {
        throw new Error(bookData.message || bookData.error || "Booking failed");
      }

      socket.emit("join-chat", { conversationId: convoId });
      socket.emit("send-message", {
        conversationId: convoId,
        senderId: buyerId,
        text: `SERVICE_CARD::${JSON.stringify(bookData.cardPayload)}`,
      });

      toast({ title: "Booking request sent!", description: "Complete payment in chat to confirm." });
      onClose();
      navigate("/chat", { state: { conversationId: convoId } });
    } catch (err: any) {
      toast({ title: "Booking failed", description: err.message || "Something went wrong." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="w-[420px] rounded-2xl bg-[#0E0F12] text-white border border-white/10">

        {/* HEADER */}
        <div className="flex items-start justify-between p-4 border-b border-white/10">
          <div>
            <p className="font-semibold">Book: {service?.title || "Service"}</p>
            <p className="text-xs text-white/60">
              {sellerName ? `by ${sellerName} · pay in chat` : "You'll pay from the chat after sending"}
            </p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-6 max-h-[75vh] overflow-y-auto hide-scrollbar">

          {/* TARGET DATE */}
          <div>
            <p className="text-sm font-medium mb-2">Target Date</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["days", "Within the next few days"],
                ["weeks", "Within the next few weeks"],
                ["month", "In a month or more"],
                ["unsure", "Not sure"],
              ].map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => setTargetDate(v)}
                  className="px-3 py-2 rounded-lg text-sm"
                  style={targetDate === v ? { background: GRADIENT } : { background: "#1A1A1A" }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* CUSTOM DATE */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Custom Date</p>
              <p className="text-xs text-white/50">
                Select project completion date
              </p>
            </div>

            <button
              onClick={() => setCustomDateEnabled(!customDateEnabled)}
              className={`w-12 h-6 rounded-full p-1 transition ${
                customDateEnabled ? "bg-purple-500" : "bg-white/20"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition ${
                  customDateEnabled ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {/* CALENDAR */}
          {customDateEnabled && (
            <div>
              <p className="text-sm font-medium mb-2">{monthLabel}</p>

              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {["S","M","T","W","T","F","S"].map(d => (
                  <span key={d} className="text-white/40">{d}</span>
                ))}

                {[...Array(daysInMonth)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(i + 1)}
                    className={`h-9 rounded-full ${
                      selectedDate === i + 1 ? "text-white" : "hover:bg-white/10"
                    }`}
                    style={selectedDate === i + 1 ? { background: GRADIENT } : {}}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TIME */}
          <div>
            <p className="text-sm font-medium mb-2">Available Time</p>
            <div className="grid grid-cols-4 gap-2">
              {["09:00 AM","10:00 AM","11:00 AM","12:00 PM"].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`py-2 rounded-lg text-sm ${
                    selectedTime === t
                      ? "bg-white text-black"
                      : "bg-white/10"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* PRICE SUMMARY */}
          {service && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center justify-between">
              <span className="text-sm text-white/60">Total</span>
              <span className="text-lg font-semibold">₹{Number(service.price).toLocaleString("en-IN")}</span>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-white/10">
          <button
            className="w-full h-11 rounded-full text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: GRADIENT }}
            onClick={handleConfirm}
            disabled={sending || !service}
          >
            {sending ? "Sending…" : "Send Booking Request"}
          </button>
        </div>
      </div>
    </div>
  );
}


function CreateNewServiceCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="
        w-full max-w-[520px]
        rounded-2xl
        bg-[#141414]
        border border-white/10
        p-8
        flex flex-col items-center
        justify-center
        text-center
        cursor-pointer
        hover:border-white/30
        hover:bg-[#1A1A1A]
        transition
      "
    >
      {/* PLUS ICON */}
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-blue-500 flex items-center justify-center mb-4">
        <span className="text-white text-3xl leading-none">+</span>
      </div>

      <h3 className="text-lg font-semibold text-white mb-1">
        Create New Service
      </h3>

      <p className="text-sm text-white/60 max-w-[360px]">
        Add a service to show clients what you offer and make booking you easy.
        <span className="underline ml-1 cursor-pointer">Learn more</span>
      </p>
    </div>
  );
}


function CreateServicePopup({
  onClose,
  onCreated,
  // Closes this popup and opens the profile's specialization editor. Passed in
  // because both live on the parent — and without a route out, an empty
  // category dropdown is a dead end.
  onAddSpecialization,
}: {
  onClose: () => void;
  onCreated: (service: Service) => void;
  onAddSpecialization: () => void;
}) {


  // ===== CREATE SERVICE FORM STATE =====
const [serviceTitle, setServiceTitle] = useState("");
const [serviceCategory, setServiceCategory] = useState("");
const [serviceSubCategory, setServiceSubCategory] = useState("");
const [serviceDescription, setServiceDescription] = useState("");
const [servicePrice, setServicePrice] = useState("");

const [serviceFiles, setServiceFiles] = useState<File[]>([]);
const [servicePreview, setServicePreview] = useState<string[]>([]);
const [screens, setScreens] = useState("");
const [deliverables, setDeliverables] = useState<string[]>([]);
const [services, setServices] = useState<any[]>([]);
// Holds WHICH button is busy ("draft" | "published"), not just whether one is —
// otherwise both buttons show a spinner when either is pressed.
const [creatingService, setCreatingService] = useState<"draft" | "published" | null>(null);
// Replaces alert() so the server's actual message is shown in the form.
const [formError, setFormError] = useState<string | null>(null);

// ADD THESE ✅
const [prototype, setPrototype] = useState("");
const [fileType, setFileType] = useState("");
const [delivery, setDelivery] = useState("");
const [revisions, setRevisions] = useState("");

// ===== CATEGORY STATE =====
const [categories, setCategories] = useState<Category[]>([]);
const [subCategories, setSubCategories] = useState<Category[]>([]);

 const { user, token } = useAuth() as any;


/* Only the categories this seller's specializations actually cover.
   The full kind=service tree used to load here, so someone whose profile said
   "Copywriting" could publish under Programming & Tech — which made the
   specialization field decorative and the directory's category filter
   meaningless. The server enforces the same rule on create; this is so the
   seller finds out before writing a whole listing. */
const [categoryBlock, setCategoryBlock] = useState<{ reason: string; message?: string } | null>(null);

/* What the picker offers: the specific sub-categories this seller's
   specializations unlock, each carrying the parent it belongs to. Picking one
   sets both ids, so the service files itself under "Programming & Tech ›
   Frontend Development" without asking the seller to navigate a tree. */
type CategoryOption = { _id: string; name: string; categoryId: string; categoryName: string };
const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

useEffect(() => {
  if (!token) return;

  fetch(`${API_BASE}/api/services/allowed-categories`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      if (!data?.success) return;
      setCategories(data.categories || []);
      setCategoryOptions(data.options || []);
      setCategoryBlock(
        data.categories?.length
          ? null
          : { reason: data.reason || "no_specializations", message: data.message }
      );
    })
    .catch(err => console.error("Allowed category load error", err));
}, [token]);


/* One submit path for both buttons, so "Save Draft" and "Publish" can never
   disagree about what gets sent. `status` is the only difference.

   Three things this fixes over the previous inline handler:
     - subCategory was collected by the form and then never appended to the
       FormData, so the dropdown could not affect the saved service at all.
     - Failures used alert("Failed to create service") and threw away the
       server's message, so "price must be greater than zero" read the same as
       a network error.
     - Price was passed through as a raw string; a typo reached Mongoose and
       came back as a bare 500. */
const submitService = async (status: "draft" | "published") => {
  setFormError(null);

  if (!serviceTitle.trim()) return setFormError("Give your service a title.");
  if (!serviceDescription.trim()) return setFormError("Describe what the buyer gets.");
  if (!serviceCategory) return setFormError("Pick a category.");

  const numericPrice = Number(servicePrice);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return setFormError("Enter a price greater than zero.");
  }
  // Only enforced when publishing — a draft is by definition unfinished, and
  // blocking a save is the one thing that would make the button pointless.
  if (status === "published" && !delivery) {
    return setFormError(
      "Choose a delivery deadline — it's the date each booking has to be delivered by.",
    );
  }

  setCreatingService(status);

  const formData = new FormData();
  formData.append("title", serviceTitle.trim());
  formData.append("description", serviceDescription.trim());
  formData.append("price", String(numericPrice));
  formData.append("category", serviceCategory);
  // Optional, and only sent when actually chosen — the server rejects an empty
  // string, and an untouched <select> is exactly that.
  if (serviceSubCategory) formData.append("subCategory", serviceSubCategory);
  formData.append("prototype", prototype);
  formData.append("fileType", fileType);
  formData.append("delivery", delivery);
  formData.append("revisions", revisions);
  formData.append("screens", screens);
  // FormData has no array type; the server JSON.parses this field.
  formData.append(
    "deliverables",
    JSON.stringify(deliverables.map((d) => d.trim()).filter(Boolean))
  );
  formData.append("status", status);
  serviceFiles.forEach((file) => formData.append("media", file));

  try {
    const res = await fetch(`${API_BASE}/api/services/create`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.success) {
      setFormError(data?.message || "Couldn't create the service. Please try again.");
      return;
    }

    onCreated(data.service);
    onClose();

    // Full reset — category, sub-category and the delivery fields used to
    // survive, so reopening the form showed the previous service's answers.
    setServiceTitle("");
    setServiceDescription("");
    setServicePrice("");
    setServiceCategory("");
    setServiceSubCategory("");
    setPrototype("");
    setFileType("");
    setDelivery("");
    setRevisions("");
    setScreens("");
    setDeliverables([]);
    setServiceFiles([]);
    setServicePreview([]);
  } catch (err) {
    console.error("Create service error", err);
    setFormError("Couldn't reach the server. Check your connection and try again.");
  } finally {
    setCreatingService(null);
  }
};


useEffect(() => {
  /* Only for the fallback picker, where the seller chooses a broad category and
     the children are fetched separately. When `categoryOptions` is populated the
     single picker already sets category AND sub-category together, and this
     effect — which fires on the category half of that pair — would wipe the
     sub-category the seller had just chosen. */
  if (categoryOptions.length > 0) return;

  // Cleared on category change, so the sub-category list can never show the
  // previous category's children while the new ones load.
  setSubCategories([]);
  setServiceSubCategory("");

  if (!serviceCategory) return;

  fetch(`${API_BASE}/api/category/${serviceCategory}/subcategories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data?.subCategories) setSubCategories(data.subCategories);
    })
    .catch(err => console.error("Subcategory load error", err));
}, [serviceCategory, token, categoryOptions.length]);

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="w-[640px] max-w-[95%] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0E0F12] border border-white/10 p-6 relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-6">Service Details</h2>

        {/* FORM */}
        <div className="space-y-4">

         <Input
  label="Service Title"
  placeholder="e.g. I will design..."
  value={serviceTitle}
onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
  setServiceTitle(e.target.value)
}
/>


        <div>
  <label className="text-sm text-white/70">Category</label>

  {/* The list is the seller's own specializations, not the umbrella heading
      they roll up to. Someone who entered Web / Frontend / Backend / Full-stack
      / Mobile / E-commerce / Game Development used to be shown a single option
      — "Programming & Tech" — which looked like the profile had been ignored.
      `options` is empty only if the server couldn't map any specialization to a
      sub-category; then the broad categories are still better than nothing. */}
  {categoryOptions.length > 0 ? (
    <select
      value={serviceSubCategory || ""}
      onChange={(e) => {
        const picked = categoryOptions.find((o) => o._id === e.target.value);
        setServiceSubCategory(picked ? picked._id : "");
        // Both ids travel together — the parent is what the directory filters
        // on, the child is what the seller actually chose.
        setServiceCategory(picked ? picked.categoryId : "");
      }}
      className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10"
    >
      <option value="">Select Category</option>
      {/* Grouped so a seller spanning two headings (say Engineering Ops, which
          covers both Programming & Tech and Data) can tell them apart. */}
      {[...new Set(categoryOptions.map((o) => o.categoryName))].map((groupName) => (
        <optgroup key={groupName} label={groupName}>
          {categoryOptions
            .filter((o) => o.categoryName === groupName)
            .map((o) => (
              <option key={o._id} value={o._id}>
                {o.name}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  ) : (
    <select
      value={serviceCategory}
      onChange={(e) => {
        setServiceCategory(e.target.value);
        setServiceSubCategory(""); // reset subcategory
      }}
      className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10"
    >
      <option value="">Select Category</option>
      {categories.map(cat => (
        <option key={cat._id} value={cat._id}>
          {cat.name}
        </option>
      ))}
    </select>
  )}

  {/* An empty dropdown with no explanation reads as a broken form. This says
      what's missing and where to fix it. */}
  {categoryBlock ? (
    <div className="mt-2 rounded-lg border border-[#FABC4E]/25 bg-[#FABC4E]/[0.08] p-3">
      <p className="text-xs text-[#FABC4E] leading-relaxed">
        {categoryBlock.message ||
          "Add a specialization to your profile before creating a service."}
      </p>
      <button
        type="button"
        onClick={onAddSpecialization}
        className="mt-2 text-xs font-semibold text-white underline underline-offset-2"
      >
        Add a specialization →
      </button>
    </div>
  ) : (
    <p className="mt-1.5 text-[11px] text-white/35">
      Drawn from the specializations on your profile. Need another? Add the
      specialization first.
    </p>
  )}
</div>
          {/* <div>
  <label className="text-sm text-white/70">Sub-Category</label>
  <select
    value={serviceSubCategory}
    onChange={(e) => setServiceSubCategory(e.target.value)}
    disabled={!serviceCategory}
    className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10 disabled:opacity-40"
  >
    <option value="">
      {serviceCategory ? "Select Sub-Category" : "Select category first"}
    </option>

    {subCategories.map(sub => (
      <option key={sub._id} value={sub._id}>
        {sub.name}
      </option>
    ))}
  </select>
</div> */}
                 <Textarea
  label="Service Description"
  placeholder="Describe your service..."
  value={serviceDescription}
  onChange={(e: any) => setServiceDescription(e.target.value)}
/>
             

<div className="sm:col-span-2">
  <label className="text-sm text-white/70">What's included</label>
  <p className="text-[11px] text-white/40 mt-0.5 mb-2">
    List what the buyer gets for the price above — all of it, at no extra cost.
    One point per line.
  </p>

  {deliverables.map((item, i) => (
    <div key={i} className="flex items-center gap-2 mb-2">
      <input
        value={item}
        onChange={(e) =>
          setDeliverables(deliverables.map((d, idx) => (idx === i ? e.target.value : d)))
        }
        maxLength={160}
        placeholder={
          i === 0
            ? "e.g. A 5-page responsive website"
            : i === 1
            ? "e.g. Source files included"
            : "Add another"
        }
        className="flex-1 h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10 outline-none focus:border-[#1A73E8]"
      />
      <button
        type="button"
        onClick={() => setDeliverables(deliverables.filter((_, idx) => idx !== i))}
        className="text-white/40 hover:text-red-400 transition-colors shrink-0"
        aria-label="Remove item"
      >
        ✕
      </button>
    </div>
  ))}

  {deliverables.length < 8 && (
    <button
      type="button"
      onClick={() => setDeliverables([...deliverables, ""])}
      className="text-xs text-white/70 hover:text-white transition-colors"
    >
      + Add an item
    </button>
  )}
</div>

        <div>
  <label className="text-sm text-white/70">Delivery deadline</label>
  {/* This is not a hint to the buyer any more — it becomes a real date the
      moment they pay, and the server refuses a delivery submitted after it.
      Said here, at the point of choosing, rather than discovered on a booking
      that can no longer be delivered. */}
  <p className="mt-1 text-[11px] text-white/40 leading-relaxed">
    The clock starts when the client pays. After this many days you can't submit
    work on that booking, and the client can cancel for a refund — so pick a
    window you can hold to.
  </p>
  <select
    value={delivery}
    onChange={(e) => setDelivery(e.target.value)}
    className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10"
  >
    <option value="">Select Delivery Time</option>
    <option value="1 Day Delivery">1 Day Delivery</option>
    <option value="3 Days Delivery">3 Days Delivery</option>
    <option value="7 Days Delivery">7 Days Delivery</option>
    <option value="14 Days Delivery">14 Days Delivery</option>
    {/* The list stopped at 14 days, so a SaaS build, a 3D animation or a
        60-page site had no honest option to pick. */}
    <option value="21 Days Delivery">21 Days Delivery</option>
    <option value="30 Days Delivery">30 Days Delivery</option>
    <option value="45 Days Delivery">45 Days Delivery</option>
    {/* Stops at 60 on purpose. The buyer's payment is held in escrow for a
        maximum of 90 days, and the remaining 30 are reserved for review,
        revisions and any dispute — a 90-day delivery would use the whole
        window and leave the buyer no time to even look at the work. The
        server rejects anything longer. */}
    <option value="60 Days Delivery">60 Days Delivery</option>
  </select>
  <p className="mt-1.5 text-[11px] text-white/35 leading-relaxed">
    Max 60 days — payments are held in escrow for up to 90 days, and the rest is
    reserved for review and revisions. For longer work, split it into milestones.
  </p>
</div>
        <div>
  <label className="text-sm text-white/70">Revisions</label>
  <select
    value={revisions}
    onChange={(e) => setRevisions(e.target.value)}
    className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10"
  >
    <option value="">Select Revisions</option>
    <option value="1 Revision">1 Revision</option>
    <option value="2 Revisions">2 Revisions</option>
    <option value="3 Revisions">3 Revisions</option>
    <option value="Unlimited Revisions">Unlimited Revisions</option>
  </select>
</div>

             <Input
  label="Price *"
  placeholder="Enter selling price"
  value={servicePrice}
  onChange={(e: any) => setServicePrice(e.target.value)}
/>


          {/* GALLERY */}
         <div className="mt-6 border border-dashed border-white/20 rounded-xl p-6 text-center">

  <p className="text-sm text-white/70 mb-2">
    Drag & Drop your creative works
  </p>

  <p className="text-xs text-white/40 mb-4">
    Supports JPG, PNG, MP4 up to 50MB
  </p>

  {/* HIDDEN FILE INPUT */}
  <input
    type="file"
    multiple
    accept="image/*,video/mp4"
    id="service-media"
    className="hidden"
    onChange={(e) => {
      const selected = Array.from(e.target.files || []);
      setServiceFiles(selected);
      setServicePreview(selected.map(f => URL.createObjectURL(f)));
    }}
  />

  <label
    htmlFor="service-media"
    className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 text-sm cursor-pointer"
  >
    Browse Files
  </label>

  {/* PREVIEW */}
  {servicePreview.length > 0 && (
    <div className="flex gap-3 mt-4 flex-wrap justify-center">
      {servicePreview.map((src, i) => (
        <img
          key={i}
          src={src}
          className="w-20 h-20 object-cover rounded-lg border border-white/10"
        />
      ))}
    </div>
  )}
</div>


          {/* ACTIONS */}
          {formError && (
            <div
              className="mt-6 rounded-lg border px-3 py-2.5"
              style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)" }}
            >
              <p className="text-red-300 text-xs">{formError}</p>
            </div>
          )}

          <div className="flex justify-between items-center mt-8">
            {/* Was a dead button with no onClick. Service.status has always had a
                "draft" value that nothing could reach. */}
            <button
              type="button"
              disabled={!!creatingService}
              onClick={() => submitService("draft")}
              className="px-6 py-2 rounded-full bg-white/10 text-sm disabled:opacity-40"
            >
              {creatingService === "draft" ? "Saving..." : "Save Draft"}
            </button>

            <button
              type="button"
              disabled={!!creatingService}
              onClick={() => submitService("published")}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 text-sm disabled:opacity-40"
            >
              {creatingService === "published" ? "Publishing..." : "Publish Service"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}



function Input({ label, ...props }: any) {
  return (
    <div>
      <label className="text-sm text-white/70">{label}</label>
      <input
        {...props}
        className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm outline-none border border-white/10"
      />
    </div>
  );
}
function Select({ label, placeholder }: any) {
  return (
    <div>
      <label className="text-sm text-white/70">{label}</label>
      <select className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10">
        <option>{placeholder}</option>
      </select>
    </div>
  );
}

function Textarea({ label, ...props }: any) {
  return (
    <div>
      <label className="text-sm text-white/70">{label}</label>
      <textarea
        {...props}
        className="mt-1 w-full h-[120px] rounded-xl bg-[#121212] p-4 text-sm outline-none border border-white/10"
      />
    </div>
  );
}