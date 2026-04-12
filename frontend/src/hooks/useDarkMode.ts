"use client";

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useDarkMode() {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    // Determine initial theme
    const saved = (typeof window !== 'undefined') ? (localStorage.getItem('theme') as Theme | null) : null;
    const systemDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial: Theme = saved ?? (systemDark ? 'dark' : 'light');
    setThemeState(initial);
    // Apply to document root
    const root = document.documentElement;
    if (initial === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', t);
      document.documentElement.classList.toggle('dark', t === 'dark');
    }
  };

  return { theme, setTheme };
}
