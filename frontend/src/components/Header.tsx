


// src/components/Header.tsx
import { useMemo, useState,useEffect ,useRef} from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Plus, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ApiKeyModal from "@/components/ApiKeyModal";
import SubscriptionModal from "@/components/SubscriptionModal";
import { toast } from "@/components/ui/use-toast";
import SellPromptModal from "@/components/SellPromptModal";
import { User, Landmark, FileText, CreditCard ,X,Download,Trash, Check , Star,Bell,ChevronRight,AlertTriangle} from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
 import { Zap } from "lucide-react";
import { Crown } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { LuBadgeCheck } from "react-icons/lu";
import KycGateModal from "@/components/KycGateModal";
// import { useAuth } from "@/contexts/AuthContext";
// import { toast } from "@/components/ui/use-toast";

type ThemeMode = "light" | "dark" | "system";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
 const { cart, removeFromCart, fetchCart } = useCart();
// Text color based on plan
const userPlanColor =
  user?.plan === "pro"
    ? "text-[#FF14EF]"
    : user?.plan === "enterprise"
    ? "text-[#FACC15]"
    : "text-white";


  // State
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("system");
   const [cartOpen, setCartOpen] = useState(false);
const [unreadChats, setUnreadChats] = useState(0);
   const [headerToast, setHeaderToast] = useState<{
  title: string;
  message: string;
} | null>(null);

  const [kycOpen, setKycOpen] = useState(false);
const [pendingUpload, setPendingUpload] = useState(false);



const toastTimerRef = useRef<number | null>(null);

type Notif = { id: string; title: string; body: string; date: string; unread: boolean };
const [notifList, setNotifList] = useState<Notif[]>([]);
useEffect(() => {
  try {
    const raw = localStorage.getItem("tokun_notifications");
    if (raw) setNotifList(JSON.parse(raw));
  } catch {}
}, []);





  // Display
  const displayName = useMemo(() => user?.name?.trim() || "", [user]);
  const displayEmail = useMemo(() => user?.email || "", [user]);
  const fullName = useMemo(() => {
    if (displayName) return displayName;
    if (displayEmail) return displayEmail.split("@")[0];
    return "User";
  }, [displayName, displayEmail]);

  // Stats (example)
  const lifetimeTokunSaved = (user as any)?.lifetimeTokunSaved ?? 150;

  // Nav helpers
  const handleBrandClick = () => navigate(user ? "/app" : "/");
  const goToSaved = () => navigate("/saved");
  const goToPurchaseHistory = () => navigate("/prompty-history?p=purchased");
  const goToUploadHistory = () => navigate("/prompty-history?p=uploaded");

  const handleLogout = () => {
    logout();
    toast({ title: "Logged out", description: "You have been successfully logged out." });
    navigate("/login");
  };


  const uiTextStyle: React.CSSProperties = {
    fontFamily: "Inter, system-ui, Arial, sans-serif",
    fontWeight: 500,
    fontSize: 12,
    lineHeight: "100%",
  };

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


  const [profileOpen, setProfileOpen] = useState(false);
const [profileTab, setProfileTab] = useState<"profile" | "bank" | "invoices" | "billing">("profile");

useEffect(() => {
  if (!profileOpen) return;
  const onKey = (e: KeyboardEvent) => e.key === "Escape" && setProfileOpen(false);
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [profileOpen]);



// // whether the user already has a bank account (wire this to real data later)
// const [hasBankAccount, setHasBankAccount] = useState(false);
// // controls showing the form after clicking "Add"
// const [showBankForm, setShowBankForm] = useState(false);






const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";
const BANK_ADD_URL = API_BASE ? `${API_BASE}/api/bankaccount/add` : `/api/bankaccount/add`;

// const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";
const BANK_LIST_URL = API_BASE ? `${API_BASE}/api/bankaccount` : `/api/bankaccount`;

const bankSetDefaultUrl = (id: string) =>
  API_BASE
    ? `${API_BASE}/api/bankaccount/set-default/${id}`
    : `/api/bankaccount/set-default/${id}`;




const goToMyProfile = () => {
  if (!user?._id) return;
  navigate(`/profile/${user._id}`);
};


const ensureKycVerified = async () => {
  if (!token) return false;

  try {
   const res = await fetch(`${API_BASE}/api/kyc/status`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    const s = data?.kycStatus || data?.status;

    if (s === "VERIFIED") return true;

    setKycOpen(true);
    return false;
  } catch {
    setKycOpen(true);
    return false;
  }
};

const handlePostPrompt = async () => {
  if (!token) {
    toast({
      title: "Please log in",
      description: "You must be logged in to upload prompts.",
      variant: "destructive",
    });
    navigate("/login");
    return;
  }

  const ok = await ensureKycVerified();
  if (!ok) {
    setPendingUpload(true);
    return;
  }

  setSellOpen(true);
};















// --- Bank data model ---
type BankAccount = {
  id: string;
  bank: string;
  last4: string;
  ifsc: string;
  isDefault: boolean;
};

type Txn = { id: string; date: string; amount: number; status: "Completed" | "Pending" };

// Bank tab state
const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);   // start empty
const [transactions, setTransactions] = useState<Txn[]>([]);          // start empty => "No transaction history"
const [totalEarnings, setTotalEarnings] = useState<number>(15250);    // demo number; wire to API later

// Empty-state vs form
const [showBankForm, setShowBankForm] = useState(false);
// toggle only used when adding another account
const [setAsDefault, setSetAsDefault] = useState(false);

// Bank form local fields
const [bankForm, setBankForm] = useState({
  holder: "",
  accNum: "",
  confirmAccNum: "",
  ifsc: "",
  bankName: "",
});

// Ensure when modal closes and reopens, we go back to the empty-state if still no accounts
useEffect(() => {
  if (!profileOpen) {
    setShowBankForm(false);
    setSetAsDefault(false); // reset
    setBankForm({ holder: "", accNum: "", confirmAccNum: "", ifsc: "", bankName: "" });
  }
}, [profileOpen]);

// confirm-delete modal state
const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string; last4?: string }>({ open: false });

