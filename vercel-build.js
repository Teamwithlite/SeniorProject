// vercel-build.js
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

  try {
    const outputDir = path.join(__dirname, 'app', 'utils');
    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'vercel-config.ts');
    fs.writeFileSync(outputPath, warningContent);
    console.log('Created Vercel configuration file at:', outputPath);
  } catch (error) {
    console.error('Warning: Could not create Vercel config file:', error);
    // Continue instead of failing, this is not critical
  }
};

// Check dependencies but don't fail the build
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
    console.warn('Warning: Missing dependencies:', missingDeps.join(', '));
    console.warn('Continuing build with mock data fallback');
    // Don't exit - we'll use mock data instead
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
      console.error('Warning during Vercel build preparation:', error);
      // Don't fail the build, continue anyway
    }
  } else {
    console.log('Not running in Vercel environment, skipping preparation');
  }
};

main();