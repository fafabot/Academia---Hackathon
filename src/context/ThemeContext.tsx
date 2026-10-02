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
  { id: 'emerald', name: 'Verde Aura (Florestal)', icon: '🌿', previewClass: 'bg-emerald-950 border-emerald-600 text-emerald-100' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', icon: '⚡', previewClass: 'bg-purple-950 border-cyan-400 text-cyan-200' },
  { id: 'sunset', name: 'Sunset Amber', icon: '🌅', previewClass: 'bg-amber-950 border-orange-500 text-amber-100' },
];

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialTheme?: ThemeMode }> = ({
  children,
  initialTheme = 'dark',
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('aura_theme') as ThemeMode;
    return saved || initialTheme;
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('aura_theme', newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    // Remove all old theme classes
    root.classList.remove('dark', 'theme-light', 'theme-emerald', 'theme-cyberpunk', 'theme-sunset');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.add('theme-light');
    } else if (theme === 'emerald') {
      root.classList.add('dark', 'theme-emerald');
    } else if (theme === 'cyberpunk') {
      root.classList.add('dark', 'theme-cyberpunk');
    } else if (theme === 'sunset') {
      root.classList.add('dark', 'theme-sunset');
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
