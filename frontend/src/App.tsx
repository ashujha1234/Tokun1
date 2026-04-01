import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SellPromptModalProvider } from "@/contexts/SellPromptModalContext";
import Landing from "./pages/Landing";
import ProfilePage from "@/pages/ProfilePage";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import PromptLibraryPage from "./pages/PromptLibraryPage";
import PromptMarketplacePage from "./pages/PromptMarketplacePage";
import VerifySignup from "./pages/VerifySignup";
import VerifyLogin from "./pages/VerifyLogin"; 
import SmartGenPage from "./pages/SmartGen";
import AppPage from "./pages/AppPage";
import Subscription from "@/pages/Subscription";
import SavedCollection from "@/pages/SavedCollection";
import Admin from "./pages/Admin";
import SavedOptimizations from "@/pages/SavedOptimizations";
import SmartgenHistory from "@/pages/SmartgenHistory"
import PromptHistory from "@/components/PromptHistory";
import PromptOptimizationPage from "./pages/promptOptimisation";
import History from "@/pages/History";
import NotificationsPage from "@/pages/Notifications";
import { CartProvider } from "@/contexts/CartContext";
import ChatPage from "./pages/ChatPage";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "@/pages/Dashboard";
import AdminForgotPassword from "./pages/AdminForgotPassword";
const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return null; // or a spinner
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
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
              {/* other */}
              <Route path="/prompt-library" element={<PromptLibraryPage />} />
             // ✅ App.tsx — protect the marketplace route so direct hits also require login
// ✅ Allow viewing marketplace without login
<Route path="/prompt-marketplace" element={<PromptMarketplacePage />} />


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
<Route path="/admin/dashboard" element={<Dashboard />} />

<Route
  path="/purchases"
  element={
    <RequireAuth>
      <PromptHistory />
    </RequireAuth>
  }
/>




            </Routes>
          </BrowserRouter>
        </TooltipProvider>
         </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
