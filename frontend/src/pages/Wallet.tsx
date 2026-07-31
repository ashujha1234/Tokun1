// // // import { useEffect, useMemo, useState, type CSSProperties } from "react";
// // // import Header from "@/components/Header";
// // // import Footer from "@/components/Footer";
// // // import { Landmark, ChevronDown, X, Check, Trash } from "lucide-react";
// // // import { useAuth } from "@/contexts/AuthContext";
// // // import { useNavigate } from "react-router-dom";

// // // type WalletAccount = {
// // //   id: string;
// // //   name: string;
// // //   last4: string;
// // //   ifsc?: string;
// // //   isDefault?: boolean;
// // //   iconBg: string;
// // //   iconColor: string;
// // // };

// // // type BankForm = {
// // //   holder: string;
// // //   accNum: string;
// // //   confirmAccNum: string;
// // //   ifsc: string;
// // //   bankName: string;
// // // };

// // // const Wallet = () => {
// // //   const { token, user } = useAuth() as any;
// // //   const navigate = useNavigate();

// // //   const fontBase = "Inter, system-ui, Arial, sans-serif";
// // //   const API_BASE =
// // //     (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";

// // //   const BANK_ADD_URL = API_BASE
// // //     ? `${API_BASE}/api/bankaccount/add`
// // //     : "/api/bankaccount/add";

// // //   const BANK_LIST_URL = API_BASE
// // //     ? `${API_BASE}/api/bankaccount`
// // //     : "/api/bankaccount";

// // //   const BANK_DELETE_URL = (accountId: string) =>
// // //     API_BASE
// // //       ? `${API_BASE}/api/bankaccount/${accountId}`
// // //       : `/api/bankaccount/${accountId}`;

// // //   const userStorageId = user?._id || user?.id || user?.email || "guest";

// // //   const WALLET_ACCOUNTS_KEY = useMemo(
// // //     () => `tokun_wallet_accounts_${userStorageId}`,
// // //     [userStorageId]
// // //   );

// // //   const [accounts, setAccounts] = useState<WalletAccount[]>([]);
// // //   const [accountsLoaded, setAccountsLoaded] = useState(false);

// // //   const [addBankOpen, setAddBankOpen] = useState(false);
// // //   const [saveLoading, setSaveLoading] = useState(false);
// // //   const [successPopupOpen, setSuccessPopupOpen] = useState(false);
// // //   const [formError, setFormError] = useState("");
// // //   const [latestAddedAccount, setLatestAddedAccount] =
// // //     useState<WalletAccount | null>(null);

// // //   const [manageMode, setManageMode] = useState(false);
// // //   const [deletingAccountId, setDeletingAccountId] = useState<string | null>(
// // //     null
// // //   );
// // //   const [deleteError, setDeleteError] = useState("");

// // //   const [bankForm, setBankForm] = useState<BankForm>({
// // //     holder: "",
// // //     accNum: "",
// // //     confirmAccNum: "",
// // //     ifsc: "",
// // //     bankName: "",
// // //   });

// // //   const history = [
// // //     {
// // //       date: "May 12, 2024",
// // //       description: "Project Payment: Alpha Engine",
// // //       status: "Completed",
// // //       amount: "-₹12,400.00",
// // //       amountClass: "text-white",
// // //       statusClass: "text-[#C084FC]",
// // //     },
// // //     {
// // //       date: "May 10, 2024",
// // //       description: "Deposit: Chase Bank",
// // //       status: "Completed",
// // //       amount: "+₹50,000.00",
// // //       amountClass: "text-[#4ADE80]",
// // //       statusClass: "text-[#4ADE80]",
// // //     },
// // //     {
// // //       date: "May 08, 2024",
// // //       description: "Withdrawal: Internal",
// // //       status: "Pending",
// // //       amount: "-₹5,000.00",
// // //       amountClass: "text-white",
// // //       statusClass: "text-white/35",
// // //     },
// // //     {
// // //       date: "May 05, 2024",
// // //       description: "Prompt Purchased",
// // //       status: "Completed",
// // //       amount: "-₹8,000.00",
// // //       amountClass: "text-white",
// // //       statusClass: "text-[#C084FC]",
// // //     },
// // //   ];

// // //   const buttonTextStyle: CSSProperties = {
// // //     fontFamily: fontBase,
// // //     fontWeight: 700,
// // //     fontStyle: "normal",
// // //     fontSize: 16,
// // //     lineHeight: "24px",
// // //     letterSpacing: 0,
// // //     textAlign: "center",
// // //   };

// // //   const tableDateValueStyle: CSSProperties = {
// // //     fontFamily: fontBase,
// // //     fontWeight: 500,
// // //     fontStyle: "normal",
// // //     fontSize: 14,
// // //     lineHeight: "20px",
// // //     letterSpacing: 0,
// // //   };

// // //   const tableDescriptionValueStyle: CSSProperties = {
// // //     fontFamily: fontBase,
// // //     fontWeight: 700,
// // //     fontStyle: "normal",
// // //     fontSize: 14,
// // //     lineHeight: "20px",
// // //     letterSpacing: 0,
// // //   };

// // //   const tableStatusValueStyle: CSSProperties = {
// // //     fontFamily: fontBase,
// // //     fontWeight: 700,
// // //     fontStyle: "normal",
// // //     fontSize: 14,
// // //     lineHeight: "20px",
// // //     letterSpacing: 0,
// // //   };

// // //   const tableAmountValueStyle: CSSProperties = {
// // //     fontFamily: fontBase,
// // //     fontWeight: 900,
// // //     fontStyle: "normal",
// // //     fontSize: 16,
// // //     lineHeight: "100%",
// // //     letterSpacing: 0,
// // //     textAlign: "right",
// // //   };

// // //   const plusMaskStyle = (size: number, color: string): CSSProperties => ({
// // //     width: size,
// // //     height: size,
// // //     opacity: 1,
// // //     display: "inline-block",
// // //     flexShrink: 0,
// // //     backgroundColor: color,
// // //     WebkitMask: "url('/icons/pluss.svg') center / contain no-repeat",
// // //     mask: "url('/icons/pluss.svg') center / contain no-repeat",
// // //   });

// // //   const makeId = () => {
// // //     if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
// // //       return crypto.randomUUID();
// // //     }

// // //     return `wallet-${Date.now()}-${Math.random().toString(16).slice(2)}`;
// // //   };

// // //   const getAuthToken = () =>
// // //     token ||
// // //     localStorage.getItem("auth_token") ||
// // //     sessionStorage.getItem("auth_token") ||
// // //     localStorage.getItem("token") ||
// // //     sessionStorage.getItem("token") ||
// // //     "";

// // //   const onlyLetters = (value: string) =>
// // //     value
// // //       .replace(/[^A-Za-z\s]/g, "")
// // //       .replace(/\s{2,}/g, " ")
// // //       .replace(/^\s+/, "");

// // //   const onlyDigits = (value: string) => value.replace(/\D/g, "").slice(0, 18);

// // //   const resetBankForm = () => {
// // //     setBankForm({
// // //       holder: "",
// // //       accNum: "",
// // //       confirmAccNum: "",
// // //       ifsc: "",
// // //       bankName: "",
// // //     });
// // //     setFormError("");
// // //   };

// // //   const mapApiAccount = (ba: any): WalletAccount => ({
// // //     id: String(ba?._id || makeId()),
// // //     name: String(ba?.bankName || "Bank Account"),
// // //     last4: String(ba?.accountNumber || "").slice(-4) || "0000",
// // //     ifsc: String(ba?.ifscCode || "").toUpperCase(),
// // //     isDefault: !!ba?.default,
// // //     iconBg: "bg-[#1A73E8]/25",
// // //     iconColor: "text-[#1A73E8]",
// // //   });

// // //   const makeLocalAccount = (
// // //     bankName: string,
// // //     accNum: string,
// // //     ifsc: string
// // //   ): WalletAccount => ({
// // //     id: makeId(),
// // //     name: bankName,
// // //     last4: accNum.slice(-4),
// // //     ifsc,
// // //     isDefault: accounts.length === 0,
// // //     iconBg: "bg-[#1A73E8]/25",
// // //     iconColor: "text-[#1A73E8]",
// // //   });

// // //   const fetchBankAccounts = async () => {
// // //     const authToken = getAuthToken();

// // //     if (!authToken) return;

// // //     try {
// // //       const res = await fetch(BANK_LIST_URL, {
// // //         method: "GET",
// // //         headers: { Authorization: `Bearer ${authToken}` },
// // //         credentials: "include",
// // //       });

// // //       const data = await res.json().catch(() => ({}));

// // //       if (!res.ok || !Array.isArray(data?.accounts)) return;

// // //       const mapped = data.accounts.map(mapApiAccount);

// // //       setAccounts(mapped);
// // //       localStorage.setItem(WALLET_ACCOUNTS_KEY, JSON.stringify(mapped));
// // //     } catch {
// // //       // Keep local/user-specific saved accounts if API is temporarily unavailable.
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     setAccountsLoaded(false);

// // //     try {
// // //       const raw = localStorage.getItem(WALLET_ACCOUNTS_KEY);

// // //       if (raw) {
// // //         const parsed = JSON.parse(raw);
// // //         setAccounts(Array.isArray(parsed) ? parsed : []);
// // //       } else {
// // //         setAccounts([]);
// // //       }
// // //     } catch {
// // //       setAccounts([]);
// // //     } finally {
// // //       setAccountsLoaded(true);
// // //     }
// // //   }, [WALLET_ACCOUNTS_KEY]);

// // //   useEffect(() => {
// // //     fetchBankAccounts();
// // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // //   }, [token, WALLET_ACCOUNTS_KEY]);

// // //   useEffect(() => {
// // //     if (!accountsLoaded) return;
// // //     localStorage.setItem(WALLET_ACCOUNTS_KEY, JSON.stringify(accounts));
// // //   }, [accountsLoaded, WALLET_ACCOUNTS_KEY, accounts]);

// // //   useEffect(() => {
// // //     if (accounts.length === 0) {
// // //       setManageMode(false);
// // //     }
// // //   }, [accounts.length]);

// // //   const handleDeleteAccount = async (accountId: string) => {
// // //     setDeleteError("");
// // //     setDeletingAccountId(accountId);

// // //     const authToken = getAuthToken();

// // //     try {
// // //       if (authToken) {
// // //         const res = await fetch(BANK_DELETE_URL(accountId), {
// // //           method: "DELETE",
// // //           headers: {
// // //             Authorization: `Bearer ${authToken}`,
// // //           },
// // //           credentials: "include",
// // //         });

// // //         const data = await res.json().catch(() => ({}));

// // //         if (!res.ok && res.status !== 404) {
// // //           const message =
// // //             data?.error === "account_not_found"
// // //               ? "Bank account not found."
// // //               : data?.error === "server_error"
// // //               ? "Server error while deleting bank account."
// // //               : "Could not delete bank account.";

// // //           throw new Error(message);
// // //         }
// // //       }

// // //       setAccounts((prev) => prev.filter((account) => account.id !== accountId));

// // //       if (latestAddedAccount?.id === accountId) {
// // //         setLatestAddedAccount(null);
// // //       }
// // //     } catch (err: any) {
// // //       setDeleteError(err?.message || "Could not delete bank account.");
// // //     } finally {
// // //       setDeletingAccountId(null);
// // //     }
// // //   };

// // //   const handleSaveBank = async () => {
// // //     const holder = bankForm.holder.trim();
// // //     const accNum = bankForm.accNum.trim();
// // //     const confirmAccNum = bankForm.confirmAccNum.trim();
// // //     const ifsc = bankForm.ifsc.trim().toUpperCase();
// // //     const bankName = bankForm.bankName.trim();

// // //     setFormError("");

// // //     if (!holder || !accNum || !confirmAccNum || !ifsc || !bankName) {
// // //       setFormError("Please fill out all fields.");
// // //       return;
// // //     }

// // //     if (accNum !== confirmAccNum) {
// // //       setFormError("Account numbers do not match.");
// // //       return;
// // //     }

// // //     setSaveLoading(true);

// // //     const authToken = getAuthToken();

// // //     const headers: Record<string, string> = {
// // //       "Content-Type": "application/json",
// // //     };

// // //     if (authToken) headers.Authorization = `Bearer ${authToken}`;

// // //     const body = {
// // //       accountHolderName: holder,
// // //       accountNumber: accNum,
// // //       confirmAccountNumber: confirmAccNum,
// // //       ifscCode: ifsc,
// // //       bankName,
// // //       default: accounts.length === 0,
// // //     };

// // //     try {
// // //       let newAccount: WalletAccount | null = null;

// // //       try {
// // //         const res = await fetch(BANK_ADD_URL, {
// // //           method: "POST",
// // //           headers,
// // //           body: JSON.stringify(body),
// // //           credentials: "include",
// // //         });

// // //         const data = await res.json().catch(() => ({}));

// // //         if (!res.ok) {
// // //           const code = data?.error || `http_${res.status}`;

// // //           const message =
// // //             code === "all_fields_required"
// // //               ? "Please fill out all fields."
// // //               : code === "account_numbers_mismatch"
// // //               ? "Account numbers do not match."
// // //               : code === "account_already_exists"
// // //               ? "This bank account is already saved."
// // //               : "Could not add bank account.";

// // //           throw new Error(message);
// // //         }

// // //         newAccount = data?.bankAccount
// // //           ? mapApiAccount(data.bankAccount)
// // //           : makeLocalAccount(bankName, accNum, ifsc);
// // //       } catch (apiErr: any) {
// // //         if (authToken) throw apiErr;

// // //         newAccount = makeLocalAccount(bankName, accNum, ifsc);
// // //       }

// // //       setAccounts((prev) => {
// // //         const withoutDuplicate = prev.filter(
// // //           (acc) =>
// // //             !(acc.name === newAccount!.name && acc.last4 === newAccount!.last4)
// // //         );

// // //         return [...withoutDuplicate, newAccount!];
// // //       });

// // //       setLatestAddedAccount(newAccount);
// // //       setAddBankOpen(false);
// // //       resetBankForm();
// // //       setSuccessPopupOpen(true);
// // //     } catch (err: any) {
// // //       setFormError(err?.message || "Could not add bank account.");
// // //     } finally {
// // //       setSaveLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
// // //       <div
// // //         aria-hidden
// // //         className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
// // //       >
// // //         <img
// // //           src="/icons/mpbg.png"
// // //           alt="background"
// // //           className="absolute inset-0 w-full h-screen object-contain object-top select-none"
// // //         />
// // //       </div>

// // //       <div className="relative z-20 w-full bg-transparent px-4">
// // //         <Header />
// // //       </div>

// // //       <main className="relative z-10 px-4 pt-[130px] pb-20">
// // //         <section
// // //           className="mx-auto overflow-hidden"
// // //           style={{
// // //             width: "min(1024px, 100%)",
// // //             minHeight: 1124,
// // //             borderRadius: 30,
// // //             background: "#21212180",
// // //             backdropFilter: "blur(20px)",
// // //             WebkitBackdropFilter: "blur(20px)",
// // //             fontFamily: fontBase,
// // //           }}
// // //         >
// // //           <div className="p-8 sm:p-[50px]">
// // //             <div>
// // //               <h1
// // //                 className="text-white"
// // //                 style={{
// // //                   fontFamily: fontBase,
// // //                   fontWeight: 700,
// // //                   fontStyle: "normal",
// // //                   fontSize: 36,
// // //                   lineHeight: "100%",
// // //                   letterSpacing: 0,
// // //                 }}
// // //               >
// // //                 My Wallet
// // //               </h1>

// // //               <p
// // //                 className="mt-4 max-w-[600px]"
// // //                 style={{
// // //                   fontFamily: fontBase,
// // //                   fontWeight: 400,
// // //                   fontStyle: "normal",
// // //                   fontSize: 16,
// // //                   lineHeight: "24px",
// // //                   letterSpacing: 0,
// // //                   color: "#A1A1AA",
// // //                 }}
// // //               >
// // //                 Track your revenue and manage your withdrawals in one clean,
// // //                 centralized view.
// // //               </p>
// // //             </div>

// // //             <div className="mt-7 grid grid-cols-1 lg:grid-cols-[1fr_294px] gap-5">
// // //               <div
// // //                 className="relative overflow-hidden border border-white/10"
// // //                 style={{
// // //                   minHeight: 379,
// // //                   borderRadius: 28,
// // //                   background: "rgba(23,23,26,0.56)",
// // //                 }}
// // //               >
// // //                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />

// // //                 <div className="relative z-10 p-8">
// // //                   <p
// // //                     style={{
// // //                       fontFamily: fontBase,
// // //                       fontWeight: 600,
// // //                       fontStyle: "normal",
// // //                       fontSize: 12,
// // //                       lineHeight: "12px",
// // //                       letterSpacing: "1.2px",
// // //                       color: "#C084FC",
// // //                       textTransform: "uppercase",
// // //                     }}
// // //                   >
// // //                     Available to Withdraw
// // //                   </p>

// // //                   <h2
// // //                     className="mt-5 text-white"
// // //                     style={{
// // //                       fontFamily: fontBase,
// // //                       fontWeight: 900,
// // //                       fontStyle: "normal",
// // //                       fontSize: 60,
// // //                       lineHeight: "60px",
// // //                       letterSpacing: 0,
// // //                     }}
// // //                   >
// // //                     ₹ 42,850
// // //                   </h2>

// // //                   <div className="mt-12 flex flex-wrap items-center gap-4">
// // //                    <button
// // //   type="button"
// // //   onClick={() => navigate("/add-funds")}
// // //   className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[10px] px-7 text-white"
// // //   style={{
// // //     ...buttonTextStyle,
// // //     background: "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)",
// // //   }}
// // // >
// // //   <span aria-hidden style={plusMaskStyle(10.5, "#FFFFFF")} />
// // //   Add
// // // </button>

// // //                     <button
// // //                       type="button"
// // //                       onClick={() => navigate("/withdraw")}
// // //                       className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[10px] border border-white/15 bg-white/10 px-7 text-white"
// // //                       style={buttonTextStyle}
// // //                     >
// // //                       <img
// // //                         src="/icons/with.svg"
// // //                         alt=""
// // //                         style={{
// // //                           width: 13.5,
// // //                           height: 13.5,
// // //                           opacity: 1,
// // //                         }}
// // //                         onError={(e) => {
// // //                           e.currentTarget.style.display = "none";
// // //                         }}
// // //                       />
// // //                       Withdraw
// // //                     </button>
// // //                   </div>

// // //                   <div className="mt-12 h-px w-full bg-white/10" />

// // //                   <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
// // //                     <div>
// // //                       <p
// // //                         style={{
// // //                           fontFamily: fontBase,
// // //                           fontWeight: 400,
// // //                           fontStyle: "normal",
// // //                           fontSize: 14,
// // //                           lineHeight: "100%",
// // //                           color: "rgba(255,255,255,0.35)",
// // //                         }}
// // //                       >
// // //                         Total Earning
// // //                       </p>

// // //                       <p
// // //                         className="mt-3"
// // //                         style={{
// // //                           fontFamily: fontBase,
// // //                           fontWeight: 700,
// // //                           fontStyle: "normal",
// // //                           fontSize: 24,
// // //                           lineHeight: "100%",
// // //                           letterSpacing: 0,
// // //                           color: "#FFFFFF",
// // //                         }}
// // //                       >
// // //                         ₹198,200
// // //                       </p>
// // //                     </div>

// // //                     <div>
// // //                       <p
// // //                         style={{
// // //                           fontFamily: fontBase,
// // //                           fontWeight: 400,
// // //                           fontStyle: "normal",
// // //                           fontSize: 14,
// // //                           lineHeight: "100%",
// // //                           color: "rgba(255,255,255,0.35)",
// // //                         }}
// // //                       >
// // //                         Monthly Earnings
// // //                       </p>

// // //                       <p
// // //                         className="mt-3"
// // //                         style={{
// // //                           fontFamily: fontBase,
// // //                           fontWeight: 700,
// // //                           fontStyle: "normal",
// // //                           fontSize: 24,
// // //                           lineHeight: "100%",
// // //                           letterSpacing: 0,
// // //                           color: "#ADC6FF",
// // //                         }}
// // //                       >
// // //                         ₹24,650
// // //                       </p>
// // //                     </div>
// // //                   </div>
// // //                 </div>
// // //               </div>

// // //               <div
// // //                 className="relative overflow-hidden border border-white/10"
// // //                 style={{
// // //                   minHeight: 379,
// // //                   borderRadius: 28,
// // //                   background: "rgba(23,23,26,0.56)",
// // //                 }}
// // //               >
// // //                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(255,20,239,0.14),transparent_55%)]" />

// // //                 <div className="relative z-10 p-8">
// // //                   <div className="flex items-center justify-between">
// // //                     <h3
// // //                       className="text-white"
// // //                       style={{
// // //                         fontFamily: fontBase,
// // //                         fontWeight: 700,
// // //                         fontStyle: "normal",
// // //                         fontSize: 18,
// // //                         lineHeight: "100%",
// // //                         letterSpacing: 0,
// // //                       }}
// // //                     >
// // //                       Accounts
// // //                     </h3>

// // //                     <button
// // //                       type="button"
// // //                       onClick={() => {
// // //                         setDeleteError("");
// // //                         setManageMode(true);
// // //                       }}
// // //                       disabled={accounts.length === 0}
// // //                       style={{
// // //                         fontFamily: fontBase,
// // //                         fontWeight: 700,
// // //                         fontStyle: "normal",
// // //                         fontSize: 14,
// // //                         lineHeight: "100%",
// // //                         color:
// // //                           accounts.length === 0
// // //                             ? "rgba(255,255,255,0.35)"
// // //                             : "#C084FC",
// // //                         cursor: accounts.length === 0 ? "not-allowed" : "pointer",
// // //                       }}
// // //                     >
// // //                       Manage
// // //                     </button>
// // //                   </div>

// // //                   <div className="mt-7 space-y-3">
// // //                     {deleteError && (
// // //                       <div
// // //                         className="rounded-[10px] border px-3 py-2 text-xs text-white"
// // //                         style={{
// // //                           background: "#2A1717",
// // //                           borderColor: "rgba(239,68,68,0.35)",
// // //                         }}
// // //                       >
// // //                         {deleteError}
// // //                       </div>
// // //                     )}

// // //                     {accounts.length === 0 ? (
// // //                       <div className="rounded-[10px] border border-white/5 bg-white/[0.04] px-4 py-5 text-sm text-white/50">
// // //                         No bank accounts added yet
// // //                       </div>
// // //                     ) : (
// // //                       accounts.map((account) => {
// // //                         const isDeleting = deletingAccountId === account.id;

// // //                         return (
// // //                           <div
// // //                             key={account.id}
// // //                             className="relative overflow-hidden rounded-[10px]"
// // //                           >
// // //                             <div
// // //                               className="flex h-[70px] items-center gap-4 rounded-[10px] border border-white/5 bg-white/[0.06] px-4"
// // //                               style={{
// // //                                 paddingRight: manageMode ? 54 : 16,
// // //                                 transition: "padding-right 220ms ease",
// // //                               }}
// // //                             >
// // //                               <div
// // //                                 className={`grid h-9 w-9 place-items-center rounded-full ${account.iconBg}`}
// // //                               >
// // //                                 <Landmark
// // //                                   className={`h-5 w-5 ${account.iconColor}`}
// // //                                 />
// // //                               </div>

// // //                               <div className="min-w-0">
// // //                                 <p
// // //                                   className="truncate text-white"
// // //                                   style={{
// // //                                     fontFamily: fontBase,
// // //                                     fontWeight: 700,
// // //                                     fontStyle: "normal",
// // //                                     fontSize: 14,
// // //                                     lineHeight: "100%",
// // //                                     letterSpacing: 0,
// // //                                   }}
// // //                                 >
// // //                                   {account.name}
// // //                                 </p>

// // //                                 <p
// // //                                   className="mt-2"
// // //                                   style={{
// // //                                     fontFamily: fontBase,
// // //                                     fontWeight: 400,
// // //                                     fontStyle: "normal",
// // //                                     fontSize: 10,
// // //                                     lineHeight: "100%",
// // //                                     color: "rgba(255,255,255,0.35)",
// // //                                   }}
// // //                                 >
// // //                                   •••• {account.last4}
// // //                                 </p>
// // //                               </div>
// // //                             </div>

// // //                             <button
// // //                               type="button"
// // //                               aria-label={`Delete ${account.name}`}
// // //                               disabled={!manageMode || isDeleting}
// // //                               onClick={() => handleDeleteAccount(account.id)}
// // //                               className="absolute grid h-9 w-9 place-items-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-60"
// // //                               style={{
// // //                                 top: "50%",
// // //                                 right: 10,
// // //                                 opacity: manageMode ? 1 : 0,
// // //                                 pointerEvents: manageMode ? "auto" : "none",
// // //                                 transform: manageMode
// // //                                   ? "translateY(-50%) translateX(0)"
// // //                                   : "translateY(-50%) translateX(24px)",
// // //                                 transition:
// // //                                   "opacity 220ms ease, transform 220ms ease, background 180ms ease",
// // //                               }}
// // //                             >
// // //                               <Trash className="h-4 w-4" />
// // //                             </button>
// // //                           </div>
// // //                         );
// // //                       })
// // //                     )}
// // //                   </div>

