


import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import { useEffect, useState , useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { User, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LuBadgeCheck } from "react-icons/lu"; 
import { CiMenuKebab } from "react-icons/ci";
import { FiPhone, FiVideo } from "react-icons/fi";

import { socket } from "@/lib/socket"; // or wherever you initialize socket.io
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";
  const kpiCardBase =
  "rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.03] border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

type Prompt = {
  id: string;
  title: string;
  description: string;
  category: string;
  price?: number;
  imageUrl?: string;
  isFree?: boolean;
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
      const [openDocModal, setOpenDocModal] = useState(false);

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
const [activeHireTab, setActiveHireTab] = useState<"message" | "services">("message");

const [openMessagePopup, setOpenMessagePopup] = useState(false);
const [popupMessage, setPopupMessage] = useState("");

const [targetDate, setTargetDate] = useState("weeks"); // days | weeks | month | unsure
const [customDateEnabled, setCustomDateEnabled] = useState(false);

const [selectedDate, setSelectedDate] = useState<number | null>(6);
const [selectedTime, setSelectedTime] = useState("11:00 AM");
const [openServicePopup, setOpenServicePopup] = useState(false);
// const [selectedService, setSelectedService] = useState<any>(null);
const [openCreateServicePopup, setOpenCreateServicePopup] = useState(false);

const fileRef = useRef<HTMLInputElement | null>(null);
const [avatar, setAvatar] = useState<string | null>(null);

const [kycInfo, setKycInfo] = useState<{
  kycStatus: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED" | "FLAGGED";
  docType: "AADHAAR" | "PASSPORT" | null;
  verifiedAt: string | null;
} | null>(null);


const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);


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
  if (!userId) return;

  if (userId !== user?._id || !token) {
    setDocPreviewUrl(null);
    return;
  }

  let objectUrl: string | null = null;

  (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kyc/me/preview/front`, {
  headers: { Authorization: `Bearer ${token}` },
});

      if (!res.ok) {
        console.log("KYC preview failed:", res.status);
        return;
      }

      const blob = await res.blob();
      objectUrl = URL.createObjectURL(blob);
      setDocPreviewUrl(objectUrl);
    } catch (e) {
      console.log("KYC preview error:", e);
    }
  })();

  return () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  };
}, [userId, user?._id, token]);


useEffect(() => {
  if (user?.avatar) {
    setAvatar(API_BASE + user.avatar);
  }
}, [user]);
 
const [messagePopupTab, setMessagePopupTab] = useState<
  "message" | "hire" | "services"
>("message");

const [activeProfileTab, setActiveProfileTab] = useState<
  "work" | "services" | "collections" | "liked"
>("work");
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
const [selectedService, setSelectedService] = useState<Service | null>(null);
const [messages, setMessages] = useState<ChatMessage[]>([]);

// hire
const [projectDetails, setProjectDetails] = useState("");
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

    const endpoint =
      userId === user?._id
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
    imageUrl,
    isFree: !!doc.free,
  };
});

        setPrompts(mapped);
        setUserName(data.user?.name || user?.name || "");
      })
      .finally(() => setLoading(false));
  }, [userId, user, token]);

   useEffect(() => {
  if (activeProfileTab !== "services" || !userId) return;

  const endpoint =
    userId === user?._id
      ? `${API_BASE}/api/services/my`           // own profile
      : `${API_BASE}/api/services/user/${userId}`; // other profile

  fetch(endpoint, {
    headers:
      userId === user?._id
        ? { Authorization: `Bearer ${token}` }
        : undefined,
  })
    .then(res => res.json())
    .then(data => {
      if (data?.services) {
        setServices(data.services);
      }
    })
    .catch(err => console.error("Load services error", err));
}, [activeProfileTab, userId, user, token]);

 


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
  try {
    // 1️⃣ Ensure conversation exists
    let convoId = conversationId;

    if (!convoId) {
      const res = await fetch(`${API_BASE}/api/chat/conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }), // elonId
      });

      const data = await res.json();
      convoId = data?.conversation?._id;

      if (!convoId) {
        console.error("Conversation creation failed");
        return;
      }

      setConversationId(convoId);
    }

    // 2️⃣ Build hire message
    const hireMessage = `
👋 Hi ${userName},

I'm interested in hiring you.

📌 Project Details:
${projectDetails}

💰 Budget: ₹${budget}
📅 Target Date: ${targetDate}
⏰ Time: ${selectedTime}
    `;

    // 3️⃣ Send message with VALID conversationId
    socket.emit("send-message", {
      conversationId: convoId,
      senderId: user._id,
      text: hireMessage,
    });

    // 4️⃣ Close popups
    setOpenHirePopup(false);
    setOpenMessagePopup(false);

    // 5️⃣ Show success popup
    setShowRequestPopup(true);
  } catch (err) {
    console.error("Hire confirm error:", err);
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
      setAvatar(API_BASE + data.avatar);

      persistAuth({
        user: {
          avatar: data.avatar,
        },
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
   <div className="min-h-screen text-white flex flex-col relative overflow-hidden">
  
  {/* BACKGROUND IMAGE */}
<img
  src="/icons/mpbg.png"
  alt="background"
  className="absolute top-0 left-0 w-full h-full object-contain object-top z-0 pointer-events-none"
/>


      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-24 md:pt-28 lg:pt-36 pb-20">
          
          {/* ================= HERO SECTION (ISOLATED) ================= */}
        <div className="relative mb-20 lg:mt-6 xl:mt-10">
            {/* LEFT HERO */}
           <div className="flex items-center gap-6 lg:pt-6">

      
    {userId === user?._id && (
  <div
    onClick={() => fileRef.current?.click()}
    className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer group"
  >
    {avatar ? (
      <img src={avatar} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full bg-white/10 flex items-center justify-center">
        <User className="w-8 h-8 text-white/70" />
      </div>
    )}

    {/* Hover overlay */}
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs transition">
      Change
    </div>

        
  {/* Hidden file input */}
  <input
    ref={fileRef}
    type="file"
    accept="image/*"
    className="hidden"
    onChange={handleAvatarUpload}
  />
</div>
    )}


    {userId !== user?._id && (
  <div className="relative w-20 h-20 rounded-full overflow-hidden">
    {avatar ? (
      <img src={avatar} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full bg-white/10 flex items-center justify-center">
        <User className="w-8 h-8 text-white/70" />
      </div>
    )}
  </div>
)}
              <div className="flex flex-col gap-2">
             <h1 className="flex items-center text-2xl font-semibold text-white">
  {userName}

  {/* LONG WHITE SEPARATOR */}
  <span className="mx-3 h-[3px] w-10 bg-white inline-block" />

  {/* GOLD BADGE */}
  <span
    className="inline-flex items-center justify-center rounded-full"
    style={{
      backgroundColor: "#D18800",
      padding: "3px",
    }}
  >
    <LuBadgeCheck className="text-black text-[16px]" />
  </span>
</h1>



               <p className="font-gilroy font-semibold text-[24px] leading-[100%] uppercase text-white">
  AI Website Design Expert & Fasting
</p>


{/* ✅ ADD THIS HERE */}
{kycInfo?.kycStatus === "VERIFIED" && (
  <div className="inline-flex items-center gap-2 w-fit px-3 h-8 rounded-full bg-white/10 border border-white/10 text-xs text-white mt-1">
    <ShieldCheck className="w-4 h-4 text-emerald-400" />
    IDENTITY VERIFIED
  </div>
)}

             <div className="flex items-center gap-3 mt-2 relative">
  {/* HIRE BUTTON */}


{userId !== user?._id ? (
  <>
    <button
      onClick={() => setOpenHirePopup(true)}
      className="px-4 h-9 rounded-full text-sm font-medium text-white"
      style={{ background: GRADIENT }}
    >
      Hire
    </button>

    <button
      onClick={() => {
        setOpenMessagePopup(true);
        openConversation(userId!);
      }}
      className="px-4 h-9 rounded-full text-sm font-medium text-white bg-white/10 hover:bg-white/20"
    >
      Message
    </button>
  </>
) : (
  <>
 
  </>
)}


  {/* TRIPLE DOT MENU (RIGHT OF HIRE) */}
 

  {/* RATING (STAYS ON RIGHT SIDE) */}
  <div className="flex items-center gap-1 px-3 h-9 rounded-full bg-[#1C1C1C] border border-white/10 text-sm">
    <Star className="w-4 h-4 text-yellow-400" />
    4.9
  </div>
    


    {/* //ooking */}
    {/* <button
  onClick={() => setOpenBookingPopup(true)}
  className="px-6 h-10 rounded-full text-sm font-semibold text-white"
  style={{ background: GRADIENT }}
>
  Book Appointment
</button> */}


   <div ref={menuRef} className="relative">
    <button
      onClick={() => setOpenMenu((v) => !v)}
      className="
        w-9 h-9 rounded-full
        flex items-center justify-center
        bg-[#1C1C1C]
        border border-white/10
        hover:bg-white/10
        transition
      "
    >
      <CiMenuKebab className="text-white text-[18px]" />
    </button>

    {/* DROPDOWN */}
    {openMenu && (
      <div
        className="
          absolute right-0 top-[44px]
          min-w-[180px]
          rounded-xl
          bg-[#121212]
          border border-white/10
          shadow-[0_10px_40px_rgba(0,0,0,0.6)]
          z-50
        "
      >
       

        <button
          onClick={() => {
            setOpenMenu(false);
            alert(`Report ${userName}`);
          }}
          className="
            w-full px-4 py-3 text-left text-sm
            text-white-400 hover:bg-white/5
            transition
          "
        >
          Report {userName}
        </button>
      </div>
    )}
  </div>
</div>

              </div>
            </div>

            {/* RIGHT HERO (DESKTOP ONLY) */}
            <div className="absolute bottom-5 right-0 w-[420px] h-[260px] hidden lg:block">
              <img
                src="/icons/prt.png"
                alt="PRT"
                className="absolute top-[80px] left-[55px] z-[1]"
              />
              <img
                src="/icons/pro.png"
                alt="PRO"
                className="absolute top-[150px] left-[0px] z-[2]"
              />
            </div>
          </div>



          {/* ================= AFTER HERO ================= */}
        <h2 className="mt-10 font-gilroy font-semibold text-[40px] leading-[100%] text-white">
  My Digital Products
</h2>

    {kycInfo?.kycStatus === "VERIFIED" && (
  <div className="mt-10 max-w-[520px]">

    {/* Verification Status Header */}
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-white font-semibold text-lg">Verification Status</h3>
      <span className="px-3 h-7 inline-flex items-center rounded-full text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
        ● ACTIVE
      </span>
    </div>

    {/* Card */}
    <div className="rounded-[22px] bg-[#141414] border border-white/10 p-5">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-sky-300" />
        </div>

        <div className="flex-1">
          <p className="text-white font-semibold">
            Identity verified via official document matching
          </p>
          <p className="text-white/60 text-sm mt-1">
            This verification process includes biometric face matching against government-issued identification.
          </p>
        </div>
      </div>

      {/* Meta rows */}
      <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-white/40">VERIFICATION DATE</p>
          <p className="text-white mt-1">
            {kycInfo?.verifiedAt ? new Date(kycInfo.verifiedAt).toLocaleDateString() : "-"}
          </p>
        </div>

        <div>
          <p className="text-white/40">DOCUMENT TYPE</p>
          <p className="text-white mt-1">
            {kycInfo?.docType === "AADHAAR" ? "Aadhaar" : "Passport"}
          </p>
        </div>

        <div>
          <p className="text-white/40">STATUS</p>
          <p className="text-emerald-300 mt-1 font-semibold">Confirmed</p>
        </div>
      </div>

      {/* Waterdrop Confidential View */}
      
    </div>
    {/* ✅ Clickable Confidential View (separate block) */}
<div
  role="button"
  tabIndex={0}
  onClick={() => {
    if (!docPreviewUrl) return;
    setOpenDocModal(true);
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter" && docPreviewUrl) setOpenDocModal(true);
  }}
  className={`${kpiCardBase} mt-6 p-4 flex items-center gap-4 cursor-pointer hover:border-white/20 transition`}
>
  {/* Left droplet preview */}
  <div className="relative w-[90px] h-[90px] shrink-0">
    <div className="waterdrop w-full h-full overflow-hidden relative">
      <img
        src={docPreviewUrl || "/icons/doc-placeholder.png"}
        className="w-full h-full object-cover scale-[1.05]"
        alt="doc"
      />

      {/* blur + dark overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

      {/* label */}
      <div className="absolute inset-0 flex items-center justify-center px-2 text-center">
        <p className="text-[10px] font-semibold text-white/90 leading-tight">
          CONFIDENTIAL VIEW
        </p>
      </div>
    </div>
  </div>

  {/* Right text */}
  <div className="flex-1">
    <p className="text-white font-semibold">CONFIDENTIAL VIEW</p>
    <p className="text-white/50 text-xs mt-1">
      Tap to view full document image.
    </p>
  </div>

  {/* little hint */}
  <span className="text-white/50 text-xs">View ⤢</span>
</div>

  </div>
)}

          {/* ================= FILTER BAR ================= */}
          <div className="mt-6 mb-14 flex items-center justify-between">
            {/* LEFT TABS */}
           <div className="flex items-center gap-2">
{[
  { key: "work", label: "Work" },
  { key: "services", label: "Services" },
  { key: "collections", label: "Collections" },
  { key: "liked", label: "Liked Prompt" },
].map((tab) => (
  <button
    key={tab.key}
    onClick={() => setActiveProfileTab(tab.key as any)}
    className={`px-4 h-9 rounded-full text-sm font-medium transition ${
      activeProfileTab === tab.key
        ? "bg-white/10 text-white"
        : "text-white/70 hover:bg-white/10 hover:text-white"
    }`}
  >
    {tab.label}
  </button>
))}

</div>


            {/* RIGHT SORT */}
            <div className="flex items-center gap-2">
              <button className="px-4 h-9 rounded-full text-sm font-medium bg-white/10 text-white">
                Latest
              </button>
              <button className="px-4 h-9 rounded-full text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
                Popular
              </button>
            </div>
  
            
          </div>

          {/* ================= PROMPTS GRID ================= */}
  {/* ================= TAB CONTENT ================= */}

{/* 🔹 WORK TAB → PROMPT CARDS */}
{activeProfileTab === "work" && (
  <>
    {loading ? (
      <p className="text-white/70">Loading prompts…</p>
    ) : prompts.length === 0 ? (
      <p className="text-white/60">No prompts uploaded yet.</p>
    ) : (
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
        {prompts.map((prompt) => (
          <Card
  key={prompt.id}
  className="overflow-hidden w-full max-w-[306px]"
  style={{
    height: 520,
    background: "#1C1C1C",
    borderRadius: 30,
  }}
>
            <CardContent className="p-4 h-full flex flex-col">
              <div className="relative w-full h-[240px] rounded-[20px] overflow-hidden bg-black">
                {prompt.imageUrl && (
                  <img
                    src={prompt.imageUrl}
                    alt={prompt.title}
                    className="w-full h-full object-cover"
                  />
                )}

                <div
                  className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
                  style={{ background: GRADIENT }}
                >
                  {prompt.category.toUpperCase()}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-[18px] font-semibold text-white line-clamp-2">
                  {prompt.title}
                </h3>
                <p className="text-[13px] text-white/70 mt-2 line-clamp-2">
                  {prompt.description}
                </p>
              </div>

              <div className="mt-auto pt-4">
                <div className="px-4 h-10 rounded-full bg-[#333335] inline-flex items-center justify-center text-sm text-white">
                  {prompt.isFree ? "FREE" : `₹${prompt.price?.toFixed(2)}`}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </>
)}

{/* 🔹 SERVICES TAB → CREATE SERVICE CARD ONLY */}

{activeProfileTab === "services" && (
  <div className="mt-10 space-y-10">

    {/* CREATE SERVICE CARD */}
    
    {userId === user?._id && (
  <CreateNewServiceCard
    onClick={() => setOpenCreateServicePopup(true)}
  />
)}

    {/* SERVICES LIST */}
    {services.length === 0 ? (
      <p className="text-white/60">
        No services created yet.
      </p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div
            key={service._id}
            onClick={() => {
              setSelectedService(service);
              setOpenServicePopup(true);
            }}
            className="
              cursor-pointer
              rounded-2xl
              bg-[#151515]
              border border-white/10
              p-6
              hover:border-white/30
              hover:bg-[#1A1A1A]
              transition
            "
          >
            {/* IMAGE */}
            <div className="h-[160px] rounded-xl bg-black mb-4 overflow-hidden">
              {service.media?.length > 0 && (
  <img
    src={service.media[0]}
    className="w-full h-full object-cover"
  />
)}
            </div>

            {/* TITLE */}
            <h4 className="font-semibold text-white line-clamp-2">
              {service.title}
            </h4>

            {/* META */}
            <div className="flex justify-between items-center mt-3 text-sm">
              <span className="text-white/60">
                ⏱ {service.delivery}
              </span>
              <span className="text-pink-400 font-semibold">
                ₹{service.price}
              </span>
            </div>

            <div className="text-xs text-white/50 mt-2">
              🔁 {service.revisions}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

        </div>
  


{openHirePopup && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="w-[420px] max-w-[95%] rounded-2xl bg-[#0E0F12] border border-white/10 text-white overflow-hidden">

      {/* HEADER */}
      <div className="flex items-start gap-3 p-4 border-b border-white/10">
        <img src="https://i.pravatar.cc/100" className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <p className="font-semibold">Connect with {userName} —</p>
          <p className="text-xs text-white/60">Responds in about 1 hour</p>
        </div>
        <button onClick={() => setOpenHirePopup(false)} className="text-white/60">✕</button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 p-4">
        {["message", "services"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveHireTab(t as any)}
            className={`px-4 h-9 rounded-full text-sm ${
              activeHireTab === t ? "bg-white text-black" : "bg-white/10"
            }`}
          >
            {t === "message" ? "Message" : "Services"}
          </button>
        ))}
      </div>

      {/* BODY */}
      <div className="px-4 space-y-6 max-h-[70vh] overflow-y-auto hide-scrollbar">

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
                    ? "bg-gradient-to-r from-pink-500 to-blue-500"
                    : "bg-white/10"
                }`}
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
            <p className="text-xs text-white/50">Select project completion date</p>
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

        {/* CALENDAR (ONLY WHEN TOGGLE ON) */}
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
                      ? "bg-gradient-to-r from-pink-500 to-blue-500"
                      : "hover:bg-white/10"
                  }`}
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

      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-white/10">
 
<button
  disabled={projectDetails.length < 50}
  onClick={confirmHire}
  className="w-full h-11 rounded-full text-sm font-semibold"
  style={{ background: GRADIENT }}
>
  Confirm
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
          src="https://i.pravatar.cc/100"
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <p className="font-semibold">Connect with {userName} —</p>
          <p className="text-xs text-white/60">Responds in about 1 hour</p>
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
            ${selectedService.price}
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
  <BookNowPopup onClose={() => setOpenBookPopup(false)} />
)}


{openCreateServicePopup && (
  <CreateServicePopup
    onClose={() => setOpenCreateServicePopup(false)}
    onCreated={(service: any) =>
      setServices(prev => [service, ...prev])
    }
  />
)}


{/* ✅ FULL DOCUMENT MODAL */}
{openDocModal && docPreviewUrl && (
  <div
    className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
    onClick={() => setOpenDocModal(false)}
  >
    <div
      className="relative w-full max-w-[720px] rounded-2xl overflow-hidden bg-[#0E0F12] border border-white/10"
      onClick={(e) => e.stopPropagation()}
    >
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <p className="text-white font-semibold text-sm">
          {kycInfo?.docType === "AADHAAR" ? "Aadhaar Preview" : "Document Preview"}
        </p>

        <button
          onClick={() => setOpenDocModal(false)}
          className="text-white/60 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* image */}
      <div className="p-4">
        <img
          src={docPreviewUrl}
          alt="Document"
          className="w-full max-h-[75vh] object-contain rounded-xl bg-black"
        />
      </div>
    </div>
  </div>
)}

      <Footer />
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


function BookNowPopup({ onClose }: { onClose: () => void }) {
  const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

  const [targetDate, setTargetDate] = useState("weeks");
  const [customDateEnabled, setCustomDateEnabled] = useState(true);
  const [selectedDate, setSelectedDate] = useState(6);
  const [selectedTime, setSelectedTime] = useState("11:00 AM");

  return (
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="w-[420px] rounded-2xl bg-[#0E0F12] text-white border border-white/10">

        {/* HEADER */}
        <div className="flex items-start justify-between p-4 border-b border-white/10">
          <div>
            <p className="font-semibold">Connect with BitePal —</p>
            <p className="text-xs text-white/60">Responds in about 1 hour</p>
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
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-white/10">
          <button
            className="w-full h-11 rounded-full text-sm font-semibold text-white"
            style={{ background: GRADIENT }}
            onClick={onClose}
          >
            Confirm
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
}: {
  onClose: () => void;
  onCreated: (service: Service) => void;
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
const [services, setServices] = useState<any[]>([]);
const [creatingService, setCreatingService] = useState(false);

// ADD THESE ✅
const [prototype, setPrototype] = useState("");
const [fileType, setFileType] = useState("");
const [delivery, setDelivery] = useState("");
const [revisions, setRevisions] = useState("");

// ===== CATEGORY STATE =====
const [categories, setCategories] = useState<Category[]>([]);
const [subCategories, setSubCategories] = useState<Category[]>([]);

 const { user, token } = useAuth() as any;


useEffect(() => {
  fetch(`${API_BASE}/api/category`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data?.categories) {
        setCategories(data.categories.slice(0, 10)); // 🔥 only 10
      }
    })
    .catch(err => console.error("Category load error", err));
}, [token]);


useEffect(() => {
  if (!serviceCategory) return;

  fetch(`${API_BASE}/api/category/${serviceCategory}/subcategories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data?.subCategories) {
        setSubCategories(data.subCategories.slice(0, 10)); // 🔥 only 10
      }
    })
    .catch(err => console.error("Subcategory load error", err));
}, [serviceCategory, token]);

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
             

       <div>
  <label className="text-sm text-white/70">Screens</label>
  <select
    value={screens}
    onChange={(e) => setScreens(e.target.value)}
    className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10"
  >
    <option value="">Select Screens</option>
    <option value="5 Screens">5 Screens</option>
    <option value="10 Screens">10 Screens</option>
    <option value="21 Screens">21 Screens</option>
    <option value="Unlimited Screens">Unlimited Screens</option>
  </select>
</div>
            <div>
  <label className="text-sm text-white/70">Prototype</label>
  <select
    value={prototype}
    onChange={(e) => setPrototype(e.target.value)}
    className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10"
  >
    <option value="">Select Prototype</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
</div>
          <div>
  <label className="text-sm text-white/70">File Type</label>
  <select
    value={fileType}
    onChange={(e) => setFileType(e.target.value)}
    className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10"
  >
    <option value="">Select File Type</option>
    <option value="Source File">Source File</option>
    <option value="JPG">JPG</option>
    <option value="PNG">PNG</option>
    <option value="Figma">Figma</option>
  </select>
</div>
        <div>
  <label className="text-sm text-white/70">Delivery</label>
  <select
    value={delivery}
    onChange={(e) => setDelivery(e.target.value)}
    className="mt-1 w-full h-11 rounded-xl bg-[#121212] px-4 text-sm border border-white/10"
  >
    <option value="">Select Delivery Time</option>
    <option value="3 Days Delivery">3 Days Delivery</option>
    <option value="7 Days Delivery">7 Days Delivery</option>
    <option value="14 Days Delivery">14 Days Delivery</option>
  </select>
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
          <div className="flex justify-between mt-8">
            <button className="px-6 py-2 rounded-full bg-white/10 text-sm">
              Save Draft
            </button>
             <button
  disabled={creatingService}
  onClick={async () => {
    if (!serviceTitle || !serviceDescription || !servicePrice || !serviceCategory) {
      alert("Fill all required fields");
      return;
    }

    setCreatingService(true);

    const formData = new FormData();
    formData.append("title", serviceTitle);
    formData.append("description", serviceDescription);
    formData.append("price", servicePrice);
    formData.append("category", serviceCategory);
    formData.append("prototype", prototype);
    formData.append("fileType", fileType);
    formData.append("delivery", delivery);
    formData.append("revisions", revisions);
    formData.append("screens", screens);
    serviceFiles.forEach(file => {
      formData.append("media", file);
    });

    try {
      const res = await fetch(`${API_BASE}/api/services/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!data?.success) {
        alert("Failed to create service");
        return;
      }

      // 🔥 THIS IS WHAT YOU WERE MISSING
      onCreated(data.service);

      onClose();

      // reset
      setServiceTitle("");
      setServiceDescription("");
      setServicePrice("");
      setServiceFiles([]);
      setServicePreview([]);

    } catch (err) {
      console.error("Create service error", err);
    } finally {
      setCreatingService(false);
    }
  }}
  className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 text-sm disabled:opacity-40"
>
  {creatingService ? "Publishing..." : "Publish Service"}
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