'use client';

import { useEffect } from 'react';
import { useSettings } from '@/lib/settingsStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themeMode } = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  return <>{children}</>;
}

