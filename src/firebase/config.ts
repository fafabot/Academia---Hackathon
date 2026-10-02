import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration for Firebase with environment variables support and fallback for academia-aura
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForInitialSetup_AcademiaAura",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "academia-aura.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "academia-aura",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "academia-aura.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456",
};

// Check if credentials are placeholders
export const isConfigured = 
  Boolean(import.meta.env.VITE_FIREBASE_API_KEY) && 
  import.meta.env.VITE_FIREBASE_API_KEY !== "AIzaSyDummyKeyForInitialSetup_AcademiaAura";

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
