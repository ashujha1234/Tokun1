// // import React, { useState } from "react";
// // import { Dialog, DialogContent } from "@/components/ui/dialog";
// // import { MdOutlineAttachment } from "react-icons/md";

// // interface RequestToBuyModalProps {
// //   open: boolean;
// //   onOpenChange: (open: boolean) => void;
// //   promptTitle: string;
// //   price: number;
// //   ownerEmail?: string;
// //   thumbnail?: string;
// // }

// // export default function RequestToBuyModal({
// //   open,
// //   onOpenChange,
// //   promptTitle,
// //   price,
// //   ownerEmail,
// //   thumbnail,
// // }: RequestToBuyModalProps) {
// //   const [message, setMessage] = useState("");

// //   const handleSend = () => {
// //     // TODO: Replace with your API call later
// //     console.log("Send request:", { message, ownerEmail });
// //     onOpenChange(false);
// //   };

// //   return (
// //     <Dialog open={open} onOpenChange={onOpenChange}>
// //       <DialogContent
// //         className="
// //           bg-[#17171A] text-white border-none rounded-2xl
// //           w-[min(96vw,480px)] p-6 shadow-xl
// //         "
// //       >
// //         {/* Header */}
// //         <div className="flex items-center justify-between mb-5">
// //           <h2 className="text-[18px] font-semibold">Request to Buy</h2>
// //         </div>

// //         {/* Product Info */}
// //         <div className="flex items-center gap-4 mb-6">
// //           <img
// //             src={thumbnail || "/icons/fallback.png"}
// //             alt="Product"
// //             className="w-14 h-14 rounded-lg object-cover"
// //           />
// //           <div className="flex-1">
// //             <h3 className="font-medium text-[15px] text-white">{promptTitle}</h3>
// //             <p className="text-sm text-gray-400 leading-snug">
// //               Create an engaging product description
// //             </p>
// //           </div>
// //           <div className="text-right font-semibold text-[16px]">
// //             ₹{price.toLocaleString()}
// //           </div>
// //         </div>

// //         {/* Owner email */}
// //         <div className="mb-4">
// //           <label className="block text-sm mb-1 text-gray-400">Owner email</label>
// //           <input
// //             type="email"
// //             value={ownerEmail || ""}
// //             disabled
// //             className="w-full bg-[#222225] border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-sm"
// //           />
// //         </div>

// //         {/* Message Box */}
// //         <div className="mb-4">
// //           <label className="block text-sm mb-1 text-gray-400">Your message here</label>
// //           <textarea
// //             value={message}
// //             onChange={(e) => setMessage(e.target.value)}
// //             placeholder="Add a personal note (optional)"
// //             maxLength={500}
// //             rows={4}
// //             className="w-full bg-[#222225] border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-sm resize-none"
// //           />
// //           <div className="text-xs text-gray-500 mt-1 text-right">
// //             {message.length}/500
// //           </div>
// //         </div>

// //         {/* Bottom Section: Attachment + Buttons */}
// //         <div className="flex items-center justify-between mt-8 border-t border-white/10 pt-5">
// //           {/* Left: Attachment Icon */}
// //           <div className="flex items-center gap-3">
// //             <div className="w-9 h-9 rounded-full bg-[#222225] flex items-center justify-center">
// //               <MdOutlineAttachment className="text-white text-[20px]" />
// //             </div>
          
// //           </div>

// //           {/* Right: Buttons */}
// //           <div className="flex items-center gap-3">
// //             <button
// //               onClick={() => onOpenChange(false)}
// //               className="px-4 py-2 rounded-md bg-transparent border border-white/20 text-white hover:bg-white/10 transition-all"
// //             >
// //               Cancel
// //             </button>

// //             <button
// //               onClick={handleSend}
// //               className="px-5 py-2 rounded-md text-white bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] hover:opacity-90 transition-all"
// //             >
// //               Send
// //             </button>
// //           </div>
// //         </div>
// //       </DialogContent>
// //     </Dialog>
// //   );
// // }



// import React, { useEffect, useState } from "react";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { MdOutlineAttachment } from "react-icons/md";

// interface Member {
//   userId: string;
//   email: string;
// }

