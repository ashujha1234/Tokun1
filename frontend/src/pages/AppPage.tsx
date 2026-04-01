import Header from "@/components/Header";
import Landing from "@/pages/Landing";
import { useAuth } from "@/contexts/AuthContext";

export default function AppPage() {
  const { user } = useAuth();

  return (
    <div className="dark min-h-screen text-foreground" style={{ backgroundColor: "#030406" }}>
     

      {/* Reuse the Landing component in "app" variant.
          Shows the user's full name instead of Login.
          Buttons navigate to their respective in-app routes. */}
    
<Landing
  variant="app"
  userFullName={user?.name || user?.email || "User"}
  routes={{
    login: "/login",
    app: "/app",
    dashboard: "/dashboard",
    profile: "/account",
    promptLibrary: "/prompt-library",
    smartgen: "/smartgen",
    marketplace: "/prompt-marketplace",  // 👈 fixed
  }}
  showFooter={true}
/>

    </div>
  );
}
