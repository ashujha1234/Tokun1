


// // src/components/Header.tsx
// import { useMemo, useState,useEffect ,useRef, useCallback} from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { socket } from "@/lib/socket";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Settings, Plus, ChevronDown } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import ApiKeyModal from "@/components/ApiKeyModal";
// import SubscriptionModal from "@/components/SubscriptionModal";
// import { toast } from "@/components/ui/use-toast";
import PurchaseConfirmModal from "@/components/PurchaseConfirmModal";
// import SellPromptModal from "@/components/SellPromptModal";
// import { User, Landmark, FileText, CreditCard ,X,Download,Trash, Check , Star,Bell,ChevronRight,AlertTriangle} from "lucide-react";
// import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
// import { ShoppingCart } from "lucide-react";
// import { useCart } from "@/contexts/CartContext";
//  import { Zap } from "lucide-react";
// import { Crown } from "lucide-react";
// import { MessageCircle } from "lucide-react";
// import { LuBadgeCheck } from "react-icons/lu";
// import KycGateModal from "@/components/KycGateModal";
// // import { useAuth } from "@/contexts/AuthContext";
// // import { toast } from "@/components/ui/use-toast";

// type ThemeMode = "light" | "dark" | "system";

// const Header = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
// const CHAT_BADGE_KEY = "tokun_chat_badge_count";

// const getStoredChatBadge = () => {
//   const raw = localStorage.getItem(CHAT_BADGE_KEY);
//   const n = Number(raw || "0");
//   return Number.isFinite(n) ? n : 0;
// };

// const setStoredChatBadge = (count: number) => {
//   localStorage.setItem(CHAT_BADGE_KEY, String(Math.max(0, count)));
// };
//   // const { user, logout } = useAuth();
//   const { user, logout, token } = useAuth() as any;
//  const { cart, removeFromCart, fetchCart } = useCart();
//  const [unreadChats, setUnreadChats] = useState<number>(() => getStoredChatBadge());
// // Text color based on plan
// const userPlanColor =
//   user?.plan === "pro"
//     ? "text-[#FF14EF]"
//     : user?.plan === "enterprise"
//     ? "text-[#FACC15]"
//     : "text-white";




  


//   // State
//   const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
//   const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
//   const [sellOpen, setSellOpen] = useState(false);
//   const [theme, setTheme] = useState<ThemeMode>("system");
//    const [cartOpen, setCartOpen] = useState(false);
   
//    const [headerToast, setHeaderToast] = useState<{
//   title: string;
//   message: string;
// } | null>(null);

//   const [kycOpen, setKycOpen] = useState(false);
// const [pendingUpload, setPendingUpload] = useState(false);
// const [pendingCheckout, setPendingCheckout] = useState(false);
// const [hideHeader, setHideHeader] = useState(false);
// useEffect(() => {
//   const onScroll = () => setHideHeader(window.scrollY > 10);
//   window.addEventListener("scroll", onScroll, { passive: true });
//   return () => window.removeEventListener("scroll", onScroll);
// }, []);
// const toastTimerRef = useRef<number | null>(null);

// type Notif = { id: string; title: string; body: string; date: string; unread: boolean };
// const [notifList, setNotifList] = useState<Notif[]>([]);
// useEffect(() => {
//   try {
//     const raw = localStorage.getItem("tokun_notifications");
//     if (raw) setNotifList(JSON.parse(raw));
//   } catch {}
// }, []);





//   // Display
//   const displayName = useMemo(() => user?.name?.trim() || "", [user]);
//   const displayEmail = useMemo(() => user?.email || "", [user]);
//   const fullName = useMemo(() => {
//     if (displayName) return displayName;
//     if (displayEmail) return displayEmail.split("@")[0];
//     return "User";
//   }, [displayName, displayEmail]);

//   // Stats (example)
//   const lifetimeTokunSaved = (user as any)?.lifetimeTokunSaved ?? 150;

//   // Nav helpers
//   const handleBrandClick = () => navigate(user ? "/app" : "/");
//   const goToSaved = () => navigate("/saved");
//   const goToPurchaseHistory = () => navigate("/prompty-history?p=purchased");
//   const goToUploadHistory = () => navigate("/prompty-history?p=uploaded");

//   const handleLogout = () => {
//     logout();
//     toast({ title: "Logged out", description: "You have been successfully logged out." });
//     navigate("/login");
//   };


//   const uiTextStyle: React.CSSProperties = {
//     fontFamily: "Inter, system-ui, Arial, sans-serif",
//     fontWeight: 500,
//     fontSize: 12,
//     lineHeight: "100%",
//   };

//   const themeBtn = (id: ThemeMode, src: string, alt: string) => (
//     <button
//       type="button"
//       onClick={() => setTheme(id)}
//       className="inline-flex items-center justify-center rounded-full"
//       style={{
//         width: 28,
//         height: 28,
//         outline: theme === id ? "2px solid rgba(255,255,255,0.9)" : "none",
//       }}
//       aria-pressed={theme === id}
//       aria-label={alt}
//       title={alt}
//     >
//       <img src={src} alt="" className="w-4 h-4" />
//     </button>
//   );


//   const [profileOpen, setProfileOpen] = useState(false);
// const [profileTab, setProfileTab] = useState<"profile" | "bank" | "invoices" | "billing">("profile");

// useEffect(() => {
//   if (!profileOpen) return;
//   const onKey = (e: KeyboardEvent) => e.key === "Escape" && setProfileOpen(false);
//   window.addEventListener("keydown", onKey);
//   return () => window.removeEventListener("keydown", onKey);
// }, [profileOpen]);



// // // whether the user already has a bank account (wire this to real data later)
// // const [hasBankAccount, setHasBankAccount] = useState(false);
// // // controls showing the form after clicking "Add"
// // const [showBankForm, setShowBankForm] = useState(false);






// const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";
// const BANK_ADD_URL = API_BASE ? `${API_BASE}/api/bankaccount/add` : `/api/bankaccount/add`;

// // const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";
// const BANK_LIST_URL = API_BASE ? `${API_BASE}/api/bankaccount` : `/api/bankaccount`;

// const bankSetDefaultUrl = (id: string) =>
//   API_BASE
//     ? `${API_BASE}/api/bankaccount/set-default/${id}`
//     : `/api/bankaccount/set-default/${id}`;




// const goToMyProfile = () => {
//   if (!user?._id) return;
//   navigate(`/profile/${user._id}`);
// };


// const ensureKycVerified = async () => {
//   if (!token) return false;

//   try {
//    const res = await fetch(`${API_BASE}/api/kyc/status`, {
//       headers: { Authorization: `Bearer ${token}` },
//       credentials: "include",
//     });

//     const data = await res.json().catch(() => ({}));
//     const s = data?.kycStatus || data?.status;

//     if (s === "VERIFIED") return true;

//     setKycOpen(true);
//     return false;
//   } catch {
//     setKycOpen(true);
//     return false;
//   }
// };

// const handleChatClick = async () => {
//   setUnreadChats(0);
//   setStoredChatBadge(0);

//   navigate("/chat");

//   if (!token) return;

//   try {
//     await fetch(`${API_BASE}/api/chat/conversations/read-all`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${token}` },
//       credentials: "include",
//     });

//     window.dispatchEvent(new CustomEvent("chat-read"));
//   } catch (err) {
//     console.error("Chat badge clear failed", err);
//   }
// };

// const handlePostPrompt = async () => {
//   if (!token) {
//     toast({
//       title: "Please log in",
//       description: "You must be logged in to upload prompts.",
//       //     });
//     navigate("/login");
//     return;
//   }

//   const ok = await ensureKycVerified();
//   if (!ok) {
//     setPendingUpload(true);
//     return;
//   }

//   setSellOpen(true);
// };















// // --- Bank data model ---
// type BankAccount = {
//   id: string;
//   bank: string;
//   last4: string;
//   ifsc: string;
//   isDefault: boolean;
// };

// type Txn = { id: string; date: string; amount: number; status: "Completed" | "Pending" };

// // Bank tab state
// const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);   // start empty
// const [transactions, setTransactions] = useState<Txn[]>([]);          // start empty => "No transaction history"
// const [totalEarnings, setTotalEarnings] = useState<number>(15250);    // demo number; wire to API later

// // Empty-state vs form
// const [showBankForm, setShowBankForm] = useState(false);
// // toggle only used when adding another account
// const [setAsDefault, setSetAsDefault] = useState(false);

// // Bank form local fields
// const [bankForm, setBankForm] = useState({
//   holder: "",
//   accNum: "",
//   confirmAccNum: "",
//   ifsc: "",
//   bankName: "",
// });

// // Ensure when modal closes and reopens, we go back to the empty-state if still no accounts
// useEffect(() => {
//   if (!profileOpen) {
//     setShowBankForm(false);
//     setSetAsDefault(false); // reset
//     setBankForm({ holder: "", accNum: "", confirmAccNum: "", ifsc: "", bankName: "" });
//   }
// }, [profileOpen]);



// const [bankFormToast, setBankFormToast] = useState<{
//   title: string;
//   message: string;
//   type?: "error" | "success";
// } | null>(null);

// const bankToastTimerRef = useRef<number | null>(null);

// const showBankFormToast = (
//   title: string,
//   message: string,
//   type: "error" | "success" = "error"
// ) => {
//   setBankFormToast({ title, message, type });

//   if (bankToastTimerRef.current) {
//     window.clearTimeout(bankToastTimerRef.current);
//   }

//   bankToastTimerRef.current = window.setTimeout(() => {
//     setBankFormToast(null);
//   }, 4000);
// };

// useEffect(() => {
//   return () => {
//     if (bankToastTimerRef.current) {
//       window.clearTimeout(bankToastTimerRef.current);
//     }
//   };
// }, []);

// const onlyLetters = (value: string) =>
//   value
//     .replace(/[^A-Za-z\s]/g, "")
//     .replace(/\s{2,}/g, " ")
//     .replace(/^\s+/, "");

// const onlyDigits = (value: string) => value.replace(/\D/g, "").slice(0, 18);

// // confirm-delete modal state
// const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string; last4?: string }>({ open: false });

// // open the confirm dialog
// const requestDelete = (acc: BankAccount) =>
//   setConfirmDelete({ open: true, id: acc.id, last4: acc.last4 });

// // actually delete
// const performDelete = () => {
//   if (confirmDelete.id) deleteAccount(confirmDelete.id);
//   setConfirmDelete({ open: false });
// };

// const hasBankAccount = bankAccounts.length > 0;

// // Add account
// const handleSaveBank = async () => {
//   const holder = bankForm.holder.trim();
//   const accNum = bankForm.accNum.trim();
//   const confirmAccNum = bankForm.confirmAccNum.trim();
//   const ifsc = bankForm.ifsc.trim().toUpperCase();
//   const bankName = bankForm.bankName.trim();

//   if (!holder || !accNum || !confirmAccNum || !ifsc || !bankName) {
//     showBankFormToast("Missing details", "Please fill out all fields.", "error");
//     return;
//   }

//   if (accNum !== confirmAccNum) {
//     showBankFormToast(
//       "Account numbers mismatch",
//       "Please re-enter account number correctly.",
//       "error"
//     );
//     return;
//   }

//   const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";
//   const BANK_ADD_URL = API_BASE ? `${API_BASE}/api/bankaccount/add` : `/api/bankaccount/add`;
//   const token =
//     localStorage.getItem("auth_token") ||
//     sessionStorage.getItem("auth_token") ||
//     localStorage.getItem("token") ||
//     sessionStorage.getItem("token") ||
//     "";

//   const headers: Record<string, string> = { "Content-Type": "application/json" };
//   if (token) headers.Authorization = `Bearer ${token}`;

//   const makeDefault = bankAccounts.length > 0 ? !!setAsDefault : undefined;

//   const body = {
//     accountHolderName: holder,
//     accountNumber: accNum,
//     confirmAccountNumber: confirmAccNum,
//     ifscCode: ifsc,
//     bankName: bankName,
//     default: makeDefault,
//   };

//   try {
//     const res = await fetch(BANK_ADD_URL, {
//       method: "POST",
//       headers,
//       body: JSON.stringify(body),
//       credentials: "include",
//     });

//     const raw = await res.text();
//     let data: any = {};
//     try {
//       data = JSON.parse(raw);
//     } catch {}

//     if (!res.ok) {
//       const code = data?.error || `http_${res.status}`;
//       const nice =
//         code === "all_fields_required"
//           ? "Please fill out all fields."
//           : code === "account_numbers_mismatch"
//           ? "Account numbers do not match."
//           : code === "account_already_exists"
//           ? "This bank account is already saved."
//           : "Could not add bank account.";

//       throw new Error(nice);
//     }

//     const ba = data?.bankAccount;

//     const newAcc = {
//       id: ba._id as string,
//       bank: String(ba.bankName || ""),
//       last4: String(ba.accountNumber || "").slice(-4),
//       ifsc: String(ba.ifscCode || "").toUpperCase(),
//       isDefault: !!ba.default,
//     };

//     setBankAccounts((prev) => {
//       const next = newAcc.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
//       return [...next, newAcc];
//     });

//     setShowBankForm(false);
//     setSetAsDefault(false);
//     setBankForm({
//       holder: "",
//       accNum: "",
//       confirmAccNum: "",
//       ifsc: "",
//       bankName: "",
//     });

//     showBankFormToast(
//       "Bank account added",
//       newAcc.isDefault ? "Saved and set as default." : "Saved successfully.",
//       "success"
//     );
//   } catch (err: any) {
//     showBankFormToast("Add failed", err?.message || "Could not add bank account.", "error");
//   }
// };
// const getAuthToken = () =>
//   localStorage.getItem("auth_token") ||
//   sessionStorage.getItem("auth_token") ||
//   localStorage.getItem("token") ||
//   sessionStorage.getItem("token") ||
//   "";

// const fetchBankAccounts = async (): Promise<void> => {
//   const token = getAuthToken();
//   const headers: Record<string, string> = {};
//   if (token) headers.Authorization = `Bearer ${token}`;

//   console.groupCollapsed("%c[BankList] Fetch → GET /api/bankaccount", "color:#60a5fa;font-weight:700;");
//   console.log("[BankList] URL:", BANK_LIST_URL);
//   console.log("[BankList] Auth header present:", Boolean(token));

//   try {
//     const res = await fetch(BANK_LIST_URL, {
//       method: "GET",
//       headers,
//       credentials: "include",
//     });

//     console.log("[BankList] HTTP:", res.status, res.statusText);
//     console.log("[BankList] Resp content-type:", res.headers.get("content-type"));

//     const raw = await res.text();
//     console.log("[BankList] Raw body:", raw);

//     let data: any = {};
//     try {
//       data = JSON.parse(raw);
//     } catch (e) {
//       console.warn("[BankList] JSON parse failed, using raw text:", e);
//     }

//     console.log("[BankList] Parsed JSON:", data);

//     if (!res.ok) {
//       const code = data?.error || `http_${res.status}`;
//       console.error("[BankList] Error code:", code);
//       throw new Error(code);
//     }

//     // Map API → UI model
//     const mapped = (Array.isArray(data?.accounts) ? data.accounts : []).map((ba: any) => ({
//       id: ba._id as string,
//       bank: String(ba.bankName || ""),
//       last4: String(ba.accountNumber || "").slice(-4),
//       ifsc: String(ba.ifscCode || "").toUpperCase(),
//       isDefault: !!ba.default,
//     })) as BankAccount[];

//     console.log("[BankList] Mapped list:", mapped);
//     console.log("[BankList] Count:", mapped.length);

//     setBankAccounts(mapped);
//     localStorage.setItem("tokun_bank_accounts", JSON.stringify(mapped));

//     console.log("%c[BankList] ✅ SUCCESS", "color:#22c55e;font-weight:700;");
//   } catch (err: any) {
//     console.error("[BankList] ❌ FAILED:", err?.message || err);

//     // fallback to cache
//     try {
//       const cached = localStorage.getItem("tokun_bank_accounts");
//       if (cached) {
//         const parsed = JSON.parse(cached);
//         console.log("[BankList] Using cached:", parsed);
//         setBankAccounts(parsed);
//       }
//     } catch {}
//   } finally {
//     console.groupEnd();
//   }
// };
// useEffect(() => {
//     if (profileOpen && profileTab === "bank") {
//       fetchBankAccounts();
//     }
//   }, [profileOpen, profileTab]); 


// useEffect(() => {
//   if (cartOpen) fetchCart();
// }, [cartOpen, fetchCart]);







// const setDefaultBankAccount = async (accountId: string): Promise<void> => {
//   const token =
//     localStorage.getItem("auth_token") ||
//     sessionStorage.getItem("auth_token") ||
//     localStorage.getItem("token") ||
//     sessionStorage.getItem("token") ||
//     "";

//   const headers: Record<string, string> = { "Content-Type": "application/json" };
//   if (token) headers.Authorization = `Bearer ${token}`;

//   const url = bankSetDefaultUrl(accountId);

