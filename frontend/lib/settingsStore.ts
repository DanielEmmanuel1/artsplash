import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppMode = 'demo' | 'creator' | 'developer';
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

  // Onboarding modal
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: () => void;
  onboardingVersion: number;
  setOnboardingVersion: (v: number) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      // Default to demo mode (no on-chain actions until user opts in)
      appMode: 'demo',
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

      // Onboarding (versioned)
      hasSeenOnboarding: false,
      setHasSeenOnboarding: () => set({ hasSeenOnboarding: true }),
      onboardingVersion: 1,
      setOnboardingVersion: (v: number) => set({ onboardingVersion: v }),
    }),
    {
      name: 'artistic-splash-settings',
    }
  )
);

