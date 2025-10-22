'use client';

import { usePathname } from 'next/navigation';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Hide navbar and footer on docs page
  if (pathname === '/docs') {
    return null;
  }
  
  return <>{children}</>;
}