// interface RequestToBuyModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   promptId: string;
//   promptTitle: string;
//   price: number;
//   ownerEmail?: string;
//   thumbnail?: string;
//   userType: "ORG" | "TM"; // 👈 pass from parent
//   role?: "Owner" | "Admin" | "TM";
// }

// export default function RequestToBuyModal({
//   open,
//   onOpenChange,
//   promptId,
//   promptTitle,
//   price,
//   ownerEmail,
//   thumbnail,
//   userType,
//   role,
// }: RequestToBuyModalProps) {
//   const [message, setMessage] = useState("");
//   const [members, setMembers] = useState<Member[]>([]);
//   const [selectedMember, setSelectedMember] = useState("");

//   const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
//   const token = localStorage.getItem("token");

//   // ✅ If owner → fetch member email list
//   useEffect(() => {
//     if (userType === "ORG" && role === "Owner" && open) {
//       fetchMembers();
//     }
//   }, [open]);

//   async function fetchMembers() {
//     try {
//       const res = await fetch(`${API_BASE}/api/org/members/emaillist`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (data.success) {
//         setMembers(data.members[0] || []);
//       }
//     } catch (err) {
//       console.error("Failed to fetch members:", err);
//     }
//   }

//   const handleSend = async () => {
//     try {
//       let url = "";
//       let body: any = {};

//       if (userType === "TM") {
//         // ✅ Team member → request prompt
//         url = `${API_BASE}/api/prompt-collab/team/request/${promptId}`;
//         body = { message };
//       } else if (userType === "ORG" && role === "Owner") {
//         // ✅ Org owner → suggest prompt to a member
//         if (!selectedMember) {
//           alert("Please select a member");
//           return;
//         }
//         url = `${API_BASE}/api/prompt-collab/org/suggest/${promptId}`;
//         body = { memberId: selectedMember, message };
//       }

//       const res = await fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(body),
//       });

//       const data = await res.json();
//       if (data.success) {
//         alert("✅ Request sent successfully!");
//         onOpenChange(false);
//         setMessage("");
//         setSelectedMember("");
//       } else {
//         alert("❌ " + data.error || "Failed to send request");
//       }
//     } catch (err) {
//       console.error("❌ handleSend error:", err);
//       alert("Something went wrong. Please try again.");
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent
//         className="
//           bg-[#17171A] text-white border-none rounded-2xl
//           w-[min(96vw,480px)] p-6 shadow-xl
//         "
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between mb-5">
//           <h2 className="text-[18px] font-semibold">Request to Buy</h2>
//         </div>

//         {/* Product Info */}
//         <div className="flex items-center gap-4 mb-6">
//           <img
//             src={thumbnail || "/icons/fallback.png"}
//             alt="Product"
//             className="w-14 h-14 rounded-lg object-cover"
//           />
//           <div className="flex-1">
//             <h3 className="font-medium text-[15px] text-white">{promptTitle}</h3>
//             <p className="text-sm text-gray-400 leading-snug">
//               Create an engaging product description
//             </p>
//           </div>
//           <div className="text-right font-semibold text-[16px]">
//             ₹{price.toLocaleString()}
//           </div>
//         </div>

//         {/* Dynamic email input */}
//         {userType === "TM" ? (
//           <div className="mb-4">
//             <label className="block text-sm mb-1 text-gray-400">Owner email</label>
//             <input
//               type="email"
//               value={ownerEmail || ""}
//               disabled
//               className="w-full bg-[#222225] border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-sm"
//             />
//           </div>
//         ) : (
//           <div className="mb-4">
//             <label className="block text-sm mb-1 text-gray-400">Select Member</label>
//             <select
//               value={selectedMember}
//               onChange={(e) => setSelectedMember(e.target.value)}
//               className="w-full bg-[#222225] border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-sm"
//             >
//               <option value="">-- Select a member --</option>
//               {members.map((m) => (
//                 <option key={m.userId} value={m.userId}>
//                   {m.email}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         {/* Message Box */}
//         <div className="mb-4">
//           <label className="block text-sm mb-1 text-gray-400">Your message here</label>
//           <textarea
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder="Add a personal note (optional)"
//             maxLength={500}
//             rows={4}
//             className="w-full bg-[#222225] border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-sm resize-none"
//           />
//           <div className="text-xs text-gray-500 mt-1 text-right">
//             {message.length}/500
//           </div>
//         </div>

