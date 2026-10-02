import React from 'react';
import ReactDOM from 'react-dom/client';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { App } from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { app } from './firebase/config';
import './index.css';

const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

if (recaptchaSiteKey) {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
