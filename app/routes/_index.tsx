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

// For code highlighting - make sure these are installed
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism'

// Import your types
import type { ActionData, LoaderData, ExtractedComponent } from '~/types'

// Updated loader to check for stored data in URL params only
export const loader: LoaderFunction = async ({ request }) => {
  // We'll use client-side JavaScript to load from localStorage,
  // so we just return a default state here
  return json<LoaderData>({
    initialMessage: 'Enter a URL to extract UI components',
    storedData: null,
    storedSessionId: '',
  })
}

// A list of possible component types, used for optional filtering
const COMPONENT_TYPES = [
  { id: 'buttons', label: 'Buttons' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'cards', label: 'Cards' },
  { id: 'forms', label: 'Forms' },
  { id: 'headers', label: 'Headers' },
  { id: 'footers', label: 'Footers' },
  { id: 'hero', label: 'Hero Sections' },
  { id: 'modals', label: 'Modals & Dialogs' },
]

// Renders a single extracted component
function ComponentPreview({ component }: { component: ExtractedComponent }) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('preview')
  const [scale, setScale] = useState(1)
  const previewRef = useRef<HTMLDivElement>(null)

  // Attempt to scale the preview so it fits within the container
  const adjustScale = useCallback(() => {
    if (previewRef.current && component.metadata?.dimensions) {
      const containerWidth = previewRef.current.clientWidth
      const contentWidth = component.metadata.dimensions.width
      // Only scale down if the content is wider than the container
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

  // Pre-render the HTML content
  const previewHtml = useMemo(() => {
    return { __html: component.cleanHtml || component.html }
  }, [component.cleanHtml, component.html])

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

          {/* PREVIEW TAB */}
          <TabsContent value='preview' className='p-4'>
            {/* Scale controls */}
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

            {/* The container for the scaled preview */}
            <div
              ref={previewRef}
              className='border rounded p-4 bg-white overflow-auto preview-wrapper'
              style={{ minHeight: '150px' }}
            >
              <div
                className='component-preview-container'
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  width: component.metadata?.dimensions?.width
                    ? `${component.metadata.dimensions.width}px`
                    : 'auto',
                  height: component.metadata?.dimensions?.height
                    ? `${component.metadata.dimensions.height}px`
                    : 'auto',
                  // Add inline styles from component.styles to container
                  backgroundColor:
                    component.styles?.backgroundColor || 'inherit',
                  color: component.styles?.color || 'inherit',
                  fontSize: component.styles?.fontSize || 'inherit',
                  fontFamily: component.styles?.fontFamily || 'inherit',
                  fontWeight: component.styles?.fontWeight || 'inherit',
                  lineHeight: component.styles?.lineHeight || 'inherit',
                  margin: '0',
                  padding: '0',
                }}
              >
                <div dangerouslySetInnerHTML={previewHtml} />
              </div>
            </div>
          </TabsContent>

          {/* CODE TAB */}
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

// The main component for the homepage
export default function ExtractPage() {
  const loaderData = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [activeTab, setActiveTab] = useState('extract')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [componentsPerPage, setComponentsPerPage] = useState(10)
  const [isPolling, setIsPolling] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [manualDebug, setManualDebug] = useState<string>('')
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null,
  )
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

  // Initialize with loader data if available
  const [extractionData, setExtractionData] = useState<ActionData | null>(null)
  const [sessionId, setSessionId] = useState<string>(loaderData.storedSessionId)
  const fetcher = useFetcher<ActionData>()

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem('extractionData')
    const storedSessionId = localStorage.getItem('sessionId')
    const storedLinks = localStorage.getItem('savedLinks')

    if (storedData) {
      setExtractionData(JSON.parse(storedData))
    }
    if (storedSessionId) {
      setSessionId(storedSessionId)
    }
    if (storedLinks) {
      setSavedLinks(JSON.parse(storedLinks))
    }
  }, [])

  // Update localStorage when extraction data changes
  useEffect(() => {
    if (extractionData) {
      localStorage.setItem('extractionData', JSON.stringify(extractionData))
    }
  }, [extractionData])

  // Update localStorage when session ID changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('sessionId', sessionId)
    }
  }, [sessionId])

  // Function to save links to history
  const saveLink = (link: string) => {
    if (!link) return

    const updatedLinks = Array.from(new Set([link, ...savedLinks])).slice(0, 5) // Keep only 5 unique links
    setSavedLinks(updatedLinks)
    localStorage.setItem('savedLinks', JSON.stringify(updatedLinks))
  }

  // Function to clear stored data
  const clearStoredData = () => {
    setExtractionData(null)
    setSessionId('')
    localStorage.removeItem('extractionData')
    localStorage.removeItem('sessionId')
  }

  // Function to generate customized HTML with styles
  const generateCustomizedHTML = (
    originalHTML: string,
    styles: Record<string, string>,
  ) => {
    // For simple implementation, just wrap in a div with styles
    const styleString = Object.entries(styles)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ')

    if (!styleString) return originalHTML

    // Return with style attribute added
    return originalHTML.replace(
      /<([a-z][a-z0-9]*)\s/i,
      `<$1 style="${styleString}" `,
    )
  }

  const filteredComponents = useMemo(() => {
    if (!extractionData?.components) return []

    // If no types are selected, show all components
    if (selectedTypes.length === 0) return extractionData.components

    // Filter components that match any of the selected types
    return extractionData.components.filter((component) =>
      selectedTypes.includes(component.type?.toLowerCase()),
    )
  }, [extractionData?.components, selectedTypes])

  // Function to copy customized code
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

  // Debug logs - very important for troubleshooting
  useEffect(() => {
    console.log('Fetcher state:', fetcher.state)
    console.log('Extraction data:', extractionData)

    // Add manual debug info
    setManualDebug(
      (prev) =>
        prev +
        `\n[${new Date().toISOString()}] Fetcher state: ${fetcher.state}, ` +
        `Has data: ${!!extractionData}, ` +
        `Status: ${extractionData?.status || 'none'}, ` +
        `Components: ${extractionData?.components?.length || 0}`,
    )
  }, [fetcher.state, extractionData])

  // Component type filter toggle
  const toggleComponentType = (typeId) => {
    if (selectedTypes.includes(typeId)) {
      setSelectedTypes(selectedTypes.filter((id) => id !== typeId))
    } else {
      setSelectedTypes([...selectedTypes, typeId])
    }
  }

  // Start extraction - this is the handler for the Extract button
  const startExtraction = () => {
    if (!url) return

    // Save the URL to history
    saveLink(url)

    // Reset state for a fresh extraction
    setSessionId('')
    setManualDebug('')
    extractionStartTime.current = Date.now()
    setIsPolling(true)

    // Create a FormData object to send to the server
    const formData = new FormData()
    formData.append('url', url)
    formData.append('action', 'start')

    // Add any selected component types to filter
    if (selectedTypes.length > 0) {
      selectedTypes.forEach((type) => {
        formData.append('componentTypes', type)
      })
    }

    // Submit the form to the /extract route
    setManualDebug(`[${new Date().toISOString()}] Starting extraction...`)
    fetcher.submit(formData, { method: 'post', action: '/extract' })
  }

  // Manual check status button
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

  // Poll for updates
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

  // Start or stop polling based on extraction status
  useEffect(() => {
    // If we get a session ID from the server but don't have one locally, set it
    if (extractionData?.sessionId && !sessionId) {
      setManualDebug(
        (prev) =>
          prev +
          `\n[${new Date().toISOString()}] Setting session ID: ${extractionData.sessionId}`,
      )
      setSessionId(extractionData.sessionId)
    }

    // If the extraction is in progress, start polling
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
        // Poll every 2 seconds
        pollingRef.current = setInterval(pollForUpdates, 2000)
      }
    } else if (isPolling) {
      // Extraction is done or error, stop polling
      setManualDebug(
        (prev) =>
          prev +
          `\n[${new Date().toISOString()}] Stopping polling, status: ${extractionData?.status}`,
      )
      setIsPolling(false)
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }

    // Add a timeout safety valve - if extraction takes too long, stop polling
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

    // Cleanup on unmount
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [extractionData, isPolling, pollForUpdates, sessionId])

  // Timer for elapsed time
  useEffect(() => {
    let timer
    if (isPolling) {
      timer = setInterval(() => {
        setElapsedTime(
          Math.floor((Date.now() - extractionStartTime.current) / 1000),
        )
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isPolling])

  // Store extraction data when complete and persist it
  useEffect(() => {
    if (fetcher.data?.components && fetcher.data.components.length > 0) {
      setExtractionData(fetcher.data)
      // Store in sessionStorage on the client side
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('extractionData', JSON.stringify(fetcher.data))
        sessionStorage.setItem(
          'sessionId',
          fetcher.formData?.get('sessionId')?.toString() || '',
        )
        setSessionId(fetcher.formData?.get('sessionId')?.toString() || '')
      }
    }
  }, [fetcher.data, fetcher.formData])

  // Clean up storage when navigating away (except to debug/playground)
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

  // Functions for pagination
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

  return (
    <div className='container mx-auto p-6'>
      <Card className='max-w-6xl mx-auto'>
        <CardHeader>
          <CardTitle>FrontendXplorer - Extract UI Components</CardTitle>
        </CardHeader>
        <CardContent>
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
                    className='flex-1 pl-10'
                    required
                  />
                  <Chrome className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />

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
                    clearStoredData()
                    startExtraction()
                  }}
                  disabled={!url || isPolling}
                  className='whitespace-nowrap'
                >
                  {isPolling ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Extracting...
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

              {/* Component type filter */}
              <div>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex items-center gap-2 mb-2'
                  onClick={() => {
                    // Toggle all vs none
                    if (selectedTypes.length > 0) {
                      setSelectedTypes([])
                    } else {
                      setSelectedTypes(COMPONENT_TYPES.map((t) => t.id))
                    }
                  }}
                >
                  <Filter className='h-4 w-4' />
                  {selectedTypes.length > 0
                    ? 'Clear Filters'
                    : 'Filter Component Types'}
                </Button>

                {selectedTypes.length > 0 && (
                  <div className='grid grid-cols-2 md-grid-cols-4 gap-2 mt-2'>
                    {COMPONENT_TYPES.map((type) => (
                      <div
                        key={type.id}
                        className='flex items-center space-x-2'
                      >
                        <Checkbox
                          id={`filter-${type.id}`}
                          checked={selectedTypes.includes(type.id)}
                          onCheckedChange={() => toggleComponentType(type.id)}
                        />
                        <Label htmlFor={`filter-${type.id}`}>
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Extraction status */}
            {(isPolling ||
              extractionData?.status === 'pending' ||
              extractionData?.status === 'processing') && (
              <div className='my-4'>
                <div className='flex justify-between text-sm mb-1'>
                  <span>
                    {extractionData?.message || 'Extracting components...'}
                    {extractionStartTime.current
                      ? ` (${elapsedTime}s elapsed)`
                      : ''}
                  </span>
                  <span>{extractionData?.progress || 0}%</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2.5'>
                  <div
                    className='bg-periwinkle h-2.5 rounded-full transition-all duration-300'
                    style={{ width: `${extractionData?.progress || 0}%` }}
                  ></div>
                </div>
                {elapsedTime > 30 && (
                  <div className='mt-2 text-xs text-red-500'>
                    Extraction is taking longer than expected. You can try
                    refreshing the page if it doesn't complete soon.
                  </div>
                )}
              </div>
            )}

            {/* Error display */}
            {extractionData?.error && (
              <Alert className='mt-4'>
                <AlertDescription>{extractionData.error}</AlertDescription>
              </Alert>
            )}

            {/* Manual check button when things seem stuck */}
            {isPolling && elapsedTime > 20 && (
              <div className='mt-4'>
                <Button onClick={checkStatus} variant='outline' size='sm'>
                  Check Status Manually
                </Button>
              </div>
            )}

            {/* Navigation buttons to other pages */}
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

            {/* Show extracted components */}
            {extractionData?.components &&
            extractionData.components.length > 0 ? (
              <div className='mt-4'>
                <div className='space-y-4'>
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
