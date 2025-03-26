// app/routes/_index.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useFetcher, Link, useNavigate, useLoaderData } from '@remix-run/react'

// Shadcn UI components
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Slider } from '~/components/ui/slider'
import { Label } from '~/components/ui/label'
import { SearchResultsBar } from '~/components/SearchResultsBar'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'
import { Badge } from '~/components/ui/badge'

// Icons from lucide-react
import {
  Code,
  Copy,
  Check,
  Eye,
  PlayCircle,
  Settings,
  Maximize2,
  Minus,
  Plus,
  Loader2,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  Chrome,
} from 'lucide-react'

// For code highlighting
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism'

// Import your types
import type {
  ActionData,
  LoaderData,
  ExtractedComponent,
  ExtractedImageInfo,
} from '~/types'

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({
    initialMessage: 'Enter a URL to extract UI components',
    storedData: null,
    storedSessionId: '',
  })
}

const COMPONENT_TYPES = [
  { id: 'hero', label: 'Hero Sections' },
  { id: 'carousel', label: 'Carousels & Sliders' },
  { id: 'feature-section', label: 'Feature Sections' },
  { id: 'cta-section', label: 'Call-to-Action' },
  { id: 'product', label: 'Product Components' },
  { id: 'testimonial', label: 'Testimonials' },
  { id: 'image-gallery', label: 'Image Galleries' },
  { id: 'rich-media', label: 'Rich Media' },
  { id: 'headers', label: 'Headers' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'cards', label: 'Cards' },
  { id: 'images', label: 'Images' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'forms', label: 'Forms' },
  { id: 'footers', label: 'Footers' },
  { id: 'modals', label: 'Modals & Dialogs' },
  { id: 'text', label: 'Text Components' },
  { id: 'links', label: 'Links' },
  { id: 'lists', label: 'Lists' },
  { id: 'inputs', label: 'Input Fields' },
  { id: 'tables', label: 'Tables & Grids' },
  { id: 'dividers', label: 'Dividers' },
  { id: 'badges', label: 'Badges' },
  { id: 'tooltips', label: 'Tooltips' },
  { id: 'icons', label: 'Icons' },
  { id: 'alerts', label: 'Alerts & Notifications' },
  { id: 'toggles', label: 'Toggles & Switches' },
  { id: 'progress', label: 'Progress Bars' },
]

