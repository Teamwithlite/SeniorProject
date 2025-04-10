import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useFetcher, Link, useNavigate, useLoaderData } from '@remix-run/react'
import { SearchResultsBar } from '@/components/SearchResultsBar'
import ExtractionLoadingScreen from './loadingscreen'
import { MetricsPanel, type ExtractionMetrics } from '~/components/MetricsPanel'

// Shadcn UI components
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
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
  BarChart,
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
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(component.html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openInTestingPage = (componentHtml: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('codeTestContent', componentHtml);
      navigate('/code-test');
    }
  }

  const previewHtml = useMemo(() => {
    return `
      <html>
      <head>
        <style>${component.metadata?.externalStyles || ''}</style>
      </head>
      <body style="margin: 0; padding: 10px;">${component.cleanHtml || component.html}</body>
      </html>
    `
  }, [component.cleanHtml, component.html, component.metadata?.externalStyles])

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const doc =
        iframeRef.current.contentDocument ||
        iframeRef.current.contentWindow.document
      doc.open()
      doc.write(previewHtml)
      doc.close()
    }
  }, [previewHtml, activeTab])

  return (
    <Card className='mb-6 overflow-hidden border-2 border-gray-200'>
      <CardHeader className='bg-black'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg flex items-center gap-2'>
            {component.name}
            <span className='text-xs bg-gray-200 px-2 py-1 rounded'>
              {component.type || 'Component'}
            </span>
          </CardTitle>
          <Button variant='ghost' size='sm' onClick={copyToClipboard}>
            {copied ? (
              <Check className='h-4 w-4 mr-2' />
            ) : (
              <Copy className='h-4 w-4 mr-2' />
            )}
            {copied ? 'Copied!' : 'Copy Code'}
          </Button>
          <Button onClick={() => openInTestingPage(component.html)} variant="outline" size="sm">
  <Eye className="mr-2 h-4 w-4" />
  Test in Playground
</Button>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='w-full border-b'>
            <TabsTrigger value='preview' className='flex items-center gap-2'>
              <Eye className='h-4 w-4' /> Preview
            </TabsTrigger>
            <TabsTrigger value='code' className='flex items-center gap-2'>
              <Code className='h-4 w-4' /> Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value='preview' className='p-4'>
            <iframe
              ref={iframeRef}
              className='w-full border rounded'
              style={{ minHeight: '150px', border: '1px solid #ccc' }}
            />
          </TabsContent>

          <TabsContent value='code' className='p-0'>
            <SyntaxHighlighter
              language='markup'
              style={tomorrow}
              customStyle={{ padding: '1rem', borderRadius: '0.5rem' }}
            >
              {component.html}
            </SyntaxHighlighter>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default function ExtractPage() {
  const [extractionProgress, setExtractionProgress] = useState(0)
  const [renderProgress, setRenderProgress] = useState(0)
  const [isRenderingPreviews, setIsRenderingPreviews] = useState(false)
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
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const extractionStartTime = useRef<number | null>(null)
  const [extractionMetrics, setExtractionMetrics] =
    useState<ExtractionMetrics | null>(null)
  const [extractionData, setExtractionData] = useState<ActionData | null>(null)
  const [sessionId, setSessionId] = useState<string>(loaderData.storedSessionId)
  const fetcher = useFetcher<ActionData>()
  const [extractionPhase, setExtractionPhase] = useState<
    | 'idle'
    | 'navigating'
    | 'detecting'
    | 'extracting'
    | 'rendering'
    | 'complete'
  >('idle')

  // Loading screen states
  const [loadingProgress, setLoadingProgress] = useState({
    navigating: 0,
    extracting: 0,
    rendering: 0,
    currentStep: 'idle' as 'idle' | 'navigating' | 'extracting' | 'rendering',
  })

  useEffect(() => {
    const storedData = localStorage.getItem('extractionData')
    const storedSessionId = localStorage.getItem('sessionId')
    const storedLinks = localStorage.getItem('savedLinks')

    if (storedData) setExtractionData(JSON.parse(storedData))
    if (storedSessionId) setSessionId(storedSessionId)
    if (storedLinks) setSavedLinks(JSON.parse(storedLinks))
  }, [])

  const prepareDataForStorage = useCallback((data: ActionData | null) => {
    if (!data) return null
    const storageData = JSON.parse(JSON.stringify(data))
    if (storageData.components) {
      storageData.components = storageData.components.map(
        (component: ExtractedComponent) => ({
          ...component,
          html: '',
          cleanHtml: component.cleanHtml?.substring(0, 150) || '',
          screenshot: '',
          styles: {
            backgroundColor: component.styles?.backgroundColor,
            color: component.styles?.color,
            width: component.styles?.width,
            height: component.styles?.height,
          },
          metadata: {
            tagName: component.metadata?.tagName,
            classes: component.metadata?.classes,
            dimensions: component.metadata?.dimensions,
            importanceScore: component.metadata?.importanceScore,
            hasBackgroundImage: component.metadata?.hasBackgroundImage,
            imageCount: component.metadata?.imageCount,
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

  const safelyStoreData = useCallback(
    (key: string, data: any) => {
      try {
        const serialized = JSON.stringify(data)
        const sizeInKB = (serialized.length * 2) / 1024
        if (sizeInKB > 4000) {
          console.warn(
            `Data too large for localStorage (${Math.round(sizeInKB)}KB), using sessionStorage only`,
          )
          sessionStorage.setItem(key, serialized)
          return false
        }
        localStorage.setItem(key, serialized)
        return true
      } catch (error) {
        console.error('Storage error:', error)
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
        localStorage.setItem('extractionTimestamp', Date.now().toString())
        localStorage.setItem('extractionData', JSON.stringify(extractionData))
      } catch (error) {
        console.warn('Error storing full extraction data:', error)
        const storageData = prepareDataForStorage(extractionData)
        safelyStoreData('extractionData', storageData)
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
      const matchesType =
        selectedTypes.length === 0 ||
        (component.type && selectedTypes.includes(component.type.toLowerCase()))
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
    setExtractionPhase('navigating')
    setLoadingProgress(0) // Reset to 0%

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
      setIsButtonLoading(false)
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

  // Update loading progress based on extraction status
  useEffect(() => {
    if (!extractionData) return

    if (extractionData.status === 'navigating') {
      setLoadingProgress((prev) => ({
        ...prev,
        currentStep: 'navigating',
        navigating: extractionData.progress || 0,
      }))
    } else if (extractionData.status === 'processing') {
      setLoadingProgress((prev) => ({
        ...prev,
        currentStep: 'extracting',
        extracting: extractionData.progress || 0,
      }))
    } else if (
      extractionData.status === 'completed' &&
      extractionData.components
    ) {
      setLoadingProgress((prev) => ({
        ...prev,
        currentStep: 'rendering',
        rendering: 0,
      }))
    }
  }, [extractionData])

  // Update rendering progress
  useEffect(() => {
    if (extractionData?.components && isRenderingPreviews) {
      setLoadingProgress((prev) => ({
        ...prev,
        rendering: renderProgress,
      }))
    }
  }, [extractionData?.components, isRenderingPreviews, renderProgress])

  useEffect(() => {
    if (fetcher.data?.components && fetcher.data.components.length > 0) {
      setExtractionData(fetcher.data)

      // Add these lines to save metrics if they exist in fetcher.data
      if (fetcher.data.metrics) {
        setExtractionMetrics(fetcher.data.metrics)
        // You could also store metrics in localStorage
        try {
          localStorage.setItem(
            'extractionMetrics',
            JSON.stringify(fetcher.data.metrics),
          )
        } catch (e) {
          console.warn('Failed to store metrics:', e)
        }
      }

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

  useEffect(() => {
    if (extractionData?.components) {
      setIsRenderingPreviews(true)
      setExtractionProgress(100)

      let renderedCount = 0
      const totalComponents = extractionData.components.length

      const renderInterval = setInterval(() => {
        renderedCount++
        const progress = Math.min(
          100,
          Math.round((renderedCount / totalComponents) * 100),
        )
        setRenderProgress(progress)

        if (progress === 100) {
          clearInterval(renderInterval)
          setIsRenderingPreviews(false)
        }
      }, 50)

      return () => clearInterval(renderInterval)
    }
  }, [extractionData?.components])
  useEffect(() => {
    if (!extractionData) return

    // Map terminal messages to phases
    if (extractionData.message?.includes('Navigating to')) {
      setExtractionPhase('navigating')
      setLoadingProgress(20) // Initial progress
    } else if (extractionData.message?.includes('Detected')) {
      setExtractionPhase('detecting')
      setLoadingProgress(40)
    } else if (extractionData.message?.includes('Extracting')) {
      setExtractionPhase('extracting')
      setLoadingProgress(60)
    } else if (extractionData.message?.includes('Extraction complete')) {
      setExtractionPhase('complete')
      setLoadingProgress(100)
    }
  }, [extractionData])
  const showLoadingScreen =
    extractionPhase !== 'idle' &&
    extractionPhase !== 'complete' &&
    (isPolling || isButtonLoading)

  return (
    <div className='container mx-auto p-6'>
      {showLoadingScreen && (
        <ExtractionLoadingScreen
          currentStep={
            loadingProgress.currentStep === 'navigating'
              ? 0
              : loadingProgress.currentStep === 'extracting'
                ? 1
                : 2
          }
          progress={
            loadingProgress.currentStep === 'navigating'
              ? loadingProgress.navigating
              : loadingProgress.currentStep === 'extracting'
                ? loadingProgress.extracting
                : loadingProgress.rendering
          }
          extractionDetails={{
            url,
            componentTypes: selectedTypes,
            elapsedTime,
          }}
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
                    setIsButtonLoading(true)
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
                  <Link to='/metrics' className='inline-flex'>
                    <Button variant='outline'>
                      <BarChart className='mr-2 h-4 w-4' />
                      Metrics Dashboard
                    </Button>
                  </Link>
                  <Link to="/code-test" className="inline-flex">
  <Button variant="outline">
    <Code className="mr-2 h-4 w-4" />
    Test Component Code
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
                  {extractionMetrics && (
                    <MetricsPanel
                      metrics={extractionMetrics}
                      showDetailedMetrics={false}
                    />
                  )}
                  {filteredComponents.map((component, index) => (
                    <ComponentPreview
                      key={`${component.type}-${index}`}
                      component={component}
                      onTestClick={() => openInTestingPage(component.html)}
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
