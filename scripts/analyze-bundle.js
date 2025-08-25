#!/usr/bin/env node

/**
 * Bundle analysis script to identify optimization opportunities
 * Run with: npm run analyze
 */

const fs = require('fs');
const path = require('path');

console.log('📊 Analyzing Bundle Size and Optimization Opportunities...\n');

// Check if build exists
const buildPath = path.join(__dirname, '..', '.next');
if (!fs.existsSync(buildPath)) {
  console.log('❌ No build found. Run "npm run build" first.');
  process.exit(1);
}

// Analyze package.json for heavy dependencies
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('📦 Heavy Dependencies Analysis:');
const heavyDependencies = {
  'framer-motion': 'Consider dynamic import for animations',
  'react-syntax-highlighter': 'Use dynamic import for code highlighting',
  '@radix-ui/react-dialog': 'Use dynamic import for modals',
  '@radix-ui/react-dropdown-menu': 'Use dynamic import for dropdowns',
  'recharts': 'Use dynamic import for charts',
  'firebase': 'Consider tree-shaking unused features',
  'mongoose': 'Server-side only, should not affect client bundle',
  'openai': 'Server-side only, should not affect client bundle',
  'groq-sdk': 'Server-side only, should not affect client bundle',
};

Object.keys(heavyDependencies).forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`  ⚠️  ${dep}: ${heavyDependencies[dep]}`);
  }
});

// Check for optimization files
console.log('\n🔧 Optimization Files Status:');
const optimizationFiles = [
  { file: 'components/DynamicImports.tsx', purpose: 'Dynamic imports for heavy components' },
  { file: 'lib/treeShaking.ts', purpose: 'Tree-shaking optimized imports' },
  { file: 'public/sw.js', purpose: 'Service worker for caching' },
  { file: 'next.config.ts', purpose: 'Webpack and build optimizations' },
];

optimizationFiles.forEach(({ file, purpose }) => {
  const filePath = path.join(__dirname, '..', file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${exists ? '✅' : '❌'} ${file} - ${purpose}`);
});

// Analyze Next.js config
console.log('\n⚙️  Next.js Configuration Analysis:');
const nextConfigPath = path.join(__dirname, '..', 'next.config.ts');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  const optimizations = [
    { check: 'swcMinify: true', description: 'SWC minification enabled' },
    { check: 'optimizePackageImports', description: 'Package import optimization' },
    { check: 'splitChunks', description: 'Bundle splitting configuration' },
    { check: 'removeConsole', description: 'Console removal in production' },
  ];

  optimizations.forEach(({ check, description }) => {
    const hasOptimization = nextConfig.includes(check);
    console.log(`  ${hasOptimization ? '✅' : '⚠️'} ${description}`);
  });
} else {
  console.log('  ❌ next.config.ts not found');
}

// Check service worker
console.log('\n🔄 Service Worker Analysis:');
const swPath = path.join(__dirname, '..', 'public', 'sw.js');
if (fs.existsSync(swPath)) {
  console.log('  ✅ Service worker exists');
  const swContent = fs.readFileSync(swPath, 'utf8');
  
  const swFeatures = [
    { check: 'addEventListener(\'install\'', description: 'Install event handler' },
    { check: 'addEventListener(\'fetch\'', description: 'Fetch event handler' },
    { check: 'caches.open', description: 'Cache API usage' },
    { check: 'pageshow', description: 'Back/forward cache optimization' },
  ];

  swFeatures.forEach(({ check, description }) => {
    const hasFeature = swContent.includes(check);
    console.log(`    ${hasFeature ? '✅' : '⚠️'} ${description}`);
  });
} else {
  console.log('  ❌ Service worker not found');
}

// Recommendations
console.log('\n💡 Optimization Recommendations:');
console.log('  1. Use dynamic imports for heavy components (framer-motion, recharts)');
console.log('  2. Implement tree-shaking for Radix UI components');
console.log('  3. Enable service worker for better caching');
console.log('  4. Optimize images with Next.js Image component');
console.log('  5. Use React.memo for expensive components');
console.log('  6. Implement code splitting for routes');
console.log('  7. Preload critical resources');
console.log('  8. Minimize third-party scripts');

// Bundle size estimation
console.log('\n📏 Bundle Size Optimization Tips:');
console.log('  • Current heavy deps that can be optimized:');
console.log('    - framer-motion: ~100KB (use dynamic import)');
console.log('    - react-syntax-highlighter: ~200KB (use dynamic import)');
console.log('    - @radix-ui components: ~50KB each (tree-shake)');
console.log('    - recharts: ~300KB (use dynamic import)');
console.log('  • Potential savings: ~500-600KB with proper optimization');

console.log('\n🚀 Next Steps:');
console.log('  1. Run "npm run build" to see current bundle sizes');
console.log('  2. Use the optimization files created');
console.log('  3. Replace direct imports with dynamic imports');
console.log('  4. Test performance improvements');
console.log('  5. Monitor Core Web Vitals');

console.log('\n✨ Analysis complete! Check the recommendations above.');