// // //                   {manageMode ? (
// // //                     <button
// // //                       type="button"
// // //                       onClick={() => {
// // //                         setManageMode(false);
// // //                         setDeleteError("");
// // //                       }}
// // //                       className={`${
// // //                         accounts.length === 0 ? "mt-7" : "mt-20"
// // //                       } flex h-[38px] w-full items-center justify-center rounded-[8px]`}
// // //                       style={{
// // //                         background:
// // //                           "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)",
// // //                         border: "none",
// // //                         fontFamily: fontBase,
// // //                         fontWeight: 700,
// // //                         fontStyle: "normal",
// // //                         fontSize: 12,
// // //                         lineHeight: "100%",
// // //                         letterSpacing: 0,
// // //                         textAlign: "center",
// // //                         color: "#FFFFFF",
// // //                       }}
// // //                     >
// // //                       Done
// // //                     </button>
// // //                   ) : (
// // //                     <button
// // //                       type="button"
// // //                       onClick={() => {
// // //                         resetBankForm();
// // //                         setAddBankOpen(true);
// // //                       }}
// // //                       className={`${
// // //                         accounts.length === 0 ? "mt-7" : "mt-20"
// // //                       } flex h-[38px] w-full items-center justify-center gap-2 rounded-[8px]`}
// // //                       style={{
// // //                         background: "#FFFFFF0D",
// // //                         border: "1px solid #FFFFFF33",
// // //                         fontFamily: fontBase,
// // //                         fontWeight: 700,
// // //                         fontStyle: "normal",
// // //                         fontSize: 12,
// // //                         lineHeight: "100%",
// // //                         letterSpacing: 0,
// // //                         textAlign: "center",
// // //                         color: "#A1A1AA",
// // //                       }}
// // //                     >
// // //                       <span aria-hidden style={plusMaskStyle(7, "#A1A1AA")} />
// // //                       Add Card
// // //                     </button>
// // //                   )}
// // //                 </div>
// // //               </div>
// // //             </div>

// // //             <div
// // //               className="mt-5 overflow-hidden border border-white/10"
// // //               style={{
// // //                 borderRadius: 28,
// // //                 background: "rgba(23,23,26,0.56)",
// // //               }}
// // //             >
// // //               <div className="relative">
// // //                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(255,20,239,0.22),transparent_45%)]" />

// // //                 <div className="relative z-10">
// // //                   <div className="flex flex-col gap-5 border-b border-white/10 p-8 sm:flex-row sm:items-center sm:justify-between">
// // //                     <div>
// // //                       <h3
// // //                         className="text-white"
// // //                         style={{
// // //                           fontFamily: fontBase,
// // //                           fontWeight: 700,
// // //                           fontStyle: "normal",
// // //                           fontSize: 20,
// // //                           lineHeight: "100%",
// // //                         }}
// // //                       >
// // //                         Payment History
// // //                       </h3>

// // //                       <p
// // //                         className="mt-3"
// // //                         style={{
// // //                           fontFamily: fontBase,
// // //                           fontWeight: 400,
// // //                           fontStyle: "normal",
// // //                           fontSize: 14,
// // //                           lineHeight: "100%",
// // //                           color: "rgba(255,255,255,0.35)",
// // //                         }}
// // //                       >
// // //                         Track all earnings and withdrawals
// // //                       </p>
// // //                     </div>

// // //                     <div className="flex items-center gap-4">
// // //                       <button
// // //                         type="button"
// // //                         className="flex h-[34px] items-center gap-4 rounded-[7px] bg-black px-4 text-white"
// // //                         style={{
// // //                           fontFamily: fontBase,
// // //                           fontWeight: 700,
// // //                           fontStyle: "normal",
// // //                           fontSize: 13,
// // //                           lineHeight: "100%",
// // //                         }}
// // //                       >
// // //                         May 2024
// // //                         <ChevronDown className="h-4 w-4" />
// // //                       </button>

// // //                       <button
// // //                         type="button"
// // //                         className="grid h-[34px] w-[34px] place-items-center rounded-[8px] border border-white/10 bg-white/5"
// // //                       >
// // //                         <img
// // //                           src="/icons/filt.svg"
// // //                           alt=""
// // //                           className="h-4 w-4"
// // //                           onError={(e) => {
// // //                             e.currentTarget.style.display = "none";
// // //                           }}
// // //                         />
// // //                       </button>
// // //                     </div>
// // //                   </div>

// // //                   <div className="overflow-x-auto">
// // //                     <table className="w-full min-w-[760px]">
// // //                       <thead>
// // //                         <tr className="text-left">
// // //                           <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
// // //                             Date
// // //                           </th>
// // //                           <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
// // //                             Description
// // //                           </th>
// // //                           <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
// // //                             Status
// // //                           </th>
// // //                           <th className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
// // //                             Amount
// // //                           </th>
// // //                         </tr>
// // //                       </thead>

// // //                       <tbody>
// // //                         {history.map((item) => (
// // //                           <tr
// // //                             key={`${item.date}-${item.description}`}
// // //                             className="border-t border-white/10"
// // //                           >
// // //                             <td
// // //                               className="px-8 py-7 text-white"
// // //                               style={tableDateValueStyle}
// // //                             >
// // //                               {item.date}
// // //                             </td>

// // //                             <td
// // //                               className="px-8 py-7 text-white"
// // //                               style={tableDescriptionValueStyle}
// // //                             >
// // //                               {item.description}
// // //                             </td>

// // //                             <td
// // //                               className={`px-8 py-7 ${item.statusClass}`}
// // //                               style={tableStatusValueStyle}
// // //                             >
// // //                               {item.status}
// // //                             </td>

// // //                             <td
// // //                               className={`px-8 py-7 ${item.amountClass}`}
// // //                               style={tableAmountValueStyle}
// // //                             >
// // //                               {item.amount}
// // //                             </td>
// // //                           </tr>
// // //                         ))}
// // //                       </tbody>
// // //                     </table>
// // //                   </div>

// // //                   <div className="border-t border-white/10 py-8 text-center">
// // //                     <button
// // //                       type="button"
// // //                       style={{
// // //                         fontFamily: fontBase,
// // //                         fontWeight: 700,
// // //                         fontStyle: "normal",
// // //                         fontSize: 15,
// // //                         lineHeight: "100%",
// // //                         color: "#C084FC",
// // //                       }}
// // //                     >
// // //                       View Full History
// // //                     </button>
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </section>
// // //       </main>

// // //       {addBankOpen && (
// // //         <div
// // //           role="dialog"
// // //           aria-modal="true"
// // //           className="fixed inset-0 z-[1200] grid place-items-center px-4"
// // //         >
// // //           <div
// // //             className="absolute inset-0 bg-black/70 backdrop-blur-sm"
// // //             onClick={() => {
// // //               setAddBankOpen(false);
// // //               resetBankForm();
// // //             }}
// // //           />

// // //           <div
// // //             className="relative w-full max-w-[620px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 text-white shadow-2xl no-scrollbar"
// // //             style={{
// // //               background: "#17171A",
// // //               border: "1px solid rgba(255,255,255,0.10)",
// // //               fontFamily: fontBase,
// // //             }}
// // //           >
// // //             <button
// // //               type="button"
// // //               aria-label="Close"
// // //               onClick={() => {
// // //                 setAddBankOpen(false);
// // //                 resetBankForm();
// // //               }}
// // //               className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 hover:bg-black/80"
// // //             >
// // //               <X className="h-4 w-4 text-white/90" />
// // //             </button>

// // //             <h3 className="text-[22px] font-semibold leading-[100%] text-white">
// // //               Account Details
// // //             </h3>

// // //             <p className="mt-2 text-sm text-white/55">
// // //               Add your bank account details to receive withdrawals.
// // //             </p>

// // //             {formError && (
// // //               <div
// // //                 className="mt-5 rounded-xl border px-4 py-3 text-sm text-white"
// // //                 style={{
// // //                   background: "#2A1717",
// // //                   borderColor: "rgba(239,68,68,0.35)",
// // //                 }}
// // //               >
// // //                 {formError}
// // //               </div>
// // //             )}

// // //             <div className="mt-6 space-y-5">
// // //               <div>
// // //                 <label className="mb-2 block text-sm text-white/80">
// // //                   Account holder name
// // //                 </label>
// // //                 <input
// // //                   value={bankForm.holder}
// // //                   onChange={(e) =>
// // //                     setBankForm((p) => ({
// // //                       ...p,
// // //                       holder: onlyLetters(e.target.value),
// // //                     }))
// // //                   }
// // //                   className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
// // //                   placeholder="Enter account holder name"
// // //                 />
// // //               </div>

// // //               <div>
// // //                 <label className="mb-2 block text-sm text-white/80">
// // //                   Account number
// // //                 </label>
// // //                 <input
// // //                   value={bankForm.accNum}
// // //                   onChange={(e) =>
// // //                     setBankForm((p) => ({
// // //                       ...p,
// // //                       accNum: onlyDigits(e.target.value),
// // //                     }))
// // //                   }
// // //                   inputMode="numeric"
// // //                   pattern="[0-9]*"
// // //                   className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
// // //                   placeholder="Enter account number"
// // //                 />
// // //               </div>

// // //               <div>
// // //                 <label className="mb-2 block text-sm text-white/80">
// // //                   Confirm account number
// // //                 </label>
// // //                 <input
// // //                   value={bankForm.confirmAccNum}
// // //                   onChange={(e) =>
// // //                     setBankForm((p) => ({
// // //                       ...p,
// // //                       confirmAccNum: onlyDigits(e.target.value),
// // //                     }))
// // //                   }
// // //                   inputMode="numeric"
// // //                   pattern="[0-9]*"
// // //                   className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
// // //                   placeholder="Re-enter account number"
// // //                 />
// // //               </div>

// // //               <div>
// // //                 <label className="mb-2 block text-sm text-white/80">
// // //                   IFSC Code
// // //                 </label>
// // //                 <div className="relative">
// // //                   <input
// // //                     value={bankForm.ifsc}
// // //                     onChange={(e) =>
// // //                       setBankForm((p) => ({
// // //                         ...p,
// // //                         ifsc: e.target.value.toUpperCase(),
// // //                       }))
// // //                     }
// // //                     className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 pr-[112px] text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
// // //                     placeholder="IFSC Code"
// // //                   />

// // //                   <button
// // //                     type="button"
// // //                     className="absolute bottom-1 right-1 top-1 rounded-md px-4 text-sm text-white"
// // //                     style={{
// // //                       background:
// // //                         "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
// // //                     }}
// // //                   >
// // //                     Find IFSC
// // //                   </button>
// // //                 </div>
// // //               </div>

// // //               <div>
// // //                 <label className="mb-2 block text-sm text-white/80">
// // //                   Bank name
// // //                 </label>
// // //                 <input
// // //                   value={bankForm.bankName}
// // //                   onChange={(e) =>
// // //                     setBankForm((p) => ({
// // //                       ...p,
// // //                       bankName: e.target.value,
// // //                     }))
// // //                   }
// // //                   className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
// // //                   placeholder="Bank name"
// // //                 />
// // //               </div>

// // //               <div className="flex items-center justify-end gap-3 pt-2">
// // //                 <button
// // //                   type="button"
// // //                   onClick={() => {
// // //                     setAddBankOpen(false);
// // //                     resetBankForm();
// // //                   }}
// // //                   className="h-[49px] w-[100px] rounded-[6px] border border-white text-white/90"
// // //                 >
// // //                   Cancel
// // //                 </button>

// // //                 <button
// // //                   type="button"
// // //                   onClick={handleSaveBank}
// // //                   disabled={saveLoading}
// // //                   className="h-[49px] w-[162px] rounded-[6px] px-[15px] text-white transition-opacity disabled:opacity-60"
// // //                   style={{
// // //                     background:
// // //                       "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
// // //                   }}
// // //                 >
// // //                   {saveLoading ? "Saving..." : "Save & Continue"}
// // //                 </button>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {successPopupOpen && (
// // //         <div
// // //           role="dialog"
// // //           aria-modal="true"
// // //           className="fixed inset-0 z-[1300] grid place-items-center px-4"
// // //         >
// // //           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

// // //           <div
// // //             className="relative text-white shadow-2xl"
// // //             style={{
// // //               width: "min(500px, 94vw)",
// // //               minHeight: 300,
// // //               borderRadius: 10,
// // //               background: "#030405",
// // //               fontFamily: fontBase,
// // //               padding: "30px 24px",
// // //             }}
// // //           >
// // //             <button
// // //               type="button"
// // //               aria-label="Close"
// // //               onClick={() => setSuccessPopupOpen(false)}
// // //               className="absolute right-5 top-5 grid place-items-center text-white/50 hover:text-white"
// // //             >
// // //               <X className="h-5 w-5" />
// // //             </button>

// // //             <div className="mx-auto grid h-[80px] w-[80px] place-items-center rounded-full bg-[#052A1D]">
// // //               <div className="grid h-[36px] w-[36px] place-items-center rounded-full bg-[#21B37A]">
// // //                 <Check className="h-5 w-5 text-black" strokeWidth={3} />
// // //               </div>
// // //             </div>

// // //             <div className="mt-6 text-center">
// // //               <h3
// // //                 style={{
// // //                   fontFamily: fontBase,
// // //                   fontWeight: 700,
// // //                   fontSize: 22,
// // //                   lineHeight: "100%",
// // //                   color: "#FFFFFF",
// // //                 }}
// // //               >
// // //                 Bank account added
// // //               </h3>

// // //               <p
// // //                 className="mt-3"
// // //                 style={{
// // //                   fontFamily: fontBase,
// // //                   fontWeight: 400,
// // //                   fontSize: 22,
// // //                   lineHeight: "100%",
// // //                   color: "#FFFFFF",
// // //                 }}
// // //               >
// // //                 {latestAddedAccount?.name || "Bank"} —••
// // //                 {latestAddedAccount?.last4 || "0000"} added successfully
// // //               </p>
// // //             </div>

// // //             <div className="mt-8 flex items-center justify-center gap-6">
// // //               <button
// // //                 type="button"
// // //                 onClick={() => {
// // //                   setSuccessPopupOpen(false);
// // //                   resetBankForm();
// // //                   setAddBankOpen(true);
// // //                 }}
// // //                 style={{
// // //                   fontFamily: fontBase,
// // //                   fontWeight: 400,
// // //                   fontSize: 16,
// // //                   lineHeight: "24px",
// // //                   color: "#FFFFFF",
// // //                 }}
// // //               >
// // //                 Add Another
// // //               </button>

// // //               <button
// // //                 type="button"
// // //                 onClick={() => {
// // //                   setSuccessPopupOpen(false);
// // //                   setAddBankOpen(false);
// // //                 }}
// // //                 className="h-[50px] rounded-[7px] px-5"
// // //                 style={{
// // //                   background: "#333335",
// // //                   fontFamily: fontBase,
// // //                   fontWeight: 400,
// // //                   fontSize: 16,
// // //                   lineHeight: "24px",
// // //                   color: "#FFFFFF",
// // //                 }}
// // //               >
// // //                 View
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}

// // //       <div className="relative z-10 mt-20">
// // //         <Footer />
// // //       </div>

// // //       <style>{`
// // //         .no-scrollbar::-webkit-scrollbar { display: none; }
// // //         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
// // //       `}</style>
// // //     </div>
// // //   );
// // // };

// // // export default Wallet;





// // // src/pages/Wallet.tsx
// // import { useEffect, useMemo, useState, type CSSProperties } from "react";
// // import Header from "@/components/Header";
// // import Footer from "@/components/Footer";
// // import { Landmark, ChevronDown, X, Check, Trash } from "lucide-react";
// // import { useAuth } from "@/contexts/AuthContext";
// // import { useNavigate } from "react-router-dom";

// // type WalletAccount = {
// //   id: string;
// //   name: string;
// //   last4: string;
// //   ifsc?: string;
// //   isDefault?: boolean;
// //   iconBg: string;
// //   iconColor: string;
// // };

// // type BankForm = {
// //   holder: string;
// //   accNum: string;
// //   confirmAccNum: string;
// //   ifsc: string;
// //   bankName: string;
// // };

// // type Transaction = {
// //   id: string;
// //   date: string;
// //   description: string;
// //   status: string;
// //   amount: string;
// //   type: "credit" | "debit";
// // };

// // type WalletData = {
// //   totalRevenue: number;
// //   availableBalance: number;
// //   monthlyEarning: number;
// //   recentTransactions: Transaction[];
// // };

// // const Wallet = () => {
// //   const { token, user } = useAuth() as any;
// //   const navigate = useNavigate();

// //   const fontBase = "Inter, system-ui, Arial, sans-serif";
// //   const API_BASE =
// //     (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";

// //   const BANK_ADD_URL = `${API_BASE}/api/bankaccount/add`;
// //   const BANK_LIST_URL = `${API_BASE}/api/bankaccount`;
// //   const BANK_DELETE_URL = (id: string) => `${API_BASE}/api/bankaccount/${id}`;
// //   const WALLET_URL = `${API_BASE}/api/wallet/balance`;

// //   const userStorageId = user?._id || user?.id || user?.email || "guest";
// //   const WALLET_ACCOUNTS_KEY = useMemo(
// //     () => `tokun_wallet_accounts_${userStorageId}`,
// //     [userStorageId]
// //   );

// //   // ── Wallet data ──
// //   const [walletData, setWalletData] = useState<WalletData>({
// //     totalRevenue: 0,
// //     availableBalance: 0,
// //     monthlyEarning: 0,
// //     recentTransactions: [],
// //   });
// //   const [walletLoading, setWalletLoading] = useState(false);

// //   // ── Bank accounts ──
// //   const [accounts, setAccounts] = useState<WalletAccount[]>([]);
// //   const [accountsLoaded, setAccountsLoaded] = useState(false);
// //   const [addBankOpen, setAddBankOpen] = useState(false);
// //   const [saveLoading, setSaveLoading] = useState(false);
// //   const [successPopupOpen, setSuccessPopupOpen] = useState(false);
// //   const [formError, setFormError] = useState("");
// //   const [latestAddedAccount, setLatestAddedAccount] = useState<WalletAccount | null>(null);
// //   const [manageMode, setManageMode] = useState(false);
// //   const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
// //   const [deleteError, setDeleteError] = useState("");

// //   const [bankForm, setBankForm] = useState<BankForm>({
// //     holder: "",
// //     accNum: "",
// //     confirmAccNum: "",
// //     ifsc: "",
// //     bankName: "",
// //   });

// //   // ── Fetch wallet balance ──
// //   const fetchWalletData = async () => {
// //     if (!token) return;
// //     try {
// //       setWalletLoading(true);
// //       const res = await fetch(WALLET_URL, {
// //         headers: { Authorization: `Bearer ${token}` },
// //         credentials: "include",
// //       });
// //       const data = await res.json();
// //       if (res.ok && data.success) {
// //         setWalletData(data);
// //       }
// //     } catch (err) {
// //       console.error("Wallet fetch error:", err);
// //     } finally {
// //       setWalletLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchWalletData();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [token]);

// //   const buttonTextStyle: CSSProperties = {
// //     fontFamily: fontBase,
// //     fontWeight: 700,
// //     fontStyle: "normal",
// //     fontSize: 16,
// //     lineHeight: "24px",
// //     letterSpacing: 0,
// //     textAlign: "center",
// //   };

// //   const tableDateValueStyle: CSSProperties = {
// //     fontFamily: fontBase,
// //     fontWeight: 500,
// //     fontStyle: "normal",
// //     fontSize: 14,
// //     lineHeight: "20px",
// //     letterSpacing: 0,
// //   };

// //   const tableDescriptionValueStyle: CSSProperties = {
// //     fontFamily: fontBase,
// //     fontWeight: 700,
// //     fontStyle: "normal",
// //     fontSize: 14,
// //     lineHeight: "20px",
// //     letterSpacing: 0,
// //   };

// //   const tableStatusValueStyle: CSSProperties = {
// //     fontFamily: fontBase,
// //     fontWeight: 700,
// //     fontStyle: "normal",
// //     fontSize: 14,
// //     lineHeight: "20px",
// //     letterSpacing: 0,
// //   };

// //   const tableAmountValueStyle: CSSProperties = {
// //     fontFamily: fontBase,
// //     fontWeight: 900,
// //     fontStyle: "normal",
// //     fontSize: 16,
// //     lineHeight: "100%",
// //     letterSpacing: 0,
// //     textAlign: "right",
// //   };

// //   const plusMaskStyle = (size: number, color: string): CSSProperties => ({
// //     width: size,
// //     height: size,
// //     opacity: 1,
// //     display: "inline-block",
// //     flexShrink: 0,
// //     backgroundColor: color,
// //     WebkitMask: "url('/icons/pluss.svg') center / contain no-repeat",
// //     mask: "url('/icons/pluss.svg') center / contain no-repeat",
// //   });

// //   const makeId = () =>
// //     typeof crypto !== "undefined" && "randomUUID" in crypto
// //       ? crypto.randomUUID()
// //       : `wallet-${Date.now()}-${Math.random().toString(16).slice(2)}`;

// //   const getAuthToken = () =>
// //     token ||
// //     localStorage.getItem("auth_token") ||
// //     sessionStorage.getItem("auth_token") ||
// //     localStorage.getItem("token") ||
// //     sessionStorage.getItem("token") ||
// //     "";

// //   const onlyLetters = (value: string) =>
// //     value.replace(/[^A-Za-z\s]/g, "").replace(/\s{2,}/g, " ").replace(/^\s+/, "");

// //   const onlyDigits = (value: string) => value.replace(/\D/g, "").slice(0, 18);

// //   const resetBankForm = () => {
// //     setBankForm({ holder: "", accNum: "", confirmAccNum: "", ifsc: "", bankName: "" });
// //     setFormError("");
// //   };

// //   const mapApiAccount = (ba: any): WalletAccount => ({
// //     id: String(ba?._id || makeId()),
// //     name: String(ba?.bankName || "Bank Account"),
// //     last4: String(ba?.accountNumber || "").slice(-4) || "0000",
// //     ifsc: String(ba?.ifscCode || "").toUpperCase(),
// //     isDefault: !!ba?.default,
// //     iconBg: "bg-[#1A73E8]/25",
// //     iconColor: "text-[#1A73E8]",
// //   });

// //   const makeLocalAccount = (bankName: string, accNum: string, ifsc: string): WalletAccount => ({
// //     id: makeId(),
// //     name: bankName,
// //     last4: accNum.slice(-4),
// //     ifsc,
// //     isDefault: accounts.length === 0,
// //     iconBg: "bg-[#1A73E8]/25",
// //     iconColor: "text-[#1A73E8]",
// //   });

// //   const fetchBankAccounts = async () => {
// //     const authToken = getAuthToken();
// //     if (!authToken) return;
// //     try {
// //       const res = await fetch(BANK_LIST_URL, {
// //         method: "GET",
// //         headers: { Authorization: `Bearer ${authToken}` },
// //         credentials: "include",
// //       });
// //       const data = await res.json().catch(() => ({}));
// //       if (!res.ok || !Array.isArray(data?.accounts)) return;
// //       const mapped = data.accounts.map(mapApiAccount);
// //       setAccounts(mapped);
// //       localStorage.setItem(WALLET_ACCOUNTS_KEY, JSON.stringify(mapped));
// //     } catch {}
// //   };

// //   useEffect(() => {
// //     setAccountsLoaded(false);
// //     try {
// //       const raw = localStorage.getItem(WALLET_ACCOUNTS_KEY);
// //       if (raw) {
// //         const parsed = JSON.parse(raw);
// //         setAccounts(Array.isArray(parsed) ? parsed : []);
// //       } else {
// //         setAccounts([]);
// //       }
// //     } catch {
// //       setAccounts([]);
// //     } finally {
// //       setAccountsLoaded(true);
// //     }
// //   }, [WALLET_ACCOUNTS_KEY]);

// //   useEffect(() => {
// //     fetchBankAccounts();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [token, WALLET_ACCOUNTS_KEY]);

// //   useEffect(() => {
// //     if (!accountsLoaded) return;
// //     localStorage.setItem(WALLET_ACCOUNTS_KEY, JSON.stringify(accounts));
// //   }, [accountsLoaded, WALLET_ACCOUNTS_KEY, accounts]);

// //   useEffect(() => {
// //     if (accounts.length === 0) setManageMode(false);
// //   }, [accounts.length]);

