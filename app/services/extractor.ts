// services/extractor.ts
import puppeteer from 'puppeteer';
import type { ComponentStyle, ExtractedComponent } from '~/types';

const COMPONENT_SELECTORS = {
  buttons: 'button, .btn, [role="button"]',
  navigation: 'nav, [role="navigation"]',
  cards: '.card, [class*="card"]',
  forms: 'form, .form',
  headers: 'header, .header',
  footers: 'footer, .footer',
  hero: '[class*="hero"]',
  modals: '[role="dialog"], .modal',
};

const cleanHTML = (html: string): string => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/style="[^"]*"/gi, '')
    .replace(/class="[^"]*"/gi, (match) => {
      const classes = match.match(/class="([^"]*)"/)![1];
      const importantClasses = classes
        .split(' ')
        .filter(cls => !cls.includes(':') && !cls.match(/^(w-|h-|p-|m-|text-)/))
        .join(' ');
      return importantClasses ? `class="${importantClasses}"` : '';
    });
};

export async function extractWebsite(url: string): Promise<{ components: ExtractedComponent[] }> {
  if (!url.startsWith('http')) {
    throw new Error('Invalid URL format. Must start with http or https.');
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set viewport
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    // Navigate to the page
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Extract components
    const components = await page.evaluate((selectors) => {
      function getComputedStylesForElement(element: Element) {
        const computed = window.getComputedStyle(element);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          padding: computed.padding,
          margin: computed.margin,
          borderRadius: computed.borderRadius,
          fontSize: computed.fontSize,
          display: computed.display,
          flexDirection: computed.flexDirection,
          alignItems: computed.alignItems,
          justifyContent: computed.justifyContent,
          width: computed.width,
          height: computed.height,
        };
      }

      const results: any[] = [];
      Object.entries(selectors).forEach(([type, selector]) => {
        document.querySelectorAll(selector).forEach((element) => {
          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            results.push({
              type,
              name: `${type.charAt(0).toUpperCase() + type.slice(1)} Component`,
              html: element.outerHTML,
              styles: getComputedStylesForElement(element),
              metadata: {
                tagName: element.tagName.toLowerCase(),
                classes: Array.from(element.classList),
                dimensions: {
                  width: rect.width,
                  height: rect.height,
                }
              }
            });
          }
        });
      });
      return results;
    }, COMPONENT_SELECTORS);

    // Clean up the HTML for each component
    const cleanedComponents = components.map(component => ({
      ...component,
      cleanHtml: cleanHTML(component.html)
    }));

    await browser.close();
    return { components: cleanedComponents };
  } catch (error) {
    await browser.close();
    console.error('Extraction error:', error);
    throw new Error(`Failed to extract UI components: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}