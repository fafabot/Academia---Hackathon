import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCww4Tnkn-PbM_F-YQlqAMjHNeIQX9klDI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "academia-aura.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "academia-aura",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "academia-aura.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "267073767631",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:267073767631:web:3940160d54309bb1a00fba",
};

export const isConfigured = Boolean(firebaseConfig.apiKey);

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
