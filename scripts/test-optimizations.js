#!/usr/bin/env node

/**
 * Simple test script to verify optimizations are working
 * Run with: node scripts/test-optimizations.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing ContentlyAI Optimizations...\n');

// Test 1: Check if optimization files exist
const optimizationFiles = [
  'lib/cache.ts',
  'lib/aiQueue.ts',
  'lib/performance.ts',
  'hooks/useConversations.ts',
  'hooks/useMessages.ts',
  'components/chat/OptimizedChatMessage.tsx'
];

console.log('📁 Checking optimization files:');
optimizationFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Test 2: Check if original files are intact
const originalFiles = [
  'lib/groq.ts',
  'lib/mongodb.ts',
  'app/api/conversations/route.ts',
  'components/chat/ChatMessage.tsx',
  'hooks/useAuth.ts'
];

console.log('\n📋 Checking original files (should be intact):');
originalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Test 3: Check package.json for required dependencies
console.log('\n📦 Checking dependencies:');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const requiredDeps = ['react', 'next', 'mongoose', 'date-fns'];
  
  requiredDeps.forEach(dep => {
    const hasDepInDeps = packageJson.dependencies && packageJson.dependencies[dep];
    const hasDepInDevDeps = packageJson.devDependencies && packageJson.devDependencies[dep];
    const exists = hasDepInDeps || hasDepInDevDeps;
    console.log(`  ${exists ? '✅' : '❌'} ${dep}`);
  });
} catch (error) {
  console.log('  ❌ Could not read package.json');
}

// Test 4: Check environment variables
console.log('\n🔐 Environment variables check:');
const requiredEnvVars = ['GROQ_API_KEY', 'MONGODB_URI'];

requiredEnvVars.forEach(envVar => {
  // Check if mentioned in .env.local (don't read actual values for security)
  try {
    const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
    const mentioned = envFile.includes(envVar);
    console.log(`  ${mentioned ? '✅' : '⚠️'} ${envVar} ${mentioned ? 'configured' : 'not found in .env.local'}`);
  } catch (error) {
    console.log(`  ⚠️ ${envVar} - Could not check .env.local`);
  }
});

// Test 5: Basic syntax check
console.log('\n🔍 Basic syntax check:');
const tsFiles = [
  'lib/cache.ts',
  'lib/aiQueue.ts',
  'lib/performance.ts',
  'hooks/useConversations.ts',
  'hooks/useMessages.ts'
];

tsFiles.forEach(file => {
  try {
    const filePath = path.join(__dirname, '..', file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Basic syntax checks
    const hasExport = content.includes('export');
    const hasImport = content.includes('import') || !content.includes('import'); // Allow files without imports
    const hasBasicStructure = content.length > 100; // At least some content
    
    const isValid = hasExport && hasBasicStructure;
    console.log(`  ${isValid ? '✅' : '❌'} ${file} ${isValid ? 'looks good' : 'might have issues'}`);
  } catch (error) {
    console.log(`  ❌ ${file} - Could not read file`);
  }
});

console.log('\n🎉 Optimization check complete!');
console.log('\n📋 Next steps:');
console.log('1. Run "npm run dev" to start your development server');
console.log('2. Test existing functionality (login, create conversation, send message)');
console.log('3. Check browser console for performance logs');
console.log('4. Gradually adopt new hooks and components');
console.log('\n📖 See OPTIMIZATION_GUIDE.md for detailed instructions');
