import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  availableThemes: { id: ThemeMode; name: string; icon: string; previewClass: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const availableThemes: { id: ThemeMode; name: string; icon: string; previewClass: string }[] = [
  { id: 'dark', name: 'Escuro Minimalista', icon: '🌙', previewClass: 'bg-slate-900 border-slate-700 text-white' },
  { id: 'light', name: 'Claro Clean', icon: '☀️', previewClass: 'bg-white border-slate-200 text-slate-800' },
];

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialTheme?: ThemeMode }> = ({
  children,
  initialTheme = 'dark',
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('aura_theme');
    const normalizedTheme = saved === 'dark' || saved === 'light' ? saved : initialTheme;
    return normalizedTheme;
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('aura_theme', newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-light', 'theme-emerald', 'theme-cyberpunk', 'theme-sunset');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.add('theme-light');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
