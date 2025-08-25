'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { SkipToMainContent } from '@/components/ui/AccessibleComponents';

// Optimize font loading
const inter = Inter({ 
  subsets: ['latin'], 
  display: 'swap', // Better font loading performance
  preload: true,
});

// Dynamically import motion to reduce initial bundle size
const DynamicMotion = dynamic(
  () => import('framer-motion').then(mod => mod.motion.div),
  { 
    loading: () => <div className="opacity-0" />,
    ssr: false 
  }
);

// Loading component for Suspense boundaries
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0a0118]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed] mx-auto mb-4"></div>
      <p className="text-[#e2e8f0]">Loading ContentlyAI...</p>
    </div>
  </div>
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Set document title dynamically
    document.title = 'ContentlyAI - AI-Powered Content Creation Platform';
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Create engaging social media content with AI assistance. Optimize for Twitter, LinkedIn, Instagram, and more platforms.';
      document.head.appendChild(meta);
    }

    // Load accessibility utilities in development
    if (process.env.NODE_ENV === 'development') {
      import('@/lib/accessibility').then(({ runAccessibilityAudit, testColorContrasts, calculateContrastRatio, meetsWCAGStandards }) => {
        (window as typeof window & {
          accessibilityUtils?: {
            runAudit: () => void;
            testContrasts: () => void;
            calculateContrastRatio: (color1: string, color2: string) => number;
            meetsWCAGStandards: (fg: string, bg: string, level?: 'AA' | 'AAA', size?: 'normal' | 'large') => boolean;
          };
        }).accessibilityUtils = {
          runAudit: runAccessibilityAudit,
          testContrasts: testColorContrasts,
          calculateContrastRatio,
          meetsWCAGStandards
        };
        console.log('🔍 Accessibility testing utilities loaded. Try:');
        console.log('  window.accessibilityUtils.runAudit()');
        console.log('  window.accessibilityUtils.testContrasts()');
      });
    }

    // Register service worker for better caching and BF cache
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }

    // Optimize for back/forward cache
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from back/forward cache
        console.log('Page restored from BF cache');
        window.dispatchEvent(new CustomEvent('bfcache-restore'));
      }
    };

    const handlePageHide = (event: PageTransitionEvent) => {
      // Clean up to improve back/forward cache eligibility
      if (event.persisted) {
        console.log('Page stored in BF cache');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Clean up any ongoing operations for better BF cache
        // Cancel any pending requests, close connections, etc.
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Preload critical modules during idle time
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Preload modules that will be needed
        import('@radix-ui/react-dialog').catch(() => {});
        import('react-markdown').catch(() => {});
      });
    }

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <html lang="en">
      <Head>
        <title>ContentlyAI - AI-Powered Content Creation Platform</title>
        <meta name="description" content="Create engaging social media content with AI assistance. Optimize for Twitter, LinkedIn, Instagram, and more platforms." />
        <meta name="keywords" content="AI, content creation, social media, automation, Twitter, LinkedIn, Instagram" />
        <meta name="author" content="ContentlyAI Team" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#7c3aed" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ContentlyAI - AI-Powered Content Creation Platform" />
        <meta property="og:description" content="Create engaging social media content with AI assistance" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ContentlyAI - AI-Powered Content Creation Platform" />
        <meta name="twitter:description" content="Create engaging social media content with AI assistance" />
        
        {/* Preload critical resources */}
        <link rel="dns-prefetch" href="//api.groq.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://api.groq.com" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <head>
        {/* Additional head elements for better performance */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className={inter.className}>
        <SkipToMainContent />
        <Suspense fallback={<PageLoading />}>
          <LayoutWrapper>
            <main id="main-content" tabIndex={-1}>
              <DynamicMotion
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {children}
              </DynamicMotion>
            </main>
          </LayoutWrapper>
        </Suspense>
      </body>
    </html>
  );
}
