// app/services/extractor.ts
import puppeteer from 'puppeteer'
import type { ExtractedComponent } from '~/types'

/**
 * Remove unnecessary scripts and inline styles from the extracted HTML.
 */
const cleanHTML = (html: string): string => {
  return html
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

// Priority-based component selectors
const COMPONENT_SELECTORS: Array<{
  type: string
  selector: string
  priority: number
}> = [
 { type: 'buttons', selector: 'button, .btn, [role="button"], a.button, [class*="btn"], [class*="button"]', priority: 1 },
  { type: 'navigation', selector: 'nav, [role="navigation"]', priority: 2 },
  { type: 'cards', selector: '.card, [class*="card"]', priority: 3 },
  { type: 'forms', selector: 'form, .form', priority: 3 },
  { type: 'headers', selector: 'header, .header', priority: 2 },
  { type: 'footers', selector: 'footer, .footer', priority: 4 },
  { type: 'hero', selector: '[class*="hero"]', priority: 2 },
  { type: 'modals', selector: '[role="dialog"], .modal', priority: 4 },
  { type: 'text', selector: 'p, h1, h2, h3, h4, h5, h6, span, div > span:only-child', priority: 5 },
  { type: 'images', selector: 'img, svg, [class*="image"], [class*="img"], figure', priority: 5 },
 { type: 'links', selector: 'a:not([role="button"]):not([class*="btn"]):not([class*="button"])', priority: 5 },
  { type: 'lists', selector: 'ul, ol, dl', priority: 5 },
  { type: 'inputs', selector: 'input, textarea, select', priority: 3 },
 { type: 'tables', selector: 'table', priority: 4 },
  { type: 'dividers', selector: 'hr, [class*="divider"]', priority: 6 },
  { type: 'badges', selector: '[class*="badge"], span.badge', priority: 6 },
  { type: 'tooltips', selector: '[data-tooltip], [class*="tooltip"]', priority: 6 },
  { type: 'icons', selector: 'i[class*="icon"], svg[class*="icon"], [class*="icon"]', priority: 6 },
]

// Simple in-memory cache to avoid repeated extraction
const componentCache = new Map<
  string,
  { timestamp: number; components: ExtractedComponent[] }
>()
const CACHE_EXPIRY = 60 * 60 * 1000 // 1 hour

/**
 * Extract UI components from a given URL using Puppeteer.
 */
export async function extractWebsite(
  url: string,
  options: {
    maxComponents?: number
    componentTypes?: string[]
    skipScreenshots?: boolean
  } = {}
): Promise<{ components: ExtractedComponent[] }> {
  if (!url.startsWith('http')) {
    throw new Error('Invalid URL format. Must start with http or https.')
  }

  // Check cache
  const cacheKey = `${url}-${JSON.stringify(options)}`
  const cached = componentCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    console.log('Using cached components for', url)
    return { components: cached.components }
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
    });

    const page = await browser.newPage();

    // Set a reasonable timeout for the entire operation
    const TIMEOUT = 60000; // 60 seconds
    const extractionTimeout = setTimeout(() => {
      throw new Error('Extraction timed out after 60 seconds');
    }, TIMEOUT);

    try {
      // Block images, fonts, and styles to speed up
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'media', 'font', 'stylesheet'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      });

      // Go to the page
      console.log(`Navigating to ${url}...`);
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // Wait for body
      await page.waitForSelector('body', { timeout: 5000 }).catch(() => {
        console.log('Body element not found, continuing anyway');
      });

      const results: ExtractedComponent[] = [];
      const maxComponents = options.maxComponents || 50;
      let componentCount = 0;

      // Filter or sort the selectors by priority
      let selectorsList = [...COMPONENT_SELECTORS];
      if (options.componentTypes?.length) {
        selectorsList = selectorsList.filter((item) =>
          options.componentTypes?.includes(item.type)
        );
      }
      selectorsList.sort((a, b) => a.priority - b.priority);

      // For each type
      for (const { type, selector } of selectorsList) {
        if (componentCount >= maxComponents) break;
        console.log(`Extracting ${type} using selector: ${selector}`);

        try {
          const elementHandles = await page.$$(selector);
          console.log(`Found ${elementHandles.length} elements for type ${type}`);
                    // Recursive function to find nested components
                    const processElementAndChildren = async (element, depth = 0, maxDepth = 2) => {
                      if (depth > maxDepth || componentCount >= maxComponents) return;
                      
                      try {
                        const rect = await element.boundingBox().catch(() => null);
                        if (!rect || rect.width < 10 || rect.height < 10) return;
                        
                        // If position is fixed, skip (often overlays or repeated nav)
                        const position = await page.evaluate(
                          (el) => window.getComputedStyle(el).position,
                          element
                        );
                        if (position === 'fixed') return;
                        
                        // Get detailed computed styles
                        const styles = await page.evaluate((el) => {
                          const computed = window.getComputedStyle(el);
                          const styleObj = {};
                          
                          // Capture all important style properties
                          [
                            'backgroundColor', 'color', 'fontSize', 'fontFamily', 'fontWeight',
                            'lineHeight', 'textAlign', 'padding', 'paddingTop', 'paddingRight',
                            'paddingBottom', 'paddingLeft', 'margin', 'marginTop', 'marginRight',
                            'marginBottom', 'marginLeft', 'borderRadius', 'border', 'borderTop',
                            'borderRight', 'borderBottom', 'borderLeft', 'boxShadow', 'display',
                            'flexDirection', 'justifyContent', 'alignItems', 'width', 'height',
                            'position', 'top', 'right', 'bottom', 'left', 'zIndex', 'opacity',
                            'transform'
                          ].forEach(prop => {
                            styleObj[prop] = computed[prop];
                          });
                          
                          return styleObj;
                        }, element);
                        
                        // Get enriched HTML with inline styles
                        const htmlWithStyles = await page.evaluate((el) => {
                          // Get computed styles
                        const computed = window.getComputedStyle(el);
                          
                          // Create inline style string
                          let styleStr = '';
                          for (const prop of computed) {
                            const value = computed.getPropertyValue(prop);
                            if (value) styleStr += `${prop}: ${value}; `;
                          }
                          
                          // Clone element and add inline styles
                          const clone = el.cloneNode(true);
                          clone.setAttribute('style', styleStr + (clone.getAttribute('style') || ''));
                          
                          return clone.outerHTML;
                        }, element);
                        
                        const textContent = await page.evaluate((el) => {
                          const text = el.textContent?.trim() || '';
                          return text.length > 25 ? text.slice(0, 25) + '...' : text;
                        }, element);
          
                        const tagName = await page.evaluate((el) => el.tagName.toLowerCase(), element);
                        const detectedType = type || (tagName === 'button' ? 'buttons' : 'element');
                        
                        const displayName = textContent
                          ? `${detectedType.charAt(0).toUpperCase() + detectedType.slice(1)}: ${textContent}`
                          : `${detectedType.charAt(0).toUpperCase() + detectedType.slice(1)} Component`;
          
                        // Add to results if not duplicated
                        if (componentCount < maxComponents) {
                          results.push({
                            type: detectedType,
                            name: displayName,
                            html: htmlWithStyles,
                            styles,
                            metadata: {
                              tagName,
                              classes: await page.evaluate((el) => Array.from(el.classList), element),
                              dimensions: {
                                width: rect.width,
                                height: rect.height,
                              },
                            },
                          });
                          componentCount++;
                        }
                        
                        // Process children recursively if appropriate
                        if (depth < maxDepth && componentCount < maxComponents) {
                          const children = await element.$$(':scope > *');
                          for (const child of children) {
                            await processElementAndChildren(child, depth + 1, maxDepth);
                            await child.dispose();
                          }
                        }
                      } catch (error) {
                        console.error('Error processing element recursively:', error);
                      }
                    };
          // Process in small batches
          const batchSize = 5;
          for (
            let i = 0;
            i < elementHandles.length && componentCount < maxComponents;
            i += batchSize
          ) {
            const batch = elementHandles.slice(i, i + batchSize);
            for (const element of batch) {
              if (componentCount >= maxComponents) break;

              try {
                const rect = await element.boundingBox().catch(() => null);
                if (!rect || rect.width < 10 || rect.height < 10) {
                  continue;
                }

                // If position is fixed, skip (often overlays or repeated nav)
                const position = await page.evaluate(
                  (el) => window.getComputedStyle(el).position,
                  element
                );
                if (position === 'fixed') {
                  continue;
                }

                let screenshot = '';
                if (!options.skipScreenshots) {
                  try {
                    const screenshotBuffer = await element.screenshot({
                      encoding: 'base64',
                    });
                    screenshot = `data:image/png;base64,${screenshotBuffer}`;
                  } catch (err) {
                    console.error('Screenshot failed:', err);
                  }
                }

                const html = await page.evaluate((el) => el.outerHTML, element);

                const styles = await page.evaluate((el) => {
                  const computed = window.getComputedStyle(el);
                  return {
                    backgroundColor: computed.backgroundColor,
                    color: computed.color,
                    padding: computed.padding,
                    borderRadius: computed.borderRadius,
                    display: computed.display,
                    width: computed.width,
                    height: computed.height,
                  };
                }, element);

                const textContent = await page.evaluate((el) => {
                  const text = el.textContent?.trim() || '';
                  return text.length > 25 ? text.slice(0, 25) + '...' : text;
                }, element);

                const displayName = textContent
                  ? `${type.charAt(0).toUpperCase() + type.slice(1)}: ${textContent}`
                  : `${type.charAt(0).toUpperCase() + type.slice(1)} Component`;

                results.push({
                  type,
                  name: displayName,
                  html,
                  screenshot,
                  styles,
                  metadata: {
                    tagName: await page.evaluate((el) => el.tagName.toLowerCase(), element),
                    classes: await page.evaluate((el) => Array.from(el.classList), element),
                    dimensions: {
                      width: rect.width,
                      height: rect.height,
                    },
                  },
                });
                componentCount++;
              } catch (elementError) {
                console.error(`Error processing element: ${elementError}`);
                // Continue to the next element
              }
            }

            // Dispose handles
            for (const el of batch) {
              await el.dispose();
            }
          }
        } catch (selectorError) {
          console.error(`Error with selector ${selector}: ${selectorError}`);
          // Continue to the next selector
        }
      }
// Process main content recursively to find more components
      try {
          if (componentCount < maxComponents) {
            console.log('Starting recursive processing of main content...');
           const mainContent = await page.$('main') || await page.$('#root') || await page.$('body');
            if (mainContent) {
              await processElementAndChildren(mainContent, 0, 2);
              await mainContent.dispose();
            }
          }
        } catch (recursiveError) {
          console.error('Error in recursive processing:', recursiveError);
        }
      // Clear the timeout since we finished successfully
      clearTimeout(extractionTimeout);

      const cleanedComponents = results.map((component) => ({
        ...component,
        cleanHtml: cleanHTML(component.html),
      }));

      // Store in cache
      componentCache.set(cacheKey, {
        timestamp: Date.now(),
        components: cleanedComponents,
      });

      return { components: cleanedComponents };
    } catch (error) {
      clearTimeout(extractionTimeout);
      throw error;
    }
  } catch (error) {
    console.error('Extraction error:', error);
    throw new Error(
      `Failed to extract UI components: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  } finally {
    // Make sure we always close the browser
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.error('Error closing browser:', error);
      }
    }
  }
}