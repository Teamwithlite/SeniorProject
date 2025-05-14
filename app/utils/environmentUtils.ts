// app/utils/environmentUtils.ts

/**
 * Utility functions for environment detection and configuration
 */

/**
 * Check if the app is running in a Vercel environment
 */
export const isVercelEnvironment = (): boolean => {
    return process.env.VERCEL === '1' || !!process.env.VERCEL_URL;
  };
  
  /**
   * Check if the app is running in a development environment
   */
  export const isDevelopmentEnvironment = (): boolean => {
    return process.env.NODE_ENV === 'development';
  };
  
  /**
   * Check if the app is running in a serverless environment
   * This includes Vercel and other serverless platforms
   */
  export const isServerlessEnvironment = (): boolean => {
    return isVercelEnvironment() || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  };
  
  /**
   * Get appropriate configuration for the current environment
   */
  export const getEnvironmentConfig = () => {
    if (isVercelEnvironment()) {
      return {
        maxExtractionTimeMs: 25000, // 25 seconds for Vercel
        maxComponentsToExtract: 25,
        skipScreenshots: true,
        useMockDataFallback: true,
        enableCaching: true,
      };
    }
    
    if (isDevelopmentEnvironment()) {
      return {
        maxExtractionTimeMs: 60000, // 60 seconds for development
        maxComponentsToExtract: 50,
        skipScreenshots: false,
        useMockDataFallback: false,
        enableCaching: true,
      };
    }
    
    // Default production configuration
    return {
      maxExtractionTimeMs: 45000, // 45 seconds for production
      maxComponentsToExtract: 40,
      skipScreenshots: true,
      useMockDataFallback: false,
      enableCaching: true,
    };
  };