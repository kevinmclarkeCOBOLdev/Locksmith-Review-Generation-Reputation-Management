'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('lockreview-theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // Default to dark mode adhering to LockQuote dark aesthetic
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('lockreview-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeToggle({
  iconOnly = false,
  className = '',
}: {
  iconOnly?: boolean;
  className?: string;
} = {}) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      suppressHydrationWarning
      className={
        className ||
        `p-2 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#282828] border border-slate-200 dark:border-[#383838] transition-all cursor-pointer flex items-center justify-center ${iconOnly ? 'w-9 h-9' : 'gap-2 text-xs font-semibold'
        }`
      }
      title={`Switch to ${isLight ? 'Dark' : 'Light'} mode`}
      aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} mode`}
    >
      {isLight ? (
        <Moon size={16} className="text-slate-600 dark:text-neutral-400 shrink-0" />
      ) : (
        <Sun size={16} className="text-amber-400 shrink-0" />
      )}
      {!iconOnly && <span className="capitalize">{mounted ? theme : 'dark'}</span>}
    </button>
  );
}
