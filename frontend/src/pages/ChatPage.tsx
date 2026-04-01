// // // import { useEffect, useState, useRef } from "react";
// // // import { socket } from "@/lib/socket";
// // // import { useAuth } from "@/contexts/AuthContext";
// // // import Header from "@/components/Header";
// // // import Footer from "@/components/Footer";
// // // import { FiVideo, FiPaperclip, FiSend } from "react-icons/fi";
// // // import AgoraRTC from "agora-rtc-sdk-ng";
// // // import { useAgoraCall } from "@/hooks/useAgoraCall";

// // // export default function ChatPage() {
// // //   const { token, user } = useAuth() as any;

// // //   const [conversations, setConversations] = useState<any[]>([]);
// // //   const [activeConvo, setActiveConvo] = useState<any>(null);
// // //   const [messages, setMessages] = useState<any[]>([]);
// // //   const [input, setInput] = useState("");
// // // const [localTracks, setLocalTracks] = useState<any[]>([]);


// // // const [incomingCall, setIncomingCall] = useState<{
// // //   from: string;
// // //   type: "video" | "audio";
// // //   conversationId: string;
// // // } | null>(null);

// // //   const bottomRef = useRef<HTMLDivElement>(null);

// // //   /* ================= LOAD CONVERSATIONS ================= */
// // //   useEffect(() => {
// // //     fetch(`/api/chat/conversations`, {
// // //       headers: { Authorization: `Bearer ${token}` },
// // //     })
// // //       .then(r => r.json())
// // //       .then(d => d.success && setConversations(d.conversations));
// // //   }, [token]);

// // //   useEffect(() => {
// // //   socket.on("incoming-call", ({ from, type, conversationId }) => {
// // //     setIncomingCall({ from, type, conversationId });
// // //   });

// // //   socket.on("call-accepted", ({ conversationId }) => {
// // //     joinCall(conversationId, user._id, true);
// // //   });

// // //   return () => {
// // //     socket.off("incoming-call");
// // //     socket.off("call-accepted");
// // //   };
// // // }, []);


// // //   /* ================= LOAD MESSAGES ================= */
// // //   useEffect(() => {
// // //     if (!activeConvo) return;

// // //     fetch(`/api/chat/messages/${activeConvo._id}`, {
// // //       headers: { Authorization: `Bearer ${token}` },
// // //     })
// // //       .then(r => r.json())
// // //       .then(d => d.success && setMessages(d.messages));

// // //     socket.emit("join-chat", { conversationId: activeConvo._id });
// // //   }, [activeConvo]);

// // //   /* ================= SOCKET ================= */
// // //   useEffect(() => {
// // //     socket.on("new-message", (msg) => {
// // //       if (msg.conversationId === activeConvo?._id) {
// // //         setMessages(prev => [...prev, msg]);
// // //       }
// // //     });

// // //     return () => socket.off("new-message");
// // //   }, [activeConvo]);

// // //   useEffect(() => {
// // //     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
// // //   }, [messages]);

// // //   /* ================= SEND ================= */
// // // const sendMessage = () => {
// // //   console.log("SEND CLICKED");

// // //   // allow popup even if message empty
// // //   if (activeConvo && input.trim()) {
// // //     socket.emit("send-message", {
// // //       conversationId: activeConvo._id,
// // //       senderId: user._id,
// // //       text: input,
// // //     });
// // //   }

// // //   setInput("");

// // //   // 🔥 ALWAYS OPEN POPUP
  
// // // };
// // //   const {
// // //   joinCall,
// // //   leaveCall,
// // //   localVideoRef,
// // //   remoteVideoRef,
// // //   inCall,
// // // } = useAgoraCall();



// // // const acceptCall = async () => {
// // //   if (!incomingCall) return;

// // //   socket.emit("accept-call", {
// // //     to: incomingCall.from,
// // //     conversationId: incomingCall.conversationId,
// // //   });

// // //   await joinCall(
// // //     incomingCall.conversationId,
// // //     user._id,
// // //     incomingCall.type === "video"
// // //   );

// // //   setIncomingCall(null);
// // // };

// // // const rejectCall = () => {
// // //   setIncomingCall(null);
// // // };

// // // const startVideoCall = async () => {
// // //   if (!activeConvo) return;

// // //   // notify receiver
// // //   socket.emit("call-user", {
// // //     to: activeConvo.otherUser._id,
// // //     from: user._id,
// // //     type: "video",
// // //     conversationId: activeConvo._id,
// // //   });

// // //   // start own preview immediately
// // //   await joinCall(activeConvo._id, user._id, true);
// // // };
// // // // const confirmHire = () => {
// // // //   const hireMessage = `
// // // // 👋 Hi ${activeConvo.otherUser.name},

// // // // I'm interested in hiring you.

// // // // 📌 Project Details:
// // // // ${projectDetails}

// // // // 💰 Budget: ₹${budget}
// // // // 📅 Target Date: ${targetDate}

// // // // Looking forward to working with you!
// // // // `;

// // // //   socket.emit("send-message", {
// // // //     conversationId: activeConvo._id,
// // // //     senderId: user._id,
// // // //     text: hireMessage,
// // // //   });

// // // //   // ✅ SAME POPUP
// // // //   setShowRequestPopup(true);
// // // // };


// // //   return (
// // //     <div className="min-h-screen flex flex-col bg-[#0E0F12] text-white">

// // //       {/* ===== HEADER ===== */}
// // //       <Header />

// // //       {/* ===== CHAT BODY ===== */}
// // //       <div className="flex-1 flex overflow-hidden">

// // //         {/* ================= LEFT SIDEBAR ================= */}
// // //         <aside className="w-[320px] border-r border-white/10 p-4 flex flex-col">
// // //           <input
// // //             placeholder="Search messages"
// // //             className="mb-4 rounded-lg bg-[#151515] px-3 py-2 text-sm"
// // //           />

// // //           <div className="flex gap-4 text-sm mb-3">
// // //             <span className="border-b-2 border-blue-500">All</span>
// // //             <span className="text-white/60">Unread</span>
// // //           </div>