// open the confirm dialog
const requestDelete = (acc: BankAccount) =>
  setConfirmDelete({ open: true, id: acc.id, last4: acc.last4 });

// actually delete
const performDelete = () => {
  if (confirmDelete.id) deleteAccount(confirmDelete.id);
  setConfirmDelete({ open: false });
};

const hasBankAccount = bankAccounts.length > 0;

// Add account

const handleSaveBank = async () => {
  // client-side validation (kept)
  if (!bankForm.holder || !bankForm.accNum || !bankForm.confirmAccNum || !bankForm.ifsc || !bankForm.bankName) {
    console.warn("[BankAdd] Missing fields:", bankForm);
    toast({ title: "Missing fields", description: "Please fill out all fields.", variant: "destructive" });
    return;
  }
  if (bankForm.accNum !== bankForm.confirmAccNum) {
    console.warn("[BankAdd] Account numbers mismatch", {
      accNum: bankForm.accNum,
      confirmAccNum: bankForm.confirmAccNum,
    });
    toast({ title: "Account numbers mismatch", description: "Please re-enter account number.", variant: "destructive" });
    return;
  }

  // ---- Build request ----
  const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";
  const BANK_ADD_URL = API_BASE ? `${API_BASE}/api/bankaccount/add` : `/api/bankaccount/add`;
  const token =
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";

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

  // ---- Console preflight ----
  console.log("%c[BankAdd] POST", "color:#22c55e;font-weight:bold;", BANK_ADD_URL);
  console.log("[BankAdd] Headers:", { ...headers, Authorization: headers.Authorization ? "Bearer <present>" : "—" });
  console.log("[BankAdd] Payload:", body);

  try {
    const res = await fetch(BANK_ADD_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      credentials: "include",
    });

    // ---- Console response ----
    console.log("%c[BankAdd] HTTP", "color:#22c55e;font-weight:bold;", res.status, res.statusText);
    console.log("[BankAdd] Resp headers (subset):", {
      "content-type": res.headers.get("content-type"),
      "set-cookie": res.headers.get("set-cookie"),
    });

    const raw = await res.text();
    console.log("[BankAdd] Raw body:", raw);

    let data: any = {};
    try { data = JSON.parse(raw); } catch (e) {
      console.warn("[BankAdd] JSON parse failed, using raw text:", e);
    }

    console.log("[BankAdd] Parsed JSON:", data);

    if (!res.ok) {
      const code = data?.error || `http_${res.status}`;
      const nice =
        code === "all_fields_required" ? "Please fill out all fields."
      : code === "account_numbers_mismatch" ? "Account numbers do not match."
      : code === "account_already_exists" ? "This bank account is already saved."
      : code;
      console.error("[BankAdd] Error:", { code, nice });
      throw new Error(nice);
    }

    const ba = data?.bankAccount;
    if (!ba?._id) {
      console.warn("[BankAdd] Unexpected success shape:", data);
    }

    const newAcc = {
      id: ba._id as string,
      bank: String(ba.bankName || ""),
      last4: String(ba.accountNumber || "").slice(-4),
      ifsc: String(ba.ifscCode || "").toUpperCase(),
      isDefault: !!ba.default,
    };

    console.log("[BankAdd] Mapped UI model:", newAcc);

    setBankAccounts((prev) => {
      const next = newAcc.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : prev;
      const merged = [...next, newAcc];
      console.log("[BankAdd] Updated bankAccounts state:", merged);
      return merged;
    });

    // Reset UI
    setShowBankForm(false);
    setSetAsDefault(false);
    setBankForm({ holder: "", accNum: "", confirmAccNum: "", ifsc: "", bankName: "" });

    toast({ title: "Bank account added", description: newAcc.isDefault ? "Set as default." : "Saved successfully." });
  } catch (err: any) {
    console.error("[BankAdd] Fetch failed:", err);
    toast({ title: "Add failed", description: err?.message || "Could not add bank account.", variant: "destructive" });
  }
};

const getAuthToken = () =>
  localStorage.getItem("auth_token") ||
  sessionStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("token") ||
  "";

