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
import { initTelemetry, installGlobalHandlers } from "./lib/telemetry";
/* Before anything renders, so nothing gets a log in first — including the
   third-party scripts index.html loads. See lib/silenceConsole.ts for how to
   turn it back on while debugging. */
silenceConsole();

/* Error reporting, before the first render.
 *
 * The listeners go on synchronously so a throw during initial render is already
 * covered; the SDK itself loads in the background (dynamic import, ~70 kB kept
 * out of the initial bundle) and reports queue up as no-ops until it is ready.
 * Not awaited — blocking first paint on a diagnostic tool would be the wrong
 * trade, and would make the tool a single point of failure for the whole app.
 *
 * No-op entirely unless VITE_APPINSIGHTS_CONNECTION_STRING is set, so dev and
 * any build without it behave exactly as before. See lib/telemetry.ts. */
installGlobalHandlers();
void initTelemetry();

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