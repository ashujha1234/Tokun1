// import { createRoot } from 'react-dom/client'
// import App from './App.tsx'
// import './index.css'
// import {}

// createRoot(document.getElementById("root")!).render(<App />);



import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { silenceConsole } from "./lib/silenceConsole";
import { captureReferralFromUrl } from "./lib/referral";
import { AuthProvider } from "./contexts/AuthContext";
import { PromptProvider } from "./contexts/PromptContext";
 import { CallProvider } from './contexts/CallContext.tsx';
import AppErrorBoundary from "./components/AppErrorBoundary";
/* Before anything renders, so nothing gets a log in first — including the
   third-party scripts index.html loads. See lib/silenceConsole.ts for how to
   turn it back on while debugging. */
silenceConsole();

/* Before the router touches the URL — it reads ?ref=, stores it, and strips it
   out of the address bar. See lib/referral.ts. */
captureReferralFromUrl();

/* Outermost, above the providers — not inside App.
   A provider that throws while initialising (AuthContext reading a corrupted
   token out of localStorage is the realistic one) does it BEFORE App renders,
   so a boundary inside App would never see it. That was the white screen with
   no way back. App.tsx has its own, narrower boundary around the routed page,
   which keeps the header and navigation alive; this one is the floor. */
createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <PromptProvider>
      <AuthProvider>
        <CallProvider>
          <App />
        </CallProvider>
      </AuthProvider>
    </PromptProvider>
  </AppErrorBoundary>
);