const fetchBankAccounts = async (): Promise<void> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  console.groupCollapsed("%c[BankList] Fetch → GET /api/bankaccount", "color:#60a5fa;font-weight:700;");
  console.log("[BankList] URL:", BANK_LIST_URL);
  console.log("[BankList] Auth header present:", Boolean(token));

  try {
    const res = await fetch(BANK_LIST_URL, {
      method: "GET",
      headers,
      credentials: "include",
    });

    console.log("[BankList] HTTP:", res.status, res.statusText);
    console.log("[BankList] Resp content-type:", res.headers.get("content-type"));

    const raw = await res.text();
    console.log("[BankList] Raw body:", raw);

    let data: any = {};
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.warn("[BankList] JSON parse failed, using raw text:", e);
    }

    console.log("[BankList] Parsed JSON:", data);

    if (!res.ok) {
      const code = data?.error || `http_${res.status}`;
      console.error("[BankList] Error code:", code);
      throw new Error(code);
    }

    // Map API → UI model
    const mapped = (Array.isArray(data?.accounts) ? data.accounts : []).map((ba: any) => ({
      id: ba._id as string,
      bank: String(ba.bankName || ""),
      last4: String(ba.accountNumber || "").slice(-4),
      ifsc: String(ba.ifscCode || "").toUpperCase(),
      isDefault: !!ba.default,
    })) as BankAccount[];

    console.log("[BankList] Mapped list:", mapped);
    console.log("[BankList] Count:", mapped.length);

    setBankAccounts(mapped);
    localStorage.setItem("tokun_bank_accounts", JSON.stringify(mapped));

    console.log("%c[BankList] ✅ SUCCESS", "color:#22c55e;font-weight:700;");
  } catch (err: any) {
    console.error("[BankList] ❌ FAILED:", err?.message || err);

    // fallback to cache
    try {
      const cached = localStorage.getItem("tokun_bank_accounts");
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log("[BankList] Using cached:", parsed);
        setBankAccounts(parsed);
      }
    } catch {}
  } finally {
    console.groupEnd();
  }
};
useEffect(() => {
    if (profileOpen && profileTab === "bank") {
      fetchBankAccounts();
    }
  }, [profileOpen, profileTab]); 


useEffect(() => {
  if (cartOpen) fetchCart();
}, [cartOpen, fetchCart]);







const setDefaultBankAccount = async (accountId: string): Promise<void> => {
  const token =
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = bankSetDefaultUrl(accountId);

  console.groupCollapsed("%c[BankSetDefault] POST → /api/bankaccount/set-default/:id", "color:#f59e0b;font-weight:700;");
  console.log("[BankSetDefault] URL:", url);
  console.log("[BankSetDefault] Headers:", { ...headers, Authorization: headers.Authorization ? "Bearer <present>" : "—" });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
    });

    console.log("[BankSetDefault] HTTP:", res.status, res.statusText);
    console.log("[BankSetDefault] Resp content-type:", res.headers.get("content-type"));

    const raw = await res.text();
    console.log("[BankSetDefault] Raw body:", raw);

    let data: any = {};
    try { data = JSON.parse(raw); } catch (e) {
      console.warn("[BankSetDefault] JSON parse failed, using raw text:", e);
    }
    console.log("[BankSetDefault] Parsed JSON:", data);

    if (!res.ok) {
      const code = data?.error || `http_${res.status}`;
      console.error("[BankSetDefault] Error code:", code);
      throw new Error(code);
    }

    const newDefaultId = data?.defaultAccount?._id as string | undefined;
    console.log("[BankSetDefault] New default id:", newDefaultId);

    // Update UI: mark the returned one as default
    if (newDefaultId) {
      setBankAccounts(prev => prev.map(a => ({ ...a, isDefault: a.id === newDefaultId })));
    }

    console.log("%c[BankSetDefault] ✅ SUCCESS", "color:#22c55e;font-weight:700;");
    toast({ title: "Default bank updated", description: "This account is now default." });
  } catch (err: any) {
    console.error("[BankSetDefault] ❌ FAILED:", err?.message || err);
    toast({ title: "Failed to set default", description: err?.message || "Try again.", variant: "destructive" });
  } finally {
    console.groupEnd();
  }
};








// Delete account
const deleteAccount = (id: string) => {
  setBankAccounts((prev) => {
    const next = prev.filter((a) => a.id !== id);
    // ensure 1 default remains if any accounts left
    if (next.length && !next.some((a) => a.isDefault)) next[0].isDefault = true;
    return [...next];
  });
};

// Set default
const makeDefault = (id: string) => {
  setDefaultBankAccount(id);
};




// hydrate from localStorage on mount
useEffect(() => {
  const rawAcc = localStorage.getItem("tokun_bank_accounts");
  if (rawAcc) { try { setBankAccounts(JSON.parse(rawAcc)); } catch {} }

  const rawTx = localStorage.getItem("tokun_bank_txns");
  if (rawTx) { try { setTransactions(JSON.parse(rawTx)); } catch {} }
}, []);

// persist on change
useEffect(() => {
  localStorage.setItem("tokun_bank_accounts", JSON.stringify(bankAccounts));
}, [bankAccounts]);

useEffect(() => {
  localStorage.setItem("tokun_bank_txns", JSON.stringify(transactions));
}, [transactions]);




type NotificationItem = {
  id: string;
  name: string;
  preview: string;
  time: string; // e.g. "18 min"
  read: boolean;
};

const [notifs, setNotifs] = useState<NotificationItem[]>([
  { id: "1", name: "Firoz Ansari", preview: "High-fived your workout", time: "18 min", read: false },
  { id: "2", name: "Laxmi Patil",  preview: "High-fived your workout", time: "18 min", read: false },
  { id: "3", name: "Nirmal Joshi", preview: "High-fived your workout", time: "18 min", read: true  },
  { id: "4", name: "Amit Shah",   preview: "High-fived your workout", time: "18 min", read: true  },
]);
const unreadCount = useMemo(() => notifs.filter(n => !n.read).length, [notifs]);

const goToNotifications = () => navigate("/notifications");
const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));


const { token } = useAuth();