// // //           <div className="flex-1 overflow-y-auto no-scrollbar">
// // //             {conversations.map(c => (
// // //               <button
// // //                 key={c._id}
// // //                 onClick={() => setActiveConvo(c)}
// // //                 className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg ${
// // //                   activeConvo?._id === c._id
// // //                     ? "bg-white/10"
// // //                     : "hover:bg-white/5"
// // //                 }`}
// // //               >
// // //                 <div className="w-9 h-9 rounded-full bg-white/20 grid place-items-center">
// // //                   {c.otherUser?.name?.[0]}
// // //                 </div>

// // //                 <div className="flex-1 text-left">
// // //                   <div className="text-sm">{c.otherUser?.name}</div>
// // //                   <div className="text-xs text-white/60 truncate">
// // //                     {c.lastMessage}
// // //                   </div>
// // //                 </div>

// // //                 {c.unreadCount > 0 && (
// // //                   <span className="bg-blue-500 text-xs w-5 h-5 rounded-full grid place-items-center">
// // //                     {c.unreadCount}
// // //                   </span>
// // //                 )}
// // //               </button>
// // //             ))}
// // //           </div>
// // //         </aside>

// // //         {/* ================= RIGHT CHAT ================= */}
// // //         <main className="flex-1 flex flex-col">

// // //           {activeConvo && (
// // //             <div className="border-b border-white/10 px-6 py-4">
// // //               <div className="text-lg font-semibold">
// // //                 {activeConvo.otherUser?.name}
// // //               </div>
// // //             </div>
// // //           )}

// // //           <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar">
// // //             {messages.map(m => (
// // //               <div
// // //                 key={m._id}
// // //                 className={`max-w-[60%] rounded-xl px-4 py-3 text-sm ${
// // //                   m.sender === user._id
// // //                     ? "ml-auto bg-[#2A2A2A]"
// // //                     : "bg-[#1C1C1C]"
// // //                 }`}
// // //               >
// // //                 {m.text}
// // //               </div>
// // //             ))}
// // //             <div ref={bottomRef} />
// // //           </div>

// // //         {activeConvo && (
// // //   <div className="border-t border-white/10 px-6 py-4">
// // //     <div className="flex items-center gap-3 bg-[#151515] rounded-full px-4 py-2">

// // //       {/* VIDEO ICON */}
// // //      <button
// // //   onClick={() =>
// // //     joinCall(
// // //       activeConvo._id,   // channel = conversationId
// // //       user._id,          // unique uid
// // //       true
// // //     )
// // //   }
// // //   className="w-9 h-9 rounded-full bg-[#1E1E1E] flex items-center justify-center hover:bg-white/10"
// // // >
// // //   <FiVideo className="text-white text-[18px]" />
// // // </button>


// // //       {/* ATTACH ICON */}
// // //       <button
// // //         className="w-9 h-9 rounded-full bg-[#1E1E1E] flex items-center justify-center hover:bg-white/10 transition"
// // //         title="Attach file"
// // //       >
// // //         <FiPaperclip className="text-white text-[18px]" />
// // //       </button>

// // //       {/* MESSAGE INPUT */}
// // //       <input
// // //         value={input}
// // //         onChange={e => setInput(e.target.value)}
// // //         placeholder="Write your message..."
// // //         className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/40"
// // //       />

// // //       {/* SEND BUTTON */}
// // //      <button
// // //   type="button"
// // //   onClick={sendMessage}
// // //   className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition"
// // // >
// // //   <FiSend className="text-black text-[18px]" />
// // // </button>


// // //     </div>
// // //   </div>
// // // )}



// // //         </main>
// // //         {inCall && (
// // //   <div className="fixed inset-0 z-[9999] bg-black flex flex-col">

// // //     {/* HEADER */}
// // //     <div className="h-14 px-4 flex items-center justify-between border-b border-white/10">
// // //       <span className="text-sm">Video Call</span>
// // //       <button
// // //         onClick={leaveCall}
// // //         className="px-4 py-1 rounded bg-red-500 text-sm"
// // //       >
// // //         End
// // //       </button>
// // //     </div>

// // //     {/* VIDEOS */}
// // //     <div className="flex-1 grid grid-cols-2 gap-2 p-4">
// // //       <div
// // //         ref={localVideoRef}
// // //         className="bg-black rounded-lg overflow-hidden"
// // //       />
// // //       <div
// // //         ref={remoteVideoRef}
// // //         className="bg-black rounded-lg overflow-hidden"
// // //       />

// // //         <div
// // //   ref={localVideoRef}
// // //   className="w-[260px] h-[180px] bg-black rounded-xl overflow-hidden"
// // // />
// // //     </div>
// // //   </div>
// // // )}

// // // {incomingCall && (
// // //   <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
// // //     <div className="w-[320px] rounded-xl bg-[#111] p-6 text-center">
// // //       <p className="text-lg font-semibold mb-2">Incoming Call</p>
// // //       <p className="text-sm text-white/60 mb-6">
// // //         {incomingCall.type === "video" ? "Video" : "Audio"} call
// // //       </p>

// // //       <div className="flex gap-4 justify-center">
// // //         <button
// // //           onClick={acceptCall}
// // //           className="px-6 py-2 rounded bg-green-500 text-black font-medium"
// // //         >
// // //           Accept
// // //         </button>
// // //         <button
// // //           onClick={rejectCall}
// // //           className="px-6 py-2 rounded bg-red-500 text-white font-medium"
// // //         >
// // //           Reject
// // //         </button>
// // //       </div>
// // //     </div>
// // //   </div>
// // // )}

// // // {inCall && (
// // //   <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
// // //     <div className="h-14 px-4 flex items-center justify-between border-b border-white/10">
// // //       <span>Video Call</span>
// // //       <button
// // //         onClick={leaveCall}
// // //         className="px-4 py-1 rounded bg-red-500 text-sm"
// // //       >
// // //         End
// // //       </button>
// // //     </div>