// //   const handleDeleteAccount = async (accountId: string) => {
// //     setDeleteError("");
// //     setDeletingAccountId(accountId);
// //     const authToken = getAuthToken();
// //     try {
// //       if (authToken) {
// //         const res = await fetch(BANK_DELETE_URL(accountId), {
// //           method: "DELETE",
// //           headers: { Authorization: `Bearer ${authToken}` },
// //           credentials: "include",
// //         });
// //         const data = await res.json().catch(() => ({}));
// //         if (!res.ok && res.status !== 404) {
// //           const message =
// //             data?.error === "account_not_found"
// //               ? "Bank account not found."
// //               : data?.error === "server_error"
// //               ? "Server error while deleting."
// //               : "Could not delete bank account.";
// //           throw new Error(message);
// //         }
// //       }
// //       setAccounts((prev) => prev.filter((a) => a.id !== accountId));
// //       if (latestAddedAccount?.id === accountId) setLatestAddedAccount(null);
// //     } catch (err: any) {
// //       setDeleteError(err?.message || "Could not delete bank account.");
// //     } finally {
// //       setDeletingAccountId(null);
// //     }
// //   };

// //   const handleSaveBank = async () => {
// //     const holder = bankForm.holder.trim();
// //     const accNum = bankForm.accNum.trim();
// //     const confirmAccNum = bankForm.confirmAccNum.trim();
// //     const ifsc = bankForm.ifsc.trim().toUpperCase();
// //     const bankName = bankForm.bankName.trim();
// //     setFormError("");
// //     if (!holder || !accNum || !confirmAccNum || !ifsc || !bankName) {
// //       setFormError("Please fill out all fields.");
// //       return;
// //     }
// //     if (accNum !== confirmAccNum) {
// //       setFormError("Account numbers do not match.");
// //       return;
// //     }
// //     setSaveLoading(true);
// //     const authToken = getAuthToken();
// //     const headers: Record<string, string> = { "Content-Type": "application/json" };
// //     if (authToken) headers.Authorization = `Bearer ${authToken}`;
// //     const body = {
// //       accountHolderName: holder,
// //       accountNumber: accNum,
// //       confirmAccountNumber: confirmAccNum,
// //       ifscCode: ifsc,
// //       bankName,
// //       default: accounts.length === 0,
// //     };
// //     try {
// //       let newAccount: WalletAccount | null = null;
// //       try {
// //         const res = await fetch(BANK_ADD_URL, {
// //           method: "POST",
// //           headers,
// //           body: JSON.stringify(body),
// //           credentials: "include",
// //         });
// //         const data = await res.json().catch(() => ({}));
// //         if (!res.ok) {
// //           const code = data?.error || `http_${res.status}`;
// //           const message =
// //             code === "all_fields_required" ? "Please fill out all fields." :
// //             code === "account_numbers_mismatch" ? "Account numbers do not match." :
// //             code === "account_already_exists" ? "This bank account is already saved." :
// //             "Could not add bank account.";
// //           throw new Error(message);
// //         }
// //         newAccount = data?.bankAccount ? mapApiAccount(data.bankAccount) : makeLocalAccount(bankName, accNum, ifsc);
// //       } catch (apiErr: any) {
// //         if (authToken) throw apiErr;
// //         newAccount = makeLocalAccount(bankName, accNum, ifsc);
// //       }
// //       setAccounts((prev) => {
// //         const without = prev.filter((a) => !(a.name === newAccount!.name && a.last4 === newAccount!.last4));
// //         return [...without, newAccount!];
// //       });
// //       setLatestAddedAccount(newAccount);
// //       setAddBankOpen(false);
// //       resetBankForm();
// //       setSuccessPopupOpen(true);
// //     } catch (err: any) {
// //       setFormError(err?.message || "Could not add bank account.");
// //     } finally {
// //       setSaveLoading(false);
// //     }
// //   };

// //   // ── Format helpers ──
// //   const fmt = (n: number) =>
// //     new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);

// //   const fmtDate = (d: string) =>
// //     new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

// //   return (
// //     <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
// //       <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
// //         <img
// //           src="/icons/mpbg.png"
// //           alt="background"
// //           className="absolute inset-0 w-full h-screen object-contain object-top select-none"
// //         />
// //       </div>

// //       <div className="relative z-20 w-full bg-transparent px-4">
// //         <Header />
// //       </div>

// //       <main className="relative z-10 px-4 pt-[130px] pb-20">
// //         <section
// //           className="mx-auto overflow-hidden"
// //           style={{
// //             width: "min(1024px, 100%)",
// //             minHeight: 1124,
// //             borderRadius: 30,
// //             background: "#21212180",
// //             backdropFilter: "blur(20px)",
// //             WebkitBackdropFilter: "blur(20px)",
// //             fontFamily: fontBase,
// //           }}
// //         >
// //           <div className="p-8 sm:p-[50px]">
// //             {/* Title */}
// //             <div>
// //               <h1 className="text-white" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 36, lineHeight: "100%" }}>
// //                 My Wallet
// //               </h1>
// //               <p className="mt-4 max-w-[600px]" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 16, lineHeight: "24px", color: "#A1A1AA" }}>
// //                 Track your revenue and manage your withdrawals in one clean, centralized view.
// //               </p>
// //             </div>

// //             <div className="mt-7 grid grid-cols-1 lg:grid-cols-[1fr_294px] gap-5">
// //               {/* ── Balance card ── */}
// //               <div
// //                 className="relative overflow-hidden border border-white/10"
// //                 style={{ minHeight: 379, borderRadius: 28, background: "rgba(23,23,26,0.56)" }}
// //               >
// //                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />
// //                 <div className="relative z-10 p-8">
// //                   <p style={{ fontFamily: fontBase, fontWeight: 600, fontSize: 12, lineHeight: "12px", letterSpacing: "1.2px", color: "#C084FC", textTransform: "uppercase" }}>
// //                     Available to Withdraw
// //                   </p>
// //                   <h2 className="mt-5 text-white" style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 60, lineHeight: "60px" }}>
// //                     {walletLoading ? "Loading..." : `₹ ${fmt(walletData.availableBalance)}`}
// //                   </h2>

// //                   <div className="mt-12 flex flex-wrap items-center gap-4">
// //                     <button
// //                       type="button"
// //                       onClick={() => navigate("/add-funds")}
// //                       className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[10px] px-7 text-white"
// //                       style={{ ...buttonTextStyle, background: "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)" }}
// //                     >
// //                       <span aria-hidden style={plusMaskStyle(10.5, "#FFFFFF")} />
// //                       Add
// //                     </button>
// //                     <button
// //                       type="button"
// //                       onClick={() => navigate("/withdraw")}
// //                       className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[10px] border border-white/15 bg-white/10 px-7 text-white"
// //                       style={buttonTextStyle}
// //                     >
// //                       <img src="/icons/with.svg" alt="" style={{ width: 13.5, height: 13.5 }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
// //                       Withdraw
// //                     </button>
// //                   </div>

// //                   <div className="mt-12 h-px w-full bg-white/10" />

// //                   <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
// //                     <div>
// //                       <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, lineHeight: "100%", color: "rgba(255,255,255,0.35)" }}>
// //                         Total Earning
// //                       </p>
// //                       <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, lineHeight: "100%", color: "#FFFFFF" }}>
// //                         {walletLoading ? "—" : `₹${fmt(walletData.totalRevenue)}`}
// //                       </p>
// //                     </div>
// //                     <div>
// //                       <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, lineHeight: "100%", color: "rgba(255,255,255,0.35)" }}>
// //                         Monthly Earnings
// //                       </p>
// //                       <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, lineHeight: "100%", color: "#ADC6FF" }}>
// //                         {walletLoading ? "—" : `₹${fmt(walletData.monthlyEarning)}`}
// //                       </p>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* ── Accounts card ── */}
// //               <div
// //                 className="relative overflow-hidden border border-white/10"
// //                 style={{ minHeight: 379, borderRadius: 28, background: "rgba(23,23,26,0.56)" }}
// //               >
// //                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(255,20,239,0.14),transparent_55%)]" />
// //                 <div className="relative z-10 p-8">
// //                   <div className="flex items-center justify-between">
// //                     <h3 className="text-white" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 18, lineHeight: "100%" }}>
// //                       Accounts
// //                     </h3>
// //                     <button
// //                       type="button"
// //                       onClick={() => { setDeleteError(""); setManageMode(true); }}
// //                       disabled={accounts.length === 0}
// //                       style={{
// //                         fontFamily: fontBase, fontWeight: 700, fontSize: 14, lineHeight: "100%",
// //                         color: accounts.length === 0 ? "rgba(255,255,255,0.35)" : "#C084FC",
// //                         cursor: accounts.length === 0 ? "not-allowed" : "pointer",
// //                       }}
// //                     >
// //                       Manage
// //                     </button>
// //                   </div>

// //                   <div className="mt-7 space-y-3">
// //                     {deleteError && (
// //                       <div className="rounded-[10px] border px-3 py-2 text-xs text-white" style={{ background: "#2A1717", borderColor: "rgba(239,68,68,0.35)" }}>
// //                         {deleteError}
// //                       </div>
// //                     )}
// //                     {accounts.length === 0 ? (
// //                       <div className="rounded-[10px] border border-white/5 bg-white/[0.04] px-4 py-5 text-sm text-white/50">
// //                         No bank accounts added yet
// //                       </div>
// //                     ) : (
// //                       accounts.map((account) => {
// //                         const isDeleting = deletingAccountId === account.id;
// //                         return (
// //                           <div key={account.id} className="relative overflow-hidden rounded-[10px]">
// //                             <div
// //                               className="flex h-[70px] items-center gap-4 rounded-[10px] border border-white/5 bg-white/[0.06] px-4"
// //                               style={{ paddingRight: manageMode ? 54 : 16, transition: "padding-right 220ms ease" }}
// //                             >
// //                               <div className={`grid h-9 w-9 place-items-center rounded-full ${account.iconBg}`}>
// //                                 <Landmark className={`h-5 w-5 ${account.iconColor}`} />
// //                               </div>
// //                               <div className="min-w-0">
// //                                 <p className="truncate text-white" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, lineHeight: "100%" }}>
// //                                   {account.name}
// //                                 </p>
// //                                 <p className="mt-2" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 10, lineHeight: "100%", color: "rgba(255,255,255,0.35)" }}>
// //                                   •••• {account.last4}
// //                                 </p>
// //                               </div>
// //                             </div>
// //                             <button
// //                               type="button"
// //                               aria-label={`Delete ${account.name}`}
// //                               disabled={!manageMode || isDeleting}
// //                               onClick={() => handleDeleteAccount(account.id)}
// //                               className="absolute grid h-9 w-9 place-items-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-60"
// //                               style={{
// //                                 top: "50%", right: 10,
// //                                 opacity: manageMode ? 1 : 0,
// //                                 pointerEvents: manageMode ? "auto" : "none",
// //                                 transform: manageMode ? "translateY(-50%) translateX(0)" : "translateY(-50%) translateX(24px)",
// //                                 transition: "opacity 220ms ease, transform 220ms ease",
// //                               }}
// //                             >
// //                               <Trash className="h-4 w-4" />
// //                             </button>
// //                           </div>
// //                         );
// //                       })
// //                     )}
// //                   </div>

// //                   {manageMode ? (
// //                     <button
// //                       type="button"
// //                       onClick={() => { setManageMode(false); setDeleteError(""); }}
// //                       className={`${accounts.length === 0 ? "mt-7" : "mt-20"} flex h-[38px] w-full items-center justify-center rounded-[8px]`}
// //                       style={{ background: "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)", border: "none", fontFamily: fontBase, fontWeight: 700, fontSize: 12, lineHeight: "100%", color: "#FFFFFF" }}
// //                     >
// //                       Done
// //                     </button>
// //                   ) : (
// //                     <button
// //                       type="button"
// //                       onClick={() => { resetBankForm(); setAddBankOpen(true); }}
// //                       className={`${accounts.length === 0 ? "mt-7" : "mt-20"} flex h-[38px] w-full items-center justify-center gap-2 rounded-[8px]`}
// //                       style={{ background: "#FFFFFF0D", border: "1px solid #FFFFFF33", fontFamily: fontBase, fontWeight: 700, fontSize: 12, lineHeight: "100%", color: "#A1A1AA" }}
// //                     >
// //                       <span aria-hidden style={plusMaskStyle(7, "#A1A1AA")} />
// //                       Add Card
// //                     </button>
// //                   )}
// //                 </div>
// //               </div>
// //             </div>

// //             {/* ── Transaction history ── */}
// //             <div className="mt-5 overflow-hidden border border-white/10" style={{ borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
// //               <div className="relative">
// //                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(255,20,239,0.22),transparent_45%)]" />
// //                 <div className="relative z-10">
// //                   <div className="flex flex-col gap-5 border-b border-white/10 p-8 sm:flex-row sm:items-center sm:justify-between">
// //                     <div>
// //                       <h3 className="text-white" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 20, lineHeight: "100%" }}>
// //                         Payment History
// //                       </h3>
// //                       <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, lineHeight: "100%", color: "rgba(255,255,255,0.35)" }}>
// //                         Track all earnings and withdrawals
// //                       </p>
// //                     </div>
// //                   </div>

// //                   <div className="overflow-x-auto">
// //                     <table className="w-full min-w-[760px]">
// //                       <thead>
// //                         <tr className="text-left">
// //                           <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Date</th>
// //                           <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Description</th>
// //                           <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Status</th>
// //                           <th className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Amount</th>
// //                         </tr>
// //                       </thead>
// //                       <tbody>
// //                         {walletLoading ? (
// //                           <tr>
// //                             <td colSpan={4} className="px-8 py-10 text-center text-white/50 text-sm">Loading transactions…</td>
// //                           </tr>
// //                         ) : walletData.recentTransactions.length === 0 ? (
// //                           <tr>
// //                             <td colSpan={4} className="px-8 py-10 text-center text-white/50 text-sm">No transactions yet. Sales will appear here.</td>
// //                           </tr>
// //                         ) : (
// //                           walletData.recentTransactions.map((item) => (
// //                             <tr key={item.id} className="border-t border-white/10">
// //                               <td className="px-8 py-7 text-white" style={tableDateValueStyle}>{fmtDate(item.date)}</td>
// //                               <td className="px-8 py-7 text-white" style={tableDescriptionValueStyle}>{item.description}</td>
// //                               <td className="px-8 py-7 text-[#C084FC]" style={tableStatusValueStyle}>{item.status}</td>
// //                               <td className="px-8 py-7 text-[#4ADE80]" style={tableAmountValueStyle}>{item.amount}</td>
// //                             </tr>
// //                           ))
// //                         )}
// //                       </tbody>
// //                     </table>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </section>
// //       </main>

// //       {/* ── Add Bank Modal ── */}
// //       {addBankOpen && (
// //         <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1200] grid place-items-center px-4">
// //           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setAddBankOpen(false); resetBankForm(); }} />
// //           <div
// //             className="relative w-full max-w-[620px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 text-white shadow-2xl no-scrollbar"
// //             style={{ background: "#17171A", border: "1px solid rgba(255,255,255,0.10)", fontFamily: fontBase }}
// //           >
// //             <button type="button" aria-label="Close" onClick={() => { setAddBankOpen(false); resetBankForm(); }} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 hover:bg-black/80">
// //               <X className="h-4 w-4 text-white/90" />
// //             </button>
// //             <h3 className="text-[22px] font-semibold leading-[100%] text-white">Account Details</h3>
// //             <p className="mt-2 text-sm text-white/55">Add your bank account details to receive withdrawals.</p>
// //             {formError && (
// //               <div className="mt-5 rounded-xl border px-4 py-3 text-sm text-white" style={{ background: "#2A1717", borderColor: "rgba(239,68,68,0.35)" }}>
// //                 {formError}
// //               </div>
// //             )}
// //             <div className="mt-6 space-y-5">
// //               {[
// //                 { label: "Account holder name", key: "holder" as const, placeholder: "Enter account holder name", onChange: (v: string) => onlyLetters(v) },
// //                 { label: "Account number", key: "accNum" as const, placeholder: "Enter account number", onChange: onlyDigits },
// //                 { label: "Confirm account number", key: "confirmAccNum" as const, placeholder: "Re-enter account number", onChange: onlyDigits },
// //               ].map(({ label, key, placeholder, onChange }) => (
// //                 <div key={key}>
// //                   <label className="mb-2 block text-sm text-white/80">{label}</label>
// //                   <input
// //                     value={bankForm[key]}
// //                     onChange={(e) => setBankForm((p) => ({ ...p, [key]: onChange(e.target.value) }))}
// //                     className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
// //                     placeholder={placeholder}
// //                     inputMode={key !== "holder" ? "numeric" : undefined}
// //                   />
// //                 </div>
// //               ))}
// //               <div>
// //                 <label className="mb-2 block text-sm text-white/80">IFSC Code</label>
// //                 <div className="relative">
// //                   <input
// //                     value={bankForm.ifsc}
// //                     onChange={(e) => setBankForm((p) => ({ ...p, ifsc: e.target.value.toUpperCase() }))}
// //                     className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 pr-[112px] text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
// //                     placeholder="IFSC Code"
// //                   />
// //                   <button type="button" className="absolute bottom-1 right-1 top-1 rounded-md px-4 text-sm text-white" style={{ background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)" }}>
// //                     Find IFSC
// //                   </button>
// //                 </div>
// //               </div>
// //               <div>
// //                 <label className="mb-2 block text-sm text-white/80">Bank name</label>
// //                 <input
// //                   value={bankForm.bankName}
// //                   onChange={(e) => setBankForm((p) => ({ ...p, bankName: e.target.value }))}
// //                   className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
// //                   placeholder="Bank name"
// //                 />
// //               </div>
// //               <div className="flex items-center justify-end gap-3 pt-2">
// //                 <button type="button" onClick={() => { setAddBankOpen(false); resetBankForm(); }} className="h-[49px] w-[100px] rounded-[6px] border border-white text-white/90">Cancel</button>
// //                 <button type="button" onClick={handleSaveBank} disabled={saveLoading} className="h-[49px] w-[162px] rounded-[6px] px-[15px] text-white transition-opacity disabled:opacity-60" style={{ background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)" }}>
// //                   {saveLoading ? "Saving..." : "Save & Continue"}
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* ── Success popup ── */}
// //       {successPopupOpen && (
// //         <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1300] grid place-items-center px-4">
// //           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
// //           <div className="relative text-white shadow-2xl" style={{ width: "min(500px, 94vw)", minHeight: 300, borderRadius: 10, background: "#030405", fontFamily: fontBase, padding: "30px 24px" }}>
// //             <button type="button" aria-label="Close" onClick={() => setSuccessPopupOpen(false)} className="absolute right-5 top-5 grid place-items-center text-white/50 hover:text-white">
// //               <X className="h-5 w-5" />
// //             </button>
// //             <div className="mx-auto grid h-[80px] w-[80px] place-items-center rounded-full bg-[#052A1D]">
// //               <div className="grid h-[36px] w-[36px] place-items-center rounded-full bg-[#21B37A]">
// //                 <Check className="h-5 w-5 text-black" strokeWidth={3} />
// //               </div>
// //             </div>
// //             <div className="mt-6 text-center">
// //               <h3 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 22, lineHeight: "100%", color: "#FFFFFF" }}>Bank account added</h3>
// //               <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 18, lineHeight: "130%", color: "#FFFFFF" }}>
// //                 {latestAddedAccount?.name || "Bank"} ••{latestAddedAccount?.last4 || "0000"} added successfully
// //               </p>
// //             </div>
// //             <div className="mt-8 flex items-center justify-center gap-6">
// //               <button type="button" onClick={() => { setSuccessPopupOpen(false); resetBankForm(); setAddBankOpen(true); }} style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 16, lineHeight: "24px", color: "#FFFFFF" }}>
// //                 Add Another
// //               </button>
// //               <button type="button" onClick={() => { setSuccessPopupOpen(false); setAddBankOpen(false); }} className="h-[50px] rounded-[7px] px-5" style={{ background: "#333335", fontFamily: fontBase, fontWeight: 400, fontSize: 16, lineHeight: "24px", color: "#FFFFFF" }}>
// //                 View
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       <div className="relative z-10 mt-20">
// //         <Footer />
// //       </div>

// //       <style>{`
// //         .no-scrollbar::-webkit-scrollbar { display: none; }
// //         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
// //       `}</style>
// //     </div>
// //   );
// // };

// // export default Wallet;






// // src/pages/Wallet.tsx
// import { useEffect, useMemo, useState, type CSSProperties } from "react";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import { Landmark, ChevronDown, X, Check, Trash } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import { useNavigate } from "react-router-dom";

// type WalletAccount = {
//   id: string;
//   name: string;
//   last4: string;
//   ifsc?: string;
//   isDefault?: boolean;
//   iconBg: string;
//   iconColor: string;
// };

// type BankForm = {
//   holder: string;
//   accNum: string;
//   confirmAccNum: string;
//   ifsc: string;
//   bankName: string;
// };

// type Transaction = {
//   id: string;
//   date: string;
//   description: string;
//   status: string;
//   amount: string;
//   type: "credit" | "debit";
// };

// type WalletData = {
//   totalRevenue: number;
//   availableBalance: number;
//   monthlyEarning: number;
//   recentTransactions: Transaction[];
// };

// const Wallet = () => {
//   const { token, user } = useAuth() as any;
//   const navigate = useNavigate();

//   const fontBase = "Inter, system-ui, Arial, sans-serif";
//   const API_BASE =
//     (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";

//   const BANK_ADD_URL = `${API_BASE}/api/bankaccount/add`;
//   const BANK_LIST_URL = `${API_BASE}/api/bankaccount`;
//   const BANK_DELETE_URL = (id: string) => `${API_BASE}/api/bankaccount/${id}`;
//   const WALLET_URL = `${API_BASE}/api/wallet/balance`;

//   const userStorageId = user?._id || user?.id || user?.email || "guest";
//   const WALLET_ACCOUNTS_KEY = useMemo(
//     () => `tokun_wallet_accounts_${userStorageId}`,
//     [userStorageId]
//   );

//   // ── Wallet data ──
//   const [walletData, setWalletData] = useState<WalletData>({
//     totalRevenue: 0,
//     availableBalance: 0,
//     monthlyEarning: 0,
//     recentTransactions: [],
//   });
//   const [walletLoading, setWalletLoading] = useState(false);

//   // ── Bank accounts ──
//   const [accounts, setAccounts] = useState<WalletAccount[]>([]);
//   const [accountsLoaded, setAccountsLoaded] = useState(false);
//   const [addBankOpen, setAddBankOpen] = useState(false);
//   const [saveLoading, setSaveLoading] = useState(false);
//   const [successPopupOpen, setSuccessPopupOpen] = useState(false);
//   const [formError, setFormError] = useState("");
//   const [latestAddedAccount, setLatestAddedAccount] = useState<WalletAccount | null>(null);
//   const [manageMode, setManageMode] = useState(false);
//   const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
//   const [deleteError, setDeleteError] = useState("");

//   const [bankForm, setBankForm] = useState<BankForm>({
//     holder: "",
//     accNum: "",
//     confirmAccNum: "",
//     ifsc: "",
//     bankName: "",
//   });

//   // ── Fetch wallet balance ──
//   const fetchWalletData = async () => {
//     if (!token) return;
//     try {
//       setWalletLoading(true);
//       const res = await fetch(WALLET_URL, {
//         headers: { Authorization: `Bearer ${token}` },
//         credentials: "include",
//       });
//       const data = await res.json();
//       if (res.ok && data.success) {
//         setWalletData(data);
//       }
//     } catch (err) {
//       console.error("Wallet fetch error:", err);
//     } finally {
//       setWalletLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchWalletData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);

//   const buttonTextStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 700,
//     fontStyle: "normal",
//     fontSize: 16,
//     lineHeight: "24px",
//     letterSpacing: 0,
//     textAlign: "center",
//   };

//   const tableDateValueStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 500,
//     fontStyle: "normal",
//     fontSize: 14,
//     lineHeight: "20px",
//     letterSpacing: 0,
//   };

//   const tableDescriptionValueStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 700,
//     fontStyle: "normal",
//     fontSize: 14,
//     lineHeight: "20px",
//     letterSpacing: 0,
//   };

//   const tableStatusValueStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 700,
//     fontStyle: "normal",
//     fontSize: 14,
//     lineHeight: "20px",
//     letterSpacing: 0,
//   };

//   const tableAmountValueStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 900,
//     fontStyle: "normal",
//     fontSize: 16,
//     lineHeight: "100%",
//     letterSpacing: 0,
//     textAlign: "right",
//   };

//   const plusMaskStyle = (size: number, color: string): CSSProperties => ({
//     width: size,
//     height: size,
//     opacity: 1,
//     display: "inline-block",
//     flexShrink: 0,
//     backgroundColor: color,
//     WebkitMask: "url('/icons/pluss.svg') center / contain no-repeat",
//     mask: "url('/icons/pluss.svg') center / contain no-repeat",
//   });

//   const makeId = () =>
//     typeof crypto !== "undefined" && "randomUUID" in crypto
//       ? crypto.randomUUID()
//       : `wallet-${Date.now()}-${Math.random().toString(16).slice(2)}`;

//   const getAuthToken = () =>
//     token ||
//     localStorage.getItem("auth_token") ||
//     sessionStorage.getItem("auth_token") ||
//     localStorage.getItem("token") ||
//     sessionStorage.getItem("token") ||
//     "";

//   const onlyLetters = (value: string) =>
//     value.replace(/[^A-Za-z\s]/g, "").replace(/\s{2,}/g, " ").replace(/^\s+/, "");