//   console.groupCollapsed("%c[BankSetDefault] POST → /api/bankaccount/set-default/:id", "color:#f59e0b;font-weight:700;");
//   console.log("[BankSetDefault] URL:", url);
//   console.log("[BankSetDefault] Headers:", { ...headers, Authorization: headers.Authorization ? "Bearer <present>" : "—" });

//   try {
//     const res = await fetch(url, {
//       method: "POST",
//       headers,
//       credentials: "include",
//     });

//     console.log("[BankSetDefault] HTTP:", res.status, res.statusText);
//     console.log("[BankSetDefault] Resp content-type:", res.headers.get("content-type"));

//     const raw = await res.text();
//     console.log("[BankSetDefault] Raw body:", raw);

//     let data: any = {};
//     try { data = JSON.parse(raw); } catch (e) {
//       console.warn("[BankSetDefault] JSON parse failed, using raw text:", e);
//     }
//     console.log("[BankSetDefault] Parsed JSON:", data);

//     if (!res.ok) {
//       const code = data?.error || `http_${res.status}`;
//       console.error("[BankSetDefault] Error code:", code);
//       throw new Error(code);
//     }

//     const newDefaultId = data?.defaultAccount?._id as string | undefined;
//     console.log("[BankSetDefault] New default id:", newDefaultId);

//     // Update UI: mark the returned one as default
//     if (newDefaultId) {
//       setBankAccounts(prev => prev.map(a => ({ ...a, isDefault: a.id === newDefaultId })));
//     }

//     console.log("%c[BankSetDefault] ✅ SUCCESS", "color:#22c55e;font-weight:700;");
//     toast({ title: "Default bank updated", description: "This account is now default." });
//   } catch (err: any) {
//     console.error("[BankSetDefault] ❌ FAILED:", err?.message || err);
//     toast({ title: "Failed to set default", description: err?.message || "Try again." });
//   } finally {
//     console.groupEnd();
//   }
// };








// // Delete account
// const deleteAccount = (id: string) => {
//   setBankAccounts((prev) => {
//     const next = prev.filter((a) => a.id !== id);
//     // ensure 1 default remains if any accounts left
//     if (next.length && !next.some((a) => a.isDefault)) next[0].isDefault = true;
//     return [...next];
//   });
// };

// // Set default
// const makeDefault = (id: string) => {
//   setDefaultBankAccount(id);
// };




// // hydrate from localStorage on mount
// useEffect(() => {
//   const rawAcc = localStorage.getItem("tokun_bank_accounts");
//   if (rawAcc) { try { setBankAccounts(JSON.parse(rawAcc)); } catch {} }

//   const rawTx = localStorage.getItem("tokun_bank_txns");
//   if (rawTx) { try { setTransactions(JSON.parse(rawTx)); } catch {} }
// }, []);

// // persist on change
// useEffect(() => {
//   localStorage.setItem("tokun_bank_accounts", JSON.stringify(bankAccounts));
// }, [bankAccounts]);

// useEffect(() => {
//   localStorage.setItem("tokun_bank_txns", JSON.stringify(transactions));
// }, [transactions]);




// type NotificationItem = {
//   id: string;
//   name: string;
//   preview: string;
//   time: string; // e.g. "18 min"
//   read: boolean;
// };

// const [notifs, setNotifs] = useState<NotificationItem[]>([
//   { id: "1", name: "Firoz Ansari", preview: "High-fived your workout", time: "18 min", read: false },
//   { id: "2", name: "Laxmi Patil",  preview: "High-fived your workout", time: "18 min", read: false },
//   { id: "3", name: "Nirmal Joshi", preview: "High-fived your workout", time: "18 min", read: true  },
//   { id: "4", name: "Amit Shah",   preview: "High-fived your workout", time: "18 min", read: true  },
// ]);
// const unreadCount = useMemo(() => notifs.filter(n => !n.read).length, [notifs]);

// const goToNotifications = () => navigate("/notifications");
// const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));


// // const { token } = useAuth();

// // const handleCheckout = async () => {
// //   if (!token) {
// //     console.error("[Checkout] ❌ No auth token found");
// //     toast({
// //       title: "Unauthorized",
// //       description: "Please login first.",
// //       // //     });
// //     return;
// //   }

// //   const headers: Record<string, string> = {
// //     "Content-Type": "application/json",
// //     Authorization: `Bearer ${token}`,
// //   };

// //   const CHECKOUT_URL = `${API_BASE}/api/cart/checkout`;
// //   const VERIFY_URL = `${API_BASE}/api/cart/verify`;

// //   try {
// //     // --- Step 1: Create checkout order ---
// //     console.groupCollapsed(
// //       "%c[Checkout] POST → /api/cart/checkout",
// //       "color:#60a5fa;font-weight:700;"
// //     );

// //     const res = await fetch(CHECKOUT_URL, {
// //       method: "POST",
// //       headers,
// //       credentials: "include",
// //     });

// //     console.log("[Checkout] HTTP:", res.status, res.statusText);
// //     const rawCheckout = await res.text();
// //     console.log("[Checkout] Raw body:", rawCheckout);

// //     let checkoutData: any = {};
// //     try {
// //       checkoutData = JSON.parse(rawCheckout);
// //     } catch (e) {}

// //     if (!res.ok || !checkoutData.success) {
// //       throw new Error(checkoutData?.error || `http_${res.status}`);
// //     }

// //     const { order, prompts } = checkoutData;
// //     console.log(
// //       "%c[Checkout] ✅ Success",
// //       "color:#22c55e;font-weight:700;",
// //       { order, prompts }
// //     );
// //     console.groupEnd();

// //     // --- Step 2: Handle free prompts (no Razorpay needed) ---
// //     if (!order) {
// //       console.log("[Checkout] No paid prompts → directly calling verify");

// //       const verifyRes = await fetch(VERIFY_URL, {
// //         method: "POST",
// //         headers,
// //         body: JSON.stringify({
// //           razorpayPaymentId: null,
// //           razorpayOrderId: null,
// //           razorpaySignature: null,
// //           pricePaid: 0,
// //         }),
// //         credentials: "include",
// //       });

// //       const rawVerify = await verifyRes.text();
// //       console.log("[Verify] Raw body:", rawVerify);

// //       let verifyData: any = {};
// //       try {
// //         verifyData = JSON.parse(rawVerify);
// //       } catch {}

// //       if (!verifyRes.ok || !verifyData.success) {
// //         throw new Error(verifyData?.error || `http_${verifyRes.status}`);
// //       }

// //       toast({
// //         title: "Checkout complete",
// //         description: "Free prompts added to purchases.",
// //       });
// //       return;
// //     }

// //     // --- Step 3: Open Razorpay popup ---
// //     const options: any = {
// //       key: import.meta.env.VITE_RAZORPAY_KEY_ID,
// //       amount: order.amount,
// //       currency: order.currency,
// //       name: "Tokun.world",
// //       description: "Prompt Checkout",
// //       order_id: order.id,
// //       handler: async (response: any) => {
// //         console.log("[Razorpay] Payment success:", response);

// //         // --- Step 4: Verify payment ---
// //         const verifyRes = await fetch(VERIFY_URL, {
// //           method: "POST",
// //           headers,
// //           body: JSON.stringify({
// //             razorpayPaymentId: response.razorpay_payment_id,
// //             razorpayOrderId: response.razorpay_order_id,
// //             razorpaySignature: response.razorpay_signature,
// //             pricePaid: order.amount / 100,
// //           }),
// //           credentials: "include",
// //         });

// //         const rawVerify = await verifyRes.text();
// //         console.log("[Verify] Raw body:", rawVerify);

// //         let verifyData: any = {};
// //         try {
// //           verifyData = JSON.parse(rawVerify);
// //         } catch {}

// //         if (!verifyRes.ok || !verifyData.success) {
// //           throw new Error(verifyData?.error || `http_${verifyRes.status}`);
// //         }

// //         console.log(
// //           "%c[Verify] ✅ Success",
// //           "color:#22c55e;font-weight:700;",
// //           verifyData
// //         );
// //         toast({
// //           title: "Checkout complete",
// //           description: "Your prompts are now available.",
// //         });
// //       },
// //       theme: { color: "#1A73E8" },
// //     };

// //     const razorpayInstance = new (window as any).Razorpay(options);
// //     razorpayInstance.open();
// //   } catch (err: any) {
// //     console.error("[Checkout] ❌ FAILED:", err?.message || err);
// //     toast({
// //       title: "Checkout failed",
// //       description: err?.message || "Something went wrong.",
// //       // //     });
// //     console.groupEnd();
// //   }
// // };




// const doCheckout = async () => {
//   if (!token) {
//     console.error("[Checkout] ❌ No auth token found");
//     toast({
//       title: "Unauthorized",
//       description: "Please login first.",
//       //     });
//     return;
//   }

//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   };

//   const CHECKOUT_URL = `${API_BASE}/api/cart/checkout`;
//   const VERIFY_URL = `${API_BASE}/api/cart/verify`;

//   try {
//     console.groupCollapsed(
//       "%c[Checkout] POST → /api/cart/checkout",
//       "color:#60a5fa;font-weight:700;"
//     );

//     const res = await fetch(CHECKOUT_URL, {
//       method: "POST",
//       headers,
//       credentials: "include",
//     });

//     console.log("[Checkout] HTTP:", res.status, res.statusText);
//     const rawCheckout = await res.text();
//     console.log("[Checkout] Raw body:", rawCheckout);

//     let checkoutData: any = {};
//     try {
//       checkoutData = JSON.parse(rawCheckout);
//     } catch (e) {}

//     if (!res.ok || !checkoutData.success) {
//       throw new Error(checkoutData?.error || `http_${res.status}`);
//     }

//     const { order, prompts } = checkoutData;
//     console.log(
//       "%c[Checkout] ✅ Success",
//       "color:#22c55e;font-weight:700;",
//       { order, prompts }
//     );
//     console.groupEnd();

//     if (!order) {
//       console.log("[Checkout] No paid prompts → directly calling verify");

//       const verifyRes = await fetch(VERIFY_URL, {
//         method: "POST",
//         headers,
//         body: JSON.stringify({
//           razorpayPaymentId: null,
//           razorpayOrderId: null,
//           razorpaySignature: null,
//           pricePaid: 0,
//         }),
//         credentials: "include",
//       });

//       const rawVerify = await verifyRes.text();
//       console.log("[Verify] Raw body:", rawVerify);

//       let verifyData: any = {};
//       try {
//         verifyData = JSON.parse(rawVerify);
//       } catch {}

//       if (!verifyRes.ok || !verifyData.success) {
//         throw new Error(verifyData?.error || `http_${verifyRes.status}`);
//       }

//       toast({
//         title: "Checkout complete",
//         description: "Free prompts added to purchases.",
//       });
//       return;
//     }

//     const options: any = {
//       key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//       amount: order.amount,
//       currency: order.currency,
//       name: "Tokun.world",
//       description: "Prompt Checkout",
//       order_id: order.id,
//       handler: async (response: any) => {
//         console.log("[Razorpay] Payment success:", response);

//         const verifyRes = await fetch(VERIFY_URL, {
//           method: "POST",
//           headers,
//           body: JSON.stringify({
//             razorpayPaymentId: response.razorpay_payment_id,
//             razorpayOrderId: response.razorpay_order_id,
//             razorpaySignature: response.razorpay_signature,
//             pricePaid: order.amount / 100,
//           }),
//           credentials: "include",
//         });

//         const rawVerify = await verifyRes.text();
//         console.log("[Verify] Raw body:", rawVerify);

//         let verifyData: any = {};
//         try {
//           verifyData = JSON.parse(rawVerify);
//         } catch {}

//         if (!verifyRes.ok || !verifyData.success) {
//           throw new Error(verifyData?.error || `http_${verifyRes.status}`);
//         }

//         console.log(
//           "%c[Verify] ✅ Success",
//           "color:#22c55e;font-weight:700;",
//           verifyData
//         );
//         toast({
//   title: "Checkout complete",
//   description: "Your prompts are now available.",
// });
// // ✅ Cart refresh karo
// fetchCart();
//       },
//       theme: { color: "#1A73E8" },
//     };

//     const razorpayInstance = new (window as any).Razorpay(options);
//     razorpayInstance.open();
//   } catch (err: any) {
//     console.error("[Checkout] ❌ FAILED:", err?.message || err);
//     toast({
//       title: "Checkout failed",
//       description: err?.message || "Something went wrong.",
//       //     });
//     console.groupEnd();
//   }
// };


// const handleCheckout = async () => {
//   if (!token) {
//     toast({
//       title: "Please log in",
//       description: "You must be logged in to checkout.",
//       //     });
//     navigate("/login");
//     return;
//   }

//   // ✅ Cart pehle band karo — warna KYC modal uske neeche dab jaata hai
//   setCartOpen(false);

//   // Thoda wait karo taaki cart close animation complete ho
//   await new Promise((res) => setTimeout(res, 150));

//   const ok = await ensureKycVerified();
//   if (!ok) {
//     setPendingCheckout(true);
//     return;
//   }

//   await doCheckout();
// };

// const [notifications, setNotifications] = useState<any[]>([]);
// const [realUnreadCount, setRealUnreadCount] = useState(0);

// // const fetchNotifications = async () => {
// //   if (!token) return;
// //   try {
// //     const res = await fetch(`${API_BASE}/api/prompt-collab/notifications`, {
// //       headers: { Authorization: `Bearer ${token}` },
// //     });
// //     const data = await res.json();
// //     if (data?.success) {
// //       setNotifications(data.notifications);
// //       setRealUnreadCount(data.notifications.filter((n: any) => !n.read).length);
// //     }
// //   } catch (err) {
// //     console.error("❌ Error fetching notifications:", err);
// //   }
// // };

// const fetchNotifications = async () => {
//   if (!token) return;

//   try {
//     const res = await fetch(`${API_BASE}/api/prompt-collab/notifications`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     const data = await res.json();

//     if (data?.success) {
//       const prevUnread = realUnreadCount;
//       const nextUnread = data.notifications.filter((n: any) => !n.read).length;

//       setNotifications(data.notifications);
//       setRealUnreadCount(nextUnread);

//       // 🔔 SHOW HEADER TOAST ON NEW NOTIFICATION
//       if (nextUnread > prevUnread) {
//         const latest = data.notifications.find((n: any) => !n.read);

//         // if (latest) {
//         //   setHeaderToast({
//         //     title: latest.promptId?.title || "New notification",
//         //     message: latest.message || "You have a new update",
//         //   });

//         //   // auto hide after 5s
//         //   if (toastTimerRef.current) {
//         //     clearTimeout(toastTimerRef.current);
//         //   }

//         //   toastTimerRef.current = window.setTimeout(() => {
//         //     setHeaderToast(null);
//         //   }, 5000);
//         // }
//       }
//     }
//   } catch (err) {
//     console.error("❌ Error fetching notifications:", err);
//   }
// };


// const markAllAsRead = async () => {
//   // ✅ Optimistic update — turant 0 dikhao
//   setRealUnreadCount(0);
//   setNotifications(prev => prev.map(n => ({ ...n, read: true })));

//   const unread = notifications.filter((n) => !n.read);
//   await Promise.all(
//     unread.map((n) =>
//       fetch(`${API_BASE}/api/prompt-collab/notifications/read/${n._id}`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//       })
//     )
//   );
//   // Optional: refresh from server
//   fetchNotifications();
// };

// useEffect(() => {
//   fetchNotifications();
//   const interval = setInterval(fetchNotifications, 60000);
//   return () => clearInterval(interval);
// }, [token]);

// // Header.tsx me existing useEffect ke andar add karo

// useEffect(() => {
//   if (location.pathname === "/chat") {
//     setUnreadChats(0);
//     setStoredChatBadge(0);
//   } else {
//     setUnreadChats(getStoredChatBadge());
//   }
// }, [location.pathname]);

// useEffect(() => {
//   const myId = user?._id || user?.id;

//   const handleIncomingMessage = (msg: any) => {
//     if (!msg) return;

//     // apne khud ke bheje hue messages count mat karo
//     if (String(msg.sender) === String(myId)) return;

//     // agar user chat page par hai to badge 0 hi rahe
//     if (location.pathname === "/chat") {
//       setUnreadChats(0);
//       setStoredChatBadge(0);
//       return;
//     }

//     setUnreadChats((prev) => {
//       const next = prev + 1;
//       setStoredChatBadge(next);
//       return next;
//     });
//   };

//   const handleChatRead = () => {
//     setUnreadChats(0);
//     setStoredChatBadge(0);
//   };

//   socket.on("new-message", handleIncomingMessage);
//   window.addEventListener("chat-read", handleChatRead);

//   return () => {
//     socket.off("new-message", handleIncomingMessage);
//     window.removeEventListener("chat-read", handleChatRead);
//   };
// }, [location.pathname, user?._id, user?.id]);

//   return (
//     <>
    