function ComponentPreview({ component }: { component: ExtractedComponent }) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('preview')
  const [scale, setScale] = useState(1)
  const previewRef = useRef<HTMLDivElement>(null)

  const adjustScale = useCallback(() => {
    if (previewRef.current && component.metadata?.dimensions) {
      const containerWidth = previewRef.current.clientWidth
      const contentWidth = component.metadata.dimensions.width || 300
      if (contentWidth > containerWidth) {
        setScale(Math.max(0.5, containerWidth / contentWidth))
      } else {
        setScale(1)
      }
    }
  }, [component.metadata?.dimensions])

  useEffect(() => {
    if (activeTab === 'preview') {
      adjustScale()
      window.addEventListener('resize', adjustScale)
      return () => window.removeEventListener('resize', adjustScale)
    }
  }, [activeTab, adjustScale])

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(component.html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Extract background color from component or context styles
  const backgroundColor =
    component.styles?._contextBackground ||
    component.styles?.backgroundColor ||
    '#ffffff'
  const textColor =
    component.styles?._contextColor || component.styles?.color || '#000000'

  // Get original dimensions
  const width = component.metadata?.dimensions?.width || 'auto'
  const height = component.metadata?.dimensions?.height || 'auto'

  // Generate preview HTML
  const previewHtml = useMemo(() => {
    // If component has external styles, include them with the HTML
    const html = component.cleanHtml || component.html

    // Wrap the component in a container that preserves original styling context
    return {
      __html: html,
    }
  }, [component.cleanHtml, component.html])

  // Get component's original display mode
  const displayMode = component.metadata?.originalStyles?.display || 'block'

  return (
    <Card className='mb-6 overflow-hidden border-2 border-periwinkle-200'>
      <CardHeader className='bg-nyanza-100'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg flex items-center gap-2 text-white'>
            {component.name}
            <Badge variant='secondary' className='text-xs'>
              {component.type || 'Component'}
            </Badge>
          </CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={copyToClipboard}
            className='text-white hover:text-nyanza-500'
          >
            {copied ? (
              <>
                <Check className='h-4 w-4 mr-2' /> Copied!
              </>
            ) : (
              <>
                <Copy className='h-4 w-4 mr-2' /> Copy Code
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        <Tabs
          defaultValue='preview'
          value={activeTab}
          onValueChange={setActiveTab}
          className='w-full'
        >
          <TabsList className='w-full border-b'>
            <TabsTrigger value='preview' className='flex items-center gap-2'>
              <Eye className='h-4 w-4' /> Preview
            </TabsTrigger>
            <TabsTrigger value='code' className='flex items-center gap-2'>
              <Code className='h-4 w-4' /> Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value='preview' className='p-4'>
            <div className='relative mb-2 flex items-center justify-end gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
                disabled={scale <= 0.5}
              >
                <Minus className='h-3 w-3' />
              </Button>
              <span className='text-xs text-muted-foreground'>
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setScale((prev) => Math.min(1, prev + 0.1))}
                disabled={scale >= 1}
              >
                <Plus className='h-3 w-3' />
              </Button>
              <Button variant='outline' size='sm' onClick={adjustScale}>
                <Maximize2 className='h-3 w-3' />
              </Button>
            </div>

            {/* Preview container with context-matching background */}
            <div
              ref={previewRef}
              className='border rounded overflow-auto preview-wrapper relative'
              style={{
                minHeight: '150px',
                padding: '0.5rem',
                backgroundColor: backgroundColor,
                color: textColor,
                fontFamily: component.styles?._contextFontFamily || 'inherit',
                fontSize: component.styles?._contextFontSize || 'inherit',
              }}
            >
              {/* Component container with original dimensions */}
              <div
                className='component-preview-parent'
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  width: '100%',
                  minHeight: '100px',
                }}
              >
                <div
                  className='component-preview-container'
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    // Prevent container from stretching component
                    display: 'inline-block',
                    width: typeof width === 'number' ? `${width}px` : width,
                    height: typeof height === 'number' ? `${height}px` : height,
                    maxWidth: '100%',
                    position: 'relative',
                  }}
                >
                  {/* Insert component HTML */}
                  <div
                    dangerouslySetInnerHTML={previewHtml}
                    className='component-inner-content'
                  />

                  {/* If we have external styles from the component, add them */}
                  {component.metadata?.externalStyles && (
                    <style
                      dangerouslySetInnerHTML={{
                        __html: component.metadata.externalStyles,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* If we have screenshot, show it for comparison */}
            {component.screenshot && (
              <div className='mt-4'>
                <p className='text-xs text-muted-foreground mb-1'>
                  Original screenshot:
                </p>
                <div className='border rounded overflow-hidden'>
                  <img
                    src={component.screenshot}
                    alt={`Original ${component.type} screenshot`}
                    className='max-w-full h-auto'
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value='code' className='p-0'>
            <SyntaxHighlighter
              language='markup'
              style={tomorrow}
              customStyle={{
                padding: '1rem',
                margin: 0,
                borderRadius: '0.5rem',
              }}
            >
              {component.html}
            </SyntaxHighlighter>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function LoadingScreen({
  message,
  progress = 0,
  details = '',
  elapsedTime = 0,
}: {
  message: string
  progress?: number
  details?: string
  elapsedTime?: number
}) {
  // Determine which phase we're in based on progress
  const isExtractionPhase = progress < 70
  const isPreviewPhase = progress >= 70 && progress < 100

  // Calculate phase-specific progress
  const extractionProgress = isExtractionPhase
    ? Math.min(100, (progress / 70) * 100)
    : 100

  const previewProgress = isPreviewPhase
    ? Math.min(100, ((progress - 70) / 30) * 100)
    : progress === 100
      ? 100
      : 0

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 dark:bg-night-900 dark:bg-opacity-90 z-50'>
      <div className='text-center max-w-md w-full p-6 bg-white dark:bg-night-800 rounded-lg shadow-2xl'>
        <div className='mb-6'>
          <Loader2 className='mx-auto h-12 w-12 text-blue-600 dark:text-periwinkle-400 animate-spin' />
        </div>

        <h2 className='text-xl font-semibold mb-4 dark:text-gray-200'>
          {message}
        </h2>

        {/* Phase Indicators */}
        <div className='grid grid-cols-2 gap-2 mb-3'>
          <div className='text-center'>
            <div
              className={`text-xs font-medium mb-1 ${isExtractionPhase ? 'text-blue-600 dark:text-periwinkle-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
              <div className='flex items-center justify-center gap-1'>
                {isExtractionPhase && (
                  <span className='flex h-2 w-2 relative'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75'></span>
                    <span className='relative inline-flex rounded-full h-2 w-2 bg-blue-600'></span>
                  </span>
                )}
                Extraction
              </div>
            </div>
            <div className='w-full bg-gray-200 dark:bg-night-600 rounded-full h-2 overflow-hidden'>
              <div
                className={`${isExtractionPhase ? 'bg-blue-600 dark:bg-periwinkle-400' : 'bg-green-500'} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${extractionProgress}%` }}
              />
            </div>
          </div>
          <div className='text-center'>
            <div
              className={`text-xs font-medium mb-1 ${isPreviewPhase ? 'text-blue-600 dark:text-periwinkle-400' : previewProgress === 100 ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`}
            >
              <div className='flex items-center justify-center gap-1'>
                {isPreviewPhase && (
                  <span className='flex h-2 w-2 relative'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75'></span>
                    <span className='relative inline-flex rounded-full h-2 w-2 bg-blue-600'></span>
                  </span>
                )}
                Preview Generation
              </div>
            </div>
            <div className='w-full bg-gray-200 dark:bg-night-600 rounded-full h-2 overflow-hidden'>
              <div
                className={`${isPreviewPhase ? 'bg-blue-600 dark:bg-periwinkle-400' : previewProgress === 100 ? 'bg-green-500' : 'bg-gray-300 dark:bg-night-500'} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${previewProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className='w-full bg-gray-200 dark:bg-night-600 rounded-full h-2.5 mb-4 overflow-hidden'>
          <div
            className='bg-blue-600 dark:bg-periwinkle-400 h-2.5 rounded-full transition-all duration-300'
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
          {progress}% Complete
          {elapsedTime > 0 && ` (${elapsedTime}s)`}
        </div>

        {details && (
          <p className='text-xs text-gray-500 dark:text-gray-300 italic'>
            {details}
          </p>
        )}

        {elapsedTime > 30 && (
          <div className='mt-4 text-yellow-600 dark:text-yellow-400 text-xs'>
            Extraction is taking longer than expected...
          </div>
        )}
      </div>
    </div>
  )
}

export default function ExtractPage() {
  const loaderData = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [activeTab, setActiveTab] = useState('extract')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [componentsPerPage, setComponentsPerPage] = useState(10)
  const [isPolling, setIsPolling] = useState(false)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [manualDebug, setManualDebug] = useState<string>('')
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null,
  )
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [customStyles, setCustomStyles] = useState({
    backgroundColor: '',
    color: '',
    padding: '',
    borderRadius: '',
  })
  const [copiedCustom, setCopiedCustom] = useState(false)
  const [savedLinks, setSavedLinks] = useState<string[]>([])
  const [showSavedLinks, setShowSavedLinks] = useState(false)
  const [extractionMetrics, setExtractionMetrics] = useState({
    totalElements: 0,
    extractedElements: 0,
    failedExtractions: 0,
    extractionTime: 0,
    resourceUsage: { cpu: 0, memory: 0 },
    slowestComponents: [],
    networkBottlenecks: [],
  })
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const extractionStartTime = useRef<number | null>(null)
  const [extractionData, setExtractionData] = useState<ActionData | null>(null)
  const [sessionId, setSessionId] = useState<string>(loaderData.storedSessionId)
  const fetcher = useFetcher<ActionData>()

  useEffect(() => {
    const storedData = localStorage.getItem('extractionData')
    const storedSessionId = localStorage.getItem('sessionId')
    const storedLinks = localStorage.getItem('savedLinks')

    if (storedData) setExtractionData(JSON.parse(storedData))
    if (storedSessionId) setSessionId(storedSessionId)
    if (storedLinks) setSavedLinks(JSON.parse(storedLinks))
  }, [])

  // Function to prepare data for storage by removing large fields
  const prepareDataForStorage = useCallback((data: ActionData | null) => {
    if (!data) return null

    // Create a deep clone to avoid modifying original data
    const storageData = JSON.parse(JSON.stringify(data))

    // Remove large fields from components
    if (storageData.components) {
      storageData.components = storageData.components.map(
        (component: ExtractedComponent) => ({
          ...component,
          // Keep essential fields, remove large content
          html: '', // Remove full HTML content
          cleanHtml: component.cleanHtml?.substring(0, 150) || '', // Keep only a preview
          screenshot: '', // Remove screenshots
          // Keep minimal styles
          styles: {
            backgroundColor: component.styles?.backgroundColor,
            color: component.styles?.color,
            width: component.styles?.width,
            height: component.styles?.height,
          },
          // Keep minimal metadata
          metadata: {
            tagName: component.metadata?.tagName,
            classes: component.metadata?.classes,
            dimensions: component.metadata?.dimensions,
            importanceScore: component.metadata?.importanceScore,
            hasBackgroundImage: component.metadata?.hasBackgroundImage,
            imageCount: component.metadata?.imageCount,
            // Remove full image data
            images: component.metadata?.images
              ? component.metadata.images
                  .slice(0, 2)
                  .map((img: ExtractedImageInfo) => ({
                    src: img.src.substring(0, 100),
                    type: img.type,
                  }))
              : [],
          },
        }),
      )
    }

    return storageData
  }, [])

  // Safe storage function with size checking
  const safelyStoreData = useCallback(
    (key: string, data: any) => {
      try {
        const serialized = JSON.stringify(data)
        // Check data size (rough estimate: 1 char ≈ 2 bytes in UTF-16)
        const sizeInKB = (serialized.length * 2) / 1024

        if (sizeInKB > 4000) {
          // If larger than 4MB
          console.warn(
            `Data too large for localStorage (${Math.round(sizeInKB)}KB), using sessionStorage only`,
          )
          // Store in session storage for current session only
          sessionStorage.setItem(key, serialized)
          return false
        }

        // Safe to store in localStorage
        localStorage.setItem(key, serialized)
        return true
      } catch (error) {
        console.error('Storage error:', error)
        // Try session storage as fallback
        try {
          const compressedData = prepareDataForStorage(data)
          sessionStorage.setItem(key, JSON.stringify(compressedData))
        } catch (sessionError) {
          console.error('Session storage also failed:', sessionError)
        }
        return false
      }
    },
    [prepareDataForStorage],
  )

  useEffect(() => {
    if (extractionData) {
      try {
        // Store a timestamp to track the latest extraction
        localStorage.setItem('extractionTimestamp', Date.now().toString())

        // Try to store full data
        localStorage.setItem('extractionData', JSON.stringify(extractionData))
      } catch (error) {
        console.warn('Error storing full extraction data:', error)
        // Fall back to compressed data
        const storageData = prepareDataForStorage(extractionData)
        safelyStoreData('extractionData', storageData)

        // Always update the timestamp even if we had to compress the data
        localStorage.setItem('extractionTimestamp', Date.now().toString())

        // Keep full data in session storage
        try {
          sessionStorage.setItem(
            'extractionDataFull',
            JSON.stringify(extractionData),
          )
        } catch (e) {
          console.warn(
            'Could not store full extraction data in session storage:',
            e,
          )
        }
      }
    }
  }, [extractionData, prepareDataForStorage, safelyStoreData])

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('sessionId', sessionId)
    }
  }, [sessionId])

  const saveLink = (link: string) => {
    if (!link) return
    const updatedLinks = Array.from(new Set([link, ...savedLinks])).slice(0, 5)
    setSavedLinks(updatedLinks)
    localStorage.setItem('savedLinks', JSON.stringify(updatedLinks))
  }

  const clearStoredData = () => {
    setExtractionData(null)
    setSessionId('')
    localStorage.removeItem('extractionData')
    localStorage.removeItem('sessionId')
  }

  const generateCustomizedHTML = (
    originalHTML: string,
    styles: Record<string, string>,
  ) => {
    const styleString = Object.entries(styles)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ')

    if (!styleString) return originalHTML

    return originalHTML.replace(
      /<([a-z][a-z0-9]*)\s/i,
      `<$1 style="${styleString}" `,
    )
  }

  const filteredComponents = useMemo(() => {
    if (!extractionData?.components) return []

    return extractionData.components.filter((component) => {
      // Type filter
      const matchesType =
        selectedTypes.length === 0 ||
        (component.type && selectedTypes.includes(component.type.toLowerCase()))

      // Search text filter
      const matchesSearch =
        !searchFilter ||
        (component.name &&
          component.name.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (component.type &&
          component.type.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (component.html &&
          component.html.toLowerCase().includes(searchFilter.toLowerCase()))

      return matchesType && matchesSearch
    })
  }, [extractionData?.components, selectedTypes, searchFilter])

  const copyCustomCode = () => {
    if (!selectedComponent) return
    const customCode = generateCustomizedHTML(
      extractionData?.components?.[parseInt(selectedComponent)]?.html || '',
      customStyles,
    )
    navigator.clipboard.writeText(customCode)
    setCopiedCustom(true)
    setTimeout(() => setCopiedCustom(false), 2000)
  }

  useEffect(() => {
    console.log('Fetcher state:', fetcher.state)
    console.log('Extraction data:', extractionData)
    setManualDebug(
      (prev) =>
        prev +
        `\n[${new Date().toISOString()}] Fetcher state: ${fetcher.state}, ` +
        `Has data: ${!!extractionData}, ` +
        `Status: ${extractionData?.status || 'none'}, ` +
        `Components: ${extractionData?.components?.length || 0}`,
    )
  }, [fetcher.state, extractionData])

  const toggleComponentType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      setSelectedTypes(selectedTypes.filter((id) => id !== typeId))
    } else {
      setSelectedTypes([...selectedTypes, typeId])
    }
  }

  const startExtraction = () => {
    if (!url) return
    saveLink(url)
    setSessionId('')
    setManualDebug('')
    extractionStartTime.current = Date.now()
    setIsPolling(true)
    setIsButtonLoading(false)

    const formData = new FormData()
    formData.append('url', url)
    formData.append('action', 'start')

    if (selectedTypes.length > 0) {
      selectedTypes.forEach((type) => {
        formData.append('componentTypes', type)
      })
    }

    setManualDebug(`[${new Date().toISOString()}] Starting extraction...`)
    fetcher.submit(formData, { method: 'post', action: '/extract' })
  }

  const checkStatus = () => {
    if (!sessionId) {
      setManualDebug(
        (prev) =>
          prev +
          `\n[${new Date().toISOString()}] No session ID to check status`,
      )
      return
    }

    setManualDebug(
      (prev) =>
        prev +
        `\n[${new Date().toISOString()}] Manually checking status for ${sessionId}`,
    )

    const formData = new FormData()
    formData.append('sessionId', sessionId)
    formData.append('action', 'status')
    formData.append('page', page.toString())
    formData.append('componentsPerPage', componentsPerPage.toString())

    fetcher.submit(formData, { method: 'post', action: '/extract' })
  }

  const pollForUpdates = useCallback(() => {
    if (!sessionId) return
    setManualDebug(
      (prev) =>
        prev +
        `\n[${new Date().toISOString()}] Polling with sessionId: ${sessionId}`,
    )

    const formData = new FormData()
    formData.append('sessionId', sessionId)
    formData.append('action', 'status')
    formData.append('page', page.toString())
    formData.append('componentsPerPage', componentsPerPage.toString())

    fetcher.submit(formData, { method: 'post', action: '/extract' })
  }, [fetcher, sessionId, page, componentsPerPage])

  useEffect(() => {
    if (extractionData?.sessionId && !sessionId) {
      setManualDebug(
        (prev) =>
          prev +
          `\n[${new Date().toISOString()}] Setting session ID: ${extractionData.sessionId}`,
      )
      setSessionId(extractionData.sessionId)
    }

    if (
      extractionData?.status === 'pending' ||
      extractionData?.status === 'processing'
    ) {
      if (!isPolling) {
        setManualDebug(
          (prev) =>
            prev +
            `\n[${new Date().toISOString()}] Starting polling for status: ${extractionData?.status}`,
        )
        setIsPolling(true)
        pollingRef.current = setInterval(pollForUpdates, 2000)
      }
    } else if (isPolling) {
      setManualDebug(
        (prev) =>
          prev +
          `\n[${new Date().toISOString()}] Stopping polling, status: ${extractionData?.status}`,
      )
      setIsPolling(false)
      setIsButtonLoading(false) // Ensure button loading is cleared when process completes
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }

    if (
      extractionStartTime.current &&
      Date.now() - extractionStartTime.current > 120000
    ) {
      setManualDebug(
        (prev) =>
          prev +
          `\n[${new Date().toISOString()}] Extraction timeout after 2 minutes`,
      )
      setIsPolling(false)
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [extractionData, isPolling, pollForUpdates, sessionId])

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined
    if (isPolling) {
      timer = setInterval(() => {
        setElapsedTime(
          Math.floor((Date.now() - (extractionStartTime.current || 0)) / 1000),
        )
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isPolling])

  useEffect(() => {
    if (fetcher.data?.components && fetcher.data.components.length > 0) {
      setExtractionData(fetcher.data)

      if (typeof window !== 'undefined') {
        try {
          // Try to store the full data in sessionStorage
          sessionStorage.setItem(
            'extractionDataFull',
            JSON.stringify(fetcher.data),
          )

          // Set a flag to notify the playground that new data is available
          // This will force the playground to use the latest data
          sessionStorage.setItem('newExtractionAvailable', 'true')

          // Add a unique identifier to track this specific extraction
          const extractionId = `extraction_${Date.now()}`
          sessionStorage.setItem('currentExtractionId', extractionId)
        } catch (e) {
          console.warn('Failed to store full extraction data:', e)
        }

        // Handle localStorage with care
        try {
          // Try full data first
          localStorage.setItem('extractionData', JSON.stringify(fetcher.data))

          // Update timestamp and extraction ID in localStorage too
          localStorage.setItem('extractionTimestamp', Date.now().toString())
          const extractionId =
            sessionStorage.getItem('currentExtractionId') ||
            `extraction_${Date.now()}`
          localStorage.setItem('currentExtractionId', extractionId)
        } catch (error) {
          console.warn('Failed to store full data in localStorage:', error)
          // Fall back to compressed data
          const minimalData = prepareDataForStorage(fetcher.data)
          safelyStoreData('extractionData', minimalData)

          // Still update timestamp and extraction ID
          localStorage.setItem('extractionTimestamp', Date.now().toString())
          const extractionId =
            sessionStorage.getItem('currentExtractionId') ||
            `extraction_${Date.now()}`
          localStorage.setItem('currentExtractionId', extractionId)
        }

        // Session ID is small, safe to store directly
        const newSessionId =
          fetcher.formData?.get('sessionId')?.toString() || ''
        localStorage.setItem('sessionId', newSessionId)
        sessionStorage.setItem('sessionId', newSessionId)
        setSessionId(newSessionId)
      }
    }
  }, [fetcher.data, fetcher.formData, prepareDataForStorage, safelyStoreData])

  useEffect(() => {
    return () => {
      const currentPath = window.location.pathname
      if (
        !currentPath.includes('debug') &&
        !currentPath.includes('playground')
      ) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('extractionData')
          sessionStorage.removeItem('sessionId')
        }
      }
    }
  }, [])

  const handleNextPage = () => {
    if (extractionData?.totalPages && page < extractionData.totalPages) {
      setPage(page + 1)
    }
  }

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const showLoadingScreen =
    isPolling ||
    isButtonLoading ||
    extractionData?.status === 'pending' ||
    extractionData?.status === 'processing' ||
    (extractionData?.components && extractionData.components.length === 0)

  return (
    <div className='container mx-auto p-6'>
      {showLoadingScreen && (
        <LoadingScreen
          message={
            isPolling
              ? 'Extracting components...'
              : extractionData?.status === 'pending'
                ? 'Preparing extraction...'
                : extractionData?.status === 'processing'
                  ? 'Processing components...'
                  : 'Initializing...'
          }
          progress={extractionData?.progress || 0}
          details={extractionData?.statusDetails}
          elapsedTime={elapsedTime}
        />
      )}
      <Card className='max-w-6xl mx-auto dark:bg-night-300 dark:border-night-600'>
        <CardHeader className='dark:bg-night-400'>
          <CardTitle className='dark:text-gray-100'>
            FrontendXplorer - Extract UI Components
          </CardTitle>
        </CardHeader>
        <CardContent className='dark:bg-night-300'>
          <div className='space-y-6'>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-[1fr,auto] gap-2'>
                <div className='relative'>
                  <Input
                    type='url'
                    placeholder='Enter a URL to extract UI components'
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onFocus={() => setShowSavedLinks(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSavedLinks(false), 200)
                    }
                    disabled={isPolling}
                    className='flex-1 pl-10 dark:bg-night-500 dark:border-night-600 dark:text-gray-200 dark:placeholder-gray-400'
                    required
                  />
                  <Chrome className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500' />

                  {showSavedLinks && savedLinks.length > 0 && (
                    <div className='absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1'>
                      {savedLinks.map((link, index) => (
                        <div
                          key={index}
                          className='px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center'
                          onClick={() => {
                            setUrl(link)
                            setShowSavedLinks(false)
                          }}
                        >
                          <Chrome className='h-4 w-4 mr-2 text-gray-500' />
                          <span className='truncate'>{link}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => {
                    setIsButtonLoading(true) // Show loading state immediately when button is clicked
                    clearStoredData()
                    startExtraction()
                  }}
                  disabled={!url || isPolling || isButtonLoading}
                  className='whitespace-nowrap'
                >
                  {isPolling || isButtonLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {isPolling ? 'Extracting...' : 'Preparing...'}
                    </>
                  ) : extractionData?.status === 'completed' ? (
                    <>
                      <RefreshCw className='mr-2 h-4 w-4' />
                      Extract Again
                    </>
                  ) : (
                    'Extract Components'
                  )}
                </Button>
              </div>

              <div>
                <div className='border rounded-lg p-4 bg-gray-50 dark:bg-night-400 dark:border-night-600'>
                  <div className='flex items-center justify-between mb-3'>
                    <h3 className='text-sm font-medium dark:text-gray-200'>
                      Filter Components
                    </h3>

                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className='text-xs h-7 px-2'
                      >
                        <Filter className='h-4 w-4 mr-2' />
                        {showFilterMenu ? 'Hide Filters' : 'Show Filters'}
                      </Button>
                      {showFilterMenu && (
                        <>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-xs h-7 px-2'
                            onClick={() =>
                              setSelectedTypes(COMPONENT_TYPES.map((t) => t.id))
                            }
                            disabled={
                              selectedTypes.length === COMPONENT_TYPES.length
                            }
                          >
                            Select All
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-xs h-7 px-2'
                            onClick={() => setSelectedTypes([])}
                            disabled={selectedTypes.length === 0}
                          >
                            Clear All
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {showFilterMenu && (
                    <>
                      {/* Search Filter */}
                      <div className='relative mb-3'>
                        <Input
                          type='text'
                          placeholder='Search components...'
                          className='pl-8 text-sm'
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                        />
                        <div className='absolute left-2.5 top-1/2 transform -translate-y-1/2'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='text-gray-400'
                          >
                            <circle cx='11' cy='11' r='8'></circle>
                            <line x1='21' y1='21' x2='16.65' y2='16.65'></line>
                          </svg>
                        </div>
                        {searchFilter && (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0'
                            onClick={() => setSearchFilter('')}
                          >
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              width='14'
                              height='14'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            >
                              <line x1='18' y1='6' x2='6' y2='18'></line>
                              <line x1='6' y1='6' x2='18' y2='18'></line>
                            </svg>
                          </Button>
                        )}
                      </div>

                      {/* Active Filters */}
                      {selectedTypes.length > 0 && (
                        <div className='flex flex-wrap gap-2 mb-3'>
                          {selectedTypes.map((typeId) => {
                            const type = COMPONENT_TYPES.find(
                              (t) => t.id === typeId,
                            )
                            return (
                              <Badge
                                key={typeId}
                                variant='secondary'
                                className='pl-2 pr-1 py-1 flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-night-500 dark:text-periwinkle-400 dark:hover:bg-night-600'
                              >
                                {type?.label}
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='h-4 w-4 p-0 rounded-full'
                                  onClick={() => toggleComponentType(typeId)}
                                >
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='10'
                                    height='10'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                  >
                                    <line x1='18' y1='6' x2='6' y2='18'></line>
                                    <line x1='6' y1='6' x2='18' y2='18'></line>
                                  </svg>
                                </Button>
                              </Badge>
                            )
                          })}

                          {selectedTypes.length > 0 && (
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-6 text-xs px-2'
                              onClick={() => setSelectedTypes([])}
                            >
                              Clear Filters
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Filter Categories */}
                      <div className='grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2'>
                        {COMPONENT_TYPES.map((type) => (
                          <div
                            key={type.id}
                            className={`flex items-center space-x-2 p-1 rounded ${
                              selectedTypes.includes(type.id)
                                ? 'bg-blue-50'
                                : ''
                            }`}
                          >
                            <Checkbox
                              id={`filter-${type.id}`}
                              checked={selectedTypes.includes(type.id)}
                              onCheckedChange={() =>
                                toggleComponentType(type.id)
                              }
                              className={
                                selectedTypes.includes(type.id)
                                  ? 'text-blue-600'
                                  : ''
                              }
                            />
                            <Label
                              htmlFor={`filter-${type.id}`}
                              className={`text-sm ${
                                selectedTypes.includes(type.id)
                                  ? 'font-medium text-blue-700 dark:text-periwinkle-400'
                                  : 'dark:text-gray-300'
                              }`}
                            >
                              {type.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Loading Indicators */}
            {(isPolling ||
              extractionData?.status === 'pending' ||
              extractionData?.status === 'processing') && (
              <div className='my-4 animate-pulse'>
                <div className='flex justify-between items-center mb-3'>
                  <div className='flex items-center space-x-2'>
                    <div className='flex space-x-1'>
                      <div className='w-2 h-2 rounded-full bg-blue-600 animate-bounce'></div>
                      <div
                        className='w-2 h-2 rounded-full bg-blue-600 animate-bounce'
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                      <div
                        className='w-2 h-2 rounded-full bg-blue-600 animate-bounce'
                        style={{ animationDelay: '0.4s' }}
                      ></div>
                    </div>
                    <span className='text-sm'>
                      {extractionData?.message || 'Analyzing website...'}
                      {extractionStartTime.current ? ` (${elapsedTime}s)` : ''}
                    </span>
                  </div>
                  <span className='text-sm font-medium'>
                    {extractionData?.progress || 0}%
                  </span>
                </div>

                <div className='w-full bg-gray-200 dark:bg-night-600 rounded-full h-2.5 overflow-hidden'>
                  <div
                    className='bg-blue-600 dark:bg-periwinkle-400 h-2.5 rounded-full transition-all duration-300 relative'
                    style={{ width: `${extractionData?.progress || 0}%` }}
                  >
                    <div className='absolute inset-0 bg-blue-400 opacity-50 animate-pulse'></div>
                  </div>
                </div>

                {extractionData?.statusDetails && (
                  <div className='mt-2 text-xs text-gray-500'>
                    {extractionData.statusDetails}
                  </div>
                )}
                {elapsedTime > 30 && (
                  <div className='mt-2 text-xs text-yellow-600'>
                    <Loader2 className='inline mr-1 h-3 w-3 animate-spin' />
                    Extraction is taking longer than expected...
                  </div>
                )}
              </div>
            )}

            {extractionData?.error && (
              <Alert variant='destructive' className='mt-4'>
                <AlertDescription>
                  <span className='font-medium'>Error:</span>{' '}
                  {extractionData.error}
                </AlertDescription>
              </Alert>
            )}

            {extractionData?.components &&
              extractionData.components.length > 0 && (
                <div className='flex justify-end space-x-2 mt-6'>
                  <Link to='/debug' className='inline-flex'>
                    <Button variant='outline'>
                      <Code className='mr-2 h-4 w-4' />
                      Debug View
                    </Button>
                  </Link>
                  <Link to='/playground' className='inline-flex'>
                    <Button>
                      <Code className='mr-2 h-4 w-4' />
                      Asset Playground
                    </Button>
                  </Link>
                  <Button variant='outline' onClick={clearStoredData}>
                    Clear Results
                  </Button>
                </div>
              )}

            {extractionData?.components &&
            extractionData.components.length > 0 ? (
              <div className='mt-4'>
                <div className='space-y-4'>
                  <SearchResultsBar
                    totalResults={filteredComponents.length}
                    extractionTime={
                      extractionStartTime.current
                        ? (Date.now() - extractionStartTime.current) / 1000
                        : 0
                    }
                    searchQuery={url}
                  />
                  {filteredComponents.map((component, index) => (
                    <ComponentPreview
                      key={`${component.type}-${index}`}
                      component={component}
                    />
                  ))}
                </div>
              </div>
            ) : !isPolling &&
              extractionData?.status !== 'pending' &&
              extractionData?.status !== 'processing' ? (
              <div className='py-8 text-center'>
                <p className='text-muted-foreground'>
                  Enter a URL and click "Extract Components" to analyze a
                  website.
                </p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
