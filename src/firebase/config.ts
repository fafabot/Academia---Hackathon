import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

export const firebaseConfig = {
  apiKey: "AIzaSyCww4Tnkn-PbM_F-YQlqAMjHNeIQX9klDI",
  authDomain: "academia-aura.firebaseapp.com",
  projectId: "academia-aura",
  storageBucket: "academia-aura.firebasestorage.app",
  messagingSenderId: "267073767631",
  appId: "1:267073767631:web:3940160d54309bb1a00fba",
};

export const isConfigured = Boolean(firebaseConfig.apiKey);

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

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

export const auth = getAuth(app);
export const db = getFirestore(app);
