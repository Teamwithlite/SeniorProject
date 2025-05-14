// scripts/verify-build.js
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying build process...');

try {
  // Set environment variables to simulate Vercel
  process.env.VERCEL = '1';
  
  // Run the build preparation script
  console.log('📦 Running build preparation script...');
  execSync('node vercel-build.js', { stdio: 'inherit' });
  
  // Run the actual build
  console.log('🏗️ Running build...');
  execSync('remix vite:build', { stdio: 'inherit' });
  
  // Check if build output exists
  const serverBuildPath = path.join(__dirname, '..', 'build', 'server', 'index.js');
  if (fs.existsSync(serverBuildPath)) {
    console.log('✅ Build successful! Server bundle created.');
  } else {
    throw new Error('Server bundle not found at: ' + serverBuildPath);
  }
  
  console.log('✅ Verification complete! Your build should work on Vercel.');
} catch (error) {
  console.error('❌ Build verification failed:', error.message);
  process.exit(1);
}