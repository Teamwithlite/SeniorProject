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

const COMPONENT_SELECTORS: Record<string, string> = {
  buttons: 'button, .btn, [role="button"]',
  navigation: 'nav, [role="navigation"]',
  cards: '.card, [class*="card"]',
  forms: 'form, .form',
  headers: 'header, .header',
  footers: 'footer, .footer',
  hero: '[class*="hero"]',
  modals: '[role="dialog"], .modal',
}

/**
 * Extract UI components from a given URL using Puppeteer.
 * Returns a list of components, each with its raw HTML, a cleaned version,
 * computed styles, a screenshot, and additional metadata.
 */
export async function extractWebsite(
  url: string
): Promise<{ components: ExtractedComponent[] }> {
  if (!url.startsWith('http')) {
    throw new Error('Invalid URL format. Must start with http or https.')
  }

  const browser = await puppeteer.launch({
    headless: 'new',
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
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    )
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    })

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    const results: ExtractedComponent[] = []

    // Loop through each type of component
    for (const [type, selector] of Object.entries(COMPONENT_SELECTORS)) {
      const elementHandles = await page.$$(selector)

      for (const element of elementHandles) {
        const rect = await element.boundingBox()
        if (!rect || rect.width < 1 || rect.height < 1) {
          continue // skip invisible elements
        }

        // Capture a screenshot of the element as a base64 string
        let screenshot = ''
        try {
          const screenshotBuffer = await element.screenshot({
            encoding: 'base64',
          })
          screenshot = `data:image/png;base64,${screenshotBuffer}`
        } catch (err) {
          console.error('Screenshot failed:', err)
        }

        // Get the outer HTML
        const html = await page.evaluate((el) => el.outerHTML, element)

        // Extract computed styles
        const styles = await page.evaluate((el) => {
          const computed = window.getComputedStyle(el)
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
          }
        }, element)

        // Get text content to create a descriptive label
        const textContent = await page.evaluate(
          (el) => el.textContent?.trim() || '',
          element
        )
        const displayName = textContent
          ? `${type.charAt(0).toUpperCase() + type.slice(1)}: ${textContent.slice(
              0,
              25
            )}`
          : `${type.charAt(0).toUpperCase() + type.slice(1)} Component`

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
        })
      }
    }

    const cleanedComponents = results.map((component) => ({
      ...component,
      cleanHtml: cleanHTML(component.html),
    }))

    await browser.close()
    return { components: cleanedComponents }
  } catch (error) {
    await browser.close()
    console.error('Extraction error:', error)
    throw new Error(
      `Failed to extract UI components: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}