



import React, { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TokenUsageSection from "@/components/TokenUsageSection";
import { Pencil, Trash2, Plus, X, ChevronDown, RefreshCcw, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Role = "Admin" | "Member";
type Status = "Active" | "Pending" | "Deleted";

type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  tokens: number;
  available: number;
  isDeletedFromOrg?: boolean;
};

type ApiMember = {
  _id: string;
  name?: string;
  email: string;
  role?: string;
  isVerified?: boolean;
  isDeletedFromOrg?: boolean;
  orgTokensRemaining?: number;
  orgAssignedCap?: number;
};

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";
const ORG_LIMIT = 100_000;

/* ---------------- Metric Card ---------------- */
function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <div
  className="w-full border border-white/10 bg-[#121316] text-white flex items-center gap-3 px-4 h-20 rounded-2xl"
>
      {icon && (
        <div className="inline-grid place-items-center w-8 h-8 rounded-full bg-white/5 shrink-0">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-sm text-white/70 truncate">{label}</div>
        <div className="text-xl font-semibold truncate">{value}</div>
      </div>
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
      className="w-full h-11 rounded-lg bg-[#1A1B1F] border border-white/10 px-3 outline-none"
      placeholder={placeholder}
    />
  );
}

/* ---------------- Add/Edit Member Modal ---------------- */
function MemberModal({
  open,
  mode,
  initialMember,
  onClose,
  onAdd,
  onUpdate,
  members = [],
  onRemove,
  onChangeRole,
  remainingTokens,
  onRefresh,
}: {
  open: boolean;
  mode: "add" | "edit" | "rejoin";

  initialMember?: Member | null;
  onClose: () => void;
  onAdd: (m: Member) => void;
  onUpdate: (email: string, updates: Partial<Member>) => void;
  members?: Member[];
  onRemove: (email: string) => void;
  onChangeRole: (email: string, role: Role) => void;
  remainingTokens: number;
  onRefresh: () => Promise<void>;
}) {
  const { token } = useAuth();
  const editing = mode === "edit";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Member");
  const [distribution, setDistribution] = useState<string>("");
  const [loading, setLoading] = useState(false);
const rejoining = mode === "rejoin";

useEffect(() => {
  if (!open) return;

  if ((editing || rejoining) && initialMember) {
    // ✅ Prefill name and email in both edit and rejoin mode
    setFullName(initialMember.name || "");
    setEmail(initialMember.email || "");
    setRole(initialMember.role || "Member");
    setDistribution(String(initialMember.tokens || ""));
  } else {
    // default for add mode
    setFullName("");
    setEmail("");
    setRole("Member");
    setDistribution("");
  }
}, [open, editing, rejoining, initialMember]);


  if (!open) return null;

  const currentTokens = editing && initialMember ? initialMember.tokens : 0;
  const effectiveRemaining = remainingTokens + currentTokens;
  const canSubmit =
    (editing || (fullName.trim() && email.trim())) &&
    distribution.trim() &&
    Number(distribution) > 0;

  const presets = [5000, 10000, 15000, 20000];

  // const handleSubmit = async () => {
  //   if (!canSubmit) return;
  //   const amount = Number(distribution);
  //   if (amount > effectiveRemaining) {
  //     window.alert(
  //       `Only ${effectiveRemaining.toLocaleString()} tokens available for allocation.`
  //     );
  //     return;
  //   }
  //   if (!token) {
  //     window.alert("You must be logged in.");
  //     return;
  //   }

  //   const normEmail = email.trim().toLowerCase();
  //   const displayName = fullName.trim() || normEmail.split("@")[0] || "User";
  //   const apiRole = role === "Admin" ? "Admin" : "Member";

  //   // -------- EDIT --------
  //   if (editing && initialMember) {
  //     try {
  //       const url = `${API_BASE}/api/org/members/edit/${initialMember.id}`;
  //       const body: any = {};
  //       if (apiRole) body.role = apiRole;
  //       if (!Number.isNaN(Number(distribution)) && distribution.trim()) {
  //         body.tokens = Number(distribution);
  //       }

  //       const res = await fetch(url, {
  //         method: "PATCH",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify(body),
  //       });

  //       const data = await res.json().catch(() => ({} as any));

  //       if (!res.ok || !data?.success) {
  //         window.alert(`Update failed: ${data?.error || "unknown_error"}`);
  //         return;
  //       }

  //       onUpdate(initialMember.email, {
  //         role,
  //         tokens: body.tokens,
  //         available: body.tokens,
  //       });

  //       await onRefresh();
  //       onClose();
  //     } catch (e) {
  //       window.alert("Update failed due to a network/server error.");
  //     }
  //     return;
  //   }

  //   // -------- ADD --------
  //   try {
  //     setLoading(true);
  //     const payload = {
  //       members: [
  //         { name: displayName, email: normEmail, role: apiRole, tokens: amount },
  //       ],
  //     };
  //     const res = await fetch(`${API_BASE}/api/org/members/add`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     const data = await res.json().catch(() => ({} as any));

  //     if (!res.ok || !data?.success) {
  //       window.alert(
  //         `Invite failed: ${data?.error || data?.results?.[0]?.error || "unknown_error"}`
  //       );
  //       return;
  //     }

  //     const result = (data.results || [])[0];
  //     if (result?.success) {
  //       onAdd({
  //         id: `temp-${normEmail}`,
  //         name: displayName,
  //         email: normEmail,
  //         role,
  //         status: "Pending",
  //         tokens: amount,
  //         available: amount,
  //       });
  //       await onRefresh();
  //       onClose();
  //     } else {
  //       window.alert(`Invite not created: ${result?.error || "unknown_error"}`);
  //     }
  //   } catch (e) {
  //     window.alert("Invite failed due to a network/server error.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
  if (!canSubmit) return;
  const amount = Number(distribution);
  if (amount > effectiveRemaining) {
    window.alert(
      `Only ${effectiveRemaining.toLocaleString()} tokens available for allocation.`
    );
    return;
  }
  if (!token) {
    window.alert("You must be logged in.");
    return;
  }

  const normEmail = email.trim().toLowerCase();
  const displayName = fullName.trim() || normEmail.split("@")[0] || "User";
  const apiRole = role === "Admin" ? "Admin" : "Member";

  // -------- EDIT --------
  if (editing && initialMember) {
    try {
      const url = `${API_BASE}/api/org/members/edit/${initialMember.id}`;
      const body: any = {};
      if (apiRole) body.role = apiRole;
      if (!Number.isNaN(Number(distribution)) && distribution.trim()) {
        body.tokens = Number(distribution);
      }

      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.success) {
        window.alert(`Update failed: ${data?.error || "unknown_error"}`);
        return;
      }

      onUpdate(initialMember.email, {
        role,
        tokens: body.tokens,
        available: body.tokens,
      });

      await onRefresh();
      onClose();
    } catch (e) {
      window.alert("Update failed due to a network/server error.");
    }
    return;
  }

  // ✅ -------- REJOIN --------
  if (rejoining && initialMember) {
    try {
      const amount = parseInt(distribution, 10);
      if (isNaN(amount) || amount <= 0) {
        window.alert("Please enter a valid token amount.");
        return;
      }

      const res = await fetch(
        `${API_BASE}/api/org/members/rejoin/${initialMember.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: apiRole, tokens: amount }),
        }
      );

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.success) {
        window.alert(`Rejoin failed: ${data?.error || "unknown_error"}`);
        return;
      }

      window.alert("✅ Member rejoined successfully.");
      await onRefresh();
      onClose();
    } catch (e) {
      window.alert("Rejoin failed due to a network/server error.");
    }
    return;
  }

  // -------- ADD --------
  try {
    setLoading(true);
    const payload = {
      members: [
        { name: displayName, email: normEmail, role: apiRole, tokens: amount },
      ],
    };
    const res = await fetch(`${API_BASE}/api/org/members/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({} as any));

    if (!res.ok || !data?.success) {
      window.alert(
        `Invite failed: ${
          data?.error || data?.results?.[0]?.error || "unknown_error"
        }`
      );
      return;
    }

    const result = (data.results || [])[0];
    if (result?.success) {
      onAdd({
        id: `temp-${normEmail}`,
        name: displayName,
        email: normEmail,
        role,
        status: "Pending",
        tokens: amount,
        available: amount,
      });
      await onRefresh();
      onClose();
    } else {
      window.alert(`Invite not created: ${result?.error || "unknown_error"}`);
    }
  } catch (e) {
    window.alert("Invite failed due to a network/server error.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 z-[100] grid place-items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      <div className="relative w-[96vw] max-w-[900px] rounded-2xl border border-white/10 bg-[#141518] text-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5">
          {/* <h3 className="text-xl font-semibold">{editing ? "Edit Member" : "Add New Member"}</h3> */}
             <h3 className="text-xl font-semibold">
  {editing ? "Edit Member" : rejoining ? "Rejoin Member" : "Add New Member"}
</h3>

          <button onClick={onClose} className="grid place-items-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/15">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-6">
          <label className="block text-sm mb-2">Full name *</label>
        <input
  value={fullName}
  onChange={(e) => setFullName(e.target.value)}
  className={`w-full h-11 rounded-lg border px-3 outline-none ${
    (editing || rejoining) ? "bg-[#1A1B1F]/60 text-white/70 cursor-not-allowed" : "bg-[#1A1B1F]"
  }`}
  placeholder="Enter full name"
  disabled={editing || rejoining}
/>


          <label className="block text-sm mt-4 mb-2">Email *</label>
        <input
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className={`w-full h-11 rounded-lg border px-3 outline-none ${
    (editing || rejoining) ? "bg-[#1A1B1F]/60 text-white/70 cursor-not-allowed" : "bg-[#1A1B1F]"
  }`}
  placeholder="Enter email"
  disabled={editing || rejoining}
/>


          <label className="block text-sm mt-4 mb-2">Role *</label>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="appearance-none w-full h-11 rounded-lg bg-[#1A1B1F] border border-white/10 px-3 pr-10 outline-none"
            >
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
              <ChevronDown className="w-4 h-4" />
            </span>
          </div>

          <label className="block text-sm mt-4 mb-2">Token Distribution *</label>
          <NumberInput value={distribution} onChange={setDistribution} placeholder="e.g., 5000" />

          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setDistribution(String(p))}
                  className="px-3 h-8 rounded-full bg-black/30 border border-white/10 text-sm hover:bg-black/40"
                >
                  {p.toLocaleString()}
                </button>
              ))}
            </div>
            <div className="text-sm text-white/80">
              Available Tokens: {effectiveRemaining.toLocaleString()}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="mt-6 w-full h-11 rounded-lg text-sm font-medium disabled:opacity-60"
            style={{ background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)" }}
          >
            {loading ? "Sending..." : editing ? "Update" : "Send Invite"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Delete Modal ---------------- */
function DeleteConfirmModal({
  open,
  member,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  member: Member | null;
  onCancel: () => void;
  onConfirm: (memberId: string) => void;
}) {
  if (!open || !member) return null;
  return (
    <div className="fixed inset-0 z-[110] grid place-items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} aria-hidden />
      <div className="relative w-[92vw] max-w-[460px] rounded-2xl bg-[#17171A] text-white shadow-xl text-center">
        <div className="px-6 pt-6 pb-2 relative">
          <h3 className="text-lg font-semibold">Remove {member.name} from this Team?</h3>
          <button
            onClick={onCancel}
            className="absolute right-3 top-3 grid place-items-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/15"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 pb-2">
          <p className="text-sm text-white/85">
            {member.name} will be removed from this Team and will no longer have access to tokens.
          </p>
          <p className="text-sm text-white/85 mt-3">Do you want to remove?</p>
        </div>
        <div className="flex items-center justify-center gap-3 px-6 py-5">
          <button onClick={onCancel} className="h-10 px-5 rounded-lg bg-white/10 hover:bg-white/15">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(member.id)}
            className="h-10 px-6 rounded-lg text-white"
            style={{ background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)" }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Main Page ---------------- */
export default function BlogPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const { token } = useAuth();

  const addMember = (m: Member) => setMembers((prev) => [m, ...prev]);
  const removeMember = (email: string) =>
    setMembers((prev) => prev.filter((x) => x.email !== email));
  const changeRole = (email: string, role: Role) =>
    setMembers((prev) => prev.map((x) => (x.email === email ? { ...x, role } : x)));
  const updateMember = (email: string, updates: Partial<Member>) =>
    setMembers((prev) => prev.map((x) => (x.email === email ? { ...x, ...updates } : x)));

  // ✅ FIXED: load all members including deleted and assign proper status
  const reloadMembers = useCallback(async () => {
    try {
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/org/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data?.success) return;

      const mapped: Member[] = (data.members || []).map((m: ApiMember) => ({
        id: m._id,
        name: m.name || "(No name)",
        email: m.email,
        role: m.role === "Admin" ? "Admin" : "Member",
        status: m.isDeletedFromOrg
          ? "Deleted"
          : m.isVerified
          ? "Active"
          : "Pending",
        tokens: m.orgAssignedCap || 0,
        available: m.orgTokensRemaining || 0,
        isDeletedFromOrg: m.isDeletedFromOrg || false,
      }));

      setMembers(mapped);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    reloadMembers();
  }, [reloadMembers]);

  const totalDistributed = useMemo(
    () => members.reduce((s, m) => s + m.tokens, 0),
    [members]
  );
  const remaining = Math.max(0, ORG_LIMIT - totalDistributed);

  const [openModal, setOpenModal] = useState(false);
const [modalMode, setModalMode] = useState<"add" | "edit" | "rejoin">("add");
const [editTarget, setEditTarget] = useState<Member | null>(null);
const [deleteOpen, setDeleteOpen] = useState(false);
const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

     
  // ✅ 1. DELETE member
const handleDeleteMember = async (memberId: string) => {
  if (!token) {
    window.alert("You must be logged in.");
    return;
  }

  if (!window.confirm("Are you sure you want to remove this member?")) return;

  try {
    const res = await fetch(`${API_BASE}/api/org/members/${memberId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      window.alert(`Failed to delete member: ${data?.error || "unknown_error"}`);
      return;
    }

    window.alert("✅ Member removed successfully.");
    await reloadMembers();
    setDeleteOpen(false);
  } catch (err) {
    console.error("delete member error", err);
    window.alert("Server error while deleting member.");
  }
};

// ✅ 2. Rejoin deleted member
const handleRejoinMember = async (memberId: string) => {
  if (!token) {
    window.alert("You must be logged in.");
    return;
  }

  const role = window.prompt("Enter role (Admin/Member):", "Member") || "Member";
  const tokens = window.prompt("Enter token allocation:", "0") || "0";
   
  try {
    const res = await fetch(`${API_BASE}/api/org/members/rejoin/${memberId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role, tokens: Number(tokens) }),
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      window.alert(`Failed to rejoin member: ${data?.error || "unknown_error"}`);
      return;
    }

    window.alert("✅ Member rejoined successfully.");
    await reloadMembers();
  } catch (err) {
    console.error("rejoin error", err);
    window.alert("Server error while rejoining member.");
  }
};

// ✅ 3. Resend invite to pending member
const handleResendInvite = async (memberId: string) => {
  if (!token) {
    window.alert("You must be logged in.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/org/members/resend-invite/${memberId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      window.alert(`Failed to resend invite: ${data?.error || "unknown_error"}`);
      return;
    }

    window.alert(`✅ Invitation resent to ${data.invitedEmail}`);
    await reloadMembers();
  } catch (err) {
    console.error("resend invite error", err);
    window.alert("Server error while resending invite.");
  }
};


  return (
    <div className="min-h-screen w-full bg-[#07080A] text-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 pt-6 pb-14">
        <div className="w-full flex justify-center mt-20">
  <TokenUsageSection />
</div>

        <div className="mt-6 w-full flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard label="Total Members" value={members.length} icon={<span>👥</span>} />
            <MetricCard label="Total Tokens Distributed" value={totalDistributed.toLocaleString()} icon={<span>🎁</span>} />
            <MetricCard label="Total Tokens Remaining" value={remaining.toLocaleString()} icon={<span>🪙</span>} />
          </div>
        </div>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Team Members</h2>
            <button
              onClick={() => {
                setModalMode("add");
                setEditTarget(null);
                setOpenModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
              }}
            >
              <span className="grid place-items-center w-6 h-6 rounded-full bg-white/20 text-white">
                <Plus className="w-4 h-4" />
              </span>
              Add new member
            </button>
          </div>

        <div className="overflow-x-auto mt-3">
  <table
    className="w-full text-left border-separate"
    style={{ borderSpacing: "16px 14px", minWidth: "900px" }}
  >
    <thead className="text-white/70 text-sm">
      <tr>
        <th style={{ minWidth: "140px", paddingRight: "12px" }}>Name</th>
        <th style={{ minWidth: "240px", paddingRight: "12px" }}>Email</th>
        <th style={{ minWidth: "100px", paddingRight: "12px" }}>Role</th>
        <th style={{ minWidth: "100px", paddingRight: "12px" }}>Status</th>
        <th style={{ minWidth: "120px", paddingRight: "12px" }}>Tokens</th>
        <th style={{ minWidth: "120px", paddingRight: "12px" }}>Available</th>
        <th style={{ minWidth: "160px" }}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {members.length === 0 ? (
        <tr>
          <td className="text-white/60 text-sm py-4" colSpan={7}>
            No members yet. Click “Add new member”.
          </td>
        </tr>
      ) : (
        members.map((m) => (
          <tr
            key={m.email}
            className={`align-middle ${
              m.isDeletedFromOrg ? "opacity-50" : ""
            }`}
          >
            <td style={{ paddingRight: "12px" }}>{m.name}</td>

            {/* ✅ Email column now wraps long text nicely */}
            <td
              style={{
                paddingRight: "12px",
                wordBreak: "break-all",
                whiteSpace: "normal",
              }}
              className="text-white/80"
            >
              {m.email}
            </td>

            <td style={{ paddingRight: "12px" }}>{m.role}</td>

            <td style={{ paddingRight: "12px" }}>
              <span
                className={
                  m.isDeletedFromOrg
                    ? "text-red-400 font-medium"
                    : m.status === "Active"
                    ? "text-emerald-400"
                    : "text-yellow-400"
                }
              >
                {m.isDeletedFromOrg ? "Deleted" : m.status}
              </span>
            </td>

            <td style={{ paddingRight: "12px" }}>
              {m.tokens.toLocaleString()}
            </td>
            <td style={{ paddingRight: "12px" }}>
              {m.available.toLocaleString()}
            </td>

            <td>
              <div className="flex items-center gap-3 flex-wrap">
                {/* ✅ Deleted → Rejoin */}
                {m.isDeletedFromOrg && (
                  <button
                    className="grid place-items-center w-9 h-9 rounded-full bg-blue-500 text-white"
                    title="Rejoin member"
                    onClick={() => {
                      setModalMode("rejoin");
                      setEditTarget(m);
                      setOpenModal(true);
                    }}
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                )}

                {/* ✅ Active → Edit + Delete */}
                {!m.isDeletedFromOrg && m.status === "Active" && (
                  <>
                    <button
                      className="grid place-items-center w-9 h-9 rounded-full bg-emerald-500 text-white"
                      onClick={() => {
                        setModalMode("edit");
                        setEditTarget(m);
                        setOpenModal(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="grid place-items-center w-9 h-9 rounded-full bg-red-500 text-white"
                      onClick={() => {
                        setDeleteTarget(m);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* ✅ Pending → Resend Invite */}
                {!m.isDeletedFromOrg && m.status === "Pending" && (
                  <button
                    onClick={() => handleResendInvite(m.id)}
                    title="Resend Invite"
                    className="inline-flex items-center justify-center px-4 h-8 border border-white text-white rounded-full text-xs font-medium hover:bg-white/10 transition-all"
                  >
                    Resend Invite
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

        </section>
      </main>

      <Footer />

      <MemberModal
        open={openModal}
        mode={modalMode}
        initialMember={editTarget}
        onClose={() => setOpenModal(false)}
        onAdd={addMember}
        onUpdate={updateMember}
        members={members}
        onRemove={removeMember}
        onChangeRole={changeRole}
        remainingTokens={remaining}
        onRefresh={reloadMembers}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        member={deleteTarget}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDeleteMember}
      />
    </div>
  );
}