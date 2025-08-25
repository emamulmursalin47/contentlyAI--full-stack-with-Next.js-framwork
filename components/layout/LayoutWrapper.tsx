'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FloatingDock } from '@/components/ui/floating-dock';
import FooterSection from '../FooterSection';
import {
  IconLogin,
  IconUserPlus,
} from '@tabler/icons-react';

const navItems = [
  {
    title: 'Login',
    href: '/login',
    icon: <IconLogin className="h-4 w-4 text-foreground" />,
  },
  {
    title: 'Register',
    href: '/register',
    icon: <IconUserPlus className="h-4 w-4 text-foreground" />,
  },
];

const protectedRoutes = ['/chat']; 

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  // Check if the current path starts with any of the protected routes
  const showHeaderAndFooter = !protectedRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    // Delay footer rendering until content is ready
    const timer = setTimeout(() => {
      setIsContentLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col">
      {showHeaderAndFooter && <FloatingDock items={navItems} />}
      
      <div className="flex-1 min-h-0">
        {children}
      </div>
      
      {/* Only render footer after content is loaded */}
      {showHeaderAndFooter && isContentLoaded && <FooterSection />}
    </div>
  );
}
