import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';

// Loading component for better UX
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
  </div>
);

// Dynamically import heavy components to reduce initial bundle size
export const DynamicReactMarkdown = dynamic(
  () => import('react-markdown'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // Disable SSR for client-only components
  }
);

export const DynamicSyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then(mod => mod.Prism),
  {
    loading: () => <div className="bg-gray-100 p-4 rounded">Loading code...</div>,
    ssr: false,
  }
);

export const DynamicRecharts = {
  LineChart: dynamic(
    () => import('recharts').then(mod => mod.LineChart),
    { loading: () => <LoadingSpinner />, ssr: false }
  ),
  BarChart: dynamic(
    () => import('recharts').then(mod => mod.BarChart),
    { loading: () => <LoadingSpinner />, ssr: false }
  ),
  PieChart: dynamic(
    () => import('recharts').then(mod => mod.PieChart),
    { loading: () => <LoadingSpinner />, ssr: false }
  ),
};

// Dynamic import for motion components
export const DynamicMotion = {
  div: dynamic(
    () => import('framer-motion').then(mod => mod.motion.div),
    { loading: () => <div />, ssr: false }
  ),
  span: dynamic(
    () => import('framer-motion').then(mod => mod.motion.span),
    { loading: () => <span />, ssr: false }
  ),
};

// Dynamic import for heavy UI components
export const DynamicDialog = dynamic(
  () => import('@radix-ui/react-dialog').then(mod => ({ 
    default: mod.Dialog 
  })),
  { loading: () => <div />, ssr: false }
);

export const DynamicDropdownMenu = dynamic(
  () => import('@radix-ui/react-dropdown-menu').then(mod => ({ 
    default: mod.DropdownMenu 
  })),
  { loading: () => <div />, ssr: false }
);

// Helper function to create dynamic imports with consistent loading
export const createDynamicImport = <T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T } | T>,
  options: {
    loading?: () => ReactNode;
    ssr?: boolean;
  } = {}
) => {
  return dynamic(importFn, {
    loading: options.loading || LoadingSpinner,
    ssr: options.ssr ?? false,
  });
};
