// app/services/extractor.ts
import puppeteer, { Page, ElementHandle, BoundingBox } from 'puppeteer'
import type {
  ExtractedComponent,
  ComponentStyle,
  ExtractedImageInfo,
} from '~/types'

/**
 * Enhanced HTML cleaning function to remove unwanted elements and attributes.
 * This makes the extracted HTML cleaner and more suitable for reuse.
 */
const cleanHTML = (html: string): string => {
  return (
    html
      // Remove script tags and their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove style tags and their content
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove event handlers (onclick, onmouseover, etc.)
      .replace(/ on\w+="[^"]*"/g, '')
      // Remove data-* attributes to reduce clutter
      .replace(/ data-[^=]*="[^"]*"/g, '')
      // Remove common tracking attributes
      .replace(/ (ga|gtm|analytics)-[^=]*="[^"]*"/g, '')
      // Simplify extremely long class strings
      .replace(/class="([^"]{100,})"/gi, (match, classStr) => {
        const importantClasses = classStr.split(/\s+/).slice(0, 10).join(' ')
        return `class="${importantClasses}"`
      })
  )
}

// Priority-based component selectors - enhanced and categorized
const COMPONENT_SELECTORS: Array<{
  type: string
  selector: string
  priority: number
  isHighValue?: boolean // Flag for visually important components
}> = [
  {
    type: 'hero',
    selector:
      '[class*="hero"], .jumbotron, .banner, section:first-of-type, [class*="banner"], .splash, [class*="showcase"], [class*="intro"], [class*="masthead"]',
    priority: 1,
    isHighValue: true,
  },
  {
    type: 'carousel',
    selector:
      '.carousel, .slider, .slideshow, [class*="carousel"], [class*="slider"], [class*="slideshow"], [class*="swiper"], .owl-carousel',
    priority: 1,
    isHighValue: true,
  },
  {
    type: 'feature-section',
    selector:
      '.features, [class*="feature"], section.row, .benefits, [class*="benefit"], .highlights, [class*="highlight"]',
    priority: 2,
    isHighValue: true,
  },
  {
    type: 'cta-section',
    selector:
      '.cta, [class*="cta"], [class*="call-to-action"], [class*="calltoaction"], [class*="call-to-action"]',
    priority: 2,
    isHighValue: true,
  },
  {
    type: 'product',
    selector:
      '.product, .item, [class*="product"], [class*="product-item"], [itemtype*="Product"]',
    priority: 2,
    isHighValue: true,
  },
  {
    type: 'testimonial',
    selector:
      '.testimonial, [class*="testimonial"], .review, [class*="review"], .quote, [class*="quote"]',
    priority: 3,
    isHighValue: true,
  },
  {
    type: 'image-gallery',
    selector:
      '.gallery, [class*="gallery"], .album, [class*="album"], .images, [class*="images"]',
    priority: 2,
    isHighValue: true,
  },
  {
    type: 'rich-media',
    selector:
      'video, [class*="video"], iframe, [class*="media"], [class*="player"], .media',
    priority: 2,
    isHighValue: true,
  },
  {
    type: 'headers',
    selector:
      'header, .header, [role="banner"], [class*="header"], .page-header',
    priority: 2,
  },
  {
    type: 'navigation',
    selector:
      'nav, [role="navigation"], header ul, .navbar, .menu, .nav, .navigation',
    priority: 2,
  },
  {
    type: 'cards',
    selector: '.card, [class*="card"], article, .article, .item, .product',
    priority: 3,
  },
  {
    type: 'images',
    selector:
      'img[src], svg, [class*="image"], [class*="img"], figure, .figure, picture',
    priority: 3,
    isHighValue: true,
  },
  {
    type: 'buttons',
    selector:
      'button, .btn, [role="button"], a.button, [class*="btn"], [class*="button"]:not(a[class*="button-link"]), ' +
      'input[type="button"], input[type="submit"], input[type="reset"], ' +
      '[onclick]:not(a), [class*="cta"], .submit, [class*="submit-btn"], ' +
      'div[class*="button"], div[role="button"], span[class*="button"], span[role="button"], ' +
      '[class*="btn-"]:not(a[class*="btn-link"]), [class*="button-"]:not(a[class*="button-link"]), ' +
      'a[href][class*="primary"], a[href][class*="secondary"], a[href][class*="action"], ' +
      'div[tabindex="0"][class*="clickable"], span[tabindex="0"][class*="clickable"]',
    priority: 3, // Increased priority to ensure buttons are captured
    isHighValue: true, // Mark buttons as high value components
  },
  {
    type: 'forms',
    selector: 'form, .form, [role="form"], fieldset',
    priority: 3,
  },
  {
    type: 'footers',
    selector: 'footer, .footer, [role="contentinfo"], [class*="footer"]',
    priority: 4,
  },
  {
    type: 'modals',
    selector:
      '[role="dialog"], .modal, .popup, .dialog, [class*="modal"], [class*="popup"], [class*="dialog"]',
    priority: 4,
  },
  {
    type: 'text',
    selector:
      'p, h1, h2, h3, h4, h5, h6, span, div > span:only-child, .text, [class*="text"]',
    priority: 5,
  },
  {
    type: 'links',
    selector:
      'a:not([role="button"]):not([class*="btn"]):not([class*="button"]), .link, [class*="link"]',
    priority: 5,
  },
  {
    type: 'lists',
    selector: 'ul, ol, dl, .list, [class*="list"]',
    priority: 5,
  },
  {
    type: 'inputs',
    selector:
      'input, textarea, select, .input-group, [class*="input"], [class*="field"], .field, label + input',
    priority: 4,
  },
  {
    type: 'tables',
    selector: 'table, .table, [class*="table"], [role="table"], .grid',
    priority: 4,
  },
  {
    type: 'dividers',
    selector:
      'hr, [class*="divider"], .separator, [class*="separator"], [role="separator"]',
    priority: 6,
  },
  {
    type: 'badges',
    selector:
      '[class*="badge"], .tag, [class*="tag"], .pill, [class*="pill"], .status',
    priority: 6,
  },
  {
    type: 'tooltips',
    selector:
      '[data-tooltip], [class*="tooltip"], [role="tooltip"], [aria-describedby]',
    priority: 6,
  },
  {
    type: 'icons',
    selector:
      'i[class*="icon"], svg[class*="icon"], [class*="icon"], .fa, .material-icons',
    priority: 6,
  },
  {
    type: 'alerts',
    selector:
      '.alert, [role="alert"], [class*="alert"], .notification, [class*="notification"]',
    priority: 4,
  },
  {
    type: 'toggles',
    selector:
      '.toggle, [class*="toggle"], .switch, [class*="switch"], [role="switch"]',
    priority: 5,
  },
  {
    type: 'progress',
    selector: 'progress, .progress, [role="progressbar"], [class*="progress"]',
    priority: 5,
  },
]