//         {/* Bottom Section */}
//         <div className="flex items-center justify-between mt-8 border-t border-white/10 pt-5">
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-full bg-[#222225] flex items-center justify-center">
//               <MdOutlineAttachment className="text-white text-[20px]" />
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => onOpenChange(false)}
//               className="px-4 py-2 rounded-md bg-transparent border border-white/20 text-white hover:bg-white/10 transition-all"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSend}
//               className="px-5 py-2 rounded-md text-white bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] hover:opacity-90 transition-all"
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }


import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MdOutlineAttachment } from "react-icons/md";

interface Member {
  userId: string;
  email: string;
}

interface RequestToBuyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptId: string;
  promptTitle: string;
  price: number;
  ownerEmail?: string;
  thumbnail?: string;
  userType: "ORG" | "TM"; // 👈 pass from parent
  role?: "Owner" | "Admin" | "TM";
}

export default function RequestToBuyModal({
  open,
  onOpenChange,
  promptId,
  promptTitle,
  price,
  ownerEmail,
  thumbnail,
  userType,
  role,
}: RequestToBuyModalProps) {
  const [message, setMessage] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  // ✅ Fetch members list when Owner opens modal
  useEffect(() => {
    if (userType === "ORG" && role === "Owner" && open) {
      fetchMembers();
    }
  }, [open]);

  async function fetchMembers() {
    try {
      setLoadingMembers(true);
      const res = await fetch(`${API_BASE}/api/org/members/emaillist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMembers(data.members || []);
      } else {
        console.error("Failed to load members:", data.error);
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoadingMembers(false);
    }
  }

  const handleSend = async () => {
    try {
      let url = "";
      let body: any = {};

      if (userType === "TM") {
        // ✅ Team member requests prompt from owner
        url = `${API_BASE}/api/prompt-collab/team/request/${promptId}`;
        body = { message };
      } else if (userType === "ORG" && role === "Owner") {
        // ✅ Org owner suggests prompt to a member
        if (!selectedMember) {
          alert("Please select a member");
          return;
        }
        url = `${API_BASE}/api/prompt-collab/org/suggest/${promptId}`;
        body = { memberId: selectedMember, message };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Request sent successfully!");
        onOpenChange(false);
        setMessage("");
        setSelectedMember("");
      } else {
        alert("❌ " + (data.error || "Failed to send request"));
      }
    } catch (err) {
      console.error("❌ handleSend error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          bg-[#17171A] text-white border-none rounded-2xl
          w-[min(96vw,480px)] p-6 shadow-xl
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-semibold">Request to Buy</h2>
        </div>

        {/* Product Info */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={thumbnail || "/icons/fallback.png"}
            alt="Product"
            className="w-14 h-14 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h3 className="font-medium text-[15px] text-white">{promptTitle}</h3>
            <p className="text-sm text-gray-400 leading-snug">
              Create an engaging product description
            </p>
          </div>
          <div className="text-right font-semibold text-[16px]">
            ₹{price.toLocaleString()}
          </div>
        </div>

        {/* Owner Email (for Team Member) or Member Selector (for Owner) */}
        {userType === "TM" ? (
          <div className="mb-4">
            <label className="block text-sm mb-1 text-gray-400">Owner email</label>
            <input
              type="email"
              value={ownerEmail || ""}
              disabled
              className="w-full bg-[#222225] border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-sm"
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm mb-1 text-gray-400">Select Member</label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full bg-[#222225] border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-sm"
              disabled={loadingMembers}
            >
              {loadingMembers ? (
                <option>Loading members...</option>
              ) : (
                <>
                  <option value="">-- Select a member --</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.email}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        )}

        {/* Message Box */}
        <div className="mb-4">
          <label className="block text-sm mb-1 text-gray-400">Your message here</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal note (optional)"
            maxLength={500}
            rows={4}
            className="w-full bg-[#222225] border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-sm resize-none"
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            {message.length}/500
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between mt-8 border-t border-white/10 pt-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#222225] flex items-center justify-center">
              <MdOutlineAttachment className="text-white text-[20px]" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-md bg-transparent border border-white/20 text-white hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="px-5 py-2 rounded-md text-white bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] hover:opacity-90 transition-all"
            >
              Send
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
