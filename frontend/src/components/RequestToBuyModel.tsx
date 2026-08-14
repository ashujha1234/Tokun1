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
import PromptThumb from "@/components/PromptThumb";
import { toast } from "@/components/ui/use-toast";

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
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [sending, setSending] = useState(false);
  // The org this user belongs to, resolved from the server. A TM needs it to
  // know who their request actually goes to — the prompt's seller email is a
  // different person entirely.
  const [org, setOrg] = useState<{ orgId?: string; ownerEmail?: string } | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  // Both sides need this call: the Owner for the member checkboxes, the TM for
  // their org id + owner email. It was previously fired for the Owner only,
  // which is why nothing org-related reached the TM view.
  useEffect(() => {
    if (!open) return;
    setSelectedMembers([]);
    fetchOrgDirectory();
  }, [open]);

  async function fetchOrgDirectory() {
    try {
      setLoadingMembers(true);
      const res = await fetch(`${API_BASE}/api/org/members/emaillist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMembers(data.members || []);
        setOrg({ orgId: data.orgId, ownerEmail: data.owner?.email });
      } else {
        console.error("Failed to load org directory:", data.error);
      }
    } catch (err) {
      console.error("Failed to fetch org directory:", err);
    } finally {
      setLoadingMembers(false);
    }
  }

  const allSelected =
    members.length > 0 && selectedMembers.length === members.length;

  const toggleAll = () =>
    setSelectedMembers(allSelected ? [] : members.map((m) => m.userId));

  const toggleOne = (userId: string) =>
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );

  const handleSend = async () => {
    try {
      let url = "";
      let body: any = {};

      if (userType === "TM") {
        // ✅ Team member requests prompt from owner
        url = `${API_BASE}/api/prompt-collab/team/request/${promptId}`;
        body = { message };
      } else if (userType === "ORG" && role === "Owner") {
        if (!selectedMembers.length) {
          toast({
            title: "Select a member",
            description: "Pick at least one team member to share this with.",
          });
          return;
        }
        // /org/share, not /org/suggest.
        //
        // These are two different actions and this modal was calling the wrong
        // one. `suggest` only fires a "have a look at this" notification — it
        // grants no access and writes no SharedPrompt row, so the share never
        // appeared under "Recently Shared with Team" on the org dashboard and
        // the member still couldn't open the prompt. `share` records the
        // SharedPrompt (which /shared/team checks before revealing promptText)
        // and notifies the member, which is what a button labelled "Share with
        // your team" is expected to do.
        url = `${API_BASE}/api/prompt-collab/org/share/${promptId}`;
        body = { memberIds: selectedMembers, message };
      }

      setSending(true);
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
        toast({
          title: userType === "TM" ? "Request sent" : "Shared with your team",
          description:
            userType === "TM"
              ? "Your organization owner has been notified."
              : `${selectedMembers.length} member${
                  selectedMembers.length === 1 ? "" : "s"
                } notified.`,
        });
        onOpenChange(false);
        setMessage("");
        setSelectedMembers([]);
      } else {
        toast({
          title: "Couldn't send",
          description: data.error || "Failed to send request.",
        });
      }
    } catch (err) {
      console.error("❌ handleSend error:", err);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
      });
    } finally {
      setSending(false);
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
        {/* Header — this modal does two different jobs (a TM asking the Owner
            to buy, an Owner suggesting a prompt to a member), so the title has
            to say which one is happening. */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-semibold">
            {userType === "TM" ? "Request to Buy" : "Share with your team"}
          </h2>
        </div>

        {/* Product Info */}
        <div className="flex items-center gap-4 mb-6">
          <PromptThumb src={thumbnail} alt={promptTitle} />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-[15px] text-white">{promptTitle}</h3>
            <p className="text-sm text-gray-400 leading-snug">
              {userType === "TM"
                ? "Ask your owner to buy this for you"
                : "Suggest this product to a team member"}
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
              // The org owner, resolved from the org directory. The prop
              // fallback is the prompt's seller, which is who this request is
              // ABOUT, not who it goes TO.
              value={org?.ownerEmail || ownerEmail || ""}
              disabled
              placeholder={loadingMembers ? "Loading…" : "Owner email unavailable"}
              className="w-full bg-[#222225] border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-sm"
            />
          </div>
        ) : (
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm text-gray-400">
                Select members
                {selectedMembers.length > 0 && (
                  <span className="ml-1 text-gray-500">
                    ({selectedMembers.length} selected)
                  </span>
                )}
              </label>
              {members.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs text-[#1A73E8] hover:underline"
                >
                  {allSelected ? "Deselect all" : `Select all (${members.length})`}
                </button>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-[#222225]">
              {loadingMembers ? (
                <div className="px-3 py-4 text-sm text-gray-400">Loading members…</div>
              ) : members.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-400">No team members yet.</div>
              ) : (
                <>
                  {/* "All" as its own row — with 10+ members, hunting for the
                      link above the box is the slow path. */}
                  <label className="flex items-center gap-3 px-3 py-2.5 border-b border-white/10 cursor-pointer hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="accent-[#FF14EF]"
                    />
                    <span className="text-sm font-medium text-gray-100">
                      Everyone in the team ({members.length})
                    </span>
                  </label>

                  {members.map((m) => (
                    <label
                      key={m.userId}
                      className="flex items-center gap-3 px-3 py-2.5 border-b border-white/5 last:border-b-0 cursor-pointer hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(m.userId)}
                        onChange={() => toggleOne(m.userId)}
                        className="accent-[#FF14EF]"
                      />
                      <span className="text-sm text-gray-200">{m.email}</span>
                    </label>
                  ))}
                </>
              )}
            </div>
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

        {/* Bottom Section.
            The attachment icon that used to sit on the left was decorative only
            — no handler, nothing attachable in this flow — so it's gone and the
            actions align right. */}
        <div className="flex items-center justify-end mt-8 border-t border-white/10 pt-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-md bg-transparent border border-white/20 text-white hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="px-5 py-2 rounded-md text-white bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] hover:opacity-90 transition-all disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
