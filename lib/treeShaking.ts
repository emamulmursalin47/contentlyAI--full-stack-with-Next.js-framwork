// Tree-shaking optimized imports
// This file helps reduce bundle size by importing only what's needed

// Optimized Radix UI imports
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@radix-ui/react-dialog';

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@radix-ui/react-select';

export {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@radix-ui/react-tabs';

// Optimized Lucide React imports (tree-shakeable)
export {
  Bot,
  User,
  Send,
  Plus,
  Settings,
  LogOut,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Trash2,
  Edit,
  Search,
  Menu,
  X,
} from 'lucide-react';

// Optimized date-fns imports
export { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// Optimized React imports
export {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
  lazy,
  Suspense,
} from 'react';

// Utility function to create optimized imports
export const createOptimizedImport = <T>(
  importPath: string,
  namedImports: string[]
): Promise<Record<string, T>> => {
  return import(importPath).then((module) => {
    const optimized: Record<string, T> = {};
    namedImports.forEach((name) => {
      if (module[name]) {
        optimized[name] = module[name];
      }
    });
    return optimized;
  });
};

// Preload critical modules
export const preloadCriticalModules = (): void => {
  if (typeof window === 'undefined') return;

  // Preload modules that will be needed soon
  const criticalModules = [
    () => import('@radix-ui/react-dialog'),
    () => import('react-markdown'),
    () => import('date-fns'),
  ];

  // Use requestIdleCallback for non-blocking preloading
  const preloadModule = (moduleImport: () => Promise<any>) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        moduleImport().catch(() => {
          // Silently fail - preloading is optional
        });
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        moduleImport().catch(() => {
          // Silently fail - preloading is optional
        });
      }, 100);
    }
  };

  criticalModules.forEach(preloadModule);
};
