// // // // src/pages/admin/Dashboard.tsx
// // // import React, { useEffect, useMemo, useState } from "react";
// // // import {
// // //   Bell,
// // //   ChevronDown,
// // //   Plus,
// // //   LayoutDashboard,
// // //   Store,
// // //   Package,
// // //   LineChart,
// // //   UserRound,
// // //   CheckCircle2,
// // //   XCircle,
// // //   ShieldCheck,
// // //   Search,
// // //   X,
// // //   TrendingUp,
// // //   TriangleAlert,
// // //   Image as ImageIcon,
// // //   Video,
// // //   Download,
// // //   MessageSquare,
// // //   Ban,
// // //   Clock,
// // //   FileText,
// // //   ShieldAlert,
// // //   User,
// // //   ShoppingCart
// // // } from "lucide-react";

// // // import {
// // //   Select,
// // //   SelectContent,
// // //   SelectItem,
// // //   SelectTrigger,
// // //   SelectValue,
// // // } from "@/components/ui/select";

// // // import {
// // //   Area,
// // //   AreaChart,
// // //   CartesianGrid,
// // //   ResponsiveContainer,
// // //   Tooltip,
// // //   XAxis,
// // //   YAxis,
// // // } from "recharts";

// // // import {
// // //   DropdownMenu,
// // //   DropdownMenuContent,
// // //   DropdownMenuItem,
// // //   DropdownMenuSeparator,
// // //   DropdownMenuTrigger,
// // // } from "@/components/ui/dropdown-menu";

// // // // ✅ ADD reports here
// // // type NavKey =
// // //   | "dashboard"
// // //   | "sellers"
// // //   | "products"
// // //   | "reports"
// // //   | "analytics"
// // //   | "account";

// // // const kpiCardBase =
// // //   "rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.03] border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

// // // // =======================
// // // // TYPES
// // // // =======================
// // // type PromptProduct = {
// // //   id: string;
// // //   title: string;
// // //   uploaderName: string;
// // //   uploaderId?: string | null;
// // //   price: number;
// // //   status: "Published" | "Draft" | "Flagged";
// // //   imageUrl?: string;
// // //   videoUrl?: string;
// // //   category?: string;
// // //   exclusive?: boolean;
// // //   sold?: boolean;
// // // };

// // // type Category = { _id: string; name: string; description?: string };

// // // type SellerProfile = {
// // //   id: string;
// // //   name: string;
// // //   email?: string;
// // //   location?: string;
// // //   joined?: string;
// // //   status?: "ACTIVE" | "SUSPENDED";
// // //   avatar?: string;
// // //   verified?: boolean;

// // //   totalEarnings?: number;
// // //   rating?: number;
// // //   reviewsCount?: number;
// // //   refundRate?: number;
// // //   refundThreshold?: number;
// // // };

// // // type SellerRow = {
// // //   id: string;
// // //   name: string;
// // //   email: string;
// // //   status: "Active" | "Blocked";
// // //   avatar?: string;
// // //   joined?: string;
// // //   category?: string;
// // //   volume?: string;
// // //   totalProducts?: number;
// // //    kycStatus?: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED" | "FLAGGED";
    
// // // };

// // // // ✅ REPORT TYPES (left + right flow)
// // // type ReportItem = {
// // //   id: string;
// // //   title: string;
// // //   listingId: string;
// // //   productId?: string;
// // //   category: string;
// // //   status: "Open" | "Reviewed" | "Dismissed" | "Actioned";
// // //   priority: "Low" | "Medium" | "High";
// // //   createdAt: string;

// // //   reporterName?: string;
// // //   reporterEmail?: string;
// // //   reason: string;
// // //   details?: string;

// // //   productTitle?: string;
// // //   sellerName?: string;

// // //   previewImageUrl?: string;
// // //   previewVideoUrl?: string;

// // //   evidence?: Array<{
// // //     type: "image" | "video" | "text";
// // //     url?: string;
// // //     text?: string;
// // //     label?: string;
// // //   }>;

// // //   history?: Array<{
// // //     at: string;
// // //     by: string;
// // //     action: string;
// // //     note?: string;
// // //   }>;
// // // };

// // // // =======================
// // // // API
// // // // =======================
// // // type ActivityItem = {
// // //   id: string;
// // //   title: string;
// // //   desc?: string;
// // //   createdAt: string;
// // //   type:
// // //     | "USER_REGISTERED"
// // //     | "USER_LOGIN"
// // //     | "PRODUCT_PURCHASED"
// // //     | "VIDEO_CALL_STARTED"
// // //     | "VIDEO_CALL_ENDED"
// // //     | "SELLER_REGISTERED"
// // //     | "PRODUCT_APPROVED"
// // //     | "PAYOUT_FAILED"
// // //     | "POLICY_UPDATE"
// // //     | "REPORT_CREATED"
// // //     | "LISTING_SUSPENDED"
// // //     | "PRODUCT_FLAGGED"
// // //     | "OTHER";
// // // };

// // // type UserRow = {
// // //   id: string;
// // //   name: string;
// // //   email: string;
// // //   avatar?: string;
// // //   userType?: "IND" | "ORG" | "TM";
// // //   plan?: "free" | "pro" | null;
// // //   isVerified?: boolean;
// // //   kycStatus?: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED" | "FLAGGED";
// // //   createdAt?: string;
// // //   lastLoginAt?: string;
// // //     buyProducts?: number;   // ✅ ADD
// // //   saleProducts?: number;  // ✅ ADD
// // // };


// // // const useMediaQuery = (query: string) => {
// // //   const [matches, setMatches] = React.useState(false);

// // //   React.useEffect(() => {
// // //     const mql = window.matchMedia(query);
// // //     const onChange = () => setMatches(mql.matches);
// // //     onChange();
// // //     mql.addEventListener("change", onChange);
// // //     return () => mql.removeEventListener("change", onChange);
// // //   }, [query]);

// // //   return matches;
// // // };

// // // const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// // // const PROMPTS_BASE = `${API_BASE}/api/prompt`;
// // // const SELLERS_BASE = `${API_BASE}/api/seller`;
// // // const REPORTS_BASE = `${API_BASE}/api/promptreport`;
// // // const USERS_BASE = `${API_BASE}/api/user`;
// // // // Optional future:
// // // // const REPORTS_BASE = `${API_BASE}/api/reports`;

// // // const Dashboard = () => {
// // //   const [active, setActive] = useState<NavKey>("dashboard");
// // // const [currentView, setCurrentView] = useState<"seller" | "user">("seller");
// // //  const [showAllUsers, setShowAllUsers] = useState(false);
// // // const [userRows, setUserRows] = useState<UserRow[]>([]);
// // // const [userLoading, setUserLoading] = useState(false);
// // // const [userError, setUserError] = useState<string | null>(null);
// // // const [userPage, setUserPage] = useState(1);
// // // const [userPageSize, setUserPageSize] = useState(10);
// // // const [userTotalPages, setUserTotalPages] = useState(1);
// // // const [userTotal, setUserTotal] = useState(0);
// // // const [userSearch, setUserSearch] = useState("");
// // //  const [showAllActivities, setShowAllActivities] = useState(false);
// // //  const [stats, setStats] = useState({
// // //   totalRevenue: 0,
// // //   totalSellers: 0,
// // // });
// // // const [pendingApprovals, setPendingApprovals] = useState(0);



// // // const [sellerRows, setSellerRows] = useState<SellerRow[]>([]);

// // // // const [chartData, setChartData] = useState([]);


// // //   // ✅ Admin name (same as before)
// // //   const adminEmail = (localStorage.getItem("tokun_admin_email") || "").trim();
// // //   const adminName = useMemo(() => {
// // //     if (!adminEmail) return "Admin";
// // //     const localPart = adminEmail.split("@")[0] || "Admin";
// // //     const first = localPart.split(/[._-]/)[0] || localPart;
// // //     return first.charAt(0).toUpperCase() + first.slice(1);
// // //   }, [adminEmail]);

// // //   // ✅ Token getter
// // //   const getToken = () => {
// // //     return (
// // //       localStorage.getItem("token") ||
// // //       localStorage.getItem("tokun_token") ||
// // //       localStorage.getItem("accessToken") ||
// // //       ""
// // //     );
// // //   };



// // // // ✅ SIMPLE WORKAROUND — activityLogger ko frontend se call karo
// // // // Dashboard.tsx mein ye helper function add karo:

// // // const logActivityToLocal = async (type: string, title: string, description: string, actorName?: string) => {
// // //   try {
// // //     await fetch(`${API_BASE}/api/activity/test-insert-custom`, {
// // //       method: "POST",
// // //       headers: { "Content-Type": "application/json" },
// // //       body: JSON.stringify({ type, title, description, actorName }),
// // //     });
// // //   } catch (e) {
// // //     // silent fail
// // //   }
// // // };







// // //   const [activities, setActivities] = useState<ActivityItem[]>([]);
// // // const [activitiesLoading, setActivitiesLoading] = useState(false);
// // // const [activitiesError, setActivitiesError] = useState<string | null>(null);

// // //    const activityMeta = (type: ActivityItem["type"]) => {
// // //   switch (type) {
// // //     case "USER_REGISTERED":
// // //       return {
// // //         icon: <UserRound className="h-4 w-4" />,
// // //         iconBg: "bg-blue-500/15 text-blue-300 border-blue-500/25",
// // //       };
// // //     case "USER_LOGIN":
// // //       return {
// // //         icon: <ShieldCheck className="h-4 w-4" />,
// // //         iconBg: "bg-slate-500/15 text-slate-200 border-slate-400/25",
// // //       };
// // //     case "PRODUCT_PURCHASED":
// // //       return {
// // //         icon: <ShoppingCart className="h-4 w-4" />,
// // //         iconBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
// // //       };
// // //     case "VIDEO_CALL_STARTED":
// // //       return {
// // //         icon: <Video className="h-4 w-4" />,
// // //         iconBg: "bg-sky-500/15 text-sky-200 border-sky-500/25",
// // //       };
// // //     case "VIDEO_CALL_ENDED":
// // //       return {
// // //         icon: <Video className="h-4 w-4" />,
// // //         iconBg: "bg-slate-500/15 text-slate-200 border-slate-400/25",
// // //       };
// // //     case "SELLER_REGISTERED":
// // //       return {
// // //         icon: <UserRound className="h-4 w-4" />,
// // //         iconBg: "bg-blue-500/15 text-blue-300 border-blue-500/25",
// // //       };
// // //     case "PRODUCT_APPROVED":
// // //       return {
// // //         icon: <CheckCircle2 className="h-4 w-4" />,
// // //         iconBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
// // //       };
// // //     case "PAYOUT_FAILED":
// // //       return {
// // //         icon: <XCircle className="h-4 w-4" />,
// // //         iconBg: "bg-red-500/15 text-red-300 border-red-500/25",
// // //       };
// // //     case "POLICY_UPDATE":
// // //       return {
// // //         icon: <ShieldCheck className="h-4 w-4" />,
// // //         iconBg: "bg-slate-500/15 text-slate-200 border-slate-400/25",
// // //       };
// // //     case "REPORT_CREATED":
// // //       return {
// // //         icon: <ShieldAlert className="h-4 w-4" />,
// // //         iconBg: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/25",
// // //       };
// // //     case "LISTING_SUSPENDED":
// // //       return {
// // //         icon: <Ban className="h-4 w-4" />,
// // //         iconBg: "bg-red-500/15 text-red-200 border-red-500/25",
// // //       };
// // //     case "PRODUCT_FLAGGED":
// // //       return {
// // //         icon: <TriangleAlert className="h-4 w-4" />,
// // //         iconBg: "bg-amber-500/15 text-amber-200 border-amber-500/25",
// // //       };
// // //     default:
// // //       return {
// // //         icon: <Clock className="h-4 w-4" />,
// // //         iconBg: "bg-white/10 text-white/70 border-white/15",
// // //       };
// // //   }
// // // };



// // // // useEffect(() => {
// // // //   const loadActivities = async () => {
// // // //     try {
// // // //       setActivitiesLoading(true);
// // // //       setActivitiesError(null);

// // // //       const token = getToken();
// // // //       console.log("🔑 Token being used:", token); // token dekho

// // // //       const res = await fetch(`${API_BASE}/api/activity/recent?limit=10`, {
// // // //         headers: {
// // // //           ...(token ? { Authorization: `Bearer ${token}` } : {}),
// // // //         },
// // // //         credentials: "include",
// // // //       });

// // // //       console.log("📡 Response status:", res.status); // status dekho

// // // //       if (!res.ok) {
// // // //         throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
// // // //       }

// // // //       const data = await res.json();
// // // //       console.log("📦 Raw API data:", data);          // raw data dekho
// // // //       console.log("📋 Items count:", data?.items?.length); // items count dekho

// // // //       if (!data?.success) {
// // // //         throw new Error(data?.message || data?.error || "Failed to load activities");
// // // //       }

// // // //       const mapped: ActivityItem[] = (data.items || []).map((a: any) => ({
// // // //         id: String(a._id || a.id),
// // // //         title: a.title || "Activity",
// // // //         desc: a.description || a.desc ||
// // // //           (a.actorName ? `By ${a.actorName}${a.targetName ? ` • ${a.targetName}` : ""}` : ""),
// // // //         createdAt: a.createdAt || new Date().toISOString(),
// // // //         type: (a.type || "OTHER") as ActivityItem["type"],
// // // //       }));

// // // //       console.log("✅ Mapped activities:", mapped); // mapped data dekho

// // // //       setActivities(mapped);
// // // //     } catch (e: any) {
// // // //       console.error("❌ Activity load error:", e);
// // // //       setActivitiesError(e?.message || "Failed to load activities");
// // // //       setActivities([]);
// // // //     } finally {
// // // //       setActivitiesLoading(false);
// // // //     }
// // // //   };

// // // //   loadActivities();
// // // // }, []);




// // // // ✅ REPLACE KARO — active page change pe bhi reload ho
// // // useEffect(() => {
// // //   const loadActivities = async () => {
// // //     try {
// // //       setActivitiesLoading(true);
// // //       setActivitiesError(null);

// // //       const token = getToken();

// // //       const res = await fetch(`${API_BASE}/api/activity/recent?limit=10`, {
// // //         headers: {
// // //           ...(token ? { Authorization: `Bearer ${token}` } : {}),
// // //         },
// // //         credentials: "include",
// // //       });

// // //       if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

// // //       const data = await res.json();
// // //       if (!data?.success) throw new Error(data?.message || "Failed");

// // //       const mapped: ActivityItem[] = (data.items || []).map((a: any) => ({
// // //         id: String(a._id || a.id),
// // //         title: a.title || "Activity",
// // //         desc: a.description || a.desc ||
// // //           (a.actorName ? `By ${a.actorName}${a.targetName ? ` • ${a.targetName}` : ""}` : ""),
// // //         createdAt: a.createdAt || new Date().toISOString(),
// // //         type: (a.type || "OTHER") as ActivityItem["type"],
// // //       }));

// // //       console.log("✅ Setting activities:", mapped.length);
// // //       setActivities(mapped);
// // //     } catch (e: any) {
// // //       console.error("❌ Activity error:", e);
// // //       setActivitiesError(e?.message || "Failed to load activities");
// // //       setActivities([]);
// // //     } finally {
// // //       setActivitiesLoading(false);
// // //     }
// // //   };

// // //   // ✅ dashboard active hone pe fetch karo
// // //   if (active === "dashboard") {
// // //     loadActivities();
// // //   }
// // // }, [active]); // ✅ active dependency add karo

// // // useEffect(() => {
// // //   const fetchUsers = async () => {
// // //     try {
// // //       setUserLoading(true);
// // //       setUserError(null);

// // //       const token = getToken();

// // //       const params = new URLSearchParams();
// // //       params.set("limit", String(userPageSize));
// // //       params.set("page", String(userPage));
// // //       if (userSearch.trim()) params.set("search", userSearch.trim());

// // //       // ✅ Users fetch karo
// // //       const res = await fetch(`${USERS_BASE}?${params.toString()}`, {
// // //         headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
// // //         credentials: "include",
// // //       });

// // //       const data = await res.json();
// // //       if (!res.ok || !data?.success) {
// // //         throw new Error(data?.error || data?.message || "Failed to load users");
// // //       }

// // //       // ✅ Saath mein purchase analytics bhi fetch karo
// // //       const analyticsRes = await fetch(
// // //         `${API_BASE}/api/purchase/analytics/sales`,
// // //         { credentials: "include" }
// // //       ).catch(() => null);
// // //       const analyticsData = analyticsRes ? await analyticsRes.json().catch(() => null) : null;

// // //       // ✅ Prompts (uploaded) count per user fetch karo
// // //       const promptsRes = await fetch(
// // //         `${PROMPTS_BASE}/others`,
// // //         {
// // //           headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
// // //           credentials: "include",
// // //         }
// // //       ).catch(() => null);
// // //       const promptsData = promptsRes ? await promptsRes.json().catch(() => null) : null;

// // //       // ✅ User ID se uploaded prompts count banao
// // //       const uploadCountByUser: Record<string, number> = {};
// // //       if (promptsData?.success && Array.isArray(promptsData.prompts)) {
// // //         promptsData.prompts.forEach((p: any) => {
// // //           const uid = String(p?.userId?._id || p?.userId || p?.uploaderId || "");
// // //           if (uid) {
// // //             uploadCountByUser[uid] = (uploadCountByUser[uid] || 0) + 1;
// // //           }
// // //         });
// // //       }

// // //       const mapped: UserRow[] = (data.users || []).map((u: any) => {
// // //         const uid = String(u._id);

// // //         // Buy count — backend se agar available ho
// // //         const buyCount = Number(
// // //           u?.purchasedCount ??
// // //           u?.totalPurchases ??
// // //           u?.buyProducts ??
// // //           u?.purchases ??
// // //           u?.purchaseHistory?.length ??
// // //           0
// // //         );

// // //         // Sale count — uploaded prompts count (jo hamne calculate kiya)
// // //         const saleCount = Number(
// // //           u?.totalProducts ??
// // //           u?.uploadedCount ??
// // //           u?.saleProducts ??
// // //           uploadCountByUser[uid] ??
// // //           0
// // //         );

// // //         return {
// // //           id: uid,
// // //           name: u?.name || "Unknown",
// // //           email: u?.email || "—",
// // //           avatar: u?.avatarUrl || undefined,
// // //           userType: u?.userType,
// // //           plan: u?.plan ?? null,
// // //           isVerified: !!u?.isVerified,
// // //           kycStatus: u?.kycStatus,
// // //           createdAt: u?.createdAt,
// // //           lastLoginAt: u?.lastLoginAt,
// // //           buyProducts: buyCount,
// // //           saleProducts: saleCount,
// // //         };
// // //       });

// // //       setUserRows(mapped);
// // //       setUserTotal(data?.pagination?.total || 0);
// // //       setUserTotalPages(data?.pagination?.totalPages || 1);
// // //     } catch (e: any) {
// // //       setUserError(e?.message || "Error loading users");
// // //       setUserRows([]);
// // //       setUserTotal(0);
// // //       setUserTotalPages(1);
// // //     } finally {
// // //       setUserLoading(false);
// // //     }
// // //   };

// // //   if (active === "dashboard" && currentView === "user") fetchUsers();
// // // }, [active, currentView, userPage, userPageSize, userSearch]);
// // //   // =======================
// // //   // Dashboard chart/table/activity data
// // //   // =======================
// // //   const chartData = useMemo(
// // //     () => [
// // //       { name: "Week 1", blue: 28, green: 18 },
// // //       { name: "Week 2", blue: 14, green: 22 },
// // //       { name: "Week 3", blue: 18, green: 24 },
// // //       { name: "Week 4", blue: 44, green: 30 },
// // //       { name: "Week 5", blue: 34, green: 44 },
// // //       { name: "Week 6", blue: 46, green: 26 },
// // //       { name: "Week 7", blue: 22, green: 30 },
// // //       { name: "Week 8", blue: 18, green: 28 },
// // //       { name: "Week 9", blue: 6, green: 34 },
// // //     ],
// // //     []
// // //   );

// // //      const recentActivitiesPreview = useMemo(() => {
// // //   return activities.slice(0, 4);
// // // }, [activities]);


// // //  const timeAgo = (dateLike: string) => {
// // //   const t = new Date(dateLike).getTime();
// // //   const diff = Date.now() - t;
// // //   const m = Math.floor(diff / 60000);
// // //   if (m < 60) return `${m}m ago`;
// // //   const h = Math.floor(m / 60);
// // //   if (h < 24) return `${h}h ago`;
// // //   const d = Math.floor(h / 24);
// // //   return `${d}d ago`;
// // // };

// // // useEffect(() => {
// // //   const fetchSalesAnalytics = async () => {
// // //     try {
// // //       const res = await fetch(
// // //         "http://localhost:5000/api/purchase/analytics/sales"
// // //       );

// // //       if (!res.ok) {
// // //         throw new Error("Failed to fetch sales analytics");
// // //       }

// // //       const data = await res.json();

// // //       if (data.success) {
// // //         formatChartData(data.monthlySales);
// // //       }
// // //     } catch (error) {
// // //       console.error("Sales analytics error:", error);
// // //     }
// // //   };

// // //   fetchSalesAnalytics();
// // // }, []);

// // // const formatChartData = (apiData) => {
// // //   const monthNames = [
// // //     "Jan","Feb","Mar","Apr","May","Jun",
// // //     "Jul","Aug","Sep","Oct","Nov","Dec"
// // //   ];

// // //   const today = new Date();

// // //   // 🔹 last 6 months ka base structure
// // //   const last6Months = [];

// // //   for (let i = 5; i >= 0; i--) {
// // //     const d = new Date(today.getFullYear(), today.getMonth() - i, 1);

// // //     last6Months.push({
// // //       year: d.getFullYear(),
// // //       month: d.getMonth() + 1,
// // //       name: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
// // //       blue: 0,
// // //       green: 0,
// // //     });
// // //   }

// // //   // 🔹 API data merge
// // //   apiData.forEach((item) => {
// // //     const index = last6Months.findIndex(
// // //       m =>
// // //         m.month === item._id.month &&
// // //         m.year === item._id.year
// // //     );

// // //     if (index !== -1) {
// // //       last6Months[index].blue = item.revenue || 0;
// // //       last6Months[index].green = item.totalSales || 0;
// // //     }
// // //   });

// // //   setChartData(last6Months);
// // // };









// // // const ReportsSidebar = () => {
// // //   const [tab, setTab] = useState<"product" | "review">("product");

// // //   const openCount = (reports || []).filter((r) => r.status === "Open").length;

// // //   const groupLabel = (p: ReportItem["priority"]) => {
// // //     if (p === "High") return "HIGH RISK";
// // //     if (p === "Medium") return "PENDING";
// // //     return "LOW RISK";
// // //   };

// // //   const grouped = useMemo(() => {
// // //     const list = [...reports].sort(
// // //       (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// // //     );

// // //     return {
// // //       High: list.filter((r) => r.priority === "High"),
// // //       Medium: list.filter((r) => r.priority === "Medium"),
// // //       Low: list.filter((r) => r.priority === "Low"),
// // //     };
// // //   }, [reports]);

// // //   const Item = (r: ReportItem) => {
// // //     const isActive = selectedReport?.id === r.id;

// // //     return (
// // //       <button
// // //         key={r.id}
// // //         onClick={() => {
// // //         setSelectedReport(r);
// // // setActive("reports");
// // // setMobileReportsPage("details"); // ✅ on phone open details page

// // //         }}
// // //         className={[
// // //           "w-full text-left px-4 py-4 border-t border-white/10 transition",
// // //           isActive ? "bg-white/[0.05]" : "hover:bg-white/[0.03]",
// // //         ].join(" ")}
// // //       >
// // //         <div className="flex items-start justify-between gap-3">
// // //           <div className="min-w-0">
// // //             <div className="text-xs font-semibold text-white/80">
// // //               {groupLabel(r.priority)}
// // //             </div>
// // //             <div className="mt-2 text-sm font-medium text-white/90 truncate">
// // //               {r.productTitle || r.title}
// // //             </div>
// // //             <div className="mt-1 text-xs text-white/55 truncate">
// // //               {r.reason}
// // //               {r.reporterName ? `: Reported by @${r.reporterName}` : ""}
// // //             </div>
// // //           </div>

// // //           <div className="shrink-0 text-xs text-white/45">
// // //             {timeAgo(r.createdAt)}
// // //           </div>
// // //         </div>
// // //       </button>
// // //     );
// // //   };

// // //   return (
// // //     <aside className={[kpiCardBase, "overflow-hidden"].join(" ")}>
// // //       {/* Tabs */}
// // //       <div className="px-4 pt-4">
// // //         <div className="flex items-center gap-8 text-sm">
// // //           <button
// // //             onClick={() => setTab("product")}
// // //             className={[
// // //               "pb-3 transition",
// // //               tab === "product"
// // //                 ? "text-white border-b-2 border-fuchsia-400"
// // //                 : "text-white/60 hover:text-white/85",
// // //             ].join(" ")}
// // //           >
// // //             Product Reports
// // //           </button>

// // //           <button
// // //             onClick={() => setTab("review")}
// // //             className={[
// // //               "pb-3 transition",
// // //               tab === "review"
// // //                 ? "text-white border-b-2 border-fuchsia-400"
// // //                 : "text-white/60 hover:text-white/85",
// // //             ].join(" ")}
// // //           >
// // //             Review Moderation
// // //           </button>
// // //         </div>
// // //       </div>

// // //       {/* Count + Filter */}
// // //       <div className="px-4 py-4 flex items-center justify-between border-b border-white/10">
// // //         <div className="text-xs text-white/60 uppercase tracking-wide">
// // //           {openCount} Pending Reports
// // //         </div>

// // //         <button className="text-xs text-white/70 flex items-center gap-2 hover:text-white">
// // //           <span className="inline-flex items-center justify-center h-8 px-3 rounded-xl border border-white/10 bg-white/[0.03]">
// // //             <span className="mr-2">⌄</span> FILTER
// // //           </span>
// // //         </button>
// // //       </div>

// // //       {/* List */}
// // //       <div className="max-h-[calc(100vh-170px)] overflow-y-auto">
// // //         {tab === "review" ? (
// // //           <div className="p-4 text-sm text-white/60">
// // //             Review moderation (coming soon…)
// // //           </div>
// // //         ) : (
// // //           <>
// // //             {grouped.High.map(Item)}
// // //             {grouped.Medium.map(Item)}
// // //             {grouped.Low.map(Item)}
// // //           </>
// // //         )}
// // //       </div>
// // //     </aside>
// // //   );
// // // };



// // //   // =============================
// // //   // ✅ FETCH MARKETPLACE PROMPTS
// // //   // =============================
// // //   const [products, setProducts] = useState<PromptProduct[]>([]);
// // //   const [productsLoading, setProductsLoading] = useState(false);
// // //   const [productsError, setProductsError] = useState<string | null>(null);
// // // const isMobile = useMediaQuery("(max-width: 767px)");
// // // const [mobileReportsPage, setMobileReportsPage] = useState<"list" | "details">("list");


// // //   // ✅ Categories for filters
// // //   const [categories, setCategories] = useState<Category[]>([]);
// // //   const [catsLoading, setCatsLoading] = useState(false);
// // //   const [catsError, setCatsError] = useState<string | null>(null);

// // //   // ✅ Sellers
// // //   // const [sellerRows, setSellerRows] = useState<SellerRow[]>([]);
// // //   const [sellersLoading, setSellersLoading] = useState(false);
// // //   const [sellersError, setSellersError] = useState<string | null>(null);
// // //   const [showAllSellers, setShowAllSellers] = useState(false);
    


// // //   // ✅ Sellers (pagination + search)

// // // const [sellerPage, setSellerPage] = useState(1);
// // // const [sellerPageSize, setSellerPageSize] = useState(10);
// // // const [sellerTotalPages, setSellerTotalPages] = useState(1);
// // // const [sellerTotal, setSellerTotal] = useState(0);
// // // const [sellerSearch, setSellerSearch] = useState("");
// // //   const totalSellers = useMemo(() => sellerRows.length, [sellerRows]);

// // //   const totalSellerProducts = useMemo(() => {
// // //     return sellerRows.reduce((sum, s) => sum + (Number(s.totalProducts) || 0), 0);
// // //   }, [sellerRows]);

// // //   const totalMarketplaceProducts = useMemo(() => products.length, [products]);

// // //    useEffect(() => {
// // //   const fetchAllSellers = async () => {
// // //     try {
// // //       setSellersLoading(true);
// // //       setSellersError(null);

// // //       const token = getToken();
// // //       const headers = {
// // //         ...(token ? { Authorization: `Bearer ${token}` } : {}),
// // //       };

// // //       // 1️⃣ ORG SELLERS
// // //       const resOrg = await fetch(`${SELLERS_BASE}`, {
// // //         headers,
// // //         credentials: "include",
// // //       });
// // //       const orgData = await resOrg.json();
// // //       if (!resOrg.ok || !orgData?.success)
// // //         throw new Error(orgData?.error || "Org sellers failed");

// // //       // 2️⃣ USER SELLERS
// // //       const resUser = await fetch(
// // //         `${USERS_BASE}?seller=true&limit=1000&page=1`,
// // //         { headers, credentials: "include" }
// // //       );
// // //       const userData = await resUser.json();
// // //       if (!resUser.ok || !userData?.success)
// // //         throw new Error(userData?.error || "User sellers failed");

// // //       // ✅ MAP ORG
// // //       // const orgMapped: SellerRow[] = (orgData.sellers || []).map((s: any) => ({
// // //       //   id: String(s._id),
// // //       //   name: s?.name || "Unknown",
// // //       //   email: s?.email || "—",
// // //       //   status: s?.status === "SUSPENDED" ? "Blocked" : "Active",
// // //       //   avatar: s?.avatar || s?.avatarUrl,
// // //       //   joined: s?.joined || s?.createdAt || null,
// // //       //   totalProducts: Number(s?.totalProducts ?? 0),
// // //       // }));

// // //       // // ✅ MAP USERS
// // //       // const userMapped: SellerRow[] = (userData.users || []).map((u: any) => ({
// // //       //   id: String(u._id),
// // //       //   name: u?.name || "Unknown",
// // //       //   email: u?.email || "—",
// // //       //   status: u?.isBanned ? "Blocked" : "Active",
// // //       //   avatar: u?.avatarUrl,
// // //       //   joined: u?.createdAt || null,
// // //       //   totalProducts: Number(u?.totalProducts ?? 0),
// // //       // }));



// // //     const orgMapped: SellerRow[] = (orgData.sellers || []).map((s: any) => ({
// // //   id: String(s._id),
// // //   name: s?.name || "Unknown",
// // //   email: s?.email || "—",
// // //   status: s?.status === "SUSPENDED" ? "Blocked" : "Active",
// // //   avatar: s?.avatar || s?.avatarUrl,
// // //   joined: s?.joined || s?.createdAt || null,
// // //   totalProducts: Number(s?.totalProducts ?? 0),
// // //   kycStatus: s?.kycStatus,
// // //   // ✅ Volume = total earnings — jo bhi field backend return kare
// // //   volume: String(
// // //     s?.totalEarnings ??
// // //     s?.earnings ??
// // //     s?.totalRevenue ??
// // //     s?.revenue ??
// // //     s?.volume ??
// // //     0
// // //   ),
// // // }));


// // // const userMapped: SellerRow[] = (userData.users || []).map((u: any) => ({
// // //   id: String(u._id),
// // //   name: u?.name || "Unknown",
// // //   email: u?.email || "—",
// // //   status: u?.isBanned ? "Blocked" : "Active",
// // //   avatar: u?.avatarUrl,
// // //   joined: u?.createdAt || null,
// // //   totalProducts: Number(u?.totalProducts ?? 0),
// // //   kycStatus: u?.kycStatus,
// // //   // ✅ Volume = total earnings
// // //   volume: String(
// // //     u?.totalEarnings ??
// // //     u?.earnings ??
// // //     u?.totalRevenue ??
// // //     u?.revenue ??
// // //     u?.volume ??
// // //     0
// // //   ),
// // // }));

// // //       // ✅ MERGE + DEDUPE
// // //       const merged = [...orgMapped, ...userMapped].reduce((acc, cur) => {
// // //         acc.set(cur.id, cur);
// // //         return acc;
// // //       }, new Map<string, SellerRow>());

// // //       const finalSellers = Array.from(merged.values());

// // //       // ✅ SET TABLE DATA
// // //       setSellerRows(finalSellers);

// // //       // 🔥 KPI CALCULATION
// // //       setStats({
// // //         totalSellers: finalSellers.length,   // ✅ REAL COUNT
// // //         totalRevenue: 12450,                // 💰 DEMO VALUE (for now)
// // //       });

// // //     } catch (e: any) {
// // //       setSellersError(e?.message || "Error loading sellers");
// // //       setSellerRows([]);
// // //     } finally {
// // //       setSellersLoading(false);
// // //     }
// // //   };

// // //   fetchAllSellers();
// // // }, []);


// // // useEffect(() => {
// // //   const loadPendingApprovals = async () => {
// // //     try {
// // //       const token = getToken();
// // //       const headers = {
// // //         ...(token ? { Authorization: `Bearer ${token}` } : {}),
// // //       };

// // //       const [usersRes, sellersRes, sellerUsersRes] = await Promise.all([
// // //         fetch(`${USERS_BASE}?limit=1000&page=1`, {
// // //           headers,
// // //           credentials: "include",
// // //         }),
// // //         fetch(`${SELLERS_BASE}`, {
// // //           headers,
// // //           credentials: "include",
// // //         }),
// // //         fetch(`${USERS_BASE}?seller=true&limit=1000&page=1`, {
// // //           headers,
// // //           credentials: "include",
// // //         }),
// // //       ]);

// // //       const [usersData, sellersData, sellerUsersData] = await Promise.all([
// // //         usersRes.json(),
// // //         sellersRes.json(),
// // //         sellerUsersRes.json(),
// // //       ]);

// // //       // const isPendingUser = (u: any) => {
// // //       //   const kyc = String(u?.kycStatus || "");
// // //       //   const verified = !!u?.isVerified;
// // //       //   return !verified || kyc === "NOT_SUBMITTED" || kyc === "PENDING";
// // //       // };

// // //       // const isPendingSeller = (s: any) => {
// // //       //   const kyc = String(s?.kycStatus || "");
// // //       //   const verified = !!s?.verified || !!s?.isVerified;
// // //       //   return !verified || kyc === "NOT_SUBMITTED" || kyc === "PENDING";
// // //       // };

// // //       const isPendingUser = (u: any) => {
// // //   return String(u?.kycStatus || "") === "PENDING";
// // // };

// // // const isPendingSeller = (s: any) => {
// // //   return String(s?.kycStatus || "") === "PENDING";
// // // };

// // //       const pendingUsers = (usersData?.users || []).filter(isPendingUser).length;
// // //       const pendingOrgSellers = (sellersData?.sellers || []).filter(isPendingSeller).length;
// // //       const pendingSellerUsers = (sellerUsersData?.users || []).filter(isPendingUser).length;

// // //       setPendingApprovals(pendingUsers + pendingOrgSellers + pendingSellerUsers);
// // //     } catch (err) {
// // //       console.error("Pending approvals fetch failed:", err);
// // //       setPendingApprovals(0);
// // //     }
// // //   };

// // //   if (active === "dashboard") {
// // //     loadPendingApprovals();
// // //   }
// // // }, [active]);

// // //   useEffect(() => {
// // //     const fetchMarketplacePrompts = async () => {
// // //       try {
// // //         setProductsLoading(true);
// // //         setProductsError(null);

// // //         const token = getToken();
// // //         const res = await fetch(`${PROMPTS_BASE}/others`, {
// // //           headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
// // //           credentials: "include",
// // //         });

// // //         const data = await res.json();
// // //         if (!res.ok || !data?.success) {
// // //           throw new Error(data?.error || "Failed to load marketplace prompts");
// // //         }

// // //         const mapped: PromptProduct[] = (data.prompts || []).map((doc: any) => {
// // //           const att = doc?.attachment || null;
// // //           const mediaPath = att?.path || undefined;

// // //           const imageUrl = att?.type === "image" ? mediaPath : undefined;
// // //           const videoUrl = att?.type === "video" ? mediaPath : undefined;

// // //           const status: PromptProduct["status"] =
// // //             doc?.flagged ? "Flagged" : doc?.draft ? "Draft" : "Published";

// // //           return {
// // //             id: String(doc._id),
// // //             title: doc?.title || "Untitled",
// // //             uploaderName: doc?.userId?.name || "Unknown",
// // //            uploaderId:
// // //   doc?.userId?._id ||
// // //   doc?.uploaderId?._id ||
// // //   doc?.uploaderId ||
// // //   doc?.sellerId?._id ||
// // //   doc?.sellerId ||
// // //   null,
// // //             price:
// // //               typeof doc?.tokun_price === "number"
// // //                 ? doc.tokun_price
// // //                 : typeof doc?.price === "number"
// // //                 ? doc.price
// // //                 : 0,
// // //             status,
// // //             imageUrl,
// // //             videoUrl,
// // //             category:
// // //               doc?.categories?.[0]?.name ||
// // //               (Array.isArray(doc?.categories)
// // //                 ? doc.categories
// // //                     .map((c: any) =>
// // //                       typeof c === "string" ? c : c?.name
// // //                     )
// // //                     .filter(Boolean)
// // //                     .join(", ")
// // //                 : "General"),
// // //             exclusive: !!doc?.exclusive,
// // //             sold: !!doc?.sold,
// // //           };
// // //         });

// // //         setProducts(mapped);
// // //       } catch (e: any) {
// // //         setProductsError(e?.message || "Error loading products");
// // //       } finally {
// // //         setProductsLoading(false);
// // //       }
// // //     };

// // //     fetchMarketplacePrompts();
// // //   }, []);

// // //   useEffect(() => {
// // //     const loadCategories = async () => {
// // //       try {
// // //         setCatsLoading(true);
// // //         setCatsError(null);

// // //         const res = await fetch(`${API_BASE}/api/category`, {
// // //           credentials: "include",
// // //         });
// // //         const data = await res.json();

// // //         if (!res.ok || !data?.success) {
// // //           throw new Error(data?.error || "Failed to load categories");
// // //         }
// // //         setCategories(data.categories || []);
// // //       } catch (e: any) {
// // //         setCatsError(e?.message || "Failed to load categories");
// // //         setCategories([]);
// // //       } finally {
// // //         setCatsLoading(false);
// // //       }
// // //     };

// // //     loadCategories();
// // //   }, []);

// // //   // =============================
// // //   // ✅ NAV ITEM
// // //   // =============================
// // //   const NavItem = ({
// // //     id,
// // //     label,
// // //     icon,
// // //   }: {
// // //     id: NavKey;
// // //     label: string;
// // //     icon: React.ReactNode;
// // //   }) => {
// // //     const isActive = active === id;
// // //     return (
// // //       <button
// // //         onClick={() => setActive(id)}
// // //         className={[
// // //           "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition",
// // //           isActive ? "text-fuchsia-300" : "text-white/75 hover:text-white",
// // //         ].join(" ")}
// // //       >
// // //         <span className={isActive ? "text-fuchsia-300" : "text-white/55"}>
// // //           {icon}
// // //         </span>
// // //         {label}
// // //       </button>
// // //     );
// // //   };

// // //   const formatDate = (dateLike?: string | null) => {
// // //     if (!dateLike) return "—";
// // //     const d = new Date(dateLike);
// // //     if (Number.isNaN(d.getTime())) return "—";
// // //     return d.toLocaleDateString("en-US", {
// // //       month: "short",
// // //       day: "2-digit",
// // //       year: "numeric",
// // //     });
// // //   };

// // //   const activeUsersCount = useMemo(() => {
// // //   const start = new Date();
// // //   start.setHours(0, 0, 0, 0);

// // //   return userRows.filter(u => {
// // //     if (!u.lastLoginAt) return false;
// // //     return new Date(u.lastLoginAt).getTime() >= start.getTime();
// // //   }).length;
// // // }, [userRows]);

// // // const MobileBottomNav = () => {
// // //   const Item = ({
// // //     id,
// // //     label,
// // //     icon,
// // //   }: {
// // //     id: NavKey;
// // //     label: string;
// // //     icon: React.ReactNode;
// // //   }) => {
// // //     const activeNow = active === id;
// // //     return (
// // //       <button
// // //         onClick={() => {
// // //           setActive(id);
// // //           if (id === "reports") setMobileReportsPage("list");
// // //         }}
// // //         className={[
// // //           "flex flex-col items-center justify-center gap-1 flex-1 py-2",
// // //           activeNow ? "text-fuchsia-300" : "text-white/60",
// // //         ].join(" ")}
// // //       >
// // //         <div className={activeNow ? "text-fuchsia-300" : "text-white/50"}>{icon}</div>
// // //         <div className="text-[11px]">{label}</div>
// // //       </button>
// // //     );
// // //   };

// // //   return (
// // //     <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#07080B]/90 backdrop-blur">
// // //       <div className="mx-auto max-w-[520px] px-3">
// // //         <div className="flex items-center">
// // //           <Item id="dashboard" label="Home" icon={<LayoutDashboard className="h-5 w-5" />} />
// // //           <Item id="sellers" label="Sellers" icon={<Store className="h-5 w-5" />} />
// // //           <Item id="products" label="Products" icon={<Package className="h-5 w-5" />} />
// // //           <Item id="reports" label="Reports" icon={<ShieldAlert className="h-5 w-5" />} />
// // //           <Item id="account" label="Account" icon={<UserRound className="h-5 w-5" />} />
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };


// // //   const ReportsMobileList = () => {
// // //   const grouped = useMemo(() => {
// // //     const list = [...reports].sort(
// // //       (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// // //     );
// // //     return {
// // //       High: list.filter((r) => r.priority === "High"),
// // //       Medium: list.filter((r) => r.priority === "Medium"),
// // //       Low: list.filter((r) => r.priority === "Low"),
// // //     };
// // //   }, [reports]);

// // //   const open = (r: ReportItem) => {
// // //     setSelectedReport(r);
// // //     setMobileReportsPage("details");
// // //   };

// // //   const Item = (r: ReportItem) => (
// // //     <button
// // //       key={r.id}
// // //       onClick={() => open(r)}
// // //       className="w-full text-left px-4 py-4 border-t border-white/10 hover:bg-white/[0.03]"
// // //     >
// // //       <div className="flex items-start justify-between gap-3">
// // //         <div className="min-w-0">
// // //           <div className="text-xs font-semibold text-white/80">
// // //             {r.priority === "High" ? "HIGH RISK" : r.priority === "Medium" ? "PENDING" : "LOW RISK"}
// // //           </div>
// // //           <div className="mt-2 text-sm font-medium text-white/90 truncate">
// // //             {r.productTitle || r.title}
// // //           </div>
// // //           <div className="mt-1 text-xs text-white/55 truncate">
// // //             {r.reason}
// // //             {r.reporterName ? `: Reported by @${r.reporterName}` : ""}
// // //           </div>
// // //         </div>
// // //         <div className="shrink-0 text-xs text-white/45">{timeAgo(r.createdAt)}</div>
// // //       </div>
// // //     </button>
// // //   );

// // //   return (
// // //     <section className={`${kpiCardBase} overflow-hidden`}>
// // //       <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
// // //         <div className="text-sm font-semibold">Product Reports</div>
// // //         <div className="text-xs text-white/60">
// // //           {(reports || []).filter((r) => r.status === "Open").length} Pending
// // //         </div>
// // //       </div>

// // //       <div className="max-h-[calc(100vh-170px)] overflow-y-auto">
// // //         {grouped.High.map(Item)}
// // //         {grouped.Medium.map(Item)}
// // //         {grouped.Low.map(Item)}
// // //       </div>
// // //     </section>
// // //   );
// // // };


// // //   // =============================
// // //   // ✅ REPORTS FLOW (LEFT + RIGHT)
// // //   // =============================
// // //   const [reports, setReports] = useState<ReportItem[]>([]);
// // //   const [reportsLoading, setReportsLoading] = useState(false);
// // //   const [reportsError, setReportsError] = useState<string | null>(null);
// // //   const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

// // //   // ✅ TEMP: mock reports (Replace with API later)
// // // useEffect(() => {
// // //   const loadReports = async () => {
// // //   try {
// // //     setReportsLoading(true);
// // //     setReportsError(null);

// // //     // Ensure the token is available, and add it to the request headers
// // //     const token = getToken();  // Assuming `getToken()` retrieves the stored JWT token

// // //     const res = await fetch(REPORTS_BASE, {
// // //       headers: {
// // //         Authorization: `Bearer ${token}`,  // Attach token as Bearer token
// // //       },
// // //       credentials: "include",  // Include cookies if necessary
// // //     });

// // //     const data = await res.json();
// // //     if (!res.ok || !data?.success)
// // //       throw new Error(data?.error || "Failed to load reports");

// // //       const mapped: ReportItem[] = (data.reports || []).map((r: any) => {
// // //         const prompt = r.prompt || {};
// // //         const attachment = prompt.attachment || {};
// // //         const attPath = attachment?.path || "";

// // //         const previewImageUrl =
// // //           attachment?.type === "image" ? attPath : undefined;
// // //         const previewVideoUrl =
// // //           attachment?.type === "video" ? attPath : undefined;

// // //         const evidenceFiles =
// // //           (r.screenshots || []).map((u: string) => ({
// // //             type: "image" as const,
// // //             url: u.startsWith("http") ? u : `${API_BASE}${u}`,
// // //             label: "Screenshot",
// // //           })) || [];

// // //         return {
// // //           id: String(r._id),
// // //           title: r.resourceTitle || prompt.title || "Report",
// // //           listingId: String(r.prompt?._id || r.prompt || ""),
// // //           productId: String(r.prompt?._id || r.prompt || ""),
// // //           category: r.category?.name || "General",
// // //           status:
// // //             r.status === "Pending"
// // //               ? "Open"
// // //               : r.status === "Reviewed"
// // //               ? "Reviewed"
// // //               : r.status === "Resolved"
// // //               ? "Actioned"
// // //               : "Dismissed",
// // //           priority: "Medium",
// // //           createdAt: r.createdAt,

// // //           reporterName: r.reporter?.name,
// // //           reporterEmail: r.reporter?.email,
// // //           reason: r.reason,
// // //           details: r.description || r.stepsToReproduce || "",

// // //           productTitle: prompt.title,
// // //           sellerName: prompt.userId?.name,

// // //           previewImageUrl: previewImageUrl
// // //             ? previewImageUrl.startsWith("http")
// // //               ? previewImageUrl
// // //               : `${API_BASE}${previewImageUrl}`
// // //             : undefined,

// // //           previewVideoUrl: previewVideoUrl
// // //             ? previewVideoUrl.startsWith("http")
// // //               ? previewVideoUrl
// // //               : `${API_BASE}${previewVideoUrl}`
// // //             : undefined,

// // //           evidence: [
// // //             ...evidenceFiles,
// // //             ...(r.resourceURL
// // //               ? [{ type: "text" as const, text: `Resource URL: ${r.resourceURL}` }]
// // //               : []),
// // //           ],
// // //           history: [{ at: r.createdAt, by: "System", action: "Report created" }],
// // //         };
// // //       });
// // //  setReports(mapped);
// // //     setSelectedReport((prev) => prev ?? (mapped[0] || null));
// // //   } catch (e: any) {
// // //     setReportsError(e?.message || "Failed to load reports");
// // //     setReports([]);
// // //   } finally {
// // //     setReportsLoading(false);
// // //   }
// // // };
    


// // //   loadReports();
// // // }, []);

// // //   const Badge = ({
// // //     children,
// // //     tone,
// // //   }: {
// // //     children: React.ReactNode;
// // //     tone:
// // //       | "neutral"
// // //       | "blue"
// // //       | "emerald"
// // //       | "red"
// // //       | "amber"
// // //       | "fuchsia"
// // //       | "slate";
// // //   }) => {
// // //     const map: Record<string, string> = {
// // //       neutral: "bg-white/10 text-white/80 border-white/15",
// // //       blue: "bg-blue-500/15 text-blue-200 border-blue-500/25",
// // //       emerald: "bg-emerald-500/15 text-emerald-200 border-emerald-500/25",
// // //       red: "bg-red-500/15 text-red-200 border-red-500/25",
// // //       amber: "bg-amber-500/15 text-amber-200 border-amber-500/25",
// // //       fuchsia: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/25",
// // //       slate: "bg-slate-500/15 text-slate-200 border-slate-400/25",
// // //     };
// // //     return (
// // //       <span
// // //         className={[
// // //           "px-3 py-1 rounded-full text-xs font-medium border inline-flex",
// // //           map[tone],
// // //         ].join(" ")}
// // //       >
// // //         {children}
// // //       </span>
// // //     );
// // //   };

// // //   const priorityTone = (p: ReportItem["priority"]) => {
// // //     if (p === "High") return "red";
// // //     if (p === "Medium") return "amber";
// // //     return "slate";
// // //   };

// // //   const statusTone = (s: ReportItem["status"]) => {
// // //     if (s === "Open") return "fuchsia";
// // //     if (s === "Reviewed") return "blue";
// // //     if (s === "Dismissed") return "slate";
// // //     return "emerald";
// // //   };

// // //   // ✅ Right panel component
// // //  const ReportDetailsPanel = ({
// // //   report,
// // //   onClose,
// // //   onDismiss,
// // //   onFlag,
// // //   onSuspend,
// // // }: {
// // //   report: ReportItem;
// // //   onClose: () => void;
// // //   onDismiss: (id: string) => void;
// // //   onFlag: (listingId: string) => void;
// // //   onSuspend: (listingId: string) => void;
// // // }) => {
// // //   return (
// // //   <div className="w-full min-w-0 space-y-6">

// // //       {/* Header row */}
// // //      <div className={`${kpiCardBase} p-4 md:p-6`}>
// // //   <div className="flex flex-col gap-4">
// // //     {/* Title */}
// // //     <div className="text-center md:text-left">
// // //       <h1 className="text-[18px] md:text-2xl font-semibold">
// // //         Report Details: {report.productTitle || report.title}
// // //       </h1>
// // //       <div className="mt-2 text-xs md:text-sm text-white/55">
// // //         Listing ID: {report.listingId} | Category: {report.category}
// // //       </div>
// // //     </div>

// // //     {/* Action Buttons */}
// // //     <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
// // //       <button
// // //         onClick={() => onDismiss(report.id)}
// // //         className="h-10 px-4 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm w-full"
// // //       >
// // //         Dismiss Report
// // //       </button>
// // //       <button
// // //         onClick={() => onFlag(report.listingId)}
// // //         className="h-10 px-4 rounded-xl bg-[#1677FF] hover:opacity-90 text-sm font-medium w-full"
// // //       >
// // //         Flag Product
// // //       </button>
// // //       <button
// // //         onClick={() => onSuspend(report.listingId)}
// // //         className="h-10 px-4 rounded-xl bg-red-500 hover:opacity-90 text-sm font-medium w-full"
// // //       >
// // //         Suspend Listing
// // //       </button>
// // //     </div>
// // //   </div>
// // // </div>

// // //       {/* Main 2 columns like image */}
// // //       <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
// // //         {/* LEFT listing card (bigger) */}
// // //         <div className="lg:col-span-3 space-y-5">
// // //           <div className={`${kpiCardBase} overflow-hidden`}>
// // //             {/* Preview */}
// // //             <div className="h-[360px] bg-black/40 relative">
// // //               {report.previewImageUrl ? (
// // //                 <img
// // //                   src={report.previewImageUrl}
// // //                   className="absolute inset-0 w-full h-full object-cover"
// // //                   alt="preview"
// // //                 />
// // //               ) : (
// // //                 <div className="absolute inset-0 flex items-center justify-center text-white/60">
// // //                   No Preview
// // //                 </div>
// // //               )}
// // //             </div>

// // //             {/* Listing info */}
// // //             <div className="p-6">
// // //               <div className="flex items-center justify-between">
// // //                 <div className="text-xl font-semibold">
// // //                   {report.productTitle || report.title}
// // //                 </div>
// // //                 <div className="text-sm text-white/60">2.45 ETH</div>
// // //               </div>

// // //               <div className="mt-3 text-sm text-white/65 leading-relaxed">
// // //                 {report.details || "—"}
// // //               </div>

// // //               <div className="mt-5 flex items-center gap-3">
// // //                 <img
// // //                   src="https://i.pravatar.cc/60?img=15"
// // //                   className="h-11 w-11 rounded-full border border-white/10 object-cover"
// // //                   alt="seller"
// // //                 />
// // //                 <div>
// // //                   <div className="text-sm text-white/85">
// // //                     Seller: @{(report.sellerName || "Seller").replace(/\s+/g, "")}
// // //                   </div>
// // //                   <div className="text-xs text-white/50">
// // //                     Member since Jan 2022 · 4.9 Rating
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           </div>

// // //           {/* Evidence thumbnails row like image */}
// // //           <div>
// // //             <div className="text-lg font-semibold mb-3">Review Evidence & Files</div>
// // //             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// // //               {(report.evidence || [])
// // //                 .filter((e) => e.type !== "text")
// // //                 .slice(0, 4)
// // //                 .map((e, idx) => (
// // //                   <div
// // //                     key={idx}
// // //                     className="h-[120px] rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02]"
// // //                   >
// // //                     {e.url ? (
// // //                       <img
// // //                         src={e.url}
// // //                         className="w-full h-full object-cover"
// // //                         alt="evidence"
// // //                       />
// // //                     ) : (
// // //                       <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
// // //                         File
// // //                       </div>
// // //                     )}
// // //                   </div>
// // //                 ))}
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* RIGHT complaint + history like image */}
// // //         <div className="lg:col-span-2 space-y-5">
// // //           {/* Complaint Information */}
// // //           <div className={`${kpiCardBase} p-6`}>
// // //             <h2 className="text-xl font-semibold">Complaint Information</h2>

// // //             <div className="mt-5">
// // //               <div className="text-xs text-white/50 uppercase tracking-wide">
// // //                 Reason for Report
// // //               </div>
// // //               <div className="mt-2 text-sm text-white/80">
// // //                 {report.reason}
// // //               </div>
// // //             </div>

// // //             <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
// // //               <div className="text-xs text-white/60">Reporter Comments</div>
// // //               <div className="mt-2 text-sm text-white/75 leading-relaxed">
// // //                 {report.details ||
// // //                   "Requesting immediate action based on the reported issue."}
// // //               </div>
// // //             </div>

// // //             <div className="mt-5 flex items-center gap-3">
// // //               <img
// // //                 src="https://i.pravatar.cc/70?img=33"
// // //                 className="h-11 w-11 rounded-full border border-white/10 object-cover"
// // //                 alt="reporter"
// // //               />
// // //               <div>
// // //                 <div className="text-sm text-white/85">
// // //                   Reported By: {report.reporterName || "Anonymous"}
// // //                 </div>
// // //                 <div className="text-xs text-white/50">
// // //                   Account Standing: Verified Contributor
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           </div>

// // //           {/* Seller report history (table look) */}
// // //           <div className={`${kpiCardBase} p-6`}>
// // //             <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
// // //               Seller Report History
// // //             </div>

// // //             <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
// // //               <div className="grid grid-cols-3 px-4 py-3 text-xs text-white/55 bg-white/[0.03]">
// // //                 <div>Date</div>
// // //                 <div>Reasons</div>
// // //                 <div className="text-right">Action</div>
// // //               </div>

// // //               <div className="divide-y divide-white/10">
// // //                 {(report.history || []).slice(0, 2).map((h, idx) => (
// // //                   <div key={idx} className="grid grid-cols-3 px-4 py-4 text-sm bg-white/[0.02]">
// // //                     <div className="text-white/70">{formatDate(h.at)}</div>
// // //                     <div className="text-white/70">{h.note || h.action}</div>
// // //                     <div className="text-right text-white/80">{h.action}</div>
// // //                   </div>
// // //                 ))}

// // //                 {(report.history || []).length === 0 && (
// // //                   <div className="px-4 py-4 text-sm text-white/60">
// // //                     No previous actions.
// // //                   </div>
// // //                 )}
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };



// // //   // ✅ Reports View (LEFT list + RIGHT panel)
// // //   const ReportsView = () => {
// // //     const [query, setQuery] = useState("");
// // //     const [status, setStatus] = useState<"all" | ReportItem["status"]>("all");
// // //     const [priority, setPriority] = useState<"all" | ReportItem["priority"]>(
// // //       "all"
// // //     );

// // //     const filtered = useMemo(() => {
// // //       const q = query.trim().toLowerCase();
// // //       let list = [...reports];

// // //       if (status !== "all") list = list.filter((r) => r.status === status);
// // //       if (priority !== "all") list = list.filter((r) => r.priority === priority);

// // //       if (q) {
// // //         list = list.filter(
// // //           (r) =>
// // //             r.title.toLowerCase().includes(q) ||
// // //             r.listingId.toLowerCase().includes(q) ||
// // //             (r.productTitle || "").toLowerCase().includes(q) ||
// // //             (r.sellerName || "").toLowerCase().includes(q) ||
// // //             (r.reason || "").toLowerCase().includes(q)
// // //         );
// // //       }

// // //       // Open first, then by newest
// // //       list.sort((a, b) => {
// // //         if (a.status === "Open" && b.status !== "Open") return -1;
// // //         if (a.status !== "Open" && b.status === "Open") return 1;
// // //         return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
// // //       });

// // //       return list;
// // //     }, [reports, query, status, priority]);

// // //     const dismissReport = (id: string) => {
// // //       setReports((prev) =>
// // //         prev.map((r) =>
// // //           r.id === id
// // //             ? {
// // //                 ...r,
// // //                 status: "Dismissed",
// // //                 history: [
// // //                   ...(r.history || []),
// // //                   {
// // //                     at: new Date().toISOString(),
// // //                     by: adminName,
// // //                     action: "Dismissed report",
// // //                   },
// // //                 ],
// // //               }
// // //             : r
// // //         )
// // //       );

// // //       // also update selected
// // //       setSelectedReport((prev) =>
// // //         prev?.id === id ? { ...prev, status: "Dismissed" } : prev
// // //       );
// // //     };

// // //     const flagProduct = (listingId: string) => {
// // //       // TODO: call your backend flag endpoint
// // //       console.log("Flag listing:", listingId);

// // //       setSelectedReport((prev) =>
// // //         prev
// // //           ? {
// // //               ...prev,
// // //               status: "Actioned",
// // //               history: [
// // //                 ...(prev.history || []),
// // //                 {
// // //                   at: new Date().toISOString(),
// // //                   by: adminName,
// // //                   action: "Flagged product",
// // //                   note: `Listing: ${listingId}`,
// // //                 },
// // //               ],
// // //             }
// // //           : prev
// // //       );
// // //     };

// // //     const suspendListing = (listingId: string) => {
// // //       // TODO: call your backend suspend endpoint
// // //       console.log("Suspend listing:", listingId);

// // //       setSelectedReport((prev) =>
// // //         prev
// // //           ? {
// // //               ...prev,
// // //               status: "Actioned",
// // //               history: [
// // //                 ...(prev.history || []),
// // //                 {
// // //                   at: new Date().toISOString(),
// // //                   by: adminName,
// // //                   action: "Suspended listing",
// // //                   note: `Listing: ${listingId}`,
// // //                 },
// // //               ],
// // //             }
// // //           : prev
// // //       );
// // //     };

// // //     return (
// // //       <>
// // //         {/* Page title */}
// // //           <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
// // //   <div className="text-center md:text-left">
// // //     <div className="flex items-center justify-center md:justify-start gap-3">
// // //       <h1 className="text-[24px] md:text-[34px] leading-[1.1] font-semibold">
// // //         Reports & Complaints
// // //       </h1>
// // //       <span className="px-3 py-1 rounded-full text-xs font-medium bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-500/25">
// // //         {(reports || []).filter((r) => r.status === "Open").length} Open
// // //       </span>
// // //     </div>
// // //     <p className="mt-2 text-white/60 text-sm">
// // //       Review and take action on reported listings and policy violations
// // //     </p>
// // //   </div>
// // // </div>

// // //         {/* Filters */}
// // //         <section className={`${kpiCardBase} mt-6 p-4`}>
// // //           <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
// // //             {/* Search */}
// // //             <div className="flex-1 relative">
// // //               <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
// // //               <input
// // //                 value={query}
// // //                 onChange={(e) => setQuery(e.target.value)}
// // //                 className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
// // //                 placeholder="Search by report title, listing ID, seller, reason..."
// // //               />
// // //             </div>

// // //             <div className="flex gap-3 flex-wrap justify-start lg:justify-end">
// // //               <Select value={status} onValueChange={(v: any) => setStatus(v)}>
// // //                 <SelectTrigger className="h-11 w-[160px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
// // //                   <SelectValue placeholder="All Status" />
// // //                 </SelectTrigger>
// // //                 <SelectContent className="max-h-[280px]">
// // //                   <SelectItem value="all">All Status</SelectItem>
// // //                   <SelectItem value="Open">Open</SelectItem>
// // //                   <SelectItem value="Reviewed">Reviewed</SelectItem>
// // //                   <SelectItem value="Dismissed">Dismissed</SelectItem>
// // //                   <SelectItem value="Actioned">Actioned</SelectItem>
// // //                 </SelectContent>
// // //               </Select>

// // //               <Select
// // //                 value={priority}
// // //                 onValueChange={(v: any) => setPriority(v)}
// // //               >
// // //                 <SelectTrigger className="h-11 w-[160px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
// // //                   <SelectValue placeholder="All Priority" />
// // //                 </SelectTrigger>
// // //                 <SelectContent className="max-h-[280px]">
// // //                   <SelectItem value="all">All Priority</SelectItem>
// // //                   <SelectItem value="High">High</SelectItem>
// // //                   <SelectItem value="Medium">Medium</SelectItem>
// // //                   <SelectItem value="Low">Low</SelectItem>
// // //                 </SelectContent>
// // //               </Select>

// // //               <button
// // //                 onClick={() => {
// // //                   setQuery("");
// // //                   setStatus("all");
// // //                   setPriority("all");
// // //                 }}
// // //                 className="h-11 px-4 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80 flex items-center gap-2"
// // //               >
// // //                 <X className="h-4 w-4" />
// // //                 Clear
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </section>

// // //         {/* Left + Right layout */}
// // //     {/* ✅ MOBILE: list OR details (full width) */}
// // // <div className="block md:hidden mt-6">
// // //   {mobileReportsPage === "list" ? (
// // //     <ReportsMobileList />
// // //   ) : selectedReport ? (
// // //     <div className="w-full min-w-0">
// // //       {/* ✅ Back */}
// // //       <button
// // //         onClick={() => setMobileReportsPage("list")}
// // //         className="mb-4 text-sm text-white/70 hover:text-white"
// // //       >
// // //         ← Back to reports
// // //       </button>

// // //       <ReportDetailsPanel
// // //         report={selectedReport}
// // //         onClose={() => {
// // //           setSelectedReport(null);
// // //           setMobileReportsPage("list");
// // //         }}
// // //         onDismiss={(id) => {
// // //           dismissReport(id);
// // //           setMobileReportsPage("list");
// // //         }}
// // //         onFlag={(listingId) => flagProduct(listingId)}
// // //         onSuspend={(listingId) => suspendListing(listingId)}
// // //       />
// // //     </div>
// // //   ) : (
// // //     <ReportsMobileList />
// // //   )}
// // // </div>

// // // {/* ✅ DESKTOP: keep your existing UI */}
// // // <div className="hidden md:block mt-6">
// // //   {/* KEEP your current desktop section here */}
// // //   <section className="w-full">
// // //     <div className="w-full min-w-0">
// // //       {!selectedReport ? (
// // //         <div className={`${kpiCardBase} p-10 flex items-center justify-center text-white/60`}>
// // //           Select a report from the left to view details.
// // //         </div>
// // //       ) : (
// // //         <div className="w-full min-w-0">
// // //           <ReportDetailsPanel
// // //             report={selectedReport}
// // //             onClose={() => setSelectedReport(null)}
// // //             onDismiss={dismissReport}
// // //             onFlag={flagProduct}
// // //             onSuspend={suspendListing}
// // //           />
// // //         </div>
// // //       )}
// // //     </div>
// // //   </section>
// // // </div>


// // //       </>
// // //     );
// // //   };
// // // const SellersMobileCards = ({
// // //   rows,
// // // }: {
// // //   rows: SellerRow[];
// // // }) => {
// // //   return (
// // //     <div className="space-y-5">
// // //       {rows.map((r) => (
// // //         <div key={r.id} className={`${kpiCardBase} p-5`}>
// // //           <div className="flex items-start justify-between gap-3">
// // //             <div className="flex items-center gap-3 min-w-0">
// // //               <img
// // //                 src={r.avatar || "https://i.pravatar.cc/80?img=12"}
// // //                 className="h-12 w-12 rounded-full object-cover border border-white/10"
// // //                 alt={r.name}
// // //               />
// // //               <div className="min-w-0">
// // //                 <div className="text-sm font-semibold text-white/90 truncate">{r.name}</div>
// // //                 <div className="text-xs text-white/50 truncate">{r.email}</div>
// // //               </div>
// // //             </div>

// // //             <span
// // //               className={[
// // //                 "px-4 py-1.5 rounded-full text-xs font-medium border shrink-0",
// // //                 r.status === "Active"
// // //                   ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
// // //                   : "bg-red-500/15 text-red-200 border-red-500/25",
// // //               ].join(" ")}
// // //             >
// // //               {r.status}
// // //             </span>
// // //           </div>

// // //           <div className="mt-5 grid grid-cols-2 gap-4">
// // //             <div>
// // //               <div className="text-[11px] text-white/45 uppercase tracking-wide">Total Products</div>
// // //               <div className="mt-1 text-lg text-white/90">{Number(r.totalProducts || 0)}</div>
// // //             </div>
// // //             <div className="text-right">
// // //               <div className="text-[11px] text-white/45 uppercase tracking-wide">Joined Date</div>
// // //               <div className="mt-1 text-sm text-white/80">{formatDate(r.joined)}</div>
// // //             </div>
// // //           </div>

// // //           <div className="mt-5 flex items-center gap-3">
// // //             <button
// // //               className={[
// // //                 "flex-1 h-11 rounded-xl border text-sm font-medium",
// // //                 r.status === "Active"
// // //                   ? "border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/15"
// // //                   : "border-sky-500/25 bg-sky-500/10 text-sky-200 hover:bg-sky-500/15",
// // //               ].join(" ")}
// // //               onClick={() => console.log("toggle block", r.id)}
// // //             >
// // //               {r.status === "Active" ? "🚫 Block" : "🔓 Unblocked"}
// // //             </button>

// // //             <button
// // //               className="h-11 w-12 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center"
// // //               onClick={() => console.log("delete", r.id)}
// // //               aria-label="Delete"
// // //             >
// // //               🗑
// // //             </button>
// // //           </div>
// // //         </div>
// // //       ))}
// // //     </div>
// // //   );
// // // };


// // // const SellersView = () => {
// // //   const [query, setQuery] = useState("");
// // //   const [tab, setTab] = useState<"all" | "active" | "blocked" | "deleted">("all");
// // //   const [page, setPage] = useState(1);
// // //   const [pageSize, setPageSize] = useState(10);
// // //   const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
// // //   const [sellerLoading, setSellerLoading] = useState(false);
// // //   const [sellerError, setSellerError] = useState<string | null>(null);
// // //   const [sellerProducts, setSellerProducts] = useState<PromptProduct[]>([]);

// // //   // ✅ Popup state
// // //   const [confirmPopup, setConfirmPopup] = useState<{
// // //     type: "block" | "unblock" | "delete" | "restore";
// // //     seller: SellerRow;
// // //   } | null>(null);
// // //   const [actionLoading, setActionLoading] = useState(false);
// // //   const [actionError, setActionError] = useState<string | null>(null);

// // //   // ✅ Block / Unblock API call
// // //   const handleBlockToggle = async (seller: SellerRow) => {
// // //     const action = seller.status === "Active" ? "block" : "unblock";
// // //     try {
// // //       setActionLoading(true);
// // //       setActionError(null);
// // //       const token = getToken();
// // //       const res = await fetch(`${SELLERS_BASE}/${seller.id}/block`, {
// // //         method: "PATCH",
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //           ...(token ? { Authorization: `Bearer ${token}` } : {}),
// // //         },
// // //         credentials: "include",
// // //         body: JSON.stringify({ action }),
// // //       });
// // //       const data = await res.json();
// // //       if (!res.ok || !data?.success) throw new Error(data?.error || "Failed");

// // //       // ✅ Update local state
// // //       setSellerRows((prev) =>
// // //         prev.map((s) =>
// // //           s.id === seller.id
// // //             ? { ...s, status: action === "block" ? "Blocked" : "Active" }
// // //             : s
// // //         )
// // //       );
// // //       setConfirmPopup(null);
// // //     } catch (e: any) {
// // //       setActionError(e?.message || "Action failed");
// // //     } finally {
// // //       setActionLoading(false);
// // //     }
// // //   };

// // //   // ✅ Soft Delete / Restore API call
// // //   const handleDeleteToggle = async (seller: SellerRow) => {
// // //     const action = seller.isDeleted ? "restore" : "delete";
// // //     try {
// // //       setActionLoading(true);
// // //       setActionError(null);
// // //       const token = getToken();
// // //       const res = await fetch(`${SELLERS_BASE}/${seller.id}/soft-delete`, {
// // //         method: "PATCH",
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //           ...(token ? { Authorization: `Bearer ${token}` } : {}),
// // //         },
// // //         credentials: "include",
// // //         body: JSON.stringify({ action }),
// // //       });
// // //       const data = await res.json();
// // //       if (!res.ok || !data?.success) throw new Error(data?.error || "Failed");

// // //       // ✅ Update local state
// // //       setSellerRows((prev) =>
// // //         prev.map((s) =>
// // //           s.id === seller.id
// // //             ? {
// // //                 ...s,
// // //                 isDeleted: action === "delete",
// // //                 status: action === "delete" ? "Blocked" : "Active",
// // //               }
// // //             : s
// // //         )
// // //       );
// // //       setConfirmPopup(null);
// // //     } catch (e: any) {
// // //       setActionError(e?.message || "Action failed");
// // //     } finally {
// // //       setActionLoading(false);
// // //     }
// // //   };

// // //   const openSellerProfile = async (sellerId?: string | null) => {
// // //     if (!sellerId) return;
// // //     try {
// // //       setSellerLoading(true);
// // //       setSellerError(null);
// // //       const token = getToken();
// // //       const resSeller = await fetch(`${SELLERS_BASE}/${sellerId}`, {
// // //         headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
// // //         credentials: "include",
// // //       });
// // //       const sellerData = await resSeller.json();
// // //       if (!resSeller.ok || !sellerData?.success)
// // //         throw new Error(sellerData?.error || "Failed to load seller profile");

// // //       const resPrompts = await fetch(`${PROMPTS_BASE}/by-seller/${sellerId}`, {
// // //         headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
// // //         credentials: "include",
// // //       });
// // //       const promptData = await resPrompts.json();
// // //       if (!resPrompts.ok || !promptData?.success)
// // //         throw new Error(promptData?.error || "Failed to load seller products");

// // //      const s = sellerData.seller;

// // // const derivedTotalEarnings = (promptData.prompts || []).reduce((sum: number, doc: any) => {
// // //   const price = Number(doc?.price ?? doc?.tokun_price ?? 0);

// // //   const sales = Number(
// // //     doc?.sales ??
// // //     doc?.purchases ??
// // //     doc?.totalSales ??
// // //     doc?.totalPurchases ??
// // //     doc?.salesCount ??
// // //     doc?.purchaseCount ??
// // //     doc?.orderCount ??
// // //     0
// // //   );

// // //   const revenue = Number(
// // //     doc?.revenue ??
// // //     doc?.totalRevenue ??
// // //     doc?.totalEarning ??
// // //     doc?.earnings ??
// // //     doc?.cost ??
// // //     doc?.totalCost ??
// // //     (sales * price) ??
// // //     0
// // //   );

// // //   return sum + (Number.isFinite(revenue) ? revenue : 0);
// // // }, 0);

// // // setSelectedSeller({
// // //   id: String(s?._id || sellerId),
// // //   name: s?.name || "Unknown",
// // //   email: s?.email,
// // //   location: s?.location,
// // //   joined: s?.joined,
// // //   status: s?.status || "ACTIVE",
// // //   avatar: s?.avatar,
// // //   verified: !!s?.verified,
// // //   totalEarnings:
// // //     typeof s?.totalEarnings === "number" && s.totalEarnings > 0
// // //       ? s.totalEarnings
// // //       : derivedTotalEarnings,
// // //   rating: s?.rating ?? 0,
// // //   reviewsCount: s?.reviewsCount ?? 0,
// // //   refundRate: s?.refundRate ?? 0,
// // //   refundThreshold: s?.refundThreshold ?? 5,
// // // });

// // //       const mapped: PromptProduct[] = (promptData.prompts || []).map((doc: any) => {
// // //         const att = doc?.attachment || null;
// // //         const status: PromptProduct["status"] =
// // //           doc?.flagged ? "Flagged" : doc?.draft ? "Draft" : "Published";
// // //         return {
// // //           id: String(doc._id),
// // //           title: doc?.title || "Untitled",
// // //           uploaderName: doc?.userId?.name || "Unknown",
// // //           uploaderId:
// // //   doc?.userId?._id ||
// // //   doc?.uploaderId?._id ||
// // //   doc?.uploaderId ||
// // //   doc?.sellerId?._id ||
// // //   doc?.sellerId ||
// // //   null,
// // //           price: typeof doc?.price === "number" ? doc.price : 0,
// // //           status,
// // //           imageUrl: att?.type === "image" ? att?.path : undefined,
// // //           videoUrl: att?.type === "video" ? att?.path : undefined,
// // //           category: doc?.categories?.[0]?.name || "General",
// // //           exclusive: !!doc?.exclusive,
// // //           sold: !!doc?.sold,
// // //         };
// // //       });
// // //       setSellerProducts(mapped);
// // //     } catch (e: any) {
// // //       setSellerError(e?.message || "Error loading seller profile");
// // //     } finally {
// // //       setSellerLoading(false);
// // //     }
// // //   };

// // //   const closeSellerProfile = () => {
// // //     setSelectedSeller(null);
// // //     setSellerProducts([]);
// // //     setSellerError(null);
// // //   };

// // //   const filtered = useMemo(() => {
// // //     const q = query.trim().toLowerCase();
// // //     let list = [...sellerRows];

// // //     if (tab === "active") list = list.filter((s) => s.status === "Active" && !s.isDeleted);
// // //     else if (tab === "blocked") list = list.filter((s) => s.status === "Blocked" && !s.isDeleted);
// // //     else if (tab === "deleted") list = list.filter((s) => !!s.isDeleted);
// // //     else list = list.filter((s) => !s.isDeleted); // "all" = non-deleted

// // //     if (q) {
// // //       list = list.filter(
// // //         (s) =>
// // //           s.name.toLowerCase().includes(q) ||
// // //           s.email.toLowerCase().includes(q)
// // //       );
// // //     }
// // //     return list;
// // //   }, [sellerRows, query, tab]);

// // //   const total = filtered.length;
// // //   const totalPages = Math.max(1, Math.ceil(total / pageSize));
// // //   const safePage = Math.min(page, totalPages);
// // //   const startIndex = (safePage - 1) * pageSize;
// // //   const endIndex = Math.min(startIndex + pageSize, total);
// // //   const pageRows = filtered.slice(startIndex, endIndex);

// // //   useEffect(() => { setPage(1); }, [query, tab, pageSize]);

// // //   if (selectedSeller) {
// // //     return (
// // //       <SellerProfileView
// // //         seller={selectedSeller}
// // //         products={sellerProducts}
// // //         loading={sellerLoading}
// // //         error={sellerError}
// // //         onBack={closeSellerProfile}
// // //       />
// // //     );
// // //   }

// // //   // ✅ Popup labels helper
// // //   const popupConfig = confirmPopup
// // //     ? {
// // //         block: {
// // //           title: "Block Seller?",
// // //           desc: `Are you sure you want to block "${confirmPopup.seller.name}"? They won't be able to sell on the platform.`,
// // //           confirmLabel: "Yes, Block",
// // //           confirmClass: "bg-red-500 hover:opacity-90",
// // //         },
// // //         unblock: {
// // //           title: "Unblock Seller?",
// // //           desc: `Are you sure you want to unblock "${confirmPopup.seller.name}"? They will regain access to sell.`,
// // //           confirmLabel: "Yes, Unblock",
// // //           confirmClass: "bg-emerald-500 hover:opacity-90",
// // //         },
// // //         delete: {
// // //           title: "Delete Seller?",
// // //           desc: `Are you sure you want to delete "${confirmPopup.seller.name}"? This is a soft delete — you can restore them later.`,
// // //           confirmLabel: "Yes, Delete",
// // //           confirmClass: "bg-red-500 hover:opacity-90",
// // //         },
// // //         restore: {
// // //           title: "Restore Seller?",
// // //           desc: `Are you sure you want to restore "${confirmPopup.seller.name}"? They will be moved back to Active sellers.`,
// // //           confirmLabel: "Yes, Restore",
// // //           confirmClass: "bg-emerald-500 hover:opacity-90",
// // //         },
// // //       }[confirmPopup.type]
// // //     : null;

// // //   return (
// // //     <>
// // //       {/* ✅ CONFIRM POPUP */}
// // //       {confirmPopup && popupConfig && (
// // //         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
// // //           <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0F1117] p-6 shadow-2xl">
// // //             <h2 className="text-lg font-semibold text-white">{popupConfig.title}</h2>
// // //             <p className="mt-3 text-sm text-white/65 leading-relaxed">{popupConfig.desc}</p>

// // //             {actionError && (
// // //               <div className="mt-3 text-xs text-red-400">{actionError}</div>
// // //             )}

// // //             <div className="mt-6 flex gap-3">
// // //               <button
// // //                 onClick={() => { setConfirmPopup(null); setActionError(null); }}
// // //                 className="flex-1 h-11 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-sm text-white/80"
// // //                 disabled={actionLoading}
// // //               >
// // //                 Cancel
// // //               </button>
// // //               <button
// // //                 onClick={() => {
// // //                   if (confirmPopup.type === "block" || confirmPopup.type === "unblock") {
// // //                     handleBlockToggle(confirmPopup.seller);
// // //                   } else {
// // //                     handleDeleteToggle(confirmPopup.seller);
// // //                   }
// // //                 }}
// // //                 className={`flex-1 h-11 rounded-xl text-sm font-medium text-white ${popupConfig.confirmClass} disabled:opacity-60`}
// // //                 disabled={actionLoading}
// // //               >
// // //                 {actionLoading ? "Please wait…" : popupConfig.confirmLabel}
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* Header */}
// // //       <div className="mt-2 md:mt-0">
// // //         <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-4 md:gap-6">
// // //           <div className="text-center md:text-left w-full">
// // //             <h1 className="text-[24px] md:text-[34px] leading-[1.05] font-semibold">
// // //               Seller Management
// // //             </h1>
// // //             <p className="mt-1 text-white/60 text-sm text-center md:text-left">
// // //               Manage and monitor digital product sellers on the platform
// // //             </p>
// // //             <div className="flex gap-3 mt-4 justify-center md:justify-start">
// // //               <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-200 border border-blue-500/25">
// // //                 {filtered.length.toLocaleString()} Sellers
// // //               </span>
// // //               <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-200 border border-emerald-500/25">
// // //                 {products.length.toLocaleString()} Products
// // //               </span>
// // //             </div>
// // //           </div>
// // //           <div className="hidden md:block" />
// // //           <div className="flex justify-center md:justify-end w-full">
// // //             <button className="h-9 sm:h-10 px-5 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90">
// // //               <Plus className="h-4 w-4" />
// // //               Add Member
// // //             </button>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* Search + Tabs */}
// // //       <section className={`${kpiCardBase} mt-6 p-4`}>
// // //         <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
// // //           <div className="flex-1 relative">
// // //             <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
// // //             <input
// // //               value={query}
// // //               onChange={(e) => setQuery(e.target.value)}
// // //               className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
// // //               placeholder="Search sellers by name or email..."
// // //             />
// // //           </div>

// // //           {/* ✅ Tabs — All / Active / Blocked / Deleted */}
// // //           <div className="overflow-x-auto">
// // //             <div className="h-11 p-1 rounded-xl border border-white/10 bg-white/[0.03] flex items-center gap-1 w-max">
// // //               {(["all", "active", "blocked", "deleted"] as const).map((t) => (
// // //                 <button
// // //                   key={t}
// // //                   onClick={() => setTab(t)}
// // //                   className={[
// // //                     "h-9 px-4 rounded-lg text-sm capitalize whitespace-nowrap",
// // //                     tab === t
// // //                       ? t === "deleted"
// // //                         ? "bg-red-500/20 text-red-200 border border-red-500/25"
// // //                         : "bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] text-white"
// // //                       : "text-white/70 hover:text-white",
// // //                   ].join(" ")}
// // //                 >
// // //                   {t === "all" ? "All Sellers" : t === "deleted" ? "🗑 Deleted" : t.charAt(0).toUpperCase() + t.slice(1)}
// // //                 </button>
// // //               ))}
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </section>

// // //       {/* ✅ MOBILE: Cards */}
// // //       <div className="md:hidden mt-6">
// // //         {sellersLoading && <div className="text-white/70 text-sm">Loading sellers…</div>}
// // //         {!!sellersError && !sellersLoading && <div className="text-red-400 text-sm">{sellersError}</div>}
// // //         {!sellersLoading && !sellersError && (
// // //           <div className="space-y-5">
// // //             {pageRows.map((r) => (
// // //               <div key={r.id} className={`${kpiCardBase} p-5`}>
// // //                 <div className="flex items-start justify-between gap-3">
// // //                   <div className="flex items-center gap-3 min-w-0">
// // //                     <img
// // //                       src={r.avatar || "https://i.pravatar.cc/80?img=12"}
// // //                       className="h-12 w-12 rounded-full object-cover border border-white/10"
// // //                       alt={r.name}
// // //                     />
// // //                     <div className="min-w-0">
// // //   <button
// // //     type="button"
// // //     onClick={() => openSellerProfile(r.id)}
// // //     className="text-sm font-semibold text-white/90 truncate hover:text-sky-400 text-left block w-full"
// // //   >
// // //     {r.name}
// // //   </button>
// // //   <div className="text-xs text-white/50 truncate">{r.email}</div>
// // // </div>
// // //                   </div>
// // //                   <span className={[
// // //                     "px-3 py-1 rounded-full text-xs font-medium border shrink-0",
// // //                     r.isDeleted
// // //                       ? "bg-red-500/15 text-red-300 border-red-500/25"
// // //                       : r.status === "Active"
// // //                       ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
// // //                       : "bg-red-500/15 text-red-200 border-red-500/25",
// // //                   ].join(" ")}>
// // //                     {r.isDeleted ? "Deleted" : r.status}
// // //                   </span>
// // //                 </div>

// // //                 <div className="mt-4 grid grid-cols-2 gap-3 text-center">
// // //                   <div>
// // //                     <div className="text-[11px] text-white/45 uppercase tracking-wide">Products</div>
// // //                     <div className="mt-1 text-base text-white/90">{Number(r.totalProducts || 0)}</div>
// // //                   </div>
// // //                   <div>
// // //                     <div className="text-[11px] text-white/45 uppercase tracking-wide">Joined</div>
// // //                     <div className="mt-1 text-sm text-white/80">{formatDate(r.joined)}</div>
// // //                   </div>
// // //                 </div>

// // //                 <div className="mt-4 flex gap-2">
// // //                   {/* Block / Unblock */}
// // //                   {!r.isDeleted && (
// // //                     <button
// // //                       onClick={() => setConfirmPopup({
// // //                         type: r.status === "Active" ? "block" : "unblock",
// // //                         seller: r,
// // //                       })}
// // //                       className={[
// // //                         "flex-1 h-10 rounded-xl border text-xs font-medium",
// // //                         r.status === "Active"
// // //                           ? "border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/15"
// // //                           : "border-sky-500/25 bg-sky-500/10 text-sky-200 hover:bg-sky-500/15",
// // //                       ].join(" ")}
// // //                     >
// // //                       {r.status === "Active" ? "🚫 Block" : "✅ Unblock"}
// // //                     </button>
// // //                   )}

// // //                   {/* Delete / Restore */}
// // //                   <button
// // //                     onClick={() => setConfirmPopup({
// // //                       type: r.isDeleted ? "restore" : "delete",
// // //                       seller: r,
// // //                     })}
// // //                     className={[
// // //                       "flex-1 h-10 rounded-xl border text-xs font-medium",
// // //                       r.isDeleted
// // //                         ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
// // //                         : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]",
// // //                     ].join(" ")}
// // //                   >
// // //                     {r.isDeleted ? "↩ Restore" : "🗑 Delete"}
// // //                   </button>
// // //                 </div>
// // //               </div>
// // //             ))}
// // //             {pageRows.length === 0 && (
// // //               <div className="text-white/60 text-sm text-center py-8">No sellers found.</div>
// // //             )}
// // //           </div>
// // //         )}

// // //         {/* Mobile Pagination */}
// // //         <div className="mt-6 flex items-center justify-between">
// // //           <button
// // //             disabled={safePage <= 1}
// // //             onClick={() => setPage((p) => Math.max(1, p - 1))}
// // //             className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40 text-sm"
// // //           >
// // //             Previous
// // //           </button>
// // //           <div className="text-xs text-white/60">Page {safePage} / {totalPages}</div>
// // //           <button
// // //             disabled={safePage >= totalPages}
// // //             onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
// // //             className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40 text-sm"
// // //           >
// // //             Next
// // //           </button>
// // //         </div>
// // //       </div>

// // //       {/* ✅ DESKTOP: Table */}
// // //       <div className="hidden md:block">
// // //         <section className={`${kpiCardBase} mt-6 p-6`}>
// // //           {sellersLoading && <div className="p-6 text-white/70 text-sm">Loading sellers…</div>}
// // //           {!!sellersError && !sellersLoading && <div className="p-6 text-red-400 text-sm">{sellersError}</div>}

// // //           {!sellersLoading && !sellersError && (
// // //             <>
// // //               <div className="overflow-hidden rounded-2xl border border-white/10">
// // //                 <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
// // //                   <div className="col-span-4">Seller Name</div>
// // //                   <div className="col-span-2">Status</div>
// // //                   <div className="col-span-2">Volume</div>
// // //                   <div className="col-span-3">Joined Date</div>
// // //                   <div className="col-span-1 text-right">Actions</div>
// // //                 </div>

// // //                 <div className="divide-y divide-white/10">
// // //                   {pageRows.map((r) => (
// // //                     <div
// // //                       key={r.id}
// // //                       className={[
// // //                         "grid grid-cols-12 gap-3 px-5 py-5 items-center",
// // //                         r.isDeleted ? "bg-red-500/[0.04]" : "bg-white/[0.02]",
// // //                       ].join(" ")}
// // //                     >
// // //                       <div className="col-span-4 flex items-center gap-4 min-w-0">
// // //                         <img
// // //                           src={r.avatar || "https://i.pravatar.cc/80?img=12"}
// // //                           alt={r.name}
// // //                           className={[
// // //                             "h-12 w-12 rounded-full object-cover border border-white/10",
// // //                             r.isDeleted ? "opacity-50" : "",
// // //                           ].join(" ")}
// // //                         />
// // //                         <div className="min-w-0">
// // //                           <button
// // //                             onClick={() => openSellerProfile(r.id)}
// // //                             className="text-sm font-medium text-white/90 truncate hover:text-sky-400 focus:outline-none"
// // //                           >
// // //                             {r.name}
// // //                           </button>
// // //                           <div className="text-xs text-white/45 truncate">{r.email}</div>
// // //                         </div>
// // //                       </div>

// // //                       <div className="col-span-2">
// // //                         <span className={[
// // //                           "px-3 py-1.5 rounded-full text-xs font-medium border inline-flex",
// // //                           r.isDeleted
// // //                             ? "bg-red-500/15 text-red-300 border-red-500/25"
// // //                             : r.status === "Active"
// // //                             ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
// // //                             : "bg-red-500/15 text-red-200 border-red-500/25",
// // //                         ].join(" ")}>
// // //                           {r.isDeleted ? "Deleted" : r.status}
// // //                         </span>
// // //                       </div>

// // //                       <div className="col-span-2 text-sm text-white/80 font-medium">
// // //                         ₹{Number(r.volume || 0).toLocaleString()}
// // //                       </div>

// // //                       <div className="col-span-3 text-sm text-white/75">
// // //                         {formatDate(r.joined)}
// // //                       </div>

// // //                       <div className="col-span-1 flex justify-end items-center gap-3">
// // //                         {/* Block / Unblock */}
// // //                         {!r.isDeleted && (
// // //                           <button
// // //                             onClick={() => setConfirmPopup({
// // //                               type: r.status === "Active" ? "block" : "unblock",
// // //                               seller: r,
// // //                             })}
// // //                             className={[
// // //                               "text-xs font-medium",
// // //                               r.status === "Active"
// // //                                 ? "text-red-400 hover:text-red-300"
// // //                                 : "text-sky-400 hover:text-sky-300",
// // //                             ].join(" ")}
// // //                           >
// // //                             {r.status === "Active" ? "Block" : "Unblock"}
// // //                           </button>
// // //                         )}

// // //                         {/* Delete / Restore */}
// // //                         <button
// // //                           onClick={() => setConfirmPopup({
// // //                             type: r.isDeleted ? "restore" : "delete",
// // //                             seller: r,
// // //                           })}
// // //                           className={[
// // //                             "text-xs font-medium",
// // //                             r.isDeleted
// // //                               ? "text-emerald-400 hover:text-emerald-300"
// // //                               : "text-white/50 hover:text-white/80",
// // //                           ].join(" ")}
// // //                         >
// // //                           {r.isDeleted ? "Restore" : "🗑"}
// // //                         </button>
// // //                       </div>
// // //                     </div>
// // //                   ))}

// // //                   {pageRows.length === 0 && (
// // //                     <div className="p-6 text-white/60 text-sm">No sellers found.</div>
// // //                   )}
// // //                 </div>
// // //               </div>

// // //               {/* Pagination */}
// // //               <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
// // //                 <div className="text-sm text-white/60">
// // //                   Showing {total === 0 ? 0 : startIndex + 1} to {endIndex} of {total} sellers
// // //                 </div>
// // //                 <div className="flex items-center gap-2">
// // //                   <button
// // //                     disabled={safePage <= 1}
// // //                     onClick={() => setPage((p) => Math.max(1, p - 1))}
// // //                     className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40"
// // //                   >
// // //                     Previous
// // //                   </button>
// // //                   {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
// // //                     const p = i + 1;
// // //                     return (
// // //                       <button
// // //                         key={p}
// // //                         onClick={() => setPage(p)}
// // //                         className={[
// // //                           "h-9 w-9 rounded-lg border border-white/10",
// // //                           safePage === p
// // //                             ? "bg-white/15 text-white"
// // //                             : "bg-white/[0.04] hover:bg-white/[0.06] text-white/80",
// // //                         ].join(" ")}
// // //                       >
// // //                         {p}
// // //                       </button>
// // //                     );
// // //                   })}
// // //                   <button
// // //                     disabled={safePage >= totalPages}
// // //                     onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
// // //                     className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40"
// // //                   >
// // //                     Next
// // //                   </button>
// // //                 </div>
// // //                 <div className="flex items-center gap-3 justify-end">
// // //                   <div className="text-sm text-white/60">Show per page</div>
// // //                   <select
// // //                     value={pageSize}
// // //                     onChange={(e) => setPageSize(Number(e.target.value))}
// // //                     className="h-9 px-3 rounded-lg bg-black/30 border border-white/10 text-white"
// // //                   >
// // //                     {[10, 20, 50, 100].map((n) => (
// // //                       <option key={n} value={n}>{n}</option>
// // //                     ))}
// // //                   </select>
// // //                 </div>
// // //               </div>
// // //             </>
// // //           )}
// // //         </section>
// // //       </div>
// // //     </>
// // //   );
// // // };

 
// // // const ProductsView = () => {
// // //   const [query, setQuery] = useState("");
// // //   const [selectedCategory, setSelectedCategory] = useState<string>("all");
// // //   const [statusFilter, setStatusFilter] = useState<string>("all");
// // //   const [priceFilter, setPriceFilter] = useState<string>("all");
// // //   const [sortFilter, setSortFilter] = useState<string>("none");
// // //   const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
// // //   const [sellerLoading, setSellerLoading] = useState(false);
// // //   const [sellerError, setSellerError] = useState<string | null>(null);
// // //   const [sellerProducts, setSellerProducts] = useState<PromptProduct[]>([]);

// // //   // ✅ PAGINATION STATE
// // //   const [page, setPage] = useState(1);
// // //   const [pageSize] = useState(10);

// // //   // ... openSellerProfile, closeSellerProfile same rahega ...

// // //   const resetFilters = () => {
// // //     setQuery("");
// // //     setSelectedCategory("all");
// // //     setStatusFilter("all");
// // //     setPriceFilter("all");
// // //     setSortFilter("none");
// // //     setPage(1); // ✅ reset page on filter clear
// // //   };

// // //   const matchesPrice = (price: number) => {
// // //     if (priceFilter === "all") return true;
// // //     if (priceFilter === "free") return price === 0;
// // //     if (priceFilter === "paid") return price > 0;
// // //     if (priceFilter === "0-5") return price >= 0 && price <= 5;
// // //     if (priceFilter === "5-10") return price > 5 && price <= 10;
// // //     if (priceFilter === "10-20") return price > 10 && price <= 20;
// // //     if (priceFilter === "20+") return price > 20;
// // //     return true;
// // //   };

// // //   const filtered = useMemo(() => {
// // //     const q = query.trim().toLowerCase();
// // //     let list = [...products];

// // //     if (q) {
// // //       list = list.filter(
// // //         (p) =>
// // //           p.title.toLowerCase().includes(q) ||
// // //           p.uploaderName.toLowerCase().includes(q) ||
// // //           (p.category || "").toLowerCase().includes(q)
// // //       );
// // //     }
// // //     if (selectedCategory !== "all") {
// // //       const cat = selectedCategory.toLowerCase();
// // //       list = list.filter((p) => (p.category || "").toLowerCase().includes(cat));
// // //     }
// // //     if (statusFilter !== "all") {
// // //       list = list.filter((p) => p.status === statusFilter);
// // //     }
// // //     list = list.filter((p) => matchesPrice(p.price));
// // //     if (sortFilter === "price_desc") {
// // //       list.sort((a, b) => (b.price || 0) - (a.price || 0));
// // //     } else if (sortFilter === "price_asc") {
// // //       list.sort((a, b) => (a.price || 0) - (b.price || 0));
// // //     }
// // //     return list;
// // //   }, [products, query, selectedCategory, statusFilter, priceFilter, sortFilter]);

// // //   // ✅ Reset page when filters change
// // //   useEffect(() => {
// // //     setPage(1);
// // //   }, [query, selectedCategory, statusFilter, priceFilter, sortFilter]);

// // //   // ✅ PAGINATION CALCULATION
// // //   const total = filtered.length;
// // //   const totalPages = Math.max(1, Math.ceil(total / pageSize));
// // //   const safePage = Math.min(page, totalPages);
// // //   const startIndex = (safePage - 1) * pageSize;
// // //   const endIndex = Math.min(startIndex + pageSize, total);
// // //   const pageProducts = filtered.slice(startIndex, endIndex); // ✅ sirf 10


// // // const openSellerProfile = async (sellerId?: string | null) => {
// // //   if (!sellerId) return;

// // //   try {
// // //     setSellerLoading(true);
// // //     setSellerError(null);

// // //     const token = getToken();

// // //     const resSeller = await fetch(`${SELLERS_BASE}/${sellerId}`, {
// // //       headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
// // //       credentials: "include",
// // //     });
// // //     const sellerData = await resSeller.json();

// // //     if (!resSeller.ok || !sellerData?.success) {
// // //       throw new Error(sellerData?.error || "Failed to load seller profile");
// // //     }

// // //     const resPrompts = await fetch(`${PROMPTS_BASE}/by-seller/${sellerId}`, {
// // //       headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
// // //       credentials: "include",
// // //     });
// // //     const promptData = await resPrompts.json();

// // //     if (!resPrompts.ok || !promptData?.success) {
// // //       throw new Error(promptData?.error || "Failed to load seller products");
// // //     }

// // //     const s = sellerData.seller;

// // //     const derivedTotalEarnings = (promptData.prompts || []).reduce((sum: number, doc: any) => {
// // //       const price = Number(doc?.price ?? doc?.tokun_price ?? 0);

// // //       const sales = Number(
// // //         doc?.sales ??
// // //         doc?.purchases ??
// // //         doc?.totalSales ??
// // //         doc?.totalPurchases ??
// // //         doc?.salesCount ??
// // //         doc?.purchaseCount ??
// // //         doc?.orderCount ??
// // //         0
// // //       );

// // //       const revenue = Number(
// // //         doc?.revenue ??
// // //         doc?.totalRevenue ??
// // //         doc?.totalEarning ??
// // //         doc?.earnings ??
// // //         doc?.cost ??
// // //         doc?.totalCost ??
// // //         (sales * price) ??
// // //         0
// // //       );

// // //       return sum + (Number.isFinite(revenue) ? revenue : 0);
// // //     }, 0);

// // //     setSelectedSeller({
// // //       id: String(s?._id || sellerId),
// // //       name: s?.name || "Unknown",
// // //       email: s?.email,
// // //       location: s?.location,
// // //       joined: s?.joined,
// // //       status: s?.status || "ACTIVE",
// // //       avatar: s?.avatar,
// // //       verified: !!s?.verified,
// // //       totalEarnings:
// // //         typeof s?.totalEarnings === "number" && s.totalEarnings > 0
// // //           ? s.totalEarnings
// // //           : derivedTotalEarnings,
// // //       rating: s?.rating ?? 0,
// // //       reviewsCount: s?.reviewsCount ?? 0,
// // //       refundRate: s?.refundRate ?? 0,
// // //       refundThreshold: s?.refundThreshold ?? 5,
// // //     });

// // //     const mapped: PromptProduct[] = (promptData.prompts || []).map((doc: any) => {
// // //       const att = doc?.attachment || null;
// // //       const status: PromptProduct["status"] =
// // //         doc?.flagged ? "Flagged" : doc?.draft ? "Draft" : "Published";

// // //       return {
// // //         id: String(doc._id),
// // //         title: doc?.title || "Untitled",
// // //         uploaderName: doc?.userId?.name || "Unknown",
// // //         uploaderId:
// // //           doc?.userId?._id ||
// // //           doc?.uploaderId?._id ||
// // //           doc?.uploaderId ||
// // //           doc?.sellerId?._id ||
// // //           doc?.sellerId ||
// // //           null,
// // //         price: typeof doc?.price === "number" ? doc.price : 0,
// // //         status,
// // //         imageUrl: att?.type === "image" ? att?.path : undefined,
// // //         videoUrl: att?.type === "video" ? att?.path : undefined,
// // //         category: doc?.categories?.[0]?.name || "General",
// // //         exclusive: !!doc?.exclusive,
// // //         sold: !!doc?.sold,
// // //       };
// // //     });

// // //     setSellerProducts(mapped);
// // //   } catch (e: any) {
// // //     setSellerError(e?.message || "Error loading seller profile");
// // //   } finally {
// // //     setSellerLoading(false);
// // //   }
// // // };

// // // const closeSellerProfile = () => {
// // //   setSelectedSeller(null);
// // //   setSellerProducts([]);
// // //   setSellerError(null);
// // // };



// // //   if (selectedSeller) {
// // //     return (
// // //       <SellerProfileView
// // //         seller={selectedSeller}
// // //         products={sellerProducts}
// // //         loading={sellerLoading}
// // //         error={sellerError}
// // //         onBack={closeSellerProfile}
// // //       />
// // //     );
// // //   }

// // //   return (
// // //     <>
// // //       {/* Header — same rahega */}
// // //       <div className="mt-2 md:mt-0">
// // //         <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-4 md:gap-6">
// // //           <div className="text-center md:text-left w-full">
// // //             <h1 className="text-[24px] md:text-[34px] leading-[1.05] font-semibold">
// // //               Product Management
// // //             </h1>
// // //             <p className="mt-1 text-white/60 text-sm">
// // //               Manage and monitor digital products on the platform
// // //             </p>
// // //           </div>
// // //           <div className="hidden md:block" />
// // //           <div className="flex justify-center md:justify-end w-full">
// // //             <button className="h-9 sm:h-10 px-5 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90">
// // //               <Plus className="h-4 w-4" />
// // //               Add Product
// // //             </button>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* KPI — same rahega */}
// // //       <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
// // //         <div className={`${kpiCardBase} p-6`}>
// // //           <div className="text-xs tracking-[0.2em] text-white/60">TOTAL LISTING</div>
// // //           <div className="mt-4 text-3xl font-semibold">{products.length}</div>
// // //           <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
// // //             <TrendingUp className="h-4 w-4" />
// // //             Live from marketplace
// // //           </div>
// // //         </div>
// // //         <div className={`${kpiCardBase} p-6`}>
// // //           <div className="text-xs tracking-[0.2em] text-white/60">FLAGGED PRODUCT</div>
// // //           <div className="mt-4 text-3xl font-semibold">
// // //             {products.filter((p) => p.status === "Flagged").length}
// // //           </div>
// // //           <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
// // //             <TriangleAlert className="h-4 w-4" />
// // //             High Priority
// // //           </div>
// // //         </div>
// // //       </section>

// // //       {/* Search + Filters — same rahega */}
// // //       <section className={`${kpiCardBase} mt-6 p-4`}>
// // //         <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
// // //           <div className="flex-1 relative">
// // //             <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
// // //             <input
// // //               value={query}
// // //               onChange={(e) => setQuery(e.target.value)}
// // //               className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
// // //               placeholder="Search products by name, seller, category..."
// // //             />
// // //           </div>
// // //           <div className="flex flex-wrap gap-3 justify-start lg:justify-end">
// // //             <Select value={selectedCategory} onValueChange={setSelectedCategory}>
// // //               <SelectTrigger className="h-11 w-[170px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
// // //                 <SelectValue placeholder={catsLoading ? "Loading..." : "All Categories"} />
// // //               </SelectTrigger>
// // //               <SelectContent className="max-h-[280px]">
// // //                 <SelectItem value="all">All Categories</SelectItem>
// // //                 {(categories || []).map((c) => (
// // //                   <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
// // //                 ))}
// // //               </SelectContent>
// // //             </Select>

// // //             <Select value={priceFilter} onValueChange={setPriceFilter}>
// // //               <SelectTrigger className="h-11 w-[160px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
// // //                 <SelectValue placeholder="Price Range" />
// // //               </SelectTrigger>
// // //               <SelectContent className="max-h-[280px]">
// // //                 <SelectItem value="all">All Prices</SelectItem>
// // //                 <SelectItem value="free">Free</SelectItem>
// // //                 <SelectItem value="paid">Paid</SelectItem>
// // //                 <SelectItem value="0-5">₹0 - ₹5</SelectItem>
// // //                 <SelectItem value="5-10">₹5 - ₹10</SelectItem>
// // //                 <SelectItem value="10-20">₹10 - ₹20</SelectItem>
// // //                 <SelectItem value="20+">₹20+</SelectItem>
// // //               </SelectContent>
// // //             </Select>

// // //             <Select value={statusFilter} onValueChange={setStatusFilter}>
// // //               <SelectTrigger className="h-11 w-[150px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
// // //                 <SelectValue placeholder="All Status" />
// // //               </SelectTrigger>
// // //               <SelectContent className="max-h-[280px]">
// // //                 <SelectItem value="all">All Status</SelectItem>
// // //                 <SelectItem value="Published">Published</SelectItem>
// // //                 <SelectItem value="Draft">Draft</SelectItem>
// // //                 <SelectItem value="Flagged">Flagged</SelectItem>
// // //               </SelectContent>
// // //             </Select>

// // //             <Select value={sortFilter} onValueChange={setSortFilter}>
// // //               <SelectTrigger className="h-11 w-[190px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
// // //                 <SelectValue placeholder="Sort By Price" />
// // //               </SelectTrigger>
// // //               <SelectContent className="max-h-[280px]">
// // //                 <SelectItem value="none">No Sorting</SelectItem>
// // //                 <SelectItem value="price_desc">Price: High → Low</SelectItem>
// // //                 <SelectItem value="price_asc">Price: Low → High</SelectItem>
// // //               </SelectContent>
// // //             </Select>

// // //             <button
// // //               onClick={resetFilters}
// // //               className="h-11 px-4 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80 flex items-center gap-2"
// // //             >
// // //               <X className="h-4 w-4" />
// // //               Clear
// // //             </button>
// // //           </div>
// // //         </div>
// // //         {catsError && (
// // //           <div className="mt-3 text-xs text-red-400">Category load failed: {catsError}</div>
// // //         )}
// // //       </section>

// // //       {/* Loading / Error */}
// // //       {productsLoading && (
// // //         <div className="mt-6 text-white/70 text-sm">Loading products…</div>
// // //       )}
// // //       {!!productsError && !productsLoading && (
// // //         <div className="mt-6 text-red-400 text-sm">{productsError}</div>
// // //       )}

// // //       {/* ✅ Products Grid — pageProducts use karo filtered ki jagah */}
// // //       {!productsLoading && !productsError && (
// // //         <>
// // //           <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
// // //             {pageProducts.map((p) => {
// // //               const hasImage = !!p.imageUrl;
// // //               const hasVideo = !!p.videoUrl;

// // //               return (
// // //                 <div
// // //                   key={p.id}
// // //                   className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
// // //                 >
// // //                   <div className="relative h-[230px] bg-black/40">
// // //                     {hasImage ? (
// // //   <img
// // //     src={p.imageUrl}
// // //     alt={p.title}
// // //     className="absolute inset-0 w-full h-full object-cover"
// // //   />
// // // ) : hasVideo ? (
// // //   <video
// // //     src={p.videoUrl}
// // //     className="absolute inset-0 w-full h-full object-cover"
// // //     controls
// // //     muted
// // //     playsInline
// // //     preload="metadata"
// // //   />
// // // ) : (
// // //   <div className="absolute inset-0 w-full h-full flex items-center justify-center">
// // //     <div className="flex items-center gap-2 text-white/60 text-sm">
// // //       <ImageIcon className="h-5 w-5" />
// // //       No Preview
// // //     </div>
// // //   </div>
// // // )}

// // //                     <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-sky-500/15 text-sky-200 border border-sky-500/25">
// // //                       {p.status}
// // //                     </span>

// // //                     {p.exclusive && (
// // //                       <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-200 border border-emerald-500/25">
// // //                         ONE-TIME{p.sold ? " • SOLD" : ""}
// // //                       </span>
// // //                     )}
// // //                   </div>

// // //                   <div className="bg-[#111827] text-white p-4">
// // //                     <div className="text-[13px] font-semibold leading-snug truncate text-white/90">
// // //                       {p.title}
// // //                     </div>
// // //                     <div className="mt-2 text-[12px] text-white/60 truncate">
// // //                       by{" "}
// // //                     <button
// // //   type="button"
// // //   onClick={() => {
// // //     console.log("SELLER CLICK", p.uploaderId, p);
// // //     openSellerProfile(p.uploaderId);
// // //   }}
// // //   className="text-sky-300 hover:underline font-medium"
// // // >
// // //   {p.uploaderName}
// // // </button>
// // //                       {p.category ? ` • ${p.category}` : ""}
// // //                     </div>
// // //                     <div className="mt-3 flex items-center justify-between">
// // //                       <div className="text-sm font-semibold text-white">
// // //                         {p.price > 0 ? `₹${p.price.toFixed(2)}` : "FREE"}
// // //                       </div>
// // //                       <div className="text-xs text-white/45">
// // //                         ID: {p.id.slice(-6)}
// // //                       </div>
// // //                     </div>
// // //                   </div>
// // //                 </div>
// // //               );
// // //             })}

// // //             {pageProducts.length === 0 && (
// // //               <div className="col-span-full text-center text-white/70 py-10">
// // //                 No products found.
// // //               </div>
// // //             )}
// // //           </section>

// // //           {/* ✅ PAGINATION — seller wale jaisa */}
// // //           {total > 0 && (
// // //             <div className="mt-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
// // //               {/* Showing count */}
// // //               <div className="text-sm text-white/60">
// // //                 Showing {total === 0 ? 0 : startIndex + 1} to {endIndex} of {total} products
// // //               </div>

// // //               {/* Page buttons */}
// // //               <div className="flex items-center gap-2">
// // //                 <button
// // //                   disabled={safePage <= 1}
// // //                   onClick={() => setPage((p) => Math.max(1, p - 1))}
// // //                   className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40 text-sm text-white/80"
// // //                 >
// // //                   Previous
// // //                 </button>

// // //                 {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
// // //                   const p = i + 1;
// // //                   return (
// // //                     <button
// // //                       key={p}
// // //                       onClick={() => setPage(p)}
// // //                       className={[
// // //                         "h-9 w-9 rounded-lg border border-white/10 text-sm",
// // //                         safePage === p
// // //                           ? "bg-white/15 text-white"
// // //                           : "bg-white/[0.04] hover:bg-white/[0.06] text-white/80",
// // //                       ].join(" ")}
// // //                     >
// // //                       {p}
// // //                     </button>
// // //                   );
// // //                 })}

// // //                 <button
// // //                   disabled={safePage >= totalPages}
// // //                   onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
// // //                   className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40 text-sm text-white/80"
// // //                 >
// // //                   Next
// // //                 </button>
// // //               </div>

// // //               {/* Mobile: simple prev/next only */}
// // //               <div className="flex md:hidden items-center justify-between w-full">
// // //                 <button
// // //                   disabled={safePage <= 1}
// // //                   onClick={() => setPage((p) => Math.max(1, p - 1))}
// // //                   className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] disabled:opacity-40 text-sm text-white/80"
// // //                 >
// // //                   Previous
// // //                 </button>
// // //                 <span className="text-xs text-white/60">
// // //                   Page {safePage} / {totalPages}
// // //                 </span>
// // //                 <button
// // //                   disabled={safePage >= totalPages}
// // //                   onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
// // //                   className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] disabled:opacity-40 text-sm text-white/80"
// // //                 >
// // //                   Next
// // //                 </button>
// // //               </div>
// // //             </div>
// // //           )}
// // //         </>
// // //       )}
// // //     </>
// // //   );
// // // };

// // // const formatMonthYear = (dateLike?: string) => {
// // //   if (!dateLike) return "—";
// // //   const d = new Date(dateLike);
// // //   if (Number.isNaN(d.getTime())) return "—";
// // //   return d.toLocaleString("en-US", { month: "long", year: "numeric" });
// // // };



// // // const SellerProfileView = ({
// // //   seller,
// // //   products,
// // //   loading,
// // //   error,
// // //   onBack,
// // // }: {
// // //   seller: SellerProfile;
// // //   products: PromptProduct[];
// // //   loading: boolean;
// // //   error: string | null;
// // //   onBack: () => void;
// // // }) => {
// // //   return (
// // //     <>
// // //       {/* Title */}
// // //      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
// // //   <div className="text-center md:text-left">
// // //     <button
// // //       onClick={onBack}
// // //       className="text-sm text-white/60 hover:text-white/90"
// // //     >
// // //       ← Back to Products
// // //     </button>
// // //     <h1 className="mt-2 text-[24px] md:text-[34px] leading-[1.1] font-semibold">
// // //       Seller Profile
// // //     </h1>
// // //   </div>
// // // </div>

// // //       {/* Top profile card */}
// // //       <div className={`${kpiCardBase} mt-6 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5`}>
// // //         <div className="flex items-center gap-4">
// // //           <img
// // //             src={seller.avatar || "https://i.pravatar.cc/100?img=11"}
// // //             className="h-14 w-14 rounded-full object-cover border border-white/10"
// // //             alt={seller.name}
// // //           />
// // //           <div>
// // //             <div className="flex items-center gap-3">
// // //               <div className="text-xl font-semibold">{seller.name}</div>
// // //               <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-200 border border-emerald-500/25">
// // //                 {seller.status || "ACTIVE"}
// // //               </span>
// // //             </div>
// // //            <div className="mt-1 text-xs text-white/50">
// // //   Seller ID: {seller.id} • Joined: {formatMonthYear(seller.joined)} • Email: {seller.email || "—"}
// // // </div>
// // //           </div>
// // //         </div>

// // // {/* ✅ Actions: mobile = 3 equal buttons, desktop = row */}
// // // <div className="w-full lg:w-auto grid grid-cols-3 gap-3">
// // //   <button className="h-11 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm inline-flex items-center justify-center gap-2">
// // //     <MessageSquare className="h-4 w-4 text-sky-300" />
// // //     <span className="hidden sm:inline">Message</span>
// // //   </button>

// // //   <button className="h-11 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm inline-flex items-center justify-center gap-2">
// // //     <Download className="h-4 w-4 text-white/80" />
// // //     <span className="hidden sm:inline">Export</span>
// // //   </button>

// // //   <button className="h-11 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/15 text-sm inline-flex items-center justify-center gap-2 text-red-300">
// // //     <Ban className="h-4 w-4" />
// // //     <span className="hidden sm:inline">Suspend</span>
// // //   </button>
// // // </div>

// // //       </div>

// // //       {/* KPI row */}
// // //       <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
// // //         <div className={`${kpiCardBase} p-6`}>
// // //           <div className="text-xs tracking-[0.2em] text-white/60">TOTAL EARNINGS</div>
// // //           <div className="mt-4 text-3xl font-semibold">
// // //             ₹{Number(seller.totalEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
// // //           </div>
// // //           <div className="mt-3 text-sm text-emerald-400">Vs. last 30 days</div>
// // //         </div>

// // //         <div className={`${kpiCardBase} p-6`}>
// // //           <div className="text-xs tracking-[0.2em] text-white/60">CUSTOMER RATING</div>
// // //           <div className="mt-4 text-3xl font-semibold">
// // //             {seller.rating || 0}/5.0 ⭐
// // //           </div>
// // //           <div className="mt-3 text-sm text-emerald-400">
// // //             From {seller.reviewsCount || 0} reviews
// // //           </div>
// // //         </div>

// // //         <div className={`${kpiCardBase} p-6`}>
// // //           <div className="text-xs tracking-[0.2em] text-white/60">REFUND RATE</div>
// // //           <div className="mt-4 text-3xl font-semibold">{seller.refundRate || 0}%</div>
// // //           <div className="mt-3 text-sm text-sky-300">
// // //             Threshold: {seller.refundThreshold || 5}% max
// // //           </div>
// // //         </div>
// // //       </section>

// // //       {/* Products table */}
// // //       <div className={`${kpiCardBase} mt-6 p-6`}>
// // //         <div className="flex items-center justify-between">
// // //           <h2 className="text-lg font-semibold">All Products ({products.length})</h2>
// // //           <button className="text-sm text-[#3A7CFF] hover:underline">View All</button>
// // //         </div>

// // //         {loading && <div className="mt-6 text-white/70 text-sm">Loading seller data…</div>}
// // //         {!!error && !loading && <div className="mt-6 text-red-400 text-sm">{error}</div>}

// // //         {!loading && !error && (
// // //           <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
// // //             <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
// // //               <div className="col-span-4">PRODUCT</div>
// // //               <div className="col-span-3">CATEGORY</div>
// // //               <div className="col-span-2">PRICE</div>
// // //               <div className="col-span-2">SALES</div>
// // //               <div className="col-span-1 text-right">ACTIONS</div>
// // //             </div>

// // //             <div className="divide-y divide-white/10">
// // //               {products.slice(0, 4).map((p) => (
// // //                 <div key={p.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center bg-white/[0.02]">
// // //                   <div className="col-span-4">
// // //                     <div className="text-sm font-medium text-white/90">{p.title}</div>
// // //                     <div className="text-xs text-white/50">{p.status}</div>
// // //                   </div>
// // //                   <div className="col-span-3 text-sm text-white/75">{p.category || "General"}</div>
// // //                   <div className="col-span-2 text-sm text-white/75">
// // //                     {p.price > 0 ? `₹${p.price}` : "FREE"}
// // //                   </div>
// // //                   <div className="col-span-2 text-sm text-white/75">—</div>
// // //                   <div className="col-span-1 flex justify-end gap-3 text-white/70">
// // //                     <button className="hover:text-white">✎</button>
// // //                     <button className="hover:text-red-300">🗑</button>
// // //                   </div>
// // //                 </div>
// // //               ))}
// // //             </div>

// // //             <div className="p-5 flex justify-center">
// // //              <button
// // //   onClick={() => setShowAllSellers(true)}
// // //   className="text-sm text-[#3A7CFF] hover:underline"
// // // >
// // //   View All
// // // </button>


// // //             </div>
// // //           </div>
// // //         )}
// // //       </div>

// // //       {/* Bottom: activity + verification (UI only) */}
// // //       <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
// // //         <div className={`${kpiCardBase} p-6`}>
// // //           <h2 className="text-lg font-semibold">Seller Activity Log</h2>
// // //           <div className="mt-6 space-y-4">
// // //             {[
// // //               { t: "New product listing created", d: "React Dash Template was uploaded", time: "2 minutes ago" },
// // //               { t: "Payout requested", d: "Request for $1,200.00 processed", time: "1 hour ago" },
// // //               { t: "Updated “Abstract UI Kit”", d: "Modified price from $45 to $49", time: "3 hours ago" },
// // //               { t: "Policy update", d: "Updated Terms of Service sent to sellers", time: "Yesterday" },
// // //             ].map((a, idx) => (
// // //               <div key={idx} className="flex gap-4">
// // //                 <div className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.04]" />
// // //                 <div>
// // //                   <div className="text-sm font-medium text-white/90">{a.t}</div>
// // //                   <div className="text-xs text-white/55 mt-1">{a.d}</div>
// // //                   <div className="text-[11px] text-white/40 mt-1">{a.time}</div>
// // //                 </div>
// // //               </div>
// // //             ))}
// // //           </div>

// // //           <button className="mt-6 w-full h-10 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80">
// // //             View Full History
// // //           </button>
// // //         </div>

// // //         <div className={`${kpiCardBase} p-6`}>
// // //           <div className="flex items-center justify-between">
// // //             <h2 className="text-lg font-semibold">Identity Verification</h2>
// // //             <span className="text-xs text-emerald-300">VERIFIED</span>
// // //           </div>

// // //           <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] h-[220px] flex items-center justify-center text-white/60">
// // //             View Document
// // //           </div>

// // //           <div className="mt-4 flex items-center justify-between">
// // //             <div className="text-sm text-white/80">Tax Compliance Doc</div>
// // //             <span className="text-xs text-emerald-300">VERIFIED</span>
// // //           </div>

// // //           <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 flex items-center justify-between">
// // //             <div className="text-sm text-white/70">Tax_Form_2023.pdf</div>
// // //             <button className="text-white/70 hover:text-white">⬇</button>
// // //           </div>

// // //           <div className="mt-4 flex gap-3">
// // //             <button className="flex-1 h-10 rounded-xl bg-red-500/15 text-red-200 border border-red-500/25 hover:bg-red-500/20 text-sm font-medium">
// // //               Reject Verification
// // //             </button>
// // //             <button className="flex-1 h-10 rounded-xl bg-[#1677FF] hover:opacity-90 text-sm font-medium">
// // //               Approve Docs
// // //             </button>
// // //           </div>
// // //         </div>
// // //       </section>
// // //     </>
// // //   );
// // // };

// // // const AccountView = ({
// // //   adminName,
// // //   adminEmail,
// // //   totalMembers,
// // //   activeToday,
// // //   pendingInvite,
// // // }: {
// // //   adminName: string;
// // //   adminEmail: string;
// // //   totalMembers: number;
// // //   activeToday: number;
// // //   pendingInvite: number;
// // // }) => {
// // //   const [currentPassword, setCurrentPassword] = useState("");
// // //   const [newPassword, setNewPassword] = useState("");
// // //   const [confirmNewPassword, setConfirmNewPassword] = useState("");

// // //   const teamRows = [
// // //     { name: "Abstract UI Kit", status: "Live Listing", role: "Super admin", lastActive: "Online Now" },
// // //     { name: "3D Icon Set v2", status: "Live Listing", role: "Moderator", lastActive: "15 min ago" },
// // //     { name: "React Dash Template", status: "Draft", role: "Support", lastActive: "Yesterday" },
// // //     { name: "Motion Backgrounds", status: "Live Listing", role: "Admin", lastActive: "3 days ago" },
// // //   ];

// // //   return (
// // //     <>
// // //       {/* Title */}
// // //       <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
// // //   <div className="text-center md:text-left">
// // //     <h1 className="text-[24px] md:text-[34px] leading-[1.1] font-semibold">
// // //       Admin Profile
// // //     </h1>
// // //     <p className="mt-2 text-white/60 text-sm">
// // //       Manage your account and security settings
// // //     </p>
// // //   </div>
// // // </div>

// // //       {/* Profile Card */}
// // //       <section className={`${kpiCardBase} mt-8 p-6`}>
// // //         <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
// // //           <div className="flex items-center gap-4">
// // //             <img
// // //               src={"https://i.pravatar.cc/120?img=12"}
// // //               alt={adminName}
// // //               className="h-16 w-16 rounded-full object-cover border border-white/10"
// // //             />
// // //             <div>
// // //               <div className="text-xl font-semibold">{adminName}</div>
// // //               <div className="text-sm text-white/50">Super Admin</div>
// // //             </div>
// // //           </div>

// // //           <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
// // //             <div>
// // //               <label className="text-xs text-white/60">Full name</label>
// // //               <input
// // //                 value={adminName}
// // //                 readOnly
// // //                 className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
// // //               />
// // //             </div>

// // //             <div>
// // //               <label className="text-xs text-white/60">Email address</label>
// // //               <input
// // //                 value={adminEmail || "—"}
// // //                 readOnly
// // //                 className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
// // //               />
// // //             </div>

// // //             <div>
// // //               <label className="text-xs text-white/60">Role</label>
// // //               <input
// // //                 value={"Super Admin"}
// // //                 readOnly
// // //                 className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/50"
// // //               />
// // //             </div>

// // //             <div>
// // //               <label className="text-xs text-white/60">Timezone</label>
// // //               <input
// // //                 value={"Asia/Kolkata"}
// // //                 readOnly
// // //                 className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
// // //               />
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </section>

// // //       {/* Security Management */}
// // //       <section className={`${kpiCardBase} mt-6 p-6`}>
// // //         <h2 className="text-lg font-semibold">Security Management</h2>

// // //         <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5 items-end">
// // //           <div>
// // //             <label className="text-xs text-white/60">Current Password</label>
// // //             <input
// // //               type="password"
// // //               value={currentPassword}
// // //               onChange={(e) => setCurrentPassword(e.target.value)}
// // //               className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
// // //             />
// // //           </div>

// // //           <div>
// // //             <label className="text-xs text-white/60">New Password</label>
// // //             <input
// // //               type="password"
// // //               value={newPassword}
// // //               onChange={(e) => setNewPassword(e.target.value)}
// // //               className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
// // //             />
// // //           </div>

// // //           <div>
// // //             <label className="text-xs text-white/60">Confirm new password</label>
// // //             <input
// // //               type="password"
// // //               value={confirmNewPassword}
// // //               onChange={(e) => setConfirmNewPassword(e.target.value)}
// // //               className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
// // //             />
// // //           </div>

// // //           <div className="flex justify-start lg:justify-end">
// // //             <button
// // //               type="button"
// // //               onClick={() => {
// // //                 // TODO: call your update password API
// // //                 console.log("update password");
// // //               }}
// // //               className="h-11 px-6 rounded-xl bg-[#1677FF] hover:opacity-90 text-sm font-medium"
// // //             >
// // //               Update password
// // //             </button>
// // //           </div>
// // //         </div>
// // //       </section>

// // //       {/* KPI Cards */}
// // //       <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
// // //         <div className={`${kpiCardBase} p-6`}>
// // //           <div className="text-xs tracking-[0.2em] text-white/60">TOTAL MEMBER</div>
// // //           <div className="mt-4 text-3xl font-semibold">{totalMembers}</div>
// // //         </div>

// // //         <div className={`${kpiCardBase} p-6`}>
// // //           <div className="text-xs tracking-[0.2em] text-white/60">ACTIVE TODAY</div>
// // //           <div className="mt-4 text-3xl font-semibold">{activeToday}</div>
// // //         </div>

// // //         <div className={`${kpiCardBase} p-6`}>
// // //           <div className="text-xs tracking-[0.2em] text-white/60">PENDING INVITE</div>
// // //           <div className="mt-4 text-3xl font-semibold">{pendingInvite}</div>
// // //         </div>
// // //       </section>

// // //       {/* Team Members Management */}
// // //       <section className={`${kpiCardBase} mt-6 p-6`}>
// // //         <h2 className="text-lg font-semibold">Team Members Management</h2>

// // //         <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
// // //           <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
// // //             <div className="col-span-5">MEMBERS</div>
// // //             <div className="col-span-3">ROLE</div>
// // //             <div className="col-span-3">LAST ACTIVE</div>
// // //             <div className="col-span-1 text-right">ACTIONS</div>
// // //           </div>

// // //           <div className="divide-y divide-white/10">
// // //             {teamRows.map((m, idx) => (
// // //               <div key={idx} className="grid grid-cols-12 gap-3 px-5 py-4 items-center bg-white/[0.02]">
// // //                 <div className="col-span-5 flex items-center gap-3 min-w-0">
// // //                   <div className="h-10 w-10 rounded-full bg-white/10 border border-white/10" />
// // //                   <div className="min-w-0">
// // //                     <div className="text-sm font-medium text-white/90 truncate">{m.name}</div>
// // //                     <div className="text-xs text-white/45 truncate">{m.status}</div>
// // //                   </div>
// // //                 </div>

// // //                 <div className="col-span-3">
// // //                   <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/15 text-emerald-200 border border-emerald-500/25">
// // //                     {m.role}
// // //                   </span>
// // //                 </div>

// // //                 <div className="col-span-3 text-sm text-white/70">
// // //                   {m.lastActive === "Online Now" ? (
// // //                     <span className="inline-flex items-center gap-2">
// // //                       <span className="h-2 w-2 rounded-full bg-emerald-400" />
// // //                       Online Now
// // //                     </span>
// // //                   ) : (
// // //                     m.lastActive
// // //                   )}
// // //                 </div>

// // //                 <div className="col-span-1 flex justify-end gap-3 text-white/70">
// // //                   <button className="hover:text-white" title="Edit">✎</button>
// // //                   <button className="hover:text-red-300" title="Delete">🗑</button>
// // //                 </div>
// // //               </div>
// // //             ))}
// // //           </div>
// // //         </div>

// // //         <div className="mt-5 text-xs text-white/45">Showing 1 to {teamRows.length} of {teamRows.length} members</div>
// // //       </section>
// // //     </>
// // //   );
// // // };





// // //   return (
// // //     <div className="min-h-screen w-full bg-[#07080B] text-white font-inter">
// // //       {/* Top Nav */}
// // //       <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07080B]/80 backdrop-blur">
// // //         <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
// // //           <div className="h-[74px] flex items-center">


            
// // //             {/* LEFT: Brand */}
// // //             <div className="flex items-center">
// // //               <div className="text-white font-semibold tracking-wide">
// // //                 Tokun Admin
// // //               </div>
// // //             </div>

// // //             {/* CENTER: Nav */}
// // //             <div className="hidden md:flex flex-1 justify-center">
// // //               <nav className="flex items-center gap-2">
// // //                 <NavItem
// // //                   id="dashboard"
// // //                   label="Dashboard"
// // //                   icon={<LayoutDashboard className="h-4 w-4" />}
// // //                 />
// // //                 <NavItem
// // //                   id="sellers"
// // //                   label="Sellers"
// // //                   icon={<Store className="h-4 w-4" />}
// // //                 />
// // //                 <NavItem
// // //                   id="products"
// // //                   label="Products"
// // //                   icon={<Package className="h-4 w-4" />}
// // //                 />
// // //                 <NavItem
// // //                   id="analytics"
// // //                   label="Analytics"
// // //                   icon={<LineChart className="h-4 w-4" />}
// // //                 />

// // //                 <NavItem id="reports" label="Reports" icon={<ShieldAlert className="h-4 w-4" />} />

// // //               </nav>
// // //             </div>

            

// // //             {/* RIGHT: Actions */}
// // //             <div className="flex items-center gap-3 ml-auto">
// // //               <button
// // //                 className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] flex items-center justify-center"
// // //                 aria-label="Notifications"
// // //               >
// // //                 <Bell className="h-5 w-5 text-white/80" />
// // //               </button>

// // //           <DropdownMenu>
// // //   <DropdownMenuTrigger asChild>
// // //     <button className="h-10 px-4 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] flex items-center gap-2">
// // //       <span className="text-sm text-white/80">Hello, {adminName}</span>
// // //       <ChevronDown className="h-4 w-4 text-white/70" />
// // //     </button>
// // //   </DropdownMenuTrigger>

// // //   <DropdownMenuContent
// // //     align="end"
// // //     className="w-44 rounded-xl border border-white/10 bg-[#0B0D12] text-white shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
// // //   >
// // //     <DropdownMenuItem
// // //       onClick={() => setActive("account")}
// // //       className="cursor-pointer focus:bg-white/[0.06]"
// // //     >
// // //       Account
// // //     </DropdownMenuItem>

// // //     <DropdownMenuSeparator className="bg-white/10" />

// // //     {/* Optional (if you want later)
// // //     <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
// // //     */}
// // //   </DropdownMenuContent>
// // // </DropdownMenu>


// // //             </div>
// // //           </div>
// // //         </div>
// // //       </header>

// // //       {/* Body */}
 
// // // {/* Body */}
// // // <div className="w-full">
// // //   <div className="flex w-full">
// // //     {/* ✅ LEFT: Always-visible Reports Sidebar */}
// // //   {/* ✅ LEFT: Reports Sidebar (DESKTOP ONLY) */}
// // // <div className="hidden md:block w-[380px] shrink-0 pl-5 sm:pl-6 pr-4 py-10">
// // //   <div className="sticky top-[90px] h-[calc(100vh-110px)]">
// // //     <ReportsSidebar />
// // //   </div>
// // // </div>


// // //     {/* ✅ RIGHT: Pages (never broken by sidebar) */}
// // // <main className="flex-1 min-w-0 py-10 px-5 sm:px-6 md:pl-0 md:pr-5 lg:pr-6 pb-24 md:pb-10">

// // //    <div className={active === "reports" ? "w-full" : "mx-auto max-w-[1200px]"}>


// // //               {active === "dashboard" && currentView === "seller" && (
// // //   <>
// // //     {/* Title Row */}
  
// // //    {/* Title Row */}
// // // {/* ✅ Dashboard Header (Desktop aligned like your screenshot) */}
 
// // // <div className="mt-2 md:mt-0">
// // //   <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-3 md:gap-6">
// // //     {/* LEFT: Title */}
// // //     <div className="text-center md:text-left w-full">
// // //       <h1 className="text-[24px] md:text-[34px] leading-[1.05] font-semibold">
// // //         Dashboard
// // //       </h1>
// // //       <p className="mt-1 text-white/60 text-sm">Admin Overview</p>
// // //     </div>

// // //     {/* CENTER: Seller/User pills */}
// // //     <div className="flex justify-center w-full">
// // //       <div className="flex flex-row items-center justify-center gap-2">
// // //         <button
// // //           onClick={() => setCurrentView("seller")}
// // //           className={[
// // //             "h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2",
// // //             currentView === "seller"
// // //               ? "bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
// // //               : "bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]",
// // //           ].join(" ")}
// // //         >
// // //           <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
// // //           Seller
// // //         </button>

// // //         <button
// // //           onClick={() => setCurrentView("user")}
// // //           className={[
// // //             "h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2",
// // //             currentView === "user"
// // //               ? "bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
// // //               : "bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]",
// // //           ].join(" ")}
// // //         >
// // //           <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
// // //           User
// // //         </button>
// // //       </div>
// // //     </div>

// // //     {/* RIGHT: Add Member */}
// // //     <div className="flex justify-center md:justify-end w-full">
// // //       <button className="h-9 sm:h-10 px-5 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90">
// // //         <Plus className="h-4 w-4" />
// // //         Add Member
// // //       </button>
// // //     </div>
// // //   </div>
// // // </div>





// // //     {/* KPI Cards */}
// // //     <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
// // //       <div className={`${kpiCardBase} p-6`}>
// // //         <div className="text-xs tracking-[0.2em] text-white/60">
// // //           TOTAL REVENUE
// // //         </div>
// // //         <div className="mt-4 flex items-end justify-between">
// // //           {/* TOTAL REVENUE */}
// // // <div className="text-3xl font-semibold">
// // //   ${stats.totalRevenue.toLocaleString()}
// // // </div>

// // // {/* ACTIVE SELLERS (now total sellers) */}
// // // {/* <div className="text-3xl font-semibold">
// // //   {stats.totalSellers}
// // // </div> */}
// // //           <div className="text-sm text-emerald-400 font-medium">
// // //             +12%
// // //           </div>
// // //         </div>
// // //       </div>

// // //       <div className={`${kpiCardBase} p-6`}>
// // //         <div className="text-xs tracking-[0.2em] text-white/60">
// // //           ACTIVE SELLERS
// // //         </div>
// // //         <div className="mt-4 flex items-end justify-between">
// // //           {/* ACTIVE SELLERS (now total sellers) */}
// // // <div className="text-3xl font-semibold">
// // //   {stats.totalSellers}
// // // </div>
// // //           <div className="text-sm text-emerald-400 font-medium">
// // //             +5%
// // //           </div>
// // //         </div>
// // //       </div>

// // //       <div className={`${kpiCardBase} p-6`}>
// // //         <div className="text-xs tracking-[0.2em] text-white/60">
// // //           PENDING APPROVALS
// // //         </div>
// // //         <div className="mt-4 flex items-end justify-between">
// // //         <div className="text-3xl font-semibold">{pendingApprovals}</div>
// // //           <div className="text-sm text-fuchsia-300 font-medium">
// // //             New submissions
// // //           </div>
// // //         </div>
// // //       </div>

// // //       <div className={`${kpiCardBase} p-6`}>
// // //         <div className="text-xs tracking-[0.2em] text-white/60">
// // //           DIGITAL PRODUCTS
// // //         </div>
// // //         <div className="mt-4 flex items-end justify-between">
// // //           <div className="text-3xl font-semibold">
// // //             {products.length || 0}
// // //           </div>
// // //           <div className="text-sm text-emerald-400 font-medium">
// // //             Live count
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </section>

// // //     {/* Chart + Activities */}
// // //     <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
// // //       {/* Chart */}
// // //       <div className={`${kpiCardBase} p-6 lg:col-span-2`}>
// // //         <div className="flex items-start justify-between gap-4">
// // //           <div>
// // //             <h2 className="text-lg font-semibold">
// // //               Sales Trends Over Time
// // //             </h2>
// // //             <p className="mt-1 text-sm text-white/55">
// // //               Subtitle: Monthly revenue growth and projection
// // //             </p>
// // //           </div>
// // //           <div className="text-xs text-white/60 mt-1">Last 30 Days</div>
// // //         </div>

// // //         <div className="mt-6 h-[310px] w-full">
// // //           <ResponsiveContainer width="100%" height="100%">
// // //             <AreaChart
// // //               data={chartData}
// // //               margin={{ top: 10, right: 8, left: -12, bottom: 0 }}
// // //             >
// // //               <defs>
// // //                 <linearGradient
// // //                   id="blueFill"
// // //                   x1="0"
// // //                   y1="0"
// // //                   x2="0"
// // //                   y2="1"
// // //                 >
// // //                   <stop
// // //                     offset="0%"
// // //                     stopColor="#2AA8FF"
// // //                     stopOpacity={0.35}
// // //                   />
// // //                   <stop
// // //                     offset="100%"
// // //                     stopColor="#2AA8FF"
// // //                     stopOpacity={0.02}
// // //                   />
// // //                 </linearGradient>
// // //                 <linearGradient
// // //                   id="greenFill"
// // //                   x1="0"
// // //                   y1="0"
// // //                   x2="0"
// // //                   y2="1"
// // //                 >
// // //                   <stop
// // //                     offset="0%"
// // //                     stopColor="#84CC16"
// // //                     stopOpacity={0.28}
// // //                   />
// // //                   <stop
// // //                     offset="100%"
// // //                     stopColor="#84CC16"
// // //                     stopOpacity={0.02}
// // //                   />
// // //                 </linearGradient>
// // //               </defs>

// // //               <CartesianGrid
// // //                 stroke="rgba(255,255,255,0.08)"
// // //                 vertical={false}
// // //               />
// // //               <XAxis
// // //                 dataKey="name"
// // //                 tick={{
// // //                   fill: "rgba(255,255,255,0.55)",
// // //                   fontSize: 12,
// // //                 }}
// // //                 axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
// // //                 tickLine={false}
// // //               />
// // //               <YAxis
// // //                 tick={{
// // //                   fill: "rgba(255,255,255,0.45)",
// // //                   fontSize: 12,
// // //                 }}
// // //                 axisLine={false}
// // //                 tickLine={false}
// // //               />
// // //               <Tooltip
// // //                 contentStyle={{
// // //                   background: "rgba(10,12,16,0.95)",
// // //                   border: "1px solid rgba(255,255,255,0.12)",
// // //                   borderRadius: 12,
// // //                   color: "white",
// // //                 }}
// // //                 labelStyle={{ color: "rgba(255,255,255,0.75)" }}
// // //               />

// // //               <Area
// // //                 type="monotone"
// // //                 dataKey="green"
// // //                 stroke="#84CC16"
// // //                 strokeWidth={2}
// // //                 fill="url(#greenFill)"
// // //                 dot={false}
// // //                 activeDot={{ r: 4 }}
// // //               />
// // //               <Area
// // //                 type="monotone"
// // //                 dataKey="blue"
// // //                 stroke="#2AA8FF"
// // //                 strokeWidth={2}
// // //                 fill="url(#blueFill)"
// // //                 dot={false}
// // //                 activeDot={{ r: 4 }}
// // //               />
// // //             </AreaChart>
// // //           </ResponsiveContainer>
// // //         </div>
// // //       </div>

// // //       {/* Recent Activities */}
// // //      {/* Recent Activities — SELLER VIEW */}
// // // <div className={`${kpiCardBase} p-6`}>
// // //   <h2 className="text-lg font-semibold">Recent Activities</h2>

// // //   <div className="mt-6 space-y-4">
// // //     {activitiesLoading && (
// // //       <div className="text-white/70 text-sm">Loading activities…</div>
// // //     )}

// // //     {!!activitiesError && !activitiesLoading && (
// // //       <div className="text-red-400 text-sm">{activitiesError}</div>
// // //     )}

// // //   {!activitiesLoading && !activitiesError && recentActivitiesPreview.length === 0 && (
// // //   <div className="text-white/60 text-sm">No recent activity found.</div>
// // // )}

// // // {!activitiesLoading && !activitiesError && recentActivitiesPreview.map((a) => {
// // //       const meta = activityMeta(a.type);
// // //       return (
// // //         <div key={a.id} className="flex gap-4">
// // //           <div className={[
// // //             "h-9 w-9 rounded-full border flex items-center justify-center shrink-0",
// // //             meta.iconBg,
// // //           ].join(" ")}>
// // //             {meta.icon}
// // //           </div>
// // //           <div className="min-w-0 flex-1">
// // //             <div className="text-sm font-medium text-white/90">{a.title}</div>
// // //             {a.desc && (
// // //               <div className="text-xs text-white/55 mt-1 truncate">{a.desc}</div>
// // //             )}
// // //             <div className="text-[11px] text-white/40 mt-1">
// // //               {timeAgo(a.createdAt)}
// // //             </div>
// // //           </div>
// // //         </div>
// // //       );
// // //     })}
// // //   </div>
// // // <button
// // //   onClick={() => setShowAllActivities(true)}
// // //   className="mt-6 w-full h-10 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80"
// // // >
// // //   View Activity Log
// // // </button>
  
// // // </div>
// // //     </section>
// // //     {/* ✅ Sellers List (Dashboard → Seller toggle) — same look as SellersView table */}
// // // <section className={`${kpiCardBase} mt-6 p-6`}>
// // //   <div className="flex items-center justify-between">
// // //     <div>
// // //       <h2 className="text-lg font-semibold">Sellers List</h2>
// // //       <p className="mt-1 text-sm text-white/55">
// // //         A quick snapshot of sellers (same table styling as Seller Management)
// // //       </p>
// // //     </div>

// // //     <button
// // //       onClick={() => setShowAllSellers(true)}
// // //       className="text-sm text-[#3A7CFF] hover:underline"
// // //     >
// // //       View All
// // //     </button>
// // //   </div>

// // //   <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
// // //     {/* Desktop header only */}
// // //     <div className="hidden md:grid md:grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
// // //   <div className="md:col-span-4">Seller</div>

// // //   <div className="md:col-span-2">Volume</div>
// // //   <div className="md:col-span-2">Status</div>
// // //   <div className="md:col-span-1 text-right">Actions</div>
// // // </div>

// // //     <div className="divide-y divide-white/10">
// // //       {sellersLoading && (
// // //         <div className="p-6 text-white/70 text-sm">Loading sellers…</div>
// // //       )}

// // //       {!!sellersError && !sellersLoading && (
// // //         <div className="p-6 text-red-400 text-sm">{sellersError}</div>
// // //       )}

// // //       {!sellersLoading && !sellersError && (
// // //         <>
// // //         {(sellerRows || []).slice(0, 10).map((r) => (
// // //   <div key={r.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-5 py-5 bg-white/[0.02]">
// // //     {/* Seller */}
// // //     <div className="md:col-span-4 flex items-center gap-3 min-w-0">
// // //       <img
// // //         src={r.avatar || "https://i.pravatar.cc/80?img=12"}
// // //         alt={r.name}
// // //         className="h-10 w-10 rounded-full object-cover border border-white/10 shrink-0"
// // //       />
// // //       <div className="min-w-0">
// // //         <div className="text-sm font-medium text-white/90 truncate">{r.name}</div>
// // //         <div className="text-xs text-white/45 truncate">{r.email}</div>
// // //       </div>
// // //     </div>

// // //     {/* Category */}
// // //     {/* <div className="md:col-span-3 text-sm text-white/75 flex items-center">
// // //       {r.category || "Digital Art"}
// // //     </div> */}

// // //     {/* Volume */}
// // //     <div className="md:col-span-2 text-sm text-white/80 font-medium flex items-center">
// // //       ${Number(r.volume || 12400).toLocaleString()}
// // //     </div>

// // //     {/* Status */}
// // //     <div className="md:col-span-2 flex items-center">
// // //       <span className={[
// // //         "px-4 py-1.5 rounded-full text-xs font-medium border inline-flex",
// // //         r.status === "Active"
// // //           ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
// // //           : "bg-red-500/15 text-red-200 border-red-500/25",
// // //       ].join(" ")}>
// // //         {r.status}
// // //       </span>
// // //     </div>

// // //     {/* Actions */}
// // //     <div className="md:col-span-1 flex items-center justify-end gap-2">
// // //       <button
// // //         className="text-xs text-red-400 hover:text-red-300"
// // //         onClick={() => console.log("block", r.id)}
// // //       >
// // //         Block
// // //       </button>
// // //       <button
// // //         className="text-white/50 hover:text-white/80"
// // //         onClick={() => console.log("delete", r.id)}
// // //       >
// // //         🗑
// // //       </button>
// // //     </div>
// // //   </div>
// // // ))}

// // //           {(sellerRows || []).length === 0 && (
// // //             <div className="p-6 text-white/60 text-sm">No sellers found.</div>
// // //           )}
// // //         </>
// // //       )}
// // //     </div>
// // //   </div>

// // //   {!sellersLoading && !sellersError && (sellerRows || []).length > 0 && (
// // //     <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
// // //       <div className="text-sm text-white/60">
// // //         Showing 1 to {Math.min(10, sellerRows.length)} of {sellerRows.length} sellers
// // //       </div>

// // //       <button
// // //         onClick={() => setShowAllSellers(true)}
// // //         className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm text-white/80"
// // //       >
// // //         View All
// // //       </button>
// // //     </div>
// // //   )}
// // // </section>
  
// // //   </>
// // // )}


// // //  {active === "dashboard" && currentView === "user" && (
// // //   <>
 

// // // <div className="mt-2 md:mt-0">
// // //   <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-3 md:gap-6">
// // //     {/* LEFT: Title */}
// // //     <div className="text-center md:text-left w-full">
// // //       <h1 className="text-[24px] md:text-[34px] leading-[1.05] font-semibold">
// // //         Dashboard
// // //       </h1>
// // //       <p className="mt-1 text-white/60 text-sm">Admin Overview</p>
// // //     </div>

// // //     {/* CENTER: Seller/User pills */}
// // //     <div className="flex justify-center w-full">
// // //       <div className="flex flex-row items-center justify-center gap-2">
// // //         <button
// // //           onClick={() => setCurrentView("seller")}
// // //           className={[
// // //             "h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2",
// // //             currentView === "seller"
// // //               ? "bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
// // //               : "bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]",
// // //           ].join(" ")}
// // //         >
// // //           <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
// // //           Seller
// // //         </button>

// // //         <button
// // //           onClick={() => setCurrentView("user")}
// // //           className={[
// // //             "h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2",
// // //             currentView === "user"
// // //               ? "bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
// // //               : "bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]",
// // //           ].join(" ")}
// // //         >
// // //           <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
// // //           User
// // //         </button>
// // //       </div>
// // //     </div>

// // //     {/* RIGHT: Add Member */}
// // //     <div className="flex justify-center md:justify-end w-full">
// // //       <button className="h-9 sm:h-10 px-5 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90">
// // //         <Plus className="h-4 w-4" />
// // //         Add Member
// // //       </button>
// // //     </div>
// // //   </div>
// // // </div>



// // //     {/* Add Member Button */}

     

// // //     {/* KPI Cards */}
// // //     <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
// // //      <div className={`${kpiCardBase} p-6`}>
// // //   <div className="text-xs tracking-[0.2em] text-white/60">
// // //     TOTAL USERS
// // //   </div>

// // //   <div className="mt-4 flex items-end justify-between">
// // //     <div className="text-3xl font-semibold">
// // //       {userTotal.toLocaleString()}
// // //     </div>

// // //     <div className="text-sm text-emerald-400 font-medium">
// // //       +12%
// // //     </div>
// // //   </div>
// // // </div>


// // //       <div className={`${kpiCardBase} p-6`}>
// // //         <div className="text-xs tracking-[0.2em] text-white/60">
// // //           ACTIVE USERS
// // //         </div>
// // //         <div className="mt-4 flex items-end justify-between">
// // //         <div className="text-3xl font-semibold">{activeUsersCount}</div>

// // //           <div className="text-sm text-emerald-400 font-medium">
// // //             +5%
// // //           </div>
// // //         </div>
// // //       </div>

// // //       <div className={`${kpiCardBase} p-6`}>
// // //         <div className="text-xs tracking-[0.2em] text-white/60">
// // //           PENDING APPROVALS
// // //         </div>
// // //         <div className="mt-4 flex items-end justify-between">
// // //      <div className="text-3xl font-semibold">{pendingApprovals}</div>
// // //           <div className="text-sm text-fuchsia-300 font-medium">
// // //             New submissions
// // //           </div>
// // //         </div>
// // //       </div>

// // //       <div className={`${kpiCardBase} p-6`}>
// // //         <div className="text-xs tracking-[0.2em] text-white/60">
// // //           DIGITAL PRODUCTS
// // //         </div>
// // //         <div className="mt-4 flex items-end justify-between">
// // //           <div className="text-3xl font-semibold">
// // //             {products.length || 0}
// // //           </div>
// // //           <div className="text-sm text-emerald-400 font-medium">
// // //             Live count
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </section>

// // //     {/* Chart + Activities */}
// // //     <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
// // //       {/* Chart */}
// // //       <div className={`${kpiCardBase} p-6 lg:col-span-2`}>
// // //         <div className="flex items-start justify-between gap-4">
// // //           <div>
// // //             <h2 className="text-lg font-semibold">
// // //               Sales Trends Over Time
// // //             </h2>
// // //             <p className="mt-1 text-sm text-white/55">
// // //               Subtitle: Monthly revenue growth and projection
// // //             </p>
// // //           </div>
// // //           <div className="text-xs text-white/60 mt-1">Last 30 Days</div>
// // //         </div>

// // //         <div className="mt-6 h-[310px] w-full">
// // //           <ResponsiveContainer width="100%" height="100%">
// // //             <AreaChart
// // //               data={chartData}
// // //               margin={{ top: 10, right: 8, left: -12, bottom: 0 }}
// // //             >
// // //               <defs>
// // //                 <linearGradient id="blueFill" x1="0" y1="0" x2="0" y2="1">
// // //                   <stop offset="0%" stopColor="#2AA8FF" stopOpacity={0.35} />
// // //                   <stop offset="100%" stopColor="#2AA8FF" stopOpacity={0.02} />
// // //                 </linearGradient>
// // //                 <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
// // //                   <stop offset="0%" stopColor="#84CC16" stopOpacity={0.28} />
// // //                   <stop offset="100%" stopColor="#84CC16" stopOpacity={0.02} />
// // //                 </linearGradient>
// // //               </defs>

// // //               <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
// // //               <XAxis
// // //                 dataKey="name"
// // //                 tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
// // //                 axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
// // //                 tickLine={false}
// // //               />
// // //               <YAxis
// // //                 tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
// // //                 axisLine={false}
// // //                 tickLine={false}
// // //               />
// // //               <Tooltip
// // //                 contentStyle={{
// // //                   background: "rgba(10,12,16,0.95)",
// // //                   border: "1px solid rgba(255,255,255,0.12)",
// // //                   borderRadius: 12,
// // //                   color: "white",
// // //                 }}
// // //                 labelStyle={{ color: "rgba(255,255,255,0.75)" }}
// // //               />

// // //               <Area
// // //                 type="monotone"
// // //                 dataKey="green"
// // //                 stroke="#84CC16"
// // //                 strokeWidth={2}
// // //                 fill="url(#greenFill)"
// // //                 dot={false}
// // //                 activeDot={{ r: 4 }}
// // //               />
// // //               <Area
// // //                 type="monotone"
// // //                 dataKey="blue"
// // //                 stroke="#2AA8FF"
// // //                 strokeWidth={2}
// // //                 fill="url(#blueFill)"
// // //                 dot={false}
// // //                 activeDot={{ r: 4 }}
// // //               />
// // //             </AreaChart>
// // //           </ResponsiveContainer>
// // //         </div>
// // //       </div>

// // //       {/* Recent Activities */}
// // //       {/* Recent Activities — USER VIEW mein ye section fix karo */}
// // // <div className={`${kpiCardBase} p-6`}>
// // //   <h2 className="text-lg font-semibold">Recent Activities</h2>

// // //   <div className="mt-6 space-y-4">
// // //     {activitiesLoading && (
// // //       <div className="text-white/70 text-sm">Loading activities…</div>
// // //     )}

// // //     {!!activitiesError && !activitiesLoading && (
// // //       <div className="text-red-400 text-sm">{activitiesError}</div>
// // //     )}

// // //   {!activitiesLoading && !activitiesError && recentActivitiesPreview.length === 0 && (
// // //   <div className="text-white/60 text-sm">No recent activity found.</div>
// // // )}

// // // {!activitiesLoading && !activitiesError && recentActivitiesPreview.map((a) => {
// // //         const meta = activityMeta(a.type);
// // //         return (
// // //           <div key={a.id} className="flex gap-4">
// // //             <div
// // //               className={[
// // //                 "h-9 w-9 rounded-full border flex items-center justify-center shrink-0",
// // //                 meta.iconBg,
// // //               ].join(" ")}
// // //             >
// // //               {meta.icon}
// // //             </div>
// // //             <div className="min-w-0 flex-1">
// // //               <div className="text-sm font-medium text-white/90">{a.title}</div>
// // //               {a.desc && (
// // //                 <div className="text-xs text-white/55 mt-1 truncate">{a.desc}</div>
// // //               )}
// // //               <div className="text-[11px] text-white/40 mt-1">
// // //                 {timeAgo(a.createdAt)}
// // //               </div>
// // //             </div>
// // //           </div>
// // //         );
// // //       })}
// // //   </div>

// // //  <button
// // //   onClick={() => setShowAllActivities(true)}
// // //   className="mt-6 w-full h-10 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80"
// // // >
// // //   View Activity Log
// // // </button>
// // // </div>
// // //     </section>

// // // {/* Users Table */}
// // // <section className={`${kpiCardBase} mt-6 p-6`}>
// // //   <div className="flex items-center justify-between gap-3">
// // //     <div>
// // //       <h2 className="text-lg font-semibold">Users List</h2>
// // //     </div>
// // //     <button
// // //       onClick={() => setShowAllUsers(true)}
// // //       className="shrink-0 text-sm text-[#3A7CFF] hover:underline"
// // //     >
// // //       View All
// // //     </button>
// // //   </div>

// // //   <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
// // //     {/* Desktop Header */}
// // //    <div className="hidden md:grid md:grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
// // //   <div className="md:col-span-3">User Name</div>
// // //   <div className="md:col-span-2">Status</div>
// // //   <div className="md:col-span-2">Buy Products</div>
// // //   <div className="md:col-span-2">Sale Products</div>
// // //   <div className="md:col-span-2">Joined Date</div>
// // //   <div className="md:col-span-1 text-right">Actions</div>
// // // </div>

// // //     <div className="divide-y divide-white/10">
// // //       {userLoading && (
// // //         <div className="p-6 text-white/70 text-sm">Loading users…</div>
// // //       )}

// // //       {!!userError && !userLoading && (
// // //         <div className="p-6 text-red-400 text-sm">{userError}</div>
// // //       )}

// // //   {!userLoading && !userError && userRows.map((u) => (
// // //   <div key={u.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-5 py-5 bg-white/[0.02]">
    
// // //     {/* User Name */}
// // //     <div className="md:col-span-3 flex items-center gap-3 min-w-0">
// // //       <img
// // //         src={u.avatar || "https://i.pravatar.cc/80?img=12"}
// // //         alt={u.name}
// // //         className="h-10 w-10 rounded-full object-cover border border-white/10 shrink-0"
// // //       />
// // //       <div className="min-w-0">
// // //         <div className="text-sm font-medium text-white/90 truncate">{u.name}</div>
// // //         <div className="text-xs text-white/45 truncate">{u.email}</div>
// // //       </div>
// // //     </div>

// // //     {/* Status */}
// // //     <div className="md:col-span-2 flex items-center">
// // //       <span className="px-3 py-1 rounded-full text-xs font-medium border bg-emerald-500/15 text-emerald-200 border-emerald-500/25">
// // //         Active
// // //       </span>
// // //     </div>

// // //     {/* Buy Products */}
// // //     <div className="md:col-span-2 text-sm text-white/75 flex items-center">
// // //       {u.buyProducts ?? 0}
// // //     </div>

// // //     {/* Sale Products */}
// // //     <div className="md:col-span-2 text-sm text-white/75 flex items-center">
// // //       {u.saleProducts ?? 0}
// // //     </div>

// // //     {/* Joined Date */}
// // //     <div className="md:col-span-2 text-sm text-white/75 flex items-center">
// // //       {formatDate(u.createdAt)}
// // //     </div>

// // //     {/* Actions */}
// // //     <div className="md:col-span-1 flex items-center justify-end gap-3">
// // //       <button className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
// // //         🚫 Block
// // //       </button>
// // //       <button className="text-white/50 hover:text-white/80 text-sm">
// // //         🗑
// // //       </button>
// // //     </div>
// // //   </div>
// // // ))}
// // //       {!userLoading && !userError && userRows.length === 0 && (
// // //         <div className="p-6 text-white/60 text-sm">No users found.</div>
// // //       )}
// // //     </div>
// // //   </div>

// // //   {/* Search + Page Size */}
// // //   <div className={`${kpiCardBase} mt-6 p-4`}>
// // //     <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
// // //       <div className="flex-1 relative min-w-0">
// // //         <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
// // //         <input
// // //           value={userSearch}
// // //           onChange={(e) => setUserSearch(e.target.value)}
// // //           className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
// // //           placeholder="Search users by name or email..."
// // //         />
// // //       </div>

// // //       <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
// // //         <div className="text-sm text-white/60 shrink-0">Show</div>
// // //         <select
// // //           value={userPageSize}
// // //           onChange={(e) => setUserPageSize(Number(e.target.value))}
// // //           className="h-11 min-w-[90px] px-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none"
// // //         >
// // //           {[10, 20, 50, 100].map((n) => (
// // //             <option key={n} value={n}>
// // //               {n}
// // //             </option>
// // //           ))}
// // //         </select>
// // //       </div>
// // //     </div>
// // //   </div>
// // // </section>
// // //   </>
// // // )}


// // //         {active === "products" && <ProductsView />}
// // //         {active === "sellers" && <SellersView />}
// // //         {active === "reports" && <ReportsView />}
// // //         {active === "analytics" && (
// // //           <div className={`${kpiCardBase} p-8`}>
// // //             <h1 className="text-2xl font-semibold">Analytics</h1>
// // //             <p className="text-white/60 mt-2">Coming soon…</p>
// // //           </div>
// // //         )}
// // //         {active === "account" && (
// // //           <AccountView
// // //             adminName={adminName}
// // //             adminEmail={adminEmail}
// // //             totalMembers={24}
// // //             activeToday={18}
// // //             pendingInvite={3}
// // //           />
// // //         )}
// // //       </div>
// // //     </main>
// // //   </div>
// // // </div>

// // //       {/* Footer */}
// // //       <footer className="mt-10 pb-8 text-center text-xs text-white/35">
// // //         © 2020 – 2026 Tokun.world | All Rights Reserved
// // //       </footer>
// // //       <MobileBottomNav />



// // //       {showAllActivities && (
// // //   <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
// // //     <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl border border-white/10 bg-[#0F1117] shadow-2xl overflow-hidden">
      
// // //       {/* Header */}
// // //       <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
// // //         <h2 className="text-lg font-semibold text-white">Activity Log</h2>
// // //         <button
// // //           onClick={() => setShowAllActivities(false)}
// // //           className="h-9 w-9 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center text-white/80"
// // //         >
// // //           <X className="h-4 w-4" />
// // //         </button>
// // //       </div>

// // //       {/* Body */}
// // //       <div className="max-h-[70vh] overflow-y-auto p-5 space-y-4 no-scrollbar">
// // //         {activitiesLoading && (
// // //           <div className="text-white/70 text-sm">Loading activities…</div>
// // //         )}

// // //         {!!activitiesError && !activitiesLoading && (
// // //           <div className="text-red-400 text-sm">{activitiesError}</div>
// // //         )}

// // //         {!activitiesLoading && !activitiesError && activities.length === 0 && (
// // //           <div className="text-white/60 text-sm">No recent activity found.</div>
// // //         )}

// // //         {!activitiesLoading &&
// // //           !activitiesError &&
// // //           activities.map((a) => {
// // //             const meta = activityMeta(a.type);
// // //             return (
// // //               <div
// // //                 key={a.id}
// // //                 className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
// // //               >
// // //                 <div
// // //                   className={[
// // //                     "h-10 w-10 rounded-full border flex items-center justify-center shrink-0",
// // //                     meta.iconBg,
// // //                   ].join(" ")}
// // //                 >
// // //                   {meta.icon}
// // //                 </div>

// // //                 <div className="min-w-0 flex-1">
// // //                   <div className="text-sm font-medium text-white/90">
// // //                     {a.title}
// // //                   </div>
// // //                   {a.desc && (
// // //                     <div className="text-xs text-white/55 mt-1">
// // //                       {a.desc}
// // //                     </div>
// // //                   )}
// // //                   <div className="text-[11px] text-white/40 mt-2">
// // //                     {timeAgo(a.createdAt)}
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             );
// // //           })}
// // //       </div>
// // //     </div>
// // //   </div>
// // // )}
// // //     </div>
// // //   );
// // // };

// // // export default Dashboard;

// // // src/pages/admin/Dashboard.tsx
// // import React, { useEffect, useMemo, useState } from "react";
// // import {
// //   Bell,
// //   ChevronDown,
// //   Plus,
// //   LayoutDashboard,
// //   Store,
// //   Package,
// //   LineChart,
// //   UserRound,
// //   CheckCircle2,
// //   XCircle,
// //   ShieldCheck,
// //   Search,
// //   X,
// //   TrendingUp,
// //   TriangleAlert,
// //   Image as ImageIcon,
// //   Video,
// //   Download,
// //   MessageSquare,
// //   Ban,
// //   Clock,
// //   FileText,
// //   ShieldAlert,
// //   User,
// //   ShoppingCart
// // } from "lucide-react";

// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";

// // import {
// //   Area,
// //   AreaChart,
// //   CartesianGrid,
// //   ResponsiveContainer,
// //   Tooltip,
// //   XAxis,
// //   YAxis,
// // } from "recharts";

// // import {
// //   DropdownMenu,
// //   DropdownMenuContent,
// //   DropdownMenuItem,
// //   DropdownMenuSeparator,
// //   DropdownMenuTrigger,
// // } from "@/components/ui/dropdown-menu";

// // // ✅ ADD reports here
// // type NavKey =
// //   | "dashboard"
// //   | "sellers"
// //   | "products"
// //   | "reports"
// //   | "analytics"
// //   | "account";

// // const kpiCardBase =
// //   "rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.03] border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

// // // =======================
// // // TYPES
// // // =======================
// // type PromptProduct = {
// //   id: string;
// //   title: string;
// //   uploaderName: string;
// //   uploaderId?: string | null;
// //   price: number;
// //   status: "Published" | "Draft" | "Flagged";
// //   imageUrl?: string;
// //   videoUrl?: string;
// //   category?: string;
// //   exclusive?: boolean;
// //   sold?: boolean;
// // };

// // type Category = { _id: string; name: string; description?: string };

// // type SellerProfile = {
// //   id: string;
// //   name: string;
// //   email?: string;
// //   location?: string;
// //   joined?: string;
// //   status?: "ACTIVE" | "SUSPENDED";
// //   avatar?: string;
// //   verified?: boolean;

// //   totalEarnings?: number;
// //   rating?: number;
// //   reviewsCount?: number;
// //   refundRate?: number;
// //   refundThreshold?: number;
// // };

// // type SellerRow = {
// //   id: string;
// //   name: string;
// //   email: string;
// //   status: "Active" | "Blocked";
// //   avatar?: string;
// //   joined?: string | null;
// //   category?: string;
// //   // ✅ volume = total earning
// //   volume?: number;
// //   totalProducts?: number;
// //   soldProducts?: number;
// //   totalSpent?: number;
// //   isDeleted?: boolean;
// //   kycStatus?: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED" | "FLAGGED";
// // };

// // // ✅ REPORT TYPES (left + right flow)
// // type ReportItem = {
// //   id: string;
// //   title: string;
// //   listingId: string;
// //   productId?: string;
// //   category: string;
// //   status: "Open" | "Reviewed" | "Dismissed" | "Actioned";
// //   priority: "Low" | "Medium" | "High";
// //   createdAt: string;

// //   reporterName?: string;
// //   reporterEmail?: string;
// //   reason: string;
// //   details?: string;

// //   productTitle?: string;
// //   sellerName?: string;

// //   previewImageUrl?: string;
// //   previewVideoUrl?: string;

// //   evidence?: Array<{
// //     type: "image" | "video" | "text";
// //     url?: string;
// //     text?: string;
// //     label?: string;
// //   }>;

// //   history?: Array<{
// //     at: string;
// //     by: string;
// //     action: string;
// //     note?: string;
// //   }>;
// // };

// // // =======================
// // // API
// // // =======================
// // type ActivityItem = {
// //   id: string;
// //   title: string;
// //   desc?: string;
// //   createdAt: string;
// //   type:
// //     | "USER_REGISTERED"
// //     | "USER_LOGIN"
// //     | "PRODUCT_PURCHASED"
// //     | "VIDEO_CALL_STARTED"
// //     | "VIDEO_CALL_ENDED"
// //     | "SELLER_REGISTERED"
// //     | "PRODUCT_APPROVED"
// //     | "PAYOUT_FAILED"
// //     | "POLICY_UPDATE"
// //     | "REPORT_CREATED"
// //     | "LISTING_SUSPENDED"
// //     | "PRODUCT_FLAGGED"
// //     | "OTHER";
// // };

// // type UserRow = {
// //   id: string;
// //   name: string;
// //   email: string;
// //   avatar?: string;
// //   userType?: "IND" | "ORG" | "TM";
// //   plan?: "free" | "pro" | null;
// //   isVerified?: boolean;
// //   kycStatus?: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED" | "FLAGGED";
// //   createdAt?: string;
// //   lastLoginAt?: string;
// //   // ✅ purchased prompts count
// //   buyProducts?: number;
// //   // ✅ uploaded prompts count
// //   saleProducts?: number;
// //   totalEarnings?: number;
// //   totalSpent?: number;
// // };


// // const useMediaQuery = (query: string) => {
// //   const [matches, setMatches] = React.useState(false);

// //   React.useEffect(() => {
// //     const mql = window.matchMedia(query);
// //     const onChange = () => setMatches(mql.matches);
// //     onChange();
// //     mql.addEventListener("change", onChange);
// //     return () => mql.removeEventListener("change", onChange);
// //   }, [query]);

// //   return matches;
// // };

// // const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// // const PROMPTS_BASE = `${API_BASE}/api/prompt`;
// // const SELLERS_BASE = `${API_BASE}/api/seller`;
// // const REPORTS_BASE = `${API_BASE}/api/promptreport`;
// // const USERS_BASE = `${API_BASE}/api/user`;
// // // Optional future:
// // // const REPORTS_BASE = `${API_BASE}/api/reports`;

// // const Dashboard = () => {
// //   const [active, setActive] = useState<NavKey>("dashboard");
// // const [currentView, setCurrentView] = useState<"seller" | "user">("seller");
// //  const [showAllUsers, setShowAllUsers] = useState(false);
// // const [userRows, setUserRows] = useState<UserRow[]>([]);
// // const [userLoading, setUserLoading] = useState(false);
// // const [userError, setUserError] = useState<string | null>(null);
// // const [userPage, setUserPage] = useState(1);
// // const [userPageSize, setUserPageSize] = useState(10);
// // const [userTotalPages, setUserTotalPages] = useState(1);
// // const [userTotal, setUserTotal] = useState(0);
// // const [userSearch, setUserSearch] = useState("");
// //  const [showAllActivities, setShowAllActivities] = useState(false);
// //  const [stats, setStats] = useState({
// //   totalRevenue: 0,
// //   totalSellers: 0,
// // });
// // const [pendingApprovals, setPendingApprovals] = useState(0);



// // const [sellerRows, setSellerRows] = useState<SellerRow[]>([]);

// // type ChartDatum = {
// //   year?: number;
// //   month?: number;
// //   name: string;
// //   blue: number;  // revenue
// //   green: number; // sales count
// // };

// // const defaultChartData: ChartDatum[] = [
// //   { name: "Week 1", blue: 28, green: 18 },
// //   { name: "Week 2", blue: 14, green: 22 },
// //   { name: "Week 3", blue: 18, green: 24 },
// //   { name: "Week 4", blue: 44, green: 30 },
// //   { name: "Week 5", blue: 34, green: 44 },
// //   { name: "Week 6", blue: 46, green: 26 },
// //   { name: "Week 7", blue: 22, green: 30 },
// //   { name: "Week 8", blue: 18, green: 28 },
// //   { name: "Week 9", blue: 6, green: 34 },
// // ];

// // const [chartData, setChartData] = useState<ChartDatum[]>(defaultChartData);


// //   // ✅ Admin name (same as before)
// //   const adminEmail = (localStorage.getItem("tokun_admin_email") || "").trim();
// //   const adminName = useMemo(() => {
// //     if (!adminEmail) return "Admin";
// //     const localPart = adminEmail.split("@")[0] || "Admin";
// //     const first = localPart.split(/[._-]/)[0] || localPart;
// //     return first.charAt(0).toUpperCase() + first.slice(1);
// //   }, [adminEmail]);

// //   // ✅ Token getter
// //   const getToken = () => {
// //     return (
// //       localStorage.getItem("token") ||
// //       localStorage.getItem("tokun_token") ||
// //       localStorage.getItem("accessToken") ||
// //       ""
// //     );
// //   };


// //   // ✅ Central stats used by dashboard users + sellers.
// //   // Backend endpoint needed: GET /api/purchase/analytics/user-stats
// //   const fetchUserStatsMap = async (headers: Record<string, string> = {}) => {
// //     const res = await fetch(`${API_BASE}/api/purchase/analytics/user-stats`, {
// //       headers,
// //       credentials: "include",
// //     });

// //     const data = await res.json().catch(() => null);

// //     if (!res.ok || !data?.success) {
// //       throw new Error(data?.error || data?.message || "Failed to load user stats");
// //     }

// //     const map: Record<
// //       string,
// //       {
// //         userId: string;
// //         uploadedPrompts: number;
// //         buyProducts: number;
// //         soldProducts: number;
// //         totalSpent: number;
// //         totalEarnings: number;
// //       }
// //     > = {};

// //     console.log("✅ user-stats API:", data);

// //     (data.items || []).forEach((item: any) => {
// //       const id = String(item?.userId || "");
// //       if (!id) return;

// //       map[id] = {
// //         userId: id,
// //         uploadedPrompts: Number(item?.uploadedPrompts || 0),
// //         buyProducts: Number(item?.buyProducts || 0),
// //         soldProducts: Number(item?.soldProducts || 0),
// //         totalSpent: Number(item?.totalSpent || 0),
// //         totalEarnings: Number(item?.totalEarnings || 0),
// //       };
// //     });

// //     return map;
// //   };



// // // ✅ SIMPLE WORKAROUND — activityLogger ko frontend se call karo
// // // Dashboard.tsx mein ye helper function add karo:

// // const logActivityToLocal = async (type: string, title: string, description: string, actorName?: string) => {
// //   try {
// //     await fetch(`${API_BASE}/api/activity/test-insert-custom`, {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ type, title, description, actorName }),
// //     });
// //   } catch (e) {
// //     // silent fail
// //   }
// // };







// //   const [activities, setActivities] = useState<ActivityItem[]>([]);
// // const [activitiesLoading, setActivitiesLoading] = useState(false);
// // const [activitiesError, setActivitiesError] = useState<string | null>(null);

// //    const activityMeta = (type: ActivityItem["type"]) => {
// //   switch (type) {
// //     case "USER_REGISTERED":
// //       return {
// //         icon: <UserRound className="h-4 w-4" />,
// //         iconBg: "bg-blue-500/15 text-blue-300 border-blue-500/25",
// //       };
// //     case "USER_LOGIN":
// //       return {
// //         icon: <ShieldCheck className="h-4 w-4" />,
// //         iconBg: "bg-slate-500/15 text-slate-200 border-slate-400/25",
// //       };
// //     case "PRODUCT_PURCHASED":
// //       return {
// //         icon: <ShoppingCart className="h-4 w-4" />,
// //         iconBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
// //       };
// //     case "VIDEO_CALL_STARTED":
// //       return {
// //         icon: <Video className="h-4 w-4" />,
// //         iconBg: "bg-sky-500/15 text-sky-200 border-sky-500/25",
// //       };
// //     case "VIDEO_CALL_ENDED":
// //       return {
// //         icon: <Video className="h-4 w-4" />,
// //         iconBg: "bg-slate-500/15 text-slate-200 border-slate-400/25",
// //       };
// //     case "SELLER_REGISTERED":
// //       return {
// //         icon: <UserRound className="h-4 w-4" />,
// //         iconBg: "bg-blue-500/15 text-blue-300 border-blue-500/25",
// //       };
// //     case "PRODUCT_APPROVED":
// //       return {
// //         icon: <CheckCircle2 className="h-4 w-4" />,
// //         iconBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
// //       };
// //     case "PAYOUT_FAILED":
// //       return {
// //         icon: <XCircle className="h-4 w-4" />,
// //         iconBg: "bg-red-500/15 text-red-300 border-red-500/25",
// //       };
// //     case "POLICY_UPDATE":
// //       return {
// //         icon: <ShieldCheck className="h-4 w-4" />,
// //         iconBg: "bg-slate-500/15 text-slate-200 border-slate-400/25",
// //       };
// //     case "REPORT_CREATED":
// //       return {
// //         icon: <ShieldAlert className="h-4 w-4" />,
// //         iconBg: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/25",
// //       };
// //     case "LISTING_SUSPENDED":
// //       return {
// //         icon: <Ban className="h-4 w-4" />,
// //         iconBg: "bg-red-500/15 text-red-200 border-red-500/25",
// //       };
// //     case "PRODUCT_FLAGGED":
// //       return {
// //         icon: <TriangleAlert className="h-4 w-4" />,
// //         iconBg: "bg-amber-500/15 text-amber-200 border-amber-500/25",
// //       };
// //     default:
// //       return {
// //         icon: <Clock className="h-4 w-4" />,
// //         iconBg: "bg-white/10 text-white/70 border-white/15",
// //       };
// //   }
// // };



// // // useEffect(() => {
// // //   const loadActivities = async () => {
// // //     try {
// // //       setActivitiesLoading(true);
// // //       setActivitiesError(null);

// // //       const token = getToken();
// // //       console.log("🔑 Token being used:", token); // token dekho

// // //       const res = await fetch(`${API_BASE}/api/activity/recent?limit=10`, {
// // //         headers: {
// // //           ...(token ? { Authorization: `Bearer ${token}` } : {}),
// // //         },
// // //         credentials: "include",
// // //       });

// // //       console.log("📡 Response status:", res.status); // status dekho

// // //       if (!res.ok) {
// // //         throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
// // //       }

// // //       const data = await res.json();
// // //       console.log("📦 Raw API data:", data);          // raw data dekho
// // //       console.log("📋 Items count:", data?.items?.length); // items count dekho

// // //       if (!data?.success) {
// // //         throw new Error(data?.message || data?.error || "Failed to load activities");
// // //       }

// // //       const mapped: ActivityItem[] = (data.items || []).map((a: any) => ({
// // //         id: String(a._id || a.id),
// // //         title: a.title || "Activity",
// // //         desc: a.description || a.desc ||
// // //           (a.actorName ? `By ${a.actorName}${a.targetName ? ` • ${a.targetName}` : ""}` : ""),
// // //         createdAt: a.createdAt || new Date().toISOString(),
// // //         type: (a.type || "OTHER") as ActivityItem["type"],
// // //       }));

// // //       console.log("✅ Mapped activities:", mapped); // mapped data dekho

// // //       setActivities(mapped);
// // //     } catch (e: any) {
// // //       console.error("❌ Activity load error:", e);
// // //       setActivitiesError(e?.message || "Failed to load activities");
// // //       setActivities([]);
// // //     } finally {
// // //       setActivitiesLoading(false);
// // //     }
// // //   };

// // //   loadActivities();
// // // }, []);




// // // ✅ REPLACE KARO — active page change pe bhi reload ho
// // useEffect(() => {
// //   const loadActivities = async () => {
// //     try {
// //       setActivitiesLoading(true);
// //       setActivitiesError(null);

// //       const token = getToken();

// //       const res = await fetch(`${API_BASE}/api/activity/recent?limit=10`, {
// //         headers: {
// //           ...(token ? { Authorization: `Bearer ${token}` } : {}),
// //         },
// //         credentials: "include",
// //       });

// //       if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

// //       const data = await res.json();
// //       if (!data?.success) throw new Error(data?.message || "Failed");

// //       const mapped: ActivityItem[] = (data.items || []).map((a: any) => ({
// //         id: String(a._id || a.id),
// //         title: a.title || "Activity",
// //         desc: a.description || a.desc ||
// //           (a.actorName ? `By ${a.actorName}${a.targetName ? ` • ${a.targetName}` : ""}` : ""),
// //         createdAt: a.createdAt || new Date().toISOString(),
// //         type: (a.type || "OTHER") as ActivityItem["type"],
// //       }));

// //       console.log("✅ Setting activities:", mapped.length);
// //       setActivities(mapped);
// //     } catch (e: any) {
// //       console.error("❌ Activity error:", e);
// //       setActivitiesError(e?.message || "Failed to load activities");
// //       setActivities([]);
// //     } finally {
// //       setActivitiesLoading(false);
// //     }
// //   };

// //   // ✅ dashboard active hone pe fetch karo
// //   if (active === "dashboard") {
// //     loadActivities();
// //   }
// // }, [active]); // ✅ active dependency add karo

// // useEffect(() => {
// //   const fetchUsers = async () => {
// //     try {
// //       setUserLoading(true);
// //       setUserError(null);

// //       const token = getToken();
// //       const headers: Record<string, string> = {
// //         ...(token ? { Authorization: `Bearer ${token}` } : {}),
// //       };

// //       const params = new URLSearchParams();
// //       params.set("limit", String(userPageSize));
// //       params.set("page", String(userPage));
// //       if (userSearch.trim()) params.set("search", userSearch.trim());

// //       const [usersRes, statsByUser] = await Promise.all([
// //         fetch(`${USERS_BASE}?${params.toString()}`, {
// //           headers,
// //           credentials: "include",
// //         }),
// //         fetchUserStatsMap(headers),
// //       ]);

// //       const data = await usersRes.json();

// //       if (!usersRes.ok || !data?.success) {
// //         throw new Error(data?.error || data?.message || "Failed to load users");
// //       }

// //       const mapped: UserRow[] = (data.users || []).map((u: any) => {
// //         const uid = String(u._id);
// //         const stat = statsByUser[uid] || {};

// //         return {
// //           id: uid,
// //           name: u?.name || "Unknown",
// //           email: u?.email || "—",
// //           avatar: u?.avatarUrl || undefined,
// //           userType: u?.userType,
// //           plan: u?.plan ?? null,
// //           isVerified: !!u?.isVerified,
// //           kycStatus: u?.kycStatus,
// //           createdAt: u?.createdAt,
// //           lastLoginAt: u?.lastLoginAt,

// //           // ✅ Buy = kitne prompts purchase kiye
// //           buyProducts: Number(stat.buyProducts || 0),

// //           // ✅ Sell = kitne prompts upload kiye
// //           saleProducts: Number(stat.uploadedPrompts || 0),

// //           totalEarnings: Number(stat.totalEarnings || 0),
// //           totalSpent: Number(stat.totalSpent || 0),
// //         };
// //       });

// //       setUserRows(mapped);
// //       setUserTotal(data?.pagination?.total || mapped.length || 0);
// //       setUserTotalPages(data?.pagination?.totalPages || 1);
// //     } catch (e: any) {
// //       setUserError(e?.message || "Error loading users");
// //       setUserRows([]);
// //       setUserTotal(0);
// //       setUserTotalPages(1);
// //     } finally {
// //       setUserLoading(false);
// //     }
// //   };

// //   if (active === "dashboard" && currentView === "user") fetchUsers();
// // }, [active, currentView, userPage, userPageSize, userSearch]);
// //   // =======================
// //   // Dashboard chart/table/activity data
// //   // =======================

// //      const recentActivitiesPreview = useMemo(() => {
// //   return activities.slice(0, 4);
// // }, [activities]);


// //  const timeAgo = (dateLike: string) => {
// //   const t = new Date(dateLike).getTime();
// //   const diff = Date.now() - t;
// //   const m = Math.floor(diff / 60000);
// //   if (m < 60) return `${m}m ago`;
// //   const h = Math.floor(m / 60);
// //   if (h < 24) return `${h}h ago`;
// //   const d = Math.floor(h / 24);
// //   return `${d}d ago`;
// // };

// // useEffect(() => {
// //   const fetchSalesAnalytics = async () => {
// //     try {
// //       const res = await fetch(
// //         `${API_BASE}/api/purchase/analytics/sales`
// //       );

// //       if (!res.ok) {
// //         throw new Error("Failed to fetch sales analytics");
// //       }

// //       const data = await res.json();

// //       if (data.success) {
// //         formatChartData(data.monthlySales);
// //       }
// //     } catch (error) {
// //       console.error("Sales analytics error:", error);
// //     }
// //   };

// //   fetchSalesAnalytics();
// // }, []);

// // const formatChartData = (apiData: any[] = []) => {
// //   const monthNames = [
// //     "Jan","Feb","Mar","Apr","May","Jun",
// //     "Jul","Aug","Sep","Oct","Nov","Dec"
// //   ];

// //   const today = new Date();

// //   // 🔹 last 6 months ka base structure
// //   const last6Months = [];

// //   for (let i = 5; i >= 0; i--) {
// //     const d = new Date(today.getFullYear(), today.getMonth() - i, 1);

// //     last6Months.push({
// //       year: d.getFullYear(),
// //       month: d.getMonth() + 1,
// //       name: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
// //       blue: 0,
// //       green: 0,
// //     });
// //   }

// //   // 🔹 API data merge
// //   (Array.isArray(apiData) ? apiData : []).forEach((item: any) => {
// //     const index = last6Months.findIndex(
// //       m =>
// //         m.month === item._id.month &&
// //         m.year === item._id.year
// //     );

// //     if (index !== -1) {
// //       last6Months[index].blue = item.revenue || 0;
// //       last6Months[index].green = item.totalSales || 0;
// //     }
// //   });

// //   setChartData(last6Months);
// // };









// // const ReportsSidebar = () => {
// //   const [tab, setTab] = useState<"product" | "review">("product");

// //   const openCount = (reports || []).filter((r) => r.status === "Open").length;

// //   const groupLabel = (p: ReportItem["priority"]) => {
// //     if (p === "High") return "HIGH RISK";
// //     if (p === "Medium") return "PENDING";
// //     return "LOW RISK";
// //   };

// //   const grouped = useMemo(() => {
// //     const list = [...reports].sort(
// //       (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// //     );

// //     return {
// //       High: list.filter((r) => r.priority === "High"),
// //       Medium: list.filter((r) => r.priority === "Medium"),
// //       Low: list.filter((r) => r.priority === "Low"),
// //     };
// //   }, [reports]);

// //   const Item = (r: ReportItem) => {
// //     const isActive = selectedReport?.id === r.id;

// //     return (
// //       <button
// //         key={r.id}
// //         onClick={() => {
// //         setSelectedReport(r);
// // setActive("reports");
// // setMobileReportsPage("details"); // ✅ on phone open details page

// //         }}
// //         className={[
// //           "w-full text-left px-4 py-4 border-t border-white/10 transition",
// //           isActive ? "bg-white/[0.05]" : "hover:bg-white/[0.03]",
// //         ].join(" ")}
// //       >
// //         <div className="flex items-start justify-between gap-3">
// //           <div className="min-w-0">
// //             <div className="text-xs font-semibold text-white/80">
// //               {groupLabel(r.priority)}
// //             </div>
// //             <div className="mt-2 text-sm font-medium text-white/90 truncate">
// //               {r.productTitle || r.title}
// //             </div>
// //             <div className="mt-1 text-xs text-white/55 truncate">
// //               {r.reason}
// //               {r.reporterName ? `: Reported by @${r.reporterName}` : ""}
// //             </div>
// //           </div>

// //           <div className="shrink-0 text-xs text-white/45">
// //             {timeAgo(r.createdAt)}
// //           </div>
// //         </div>
// //       </button>
// //     );
// //   };

// //   return (
// //     <aside className={[kpiCardBase, "overflow-hidden"].join(" ")}>
// //       {/* Tabs */}
// //       <div className="px-4 pt-4">
// //         <div className="flex items-center gap-8 text-sm">
// //           <button
// //             onClick={() => setTab("product")}
// //             className={[
// //               "pb-3 transition",
// //               tab === "product"
// //                 ? "text-white border-b-2 border-fuchsia-400"
// //                 : "text-white/60 hover:text-white/85",
// //             ].join(" ")}
// //           >
// //             Product Reports
// //           </button>

// //           <button
// //             onClick={() => setTab("review")}
// //             className={[
// //               "pb-3 transition",
// //               tab === "review"
// //                 ? "text-white border-b-2 border-fuchsia-400"
// //                 : "text-white/60 hover:text-white/85",
// //             ].join(" ")}
// //           >
// //             Review Moderation
// //           </button>
// //         </div>
// //       </div>

// //       {/* Count + Filter */}
// //       <div className="px-4 py-4 flex items-center justify-between border-b border-white/10">
// //         <div className="text-xs text-white/60 uppercase tracking-wide">
// //           {openCount} Pending Reports
// //         </div>

// //         <button className="text-xs text-white/70 flex items-center gap-2 hover:text-white">
// //           <span className="inline-flex items-center justify-center h-8 px-3 rounded-xl border border-white/10 bg-white/[0.03]">
// //             <span className="mr-2">⌄</span> FILTER
// //           </span>
// //         </button>
// //       </div>

// //       {/* List */}
// //       <div className="max-h-[calc(100vh-170px)] overflow-y-auto">
// //         {tab === "review" ? (
// //           <div className="p-4 text-sm text-white/60">
// //             Review moderation (coming soon…)
// //           </div>
// //         ) : (
// //           <>
// //             {grouped.High.map(Item)}
// //             {grouped.Medium.map(Item)}
// //             {grouped.Low.map(Item)}
// //           </>
// //         )}
// //       </div>
// //     </aside>
// //   );
// // };



// //   // =============================
// //   // ✅ FETCH MARKETPLACE PROMPTS
// //   // =============================
// //   const [products, setProducts] = useState<PromptProduct[]>([]);
// //   const [productsLoading, setProductsLoading] = useState(false);
// //   const [productsError, setProductsError] = useState<string | null>(null);
// // const isMobile = useMediaQuery("(max-width: 767px)");
// // const [mobileReportsPage, setMobileReportsPage] = useState<"list" | "details">("list");


// //   // ✅ Categories for filters
// //   const [categories, setCategories] = useState<Category[]>([]);
// //   const [catsLoading, setCatsLoading] = useState(false);
// //   const [catsError, setCatsError] = useState<string | null>(null);

// //   // ✅ Sellers
// //   // const [sellerRows, setSellerRows] = useState<SellerRow[]>([]);
// //   const [sellersLoading, setSellersLoading] = useState(false);
// //   const [sellersError, setSellersError] = useState<string | null>(null);
// //   const [showAllSellers, setShowAllSellers] = useState(false);
    


// //   // ✅ Sellers (pagination + search)

// // const [sellerPage, setSellerPage] = useState(1);
// // const [sellerPageSize, setSellerPageSize] = useState(10);
// // const [sellerTotalPages, setSellerTotalPages] = useState(1);
// // const [sellerTotal, setSellerTotal] = useState(0);
// // const [sellerSearch, setSellerSearch] = useState("");
// //   const totalSellers = useMemo(() => sellerRows.length, [sellerRows]);

// //   const totalSellerProducts = useMemo(() => {
// //     return sellerRows.reduce((sum, s) => sum + (Number(s.totalProducts) || 0), 0);
// //   }, [sellerRows]);

// //   const totalMarketplaceProducts = useMemo(() => products.length, [products]);

// //    useEffect(() => {
// //   const fetchAllSellers = async () => {
// //     try {
// //       setSellersLoading(true);
// //       setSellersError(null);

// //       const token = getToken();
// //       const headers: Record<string, string> = {
// //         ...(token ? { Authorization: `Bearer ${token}` } : {}),
// //       };

// //       const [resOrg, resUser, statsByUser] = await Promise.all([
// //         fetch(`${SELLERS_BASE}`, {
// //           headers,
// //           credentials: "include",
// //         }),
// //         fetch(`${USERS_BASE}?seller=true&limit=1000&page=1`, {
// //           headers,
// //           credentials: "include",
// //         }),
// //         fetchUserStatsMap(headers),
// //       ]);

// //       const [orgData, userData] = await Promise.all([
// //         resOrg.json(),
// //         resUser.json(),
// //       ]);

// //       if (!resOrg.ok || !orgData?.success) {
// //         throw new Error(orgData?.error || "Org sellers failed");
// //       }

// //       if (!resUser.ok || !userData?.success) {
// //         throw new Error(userData?.error || "User sellers failed");
// //       }

// //       const orgMapped: SellerRow[] = (orgData.sellers || []).map((s: any) => {
// //         // In case your Seller document stores the real User id in userId.
// //         const statId = String(s?.userId?._id || s?.userId || s?._id);
// //         const stat = statsByUser[statId] || {};

// //         return {
// //           id: String(s._id),
// //           name: s?.name || "Unknown",
// //           email: s?.email || "—",
// //           status: s?.status === "SUSPENDED" || s?.isBanned ? "Blocked" : "Active",
// //           avatar: s?.avatar || s?.avatarUrl,
// //           joined: s?.joined || s?.createdAt || null,
// //           kycStatus: s?.kycStatus,
// //           isDeleted: !!s?.isDeleted || !!s?.deleted,

// //           // ✅ Sell/upload count
// //           totalProducts: Number(stat.uploadedPrompts || 0),

// //           // ✅ Sold count
// //           soldProducts: Number(stat.soldProducts || 0),

// //           // ✅ Volume = earning
// //           volume: Number(stat.totalEarnings || 0),
// //         };
// //       });

// //       const userMapped: SellerRow[] = (userData.users || []).map((u: any) => {
// //         const uid = String(u._id);
// //         const stat = statsByUser[uid] || {};

// //         return {
// //           id: uid,
// //           name: u?.name || "Unknown",
// //           email: u?.email || "—",
// //           status: u?.isBanned ? "Blocked" : "Active",
// //           avatar: u?.avatarUrl,
// //           joined: u?.createdAt || null,
// //           kycStatus: u?.kycStatus,
// //           isDeleted: !!u?.isDeleted || !!u?.deleted,

// //           // ✅ Sell/upload count
// //           totalProducts: Number(stat.uploadedPrompts || 0),

// //           // ✅ Sold count
// //           soldProducts: Number(stat.soldProducts || 0),

// //           // ✅ Volume = earning
// //           volume: Number(stat.totalEarnings || 0),
// //         };
// //       });

// //       const merged = [...orgMapped, ...userMapped].reduce((acc, cur) => {
// //         acc.set(cur.id, cur);
// //         return acc;
// //       }, new Map<string, SellerRow>());

// //       const finalSellers = Array.from(merged.values());
// //       const totalRevenue = finalSellers.reduce((sum, seller) => sum + Number(seller.volume ?? 0), 0);

// //       setSellerRows(finalSellers);
// //       setStats({
// //         totalSellers: finalSellers.length,
// //         totalRevenue,
// //       });
// //     } catch (e: any) {
// //       setSellersError(e?.message || "Error loading sellers");
// //       setSellerRows([]);
// //       setStats({ totalSellers: 0, totalRevenue: 0 });
// //     } finally {
// //       setSellersLoading(false);
// //     }
// //   };

// //   fetchAllSellers();
// // }, []);


// // useEffect(() => {
// //   const loadPendingApprovals = async () => {
// //     try {
// //       const token = getToken();
// //       const headers = {
// //         ...(token ? { Authorization: `Bearer ${token}` } : {}),
// //       };

// //       const [usersRes, sellersRes, sellerUsersRes] = await Promise.all([
// //         fetch(`${USERS_BASE}?limit=1000&page=1`, {
// //           headers,
// //           credentials: "include",
// //         }),
// //         fetch(`${SELLERS_BASE}`, {
// //           headers,
// //           credentials: "include",
// //         }),
// //         fetch(`${USERS_BASE}?seller=true&limit=1000&page=1`, {
// //           headers,
// //           credentials: "include",
// //         }),
// //       ]);

// //       const [usersData, sellersData, sellerUsersData] = await Promise.all([
// //         usersRes.json(),
// //         sellersRes.json(),
// //         sellerUsersRes.json(),
// //       ]);

// //       // const isPendingUser = (u: any) => {
// //       //   const kyc = String(u?.kycStatus || "");
// //       //   const verified = !!u?.isVerified;
// //       //   return !verified || kyc === "NOT_SUBMITTED" || kyc === "PENDING";
// //       // };

// //       // const isPendingSeller = (s: any) => {
// //       //   const kyc = String(s?.kycStatus || "");
// //       //   const verified = !!s?.verified || !!s?.isVerified;
// //       //   return !verified || kyc === "NOT_SUBMITTED" || kyc === "PENDING";
// //       // };

// //       const isPendingUser = (u: any) => {
// //   return String(u?.kycStatus || "") === "PENDING";
// // };

// // const isPendingSeller = (s: any) => {
// //   return String(s?.kycStatus || "") === "PENDING";
// // };

// //       const pendingUsers = (usersData?.users || []).filter(isPendingUser).length;
// //       const pendingOrgSellers = (sellersData?.sellers || []).filter(isPendingSeller).length;
// //       const pendingSellerUsers = (sellerUsersData?.users || []).filter(isPendingUser).length;

// //       setPendingApprovals(pendingUsers + pendingOrgSellers + pendingSellerUsers);
// //     } catch (err) {
// //       console.error("Pending approvals fetch failed:", err);
// //       setPendingApprovals(0);
// //     }
// //   };

// //   if (active === "dashboard") {
// //     loadPendingApprovals();
// //   }
// // }, [active]);

// //   useEffect(() => {
// //     const fetchMarketplacePrompts = async () => {
// //       try {
// //         setProductsLoading(true);
// //         setProductsError(null);

// //         const token = getToken();
// //         const res = await fetch(`${PROMPTS_BASE}/others`, {
// //           headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
// //           credentials: "include",
// //         });

// //         const data = await res.json();
// //         if (!res.ok || !data?.success) {
// //           throw new Error(data?.error || "Failed to load marketplace prompts");
// //         }

// //         const mapped: PromptProduct[] = (data.prompts || []).map((doc: any) => {
// //           const att = doc?.attachment || null;
// //           const mediaPath = att?.path || undefined;

// //           const imageUrl = att?.type === "image" ? mediaPath : undefined;
// //           const videoUrl = att?.type === "video" ? mediaPath : undefined;

// //           const status: PromptProduct["status"] =
// //             doc?.flagged ? "Flagged" : doc?.draft ? "Draft" : "Published";

// //           return {
// //             id: String(doc._id),
// //             title: doc?.title || "Untitled",
// //             uploaderName: doc?.userId?.name || "Unknown",
// //            uploaderId:
// //   doc?.userId?._id ||
// //   doc?.uploaderId?._id ||
// //   doc?.uploaderId ||
// //   doc?.sellerId?._id ||
// //   doc?.sellerId ||
// //   null,
// //             price:
// //               typeof doc?.tokun_price === "number"
// //                 ? doc.tokun_price
// //                 : typeof doc?.price === "number"
// //                 ? doc.price
// //                 : 0,
// //             status,
// //             imageUrl,
// //             videoUrl,
// //             category:
// //               doc?.categories?.[0]?.name ||
// //               (Array.isArray(doc?.categories)
// //                 ? doc.categories
// //                     .map((c: any) =>
// //                       typeof c === "string" ? c : c?.name
// //                     )
// //                     .filter(Boolean)
// //                     .join(", ")
// //                 : "General"),
// //             exclusive: !!doc?.exclusive,
// //             sold: !!doc?.sold,
// //           };
// //         });

// //         setProducts(mapped);
// //       } catch (e: any) {
// //         setProductsError(e?.message || "Error loading products");
// //       } finally {
// //         setProductsLoading(false);
// //       }
// //     };

// //     fetchMarketplacePrompts();
// //   }, []);

// //   useEffect(() => {
// //     const loadCategories = async () => {
// //       try {
// //         setCatsLoading(true);
// //         setCatsError(null);

// //         const res = await fetch(`${API_BASE}/api/category`, {
// //           credentials: "include",
// //         });
// //         const data = await res.json();

// //         if (!res.ok || !data?.success) {
// //           throw new Error(data?.error || "Failed to load categories");
// //         }
// //         setCategories(data.categories || []);
// //       } catch (e: any) {
// //         setCatsError(e?.message || "Failed to load categories");
// //         setCategories([]);
// //       } finally {
// //         setCatsLoading(false);
// //       }
// //     };

// //     loadCategories();
// //   }, []);

// //   // =============================
// //   // ✅ NAV ITEM
// //   // =============================
// //   const NavItem = ({
// //     id,
// //     label,
// //     icon,
// //   }: {
// //     id: NavKey;
// //     label: string;
// //     icon: React.ReactNode;
// //   }) => {
// //     const isActive = active === id;
// //     return (
// //       <button
// //         onClick={() => setActive(id)}
// //         className={[
// //           "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition",
// //           isActive ? "text-fuchsia-300" : "text-white/75 hover:text-white",
// //         ].join(" ")}
// //       >
// //         <span className={isActive ? "text-fuchsia-300" : "text-white/55"}>
// //           {icon}
// //         </span>
// //         {label}
// //       </button>
// //     );
// //   };

// //   const formatDate = (dateLike?: string | null) => {
// //     if (!dateLike) return "—";
// //     const d = new Date(dateLike);
// //     if (Number.isNaN(d.getTime())) return "—";
// //     return d.toLocaleDateString("en-US", {
// //       month: "short",
// //       day: "2-digit",
// //       year: "numeric",
// //     });
// //   };

// //   const activeUsersCount = useMemo(() => {
// //   const start = new Date();
// //   start.setHours(0, 0, 0, 0);

// //   return userRows.filter(u => {
// //     if (!u.lastLoginAt) return false;
// //     return new Date(u.lastLoginAt).getTime() >= start.getTime();
// //   }).length;
// // }, [userRows]);

// // const MobileBottomNav = () => {
// //   const Item = ({
// //     id,
// //     label,
// //     icon,
// //   }: {
// //     id: NavKey;
// //     label: string;
// //     icon: React.ReactNode;
// //   }) => {
// //     const activeNow = active === id;
// //     return (
// //       <button
// //         onClick={() => {
// //           setActive(id);
// //           if (id === "reports") setMobileReportsPage("list");
// //         }}
// //         className={[
// //           "flex flex-col items-center justify-center gap-1 flex-1 py-2",
// //           activeNow ? "text-fuchsia-300" : "text-white/60",
// //         ].join(" ")}
// //       >
// //         <div className={activeNow ? "text-fuchsia-300" : "text-white/50"}>{icon}</div>
// //         <div className="text-[11px]">{label}</div>
// //       </button>
// //     );
// //   };

// //   return (
// //     <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#07080B]/90 backdrop-blur">
// //       <div className="mx-auto max-w-[520px] px-3">
// //         <div className="flex items-center">
// //           <Item id="dashboard" label="Home" icon={<LayoutDashboard className="h-5 w-5" />} />
// //           <Item id="sellers" label="Sellers" icon={<Store className="h-5 w-5" />} />
// //           <Item id="products" label="Products" icon={<Package className="h-5 w-5" />} />
// //           <Item id="reports" label="Reports" icon={<ShieldAlert className="h-5 w-5" />} />
// //           <Item id="account" label="Account" icon={<UserRound className="h-5 w-5" />} />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };


// //   const ReportsMobileList = () => {
// //   const grouped = useMemo(() => {
// //     const list = [...reports].sort(
// //       (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// //     );
// //     return {
// //       High: list.filter((r) => r.priority === "High"),
// //       Medium: list.filter((r) => r.priority === "Medium"),
// //       Low: list.filter((r) => r.priority === "Low"),
// //     };
// //   }, [reports]);

// //   const open = (r: ReportItem) => {
// //     setSelectedReport(r);
// //     setMobileReportsPage("details");
// //   };

// //   const Item = (r: ReportItem) => (
// //     <button
// //       key={r.id}
// //       onClick={() => open(r)}
// //       className="w-full text-left px-4 py-4 border-t border-white/10 hover:bg-white/[0.03]"
// //     >
// //       <div className="flex items-start justify-between gap-3">
// //         <div className="min-w-0">
// //           <div className="text-xs font-semibold text-white/80">
// //             {r.priority === "High" ? "HIGH RISK" : r.priority === "Medium" ? "PENDING" : "LOW RISK"}
// //           </div>
// //           <div className="mt-2 text-sm font-medium text-white/90 truncate">
// //             {r.productTitle || r.title}
// //           </div>
// //           <div className="mt-1 text-xs text-white/55 truncate">
// //             {r.reason}
// //             {r.reporterName ? `: Reported by @${r.reporterName}` : ""}
// //           </div>
// //         </div>
// //         <div className="shrink-0 text-xs text-white/45">{timeAgo(r.createdAt)}</div>
// //       </div>
// //     </button>
// //   );

// //   return (
// //     <section className={`${kpiCardBase} overflow-hidden`}>
// //       <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
// //         <div className="text-sm font-semibold">Product Reports</div>
// //         <div className="text-xs text-white/60">
// //           {(reports || []).filter((r) => r.status === "Open").length} Pending
// //         </div>
// //       </div>

// //       <div className="max-h-[calc(100vh-170px)] overflow-y-auto">
// //         {grouped.High.map(Item)}
// //         {grouped.Medium.map(Item)}
// //         {grouped.Low.map(Item)}
// //       </div>
// //     </section>
// //   );
// // };


// //   // =============================
// //   // ✅ REPORTS FLOW (LEFT + RIGHT)
// //   // =============================
// //   const [reports, setReports] = useState<ReportItem[]>([]);
// //   const [reportsLoading, setReportsLoading] = useState(false);
// //   const [reportsError, setReportsError] = useState<string | null>(null);
// //   const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

// //   // ✅ TEMP: mock reports (Replace with API later)
// // useEffect(() => {
// //   const loadReports = async () => {
// //   try {
// //     setReportsLoading(true);
// //     setReportsError(null);

// //     // Ensure the token is available, and add it to the request headers
// //     const token = getToken();  // Assuming `getToken()` retrieves the stored JWT token

// //     const res = await fetch(REPORTS_BASE, {
// //       headers: {
// //         Authorization: `Bearer ${token}`,  // Attach token as Bearer token
// //       },
// //       credentials: "include",  // Include cookies if necessary
// //     });

// //     const data = await res.json();
// //     if (!res.ok || !data?.success)
// //       throw new Error(data?.error || "Failed to load reports");

// //       const mapped: ReportItem[] = (data.reports || []).map((r: any) => {
// //         const prompt = r.prompt || {};
// //         const attachment = prompt.attachment || {};
// //         const attPath = attachment?.path || "";

// //         const previewImageUrl =
// //           attachment?.type === "image" ? attPath : undefined;
// //         const previewVideoUrl =
// //           attachment?.type === "video" ? attPath : undefined;

// //         const evidenceFiles =
// //           (r.screenshots || []).map((u: string) => ({
// //             type: "image" as const,
// //             url: u.startsWith("http") ? u : `${API_BASE}${u}`,
// //             label: "Screenshot",
// //           })) || [];

// //         return {
// //           id: String(r._id),
// //           title: r.resourceTitle || prompt.title || "Report",
// //           listingId: String(r.prompt?._id || r.prompt || ""),
// //           productId: String(r.prompt?._id || r.prompt || ""),
// //           category: r.category?.name || "General",
// //           status:
// //             r.status === "Pending"
// //               ? "Open"
// //               : r.status === "Reviewed"
// //               ? "Reviewed"
// //               : r.status === "Resolved"
// //               ? "Actioned"
// //               : "Dismissed",
// //           priority: "Medium",
// //           createdAt: r.createdAt,

// //           reporterName: r.reporter?.name,
// //           reporterEmail: r.reporter?.email,
// //           reason: r.reason,
// //           details: r.description || r.stepsToReproduce || "",

// //           productTitle: prompt.title,
// //           sellerName: prompt.userId?.name,

// //           previewImageUrl: previewImageUrl
// //             ? previewImageUrl.startsWith("http")
// //               ? previewImageUrl
// //               : `${API_BASE}${previewImageUrl}`
// //             : undefined,

// //           previewVideoUrl: previewVideoUrl
// //             ? previewVideoUrl.startsWith("http")
// //               ? previewVideoUrl
// //               : `${API_BASE}${previewVideoUrl}`
// //             : undefined,

// //           evidence: [
// //             ...evidenceFiles,
// //             ...(r.resourceURL
// //               ? [{ type: "text" as const, text: `Resource URL: ${r.resourceURL}` }]
// //               : []),
// //           ],
// //           history: [{ at: r.createdAt, by: "System", action: "Report created" }],
// //         };
// //       });
// //  setReports(mapped);
// //     setSelectedReport((prev) => prev ?? (mapped[0] || null));
// //   } catch (e: any) {
// //     setReportsError(e?.message || "Failed to load reports");
// //     setReports([]);
// //   } finally {
// //     setReportsLoading(false);
// //   }
// // };
    


// //   loadReports();
// // }, []);

// //   const Badge = ({
// //     children,
// //     tone,
// //   }: {
// //     children: React.ReactNode;
// //     tone:
// //       | "neutral"
// //       | "blue"
// //       | "emerald"
// //       | "red"
// //       | "amber"
// //       | "fuchsia"
// //       | "slate";
// //   }) => {
// //     const map: Record<string, string> = {
// //       neutral: "bg-white/10 text-white/80 border-white/15",
// //       blue: "bg-blue-500/15 text-blue-200 border-blue-500/25",
// //       emerald: "bg-emerald-500/15 text-emerald-200 border-emerald-500/25",
// //       red: "bg-red-500/15 text-red-200 border-red-500/25",
// //       amber: "bg-amber-500/15 text-amber-200 border-amber-500/25",
// //       fuchsia: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/25",
// //       slate: "bg-slate-500/15 text-slate-200 border-slate-400/25",
// //     };
// //     return (
// //       <span
// //         className={[
// //           "px-3 py-1 rounded-full text-xs font-medium border inline-flex",
// //           map[tone],
// //         ].join(" ")}
// //       >
// //         {children}
// //       </span>
// //     );
// //   };

// //   const priorityTone = (p: ReportItem["priority"]) => {
// //     if (p === "High") return "red";
// //     if (p === "Medium") return "amber";
// //     return "slate";
// //   };

// //   const statusTone = (s: ReportItem["status"]) => {
// //     if (s === "Open") return "fuchsia";
// //     if (s === "Reviewed") return "blue";
// //     if (s === "Dismissed") return "slate";
// //     return "emerald";
// //   };

// //   // ✅ Right panel component
// //  const ReportDetailsPanel = ({
// //   report,
// //   onClose,
// //   onDismiss,
// //   onFlag,
// //   onSuspend,
// // }: {
// //   report: ReportItem;
// //   onClose: () => void;
// //   onDismiss: (id: string) => void;
// //   onFlag: (listingId: string) => void;
// //   onSuspend: (listingId: string) => void;
// // }) => {
// //   return (
// //   <div className="w-full min-w-0 space-y-6">

// //       {/* Header row */}
// //      <div className={`${kpiCardBase} p-4 md:p-6`}>
// //   <div className="flex flex-col gap-4">
// //     {/* Title */}
// //     <div className="text-center md:text-left">
// //       <h1 className="text-[18px] md:text-2xl font-semibold">
// //         Report Details: {report.productTitle || report.title}
// //       </h1>
// //       <div className="mt-2 text-xs md:text-sm text-white/55">
// //         Listing ID: {report.listingId} | Category: {report.category}
// //       </div>
// //     </div>

// //     {/* Action Buttons */}
// //     <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
// //       <button
// //         onClick={() => onDismiss(report.id)}
// //         className="h-10 px-4 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm w-full"
// //       >
// //         Dismiss Report
// //       </button>
// //       <button
// //         onClick={() => onFlag(report.listingId)}
// //         className="h-10 px-4 rounded-xl bg-[#1677FF] hover:opacity-90 text-sm font-medium w-full"
// //       >
// //         Flag Product
// //       </button>
// //       <button
// //         onClick={() => onSuspend(report.listingId)}
// //         className="h-10 px-4 rounded-xl bg-red-500 hover:opacity-90 text-sm font-medium w-full"
// //       >
// //         Suspend Listing
// //       </button>
// //     </div>
// //   </div>
// // </div>

// //       {/* Main 2 columns like image */}
// //       <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
// //         {/* LEFT listing card (bigger) */}
// //         <div className="lg:col-span-3 space-y-5">
// //           <div className={`${kpiCardBase} overflow-hidden`}>
// //             {/* Preview */}
// //             <div className="h-[360px] bg-black/40 relative">
// //               {report.previewImageUrl ? (
// //                 <img
// //                   src={report.previewImageUrl}
// //                   className="absolute inset-0 w-full h-full object-cover"
// //                   alt="preview"
// //                 />
// //               ) : (
// //                 <div className="absolute inset-0 flex items-center justify-center text-white/60">
// //                   No Preview
// //                 </div>
// //               )}
// //             </div>

// //             {/* Listing info */}
// //             <div className="p-6">
// //               <div className="flex items-center justify-between">
// //                 <div className="text-xl font-semibold">
// //                   {report.productTitle || report.title}
// //                 </div>
// //                 <div className="text-sm text-white/60">2.45 ETH</div>
// //               </div>

// //               <div className="mt-3 text-sm text-white/65 leading-relaxed">
// //                 {report.details || "—"}
// //               </div>

// //               <div className="mt-5 flex items-center gap-3">
// //                 <img
// //                   src="https://i.pravatar.cc/60?img=15"
// //                   className="h-11 w-11 rounded-full border border-white/10 object-cover"
// //                   alt="seller"
// //                 />
// //                 <div>
// //                   <div className="text-sm text-white/85">
// //                     Seller: @{(report.sellerName || "Seller").replace(/\s+/g, "")}
// //                   </div>
// //                   <div className="text-xs text-white/50">
// //                     Member since Jan 2022 · 4.9 Rating
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Evidence thumbnails row like image */}
// //           <div>
// //             <div className="text-lg font-semibold mb-3">Review Evidence & Files</div>
// //             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// //               {(report.evidence || [])
// //                 .filter((e) => e.type !== "text")
// //                 .slice(0, 4)
// //                 .map((e, idx) => (
// //                   <div
// //                     key={idx}
// //                     className="h-[120px] rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02]"
// //                   >
// //                     {e.url ? (
// //                       <img
// //                         src={e.url}
// //                         className="w-full h-full object-cover"
// //                         alt="evidence"
// //                       />
// //                     ) : (
// //                       <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
// //                         File
// //                       </div>
// //                     )}
// //                   </div>
// //                 ))}
// //             </div>
// //           </div>
// //         </div>

// //         {/* RIGHT complaint + history like image */}
// //         <div className="lg:col-span-2 space-y-5">
// //           {/* Complaint Information */}
// //           <div className={`${kpiCardBase} p-6`}>
// //             <h2 className="text-xl font-semibold">Complaint Information</h2>

// //             <div className="mt-5">
// //               <div className="text-xs text-white/50 uppercase tracking-wide">
// //                 Reason for Report
// //               </div>
// //               <div className="mt-2 text-sm text-white/80">
// //                 {report.reason}
// //               </div>
// //             </div>

// //             <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
// //               <div className="text-xs text-white/60">Reporter Comments</div>
// //               <div className="mt-2 text-sm text-white/75 leading-relaxed">
// //                 {report.details ||
// //                   "Requesting immediate action based on the reported issue."}
// //               </div>
// //             </div>

// //             <div className="mt-5 flex items-center gap-3">
// //               <img
// //                 src="https://i.pravatar.cc/70?img=33"
// //                 className="h-11 w-11 rounded-full border border-white/10 object-cover"
// //                 alt="reporter"
// //               />
// //               <div>
// //                 <div className="text-sm text-white/85">
// //                   Reported By: {report.reporterName || "Anonymous"}
// //                 </div>
// //                 <div className="text-xs text-white/50">
// //                   Account Standing: Verified Contributor
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Seller report history (table look) */}
// //           <div className={`${kpiCardBase} p-6`}>
// //             <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
// //               Seller Report History
// //             </div>

// //             <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
// //               <div className="grid grid-cols-3 px-4 py-3 text-xs text-white/55 bg-white/[0.03]">
// //                 <div>Date</div>
// //                 <div>Reasons</div>
// //                 <div className="text-right">Action</div>
// //               </div>

// //               <div className="divide-y divide-white/10">
// //                 {(report.history || []).slice(0, 2).map((h, idx) => (
// //                   <div key={idx} className="grid grid-cols-3 px-4 py-4 text-sm bg-white/[0.02]">
// //                     <div className="text-white/70">{formatDate(h.at)}</div>
// //                     <div className="text-white/70">{h.note || h.action}</div>
// //                     <div className="text-right text-white/80">{h.action}</div>
// //                   </div>
// //                 ))}

// //                 {(report.history || []).length === 0 && (
// //                   <div className="px-4 py-4 text-sm text-white/60">
// //                     No previous actions.
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };



// //   // ✅ Reports View (LEFT list + RIGHT panel)
// //   const ReportsView = () => {
// //     const [query, setQuery] = useState("");
// //     const [status, setStatus] = useState<"all" | ReportItem["status"]>("all");
// //     const [priority, setPriority] = useState<"all" | ReportItem["priority"]>(
// //       "all"
// //     );

// //     const filtered = useMemo(() => {
// //       const q = query.trim().toLowerCase();
// //       let list = [...reports];

// //       if (status !== "all") list = list.filter((r) => r.status === status);
// //       if (priority !== "all") list = list.filter((r) => r.priority === priority);

// //       if (q) {
// //         list = list.filter(
// //           (r) =>
// //             r.title.toLowerCase().includes(q) ||
// //             r.listingId.toLowerCase().includes(q) ||
// //             (r.productTitle || "").toLowerCase().includes(q) ||
// //             (r.sellerName || "").toLowerCase().includes(q) ||
// //             (r.reason || "").toLowerCase().includes(q)
// //         );
// //       }

// //       // Open first, then by newest
// //       list.sort((a, b) => {
// //         if (a.status === "Open" && b.status !== "Open") return -1;
// //         if (a.status !== "Open" && b.status === "Open") return 1;
// //         return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
// //       });

// //       return list;
// //     }, [reports, query, status, priority]);

// //     const dismissReport = (id: string) => {
// //       setReports((prev) =>
// //         prev.map((r) =>
// //           r.id === id
// //             ? {
// //                 ...r,
// //                 status: "Dismissed",
// //                 history: [
// //                   ...(r.history || []),
// //                   {
// //                     at: new Date().toISOString(),
// //                     by: adminName,
// //                     action: "Dismissed report",
// //                   },
// //                 ],
// //               }
// //             : r
// //         )
// //       );

// //       // also update selected
// //       setSelectedReport((prev) =>
// //         prev?.id === id ? { ...prev, status: "Dismissed" } : prev
// //       );
// //     };

// //     const flagProduct = (listingId: string) => {
// //       // TODO: call your backend flag endpoint
// //       console.log("Flag listing:", listingId);

// //       setSelectedReport((prev) =>
// //         prev
// //           ? {
// //               ...prev,
// //               status: "Actioned",
// //               history: [
// //                 ...(prev.history || []),
// //                 {
// //                   at: new Date().toISOString(),
// //                   by: adminName,
// //                   action: "Flagged product",
// //                   note: `Listing: ${listingId}`,
// //                 },
// //               ],
// //             }
// //           : prev
// //       );
// //     };

// //     const suspendListing = (listingId: string) => {
// //       // TODO: call your backend suspend endpoint
// //       console.log("Suspend listing:", listingId);

// //       setSelectedReport((prev) =>
// //         prev
// //           ? {
// //               ...prev,
// //               status: "Actioned",
// //               history: [
// //                 ...(prev.history || []),
// //                 {
// //                   at: new Date().toISOString(),
// //                   by: adminName,
// //                   action: "Suspended listing",
// //                   note: `Listing: ${listingId}`,
// //                 },
// //               ],
// //             }
// //           : prev
// //       );
// //     };

// //     return (
// //       <>
// //         {/* Page title */}
// //           <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
// //   <div className="text-center md:text-left">
// //     <div className="flex items-center justify-center md:justify-start gap-3">
// //       <h1 className="text-[24px] md:text-[34px] leading-[1.1] font-semibold">
// //         Reports & Complaints
// //       </h1>
// //       <span className="px-3 py-1 rounded-full text-xs font-medium bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-500/25">
// //         {(reports || []).filter((r) => r.status === "Open").length} Open
// //       </span>
// //     </div>
// //     <p className="mt-2 text-white/60 text-sm">
// //       Review and take action on reported listings and policy violations
// //     </p>
// //   </div>
// // </div>

// //         {/* Filters */}
// //         <section className={`${kpiCardBase} mt-6 p-4`}>
// //           <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
// //             {/* Search */}
// //             <div className="flex-1 relative">
// //               <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
// //               <input
// //                 value={query}
// //                 onChange={(e) => setQuery(e.target.value)}
// //                 className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
// //                 placeholder="Search by report title, listing ID, seller, reason..."
// //               />
// //             </div>

// //             <div className="flex gap-3 flex-wrap justify-start lg:justify-end">
// //               <Select value={status} onValueChange={(v: any) => setStatus(v)}>
// //                 <SelectTrigger className="h-11 w-[160px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
// //                   <SelectValue placeholder="All Status" />
// //                 </SelectTrigger>
// //                 <SelectContent className="max-h-[280px]">
// //                   <SelectItem value="all">All Status</SelectItem>
// //                   <SelectItem value="Open">Open</SelectItem>
// //                   <SelectItem value="Reviewed">Reviewed</SelectItem>
// //                   <SelectItem value="Dismissed">Dismissed</SelectItem>
// //                   <SelectItem value="Actioned">Actioned</SelectItem>
// //                 </SelectContent>
// //               </Select>

// //               <Select
// //                 value={priority}
// //                 onValueChange={(v: any) => setPriority(v)}
// //               >
// //                 <SelectTrigger className="h-11 w-[160px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
// //                   <SelectValue placeholder="All Priority" />
// //                 </SelectTrigger>
// //                 <SelectContent className="max-h-[280px]">
// //                   <SelectItem value="all">All Priority</SelectItem>
// //                   <SelectItem value="High">High</SelectItem>
// //                   <SelectItem value="Medium">Medium</SelectItem>
// //                   <SelectItem value="Low">Low</SelectItem>
// //                 </SelectContent>
// //               </Select>

// //               <button
// //                 onClick={() => {
// //                   setQuery("");
// //                   setStatus("all");
// //                   setPriority("all");
// //                 }}
// //                 className="h-11 px-4 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80 flex items-center gap-2"
// //               >
// //                 <X className="h-4 w-4" />
// //                 Clear
// //               </button>
// //             </div>
// //           </div>
// //         </section>

// //         {/* Left + Right layout */}
// //     {/* ✅ MOBILE: list OR details (full width) */}
// // <div className="block md:hidden mt-6">
// //   {mobileReportsPage === "list" ? (
// //     <ReportsMobileList />
// //   ) : selectedReport ? (
// //     <div className="w-full min-w-0">
// //       {/* ✅ Back */}
// //       <button
// //         onClick={() => setMobileReportsPage("list")}
// //         className="mb-4 text-sm text-white/70 hover:text-white"
// //       >
// //         ← Back to reports
// //       </button>

// //       <ReportDetailsPanel
// //         report={selectedReport}
// //         onClose={() => {
// //           setSelectedReport(null);
// //           setMobileReportsPage("list");
// //         }}
// //         onDismiss={(id) => {
// //           dismissReport(id);
// //           setMobileReportsPage("list");
// //         }}
// //         onFlag={(listingId) => flagProduct(listingId)}
// //         onSuspend={(listingId) => suspendListing(listingId)}
// //       />
// //     </div>
// //   ) : (
// //     <ReportsMobileList />
// //   )}
// // </div>

// // {/* ✅ DESKTOP: keep your existing UI */}
// // <div className="hidden md:block mt-6">
// //   {/* KEEP your current desktop section here */}
// //   <section className="w-full">
// //     <div className="w-full min-w-0">
// //       {!selectedReport ? (
// //         <div className={`${kpiCardBase} p-10 flex items-center justify-center text-white/60`}>
// //           Select a report from the left to view details.
// //         </div>
// //       ) : (
// //         <div className="w-full min-w-0">
// //           <ReportDetailsPanel
// //             report={selectedReport}
// //             onClose={() => setSelectedReport(null)}
// //             onDismiss={dismissReport}
// //             onFlag={flagProduct}
// //             onSuspend={suspendListing}
// //           />
// //         </div>
// //       )}
// //     </div>
// //   </section>
// // </div>


// //       </>
// //     );
// //   };
// // const SellersMobileCards = ({
// //   rows,
// // }: {
// //   rows: SellerRow[];
// // }) => {
// //   return (
// //     <div className="space-y-5">
// //       {rows.map((r) => (
// //         <div key={r.id} className={`${kpiCardBase} p-5`}>
// //           <div className="flex items-start justify-between gap-3">
// //             <div className="flex items-center gap-3 min-w-0">
// //               <img
// //                 src={r.avatar || "https://i.pravatar.cc/80?img=12"}
// //                 className="h-12 w-12 rounded-full object-cover border border-white/10"
// //                 alt={r.name}
// //               />
// //               <div className="min-w-0">
// //                 <div className="text-sm font-semibold text-white/90 truncate">{r.name}</div>
// //                 <div className="text-xs text-white/50 truncate">{r.email}</div>
// //               </div>
// //             </div>

// //             <span
// //               className={[
// //                 "px-4 py-1.5 rounded-full text-xs font-medium border shrink-0",
// //                 r.status === "Active"
// //                   ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
// //                   : "bg-red-500/15 text-red-200 border-red-500/25",
// //               ].join(" ")}
// //             >
// //               {r.status}
// //             </span>
// //           </div>

// //           <div className="mt-5 grid grid-cols-2 gap-4">
// //             <div>
// //               <div className="text-[11px] text-white/45 uppercase tracking-wide">Total Products</div>
// //               <div className="mt-1 text-lg text-white/90">{Number(r.totalProducts || 0)}</div>
// //             </div>
// //             <div className="text-right">
// //               <div className="text-[11px] text-white/45 uppercase tracking-wide">Joined Date</div>
// //               <div className="mt-1 text-sm text-white/80">{formatDate(r.joined)}</div>
// //             </div>
// //           </div>

// //           <div className="mt-5 flex items-center gap-3">
// //             <button
// //               className={[
// //                 "flex-1 h-11 rounded-xl border text-sm font-medium",
// //                 r.status === "Active"
// //                   ? "border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/15"
// //                   : "border-sky-500/25 bg-sky-500/10 text-sky-200 hover:bg-sky-500/15",
// //               ].join(" ")}
// //               onClick={() => console.log("toggle block", r.id)}
// //             >
// //               {r.status === "Active" ? "🚫 Block" : "🔓 Unblocked"}
// //             </button>

// //             <button
// //               className="h-11 w-12 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center"
// //               onClick={() => console.log("delete", r.id)}
// //               aria-label="Delete"
// //             >
// //               🗑
// //             </button>
// //           </div>
// //         </div>
// //       ))}
// //     </div>
// //   );
// // };


// // const SellersView = () => {
// //   const [query, setQuery] = useState("");
// //   const [tab, setTab] = useState<"all" | "active" | "blocked" | "deleted">("all");
// //   const [page, setPage] = useState(1);
// //   const [pageSize, setPageSize] = useState(10);
// //   const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
// //   const [sellerLoading, setSellerLoading] = useState(false);
// //   const [sellerError, setSellerError] = useState<string | null>(null);
// //   const [sellerProducts, setSellerProducts] = useState<PromptProduct[]>([]);

// //   // ✅ Popup state
// //   const [confirmPopup, setConfirmPopup] = useState<{
// //     type: "block" | "unblock" | "delete" | "restore";
// //     seller: SellerRow;
// //   } | null>(null);
// //   const [actionLoading, setActionLoading] = useState(false);
// //   const [actionError, setActionError] = useState<string | null>(null);

// //   // ✅ Block / Unblock API call
// //   const handleBlockToggle = async (seller: SellerRow) => {
// //     const action = seller.status === "Active" ? "block" : "unblock";
// //     try {
// //       setActionLoading(true);
// //       setActionError(null);
// //       const token = getToken();
// //       const res = await fetch(`${SELLERS_BASE}/${seller.id}/block`, {
// //         method: "PATCH",
// //         headers: {
// //           "Content-Type": "application/json",
// //           ...(token ? { Authorization: `Bearer ${token}` } : {}),
// //         },
// //         credentials: "include",
// //         body: JSON.stringify({ action }),
// //       });
// //       const data = await res.json();
// //       if (!res.ok || !data?.success) throw new Error(data?.error || "Failed");

// //       // ✅ Update local state
// //       setSellerRows((prev) =>
// //         prev.map((s) =>
// //           s.id === seller.id
// //             ? { ...s, status: action === "block" ? "Blocked" : "Active" }
// //             : s
// //         )
// //       );
// //       setConfirmPopup(null);
// //     } catch (e: any) {
// //       setActionError(e?.message || "Action failed");
// //     } finally {
// //       setActionLoading(false);
// //     }
// //   };

// //   // ✅ Soft Delete / Restore API call
// //   const handleDeleteToggle = async (seller: SellerRow) => {
// //     const action = seller.isDeleted ? "restore" : "delete";
// //     try {
// //       setActionLoading(true);
// //       setActionError(null);
// //       const token = getToken();
// //       const res = await fetch(`${SELLERS_BASE}/${seller.id}/soft-delete`, {
// //         method: "PATCH",
// //         headers: {
// //           "Content-Type": "application/json",
// //           ...(token ? { Authorization: `Bearer ${token}` } : {}),
// //         },
// //         credentials: "include",
// //         body: JSON.stringify({ action }),
// //       });
// //       const data = await res.json();
// //       if (!res.ok || !data?.success) throw new Error(data?.error || "Failed");

// //       // ✅ Update local state
// //       setSellerRows((prev) =>
// //         prev.map((s) =>
// //           s.id === seller.id
// //             ? {
// //                 ...s,
// //                 isDeleted: action === "delete",
// //                 status: action === "delete" ? "Blocked" : "Active",
// //               }
// //             : s
// //         )
// //       );
// //       setConfirmPopup(null);
// //     } catch (e: any) {
// //       setActionError(e?.message || "Action failed");
// //     } finally {
// //       setActionLoading(false);
// //     }
// //   };

// //   const openSellerProfile = async (sellerId?: string | null) => {
// //     if (!sellerId) return;
// //     try {
// //       setSellerLoading(true);
// //       setSellerError(null);
// //       const token = getToken();
// //       const resSeller = await fetch(`${SELLERS_BASE}/${sellerId}`, {
// //         headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
// //         credentials: "include",
// //       });
// //       const sellerData = await resSeller.json();
// //       if (!resSeller.ok || !sellerData?.success)
// //         throw new Error(sellerData?.error || "Failed to load seller profile");

// //       const resPrompts = await fetch(`${PROMPTS_BASE}/by-seller/${sellerId}`, {
// //         headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
// //         credentials: "include",
// //       });
// //       const promptData = await resPrompts.json();
// //       if (!resPrompts.ok || !promptData?.success)
// //         throw new Error(promptData?.error || "Failed to load seller products");

// //      const s = sellerData.seller;

// // const derivedTotalEarnings = (promptData.prompts || []).reduce((sum: number, doc: any) => {
// //   const price = Number(doc?.price ?? doc?.tokun_price ?? 0);

// //   const sales = Number(
// //     doc?.sales ??
// //     doc?.purchases ??
// //     doc?.totalSales ??
// //     doc?.totalPurchases ??
// //     doc?.salesCount ??
// //     doc?.purchaseCount ??
// //     doc?.orderCount ??
// //     0
// //   );

// //   const revenue = Number(
// //     doc?.revenue ??
// //     doc?.totalRevenue ??
// //     doc?.totalEarning ??
// //     doc?.earnings ??
// //     doc?.cost ??
// //     doc?.totalCost ??
// //     (sales * price) ??
// //     0
// //   );

// //   return sum + (Number.isFinite(revenue) ? revenue : 0);
// // }, 0);

// // setSelectedSeller({
// //   id: String(s?._id || sellerId),
// //   name: s?.name || "Unknown",
// //   email: s?.email,
// //   location: s?.location,
// //   joined: s?.joined,
// //   status: s?.status || "ACTIVE",
// //   avatar: s?.avatar,
// //   verified: !!s?.verified,
// //   totalEarnings:
// //     typeof s?.totalEarnings === "number" && s.totalEarnings > 0
// //       ? s.totalEarnings
// //       : derivedTotalEarnings,
// //   rating: s?.rating ?? 0,
// //   reviewsCount: s?.reviewsCount ?? 0,
// //   refundRate: s?.refundRate ?? 0,
// //   refundThreshold: s?.refundThreshold ?? 5,
// // });

// //       const mapped: PromptProduct[] = (promptData.prompts || []).map((doc: any) => {
// //         const att = doc?.attachment || null;
// //         const status: PromptProduct["status"] =
// //           doc?.flagged ? "Flagged" : doc?.draft ? "Draft" : "Published";
// //         return {
// //           id: String(doc._id),
// //           title: doc?.title || "Untitled",
// //           uploaderName: doc?.userId?.name || "Unknown",
// //           uploaderId:
// //   doc?.userId?._id ||
// //   doc?.uploaderId?._id ||
// //   doc?.uploaderId ||
// //   doc?.sellerId?._id ||
// //   doc?.sellerId ||
// //   null,
// //           price: typeof doc?.price === "number" ? doc.price : 0,
// //           status,
// //           imageUrl: att?.type === "image" ? att?.path : undefined,
// //           videoUrl: att?.type === "video" ? att?.path : undefined,
// //           category: doc?.categories?.[0]?.name || "General",
// //           exclusive: !!doc?.exclusive,
// //           sold: !!doc?.sold,
// //         };
// //       });
// //       setSellerProducts(mapped);
// //     } catch (e: any) {
// //       setSellerError(e?.message || "Error loading seller profile");
// //     } finally {
// //       setSellerLoading(false);
// //     }
// //   };

// //   const closeSellerProfile = () => {
// //     setSelectedSeller(null);
// //     setSellerProducts([]);
// //     setSellerError(null);
// //   };

// //   const filtered = useMemo(() => {
// //     const q = query.trim().toLowerCase();
// //     let list = [...sellerRows];

// //     if (tab === "active") list = list.filter((s) => s.status === "Active" && !s.isDeleted);
// //     else if (tab === "blocked") list = list.filter((s) => s.status === "Blocked" && !s.isDeleted);
// //     else if (tab === "deleted") list = list.filter((s) => !!s.isDeleted);
// //     else list = list.filter((s) => !s.isDeleted); // "all" = non-deleted

// //     if (q) {
// //       list = list.filter(
// //         (s) =>
// //           s.name.toLowerCase().includes(q) ||
// //           s.email.toLowerCase().includes(q)
// //       );
// //     }
// //     return list;
// //   }, [sellerRows, query, tab]);

// //   const total = filtered.length;
// //   const totalPages = Math.max(1, Math.ceil(total / pageSize));
// //   const safePage = Math.min(page, totalPages);
// //   const startIndex = (safePage - 1) * pageSize;
// //   const endIndex = Math.min(startIndex + pageSize, total);
// //   const pageRows = filtered.slice(startIndex, endIndex);

// //   useEffect(() => { setPage(1); }, [query, tab, pageSize]);

// //   if (selectedSeller) {
// //     return (
// //       <SellerProfileView
// //         seller={selectedSeller}
// //         products={sellerProducts}
// //         loading={sellerLoading}
// //         error={sellerError}
// //         onBack={closeSellerProfile}
// //       />
// //     );
// //   }

// //   // ✅ Popup labels helper
// //   const popupConfig = confirmPopup
// //     ? {
// //         block: {
// //           title: "Block Seller?",
// //           desc: `Are you sure you want to block "${confirmPopup.seller.name}"? They won't be able to sell on the platform.`,
// //           confirmLabel: "Yes, Block",
// //           confirmClass: "bg-red-500 hover:opacity-90",
// //         },
// //         unblock: {
// //           title: "Unblock Seller?",
// //           desc: `Are you sure you want to unblock "${confirmPopup.seller.name}"? They will regain access to sell.`,
// //           confirmLabel: "Yes, Unblock",
// //           confirmClass: "bg-emerald-500 hover:opacity-90",
// //         },
// //         delete: {
// //           title: "Delete Seller?",
// //           desc: `Are you sure you want to delete "${confirmPopup.seller.name}"? This is a soft delete — you can restore them later.`,
// //           confirmLabel: "Yes, Delete",
// //           confirmClass: "bg-red-500 hover:opacity-90",
// //         },
// //         restore: {
// //           title: "Restore Seller?",
// //           desc: `Are you sure you want to restore "${confirmPopup.seller.name}"? They will be moved back to Active sellers.`,
// //           confirmLabel: "Yes, Restore",
// //           confirmClass: "bg-emerald-500 hover:opacity-90",
// //         },
// //       }[confirmPopup.type]
// //     : null;

// //   return (
// //     <>
// //       {/* ✅ CONFIRM POPUP */}
// //       {confirmPopup && popupConfig && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
// //           <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0F1117] p-6 shadow-2xl">
// //             <h2 className="text-lg font-semibold text-white">{popupConfig.title}</h2>
// //             <p className="mt-3 text-sm text-white/65 leading-relaxed">{popupConfig.desc}</p>

// //             {actionError && (
// //               <div className="mt-3 text-xs text-red-400">{actionError}</div>
// //             )}

// //             <div className="mt-6 flex gap-3">
// //               <button
// //                 onClick={() => { setConfirmPopup(null); setActionError(null); }}
// //                 className="flex-1 h-11 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-sm text-white/80"
// //                 disabled={actionLoading}
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={() => {
// //                   if (confirmPopup.type === "block" || confirmPopup.type === "unblock") {
// //                     handleBlockToggle(confirmPopup.seller);
// //                   } else {
// //                     handleDeleteToggle(confirmPopup.seller);
// //                   }
// //                 }}
// //                 className={`flex-1 h-11 rounded-xl text-sm font-medium text-white ${popupConfig.confirmClass} disabled:opacity-60`}
// //                 disabled={actionLoading}
// //               >
// //                 {actionLoading ? "Please wait…" : popupConfig.confirmLabel}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Header */}
// //       <div className="mt-2 md:mt-0">
// //         <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-4 md:gap-6">
// //           <div className="text-center md:text-left w-full">
// //             <h1 className="text-[24px] md:text-[34px] leading-[1.05] font-semibold">
// //               Seller Management
// //             </h1>
// //             <p className="mt-1 text-white/60 text-sm text-center md:text-left">
// //               Manage and monitor digital product sellers on the platform
// //             </p>
// //             <div className="flex gap-3 mt-4 justify-center md:justify-start">
// //               <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-200 border border-blue-500/25">
// //                 {filtered.length.toLocaleString()} Sellers
// //               </span>
// //               <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-200 border border-emerald-500/25">
// //                 {products.length.toLocaleString()} Products
// //               </span>
// //             </div>
// //           </div>
// //           <div className="hidden md:block" />
// //           <div className="flex justify-center md:justify-end w-full">
// //             <button className="h-9 sm:h-10 px-5 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90">
// //               <Plus className="h-4 w-4" />
// //               Add Member
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Search + Tabs */}
// //       <section className={`${kpiCardBase} mt-6 p-4`}>
// //         <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
// //           <div className="flex-1 relative">
// //             <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
// //             <input
// //               value={query}
// //               onChange={(e) => setQuery(e.target.value)}
// //               className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
// //               placeholder="Search sellers by name or email..."
// //             />
// //           </div>

// //           {/* ✅ Tabs — All / Active / Blocked / Deleted */}
// //           <div className="overflow-x-auto">
// //             <div className="h-11 p-1 rounded-xl border border-white/10 bg-white/[0.03] flex items-center gap-1 w-max">
// //               {(["all", "active", "blocked", "deleted"] as const).map((t) => (
// //                 <button
// //                   key={t}
// //                   onClick={() => setTab(t)}
// //                   className={[
// //                     "h-9 px-4 rounded-lg text-sm capitalize whitespace-nowrap",
// //                     tab === t
// //                       ? t === "deleted"
// //                         ? "bg-red-500/20 text-red-200 border border-red-500/25"
// //                         : "bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] text-white"
// //                       : "text-white/70 hover:text-white",
// //                   ].join(" ")}
// //                 >
// //                   {t === "all" ? "All Sellers" : t === "deleted" ? "🗑 Deleted" : t.charAt(0).toUpperCase() + t.slice(1)}
// //                 </button>
// //               ))}
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* ✅ MOBILE: Cards */}
// //       <div className="md:hidden mt-6">
// //         {sellersLoading && <div className="text-white/70 text-sm">Loading sellers…</div>}
// //         {!!sellersError && !sellersLoading && <div className="text-red-400 text-sm">{sellersError}</div>}
// //         {!sellersLoading && !sellersError && (
// //           <div className="space-y-5">
// //             {pageRows.map((r) => (
// //               <div key={r.id} className={`${kpiCardBase} p-5`}>
// //                 <div className="flex items-start justify-between gap-3">
// //                   <div className="flex items-center gap-3 min-w-0">
// //                     <img
// //                       src={r.avatar || "https://i.pravatar.cc/80?img=12"}
// //                       className="h-12 w-12 rounded-full object-cover border border-white/10"
// //                       alt={r.name}
// //                     />
// //                     <div className="min-w-0">
// //   <button
// //     type="button"
// //     onClick={() => openSellerProfile(r.id)}
// //     className="text-sm font-semibold text-white/90 truncate hover:text-sky-400 text-left block w-full"
// //   >
// //     {r.name}
// //   </button>
// //   <div className="text-xs text-white/50 truncate">{r.email}</div>
// // </div>
// //                   </div>
// //                   <span className={[
// //                     "px-3 py-1 rounded-full text-xs font-medium border shrink-0",
// //                     r.isDeleted
// //                       ? "bg-red-500/15 text-red-300 border-red-500/25"
// //                       : r.status === "Active"
// //                       ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
// //                       : "bg-red-500/15 text-red-200 border-red-500/25",
// //                   ].join(" ")}>
// //                     {r.isDeleted ? "Deleted" : r.status}
// //                   </span>
// //                 </div>

// //                 <div className="mt-4 grid grid-cols-2 gap-3 text-center">
// //                   <div>
// //                     <div className="text-[11px] text-white/45 uppercase tracking-wide">Products</div>
// //                     <div className="mt-1 text-base text-white/90">{Number(r.totalProducts || 0)}</div>
// //                   </div>
// //                   <div>
// //                     <div className="text-[11px] text-white/45 uppercase tracking-wide">Joined</div>
// //                     <div className="mt-1 text-sm text-white/80">{formatDate(r.joined)}</div>
// //                   </div>
// //                 </div>

// //                 <div className="mt-4 flex gap-2">
// //                   {/* Block / Unblock */}
// //                   {!r.isDeleted && (
// //                     <button
// //                       onClick={() => setConfirmPopup({
// //                         type: r.status === "Active" ? "block" : "unblock",
// //                         seller: r,
// //                       })}
// //                       className={[
// //                         "flex-1 h-10 rounded-xl border text-xs font-medium",
// //                         r.status === "Active"
// //                           ? "border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/15"
// //                           : "border-sky-500/25 bg-sky-500/10 text-sky-200 hover:bg-sky-500/15",
// //                       ].join(" ")}
// //                     >
// //                       {r.status === "Active" ? "🚫 Block" : "✅ Unblock"}
// //                     </button>
// //                   )}

// //                   {/* Delete / Restore */}
// //                   <button
// //                     onClick={() => setConfirmPopup({
// //                       type: r.isDeleted ? "restore" : "delete",
// //                       seller: r,
// //                     })}
// //                     className={[
// //                       "flex-1 h-10 rounded-xl border text-xs font-medium",
// //                       r.isDeleted
// //                         ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
// //                         : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]",
// //                     ].join(" ")}
// //                   >
// //                     {r.isDeleted ? "↩ Restore" : "🗑 Delete"}
// //                   </button>
// //                 </div>
// //               </div>
// //             ))}
// //             {pageRows.length === 0 && (
// //               <div className="text-white/60 text-sm text-center py-8">No sellers found.</div>
// //             )}
// //           </div>
// //         )}

// //         {/* Mobile Pagination */}
// //         <div className="mt-6 flex items-center justify-between">
// //           <button
// //             disabled={safePage <= 1}
// //             onClick={() => setPage((p) => Math.max(1, p - 1))}
// //             className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40 text-sm"
// //           >
// //             Previous
// //           </button>
// //           <div className="text-xs text-white/60">Page {safePage} / {totalPages}</div>
// //           <button
// //             disabled={safePage >= totalPages}
// //             onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
// //             className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40 text-sm"
// //           >
// //             Next
// //           </button>
// //         </div>
// //       </div>

// //       {/* ✅ DESKTOP: Table */}
// //       <div className="hidden md:block">
// //         <section className={`${kpiCardBase} mt-6 p-6`}>
// //           {sellersLoading && <div className="p-6 text-white/70 text-sm">Loading sellers…</div>}
// //           {!!sellersError && !sellersLoading && <div className="p-6 text-red-400 text-sm">{sellersError}</div>}

// //           {!sellersLoading && !sellersError && (
// //             <>
// //               <div className="overflow-hidden rounded-2xl border border-white/10">
// //                 <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
// //                   <div className="col-span-4">Seller Name</div>
// //                   <div className="col-span-2">Status</div>
// //                   <div className="col-span-2">Volume</div>
// //                   <div className="col-span-3">Joined Date</div>
// //                   <div className="col-span-1 text-right">Actions</div>
// //                 </div>

// //                 <div className="divide-y divide-white/10">
// //                   {pageRows.map((r) => (
// //                     <div
// //                       key={r.id}
// //                       className={[
// //                         "grid grid-cols-12 gap-3 px-5 py-5 items-center",
// //                         r.isDeleted ? "bg-red-500/[0.04]" : "bg-white/[0.02]",
// //                       ].join(" ")}
// //                     >
// //                       <div className="col-span-4 flex items-center gap-4 min-w-0">
// //                         <img
// //                           src={r.avatar || "https://i.pravatar.cc/80?img=12"}
// //                           alt={r.name}
// //                           className={[
// //                             "h-12 w-12 rounded-full object-cover border border-white/10",
// //                             r.isDeleted ? "opacity-50" : "",
// //                           ].join(" ")}
// //                         />
// //                         <div className="min-w-0">
// //                           <button
// //                             onClick={() => openSellerProfile(r.id)}
// //                             className="text-sm font-medium text-white/90 truncate hover:text-sky-400 focus:outline-none"
// //                           >
// //                             {r.name}
// //                           </button>
// //                           <div className="text-xs text-white/45 truncate">{r.email}</div>
// //                         </div>
// //                       </div>

// //                       <div className="col-span-2">
// //                         <span className={[
// //                           "px-3 py-1.5 rounded-full text-xs font-medium border inline-flex",
// //                           r.isDeleted
// //                             ? "bg-red-500/15 text-red-300 border-red-500/25"
// //                             : r.status === "Active"
// //                             ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
// //                             : "bg-red-500/15 text-red-200 border-red-500/25",
// //                         ].join(" ")}>
// //                           {r.isDeleted ? "Deleted" : r.status}
// //                         </span>
// //                       </div>

// //                       <div className="col-span-2 text-sm text-white/80 font-medium">
// //                         ₹{Number(r.volume ?? 0).toLocaleString("en-IN")}
// //                       </div>

// //                       <div className="col-span-3 text-sm text-white/75">
// //                         {formatDate(r.joined)}
// //                       </div>

// //                       <div className="col-span-1 flex justify-end items-center gap-3">
// //                         {/* Block / Unblock */}
// //                         {!r.isDeleted && (
// //                           <button
// //                             onClick={() => setConfirmPopup({
// //                               type: r.status === "Active" ? "block" : "unblock",
// //                               seller: r,
// //                             })}
// //                             className={[
// //                               "text-xs font-medium",
// //                               r.status === "Active"
// //                                 ? "text-red-400 hover:text-red-300"
// //                                 : "text-sky-400 hover:text-sky-300",
// //                             ].join(" ")}
// //                           >
// //                             {r.status === "Active" ? "Block" : "Unblock"}
// //                           </button>
// //                         )}

// //                         {/* Delete / Restore */}
// //                         <button
// //                           onClick={() => setConfirmPopup({
// //                             type: r.isDeleted ? "restore" : "delete",
// //                             seller: r,
// //                           })}
// //                           className={[
// //                             "text-xs font-medium",
// //                             r.isDeleted
// //                               ? "text-emerald-400 hover:text-emerald-300"
// //                               : "text-white/50 hover:text-white/80",
// //                           ].join(" ")}
// //                         >
// //                           {r.isDeleted ? "Restore" : "🗑"}
// //                         </button>
// //                       </div>
// //                     </div>
// //                   ))}

// //                   {pageRows.length === 0 && (
// //                     <div className="p-6 text-white/60 text-sm">No sellers found.</div>
// //                   )}
// //                 </div>
// //               </div>

// //               {/* Pagination */}
// //               <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
// //                 <div className="text-sm text-white/60">
// //                   Showing {total === 0 ? 0 : startIndex + 1} to {endIndex} of {total} sellers
// //                 </div>
// //                 <div className="flex items-center gap-2">
// //                   <button
// //                     disabled={safePage <= 1}
// //                     onClick={() => setPage((p) => Math.max(1, p - 1))}
// //                     className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40"
// //                   >
// //                     Previous
// //                   </button>
// //                   {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
// //                     const p = i + 1;
// //                     return (
// //                       <button
// //                         key={p}
// //                         onClick={() => setPage(p)}
// //                         className={[
// //                           "h-9 w-9 rounded-lg border border-white/10",
// //                           safePage === p
// //                             ? "bg-white/15 text-white"
// //                             : "bg-white/[0.04] hover:bg-white/[0.06] text-white/80",
// //                         ].join(" ")}
// //                       >
// //                         {p}
// //                       </button>
// //                     );
// //                   })}
// //                   <button
// //                     disabled={safePage >= totalPages}
// //                     onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
// //                     className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40"
// //                   >
// //                     Next
// //                   </button>
// //                 </div>
// //                 <div className="flex items-center gap-3 justify-end">
// //                   <div className="text-sm text-white/60">Show per page</div>
// //                   <select
// //                     value={pageSize}
// //                     onChange={(e) => setPageSize(Number(e.target.value))}
// //                     className="h-9 px-3 rounded-lg bg-black/30 border border-white/10 text-white"
// //                   >
// //                     {[10, 20, 50, 100].map((n) => (
// //                       <option key={n} value={n}>{n}</option>
// //                     ))}
// //                   </select>
// //                 </div>
// //               </div>
// //             </>
// //           )}
// //         </section>
// //       </div>
// //     </>
// //   );
// // };

 
// // const ProductsView = () => {
// //   const [query, setQuery] = useState("");
// //   const [selectedCategory, setSelectedCategory] = useState<string>("all");
// //   const [statusFilter, setStatusFilter] = useState<string>("all");
// //   const [priceFilter, setPriceFilter] = useState<string>("all");
// //   const [sortFilter, setSortFilter] = useState<string>("none");
// //   const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
// //   const [sellerLoading, setSellerLoading] = useState(false);
// //   const [sellerError, setSellerError] = useState<string | null>(null);
// //   const [sellerProducts, setSellerProducts] = useState<PromptProduct[]>([]);

// //   // ✅ PAGINATION STATE
// //   const [page, setPage] = useState(1);
// //   const [pageSize] = useState(10);

// //   // ... openSellerProfile, closeSellerProfile same rahega ...

// //   const resetFilters = () => {
// //     setQuery("");
// //     setSelectedCategory("all");
// //     setStatusFilter("all");
// //     setPriceFilter("all");
// //     setSortFilter("none");
// //     setPage(1); // ✅ reset page on filter clear
// //   };

// //   const matchesPrice = (price: number) => {
// //     if (priceFilter === "all") return true;
// //     if (priceFilter === "free") return price === 0;
// //     if (priceFilter === "paid") return price > 0;
// //     if (priceFilter === "0-5") return price >= 0 && price <= 5;
// //     if (priceFilter === "5-10") return price > 5 && price <= 10;
// //     if (priceFilter === "10-20") return price > 10 && price <= 20;
// //     if (priceFilter === "20+") return price > 20;
// //     return true;
// //   };

// //   const filtered = useMemo(() => {
// //     const q = query.trim().toLowerCase();
// //     let list = [...products];

// //     if (q) {
// //       list = list.filter(
// //         (p) =>
// //           p.title.toLowerCase().includes(q) ||
// //           p.uploaderName.toLowerCase().includes(q) ||
// //           (p.category || "").toLowerCase().includes(q)
// //       );
// //     }
// //     if (selectedCategory !== "all") {
// //       const cat = selectedCategory.toLowerCase();
// //       list = list.filter((p) => (p.category || "").toLowerCase().includes(cat));
// //     }
// //     if (statusFilter !== "all") {
// //       list = list.filter((p) => p.status === statusFilter);
// //     }
// //     list = list.filter((p) => matchesPrice(p.price));
// //     if (sortFilter === "price_desc") {
// //       list.sort((a, b) => (b.price || 0) - (a.price || 0));
// //     } else if (sortFilter === "price_asc") {
// //       list.sort((a, b) => (a.price || 0) - (b.price || 0));
// //     }
// //     return list;
// //   }, [products, query, selectedCategory, statusFilter, priceFilter, sortFilter]);

// //   // ✅ Reset page when filters change
// //   useEffect(() => {
// //     setPage(1);
// //   }, [query, selectedCategory, statusFilter, priceFilter, sortFilter]);

// //   // ✅ PAGINATION CALCULATION
// //   const total = filtered.length;
// //   const totalPages = Math.max(1, Math.ceil(total / pageSize));
// //   const safePage = Math.min(page, totalPages);
// //   const startIndex = (safePage - 1) * pageSize;
// //   const endIndex = Math.min(startIndex + pageSize, total);
// //   const pageProducts = filtered.slice(startIndex, endIndex); // ✅ sirf 10


// // const openSellerProfile = async (sellerId?: string | null) => {
// //   if (!sellerId) return;

// //   try {
// //     setSellerLoading(true);
// //     setSellerError(null);

// //     const token = getToken();

// //     const resSeller = await fetch(`${SELLERS_BASE}/${sellerId}`, {
// //       headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
// //       credentials: "include",
// //     });
// //     const sellerData = await resSeller.json();

// //     if (!resSeller.ok || !sellerData?.success) {
// //       throw new Error(sellerData?.error || "Failed to load seller profile");
// //     }

// //     const resPrompts = await fetch(`${PROMPTS_BASE}/by-seller/${sellerId}`, {
// //       headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
// //       credentials: "include",
// //     });
// //     const promptData = await resPrompts.json();

// //     if (!resPrompts.ok || !promptData?.success) {
// //       throw new Error(promptData?.error || "Failed to load seller products");
// //     }

// //     const s = sellerData.seller;

// //     const derivedTotalEarnings = (promptData.prompts || []).reduce((sum: number, doc: any) => {
// //       const price = Number(doc?.price ?? doc?.tokun_price ?? 0);

// //       const sales = Number(
// //         doc?.sales ??
// //         doc?.purchases ??
// //         doc?.totalSales ??
// //         doc?.totalPurchases ??
// //         doc?.salesCount ??
// //         doc?.purchaseCount ??
// //         doc?.orderCount ??
// //         0
// //       );

// //       const revenue = Number(
// //         doc?.revenue ??
// //         doc?.totalRevenue ??
// //         doc?.totalEarning ??
// //         doc?.earnings ??
// //         doc?.cost ??
// //         doc?.totalCost ??
// //         (sales * price) ??
// //         0
// //       );

// //       return sum + (Number.isFinite(revenue) ? revenue : 0);
// //     }, 0);

// //     setSelectedSeller({
// //       id: String(s?._id || sellerId),
// //       name: s?.name || "Unknown",
// //       email: s?.email,
// //       location: s?.location,
// //       joined: s?.joined,
// //       status: s?.status || "ACTIVE",
// //       avatar: s?.avatar,
// //       verified: !!s?.verified,
// //       totalEarnings:
// //         typeof s?.totalEarnings === "number" && s.totalEarnings > 0
// //           ? s.totalEarnings
// //           : derivedTotalEarnings,
// //       rating: s?.rating ?? 0,
// //       reviewsCount: s?.reviewsCount ?? 0,
// //       refundRate: s?.refundRate ?? 0,
// //       refundThreshold: s?.refundThreshold ?? 5,
// //     });

// //     const mapped: PromptProduct[] = (promptData.prompts || []).map((doc: any) => {
// //       const att = doc?.attachment || null;
// //       const status: PromptProduct["status"] =
// //         doc?.flagged ? "Flagged" : doc?.draft ? "Draft" : "Published";

// //       return {
// //         id: String(doc._id),
// //         title: doc?.title || "Untitled",
// //         uploaderName: doc?.userId?.name || "Unknown",
// //         uploaderId:
// //           doc?.userId?._id ||
// //           doc?.uploaderId?._id ||
// //           doc?.uploaderId ||
// //           doc?.sellerId?._id ||
// //           doc?.sellerId ||
// //           null,
// //         price: typeof doc?.price === "number" ? doc.price : 0,
// //         status,
// //         imageUrl: att?.type === "image" ? att?.path : undefined,
// //         videoUrl: att?.type === "video" ? att?.path : undefined,
// //         category: doc?.categories?.[0]?.name || "General",
// //         exclusive: !!doc?.exclusive,
// //         sold: !!doc?.sold,
// //       };
// //     });

// //     setSellerProducts(mapped);
// //   } catch (e: any) {
// //     setSellerError(e?.message || "Error loading seller profile");
// //   } finally {
// //     setSellerLoading(false);
// //   }
// // };

// // const closeSellerProfile = () => {
// //   setSelectedSeller(null);
// //   setSellerProducts([]);
// //   setSellerError(null);
// // };



// //   if (selectedSeller) {
// //     return (
// //       <SellerProfileView
// //         seller={selectedSeller}
// //         products={sellerProducts}
// //         loading={sellerLoading}
// //         error={sellerError}
// //         onBack={closeSellerProfile}
// //       />
// //     );
// //   }

// //   return (
// //     <>
// //       {/* Header — same rahega */}
// //       <div className="mt-2 md:mt-0">
// //         <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-4 md:gap-6">
// //           <div className="text-center md:text-left w-full">
// //             <h1 className="text-[24px] md:text-[34px] leading-[1.05] font-semibold">
// //               Product Management
// //             </h1>
// //             <p className="mt-1 text-white/60 text-sm">
// //               Manage and monitor digital products on the platform
// //             </p>
// //           </div>
// //           <div className="hidden md:block" />
// //           <div className="flex justify-center md:justify-end w-full">
// //             <button className="h-9 sm:h-10 px-5 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90">
// //               <Plus className="h-4 w-4" />
// //               Add Product
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       {/* KPI — same rahega */}
// //       <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
// //         <div className={`${kpiCardBase} p-6`}>
// //           <div className="text-xs tracking-[0.2em] text-white/60">TOTAL LISTING</div>
// //           <div className="mt-4 text-3xl font-semibold">{products.length}</div>
// //           <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
// //             <TrendingUp className="h-4 w-4" />
// //             Live from marketplace
// //           </div>
// //         </div>
// //         <div className={`${kpiCardBase} p-6`}>
// //           <div className="text-xs tracking-[0.2em] text-white/60">FLAGGED PRODUCT</div>
// //           <div className="mt-4 text-3xl font-semibold">
// //             {products.filter((p) => p.status === "Flagged").length}
// //           </div>
// //           <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
// //             <TriangleAlert className="h-4 w-4" />
// //             High Priority
// //           </div>
// //         </div>
// //       </section>

// //       {/* Search + Filters — same rahega */}
// //       <section className={`${kpiCardBase} mt-6 p-4`}>
// //         <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
// //           <div className="flex-1 relative">
// //             <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
// //             <input
// //               value={query}
// //               onChange={(e) => setQuery(e.target.value)}
// //               className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
// //               placeholder="Search products by name, seller, category..."
// //             />
// //           </div>
// //           <div className="flex flex-wrap gap-3 justify-start lg:justify-end">
// //             <Select value={selectedCategory} onValueChange={setSelectedCategory}>
// //               <SelectTrigger className="h-11 w-[170px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
// //                 <SelectValue placeholder={catsLoading ? "Loading..." : "All Categories"} />
// //               </SelectTrigger>
// //               <SelectContent className="max-h-[280px]">
// //                 <SelectItem value="all">All Categories</SelectItem>
// //                 {(categories || []).map((c) => (
// //                   <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
// //                 ))}
// //               </SelectContent>
// //             </Select>

// //             <Select value={priceFilter} onValueChange={setPriceFilter}>
// //               <SelectTrigger className="h-11 w-[160px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
// //                 <SelectValue placeholder="Price Range" />
// //               </SelectTrigger>
// //               <SelectContent className="max-h-[280px]">
// //                 <SelectItem value="all">All Prices</SelectItem>
// //                 <SelectItem value="free">Free</SelectItem>
// //                 <SelectItem value="paid">Paid</SelectItem>
// //                 <SelectItem value="0-5">₹0 - ₹5</SelectItem>
// //                 <SelectItem value="5-10">₹5 - ₹10</SelectItem>
// //                 <SelectItem value="10-20">₹10 - ₹20</SelectItem>
// //                 <SelectItem value="20+">₹20+</SelectItem>
// //               </SelectContent>
// //             </Select>

// //             <Select value={statusFilter} onValueChange={setStatusFilter}>
// //               <SelectTrigger className="h-11 w-[150px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
// //                 <SelectValue placeholder="All Status" />
// //               </SelectTrigger>
// //               <SelectContent className="max-h-[280px]">
// //                 <SelectItem value="all">All Status</SelectItem>
// //                 <SelectItem value="Published">Published</SelectItem>
// //                 <SelectItem value="Draft">Draft</SelectItem>
// //                 <SelectItem value="Flagged">Flagged</SelectItem>
// //               </SelectContent>
// //             </Select>

// //             <Select value={sortFilter} onValueChange={setSortFilter}>
// //               <SelectTrigger className="h-11 w-[190px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
// //                 <SelectValue placeholder="Sort By Price" />
// //               </SelectTrigger>
// //               <SelectContent className="max-h-[280px]">
// //                 <SelectItem value="none">No Sorting</SelectItem>
// //                 <SelectItem value="price_desc">Price: High → Low</SelectItem>
// //                 <SelectItem value="price_asc">Price: Low → High</SelectItem>
// //               </SelectContent>
// //             </Select>

// //             <button
// //               onClick={resetFilters}
// //               className="h-11 px-4 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80 flex items-center gap-2"
// //             >
// //               <X className="h-4 w-4" />
// //               Clear
// //             </button>
// //           </div>
// //         </div>
// //         {catsError && (
// //           <div className="mt-3 text-xs text-red-400">Category load failed: {catsError}</div>
// //         )}
// //       </section>

// //       {/* Loading / Error */}
// //       {productsLoading && (
// //         <div className="mt-6 text-white/70 text-sm">Loading products…</div>
// //       )}
// //       {!!productsError && !productsLoading && (
// //         <div className="mt-6 text-red-400 text-sm">{productsError}</div>
// //       )}

// //       {/* ✅ Products Grid — pageProducts use karo filtered ki jagah */}
// //       {!productsLoading && !productsError && (
// //         <>
// //           <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
// //             {pageProducts.map((p) => {
// //               const hasImage = !!p.imageUrl;
// //               const hasVideo = !!p.videoUrl;

// //               return (
// //                 <div
// //                   key={p.id}
// //                   className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
// //                 >
// //                   <div className="relative h-[230px] bg-black/40">
// //                     {hasImage ? (
// //   <img
// //     src={p.imageUrl}
// //     alt={p.title}
// //     className="absolute inset-0 w-full h-full object-cover"
// //   />
// // ) : hasVideo ? (
// //   <video
// //     src={p.videoUrl}
// //     className="absolute inset-0 w-full h-full object-cover"
// //     controls
// //     muted
// //     playsInline
// //     preload="metadata"
// //   />
// // ) : (
// //   <div className="absolute inset-0 w-full h-full flex items-center justify-center">
// //     <div className="flex items-center gap-2 text-white/60 text-sm">
// //       <ImageIcon className="h-5 w-5" />
// //       No Preview
// //     </div>
// //   </div>
// // )}

// //                     <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-sky-500/15 text-sky-200 border border-sky-500/25">
// //                       {p.status}
// //                     </span>

// //                     {p.exclusive && (
// //                       <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-200 border border-emerald-500/25">
// //                         ONE-TIME{p.sold ? " • SOLD" : ""}
// //                       </span>
// //                     )}
// //                   </div>

// //                   <div className="bg-[#111827] text-white p-4">
// //                     <div className="text-[13px] font-semibold leading-snug truncate text-white/90">
// //                       {p.title}
// //                     </div>
// //                     <div className="mt-2 text-[12px] text-white/60 truncate">
// //                       by{" "}
// //                     <button
// //   type="button"
// //   onClick={() => {
// //     console.log("SELLER CLICK", p.uploaderId, p);
// //     openSellerProfile(p.uploaderId);
// //   }}
// //   className="text-sky-300 hover:underline font-medium"
// // >
// //   {p.uploaderName}
// // </button>
// //                       {p.category ? ` • ${p.category}` : ""}
// //                     </div>
// //                     <div className="mt-3 flex items-center justify-between">
// //                       <div className="text-sm font-semibold text-white">
// //                         {p.price > 0 ? `₹${p.price.toFixed(2)}` : "FREE"}
// //                       </div>
// //                       <div className="text-xs text-white/45">
// //                         ID: {p.id.slice(-6)}
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>
// //               );
// //             })}

// //             {pageProducts.length === 0 && (
// //               <div className="col-span-full text-center text-white/70 py-10">
// //                 No products found.
// //               </div>
// //             )}
// //           </section>

// //           {/* ✅ PAGINATION — seller wale jaisa */}
// //           {total > 0 && (
// //             <div className="mt-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
// //               {/* Showing count */}
// //               <div className="text-sm text-white/60">
// //                 Showing {total === 0 ? 0 : startIndex + 1} to {endIndex} of {total} products
// //               </div>

// //               {/* Page buttons */}
// //               <div className="flex items-center gap-2">
// //                 <button
// //                   disabled={safePage <= 1}
// //                   onClick={() => setPage((p) => Math.max(1, p - 1))}
// //                   className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40 text-sm text-white/80"
// //                 >
// //                   Previous
// //                 </button>

// //                 {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
// //                   const p = i + 1;
// //                   return (
// //                     <button
// //                       key={p}
// //                       onClick={() => setPage(p)}
// //                       className={[
// //                         "h-9 w-9 rounded-lg border border-white/10 text-sm",
// //                         safePage === p
// //                           ? "bg-white/15 text-white"
// //                           : "bg-white/[0.04] hover:bg-white/[0.06] text-white/80",
// //                       ].join(" ")}
// //                     >
// //                       {p}
// //                     </button>
// //                   );
// //                 })}

// //                 <button
// //                   disabled={safePage >= totalPages}
// //                   onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
// //                   className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40 text-sm text-white/80"
// //                 >
// //                   Next
// //                 </button>
// //               </div>

// //               {/* Mobile: simple prev/next only */}
// //               <div className="flex md:hidden items-center justify-between w-full">
// //                 <button
// //                   disabled={safePage <= 1}
// //                   onClick={() => setPage((p) => Math.max(1, p - 1))}
// //                   className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] disabled:opacity-40 text-sm text-white/80"
// //                 >
// //                   Previous
// //                 </button>
// //                 <span className="text-xs text-white/60">
// //                   Page {safePage} / {totalPages}
// //                 </span>
// //                 <button
// //                   disabled={safePage >= totalPages}
// //                   onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
// //                   className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] disabled:opacity-40 text-sm text-white/80"
// //                 >
// //                   Next
// //                 </button>
// //               </div>
// //             </div>
// //           )}
// //         </>
// //       )}
// //     </>
// //   );
// // };

// // const formatMonthYear = (dateLike?: string) => {
// //   if (!dateLike) return "—";
// //   const d = new Date(dateLike);
// //   if (Number.isNaN(d.getTime())) return "—";
// //   return d.toLocaleString("en-US", { month: "long", year: "numeric" });
// // };



// // const SellerProfileView = ({
// //   seller,
// //   products,
// //   loading,
// //   error,
// //   onBack,
// // }: {
// //   seller: SellerProfile;
// //   products: PromptProduct[];
// //   loading: boolean;
// //   error: string | null;
// //   onBack: () => void;
// // }) => {
// //   return (
// //     <>
// //       {/* Title */}
// //      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
// //   <div className="text-center md:text-left">
// //     <button
// //       onClick={onBack}
// //       className="text-sm text-white/60 hover:text-white/90"
// //     >
// //       ← Back to Products
// //     </button>
// //     <h1 className="mt-2 text-[24px] md:text-[34px] leading-[1.1] font-semibold">
// //       Seller Profile
// //     </h1>
// //   </div>
// // </div>

// //       {/* Top profile card */}
// //       <div className={`${kpiCardBase} mt-6 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5`}>
// //         <div className="flex items-center gap-4">
// //           <img
// //             src={seller.avatar || "https://i.pravatar.cc/100?img=11"}
// //             className="h-14 w-14 rounded-full object-cover border border-white/10"
// //             alt={seller.name}
// //           />
// //           <div>
// //             <div className="flex items-center gap-3">
// //               <div className="text-xl font-semibold">{seller.name}</div>
// //               <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-200 border border-emerald-500/25">
// //                 {seller.status || "ACTIVE"}
// //               </span>
// //             </div>
// //            <div className="mt-1 text-xs text-white/50">
// //   Seller ID: {seller.id} • Joined: {formatMonthYear(seller.joined)} • Email: {seller.email || "—"}
// // </div>
// //           </div>
// //         </div>

// // {/* ✅ Actions: mobile = 3 equal buttons, desktop = row */}
// // <div className="w-full lg:w-auto grid grid-cols-3 gap-3">
// //   <button className="h-11 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm inline-flex items-center justify-center gap-2">
// //     <MessageSquare className="h-4 w-4 text-sky-300" />
// //     <span className="hidden sm:inline">Message</span>
// //   </button>

// //   <button className="h-11 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm inline-flex items-center justify-center gap-2">
// //     <Download className="h-4 w-4 text-white/80" />
// //     <span className="hidden sm:inline">Export</span>
// //   </button>

// //   <button className="h-11 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/15 text-sm inline-flex items-center justify-center gap-2 text-red-300">
// //     <Ban className="h-4 w-4" />
// //     <span className="hidden sm:inline">Suspend</span>
// //   </button>
// // </div>

// //       </div>

// //       {/* KPI row */}
// //       <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
// //         <div className={`${kpiCardBase} p-6`}>
// //           <div className="text-xs tracking-[0.2em] text-white/60">TOTAL EARNINGS</div>
// //           <div className="mt-4 text-3xl font-semibold">
// //             ₹{Number(seller.totalEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
// //           </div>
// //           <div className="mt-3 text-sm text-emerald-400">Vs. last 30 days</div>
// //         </div>

// //         <div className={`${kpiCardBase} p-6`}>
// //           <div className="text-xs tracking-[0.2em] text-white/60">CUSTOMER RATING</div>
// //           <div className="mt-4 text-3xl font-semibold">
// //             {seller.rating || 0}/5.0 ⭐
// //           </div>
// //           <div className="mt-3 text-sm text-emerald-400">
// //             From {seller.reviewsCount || 0} reviews
// //           </div>
// //         </div>

// //         <div className={`${kpiCardBase} p-6`}>
// //           <div className="text-xs tracking-[0.2em] text-white/60">REFUND RATE</div>
// //           <div className="mt-4 text-3xl font-semibold">{seller.refundRate || 0}%</div>
// //           <div className="mt-3 text-sm text-sky-300">
// //             Threshold: {seller.refundThreshold || 5}% max
// //           </div>
// //         </div>
// //       </section>

// //       {/* Products table */}
// //       <div className={`${kpiCardBase} mt-6 p-6`}>
// //         <div className="flex items-center justify-between">
// //           <h2 className="text-lg font-semibold">All Products ({products.length})</h2>
// //           <button className="text-sm text-[#3A7CFF] hover:underline">View All</button>
// //         </div>

// //         {loading && <div className="mt-6 text-white/70 text-sm">Loading seller data…</div>}
// //         {!!error && !loading && <div className="mt-6 text-red-400 text-sm">{error}</div>}

// //         {!loading && !error && (
// //           <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
// //             <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
// //               <div className="col-span-4">PRODUCT</div>
// //               <div className="col-span-3">CATEGORY</div>
// //               <div className="col-span-2">PRICE</div>
// //               <div className="col-span-2">SALES</div>
// //               <div className="col-span-1 text-right">ACTIONS</div>
// //             </div>

// //             <div className="divide-y divide-white/10">
// //               {products.slice(0, 4).map((p) => (
// //                 <div key={p.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center bg-white/[0.02]">
// //                   <div className="col-span-4">
// //                     <div className="text-sm font-medium text-white/90">{p.title}</div>
// //                     <div className="text-xs text-white/50">{p.status}</div>
// //                   </div>
// //                   <div className="col-span-3 text-sm text-white/75">{p.category || "General"}</div>
// //                   <div className="col-span-2 text-sm text-white/75">
// //                     {p.price > 0 ? `₹${p.price}` : "FREE"}
// //                   </div>
// //                   <div className="col-span-2 text-sm text-white/75">—</div>
// //                   <div className="col-span-1 flex justify-end gap-3 text-white/70">
// //                     <button className="hover:text-white">✎</button>
// //                     <button className="hover:text-red-300">🗑</button>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>

// //             <div className="p-5 flex justify-center">
// //              <button
// //   onClick={() => setShowAllSellers(true)}
// //   className="text-sm text-[#3A7CFF] hover:underline"
// // >
// //   View All
// // </button>


// //             </div>
// //           </div>
// //         )}
// //       </div>

// //       {/* Bottom: activity + verification (UI only) */}
// //       <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
// //         <div className={`${kpiCardBase} p-6`}>
// //           <h2 className="text-lg font-semibold">Seller Activity Log</h2>
// //           <div className="mt-6 space-y-4">
// //             {[
// //               { t: "New product listing created", d: "React Dash Template was uploaded", time: "2 minutes ago" },
// //               { t: "Payout requested", d: "Request for $1,200.00 processed", time: "1 hour ago" },
// //               { t: "Updated “Abstract UI Kit”", d: "Modified price from $45 to $49", time: "3 hours ago" },
// //               { t: "Policy update", d: "Updated Terms of Service sent to sellers", time: "Yesterday" },
// //             ].map((a, idx) => (
// //               <div key={idx} className="flex gap-4">
// //                 <div className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.04]" />
// //                 <div>
// //                   <div className="text-sm font-medium text-white/90">{a.t}</div>
// //                   <div className="text-xs text-white/55 mt-1">{a.d}</div>
// //                   <div className="text-[11px] text-white/40 mt-1">{a.time}</div>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>

// //           <button className="mt-6 w-full h-10 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80">
// //             View Full History
// //           </button>
// //         </div>

// //         <div className={`${kpiCardBase} p-6`}>
// //           <div className="flex items-center justify-between">
// //             <h2 className="text-lg font-semibold">Identity Verification</h2>
// //             <span className="text-xs text-emerald-300">VERIFIED</span>
// //           </div>

// //           <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] h-[220px] flex items-center justify-center text-white/60">
// //             View Document
// //           </div>

// //           <div className="mt-4 flex items-center justify-between">
// //             <div className="text-sm text-white/80">Tax Compliance Doc</div>
// //             <span className="text-xs text-emerald-300">VERIFIED</span>
// //           </div>

// //           <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 flex items-center justify-between">
// //             <div className="text-sm text-white/70">Tax_Form_2023.pdf</div>
// //             <button className="text-white/70 hover:text-white">⬇</button>
// //           </div>

// //           <div className="mt-4 flex gap-3">
// //             <button className="flex-1 h-10 rounded-xl bg-red-500/15 text-red-200 border border-red-500/25 hover:bg-red-500/20 text-sm font-medium">
// //               Reject Verification
// //             </button>
// //             <button className="flex-1 h-10 rounded-xl bg-[#1677FF] hover:opacity-90 text-sm font-medium">
// //               Approve Docs
// //             </button>
// //           </div>
// //         </div>
// //       </section>
// //     </>
// //   );
// // };

// // const AccountView = ({
// //   adminName,
// //   adminEmail,
// //   totalMembers,
// //   activeToday,
// //   pendingInvite,
// // }: {
// //   adminName: string;
// //   adminEmail: string;
// //   totalMembers: number;
// //   activeToday: number;
// //   pendingInvite: number;
// // }) => {
// //   const [currentPassword, setCurrentPassword] = useState("");
// //   const [newPassword, setNewPassword] = useState("");
// //   const [confirmNewPassword, setConfirmNewPassword] = useState("");

// //   const teamRows = [
// //     { name: "Abstract UI Kit", status: "Live Listing", role: "Super admin", lastActive: "Online Now" },
// //     { name: "3D Icon Set v2", status: "Live Listing", role: "Moderator", lastActive: "15 min ago" },
// //     { name: "React Dash Template", status: "Draft", role: "Support", lastActive: "Yesterday" },
// //     { name: "Motion Backgrounds", status: "Live Listing", role: "Admin", lastActive: "3 days ago" },
// //   ];

// //   return (
// //     <>
// //       {/* Title */}
// //       <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
// //   <div className="text-center md:text-left">
// //     <h1 className="text-[24px] md:text-[34px] leading-[1.1] font-semibold">
// //       Admin Profile
// //     </h1>
// //     <p className="mt-2 text-white/60 text-sm">
// //       Manage your account and security settings
// //     </p>
// //   </div>
// // </div>

// //       {/* Profile Card */}
// //       <section className={`${kpiCardBase} mt-8 p-6`}>
// //         <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
// //           <div className="flex items-center gap-4">
// //             <img
// //               src={"https://i.pravatar.cc/120?img=12"}
// //               alt={adminName}
// //               className="h-16 w-16 rounded-full object-cover border border-white/10"
// //             />
// //             <div>
// //               <div className="text-xl font-semibold">{adminName}</div>
// //               <div className="text-sm text-white/50">Super Admin</div>
// //             </div>
// //           </div>

// //           <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
// //             <div>
// //               <label className="text-xs text-white/60">Full name</label>
// //               <input
// //                 value={adminName}
// //                 readOnly
// //                 className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
// //               />
// //             </div>

// //             <div>
// //               <label className="text-xs text-white/60">Email address</label>
// //               <input
// //                 value={adminEmail || "—"}
// //                 readOnly
// //                 className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
// //               />
// //             </div>

// //             <div>
// //               <label className="text-xs text-white/60">Role</label>
// //               <input
// //                 value={"Super Admin"}
// //                 readOnly
// //                 className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/50"
// //               />
// //             </div>

// //             <div>
// //               <label className="text-xs text-white/60">Timezone</label>
// //               <input
// //                 value={"Asia/Kolkata"}
// //                 readOnly
// //                 className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
// //               />
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* Security Management */}
// //       <section className={`${kpiCardBase} mt-6 p-6`}>
// //         <h2 className="text-lg font-semibold">Security Management</h2>

// //         <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5 items-end">
// //           <div>
// //             <label className="text-xs text-white/60">Current Password</label>
// //             <input
// //               type="password"
// //               value={currentPassword}
// //               onChange={(e) => setCurrentPassword(e.target.value)}
// //               className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
// //             />
// //           </div>

// //           <div>
// //             <label className="text-xs text-white/60">New Password</label>
// //             <input
// //               type="password"
// //               value={newPassword}
// //               onChange={(e) => setNewPassword(e.target.value)}
// //               className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
// //             />
// //           </div>

// //           <div>
// //             <label className="text-xs text-white/60">Confirm new password</label>
// //             <input
// //               type="password"
// //               value={confirmNewPassword}
// //               onChange={(e) => setConfirmNewPassword(e.target.value)}
// //               className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
// //             />
// //           </div>

// //           <div className="flex justify-start lg:justify-end">
// //             <button
// //               type="button"
// //               onClick={() => {
// //                 // TODO: call your update password API
// //                 console.log("update password");
// //               }}
// //               className="h-11 px-6 rounded-xl bg-[#1677FF] hover:opacity-90 text-sm font-medium"
// //             >
// //               Update password
// //             </button>
// //           </div>
// //         </div>
// //       </section>

// //       {/* KPI Cards */}
// //       <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
// //         <div className={`${kpiCardBase} p-6`}>
// //           <div className="text-xs tracking-[0.2em] text-white/60">TOTAL MEMBER</div>
// //           <div className="mt-4 text-3xl font-semibold">{totalMembers}</div>
// //         </div>

// //         <div className={`${kpiCardBase} p-6`}>
// //           <div className="text-xs tracking-[0.2em] text-white/60">ACTIVE TODAY</div>
// //           <div className="mt-4 text-3xl font-semibold">{activeToday}</div>
// //         </div>

// //         <div className={`${kpiCardBase} p-6`}>
// //           <div className="text-xs tracking-[0.2em] text-white/60">PENDING INVITE</div>
// //           <div className="mt-4 text-3xl font-semibold">{pendingInvite}</div>
// //         </div>
// //       </section>

// //       {/* Team Members Management */}
// //       <section className={`${kpiCardBase} mt-6 p-6`}>
// //         <h2 className="text-lg font-semibold">Team Members Management</h2>

// //         <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
// //           <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
// //             <div className="col-span-5">MEMBERS</div>
// //             <div className="col-span-3">ROLE</div>
// //             <div className="col-span-3">LAST ACTIVE</div>
// //             <div className="col-span-1 text-right">ACTIONS</div>
// //           </div>

// //           <div className="divide-y divide-white/10">
// //             {teamRows.map((m, idx) => (
// //               <div key={idx} className="grid grid-cols-12 gap-3 px-5 py-4 items-center bg-white/[0.02]">
// //                 <div className="col-span-5 flex items-center gap-3 min-w-0">
// //                   <div className="h-10 w-10 rounded-full bg-white/10 border border-white/10" />
// //                   <div className="min-w-0">
// //                     <div className="text-sm font-medium text-white/90 truncate">{m.name}</div>
// //                     <div className="text-xs text-white/45 truncate">{m.status}</div>
// //                   </div>
// //                 </div>

// //                 <div className="col-span-3">
// //                   <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/15 text-emerald-200 border border-emerald-500/25">
// //                     {m.role}
// //                   </span>
// //                 </div>

// //                 <div className="col-span-3 text-sm text-white/70">
// //                   {m.lastActive === "Online Now" ? (
// //                     <span className="inline-flex items-center gap-2">
// //                       <span className="h-2 w-2 rounded-full bg-emerald-400" />
// //                       Online Now
// //                     </span>
// //                   ) : (
// //                     m.lastActive
// //                   )}
// //                 </div>

// //                 <div className="col-span-1 flex justify-end gap-3 text-white/70">
// //                   <button className="hover:text-white" title="Edit">✎</button>
// //                   <button className="hover:text-red-300" title="Delete">🗑</button>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>

// //         <div className="mt-5 text-xs text-white/45">Showing 1 to {teamRows.length} of {teamRows.length} members</div>
// //       </section>
// //     </>
// //   );
// // };





// //   return (
// //     <div className="min-h-screen w-full bg-[#07080B] text-white font-inter">
// //       {/* Top Nav */}
// //       <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07080B]/80 backdrop-blur">
// //         <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
// //           <div className="h-[74px] flex items-center">


            
// //             {/* LEFT: Brand */}
// //             <div className="flex items-center">
// //               <div className="text-white font-semibold tracking-wide">
// //                 Tokun Admin
// //               </div>
// //             </div>

// //             {/* CENTER: Nav */}
// //             <div className="hidden md:flex flex-1 justify-center">
// //               <nav className="flex items-center gap-2">
// //                 <NavItem
// //                   id="dashboard"
// //                   label="Dashboard"
// //                   icon={<LayoutDashboard className="h-4 w-4" />}
// //                 />
// //                 <NavItem
// //                   id="sellers"
// //                   label="Sellers"
// //                   icon={<Store className="h-4 w-4" />}
// //                 />
// //                 <NavItem
// //                   id="products"
// //                   label="Products"
// //                   icon={<Package className="h-4 w-4" />}
// //                 />
// //                 <NavItem
// //                   id="analytics"
// //                   label="Analytics"
// //                   icon={<LineChart className="h-4 w-4" />}
// //                 />

// //                 <NavItem id="reports" label="Reports" icon={<ShieldAlert className="h-4 w-4" />} />

// //               </nav>
// //             </div>

            

// //             {/* RIGHT: Actions */}
// //             <div className="flex items-center gap-3 ml-auto">
// //               <button
// //                 className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] flex items-center justify-center"
// //                 aria-label="Notifications"
// //               >
// //                 <Bell className="h-5 w-5 text-white/80" />
// //               </button>

// //           <DropdownMenu>
// //   <DropdownMenuTrigger asChild>
// //     <button className="h-10 px-4 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] flex items-center gap-2">
// //       <span className="text-sm text-white/80">Hello, {adminName}</span>
// //       <ChevronDown className="h-4 w-4 text-white/70" />
// //     </button>
// //   </DropdownMenuTrigger>

// //   <DropdownMenuContent
// //     align="end"
// //     className="w-44 rounded-xl border border-white/10 bg-[#0B0D12] text-white shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
// //   >
// //     <DropdownMenuItem
// //       onClick={() => setActive("account")}
// //       className="cursor-pointer focus:bg-white/[0.06]"
// //     >
// //       Account
// //     </DropdownMenuItem>

// //     <DropdownMenuSeparator className="bg-white/10" />

// //     {/* Optional (if you want later)
// //     <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
// //     */}
// //   </DropdownMenuContent>
// // </DropdownMenu>


// //             </div>
// //           </div>
// //         </div>
// //       </header>

// //       {/* Body */}
 
// // {/* Body */}
// // <div className="w-full">
// //   <div className="flex w-full">
// //     {/* ✅ LEFT: Always-visible Reports Sidebar */}
// //   {/* ✅ LEFT: Reports Sidebar (DESKTOP ONLY) */}
// // <div className="hidden md:block w-[380px] shrink-0 pl-5 sm:pl-6 pr-4 py-10">
// //   <div className="sticky top-[90px] h-[calc(100vh-110px)]">
// //     <ReportsSidebar />
// //   </div>
// // </div>


// //     {/* ✅ RIGHT: Pages (never broken by sidebar) */}
// // <main className="flex-1 min-w-0 py-10 px-5 sm:px-6 md:pl-0 md:pr-5 lg:pr-6 pb-24 md:pb-10">

// //    <div className={active === "reports" ? "w-full" : "mx-auto max-w-[1200px]"}>


// //               {active === "dashboard" && currentView === "seller" && (
// //   <>
// //     {/* Title Row */}
  
// //    {/* Title Row */}
// // {/* ✅ Dashboard Header (Desktop aligned like your screenshot) */}
 
// // <div className="mt-2 md:mt-0">
// //   <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-3 md:gap-6">
// //     {/* LEFT: Title */}
// //     <div className="text-center md:text-left w-full">
// //       <h1 className="text-[24px] md:text-[34px] leading-[1.05] font-semibold">
// //         Dashboard
// //       </h1>
// //       <p className="mt-1 text-white/60 text-sm">Admin Overview</p>
// //     </div>

// //     {/* CENTER: Seller/User pills */}
// //     <div className="flex justify-center w-full">
// //       <div className="flex flex-row items-center justify-center gap-2">
// //         <button
// //           onClick={() => setCurrentView("seller")}
// //           className={[
// //             "h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2",
// //             currentView === "seller"
// //               ? "bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
// //               : "bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]",
// //           ].join(" ")}
// //         >
// //           <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
// //           Seller
// //         </button>

// //         <button
// //           onClick={() => setCurrentView("user")}
// //           className={[
// //             "h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2",
// //             currentView === "user"
// //               ? "bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
// //               : "bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]",
// //           ].join(" ")}
// //         >
// //           <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
// //           User
// //         </button>
// //       </div>
// //     </div>

// //     {/* RIGHT: Add Member */}
// //     <div className="flex justify-center md:justify-end w-full">
// //       <button className="h-9 sm:h-10 px-5 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90">
// //         <Plus className="h-4 w-4" />
// //         Add Member
// //       </button>
// //     </div>
// //   </div>
// // </div>





// //     {/* KPI Cards */}
// //     <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
// //       <div className={`${kpiCardBase} p-6`}>
// //         <div className="text-xs tracking-[0.2em] text-white/60">
// //           TOTAL REVENUE
// //         </div>
// //         <div className="mt-4 flex items-end justify-between">
// //           {/* TOTAL REVENUE */}
// // <div className="text-3xl font-semibold">
// //   ${stats.totalRevenue.toLocaleString()}
// // </div>

// // {/* ACTIVE SELLERS (now total sellers) */}
// // {/* <div className="text-3xl font-semibold">
// //   {stats.totalSellers}
// // </div> */}
// //           <div className="text-sm text-emerald-400 font-medium">
// //             +12%
// //           </div>
// //         </div>
// //       </div>

// //       <div className={`${kpiCardBase} p-6`}>
// //         <div className="text-xs tracking-[0.2em] text-white/60">
// //           ACTIVE SELLERS
// //         </div>
// //         <div className="mt-4 flex items-end justify-between">
// //           {/* ACTIVE SELLERS (now total sellers) */}
// // <div className="text-3xl font-semibold">
// //   {stats.totalSellers}
// // </div>
// //           <div className="text-sm text-emerald-400 font-medium">
// //             +5%
// //           </div>
// //         </div>
// //       </div>

// //       <div className={`${kpiCardBase} p-6`}>
// //         <div className="text-xs tracking-[0.2em] text-white/60">
// //           PENDING APPROVALS
// //         </div>
// //         <div className="mt-4 flex items-end justify-between">
// //         <div className="text-3xl font-semibold">{pendingApprovals}</div>
// //           <div className="text-sm text-fuchsia-300 font-medium">
// //             New submissions
// //           </div>
// //         </div>
// //       </div>

// //       <div className={`${kpiCardBase} p-6`}>
// //         <div className="text-xs tracking-[0.2em] text-white/60">
// //           DIGITAL PRODUCTS
// //         </div>
// //         <div className="mt-4 flex items-end justify-between">
// //           <div className="text-3xl font-semibold">
// //             {products.length || 0}
// //           </div>
// //           <div className="text-sm text-emerald-400 font-medium">
// //             Live count
// //           </div>
// //         </div>
// //       </div>
// //     </section>

// //     {/* Chart + Activities */}
// //     <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
// //       {/* Chart */}
// //       <div className={`${kpiCardBase} p-6 lg:col-span-2`}>
// //         <div className="flex items-start justify-between gap-4">
// //           <div>
// //             <h2 className="text-lg font-semibold">
// //               Sales Trends Over Time
// //             </h2>
// //             <p className="mt-1 text-sm text-white/55">
// //               Subtitle: Monthly revenue growth and projection
// //             </p>
// //           </div>
// //           <div className="text-xs text-white/60 mt-1">Last 30 Days</div>
// //         </div>

// //         <div className="mt-6 h-[310px] w-full">
// //           <ResponsiveContainer width="100%" height="100%">
// //             <AreaChart
// //               data={chartData}
// //               margin={{ top: 10, right: 8, left: -12, bottom: 0 }}
// //             >
// //               <defs>
// //                 <linearGradient
// //                   id="blueFill"
// //                   x1="0"
// //                   y1="0"
// //                   x2="0"
// //                   y2="1"
// //                 >
// //                   <stop
// //                     offset="0%"
// //                     stopColor="#2AA8FF"
// //                     stopOpacity={0.35}
// //                   />
// //                   <stop
// //                     offset="100%"
// //                     stopColor="#2AA8FF"
// //                     stopOpacity={0.02}
// //                   />
// //                 </linearGradient>
// //                 <linearGradient
// //                   id="greenFill"
// //                   x1="0"
// //                   y1="0"
// //                   x2="0"
// //                   y2="1"
// //                 >
// //                   <stop
// //                     offset="0%"
// //                     stopColor="#84CC16"
// //                     stopOpacity={0.28}
// //                   />
// //                   <stop
// //                     offset="100%"
// //                     stopColor="#84CC16"
// //                     stopOpacity={0.02}
// //                   />
// //                 </linearGradient>
// //               </defs>

// //               <CartesianGrid
// //                 stroke="rgba(255,255,255,0.08)"
// //                 vertical={false}
// //               />
// //               <XAxis
// //                 dataKey="name"
// //                 tick={{
// //                   fill: "rgba(255,255,255,0.55)",
// //                   fontSize: 12,
// //                 }}
// //                 axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
// //                 tickLine={false}
// //               />
// //               <YAxis
// //                 tick={{
// //                   fill: "rgba(255,255,255,0.45)",
// //                   fontSize: 12,
// //                 }}
// //                 axisLine={false}
// //                 tickLine={false}
// //               />
// //               <Tooltip
// //                 contentStyle={{
// //                   background: "rgba(10,12,16,0.95)",
// //                   border: "1px solid rgba(255,255,255,0.12)",
// //                   borderRadius: 12,
// //                   color: "white",
// //                 }}
// //                 labelStyle={{ color: "rgba(255,255,255,0.75)" }}
// //               />

// //               <Area
// //                 type="monotone"
// //                 dataKey="green"
// //                 stroke="#84CC16"
// //                 strokeWidth={2}
// //                 fill="url(#greenFill)"
// //                 dot={false}
// //                 activeDot={{ r: 4 }}
// //               />
// //               <Area
// //                 type="monotone"
// //                 dataKey="blue"
// //                 stroke="#2AA8FF"
// //                 strokeWidth={2}
// //                 fill="url(#blueFill)"
// //                 dot={false}
// //                 activeDot={{ r: 4 }}
// //               />
// //             </AreaChart>
// //           </ResponsiveContainer>
// //         </div>
// //       </div>

// //       {/* Recent Activities */}
// //      {/* Recent Activities — SELLER VIEW */}
// // <div className={`${kpiCardBase} p-6`}>
// //   <h2 className="text-lg font-semibold">Recent Activities</h2>

// //   <div className="mt-6 space-y-4">
// //     {activitiesLoading && (
// //       <div className="text-white/70 text-sm">Loading activities…</div>
// //     )}

// //     {!!activitiesError && !activitiesLoading && (
// //       <div className="text-red-400 text-sm">{activitiesError}</div>
// //     )}

// //   {!activitiesLoading && !activitiesError && recentActivitiesPreview.length === 0 && (
// //   <div className="text-white/60 text-sm">No recent activity found.</div>
// // )}

// // {!activitiesLoading && !activitiesError && recentActivitiesPreview.map((a) => {
// //       const meta = activityMeta(a.type);
// //       return (
// //         <div key={a.id} className="flex gap-4">
// //           <div className={[
// //             "h-9 w-9 rounded-full border flex items-center justify-center shrink-0",
// //             meta.iconBg,
// //           ].join(" ")}>
// //             {meta.icon}
// //           </div>
// //           <div className="min-w-0 flex-1">
// //             <div className="text-sm font-medium text-white/90">{a.title}</div>
// //             {a.desc && (
// //               <div className="text-xs text-white/55 mt-1 truncate">{a.desc}</div>
// //             )}
// //             <div className="text-[11px] text-white/40 mt-1">
// //               {timeAgo(a.createdAt)}
// //             </div>
// //           </div>
// //         </div>
// //       );
// //     })}
// //   </div>
// // <button
// //   onClick={() => setShowAllActivities(true)}
// //   className="mt-6 w-full h-10 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80"
// // >
// //   View Activity Log
// // </button>
  
// // </div>
// //     </section>
// //     {/* ✅ Sellers List (Dashboard → Seller toggle) — same look as SellersView table */}
// // <section className={`${kpiCardBase} mt-6 p-6`}>
// //   <div className="flex items-center justify-between">
// //     <div>
// //       <h2 className="text-lg font-semibold">Sellers List</h2>
// //       <p className="mt-1 text-sm text-white/55">
// //         A quick snapshot of sellers (same table styling as Seller Management)
// //       </p>
// //     </div>

// //     <button
// //       onClick={() => setShowAllSellers(true)}
// //       className="text-sm text-[#3A7CFF] hover:underline"
// //     >
// //       View All
// //     </button>
// //   </div>

// //   <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
// //     {/* Desktop header only */}
// //     <div className="hidden md:grid md:grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
// //   <div className="md:col-span-4">Seller</div>

// //   <div className="md:col-span-2">Volume</div>
// //   <div className="md:col-span-2">Status</div>
// //   <div className="md:col-span-1 text-right">Actions</div>
// // </div>

// //     <div className="divide-y divide-white/10">
// //       {sellersLoading && (
// //         <div className="p-6 text-white/70 text-sm">Loading sellers…</div>
// //       )}

// //       {!!sellersError && !sellersLoading && (
// //         <div className="p-6 text-red-400 text-sm">{sellersError}</div>
// //       )}

// //       {!sellersLoading && !sellersError && (
// //         <>
// //         {(sellerRows || []).slice(0, 10).map((r) => (
// //   <div key={r.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-5 py-5 bg-white/[0.02]">
// //     {/* Seller */}
// //     <div className="md:col-span-4 flex items-center gap-3 min-w-0">
// //       <img
// //         src={r.avatar || "https://i.pravatar.cc/80?img=12"}
// //         alt={r.name}
// //         className="h-10 w-10 rounded-full object-cover border border-white/10 shrink-0"
// //       />
// //       <div className="min-w-0">
// //         <div className="text-sm font-medium text-white/90 truncate">{r.name}</div>
// //         <div className="text-xs text-white/45 truncate">{r.email}</div>
// //       </div>
// //     </div>

// //     {/* Category */}
// //     {/* <div className="md:col-span-3 text-sm text-white/75 flex items-center">
// //       {r.category || "Digital Art"}
// //     </div> */}

// //     {/* Volume */}
// //     <div className="md:col-span-2 text-sm text-white/80 font-medium flex items-center">
// //       ₹{Number(r.volume ?? 0).toLocaleString("en-IN")}
// //     </div>

// //     {/* Status */}
// //     <div className="md:col-span-2 flex items-center">
// //       <span className={[
// //         "px-4 py-1.5 rounded-full text-xs font-medium border inline-flex",
// //         r.status === "Active"
// //           ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
// //           : "bg-red-500/15 text-red-200 border-red-500/25",
// //       ].join(" ")}>
// //         {r.status}
// //       </span>
// //     </div>

// //     {/* Actions */}
// //     <div className="md:col-span-1 flex items-center justify-end gap-2">
// //       <button
// //         className="text-xs text-red-400 hover:text-red-300"
// //         onClick={() => console.log("block", r.id)}
// //       >
// //         Block
// //       </button>
// //       <button
// //         className="text-white/50 hover:text-white/80"
// //         onClick={() => console.log("delete", r.id)}
// //       >
// //         🗑
// //       </button>
// //     </div>
// //   </div>
// // ))}

// //           {(sellerRows || []).length === 0 && (
// //             <div className="p-6 text-white/60 text-sm">No sellers found.</div>
// //           )}
// //         </>
// //       )}
// //     </div>
// //   </div>

// //   {!sellersLoading && !sellersError && (sellerRows || []).length > 0 && (
// //     <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
// //       <div className="text-sm text-white/60">
// //         Showing 1 to {Math.min(10, sellerRows.length)} of {sellerRows.length} sellers
// //       </div>

// //       <button
// //         onClick={() => setShowAllSellers(true)}
// //         className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm text-white/80"
// //       >
// //         View All
// //       </button>
// //     </div>
// //   )}
// // </section>
  
// //   </>
// // )}


// //  {active === "dashboard" && currentView === "user" && (
// //   <>
 

// // <div className="mt-2 md:mt-0">
// //   <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-3 md:gap-6">
// //     {/* LEFT: Title */}
// //     <div className="text-center md:text-left w-full">
// //       <h1 className="text-[24px] md:text-[34px] leading-[1.05] font-semibold">
// //         Dashboard
// //       </h1>
// //       <p className="mt-1 text-white/60 text-sm">Admin Overview</p>
// //     </div>

// //     {/* CENTER: Seller/User pills */}
// //     <div className="flex justify-center w-full">
// //       <div className="flex flex-row items-center justify-center gap-2">
// //         <button
// //           onClick={() => setCurrentView("seller")}
// //           className={[
// //             "h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2",
// //             currentView === "seller"
// //               ? "bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
// //               : "bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]",
// //           ].join(" ")}
// //         >
// //           <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
// //           Seller
// //         </button>

// //         <button
// //           onClick={() => setCurrentView("user")}
// //           className={[
// //             "h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2",
// //             currentView === "user"
// //               ? "bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
// //               : "bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]",
// //           ].join(" ")}
// //         >
// //           <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
// //           User
// //         </button>
// //       </div>
// //     </div>

// //     {/* RIGHT: Add Member */}
// //     <div className="flex justify-center md:justify-end w-full">
// //       <button className="h-9 sm:h-10 px-5 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90">
// //         <Plus className="h-4 w-4" />
// //         Add Member
// //       </button>
// //     </div>
// //   </div>
// // </div>



// //     {/* Add Member Button */}

     

// //     {/* KPI Cards */}
// //     <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
// //      <div className={`${kpiCardBase} p-6`}>
// //   <div className="text-xs tracking-[0.2em] text-white/60">
// //     TOTAL USERS
// //   </div>

// //   <div className="mt-4 flex items-end justify-between">
// //     <div className="text-3xl font-semibold">
// //       {userTotal.toLocaleString()}
// //     </div>

// //     <div className="text-sm text-emerald-400 font-medium">
// //       +12%
// //     </div>
// //   </div>
// // </div>


// //       <div className={`${kpiCardBase} p-6`}>
// //         <div className="text-xs tracking-[0.2em] text-white/60">
// //           ACTIVE USERS
// //         </div>
// //         <div className="mt-4 flex items-end justify-between">
// //         <div className="text-3xl font-semibold">{activeUsersCount}</div>

// //           <div className="text-sm text-emerald-400 font-medium">
// //             +5%
// //           </div>
// //         </div>
// //       </div>

// //       <div className={`${kpiCardBase} p-6`}>
// //         <div className="text-xs tracking-[0.2em] text-white/60">
// //           PENDING APPROVALS
// //         </div>
// //         <div className="mt-4 flex items-end justify-between">
// //      <div className="text-3xl font-semibold">{pendingApprovals}</div>
// //           <div className="text-sm text-fuchsia-300 font-medium">
// //             New submissions
// //           </div>
// //         </div>
// //       </div>

// //       <div className={`${kpiCardBase} p-6`}>
// //         <div className="text-xs tracking-[0.2em] text-white/60">
// //           DIGITAL PRODUCTS
// //         </div>
// //         <div className="mt-4 flex items-end justify-between">
// //           <div className="text-3xl font-semibold">
// //             {products.length || 0}
// //           </div>
// //           <div className="text-sm text-emerald-400 font-medium">
// //             Live count
// //           </div>
// //         </div>
// //       </div>
// //     </section>

// //     {/* Chart + Activities */}
// //     <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
// //       {/* Chart */}
// //       <div className={`${kpiCardBase} p-6 lg:col-span-2`}>
// //         <div className="flex items-start justify-between gap-4">
// //           <div>
// //             <h2 className="text-lg font-semibold">
// //               Sales Trends Over Time
// //             </h2>
// //             <p className="mt-1 text-sm text-white/55">
// //               Subtitle: Monthly revenue growth and projection
// //             </p>
// //           </div>
// //           <div className="text-xs text-white/60 mt-1">Last 30 Days</div>
// //         </div>

// //         <div className="mt-6 h-[310px] w-full">
// //           <ResponsiveContainer width="100%" height="100%">
// //             <AreaChart
// //               data={chartData}
// //               margin={{ top: 10, right: 8, left: -12, bottom: 0 }}
// //             >
// //               <defs>
// //                 <linearGradient id="blueFill" x1="0" y1="0" x2="0" y2="1">
// //                   <stop offset="0%" stopColor="#2AA8FF" stopOpacity={0.35} />
// //                   <stop offset="100%" stopColor="#2AA8FF" stopOpacity={0.02} />
// //                 </linearGradient>
// //                 <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
// //                   <stop offset="0%" stopColor="#84CC16" stopOpacity={0.28} />
// //                   <stop offset="100%" stopColor="#84CC16" stopOpacity={0.02} />
// //                 </linearGradient>
// //               </defs>

// //               <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
// //               <XAxis
// //                 dataKey="name"
// //                 tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
// //                 axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
// //                 tickLine={false}
// //               />
// //               <YAxis
// //                 tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
// //                 axisLine={false}
// //                 tickLine={false}
// //               />
// //               <Tooltip
// //                 contentStyle={{
// //                   background: "rgba(10,12,16,0.95)",
// //                   border: "1px solid rgba(255,255,255,0.12)",
// //                   borderRadius: 12,
// //                   color: "white",
// //                 }}
// //                 labelStyle={{ color: "rgba(255,255,255,0.75)" }}
// //               />

// //               <Area
// //                 type="monotone"
// //                 dataKey="green"
// //                 stroke="#84CC16"
// //                 strokeWidth={2}
// //                 fill="url(#greenFill)"
// //                 dot={false}
// //                 activeDot={{ r: 4 }}
// //               />
// //               <Area
// //                 type="monotone"
// //                 dataKey="blue"
// //                 stroke="#2AA8FF"
// //                 strokeWidth={2}
// //                 fill="url(#blueFill)"
// //                 dot={false}
// //                 activeDot={{ r: 4 }}
// //               />
// //             </AreaChart>
// //           </ResponsiveContainer>
// //         </div>
// //       </div>

// //       {/* Recent Activities */}
// //       {/* Recent Activities — USER VIEW mein ye section fix karo */}
// // <div className={`${kpiCardBase} p-6`}>
// //   <h2 className="text-lg font-semibold">Recent Activities</h2>

// //   <div className="mt-6 space-y-4">
// //     {activitiesLoading && (
// //       <div className="text-white/70 text-sm">Loading activities…</div>
// //     )}

// //     {!!activitiesError && !activitiesLoading && (
// //       <div className="text-red-400 text-sm">{activitiesError}</div>
// //     )}

// //   {!activitiesLoading && !activitiesError && recentActivitiesPreview.length === 0 && (
// //   <div className="text-white/60 text-sm">No recent activity found.</div>
// // )}

// // {!activitiesLoading && !activitiesError && recentActivitiesPreview.map((a) => {
// //         const meta = activityMeta(a.type);
// //         return (
// //           <div key={a.id} className="flex gap-4">
// //             <div
// //               className={[
// //                 "h-9 w-9 rounded-full border flex items-center justify-center shrink-0",
// //                 meta.iconBg,
// //               ].join(" ")}
// //             >
// //               {meta.icon}
// //             </div>
// //             <div className="min-w-0 flex-1">
// //               <div className="text-sm font-medium text-white/90">{a.title}</div>
// //               {a.desc && (
// //                 <div className="text-xs text-white/55 mt-1 truncate">{a.desc}</div>
// //               )}
// //               <div className="text-[11px] text-white/40 mt-1">
// //                 {timeAgo(a.createdAt)}
// //               </div>
// //             </div>
// //           </div>
// //         );
// //       })}
// //   </div>

// //  <button
// //   onClick={() => setShowAllActivities(true)}
// //   className="mt-6 w-full h-10 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80"
// // >
// //   View Activity Log
// // </button>
// // </div>
// //     </section>

// // {/* Users Table */}
// // <section className={`${kpiCardBase} mt-6 p-6`}>
// //   <div className="flex items-center justify-between gap-3">
// //     <div>
// //       <h2 className="text-lg font-semibold">Users List</h2>
// //     </div>
// //     <button
// //       onClick={() => setShowAllUsers(true)}
// //       className="shrink-0 text-sm text-[#3A7CFF] hover:underline"
// //     >
// //       View All
// //     </button>
// //   </div>

// //   <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
// //     {/* Desktop Header */}
// //    <div className="hidden md:grid md:grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
// //   <div className="md:col-span-3">User Name</div>
// //   <div className="md:col-span-2">Status</div>
// //   <div className="md:col-span-2">Buy Products</div>
// //   <div className="md:col-span-2">Sale Products</div>
// //   <div className="md:col-span-2">Joined Date</div>
// //   <div className="md:col-span-1 text-right">Actions</div>
// // </div>

// //     <div className="divide-y divide-white/10">
// //       {userLoading && (
// //         <div className="p-6 text-white/70 text-sm">Loading users…</div>
// //       )}

// //       {!!userError && !userLoading && (
// //         <div className="p-6 text-red-400 text-sm">{userError}</div>
// //       )}

// //   {!userLoading && !userError && userRows.map((u) => (
// //   <div key={u.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-5 py-5 bg-white/[0.02]">
    
// //     {/* User Name */}
// //     <div className="md:col-span-3 flex items-center gap-3 min-w-0">
// //       <img
// //         src={u.avatar || "https://i.pravatar.cc/80?img=12"}
// //         alt={u.name}
// //         className="h-10 w-10 rounded-full object-cover border border-white/10 shrink-0"
// //       />
// //       <div className="min-w-0">
// //         <div className="text-sm font-medium text-white/90 truncate">{u.name}</div>
// //         <div className="text-xs text-white/45 truncate">{u.email}</div>
// //       </div>
// //     </div>

// //     {/* Status */}
// //     <div className="md:col-span-2 flex items-center">
// //       <span className="px-3 py-1 rounded-full text-xs font-medium border bg-emerald-500/15 text-emerald-200 border-emerald-500/25">
// //         Active
// //       </span>
// //     </div>

// //     {/* Buy Products */}
// //     <div className="md:col-span-2 text-sm text-white/75 flex items-center">
// //       {u.buyProducts ?? 0}
// //     </div>

// //     {/* Sale Products */}
// //     <div className="md:col-span-2 text-sm text-white/75 flex items-center">
// //       {u.saleProducts ?? 0}
// //     </div>

// //     {/* Joined Date */}
// //     <div className="md:col-span-2 text-sm text-white/75 flex items-center">
// //       {formatDate(u.createdAt)}
// //     </div>

// //     {/* Actions */}
// //     <div className="md:col-span-1 flex items-center justify-end gap-3">
// //       <button className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
// //         🚫 Block
// //       </button>
// //       <button className="text-white/50 hover:text-white/80 text-sm">
// //         🗑
// //       </button>
// //     </div>
// //   </div>
// // ))}
// //       {!userLoading && !userError && userRows.length === 0 && (
// //         <div className="p-6 text-white/60 text-sm">No users found.</div>
// //       )}
// //     </div>
// //   </div>

// //   {/* Search + Page Size */}
// //   <div className={`${kpiCardBase} mt-6 p-4`}>
// //     <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
// //       <div className="flex-1 relative min-w-0">
// //         <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
// //         <input
// //           value={userSearch}
// //           onChange={(e) => setUserSearch(e.target.value)}
// //           className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
// //           placeholder="Search users by name or email..."
// //         />
// //       </div>

// //       <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
// //         <div className="text-sm text-white/60 shrink-0">Show</div>
// //         <select
// //           value={userPageSize}
// //           onChange={(e) => setUserPageSize(Number(e.target.value))}
// //           className="h-11 min-w-[90px] px-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none"
// //         >
// //           {[10, 20, 50, 100].map((n) => (
// //             <option key={n} value={n}>
// //               {n}
// //             </option>
// //           ))}
// //         </select>
// //       </div>
// //     </div>
// //   </div>
// // </section>
// //   </>
// // )}


// //         {active === "products" && <ProductsView />}
// //         {active === "sellers" && <SellersView />}
// //         {active === "reports" && <ReportsView />}
// //         {active === "analytics" && (
// //           <div className={`${kpiCardBase} p-8`}>
// //             <h1 className="text-2xl font-semibold">Analytics</h1>
// //             <p className="text-white/60 mt-2">Coming soon…</p>
// //           </div>
// //         )}
// //         {active === "account" && (
// //           <AccountView
// //             adminName={adminName}
// //             adminEmail={adminEmail}
// //             totalMembers={24}
// //             activeToday={18}
// //             pendingInvite={3}
// //           />
// //         )}
// //       </div>
// //     </main>
// //   </div>
// // </div>

// //       {/* Footer */}
// //       <footer className="mt-10 pb-8 text-center text-xs text-white/35">
// //         © 2020 – 2026 Tokun.world | All Rights Reserved
// //       </footer>
// //       <MobileBottomNav />



// //       {showAllActivities && (
// //   <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
// //     <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl border border-white/10 bg-[#0F1117] shadow-2xl overflow-hidden">
      
// //       {/* Header */}
// //       <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
// //         <h2 className="text-lg font-semibold text-white">Activity Log</h2>
// //         <button
// //           onClick={() => setShowAllActivities(false)}
// //           className="h-9 w-9 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center text-white/80"
// //         >
// //           <X className="h-4 w-4" />
// //         </button>
// //       </div>

// //       {/* Body */}
// //       <div className="max-h-[70vh] overflow-y-auto p-5 space-y-4 no-scrollbar">
// //         {activitiesLoading && (
// //           <div className="text-white/70 text-sm">Loading activities…</div>
// //         )}

// //         {!!activitiesError && !activitiesLoading && (
// //           <div className="text-red-400 text-sm">{activitiesError}</div>
// //         )}

// //         {!activitiesLoading && !activitiesError && activities.length === 0 && (
// //           <div className="text-white/60 text-sm">No recent activity found.</div>
// //         )}

// //         {!activitiesLoading &&
// //           !activitiesError &&
// //           activities.map((a) => {
// //             const meta = activityMeta(a.type);
// //             return (
// //               <div
// //                 key={a.id}
// //                 className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
// //               >
// //                 <div
// //                   className={[
// //                     "h-10 w-10 rounded-full border flex items-center justify-center shrink-0",
// //                     meta.iconBg,
// //                   ].join(" ")}
// //                 >
// //                   {meta.icon}
// //                 </div>

// //                 <div className="min-w-0 flex-1">
// //                   <div className="text-sm font-medium text-white/90">
// //                     {a.title}
// //                   </div>
// //                   {a.desc && (
// //                     <div className="text-xs text-white/55 mt-1">
// //                       {a.desc}
// //                     </div>
// //                   )}
// //                   <div className="text-[11px] text-white/40 mt-2">
// //                     {timeAgo(a.createdAt)}
// //                   </div>
// //                 </div>
// //               </div>
// //             );
// //           })}
// //       </div>
// //     </div>
// //   </div>
// // )}
// //     </div>
// //   );
// // };

// // export default Dashboard;


// // src/pages/admin/Dashboard.tsx
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Bell,
//   ChevronDown,
//   Plus,
//   LayoutDashboard,
//   Store,
//   Package,
//   LineChart,
//   UserRound,
//   CheckCircle2,
//   XCircle,
//   ShieldCheck,
//   Search,
//   X,
//   TrendingUp,
//   TriangleAlert,
//   Image as ImageIcon,
//   Video,
//   Download,
//   MessageSquare,
//   Ban,
//   Clock,
//   FileText,
//   ShieldAlert,
//   User,
//   ShoppingCart
// } from "lucide-react";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import {
//   Area,
//   AreaChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// // ✅ ADD reports here
// type NavKey =
//   | "dashboard"
//   | "sellers"
//   | "products"
//   | "reports"
//   | "analytics"
//   | "account";

// const kpiCardBase =
//   "rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.03] border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

// // =======================
// // TYPES
// // =======================
// type PromptProduct = {
//   id: string;
//   title: string;
//   uploaderName: string;
//   uploaderId?: string | null;
//   price: number;
//   status: "Published" | "Draft" | "Flagged";
//   imageUrl?: string;
//   videoUrl?: string;
//   category?: string;
//   exclusive?: boolean;
//   sold?: boolean;
// };

// type Category = { _id: string; name: string; description?: string };

// type SellerProfile = {
//   id: string;
//   name: string;
//   email?: string;
//   location?: string;
//   joined?: string;
//   status?: "ACTIVE" | "SUSPENDED";
//   avatar?: string;
//   verified?: boolean;

//   totalEarnings?: number;
//   rating?: number;
//   reviewsCount?: number;
//   refundRate?: number;
//   refundThreshold?: number;
// };

// type SellerRow = {
//   id: string;
//   name: string;
//   email: string;
//   status: "Active" | "Blocked";
//   avatar?: string;
//   joined?: string | null;
//   category?: string;
//   // ✅ volume = total earning
//   volume?: number;
//   totalProducts?: number;
//   soldProducts?: number;
//   totalSpent?: number;
//   isDeleted?: boolean;
//   kycStatus?: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED" | "FLAGGED";
// };

// // ✅ REPORT TYPES (left + right flow)
// type ReportItem = {
//   id: string;
//   title: string;
//   listingId: string;
//   productId?: string;
//   category: string;
//   status: "Open" | "Reviewed" | "Dismissed" | "Actioned";
//   priority: "Low" | "Medium" | "High";
//   createdAt: string;

//   reporterName?: string;
//   reporterEmail?: string;
//   reason: string;
//   details?: string;

//   productTitle?: string;
//   sellerName?: string;

//   previewImageUrl?: string;
//   previewVideoUrl?: string;

//   evidence?: Array<{
//     type: "image" | "video" | "text";
//     url?: string;
//     text?: string;
//     label?: string;
//   }>;

//   history?: Array<{
//     at: string;
//     by: string;
//     action: string;
//     note?: string;
//   }>;
// };

// // =======================
// // API
// // =======================
// type ActivityItem = {
//   id: string;
//   title: string;
//   desc?: string;
//   createdAt: string;
//   type:
//     | "USER_REGISTERED"
//     | "USER_LOGIN"
//     | "PRODUCT_PURCHASED"
//     | "VIDEO_CALL_STARTED"
//     | "VIDEO_CALL_ENDED"
//     | "SELLER_REGISTERED"
//     | "PRODUCT_APPROVED"
//     | "PAYOUT_FAILED"
//     | "POLICY_UPDATE"
//     | "REPORT_CREATED"
//     | "LISTING_SUSPENDED"
//     | "PRODUCT_FLAGGED"
//     | "OTHER";
// };

// type UserRow = {
//   id: string;
//   name: string;
//   email: string;
//   avatar?: string;
//   userType?: "IND" | "ORG" | "TM";
//   plan?: "free" | "pro" | null;
//   isVerified?: boolean;
//   kycStatus?: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED" | "FLAGGED";
//   createdAt?: string;
//   lastLoginAt?: string;
//   // ✅ purchased prompts count
//   buyProducts?: number;
//   // ✅ uploaded prompts count
//   saleProducts?: number;
//   totalEarnings?: number;
//   totalSpent?: number;
// };


// const useMediaQuery = (query: string) => {
//   const [matches, setMatches] = React.useState(false);

//   React.useEffect(() => {
//     const mql = window.matchMedia(query);
//     const onChange = () => setMatches(mql.matches);
//     onChange();
//     mql.addEventListener("change", onChange);
//     return () => mql.removeEventListener("change", onChange);
//   }, [query]);

//   return matches;
// };

// const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// const PROMPTS_BASE = `${API_BASE}/api/prompt`;
// const SELLERS_BASE = `${API_BASE}/api/seller`;
// const REPORTS_BASE = `${API_BASE}/api/promptreport`;
// const USERS_BASE = `${API_BASE}/api/user`;
// // Optional future:
// // const REPORTS_BASE = `${API_BASE}/api/reports`;

// const Dashboard = () => {
//   const [active, setActive] = useState<NavKey>("dashboard");
// const [currentView, setCurrentView] = useState<"seller" | "user">("seller");
//  const [showAllUsers, setShowAllUsers] = useState(false);
// const [userRows, setUserRows] = useState<UserRow[]>([]);
// const [userLoading, setUserLoading] = useState(false);
// const [userError, setUserError] = useState<string | null>(null);
// const [userPage, setUserPage] = useState(1);
// const [userPageSize, setUserPageSize] = useState(10);
// const [userTotalPages, setUserTotalPages] = useState(1);
// const [userTotal, setUserTotal] = useState(0);
// const [userSearch, setUserSearch] = useState("");
//  const [showAllActivities, setShowAllActivities] = useState(false);
//  const [stats, setStats] = useState({
//   totalRevenue: 0,
//   totalSellers: 0,
// });
// const [pendingApprovals, setPendingApprovals] = useState(0);



// const [sellerRows, setSellerRows] = useState<SellerRow[]>([]);

// type ChartDatum = {
//   year?: number;
//   month?: number;
//   name: string;
//   blue: number;  // revenue
//   green: number; // sales count
// };

// const defaultChartData: ChartDatum[] = [
//   { name: "Week 1", blue: 28, green: 18 },
//   { name: "Week 2", blue: 14, green: 22 },
//   { name: "Week 3", blue: 18, green: 24 },
//   { name: "Week 4", blue: 44, green: 30 },
//   { name: "Week 5", blue: 34, green: 44 },
//   { name: "Week 6", blue: 46, green: 26 },
//   { name: "Week 7", blue: 22, green: 30 },
//   { name: "Week 8", blue: 18, green: 28 },
//   { name: "Week 9", blue: 6, green: 34 },
// ];

// const [chartData, setChartData] = useState<ChartDatum[]>(defaultChartData);


//   // ✅ Admin name (same as before)
//   const adminEmail = (localStorage.getItem("tokun_admin_email") || "").trim();
//   const adminName = useMemo(() => {
//     if (!adminEmail) return "Admin";
//     const localPart = adminEmail.split("@")[0] || "Admin";
//     const first = localPart.split(/[._-]/)[0] || localPart;
//     return first.charAt(0).toUpperCase() + first.slice(1);
//   }, [adminEmail]);

//   // ✅ Token getter (admin + normal user tokens)
//   const getToken = () => {
//     const token =
//       localStorage.getItem("token") ||
//       localStorage.getItem("tokun_token") ||
//       localStorage.getItem("accessToken") ||
//       localStorage.getItem("authToken") ||
//       localStorage.getItem("adminToken") ||
//       localStorage.getItem("tokun_admin_token") ||
//       "";

//     return token.replace(/^Bearer\s+/i, "").trim();
//   };

//   const getAuthHeaders = (): Record<string, string> => {
//     const token = getToken();
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   };

//   type DashboardStat = {
//     userId: string;
//     email?: string;
//     uploadedPrompts: number;
//     buyProducts: number;
//     soldProducts: number;
//     totalSpent: number;
//     totalEarnings: number;
//   };

//   const toNumber = (value: any) => {
//     const n = Number(value);
//     return Number.isFinite(n) ? n : 0;
//   };

//   const normalizeDashboardStat = (item: any): DashboardStat | null => {
//     const userId = String(
//       item?.userId ||
//       item?._id ||
//       item?.id ||
//       item?.buyer ||
//       ""
//     );

//     const email = String(item?.email || "").trim().toLowerCase();

//     if (!userId && !email) return null;

//     return {
//       userId,
//       email,
//       // ✅ Sell = uploaded prompts
//       uploadedPrompts: toNumber(
//         item?.uploadedPrompts ??
//         item?.totalUploadedPrompts ??
//         item?.totalProducts ??
//         item?.uploadedCount ??
//         item?.saleProducts
//       ),
//       // ✅ Buy = purchased prompts
//       buyProducts: toNumber(
//         item?.buyProducts ??
//         item?.purchasedCount ??
//         item?.totalPurchases ??
//         item?.purchases
//       ),
//       // ✅ Sold = purchases of this seller's prompts
//       soldProducts: toNumber(
//         item?.soldProducts ??
//         item?.totalSoldPrompts ??
//         item?.salesCount
//       ),
//       totalSpent: toNumber(item?.totalSpent),
//       // ✅ Volume = earning
//       totalEarnings: toNumber(
//         item?.totalEarnings ??
//         item?.volume ??
//         item?.earnings ??
//         item?.totalRevenue ??
//         item?.revenue
//       ),
//     };
//   };

//   const putStat = (map: Record<string, DashboardStat>, stat: DashboardStat | null) => {
//     if (!stat) return;

//     const keys = [
//       stat.userId ? String(stat.userId) : "",
//       stat.email ? String(stat.email).trim().toLowerCase() : "",
//     ].filter(Boolean);

//     if (!keys.length) return;

//     const mergeForKey = (key: string) => {
//       const prev = map[key] || {
//         userId: stat.userId || key,
//         email: stat.email,
//         uploadedPrompts: 0,
//         buyProducts: 0,
//         soldProducts: 0,
//         totalSpent: 0,
//         totalEarnings: 0,
//       };

//       map[key] = {
//         userId: stat.userId || prev.userId || key,
//         email: stat.email || prev.email,
//         // ✅ non-zero/new values win, so user API ke 0 stale values real counts overwrite nahi karte
//         uploadedPrompts: stat.uploadedPrompts || prev.uploadedPrompts,
//         buyProducts: stat.buyProducts || prev.buyProducts,
//         soldProducts: stat.soldProducts || prev.soldProducts,
//         totalSpent: stat.totalSpent || prev.totalSpent,
//         totalEarnings: stat.totalEarnings || prev.totalEarnings,
//       };
//     };

//     keys.forEach(mergeForKey);
//   };

//   const getStatForUser = (map: Record<string, DashboardStat>, user: any): Partial<DashboardStat> => {
//     const id = String(user?._id || user?.id || "");
//     const email = String(user?.email || "").trim().toLowerCase();

//     return (
//       map[id] ||
//       map[email] ||
//       {}
//     );
//   };

//   // ✅ Primary dashboard stats source: seller API now returns uploaded/buy/sold/earning fields.
//   const fetchSellerStatsMap = async (headers: Record<string, string> = {}) => {
//     const res = await fetch(`${SELLERS_BASE}?limit=0`, {
//       headers,
//       credentials: "include",
//     });

//     const data = await res.json().catch(() => null);

//     if (!res.ok || !data?.success) {
//       throw new Error(data?.error || data?.message || "Failed to load seller stats");
//     }

//     const map: Record<string, DashboardStat> = {};
//     (data.sellers || []).forEach((item: any) => putStat(map, normalizeDashboardStat(item)));
//     return map;
//   };

//   // ✅ Fallback stats source: purchase analytics endpoint.
//   const fetchUserStatsMap = async (headers: Record<string, string> = {}) => {
//     const res = await fetch(`${API_BASE}/api/purchase/analytics/user-stats`, {
//       headers,
//       credentials: "include",
//     });

//     const data = await res.json().catch(() => null);

//     if (!res.ok || !data?.success) {
//       throw new Error(data?.error || data?.message || "Failed to load user stats");
//     }

//     const map: Record<string, DashboardStat> = {};
//     (data.items || []).forEach((item: any) => putStat(map, normalizeDashboardStat(item)));
//     return map;
//   };

//   // ✅ Combined stats: seller route first, purchase route second.
//   // This prevents all counts becoming 0 if one endpoint misses a field.
//   const fetchDashboardStatsMap = async (headers: Record<string, string> = {}) => {
//     const map: Record<string, DashboardStat> = {};
//     const errors: string[] = [];

//     try {
//       const sellerStats = await fetchSellerStatsMap(headers);
//       Object.values(sellerStats).forEach((stat) => putStat(map, stat));
//     } catch (err: any) {
//       errors.push(`seller stats: ${err?.message || err}`);
//     }

//     // Purchase analytics endpoint requires a valid user/admin token.
//     // Agar Authorization header missing hai to 401 aayega; seller route already buy/sell stats de raha hai,
//     // so no-token case me is endpoint ko call hi nahi karte.
//     if (headers.Authorization) {
//       try {
//         const purchaseStats = await fetchUserStatsMap(headers);
//         Object.values(purchaseStats).forEach((stat) => putStat(map, stat));
//       } catch (err: any) {
//         errors.push(`purchase stats: ${err?.message || err}`);
//       }
//     }

//     if (Object.keys(map).length === 0 && errors.length) {
//       throw new Error(errors.join(" | "));
//     }

//     console.log("✅ dashboard stats map", map);
//     return map;
//   };



// // ✅ SIMPLE WORKAROUND — activityLogger ko frontend se call karo
// // Dashboard.tsx mein ye helper function add karo:

// const logActivityToLocal = async (type: string, title: string, description: string, actorName?: string) => {
//   try {
//     await fetch(`${API_BASE}/api/activity/test-insert-custom`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ type, title, description, actorName }),
//     });
//   } catch (e) {
//     // silent fail
//   }
// };







//   const [activities, setActivities] = useState<ActivityItem[]>([]);
// const [activitiesLoading, setActivitiesLoading] = useState(false);
// const [activitiesError, setActivitiesError] = useState<string | null>(null);

//    const activityMeta = (type: ActivityItem["type"]) => {
//   switch (type) {
//     case "USER_REGISTERED":
//       return {
//         icon: <UserRound className="h-4 w-4" />,
//         iconBg: "bg-blue-500/15 text-blue-300 border-blue-500/25",
//       };
//     case "USER_LOGIN":
//       return {
//         icon: <ShieldCheck className="h-4 w-4" />,
//         iconBg: "bg-slate-500/15 text-slate-200 border-slate-400/25",
//       };
//     case "PRODUCT_PURCHASED":
//       return {
//         icon: <ShoppingCart className="h-4 w-4" />,
//         iconBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
//       };
//     case "VIDEO_CALL_STARTED":
//       return {
//         icon: <Video className="h-4 w-4" />,
//         iconBg: "bg-sky-500/15 text-sky-200 border-sky-500/25",
//       };
//     case "VIDEO_CALL_ENDED":
//       return {
//         icon: <Video className="h-4 w-4" />,
//         iconBg: "bg-slate-500/15 text-slate-200 border-slate-400/25",
//       };
//     case "SELLER_REGISTERED":
//       return {
//         icon: <UserRound className="h-4 w-4" />,
//         iconBg: "bg-blue-500/15 text-blue-300 border-blue-500/25",
//       };
//     case "PRODUCT_APPROVED":
//       return {
//         icon: <CheckCircle2 className="h-4 w-4" />,
//         iconBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
//       };
//     case "PAYOUT_FAILED":
//       return {
//         icon: <XCircle className="h-4 w-4" />,
//         iconBg: "bg-red-500/15 text-red-300 border-red-500/25",
//       };
//     case "POLICY_UPDATE":
//       return {
//         icon: <ShieldCheck className="h-4 w-4" />,
//         iconBg: "bg-slate-500/15 text-slate-200 border-slate-400/25",
//       };
//     case "REPORT_CREATED":
//       return {
//         icon: <ShieldAlert className="h-4 w-4" />,
//         iconBg: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/25",
//       };
//     case "LISTING_SUSPENDED":
//       return {
//         icon: <Ban className="h-4 w-4" />,
//         iconBg: "bg-red-500/15 text-red-200 border-red-500/25",
//       };
//     case "PRODUCT_FLAGGED":
//       return {
//         icon: <TriangleAlert className="h-4 w-4" />,
//         iconBg: "bg-amber-500/15 text-amber-200 border-amber-500/25",
//       };
//     default:
//       return {
//         icon: <Clock className="h-4 w-4" />,
//         iconBg: "bg-white/10 text-white/70 border-white/15",
//       };
//   }
// };



// // useEffect(() => {
// //   const loadActivities = async () => {
// //     try {
// //       setActivitiesLoading(true);
// //       setActivitiesError(null);

// //       const token = getToken();
// //       console.log("🔑 Token being used:", token); // token dekho

// //       const res = await fetch(`${API_BASE}/api/activity/recent?limit=10`, {
// //         headers: {
// //           ...(token ? { Authorization: `Bearer ${token}` } : {}),
// //         },
// //         credentials: "include",
// //       });

// //       console.log("📡 Response status:", res.status); // status dekho

// //       if (!res.ok) {
// //         throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
// //       }

// //       const data = await res.json();
// //       console.log("📦 Raw API data:", data);          // raw data dekho
// //       console.log("📋 Items count:", data?.items?.length); // items count dekho

// //       if (!data?.success) {
// //         throw new Error(data?.message || data?.error || "Failed to load activities");
// //       }

// //       const mapped: ActivityItem[] = (data.items || []).map((a: any) => ({
// //         id: String(a._id || a.id),
// //         title: a.title || "Activity",
// //         desc: a.description || a.desc ||
// //           (a.actorName ? `By ${a.actorName}${a.targetName ? ` • ${a.targetName}` : ""}` : ""),
// //         createdAt: a.createdAt || new Date().toISOString(),
// //         type: (a.type || "OTHER") as ActivityItem["type"],
// //       }));

// //       console.log("✅ Mapped activities:", mapped); // mapped data dekho

// //       setActivities(mapped);
// //     } catch (e: any) {
// //       console.error("❌ Activity load error:", e);
// //       setActivitiesError(e?.message || "Failed to load activities");
// //       setActivities([]);
// //     } finally {
// //       setActivitiesLoading(false);
// //     }
// //   };

// //   loadActivities();
// // }, []);




// // ✅ REPLACE KARO — active page change pe bhi reload ho
// useEffect(() => {
//   const loadActivities = async () => {
//     try {
//       setActivitiesLoading(true);
//       setActivitiesError(null);

//       const token = getToken();

//       const res = await fetch(`${API_BASE}/api/activity/recent?limit=10`, {
//         headers: {
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         credentials: "include",
//       });

//       if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

//       const data = await res.json();
//       if (!data?.success) throw new Error(data?.message || "Failed");

//       const mapped: ActivityItem[] = (data.items || []).map((a: any) => ({
//         id: String(a._id || a.id),
//         title: a.title || "Activity",
//         desc: a.description || a.desc ||
//           (a.actorName ? `By ${a.actorName}${a.targetName ? ` • ${a.targetName}` : ""}` : ""),
//         createdAt: a.createdAt || new Date().toISOString(),
//         type: (a.type || "OTHER") as ActivityItem["type"],
//       }));

//       console.log("✅ Setting activities:", mapped.length);
//       setActivities(mapped);
//     } catch (e: any) {
//       console.error("❌ Activity error:", e);
//       setActivitiesError(e?.message || "Failed to load activities");
//       setActivities([]);
//     } finally {
//       setActivitiesLoading(false);
//     }
//   };

//   // ✅ dashboard active hone pe fetch karo
//   if (active === "dashboard") {
//     loadActivities();
//   }
// }, [active]); // ✅ active dependency add karo

// useEffect(() => {
//   const fetchUsers = async () => {
//     try {
//       setUserLoading(true);
//       setUserError(null);

//       const headers = getAuthHeaders();

//       const params = new URLSearchParams();
//       params.set("limit", String(userPageSize));
//       params.set("page", String(userPage));
//       if (userSearch.trim()) params.set("search", userSearch.trim());

//       const [usersRes, statsByUser] = await Promise.all([
//         fetch(`${USERS_BASE}?${params.toString()}`, {
//           headers,
//           credentials: "include",
//         }),
//         fetchDashboardStatsMap(headers),
//       ]);

//       const data = await usersRes.json();

//       if (!usersRes.ok || !data?.success) {
//         throw new Error(data?.error || data?.message || "Failed to load users");
//       }

//       const mapped: UserRow[] = (data.users || []).map((u: any) => {
//         const uid = String(u._id || u.id);
//         const stat = getStatForUser(statsByUser, u);

//         return {
//           id: uid,
//           name: u?.name || "Unknown",
//           email: u?.email || "—",
//           avatar: u?.avatarUrl || undefined,
//           userType: u?.userType,
//           plan: u?.plan ?? null,
//           isVerified: !!u?.isVerified,
//           kycStatus: u?.kycStatus,
//           createdAt: u?.createdAt,
//           lastLoginAt: u?.lastLoginAt,

//           // ✅ Buy = kitne prompts purchase kiye
//           buyProducts: Number(
//             stat.buyProducts ||
//             u?.buyProducts ||
//             u?.purchasedCount ||
//             u?.totalPurchases ||
//             0
//           ),

//           // ✅ Sell = kitne prompts upload kiye
//           saleProducts: Number(
//             stat.uploadedPrompts ||
//             u?.saleProducts ||
//             u?.totalProducts ||
//             u?.totalUploadedPrompts ||
//             0
//           ),

//           totalEarnings: Number(stat.totalEarnings || u?.totalEarnings || u?.volume || 0),
//           totalSpent: Number(stat.totalSpent || u?.totalSpent || 0),
//         };
//       });

//       setUserRows(mapped);
//       setUserTotal(data?.pagination?.total || mapped.length || 0);
//       setUserTotalPages(data?.pagination?.totalPages || 1);
//     } catch (e: any) {
//       setUserError(e?.message || "Error loading users");
//       setUserRows([]);
//       setUserTotal(0);
//       setUserTotalPages(1);
//     } finally {
//       setUserLoading(false);
//     }
//   };

//   if (active === "dashboard" && currentView === "user") fetchUsers();
// }, [active, currentView, userPage, userPageSize, userSearch]);
//   // =======================
//   // Dashboard chart/table/activity data
//   // =======================

//      const recentActivitiesPreview = useMemo(() => {
//   return activities.slice(0, 4);
// }, [activities]);


//  const timeAgo = (dateLike: string) => {
//   const t = new Date(dateLike).getTime();
//   const diff = Date.now() - t;
//   const m = Math.floor(diff / 60000);
//   if (m < 60) return `${m}m ago`;
//   const h = Math.floor(m / 60);
//   if (h < 24) return `${h}h ago`;
//   const d = Math.floor(h / 24);
//   return `${d}d ago`;
// };

// useEffect(() => {
//   const fetchSalesAnalytics = async () => {
//     try {
//       const res = await fetch(
//         `${API_BASE}/api/purchase/analytics/sales`
//       );

//       if (!res.ok) {
//         throw new Error("Failed to fetch sales analytics");
//       }

//       const data = await res.json();

//       if (data.success) {
//         formatChartData(data.monthlySales);
//       }
//     } catch (error) {
//       console.error("Sales analytics error:", error);
//     }
//   };

//   fetchSalesAnalytics();
// }, []);

// const formatChartData = (apiData: any[] = []) => {
//   const monthNames = [
//     "Jan","Feb","Mar","Apr","May","Jun",
//     "Jul","Aug","Sep","Oct","Nov","Dec"
//   ];

//   const today = new Date();

//   // 🔹 last 6 months ka base structure
//   const last6Months = [];

//   for (let i = 5; i >= 0; i--) {
//     const d = new Date(today.getFullYear(), today.getMonth() - i, 1);

//     last6Months.push({
//       year: d.getFullYear(),
//       month: d.getMonth() + 1,
//       name: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
//       blue: 0,
//       green: 0,
//     });
//   }

//   // 🔹 API data merge
//   (Array.isArray(apiData) ? apiData : []).forEach((item: any) => {
//     const index = last6Months.findIndex(
//       m =>
//         m.month === item._id.month &&
//         m.year === item._id.year
//     );

//     if (index !== -1) {
//       last6Months[index].blue = item.revenue || 0;
//       last6Months[index].green = item.totalSales || 0;
//     }
//   });

//   setChartData(last6Months);
// };









// const ReportsSidebar = () => {
//   const [tab, setTab] = useState<"product" | "review">("product");

//   const openCount = (reports || []).filter((r) => r.status === "Open").length;

//   const groupLabel = (p: ReportItem["priority"]) => {
//     if (p === "High") return "HIGH RISK";
//     if (p === "Medium") return "PENDING";
//     return "LOW RISK";
//   };

//   const grouped = useMemo(() => {
//     const list = [...reports].sort(
//       (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//     );

//     return {
//       High: list.filter((r) => r.priority === "High"),
//       Medium: list.filter((r) => r.priority === "Medium"),
//       Low: list.filter((r) => r.priority === "Low"),
//     };
//   }, [reports]);

//   const Item = (r: ReportItem) => {
//     const isActive = selectedReport?.id === r.id;

//     return (
//       <button
//         key={r.id}
//         onClick={() => {
//         setSelectedReport(r);
// setActive("reports");
// setMobileReportsPage("details"); // ✅ on phone open details page

//         }}
//         className={[
//           "w-full text-left px-4 py-4 border-t border-white/10 transition",
//           isActive ? "bg-white/[0.05]" : "hover:bg-white/[0.03]",
//         ].join(" ")}
//       >
//         <div className="flex items-start justify-between gap-3">
//           <div className="min-w-0">
//             <div className="text-xs font-semibold text-white/80">
//               {groupLabel(r.priority)}
//             </div>
//             <div className="mt-2 text-sm font-medium text-white/90 truncate">
//               {r.productTitle || r.title}
//             </div>
//             <div className="mt-1 text-xs text-white/55 truncate">
//               {r.reason}
//               {r.reporterName ? `: Reported by @${r.reporterName}` : ""}
//             </div>
//           </div>

//           <div className="shrink-0 text-xs text-white/45">
//             {timeAgo(r.createdAt)}
//           </div>
//         </div>
//       </button>
//     );
//   };

//   return (
//     <aside className={[kpiCardBase, "overflow-hidden"].join(" ")}>
//       {/* Tabs */}
//       <div className="px-4 pt-4">
//         <div className="flex items-center gap-8 text-sm">
//           <button
//             onClick={() => setTab("product")}
//             className={[
//               "pb-3 transition",
//               tab === "product"
//                 ? "text-white border-b-2 border-fuchsia-400"
//                 : "text-white/60 hover:text-white/85",
//             ].join(" ")}
//           >
//             Product Reports
//           </button>

//           <button
//             onClick={() => setTab("review")}
//             className={[
//               "pb-3 transition",
//               tab === "review"
//                 ? "text-white border-b-2 border-fuchsia-400"
//                 : "text-white/60 hover:text-white/85",
//             ].join(" ")}
//           >
//             Review Moderation
//           </button>
//         </div>
//       </div>

//       {/* Count + Filter */}
//       <div className="px-4 py-4 flex items-center justify-between border-b border-white/10">
//         <div className="text-xs text-white/60 uppercase tracking-wide">
//           {openCount} Pending Reports
//         </div>

//         <button className="text-xs text-white/70 flex items-center gap-2 hover:text-white">
//           <span className="inline-flex items-center justify-center h-8 px-3 rounded-xl border border-white/10 bg-white/[0.03]">
//             <span className="mr-2">⌄</span> FILTER
//           </span>
//         </button>
//       </div>

//       {/* List */}
//       <div className="max-h-[calc(100vh-170px)] overflow-y-auto">
//         {tab === "review" ? (
//           <div className="p-4 text-sm text-white/60">
//             Review moderation (coming soon…)
//           </div>
//         ) : (
//           <>
//             {grouped.High.map(Item)}
//             {grouped.Medium.map(Item)}
//             {grouped.Low.map(Item)}
//           </>
//         )}
//       </div>
//     </aside>
//   );
// };



//   // =============================
//   // ✅ FETCH MARKETPLACE PROMPTS
//   // =============================
//   const [products, setProducts] = useState<PromptProduct[]>([]);
//   const [productsLoading, setProductsLoading] = useState(false);
//   const [productsError, setProductsError] = useState<string | null>(null);
// const isMobile = useMediaQuery("(max-width: 767px)");
// const [mobileReportsPage, setMobileReportsPage] = useState<"list" | "details">("list");


//   // ✅ Categories for filters
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [catsLoading, setCatsLoading] = useState(false);
//   const [catsError, setCatsError] = useState<string | null>(null);

//   // ✅ Sellers
//   // const [sellerRows, setSellerRows] = useState<SellerRow[]>([]);
//   const [sellersLoading, setSellersLoading] = useState(false);
//   const [sellersError, setSellersError] = useState<string | null>(null);
//   const [showAllSellers, setShowAllSellers] = useState(false);
    


//   // ✅ Sellers (pagination + search)

// const [sellerPage, setSellerPage] = useState(1);
// const [sellerPageSize, setSellerPageSize] = useState(10);
// const [sellerTotalPages, setSellerTotalPages] = useState(1);
// const [sellerTotal, setSellerTotal] = useState(0);
// const [sellerSearch, setSellerSearch] = useState("");
//   const totalSellers = useMemo(() => sellerRows.length, [sellerRows]);

//   const totalSellerProducts = useMemo(() => {
//     return sellerRows.reduce((sum, s) => sum + (Number(s.totalProducts) || 0), 0);
//   }, [sellerRows]);

//   const totalMarketplaceProducts = useMemo(() => products.length, [products]);

//    useEffect(() => {
//   const fetchAllSellers = async () => {
//     try {
//       setSellersLoading(true);
//       setSellersError(null);

//       const headers = getAuthHeaders();

//       const [resOrg, resUser, statsByUser] = await Promise.all([
//         fetch(`${SELLERS_BASE}`, {
//           headers,
//           credentials: "include",
//         }),
//         fetch(`${USERS_BASE}?seller=true&limit=1000&page=1`, {
//           headers,
//           credentials: "include",
//         }),
//         fetchDashboardStatsMap(headers),
//       ]);

//       const [orgData, userData] = await Promise.all([
//         resOrg.json(),
//         resUser.json(),
//       ]);

//       if (!resOrg.ok || !orgData?.success) {
//         throw new Error(orgData?.error || "Org sellers failed");
//       }

//       if (!resUser.ok || !userData?.success) {
//         throw new Error(userData?.error || "User sellers failed");
//       }

//       const orgMapped: SellerRow[] = (orgData.sellers || []).map((s: any) => {
//         // In case your Seller document stores the real User id in userId.
//         const statId = String(s?.userId?._id || s?.userId || s?._id || s?.id);
//         const stat = getStatForUser(statsByUser, { ...s, _id: statId });

//         return {
//           id: String(s._id),
//           name: s?.name || "Unknown",
//           email: s?.email || "—",
//           status: s?.status === "SUSPENDED" || s?.isBanned ? "Blocked" : "Active",
//           avatar: s?.avatar || s?.avatarUrl,
//           joined: s?.joined || s?.createdAt || null,
//           kycStatus: s?.kycStatus,
//           isDeleted: !!s?.isDeleted || !!s?.deleted,

//           // ✅ Sell/upload count
//           totalProducts: Number(
//             stat.uploadedPrompts ||
//             s?.totalProducts ||
//             s?.totalUploadedPrompts ||
//             0
//           ),

//           // ✅ Sold count
//           soldProducts: Number(
//             stat.soldProducts ||
//             s?.soldProducts ||
//             s?.totalSoldPrompts ||
//             0
//           ),

//           // ✅ Volume = earning
//           volume: Number(
//             stat.totalEarnings ||
//             s?.volume ||
//             s?.totalEarnings ||
//             0
//           ),
//         };
//       });

//       const userMapped: SellerRow[] = (userData.users || []).map((u: any) => {
//         const uid = String(u._id || u.id);
//         const stat = getStatForUser(statsByUser, u);

//         return {
//           id: uid,
//           name: u?.name || "Unknown",
//           email: u?.email || "—",
//           status: u?.isBanned ? "Blocked" : "Active",
//           avatar: u?.avatarUrl,
//           joined: u?.createdAt || null,
//           kycStatus: u?.kycStatus,
//           isDeleted: !!u?.isDeleted || !!u?.deleted,

//           // ✅ Sell/upload count
//           totalProducts: Number(
//             stat.uploadedPrompts ||
//             u?.totalProducts ||
//             u?.totalUploadedPrompts ||
//             0
//           ),

//           // ✅ Sold count
//           soldProducts: Number(
//             stat.soldProducts ||
//             u?.soldProducts ||
//             u?.totalSoldPrompts ||
//             0
//           ),

//           // ✅ Volume = earning
//           volume: Number(
//             stat.totalEarnings ||
//             u?.volume ||
//             u?.totalEarnings ||
//             0
//           ),
//         };
//       });

//       const merged = [...orgMapped, ...userMapped].reduce((acc, cur) => {
//         const prev = acc.get(cur.id);
//         if (!prev) {
//           acc.set(cur.id, cur);
//         } else {
//           acc.set(cur.id, {
//             ...prev,
//             ...cur,
//             totalProducts: Number(cur.totalProducts || prev.totalProducts || 0),
//             soldProducts: Number(cur.soldProducts || prev.soldProducts || 0),
//             volume: Number(cur.volume || prev.volume || 0),
//           });
//         }
//         return acc;
//       }, new Map<string, SellerRow>());

//       const finalSellers = Array.from(merged.values());
//       const totalRevenue = finalSellers.reduce((sum, seller) => sum + Number(seller.volume ?? 0), 0);

//       setSellerRows(finalSellers);
//       setStats({
//         totalSellers: finalSellers.length,
//         totalRevenue,
//       });
//     } catch (e: any) {
//       setSellersError(e?.message || "Error loading sellers");
//       setSellerRows([]);
//       setStats({ totalSellers: 0, totalRevenue: 0 });
//     } finally {
//       setSellersLoading(false);
//     }
//   };

//   fetchAllSellers();
// }, []);


// useEffect(() => {
//   const loadPendingApprovals = async () => {
//     try {
//       const token = getToken();
//       const headers = {
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       };

//       const [usersRes, sellersRes, sellerUsersRes] = await Promise.all([
//         fetch(`${USERS_BASE}?limit=1000&page=1`, {
//           headers,
//           credentials: "include",
//         }),
//         fetch(`${SELLERS_BASE}`, {
//           headers,
//           credentials: "include",
//         }),
//         fetch(`${USERS_BASE}?seller=true&limit=1000&page=1`, {
//           headers,
//           credentials: "include",
//         }),
//       ]);

//       const [usersData, sellersData, sellerUsersData] = await Promise.all([
//         usersRes.json(),
//         sellersRes.json(),
//         sellerUsersRes.json(),
//       ]);

//       // const isPendingUser = (u: any) => {
//       //   const kyc = String(u?.kycStatus || "");
//       //   const verified = !!u?.isVerified;
//       //   return !verified || kyc === "NOT_SUBMITTED" || kyc === "PENDING";
//       // };

//       // const isPendingSeller = (s: any) => {
//       //   const kyc = String(s?.kycStatus || "");
//       //   const verified = !!s?.verified || !!s?.isVerified;
//       //   return !verified || kyc === "NOT_SUBMITTED" || kyc === "PENDING";
//       // };

//       const isPendingUser = (u: any) => {
//   return String(u?.kycStatus || "") === "PENDING";
// };

// const isPendingSeller = (s: any) => {
//   return String(s?.kycStatus || "") === "PENDING";
// };

//       const pendingUsers = (usersData?.users || []).filter(isPendingUser).length;
//       const pendingOrgSellers = (sellersData?.sellers || []).filter(isPendingSeller).length;
//       const pendingSellerUsers = (sellerUsersData?.users || []).filter(isPendingUser).length;

//       setPendingApprovals(pendingUsers + pendingOrgSellers + pendingSellerUsers);
//     } catch (err) {
//       console.error("Pending approvals fetch failed:", err);
//       setPendingApprovals(0);
//     }
//   };

//   if (active === "dashboard") {
//     loadPendingApprovals();
//   }
// }, [active]);

//   useEffect(() => {
//     const fetchMarketplacePrompts = async () => {
//       try {
//         setProductsLoading(true);
//         setProductsError(null);

//         const token = getToken();
//         const res = await fetch(`${PROMPTS_BASE}/others`, {
//           headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
//           credentials: "include",
//         });

//         const data = await res.json();
//         if (!res.ok || !data?.success) {
//           throw new Error(data?.error || "Failed to load marketplace prompts");
//         }

//         const mapped: PromptProduct[] = (data.prompts || []).map((doc: any) => {
//           const att = doc?.attachment || null;
//           const mediaPath = att?.path || undefined;

//           const imageUrl = att?.type === "image" ? mediaPath : undefined;
//           const videoUrl = att?.type === "video" ? mediaPath : undefined;

//           const status: PromptProduct["status"] =
//             doc?.flagged ? "Flagged" : doc?.draft ? "Draft" : "Published";

//           return {
//             id: String(doc._id),
//             title: doc?.title || "Untitled",
//             uploaderName: doc?.userId?.name || "Unknown",
//            uploaderId:
//   doc?.userId?._id ||
//   doc?.uploaderId?._id ||
//   doc?.uploaderId ||
//   doc?.sellerId?._id ||
//   doc?.sellerId ||
//   null,
//             price:
//               typeof doc?.tokun_price === "number"
//                 ? doc.tokun_price
//                 : typeof doc?.price === "number"
//                 ? doc.price
//                 : 0,
//             status,
//             imageUrl,
//             videoUrl,
//             category:
//               doc?.categories?.[0]?.name ||
//               (Array.isArray(doc?.categories)
//                 ? doc.categories
//                     .map((c: any) =>
//                       typeof c === "string" ? c : c?.name
//                     )
//                     .filter(Boolean)
//                     .join(", ")
//                 : "General"),
//             exclusive: !!doc?.exclusive,
//             sold: !!doc?.sold,
//           };
//         });

//         setProducts(mapped);
//       } catch (e: any) {
//         setProductsError(e?.message || "Error loading products");
//       } finally {
//         setProductsLoading(false);
//       }
//     };

//     fetchMarketplacePrompts();
//   }, []);

//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         setCatsLoading(true);
//         setCatsError(null);

//         const res = await fetch(`${API_BASE}/api/category`, {
//           credentials: "include",
//         });
//         const data = await res.json();

//         if (!res.ok || !data?.success) {
//           throw new Error(data?.error || "Failed to load categories");
//         }
//         setCategories(data.categories || []);
//       } catch (e: any) {
//         setCatsError(e?.message || "Failed to load categories");
//         setCategories([]);
//       } finally {
//         setCatsLoading(false);
//       }
//     };

//     loadCategories();
//   }, []);

//   // =============================
//   // ✅ NAV ITEM
//   // =============================
//   const NavItem = ({
//     id,
//     label,
//     icon,
//   }: {
//     id: NavKey;
//     label: string;
//     icon: React.ReactNode;
//   }) => {
//     const isActive = active === id;
//     return (
//       <button
//         onClick={() => setActive(id)}
//         className={[
//           "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition",
//           isActive ? "text-fuchsia-300" : "text-white/75 hover:text-white",
//         ].join(" ")}
//       >
//         <span className={isActive ? "text-fuchsia-300" : "text-white/55"}>
//           {icon}
//         </span>
//         {label}
//       </button>
//     );
//   };

//   const formatDate = (dateLike?: string | null) => {
//     if (!dateLike) return "—";
//     const d = new Date(dateLike);
//     if (Number.isNaN(d.getTime())) return "—";
//     return d.toLocaleDateString("en-US", {
//       month: "short",
//       day: "2-digit",
//       year: "numeric",
//     });
//   };

//   const activeUsersCount = useMemo(() => {
//   const start = new Date();
//   start.setHours(0, 0, 0, 0);

//   return userRows.filter(u => {
//     if (!u.lastLoginAt) return false;
//     return new Date(u.lastLoginAt).getTime() >= start.getTime();
//   }).length;
// }, [userRows]);

// const MobileBottomNav = () => {
//   const Item = ({
//     id,
//     label,
//     icon,
//   }: {
//     id: NavKey;
//     label: string;
//     icon: React.ReactNode;
//   }) => {
//     const activeNow = active === id;
//     return (
//       <button
//         onClick={() => {
//           setActive(id);
//           if (id === "reports") setMobileReportsPage("list");
//         }}
//         className={[
//           "flex flex-col items-center justify-center gap-1 flex-1 py-2",
//           activeNow ? "text-fuchsia-300" : "text-white/60",
//         ].join(" ")}
//       >
//         <div className={activeNow ? "text-fuchsia-300" : "text-white/50"}>{icon}</div>
//         <div className="text-[11px]">{label}</div>
//       </button>
//     );
//   };

//   return (
//     <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#07080B]/90 backdrop-blur">
//       <div className="mx-auto max-w-[520px] px-3">
//         <div className="flex items-center">
//           <Item id="dashboard" label="Home" icon={<LayoutDashboard className="h-5 w-5" />} />
//           <Item id="sellers" label="Sellers" icon={<Store className="h-5 w-5" />} />
//           <Item id="products" label="Products" icon={<Package className="h-5 w-5" />} />
//           <Item id="reports" label="Reports" icon={<ShieldAlert className="h-5 w-5" />} />
//           <Item id="account" label="Account" icon={<UserRound className="h-5 w-5" />} />
//         </div>
//       </div>
//     </div>
//   );
// };


//   const ReportsMobileList = () => {
//   const grouped = useMemo(() => {
//     const list = [...reports].sort(
//       (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//     );
//     return {
//       High: list.filter((r) => r.priority === "High"),
//       Medium: list.filter((r) => r.priority === "Medium"),
//       Low: list.filter((r) => r.priority === "Low"),
//     };
//   }, [reports]);

//   const open = (r: ReportItem) => {
//     setSelectedReport(r);
//     setMobileReportsPage("details");
//   };

//   const Item = (r: ReportItem) => (
//     <button
//       key={r.id}
//       onClick={() => open(r)}
//       className="w-full text-left px-4 py-4 border-t border-white/10 hover:bg-white/[0.03]"
//     >
//       <div className="flex items-start justify-between gap-3">
//         <div className="min-w-0">
//           <div className="text-xs font-semibold text-white/80">
//             {r.priority === "High" ? "HIGH RISK" : r.priority === "Medium" ? "PENDING" : "LOW RISK"}
//           </div>
//           <div className="mt-2 text-sm font-medium text-white/90 truncate">
//             {r.productTitle || r.title}
//           </div>
//           <div className="mt-1 text-xs text-white/55 truncate">
//             {r.reason}
//             {r.reporterName ? `: Reported by @${r.reporterName}` : ""}
//           </div>
//         </div>
//         <div className="shrink-0 text-xs text-white/45">{timeAgo(r.createdAt)}</div>
//       </div>
//     </button>
//   );

//   return (
//     <section className={`${kpiCardBase} overflow-hidden`}>
//       <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
//         <div className="text-sm font-semibold">Product Reports</div>
//         <div className="text-xs text-white/60">
//           {(reports || []).filter((r) => r.status === "Open").length} Pending
//         </div>
//       </div>

//       <div className="max-h-[calc(100vh-170px)] overflow-y-auto">
//         {grouped.High.map(Item)}
//         {grouped.Medium.map(Item)}
//         {grouped.Low.map(Item)}
//       </div>
//     </section>
//   );
// };


//   // =============================
//   // ✅ REPORTS FLOW (LEFT + RIGHT)
//   // =============================
//   const [reports, setReports] = useState<ReportItem[]>([]);
//   const [reportsLoading, setReportsLoading] = useState(false);
//   const [reportsError, setReportsError] = useState<string | null>(null);
//   const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

//   // ✅ TEMP: mock reports (Replace with API later)
// useEffect(() => {
//   const loadReports = async () => {
//   try {
//     setReportsLoading(true);
//     setReportsError(null);

//     // Ensure the token is available, and add it to the request headers
//     const token = getToken();  // Assuming `getToken()` retrieves the stored JWT token

//     const res = await fetch(REPORTS_BASE, {
//       headers: {
//         Authorization: `Bearer ${token}`,  // Attach token as Bearer token
//       },
//       credentials: "include",  // Include cookies if necessary
//     });

//     const data = await res.json();
//     if (!res.ok || !data?.success)
//       throw new Error(data?.error || "Failed to load reports");

//       const mapped: ReportItem[] = (data.reports || []).map((r: any) => {
//         const prompt = r.prompt || {};
//         const attachment = prompt.attachment || {};
//         const attPath = attachment?.path || "";

//         const previewImageUrl =
//           attachment?.type === "image" ? attPath : undefined;
//         const previewVideoUrl =
//           attachment?.type === "video" ? attPath : undefined;

//         const evidenceFiles =
//           (r.screenshots || []).map((u: string) => ({
//             type: "image" as const,
//             url: u.startsWith("http") ? u : `${API_BASE}${u}`,
//             label: "Screenshot",
//           })) || [];

//         return {
//           id: String(r._id),
//           title: r.resourceTitle || prompt.title || "Report",
//           listingId: String(r.prompt?._id || r.prompt || ""),
//           productId: String(r.prompt?._id || r.prompt || ""),
//           category: r.category?.name || "General",
//           status:
//             r.status === "Pending"
//               ? "Open"
//               : r.status === "Reviewed"
//               ? "Reviewed"
//               : r.status === "Resolved"
//               ? "Actioned"
//               : "Dismissed",
//           priority: "Medium",
//           createdAt: r.createdAt,

//           reporterName: r.reporter?.name,
//           reporterEmail: r.reporter?.email,
//           reason: r.reason,
//           details: r.description || r.stepsToReproduce || "",

//           productTitle: prompt.title,
//           sellerName: prompt.userId?.name,

//           previewImageUrl: previewImageUrl
//             ? previewImageUrl.startsWith("http")
//               ? previewImageUrl
//               : `${API_BASE}${previewImageUrl}`
//             : undefined,

//           previewVideoUrl: previewVideoUrl
//             ? previewVideoUrl.startsWith("http")
//               ? previewVideoUrl
//               : `${API_BASE}${previewVideoUrl}`
//             : undefined,

//           evidence: [
//             ...evidenceFiles,
//             ...(r.resourceURL
//               ? [{ type: "text" as const, text: `Resource URL: ${r.resourceURL}` }]
//               : []),
//           ],
//           history: [{ at: r.createdAt, by: "System", action: "Report created" }],
//         };
//       });
//  setReports(mapped);
//     setSelectedReport((prev) => prev ?? (mapped[0] || null));
//   } catch (e: any) {
//     setReportsError(e?.message || "Failed to load reports");
//     setReports([]);
//   } finally {
//     setReportsLoading(false);
//   }
// };
    


//   loadReports();
// }, []);

//   const Badge = ({
//     children,
//     tone,
//   }: {
//     children: React.ReactNode;
//     tone:
//       | "neutral"
//       | "blue"
//       | "emerald"
//       | "red"
//       | "amber"
//       | "fuchsia"
//       | "slate";
//   }) => {
//     const map: Record<string, string> = {
//       neutral: "bg-white/10 text-white/80 border-white/15",
//       blue: "bg-blue-500/15 text-blue-200 border-blue-500/25",
//       emerald: "bg-emerald-500/15 text-emerald-200 border-emerald-500/25",
//       red: "bg-red-500/15 text-red-200 border-red-500/25",
//       amber: "bg-amber-500/15 text-amber-200 border-amber-500/25",
//       fuchsia: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/25",
//       slate: "bg-slate-500/15 text-slate-200 border-slate-400/25",
//     };
//     return (
//       <span
//         className={[
//           "px-3 py-1 rounded-full text-xs font-medium border inline-flex",
//           map[tone],
//         ].join(" ")}
//       >
//         {children}
//       </span>
//     );
//   };

//   const priorityTone = (p: ReportItem["priority"]) => {
//     if (p === "High") return "red";
//     if (p === "Medium") return "amber";
//     return "slate";
//   };

//   const statusTone = (s: ReportItem["status"]) => {
//     if (s === "Open") return "fuchsia";
//     if (s === "Reviewed") return "blue";
//     if (s === "Dismissed") return "slate";
//     return "emerald";
//   };

//   // ✅ Right panel component
//  const ReportDetailsPanel = ({
//   report,
//   onClose,
//   onDismiss,
//   onFlag,
//   onSuspend,
// }: {
//   report: ReportItem;
//   onClose: () => void;
//   onDismiss: (id: string) => void;
//   onFlag: (listingId: string) => void;
//   onSuspend: (listingId: string) => void;
// }) => {
//   return (
//   <div className="w-full min-w-0 space-y-6">

//       {/* Header row */}
//      <div className={`${kpiCardBase} p-4 md:p-6`}>
//   <div className="flex flex-col gap-4">
//     {/* Title */}
//     <div className="text-center md:text-left">
//       <h1 className="text-[18px] md:text-2xl font-semibold">
//         Report Details: {report.productTitle || report.title}
//       </h1>
//       <div className="mt-2 text-xs md:text-sm text-white/55">
//         Listing ID: {report.listingId} | Category: {report.category}
//       </div>
//     </div>

//     {/* Action Buttons */}
//     <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
//       <button
//         onClick={() => onDismiss(report.id)}
//         className="h-10 px-4 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm w-full"
//       >
//         Dismiss Report
//       </button>
//       <button
//         onClick={() => onFlag(report.listingId)}
//         className="h-10 px-4 rounded-xl bg-[#1677FF] hover:opacity-90 text-sm font-medium w-full"
//       >
//         Flag Product
//       </button>
//       <button
//         onClick={() => onSuspend(report.listingId)}
//         className="h-10 px-4 rounded-xl bg-red-500 hover:opacity-90 text-sm font-medium w-full"
//       >
//         Suspend Listing
//       </button>
//     </div>
//   </div>
// </div>

//       {/* Main 2 columns like image */}
//       <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
//         {/* LEFT listing card (bigger) */}
//         <div className="lg:col-span-3 space-y-5">
//           <div className={`${kpiCardBase} overflow-hidden`}>
//             {/* Preview */}
//             <div className="h-[360px] bg-black/40 relative">
//               {report.previewImageUrl ? (
//                 <img
//                   src={report.previewImageUrl}
//                   className="absolute inset-0 w-full h-full object-cover"
//                   alt="preview"
//                 />
//               ) : (
//                 <div className="absolute inset-0 flex items-center justify-center text-white/60">
//                   No Preview
//                 </div>
//               )}
//             </div>

//             {/* Listing info */}
//             <div className="p-6">
//               <div className="flex items-center justify-between">
//                 <div className="text-xl font-semibold">
//                   {report.productTitle || report.title}
//                 </div>
//                 <div className="text-sm text-white/60">2.45 ETH</div>
//               </div>

//               <div className="mt-3 text-sm text-white/65 leading-relaxed">
//                 {report.details || "—"}
//               </div>

//               <div className="mt-5 flex items-center gap-3">
//                 <img
//                   src="https://i.pravatar.cc/60?img=15"
//                   className="h-11 w-11 rounded-full border border-white/10 object-cover"
//                   alt="seller"
//                 />
//                 <div>
//                   <div className="text-sm text-white/85">
//                     Seller: @{(report.sellerName || "Seller").replace(/\s+/g, "")}
//                   </div>
//                   <div className="text-xs text-white/50">
//                     Member since Jan 2022 · 4.9 Rating
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Evidence thumbnails row like image */}
//           <div>
//             <div className="text-lg font-semibold mb-3">Review Evidence & Files</div>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {(report.evidence || [])
//                 .filter((e) => e.type !== "text")
//                 .slice(0, 4)
//                 .map((e, idx) => (
//                   <div
//                     key={idx}
//                     className="h-[120px] rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02]"
//                   >
//                     {e.url ? (
//                       <img
//                         src={e.url}
//                         className="w-full h-full object-cover"
//                         alt="evidence"
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
//                         File
//                       </div>
//                     )}
//                   </div>
//                 ))}
//             </div>
//           </div>
//         </div>

//         {/* RIGHT complaint + history like image */}
//         <div className="lg:col-span-2 space-y-5">
//           {/* Complaint Information */}
//           <div className={`${kpiCardBase} p-6`}>
//             <h2 className="text-xl font-semibold">Complaint Information</h2>

//             <div className="mt-5">
//               <div className="text-xs text-white/50 uppercase tracking-wide">
//                 Reason for Report
//               </div>
//               <div className="mt-2 text-sm text-white/80">
//                 {report.reason}
//               </div>
//             </div>

//             <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
//               <div className="text-xs text-white/60">Reporter Comments</div>
//               <div className="mt-2 text-sm text-white/75 leading-relaxed">
//                 {report.details ||
//                   "Requesting immediate action based on the reported issue."}
//               </div>
//             </div>

//             <div className="mt-5 flex items-center gap-3">
//               <img
//                 src="https://i.pravatar.cc/70?img=33"
//                 className="h-11 w-11 rounded-full border border-white/10 object-cover"
//                 alt="reporter"
//               />
//               <div>
//                 <div className="text-sm text-white/85">
//                   Reported By: {report.reporterName || "Anonymous"}
//                 </div>
//                 <div className="text-xs text-white/50">
//                   Account Standing: Verified Contributor
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Seller report history (table look) */}
//           <div className={`${kpiCardBase} p-6`}>
//             <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
//               Seller Report History
//             </div>

//             <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
//               <div className="grid grid-cols-3 px-4 py-3 text-xs text-white/55 bg-white/[0.03]">
//                 <div>Date</div>
//                 <div>Reasons</div>
//                 <div className="text-right">Action</div>
//               </div>

//               <div className="divide-y divide-white/10">
//                 {(report.history || []).slice(0, 2).map((h, idx) => (
//                   <div key={idx} className="grid grid-cols-3 px-4 py-4 text-sm bg-white/[0.02]">
//                     <div className="text-white/70">{formatDate(h.at)}</div>
//                     <div className="text-white/70">{h.note || h.action}</div>
//                     <div className="text-right text-white/80">{h.action}</div>
//                   </div>
//                 ))}

//                 {(report.history || []).length === 0 && (
//                   <div className="px-4 py-4 text-sm text-white/60">
//                     No previous actions.
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };



//   // ✅ Reports View (LEFT list + RIGHT panel)
//   const ReportsView = () => {
//     const [query, setQuery] = useState("");
//     const [status, setStatus] = useState<"all" | ReportItem["status"]>("all");
//     const [priority, setPriority] = useState<"all" | ReportItem["priority"]>(
//       "all"
//     );

//     const filtered = useMemo(() => {
//       const q = query.trim().toLowerCase();
//       let list = [...reports];

//       if (status !== "all") list = list.filter((r) => r.status === status);
//       if (priority !== "all") list = list.filter((r) => r.priority === priority);

//       if (q) {
//         list = list.filter(
//           (r) =>
//             r.title.toLowerCase().includes(q) ||
//             r.listingId.toLowerCase().includes(q) ||
//             (r.productTitle || "").toLowerCase().includes(q) ||
//             (r.sellerName || "").toLowerCase().includes(q) ||
//             (r.reason || "").toLowerCase().includes(q)
//         );
//       }

//       // Open first, then by newest
//       list.sort((a, b) => {
//         if (a.status === "Open" && b.status !== "Open") return -1;
//         if (a.status !== "Open" && b.status === "Open") return 1;
//         return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
//       });

//       return list;
//     }, [reports, query, status, priority]);

//     const dismissReport = (id: string) => {
//       setReports((prev) =>
//         prev.map((r) =>
//           r.id === id
//             ? {
//                 ...r,
//                 status: "Dismissed",
//                 history: [
//                   ...(r.history || []),
//                   {
//                     at: new Date().toISOString(),
//                     by: adminName,
//                     action: "Dismissed report",
//                   },
//                 ],
//               }
//             : r
//         )
//       );

//       // also update selected
//       setSelectedReport((prev) =>
//         prev?.id === id ? { ...prev, status: "Dismissed" } : prev
//       );
//     };

//     const flagProduct = (listingId: string) => {
//       // TODO: call your backend flag endpoint
//       console.log("Flag listing:", listingId);

//       setSelectedReport((prev) =>
//         prev
//           ? {
//               ...prev,
//               status: "Actioned",
//               history: [
//                 ...(prev.history || []),
//                 {
//                   at: new Date().toISOString(),
//                   by: adminName,
//                   action: "Flagged product",
//                   note: `Listing: ${listingId}`,
//                 },
//               ],
//             }
//           : prev
//       );
//     };

//     const suspendListing = (listingId: string) => {
//       // TODO: call your backend suspend endpoint
//       console.log("Suspend listing:", listingId);

//       setSelectedReport((prev) =>
//         prev
//           ? {
//               ...prev,
//               status: "Actioned",
//               history: [
//                 ...(prev.history || []),
//                 {
//                   at: new Date().toISOString(),
//                   by: adminName,
//                   action: "Suspended listing",
//                   note: `Listing: ${listingId}`,
//                 },
//               ],
//             }
//           : prev
//       );
//     };

//     return (
//       <>
//         {/* Page title */}
//           <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
//   <div className="text-center md:text-left">
//     <div className="flex items-center justify-center md:justify-start gap-3">
//       <h1 className="text-[24px] md:text-[34px] leading-[1.1] font-semibold">
//         Reports & Complaints
//       </h1>
//       <span className="px-3 py-1 rounded-full text-xs font-medium bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-500/25">
//         {(reports || []).filter((r) => r.status === "Open").length} Open
//       </span>
//     </div>
//     <p className="mt-2 text-white/60 text-sm">
//       Review and take action on reported listings and policy violations
//     </p>
//   </div>
// </div>

//         {/* Filters */}
//         <section className={`${kpiCardBase} mt-6 p-4`}>
//           <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
//             {/* Search */}
//             <div className="flex-1 relative">
//               <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
//               <input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
//                 placeholder="Search by report title, listing ID, seller, reason..."
//               />
//             </div>

//             <div className="flex gap-3 flex-wrap justify-start lg:justify-end">
//               <Select value={status} onValueChange={(v: any) => setStatus(v)}>
//                 <SelectTrigger className="h-11 w-[160px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
//                   <SelectValue placeholder="All Status" />
//                 </SelectTrigger>
//                 <SelectContent className="max-h-[280px]">
//                   <SelectItem value="all">All Status</SelectItem>
//                   <SelectItem value="Open">Open</SelectItem>
//                   <SelectItem value="Reviewed">Reviewed</SelectItem>
//                   <SelectItem value="Dismissed">Dismissed</SelectItem>
//                   <SelectItem value="Actioned">Actioned</SelectItem>
//                 </SelectContent>
//               </Select>

//               <Select
//                 value={priority}
//                 onValueChange={(v: any) => setPriority(v)}
//               >
//                 <SelectTrigger className="h-11 w-[160px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
//                   <SelectValue placeholder="All Priority" />
//                 </SelectTrigger>
//                 <SelectContent className="max-h-[280px]">
//                   <SelectItem value="all">All Priority</SelectItem>
//                   <SelectItem value="High">High</SelectItem>
//                   <SelectItem value="Medium">Medium</SelectItem>
//                   <SelectItem value="Low">Low</SelectItem>
//                 </SelectContent>
//               </Select>

//               <button
//                 onClick={() => {
//                   setQuery("");
//                   setStatus("all");
//                   setPriority("all");
//                 }}
//                 className="h-11 px-4 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80 flex items-center gap-2"
//               >
//                 <X className="h-4 w-4" />
//                 Clear
//               </button>
//             </div>
//           </div>
//         </section>

//         {/* Left + Right layout */}
//     {/* ✅ MOBILE: list OR details (full width) */}
// <div className="block md:hidden mt-6">
//   {mobileReportsPage === "list" ? (
//     <ReportsMobileList />
//   ) : selectedReport ? (
//     <div className="w-full min-w-0">
//       {/* ✅ Back */}
//       <button
//         onClick={() => setMobileReportsPage("list")}
//         className="mb-4 text-sm text-white/70 hover:text-white"
//       >
//         ← Back to reports
//       </button>

//       <ReportDetailsPanel
//         report={selectedReport}
//         onClose={() => {
//           setSelectedReport(null);
//           setMobileReportsPage("list");
//         }}
//         onDismiss={(id) => {
//           dismissReport(id);
//           setMobileReportsPage("list");
//         }}
//         onFlag={(listingId) => flagProduct(listingId)}
//         onSuspend={(listingId) => suspendListing(listingId)}
//       />
//     </div>
//   ) : (
//     <ReportsMobileList />
//   )}
// </div>

// {/* ✅ DESKTOP: keep your existing UI */}
// <div className="hidden md:block mt-6">
//   {/* KEEP your current desktop section here */}
//   <section className="w-full">
//     <div className="w-full min-w-0">
//       {!selectedReport ? (
//         <div className={`${kpiCardBase} p-10 flex items-center justify-center text-white/60`}>
//           Select a report from the left to view details.
//         </div>
//       ) : (
//         <div className="w-full min-w-0">
//           <ReportDetailsPanel
//             report={selectedReport}
//             onClose={() => setSelectedReport(null)}
//             onDismiss={dismissReport}
//             onFlag={flagProduct}
//             onSuspend={suspendListing}
//           />
//         </div>
//       )}
//     </div>
//   </section>
// </div>


//       </>
//     );
//   };
// const SellersMobileCards = ({
//   rows,
// }: {
//   rows: SellerRow[];
// }) => {
//   return (
//     <div className="space-y-5">
//       {rows.map((r) => (
//         <div key={r.id} className={`${kpiCardBase} p-5`}>
//           <div className="flex items-start justify-between gap-3">
//             <div className="flex items-center gap-3 min-w-0">
//               <img
//                 src={r.avatar || "https://i.pravatar.cc/80?img=12"}
//                 className="h-12 w-12 rounded-full object-cover border border-white/10"
//                 alt={r.name}
//               />
//               <div className="min-w-0">
//                 <div className="text-sm font-semibold text-white/90 truncate">{r.name}</div>
//                 <div className="text-xs text-white/50 truncate">{r.email}</div>
//               </div>
//             </div>

//             <span
//               className={[
//                 "px-4 py-1.5 rounded-full text-xs font-medium border shrink-0",
//                 r.status === "Active"
//                   ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
//                   : "bg-red-500/15 text-red-200 border-red-500/25",
//               ].join(" ")}
//             >
//               {r.status}
//             </span>
//           </div>

//           <div className="mt-5 grid grid-cols-2 gap-4">
//             <div>
//               <div className="text-[11px] text-white/45 uppercase tracking-wide">Total Products</div>
//               <div className="mt-1 text-lg text-white/90">{Number(r.totalProducts || 0)}</div>
//             </div>
//             <div className="text-right">
//               <div className="text-[11px] text-white/45 uppercase tracking-wide">Joined Date</div>
//               <div className="mt-1 text-sm text-white/80">{formatDate(r.joined)}</div>
//             </div>
//           </div>

//           <div className="mt-5 flex items-center gap-3">
//             <button
//               className={[
//                 "flex-1 h-11 rounded-xl border text-sm font-medium",
//                 r.status === "Active"
//                   ? "border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/15"
//                   : "border-sky-500/25 bg-sky-500/10 text-sky-200 hover:bg-sky-500/15",
//               ].join(" ")}
//               onClick={() => console.log("toggle block", r.id)}
//             >
//               {r.status === "Active" ? "🚫 Block" : "🔓 Unblocked"}
//             </button>

//             <button
//               className="h-11 w-12 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center"
//               onClick={() => console.log("delete", r.id)}
//               aria-label="Delete"
//             >
//               🗑
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };


// const SellersView = () => {
//   const [query, setQuery] = useState("");
//   const [tab, setTab] = useState<"all" | "active" | "blocked" | "deleted">("all");
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
//   const [sellerLoading, setSellerLoading] = useState(false);
//   const [sellerError, setSellerError] = useState<string | null>(null);
//   const [sellerProducts, setSellerProducts] = useState<PromptProduct[]>([]);

//   // ✅ Popup state
//   const [confirmPopup, setConfirmPopup] = useState<{
//     type: "block" | "unblock" | "delete" | "restore";
//     seller: SellerRow;
//   } | null>(null);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [actionError, setActionError] = useState<string | null>(null);

//   // ✅ Block / Unblock API call
//   const handleBlockToggle = async (seller: SellerRow) => {
//     const action = seller.status === "Active" ? "block" : "unblock";
//     try {
//       setActionLoading(true);
//       setActionError(null);
//       const token = getToken();
//       const res = await fetch(`${SELLERS_BASE}/${seller.id}/block`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         credentials: "include",
//         body: JSON.stringify({ action }),
//       });
//       const data = await res.json();
//       if (!res.ok || !data?.success) throw new Error(data?.error || "Failed");

//       // ✅ Update local state
//       setSellerRows((prev) =>
//         prev.map((s) =>
//           s.id === seller.id
//             ? { ...s, status: action === "block" ? "Blocked" : "Active" }
//             : s
//         )
//       );
//       setConfirmPopup(null);
//     } catch (e: any) {
//       setActionError(e?.message || "Action failed");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // ✅ Soft Delete / Restore API call
//   const handleDeleteToggle = async (seller: SellerRow) => {
//     const action = seller.isDeleted ? "restore" : "delete";
//     try {
//       setActionLoading(true);
//       setActionError(null);
//       const token = getToken();
//       const res = await fetch(`${SELLERS_BASE}/${seller.id}/soft-delete`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         credentials: "include",
//         body: JSON.stringify({ action }),
//       });
//       const data = await res.json();
//       if (!res.ok || !data?.success) throw new Error(data?.error || "Failed");

//       // ✅ Update local state
//       setSellerRows((prev) =>
//         prev.map((s) =>
//           s.id === seller.id
//             ? {
//                 ...s,
//                 isDeleted: action === "delete",
//                 status: action === "delete" ? "Blocked" : "Active",
//               }
//             : s
//         )
//       );
//       setConfirmPopup(null);
//     } catch (e: any) {
//       setActionError(e?.message || "Action failed");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const openSellerProfile = async (sellerId?: string | null) => {
//     if (!sellerId) return;
//     try {
//       setSellerLoading(true);
//       setSellerError(null);
//       const token = getToken();
//       const resSeller = await fetch(`${SELLERS_BASE}/${sellerId}`, {
//         headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
//         credentials: "include",
//       });
//       const sellerData = await resSeller.json();
//       if (!resSeller.ok || !sellerData?.success)
//         throw new Error(sellerData?.error || "Failed to load seller profile");

//       const resPrompts = await fetch(`${PROMPTS_BASE}/by-seller/${sellerId}`, {
//         headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
//         credentials: "include",
//       });
//       const promptData = await resPrompts.json();
//       if (!resPrompts.ok || !promptData?.success)
//         throw new Error(promptData?.error || "Failed to load seller products");

//      const s = sellerData.seller;

// const derivedTotalEarnings = (promptData.prompts || []).reduce((sum: number, doc: any) => {
//   const price = Number(doc?.price ?? doc?.tokun_price ?? 0);

//   const sales = Number(
//     doc?.sales ??
//     doc?.purchases ??
//     doc?.totalSales ??
//     doc?.totalPurchases ??
//     doc?.salesCount ??
//     doc?.purchaseCount ??
//     doc?.orderCount ??
//     0
//   );

//   const revenue = Number(
//     doc?.revenue ??
//     doc?.totalRevenue ??
//     doc?.totalEarning ??
//     doc?.earnings ??
//     doc?.cost ??
//     doc?.totalCost ??
//     (sales * price) ??
//     0
//   );

//   return sum + (Number.isFinite(revenue) ? revenue : 0);
// }, 0);

// setSelectedSeller({
//   id: String(s?._id || sellerId),
//   name: s?.name || "Unknown",
//   email: s?.email,
//   location: s?.location,
//   joined: s?.joined,
//   status: s?.status || "ACTIVE",
//   avatar: s?.avatar,
//   verified: !!s?.verified,
//   totalEarnings:
//     typeof s?.totalEarnings === "number" && s.totalEarnings > 0
//       ? s.totalEarnings
//       : derivedTotalEarnings,
//   rating: s?.rating ?? 0,
//   reviewsCount: s?.reviewsCount ?? 0,
//   refundRate: s?.refundRate ?? 0,
//   refundThreshold: s?.refundThreshold ?? 5,
// });

//       const mapped: PromptProduct[] = (promptData.prompts || []).map((doc: any) => {
//         const att = doc?.attachment || null;
//         const status: PromptProduct["status"] =
//           doc?.flagged ? "Flagged" : doc?.draft ? "Draft" : "Published";
//         return {
//           id: String(doc._id),
//           title: doc?.title || "Untitled",
//           uploaderName: doc?.userId?.name || "Unknown",
//           uploaderId:
//   doc?.userId?._id ||
//   doc?.uploaderId?._id ||
//   doc?.uploaderId ||
//   doc?.sellerId?._id ||
//   doc?.sellerId ||
//   null,
//           price: typeof doc?.price === "number" ? doc.price : 0,
//           status,
//           imageUrl: att?.type === "image" ? att?.path : undefined,
//           videoUrl: att?.type === "video" ? att?.path : undefined,
//           category: doc?.categories?.[0]?.name || "General",
//           exclusive: !!doc?.exclusive,
//           sold: !!doc?.sold,
//         };
//       });
//       setSellerProducts(mapped);
//     } catch (e: any) {
//       setSellerError(e?.message || "Error loading seller profile");
//     } finally {
//       setSellerLoading(false);
//     }
//   };

//   const closeSellerProfile = () => {
//     setSelectedSeller(null);
//     setSellerProducts([]);
//     setSellerError(null);
//   };

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     let list = [...sellerRows];

//     if (tab === "active") list = list.filter((s) => s.status === "Active" && !s.isDeleted);
//     else if (tab === "blocked") list = list.filter((s) => s.status === "Blocked" && !s.isDeleted);
//     else if (tab === "deleted") list = list.filter((s) => !!s.isDeleted);
//     else list = list.filter((s) => !s.isDeleted); // "all" = non-deleted

//     if (q) {
//       list = list.filter(
//         (s) =>
//           s.name.toLowerCase().includes(q) ||
//           s.email.toLowerCase().includes(q)
//       );
//     }
//     return list;
//   }, [sellerRows, query, tab]);

//   const total = filtered.length;
//   const totalPages = Math.max(1, Math.ceil(total / pageSize));
//   const safePage = Math.min(page, totalPages);
//   const startIndex = (safePage - 1) * pageSize;
//   const endIndex = Math.min(startIndex + pageSize, total);
//   const pageRows = filtered.slice(startIndex, endIndex);

//   useEffect(() => { setPage(1); }, [query, tab, pageSize]);

//   if (selectedSeller) {
//     return (
//       <SellerProfileView
//         seller={selectedSeller}
//         products={sellerProducts}
//         loading={sellerLoading}
//         error={sellerError}
//         onBack={closeSellerProfile}
//       />
//     );
//   }

//   // ✅ Popup labels helper
//   const popupConfig = confirmPopup
//     ? {
//         block: {
//           title: "Block Seller?",
//           desc: `Are you sure you want to block "${confirmPopup.seller.name}"? They won't be able to sell on the platform.`,
//           confirmLabel: "Yes, Block",
//           confirmClass: "bg-red-500 hover:opacity-90",
//         },
//         unblock: {
//           title: "Unblock Seller?",
//           desc: `Are you sure you want to unblock "${confirmPopup.seller.name}"? They will regain access to sell.`,
//           confirmLabel: "Yes, Unblock",
//           confirmClass: "bg-emerald-500 hover:opacity-90",
//         },
//         delete: {
//           title: "Delete Seller?",
//           desc: `Are you sure you want to delete "${confirmPopup.seller.name}"? This is a soft delete — you can restore them later.`,
//           confirmLabel: "Yes, Delete",
//           confirmClass: "bg-red-500 hover:opacity-90",
//         },
//         restore: {
//           title: "Restore Seller?",
//           desc: `Are you sure you want to restore "${confirmPopup.seller.name}"? They will be moved back to Active sellers.`,
//           confirmLabel: "Yes, Restore",
//           confirmClass: "bg-emerald-500 hover:opacity-90",
//         },
//       }[confirmPopup.type]
//     : null;

//   return (
//     <>
//       {/* ✅ CONFIRM POPUP */}
//       {confirmPopup && popupConfig && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
//           <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0F1117] p-6 shadow-2xl">
//             <h2 className="text-lg font-semibold text-white">{popupConfig.title}</h2>
//             <p className="mt-3 text-sm text-white/65 leading-relaxed">{popupConfig.desc}</p>

//             {actionError && (
//               <div className="mt-3 text-xs text-red-400">{actionError}</div>
//             )}

//             <div className="mt-6 flex gap-3">
//               <button
//                 onClick={() => { setConfirmPopup(null); setActionError(null); }}
//                 className="flex-1 h-11 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-sm text-white/80"
//                 disabled={actionLoading}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => {
//                   if (confirmPopup.type === "block" || confirmPopup.type === "unblock") {
//                     handleBlockToggle(confirmPopup.seller);
//                   } else {
//                     handleDeleteToggle(confirmPopup.seller);
//                   }
//                 }}
//                 className={`flex-1 h-11 rounded-xl text-sm font-medium text-white ${popupConfig.confirmClass} disabled:opacity-60`}
//                 disabled={actionLoading}
//               >
//                 {actionLoading ? "Please wait…" : popupConfig.confirmLabel}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <div className="mt-2 md:mt-0">
//         <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-4 md:gap-6">
//           <div className="text-center md:text-left w-full">
//             <h1 className="text-[24px] md:text-[34px] leading-[1.05] font-semibold">
//               Seller Management
//             </h1>
//             <p className="mt-1 text-white/60 text-sm text-center md:text-left">
//               Manage and monitor digital product sellers on the platform
//             </p>
//             <div className="flex gap-3 mt-4 justify-center md:justify-start">
//               <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-200 border border-blue-500/25">
//                 {filtered.length.toLocaleString()} Sellers
//               </span>
//               <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-200 border border-emerald-500/25">
//                 {products.length.toLocaleString()} Products
//               </span>
//             </div>
//           </div>
//           <div className="hidden md:block" />
//           <div className="flex justify-center md:justify-end w-full">
//             <button className="h-9 sm:h-10 px-5 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90">
//               <Plus className="h-4 w-4" />
//               Add Member
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Search + Tabs */}
//       <section className={`${kpiCardBase} mt-6 p-4`}>
//         <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
//           <div className="flex-1 relative">
//             <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
//             <input
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
//               placeholder="Search sellers by name or email..."
//             />
//           </div>

//           {/* ✅ Tabs — All / Active / Blocked / Deleted */}
//           <div className="overflow-x-auto">
//             <div className="h-11 p-1 rounded-xl border border-white/10 bg-white/[0.03] flex items-center gap-1 w-max">
//               {(["all", "active", "blocked", "deleted"] as const).map((t) => (
//                 <button
//                   key={t}
//                   onClick={() => setTab(t)}
//                   className={[
//                     "h-9 px-4 rounded-lg text-sm capitalize whitespace-nowrap",
//                     tab === t
//                       ? t === "deleted"
//                         ? "bg-red-500/20 text-red-200 border border-red-500/25"
//                         : "bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] text-white"
//                       : "text-white/70 hover:text-white",
//                   ].join(" ")}
//                 >
//                   {t === "all" ? "All Sellers" : t === "deleted" ? "🗑 Deleted" : t.charAt(0).toUpperCase() + t.slice(1)}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ✅ MOBILE: Cards */}
//       <div className="md:hidden mt-6">
//         {sellersLoading && <div className="text-white/70 text-sm">Loading sellers…</div>}
//         {!!sellersError && !sellersLoading && <div className="text-red-400 text-sm">{sellersError}</div>}
//         {!sellersLoading && !sellersError && (
//           <div className="space-y-5">
//             {pageRows.map((r) => (
//               <div key={r.id} className={`${kpiCardBase} p-5`}>
//                 <div className="flex items-start justify-between gap-3">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <img
//                       src={r.avatar || "https://i.pravatar.cc/80?img=12"}
//                       className="h-12 w-12 rounded-full object-cover border border-white/10"
//                       alt={r.name}
//                     />
//                     <div className="min-w-0">
//   <button
//     type="button"
//     onClick={() => openSellerProfile(r.id)}
//     className="text-sm font-semibold text-white/90 truncate hover:text-sky-400 text-left block w-full"
//   >
//     {r.name}
//   </button>
//   <div className="text-xs text-white/50 truncate">{r.email}</div>
// </div>
//                   </div>
//                   <span className={[
//                     "px-3 py-1 rounded-full text-xs font-medium border shrink-0",
//                     r.isDeleted
//                       ? "bg-red-500/15 text-red-300 border-red-500/25"
//                       : r.status === "Active"
//                       ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
//                       : "bg-red-500/15 text-red-200 border-red-500/25",
//                   ].join(" ")}>
//                     {r.isDeleted ? "Deleted" : r.status}
//                   </span>
//                 </div>

//                 <div className="mt-4 grid grid-cols-2 gap-3 text-center">
//                   <div>
//                     <div className="text-[11px] text-white/45 uppercase tracking-wide">Products</div>
//                     <div className="mt-1 text-base text-white/90">{Number(r.totalProducts || 0)}</div>
//                   </div>
//                   <div>
//                     <div className="text-[11px] text-white/45 uppercase tracking-wide">Joined</div>
//                     <div className="mt-1 text-sm text-white/80">{formatDate(r.joined)}</div>
//                   </div>
//                 </div>

//                 <div className="mt-4 flex gap-2">
//                   {/* Block / Unblock */}
//                   {!r.isDeleted && (
//                     <button
//                       onClick={() => setConfirmPopup({
//                         type: r.status === "Active" ? "block" : "unblock",
//                         seller: r,
//                       })}
//                       className={[
//                         "flex-1 h-10 rounded-xl border text-xs font-medium",
//                         r.status === "Active"
//                           ? "border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/15"
//                           : "border-sky-500/25 bg-sky-500/10 text-sky-200 hover:bg-sky-500/15",
//                       ].join(" ")}
//                     >
//                       {r.status === "Active" ? "🚫 Block" : "✅ Unblock"}
//                     </button>
//                   )}

//                   {/* Delete / Restore */}
//                   <button
//                     onClick={() => setConfirmPopup({
//                       type: r.isDeleted ? "restore" : "delete",
//                       seller: r,
//                     })}
//                     className={[
//                       "flex-1 h-10 rounded-xl border text-xs font-medium",
//                       r.isDeleted
//                         ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
//                         : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]",
//                     ].join(" ")}
//                   >
//                     {r.isDeleted ? "↩ Restore" : "🗑 Delete"}
//                   </button>
//                 </div>
//               </div>
//             ))}
//             {pageRows.length === 0 && (
//               <div className="text-white/60 text-sm text-center py-8">No sellers found.</div>
//             )}
//           </div>
//         )}

//         {/* Mobile Pagination */}
//         <div className="mt-6 flex items-center justify-between">
//           <button
//             disabled={safePage <= 1}
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//             className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40 text-sm"
//           >
//             Previous
//           </button>
//           <div className="text-xs text-white/60">Page {safePage} / {totalPages}</div>
//           <button
//             disabled={safePage >= totalPages}
//             onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//             className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40 text-sm"
//           >
//             Next
//           </button>
//         </div>
//       </div>

//       {/* ✅ DESKTOP: Table */}
//       <div className="hidden md:block">
//         <section className={`${kpiCardBase} mt-6 p-6`}>
//           {sellersLoading && <div className="p-6 text-white/70 text-sm">Loading sellers…</div>}
//           {!!sellersError && !sellersLoading && <div className="p-6 text-red-400 text-sm">{sellersError}</div>}

//           {!sellersLoading && !sellersError && (
//             <>
//               <div className="overflow-hidden rounded-2xl border border-white/10">
//                 <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
//                   <div className="col-span-4">Seller Name</div>
//                   <div className="col-span-2">Status</div>
//                   <div className="col-span-2">Volume</div>
//                   <div className="col-span-3">Joined Date</div>
//                   <div className="col-span-1 text-right">Actions</div>
//                 </div>

//                 <div className="divide-y divide-white/10">
//                   {pageRows.map((r) => (
//                     <div
//                       key={r.id}
//                       className={[
//                         "grid grid-cols-12 gap-3 px-5 py-5 items-center",
//                         r.isDeleted ? "bg-red-500/[0.04]" : "bg-white/[0.02]",
//                       ].join(" ")}
//                     >
//                       <div className="col-span-4 flex items-center gap-4 min-w-0">
//                         <img
//                           src={r.avatar || "https://i.pravatar.cc/80?img=12"}
//                           alt={r.name}
//                           className={[
//                             "h-12 w-12 rounded-full object-cover border border-white/10",
//                             r.isDeleted ? "opacity-50" : "",
//                           ].join(" ")}
//                         />
//                         <div className="min-w-0">
//                           <button
//                             onClick={() => openSellerProfile(r.id)}
//                             className="text-sm font-medium text-white/90 truncate hover:text-sky-400 focus:outline-none"
//                           >
//                             {r.name}
//                           </button>
//                           <div className="text-xs text-white/45 truncate">{r.email}</div>
//                         </div>
//                       </div>

//                       <div className="col-span-2">
//                         <span className={[
//                           "px-3 py-1.5 rounded-full text-xs font-medium border inline-flex",
//                           r.isDeleted
//                             ? "bg-red-500/15 text-red-300 border-red-500/25"
//                             : r.status === "Active"
//                             ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
//                             : "bg-red-500/15 text-red-200 border-red-500/25",
//                         ].join(" ")}>
//                           {r.isDeleted ? "Deleted" : r.status}
//                         </span>
//                       </div>

//                       <div className="col-span-2 text-sm text-white/80 font-medium">
//                         ₹{Number(r.volume ?? 0).toLocaleString("en-IN")}
//                       </div>

//                       <div className="col-span-3 text-sm text-white/75">
//                         {formatDate(r.joined)}
//                       </div>

//                       <div className="col-span-1 flex justify-end items-center gap-3">
//                         {/* Block / Unblock */}
//                         {!r.isDeleted && (
//                           <button
//                             onClick={() => setConfirmPopup({
//                               type: r.status === "Active" ? "block" : "unblock",
//                               seller: r,
//                             })}
//                             className={[
//                               "text-xs font-medium",
//                               r.status === "Active"
//                                 ? "text-red-400 hover:text-red-300"
//                                 : "text-sky-400 hover:text-sky-300",
//                             ].join(" ")}
//                           >
//                             {r.status === "Active" ? "Block" : "Unblock"}
//                           </button>
//                         )}

//                         {/* Delete / Restore */}
//                         <button
//                           onClick={() => setConfirmPopup({
//                             type: r.isDeleted ? "restore" : "delete",
//                             seller: r,
//                           })}
//                           className={[
//                             "text-xs font-medium",
//                             r.isDeleted
//                               ? "text-emerald-400 hover:text-emerald-300"
//                               : "text-white/50 hover:text-white/80",
//                           ].join(" ")}
//                         >
//                           {r.isDeleted ? "Restore" : "🗑"}
//                         </button>
//                       </div>
//                     </div>
//                   ))}

//                   {pageRows.length === 0 && (
//                     <div className="p-6 text-white/60 text-sm">No sellers found.</div>
//                   )}
//                 </div>
//               </div>

//               {/* Pagination */}
//               <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//                 <div className="text-sm text-white/60">
//                   Showing {total === 0 ? 0 : startIndex + 1} to {endIndex} of {total} sellers
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <button
//                     disabled={safePage <= 1}
//                     onClick={() => setPage((p) => Math.max(1, p - 1))}
//                     className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40"
//                   >
//                     Previous
//                   </button>
//                   {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
//                     const p = i + 1;
//                     return (
//                       <button
//                         key={p}
//                         onClick={() => setPage(p)}
//                         className={[
//                           "h-9 w-9 rounded-lg border border-white/10",
//                           safePage === p
//                             ? "bg-white/15 text-white"
//                             : "bg-white/[0.04] hover:bg-white/[0.06] text-white/80",
//                         ].join(" ")}
//                       >
//                         {p}
//                       </button>
//                     );
//                   })}
//                   <button
//                     disabled={safePage >= totalPages}
//                     onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                     className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40"
//                   >
//                     Next
//                   </button>
//                 </div>
//                 <div className="flex items-center gap-3 justify-end">
//                   <div className="text-sm text-white/60">Show per page</div>
//                   <select
//                     value={pageSize}
//                     onChange={(e) => setPageSize(Number(e.target.value))}
//                     className="h-9 px-3 rounded-lg bg-black/30 border border-white/10 text-white"
//                   >
//                     {[10, 20, 50, 100].map((n) => (
//                       <option key={n} value={n}>{n}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </>
//           )}
//         </section>
//       </div>
//     </>
//   );
// };

 
// const ProductsView = () => {
//   const [query, setQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [priceFilter, setPriceFilter] = useState<string>("all");
//   const [sortFilter, setSortFilter] = useState<string>("none");
//   const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
//   const [sellerLoading, setSellerLoading] = useState(false);
//   const [sellerError, setSellerError] = useState<string | null>(null);
//   const [sellerProducts, setSellerProducts] = useState<PromptProduct[]>([]);

//   // ✅ PAGINATION STATE
//   const [page, setPage] = useState(1);
//   const [pageSize] = useState(10);

//   // ... openSellerProfile, closeSellerProfile same rahega ...

//   const resetFilters = () => {
//     setQuery("");
//     setSelectedCategory("all");
//     setStatusFilter("all");
//     setPriceFilter("all");
//     setSortFilter("none");
//     setPage(1); // ✅ reset page on filter clear
//   };

//   const matchesPrice = (price: number) => {
//     if (priceFilter === "all") return true;
//     if (priceFilter === "free") return price === 0;
//     if (priceFilter === "paid") return price > 0;
//     if (priceFilter === "0-5") return price >= 0 && price <= 5;
//     if (priceFilter === "5-10") return price > 5 && price <= 10;
//     if (priceFilter === "10-20") return price > 10 && price <= 20;
//     if (priceFilter === "20+") return price > 20;
//     return true;
//   };

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     let list = [...products];

//     if (q) {
//       list = list.filter(
//         (p) =>
//           p.title.toLowerCase().includes(q) ||
//           p.uploaderName.toLowerCase().includes(q) ||
//           (p.category || "").toLowerCase().includes(q)
//       );
//     }
//     if (selectedCategory !== "all") {
//       const cat = selectedCategory.toLowerCase();
//       list = list.filter((p) => (p.category || "").toLowerCase().includes(cat));
//     }
//     if (statusFilter !== "all") {
//       list = list.filter((p) => p.status === statusFilter);
//     }
//     list = list.filter((p) => matchesPrice(p.price));
//     if (sortFilter === "price_desc") {
//       list.sort((a, b) => (b.price || 0) - (a.price || 0));
//     } else if (sortFilter === "price_asc") {
//       list.sort((a, b) => (a.price || 0) - (b.price || 0));
//     }
//     return list;
//   }, [products, query, selectedCategory, statusFilter, priceFilter, sortFilter]);

//   // ✅ Reset page when filters change
//   useEffect(() => {
//     setPage(1);
//   }, [query, selectedCategory, statusFilter, priceFilter, sortFilter]);

//   // ✅ PAGINATION CALCULATION
//   const total = filtered.length;
//   const totalPages = Math.max(1, Math.ceil(total / pageSize));
//   const safePage = Math.min(page, totalPages);
//   const startIndex = (safePage - 1) * pageSize;
//   const endIndex = Math.min(startIndex + pageSize, total);
//   const pageProducts = filtered.slice(startIndex, endIndex); // ✅ sirf 10


// const openSellerProfile = async (sellerId?: string | null) => {
//   if (!sellerId) return;

//   try {
//     setSellerLoading(true);
//     setSellerError(null);

//     const token = getToken();

//     const resSeller = await fetch(`${SELLERS_BASE}/${sellerId}`, {
//       headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
//       credentials: "include",
//     });
//     const sellerData = await resSeller.json();

//     if (!resSeller.ok || !sellerData?.success) {
//       throw new Error(sellerData?.error || "Failed to load seller profile");
//     }

//     const resPrompts = await fetch(`${PROMPTS_BASE}/by-seller/${sellerId}`, {
//       headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
//       credentials: "include",
//     });
//     const promptData = await resPrompts.json();

//     if (!resPrompts.ok || !promptData?.success) {
//       throw new Error(promptData?.error || "Failed to load seller products");
//     }

//     const s = sellerData.seller;

//     const derivedTotalEarnings = (promptData.prompts || []).reduce((sum: number, doc: any) => {
//       const price = Number(doc?.price ?? doc?.tokun_price ?? 0);

//       const sales = Number(
//         doc?.sales ??
//         doc?.purchases ??
//         doc?.totalSales ??
//         doc?.totalPurchases ??
//         doc?.salesCount ??
//         doc?.purchaseCount ??
//         doc?.orderCount ??
//         0
//       );

//       const revenue = Number(
//         doc?.revenue ??
//         doc?.totalRevenue ??
//         doc?.totalEarning ??
//         doc?.earnings ??
//         doc?.cost ??
//         doc?.totalCost ??
//         (sales * price) ??
//         0
//       );

//       return sum + (Number.isFinite(revenue) ? revenue : 0);
//     }, 0);

//     setSelectedSeller({
//       id: String(s?._id || sellerId),
//       name: s?.name || "Unknown",
//       email: s?.email,
//       location: s?.location,
//       joined: s?.joined,
//       status: s?.status || "ACTIVE",
//       avatar: s?.avatar,
//       verified: !!s?.verified,
//       totalEarnings:
//         typeof s?.totalEarnings === "number" && s.totalEarnings > 0
//           ? s.totalEarnings
//           : derivedTotalEarnings,
//       rating: s?.rating ?? 0,
//       reviewsCount: s?.reviewsCount ?? 0,
//       refundRate: s?.refundRate ?? 0,
//       refundThreshold: s?.refundThreshold ?? 5,
//     });

//     const mapped: PromptProduct[] = (promptData.prompts || []).map((doc: any) => {
//       const att = doc?.attachment || null;
//       const status: PromptProduct["status"] =
//         doc?.flagged ? "Flagged" : doc?.draft ? "Draft" : "Published";

//       return {
//         id: String(doc._id),
//         title: doc?.title || "Untitled",
//         uploaderName: doc?.userId?.name || "Unknown",
//         uploaderId:
//           doc?.userId?._id ||
//           doc?.uploaderId?._id ||
//           doc?.uploaderId ||
//           doc?.sellerId?._id ||
//           doc?.sellerId ||
//           null,
//         price: typeof doc?.price === "number" ? doc.price : 0,
//         status,
//         imageUrl: att?.type === "image" ? att?.path : undefined,
//         videoUrl: att?.type === "video" ? att?.path : undefined,
//         category: doc?.categories?.[0]?.name || "General",
//         exclusive: !!doc?.exclusive,
//         sold: !!doc?.sold,
//       };
//     });

//     setSellerProducts(mapped);
//   } catch (e: any) {
//     setSellerError(e?.message || "Error loading seller profile");
//   } finally {
//     setSellerLoading(false);
//   }
// };

// const closeSellerProfile = () => {
//   setSelectedSeller(null);
//   setSellerProducts([]);
//   setSellerError(null);
// };



//   if (selectedSeller) {
//     return (
//       <SellerProfileView
//         seller={selectedSeller}
//         products={sellerProducts}
//         loading={sellerLoading}
//         error={sellerError}
//         onBack={closeSellerProfile}
//       />
//     );
//   }

//   return (
//     <>
//       {/* Header — same rahega */}
//       <div className="mt-2 md:mt-0">
//         <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-4 md:gap-6">
//           <div className="text-center md:text-left w-full">
//             <h1 className="text-[24px] md:text-[34px] leading-[1.05] font-semibold">
//               Product Management
//             </h1>
//             <p className="mt-1 text-white/60 text-sm">
//               Manage and monitor digital products on the platform
//             </p>
//           </div>
//           <div className="hidden md:block" />
//           <div className="flex justify-center md:justify-end w-full">
//             <button className="h-9 sm:h-10 px-5 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90">
//               <Plus className="h-4 w-4" />
//               Add Product
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* KPI — same rahega */}
//       <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
//         <div className={`${kpiCardBase} p-6`}>
//           <div className="text-xs tracking-[0.2em] text-white/60">TOTAL LISTING</div>
//           <div className="mt-4 text-3xl font-semibold">{products.length}</div>
//           <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
//             <TrendingUp className="h-4 w-4" />
//             Live from marketplace
//           </div>
//         </div>
//         <div className={`${kpiCardBase} p-6`}>
//           <div className="text-xs tracking-[0.2em] text-white/60">FLAGGED PRODUCT</div>
//           <div className="mt-4 text-3xl font-semibold">
//             {products.filter((p) => p.status === "Flagged").length}
//           </div>
//           <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
//             <TriangleAlert className="h-4 w-4" />
//             High Priority
//           </div>
//         </div>
//       </section>

//       {/* Search + Filters — same rahega */}
//       <section className={`${kpiCardBase} mt-6 p-4`}>
//         <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
//           <div className="flex-1 relative">
//             <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
//             <input
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
//               placeholder="Search products by name, seller, category..."
//             />
//           </div>
//           <div className="flex flex-wrap gap-3 justify-start lg:justify-end">
//             <Select value={selectedCategory} onValueChange={setSelectedCategory}>
//               <SelectTrigger className="h-11 w-[170px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
//                 <SelectValue placeholder={catsLoading ? "Loading..." : "All Categories"} />
//               </SelectTrigger>
//               <SelectContent className="max-h-[280px]">
//                 <SelectItem value="all">All Categories</SelectItem>
//                 {(categories || []).map((c) => (
//                   <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Select value={priceFilter} onValueChange={setPriceFilter}>
//               <SelectTrigger className="h-11 w-[160px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
//                 <SelectValue placeholder="Price Range" />
//               </SelectTrigger>
//               <SelectContent className="max-h-[280px]">
//                 <SelectItem value="all">All Prices</SelectItem>
//                 <SelectItem value="free">Free</SelectItem>
//                 <SelectItem value="paid">Paid</SelectItem>
//                 <SelectItem value="0-5">₹0 - ₹5</SelectItem>
//                 <SelectItem value="5-10">₹5 - ₹10</SelectItem>
//                 <SelectItem value="10-20">₹10 - ₹20</SelectItem>
//                 <SelectItem value="20+">₹20+</SelectItem>
//               </SelectContent>
//             </Select>

//             <Select value={statusFilter} onValueChange={setStatusFilter}>
//               <SelectTrigger className="h-11 w-[150px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
//                 <SelectValue placeholder="All Status" />
//               </SelectTrigger>
//               <SelectContent className="max-h-[280px]">
//                 <SelectItem value="all">All Status</SelectItem>
//                 <SelectItem value="Published">Published</SelectItem>
//                 <SelectItem value="Draft">Draft</SelectItem>
//                 <SelectItem value="Flagged">Flagged</SelectItem>
//               </SelectContent>
//             </Select>

//             <Select value={sortFilter} onValueChange={setSortFilter}>
//               <SelectTrigger className="h-11 w-[190px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
//                 <SelectValue placeholder="Sort By Price" />
//               </SelectTrigger>
//               <SelectContent className="max-h-[280px]">
//                 <SelectItem value="none">No Sorting</SelectItem>
//                 <SelectItem value="price_desc">Price: High → Low</SelectItem>
//                 <SelectItem value="price_asc">Price: Low → High</SelectItem>
//               </SelectContent>
//             </Select>

//             <button
//               onClick={resetFilters}
//               className="h-11 px-4 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80 flex items-center gap-2"
//             >
//               <X className="h-4 w-4" />
//               Clear
//             </button>
//           </div>
//         </div>
//         {catsError && (
//           <div className="mt-3 text-xs text-red-400">Category load failed: {catsError}</div>
//         )}
//       </section>

//       {/* Loading / Error */}
//       {productsLoading && (
//         <div className="mt-6 text-white/70 text-sm">Loading products…</div>
//       )}
//       {!!productsError && !productsLoading && (
//         <div className="mt-6 text-red-400 text-sm">{productsError}</div>
//       )}

//       {/* ✅ Products Grid — pageProducts use karo filtered ki jagah */}
//       {!productsLoading && !productsError && (
//         <>
//           <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//             {pageProducts.map((p) => {
//               const hasImage = !!p.imageUrl;
//               const hasVideo = !!p.videoUrl;

//               return (
//                 <div
//                   key={p.id}
//                   className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
//                 >
//                   <div className="relative h-[230px] bg-black/40">
//                     {hasImage ? (
//   <img
//     src={p.imageUrl}
//     alt={p.title}
//     className="absolute inset-0 w-full h-full object-cover"
//   />
// ) : hasVideo ? (
//   <video
//     src={p.videoUrl}
//     className="absolute inset-0 w-full h-full object-cover"
//     controls
//     muted
//     playsInline
//     preload="metadata"
//   />
// ) : (
//   <div className="absolute inset-0 w-full h-full flex items-center justify-center">
//     <div className="flex items-center gap-2 text-white/60 text-sm">
//       <ImageIcon className="h-5 w-5" />
//       No Preview
//     </div>
//   </div>
// )}

//                     <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-sky-500/15 text-sky-200 border border-sky-500/25">
//                       {p.status}
//                     </span>

//                     {p.exclusive && (
//                       <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-200 border border-emerald-500/25">
//                         ONE-TIME{p.sold ? " • SOLD" : ""}
//                       </span>
//                     )}
//                   </div>

//                   <div className="bg-[#111827] text-white p-4">
//                     <div className="text-[13px] font-semibold leading-snug truncate text-white/90">
//                       {p.title}
//                     </div>
//                     <div className="mt-2 text-[12px] text-white/60 truncate">
//                       by{" "}
//                     <button
//   type="button"
//   onClick={() => {
//     console.log("SELLER CLICK", p.uploaderId, p);
//     openSellerProfile(p.uploaderId);
//   }}
//   className="text-sky-300 hover:underline font-medium"
// >
//   {p.uploaderName}
// </button>
//                       {p.category ? ` • ${p.category}` : ""}
//                     </div>
//                     <div className="mt-3 flex items-center justify-between">
//                       <div className="text-sm font-semibold text-white">
//                         {p.price > 0 ? `₹${p.price.toFixed(2)}` : "FREE"}
//                       </div>
//                       <div className="text-xs text-white/45">
//                         ID: {p.id.slice(-6)}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}

//             {pageProducts.length === 0 && (
//               <div className="col-span-full text-center text-white/70 py-10">
//                 No products found.
//               </div>
//             )}
//           </section>

//           {/* ✅ PAGINATION — seller wale jaisa */}
//           {total > 0 && (
//             <div className="mt-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//               {/* Showing count */}
//               <div className="text-sm text-white/60">
//                 Showing {total === 0 ? 0 : startIndex + 1} to {endIndex} of {total} products
//               </div>

//               {/* Page buttons */}
//               <div className="flex items-center gap-2">
//                 <button
//                   disabled={safePage <= 1}
//                   onClick={() => setPage((p) => Math.max(1, p - 1))}
//                   className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40 text-sm text-white/80"
//                 >
//                   Previous
//                 </button>

//                 {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
//                   const p = i + 1;
//                   return (
//                     <button
//                       key={p}
//                       onClick={() => setPage(p)}
//                       className={[
//                         "h-9 w-9 rounded-lg border border-white/10 text-sm",
//                         safePage === p
//                           ? "bg-white/15 text-white"
//                           : "bg-white/[0.04] hover:bg-white/[0.06] text-white/80",
//                       ].join(" ")}
//                     >
//                       {p}
//                     </button>
//                   );
//                 })}

//                 <button
//                   disabled={safePage >= totalPages}
//                   onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                   className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40 text-sm text-white/80"
//                 >
//                   Next
//                 </button>
//               </div>

//               {/* Mobile: simple prev/next only */}
//               <div className="flex md:hidden items-center justify-between w-full">
//                 <button
//                   disabled={safePage <= 1}
//                   onClick={() => setPage((p) => Math.max(1, p - 1))}
//                   className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] disabled:opacity-40 text-sm text-white/80"
//                 >
//                   Previous
//                 </button>
//                 <span className="text-xs text-white/60">
//                   Page {safePage} / {totalPages}
//                 </span>
//                 <button
//                   disabled={safePage >= totalPages}
//                   onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                   className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] disabled:opacity-40 text-sm text-white/80"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </>
//   );
// };

// const formatMonthYear = (dateLike?: string) => {
//   if (!dateLike) return "—";
//   const d = new Date(dateLike);
//   if (Number.isNaN(d.getTime())) return "—";
//   return d.toLocaleString("en-US", { month: "long", year: "numeric" });
// };



// const SellerProfileView = ({
//   seller,
//   products,
//   loading,
//   error,
//   onBack,
// }: {
//   seller: SellerProfile;
//   products: PromptProduct[];
//   loading: boolean;
//   error: string | null;
//   onBack: () => void;
// }) => {
//   return (
//     <>
//       {/* Title */}
//      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//   <div className="text-center md:text-left">
//     <button
//       onClick={onBack}
//       className="text-sm text-white/60 hover:text-white/90"
//     >
//       ← Back to Products
//     </button>
//     <h1 className="mt-2 text-[24px] md:text-[34px] leading-[1.1] font-semibold">
//       Seller Profile
//     </h1>
//   </div>
// </div>

//       {/* Top profile card */}
//       <div className={`${kpiCardBase} mt-6 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5`}>
//         <div className="flex items-center gap-4">
//           <img
//             src={seller.avatar || "https://i.pravatar.cc/100?img=11"}
//             className="h-14 w-14 rounded-full object-cover border border-white/10"
//             alt={seller.name}
//           />
//           <div>
//             <div className="flex items-center gap-3">
//               <div className="text-xl font-semibold">{seller.name}</div>
//               <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-200 border border-emerald-500/25">
//                 {seller.status || "ACTIVE"}
//               </span>
//             </div>
//            <div className="mt-1 text-xs text-white/50">
//   Seller ID: {seller.id} • Joined: {formatMonthYear(seller.joined)} • Email: {seller.email || "—"}
// </div>
//           </div>
//         </div>

// {/* ✅ Actions: mobile = 3 equal buttons, desktop = row */}
// <div className="w-full lg:w-auto grid grid-cols-3 gap-3">
//   <button className="h-11 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm inline-flex items-center justify-center gap-2">
//     <MessageSquare className="h-4 w-4 text-sky-300" />
//     <span className="hidden sm:inline">Message</span>
//   </button>

//   <button className="h-11 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm inline-flex items-center justify-center gap-2">
//     <Download className="h-4 w-4 text-white/80" />
//     <span className="hidden sm:inline">Export</span>
//   </button>

//   <button className="h-11 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/15 text-sm inline-flex items-center justify-center gap-2 text-red-300">
//     <Ban className="h-4 w-4" />
//     <span className="hidden sm:inline">Suspend</span>
//   </button>
// </div>

//       </div>

//       {/* KPI row */}
//       <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
//         <div className={`${kpiCardBase} p-6`}>
//           <div className="text-xs tracking-[0.2em] text-white/60">TOTAL EARNINGS</div>
//           <div className="mt-4 text-3xl font-semibold">
//             ₹{Number(seller.totalEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
//           </div>
//           <div className="mt-3 text-sm text-emerald-400">Vs. last 30 days</div>
//         </div>

//         <div className={`${kpiCardBase} p-6`}>
//           <div className="text-xs tracking-[0.2em] text-white/60">CUSTOMER RATING</div>
//           <div className="mt-4 text-3xl font-semibold">
//             {seller.rating || 0}/5.0 ⭐
//           </div>
//           <div className="mt-3 text-sm text-emerald-400">
//             From {seller.reviewsCount || 0} reviews
//           </div>
//         </div>

//         <div className={`${kpiCardBase} p-6`}>
//           <div className="text-xs tracking-[0.2em] text-white/60">REFUND RATE</div>
//           <div className="mt-4 text-3xl font-semibold">{seller.refundRate || 0}%</div>
//           <div className="mt-3 text-sm text-sky-300">
//             Threshold: {seller.refundThreshold || 5}% max
//           </div>
//         </div>
//       </section>

//       {/* Products table */}
//       <div className={`${kpiCardBase} mt-6 p-6`}>
//         <div className="flex items-center justify-between">
//           <h2 className="text-lg font-semibold">All Products ({products.length})</h2>
//           <button className="text-sm text-[#3A7CFF] hover:underline">View All</button>
//         </div>

//         {loading && <div className="mt-6 text-white/70 text-sm">Loading seller data…</div>}
//         {!!error && !loading && <div className="mt-6 text-red-400 text-sm">{error}</div>}

//         {!loading && !error && (
//           <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
//             <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
//               <div className="col-span-4">PRODUCT</div>
//               <div className="col-span-3">CATEGORY</div>
//               <div className="col-span-2">PRICE</div>
//               <div className="col-span-2">SALES</div>
//               <div className="col-span-1 text-right">ACTIONS</div>
//             </div>

//             <div className="divide-y divide-white/10">
//               {products.slice(0, 4).map((p) => (
//                 <div key={p.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center bg-white/[0.02]">
//                   <div className="col-span-4">
//                     <div className="text-sm font-medium text-white/90">{p.title}</div>
//                     <div className="text-xs text-white/50">{p.status}</div>
//                   </div>
//                   <div className="col-span-3 text-sm text-white/75">{p.category || "General"}</div>
//                   <div className="col-span-2 text-sm text-white/75">
//                     {p.price > 0 ? `₹${p.price}` : "FREE"}
//                   </div>
//                   <div className="col-span-2 text-sm text-white/75">—</div>
//                   <div className="col-span-1 flex justify-end gap-3 text-white/70">
//                     <button className="hover:text-white">✎</button>
//                     <button className="hover:text-red-300">🗑</button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="p-5 flex justify-center">
//              <button
//   onClick={() => setShowAllSellers(true)}
//   className="text-sm text-[#3A7CFF] hover:underline"
// >
//   View All
// </button>


//             </div>
//           </div>
//         )}
//       </div>

//       {/* Bottom: activity + verification (UI only) */}
//       <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
//         <div className={`${kpiCardBase} p-6`}>
//           <h2 className="text-lg font-semibold">Seller Activity Log</h2>
//           <div className="mt-6 space-y-4">
//             {[
//               { t: "New product listing created", d: "React Dash Template was uploaded", time: "2 minutes ago" },
//               { t: "Payout requested", d: "Request for $1,200.00 processed", time: "1 hour ago" },
//               { t: "Updated “Abstract UI Kit”", d: "Modified price from $45 to $49", time: "3 hours ago" },
//               { t: "Policy update", d: "Updated Terms of Service sent to sellers", time: "Yesterday" },
//             ].map((a, idx) => (
//               <div key={idx} className="flex gap-4">
//                 <div className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.04]" />
//                 <div>
//                   <div className="text-sm font-medium text-white/90">{a.t}</div>
//                   <div className="text-xs text-white/55 mt-1">{a.d}</div>
//                   <div className="text-[11px] text-white/40 mt-1">{a.time}</div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <button className="mt-6 w-full h-10 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80">
//             View Full History
//           </button>
//         </div>

//         <div className={`${kpiCardBase} p-6`}>
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-semibold">Identity Verification</h2>
//             <span className="text-xs text-emerald-300">VERIFIED</span>
//           </div>

//           <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] h-[220px] flex items-center justify-center text-white/60">
//             View Document
//           </div>

//           <div className="mt-4 flex items-center justify-between">
//             <div className="text-sm text-white/80">Tax Compliance Doc</div>
//             <span className="text-xs text-emerald-300">VERIFIED</span>
//           </div>

//           <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 flex items-center justify-between">
//             <div className="text-sm text-white/70">Tax_Form_2023.pdf</div>
//             <button className="text-white/70 hover:text-white">⬇</button>
//           </div>

//           <div className="mt-4 flex gap-3">
//             <button className="flex-1 h-10 rounded-xl bg-red-500/15 text-red-200 border border-red-500/25 hover:bg-red-500/20 text-sm font-medium">
//               Reject Verification
//             </button>
//             <button className="flex-1 h-10 rounded-xl bg-[#1677FF] hover:opacity-90 text-sm font-medium">
//               Approve Docs
//             </button>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// };

// const AccountView = ({
//   adminName,
//   adminEmail,
//   totalMembers,
//   activeToday,
//   pendingInvite,
// }: {
//   adminName: string;
//   adminEmail: string;
//   totalMembers: number;
//   activeToday: number;
//   pendingInvite: number;
// }) => {
//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmNewPassword, setConfirmNewPassword] = useState("");

//   const teamRows = [
//     { name: "Abstract UI Kit", status: "Live Listing", role: "Super admin", lastActive: "Online Now" },
//     { name: "3D Icon Set v2", status: "Live Listing", role: "Moderator", lastActive: "15 min ago" },
//     { name: "React Dash Template", status: "Draft", role: "Support", lastActive: "Yesterday" },
//     { name: "Motion Backgrounds", status: "Live Listing", role: "Admin", lastActive: "3 days ago" },
//   ];

//   return (
//     <>
//       {/* Title */}
//       <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
//   <div className="text-center md:text-left">
//     <h1 className="text-[24px] md:text-[34px] leading-[1.1] font-semibold">
//       Admin Profile
//     </h1>
//     <p className="mt-2 text-white/60 text-sm">
//       Manage your account and security settings
//     </p>
//   </div>
// </div>

//       {/* Profile Card */}
//       <section className={`${kpiCardBase} mt-8 p-6`}>
//         <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
//           <div className="flex items-center gap-4">
//             <img
//               src={"https://i.pravatar.cc/120?img=12"}
//               alt={adminName}
//               className="h-16 w-16 rounded-full object-cover border border-white/10"
//             />
//             <div>
//               <div className="text-xl font-semibold">{adminName}</div>
//               <div className="text-sm text-white/50">Super Admin</div>
//             </div>
//           </div>

//           <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
//             <div>
//               <label className="text-xs text-white/60">Full name</label>
//               <input
//                 value={adminName}
//                 readOnly
//                 className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
//               />
//             </div>

//             <div>
//               <label className="text-xs text-white/60">Email address</label>
//               <input
//                 value={adminEmail || "—"}
//                 readOnly
//                 className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
//               />
//             </div>

//             <div>
//               <label className="text-xs text-white/60">Role</label>
//               <input
//                 value={"Super Admin"}
//                 readOnly
//                 className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/50"
//               />
//             </div>

//             <div>
//               <label className="text-xs text-white/60">Timezone</label>
//               <input
//                 value={"Asia/Kolkata"}
//                 readOnly
//                 className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
//               />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Security Management */}
//       <section className={`${kpiCardBase} mt-6 p-6`}>
//         <h2 className="text-lg font-semibold">Security Management</h2>

//         <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5 items-end">
//           <div>
//             <label className="text-xs text-white/60">Current Password</label>
//             <input
//               type="password"
//               value={currentPassword}
//               onChange={(e) => setCurrentPassword(e.target.value)}
//               className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
//             />
//           </div>

//           <div>
//             <label className="text-xs text-white/60">New Password</label>
//             <input
//               type="password"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
//             />
//           </div>

//           <div>
//             <label className="text-xs text-white/60">Confirm new password</label>
//             <input
//               type="password"
//               value={confirmNewPassword}
//               onChange={(e) => setConfirmNewPassword(e.target.value)}
//               className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
//             />
//           </div>

//           <div className="flex justify-start lg:justify-end">
//             <button
//               type="button"
//               onClick={() => {
//                 // TODO: call your update password API
//                 console.log("update password");
//               }}
//               className="h-11 px-6 rounded-xl bg-[#1677FF] hover:opacity-90 text-sm font-medium"
//             >
//               Update password
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* KPI Cards */}
//       <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
//         <div className={`${kpiCardBase} p-6`}>
//           <div className="text-xs tracking-[0.2em] text-white/60">TOTAL MEMBER</div>
//           <div className="mt-4 text-3xl font-semibold">{totalMembers}</div>
//         </div>

//         <div className={`${kpiCardBase} p-6`}>
//           <div className="text-xs tracking-[0.2em] text-white/60">ACTIVE TODAY</div>
//           <div className="mt-4 text-3xl font-semibold">{activeToday}</div>
//         </div>

//         <div className={`${kpiCardBase} p-6`}>
//           <div className="text-xs tracking-[0.2em] text-white/60">PENDING INVITE</div>
//           <div className="mt-4 text-3xl font-semibold">{pendingInvite}</div>
//         </div>
//       </section>

//       {/* Team Members Management */}
//       <section className={`${kpiCardBase} mt-6 p-6`}>
//         <h2 className="text-lg font-semibold">Team Members Management</h2>

//         <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
//           <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
//             <div className="col-span-5">MEMBERS</div>
//             <div className="col-span-3">ROLE</div>
//             <div className="col-span-3">LAST ACTIVE</div>
//             <div className="col-span-1 text-right">ACTIONS</div>
//           </div>

//           <div className="divide-y divide-white/10">
//             {teamRows.map((m, idx) => (
//               <div key={idx} className="grid grid-cols-12 gap-3 px-5 py-4 items-center bg-white/[0.02]">
//                 <div className="col-span-5 flex items-center gap-3 min-w-0">
//                   <div className="h-10 w-10 rounded-full bg-white/10 border border-white/10" />
//                   <div className="min-w-0">
//                     <div className="text-sm font-medium text-white/90 truncate">{m.name}</div>
//                     <div className="text-xs text-white/45 truncate">{m.status}</div>
//                   </div>
//                 </div>

//                 <div className="col-span-3">
//                   <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/15 text-emerald-200 border border-emerald-500/25">
//                     {m.role}
//                   </span>
//                 </div>

//                 <div className="col-span-3 text-sm text-white/70">
//                   {m.lastActive === "Online Now" ? (
//                     <span className="inline-flex items-center gap-2">
//                       <span className="h-2 w-2 rounded-full bg-emerald-400" />
//                       Online Now
//                     </span>
//                   ) : (
//                     m.lastActive
//                   )}
//                 </div>

//                 <div className="col-span-1 flex justify-end gap-3 text-white/70">
//                   <button className="hover:text-white" title="Edit">✎</button>
//                   <button className="hover:text-red-300" title="Delete">🗑</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="mt-5 text-xs text-white/45">Showing 1 to {teamRows.length} of {teamRows.length} members</div>
//       </section>
//     </>
//   );
// };





//   return (
//     <div className="min-h-screen w-full bg-[#07080B] text-white font-inter">
//       {/* Top Nav */}
//       <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07080B]/80 backdrop-blur">
//         <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
//           <div className="h-[74px] flex items-center">


            
//             {/* LEFT: Brand */}
//             <div className="flex items-center">
//               <div className="text-white font-semibold tracking-wide">
//                 Tokun Admin
//               </div>
//             </div>

//             {/* CENTER: Nav */}
//             <div className="hidden md:flex flex-1 justify-center">
//               <nav className="flex items-center gap-2">
//                 <NavItem
//                   id="dashboard"
//                   label="Dashboard"
//                   icon={<LayoutDashboard className="h-4 w-4" />}
//                 />
//                 <NavItem
//                   id="sellers"
//                   label="Sellers"
//                   icon={<Store className="h-4 w-4" />}
//                 />
//                 <NavItem
//                   id="products"
//                   label="Products"
//                   icon={<Package className="h-4 w-4" />}
//                 />
//                 <NavItem
//                   id="analytics"
//                   label="Analytics"
//                   icon={<LineChart className="h-4 w-4" />}
//                 />

//                 <NavItem id="reports" label="Reports" icon={<ShieldAlert className="h-4 w-4" />} />

//               </nav>
//             </div>

            

//             {/* RIGHT: Actions */}
//             <div className="flex items-center gap-3 ml-auto">
//               <button
//                 className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] flex items-center justify-center"
//                 aria-label="Notifications"
//               >
//                 <Bell className="h-5 w-5 text-white/80" />
//               </button>

//           <DropdownMenu>
//   <DropdownMenuTrigger asChild>
//     <button className="h-10 px-4 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] flex items-center gap-2">
//       <span className="text-sm text-white/80">Hello, {adminName}</span>
//       <ChevronDown className="h-4 w-4 text-white/70" />
//     </button>
//   </DropdownMenuTrigger>

//   <DropdownMenuContent
//     align="end"
//     className="w-44 rounded-xl border border-white/10 bg-[#0B0D12] text-white shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
//   >
//     <DropdownMenuItem
//       onClick={() => setActive("account")}
//       className="cursor-pointer focus:bg-white/[0.06]"
//     >
//       Account
//     </DropdownMenuItem>

//     <DropdownMenuSeparator className="bg-white/10" />

//     {/* Optional (if you want later)
//     <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
//     */}
//   </DropdownMenuContent>
// </DropdownMenu>


//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Body */}
 
// {/* Body */}
// <div className="w-full">
//   <div className="flex w-full">
//     {/* ✅ LEFT: Always-visible Reports Sidebar */}
//   {/* ✅ LEFT: Reports Sidebar (DESKTOP ONLY) */}
// <div className="hidden md:block w-[380px] shrink-0 pl-5 sm:pl-6 pr-4 py-10">
//   <div className="sticky top-[90px] h-[calc(100vh-110px)]">
//     <ReportsSidebar />
//   </div>
// </div>


//     {/* ✅ RIGHT: Pages (never broken by sidebar) */}
// <main className="flex-1 min-w-0 py-10 px-5 sm:px-6 md:pl-0 md:pr-5 lg:pr-6 pb-24 md:pb-10">

//    <div className={active === "reports" ? "w-full" : "mx-auto max-w-[1200px]"}>


//               {active === "dashboard" && currentView === "seller" && (
//   <>
//     {/* Title Row */}
  
//    {/* Title Row */}
// {/* ✅ Dashboard Header (Desktop aligned like your screenshot) */}
 
// <div className="mt-2 md:mt-0">
//   <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-3 md:gap-6">
//     {/* LEFT: Title */}
//     <div className="text-center md:text-left w-full">
//       <h1 className="text-[24px] md:text-[34px] leading-[1.05] font-semibold">
//         Dashboard
//       </h1>
//       <p className="mt-1 text-white/60 text-sm">Admin Overview</p>
//     </div>

//     {/* CENTER: Seller/User pills */}
//     <div className="flex justify-center w-full">
//       <div className="flex flex-row items-center justify-center gap-2">
//         <button
//           onClick={() => setCurrentView("seller")}
//           className={[
//             "h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2",
//             currentView === "seller"
//               ? "bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
//               : "bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]",
//           ].join(" ")}
//         >
//           <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//           Seller
//         </button>

//         <button
//           onClick={() => setCurrentView("user")}
//           className={[
//             "h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2",
//             currentView === "user"
//               ? "bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
//               : "bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]",
//           ].join(" ")}
//         >
//           <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//           User
//         </button>
//       </div>
//     </div>

//     {/* RIGHT: Add Member */}
//     <div className="flex justify-center md:justify-end w-full">
//       <button className="h-9 sm:h-10 px-5 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90">
//         <Plus className="h-4 w-4" />
//         Add Member
//       </button>
//     </div>
//   </div>
// </div>





//     {/* KPI Cards */}
//     <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//       <div className={`${kpiCardBase} p-6`}>
//         <div className="text-xs tracking-[0.2em] text-white/60">
//           TOTAL REVENUE
//         </div>
//         <div className="mt-4 flex items-end justify-between">
//           {/* TOTAL REVENUE */}
// <div className="text-3xl font-semibold">
//   ${stats.totalRevenue.toLocaleString()}
// </div>

// {/* ACTIVE SELLERS (now total sellers) */}
// {/* <div className="text-3xl font-semibold">
//   {stats.totalSellers}
// </div> */}
//           <div className="text-sm text-emerald-400 font-medium">
//             +12%
//           </div>
//         </div>
//       </div>

//       <div className={`${kpiCardBase} p-6`}>
//         <div className="text-xs tracking-[0.2em] text-white/60">
//           ACTIVE SELLERS
//         </div>
//         <div className="mt-4 flex items-end justify-between">
//           {/* ACTIVE SELLERS (now total sellers) */}
// <div className="text-3xl font-semibold">
//   {stats.totalSellers}
// </div>
//           <div className="text-sm text-emerald-400 font-medium">
//             +5%
//           </div>
//         </div>
//       </div>

//       <div className={`${kpiCardBase} p-6`}>
//         <div className="text-xs tracking-[0.2em] text-white/60">
//           PENDING APPROVALS
//         </div>
//         <div className="mt-4 flex items-end justify-between">
//         <div className="text-3xl font-semibold">{pendingApprovals}</div>
//           <div className="text-sm text-fuchsia-300 font-medium">
//             New submissions
//           </div>
//         </div>
//       </div>

//       <div className={`${kpiCardBase} p-6`}>
//         <div className="text-xs tracking-[0.2em] text-white/60">
//           DIGITAL PRODUCTS
//         </div>
//         <div className="mt-4 flex items-end justify-between">
//           <div className="text-3xl font-semibold">
//             {products.length || 0}
//           </div>
//           <div className="text-sm text-emerald-400 font-medium">
//             Live count
//           </div>
//         </div>
//       </div>
//     </section>

//     {/* Chart + Activities */}
//     <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
//       {/* Chart */}
//       <div className={`${kpiCardBase} p-6 lg:col-span-2`}>
//         <div className="flex items-start justify-between gap-4">
//           <div>
//             <h2 className="text-lg font-semibold">
//               Sales Trends Over Time
//             </h2>
//             <p className="mt-1 text-sm text-white/55">
//               Subtitle: Monthly revenue growth and projection
//             </p>
//           </div>
//           <div className="text-xs text-white/60 mt-1">Last 30 Days</div>
//         </div>

//         <div className="mt-6 h-[310px] w-full">
//           <ResponsiveContainer width="100%" height="100%">
//             <AreaChart
//               data={chartData}
//               margin={{ top: 10, right: 8, left: -12, bottom: 0 }}
//             >
//               <defs>
//                 <linearGradient
//                   id="blueFill"
//                   x1="0"
//                   y1="0"
//                   x2="0"
//                   y2="1"
//                 >
//                   <stop
//                     offset="0%"
//                     stopColor="#2AA8FF"
//                     stopOpacity={0.35}
//                   />
//                   <stop
//                     offset="100%"
//                     stopColor="#2AA8FF"
//                     stopOpacity={0.02}
//                   />
//                 </linearGradient>
//                 <linearGradient
//                   id="greenFill"
//                   x1="0"
//                   y1="0"
//                   x2="0"
//                   y2="1"
//                 >
//                   <stop
//                     offset="0%"
//                     stopColor="#84CC16"
//                     stopOpacity={0.28}
//                   />
//                   <stop
//                     offset="100%"
//                     stopColor="#84CC16"
//                     stopOpacity={0.02}
//                   />
//                 </linearGradient>
//               </defs>

//               <CartesianGrid
//                 stroke="rgba(255,255,255,0.08)"
//                 vertical={false}
//               />
//               <XAxis
//                 dataKey="name"
//                 tick={{
//                   fill: "rgba(255,255,255,0.55)",
//                   fontSize: 12,
//                 }}
//                 axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
//                 tickLine={false}
//               />
//               <YAxis
//                 tick={{
//                   fill: "rgba(255,255,255,0.45)",
//                   fontSize: 12,
//                 }}
//                 axisLine={false}
//                 tickLine={false}
//               />
//               <Tooltip
//                 contentStyle={{
//                   background: "rgba(10,12,16,0.95)",
//                   border: "1px solid rgba(255,255,255,0.12)",
//                   borderRadius: 12,
//                   color: "white",
//                 }}
//                 labelStyle={{ color: "rgba(255,255,255,0.75)" }}
//               />

//               <Area
//                 type="monotone"
//                 dataKey="green"
//                 stroke="#84CC16"
//                 strokeWidth={2}
//                 fill="url(#greenFill)"
//                 dot={false}
//                 activeDot={{ r: 4 }}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="blue"
//                 stroke="#2AA8FF"
//                 strokeWidth={2}
//                 fill="url(#blueFill)"
//                 dot={false}
//                 activeDot={{ r: 4 }}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Recent Activities */}
//      {/* Recent Activities — SELLER VIEW */}
// <div className={`${kpiCardBase} p-6`}>
//   <h2 className="text-lg font-semibold">Recent Activities</h2>

//   <div className="mt-6 space-y-4">
//     {activitiesLoading && (
//       <div className="text-white/70 text-sm">Loading activities…</div>
//     )}

//     {!!activitiesError && !activitiesLoading && (
//       <div className="text-red-400 text-sm">{activitiesError}</div>
//     )}

//   {!activitiesLoading && !activitiesError && recentActivitiesPreview.length === 0 && (
//   <div className="text-white/60 text-sm">No recent activity found.</div>
// )}

// {!activitiesLoading && !activitiesError && recentActivitiesPreview.map((a) => {
//       const meta = activityMeta(a.type);
//       return (
//         <div key={a.id} className="flex gap-4">
//           <div className={[
//             "h-9 w-9 rounded-full border flex items-center justify-center shrink-0",
//             meta.iconBg,
//           ].join(" ")}>
//             {meta.icon}
//           </div>
//           <div className="min-w-0 flex-1">
//             <div className="text-sm font-medium text-white/90">{a.title}</div>
//             {a.desc && (
//               <div className="text-xs text-white/55 mt-1 truncate">{a.desc}</div>
//             )}
//             <div className="text-[11px] text-white/40 mt-1">
//               {timeAgo(a.createdAt)}
//             </div>
//           </div>
//         </div>
//       );
//     })}
//   </div>
// <button
//   onClick={() => setShowAllActivities(true)}
//   className="mt-6 w-full h-10 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80"
// >
//   View Activity Log
// </button>
  
// </div>
//     </section>
//     {/* ✅ Sellers List (Dashboard → Seller toggle) — same look as SellersView table */}
// <section className={`${kpiCardBase} mt-6 p-6`}>
//   <div className="flex items-center justify-between">
//     <div>
//       <h2 className="text-lg font-semibold">Sellers List</h2>
//       <p className="mt-1 text-sm text-white/55">
//         A quick snapshot of sellers (same table styling as Seller Management)
//       </p>
//     </div>

//     <button
//       onClick={() => setShowAllSellers(true)}
//       className="text-sm text-[#3A7CFF] hover:underline"
//     >
//       View All
//     </button>
//   </div>

//   <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
//     {/* Desktop header only */}
//     <div className="hidden md:grid md:grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
//   <div className="md:col-span-4">Seller</div>

//   <div className="md:col-span-2">Volume</div>
//   <div className="md:col-span-2">Status</div>
//   <div className="md:col-span-1 text-right">Actions</div>
// </div>

//     <div className="divide-y divide-white/10">
//       {sellersLoading && (
//         <div className="p-6 text-white/70 text-sm">Loading sellers…</div>
//       )}

//       {!!sellersError && !sellersLoading && (
//         <div className="p-6 text-red-400 text-sm">{sellersError}</div>
//       )}

//       {!sellersLoading && !sellersError && (
//         <>
//         {(sellerRows || []).slice(0, 10).map((r) => (
//   <div key={r.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-5 py-5 bg-white/[0.02]">
//     {/* Seller */}
//     <div className="md:col-span-4 flex items-center gap-3 min-w-0">
//       <img
//         src={r.avatar || "https://i.pravatar.cc/80?img=12"}
//         alt={r.name}
//         className="h-10 w-10 rounded-full object-cover border border-white/10 shrink-0"
//       />
//       <div className="min-w-0">
//         <div className="text-sm font-medium text-white/90 truncate">{r.name}</div>
//         <div className="text-xs text-white/45 truncate">{r.email}</div>
//       </div>
//     </div>

//     {/* Category */}
//     {/* <div className="md:col-span-3 text-sm text-white/75 flex items-center">
//       {r.category || "Digital Art"}
//     </div> */}

//     {/* Volume */}
//     <div className="md:col-span-2 text-sm text-white/80 font-medium flex items-center">
//       ₹{Number(r.volume ?? 0).toLocaleString("en-IN")}
//     </div>

//     {/* Status */}
//     <div className="md:col-span-2 flex items-center">
//       <span className={[
//         "px-4 py-1.5 rounded-full text-xs font-medium border inline-flex",
//         r.status === "Active"
//           ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
//           : "bg-red-500/15 text-red-200 border-red-500/25",
//       ].join(" ")}>
//         {r.status}
//       </span>
//     </div>

//     {/* Actions */}
//     <div className="md:col-span-1 flex items-center justify-end gap-2">
//       <button
//         className="text-xs text-red-400 hover:text-red-300"
//         onClick={() => console.log("block", r.id)}
//       >
//         Block
//       </button>
//       <button
//         className="text-white/50 hover:text-white/80"
//         onClick={() => console.log("delete", r.id)}
//       >
//         🗑
//       </button>
//     </div>
//   </div>
// ))}

//           {(sellerRows || []).length === 0 && (
//             <div className="p-6 text-white/60 text-sm">No sellers found.</div>
//           )}
//         </>
//       )}
//     </div>
//   </div>

//   {!sellersLoading && !sellersError && (sellerRows || []).length > 0 && (
//     <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//       <div className="text-sm text-white/60">
//         Showing 1 to {Math.min(10, sellerRows.length)} of {sellerRows.length} sellers
//       </div>

//       <button
//         onClick={() => setShowAllSellers(true)}
//         className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm text-white/80"
//       >
//         View All
//       </button>
//     </div>
//   )}
// </section>
  
//   </>
// )}


//  {active === "dashboard" && currentView === "user" && (
//   <>
 

// <div className="mt-2 md:mt-0">
//   <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-3 md:gap-6">
//     {/* LEFT: Title */}
//     <div className="text-center md:text-left w-full">
//       <h1 className="text-[24px] md:text-[34px] leading-[1.05] font-semibold">
//         Dashboard
//       </h1>
//       <p className="mt-1 text-white/60 text-sm">Admin Overview</p>
//     </div>

//     {/* CENTER: Seller/User pills */}
//     <div className="flex justify-center w-full">
//       <div className="flex flex-row items-center justify-center gap-2">
//         <button
//           onClick={() => setCurrentView("seller")}
//           className={[
//             "h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2",
//             currentView === "seller"
//               ? "bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
//               : "bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]",
//           ].join(" ")}
//         >
//           <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//           Seller
//         </button>

//         <button
//           onClick={() => setCurrentView("user")}
//           className={[
//             "h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2",
//             currentView === "user"
//               ? "bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
//               : "bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]",
//           ].join(" ")}
//         >
//           <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//           User
//         </button>
//       </div>
//     </div>

//     {/* RIGHT: Add Member */}
//     <div className="flex justify-center md:justify-end w-full">
//       <button className="h-9 sm:h-10 px-5 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90">
//         <Plus className="h-4 w-4" />
//         Add Member
//       </button>
//     </div>
//   </div>
// </div>



//     {/* Add Member Button */}

     

//     {/* KPI Cards */}
//     <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//      <div className={`${kpiCardBase} p-6`}>
//   <div className="text-xs tracking-[0.2em] text-white/60">
//     TOTAL USERS
//   </div>

//   <div className="mt-4 flex items-end justify-between">
//     <div className="text-3xl font-semibold">
//       {userTotal.toLocaleString()}
//     </div>

//     <div className="text-sm text-emerald-400 font-medium">
//       +12%
//     </div>
//   </div>
// </div>


//       <div className={`${kpiCardBase} p-6`}>
//         <div className="text-xs tracking-[0.2em] text-white/60">
//           ACTIVE USERS
//         </div>
//         <div className="mt-4 flex items-end justify-between">
//         <div className="text-3xl font-semibold">{activeUsersCount}</div>

//           <div className="text-sm text-emerald-400 font-medium">
//             +5%
//           </div>
//         </div>
//       </div>

//       <div className={`${kpiCardBase} p-6`}>
//         <div className="text-xs tracking-[0.2em] text-white/60">
//           PENDING APPROVALS
//         </div>
//         <div className="mt-4 flex items-end justify-between">
//      <div className="text-3xl font-semibold">{pendingApprovals}</div>
//           <div className="text-sm text-fuchsia-300 font-medium">
//             New submissions
//           </div>
//         </div>
//       </div>

//       <div className={`${kpiCardBase} p-6`}>
//         <div className="text-xs tracking-[0.2em] text-white/60">
//           DIGITAL PRODUCTS
//         </div>
//         <div className="mt-4 flex items-end justify-between">
//           <div className="text-3xl font-semibold">
//             {products.length || 0}
//           </div>
//           <div className="text-sm text-emerald-400 font-medium">
//             Live count
//           </div>
//         </div>
//       </div>
//     </section>

//     {/* Chart + Activities */}
//     <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
//       {/* Chart */}
//       <div className={`${kpiCardBase} p-6 lg:col-span-2`}>
//         <div className="flex items-start justify-between gap-4">
//           <div>
//             <h2 className="text-lg font-semibold">
//               Sales Trends Over Time
//             </h2>
//             <p className="mt-1 text-sm text-white/55">
//               Subtitle: Monthly revenue growth and projection
//             </p>
//           </div>
//           <div className="text-xs text-white/60 mt-1">Last 30 Days</div>
//         </div>

//         <div className="mt-6 h-[310px] w-full">
//           <ResponsiveContainer width="100%" height="100%">
//             <AreaChart
//               data={chartData}
//               margin={{ top: 10, right: 8, left: -12, bottom: 0 }}
//             >
//               <defs>
//                 <linearGradient id="blueFill" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="0%" stopColor="#2AA8FF" stopOpacity={0.35} />
//                   <stop offset="100%" stopColor="#2AA8FF" stopOpacity={0.02} />
//                 </linearGradient>
//                 <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="0%" stopColor="#84CC16" stopOpacity={0.28} />
//                   <stop offset="100%" stopColor="#84CC16" stopOpacity={0.02} />
//                 </linearGradient>
//               </defs>

//               <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
//               <XAxis
//                 dataKey="name"
//                 tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
//                 axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
//                 tickLine={false}
//               />
//               <YAxis
//                 tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
//                 axisLine={false}
//                 tickLine={false}
//               />
//               <Tooltip
//                 contentStyle={{
//                   background: "rgba(10,12,16,0.95)",
//                   border: "1px solid rgba(255,255,255,0.12)",
//                   borderRadius: 12,
//                   color: "white",
//                 }}
//                 labelStyle={{ color: "rgba(255,255,255,0.75)" }}
//               />

//               <Area
//                 type="monotone"
//                 dataKey="green"
//                 stroke="#84CC16"
//                 strokeWidth={2}
//                 fill="url(#greenFill)"
//                 dot={false}
//                 activeDot={{ r: 4 }}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="blue"
//                 stroke="#2AA8FF"
//                 strokeWidth={2}
//                 fill="url(#blueFill)"
//                 dot={false}
//                 activeDot={{ r: 4 }}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Recent Activities */}
//       {/* Recent Activities — USER VIEW mein ye section fix karo */}
// <div className={`${kpiCardBase} p-6`}>
//   <h2 className="text-lg font-semibold">Recent Activities</h2>

//   <div className="mt-6 space-y-4">
//     {activitiesLoading && (
//       <div className="text-white/70 text-sm">Loading activities…</div>
//     )}

//     {!!activitiesError && !activitiesLoading && (
//       <div className="text-red-400 text-sm">{activitiesError}</div>
//     )}

//   {!activitiesLoading && !activitiesError && recentActivitiesPreview.length === 0 && (
//   <div className="text-white/60 text-sm">No recent activity found.</div>
// )}

// {!activitiesLoading && !activitiesError && recentActivitiesPreview.map((a) => {
//         const meta = activityMeta(a.type);
//         return (
//           <div key={a.id} className="flex gap-4">
//             <div
//               className={[
//                 "h-9 w-9 rounded-full border flex items-center justify-center shrink-0",
//                 meta.iconBg,
//               ].join(" ")}
//             >
//               {meta.icon}
//             </div>
//             <div className="min-w-0 flex-1">
//               <div className="text-sm font-medium text-white/90">{a.title}</div>
//               {a.desc && (
//                 <div className="text-xs text-white/55 mt-1 truncate">{a.desc}</div>
//               )}
//               <div className="text-[11px] text-white/40 mt-1">
//                 {timeAgo(a.createdAt)}
//               </div>
//             </div>
//           </div>
//         );
//       })}
//   </div>

//  <button
//   onClick={() => setShowAllActivities(true)}
//   className="mt-6 w-full h-10 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80"
// >
//   View Activity Log
// </button>
// </div>
//     </section>

// {/* Users Table */}
// <section className={`${kpiCardBase} mt-6 p-6`}>
//   <div className="flex items-center justify-between gap-3">
//     <div>
//       <h2 className="text-lg font-semibold">Users List</h2>
//     </div>
//     <button
//       onClick={() => setShowAllUsers(true)}
//       className="shrink-0 text-sm text-[#3A7CFF] hover:underline"
//     >
//       View All
//     </button>
//   </div>

//   <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
//     {/* Desktop Header */}
//    <div className="hidden md:grid md:grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
//   <div className="md:col-span-3">User Name</div>
//   <div className="md:col-span-2">Status</div>
//   <div className="md:col-span-2">Buy Products</div>
//   <div className="md:col-span-2">Sale Products</div>
//   <div className="md:col-span-2">Joined Date</div>
//   <div className="md:col-span-1 text-right">Actions</div>
// </div>

//     <div className="divide-y divide-white/10">
//       {userLoading && (
//         <div className="p-6 text-white/70 text-sm">Loading users…</div>
//       )}

//       {!!userError && !userLoading && (
//         <div className="p-6 text-red-400 text-sm">{userError}</div>
//       )}

//   {!userLoading && !userError && userRows.map((u) => (
//   <div key={u.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-5 py-5 bg-white/[0.02]">
    
//     {/* User Name */}
//     <div className="md:col-span-3 flex items-center gap-3 min-w-0">
//       <img
//         src={u.avatar || "https://i.pravatar.cc/80?img=12"}
//         alt={u.name}
//         className="h-10 w-10 rounded-full object-cover border border-white/10 shrink-0"
//       />
//       <div className="min-w-0">
//         <div className="text-sm font-medium text-white/90 truncate">{u.name}</div>
//         <div className="text-xs text-white/45 truncate">{u.email}</div>
//       </div>
//     </div>

//     {/* Status */}
//     <div className="md:col-span-2 flex items-center">
//       <span className="px-3 py-1 rounded-full text-xs font-medium border bg-emerald-500/15 text-emerald-200 border-emerald-500/25">
//         Active
//       </span>
//     </div>

//     {/* Buy Products */}
//     <div className="md:col-span-2 text-sm text-white/75 flex items-center">
//       {u.buyProducts ?? 0}
//     </div>

//     {/* Sale Products */}
//     <div className="md:col-span-2 text-sm text-white/75 flex items-center">
//       {u.saleProducts ?? 0}
//     </div>

//     {/* Joined Date */}
//     <div className="md:col-span-2 text-sm text-white/75 flex items-center">
//       {formatDate(u.createdAt)}
//     </div>

//     {/* Actions */}
//     <div className="md:col-span-1 flex items-center justify-end gap-3">
//       <button className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
//         🚫 Block
//       </button>
//       <button className="text-white/50 hover:text-white/80 text-sm">
//         🗑
//       </button>
//     </div>
//   </div>
// ))}
//       {!userLoading && !userError && userRows.length === 0 && (
//         <div className="p-6 text-white/60 text-sm">No users found.</div>
//       )}
//     </div>
//   </div>

//   {/* Search + Page Size */}
//   <div className={`${kpiCardBase} mt-6 p-4`}>
//     <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
//       <div className="flex-1 relative min-w-0">
//         <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
//         <input
//           value={userSearch}
//           onChange={(e) => setUserSearch(e.target.value)}
//           className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
//           placeholder="Search users by name or email..."
//         />
//       </div>

//       <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
//         <div className="text-sm text-white/60 shrink-0">Show</div>
//         <select
//           value={userPageSize}
//           onChange={(e) => setUserPageSize(Number(e.target.value))}
//           className="h-11 min-w-[90px] px-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none"
//         >
//           {[10, 20, 50, 100].map((n) => (
//             <option key={n} value={n}>
//               {n}
//             </option>
//           ))}
//         </select>
//       </div>
//     </div>
//   </div>
// </section>
//   </>
// )}


//         {active === "products" && <ProductsView />}
//         {active === "sellers" && <SellersView />}
//         {active === "reports" && <ReportsView />}
//         {active === "analytics" && (
//           <div className={`${kpiCardBase} p-8`}>
//             <h1 className="text-2xl font-semibold">Analytics</h1>
//             <p className="text-white/60 mt-2">Coming soon…</p>
//           </div>
//         )}
//         {active === "account" && (
//           <AccountView
//             adminName={adminName}
//             adminEmail={adminEmail}
//             totalMembers={24}
//             activeToday={18}
//             pendingInvite={3}
//           />
//         )}
//       </div>
//     </main>
//   </div>
// </div>

//       {/* Footer */}
//       <footer className="mt-10 pb-8 text-center text-xs text-white/35">
//         © 2020 – 2026 Tokun.world | All Rights Reserved
//       </footer>
//       <MobileBottomNav />



//       {showAllActivities && (
//   <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
//     <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl border border-white/10 bg-[#0F1117] shadow-2xl overflow-hidden">
      
//       {/* Header */}
//       <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
//         <h2 className="text-lg font-semibold text-white">Activity Log</h2>
//         <button
//           onClick={() => setShowAllActivities(false)}
//           className="h-9 w-9 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center text-white/80"
//         >
//           <X className="h-4 w-4" />
//         </button>
//       </div>

//       {/* Body */}
//       <div className="max-h-[70vh] overflow-y-auto p-5 space-y-4 no-scrollbar">
//         {activitiesLoading && (
//           <div className="text-white/70 text-sm">Loading activities…</div>
//         )}

//         {!!activitiesError && !activitiesLoading && (
//           <div className="text-red-400 text-sm">{activitiesError}</div>
//         )}

//         {!activitiesLoading && !activitiesError && activities.length === 0 && (
//           <div className="text-white/60 text-sm">No recent activity found.</div>
//         )}

//         {!activitiesLoading &&
//           !activitiesError &&
//           activities.map((a) => {
//             const meta = activityMeta(a.type);
//             return (
//               <div
//                 key={a.id}
//                 className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
//               >
//                 <div
//                   className={[
//                     "h-10 w-10 rounded-full border flex items-center justify-center shrink-0",
//                     meta.iconBg,
//                   ].join(" ")}
//                 >
//                   {meta.icon}
//                 </div>

//                 <div className="min-w-0 flex-1">
//                   <div className="text-sm font-medium text-white/90">
//                     {a.title}
//                   </div>
//                   {a.desc && (
//                     <div className="text-xs text-white/55 mt-1">
//                       {a.desc}
//                     </div>
//                   )}
//                   <div className="text-[11px] text-white/40 mt-2">
//                     {timeAgo(a.createdAt)}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//       </div>
//     </div>
//   </div>
// )}
//     </div>
//   );
// };

// export default Dashboard;



// src/pages/admin/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  Plus,
  LayoutDashboard,
  Store,
  Package,
  LineChart,
  UserRound,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Search,
  X,
  TrendingUp,
  TriangleAlert,
  Image as ImageIcon,
  Video,
  Download,
  MessageSquare,
  Ban,
  Clock,
  FileText,
  ShieldAlert,
  User,
  ShoppingCart,
  Wallet ,
  RefreshCcw,CheckCircle,
  Landmark,
  MoreHorizontal,
  Building2,
  Briefcase,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,

} from "recharts";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PromptValidationAdminDashboard from "./PromptValidationAdminDashboard";
import FreelancerReviewAdminDashboard from "./FreelancerReviewAdminDashboard";
import AdminSellerMessageModal from "@/components/AdminSellerMessageModal";
// Resolves API-relative upload paths against the API origin — see lib/mediaUrl.
import { mediaUrl } from "@/lib/mediaUrl";

// ✅ ADD reports here
// "withdrawals" was removed — the money view an admin actually needs is
// "payments", which covers everything that moved through Razorpay rather than
// just the payouts leaving the wallet.
/* No "escrow" here any more — the tab was removed from the admin dashboard.
   Dropping it from the union means any leftover setActive("escrow") is a
   compile error rather than a tab that silently renders nothing. */
type NavKey = "dashboard" | "sellers" | "products" | "reports" | "analytics" | "account" | "payments" | "feedback" | "freelancers";


const kpiCardBase =
  "rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.03] border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

// =======================
// TYPES
// =======================
type PromptProduct = {
  id: string;
  title: string;
  uploaderName: string;
  uploaderId?: string | null;
  price: number;
  status: "Published" | "Draft" | "Flagged";
  imageUrl?: string;
  videoUrl?: string;
  category?: string;
  exclusive?: boolean;
  sold?: boolean;
  salesCount?: number;
  totalRevenue?: number;
};

type Category = { _id: string; name: string; description?: string };

type SellerProfile = {
  id: string;
  name: string;
  email?: string;
  location?: string;
  joined?: string;
  status?: "ACTIVE" | "SUSPENDED";
  avatar?: string;
  verified?: boolean;

  totalEarnings?: number;
  rating?: number;
  reviewsCount?: number;
  refundRate?: number;
  refundThreshold?: number;

  // buy-side + plan (for the profile's Purchased / Uploaded / Plan cards)
  buyProducts?: number;
  totalUploadedPrompts?: number;
  plan?: string | null;
  userType?: "IND" | "ORG" | "TM";
};

type SellerRow = {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Blocked";
  avatar?: string;
  joined?: string | null;
  category?: string;
  // ✅ volume = total earning
  volume?: number;
  totalProducts?: number;
  soldProducts?: number;
  totalSpent?: number;
  buyProducts?: number;
  plan?: string | null;
  userType?: "IND" | "ORG" | "TM";
  isDeleted?: boolean;
  kycStatus?: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED" | "FLAGGED";
};

// ✅ REPORT TYPES (left + right flow)
type ReportItem = {
  id: string;
  title: string;
  listingId: string;
  productId?: string;
  category: string;
  status: "Open" | "Reviewed" | "Dismissed" | "Actioned";
  priority: "Low" | "Medium" | "High";
  createdAt: string;

  reporterName?: string;
  reporterEmail?: string;
  reason: string;
  details?: string;

  productTitle?: string;
  sellerName?: string;

  previewImageUrl?: string;
  previewVideoUrl?: string;

  evidence?: Array<{
    type: "image" | "video" | "text";
    url?: string;
    text?: string;
    label?: string;
  }>;

  history?: Array<{
    at: string;
    by: string;
    action: string;
    note?: string;
  }>;
};

// =======================
// API
// =======================
type ActivityItem = {
  id: string;
  title: string;
  desc?: string;
  createdAt: string;
  type:
    | "USER_REGISTERED"
    | "USER_LOGIN"
    | "PRODUCT_PURCHASED"
    | "VIDEO_CALL_STARTED"
    | "VIDEO_CALL_ENDED"
    | "SELLER_REGISTERED"
    | "PRODUCT_APPROVED"
    | "PAYOUT_FAILED"
    | "POLICY_UPDATE"
    | "REPORT_CREATED"
    | "LISTING_SUSPENDED"
    | "PRODUCT_FLAGGED"
    | "OTHER";
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  userType?: "IND" | "ORG" | "TM";
  plan?: "free" | "pro" | null;
  isVerified?: boolean;
  kycStatus?: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED" | "FLAGGED";
  createdAt?: string;
  lastLoginAt?: string;
  // ✅ purchased prompts count
  buyProducts?: number;
  purchasedPrompts?: number;
  // ✅ uploaded prompts count
  saleProducts?: number;
  uploadedPrompts?: number;
  totalEarnings?: number;
  totalSpent?: number;
};

// Full admin view of a single user (mirrors SellerProfile, but user-centric:
// both buy-side and sell-side, since sellers and buyers are the same User).
type UserProfile = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  joined?: string;
  status?: string;
  verified?: boolean;
  userType?: "IND" | "ORG" | "TM";
  plan?: string | null;
  // buy-side
  buyProducts: number;
  totalSpent: number;
  // sell/upload-side
  uploadedCount: number;
  soldProducts: number;
  totalEarnings: number;
};

type UserBoughtItem = {
  id: string;
  promptId: string;
  title: string;
  pricePaid: number;
  paymentStatus: string;
  refundStatus?: string;
  purchasedAt?: string;
  deleted?: boolean;
};

// ─── Org (admin platform view) ────────────────────────────────
type OrgRow = {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerId: string;
  plan: string | null;
  billingCycle: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  orgPoolCap: number;
  orgPoolUsed: number;
  orgExtraTokensRemaining: number;
  teamMembersLimit: number;
  teamMembersLimitRemaining: number;
  membersCount: number;
  adminFrozen: boolean;
  createdAt: string | null;
};

type OrgSummary = {
  kpis: {
    totalOrgs: number;
    enterpriseActive: number;
    seatsTotal: number;
    seatsUsed: number;
    poolCap: number;
    poolUsed: number;
  };
  trends: { label: string; newOrgs: number }[];
  statusBreakdown: { name: string; count: number }[];
};

type OrgMemberRow = {
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  assignedCap: number;
  usedThisPeriod: number;
};

type OrgDetail = OrgRow & {
  ownerAvatar: string | null;
  billingAnchor: string | null;
  lastInvoiceDueAt: string | null;
  graceDays: number;
  totalAssignedCap: number;
  members: OrgMemberRow[];
};


// Human-readable plan label. Org owners (ORG) and team members (TM) are on the
// org's Enterprise plan even though their own User.plan is null; individuals
// carry plan free/pro directly.
const planLabel = (userType?: string | null, plan?: string | null): "Enterprise" | "Pro" | "Free" => {
  if (userType === "TM" || userType === "ORG") return "Enterprise";
  if (plan === "pro") return "Pro";
  return "Free";
};

// Tailwind classes for a plan badge, by label.
const planBadgeClass = (label: string) =>
  label === "Enterprise"
    ? "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/25"
    : label === "Pro"
    ? "bg-amber-500/15 text-amber-200 border-amber-500/25"
    : "bg-white/[0.05] text-white/60 border-white/10";

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
};

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5002").replace(/\/$/, "");

const PROMPTS_BASE = `${API_BASE}/api/prompt`;
const SELLERS_BASE = `${API_BASE}/api/seller`;
const REPORTS_BASE = `${API_BASE}/api/promptreport`;
const USERS_BASE = `${API_BASE}/api/user`;
// Optional future:
// const REPORTS_BASE = `${API_BASE}/api/reports`;

const AccountView = ({
  adminName,
  adminEmail,
}: {
  adminName: string;
  adminEmail: string;
}) => {
  const [emailInput, setEmailInput] = useState(adminEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [profileSaveLoading, setProfileSaveLoading] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState<string | null>(null);

  const handleUpdateAdminProfile = async () => {
    setProfileSaveError(null);
    setProfileSaveSuccess(null);

    const emailChanged = emailInput.trim().toLowerCase() !== adminEmail.trim().toLowerCase();
    const wantsPasswordChange = !!(newPassword || confirmNewPassword);

    if (!currentPassword) {
      setProfileSaveError("Enter your current password to save changes.");
      return;
    }
    if (!emailChanged && !wantsPasswordChange) {
      setProfileSaveError("Change the email or enter a new password first.");
      return;
    }
    if (wantsPasswordChange && newPassword !== confirmNewPassword) {
      setProfileSaveError("New password and confirmation do not match.");
      return;
    }

    try {
      setProfileSaveLoading(true);
      // Admin tokens FIRST — this is the admin dashboard, and a stale normal-user
      // "token" in localStorage would otherwise be sent, making the request
      // non-admin and getting a 403 "forbidden" from /api/admin/auth/profile.
      const token = (
        localStorage.getItem("tokun_admin_token") ||
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("tokun_token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken") ||
        ""
      ).replace(/^Bearer\s+/i, "").trim();
      const res = await fetch(`${API_BASE}/api/admin/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          ...(emailChanged ? { newEmail: emailInput.trim() } : {}),
          ...(wantsPasswordChange ? { newPassword } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        const messages: Record<string, string> = {
          invalid_current_password: "Current password is incorrect.",
          email_already_in_use: "That email is already in use by another admin.",
          invalid_email: "Enter a valid email address.",
          password_too_short: "New password must be at least 8 characters.",
        };
        throw new Error(messages[data?.error] || data?.error || "Could not update profile.");
      }

      if (emailChanged) {
        localStorage.setItem("tokun_admin_email", data.admin.email);
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setProfileSaveSuccess("Profile updated successfully.");
      if (emailChanged) {
        window.location.reload();
      }
    } catch (e: any) {
      setProfileSaveError(e?.message || "Could not update profile.");
    } finally {
      setProfileSaveLoading(false);
    }
  };

  return (
    <>
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
  <div className="text-center md:text-left">
    <h1 className="text-[24px] md:text-[34px] leading-[1.1] font-semibold">
      Admin Profile
    </h1>
    <p className="mt-2 text-white/60 text-sm">
      Manage your account and security settings
    </p>
  </div>
</div>

      {/* Profile Card */}
      <section className={`${kpiCardBase} mt-8 p-6`}>
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
          <div className="flex items-center gap-4">
            <img
              src={"https://i.pravatar.cc/120?img=12"}
              alt={adminName}
              className="h-16 w-16 rounded-full object-cover border border-white/10"
            />
            <div>
              <div className="text-xl font-semibold">{adminName}</div>
              <div className="text-sm text-white/50">Super Admin</div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60">Full name</label>
              <input
                value={adminName}
                readOnly
                className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
              />
            </div>

            <div>
              <label className="text-xs text-white/60">Email address</label>
              <input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
              />
            </div>

            <div>
              <label className="text-xs text-white/60">Role</label>
              <input
                value={"Super Admin"}
                readOnly
                className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/50"
              />
            </div>

            <div>
              <label className="text-xs text-white/60">Timezone</label>
              <input
                value={"Asia/Kolkata"}
                readOnly
                className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Security Management */}
      <section className={`${kpiCardBase} mt-6 p-6`}>
        <h2 className="text-lg font-semibold">Security Management</h2>
        <p className="mt-1 text-xs text-white/45">
          Enter your current password to save an email change, a new password, or both.
        </p>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5 items-end">
          <div>
            <label className="text-xs text-white/60">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Confirm new password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="mt-2 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white/80"
            />
          </div>

          <div className="flex justify-start lg:justify-end">
            <button
              type="button"
              disabled={profileSaveLoading}
              onClick={handleUpdateAdminProfile}
              className="h-11 px-6 rounded-xl bg-[#1677FF] hover:opacity-90 text-sm font-medium disabled:opacity-60"
            >
              {profileSaveLoading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        {profileSaveError && (
          <p className="mt-4 text-sm text-red-300">{profileSaveError}</p>
        )}
        {profileSaveSuccess && (
          <p className="mt-4 text-sm text-emerald-300">{profileSaveSuccess}</p>
        )}
      </section>

    </>
  );
};


/* ── PaymentsView ───────────────────────────────────────────────────────────
   Where the money went, without opening Razorpay.

   The dashboard could show what Tokun EARNED and nothing about what Razorpay
   charged, so working out what was actually kept meant reading two systems side
   by side. Razorpay is the source of truth for captured/fees/refunds here;
   Tokun's commission comes from our own ledger. */
/* Its own token reader, because this now lives at module scope.

   It was originally written inside the Dashboard component — which is where
   every other view in this file lives — and that is why it kept flashing back
   to "Loading…" and losing its data. A component declared inside another
   component is a NEW component type on every parent render, so React unmounts
   and remounts it each time, wiping its state and re-running the fetch. Out
   here its identity is stable and it renders once. */
const readAdminToken = () =>
  localStorage.getItem("tokun_admin_token") ||
  localStorage.getItem("adminToken") ||
  localStorage.getItem("token") ||
  localStorage.getItem("tokun_token") ||
  "";

const fmtINR = (n: any) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const fmtWhen = (d: any) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

/** One place for the admin auth dance, since three panels now need it. */
const adminGet = async (path: string) => {
  const token = readAdminToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    credentials: "include",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || json?.error || "Request failed.");
  }
  return json;
};

/* Colour by what the row means, not by taste: money in is green, money out is
   amber, and a refund — money out that we also lost the fee on — is blue, the
   same blue the live table already uses for refunds. */
const LEDGER_KIND_TONE: Record<string, string> = {
  PAYMENT: "text-[#19E66C]",
  REFUND: "text-[#63A6F2]",
  TRANSFER: "text-[#FABC4E]",
  TRANSFER_HOLD: "text-white/50",
  PAYOUT: "text-[#FABC4E]",
  SETTLEMENT: "text-white/70",
  COMMISSION: "text-[#19E66C]",
  ADJUSTMENT: "text-white/50",
};

/* ── LedgerPanel ────────────────────────────────────────────────────────────
   The same money as the tab beside it, but read from OUR database instead of
   Razorpay's API.

   Two independent views on purpose. Where they disagree is the thing
   reconciliation is for — a refund issued from the Razorpay dashboard shows up
   live but has no ledger row until the webhook records it, and that gap is
   exactly what you want visible rather than smoothed over.

   Declared at module scope for the reason spelled out above readAdminToken:
   a component defined inside another remounts on every parent render and
   loses its state. */
const LedgerPanel = ({ days }: { days: number }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState("");
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams({ days: String(days), limit: "300" });
        if (kind) qs.set("kind", kind);
        if (purpose) qs.set("purpose", purpose);
        const json = await adminGet(`/api/admin/payments/ledger?${qs}`);
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Couldn't load the ledger.");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [days, kind, purpose]);

  const selectCls =
    "h-8 rounded-lg border border-white/10 bg-white/[0.04] px-2 text-xs text-white/70 outline-none";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select className={selectCls} value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="">All kinds</option>
          {["PAYMENT", "REFUND", "TRANSFER", "TRANSFER_HOLD", "PAYOUT", "SETTLEMENT", "ADJUSTMENT"].map(
            (k) => (
              <option key={k} value={k}>
                {k}
              </option>
            )
          )}
        </select>
        <select className={selectCls} value={purpose} onChange={(e) => setPurpose(e.target.value)}>
          <option value="">All purposes</option>
          {["PROMPT_PURCHASE", "HIRE_ESCROW", "SERVICE_ORDER", "SUBSCRIPTION", "WALLET_TOPUP", "OTHER"].map(
            (p) => (
              <option key={p} value={p}>
                {p.replace(/_/g, " ")}
              </option>
            )
          )}
        </select>
      </div>

      {loading && <p className="text-sm text-white/40">Loading the ledger…</p>}

      {error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/[0.06] p-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Totals come from an aggregate over the WHOLE window, not from the
              rows below — those are capped, and a total that silently covered
              only the first page would be worse than none. */}
          {!!data.totals?.length && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {data.totals.map((t: any) => (
                <div
                  key={`${t.kind}-${t.direction}`}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                    {t.kind} {t.direction === "IN" ? "in" : "out"}
                  </p>
                  <p className={`mt-1.5 text-xl font-bold ${LEDGER_KIND_TONE[t.kind] || "text-white"}`}>
                    {fmtINR(t.amount)}
                  </p>
                  <p className="mt-1 text-[11px] text-white/35">
                    {t.count} row{t.count === 1 ? "" : "s"}
                    {t.fee ? ` · fee ${fmtINR(t.fee)}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-4 pt-4 pb-3">
              Ledger entries ({data.count})
              {data.truncated && <span className="text-white/25"> · showing the newest 300</span>}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-white/35 border-b border-white/10">
                    <th className="text-left font-semibold px-4 py-2">Occurred</th>
                    <th className="text-left font-semibold px-4 py-2">Kind</th>
                    <th className="text-left font-semibold px-4 py-2">For</th>
                    <th className="text-left font-semibold px-4 py-2">Reference</th>
                    <th className="text-left font-semibold px-4 py-2">Who</th>
                    <th className="text-right font-semibold px-4 py-2">Amount</th>
                    <th className="text-right font-semibold px-4 py-2">Fee</th>
                    <th className="text-left font-semibold px-4 py-2">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.entries || []).map((e: any) => (
                    <tr key={e.id} className="border-b border-white/[0.05]">
                      <td className="px-4 py-2 text-white/45 text-xs whitespace-nowrap">
                        {fmtWhen(e.occurredAt)}
                        {/* When we RECORDED it, shown only when it differs from
                            when it happened — during an outage or a backfill
                            that gap is the whole story. */}
                        {e.recordedAt &&
                          Math.abs(new Date(e.recordedAt).getTime() - new Date(e.occurredAt).getTime()) >
                            60_000 && (
                            <span className="block text-[10px] text-white/25">
                              logged {fmtWhen(e.recordedAt)}
                            </span>
                          )}
                      </td>
                      <td className={`px-4 py-2 text-xs font-semibold ${LEDGER_KIND_TONE[e.kind] || "text-white/70"}`}>
                        {e.kind}
                      </td>
                      <td className="px-4 py-2 text-xs text-white/50">
                        {(e.purpose || "—").replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-white/60 text-[11px] font-mono">
                          {e.razorpayRefundId ||
                            e.razorpayTransferId ||
                            e.razorpaySettlementId ||
                            e.razorpayPaymentId ||
                            "—"}
                        </span>
                        {e.methodDetail && (
                          <span className="block text-[10px] text-white/30">{e.methodDetail}</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-xs text-white/50">
                        {e.user?.name || e.user?.email || "—"}
                        {e.counterparty && (
                          <span className="block text-[10px] text-white/25">
                            ↔ {e.counterparty.name || e.counterparty.email}
                          </span>
                        )}
                      </td>
                      <td
                        className={`px-4 py-2 text-right font-medium whitespace-nowrap ${
                          e.direction === "IN" ? "text-white" : "text-white/60"
                        }`}
                      >
                        {e.direction === "IN" ? "" : "−"}
                        {fmtINR(e.amount)}
                      </td>
                      <td className="px-4 py-2 text-right text-[#FABC4E] text-xs whitespace-nowrap">
                        {e.fee ? fmtINR(e.fee + e.tax) : "—"}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                            e.source === "webhook"
                              ? "bg-[#19E66C]/10 text-[#19E66C]"
                              : e.source === "backfill"
                              ? "bg-[#FABC4E]/10 text-[#FABC4E]"
                              : "bg-white/[0.06] text-white/45"
                          }`}
                        >
                          {e.source}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!data.entries?.length && (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-sm text-white/35">
                        Nothing recorded in this window. The ledger only holds what has happened
                        since it was switched on — run the backfill script to pull in older history.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-[11px] text-white/30 leading-relaxed">
            <span className="text-[#19E66C]">webhook</span> rows came from Razorpay telling us
            directly and are the most trustworthy;{" "}
            <span className="text-white/45">api</span> rows are what our own code recorded as it ran;{" "}
            <span className="text-[#FABC4E]">backfill</span> rows were reconstructed after the fact
            and are the first to doubt when two figures disagree.
          </p>
        </>
      )}
    </div>
  );
};

/* ── WebhooksPanel ──────────────────────────────────────────────────────────
   Did Razorpay actually tell us, and what did they say?

   Every event used to be processed and thrown away, so when something didn't
   happen there was no way to tell whether the event never arrived, arrived and
   was ignored, or arrived and broke. This answers that. */
const WebhooksPanel = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ limit: "150" });
      if (status) qs.set("status", status);
      const json = await adminGet(`/api/admin/payments/webhooks?${qs}`);
      setEvents(json.events || []);
    } catch (e: any) {
      setError(e?.message || "Couldn't load webhook deliveries.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const openDetail = async (id: string) => {
    if (openId === id) {
      setOpenId(null);
      setDetail(null);
      return;
    }
    setOpenId(id);
    setDetail(null);
    try {
      const json = await adminGet(`/api/admin/payments/webhooks/${id}`);
      setDetail(json.event);
    } catch {
      setDetail({ error: "Couldn't load this payload." });
    }
  };

  const STATUS_TONE: Record<string, string> = {
    processed: "bg-[#19E66C]/10 text-[#19E66C]",
    ignored: "bg-white/[0.06] text-white/45",
    failed: "bg-red-500/10 text-red-300",
    received: "bg-[#FABC4E]/10 text-[#FABC4E]",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {["", "processed", "ignored", "failed", "received"].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setStatus(s)}
            className={`px-3 h-8 rounded-full text-xs font-medium transition capitalize ${
              status === s ? "bg-white/15 text-white" : "text-white/45 hover:bg-white/[0.06]"
            }`}
          >
            {s || "All"}
          </button>
        ))}
        <button
          onClick={load}
          className="ml-auto px-3 h-8 rounded-full text-xs font-medium text-white/45 hover:bg-white/[0.06]"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-sm text-white/40">Loading deliveries…</p>}

      {error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/[0.06] p-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-4 pt-4 pb-3">
            Webhook deliveries ({events.length})
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-white/35 border-b border-white/10">
                  <th className="text-left font-semibold px-4 py-2">Received</th>
                  <th className="text-left font-semibold px-4 py-2">Event</th>
                  <th className="text-left font-semibold px-4 py-2">Status</th>
                  <th className="text-left font-semibold px-4 py-2">Reference</th>
                  <th className="text-right font-semibold px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {events.map((e: any) => (
                  <React.Fragment key={e._id}>
                    <tr className="border-b border-white/[0.05]">
                      <td className="px-4 py-2 text-white/45 text-xs whitespace-nowrap">
                        {fmtWhen(e.createdAt)}
                      </td>
                      <td className="px-4 py-2 text-xs font-mono text-white/70">{e.event}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                            STATUS_TONE[e.status] || "bg-white/[0.06] text-white/45"
                          }`}
                        >
                          {e.status}
                        </span>
                        {e.error && (
                          <span className="block text-[10px] text-red-300/70 mt-0.5">{e.error}</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-[11px] font-mono text-white/50">
                        {e.paymentId || e.refundId || e.transferId || e.orderId || "—"}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => openDetail(e._id)}
                          className="text-[11px] text-white/45 hover:text-white underline underline-offset-2"
                        >
                          {openId === e._id ? "Hide" : "Payload"}
                        </button>
                      </td>
                    </tr>
                    {openId === e._id && (
                      <tr className="border-b border-white/[0.05]">
                        <td colSpan={5} className="px-4 py-3 bg-black/30">
                          {!detail ? (
                            <p className="text-xs text-white/35">Loading payload…</p>
                          ) : (
                            <pre className="text-[11px] leading-relaxed text-white/60 overflow-x-auto max-h-80">
                              {JSON.stringify(detail.payload ?? detail, null, 2)}
                            </pre>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {!events.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-white/35">
                      No deliveries recorded. If you expected some, check that the webhook is
                      configured in Razorpay for this mode and that RAZORPAY_WEBHOOK_SECRET matches —
                      a wrong secret is rejected before anything is stored.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentsView = () => {
  /* Three views over the same money: what Razorpay says live, what we
     recorded ourselves, and what Razorpay actually sent us. */
  const [view, setView] = useState<"live" | "ledger" | "webhooks">("live");
  const [days, setDays] = useState(30);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (d: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = readAdminToken();
      const res = await fetch(`${API_BASE}/api/admin/payments?days=${d}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || json?.error || "Couldn't load payment data.");
      }
      setData(json);
    } catch (e: any) {
      setError(e?.message || "Couldn't load payment data.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only the live view costs a Razorpay round-trip, so it isn't fetched
    // while another tab is open.
    if (view !== "live") return;
    load(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, view]);

  const inr = (n: any) =>
    "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  const t = data?.totals;

  const Stat = ({
    label,
    value,
    hint,
    tone,
  }: { label: string; value: string; hint?: string; tone?: string }) => (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</p>
      <p className={`mt-1.5 text-xl font-bold ${tone || "text-white"}`}>{value}</p>
      {hint && <p className="mt-1 text-[11px] text-white/35 leading-snug">{hint}</p>}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Payments</h2>
          <p className="text-xs text-white/45 mt-0.5">
            {view === "live"
              ? "Live from Razorpay, joined to Tokun's own commission ledger."
              : view === "ledger"
              ? "Recorded in Tokun's own database, with the timestamp of each movement."
              : "Every webhook Razorpay has sent us, and what we did with it."}
          </p>
        </div>
        {/* The date range only applies to the two money views; the delivery log
            has its own, much shorter, horizon. */}
        {view !== "webhooks" && (
          <div className="flex gap-1.5">
            {[7, 30, 90, 365].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 h-8 rounded-full text-xs font-medium transition ${
                  days === d ? "bg-white/15 text-white" : "text-white/45 hover:bg-white/[0.06]"
                }`}
              >
                {d === 365 ? "1 year" : `${d}d`}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-1 border-b border-white/10 -mt-1">
        {(
          [
            ["live", "Razorpay (live)"],
            ["ledger", "Ledger (our DB)"],
            ["webhooks", "Webhooks"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`px-3 pb-2 text-xs font-medium transition border-b-2 -mb-px ${
              view === key
                ? "border-white text-white"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "ledger" && <LedgerPanel days={days} />}
      {view === "webhooks" && <WebhooksPanel />}

      {view === "live" && loading && <p className="text-sm text-white/40">Loading from Razorpay…</p>}

      {view === "live" && error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/[0.06] p-4">
          <p className="text-sm text-red-300">{error}</p>
          {/* Razorpay being unreachable is exactly when the ledger earns its
              keep, so point at it rather than leaving a dead end. */}
          <button
            onClick={() => setView("ledger")}
            className="mt-2 text-xs text-white/60 hover:text-white underline underline-offset-2"
          >
            View the same window from our own ledger instead →
          </button>
        </div>
      )}

      {view === "live" && t && !loading && (
        <>
          {/* The number an admin is actually here for is `net` — commission
              earned minus what the processor took. */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat
              label="Captured"
              value={inr(t.captured)}
              hint={`${t.capturedCount} payment${t.capturedCount === 1 ? "" : "s"} clients actually paid`}
            />
            <Stat
              label="Tokun commission"
              value={inr(t.tokunCommission)}
              tone="text-[#19E66C]"
              hint="Our own ledger, same window"
            />
            <Stat
              label="Razorpay charges"
              value={inr(t.razorpayCharges)}
              tone="text-[#FABC4E]"
              hint={`Fee ${inr(t.razorpayFee)} + GST ${inr(t.razorpayTax)}`}
            />
            <Stat
              label="Net kept"
              value={inr(t.net)}
              tone={t.net >= 0 ? "text-white" : "text-red-400"}
              hint="Commission minus Razorpay's cut"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Stat label="Refunded out" value={inr(t.refunded)} hint="Returned to clients" />
            <Stat label="Platform balance" value={inr(t.platformBalance)} hint="Un-withdrawn commission" />
            <Stat label="Lifetime revenue" value={inr(t.platformTotalRevenue)} hint="All time, all sources" />
          </div>

          {/* Razorpay only fills `fee` once THEY settle, so a fresh payment
              legitimately shows ₹0 charges. Said plainly, because otherwise it
              reads as free money. */}
          <p className="text-[11px] text-white/30 leading-relaxed">
            Razorpay's fee appears only after they settle a payment, so very recent ones show ₹0
            charges and the figure climbs over the following days. A refund does not return their
            fee, which is why "Net kept" can go negative in a heavy refund month.
            {data.truncated && " Showing the most recent 2,000 payments only."}
          </p>

          {!!data.byMethod?.length && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-3">
                By method
              </p>
              <div className="space-y-1.5">
                {data.byMethod.map((m: any) => (
                  <div key={m.method} className="flex items-center justify-between text-sm">
                    <span className="text-white/70 capitalize">{m.method}</span>
                    <span className="text-white/45 text-xs">
                      {m.count} · <span className="text-white font-medium">{inr(m.amount)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-4 pt-4 pb-3">
              Payments ({data.payments?.length || 0})
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-white/35 border-b border-white/10">
                    <th className="text-left font-semibold px-4 py-2">When</th>
                    <th className="text-left font-semibold px-4 py-2">Payment</th>
                    <th className="text-left font-semibold px-4 py-2">For</th>
                    <th className="text-right font-semibold px-4 py-2">Amount</th>
                    <th className="text-right font-semibold px-4 py-2">RZP fee</th>
                    <th className="text-right font-semibold px-4 py-2">Refunded</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.payments || []).map((p: any) => (
                    <tr key={p.id} className="border-b border-white/[0.05]">
                      <td className="px-4 py-2 text-white/45 text-xs whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-white/70 text-xs font-mono">{p.id}</span>
                        <span className="block text-[10px] text-white/30 capitalize">
                          {p.method} · {p.email || p.contact || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs text-white/50">{p.kind || "—"}</td>
                      <td className="px-4 py-2 text-right font-medium whitespace-nowrap">
                        {inr(p.amount)}
                      </td>
                      <td className="px-4 py-2 text-right text-[#FABC4E] text-xs whitespace-nowrap">
                        {p.fee ? inr(p.fee + p.tax) : "—"}
                      </td>
                      <td className="px-4 py-2 text-right text-xs whitespace-nowrap">
                        {p.refunded ? (
                          <span className="text-[#63A6F2]">{inr(p.refunded)}</span>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!data.payments?.length && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-sm text-white/35">
                        No captured payments in this window.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [active, setActive] = useState<NavKey>("dashboard");

  /* How many refunds and disputes are actually waiting on someone.
     Both buttons looked identical whether the queue was empty or had a dozen
     cases in it, so the only way to find out was to open them — which is how a
     dispute sits unruled for days. Polled, because an admin leaves this tab
     open all day and a count fetched once at mount goes stale immediately. */
  const [queueCounts, setQueueCounts] = useState({ refunds: 0, disputes: 0 });

  useEffect(() => {
    let cancelled = false;

    const loadCounts = async () => {
      const token = readAdminToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}` };

      const [refunds, disputes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/refunds?status=PENDING`, { headers })
          .then((r) => r.json())
          .catch(() => null),
        fetch(`${API_BASE}/api/admin/disputes?status=ADMIN_REVIEW`, { headers })
          .then((r) => r.json())
          .catch(() => null),
      ]);

      if (cancelled) return;
      setQueueCounts({
        refunds: refunds?.success ? refunds.refundRequests?.length ?? 0 : 0,
        disputes: disputes?.success ? disputes.total ?? disputes.disputes?.length ?? 0 : 0,
      });
    };

    loadCounts();
    const id = setInterval(loadCounts, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

const [currentView, setCurrentView] = useState<"seller" | "user" | "org">("seller");
 const [showAllUsers, setShowAllUsers] = useState(false);

  // Admin user-profile drawer (click a user row → full profile, mirrors seller)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userProfileLoading, setUserProfileLoading] = useState(false);
  const [userProfileError, setUserProfileError] = useState<string | null>(null);
  const [userBought, setUserBought] = useState<UserBoughtItem[]>([]);
  const [userUploaded, setUserUploaded] = useState<PromptProduct[]>([]);

  // Org (admin platform view) — list, summary/charts, and profile drill-down
  const [orgRows, setOrgRows] = useState<OrgRow[]>([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgError, setOrgError] = useState<string | null>(null);
  const [orgTotal, setOrgTotal] = useState(0);
  const [orgTotalPages, setOrgTotalPages] = useState(1);
  const [orgPage, setOrgPage] = useState(1);
  const [orgPageSize, setOrgPageSize] = useState(10);
  const [orgSearch, setOrgSearch] = useState("");
  const [orgSummary, setOrgSummary] = useState<OrgSummary | null>(null);
  const [orgSummaryLoading, setOrgSummaryLoading] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrgDetail | null>(null);
  const [orgProfileLoading, setOrgProfileLoading] = useState(false);
  const [orgProfileError, setOrgProfileError] = useState<string | null>(null);

  // Suspend action state (user profile reuses the seller /block endpoint;
  // org profile uses the whole-org freeze endpoint)
  const [userSuspendLoading, setUserSuspendLoading] = useState(false);
  const [userSuspendError, setUserSuspendError] = useState<string | null>(null);
  const [orgSuspendLoading, setOrgSuspendLoading] = useState(false);
  const [orgSuspendError, setOrgSuspendError] = useState<string | null>(null);

  // Seller profile opened from the dashboard seller-snapshot list (the same
  // SellerProfileView the Seller Management page uses).
  const [selectedSellerMain, setSelectedSellerMain] = useState<SellerProfile | null>(null);
  const [sellerMainProducts, setSellerMainProducts] = useState<PromptProduct[]>([]);
  const [sellerMainLoading, setSellerMainLoading] = useState(false);
  const [sellerMainError, setSellerMainError] = useState<string | null>(null);
  const [sellerMainSuspendLoading, setSellerMainSuspendLoading] = useState(false);
  const [sellerMainSuspendError, setSellerMainSuspendError] = useState<string | null>(null);
const [userRows, setUserRows] = useState<UserRow[]>([]);
const [userLoading, setUserLoading] = useState(false);
const [userError, setUserError] = useState<string | null>(null);
const [userPage, setUserPage] = useState(1);
const [userPageSize, setUserPageSize] = useState(10);
const [userTotalPages, setUserTotalPages] = useState(1);
const [userTotal, setUserTotal] = useState(0);
const [userSearch, setUserSearch] = useState("");
 const [showAllActivities, setShowAllActivities] = useState(false);

 /* ── Admin notifications (new reports, AI-flagged uploads) ── */
 const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
 const adminUnreadCount = adminNotifications.filter((n) => !n.read).length;

 const fetchAdminNotifications = async () => {
   try {
     const token = getToken();
     const res = await fetch(`${API_BASE}/api/admin/notifications`, {
       headers: { Authorization: `Bearer ${token}` },
       credentials: "include",
     });
     const data = await res.json().catch(() => ({}));
     if (res.ok && data?.success) setAdminNotifications(data.notifications || []);
   } catch (err) {
     console.error("Fetch admin notifications failed:", err);
   }
 };

 useEffect(() => {
   fetchAdminNotifications();
   const interval = setInterval(fetchAdminNotifications, 30000);
   return () => clearInterval(interval);
   // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const markAdminNotificationRead = async (id: string) => {
   setAdminNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
   try {
     const token = getToken();
     await fetch(`${API_BASE}/api/admin/notifications/${id}/read`, {
       method: "POST",
       headers: { Authorization: `Bearer ${token}` },
       credentials: "include",
     });
   } catch (err) {
     console.error("Mark admin notification read failed:", err);
   }
 };

 const markAllAdminNotificationsRead = async () => {
   setAdminNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
   try {
     const token = getToken();
     await fetch(`${API_BASE}/api/admin/notifications/read-all`, {
       method: "POST",
       headers: { Authorization: `Bearer ${token}` },
       credentials: "include",
     });
   } catch (err) {
     console.error("Mark all admin notifications read failed:", err);
   }
 };

 const [stats, setStats] = useState({
  totalRevenue: 0,
  totalSellers: 0,
});
const [pendingUsersCount, setPendingUsersCount] = useState(0);
const [pendingSellersCount, setPendingSellersCount] = useState(0);
const [platformRevenue, setPlatformRevenue] = useState({
  availableBalance: 0,
  totalRevenue: 0,
  totalWithdrawn: 0,
  // GST charged on Tokun's fees. Shown apart from revenue because it's owed
  // onward to the government — counting it as earnings overstates the margin.
  gstCollected: 0,
  transactions: [] as Array<{ _id: string; type: string; amount: number; source: string; description: string; createdAt: string }>,
});
const [platformRevenueLoading, setPlatformRevenueLoading] = useState(false);
const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
const [withdrawAmount, setWithdrawAmount] = useState("");
const [withdrawNote, setWithdrawNote] = useState("");
const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);



const [sellerRows, setSellerRows] = useState<SellerRow[]>([]);

type ChartDatum = {
  year?: number;
  month?: number;
  name: string;
  blue: number;  // revenue
  green: number; // sales count
};

const defaultChartData: ChartDatum[] = [
  { name: "Week 1", blue: 28, green: 18 },
  { name: "Week 2", blue: 14, green: 22 },
  { name: "Week 3", blue: 18, green: 24 },
  { name: "Week 4", blue: 44, green: 30 },
  { name: "Week 5", blue: 34, green: 44 },
  { name: "Week 6", blue: 46, green: 26 },
  { name: "Week 7", blue: 22, green: 30 },
  { name: "Week 8", blue: 18, green: 28 },
  { name: "Week 9", blue: 6, green: 34 },
];

const [chartData, setChartData] = useState<ChartDatum[]>(defaultChartData);


  // ✅ Admin name (same as before)
  const adminEmail = (localStorage.getItem("tokun_admin_email") || "").trim();
  const adminName = useMemo(() => {
    if (!adminEmail) return "Admin";
    const localPart = adminEmail.split("@")[0] || "Admin";
    const first = localPart.split(/[._-]/)[0] || localPart;
    return first.charAt(0).toUpperCase() + first.slice(1);
  }, [adminEmail]);

  // ✅ Token getter — this page is admin-only (/admin/dashboard), so the admin
  // token must win; otherwise a stale non-admin "token" from the same browser
  // gets sent instead and every admin API call 403s.
  const getToken = () => {
    const token =
      localStorage.getItem("tokun_admin_token") ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("tokun_token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken") ||
      "";

    return token.replace(/^Bearer\s+/i, "").trim();
  };

  const getAuthHeaders = (): Record<string, string> => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  type DashboardStat = {
    userId: string;
    email?: string;
    uploadedPrompts: number;
    buyProducts: number;
    soldProducts: number;
    totalSpent: number;
    totalEarnings: number;
  };

  const toNumber = (value: any) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const normalizeDashboardStat = (item: any): DashboardStat | null => {
    const userId = String(
      item?.userId ||
      item?._id ||
      item?.id ||
      item?.buyer ||
      ""
    );

    const email = String(
      item?.email ||
      item?.userEmail ||
      item?.buyerEmail ||
      item?.sellerEmail ||
      ""
    ).trim().toLowerCase();

    if (!userId && !email) return null;

    return {
      userId: userId || email,
      email,
      // ✅ Sell = uploaded prompts
      uploadedPrompts: toNumber(
        item?.uploadedPrompts ??
        item?.totalUploadedPrompts ??
        item?.totalProducts ??
        item?.uploadedCount ??
        item?.saleProducts
      ),
      // ✅ Buy = purchased prompts
      buyProducts: toNumber(
        item?.buyProducts ??
        item?.purchasedCount ??
        item?.totalPurchases ??
        item?.purchases
      ),
      // ✅ Sold = purchases of this seller's prompts
      soldProducts: toNumber(
        item?.soldProducts ??
        item?.totalSoldPrompts ??
        item?.salesCount
      ),
      totalSpent: toNumber(item?.totalSpent),
      // ✅ Volume = earning
      totalEarnings: toNumber(
        item?.totalEarnings ??
        item?.volume ??
        item?.earnings ??
        item?.totalRevenue ??
        item?.revenue
      ),
    };
  };

  const putStat = (map: Record<string, DashboardStat>, stat: DashboardStat | null) => {
    if (!stat) return;

    const keys = [
      stat.userId ? String(stat.userId) : "",
      stat.email ? String(stat.email).trim().toLowerCase() : "",
    ].filter(Boolean);

    if (!keys.length) return;

    const mergeForKey = (key: string) => {
      const prev = map[key] || {
        userId: stat.userId || key,
        email: stat.email,
        uploadedPrompts: 0,
        buyProducts: 0,
        soldProducts: 0,
        totalSpent: 0,
        totalEarnings: 0,
      };

      map[key] = {
        userId: stat.userId || prev.userId || key,
        email: stat.email || prev.email,
        // ✅ non-zero/new values win, so user API ke 0 stale values real counts overwrite nahi karte
        uploadedPrompts: stat.uploadedPrompts || prev.uploadedPrompts,
        buyProducts: stat.buyProducts || prev.buyProducts,
        soldProducts: stat.soldProducts || prev.soldProducts,
        totalSpent: stat.totalSpent || prev.totalSpent,
        totalEarnings: stat.totalEarnings || prev.totalEarnings,
      };
    };

    keys.forEach(mergeForKey);
  };

  const getStatForUser = (map: Record<string, DashboardStat>, user: any): Partial<DashboardStat> => {
    const id = String(user?._id || user?.id || "");
    const email = String(user?.email || "").trim().toLowerCase();

    return (
      map[id] ||
      map[email] ||
      {}
    );
  };

  // ✅ Primary dashboard stats source: seller API now returns uploaded/buy/sold/earning fields.
  const fetchSellerStatsMap = async (headers: Record<string, string> = {}) => {
    const res = await fetch(`${SELLERS_BASE}?limit=0`, {
      headers,
      credentials: "include",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      throw new Error(data?.error || data?.message || "Failed to load seller stats");
    }

    const map: Record<string, DashboardStat> = {};
    (data.sellers || []).forEach((item: any) => putStat(map, normalizeDashboardStat(item)));
    return map;
  };

  // ✅ Combined stats source for dashboard counts.
  // NOTE: We intentionally use only /api/seller?limit=0 here because this route already
  // returns uploaded prompt count, purchased prompt count, sold count, and volume.
  // This also avoids the 401 from /api/purchase/analytics/user-stats when admin token is missing.
  const fetchDashboardStatsMap = async (headers: Record<string, string> = {}) => {
    const map: Record<string, DashboardStat> = {};

    const sellerStats = await fetchSellerStatsMap(headers);
    Object.values(sellerStats).forEach((stat) => putStat(map, stat));

    console.log("✅ dashboard prompt count stats", map);
    return map;
  };




// ✅ SIMPLE WORKAROUND — activityLogger ko frontend se call karo
// Dashboard.tsx mein ye helper function add karo:

const logActivityToLocal = async (type: string, title: string, description: string, actorName?: string) => {
  try {
    await fetch(`${API_BASE}/api/activity/test-insert-custom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title, description, actorName }),
    });
  } catch (e) {
    // silent fail
  }
};







  const [activities, setActivities] = useState<ActivityItem[]>([]);
const [activitiesLoading, setActivitiesLoading] = useState(false);
const [activitiesError, setActivitiesError] = useState<string | null>(null);

   const activityMeta = (type: ActivityItem["type"]) => {
  switch (type) {
    case "USER_REGISTERED":
      return {
        icon: <UserRound className="h-4 w-4" />,
        iconBg: "bg-blue-500/15 text-blue-300 border-blue-500/25",
      };
    case "USER_LOGIN":
      return {
        icon: <ShieldCheck className="h-4 w-4" />,
        iconBg: "bg-slate-500/15 text-slate-200 border-slate-400/25",
      };
    case "PRODUCT_PURCHASED":
      return {
        icon: <ShoppingCart className="h-4 w-4" />,
        iconBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
      };
    case "VIDEO_CALL_STARTED":
      return {
        icon: <Video className="h-4 w-4" />,
        iconBg: "bg-sky-500/15 text-sky-200 border-sky-500/25",
      };
    case "VIDEO_CALL_ENDED":
      return {
        icon: <Video className="h-4 w-4" />,
        iconBg: "bg-slate-500/15 text-slate-200 border-slate-400/25",
      };
    case "SELLER_REGISTERED":
      return {
        icon: <UserRound className="h-4 w-4" />,
        iconBg: "bg-blue-500/15 text-blue-300 border-blue-500/25",
      };
    case "PRODUCT_APPROVED":
      return {
        icon: <CheckCircle2 className="h-4 w-4" />,
        iconBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
      };
    case "PAYOUT_FAILED":
      return {
        icon: <XCircle className="h-4 w-4" />,
        iconBg: "bg-red-500/15 text-red-300 border-red-500/25",
      };
    case "POLICY_UPDATE":
      return {
        icon: <ShieldCheck className="h-4 w-4" />,
        iconBg: "bg-slate-500/15 text-slate-200 border-slate-400/25",
      };
    case "REPORT_CREATED":
      return {
        icon: <ShieldAlert className="h-4 w-4" />,
        iconBg: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/25",
      };
    case "LISTING_SUSPENDED":
      return {
        icon: <Ban className="h-4 w-4" />,
        iconBg: "bg-red-500/15 text-red-200 border-red-500/25",
      };
    case "PRODUCT_FLAGGED":
      return {
        icon: <TriangleAlert className="h-4 w-4" />,
        iconBg: "bg-amber-500/15 text-amber-200 border-amber-500/25",
      };
    default:
      return {
        icon: <Clock className="h-4 w-4" />,
        iconBg: "bg-white/10 text-white/70 border-white/15",
      };
  }
};



// useEffect(() => {
//   const loadActivities = async () => {
//     try {
//       setActivitiesLoading(true);
//       setActivitiesError(null);

//       const token = getToken();
//       console.log("🔑 Token being used:", token); // token dekho

//       const res = await fetch(`${API_BASE}/api/activity/recent?limit=10`, {
//         headers: {
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         credentials: "include",
//       });

//       console.log("📡 Response status:", res.status); // status dekho

//       if (!res.ok) {
//         throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
//       }

//       const data = await res.json();
//       console.log("📦 Raw API data:", data);          // raw data dekho
//       console.log("📋 Items count:", data?.items?.length); // items count dekho

//       if (!data?.success) {
//         throw new Error(data?.message || data?.error || "Failed to load activities");
//       }

//       const mapped: ActivityItem[] = (data.items || []).map((a: any) => ({
//         id: String(a._id || a.id),
//         title: a.title || "Activity",
//         desc: a.description || a.desc ||
//           (a.actorName ? `By ${a.actorName}${a.targetName ? ` • ${a.targetName}` : ""}` : ""),
//         createdAt: a.createdAt || new Date().toISOString(),
//         type: (a.type || "OTHER") as ActivityItem["type"],
//       }));

//       console.log("✅ Mapped activities:", mapped); // mapped data dekho

//       setActivities(mapped);
//     } catch (e: any) {
//       console.error("❌ Activity load error:", e);
//       setActivitiesError(e?.message || "Failed to load activities");
//       setActivities([]);
//     } finally {
//       setActivitiesLoading(false);
//     }
//   };

//   loadActivities();
// }, []);




// ✅ REPLACE KARO — active page change pe bhi reload ho
useEffect(() => {
  const loadActivities = async () => {
    try {
      setActivitiesLoading(true);
      setActivitiesError(null);

      const token = getToken();

      const res = await fetch(`${API_BASE}/api/activity/recent?limit=10`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

      const data = await res.json();
      if (!data?.success) throw new Error(data?.message || "Failed");

      const mapped: ActivityItem[] = (data.items || []).map((a: any) => ({
        id: String(a._id || a.id),
        title: a.title || "Activity",
        desc: a.description || a.desc ||
          (a.actorName ? `By ${a.actorName}${a.targetName ? ` • ${a.targetName}` : ""}` : ""),
        createdAt: a.createdAt || new Date().toISOString(),
        type: (a.type || "OTHER") as ActivityItem["type"],
      }));

      console.log("✅ Setting activities:", mapped.length);
      setActivities(mapped);
    } catch (e: any) {
      console.error("❌ Activity error:", e);
      setActivitiesError(e?.message || "Failed to load activities");
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // ✅ dashboard active hone pe fetch karo
  if (active === "dashboard") {
    loadActivities();
  }
}, [active]); // ✅ active dependency add karo

useEffect(() => {
  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      setUserError(null);

      const headers = getAuthHeaders();

      const params = new URLSearchParams();
      params.set("limit", String(userPageSize));
      params.set("page", String(userPage));
      if (userSearch.trim()) params.set("search", userSearch.trim());

      const [usersRes, statsByUser] = await Promise.all([
        fetch(`${USERS_BASE}?${params.toString()}`, {
          headers,
          credentials: "include",
        }),
        fetchDashboardStatsMap(headers),
      ]);

      const data = await usersRes.json();

      if (!usersRes.ok || !data?.success) {
        throw new Error(data?.error || data?.message || "Failed to load users");
      }

      const mapped: UserRow[] = (data.users || []).map((u: any) => {
        const uid = String(u._id || u.id);
        const stat = getStatForUser(statsByUser, u);

        return {
          id: uid,
          name: u?.name || "Unknown",
          email: u?.email || "—",
          avatar: u?.avatarUrl || undefined,
          userType: u?.userType,
          plan: u?.plan ?? null,
          isVerified: !!u?.isVerified,
          kycStatus: u?.kycStatus,
          createdAt: u?.createdAt,
          lastLoginAt: u?.lastLoginAt,

          // ✅ Purchased Prompt = user ne kitne prompts purchase kiye
          buyProducts: Number(
            stat.buyProducts ||
            u?.buyProducts ||
            u?.purchasedPrompts ||
            u?.purchasedCount ||
            u?.totalPurchases ||
            0
          ),
          purchasedPrompts: Number(
            stat.buyProducts ||
            u?.buyProducts ||
            u?.purchasedPrompts ||
            u?.purchasedCount ||
            u?.totalPurchases ||
            0
          ),

          // ✅ Uploaded Prompt = user ne kitne prompts upload kiye
          saleProducts: Number(
            stat.uploadedPrompts ||
            u?.uploadedPrompts ||
            u?.saleProducts ||
            u?.totalProducts ||
            u?.totalUploadedPrompts ||
            0
          ),
          uploadedPrompts: Number(
            stat.uploadedPrompts ||
            u?.uploadedPrompts ||
            u?.saleProducts ||
            u?.totalProducts ||
            u?.totalUploadedPrompts ||
            0
          ),

          totalEarnings: Number(stat.totalEarnings || u?.totalEarnings || u?.volume || 0),
          totalSpent: Number(stat.totalSpent || u?.totalSpent || 0),
        };
      });

      setUserRows(mapped);
      setUserTotal(data?.pagination?.total || mapped.length || 0);
      setUserTotalPages(data?.pagination?.totalPages || 1);
    } catch (e: any) {
      setUserError(e?.message || "Error loading users");
      setUserRows([]);
      setUserTotal(0);
      setUserTotalPages(1);
    } finally {
      setUserLoading(false);
    }
  };

  if (active === "dashboard" && currentView === "user") fetchUsers();
}, [active, currentView, userPage, userPageSize, userSearch]);

  // Open a full admin profile for a clicked user. Reuses GET /api/seller/:id
  // (works for ANY user — sellers and buyers are the same User model, and it
  // already returns both buy-side and sell-side stats), GET /api/prompt/user/:id
  // for their uploaded prompts, and GET /api/purchase/admin/user/:id for the
  // itemized "bought" list.
  const openUserProfile = async (userId?: string | null, fallback?: UserRow) => {
    if (!userId) return;
    setSelectedUser({
      id: userId,
      name: fallback?.name || "Loading…",
      email: fallback?.email,
      avatar: fallback?.avatar,
      userType: fallback?.userType,
      plan: fallback?.plan ?? null,
      verified: fallback?.isVerified,
      joined: fallback?.createdAt,
      buyProducts: fallback?.buyProducts ?? fallback?.purchasedPrompts ?? 0,
      totalSpent: fallback?.totalSpent ?? 0,
      uploadedCount: fallback?.uploadedPrompts ?? fallback?.saleProducts ?? 0,
      soldProducts: 0,
      totalEarnings: fallback?.totalEarnings ?? 0,
    });
    setUserBought([]);
    setUserUploaded([]);
    setUserProfileError(null);
    setUserProfileLoading(true);
    try {
      const headers = { ...getAuthHeaders() };

      const [statsRes, uploadedRes, boughtRes] = await Promise.all([
        fetch(`${SELLERS_BASE}/${userId}`, { headers, credentials: "include" }),
        fetch(`${PROMPTS_BASE}/user/${userId}`, { headers, credentials: "include" }),
        fetch(`${API_BASE}/api/purchase/admin/user/${userId}`, { headers, credentials: "include" }),
      ]);

      const statsData = await statsRes.json().catch(() => ({}));
      if (!statsRes.ok || !statsData?.success)
        throw new Error(statsData?.error || "Failed to load user profile");
      const s = statsData.seller || {};

      setSelectedUser({
        id: String(s._id || userId),
        name: s.name || fallback?.name || "Unknown",
        email: s.email || fallback?.email,
        avatar: s.avatar || fallback?.avatar,
        userType: s.userType || fallback?.userType,
        plan: s.plan ?? fallback?.plan ?? null,
        verified: !!s.verified,
        joined: s.joined || fallback?.createdAt,
        status: s.isDeleted ? "DELETED" : s.status || "ACTIVE",
        buyProducts: Number(s.buyProducts || 0),
        totalSpent: Number(s.totalSpent || 0),
        uploadedCount: Number(s.totalUploadedPrompts ?? s.totalProducts ?? 0),
        soldProducts: Number(s.soldProducts || 0),
        totalEarnings: Number(s.totalEarnings || 0),
      });

      const uploadedData = await uploadedRes.json().catch(() => ({}));
      if (uploadedData?.success) {
        const mapped: PromptProduct[] = (uploadedData.prompts || []).map((doc: any) => {
          const att = doc?.attachment || null;
          const status: PromptProduct["status"] =
            doc?.flagged ? "Flagged" : doc?.draft ? "Draft" : "Published";
          return {
            id: String(doc._id),
            title: doc?.title || "Untitled",
            uploaderName: doc?.userId?.name || "Unknown",
            uploaderId: doc?.userId?._id || doc?.userId || null,
            price: typeof doc?.price === "number" ? doc.price : 0,
            status,
            imageUrl: att?.type === "image" ? att?.path : undefined,
            videoUrl: att?.type === "video" ? att?.path : undefined,
            category: doc?.categories?.[0]?.name || "General",
            exclusive: !!doc?.exclusive,
            sold: !!doc?.sold,
            salesCount: Number(doc?.salesCount || 0),
            totalRevenue: Number(doc?.totalRevenue || 0),
          };
        });
        setUserUploaded(mapped);
      }

      const boughtData = await boughtRes.json().catch(() => ({}));
      if (boughtData?.success) {
        setUserBought(boughtData.purchases || []);
      }
    } catch (e: any) {
      setUserProfileError(e?.message || "Error loading user profile");
    } finally {
      setUserProfileLoading(false);
    }
  };

  const closeUserProfile = () => {
    setSelectedUser(null);
    setUserBought([]);
    setUserUploaded([]);
    setUserProfileError(null);
  };

  // Org list — paginated/searchable, admin-only (GET /api/admin/orgs).
  useEffect(() => {
    if (active !== "dashboard" || currentView !== "org") return;
    let cancelled = false;
    (async () => {
      try {
        setOrgLoading(true);
        setOrgError(null);
        const params = new URLSearchParams();
        params.set("limit", String(orgPageSize));
        params.set("page", String(orgPage));
        if (orgSearch.trim()) params.set("search", orgSearch.trim());
        const res = await fetch(`${API_BASE}/api/admin/orgs?${params.toString()}`, {
          headers: { ...getAuthHeaders() },
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data?.success)
          throw new Error(data?.error || "Failed to load organizations");
        if (cancelled) return;
        setOrgRows(data.orgs || []);
        setOrgTotal(data?.pagination?.total || 0);
        setOrgTotalPages(data?.pagination?.totalPages || 1);
      } catch (e: any) {
        if (cancelled) return;
        setOrgError(e?.message || "Error loading organizations");
        setOrgRows([]);
        setOrgTotal(0);
        setOrgTotalPages(1);
      } finally {
        if (!cancelled) setOrgLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active, currentView, orgPage, orgPageSize, orgSearch]);

  // Org summary — KPIs + charts (GET /api/admin/orgs/summary).
  useEffect(() => {
    if (active !== "dashboard" || currentView !== "org") return;
    let cancelled = false;
    (async () => {
      try {
        setOrgSummaryLoading(true);
        const res = await fetch(`${API_BASE}/api/admin/orgs/summary`, {
          headers: { ...getAuthHeaders() },
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled && data?.success) {
          setOrgSummary({
            kpis: data.kpis,
            trends: data.trends || [],
            statusBreakdown: data.statusBreakdown || [],
          });
        }
      } catch {
        /* non-fatal — KPIs/charts just stay empty */
      } finally {
        if (!cancelled) setOrgSummaryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active, currentView]);

  // Click an org row → full org profile (GET /api/admin/orgs/:orgId).
  const openOrgProfile = async (orgId?: string | null, fallback?: OrgRow) => {
    if (!orgId) return;
    setSelectedOrg(
      fallback
        ? {
            ...fallback,
            ownerAvatar: null,
            billingAnchor: null,
            lastInvoiceDueAt: null,
            graceDays: 0,
            totalAssignedCap: 0,
            members: [],
          }
        : null
    );
    setOrgProfileError(null);
    setOrgProfileLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/orgs/${orgId}`, {
        headers: { ...getAuthHeaders() },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data?.success)
        throw new Error(data?.error || "Failed to load organization");
      setSelectedOrg(data.org);
    } catch (e: any) {
      setOrgProfileError(e?.message || "Error loading organization");
    } finally {
      setOrgProfileLoading(false);
    }
  };

  const closeOrgProfile = () => {
    setSelectedOrg(null);
    setOrgProfileError(null);
  };

  // Suspend / reactivate a user — reuses the seller block endpoint (users and
  // sellers are the same account; sellerStatus drives blockIfSuspended).
  const handleUserSuspendToggle = async () => {
    if (!selectedUser) return;
    const suspending = selectedUser.status !== "SUSPENDED";
    const action = suspending ? "block" : "unblock";
    const ok = window.confirm(
      suspending
        ? `Suspend "${selectedUser.name}"? They won't be able to buy, sell, or withdraw.`
        : `Reactivate "${selectedUser.name}"? They regain full access.`
    );
    if (!ok) return;
    try {
      setUserSuspendLoading(true);
      setUserSuspendError(null);
      const res = await fetch(`${SELLERS_BASE}/${selectedUser.id}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || "Action failed");
      const newStatus = suspending ? "SUSPENDED" : "ACTIVE";
      setSelectedUser((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (e: any) {
      setUserSuspendError(e?.message || "Action failed");
    } finally {
      setUserSuspendLoading(false);
    }
  };

  // Suspend / reactivate a whole org (owner + all members) via the admin freeze
  // endpoint.
  const handleOrgSuspendToggle = async () => {
    if (!selectedOrg) return;
    const freezing = !selectedOrg.adminFrozen;
    const action = freezing ? "suspend" : "reactivate";
    const ok = window.confirm(
      freezing
        ? `Suspend the whole org "${selectedOrg.name}"? The owner and all ${selectedOrg.membersCount} members will be blocked until reactivated.`
        : `Reactivate "${selectedOrg.name}"? The owner and members regain access.`
    );
    if (!ok) return;
    try {
      setOrgSuspendLoading(true);
      setOrgSuspendError(null);
      const res = await fetch(`${API_BASE}/api/admin/orgs/${selectedOrg.id}/suspend`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || "Action failed");
      setSelectedOrg((prev) => (prev ? { ...prev, adminFrozen: freezing } : prev));
      setOrgRows((prev) =>
        prev.map((o) => (o.id === selectedOrg.id ? { ...o, adminFrozen: freezing } : o))
      );
    } catch (e: any) {
      setOrgSuspendError(e?.message || "Action failed");
    } finally {
      setOrgSuspendLoading(false);
    }
  };

  // Open a seller profile from the dashboard seller-snapshot list. Same fetch as
  // SellersView.openSellerProfile, rendered via SellerProfileView.
  const openSellerMainProfile = async (sellerId?: string | null) => {
    if (!sellerId) return;
    setSelectedSellerMain(null);
    setSellerMainProducts([]);
    setSellerMainError(null);
    setSellerMainLoading(true);
    try {
      const headers = { ...getAuthHeaders() };
      const [resSeller, resPrompts] = await Promise.all([
        fetch(`${SELLERS_BASE}/${sellerId}`, { headers, credentials: "include" }),
        fetch(`${PROMPTS_BASE}/by-seller/${sellerId}`, { headers, credentials: "include" }),
      ]);
      const sellerData = await resSeller.json();
      if (!resSeller.ok || !sellerData?.success)
        throw new Error(sellerData?.error || "Failed to load seller profile");
      const promptData = await resPrompts.json().catch(() => ({ prompts: [] }));
      const s = sellerData.seller;

      setSelectedSellerMain({
        id: String(s?._id || sellerId),
        name: s?.name || "Unknown",
        email: s?.email,
        location: s?.location,
        joined: s?.joined,
        status: s?.status || "ACTIVE",
        avatar: s?.avatar,
        verified: !!s?.verified,
        totalEarnings: Number(s?.totalEarnings || 0),
        rating: s?.rating ?? 0,
        reviewsCount: s?.reviewsCount ?? 0,
        refundRate: s?.refundRate ?? 0,
        refundThreshold: s?.refundThreshold ?? 5,
        buyProducts: Number(s?.buyProducts || 0),
        totalUploadedPrompts: Number(s?.totalUploadedPrompts ?? s?.totalProducts ?? 0),
        plan: s?.plan ?? null,
        userType: s?.userType || "IND",
      });

      const mapped: PromptProduct[] = (promptData.prompts || []).map((doc: any) => {
        const att = doc?.attachment || null;
        const status: PromptProduct["status"] =
          doc?.flagged ? "Flagged" : doc?.draft ? "Draft" : "Published";
        return {
          id: String(doc._id),
          title: doc?.title || "Untitled",
          uploaderName: doc?.userId?.name || "Unknown",
          uploaderId: doc?.userId?._id || doc?.userId || null,
          price: typeof doc?.price === "number" ? doc.price : 0,
          status,
          imageUrl: att?.type === "image" ? att?.path : undefined,
          videoUrl: att?.type === "video" ? att?.path : undefined,
          category: doc?.categories?.[0]?.name || "General",
          exclusive: !!doc?.exclusive,
          sold: !!doc?.sold,
          salesCount: Number(doc?.salesCount || 0),
          totalRevenue: Number(doc?.totalRevenue || 0),
        };
      });
      setSellerMainProducts(mapped);
    } catch (e: any) {
      setSellerMainError(e?.message || "Error loading seller profile");
    } finally {
      setSellerMainLoading(false);
    }
  };

  const closeSellerMainProfile = () => {
    setSelectedSellerMain(null);
    setSellerMainProducts([]);
    setSellerMainError(null);
  };

  const handleSellerMainSuspendToggle = async () => {
    if (!selectedSellerMain) return;
    const action = selectedSellerMain.status === "SUSPENDED" ? "unblock" : "block";
    const ok = window.confirm(
      action === "block"
        ? `Suspend "${selectedSellerMain.name}"? They won't be able to sell on the platform.`
        : `Reactivate "${selectedSellerMain.name}"? They regain access to sell.`
    );
    if (!ok) return;
    try {
      setSellerMainSuspendLoading(true);
      setSellerMainSuspendError(null);
      const res = await fetch(`${SELLERS_BASE}/${selectedSellerMain.id}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || "Action failed");
      const newStatus = action === "block" ? "SUSPENDED" : "ACTIVE";
      setSelectedSellerMain((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setSellerRows((prev) =>
        prev.map((r) =>
          r.id === selectedSellerMain.id
            ? { ...r, status: newStatus === "SUSPENDED" ? "Blocked" : "Active" }
            : r
        )
      );
    } catch (e: any) {
      setSellerMainSuspendError(e?.message || "Action failed");
    } finally {
      setSellerMainSuspendLoading(false);
    }
  };
  // =======================
  // Dashboard chart/table/activity data
  // =======================

     const recentActivitiesPreview = useMemo(() => {
  return activities.slice(0, 4);
}, [activities]);


 const timeAgo = (dateLike: string) => {
  const t = new Date(dateLike).getTime();
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

useEffect(() => {
  const fetchSalesAnalytics = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/purchase/analytics/sales`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch sales analytics");
      }

      const data = await res.json();

      if (data.success) {
        formatChartData(data.monthlySales);
      }
    } catch (error) {
      console.error("Sales analytics error:", error);
    }
  };

  fetchSalesAnalytics();
}, []);

const formatChartData = (apiData: any[] = []) => {
  const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const today = new Date();

  // 🔹 last 6 months ka base structure
  const last6Months = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);

    last6Months.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      name: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      blue: 0,
      green: 0,
    });
  }

  // 🔹 API data merge
  (Array.isArray(apiData) ? apiData : []).forEach((item: any) => {
    const index = last6Months.findIndex(
      m =>
        m.month === item._id.month &&
        m.year === item._id.year
    );

    if (index !== -1) {
      last6Months[index].blue = item.revenue || 0;
      last6Months[index].green = item.totalSales || 0;
    }
  });

  setChartData(last6Months);
};

// Validated categorical palette (dark-surface steps) — fixed order, never
// cycled. Top-N categories get slots 1-6; "Other" always takes slot 7.
const CATEGORY_SALES_COLORS = [
  "#3987e5", // blue
  "#008300", // green
  "#d55181", // magenta
  "#c98500", // yellow
  "#199e70", // aqua
  "#d95926", // orange
  "#9085e9", // violet — reserved for "Other"
];

const [categorySalesSeries, setCategorySalesSeries] = useState<string[]>([]);
const [categorySalesData, setCategorySalesData] = useState<any[]>([]);
const [categorySalesLoading, setCategorySalesLoading] = useState(true);

useEffect(() => {
  const fetchSalesByCategory = async () => {
    try {
      setCategorySalesLoading(true);
      const res = await fetch(`${API_BASE}/api/purchase/analytics/sales-by-category?months=6`);
      const data = await res.json();
      if (res.ok && data?.success) {
        setCategorySalesSeries(data.categories || []);
        setCategorySalesData(data.data || []);
      }
    } catch (err) {
      console.error("Sales-by-category analytics error:", err);
    } finally {
      setCategorySalesLoading(false);
    }
  };
  fetchSalesByCategory();
}, []);

/* ── Seller trends (real seller signal: payout earnings + active sellers) ── */
const [sellerTrendsData, setSellerTrendsData] = useState<any[]>([]);
const [sellerTrendsLoading, setSellerTrendsLoading] = useState(true);

useEffect(() => {
  const fetchSellerTrends = async () => {
    try {
      setSellerTrendsLoading(true);
      const res = await fetch(`${API_BASE}/api/purchase/analytics/seller-trends?months=6`);
      const data = await res.json();
      if (res.ok && data?.success) setSellerTrendsData(data.data || []);
    } catch (err) {
      console.error("Seller trends analytics error:", err);
    } finally {
      setSellerTrendsLoading(false);
    }
  };
  fetchSellerTrends();
}, []);

/* ── User trends (real user signal: new signups + buyer spend) ── */
const [userTrendsData, setUserTrendsData] = useState<any[]>([]);
const [userTrendsLoading, setUserTrendsLoading] = useState(true);

useEffect(() => {
  const fetchUserTrends = async () => {
    try {
      setUserTrendsLoading(true);
      const res = await fetch(`${API_BASE}/api/purchase/analytics/user-trends?months=6`);
      const data = await res.json();
      if (res.ok && data?.success) setUserTrendsData(data.data || []);
    } catch (err) {
      console.error("User trends analytics error:", err);
    } finally {
      setUserTrendsLoading(false);
    }
  };
  fetchUserTrends();
}, []);









const ReportsSidebar = () => {
  /* The "Review Moderation" tab is gone — it only ever rendered "coming
     soon…", so it was a control that cost a click to learn it did nothing.
     This panel is the product-reports queue. */
  const [sort, setSort] = useState<"new" | "old">("new");

  const openCount = (reports || []).filter((r) => r.status === "Open").length;

  const groupLabel = (p: ReportItem["priority"]) => {
    if (p === "High") return "HIGH RISK";
    if (p === "Medium") return "PENDING";
    return "LOW RISK";
  };

  const grouped = useMemo(() => {
    /* Risk grouping stays — a high-risk report an hour old and a low-risk one
       an hour old are not the same job. The control reorders WITHIN each
       group, so newest-first never buries something urgent under something
       trivial that happens to be newer. */
    const list = [...reports].sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return sort === "new" ? tb - ta : ta - tb;
    });

    return {
      High: list.filter((r) => r.priority === "High"),
      Medium: list.filter((r) => r.priority === "Medium"),
      Low: list.filter((r) => r.priority === "Low"),
    };
  }, [reports, sort]);

  const Item = (r: ReportItem) => {
    const isActive = selectedReport?.id === r.id;

    return (
      <button
        key={r.id}
        onClick={() => {
        setSelectedReport(r);
setActive("reports");
setMobileReportsPage("details"); // ✅ on phone open details page

        }}
        className={[
          "w-full text-left px-4 py-4 border-t border-white/10 transition",
          isActive ? "bg-white/[0.05]" : "hover:bg-white/[0.03]",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white/80">
              {groupLabel(r.priority)}
            </div>
            <div className="mt-2 text-sm font-medium text-white/90 truncate">
              {r.productTitle || r.title}
            </div>
            <div className="mt-1 text-xs text-white/55 truncate">
              {r.reason}
              {r.reporterName ? `: Reported by @${r.reporterName}` : ""}
            </div>
          </div>

          <div className="shrink-0 text-xs text-white/45">
            {timeAgo(r.createdAt)}
          </div>
        </div>
      </button>
    );
  };

  return (
    <aside className={[kpiCardBase, "overflow-hidden"].join(" ")}>
      {/* Heading. A single tab is not a tab. */}
      <div className="px-4 pt-4 pb-3 border-b border-white/10">
        <div className="text-sm text-white font-medium">Product Reports</div>
      </div>

      {/* Count + sort */}
      <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-white/10">
        <div className="text-xs text-white/60 uppercase tracking-wide">
          {openCount} Pending Reports
        </div>

        {/* A real control. What was here was a button labelled FILTER with no
            onClick and nothing behind it — it looked like the queue could be
            filtered and it could not. */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "new" | "old")}
          aria-label="Sort reports"
          className="h-8 rounded-lg border border-white/10 bg-white/[0.04] px-2 text-xs text-white/75 outline-none hover:bg-white/[0.07] transition cursor-pointer"
        >
          <option value="new">Newest first</option>
          <option value="old">Oldest first</option>
        </select>
      </div>

      {/* List */}
      <div className="max-h-[calc(100vh-170px)] overflow-y-auto">
        {grouped.High.map(Item)}
        {grouped.Medium.map(Item)}
        {grouped.Low.map(Item)}

        {openCount === 0 && !reports.length && (
          <p className="p-6 text-center text-sm text-white/35">Nothing reported.</p>
        )}
      </div>
    </aside>
  );
};



  // =============================
  // ✅ FETCH MARKETPLACE PROMPTS
  // =============================
  const [products, setProducts] = useState<PromptProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
const isMobile = useMediaQuery("(max-width: 767px)");
const [mobileReportsPage, setMobileReportsPage] = useState<"list" | "details">("list");


  // ✅ Categories for filters
  const [categories, setCategories] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(false);
  const [catsError, setCatsError] = useState<string | null>(null);

  // ✅ Sellers
  // const [sellerRows, setSellerRows] = useState<SellerRow[]>([]);
  const [sellersLoading, setSellersLoading] = useState(false);
  const [sellersError, setSellersError] = useState<string | null>(null);
  const [showAllSellers, setShowAllSellers] = useState(false);
    


  // ✅ Sellers (pagination + search)

const [sellerPage, setSellerPage] = useState(1);
const [sellerPageSize, setSellerPageSize] = useState(10);
const [sellerTotalPages, setSellerTotalPages] = useState(1);
const [sellerTotal, setSellerTotal] = useState(0);
const [sellerSearch, setSellerSearch] = useState("");
  const totalSellers = useMemo(() => sellerRows.length, [sellerRows]);

  const totalSellerProducts = useMemo(() => {
    return sellerRows.reduce((sum, s) => sum + (Number(s.totalProducts) || 0), 0);
  }, [sellerRows]);

  const totalMarketplaceProducts = useMemo(() => products.length, [products]);

   useEffect(() => {
  const fetchAllSellers = async () => {
    try {
      setSellersLoading(true);
      setSellersError(null);

      const headers = getAuthHeaders();

      // Note: /api/user has no "seller" filter — it returns ALL registered
      // users regardless of that query param, which used to inflate the
      // seller count to the total user count once merged in below. /api/seller
      // is already correctly filtered to users who've uploaded a prompt, so
      // it's the only source we need here (bumped its limit so pagination
      // doesn't silently cap the list at the default 10).
      const [resOrg, statsByUser] = await Promise.all([
        fetch(`${SELLERS_BASE}?limit=1000`, {
          headers,
          credentials: "include",
        }),
        fetchDashboardStatsMap(headers),
      ]);

      const orgData = await resOrg.json();

      if (!resOrg.ok || !orgData?.success) {
        throw new Error(orgData?.error || "Org sellers failed");
      }

      const orgMapped: SellerRow[] = (orgData.sellers || []).map((s: any) => {
        // In case your Seller document stores the real User id in userId.
        const statId = String(s?.userId?._id || s?.userId || s?._id || s?.id);
        const stat = getStatForUser(statsByUser, { ...s, _id: statId });

        return {
          id: String(s._id),
          name: s?.name || "Unknown",
          email: s?.email || "—",
          status: s?.status === "SUSPENDED" || s?.isBanned ? "Blocked" : "Active",
          avatar: s?.avatar || s?.avatarUrl,
          joined: s?.joined || s?.createdAt || null,
          kycStatus: s?.kycStatus,
          isDeleted: !!s?.isDeleted || !!s?.deleted,

          // ✅ Sell/upload count
          totalProducts: Number(
            stat.uploadedPrompts ||
            s?.totalProducts ||
            s?.totalUploadedPrompts ||
            0
          ),

          // ✅ Sold count
          soldProducts: Number(
            stat.soldProducts ||
            s?.soldProducts ||
            s?.totalSoldPrompts ||
            0
          ),

          // ✅ Volume = earning
          volume: Number(
            stat.totalEarnings ||
            s?.volume ||
            s?.totalEarnings ||
            0
          ),

          // ✅ Purchased (bought) count + plan
          buyProducts: Number(stat.buyProducts || s?.buyProducts || 0),
          plan: s?.plan ?? null,
          userType: s?.userType || "IND",
        };
      });

      const finalSellers = orgMapped;
      const totalRevenue = finalSellers.reduce((sum, seller) => sum + Number(seller.volume ?? 0), 0);

      setSellerRows(finalSellers);
      setStats({
        totalSellers: finalSellers.length,
        totalRevenue,
      });
    } catch (e: any) {
      setSellersError(e?.message || "Error loading sellers");
      setSellerRows([]);
      setStats({ totalSellers: 0, totalRevenue: 0 });
    } finally {
      setSellersLoading(false);
    }
  };

  fetchAllSellers();
}, []);

const fetchPlatformRevenue = async () => {
  setPlatformRevenueLoading(true);
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/admin/platform-revenue`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      credentials: "include",
    });
    const data = await res.json();
    if (data?.success) {
      setPlatformRevenue({
        availableBalance: Number(data.availableBalance || 0),
        totalRevenue: Number(data.totalRevenue || 0),
        totalWithdrawn: Number(data.totalWithdrawn || 0),
        gstCollected: Number(data.gstCollected || 0),
        transactions: Array.isArray(data.transactions) ? data.transactions : [],
      });
    }
  } catch (e) {
    console.error("fetchPlatformRevenue failed:", e);
  } finally {
    setPlatformRevenueLoading(false);
  }
};

useEffect(() => {
  fetchPlatformRevenue();
}, []);

const handleMarkWithdrawn = async () => {
  const amount = Number(withdrawAmount);
  if (!Number.isFinite(amount) || amount <= 0) return;
  setWithdrawSubmitting(true);
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/admin/platform-revenue/withdraw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ amount, note: withdrawNote.trim() }),
    });
    const data = await res.json();
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || "withdraw_failed");
    }
    setWithdrawModalOpen(false);
    setWithdrawAmount("");
    setWithdrawNote("");
    await fetchPlatformRevenue();
  } catch (e: any) {
    alert(e?.message === "insufficient_balance" ? "Amount exceeds available balance." : "Could not record withdrawal.");
  } finally {
    setWithdrawSubmitting(false);
  }
};

useEffect(() => {
  const loadPendingApprovals = async () => {
    try {
      const token = getToken();
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // Users: KYC (identity document) review still pending.
      // Sellers: uploaded at least one prompt but haven't finished Razorpay
      // payout verification yet (no ACTIVATED linked account) — a distinct
      // concept from user KYC, so it needs its own count, not a shared one.
      const [usersRes, sellersRes] = await Promise.all([
        fetch(`${USERS_BASE}?limit=1000&page=1`, {
          headers,
          credentials: "include",
        }),
        fetch(`${SELLERS_BASE}?limit=1000`, {
          headers,
          credentials: "include",
        }),
      ]);

      const [usersData, sellersData] = await Promise.all([
        usersRes.json(),
        sellersRes.json(),
      ]);

      const isPendingUser = (u: any) => {
        return String(u?.kycStatus || "") === "PENDING";
      };

      const isPendingSeller = (s: any) => {
        return s?.linkedAccountActivated === false;
      };

      const pendingUsers = (usersData?.users || []).filter(isPendingUser).length;
      const pendingSellers = (sellersData?.sellers || []).filter(isPendingSeller).length;

      setPendingUsersCount(pendingUsers);
      setPendingSellersCount(pendingSellers);
    } catch (err) {
      console.error("Pending approvals fetch failed:", err);
      setPendingUsersCount(0);
      setPendingSellersCount(0);
    }
  };

  if (active === "dashboard") {
    loadPendingApprovals();
  }
}, [active]);

  useEffect(() => {
    const fetchMarketplacePrompts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);

        const token = getToken();
        const res = await fetch(`${PROMPTS_BASE}/others`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || "Failed to load marketplace prompts");
        }

        const mapped: PromptProduct[] = (data.prompts || []).map((doc: any) => {
          const att = doc?.attachment || null;
          const mediaPath = att?.path || undefined;

          const imageUrl = att?.type === "image" ? mediaPath : undefined;
          const videoUrl = att?.type === "video" ? mediaPath : undefined;

          const status: PromptProduct["status"] =
            doc?.flagged ? "Flagged" : doc?.draft ? "Draft" : "Published";

          return {
            id: String(doc._id),
            title: doc?.title || "Untitled",
            uploaderName: doc?.userId?.name || "Unknown",
           uploaderId:
  doc?.userId?._id ||
  doc?.uploaderId?._id ||
  doc?.uploaderId ||
  doc?.sellerId?._id ||
  doc?.sellerId ||
  null,
            price:
              typeof doc?.tokun_price === "number"
                ? doc.tokun_price
                : typeof doc?.price === "number"
                ? doc.price
                : 0,
            status,
            imageUrl,
            videoUrl,
            category:
              doc?.categories?.[0]?.name ||
              (Array.isArray(doc?.categories)
                ? doc.categories
                    .map((c: any) =>
                      typeof c === "string" ? c : c?.name
                    )
                    .filter(Boolean)
                    .join(", ")
                : "General"),
            exclusive: !!doc?.exclusive,
            sold: !!doc?.sold,
          };
        });

        setProducts(mapped);
      } catch (e: any) {
        setProductsError(e?.message || "Error loading products");
      } finally {
        setProductsLoading(false);
      }
    };

    fetchMarketplacePrompts();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCatsLoading(true);
        setCatsError(null);

        const res = await fetch(`${API_BASE}/api/category`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok || !data?.success) {
          throw new Error(data?.error || "Failed to load categories");
        }
        setCategories(data.categories || []);
      } catch (e: any) {
        setCatsError(e?.message || "Failed to load categories");
        setCategories([]);
      } finally {
        setCatsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // =============================
  // ✅ NAV ITEM
  // =============================
  const NavItem = ({
    id,
    label,
    icon,
  }: {
    id: NavKey;
    label: string;
    icon: React.ReactNode;
  }) => {
    const isActive = active === id;
    return (
      <button
        onClick={() => setActive(id)}
        /* px-2 and nowrap: at eight items the row was 55px wider than the space
           between the brand and the account menu, which clipped "Feedback" and
           broke "Prompt Validation" onto two lines. Tighter padding buys more
           back than the nowrap costs. */
        className={[
          "inline-flex items-center gap-1.5 px-2 py-2 rounded-xl text-sm transition whitespace-nowrap",
          isActive ? "text-fuchsia-300" : "text-white/75 hover:text-white",
        ].join(" ")}
      >
        <span className={isActive ? "text-fuchsia-300" : "text-white/55"}>
          {icon}
        </span>
        {label}
      </button>
    );
  };

  const formatDate = (dateLike?: string | null) => {
    if (!dateLike) return "—";
    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const activeUsersCount = useMemo(() => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  return userRows.filter(u => {
    if (!u.lastLoginAt) return false;
    return new Date(u.lastLoginAt).getTime() >= start.getTime();
  }).length;
}, [userRows]);

/* The sidebar's contents, grouped.
   Eight flat items read as one undifferentiated list; grouped, an admin can
   find "Payments" by looking at the money heading rather than scanning all of
   them. Order within a group is by how often it's opened. */
/* ── RevenueCharts ──────────────────────────────────────────────────────────
   Two questions the totals above can't answer: when the money came in, and
   where from.

   Series colours are NOT the brand magenta/blue. Those two measure ΔE 1.8
   against each other under protanopia — a red-blind reader sees one colour
   where there are two. The four below were validated against the dark chart
   surface (#0F1117): all inside the OKLCH lightness band, chroma above floor,
   worst adjacent CVD separation ΔE 14.0, all above 3:1 contrast.

   Declared at module scope, like PaymentsView and for the same reason: a
   component defined inside another is a new type on every parent render and
   loses its state. */
const CHART_SERIES = {
  blue: "#4F86F7",
  amber: "#CE7C1C",
  teal: "#12A594",
  violet: "#AB5BEE",
};

const CHART_AXIS = "rgba(255,255,255,0.35)";
const CHART_GRID = "rgba(255,255,255,0.06)";

const RevenueCharts = ({
  transactions,
  loading,
}: {
  transactions: Array<{ type: string; amount: number; source: string; createdAt: string }>;
  loading: boolean;
}) => {
  /* Daily totals. Commission is money in, withdrawals and refunds are money
     out, so they can't be summed together — a day with a big withdrawal would
     otherwise read as a day with no earnings. */
  const daily = useMemo(() => {
    const byDay = new Map<string, { day: string; earned: number; out: number }>();

    for (const t of transactions || []) {
      const d = new Date(t.createdAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = d.toISOString().slice(0, 10);
      const row = byDay.get(key) || { day: key, earned: 0, out: 0 };
      const amount = Math.abs(Number(t.amount) || 0);
      if (t.type === "commission") row.earned += amount;
      else row.out += amount;
      byDay.set(key, row);
    }

    return Array.from(byDay.values())
      .sort((a, b) => a.day.localeCompare(b.day))
      .slice(-30)
      .map((r) => ({
        ...r,
        label: new Date(r.day).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      }));
  }, [transactions]);

  /* Where the earnings came from. Commission only — a withdrawal has a source
     too, and mixing it in would double-count the same rupee. */
  const bySource = useMemo(() => {
    const totals = new Map<string, number>();
    for (const t of transactions || []) {
      if (t.type !== "commission") continue;
      const key = (t.source || "other").replace(/_/g, " ");
      totals.set(key, (totals.get(key) || 0) + Math.abs(Number(t.amount) || 0));
    }
    return Array.from(totals, ([source, amount]) => ({ source, amount })).sort(
      (a, b) => b.amount - a.amount
    );
  }, [transactions]);

  const inr = (n: any) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  /* One tooltip for both charts. Recharts' default is a white box with the
     series colour used as the label text — text wearing a series colour is
     exactly what the palette rules forbid, so the swatch carries identity and
     the text stays in normal ink. */
  const Tip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-white/10 bg-[#15171E] px-3 py-2 shadow-xl">
        <p className="text-[11px] text-white/45 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="text-xs text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-white/60">{p.name}</span>
            <span className="ml-auto font-semibold">{inr(p.value)}</span>
          </p>
        ))}
      </div>
    );
  };

  const card =
    "rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5";

  /* Only on the FIRST load. Showing it whenever `loading` is true would blank
     a chart the admin is already reading every time the page refetches — the
     data is still there, so it stays on screen. */
  if (loading && !transactions?.length) {
    return (
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${card} lg:col-span-2 h-[300px] flex items-center justify-center text-white/35 text-sm`}>
          Loading revenue…
        </div>
        <div className={`${card} h-[300px] flex items-center justify-center text-white/35 text-sm`}>
          Loading sources…
        </div>
      </div>
    );
  }

  if (!daily.length) {
    return (
      <div className={`${card} mt-6 h-[180px] flex flex-col items-center justify-center gap-1`}>
        <p className="text-white/45 text-sm">No revenue recorded yet.</p>
        <p className="text-white/25 text-xs">Charts appear once the first commission lands.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Earnings over time. Two series, so a legend is present — identity is
          never carried by colour alone. */}
      <section className={`${card} lg:col-span-2`}>
        <div className="flex items-baseline justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Earnings over time</h3>
            <p className="text-[11px] text-white/35 mt-0.5">Last {daily.length} days with activity</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-white/55">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: CHART_SERIES.teal }} />
              Earned
            </span>
            <span className="flex items-center gap-1.5 text-white/55">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: CHART_SERIES.amber }} />
              Paid out
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={daily} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="gEarned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_SERIES.teal} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_SERIES.teal} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_SERIES.amber} stopOpacity={0.28} />
                <stop offset="100%" stopColor={CHART_SERIES.amber} stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* Horizontal only, and recessive — vertical lines add nothing when
                the x axis is already labelled. */}
            <CartesianGrid stroke={CHART_GRID} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: CHART_AXIS, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: CHART_AXIS, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={54}
              tickFormatter={(v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)}
            />
            <Tooltip content={<Tip />} cursor={{ stroke: "rgba(255,255,255,0.18)" }} />
            <Area
              type="monotone"
              dataKey="earned"
              name="Earned"
              stroke={CHART_SERIES.teal}
              strokeWidth={2}
              fill="url(#gEarned)"
            />
            <Area
              type="monotone"
              dataKey="out"
              name="Paid out"
              stroke={CHART_SERIES.amber}
              strokeWidth={2}
              fill="url(#gOut)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* Where it came from. One series, so no legend — the heading names it,
          and each bar is directly labelled by its own axis. */}
      <section className={card}>
        <h3 className="text-sm font-semibold text-white">Earnings by source</h3>
        <p className="text-[11px] text-white/35 mt-0.5 mb-4">Commission only</p>

        {bySource.length === 0 ? (
          <div className="h-[230px] flex items-center justify-center text-white/30 text-sm">
            No commission yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={bySource} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: CHART_AXIS, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)}
              />
              <YAxis
                type="category"
                dataKey="source"
                tick={{ fill: CHART_AXIS, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={96}
              />
              <Tooltip content={<Tip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              {/* Rounded on the data end only, anchored to the baseline. */}
              <Bar dataKey="amount" name="Earned" fill={CHART_SERIES.blue} radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
};

const ADMIN_NAV_SECTIONS: Array<{
  title: string;
  items: { id: NavKey; label: string; icon: React.ReactNode }[];
}> = [
  {
    title: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-[17px] w-[17px]" /> },
    ],
  },
  {
    title: "Marketplace",
    items: [
      { id: "sellers", label: "Sellers", icon: <Store className="h-[17px] w-[17px]" /> },
      { id: "products", label: "Products", icon: <Package className="h-[17px] w-[17px]" /> },
      { id: "analytics", label: "Prompt Validation", icon: <ShieldCheck className="h-[17px] w-[17px]" /> },
      { id: "freelancers", label: "Freelancers", icon: <Briefcase className="h-[17px] w-[17px]" /> },
    ],
  },
  {
    title: "Money",
    items: [
      { id: "payments", label: "Payments", icon: <Wallet className="h-[17px] w-[17px]" /> },
    ],
  },
  {
    title: "Trust & Safety",
    items: [
      { id: "reports", label: "Reports", icon: <ShieldAlert className="h-[17px] w-[17px]" /> },
      { id: "feedback", label: "Feedback", icon: <MessageSquare className="h-[17px] w-[17px]" /> },
    ],
  },
];

const MOBILE_NAV_MORE_ITEMS: { id: NavKey; label: string; icon: React.ReactNode }[] = [
  { id: "analytics", label: "Prompt Validation", icon: <ShieldCheck className="h-4 w-4" /> },
  { id: "freelancers", label: "Freelancers", icon: <Briefcase className="h-4 w-4" /> },
  { id: "payments", label: "Payments", icon: <Wallet className="h-4 w-4" /> },
  { id: "feedback", label: "Feedback", icon: <MessageSquare className="h-4 w-4" /> },
];

const MobileBottomNav = () => {
  const Item = ({
    id,
    label,
    icon,
  }: {
    id: NavKey;
    label: string;
    icon: React.ReactNode;
  }) => {
    const activeNow = active === id;
    return (
      <button
        onClick={() => {
          setActive(id);
          if (id === "reports") setMobileReportsPage("list");
        }}
        className={[
          "flex flex-col items-center justify-center gap-1 flex-1 py-2",
          activeNow ? "text-fuchsia-300" : "text-white/60",
        ].join(" ")}
      >
        <div className={activeNow ? "text-fuchsia-300" : "text-white/50"}>{icon}</div>
        <div className="text-[11px]">{label}</div>
      </button>
    );
  };

  const moreActiveNow = MOBILE_NAV_MORE_ITEMS.some((m) => m.id === active);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#07080B]/90 backdrop-blur">
      <div className="mx-auto max-w-[520px] px-3">
        <div className="flex items-center">
          <Item id="dashboard" label="Home" icon={<LayoutDashboard className="h-5 w-5" />} />
          <Item id="sellers" label="Sellers" icon={<Store className="h-5 w-5" />} />
          <Item id="products" label="Products" icon={<Package className="h-5 w-5" />} />
          <Item id="reports" label="Reports" icon={<ShieldAlert className="h-5 w-5" />} />
          <Item id="account" label="Account" icon={<UserRound className="h-5 w-5" />} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={[
                  "flex flex-col items-center justify-center gap-1 flex-1 py-2",
                  moreActiveNow ? "text-fuchsia-300" : "text-white/60",
                ].join(" ")}
              >
                <div className={moreActiveNow ? "text-fuchsia-300" : "text-white/50"}>
                  <MoreHorizontal className="h-5 w-5" />
                </div>
                <div className="text-[11px]">More</div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="end"
              className="w-52 rounded-xl border border-white/10 bg-[#0B0D12] text-white shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
            >
              {MOBILE_NAV_MORE_ITEMS.map((m) => (
                <DropdownMenuItem
                  key={m.id}
                  onClick={() => setActive(m.id)}
                  className={[
                    "cursor-pointer focus:bg-white/[0.06] gap-2",
                    active === m.id ? "text-fuchsia-300" : "",
                  ].join(" ")}
                >
                  {m.icon}
                  {m.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};


  const ReportsMobileList = () => {
  const grouped = useMemo(() => {
    const list = [...reports].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return {
      High: list.filter((r) => r.priority === "High"),
      Medium: list.filter((r) => r.priority === "Medium"),
      Low: list.filter((r) => r.priority === "Low"),
    };
  }, [reports]);

  const open = (r: ReportItem) => {
    setSelectedReport(r);
    setMobileReportsPage("details");
  };

  const Item = (r: ReportItem) => (
    <button
      key={r.id}
      onClick={() => open(r)}
      className="w-full text-left px-4 py-4 border-t border-white/10 hover:bg-white/[0.03]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-white/80">
            {r.priority === "High" ? "HIGH RISK" : r.priority === "Medium" ? "PENDING" : "LOW RISK"}
          </div>
          <div className="mt-2 text-sm font-medium text-white/90 truncate">
            {r.productTitle || r.title}
          </div>
          <div className="mt-1 text-xs text-white/55 truncate">
            {r.reason}
            {r.reporterName ? `: Reported by @${r.reporterName}` : ""}
          </div>
        </div>
        <div className="shrink-0 text-xs text-white/45">{timeAgo(r.createdAt)}</div>
      </div>
    </button>
  );

  return (
    <section className={`${kpiCardBase} overflow-hidden`}>
      <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="text-sm font-semibold">Product Reports</div>
        <div className="text-xs text-white/60">
          {(reports || []).filter((r) => r.status === "Open").length} Pending
        </div>
      </div>

      <div className="max-h-[calc(100vh-170px)] overflow-y-auto">
        {grouped.High.map(Item)}
        {grouped.Medium.map(Item)}
        {grouped.Low.map(Item)}
      </div>
    </section>
  );
};


  // =============================
  // ✅ REPORTS FLOW (LEFT + RIGHT)
  // =============================
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  // ✅ TEMP: mock reports (Replace with API later)
useEffect(() => {
  const loadReports = async () => {
  try {
    setReportsLoading(true);
    setReportsError(null);

    // Ensure the token is available, and add it to the request headers
    const token = getToken();  // Assuming `getToken()` retrieves the stored JWT token

    const res = await fetch(REPORTS_BASE, {
      headers: {
        Authorization: `Bearer ${token}`,  // Attach token as Bearer token
      },
      credentials: "include",  // Include cookies if necessary
    });

    const data = await res.json();
    if (!res.ok || !data?.success)
      throw new Error(data?.error || "Failed to load reports");

      const mapped: ReportItem[] = (data.reports || []).map((r: any) => {
        const prompt = r.prompt || {};
        const attachment = prompt.attachment || {};
        const attPath = attachment?.path || "";

        const previewImageUrl =
          attachment?.type === "image" ? attPath : undefined;
        const previewVideoUrl =
          attachment?.type === "video" ? attPath : undefined;

        const evidenceFiles =
          (r.screenshots || []).map((u: string) => ({
            type: "image" as const,
            url: u.startsWith("http") ? u : `${API_BASE}${u}`,
            label: "Screenshot",
          })) || [];

        return {
          id: String(r._id),
          title: r.resourceTitle || prompt.title || "Report",
          listingId: String(r.prompt?._id || r.prompt || ""),
          productId: String(r.prompt?._id || r.prompt || ""),
          category: r.category?.name || "General",
          status:
            r.status === "Pending"
              ? "Open"
              : r.status === "Reviewed"
              ? "Reviewed"
              : r.status === "Resolved"
              ? "Actioned"
              : "Dismissed",
          priority: "Medium",
          createdAt: r.createdAt,

          reporterName: r.reporter?.name,
          reporterEmail: r.reporter?.email,
          reason: r.reason,
          details: r.description || r.stepsToReproduce || "",

          productTitle: prompt.title,
          sellerName: prompt.userId?.name,

          previewImageUrl: previewImageUrl
            ? previewImageUrl.startsWith("http")
              ? previewImageUrl
              : `${API_BASE}${previewImageUrl}`
            : undefined,

          previewVideoUrl: previewVideoUrl
            ? previewVideoUrl.startsWith("http")
              ? previewVideoUrl
              : `${API_BASE}${previewVideoUrl}`
            : undefined,

          evidence: [
            ...evidenceFiles,
            ...(r.resourceURL
              ? [{ type: "text" as const, text: `Resource URL: ${r.resourceURL}` }]
              : []),
          ],
          history: [{ at: r.createdAt, by: "System", action: "Report created" }],
        };
      });
 setReports(mapped);
    setSelectedReport((prev) => prev ?? (mapped[0] || null));
  } catch (e: any) {
    setReportsError(e?.message || "Failed to load reports");
    setReports([]);
  } finally {
    setReportsLoading(false);
  }
};
    


  loadReports();
}, []);

  const Badge = ({
    children,
    tone,
  }: {
    children: React.ReactNode;
    tone:
      | "neutral"
      | "blue"
      | "emerald"
      | "red"
      | "amber"
      | "fuchsia"
      | "slate";
  }) => {
    const map: Record<string, string> = {
      neutral: "bg-white/10 text-white/80 border-white/15",
      blue: "bg-blue-500/15 text-blue-200 border-blue-500/25",
      emerald: "bg-emerald-500/15 text-emerald-200 border-emerald-500/25",
      red: "bg-red-500/15 text-red-200 border-red-500/25",
      amber: "bg-amber-500/15 text-amber-200 border-amber-500/25",
      fuchsia: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/25",
      slate: "bg-slate-500/15 text-slate-200 border-slate-400/25",
    };
    return (
      <span
        className={[
          "px-3 py-1 rounded-full text-xs font-medium border inline-flex",
          map[tone],
        ].join(" ")}
      >
        {children}
      </span>
    );
  };

  const priorityTone = (p: ReportItem["priority"]) => {
    if (p === "High") return "red";
    if (p === "Medium") return "amber";
    return "slate";
  };

  const statusTone = (s: ReportItem["status"]) => {
    if (s === "Open") return "fuchsia";
    if (s === "Reviewed") return "blue";
    if (s === "Dismissed") return "slate";
    return "emerald";
  };

  // ✅ Right panel component
 const ReportDetailsPanel = ({
  report,
  onClose,
  onDismiss,
  onFlag,
  onSuspend,
}: {
  report: ReportItem;
  onClose: () => void;
  onDismiss: (id: string) => void;
  onFlag: (listingId: string) => void;
  onSuspend: (listingId: string) => void;
}) => {
  return (
  <div className="w-full min-w-0 space-y-6">

      {/* Header row */}
     <div className={`${kpiCardBase} p-4 md:p-6`}>
  <div className="flex flex-col gap-4">
    {/* Title */}
    <div className="text-center md:text-left">
      <h1 className="text-[18px] md:text-2xl font-semibold">
        Report Details: {report.productTitle || report.title}
      </h1>
      <div className="mt-2 text-xs md:text-sm text-white/55">
        Listing ID: {report.listingId} | Category: {report.category}
      </div>
    </div>

    {/* Action Buttons */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
      <button
        onClick={() => onDismiss(report.id)}
        className="h-10 px-4 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm w-full"
      >
        Dismiss Report
      </button>
      <button
        onClick={() => onFlag(report.id)}
        className="h-10 px-4 rounded-xl bg-[#1677FF] hover:opacity-90 text-sm font-medium w-full"
      >
        Flag Product
      </button>
      <button
        onClick={() => onSuspend(report.id)}
        className="h-10 px-4 rounded-xl bg-red-500 hover:opacity-90 text-sm font-medium w-full"
      >
        Suspend Listing
      </button>
    </div>
  </div>
</div>

      {/* Main 2 columns like image */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT listing card (bigger) */}
        <div className="lg:col-span-3 space-y-5">
          <div className={`${kpiCardBase} overflow-hidden`}>
            {/* Preview */}
            <div className="h-[360px] bg-black/40 relative">
              {report.previewImageUrl ? (
                <img
                  src={report.previewImageUrl}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="preview"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/60">
                  No Preview
                </div>
              )}
            </div>

            {/* Listing info */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-xl font-semibold">
                  {report.productTitle || report.title}
                </div>
                <div className="text-sm text-white/60">2.45 ETH</div>
              </div>

              <div className="mt-3 text-sm text-white/65 leading-relaxed">
                {report.details || "—"}
              </div>

              <div className="mt-5 flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/60?img=15"
                  className="h-11 w-11 rounded-full border border-white/10 object-cover"
                  alt="seller"
                />
                <div>
                  <div className="text-sm text-white/85">
                    Seller: @{(report.sellerName || "Seller").replace(/\s+/g, "")}
                  </div>
                  <div className="text-xs text-white/50">
                    Member since Jan 2022 · 4.9 Rating
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence thumbnails row like image */}
          <div>
            <div className="text-lg font-semibold mb-3">Review Evidence & Files</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(report.evidence || [])
                .filter((e) => e.type !== "text")
                .slice(0, 4)
                .map((e, idx) => (
                  <div
                    key={idx}
                    className="h-[120px] rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02]"
                  >
                    {e.url ? (
                      <img
                        src={e.url}
                        className="w-full h-full object-cover"
                        alt="evidence"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
                        File
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* RIGHT complaint + history like image */}
        <div className="lg:col-span-2 space-y-5">
          {/* Complaint Information */}
          <div className={`${kpiCardBase} p-6`}>
            <h2 className="text-xl font-semibold">Complaint Information</h2>

            <div className="mt-5">
              <div className="text-xs text-white/50 uppercase tracking-wide">
                Reason for Report
              </div>
              <div className="mt-2 text-sm text-white/80">
                {report.reason}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs text-white/60">Reporter Comments</div>
              <div className="mt-2 text-sm text-white/75 leading-relaxed">
                {report.details ||
                  "Requesting immediate action based on the reported issue."}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/70?img=33"
                className="h-11 w-11 rounded-full border border-white/10 object-cover"
                alt="reporter"
              />
              <div>
                <div className="text-sm text-white/85">
                  Reported By: {report.reporterName || "Anonymous"}
                </div>
                <div className="text-xs text-white/50">
                  Account Standing: Verified Contributor
                </div>
              </div>
            </div>
          </div>

          {/* Seller report history (table look) */}
          <div className={`${kpiCardBase} p-6`}>
            <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Seller Report History
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <div className="grid grid-cols-3 px-4 py-3 text-xs text-white/55 bg-white/[0.03]">
                <div>Date</div>
                <div>Reasons</div>
                <div className="text-right">Action</div>
              </div>

              <div className="divide-y divide-white/10">
                {(report.history || []).slice(0, 2).map((h, idx) => (
                  <div key={idx} className="grid grid-cols-3 px-4 py-4 text-sm bg-white/[0.02]">
                    <div className="text-white/70">{formatDate(h.at)}</div>
                    <div className="text-white/70">{h.note || h.action}</div>
                    <div className="text-right text-white/80">{h.action}</div>
                  </div>
                ))}

                {(report.history || []).length === 0 && (
                  <div className="px-4 py-4 text-sm text-white/60">
                    No previous actions.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



  // ✅ Reports View (LEFT list + RIGHT panel)
  const ReportsView = () => {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<"all" | ReportItem["status"]>("all");
    const [priority, setPriority] = useState<"all" | ReportItem["priority"]>(
      "all"
    );

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      let list = [...reports];

      if (status !== "all") list = list.filter((r) => r.status === status);
      if (priority !== "all") list = list.filter((r) => r.priority === priority);

      if (q) {
        list = list.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.listingId.toLowerCase().includes(q) ||
            (r.productTitle || "").toLowerCase().includes(q) ||
            (r.sellerName || "").toLowerCase().includes(q) ||
            (r.reason || "").toLowerCase().includes(q)
        );
      }

      // Open first, then by newest
      list.sort((a, b) => {
        if (a.status === "Open" && b.status !== "Open") return -1;
        if (a.status !== "Open" && b.status === "Open") return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return list;
    }, [reports, query, status, priority]);

    const applyReportAction = (
      reportId: string,
      newStatus: ReportItem["status"],
      actionLabel: string
    ) => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? {
                ...r,
                status: newStatus,
                history: [
                  ...(r.history || []),
                  { at: new Date().toISOString(), by: adminName, action: actionLabel },
                ],
              }
            : r
        )
      );
      setSelectedReport((prev) =>
        prev?.id === reportId
          ? {
              ...prev,
              status: newStatus,
              history: [
                ...(prev.history || []),
                { at: new Date().toISOString(), by: adminName, action: actionLabel },
              ],
            }
          : prev
      );
    };

    const callReportAction = async (reportId: string, action: "dismiss" | "flag" | "suspend") => {
      const token = getToken();
      try {
        const res = await fetch(`${REPORTS_BASE}/${reportId}/${action}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
          throw new Error(data?.message || data?.error || `Failed to ${action} report`);
        }
        return true;
      } catch (err: any) {
        console.error(`${action} report failed:`, err.message);
        return false;
      }
    };

    const dismissReport = async (id: string) => {
      const ok = await callReportAction(id, "dismiss");
      if (ok) applyReportAction(id, "Dismissed", "Dismissed report");
    };

    const flagProduct = async (reportId: string) => {
      const ok = await callReportAction(reportId, "flag");
      if (ok) applyReportAction(reportId, "Reviewed", "Flagged product — hidden from marketplace, seller notified");
    };

    const suspendListing = async (reportId: string) => {
      const ok = await callReportAction(reportId, "suspend");
      if (ok) applyReportAction(reportId, "Actioned", "Suspended listing — removed from marketplace, seller notified");
    };

    return (
      <>
        {/* Page title */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
  <div className="text-center md:text-left">
    <div className="flex items-center justify-center md:justify-start gap-3">
      <h1 className="text-[24px] md:text-[34px] leading-[1.1] font-semibold">
        Reports & Complaints
      </h1>
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-500/25">
        {(reports || []).filter((r) => r.status === "Open").length} Open
      </span>
    </div>
    <p className="mt-2 text-white/60 text-sm">
      Review and take action on reported listings and policy violations
    </p>
  </div>
</div>

        {/* Filters */}
        <section className={`${kpiCardBase} mt-6 p-4`}>
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
                placeholder="Search by report title, listing ID, seller, reason..."
              />
            </div>

            <div className="flex gap-3 flex-wrap justify-start lg:justify-end">
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger className="h-11 w-[160px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Reviewed">Reviewed</SelectItem>
                  <SelectItem value="Dismissed">Dismissed</SelectItem>
                  <SelectItem value="Actioned">Actioned</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={priority}
                onValueChange={(v: any) => setPriority(v)}
              >
                <SelectTrigger className="h-11 w-[160px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>

              <button
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                  setPriority("all");
                }}
                className="h-11 px-4 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80 flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* Left + Right layout */}
    {/* ✅ MOBILE: list OR details (full width) */}
<div className="block md:hidden mt-6">
  {mobileReportsPage === "list" ? (
    <ReportsMobileList />
  ) : selectedReport ? (
    <div className="w-full min-w-0">
      {/* ✅ Back */}
      <button
        onClick={() => setMobileReportsPage("list")}
        className="mb-4 text-sm text-white/70 hover:text-white"
      >
        ← Back to reports
      </button>

      <ReportDetailsPanel
        report={selectedReport}
        onClose={() => {
          setSelectedReport(null);
          setMobileReportsPage("list");
        }}
        onDismiss={(id) => {
          dismissReport(id);
          setMobileReportsPage("list");
        }}
        onFlag={(listingId) => flagProduct(listingId)}
        onSuspend={(listingId) => suspendListing(listingId)}
      />
    </div>
  ) : (
    <ReportsMobileList />
  )}
</div>

{/* ✅ DESKTOP: keep your existing UI */}
<div className="hidden md:block mt-6">
  {/* KEEP your current desktop section here */}
  <section className="w-full">
    <div className="w-full min-w-0">
      {!selectedReport ? (
        <div className={`${kpiCardBase} p-10 flex items-center justify-center text-white/60`}>
          Select a report from the left to view details.
        </div>
      ) : (
        <div className="w-full min-w-0">
          <ReportDetailsPanel
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
            onDismiss={dismissReport}
            onFlag={flagProduct}
            onSuspend={suspendListing}
          />
        </div>
      )}
    </div>
  </section>
</div>


      </>
    );
  };
const SellersMobileCards = ({
  rows,
}: {
  rows: SellerRow[];
}) => {
  return (
    <div className="space-y-5">
      {rows.map((r) => (
        <div key={r.id} className={`${kpiCardBase} p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={r.avatar || "https://i.pravatar.cc/80?img=12"}
                className="h-12 w-12 rounded-full object-cover border border-white/10"
                alt={r.name}
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white/90 truncate">{r.name}</div>
                <div className="text-xs text-white/50 truncate">{r.email}</div>
              </div>
            </div>

            <span
              className={[
                "px-4 py-1.5 rounded-full text-xs font-medium border shrink-0",
                r.status === "Active"
                  ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
                  : "bg-red-500/15 text-red-200 border-red-500/25",
              ].join(" ")}
            >
              {r.status}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] text-white/45 uppercase tracking-wide">Total Products</div>
              <div className="mt-1 text-lg text-white/90">{Number(r.totalProducts || 0)}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-white/45 uppercase tracking-wide">Joined Date</div>
              <div className="mt-1 text-sm text-white/80">{formatDate(r.joined)}</div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              className={[
                "flex-1 h-11 rounded-xl border text-sm font-medium",
                r.status === "Active"
                  ? "border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/15"
                  : "border-sky-500/25 bg-sky-500/10 text-sky-200 hover:bg-sky-500/15",
              ].join(" ")}
              onClick={() => console.log("toggle block", r.id)}
            >
              {r.status === "Active" ? "🚫 Block" : "🔓 Unblocked"}
            </button>

            <button
              className="h-11 w-12 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center"
              onClick={() => console.log("delete", r.id)}
              aria-label="Delete"
            >
              🗑
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};


const SellersView = () => {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "active" | "blocked" | "deleted">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [sellerError, setSellerError] = useState<string | null>(null);
  const [sellerProducts, setSellerProducts] = useState<PromptProduct[]>([]);

  // ✅ Popup state
  const [confirmPopup, setConfirmPopup] = useState<{
    type: "block" | "unblock" | "delete" | "restore";
    seller: SellerRow;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // ✅ Block / Unblock API call
  const handleBlockToggle = async (seller: SellerRow) => {
    const action = seller.status === "Active" ? "block" : "unblock";
    try {
      setActionLoading(true);
      setActionError(null);
      const token = getToken();
      const res = await fetch(`${SELLERS_BASE}/${seller.id}/block`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || "Failed");

      // ✅ Update local state
      setSellerRows((prev) =>
        prev.map((s) =>
          s.id === seller.id
            ? { ...s, status: action === "block" ? "Blocked" : "Active" }
            : s
        )
      );
      setSelectedSeller((prev) =>
        prev && prev.id === seller.id
          ? { ...prev, status: action === "block" ? "SUSPENDED" : "ACTIVE" }
          : prev
      );
      setConfirmPopup(null);
    } catch (e: any) {
      setActionError(e?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Suspend / Reactivate toggle from the Seller Profile page (separate from the
  // list's confirm-popup flow since this component early-returns past that modal).
  const [profileSuspendLoading, setProfileSuspendLoading] = useState(false);
  const [profileSuspendError, setProfileSuspendError] = useState<string | null>(null);

  const handleProfileSuspendToggle = async () => {
    if (!selectedSeller) return;
    const action = selectedSeller.status === "SUSPENDED" ? "unblock" : "block";
    const confirmMsg =
      action === "block"
        ? `Suspend "${selectedSeller.name}"? They won't be able to sell on the platform.`
        : `Reactivate "${selectedSeller.name}"? They will regain access to sell.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setProfileSuspendLoading(true);
      setProfileSuspendError(null);
      const token = getToken();
      const res = await fetch(`${SELLERS_BASE}/${selectedSeller.id}/block`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || "Failed");

      const newProfileStatus = action === "block" ? "SUSPENDED" : "ACTIVE";
      setSelectedSeller((prev) => (prev ? { ...prev, status: newProfileStatus } : prev));
      setSellerRows((prev) =>
        prev.map((s) =>
          s.id === selectedSeller.id
            ? { ...s, status: newProfileStatus === "SUSPENDED" ? "Blocked" : "Active" }
            : s
        )
      );
    } catch (e: any) {
      setProfileSuspendError(e?.message || "Action failed");
    } finally {
      setProfileSuspendLoading(false);
    }
  };

  // ✅ Soft Delete / Restore API call
  const handleDeleteToggle = async (seller: SellerRow) => {
    const action = seller.isDeleted ? "restore" : "delete";
    try {
      setActionLoading(true);
      setActionError(null);
      const token = getToken();
      const res = await fetch(`${SELLERS_BASE}/${seller.id}/soft-delete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || "Failed");

      // ✅ Update local state
      setSellerRows((prev) =>
        prev.map((s) =>
          s.id === seller.id
            ? {
                ...s,
                isDeleted: action === "delete",
                status: action === "delete" ? "Blocked" : "Active",
              }
            : s
        )
      );
      setConfirmPopup(null);
    } catch (e: any) {
      setActionError(e?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const openSellerProfile = async (sellerId?: string | null) => {
    if (!sellerId) return;
    try {
      setSellerLoading(true);
      setSellerError(null);
      const token = getToken();
      const resSeller = await fetch(`${SELLERS_BASE}/${sellerId}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
      });
      const sellerData = await resSeller.json();
      if (!resSeller.ok || !sellerData?.success)
        throw new Error(sellerData?.error || "Failed to load seller profile");

      const resPrompts = await fetch(`${PROMPTS_BASE}/by-seller/${sellerId}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
      });
      const promptData = await resPrompts.json();
      if (!resPrompts.ok || !promptData?.success)
        throw new Error(promptData?.error || "Failed to load seller products");

     const s = sellerData.seller;

const derivedTotalEarnings = (promptData.prompts || []).reduce((sum: number, doc: any) => {
  const price = Number(doc?.price ?? doc?.tokun_price ?? 0);

  const sales = Number(
    doc?.sales ??
    doc?.purchases ??
    doc?.totalSales ??
    doc?.totalPurchases ??
    doc?.salesCount ??
    doc?.purchaseCount ??
    doc?.orderCount ??
    0
  );

  const revenue = Number(
    doc?.revenue ??
    doc?.totalRevenue ??
    doc?.totalEarning ??
    doc?.earnings ??
    doc?.cost ??
    doc?.totalCost ??
    (sales * price) ??
    0
  );

  return sum + (Number.isFinite(revenue) ? revenue : 0);
}, 0);

setSelectedSeller({
  id: String(s?._id || sellerId),
  name: s?.name || "Unknown",
  email: s?.email,
  location: s?.location,
  joined: s?.joined,
  status: s?.status || "ACTIVE",
  avatar: s?.avatar,
  verified: !!s?.verified,
  totalEarnings:
    typeof s?.totalEarnings === "number" && s.totalEarnings > 0
      ? s.totalEarnings
      : derivedTotalEarnings,
  rating: s?.rating ?? 0,
  reviewsCount: s?.reviewsCount ?? 0,
  refundRate: s?.refundRate ?? 0,
  refundThreshold: s?.refundThreshold ?? 5,
  buyProducts: Number(s?.buyProducts || 0),
  totalUploadedPrompts: Number(s?.totalUploadedPrompts ?? s?.totalProducts ?? 0),
  plan: s?.plan ?? null,
  userType: s?.userType || "IND",
});

      const mapped: PromptProduct[] = (promptData.prompts || []).map((doc: any) => {
        const att = doc?.attachment || null;
        const status: PromptProduct["status"] =
          doc?.flagged ? "Flagged" : doc?.draft ? "Draft" : "Published";
        return {
          id: String(doc._id),
          title: doc?.title || "Untitled",
          uploaderName: doc?.userId?.name || "Unknown",
          uploaderId:
  doc?.userId?._id ||
  doc?.uploaderId?._id ||
  doc?.uploaderId ||
  doc?.sellerId?._id ||
  doc?.sellerId ||
  null,
          price: typeof doc?.price === "number" ? doc.price : 0,
          status,
          imageUrl: att?.type === "image" ? att?.path : undefined,
          videoUrl: att?.type === "video" ? att?.path : undefined,
          category: doc?.categories?.[0]?.name || "General",
          exclusive: !!doc?.exclusive,
          sold: !!doc?.sold,
          salesCount: Number(doc?.salesCount || 0),
          totalRevenue: Number(doc?.totalRevenue || 0),
        };
      });
      setSellerProducts(mapped);
    } catch (e: any) {
      setSellerError(e?.message || "Error loading seller profile");
    } finally {
      setSellerLoading(false);
    }
  };

  const closeSellerProfile = () => {
    setSelectedSeller(null);
    setSellerProducts([]);
    setSellerError(null);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...sellerRows];

    if (tab === "active") list = list.filter((s) => s.status === "Active" && !s.isDeleted);
    else if (tab === "blocked") list = list.filter((s) => s.status === "Blocked" && !s.isDeleted);
    else if (tab === "deleted") list = list.filter((s) => !!s.isDeleted);
    else list = list.filter((s) => !s.isDeleted); // "all" = non-deleted

    if (q) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [sellerRows, query, tab]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageRows = filtered.slice(startIndex, endIndex);

  useEffect(() => { setPage(1); }, [query, tab, pageSize]);

  if (selectedSeller) {
    return (
      <SellerProfileView
        seller={selectedSeller}
        products={sellerProducts}
        loading={sellerLoading}
        error={sellerError}
        onBack={closeSellerProfile}
        onToggleSuspend={handleProfileSuspendToggle}
        suspendLoading={profileSuspendLoading}
        suspendError={profileSuspendError}
      />
    );
  }

  // ✅ Popup labels helper
  const popupConfig = confirmPopup
    ? {
        block: {
          title: "Block Seller?",
          desc: `Are you sure you want to block "${confirmPopup.seller.name}"? They won't be able to sell on the platform.`,
          confirmLabel: "Yes, Block",
          confirmClass: "bg-red-500 hover:opacity-90",
        },
        unblock: {
          title: "Unblock Seller?",
          desc: `Are you sure you want to unblock "${confirmPopup.seller.name}"? They will regain access to sell.`,
          confirmLabel: "Yes, Unblock",
          confirmClass: "bg-emerald-500 hover:opacity-90",
        },
        delete: {
          title: "Delete Seller?",
          desc: `Are you sure you want to delete "${confirmPopup.seller.name}"? This is a soft delete — you can restore them later.`,
          confirmLabel: "Yes, Delete",
          confirmClass: "bg-red-500 hover:opacity-90",
        },
        restore: {
          title: "Restore Seller?",
          desc: `Are you sure you want to restore "${confirmPopup.seller.name}"? They will be moved back to Active sellers.`,
          confirmLabel: "Yes, Restore",
          confirmClass: "bg-emerald-500 hover:opacity-90",
        },
      }[confirmPopup.type]
    : null;

  return (
    <>
      {/* ✅ CONFIRM POPUP */}
      {confirmPopup && popupConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0F1117] p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white">{popupConfig.title}</h2>
            <p className="mt-3 text-sm text-white/65 leading-relaxed">{popupConfig.desc}</p>

            {actionError && (
              <div className="mt-3 text-xs text-red-400">{actionError}</div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setConfirmPopup(null); setActionError(null); }}
                className="flex-1 h-11 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-sm text-white/80"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmPopup.type === "block" || confirmPopup.type === "unblock") {
                    handleBlockToggle(confirmPopup.seller);
                  } else {
                    handleDeleteToggle(confirmPopup.seller);
                  }
                }}
                className={`flex-1 h-11 rounded-xl text-sm font-medium text-white ${popupConfig.confirmClass} disabled:opacity-60`}
                disabled={actionLoading}
              >
                {actionLoading ? "Please wait…" : popupConfig.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mt-2 md:mt-0">
        <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-4 md:gap-6">
          <div className="text-center md:text-left w-full">
            <h1 className="text-[24px] md:text-[34px] leading-[1.05] font-semibold">
              Seller Management
            </h1>
            <p className="mt-1 text-white/60 text-sm text-center md:text-left">
              Manage and monitor digital product sellers on the platform
            </p>
            <div className="flex gap-3 mt-4 justify-center md:justify-start">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-200 border border-blue-500/25">
                {filtered.length.toLocaleString()} Sellers
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-200 border border-emerald-500/25">
                {products.length.toLocaleString()} Products
              </span>
            </div>
          </div>
          <div className="hidden md:block" />
        </div>
      </div>

      {/* Search + Tabs */}
      <section className={`${kpiCardBase} mt-6 p-4`}>
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
              placeholder="Search sellers by name or email..."
            />
          </div>

          {/* ✅ Tabs — All / Active / Blocked / Deleted */}
          <div className="overflow-x-auto">
            <div className="h-11 p-1 rounded-xl border border-white/10 bg-white/[0.03] flex items-center gap-1 w-max">
              {(["all", "active", "blocked", "deleted"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={[
                    "h-9 px-4 rounded-lg text-sm capitalize whitespace-nowrap",
                    tab === t
                      ? t === "deleted"
                        ? "bg-red-500/20 text-red-200 border border-red-500/25"
                        : "bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] text-white"
                      : "text-white/70 hover:text-white",
                  ].join(" ")}
                >
                  {t === "all" ? "All Sellers" : t === "deleted" ? "🗑 Deleted" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ✅ MOBILE: Cards */}
      <div className="md:hidden mt-6">
        {sellersLoading && <div className="text-white/70 text-sm">Loading sellers…</div>}
        {!!sellersError && !sellersLoading && <div className="text-red-400 text-sm">{sellersError}</div>}
        {!sellersLoading && !sellersError && (
          <div className="space-y-5">
            {pageRows.map((r) => (
              <div key={r.id} className={`${kpiCardBase} p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={r.avatar || "https://i.pravatar.cc/80?img=12"}
                      className="h-12 w-12 rounded-full object-cover border border-white/10"
                      alt={r.name}
                    />
                    <div className="min-w-0">
  <button
    type="button"
    onClick={() => openSellerProfile(r.id)}
    className="text-sm font-semibold text-white/90 truncate hover:text-sky-400 text-left block w-full"
  >
    {r.name}
  </button>
  <div className="text-xs text-white/50 truncate">{r.email}</div>
</div>
                  </div>
                  <span className={[
                    "px-3 py-1 rounded-full text-xs font-medium border shrink-0",
                    r.isDeleted
                      ? "bg-red-500/15 text-red-300 border-red-500/25"
                      : r.status === "Active"
                      ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
                      : "bg-red-500/15 text-red-200 border-red-500/25",
                  ].join(" ")}>
                    {r.isDeleted ? "Deleted" : r.status}
                  </span>
                </div>

                <div className="mt-3 flex justify-center">
                  <span className={[
                    "px-3 py-1 rounded-full text-xs font-medium border",
                    planBadgeClass(planLabel(r.userType, r.plan)),
                  ].join(" ")}>
                    {planLabel(r.userType, r.plan)} plan
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-[11px] text-white/45 uppercase tracking-wide">Purchased</div>
                    <div className="mt-1 text-base text-white/90">{Number(r.buyProducts || 0)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-white/45 uppercase tracking-wide">Uploaded</div>
                    <div className="mt-1 text-base text-white/90">{Number(r.totalProducts || 0)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-white/45 uppercase tracking-wide">Joined</div>
                    <div className="mt-1 text-sm text-white/80">{formatDate(r.joined)}</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {/* Block / Unblock */}
                  {!r.isDeleted && (
                    <button
                      onClick={() => setConfirmPopup({
                        type: r.status === "Active" ? "block" : "unblock",
                        seller: r,
                      })}
                      className={[
                        "flex-1 h-10 rounded-xl border text-xs font-medium",
                        r.status === "Active"
                          ? "border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/15"
                          : "border-sky-500/25 bg-sky-500/10 text-sky-200 hover:bg-sky-500/15",
                      ].join(" ")}
                    >
                      {r.status === "Active" ? "🚫 Block" : "✅ Unblock"}
                    </button>
                  )}

                  {/* Delete / Restore */}
                  <button
                    onClick={() => setConfirmPopup({
                      type: r.isDeleted ? "restore" : "delete",
                      seller: r,
                    })}
                    className={[
                      "flex-1 h-10 rounded-xl border text-xs font-medium",
                      r.isDeleted
                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
                        : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]",
                    ].join(" ")}
                  >
                    {r.isDeleted ? "↩ Restore" : "🗑 Delete"}
                  </button>
                </div>
              </div>
            ))}
            {pageRows.length === 0 && (
              <div className="text-white/60 text-sm text-center py-8">No sellers found.</div>
            )}
          </div>
        )}

        {/* Mobile Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <button
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40 text-sm"
          >
            Previous
          </button>
          <div className="text-xs text-white/60">Page {safePage} / {totalPages}</div>
          <button
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40 text-sm"
          >
            Next
          </button>
        </div>
      </div>

      {/* ✅ DESKTOP: Table */}
      <div className="hidden md:block">
        <section className={`${kpiCardBase} mt-6 p-6`}>
          {sellersLoading && <div className="p-6 text-white/70 text-sm">Loading sellers…</div>}
          {!!sellersError && !sellersLoading && <div className="p-6 text-red-400 text-sm">{sellersError}</div>}

          {!sellersLoading && !sellersError && (
            <>
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
                  <div className="col-span-3">Seller Name</div>
                  <div className="col-span-2">Plan</div>
                  <div className="col-span-1">Purchased</div>
                  <div className="col-span-1">Uploaded</div>
                  <div className="col-span-2">Volume</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                <div className="divide-y divide-white/10">
                  {pageRows.map((r) => (
                    <div
                      key={r.id}
                      className={[
                        "grid grid-cols-12 gap-3 px-5 py-5 items-center",
                        r.isDeleted ? "bg-red-500/[0.04]" : "bg-white/[0.02]",
                      ].join(" ")}
                    >
                      <div className="col-span-3 flex items-center gap-4 min-w-0">
                        <img
                          src={r.avatar || "https://i.pravatar.cc/80?img=12"}
                          alt={r.name}
                          className={[
                            "h-12 w-12 rounded-full object-cover border border-white/10",
                            r.isDeleted ? "opacity-50" : "",
                          ].join(" ")}
                        />
                        <div className="min-w-0">
                          <button
                            onClick={() => openSellerProfile(r.id)}
                            className="text-sm font-medium text-white/90 truncate hover:text-sky-400 focus:outline-none"
                          >
                            {r.name}
                          </button>
                          <div className="text-xs text-white/45 truncate">{r.email}</div>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span className={[
                          "px-3 py-1 rounded-full text-xs font-medium border inline-flex",
                          planBadgeClass(planLabel(r.userType, r.plan)),
                        ].join(" ")}>
                          {planLabel(r.userType, r.plan)}
                        </span>
                      </div>

                      <div className="col-span-1 text-sm text-white/75">
                        {r.buyProducts ?? 0}
                      </div>

                      <div className="col-span-1 text-sm text-white/75">
                        {r.totalProducts ?? 0}
                      </div>

                      <div className="col-span-2 text-sm text-white/80 font-medium">
                        ₹{Number(r.volume ?? 0).toLocaleString("en-IN")}
                      </div>

                      <div className="col-span-2">
                        <span className={[
                          "px-3 py-1.5 rounded-full text-xs font-medium border inline-flex",
                          r.isDeleted
                            ? "bg-red-500/15 text-red-300 border-red-500/25"
                            : r.status === "Active"
                            ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
                            : "bg-red-500/15 text-red-200 border-red-500/25",
                        ].join(" ")}>
                          {r.isDeleted ? "Deleted" : r.status}
                        </span>
                      </div>

                      <div className="col-span-1 flex justify-end items-center gap-3">
                        {/* Block / Unblock */}
                        {!r.isDeleted && (
                          <button
                            onClick={() => setConfirmPopup({
                              type: r.status === "Active" ? "block" : "unblock",
                              seller: r,
                            })}
                            className={[
                              "text-xs font-medium",
                              r.status === "Active"
                                ? "text-red-400 hover:text-red-300"
                                : "text-sky-400 hover:text-sky-300",
                            ].join(" ")}
                          >
                            {r.status === "Active" ? "Block" : "Unblock"}
                          </button>
                        )}

                        {/* Delete / Restore */}
                        <button
                          onClick={() => setConfirmPopup({
                            type: r.isDeleted ? "restore" : "delete",
                            seller: r,
                          })}
                          className={[
                            "text-xs font-medium",
                            r.isDeleted
                              ? "text-emerald-400 hover:text-emerald-300"
                              : "text-white/50 hover:text-white/80",
                          ].join(" ")}
                        >
                          {r.isDeleted ? "Restore" : "🗑"}
                        </button>
                      </div>
                    </div>
                  ))}

                  {pageRows.length === 0 && (
                    <div className="p-6 text-white/60 text-sm">No sellers found.</div>
                  )}
                </div>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="text-sm text-white/60">
                  Showing {total === 0 ? 0 : startIndex + 1} to {endIndex} of {total} sellers
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={[
                          "h-9 w-9 rounded-lg border border-white/10",
                          safePage === p
                            ? "bg-white/15 text-white"
                            : "bg-white/[0.04] hover:bg-white/[0.06] text-white/80",
                        ].join(" ")}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <div className="text-sm text-white/60">Show per page</div>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="h-9 px-3 rounded-lg bg-black/30 border border-white/10 text-white"
                  >
                    {[10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
};

 
const ProductsView = () => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [sortFilter, setSortFilter] = useState<string>("none");
  const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [sellerError, setSellerError] = useState<string | null>(null);
  const [sellerProducts, setSellerProducts] = useState<PromptProduct[]>([]);

  // ✅ PAGINATION STATE
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // ... openSellerProfile, closeSellerProfile same rahega ...

  const resetFilters = () => {
    setQuery("");
    setSelectedCategory("all");
    setStatusFilter("all");
    setPriceFilter("all");
    setSortFilter("none");
    setPage(1); // ✅ reset page on filter clear
  };

  const matchesPrice = (price: number) => {
    if (priceFilter === "all") return true;
    if (priceFilter === "free") return price === 0;
    if (priceFilter === "paid") return price > 0;
    if (priceFilter === "0-5") return price >= 0 && price <= 5;
    if (priceFilter === "5-10") return price > 5 && price <= 10;
    if (priceFilter === "10-20") return price > 10 && price <= 20;
    if (priceFilter === "20+") return price > 20;
    return true;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...products];

    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.uploaderName.toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== "all") {
      const cat = selectedCategory.toLowerCase();
      list = list.filter((p) => (p.category || "").toLowerCase().includes(cat));
    }
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }
    list = list.filter((p) => matchesPrice(p.price));
    if (sortFilter === "price_desc") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortFilter === "price_asc") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    return list;
  }, [products, query, selectedCategory, statusFilter, priceFilter, sortFilter]);

  // ✅ Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [query, selectedCategory, statusFilter, priceFilter, sortFilter]);

  // ✅ PAGINATION CALCULATION
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageProducts = filtered.slice(startIndex, endIndex); // ✅ sirf 10


const openSellerProfile = async (sellerId?: string | null) => {
  if (!sellerId) return;

  try {
    setSellerLoading(true);
    setSellerError(null);

    const token = getToken();

    const resSeller = await fetch(`${SELLERS_BASE}/${sellerId}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      credentials: "include",
    });
    const sellerData = await resSeller.json();

    if (!resSeller.ok || !sellerData?.success) {
      throw new Error(sellerData?.error || "Failed to load seller profile");
    }

    const resPrompts = await fetch(`${PROMPTS_BASE}/by-seller/${sellerId}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      credentials: "include",
    });
    const promptData = await resPrompts.json();

    if (!resPrompts.ok || !promptData?.success) {
      throw new Error(promptData?.error || "Failed to load seller products");
    }

    const s = sellerData.seller;

    const derivedTotalEarnings = (promptData.prompts || []).reduce((sum: number, doc: any) => {
      const price = Number(doc?.price ?? doc?.tokun_price ?? 0);

      const sales = Number(
        doc?.sales ??
        doc?.purchases ??
        doc?.totalSales ??
        doc?.totalPurchases ??
        doc?.salesCount ??
        doc?.purchaseCount ??
        doc?.orderCount ??
        0
      );

      const revenue = Number(
        doc?.revenue ??
        doc?.totalRevenue ??
        doc?.totalEarning ??
        doc?.earnings ??
        doc?.cost ??
        doc?.totalCost ??
        (sales * price) ??
        0
      );

      return sum + (Number.isFinite(revenue) ? revenue : 0);
    }, 0);

    setSelectedSeller({
      id: String(s?._id || sellerId),
      name: s?.name || "Unknown",
      email: s?.email,
      location: s?.location,
      joined: s?.joined,
      status: s?.status || "ACTIVE",
      avatar: s?.avatar,
      verified: !!s?.verified,
      totalEarnings:
        typeof s?.totalEarnings === "number" && s.totalEarnings > 0
          ? s.totalEarnings
          : derivedTotalEarnings,
      rating: s?.rating ?? 0,
      reviewsCount: s?.reviewsCount ?? 0,
      refundRate: s?.refundRate ?? 0,
      refundThreshold: s?.refundThreshold ?? 5,
      buyProducts: Number(s?.buyProducts || 0),
      totalUploadedPrompts: Number(s?.totalUploadedPrompts ?? s?.totalProducts ?? 0),
      plan: s?.plan ?? null,
      userType: s?.userType || "IND",
    });

    const mapped: PromptProduct[] = (promptData.prompts || []).map((doc: any) => {
      const att = doc?.attachment || null;
      const status: PromptProduct["status"] =
        doc?.flagged ? "Flagged" : doc?.draft ? "Draft" : "Published";

      return {
        id: String(doc._id),
        title: doc?.title || "Untitled",
        uploaderName: doc?.userId?.name || "Unknown",
        uploaderId:
          doc?.userId?._id ||
          doc?.uploaderId?._id ||
          doc?.uploaderId ||
          doc?.sellerId?._id ||
          doc?.sellerId ||
          null,
        price: typeof doc?.price === "number" ? doc.price : 0,
        status,
        imageUrl: att?.type === "image" ? att?.path : undefined,
        videoUrl: att?.type === "video" ? att?.path : undefined,
        category: doc?.categories?.[0]?.name || "General",
        exclusive: !!doc?.exclusive,
        sold: !!doc?.sold,
        salesCount: Number(doc?.salesCount || 0),
        totalRevenue: Number(doc?.totalRevenue || 0),
      };
    });

    setSellerProducts(mapped);
  } catch (e: any) {
    setSellerError(e?.message || "Error loading seller profile");
  } finally {
    setSellerLoading(false);
  }
};

const closeSellerProfile = () => {
  setSelectedSeller(null);
  setSellerProducts([]);
  setSellerError(null);
};

const [profileSuspendLoading, setProfileSuspendLoading] = useState(false);
const [profileSuspendError, setProfileSuspendError] = useState<string | null>(null);

const handleProfileSuspendToggle = async () => {
  if (!selectedSeller) return;
  const action = selectedSeller.status === "SUSPENDED" ? "unblock" : "block";
  const confirmMsg =
    action === "block"
      ? `Suspend "${selectedSeller.name}"? They won't be able to sell on the platform.`
      : `Reactivate "${selectedSeller.name}"? They will regain access to sell.`;
  if (!window.confirm(confirmMsg)) return;

  try {
    setProfileSuspendLoading(true);
    setProfileSuspendError(null);
    const token = getToken();
    const res = await fetch(`${SELLERS_BASE}/${selectedSeller.id}/block`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok || !data?.success) throw new Error(data?.error || "Failed");

    const newProfileStatus = action === "block" ? "SUSPENDED" : "ACTIVE";
    setSelectedSeller((prev) => (prev ? { ...prev, status: newProfileStatus } : prev));
  } catch (e: any) {
    setProfileSuspendError(e?.message || "Action failed");
  } finally {
    setProfileSuspendLoading(false);
  }
};

  if (selectedSeller) {
    return (
      <SellerProfileView
        seller={selectedSeller}
        products={sellerProducts}
        loading={sellerLoading}
        error={sellerError}
        onBack={closeSellerProfile}
        onToggleSuspend={handleProfileSuspendToggle}
        suspendLoading={profileSuspendLoading}
        suspendError={profileSuspendError}
      />
    );
  }

  return (
    <>
      {/* Header — same rahega */}
      <div className="mt-2 md:mt-0">
        <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-4 md:gap-6">
          <div className="text-center md:text-left w-full">
            <h1 className="text-[24px] md:text-[34px] leading-[1.05] font-semibold">
              Product Management
            </h1>
            <p className="mt-1 text-white/60 text-sm">
              Manage and monitor digital products on the platform
            </p>
          </div>
          <div className="hidden md:block" />
          <div className="hidden md:block" />
        </div>
      </div>

      {/* KPI — same rahega */}
      <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">TOTAL LISTING</div>
          <div className="mt-4 text-3xl font-semibold">{products.length}</div>
          <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
            <TrendingUp className="h-4 w-4" />
            Live from marketplace
          </div>
        </div>
        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">FLAGGED PRODUCT</div>
          <div className="mt-4 text-3xl font-semibold">
            {products.filter((p) => p.status === "Flagged").length}
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
            <TriangleAlert className="h-4 w-4" />
            High Priority
          </div>
        </div>
      </section>

      {/* Search + Filters — same rahega */}
      <section className={`${kpiCardBase} mt-6 p-4`}>
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
              placeholder="Search products by name, seller, category..."
            />
          </div>
          <div className="flex flex-wrap gap-3 justify-start lg:justify-end">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-11 w-[170px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
                <SelectValue placeholder={catsLoading ? "Loading..." : "All Categories"} />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                <SelectItem value="all">All Categories</SelectItem>
                {(categories || []).map((c) => (
                  <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="h-11 w-[160px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="0-5">₹0 - ₹5</SelectItem>
                <SelectItem value="5-10">₹5 - ₹10</SelectItem>
                <SelectItem value="10-20">₹10 - ₹20</SelectItem>
                <SelectItem value="20+">₹20+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 w-[150px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortFilter} onValueChange={setSortFilter}>
              <SelectTrigger className="h-11 w-[190px] rounded-xl border border-white/15 bg-white/[0.03] text-white">
                <SelectValue placeholder="Sort By Price" />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                <SelectItem value="none">No Sorting</SelectItem>
                <SelectItem value="price_desc">Price: High → Low</SelectItem>
                <SelectItem value="price_asc">Price: Low → High</SelectItem>
              </SelectContent>
            </Select>

            <button
              onClick={resetFilters}
              className="h-11 px-4 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80 flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
        {catsError && (
          <div className="mt-3 text-xs text-red-400">Category load failed: {catsError}</div>
        )}
      </section>

      {/* Loading / Error */}
      {productsLoading && (
        <div className="mt-6 text-white/70 text-sm">Loading products…</div>
      )}
      {!!productsError && !productsLoading && (
        <div className="mt-6 text-red-400 text-sm">{productsError}</div>
      )}

      {/* ✅ Products Grid — pageProducts use karo filtered ki jagah */}
      {!productsLoading && !productsError && (
        <>
          <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pageProducts.map((p) => {
              const hasImage = !!p.imageUrl;
              const hasVideo = !!p.videoUrl;

              return (
                <div
                  key={p.id}
                  className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
                >
                  <div className="relative h-[230px] bg-black/40">
                    {hasImage ? (
  <img
    src={p.imageUrl}
    alt={p.title}
    className="absolute inset-0 w-full h-full object-cover"
  />
) : hasVideo ? (
  <video
    src={p.videoUrl}
    className="absolute inset-0 w-full h-full object-cover"
    controls
    muted
    playsInline
    preload="metadata"
  />
) : (
  <div className="absolute inset-0 w-full h-full flex items-center justify-center">
    <div className="flex items-center gap-2 text-white/60 text-sm">
      <ImageIcon className="h-5 w-5" />
      No Preview
    </div>
  </div>
)}

                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-sky-500/15 text-sky-200 border border-sky-500/25">
                      {p.status}
                    </span>

                    {p.exclusive && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-200 border border-emerald-500/25">
                        ONE-TIME{p.sold ? " • SOLD" : ""}
                      </span>
                    )}
                  </div>

                  <div className="bg-[#111827] text-white p-4">
                    <div className="text-[13px] font-semibold leading-snug truncate text-white/90">
                      {p.title}
                    </div>
                    <div className="mt-2 text-[12px] text-white/60 truncate">
                      by{" "}
                    <button
  type="button"
  onClick={() => {
    console.log("SELLER CLICK", p.uploaderId, p);
    openSellerProfile(p.uploaderId);
  }}
  className="text-sky-300 hover:underline font-medium"
>
  {p.uploaderName}
</button>
                      {p.category ? ` • ${p.category}` : ""}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm font-semibold text-white">
                        {p.price > 0 ? `₹${p.price.toFixed(2)}` : "FREE"}
                      </div>
                      <div className="text-xs text-white/45">
                        ID: {p.id.slice(-6)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {pageProducts.length === 0 && (
              <div className="col-span-full text-center text-white/70 py-10">
                No products found.
              </div>
            )}
          </section>

          {/* ✅ PAGINATION — seller wale jaisa */}
          {total > 0 && (
            <div className="mt-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Showing count */}
              <div className="text-sm text-white/60">
                Showing {total === 0 ? 0 : startIndex + 1} to {endIndex} of {total} products
              </div>

              {/* Page buttons */}
              <div className="flex items-center gap-2">
                <button
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40 text-sm text-white/80"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={[
                        "h-9 w-9 rounded-lg border border-white/10 text-sm",
                        safePage === p
                          ? "bg-white/15 text-white"
                          : "bg-white/[0.04] hover:bg-white/[0.06] text-white/80",
                      ].join(" ")}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] disabled:opacity-40 text-sm text-white/80"
                >
                  Next
                </button>
              </div>

              {/* Mobile: simple prev/next only */}
              <div className="flex md:hidden items-center justify-between w-full">
                <button
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] disabled:opacity-40 text-sm text-white/80"
                >
                  Previous
                </button>
                <span className="text-xs text-white/60">
                  Page {safePage} / {totalPages}
                </span>
                <button
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] disabled:opacity-40 text-sm text-white/80"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

const formatMonthYear = (dateLike?: string) => {
  if (!dateLike) return "—";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
};



const SellerProfileView = ({
  seller,
  products,
  loading,
  error,
  onBack,
  onToggleSuspend,
  suspendLoading,
  suspendError,
}: {
  seller: SellerProfile;
  products: PromptProduct[];
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onToggleSuspend: () => void;
  suspendLoading: boolean;
  suspendError: string | null;
}) => {


    const [messageOpen, setMessageOpen] = useState(false);
  return (
    <>
      {/* Title */}
     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
  <div className="text-center md:text-left">
    <button
      onClick={onBack}
      className="text-sm text-white/60 hover:text-white/90"
    >
      ← Back to Products
    </button>
    <h1 className="mt-2 text-[24px] md:text-[34px] leading-[1.1] font-semibold">
      Seller Profile
    </h1>
  </div>
</div>

      {/* Top profile card */}
      <div className={`${kpiCardBase} mt-6 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5`}>
        <div className="flex items-center gap-4">
          <img
            src={seller.avatar || "https://i.pravatar.cc/100?img=11"}
            className="h-14 w-14 rounded-full object-cover border border-white/10"
            alt={seller.name}
          />
          <div>
            <div className="flex items-center gap-3">
              <div className="text-xl font-semibold">{seller.name}</div>
              <span className={[
                "px-3 py-1 rounded-full text-xs font-medium border",
                seller.status === "SUSPENDED"
                  ? "bg-red-500/15 text-red-200 border-red-500/25"
                  : "bg-emerald-500/15 text-emerald-200 border-emerald-500/25",
              ].join(" ")}>
                {seller.status || "ACTIVE"}
              </span>
            </div>
           <div className="mt-1 text-xs text-white/50">
  Seller ID: {seller.id} • Joined: {formatMonthYear(seller.joined)} • Email: {seller.email || "—"}
</div>
          </div>
        </div>

{/* ✅ Actions: Message + Suspend */}
<div className="w-full lg:w-auto grid grid-cols-2 gap-3">
  <button
  onClick={() => setMessageOpen(true)}
  className="h-11 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm inline-flex items-center justify-center gap-2"
>
  <MessageSquare className="h-4 w-4 text-sky-300" />
  <span className="hidden sm:inline">Message</span>
</button>

  <button
    onClick={onToggleSuspend}
    disabled={suspendLoading}
    className={[
      "h-11 rounded-xl border text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60",
      seller.status === "SUSPENDED"
        ? "border-sky-500/20 bg-sky-500/10 hover:bg-sky-500/15 text-sky-300"
        : "border-red-500/20 bg-red-500/10 hover:bg-red-500/15 text-red-300",
    ].join(" ")}
  >
    <Ban className="h-4 w-4" />
    <span className="hidden sm:inline">
      {suspendLoading ? "..." : seller.status === "SUSPENDED" ? "Reactivate" : "Suspend"}
    </span>
  </button>
</div>

      </div>

      {suspendError && (
        <p className="mt-3 text-sm text-red-300">{suspendError}</p>
      )}

      {/* KPI row */}
      <section className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">TOTAL EARNINGS</div>
          <div className="mt-4 text-2xl font-semibold">
            ₹{Number(seller.totalEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 text-sm text-emerald-400">Vs. last 30 days</div>
        </div>

        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">PURCHASED</div>
          <div className="mt-4 text-2xl font-semibold">{seller.buyProducts ?? 0}</div>
          <div className="mt-3 text-sm text-white/50">prompts bought</div>
        </div>

        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">UPLOADED</div>
          <div className="mt-4 text-2xl font-semibold">{seller.totalUploadedPrompts ?? 0}</div>
          <div className="mt-3 text-sm text-white/50">prompts uploaded</div>
        </div>

        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">PLAN</div>
          <div className="mt-4">
            <span
              className={[
                "inline-block px-3 py-1 rounded-full text-sm font-medium border",
                planBadgeClass(planLabel(seller.userType, seller.plan)),
              ].join(" ")}
            >
              {planLabel(seller.userType, seller.plan)}
            </span>
          </div>
          <div className="mt-3 text-sm text-white/50">current plan</div>
        </div>
      </section>

      {/* Products table */}
      <div className={`${kpiCardBase} mt-6 p-6`}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Products ({products.length})</h2>
          <button className="text-sm text-[#3A7CFF] hover:underline">View All</button>
        </div>

        {loading && <div className="mt-6 text-white/70 text-sm">Loading seller data…</div>}
        {!!error && !loading && <div className="mt-6 text-red-400 text-sm">{error}</div>}

        {!loading && !error && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
              <div className="col-span-5">PRODUCT</div>
              <div className="col-span-3">CATEGORY</div>
              <div className="col-span-2">PRICE</div>
              <div className="col-span-2">SALES</div>
            </div>

            <div className="divide-y divide-white/10">
              {products.slice(0, 4).map((p) => (
                <div key={p.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center bg-white/[0.02]">
                  <div className="col-span-5">
                    <div className="text-sm font-medium text-white/90">{p.title}</div>
                    <div className="text-xs text-white/50">{p.status}</div>
                  </div>
                  <div className="col-span-3 text-sm text-white/75">{p.category || "General"}</div>
                  <div className="col-span-2 text-sm text-white/75">
                    {p.price > 0 ? `₹${p.price}` : "FREE"}
                  </div>
                  <div className="col-span-2 text-sm text-white/75">{p.salesCount ?? 0}</div>
                </div>
              ))}
            </div>

            <div className="p-5 flex justify-center">
             <button
  onClick={() => setShowAllSellers(true)}
  className="text-sm text-[#3A7CFF] hover:underline"
>
  View All
</button>


            </div>
          </div>
        )}
      </div>

      <AdminSellerMessageModal
        open={messageOpen}
        seller={seller}
        onClose={() => setMessageOpen(false)}
      />

    </>
  );
};


// ─── UserProfileView ──────────────────────────────────────────
// Presentational admin view of a single user. Parent (Dashboard) fetches and
// passes everything in — mirrors SellerProfileView, but user-centric: shows
// both what they've BOUGHT and what they've UPLOADED/SOLD, since buyers and
// sellers are the same account.
const UserProfileView = ({
  user,
  bought,
  uploaded,
  loading,
  error,
  onBack,
  onToggleSuspend,
  suspendLoading,
  suspendError,
}: {
  user: UserProfile;
  bought: UserBoughtItem[];
  uploaded: PromptProduct[];
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onToggleSuspend: () => void;
  suspendLoading: boolean;
  suspendError: string | null;
}) => {
  const [messageOpen, setMessageOpen] = useState(false);
  const isSuspended = user.status === "SUSPENDED" || user.status === "DELETED";
  const userTypeLabel =
    user.userType === "ORG"
      ? "Organization"
      : user.userType === "TM"
      ? "Team Member"
      : "Individual";

  return (
    <>
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-center md:text-left">
          <button onClick={onBack} className="text-sm text-white/60 hover:text-white/90">
            ← Back to Users
          </button>
          <h1 className="mt-2 text-[24px] md:text-[34px] leading-[1.1] font-semibold">
            User Profile
          </h1>
        </div>
      </div>

      {/* Top profile card */}
      <div className={`${kpiCardBase} mt-6 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5`}>
        <div className="flex items-center gap-4">
          <img
            src={user.avatar || "https://i.pravatar.cc/100?img=12"}
            className="h-14 w-14 rounded-full object-cover border border-white/10"
            alt={user.name}
          />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-xl font-semibold">{user.name}</div>
              <span
                className={[
                  "px-3 py-1 rounded-full text-xs font-medium border",
                  user.status === "SUSPENDED" || user.status === "DELETED"
                    ? "bg-red-500/15 text-red-200 border-red-500/25"
                    : "bg-emerald-500/15 text-emerald-200 border-emerald-500/25",
                ].join(" ")}
              >
                {user.status || "ACTIVE"}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium border bg-sky-500/15 text-sky-200 border-sky-500/25">
                {userTypeLabel}
              </span>
              <span
                className={[
                  "px-3 py-1 rounded-full text-xs font-medium border",
                  planBadgeClass(planLabel(user.userType, user.plan)),
                ].join(" ")}
              >
                {planLabel(user.userType, user.plan)} plan
              </span>
              {user.verified && (
                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-indigo-500/15 text-indigo-200 border-indigo-500/25">
                  Verified
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-white/50">
              User ID: {user.id} • Joined: {formatMonthYear(user.joined)} • Email: {user.email || "—"}
            </div>
          </div>
        </div>

        {/* Actions: Chat + Suspend */}
        <div className="w-full lg:w-auto grid grid-cols-2 gap-3">
          <button
            onClick={() => setMessageOpen(true)}
            className="h-11 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm inline-flex items-center justify-center gap-2"
          >
            <MessageSquare className="h-4 w-4 text-sky-300" />
            <span className="hidden sm:inline">Chat</span>
          </button>
          <button
            onClick={onToggleSuspend}
            disabled={suspendLoading}
            className={[
              "h-11 rounded-xl border text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60",
              isSuspended
                ? "border-sky-500/20 bg-sky-500/10 hover:bg-sky-500/15 text-sky-300"
                : "border-red-500/20 bg-red-500/10 hover:bg-red-500/15 text-red-300",
            ].join(" ")}
          >
            <Ban className="h-4 w-4" />
            <span className="hidden sm:inline">
              {suspendLoading ? "..." : isSuspended ? "Reactivate" : "Suspend"}
            </span>
          </button>
        </div>
      </div>

      {suspendError && <p className="mt-3 text-sm text-red-300">{suspendError}</p>}
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

      {/* KPI row */}
      <section className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">PURCHASED</div>
          <div className="mt-4 text-3xl font-semibold">{user.buyProducts}</div>
          <div className="mt-3 text-sm text-white/50">prompts bought</div>
        </div>
        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">TOTAL SPENT</div>
          <div className="mt-4 text-3xl font-semibold">
            ₹{Number(user.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 text-sm text-white/50">as a buyer</div>
        </div>
        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">UPLOADED</div>
          <div className="mt-4 text-3xl font-semibold">{user.uploadedCount}</div>
          <div className="mt-3 text-sm text-white/50">{user.soldProducts} sold</div>
        </div>
        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">TOTAL EARNINGS</div>
          <div className="mt-4 text-3xl font-semibold">
            ₹{Number(user.totalEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 text-sm text-emerald-400">as a seller</div>
        </div>
      </section>

      {loading && <div className="mt-6 text-white/70 text-sm">Loading user data…</div>}

      {/* Purchased prompts */}
      <div className={`${kpiCardBase} mt-6 p-6`}>
        <h2 className="text-lg font-semibold">Purchased Prompts ({bought.length})</h2>
        {!loading && bought.length === 0 && (
          <div className="mt-5 text-white/55 text-sm">This user hasn't bought any prompts.</div>
        )}
        {bought.length > 0 && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
              <div className="col-span-6">PROMPT</div>
              <div className="col-span-2">PRICE PAID</div>
              <div className="col-span-2">STATUS</div>
              <div className="col-span-2">DATE</div>
            </div>
            <div className="divide-y divide-white/10">
              {bought.map((b) => (
                <div key={b.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center bg-white/[0.02]">
                  <div className="col-span-6">
                    <div className="text-sm font-medium text-white/90">{b.title}</div>
                    {b.deleted && <div className="text-xs text-white/40">(prompt deleted)</div>}
                  </div>
                  <div className="col-span-2 text-sm text-white/75">
                    {b.pricePaid > 0 ? `₹${b.pricePaid}` : "FREE"}
                  </div>
                  <div className="col-span-2 text-sm">
                    <span
                      className={[
                        "px-2 py-0.5 rounded-full text-xs border",
                        b.refundStatus && b.refundStatus !== "NONE"
                          ? "bg-amber-500/15 text-amber-200 border-amber-500/25"
                          : "bg-emerald-500/15 text-emerald-200 border-emerald-500/25",
                      ].join(" ")}
                    >
                      {b.refundStatus && b.refundStatus !== "NONE" ? b.refundStatus : b.paymentStatus}
                    </span>
                  </div>
                  <div className="col-span-2 text-sm text-white/60">
                    {b.purchasedAt ? new Date(b.purchasedAt).toLocaleDateString() : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Uploaded prompts */}
      <div className={`${kpiCardBase} mt-6 p-6`}>
        <h2 className="text-lg font-semibold">Uploaded Prompts ({uploaded.length})</h2>
        {!loading && uploaded.length === 0 && (
          <div className="mt-5 text-white/55 text-sm">This user hasn't uploaded any prompts.</div>
        )}
        {uploaded.length > 0 && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
              <div className="col-span-5">PRODUCT</div>
              <div className="col-span-3">CATEGORY</div>
              <div className="col-span-2">PRICE</div>
              <div className="col-span-2">SALES</div>
            </div>
            <div className="divide-y divide-white/10">
              {uploaded.map((p) => (
                <div key={p.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center bg-white/[0.02]">
                  <div className="col-span-5">
                    <div className="text-sm font-medium text-white/90">{p.title}</div>
                    <div className="text-xs text-white/50">{p.status}</div>
                  </div>
                  <div className="col-span-3 text-sm text-white/75">{p.category || "General"}</div>
                  <div className="col-span-2 text-sm text-white/75">
                    {p.price > 0 ? `₹${p.price}` : "FREE"}
                  </div>
                  <div className="col-span-2 text-sm text-white/75">{p.salesCount ?? 0}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AdminSellerMessageModal
        open={messageOpen}
        seller={{ id: user.id, name: user.name, email: user.email, avatar: user.avatar, verified: user.verified }}
        onClose={() => setMessageOpen(false)}
      />
    </>
  );
};


// ─── OrgProfileView ───────────────────────────────────────────
// Presentational admin view of a single organization. Parent (Dashboard)
// fetches and passes the org in. Shows owner, plan/billing, token pool, seat
// usage, and the member roster — the data a platform admin needs on an org.
const OrgProfileView = ({
  org,
  loading,
  error,
  onBack,
  onToggleSuspend,
  suspendLoading,
  suspendError,
}: {
  org: OrgDetail;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onToggleSuspend: () => void;
  suspendLoading: boolean;
  suspendError: string | null;
}) => {
  const [messageOpen, setMessageOpen] = useState(false);
  const seatsUsed = Math.max(0, org.teamMembersLimit - org.teamMembersLimitRemaining);
  const poolPct = org.orgPoolCap > 0 ? Math.round((org.orgPoolUsed / org.orgPoolCap) * 100) : 0;
  const isHealthy = org.subscriptionStatus === "active";
  const isBad =
    org.subscriptionStatus === "suspended" ||
    org.subscriptionStatus === "canceled" ||
    org.subscriptionStatus === "past_due";

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-center md:text-left">
          <button onClick={onBack} className="text-sm text-white/60 hover:text-white/90">
            ← Back to Organizations
          </button>
          <h1 className="mt-2 text-[24px] md:text-[34px] leading-[1.1] font-semibold">
            Organization Profile
          </h1>
        </div>
      </div>

      {/* Top card */}
      <div className={`${kpiCardBase} mt-6 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5`}>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <Building2 className="h-7 w-7 text-white/75" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-xl font-semibold">{org.name}</div>
              <span
                className={[
                  "px-3 py-1 rounded-full text-xs font-medium border",
                  isHealthy
                    ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
                    : isBad
                    ? "bg-red-500/15 text-red-200 border-red-500/25"
                    : "bg-white/[0.05] text-white/60 border-white/10",
                ].join(" ")}
              >
                {org.subscriptionStatus || "no plan"}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium border bg-sky-500/15 text-sky-200 border-sky-500/25">
                {org.plan === "enterprise" ? "Enterprise" : "Free"}
              </span>
              {org.adminFrozen && (
                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-500/20 text-red-200 border-red-500/30">
                  FROZEN BY ADMIN
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-white/50">
              Org ID: {org.id} • Owner: {org.ownerName} ({org.ownerEmail}) • Created: {formatMonthYear(org.createdAt || undefined)}
            </div>
          </div>
        </div>

        {/* Actions: Chat (owner) + Suspend whole org */}
        <div className="w-full lg:w-auto grid grid-cols-2 gap-3">
          <button
            onClick={() => setMessageOpen(true)}
            className="h-11 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm inline-flex items-center justify-center gap-2"
          >
            <MessageSquare className="h-4 w-4 text-sky-300" />
            <span className="hidden sm:inline">Chat owner</span>
          </button>
          <button
            onClick={onToggleSuspend}
            disabled={suspendLoading}
            className={[
              "h-11 rounded-xl border text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60",
              org.adminFrozen
                ? "border-sky-500/20 bg-sky-500/10 hover:bg-sky-500/15 text-sky-300"
                : "border-red-500/20 bg-red-500/10 hover:bg-red-500/15 text-red-300",
            ].join(" ")}
          >
            <Ban className="h-4 w-4" />
            <span className="hidden sm:inline">
              {suspendLoading ? "..." : org.adminFrozen ? "Reactivate" : "Suspend org"}
            </span>
          </button>
        </div>
      </div>

      {suspendError && <p className="mt-3 text-sm text-red-300">{suspendError}</p>}
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

      {/* KPI row */}
      <section className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">MEMBERS</div>
          <div className="mt-4 text-3xl font-semibold">{org.membersCount}</div>
          <div className="mt-3 text-sm text-white/50">{seatsUsed}/{org.teamMembersLimit} seats used</div>
        </div>
        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">TOKEN POOL</div>
          <div className="mt-4 text-3xl font-semibold">{poolPct}%</div>
          <div className="mt-3 text-sm text-white/50">
            {(org.orgPoolUsed || 0).toLocaleString()} / {(org.orgPoolCap || 0).toLocaleString()}
          </div>
        </div>
        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">EXTRA TOKENS</div>
          <div className="mt-4 text-3xl font-semibold">
            {(org.orgExtraTokensRemaining || 0).toLocaleString()}
          </div>
          <div className="mt-3 text-sm text-white/50">remaining</div>
        </div>
        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">BILLING CYCLE</div>
          <div className="mt-4 text-2xl font-semibold capitalize">{org.billingCycle || "—"}</div>
          <div className="mt-3 text-sm text-white/50">
            Renews {org.currentPeriodEnd ? new Date(org.currentPeriodEnd).toLocaleDateString() : "—"}
          </div>
        </div>
      </section>

      {loading && <div className="mt-6 text-white/70 text-sm">Loading organization…</div>}

      {/* Members */}
      <div className={`${kpiCardBase} mt-6 p-6`}>
        <h2 className="text-lg font-semibold">Team Members ({org.members.length})</h2>
        {!loading && org.members.length === 0 && (
          <div className="mt-5 text-white/55 text-sm">No members added yet.</div>
        )}
        {org.members.length > 0 && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
              <div className="col-span-5">MEMBER</div>
              <div className="col-span-2">ROLE</div>
              <div className="col-span-3">ASSIGNED CAP</div>
              <div className="col-span-2">USED</div>
            </div>
            <div className="divide-y divide-white/10">
              {org.members.map((m) => (
                <div key={m.userId} className="grid grid-cols-12 gap-3 px-5 py-4 items-center bg-white/[0.02]">
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <img
                      src={m.avatar || "https://i.pravatar.cc/60?img=15"}
                      alt={m.name}
                      className="h-8 w-8 rounded-full object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white/90 truncate">{m.name}</div>
                      <div className="text-xs text-white/45 truncate">{m.email}</div>
                    </div>
                  </div>
                  <div className="col-span-2 text-sm">
                    <span
                      className={[
                        "px-2 py-0.5 rounded-full text-xs border",
                        m.role === "ADMIN"
                          ? "bg-indigo-500/15 text-indigo-200 border-indigo-500/25"
                          : "bg-white/[0.05] text-white/60 border-white/10",
                      ].join(" ")}
                    >
                      {m.role}
                    </span>
                  </div>
                  <div className="col-span-3 text-sm text-white/75">
                    {(m.assignedCap || 0).toLocaleString()}
                  </div>
                  <div className="col-span-2 text-sm text-white/75">
                    {(m.usedThisPeriod || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat targets the org owner (the modal messages a User account) */}
      <AdminSellerMessageModal
        open={messageOpen}
        seller={{ id: org.ownerId, name: org.ownerName, email: org.ownerEmail, avatar: org.ownerAvatar || undefined }}
        onClose={() => setMessageOpen(false)}
      />
    </>
  );
};


// ─── WithdrawalsView Component ────────────────────────────────
// ─── Types ───────────────────────────────────────────────────



// ─── Types ───────────────────────────────────────────────────
type WithdrawalRow = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  payoutMethod: "bank" | "upi";
  bankName: string;
  accountLast4: string;
  ifscCode?: string;
  upiId?: string;
  amount: number;
  serviceFee: number;
  netAmount: number;
  status: "Pending" | "Completed" | "Failed" | "Rejected";
  note?: string;
  createdAt: string;
  processedAt?: string;
};

type WithdrawalSummary = {
  pending: {
    count: number;
    totalAmount: number;
    totalServiceFee: number;
    totalNetAmount: number;
  };
  approved: {
    count: number;
    totalAmount: number;
    totalServiceFee: number;
    totalNetAmount: number;
  };
  rejected: {
    count: number;
    totalAmount: number;
    totalServiceFee: number;
    totalNetAmount: number;
  };
  all: {
    count: number;
    totalAmount: number;
    totalServiceFee: number;
    totalNetAmount: number;
  };
};

const emptyWithdrawalSummary: WithdrawalSummary = {
  pending: {
    count: 0,
    totalAmount: 0,
    totalServiceFee: 0,
    totalNetAmount: 0,
  },
  approved: {
    count: 0,
    totalAmount: 0,
    totalServiceFee: 0,
    totalNetAmount: 0,
  },
  rejected: {
    count: 0,
    totalAmount: 0,
    totalServiceFee: 0,
    totalNetAmount: 0,
  },
  all: {
    count: 0,
    totalAmount: 0,
    totalServiceFee: 0,
    totalNetAmount: 0,
  },
};

const WithdrawalsView = () => {
  const [rows, setRows] = useState<WithdrawalRow[]>([]);
  const [summary, setSummary] = useState<WithdrawalSummary>(
    emptyWithdrawalSummary
  );

  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<
    "all" | "Pending" | "Completed" | "Failed"
  >("Pending");

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [confirmPopup, setConfirmPopup] = useState<{
    type: "approve" | "reject";
    row: WithdrawalRow;
  } | null>(null);

  const [rejectReason, setRejectReason] = useState("");

  const WITHDRAW_PENDING_URL = `${API_BASE}/api/wallet/admin/pending-withdrawals`;
  const WITHDRAW_ALL_URL = `${API_BASE}/api/wallet/admin/all-withdrawals`;
  const WITHDRAW_SUMMARY_URL = `${API_BASE}/api/wallet/admin/withdrawal-summary`;
  const WITHDRAW_APPROVE_URL = `${API_BASE}/api/wallet/admin/approve-withdrawal`;
  const WITHDRAW_REJECT_URL = `${API_BASE}/api/wallet/admin/reject-withdrawal`;

  const fmtInr = (n: number) =>
    `₹${Number(n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDateTime = (dateLike?: string) => {
    if (!dateLike) return "—";

    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return "—";

    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusTone = (status: WithdrawalRow["status"]) => {
    if (status === "Pending") {
      return "bg-amber-500/15 text-amber-200 border-amber-500/25";
    }

    if (status === "Completed") {
      return "bg-emerald-500/15 text-emerald-200 border-emerald-500/25";
    }

    return "bg-red-500/15 text-red-200 border-red-500/25";
  };

  const getStatusLabel = (status: WithdrawalRow["status"]) => {
    if (status === "Completed") return "Approved";
    if (status === "Failed" || status === "Rejected") return "Rejected";
    return "Pending";
  };

  const mapWithdrawal = (w: any): WithdrawalRow => ({
    id: String(w._id || w.id || ""),
    userId: String(w.userId?._id || w.userId || ""),
    userName: w.userId?.name || "Unknown",
    userEmail: w.userId?.email || "—",
    userAvatar: w.userId?.avatarUrl || w.userId?.avatar || "",
    payoutMethod: w.bankAccountId?.payoutMethod === "upi" ? "upi" : "bank",
    bankName: w.bankAccountId?.bankName || "Bank",
    accountLast4:
      String(w.bankAccountId?.accountNumber || "").slice(-4) || "0000",
    ifscCode: w.bankAccountId?.ifscCode || "",
    upiId: w.bankAccountId?.upiId || "",
    amount: Number(w.amount || 0),
    serviceFee: Number(w.serviceFee || 0),
    netAmount: Number(w.netAmount || 0),
    status: (w.status as WithdrawalRow["status"]) || "Pending",
    note: w.note || "",
    createdAt: w.createdAt || new Date().toISOString(),
    processedAt: w.processedAt || "",
  });

  const fetchWithdrawalSummary = async () => {
    try {
      setSummaryLoading(true);

      const token = getToken();

      const res = await fetch(WITHDRAW_SUMMARY_URL, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        throw new Error(
          data?.message || data?.error || "Failed to load summary"
        );
      }

      setSummary(data.summary || emptyWithdrawalSummary);
    } catch (e) {
      console.error("fetchWithdrawalSummary error:", e);
      setSummary(emptyWithdrawalSummary);
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      setActionError(null);

      const token = getToken();

      const url =
        statusFilter === "Pending" ? WITHDRAW_PENDING_URL : WITHDRAW_ALL_URL;

      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        throw new Error(
          data?.message || data?.error || "Failed to load withdrawals"
        );
      }

      const mapped = (data.withdrawals || []).map(mapWithdrawal);

      setRows(mapped);
      setPage(1);
    } catch (e: any) {
      console.error("fetchWithdrawals error:", e);
      setError(e?.message || "Failed to load withdrawals");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchWithdrawals(), fetchWithdrawalSummary()]);
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleApprove = async (row: WithdrawalRow) => {
    try {
      setActionLoading(row.id);
      setActionError(null);

      const token = getToken();

      const res = await fetch(WITHDRAW_APPROVE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          withdrawalId: row.id,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || "Approve failed");
      }

      setConfirmPopup(null);
      await refreshAll();
    } catch (e: any) {
      console.error("handleApprove error:", e);
      setActionError(e?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (row: WithdrawalRow) => {
    try {
      setActionLoading(row.id);
      setActionError(null);

      const token = getToken();

      const res = await fetch(WITHDRAW_REJECT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          withdrawalId: row.id,
          reason: rejectReason.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || "Reject failed");
      }

      setConfirmPopup(null);
      setRejectReason("");
      await refreshAll();
    } catch (e: any) {
      console.error("handleReject error:", e);
      setActionError(e?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = [...rows];

    if (statusFilter !== "all") {
      list = list.filter((r) => {
        if (statusFilter === "Failed") {
          return r.status === "Failed" || r.status === "Rejected";
        }

        return r.status === statusFilter;
      });
    }

    if (q) {
      list = list.filter(
        (r) =>
          r.userName.toLowerCase().includes(q) ||
          r.userEmail.toLowerCase().includes(q) ||
          r.bankName.toLowerCase().includes(q) ||
          r.ifscCode?.toLowerCase().includes(q) ||
          r.upiId?.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          String(r.amount).includes(q) ||
          String(r.netAmount).includes(q)
      );
    }

    list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return list;
  }, [rows, statusFilter, query]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, query]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageRows = filtered.slice(startIndex, startIndex + pageSize);

  const StatCard = ({
    label,
    value,
    helper,
    tone,
  }: {
    label: string;
    value: string | number;
    helper: string;
    tone: "amber" | "emerald" | "red" | "sky" | "fuchsia";
  }) => {
    const toneMap = {
      amber: "text-amber-300",
      emerald: "text-emerald-300",
      red: "text-red-300",
      sky: "text-sky-300",
      fuchsia: "text-fuchsia-300",
    };

    return (
      <div className={`${kpiCardBase} p-6`}>
        <div className="text-xs tracking-[0.2em] text-white/60">{label}</div>

        <div className="mt-4 text-3xl font-semibold">
          {summaryLoading ? "..." : value}
        </div>

        <div className={`mt-3 text-sm ${toneMap[tone]}`}>{helper}</div>
      </div>
    );
  };

  return (
    <>
      {confirmPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0F1117] p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white">
              {confirmPopup.type === "approve"
                ? "Approve Withdrawal?"
                : "Reject Withdrawal?"}
            </h2>

            <p className="mt-3 text-sm text-white/65 leading-relaxed">
              {confirmPopup.type === "approve"
                ? `Approve ${fmtInr(
                    confirmPopup.row.netAmount
                  )} payout to ${confirmPopup.row.userName}?`
                : `Reject withdrawal of ${fmtInr(
                    confirmPopup.row.amount
                  )} for ${
                    confirmPopup.row.userName
                  }? Amount will be refunded to their wallet.`}
            </p>

            {confirmPopup.type === "reject" && (
              <div className="mt-4">
                <label className="text-xs text-white/60">
                  Rejection reason optional
                </label>

                <input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Bank details mismatch"
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-white/35"
                />
              </div>
            )}

            {actionError && (
              <div className="mt-3 text-xs text-red-400">{actionError}</div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setConfirmPopup(null);
                  setActionError(null);
                  setRejectReason("");
                }}
                disabled={actionLoading === confirmPopup.row.id}
                className="h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white/80 hover:bg-white/[0.07] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  confirmPopup.type === "approve"
                    ? handleApprove(confirmPopup.row)
                    : handleReject(confirmPopup.row)
                }
                disabled={actionLoading === confirmPopup.row.id}
                className={[
                  "h-11 flex-1 rounded-xl text-sm font-medium text-white disabled:opacity-60",
                  confirmPopup.type === "approve"
                    ? "bg-emerald-500 hover:opacity-90"
                    : "bg-red-500 hover:opacity-90",
                ].join(" ")}
              >
                {actionLoading === confirmPopup.row.id
                  ? "Processing..."
                  : confirmPopup.type === "approve"
                  ? "Yes, Approve"
                  : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mt-2 md:mt-0">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center gap-3 md:justify-start">
              <h1 className="text-[24px] font-semibold leading-[1.1] md:text-[34px]">
                Withdrawal Requests
              </h1>

              {summary.pending.count > 0 && (
                <span className="rounded-full border border-amber-500/25 bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-200">
                  {summary.pending.count} Pending
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-white/60">
              Pending, approved, rejected withdrawals aur total payout amount
              yahan manage karo.
            </p>
          </div>

          <button
            onClick={refreshAll}
            disabled={loading || summaryLoading}
            className="h-9 self-start rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/80 hover:bg-white/[0.07] disabled:opacity-50"
          >
            ↺ Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="PENDING REQUESTS"
          value={summary.pending.count}
          helper={`${fmtInr(summary.pending.totalAmount)} pending`}
          tone="amber"
        />

        <StatCard
          label="APPROVED REQUESTS"
          value={summary.approved.count}
          helper={`${fmtInr(summary.approved.totalNetAmount)} paid out`}
          tone="emerald"
        />

        <StatCard
          label="REJECTED REQUESTS"
          value={summary.rejected.count}
          helper={`${fmtInr(summary.rejected.totalAmount)} rejected/refunded`}
          tone="red"
        />

        <StatCard
          label="TOTAL WITHDRAWALS"
          value={summary.all.count}
          helper={`${fmtInr(summary.all.totalAmount)} requested total`}
          tone="fuchsia"
        />
      </section>

      {/* Amount Details */}
      <section className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className={`${kpiCardBase} p-5`}>
          <div className="text-xs tracking-[0.18em] text-white/50">
            PENDING NET PAYOUT
          </div>

          <div className="mt-3 text-2xl font-semibold text-amber-200">
            {fmtInr(summary.pending.totalNetAmount)}
          </div>

          <div className="mt-2 text-xs text-white/45">
            Fee: {fmtInr(summary.pending.totalServiceFee)}
          </div>
        </div>

        <div className={`${kpiCardBase} p-5`}>
          <div className="text-xs tracking-[0.18em] text-white/50">
            APPROVED GROSS AMOUNT
          </div>

          <div className="mt-3 text-2xl font-semibold text-emerald-200">
            {fmtInr(summary.approved.totalAmount)}
          </div>

          <div className="mt-2 text-xs text-white/45">
            Fee collected: {fmtInr(summary.approved.totalServiceFee)}
          </div>
        </div>

        <div className={`${kpiCardBase} p-5`}>
          <div className="text-xs tracking-[0.18em] text-white/50">
            REJECTED/REFUNDED AMOUNT
          </div>

          <div className="mt-3 text-2xl font-semibold text-red-200">
            {fmtInr(summary.rejected.totalAmount)}
          </div>

          <div className="mt-2 text-xs text-white/45">
            Returned to wallet on reject
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className={`${kpiCardBase} mt-6 p-4`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-3 text-sm text-white placeholder:text-white/35 focus:border-white/20 focus:outline-none"
              placeholder="Search by user name, email, bank, IFSC, amount, or withdrawal ID..."
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {(["all", "Pending", "Completed", "Failed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={[
                  "h-10 whitespace-nowrap rounded-xl border px-4 text-sm",
                  statusFilter === s
                    ? s === "Pending"
                      ? "border-amber-500/30 bg-amber-500/20 text-amber-200"
                      : s === "Completed"
                      ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-200"
                      : s === "Failed"
                      ? "border-red-500/30 bg-red-500/20 text-red-200"
                      : "border-transparent bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] text-white"
                    : "border-white/10 bg-white/[0.03] text-white/70 hover:text-white",
                ].join(" ")}
              >
                {s === "all"
                  ? "All"
                  : s === "Completed"
                  ? "Approved"
                  : s === "Failed"
                  ? "Rejected"
                  : s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Desktop View */}
      <div className="hidden md:block">
        <section className={`${kpiCardBase} mt-6 p-4 xl:p-5`}>
          {loading && (
            <div className="text-sm text-white/70">Loading withdrawals...</div>
          )}

          {!!error && !loading && (
            <div className="text-sm text-red-400">{error}</div>
          )}

          {!loading && !error && (
            <>
              <div className="space-y-3">
                {pageRows.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3"
                  >
                    <div className="grid grid-cols-[1.15fr_0.85fr_0.85fr_0.65fr_0.85fr_190px] items-center gap-2 xl:gap-3">
                      {/* User */}
                      <div className="min-w-0">
                        <div className="text-[9px] uppercase tracking-[0.14em] text-white/35">
                          User
                        </div>

                        <div className="mt-2 flex min-w-0 items-center gap-2">
                          <img
                            src={
                              r.userAvatar ||
                              "https://i.pravatar.cc/80?img=12"
                            }
                            alt={r.userName}
                            className="h-8 w-8 shrink-0 rounded-full border border-white/10 object-cover"
                          />

                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-medium text-white/90">
                              {r.userName}
                            </div>

                            <div className="truncate text-[11px] text-white/45">
                              {r.userEmail}
                            </div>

                            <div className="truncate text-[9px] text-white/30">
                              ID: {r.id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bank / UPI */}
                      <div className="min-w-0">
                        <div className="text-[9px] uppercase tracking-[0.14em] text-white/35">
                          {r.payoutMethod === "upi" ? "UPI" : "Bank"}
                        </div>

                        {r.payoutMethod === "upi" ? (
                          <div className="mt-2 truncate text-[13px] text-white/85">
                            {r.upiId || "—"}
                          </div>
                        ) : (
                          <>
                            <div className="mt-2 truncate text-[13px] text-white/85">
                              {r.bankName}
                            </div>

                            <div className="text-[11px] text-white/45">
                              •••• {r.accountLast4}
                            </div>

                            <div className="truncate text-[9px] text-white/35">
                              IFSC: {r.ifscCode || "—"}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="min-w-0">
                        <div className="text-[9px] uppercase tracking-[0.14em] text-white/35">
                          Amount
                        </div>

                        <div className="mt-2 truncate text-[13px] font-semibold text-white">
                          {fmtInr(r.amount)}
                        </div>

                        <div className="truncate text-[9px] text-white/45">
                          Fee: {fmtInr(r.serviceFee)}
                        </div>

                        <div className="truncate text-[9px] text-emerald-300">
                          Net: {fmtInr(r.netAmount)}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="min-w-0">
                        <div className="text-[9px] uppercase tracking-[0.14em] text-white/35">
                          Status
                        </div>

                        <div className="mt-2">
                          <span
                            className={[
                              "inline-flex rounded-full border px-2 py-1 text-[10px] font-medium",
                              getStatusTone(r.status),
                            ].join(" ")}
                          >
                            {getStatusLabel(r.status)}
                          </span>
                        </div>
                      </div>

                      {/* Requested */}
                      <div className="min-w-0">
                        <div className="text-[9px] uppercase tracking-[0.14em] text-white/35">
                          Requested
                        </div>

                        <div className="mt-2 text-[11px] leading-4 text-white/65">
                          {formatDateTime(r.createdAt)}
                        </div>

                        {r.processedAt && (
                          <div className="mt-1 truncate text-[9px] text-white/35">
                            Processed: {formatDateTime(r.processedAt)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="min-w-0">
                        <div className="text-right text-[9px] uppercase tracking-[0.14em] text-white/35">
                          Actions
                        </div>

                        <div className="mt-2 flex items-center justify-end gap-2">
                          {r.status === "Pending" ? (
                            <>
                              <button
                                onClick={() =>
                                  setConfirmPopup({
                                    type: "approve",
                                    row: r,
                                  })
                                }
                                disabled={actionLoading === r.id}
                                className="h-8 w-[86px] shrink-0 rounded-lg border border-emerald-500/30 bg-emerald-500/20 text-[11px] font-medium text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-50"
                              >
                                ✓ Approve
                              </button>

                              <button
                                onClick={() =>
                                  setConfirmPopup({
                                    type: "reject",
                                    row: r,
                                  })
                                }
                                disabled={actionLoading === r.id}
                                className="h-8 w-[76px] shrink-0 rounded-lg border border-red-500/25 bg-red-500/15 text-[11px] font-medium text-red-300 hover:bg-red-500/25 disabled:opacity-50"
                              >
                                ✕ Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-xs italic text-white/40">
                              {r.status === "Completed"
                                ? "Paid out"
                                : "Refunded"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {pageRows.length === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center text-sm text-white/60">
                    {statusFilter === "Pending"
                      ? "No pending withdrawal requests."
                      : "No withdrawal requests found."}
                  </div>
                )}
              </div>

              {total > 0 && (
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-white/60">
                    Showing {total === 0 ? 0 : startIndex + 1} to {endIndex} of{" "}
                    {total} withdrawals
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={safePage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="h-9 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm hover:bg-white/[0.06] disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <span className="text-xs text-white/50">
                      Page {safePage} / {totalPages}
                    </span>

                    <button
                      disabled={safePage >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="h-9 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm hover:bg-white/[0.06] disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Mobile Cards */}
      <div className="mt-6 space-y-4 md:hidden">
        {loading && <div className="text-sm text-white/70">Loading...</div>}

        {!!error && !loading && (
          <div className="text-sm text-red-400">{error}</div>
        )}

        {!loading &&
          !error &&
          pageRows.map((r) => (
            <div key={r.id} className={`${kpiCardBase} p-5`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={r.userAvatar || "https://i.pravatar.cc/80?img=12"}
                    alt={r.userName}
                    className="h-10 w-10 shrink-0 rounded-full border border-white/10 object-cover"
                  />

                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white/90">
                      {r.userName}
                    </div>

                    <div className="truncate text-xs text-white/50">
                      {r.userEmail}
                    </div>
                  </div>
                </div>

                <span
                  className={[
                    "shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
                    getStatusTone(r.status),
                  ].join(" ")}
                >
                  {getStatusLabel(r.status)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-white/45">
                    Amount
                  </div>

                  <div className="mt-1 text-base font-semibold text-white">
                    {fmtInr(r.amount)}
                  </div>

                  <div className="text-xs text-white/40">
                    Fee: {fmtInr(r.serviceFee)}
                  </div>

                  <div className="text-xs text-emerald-300">
                    Net: {fmtInr(r.netAmount)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wide text-white/45">
                    {r.payoutMethod === "upi" ? "UPI" : "Bank"}
                  </div>

                  {r.payoutMethod === "upi" ? (
                    <div className="mt-1 text-sm text-white/80">
                      {r.upiId || "—"}
                    </div>
                  ) : (
                    <>
                      <div className="mt-1 text-sm text-white/80">
                        {r.bankName}
                      </div>

                      <div className="text-xs text-white/40">
                        •••• {r.accountLast4}
                      </div>

                      <div className="text-xs text-white/35">
                        {r.ifscCode || "—"}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-3 text-xs text-white/40">
                Requested: {formatDateTime(r.createdAt)}
              </div>

              {r.status === "Pending" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() =>
                      setConfirmPopup({
                        type: "approve",
                        row: r,
                      })
                    }
                    disabled={actionLoading === r.id}
                    className="h-11 flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/20 text-sm font-medium text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-50"
                  >
                    ✓ Approve
                  </button>

                  <button
                    onClick={() =>
                      setConfirmPopup({
                        type: "reject",
                        row: r,
                      })
                    }
                    disabled={actionLoading === r.id}
                    className="h-11 flex-1 rounded-xl border border-red-500/25 bg-red-500/15 text-sm font-medium text-red-300 hover:bg-red-500/25 disabled:opacity-50"
                  >
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          ))}

        {!loading && !error && pageRows.length === 0 && (
          <div className="py-8 text-center text-sm text-white/60">
            {statusFilter === "Pending"
              ? "No pending requests."
              : "No withdrawals found."}
          </div>
        )}

        {total > pageSize && (
          <div className="flex items-center justify-between pt-2">
            <button
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-9 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm disabled:opacity-40"
            >
              Previous
            </button>

            <div className="text-xs text-white/60">
              Page {safePage} / {totalPages}
            </div>

            <button
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-9 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
};




  return (
    <div className="min-h-screen w-full bg-[#07080B] text-white font-inter">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07080B]/80 backdrop-blur">
        {/* Full width, not a centred 1200px box.
            Brand + eight nav items + the actions cluster came to ~1,250px, so
            inside a 1200px container the row spilled 52px past the right edge
            and the whole page scrolled sideways. The nav also has to be allowed
            to shrink (min-w-0) or a flex child refuses to go below its content
            width and pushes the overflow back. */}
        <div className="w-full px-4 sm:px-6">
          <div className="h-[74px] flex items-center gap-2">

            {/* LEFT: Brand */}
            <div className="flex items-center shrink-0">
              <div className="text-white font-semibold tracking-wide whitespace-nowrap">
                Tokun Admin
              </div>
            </div>

            {/* The nav moved to the sidebar on the left. It lived here as a
                centred row of eight items, which at this width had to be
                shrunk to px-2 with nowrap and still overflowed — a list that
                grows sideways is the wrong shape for a section list that keeps
                growing. */}

            

            {/* RIGHT: Actions. shrink-0 so it keeps its size and the nav in the
                middle gives way instead — the account menu is the one thing
                here that must never be clipped. */}
            <div className="flex items-center gap-3 ml-auto shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative h-10 w-10 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] flex items-center justify-center"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5 text-white/80" />
                    {adminUnreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 grid place-items-center rounded-full">
                        {adminUnreadCount > 9 ? "9+" : adminUnreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[360px] bg-[#0F1117] border border-white/10 text-white p-2">
                  <div className="flex items-center justify-between px-2 py-2">
                    <span className="font-semibold text-sm">Notifications</span>
                    {adminUnreadCount > 0 && (
                      <button
                        type="button"
                        className="text-xs text-white/70 hover:text-white"
                        onClick={markAllAdminNotificationsRead}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-white/10 max-h-[360px] overflow-y-auto">
                    {adminNotifications.length === 0 ? (
                      <div className="text-center text-white/50 py-8 text-sm">No notifications yet</div>
                    ) : (
                      adminNotifications.slice(0, 15).map((n) => (
                        <button
                          key={n._id}
                          onClick={() => !n.read && markAdminNotificationRead(n._id)}
                          className="w-full flex items-start gap-3 px-2 py-3 rounded-md hover:bg-white/5 text-left"
                        >
                          <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.read ? "bg-blue-500" : "bg-transparent"}`} />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">
                              {n.promptId?.title || (n.type === "ADMIN_PROMPT_REPORTED" ? "New report" : n.type === "ADMIN_PROMPT_FLAGGED" ? "Auto-flagged upload" : "Notification")}
                            </div>
                            <div className="text-xs text-white/60 line-clamp-2">{n.message}</div>
                          </div>
                          <span className="ml-auto text-[11px] text-white/40 shrink-0">
                            {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => { window.location.href = "/admin/notifications"; }}
                    className="w-full text-center text-xs font-medium text-white/70 hover:text-white py-2 mt-1 border-t border-white/10"
                  >
                    View all notifications
                  </button>
                </DropdownMenuContent>
              </DropdownMenu>

          {/* Both queues carry a count, and go colour when there's something in
              them — amber for refunds, fuchsia for disputes. Two identical grey
              pills told an admin nothing about whether either needed opening. */}
          <button
            onClick={() => { window.location.href = "/admin/refunds"; }}
            className={`h-10 px-4 rounded-full border flex items-center gap-2 text-sm transition ${
              queueCounts.refunds > 0
                ? "border-[#FABC4E]/40 bg-[#FABC4E]/[0.10] text-[#FABC4E] hover:bg-[#FABC4E]/[0.16]"
                : "border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.06]"
            }`}
          >
            Refunds
            {queueCounts.refunds > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#FABC4E] text-[#07080B] text-[11px] font-bold grid place-items-center">
                {queueCounts.refunds}
              </span>
            )}
          </button>

          {/* Cancellations the two parties couldn't split between themselves.
              Separate from Refunds because that queue is prompt purchases —
              a yes/no on a fixed amount — whereas this one is a judgement
              about how much of a job was actually done. */}
          <button
            onClick={() => { window.location.href = "/admin/disputes"; }}
            className={`h-10 px-4 rounded-full border flex items-center gap-2 text-sm transition ${
              queueCounts.disputes > 0
                ? "border-[#C084FC]/40 bg-[#C084FC]/[0.10] text-[#C084FC] hover:bg-[#C084FC]/[0.16]"
                : "border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.06]"
            }`}
          >
            Disputes
            {queueCounts.disputes > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#C084FC] text-[#07080B] text-[11px] font-bold grid place-items-center">
                {queueCounts.disputes}
              </span>
            )}
          </button>

          <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button className="h-10 px-4 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] flex items-center gap-2">
      <span className="text-sm text-white/80">Hello, {adminName}</span>
      <ChevronDown className="h-4 w-4 text-white/70" />
    </button>
  </DropdownMenuTrigger>
<DropdownMenuContent
  align="end"
  className="w-44 rounded-xl border border-white/10 bg-[#0B0D12] text-white shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
>
  <DropdownMenuItem
    onClick={() => setActive("account")}
    className="cursor-pointer focus:bg-white/[0.06]"
  >
    Account
  </DropdownMenuItem>

</DropdownMenuContent>

</DropdownMenu>


            </div>
          </div>
        </div>
      </header>

      {/* Body */}
 
{/* Body */}
<div className="w-full">
  <div className="flex w-full">

    {/* ── PRIMARY NAV ──────────────────────────────────────────────────────
        A vertical list, because the set of admin sections keeps growing and a
        horizontal row does not. Each new item here costs one row of height
        nobody notices, where across the top it cost width the page did not
        have. Sticky and self-scrolling so it stays put no matter how long the
        page beside it gets. */}
    <aside className="hidden md:flex flex-col w-[228px] shrink-0 border-r border-white/[0.07] bg-white/[0.015]">
      <nav className="sticky top-[74px] max-h-[calc(100vh-74px)] overflow-y-auto no-scrollbar px-3 py-5 flex flex-col gap-0.5">
        {ADMIN_NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-1">
            <p className="px-3 pt-3 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/25">
              {section.title}
            </p>
            {section.items.map((item) => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={[
                    "group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors relative",
                    isActive
                      ? "bg-white/[0.07] text-white font-medium"
                      : "text-white/55 hover:text-white hover:bg-white/[0.04]",
                  ].join(" ")}
                >
                  {/* The active marker is a bar, not just a colour — colour
                      alone is the one cue some people can't use. */}
                  <span
                    className={[
                      "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r",
                      isActive ? "bg-[#4F86F7]" : "bg-transparent",
                    ].join(" ")}
                  />
                  <span className={isActive ? "text-[#4F86F7]" : "text-white/40 group-hover:text-white/70"}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>

    {/* ✅ LEFT: Always-visible Reports Sidebar */}
  {/* ✅ LEFT: Reports Sidebar (DESKTOP ONLY) */}
{/* The reports queue is a SECOND panel, and it belongs to one section.
        It used to render on every tab, so with the primary nav now on the left
        the page carried 608px of chrome before the content started — the
        dashboard itself was squeezed into whatever was left. It opens when you
        open Reports, and gets out of the way otherwise. */}
    {active === "reports" && (
      <div className="hidden md:block w-[340px] shrink-0 border-r border-white/[0.07] pl-5 pr-4 py-8">
        <div className="sticky top-[90px] h-[calc(100vh-110px)]">
          <ReportsSidebar />
        </div>
      </div>
    )}


    {/* ✅ RIGHT: Pages (never broken by sidebar) */}
{/* `md:pl-0` was here because the reports panel used to supply the left
        gap on every page. It doesn't render on most pages any more, so without
        real padding the content sat flush against the nav. */}
<main className="flex-1 min-w-0 py-8 px-5 sm:px-6 lg:px-8 pb-24 md:pb-10">

   <div className={active === "reports" ? "w-full" : "mx-auto max-w-[1320px]"}>


              {active === "dashboard" && currentView === "seller" && selectedSellerMain && (
                <SellerProfileView
                  seller={selectedSellerMain}
                  products={sellerMainProducts}
                  loading={sellerMainLoading}
                  error={sellerMainError}
                  onBack={closeSellerMainProfile}
                  onToggleSuspend={handleSellerMainSuspendToggle}
                  suspendLoading={sellerMainSuspendLoading}
                  suspendError={sellerMainSuspendError}
                />
              )}

              {active === "dashboard" && currentView === "seller" && !selectedSellerMain && (
  <>
    {/* Title Row */}

   {/* Title Row */}
{/* ✅ Dashboard Header (Desktop aligned like your screenshot) */}
 
<div className="mt-2 md:mt-0">
  <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-3 md:gap-6">
    {/* LEFT: Title */}
    <div className="text-center md:text-left w-full">
      <h1 className="text-[24px] md:text-[34px] leading-[1.05] font-semibold">
        Dashboard
      </h1>
      <p className="mt-1 text-white/60 text-sm">Admin Overview</p>
    </div>

    {/* CENTER: Seller/User pills */}
    <div className="flex justify-center w-full">
      <div className="flex flex-row items-center justify-center gap-2">
        <button
          onClick={() => setCurrentView("seller")}
          className={[
            "h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2",
            currentView === "seller"
              ? "bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
              : "bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]",
          ].join(" ")}
        >
          <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Seller
        </button>

        <button
          onClick={() => setCurrentView("user")}
          className={[
            "h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2",
            currentView === "user"
              ? "bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
              : "bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]",
          ].join(" ")}
        >
          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          User
        </button>

        <button
          onClick={() => setCurrentView("org")}
          className={[
            "h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2",
            currentView === "org"
              ? "bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
              : "bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]",
          ].join(" ")}
        >
          <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Org
        </button>
      </div>
    </div>
  </div>
</div>





    {/* KPI Cards */}
    <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className={`${kpiCardBase} p-6`}>
        <div className="text-xs tracking-[0.2em] text-white/60">
          TOTAL REVENUE <span className="normal-case tracking-normal text-white/35">(Tokun's commission)</span>
        </div>
        <div className="mt-4 flex items-end justify-between gap-2 flex-wrap">
          {/* TOTAL REVENUE — Tokun's own commission cut (5% of prompt sales + hire deals), not seller payouts */}
<div className="text-2xl font-semibold whitespace-nowrap">
  {platformRevenueLoading ? "…" : `₹${platformRevenue.totalRevenue.toLocaleString()}`}
</div>
          <div className="text-sm text-white/50 font-medium whitespace-nowrap">
            ₹{platformRevenue.availableBalance.toLocaleString()} available
          </div>
        </div>
      </div>

      <div className={`${kpiCardBase} p-6`}>
        <div className="text-xs tracking-[0.2em] text-white/60">
          ACTIVE SELLERS
        </div>
        <div className="mt-4 flex items-end justify-between">
          {/* ACTIVE SELLERS (now total sellers) */}
<div className="text-3xl font-semibold">
  {stats.totalSellers}
</div>
          <div className="text-sm text-emerald-400 font-medium">
            +5%
          </div>
        </div>
      </div>

      <div className={`${kpiCardBase} p-6`}>
        <div className="text-xs tracking-[0.2em] text-white/60">
          PENDING APPROVALS
        </div>
        <div className="mt-4 flex items-end justify-between">
        <div className="text-3xl font-semibold">{pendingSellersCount}</div>
          <div className="text-sm text-fuchsia-300 font-medium">
            New submissions
          </div>
        </div>
      </div>

      <div className={`${kpiCardBase} p-6`}>
        <div className="text-xs tracking-[0.2em] text-white/60">
          DIGITAL PRODUCTS
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div className="text-3xl font-semibold">
            {products.length || 0}
          </div>
          <div className="text-sm text-emerald-400 font-medium">
            Live count
          </div>
        </div>
      </div>
    </section>

    {/* ── Revenue charts ────────────────────────────────────────────────────
        Built from platformRevenue.transactions — the real ledger, not a
        sample. The number cards above answer "how much"; these answer "when"
        and "from where", which a column of totals cannot.

        Palette note: the brand magenta/blue pair FAILS a colourblind check
        against each other (ΔE 1.8 under protanopia — indistinguishable), so
        the series colours here are a separately validated set. */}
    <RevenueCharts transactions={platformRevenue.transactions} loading={platformRevenueLoading} />

    {/* Platform Revenue — Tokun's own commission wallet + withdraw */}
    <section className={`${kpiCardBase} mt-6 p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Tokun Platform Revenue</h2>
          <p className="mt-1 text-sm text-white/55">
            3% buyer platform fee on every sale, plus 10% seller commission on services and
            hire deals. Earnings only — GST is tracked separately and is not yours to withdraw.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full lg:w-auto">
          <div>
            <div className="text-xs text-white/50">Available</div>
            <div className="text-2xl font-semibold">₹{platformRevenue.availableBalance.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-white/50">Withdrawn so far</div>
            <div className="text-2xl font-semibold text-white/70">₹{platformRevenue.totalWithdrawn.toLocaleString()}</div>
          </div>
          {/* Deliberately not folded into the numbers beside it — this is a
              liability, and an admin reading it as profit would over-report. */}
          <div>
            <div className="text-xs text-white/50">GST collected</div>
            <div className="text-2xl font-semibold text-[#FABC4E]">
              ₹{platformRevenue.gstCollected.toLocaleString()}
            </div>
            <div className="text-[11px] text-white/35">payable, not earnings</div>
          </div>
          <button
            onClick={() => { setWithdrawAmount(""); setWithdrawNote(""); setWithdrawModalOpen(true); }}
            disabled={platformRevenue.availableBalance <= 0}
            className="w-full sm:w-auto sm:ml-auto whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(270deg,#7c3aed,#2563eb)" }}
          >
            Mark as Withdrawn
          </button>
        </div>
      </div>

      {platformRevenue.transactions.length > 0 && (
        <div className="mt-5 max-h-56 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 text-xs">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {platformRevenue.transactions.map((t) => (
                <tr key={t._id} className="border-t border-white/5">
                  <td className="py-2 text-white/60">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 text-white/60 capitalize">{t.type}</td>
                  <td className="py-2 text-white/80">{t.description}</td>
                  <td className={`py-2 text-right font-medium ${t.type === "withdrawal" ? "text-red-300" : "text-emerald-300"}`}>
                    {t.type === "withdrawal" ? "-" : "+"}₹{t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>

    {withdrawModalOpen && (
      <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 px-4" onClick={() => setWithdrawModalOpen(false)}>
        <div
          className="w-full max-w-[420px] rounded-2xl bg-[#141416] border border-white/10 p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold text-white">Mark as Withdrawn</h3>
          <p className="mt-1 text-sm text-white/55">
            Record that this amount was manually transferred to Tokun's bank account. Available: ₹{platformRevenue.availableBalance.toLocaleString()}
          </p>

          <label className="mt-4 block text-sm text-white/70">Amount (₹)</label>
          <input
            type="number"
            min={0}
            max={platformRevenue.availableBalance}
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-white/10"
            placeholder="0.00"
          />

          <label className="mt-3 block text-sm text-white/70">Note (optional)</label>
          <input
            type="text"
            value={withdrawNote}
            onChange={(e) => setWithdrawNote(e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-white/10"
            placeholder="e.g. Transferred to HDFC a/c ending 4321"
          />

          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={() => setWithdrawModalOpen(false)}
              className="rounded-lg px-4 py-2 text-sm text-white/70 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleMarkWithdrawn}
              disabled={
                withdrawSubmitting ||
                !Number(withdrawAmount) ||
                Number(withdrawAmount) <= 0 ||
                Number(withdrawAmount) > platformRevenue.availableBalance
              }
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(270deg,#7c3aed,#2563eb)" }}
            >
              {withdrawSubmitting ? "Saving…" : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Chart + Activities */}
    <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Seller Trends — real seller signal, two single-metric charts (not one dual-scale chart) */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className={`${kpiCardBase} p-6`}>
          <h2 className="text-base font-semibold">Seller Earnings</h2>
          <p className="mt-1 text-xs text-white/55">Monthly payout to sellers (₹), last 6 months</p>
          <div className="mt-4 h-[260px] w-full">
            {sellerTrendsLoading ? (
              <div className="h-full flex items-center justify-center text-sm text-white/50">Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sellerTrendsData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sellerEarningsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3987e5" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3987e5" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Seller Earnings"]}
                    contentStyle={{ background: "rgba(10,12,16,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "white" }}
                    labelStyle={{ color: "rgba(255,255,255,0.75)" }}
                  />
                  <Area type="monotone" dataKey="sellerEarnings" name="Seller Earnings" stroke="#3987e5" strokeWidth={2} fill="url(#sellerEarningsFill)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className={`${kpiCardBase} p-6`}>
          <h2 className="text-base font-semibold">Active Sellers</h2>
          <p className="mt-1 text-xs text-white/55">Distinct sellers with a sale that month</p>
          <div className="mt-4 h-[260px] w-full">
            {sellerTrendsLoading ? (
              <div className="h-full flex items-center justify-center text-sm text-white/50">Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sellerTrendsData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    formatter={(v: any) => [v, "Active Sellers"]}
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    contentStyle={{ background: "rgba(10,12,16,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "white" }}
                    labelStyle={{ color: "rgba(255,255,255,0.75)" }}
                  />
                  <Bar dataKey="activeSellers" name="Active Sellers" fill="#199e70" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
     {/* Recent Activities — SELLER VIEW */}
<div className={`${kpiCardBase} p-6`}>
  <h2 className="text-lg font-semibold">Recent Activities</h2>

  <div className="mt-6 space-y-4">
    {activitiesLoading && (
      <div className="text-white/70 text-sm">Loading activities…</div>
    )}

    {!!activitiesError && !activitiesLoading && (
      <div className="text-red-400 text-sm">{activitiesError}</div>
    )}

  {!activitiesLoading && !activitiesError && recentActivitiesPreview.length === 0 && (
  <div className="text-white/60 text-sm">No recent activity found.</div>
)}

{!activitiesLoading && !activitiesError && recentActivitiesPreview.map((a) => {
      const meta = activityMeta(a.type);
      return (
        <div key={a.id} className="flex gap-4">
          <div className={[
            "h-9 w-9 rounded-full border flex items-center justify-center shrink-0",
            meta.iconBg,
          ].join(" ")}>
            {meta.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white/90">{a.title}</div>
            {a.desc && (
              <div className="text-xs text-white/55 mt-1 truncate">{a.desc}</div>
            )}
            <div className="text-[11px] text-white/40 mt-1">
              {timeAgo(a.createdAt)}
            </div>
          </div>
        </div>
      );
    })}
  </div>
<button
  onClick={() => setShowAllActivities(true)}
  className="mt-6 w-full h-10 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80"
>
  View Activity Log
</button>

</div>
    </section>

    {/* Sales by Category — top 6 categories + "Other", stacked per month */}
    <section className={`${kpiCardBase} mt-6 p-6`}>
      <div>
        <h2 className="text-lg font-semibold">Sales by Category</h2>
        <p className="mt-1 text-sm text-white/55">
          Which categories are selling the most, month by month (top 6 + Other)
        </p>
      </div>

      <div className="mt-6 h-[340px] w-full">
        {categorySalesLoading ? (
          <div className="h-full flex items-center justify-center text-sm text-white/50">
            Loading…
          </div>
        ) : categorySalesSeries.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-white/50">
            No sales yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categorySalesData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }} barCategoryGap="20%">
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{
                  background: "rgba(10,12,16,0.95)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  color: "white",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.75)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}
                iconType="circle"
                iconSize={8}
              />
              {categorySalesSeries.map((name, i) => {
                const isTopSegment = i === categorySalesSeries.length - 1;
                const color = name === "Other" ? CATEGORY_SALES_COLORS[6] : CATEGORY_SALES_COLORS[i % 6];
                return (
                  <Bar
                    key={name}
                    dataKey={name}
                    stackId="sales"
                    fill={color}
                    radius={isTopSegment ? [3, 3, 0, 0] : undefined}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>

    {/* ✅ Sellers List (Dashboard → Seller toggle) — same look as SellersView table */}
<section className={`${kpiCardBase} mt-6 p-6`}>
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-lg font-semibold">Sellers List</h2>
      <p className="mt-1 text-sm text-white/55">
        A quick snapshot of sellers (same table styling as Seller Management)
      </p>
    </div>

    <button
      onClick={() => setShowAllSellers(true)}
      className="text-sm text-[#3A7CFF] hover:underline"
    >
      View All
    </button>
  </div>

  <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
    {/* Desktop header only */}
    <div className="hidden md:grid md:grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
  <div className="md:col-span-3">Seller</div>
  <div className="md:col-span-2">Plan</div>
  <div className="md:col-span-1">Purchased</div>
  <div className="md:col-span-1">Uploaded</div>
  <div className="md:col-span-2">Volume</div>
  <div className="md:col-span-2">Status</div>
  <div className="md:col-span-1 text-right">Actions</div>
</div>

    <div className="divide-y divide-white/10">
      {sellersLoading && (
        <div className="p-6 text-white/70 text-sm">Loading sellers…</div>
      )}

      {!!sellersError && !sellersLoading && (
        <div className="p-6 text-red-400 text-sm">{sellersError}</div>
      )}

      {!sellersLoading && !sellersError && (
        <>
        {(sellerRows || []).slice(0, 10).map((r) => (
  <div key={r.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-5 py-5 bg-white/[0.02]">
    {/* Seller */}
    <div className="md:col-span-3 flex items-center gap-3 min-w-0">
      <img
        src={r.avatar || "https://i.pravatar.cc/80?img=12"}
        alt={r.name}
        className="h-10 w-10 rounded-full object-cover border border-white/10 shrink-0"
      />
      <div className="min-w-0">
        <button
          onClick={() => openSellerMainProfile(r.id)}
          className="block max-w-full text-left text-sm font-medium text-white/90 truncate hover:text-sky-400 focus:outline-none"
        >
          {r.name}
        </button>
        <div className="text-xs text-white/45 truncate">{r.email}</div>
      </div>
    </div>

    {/* Plan */}
    <div className="md:col-span-2 flex items-center">
      <span
        className={[
          "px-3 py-1 rounded-full text-xs font-medium border",
          planBadgeClass(planLabel(r.userType, r.plan)),
        ].join(" ")}
      >
        {planLabel(r.userType, r.plan)}
      </span>
    </div>

    {/* Purchased */}
    <div className="md:col-span-1 text-sm text-white/75 flex items-center">
      {r.buyProducts ?? 0}
    </div>

    {/* Uploaded */}
    <div className="md:col-span-1 text-sm text-white/75 flex items-center">
      {r.totalProducts ?? 0}
    </div>

    {/* Volume */}
    <div className="md:col-span-2 text-sm text-white/80 font-medium flex items-center">
      ₹{Number(r.volume ?? 0).toLocaleString("en-IN")}
    </div>

    {/* Status */}
    <div className="md:col-span-2 flex items-center">
      <span className={[
        "px-4 py-1.5 rounded-full text-xs font-medium border inline-flex",
        r.status === "Active"
          ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
          : "bg-red-500/15 text-red-200 border-red-500/25",
      ].join(" ")}>
        {r.status}
      </span>
    </div>

    {/* Actions */}
    <div className="md:col-span-1 flex items-center justify-end gap-2">
      <button
        className="text-xs text-red-400 hover:text-red-300"
        onClick={() => console.log("block", r.id)}
      >
        Block
      </button>
      <button
        className="text-white/50 hover:text-white/80"
        onClick={() => console.log("delete", r.id)}
      >
        🗑
      </button>
    </div>
  </div>
))}

          {(sellerRows || []).length === 0 && (
            <div className="p-6 text-white/60 text-sm">No sellers found.</div>
          )}
        </>
      )}
    </div>
  </div>

  {!sellersLoading && !sellersError && (sellerRows || []).length > 0 && (
    <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="text-sm text-white/60">
        Showing 1 to {Math.min(10, sellerRows.length)} of {sellerRows.length} sellers
      </div>

      <button
        onClick={() => setShowAllSellers(true)}
        className="h-9 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm text-white/80"
      >
        View All
      </button>
    </div>
  )}
</section>
  
  </>
)}


 {active === "dashboard" && currentView === "user" && selectedUser && (
  <UserProfileView
    user={selectedUser}
    bought={userBought}
    uploaded={userUploaded}
    loading={userProfileLoading}
    error={userProfileError}
    onBack={closeUserProfile}
    onToggleSuspend={handleUserSuspendToggle}
    suspendLoading={userSuspendLoading}
    suspendError={userSuspendError}
  />
)}

 {active === "dashboard" && currentView === "user" && !selectedUser && (
  <>


<div className="mt-2 md:mt-0">
  <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-3 md:gap-6">
    {/* LEFT: Title */}
    <div className="text-center md:text-left w-full">
      <h1 className="text-[24px] md:text-[34px] leading-[1.05] font-semibold">
        Dashboard
      </h1>
      <p className="mt-1 text-white/60 text-sm">Admin Overview</p>
    </div>

    {/* CENTER: Seller/User pills */}
    <div className="flex justify-center w-full">
      <div className="flex flex-row items-center justify-center gap-2">
        <button
          onClick={() => setCurrentView("seller")}
          className={[
            "h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2",
            currentView === "seller"
              ? "bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
              : "bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]",
          ].join(" ")}
        >
          <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Seller
        </button>

        <button
          onClick={() => setCurrentView("user")}
          className={[
            "h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2",
            currentView === "user"
              ? "bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
              : "bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]",
          ].join(" ")}
        >
          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          User
        </button>

        <button
          onClick={() => setCurrentView("org")}
          className={[
            "h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2",
            currentView === "org"
              ? "bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
              : "bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]",
          ].join(" ")}
        >
          <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Org
        </button>
      </div>
    </div>
  </div>
</div>



    {/* KPI Cards */}
    <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
     <div className={`${kpiCardBase} p-6`}>
  <div className="text-xs tracking-[0.2em] text-white/60">
    TOTAL USERS
  </div>

  <div className="mt-4 flex items-end justify-between">
    <div className="text-3xl font-semibold">
      {userTotal.toLocaleString()}
    </div>

    <div className="text-sm text-emerald-400 font-medium">
      +12%
    </div>
  </div>
</div>


      <div className={`${kpiCardBase} p-6`}>
        <div className="text-xs tracking-[0.2em] text-white/60">
          ACTIVE USERS
        </div>
        <div className="mt-4 flex items-end justify-between">
        <div className="text-3xl font-semibold">{activeUsersCount}</div>

          <div className="text-sm text-emerald-400 font-medium">
            +5%
          </div>
        </div>
      </div>

      <div className={`${kpiCardBase} p-6`}>
        <div className="text-xs tracking-[0.2em] text-white/60">
          PENDING APPROVALS
        </div>
        <div className="mt-4 flex items-end justify-between">
     <div className="text-3xl font-semibold">{pendingUsersCount}</div>
          <div className="text-sm text-fuchsia-300 font-medium">
            New submissions
          </div>
        </div>
      </div>

      <div className={`${kpiCardBase} p-6`}>
        <div className="text-xs tracking-[0.2em] text-white/60">
          DIGITAL PRODUCTS
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div className="text-3xl font-semibold">
            {products.length || 0}
          </div>
          <div className="text-sm text-emerald-400 font-medium">
            Live count
          </div>
        </div>
      </div>
    </section>

    {/* Chart + Activities */}
    <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* User Trends — real user signal, two single-metric charts (not the seller data relabeled) */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className={`${kpiCardBase} p-6`}>
          <h2 className="text-base font-semibold">New Signups</h2>
          <p className="mt-1 text-xs text-white/55">New user registrations per month</p>
          <div className="mt-4 h-[260px] w-full">
            {userTrendsLoading ? (
              <div className="h-full flex items-center justify-center text-sm text-white/50">Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userTrendsData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    formatter={(v: any) => [v, "New Signups"]}
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    contentStyle={{ background: "rgba(10,12,16,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "white" }}
                    labelStyle={{ color: "rgba(255,255,255,0.75)" }}
                  />
                  <Bar dataKey="newSignups" name="New Signups" fill="#3987e5" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className={`${kpiCardBase} p-6`}>
          <h2 className="text-base font-semibold">Buyer Spend</h2>
          <p className="mt-1 text-xs text-white/55">Total ₹ spent by users, per month</p>
          <div className="mt-4 h-[260px] w-full">
            {userTrendsLoading ? (
              <div className="h-full flex items-center justify-center text-sm text-white/50">Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userTrendsData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="buyerSpendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d55181" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#d55181" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Buyer Spend"]}
                    contentStyle={{ background: "rgba(10,12,16,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "white" }}
                    labelStyle={{ color: "rgba(255,255,255,0.75)" }}
                  />
                  <Area type="monotone" dataKey="totalSpend" name="Buyer Spend" stroke="#d55181" strokeWidth={2} fill="url(#buyerSpendFill)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      {/* Recent Activities — USER VIEW mein ye section fix karo */}
<div className={`${kpiCardBase} p-6`}>
  <h2 className="text-lg font-semibold">Recent Activities</h2>

  <div className="mt-6 space-y-4">
    {activitiesLoading && (
      <div className="text-white/70 text-sm">Loading activities…</div>
    )}

    {!!activitiesError && !activitiesLoading && (
      <div className="text-red-400 text-sm">{activitiesError}</div>
    )}

  {!activitiesLoading && !activitiesError && recentActivitiesPreview.length === 0 && (
  <div className="text-white/60 text-sm">No recent activity found.</div>
)}

{!activitiesLoading && !activitiesError && recentActivitiesPreview.map((a) => {
        const meta = activityMeta(a.type);
        return (
          <div key={a.id} className="flex gap-4">
            <div
              className={[
                "h-9 w-9 rounded-full border flex items-center justify-center shrink-0",
                meta.iconBg,
              ].join(" ")}
            >
              {meta.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-white/90">{a.title}</div>
              {a.desc && (
                <div className="text-xs text-white/55 mt-1 truncate">{a.desc}</div>
              )}
              <div className="text-[11px] text-white/40 mt-1">
                {timeAgo(a.createdAt)}
              </div>
            </div>
          </div>
        );
      })}
  </div>

 <button
  onClick={() => setShowAllActivities(true)}
  className="mt-6 w-full h-10 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80"
>
  View Activity Log
</button>
</div>
    </section>

{/* Users Table */}
<section className={`${kpiCardBase} mt-6 p-6`}>
  <div className="flex items-center justify-between gap-3">
    <div>
      <h2 className="text-lg font-semibold">Users Prompt Counts</h2>
    </div>
    <button
      onClick={() => setShowAllUsers(true)}
      className="shrink-0 text-sm text-[#3A7CFF] hover:underline"
    >
      View All
    </button>
  </div>

  <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
    {/* Desktop Header */}
   <div className="hidden md:grid md:grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
  <div className="md:col-span-3">User Name</div>
  <div className="md:col-span-2">Plan</div>
  <div className="md:col-span-2">Purchased Prompt</div>
  <div className="md:col-span-2">Uploaded Prompt</div>
  <div className="md:col-span-2">Joined Date</div>
  <div className="md:col-span-1 text-right">Actions</div>
</div>

    <div className="divide-y divide-white/10">
      {userLoading && (
        <div className="p-6 text-white/70 text-sm">Loading users…</div>
      )}

      {!!userError && !userLoading && (
        <div className="p-6 text-red-400 text-sm">{userError}</div>
      )}

  {!userLoading && !userError && userRows.map((u) => (
  <div
    key={u.id}
    onClick={() => openUserProfile(u.id, u)}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => { if (e.key === "Enter") openUserProfile(u.id, u); }}
    className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-5 py-5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.05] transition-colors"
  >

    {/* User Name */}
    <div className="md:col-span-3 flex items-center gap-3 min-w-0">
      <img
        src={u.avatar || "https://i.pravatar.cc/80?img=12"}
        alt={u.name}
        className="h-10 w-10 rounded-full object-cover border border-white/10 shrink-0"
      />
      <div className="min-w-0">
        <div className="text-sm font-medium text-white/90 truncate">{u.name}</div>
        <div className="text-xs text-white/45 truncate">{u.email}</div>
      </div>
    </div>

    {/* Plan */}
    <div className="md:col-span-2 flex items-center">
      <span
        className={[
          "px-3 py-1 rounded-full text-xs font-medium border",
          planBadgeClass(planLabel(u.userType, u.plan)),
        ].join(" ")}
      >
        {planLabel(u.userType, u.plan)}
      </span>
    </div>

    {/* Purchased Prompt */}
    <div className="md:col-span-2 text-sm text-white/75 flex items-center">
      {u.purchasedPrompts ?? u.buyProducts ?? 0}
    </div>

    {/* Uploaded Prompt */}
    <div className="md:col-span-2 text-sm text-white/75 flex items-center">
      {u.uploadedPrompts ?? u.saleProducts ?? 0}
    </div>

    {/* Joined Date */}
    <div className="md:col-span-2 text-sm text-white/75 flex items-center">
      {formatDate(u.createdAt)}
    </div>

    {/* Actions */}
    <div className="md:col-span-1 flex items-center justify-end gap-3">
      <button
        onClick={(e) => e.stopPropagation()}
        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
      >
        🚫 Block
      </button>
      <button
        onClick={(e) => e.stopPropagation()}
        className="text-white/50 hover:text-white/80 text-sm"
      >
        🗑
      </button>
    </div>
  </div>
))}
      {!userLoading && !userError && userRows.length === 0 && (
        <div className="p-6 text-white/60 text-sm">No users found.</div>
      )}
    </div>
  </div>

  {/* Search + Page Size */}
  <div className={`${kpiCardBase} mt-6 p-4`}>
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      <div className="flex-1 relative min-w-0">
        <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
          placeholder="Search users by name or email..."
        />
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
        <div className="text-sm text-white/60 shrink-0">Show</div>
        <select
          value={userPageSize}
          onChange={(e) => setUserPageSize(Number(e.target.value))}
          className="h-11 min-w-[90px] px-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none"
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
</section>
  </>
)}

{/* ── ORG VIEW: profile drill-down ── */}
{active === "dashboard" && currentView === "org" && selectedOrg && (
  <OrgProfileView
    org={selectedOrg}
    loading={orgProfileLoading}
    error={orgProfileError}
    onBack={closeOrgProfile}
    onToggleSuspend={handleOrgSuspendToggle}
    suspendLoading={orgSuspendLoading}
    suspendError={orgSuspendError}
  />
)}

{/* ── ORG VIEW: dashboard (KPIs + charts + list) ── */}
{active === "dashboard" && currentView === "org" && !selectedOrg && (
  <>
    <div className="mt-2 md:mt-0">
      <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-3 md:gap-6">
        <div className="text-center md:text-left w-full">
          <h1 className="text-[24px] md:text-[34px] leading-[1.05] font-semibold">Dashboard</h1>
          <p className="mt-1 text-white/60 text-sm">Admin Overview</p>
        </div>

        {/* CENTER: Seller/User/Org pills */}
        <div className="flex justify-center w-full">
          <div className="flex flex-row items-center justify-center gap-2">
            <button
              onClick={() => setCurrentView("seller")}
              className="h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]"
            >
              <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Seller
            </button>
            <button
              onClick={() => setCurrentView("user")}
              className="h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.08]"
            >
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              User
            </button>
            <button
              onClick={() => setCurrentView("org")}
              className="h-9 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] text-white"
            >
              <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Org
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* KPI Cards */}
    <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className={`${kpiCardBase} p-6`}>
        <div className="text-xs tracking-[0.2em] text-white/60">TOTAL ORGS</div>
        <div className="mt-4 flex items-end justify-between">
          <div className="text-3xl font-semibold">
            {orgSummaryLoading ? "…" : orgSummary?.kpis.totalOrgs ?? orgTotal}
          </div>
          <div className="text-sm text-white/50 font-medium">registered</div>
        </div>
      </div>

      <div className={`${kpiCardBase} p-6`}>
        <div className="text-xs tracking-[0.2em] text-white/60">ENTERPRISE ACTIVE</div>
        <div className="mt-4 flex items-end justify-between">
          <div className="text-3xl font-semibold">
            {orgSummaryLoading ? "…" : orgSummary?.kpis.enterpriseActive ?? 0}
          </div>
          <div className="text-sm text-emerald-400 font-medium">paying</div>
        </div>
      </div>

      <div className={`${kpiCardBase} p-6`}>
        <div className="text-xs tracking-[0.2em] text-white/60">TEAM SEATS USED</div>
        <div className="mt-4 flex items-end justify-between">
          <div className="text-3xl font-semibold">
            {orgSummaryLoading
              ? "…"
              : `${orgSummary?.kpis.seatsUsed ?? 0}/${orgSummary?.kpis.seatsTotal ?? 0}`}
          </div>
          <div className="text-sm text-fuchsia-300 font-medium">across orgs</div>
        </div>
      </div>

      <div className={`${kpiCardBase} p-6`}>
        <div className="text-xs tracking-[0.2em] text-white/60">TOKEN POOL USED</div>
        <div className="mt-4 flex items-end justify-between">
          <div className="text-3xl font-semibold">
            {orgSummaryLoading
              ? "…"
              : `${
                  orgSummary && orgSummary.kpis.poolCap > 0
                    ? Math.round((orgSummary.kpis.poolUsed / orgSummary.kpis.poolCap) * 100)
                    : 0
                }%`}
          </div>
          <div className="text-sm text-white/50 font-medium">
            {orgSummary
              ? `${(orgSummary.kpis.poolUsed || 0).toLocaleString()} / ${(orgSummary.kpis.poolCap || 0).toLocaleString()}`
              : "—"}
          </div>
        </div>
      </div>
    </section>

    {/* Charts */}
    <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className={`${kpiCardBase} p-6`}>
        <h2 className="text-base font-semibold">New Organizations</h2>
        <p className="mt-1 text-xs text-white/55">Orgs created per month</p>
        <div className="mt-4 h-[260px] w-full">
          {orgSummaryLoading ? (
            <div className="h-full flex items-center justify-center text-sm text-white/50">Loading…</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orgSummary?.trends || []} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(v: any) => [v, "New Orgs"]}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={{ background: "rgba(10,12,16,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "white" }}
                  labelStyle={{ color: "rgba(255,255,255,0.75)" }}
                />
                <Bar dataKey="newOrgs" name="New Orgs" fill="#8A4BFF" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className={`${kpiCardBase} p-6`}>
        <h2 className="text-base font-semibold">Subscription Status</h2>
        <p className="mt-1 text-xs text-white/55">Orgs by billing state</p>
        <div className="mt-4 h-[260px] w-full">
          {orgSummaryLoading ? (
            <div className="h-full flex items-center justify-center text-sm text-white/50">Loading…</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orgSummary?.statusBreakdown || []} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} tickLine={false} interval={0} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(v: any) => [v, "Orgs"]}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={{ background: "rgba(10,12,16,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "white" }}
                  labelStyle={{ color: "rgba(255,255,255,0.75)" }}
                />
                <Bar dataKey="count" name="Orgs" fill="#3987e5" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>

    {/* Org list */}
    <section className={`${kpiCardBase} mt-6 p-6`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Organizations</h2>
        <span className="text-sm text-white/50">{orgTotal} total</span>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
        <div className="hidden md:grid md:grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
          <div className="md:col-span-3">Organization</div>
          <div className="md:col-span-3">Owner</div>
          <div className="md:col-span-2">Plan / Status</div>
          <div className="md:col-span-1">Seats</div>
          <div className="md:col-span-2">Pool Used</div>
          <div className="md:col-span-1 text-right">Joined</div>
        </div>

        <div className="divide-y divide-white/10">
          {orgLoading && <div className="p-6 text-white/70 text-sm">Loading organizations…</div>}
          {!!orgError && !orgLoading && <div className="p-6 text-red-400 text-sm">{orgError}</div>}

          {!orgLoading && !orgError && orgRows.map((o) => {
            const seatsUsed = Math.max(0, o.teamMembersLimit - o.teamMembersLimitRemaining);
            const poolPct = o.orgPoolCap > 0 ? Math.round((o.orgPoolUsed / o.orgPoolCap) * 100) : 0;
            return (
              <div
                key={o.id}
                onClick={() => openOrgProfile(o.id, o)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") openOrgProfile(o.id, o); }}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-5 py-5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.05] transition-colors"
              >
                <div className="md:col-span-3 flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-white/70" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white/90 truncate">{o.name}</div>
                    <div className="text-xs text-white/45 truncate">{o.membersCount} members</div>
                  </div>
                </div>

                <div className="md:col-span-3 min-w-0 flex flex-col justify-center">
                  <div className="text-sm text-white/85 truncate">{o.ownerName}</div>
                  <div className="text-xs text-white/45 truncate">{o.ownerEmail}</div>
                </div>

                <div className="md:col-span-2 flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-xs border bg-white/[0.05] text-white/70 border-white/10">
                    {o.plan === "enterprise" ? "Enterprise" : "No Plan"}
                  </span>
                  <span
                    className={[
                      "px-2 py-0.5 rounded-full text-xs border",
                      o.subscriptionStatus === "active"
                        ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
                        : o.subscriptionStatus === "suspended" || o.subscriptionStatus === "canceled" || o.subscriptionStatus === "past_due"
                        ? "bg-red-500/15 text-red-200 border-red-500/25"
                        : "bg-white/[0.05] text-white/55 border-white/10",
                    ].join(" ")}
                  >
                    {o.subscriptionStatus || "none"}
                  </span>
                </div>

                <div className="md:col-span-1 text-sm text-white/75 flex items-center">
                  {seatsUsed}/{o.teamMembersLimit}
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
                      style={{ width: `${Math.min(100, poolPct)}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/60 w-9 text-right">{poolPct}%</span>
                </div>

                <div className="md:col-span-1 text-sm text-white/60 flex items-center md:justify-end">
                  {formatDate(o.createdAt)}
                </div>
              </div>
            );
          })}

          {!orgLoading && !orgError && orgRows.length === 0 && (
            <div className="p-6 text-white/60 text-sm">No organizations found.</div>
          )}
        </div>
      </div>

      {/* Search + Page Size */}
      <div className={`${kpiCardBase} mt-6 p-4`}>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex-1 relative min-w-0">
            <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={orgSearch}
              onChange={(e) => { setOrgPage(1); setOrgSearch(e.target.value); }}
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20"
              placeholder="Search orgs by name or owner..."
            />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <div className="text-sm text-white/60 shrink-0">Show</div>
            <select
              value={orgPageSize}
              onChange={(e) => { setOrgPage(1); setOrgPageSize(Number(e.target.value)); }}
              className="h-11 min-w-[90px] px-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
        {orgTotalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3 text-sm">
            <button
              disabled={orgPage <= 1}
              onClick={() => setOrgPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-white/60">Page {orgPage} of {orgTotalPages}</span>
            <button
              disabled={orgPage >= orgTotalPages}
              onClick={() => setOrgPage((p) => Math.min(orgTotalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  </>
)}


        {active === "products" && <ProductsView />}
        {active === "sellers" && <SellersView />}
        {active === "reports" && <ReportsView />}
        {active === "analytics" && <PromptValidationAdminDashboard />}
{active === "freelancers" && <FreelancerReviewAdminDashboard />}

{active === "payments" && <PaymentsView />}
{active === "feedback" && <FeedbackView />}


        {active === "account" && (
          <AccountView
            adminName={adminName}
            adminEmail={adminEmail}
          />
        )}



      </div>
    </main>
  </div>
</div>

      {/* Footer */}
      <footer className="mt-10 pb-8 text-center text-xs text-white/35">
        © 2020 – 2026 Tokun.world | All Rights Reserved
      </footer>
      <MobileBottomNav />



      {showAllActivities && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
    <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl border border-white/10 bg-[#0F1117] shadow-2xl overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">Activity Log</h2>
        <button
          onClick={() => setShowAllActivities(false)}
          className="h-9 w-9 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center text-white/80"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[70vh] overflow-y-auto p-5 space-y-4 no-scrollbar">
        {activitiesLoading && (
          <div className="text-white/70 text-sm">Loading activities…</div>
        )}

        {!!activitiesError && !activitiesLoading && (
          <div className="text-red-400 text-sm">{activitiesError}</div>
        )}

        {!activitiesLoading && !activitiesError && activities.length === 0 && (
          <div className="text-white/60 text-sm">No recent activity found.</div>
        )}

        {!activitiesLoading &&
          !activitiesError &&
          activities.map((a) => {
            const meta = activityMeta(a.type);
            return (
              <div
                key={a.id}
                className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div
                  className={[
                    "h-10 w-10 rounded-full border flex items-center justify-center shrink-0",
                    meta.iconBg,
                  ].join(" ")}
                >
                  {meta.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white/90">
                    {a.title}
                  </div>
                  {a.desc && (
                    <div className="text-xs text-white/55 mt-1">
                      {a.desc}
                    </div>
                  )}
                  <div className="text-[11px] text-white/40 mt-2">
                    {timeAgo(a.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  </div>
)}




    </div>
  );
};

/* =====================================================================
   FeedbackView — Admin sees all feedback, can mark resolved / delete
   ===================================================================== */
function FeedbackView() {
  const [feedbacks, setFeedbacks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<"all"|"pending"|"reviewed"|"resolved">("all");
  const [sentFilter, setSentFilter] = React.useState<"all"|"positive"|"neutral"|"negative">("all");

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/feedback`);
      const data = await res.json();
      if (data.success) setFeedbacks(data.feedbacks);
    } catch {}
    setLoading(false);
  };

  React.useEffect(() => { fetchFeedbacks(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${API_BASE}/api/feedback/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, status } : f));
  };

  const deleteFeedback = async (id: string) => {
    if (!window.confirm("Delete this feedback?")) return;
    await fetch(`${API_BASE}/api/feedback/${id}`, { method: "DELETE" });
    setFeedbacks(prev => prev.filter(f => f._id !== id));
  };

  const toggleTestimonial = async (id: string, showOnLanding: boolean) => {
    await fetch(`${API_BASE}/api/feedback/${id}/testimonial`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showOnLanding }),
    });
    setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, showOnLanding } : f));
  };

  const shown = feedbacks.filter(f => {
    const statusOk = filter === "all" || (f.status || "pending") === filter;
    const sentOk = sentFilter === "all" || f.sentiment === sentFilter;
    return statusOk && sentOk;
  });

  const sentColor: Record<string,string> = { positive:"#4ade80", neutral:"#facc15", negative:"#f87171" };
  const statusColor: Record<string,string> = { pending:"#facc15", reviewed:"#60a5fa", resolved:"#4ade80" };
  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div style={{ padding: "0 0 40px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ color:"#fff", fontWeight:800, fontSize:22, margin:0 }}>User Feedback</h2>
          <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, margin:"4px 0 0" }}>{feedbacks.length} total responses</p>
        </div>
        <button onClick={fetchFeedbacks} style={{ padding:"8px 18px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, color:"#fff", fontSize:13, cursor:"pointer" }}>Refresh</button>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {(["all","pending","reviewed","resolved"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:700, cursor:"pointer", border:"none", background: filter===s ? "linear-gradient(135deg,#7c3aed,#2563eb)" : "rgba(255,255,255,0.06)", color: filter===s ? "#fff" : "rgba(255,255,255,0.5)", textTransform:"capitalize" }}>{s}</button>
        ))}
        <div style={{ width:1, background:"rgba(255,255,255,0.1)", margin:"0 4px" }} />
        {(["all","positive","neutral","negative"] as const).map(s => (
          <button key={s} onClick={() => setSentFilter(s)} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:700, cursor:"pointer", border:"none", background: sentFilter===s ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.06)", color: sentFilter===s ? "#a78bfa" : "rgba(255,255,255,0.5)", textTransform:"capitalize" }}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ color:"rgba(255,255,255,0.4)", textAlign:"center", padding:48 }}>Loading…</div>
      ) : shown.length === 0 ? (
        <div style={{ color:"rgba(255,255,255,0.3)", textAlign:"center", padding:48 }}>No feedback found.</div>
      ) : (
        <div style={{ display:"grid", gap:16 }}>
          {shown.map(fb => (
            <div key={fb._id} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"18px 20px" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:16, color:"#fff", flexShrink:0 }}>
                    {(fb.name||"?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin:0, fontWeight:700, fontSize:15, color:"#fff" }}>{fb.name}</p>
                    <p style={{ margin:0, fontSize:12, color:"rgba(255,255,255,0.45)" }}>{fb.email}{fb.role ? ` · ${fb.role}` : ""}</p>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontSize:12, color: sentColor[fb.sentiment]||"#fff", background:"rgba(255,255,255,0.06)", padding:"3px 10px", borderRadius:20, fontWeight:700, textTransform:"capitalize" }}>{fb.sentiment}</span>
                  <span style={{ fontSize:12, color: statusColor[fb.status||"pending"], background:"rgba(255,255,255,0.06)", padding:"3px 10px", borderRadius:20, fontWeight:700, textTransform:"capitalize" }}>{fb.status||"pending"}</span>
                  {fb.showOnLanding && (
                    <span style={{ fontSize:12, color:"#c4b5fd", background:"rgba(139,92,246,0.15)", padding:"3px 10px", borderRadius:20, fontWeight:700 }}>On Landing Page</span>
                  )}
                  <span style={{ color:"#facc15", fontSize:14, letterSpacing:2 }}>{stars(fb.rating)}</span>
                </div>
              </div>

              <p style={{ margin:"0 0 8px", fontSize:14, color:"rgba(255,255,255,0.75)", lineHeight:1.6 }}>{fb.experience}</p>

              {fb.issue && <p style={{ margin:"0 0 8px", fontSize:13, color:"#f87171", background:"rgba(239,68,68,0.08)", padding:"6px 10px", borderRadius:8 }}>⚠ Issue: {fb.issue}</p>}

              {fb.screenshots?.length > 0 && (
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:8 }}>
                  {/* Same fix as the user-facing My Feedback page: these paths
                      are relative to the API, not to this app. */}
                  {fb.screenshots.map((s: string, i: number) => <a key={i} href={mediaUrl(s)} target="_blank" rel="noreferrer" style={{ fontSize:12, color:"#60a5fa", textDecoration:"underline" }}>Screenshot {i+1}</a>)}
                </div>
              )}

              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:12, flexWrap:"wrap", gap:8 }}>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{new Date(fb.createdAt).toLocaleString()}</span>
                <div style={{ display:"flex", gap:8 }}>
                  {(fb.status||"pending") !== "reviewed" && (
                    <button onClick={() => updateStatus(fb._id,"reviewed")} style={{ padding:"6px 14px", fontSize:12, fontWeight:700, borderRadius:8, border:"none", background:"rgba(96,165,250,0.15)", color:"#60a5fa", cursor:"pointer" }}>Mark Reviewed</button>
                  )}
                  {(fb.status||"pending") !== "resolved" && (
                    <button onClick={() => updateStatus(fb._id,"resolved")} style={{ padding:"6px 14px", fontSize:12, fontWeight:700, borderRadius:8, border:"none", background:"rgba(74,222,128,0.12)", color:"#4ade80", cursor:"pointer" }}>Resolve</button>
                  )}
                  <button onClick={() => toggleTestimonial(fb._id, !fb.showOnLanding)} style={{ padding:"6px 14px", fontSize:12, fontWeight:700, borderRadius:8, border:"none", background: fb.showOnLanding ? "rgba(139,92,246,0.25)" : "rgba(139,92,246,0.12)", color:"#c4b5fd", cursor:"pointer" }}>
                    {fb.showOnLanding ? "Remove from Landing" : "Show on Landing"}
                  </button>
                  <button onClick={() => deleteFeedback(fb._id)} style={{ padding:"6px 14px", fontSize:12, fontWeight:700, borderRadius:8, border:"none", background:"rgba(239,68,68,0.12)", color:"#f87171", cursor:"pointer" }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