// <header
//   className={`fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-300 ${
//     hideHeader ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
//   }`}
// >
//   <div className="pointer-events-auto w-[92%] max-w-[1180px] mt-2 rounded-2xl backdrop-blur-md bg-transparent text-white px-2 sm:px-3 md:px-4 py-1.5 flex items-center justify-between">
  
//         {/* Brand */}
        
//         {/* Brand */}
//  <button
//     type="button"
//     onClick={handleBrandClick}
//     className="flex items-center gap-2 sm:gap-3 min-w-0 group shrink-0"
//     aria-label="Go to home"
//   >
//    <img
//   src="/icons/Tokun.png"
//   alt="Tokun.world Logo"
//   className="
//     h-12
//     sm:h-14
//     md:h-16
//     lg:h-20
//     xl:h-24
//     w-auto
//     max-w-none
//     object-contain
//     transition-transform duration-200
//     group-hover:scale-105
//   "
// />
//   </button>







        

//         {/* Actions (Get Pro removed) */}
//          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-nowrap shrink-0">
      
//   {/* 🔔 HEADER TOAST */}
//   {/* 🔔 HEADER TOAST */}
// <div className="relative flex items-center">
//   {headerToast && (
//     <div
//       className="
//         absolute right-full top-1/2 -translate-y-1/2
//         mr-1
//         z-[2000]
//         w-[136px] sm:w-[260px]
//         max-w-[136px] sm:max-w-[260px]
//         rounded-md sm:rounded-xl
//         border border-white/10
//         bg-[#1C1C1C]
//         shadow-[0_8px_24px_rgba(0,0,0,0.55)]
//         animate-in slide-in-from-right-4 fade-in-0
//         overflow-hidden
//       "
//     >
//       <div className="px-2 py-1.5 sm:p-3">
//         <div className="text-[10px] sm:text-sm font-semibold text-white truncate leading-none">
//           {headerToast.title}
//         </div>
//         <div className="text-[9px] sm:text-xs text-white/70 mt-0.5 line-clamp-1 sm:line-clamp-2 leading-tight">
//           {headerToast.message}
//         </div>
//       </div>

//       <div className="h-[1.5px] sm:h-[3px] w-full bg-white/10">
//         <div
//           className="h-full bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
//           style={{ animation: "toastProgress 5s linear forwards" }}
//         />
//       </div>
//     </div>
//   )}

//   <button
//     type="button"
//     onClick={goToSaved}
//     className="relative flex items-center justify-center rounded-md p-2 hover:bg-white/10 transition"
//     title="Saved"
//   >
//     <img src="/icons/cop.png" alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
//   </button>
// </div>


//  {/* CHAT */}
//     <button
//   onClick={handleChatClick}
//   className="relative p-2 rounded-full hover:bg-white/10 transition"
// >
//       <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />

//       {unreadChats > 0 && (
//         <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 grid place-items-center rounded-full">
//           {unreadChats}
//         </span>
//       )}
//     </button>


              

//         {/* 🔔 Notifications */}
// <DropdownMenu>
//   <DropdownMenuTrigger asChild>
//         <button
//           type="button"
//           aria-label="Notifications"
//           className="relative p-2 rounded-full hover:bg-white/10 transition"
//         >
//           <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />

//           {realUnreadCount > 0 && (
//             <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 grid place-items-center rounded-full">
//               {realUnreadCount > 9 ? "9+" : realUnreadCount}
//             </span>
//           )}
//         </button>
//       </DropdownMenuTrigger>

//   <DropdownMenuContent
//     side="bottom"
//     align="start"
//     sideOffset={10}
//     className="no-scrollbar overflow-y-auto p-2"
//     style={{
//       width: 320,
//       maxHeight: "70vh",
//       borderRadius: 12,
//       background: "#1C1C1C",
//       border: "1px solid rgba(255,255,255,0.10)",
//       color: "#fff",
//       fontFamily: "Inter, system-ui, Arial, sans-serif",
//       fontSize: 14,
//     }}
//   >
//     <div className="flex items-center justify-between px-2 py-2">
//       <span className="font-semibold text-base">Notifications</span>
//       {realUnreadCount > 0 && (
//         <button
//           type="button"
//           className="text-xs text-white/70 hover:text-white"
//           onClick={markAllAsRead}
//         >
//           Mark all as Read
//         </button>
//       )}
//     </div>

//     {/* Notifications List */}
//     <div className="divide-y divide-white/10">
//       {notifications.length === 0 ? (
//         <div className="text-center text-white/50 py-8">No notifications yet</div>
//       ) : (
//         notifications.slice(0, 7).map((n) => (
//           <button
//             key={n._id}
//             onClick={() => navigate("/notifications")}
//             className="w-full flex items-start gap-3 px-3 py-3 rounded-md hover:bg-white/5 text-left"
//           >
//             <span
//               className={`mt-1 h-2 w-2 rounded-full ${
//                 !n.read ? "bg-blue-500" : "bg-transparent"
//               }`}
//             ></span>
//             <div className="min-w-0 flex-1">
//               <div className="text-sm font-medium truncate">
//                 {n.promptId?.title || "Prompt Notification"}
//               </div>
//               <div className="text-xs text-white/70 truncate">{n.message}</div>
//             </div>
//             <span className="ml-auto text-xs text-white/50 shrink-0">
//               {new Date(n.createdAt).toLocaleDateString("en-IN", {
//                 day: "2-digit",
//                 month: "short",
//               })}
//             </span>
//           </button>
//         ))
//       )}
//     </div>

//     {/* Footer */}
//     {notifications.length > 0 && (
//       <div className="border-t border-white/10 mt-2 pt-2">
//         <button
//           className="w-full text-center px-3 py-2 rounded-md hover:bg-white/5"
//           onClick={() => navigate("/notifications")}
//         >
//           See all notifications
//         </button>
//       </div>
//     )}
//   </DropdownMenuContent>
// </DropdownMenu>





//   {/* CART */}
//     <button
//       type="button"
//       onClick={() => setCartOpen(true)}
//       className="relative p-2 rounded-full hover:bg-white/10 transition"
//     >
//       <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />

//       {cart.length > 0 && (
//         <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 grid place-items-center rounded-full">
//           {cart.length}
//         </span>
//       )}
//     </button>




//           {/* Upload Prompt (force one line) */}
//           <button
//       type="button"
//       onClick={handlePostPrompt}
//       className="hidden sm:inline-flex items-center gap-2 px-3 h-9 rounded-full text-black font-medium whitespace-nowrap"
//       style={{ background: "#D9D9D9" }}
//     >
//       <span className="grid place-items-center w-5 h-5 rounded-full bg-black">
//         <Plus className="w-3 h-3 text-white" strokeWidth={2.5} />
//       </span>

//       <span className="text-sm">Upload Prompt</span>
//     </button>
//     {/* MOBILE UPLOAD BUTTON */}
//     <button
//       onClick={handlePostPrompt}
//       className="sm:hidden grid place-items-center w-9 h-9 rounded-full"
//       style={{
//         background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)"
//       }}
//     >
//       <Plus className="w-4 h-4 text-white" />
//     </button>

//           {/* Profile dropdown */}




//            <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//   <button
//     type="button"
//     aria-label="Account menu"
//     title={fullName}
//     className="group inline-flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#2C2C2C] text-white whitespace-nowrap"
//   >

//     {/* NAME + PLAN → hidden on mobile */}
//     <div className="hidden sm:flex items-center gap-2">

//       {/* PRO PLAN */}
//       {user?.plan === "pro" && (
//         <>
//           <span className="truncate font-semibold bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] text-transparent bg-clip-text">
//             Hello, {fullName}
//           </span>

//           <LuBadgeCheck
//             className="w-[22px] h-[22px]"
//             style={{
//               stroke: "url(#proGradient)",
//               strokeWidth: 2,
//               fill: "none",
//             }}
//           />

//           <svg width="0" height="0">
//             <defs>
//               <linearGradient id="proGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//                 <stop offset="0%" stopColor="#FF14EF" />
//                 <stop offset="100%" stopColor="#1A73E8" />
//               </linearGradient>
//             </defs>
//           </svg>
//         </>
//       )}

//       {/* ENTERPRISE PLAN */}
//       {user?.plan === "enterprise" && (
//         <>
//           <span className="truncate font-semibold bg-gradient-to-r from-[#FACC15] to-[#CA8A04] text-transparent bg-clip-text">
//             Hello, {fullName}
//           </span>

//           <LuBadgeCheck
//             className="w-[22px] h-[22px]"
//             style={{
//               stroke: "url(#enterpriseGradient)",
//               strokeWidth: 2,
//               fill: "none",
//             }}
//           />

//           <svg width="0" height="0">
//             <defs>
//               <linearGradient id="enterpriseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//                 <stop offset="0%" stopColor="#FACC15" />
//                 <stop offset="100%" stopColor="#CA8A04" />
//               </linearGradient>
//             </defs>
//           </svg>
//         </>
//       )}

//       {/* FREE PLAN */}
//       {(!user?.plan || user?.plan === "free") && (
//         <>
//           <span className="truncate font-semibold text-white">
//             Hello, {fullName}
//           </span>

//           <span className="px-2 py-0.5 text-xs rounded-md bg-gray-700 text-gray-300">
//             FREE
//           </span>
//         </>
//       )}

//     </div>

//     {/* DROPDOWN ICON → always visible */}
//     <span className="shrink-0 grid place-items-center rounded-full bg-white/95 w-6 h-6">
//       <ChevronDown className="w-3.5 h-3.5 text-black" />
//     </span>

//   </button>
// </DropdownMenuTrigger>

//   {/* Make the WHOLE content scrollable (scrollbar hidden) */}
//   <DropdownMenuContent
//     sideOffset={10}
//     align="end"
//     onCloseAutoFocus={(e) => e.preventDefault()}
//     className="p-3 no-scrollbar overflow-y-auto"
//     style={{
//       width: 260,
//       maxHeight: "85vh",
//       borderRadius: 20,
//       background: "#21212180",
//       backdropFilter: "blur(20px)",
//       WebkitBackdropFilter: "blur(20px)",
//       border: "1px solid rgba(255,255,255,0.10)",
//       color: "#ffffff",
//       fontFamily: "Inter, system-ui, Arial, sans-serif",
//       fontSize: 14,
//     }}
//   >
//     <div className="flex flex-col gap-3">
//       {/* Name / email */}
//      <div className="pt-2 space-y-2">
//   {/* ✅ CLICKABLE NAME */}
//   <button
//     type="button"
//     onMouseDown={(e) => {
//       e.preventDefault();
//       e.stopPropagation();
//       if (!user?._id) return;
//       navigate(`/profile/${user._id}`);
//     }}
//     className="font-semibold text-left hover:underline hover:text-white transition"
//   >
//     {displayName || "Your Name"}
//   </button>

//   {/* EMAIL (unchanged) */}
//   <div className="text-white/70 text-sm">
//     {displayEmail || "your@email.com"}
//   </div>

//   {/* ✅ SET UP PROFILE (UNCHANGED & PRESERVED) */}
//   <button
//     type="button"
//     onMouseDown={(e) => {
//       e.preventDefault();
//       e.stopPropagation();
//       setProfileOpen(true);
//     }}
//     onClick={(e) => {
//       e.preventDefault();
//       e.stopPropagation();
//     }}
//     className="w-full mt-2 text-white"
//     style={{ height: 40, borderRadius: 12, background: "#313131" }}
//   >
//     Set up profile
//   </button>
// </div>


//       {/* Theme row */}
//       <div className="flex items-center justify-between pt-2">
//         <span>Theme</span>
//         <div
//           className="flex items-center justify-between px-2"
//           style={{ width: 96, height: 36, borderRadius: 18, background: "#313131" }}
//         >
//           {themeBtn("light", "https://cdn.jsdelivr.net/npm/@tabler/icons/icons/sun.svg", "Light")}
//           {themeBtn("dark", "https://cdn.jsdelivr.net/npm/@tabler/icons/icons/moon.svg", "Dark")}
//           {themeBtn("system", "https://cdn.jsdelivr.net/npm/@tabler/icons/icons/device-desktop.svg", "System")}
//         </div>
//       </div>

//       {/* Settings */}
//       <div
//         className="py-2 flex items-center gap-2 border-t border-white/10 cursor-pointer"
//         onClick={() => navigate("/settings")}
//       >
//         <Settings className="w-5 h-5" />
//         <span>Settings</span>
//       </div>

//       {/* Lifetime Tokun saved */}
//       <div
//         style={{
//           width: 220,
//           height: 120,
//           background: "#2A2A2A",
//           borderRadius: 16,
//           padding: "10px 0",
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <div className="text-sm text-white/85">Lifetime Tokun saved</div>
//         <div
//           style={{
//             width: 60,
//             height: 60,
//             borderRadius: "50%",
//             background:
//               "conic-gradient(#FF14EF 0 60deg, #1A73E8 60deg 210deg, #5CE1E6 210deg 360deg)",
//             display: "grid",
//             placeItems: "center",
//           }}
//         >
//           <div
//             style={{
//               width: 40,
//               height: 40,
//               borderRadius: "50%",
//               background: "#2A2A2A",
//               display: "grid",
//               placeItems: "center",
//               color: "#fff",
//               fontWeight: 600,
//               fontSize: "12px",
//             }}
//           >
//             {lifetimeTokunSaved}
//           </div>
//         </div>
//         <div className="text-xs text-white/70">Total tokun saved</div>
//       </div>

//       {/* Links — no inner scrolling; they’re part of the main scroll now */}
//       <div className="grid gap-2 pt-2">
//         {[
//           { label: "Purchase History", onClick: goToPurchaseHistory, icon: "↗" },
//           { label: "Upload History", onClick: goToUploadHistory, icon: "↗" },
//           { label: "Pricing", onClick: () => navigate("/subscription"), icon: "↗" },
//           { label: "Support", onClick: () => navigate("/support"), icon: "↗" },
//           { label: "Admin", onClick: () => navigate("/admin"), icon: "↗" },
//           { label: "Logout", onClick: handleLogout, icon: "↩" },
//         ].map((item, i) => (
//           <button
//             key={item.label}
//             onClick={item.onClick}
//             className={`w-full flex items-center justify-between py-2 whitespace-nowrap ${
//               i !== 0 ? "border-t border-white/10" : ""
//             }`}
//           >
//             <span>{item.label}</span>
//             <span aria-hidden className="pl-3">{item.icon}</span>
//           </button>
//         ))}
//       </div>

//       {/* Footer */}
//       <div className="border-t border-white/10 flex items-center justify-between pt-2 text-xs text-gray-400">
//         <span>Privacy</span>
//         <span>Terms</span>
//         <span>Copyright</span>
//       </div>
//     </div>
//   </DropdownMenuContent>
// </DropdownMenu>

//         </div>
      

//       {/* Modals */}
//       <ApiKeyModal open={apiKeyModalOpen} onOpenChange={setApiKeyModalOpen} onSave={() => {}} />
//       <SubscriptionModal open={subscriptionModalOpen} onOpenChange={setSubscriptionModalOpen} />
//       <SellPromptModal open={sellOpen} onOpenChange={setSellOpen} onPromptSubmitted={() => {}} />

//       {/* hide scrollbars utility (scoped) */}
//         <style>{`
//   .no-scrollbar::-webkit-scrollbar { display: none; }
//   .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

//   /* Save & Continue default + hover gradient */
//   .btn-gradient-hover { background:#333335; }
//   .btn-gradient-hover:hover { background:linear-gradient(270deg,#FF14EF 0%, #1A73E8 100%); }
// `}</style>

 

// {cartOpen && (
//   <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1100] grid place-items-center">
//     {/* Backdrop */}
//     <div
//       className="absolute inset-0 bg-black/70 backdrop-blur-sm"
//       onClick={() => setCartOpen(false)}
//     />

//     {/* Cart container */}
//    <div
//   className="relative text-white shadow-2xl flex flex-col overflow-hidden"
//   style={{
//     width: "min(95vw, 950px)",
//     height: "min(90vh, 750px)",
//     background: "#17171A",
//     borderRadius: 16,
//     fontFamily: "Inter",
//   }}
// >
//       {/* Close Button */}
//       <button
//         aria-label="Close"
//         onClick={() => setCartOpen(false)}
//         className="absolute right-4 top-4 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8 z-10"
//       >
//         <X className="w-4 h-4 text-white/90" />
//       </button>

//       {/* Header */}
//       <div className="p-6 pb-4 flex-shrink-0">
//         <h2 style={{ fontFamily: "Inter", fontWeight: 500, fontSize: "20px" }}>
//           Your Prompt Cart ({cart.length} Items)
//         </h2>
//       </div>

//       {/* Table header */}
//       {/* <div
//         className="grid grid-cols-[1fr_150px_100px] items-center px-6 text-white/80 text-sm"
//         style={{
//           background: "#1C1C1C",
//           height: 50,
//           borderRadius: 8,
//           margin: "0 auto",
//           width: "95%",
//         }}
//       >
//         <span>Prompt</span>
//         <span className="text-right">Price</span>
//         <span className="text-right">Remove</span>
//       </div> */}