// Simple in-memory cache to avoid repeated extraction
const componentCache = new Map<
  string,
  { timestamp: number; components: ExtractedComponent[] }
>()
const CACHE_EXPIRY = 60 * 60 * 1000 // 1 hour

/**
 * Calculate the importance score of an element based on various factors
 * This helps prioritize visually and structurally important components
 */
const calculateImportanceScore = async (
  page: Page,
  element: ElementHandle<Element>,
  rect: BoundingBox,
  tagName: string,
  isHighValueType: boolean = false,
): Promise<number> => {
  // Get viewport dimensions
  const viewport = page.viewport()
  if (!viewport) return 0

  // Base score starts at 0
  let score = 0

  // Element is in the first screenful of content (above the fold)
  // Score increases the closer to the top it is
  const viewportScore = Math.max(0, 1 - rect.y / viewport.height)
  score += viewportScore * 20 // Up to 20 points for position

  // Size relative to viewport is an important factor
  // Larger elements (especially width) tend to be more important
  const sizeScore =
    (rect.width * rect.height) / (viewport.width * viewport.height)
  score += sizeScore * 30 // Up to 30 points for size

  // Elements with images get a boost
  const hasImages = await page.evaluate((el: Element) => {
    return (
      !!el.querySelector('img') ||
      window.getComputedStyle(el).backgroundImage !== 'none'
    )
  }, element)

  if (hasImages) {
    score += 15 // 15 points for having images
  }

  // Check text content richness
  const textScore = await page.evaluate((el: Element) => {
    const text = el.textContent || ''
    // More text generally means more importance (up to a point)
    return Math.min(1, text.length / 500)
  }, element)

  score += textScore * 10 // Up to 10 points for text content

  // Check if element is a heading or contains headings
  const hasHeadings = await page.evaluate((el: Element) => {
    return el.tagName.match(/^H[1-3]$/) || !!el.querySelector('h1, h2, h3')
  }, element)

  if (hasHeadings) {
    score += 15 // 15 points for headings
  }

  // Special case for elements with specific tags
  if (['header', 'section', 'article', 'main', 'nav'].includes(tagName)) {
    score += 10 // 10 points for semantically important tags
  }

  // Pre-defined high-value components get a boost
  if (isHighValueType) {
    score += 20
  }

  return Math.min(100, score) // Cap at 100
}

