'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSettings } from '@/lib/settingsStore';

/**
 * Handles automatic redirect when switching from Developer to Creator mode
 * while on a developer-only page
 */
export default function ModeRedirectHandler() {
  const pathname = usePathname();
  const router = useRouter();
  const { appMode } = useSettings();

  useEffect(() => {
    // If in Creator mode and on test-wallet page, redirect to home
    if (appMode === 'creator' && pathname === '/test-wallet') {
      router.push('/');
    }
  }, [appMode, pathname, router]);

  return null;
}

