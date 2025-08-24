'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { StickyBanner } from '@/components/ui/sticky-banner';
import { motion } from 'framer-motion';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StickyBanner>
          <p className="text-sm font-bold text-primary-foreground">
            This project is under development and is being upgraded day by day.
          </p>
        </StickyBanner>
        <LayoutWrapper>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </LayoutWrapper>
      </body>
    </html>
  );
}
