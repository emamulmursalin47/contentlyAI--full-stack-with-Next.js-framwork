'use client';

import { FloatingDock } from '@/components/ui/floating-dock';
import {
  IconFileText,
  IconCoin,
  IconInfoCircle,
  IconMail,
  IconLogin,
  IconUserPlus,
} from '@tabler/icons-react';

const navItems = [
  {
    title: 'Features',
    href: '/features',
    icon: <IconFileText className="h-4 w-4 text-foreground" />,
  },
  {
    title: 'Pricing',
    href: '/pricing',
    icon: <IconCoin className="h-4 w-4 text-foreground" />,
  },
  {
    title: 'About',
    href: '/about',
    icon: <IconInfoCircle className="h-4 w-4 text-foreground" />,
  },
  {
    title: 'Contact',
    href: '/contact',
    icon: <IconMail className="h-4 w-4 text-foreground" />,
  },
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

export default function Header() {
  return (
    <header className="fixed top-12 z-50 w-full mx-auto">
      <FloatingDock items={navItems} />
    </header>
  );
}