//   const onlyDigits = (value: string) => value.replace(/\D/g, "").slice(0, 18);

//   const resetBankForm = () => {
//     setBankForm({ holder: "", accNum: "", confirmAccNum: "", ifsc: "", bankName: "" });
//     setFormError("");
//   };

//   const mapApiAccount = (ba: any): WalletAccount => ({
//     id: String(ba?._id || makeId()),
//     name: String(ba?.bankName || "Bank Account"),
//     last4: String(ba?.accountNumber || "").slice(-4) || "0000",
//     ifsc: String(ba?.ifscCode || "").toUpperCase(),
//     isDefault: !!ba?.default,
//     iconBg: "bg-[#1A73E8]/25",
//     iconColor: "text-[#1A73E8]",
//   });

//   const makeLocalAccount = (bankName: string, accNum: string, ifsc: string): WalletAccount => ({
//     id: makeId(),
//     name: bankName,
//     last4: accNum.slice(-4),
//     ifsc,
//     isDefault: accounts.length === 0,
//     iconBg: "bg-[#1A73E8]/25",
//     iconColor: "text-[#1A73E8]",
//   });

//   const fetchBankAccounts = async () => {
//     const authToken = getAuthToken();
//     if (!authToken) return;
//     try {
//       const res = await fetch(BANK_LIST_URL, {
//         method: "GET",
//         headers: { Authorization: `Bearer ${authToken}` },
//         credentials: "include",
//       });
//       const data = await res.json().catch(() => ({}));
//       if (!res.ok || !Array.isArray(data?.accounts)) return;
//       const mapped = data.accounts.map(mapApiAccount);
//       setAccounts(mapped);
//       localStorage.setItem(WALLET_ACCOUNTS_KEY, JSON.stringify(mapped));
//     } catch {}
//   };

//   useEffect(() => {
//     setAccountsLoaded(false);
//     try {
//       const raw = localStorage.getItem(WALLET_ACCOUNTS_KEY);
//       if (raw) {
//         const parsed = JSON.parse(raw);
//         setAccounts(Array.isArray(parsed) ? parsed : []);
//       } else {
//         setAccounts([]);
//       }
//     } catch {
//       setAccounts([]);
//     } finally {
//       setAccountsLoaded(true);
//     }
//   }, [WALLET_ACCOUNTS_KEY]);

//   useEffect(() => {
//     fetchBankAccounts();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token, WALLET_ACCOUNTS_KEY]);

//   useEffect(() => {
//     if (!accountsLoaded) return;
//     localStorage.setItem(WALLET_ACCOUNTS_KEY, JSON.stringify(accounts));
//   }, [accountsLoaded, WALLET_ACCOUNTS_KEY, accounts]);

//   useEffect(() => {
//     if (accounts.length === 0) setManageMode(false);
//   }, [accounts.length]);

//   const handleDeleteAccount = async (accountId: string) => {
//     setDeleteError("");
//     setDeletingAccountId(accountId);
//     const authToken = getAuthToken();
//     try {
//       if (authToken) {
//         const res = await fetch(BANK_DELETE_URL(accountId), {
//           method: "DELETE",
//           headers: { Authorization: `Bearer ${authToken}` },
//           credentials: "include",
//         });
//         const data = await res.json().catch(() => ({}));
//         if (!res.ok && res.status !== 404) {
//           const message =
//             data?.error === "account_not_found"
//               ? "Bank account not found."
//               : data?.error === "server_error"
//               ? "Server error while deleting."
//               : "Could not delete bank account.";
//           throw new Error(message);
//         }
//       }
//       setAccounts((prev) => prev.filter((a) => a.id !== accountId));
//       if (latestAddedAccount?.id === accountId) setLatestAddedAccount(null);
//     } catch (err: any) {
//       setDeleteError(err?.message || "Could not delete bank account.");
//     } finally {
//       setDeletingAccountId(null);
//     }
//   };

//   const handleSaveBank = async () => {
//     const holder = bankForm.holder.trim();
//     const accNum = bankForm.accNum.trim();
//     const confirmAccNum = bankForm.confirmAccNum.trim();
//     const ifsc = bankForm.ifsc.trim().toUpperCase();
//     const bankName = bankForm.bankName.trim();
//     setFormError("");
//     if (!holder || !accNum || !confirmAccNum || !ifsc || !bankName) {
//       setFormError("Please fill out all fields.");
//       return;
//     }
//     if (accNum !== confirmAccNum) {
//       setFormError("Account numbers do not match.");
//       return;
//     }
//     setSaveLoading(true);
//     const authToken = getAuthToken();
//     const headers: Record<string, string> = { "Content-Type": "application/json" };
//     if (authToken) headers.Authorization = `Bearer ${authToken}`;
//     const body = {
//       accountHolderName: holder,
//       accountNumber: accNum,
//       confirmAccountNumber: confirmAccNum,
//       ifscCode: ifsc,
//       bankName,
//       default: accounts.length === 0,
//     };
//     try {
//       let newAccount: WalletAccount | null = null;
//       try {
//         const res = await fetch(BANK_ADD_URL, {
//           method: "POST",
//           headers,
//           body: JSON.stringify(body),
//           credentials: "include",
//         });
//         const data = await res.json().catch(() => ({}));
//         if (!res.ok) {
//           const code = data?.error || `http_${res.status}`;
//           const message =
//             code === "all_fields_required" ? "Please fill out all fields." :
//             code === "account_numbers_mismatch" ? "Account numbers do not match." :
//             code === "account_already_exists" ? "This bank account is already saved." :
//             "Could not add bank account.";
//           throw new Error(message);
//         }
//         newAccount = data?.bankAccount ? mapApiAccount(data.bankAccount) : makeLocalAccount(bankName, accNum, ifsc);
//       } catch (apiErr: any) {
//         if (authToken) throw apiErr;
//         newAccount = makeLocalAccount(bankName, accNum, ifsc);
//       }
//       setAccounts((prev) => {
//         const without = prev.filter((a) => !(a.name === newAccount!.name && a.last4 === newAccount!.last4));
//         return [...without, newAccount!];
//       });
//       setLatestAddedAccount(newAccount);
//       setAddBankOpen(false);
//       resetBankForm();
//       setSuccessPopupOpen(true);
//     } catch (err: any) {
//       setFormError(err?.message || "Could not add bank account.");
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   // ── Format helpers ──
//   const fmt = (n: number) =>
//     new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);

//   const fmtDate = (d: string) =>
//     new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

//   return (
//     <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
//       <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
//         <img
//           src="/icons/mpbg.png"
//           alt="background"
//           className="absolute inset-0 w-full h-screen object-contain object-top select-none"
//         />
//       </div>

//       <div className="relative z-20 w-full bg-transparent px-4">
//         <Header />
//       </div>

//       <main className="relative z-10 px-4 pt-[130px] pb-20">
//         <section
//           className="mx-auto overflow-hidden"
//           style={{
//             width: "min(1024px, 100%)",
//             minHeight: 1124,
//             borderRadius: 30,
//             background: "#21212180",
//             backdropFilter: "blur(20px)",
//             WebkitBackdropFilter: "blur(20px)",
//             fontFamily: fontBase,
//           }}
//         >
//           <div className="p-8 sm:p-[50px]">
//             {/* Title */}
//             <div>
//               <h1 className="text-white" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 36, lineHeight: "100%" }}>
//                 My Wallet
//               </h1>
//               <p className="mt-4 max-w-[600px]" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 16, lineHeight: "24px", color: "#A1A1AA" }}>
//                 Track your revenue and manage your withdrawals in one clean, centralized view.
//               </p>
//             </div>

//             <div className="mt-7 grid grid-cols-1 lg:grid-cols-[1fr_294px] gap-5">
//               {/* ── Balance card ── */}
//               <div
//                 className="relative overflow-hidden border border-white/10"
//                 style={{ minHeight: 379, borderRadius: 28, background: "rgba(23,23,26,0.56)" }}
//               >
//                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />
//                 <div className="relative z-10 p-8">
//                   <p style={{ fontFamily: fontBase, fontWeight: 600, fontSize: 12, lineHeight: "12px", letterSpacing: "1.2px", color: "#C084FC", textTransform: "uppercase" }}>
//                     Available to Withdraw
//                   </p>
//                   <h2 className="mt-5 text-white" style={{ fontFamily: fontBase, fontWeight: 900, fontSize: 60, lineHeight: "60px" }}>
//                     {walletLoading ? "Loading..." : `₹ ${fmt(walletData.availableBalance)}`}
//                   </h2>

//                   <div className="mt-12 flex flex-wrap items-center gap-4">
//                     <button
//                       type="button"
//                       onClick={() => navigate("/add-funds")}
//                       className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[10px] px-7 text-white"
//                       style={{ ...buttonTextStyle, background: "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)" }}
//                     >
//                       <span aria-hidden style={plusMaskStyle(10.5, "#FFFFFF")} />
//                       Add
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => navigate("/withdraw")}
//                       className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[10px] border border-white/15 bg-white/10 px-7 text-white"
//                       style={buttonTextStyle}
//                     >
//                       <img src="/icons/with.svg" alt="" style={{ width: 13.5, height: 13.5 }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
//                       Withdraw
//                     </button>
//                   </div>

//                   <div className="mt-12 h-px w-full bg-white/10" />

//                   <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
//                     <div>
//                       <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, lineHeight: "100%", color: "rgba(255,255,255,0.35)" }}>
//                         Total Earning
//                       </p>
//                       <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, lineHeight: "100%", color: "#FFFFFF" }}>
//                         {walletLoading ? "—" : `₹${fmt(walletData.totalRevenue)}`}
//                       </p>
//                     </div>
//                     <div>
//                       <p style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, lineHeight: "100%", color: "rgba(255,255,255,0.35)" }}>
//                         Monthly Earnings
//                       </p>
//                       <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 24, lineHeight: "100%", color: "#ADC6FF" }}>
//                         {walletLoading ? "—" : `₹${fmt(walletData.monthlyEarning)}`}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* ── Accounts card ── */}
//               <div
//                 className="relative overflow-hidden border border-white/10"
//                 style={{ minHeight: 379, borderRadius: 28, background: "rgba(23,23,26,0.56)" }}
//               >
//                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(255,20,239,0.14),transparent_55%)]" />
//                 <div className="relative z-10 p-8">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-white" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 18, lineHeight: "100%" }}>
//                       Accounts
//                     </h3>
//                     <button
//                       type="button"
//                       onClick={() => { setDeleteError(""); setManageMode(true); }}
//                       disabled={accounts.length === 0}
//                       style={{
//                         fontFamily: fontBase, fontWeight: 700, fontSize: 14, lineHeight: "100%",
//                         color: accounts.length === 0 ? "rgba(255,255,255,0.35)" : "#C084FC",
//                         cursor: accounts.length === 0 ? "not-allowed" : "pointer",
//                       }}
//                     >
//                       Manage
//                     </button>
//                   </div>

//                   <div className="mt-7 space-y-3">
//                     {deleteError && (
//                       <div className="rounded-[10px] border px-3 py-2 text-xs text-white" style={{ background: "#2A1717", borderColor: "rgba(239,68,68,0.35)" }}>
//                         {deleteError}
//                       </div>
//                     )}
//                     {accounts.length === 0 ? (
//                       <div className="rounded-[10px] border border-white/5 bg-white/[0.04] px-4 py-5 text-sm text-white/50">
//                         No bank accounts added yet
//                       </div>
//                     ) : (
//                       accounts.map((account) => {
//                         const isDeleting = deletingAccountId === account.id;
//                         return (
//                           <div key={account.id} className="relative overflow-hidden rounded-[10px]">
//                             <div
//                               className="flex h-[70px] items-center gap-4 rounded-[10px] border border-white/5 bg-white/[0.06] px-4"
//                               style={{ paddingRight: manageMode ? 54 : 16, transition: "padding-right 220ms ease" }}
//                             >
//                               <div className={`grid h-9 w-9 place-items-center rounded-full ${account.iconBg}`}>
//                                 <Landmark className={`h-5 w-5 ${account.iconColor}`} />
//                               </div>
//                               <div className="min-w-0">
//                                 <p className="truncate text-white" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 14, lineHeight: "100%" }}>
//                                   {account.name}
//                                 </p>
//                                 <p className="mt-2" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 10, lineHeight: "100%", color: "rgba(255,255,255,0.35)" }}>
//                                   •••• {account.last4}
//                                 </p>
//                               </div>
//                             </div>
//                             <button
//                               type="button"
//                               aria-label={`Delete ${account.name}`}
//                               disabled={!manageMode || isDeleting}
//                               onClick={() => handleDeleteAccount(account.id)}
//                               className="absolute grid h-9 w-9 place-items-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-60"
//                               style={{
//                                 top: "50%", right: 10,
//                                 opacity: manageMode ? 1 : 0,
//                                 pointerEvents: manageMode ? "auto" : "none",
//                                 transform: manageMode ? "translateY(-50%) translateX(0)" : "translateY(-50%) translateX(24px)",
//                                 transition: "opacity 220ms ease, transform 220ms ease",
//                               }}
//                             >
//                               <Trash className="h-4 w-4" />
//                             </button>
//                           </div>
//                         );
//                       })
//                     )}
//                   </div>

//                   {manageMode ? (
//                     <button
//                       type="button"
//                       onClick={() => { setManageMode(false); setDeleteError(""); }}
//                       className={`${accounts.length === 0 ? "mt-7" : "mt-20"} flex h-[38px] w-full items-center justify-center rounded-[8px]`}
//                       style={{ background: "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)", border: "none", fontFamily: fontBase, fontWeight: 700, fontSize: 12, lineHeight: "100%", color: "#FFFFFF" }}
//                     >
//                       Done
//                     </button>
//                   ) : (
//                     <button
//                       type="button"
//                       onClick={() => { resetBankForm(); setAddBankOpen(true); }}
//                       className={`${accounts.length === 0 ? "mt-7" : "mt-20"} flex h-[38px] w-full items-center justify-center gap-2 rounded-[8px]`}
//                       style={{ background: "#FFFFFF0D", border: "1px solid #FFFFFF33", fontFamily: fontBase, fontWeight: 700, fontSize: 12, lineHeight: "100%", color: "#A1A1AA" }}
//                     >
//                       <span aria-hidden style={plusMaskStyle(7, "#A1A1AA")} />
//                       Add Card
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* ── Transaction history ── */}
//             <div className="mt-5 overflow-hidden border border-white/10" style={{ borderRadius: 28, background: "rgba(23,23,26,0.56)" }}>
//               <div className="relative">
//                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(255,20,239,0.22),transparent_45%)]" />
//                 <div className="relative z-10">
//                   <div className="flex flex-col gap-5 border-b border-white/10 p-8 sm:flex-row sm:items-center sm:justify-between">
//                     <div>
//                       <h3 className="text-white" style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 20, lineHeight: "100%" }}>
//                         Payment History
//                       </h3>
//                       <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 14, lineHeight: "100%", color: "rgba(255,255,255,0.35)" }}>
//                         Track all earnings and withdrawals
//                       </p>
//                     </div>
//                   </div>

//                   <div className="overflow-x-auto">
//                     <table className="w-full min-w-[760px]">
//                       <thead>
//                         <tr className="text-left">
//                           <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Date</th>
//                           <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Description</th>
//                           <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Status</th>
//                           <th className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Amount</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {walletLoading ? (
//                           <tr>
//                             <td colSpan={4} className="px-8 py-10 text-center text-white/50 text-sm">Loading transactions…</td>
//                           </tr>
//                         ) : walletData.recentTransactions.length === 0 ? (
//                           <tr>
//                             <td colSpan={4} className="px-8 py-10 text-center text-white/50 text-sm">No transactions yet. Sales will appear here.</td>
//                           </tr>
//                         ) : (
//                           walletData.recentTransactions.map((item) => (
//                             <tr key={item.id} className="border-t border-white/10">
//                               <td className="px-8 py-7 text-white" style={tableDateValueStyle}>{fmtDate(item.date)}</td>
//                               <td className="px-8 py-7 text-white" style={tableDescriptionValueStyle}>{item.description}</td>
//                               <td
//                                 className={`px-8 py-7 ${String(item.status).toLowerCase() === "pending" ? "text-[#F97316]" : "text-[#C084FC]"}`}
//                                 style={tableStatusValueStyle}
//                               >
//                                 {item.status}
//                               </td>
//                               <td className="px-8 py-7 text-[#4ADE80]" style={tableAmountValueStyle}>{item.amount}</td>
//                             </tr>
//                           ))
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>

//       {/* ── Add Bank Modal ── */}
//       {addBankOpen && (
//         <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1200] grid place-items-center px-4">
//           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setAddBankOpen(false); resetBankForm(); }} />
//           <div
//             className="relative w-full max-w-[620px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 text-white shadow-2xl no-scrollbar"
//             style={{ background: "#17171A", border: "1px solid rgba(255,255,255,0.10)", fontFamily: fontBase }}
//           >
//             <button type="button" aria-label="Close" onClick={() => { setAddBankOpen(false); resetBankForm(); }} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 hover:bg-black/80">
//               <X className="h-4 w-4 text-white/90" />
//             </button>
//             <h3 className="text-[22px] font-semibold leading-[100%] text-white">Account Details</h3>
//             <p className="mt-2 text-sm text-white/55">Add your bank account details to receive withdrawals.</p>
//             {formError && (
//               <div className="mt-5 rounded-xl border px-4 py-3 text-sm text-white" style={{ background: "#2A1717", borderColor: "rgba(239,68,68,0.35)" }}>
//                 {formError}
//               </div>
//             )}
//             <div className="mt-6 space-y-5">
//               {[
//                 { label: "Account holder name", key: "holder" as const, placeholder: "Enter account holder name", onChange: (v: string) => onlyLetters(v) },
//                 { label: "Account number", key: "accNum" as const, placeholder: "Enter account number", onChange: onlyDigits },
//                 { label: "Confirm account number", key: "confirmAccNum" as const, placeholder: "Re-enter account number", onChange: onlyDigits },
//               ].map(({ label, key, placeholder, onChange }) => (
//                 <div key={key}>
//                   <label className="mb-2 block text-sm text-white/80">{label}</label>
//                   <input
//                     value={bankForm[key]}
//                     onChange={(e) => setBankForm((p) => ({ ...p, [key]: onChange(e.target.value) }))}
//                     className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
//                     placeholder={placeholder}
//                     inputMode={key !== "holder" ? "numeric" : undefined}
//                   />
//                 </div>
//               ))}
//               <div>
//                 <label className="mb-2 block text-sm text-white/80">IFSC Code</label>
//                 <div className="relative">
//                   <input
//                     value={bankForm.ifsc}
//                     onChange={(e) => setBankForm((p) => ({ ...p, ifsc: e.target.value.toUpperCase() }))}
//                     className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 pr-[112px] text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
//                     placeholder="IFSC Code"
//                   />
//                   <button type="button" className="absolute bottom-1 right-1 top-1 rounded-md px-4 text-sm text-white" style={{ background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)" }}>
//                     Find IFSC
//                   </button>
//                 </div>
//               </div>
//               <div>
//                 <label className="mb-2 block text-sm text-white/80">Bank name</label>
//                 <input
//                   value={bankForm.bankName}
//                   onChange={(e) => setBankForm((p) => ({ ...p, bankName: e.target.value }))}
//                   className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
//                   placeholder="Bank name"
//                 />
//               </div>
//               <div className="flex items-center justify-end gap-3 pt-2">
//                 <button type="button" onClick={() => { setAddBankOpen(false); resetBankForm(); }} className="h-[49px] w-[100px] rounded-[6px] border border-white text-white/90">Cancel</button>
//                 <button type="button" onClick={handleSaveBank} disabled={saveLoading} className="h-[49px] w-[162px] rounded-[6px] px-[15px] text-white transition-opacity disabled:opacity-60" style={{ background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)" }}>
//                   {saveLoading ? "Saving..." : "Save & Continue"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Success popup ── */}
//       {successPopupOpen && (
//         <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1300] grid place-items-center px-4">
//           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
//           <div className="relative text-white shadow-2xl" style={{ width: "min(500px, 94vw)", minHeight: 300, borderRadius: 10, background: "#030405", fontFamily: fontBase, padding: "30px 24px" }}>
//             <button type="button" aria-label="Close" onClick={() => setSuccessPopupOpen(false)} className="absolute right-5 top-5 grid place-items-center text-white/50 hover:text-white">
//               <X className="h-5 w-5" />
//             </button>
//             <div className="mx-auto grid h-[80px] w-[80px] place-items-center rounded-full bg-[#052A1D]">
//               <div className="grid h-[36px] w-[36px] place-items-center rounded-full bg-[#21B37A]">
//                 <Check className="h-5 w-5 text-black" strokeWidth={3} />
//               </div>
//             </div>
//             <div className="mt-6 text-center">
//               <h3 style={{ fontFamily: fontBase, fontWeight: 700, fontSize: 22, lineHeight: "100%", color: "#FFFFFF" }}>Bank account added</h3>
//               <p className="mt-3" style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 18, lineHeight: "130%", color: "#FFFFFF" }}>
//                 {latestAddedAccount?.name || "Bank"} ••{latestAddedAccount?.last4 || "0000"} added successfully
//               </p>
//             </div>
//             <div className="mt-8 flex items-center justify-center gap-6">
//               <button type="button" onClick={() => { setSuccessPopupOpen(false); resetBankForm(); setAddBankOpen(true); }} style={{ fontFamily: fontBase, fontWeight: 400, fontSize: 16, lineHeight: "24px", color: "#FFFFFF" }}>
//                 Add Another
//               </button>
//               <button type="button" onClick={() => { setSuccessPopupOpen(false); setAddBankOpen(false); }} className="h-[50px] rounded-[7px] px-5" style={{ background: "#333335", fontFamily: fontBase, fontWeight: 400, fontSize: 16, lineHeight: "24px", color: "#FFFFFF" }}>
//                 View
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="relative z-10 mt-20">
//         <Footer />
//       </div>

//       <style>{`
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>
//     </div>
//   );
// };

// export default Wallet;



// // src/pages/Wallet.tsx
// import { useEffect, useMemo, useState, type CSSProperties } from "react";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import { Landmark, X, Check, Trash } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import { useNavigate } from "react-router-dom";

// type WalletAccount = {
//   id: string;
//   name: string;
//   last4: string;
//   ifsc?: string;
//   isDefault?: boolean;
//   iconBg: string;
//   iconColor: string;
// };

// type BankForm = {
//   holder: string;
//   accNum: string;
//   confirmAccNum: string;
//   ifsc: string;
//   bankName: string;
// };

// type Transaction = {
//   id: string;
//   date: string;
//   description: string;
//   status: string;
//   amount: string;
//   type: "credit" | "debit";
//   displayStatus?: string;
//   source?: string;
// };

// type WalletData = {
//   totalRevenue: number;
//   availableBalance: number;
//   monthlyEarning: number;
//   recentTransactions: Transaction[];
// };

// const Wallet = () => {
//   const { token, user } = useAuth() as any;
//   const navigate = useNavigate();

//   const fontBase = "Inter, system-ui, Arial, sans-serif";

//   const API_BASE =
//     (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";

//   const BANK_ADD_URL = `${API_BASE}/api/bankaccount/add`;
//   const BANK_LIST_URL = `${API_BASE}/api/bankaccount`;
//   const BANK_DELETE_URL = (id: string) => `${API_BASE}/api/bankaccount/${id}`;
//   const WALLET_URL = `${API_BASE}/api/wallet/balance`;

//   const userStorageId = user?._id || user?.id || user?.email || "guest";

//   const WALLET_ACCOUNTS_KEY = useMemo(
//     () => `tokun_wallet_accounts_${userStorageId}`,
//     [userStorageId]
//   );

//   // ── Wallet data ──
//   const [walletData, setWalletData] = useState<WalletData>({
//     totalRevenue: 0,
//     availableBalance: 0,
//     monthlyEarning: 0,
//     recentTransactions: [],
//   });

//   const [walletLoading, setWalletLoading] = useState(false);

//   // ✅ Payment history pagination
//   const [historyPage, setHistoryPage] = useState(1);
//   const historyPageSize = 5;

//   // ── Bank accounts ──
//   const [accounts, setAccounts] = useState<WalletAccount[]>([]);
//   const [accountsLoaded, setAccountsLoaded] = useState(false);
//   const [addBankOpen, setAddBankOpen] = useState(false);
//   const [saveLoading, setSaveLoading] = useState(false);
//   const [successPopupOpen, setSuccessPopupOpen] = useState(false);
//   const [formError, setFormError] = useState("");
//   const [latestAddedAccount, setLatestAddedAccount] =
//     useState<WalletAccount | null>(null);
//   const [manageMode, setManageMode] = useState(false);
//   const [deletingAccountId, setDeletingAccountId] = useState<string | null>(
//     null
//   );
//   const [deleteError, setDeleteError] = useState("");

//   const [bankForm, setBankForm] = useState<BankForm>({
//     holder: "",
//     accNum: "",
//     confirmAccNum: "",
//     ifsc: "",
//     bankName: "",
//   });