//      {/* Cart Body */}
// <div className="min-h-0 flex-1 overflow-y-auto px-6 pr-4 pb-2 space-y-4">
//   {cart.length === 0 ? (
//     // ---------- EMPTY CART ----------
//     <div className="flex flex-col items-center justify-center text-center py-20 space-y-6">
//       {/* White cart icon */}
//      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />

//       {/* Texts */}
//       <div className="space-y-2">
//         <p className="text-white text-lg font-medium">Your cart is empty!</p>
//         <p className="text-white text-sm">Add items to it now.</p>
//       </div>

//       {/* CTA Button */}
//       <button
//         type="button"
//         onClick={() => {
//           setCartOpen(false); // close modal
//           navigate("/prompt-marketplace"); // go to marketplace
//         }}
//         className="px-6 py-3 rounded-lg text-white text-sm font-medium"
//         style={{
//           background: "linear-gradient(270deg,#FF14EF 0%, #1A73E8 100%)",
//         }}
//       >
//         Shop prompt now
//       </button>
//     </div>
//   ) : (
//     <>
//       {/* ---------- TABLE HEADER (only shows when cart has items) ---------- */}
//       <div
//         className="grid grid-cols-[1fr_150px_100px] items-center px-6 text-white/80 text-sm"
//         style={{
//           background: "#1C1C1C",
//           height: 50,
//           borderRadius: 8,
//           margin: "0 auto",
//           width: "95%",
//         }}
//       >
//         <span>Prompt</span>
//         <span className="text-right">Price</span>
//         <span className="text-right">Remove</span>
//       </div>

//       {/* ---------- ITEMS ---------- */}
//       {cart
//         .filter((item) => item.price !== 0 && item.tag !== "Free")
//         .map((item) => (
//           <div
//             key={item.id}
//             className="grid grid-cols-[1fr_150px_100px] items-center py-4 gap-4"
//             style={{ background: "#17171A" }}
//           >
//             {/* Prompt info */}
//             <div className="flex items-center gap-4">
//            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-black shrink-0">
//   {item.videoUrl ? (
//     <>
//       <video
//   src={
//     item.videoUrl?.startsWith("http")
//       ? item.videoUrl
//       : `${(import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || ""}${item.videoUrl}`
//   }
//   className="w-full h-full object-cover"
//   muted
//   playsInline
//   preload="metadata"
// />
//       <div className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-none">
//         <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
//           <path d="M8 5v14l11-7z" />
//         </svg>
//       </div>
//     </>
//  ) : item.imageUrl ? (
//     <img
//       src={
//         item.imageUrl.startsWith("http")
//           ? item.imageUrl
//           : `${(import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || ""}${item.imageUrl}`
//       }
//       alt={item.title}
//       className="w-full h-full object-cover"
//       onError={(e) => {
//         (e.currentTarget as HTMLImageElement).style.display = "none";
//         const parent = (e.currentTarget as HTMLImageElement).parentElement;
//         if (parent) parent.innerHTML =
//           `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.4);font-size:10px;">No image</div>`;
//       }}
//     />
//   ) : (
//     <div className="w-full h-full flex items-center justify-center text-white/40 text-[10px]">
//       No media
//     </div>
//   )}
// </div>
//               <div>
//                 <p className="text-xs text-white/60">
//                   Create an engaging product description
//                 </p>
//                 <p className="text-base text-white font-medium">{item.title}</p>

//                 {/* Tag */}
//                 <div className="flex gap-2 mt-1">
//                   {item.exclusive ? (
//                     <span className="px-2 py-0.5 rounded-md bg-green-500/20 text-green-400 text-xs">
//                       One-time Purchase
//                     </span>
//                   ) : (
//                     <span className="px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-400 text-xs">
//                       Premium
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Price */}
//             <span className="text-right text-white text-base">
//               ₹{item.price}
//             </span>

//             {/* Remove */}
//             <div className="flex justify-center">
//               <button
//                 onClick={async () => {
//                   await removeFromCart(item.id);
//                 }}
//                 className="text-red-400 hover:text-red-500"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         ))}
//     </>
//   )}
// </div>


//       {/* Footer */}
//  {cart.length > 0 && (
//   <div className="flex-shrink-0 border-t border-black/10 p-6 space-y-3">
//     <div className="space-y-2 text-sm text-white">
//       <div className="flex justify-between">
//         <span>Subtotal</span>
//         <span>
//           ₹
//           {cart
//             .filter((i) => i.price !== 0)
//             .reduce((sum, i) => sum + (i.price || 0), 0)
//             .toFixed(2)}
//         </span>
//       </div>
//       <div className="flex justify-between">
//         <span>+ 5% Tokun fees</span>
//         <span>
//           ₹
//           {(
//             cart
//               .filter((i) => i.price !== 0)
//               .reduce((sum, i) => sum + (i.price || 0), 0) * 0.05
//           ).toFixed(2)}
//         </span>
//       </div>
//     </div>

//     <div className="mt-4 flex items-center justify-end gap-4">
//       <span className="text-sm text-white">Month (inclusive of GST)</span>
//       <button
//         onClick={handleCheckout}
//         className="px-6 h-12 rounded-lg text-white"
//         style={{
//           background: "linear-gradient(270deg,#FF14EF 0%, #1A73E8 100%)",
//           fontFamily: "Inter",
//           fontWeight: 400,
//         }}
//       >
//         Checkout
//       </button>
//     </div>
//   </div>
// )}
//     </div>
//   </div>

// )}

//   </div>

//     </header>

  

//       {profileOpen && (
//   <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] grid place-items-center">
//     {/* Backdrop */}
//     <div
//       className="absolute inset-0 bg-black/70 backdrop-blur-sm"
//       onClick={() => setProfileOpen(false)}
//     />

//     {/* Card */}
//     <div
//       className="relative w-[96vw] md:w-[min(96vw,900px)] max-h-[90vh] rounded-2xl text-white shadow-2xl overflow-hidden"
//       style={{ background: "#17171A", fontFamily: "Inter", fontWeight: 400, fontStyle: "normal" }}
//     >
//       {/* Close */}
//       <button
//         aria-label="Close"
//         onClick={() => setProfileOpen(false)}
//         className="absolute right-2 top-2 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8 z-10"
//       >
//         <X className="w-4 h-4 text-white/90" />
//       </button>

//       {/* Two-column layout */}
//      {/* Two-column layout */}
// <div className="flex flex-col md:grid md:grid-cols-[240px,1fr] max-h-[90vh] overflow-hidden">

//         {/* Left nav */}
//    {/* <aside
//   className="no-scrollbar overflow-y-auto"
//   style={{ background: "#17171A", borderRight: "1px solid #1C1C1C" }}
// >


//           {[
//             { id: "profile", label: "Profile", Icon: User },
//             { id: "bank", label: "Bank Account", Icon: Landmark },
//             { id: "invoices", label: "Invoices", Icon: FileText },
//             { id: "billing", label: "Billing information", Icon: CreditCard },
//           ].map((item) => {
//             const active = profileTab === (item.id as typeof profileTab);
//             return (
//               <button
//                 key={item.id}
//                 onClick={() => setProfileTab(item.id as typeof profileTab)}
//                 className="w-full flex items-center gap-3 px-5 py-4 text-left"
//                 style={{
//                   background: active ? "#242429" : "transparent",
//                   color: active ? "#ffffff" : "rgba(255,255,255,0.78)",
//                 }}
//               >
//                 <item.Icon className="w-5 h-5" />
//                 <span>{item.label}</span>
//               </button>
//             );
//           })}
//         </aside> */}


//         <aside
//   className="no-scrollbar overflow-x-auto md:overflow-y-auto md:pt-5 flex md:flex-col flex-row"
//   style={{ background: "#17171A", borderRight: "none", borderBottom: "1px solid #1C1C1C" }}
// >
//   {[ 
//     { id: "profile", label: "Profile", Icon: User },
//     { id: "bank", label: "Bank Account", Icon: Landmark },
//     // { id: "invoices", label: "Invoices", Icon: FileText },
//     { id: "billing", label: "Billing information", Icon: CreditCard },
//   ].map((item) => {
//     const active = profileTab === (item.id as typeof profileTab);
//     return (
//       <button
//         key={item.id}
//         onClick={() => setProfileTab(item.id as typeof profileTab)}
//       className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-4 text-left whitespace-nowrap md:w-full shrink-0"
// style={{
//   background: active ? "#1C1C1C" : "transparent",
//   color: active ? "#ffffff" : "rgba(255,255,255,0.78)",
//   borderBottom: active ? "2px solid #FF14EF" : "2px solid transparent",
// }}
//       >
//         <item.Icon className="w-5 h-5" />
//         <span>{item.label}</span>
//       </button>
//     );
//   })}
// </aside>


//         {/* Right content */}
//        <section
//   className="no-scrollbar overflow-y-auto p-6 md:p-8"
//   style={{ maxHeight: "90vh" }}
// >

//         {/* “Individual” button */}
// {/* “Individual” button (unchanged position) */}
// <div className="mb-6">
//   <button
//     type="button"
//     className="inline-flex items-center justify-center gap-2 text-white"
//     style={{
//       width: 169,
//       height: 40,
//       borderRadius: 6,
//       background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
//     }}
//   >
//     <User className="w-4 h-4" />
//     <span className="text-sm font-medium">Individual</span>
//   </button>
// </div>



//           {/* Profile tab */}
//           {profileTab === "profile" && (
//             <div className="space-y-6">
//               <div>
//                 <label className="block mb-2 text-white/80 text-sm">Full Name</label>
//                <input
//   disabled
//   value={displayName || ""}
//   className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white/80 placeholder-white/40 outline-none focus:ring-2 focus:ring-white/10"
//   placeholder="Your name"
// />
//               </div>

//               <div>
//                 <label className="block mb-2 text-white/80 text-sm">Email</label>
//               <input
//   disabled
//   value={displayEmail || ""}
//   className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white/70 placeholder-white/40 outline-none focus:ring-2 focus:ring-white/10"
//   placeholder="you@example.com"
// />
//               </div>

//               <div className="flex items-center justify-between pt-2">
//                 <span className="text-white/80">Delete account</span>
//                 <button
//                   type="button"
//                   className="px-5 py-2 rounded-md text-red-400 border border-red-500/80 hover:bg-red-500/10 transition"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           )}
               

//     {/* modal for delete */}
//     {confirmDelete.open && (
//   <div className="fixed inset-0 z-[1100] grid place-items-center">
//     {/* backdrop */}
//     <div
//       className="absolute inset-0 bg-black/70"
//       onClick={() => setConfirmDelete({ open: false })}
//     />
//     {/* card */}
//     <div
//       className="relative w-[min(92vw,520px)] rounded-xl p-6 text-white shadow-2xl"
//       style={{ background: "#17171A", border: "1px solid rgba(255,255,255,0.10)" }}
//       role="dialog"
//       aria-modal="true"
//       aria-labelledby="del-bank-title"
//     >
//       {/* close */}
//       <button
//         aria-label="Close"
//         onClick={() => setConfirmDelete({ open: false })}
//         className="absolute right-2 top-2 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 transition h-8 w-8"
//       >
//         <X className="w-4 h-4 text-white/90" />
//       </button>

//       {/* icon */}
//       <div className="grid place-items-center mb-3">
//         <div className="grid place-items-center h-12 w-12 rounded-full bg-black/50">
//           <AlertTriangle className="w-6 h-6 text-red-500" />
//         </div>
//       </div>

//       {/* text */}
//       <h3 id="del-bank-title" className="text-center text-lg font-semibold mb-2">
//         Delete Bank Account?
//       </h3>
//       <p className="text-center text-white/80">
//         You are about to delete your saved bank account
//         <br />
//         ending with ****{confirmDelete.last4}
//       </p>
//       <p className="text-center text-white/60 mt-3">
//         This action is permanent and cannot be undone.
//       </p>

//       {/* actions */}
//       <div className="mt-6 flex items-center justify-center gap-3">
//         <button
//           onClick={performDelete}
//           className="px-4 py-2 rounded-md text-red-400 border border-red-500/80 hover:bg-red-500/10 transition"
//         >
//           Delete Account
//         </button>
//         <button
//           onClick={() => setConfirmDelete({ open: false })}
//           className="px-4 py-2 rounded-md text-white"
//           style={{ background: "#333335" }}
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   </div>
// )}









//     {/* //bank */}

//        {profileTab === "bank" && (
//   <>
//   {bankFormToast && (
//   <div
//     className="sticky top-0 z-20 mb-4 rounded-xl border px-4 py-3 shadow-lg"
//     style={{
//       background: bankFormToast.type === "success" ? "#13261B" : "#2A1717",
//       borderColor:
//         bankFormToast.type === "success"
//           ? "rgba(34,197,94,0.35)"
//           : "rgba(239,68,68,0.35)",
//     }}
//   >
//     <div className="flex items-start justify-between gap-3">
//       <div>
//         <div className="text-sm font-semibold text-white">{bankFormToast.title}</div>
//         <div className="text-xs text-white/80 mt-1">{bankFormToast.message}</div>
//       </div>

//       <button
//         type="button"
//         onClick={() => setBankFormToast(null)}
//         className="grid place-items-center rounded-full bg-black/25 hover:bg-black/40 transition h-7 w-7 shrink-0"
//       >
//         <X className="w-4 h-4 text-white/85" />
//       </button>
//     </div>
//   </div>
// )}
  
//     {/* ---------- EMPTY STATE (no bank added) ---------- */}
//     {!hasBankAccount && !showBankForm && (
//       <div
//         className="flex flex-col gap-4 rounded-xl border border-white/10 p-6"
//         style={{ background: "#17171A" }}
//       >
//         <h3 className="text-[22px]">Bank Account</h3>
//         <p className="text-white/70">Please add bank account.</p>
//         <button
//           type="button"
//           onClick={() => setShowBankForm(true)}
//           className="rounded-md px-4 py-2 text-white"
//           style={{ background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)" }}
//         >
//           Add
//         </button>
//       </div>
//     )}

//     {/* ---------- BANK FORM ---------- */}
//     {(!hasBankAccount && showBankForm) || (hasBankAccount && showBankForm) ? (
//       <div className="space-y-5">
//         <h3 className="text-[22px] mb-2">Account Details</h3>

//         <div>
//           <label className="block mb-2 text-white/80 text-sm">Account holder name</label>
//          <input
//   value={bankForm.holder}
//   onChange={(e) =>
//     setBankForm((p) => ({ ...p, holder: onlyLetters(e.target.value) }))
//   }
//   inputMode="text"
//   autoComplete="name"
//   className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
//   placeholder="Enter account holder name"
// />
//         </div>

//         <div>
//           <label className="block mb-2 text-white/80 text-sm">Account number</label>
//           <input
//   value={bankForm.accNum}
//   onChange={(e) =>
//     setBankForm((p) => ({ ...p, accNum: onlyDigits(e.target.value) }))
//   }
//   inputMode="numeric"
//   pattern="[0-9]*"
//   autoComplete="off"
//   className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
//   placeholder="Enter account number"
// />
//         </div>

//         <div>
//           <label className="block mb-2 text-white/80 text-sm">Confirm account number</label>
//          <input
//   value={bankForm.confirmAccNum}
//   onChange={(e) =>
//     setBankForm((p) => ({ ...p, confirmAccNum: onlyDigits(e.target.value) }))
//   }
//   inputMode="numeric"
//   pattern="[0-9]*"
//   autoComplete="off"
//   className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
//   placeholder="Re-enter account number"
// />
//         </div>

//         <div>
//           <label className="block mb-2 text-white/80 text-sm">IFSC Code</label>
//           <div className="relative">
//             <input
//               value={bankForm.ifsc}
//               onChange={(e) => setBankForm((p) => ({ ...p, ifsc: e.target.value }))}
//               className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 pr-[112px] text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
//               placeholder="IFSC Code"
//             />
//             <button
//               type="button"
//               className="absolute right-1 top-1 bottom-1 px-4 rounded-md text-sm text-white"
//               style={{ background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)" }}
//             >
//               Find IFSC
//             </button>
//           </div>
//         </div>

//         <div>
//           <label className="block mb-2 text-white/80 text-sm">Bank name</label>
//           <input
//             value={bankForm.bankName}
//             onChange={(e) => setBankForm((p) => ({ ...p, bankName: e.target.value }))}
//             className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
//             placeholder="Bank name"
//           />
// {/* Toggle appears only when user already has at least one account */}
// {/* Toggle appears only when user already has at least one account */}
// {hasBankAccount && (
//   <label className="flex items-center gap-3 pt-3 select-none">
//     <button
//       type="button"
//       role="switch"
//       aria-checked={setAsDefault}
//       onClick={() => setSetAsDefault(v => !v)}
//       className="relative h-6 w-11 rounded-full transition-colors"
//       style={{
//         background: setAsDefault
//           ? "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)"
//           : "#2B2B2E",
//         border: "1px solid rgba(255,255,255,0.12)",
//       }}
//     >
//       {/* keep the knob inside using left instead of translateX */}
//       <span
//         className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white transition-all"
//         style={{ left: setAsDefault ? "calc(100% - 18px)" : "2px" }}
//       />
//     </button>
//     <span className="text-white/90">Set as Default Bank Account</span>
//   </label>
// )}



