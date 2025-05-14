// vercel-build.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  }
};

// Like the Reddit thread suggested, make your code robust with better error handling
const main = () => {
  console.log('Running Vercel build preparation script...');
  
  try {
    if (process.env.VERCEL === '1') {
      console.log('Vercel environment detected');
      writeVercelWarning();
      console.log('✅ Vercel build preparation completed successfully');
    } else {
      console.log('Not running in Vercel environment, skipping preparation');
    }
  } catch (error) {
    // Instead of failing, log the error and continue
    console.error('⚠️ Warning during build preparation:', error.message);
    console.log('Continuing build process despite errors...');
  }
};

main();