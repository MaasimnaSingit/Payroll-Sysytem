import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import { runMigrations } from './utils/migrations.js';
import './index.css';
import App from './App.jsx';

// Fallback no-op AuthProvider if the import above doesn't exist.
// (Cursor: only add this block if ./contexts/AuthContext.jsx is missing.)
/* START_OPTIONAL_NOOP_AUTH_PROVIDER
export const AuthContext = React.createContext({ user: null, loading: false });
export function AuthProvider({ children }) {
  return <AuthContext.Provider value={{ user: null, loading: false }}>{children}</AuthContext.Provider>;
}
END_OPTIONAL_NOOP_AUTH_PROVIDER */

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element #root not found in index.html');
}

// Set a sane title at runtime
if (typeof document !== 'undefined') {
  document.title = 'Payroll & Attendance System';
}

// Log unhandled errors so we don’t get a white screen with no info
window.addEventListener('error', (e) => console.error('[window.error]', e.error || e.message));
window.addEventListener('unhandledrejection', (e) => console.error('[unhandledrejection]', e.reason));

// Ensure legacy data is recalculated to hourly-only rules
runMigrations();

function renderFatal(err) {
  console.error('[BOOT FATAL]', err);
  const box = document.createElement('div');
  box.style.cssText = 'padding:24px; font-family:ui-sans-serif,system-ui; color:#e11d48';
  const h = document.createElement('h2');
  h.textContent = 'App failed to start';
  const pre = document.createElement('pre');
  pre.style.whiteSpace = 'pre-wrap';
  pre.style.color = '#e5e7eb';
  pre.style.background = '#111827';
  pre.style.padding = '12px';
  pre.style.borderRadius = '8px';
  pre.textContent = String(err?.stack || err?.message || err);
  box.appendChild(h);
  box.appendChild(pre);
  root.innerHTML = '';
  root.appendChild(box);
}

try {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (err) {
  renderFatal(err);
}