//         </div>

//         {/* Actions (exact sizing) */}
//        <div
//   className="sticky bottom-0 pt-4 pb-4 mt-4 flex items-center justify-end gap-3"
//   style={{ background: "#17171A" }}
// >

//           <button
//             type="button"
//             onClick={() => {
//               setShowBankForm(false);
//               // if user had no accounts before, empty-state will show again
//             }}
//             className="h-[49px] w-[100px] rounded-[6px] border border-white text-white/90"
//             style={{ background: "transparent" }}
//           >
//             Cancel
//           </button>

//           <button
//             type="button"
//             onClick={handleSaveBank}
//             className="h-[49px] w-[162px] rounded-[6px] text-white px-[15px] transition-colors"
//             style={{ background: "#333335" }}
//             onMouseEnter={(e) =>
//               (e.currentTarget.style.background =
//                 "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)")
//             }
//             onMouseLeave={(e) => (e.currentTarget.style.background = "#333335")}
//           >
//             Save &amp; Continue
//           </button>
//         </div>
//       </div>
//     ) : null}

//     {/* ---------- DASHBOARD (after at least 1 account) ---------- */}
//     {hasBankAccount && !showBankForm && (
//       <div className="space-y-7">
//         {/* Earnings card */}
//         <div
//           className="rounded-xl border border-white/10 p-5"
//           style={{ background: "#17171A" }}
//         >
//           <div className="text-white/70 text-sm">Total Earning</div>
//           <div className="mt-2 text-[26px] font-medium">₹{totalEarnings.toLocaleString()}</div>
//         </div>

//         {/* Linked accounts */}
//         <div>
//           <h4 className="mb-3 text-white/90">Linked Bank Accounts</h4>
//           <div className="space-y-3">
//             {bankAccounts.map((acc) => (
//               <div
//                 key={acc.id}
//                 className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-4"
//                 style={{ background: "#17171A" }}
//               >
//                 <div>
//                   <div className="font-medium">
//                     {acc.bank} - ****{acc.last4}
//                   </div>
//                   <div className="text-xs text-white/70 mt-1">IFSC: {acc.ifsc}</div>
//                   {acc.isDefault && (
//                     <div className="text-xs text-emerald-400 mt-1 inline-flex items-center gap-1">
//                       <Check className="w-4 h-4" /> Default
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex items-center gap-2">
//                   {!acc.isDefault && (
//                      <button
//     type="button"
//     onClick={() => makeDefault(acc.id)}          // ← makes it default
//     className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white transition"
//     style={{ background: "#333335", border: "1px solid rgba(255,255,255,0.15)" }}
//     title="Set as default"
//   >
//     <Star className="w-4 h-4" />
//     Set Default
//   </button>
//                   )}
//                  <button
//   type="button"
//   onClick={() => requestDelete(acc)}   // ← was: deleteAccount(acc.id)
//   className="grid place-items-center rounded-md h-9 w-9 border border-white/15 hover:border-white/25 transition"
//   style={{ background: "#1F1F22" }}
//   aria-label="Delete account"
// >
//   <Trash className="w-4.5 h-4.5 text-white/80" />
// </button>

//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Add another account */}
//           <div className="mt-4">
//         <button
//   type="button"
//   onClick={() => {
//     setShowBankForm(true);
//     setSetAsDefault(false); // show toggle, default OFF
//   }}
//   className="w-full rounded-xl border border-white/15 px-4 py-3 text-white/90 hover:border-white/25 transition"
//   style={{ background: "#1F1F22" }}
// >
//   + Add another bank account
// </button>

//           </div>
//         </div>

//         {/* Transaction History */}
//         <div>
//           <h4 className="mb-3 text-white/90">Transaction History</h4>

//           {transactions.length === 0 ? (
//             <div
//               className="rounded-xl border border-white/10 p-5 text-white/70"
//               style={{ background: "#17171A" }}
//             >
//               No transaction history
//             </div>
//           ) : (
//             <div
//               className="rounded-xl border border-white/10"
//               style={{ background: "#17171A" }}
//             >
//               <div className="grid grid-cols-[2fr,1fr,1fr] px-4 py-3 text-white/70 border-b border-white/10">
//                 <span>Date</span>
//                 <span>Amount</span>
//                 <span>Status</span>
//               </div>
//               {transactions.map((t) => (
//                 <div
//                   key={t.id}
//                   className="grid grid-cols-[2fr,1fr,1fr] px-4 py-3 border-t border-white/5"
//                 >
//                   <span>{t.date}</span>
//                   <span>₹{t.amount.toLocaleString()}</span>
//                   <span className="text-emerald-400">{t.status}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     )}
//   </>
// )}



// {/* INVOICES */}



// {/* BILLING INFORMATION */}
// {profileTab === "billing" && (
//   <div className="space-y-5">
//     <h3 className="text-[22px] mb-2">My Billing information</h3>

//     <div className="rounded-md overflow-hidden">
//       {/* Header */}
//       <div className="grid grid-cols-[2fr,1fr,120px] items-center bg-[#1F1F22] px-4 py-3 text-white/80">
//         <span>Item</span>
//         <span>Date</span>
//         <span className="text-right">Status</span>
//       </div>

//       {/* Rows */}
//       <div className="divide-y divide-white/10">
//         {[
//           { item: "Premium e-commerce\ncopy prompt", date: "Sep 16, 2025" },
//           { item: "Customization Add-on", date: "Sep 15, 2025" },
//         ].map((row, i) => (
//           <div
//             key={i}
//             className="grid grid-cols-[2fr,1fr,120px] items-center px-4 py-4"
//           >
//             <span className="whitespace-pre-line text-white/90">{row.item}</span>
//             <span className="text-white/90">{row.date}</span>
//             <span className="flex items-center justify-end gap-4">
//               <button
//                 type="button"
//                 className="grid place-items-center w-8 h-8 rounded-md border border-white/15 text-white/90"
//                 title="View"
//               >
//                 <FileText className="w-4 h-4" />
//               </button>
//               <button
//                 type="button"
//                 className="grid place-items-center w-8 h-8 rounded-md border border-white/15 text-white/90"
//                 title="Download"
//               >
//                 <Download className="w-4 h-4" />
//               </button>
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// )}




//         </section>
//       </div>
//     </div>
//   </div>
// )}

//  {token && kycOpen && (
//   <KycGateModal
//     open={kycOpen}
//     onClose={() => {
//       setKycOpen(false);
//       setPendingUpload(false);
//       setPendingCheckout(false);

//     }}
//     token={token}
//     apiBase={API_BASE}
//     defaultCountry="IN"
//     requiredForLabel="buying and uploading prompts"
//   onVerified={async () => {
//   setKycOpen(false);
//   setCartOpen(false); // ✅ ensure cart band hai

//   if (pendingUpload) {
//     setPendingUpload(false);
//     setSellOpen(true);
//   }

//   if (pendingCheckout) {
//     setPendingCheckout(false);
//     await new Promise((res) => setTimeout(res, 100));
//     await doCheckout();
//   }
// }}
//   />
// )}


// </>
//   );
// };

// export default Header;







// src/components/Header.tsx
import { useMemo, useState,useEffect ,useRef, useCallback} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socket";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ScreenRecordPermissionModal from "@/components/ScreenRecordPermissionModal";

import { Settings, Plus, ChevronDown, Wallet, LayoutDashboard, LogOut } from "lucide-react";
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
import { Users, ReceiptText, Briefcase, Package, Gift, Bookmark, Store, ShoppingBag } from "lucide-react";
import { LuBadgeCheck } from "react-icons/lu";
// Shared with Landing.tsx's HeroAccountMenu, which is a second copy of this
// dropdown — the hook keeps the freelancer entry identical in both.
import { useFreelancerMenu } from "@/hooks/useFreelancerMenu";
import SellerLinkedAccountForm from "@/components/SellerLinkedAccountForm";
import { primeSellerData } from "@/lib/sellerPrefetch";
import { resolveUploadGate } from "@/lib/uploadGate";
import ModeToggle from "@/components/ModeToggle";
import { useMode } from "@/contexts/ModeContext";
import { MODE_UI_ENABLED } from "@/lib/mode";
import { isTeamMember, canManageTeam, TEAM_MEMBER_SELL_TOAST } from "@/lib/orgRoles";
import { userInitials, userAvatarUrl } from "@/lib/userInitials";
import DetailsPrompt, { type MarketplacePrompt } from "@/components/DetailsPrompt";
import { fetchPromptDetails } from "@/lib/promptDetails";
import { withTokunBranding } from "@/lib/razorpayTheme";
// The one site bar. A signed-out visitor gets it instead of everything in this
// file, and it is the SAME component the landing page renders.
import SiteNav from "@/components/SiteNav";
// import { useAuth } from "@/contexts/AuthContext";
// import { toast } from "@/components/ui/use-toast";

type ThemeMode = "light" | "dark" | "system";

const HEADER_NOTIF_TYPE_LABELS: Record<string, string> = {
  HIRE_PROPOSAL_ACCEPTED: "Hire Proposal Accepted",
  HIRE_PAYMENT_REQUIRED: "Payment Required",
  HIRE_PAYMENT_DONE: "Payment Received",
  HIRE_WORK_STARTED: "Work Started",
  HIRE_WORK_SUBMITTED: "Work Submitted",
  HIRE_WORK_COMPLETED: "Work Completed",
  HIRE_REVISION_REQUESTED: "Revision Requested",
  HIRE_PAYMENT_RELEASED: "Payment Released",
  HIRE_COUNTER_OFFER: "Counter Offer",
  HIRE_NDA_SIGNED: "NDA Signed",
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Owns the freelancer menu row plus the onboarding wizard and payout dialog.
  // `freelancerMenu.modals` is rendered near the end of this component, NOT
  // inside the dropdown — the dropdown unmounts its contents when it closes,
  // which would take the wizard down with it.
  const freelancerMenu = useFreelancerMenu();
const CHAT_BADGE_KEY = "tokun_chat_badge_count";

const getStoredChatBadge = () => {
  const raw = localStorage.getItem(CHAT_BADGE_KEY);
  const n = Number(raw || "0");
  return Number.isFinite(n) ? n : 0;
};

const setStoredChatBadge = (count: number) => {
  localStorage.setItem(CHAT_BADGE_KEY, String(Math.max(0, count)));
};
  // const { user, logout } = useAuth();
  /* isAuthenticated/isReady gate the account menu below. This header renders on
     public pages too (/prompt-marketplace is open to anyone), and it used to
     show the signed-in cluster unconditionally — a visitor with no session got
     an avatar reading "U", the initials fallback for "no name, no email", and a
     Logout button for a session that did not exist. */
  const { user, logout, token, isAuthenticated, isReady } = useAuth() as any;
 // Drives the Team button in the action row below.
 const canManageTeamNav = canManageTeam(user);

 /* Buyer or creator half. `shows` is the whole vocabulary this component needs
    — which surfaces belong to which mode is stated once, in lib/mode.ts,
    rather than as conditions scattered down the JSX. */
 const { mode, setMode, canUseCreatorMode, shows } = useMode();
 const { cart, removeFromCart, fetchCart, welcomeDiscount } = useCart();
 /* The cart review dialog — see handleCheckout. */
 const [confirmCartOpen, setConfirmCartOpen] = useState(false);
 const [unreadChats, setUnreadChats] = useState<number>(() => getStoredChatBadge());
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
 
  const [theme, setTheme] = useState<ThemeMode>("system");
   const [cartOpen, setCartOpen] = useState(false);
   /* A cart row is a product, and until now the only thing you could do to one
      was delete it — the buyer had no way back to what they were about to pay
      for. Clicking a row opens the same details panel the marketplace uses.

      The cart closes while the panel is open and reopens behind it on dismiss:
      the drawer sits at z-[1100], exactly the rung DetailsPrompt's own content
      uses, so leaving both up puts the panel's backdrop *under* the cart and
      clicks near its edge land on the cart's scrim. */
   const [detailsPrompt, setDetailsPrompt] = useState<MarketplacePrompt | null>(null);
   const [detailsOpen, setDetailsOpen] = useState(false);
   /** Which row is being fetched — so a slow network shows on that row alone. */
   const [detailsLoadingId, setDetailsLoadingId] = useState<string | null>(null);
   const [screenPermOpen, setScreenPermOpen] = useState(false);
   const [sellOpen, setSellOpen] = useState(false);
   const [headerToast, setHeaderToast] = useState<{
  title: string;
  message: string;
} | null>(null);

const [sellerFormOpen, setSellerFormOpen] = useState(false);
const [hideHeader, setHideHeader] = useState(false);
// useEffect(() => {
//   // Chat page par header hide mat karo
//   if (location.pathname === "/chat") return;
//   const onScroll = () => setHideHeader(window.scrollY > 10);
//   window.addEventListener("scroll", onScroll, { passive: true });
//   return () => window.removeEventListener("scroll", onScroll);
// }, [location.pathname]);
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
  const toTitleCase = (value: string) =>
    value
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  const displayName = useMemo(() => {
    const raw = user?.name?.trim() || "";
    return raw ? toTitleCase(raw) : "";
  }, [user]);
  const displayEmail = useMemo(() => user?.email || "", [user]);
  const fullName = useMemo(() => {
    if (displayName) return displayName;
    if (displayEmail) return displayEmail.split("@")[0];
    return "User";
  }, [displayName, displayEmail]);

  // What the account button shows instead of the name.
  const initials = useMemo(
    () => userInitials(user?.name, user?.email),
    [user?.name, user?.email]
  );
  const [avatarBroken, setAvatarBroken] = useState(false);
  const rawAvatarUrl = userAvatarUrl(user as any);
  const avatarUrl = avatarBroken ? null : rawAvatarUrl;
  // A new upload deserves a fresh attempt even if the previous URL 404'd.
  useEffect(() => {
    setAvatarBroken(false);
  }, [rawAvatarUrl]);

  // Nav helpers
  const handleBrandClick = () => navigate(user ? "/app" : "/");
  const goToSaved = () => navigate("/saved");

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
  const id = user?._id || user?.id;
  if (!id) return;
  navigate(`/profile/${id}`);
};

const openAccountSettingsPopup = () => {
  setProfileTab("profile");
  setProfileOpen(true);
};

const goToWallet = () => {
  navigate("/wallet"); // agar route alag hai to yaha change kar dena
};


// Opening the chat page is NOT the same as reading every thread. This used to
// fire /conversations/read-all, which marked every message in every
// conversation as read — so senders saw blue double ticks for messages nobody
// had opened. Each thread now marks itself read when it's actually opened, and
// the badge just reflects the server's unread count.
const handleChatClick = () => {
  navigate("/chat");
  /* Already on /chat? Then navigate() is a no-op and nothing happens — which is
     exactly what the icon did there, and why the page needed its own "Open
     Message" button to get the panel back. The event lets that page reopen it;
     everywhere else it goes unheard and the navigation does the work.

     Dispatched after navigate on purpose: on a first visit the page mounts with
     the panel open anyway, so a missed event costs nothing. */
  try {
    window.dispatchEvent(new CustomEvent("tokun:open-chat"));
  } catch {
    /* Older browsers without CustomEvent — the navigation still stands. */
  }
};

// const handlePostPrompt = async () => {
//   if (!token) {
//     toast({
//       title: "Please log in",
//       description: "You must be logged in to upload prompts.",
//       //     });
//     navigate("/login");
//     return;
//   }

//   const ok = await ensureKycVerified();
//   if (!ok) {
//     setPendingUpload(true);
//     return;
//   }

//   setSellOpen(true);
// };

// Warm the payout status, the Razorpay business categories and the prompt
// categories as soon as we know who the user is. All three used to be fetched
// only after the Upload click, in series, which is why the button sat there
// doing nothing for a round-trip or two.
useEffect(() => {
  if (!token || isTeamMember(user)) return;
  primeSellerData(API_BASE, token);
}, [token, user]);

// Second chance to warm the cache for anyone who lands on the button before
// the mount prefetch finished — pointing at it is already a strong signal.
const warmSellerData = () => {
  if (!token || isTeamMember(user)) return;
  primeSellerData(API_BASE, token);
};

const handlePostPrompt = () => {
  /* The gate itself moved to lib/uploadGate.ts — the landing bar carries this
     same button now, and two copies of "who is allowed to sell" is how the two
     bars would come to disagree about it. What to do with each answer stays
     here, because these modals are this header's. */
  switch (resolveUploadGate(token, user, API_BASE)) {
    case "login":
      toast({
        title: "Please log in",
        description: "You must be logged in to upload products.",
      });
      navigate("/login");
      return;
    // A team member can't sell — their org lists and gets paid on its own
    // account. Stopped here rather than in the form, so they never see a payout
    // onboarding screen for an account they'd have no use for.
    case "team-blocked":
      toast(TEAM_MEMBER_SELL_TOAST);
      return;
    case "sell":
      setSellOpen(true);
      return;
    default:
      setSellerFormOpen(true);
  }
};


 
// ── CHANGE 4 ─ JSX mein, KycGateModal ke baad yeh add karo:
// (Return ke andar, closing </> se pehle)














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



