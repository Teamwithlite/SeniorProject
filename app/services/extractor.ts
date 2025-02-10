// app/services/extractor.ts
import puppeteer from 'puppeteer';
import type { ExtractedComponent, ComponentMetadata } from '~/types';

// Helper function to clean HTML by removing extra whitespace and comments
function cleanHTML(html: string): string {
  return html
    .replace(/(\r\n|\n|\r)/gm, '')
    .replace(/\s+/g, ' ')
    .replace(/<!--.*?-->/g, '')
    .trim();
}

// Main extraction function
export async function extractWebsite(url: string) {
  // Validate URL format
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL format. Please provide a complete URL starting with http:// or https://');
  }

  // Launch a headless browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // Create a new page and set viewport
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to the URL and wait for page load
    await page.goto(url, { 
      waitUntil: 'networkidle0', 
      timeout: 30000 
    });

    // Extract components using browser context
    const components = await page.evaluate(() => {
      function determineComponentType(element: Element): string | null {
        // Navigation detection
        if (element.tagName === 'NAV' || 
            element.classList.contains('nav') || 
            element.classList.contains('navbar')) {
          return 'navigation';
        }

        // Hero section detection
        if (element.querySelector('h1, h2') && 
            element.querySelector('p') && 
            (element.querySelector('button') || element.querySelector('a.button'))) {
          return 'hero';
        }

        // Button detection
        if (element.tagName === 'BUTTON' || 
            element.getAttribute('role') === 'button' || 
            (element.tagName === 'A' && element.classList.contains('button'))) {
          return 'button';
        }

        // Form detection
        if (element.tagName === 'FORM' || element.querySelector('form')) {
          return 'form';
        }

        return null;
      }

      // Process each element on the page
      const results: any[] = [];
      const processedElements = new Set();

      document.querySelectorAll('*').forEach((element) => {
        if (processedElements.has(element)) return;

        const type = determineComponentType(element);
        if (!type) return;

        // Get computed styles
        const styles = window.getComputedStyle(element);
        const tailwindClasses = [];

        // Convert CSS properties to Tailwind classes
        if (styles.display === 'flex') tailwindClasses.push('flex');
        if (styles.alignItems === 'center') tailwindClasses.push('items-center');
        if (styles.justifyContent === 'center') tailwindClasses.push('justify-center');
        // Add more style conversions as needed

        // Check accessibility
        const accessibility = {
          score: 100,
          issues: [] as string[]
        };

        if (type === 'button' && !element.getAttribute('aria-label')) {
          accessibility.score -= 10;
          accessibility.issues.push('Missing aria-label on button');
        }

        // Add component to results
        results.push({
          type,
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} Component`,
          html: element.outerHTML,
          code: element.outerHTML,
          metadata: {
            styles: tailwindClasses,
            accessibility,
            variant: type === 'button' ? 'default' : undefined,
            size: type === 'button' ? 'default' : undefined,
            content: element.textContent?.trim()
          }
        });

        processedElements.add(element);
      });

      return results;
    });

    await browser.close();
    
    // Filter and return results
    return { 
      components: components
        .filter(c => c.html.length > 50)
        .slice(0, 10)
    };
  } catch (error) {
    await browser.close();
    throw new Error(`Failed to extract UI components: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}