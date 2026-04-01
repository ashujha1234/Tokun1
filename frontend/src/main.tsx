// import { createRoot } from 'react-dom/client'
// import App from './App.tsx'
// import './index.css'
// import {}

// createRoot(document.getElementById("root")!).render(<App />);



import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from "./contexts/AuthContext";
import { PromptProvider } from "./contexts/PromptContext";
 import { CallProvider } from './contexts/CallContext.tsx';
createRoot(document.getElementById("root")!).render(
  <PromptProvider>
    <AuthProvider>
     <CallProvider>
  <App />
</CallProvider>

    </AuthProvider>
  </PromptProvider>
);