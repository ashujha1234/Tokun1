import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SellPromptModalProvider } from "@/contexts/SellPromptModalContext";
import { CartProvider } from "@/contexts/CartContext";
import ScrollToTop from "@/components/ScrollToTop";
import RouteFallback from "@/components/RouteFallback";

// Landing stays eagerly imported on purpose: it owns the loading curtain, and a
// lazy chunk here would mean a blank frame before the curtain can paint. Every
// other route is split so the first visit only downloads what "/" actually needs
// — before this the whole app shipped as one ~4.8 MB bundle.
import Landing from "./pages/Landing";

const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PromptLibraryPage = lazy(() => import("./pages/PromptLibraryPage"));
const PromptMarketplacePage = lazy(() => import("./pages/PromptMarketplacePage"));
const FindCreatorsPage = lazy(() => import("./pages/FindCreatorsPage"));
const ServiceDetailPage = lazy(() => import("./pages/ServiceDetailPage"));
const BrandPromptsPage = lazy(() => import("./pages/BrandPromptsPage"));
const VerifySignup = lazy(() => import("./pages/VerifySignup"));
const VerifyLogin = lazy(() => import("./pages/VerifyLogin"));
const SmartGenPage = lazy(() => import("./pages/SmartGen"));
const AppPage = lazy(() => import("./pages/AppPage"));
const Subscription = lazy(() => import("@/pages/Subscription"));
const SavedCollection = lazy(() => import("@/pages/SavedCollection"));
const Admin = lazy(() => import("./pages/Admin"));
const SavedOptimizations = lazy(() => import("@/pages/SavedOptimizations"));
const SmartgenHistory = lazy(() => import("@/pages/SmartgenHistory"));
const PromptHistory = lazy(() => import("@/components/PromptHistory"));
const PromptOptimizationPage = lazy(() => import("./pages/promptOptimisation"));
const History = lazy(() => import("@/pages/History"));
const NotificationsPage = lazy(() => import("@/pages/Notifications"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const MyFeedbackPage = lazy(() => import("@/pages/MyFeedbackPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const SupportPage = lazy(() => import("@/pages/SupportPage"));
const CareersPage = lazy(() => import("@/pages/CareersPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const PrivacyPolicyPage = lazy(() => import("@/pages/PrivacyPolicyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const RefundPolicyPage = lazy(() => import("@/pages/RefundPolicyPage"));
const ReportPolicyPage = lazy(() => import("@/pages/ReportPolicyPage"));
const MyRefundsPage = lazy(() => import("@/pages/MyRefundsPage"));
const Wallet = lazy(() => import("@/pages/Wallet"));
const WithdrawFunds = lazy(() => import("@/pages/WithdrawFunds"));
const AddFunds = lazy(() => import("@/pages/AddFunds"));
const EscrowAdminDashboard = lazy(() => import("@/pages/EscrowAdminDashboard"));
const AdminNotificationsPage = lazy(() => import("@/pages/AdminNotificationsPage"));
const AdminRefundsPage = lazy(() => import("@/pages/AdminRefundsPage"));
const SelfDash = lazy(() => import("@/pages/self-dash"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("@/pages/OrderDetailPage"));
const AdminDisputesPage = lazy(() => import("@/pages/AdminDisputesPage"));
const AdminForgotPassword = lazy(() => import("./pages/AdminForgotPassword"));

const queryClient = new QueryClient();

// function RequireAuth({ children }: { children: React.ReactNode }) {
//   const { isAuthenticated, isLoading } = useAuth();
//   const location = useLocation();
//   if (isLoading) return null; // or a spinner
//   if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
//   return <>{children}</>;
// }




function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return null; // ya loader
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("tokun_admin_token");
  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }
  return <>{children}</>;
}
// ...imports unchanged...
// (keep your existing imports)

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
          <CartProvider>

         
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <ScrollToTop />
            <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-signup" element={<VerifySignup />} />
              <Route path="/verify-login" element={<VerifyLogin />} />
             

              {/* protected */}
             // src/App.tsx (routes only)
<Route
  path="/app"
  element={
    <RequireAuth>
       <AppPage /> 
    </RequireAuth>
  }
/>

<Route
  path="/smartgen"
  element={
    <RequireAuth>
      <SmartGenPage />
    </RequireAuth>
  }
/>
<Route path="/profile/:userId" element={<ProfilePage />} />
<Route path="/chat" element={<ChatPage />} />
<Route
  path="/wallet"
  element={
    <RequireAuth>
      <Wallet />
    </RequireAuth>
  }
/>
<Route
  path="/add-funds"
  element={
    <RequireAuth>
      <AddFunds />
    </RequireAuth>
  }
/>

<Route
  path="/withdraw"
  element={
    <RequireAuth>
      <WithdrawFunds />
    </RequireAuth>
  }
/>

        <Route path="/history" element={<History />} />
           <Route path="/notifications" element={<NotificationsPage />} />
<Route
  path="/prompt-optimization"
  element={
    <RequireAuth>
      <PromptOptimizationPage />
    </RequireAuth>
  }
/>
<Route path="/blog" element={<BlogPage />} />
<Route path="/about" element={<AboutPage />} />
<Route path="/support" element={<SupportPage />} />
<Route path="/careers" element={<CareersPage />} />
<Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
<Route path="/terms" element={<TermsPage />} />
<Route path="/refund-policy" element={<RefundPolicyPage />} />
<Route path="/report-policy" element={<ReportPolicyPage />} />
<Route path="/my-refunds" element={<MyRefundsPage />} />
<Route path="/subscription" element={<Subscription />} />
  <Route path="/prompty-history" element={<PromptHistory />} />
<Route
  path="/index"
  element={
    <RequireAuth>
      <Index />     {/* ✅ keep the full dashboard here */}
    </RequireAuth>
  }
/>
 <Route path="/saved" element={<SavedCollection />} />
 <Route path="/admin" element={<Admin />} />
 <Route path="/self-dash" element={<SelfDash />} />
 {/* Everything bought and sold in one list. Behind auth because it's
     entirely the caller's own transaction history. */}
 <Route
   path="/orders"
   element={
     <RequireAuth>
       <OrdersPage />
     </RequireAuth>
   }
 />
 {/* One booking, seen by whichever side opens it — brief, progress
     checkpoints, delivery, cancellation and the split negotiation. */}
 <Route
   path="/orders/:orderKind/:orderId"
   element={
     <RequireAuth>
       <OrderDetailPage />
     </RequireAuth>
   }
 />
              {/* other */}
              <Route path="/prompt-library" element={<PromptLibraryPage />} />
             // ✅ App.tsx — protect the marketplace route so direct hits also require login
// ✅ Allow viewing marketplace without login
<Route path="/prompt-marketplace" element={<PromptMarketplacePage />} />
<Route path="/find-creators" element={<FindCreatorsPage />} />
{/* Public service page — the terms a buyer agrees to are stated here, not on a card. */}
<Route path="/service/:serviceId" element={<ServiceDetailPage />} />
<Route path="/brand-prompts" element={<BrandPromptsPage />} />


              <Route path="*" element={<NotFound />} />
              import SavedOptimizations from "@/pages/SavedOptimizations";

// …
<Route path="/saved-optimizations" element={<SavedOptimizations />} />
<Route
  path="/smartgen-history"
  element={
    
      <SmartgenHistory />


  
   
  }
/>
<Route path="/admin-login" element={< AdminLogin/>} />
<Route path="/admin-forgot-password" element={<AdminForgotPassword />} />
<Route path="/admin/dashboard" element={<RequireAdminAuth><Dashboard /></RequireAdminAuth>} />
<Route path="/my-feedback" element={<MyFeedbackPage />} />
<Route path="/admin/escrow" element={<RequireAdminAuth><EscrowAdminDashboard /></RequireAdminAuth>} />
<Route path="/admin/notifications" element={<RequireAdminAuth><AdminNotificationsPage /></RequireAdminAuth>} />
<Route path="/admin/refunds" element={<RequireAdminAuth><AdminRefundsPage /></RequireAdminAuth>} />
{/* Cancellations the two parties couldn't split between themselves. */}
<Route path="/admin/disputes" element={<RequireAdminAuth><AdminDisputesPage /></RequireAdminAuth>} />

<Route
  path="/purchases"
  element={
    <RequireAuth>
      <PromptHistory />
    </RequireAuth>
  }
/>




            </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
         </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