// // //     <div className="flex-1 grid grid-cols-2 gap-3 p-4">
// // //       <div ref={localVideoRef} className="bg-black rounded-lg" />
// // //       <div ref={remoteVideoRef} className="bg-black rounded-lg" />
// // //     </div>
// // //   </div>
// // // )}



// // //       </div>

  
// // //     </div>
// // //   );
// // // }
// // // function RequestSentPopup({ onClose }: { onClose: () => void }) {
// // //   return (
// // //     <div className="fixed inset-0 z-[99999] bg-black/70 flex items-start justify-center pt-24">
// // //       <div className="w-[420px] bg-[#121212] rounded-xl p-6 relative shadow-xl">

// // //         <button
// // //           onClick={onClose}
// // //           className="absolute top-4 right-4 text-white/40 hover:text-white"
// // //         >
// // //           ✕
// // //         </button>

// // //         <div className="mb-3">
// // //           <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
// // //             ✦
// // //           </div>
// // //         </div>

// // //         <h3 className="text-lg font-semibold mb-2">
// // //           Your request was sent!
// // //         </h3>

// // //         <p className="text-sm text-white/60 mb-4">
// // //           Check out these other services that may be a good fit for your project.
// // //         </p>

// // //         <button
// // //           onClick={onClose}
// // //           className="text-sm font-medium underline text-white"
// // //         >
// // //           View Message
// // //         </button>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // import { useEffect, useState, useRef } from "react";
// // import { socket } from "@/lib/socket";
// // import { useAuth } from "@/contexts/AuthContext";
// // import Header from "@/components/Header";
// // import { FiVideo, FiSend } from "react-icons/fi";
// // import { useAgoraCall } from "@/hooks/useAgoraCall";

// // /* ============================================================
// //    MAIN CHAT PAGE
// // ============================================================ */
// // export default function ChatPage() {
// //   const { token, user } = useAuth() as any;

// //   const [conversations, setConversations] = useState<any[]>([]);
// //   const [activeConvo, setActiveConvo] = useState<any>(null);
// //   const [messages, setMessages] = useState<any[]>([]);
// //   const [input, setInput] = useState("");

// //   const bottomRef = useRef<HTMLDivElement>(null);

// //   /* ================= LOAD CONVERSATIONS ================= */
// //   useEffect(() => {
// //     fetch(`/api/chat/conversations`, {
// //       headers: { Authorization: `Bearer ${token}` },
// //     })
// //       .then(r => r.json())
// //       .then(d => d.success && setConversations(d.conversations));
// //   }, [token]);

// //   /* ================= LOAD MESSAGES ================= */
// //   useEffect(() => {
// //     if (!activeConvo) return;

// //     fetch(`/api/chat/messages/${activeConvo._id}`, {
// //       headers: { Authorization: `Bearer ${token}` },
// //     })
// //       .then(r => r.json())
// //       .then(d => d.success && setMessages(d.messages));

// //     socket.emit("join-chat", { conversationId: activeConvo._id });
// //   }, [activeConvo]);

// //   /* ================= SOCKET ================= */
// //   useEffect(() => {
// //     socket.on("new-message", (msg) => {
// //       if (msg.conversationId === activeConvo?._id) {
// //         setMessages(prev => [...prev, msg]);
// //       }
// //     });

// //     return () => socket.off("new-message");
// //   }, [activeConvo]);

// //   useEffect(() => {
// //     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
// //   }, [messages]);

// //   /* ================= SEND ================= */
// //   const sendMessage = () => {
// //     if (!input.trim() || !activeConvo) return;

// //     socket.emit("send-message", {
// //       conversationId: activeConvo._id,
// //       senderId: user._id,
// //       text: input,
// //     });

// //     setInput("");
// //   };

// //   const { joinCall } = useAgoraCall();

// //   /* ============================================================
// //      RENDER
// //   ============================================================ */
// //   return (
// //     <div className="h-screen flex bg-[#020617] text-slate-100 overflow-hidden">

// //       {/* ================= LEFT SIDEBAR ================= */}
// //       <aside className="w-[360px] border-r border-slate-800 bg-slate-900/60 backdrop-blur-xl flex flex-col">
// //         <div className="p-6">
// //           <h2 className="text-xl font-bold mb-4">Messages</h2>
// //           <input
// //             placeholder="Search conversations..."
// //             className="w-full px-4 py-2 rounded-xl bg-slate-800 text-sm outline-none"
// //           />
// //         </div>

// //         <div className="flex-1 overflow-y-auto">
// //           {conversations.map(c => (
// //             <div
// //               key={c._id}
// //               onClick={() => setActiveConvo(c)}
// //               className={`px-6 py-4 flex gap-3 cursor-pointer transition
// //                 ${
// //                   activeConvo?._id === c._id
// //                     ? "bg-slate-800/60 border-r-2 border-blue-500"
// //                     : "hover:bg-slate-800/30"
// //                 }`}
// //             >
// //               <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold">
// //                 {c.otherUser?.name?.[0]}
// //               </div>

// //               <div className="flex-1 min-w-0">
// //                 <div className="flex justify-between">
// //                   <span className="font-semibold text-sm truncate">
// //                     {c.otherUser?.name}
// //                   </span>
// //                   <span className="text-xs text-slate-400">Now</span>
// //                 </div>
// //                 <p className="text-xs text-slate-400 truncate">
// //                   {c.lastMessage}
// //                 </p>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </aside>

// //       {/* ================= CENTER CHAT ================= */}
// //       <div className="flex-1 flex flex-col">

// //         {/* HEADER */}
// //         {activeConvo && (
// //           <header className="px-8 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex justify-between items-center">
// //             <div className="flex gap-4 items-center">
// //               <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold">
// //                 {activeConvo.otherUser?.name?.[0]}
// //               </div>
// //               <div>
// //                 <p className="font-bold">{activeConvo.otherUser?.name}</p>
// //                 <p className="text-xs text-green-400">Active now</p>
// //               </div>
// //             </div>

