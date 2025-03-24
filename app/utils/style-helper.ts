// app/utils/style-helper.ts
/**
 * Utility functions for preserving and applying styles
 * to extracted components
 */

/**
 * Creates a stylesheet with scoped styles for a component
 */
export const createScopedStylesheet = (
  html: string,
  componentId: string,
): string => {
  // Extract any style tags from the HTML
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
  const styleMatches = [...html.matchAll(styleRegex)]

  if (styleMatches.length === 0) {
    return html // No styles to scope
  }

  // Create a new scoped style tag
  let scopedStyles = `<style data-scoped="${componentId}">`

  // Process each style tag
  styleMatches.forEach((match) => {
    const styleContent = match[1]
    // Add the component ID as a scope
    const scopedContent = styleContent.replace(
      /([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g,
      `#component-${componentId} $1$2`,
    )
    scopedStyles += scopedContent
  })

  scopedStyles += '</style>'

  // Remove the original style tags
  let result = html.replace(styleRegex, '')

  // Wrap the component in a div with the scoped ID
  result = `<div id="component-${componentId}">${result}</div>${scopedStyles}`

  return result
}

/**
 * Extracts external CSS references from HTML
 */
export const extractExternalCSS = async (
  html: string,
  baseUrl: string,
): Promise<string[]> => {
  const linkRegex =
    /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi
  const matches = [...html.matchAll(linkRegex)]

  const cssUrls: string[] = []

  matches.forEach((match) => {
    let url = match[1]

    // Handle relative URLs
    if (!url.startsWith('http') && !url.startsWith('//')) {
      // Handle different relative path formats
      if (url.startsWith('/')) {
        // Absolute path from domain root
        const urlObj = new URL(baseUrl)
        url = `${urlObj.protocol}//${urlObj.host}${url}`
      } else {
        // Relative to current path
        if (!baseUrl.endsWith('/')) {
          // Remove filename from path if present
          const lastSlashIndex = baseUrl.lastIndexOf('/')
          baseUrl = baseUrl.substring(0, lastSlashIndex + 1)
        }
        url = `${baseUrl}${url}`
      }
    }

    cssUrls.push(url)
  })

  return cssUrls
}

/**
 * Inlines external CSS into HTML by adding <style> tags
 */
export const inlineExternalCSS = async (
  html: string,
  cssContents: string[],
): Promise<string> => {
  if (cssContents.length === 0) {
    return html
  }

  // Create a combined style tag with all external CSS
  const inlineStyle = `<style data-source="external-css">${cssContents.join('\n')}</style>`

  // Insert the style tag at the beginning
  return html.replace(/(<\w+)/, `${inlineStyle}$1`)
}

/**
 * Processes HTML to ensure styles are preserved and properly scoped
 */
export const processComponentHTML = (
  html: string,
  componentId: string,
  includeReset: boolean = true,
): string => {
  let processed = html

  // Add a CSS reset if requested (helps with consistent rendering)
  if (includeReset) {
    const resetCSS = `
      <style data-source="reset">
        #component-${componentId} * {
          box-sizing: border-box;
          max-width: 100%;
        }
        #component-${componentId} img {
          max-width: 100%;
          height: auto;
        }
      </style>
    `

    processed = resetCSS + processed
  }

  // Scope styles to prevent leakage
  processed = createScopedStylesheet(processed, componentId)

  return processed
}
