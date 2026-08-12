import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PromptThumb from "@/components/PromptThumb";
import { toast } from "@/components/ui/use-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Member {
  userId: string;
  email: string;
}

interface ShareWithTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptId: string;
  promptTitle: string;
  thumbnail?: string;
}

export default function ShareWithTeamModal({
  open,
  onOpenChange,
  promptId,
  promptTitle,
  thumbnail,
}: ShareWithTeamModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSelected([]);
    fetchMembers();
  }, [open]);

  async function fetchMembers() {
    try {
      setLoadingMembers(true);
      const res = await fetch(`${API_BASE}/api/org/members/emaillist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMembers(data.members || []);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoadingMembers(false);
    }
  }

  const allSelected = members.length > 0 && selected.length === members.length;

  const toggleAll = () => {
    setSelected(allSelected ? [] : members.map((m) => m.userId));
  };

  const toggleOne = (userId: string) => {
    setSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleShare = async () => {
    if (!selected.length) {
      setError("Select at least one team member.");
      return;
    }
    try {
      setSending(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/prompt-collab/org/share/${promptId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ memberIds: selected }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || data.error || "Failed to share prompt.");
      }
      toast({
        title: "Shared with your team",
        description: `${selected.length} member${selected.length === 1 ? "" : "s"} now have access.`,
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
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
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-semibold">Share with Team</h2>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <PromptThumb src={thumbnail} alt={promptTitle} />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-[15px] text-white">{promptTitle}</h3>
            <p className="text-sm text-gray-400 leading-snug">
              Give your team read access to this prompt
            </p>
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm text-gray-400">Select members</label>
          {members.length > 0 && (
            <button
              onClick={toggleAll}
              className="text-xs text-[#1A73E8] hover:underline"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          )}
        </div>

        <div className="max-h-56 overflow-y-auto rounded-lg border border-white/10 bg-[#222225]">
          {loadingMembers ? (
            <div className="px-3 py-4 text-sm text-gray-400">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-400">No team members yet.</div>
          ) : (
            <>
              {/* An explicit "everyone" row — with a long roster, the small
                  link above the list is easy to miss. */}
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
                  checked={selected.includes(m.userId)}
                  onChange={() => toggleOne(m.userId)}
                  className="accent-[#FF14EF]"
                />
                <span className="text-sm text-gray-200">{m.email}</span>
              </label>
              ))}
            </>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="flex items-center justify-end gap-3 mt-8 border-t border-white/10 pt-5">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-md bg-transparent border border-white/20 text-white hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={sending}
            className="px-5 py-2 rounded-md text-white bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] hover:opacity-90 transition-all disabled:opacity-50"
          >
            {sending ? "Sharing…" : "Share"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
