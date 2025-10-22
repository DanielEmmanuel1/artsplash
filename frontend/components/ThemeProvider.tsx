'use client';

import { useEffect } from 'react';
import { useSettings } from '@/lib/settingsStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themeMode } = useSettings();

  // Apply theme immediately on mount and when it changes
  useEffect(() => {
    const root = document.documentElement;
    
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  // Also apply on initial render (SSR)
  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem('artistic-splash-settings');
    
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        if (settings.state?.themeMode === 'dark') {
          root.classList.add('dark');
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, []);

  return <>{children}</>;
}