// //             <button
// //               onClick={() =>
// //                 joinCall(activeConvo._id, user._id, true)
// //               }
// //               className="p-3 rounded-xl hover:bg-slate-800"
// //             >
// //               <FiVideo />
// //             </button>
// //           </header>
// //         )}

// //         {/* MESSAGES */}
// //         <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
// //           {messages.map(m => (
// //             <div
// //               key={m._id}
// //               className={`flex ${
// //                 m.sender === user._id ? "justify-end" : "justify-start"
// //               }`}
// //             >
// //               <div
// //                 className={`max-w-[70%] px-5 py-4 rounded-2xl text-sm shadow
// //                   ${
// //                     m.sender === user._id
// //                       ? "bg-blue-600 text-white rounded-br-md"
// //                       : "bg-slate-800 rounded-bl-md"
// //                   }`}
// //               >
// //                 {m.text}
// //               </div>
// //             </div>
// //           ))}
// //           <div ref={bottomRef} />
// //         </div>

// //         {/* INPUT */}
// //         {activeConvo && (
// //           <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur">
// //             <div className="flex gap-3 items-center bg-slate-800 rounded-2xl px-4 py-3">
// //               <input
// //                 value={input}
// //                 onChange={e => setInput(e.target.value)}
// //                 placeholder="Type your message..."
// //                 className="flex-1 bg-transparent outline-none text-sm"
// //               />
// //               <button
// //                 onClick={sendMessage}
// //                 className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center hover:scale-95 transition"
// //               >
// //                 <FiSend />
// //               </button>
// //             </div>
// //           </div>
// //         )}
// //       </div>

// //       {/* ================= RIGHT PROFILE (XL) ================= */}
// //       {activeConvo && (
// //         <aside className="hidden xl:flex w-[300px] border-l border-slate-800 bg-slate-900/50 p-6 flex-col">
// //           <div className="text-center">
// //             <div className="w-24 h-24 rounded-2xl bg-slate-800 mx-auto mb-4" />
// //             <h3 className="font-bold">{activeConvo.otherUser?.name}</h3>
// //             <p className="text-xs text-slate-400">Expert Creator</p>
// //           </div>
// //         </aside>
// //       )}
// //     </div>
// //   );
// // }



// import { useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { socket } from "@/lib/socket";
// import { useAuth } from "@/contexts/AuthContext";
// import { FiVideo, FiSend, FiPaperclip, FiArrowLeft, FiInfo } from "react-icons/fi";
// import { useAgoraCall } from "@/hooks/useAgoraCall";

// export default function ChatPage() {
//   const { token, user } = useAuth() as any;
//   const navigate = useNavigate();
//     const ringingAudio = useRef<HTMLAudioElement | null>(null);
//   const [conversations, setConversations] = useState<any[]>([]);
//   const [activeConvo, setActiveConvo] = useState<any>(null);
//   const [messages, setMessages] = useState<any[]>([]);
//   const [input, setInput] = useState("");
//   const [showProfile, setShowProfile] = useState(true);
//    const [incomingCall, setIncomingCall] = useState<any>(null);
// const [callType, setCallType] = useState<"video" | "audio">("video")
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const bottomRef = useRef<HTMLDivElement>(null);
// const callTimeoutRef = useRef<any>(null);
//   const GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";


//     const API_BASE =
//   import.meta.env.VITE_API_URL || "http://localhost:5000";



//   /* ================= LOAD CONVERSATIONS ================= */
//   useEffect(() => {
//     fetch(`/api/chat/conversations`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then(r => r.json())
//       .then(d => d.success && setConversations(d.conversations));
//   }, [token]);

//   useEffect(() => {
//   ringingAudio.current = new Audio("/sounds/messenger.mp3");
//   ringingAudio.current.loop = true;
// }, []);

//   /* ================= LOAD MESSAGES ================= */
//   useEffect(() => {
//     if (!activeConvo) return;

//     fetch(`/api/chat/messages/${activeConvo._id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then(r => r.json())
//       .then(d => d.success && setMessages(d.messages));

//     socket.emit("join-chat", { conversationId: activeConvo._id });
//   }, [activeConvo]);

//   /* ================= SOCKET ================= */
//   useEffect(() => {
//     socket.on("new-message", (msg) => {
//       if (msg.conversationId === activeConvo?._id) {
//         setMessages(prev => [...prev, msg]);
//       }
//     });
//     return () => socket.off("new-message");
//   }, [activeConvo]);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//   socket.on("call-accepted", async ({ conversationId }) => {
//     await joinCall(conversationId, user._id, true);
//   });

//   return () => socket.off("call-accepted");
// }, []);

//   useEffect(() => {
//   socket.on("incoming-call", ({ fromUser, conversationId, type }) => {
//     setIncomingCall({ fromUser, conversationId, type });

//     ringingAudio.current?.play();

//     // Auto-miss after 30s
//     callTimeoutRef.current = setTimeout(() => {
//       ringingAudio.current?.pause();
//       setIncomingCall(null);

//       socket.emit("missed-call", {
//         toUserId: fromUser._id,
//         conversationId,
//       });
//     }, 30000);
//   });

//   socket.on("call-ended", () => {
//     ringingAudio.current?.pause();
//     leaveCall();
//     setIncomingCall(null);
//   });

//   socket.on("call-accepted", ({ conversationId }) => {
//     clearTimeout(callTimeoutRef.current);
//   });

//   return () => {
//     socket.off("incoming-call");
//     socket.off("call-ended");
//     socket.off("call-accepted");
//   };
// }, []);


//   /* ================= SEND ================= */
//   const sendMessage = () => {
//     if (!input.trim() || !activeConvo) return;

//     socket.emit("send-message", {
//       conversationId: activeConvo._id,
//       senderId: user._id,
//       text: input,
//     });
//     setInput("");
//   };

// const formatTime = (date: string) =>
//   new Date(date).toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//   });


//   useEffect(() => {
//   socket.on("incoming-call", ({ fromUser, conversationId, type }) => {
//     setIncomingCall({
//       fromUser,
//       conversationId,
//       type,
//     });
//   });

