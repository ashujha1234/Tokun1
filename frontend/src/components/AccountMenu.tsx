import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  ChevronDown,
  User,
  Landmark,
  FileText,
  CreditCard,
  X,
  Download,
  Trash,
  Check,
  Star,
  AlertTriangle,
} from "lucide-react";
import { LuBadgeCheck } from "react-icons/lu";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

type ThemeMode = "light" | "dark" | "system";

type BankAccount = {
  id: string;
  bank: string;
  last4: string;
  ifsc: string;
  isDefault: boolean;
};

type Txn = {
  id: string;
  date: string;
  amount: number;
  status: "Completed" | "Pending";
};

const AccountMenu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const token =
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";

  const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";
  const BANK_LIST_URL = API_BASE ? `${API_BASE}/api/bankaccount` : `/api/bankaccount`;
  const BANK_ADD_URL = API_BASE ? `${API_BASE}/api/bankaccount/add` : `/api/bankaccount/add`;
  const bankSetDefaultUrl = (id: string) =>
    API_BASE
      ? `${API_BASE}/api/bankaccount/set-default/${id}`
      : `/api/bankaccount/set-default/${id}`;

  const [theme, setTheme] = useState<ThemeMode>("system");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<"profile" | "bank" | "invoices" | "billing">("profile");

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [totalEarnings] = useState<number>(15250);
  const [showBankForm, setShowBankForm] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string; last4?: string }>({ open: false });

  const [bankForm, setBankForm] = useState({
    holder: "",
    accNum: "",
    confirmAccNum: "",
    ifsc: "",
    bankName: "",
  });

  const displayName = useMemo(() => user?.name?.trim() || "", [user]);
  const displayEmail = useMemo(() => user?.email || "", [user]);
  const fullName = useMemo(() => {
    if (displayName) return displayName;
    if (displayEmail) return displayEmail.split("@")[0];
    return "User";
  }, [displayName, displayEmail]);

  const lifetimeTokunSaved = (user as any)?.lifetimeTokunSaved ?? 150;
  const hasBankAccount = bankAccounts.length > 0;

  useEffect(() => {
    if (!profileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setProfileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [profileOpen]);

  useEffect(() => {
    if (!profileOpen) {
      setShowBankForm(false);
      setSetAsDefault(false);
      setBankForm({ holder: "", accNum: "", confirmAccNum: "", ifsc: "", bankName: "" });
    }
  }, [profileOpen]);

  useEffect(() => {
    const rawAcc = localStorage.getItem("tokun_bank_accounts");
    if (rawAcc) {
      try {
        setBankAccounts(JSON.parse(rawAcc));
      } catch {}
    }

    const rawTx = localStorage.getItem("tokun_bank_txns");
    if (rawTx) {
      try {
        setTransactions(JSON.parse(rawTx));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tokun_bank_accounts", JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem("tokun_bank_txns", JSON.stringify(transactions));
  }, [transactions]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  const goToPurchaseHistory = () => navigate("/prompty-history?p=purchased");
  const goToUploadHistory = () => navigate("/prompty-history?p=uploaded");

  const themeBtn = (id: ThemeMode, src: string, alt: string) => (
    <button
      type="button"
      onClick={() => setTheme(id)}
      className="inline-flex items-center justify-center rounded-full"
      style={{
        width: 28,
        height: 28,
        outline: theme === id ? "2px solid rgba(255,255,255,0.9)" : "none",
      }}
      aria-pressed={theme === id}
      aria-label={alt}
      title={alt}
    >
      <img src={src} alt="" className="w-4 h-4" />
    </button>
  );

  const fetchBankAccounts = async (): Promise<void> => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const res = await fetch(BANK_LIST_URL, {
        method: "GET",
        headers,
        credentials: "include",
      });

      const raw = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(raw);
      } catch {}

      if (!res.ok) throw new Error(data?.error || `http_${res.status}`);

      const mapped = (Array.isArray(data?.accounts) ? data.accounts : []).map((ba: any) => ({
        id: ba._id as string,
        bank: String(ba.bankName || ""),
        last4: String(ba.accountNumber || "").slice(-4),
        ifsc: String(ba.ifscCode || "").toUpperCase(),
        isDefault: !!ba.default,
      })) as BankAccount[];

      setBankAccounts(mapped);
      localStorage.setItem("tokun_bank_accounts", JSON.stringify(mapped));
    } catch {
      try {
        const cached = localStorage.getItem("tokun_bank_accounts");
        if (cached) setBankAccounts(JSON.parse(cached));
      } catch {}
    }
  };

  useEffect(() => {
    if (profileOpen && profileTab === "bank") fetchBankAccounts();
  }, [profileOpen, profileTab]);

  const handleSaveBank = async () => {
    if (!bankForm.holder || !bankForm.accNum || !bankForm.confirmAccNum || !bankForm.ifsc || !bankForm.bankName) {
      toast({ title: "Missing fields", description: "Please fill out all fields.", variant: "destructive" });
      return;
    }
    if (bankForm.accNum !== bankForm.confirmAccNum) {
      toast({ title: "Account numbers mismatch", description: "Please re-enter account number.", variant: "destructive" });
      return;
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const makeDefault = bankAccounts.length > 0 ? !!setAsDefault : undefined;

    const body = {
      accountHolderName: bankForm.holder.trim(),
      accountNumber: bankForm.accNum.trim(),
      confirmAccountNumber: bankForm.confirmAccNum.trim(),
      ifscCode: bankForm.ifsc.trim().toUpperCase(),
      bankName: bankForm.bankName.trim(),
      default: makeDefault,
    };

    try {
      const res = await fetch(BANK_ADD_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        credentials: "include",
      });

      const raw = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(raw);
      } catch {}

      if (!res.ok) throw new Error(data?.error || `http_${res.status}`);

      const ba = data?.bankAccount;
      const newAcc = {
        id: ba._id as string,
        bank: String(ba.bankName || ""),
        last4: String(ba.accountNumber || "").slice(-4),
        ifsc: String(ba.ifscCode || "").toUpperCase(),
        isDefault: !!ba.default,
      };

      setBankAccounts((prev) => {
        const next = newAcc.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
        return [...next, newAcc];
      });

      setShowBankForm(false);
      setSetAsDefault(false);
      setBankForm({ holder: "", accNum: "", confirmAccNum: "", ifsc: "", bankName: "" });

      toast({ title: "Bank account added", description: newAcc.isDefault ? "Set as default." : "Saved successfully." });
    } catch (err: any) {
      toast({ title: "Add failed", description: err?.message || "Could not add bank account.", variant: "destructive" });
    }
  };

  const setDefaultBankAccount = async (accountId: string): Promise<void> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const res = await fetch(bankSetDefaultUrl(accountId), {
        method: "POST",
        headers,
        credentials: "include",
      });

      const raw = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(raw);
      } catch {}

      if (!res.ok) throw new Error(data?.error || `http_${res.status}`);

      const newDefaultId = data?.defaultAccount?._id as string | undefined;
      if (newDefaultId) {
        setBankAccounts((prev) => prev.map((a) => ({ ...a, isDefault: a.id === newDefaultId })));
      }

      toast({ title: "Default bank updated", description: "This account is now default." });
    } catch (err: any) {
      toast({ title: "Failed to set default", description: err?.message || "Try again.", variant: "destructive" });
    }
  };

  const deleteAccount = (id: string) => {
    setBankAccounts((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (next.length && !next.some((a) => a.isDefault)) next[0].isDefault = true;
      return [...next];
    });
  };

  const performDelete = () => {
    if (confirmDelete.id) deleteAccount(confirmDelete.id);
    setConfirmDelete({ open: false });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Account menu"
            title={fullName}
            className="group inline-flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#2C2C2C] text-white whitespace-nowrap"
          >
            <div className="hidden sm:flex items-center gap-2">
              {user?.plan === "pro" && (
                <>
                  <span className="truncate font-semibold bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] text-transparent bg-clip-text">
                    Hello, {fullName}
                  </span>
                  <LuBadgeCheck
                    className="w-[22px] h-[22px]"
                    style={{ stroke: "url(#proGradient)", strokeWidth: 2, fill: "none" }}
                  />
                  <svg width="0" height="0">
                    <defs>
                      <linearGradient id="proGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF14EF" />
                        <stop offset="100%" stopColor="#1A73E8" />
                      </linearGradient>
                    </defs>
                  </svg>
                </>
              )}

              {user?.plan === "enterprise" && (
                <>
                  <span className="truncate font-semibold bg-gradient-to-r from-[#FACC15] to-[#CA8A04] text-transparent bg-clip-text">
                    Hello, {fullName}
                  </span>
                  <LuBadgeCheck
                    className="w-[22px] h-[22px]"
                    style={{ stroke: "url(#enterpriseGradient)", strokeWidth: 2, fill: "none" }}
                  />
                  <svg width="0" height="0">
                    <defs>
                      <linearGradient id="enterpriseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FACC15" />
                        <stop offset="100%" stopColor="#CA8A04" />
                      </linearGradient>
                    </defs>
                  </svg>
                </>
              )}

              {(!user?.plan || user?.plan === "free") && (
                <>
                  <span className="truncate font-semibold text-white">Hello, {fullName}</span>
                  <span className="px-2 py-0.5 text-xs rounded-md bg-gray-700 text-gray-300">FREE</span>
                </>
              )}
            </div>

            <span className="shrink-0 grid place-items-center rounded-full bg-white/95 w-6 h-6">
              <ChevronDown className="w-3.5 h-3.5 text-black" />
            </span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          sideOffset={10}
          align="end"
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="p-3 no-scrollbar overflow-y-auto"
          style={{
            width: 260,
            maxHeight: "85vh",
            borderRadius: 20,
            background: "#21212180",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "#ffffff",
            fontFamily: "Inter, system-ui, Arial, sans-serif",
            fontSize: 14,
          }}
        >
          <div className="flex flex-col gap-3">
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!user?._id) return;
                  navigate(`/profile/${user._id}`);
                }}
                className="font-semibold text-left hover:underline hover:text-white transition"
              >
                {displayName || "Your Name"}
              </button>

              <div className="text-white/70 text-sm">{displayEmail || "your@email.com"}</div>

              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setProfileOpen(true);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="w-full mt-2 text-white"
                style={{ height: 40, borderRadius: 12, background: "#313131" }}
              >
                Set up profile
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span>Theme</span>
              <div
                className="flex items-center justify-between px-2"
                style={{ width: 96, height: 36, borderRadius: 18, background: "#313131" }}
              >
                {themeBtn("light", "https://cdn.jsdelivr.net/npm/@tabler/icons/icons/sun.svg", "Light")}
                {themeBtn("dark", "https://cdn.jsdelivr.net/npm/@tabler/icons/icons/moon.svg", "Dark")}
                {themeBtn("system", "https://cdn.jsdelivr.net/npm/@tabler/icons/icons/device-desktop.svg", "System")}
              </div>
            </div>

            <div
              className="py-2 flex items-center gap-2 border-t border-white/10 cursor-pointer"
              onClick={() => navigate("/settings")}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </div>

            <div
              style={{
                width: 220,
                height: 120,
                background: "#2A2A2A",
                borderRadius: 16,
                padding: "10px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div className="text-sm text-white/85">Lifetime Tokun saved</div>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background:
                    "conic-gradient(#FF14EF 0 60deg, #1A73E8 60deg 210deg, #5CE1E6 210deg 360deg)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#2A2A2A",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "12px",
                  }}
                >
                  {lifetimeTokunSaved}
                </div>
              </div>
              <div className="text-xs text-white/70">Total tokun saved</div>
            </div>

            <div className="grid gap-2 pt-2">
              {[
                { label: "Purchase History", onClick: goToPurchaseHistory, icon: "↗" },
                { label: "Upload History", onClick: goToUploadHistory, icon: "↗" },
                { label: "Pricing", onClick: () => navigate("/subscription"), icon: "↗" },
                { label: "Support", onClick: () => navigate("/support"), icon: "↗" },
                { label: "Admin", onClick: () => navigate("/admin"), icon: "↗" },
                { label: "Logout", onClick: handleLogout, icon: "↩" },
              ].map((item, i) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-between py-2 whitespace-nowrap ${
                    i !== 0 ? "border-t border-white/10" : ""
                  }`}
                >
                  <span>{item.label}</span>
                  <span aria-hidden className="pl-3">{item.icon}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-white/10 flex items-center justify-between pt-2 text-xs text-gray-400">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Copyright</span>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {profileOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] grid place-items-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setProfileOpen(false)} />

          <div
            className="relative w-[min(96vw,900px)] max-h-[90vh] rounded-2xl text-white shadow-2xl overflow-hidden"
            style={{ background: "#17171A", fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
          >
            <button
              aria-label="Close"
              onClick={() => setProfileOpen(false)}
              className="absolute right-2 top-2 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8 z-10"
            >
              <X className="w-4 h-4 text-white/90" />
            </button>

            <div className="grid grid-cols-[240px,1fr] max-h-[90vh] overflow-hidden">
              <aside
                className="no-scrollbar overflow-y-auto pt-5"
                style={{ background: "#17171A", borderRight: "1px solid #1C1C1C" }}
              >
                {[
                  { id: "profile", label: "Profile", Icon: User },
                  { id: "bank", label: "Bank Account", Icon: Landmark },
                  { id: "invoices", label: "Invoices", Icon: FileText },
                  { id: "billing", label: "Billing information", Icon: CreditCard },
                ].map((item) => {
                  const active = profileTab === (item.id as typeof profileTab);
                  return (
                    <button
                      key={item.id}
                      onClick={() => setProfileTab(item.id as typeof profileTab)}
                      className="w-full flex items-center gap-3 px-5 py-4 text-left"
                      style={{
                        background: active ? "#1C1C1C" : "transparent",
                        color: active ? "#ffffff" : "rgba(255,255,255,0.78)",
                      }}
                    >
                      <item.Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </aside>

              <section className="no-scrollbar overflow-y-auto p-6 md:p-8" style={{ maxHeight: "90vh" }}>
                <div className="mb-6">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 text-white"
                    style={{
                      width: 169,
                      height: 40,
                      borderRadius: 6,
                      background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
                    }}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Individual</span>
                  </button>
                </div>

                {profileTab === "profile" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block mb-2 text-white/80 text-sm">Full Name</label>
                      <input
                        disabled
                        value={displayName || "Sagar Patel"}
                        className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white/80 placeholder-white/40 outline-none focus:ring-2 focus:ring-white/10"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-white/80 text-sm">Email</label>
                      <input
                        disabled
                        value={displayEmail || "sagar@techverse.world"}
                        className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white/70 placeholder-white/40 outline-none focus:ring-2 focus:ring-white/10"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-white/80">Delete account</span>
                      <button
                        type="button"
                        className="px-5 py-2 rounded-md text-red-400 border border-red-500/80 hover:bg-red-500/10 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                {confirmDelete.open && (
                  <div className="fixed inset-0 z-[1100] grid place-items-center">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setConfirmDelete({ open: false })} />
                    <div
                      className="relative w-[min(92vw,520px)] rounded-xl p-6 text-white shadow-2xl"
                      style={{ background: "#17171A", border: "1px solid rgba(255,255,255,0.10)" }}
                    >
                      <button
                        aria-label="Close"
                        onClick={() => setConfirmDelete({ open: false })}
                        className="absolute right-2 top-2 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8"
                      >
                        <X className="w-4 h-4 text-white/90" />
                      </button>

                      <div className="grid place-items-center mb-3">
                        <div className="grid place-items-center h-12 w-12 rounded-full bg-black/50">
                          <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                      </div>

                      <h3 className="text-center text-lg font-semibold mb-2">Delete Bank Account?</h3>
                      <p className="text-center text-white/80">
                        You are about to delete your saved bank account
                        <br />
                        ending with ****{confirmDelete.last4}
                      </p>
                      <p className="text-center text-white/60 mt-3">
                        This action is permanent and cannot be undone.
                      </p>

                      <div className="mt-6 flex items-center justify-center gap-3">
                        <button
                          onClick={performDelete}
                          className="px-4 py-2 rounded-md text-red-400 border border-red-500/80 hover:bg-red-500/10 transition"
                        >
                          Delete Account
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ open: false })}
                          className="px-4 py-2 rounded-md text-white"
                          style={{ background: "#333335" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {profileTab === "bank" && (
                  <>
                    {!hasBankAccount && !showBankForm && (
                      <div
                        className="flex flex-col gap-4 rounded-xl border border-white/10 p-6"
                        style={{ background: "#17171A" }}
                      >
                        <h3 className="text-[22px]">Bank Account</h3>
                        <p className="text-white/70">Please add bank account.</p>
                        <button
                          type="button"
                          onClick={() => setShowBankForm(true)}
                          className="rounded-md px-4 py-2 text-white"
                          style={{ background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)" }}
                        >
                          Add
                        </button>
                      </div>
                    )}

                    {((!hasBankAccount && showBankForm) || (hasBankAccount && showBankForm)) && (
                      <div className="space-y-5">
                        <h3 className="text-[22px] mb-2">Account Details</h3>

                        <div>
                          <label className="block mb-2 text-white/80 text-sm">Account holder name</label>
                          <input
                            value={bankForm.holder}
                            onChange={(e) => setBankForm((p) => ({ ...p, holder: e.target.value }))}
                            className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
                            placeholder="Enter account holder name"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-white/80 text-sm">Account number</label>
                          <input
                            value={bankForm.accNum}
                            onChange={(e) => setBankForm((p) => ({ ...p, accNum: e.target.value }))}
                            className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
                            placeholder="Enter account number"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-white/80 text-sm">Confirm account number</label>
                          <input
                            value={bankForm.confirmAccNum}
                            onChange={(e) => setBankForm((p) => ({ ...p, confirmAccNum: e.target.value }))}
                            className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
                            placeholder="Re-enter account number"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-white/80 text-sm">IFSC Code</label>
                          <div className="relative">
                            <input
                              value={bankForm.ifsc}
                              onChange={(e) => setBankForm((p) => ({ ...p, ifsc: e.target.value }))}
                              className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 pr-[112px] text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
                              placeholder="IFSC Code"
                            />
                            <button
                              type="button"
                              className="absolute right-1 top-1 bottom-1 px-4 rounded-md text-sm text-white"
                              style={{ background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)" }}
                            >
                              Find IFSC
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block mb-2 text-white/80 text-sm">Bank name</label>
                          <input
                            value={bankForm.bankName}
                            onChange={(e) => setBankForm((p) => ({ ...p, bankName: e.target.value }))}
                            className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
                            placeholder="Bank name"
                          />

                          {hasBankAccount && (
                            <label className="flex items-center gap-3 pt-3 select-none">
                              <button
                                type="button"
                                role="switch"
                                aria-checked={setAsDefault}
                                onClick={() => setSetAsDefault((v) => !v)}
                                className="relative h-6 w-11 rounded-full transition-colors"
                                style={{
                                  background: setAsDefault
                                    ? "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)"
                                    : "#2B2B2E",
                                  border: "1px solid rgba(255,255,255,0.12)",
                                }}
                              >
                                <span
                                  className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white transition-all"
                                  style={{ left: setAsDefault ? "calc(100% - 18px)" : "2px" }}
                                />
                              </button>
                              <span className="text-white/90">Set as Default Bank Account</span>
                            </label>
                          )}
                        </div>

                        <div
                          className="sticky bottom-0 pt-4 pb-4 mt-4 flex items-center justify-end gap-3"
                          style={{ background: "#17171A" }}
                        >
                          <button
                            type="button"
                            onClick={() => setShowBankForm(false)}
                            className="h-[49px] w-[100px] rounded-[6px] border border-white text-white/90"
                            style={{ background: "transparent" }}
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={handleSaveBank}
                            className="h-[49px] w-[162px] rounded-[6px] text-white px-[15px] transition-colors"
                            style={{ background: "#333335" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)")
                            }
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#333335")}
                          >
                            Save &amp; Continue
                          </button>
                        </div>
                      </div>
                    )}

                    {hasBankAccount && !showBankForm && (
                      <div className="space-y-7">
                        <div
                          className="rounded-xl border border-white/10 p-5"
                          style={{ background: "#17171A" }}
                        >
                          <div className="text-white/70 text-sm">Total Earning</div>
                          <div className="mt-2 text-[26px] font-medium">₹{totalEarnings.toLocaleString()}</div>
                        </div>

                        <div>
                          <h4 className="mb-3 text-white/90">Linked Bank Accounts</h4>
                          <div className="space-y-3">
                            {bankAccounts.map((acc) => (
                              <div
                                key={acc.id}
                                className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-4"
                                style={{ background: "#17171A" }}
                              >
                                <div>
                                  <div className="font-medium">
                                    {acc.bank} - ****{acc.last4}
                                  </div>
                                  <div className="text-xs text-white/70 mt-1">IFSC: {acc.ifsc}</div>
                                  {acc.isDefault && (
                                    <div className="text-xs text-emerald-400 mt-1 inline-flex items-center gap-1">
                                      <Check className="w-4 h-4" /> Default
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {!acc.isDefault && (
                                    <button
                                      type="button"
                                      onClick={() => setDefaultBankAccount(acc.id)}
                                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white transition"
                                      style={{ background: "#333335", border: "1px solid rgba(255,255,255,0.15)" }}
                                      title="Set as default"
                                    >
                                      <Star className="w-4 h-4" />
                                      Set Default
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => setConfirmDelete({ open: true, id: acc.id, last4: acc.last4 })}
                                    className="grid place-items-center rounded-md h-9 w-9 border border-white/15 hover:border-white/25 transition"
                                    style={{ background: "#1F1F22" }}
                                    aria-label="Delete account"
                                  >
                                    <Trash className="w-4.5 h-4.5 text-white/80" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() => {
                                setShowBankForm(true);
                                setSetAsDefault(false);
                              }}
                              className="w-full rounded-xl border border-white/15 px-4 py-3 text-white/90 hover:border-white/25 transition"
                              style={{ background: "#1F1F22" }}
                            >
                              + Add another bank account
                            </button>
                          </div>
                        </div>

                        <div>
                          <h4 className="mb-3 text-white/90">Transaction History</h4>

                          {transactions.length === 0 ? (
                            <div
                              className="rounded-xl border border-white/10 p-5 text-white/70"
                              style={{ background: "#17171A" }}
                            >
                              No transaction history
                            </div>
                          ) : (
                            <div className="rounded-xl border border-white/10" style={{ background: "#17171A" }}>
                              <div className="grid grid-cols-[2fr,1fr,1fr] px-4 py-3 text-white/70 border-b border-white/10">
                                <span>Date</span>
                                <span>Amount</span>
                                <span>Status</span>
                              </div>
                              {transactions.map((t) => (
                                <div key={t.id} className="grid grid-cols-[2fr,1fr,1fr] px-4 py-3 border-t border-white/5">
                                  <span>{t.date}</span>
                                  <span>₹{t.amount.toLocaleString()}</span>
                                  <span className="text-emerald-400">{t.status}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {profileTab === "invoices" && (
                  <div className="space-y-5">
                    <h3 className="text-[22px] mb-2">My Invoices</h3>

                    <div className="rounded-md overflow-hidden">
                      <div className="grid grid-cols-[2fr,1fr,120px] items-center bg-[#1F1F22] px-4 py-3 text-white/80">
                        <span>Date</span>
                        <span>Amount</span>
                        <span className="text-right">Status</span>
                      </div>

                      <div className="divide-y divide-white/10">
                        {[
                          { date: "Sep 16, 2025", amount: "₹4,500" },
                          { date: "Sep 15, 2025", amount: "₹4,500" },
                        ].map((row, i) => (
                          <div key={i} className="grid grid-cols-[2fr,1fr,120px] items-center px-4 py-4">
                            <span className="text-white/90">{row.date}</span>
                            <span className="text-white/90">{row.amount}</span>
                            <span className="flex items-center justify-end gap-4">
                              <button
                                type="button"
                                className="grid place-items-center w-8 h-8 rounded-md border border-white/15 text-white/90"
                                title="View invoice"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                className="grid place-items-center w-8 h-8 rounded-md border border-white/15 text-white/90"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {profileTab === "billing" && (
                  <div className="space-y-5">
                    <h3 className="text-[22px] mb-2">My Billing information</h3>

                    <div className="rounded-md overflow-hidden">
                      <div className="grid grid-cols-[2fr,1fr,120px] items-center bg-[#1F1F22] px-4 py-3 text-white/80">
                        <span>Item</span>
                        <span>Date</span>
                        <span className="text-right">Status</span>
                      </div>

                      <div className="divide-y divide-white/10">
                        {[
                          { item: "Premium e-commerce\ncopy prompt", date: "Sep 16, 2025" },
                          { item: "Customization Add-on", date: "Sep 15, 2025" },
                        ].map((row, i) => (
                          <div key={i} className="grid grid-cols-[2fr,1fr,120px] items-center px-4 py-4">
                            <span className="whitespace-pre-line text-white/90">{row.item}</span>
                            <span className="text-white/90">{row.date}</span>
                            <span className="flex items-center justify-end gap-4">
                              <button
                                type="button"
                                className="grid place-items-center w-8 h-8 rounded-md border border-white/15 text-white/90"
                                title="View"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                className="grid place-items-center w-8 h-8 rounded-md border border-white/15 text-white/90"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountMenu;