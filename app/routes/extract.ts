// app/routes/extract.ts
import { json } from '@remix-run/node'
import type { ActionFunction } from '@remix-run/node'
import { extractWebsite } from '~/services/extractor'

export const action: ActionFunction = async ({ request }) => {
  try {
    // Get the submitted URL from the form data
    const formData = await request.formData()
    const url = formData.get('url') as string
    // Get action type
    const action = (formData.get('action') as string) || 'start'

    // Handle filters/component types
    const componentTypes = formData.getAll('componentTypes') as string[]
    console.log('Received URL for extraction:', url)

    if (!url) {
      return json({
        success: false,
        error: 'Please provide a valid URL',
      })
    }

    // Call our extraction service and wait for results
    console.log('Starting component extraction...')
    const options: any = {
      // Enable performance optimizations
      aboveTheFoldFirst: true, // Prioritize visible content first
      lazyScreenshots: true, // Only take screenshots of important components
      useCache: true, // Use caching to speed up repeated extractions
      dynamicScoring: true, // Use importance scoring to prioritize components
      timeout: 45000, // Slightly shorter timeout for faster response
      maxComponents: 80, // Get more components for better selection
    }

    // Add filters if present
    if (componentTypes.length > 0) {
      console.log('Filtering by component types:', componentTypes)
      options.componentTypes = componentTypes
    }

    const extractedData = await extractWebsite(url, options)
    console.log(
      `Extraction complete. Found ${extractedData.components.length} components`,
    )

    // Sort components by importance score for faster display of key elements
    const sortedComponents = [...extractedData.components].sort((a, b) => {
      const scoreA = a.metadata?.importanceScore || 0
      const scoreB = b.metadata?.importanceScore || 0
      return scoreB - scoreA // Higher scores first
    })

    return json({
      success: true,
      status: 'completed',
      components: sortedComponents,
      componentsFound: extractedData.components.length,
      componentsProcessed: extractedData.components.length,
      message: `Extraction complete. Found ${extractedData.components.length} components.`,
      progress: 100,
    })
  } catch (error) {
    console.error('Extraction failed:', error)
    return json({
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
      status: 'error',
      progress: 0,
      message: 'Extraction failed',
    })
  }
}