//   // ── Fetch wallet balance ──
//   const fetchWalletData = async () => {
//     if (!token) return;

//     try {
//       setWalletLoading(true);

//       const res = await fetch(WALLET_URL, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         credentials: "include",
//       });

//       const data = await res.json();

//       if (res.ok && data.success) {
//         setWalletData(data);
//         setHistoryPage(1);
//       }
//     } catch (err) {
//       console.error("Wallet fetch error:", err);
//     } finally {
//       setWalletLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchWalletData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);

//   const buttonTextStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 700,
//     fontStyle: "normal",
//     fontSize: 16,
//     lineHeight: "24px",
//     letterSpacing: 0,
//     textAlign: "center",
//   };

//   const tableDateValueStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 500,
//     fontStyle: "normal",
//     fontSize: 14,
//     lineHeight: "20px",
//     letterSpacing: 0,
//   };

//   const tableDescriptionValueStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 700,
//     fontStyle: "normal",
//     fontSize: 14,
//     lineHeight: "20px",
//     letterSpacing: 0,
//   };

//   const tableStatusValueStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 700,
//     fontStyle: "normal",
//     fontSize: 14,
//     lineHeight: "20px",
//     letterSpacing: 0,
//   };

//   const tableAmountValueStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 900,
//     fontStyle: "normal",
//     fontSize: 16,
//     lineHeight: "100%",
//     letterSpacing: 0,
//     textAlign: "right",
//   };

//   const plusMaskStyle = (size: number, color: string): CSSProperties => ({
//     width: size,
//     height: size,
//     opacity: 1,
//     display: "inline-block",
//     flexShrink: 0,
//     backgroundColor: color,
//     WebkitMask: "url('/icons/pluss.svg') center / contain no-repeat",
//     mask: "url('/icons/pluss.svg') center / contain no-repeat",
//   });

//   const makeId = () =>
//     typeof crypto !== "undefined" && "randomUUID" in crypto
//       ? crypto.randomUUID()
//       : `wallet-${Date.now()}-${Math.random().toString(16).slice(2)}`;

//   const getAuthToken = () =>
//     token ||
//     localStorage.getItem("auth_token") ||
//     sessionStorage.getItem("auth_token") ||
//     localStorage.getItem("token") ||
//     sessionStorage.getItem("token") ||
//     "";

//   const onlyLetters = (value: string) =>
//     value
//       .replace(/[^A-Za-z\s]/g, "")
//       .replace(/\s{2,}/g, " ")
//       .replace(/^\s+/, "");

//   const onlyDigits = (value: string) => value.replace(/\D/g, "").slice(0, 18);

//   const resetBankForm = () => {
//     setBankForm({
//       holder: "",
//       accNum: "",
//       confirmAccNum: "",
//       ifsc: "",
//       bankName: "",
//     });
//     setFormError("");
//   };

//   const mapApiAccount = (ba: any): WalletAccount => ({
//     id: String(ba?._id || makeId()),
//     name: String(ba?.bankName || "Bank Account"),
//     last4: String(ba?.accountNumber || "").slice(-4) || "0000",
//     ifsc: String(ba?.ifscCode || "").toUpperCase(),
//     isDefault: !!ba?.default,
//     iconBg: "bg-[#1A73E8]/25",
//     iconColor: "text-[#1A73E8]",
//   });

//   const makeLocalAccount = (
//     bankName: string,
//     accNum: string,
//     ifsc: string
//   ): WalletAccount => ({
//     id: makeId(),
//     name: bankName,
//     last4: accNum.slice(-4),
//     ifsc,
//     isDefault: accounts.length === 0,
//     iconBg: "bg-[#1A73E8]/25",
//     iconColor: "text-[#1A73E8]",
//   });

//   const fetchBankAccounts = async () => {
//     const authToken = getAuthToken();
//     if (!authToken) return;

//     try {
//       const res = await fetch(BANK_LIST_URL, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//         credentials: "include",
//       });

//       const data = await res.json().catch(() => ({}));

//       if (!res.ok || !Array.isArray(data?.accounts)) return;

//       const mapped = data.accounts.map(mapApiAccount);
//       setAccounts(mapped);
//       localStorage.setItem(WALLET_ACCOUNTS_KEY, JSON.stringify(mapped));
//     } catch {}
//   };

//   useEffect(() => {
//     setAccountsLoaded(false);

//     try {
//       const raw = localStorage.getItem(WALLET_ACCOUNTS_KEY);

//       if (raw) {
//         const parsed = JSON.parse(raw);
//         setAccounts(Array.isArray(parsed) ? parsed : []);
//       } else {
//         setAccounts([]);
//       }
//     } catch {
//       setAccounts([]);
//     } finally {
//       setAccountsLoaded(true);
//     }
//   }, [WALLET_ACCOUNTS_KEY]);

//   useEffect(() => {
//     fetchBankAccounts();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token, WALLET_ACCOUNTS_KEY]);

//   useEffect(() => {
//     if (!accountsLoaded) return;
//     localStorage.setItem(WALLET_ACCOUNTS_KEY, JSON.stringify(accounts));
//   }, [accountsLoaded, WALLET_ACCOUNTS_KEY, accounts]);

//   useEffect(() => {
//     if (accounts.length === 0) setManageMode(false);
//   }, [accounts.length]);

//   const handleDeleteAccount = async (accountId: string) => {
//     setDeleteError("");
//     setDeletingAccountId(accountId);

//     const authToken = getAuthToken();

//     try {
//       if (authToken) {
//         const res = await fetch(BANK_DELETE_URL(accountId), {
//           method: "DELETE",
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//           credentials: "include",
//         });

//         const data = await res.json().catch(() => ({}));

//         if (!res.ok && res.status !== 404) {
//           const message =
//             data?.error === "account_not_found"
//               ? "Bank account not found."
//               : data?.error === "server_error"
//               ? "Server error while deleting."
//               : "Could not delete bank account.";

//           throw new Error(message);
//         }
//       }

//       setAccounts((prev) => prev.filter((a) => a.id !== accountId));

//       if (latestAddedAccount?.id === accountId) {
//         setLatestAddedAccount(null);
//       }
//     } catch (err: any) {
//       setDeleteError(err?.message || "Could not delete bank account.");
//     } finally {
//       setDeletingAccountId(null);
//     }
//   };

//   const handleSaveBank = async () => {
//     const holder = bankForm.holder.trim();
//     const accNum = bankForm.accNum.trim();
//     const confirmAccNum = bankForm.confirmAccNum.trim();
//     const ifsc = bankForm.ifsc.trim().toUpperCase();
//     const bankName = bankForm.bankName.trim();

//     setFormError("");

//     if (!holder || !accNum || !confirmAccNum || !ifsc || !bankName) {
//       setFormError("Please fill out all fields.");
//       return;
//     }

//     if (accNum !== confirmAccNum) {
//       setFormError("Account numbers do not match.");
//       return;
//     }

//     setSaveLoading(true);

//     const authToken = getAuthToken();

//     const headers: Record<string, string> = {
//       "Content-Type": "application/json",
//     };

//     if (authToken) headers.Authorization = `Bearer ${authToken}`;

//     const body = {
//       accountHolderName: holder,
//       accountNumber: accNum,
//       confirmAccountNumber: confirmAccNum,
//       ifscCode: ifsc,
//       bankName,
//       default: accounts.length === 0,
//     };

//     try {
//       let newAccount: WalletAccount | null = null;

//       try {
//         const res = await fetch(BANK_ADD_URL, {
//           method: "POST",
//           headers,
//           body: JSON.stringify(body),
//           credentials: "include",
//         });

//         const data = await res.json().catch(() => ({}));

//         if (!res.ok) {
//           const code = data?.error || `http_${res.status}`;

//           const message =
//             code === "all_fields_required"
//               ? "Please fill out all fields."
//               : code === "account_numbers_mismatch"
//               ? "Account numbers do not match."
//               : code === "account_already_exists"
//               ? "This bank account is already saved."
//               : "Could not add bank account.";

//           throw new Error(message);
//         }

//         newAccount = data?.bankAccount
//           ? mapApiAccount(data.bankAccount)
//           : makeLocalAccount(bankName, accNum, ifsc);
//       } catch (apiErr: any) {
//         if (authToken) throw apiErr;
//         newAccount = makeLocalAccount(bankName, accNum, ifsc);
//       }

//       setAccounts((prev) => {
//         const without = prev.filter(
//           (a) => !(a.name === newAccount!.name && a.last4 === newAccount!.last4)
//         );
//         return [...without, newAccount!];
//       });

//       setLatestAddedAccount(newAccount);
//       setAddBankOpen(false);
//       resetBankForm();
//       setSuccessPopupOpen(true);
//     } catch (err: any) {
//       setFormError(err?.message || "Could not add bank account.");
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   // ── Format helpers ──
//   const fmt = (n: number) =>
//     new Intl.NumberFormat("en-IN", {
//       maximumFractionDigits: 2,
//     }).format(n || 0);

//   const fmtDate = (d: string) =>
//     new Date(d).toLocaleDateString("en-US", {
//       month: "short",
//       day: "2-digit",
//       year: "numeric",
//     });

//   const getTransactionStatusLabel = (item: Transaction) => {
//     if (item.displayStatus) return item.displayStatus;

//     if (item.status === "Completed") return "Successful";
//     if (item.status === "Pending") return "Pending";
//     if (item.status === "Rejected") return "Rejected";

//     if (item.status === "Failed") {
//       return item.source === "withdrawal" ? "Rejected" : "Failed";
//     }

//     return item.status || "Pending";
//   };

//   const getTransactionStatusClass = (item: Transaction) => {
//     const label = getTransactionStatusLabel(item).toLowerCase();

//     if (label === "pending") return "text-[#F97316]";
//     if (label === "successful" || label === "completed") return "text-[#4ADE80]";
//     if (label === "rejected" || label === "failed") return "text-[#F87171]";

//     return "text-[#C084FC]";
//   };

//   // ✅ Payment history pagination calculations
//   const paymentHistory = walletData.recentTransactions || [];
//   const historyTotal = paymentHistory.length;
//   const historyTotalPages = Math.max(
//     1,
//     Math.ceil(historyTotal / historyPageSize)
//   );

//   const safeHistoryPage = Math.min(historyPage, historyTotalPages);
//   const historyStartIndex = (safeHistoryPage - 1) * historyPageSize;
//   const historyEndIndex = Math.min(
//     historyStartIndex + historyPageSize,
//     historyTotal
//   );

//   const paginatedPaymentHistory = paymentHistory.slice(
//     historyStartIndex,
//     historyStartIndex + historyPageSize
//   );

//   return (
//     <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
//       <div
//         aria-hidden
//         className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
//       >
//         <img
//           src="/icons/mpbg.png"
//           alt="background"
//           className="absolute inset-0 w-full h-screen object-contain object-top select-none"
//         />
//       </div>

//       <div className="relative z-20 w-full bg-transparent px-4">
//         <Header />
//       </div>

//       <main className="relative z-10 px-4 pt-[130px] pb-20">
//         <section
//           className="mx-auto overflow-hidden"
//           style={{
//             width: "min(1024px, 100%)",
//             minHeight: 1124,
//             borderRadius: 30,
//             background: "#21212180",
//             backdropFilter: "blur(20px)",
//             WebkitBackdropFilter: "blur(20px)",
//             fontFamily: fontBase,
//           }}
//         >
//           <div className="p-8 sm:p-[50px]">
//             {/* Title */}
//             <div>
//               <h1
//                 className="text-white"
//                 style={{
//                   fontFamily: fontBase,
//                   fontWeight: 700,
//                   fontSize: 36,
//                   lineHeight: "100%",
//                 }}
//               >
//                 My Wallet
//               </h1>

//               <p
//                 className="mt-4 max-w-[600px]"
//                 style={{
//                   fontFamily: fontBase,
//                   fontWeight: 400,
//                   fontSize: 16,
//                   lineHeight: "24px",
//                   color: "#A1A1AA",
//                 }}
//               >
//                 Track your revenue and manage your withdrawals in one clean,
//                 centralized view.
//               </p>
//             </div>

//             <div className="mt-7 grid grid-cols-1 lg:grid-cols-[1fr_294px] gap-5">
//               {/* ── Balance card ── */}
//               <div
//                 className="relative overflow-hidden border border-white/10"
//                 style={{
//                   minHeight: 379,
//                   borderRadius: 28,
//                   background: "rgba(23,23,26,0.56)",
//                 }}
//               >
//                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />

//                 <div className="relative z-10 p-8">
//                   <p
//                     style={{
//                       fontFamily: fontBase,
//                       fontWeight: 600,
//                       fontSize: 12,
//                       lineHeight: "12px",
//                       letterSpacing: "1.2px",
//                       color: "#C084FC",
//                       textTransform: "uppercase",
//                     }}
//                   >
//                     Available to Withdraw
//                   </p>

//                   <h2
//                     className="mt-5 text-white"
//                     style={{
//                       fontFamily: fontBase,
//                       fontWeight: 900,
//                       fontSize: 60,
//                       lineHeight: "60px",
//                     }}
//                   >
//                     {walletLoading
//                       ? "Loading..."
//                       : `₹ ${fmt(walletData.availableBalance)}`}
//                   </h2>

//                   <div className="mt-12 flex flex-wrap items-center gap-4">
//                     <button
//                       type="button"
//                       onClick={() => navigate("/add-funds")}
//                       className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[10px] px-7 text-white"
//                       style={{
//                         ...buttonTextStyle,
//                         background:
//                           "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)",
//                       }}
//                     >
//                       <span aria-hidden style={plusMaskStyle(10.5, "#FFFFFF")} />
//                       Add
//                     </button>

//                     <button
//                       type="button"
//                       onClick={() => navigate("/withdraw")}
//                       className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[10px] border border-white/15 bg-white/10 px-7 text-white"
//                       style={buttonTextStyle}
//                     >
//                       <img
//                         src="/icons/with.svg"
//                         alt=""
//                         style={{ width: 13.5, height: 13.5 }}
//                         onError={(e) => {
//                           e.currentTarget.style.display = "none";
//                         }}
//                       />
//                       Withdraw
//                     </button>
//                   </div>

//                   <div className="mt-12 h-px w-full bg-white/10" />

//                   <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
//                     <div>
//                       <p
//                         style={{
//                           fontFamily: fontBase,
//                           fontWeight: 400,
//                           fontSize: 14,
//                           lineHeight: "100%",
//                           color: "rgba(255,255,255,0.35)",
//                         }}
//                       >
//                         Total Earning
//                       </p>

//                       <p
//                         className="mt-3"
//                         style={{
//                           fontFamily: fontBase,
//                           fontWeight: 700,
//                           fontSize: 24,
//                           lineHeight: "100%",
//                           color: "#FFFFFF",
//                         }}
//                       >
//                         {walletLoading ? "—" : `₹${fmt(walletData.totalRevenue)}`}
//                       </p>
//                     </div>

//                     <div>
//                       <p
//                         style={{
//                           fontFamily: fontBase,
//                           fontWeight: 400,
//                           fontSize: 14,
//                           lineHeight: "100%",
//                           color: "rgba(255,255,255,0.35)",
//                         }}
//                       >
//                         Monthly Earnings
//                       </p>

//                       <p
//                         className="mt-3"
//                         style={{
//                           fontFamily: fontBase,
//                           fontWeight: 700,
//                           fontSize: 24,
//                           lineHeight: "100%",
//                           color: "#ADC6FF",
//                         }}
//                       >
//                         {walletLoading
//                           ? "—"
//                           : `₹${fmt(walletData.monthlyEarning)}`}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* ── Accounts card ── */}
//               <div
//                 className="relative overflow-hidden border border-white/10"
//                 style={{
//                   minHeight: 379,
//                   borderRadius: 28,
//                   background: "rgba(23,23,26,0.56)",
//                 }}
//               >
//                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(255,20,239,0.14),transparent_55%)]" />

//                 <div className="relative z-10 p-8">
//                   <div className="flex items-center justify-between">
//                     <h3
//                       className="text-white"
//                       style={{
//                         fontFamily: fontBase,
//                         fontWeight: 700,
//                         fontSize: 18,
//                         lineHeight: "100%",
//                       }}
//                     >
//                       Accounts
//                     </h3>

//                     <button
//                       type="button"
//                       onClick={() => {
//                         setDeleteError("");
//                         setManageMode(true);
//                       }}
//                       disabled={accounts.length === 0}
//                       style={{
//                         fontFamily: fontBase,
//                         fontWeight: 700,
//                         fontSize: 14,
//                         lineHeight: "100%",
//                         color:
//                           accounts.length === 0
//                             ? "rgba(255,255,255,0.35)"
//                             : "#C084FC",
//                         cursor: accounts.length === 0 ? "not-allowed" : "pointer",
//                       }}
//                     >
//                       Manage
//                     </button>
//                   </div>

//                   <div className="mt-7 space-y-3">
//                     {deleteError && (
//                       <div
//                         className="rounded-[10px] border px-3 py-2 text-xs text-white"
//                         style={{
//                           background: "#2A1717",
//                           borderColor: "rgba(239,68,68,0.35)",
//                         }}
//                       >
//                         {deleteError}
//                       </div>
//                     )}

//                     {accounts.length === 0 ? (
//                       <div className="rounded-[10px] border border-white/5 bg-white/[0.04] px-4 py-5 text-sm text-white/50">
//                         No bank accounts added yet
//                       </div>
//                     ) : (
//                       accounts.map((account) => {
//                         const isDeleting = deletingAccountId === account.id;

//                         return (
//                           <div
//                             key={account.id}
//                             className="relative overflow-hidden rounded-[10px]"
//                           >
//                             <div
//                               className="flex h-[70px] items-center gap-4 rounded-[10px] border border-white/5 bg-white/[0.06] px-4"
//                               style={{
//                                 paddingRight: manageMode ? 54 : 16,
//                                 transition: "padding-right 220ms ease",
//                               }}
//                             >
//                               <div
//                                 className={`grid h-9 w-9 place-items-center rounded-full ${account.iconBg}`}
//                               >
//                                 <Landmark
//                                   className={`h-5 w-5 ${account.iconColor}`}
//                                 />
//                               </div>

//                               <div className="min-w-0">
//                                 <p
//                                   className="truncate text-white"
//                                   style={{
//                                     fontFamily: fontBase,
//                                     fontWeight: 700,
//                                     fontSize: 14,
//                                     lineHeight: "100%",
//                                   }}
//                                 >
//                                   {account.name}
//                                 </p>

//                                 <p
//                                   className="mt-2"
//                                   style={{
//                                     fontFamily: fontBase,
//                                     fontWeight: 400,
//                                     fontSize: 10,
//                                     lineHeight: "100%",
//                                     color: "rgba(255,255,255,0.35)",
//                                   }}
//                                 >
//                                   •••• {account.last4}
//                                 </p>
//                               </div>
//                             </div>

//                             <button
//                               type="button"
//                               aria-label={`Delete ${account.name}`}
//                               disabled={!manageMode || isDeleting}
//                               onClick={() => handleDeleteAccount(account.id)}
//                               className="absolute grid h-9 w-9 place-items-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-60"
//                               style={{
//                                 top: "50%",
//                                 right: 10,
//                                 opacity: manageMode ? 1 : 0,
//                                 pointerEvents: manageMode ? "auto" : "none",
//                                 transform: manageMode
//                                   ? "translateY(-50%) translateX(0)"
//                                   : "translateY(-50%) translateX(24px)",
//                                 transition:
//                                   "opacity 220ms ease, transform 220ms ease",
//                               }}
//                             >
//                               <Trash className="h-4 w-4" />
//                             </button>
//                           </div>
//                         );
//                       })
//                     )}
//                   </div>

//                   {manageMode ? (
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setManageMode(false);
//                         setDeleteError("");
//                       }}
//                       className={`${
//                         accounts.length === 0 ? "mt-7" : "mt-20"
//                       } flex h-[38px] w-full items-center justify-center rounded-[8px]`}
//                       style={{
//                         background:
//                           "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)",
//                         border: "none",
//                         fontFamily: fontBase,
//                         fontWeight: 700,
//                         fontSize: 12,
//                         lineHeight: "100%",
//                         color: "#FFFFFF",
//                       }}
//                     >
//                       Done
//                     </button>
//                   ) : (
//                     <button
//                       type="button"
//                       onClick={() => {
//                         resetBankForm();
//                         setAddBankOpen(true);
//                       }}
//                       className={`${
//                         accounts.length === 0 ? "mt-7" : "mt-20"
//                       } flex h-[38px] w-full items-center justify-center gap-2 rounded-[8px]`}
//                       style={{
//                         background: "#FFFFFF0D",
//                         border: "1px solid #FFFFFF33",
//                         fontFamily: fontBase,
//                         fontWeight: 700,
//                         fontSize: 12,
//                         lineHeight: "100%",
//                         color: "#A1A1AA",
//                       }}
//                     >
//                       <span aria-hidden style={plusMaskStyle(7, "#A1A1AA")} />
//                       Add Card
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* ── Transaction history ── */}
//             <div
//               className="mt-5 overflow-hidden border border-white/10"
//               style={{
//                 borderRadius: 28,
//                 background: "rgba(23,23,26,0.56)",
//               }}
//             >
//               <div className="relative">
//                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(255,20,239,0.22),transparent_45%)]" />

//                 <div className="relative z-10">
//                   <div className="flex flex-col gap-5 border-b border-white/10 p-8 sm:flex-row sm:items-center sm:justify-between">
//                     <div>
//                       <h3
//                         className="text-white"
//                         style={{
//                           fontFamily: fontBase,
//                           fontWeight: 700,
//                           fontSize: 20,
//                           lineHeight: "100%",
//                         }}
//                       >
//                         Payment History
//                       </h3>

//                       <p
//                         className="mt-3"
//                         style={{
//                           fontFamily: fontBase,
//                           fontWeight: 400,
//                           fontSize: 14,
//                           lineHeight: "100%",
//                           color: "rgba(255,255,255,0.35)",
//                         }}
//                       >
//                         Track all earnings and withdrawals
//                       </p>
//                     </div>
//                   </div>

//                   <div className="overflow-x-auto">
//                     <table className="w-full min-w-[760px]">
//                       <thead>
//                         <tr className="text-left">
//                           <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
//                             Date
//                           </th>
//                           <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
//                             Description
//                           </th>
//                           <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
//                             Status
//                           </th>
//                           <th className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
//                             Amount
//                           </th>
//                         </tr>
//                       </thead>

//                       <tbody>
//                         {walletLoading ? (
//                           <tr>
//                             <td
//                               colSpan={4}
//                               className="px-8 py-10 text-center text-white/50 text-sm"
//                             >
//                               Loading transactions…
//                             </td>
//                           </tr>
//                         ) : paymentHistory.length === 0 ? (
//                           <tr>
//                             <td
//                               colSpan={4}
//                               className="px-8 py-10 text-center text-white/50 text-sm"
//                             >
//                               No transactions yet. Sales will appear here.
//                             </td>
//                           </tr>
//                         ) : (
//                           paginatedPaymentHistory.map((item) => (
//                             <tr key={item.id} className="border-t border-white/10">
//                               <td
//                                 className="px-8 py-7 text-white"
//                                 style={tableDateValueStyle}
//                               >
//                                 {fmtDate(item.date)}
//                               </td>

//                               <td
//                                 className="px-8 py-7 text-white"
//                                 style={tableDescriptionValueStyle}
//                               >
//                                 {item.description}
//                               </td>

//                               <td
//                                 className={`px-8 py-7 ${getTransactionStatusClass(
//                                   item
//                                 )}`}
//                                 style={tableStatusValueStyle}
//                               >
//                                 {getTransactionStatusLabel(item)}
//                               </td>

//                               <td
//                                 className={
//                                   item.type === "credit"
//                                     ? "px-8 py-7 text-[#4ADE80]"
//                                     : "px-8 py-7 text-[#F87171]"
//                                 }
//                                 style={tableAmountValueStyle}
//                               >
//                                 {item.amount}
//                               </td>
//                             </tr>
//                           ))
//                         )}
//                       </tbody>
//                     </table>
//                   </div>

//                   {/* ✅ Payment history pagination */}
//                   {historyTotal > historyPageSize && (
//                     <div className="flex flex-col gap-3 border-t border-white/10 px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
//                       <div className="text-xs text-white/50">
//                         Showing{" "}
//                         <span className="font-semibold text-white/80">
//                           {historyTotal === 0 ? 0 : historyStartIndex + 1}
//                         </span>{" "}
//                         to{" "}
//                         <span className="font-semibold text-white/80">
//                           {historyEndIndex}
//                         </span>{" "}
//                         of{" "}
//                         <span className="font-semibold text-white/80">
//                           {historyTotal}
//                         </span>{" "}
//                         payments
//                       </div>

//                       <div className="flex items-center gap-2">
//                         <button
//                           type="button"
//                           disabled={safeHistoryPage <= 1}
//                           onClick={() =>
//                             setHistoryPage((p) => Math.max(1, p - 1))
//                           }
//                           className="h-9 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-white/75 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
//                         >
//                           Prev
//                         </button>

