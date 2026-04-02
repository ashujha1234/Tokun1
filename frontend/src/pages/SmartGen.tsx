

// src/pages/SmartGen.tsx
// src/pages/SmartGen.tsx
import { useEffect , useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
 
import Header from "@/components/Header";
import SmarterPrompt from "@/components/SmarterPrompt";
import TokenUsageSection from "@/components/TokenUsageSection";
import AppNavigation from "@/components/AppNavigation";
import Footer from "@/components/Footer";
 
export default function SmartGenPage() {

  const { isAuthenticated, refreshQuota } = useAuth();
  const navigate = useNavigate();

  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);

useEffect(() => {
  const shouldShow = localStorage.getItem("SHOW_SUB_POPUP");
  if (shouldShow === "1") {
    // Show popup ONCE only
    setShowSubscriptionPopup(true);
    localStorage.removeItem("SHOW_SUB_POPUP");
  }
}, []);

 
  const handleSmartgenPromptGenerated = async (prompt: string) => {
    console.log("SmartGen: Prompt generated, refreshing quota...");
    try {
      await refreshQuota();
      console.log("SmartGen: Token count refreshed successfully");
    } catch (error) {
      console.error("SmartGen: Refresh failed", error);
    }
  };
 
  // if (!isAuthenticated) return null;
  if (!isAuthenticated) {
  return (
    <div className="min-h-screen bg-[#030406] text-white">
      {/* Render popup even if user not authenticated yet */}
      {showSubscriptionPopup && <SubscriptionPopup navigate={navigate} />}

      <p className="text-center pt-20">Loading...</p>
    </div>
  );
}

 
  return (
    <div className="dark min-h-screen text-foreground" style={{ backgroundColor: "#030406" }}>
      <div className="container mx-auto px-4 py-6">
        <Header />
 
       <Header />

<div className="pt-20 md:pt-24 lg:pt-28 flex justify-center">
  <TokenUsageSection />
</div>

<div className="mt-6 text-center">
  <h2
  className="text-[17px] sm:text-[22px] lg:text-[28px] font-semibold text-white leading-snug"
  style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
>
  What would you like to create today?
</h2>
</div>
 
        <div className="mt-4 flex justify-center">
          <AppNavigation />
        </div>
 
       <div className="mt-8 text-center px-4">
  <h1 className="m-0 leading-tight text-[20px] sm:text-[24px] lg:text-[32px]">
    <span className="font-semibold text-white" style={{ fontFamily: "Inter" }}>
      Smartgen –
    </span>
    <span className="text-white font-normal" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>
      {" "}Get detailed prompts{" "}
    </span>
    <span className="text-white italic font-normal" style={{ fontFamily: '"DM Serif Text"' }}>
      for any topic.
    </span>
  </h1>
</div>
 
        <div className="mt-6">
          <SmarterPrompt
            onPromptGenerated={handleSmartgenPromptGenerated}
            onUseInOptimizer={(text) => {
              navigate("/prompt-optimization", { state: { initialText: text } });
            }}
          />
        </div>
      </div>
 
      <div className="mt-20">
        <Footer />
      </div>
      {showSubscriptionPopup && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-[#0D0D0E] border border-white/20 rounded-xl p-6 w-[350px] text-white text-center shadow-2xl">
      <h2 className="text-2xl font-semibold mb-3">Welcome to Tokun.ai!</h2>
      <p className="text-sm mb-6">
        Your organization account is created.  
        Please choose a subscription plan to continue.
      </p>

      <button
        onClick={() => {
          setShowSubscriptionPopup(false);
          navigate("/subscription");
        }}
        style={{ background: "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)" }}
        className="w-full py-2 rounded-md font-medium text-white"
      >
        View Subscription Plans
      </button>

      <button
        onClick={() => setShowSubscriptionPopup(false)}
        className="w-full mt-3 py-2 rounded-md border border-white/30 text-white"
      >
        Maybe Later
      </button>
    </div>
  </div>
)}

    </div>
  );
}