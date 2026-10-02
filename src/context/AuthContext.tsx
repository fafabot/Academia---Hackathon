import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  registerWithEmail,
  loginWithEmail,
  logoutUser,
  resetUserPassword,
  subscribeToAuth,
  loginAnonymously,
} from '../firebase/authService';
import {
  getUserProfileDoc,
  updateUserProfileDoc,
  createUserProfileDoc,
} from '../firebase/firestoreService';
import { UserProfile, ThemeMode } from '../types';
import { useTheme } from './ThemeContext';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  signup: (email: string, pass: string, name: string, initialData: Partial<UserProfile>) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  loginAsDemoAthlete: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createDemoProfile = (uid: string): UserProfile => ({
  uid,
  email: 'atleta@aura.com',
  displayName: 'Alex Silva (Atleta)',
  targetWeight: 78,
  dailyCalorieGoal: 2450,
  currentWeight: 82.4,
  height: 178,
  activityLevel: 'moderate',
  themePreference: 'dark',
  createdAt: '2026-09-01T08:00:00.000Z',
  updatedAt: new Date().toISOString(),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { setTheme } = useTheme();

  // Load profile helper
  const loadProfile = async (uid: string) => {
    try {
      let p = await getUserProfileDoc(uid);
      if (!p && uid === DEMO_USER_ID) {
        p = DEMO_PROFILE;
      }
      if (p) {
        setProfile(p);
        if (p.themePreference) {
          setTheme(p.themePreference);
        }
      }
    } catch (e) {
      console.warn('Error loading profile:', e);
    }
  };

  useEffect(() => {
    // Check if demo session was saved
    const savedDemo = localStorage.getItem('aura_is_demo') === 'true';
    if (savedDemo) {
      setIsDemoMode(true);
      loginAnonymously()
        .then(async (firebaseUser) => {
          setUser(firebaseUser);
          setIsDemoMode(true);
          const demoProfile = createDemoProfile(firebaseUser.uid);
          await createUserProfileDoc(demoProfile);
          setProfile(demoProfile);
          setTheme(demoProfile.themePreference);
        })
        .catch((error) => {
          console.error('Erro ao iniciar modo demonstração:', error);
          localStorage.removeItem('aura_is_demo');
          setIsDemoMode(false);
          setUser(null);
          setProfile(null);
        })
        .finally(() => setLoading(false));
      return;
    }

    const unsubscribe = subscribeToAuth(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email: string, pass: string, name: string, initialData: Partial<UserProfile>) => {
    setLoading(true);
    try {
      const newUser = await registerWithEmail(email, pass, name, initialData);
      setUser(newUser);
      await loadProfile(newUser.uid);
      setIsDemoMode(false);
      localStorage.removeItem('aura_is_demo');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const loggedUser = await loginWithEmail(email, pass);
      setUser(loggedUser);
      await loadProfile(loggedUser.uid);
      setIsDemoMode(false);
      localStorage.removeItem('aura_is_demo');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      localStorage.removeItem('aura_is_demo');
      setUser(null);
      setProfile(null);
      return;
    }
    await logoutUser();
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    await resetUserPassword(email);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    await updateUserProfileDoc(user.uid, data);
    setProfile((prev) => (prev ? { ...prev, ...data } : null));
    if (data.themePreference) {
      setTheme(data.themePreference);
    }
  };

  const loginAsDemoAthlete = () => {
    setIsDemoMode(true);
    localStorage.setItem('aura_is_demo', 'true');
    loginAnonymously()
      .then(async (firebaseUser) => {
        setUser(firebaseUser);
        const demoProfile = createDemoProfile(firebaseUser.uid);
        await createUserProfileDoc(demoProfile);
        setProfile(demoProfile);
        setTheme(demoProfile.themePreference);
      })
      .catch((error) => {
        console.error('Erro ao iniciar modo demonstração:', error);
        setIsDemoMode(false);
        localStorage.removeItem('aura_is_demo');
        setUser(null);
        setProfile(null);
      });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isDemoMode,
        signup,
        login,
        logout,
        resetPassword,
        updateProfileData,
        loginAsDemoAthlete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