/**
 * Check if an element has a background image or gradient
 */
const getBackgroundImageInfo = async (
  page: Page,
  element: ElementHandle<Element>,
): Promise<{ hasBackground: boolean; backgroundUrl?: string }> => {
  return page.evaluate((el: Element) => {
    const style = window.getComputedStyle(el)
    const backgroundImage = style.backgroundImage

    if (backgroundImage && backgroundImage !== 'none') {
      // Extract URL if it's an image
      const urlMatch = backgroundImage.match(/url\(['"]?(.*?)['"]?\)/)
      if (urlMatch && urlMatch[1]) {
        return {
          hasBackground: true,
          backgroundUrl: urlMatch[1],
        }
      }

      // It's a gradient or other background
      return { hasBackground: true }
    }

    return { hasBackground: false }
  }, element)
}

/**
 * Extract all relevant CSS properties for consistent style extraction
 */
const extractStyles = async (
  page: Page,
  element: ElementHandle<Element>,
): Promise<ComponentStyle> => {
  return page.evaluate((el: Element) => {
    const computed = window.getComputedStyle(el)
    const styleObj: Record<string, string> = {}

    // Capture all important style properties
    ;[
      // Typography styles
      'color',
      'backgroundColor',
      'fontSize',
      'fontFamily',
      'fontWeight',
      'lineHeight',
      'textAlign',
      'textTransform',
      'letterSpacing',

      // Spacing and sizing
      'padding',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'margin',
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft',
      'width',
      'height',
      'minWidth',
      'maxWidth',
      'minHeight',
      'maxHeight',

      // Borders and shadows
      'borderRadius',
      'border',
      'borderTop',
      'borderRight',
      'borderBottom',
      'borderLeft',
      'boxShadow',
      'outline',
      'outlineOffset',

      // Layout properties
      'display',
      'flexDirection',
      'justifyContent',
      'alignItems',
      'gap',
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'zIndex',

      // Visual effects
      'opacity',
      'transform',
      'transition',
      'animation',
      'filter',
      'backgroundImage',
      'backgroundSize',
      'backgroundPosition',
      'backgroundRepeat',
      'backgroundBlendMode',
    ].forEach((prop) => {
      styleObj[prop] = computed.getPropertyValue(prop)
    })

    return styleObj as ComponentStyle
  }, element)
}

/**
 * Generate HTML with inline styles for component extraction
 */
const generateHTMLWithStyles = async (
  page: Page,
  element: ElementHandle<Element>,
): Promise<string> => {
  return page.evaluate((el: Element) => {
    // Get computed styles
    const computed = window.getComputedStyle(el)

    // Create inline style string with most important properties
    let styleStr = ''
    for (const prop of [
      'color',
      'background-color',
      'background-image',
      'background-size',
      'background-position',
      'font-size',
      'font-weight',
      'font-family',
      'padding',
      'margin',
      'border',
      'border-radius',
      'display',
      'width',
      'height',
      'flex-direction',
      'justify-content',
      'align-items',
      'box-shadow',
      'position',
    ]) {
      const value = computed.getPropertyValue(prop)
      if (value && value !== 'none' && value !== 'normal') {
        styleStr += `${prop}: ${value}; `
      }
    }

    // Clone element and add inline styles
    const clone = el.cloneNode(true) as HTMLElement
    clone.setAttribute('style', styleStr + (clone.getAttribute('style') || ''))

    // Preserve src attributes for images
    const images = clone.querySelectorAll('img')
    images.forEach((img) => {
      const src = img.getAttribute('src')
      if (src && src.startsWith('data:')) {
        // Already a data URL, leave it
      } else if (src) {
        // For regular src, make sure it's absolute
        try {
          img.setAttribute('src', new URL(src, window.location.href).href)
        } catch (e) {
          // Keep original if URL parsing fails
        }
      }
    })

    return clone.outerHTML
  }, element)
}

/**
 * Extract image source URLs and metadata from an element
 */
const extractImages = async (
  page: Page,
  element: ElementHandle<Element>,
): Promise<
  Array<{
    src: string
    alt?: string
    width?: number
    height?: number
    type: string
  }>
> => {
  return page.evaluate((el: Element) => {
    const images: Array<{
      src: string
      alt?: string
      width?: number
      height?: number
      type: string
    }> = []

    // Extract regular images
    const imgElements = el.querySelectorAll('img')
    imgElements.forEach((img) => {
      const src = img.getAttribute('src')
      if (src) {
        images.push({
          src: src,
          alt: img.getAttribute('alt') || undefined,
          width: img.naturalWidth || undefined,
          height: img.naturalHeight || undefined,
          type: 'img',
        })
      }
    })

    // Extract background images from this element and descendants
    const elementsWithBg = [el, ...Array.from(el.querySelectorAll('*'))]
    elementsWithBg.forEach((bgEl) => {
      const style = window.getComputedStyle(bgEl)
      const bgImage = style.backgroundImage

      if (bgImage && bgImage !== 'none') {
        const urlMatch = bgImage.match(/url\(['"]?(.*?)['"]?\)/)
        if (urlMatch && urlMatch[1]) {
          const rect = bgEl.getBoundingClientRect()
          images.push({
            src: urlMatch[1],
            width: rect.width || undefined,
            height: rect.height || undefined,
            type: 'background',
          })
        }
      }
    })

    return images
  }, element)
}

/**
 * Process a DOM element and extract component information
 */
const processElement = async (
  page: Page,
  element: ElementHandle<Element>,
  type: string,
  options: {
    skipScreenshots?: boolean
    scoringEnabled?: boolean
    isHighValueType?: boolean
  } = {},
): Promise<ExtractedComponent | null> => {
  try {
    // Check if element is visible and has reasonable dimensions
    const rect = await element.boundingBox().catch(() => null)
    if (!rect || rect.width < 10 || rect.height < 10) {
      return null
    }

    // Check if element is fixed position (often overlays)
    const position = await page.evaluate(
      (el: Element) => window.getComputedStyle(el).position,
      element,
    )

    if (position === 'fixed') {
      return null
    }

    // Get tag name
    const tagName = await page.evaluate(
      (el: Element) => el.tagName.toLowerCase(),
      element,
    )

    // Calculate importance score if scoring is enabled
    let importanceScore = 0
    if (options.scoringEnabled) {
      importanceScore = await calculateImportanceScore(
        page,
        element,
        rect,
        tagName,
        options.isHighValueType,
      )
    }

    // Check for background images
    const backgroundInfo = await getBackgroundImageInfo(page, element)

    // Extract all images from this component
    const images = await extractImages(page, element)

    // Extract styles
    const styles = await extractStyles(page, element)

    // Get HTML with inlined styles
    const htmlWithStyles = await generateHTMLWithStyles(page, element)

    // Extract text content for naming
    const textContent = await page.evaluate((el: Element) => {
      const text = el.textContent?.trim() || ''
      return text.length > 25 ? text.slice(0, 25) + '...' : text
    }, element)

    // Enhanced component type detection with better button identification
    let detectedType = type

    if (!detectedType) {
      // Check if it's a button-like element by examining properties
      const isButtonLike = await page.evaluate((el) => {
        const tag = el.tagName.toLowerCase()
        const classList = Array.from(el.classList).join(' ').toLowerCase()
        const role = el.getAttribute('role')
        const hasOnclick = el.hasAttribute('onclick')
        const isInput =
          tag === 'input' &&
          ['button', 'submit', 'reset'].includes(el.getAttribute('type') || '')
        const hasButtonClass = /btn|button|cta|submit|action/i.test(classList)
        const hasInteractionAttrs =
          el.hasAttribute('tabindex') || el.hasAttribute('aria-pressed')
        const textContent = el.textContent?.trim() || ''
        const isShortActionText =
          /submit|send|login|signup|sign up|sign in|continue|next|previous|save|delete|cancel|apply|try|get|buy|add|more/i.test(
            textContent,
          ) && textContent.length < 30

        return (
          tag === 'button' ||
          role === 'button' ||
          isInput ||
          hasButtonClass ||
          (hasOnclick && (tag === 'div' || tag === 'span')) ||
          (hasInteractionAttrs && isShortActionText)
        )
      }, element)

      if (isButtonLike) {
        detectedType = 'buttons'
      } else if (tagName === 'a') {
        detectedType = 'links'
      } else if (tagName === 'img' || backgroundInfo.hasBackground) {
        detectedType = 'images'
      } else {
        detectedType = 'element'
      }
    }

    // Create display name with more context
    let displayName = ''
    if (importanceScore > 75) {
      displayName = `Important ${detectedType.charAt(0).toUpperCase() + detectedType.slice(1)}`
      if (textContent) displayName += `: ${textContent}`
    } else {
      displayName = textContent
        ? `${detectedType.charAt(0).toUpperCase() + detectedType.slice(1)}: ${textContent}`
        : `${detectedType.charAt(0).toUpperCase() + detectedType.slice(1)} Component`
    }

    // Take screenshot if enabled
    let screenshot = ''
    if (!options.skipScreenshots) {
      try {
        const screenshotBuffer = await element.screenshot({
          encoding: 'base64',
        })
        screenshot = `data:image/png;base64,${screenshotBuffer}`
      } catch (err) {
        console.error('Screenshot failed:', err)
      }
    }

    // Get classes
    const classes = await page.evaluate(
      (el: Element) => Array.from(el.classList),
      element,
    )

    // Return extracted component with enhanced metadata
    return {
      type: detectedType,
      name: displayName,
      html: htmlWithStyles,
      cleanHtml: cleanHTML(htmlWithStyles),
      screenshot,
      styles,
      metadata: {
        tagName,
        classes,
        dimensions: {
          width: rect.width,
          height: rect.height,
        },
        importanceScore,
        hasBackgroundImage: backgroundInfo.hasBackground,
        backgroundImageUrl: backgroundInfo.backgroundUrl,
        imageCount: images.length,
        images: images,
        position: {
          x: rect.x,
          y: rect.y,
        },
      },
    }
  } catch (error) {
    console.error('Error processing element:', error)
    return null
  }
}

/**
 * Process an element and its children recursively to find nested components
 */
const processElementRecursively = async (
  page: Page,
  element: ElementHandle<Element>,
  options: {
    depth?: number
    maxDepth?: number
    skipScreenshots?: boolean
    results: ExtractedComponent[]
    maxComponents: number
    scoringEnabled?: boolean
  },
): Promise<void> => {
  const {
    depth = 0,
    maxDepth = 3, // Increased depth for more thorough analysis
    skipScreenshots = false,
    results,
    maxComponents,
    scoringEnabled = true,
  } = options

  if (depth > maxDepth || results.length >= maxComponents) return

  try {
    // Process the element itself
    const component = await processElement(page, element, '', {
      skipScreenshots,
      scoringEnabled,
    })

    if (component && results.length < maxComponents) {
      // Only add if it has reasonable content or is visually distinct
      const hasSubstantialContent =
        component.metadata?.imageCount && component.metadata.imageCount > 0
      const hasBackgroundImage = component.metadata?.hasBackgroundImage
      const isImportant =
        component.metadata?.importanceScore &&
        component.metadata.importanceScore > 40

      if (hasSubstantialContent || hasBackgroundImage || isImportant) {
        results.push(component)
      }
    }

    // Process children recursively, but fewer levels for less important elements
    if (depth < maxDepth && results.length < maxComponents) {
      // If this is an important element, process children more extensively
      const isImportant =
        component?.metadata?.importanceScore &&
        component.metadata.importanceScore > 60
      const childDepthLimit = isImportant
        ? maxDepth
        : Math.min(maxDepth, depth + 2)

      const children = await element.$$(':scope > *')
      for (const child of children) {
        await processElementRecursively(page, child, {
          ...options,
          depth: depth + 1,
          maxDepth: childDepthLimit,
        })
        await child.dispose()
      }
    }
  } catch (error) {
    console.error('Error in recursive processing:', error)
  }
}

/**
 * Extract UI components from a given URL using Puppeteer.
 */
export async function extractWebsite(
  url: string,
  options: {
    maxComponents?: number
    componentTypes?: string[]
    skipScreenshots?: boolean
    maxDepth?: number
    timeout?: number
    allowImages?: boolean
    extractMainContent?: boolean
    dynamicScoring?: boolean
  } = {},
): Promise<{ components: ExtractedComponent[] }> {
  if (!url.startsWith('http')) {
    throw new Error('Invalid URL format. Must start with http or https.')
  }

  // Set default options
  const maxComponents = options.maxComponents || 50
  const skipScreenshots = options.skipScreenshots || false
  const maxDepth = options.maxDepth || 3 // Increased default depth
  const TIMEOUT = options.timeout || 60000 // Default 60 seconds
  const allowImages =
    options.allowImages !== undefined ? options.allowImages : true // Default to allowing images
  const extractMainContent =
    options.extractMainContent !== undefined ? options.extractMainContent : true
  const dynamicScoring =
    options.dynamicScoring !== undefined ? options.dynamicScoring : true

  // Check cache
  const cacheKey = `${url}-${JSON.stringify(options)}`
  const cached = componentCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    console.log('Using cached components for', url)
    return { components: cached.components }
  }

  let browser
  try {
    // Launch browser with appropriate settings
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
    })

    const page = await browser.newPage()

    // Set a reasonable timeout for the entire operation
    const extractionTimeout = setTimeout(() => {
      throw new Error(`Extraction timed out after ${TIMEOUT / 1000} seconds`)
    }, TIMEOUT)

    try {
      // Optimize page loading by selectively blocking non-essential resources
      await page.setRequestInterception(true)
      page.on('request', (req) => {
        const resourceType = req.resourceType()
        // Allow images if specified, always block media, fonts
        if (!allowImages && resourceType === 'image') {
          req.abort()
        } else if (['media', 'font'].includes(resourceType)) {
          req.abort()
        } else if (resourceType === 'stylesheet') {
          // We need styles for proper component extraction
          req.continue()
        } else {
          req.continue()
        }
      })

      // Set user agent and viewport
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      )
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      })

      // Navigate to page
      console.log(`Navigating to ${url}...`)
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      })

      // Wait for body and content to be ready
      await page.waitForSelector('body', { timeout: 5000 }).catch(() => {
        console.log('Body element not found, continuing anyway')
      })

      // Wait a bit longer for images and dynamic content
      // Use setTimeout with a Promise instead of waitForTimeout which may not be available
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Collection for results
      const results: ExtractedComponent[] = []

      // Filter or sort selectors by priority
      let selectorsList = [...COMPONENT_SELECTORS]
      if (options.componentTypes?.length) {
        selectorsList = selectorsList.filter((item) =>
          options.componentTypes?.includes(item.type),
        )
      }

      // Sort by priority but prioritize high-value components
      selectorsList.sort((a, b) => {
        // First prioritize high-value components
        if (a.isHighValue && !b.isHighValue) return -1
        if (!a.isHighValue && b.isHighValue) return 1
        // Then by priority
        return a.priority - b.priority
      })

      // Extract components based on selectors
      for (const { type, selector, isHighValue } of selectorsList) {
        if (results.length >= maxComponents) break
        console.log(`Extracting ${type} using selector: ${selector}`)

        try {
          const elementHandles = await page.$$(selector)
          console.log(
            `Found ${elementHandles.length} elements for type ${type}`,
          )

          // Process in small batches to avoid memory issues
          const batchSize = 5
          for (
            let i = 0;
            i < elementHandles.length && results.length < maxComponents;
            i += batchSize
          ) {
            const batch = elementHandles.slice(i, i + batchSize)

            for (const element of batch) {
              if (results.length >= maxComponents) break

              const component = await processElement(page, element, type, {
                skipScreenshots,
                scoringEnabled: dynamicScoring,
                isHighValueType: isHighValue,
              })

              if (component) {
                results.push(component)
              }
            }

            // Dispose handles
            for (const el of batch) {
              await el.dispose()
            }
          }
        } catch (selectorError) {
          console.error(`Error with selector ${selector}: ${selectorError}`)
          // Continue to the next selector
        }
      }

      // Process main content recursively to find more components if enabled
      if (extractMainContent && results.length < maxComponents) {
        try {
          console.log('Starting recursive processing of main content...')

          // Try to find main content in this order of priority
          const mainSelectors = [
            'main', // Semantic main element
            '#main', // Common main ID
            '#content', // Common content ID
            'article', // Article content
            '.main-content', // Common main content class
            '[role="main"]', // ARIA role main
            '#root', // React apps often use root
            '.content', // Common content class
            'body > div > div', // Common pattern for main wrapper
            'body > div', // Fallback to first div in body
            'body', // Last resort
          ]

          let mainContent = null
          for (const selector of mainSelectors) {
            mainContent = await page.$(selector)
            if (mainContent) {
              console.log(`Found main content using selector: ${selector}`)
              break
            }
          }

          if (mainContent) {
            await processElementRecursively(page, mainContent, {
              maxDepth,
              skipScreenshots,
              results,
              maxComponents,
              scoringEnabled: dynamicScoring,
            })
            await mainContent.dispose()
          }
        } catch (recursiveError) {
          console.error('Error in recursive processing:', recursiveError)
        }
      }

      // Clear the timeout since we finished successfully
      clearTimeout(extractionTimeout)

      // Sort by importance score if dynamic scoring was enabled
      if (dynamicScoring) {
        results.sort((a, b) => {
          const scoreA = a.metadata?.importanceScore || 0
          const scoreB = b.metadata?.importanceScore || 0
          return scoreB - scoreA // Higher scores first
        })
      }

      // Remove any duplicate components by type and HTML similarity
      // But preserve high-importance components
      const uniqueComponents = results.filter((component, index) => {
        // Always keep high-importance components
        if (
          component.metadata?.importanceScore &&
          component.metadata.importanceScore > 70
        ) {
          return true
        }

        // For other components, check for duplicates
        return (
          results.findIndex(
            (c) => c.type === component.type && c.html === component.html,
          ) === index
        )
      })

      // Apply component limit
      const finalComponents = uniqueComponents.slice(0, maxComponents)

      // Store in cache
      componentCache.set(cacheKey, {
        timestamp: Date.now(),
        components: finalComponents,
      })

      return { components: finalComponents }
    } catch (error) {
      clearTimeout(extractionTimeout)
      throw error
    }
  } catch (error) {
    console.error('Extraction error:', error)
    throw new Error(
      `Failed to extract UI components: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  } finally {
    // Make sure we always close the browser
    if (browser) {
      try {
        await browser.close()
      } catch (error) {
        console.error('Error closing browser:', error)
      }
    }
  }
}
