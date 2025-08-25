#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Next.js Configuration Compatibility Checker
 * Ensures your next.config.ts is compatible with your Next.js version
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 Checking Next.js Configuration Compatibility...\n');

// Check Next.js version
const packageJsonPath = join(__dirname, '..', 'package.json');
let nextVersion = 'unknown';

try {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  nextVersion = packageJson.dependencies?.next || packageJson.devDependencies?.next || 'unknown';
  console.log(`📦 Next.js Version: ${nextVersion}`);
} catch (error) {
  console.log('❌ Could not read package.json');
}

// Parse version number
const versionMatch = nextVersion.match(/(\d+)\.(\d+)\.(\d+)/);
const majorVersion = versionMatch ? parseInt(versionMatch[1]) : 0;
const minorVersion = versionMatch ? parseInt(versionMatch[2]) : 0;

console.log(`🔢 Parsed Version: ${majorVersion}.${minorVersion}.x\n`);

// Check next.config.ts
const nextConfigPath = join(__dirname, '..', 'next.config.ts');
let configContent = '';

try {
  configContent = readFileSync(nextConfigPath, 'utf8');
  console.log('✅ next.config.ts found');
} catch (error) {
  console.log('❌ next.config.ts not found');
  process.exit(1);
}

// Configuration compatibility checks
const checks = [
  {
    name: 'swcMinify (deprecated in Next.js 13+)',
    test: /swcMinify\s*:/,
    compatible: majorVersion < 13,
    fix: 'Remove swcMinify - SWC is now the default minifier'
  },
  {
    name: 'experimental.optimizePackageImports',
    test: /optimizePackageImports/,
    compatible: majorVersion >= 13,
    fix: 'This feature requires Next.js 13+'
  },
  {
    name: 'compiler.removeConsole',
    test: /removeConsole/,
    compatible: majorVersion >= 12,
    fix: 'This feature requires Next.js 12+'
  },
  {
    name: 'output: standalone',
    test: /output\s*:\s*['"]standalone['"]/,
    compatible: majorVersion >= 12,
    fix: 'This feature requires Next.js 12+'
  },
  {
    name: 'images.formats',
    test: /images\s*:[\s\S]*formats/,
    compatible: majorVersion >= 12,
    fix: 'This feature requires Next.js 12+'
  },
  {
    name: 'transpilePackages',
    test: /transpilePackages/,
    compatible: majorVersion >= 13,
    fix: 'This feature requires Next.js 13+'
  }
];

console.log('🔧 Configuration Compatibility Check:\n');

let hasIssues = false;

checks.forEach(check => {
  const hasFeature = check.test.test(configContent);
  
  if (hasFeature) {
    if (check.compatible) {
      console.log(`  ✅ ${check.name} - Compatible`);
    } else {
      console.log(`  ❌ ${check.name} - INCOMPATIBLE`);
      console.log(`     Fix: ${check.fix}`);
      hasIssues = true;
    }
  }
});

// Additional checks for Next.js 15+
if (majorVersion >= 15) {
  console.log('\n🚀 Next.js 15+ Specific Checks:');
  
  const nextjs15Features = [
    {
      name: 'React 19 compatibility',
      check: () => {
        try {
          const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
          const reactVersion = pkg.dependencies?.react || '0.0.0';
          const reactMajor = parseInt(reactVersion.match(/(\d+)/)?.[1] || '0');
          return reactMajor >= 19;
        } catch {
          return false;
        }
      },
      fix: 'Update to React 19 for full Next.js 15 compatibility'
    },
    {
      name: 'Turbopack usage',
      check: () => configContent.includes('turbo') || process.argv.includes('--turbo'),
      fix: 'Consider using --turbo flag for faster development builds'
    }
  ];

  nextjs15Features.forEach(feature => {
    const isCompatible = feature.check();
    console.log(`  ${isCompatible ? '✅' : '⚠️'} ${feature.name} - ${isCompatible ? 'OK' : 'Recommended'}`);
    if (!isCompatible) {
      console.log(`     Suggestion: ${feature.fix}`);
    }
  });
}

// Performance recommendations
console.log('\n⚡ Performance Recommendations:');

const performanceChecks = [
  {
    name: 'Bundle analysis',
    check: configContent.includes('@next/bundle-analyzer'),
    recommendation: 'Add @next/bundle-analyzer for bundle size monitoring'
  },
  {
    name: 'Compression enabled',
    check: configContent.includes('compress'),
    recommendation: 'Enable compression for better performance'
  },
  {
    name: 'Image optimization',
    check: configContent.includes('images'),
    recommendation: 'Configure image optimization settings'
  }
];

performanceChecks.forEach(check => {
  console.log(`  ${check.check ? '✅' : '💡'} ${check.name}`);
  if (!check.check) {
    console.log(`     Tip: ${check.recommendation}`);
  }
});

// Summary
console.log('\n📋 Summary:');
if (hasIssues) {
  console.log('❌ Configuration has compatibility issues that need to be fixed');
  console.log('🔧 Please update your next.config.ts based on the recommendations above');
} else {
  console.log('✅ Configuration is compatible with your Next.js version');
  console.log('🎉 All checks passed!');
}

// Generate fixed config if needed
if (hasIssues && majorVersion >= 13) {
  console.log('\n🛠️ Generating compatible configuration...');
  
  const fixedConfig = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Basic configuration
  crossOrigin: 'anonymous',
  
  // Experimental features (Next.js ${majorVersion}+)
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'lucide-react',
      'framer-motion'
    ],
  },

  // Compiler options (SWC is default in Next.js ${majorVersion}+)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Performance optimizations
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;`;

  const backupPath = join(__dirname, '..', 'next.config.ts.backup');
  const fixedPath = join(__dirname, '..', 'next.config.fixed.ts');
  
  try {
    // Create backup
    writeFileSync(backupPath, configContent);
    console.log(`📁 Backup created: next.config.ts.backup`);
    
    // Create fixed version
    writeFileSync(fixedPath, fixedConfig);
    console.log(`🔧 Fixed config created: next.config.fixed.ts`);
    console.log('   Review the fixed config and replace your current one if needed');
  } catch (error) {
    console.log('❌ Could not create fixed configuration files');
  }
}

console.log('\n🎯 Next Steps:');
console.log('1. Fix any compatibility issues shown above');
console.log('2. Test your application: npm run dev');
console.log('3. Run build to verify: npm run build');
console.log('4. Monitor bundle size: npm run analyze');

console.log('\n✨ Configuration check complete!');
