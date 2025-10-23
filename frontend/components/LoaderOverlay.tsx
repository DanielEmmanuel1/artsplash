'use client';

import { useSettings } from '@/lib/settingsStore';

export default function LoaderOverlay() {
  const { isGlobalLoading } = useSettings();
  if (!isGlobalLoading) return null;
  return (
    <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-lightBlue border-t-transparent" />
    </div>
  );
}


