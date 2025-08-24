'use client';

import { usePathname } from 'next/navigation';

import FooterSection from '../FooterSection';
import Header from './Header';

const protectedRoutes = ['/chat']; // Add other protected routes here, e.g., '/dashboard'

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if the current path starts with any of the protected routes
  const showHeaderAndFooter = !protectedRoutes.some(route => pathname.startsWith(route));

  return (
    <>
      {showHeaderAndFooter && <Header />}
      {children}
      {showHeaderAndFooter && <FooterSection />}
    </>
  );
}