const [bankFormToast, setBankFormToast] = useState<{
  title: string;
  message: string;
  type?: "error" | "success";
} | null>(null);

const bankToastTimerRef = useRef<number | null>(null);

const showBankFormToast = (
  title: string,
  message: string,
  type: "error" | "success" = "error"
) => {
  setBankFormToast({ title, message, type });

  if (bankToastTimerRef.current) {
    window.clearTimeout(bankToastTimerRef.current);
  }

  bankToastTimerRef.current = window.setTimeout(() => {
    setBankFormToast(null);
  }, 4000);
};

useEffect(() => {
  return () => {
    if (bankToastTimerRef.current) {
      window.clearTimeout(bankToastTimerRef.current);
    }
  };
}, []);

const onlyLetters = (value: string) =>
  value
    .replace(/[^A-Za-z\s]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+/, "");

const onlyDigits = (value: string) => value.replace(/\D/g, "").slice(0, 18);

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
  const holder = bankForm.holder.trim();
  const accNum = bankForm.accNum.trim();
  const confirmAccNum = bankForm.confirmAccNum.trim();
  const ifsc = bankForm.ifsc.trim().toUpperCase();
  const bankName = bankForm.bankName.trim();

  if (!holder || !accNum || !confirmAccNum || !ifsc || !bankName) {
    showBankFormToast("Missing details", "Please fill out all fields.", "error");
    return;
  }

  if (accNum !== confirmAccNum) {
    showBankFormToast(
      "Account numbers mismatch",
      "Please re-enter account number correctly.",
      "error"
    );
    return;
  }

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
    accountHolderName: holder,
    accountNumber: accNum,
    confirmAccountNumber: confirmAccNum,
    ifscCode: ifsc,
    bankName: bankName,
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

    if (!res.ok) {
      const code = data?.error || `http_${res.status}`;
      const nice =
        code === "all_fields_required"
          ? "Please fill out all fields."
          : code === "account_numbers_mismatch"
          ? "Account numbers do not match."
          : code === "account_already_exists"
          ? "This bank account is already saved."
          : "Could not add bank account.";

      throw new Error(nice);
    }

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
    setBankForm({
      holder: "",
      accNum: "",
      confirmAccNum: "",
      ifsc: "",
      bankName: "",
    });

    showBankFormToast(
      "Bank account added",
      newAcc.isDefault ? "Saved and set as default." : "Saved successfully.",
      "success"
    );
  } catch (err: any) {
    showBankFormToast("Add failed", err?.message || "Could not add bank account.", "error");
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
    toast({ title: "Failed to set default", description: err?.message || "Try again." });
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

/* Orders — how many of the user's own transactions are waiting on THEM.
   Only the count is fetched here; the page itself does the full load. Both
   sides of the marketplace need this: a client who just paid wants to see what
   they bought, and a creator wants to see what they've been hired for without
   digging four clicks into Service Bookings. */
const [ordersNeedingAction, setOrdersNeedingAction] = useState(0);

useEffect(() => {
  if (!token) {
    setOrdersNeedingAction(0);
    return;
  }

  let cancelled = false;
  const loadOrderCount = () => {
    fetch(`${API_BASE}/api/my-orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d?.success) setOrdersNeedingAction(d.counts?.needsAction || 0);
      })
      .catch(() => {
        // A failed badge count is not worth telling the user about — the
        // button still works, it just won't show a dot.
      });
  };

  loadOrderCount();
  // Same cadence as the notification poll below; an order moving to
  // "needs your review" isn't urgent enough to warrant anything tighter.
  const interval = setInterval(loadOrderCount, 60000);
  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}, [token]);


// const { token } = useAuth();

// const handleCheckout = async () => {
//   if (!token) {
//     console.error("[Checkout] ❌ No auth token found");
//     toast({
//       title: "Unauthorized",
//       description: "Please login first.",
//       //     });
//     return;
//   }

//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   };

//   const CHECKOUT_URL = `${API_BASE}/api/cart/checkout`;
//   const VERIFY_URL = `${API_BASE}/api/cart/verify`;

//   try {
//     // --- Step 1: Create checkout order ---
//     console.groupCollapsed(
//       "%c[Checkout] POST → /api/cart/checkout",
//       "color:#60a5fa;font-weight:700;"
//     );

//     const res = await fetch(CHECKOUT_URL, {
//       method: "POST",
//       headers,
//       credentials: "include",
//     });

//     console.log("[Checkout] HTTP:", res.status, res.statusText);
//     const rawCheckout = await res.text();
//     console.log("[Checkout] Raw body:", rawCheckout);

//     let checkoutData: any = {};
//     try {
//       checkoutData = JSON.parse(rawCheckout);
//     } catch (e) {}

//     if (!res.ok || !checkoutData.success) {
//       throw new Error(checkoutData?.error || `http_${res.status}`);
//     }

//     const { order, prompts } = checkoutData;
//     console.log(
//       "%c[Checkout] ✅ Success",
//       "color:#22c55e;font-weight:700;",
//       { order, prompts }
//     );
//     console.groupEnd();

//     // --- Step 2: Handle free prompts (no Razorpay needed) ---
//     if (!order) {
//       console.log("[Checkout] No paid prompts → directly calling verify");

//       const verifyRes = await fetch(VERIFY_URL, {
//         method: "POST",
//         headers,
//         body: JSON.stringify({
//           razorpayPaymentId: null,
//           razorpayOrderId: null,
//           razorpaySignature: null,
//           pricePaid: 0,
//         }),
//         credentials: "include",
//       });

//       const rawVerify = await verifyRes.text();
//       console.log("[Verify] Raw body:", rawVerify);

//       let verifyData: any = {};
//       try {
//         verifyData = JSON.parse(rawVerify);
//       } catch {}

//       if (!verifyRes.ok || !verifyData.success) {
//         throw new Error(verifyData?.error || `http_${verifyRes.status}`);
//       }

//       toast({
//         title: "Checkout complete",
//         description: "Free prompts added to purchases.",
//       });
//       return;
//     }

//     // --- Step 3: Open Razorpay popup ---
//     const options: any = {
//       key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//       amount: order.amount,
//       currency: order.currency,
//       name: "Tokun.world",
//       description: "Prompt Checkout",
//       order_id: order.id,
//       handler: async (response: any) => {
//         console.log("[Razorpay] Payment success:", response);

//         // --- Step 4: Verify payment ---
//         const verifyRes = await fetch(VERIFY_URL, {
//           method: "POST",
//           headers,
//           body: JSON.stringify({
//             razorpayPaymentId: response.razorpay_payment_id,
//             razorpayOrderId: response.razorpay_order_id,
//             razorpaySignature: response.razorpay_signature,
//             pricePaid: order.amount / 100,
//           }),
//           credentials: "include",
//         });

//         const rawVerify = await verifyRes.text();
//         console.log("[Verify] Raw body:", rawVerify);

//         let verifyData: any = {};
//         try {
//           verifyData = JSON.parse(rawVerify);
//         } catch {}

//         if (!verifyRes.ok || !verifyData.success) {
//           throw new Error(verifyData?.error || `http_${verifyRes.status}`);
//         }

//         console.log(
//           "%c[Verify] ✅ Success",
//           "color:#22c55e;font-weight:700;",
//           verifyData
//         );
//         toast({
//           title: "Checkout complete",
//           description: "Your prompts are now available.",
//         });
//       },
//       theme: { color: "#1A73E8" },
//     };

//     const razorpayInstance = new (window as any).Razorpay(options);
//     razorpayInstance.open();
//   } catch (err: any) {
//     console.error("[Checkout] ❌ FAILED:", err?.message || err);
//     toast({
//       title: "Checkout failed",
//       description: err?.message || "Something went wrong.",
//       //     });
//     console.groupEnd();
//   }
// };




const doCheckout = async () => {
  if (!token) {
    console.error("[Checkout] ❌ No auth token found");
    toast({
      title: "Unauthorized",
      description: "Please login first.",
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
      // Prefer the server's written reason — the bare `error` code used to reach
      // the user, so a blocked team member saw "team_members_cannot_purchase".
      throw new Error(checkoutData?.message || checkoutData?.error || `http_${res.status}`);
    }

    const { order, prompts } = checkoutData;
    console.log(
      "%c[Checkout] ✅ Success",
      "color:#22c55e;font-weight:700;",
      { order, prompts }
    );
    console.groupEnd();

    if (!order) {
      console.log("[Checkout] No paid products → directly calling verify");

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
        description: "Free products added to purchases.",
      });
      // The cart is empty now and what was in it is owned — take them to it.
      fetchCart();
      navigate("/self-dash?tab=prompts&p=purchased", {
        state: { refreshPurchases: true },
      });
      return;
    }

    const options: any = {
      // Cart checkout returns the key its order was created under, same as the
      // single-prompt flow. Falls back to the build-time value only if an older
      // server response doesn't carry it.
      key: checkoutData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Tokun.world",
      description: "Product Checkout",
      order_id: order.id,
      handler: async (response: any) => {
        console.log("[Razorpay] Payment success:", response);

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
  description: "Your products are now available.",
});
// ✅ Cart refresh karo
fetchCart();

/* Same trip the single-prompt buy flow makes: land the buyer on My Products
   with everything they just paid for, instead of back on the page they were
   browsing with only a toast to say the payment worked. */
try {
  window.dispatchEvent(
    new CustomEvent("tokun:purchased", { detail: verifyData?.purchase ?? null })
  );
} catch {}
navigate("/self-dash?tab=prompts&p=purchased", {
  state: { refreshPurchases: true },
});
      },
    };

    const razorpayInstance = new (window as any).Razorpay(withTokunBranding(options));
    razorpayInstance.open();
  } catch (err: any) {
    console.error("[Checkout] ❌ FAILED:", err?.message || err);
    toast({
      title: "Checkout failed",
      description: err?.message || "Something went wrong.",
    });
    console.groupEnd();
  }
};


/* Checkout now asks first.

   It used to close the cart and go straight to Razorpay: the drawer vanished,
   the page behind it came back, and the next thing on screen was a payment
   sheet — no summary of what was being bought, and none of the terms Buy Now
   makes a buyer accept. The review dialog is the same component Buy Now uses
   (PurchaseConfirmModal, in cart mode), so both routes to a purchase ask for the
   same consent and show the same money. */
const handleCheckout = () => {
  if (!token) {
    toast({
      title: "Please log in",
      description: "You must be logged in to checkout.",
    });
    navigate("/login");
    return;
  }
  setConfirmCartOpen(true);
};

const confirmCartCheckout = async () => {
  setCartOpen(false);
  setConfirmCartOpen(false);

  // Let the cart's close animation finish before checkout takes over.
  await new Promise((res) => setTimeout(res, 150));

  // The identity-KYC gate that used to sit here is gone. It belonged to the old
  // pre-Route flow where buyers had to be KYC-verified before paying; selling is
  // now gated on a Razorpay Route linked account instead (see
  // SellerLinkedAccountForm), and buying was never meant to require identity
  // verification at all. It was still blocking checkout for every buyer.
  await doCheckout();
};

/* Opens the details panel for a cart row.
   The row itself only knows title/price/thumbnail, so the full listing is
   fetched — see lib/promptDetails. If it can't be loaded the cart stays exactly
   as it was rather than dropping the buyer into an empty panel. */
const openCartItemDetails = async (promptId: string) => {
  if (detailsLoadingId) return;
  setDetailsLoadingId(promptId);
  const full = await fetchPromptDetails(promptId);
  setDetailsLoadingId(null);

  if (!full) {
    toast({
      title: "Couldn't open this product",
      description: "It may no longer be listed. Try refreshing your cart.",
    });
    return;
  }

  setCartOpen(false);
  setDetailsPrompt(full);
  setDetailsOpen(true);
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

        // if (latest) {
        //   setHeaderToast({
        //     title: latest.promptId?.title || "New notification",
        //     message: latest.message || "You have a new update",
        //   });

        //   // auto hide after 5s
        //   if (toastTimerRef.current) {
        //     clearTimeout(toastTimerRef.current);
        //   }

        //   toastTimerRef.current = window.setTimeout(() => {
        //     setHeaderToast(null);
        //   }, 5000);
        // }
      }
    }
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
  }
};


const markAllAsRead = async () => {
  // ✅ Optimistic update — turant 0 dikhao
  setRealUnreadCount(0);
  setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const unread = notifications.filter((n) => !n.read);
  await Promise.all(
    unread.map((n) =>
      fetch(`${API_BASE}/api/prompt-collab/notifications/read/${n._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
    )
  );
  // Optional: refresh from server
  fetchNotifications();
};

useEffect(() => {
  fetchNotifications();
  const interval = setInterval(fetchNotifications, 60000);
  return () => clearInterval(interval);
}, [token]);

// Header.tsx me existing useEffect ke andar add karo

/* ── Chat badge ──────────────────────────────────────────────────────────
   The count comes from the server (sum of per-conversation unreadCount), not
   from a local tally. The old version incremented on the "new-message" socket
   event, which is emitted only into the conversation's room — a room you are
   only in while that thread is open on the chat page. So off the chat page,
   where the badge actually matters, it never moved. `chat:notify` is emitted
   to each recipient's personal room instead, so it arrives anywhere in the app.
   localStorage is kept purely as a first-paint cache so the number doesn't
   flash 0 before the fetch lands. */
const refreshChatBadge = useCallback(async () => {
  if (!token) return;
  try {
    const res = await fetch(`${API_BASE}/api/chat/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!data?.success || !Array.isArray(data.conversations)) return;
    const total = data.conversations.reduce(
      (sum: number, c: any) => sum + (Number(c?.unreadCount) || 0),
      0
    );
    setUnreadChats(total);
    setStoredChatBadge(total);
  } catch (err) {
    console.error("Chat badge refresh failed", err);
  }
}, [token]);

useEffect(() => {
  refreshChatBadge();
}, [refreshChatBadge, location.pathname]);

/* ── Header background ───────────────────────────────────────────────────
   Transparent at the very top so the hero (video on the marketplace, artwork
   elsewhere) reads as full-bleed, then a blurred dark bar once you scroll.
   The header is sticky with no background at all today, so past the hero the
   nav sits straight on top of cards and body copy — white text on whatever
   happens to scroll under it. */
const [scrolled, setScrolled] = useState(false);
useEffect(() => {
  // Separate on/off thresholds. With a single line, a scroll that hovers around
  // it flips the state every frame and the bar strobes — that was part of the
  // shake on the SmartGen and optimiser pages. The gap between them is the
  // dead zone.
  const SHOW_AT = 80;
  const HIDE_AT = 40;

  let frame = 0;
  // Mirrors `scrolled` outside React so the rAF callback can compare against
  // the current value without the effect depending on it (which would tear the
  // listener down and rebuild it on every toggle).
  let visible = false;

  const measure = () => {
    frame = 0;
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    const next = visible ? y > HIDE_AT : y > SHOW_AT;
    // Scroll fires far more often than the screen refreshes, and almost every
    // one of those reads the same answer. Only touching state on an actual
    // change keeps React out of the scroll path entirely.
    if (next !== visible) {
      visible = next;
      setScrolled(next);
    }
  };

  // Coalesce a burst of scroll events into one read per frame.
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(measure);
  };

  measure(); // a reload part-way down the page must not start transparent
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    window.removeEventListener("scroll", onScroll);
    if (frame) cancelAnimationFrame(frame);
  };
}, []);

useEffect(() => {
  const myId = user?._id || user?.id;

  const handleNotify = (payload: any) => {
    // Own messages never count — the server already excludes the sender, this
    // is just belt-and-braces for a mirrored/echoed payload.
    if (payload && String(payload.senderId) === String(myId)) return;
    setUnreadChats((prev) => {
      const next = prev + 1;
      setStoredChatBadge(next);
      return next;
    });
  };

  // A thread was read somewhere in the app — re-ask the server rather than
  // assuming everything is now zero.
  const handleChatRead = () => { refreshChatBadge(); };

  socket.on("chat:notify", handleNotify);
  window.addEventListener("chat-read", handleChatRead);

  return () => {
    socket.off("chat:notify", handleNotify);
    window.removeEventListener("chat-read", handleChatRead);
  };
}, [user?._id, user?.id, refreshChatBadge]);

  /* NO SESSION → the landing page's bar, literally: same component, same logo
     size, same Login / Get Started pair. Only `docked` differs, which swaps
     fixed for sticky because an ordinary page doesn't reserve space for a
     floating bar the way the hero does.

     Everything below this line assumes a signed-in user: the cart is keyed on
     the token, Upload Product leads to a login wall, notifications need an
     account. A visitor on /about or /prompt-marketplace was getting that whole
     toolbar plus a lone "Log in" pill, and no route to signing up.

     Placed here, after every hook has run, so the hook order is identical on
     both branches — an early return above them would break the rules of hooks
     the moment a session resolves. `isReady` matters: during session restore we
     know nothing yet, and flashing "Login / Get Started" at a returning user
     before their avatar appears is worse than a beat of nothing. */
  if (isReady && !isAuthenticated) return <SiteNav docked />;

  return (
    <>

<header
  className={`site-header sticky top-0 left-0 right-0 z-50 flex justify-center pointer-events-none${
    scrolled ? " site-header--scrolled" : ""
  }`}
>
  {/* Decorative only — the nav content is a sibling, so nothing here ever sits
      between a logo and the pointer. Styles live in index.css so the panel and
      the nav row can share one width, and the blur radii can drop on small
      screens without duplicating them in JS. */}
  <div aria-hidden className="site-header__bg">
    <span className="site-header__glow" />
  </div>

  {/* max-width is set in CSS, not here: it shrinks on scroll in step with the
      panel behind it, and one declaration owning both keeps them from drifting
      apart mid-transition.
      z-10 keeps the logo and icons above the panel and, being a separate
      layer, they never inherit its blur. */}
  <div className="site-header__inner pointer-events-auto relative z-10 w-full text-white px-4 sm:px-6 py-2 flex items-center justify-between">
  
        {/* Brand */}
        
        {/* Brand */}
 <button
    type="button"
    onClick={handleBrandClick}
    className="site-header__brand flex items-center gap-2 sm:gap-3 min-w-0 group shrink-0"
    aria-label="Go to home"
  >
   {/* Height is in CSS, not Tailwind classes: it condenses on scroll along
       with the panel, and the responsive ladder has to live in one place for
       the two to stay in step. The logo is the tallest thing in this row, so
       it alone decides the bar's height — which is why the icons had so much
       air above and below them once the panel appeared. */}
   {/* No hover scale. `.site-header__logo` is already scaled by the scroll
       condense (transform-origin: left center, 760ms) — a Tailwind
       group-hover:scale-105 overwrote that same `transform`, so hovering the
       mark after any scroll made it grow and drift to the right over
       three-quarters of a second. One animation per property. */}
   <img
  src="/icons/Tokun.png"
  alt="Tokun.world Logo"
  className="
    site-header__logo
    w-auto
    max-w-none
    object-contain
  "
/>
  </button>







        

        {/* Actions (Get Pro removed) */}
         <div className="site-header__actions flex items-center gap-1 sm:gap-2 md:gap-3 flex-nowrap shrink-0">
      
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

  {/* Saved moved into the account menu when the mode toggle took its slot —
      the action row was already full, and Saved is a destination you visit
      rather than a control you use in passing. It is still here, unchanged,
      for when MODE_UI_ENABLED is off. */}
  {!MODE_UI_ENABLED && (
    <button
      type="button"
      onClick={goToSaved}
      className="relative flex items-center justify-center rounded-md p-2 hover:bg-white/10 transition"
      title="Saved"
    >
      {/* Sized down to sit level with the lucide icons either side of it — as a
          raster mark it read a size larger than them at the same box. */}
      <img src="/icons/cop.png" alt="" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    </button>
  )}
</div>


 {/* TEAM — org member management.
     Moved out of the avatar dropdown's unlabelled secondary list, where an
     owner had to open a menu and scroll past Pricing/Support to find the page
     they manage their whole team from. Sits in the action row instead, so it's
     one click and visible without opening anything.
     Same visibility rule as before: org Owner, or a TM given the Admin role. */}
 {canManageTeamNav && (
   <button
     type="button"
     onClick={() => navigate("/admin")}
     title="Team — manage members and token allowances"
     aria-label="Team"
     className="relative flex items-center gap-1.5 rounded-full px-2 py-2 sm:px-3 hover:bg-white/10 transition"
   >
     <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
     {/* Label hidden on the narrowest screens so the action row still fits. */}
     <span className="hidden md:inline text-sm text-white">Team</span>
   </button>
 )}

 {/* ORDERS — service bookings and hire projects, both sides of them.
     NOT product purchases: those are delivered the instant they're paid for and
     live in My Products with their bill and refund flow. What's here is work
     with a lifecycle, which is why the tooltip talks about hiring rather than
     buying — it used to say "what you've bought and sold", naming the one thing
     the page doesn't list.
     Sits in the top-level action row on purpose: a client who has just paid
     for something needs one obvious place to see what they paid for, and a
     creator needs the same for what they've been hired to do. Previously both
     were buried — service bookings four clicks inside Service Bookings, hire
     deals only inside their chat. */}
 <button
   type="button"
   onClick={() => navigate("/orders")}
   title="Orders — work you've hired for, and work you've been hired for"
   aria-label="Orders"
   className="relative flex items-center gap-1.5 rounded-full px-2 py-2 sm:px-3 hover:bg-white/10 transition"
 >
   <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
   {/* Label hidden on the narrowest screens so the action row still fits. */}
   <span className="hidden md:inline text-sm text-white">Orders</span>

   {ordersNeedingAction > 0 && (
     <span className="absolute -top-1 -right-1 bg-[#C084FC] text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 grid place-items-center rounded-full">
       {ordersNeedingAction > 9 ? "9+" : ordersNeedingAction}
     </span>
   )}
 </button>

 {/* CHAT */}
    <button
  onClick={handleChatClick}
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
<DropdownMenu
  /* Opening the panel IS reading them.

     The count only cleared if you spotted the small "Mark all as Read" link in
     the corner of the panel — so the badge sat there after you had looked at
     everything, and the only way to clear it was a second, separate action
     every single time. Seeing the list is the thing the badge was asking you to
     do; the link stays for the case where you want to clear it without opening
     anything.

     Guarded on the count so closing the panel, or opening it with nothing
     unread, doesn't fire a pointless round of requests. */
  onOpenChange={(open) => {
    if (open && realUnreadCount > 0) markAllAsRead();
  }}
>
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
                {n.promptId?.title || n.meta?.title || HEADER_NOTIF_TYPE_LABELS[n.type] || "Notification"}
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





  {/* CART — buyer mode.

      `|| cart.length > 0` is not a loophole, it's the point: hiding a cart with
      three things in it reads as the three things having been lost. A creator
      who filled a cart and then switched keeps seeing it until it's empty. */}
    {(shows("cart") || cart.length > 0) && (
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
    )}




          {/* Upload Product — creator mode only. The one control this whole
              toggle exists for: it is the loudest thing in the row, and most
              people never list anything. */}
          {shows("upload") && (
          <>
          <button
      type="button"
      onClick={handlePostPrompt}
      onMouseEnter={warmSellerData}
      onFocus={warmSellerData}
      className="hidden sm:inline-flex items-center gap-2 px-3 h-9 rounded-full text-black font-medium whitespace-nowrap"
      style={{ background: "#D9D9D9" }}
    >
      <span className="grid place-items-center w-5 h-5 rounded-full bg-black">
        <Plus className="w-3 h-3 text-white" strokeWidth={2.5} />
      </span>

      <span className="text-sm">Upload Product</span>
    </button>
    {/* MOBILE UPLOAD BUTTON */}
    <button
      onClick={handlePostPrompt}
      onTouchStart={warmSellerData}
      className="sm:hidden grid place-items-center w-9 h-9 rounded-full"
      style={{
        background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)"
      }}
    >
      <Plus className="w-4 h-4 text-white" />
    </button>
    </>
    )}

    {/* The toggle, immediately left of the avatar — the mode belongs to the
        account, so it reads as part of that cluster. Renders nothing for anyone
        with only one mode available (signed out, team members). */}
    <ModeToggle />

          {/* Profile dropdown — signed in only.

              While the session is still being restored (isReady === false) we
              render neither this nor the Log in button, so a returning user
              never sees "Log in" flash before their own avatar appears. */}
          {!isReady ? null : !isAuthenticated ? (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center px-4 h-9 rounded-full text-sm font-medium text-white whitespace-nowrap"
              style={{ background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)" }}
            >
              Log in
            </button>
          ) : (
           <DropdownMenu>
          <DropdownMenuTrigger asChild>
  <button
    type="button"
    aria-label="Account menu"
    title={fullName}
    className="group inline-flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#2C2C2C] text-white whitespace-nowrap"
  >

    {/* Avatar stands in for "Hello, <full name>", which pushed the header wide
        enough to crowd everything left of it — and grew with the name. Uploaded
        picture if there is one, initials if not. */}
    <span
      aria-hidden="true"
      className="shrink-0 grid place-items-center w-7 h-7 rounded-full overflow-hidden bg-[#3A3A3A] text-white text-[11px] font-semibold leading-none select-none"
      style={
        user?.plan === "pro"
          ? { boxShadow: "0 0 0 1.5px #FF14EF" }
          : user?.plan === "enterprise"
          ? { boxShadow: "0 0 0 1.5px #FACC15" }
          : undefined
      }
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="w-full h-full object-cover"
          // A broken/expired blob URL would otherwise leave an empty circle
          // with no hint of who is signed in.
          onError={() => setAvatarBroken(true)}
        />
      ) : (
        initials
      )}
    </span>

    {/* PLAN → hidden on mobile */}
    <div className="hidden sm:flex items-center gap-2">

      {/* PRO PLAN */}
      {user?.plan === "pro" && (
        <>
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
        <span className="px-2 py-0.5 text-xs rounded-md bg-gray-700 text-gray-300">
          FREE
        </span>
      )}

    </div>

    {/* DROPDOWN ICON → always visible */}
    <span className="shrink-0 grid place-items-center rounded-full bg-white/95 w-6 h-6">
      <ChevronDown className="w-3.5 h-3.5 text-black" />
    </span>

  </button>
</DropdownMenuTrigger>

  <DropdownMenuContent
    sideOffset={10}
    align="end"
    onCloseAutoFocus={(e) => e.preventDefault()}
    style={{
      width: 230,
      padding: 8,
      borderRadius: 16,
      background: "rgba(20,18,30,0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.10)",
      boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
      color: "#fff",
      fontFamily: "Inter, system-ui, sans-serif",
    }}
  >
    {/* Name + email.

        An email has no spaces, so there is nothing for the browser to break on:
        anything longer than this 230px card ran straight out the side of it and
        over the page. `overflowWrap: anywhere` breaks it mid-address onto a
        second line, which keeps it whole — this line exists so somebody can tell
        WHICH account they're in, and a truncated address often can't say. The
        name gets an ellipsis instead: it stays recognisable from its start, and
        `title` has the full one on hover. Same treatment as the landing page's
        copy of this menu in pages/Landing.tsx. */}
    <div style={{ padding: "8px 10px 12px", minWidth: 0 }}>
      <div
        title={displayName || "Your Name"}
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "#fff",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {displayName || "Your Name"}
      </div>
      <div
        title={displayEmail || ""}
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.55)",
          marginTop: 2,
          overflowWrap: "anywhere",
          lineHeight: 1.35,
        }}
      >
        {displayEmail || ""}
      </div>
    </div>

    {/* Primary items — with icons */}
    {[
      // "Set up profile" read like an unfinished chore even for someone whose
      // profile was long since complete. This is simply where your account
      // lives — public profile, freelancer sections and all.
      { label: "My Account", icon: User, onClick: goToMyProfile },

      // Only while there's something to DO. "Become a Freelancer" and "Finish
      // freelancer profile" are actions; "My freelancer profile" was not — once
      // the profile is ACTIVE it renders inside My Account and is edited there,
      // so a second entry pointing at the same place just made the menu look
      // like it had two profiles in it.
      ...(freelancerMenu.status === "ACTIVE" || !shows("freelancer")
        ? []
        : [{ label: freelancerMenu.label, icon: Briefcase, onClick: freelancerMenu.open }]),

      /* The mode switch, spelled out. The pill in the action row hides its
         labels below `lg` and vanishes entirely on a narrow screen, so this is
         where the switch actually lives for a phone. Named as the action rather
         than the state — "Switch to creator mode", not "Creator". */
      ...(MODE_UI_ENABLED && canUseCreatorMode
        ? [{
            label: mode === "creator" ? "Switch to buyer mode" : "Switch to creator mode",
            // Same pair as the pill in the action row — see ModeToggle.
            icon: mode === "creator" ? ShoppingBag : Store,
            onClick: () => setMode(mode === "creator" ? "buyer" : "creator"),
          }]
        : []),

      /* "My Wallet" sat here. Hidden for now, not deleted: money moves through
         Razorpay directly — a buyer pays on the checkout sheet and a seller's
         share is transferred to their linked account — so the wallet was a
         balance most people never needed to look at. `goToWallet` and the
         /wallet route are left intact, so restoring this is one line.
         See the note in Landing.tsx, which carries a second copy of this menu. */
      ...(shows("sellerDashboard")
        ? [{ label: "Dashboard", icon: LayoutDashboard, onClick: () => navigate("/self-dash") }]
        : []),

      /* One page, two sub-tabs, two names.
         This was a single "My Products" row pointing at `p=purchased` — so the
         label said products and the page showed purchases, and the uploaded
         half beside it had no entry at all. Calling both of them "My Products"
         would be worse than either: the same words for two different lists, and
         no way to know which one you were about to open.

         Written as an explicit either/or rather than two independent `shows`
         checks, because with the feature flag off both would report visible and
         the menu would carry two rows where it used to carry one — a "revert"
         that changed the menu is not a revert. */
      ...(!MODE_UI_ENABLED
        ? [{
            label: "My Products",
            icon: Package,
            onClick: () => navigate("/self-dash?tab=prompts&p=purchased"),
          }]
        : [
            /* Both, not one or the other. Creator mode showed only My Listings,
               which meant a creator who had bought something had nowhere to go
               and see it — see the note on SURFACE_MODE. Purchases are always
               here; listings appear once there is a selling half to look at. */
            {
              label: "My Purchases",
              icon: Package,
              onClick: () => navigate("/self-dash?tab=prompts&p=purchased"),
            },
            ...(shows("listings")
              ? [{
                  label: "My Listings",
                  icon: Package,
                  onClick: () => navigate("/self-dash?tab=prompts&p=uploaded"),
                }]
              : []),
          ]),

      // Took the action row's slot when the mode pill arrived — see the note
      // there. A destination, not a control you use in passing.
      ...(MODE_UI_ENABLED
        ? [{ label: "Saved", icon: Bookmark, onClick: goToSaved }]
        : []),

      /* Refer & Earn. Also in Landing.tsx's copy of this menu — the two are
         separate lists and drift the moment only one is edited. */
      { label: "Refer & Earn",   icon: Gift,            onClick: () => navigate("/refer") },
      ...(shows("feedback")
        ? [{ label: "My Feedback", icon: MessageCircle, onClick: () => navigate("/my-feedback") }]
        : []),
      // Sits next to My Feedback because it's the same kind of thing: a list of
      // requests you've made and what came of them.
      ...(shows("refunds")
        ? [{ label: "My Refunds", icon: ReceiptText, onClick: () => navigate("/my-refunds") }]
        : []),
    ].map(({ label, icon: Icon, onClick }) => (
      <button
        key={label}
        type="button"
        onClick={onClick}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 10px",
          borderRadius: 10,
          background: "transparent",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          fontSize: 14,
          textAlign: "left",
          transition: "background 0.18s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent"
        }}
      >
        <Icon size={16} />
        {label}
      </button>
    ))}

    <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "6px 4px" }} />

    {/* Secondary items — no icons */}
    {[
      { label: "Pricing",          onClick: () => navigate("/subscription") },
      { label: "Support",          onClick: () => navigate("/support") },
      // "Admin" used to sit here. It's now the labelled Team button in the
      // header's action row — see canManageTeam above.
    ].map(({ label, onClick }) => (
      <button
        key={label}
        type="button"
        onClick={onClick}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "9px 10px",
          borderRadius: 10,
          background: "transparent",
          border: "none",
          color: "rgba(255,255,255,0.85)",
          cursor: "pointer",
          fontSize: 14,
          transition: "background 0.18s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)"
          e.currentTarget.style.color = "#fff"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent"
          e.currentTarget.style.color = "rgba(255,255,255,0.85)"
        }}
      >
        {label}
      </button>
    ))}

    {/* Logout */}
    <button
      type="button"
      onClick={handleLogout}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 10px",
        marginTop: 4,
        borderRadius: 10,
        background: "transparent",
        border: "none",
        color: "#ff6b6b",
        cursor: "pointer",
        fontSize: 14,
        textAlign: "left",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,107,107,0.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <LogOut size={16} />
      Logout
    </button>
  </DropdownMenuContent>
</DropdownMenu>
          )}

        </div>
      

      {/* Modals */}
      <ApiKeyModal open={apiKeyModalOpen} onOpenChange={setApiKeyModalOpen} onSave={() => {}} />
      <SubscriptionModal open={subscriptionModalOpen} onOpenChange={setSubscriptionModalOpen} />
  <SellPromptModal
  open={sellOpen}
 onOpenChange={(v) => {
  setSellOpen(v);
  if (!v) {
    setScreenPermOpen(false); // ✅ Sell modal band hone par screen perm bhi band
  }
}}
  onPromptSubmitted={() => {}}
/>




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
   {/* Fixed height, so the body between the title and the totals is the only
       part that grows — that is what makes a ten-item cart scroll instead of
       pushing Checkout off the screen.

       `svh`, not `vh`: on a phone `vh` is measured against the viewport with the
       URL bar hidden, so a 90vh panel is taller than what you can actually see
       and the footer sits below the fold until you scroll the page itself. `svh`
       is the small-viewport height — the one that's always visible. */}
   <div
  className="relative text-white shadow-2xl flex flex-col overflow-hidden"
  style={{
    width: "min(96vw, 950px)",
    height: "min(90svh, 750px)",
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

      {/* Header. pr-12 leaves room for the close button, which is absolutely
          positioned over this row — without it a long count ran under it. */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4 pr-12 flex-shrink-0">
        <h2
          className="text-[17px] sm:text-[20px]"
          style={{ fontFamily: "Inter", fontWeight: 500 }}
        >
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

     {/* Cart Body — the only scrolling region. `min-h-0` is what makes that
         work: a flex child's default `min-height: auto` refuses to shrink below
         its content, so without it ten items would stretch the panel instead of
         scrolling inside it. */}
<div className="min-h-0 flex-1 overflow-y-auto px-3 sm:px-6 pb-2 space-y-3 sm:space-y-4">
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
      {/* ---------- TABLE HEADER (only shows when cart has items) ----------

          Hidden below sm: three columns of labels can't fit beside a thumbnail
          on a phone, and the rows there aren't a table anyway.

          Sticky, because it lives INSIDE the scrolling body — with a full cart
          it used to scroll away with the first item and the remaining nine had
          unlabelled columns. -top-px hides the seam the rounded corner leaves
          against the panel above it. */}
      <div
        className="hidden sm:grid sticky -top-px z-10 grid-cols-[minmax(0,1fr)_120px_80px] items-center gap-4 text-white/80 text-sm"
        style={{
          background: "#1C1C1C",
          height: 50,
          borderRadius: 8,
          width: "100%",
        }}
      >
        <span className="text-left pl-4">Product</span>
        <span className="text-center">Price</span>
        <span className="text-center">Remove</span>
      </div>

      {/* ---------- ITEMS ---------- */}
      {cart
        /* `item.tag` never existed on a CartItem, so that half of the test was
           always true and TypeScript said so. `price !== 0` is the free check. */
        .filter((item) => item.price !== 0)
        .map((item) => (
          /* Flex, not the header's three fixed columns.

             As a grid of `minmax(0,1fr) 120px 80px` with gap-4 and px-6 either
             side, 280px of a row was spoken for before the product got any: on a
             360px phone that left ~60px for a 64px thumbnail AND the title, so
             the cell overflowed and the title vanished. Here the product takes
             whatever is left after the price and the X, which is the right way
             round — and the two of those keep the header's widths from sm up, so
             the columns still line up on a desktop. */
          <div
            key={item.id}
            className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4"
            style={{
              background: "#17171A",
              width: "100%",
            }}
          >
            {/* Prompt info — the row's clickable half, opening the same details
                panel the marketplace uses.

                A <button> rather than an onClick on the row: Remove is itself a
                button and nesting one inside another is invalid HTML, and this
                way the destructive control is simply outside the hit area
                instead of relying on a stopPropagation that is easy to lose. */}
            <button
              type="button"
              onClick={() => openCartItemDetails(String(item.id))}
              aria-label={`View details for ${item.title}`}
              disabled={!!detailsLoadingId}
              className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 text-left rounded-md -m-1 p-1 transition hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/25 disabled:opacity-60"
            >
           <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden bg-black shrink-0">
  {item.videoUrl ? (
    <>
      <video
  src={
    item.videoUrl?.startsWith("http")
      ? item.videoUrl
      : `${(import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || ""}${item.videoUrl}`
  }
  className="w-full h-full object-cover"
  muted
  playsInline
  preload="metadata"
/>
      <div className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </>
 ) : item.imageUrl ? (
    <img
      src={
        item.imageUrl.startsWith("http")
          ? item.imageUrl
          : `${(import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || ""}${item.imageUrl}`
      }
      alt={item.title}
      className="w-full h-full object-cover"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
        const parent = (e.currentTarget as HTMLImageElement).parentElement;
        if (parent) parent.innerHTML =
          `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.4);font-size:10px;">No image</div>`;
      }}
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-white/40 text-[10px]">
      No media
    </div>
  )}
</div>
              <div className="min-w-0">
                {/* Hidden on a phone: it is the same fixed line on every row, so
                    it costs a line of height and tells the buyer nothing, while
                    the title it pushes around is the one thing they need. */}
                <p className="hidden sm:block text-xs text-white/60 truncate">
                  Create an engaging product description
                </p>
                <p className="text-sm sm:text-base text-white font-medium truncate">{item.title}</p>

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
            </button>

            {/* Price — the SELLER'S price, which is what the Subtotal below
                adds up.

                This showed `item.price`: list price plus Tokun's fee. So a ₹500
                product read ₹515 and a ₹100 one ₹103, and then the footer said
                Subtotal ₹600 — three numbers that don't reconcile, with the fee
                buried inside two of them and also itemised on its own line
                underneath. The rows now show 500 and 100, the subtotal is 600,
                and the fee is the one line that names it.

                Fixed width from sm up so it sits under the header's "Price"
                column; tabular-nums keeps the digits from shifting the column
                between rows. */}
            <span className="shrink-0 sm:w-[120px] text-right sm:text-center text-white text-sm sm:text-base tabular-nums">
              ₹{(item.listPrice ?? item.price ?? 0).toFixed(2)}
            </span>

            {/* Remove. h-9 w-9 rather than a bare icon: a 20px tap target is
                below what a thumb can hit reliably, and this one deletes
                something. */}
            <div className="shrink-0 sm:w-[80px] flex justify-end sm:justify-center">
              <button
                onClick={async () => {
                  await removeFromCart(item.id);
                }}
                aria-label={`Remove ${item.title} from cart`}
                className="grid place-items-center h-9 w-9 rounded-md text-red-400 hover:text-red-500 hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
    </>
  )}
</div>


      {/* Footer.

          flex-shrink-0 is what keeps the totals and Checkout on screen however
          many items are in the cart — the scrolling body above absorbs the rest.
          border-white/10, because border-black/10 is invisible on a #17171A
          panel. */}
 {cart.length > 0 && (
  <div className="flex-shrink-0 border-t border-white/10 p-4 sm:p-6 space-y-3">
    {/* Cart items carry `price` = what checkout charges (list price + Tokun's
        fee, the same figure shown on the marketplace card) and `listPrice` =
        the seller's own price. The fee is the DIFFERENCE between them.

        This used to sum `price` as the subtotal and then add another 5% on top,
        so a ₹100 prompt already displayed as ₹105 became ₹110.25 — the fee was
        counted twice. Deriving it instead of recomputing a hardcoded 5% also
        means the line stays correct if the commission rate ever changes. */}
    {(() => {
      const paid = cart.filter((i) => i.price !== 0);
      const charged = paid.reduce((sum, i) => sum + (i.price || 0), 0);
      const listTotal = paid.reduce((sum, i) => sum + (i.listPrice ?? i.price ?? 0), 0);
      const fee = Math.max(0, +(charged - listTotal).toFixed(2));

      /* The Refer & Earn welcome discount, as the SERVER worked it out for this
         cart (GET /api/cart → welcomeDiscount). Not computed here: the credit is
         capped and can never exceed Tokun's own cut on the order, so "5% of the
         total" is only sometimes the right number — and checkout applies the
         server's figure, so a locally-computed one would disagree with the
         amount actually charged.

         It was applied at /api/cart/checkout all along and never shown, so a
         buyer holding a credit saw the full total here and had no reason to
         think it counted on carts at all. */
      const discount = welcomeDiscount?.amount || 0;
      const dueNow = discount > 0 ? Math.max(0, +(charged - discount).toFixed(2)) : charged;

      return (
        <>
          <div className="space-y-2 text-sm text-white">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{listTotal.toFixed(2)}</span>
            </div>
            {fee > 0 && (
              <div className="flex justify-between">
                <span className="text-white/70">Platform fee</span>
                <span className="text-white/70">₹{fee.toFixed(2)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between" style={{ color: "#19E66C" }}>
                {/* Names the percentage as well as the amount: "you saved ₹15" on
                    its own doesn't tell the buyer their referral credit is what
                    did it, and they came here expecting to see it. */}
                <span>Referral discount ({welcomeDiscount?.percent}% off)</span>
                <span>− ₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-white/10 font-semibold">
              <span>Total</span>
              <span>₹{dueNow.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <p className="text-[11px] text-white/45 leading-relaxed">
                Your welcome credit comes off this payment. It's one credit for
                one order, so it's spent when this checkout completes.
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-end gap-4">
            {/* The old label here read "Month (inclusive of GST)" — leftover
                subscription copy on a one-off prompt cart, and it claimed a GST
                treatment this total doesn't apply. */}
            {/* Full width on a phone, where a right-aligned pill leaves the
                primary action of the screen sitting in a corner under the
                thumb's reach. */}
            <button
              onClick={handleCheckout}
              className="w-full sm:w-auto px-6 h-12 rounded-lg text-white"
              style={{
                background: "linear-gradient(270deg,#FF14EF 0%, #1A73E8 100%)",
                fontFamily: "Inter",
                fontWeight: 400,
              }}
            >
              Checkout ₹{dueNow.toFixed(2)}
            </button>
          </div>
        </>
      );
    })()}
  </div>
)}
    </div>
  </div>

)}

  </div>

    </header>

  

      {/* Cart review — the same dialog Buy Now opens, in cart mode. The figures
          are the server's (GET /api/cart), so this can't quote a total the
          checkout won't charge. */}
      <PurchaseConfirmModal
        open={confirmCartOpen}
        prompt={null}
        cart={{
          items: cart
            .filter((i) => i.price !== 0)
            .map((i) => ({
              id: i.id,
              title: i.title,
              listPrice: Number(i.listPrice ?? i.price ?? 0),
              imageUrl: i.imageUrl,
            })),
          listTotal: cart
            .filter((i) => i.price !== 0)
            .reduce((sum, i) => sum + Number(i.listPrice ?? i.price ?? 0), 0),
          platformFee: Math.max(
            0,
            +(
              cart.filter((i) => i.price !== 0).reduce((s, i) => s + Number(i.price || 0), 0) -
              cart
                .filter((i) => i.price !== 0)
                .reduce((s, i) => s + Number(i.listPrice ?? i.price ?? 0), 0)
            ).toFixed(2),
          ),
          discount: Number(welcomeDiscount?.amount || 0),
          discountPercent: welcomeDiscount?.percent,
          payable: Math.max(
            0,
            +(
              cart.filter((i) => i.price !== 0).reduce((s, i) => s + Number(i.price || 0), 0) -
              Number(welcomeDiscount?.amount || 0)
            ).toFixed(2),
          ),
        }}
        onClose={() => setConfirmCartOpen(false)}
        onConfirm={confirmCartCheckout}
      />

      {profileOpen && (
  <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] grid place-items-center">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      onClick={() => setProfileOpen(false)}
    />

    {/* Card */}
    <div
      className="relative w-[96vw] md:w-[min(96vw,900px)] max-h-[90vh] rounded-2xl text-white shadow-2xl overflow-hidden"
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
<div className="flex flex-col md:grid md:grid-cols-[240px,1fr] max-h-[90vh] overflow-hidden">

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
  className="no-scrollbar overflow-x-auto md:overflow-y-auto md:pt-5 flex md:flex-col flex-row"
  style={{ background: "#17171A", borderRight: "none", borderBottom: "1px solid #1C1C1C" }}
>
  {[ 
    { id: "profile", label: "Profile", Icon: User },
    { id: "bank", label: "Bank Account", Icon: Landmark },
    // { id: "invoices", label: "Invoices", Icon: FileText },
    { id: "billing", label: "Billing information", Icon: CreditCard },
  ].map((item) => {
    const active = profileTab === (item.id as typeof profileTab);
    return (
      <button
        key={item.id}
        onClick={() => setProfileTab(item.id as typeof profileTab)}
      className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-4 text-left whitespace-nowrap md:w-full shrink-0"
style={{
  background: active ? "#1C1C1C" : "transparent",
  color: active ? "#ffffff" : "rgba(255,255,255,0.78)",
  borderBottom: active ? "2px solid #FF14EF" : "2px solid transparent",
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
  value={displayName || ""}
  className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white/80 placeholder-white/40 outline-none focus:ring-2 focus:ring-white/10"
  placeholder="Your name"
/>
              </div>

              <div>
                <label className="block mb-2 text-white/80 text-sm">Email</label>
              <input
  disabled
  value={displayEmail || ""}
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
  {bankFormToast && (
  <div
    className="sticky top-0 z-20 mb-4 rounded-xl border px-4 py-3 shadow-lg"
    style={{
      background: bankFormToast.type === "success" ? "#13261B" : "#2A1717",
      borderColor:
        bankFormToast.type === "success"
          ? "rgba(34,197,94,0.35)"
          : "rgba(239,68,68,0.35)",
    }}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-sm font-semibold text-white">{bankFormToast.title}</div>
        <div className="text-xs text-white/80 mt-1">{bankFormToast.message}</div>
      </div>

      <button
        type="button"
        onClick={() => setBankFormToast(null)}
        className="grid place-items-center rounded-full bg-black/25 hover:bg-black/40 transition h-7 w-7 shrink-0"
      >
        <X className="w-4 h-4 text-white/85" />
      </button>
    </div>
  </div>
)}
  
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
  onChange={(e) =>
    setBankForm((p) => ({ ...p, holder: onlyLetters(e.target.value) }))
  }
  inputMode="text"
  autoComplete="name"
  className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
  placeholder="Enter account holder name"
/>
        </div>

        <div>
          <label className="block mb-2 text-white/80 text-sm">Account number</label>
          <input
  value={bankForm.accNum}
  onChange={(e) =>
    setBankForm((p) => ({ ...p, accNum: onlyDigits(e.target.value) }))
  }
  inputMode="numeric"
  pattern="[0-9]*"
  autoComplete="off"
  className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
  placeholder="Enter account number"
/>
        </div>

        <div>
          <label className="block mb-2 text-white/80 text-sm">Confirm account number</label>
         <input
  value={bankForm.confirmAccNum}
  onChange={(e) =>
    setBankForm((p) => ({ ...p, confirmAccNum: onlyDigits(e.target.value) }))
  }
  inputMode="numeric"
  pattern="[0-9]*"
  autoComplete="off"
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
          { item: "Premium e-commerce\ncopy product", date: "Sep 16, 2025" },
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

{/* KycGateModal removed — nothing opens it any more. It gated "buying prompts"
    behind identity KYC, which the Route linked-account flow replaced for
    sellers and which buyers never needed. */}

{token && (
  <SellerLinkedAccountForm
    open={sellerFormOpen}
    onClose={() => setSellerFormOpen(false)}
    token={token}
    apiBase={API_BASE}
    onSubmitted={() => {
      setSellerFormOpen(false);
      setSellOpen(true);
    }}
  />
)}

{/* Become-a-Freelancer wizard + its payout dialog. Rendered here, at the
    component root, because the account dropdown unmounts its own contents on
    close — a wizard inside the menu would disappear the moment it opened. */}
{freelancerMenu.modals}

{screenPermOpen && (
  <ScreenRecordPermissionModal
    open={screenPermOpen}
    onGranted={() => {

      setSellOpen(true);
    }}
    onSkip={() => {
      console.log("[Debug] onSkip called");
      setScreenPermOpen(false);
      // Skip pe sell modal bhi nahi kholna
    }}
    onUploadDone={() => {
      console.log("[Debug] onUploadDone called");
      setScreenPermOpen(false);
    }}
    userId={user?._id || user?.id}
    userName={user?.name || ""}
    userEmail={user?.email || ""}
    token={token}
  />
)}

{/* Details for a product opened from the cart.

    Closing it puts the buyer back in the cart they came from rather than on
    whatever page is behind — the cart is mid-task, and dropping them out of it
    would mean re-opening and re-finding their place.

    Buy Now hands off to the marketplace instead of starting a payment here: the
    cart's own Checkout is the paid path in this component, and a second one
    running beside it is two ways to be charged for the same row. */}
<DetailsPrompt
  open={detailsOpen}
  onOpenChange={(next) => {
    setDetailsOpen(next);
    if (!next) {
      setDetailsPrompt(null);
      setCartOpen(true);
    }
  }}
  prompt={detailsPrompt}
  onPurchase={(p) => {
    setDetailsOpen(false);
    setDetailsPrompt(null);
    navigate(`/prompt-marketplace?prompt=${encodeURIComponent(String(p.id))}`);
  }}
/>






</>
  );
};

export default Header;
