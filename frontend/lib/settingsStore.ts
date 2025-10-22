import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppMode = 'creator' | 'developer';
export type ThemeMode = 'light' | 'dark';

interface SettingsState {
  // App mode
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  
  // Theme
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  
  // Developer mode acknowledgment
  hasAcknowledgedDevMode: boolean;
  acknowledgeDevMode: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      // Default to creator mode
      appMode: 'creator',
      setAppMode: (mode) => set({ appMode: mode }),
      
      // Default to light theme
      themeMode: 'light',
      setThemeMode: (mode) => set({ themeMode: mode }),
      toggleTheme: () => set((state) => ({ 
        themeMode: state.themeMode === 'light' ? 'dark' : 'light' 
      })),
      
      // Developer mode acknowledgment
      hasAcknowledgedDevMode: false,
      acknowledgeDevMode: () => set({ hasAcknowledgedDevMode: true }),
    }),
    {
      name: 'artistic-splash-settings',
    }
  )
);

