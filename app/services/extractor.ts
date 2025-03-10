import puppeteer from 'puppeteer'
import type { ExtractedComponent } from '~/types'

/**
 * Remove unnecessary scripts and inline styles.
 */
const cleanHTML = (html: string): string => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\sstyle="[^"]*"/gi, '')
    .replace(/class="[^"]*"/gi, (match) => {
      const classes = match.match(/class="([^"]*)"/)?.[1] || ''
      const filtered = classes
        .split(' ')
        .filter((cls) => !cls.startsWith(':') && !cls.startsWith('w-'))
        .join(' ')
      return filtered ? `class="${filtered}"` : ''
    })
}

// Component selectors with priority ranking (lower number = higher priority)
const COMPONENT_SELECTORS: Array<{
  type: string
  selector: string
  priority: number
}> = [
  { type: 'buttons', selector: 'button, .btn, [role="button"]', priority: 1 },
  { type: 'navigation', selector: 'nav, [role="navigation"]', priority: 2 },
  { type: 'cards', selector: '.card, [class*="card"]', priority: 3 },
  { type: 'forms', selector: 'form, .form', priority: 3 },
  { type: 'headers', selector: 'header, .header', priority: 2 },
  { type: 'footers', selector: 'footer, .footer', priority: 4 },
  { type: 'hero', selector: '[class*="hero"]', priority: 2 },
  { type: 'modals', selector: '[role="dialog"], .modal', priority: 4 },
]

// Cache extracted components per URL to avoid re-extraction
const componentCache = new Map<
  string,
  { timestamp: number; components: ExtractedComponent[] }
>()
const CACHE_EXPIRY = 60 * 60 * 1000 // 1 hour

/**
 * Extract UI components from a given URL using Puppeteer.
 * Returns a list of components, each with its raw HTML, a cleaned version,
 * computed styles, a screenshot, and additional metadata.
 */
export async function extractWebsite(
  url: string,
  options: {
    maxComponents?: number
    componentTypes?: string[]
    skipScreenshots?: boolean
  } = {},
): Promise<{ components: ExtractedComponent[] }> {
  if (!url.startsWith('http')) {
    throw new Error('Invalid URL format. Must start with http or https.')
  }

  // Check cache
  const cacheKey = `${url}-${JSON.stringify(options)}`
  const cached = componentCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    console.log('Using cached components')
    return { components: cached.components }
  }

  console.log('Launching browser for URL:', url)
  const browser = await puppeteer.launch({
    headless: true, // Fixed: Using boolean instead of "new"
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
    ],
  })

  try {
    const page = await browser.newPage()

    // Improve performance by blocking unnecessary resources
    await page.setRequestInterception(true)
    page.on('request', (request) => {
      const resourceType = request.resourceType()
      // Block non-essential resources
      if (['image', 'media', 'font', 'stylesheet'].includes(resourceType)) {
        request.abort()
      } else {
        request.continue()
      }
    })

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    )
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    })

    console.log(`Navigating to ${url}`)
    // Set a reasonable timeout
    await page.goto(url, {
      waitUntil: 'domcontentloaded', // Changed from networkidle0 for better performance
      timeout: 30000,
    })

    // Wait for critical content to load
    await page.waitForSelector('body', { timeout: 5000 }).catch(() => {
      console.log('Body element not found, continuing anyway')
    })

    const results: ExtractedComponent[] = []
    const maxComponents = options.maxComponents || 50 // Limit the number of components to avoid memory issues
    let componentCount = 0

    // Filter component types based on options
    let selectorsList = [...COMPONENT_SELECTORS]
    if (options.componentTypes?.length) {
      selectorsList = selectorsList.filter((item) =>
        options.componentTypes?.includes(item.type),
      )
    }

    // Sort by priority
    selectorsList.sort((a, b) => a.priority - b.priority)

    // Extract components by type in order of priority
    for (const { type, selector } of selectorsList) {
      if (componentCount >= maxComponents) break

      console.log(`Extracting ${type} components...`)

      // Get element handles in batches for better memory management
      const elementHandles = await page.$$(selector)
      console.log(`Found ${elementHandles.length} ${type} elements`)

      // Process in batches of 5
      const batchSize = 5
      for (
        let i = 0;
        i < elementHandles.length && componentCount < maxComponents;
        i += batchSize
      ) {
        const batch = elementHandles.slice(i, i + batchSize)

        // Process each element in the batch
        for (const element of batch) {
          if (componentCount >= maxComponents) break

          const rect = await element.boundingBox().catch(() => null)
          if (!rect || rect.width < 10 || rect.height < 10) {
            continue // skip invisible or too small elements
          }

          // Skip elements with position fixed or absolute that might be UI overlays
          const position = await page.evaluate(
            (el) => window.getComputedStyle(el).position,
            element,
          )
          if (position === 'fixed') continue

          let screenshot = ''
          if (!options.skipScreenshots) {
            try {
              // Use a more efficient screenshot capture with clip
              const screenshotBuffer = await page.screenshot({
                encoding: 'base64',
                clip: {
                  x: rect.x,
                  y: rect.y,
                  width: rect.width,
                  height: rect.height,
                },
              })
              screenshot = `data:image/png;base64,${screenshotBuffer}`
            } catch (err) {
              console.error('Screenshot failed:', err)
            }
          }

          // Get the outer HTML
          const html = await page.evaluate((el) => el.outerHTML, element)

          // Extract computed styles (only the most important ones for better performance)
          const styles = await page.evaluate((el) => {
            const computed = window.getComputedStyle(el)
            return {
              backgroundColor: computed.backgroundColor,
              color: computed.color,
              padding: computed.padding,
              borderRadius: computed.borderRadius,
              display: computed.display,
              width: computed.width,
              height: computed.height,
            }
          }, element)

          // Get text content to create a descriptive label
          const textContent = await page.evaluate((el) => {
            const text = el.textContent?.trim() || ''
            return text.length > 25 ? text.slice(0, 25) + '...' : text
          }, element)

          const displayName = textContent
            ? `${type.charAt(0).toUpperCase() + type.slice(1)}: ${textContent}`
            : `${type.charAt(0).toUpperCase() + type.slice(1)} Component`

          results.push({
            type,
            name: displayName,
            html,
            screenshot,
            styles,
            metadata: {
              tagName: await page.evaluate(
                (el) => el.tagName.toLowerCase(),
                element,
              ),
              classes: await page.evaluate(
                (el) => Array.from(el.classList),
                element,
              ),
              dimensions: {
                width: rect.width,
                height: rect.height,
              },
            },
          })

          componentCount++
        }

        // Clean up batch to free memory
        for (const element of batch) {
          await element.dispose()
        }
      }
    }

    const cleanedComponents = results.map((component) => ({
      ...component,
      cleanHtml: cleanHTML(component.html),
    }))

    // Store in cache
    componentCache.set(cacheKey, {
      timestamp: Date.now(),
      components: cleanedComponents,
    })

    console.log(
      `Extraction complete, found ${cleanedComponents.length} components`,
    )
    await browser.close()
    return { components: cleanedComponents }
  } catch (error) {
    await browser.close()
    console.error('Extraction error:', error)
    throw new Error(
      `Failed to extract UI components: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}