const handleCheckout = async () => {
  if (!token) {
    console.error("[Checkout] ❌ No auth token found");
    toast({
      title: "Unauthorized",
      description: "Please login first.",
      variant: "destructive",
    });
    return;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const CHECKOUT_URL = `${API_BASE}/api/cart/checkout`;
  const VERIFY_URL = `${API_BASE}/api/cart/verify`;

  try {
    // --- Step 1: Create checkout order ---
    console.groupCollapsed(
      "%c[Checkout] POST → /api/cart/checkout",
      "color:#60a5fa;font-weight:700;"
    );

    const res = await fetch(CHECKOUT_URL, {
      method: "POST",
      headers,
      credentials: "include",
    });

    console.log("[Checkout] HTTP:", res.status, res.statusText);
    const rawCheckout = await res.text();
    console.log("[Checkout] Raw body:", rawCheckout);

    let checkoutData: any = {};
    try {
      checkoutData = JSON.parse(rawCheckout);
    } catch (e) {}

    if (!res.ok || !checkoutData.success) {
      throw new Error(checkoutData?.error || `http_${res.status}`);
    }

    const { order, prompts } = checkoutData;
    console.log(
      "%c[Checkout] ✅ Success",
      "color:#22c55e;font-weight:700;",
      { order, prompts }
    );
    console.groupEnd();

    // --- Step 2: Handle free prompts (no Razorpay needed) ---
    if (!order) {
      console.log("[Checkout] No paid prompts → directly calling verify");

      const verifyRes = await fetch(VERIFY_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          razorpayPaymentId: null,
          razorpayOrderId: null,
          razorpaySignature: null,
          pricePaid: 0,
        }),
        credentials: "include",
      });

      const rawVerify = await verifyRes.text();
      console.log("[Verify] Raw body:", rawVerify);

      let verifyData: any = {};
      try {
        verifyData = JSON.parse(rawVerify);
      } catch {}

      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData?.error || `http_${verifyRes.status}`);
      }

      toast({
        title: "Checkout complete",
        description: "Free prompts added to purchases.",
      });
      return;
    }

    // --- Step 3: Open Razorpay popup ---
    const options: any = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Tokun.ai",
      description: "Prompt Checkout",
      order_id: order.id,
      handler: async (response: any) => {
        console.log("[Razorpay] Payment success:", response);

        // --- Step 4: Verify payment ---
        const verifyRes = await fetch(VERIFY_URL, {
          method: "POST",
          headers,
          body: JSON.stringify({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            pricePaid: order.amount / 100,
          }),
          credentials: "include",
        });

        const rawVerify = await verifyRes.text();
        console.log("[Verify] Raw body:", rawVerify);

        let verifyData: any = {};
        try {
          verifyData = JSON.parse(rawVerify);
        } catch {}

        if (!verifyRes.ok || !verifyData.success) {
          throw new Error(verifyData?.error || `http_${verifyRes.status}`);
        }

        console.log(
          "%c[Verify] ✅ Success",
          "color:#22c55e;font-weight:700;",
          verifyData
        );
        toast({
          title: "Checkout complete",
          description: "Your prompts are now available.",
        });
      },
      theme: { color: "#1A73E8" },
    };

    const razorpayInstance = new (window as any).Razorpay(options);
    razorpayInstance.open();
  } catch (err: any) {
    console.error("[Checkout] ❌ FAILED:", err?.message || err);
    toast({
      title: "Checkout failed",
      description: err?.message || "Something went wrong.",
      variant: "destructive",
    });
    console.groupEnd();
  }
};

const [notifications, setNotifications] = useState<any[]>([]);
const [realUnreadCount, setRealUnreadCount] = useState(0);

// const fetchNotifications = async () => {
//   if (!token) return;
//   try {
//     const res = await fetch(`${API_BASE}/api/prompt-collab/notifications`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     const data = await res.json();
//     if (data?.success) {
//       setNotifications(data.notifications);
//       setRealUnreadCount(data.notifications.filter((n: any) => !n.read).length);
//     }
//   } catch (err) {
//     console.error("❌ Error fetching notifications:", err);
//   }
// };

const fetchNotifications = async () => {
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/prompt-collab/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (data?.success) {
      const prevUnread = realUnreadCount;
      const nextUnread = data.notifications.filter((n: any) => !n.read).length;

      setNotifications(data.notifications);
      setRealUnreadCount(nextUnread);

      // 🔔 SHOW HEADER TOAST ON NEW NOTIFICATION
      if (nextUnread > prevUnread) {
        const latest = data.notifications.find((n: any) => !n.read);

        if (latest) {
          setHeaderToast({
            title: latest.promptId?.title || "New notification",
            message: latest.message || "You have a new update",
          });

          // auto hide after 5s
          if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
          }

          toastTimerRef.current = window.setTimeout(() => {
            setHeaderToast(null);
          }, 5000);
        }
      }
    }
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
  }
};


