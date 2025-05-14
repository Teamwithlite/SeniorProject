// app/types/chromium.d.ts

declare module '@sparticuz/chromium' {
    /**
     * Args for launching Chrome
     */
    export const args: string[];
    
    /**
     * Default viewport settings
     */
    export const defaultViewport: {
      width: number;
      height: number;
      deviceScaleFactor: number;
      isMobile: boolean;
      hasTouch: boolean;
      isLandscape: boolean;
    };
    
    /**
     * Whether Chrome should run in headless mode
     */
    export const headless: boolean | 'new';
    
    /**
     * Function to get the path to the Chromium executable
     */
    export function executablePath(): Promise<string>;
    
    /**
     * Install Chromium
     */
    export function install(): Promise<void>;
  }