//   socket.on("call-ended", () => {
//     leaveCall();
//     setIncomingCall(null);
//   });

//   return () => {
//     socket.off("incoming-call");
//     socket.off("call-ended");
//   };
// }, []);


//   const handleAttachment = async (
//   e: React.ChangeEvent<HTMLInputElement>
// ) => {
//   const file = e.target.files?.[0];
//   if (!file || !activeConvo) return;

//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("conversationId", activeConvo._id);

//   const res = await fetch(
//     `${API_BASE}/api/chat/attachment`, // ✅ FIXED
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       body: formData,
//     }
//   );

//   const data = await res.json();

//  if (data?.message) {
//   // ✅ Add instantly for sender
//   setMessages(prev => [...prev, data.message]);

//   // ✅ Broadcast to other user
//   socket.emit("new-message", data.message);
// }
// };


// const connectGoogle = () => {
//   const w = 500;
//   const h = 600;
//   const left = window.screenX + (window.outerWidth - w) / 2;
//   const top = window.screenY + (window.outerHeight - h) / 2;

//   window.open(
//     "https://tokunbackendcode-cjfvg7a6ekhddzcf.eastus-01.azurewebsites.net//api/auth/google",
//     "googleAuth",
//     `width=${w},height=${h},left=${left},top=${top}`
//   );
// };

// useEffect(() => {
//   const listener = (e: MessageEvent) => {
//     if (e.data?.success) {
//       alert("Google connected successfully");
//     }
//   };
//   window.addEventListener("message", listener);
//   return () => window.removeEventListener("message", listener);
// }, []);



// const startMeetCall = async () => {
//   const res = await fetch("/api/google-meet/create", {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       summary: `Meeting with ${activeConvo.otherUser.name}`,
//     }),
//   });

//   const data = await res.json();

//   if (data.error === "google_not_connected") {
//     connectGoogle();
//     return;
//   }

//   socket.emit("send-message", {
//     conversationId: activeConvo._id,
//     senderId: user._id,
//     text: `📞 Google Meet: ${data.meetLink}`,
//   });

//   window.open(data.meetLink, "_blank");
// };


// const sharedResources = messages.filter(
//   m => m.attachment
// );


// const renderMessageText = (text: string) => {
//   const urlRegex = /(https?:\/\/[^\s]+)/g;

//   return text.split(urlRegex).map((part, i) =>
//     part.match(urlRegex) ? (
//       <a
//         key={i}
//         href={part}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="text-blue-400 underline hover:text-blue-300"
//       >
//         {part}
//       </a>
//     ) : (
//       <span key={i}>{part}</span>
//     )
//   );
// };
 


//   /* ===================================================== */
//   return (
//     <div className="h-screen flex bg-[#020617] text-white overflow-hidden">

//       {/* ================= LEFT SIDEBAR ================= */}
//       <aside className="w-[340px] border-r border-white/10 bg-[#0F0F11]">
//         <div className="p-5 text-lg font-bold">Messages</div>

//         <div className="overflow-y-auto">
//           {conversations.map(c => (
//             <div
//               key={c._id}
//               onClick={() => setActiveConvo(c)}
//               className={`px-5 py-4 cursor-pointer flex gap-3 ${
//                 activeConvo?._id === c._id
//                   ? "bg-white/10"
//                   : "hover:bg-white/5"
//               }`}
//             >
//               <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-pink-500 to-blue-500 flex items-center justify-center font-bold">
//                 {c.otherUser?.name?.[0]}
//               </div>
//               <div className="flex-1">
//                 <p className="font-semibold text-sm">{c.otherUser?.name}</p>
//                 <p className="text-xs text-white/50 truncate">{c.lastMessage}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </aside>

//       {/* ================= CHAT ================= */}
//       <main className="flex-1 flex flex-col">

//         {/* HEADER */}
//         {activeConvo && (
//           <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0F0F11]">

//             {/* LEFT */}
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => navigate(`/profile/${activeConvo.otherUser._id}`)}
//                 className="w-9 h-9 rounded-full text-white flex items-center justify-center"
//                 style={{ background: GRADIENT }}
//               >
//                 <FiArrowLeft />
//               </button>

//               <div>
//                 <p className="font-bold">{activeConvo.otherUser?.name}</p>
//                 <p className="text-xs text-green-400">Active now</p>
//               </div>
//             </div>
//             <button
//   onClick={async () => {
//     if (!confirm("Delete this chat?")) return;

//     await fetch(`/api/chat/conversation/${activeConvo._id}`, {
//       method: "DELETE",
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     setActiveConvo(null);
//     setMessages([]);
//     setConversations(prev =>
//       prev.filter(c => c._id !== activeConvo._id)
//     );
//   }}
//   className="w-10 h-10 rounded-full bg-red-500/20 text-red-400"
// >
//   🗑
// </button>

//             {/* RIGHT ACTIONS */}
//             <div className="flex items-center gap-3">
//               {/* VIDEO */}
//         <button
//   onClick={startMeetCall}
//   className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
// >
//   <FiVideo className="text-white" />
// </button>

//               {/* INFO */}
//               <button
//                 onClick={() => setShowProfile(v => !v)}
//                 className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
//               >
//                 <FiInfo />
//               </button>
//             </div>
  


//           </header>
          
//         )}

//         {/* MESSAGES */}
//            {/* ================= MESSAGES ================= */}
// <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
//   {messages.map(m => (
//     <div
//       key={m._id}
//       className={`flex ${
//         m.sender === user._id ? "justify-end" : "justify-start"
//       }`}
//     >
//       <div className="max-w-[70%]">

//         {/* TEXT */}
//        {m.text && (
//   <div
//     className={`px-4 py-3 rounded-2xl text-sm ${
//       m.sender === user._id ? "text-white" : "bg-[#1C1C1C]"
//     }`}
//     style={m.sender === user._id ? { background: GRADIENT } : {}}
//   >
//     {renderMessageText(m.text)}
//   </div>
// )}

