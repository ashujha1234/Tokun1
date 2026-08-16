// import { createRoot } from 'react-dom/client'
// import App from './App.tsx'
// import './index.css'
// import {}

// createRoot(document.getElementById("root")!).render(<App />);



import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { silenceConsole } from "./lib/silenceConsole";
import { AuthProvider } from "./contexts/AuthContext";
import { PromptProvider } from "./contexts/PromptContext";
 import { CallProvider } from './contexts/CallContext.tsx';
/* Before anything renders, so nothing gets a log in first — including the
   third-party scripts index.html loads. See lib/silenceConsole.ts for how to
   turn it back on while debugging. */
silenceConsole();

createRoot(document.getElementById("root")!).render(
  <PromptProvider>
    <AuthProvider>
     <CallProvider>
  <App />
</CallProvider>

    </AuthProvider>
  </PromptProvider>
);