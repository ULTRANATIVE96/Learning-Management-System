import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { ThemeProvider } from './utils/ThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)

// Register Progressive Web App service worker (production only — in dev it would cache source files)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered successfully:', reg.scope))
      .catch(err => console.error('SW registration failed:', err));
  });
} else if ('serviceWorker' in navigator) {
  // Remove any previously registered dev service worker + its caches
  navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
  if (window.caches) caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
}

// Force clean redeploy on Vercel to inject new environment variables