//                         <span className="min-w-[76px] text-center text-xs text-white/50">
//                           Page {safeHistoryPage} / {historyTotalPages}
//                         </span>

//                         <button
//                           type="button"
//                           disabled={safeHistoryPage >= historyTotalPages}
//                           onClick={() =>
//                             setHistoryPage((p) =>
//                               Math.min(historyTotalPages, p + 1)
//                             )
//                           }
//                           className="h-9 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-white/75 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
//                         >
//                           Next
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>

//       {/* ── Add Bank Modal ── */}
//       {addBankOpen && (
//         <div
//           role="dialog"
//           aria-modal="true"
//           className="fixed inset-0 z-[1200] grid place-items-center px-4"
//         >
//           <div
//             className="absolute inset-0 bg-black/70 backdrop-blur-sm"
//             onClick={() => {
//               setAddBankOpen(false);
//               resetBankForm();
//             }}
//           />

//           <div
//             className="relative w-full max-w-[620px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 text-white shadow-2xl no-scrollbar"
//             style={{
//               background: "#17171A",
//               border: "1px solid rgba(255,255,255,0.10)",
//               fontFamily: fontBase,
//             }}
//           >
//             <button
//               type="button"
//               aria-label="Close"
//               onClick={() => {
//                 setAddBankOpen(false);
//                 resetBankForm();
//               }}
//               className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 hover:bg-black/80"
//             >
//               <X className="h-4 w-4 text-white/90" />
//             </button>

//             <h3 className="text-[22px] font-semibold leading-[100%] text-white">
//               Account Details
//             </h3>

//             <p className="mt-2 text-sm text-white/55">
//               Add your bank account details to receive withdrawals.
//             </p>

//             {formError && (
//               <div
//                 className="mt-5 rounded-xl border px-4 py-3 text-sm text-white"
//                 style={{
//                   background: "#2A1717",
//                   borderColor: "rgba(239,68,68,0.35)",
//                 }}
//               >
//                 {formError}
//               </div>
//             )}

//             <div className="mt-6 space-y-5">
//               {[
//                 {
//                   label: "Account holder name",
//                   key: "holder" as const,
//                   placeholder: "Enter account holder name",
//                   onChange: (v: string) => onlyLetters(v),
//                 },
//                 {
//                   label: "Account number",
//                   key: "accNum" as const,
//                   placeholder: "Enter account number",
//                   onChange: onlyDigits,
//                 },
//                 {
//                   label: "Confirm account number",
//                   key: "confirmAccNum" as const,
//                   placeholder: "Re-enter account number",
//                   onChange: onlyDigits,
//                 },
//               ].map(({ label, key, placeholder, onChange }) => (
//                 <div key={key}>
//                   <label className="mb-2 block text-sm text-white/80">
//                     {label}
//                   </label>

//                   <input
//                     value={bankForm[key]}
//                     onChange={(e) =>
//                       setBankForm((p) => ({
//                         ...p,
//                         [key]: onChange(e.target.value),
//                       }))
//                     }
//                     className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
//                     placeholder={placeholder}
//                     inputMode={key !== "holder" ? "numeric" : undefined}
//                   />
//                 </div>
//               ))}

//               <div>
//                 <label className="mb-2 block text-sm text-white/80">
//                   IFSC Code
//                 </label>

//                 <div className="relative">
//                   <input
//                     value={bankForm.ifsc}
//                     onChange={(e) =>
//                       setBankForm((p) => ({
//                         ...p,
//                         ifsc: e.target.value.toUpperCase(),
//                       }))
//                     }
//                     className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 pr-[112px] text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
//                     placeholder="IFSC Code"
//                   />

//                   <button
//                     type="button"
//                     className="absolute bottom-1 right-1 top-1 rounded-md px-4 text-sm text-white"
//                     style={{
//                       background:
//                         "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
//                     }}
//                   >
//                     Find IFSC
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <label className="mb-2 block text-sm text-white/80">
//                   Bank name
//                 </label>

//                 <input
//                   value={bankForm.bankName}
//                   onChange={(e) =>
//                     setBankForm((p) => ({
//                       ...p,
//                       bankName: e.target.value,
//                     }))
//                   }
//                   className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
//                   placeholder="Bank name"
//                 />
//               </div>

//               <div className="flex items-center justify-end gap-3 pt-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setAddBankOpen(false);
//                     resetBankForm();
//                   }}
//                   className="h-[49px] w-[100px] rounded-[6px] border border-white text-white/90"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="button"
//                   onClick={handleSaveBank}
//                   disabled={saveLoading}
//                   className="h-[49px] w-[162px] rounded-[6px] px-[15px] text-white transition-opacity disabled:opacity-60"
//                   style={{
//                     background:
//                       "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
//                   }}
//                 >
//                   {saveLoading ? "Saving..." : "Save & Continue"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Success popup ── */}
//       {successPopupOpen && (
//         <div
//           role="dialog"
//           aria-modal="true"
//           className="fixed inset-0 z-[1300] grid place-items-center px-4"
//         >
//           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

//           <div
//             className="relative text-white shadow-2xl"
//             style={{
//               width: "min(500px, 94vw)",
//               minHeight: 300,
//               borderRadius: 10,
//               background: "#030405",
//               fontFamily: fontBase,
//               padding: "30px 24px",
//             }}
//           >
//             <button
//               type="button"
//               aria-label="Close"
//               onClick={() => setSuccessPopupOpen(false)}
//               className="absolute right-5 top-5 grid place-items-center text-white/50 hover:text-white"
//             >
//               <X className="h-5 w-5" />
//             </button>

//             <div className="mx-auto grid h-[80px] w-[80px] place-items-center rounded-full bg-[#052A1D]">
//               <div className="grid h-[36px] w-[36px] place-items-center rounded-full bg-[#21B37A]">
//                 <Check className="h-5 w-5 text-black" strokeWidth={3} />
//               </div>
//             </div>

//             <div className="mt-6 text-center">
//               <h3
//                 style={{
//                   fontFamily: fontBase,
//                   fontWeight: 700,
//                   fontSize: 22,
//                   lineHeight: "100%",
//                   color: "#FFFFFF",
//                 }}
//               >
//                 Bank account added
//               </h3>

//               <p
//                 className="mt-3"
//                 style={{
//                   fontFamily: fontBase,
//                   fontWeight: 400,
//                   fontSize: 18,
//                   lineHeight: "130%",
//                   color: "#FFFFFF",
//                 }}
//               >
//                 {latestAddedAccount?.name || "Bank"} ••
//                 {latestAddedAccount?.last4 || "0000"} added successfully
//               </p>
//             </div>

//             <div className="mt-8 flex items-center justify-center gap-6">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setSuccessPopupOpen(false);
//                   resetBankForm();
//                   setAddBankOpen(true);
//                 }}
//                 style={{
//                   fontFamily: fontBase,
//                   fontWeight: 400,
//                   fontSize: 16,
//                   lineHeight: "24px",
//                   color: "#FFFFFF",
//                 }}
//               >
//                 Add Another
//               </button>

//               <button
//                 type="button"
//                 onClick={() => {
//                   setSuccessPopupOpen(false);
//                   setAddBankOpen(false);
//                 }}
//                 className="h-[50px] rounded-[7px] px-5"
//                 style={{
//                   background: "#333335",
//                   fontFamily: fontBase,
//                   fontWeight: 400,
//                   fontSize: 16,
//                   lineHeight: "24px",
//                   color: "#FFFFFF",
//                 }}
//               >
//                 View
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="relative z-10 mt-20">
//         <Footer />
//       </div>

//       <style>{`
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>
//     </div>
//   );
// };

// export default Wallet;



// // src/pages/Wallet.tsx
// import { useEffect, useMemo, useState, type CSSProperties } from "react";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import { Landmark, X, Check, Trash } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import { useNavigate } from "react-router-dom";

// type WalletAccount = {
//   id: string;
//   name: string;
//   last4: string;
//   ifsc?: string;
//   isDefault?: boolean;
//   iconBg: string;
//   iconColor: string;
// };

// type BankForm = {
//   holder: string;
//   accNum: string;
//   confirmAccNum: string;
//   ifsc: string;
//   bankName: string;
// };

// type Transaction = {
//   id: string;
//   date: string;
//   description: string;
//   status: string;
//   amount: string;
//   type: "credit" | "debit";
//   displayStatus?: string;
//   source?: string;
// };

// type WalletData = {
//   totalRevenue: number;
//   availableBalance: number;
//   monthlyEarning: number;
//   recentTransactions: Transaction[];
// };

// const Wallet = () => {
//   const { token, user } = useAuth() as any;
//   const navigate = useNavigate();

//   const fontBase = "Inter, system-ui, Arial, sans-serif";

//   const API_BASE =
//     (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";

//   const BANK_ADD_URL = `${API_BASE}/api/bankaccount/add`;
//   const BANK_LIST_URL = `${API_BASE}/api/bankaccount`;
//   const BANK_DELETE_URL = (id: string) => `${API_BASE}/api/bankaccount/${id}`;
//   const WALLET_URL = `${API_BASE}/api/wallet/balance`;

//   const userStorageId = user?._id || user?.id || user?.email || "guest";

//   const WALLET_ACCOUNTS_KEY = useMemo(
//     () => `tokun_wallet_accounts_${userStorageId}`,
//     [userStorageId]
//   );

//   // ── Wallet data ──
//   const [walletData, setWalletData] = useState<WalletData>({
//     totalRevenue: 0,
//     availableBalance: 0,
//     monthlyEarning: 0,
//     recentTransactions: [],
//   });

// const [selectedMonth, setSelectedMonth] = useState(() => {
//   const now = new Date();
//   return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
// });



//   const [walletLoading, setWalletLoading] = useState(false);

//   // ✅ Payment history pagination
//   const [historyPage, setHistoryPage] = useState(1);
//   const historyPageSize = 5;

//   // ── Bank accounts ──
//   const [accounts, setAccounts] = useState<WalletAccount[]>([]);
//   const [accountsLoaded, setAccountsLoaded] = useState(false);
//   const [addBankOpen, setAddBankOpen] = useState(false);
//   const [saveLoading, setSaveLoading] = useState(false);
//   const [successPopupOpen, setSuccessPopupOpen] = useState(false);
//   const [formError, setFormError] = useState("");
//   const [latestAddedAccount, setLatestAddedAccount] =
//     useState<WalletAccount | null>(null);
//   const [manageMode, setManageMode] = useState(false);
//   const [deletingAccountId, setDeletingAccountId] = useState<string | null>(
//     null
//   );
//   const [deleteError, setDeleteError] = useState("");

//   const [bankForm, setBankForm] = useState<BankForm>({
//     holder: "",
//     accNum: "",
//     confirmAccNum: "",
//     ifsc: "",
//     bankName: "",
//   });

//   // ── Fetch wallet balance ──
//   const fetchWalletData = async () => {
//     if (!token) return;

//     try {
//       setWalletLoading(true);

//       const res = await fetch(WALLET_URL, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         credentials: "include",
//       });

//       const data = await res.json();

//       if (res.ok && data.success) {
//         setWalletData(data);
//         setHistoryPage(1);
//       }
//     } catch (err) {
//       console.error("Wallet fetch error:", err);
//     } finally {
//       setWalletLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchWalletData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);


//   useEffect(() => {
//   const handleStorage = (e: StorageEvent) => {
//     if (e.key === "tokun:lastRelease") {
//       fetchWalletData();
//     }
//   };
//   window.addEventListener("storage", handleStorage);
//   return () => window.removeEventListener("storage", handleStorage);
// }, [token]);

//   const buttonTextStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 700,
//     fontStyle: "normal",
//     fontSize: 16,
//     lineHeight: "24px",
//     letterSpacing: 0,
//     textAlign: "center",
//   };

//   const tableDateValueStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 500,
//     fontStyle: "normal",
//     fontSize: 14,
//     lineHeight: "20px",
//     letterSpacing: 0,
//   };

//   const tableDescriptionValueStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 700,
//     fontStyle: "normal",
//     fontSize: 14,
//     lineHeight: "20px",
//     letterSpacing: 0,
//   };

//   const tableStatusValueStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 700,
//     fontStyle: "normal",
//     fontSize: 14,
//     lineHeight: "20px",
//     letterSpacing: 0,
//   };

//   const tableAmountValueStyle: CSSProperties = {
//     fontFamily: fontBase,
//     fontWeight: 900,
//     fontStyle: "normal",
//     fontSize: 16,
//     lineHeight: "100%",
//     letterSpacing: 0,
//     textAlign: "right",
//   };

//   const plusMaskStyle = (size: number, color: string): CSSProperties => ({
//     width: size,
//     height: size,
//     opacity: 1,
//     display: "inline-block",
//     flexShrink: 0,
//     backgroundColor: color,
//     WebkitMask: "url('/icons/pluss.svg') center / contain no-repeat",
//     mask: "url('/icons/pluss.svg') center / contain no-repeat",
//   });

//   const makeId = () =>
//     typeof crypto !== "undefined" && "randomUUID" in crypto
//       ? crypto.randomUUID()
//       : `wallet-${Date.now()}-${Math.random().toString(16).slice(2)}`;

//   const getAuthToken = () =>
//     token ||
//     localStorage.getItem("auth_token") ||
//     sessionStorage.getItem("auth_token") ||
//     localStorage.getItem("token") ||
//     sessionStorage.getItem("token") ||
//     "";

//   const onlyLetters = (value: string) =>
//     value
//       .replace(/[^A-Za-z\s]/g, "")
//       .replace(/\s{2,}/g, " ")
//       .replace(/^\s+/, "");

//   const onlyDigits = (value: string) => value.replace(/\D/g, "").slice(0, 18);

//   const resetBankForm = () => {
//     setBankForm({
//       holder: "",
//       accNum: "",
//       confirmAccNum: "",
//       ifsc: "",
//       bankName: "",
//     });
//     setFormError("");
//   };

//   const mapApiAccount = (ba: any): WalletAccount => ({
//     id: String(ba?._id || makeId()),
//     name: String(ba?.bankName || "Bank Account"),
//     last4: String(ba?.accountNumber || "").slice(-4) || "0000",
//     ifsc: String(ba?.ifscCode || "").toUpperCase(),
//     isDefault: !!ba?.default,
//     iconBg: "bg-[#1A73E8]/25",
//     iconColor: "text-[#1A73E8]",
//   });

//   const makeLocalAccount = (
//     bankName: string,
//     accNum: string,
//     ifsc: string
//   ): WalletAccount => ({
//     id: makeId(),
//     name: bankName,
//     last4: accNum.slice(-4),
//     ifsc,
//     isDefault: accounts.length === 0,
//     iconBg: "bg-[#1A73E8]/25",
//     iconColor: "text-[#1A73E8]",
//   });

//   const fetchBankAccounts = async () => {
//     const authToken = getAuthToken();
//     if (!authToken) return;

//     try {
//       const res = await fetch(BANK_LIST_URL, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//         credentials: "include",
//       });

//       const data = await res.json().catch(() => ({}));

//       if (!res.ok || !Array.isArray(data?.accounts)) return;

//       const mapped = data.accounts.map(mapApiAccount);
//       setAccounts(mapped);
//       localStorage.setItem(WALLET_ACCOUNTS_KEY, JSON.stringify(mapped));
//     } catch {}
//   };

//   useEffect(() => {
//     setAccountsLoaded(false);

//     try {
//       const raw = localStorage.getItem(WALLET_ACCOUNTS_KEY);

//       if (raw) {
//         const parsed = JSON.parse(raw);
//         setAccounts(Array.isArray(parsed) ? parsed : []);
//       } else {
//         setAccounts([]);
//       }
//     } catch {
//       setAccounts([]);
//     } finally {
//       setAccountsLoaded(true);
//     }
//   }, [WALLET_ACCOUNTS_KEY]);

//   useEffect(() => {
//     fetchBankAccounts();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token, WALLET_ACCOUNTS_KEY]);

//   useEffect(() => {
//     if (!accountsLoaded) return;
//     localStorage.setItem(WALLET_ACCOUNTS_KEY, JSON.stringify(accounts));
//   }, [accountsLoaded, WALLET_ACCOUNTS_KEY, accounts]);

//   useEffect(() => {
//     if (accounts.length === 0) setManageMode(false);
//   }, [accounts.length]);

//   const handleDeleteAccount = async (accountId: string) => {
//     setDeleteError("");
//     setDeletingAccountId(accountId);

//     const authToken = getAuthToken();

//     try {
//       if (authToken) {
//         const res = await fetch(BANK_DELETE_URL(accountId), {
//           method: "DELETE",
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//           credentials: "include",
//         });

//         const data = await res.json().catch(() => ({}));

//         if (!res.ok && res.status !== 404) {
//           const message =
//             data?.error === "account_not_found"
//               ? "Bank account not found."
//               : data?.error === "server_error"
//               ? "Server error while deleting."
//               : "Could not delete bank account.";

//           throw new Error(message);
//         }
//       }

//       setAccounts((prev) => prev.filter((a) => a.id !== accountId));

//       if (latestAddedAccount?.id === accountId) {
//         setLatestAddedAccount(null);
//       }
//     } catch (err: any) {
//       setDeleteError(err?.message || "Could not delete bank account.");
//     } finally {
//       setDeletingAccountId(null);
//     }
//   };

//   const handleSaveBank = async () => {
//     const holder = bankForm.holder.trim();
//     const accNum = bankForm.accNum.trim();
//     const confirmAccNum = bankForm.confirmAccNum.trim();
//     const ifsc = bankForm.ifsc.trim().toUpperCase();
//     const bankName = bankForm.bankName.trim();

//     setFormError("");

//     if (!holder || !accNum || !confirmAccNum || !ifsc || !bankName) {
//       setFormError("Please fill out all fields.");
//       return;
//     }

//     if (accNum !== confirmAccNum) {
//       setFormError("Account numbers do not match.");
//       return;
//     }

//     setSaveLoading(true);

//     const authToken = getAuthToken();

//     const headers: Record<string, string> = {
//       "Content-Type": "application/json",
//     };

//     if (authToken) headers.Authorization = `Bearer ${authToken}`;

//     const body = {
//       accountHolderName: holder,
//       accountNumber: accNum,
//       confirmAccountNumber: confirmAccNum,
//       ifscCode: ifsc,
//       bankName,
//       default: accounts.length === 0,
//     };

//     try {
//       let newAccount: WalletAccount | null = null;

//       try {
//         const res = await fetch(BANK_ADD_URL, {
//           method: "POST",
//           headers,
//           body: JSON.stringify(body),
//           credentials: "include",
//         });

//         const data = await res.json().catch(() => ({}));

//         if (!res.ok) {
//           const code = data?.error || `http_${res.status}`;

//           const message =
//             code === "all_fields_required"
//               ? "Please fill out all fields."
//               : code === "account_numbers_mismatch"
//               ? "Account numbers do not match."
//               : code === "account_already_exists"
//               ? "This bank account is already saved."
//               : "Could not add bank account.";

//           throw new Error(message);
//         }

//         newAccount = data?.bankAccount
//           ? mapApiAccount(data.bankAccount)
//           : makeLocalAccount(bankName, accNum, ifsc);
//       } catch (apiErr: any) {
//         if (authToken) throw apiErr;
//         newAccount = makeLocalAccount(bankName, accNum, ifsc);
//       }

//       setAccounts((prev) => {
//         const without = prev.filter(
//           (a) => !(a.name === newAccount!.name && a.last4 === newAccount!.last4)
//         );
//         return [...without, newAccount!];
//       });

//       setLatestAddedAccount(newAccount);
//       setAddBankOpen(false);
//       resetBankForm();
//       setSuccessPopupOpen(true);
//     } catch (err: any) {
//       setFormError(err?.message || "Could not add bank account.");
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   // ── Format helpers ──
//   const fmt = (n: number) =>
//     new Intl.NumberFormat("en-IN", {
//       maximumFractionDigits: 2,
//     }).format(n || 0);


//     const getMonthOptions = () => {
//   const options = [];
//   const now = new Date();
//   for (let i = 0; i < 12; i++) {
//     const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
//     const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
//     const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
//     options.push({ value, label });
//   }
//   return options;
// };

//   const fmtDate = (d: string) =>
//     new Date(d).toLocaleDateString("en-US", {
//       month: "short",
//       day: "2-digit",
//       year: "numeric",
//     });

//   const getTransactionStatusLabel = (item: Transaction) => {
//     if (item.displayStatus) return item.displayStatus;

//     if (item.status === "Completed") return "Successful";
//     if (item.status === "Pending") return "Pending";
//     if (item.status === "Rejected") return "Rejected";

//     if (item.status === "Failed") {
//       return item.source === "withdrawal" ? "Rejected" : "Failed";
//     }

//     return item.status || "Pending";
//   };

//   const getTransactionStatusClass = (item: Transaction) => {
//     const label = getTransactionStatusLabel(item).toLowerCase();

//     if (label === "pending") return "text-[#F97316]";
//     if (label === "successful" || label === "completed") return "text-[#4ADE80]";
//     if (label === "rejected" || label === "failed") return "text-[#F87171]";

//     return "text-[#C084FC]";
//   };

//   // ✅ Payment history pagination calculations
//   const paymentHistory = walletData.recentTransactions || [];
//   const historyTotal = paymentHistory.length;
//   const historyTotalPages = Math.max(
//     1,
//     Math.ceil(historyTotal / historyPageSize)
//   );

//   const safeHistoryPage = Math.min(historyPage, historyTotalPages);
//   const historyStartIndex = (safeHistoryPage - 1) * historyPageSize;
//   const historyEndIndex = Math.min(
//     historyStartIndex + historyPageSize,
//     historyTotal
//   );
// const filteredPaymentHistory = paymentHistory.filter((item) => {
//   if (!item.date) return false;
//   const d = new Date(item.date);
//   const itemMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
//   return itemMonth === selectedMonth;
// });


    


//   const paginatedPaymentHistory = paymentHistory.slice(
//     historyStartIndex,
//     historyStartIndex + historyPageSize
//   );

//   return (
//     <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
//       <div
//         aria-hidden
//         className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
//       >
//         <img
//           src="/icons/mpbg.png"
//           alt="background"
//           className="absolute inset-0 w-full h-screen object-contain object-top select-none"
//         />
//       </div>

//       <div className="relative z-20 w-full bg-transparent px-4">
//         <Header />
//       </div>

//       <main className="relative z-10 px-4 pt-[20px] pb-20">
//         <section
//           className="mx-auto overflow-hidden"
//           style={{
//             width: "min(1024px, 100%)",
//             minHeight: 1124,
//             borderRadius: 30,
//             background: "#21212180",
//             backdropFilter: "blur(20px)",
//             WebkitBackdropFilter: "blur(20px)",
//             fontFamily: fontBase,
//           }}
//         >
//           <div className="p-8 sm:p-[50px]">
//             {/* Title */}
//             <div>
//               <h1
//                 className="text-white"
//                 style={{
//                   fontFamily: fontBase,
//                   fontWeight: 700,
//                   fontSize: 36,
//                   lineHeight: "100%",
//                 }}
//               >
//                 My Wallet
//               </h1>

//               <p
//                 className="mt-4 max-w-[600px]"
//                 style={{
//                   fontFamily: fontBase,
//                   fontWeight: 400,
//                   fontSize: 16,
//                   lineHeight: "24px",
//                   color: "#A1A1AA",
//                 }}
//               >
//                 Track your revenue and manage your withdrawals in one clean,
//                 centralized view.
//               </p>
//             </div>

//             <div className="mt-7 grid grid-cols-1 lg:grid-cols-[1fr_294px] gap-5">
//               {/* ── Balance card ── */}
//               <div
//                 className="relative overflow-hidden border border-white/10"
//                 style={{
//                   minHeight: 379,
//                   borderRadius: 28,
//                   background: "rgba(23,23,26,0.56)",
//                 }}
//               >
//                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />

//                 <div className="relative z-10 p-8">
//                   <p
//                     style={{
//                       fontFamily: fontBase,
//                       fontWeight: 600,
//                       fontSize: 12,
//                       lineHeight: "12px",
//                       letterSpacing: "1.2px",
//                       color: "#C084FC",
//                       textTransform: "uppercase",
//                     }}
//                   >
//                     Available to Withdraw
//                   </p>

//                   <h2
//                     className="mt-5 text-white"
//                     style={{
//                       fontFamily: fontBase,
//                       fontWeight: 900,
//                       fontSize: 60,
//                       lineHeight: "60px",
//                     }}
//                   >
//                     {walletLoading
//                       ? "Loading..."
//                       : `₹ ${fmt(walletData.availableBalance)}`}
//                   </h2>

//                   <div className="mt-12 flex flex-wrap items-center gap-4">
//                     <button
//                       type="button"
//                       onClick={() => navigate("/add-funds")}
//                       className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[10px] px-7 text-white"
//                       style={{
//                         ...buttonTextStyle,
//                         background:
//                           "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)",
//                       }}
//                     >
//                       <span aria-hidden style={plusMaskStyle(10.5, "#FFFFFF")} />
//                       Add
//                     </button>

