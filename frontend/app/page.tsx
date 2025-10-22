'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to mint page
    router.replace('/mint');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-smokeWhite dark:bg-metallicBlack">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lightBlue mx-auto mb-4"></div>
        <p className="text-gray dark:text-smokeWhite">Redirecting to mint page...</p>
      </div>
    </div>
  );
}
