import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  crossOrigin: 'anonymous',
  
  // JavaScript optimization
  swcMinify: true, // Use SWC for faster minification
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      'lucide-react',
      'framer-motion',
      'react-syntax-highlighter'
    ],
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Tree shaking optimization
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };

      // Bundle splitting for better caching
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            name: 'ui-components',
            chunks: 'all',
            priority: 20,
          },
          ai: {
            test: /[\\/]node_modules[\\/](openai|groq-sdk|@ai-sdk)[\\/]/,
            name: 'ai-libs',
            chunks: 'all',
            priority: 20,
          },
        },
      };
    }

    return config;
  },

  // Compiler options for modern browsers
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Output optimization
  output: 'standalone',
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
};

export default nextConfig;
