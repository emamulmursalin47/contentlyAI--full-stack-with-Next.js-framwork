'use client';

import { usePathname } from 'next/navigation';

import { FloatingDock } from '@/components/ui/floating-dock';

import FooterSection from '../FooterSection';
import {
 
  IconLogin,
  IconUserPlus,

} from '@tabler/icons-react';

const navItems = [
  // {
  //   title: 'Features',
  //   href: '/features',
  //   icon: <IconFileText className="h-4 w-4 text-foreground" />,
  // },
  // {
  //   title: 'Pricing',
  //   href: '/pricing',
  //   icon: <IconCoin className="h-4 w-4 text-foreground" />,
  // },
  // {
  //   title: 'About',
  //   href: '/about',
  //   icon: <IconInfoCircle className="h-4 w-4 text-foreground" />,
  // },
  // {
  //   title: 'Demos',
  //   href: '/demos',
  //   icon: <IconBrandDribbble className="h-4 w-4 text-foreground" />,
  // },
  
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

  // Check if the current path starts with any of the protected routes
  const showHeaderAndFooter = !protectedRoutes.some(route => pathname.startsWith(route));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      {showHeaderAndFooter && <FloatingDock items={navItems} />}
      
      <div className=" ">
        {children}
      </div>
      {showHeaderAndFooter && <FooterSection />}
    </div>
  );
}