//                     <button
//                       type="button"
//                       onClick={() => navigate("/withdraw")}
//                       className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[10px] border border-white/15 bg-white/10 px-7 text-white"
//                       style={buttonTextStyle}
//                     >
//                       <img
//                         src="/icons/with.svg"
//                         alt=""
//                         style={{ width: 13.5, height: 13.5 }}
//                         onError={(e) => {
//                           e.currentTarget.style.display = "none";
//                         }}
//                       />
//                       Withdraw
//                     </button>
//                   </div>

//                   <div className="mt-12 h-px w-full bg-white/10" />

//                   <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
//                     <div>
//                       <p
//                         style={{
//                           fontFamily: fontBase,
//                           fontWeight: 400,
//                           fontSize: 14,
//                           lineHeight: "100%",
//                           color: "rgba(255,255,255,0.35)",
//                         }}
//                       >
//                         Total Earning
//                       </p>

//                       <p
//                         className="mt-3"
//                         style={{
//                           fontFamily: fontBase,
//                           fontWeight: 700,
//                           fontSize: 24,
//                           lineHeight: "100%",
//                           color: "#FFFFFF",
//                         }}
//                       >
//                         {walletLoading ? "—" : `₹${fmt(walletData.totalRevenue)}`}
//                       </p>
//                     </div>

//                     <div>
//                       <p
//                         style={{
//                           fontFamily: fontBase,
//                           fontWeight: 400,
//                           fontSize: 14,
//                           lineHeight: "100%",
//                           color: "rgba(255,255,255,0.35)",
//                         }}
//                       >
//                         Monthly Earnings
//                       </p>

//                       <p
//                         className="mt-3"
//                         style={{
//                           fontFamily: fontBase,
//                           fontWeight: 700,
//                           fontSize: 24,
//                           lineHeight: "100%",
//                           color: "#ADC6FF",
//                         }}
//                       >
//                         {walletLoading
//                           ? "—"
//                           : `₹${fmt(walletData.monthlyEarning)}`}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* ── Accounts card ── */}
//               <div
//                 className="relative overflow-hidden border border-white/10"
//                 style={{
//                   minHeight: 379,
//                   borderRadius: 28,
//                   background: "rgba(23,23,26,0.56)",
//                 }}
//               >
//                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(255,20,239,0.14),transparent_55%)]" />

//                 <div className="relative z-10 p-8">
//                   <div className="flex items-center justify-between">
//                     <h3
//                       className="text-white"
//                       style={{
//                         fontFamily: fontBase,
//                         fontWeight: 700,
//                         fontSize: 18,
//                         lineHeight: "100%",
//                       }}
//                     >
//                       Accounts
//                     </h3>

//                     <button
//                       type="button"
//                       onClick={() => {
//                         setDeleteError("");
//                         setManageMode(true);
//                       }}
//                       disabled={accounts.length === 0}
//                       style={{
//                         fontFamily: fontBase,
//                         fontWeight: 700,
//                         fontSize: 14,
//                         lineHeight: "100%",
//                         color:
//                           accounts.length === 0
//                             ? "rgba(255,255,255,0.35)"
//                             : "#C084FC",
//                         cursor: accounts.length === 0 ? "not-allowed" : "pointer",
//                       }}
//                     >
//                       Manage
//                     </button>
//                   </div>

//                   <div className="mt-7 space-y-3">
//                     {deleteError && (
//                       <div
//                         className="rounded-[10px] border px-3 py-2 text-xs text-white"
//                         style={{
//                           background: "#2A1717",
//                           borderColor: "rgba(239,68,68,0.35)",
//                         }}
//                       >
//                         {deleteError}
//                       </div>
//                     )}

//                     {accounts.length === 0 ? (
//                       <div className="rounded-[10px] border border-white/5 bg-white/[0.04] px-4 py-5 text-sm text-white/50">
//                         No bank accounts added yet
//                       </div>
//                     ) : (
//                       accounts.map((account) => {
//                         const isDeleting = deletingAccountId === account.id;

//                         return (
//                           <div
//                             key={account.id}
//                             className="relative overflow-hidden rounded-[10px]"
//                           >
//                             <div
//                               className="flex h-[70px] items-center gap-4 rounded-[10px] border border-white/5 bg-white/[0.06] px-4"
//                               style={{
//                                 paddingRight: manageMode ? 54 : 16,
//                                 transition: "padding-right 220ms ease",
//                               }}
//                             >
//                               <div
//                                 className={`grid h-9 w-9 place-items-center rounded-full ${account.iconBg}`}
//                               >
//                                 <Landmark
//                                   className={`h-5 w-5 ${account.iconColor}`}
//                                 />
//                               </div>

//                               <div className="min-w-0">
//                                 <p
//                                   className="truncate text-white"
//                                   style={{
//                                     fontFamily: fontBase,
//                                     fontWeight: 700,
//                                     fontSize: 14,
//                                     lineHeight: "100%",
//                                   }}
//                                 >
//                                   {account.name}
//                                 </p>

//                                 <p
//                                   className="mt-2"
//                                   style={{
//                                     fontFamily: fontBase,
//                                     fontWeight: 400,
//                                     fontSize: 10,
//                                     lineHeight: "100%",
//                                     color: "rgba(255,255,255,0.35)",
//                                   }}
//                                 >
//                                   •••• {account.last4}
//                                 </p>
//                               </div>
//                             </div>

//                             <button
//                               type="button"
//                               aria-label={`Delete ${account.name}`}
//                               disabled={!manageMode || isDeleting}
//                               onClick={() => handleDeleteAccount(account.id)}
//                               className="absolute grid h-9 w-9 place-items-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-60"
//                               style={{
//                                 top: "50%",
//                                 right: 10,
//                                 opacity: manageMode ? 1 : 0,
//                                 pointerEvents: manageMode ? "auto" : "none",
//                                 transform: manageMode
//                                   ? "translateY(-50%) translateX(0)"
//                                   : "translateY(-50%) translateX(24px)",
//                                 transition:
//                                   "opacity 220ms ease, transform 220ms ease",
//                               }}
//                             >
//                               <Trash className="h-4 w-4" />
//                             </button>
//                           </div>
//                         );
//                       })
//                     )}
//                   </div>

//                   {manageMode ? (
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setManageMode(false);
//                         setDeleteError("");
//                       }}
//                       className={`${
//                         accounts.length === 0 ? "mt-7" : "mt-20"
//                       } flex h-[38px] w-full items-center justify-center rounded-[8px]`}
//                       style={{
//                         background:
//                           "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)",
//                         border: "none",
//                         fontFamily: fontBase,
//                         fontWeight: 700,
//                         fontSize: 12,
//                         lineHeight: "100%",
//                         color: "#FFFFFF",
//                       }}
//                     >
//                       Done
//                     </button>
//                   ) : (
//                     <button
//                       type="button"
//                       onClick={() => {
//                         resetBankForm();
//                         setAddBankOpen(true);
//                       }}
//                       className={`${
//                         accounts.length === 0 ? "mt-7" : "mt-20"
//                       } flex h-[38px] w-full items-center justify-center gap-2 rounded-[8px]`}
//                       style={{
//                         background: "#FFFFFF0D",
//                         border: "1px solid #FFFFFF33",
//                         fontFamily: fontBase,
//                         fontWeight: 700,
//                         fontSize: 12,
//                         lineHeight: "100%",
//                         color: "#A1A1AA",
//                       }}
//                     >
//                       <span aria-hidden style={plusMaskStyle(7, "#A1A1AA")} />
//                       Add Card
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* ── Transaction history ── */}
//             <div
//               className="mt-5 overflow-hidden border border-white/10"
//               style={{
//                 borderRadius: 28,
//                 background: "rgba(23,23,26,0.56)",
//               }}
//             >
//               <div className="relative">
//                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(255,20,239,0.22),transparent_45%)]" />

//                 <div className="relative z-10">
//                   <div className="flex flex-col gap-5 border-b border-white/10 p-8 sm:flex-row sm:items-center sm:justify-between">
//   <div>
//     <h3
//       className="text-white"
//       style={{
//         fontFamily: fontBase,
//         fontWeight: 700,
//         fontSize: 20,
//         lineHeight: "100%",
//       }}
//     >
//       Payment History
//     </h3>

//     <p
//       className="mt-3"
//       style={{
//         fontFamily: fontBase,
//         fontWeight: 400,
//         fontSize: 14,
//         lineHeight: "100%",
//         color: "rgba(255,255,255,0.35)",
//       }}
//     >
//       Track all earnings and withdrawals
//     </p>
//   </div>

//   {/* ── Month filter — same as image ── */}
//   <div className="flex items-center gap-2 shrink-0">
//     <div className="relative">
//       <select
//         value={selectedMonth}
//         onChange={(e) => {
//           setSelectedMonth(e.target.value);
//           setHistoryPage(1);
//         }}
//         style={{
//           appearance: "none",
//           WebkitAppearance: "none",
//           background: "#0D0D0F",
//           border: "1px solid rgba(255,255,255,0.12)",
//           borderRadius: 8,
//           color: "#FFFFFF",
//           fontFamily: fontBase,
//           fontWeight: 600,
//           fontSize: 13,
//           padding: "9px 36px 9px 14px",
//           cursor: "pointer",
//           outline: "none",
//         }}
//       >
//         {getMonthOptions().map((opt) => (
//           <option key={opt.value} value={opt.value} style={{ background: "#0D0D0F" }}>
//             {opt.label}
//           </option>
//         ))}
//       </select>

//       {/* Dropdown arrow */}
//       <span
//         style={{
//           position: "absolute",
//           right: 10,
//           top: "50%",
//           transform: "translateY(-50%)",
//           pointerEvents: "none",
//           color: "rgba(255,255,255,0.5)",
//           fontSize: 11,
//         }}
//       >
//         ▾
//       </span>
//     </div>

//     {/* Filter icon button */}
//     <button
//       type="button"
//       style={{
//         width: 38,
//         height: 38,
//         borderRadius: 8,
//         background: "#0D0D0F",
//         border: "1px solid rgba(255,255,255,0.12)",
//         display: "grid",
//         placeItems: "center",
//         cursor: "pointer",
//         flexShrink: 0,
//       }}
//     >
//       <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//         <path d="M2 4h12M4 8h8M6 12h4" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
//       </svg>
//     </button>
//   </div>
// </div>

//                   <div className="overflow-x-auto">
//                     <table className="w-full min-w-[760px]">
//                       <thead>
//                         <tr className="text-left">
//                           <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
//                             Date
//                           </th>
//                           <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
//                             Description
//                           </th>
//                           <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
//                             Status
//                           </th>
//                           <th className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
//                             Amount
//                           </th>
//                         </tr>
//                       </thead>

//                       <tbody>
//                         {walletLoading ? (
//                           <tr>
//                             <td
//                               colSpan={4}
//                               className="px-8 py-10 text-center text-white/50 text-sm"
//                             >
//                               Loading transactions…
//                             </td>
//                           </tr>
//                         ) : paymentHistory.length === 0 ? (
//                           <tr>
//                             <td
//                               colSpan={4}
//                               className="px-8 py-10 text-center text-white/50 text-sm"
//                             >
//                               No transactions yet. Sales will appear here.
//                             </td>
//                           </tr>
//                         ) : (
//                           paginatedPaymentHistory.map((item) => (
//                             <tr key={item.id} className="border-t border-white/10">
//                               <td
//                                 className="px-8 py-7 text-white"
//                                 style={tableDateValueStyle}
//                               >
//                                 {fmtDate(item.date)}
//                               </td>

//                               <td
//                                 className="px-8 py-7 text-white"
//                                 style={tableDescriptionValueStyle}
//                               >
//                                 {item.description}
//                               </td>

//                               <td
//                                 className={`px-8 py-7 ${getTransactionStatusClass(
//                                   item
//                                 )}`}
//                                 style={tableStatusValueStyle}
//                               >
//                                 {getTransactionStatusLabel(item)}
//                               </td>

//                               <td
//                                 className={
//                                   item.type === "credit"
//                                     ? "px-8 py-7 text-[#4ADE80]"
//                                     : "px-8 py-7 text-[#F87171]"
//                                 }
//                                 style={tableAmountValueStyle}
//                               >
//                                 {item.amount}
//                               </td>
//                             </tr>
//                           ))
//                         )}
//                       </tbody>
//                     </table>
//                   </div>

//                   {/* ✅ Payment history pagination */}
//                   {historyTotal > historyPageSize && (
//                     <div className="flex flex-col gap-3 border-t border-white/10 px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
//                       <div className="text-xs text-white/50">
//                         Showing{" "}
//                         <span className="font-semibold text-white/80">
//                           {historyTotal === 0 ? 0 : historyStartIndex + 1}
//                         </span>{" "}
//                         to{" "}
//                         <span className="font-semibold text-white/80">
//                           {historyEndIndex}
//                         </span>{" "}
//                         of{" "}
//                         <span className="font-semibold text-white/80">
//                           {historyTotal}
//                         </span>{" "}
//                         payments
//                       </div>

//                       <div className="flex items-center gap-2">
//                         <button
//                           type="button"
//                           disabled={safeHistoryPage <= 1}
//                           onClick={() =>
//                             setHistoryPage((p) => Math.max(1, p - 1))
//                           }
//                           className="h-9 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-white/75 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
//                         >
//                           Prev
//                         </button>

//                         <span className="min-w-[76px] text-center text-xs text-white/50">
//                           Page {safeHistoryPage} / {historyTotalPages}
//                         </span>

//                         <button
//                           type="button"
//                           disabled={safeHistoryPage >= historyTotalPages}
//                           onClick={() =>
//                             setHistoryPage((p) =>
//                               Math.min(historyTotalPages, p + 1)
//                             )
//                           }
//                           className="h-9 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-white/75 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
//                         >
//                           Next
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>

//       {/* ── Add Bank Modal ── */}
//       {addBankOpen && (
//         <div
//           role="dialog"
//           aria-modal="true"
//           className="fixed inset-0 z-[1200] grid place-items-center px-4"
//         >
//           <div
//             className="absolute inset-0 bg-black/70 backdrop-blur-sm"
//             onClick={() => {
//               setAddBankOpen(false);
//               resetBankForm();
//             }}
//           />

//           <div
//             className="relative w-full max-w-[620px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 text-white shadow-2xl no-scrollbar"
//             style={{
//               background: "#17171A",
//               border: "1px solid rgba(255,255,255,0.10)",
//               fontFamily: fontBase,
//             }}
//           >
//             <button
//               type="button"
//               aria-label="Close"
//               onClick={() => {
//                 setAddBankOpen(false);
//                 resetBankForm();
//               }}
//               className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 hover:bg-black/80"
//             >
//               <X className="h-4 w-4 text-white/90" />
//             </button>

//             <h3 className="text-[22px] font-semibold leading-[100%] text-white">
//               Account Details
//             </h3>

//             <p className="mt-2 text-sm text-white/55">
//               Add your bank account details to receive withdrawals.
//             </p>

//             {formError && (
//               <div
//                 className="mt-5 rounded-xl border px-4 py-3 text-sm text-white"
//                 style={{
//                   background: "#2A1717",
//                   borderColor: "rgba(239,68,68,0.35)",
//                 }}
//               >
//                 {formError}
//               </div>
//             )}

//             <div className="mt-6 space-y-5">
//               {[
//                 {
//                   label: "Account holder name",
//                   key: "holder" as const,
//                   placeholder: "Enter account holder name",
//                   onChange: (v: string) => onlyLetters(v),
//                 },
//                 {
//                   label: "Account number",
//                   key: "accNum" as const,
//                   placeholder: "Enter account number",
//                   onChange: onlyDigits,
//                 },
//                 {
//                   label: "Confirm account number",
//                   key: "confirmAccNum" as const,
//                   placeholder: "Re-enter account number",
//                   onChange: onlyDigits,
//                 },
//               ].map(({ label, key, placeholder, onChange }) => (
//                 <div key={key}>
//                   <label className="mb-2 block text-sm text-white/80">
//                     {label}
//                   </label>

//                   <input
//                     value={bankForm[key]}
//                     onChange={(e) =>
//                       setBankForm((p) => ({
//                         ...p,
//                         [key]: onChange(e.target.value),
//                       }))
//                     }
//                     className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
//                     placeholder={placeholder}
//                     inputMode={key !== "holder" ? "numeric" : undefined}
//                   />
//                 </div>
//               ))}

//               <div>
//                 <label className="mb-2 block text-sm text-white/80">
//                   IFSC Code
//                 </label>

//                 <div className="relative">
//                   <input
//                     value={bankForm.ifsc}
//                     onChange={(e) =>
//                       setBankForm((p) => ({
//                         ...p,
//                         ifsc: e.target.value.toUpperCase(),
//                       }))
//                     }
//                     className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 pr-[112px] text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
//                     placeholder="IFSC Code"
//                   />

//                   <button
//                     type="button"
//                     className="absolute bottom-1 right-1 top-1 rounded-md px-4 text-sm text-white"
//                     style={{
//                       background:
//                         "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
//                     }}
//                   >
//                     Find IFSC
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <label className="mb-2 block text-sm text-white/80">
//                   Bank name
//                 </label>

//                 <input
//                   value={bankForm.bankName}
//                   onChange={(e) =>
//                     setBankForm((p) => ({
//                       ...p,
//                       bankName: e.target.value,
//                     }))
//                   }
//                   className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
//                   placeholder="Bank name"
//                 />
//               </div>

//               <div className="flex items-center justify-end gap-3 pt-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setAddBankOpen(false);
//                     resetBankForm();
//                   }}
//                   className="h-[49px] w-[100px] rounded-[6px] border border-white text-white/90"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="button"
//                   onClick={handleSaveBank}
//                   disabled={saveLoading}
//                   className="h-[49px] w-[162px] rounded-[6px] px-[15px] text-white transition-opacity disabled:opacity-60"
//                   style={{
//                     background:
//                       "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
//                   }}
//                 >
//                   {saveLoading ? "Saving..." : "Save & Continue"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Success popup ── */}
//       {successPopupOpen && (
//         <div
//           role="dialog"
//           aria-modal="true"
//           className="fixed inset-0 z-[1300] grid place-items-center px-4"
//         >
//           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

//           <div
//             className="relative text-white shadow-2xl"
//             style={{
//               width: "min(500px, 94vw)",
//               minHeight: 300,
//               borderRadius: 10,
//               background: "#030405",
//               fontFamily: fontBase,
//               padding: "30px 24px",
//             }}
//           >
//             <button
//               type="button"
//               aria-label="Close"
//               onClick={() => setSuccessPopupOpen(false)}
//               className="absolute right-5 top-5 grid place-items-center text-white/50 hover:text-white"
//             >
//               <X className="h-5 w-5" />
//             </button>

//             <div className="mx-auto grid h-[80px] w-[80px] place-items-center rounded-full bg-[#052A1D]">
//               <div className="grid h-[36px] w-[36px] place-items-center rounded-full bg-[#21B37A]">
//                 <Check className="h-5 w-5 text-black" strokeWidth={3} />
//               </div>
//             </div>

//             <div className="mt-6 text-center">
//               <h3
//                 style={{
//                   fontFamily: fontBase,
//                   fontWeight: 700,
//                   fontSize: 22,
//                   lineHeight: "100%",
//                   color: "#FFFFFF",
//                 }}
//               >
//                 Bank account added
//               </h3>

//               <p
//                 className="mt-3"
//                 style={{
//                   fontFamily: fontBase,
//                   fontWeight: 400,
//                   fontSize: 18,
//                   lineHeight: "130%",
//                   color: "#FFFFFF",
//                 }}
//               >
//                 {latestAddedAccount?.name || "Bank"} ••
//                 {latestAddedAccount?.last4 || "0000"} added successfully
//               </p>
//             </div>

//             <div className="mt-8 flex items-center justify-center gap-6">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setSuccessPopupOpen(false);
//                   resetBankForm();
//                   setAddBankOpen(true);
//                 }}
//                 style={{
//                   fontFamily: fontBase,
//                   fontWeight: 400,
//                   fontSize: 16,
//                   lineHeight: "24px",
//                   color: "#FFFFFF",
//                 }}
//               >
//                 Add Another
//               </button>

//               <button
//                 type="button"
//                 onClick={() => {
//                   setSuccessPopupOpen(false);
//                   setAddBankOpen(false);
//                 }}
//                 className="h-[50px] rounded-[7px] px-5"
//                 style={{
//                   background: "#333335",
//                   fontFamily: fontBase,
//                   fontWeight: 400,
//                   fontSize: 16,
//                   lineHeight: "24px",
//                   color: "#FFFFFF",
//                 }}
//               >
//                 View
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="relative z-10 mt-20">
//         <Footer />
//       </div>

//       <style>{`
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>
//     </div>
//   );
// };

// export default Wallet;



// src/pages/Wallet.tsx
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Landmark, X, Check, Trash, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type WalletAccount = {
  id: string;
  name: string;
  last4: string;
  ifsc?: string;
  isDefault?: boolean;
  iconBg: string;
  iconColor: string;
};

type BankForm = {
  holder: string;
  accNum: string;
  confirmAccNum: string;
  ifsc: string;
  bankName: string;
};

type Transaction = {
  id: string;
  date: string;
  description: string;
  status: string;
  amount: string;
  type: "credit" | "debit";
  displayStatus?: string;
  source?: string;
};

type WalletData = {
  totalRevenue: number;
  availableBalance: number;
  monthlyEarning: number;
  recentTransactions: Transaction[];
};

