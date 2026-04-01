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
  ShoppingCart
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
  CartesianGrid,
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

// ✅ ADD reports here
type NavKey =
  | "dashboard"
  | "sellers"
  | "products"
  | "reports"
  | "analytics"
  | "account";

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
};

type SellerRow = {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Blocked";
  avatar?: string;
  joined?: string;
  category?: string;
  volume?: string;
  totalProducts?: number;
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
};


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

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const PROMPTS_BASE = `${API_BASE}/api/prompt`;
const SELLERS_BASE = `${API_BASE}/api/seller`;
const REPORTS_BASE = `${API_BASE}/api/promptreport`;
const USERS_BASE = `${API_BASE}/api/user`;
// Optional future:
// const REPORTS_BASE = `${API_BASE}/api/reports`;

const Dashboard = () => {
  const [active, setActive] = useState<NavKey>("dashboard");
const [currentView, setCurrentView] = useState<"seller" | "user">("seller");
 const [showAllUsers, setShowAllUsers] = useState(false);
const [userRows, setUserRows] = useState<UserRow[]>([]);
const [userLoading, setUserLoading] = useState(false);
const [userError, setUserError] = useState<string | null>(null);
const [userPage, setUserPage] = useState(1);
const [userPageSize, setUserPageSize] = useState(10);
const [userTotalPages, setUserTotalPages] = useState(1);
const [userTotal, setUserTotal] = useState(0);
const [userSearch, setUserSearch] = useState("");
 const [stats, setStats] = useState({
  totalRevenue: 0,
  totalSellers: 0,
});

const [sellerRows, setSellerRows] = useState<SellerRow[]>([]);

// const [chartData, setChartData] = useState([]);


  // ✅ Admin name (same as before)
  const adminEmail = (localStorage.getItem("tokun_admin_email") || "").trim();
  const adminName = useMemo(() => {
    if (!adminEmail) return "Admin";
    const localPart = adminEmail.split("@")[0] || "Admin";
    const first = localPart.split(/[._-]/)[0] || localPart;
    return first.charAt(0).toUpperCase() + first.slice(1);
  }, [adminEmail]);

  // ✅ Token getter
  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("tokun_token") ||
      localStorage.getItem("accessToken") ||
      ""
    );
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

      const token = getToken();

      const params = new URLSearchParams();
      params.set("limit", String(userPageSize));
      params.set("page", String(userPage));
      if (userSearch.trim()) params.set("search", userSearch.trim());

      const res = await fetch(`${USERS_BASE}?${params.toString()}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || data?.message || "Failed to load users");
      }

      const mapped: UserRow[] = (data.users || []).map((u: any) => ({
        id: String(u._id),
        name: u?.name || "Unknown",
        email: u?.email || "—",
        avatar: u?.avatarUrl || undefined,
        userType: u?.userType,
        plan: u?.plan ?? null,
        isVerified: !!u?.isVerified,
        kycStatus: u?.kycStatus,
        createdAt: u?.createdAt,
        lastLoginAt: u?.lastLoginAt,
      }));

      setUserRows(mapped);

      // ✅ pagination from backend
      setUserTotal(data?.pagination?.total || 0);
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


  // =======================
  // Dashboard chart/table/activity data
  // =======================
  const chartData = useMemo(
    () => [
      { name: "Week 1", blue: 28, green: 18 },
      { name: "Week 2", blue: 14, green: 22 },
      { name: "Week 3", blue: 18, green: 24 },
      { name: "Week 4", blue: 44, green: 30 },
      { name: "Week 5", blue: 34, green: 44 },
      { name: "Week 6", blue: 46, green: 26 },
      { name: "Week 7", blue: 22, green: 30 },
      { name: "Week 8", blue: 18, green: 28 },
      { name: "Week 9", blue: 6, green: 34 },
    ],
    []
  );

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
        "http://localhost:5000/api/purchase/analytics/sales"
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

const formatChartData = (apiData) => {
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
  apiData.forEach((item) => {
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









const ReportsSidebar = () => {
  const [tab, setTab] = useState<"product" | "review">("product");

  const openCount = (reports || []).filter((r) => r.status === "Open").length;

  const groupLabel = (p: ReportItem["priority"]) => {
    if (p === "High") return "HIGH RISK";
    if (p === "Medium") return "PENDING";
    return "LOW RISK";
  };

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
      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-8 text-sm">
          <button
            onClick={() => setTab("product")}
            className={[
              "pb-3 transition",
              tab === "product"
                ? "text-white border-b-2 border-fuchsia-400"
                : "text-white/60 hover:text-white/85",
            ].join(" ")}
          >
            Product Reports
          </button>

          <button
            onClick={() => setTab("review")}
            className={[
              "pb-3 transition",
              tab === "review"
                ? "text-white border-b-2 border-fuchsia-400"
                : "text-white/60 hover:text-white/85",
            ].join(" ")}
          >
            Review Moderation
          </button>
        </div>
      </div>

      {/* Count + Filter */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-white/10">
        <div className="text-xs text-white/60 uppercase tracking-wide">
          {openCount} Pending Reports
        </div>

        <button className="text-xs text-white/70 flex items-center gap-2 hover:text-white">
          <span className="inline-flex items-center justify-center h-8 px-3 rounded-xl border border-white/10 bg-white/[0.03]">
            <span className="mr-2">⌄</span> FILTER
          </span>
        </button>
      </div>

      {/* List */}
      <div className="max-h-[calc(100vh-170px)] overflow-y-auto">
        {tab === "review" ? (
          <div className="p-4 text-sm text-white/60">
            Review moderation (coming soon…)
          </div>
        ) : (
          <>
            {grouped.High.map(Item)}
            {grouped.Medium.map(Item)}
            {grouped.Low.map(Item)}
          </>
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

      const token = getToken();
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // 1️⃣ ORG SELLERS
      const resOrg = await fetch(`${SELLERS_BASE}`, {
        headers,
        credentials: "include",
      });
      const orgData = await resOrg.json();
      if (!resOrg.ok || !orgData?.success)
        throw new Error(orgData?.error || "Org sellers failed");

      // 2️⃣ USER SELLERS
      const resUser = await fetch(
        `${USERS_BASE}?seller=true&limit=1000&page=1`,
        { headers, credentials: "include" }
      );
      const userData = await resUser.json();
      if (!resUser.ok || !userData?.success)
        throw new Error(userData?.error || "User sellers failed");

      // ✅ MAP ORG
      const orgMapped: SellerRow[] = (orgData.sellers || []).map((s: any) => ({
        id: String(s._id),
        name: s?.name || "Unknown",
        email: s?.email || "—",
        status: s?.status === "SUSPENDED" ? "Blocked" : "Active",
        avatar: s?.avatar || s?.avatarUrl,
        joined: s?.joined || s?.createdAt || null,
        totalProducts: Number(s?.totalProducts ?? 0),
      }));

      // ✅ MAP USERS
      const userMapped: SellerRow[] = (userData.users || []).map((u: any) => ({
        id: String(u._id),
        name: u?.name || "Unknown",
        email: u?.email || "—",
        status: u?.isBanned ? "Blocked" : "Active",
        avatar: u?.avatarUrl,
        joined: u?.createdAt || null,
        totalProducts: Number(u?.totalProducts ?? 0),
      }));

      // ✅ MERGE + DEDUPE
      const merged = [...orgMapped, ...userMapped].reduce((acc, cur) => {
        acc.set(cur.id, cur);
        return acc;
      }, new Map<string, SellerRow>());

      const finalSellers = Array.from(merged.values());

      // ✅ SET TABLE DATA
      setSellerRows(finalSellers);

      // 🔥 KPI CALCULATION
      setStats({
        totalSellers: finalSellers.length,   // ✅ REAL COUNT
        totalRevenue: 12450,                // 💰 DEMO VALUE (for now)
      });

    } catch (e: any) {
      setSellersError(e?.message || "Error loading sellers");
      setSellerRows([]);
    } finally {
      setSellersLoading(false);
    }
  };

  fetchAllSellers();
}, []);

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
            uploaderId: doc?.userId?._id || null,
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
        className={[
          "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition",
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

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#07080B]/90 backdrop-blur">
      <div className="mx-auto max-w-[520px] px-3">
        <div className="flex items-center">
          <Item id="dashboard" label="Home" icon={<LayoutDashboard className="h-5 w-5" />} />
          <Item id="sellers" label="Sellers" icon={<Store className="h-5 w-5" />} />
          <Item id="products" label="Products" icon={<Package className="h-5 w-5" />} />
          <Item id="reports" label="Reports" icon={<ShieldAlert className="h-5 w-5" />} />
          <Item id="account" label="Account" icon={<UserRound className="h-5 w-5" />} />
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
        onClick={() => onFlag(report.listingId)}
        className="h-10 px-4 rounded-xl bg-[#1677FF] hover:opacity-90 text-sm font-medium w-full"
      >
        Flag Product
      </button>
      <button
        onClick={() => onSuspend(report.listingId)}
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

    const dismissReport = (id: string) => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "Dismissed",
                history: [
                  ...(r.history || []),
                  {
                    at: new Date().toISOString(),
                    by: adminName,
                    action: "Dismissed report",
                  },
                ],
              }
            : r
        )
      );

      // also update selected
      setSelectedReport((prev) =>
        prev?.id === id ? { ...prev, status: "Dismissed" } : prev
      );
    };

    const flagProduct = (listingId: string) => {
      // TODO: call your backend flag endpoint
      console.log("Flag listing:", listingId);

      setSelectedReport((prev) =>
        prev
          ? {
              ...prev,
              status: "Actioned",
              history: [
                ...(prev.history || []),
                {
                  at: new Date().toISOString(),
                  by: adminName,
                  action: "Flagged product",
                  note: `Listing: ${listingId}`,
                },
              ],
            }
          : prev
      );
    };

    const suspendListing = (listingId: string) => {
      // TODO: call your backend suspend endpoint
      console.log("Suspend listing:", listingId);

      setSelectedReport((prev) =>
        prev
          ? {
              ...prev,
              status: "Actioned",
              history: [
                ...(prev.history || []),
                {
                  at: new Date().toISOString(),
                  by: adminName,
                  action: "Suspended listing",
                  note: `Listing: ${listingId}`,
                },
              ],
            }
          : prev
      );
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
      setConfirmPopup(null);
    } catch (e: any) {
      setActionError(e?.message || "Action failed");
    } finally {
      setActionLoading(false);
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
      setSelectedSeller({
        id: String(s?._id || sellerId),
        name: s?.name || "Unknown",
        email: s?.email,
        location: s?.location,
        joined: s?.joined,
        status: s?.status || "ACTIVE",
        avatar: s?.avatar,
        verified: !!s?.verified,
        totalEarnings: s?.totalEarnings ?? 0,
        rating: s?.rating ?? 0,
        reviewsCount: s?.reviewsCount ?? 0,
        refundRate: s?.refundRate ?? 0,
        refundThreshold: s?.refundThreshold ?? 5,
      });

      const mapped: PromptProduct[] = (promptData.prompts || []).map((doc: any) => {
        const att = doc?.attachment || null;
        const status: PromptProduct["status"] =
          doc?.flagged ? "Flagged" : doc?.draft ? "Draft" : "Published";
        return {
          id: String(doc._id),
          title: doc?.title || "Untitled",
          uploaderName: doc?.userId?.name || "Unknown",
          uploaderId: doc?.userId?._id || null,
          price: typeof doc?.price === "number" ? doc.price : 0,
          status,
          imageUrl: att?.type === "image" ? att?.path : undefined,
          videoUrl: att?.type === "video" ? att?.path : undefined,
          category: doc?.categories?.[0]?.name || "General",
          exclusive: !!doc?.exclusive,
          sold: !!doc?.sold,
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
          <div className="flex justify-center md:justify-end w-full">
            <button className="h-9 sm:h-10 px-5 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90">
              <Plus className="h-4 w-4" />
              Add Member
            </button>
          </div>
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
                      <div className="text-sm font-semibold text-white/90 truncate">{r.name}</div>
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

                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-[11px] text-white/45 uppercase tracking-wide">Products</div>
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
                  <div className="col-span-4">Seller Name</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Volume</div>
                  <div className="col-span-3">Joined Date</div>
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
                      <div className="col-span-4 flex items-center gap-4 min-w-0">
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

                      <div className="col-span-2 text-sm text-white/80 font-medium">
                        ₹{Number(r.volume || 0).toLocaleString()}
                      </div>

                      <div className="col-span-3 text-sm text-white/75">
                        {formatDate(r.joined)}
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

  if (selectedSeller) {
    return (
      <SellerProfileView
        seller={selectedSeller}
        products={sellerProducts}
        loading={sellerLoading}
        error={sellerError}
        onBack={closeSellerProfile}
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
          <div className="flex justify-center md:justify-end w-full">
            <button className="h-9 sm:h-10 px-5 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90">
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
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
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          <Video className="h-5 w-5" />
                          Video Prompt
                        </div>
                      </div>
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
                        onClick={() => openSellerProfile(p.uploaderId)}
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
}: {
  seller: SellerProfile;
  products: PromptProduct[];
  loading: boolean;
  error: string | null;
  onBack: () => void;
}) => {
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
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-200 border border-emerald-500/25">
                {seller.status || "ACTIVE"}
              </span>
            </div>
           <div className="mt-1 text-xs text-white/50">
  Seller ID: {seller.id} • Joined: {formatMonthYear(seller.joined)} • Email: {seller.email || "—"}
</div>
          </div>
        </div>

{/* ✅ Actions: mobile = 3 equal buttons, desktop = row */}
<div className="w-full lg:w-auto grid grid-cols-3 gap-3">
  <button className="h-11 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm inline-flex items-center justify-center gap-2">
    <MessageSquare className="h-4 w-4 text-sky-300" />
    <span className="hidden sm:inline">Message</span>
  </button>

  <button className="h-11 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] text-sm inline-flex items-center justify-center gap-2">
    <Download className="h-4 w-4 text-white/80" />
    <span className="hidden sm:inline">Export</span>
  </button>

  <button className="h-11 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/15 text-sm inline-flex items-center justify-center gap-2 text-red-300">
    <Ban className="h-4 w-4" />
    <span className="hidden sm:inline">Suspend</span>
  </button>
</div>

      </div>

      {/* KPI row */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">TOTAL EARNINGS</div>
          <div className="mt-4 text-3xl font-semibold">
            ${Number(seller.totalEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 text-sm text-emerald-400">Vs. last 30 days</div>
        </div>

        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">CUSTOMER RATING</div>
          <div className="mt-4 text-3xl font-semibold">
            {seller.rating || 0}/5.0 ⭐
          </div>
          <div className="mt-3 text-sm text-emerald-400">
            From {seller.reviewsCount || 0} reviews
          </div>
        </div>

        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">REFUND RATE</div>
          <div className="mt-4 text-3xl font-semibold">{seller.refundRate || 0}%</div>
          <div className="mt-3 text-sm text-sky-300">
            Threshold: {seller.refundThreshold || 5}% max
          </div>
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
              <div className="col-span-4">PRODUCT</div>
              <div className="col-span-3">CATEGORY</div>
              <div className="col-span-2">PRICE</div>
              <div className="col-span-2">SALES</div>
              <div className="col-span-1 text-right">ACTIONS</div>
            </div>

            <div className="divide-y divide-white/10">
              {products.slice(0, 4).map((p) => (
                <div key={p.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center bg-white/[0.02]">
                  <div className="col-span-4">
                    <div className="text-sm font-medium text-white/90">{p.title}</div>
                    <div className="text-xs text-white/50">{p.status}</div>
                  </div>
                  <div className="col-span-3 text-sm text-white/75">{p.category || "General"}</div>
                  <div className="col-span-2 text-sm text-white/75">
                    {p.price > 0 ? `$${p.price}` : "FREE"}
                  </div>
                  <div className="col-span-2 text-sm text-white/75">—</div>
                  <div className="col-span-1 flex justify-end gap-3 text-white/70">
                    <button className="hover:text-white">✎</button>
                    <button className="hover:text-red-300">🗑</button>
                  </div>
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

      {/* Bottom: activity + verification (UI only) */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className={`${kpiCardBase} p-6`}>
          <h2 className="text-lg font-semibold">Seller Activity Log</h2>
          <div className="mt-6 space-y-4">
            {[
              { t: "New product listing created", d: "React Dash Template was uploaded", time: "2 minutes ago" },
              { t: "Payout requested", d: "Request for $1,200.00 processed", time: "1 hour ago" },
              { t: "Updated “Abstract UI Kit”", d: "Modified price from $45 to $49", time: "3 hours ago" },
              { t: "Policy update", d: "Updated Terms of Service sent to sellers", time: "Yesterday" },
            ].map((a, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.04]" />
                <div>
                  <div className="text-sm font-medium text-white/90">{a.t}</div>
                  <div className="text-xs text-white/55 mt-1">{a.d}</div>
                  <div className="text-[11px] text-white/40 mt-1">{a.time}</div>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-6 w-full h-10 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80">
            View Full History
          </button>
        </div>

        <div className={`${kpiCardBase} p-6`}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Identity Verification</h2>
            <span className="text-xs text-emerald-300">VERIFIED</span>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] h-[220px] flex items-center justify-center text-white/60">
            View Document
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-white/80">Tax Compliance Doc</div>
            <span className="text-xs text-emerald-300">VERIFIED</span>
          </div>

          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-white/70">Tax_Form_2023.pdf</div>
            <button className="text-white/70 hover:text-white">⬇</button>
          </div>

          <div className="mt-4 flex gap-3">
            <button className="flex-1 h-10 rounded-xl bg-red-500/15 text-red-200 border border-red-500/25 hover:bg-red-500/20 text-sm font-medium">
              Reject Verification
            </button>
            <button className="flex-1 h-10 rounded-xl bg-[#1677FF] hover:opacity-90 text-sm font-medium">
              Approve Docs
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

const AccountView = ({
  adminName,
  adminEmail,
  totalMembers,
  activeToday,
  pendingInvite,
}: {
  adminName: string;
  adminEmail: string;
  totalMembers: number;
  activeToday: number;
  pendingInvite: number;
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const teamRows = [
    { name: "Abstract UI Kit", status: "Live Listing", role: "Super admin", lastActive: "Online Now" },
    { name: "3D Icon Set v2", status: "Live Listing", role: "Moderator", lastActive: "15 min ago" },
    { name: "React Dash Template", status: "Draft", role: "Support", lastActive: "Yesterday" },
    { name: "Motion Backgrounds", status: "Live Listing", role: "Admin", lastActive: "3 days ago" },
  ];

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
                value={adminEmail || "—"}
                readOnly
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
              onClick={() => {
                // TODO: call your update password API
                console.log("update password");
              }}
              className="h-11 px-6 rounded-xl bg-[#1677FF] hover:opacity-90 text-sm font-medium"
            >
              Update password
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">TOTAL MEMBER</div>
          <div className="mt-4 text-3xl font-semibold">{totalMembers}</div>
        </div>

        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">ACTIVE TODAY</div>
          <div className="mt-4 text-3xl font-semibold">{activeToday}</div>
        </div>

        <div className={`${kpiCardBase} p-6`}>
          <div className="text-xs tracking-[0.2em] text-white/60">PENDING INVITE</div>
          <div className="mt-4 text-3xl font-semibold">{pendingInvite}</div>
        </div>
      </section>

      {/* Team Members Management */}
      <section className={`${kpiCardBase} mt-6 p-6`}>
        <h2 className="text-lg font-semibold">Team Members Management</h2>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs text-white/55 bg-white/[0.03]">
            <div className="col-span-5">MEMBERS</div>
            <div className="col-span-3">ROLE</div>
            <div className="col-span-3">LAST ACTIVE</div>
            <div className="col-span-1 text-right">ACTIONS</div>
          </div>

          <div className="divide-y divide-white/10">
            {teamRows.map((m, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 px-5 py-4 items-center bg-white/[0.02]">
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-white/10 border border-white/10" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white/90 truncate">{m.name}</div>
                    <div className="text-xs text-white/45 truncate">{m.status}</div>
                  </div>
                </div>

                <div className="col-span-3">
                  <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/15 text-emerald-200 border border-emerald-500/25">
                    {m.role}
                  </span>
                </div>

                <div className="col-span-3 text-sm text-white/70">
                  {m.lastActive === "Online Now" ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Online Now
                    </span>
                  ) : (
                    m.lastActive
                  )}
                </div>

                <div className="col-span-1 flex justify-end gap-3 text-white/70">
                  <button className="hover:text-white" title="Edit">✎</button>
                  <button className="hover:text-red-300" title="Delete">🗑</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 text-xs text-white/45">Showing 1 to {teamRows.length} of {teamRows.length} members</div>
      </section>
    </>
  );
};





  return (
    <div className="min-h-screen w-full bg-[#07080B] text-white font-inter">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07080B]/80 backdrop-blur">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
          <div className="h-[74px] flex items-center">


            
            {/* LEFT: Brand */}
            <div className="flex items-center">
              <div className="text-white font-semibold tracking-wide">
                Tokun Admin
              </div>
            </div>

            {/* CENTER: Nav */}
            <div className="hidden md:flex flex-1 justify-center">
              <nav className="flex items-center gap-2">
                <NavItem
                  id="dashboard"
                  label="Dashboard"
                  icon={<LayoutDashboard className="h-4 w-4" />}
                />
                <NavItem
                  id="sellers"
                  label="Sellers"
                  icon={<Store className="h-4 w-4" />}
                />
                <NavItem
                  id="products"
                  label="Products"
                  icon={<Package className="h-4 w-4" />}
                />
                <NavItem
                  id="analytics"
                  label="Analytics"
                  icon={<LineChart className="h-4 w-4" />}
                />

                <NavItem id="reports" label="Reports" icon={<ShieldAlert className="h-4 w-4" />} />

              </nav>
            </div>

            

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-3 ml-auto">
              <button
                className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] flex items-center justify-center"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-white/80" />
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

    <DropdownMenuSeparator className="bg-white/10" />

    {/* Optional (if you want later)
    <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
    */}
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
    {/* ✅ LEFT: Always-visible Reports Sidebar */}
  {/* ✅ LEFT: Reports Sidebar (DESKTOP ONLY) */}
<div className="hidden md:block w-[380px] shrink-0 pl-5 sm:pl-6 pr-4 py-10">
  <div className="sticky top-[90px] h-[calc(100vh-110px)]">
    <ReportsSidebar />
  </div>
</div>


    {/* ✅ RIGHT: Pages (never broken by sidebar) */}
<main className="flex-1 min-w-0 py-10 px-5 sm:px-6 md:pl-0 md:pr-5 lg:pr-6 pb-24 md:pb-10">

   <div className={active === "reports" ? "w-full" : "mx-auto max-w-[1200px]"}>


              {active === "dashboard" && currentView === "seller" && (
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
      </div>
    </div>

    {/* RIGHT: Add Member */}
    <div className="flex justify-center md:justify-end w-full">
      <button className="h-9 sm:h-10 px-5 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90">
        <Plus className="h-4 w-4" />
        Add Member
      </button>
    </div>
  </div>
</div>





    {/* KPI Cards */}
    <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className={`${kpiCardBase} p-6`}>
        <div className="text-xs tracking-[0.2em] text-white/60">
          TOTAL REVENUE
        </div>
        <div className="mt-4 flex items-end justify-between">
          {/* TOTAL REVENUE */}
<div className="text-3xl font-semibold">
  ${stats.totalRevenue.toLocaleString()}
</div>

{/* ACTIVE SELLERS (now total sellers) */}
{/* <div className="text-3xl font-semibold">
  {stats.totalSellers}
</div> */}
          <div className="text-sm text-emerald-400 font-medium">
            +12%
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
          <div className="text-3xl font-semibold">42</div>
          <div className="text-sm text-fuchsia-300 font-medium">
            New submissions
          </div>
        </div>
      </div>

      <div className={`${kpiCardBase} p-6`}>
        <div className="text-xs tracking-[0.2em] text-white/60">
          DIGITAL TOTAL PRODUCTS
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
      {/* Chart */}
      <div className={`${kpiCardBase} p-6 lg:col-span-2`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Sales Trends Over Time
            </h2>
            <p className="mt-1 text-sm text-white/55">
              Subtitle: Monthly revenue growth and projection
            </p>
          </div>
          <div className="text-xs text-white/60 mt-1">Last 30 Days</div>
        </div>

        <div className="mt-6 h-[310px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 8, left: -12, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="blueFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#2AA8FF"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="#2AA8FF"
                    stopOpacity={0.02}
                  />
                </linearGradient>
                <linearGradient
                  id="greenFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#84CC16"
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="100%"
                    stopColor="#84CC16"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="rgba(255,255,255,0.08)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{
                  fill: "rgba(255,255,255,0.55)",
                  fontSize: 12,
                }}
                axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fill: "rgba(255,255,255,0.45)",
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(10,12,16,0.95)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  color: "white",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.75)" }}
              />

              <Area
                type="monotone"
                dataKey="green"
                stroke="#84CC16"
                strokeWidth={2}
                fill="url(#greenFill)"
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Area
                type="monotone"
                dataKey="blue"
                stroke="#2AA8FF"
                strokeWidth={2}
                fill="url(#blueFill)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
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

    {!activitiesLoading && !activitiesError && activities.length === 0 && (
      <div className="text-white/60 text-sm">No recent activity found.</div>
    )}

    {/* ✅ YE CHECK KARO — YE HONA CHAHIYE */}
    {!activitiesLoading && !activitiesError && activities.map((a) => {
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

  <button className="mt-6 w-full h-10 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80">
    View Activity Log
  </button>
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
      <div className="md:col-span-4">Seller Name</div>
      <div className="md:col-span-2">Status</div>
      <div className="md:col-span-2">Volume</div>
      <div className="md:col-span-3">Joined Date</div>
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
            <div
              key={r.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-5 py-5 bg-white/[0.02]"
            >
              {/* Seller */}
              <div className="md:col-span-4 flex items-center gap-4 min-w-0">
                <img
                  src={r.avatar || "https://i.pravatar.cc/80?img=12"}
                  alt={r.name}
                  className="h-12 w-12 rounded-full object-cover border border-white/10 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white/90 truncate">
                    {r.name}
                  </div>
                  <div className="text-xs text-white/45 truncate">{r.email}</div>
                </div>
              </div>

              {/* Mobile info row */}
              <div className="grid grid-cols-2 gap-3 md:contents">
                {/* Status */}
                <div className="md:col-span-2">
                  <div className="text-[11px] text-white/45 mb-1 md:hidden">Status</div>
                  <span
                    className={[
                      "px-4 py-1.5 rounded-full text-xs font-medium border inline-flex",
                      r.status === "Active"
                        ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
                        : "bg-red-500/15 text-red-200 border-red-500/25",
                    ].join(" ")}
                  >
                    {r.status}
                  </span>
                </div>

                {/* Volume */}
                <div className="md:col-span-2 text-sm text-white/80">
                  <div className="text-[11px] text-white/45 mb-1 md:hidden">Volume</div>
                  {r.volume || "—"}
                </div>

                {/* Joined */}
                <div className="col-span-2 md:col-span-3 text-sm text-white/75">
                  <div className="text-[11px] text-white/45 mb-1 md:hidden">Joined Date</div>
                  {formatDate(r.joined)}
                </div>

                {/* Actions */}
                <div className="col-span-2 md:col-span-1 flex md:justify-end items-center gap-3 pt-1">
                  <button
                    className={[
                      "text-sm inline-flex items-center gap-2 whitespace-nowrap",
                      r.status === "Active"
                        ? "text-red-400 hover:text-red-300"
                        : "text-sky-400 hover:text-sky-300",
                    ].join(" ")}
                    onClick={() => console.log("toggle block", r.id)}
                  >
                    {r.status === "Active" ? "Block" : "Unblocked"}
                  </button>

                  <button
                    className="text-white/70 hover:text-white shrink-0"
                    onClick={() => console.log("delete", r.id)}
                    aria-label="Delete"
                  >
                    🗑
                  </button>
                </div>
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


 {active === "dashboard" && currentView === "user" && (
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
      </div>
    </div>

    {/* RIGHT: Add Member */}
    <div className="flex justify-center md:justify-end w-full">
      <button className="h-9 sm:h-10 px-5 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF14EF] via-[#8A4BFF] to-[#1A73E8] hover:opacity-90">
        <Plus className="h-4 w-4" />
        Add Member
      </button>
    </div>
  </div>
</div>



    {/* Add Member Button */}

     

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
          <div className="text-3xl font-semibold">42</div>
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
      {/* Chart */}
      <div className={`${kpiCardBase} p-6 lg:col-span-2`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Sales Trends Over Time
            </h2>
            <p className="mt-1 text-sm text-white/55">
              Subtitle: Monthly revenue growth and projection
            </p>
          </div>
          <div className="text-xs text-white/60 mt-1">Last 30 Days</div>
        </div>

        <div className="mt-6 h-[310px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 8, left: -12, bottom: 0 }}
            >
              <defs>
                <linearGradient id="blueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2AA8FF" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2AA8FF" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#84CC16" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#84CC16" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(10,12,16,0.95)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  color: "white",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.75)" }}
              />

              <Area
                type="monotone"
                dataKey="green"
                stroke="#84CC16"
                strokeWidth={2}
                fill="url(#greenFill)"
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Area
                type="monotone"
                dataKey="blue"
                stroke="#2AA8FF"
                strokeWidth={2}
                fill="url(#blueFill)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
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

    {!activitiesLoading && !activitiesError && activities.length === 0 && (
      <div className="text-white/60 text-sm">No recent activity found.</div>
    )}

    {/* ✅ YE MISSING THA USER VIEW MEIN — ADD KARO */}
    {!activitiesLoading &&
      !activitiesError &&
      activities.map((a) => {
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

  <button className="mt-6 w-full h-10 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/80">
    View Activity Log
  </button>
</div>
    </section>

{/* Users Table */}
<section className={`${kpiCardBase} mt-6 p-6`}>
  <div className="flex items-center justify-between gap-3">
    <div>
      <h2 className="text-lg font-semibold">Users List</h2>
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
      <div className="md:col-span-6">User</div>
      <div className="md:col-span-2">KYC</div>
      <div className="md:col-span-2">Plan</div>
      <div className="md:col-span-2 text-right">Actions</div>
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
          className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-5 py-5 bg-white/[0.02]"
        >
          {/* User */}
          <div className="md:col-span-6 flex items-center gap-3 min-w-0">
            <img
              src={u.avatar || "https://i.pravatar.cc/80?img=12"}
              alt={u.name}
              className="h-10 w-10 rounded-full object-cover border border-white/10 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-sm font-medium text-white/90 truncate">
                {u.name}
              </div>
              <div className="text-xs text-white/45 truncate">
                {u.email}
              </div>
            </div>
          </div>

          {/* Mobile fields / desktop columns */}
          <div className="grid grid-cols-2 gap-3 md:contents">
            {/* KYC */}
            <div className="md:col-span-2">
              <div className="text-[11px] text-white/45 mb-1 md:hidden">
                KYC
              </div>
              <span className="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/[0.04] text-white/80 inline-flex max-w-full">
                {u.kycStatus || "—"}
              </span>
            </div>

            {/* Plan */}
            <div className="md:col-span-2 text-sm text-white/75">
              <div className="text-[11px] text-white/45 mb-1 md:hidden">
                Plan
              </div>
              {u.plan ?? "—"}
            </div>

            {/* Actions */}
            <div className="col-span-2 md:col-span-2 flex md:justify-end gap-3 pt-1 text-white/70">
              <button className="hover:text-white whitespace-nowrap">
                View
              </button>
              <button className="hover:text-red-300 whitespace-nowrap">
                Ban
              </button>
            </div>
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


        {active === "products" && <ProductsView />}
        {active === "sellers" && <SellersView />}
        {active === "reports" && <ReportsView />}
        {active === "analytics" && (
          <div className={`${kpiCardBase} p-8`}>
            <h1 className="text-2xl font-semibold">Analytics</h1>
            <p className="text-white/60 mt-2">Coming soon…</p>
          </div>
        )}
        {active === "account" && (
          <AccountView
            adminName={adminName}
            adminEmail={adminEmail}
            totalMembers={24}
            activeToday={18}
            pendingInvite={3}
          />
        )}
      </div>
    </main>
  </div>
</div>

      {/* Footer */}
      <footer className="mt-10 pb-8 text-center text-xs text-white/35">
        © 2020 – 2026 Tokun.ai | All Rights Reserved
      </footer>
      <MobileBottomNav />
    </div>
  );
};

export default Dashboard;
