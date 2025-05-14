// app/utils/clientDetection.ts

/**
 * Client-side utilities to detect if we're running on Vercel
 */

/**
 * Detects if the app is running on Vercel based on URL patterns
 */
export const isRunningOnVercel = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const url = window.location.hostname;
    return (
      url.endsWith('.vercel.app') ||
      url.includes('vercel.app') ||
      url.includes('.vercel.') ||
      // Additional hint might be provided by the server
      (window as any).__VERCEL_DEPLOYMENT === true
    );
  };
  
  /**
   * Checks if the current environment is likely a serverless environment
   * based on client-side information
   */
  export const isLikelyServerless = (): boolean => {
    return isRunningOnVercel();
  };
  
  /**
   * Provides appropriate configuration for component extraction based on environment
   */
  export const getClientExtractionConfig = () => {
    if (isRunningOnVercel()) {
      return {
        maxComponents: 25,
        skipScreenshots: true,
        expectMockData: true,
        showWarnings: true,
      };
    }
    
    // Default configuration for non-Vercel environments
    return {
      maxComponents: 50,
      skipScreenshots: false,
      expectMockData: false,
      showWarnings: false,
    };
  };