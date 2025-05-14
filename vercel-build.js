// scripts/vercel-build.js
// This script runs before the build on Vercel to ensure compatibility

const fs = require('fs');
const path = require('path');

// Write a warning file that will be included in the build
const writeVercelWarning = () => {
  const warningContent = `
// This file is auto-generated during the build process
// It contains configurations for running the app on Vercel

export const VERCEL_ENVIRONMENT = true;
export const EXTRACTION_LIMITATIONS = {
  useMockData: true,
  maxComponents: 25,
  timeoutMs: 25000,
  showWarning: true,
};

console.log('Running in Vercel environment with extraction limitations');
`;

  const outputPath = path.join(__dirname, '..', 'app', 'utils', 'vercel-config.ts');
  fs.writeFileSync(outputPath, warningContent);
  console.log('Created Vercel configuration file at:', outputPath);
};

// Check node_modules to ensure dependencies are installed
const checkDependencies = () => {
  const requiredDeps = [
    '@sparticuz/chromium',
    'puppeteer-core'
  ];

  const missingDeps = [];
  
  for (const dep of requiredDeps) {
    try {
      require.resolve(dep);
    } catch (e) {
      missingDeps.push(dep);
    }
  }

  if (missingDeps.length > 0) {
    console.error('Missing required dependencies:', missingDeps.join(', '));
    process.exit(1);
  }
};

// Main function
const main = () => {
  console.log('Running Vercel build preparation script...');
  
  // Only perform these actions if we're in a Vercel environment
  if (process.env.VERCEL === '1') {
    console.log('Vercel environment detected');
    
    try {
      checkDependencies();
      writeVercelWarning();
      console.log('Vercel build preparation completed successfully');
    } catch (error) {
      console.error('Error during Vercel build preparation:', error);
      process.exit(1);
    }
  } else {
    console.log('Not running in Vercel environment, skipping preparation');
  }
};

main();