const markAllAsRead = async () => {
  const unread = notifications.filter((n) => !n.read);
  await Promise.all(
    unread.map((n) =>
      fetch(`${API_BASE}/api/prompt-collab/notifications/read/${n._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
    )
  );
  fetchNotifications(); // refresh
};

useEffect(() => {
  fetchNotifications();
  const interval = setInterval(fetchNotifications, 60000);
  return () => clearInterval(interval);
}, [token]);

useEffect(() => {
  if (!token) return;

  fetch(`${API_BASE}/api/chat/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      if (data?.success) {
        const totalUnread = data.conversations.reduce(
          (sum: number, c: any) => sum + (c.unreadCount || 0),
          0
        );
        setUnreadChats(totalUnread);
      }
    });
}, [token]);

  return (
    <>
    
 <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
  <div className="pointer-events-auto w-[92%] max-w-[1180px] mt-2 rounded-2xl backdrop-blur-md bg-transparent text-white px-2 sm:px-3 md:px-4 py-1.5 flex items-center justify-between">
  
        {/* Brand */}
        
        {/* Brand */}
 <button
    type="button"
    onClick={handleBrandClick}
    className="flex items-center gap-2 sm:gap-3 min-w-0 group shrink-0"
    aria-label="Go to home"
  >
   <img
  src="/icons/Tokun.png"
  alt="Tokun.ai Logo"
  className="
    h-12
    sm:h-14
    md:h-16
    lg:h-20
    xl:h-24
    w-auto
    max-w-none
    object-contain
    transition-transform duration-200
    group-hover:scale-105
  "
/>
  </button>







        

        {/* Actions (Get Pro removed) */}
         <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-nowrap shrink-0">
      
  {/* 🔔 HEADER TOAST */}
  {/* 🔔 HEADER TOAST */}
<div className="relative flex items-center">
  {headerToast && (
    <div
      className="
        absolute right-full top-1/2 -translate-y-1/2
        mr-1
        z-[2000]
        w-[136px] sm:w-[260px]
        max-w-[136px] sm:max-w-[260px]
        rounded-md sm:rounded-xl
        border border-white/10
        bg-[#1C1C1C]
        shadow-[0_8px_24px_rgba(0,0,0,0.55)]
        animate-in slide-in-from-right-4 fade-in-0
        overflow-hidden
      "
    >
      <div className="px-2 py-1.5 sm:p-3">
        <div className="text-[10px] sm:text-sm font-semibold text-white truncate leading-none">
          {headerToast.title}
        </div>
        <div className="text-[9px] sm:text-xs text-white/70 mt-0.5 line-clamp-1 sm:line-clamp-2 leading-tight">
          {headerToast.message}
        </div>
      </div>

      <div className="h-[1.5px] sm:h-[3px] w-full bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
          style={{ animation: "toastProgress 5s linear forwards" }}
        />
      </div>
    </div>
  )}

  <button
    type="button"
    onClick={goToSaved}
    className="relative flex items-center justify-center rounded-md p-2 hover:bg-white/10 transition"
    title="Saved"
  >
    <img src="/icons/cop.png" alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
  </button>
</div>


 {/* CHAT */}
    <button
      onClick={() => navigate("/chat")}
      className="relative p-2 rounded-full hover:bg-white/10 transition"
    >
      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />

      {unreadChats > 0 && (
        <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 grid place-items-center rounded-full">
          {unreadChats}
        </span>
      )}
    </button>


              

        {/* 🔔 Notifications */}
<DropdownMenu>
  <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-full hover:bg-white/10 transition"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />

          {realUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 grid place-items-center rounded-full">
              {realUnreadCount > 9 ? "9+" : realUnreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

  <DropdownMenuContent
    side="bottom"
    align="start"
    sideOffset={10}
    className="no-scrollbar overflow-y-auto p-2"
    style={{
      width: 320,
      maxHeight: "70vh",
      borderRadius: 12,
      background: "#1C1C1C",
      border: "1px solid rgba(255,255,255,0.10)",
      color: "#fff",
      fontFamily: "Inter, system-ui, Arial, sans-serif",
      fontSize: 14,
    }}
  >
    <div className="flex items-center justify-between px-2 py-2">
      <span className="font-semibold text-base">Notifications</span>
      {realUnreadCount > 0 && (
        <button
          type="button"
          className="text-xs text-white/70 hover:text-white"
          onClick={markAllAsRead}
        >
          Mark all as Read
        </button>
      )}
    </div>

    {/* Notifications List */}
    <div className="divide-y divide-white/10">
      {notifications.length === 0 ? (
        <div className="text-center text-white/50 py-8">No notifications yet</div>
      ) : (
        notifications.slice(0, 7).map((n) => (
          <button
            key={n._id}
            onClick={() => navigate("/notifications")}
            className="w-full flex items-start gap-3 px-3 py-3 rounded-md hover:bg-white/5 text-left"
          >
            <span
              className={`mt-1 h-2 w-2 rounded-full ${
                !n.read ? "bg-blue-500" : "bg-transparent"
              }`}
            ></span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">
                {n.promptId?.title || "Prompt Notification"}
              </div>
              <div className="text-xs text-white/70 truncate">{n.message}</div>
            </div>
            <span className="ml-auto text-xs text-white/50 shrink-0">
              {new Date(n.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          </button>
        ))
      )}
    </div>

    {/* Footer */}
    {notifications.length > 0 && (
      <div className="border-t border-white/10 mt-2 pt-2">
        <button
          className="w-full text-center px-3 py-2 rounded-md hover:bg-white/5"
          onClick={() => navigate("/notifications")}
        >
          See all notifications
        </button>
      </div>
    )}
  </DropdownMenuContent>
</DropdownMenu>





  {/* CART */}
    <button
      type="button"
      onClick={() => setCartOpen(true)}
      className="relative p-2 rounded-full hover:bg-white/10 transition"
    >
      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />

      {cart.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 grid place-items-center rounded-full">
          {cart.length}
        </span>
      )}
    </button>




          {/* Upload Prompt (force one line) */}
          <button
      type="button"
      onClick={handlePostPrompt}
      className="hidden sm:inline-flex items-center gap-2 px-3 h-9 rounded-full text-black font-medium whitespace-nowrap"
      style={{ background: "#D9D9D9" }}
    >
      <span className="grid place-items-center w-5 h-5 rounded-full bg-black">
        <Plus className="w-3 h-3 text-white" strokeWidth={2.5} />
      </span>

      <span className="text-sm">Upload Prompt</span>
    </button>
    {/* MOBILE UPLOAD BUTTON */}
    <button
      onClick={handlePostPrompt}
      className="sm:hidden grid place-items-center w-9 h-9 rounded-full"
      style={{
        background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)"
      }}
    >
      <Plus className="w-4 h-4 text-white" />
    </button>

          {/* Profile dropdown */}




           <DropdownMenu>
          <DropdownMenuTrigger asChild>
  <button
    type="button"
    aria-label="Account menu"
    title={fullName}
    className="group inline-flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#2C2C2C] text-white whitespace-nowrap"
  >

    {/* NAME + PLAN → hidden on mobile */}
    <div className="hidden sm:flex items-center gap-2">

      {/* PRO PLAN */}
      {user?.plan === "pro" && (
        <>
          <span className="truncate font-semibold bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] text-transparent bg-clip-text">
            Hello, {fullName}
          </span>

          <LuBadgeCheck
            className="w-[22px] h-[22px]"
            style={{
              stroke: "url(#proGradient)",
              strokeWidth: 2,
              fill: "none",
            }}
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

      {/* ENTERPRISE PLAN */}
      {user?.plan === "enterprise" && (
        <>
          <span className="truncate font-semibold bg-gradient-to-r from-[#FACC15] to-[#CA8A04] text-transparent bg-clip-text">
            Hello, {fullName}
          </span>

          <LuBadgeCheck
            className="w-[22px] h-[22px]"
            style={{
              stroke: "url(#enterpriseGradient)",
              strokeWidth: 2,
              fill: "none",
            }}
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

      {/* FREE PLAN */}
      {(!user?.plan || user?.plan === "free") && (
        <>
          <span className="truncate font-semibold text-white">
            Hello, {fullName}
          </span>

          <span className="px-2 py-0.5 text-xs rounded-md bg-gray-700 text-gray-300">
            FREE
          </span>
        </>
      )}

    </div>

    {/* DROPDOWN ICON → always visible */}
    <span className="shrink-0 grid place-items-center rounded-full bg-white/95 w-6 h-6">
      <ChevronDown className="w-3.5 h-3.5 text-black" />
    </span>

  </button>
</DropdownMenuTrigger>

  {/* Make the WHOLE content scrollable (scrollbar hidden) */}
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
      {/* Name / email */}
     <div className="pt-2 space-y-2">
  {/* ✅ CLICKABLE NAME */}
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

  {/* EMAIL (unchanged) */}
  <div className="text-white/70 text-sm">
    {displayEmail || "your@email.com"}
  </div>

  {/* ✅ SET UP PROFILE (UNCHANGED & PRESERVED) */}
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


      {/* Theme row */}
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

      {/* Settings */}
      <div
        className="py-2 flex items-center gap-2 border-t border-white/10 cursor-pointer"
        onClick={() => navigate("/settings")}
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </div>

      {/* Lifetime Tokun saved */}
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

      {/* Links — no inner scrolling; they’re part of the main scroll now */}
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

      {/* Footer */}
      <div className="border-t border-white/10 flex items-center justify-between pt-2 text-xs text-gray-400">
        <span>Privacy</span>
        <span>Terms</span>
        <span>Copyright</span>
      </div>
    </div>
  </DropdownMenuContent>
</DropdownMenu>

        </div>
      

      {/* Modals */}
      <ApiKeyModal open={apiKeyModalOpen} onOpenChange={setApiKeyModalOpen} onSave={() => {}} />
      <SubscriptionModal open={subscriptionModalOpen} onOpenChange={setSubscriptionModalOpen} />
      <SellPromptModal open={sellOpen} onOpenChange={setSellOpen} onPromptSubmitted={() => {}} />

      {/* hide scrollbars utility (scoped) */}
        <style>{`
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  /* Save & Continue default + hover gradient */
  .btn-gradient-hover { background:#333335; }
  .btn-gradient-hover:hover { background:linear-gradient(270deg,#FF14EF 0%, #1A73E8 100%); }
`}</style>

 

{cartOpen && (
  <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1100] grid place-items-center">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      onClick={() => setCartOpen(false)}
    />

    {/* Cart container */}
    <div
      className="relative text-white shadow-2xl flex flex-col"
      style={{
        width: "min(95vw, 950px)",
        height: "min(90vh, 750px)",
        background: "#17171A",
        borderRadius: 16,
        fontFamily: "Inter",
      }}
    >
      {/* Close Button */}
      <button
        aria-label="Close"
        onClick={() => setCartOpen(false)}
        className="absolute right-4 top-4 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8 z-10"
      >
        <X className="w-4 h-4 text-white/90" />
      </button>

      {/* Header */}
      <div className="p-6 pb-4 flex-shrink-0">
        <h2 style={{ fontFamily: "Inter", fontWeight: 500, fontSize: "20px" }}>
          Your Prompt Cart ({cart.length} Items)
        </h2>
      </div>

      {/* Table header */}
      {/* <div
        className="grid grid-cols-[1fr_150px_100px] items-center px-6 text-white/80 text-sm"
        style={{
          background: "#1C1C1C",
          height: 50,
          borderRadius: 8,
          margin: "0 auto",
          width: "95%",
        }}
      >
        <span>Prompt</span>
        <span className="text-right">Price</span>
        <span className="text-right">Remove</span>
      </div> */}

     {/* Cart Body */}
<div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-4">
  {cart.length === 0 ? (
    // ---------- EMPTY CART ----------
    <div className="flex flex-col items-center justify-center text-center py-20 space-y-6">
      {/* White cart icon */}
     <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />

      {/* Texts */}
      <div className="space-y-2">
        <p className="text-white text-lg font-medium">Your cart is empty!</p>
        <p className="text-white text-sm">Add items to it now.</p>
      </div>

      {/* CTA Button */}
      <button
        type="button"
        onClick={() => {
          setCartOpen(false); // close modal
          navigate("/prompt-marketplace"); // go to marketplace
        }}
        className="px-6 py-3 rounded-lg text-white text-sm font-medium"
        style={{
          background: "linear-gradient(270deg,#FF14EF 0%, #1A73E8 100%)",
        }}
      >
        Shop prompt now
      </button>
    </div>
  ) : (
    <>
      {/* ---------- TABLE HEADER (only shows when cart has items) ---------- */}
      <div
        className="grid grid-cols-[1fr_150px_100px] items-center px-6 text-white/80 text-sm"
        style={{
          background: "#1C1C1C",
          height: 50,
          borderRadius: 8,
          margin: "0 auto",
          width: "95%",
        }}
      >
        <span>Prompt</span>
        <span className="text-right">Price</span>
        <span className="text-right">Remove</span>
      </div>

      {/* ---------- ITEMS ---------- */}
      {cart
        .filter((item) => item.price !== 0 && item.tag !== "Free")
        .map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_150px_100px] items-center py-4 gap-4"
            style={{ background: "#17171A" }}
          >
            {/* Prompt info */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-md overflow-hidden bg-black">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}
                {item.videoUrl && (
                  <button className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                )}
              </div>
              <div>
                <p className="text-xs text-white/60">
                  Create an engaging product description
                </p>
                <p className="text-base text-white font-medium">{item.title}</p>

                {/* Tag */}
                <div className="flex gap-2 mt-1">
                  {item.exclusive ? (
                    <span className="px-2 py-0.5 rounded-md bg-green-500/20 text-green-400 text-xs">
                      One-time Purchase
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-400 text-xs">
                      Premium
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Price */}
            <span className="text-right text-white text-base">
              ₹{item.price}
            </span>

            {/* Remove */}
            <div className="flex justify-center">
              <button
                onClick={async () => {
                  await removeFromCart(item.id);
                }}
                className="text-red-400 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
    </>
  )}
</div>


      {/* Footer */}
 {cart.length > 0 && (
  <div className="flex-shrink-0 border-t border-black/10 p-6 space-y-3">
    <div className="space-y-2 text-sm text-white">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>
          ₹
          {cart
            .filter((i) => i.price !== 0)
            .reduce((sum, i) => sum + (i.price || 0), 0)
            .toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between">
        <span>+ 5% Tokun fees</span>
        <span>
          ₹
          {(
            cart
              .filter((i) => i.price !== 0)
              .reduce((sum, i) => sum + (i.price || 0), 0) * 0.05
          ).toFixed(2)}
        </span>
      </div>
    </div>

    <div className="mt-4 flex items-center justify-end gap-4">
      <span className="text-sm text-white">Month (inclusive of GST)</span>
      <button
        onClick={handleCheckout}
        className="px-6 h-12 rounded-lg text-white"
        style={{
          background: "linear-gradient(270deg,#FF14EF 0%, #1A73E8 100%)",
          fontFamily: "Inter",
          fontWeight: 400,
        }}
      >
        Checkout
      </button>
    </div>
  </div>
)}
    </div>
  </div>

)}

  </div>

    </header>

  

      {profileOpen && (
  <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] grid place-items-center">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      onClick={() => setProfileOpen(false)}
    />

    {/* Card */}
    <div
      className="relative w-[min(96vw,900px)] max-h-[90vh] rounded-2xl text-white shadow-2xl overflow-hidden"
      style={{ background: "#17171A", fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
    >
      {/* Close */}
      <button
        aria-label="Close"
        onClick={() => setProfileOpen(false)}
        className="absolute right-2 top-2 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8 z-10"
      >
        <X className="w-4 h-4 text-white/90" />
      </button>

      {/* Two-column layout */}
     {/* Two-column layout */}
<div className="grid grid-cols-[240px,1fr] max-h-[90vh] overflow-hidden">

        {/* Left nav */}
   {/* <aside
  className="no-scrollbar overflow-y-auto"
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
                  background: active ? "#242429" : "transparent",
                  color: active ? "#ffffff" : "rgba(255,255,255,0.78)",
                }}
              >
                <item.Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside> */}


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
          background: active ? "#1C1C1C" : "transparent", // selected bg per spec
          color: active ? "#ffffff" : "rgba(255,255,255,0.78)",
        }}
      >
        <item.Icon className="w-5 h-5" />
        <span>{item.label}</span>
      </button>
    );
  })}
</aside>


        {/* Right content */}
       <section
  className="no-scrollbar overflow-y-auto p-6 md:p-8"
  style={{ maxHeight: "90vh" }}
>

        {/* “Individual” button */}
{/* “Individual” button (unchanged position) */}
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



          {/* Profile tab */}
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
               

    {/* modal for delete */}
    {confirmDelete.open && (
  <div className="fixed inset-0 z-[1100] grid place-items-center">
    {/* backdrop */}
    <div
      className="absolute inset-0 bg-black/70"
      onClick={() => setConfirmDelete({ open: false })}
    />
    {/* card */}
    <div
      className="relative w-[min(92vw,520px)] rounded-xl p-6 text-white shadow-2xl"
      style={{ background: "#17171A", border: "1px solid rgba(255,255,255,0.10)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="del-bank-title"
    >
      {/* close */}
      <button
        aria-label="Close"
        onClick={() => setConfirmDelete({ open: false })}
        className="absolute right-2 top-2 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8"
      >
        <X className="w-4 h-4 text-white/90" />
      </button>

      {/* icon */}
      <div className="grid place-items-center mb-3">
        <div className="grid place-items-center h-12 w-12 rounded-full bg-black/50">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
      </div>

      {/* text */}
      <h3 id="del-bank-title" className="text-center text-lg font-semibold mb-2">
        Delete Bank Account?
      </h3>
      <p className="text-center text-white/80">
        You are about to delete your saved bank account
        <br />
        ending with ****{confirmDelete.last4}
      </p>
      <p className="text-center text-white/60 mt-3">
        This action is permanent and cannot be undone.
      </p>

      {/* actions */}
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









    {/* //bank */}

       {profileTab === "bank" && (
  <>
    {/* ---------- EMPTY STATE (no bank added) ---------- */}
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

    {/* ---------- BANK FORM ---------- */}
    {(!hasBankAccount && showBankForm) || (hasBankAccount && showBankForm) ? (
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
{/* Toggle appears only when user already has at least one account */}
{/* Toggle appears only when user already has at least one account */}
{hasBankAccount && (
  <label className="flex items-center gap-3 pt-3 select-none">
    <button
      type="button"
      role="switch"
      aria-checked={setAsDefault}
      onClick={() => setSetAsDefault(v => !v)}
      className="relative h-6 w-11 rounded-full transition-colors"
      style={{
        background: setAsDefault
          ? "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)"
          : "#2B2B2E",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      {/* keep the knob inside using left instead of translateX */}
      <span
        className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white transition-all"
        style={{ left: setAsDefault ? "calc(100% - 18px)" : "2px" }}
      />
    </button>
    <span className="text-white/90">Set as Default Bank Account</span>
  </label>
)}



        </div>

        {/* Actions (exact sizing) */}
       <div
  className="sticky bottom-0 pt-4 pb-4 mt-4 flex items-center justify-end gap-3"
  style={{ background: "#17171A" }}
>

          <button
            type="button"
            onClick={() => {
              setShowBankForm(false);
              // if user had no accounts before, empty-state will show again
            }}
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
    ) : null}

    {/* ---------- DASHBOARD (after at least 1 account) ---------- */}
    {hasBankAccount && !showBankForm && (
      <div className="space-y-7">
        {/* Earnings card */}
        <div
          className="rounded-xl border border-white/10 p-5"
          style={{ background: "#17171A" }}
        >
          <div className="text-white/70 text-sm">Total Earning</div>
          <div className="mt-2 text-[26px] font-medium">₹{totalEarnings.toLocaleString()}</div>
        </div>

        {/* Linked accounts */}
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
    onClick={() => makeDefault(acc.id)}          // ← makes it default
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
  onClick={() => requestDelete(acc)}   // ← was: deleteAccount(acc.id)
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

          {/* Add another account */}
          <div className="mt-4">
        <button
  type="button"
  onClick={() => {
    setShowBankForm(true);
    setSetAsDefault(false); // show toggle, default OFF
  }}
  className="w-full rounded-xl border border-white/15 px-4 py-3 text-white/90 hover:border-white/25 transition"
  style={{ background: "#1F1F22" }}
>
  + Add another bank account
</button>

          </div>
        </div>

        {/* Transaction History */}
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
            <div
              className="rounded-xl border border-white/10"
              style={{ background: "#17171A" }}
            >
              <div className="grid grid-cols-[2fr,1fr,1fr] px-4 py-3 text-white/70 border-b border-white/10">
                <span>Date</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-[2fr,1fr,1fr] px-4 py-3 border-t border-white/5"
                >
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



{/* INVOICES */}
{profileTab === "invoices" && (
  <div className="space-y-5">
    <h3 className="text-[22px] mb-2">My Invoices</h3>

    <div className="rounded-md overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[2fr,1fr,120px] items-center bg-[#1F1F22] px-4 py-3 text-white/80">
        <span>Date</span>
        <span>Amount</span>
        <span className="text-right">Status</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/10">
        {[
          { date: "Sep 16, 2025", amount: "₹4,500" },
          { date: "Sep 15, 2025", amount: "₹4,500" },
        ].map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[2fr,1fr,120px] items-center px-4 py-4"
          >
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

{/* BILLING INFORMATION */}
{profileTab === "billing" && (
  <div className="space-y-5">
    <h3 className="text-[22px] mb-2">My Billing information</h3>

    <div className="rounded-md overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[2fr,1fr,120px] items-center bg-[#1F1F22] px-4 py-3 text-white/80">
        <span>Item</span>
        <span>Date</span>
        <span className="text-right">Status</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/10">
        {[
          { item: "Premium e-commerce\ncopy prompt", date: "Sep 16, 2025" },
          { item: "Customization Add-on", date: "Sep 15, 2025" },
        ].map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[2fr,1fr,120px] items-center px-4 py-4"
          >
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

  {token && (
  <KycGateModal
    open={kycOpen}
    onClose={() => {
      setKycOpen(false);
      setPendingUpload(false);
    }}
    token={token}
    apiBase={API_BASE}
    defaultCountry="IN"
    requiredForLabel="buying and uploading prompts"
    onVerified={() => {
      setKycOpen(false);

      if (pendingUpload) {
        setPendingUpload(false);
        setSellOpen(true);
      }
    }}
  />
)}


</>
  );
};

export default Header;