//         {/* ATTACHMENT */}
//         {m.attachment && (
//           <div className="mt-2">
//             {m.attachment.type === "image" ? (
//               <img
//   src={m.attachment.url}
//   className="rounded-lg max-w-[240px]"
// />
//             ) : (
//               <a
//   href={m.attachment.url}
//   target="_blank"
//   className="text-sm underline text-blue-400"
// >
//   📎 {m.attachment.name}
// </a>
//             )}
//           </div>
//         )}

//         {/* TIME */}
//         <p className="text-[10px] text-white/40 mt-1 text-right">
//           {formatTime(m.createdAt)}
//         </p>
//       </div>
//     </div>
//   ))}

//   <div ref={bottomRef} />
// </div>



//         {/* INPUT */}
//         {activeConvo && (
//           <div className="border-t border-white/10 p-5 bg-[#0F0F11]">
//             <div className="flex items-center gap-3 bg-[#151515] rounded-full px-4 py-2">
//               <button
//                 onClick={() => fileInputRef.current?.click()}
//                 className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
//               >
//                 <FiPaperclip />
//               </button>

//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 hidden
//                 onChange={handleAttachment}
//               />

//               <input
//                 value={input}
//                 onChange={e => setInput(e.target.value)}
//                 placeholder="Type your message..."
//                 className="flex-1 bg-transparent outline-none text-sm"
//               />

//               <button
//                 onClick={sendMessage}
//                 className="w-10 h-10 rounded-full flex items-center justify-center"
//                 style={{ background: GRADIENT }}
//               >
//                 <FiSend />
//               </button>
//             </div>
//           </div>
//         )}






//       </main>

    
//  {/* ================= RIGHT PROFILE ================= */}
// {showProfile && activeConvo && (
//   <aside className="w-[300px] border-l border-white/10 bg-[#0F0F11] p-6">
//     <div className="text-center">

//       {/* PROFILE IMAGE / INITIAL */}
//     <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden mb-4 bg-gradient-to-tr from-pink-500 to-blue-500 flex items-center justify-center">
//   {activeConvo?.otherUser?.avatar ? (
//     <img
//       src={`${API_BASE}${activeConvo.otherUser.avatar}`}
//       alt={activeConvo.otherUser.name}
//       className="w-full h-full object-cover"
//       onError={(e) => {
//         e.currentTarget.style.display = "none";
//       }}
//     />
//   ) : (
//     <span className="text-3xl font-bold text-white">
//       {activeConvo.otherUser?.name?.[0]}
//     </span>
//   )}
// </div>

//       {/* NAME */}
//       <h3 className="font-bold">
//         {activeConvo.otherUser?.name}
//       </h3>

//       {/* OPTIONAL ROLE / STATUS */}
//       <p className="text-xs text-white/50 mb-6">
//         {activeConvo.otherUser?.role || "User"}
//       </p>

//       {/* SHARED FILES */}
//       <h4 className="text-xs font-semibold text-white/40 mb-3 uppercase">
//         Shared Resources
//       </h4>

//       <div className="space-y-3">
//         {sharedResources.length === 0 && (
//           <p className="text-xs text-white/40">
//             No shared files yet
//           </p>
//         )}

//         {sharedResources.map((m, i) => (
//           <a
//             key={i}
//             href={m.attachment.url}
//             target="_blank"
//             className="px-3 py-2 bg-[#151515] rounded-lg text-xs block hover:bg-white/10"
//           >
//             📎 {m.attachment.name}
//           </a>
//         ))}
//       </div>
//     </div>
//   </aside>
// )}




//       {incomingCall && (
//   <div className="fixed inset-0 z-[999999] bg-black/70 flex items-center justify-center">
//     <div className="w-[360px] bg-[#121212] rounded-2xl p-6 text-white text-center">

//       <p className="text-lg font-semibold mb-1">
//         Incoming Video Call
//       </p>
//       <p className="text-sm text-white/60 mb-6">
//         {incomingCall.fromUser.name} is calling you
//       </p>

//       <div className="flex gap-4 justify-center">
//         {/* ACCEPT */}
//       <button
//  onClick={async () => {
//   ringingAudio.current?.pause();

//   // 🔥 JOIN SAME CHANNEL
//   await joinCall(incomingCall.conversationId, user._id);

//   socket.emit("call-accepted", {
//     toUserId: incomingCall.fromUser._id,
//     conversationId: incomingCall.conversationId,
//   });

//   setIncomingCall(null);
// }}
// >
//   Accept
// </button>



//         {/* REJECT */}
//         <button
//           onClick={() => {
//             socket.emit("end-call", {
//               toUserId: incomingCall.fromUser._id,
//             });
//             setIncomingCall(null);
//           }}
//           className="px-6 py-2 rounded-full bg-red-500"
//         >
//           Reject
//         </button>
//       </div>
//     </div>
//   </div>
// )}

//     </div>
//   );
// }





import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "@/lib/socket";
import { useAuth } from "@/contexts/AuthContext";
import {
  FiVideo,
  FiSend,
  FiPaperclip,
  FiArrowLeft,
  FiInfo,
} from "react-icons/fi";
import { useAgoraCall } from "@/hooks/useAgoraCall";

export default function ChatPage() {
  const { token, user } = useAuth() as any;
  const navigate = useNavigate();
  const ringingAudio = useRef<HTMLAudioElement | null>(null);

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvo, setActiveConvo] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [showProfile, setShowProfile] = useState(true);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callType, setCallType] = useState<"video" | "audio">("video");
  const [showMobileList, setShowMobileList] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const callTimeoutRef = useRef<any>(null);

  const GRADIENT = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

  const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

  const { joinCall, leaveCall } = useAgoraCall();

  /* ================= LOAD CONVERSATIONS ================= */
  useEffect(() => {
    fetch(`${API_BASE}/api/chat/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => d.success && setConversations(d.conversations));
  }, [token]);

  useEffect(() => {
    ringingAudio.current = new Audio("/sounds/messenger.mp3");
    ringingAudio.current.loop = true;
  }, []);

  /* ================= LOAD MESSAGES ================= */
  useEffect(() => {
    if (!activeConvo) return;

   fetch(`${API_BASE}/api/chat/messages/${activeConvo._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => d.success && setMessages(d.messages));

    socket.emit("join-chat", { conversationId: activeConvo._id });
  }, [activeConvo, token]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    socket.on("new-message", (msg) => {
      if (msg.conversationId === activeConvo?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => socket.off("new-message");
  }, [activeConvo]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.on("call-accepted", async ({ conversationId }) => {
      await joinCall(conversationId, user._id, true);
    });

    return () => socket.off("call-accepted");
  }, [joinCall, user?._id]);

  useEffect(() => {
    socket.on("incoming-call", ({ fromUser, conversationId, type }) => {
      setIncomingCall({ fromUser, conversationId, type });
      setCallType(type || "video");

      ringingAudio.current
        ?.play()
        .catch(() => {
          /* autoplay may fail until user gesture */
        });

      callTimeoutRef.current = setTimeout(() => {
        ringingAudio.current?.pause();
        setIncomingCall(null);

        socket.emit("missed-call", {
          toUserId: fromUser._id,
          conversationId,
        });
      }, 30000);
    });

    socket.on("call-ended", () => {
      ringingAudio.current?.pause();
      leaveCall();
      setIncomingCall(null);
    });

    socket.on("call-accepted", ({ conversationId }) => {
      clearTimeout(callTimeoutRef.current);
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-ended");
      socket.off("call-accepted");
    };
  }, [leaveCall]);

  /* ================= SEND ================= */
  const sendMessage = () => {
    if (!input.trim() || !activeConvo) return;

    socket.emit("send-message", {
      conversationId: activeConvo._id,
      senderId: user._id,
      text: input,
    });
    setInput("");
  };

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    socket.on("incoming-call", ({ fromUser, conversationId, type }) => {
      setIncomingCall({
        fromUser,
        conversationId,
        type,
      });
      setCallType(type || "video");
    });

    socket.on("call-ended", () => {
      leaveCall();
      setIncomingCall(null);
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-ended");
    };
  }, [leaveCall]);

  const handleAttachment = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !activeConvo) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversationId", activeConvo._id);

    const res = await fetch(`${API_BASE}/api/chat/attachment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (data?.message) {
      setMessages((prev) => [...prev, data.message]);
      socket.emit("new-message", data.message);
    }
  };

  const connectGoogle = () => {
    const w = 500;
    const h = 600;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;

window.open(
  `${API_BASE}/api/auth/google`,
  "googleAuth",
  `width=${w},height=${h},left=${left},top=${top}`
);
  };

  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (e.data?.success) {
        alert("Google connected successfully");
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  const startMeetCall = async () => {
    if (!activeConvo) return;

   fetch(`${API_BASE}/api/google-meet/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: `Meeting with ${activeConvo.otherUser.name}`,
      }),
    });

    const data = await res.json();

    if (data.error === "google_not_connected") {
      connectGoogle();
      return;
    }

    socket.emit("send-message", {
      conversationId: activeConvo._id,
      senderId: user._id,
      text: `📞 Google Meet: ${data.meetLink}`,
    });

    window.open(data.meetLink, "_blank");
  };

  const sharedResources = messages.filter((m) => m.attachment);

  const renderMessageText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.split(urlRegex).map((part, i) =>
      part.match(urlRegex) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline hover:text-blue-300 break-all"
        >
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="h-screen flex bg-[#020617] text-white overflow-hidden relative">
      {/* ================= LEFT SIDEBAR ================= */}
    <aside
  className={`
    ${activeConvo && !showMobileList ? "hidden" : "flex"}
    md:flex flex-col
    w-full md:w-[320px] lg:w-[340px]
    border-r border-white/10 bg-[#0F0F11]
  `}
>
  <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0F0F11]">
    <div className="flex md:hidden items-center gap-3 px-4 py-4">
      <button
        onClick={() => navigate("/smartgen")}
        className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0"
      >
        <FiArrowLeft />
      </button>

      <div>
        <p className="text-base font-bold text-white">Messages</p>
        <p className="text-xs text-white/50">All conversations</p>
      </div>
    </div>

    <div className="hidden md:block p-5 text-lg font-bold">Messages</div>
  </div>

  <div className="overflow-y-auto flex-1">
          {conversations.map((c) => (
            <div
              key={c._id}
              onClick={() => {
                setActiveConvo(c);
                setShowMobileList(false);
              }}
              className={`px-4 md:px-5 py-4 cursor-pointer flex gap-3 transition ${
                activeConvo?._id === c._id
                  ? "bg-white/10"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-tr from-pink-500 to-blue-500 flex items-center justify-center font-bold shrink-0">
                {c.otherUser?.name?.[0]}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {c.otherUser?.name}
                </p>
                <p className="text-xs text-white/50 truncate">
                  {c.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ================= CHAT ================= */}
      <main
        className={`
          ${!activeConvo || showMobileList ? "hidden md:flex" : "flex"}
          flex-1 flex-col min-w-0
        `}
      >
        {/* HEADER */}
        {activeConvo && (
          <header className="flex items-center justify-between gap-3 px-3 sm:px-4 md:px-6 py-3 md:py-4 border-b border-white/10 bg-[#0F0F11]">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile back */}
              <button
                onClick={() => {
                  setShowMobileList(true);
                }}
                className="md:hidden w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0"
              >
                <FiArrowLeft />
              </button>

              {/* Desktop profile nav */}
              <button
             onClick={() => navigate("/smartgen")}
                className="hidden md:flex w-9 h-9 rounded-full text-white items-center justify-center shrink-0"
                style={{ background: GRADIENT }}
              >
                <FiArrowLeft />
              </button>

              <div className="min-w-0">
                <p className="font-bold truncate">
                  {activeConvo.otherUser?.name}
                </p>
                <p className="text-xs text-green-400 truncate">Active now</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={startMeetCall}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center"
              >
                <FiVideo className="text-white" />
              </button>

              <button
                onClick={() => setShowProfile((v) => !v)}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center"
              >
                <FiInfo />
              </button>

              <button
                onClick={async () => {
                  if (!confirm("Delete this chat?")) return;

                 await fetch(`${API_BASE}/api/chat/conversation/${activeConvo._id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                  });

                  setActiveConvo(null);
                  setMessages([]);
                  setShowMobileList(true);
                  setConversations((prev) =>
                    prev.filter((c) => c._id !== activeConvo._id)
                  );
                }}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center"
              >
                🗑
              </button>
            </div>
          </header>
        )}

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 md:py-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m._id}
              className={`flex ${
                m.sender === user._id ? "justify-end" : "justify-start"
              }`}
            >
              <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[70%]">
                {/* TEXT */}
                {m.text && (
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm break-words ${
                      m.sender === user._id
                        ? "text-white"
                        : "bg-[#1C1C1C] text-white"
                    }`}
                    style={m.sender === user._id ? { background: GRADIENT } : {}}
                  >
                    {renderMessageText(m.text)}
                  </div>
                )}

                {/* ATTACHMENT */}
                {m.attachment && (
                  <div className="mt-2">
                    {m.attachment.type === "image" ? (
                      <img
                        src={m.attachment.url}
                        className="rounded-lg max-w-[180px] sm:max-w-[220px] md:max-w-[240px]"
                      />
                    ) : (
                      <a
                        href={m.attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline text-blue-400 break-all"
                      >
                        📎 {m.attachment.name}
                      </a>
                    )}
                  </div>
                )}

                {/* TIME */}
                <p className="text-[10px] text-white/40 mt-1 text-right">
                  {formatTime(m.createdAt)}
                </p>
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        {activeConvo && (
          <div className="border-t border-white/10 p-3 sm:p-4 md:p-5 bg-[#0F0F11]">
            <div className="flex items-center gap-2 sm:gap-3 bg-[#151515] rounded-full px-3 sm:px-4 py-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0"
              >
                <FiPaperclip />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={handleAttachment}
              />

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 min-w-0 bg-transparent outline-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />

              <button
                onClick={sendMessage}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: GRADIENT }}
              >
                <FiSend />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ================= EMPTY STATE DESKTOP ================= */}
      {!activeConvo && (
        <div className="hidden md:flex flex-1 items-center justify-center text-white/40 text-sm">
          Select a conversation to start chatting
        </div>
      )}

      {/* ================= MOBILE PROFILE OVERLAY ================= */}
      {showProfile && activeConvo && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowProfile(false)}
        />
      )}

      {/* ================= RIGHT PROFILE ================= */}
      {showProfile && activeConvo && (
        <aside
          className={`
            fixed md:static top-0 right-0 h-full z-50
            w-[85vw] max-w-[320px] md:w-[300px]
            border-l border-white/10 bg-[#0F0F11] p-6
            shadow-2xl md:shadow-none
            overflow-y-auto
          `}
        >
          <div className="flex items-center justify-between md:block mb-4 md:mb-0">
            <h3 className="text-sm font-semibold md:hidden">Profile</h3>
            <button
              onClick={() => setShowProfile(false)}
              className="md:hidden w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          <div className="text-center">
            {/* PROFILE IMAGE / INITIAL */}
            <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden mb-4 bg-gradient-to-tr from-pink-500 to-blue-500 flex items-center justify-center">
              {activeConvo?.otherUser?.avatar ? (
                <img
                  src={`${API_BASE}${activeConvo.otherUser.avatar}`}
                  alt={activeConvo.otherUser.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {activeConvo.otherUser?.name?.[0]}
                </span>
              )}
            </div>

            {/* NAME */}
            <h3 className="font-bold">{activeConvo.otherUser?.name}</h3>

            {/* OPTIONAL ROLE / STATUS */}
            <p className="text-xs text-white/50 mb-6">
              {activeConvo.otherUser?.role || "User"}
            </p>

            {/* SHARED FILES */}
            <h4 className="text-xs font-semibold text-white/40 mb-3 uppercase">
              Shared Resources
            </h4>

            <div className="space-y-3">
              {sharedResources.length === 0 && (
                <p className="text-xs text-white/40">No shared files yet</p>
              )}

              {sharedResources.map((m, i) => (
                <a
                  key={i}
                  href={m.attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-[#151515] rounded-lg text-xs block hover:bg-white/10 break-all"
                >
                  📎 {m.attachment.name}
                </a>
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* ================= INCOMING CALL ================= */}
      {incomingCall && (
        <div className="fixed inset-0 z-[999999] bg-black/70 flex items-center justify-center px-4">
          <div className="w-[92vw] max-w-[360px] bg-[#121212] rounded-2xl p-6 text-white text-center">
            <p className="text-lg font-semibold mb-1">
              Incoming {callType === "audio" ? "Audio" : "Video"} Call
            </p>
            <p className="text-sm text-white/60 mb-6">
              {incomingCall.fromUser.name} is calling you
            </p>

            <div className="flex gap-4 justify-center">
              {/* ACCEPT */}
              <button
                onClick={async () => {
                  clearTimeout(callTimeoutRef.current);
                  ringingAudio.current?.pause();

                  await joinCall(incomingCall.conversationId, user._id);

                  socket.emit("call-accepted", {
                    toUserId: incomingCall.fromUser._id,
                    conversationId: incomingCall.conversationId,
                  });

                  setIncomingCall(null);
                }}
                className="px-6 py-2 rounded-full bg-green-500 text-black font-medium"
              >
                Accept
              </button>

              {/* REJECT */}
              <button
                onClick={() => {
                  clearTimeout(callTimeoutRef.current);
                  ringingAudio.current?.pause();

                  socket.emit("end-call", {
                    toUserId: incomingCall.fromUser._id,
                  });
                  setIncomingCall(null);
                }}
                className="px-6 py-2 rounded-full bg-red-500 text-white font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}