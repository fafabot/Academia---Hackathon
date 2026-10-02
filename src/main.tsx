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
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true
    });
  } catch (error) {
    console.warn('App Check não pôde ser inicializado. O aplicativo continuará carregando.', error);
  }
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