const Wallet = () => {
  const { token, user } = useAuth() as any;
  const navigate = useNavigate();

  const fontBase = "Inter, system-ui, Arial, sans-serif";

  const API_BASE =
    (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";

  const BANK_ADD_URL = `${API_BASE}/api/bankaccount/add`;
  const BANK_LIST_URL = `${API_BASE}/api/bankaccount`;
  const BANK_DELETE_URL = (id: string) => `${API_BASE}/api/bankaccount/${id}`;
  const WALLET_URL = `${API_BASE}/api/wallet/balance`;

  const userStorageId = user?._id || user?.id || user?.email || "guest";

  const WALLET_ACCOUNTS_KEY = useMemo(
    () => `tokun_wallet_accounts_${userStorageId}`,
    [userStorageId]
  );

  const [walletData, setWalletData] = useState<WalletData>({
    totalRevenue: 0,
    availableBalance: 0,
    monthlyEarning: 0,
    recentTransactions: [],
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const [walletLoading, setWalletLoading] = useState(false);

  const [historyPage, setHistoryPage] = useState(1);
  const historyPageSize = 5;

  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [accountsLoaded, setAccountsLoaded] = useState(false);
  const [addBankOpen, setAddBankOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successPopupOpen, setSuccessPopupOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [latestAddedAccount, setLatestAddedAccount] =
    useState<WalletAccount | null>(null);
  const [manageMode, setManageMode] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(
    null
  );
  const [deleteError, setDeleteError] = useState("");

  const [bankForm, setBankForm] = useState<BankForm>({
    holder: "",
    accNum: "",
    confirmAccNum: "",
    ifsc: "",
    bankName: "",
  });

  const fetchWalletData = async () => {
    if (!token) return;

    try {
      setWalletLoading(true);

      const res = await fetch(WALLET_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setWalletData(data);
        setHistoryPage(1);
      }
    } catch (err) {
      console.error("Wallet fetch error:", err);
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "tokun:lastRelease") {
        fetchWalletData();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [token]);

  const buttonTextStyle: CSSProperties = {
    fontFamily: fontBase,
    fontWeight: 700,
    fontStyle: "normal",
    fontSize: 16,
    lineHeight: "24px",
    letterSpacing: 0,
    textAlign: "center",
  };

  const tableDateValueStyle: CSSProperties = {
    fontFamily: fontBase,
    fontWeight: 500,
    fontStyle: "normal",
    fontSize: 14,
    lineHeight: "20px",
    letterSpacing: 0,
  };

  const tableDescriptionValueStyle: CSSProperties = {
    fontFamily: fontBase,
    fontWeight: 700,
    fontStyle: "normal",
    fontSize: 14,
    lineHeight: "20px",
    letterSpacing: 0,
  };

  const tableStatusValueStyle: CSSProperties = {
    fontFamily: fontBase,
    fontWeight: 700,
    fontStyle: "normal",
    fontSize: 14,
    lineHeight: "20px",
    letterSpacing: 0,
  };

  const tableAmountValueStyle: CSSProperties = {
    fontFamily: fontBase,
    fontWeight: 900,
    fontStyle: "normal",
    fontSize: 16,
    lineHeight: "100%",
    letterSpacing: 0,
    textAlign: "right",
  };

  const plusMaskStyle = (size: number, color: string): CSSProperties => ({
    width: size,
    height: size,
    opacity: 1,
    display: "inline-block",
    flexShrink: 0,
    backgroundColor: color,
    WebkitMask: "url('/icons/pluss.svg') center / contain no-repeat",
    mask: "url('/icons/pluss.svg') center / contain no-repeat",
  });

  const makeId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `wallet-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const getAuthToken = () =>
    token ||
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";

  const onlyLetters = (value: string) =>
    value
      .replace(/[^A-Za-z\s]/g, "")
      .replace(/\s{2,}/g, " ")
      .replace(/^\s+/, "");

  const onlyDigits = (value: string) => value.replace(/\D/g, "").slice(0, 18);

  const resetBankForm = () => {
    setBankForm({
      holder: "",
      accNum: "",
      confirmAccNum: "",
      ifsc: "",
      bankName: "",
    });
    setFormError("");
  };

  const mapApiAccount = (ba: any): WalletAccount => ({
    id: String(ba?._id || makeId()),
    name: String(ba?.bankName || "Bank Account"),
    last4: String(ba?.accountNumber || "").slice(-4) || "0000",
    ifsc: String(ba?.ifscCode || "").toUpperCase(),
    isDefault: !!ba?.default,
    iconBg: "bg-[#1A73E8]/25",
    iconColor: "text-[#1A73E8]",
  });

  const makeLocalAccount = (
    bankName: string,
    accNum: string,
    ifsc: string
  ): WalletAccount => ({
    id: makeId(),
    name: bankName,
    last4: accNum.slice(-4),
    ifsc,
    isDefault: accounts.length === 0,
    iconBg: "bg-[#1A73E8]/25",
    iconColor: "text-[#1A73E8]",
  });

  const fetchBankAccounts = async () => {
    const authToken = getAuthToken();
    if (!authToken) return;

    try {
      const res = await fetch(BANK_LIST_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !Array.isArray(data?.accounts)) return;

      const mapped = data.accounts.map(mapApiAccount);
      setAccounts(mapped);
      localStorage.setItem(WALLET_ACCOUNTS_KEY, JSON.stringify(mapped));
    } catch {}
  };

  useEffect(() => {
    setAccountsLoaded(false);

    try {
      const raw = localStorage.getItem(WALLET_ACCOUNTS_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);
        setAccounts(Array.isArray(parsed) ? parsed : []);
      } else {
        setAccounts([]);
      }
    } catch {
      setAccounts([]);
    } finally {
      setAccountsLoaded(true);
    }
  }, [WALLET_ACCOUNTS_KEY]);

  useEffect(() => {
    fetchBankAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, WALLET_ACCOUNTS_KEY]);

  useEffect(() => {
    if (!accountsLoaded) return;
    localStorage.setItem(WALLET_ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accountsLoaded, WALLET_ACCOUNTS_KEY, accounts]);

  useEffect(() => {
    if (accounts.length === 0) setManageMode(false);
  }, [accounts.length]);

  const handleDeleteAccount = async (accountId: string) => {
    setDeleteError("");
    setDeletingAccountId(accountId);

    const authToken = getAuthToken();

    try {
      if (authToken) {
        const res = await fetch(BANK_DELETE_URL(accountId), {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok && res.status !== 404) {
          const message =
            data?.error === "account_not_found"
              ? "Bank account not found."
              : data?.error === "server_error"
              ? "Server error while deleting."
              : "Could not delete bank account.";

          throw new Error(message);
        }
      }

      setAccounts((prev) => prev.filter((a) => a.id !== accountId));

      if (latestAddedAccount?.id === accountId) {
        setLatestAddedAccount(null);
      }
    } catch (err: any) {
      setDeleteError(err?.message || "Could not delete bank account.");
    } finally {
      setDeletingAccountId(null);
    }
  };

  const handleSaveBank = async () => {
    const holder = bankForm.holder.trim();
    const accNum = bankForm.accNum.trim();
    const confirmAccNum = bankForm.confirmAccNum.trim();
    const ifsc = bankForm.ifsc.trim().toUpperCase();
    const bankName = bankForm.bankName.trim();

    setFormError("");

    if (!holder || !accNum || !confirmAccNum || !ifsc || !bankName) {
      setFormError("Please fill out all fields.");
      return;
    }

    if (accNum !== confirmAccNum) {
      setFormError("Account numbers do not match.");
      return;
    }

    setSaveLoading(true);

    const authToken = getAuthToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const body = {
      accountHolderName: holder,
      accountNumber: accNum,
      confirmAccountNumber: confirmAccNum,
      ifscCode: ifsc,
      bankName,
      default: accounts.length === 0,
    };

    try {
      let newAccount: WalletAccount | null = null;

      try {
        const res = await fetch(BANK_ADD_URL, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const code = data?.error || `http_${res.status}`;

          const message =
            code === "all_fields_required"
              ? "Please fill out all fields."
              : code === "account_numbers_mismatch"
              ? "Account numbers do not match."
              : code === "account_already_exists"
              ? "This bank account is already saved."
              : "Could not add bank account.";

          throw new Error(message);
        }

        newAccount = data?.bankAccount
          ? mapApiAccount(data.bankAccount)
          : makeLocalAccount(bankName, accNum, ifsc);
      } catch (apiErr: any) {
        if (authToken) throw apiErr;
        newAccount = makeLocalAccount(bankName, accNum, ifsc);
      }

      setAccounts((prev) => {
        const without = prev.filter(
          (a) => !(a.name === newAccount!.name && a.last4 === newAccount!.last4)
        );
        return [...without, newAccount!];
      });

      setLatestAddedAccount(newAccount);
      setAddBankOpen(false);
      resetBankForm();
      setSuccessPopupOpen(true);
    } catch (err: any) {
      setFormError(err?.message || "Could not add bank account.");
    } finally {
      setSaveLoading(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(n || 0);

  const getMonthOptions = () => {
    const options = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;

      const label = d.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      options.push({ value, label });
    }

    return options;
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  const getTransactionStatusLabel = (item: Transaction) => {
    if (item.displayStatus) return item.displayStatus;

    if (item.status === "Completed") return "Successful";
    if (item.status === "Pending") return "Pending";
    if (item.status === "Rejected") return "Rejected";

    if (item.status === "Failed") {
      return item.source === "withdrawal" ? "Rejected" : "Failed";
    }

    return item.status || "Pending";
  };

  const getTransactionStatusClass = (item: Transaction) => {
    const label = getTransactionStatusLabel(item).toLowerCase();

    if (label === "pending") return "text-[#F97316]";
    if (label === "successful" || label === "completed")
      return "text-[#4ADE80]";
    if (label === "rejected" || label === "failed") return "text-[#F87171]";

    return "text-[#C084FC]";
  };

  const paymentHistory = walletData.recentTransactions || [];

  const filteredPaymentHistory = paymentHistory.filter((item) => {
    if (!item.date) return false;

    const d = new Date(item.date);
    if (Number.isNaN(d.getTime())) return false;

    const itemMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    return itemMonth === selectedMonth;
  });

  const historyTotal = filteredPaymentHistory.length;

  const historyTotalPages = Math.max(
    1,
    Math.ceil(historyTotal / historyPageSize)
  );

  const safeHistoryPage = Math.min(historyPage, historyTotalPages);
  const historyStartIndex = (safeHistoryPage - 1) * historyPageSize;

  const historyEndIndex = Math.min(
    historyStartIndex + historyPageSize,
    historyTotal
  );

  const paginatedPaymentHistory = filteredPaymentHistory.slice(
    historyStartIndex,
    historyStartIndex + historyPageSize
  );

  return (
    <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <img
          src="/icons/mpbg.png"
          alt="background"
          className="absolute inset-0 w-full h-screen object-contain object-top select-none"
        />
      </div>

      <div className="relative z-20 w-full bg-transparent px-4">
        <Header />
      </div>

      <main className="relative z-10 px-4 pt-[20px] pb-20">
        <section
          className="mx-auto overflow-hidden"
          style={{
            width: "min(1024px, 100%)",
            minHeight: 1124,
            borderRadius: 30,
            background: "#21212180",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            fontFamily: fontBase,
          }}
        >
          <div className="p-8 sm:p-[50px]">
            <div>
              <h1
                className="text-white"
                style={{
                  fontFamily: fontBase,
                  fontWeight: 700,
                  fontSize: 36,
                  lineHeight: "100%",
                }}
              >
                My Wallet
              </h1>

              <p
                className="mt-4 max-w-[600px]"
                style={{
                  fontFamily: fontBase,
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: "24px",
                  color: "#A1A1AA",
                }}
              >
                Track your revenue and manage your withdrawals in one clean,
                centralized view.
              </p>
            </div>

            <div className="mt-7 grid grid-cols-1 lg:grid-cols-[1fr_294px] gap-5">
              <div
                className="relative overflow-hidden border border-white/10"
                style={{
                  minHeight: 379,
                  borderRadius: 28,
                  background: "rgba(23,23,26,0.56)",
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />

                <div className="relative z-10 p-8">
                  <p
                    style={{
                      fontFamily: fontBase,
                      fontWeight: 600,
                      fontSize: 12,
                      lineHeight: "12px",
                      letterSpacing: "1.2px",
                      color: "#C084FC",
                      textTransform: "uppercase",
                    }}
                  >
                    Available to Withdraw
                  </p>

                  <h2
                    className="mt-5 text-white text-4xl sm:text-6xl leading-none break-all"
                    style={{
                      fontFamily: fontBase,
                      fontWeight: 900,
                    }}
                  >
                    {walletLoading
                      ? "Loading..."
                      : `₹ ${fmt(walletData.availableBalance)}`}
                  </h2>

                  <div className="mt-12 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => navigate("/add-funds")}
                      className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[10px] px-7 text-white"
                      style={{
                        ...buttonTextStyle,
                        background:
                          "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)",
                      }}
                    >
                      <span
                        aria-hidden
                        style={plusMaskStyle(10.5, "#FFFFFF")}
                      />
                      Add
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/withdraw")}
                      className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[10px] border border-white/15 bg-white/10 px-7 text-white"
                      style={buttonTextStyle}
                    >
                      <img
                        src="/icons/with.svg"
                        alt=""
                        style={{ width: 13.5, height: 13.5 }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      Withdraw
                    </button>
                  </div>

                  <div className="mt-12 h-px w-full bg-white/10" />

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <p
                        style={{
                          fontFamily: fontBase,
                          fontWeight: 400,
                          fontSize: 14,
                          lineHeight: "100%",
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        Total Earning
                      </p>

                      <p
                        className="mt-3"
                        style={{
                          fontFamily: fontBase,
                          fontWeight: 700,
                          fontSize: 24,
                          lineHeight: "100%",
                          color: "#FFFFFF",
                        }}
                      >
                        {walletLoading
                          ? "—"
                          : `₹${fmt(walletData.totalRevenue)}`}
                      </p>
                    </div>

                    <div>
                      <p
                        style={{
                          fontFamily: fontBase,
                          fontWeight: 400,
                          fontSize: 14,
                          lineHeight: "100%",
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        Monthly Earnings
                      </p>

                      <p
                        className="mt-3"
                        style={{
                          fontFamily: fontBase,
                          fontWeight: 700,
                          fontSize: 24,
                          lineHeight: "100%",
                          color: "#ADC6FF",
                        }}
                      >
                        {walletLoading
                          ? "—"
                          : `₹${fmt(walletData.monthlyEarning)}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="relative overflow-hidden border border-white/10"
                style={{
                  minHeight: 379,
                  borderRadius: 28,
                  background: "rgba(23,23,26,0.56)",
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(255,20,239,0.14),transparent_55%)]" />

                <div className="relative z-10 p-8">
                  <div className="flex items-center justify-between">
                    <h3
                      className="text-white"
                      style={{
                        fontFamily: fontBase,
                        fontWeight: 700,
                        fontSize: 18,
                        lineHeight: "100%",
                      }}
                    >
                      Accounts
                    </h3>

                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError("");
                        setManageMode(true);
                      }}
                      disabled={accounts.length === 0}
                      style={{
                        fontFamily: fontBase,
                        fontWeight: 700,
                        fontSize: 14,
                        lineHeight: "100%",
                        color:
                          accounts.length === 0
                            ? "rgba(255,255,255,0.35)"
                            : "#C084FC",
                        cursor:
                          accounts.length === 0 ? "not-allowed" : "pointer",
                      }}
                    >
                      Manage
                    </button>
                  </div>

                  <div className="mt-7 space-y-3">
                    {deleteError && (
                      <div
                        className="rounded-[10px] border px-3 py-2 text-xs text-white"
                        style={{
                          background: "#2A1717",
                          borderColor: "rgba(239,68,68,0.35)",
                        }}
                      >
                        {deleteError}
                      </div>
                    )}

                    {accounts.length === 0 ? (
                      <div className="rounded-[10px] border border-white/5 bg-white/[0.04] px-4 py-5 text-sm text-white/50">
                        No bank accounts added yet
                      </div>
                    ) : (
                      accounts.map((account) => {
                        const isDeleting = deletingAccountId === account.id;

                        return (
                          <div
                            key={account.id}
                            className="relative overflow-hidden rounded-[10px]"
                          >
                            <div
                              className="flex h-[70px] items-center gap-4 rounded-[10px] border border-white/5 bg-white/[0.06] px-4"
                              style={{
                                paddingRight: manageMode ? 54 : 16,
                                transition: "padding-right 220ms ease",
                              }}
                            >
                              <div
                                className={`grid h-9 w-9 place-items-center rounded-full ${account.iconBg}`}
                              >
                                <Landmark
                                  className={`h-5 w-5 ${account.iconColor}`}
                                />
                              </div>

                              <div className="min-w-0">
                                <p
                                  className="truncate text-white"
                                  style={{
                                    fontFamily: fontBase,
                                    fontWeight: 700,
                                    fontSize: 14,
                                    lineHeight: "100%",
                                  }}
                                >
                                  {account.name}
                                </p>

                                <p
                                  className="mt-2"
                                  style={{
                                    fontFamily: fontBase,
                                    fontWeight: 400,
                                    fontSize: 10,
                                    lineHeight: "100%",
                                    color: "rgba(255,255,255,0.35)",
                                  }}
                                >
                                  •••• {account.last4}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              aria-label={`Delete ${account.name}`}
                              disabled={!manageMode || isDeleting}
                              onClick={() => handleDeleteAccount(account.id)}
                              className="absolute grid h-9 w-9 place-items-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-60"
                              style={{
                                top: "50%",
                                right: 10,
                                opacity: manageMode ? 1 : 0,
                                pointerEvents: manageMode ? "auto" : "none",
                                transform: manageMode
                                  ? "translateY(-50%) translateX(0)"
                                  : "translateY(-50%) translateX(24px)",
                                transition:
                                  "opacity 220ms ease, transform 220ms ease",
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {manageMode ? (
                    <button
                      type="button"
                      onClick={() => {
                        setManageMode(false);
                        setDeleteError("");
                      }}
                      className={`${
                        accounts.length === 0 ? "mt-7" : "mt-20"
                      } flex h-[38px] w-full items-center justify-center rounded-[8px]`}
                      style={{
                        background:
                          "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)",
                        border: "none",
                        fontFamily: fontBase,
                        fontWeight: 700,
                        fontSize: 12,
                        lineHeight: "100%",
                        color: "#FFFFFF",
                      }}
                    >
                      Done
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        resetBankForm();
                        setAddBankOpen(true);
                      }}
                      className={`${
                        accounts.length === 0 ? "mt-7" : "mt-20"
                      } flex h-[38px] w-full items-center justify-center gap-2 rounded-[8px]`}
                      style={{
                        background: "#FFFFFF0D",
                        border: "1px solid #FFFFFF33",
                        fontFamily: fontBase,
                        fontWeight: 700,
                        fontSize: 12,
                        lineHeight: "100%",
                        color: "#A1A1AA",
                      }}
                    >
                      <span aria-hidden style={plusMaskStyle(7, "#A1A1AA")} />
                      Add Card
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div
              className="mt-5 overflow-hidden border border-white/10"
              style={{
                borderRadius: 28,
                background: "rgba(23,23,26,0.56)",
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(255,20,239,0.22),transparent_45%)]" />

                <div className="relative z-10">
                  <div className="flex flex-col gap-5 border-b border-white/10 p-8 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3
                        className="text-white"
                        style={{
                          fontFamily: fontBase,
                          fontWeight: 700,
                          fontSize: 20,
                          lineHeight: "100%",
                        }}
                      >
                        Payment History
                      </h3>

                      <p
                        className="mt-3"
                        style={{
                          fontFamily: fontBase,
                          fontWeight: 400,
                          fontSize: 14,
                          lineHeight: "100%",
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        Track all earnings and withdrawals
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="relative">
                        <select
                          value={selectedMonth}
                          onChange={(e) => {
                            setSelectedMonth(e.target.value);
                            setHistoryPage(1);
                          }}
                          style={{
                            width: 130,
                            height: 34,
                            opacity: 1,
                            appearance: "none",
                            WebkitAppearance: "none",
                            background: "#000000",
                            border: "1px solid #000000",
                            borderRadius: 8,
                            color: "#FFFFFF",
                            fontFamily: fontBase,
                            fontWeight: 600,
                            fontSize: 12,
                            padding: "0 34px 0 12px",
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          {getMonthOptions().map((opt) => (
                            <option
                              key={opt.value}
                              value={opt.value}
                              style={{
                                background: "#000000",
                                color: "#FFFFFF",
                              }}
                            >
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={18}
                          strokeWidth={2.5}
                          style={{
                            position: "absolute",
                            right: 9,
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            color: "#6B7280",
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 8,
                          background: "#0D0D0F",
                          border: "1px solid rgba(255,255,255,0.12)",
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M2 4h12M4 8h8M6 12h4"
                            stroke="rgba(255,255,255,0.6)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px]">
                      <thead>
                        <tr className="text-left">
                          <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                            Date
                          </th>
                          <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                            Description
                          </th>
                          <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                            Status
                          </th>
                          <th className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                            Amount
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {walletLoading ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-8 py-10 text-center text-white/50 text-sm"
                            >
                              Loading transactions…
                            </td>
                          </tr>
                        ) : paymentHistory.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-8 py-10 text-center text-white/50 text-sm"
                            >
                              No transactions yet. Sales will appear here.
                            </td>
                          </tr>
                        ) : filteredPaymentHistory.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-8 py-10 text-center text-white/50 text-sm"
                            >
                              No transactions found for selected month.
                            </td>
                          </tr>
                        ) : (
                          paginatedPaymentHistory.map((item) => (
                            <tr
                              key={item.id}
                              className="border-t border-white/10"
                            >
                              <td
                                className="px-8 py-7 text-white"
                                style={tableDateValueStyle}
                              >
                                {fmtDate(item.date)}
                              </td>

                              <td
                                className="px-8 py-7 text-white"
                                style={tableDescriptionValueStyle}
                              >
                                {item.description}
                              </td>

                              <td
                                className={`px-8 py-7 ${getTransactionStatusClass(
                                  item
                                )}`}
                                style={tableStatusValueStyle}
                              >
                                {getTransactionStatusLabel(item)}
                              </td>

                              <td
                                className={
                                  item.type === "credit"
                                    ? "px-8 py-7 text-[#4ADE80]"
                                    : "px-8 py-7 text-[#F87171]"
                                }
                                style={tableAmountValueStyle}
                              >
                                {item.amount}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {historyTotal > historyPageSize && (
                    <div className="flex flex-col gap-3 border-t border-white/10 px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-xs text-white/50">
                        Showing{" "}
                        <span className="font-semibold text-white/80">
                          {historyTotal === 0 ? 0 : historyStartIndex + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-semibold text-white/80">
                          {historyEndIndex}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-white/80">
                          {historyTotal}
                        </span>{" "}
                        payments
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={safeHistoryPage <= 1}
                          onClick={() =>
                            setHistoryPage((p) => Math.max(1, p - 1))
                          }
                          className="h-9 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-white/75 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Prev
                        </button>

                        <span className="min-w-[76px] text-center text-xs text-white/50">
                          Page {safeHistoryPage} / {historyTotalPages}
                        </span>

                        <button
                          type="button"
                          disabled={safeHistoryPage >= historyTotalPages}
                          onClick={() =>
                            setHistoryPage((p) =>
                              Math.min(historyTotalPages, p + 1)
                            )
                          }
                          className="h-9 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-white/75 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {addBankOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1200] grid place-items-center px-4"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setAddBankOpen(false);
              resetBankForm();
            }}
          />

          <div
            className="relative w-full max-w-[620px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 text-white shadow-2xl no-scrollbar"
            style={{
              background: "#17171A",
              border: "1px solid rgba(255,255,255,0.10)",
              fontFamily: fontBase,
            }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => {
                setAddBankOpen(false);
                resetBankForm();
              }}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 hover:bg-black/80"
            >
              <X className="h-4 w-4 text-white/90" />
            </button>

            <h3 className="text-[22px] font-semibold leading-[100%] text-white">
              Account Details
            </h3>

            <p className="mt-2 text-sm text-white/55">
              Add your bank account details to receive withdrawals.
            </p>

            {formError && (
              <div
                className="mt-5 rounded-xl border px-4 py-3 text-sm text-white"
                style={{
                  background: "#2A1717",
                  borderColor: "rgba(239,68,68,0.35)",
                }}
              >
                {formError}
              </div>
            )}

            <div className="mt-6 space-y-5">
              {[
                {
                  label: "Account holder name",
                  key: "holder" as const,
                  placeholder: "Enter account holder name",
                  onChange: (v: string) => onlyLetters(v),
                },
                {
                  label: "Account number",
                  key: "accNum" as const,
                  placeholder: "Enter account number",
                  onChange: onlyDigits,
                },
                {
                  label: "Confirm account number",
                  key: "confirmAccNum" as const,
                  placeholder: "Re-enter account number",
                  onChange: onlyDigits,
                },
              ].map(({ label, key, placeholder, onChange }) => (
                <div key={key}>
                  <label className="mb-2 block text-sm text-white/80">
                    {label}
                  </label>

                  <input
                    value={bankForm[key]}
                    onChange={(e) =>
                      setBankForm((p) => ({
                        ...p,
                        [key]: onChange(e.target.value),
                      }))
                    }
                    className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
                    placeholder={placeholder}
                    inputMode={key !== "holder" ? "numeric" : undefined}
                  />
                </div>
              ))}

              <div>
                <label className="mb-2 block text-sm text-white/80">
                  IFSC Code
                </label>

                <div className="relative">
                  <input
                    value={bankForm.ifsc}
                    onChange={(e) =>
                      setBankForm((p) => ({
                        ...p,
                        ifsc: e.target.value.toUpperCase(),
                      }))
                    }
                    className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 pr-[112px] text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
                    placeholder="IFSC Code"
                  />

                  <button
                    type="button"
                    className="absolute bottom-1 right-1 top-1 rounded-md px-4 text-sm text-white"
                    style={{
                      background:
                        "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
                    }}
                  >
                    Find IFSC
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/80">
                  Bank name
                </label>

                <input
                  value={bankForm.bankName}
                  onChange={(e) =>
                    setBankForm((p) => ({
                      ...p,
                      bankName: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
                  placeholder="Bank name"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAddBankOpen(false);
                    resetBankForm();
                  }}
                  className="h-[49px] w-[100px] rounded-[6px] border border-white text-white/90"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveBank}
                  disabled={saveLoading}
                  className="h-[49px] w-[162px] rounded-[6px] px-[15px] text-white transition-opacity disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
                  }}
                >
                  {saveLoading ? "Saving..." : "Save & Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {successPopupOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1300] grid place-items-center px-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div
            className="relative text-white shadow-2xl"
            style={{
              width: "min(500px, 94vw)",
              minHeight: 300,
              borderRadius: 10,
              background: "#030405",
              fontFamily: fontBase,
              padding: "30px 24px",
            }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setSuccessPopupOpen(false)}
              className="absolute right-5 top-5 grid place-items-center text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto grid h-[80px] w-[80px] place-items-center rounded-full bg-[#052A1D]">
              <div className="grid h-[36px] w-[36px] place-items-center rounded-full bg-[#21B37A]">
                <Check className="h-5 w-5 text-black" strokeWidth={3} />
              </div>
            </div>

            <div className="mt-6 text-center">
              <h3
                style={{
                  fontFamily: fontBase,
                  fontWeight: 700,
                  fontSize: 22,
                  lineHeight: "100%",
                  color: "#FFFFFF",
                }}
              >
                Bank account added
              </h3>

              <p
                className="mt-3"
                style={{
                  fontFamily: fontBase,
                  fontWeight: 400,
                  fontSize: 18,
                  lineHeight: "130%",
                  color: "#FFFFFF",
                }}
              >
                {latestAddedAccount?.name || "Bank"} ••
                {latestAddedAccount?.last4 || "0000"} added successfully
              </p>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => {
                  setSuccessPopupOpen(false);
                  resetBankForm();
                  setAddBankOpen(true);
                }}
                style={{
                  fontFamily: fontBase,
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: "24px",
                  color: "#FFFFFF",
                }}
              >
                Add Another
              </button>

              <button
                type="button"
                onClick={() => {
                  setSuccessPopupOpen(false);
                  setAddBankOpen(false);
                }}
                className="h-[50px] rounded-[7px] px-5"
                style={{
                  background: "#333335",
                  fontFamily: fontBase,
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: "24px",
                  color: "#FFFFFF",
                }}
              >
                View
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 mt-20">
        <Footer />
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Wallet;